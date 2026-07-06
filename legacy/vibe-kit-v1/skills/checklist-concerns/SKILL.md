---
name: checklist-concerns
description: Catálogo de módulos transversales (checklist anti-refactor) en tabla concern → librería/repo recomendado → cuándo meterlo. Cubre roles/permisos, listas configurables, errores+logging, auditoría, i18n, feature flags, settings y multi-tenant. Es la constitución del proyecto. Usala cuando el Arquitecto diseña un spec, cuando hay que decidir qué concerns activar, o cuando una feature toca permisos, catálogos, errores, auditoría o tenant.
disable-model-invocation: false
---

# Checklist de concerns — la constitución del proyecto

Esto es el **catálogo de módulos transversales**: las cosas que SIEMPRE se olvidan al arrancar (roles, listas configurables, errores, logging, auditoría, i18n) y que después cuestan carísimo refactorear. Acá están todas, con la librería recomendada y el momento exacto de meterlas.

Tratá este archivo como la **constitución**: son las decisiones no-negociables que todo proyecto del kit debe contemplar. Antes de cerrar un spec, el Arquitecto revisa esta lista entera y deja registrado por cada concern: **activado**, **diferido (con razón)** o **no aplica (con razón)**. Nada queda implícito.

## Para qué la usás (vos que NO programás)

Pensá esto como la lista del supermercado antes de cocinar: si no la mirás, te olvidás la sal y te das cuenta cuando ya está el plato servido. Cada fila de abajo es un "ingrediente" que, si lo metés el día 1, sale gratis; si lo metés tarde, hay que rehacer media app.

La regla del kit es **default ON**: estos concerns vienen prendidos salvo que haya una razón clara para apagarlos. Es más barato dejarlos preparados que retrofitearlos.

## Triple barrera (para que NUNCA se olviden)

Cada concern que activás se materializa en tres lugares, así no se cae:

1. **Recordatorio** en `~/.claude/CLAUDE.md` (te lo recuerda siempre).
2. **Principio** en la **constitución** del proyecto (`constitution.md`).
3. **Regla** en `.claude/rules/<concern>.md` con `paths:` — así esa regla **solo entra al contexto cuando Claude toca esos archivos** (no infla el contexto base, mantiene el CLAUDE.md corto).

> **Importante (honestidad del kit):** la constitución y el CLAUDE.md son **advisory** — Claude *puede* saltárselos. Lo que DEBE pasar siempre (un gate de calidad real) va en **hooks deterministas**, no acá. Esta checklist asegura que el concern se *decida*; el hook asegura que se *cumpla*.

---

## Catálogo de módulos transversales

Tabla maestra: **concern → librería/repo recomendado → cuándo meterlo**.

| Concern | Librería / repo recomendado | Cuándo meterlo |
|---|---|---|
| **Auth + orgs / RBAC** | Supabase Auth + RLS (default) / **Better Auth** plugin `organization` | Día 1 si hay login. |
| **Permisos en UI** | **CASL** (`@casl/ability` + `@casl/react`) | Siempre que haya roles. ⚠️ Es UI, NO seguridad — la verdad la pone RLS. |
| **Permisos finos multi-servicio** | Cerbos / Permify | Solo si escalás a varios servicios (hoy es overkill). |
| **Listas / catálogos configurables** | Tablas Postgres + **Refine** o **React-Admin** | Día 1. Lo que el negocio querría cambiar sin llamarte = fila en tabla, NUNCA hardcodeado. |
| **Formularios + validación** | **react-hook-form + zod** | Todo formulario. El schema zod = fuente única (form + servidor + tipos). |
| **Tablas de datos** | **TanStack Table** + shadcn Data Table + **nuqs** | Todo listado de gestión. |
| **Dashboards / charts** | **Recharts** / **Tremor** (KPIs) / AG Grid (tipo Excel) | Tu app de objetivos comerciales → Tremor. |
| **Errores + logging** | **Sentry** (nextjs, react-native, tauri, python) | Día 1, en los 3 entornos. |
| **Analítica de producto (opc.)** | PostHog (analítica + replay + flags, self-host) | Si querés todo en una sola herramienta. |
| **Feature flags** | **OpenFeature** + **Flipt** / o tabla Supabase al inicio | Para encender/apagar sin redeploy. ⚠️ flag ≠ setting de negocio. |
| **i18n (idiomas)** | **next-intl** (web) / **i18next + expo-localization** (Expo) | Día 1 ⚠️ (carísimo de retrofitear). |
| **Auditoría / activity-log** | Triggers Postgres → tabla `audit_log` / pgAudit | Día 1 en apps tipo ERP. No es opcional. |
| **Notificaciones** | **Novu** + expo-notifications (push) + Resend / React Email | Cuando la app deba avisar algo. |
| **Multi-tenant** | Columna `tenant_id` + RLS (un solo Postgres) | ⚠️ AL INICIO o nunca. |
| **Settings / preferences** | Tablas `user_settings` / `app_settings` + Zustand / TanStack Query; next-themes | Mismo panel que los catálogos. |

