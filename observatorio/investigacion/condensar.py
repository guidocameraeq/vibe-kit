"""Etapa 0 de la investigación de los chats (docs/SPEC-investigacion-chats.md).

Condensa los transcripts de Claude Code de ESTA PC:
- deja los mensajes de Guido, el texto de Claude y el nombre de cada herramienta (no su salida);
- enmascara secretos ANTES de escribir nada a disco;
- saca el costo real por chat, rol y modelo (campo `usage`, agrupado por message.id).

Escribe SIEMPRE fuera del repo (por defecto D:\\vibe-research\\<pc>\\). No toca ~/.claude.

Secretos reales conocidos (control positivo del criterio 2): nunca por argumento ni en el chat.
- `--pedir-secretos`: los pide por teclado sin eco (no quedan en el historial de la consola), o
- variable de entorno VR_SECRETOS, separados por `;;` o salto de línea.
El script solo informa "secreto #n: tapado k veces"; jamás imprime ni escribe el valor.

Uso:
  python condensar.py --pc clientes [--solo RUTA.jsonl ...] [--pedir-secretos]
  python condensar.py --pc clientes --verificar      (re-escanea lo ya condensado)
  python condensar.py --pc clientes --donde-estan --pedir-secretos   (control positivo: dónde
      aparece cada secreto real en los chats CRUDOS, solo conteos)
"""
import argparse
import collections
import csv
import getpass
import glob
import json
import math
import os
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")

RAIZ = os.path.join(os.path.expanduser("~"), ".claude", "projects")
MASK = "[ENMASCARADO]"

# --- Enmascarado -----------------------------------------------------------------------------

FORMAS = [
    r"-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----",
    r"eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{4,}",  # JWT
    r"sb_(?:secret|publishable)_[A-Za-z0-9_-]{10,}",
    r"sbp_[A-Za-z0-9]{20,}",
    r"sk-ant-[A-Za-z0-9_-]{10,}",
    r"\bsk-[A-Za-z0-9_-]{16,}",
    r"\bghp_[A-Za-z0-9]{20,}", r"\bgho_[A-Za-z0-9]{20,}", r"github_pat_[A-Za-z0-9_]{20,}",
    r"\bAIza[A-Za-z0-9_-]{30,}",
    r"\bAKIA[A-Z0-9]{16}\b",
    r"\bre_[A-Za-z0-9_]{16,}",
    r"APP_USR-[A-Za-z0-9-]{10,}",
    r"(?i)(Authorization: Bearer )[^\s\"'`]+",
    r"(?i)(Bearer )[A-Za-z0-9._~+/=-]{16,}",
    r"(?i)(PGPASSWORD=)[^\s\"'`]+",
    r"(://)[^/\s:@\"'`]+:[^/\s@\"'`]+(?=@)",  # usuario:clave@ en URLs
    r"(?i)([?&]apikey=)[^&\s\"'`]+",
    r"(?i)([?&](?:key|token|access_token|secret)=)[^&\s\"'`]+",
]
FORMAS = [re.compile(p) for p in FORMAS]

NOMBRE_SENSIBLE = r"[A-Za-z0-9_.-]*(?:PASS|PWD|SECRET|TOKEN|KEY|CREDENTIAL|CLAVE|CONTRASE)[A-Za-z0-9_.-]*"
# NOMBRE=valor  /  NOMBRE: valor  /  "nombre": "valor"
GENERICA = [
    re.compile(r"(?i)(\b" + NOMBRE_SENSIBLE + r"\s*=\s*)([\"']?)([^\s\"'`;,]{4,})"),
    re.compile(r"(?i)([\"']" + NOMBRE_SENSIBLE + r"[\"']\s*:\s*[\"'])([^\"']{4,})([\"'])"),
    # "API: valor" / "apikey: valor" / "keys: `valor`" en prosa o headers (lo encontró gitleaks)
    re.compile(r"(?i)(\b(?:api|apikey|api[_-]?key|keys?|" + NOMBRE_SENSIBLE + r")\s*:\s*[`'\"]?)([A-Za-z0-9_\-]{12,})"),
]

TOKEN_LARGO = re.compile(r"[A-Za-z0-9+/_=.-]{24,}")


def entropia(s):
    c = collections.Counter(s)
    return -sum(v / len(s) * math.log2(v / len(s)) for v in c.values())


