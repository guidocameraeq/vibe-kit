# BLUEPRINT — `vibe-kit`: tu sistema reusable de vibe coding con Claude Code

> Resultado de un workflow multi-agente (investigar → diseñar 3 conceptos → panel de 3 jueces → síntesis). Todo lo que se nombra existe y corre en jun-2026.

## Veredicto del panel

| Concepto | Juez 1 | Juez 2 | Juez 3 | Veredicto |
|---|---|---|---|---|
| **A — CC-Kit (plugin nativo)** | 53 | 53 | 51 | Ganó 2 de 3 |
| **C — Híbrido (Arrancador + Kit)** | 50 | 52 | **53** | Empate técnico |
| **B — Forge (web wizard)** | 42 | 42 | 43 | Tercero, los 3 jueces |

Decisión: **construir A** (plugin nativo) **e injertarle** el contrato `project.yaml` y el arrancador externo de C, más la pantalla-checklist visual de concerns de B.

---

## 1) La herramienta recomendada

Un **plugin de Claude Code** — **`vibe-kit`** — distribuido como un **marketplace privado en un repo de GitHub tuyo**. Empaqueta en una unidad instalable y versionada: skills + subagents + slash commands + hooks + plantillas de CLAUDE.md + constitución.

Tres injertos:

1. **Contrato `project.yaml`** (de C): archivo chico, casi en lenguaje natural, en la raíz de cada proyecto. Declara qué es el proyecto (stack + concerns activos + política de orquestación). Las skills lo leen; vos lo editás a mano si hace falta. Es tu única fuente de verdad **portable** (sobrevive a cambiar de PC; la auto-memory no).
2. **Arrancador externo estático opcional** (de C): `npx create-vibe-app` (o web estática en GitHub Pages, sin servidor) que hace el cuestionario y escribe el `project.yaml`. Para el arranque en frío, antes de tener un Claude Code con contexto. Opcional — el camino canónico es la skill `/nueva-app`.
3. **Checklist visual de concerns con default ON** (de B): en el arranque VES y CONFIRMÁS los concerns transversales (roles, listas, errores, logging…) como lista marcable. Dentro de Claude Code se hace con `AskUserQuestion` multi-select.

### Por qué este formato

| Opción | Veredicto | Por qué |
|---|---|---|
| **Plugin de Claude Code** ✅ | Elegido | Vive donde ya trabajás (VSCode). Cero servidores/web externa que mantener. Una sola actualización: `/plugin update`. Aprovecha Claude Code al máximo (skills, subagents, hooks, Spec Kit). |
| **Web wizard (B)** ❌ | Descartado | Mayor superficie de mantenimiento (app Next.js que cuidar). Mejora solo ~5% del tiempo (el arranque). Reintroduce copiar/pegar. No usa Claude Code, lo envuelve. |
| **Híbrido puro (C)** ⚠️ | Injertado | Sus ideas (contrato + arrancador) son oro y las robamos. Pero como producto entero suma dos piezas + un schema que se pueden desincronizar. |

**Lo que pesó:** mínima superficie de mantenimiento + modelo mental simple. El plugin es una sola pieza nativa, sin nada corriendo afuera. El contrato de C cura su punto débil (estado local + arranque en frío) y la checklist de B hace visible el dolor #1 (concerns olvidados).

---

## 2) Cómo funciona, de punta a punta (para quien NO programa)

Modelo mental: **vos dirigís y aprobás en lenguaje natural; Claude ejecuta; los hooks hacen el control de calidad por vos.** Nunca leés código.

