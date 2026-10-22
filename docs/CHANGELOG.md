# CHANGELOG — vibe-kit

> Historia permanente. `/cierre` agrega una entrada AL TOPE en cada sesión; si hubo tag de versión, el título lo dice (` · vX.Y`). Orden descendente estricto. Nada de versiones duplicadas en otros docs. El porqué de cada cosa está en los ADR citados.

## 2026-10-22 — Misión 4, tramo 4: el racimo F (seguridad por defecto), revisado y con tres correcciones de Guido

### Added
- `docs/mision-4/DISENO-F-seguridad.md`, el racimo F, aprobado por Guido en bloque, corregido por él en tres puntos y
  revisado por dos lectores.
  - **Nueve barreras de archivos de fábrica** en el `settings.json` del molde (`.env`, `secrets/`, `*.pem`, `*.key`,
    `~/.ssh`, `~/.aws`, la config de `gh`), verificadas contra la doc oficial: frenan en todos los modos, incluido
    bypass; ningún nivel las anula. Sin reglas `ask` ni `Bash(...)`. Lo público va a un archivo con nombre no secreto.
  - **Un solo corrector de secretos por PC**: el hook que Guido armó a mano en esta PC, extendido a Write y Edit
    (cerraba H-161), instalado por el Equipador, con mensaje que da la alternativa, medido contra el historial antes
    de instalar, y leyendo la ficha para las excepciones.
  - **Usar sin ver** (corrección de Guido): comandos del proyecto (`db consulta`, `db migrar`, `db foto`) que cargan
    la credencial por adentro; Claude conoce el nombre de la variable, nunca el valor. `cargar-secreto` con entrada
    oculta para el humano. Las consultas y migraciones pasan de Guido a los obreros.
  - **Niveles de base** en la ficha (`entornos:` dummy · prueba · real), `secretos:`, `publicas:`,
    `datos-de-prueba:`, `push-publica:`. Una base dummy se declara en una línea.
  - **Las barreras son del proyecto** (corrección de Guido): `frenos.quitados` con id, razón y `hasta:` (`siempre` o
    fecha); los hooks y el actualizador lo leen; el vencimiento va a la salida única de C.
  - **Con permiso, igual con red** (corrección de Guido): foto verificada, transacción, rastro y revisión del plan
    (director o subagente fresco) antes de tocar una base real. Escribir en real no es pregunta; borrar sí (A §2).
  - gitleaks en el pre-commit versionado (`core.hooksPath` lo setea el arranque), `.gitleaksignore` vigilado, el
    arranque declara modo y barreras por lista de reglas, el bypass no se traba, una página de runbook "se filtró una
    credencial", tabla de medición y los 11 criterios con honestidad.
  - **§22, la revisión**: revisor frío (Opus, ~136 mil tokens) y lector de gentle-ai (Sonnet, ~128 mil): 26 hallazgos,
    9 que rompían (entre ellos una pregunta a Guido escondida); Guido pidió pasarlos por el criterio de diseño antes de
    aplicar: 24 aplicados, 1 fundido, 1 descartado por "por las dudas". Mecánica de `deny`, hooks y modos verificada
    contra la doc oficial con el agente `claude-code-guide` (2 tandas, ~234 mil tokens), con fuentes en §4.

### Changed
- `PLAN.md`: el tramo 4 marca ✅ F; una lección nueva (la regla de Guido de filtrar los hallazgos por el criterio
  establecido; verificar la plataforma contra la doc antes de decidir).
- `DISENO-E-molde-y-flota.md`: lo quitado pasa a un solo campo (`frenos.quitados`, unificado por F §14); el
  actualizador rehace una rama rota borrándola y subiéndola de nuevo, sin `push --force`.
- `DISENO-A-frenos.md` §4: ubicación propuesta por F para el registro de frenos (`docs/frenos.log`), a decidir en la
  revisión integral.
- `docs/README.md`: fila del DISENO-F. `docs/TODO.md`: F ✅, sigue B.
- El kit instalado en esta PC estaba viejo (del 3 de agosto; nadie había corrido el sync después de la misión 3): se
  sincronizó con `kit-sync.sh sync`, LIMPIO. Y la sesión arrancó con los dos commits del director del Hub ya en
  `origin/main` (contrato del registro, dos llaves): traídos con avance limpio antes de cerrar.

## 2026-10-22 — Misión 4, tramo 4: el racimo E (molde y flota), los 11 criterios y el ecosistema aparte

