"""Evidencia de los repos: qué cuenta el historial de git de cada proyecto (rama por defecto).
Uso: python -I repos.py <alias>=<ruta-al-repo>[@desde=AAAA-MM-DD] ...   Salida: JSON en stdout.
Clasifica cada commit por su asunto, cruza los arreglos con los archivos que tocan y mide pruebas."""
import collections, datetime as dt, json, re, subprocess, sys

FIX = re.compile(r"^(fix|hotfix|bugfix)\b|^\w+\(fix\)|\b(arregl|corrig|corrij|hotfix|bug)\w*", re.I)
REVERT = re.compile(r"^revert\b|\brevertir (el |la |un |upgrade|cambio)|\brevertir \w+ (true|false)\b", re.I)
TEST = re.compile(r"(^|/)(tests?|__tests__|test_\w+\.py$)|\.test\.|\.spec\.|_test\.(py|go|dart)$|(^|/)integration_test/|(^|/)supabase/tests/|(^|/)pruebas/", re.I)
DOC = re.compile(r"\.md$|(^|/)docs?/|(^|/)\.claude/", re.I)
TIPO = re.compile(r"^(\w+)(\([^)]*\))?!?:")


def git(repo, *a):
    return subprocess.run(["git", "-C", repo, *a], capture_output=True, text=True,
                          encoding="utf-8", errors="replace").stdout


def commits(repo, desde):
    # \x1d separa el cuerpo de la lista de archivos que agrega --name-only
    fmt = "\x1e%H\x1f%cI\x1f%s\x1f%b\x1d"
    args = ["log", "--no-merges", "--name-only", f"--format={fmt}", "HEAD"]
    if desde:
        args.insert(1, f"--since={desde}")
    out = []
    for blk in git(repo, *args).split("\x1e")[1:]:
        h, fecha, asunto, resto = blk.split("\x1f", 3)
        cuerpo, _, archivos = resto.partition("\x1d")
        out.append({"h": h, "fecha": dt.datetime.fromisoformat(fecha), "asunto": asunto,
                    "cuerpo": cuerpo, "archivos": [l.strip() for l in archivos.splitlines() if l.strip()]})
    return out


def analizar(alias, repo, desde):
    cs = commits(repo, desde)
    if not cs:
        return {"alias": alias, "error": "sin commits"}
    cs.sort(key=lambda c: c["fecha"])
    n = len(cs)
    dias = {c["fecha"].date() for c in cs}
    tipos = collections.Counter((TIPO.match(c["asunto"]).group(1).lower() if TIPO.match(c["asunto"]) else "(sin prefijo)") for c in cs)
    fixes = [c for c in cs if FIX.search(c["asunto"]) and not REVERT.search(c["asunto"])]
    reverts = [c for c in cs if REVERT.search(c["asunto"])]
    con_test = [c for c in cs if any(TEST.search(a) for a in c["archivos"])]
    fix_con_test = [c for c in fixes if any(TEST.search(a) for a in c["archivos"])]
    solo_docs = [c for c in cs if c["archivos"] and all(DOC.search(a) for a in c["archivos"])]
    ia = [c for c in cs if re.search(r"co-authored-by:\s*claude", c["cuerpo"], re.I)]
    # lo que se rompió dos veces: archivos de código tocados por 3+ arreglos
    codigo = lambda a: not DOC.search(a) and not TEST.search(a)
    por_archivo = collections.defaultdict(list)
    for c in fixes:
        for a in set(filter(codigo, c["archivos"])):
            por_archivo[a].append(c["fecha"])
    calientes = sorted(((len(v), a) for a, v in por_archivo.items() if len(v) >= 3), reverse=True)
    # arreglo del arreglo: un fix que toca un archivo de código que otro fix tocó en las 72 h previas
    ventana = dt.timedelta(hours=72)
    re_fix = 0
    for i, c in enumerate(fixes):
        archivos = set(filter(codigo, c["archivos"]))
        for p in fixes[:i]:
            if c["fecha"] - p["fecha"] <= ventana and archivos & set(filter(codigo, p["archivos"])):
                re_fix += 1
                break
    pct = lambda x: round(100 * len(x) / n, 1)
    return {
        "alias": alias, "desde": str(cs[0]["fecha"].date()), "hasta": str(cs[-1]["fecha"].date()),
        "commits": n, "dias_activos": len(dias), "commits_por_dia_activo": round(n / len(dias), 1),
        "tipos_top": tipos.most_common(6),
        "pct_fix": pct(fixes), "fixes": len(fixes), "reverts": len(reverts),
        "ejemplos_revert": [c["asunto"][:90] for c in reverts[:4]],
        "pct_toca_pruebas": pct(con_test), "pct_fix_con_prueba": round(100 * len(fix_con_test) / len(fixes), 1) if fixes else None,
        "pct_solo_docs_o_metodo": pct(solo_docs), "pct_coautor_claude": pct(ia),
        "arreglo_del_arreglo_72h": re_fix, "pct_arreglo_del_arreglo": round(100 * re_fix / len(fixes), 1) if fixes else None,
        "archivos_con_3+_arreglos": len(calientes), "top_calientes": [f"{a} ({k})" for k, a in calientes[:5]],
    }


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    res = []
    for arg in sys.argv[1:]:
        alias, _, ruta = arg.partition("=")
        ruta, _, desde = ruta.partition("@desde=")
        res.append(analizar(alias, ruta, desde or None))
    print(json.dumps(res, ensure_ascii=False, indent=1))