def es_alta_entropia(t):
    # Mezcla de mayúscula + minúscula + dígito y entropía alta. Deja pasar UUIDs, SHAs hex y rutas.
    if "/" in t and t.count("/") > 2:
        return False
    if not (re.search(r"[a-z]", t) and re.search(r"[A-Z]", t) and re.search(r"\d", t)):
        return False
    return entropia(t) > 4.3


class Enmascarador:
    def __init__(self, reales):
        self.reales = [s for s in reales if len(s) >= 4]
        self.tapados_reales = collections.Counter()
        self.conteo = collections.Counter()

    def __call__(self, texto):
        if not texto:
            return texto
        for i, s in enumerate(self.reales, 1):
            if s in texto:
                self.tapados_reales[i] += texto.count(s)
                texto = texto.replace(s, MASK)
        for p in FORMAS:
            texto, n = p.subn(lambda m: (m.group(1) if p.groups else "") + MASK, texto)
            self.conteo["forma"] += n
        texto, n = GENERICA[0].subn(lambda m: m.group(1) + m.group(2) + MASK, texto)
        self.conteo["generica"] += n
        texto, n = GENERICA[1].subn(lambda m: m.group(1) + MASK + m.group(3), texto)
        self.conteo["generica"] += n
        texto, n = GENERICA[2].subn(lambda m: m.group(1) + MASK, texto)
        self.conteo["generica"] += n

        def ent(m):
            t = m.group(0)
            if MASK in t or not es_alta_entropia(t):
                return t
            self.conteo["entropia"] += 1
            return MASK
        return TOKEN_LARGO.sub(ent, texto)


# --- Lectura de un transcript ----------------------------------------------------------------

ETIQUETAS_PROHIBIDAS = ("<bash-stdout>", "<bash-stderr>", "<local-command-stdout>", "<system-reminder>")
RUIDO_DE_COMANDO = re.compile(r"<(local-command-caveat|command-message)>[\s\S]*?</\1>")
CMD_NOMBRE = re.compile(r"<command-name>([\s\S]*?)</command-name>")
CMD_ARGS = re.compile(r"<command-args>([\s\S]*?)</command-args>")
BASH_INPUT = re.compile(r"<bash-input>([\s\S]*?)</bash-input>")
TASK_NOTIF = re.compile(r"<task-notification>")


def texto_de_guido(contenido):
    """Devuelve el texto de un mensaje de Guido, o None si la línea no es de Guido.

    Se define por TIPO DE BLOQUE: solo texto, nunca tool_result (que viaja con rol user)."""
    if isinstance(contenido, str):
        partes = [contenido]
    elif isinstance(contenido, list):
        if any(isinstance(b, dict) and b.get("type") == "tool_result" for b in contenido):
            return None
        partes = [b.get("text", "") for b in contenido if isinstance(b, dict) and b.get("type") == "text"]
        if not partes:
            return None
    else:
        return None
    t = "\n".join(partes)
    if any(e in t for e in ETIQUETAS_PROHIBIDAS):
        return None
    if TASK_NOTIF.search(t):
        return "[notificación de tarea en segundo plano]"
    b = BASH_INPUT.search(t)
    if b:
        return "[Guido corrió en la consola: !" + b.group(1).strip()[:200] + "]"
    n = CMD_NOMBRE.search(t)
    if n:
        a = CMD_ARGS.search(t)
        args = (a.group(1).strip() if a else "")
        return "[comando " + n.group(1).strip() + "]" + (" " + args if args else "")
    t = RUIDO_DE_COMANDO.sub("", t).strip()
    return t or None


def kb(x):
    n = len(json.dumps(x, ensure_ascii=False)) if not isinstance(x, str) else len(x)
    return f"{n / 1024:.0f} KB" if n >= 1024 else f"{n} B"