1. **Instalás el kit una vez:** `/plugin install vibe-kit@tu-marketplace`. Copia tu golden path a `~/.claude/CLAUDE.md` y deja skills/comandos/subagents/hooks en TODOS tus proyectos.
2. **Arrancás un proyecto (~3-5 min):** skill `/nueva-app` (6-9 preguntas con `AskUserQuestion` + checklist de concerns) — o `npx create-vibe-app` afuera. Ambas escriben el mismo `project.yaml`.
3. **Bootstrap (~3-5 min):** `/kit:bootstrap` lee el `project.yaml` y de forma determinista: corre el scaffolder correcto (o forkea un boilerplate con RBAC), escribe el `CLAUDE.md`, crea `.claude/rules/`, escribe la constitución, arma `docs/` e instala el Stop hook.
4. **Planificás una feature:** `/kit:new-feature` → entrevista + Spec Kit (`/speckit.specify` → `/clarify` → `/plan` en plan mode). Un subagent **arquitecto** cuestiona el diseño. **Vos revisás SPEC y PLAN en español, no el código.**
5. **Implementás:** sesiones cortas (una por tarea), `/speckit.tasks` → `/speckit.implement`. Un **Stop hook** corre lint + typecheck + test al cerrar cada turno. Pedís **evidencia**, no un "listo".
6. **Las docs se mantienen solas:** PostToolUse hook marca cambios que tocan API/roles/comportamiento; el subagent **doc-keeper** (`/kit:docs-check`) compara docs+CLAUDE.md+`project.yaml` vs. código real.
7. **Release:** `/kit:release` en su propio chat → Conventional Commits + versión + CHANGELOG + PR con `gh`. Revisás el PR en lenguaje natural.

---

## 3) El cuestionario de arranque

Adaptativo y corto. Captura SOLO decisiones que se toman una vez y casi no cambian. Lo ambiguo se marca `NEEDS_CLARIFICATION` en vez de inventar.

| # | Pregunta | Ramifica a |
|---|---|---|
| 1 | **¿Qué tipo de app?** (web / Android / Windows / datos) | Pregunta raíz: fija el carril y el stack. |
| 2 | Nombre + descripción de 1 línea | Primera línea del `CLAUDE.md`. |
| 3 | **Entidades del dominio** (ej: facturas, clientes, objetivos) | Sección Entities del super-prompt. |
| 4 | **¿Necesita login?** | NO → sin auth. SÍ → pregunta 5. |
| 5 | **¿Multi-equipo / organizaciones desde el día 1?** | SÍ → **Better Auth**. NO → **Supabase Auth + RLS** (default). |
| 6 | **¿Multi-tenant?** ⚠️ IRREVERSIBLE | SÍ → módulo `tenant_id` + RLS. |
| 7 | **¿Qué roles/permisos?** (default ON) | Genera `rules/roles-permisos.md` (RLS + CASL en UI). |
| 8 | **¿Cálculo numérico real / ETL de ERP / IA-ML?** | NO → todo TypeScript. SÍ → activa Python. |
| 9 | **Fuentes de datos** (ERP, Excel, API externa) | Decide si entra Python y la frontera. |
| 10 | **¿Idiomas?** ⚠️ caro de retrofitear | Estructura i18n desde el día 1. |
| 11 | (Android) **¿Offline-first?** | SÍ → WatermelonDB. NO → TanStack Query. |
| 12 | **¿Realtime?** | Supabase Realtime. |
| 13 | **¿GitHub + releases automáticos?** | Activa `/kit:release`. |
| 14 | **Nivel de rigor** (liviano / estándar / estricto) | Cuántos gates de aprobación. |
| 15 | **Deploy** (Vercel / self-host / EAS / Tauri bundler) | Según tipo de app. |

### Checklist de concerns (todo default ON — mata el refactor tardío)
Cada concern activado se materializa en 4 lugares: constitución + `.claude/rules/` + librería recomendada + ítem en `/speckit.checklist`.

- ☑️ Roles / permisos / RBAC · ☑️ Listas/catálogos configurables desde panel · ☑️ Manejo de errores estándar · ☑️ Logging/observabilidad (Sentry) · ☑️ Auditoría/activity-log · ☑️ i18n ⚠️
- ☐ Feature flags · ☐ Notificaciones · ☐ Settings · ☐ Multi-tenant ⚠️

Hay **modo "aceptar todos los defaults"**: avanzás de un saque y aun así obtenés un kit completo y correcto.

---

## 4) Biblioteca de super prompts / kits

