# FORK — qué agrega el kit sobre las plantillas del jefe

> **El original manda.** `_fuente/01..04-*.md` son las 4 plantillas del método "Cómo Arrancar un
> Proyecto" tal como las repartió el jefe de Guido (2026-07-22). **Nunca se editan.** Las de trabajo
> (`1..4-*.md`) son esos mismos archivos **más lo de esta lista, y nada más**.
>
> **Todo el fork es agregado puro**: `diff _fuente/0N-*.md N-*.md` no tiene una sola línea `<`.
> Por eso se re-aplica a mano en 5 minutos cuando el jefe cambie algo (ver `SYNC.md`).

## 1. La cabecera de procedencia (los 4 archivos)

3 líneas de comentario HTML al tope, antes del `#`. Dice de qué `_fuente/` sale, la fecha del método,
que el dueño humano es el jefe y que si él cambia una pregunta **gana él**. No se imprime en el PDF.

## 2. Las 7 celdas faltantes de la grilla

La grilla del método es 7 casillas × 4 etapas = 28. El original trae **21**: `01` tiene los 7 bloques,
`02` tiene 5, `03` tiene 5, `04` tiene 4. Estas son las 7 que faltaban. **Van al final de la sección
"Bloques extra" de cada archivo, en orden**, marcadas `[+fork]` en el `###`.

| # | Archivo | Casilla | La pregunta |
|---|---|---|---|
| 1 | `2-sistema-actual.md` | Muchos usuarios o roles | ¿Cada rol lo hace igual, o cada uno tiene su propia versión (su planilla, su carpeta, su manera)? ¿Cuántas variantes hay dando vueltas? |
| 2 | `2-sistema-actual.md` | Corre solo (automático) | Hoy, ¿quién se acuerda de dispararlo y cuándo? ¿Qué pasa cuando esa persona no está? |
| 3 | `3-necesidad.md` | Reemplaza un proceso manual | ¿Cómo vamos a saber que dejaron de hacerlo a mano? (qué se mira a las 4-6 semanas) |
| 4 | `3-necesidad.md` | Maneja archivos o documentos | ¿Qué pasa con los archivos que YA existen: se migran, se dejan, o se arranca de cero? ¿Cuántos son? |
| 5 | `4-propuesta.md` | Toca plata | ¿Quién revisa y aprueba los números antes de que salgan? Si un número sale mal, ¿cómo se corrige y quién se entera? |
| 6 | `4-propuesta.md` | Muchos usuarios o roles | ¿Quién arranca primero y quién queda para después? ¿Cuál de ellos ya lo pidió o se lo va a bancar adentro? |
| 7 | `4-propuesta.md` | Maneja archivos o documentos | ¿Dónde van a vivir los archivos y quién los puede ver o borrar? ¿Se siguen guardando también donde están hoy? |

**El `###` de cada celda copia el nombre del bloque como lo escribe `01` en su Parte 2** (no el texto de
la casilla en la clasificación). De eso depende que R6 pueda cruzar casilla tildada ↔ bloque vacío.

## 3. El marcador del anexo separable (`1`, `2` y `3`, no en el `4`)

Un comentario HTML al final que dice dónde aterriza el anexo **"Fuera de planilla"** (las lentes).
Es un marcador, no una celda: no imprime nada y si no hubo lentes no se escribe nada. En el `4` no va
porque ahí las lentes van fundidas y marcadas `[fp]`.

## Lo que el kit NO cambió

Ni una pregunta del original · ni el orden · ni los `{{LINEAS:N}}` (ver `LEEME.md`) · ni los títulos ·
ni los textos de ayuda en `>`. **Las plantillas que el jefe ya repartió no se tocan**: las 7 celdas
son una propuesta para llevarle aparte, y hasta que él las apruebe viven sólo en la copia del kit.