def describir_herramienta(b):
    nombre = b.get("name", "?")
    inp = b.get("input") or {}
    extra = ""
    if nombre == "Skill":
        extra = f" {inp.get('skill', '')}"
    elif nombre in ("Agent", "Task"):
        extra = f" {inp.get('subagent_type', '')} {inp.get('model', '')} — {inp.get('description', '')}"
    elif nombre == "Bash" or nombre == "PowerShell":
        extra = f" — {inp.get('description', '')}" if inp.get("description") else ""
    elif nombre in ("Read", "Write", "Edit"):
        extra = f" {os.path.basename(str(inp.get('file_path', '')))}"
    elif nombre == "SendMessage":
        cuerpo = inp.get("message") or inp.get("content") or ""
        return f"[SendMessage → {inp.get('to', '?')}]\n    " + str(cuerpo).strip().replace("\n", "\n    ")
    elif nombre == "Workflow":
        extra = " (workflow)"
    return f"[{nombre}{extra}]".replace("  ", " ")


def rol_de(titulo):
    if not titulo:
        return "sin rol"
    t = titulo.lower()
    for r in ("director", "obrero", "spec", "release"):
        if r in t:
            return r
    return "otro"


def condensar(ruta, enm, es_sub=False, desde=""):
    """Devuelve (lineas_condensadas, filas_de_costo, meta).

    `desde` (ISO UTC, ej. "2026-10-12T21:59"): se saltea todo mensaje anterior — el corte de la
    investigación previa. Vale también para el costo."""
    lineas = []
    usos = {}  # message.id -> (modelo, usage)  — la ÚLTIMA línea gana
    nombres_tool = {}
    titulo = None
    ts_ini = ts_fin = None
    cwd = None
    for raw in open(ruta, encoding="utf-8", errors="replace"):
        try:
            o = json.loads(raw)
        except json.JSONDecodeError:
            continue
        tipo = o.get("type")
        if tipo == "custom-title":
            titulo = o.get("customTitle") or titulo
            continue
        if tipo not in ("user", "assistant"):
            continue  # attachment, queue-operation, file-history-*, system, etc.
        ts = o.get("timestamp")
        if desde and (not ts or ts < desde):
            continue
        if ts:
            ts_ini = ts_ini or ts
            ts_fin = ts
        origen = o.get("origin") if isinstance(o.get("origin"), dict) else {}
        if origen.get("kind") == "peer":
            # Mensaje de OTRA sesión (la Mesa entre directores / director↔obrero). Viene isMeta,
            # pero es materia prima de Q6: se conserva con su rótulo, nunca como "GUIDO".
            cuerpo = origen.get("body") if isinstance(origen.get("body"), str) else ""
            de = origen.get("name") or "otra sesión"
            tipo_msg = "respuesta de tarea" if "handback" in origen else "mensaje"
            lineas.append(f"\n### DE {de} ({tipo_msg} entre sesiones) · {(ts or '')[:16].replace('T', ' ')}"
                          f"\n{enm(cuerpo.strip())}")
            continue
        if o.get("isMeta"):
            continue
        cwd = cwd or o.get("cwd")
        msg = o.get("message") or {}
        cont = msg.get("content")
        hora = (ts or "")[:16].replace("T", " ")
        if tipo == "user":
            if isinstance(cont, list):
                for b in cont:
                    if isinstance(b, dict) and b.get("type") == "tool_result":
                        n = nombres_tool.get(b.get("tool_use_id"), "herramienta")
                        lineas.append(f"  ↳ [{n}: {kb(b.get('content', ''))}]")
            t = texto_de_guido(cont)
            if t is not None:
                quien = "ENCARGO DEL AGENTE PADRE" if es_sub else "GUIDO"
                lineas.append(f"\n### {quien} · {hora}\n{enm(t)}")
        else:
            mid = msg.get("id")
            if mid and msg.get("usage"):
                usos[mid] = (msg.get("model") or "?", msg["usage"])
            if not isinstance(cont, list):
                continue
            for b in cont:
                if not isinstance(b, dict):
                    continue
                if b.get("type") == "text" and b.get("text", "").strip():
                    lineas.append(f"\n**CLAUDE** · {hora}\n{enm(b['text'].strip())}")
                elif b.get("type") == "tool_use":
                    nombres_tool[b.get("id")] = b.get("name", "?")
                    lineas.append("  " + enm(describir_herramienta(b)))
                # thinking: fuera (es volumen, y puede repetir secretos)
    por_modelo = collections.defaultdict(lambda: collections.Counter())
    for modelo, u in usos.values():
        c = por_modelo[modelo]
        c["respuestas"] += 1
        for k in ("input_tokens", "cache_creation_input_tokens", "cache_read_input_tokens", "output_tokens"):
            c[k] += int(u.get(k) or 0)
    return lineas, por_modelo, {"titulo": titulo, "ts_ini": ts_ini, "ts_fin": ts_fin, "cwd": cwd}