**No hay un "super prompt mágico" único.** Funciona una **secuencia de prompts angostos con gates de aprobación**. Los prompts son artefactos versionados del plugin, rellenados con las variables del `project.yaml`. Nunca copiás/pegás: invocás skills.

Cada prompt de arquitectura usa el esqueleto **REASONS** (Requirements, Entities, Approach, Structure, Operations, Norms, Safeguards). Las 3 últimas son el límite anti-alucinación, y ahí va tu checklist de concerns.

| # | Prompt / comando | Chat | Entrega |
|---|---|---|---|
| P0 | `/speckit.constitution` | Arquitectura | `constitution.md` (principios no-negociables). Una vez por proyecto. |
| P1 | Interview + `/speckit.specify` | Arquitectura | `SPEC.md` (qué construir y por qué, en español). |
| P2 | `/speckit.clarify` | Arquitectura | Preguntas que matan ambigüedad. Tu red de seguridad. |
| P3 | `/speckit.plan` (plan mode) | Arquitectura | Plan técnico. El subagent arquitecto lo cuestiona. Genera ADR. |
| P4 | `/speckit.analyze` + `/checklist` | Arquitectura | Chequea inconsistencias y que cada concern fue contemplado. |
| P5 | `/speckit.tasks` | Arquitectura | Tareas chicas revisables. |
| P6…Pn | `/speckit.implement` (una tarea/chat) | Implementación | Código + evidencia de verificación. |
| P-rel | `/kit:release` | Release | Commits + versión + CHANGELOG + PR. |
| P-doc | `/kit:docs-check` | Cualquiera | Reporte de drift docs↔código↔`project.yaml`. |

Los specs/ADRs exitosos se acumulan en `docs/`; los patrones que se repiten se promueven a nuevas `rules/` del plugin → cada proyecto nuevo hereda criterio.

---

## 5) Matriz de stacks (golden paths)

**Raíz:** cimiento **JS/TypeScript**; **Supabase** (Postgres + Auth + RLS) por defecto; **Python NO es cimiento** — entra solo como especialista, siempre detrás de una frontera (API HTTP o sidecar).

| Capa | Web app | Android (APK) | Windows (escritorio) | App de datos / analítica (tu ERP) |
|---|---|---|---|---|
| **UI** | Next.js 15 + React + shadcn/ui + Tailwind | Expo + Expo Router + NativeWind | Tauri 2 + front React (reusado) | Tauri 2 + React + dashboards (Recharts/Tremor) |
| **Datos** | Supabase (Postgres + RLS), Server Actions | El MISMO Supabase (reusás tipos + RLS) | Supabase remoto o SQLite local | Postgres (Supabase) + DuckDB local |
| **Auth** | Supabase Auth (o Better Auth si orgs) | Supabase Auth (Google nativo) | Supabase Auth (deep-link) o login local | Supabase Auth + RLS |
| **Empaquetado** | Vercel (o self-host + Docker) | EAS Build (.apk/.aab) + EAS Update OTA | bundler Tauri (.msi/.exe) + updater | bundler Tauri + updater |
| **Offline** | — | WatermelonDB / TanStack Query | SQLite si single-PC | DuckDB local |
| **Rol de Python** | Solo cálculo/IA: Edge Function o FastAPI | Casi nunca en el dispositivo | **Sidecar**: Python → PyInstaller a .exe, Tauri lo arranca | **AQUÍ BRILLA:** FastAPI + pandas/polars para fórmulas y ETL del ERP |
| **Boilerplate** | supastarter / NextBase | create-expo-app | create-tauri-app | template Tauri + FastAPI sidecar |

**Regla de oro Python:** metés Python SOLO si hay (1) cálculo numérico/estadístico real, (2) ETL de ERP/Excel, o (3) IA/ML. Todo lo demás (CRUD, auth, UI, paneles, dashboards simples) = TypeScript. Nunca mezcles lógica Python con la UI.

---

## 6) Catálogo de módulos transversales (checklist anti-refactor)

