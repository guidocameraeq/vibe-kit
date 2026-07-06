# Banco de preguntas — entrevista de descubrimiento

Banco único del Arquitecto para apps nuevas (greenfield) o features grandes. Si la app YA existe (brownfield), primero explorá el código y anclá las preguntas a lo encontrado — no uses este banco a ciegas.

## Mecánica (no negociable)

- **Una pregunta por vez** con `AskUserQuestion` (tandas de 2 como máximo). Máx **4 opciones** por pregunta, `header` ≤12 caracteres, `multiSelect: true` donde aplique (entidades, checklist de concerns). La opción libre "Otra" la agrega sola la herramienta.
- **SIEMPRE una opción "(Recomendado)"** con el motivo en una frase. Cero jerga: si usás un término técnico (RLS, multi-tenant), traducilo a beneficio concreto entre paréntesis.
- **Fast-path:** ofrecé de entrada *"decí 'dale con los defaults' y avanzo con todas las recomendadas"*. Si lo elige, salteá todo y confirmá SOLO las dos decisiones ⚠️ (multi-tenant e idiomas) y el checklist de concerns. Lo demás va con defaults a Supuestos.
- **Persistencia:** después de CADA tanda de respuestas, actualizá el borrador del spec en disco ANTES de la siguiente tanda. Si la sesión se corta, nada se pierde.
- **Solo preguntás lo que elimina una rama entera de decisión** (cambia el stack, activa un concern caro de retrofitear, o es casi irreversible). Tope 3-5 preguntas por tanda, 8-12 en total. Nada de relleno.
- **Reparto del tiempo:** 30-40% Etapa 1 (el problema), 60-70% Etapa 2 (el diseño). La Etapa 3 son 2-3 confirmaciones rápidas con default ON.

## ETAPA 1 — OPORTUNIDAD (el problema)

No hace falta hacer las 5 si el dolor ya quedó clarísimo. Todavía no se habla de "cómo".

- **O1 Dolor:** ¿qué hacés hoy a mano que te roba tiempo o te da bronca? (copiar datos ERP→Excel · acordarte de hacer algo · no ver los números claros)
- **O2 Frecuencia:** ¿cada cuánto pega? (diario → automatizar fuerte · semanal/cierre de mes · de vez en cuando)
- **O3 Quién lo sufre:** ¿solo vos, tu equipo, o también clientes de afuera? — *"equipo + clientes externos" abre multi-tenant → S5 ⚠️*
- **O4 Valor:** si funcionara perfecto, ¿qué cambia? (horas ahorradas · errores que cuestan plata · decisiones con datos al día)
- **O5 Cómo lo resolvés hoy:** Excel · herramienta paga que no alcanza · nada · **una app vieja a reemplazar → es brownfield: frená y explorá lo existente primero**

## ETAPA 2 — SOLUCIÓN (qué construir)

Acá se decide el carril, las entidades y los módulos. Respetá el orden y los saltos.

- **S1 Tipo de app (pregunta raíz, fija el carril):** ¿dónde la vas a usar?
  1. Navegador/web **(Recomendado: lo más simple de arrancar y compartir)** → Next.js + Supabase + Vercel
  2. Celular Android → Expo + Supabase + EAS
  3. Programa de Windows → Tauri + Supabase/SQLite
  4. Procesar datos y ver tableros → Tauri/Next + DuckDB + especialista de datos
- **S2 Entidades (multiSelect):** ¿con qué cosas trabaja la app? Facturas · Clientes/proveedores · Productos · Objetivos comerciales · Otra
- **S3 Login:** ¿la gente inicia sesión?
  1. Sí, cada uno con su usuario **(Recomendado si la usa más de una persona)** → Supabase Auth + RLS
  2. No, solo yo en mi máquina → anotá `auth: none` y **salteá S4, S5 y S6** (avisá: sin login no hay control de acceso)
  3. Sí, con organizaciones/empresas separadas → Better Auth + organizaciones, y ojo con S5
- **S4 Multi-equipo (solo si hay login):** ¿equipos que NO comparten datos desde el día uno? No **(Recomendado, más simple)** · Sí → empuja Better Auth
- **S5 Multi-tenant ⚠️ (solo si hay login; casi irreversible):** explicá primero en una línea: *"varios clientes usan la MISMA app pero cada uno ve solo lo suyo, con candado; meterlo después es caro y riesgoso"*. ¿Separás datos por empresa así?
  1. No por ahora **(Recomendado salvo que ya vendas a varias empresas)**
  2. Sí desde el día uno → activa `tenant_id` + RLS y el concern multi-tenant del checklist
  - Si hay duda, recomendá **No** y dejalo como supuesto revisable.
