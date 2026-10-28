# Changelog del kit

Una sección por versión, la más nueva arriba. Cada una trae su **nota de migración** en tres partes fijas: **Qué piezas cambiaron** ·
**Automático o pide revisión** (pide revisión si toca algo que suele estar adaptado en los proyectos) · **Qué chequear después**.
Es lo que lee el agente de la fusión al actualizar un proyecto. La historia de sesiones del repo vive aparte, en `docs/CHANGELOG.md`.
`kit/VERSION` lleva la versión del último tag y se sube en el commit que pone el tag siguiente.

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
