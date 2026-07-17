# CLAUDE.md — Reglas para Claude Code en vibe-kit (el proyecto madre)

> Solo reglas de comportamiento. El método vive en PLAYBOOK-MAESTRO.md; el estado en docs/.
> Test por línea: **si borro esta línea, ¿Claude se equivoca? Si no, sobra.**

## Qué es esto

**vibe-kit**: el repo del método de vibe coding de Guido — el playbook, el kit instalable
(Arquitecto + Equipador + templates), el Extractor de tips y los informes de tandas. Acá se
MANTIENE el método; las apps se construyen en sus propios proyectos.

## El ciclo de trabajo

1. **Chat nuevo por misión.** El hook SessionStart inyecta el handoff; `/inicio` lo cruza con la realidad (git, diff kit↔instalado) y confirma en 3 líneas. No toco nada hasta el OK.
2. Trabajar con las reglas de abajo.
3. `/cierre` al terminar → sync + docs + commit + push → **el chat se descarta**.

## 🚨 Restricciones duras

1. **`kit/` es LA fuente canónica.** Cambios al Arquitecto/Equipador: editar en `kit/` →
   sincronizar a `~/.claude/` → verificar con `diff -r` → commit+push. **NUNCA editar
   `~/.claude/` directo** (queda huérfano del historial). El diff kit↔instalado debe dar
   limpio al cerrar toda sesión.
2. **Nada entra al menú del Equipador sin curaduría** (verificar contra fuente oficial), y
   todo descarte se escribe CON razón. Nada se instala "por las dudas" (regla de 3+).
3. **Los informes de `tips/` son actas**: no se editan retroactivamente (salvo marcar
   checkboxes de propuestas aplicadas).
4. **El Extractor (`extractor/`) jamás toca el sistema** — extrae y propone; la sesión madre
   (acá, en la raíz) decide y aplica. No mezclar los roles.
5. Los cambios al playbook/kit que nacen de fricción real citan su evidencia (fecha, tanda,
   o proyecto donde dolió) — este repo funciona con "cada regla lleva su cicatriz".

## Reglas de evidencia

Las estándar del método (soy su fabricante — dar el ejemplo): evidencia real o **NO
VERIFICADO** · tareas >2 min en background · post-compactación releer antes de editar ·
root cause, no parches · specs en formato SPEC-0/delta · ofrecer cristalizar spec si la
charla diseñó algo no-trivial.

## Mapa de documentación

| Archivo | Rol | Regla |
|---|---|---|
| `README.md` | Portada + estructura + **ÚNICA fuente de pendientes** | No hay TODO.md a propósito (proyecto chico, REJ-005) |
| `GUIA-DE-USO.md` | Recetas por situación para Guido | Anti-espejo: frases y punteros, jamás duplicar procedimientos |
| `docs/SESSION_HANDOFF.md` | Save game — dónde quedamos | `/cierre` lo sobreescribe entero; el hook lo inyecta |
| `docs/DECISIONS.md` | Por qué el kit es como es (ADRs) | Decisión con alternativas → ADR nuevo, correlativo |
| `docs/REJECTED.md` | Lo descartado a nivel proyecto | Sin él, un chat futuro re-propone el plugin o el web wizard |
| `PLAYBOOK-MAESTRO.md` | EL método (multi-proyecto) | Se toca solo con evidencia nueva |
| `kit/skills/arquitecto-skills/menu-skills.md` | El menú curado + sus descartes de skills | Descartes de SKILLS van acá, no en REJECTED |
| `tips/tanda-*.md` | Actas de las tandas de tips | Actas: no se reescriben |
| `legacy/` | Todo lo superado, con lápida | Se archiva, no se borra |

## Comunicación

Español rioplatense (vos), criollo, corto — Guido no es programador. Decisiones: opciones
con pros/contras + UNA recomendación. Explicar QUÉ cambié, no narrar el proceso.