# --- Recorrido -------------------------------------------------------------------------------

def transcripts(solo):
    if solo:
        return [os.path.abspath(s) for s in solo]
    principales = glob.glob(os.path.join(RAIZ, "*", "*.jsonl"))
    subs = glob.glob(os.path.join(RAIZ, "*", "*", "subagents", "*.jsonl"))
    return sorted(principales) + sorted(subs)


def describir_ruta(ruta):
    """(proyecto, sesion, es_subagente, agentType, carpeta_sesion)."""
    partes = os.path.normpath(ruta).split(os.sep)
    if "subagents" in partes:
        i = partes.index("subagents")
        proyecto, sesion = partes[i - 2], partes[i - 1]
        meta = ruta[:-len(".jsonl")] + ".meta.json"
        tipo = "?"
        if os.path.exists(meta):
            try:
                tipo = json.load(open(meta, encoding="utf-8")).get("agentType", "?")
            except Exception:
                pass
        return proyecto, sesion, True, tipo, os.sep.join(partes[:i])
    proyecto = partes[-2]
    sesion = os.path.basename(ruta)[:-len(".jsonl")]
    return proyecto, sesion, False, "", os.path.join(os.path.dirname(ruta), sesion)


def titulo_de_carpeta(carpeta):
    f = os.path.join(carpeta, "custom-title.json")
    if os.path.exists(f):
        try:
            return json.load(open(f, encoding="utf-8")).get("customTitle")
        except Exception:
            return None
    return None


def raiz_de_trabajo():
    """D:\\vibe-research si hay disco D; si no, C:\\vibe-research (la otra PC no tiene D)."""
    return os.path.join("D:\\" if os.path.isdir("D:\\") else "C:\\", "vibe-research")


def repo_que_contiene(ruta):
    p = os.path.abspath(ruta)
    while True:
        if os.path.isdir(os.path.join(p, ".git")):
            return p
        padre = os.path.dirname(p)
        if padre == p:
            return None
        p = padre


def leer_secretos(pedir):
    crudo = os.environ.get("VR_SECRETOS", "")
    if pedir:
        print("Pegá cada secreto real y Enter (no se ve). Enter vacío para terminar.")
        lista = []
        while True:
            s = getpass.getpass(f"secreto #{len(lista) + 1}: ")
            if not s:
                break
            lista.append(s.strip())
        return lista
    return [s.strip() for s in re.split(r";;|\n", crudo) if s.strip()]


def contar_prohibidos(texto):
    return {
        "tool_result": texto.count('"tool_result"') + texto.count("'tool_result'"),
        **{e: texto.count(e) for e in ETIQUETAS_PROHIBIDAS},
    }


