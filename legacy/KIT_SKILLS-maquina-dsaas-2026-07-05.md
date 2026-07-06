# Kit de Skills — mi set curado de Claude Code

> ⚠️ **Este catálogo describe la máquina `d:\SAAS` (Hermes/Tobybot: SQL Server, Twilio).**
> El set de ESTA máquina (C: — Perseo/Guia de vibe coding) se rige por la "Nota de máquina"
> del `PLAYBOOK-MAESTRO.md` §2.3 — acá NO instalar sql-expert, twilio ni product-management.

> **Qué es esto**: el set completo, podado y justificado de skills y plugins que
> uso con Claude Code, con el porqué y el para qué de cada pieza. Es el tercer
> documento del kit de iniciación: `PLAYBOOK_CLAUDE.md` explica el MÉTODO,
> `SKILLS_INVENTARIO.md` documenta la AUDITORÍA que llevó a este set, y este es
> el CATÁLOGO final. Vigente al 2026-07-05.

**Dato clave**: todo lo global aplica por igual en la app de terminal y en la
extensión de VS Code — son el mismo motor leyendo `C:\Users\<usuario>\.claude\`.
Y todo el kit es **gratuito/open-source** (MIT, Apache 2.0 o repos oficiales).

---

## Las 3 capas

| Capa | Dónde vive | Alcance |
|---|---|---|
| 1. Integradas | Vienen con Claude Code | Todo, siempre, sin instalar |
| 2. Globales | `~\.claude\skills\` + plugins | Todos los proyectos de la máquina |
| 3. De proyecto | `<raíz>\.claude\skills\` | Solo ese proyecto |

---

## Capa 1 — Integradas (no instalar: ya vienen)

Las que más uso: **/code-review** (revisión de bugs con verificación),
**/verify** (probar que un cambio funciona de punta a punta), **/simplify**,
**/run**, **/init** (CLAUDE.md inicial), **/security-review**,
**/deep-research** (investigación multi-fuente verificada), **/dataviz**
(gráficos con sistema visual), **/xlsx** (Excel completo), **/loop**,
**/schedule**, **/update-config** (hooks/settings hablando), artifact-design
(páginas web como entregable). Regla: **antes de instalar algo, verificar que
no exista integrado** — la mitad de mi poda fue gente duplicando esto.

---

## Capa 2 — Globales (10 skills + 5 plugins)

### Metodología de trabajo (pack superpowers, MIT — 6 de 14 sobrevivieron la poda)

| Skill | Para qué | Cuándo se dispara |
|---|---|---|
| **brainstorming** | Convierte una idea dictada en una spec escrita: una pregunta por vez, opciones con trade-offs, mockup antes de UI. Mi skill más usada | Al arrancar cualquier feature nueva. NO para bugfixes chicos |
| **systematic-debugging** | Prohíbe parchear síntomas: causa raíz primero, un solo fix, con test. Me protege de no poder detectar cuándo la IA "parcha por probar" | Ante cualquier bug no trivial |
| **verification-before-completion** | Prohíbe decir "listo" sin correr la verificación y mostrar el output. Mi regla de "los checkmarks no me alcanzan", codificada | Siempre, de fondo |
| **writing-plans** (v6.1.1, editada*) | Planes-archivo hiperdetallados para misiones que cruzan sesiones. v6 suma Global Constraints e Interfaces por tarea | Misiones grandes; el plan queda en `docs/superpowers/plans/` y `/inicio` lo detecta |
| **writing-skills** (v6.1.1) | Cómo crear/editar skills bien (incluye la guía oficial de Anthropic). Es la herramienta con la que evoluciono mis rituales | Al crear o retocar skills |
| **test-driven-development** | Test que falla primero, código después | Bugfixes de lógica backend; no para frontend visual |

\* *Mis copias de writing-plans están editadas: se les quitaron las referencias
a skills del pack que no instalo (subagent-driven-development, executing-plans,
worktrees) y el handoff de ejecución apunta a mi ciclo /cierre → /inicio.
**No pisar con updates ciegos** — re-aplicar los edits si se actualiza.*

### Conocimiento y documentos

| Skill | Para qué | Origen |
|---|---|---|
| **frontend-design** | Sube la vara visual del frontend real y evita la estética genérica de IA. En proyectos con design system propio, se subordina a él | anthropics/skills (actualizada jun-2026) |
| **pdf** | Crear, unir, dividir PDFs, extraer tablas, OCR. El gap de mis entregables comerciales (tenía xlsx y dataviz pero nada de PDF) | anthropics/skills |
| **sql-expert** | Conocimiento experto T-SQL/SQL Server (CTEs, tuning, planes de ejecución). Solo conocimiento: no se conecta a ninguna base. Se dispara únicamente cuando el trabajo es SQL Server (en mi caso, Hermes) | comunidad (MIT) |
| **codebase-to-course** | Genera un curso interactivo HTML de cómo funciona un codebase, para no-técnicos. Una vez por repo — hecho para el PO que dirige IA sin leer código | comunidad |

### Plugins (marketplace oficial de Anthropic + knowledge-work-plugins)

| Plugin | Para qué | Estado / próximo paso |
|---|---|---|
| **github** | MCP oficial de GitHub (PRs, issues, releases) | Activo |
| **hookify** | Dictás guardrails en criollo y se vuelven hooks duros del sistema: "bloqueá UPDATE/DELETE contra la base de producción". La regla deja de depender de la memoria de la IA | ⏳ **Próximo paso: dictar las reglas de producción en cada proyecto** (son por-proyecto) |
| **supabase** | La IA puede mirar la base Supabase en vivo: "fijate por qué no sincroniza la tabla X", con evidencia | ⏳ **Próximo paso: generar token y configurarlo READ-ONLY** (innegociable) + regla hookify anti-escrituras |
| **product-management** | /write-spec (PRDs), /roadmap-update, /synthesize-research (feedback de usuarios → insights) | 🧪 **A PRUEBA**: si en un mes no lo usé, se desinstala. Pedir outputs en español |
| **twilio-developer-kit** | Skills + buscador de la doc oficial de Twilio/WhatsApp (solo documentación: sin credenciales, no toca la cuenta) | ⚠️ **MUY ESPECÍFICO**: solo aporta si tenés un proyecto sobre Twilio/WhatsApp (mi caso: Tobybot). Si replicás este kit en una máquina sin eso, **omitilo** |

---

## Capa 3 — De proyecto (NO van en el kit global)

Regla: a nivel proyecto viven SOLO las skills relativas a ese proyecto — los
**rituales**, que se crean con la receta del `PLAYBOOK_CLAUDE.md` §5:

| Proyecto | Skills/comandos propios |
|---|---|
| `d:\SAAS` (Hermes Desktop + Mobile) | `/inicio` `/cierre` `/smoke` `/release` + `/inicio-mobile` `/cierre-mobile` `/release-mobile` |
| Claucode-Scrapper | comando `/scrape` |
| Reporte proyectos | comando `/ficha` + agente `asistente-fichas` |

(Las ~65 "skills" dentro de `Tobybot V0\skills\` son del bot Toby — las usa el
bot en el servidor, no Claude Code. No tocarlas ni contarlas en este kit.)

---

## Reglas de mantenimiento del kit

1. **Antes de instalar, chequear que no esté integrado** en Claude Code.
2. **Una skill entra al kit solo si**: cubre un gap real verificado, o codifica
   un ritual repetido 3+ veces. Nada "por las dudas" — más skills instaladas =
   más ruido al elegir, no más capacidad.
3. **Los plugins con MCP se habilitan por proyecto** cuando se pueda — cada MCP
   suma herramientas al contexto de todas las sesiones donde esté activo.
4. **Las copias sueltas no se actualizan solas**: refresh semestral desde los
   repos de origen (superpowers, anthropics/skills), re-aplicando los edits
   propios.
5. **Poda periódica**: lo marcado "a prueba" que no se usó en un mes, afuera.
   La auditoría 2026-07 borró 16 de 24 — la mayoría nunca se había usado.
6. **Nunca darle a la IA poder destructivo que no podés verificar**: por eso el
   kit NO incluye plugins de gestión del VPS ni acceso de escritura a bases de
   producción (supabase va read-only; el deploy del VPS se hace por ritual con
   `ssh` que siempre pregunta).

---

*Set vigente: 10 skills globales + 5 plugins + integradas + rituales por
proyecto. Auditado y podado el 2026-07-05 (ver `SKILLS_INVENTARIO.md` para la
evidencia y los descartes).*
