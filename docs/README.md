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

## De consulta — [`consulta/`](consulta/)

Material de referencia que no cambia con el trabajo diario.

| Archivo | Qué es |
|---|---|
| [`consulta/referencia-prompts-fyd.md`](consulta/referencia-prompts-fyd.md) | Los prompts originales de FyD Sistemas, textuales. **No está bajo la licencia MIT** (ver `LICENSE`) |
| [`consulta/EVALUACION-docs-fyd-v2.md`](consulta/EVALUACION-docs-fyd-v2.md) | El protocolo para evaluar `docs-fyd` (corrido 2026-07-24: PASS); sirve para la próxima evaluación |

Lo ya consumido (prompts de arranque, presupuestos, relatos de uso) no vive acá: está en
[`../legacy/`](../legacy/) con su lápida.