### Added
- `docs/mision-4/DISENO-E-molde-y-flota.md`, el racimo E, aprobado por Guido decisión por decisión y revisado.
  - **El Arquitecto como puerta única**: una skill que rutea 5 entradas (PC · proyecto nuevo · feature · consultorio ·
    flota) y deriva a piezas chicas; agentes como manos, scripts como ojos, sin memoria propia. Resuelve de frente el
    choque con ADR-004 y REJ-003 (el ADR se escribe al construir).
  - **La ficha del kit** por repo (`.claude/kit.md`): versión, `vars` de instanciación, estado y hash por pieza
    (`molde` · `molde+propio` · `adaptada` · `propia`), los frenos y lo sensible que pedía el racimo A. Una sola ficha.
  - **El actualizador**: clon temporal, regenera el molde sin pisar adaptaciones (zona `<!-- kit:propio -->`, archivo
    hermano para hooks, `settings.json` a tres puntas con `quitado:`), chequeo mecánico, mezcla a `main` si pasa, una
    línea en el CHANGELOG del proyecto, tabla final. Sin preguntas: reversible.
  - **Adoptar** un proyecto que ya anda (una pantalla y un "dale"), `kit/VERSION` con notas de migración, el hook que
    avisa versión nueva en las dos direcciones, el Equipador atrás de la puerta con `doctor`, `/smoke` y `/release`
    como contrato que no nace el día cero, `AGENTS.md` opt-in.
  - **El Hub como registro de la empresa** (4 pedidos: `repo`, `tipo`, "se conecta con", credencial de solo lectura)
    y las dos capas: kit genérico público · capa privada de la empresa. El actualizador no necesita el Hub.
  - **§16, la revisión**: un revisor frío (Opus) y una lectura del instalador de gentle-ai trajeron 17 hallazgos
    (4 que rompían el diseño); Guido aprobó 15 enteros y 2 recortados. **§17**: la tabla de los 11 criterios.
- `PLAN.md` §El foco: **la forma de pensar que pidió Guido** (filtro de 4 preguntas, recortar en vez de aplicar todo,
  partir de lo que existe, roles por la pregunta que responden) y **los 11 criterios de cada racimo**, con la regla
  de que cada `DISENO-*` cierra con su tabla y de la revisión integral al terminar el tramo 4.

### Changed
- `PLAN.md`: **el agente de ecosistema no es parte del Arquitecto** (decisión de Guido): va al racimo I, el último;
  orden A → C → E → F → B → D → G → H → I; el tramo 4 marca ✅ E; una lección nueva para el ciclo (el revisor frío va
  después de las decisiones de cada racimo).
- `TABLERO.md` §10: fila del **racimo I** con lo ya decidido (Hub como registro, dos agentes que se hablan, dónde
  vive); nota para el **racimo B** con las preguntas de carpetas del Hub (`docs/specs/`, carpeta de referencia) y cómo
  las resolvió ese mismo día.
- `DISENO-A-frenos.md` §6: apunta a la ficha del kit de E como la misma ficha que pedía.
- `docs/README.md`: fila del DISENO-E. `docs/TODO.md`: el Hub ya le puso tope a su hook; falta el Panel.
- Fuera del repo: brief entregado al director del Hub (sesión en esta PC) con los 4 pedidos y el concepto del agente
  de ecosistema; respondidas sus 5 preguntas de convención de carpetas separando lo firme del kit de lo abierto.

## 2026-10-21 — Misión 4, tramo 4: el norte del diseño y los racimos A y C

### Added
- `docs/mision-4/DISENO-A-frenos.md`, el racimo A.
  - **Decisión de Guido**: un agente le pregunta solo 4 cosas (borrar datos reales, tocar plata, manejar
    claves, mandar algo hacia afuera a su nombre).
  - Hay correctores y hay preguntas. Un corrector se pone recién a la segunda vez que se repite un
    error, y se saca si molesta más de lo que salva.
  - La receta de un freno sale del piloto de Desktop.
  - El molde trae de fábrica las 4 preguntas y el freno contra git destructivo.
  - El director verifica con scripts y los encargos van por referencia.
- `docs/mision-4/DISENO-C-salida-hacia-Guido.md`, el racimo C.
  - Silencio por defecto y un resumen de fin de día.
  - `/estado <proyecto>` y `/estado <subproyecto>`; sin nombre, sale del contexto de la pestaña.
  - La tabla de tiempos tiene estimado, real de máquina, real con Guido, tokens y complejidad.
  - **Estima el director, no un script** (corrección de Guido).
- `docs/mision-4/REFERENCIAS-EXTERNAS.md`, el mapa de gentle-ai, agency-agents y MetaGPT.
  - 8 ideas nuevas, cada una con su racimo.
  - Los descartes, con su razón. Engram quedó en espera para el racimo B.