---

## Checklist visual de arranque (default ON mata el refactor tardío)

Esto es lo que el Arquitecto te muestra al diseñar. **Todo lo de arriba viene prendido por default**; lo de abajo se prende solo si lo pedís. Cada concern activado se materializa en 4 lugares: **constitución + `.claude/rules/` + librería recomendada + ítem en la checklist del spec**.

**Prendidos por default (matan el refactor tardío):**

- ☑️ Roles / permisos / RBAC
- ☑️ Listas / catálogos configurables desde panel
- ☑️ Manejo de errores estándar
- ☑️ Logging / observabilidad (Sentry)
- ☑️ Auditoría / activity-log
- ☑️ i18n ⚠️ (caro de retrofitear)

**Opcionales (se prenden si aplican a tu caso):**

- ☐ Feature flags
- ☐ Notificaciones
- ☐ Settings
- ☐ Multi-tenant ⚠️ (irreversible: al inicio o nunca)

Hay **modo "aceptar todos los defaults"**: avanzás de un saque y aun así obtenés un kit completo y correcto.

---

## Reglas duras de la constitución (no-negociables)

Estas son las que el Arquitecto NUNCA debe dejar pasar:

1. **CASL ≠ RLS.** CASL decide qué se **VE** (esconde botones en la UI); RLS decide qué se puede **TOCAR** (seguridad real en la base). Siempre pedí RLS *además* de esconder botones. Esconder un botón no protege nada si el dato sigue accesible.

2. **Listas configurables = fila en tabla, NUNCA hardcodeadas.** Si el negocio (vos o tu equipo) querría cambiar una lista sin llamar al programador —categorías, sucursales, vendedores, estados, tipos de comprobante— eso va en una tabla editable desde un panel (Refine / React-Admin), no clavado en el código.

3. **Auditoría NO es opcional en apps de plata/facturación.** Si la app toca facturación, cobranzas o cualquier cosa con dinero, el `audit_log` (quién hizo qué y cuándo) va el día 1, sí o sí.

4. **Multi-tenant e i18n son decisiones irreversibles/carísimas.** Se deciden AL INICIO o (en la práctica) nunca. Si hay la mínima chance de que la app la usen clientes externos separados, o de soportar más de un idioma, se preparan desde el día 1 aunque todavía no se usen.

5. **Errores con reintento + aviso claro + registro.** Cuando algo falla (ej: el ERP no responde), la app reintenta, avisa de forma clara y registra el error en Sentry para revisarlo después. Nada de fallar en silencio.

6. **Feature flag ≠ setting de negocio.** Un *flag* enciende/apaga una feature técnica sin redeploy (lo manejás vos). Un *setting* es una preferencia del negocio que vive con los catálogos. No los mezcles en la misma tabla ni en el mismo panel.

---

## Cómo la usa el Arquitecto (paso a paso)

Cuando estés diseñando un spec con `/arquitecto`, recorré esta checklist y por **cada concern** registrá una de tres cosas en el SPEC:

1. **Activado** → qué librería de la tabla se usa y por qué.
2. **Diferido** → por qué no entra ahora y qué lo dispararía después (ej: "feature flags: diferido, no hace falta apagar nada todavía").
3. **No aplica** → por qué este proyecto no lo necesita (ej: "multi-tenant: no aplica, app de un solo usuario en su máquina").

> **Default ON:** si tenés dudas sobre un concern prendido por default, déjalo **activado**. Es más barato tenerlo preparado que retrofitearlo. Solo lo apagás con una razón explícita.

Para mapear el caso del usuario a los concerns, las preguntas de riesgo de la entrevista calzan directo acá:

- "¿Va a haber gente con distintos permisos?" → **Roles / RBAC + CASL + RLS**.
- "¿Hay listas que querrías cambiar sin pedir ayuda?" → **Listas / catálogos configurables**.
- "¿Cuándo algo falle, qué preferís?" → **Errores + logging (Sentry)**.
- "¿Necesitás saber quién hizo qué y cuándo?" → **Auditoría / activity-log**.
- "¿Idiomas?" → **i18n** (decidir el día 1).
- "¿La usan clientes externos separados?" → **Multi-tenant** (irreversible).

## Salida esperada

Al terminar, el spec debe tener una sección **"Concerns transversales"** con la tabla recorrida entera (activado / diferido / no aplica + razón), y cada concern activado se traduce en: un principio en la constitución, una regla en `.claude/rules/<concern>.md` con su `paths:`, la librería elegida de la tabla, y un ítem verificable en la checklist del spec.
