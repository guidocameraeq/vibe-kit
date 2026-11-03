"""Inventario de la flota: por cada repo de GitHub de los dueños dados, qué trae del método (v2 y v3).
Lee metadatos y archivos chicos vía `gh api` (rama por defecto, sin clonar: anda desde cualquier PC y ve
los repos que no están acá). La ficha `.claude/kit.md` la parsea el parser del kit (`ficha.cjs`, por node):
nunca uno en Python. El observatorio MIDE: no escribe en ningún repo.

Uso:
  py -3 -I flota.py <dueño> [<dueño> ...] [--kit <raíz de vibe-kit>] [--hook <alias>=<clon> ...] > flota.json
  py -3 -I flota.py --carpeta <dir>      # solo frases_viejas y rutas_absolutas sobre una carpeta local (el molde)

--hook corre el SessionStart del settings.json de un CLON TEMPORAL (jamás el checkout de nadie) con stdin {}
y cuenta los caracteres de la salida (hook_chars). Plazo por defecto: 20 s (--hook-plazo).
rutas_absolutas guarda archivo y renglón, NUNCA el texto (la ruta lleva el usuario de la PC)."""
import argparse, base64, json, os, re, signal, subprocess, sys, tempfile

AQUI = os.path.dirname(os.path.abspath(__file__))
KIT_POR_DEFECTO = os.path.dirname(os.path.dirname(AQUI))
FRASES_POR_DEFECTO = os.path.join(AQUI, "frases-viejas.txt")
FICHA_CJS = os.path.join("kit", "skills", "arquitecto", "scripts", "lib", "ficha.cjs")

DEL_KIT = {"arquitecto", "arquitecto-skills", "docs-fyd", "relevamiento"}
# Skills que trae el molde (v2: inicio y cierre; v3: las siete): no cuentan como "propias".
UNIVERSALES = {"inicio", "cierre", "estado", "nucleo", "director", "obrero", "tramo"}
HOOK_TOPE = 10_000
HOOK_PLAZO = 20.0
EXT_TEXTO = (".md", ".txt", ".json", ".cjs", ".js", ".mjs", ".py", ".sh", ".ps1", ".yml", ".yaml", ".toml")
MAX_ARCHIVO = 300_000

RE_RUTA = re.compile(r"(?<![A-Za-z0-9])[A-Za-z]:[\\/]|(?<![\w.:~-])(?:/[A-Za-z]/Users/|/Users/|/home/)")
RE_SELLO = re.compile(r"arquitecto:\s*\d{4}-\d{2}-\d{2}[^\n]*hash\s+[0-9a-f]{12}")
RE_NORTE = re.compile(r"(?:\./)?docs/NORTE\.md")


# ------------------------------------------------------------------ gh y node (inyectables)

def gh_real(args, raw=False):
    r = subprocess.run(["gh", "api", *args], capture_output=True, text=True, encoding="utf-8")
    if r.returncode != 0:
        return None
    return r.stdout if raw else json.loads(r.stdout or "null")


def node_real(args):
    """-> (código, stdout, stderr). 127 si node no está."""
    try:
        r = subprocess.run(["node", *args], capture_output=True, text=True, encoding="utf-8", timeout=30)
    except FileNotFoundError:
        return 127, "", "node no está instalado"
    except subprocess.TimeoutExpired:
        return 124, "", "node tardó demasiado"
    return r.returncode, r.stdout, r.stderr


def repos(owners):
    out = []
    for o in owners:
        r = subprocess.run(["gh", "repo", "list", o, "--limit", "100", "--json",
                            "name,isPrivate,pushedAt,createdAt,defaultBranchRef,isFork,diskUsage"],
                           capture_output=True, text=True, encoding="utf-8")
        if r.returncode != 0:
            sys.stderr.write(f"gh repo list {o} falló: corré gh auth status\n")
            sys.exit(2)
        for x in json.loads(r.stdout or "[]"):
            x["owner"] = o
            out.append(x)
    return out


# ------------------------------------------------------------------ lectura por gh

def file_text(gh, full, path, ref):
    d = gh([f"repos/{full}/contents/{path}?ref={ref}"])
    if not d or "content" not in d:
        return None
    return base64.b64decode(d["content"]).decode("utf-8", "replace")


def commit_count(gh, full, ref):
    out = gh(["-i", f"repos/{full}/commits?sha={ref}&per_page=1"], raw=True)
    if out is None:
        return None
    m = re.search(r'page=(\d+)>; rel="last"', out)
    return int(m.group(1)) if m else 1