### Changed
- `PLAN.md`:
  - **el norte para todas las decisiones** (Guido casi no interviene; ningún freno de adorno; decisiones
    en criollo);
  - el orden de los racimos (A → C → E → F → B → D → G → H);
  - la mensajería multiagente como pilar del racimo G.
- `TABLERO.md`: el buzón multiagente (objetivo 5, racimo G) y los **subproyectos dentro de un proyecto**
  (racimo H).
- `docs/README.md`: las filas de los 3 archivos nuevos.
- Fuera del repo:
  - vibe-kit se registró en el buzón piloto de la organización y contestó;
  - el kit se sincronizó en la notebook (`kit-sync` en LIMPIO).

## 2026-10-21 — Misión 4: checkpoint para mudarse de PC

### Changed
- `RADIOGRAFIA-director-obrero.md`, Anexo A.5: el estado del piloto, pedido a los dos directores en un
  mensaje con formato fijo y verificado en su git.
  - **Desktop**: el segundo freno (CM-65, git destructivo) y el trinquete de atribuciones, los dos ya
    aplicados; el A.4 se corrigió, porque los daba "en curso" y "sin aplicar".
  - **Mobile**: sin cambios de método desde D-194, con 8 hallazgos de reglas blandas. En H-161, un subagente
    rodeó un freno cambiando de herramienta.
  - Dos recetas nuevas para el racimo A: cubrir todas las herramientas, y que los permisos no desmientan la
    regla.
- `PLAN.md`: una lección para el ciclo. Pedir novedades con formato fijo anda; los avisos sueltos a una
  sesión cerrada, no.
- El handoff, reescrito para arrancar el tramo 4 en la PC `Usuario` (pull, sync del kit, gitleaks). El TODO
  quedó al día.
- El repo privado `vibe-research` subió las alertas al 21/10, así la otra PC las tiene.

## 2026-10-19 — Misión 4: el primer freno mecánico medido (Desktop)

### Changed
- `RADIOGRAFIA-director-obrero.md`, Anexo A.4. La tabla de CM-63 está hecha (verificado). CM-64 convirtió
  una regla blanda en un hook: contra 37.842 comandos reales dio 0 falsos positivos y habría frenado
  ~2.500, o sea que la regla blanda se rompía en ~6,6% de los comandos. Nace la receta "medir el freno
  contra el historial antes de instalarlo". Además, un cambio de método rompió un control propio, por
  segunda vez en la semana. El handoff apunta ahí; la alerta de caída a producción, ahora ocurrida, va
  solo al archivo privado.

## 2026-10-15 — Misión 4: Desktop también va a medir sus reglas nuevas

### Changed
- Decisión de Guido: Desktop no queda como contraste. En su próximo cierre agrega a la ficha de CM-63 la
  tabla "freno o regla blanda · cómo se mide", así los dos proyectos juntan datos comparables. El pedido
  salió por la mesa. Que esté hecho: no verificado. Quedó registrado en la radiografía (Anexo A.3) y en
  el handoff.

## 2026-10-15 — Misión 4: Desktop adopta parte del cambio (CM-63)

### Changed
- `RADIOGRAFIA-director-obrero.md`, Anexo A.3: Desktop adoptó en un día las reglas de procesos de Mobile y
  pasó una regla a la definición del agente, porque avisada en cada encargo había fallado ~5 veces.
  Quedaron dos dialectos de la misma regla, y Desktop no adoptó P1 + P2, lo que deja un contraste para
  medir el piloto. Verificado en git. El handoff apunta ahí.

## 2026-10-15 — Misión 4: primeros datos del piloto de Mobile

### Changed
- `RADIOGRAFIA-director-obrero.md`, Anexo A.2: D-192 está escrito (verificado en git). Trae la primera
  falla del piloto (H-152: el cambio de método rompió otro control en un día; la cazó la medición de la
  línea base) y una regla que quedó con dos definiciones (H-151). El handoff apunta ahí.

## 2026-10-14 — Misión 4: la lista final de Mobile en la radiografía

### Changed
- `RADIOGRAFIA-director-obrero.md` suma el Anexo A.1, con la lista final que aprobó Mobile (D-192). Las
  dos sugerencias de la radiografía quedaron aceptadas: cada regla dice si es freno o regla blanda, y cómo
  se sabrá si funcionó (P1 + P2), y la regla contra esquivar controles va en la definición del
  implementador. El handoff lo anota como piloto para el tramo 4.

## 2026-10-14 — Misión 4, tramo 3: el mapa por objetivos

