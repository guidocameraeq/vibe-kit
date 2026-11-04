# Templates del Arquitecto — qué queda acá

El **sistema de trabajo** de un proyecto (`/inicio`, `/cierre`, los hooks, el `settings.json`, el `CLAUDE.md`, los docs) ya no sale de
acá: es el molde v3 (`kit/molde/` en el repo del kit) y lo monta el adoptador, `actualizar.cjs adoptar` (`--nuevo` en el Modo A,
`anexos/modo-a.md`; "adoptá X" para un repo v2, `anexos/flota.md`), nunca a mano. El molde v2 que vivía en `universales/` está en
`legacy/templates-universales-v2/` del repo del kit, con su lápida.

## `adaptables/` — recién cuando el ritual real existe (regla de 3+)

| Template | Qué es |
|---|---|
| `smoke.contrato.md` | Contrato universal de verificación con evidencia; se instancia como `/smoke` con los pasos reales del proyecto. |
| `deploy.contrato.md` | Contrato de publicación (push → aplicar → salud → smoke); se instancia como `/deploy` o `/release`. |

Instanciar = copiar al proyecto, reemplazar los `{{...}}`, borrar lo que no aplique.

## La regla molde-vs-instancia (§1.2.9 del playbook)

**Las adaptaciones son aceptables; el esqueleto, no.** Nombres, comandos y cantidad de archivos varían por proyecto — la filosofía y los reflejos (handoff único, evidencia o NO VERIFICADO, una misión por chat, cierre que deja los docs al día) son los mismos en todos. Si una instancia rompe un paso del contrato, no es adaptación: es regresión.
