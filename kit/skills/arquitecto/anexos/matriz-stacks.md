# Matriz de stacks — golden paths por tipo de app

Mapa de decisiones para la fase DESIGN: la entrevista ya definió el tipo de app y los módulos; esta tabla dice qué tecnología va en cada capa. Si seguís el carril, todo cruza bien (tipos, auth, permisos). Versiones de era jun-2026: lo marcado **[VERIFICAR]** puede haber cambiado — validalo con investigación antes de usarlo.

## La raíz (vale para los 4 carriles)

- **Cimiento TypeScript.** UI, auth, paneles, CRUD: todo TypeScript de punta a punta. Un solo lenguaje = menos piezas que se desincronizan.
- **Supabase por defecto** (Postgres + Auth + RLS): base de datos, login y permisos de verdad en una sola pieza.
- **Python NO es cimiento.** Entra solo como especialista y siempre detrás de una frontera. Si dudás: no metas Python.

## La matriz

| Capa | Web app | Android (APK) | Windows (escritorio) | Datos / analítica (ERP) |
|---|---|---|---|---|
| **UI** | Next.js 15 [VERIFICAR] + React + shadcn/ui + Tailwind | Expo + Expo Router + NativeWind | Tauri 2 + front React (reusado de web) | Tauri 2 + React + Recharts/Tremor |
| **Datos** | Supabase (Postgres + RLS), Server Actions | El MISMO Supabase (reusás tipos + RLS) | Supabase remoto o SQLite local | Postgres (Supabase) + DuckDB local |
| **Auth** | Supabase Auth | Supabase Auth (Google nativo) | Supabase Auth (deep-link) o login local | Supabase Auth + RLS |
| **Empaquetado** | Vercel (o self-host + Docker) | EAS Build (.apk/.aab) + EAS Update OTA | bundler Tauri (.msi/.exe) + updater | bundler Tauri + updater |
| **Offline** | — | WatermelonDB / TanStack Query | SQLite si es de una sola PC | DuckDB local |
| **Python** | Solo cálculo/IA: Edge Function o FastAPI | Casi nunca en el dispositivo | **Sidecar**: PyInstaller → .exe, Tauri lo arranca | **ACÁ BRILLA**: FastAPI + pandas/polars |
| **Scaffolding** | `npx create-next-app@latest` (o boilerplate supastarter / NextBase [VERIFICAR]) | `npx create-expo-app@latest` | `npm create tauri-app@latest` | template Tauri + FastAPI sidecar |

Cómo elegir carril: **web** es el `[Recomendado]` si no hay razón fuerte para otra cosa (vive en el navegador, deploy de un click). **Android** reusa casi todo lo de web (mismo React, mismo Supabase). **Windows** reusa el front React y se instala como .msi/.exe. **Datos/analítica** es cuando el corazón es procesar datos (facturación de ERP, fórmulas, tableros) — el único carril donde Python brilla.

## REGLA DE ORO de Python (la más importante)

> Metés Python **SOLO** si hay alguna de estas tres cosas:
> 1. **Cálculo numérico / estadístico real** (fórmulas pesadas, modelos, agregaciones complejas).
> 2. **ETL de ERP / Excel** (levantar datos de un sistema externo, transformarlos, cargarlos).
> 3. **IA / ML** (modelos de machine learning, predicción, etc.).
>
> **Todo lo demás** (CRUD, auth, UI, paneles, dashboards simples) = **TypeScript.**
>
> Y nunca, jamás, mezcles lógica Python con la UI. Python siempre vive **detrás de una frontera** (una API HTTP o un sidecar que se arranca aparte).

Por qué es tan dura: meter Python "por las dudas" duplica lenguaje, dependencias y lugares donde se rompe. El sidecar Python (sobre todo en Windows/Tauri) es **la pieza más frágil de empaquetar** (rutas, puertos, firmar el .exe). Si entra el sidecar, su **runbook es obligatorio** (`docs/runbooks/`).

Dónde corre según el carril: **web** → Edge Function o FastAPI aparte, la web le pega por HTTP; **Android** → nunca en el dispositivo, vive en un servidor; **Windows** → sidecar PyInstaller; **datos** → FastAPI + pandas/polars, el front solo muestra resultados.

## Auth: Supabase Auth vs Better Auth

- **Default: Supabase Auth + RLS.** Cubre login, roles y seguridad real sin piezas extra.
- **Better Auth [VERIFICAR]** (plugin `organization`) SOLO si hay organizaciones/empresas separadas (multi-org/multi-tenant) desde el día 1. La decisión es casi irreversible: definila al inicio.
- Multi-tenant: columna `tenant_id` + RLS desde el día 1 (ver anexo `concerns.md`).

## Cómo lo usás en DESIGN

1. El tipo de app de la entrevista elige la **columna**.
2. Bajás por la columna y armás la sección DESIGN del spec: UI, Datos, Auth, Empaquetado, Offline, Python, Scaffolding.
3. Aplicás la regla de oro de Python: ¿hay cálculo/ETL/IA? Si no, todo TypeScript.
4. Cruzás con los concerns activados (anexo `concerns.md`): auth según orgs, dashboards Tremor/Recharts, offline según necesidad real.
5. Anotás las **fronteras** explícitas (sobre todo Python ↔ UI si la hay) y los contratos entre piezas.

> El Arquitecto NO escribe código: esta matriz alimenta el texto del DESIGN; después una sesión fresca ejecuta el spec.
