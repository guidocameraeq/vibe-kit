# Templates del sistema de trabajo — qué es cada cosa

Moldes extraídos de las instancias reales de Perseo, materializan el PLAYBOOK-MAESTRO (Guia de vibe coding). **Quién los instancia**: el Arquitecto al montar un proyecto nuevo, o el prompt de aplicación del §2.9 del playbook pegado a mano en un chat del proyecto. Instanciar = copiar al proyecto, reemplazar los `{{...}}`, borrar lo que no aplique.

## `universales/` — van en TODO proyecto, desde el día cero

| Template | Va a | Qué es |
|---|---|---|
| `skills/inicio/SKILL.md` | `.claude/skills/inicio/` | Ritual de arranque: usa el contexto del hook, cruza handoff vs git, 3 líneas, espera OK. |
| `skills/cierre/SKILL.md` | `.claude/skills/cierre/` | Ritual de cierre completo + modo `parcial` (emergencia pre-compact). |
| `hooks/session-start.sh` | `.claude/hooks/` | Inyecta handoff + TODO + git en cada chat nuevo y post-compact. |
| `hooks/check-code.js` | `.claude/hooks/` | Valida sintaxis al editar, según extensión (activar las del stack). |
| `settings.template.json` | `.claude/settings.json` | Hooks + allowlist moderada. |
| `CLAUDE.template.md` | `CLAUDE.md` (raíz) | El rol: reglas de comportamiento con slots. |
| `docs/*.md` | `docs/` | Esqueletos de SESSION_HANDOFF (se sobreescribe entero), TODO (única fuente de pendientes, completado→borrar) y CHANGELOG (entrada por cierre). |

## `adaptables/` — recién cuando el ritual real existe (regla de 3+)

| Template | Qué es |
|---|---|
| `smoke.contrato.md` | Contrato universal de verificación con evidencia; se instancia como `/smoke` con los pasos reales del proyecto. |
| `deploy.contrato.md` | Contrato de publicación (push → aplicar → salud → smoke); se instancia como `/deploy` o `/release`. |

## La regla molde-vs-instancia (§1.2.9 del playbook)

**Las adaptaciones son aceptables; el esqueleto, no.** Nombres, comandos y cantidad de archivos varían por proyecto — la filosofía y los reflejos (handoff único, evidencia o NO VERIFICADO, una misión por chat, cierre que deja los docs al día) son los mismos en todos. Si una instancia rompe un paso del contrato, no es adaptación: es regresión.