def verificar(salida, reales):
    """Re-escanea lo condensado: criterio 1 (etiquetas) + criterio 2 (secretos reales)."""
    prohibidos = collections.Counter()
    reales_vistos = collections.Counter()
    for f in glob.glob(os.path.join(salida, "condensados", "**", "*.md"), recursive=True):
        t = open(f, encoding="utf-8").read()
        prohibidos.update(contar_prohibidos(t))
        for i, s in enumerate(reales, 1):
            if s in t:
                reales_vistos[i] += t.count(s)
    print("Criterio 1 — bloques/etiquetas prohibidos en el condensado:", dict(prohibidos) or "0")
    print("Criterio 2 — secretos reales que SIGUEN visibles:",
          dict(reales_vistos) if reales_vistos else f"0 (de {len(reales)} secretos dados)")
    return sum(prohibidos.values()) == 0 and not reales_vistos


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pc", required=True)
    ap.add_argument("--salida", default=None, help="por defecto D:\\vibe-research\\<pc>")
    ap.add_argument("--solo", nargs="*", help="solo estos .jsonl (la prueba de 3 chats)")
    ap.add_argument("--pedir-secretos", action="store_true")
    ap.add_argument("--excluir", nargs="*", default=[],
                    help="ids de sesión a saltear (la sesión de la investigación misma: se cita a sí misma)")
    ap.add_argument("--desde", default="",
                    help='solo mensajes desde esta fecha/hora UTC (el corte anterior), ej. "2026-10-12T21:59"')
    ap.add_argument("--verificar", action="store_true")
    ap.add_argument("--donde-estan", action="store_true",
                    help="lista en qué transcripts CRUDOS aparece cada secreto real (solo conteos)")
    a = ap.parse_args()

    salida = os.path.abspath(a.salida or os.path.join(raiz_de_trabajo(), a.pc))
    repo = repo_que_contiene(salida)
    if repo:
        sys.exit(f"La salida no puede estar dentro de un repo git ({repo}): los condensados no viajan por git.")
    reales = leer_secretos(a.pedir_secretos)

    if a.donde_estan:
        for ruta in transcripts(a.solo):
            t = open(ruta, encoding="utf-8", errors="replace").read()
            hits = {f"#{i}": t.count(s) for i, s in enumerate(reales, 1) if s in t}
            if hits:
                print(os.path.relpath(ruta, RAIZ), hits)
        print(f"(revisados contra {len(reales)} secretos)")
        sys.exit(0)

    if a.verificar:
        sys.exit(0 if verificar(salida, reales) else 1)

    os.makedirs(os.path.join(salida, "condensados"), exist_ok=True)
    enm = Enmascarador(reales)
    filas = []
    total_crudo = total_cond = 0
    for ruta in transcripts(a.solo):
        proyecto, sesion, es_sub, agente, carpeta = describir_ruta(ruta)
        if sesion in a.excluir:
            continue
        lineas, por_modelo, meta = condensar(ruta, enm, es_sub, a.desde)
        if a.desde and meta["ts_ini"] is None:
            continue  # chat entero anterior al corte
        titulo = titulo_de_carpeta(carpeta) or meta["titulo"]
        nombre = sesion + (f"__sub-{os.path.basename(ruta)[:-6]}" if es_sub else "")
        destino = os.path.join(salida, "condensados", proyecto, nombre + ".md")
        os.makedirs(os.path.dirname(destino), exist_ok=True)
        encabezado = (f"# {proyecto} · {sesion}\n- rol: {rol_de(titulo)} ({titulo or '-'})"
                      f"{' · subagente ' + agente if es_sub else ''}\n"
                      f"- desde {meta['ts_ini']} hasta {meta['ts_fin']}\n")
        cuerpo = encabezado + "\n".join(lineas) + "\n"
        with open(destino, "w", encoding="utf-8") as f:
            f.write(cuerpo)
        crudo = os.path.getsize(ruta)
        cond = len(cuerpo.encode("utf-8"))
        total_crudo += crudo
        total_cond += cond
        for modelo, c in (por_modelo.items() or [("(sin respuestas)", collections.Counter())]):
            filas.append({
                "pc": a.pc, "proyecto": proyecto, "sesion": sesion, "transcript": nombre,
                "tipo": "subagente" if es_sub else "principal",
                "rol": "subagente" if es_sub else rol_de(titulo), "agentType": agente,
                "modelo": modelo, "desde": meta["ts_ini"], "hasta": meta["ts_fin"],
                "respuestas": c["respuestas"], "input": c["input_tokens"],
                "cache_creation": c["cache_creation_input_tokens"],
                "cache_read": c["cache_read_input_tokens"], "output": c["output_tokens"],
                "kb_crudo": crudo // 1024, "kb_condensado": cond // 1024,
            })

    with open(os.path.join(salida, "costos.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(filas[0].keys()))
        w.writeheader()
        w.writerows(filas)

    print(f"Transcripts: {len({(f['proyecto'], f['sesion'], f['tipo'], f['agentType'], f['kb_crudo']) for f in filas})}")
    print(f"Crudo: {total_crudo / 2**20:.1f} MB  →  condensado: {total_cond / 2**20:.1f} MB "
          f"(~{total_cond // 4 // 1000:,} k tokens)")
    print("Enmascarados:", dict(enm.conteo))
    print("Secretos reales tapados:",
          {f"#{i}": n for i, n in enm.tapados_reales.items()} or f"0 (de {len(reales)} dados)")
    ok = verificar(salida, reales)
    print("OK" if ok else "FALLA — no seguir")


if __name__ == "__main__":
    main()