### Added
- `docs/mision-4/TABLERO.md` reparte todo lo investigado entre los 7 objetivos, cada cosa con su línea base:
  P1-P57, las 10 mejoras de la radiografía, el tramo 2, el Anexo A y 50 hallazgos nuevos del barrido.
  - Una tabla de líneas base que se repiten cada mes con los scripts de `observatorio/investigacion/`.
  - Las 10 mejoras marcadas: 4 adoptar, 4 construir y 2 mixtas.
  - 8 racimos como entrada al tramo 4.
  - Lo que no se rompe y lo que queda afuera.
- El barrido: 3 lectores Sonnet sobre las 5 síntesis, contra un índice de lo ya cubierto. Costó ~405 mil
  tokens (1,6× lo estimado).

### Changed
- `PLAN.md`: el tramo 3 quedó ✅ y hay 2 lecciones nuevas para el ciclo.
- `docs/README.md`: fila de `TABLERO.md`.

## 2026-10-14 — Misión 4: anexo de la radiografía (novedades de Mobile)

### Added
- `RADIOGRAFIA-director-obrero.md`, Anexo A: los 11 cambios al método que Mobile aprobó el 10-14, que
  mandó su director de parte de Guido. Cada uno está cruzado con la radiografía (3 mejoras ya en piloto,
  2 hallazgos nuevos) y marcado como freno o prosa (solo 1 es freno). El brief del tramo 3 en `PLAN.md`
  ya lo incluye.

## 2026-10-14 — Misión 4, tramo 2: la evidencia de afuera

### Added
- `docs/mision-4/FLOTA.md`: el inventario de los proyectos, armado por script sobre GitHub. Muestra:
  - 3 dialectos de director/obrero;
  - que ningún proyecto marca su versión del método;
  - que el hook de arranque del molde no tiene tope (dos proyectos se pasan del corte de la plataforma);
  - que el molde no trae reglas `deny`;
  - que `/smoke` y `/release` ya pasaron la regla de 3+.
- `docs/mision-4/REPOS.md`: lo que cuenta el historial de git de 10 proyectos (arreglo del arreglo: 26%
  de mediana; arreglos con prueba: 0-45%; commits de solo documentos: 51-82%). Son las líneas base del
  objetivo 2.
- `docs/mision-4/PLATAFORMA.md`: qué de lo armado a mano ya es nativo de Claude Code (abrir sesiones,
  avisos, estado, mensajes entre PCs, frontmatter de subagentes, barreras, plugins, esfuerzo y caché).
  Lo hizo el agente `claude-code-guide`: ~312 mil tokens, 3× lo estimado. El chat principal verificó las
  2 páginas clave.
- `observatorio/investigacion/`: `flota.py`, `huella.py` y `repos.py`, para repetir la medición.
- TODO 🔴: ponerle tope al hook de arranque del molde (fuera de la misión 4).

### Changed
- `PLAN.md`: el tramo 2 quedó ✅, el brief del tramo 3 dice qué entra del tramo 2, y hay 2 lecciones
  nuevas para el ciclo.
- `docs/README.md` y `observatorio/investigacion/METODO.md`: sus filas nuevas.

## 2026-10-14 — Misión 4, tramo 1: la radiografía de director/obrero

### Added
- `docs/mision-4/RADIOGRAFIA-director-obrero.md`: cómo está armado de verdad el sistema director/obrero
  de los dos proyectos largos, comparando lo escrito con lo comportado. Trae costo, fallas por causa, lo
  que no hay que romper, los dos dialectos del método, 10 hallazgos nuevos y 10 mejoras con su línea base
  (para el mapa del tramo 3). Costó ~452 mil tokens, con 2 lectores Opus.
- `docs/mision-4/PLAN.md`: la sección "Lecciones para el ciclo", con 4 lecciones de la misión 3 y una
  del tramo 1. El plan mismo, el tramo 0 (la biblioteca privada) y el inventario de la flota se habían
  armado antes ese día, en los commits `21eee8c`..`da07786`.
- TODO: la **misión 6, escribir el ciclo de mejora del método** (pedido de Guido).

### Changed
- `PLAN.md`: el tramo 1 quedó ✅, y el brief ahora apunta al mapa del tramo 3 (decía "tramo 2").
- `docs/README.md`: la fila de la radiografía.
- `/inicio` y `/cierre` del repo (no los del kit): el handoff trae el título de la sesión siguiente
  (`vibe-kit M<n> · <qué hace>`) y `/inicio` lo pone al confirmar la misión. Lo pidió Guido.

