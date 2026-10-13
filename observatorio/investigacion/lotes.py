"""Arma los lotes de la Etapa 1 (docs/SPEC-investigacion-chats.md, D3 opción A).

- Todo lo que no es Hermes: completo, agrupado por proyecto.
- Hermes Mobile: completo, por tramos de fechas.
- Hermes Desktop: los días con cambio de método en la bitácora + 1 de cada 5 días SIN entrada,
  al azar con semilla fija y declarado en lotes.json.
- Subagentes de Hermes: ~10% al azar (semilla fija); los de otros proyectos, todos.

Uso: python lotes.py --pc clientes --dias-cambio 2026-08-20,2026-08-21,... [--tope-kb 500]
Lee D:\\vibe-research\\<pc>\\condensados y escribe D:\\vibe-research\\<pc>\\lotes\\<lote>.txt + lotes.json
"""
import argparse
import collections
import glob
import json
import os
import random
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
SEMILLA = 20261012


def fecha_de(md):
    with open(md, encoding="utf-8") as f:
        for _ in range(4):
            m = re.search(r"desde (\d{4}-\d{2}-\d{2})", f.readline())
            if m:
                return m.group(1)
    return "0000-00-00"


def trocear(nombre, archivos, tope):
    """Parte una lista ordenada de (ruta, kb, fecha) en lotes de <= tope KB."""
    lotes, actual, kb = [], [], 0
    for a in archivos:
        if actual and kb + a[1] > tope:
            lotes.append(actual)
            actual, kb = [], 0
        actual.append(a)
        kb += a[1]
    if actual:
        lotes.append(actual)
    if len(lotes) == 1:
        return [(nombre, lotes[0])]
    return [(f"{nombre}-{i + 1:02d}", l) for i, l in enumerate(lotes)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pc", required=True)
    ap.add_argument("--dias-cambio", default="")
    ap.add_argument("--tope-kb", type=int, default=500)
    ap.add_argument("--base", default=None, help="carpeta de la Etapa 0 (la --salida de condensar.py)")
    a = ap.parse_args()
    raiz = os.path.join("D:\\" if os.path.isdir("D:\\") else "C:\\", "vibe-research")
    base = a.base or os.path.join(raiz, a.pc)
    rnd = random.Random(SEMILLA)
    dias_cambio = set(d for d in a.dias_cambio.split(",") if d)

    grupos = collections.defaultdict(list)  # clave -> [(ruta, kb, fecha)]
    for md in glob.glob(os.path.join(base, "condensados", "*", "*.md")):
        proyecto = os.path.basename(os.path.dirname(md))
        kb = max(1, os.path.getsize(md) // 1024)
        es_sub = "__sub-" in md
        hermes = "hermes-hermes" in proyecto.lower()
        if es_sub and hermes:
            grupos["subagentes-hermes-muestra"].append((md, kb, fecha_de(md)))
        elif "capataz" in proyecto.lower():
            grupos["capataz"].append((md, kb, fecha_de(md)))
        else:
            grupos[proyecto].append((md, kb, fecha_de(md)))

    declarado = {}
    # Subagentes de Hermes: 10% al azar
    subs = sorted(grupos.pop("subagentes-hermes-muestra", []))
    if subs:
        elegidos = sorted(rnd.sample(subs, max(1, len(subs) // 10)))
        grupos["subagentes-hermes-muestra"] = elegidos
        declarado["subagentes_hermes"] = f"{len(elegidos)} de {len(subs)} (10%, semilla {SEMILLA})"

    # Hermes Desktop: días de cambio + 1 de cada 5 días sin entrada
    clave_d = next((k for k in grupos if k.lower() == "d--hermes-hermes-exe"), None)
    if clave_d is not None:  # en una PC sin Hermes Desktop no hay muestreo
        dias = sorted({f for _, _, f in grupos[clave_d]})
        sin_entrada = [d for d in dias if d not in dias_cambio]
        azar = sorted(rnd.sample(sin_entrada, max(1, round(len(sin_entrada) / 5)))) if sin_entrada else []
        quedan = dias_cambio | set(azar)
        total_d = len(grupos[clave_d])
        grupos[clave_d] = [x for x in grupos[clave_d] if x[2] in quedan]
        declarado["hermes_desktop"] = {
            "dias_con_chats": len(dias),
            "dias_de_cambio_con_chats": sorted(set(dias) & dias_cambio),
            "dias_sin_entrada_elegidos_al_azar": azar,
            "dias_sin_entrada_descartados": [d for d in sin_entrada if d not in azar],
            "chats": f"{len(grupos[clave_d])} de {total_d}",
        }

    # Proyectos chicos (< tope/2) se juntan en lotes "varios"
    lotes = []
    chicos = []
    for clave, archivos in sorted(grupos.items()):
        archivos.sort(key=lambda x: (x[2], x[0]))
        if sum(k for _, k, _ in archivos) < a.tope_kb // 2 and clave not in ("capataz",):
            chicos.extend(archivos)
            continue
        corto = re.sub(r"^[A-Za-z]--+", "", clave)[:40].strip("-")
        lotes.extend(trocear(corto, archivos, a.tope_kb))
    chicos.sort(key=lambda x: (os.path.dirname(x[0]), x[2]))
    lotes.extend(trocear("varios", chicos, a.tope_kb))

    os.makedirs(os.path.join(base, "lotes"), exist_ok=True)
    salida = []
    for nombre, archivos in lotes:
        lista = os.path.join(base, "lotes", nombre + ".txt")
        with open(lista, "w", encoding="utf-8") as f:
            f.write("\n".join(r for r, _, _ in archivos) + "\n")
        kb = sum(k for _, k, _ in archivos)
        salida.append({"lote": nombre, "lista": lista, "archivos": len(archivos), "kb": kb,
                       "desde": min(x[2] for x in archivos), "hasta": max(x[2] for x in archivos)})
    json.dump({"lotes": salida, "muestreo": declarado}, open(os.path.join(base, "lotes.json"), "w",
              encoding="utf-8"), ensure_ascii=False, indent=1)
    tot = sum(l["kb"] for l in salida)
    print(f"{len(salida)} lotes · {tot / 1024:.1f} MB · ~{tot * 1024 // 4 // 1000:,} k tokens")
    for l in salida:
        print(f"  {l['lote']:<45} {l['archivos']:>4} arch {l['kb']:>5} KB  {l['desde']}..{l['hasta']}")
    print("Muestreo:", json.dumps({k: (v if isinstance(v, str) else v["chats"]) for k, v in declarado.items()}))


if __name__ == "__main__":
    main()
