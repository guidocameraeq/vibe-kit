"""Recorte para preguntas que solo miran a Guido (nació con la tanda de hábitos, oct 2026).

Toma los condensados de `condensar.py` y deja, de cada chat principal:
- los mensajes de Guido enteros (los `[comando /x]` incluidos);
- la primera línea de la primera respuesta de Claude después de cada uno;
- la marca de los mensajes entre sesiones, sin su cuerpo.
Saltea los subagentes (su "usuario" es el agente padre, no Guido) y los avisos automáticos de
tareas en segundo plano. Después arma lotes de hasta `--tope-kb`, agrupados por proyecto.

Escribe SIEMPRE fuera del repo, como condensar.py.

Uso: python -I recortar.py --origen D:\\vibe-research\\clientes\\habitos [--tope-kb 90]
  lee <origen>\\condensados, escribe <origen>\\recortados y <origen>\\lotes\\L<n>.txt
"""
import argparse
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")


def recortar(lineas):
    """Devuelve (lineas_recortadas, mensajes_de_guido)."""
    out = lineas[:3]
    i, n_guido = 3, 0
    while i < len(lineas):
        l = lineas[i]
        if l.startswith("### GUIDO") and i + 1 < len(lineas) and lineas[i + 1].startswith("[notificación de tarea"):
            i += 2  # aviso automático, no lo escribió Guido
            continue
        if l.startswith("### GUIDO"):
            n_guido += 1
            out += ["", l]
            i += 1
            while i < len(lineas) and not (lineas[i].startswith("### ") or lineas[i].startswith("**CLAUDE**")
                                           or lineas[i].startswith("  [") or lineas[i].startswith("  ↳")):
                out.append(lineas[i])
                i += 1
            # primera línea de texto de la primera respuesta de Claude que siga
            while i < len(lineas) and not lineas[i].startswith("### GUIDO"):
                if lineas[i].startswith("**CLAUDE**"):
                    j = i + 1
                    while j < len(lineas) and not lineas[j].strip():
                        j += 1
                    if j < len(lineas):
                        out.append("> CLAUDE: " + lineas[j].strip()[:300])
                    break
                i += 1
            continue
        if l.startswith("### DE "):
            out += ["", l + " [cuerpo omitido]"]
        i += 1
    return out, n_guido


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
    a = ap.parse_args()

    origen = os.path.abspath(a.origen)
    if repo_que_contiene(origen):
        sys.exit("La carpeta de trabajo no puede estar dentro de un repo git.")
    cond, dest = os.path.join(origen, "condensados"), os.path.join(origen, "recortados")
    hechos = []  # (proyecto, ruta, bytes)
    msgs = 0
    for proyecto in sorted(os.listdir(cond)):
        for nombre in sorted(os.listdir(os.path.join(cond, proyecto))):
            if "__sub-" in nombre:
                continue
            lineas = open(os.path.join(cond, proyecto, nombre), encoding="utf-8").read().split("\n")
            out, n = recortar(lineas)
            if n == 0:
                continue
            cuerpo = "\n".join(out).strip() + "\n"
            ruta = os.path.join(dest, proyecto, nombre)
            os.makedirs(os.path.dirname(ruta), exist_ok=True)
            open(ruta, "w", encoding="utf-8").write(cuerpo)
            hechos.append((proyecto, ruta, len(cuerpo.encode("utf-8"))))
            msgs += n

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
    print(f"Chats: {len(hechos)} · mensajes de Guido: {msgs} · {total / 1024:.0f} KB (~{total // 4 // 1000} k tokens)")
    print(f"Lotes: {len(lotes)} de hasta {a.tope_kb} KB")
    print(f"Presupuesto de los lectores: ~{len(lotes) * 120} k tokens (piso de ~120 k por lector Sonnet, medido en la PC Usuario)")


if __name__ == "__main__":
    main()