- **S6 Roles (solo si hay login; default ON):** ¿distintos permisos? Admin + usuarios **(Recomendado, lo más común)** · todos pueden todo · varios niveles. Aunque elija "todos pueden todo", dejá el andamiaje de roles preparado (barato ahora, caro después).
- **S7 Listas configurables (default ON):** ¿listas que querrías cambiar sin pedir ayuda (categorías, sucursales, vendedores, estados)? Sí, con panel para editarlas **(Recomendado: nunca hardcodeadas)** · una o dos fijas · no por ahora. Regla de oro: lo que el negocio cambiaría sin llamarte = fila en tabla editable, NUNCA en el código.
- **S8 Datos / Python:** ¿levanta datos del ERP/Excel, aplica fórmulas o arma reportes pesados?
  1. Sí: ETL del ERP + fórmulas + dashboards **(Recomendado para apps de datos)** → especialista Python (FastAPI) detrás de una frontera, separado de la pantalla
  2. Cálculos simples (sumas, totales) → todo TypeScript, sin Python
  3. No, es ABM/CRUD común → sin Python
  - Regla dura: Python SOLO si hay cálculo numérico real, ETL de ERP/Excel, o IA/ML.
- **S9 Dashboards:** ¿tableros con KPIs y objetivos? Sí **(Recomendado si es de gestión)** → Tremor/Recharts · tabla simple · no por ahora
- **S10 Idiomas / i18n ⚠️ (caro de retrofitear):** explicá: *"si alguna vez va a estar en más de un idioma, conviene dejar la estructura desde el día uno"*. Solo español **(Recomendado si no hay plan concreto)** · varios desde el arranque → i18n ON en el checklist
- **S11 Deploy:** ajustá las opciones al carril de S1 (web → Vercel (Recomendado) · Android → EAS · Windows/datos → bundler de Tauri). Si no sabe, tomá el default del carril y anotalo como supuesto.

## ETAPA 3 — RIESGO (confirmaciones rápidas, default ON)

- **R1 Errores y logging:** cuando algo falle (ej. el ERP no responde), ¿reintentar, avisar claro y dejar registro? **(Recomendado, default ON → Sentry + manejo estándar)**. Si dice "no lo pensé", se activa igual.
- **R2 Auditoría:** ¿saber quién hizo qué y cuándo? **(Recomendado y NO opcional si hay plata/facturación de por medio)**.
- **R3 Alcance:** ¿qué dejamos AFUERA a propósito en la v1? Arrancar con lo mínimo que resuelve el dolor #1 **(Recomendado → YAGNI)**. Alimenta `Scope: fuera de alcance`.

**Checklist de concerns (cerrá la etapa con esto, multiSelect, todo tildado por defecto):** roles/permisos · listas configurables · manejo de errores · logging (Sentry) · auditoría — la persona destilda solo lo que está 100% segura de no querer. Apagados por defecto: feature flags · notificaciones · settings. Coherencias obligatorias:
- Multi-tenant ON solo si S5 = sí ⚠️; i18n ON solo si S10 = varios idiomas ⚠️.
- Si S3 = sin login, roles/auditoría/multi-tenant quedan OFF (no aplican).

## Cuándo parar de preguntar

- **Lo no crítico NO se pregunta:** hacé una conjetura razonable (*informed guess*) y anotala en `## Supuestos` del spec con impacto ALTO/MEDIO/BAJO. Esa es la red anti-parálisis.
- **Lo ambiguo que no se puede asumir** → `[NEEDS CLARIFICATION: ...]` en el spec (tope ~3).
- **Lo que queda afuera a propósito** → `Scope: fuera de alcance`.
- Antes de escribir el spec, re-enunciá un **mini-contrato** ("entonces vamos a construir X, con roles A/B, queda afuera Z") y esperá el OK.

## Menú de elicitación (opcional, al final)

Solo si el usuario quiere **afilar una sección ya escrita** (requisitos, diseño, alcance, riesgos) — nunca en mitad de la entrevista. Leé el catálogo `methods.csv` (misma carpeta), elegí 5 lentes pertinentes a ESA sección y mostrá el menú:

> Elegí un número (1-5), [r] para rebarajar, [a] para ver todas, o [x] para seguir.

Tras aplicar una lente, proponé mejoras pero **HALT: no toques el doc sin un `s/n` explícito**. Volvé al menú hasta que elija `[x]`.
