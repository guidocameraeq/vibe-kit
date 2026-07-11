# Menú de skills universales — la curaduría

> Curado el 2026-07-06 con investigación real (4 agentes: oficiales, comunidad, packs, plugins).
> Reglas: se instala **clonando fresco del repo de origen** (nunca copias viejas) · nada entra
> "por las dudas" · lo descartado queda escrito CON razón para no re-descubrirlo.
> Vidrieras de DESCUBRIMIENTO (para mirar cuando busques algo — jamás instalar sin pasar por
> esta curaduría): skills.sh · aitmpl.com.

## Tier 1 — Casi seguro en cualquier PC (default ON al instalar)

| Skill | Origen (clonar de acá) | Qué da |
|---|---|---|
| brainstorming | `github.com/obra/superpowers` → `skills/brainstorming` | Pensar features del día a día: una pregunta por vez, trade-offs. Sus specs salen en formato SPEC-0 (regla de los CLAUDE.md) |
| writing-skills | `github.com/obra/superpowers` → `skills/writing-skills` | Fabricar/editar skills bien (con la guía oficial) |
| systematic-debugging | `github.com/obra/superpowers` → `skills/systematic-debugging` | Causa raíz primero, prohíbe parchear síntomas |
| verification-before-completion | `github.com/obra/superpowers` → `skills/verification-before-completion` | Prohíbe "listo" sin correr la verificación |
| frontend-design | `github.com/anthropics/skills` → `skills/frontend-design` | Dirección estética — mata el look genérico de IA |
| theme-factory | `github.com/anthropics/skills` → `skills/theme-factory` | 10 paletas+tipografías curadas listas — consistencia visual sin saber diseño |
| shadcn | ✅ VERIFICADO 2026-07-06: `npx -y skills add shadcn/ui -g` (CLI oficial `skills`; queda como symlink desde `~/.agents/skills/` — se actualiza con `npx skills update -g`, NO con git) | Claude ensambla componentes shadcn/ui probados en vez de inventar CSS. Auto-trigger only (`user-invocable: false`). Nota: trae bundled `migrate-radix-to-base` — se remueve post-install (niche; reinstalable) |
| web-design-guidelines | `github.com/vercel-labs/agent-skills` | Auditoría de UI con 100+ reglas (accesibilidad, forms, dark mode) — engancha con el ritual /smoke |
| codebase-to-course | ✅ VERIFICADO 2026-07-06: `github.com/zarazhangrui/codebase-to-course` (misma autora que frontend-slides) — clonar y copiar la carpeta a `~/.claude/skills/` | Curso interactivo HTML de un codebase — Guido lo usa para presentaciones a gerencia |
| supabase | `github.com/supabase/agent-skills` | Buenas prácticas oficiales de TODO Supabase (Auth, RLS, Realtime, Storage) |
| supabase-postgres-best-practices | `github.com/supabase/agent-skills` | EL "sql-expert" de Postgres: índices, queries, tuning — el stack real de Guido |

**Plugins/MCPs Tier 1** (requieren comandos interactivos DEL USUARIO — la skill da la instrucción exacta, nunca los instala sola):
- **hookify**: `/plugin install hookify@claude-plugins-official` — guardrails dictados en criollo → hooks mecánicos. Global (no es MCP, no pesa).
- **Context7** (docs frescas de librerías, 2 tools): `claude mcp add -s user context7 -- npx -y @upstash/context7-mcp@latest` — la excepción razonable a "MCP por-proyecto" por lo liviano.
- **frontend-slides** (presentaciones HTML animadas, 34 templates): `/plugin marketplace add zarazhangrui/frontend-slides` → `/plugin install` según su README. Regla: pptx cuando piden archivo editable; esto cuando importa impactar en pantalla.

## Tier 2 — Por proyecto (se activan cuando el proyecto lo pide)