def first_commit_date(gh, full, ref, n):
    if not n:
        return None
    d = gh([f"repos/{full}/commits?sha={ref}&per_page=1&page={n}"])
    return d[0]["commit"]["committer"]["date"][:10] if d else None


def authors(gh, full):
    d = gh([f"repos/{full}/contributors?anon=1&per_page=100"])
    return len(d) if isinstance(d, list) else None


# ------------------------------------------------------------------ frases viejas y rutas absolutas

def cargar_frases(path=FRASES_POR_DEFECTO):
    """`frase<TAB># fuente`. Sin fuente no entra."""
    frases = []
    with open(path, encoding="utf-8") as f:
        for linea in f:
            linea = linea.rstrip("\n")
            if not linea.strip() or linea.lstrip().startswith("#") or "\t" not in linea:
                continue
            frase, _, fuente = linea.partition("\t")
            if frase.strip() and fuente.strip().lstrip("#").strip():
                frases.append(frase.strip())
    return frases


def medir_textos(textos, frases):
    """textos: {archivo: (texto, cuenta_rutas)} -> columnas. `archivo` = ruta relativa; nunca se guarda texto.
    frases_viejas = pares (frase, archivo); rutas_absolutas = renglones con ruta (con archivo y renglón)."""
    por_frase, rutas, archivos_ruta = {}, [], set()
    for archivo, (texto, con_rutas) in sorted(textos.items()):
        bajo = texto.casefold()
        for fr in frases:
            if fr.casefold() in bajo:
                por_frase[fr] = por_frase.get(fr, 0) + 1
        if con_rutas:
            for n, linea in enumerate(texto.splitlines(), 1):
                if RE_RUTA.search(linea):
                    rutas.append({"archivo": archivo, "renglon": n})
                    archivos_ruta.add(archivo)
    return {"frases_viejas": sum(por_frase.values()), "frases_viejas_por_frase": por_frase,
            "rutas_absolutas": len(rutas), "rutas_absolutas_archivos": len(archivos_ruta),
            "rutas_absolutas_en": rutas}


def leer(p):
    with open(p, encoding="utf-8", errors="replace") as f:
        return f.read()


def es_texto(path):
    # los *.test.* son pruebas del kit con rutas "malas" a propósito (fixtures): no son lo que lee Claude
    return path.lower().endswith(EXT_TEXTO) and ".test." not in os.path.basename(path).lower()


def medir_carpeta(carpeta, frases):
    """Sobre una carpeta local: `<dir>/skills/**` (o `<dir>/.claude/skills/**`) y `<dir>/CLAUDE.md`."""
    base = os.path.abspath(carpeta)
    raices = [os.path.join(base, "skills"), os.path.join(base, ".claude", "skills")]
    textos = {}
    for raiz in raices:
        for dp, _, fs in os.walk(raiz):
            for fn in fs:
                p = os.path.join(dp, fn)
                if es_texto(p) and os.path.getsize(p) <= MAX_ARCHIVO:
                    rel = os.path.relpath(p, base).replace(os.sep, "/")
                    textos[rel] = (leer(p), True)
    cm = os.path.join(base, "CLAUDE.md")
    if os.path.isfile(cm):
        textos["CLAUDE.md"] = (leer(cm), False)
    r = medir_textos(textos, frases)
    r["archivos_mirados"] = len(textos)
    return r


# ------------------------------------------------------------------ la ficha

def leer_ficha(texto, node, kit):
    """Parsea con ficha.cjs. -> columnas de la ficha. Si no parsea: ficha_error con el motivo, SIN el texto."""
    cjs = os.path.join(kit, FICHA_CJS)
    tmp = tempfile.NamedTemporaryFile("w", suffix=".md", delete=False, encoding="utf-8", newline="\n")
    try:
        tmp.write(texto)
        tmp.close()
        rc, out, err = node([cjs, "leer", tmp.name])
    finally:
        try:
            os.unlink(tmp.name)
        except OSError:
            pass
    if rc != 0:
        motivos = {1: "ficha malformada o inválida", 2: "parser mal llamado", 3: "no hay ficha",
                   127: "node no está", 124: "node tardó demasiado"}
        m = re.search(r"\.md:(\d+):", err or "") or re.search(r"línea (\d+)", err or "")
        motivo = motivos.get(rc, f"el parser falló (código {rc})")
        return {"kit": None, "ficha_error": motivo + (f", línea {m.group(1)}" if m else "")}
    try:
        f = json.loads(out)
    except ValueError:
        return {"kit": None, "ficha_error": "salida ilegible del parser"}
    piezas = {}
    for k, v in (f.get("piezas") or {}).items():
        piezas[k] = v.get("estado") if isinstance(v, dict) else v
    quitados = (f.get("frenos") or {}).get("quitados") or []
    return {"kit": f.get("kit"), "nivel": f.get("nivel"), "piezas": piezas,
            "frenos_quitados": len(quitados) if isinstance(quitados, list) else None}


