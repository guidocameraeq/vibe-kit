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
| [`CICLO-DE-MEJORA.md`](CICLO-DE-MEJORA.md) | El ciclo de mejora del método: cuándo arranca una vuelta, sus 5 pasos, qué sale y cuánto cuesta cada uno, cómo trabajamos de verdad en la vuelta 1, las lecciones por paso y las plantillas | Al arrancar una vuelta (cada 3-4 meses) o al planear un paso grande |

## Los planos (SPEC)

Se quedan acá aunque estén implementados: su línea de Estado dice `✅ IMPLEMENTADO` y sus criterios se
siguen consultando (ADR-020). El Arquitecto busca borradores en `docs/SPEC-*.md`. Los del kit v3 viven en su
carpeta de versión (abajo): pedido de Guido, "una carpeta de la versión".

| Archivo | De qué |
|---|---|
| [`SPEC-docs-fyd.md`](SPEC-docs-fyd.md) · [`SPEC-docs-fyd-v2.md`](SPEC-docs-fyd-v2.md) | El motor `/docs-fyd` y su v2 (dudas por opciones) |
| [`SPEC-relevamiento.md`](SPEC-relevamiento.md) | `/relevamiento` — incluye los 21 criterios del estreno y la Fase 2 |
| [`SPEC-investigacion-chats.md`](SPEC-investigacion-chats.md) | La investigación de los chats (misión 2) y la hoja de ruta |
| [`SPEC-profesionalizar-repo.md`](SPEC-profesionalizar-repo.md) | El orden de este repo (misión 3) |

## El kit v3 — [`kit-v3/`](kit-v3/)

El plano de la misión 5 y todo lo que se escriba para construirlo. Los specs delta de cada paquete van al lado (`SPEC-paquete-N.md`).

