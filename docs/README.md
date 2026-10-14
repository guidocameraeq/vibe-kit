# docs/ — el índice

Qué hay en esta carpeta, qué es cada cosa y cuándo leerla. El repo en general: [`../README.md`](../README.md).

## Estado del proyecto (se actualizan en cada `/cierre`)

| Archivo | Qué es | Cuándo leerlo |
|---|---|---|
| [`SESSION_HANDOFF.md`](SESSION_HANDOFF.md) | El "save game": dónde quedó la última sesión | Lo inyecta el hook al abrir un chat; a mano, casi nunca |
| [`TODO.md`](TODO.md) | **La única lista de pendientes**, por prioridad | Para saber qué falta |
| [`CHANGELOG.md`](CHANGELOG.md) | La historia: una entrada por sesión, con la versión si hubo tag | Para saber qué cambió y cuándo |
| [`DECISIONS.md`](DECISIONS.md) | Los ADR: por qué el kit es como es (índice al tope) | Antes de cambiar algo que parece raro |
| [`REJECTED.md`](REJECTED.md) | Lo descartado, con su razón y cuándo reabrirlo | Antes de proponer algo "nuevo" |

## El norte

| Archivo | Qué es | Cuándo leerlo |
|---|---|---|
| [`MISION-Y-VISION.md`](MISION-Y-VISION.md) | Para qué existe el repo, para quién, qué NO hace | La primera vez, o si se duda del rumbo |

## Los planos (SPEC)

Se quedan acá aunque estén implementados: su línea de Estado dice `✅ IMPLEMENTADO` y sus criterios se
siguen consultando (ADR-020). El Arquitecto busca borradores en `docs/SPEC-*.md`.

| Archivo | De qué |
|---|---|
| [`SPEC-docs-fyd.md`](SPEC-docs-fyd.md) · [`SPEC-docs-fyd-v2.md`](SPEC-docs-fyd-v2.md) | El motor `/docs-fyd` y su v2 (dudas por opciones) |
| [`SPEC-relevamiento.md`](SPEC-relevamiento.md) | `/relevamiento` — incluye los 21 criterios del estreno y la Fase 2 |
| [`SPEC-investigacion-chats.md`](SPEC-investigacion-chats.md) | La investigación de los chats (misión 2) y la hoja de ruta |
| [`SPEC-profesionalizar-repo.md`](SPEC-profesionalizar-repo.md) | El orden de este repo (misión 3) |

## La misión en curso — [`mision-4/`](mision-4/)

| Archivo | Qué es |
|---|---|
| [`mision-4/PLAN.md`](mision-4/PLAN.md) | El plan de la misión 4 (diseñar el pack): objetivos, pilares, tramos y el brief del próximo tramo. Cada tramo deja acá su salida |
| [`mision-4/RADIOGRAFIA-director-obrero.md`](mision-4/RADIOGRAFIA-director-obrero.md) | Tramo 1: cómo está armado de verdad el sistema director/obrero (lo escrito contra lo que pasó), qué cuesta, qué falla, qué anda y 10 mejoras con su línea base |
| [`mision-4/FLOTA.md`](mision-4/FLOTA.md) | Tramo 2 (0): todos los proyectos — dónde viven, qué traen del método, sus skills propias, el tope del hook y las barreras |
| [`mision-4/REPOS.md`](mision-4/REPOS.md) | Tramo 2 (b): lo que cuenta el historial de git — arreglo del arreglo, arreglos con prueba, solo documentos; líneas base |
| [`mision-4/PLATAFORMA.md`](mision-4/PLATAFORMA.md) | Tramo 2 (a): qué de lo armado a mano ya es nativo de Claude Code (abrir sesiones, avisos, estado, entre PCs) |
| [`mision-4/TABLERO.md`](mision-4/TABLERO.md) | Tramo 3: el mapa por objetivos — todo lo investigado repartido por los 7 objetivos con su línea base, las 10 mejoras como construir o adoptar y 8 racimos para el diseño |

## De consulta — [`consulta/`](consulta/)

Material de referencia que no cambia con el trabajo diario.

| Archivo | Qué es |
|---|---|
| [`consulta/referencia-prompts-fyd.md`](consulta/referencia-prompts-fyd.md) | Los prompts originales de FyD Sistemas, textuales. **No está bajo la licencia MIT** (ver `NOTICE`) |
| [`consulta/EVALUACION-docs-fyd-v2.md`](consulta/EVALUACION-docs-fyd-v2.md) | El protocolo para evaluar `docs-fyd` (corrido 2026-07-24: PASS); sirve para la próxima evaluación |

Lo ya consumido (prompts de arranque, presupuestos, relatos de uso) no vive acá: está en
[`../legacy/`](../legacy/) con su lápida.