# ------------------------------------------------------------------ la huella del hook

def _matar(p):
    try:
        if os.name == "nt":
            subprocess.run(["taskkill", "/F", "/T", "/PID", str(p.pid)], capture_output=True)
        else:
            os.killpg(p.pid, signal.SIGKILL)
    except Exception:
        p.kill()


def expandir_proyecto(cmd, clon):
    """Claude Code expande ${CLAUDE_PROJECT_DIR} y $CLAUDE_PROJECT_DIR; cmd.exe no. Las reemplaza por la ruta
    absoluta del clon, entre comillas si la original no estaba ya dentro de unas."""
    ruta = os.path.abspath(clon)

    def sub(m):
        adentro = cmd.count('"', 0, m.start()) % 2 == 1
        return ruta if adentro else '"' + ruta + '"'
    return re.sub(r"\$\{CLAUDE_PROJECT_DIR\}|\$CLAUDE_PROJECT_DIR\b", sub, cmd)


def expandir_arg(arg, clon):
    """Para un argumento suelto (sin shell): reemplaza las variables por la ruta del clon, sin comillas."""
    return re.sub(r"\$\{CLAUDE_PROJECT_DIR\}|\$CLAUDE_PROJECT_DIR\b", lambda m: os.path.abspath(clon), arg)


def huella_hook(clon, plazo=HOOK_PLAZO):
    """Corre el SessionStart del settings.json DEL CLON (cwd = clon, stdin {}). -> {hook_chars, hook_motivo}.
    Nunca toca otra cosa que la carpeta que le pasan."""
    sj = os.path.join(clon or "", ".claude", "settings.json")
    if not clon or not os.path.isfile(sj):
        return {"hook_chars": None, "hook_motivo": "sin clon o sin settings.json"}
    try:
        cfg = json.loads(leer(sj))
        cmds = [(h["command"], h.get("args")) for g in (cfg.get("hooks") or {}).get("SessionStart", [])
                for h in g.get("hooks", []) if h.get("command")]
    except Exception:
        return {"hook_chars": None, "hook_motivo": "settings.json ilegible"}
    if not cmds:
        return {"hook_chars": None, "hook_motivo": "sin hook SessionStart"}
    env = dict(os.environ, CLAUDE_PROJECT_DIR=os.path.abspath(clon))
    total = 0
    for cmd, args in cmds:
        with tempfile.TemporaryFile() as salida:
            kw = {"start_new_session": True} if os.name != "nt" else {}
            if args:
                orden = [expandir_arg(str(e), clon) for e in [cmd, *args]]
                shell = False
            else:
                orden, shell = expandir_proyecto(cmd, clon), True
            p = subprocess.Popen(orden, shell=shell, cwd=clon, env=env, stdin=subprocess.PIPE,
                                 stdout=salida, stderr=subprocess.DEVNULL, **kw)
            try:
                p.stdin.write(b"{}")
                p.stdin.close()
            except OSError:
                pass
            try:
                p.wait(timeout=plazo)
            except subprocess.TimeoutExpired:
                _matar(p)
                p.wait()
                return {"hook_chars": None, "hook_motivo": f"plazo de {plazo:g} s agotado"}
            if p.returncode != 0:
                return {"hook_chars": None, "hook_motivo": f"el hook salió con código {p.returncode}"}
            salida.seek(0)
            total += len(salida.read().decode("utf-8", "replace"))
    return {"hook_chars": total, "hook_motivo": None, "hook_pasado_del_tope": total > HOOK_TOPE}


# ------------------------------------------------------------------ el escaneo de un repo