## 2026-10-13 — Misión 3: el repo se ordena

### Added
- **La portada se viste**: banner y diagrama con estilo de plano de arquitecto (`assets/`), insignias
  que se actualizan solas, un día de trabajo de ejemplo y los principios. El nombre del proyecto queda
  abierto (Guido lo decide más adelante).
- En GitHub: la descripción "About" nueva y las etiquetas `claude-code`, `vibe-coding`, `claude-skills`,
  `metodo`; la imagen para compartir (Social preview) subida. Se genera desde el banner y no se versiona
  (REJ-010).
- `docs/MISION-Y-VISION.md` (para qué existe, para quién, qué NO hace) · `docs/TODO.md` · este CHANGELOG ·
  `docs/README.md` (índice de `docs/`) · índice al tope de `DECISIONS.md` · `LICENSE` (MIT pura, para que GitHub la reconozca) + `NOTICE` (la excepción del texto de FyD) · ADR-023.
- `observatorio/` con su README: el Extractor y la investigación, juntos.
- `.claude/scripts/kit-sync.sh`: compara y sincroniza kit↔`~/.claude/` conservando la carpeta de
  proyectos de cada PC (antes, el `cp -r` del `/cierre` la pisaba).

### Changed
- README: solo portada, sin pendientes, historial ni versión. Pendientes → `docs/TODO.md` (REJ-005
  reabierto); versiones → este archivo.
- `guias/` → `manuales/`; la guía del Extractor, al lado de su herramienta; `docs/consulta/` para lo de
  referencia.
- El hook, `/inicio` y `/cierre` del repo siguen el molde de los proyectos del Arquitecto.
- Kit: la carpeta de proyectos del Arquitecto es un lugar vacío (`{{CARPETA_DE_PROYECTOS}}`) que llena
  el instalador; `/relevamiento` corrige la autoría de las plantillas (de Guido, aprobadas por su jefe).
  Sin bump: solo textos.

### Fixed
- REJ-006 marcado como reabierto (el repo lleva `/inicio` desde ADR-013) · el CLAUDE.md suma "Comandos
  clave" como los proyectos · rutas viejas de la carpeta "Guia de vibe coding" en el Extractor y los templates.

### Removed
- `docs/PRESUPUESTO-relevamiento.md` → `legacy/`, con lápida.

## 2026-10-12/13 — Misiones 1 y 2: la investigación de los chats

### Added
- `docs/SPEC-investigacion-chats.md` y la hoja de ruta de 5 misiones (ADR-021).
- `tips/tanda-2026-10-chats.md`: 68 hallazgos + anexo de la PC del compañero, 57 propuestas (ADR-022).
- El método escrito con sus scripts y la medición de costos (hoy en `observatorio/investigacion/`).

## 2026-08-03 — `/relevamiento` · v2.3 → v2.4.2

### Added
- **v2.3**: la skill `/relevamiento`, el tramo de ANTES del Arquitecto: método de arranque de 4 etapas
  con PDF por etapa, revisor de 6 chequeos, 9 lentes con gatillo por cita y costura al Arquitecto por
  token explícito (ADR-016, ADR-017).
- **v2.4**: el abanico de 6 salidas (construir es solo una), arrancar desde material que ya existe, la
  regla de oro de la hoja de campo (ADR-018).

### Fixed
- **v2.4.1**: la detección de Chrome, con evidencia medida (`where chrome` devuelve vacío; anda el
  respaldo a las 3 rutas conocidas).
- **v2.4.2**: las 4 secciones huérfanas del TABLERO ya tienen quién las escriba; las tareas pendientes
  se guardan cuando aparecen (ADR-019).

### Changed
- Convención documental del repo: los SPEC implementados se marcan y se quedan; lo consumido va a
  `legacy/` (ADR-020). Se retiró el zip portable.

## 2026-07-24 — `docs-fyd` y el Equipador auto-actualizable · v2.2, v2.2.1

### Added
- **v2.2**: `docs-fyd`, la documentación de auditoría FyD por repo, con las dudas resueltas por
  opciones (construido 2026-07-23, 16/16 verificado — ADR-014, ADR-015) · el Equipador se
  auto-actualiza (`actualizate`).

### Fixed
- **v2.2.1**: la checklist proactiva de `docs-fyd` queda condicionada al repo (arreglo de fatiga tras la
  evaluación de campo sobre Hermes: PASS).

## 2026-07-11 — El Arquitecto completo · v2.1

### Added
- El Arquitecto con sus Modos A, B y C, el Equipador y los templates del playbook (ADR-012).
- El kit llega a la segunda PC (d:\SAAS).
