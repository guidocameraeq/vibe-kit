# Tutorial 02 — Sumarle algo a una app que YA existe (tu caso ERP)

> Este tutorial es para cuando **NO arrancás de cero**. La app ya está andando y querés agregarle, cambiarle o sacarle algo **sin romper lo que funciona**. El ejemplo va a ser el tuyo real: el sistema que levanta la facturación del ERP, la procesa con fórmulas y muestra dashboards, y le querés sumar un **módulo de objetivos comerciales**.
>
> Vas a usar `/vibe-kit:feature` con el Arquitecto. El orden de oro de este flujo es **explorar primero, proponer después**. No hace falta saber programar: hablás en español y aprobás; Claude hace el resto.

---

## Antes de empezar

- [ ] Terminaste el [Tutorial 00 — Instalar vibe-kit](00-instalacion.md). Si tipeás `/vibe-kit` y aparecen los comandos, estás.
- [ ] Tenés abierta **la app que ya existe** en Claude Code (la carpeta del proyecto del ERP). Esto es importante: el Arquitecto va a leer ese código. Si abrís una carpeta vacía, no tiene nada que explorar.
- [ ] **Commiteá en git lo que tengas** antes de arrancar. Es tu red de seguridad. Si algo sale mal después, volvés atrás.

> **Greenfield vs brownfield (la palabra clave de este tutorial):**
> - **Greenfield** = app **nueva**, de cero. Para eso es `/vibe-kit:nueva-app` y `/vibe-kit:arquitecto` (ver Tutorial 01).
> - **Brownfield** = app que **YA anda** y le tocás algo. Para eso es **este** tutorial y el comando **`/vibe-kit:feature`**.
>
> Estás en el caso brownfield. El comando correcto es `/vibe-kit:feature`.

---

## El mapa de lo que vas a hacer (5 pasos)

```
1. EXPLORAR    → el Arquitecto manda al explorador-codigo a mirar tu app (read-only)
2. ENTREVISTA  → te pregunta, pero anclado a lo que encontró en TU código
3. PROPUESTA   → arma la propuesta brownfield: qué SÍ cambia / qué NO cambia / alcance / éxito
4. SPEC        → escribe el spec a disco (con tu OK explícito antes de tocar nada)
5. HANDOFF     → sesión fresca para ejecutar; vos pedís evidencia, no un "listo"
```

La regla que recorre todo: **el Arquitecto NUNCA escribe código de tu app en este flujo.** Su único entregable es un **spec en disco** (un archivo `.md`). Recién en una **sesión aparte** se ejecuta ese spec.

---

## Por qué explorar primero (la idea más importante del tutorial)

En una app que ya existe, **lo más valioso no es describir lo que cambia: es describir lo que NO cambia.** Eso delimita el **blast radius** (el "radio de explosión"): cuánto de tu app puede verse afectado por el cambio.

Si dejamos por escrito *"el módulo de login, los roles y la tabla de facturas NO se tocan"*, conseguimos tres cosas:

1. **Acotamos el riesgo:** ya sabemos dónde NO mirar si algo se rompe.
2. **Le damos límites claros a Claude** para la fase de ejecución: "esto es zona prohibida, no la toques".
3. **Te protegemos a vos:** si después algo que dijimos que NO cambiaba se rompe, sabemos que fue un efecto colateral no previsto, no parte del plan.

Por eso el Arquitecto **primero explora tu código** y recién después te entrevista. Así sus preguntas quedan ancladas en lo que **realmente hay**, no en suposiciones.

---

## Paso 0 — (Opcional pero recomendado) documentar la app antes

Si tu app **todavía no tiene** un `CLAUDE.md` ni un `project.yaml`, conviene que Claude la documente una vez. Eso le da a futuro un punto de partida y hace la exploración más rápida. Tenés dos caminos:

| Camino | Qué hace | Cuándo |
|---|---|---|
| **`/init`** (comando nativo de Claude Code) | Crea un `CLAUDE.md` con la documentación básica de tu codebase: stack, comandos, estructura. | Si la app no tiene ningún archivo de contexto. |
| **No hacer nada** | El comando `/vibe-kit:feature` igual explora el código solo (manda al `explorador-codigo`). | Si querés ir directo al grano. |