Triple barrera para que nunca se olviden: (1) recordatorio en `~/.claude/CLAUDE.md`, (2) principio en la constitución, (3) regla en `.claude/rules/<concern>.md` con `paths:` (carga solo cuando Claude toca esos archivos).

| Concern | Librería / repo recomendado | Cuándo meterlo |
|---|---|---|
| **Auth + orgs/RBAC** | Supabase Auth + RLS (default) / **Better Auth** plugin `organization` | Día 1 si hay login. |
| **Permisos en UI** | **CASL** (`@casl/ability` + `@casl/react`) | Siempre con roles. ⚠️ Es UI, NO seguridad — la verdad la pone RLS. |
| **Permisos finos multi-servicio** | Cerbos / Permify | Solo si escalás a varios servicios (hoy overkill). |
| **Listas / catálogos configurables** | Tablas Postgres + **Refine** o **React-Admin** | Día 1. Lo que el negocio querría cambiar sin llamarte = fila en tabla, NUNCA hardcode. |
| **Formularios + validación** | **react-hook-form + zod** | Todo formulario. El schema zod = fuente única (form + servidor + tipos). |
| **Tablas de datos** | **TanStack Table** + shadcn Data Table + **nuqs** | Todo listado de gestión. |
| **Dashboards / charts** | **Recharts** / **Tremor** (KPIs) / AG Grid (tipo Excel) | Tu app de objetivos comerciales → Tremor. |
| **Errores + logging** | **Sentry** (nextjs, react-native, tauri, python) | Día 1, en los 3 entornos. |
| **Analítica de producto (opc.)** | PostHog (analítica + replay + flags, self-host) | Si querés todo en una herramienta. |
| **Feature flags** | **OpenFeature** + **Flipt** / o tabla Supabase al inicio | Para encender/apagar sin redeploy. ⚠️ flag ≠ setting de negocio. |
| **i18n** | **next-intl** (web) / **i18next + expo-localization** (Expo) | Día 1 ⚠️ (carísimo de retrofitear). |
| **Auditoría / activity-log** | Triggers Postgres → tabla `audit_log` / pgAudit | Día 1 en apps ERP. No opcional. |
| **Notificaciones** | **Novu** + expo-notifications (push) + Resend/React Email | Cuando la app deba avisar. |
| **Multi-tenant** | Columna `tenant_id` + RLS (un solo Postgres) | ⚠️ AL INICIO o nunca. |
| **Settings / preferences** | Tablas `user_settings` / `app_settings` + Zustand/TanStack Query; next-themes | Mismo panel que los catálogos. |

---

## 7) Playbook de orquestación de Claude Code

### Estructura del `CLAUDE.md` (3 niveles)
**Regla #1:** corto. **<150-200 líneas, ideal 30-80.** Un CLAUDE.md inflado hace que Claude IGNORE tus reglas reales. Test por línea: *"¿borrarla causaría que Claude se equivoque?"* Si no → borrala.

- **`~/.claude/CLAUDE.md`** (global): golden path personal + estilo + checklist corto de concerns. <80 líneas.
- **`./CLAUDE.md`** (raíz del proyecto, a git): 1) descripción 1 línea · 2) tech stack con versiones · 3) **comandos exactos** (build/test/lint/run/deploy) ← mayor ROI · 4) arquitectura: 3-5 directorios clave · 5) reglas de estilo no-default · 6) etiqueta de repo · 7) gotchas/env · 8) boundaries ✅/⚠️/🚫.
- **`./CLAUDE.local.md`** (notas personales, gitignored).
- **`CLAUDE.md` por subcarpeta** (`web/`, `mobile/`, `desktop/`, `data-python/`): se cargan on-demand sin inflar el contexto base.
- **NO pongas:** lo que Claude deduce leyendo código, convenciones estándar, docs de API (linkealas), nada que cambie seguido, descripciones archivo-por-archivo, reglas que un linter ya impone.

### Documentación viva y cómo verificar que no quede stale
**Dos sistemas de memoria:** (1) **CLAUDE.md** = lo que escribís vos; (2) **auto-memory** = lo que Claude escribe solo en `~/.claude/projects/<proyecto>/memory/` (ON por defecto). ⚠️ La auto-memory es **local, no se versiona** → lo crítico vive en `project.yaml` + `docs/` committeados.

