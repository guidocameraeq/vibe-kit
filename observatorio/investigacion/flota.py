"""Inventario de la flota: por cada repo de GitHub de los dueños dados, qué trae del método.
Lee solo metadatos y archivos chicos vía `gh api`. Uso: python -I flota.py <dueño> [<dueño> ...] > flota.json"""
import json, re, subprocess, sys, base64

OWNERS = sys.argv[1:]


def gh(args, raw=False):
    r = subprocess.run(["gh", "api", *args], capture_output=True, text=True, encoding="utf-8")
    if r.returncode != 0:
        return None
    return r.stdout if raw else json.loads(r.stdout or "null")


def repos():
    out = []
    for o in OWNERS:
        r = subprocess.run(["gh", "repo", "list", o, "--limit", "100", "--json",
                            "name,isPrivate,pushedAt,createdAt,defaultBranchRef,isFork,diskUsage"],
                           capture_output=True, text=True, encoding="utf-8")
        for x in json.loads(r.stdout):
            x["owner"] = o
            out.append(x)
    return out


def file_text(full, path, ref):
    d = gh([f"repos/{full}/contents/{path}?ref={ref}"])
    if not d or "content" not in d:
        return None
    return base64.b64decode(d["content"]).decode("utf-8", "replace")


def commit_count(full, ref):
    r = subprocess.run(["gh", "api", "-i", f"repos/{full}/commits?sha={ref}&per_page=1"],
                       capture_output=True, text=True, encoding="utf-8")
    m = re.search(r'page=(\d+)>; rel="last"', r.stdout)
    return int(m.group(1)) if m else (1 if r.returncode == 0 else None)


def first_commit_date(full, ref, n):
    if not n:
        return None
    d = gh([f"repos/{full}/commits?sha={ref}&per_page=1&page={n}"])
    return d[0]["commit"]["committer"]["date"][:10] if d else None


def authors(full):
    d = gh([f"repos/{full}/contributors?anon=1&per_page=100"])
    return len(d) if isinstance(d, list) else None


def scan(x):
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
    st = file_text(full, ".claude/settings.json", ref) if ".claude/settings.json" in paths else None
    if st:
        try:
            sj = json.loads(st)
            res["hooks"] = sorted((sj.get("hooks") or {}).keys())
            perm = sj.get("permissions") or {}
            res["permisos"] = {k: len(perm.get(k) or []) for k in ("allow", "ask", "deny")}
            res["modo_default"] = perm.get("defaultMode")
        except Exception as e:
            res["hooks"] = f"settings ilegible: {e}"
    # marcas de versión del método en CLAUDE.md
    if res["claude_md_kb"]:
        c = file_text(full, "CLAUDE.md", ref) or ""
        res["menciona"] = [w for w in ("vibe-kit", "Arquitecto", "SPEC-0", "/inicio", "/cierre", "handoff",
                                       "director", "obrero", "tramo") if w.lower() in c.lower()]
        v = re.findall(r"\bv\d+\.\d+(?:\.\d+)?\b", c)
        res["versiones_citadas"] = sorted(set(v))[:5]
    n = commit_count(full, ref)
    res["commits"] = n
    res["primer_commit"] = first_commit_date(full, ref, n)
    res["autores"] = authors(full)
    return res


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    out = [scan(x) for x in repos()]
    json.dump(out, sys.stdout, ensure_ascii=False, indent=1)