> No es obligatorio. El `explorador-codigo` que lanza `/vibe-kit:feature` ya hace una pasada de reconocimiento por su cuenta. Pero si vas a tocar esta app seguido, un `CLAUDE.md` (vía `/init`) le ahorra trabajo a cada exploración futura. Si no tenés ganas, saltealo y andá directo al Paso 1.

Cuando el `explorador-codigo` corre, **lo primero que busca es justamente un `project.yaml` o un `CLAUDE.md`** en la raíz: si existen, los lee y después confirma si el código real coincide con lo que dicen (cuando no coinciden, eso se llama **drift** y lo reporta como hallazgo).

---

## Paso 1 — Arrancar el comando `/vibe-kit:feature`

Dentro de Claude Code, con tu app abierta, escribí el comando y, en una frase, qué querés sumar:

```
/vibe-kit:feature un módulo de objetivos comerciales con metas por vendedor y un dashboard de avance
```

> Si lo escribís sin la frase (`/vibe-kit:feature` a secas), el Arquitecto te va a pedir, como primer mensaje, que le cuentes en una frase qué querés agregar. Cualquiera de las dos formas funciona.

Apenas arranca, el Arquitecto entra en **modo solo-lectura**: solo puede `Read` (leer), `Grep` y `Glob` (buscar) y delegarle al `explorador-codigo`. **No puede escribir ni editar nada** salvo el archivo final (el spec), y recién después de tu aprobación. Esto es el **HARD GATE**, y vale aunque la feature parezca un cambio chiquito.

---

## Paso 2 — La exploración (lo hace el `explorador-codigo`, vos solo mirás)

El Arquitecto manda a un ayudante en segundo plano, el subagente **`explorador-codigo`**, a mapear la zona de tu app que esta feature va a tocar. Ese ayudante es **read-only puro**: solo lee, nunca escribe ni ejecuta nada. Trabaja con contexto aislado y te devuelve un **mapa de terreno** en español.

Concretamente, busca:

- **Qué stack y versiones** usa tu app de verdad (mira `package.json`, `pyproject.toml`, `tauri.conf.json`, `project.yaml`, `CLAUDE.md`).
- **Dónde viven las cosas** relacionadas con lo que pediste: en tu caso, la **tabla de facturas**, los **vendedores/clientes**, los **dashboards** existentes, el **sidecar de Python** (FastAPI + pandas) que procesa la facturación.
- **Qué patrones ya existen** y conviene reusar: cómo maneja auth y roles, cómo guarda las listas configurables, cómo maneja errores, si tiene logging (Sentry) y **audit_log**.
- **Qué NO hay que tocar** para no romper: las migraciones de la base, las reglas de seguridad (RLS), la lógica de auth, y especialmente —en tu caso— el **sidecar Python**, que es lo más frágil de empaquetar.

El reporte que vuelve tiene una estructura fija. Para tu caso ERP, vas a ver algo así (resumido):

```
## Mapa de la app: ERP-facturación

### 1. Qué es y carril
- Tipo de app: datos / Windows (Tauri + Python sidecar). Levanta facturación del ERP,
  aplica fórmulas y muestra dashboards.

### 2. Stack detectado (real, con versiones)
- UI: Tauri 2 + React + dashboards (Recharts/Tremor)
- Datos: Postgres (Supabase) + DuckDB local
- Python detrás de frontera: SÍ — FastAPI sidecar con pandas para fórmulas y ETL del ERP

### 4. Entidades del dominio
- facturas → tabla en supabase/migrations
- clientes / vendedores → tabla
- (no encontré una entidad "objetivo" / "meta" → es nueva)

### 5. Dónde viven los concerns transversales
- Roles / permisos: RLS real en DB (bien) + esconde botones en UI
- Auditoría / activity-log: SÍ, audit_log con triggers (clave en facturación)
- Logging: Sentry configurado

### 7. Riesgos y qué NO conviene tocar 🚫⚠️
- 🚫 Migraciones de la base (facturas) — tocar el esquema mal rompe datos reales
- ⚠️ El sidecar Python — lo más frágil de empaquetar (rutas, puertos, firmar el .exe)
```

