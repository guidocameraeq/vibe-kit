# Changelog del kit

Una sección por versión, la más nueva arriba. Cada una trae su **nota de migración** en tres partes fijas: **Qué piezas cambiaron** ·
**Automático o pide revisión** (pide revisión si toca algo que suele estar adaptado en los proyectos) · **Qué chequear después**.
Es lo que lee el agente de la fusión al actualizar un proyecto. La historia de sesiones del repo vive aparte, en `docs/CHANGELOG.md`.
`kit/VERSION` lleva la versión del último tag y se sube en el commit que pone el tag siguiente.

## 3.0.0

- **Qué piezas cambiaron**: el molde v3 entero. La ficha `.claude/kit.md` (versión, nivel, `vars`, frenos); los hooks, ahora en node, con
  candado y barreras; `/inicio` y `/cierre` v3; director/obrero (worktrees por módulo); `/estado`; la mesa; los githooks del clon.
  Se retiran `check-code` y `session-start.sh`, y las `deny` con `Write(...)` de los settings. Del lado de la PC: `actualizar.cjs`
  (`aplicar`, `chequear`, `flota`, `adoptar`) y `cargar-secreto`, que ahora calcula el `<proyecto>` desde el checkout principal.
  Lo nuevo del paquete 7: el estado `subio-al-kit` de los cambios y `kit/cubiertos.md` (aplicar cierra el ciclo); `portada.cjs armar`
  y la pieza `piezas.portada`; `cambios-flota.cjs` (la tabla del ciclo y las urgencias); `migrar-cambios.cjs` para un `CAMBIOS.md` único.
- **Automático o pide revisión**: pide revisión, porque casi todo es pieza que los proyectos adaptan. Un repo v2 **sin ficha se adopta,
  no se actualiza**: `adoptar` (con Guido delante, la pantalla). Uno **con ficha** se pone al día con `flota`. Las piezas adaptadas se
  fusionan solas si traen su porqué; sin porqué quedan en `.claude/fusiones/` del proyecto, y el `/inicio` de la próxima sesión le hace
  **una** pregunta al dueño. Una rama `kit/v3.0.0` ROTA se rehace sin `--force`; un repo protegido deja la rama "te espera".
- **Qué chequear después**: `doctor` sin ✗; `chequear` con las nueve líneas en ✅; abrir el `/inicio` del proyecto y ver que confirme
  en tres líneas, sin avisos de fusión pendientes.

## 2.4.3

- **Qué piezas cambiaron**: el hook de arranque del molde (`templates/universales/hooks/session-start.sh`) ahora le pone tope al
  handoff (5.500 bytes) y, si se pasa, lo corta con el aviso "CORTADO"; muestra 30 líneas del TODO (antes 40), títulos de commit
  cortados a 100 y hasta 15 renglones de estado; al final imprime la huella `inyectado: N caracteres de 10000`. También cambian los
  `/inicio` y `/cierre` del molde (qué hacer ante "CORTADO", el tope) y la cabecera del handoff del molde.
- **Automático o pide revisión**: pide revisión. Toca el hook y las dos skills, que los proyectos suelen tener adaptados: no se pisan
  a ciegas.
- **Qué chequear después**: abrir un chat nuevo y ver que la última línea del arranque sea la huella; con un handoff de más de 5.500
  bytes, que aparezca "CORTADO".

## 2.4.2

Versión base de la v3: los repos de prueba nacen de este tag. Sin nota de migración (anterior a este archivo).