| Pieza | Origen | Cuándo |
|---|---|---|
| Supabase MCP (read-only) | `mcp.supabase.com` — ver `.mcp.json` de Bot Perseo como modelo (read_only=true + project_ref) | Toda web app con Supabase. Escrituras JAMÁS por MCP: van por migraciones |
| Playwright MCP | `github.com/microsoft/playwright-mcp` | El /smoke de web apps: Claude recorre, clickea, screenshots. Pesado (~25 tools) → probar ANTES el Preview nativo de Claude Code |
| taste-skill (high-end-visual-design) | `github.com/Leonxlnx/taste-skill` | Estética "cara y calma". ⚠️ COLISIONA con frontend-design: una u otra por proyecto, NUNCA ambas |
| Expo skills | `github.com/expo/skills` | Proyectos Android/Expo — instalar SOLO las que el proyecto use (son 20+) |
| test-driven-development | `github.com/obra/superpowers` → `skills/test-driven-development` | Backend de datos / lógica de bots. Es fundamentalista: global frenaría el vibe de UI |
| react-best-practices | `github.com/vercel-labs/agent-skills` | Cuando la performance de un Next.js DUELA (no antes — nada por las dudas) |
| Vercel MCP | `mcp.vercel.com` (OAuth, read-only) | Solo proyectos deployados en Vercel: Claude lee los logs de deploy solo |
| canvas-design | `github.com/anthropics/skills` | Solo si aparece gráfica estática real (posters, portadas) |
| design-review | `github.com/OneRedOak/claude-code-workflows` | Experimental (mantenimiento flojo): review visual de UI renderizada. Probar en UN proyecto; si /verify + web-design-guidelines alcanzan, descartar |
| **v0 de Vercel** (web, tier gratis) | `v0.dev` — se usa por web; el resultado entra por copy-paste o `npx shadcn add <url>` | Dirección visual inicial de una web NUEVA: genera Next.js+shadcn+Tailwind REAL (el stack exacto — sin traducción con pérdida). Antes de v0, opción gratis en casa: pedirle a Claude 3-4 variantes HTML descartables (frontend-design + theme-factory), elegir en el navegador, recién ahí codear. *(Investigado 2026-07-11: le gana a Stitch en este stack — ver Descartadas.)* |
| emilkowalski/skill (animaciones) | ✅ VERIFICADO 2026-07-11: `npx skills add emilkowalski/skill` (autor de animations.dev) | Timing/easing de animaciones — el 10% de pulido que frontend-design/theme-factory no cubren. Para proyectos con UI que lo pida |
| n8n MCP 💤 | ✅ VERIFICADO 2026-07-11: `github.com/czlonkowski/n8n-mcp` (MIT, mantenido, ~1000 nodos) | **DORMIDO — despierta cuando n8n entre al stack** (Guido lo planea a futuro). Automatizaciones n8n dirigidas desde Claude Code sin arrastrar nodos |

## Descartadas — CON razón (no re-evaluar sin motivo nuevo)

- **Resto de superpowers (9 skills)**: para devs que leen código, o dependen del formato writing-plans (descartado: choca con SPEC-0), o duplican integradas (code-review, worktrees nativos).
- **BMAD / Spec Kit (GitHub) / Metaswarm / ClaudeFast**: sistemas completos con SU formato de specs y pipeline — colisión frontal con el Arquitecto y el playbook. Lo único valioso de BMAD (elicitación) ya está destilado en el Arquitecto.
- **doc-coauthoring, web-artifacts-builder** (anthropics): formato propio de docs / específica de artifacts de claude.ai — ajenas al pipeline real (Next.js + repo + deploy).
- **brand-guidelines** (anthropics): es la marca DE ANTHROPIC. 💡 IDEA ROBADA pendiente: clonar su estructura para una skill `marca-propia` con la identidad de la empresa de Guido.
- **github plugin**: el `gh` CLI nativo ya lo cubre; se reactiva solo si aparece trabajo en equipo con PRs.
- **postgres MCP de referencia (@modelcontextprotocol/server-postgres)**: ⛔ ARCHIVADO con vulnerabilidad de SQL injection sin parchear. NO instalar jamás. Supabase MCP lo cubre mejor.
- **figma MCP, sentry MCP**: vivos y oficiales pero sin gap real hoy (no diseña en Figma, no usa Sentry). Sentry se anota si algún día el bot/dashboards necesitan monitoreo de errores en prod.
- **sql-expert (T-SQL)**: reemplazado por supabase-postgres-best-practices. Solo tiene sentido en la PC d:\SAAS (Hermes usa SQL Server).
- **twilio-kit, product-management, mcp-builder, internal-comms, algorithmic-art, slack-gif-creator**: sin gap en este perfil.
- **webapp-testing** (anthropics): solape triple con Playwright MCP + Preview nativo + /verify. Elegir UNA vía de verificación visual por proyecto.
- **Google Stitch (+ su MCP)**: evaluado a fondo 2026-07-11 (2 investigadores, reviews reales): output tiende a "AI-looking" (último en comparativas mismo-prompt), exporta HTML genérico NO-shadcn (traducción con pérdida que un no-diseñador no puede auditar), y el MCP exige proyecto de Google Cloud CON billing. v0 lo supera en este stack. Re-evaluar SOLO si sacan tier pago con export React/shadcn.
- **Impeccable** (pbakaus, ~45k ⭐): real y vivo, pero solapa fuerte con frontend-design + theme-factory + web-design-guidelines juntas. Probar aislado antes de reemplazar la stack de diseño actual — no sumar encima.

## Integradas en Claude Code (NUNCA instalar duplicados)

code-review · verify · simplify · security-review · deep-research · pdf · xlsx · pptx · docx · dataviz · run · init · loop · schedule
