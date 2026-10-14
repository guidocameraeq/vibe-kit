# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo
> inyecta en cada chat nuevo de esta carpeta.

**Última sesión cerrada:** 2026-10-13, PC `clientes` (`D:\vibe-kit`) — **misión 3 de 5 hecha: el repo
se profesionalizó** (`docs/SPEC-profesionalizar-repo.md` ✅ + una ampliación pedida por Guido, todo en
ADR-023). Kit sin bump (`v2.4.2`): solo textos.

## Qué salió

- **El repo ahora tiene el mismo sistema que los proyectos de Guido**: README solo portada (sin
  pendientes, historial ni versión) · `docs/TODO.md` (casillas, única fuente) · `docs/CHANGELOG.md`
  (por fecha) · `docs/MISION-Y-VISION.md` · `docs/README.md` (índice) · DECISIONS con índice · hook,
  `/inicio` y `/cierre` con el molde del Arquitecto · `LICENSE` MIT + `NOTICE` (excluye el texto de FyD).
- **La portada de GitHub se vistió**: banner + diagrama estilo plano (`assets/*.svg`), insignias, un día
  de trabajo de ejemplo. **El nombre está abierto**: a Guido no le cerró ninguno (Obrador, Andamio,
  Batuta, Cimientos, Plano); quedó vibe-kit hasta que elija. Cambiarlo toca el banner, el README y la
  URL del Equipador (`kit/skills/arquitecto-skills/SKILL.md`; GitHub redirige la vieja).
- **Mudanzas** (la tabla vieja → nueva está en ADR-023): `extractor/` e `investigacion/` →
  `observatorio/` · `guias/` → `manuales/` · `docs/consulta/` · el presupuesto de `/relevamiento` a
  `legacy/`. **El Extractor ahora se abre en `observatorio/extractor/`.**
- **`/relevamiento`**: la autoría de las plantillas dice "de Guido, aprobadas por su jefe"; `SYNC.md`
  es "cambiaste una versión aprobada". `_fuente/` intacta.
- **El sync del kit es un script**: `bash .claude/scripts/kit-sync.sh` (compara) / `... sync` (copia y
  verifica). El kit trae `{{CARPETA_DE_PROYECTOS}}` en el Arquitecto y el script conserva la ruta de
  cada PC. **Se acabó la excepción de ADR-021: el diff da LIMPIO también en esta PC.**

## Próximo paso concreto: la misión 4 — SOLO DISEÑO

Chat nuevo acá → `/inicio` → Guido dice **"misión 4, tramo 1"** → se sigue el plan (lo
diseñó Guido el 2026-10-14; no hace falta pegarlo). **Orden fijo: diseño → spec → construcción.** La
misión 4 no toca `kit/` ni ningún proyecto; construir es la misión 5, en chats aparte.

Todo el plan está en **[`docs/mision-4/PLAN.md`](mision-4/PLAN.md)**: el foco (7 objetivos), los
pilares (incluida **la flota**: un agente global que actualiza los proyectos), modelos y tokens, los 6
tramos y el brief del tramo 1 (la radiografía de director/obrero, ~300 mil tokens: confirmar antes).

## Cosas que muerden y no están en ningún otro doc

- 🖥️ **La PC `Usuario` está desfasada** hasta que le diga `actualizate` al Equipador. Lo que hay que
  mirar ahí: que la línea "Carpeta de proyectos" del Arquitecto **siga con su ruta** y no con
  `{{CARPETA_DE_PROYECTOS}}`. El Equipador lo tiene escrito, pero **NO VERIFICADO** en esa PC. Si
  quedara vacía, el Arquitecto pregunta solo; se corrige en una línea.
- 📦 **`D:\vibe-hallazgos\` NO SE BORRA** hasta el final de la hoja de ruta (ADR-022): hallazgos de las
  3 PCs, condensados, `ya-sabido.md`, `CORTE.md`, `ALERTAS-SEGURIDAD.md` (privado, **no** va al repo
  público). El repo privado `guidocameraeq/vibe-research` también queda de respaldo.
- 🔴 **vibe-kit sigue PÚBLICO**: los nombres reales (el compañero, clientes, cuentas) no entran.
  Antes de cada push: gitleaks sobre lo agregado (está instalado vía WinGet en esta PC).
- 🔐 **Alertas de seguridad abiertas** de Hermes (detalle solo en el archivo privado): credenciales que
  pasaron por chats, `/smoke` de Hermes Desktop con un login real de producción, rotaciones
  pendientes. **Rotar: NO VERIFICADO.**
- 🖥️ **Mesa entre PCs** por Remote Control: anduvo, pero el permiso no viaja con el mensaje (cada PC
  da su OK) y el clasificador puede frenar copias "sensibles". Va a la misión 4 (P34).
- La otra PC se llama `Usuario` (`C:\Users\Usuario\Desktop\Proyectos\vibe-kit`, sin disco D, Python
  3.14). El capataz: código **no está en esta PC** y no se ubicó (P41).

## Bloqueos

Ninguno.
