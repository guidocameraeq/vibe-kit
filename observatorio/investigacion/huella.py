"""Huella del método por proyecto: a qué versión del molde del kit se parece su /inicio y su /cierre,
y qué dicen las skills que nacieron en el proyecto. Mide; no escribe en ningún repo.
Uso: py -3 -I huella.py <flota.json> <repo vibe-kit>

El molde tiene dos historias (D8-8): v2 = kit/skills/arquitecto/templates/universales/skills/<x>/SKILL.md y
v3 = kit/molde/skills/<x>/SKILL.md. Se compara contra TODAS las versiones de las dos y se reporta la más
parecida, con cuál historia fue ("v2" o "v3"). Las copias del kit en .claude/skills/ las cuenta flota.py."""
import base64, difflib, json, re, subprocess, sys

UNIVERSALES = {"inicio", "cierre"}
DEL_KIT = {"arquitecto", "arquitecto-skills", "docs-fyd", "relevamiento"}
RUTAS_MOLDE = {
    "v2": "kit/skills/arquitecto/templates/universales/skills/{s}/SKILL.md",
    "v3": "kit/molde/skills/{s}/SKILL.md",
}


def git_en(kit):
    def git(*a):
        return subprocess.run(["git", "-C", kit, *a], capture_output=True, text=True, encoding="utf-8").stdout
    return git


def versiones_molde(skill, git):
    """Todas las versiones históricas del molde en las dos historias, siguiendo renombres.
    -> [(fecha, hash, texto, "v2"|"v3")]"""
    out, vistas = [], set()
    for historia, plantilla in RUTAS_MOLDE.items():
        ruta = plantilla.format(s=skill)
        h = fecha = None
        for line in git("log", "--follow", "--name-only", "--format=@%h %cs", "--", ruta).splitlines():
            if line.startswith("@"):
                h, fecha = line[1:].split()
            elif line.strip() and h:
                p = line.strip()
                if (h, p) in vistas:
                    continue
                vistas.add((h, p))
                txt = git("show", f"{h}:{p}")
                if txt:
                    out.append((fecha, h, txt, "v3" if p.startswith("kit/molde/") else "v2"))
    return out


def gh_file_real(full, path, ref):
    r = subprocess.run(["gh", "api", f"repos/{full}/contents/{path}?ref={ref}"],
                       capture_output=True, text=True, encoding="utf-8")
    if r.returncode:
        return None
    return base64.b64decode(json.loads(r.stdout)["content"]).decode("utf-8", "replace")


def desc(txt):
    m = re.search(r"^description:\s*(.+?)(?=^\w[\w-]*:|^---)", txt or "", re.S | re.M)
    return re.sub(r"\s+", " ", m.group(1)).strip().strip('"')[:220] if m else None


def mas_parecido(txt, versiones):
    """-> (parecido, fecha, hash, historia) de la versión más parecida, o None."""
    return max(((difflib.SequenceMatcher(None, txt, m).ratio(), f, h, hist) for f, h, m, hist in versiones),
               default=None)


def huella(flota, git, gh_file=gh_file_real):
    filas_flota = flota["repos"] if isinstance(flota, dict) else flota
    moldes = {s: versiones_molde(s, git) for s in UNIVERSALES}
    res = []
    for r in filas_flota:
        if not r.get("skills"):
            continue
        full, ref = r["repo"], r["rama"]
        fila = {"repo": full}
        for s in UNIVERSALES & set(r["skills"]):
            txt = gh_file(full, f".claude/skills/{s}/SKILL.md", ref) or ""
            best = mas_parecido(txt, moldes[s])
            fila[s] = {"kb": round(len(txt.encode()) / 1024, 1),
                       "parecido": round(best[0], 2) if best else None,
                       "molde_mas_parecido": f"{best[1]} {best[2]}" if best else None,
                       "historia": best[3] if best else None}
        fila["propias"] = {}
        for s in r["skills"]:
            if s in UNIVERSALES or s in DEL_KIT:
                continue
            txt = gh_file(full, f".claude/skills/{s}/SKILL.md", ref)
            fila["propias"][s] = {"kb": round(len((txt or "").encode()) / 1024, 1), "desc": desc(txt)}
        res.append(fila)
    return {"versiones_molde": {s: [f"{hist} {f} {h}" for f, h, _, hist in v] for s, v in moldes.items()},
            "proyectos": res}


def main(argv=None):
    argv = sys.argv[1:] if argv is None else argv
    if len(argv) != 2 or argv[0] in ("-h", "--help"):
        print(__doc__)
        return 0 if argv and argv[0] in ("-h", "--help") else 2
    flota = json.load(open(argv[0], encoding="utf-8"))
    sys.stdout.reconfigure(encoding="utf-8")
    print(json.dumps(huella(flota, git_en(argv[1])), ensure_ascii=False, indent=1))
    return 0


if __name__ == "__main__":
    sys.exit(main())