Jerarquía de docs: `README.md` (humanos) · `CLAUDE.md` (<200 líneas) · `.claude/rules/*.md` (por tema, con `paths:`) · `docs/adr/` (decisiones, formato MADR, inmutables, nacen del `/plan`) · `docs/architecture.md` + `data-model.md` · **API docs auto-generadas** (`supabase gen types` en CI) · `docs/runbooks/` (**incluido el del sidecar Python**, lo más frágil).

**Anti-drift en capas por costo:**
1. **Barato, por turno:** PostToolUse hook → "¿este cambio afecta API/roles/comportamiento? ¿qué doc tocar?"
2. **Medio, bajo demanda:** `/kit:docs-check` → subagent doc-keeper compara CLAUDE.md + docs + `project.yaml` vs. código.
3. **Cierre de turno:** Stop hook verifica funciones nuevas documentadas.
4. **Profundo, periódico (opc.):** cron / GitHub Action semanal que revisa commits y abre PR de docs.

**Regla de oro en CLAUDE.md:** *"cuando la realidad diverge, arreglá el spec/doc PRIMERO, después el código"* + *"tras una feature, actualizá CLAUDE.md y docs/ en el mismo commit"*. Doc viva = parte del Definition of Done.

### Estrategia de chats / sesiones
**Modelo:** 1 proyecto = varias sesiones nombradas; **1 sesión = 1 tarea coherente**; contexto siempre **<~60%**.

| Tipo de chat | Cuántos | Qué hace | Cuándo abrir uno nuevo |
|---|---|---|---|
| **Arquitectura / spec** | 1 por feature grande | constitution/specify/clarify/plan/tasks en plan mode → spec + plan + ADR | Al empezar una feature grande |
| **Implementación** | 1+ por feature (corto) | tasks/implement con verificación; se cierra al terminar | Por cada tarea grande |
| **Release** | 1 por release | `/kit:release` | En cada release |
| **Review** | 1 fresco | revisión adversarial en contexto limpio | Para revisar código recién escrito |

- **`/clear`** entre tareas no relacionadas. **NUNCA** mezcles features (antipatrón "kitchen sink").
- **Antipatrón "corregir una y otra vez":** si corregiste lo mismo 2+ veces, el contexto está envenenado → `/clear` + prompt mejor. Sesión limpia > sesión larga contaminada.
- **`/compact`** (resume, preserva código/decisiones) a ~60% vs **`/clear`** (borra todo). Guardá lo importante en CLAUDE.md/`project.yaml` ANTES de `/clear`.
- Sesiones nombradas como branches: `/rename`, `claude --continue`/`--resume`. La continuidad entre chats la dan CLAUDE.md + auto-memory + ADRs + `project.yaml`.

### Subagents, slash commands, plan mode, hooks
- **Subagents** (contexto aislado, 3-5 máx): **arquitecto** (cuestiona el diseño en `/plan`), **doc-keeper** (drift), **reviewer** (adversarial, solo gaps de correctitud/requisitos). Ediciones con aprobación en el chat padre.
- **Slash commands:** `/nueva-app`, `/kit:new-feature`, `/kit:release`, `/kit:docs-check`, `/kit:bootstrap`, `/nueva-decision-adr`.
- **Plan mode** (read-only duro, Shift+Tab): SIEMPRE para features multi-archivo o approach desconocido. Saltable solo en cambios triviales.
- **Hooks** (deterministas — garantizan lo que CLAUDE.md solo sugiere): **Stop hook** (lint/typecheck/test), PostToolUse (marca docs), PreToolUse (bloquea escrituras peligrosas, ej. `/migrations`). ⚠️ No hay hooks nativos pre/post-commit todavía; usá el Stop hook o un git hook clásico.
- **Cuándo usar qué:** slash command = template de prompt; skill = lógica de dominio + archivos; subagent = trabajo aislado/paralelo; **hook = imponer una regla con código**.

