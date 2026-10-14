# Evidencia de los repos

> **Misión 4, tramo 2 (b)** · 2026-10-14 · Lo que cuenta el historial de git de cada proyecto. Describe;
> no decide. Entra al mapa del tramo 3 (`TABLERO.md`) como **líneas base medidas**. Los alias son los de
> [`FLOTA.md`](FLOTA.md). El plan: [`PLAN.md`](PLAN.md).

**Cómo se midió.** Un script (`observatorio/investigacion/repos.py`) recorre la rama principal de cada
proyecto, sin contar los merges, sobre clones que bajan solo el historial (sin el contenido de los
archivos). Costo: casi cero tokens. Por cada commit mira el asunto y los archivos que toca:
- **Arreglo**: el asunto dice `fix`, `hotfix`, "arregl…", "corrig…" o "bug".
- **Reversión**: un `revert` de verdad, no la palabra "revertir" usada como nombre de una función.
- **Arreglo del arreglo**: un arreglo que toca un archivo de código que otro arreglo ya había tocado en
  las 72 h anteriores.
- **Arreglo con prueba**: el commit del arreglo toca también un archivo de prueba.
- **Solo documentos**: el commit toca únicamente `.md`, `docs/` o `.claude/`. Ahí entran los specs, los
  docs y el método, sin separarlos.

## Los números

| Proyecto | Período | Commits | Por día activo | % arreglos | Reversiones | **Arreglo del arreglo** | **Arreglo con prueba** | Tocan pruebas | Archivos con 3+ arreglos | **Solo documentos** | Coautor Claude |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Desktop | mar→oct | 1.539 | 16 | 12% | 1 | 26% | 22% | 18% | 27 | 57% | 93% |
| Mobile | abr→oct | 1.076 | 34 | 3%* | 0 | 21% | 18% | 9% | 3 | 82% | 100% |
| Portal | sep→oct | 173 | 11 | 10% | 0 | 44%† | **94%** | 45% | 3 | 50% | 99% |
| Devoluciones | jun→oct | 582 | 12 | 19% | 1 | 26% | 38% | 20% | 37 | 55% | 97% |
| Hub | jun→oct | 512 | 11 | 12% | 0 | 23% | 41% | 24% | 24 | 51% | 93% |
| Bot | feb→oct | 95 | 3 | 20% | 1 | 21% | 0% | 5% | 1 | 34% | 66% |
| Panel del bot | mar→oct | 135 | 6 | 28% | 0 | 34% | 5% | 2% | 6 | 30% | 69% |
| Bot personal | may→oct | 408 | 6 | 27% | 1 | 17% | 0% | 1% | 10 | 54% | 86% |
| Deptos | jul→oct | 347 | 8 | 14% | 0 | 35% | 45% | 18% | 9 | 61% | 86% |
| Portapapeles | may→jul | 147 | 9 | 1% | 0 | — (2 arreglos) | 0% | 0% | 0 | 22% | 78% |

\* En Mobile casi todo commit empieza con `v4(...)`, y ese prefijo esconde si es un arreglo: el 3% se
queda corto. † Portal tiene 18 arreglos en total; con tan pocos, el porcentaje se mueve mucho.

## Lo que muestra

**1. Casi no se revierte: se arregla para adelante.** Hay 4 reversiones en ~5.000 commits. Cuando algo
sale mal, el camino es otro commit encima, no volver atrás. Por eso lo que mide la calidad acá es el
"arreglo del arreglo", no las reversiones.

**2. 🆕 Uno de cada cuatro arreglos es arreglo de otro arreglo.** La mediana es **26%** (de 17% a 44%).
Es la línea base más directa del **objetivo 2** (menos fallas repetidas). En cuatro proyectos se ve
dónde se concentra:
- **Desktop**: 27 archivos se arreglaron 3 veces o más; los dos peores, 11 veces cada uno.
- **Devoluciones**: 37 archivos, casi todos pantallas de administración.
- **Hub**: 24 archivos; los cuatro editores tienen 5 arreglos cada uno, lo que sugiere un mismo error
  copiado en los cuatro.
- **Deptos**: el script que chequea la misión se arregló 5 veces.

**3. ⚠️🆕 El arreglo casi nunca trae su prueba.** Pasa en la mayoría de los proyectos. Un arreglo
trae su prueba:
- en 0-5% de los casos en los tres bots;
- en 18-22% en Desktop y Mobile, los proyectos largos, con todo su gate;
- en 38-45% en Devoluciones, Hub y Deptos.

La excepción es **Portal: 94%**, el proyecto más nuevo. Ahí la regla está viva. La radiografía mostró
que el revisor caza defectos en la 1.ª vuelta (§7.2). Esto muestra la otra cara: lo que se arregla
después no queda protegido con una prueba, y vuelve a romperse (punto 2).

**4. Más de la mitad de los commits solo tocan documentos.** Pasa en los proyectos con el método
completo: **51-82%**. En los que tienen poco método baja a 22-34%. No todo eso es costo del método:
adentro están los specs, que son trabajo real, y el script no los separa. Pero da la escala:
- en Mobile, 4 de cada 5 commits de la rama principal son documentos;
- en este mismo repo, que es el método, 5 de cada 6.

Línea base para los **objetivos 1 y 3**. Se cruza con los 36 cambios de método en 5 días de la
radiografía §6.4.

**5. El ritmo de los proyectos largos es otro.** Mobile hace 34 commits por día activo y Desktop 16;
el resto anda entre 3 y 12. Es coherente con los ~260 commits de un tramo que la radiografía midió en
~100 h.

**6. Claude es coautor de casi todo.** Lo es en 66-100% de los commits. Baja a 66-86% en los bots, Deptos
y el Portapapeles; el porqué no se midió.

## Límites

- El tipo de cada commit sale del asunto: un arreglo mal titulado no se cuenta (en Mobile pasa seguido).
- Solo cuenta la rama principal. El trabajo que todavía no se mergeó (los tramos abiertos de Desktop) no
  está.
- "Arreglo con prueba" sale del nombre de los archivos (`tests/`, `pruebas/`, `.test.`, `_test.`). Una
  prueba con otro nombre no se cuenta.
- En Bot cuentan solo los commits propios, desde que se separó de su base open source.
- Medido el 2026-10-14. El script se puede volver a correr todos los meses (pilar de medición del PLAN).

## Para el tramo 3: líneas base propuestas

| Objetivo | Medida | Hoy |
|---|---|---|
| 2 · Calidad | % arreglo del arreglo (72 h) | mediana 26% |
| 2 · Calidad | % arreglos con su prueba | 0-45% (Portal: 94%) |
| 2 · Calidad | Archivos con 3+ arreglos | 0-37 por proyecto |
| 3 · Documentable | % commits que solo tocan documentos | 51-82% con el método completo |
| 1 · Tokens | Commits por día activo de los proyectos largos | 16-34 |
