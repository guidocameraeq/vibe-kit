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

## Temporal — [`chats-mision-4/`](chats-mision-4/)

Los chats condensados en los que se diseñaron los racimos de la misión 4, guardados para la revisión del proceso de la misión 6. Se borra cuando la misión 6 los use. Qué hay y qué no: su [`LEEME.md`](chats-mision-4/LEEME.md).

## La misión en curso — [`mision-4/`](mision-4/)

| Archivo | Qué es |
|---|---|
| [`mision-4/PLAN.md`](mision-4/PLAN.md) | El plan de la misión 4 (diseñar el pack): objetivos, pilares, tramos y el brief del próximo tramo. Cada tramo deja acá su salida |
| [`mision-4/RADIOGRAFIA-director-obrero.md`](mision-4/RADIOGRAFIA-director-obrero.md) | Tramo 1: cómo está armado de verdad el sistema director/obrero (lo escrito contra lo que pasó), qué cuesta, qué falla, qué anda y 10 mejoras con su línea base |
| [`mision-4/FLOTA.md`](mision-4/FLOTA.md) | Tramo 2 (0): todos los proyectos — dónde viven, qué traen del método, sus skills propias, el tope del hook y las barreras |
| [`mision-4/REPOS.md`](mision-4/REPOS.md) | Tramo 2 (b): lo que cuenta el historial de git — arreglo del arreglo, arreglos con prueba, solo documentos; líneas base |
| [`mision-4/PLATAFORMA.md`](mision-4/PLATAFORMA.md) | Tramo 2 (a): qué de lo armado a mano ya es nativo de Claude Code (abrir sesiones, avisos, estado, entre PCs) |
| [`mision-4/TABLERO.md`](mision-4/TABLERO.md) | Tramo 3: el mapa por objetivos — todo lo investigado repartido por los 7 objetivos con su línea base, las 10 mejoras como construir o adoptar y 8 racimos para el diseño |
| [`mision-4/DISENO-A-frenos.md`](mision-4/DISENO-A-frenos.md) | Tramo 4, racimo A: las 4 cosas que se le preguntan a Guido, correctores contra preguntas, la receta de un freno, qué trae el molde y cómo se mide |
| [`mision-4/DISENO-C-salida-hacia-Guido.md`](mision-4/DISENO-C-salida-hacia-Guido.md) | Tramo 4, racimo C: silencio por defecto, `/estado` por proyecto y por subproyecto, la tabla de tiempos y quién estima |
| [`mision-4/DISENO-E-molde-y-flota.md`](mision-4/DISENO-E-molde-y-flota.md) | Tramo 4, racimo E: el Arquitecto como puerta única (skill + agentes + scripts), la ficha del kit por repo, el actualizador que nunca pisa una adaptación, adoptar proyectos, el Hub como registro y las dos capas (kit genérico · capa EQ privada) |
| [`mision-4/DISENO-F-seguridad.md`](mision-4/DISENO-F-seguridad.md) | Tramo 4, racimo F: nueve barreras de archivos que frenan también en bypass, un solo corrector de secretos por PC, "usar sin ver" (comandos que cargan la credencial), niveles de base dummy · prueba · real, las barreras son del proyecto con `hasta:`, "con permiso, igual con red", gitleaks en el pre-commit; verificado contra la doc oficial y revisado (26 hallazgos) |
| [`mision-4/DISENO-B-documentos.md`](mision-4/DISENO-B-documentos.md) | Tramo 4, racimo B: el sistema de documentación de cada proyecto. `docs/` en cuatro capas (plano de la app · sesión con tope · una carpeta por módulo con ficha e historia separadas · referencia y archivo), el hook de arranque con presupuesto de 9.500 caracteres y huella, el TODO que no miente, el cierre que cruza lo anunciado con lo anotado, el candado de estructura por script y el `CLAUDE.md` del molde reordenado por los 11 criterios; revisado (33 hallazgos) |
| [`mision-4/DISENO-D-director-obrero.md`](mision-4/DISENO-D-director-obrero.md) | Tramo 4, racimo D: el método director/obrero y el workflow diario de Guido, en un solo dialecto. Director por tamaño con triage en la puerta (sin agente PO), `/obrero` y `/tramo` con un núcleo común, modelo y esfuerzo por rol, quién abre las pestañas y el hook de autorizaciones, ramas y escritores (provisoria), silencio entre agentes y la noche, la revisión congelada con ≤2 vueltas, la mudanza medida por script ("compactar es una falla"), el gate como script, tres clases de decisión, y cómo entra el canon a cada proyecto; verificado contra la doc oficial y revisado (25 hallazgos) |
| [`mision-4/DISENO-G-mesa-y-pcs.md`](mision-4/DISENO-G-mesa-y-pcs.md) | Tramo 4, racimo G: la mesa entre directores de proyectos que comparten algo. El contenido va siempre por git (un archivo por mensaje dentro del módulo, que nunca se edita y cuyo estado calcula un script) y el aviso por mensaje es opcional; seis tipos de mesa en una tabla única; acuerdos que viven una vez y van al PO solo si cambian el alcance; recursos compartidos con dueño; `crossSessionInbound: accept` por el Equipador; dos personas con `fetch`, aviso de commits ajenos y commit por rutas; números de decisión por módulo; lecciones al repo; `aprueba:` por alias. Trae el brief del racimo **G.1** (el buzón multiagente, opt-in). Verificado contra la doc oficial y revisado (34 hallazgos) |
| [`mision-4/DISENO-H-niveles-y-puertas.md`](mision-4/DISENO-H-niveles-y-puertas.md) | Tramo 4, racimo H: lo chico se hace en el chat sin spec ni chat nuevo (una sola regla de tamaño, dicha por la sesión), lo que es más que chico entra por el Arquitecto, que termina armando el módulo y dando la línea de apertura; subproyecto = módulo con nombre; director solo si se escribe a la vez; entorno de prueba declarado y verificado por script; ramas y worktrees por script; tope del spec; prototipo antes del spec. Decisiones 7-14 provisorias; revisado (45 hallazgos) y contrastado con otros métodos |
| [`mision-4/REFERENCIAS-EXTERNAS.md`](mision-4/REFERENCIAS-EXTERNAS.md) | Tramo 4: qué hacen otros métodos agénticos (gentle-ai, agency-agents, MetaGPT), qué idea sirve a qué racimo y qué se descarta con su razón |

## De consulta — [`consulta/`](consulta/)

Material de referencia que no cambia con el trabajo diario.

| Archivo | Qué es |
|---|---|
| [`consulta/referencia-prompts-fyd.md`](consulta/referencia-prompts-fyd.md) | Los prompts originales de FyD Sistemas, textuales. **No está bajo la licencia MIT** (ver `NOTICE`) |
| [`consulta/EVALUACION-docs-fyd-v2.md`](consulta/EVALUACION-docs-fyd-v2.md) | El protocolo para evaluar `docs-fyd` (corrido 2026-07-24: PASS); sirve para la próxima evaluación |

Lo ya consumido (prompts de arranque, presupuestos, relatos de uso) no vive acá: está en
[`../legacy/`](../legacy/) con su lápida.
