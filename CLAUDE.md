# CLAUDE.md — Reglas para Claude Code en vibe-kit (el proyecto madre)

> Solo reglas de comportamiento. El método vive en PLAYBOOK-MAESTRO.md; el estado en docs/.
> Test por línea: **si borro esta línea, ¿Claude se equivoca? Si no, sobra.**

## Qué es esto

**vibe-kit**: el repo del método de vibe coding de Guido — el playbook, el kit instalable
(Arquitecto + Equipador + templates), el Extractor de tips y los informes de tandas. Acá se
MANTIENE el método; las apps se construyen en sus propios proyectos.

**Comandos clave** (desde la raíz):
- `bash .claude/scripts/kit-sync.sh` — compara kit↔`~/.claude/` (primer paso ante cualquier duda del kit)
- `bash .claude/scripts/kit-sync.sh sync` — sincroniza y verifica (lo usa `/cierre`)

## El ciclo de trabajo

1. **Chat nuevo por misión.** El hook SessionStart inyecta el handoff; `/inicio` lo cruza con la realidad (git, diff kit↔instalado) y confirma en 3 líneas. No toco nada hasta el OK.
2. Trabajar con las reglas de abajo.
3. `/cierre` al terminar → sync + docs + commit + push → **el chat se descarta**.

## 🚨 Restricciones duras

1. **`kit/` es LA fuente canónica.** Cambios al Arquitecto/Equipador: editar en `kit/` →
   sincronizar y verificar con `bash .claude/scripts/kit-sync.sh sync` → commit+push. **NUNCA
   editar `~/.claude/` directo** (queda huérfano del historial). El script debe dar `LIMPIO` al
   cerrar toda sesión; la carpeta de proyectos de cada PC la conserva él, no se toca a mano.
2. **Nada entra al menú del Equipador sin curaduría** (verificar contra fuente oficial), y
   todo descarte se escribe CON razón. Nada se instala "por las dudas" (regla de 3+).
3. **Los informes de `tips/` son actas**: no se editan retroactivamente (salvo marcar
   checkboxes de propuestas aplicadas).
4. **El observatorio (`observatorio/`: el Extractor y la investigación) jamás toca el sistema** —
   extrae y propone; la sesión madre (acá, en la raíz) decide y aplica. No mezclar los roles.
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
| `README.md` | Portada para quien llega de afuera: qué es, para quién, carpetas, instalar | 100% portada: sin pendientes, historial ni número de versión (ADR-023, playbook §1) |
| `docs/MISION-Y-VISION.md` | Para qué existe el repo, para quién, qué NO hace | ~1 pantalla; se toca solo si cambia el rumbo |
| `docs/TODO.md` | **ÚNICA fuente de pendientes** | REJ-005 reabierto (ADR-023). El hook inyecta sus primeras 40 líneas: lo urgente va arriba |
| `docs/CHANGELOG.md` | Historia: una entrada por sesión, con el tag si lo hubo | `/cierre` la agrega al tope |
| `docs/README.md` | El índice de `docs/` | Archivo nuevo en `docs/` → una fila acá |
| `GUIA-DE-USO.md` | La puerta: recetas por situación para Guido | Anti-espejo: frases y punteros, jamás duplicar procedimientos |
| `manuales/` | El detalle a fondo de cada pieza del kit | La guía apunta acá; acá no se repite la guía |
| `docs/SESSION_HANDOFF.md` | Save game — dónde quedamos | `/cierre` lo sobreescribe entero; el hook lo inyecta |
| `docs/DECISIONS.md` | Por qué el kit es como es (ADRs) | Decisión con alternativas → ADR nuevo, correlativo |
| `docs/SPEC-*.md` | Los planos de lo que se construyó | **Al implementarse NO se archivan**: se marcan `✅ IMPLEMENTADO <fecha>` en la línea de Estado y se quedan en `docs/`, porque sus criterios y su Fase 2 se siguen consultando. Lo que SÍ va a `legacy/` con lápida es el material **consumido** (relatos de uso, prompts de arranque). *Esto se aparta del `formato-spec.md` del kit, que manda archivar — allá el spec es de una feature de app; acá es del método mismo y sigue vivo.* |
| `docs/kit-v3/` | El kit v3: su SPEC-0, la guía del repaso, **el tracker de la misión 5** (`PLAN-construccion.md`) y los specs delta de cada paquete (`SPEC-paquete-N.md`) | **Se aparta de la fila de arriba**: los specs de una versión del kit viven en su carpeta de versión, no sueltos en `docs/` (pedido de Guido, 2026-10-27). Misma regla de no archivar al implementarse |
| `docs/REJECTED.md` | Lo descartado a nivel proyecto | Sin él, un chat futuro re-propone el plugin o el web wizard |
| `docs/consulta/` | Referencia que no cambia con el trabajo diario | `referencia-prompts-fyd.md` es texto de FyD: fuera de la licencia MIT |
| `PLAYBOOK-MAESTRO.md` | EL método (multi-proyecto) | Se toca solo con evidencia nueva |
| `kit/skills/arquitecto-skills/menu-skills.md` | El menú curado + sus descartes de skills | Descartes de SKILLS van acá, no en REJECTED |
| `kit/skills/relevamiento/plantillas/_fuente/` | Las 4 plantillas del método, **de Guido, aprobadas por su jefe** — la versión aprobada | **Prístinas: NUNCA se editan**, ni un typo. Solo se pisan con una versión nueva aprobada; `git diff _fuente/` muestra el cambio, limpio. Ritual: `plantillas/SYNC.md`. Los `{{LINEAS:N}}` NO son placeholders del kit |
| `tips/tanda-*.md` | Actas del observatorio (tips y chats) | Actas: no se reescriben. Las rutas viejas que citan se leen con la tabla del ADR-023 |
| `observatorio/` | Extractor + investigación: miran y proponen | Un observador nuevo = subcarpeta acá, con el mismo contrato |
| `LICENSE` · `NOTICE` | MIT pura (así GitHub la reconoce) · la exclusión del texto de FyD | La exclusión va en `NOTICE`, nunca dentro de `LICENSE` |
| `assets/` | El banner y los diagramas (SVG, estilo plano) | Se miran renderizados antes de publicar |
| `legacy/` | Todo lo superado, con lápida | Se archiva, no se borra |

## Comunicación

Español rioplatense (vos), criollo, corto — Guido no es programador. Decisiones: opciones
con pros/contras + UNA recomendación. Explicar QUÉ cambié, no narrar el proceso.