### Releases / git para no-programador
- **Conventional Commits** (Claude los genera) + **semantic-release / git-cliff** → versión semántica + CHANGELOG automáticos.
- Siempre **feature branches + PRs** (Claude crea ambos). Revisás el **PR en lenguaje natural, no el diff**.
- Instalá el **`gh` CLI**.
- Regla: 1 feature = 1 spec = 1 rama = 1 PR = update de docs.
- Los checkpoints de Claude (`/rewind`, Esc+Esc) NO son git — seguí commiteando de verdad.

---

## 8) Roadmap por fases

### FASE 0 — Primer entregable rápido (1ª sesión, ~1-2 h) ⭐
1. Escribir `~/.claude/CLAUDE.md` global (golden path + checklist). <80 líneas.
2. Crear el repo del plugin `vibe-kit`: `project.yaml` de ejemplo, plantilla de `CLAUDE.md`, `rules/` de los 4 concerns que más duelen (roles-permisos, listas-configurables, errores-y-logging, auditoría), constitución base.
3. Instalar Spec Kit + `gh` CLI.
4. **Entregable:** correr el flujo a mano en tu **caso Windows real (facturación ERP)**: cuestionario → `project.yaml` → CLAUDE.md + constitución + rules + primer SPEC del módulo de objetivos. Todo en español, sin una línea de código. **Salís con la arquitectura de tu app más dolorosa ya planteada.**

### FASE 1 — Skills y comandos núcleo (semana 1)
`/nueva-app`, `/kit:bootstrap`, `/kit:new-feature`, Stop hook de verificación.

### FASE 2 — Documentación viva + release (semana 2)
doc-keeper + `/kit:docs-check`, `/kit:release`, PostToolUse hook, subagents arquitecto y reviewer.

### FASE 3 — Arranque externo + pulido (semana 3-4, opc.)
`npx create-vibe-app` estático, StackResolver data-driven, BoilerplatePicker, auditoría semanal de drift.

### FASE 4 — Mantenimiento continuo
`/kit-update` cada 2-3 meses (Claude prueba el kit en sandbox y reporta qué envejeció), promoción de patrones a `rules/`, `consolidate-memory` cada 1-2 semanas.

---

## 9) Riesgos y trade-offs (honestos)

1. **Ecosistema que cambia rápido.** Spec Kit/scaffolders/hooks/auto-memory cambiaron fuerte en 2026. El kit envejece. *Mitigación:* data-driven + `/kit-update` + versiones pineadas. No hay auto-actualización mágica.
2. **CLAUDE.md y constitución son advisory.** Claude puede saltarse reglas. *Mitigación:* lo que DEBE pasar siempre va en **hooks deterministas**, no en CLAUDE.md.
3. **La doc viva cuesta tokens o disciplina.** Nadie garantiza doc actualizada gratis. *Mitigación:* capas por costo.
4. **El éxito depende de TU disciplina de sesiones.** Si volvés al mega-chat o aprobás specs a ciegas, el kit pierde valor. Leer el SPEC y el PLAN en español es innegociable.
5. **CASL ≠ RLS.** CASL decide qué se VE; RLS qué se puede TOCAR. Exigí siempre RLS además de esconder botones.
6. **El sidecar Python (Tauri/Windows) es lo más frágil de empaquetar** (rutas, puertos, firmar .exe). Por eso su runbook es obligatorio.
7. **El contrato `project.yaml`** agrega un archivo y un riesgo chico de desincronización. *Mitigación:* `schema_version` con semver; las skills avisan si no matchea.
8. **Subagents siempre encuentran "gaps".** Instruilos para reportar solo correctitud/requisitos, no sobre-ingeniería.

---

**En una línea:** construimos `vibe-kit`, un plugin de Claude Code + el contrato `project.yaml` + la checklist visual de concerns. Vive donde ya trabajás, sin nada corriendo afuera, hereda tu criterio en cada proyecto, y convierte tus tres dolores —arranque en frío, concerns olvidados, arquitectura difícil— en un flujo repetible donde vos revisás español, no código.
