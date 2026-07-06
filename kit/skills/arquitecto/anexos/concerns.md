# Concerns transversales — checklist anti-refactor

Los módulos que SIEMPRE se olvidan al arrancar y después cuestan carísimo retrofitear. **Default ON**: vienen prendidos salvo razón explícita para apagarlos. Antes de cerrar un spec, recorré la lista ENTERA y registrá por cada concern: **activado** (librería + por qué) / **diferido** (razón + qué lo dispararía) / **no aplica** (razón). Nada queda implícito.

## ⚠️ Las DOS decisiones casi irreversibles — preguntá SIEMPRE explícitamente

1. **Multi-tenant** — ¿la van a usar clientes/empresas externas separadas? Si hay la mínima chance: columna `tenant_id` + RLS desde el día 1. Retrofitear implica tocar CADA tabla, CADA query y CADA política de seguridad. **Al inicio o nunca.**
2. **i18n** — ¿más de un idioma alguna vez? Si sí: `next-intl` (web) / `i18next + expo-localization` (Expo) desde el día 1. Retrofitear implica cazar cada string hardcodeado en toda la app. Carísimo.

## Catálogo (default ON)

| Concern | En criollo | Librería / patrón | Se materializa en |
|---|---|---|---|
| **Roles / permisos** | Quién puede ver y tocar qué | **RLS en la DB** (seguridad real) + **CASL** (`@casl/ability` + `@casl/react`) en la UI | Spec: matriz rol×acción. CLAUDE.md: regla "toda tabla nueva con RLS" |
| **Listas configurables** | Categorías, sucursales, estados que el negocio cambia solo | Tablas Postgres + panel **Refine** o **React-Admin** | Spec: lista de catálogos. CLAUDE.md: regla "fila en tabla, nunca hardcode" |
| **Errores estándar** | Cuando algo falla: reintenta, avisa claro, registra | Patrón reintento + toast + Sentry | Spec: comportamiento ante fallas por integración |
| **Logging / observabilidad** | Ver qué pasó cuando algo se rompió en producción | **Sentry** (nextjs, react-native, tauri, python) — día 1, en todos los entornos | Spec: Sentry en cada entorno. CLAUDE.md: DSN + convención |
| **Auditoría / activity-log** | Quién hizo qué y cuándo | Triggers Postgres → tabla `audit_log` (o pgAudit) | Spec: qué tablas se auditan. Regla en el CLAUDE.md del proyecto |
| **Dashboards** | Tableros de KPIs y gráficos | **Tremor** (KPIs/objetivos) / **Recharts** (a medida) / AG Grid (tipo Excel) | Spec: qué métricas muestra cada tablero |
| **Settings / preferences** | Preferencias de usuario y de la app | Tablas `user_settings` / `app_settings` + Zustand / TanStack Query; next-themes | Spec: mismo panel que los catálogos |
| **Notificaciones** | La app avisa cosas (push, mail) | **Novu** + expo-notifications + Resend / React Email | Spec: qué eventos disparan aviso y por qué canal |
| **Feature flags** | Prender/apagar features sin redeploy | **OpenFeature** + Flipt / o tabla Supabase al inicio | Spec: qué features nacen apagadas |

Complementos habituales (no son concerns pero van con ellos): **react-hook-form + zod** en todo formulario (el schema zod = fuente única: form + servidor + tipos); **TanStack Table + shadcn Data Table + nuqs** en todo listado de gestión.

## Reglas duras (no-negociables, conservadas del v1)

1. **CASL ≠ RLS.** CASL decide qué se **VE** (esconde botones en la UI); RLS decide qué se puede **TOCAR** (seguridad real en la base). Siempre pedí RLS *además* de esconder botones. **Esconder un botón no protege nada si el dato sigue accesible.**
2. **Listas configurables = fila en tabla, NUNCA hardcodeadas.** Si el negocio querría cambiar una lista sin llamar al programador —categorías, sucursales, vendedores, estados, tipos de comprobante— va en tabla editable desde panel, no clavada en el código.
3. **Auditoría NO es opcional en apps de plata/facturación.** Si la app toca facturación, cobranzas o dinero, el `audit_log` va el día 1, sí o sí.
4. **Multi-tenant e i18n se deciden AL INICIO o nunca.** Se preparan desde el día 1 aunque todavía no se usen.
5. **Errores con reintento + aviso claro + registro.** Nada de fallar en silencio.
6. **Feature flag ≠ setting de negocio.** Un flag apaga una feature técnica sin redeploy; un setting es preferencia del negocio y vive con los catálogos. No los mezcles en la misma tabla ni panel.

## Preguntas de entrevista → concern

- "¿Gente con distintos permisos?" → Roles / RLS + CASL
- "¿Listas que cambiarías sin pedir ayuda?" → Catálogos configurables
- "¿Cuando algo falle, qué preferís?" → Errores + Sentry
- "¿Necesitás saber quién hizo qué?" → Auditoría
- "¿Idiomas?" → i18n ⚠️ (día 1)
- "¿Clientes externos separados?" → Multi-tenant ⚠️ (irreversible)

## Salida esperada en el spec

Sección **"Concerns transversales"** con la tabla recorrida entera (activado / diferido / no aplica + razón). Cada concern activado se traduce en TRES lugares: (1) la librería/patrón elegido, en el stack del SPEC-0; (2) una regla de 1 línea en las "Restricciones duras" del CLAUDE.md del proyecto; (3) un criterio de aceptación verificable en el SPEC-0.

> Honestidad: el CLAUDE.md es **advisory** — Claude puede saltárselo. Lo que DEBE cumplirse siempre va en **hooks deterministas**. Esta checklist asegura que el concern se *decida*; el hook asegura que se *cumpla*.
