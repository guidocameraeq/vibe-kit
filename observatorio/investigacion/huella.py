"""Huella del método por proyecto: a qué versión del molde del kit se parece su /inicio y su /cierre,
y qué dicen las skills que nacieron en el proyecto. Uso: python -I huella.py <flota.json> <repo vibe-kit>"""
import base64, difflib, json, re, subprocess, sys

flota = json.load(open(sys.argv[1], encoding="utf-8"))
KIT = sys.argv[2]
UNIVERSALES = {"inicio", "cierre"}
DEL_KIT = {"arquitecto", "arquitecto-skills", "docs-fyd", "relevamiento"}


def git(*a):
    return subprocess.run(["git", "-C", KIT, *a], capture_output=True, text=True, encoding="utf-8").stdout


def versiones_molde(skill):
    """Todas las versiones históricas del molde, siguiendo renombres."""
    ruta = f"kit/skills/arquitecto/templates/universales/skills/{skill}/SKILL.md"
    out = []
    for line in git("log", "--follow", "--name-only", "--format=@%h %cs", "--", ruta).splitlines():
        if line.startswith("@"):
            h, fecha = line[1:].split()
        elif line.strip():
            txt = git("show", f"{h}:{line.strip()}")
            if txt:
                out.append((fecha, h, txt))
    return out


def gh_file(full, path, ref):
    r = subprocess.run(["gh", "api", f"repos/{full}/contents/{path}?ref={ref}"],
                       capture_output=True, text=True, encoding="utf-8")
    if r.returncode:
        return None
    return base64.b64decode(json.loads(r.stdout)["content"]).decode("utf-8", "replace")


def desc(txt):
    m = re.search(r"^description:\s*(.+?)(?=^\w[\w-]*:|^---)", txt or "", re.S | re.M)
    return re.sub(r"\s+", " ", m.group(1)).strip().strip('"')[:220] if m else None


moldes = {s: versiones_molde(s) for s in UNIVERSALES}
res = []
for r in flota:
    if not r.get("skills"):
        continue
    full, ref = r["repo"], r["rama"]
    fila = {"repo": full}
    for s in UNIVERSALES & set(r["skills"]):
        txt = gh_file(full, f".claude/skills/{s}/SKILL.md", ref) or ""
        best = max(((difflib.SequenceMatcher(None, txt, m).ratio(), f, h) for f, h, m in moldes[s]), default=None)
        fila[s] = {"kb": round(len(txt.encode()) / 1024, 1),
                   "parecido": round(best[0], 2) if best else None,
                   "molde_mas_parecido": f"{best[1]} {best[2]}" if best else None}
    fila["propias"] = {}
    for s in r["skills"]:
        if s in UNIVERSALES or s in DEL_KIT:
            if s in DEL_KIT:
                fila.setdefault("copias_del_kit", []).append(s)
            continue
        txt = gh_file(full, f".claude/skills/{s}/SKILL.md", ref)
        fila["propias"][s] = {"kb": round(len((txt or "").encode()) / 1024, 1), "desc": desc(txt)}
    res.append(fila)

sys.stdout.reconfigure(encoding="utf-8")
print(json.dumps({"versiones_molde": {s: [f"{f} {h}" for f, h, _ in v] for s, v in moldes.items()},
                  "proyectos": res}, ensure_ascii=False, indent=1))
