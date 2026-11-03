# Changelog del kit

Una sección por versión, la más nueva arriba. Cada una trae su **nota de migración** en tres partes fijas: **Qué piezas cambiaron** ·
**Automático o pide revisión** (pide revisión si toca algo que suele estar adaptado en los proyectos) · **Qué chequear después**.
Es lo que lee el agente de la fusión al actualizar un proyecto. La historia de sesiones del repo vive aparte, en `docs/CHANGELOG.md`.
`kit/VERSION` lleva la versión del último tag y se sube en el commit que pone el tag siguiente.

## 3.0.0-rc.1

La beta de la v3 (2026-11-03): el molde v3 entero, más el paquete 8b. La `3.0.0` final saldrá con su sección propia; mientras tanto,
cada arreglo sale como `rc.N` y llega por `flota`.

- **Qué piezas cambiaron**: el molde v3 entero. La ficha `.claude/kit.md` (versión, nivel, `vars`, frenos); los hooks, ahora en node, con
  candado y barreras; `/inicio` y `/cierre` v3; director/obrero (worktrees por módulo); `/estado`; la mesa; los githooks del clon.
  Se retiran `check-code` y `session-start.sh`, y las `deny` con `Write(...)` de los settings. Del lado de la PC: `actualizar.cjs`
  (`aplicar`, `chequear`, `flota`, `adoptar`) y `cargar-secreto`, que ahora calcula el `<proyecto>` desde el checkout principal.
  Lo nuevo del paquete 7: el estado `subio-al-kit` de los cambios y `kit/cubiertos.md` (aplicar cierra el ciclo); `portada.cjs armar`
  y la pieza `piezas.portada`; `cambios-flota.cjs` (la tabla del ciclo y las urgencias); `migrar-cambios.cjs` para un `CAMBIOS.md` único.
  Lo nuevo del paquete 8b: la versión entera con `-rc` (ficha, `VERSION`, tags, sello, `doctor`); el obrero de fondo en `auto` (con
  una línea de respaldo en `acceptEdits`); `resolver` y `desde:` en las piezas; el `/inicio` que no ejecuta lo que dejó otra sesión;
  `adoptar --mirar --nuevo` y `--aplicar --principal` (los githooks en la carpeta del dueño); el Modo A monta el molde v3 y el SPEC-0
  vive en `docs/modulos/v1/SPEC.md`; la línea "llaves" de `chequear` mira solo lo que el molde instancia.
- **Automático o pide revisión**: pide revisión, porque casi todo es pieza que los proyectos adaptan. Un repo v2 **sin ficha se adopta,
  no se actualiza**: `adoptar` (con Guido delante, la pantalla). Uno **con ficha** se pone al día con `flota`. Una pieza adaptada se
  fusiona sola solo si tiene `por:` en la ficha y la mezcla sale limpia; si no, queda en `.claude/fusiones/<pieza>.md` con lo que dice
  el kit, las dos versiones y cuatro salidas (mezclar · quedarse con la propia · tomar la nueva · congelar, que no va en una pieza de
  frenos), y el `/inicio` elige o le pregunta al dueño y lo escribe `actualizar.cjs resolver`. Una rama `kit/v<tag>` ROTA se rehace sin `--force`; un repo protegido deja la rama "te espera".
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
