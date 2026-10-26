"""Recorte para preguntas que solo miran a Guido (nació con la tanda de hábitos, oct 2026).

Toma los condensados de `condensar.py` y deja, de cada chat principal:
- los mensajes de Guido enteros (los `[comando /x]` incluidos);
- la primera línea de la primera respuesta de Claude después de cada uno;
- los mensajes entre sesiones, según el modo (abajo).
Saltea los subagentes (su "usuario" es el agente padre, no Guido) y los avisos automáticos de
tareas en segundo plano. Después arma lotes de hasta `--tope-kb`, agrupados por proyecto.

Dos modos (`--modo`, agregado el 2026-10-26 para la lectura de contraste):
- `habitos` (default, el de la tanda de hábitos): de los mensajes entre sesiones queda solo la marca.
- `contraste`: los `### DE <x> (mensaje entre sesiones)` (director↔obrero, la mesa) quedan ENTEROS
  (o hasta `--bytes-mensaje` bytes cada uno, para ahorrar: un ENCARGO largo pesa 2-10 KB en pocas líneas,
  por eso el tope es en bytes y no en líneas);
  los `(respuesta de tarea entre sesiones)` (informes que vuelven de un subagente o de otra sesión)
  quedan con sus primeras `--lineas-respuesta` líneas con texto; y dentro de las respuestas de Claude
  se conservan las marcas `[SendMessage → x]`, `[Agent …]`, `[Skill x]` y `[AskUserQuestion]`
  (para contar quién le habló a quién y cuántos obreros a la vez), sin ninguna otra línea de herramienta.

Escribe SIEMPRE fuera del repo, como condensar.py.

Uso: python -I recortar.py --origen D:\\vibe-research\\clientes\\habitos [--tope-kb 90] [--modo contraste]
  lee <origen>\\condensados, escribe <origen>\\recortados y <origen>\\lotes\\L<n>.txt
"""
import argparse
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")

MARCAS_CONTRASTE = ("  [SendMessage →", "  [Agent", "  [Skill", "  [AskUserQuestion")


def _es_corte(l):
    """Una línea que termina un bloque de texto (de Guido o de otra sesión)."""
    return l.startswith("### ") or l.startswith("**CLAUDE**") or l.startswith("  [") or l.startswith("  ↳")


def recortar(lineas, modo="habitos", lineas_respuesta=5, bytes_mensaje=0):
    """Devuelve (lineas_recortadas, mensajes_de_guido, mensajes_entre_sesiones)."""
    out = lineas[:3]
    i, n_guido, n_entre = 3, 0, 0
    while i < len(lineas):
        l = lineas[i]
        if l.startswith("### GUIDO") and i + 1 < len(lineas) and lineas[i + 1].startswith("[notificación de tarea"):
            i += 2  # aviso automático, no lo escribió Guido
            continue
        if l.startswith("### GUIDO"):
            n_guido += 1
            out += ["", l]
            i += 1
            while i < len(lineas) and not _es_corte(lineas[i]):
                out.append(lineas[i])
                i += 1
            # primera línea de texto de la primera respuesta de Claude que siga (y, en modo contraste,
            # las marcas de SendMessage / Agent / Skill / AskUserQuestion de toda la respuesta)
            while i < len(lineas) and not lineas[i].startswith("### "):
                if lineas[i].startswith("**CLAUDE**"):
                    j = i + 1
                    while j < len(lineas) and not lineas[j].strip():
                        j += 1
                    if j < len(lineas):
                        out.append("> CLAUDE: " + lineas[j].strip()[:300])
                    if modo != "contraste":
                        break
                elif modo == "contraste" and lineas[i].startswith(MARCAS_CONTRASTE):
                    out.append(lineas[i])
                i += 1
            continue
        if l.startswith("### DE "):
            n_entre += 1
            entero = "(mensaje entre sesiones)" in l
            if modo != "contraste":
                out += ["", l + " [cuerpo omitido]"]
                i += 1
                continue
            out += ["", l]
            i += 1
            # entero: todo el cuerpo (o hasta `bytes_mensaje`, cortando en fin de línea);
            # respuesta de tarea: las primeras `lineas_respuesta` líneas con texto.
            con_texto = usados = omitidos = 0
            while i < len(lineas) and not _es_corte(lineas[i]):
                l2 = lineas[i]
                b = len(l2.encode("utf-8")) + 1
                if entero:
                    if not bytes_mensaje or usados + b <= bytes_mensaje:
                        out.append(l2)
                        usados += b
                    else:
                        omitidos += b
                elif l2.strip():
                    if con_texto < lineas_respuesta:
                        out.append(l2)
                    else:
                        omitidos += b
                    con_texto += 1
                elif con_texto < lineas_respuesta:
                    out.append(l2)
                i += 1
            if omitidos:
                out.append(f"  […{omitidos // 1024 + 1} KB más de este mensaje, omitidos]")
            continue
        if modo == "contraste" and l.startswith(MARCAS_CONTRASTE):
            out.append(l)  # marcas fuera de una respuesta a Guido (p. ej., después de un mensaje entre sesiones)
        i += 1
    return out, n_guido, n_entre