> Si el explorador devuelve mucho detalle, el Arquitecto se queda solo con el resumen útil; no te va a tirar el volcado entero. Lo que te interesa a vos es: **qué hay, qué se reusa, y qué es zona de cuidado.**

---

## Paso 3 — La entrevista (anclada a tu código real)

Ahora sí, el Arquitecto te entrevista. Pero la gracia es que las preguntas **ya no son a ciegas**: están ancladas a lo que el explorador encontró. Por ejemplo:

> *"Vi que ya tenés una tabla de `vendedores` y roles con RLS. El módulo de objetivos, ¿lo ven todos los vendedores (cada uno el suyo) o solo los admin cargan/ven las metas?"*
>
> 1. Cada vendedor ve y trabaja **solo sus** objetivos; el admin ve todos. **(Recomendado)**
> 2. Todos ven todo.
> 3. Solo el admin (los vendedores no entran al módulo).
> 4. Otra (contame en una frase).

Las reglas de cómo te pregunta (no las tenés que recordar, las hace el Arquitecto, pero está bueno saberlas):

- **Una pregunta por mensaje**, o tandas muy chicas. Nada de bombardearte con 10 cosas juntas.
- **Siempre multiple-choice numerada**, con una opción marcada **(Recomendado)** y una opción "Otra (contame en una frase)". Podés responder con el número, o decir "los defaults" y avanza rápido.
- **Solo preguntas que eliminan una rama entera de decisión** (tope ~3-5). Lo no-crítico **no se pregunta**: se asume y se anota como **Supuesto** en el spec, así no te marea con detalles.
- **Cero jerga.** Si tiene que nombrar algo técnico, te lo explica en media línea.

Las preguntas clave en brownfield apuntan justo a acotar el blast radius. Esperá que te pregunte cosas como:

- *"¿Este cambio toca algo que ya existe, o es todo nuevo al costado?"*
- *"De lo que ya anda hoy, ¿qué tiene que seguir funcionando EXACTAMENTE igual?"*
- *"Para esta primera versión, ¿qué dejamos AFUERA a propósito para no engancharnos?"*

Esa última alimenta directamente el "Fuera de alcance" de la propuesta. **Tu respuesta a "qué dejamos afuera" es oro:** es lo que evita que la feature se infle.

### Si una propuesta te suena floja: el menú de elicitación

Si en algún momento querés afilar una idea o no te cierra una propuesta, el Arquitecto puede usar la skill **`elicitacion-avanzada`**: te ofrece un **menú 1-5** de "lentes" para repensar (pre-mortem, primeros principios, inversión, red team, socrático), con `[r]` para rebarajar el menú, `[a]` para ver todas las técnicas y `[x]` para seguir. Tras cada propuesta te ofrece el menú; lo vuelve a ofrecer hasta que elegís `[x]`. No tenés que pedirlo vos: es una herramienta del Arquitecto para no quedarse con la primera idea.

---

## Paso 4 — La propuesta brownfield (qué SÍ cambia / qué NO cambia)

Esta es la parte central. El Arquitecto usa la skill **`brownfield-openspec`** para armar una **propuesta de 4 campos**. Te la va a presentar **por secciones**, pidiéndote aprobación después de cada una. Para tu módulo de objetivos se va a ver parecido a esto:

```markdown
# Propuesta: Módulo de objetivos comerciales

## 1. Por qué (Why)
Hoy no hay una vista clara de cómo van los vendedores contra sus metas.
Se arma a mano en Excel cada cierre de mes. Queremos un módulo que cruce
la facturación que ya levantamos del ERP contra metas cargadas, y muestre
el avance en un dashboard.

## 2. Qué cambia y qué NO cambia (What)
**Lo que SÍ cambia:**
- Se agrega una entidad nueva "objetivo" (meta por vendedor y por período).
- Se agrega una pantalla de carga de metas (solo admin).
- Se agrega un dashboard de avance (meta vs. facturado real).

**Lo que NO cambia (queda IGUAL) — esto acota el blast radius:**
- La tabla de facturas y cómo se levanta del ERP: NO se toca.
- El sidecar Python que procesa la facturación: NO se toca.
- El login, los roles y la RLS existentes: NO se tocan (se reusan).
- Los dashboards actuales: siguen funcionando igual.

## 3. Alcance (Scope)
**En alcance (entra ahora):**
- Cargar metas, ver avance del mes actual.

**Fuera de alcance (NO entra ahora, a propósito):**
- Comparar contra años anteriores.
- Notificaciones cuando un vendedor está lejos de la meta.
- Metas por equipo (solo por vendedor en esta versión).

## 4. Criterios de éxito (Success)
- Un admin puede cargar una meta para un vendedor y un mes.
- El dashboard muestra "% de avance" = facturado real / meta, al día.
- Toda carga de meta queda registrada en el audit_log.
```

