---
name: matriz-de-stacks
description: Matriz de stacks (golden paths) por tipo de app (web Next.js, Android Expo, Windows Tauri, datos Tauri+FastAPI sidecar), con la regla de oro de cuando entra Python. Usala en la fase DESIGN del Arquitecto, una vez que ya sabes el tipo de app y los modulos, para elegir el stack de cada capa sin reinventar nada. Es un mapa de decisiones, no una entrevista.
---

# Matriz de stacks (golden paths)

Esta skill es el **mapa de stacks recomendados** del kit. La usa el Arquitecto en la fase **DESIGN**: cuando la entrevista ya decidio el tipo de app (web / Android / Windows / datos) y los modulos, esta tabla dice **que tecnologia poner en cada capa** sin tener que pensarla de cero cada vez. Son caminos probados (*golden paths*): si seguis el carril, todo cruza bien (los tipos, el auth, los permisos) y no caes en sorpresas.

No es una entrevista ni hace preguntas. Es la referencia que el Arquitecto consulta para escribir la seccion DESIGN del spec (que stack, que archivos, que fronteras). Las decisiones de **que** construir salen de la entrevista; esta skill resuelve el **como** tecnico.

---

## La raiz (vale para los 4 carriles)

- **Cimiento JS/TypeScript.** Todo arranca en JavaScript/TypeScript. Es el lenguaje base: la UI, el auth, los paneles, el CRUD. Un solo lenguaje de punta a punta = menos piezas que se desincronizan.
- **Supabase por defecto** (Postgres + Auth + RLS). Te da en una sola pieza: la base de datos, el login y los permisos de verdad (RLS = quien puede tocar que, a nivel del motor, no solo esconder botones).
- **Python NO es cimiento.** Python entra **solo como especialista**, y siempre **detras de una frontera** (una API HTTP o un sidecar). Nunca se mezcla la logica Python con la UI. Si dudas, la respuesta por default es: no metas Python.

---

## La matriz

Las columnas son los 4 carriles (tipos de app). Las filas son las capas que hay que resolver en cada proyecto. El Arquitecto baja por la columna del carril que toco y arma el DESIGN con esos valores.

| Capa | Web app | Android (APK) | Windows (escritorio) | App de datos / analitica (tu ERP) |
|---|---|---|---|---|
| **UI** | Next.js 15 + React + shadcn/ui + Tailwind | Expo + Expo Router + NativeWind | Tauri 2 + front React (reusado) | Tauri 2 + React + dashboards (Recharts/Tremor) |
| **Datos** | Supabase (Postgres + RLS), Server Actions | El MISMO Supabase (reusas tipos + RLS) | Supabase remoto o SQLite local | Postgres (Supabase) + DuckDB local |
| **Auth** | Supabase Auth (o Better Auth si hay orgs) | Supabase Auth (Google nativo) | Supabase Auth (deep-link) o login local | Supabase Auth + RLS |
| **Empaquetado** | Vercel (o self-host + Docker) | EAS Build (.apk/.aab) + EAS Update OTA | bundler Tauri (.msi/.exe) + updater | bundler Tauri + updater |
| **Offline** | — | WatermelonDB / TanStack Query | SQLite si es de una sola PC | DuckDB local |
| **Rol de Python** | Solo calculo/IA: Edge Function o FastAPI | Casi nunca en el dispositivo | **Sidecar**: Python -> PyInstaller a .exe, Tauri lo arranca | **AQUI BRILLA**: FastAPI + pandas/polars para formulas y ETL del ERP |
| **Boilerplate** | supastarter / NextBase | create-expo-app | create-tauri-app | template Tauri + FastAPI sidecar |

---

## Como leer cada carril (en castellano, sin jerga)

- **Web app.** La opcion mas comun y la mas simple. Vive en el navegador, se entra desde cualquier compu. Next.js para la pantalla, Supabase para datos+login+permisos, se publica en Vercel de un click. Es el `[Recomendado]` cuando no hay una razon fuerte para otra cosa.
- **Android (APK).** App para el celular. Se construye con Expo (mismo React, mismo Supabase: reusas casi todo lo de web). Si la app tiene que andar sin internet, se decide entre WatermelonDB (offline de verdad) o TanStack Query (cachea, pero necesita conexion). Se empaqueta con EAS y hasta podes actualizarla por aire (OTA) sin volver a publicar.
- **Windows (escritorio).** Programa que se instala en la maquina (.msi/.exe). Se hace con Tauri 2, que **reusa el mismo front de React** que ya tenes de web. Los datos pueden ir a Supabase remoto o quedarse locales en SQLite si es para una sola PC.
- **App de datos / analitica (tu caso ERP).** Cuando el corazon es procesar datos: levanta facturacion del ERP, aplica formulas, arma tableros y un modulo de objetivos comerciales. Es el unico carril donde **Python brilla**: un FastAPI con pandas/polars hace el laburo pesado, detras de una frontera, y Tauri lo arranca como sidecar.

