# CHANGELOG — vibe-kit

> Historia permanente. `/cierre` agrega una entrada AL TOPE en cada sesión; si hubo tag de versión, el título lo dice (` · vX.Y`). Orden descendente estricto. Nada de versiones duplicadas en otros docs. El porqué de cada cosa está en los ADR citados.

## 2026-10-13 — Misión 3: el repo se ordena

### Added
- **La portada se viste**: banner y diagrama con estilo de plano de arquitecto (`assets/`), insignias
  que se actualizan solas, un día de trabajo de ejemplo y los principios. El nombre del proyecto queda
  abierto (Guido lo decide más adelante).
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