Fijate en el campo **"Lo que NO cambia"**: ese es el corazón de todo en brownfield. Cuanto más larga esa lista, más seguro el cambio. La regla práctica que sigue el Arquitecto: **si duda entre poner algo ahí o no mencionarlo, lo pone.**

El Arquitecto aplica **YAGNI despiadado**: le saca a la propuesta todo lo que no resuelve el dolor principal de esta versión. Si te ofrece sacar algo "para después", confiá: es para que la primera versión salga.

### El delta spec (lo que se AGREGA / MODIFICA / SACA)

Junto a la propuesta, la skill `brownfield-openspec` arma un **delta spec**: la lista concreta de requisitos etiquetados como **ADDED** (nuevos), **MODIFIED** (con un `Previously:` que aclara de qué estado venimos) y **REMOVED** (con la razón de la baja). Cada requisito se escribe con la palabra **DEBERÁ** y trae al menos un escenario en formato GIVEN/WHEN/THEN (dado tal estado, cuando pasa tal cosa, entonces tal resultado). Esto es lo que hace al cambio **testeable**, y deja por escrito el impacto real sobre tu app. No lo tenés que escribir vos: lo arma el Arquitecto.

---

## Paso 5 — Escribir el spec a disco (con tu OK explícito)

Recién acá el Arquitecto toca disco. Antes de escribir **un solo archivo**, aplica el **HALT**:

> Te pregunta si querés que aplique los cambios al archivo (**sí / no / cambiar algo**) y **FRENA a esperar tu respuesta.** No escribe nada sin tu "sí" explícito.

Antes del HALT, te hace un **mini-contrato**: re-enuncia en 3-5 bullets qué se va a construir, qué NO cambia y qué queda afuera, para confirmar que entendió. Y te ofrece dos caminos:

- **Borrador rápido (suele ser el mejor default para vos):** genera ya el spec con `[SUPUESTO: ...]` rankeados por impacto (ALTO / MEDIO / BAJO), y vos los revisás después.
- **Q&A exhaustivo:** seguimos preguntando hasta no dejar ninguna ambigüedad.

Para definir **dónde** va el spec, usa la skill `escribir-spec`. Como guía:

- **Feature chica** → un solo `SPEC.md`.
- **Feature grande** (como tu módulo de objetivos) → una carpeta `.claude/specs/objetivos-comerciales/` con `requirements.md`, `design.md` y `tasks.md`.
- La **propuesta** y el **delta** suelen quedar en `docs/propuestas/AAAA-MM-DD-objetivos-comerciales.md` (y su `-delta.md`).

Antes de entregarte el spec, el Arquitecto **lo auto-revisa**: busca placeholders sin resolver, contradicciones, ambigüedad y problemas de alcance, y los arregla en el lugar. Y chequea, con la skill **`checklist-concerns`**, que los **concerns transversales** que apliquen queden contemplados. En tu caso ERP esto es **innegociable**: tocás un módulo que cruza plata, así que el **audit_log** sigue siendo obligatorio, los **roles/permisos** (quién carga metas) tienen que estar definidos, y el **manejo de errores + logging** (qué pasa si el cálculo de avance falla) también.

Cuando el spec está escrito y vos lo leíste y aprobaste **en español**, el Arquitecto lo marca como **listo (READY)** y te explica el handoff. **Leés el spec, no el código.**

---

## Paso 6 — Handoff: ejecutar en una sesión fresca

El spec ya vive en disco. El Arquitecto **no ejecuta** la feature en este flujo: su trabajo termina con el spec aprobado. El próximo paso lo hacés vos, así:

1. **Commiteá en git** lo que haya (incluido el spec). Es tu red de seguridad.
2. Abrí una **sesión fresca** (chat nuevo, contexto limpio) para ejecutar el spec. ¿Por qué fresca? Porque la conversación de diseño ya cumplió; arrancar limpio evita arrastrar contexto viejo y confundir a Claude.
3. En esa sesión, poné el dial de autonomía en **Auto / acceptEdits** y pedile que ejecute el spec.
4. **Pedí evidencia, no un "listo".** Que te muestre que el dashboard de avance anda, que la carga de meta queda en el audit_log, que no rompió la facturación existente.

> **Por qué una sesión aparte y no seguir en la misma:** el handoff pasa por el **filesystem** (el spec en `.md`), no por la memoria del chat. El spec es la fuente de verdad; una sesión nueva lo lee y lo ejecuta sin estar contaminada por toda la charla de diseño. Es exactamente el patrón "planear read-only → escribir el plan a archivo → aprobar → ejecutar".

---

## Errores comunes (y cómo evitarlos)

| Síntoma | Qué pasó | Qué hacer |
|---|---|---|
| Usaste `/vibe-kit:arquitecto` o `/vibe-kit:nueva-app` para esto | Esos son para apps **nuevas** (greenfield). | Para tocar una app que ya anda, usá **`/vibe-kit:feature`**. |
| El explorador "no encontró nada" | Abriste una carpeta vacía o equivocada. | Cerrá y abrí Claude Code en la **carpeta de tu app ERP** (la que tiene el código). |
| El Arquitecto se puso a escribir código | No debería: el HARD GATE lo prohíbe. | Frená. Su único entregable es el **spec**. Si pasó, reportalo: hay algo mal configurado. |
| El cambio rompió algo que "no se tocaba" | El campo "qué NO cambia" estaba incompleto. | En la próxima, pedile al Arquitecto que **agrande** esa lista. Cuanto más larga, más seguro. |
| Ejecutaste en la misma sesión del diseño | Se arrastra contexto viejo. | Para ejecutar, abrí una **sesión fresca** con el spec ya escrito. |
| El módulo nuevo no quedó en el audit_log | Se olvidó un concern transversal. | En apps de facturación el **audit_log no es opcional**. Pedile que lo agregue al spec antes de ejecutar. |

---

## Qué usa este flujo por dentro (referencia)

No tenés que memorizar nada de esto, pero si querés entender qué piezas se mueven:

- **`/vibe-kit:feature`** (comando) — arranca al Arquitecto en modo brownfield, solo-lectura.
- **`explorador-codigo`** (subagente, read-only) — mapea tu código antes de proponer (Paso 2).
- **`elicitacion-avanzada`** (skill) — menú 1-5 de lentes para afilar propuestas (Paso 3).
- **`brownfield-openspec`** (skill) — la propuesta de 4 campos + el delta ADDED/MODIFIED/REMOVED (Paso 4).
- **`escribir-spec`** (skill) — dónde y cómo se guarda el spec (Paso 5).
- **`checklist-concerns`** (skill) — que no se escape ningún concern transversal (Paso 5).

---

## Resumen en 6 líneas

```
1. Abrí Claude Code en la carpeta de tu app ERP y commiteá en git.
2. /vibe-kit:feature un módulo de objetivos comerciales con dashboard de avance
3. Dejá que el explorador-codigo mapee tu código (read-only).
4. Respondé la entrevista (multiple-choice; decí "los defaults" para ir rápido).
5. Aprobá la propuesta (qué SÍ / qué NO cambia) y dale el "sí" para escribir el spec.
6. Sesión fresca para ejecutar el spec; pedí evidencia, no un "listo".
```

La idea central, en una frase: **en una app que ya anda, primero entendés lo que hay, después escribís qué cambia Y qué NO cambia, y recién en una sesión aparte se ejecuta.** Vos revisás español, no código.

Cuando tengas el spec aprobado, seguí con el [Tutorial 03 — Convertir tus chats en comandos](03-convertir-chats-en-comandos.md) para aprender a fabricar tus propios comandos y agentes.
