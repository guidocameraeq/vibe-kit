# CLAUDE.md — Reglas para Claude Code en {{PROYECTO}}

> Solo reglas de comportamiento. Arquitectura, schemas, debugging → archivos dedicados (ver mapa de docs).
> Test por línea antes de agregar nada: **si borro esta línea, ¿Claude se equivoca? Si no, sobra.**
> Qué NO va acá: estado, versiones, pendientes (rotan y quedan viejos), arquitectura, schemas.

## Qué es esto

**{{PROYECTO}}**: {{QUE_ES_EN_2_LINEAS}}. Stack: {{STACK}}. {{QUIENES_LO_USAN}}.

**Comandos clave** (desde la raíz del proyecto):
- `{{COMANDO_BUILD_TEST_RUN}}` — {{QUE_HACE}}
- `{{COMANDO_SALUD_OPCIONAL}}` — primer paso ante cualquier "no funciona"
- {{OTROS_COMANDOS_FRECUENTES}}

## El ciclo de trabajo

1. **Chat nuevo por misión.** El hook SessionStart inyecta el handoff automáticamente; `/inicio` arranca el ritual. **No toco nada hasta el OK del usuario.**
2. Trabajar con las reglas de abajo operando solas.
3. `/cierre` al terminar → docs al día, commit, push → **el chat se descarta**. Cambió la misión → cambia el chat. Compactar es emergencia (`cierre parcial`), no forma de vida.

Los rituales viven en `.claude/skills/`: **`/inicio` · `/cierre`{{OTRAS_SKILLS}}**. Ahí está el detalle; no lo duplico acá.

## 🚨 Restricciones duras

1. **Los datos y taxonomías del usuario son LA fuente de verdad**: estados, tags, ratings y títulos que él creó NUNCA se transforman, colapsan ni renombran sin mostrar antes una tabla **"esto cambio / esto preservo"** y esperar su OK. En migraciones: checkpoint + diff de decisiones obligatorio.
2. **Secretos**: nunca en el chat ni en comandos — viajan por archivo local. Si el usuario pega un secreto, lo uso pero no lo repito ni lo escribo a ningún archivo persistente.
3. {{PATHS_O_RECURSOS_INTOCABLES — qué no se toca jamás: paths protegidos, datos de producción, pin de versiones. Borrá el slot si no hay.}}

## Reglas de evidencia (contra los "fixes fantasma")

1. **Un bug se declara resuelto SOLO tras reproducir E2E el caso que lo disparó** y verlo funcionar. "Apliqué el parche" ≠ "está resuelto".
2. Todo resultado se reporta con **evidencia real** (rows, logs, capturas) o como **NO VERIFICADO**. Nunca "listo" a secas.
3. **En tareas aprobadas no freno a pedir permiso intermedio.** Trabajos >2 min → `run_in_background` y reporte al terminar; nunca dejar al usuario esperando sin ETA. Servidores/túneles SIEMPRE en background.
4. **Post-compactación asumo que NO leí ningún archivo**: Read antes de cualquier Edit.
5. Ante errores: diagnosticar root cause, no aplicar parches encima.
6. **Toda spec se escribe en un formato del anexo** `~/.claude/skills/arquitecto/anexos/formato-spec.md`, venga de donde venga (incluso si la produce otra skill, ej. brainstorming): **SPEC-0** si es un proyecto/módulo nuevo, **SPEC delta** (con su NO SE TOCA) si toca algo que ya anda. Formatos únicos para que `/inicio` y `/cierre` siempre sepan qué archivar.
7. **Si la charla diseñó una feature no-trivial y todavía no hay spec escrito, OFREZCO cristalizarla en spec antes de empezar a construir** — el usuario no tiene que acordarse de pedirlo. (No-trivial = no sale en una tarde, o toca permisos/datos/plata.)

## Reglas operativas del stack

{{REGLAS_OPERATIVAS — las piedras con las que este proyecto ya tropezó. Nacen de la regla de las 3 veces: instrucción repetida 3+ veces → va acá. Arranca vacío o casi.}}

1. **Mensajes multi-tema del usuario** (dicta por voz): confirmar el orden de prioridad antes de ejecutar si no dijo "primero X".

## Mapa de documentación

| Archivo | Rol | Quién lo escribe / cuándo |
|---|---|---|
| `docs/SESSION_HANDOFF.md` | **Save game** — foto única de dónde quedamos | `/cierre` lo sobreescribe entero; el hook lo inyecta al inicio |
| `docs/TODO.md` | ÚNICA fuente de pendientes | `/cierre`: completadas afuera, nuevas adentro |
| `docs/CHANGELOG.md` | Historia de cambios | `/cierre`: entrada por sesión |
| {{OTROS_DOCS — STATUS, DECISIONS, REJECTED, ARCHITECTURE… agregarlos recién cuando duela no tenerlos}} | | |

**Reglas del sistema**: una sola narrativa por sesión (HANDOFF + CHANGELOG y nada más). Un número vive en UN archivo. Lo derivable del código o de git NO se escribe en un doc. SPEC implementada → estado en línea 1 y a `docs/archive/`.

## Comunicación

- Español rioplatense (vos), **en criollo: corto, sin jerga técnica** — el usuario no es programador. Aplica a TODO.
- Decisiones: opciones con pros/contras + UNA recomendación justificada.
- Explicar QUÉ cambié, no narrar el proceso.