---

## REGLA DE ORO de Python (la mas importante de esta skill)

> Metes Python **SOLO** si hay alguna de estas tres cosas:
> 1. **Calculo numerico / estadistico real** (formulas pesadas, modelos, agregaciones complejas).
> 2. **ETL de ERP / Excel** (levantar datos de un sistema externo, transformarlos, cargarlos).
> 3. **IA / ML** (modelos de machine learning, prediccion, etc.).
>
> **Todo lo demas** (CRUD, auth, UI, paneles, dashboards simples) = **TypeScript.**
>
> Y nunca, jamas, mezcles logica Python con la UI. Python siempre vive **detras de una frontera** (una API HTTP o un sidecar que se arranca aparte).

Por que esta regla es tan dura: meter Python "por las dudas" duplica el lenguaje, las dependencias y los lugares donde se rompe. El sidecar Python (sobre todo en Windows/Tauri) es **la pieza mas fragil de empaquetar** (rutas, puertos, firmar el .exe). Por eso solo entra cuando paga: si no hay calculo pesado, ETL o IA, la respuesta correcta es **no hay Python**.

### Donde corre Python segun el carril

- **Web:** si hace falta, va como Edge Function o un FastAPI aparte. La web le pega por HTTP.
- **Android:** casi nunca en el dispositivo. Si hay calculo pesado, vive en un servidor y el celu lo consume por API.
- **Windows:** como **sidecar** — el codigo Python se compila a un .exe con PyInstaller y Tauri lo arranca al abrir la app.
- **Datos (tu ERP):** aca es donde tiene mas sentido. FastAPI + pandas/polars hace las formulas y el ETL; el front (Tauri/React) solo muestra resultados.

> Recordatorio del playbook: si entra el sidecar Python, su **runbook es obligatorio** (es lo mas dificil de empaquetar). Va en `docs/runbooks/`.

---

## Como usa esto el Arquitecto en DESIGN

1. Toma el **tipo de app** que salio de la entrevista (la pregunta raiz P6 de `entrevista-descubrimiento`). Eso elige la **columna**.
2. Baja por esa columna y arma la seccion DESIGN del spec con cada capa: UI, Datos, Auth, Empaquetado, Offline, Python, Boilerplate.
3. Aplica la **regla de oro de Python**: revisa la respuesta de la pregunta de datos (P11) y decide si Python entra (calculo/ETL/IA) o si va todo en TypeScript.
4. Cruza con los modulos transversales que se activaron: el stack de Auth depende de si hay orgs (Supabase Auth por default, **Better Auth** si hay organizaciones/multi-tenant); los dashboards salen de Tremor/Recharts; etc. Para el detalle de cada modulo y su libreria, mira la skill `checklist-concerns`.
5. Anota en el DESIGN las **fronteras** explicitas (sobre todo la frontera Python <-> UI si la hay) y los **contratos** entre piezas.

> El handoff: el Arquitecto NO escribe codigo. Esta skill alimenta el texto del DESIGN; despues una sesion fresca ejecuta el spec.

---

## Decisiones que cruzan con otras skills

- **Auth (Supabase vs Better Auth).** Por default Supabase Auth + RLS. Salta a **Better Auth** solo si hay organizaciones/empresas separadas (multi-tenant). Esa decision sale de la entrevista (P8) y es casi irreversible: definila al inicio.
- **Multi-tenant.** Si hay varias empresas separadas en la misma app, se agrega columna `tenant_id` + RLS desde el dia 1. Es de las decisiones mas caras de retrofitear.
- **Offline (solo Android/Windows).** WatermelonDB si la app tiene que andar de verdad sin internet; TanStack Query si alcanza con cachear. En Windows de una sola PC, SQLite local.
- **Dashboards.** Tremor para KPIs/objetivos comerciales, Recharts para graficos a medida. Solo si la entrevista marco que se quieren tableros (P12).

---

## Skills relacionadas

- `entrevista-descubrimiento` — define el tipo de app (P6) y la necesidad de Python (P11); es lo que llena la columna a elegir.
- `checklist-concerns` — el catalogo de modulos transversales con la libreria recomendada de cada uno (Auth, permisos, listas, errores, dashboards, i18n, auditoria, etc.). Complementa esta matriz en la capa de modulos.
- `escribir-spec` — toma este stack elegido y lo persiste en la seccion DESIGN del SPEC en disco.