def repo_que_contiene(ruta):
    p = os.path.abspath(ruta)
    while True:
        if os.path.isdir(os.path.join(p, ".git")):
            return p
        padre = os.path.dirname(p)
        if padre == p:
            return None
        p = padre


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--origen", required=True, help="la carpeta de trabajo de condensar.py (la --salida)")
    ap.add_argument("--tope-kb", type=int, default=90)
    ap.add_argument("--modo", choices=["habitos", "contraste"], default="habitos")
    ap.add_argument("--lineas-respuesta", type=int, default=5,
                    help="modo contraste: cuántas líneas con texto se conservan de cada respuesta de tarea entre sesiones")
    ap.add_argument("--bytes-mensaje", type=int, default=0,
                    help="modo contraste: tope en bytes por mensaje entre sesiones (0 = entero, el default)")
    a = ap.parse_args()

    origen = os.path.abspath(a.origen)
    if repo_que_contiene(origen):
        sys.exit("La carpeta de trabajo no puede estar dentro de un repo git.")
    cond, dest = os.path.join(origen, "condensados"), os.path.join(origen, "recortados")
    hechos = []  # (proyecto, ruta, bytes)
    msgs = entre = 0
    for proyecto in sorted(os.listdir(cond)):
        for nombre in sorted(os.listdir(os.path.join(cond, proyecto))):
            if "__sub-" in nombre:
                continue
            lineas = open(os.path.join(cond, proyecto, nombre), encoding="utf-8").read().split("\n")
            out, n, ne = recortar(lineas, a.modo, a.lineas_respuesta, a.bytes_mensaje)
            if n == 0:
                continue
            cuerpo = "\n".join(out).strip() + "\n"
            ruta = os.path.join(dest, proyecto, nombre)
            os.makedirs(os.path.dirname(ruta), exist_ok=True)
            open(ruta, "w", encoding="utf-8").write(cuerpo)
            hechos.append((proyecto, ruta, len(cuerpo.encode("utf-8"))))
            msgs += n
            entre += ne

    # Lotes: en orden de proyecto, cortando al pasar el tope (un chat nunca se parte).
    lotes, actual, kb = [], [], 0
    for _, ruta, b in hechos:
        if actual and kb + b / 1024 > a.tope_kb:
            lotes.append(actual)
            actual, kb = [], 0
        actual.append(ruta)
        kb += b / 1024
    if actual:
        lotes.append(actual)
    os.makedirs(os.path.join(origen, "lotes"), exist_ok=True)
    for n, lote in enumerate(lotes, 1):
        open(os.path.join(origen, "lotes", f"L{n}.txt"), "w", encoding="utf-8").write("\n".join(lote) + "\n")

    total = sum(b for *_, b in hechos)
    tokens = total // 4 // 1000
    # Dos cotas (las dos medidas en octubre, ninguna exacta): el piso de ~120 k por lector Sonnet con lotes de 90 KB
    # (tanda de hábitos, PC Usuario), y la fórmula de METODO (gasto real ≈ 3× el contenido) más ~60 k fijos por
    # lector (LECTOR + ya-sabido + la respuesta). Con lotes grandes manda la segunda; con lotes chicos, la primera.
    piso, formula = len(lotes) * 120, tokens * 3 + len(lotes) * 60
    print(f"Modo: {a.modo} · chats: {len(hechos)} · mensajes de Guido: {msgs} · entre sesiones: {entre}"
          f" · {total / 1024:.0f} KB (~{tokens} k tokens)")
    print(f"Lotes: {len(lotes)} de hasta {a.tope_kb} KB")
    print(f"Presupuesto de los lectores: entre ~{min(piso, formula) / 1000:.1f} M y ~{max(piso, formula) / 1000:.1f} M tokens"
          f" (piso de 120 k por lector · 3× el contenido + 60 k por lector); la síntesis Opus va aparte (~1-1,5 M)")


if __name__ == "__main__":
    main()
