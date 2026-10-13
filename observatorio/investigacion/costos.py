"""Q1 de la investigación: tabla de costos reales por rol y modelo, desde los costos.csv de la Etapa 0.

Solo agrega números. Los proyectos se agrupan en familias (Hermes Desktop / Hermes Mobile / otros)
para que la tabla pueda ir al repo público sin nombres de carpetas de negocio.

Uso: python costos.py D:\\vibe-research\\clientes\\costos.csv [otra-pc\\costos.csv ...] > tabla.md
"""
import collections
import csv
import sys

sys.stdout.reconfigure(encoding="utf-8")
CAMPOS = ("input", "cache_creation", "cache_read", "output")


def familia(proyecto):
    p = proyecto.lower()
    if "hermes-hermes-exe" in p:
        return "Hermes Desktop"
    if "hermes-hermes-mobile" in p:
        return "Hermes Mobile"
    return "otros proyectos"


def modelo_corto(m):
    for k in ("opus", "sonnet", "haiku", "fable"):
        if k in m:
            return k
    return m or "?"


def m(n):
    return f"{n / 1e6:,.1f}"


def tabla(titulo, filas, clave):
    agg = collections.defaultdict(collections.Counter)
    chats = collections.defaultdict(set)
    for f in filas:
        k = clave(f)
        for c in CAMPOS + ("respuestas",):
            agg[k][c] += int(f[c] or 0)
        chats[k].add((f["pc"], f["proyecto"], f.get("transcript") or f["sesion"]))
    print(f"\n### {titulo}\n")
    print("| | Transcripts | Respuestas | Input M | Escritura caché M | Lectura caché M | Output M | % lectura caché |")
    print("|---|---:|---:|---:|---:|---:|---:|---:|")
    for k in sorted(agg, key=lambda k: -agg[k]["cache_read"]):
        a = agg[k]
        tot = sum(a[c] for c in CAMPOS) or 1
        print(f"| {' · '.join(k)} | {len(chats[k])} | {a['respuestas']:,} | {m(a['input'])} | "
              f"{m(a['cache_creation'])} | {m(a['cache_read'])} | {m(a['output'])} | {100 * a['cache_read'] / tot:.0f}% |")


def main():
    filas = []
    for ruta in sys.argv[1:]:
        filas += [f for f in csv.DictReader(open(ruta, encoding="utf-8")) if f["modelo"] not in ("(sin respuestas)", "<synthetic>")]
    pcs = sorted({f["pc"] for f in filas})
    print(f"Fuente: campo `usage` de los transcripts, agrupado por `message.id` (última línea). PCs: {', '.join(pcs)}. "
          f"Tokens en millones (M).")
    tabla("Por rol y modelo", filas, lambda f: (f["rol"], modelo_corto(f["modelo"])))
    tabla("Por familia de proyecto y modelo", filas, lambda f: (familia(f["proyecto"]), modelo_corto(f["modelo"])))
    tabla("Subagentes por tipo y modelo (top por lectura de caché)", [f for f in filas if f["tipo"] == "subagente"],
          lambda f: (f["agentType"] or "?", modelo_corto(f["modelo"])))


if __name__ == "__main__":
    main()