def scan(x, gh=gh_real, node=node_real, kit=KIT_POR_DEFECTO, frases=()):
    full = f'{x["owner"]}/{x["name"]}'
    ref = (x.get("defaultBranchRef") or {}).get("name") or "main"
    t = gh([f"repos/{full}/git/trees/{ref}?recursive=1"])
    paths = {e["path"]: e.get("size", 0) for e in (t or {}).get("tree", []) if e["type"] == "blob"}
    res = {"repo": full, "privado": x["isPrivate"], "rama": ref, "creado": x["createdAt"][:10],
           "ultimo_push": x["pushedAt"][:10], "kb_repo": x["diskUsage"], "arbol_truncado": (t or {}).get("truncated")}
    res["skills"] = sorted({p.split("/")[2] for p in paths if re.match(r"\.claude/skills/[^/]+/SKILL\.md$", p)})
    res["agentes"] = sorted(p.split("/")[-1][:-3] for p in paths if re.match(r"\.claude/agents/[^/]+\.md$", p))
    res["comandos"] = sorted(p.split("/")[-1][:-3] for p in paths if re.match(r"\.claude/commands/[^/]+\.md$", p))
    res["claude_md_kb"] = round(paths["CLAUDE.md"] / 1024, 1) if "CLAUDE.md" in paths else None
    res["agents_md"] = "AGENTS.md" in paths
    docs = ["SESSION_HANDOFF.md", "TODO.md", "CHANGELOG.md", "DECISIONS.md", "REJECTED.md", "README.md"]
    res["docs"] = [d for d in docs if f"docs/{d}" in paths]
    res["specs_docs"] = len([p for p in paths if re.match(r"docs/SPEC-[^/]+\.md$", p)])
    res["spec0_raiz"] = "SPEC-0.md" in paths
    res["docs_fyd"] = any(p.startswith("docs-fyd/") for p in paths)
    res["legacy"] = any(p.startswith("legacy/") for p in paths)
    tests = [p for p in paths if re.search(r"(^|/)(tests?|__tests__|spec)/|\.test\.|\.spec\.|(^|/)test_[^/]+\.py$|_test\.(py|go)$", p)
             and not p.startswith(("node_modules/", ".claude/", "docs/"))]
    res["archivos_de_prueba"] = len(tests)
    res["ci"] = sorted(p.split("/")[-1] for p in paths if p.startswith(".github/workflows/"))
    big = sorted(((s, p) for p, s in paths.items() if p.endswith(".md") and s > 100_000), reverse=True)[:4]
    res["md_grandes_kb"] = [f"{p} ({s // 1024})" for s, p in big]

    # settings: hooks y barreras
    st = file_text(gh, full, ".claude/settings.json", ref) if ".claude/settings.json" in paths else None
    if st:
        try:
            sj = json.loads(st)
            res["hooks"] = sorted((sj.get("hooks") or {}).keys())
            perm = sj.get("permissions") or {}
            res["permisos"] = {k: len(perm.get(k) or []) for k in ("allow", "ask", "deny")}
            res["modo_default"] = perm.get("defaultMode")
        except Exception as e:
            res["hooks"] = f"settings ilegible: {e}"

    # 1. la ficha del kit
    if ".claude/kit.md" in paths:
        txt = file_text(gh, full, ".claude/kit.md", ref)
        if txt is None:
            res.update({"kit": None, "ficha_error": "no se pudo bajar la ficha"})
        else:
            res.update(leer_ficha(txt, node, kit))
    else:
        res["kit"] = None
    # 2. barreras de fábrica
    piezas = res.get("piezas") or {}
    res["barreras"] = {"deny": (res.get("permisos") or {}).get("deny"),
                       "hook_sensible": piezas.get("hook-sensible"), "candado": piezas.get("candado")}
    # 3. ramas kit/* vivas
    br = gh([f"repos/{full}/branches?per_page=100"])
    ramas = sorted(b["name"] for b in br if b["name"].startswith("kit/")) if isinstance(br, list) else None
    res["ramas_kit"] = ramas
    res["ramas_kit_n"] = len(ramas) if ramas is not None else None
    # 4. copias del kit dentro de .claude/skills/
    res["copias_del_kit"] = sorted(set(res["skills"]) & DEL_KIT)
    # 6. handoff y docs de estado
    kb = lambda p: round(paths[p] / 1024, 1) if p in paths else None
    res["handoff_kb"] = kb("docs/SESSION_HANDOFF.md")
    res["handoff_modulos_kb"] = {m.group(1): round(s / 1024, 1) for p, s in sorted(paths.items())
                                 for m in [re.match(r"docs/modulos/([^/]+)/SESSION_HANDOFF\.md$", p)] if m}
    res["todo_kb"] = kb("docs/TODO.md")
    # 7. specs con sello
    specs = [p for p in paths if re.match(r"(docs|docs/modulos/.+)/SPEC[^/]*\.md$", p)]
    con_sello = sin_leer = 0
    for p in specs:
        s = file_text(gh, full, p, ref)
        if s is None:
            sin_leer += 1
        elif RE_SELLO.search(s):
            con_sello += 1
    res.update({"specs_total": len(specs), "specs_con_sello": con_sello, "specs_sin_leer": sin_leer})
    # 8. portada
    readme = next((p for p in paths if p.lower() == "readme.md"), None)
    res["portada"] = readme is not None
    rt = file_text(gh, full, readme, ref) if readme else None
    res["portada_enlaza_norte"] = bool(rt and RE_NORTE.search(rt))
    # 10. frases viejas y rutas absolutas
    textos = {}
    for p, s in paths.items():
        skill = p.startswith(".claude/skills/") and es_texto(p)
        if (skill or p == "CLAUDE.md") and s <= MAX_ARCHIVO:
            c = file_text(gh, full, p, ref)
            if c is not None:
                textos[p] = (c, skill)
    res.update(medir_textos(textos, frases))

    # marcas de versión del método en CLAUDE.md
    if res["claude_md_kb"]:
        c = (textos.get("CLAUDE.md") or (file_text(gh, full, "CLAUDE.md", ref) or "", 0))[0]
        res["menciona"] = [w for w in ("vibe-kit", "Arquitecto", "SPEC-0", "/inicio", "/cierre", "handoff",
                                       "director", "obrero", "tramo") if w.lower() in c.lower()]
        v = re.findall(r"\bv\d+\.\d+(?:\.\d+)?\b", c)
        res["versiones_citadas"] = sorted(set(v))[:5]
    n = commit_count(gh, full, ref)
    res["commits"] = n
    res["primer_commit"] = first_commit_date(gh, full, ref, n)
    res["autores"] = authors(gh, full)
    return res