| Archivo | Qué es |
|---|---|
| [`kit-v3/SPEC-0-kit-v3.md`](kit-v3/SPEC-0-kit-v3.md) | **El kit v3, el pack** (misión 4, tramo 5; **READY** el 2026-10-27, tras 3 rondas de red team y revisor frío): nueve paquetes con su estado en la ficha, scripts y candados, el orden de construcción de la misión 5, la medición, "Lo que hacés vos de nuevo" y lo NO VERIFICADO con su cuándo. En su carpeta de versión, con la [guía](kit-v3/GUIA-KIT-V3.md); los specs delta de la misión 5 van al lado (`SPEC-paquete-N.md`) |
| [`kit-v3/GUIA-KIT-V3.md`](kit-v3/GUIA-KIT-V3.md) | La guía del kit v3: el repaso charlado con Guido (2026-10-27), cinco partes en el orden de su workflow, con lo medido. Junto al spec del kit v3 |
| [`kit-v3/SPEC-paquete-1.md`](kit-v3/SPEC-paquete-1.md) | Spec delta del paquete 1 (sellado por Guido el 2026-10-28): la ficha del kit y su gramática cerrada, el parser `ficha.cjs`, `kit/VERSION` y `pruebas/rehacer.sh`, con sus encargos |
| [`kit-v3/SPEC-paquete-2.md`](kit-v3/SPEC-paquete-2.md) | Spec delta del paquete 2 (sellado por Guido el 2026-10-28, tres rondas de red team): docs en capas, handoff y TODO con tope, hook de arranque en node, hook de escritura, candado, `cambios aprobar`, zona propia, `/inicio` y `/cierre` v3; partido en D2.1 y D2.2, con los cruces contra los diseños |
| [`kit-v3/SPEC-paquete-3.md`](kit-v3/SPEC-paquete-3.md) | Spec delta del paquete 3, seguridad (**sellado sin Guido, provisorio**, por D3.1 el 2026-10-29, tras dos rondas de red team): corrector de secretos por PC, hook de git, las 5 de A desde la ficha, pre-commit y pre-push, `cargar-secreto`, guardia de `db`, instalador por PC y `doctor` mínimo; las decisiones D-1 a D-15 |
| [`kit-v3/SPEC-paquete-5.md`](kit-v3/SPEC-paquete-5.md) | Spec delta del paquete 5, el canon director/obrero (**sellado sin Guido, provisorio**, por D5.1 el 2026-10-30, tras una ronda de red team): partido en D5.1 "el día" (núcleo, `/director`, `/obrero`, `encargo.cjs`, `integrar`) y D5.2 "la noche y las vistas" (`/estado`, resumen del día, la mesa, subagentes); las decisiones D5-1 a D5-19 |
| [`kit-v3/SPEC-paquete-6.md`](kit-v3/SPEC-paquete-6.md) | Spec delta del paquete 6, el Equipador v3 y el actualizador (**sellado sin Guido, provisorio**, por D6.1 el 2026-11-02, tras una ronda de red team): "preparame esta PC", el `doctor` completo, `aplicar` y `chequear` (D6.1), la flota de punta a punta y el adoptador (D6.2); las decisiones D6-1 a D6-18 (D6-1: nadie corre en bypass) |
| [`kit-v3/SPEC-paquete-8.md`](kit-v3/SPEC-paquete-8.md) | Spec delta del paquete 8 (sellado sin Guido por script el 2026-11-03, sin red team): `flota.py` lee la ficha, la corrida mensual de la línea base, PLAYBOOK §1.5 con los dos ejes, la guía y una página de manual por pieza, las notas en los diseños y el ADR-033 |
| [`kit-v3/DECISIONES-SIN-GUIDO-en-criollo.md`](kit-v3/DECISIONES-SIN-GUIDO-en-criollo.md) | Las ~150 decisiones que los directores de la misión 5 tomaron sin Guido, explicadas en criollo: las que le afectan (por tema) y las técnicas; para repasarlas antes del release (pedido de Guido, 2026-11-03) |
| [`kit-v3/REVISION-INTEGRAL-rc1.md`](kit-v3/REVISION-INTEGRAL-rc1.md) | La revisión integral de la beta `v3.0.0-rc.1` (R1, 2026-11-03, ADR-034): el kit entero con tres miradas; lo que traba la adopción de Hermes, lo que le cambia algo a Guido, lo de taller y dos preguntas |
| [`kit-v3/REVISION-INTEGRAL-rc2.md`](kit-v3/REVISION-INTEGRAL-rc2.md) | La segunda revisión integral, sobre la `v3.0.0-rc.2` (R1b, la noche del 2026-11-03, ADR-034), con el día de Guido corrido sobre un clon de Hermes: 4 decisiones de diseño para Guido (D1-D4) y la tanda de taller D8r.2 |
| [`kit-v3/SPEC-paquete-8r.md`](kit-v3/SPEC-paquete-8r.md) | Spec delta del paquete 8r (sellado sin Guido por script el 2026-11-03, red team 1 ronda): la tanda de correcciones de la revisión integral R1 (T1-T4, los 8 que le cambian algo a Guido, lo de taller, las 2 preguntas con su opción A) y la beta `v3.0.0-rc.2` |
| [`kit-v3/SPEC-paquete-7.md`](kit-v3/SPEC-paquete-7.md) | Spec delta del paquete 7 (sellado sin Guido por script el 2026-11-02, red team 1 ronda; ✅ IMPLEMENTADO): `subio-al-kit` y `kit/cubiertos.md`, `cambios-flota` y `--urgentes`, la migración de un `CAMBIOS.md` único (Hermes), la portada (`portada.cjs`, `candado:portada`) |
| [`kit-v3/PLAN-construccion.md`](kit-v3/PLAN-construccion.md) | **El tracker de la misión 5**: el estado por paquete, una fila por director (ADR-028), los pendientes, los NO VERIFICADO y los 20 criterios para tachar. Cada sesión de la misión 5 lo lee al abrir y lo actualiza al cerrar |

## La misión 4, el diseño del pack — [`mision-4/`](mision-4/)

Cerrada el 2026-10-27. Se queda acá porque el spec del kit v3 la cita como fuente (`DISENO-X §n`) y la misión 5 la consulta.

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

## La misión 6, el ciclo de mejora — [`mision-6/`](mision-6/)

| Archivo | Qué es |
|---|---|
| [`mision-6/PLAN-6a.md`](mision-6/PLAN-6a.md) | La 6a, fase 1: el inventario de los chats de las misiones 1-5, lo que costó cada misión y cada paso, el costo de leer los chats en tres opciones y el índice del documento del ciclo |

## De consulta — [`consulta/`](consulta/)

Material de referencia que no cambia con el trabajo diario.

| Archivo | Qué es |
|---|---|
| [`consulta/referencia-prompts-fyd.md`](consulta/referencia-prompts-fyd.md) | Los prompts originales de FyD Sistemas, textuales. **No está bajo la licencia MIT** (ver `NOTICE`) |
| [`consulta/EVALUACION-docs-fyd-v2.md`](consulta/EVALUACION-docs-fyd-v2.md) | El protocolo para evaluar `docs-fyd` (corrido 2026-07-24: PASS); sirve para la próxima evaluación |

Lo ya consumido (prompts de arranque, presupuestos, relatos de uso) no vive acá: está en
[`../legacy/`](../legacy/) con su lápida. Lo crudo (los chats condensados de la misión 4, los informes de revisión del spec,
el diario de misiones) vive en el repo privado de investigación desde la misión 4½ (ADR-025).