def aparece_en(filas):
    """5. Cada skill propia (no universal, no del kit) y en cuántos repos está; 3+ marcadas (regla de 3+)."""
    cuenta = {}
    for f in filas:
        for s in f.get("skills") or []:
            if s not in UNIVERSALES and s not in DEL_KIT:
                cuenta[s] = cuenta.get(s, 0) + 1
    return [{"skill": s, "repos": n, "regla_de_3": n >= 3}
            for s, n in sorted(cuenta.items(), key=lambda kv: (-kv[1], kv[0]))]


def correr(owners, gh=gh_real, node=node_real, kit=KIT_POR_DEFECTO, frases=(), hooks=None,
           plazo=HOOK_PLAZO, lista_repos=None):
    filas = [scan(x, gh, node, kit, frases) for x in (lista_repos if lista_repos is not None else repos(owners))]
    hooks = hooks or {}
    usados = set()
    for f in filas:
        nombre = f["repo"].split("/")[-1]
        for alias, clon in hooks.items():
            if alias in (f["repo"], nombre):
                f.update(huella_hook(clon, plazo))
                usados.add(alias)
    sueltos = {a: huella_hook(c, plazo) for a, c in hooks.items() if a not in usados}
    out = {"repos": filas, "skills_propias": aparece_en(filas)}
    if sueltos:
        out["hooks_sin_fila"] = sueltos
    return out


def main(argv=None):
    ap = argparse.ArgumentParser(description="Inventario de la flota (kit v2 y v3) por gh. Solo mide; no escribe en ningún repo.")
    ap.add_argument("owners", nargs="*", help="dueños de GitHub")
    ap.add_argument("--kit", default=KIT_POR_DEFECTO, help="raíz de vibe-kit (para el parser de la ficha)")
    ap.add_argument("--hook", action="append", default=[], metavar="ALIAS=CLON",
                    help="corre el SessionStart del clon temporal y cuenta los caracteres (repetible)")
    ap.add_argument("--hook-plazo", type=float, default=HOOK_PLAZO, help="plazo del hook en segundos (20)")
    ap.add_argument("--carpeta", help="solo frases_viejas y rutas_absolutas sobre una carpeta local (ej. kit/molde)")
    ap.add_argument("--frases", default=FRASES_POR_DEFECTO, help="archivo de frases viejas")
    a = ap.parse_args(argv)
    sys.stdout.reconfigure(encoding="utf-8")
    frases = cargar_frases(a.frases)
    if a.carpeta:
        out = medir_carpeta(a.carpeta, frases)
    else:
        if not a.owners:
            ap.error("falta al menos un dueño (o --carpeta)")
        hooks = {}
        for h in a.hook:
            if "=" not in h:
                ap.error("--hook va como alias=clon")
            k, _, v = h.partition("=")
            hooks[k] = v
        out = correr(a.owners, kit=a.kit, frases=frases, hooks=hooks, plazo=a.hook_plazo)
    json.dump(out, sys.stdout, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
