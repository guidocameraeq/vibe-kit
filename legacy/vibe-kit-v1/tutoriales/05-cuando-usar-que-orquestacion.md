# Tutorial 05 — Cuándo usar qué: la tabla de decisión en criollo

> Este tutorial es tu "chuleta" de orquestación. Cada vez que arrancás a laburar con Claude Code tenés que tomar 4 decisiones chiquitas: ¿le hablo al Arquitecto o lanzo un ayudante en segundo plano?, ¿le tiro algo vago o algo súper preciso?, ¿lo dejo planear primero o que vaya directo?, ¿cuánta autonomía le doy? Acá está cada decisión explicada con una regla simple y ejemplos de tu día a día (facturación del ERP, dashboards, roles). No hace falta programar: son decisiones de **dirección**, no de código.

---

## Qué vas a lograr

Al final de este tutorial vas a poder mirar cualquier pedido tuyo y decir, en 10 segundos, **cómo encararlo**:

1. **Principal o subagente** — ¿le hablo de ida y vuelta, o lanzo un ayudante que trabaja solo y vuelve con un resumen?
2. **Ambiguo o específico** — ¿en qué momento conviene ser vago y en cuál conviene ser quirúrgico?
3. **Autonomía** — ¿read-only (Plan mode) o que edite (Auto/acceptEdits)?
4. **Plan-first o directo** — ¿que planee antes, o que vaya derecho al grano?

Tiempo de lectura: **10 minutos.** Es para tener a mano y volver a consultar, no para memorizar.

---

## La tabla, de un vistazo

Esta es la columna vertebral del tutorial. Es la **tabla de decisión** del Arquitecto, traducida a criollo:

| Decisión | Regla simple | Por qué |
|---|---|---|
| **¿Subagente o agente principal?** | **Principal** para conversar, trabajo chico, o pasos encadenados (= tu Arquitecto). **Subagente** solo como ayudante en segundo plano: leer 10+ archivos, 3+ tareas independientes, o revisar con ojos frescos. | A un subagente **no le podés hablar mientras corre.** No uses subagentes para tareas chicas, trabajo secuencial que depende de sí mismo, o dos cosas tocando el mismo archivo. |
| **¿Específico o ambiguo?** | **Ambiguo temprano, específico en el spec.** En la charla, dejá que el agente te entreviste y te proponga. Todo lo que querés construido va al spec con la máxima precisión. | "Instrucciones vagas → resultados vagos." Un buen spec le saca a Claude 15-20 decisiones que, si no, improvisaría mal. |
| **¿Nivel de autonomía?** | Fase HABLAR/planear → **Plan mode** (read-only, no toca nada). Fase EJECUTAR → **Auto/acceptEdits**. Nunca bypass/YOLO fuera de un sandbox. | Mapea a tus dos fases. **Commiteá en git antes** de la corrida autónoma como red de seguridad. |
| **¿Plan-first o directo?** | **Si lo describís en UNA frase, salteá el plan; si no, planeá primero.** Planeá siempre que: hay incertidumbre, 3+ archivos, schema/seguridad, o no conocés el código. | En tu primer mes: dejá Plan mode **SIEMPRE prendido** y aflojá con el tiempo. |

Abajo desarmamos cada fila con ejemplos tuyos.

---

## Decisión 1 — ¿Principal o subagente?

### La regla

> **Principal** = le hablás, te responde, vas y venís. Es tu Arquitecto (`/vibe-kit:arquitecto`).
> **Subagente** = un ayudante que mandás a hacer algo solo; trabaja en su propia "burbuja" y vuelve con un resumen. **No le podés hablar mientras corre.**

El detalle que decide todo: **a un subagente no le podés hablar a mitad de camino.** Por eso el Arquitecto, que vive de entrevistarte y repreguntar, **tiene que ser principal**. Los subagentes son para laburo que se puede explicar de una y se revisa al final.

### Usá el PRINCIPAL cuando…

- Querés **conversar / iterar** (entrevista de descubrimiento, decidir el stack, repensar un diseño).
- Es un **cambio chico** (renombrar algo, ajustar un texto, una corrección puntual).
- Son **pasos encadenados que comparten contexto** (planear → implementar → verificar la misma feature).
- Te importa la **rapidez** (un subagente arranca de cero, tarda más en "ponerse al día").

### Lanzá un SUBAGENTE cuando…

- Hay que **leer muchísimo** (explorar 10+ archivos de una app que ya existe) y solo querés el resumen, no todo el detalle inflando tu chat.
- Hay **3+ tareas independientes** que se pueden hacer en paralelo sin pisarse.
- Querés una **revisión con ojos frescos** (que alguien "que no estaba en la cocina" critique el spec o el código).

### Tus ayudantes ya vienen en el kit

vibe-kit trae 4 subagentes listos. El Arquitecto los lanza por vos cuando hace falta; vos casi nunca los invocás a mano:

| Subagente | Para qué | Toca código? |
|---|---|---|
| `explorador-codigo` | Recorrer una app que ya existe y traerte un mapa de cómo está armada. | No (solo lee). |
| `redteam-spec` | Atacar el spec buscándole agujeros antes de construir (pre-mortem, "qué puede salir mal"). | No (solo lee). |
| `doc-keeper` | Revisar si la documentación quedó desactualizada respecto del código real. | No (solo lee). |
| `reviewer` | Revisión adversarial del código recién escrito; reporta solo problemas de correctitud/requisitos. | No (solo reporta, no edita). |

### NO uses subagente cuando…

- La tarea es **chica** (es más laburo explicarle todo desde cero que hacerlo en el chat principal).
- El trabajo es **secuencial y depende de sí mismo** (paso B necesita ver lo que hizo el paso A).
- **Dos cosas tocarían el mismo archivo** al mismo tiempo (se pisan).

### Ejemplos tuyos

| Situación tuya | Qué elegir | Por qué |
|---|---|---|
| "Quiero diseñar el módulo de objetivos comerciales, charlando." | **Principal** (`/vibe-kit:arquitecto`) | Vas a ir y venir; el Arquitecto te entrevista. |
| "Esta app de facturación ya existe y no me acuerdo cómo está armada." | **Subagente** `explorador-codigo` | Lee 20 archivos y te trae un mapa, sin inflar tu chat. |
| "Cambiá el título del dashboard de 'Ventas' a 'Facturación'." | **Principal** | Es un toque; no vale lanzar un ayudante. |
| "Antes de construir, que alguien le busque los agujeros a este spec." | **Subagente** `redteam-spec` | Revisión con ojos frescos = su especialidad. |
| "Ya escribí el módulo de roles, revisalo con sentido crítico." | **Subagente** `reviewer` | Ojos frescos sobre código recién hecho. |

> **Atajo:** ¿necesitás hablar/iterar? → principal. ¿Necesitás leer mucho o revisar al final? → subagente.

---

## Decisión 2 — ¿Específico o ambiguo?

### La regla

> **Ambiguo temprano, específico en el spec.**
> En la **charla**, dejá que el Arquitecto te entreviste y te proponga (ahí ser vago está PERMITIDO y hasta es útil). Todo lo que querés **construido** va al **spec** con la máxima precisión posible.

Suena contradictorio pero no lo es. Son **dos momentos distintos**:

- **Cuando estás pensando** (con el Arquitecto, en Plan mode), ser ambiguo es bueno: "quiero algo para no perder de vista los objetivos de venta del mes" alcanza para arrancar. El Arquitecto te repregunta y te ofrece opciones. **No tenés que saber la respuesta de antemano.**
- **Cuando ya hay que construir** (la sesión fresca que ejecuta el spec), la vaguedad es veneno. Ahí gana el spec preciso: pantallas, campos, roles, qué pasa si el ERP no responde. Mientras más decisiones deje cerradas el spec, menos improvisa Claude (y menos macanas se manda).

La frase para no olvidarse: **"instrucciones vagas → resultados vagos."** Un buen spec le saca a Claude unas 15-20 decisiones que, librado a su criterio, tomaría mal.

### Cómo el Arquitecto convierte tu "ambiguo" en "específico"

No tenés que hacerlo vos a mano. El Arquitecto te lleva de lo vago a lo preciso así:

- Te pregunta **una cosa a la vez** (o en tandas chiquitas), **siempre con opciones numeradas** y un default marcado **"Recomendado"**.
- Solo te pregunta lo que **cambia ramas enteras** de la decisión (tope ~3-5 preguntas por tanda). Lo que no es crítico **lo asume** y lo deja anotado en una sección de **Supuestos** (con impacto ALTO/MEDIO/BAJO), para que después puedas revisarlo.
- Te ofrece un **fast-path**: si no querés pensar cada cosa, le decís "andá con los recomendados" y avanza.

> **Ejemplo de cómo te pregunta:**
> *"¿Cuándo algo falle (ej. el ERP no responde), qué preferís?*
> *1) Que la app reintente, avise claro y registre el error para revisarlo — **Recomendado***
> *2) Que solo me muestre un cartel*
> *3) No lo pensé (lo activamos por default igual)"*
>
> Vos respondés "1" (o "recomendado", o "los defaults") y listo. **No necesitás saber qué es un reintento ni un log.**

### Ejemplos tuyos

| Momento | Cómo hablar | Por qué |
|---|---|---|
| Arrancando a pensar el módulo de objetivos | **Ambiguo OK:** "quiero ver cómo venimos contra la meta del mes" | El Arquitecto te entrevista y te propone. No tenés que tener el diseño en la cabeza. |
| El spec ya escrito que va a ejecutar Claude solo | **Específico:** entidades, roles, qué se ve por rol, qué pasa si falla el ERP | El spec preciso le quita a Claude las decisiones que improvisaría mal. |
| Pedido suelto en el chat de implementación | **Específico:** "en la pantalla de facturas, agregá una columna 'estado' con valores Pendiente/Pagada/Vencida" | Vago acá = resultado vago. |

> **La buena noticia:** vos no tenés que escribir el spec preciso. El Arquitecto lo escribe a disco por vos (`SPEC.md`). Tu trabajo es **revisarlo en español**, no redactarlo.

---

## Decisión 3 — ¿Cuánto lo dejo solo? (autonomía)

### La regla

> Fase **HABLAR / planear** → **Plan mode** (read-only: Claude lee y propone, pero **no toca nada**).
> Fase **EJECUTAR** → **Auto / acceptEdits** (ya tiene permiso de editar archivos).
> **Nunca** bypass/YOLO (permitir todo sin preguntar) fuera de un sandbox.

Esto mapea exacto a las **dos fases** de cómo trabajás:

1. **Primero hablás y planeás.** Ahí querés que Claude sea read-only: que explore, entreviste y proponga, pero que **no escriba código todavía**. Eso es **Plan mode**.
2. **Después ejecuta.** Una vez aprobado el spec, en una **sesión fresca**, le subís el dial a **Auto/acceptEdits** para que construya de corrido (tu "hablo una vez, trabaja una hora").

### Los modos, en criollo

| Modo | Qué hace | Cuándo |
|---|---|---|
| **Plan mode** (read-only) | Lee, explora, propone. **No edita ni escribe.** | Toda la fase de hablar/planear con el Arquitecto. |
| **acceptEdits** | Acepta las ediciones de archivos sin pedirte permiso por cada una. | Fase de ejecutar el spec. |
| **Auto** | Hace casi todo solo, con un control de seguridad de fondo. | Fase de ejecutar, cuando ya confiás en el spec. |
| **bypass / YOLO** | Permite TODO sin preguntar nada. | ⚠️ Solo en un entorno aislado (sandbox/VM). Nunca en tu compu de trabajo. |

### La red de seguridad (no la saltees)

> **Antes** de soltar a Claude en modo autónomo (Auto/acceptEdits): **commiteá en git.**

Así, si la corrida autónoma sale para cualquier lado, volvés al último commit y no perdiste nada. Los "checkpoints" de Claude (`/rewind`, Esc+Esc) **NO son git** — seguí commiteando de verdad. Es tu cinturón de seguridad real.

### Cómo se prende cada cosa

- **Plan mode:** en VSCode/Claude Code cambiás de modo con **Shift+Tab** (cicla entre los modos), o el kit puede dejar tu proyecto **arrancando siempre en Plan mode** por default.
- **Salir de Plan mode:** cuando **aprobás el plan**, Claude sale de Plan mode y pasa al modo de ejecución que elegiste (auto / aceptar ediciones / revisar cada una).

> **Ojo, un detalle importante:** un slash command como `/vibe-kit:arquitecto` **no puede por sí solo** poner toda la sesión en Plan mode (no hay un botoncito mágico en el comando para eso). En vibe-kit esto se resuelve de dos formas que ya vienen armadas: el proyecto puede **arrancar siempre en Plan mode** (default del kit), y el Arquitecto está hecho para **no tocar código** y trabajar read-only. Vos no tenés que configurar nada: viene resuelto.

### Ejemplos tuyos

| Situación | Modo | Por qué |
|---|---|---|
| Charlando el diseño con el Arquitecto | **Plan mode** | Que proponga, no que escriba todavía. |
| Sesión fresca ejecutando el spec del módulo de objetivos | **Auto / acceptEdits** | Ya está aprobado; que construya de corrido. |
| Probando algo dudoso que podría romper la app | **commiteá primero**, después Auto | Si sale mal, volvés al commit. |

---

## Decisión 4 — ¿Plan-first o directo?

### La regla

> **Si lo podés describir en UNA sola frase → andá directo, salteá el plan.**
> **Si no entra en una frase → planeá primero.**

Y siempre planeá (sí o sí) cuando:

- Hay **incertidumbre** (no estás seguro de cómo se hace).
- Toca **3 o más archivos**.
- Hay **schema (base de datos) o seguridad/permisos** de por medio.
- **No conocés el código** (app que ya existía).

### El consejo para tu primer mes

> Dejá **Plan mode SIEMPRE prendido** al principio. Con el tiempo, cuando agarres confianza, lo vas aflojando para los cambios triviales.

Planear cuesta unos minutos extra, pero te ahorra el desastre de que Claude se mande a construir mal y tengas que rehacer todo. Para un no-programador, **planear de más es casi siempre mejor que planear de menos.**

### Ejemplos tuyos

| Pedido | Plan-first o directo | Por qué |
|---|---|---|
| "Cambiá el color del botón de 'Guardar' a verde." | **Directo** | Entra en una frase, un solo lugar. |
| "Armá el módulo de objetivos comerciales con metas por vendedor y avance mensual." | **Plan-first** | Varias pantallas, datos, roles → planeá. |
| "Conectá la facturación del ERP y mostrá un dashboard." | **Plan-first** | Datos externos + seguridad + varios archivos. |
| "Corregí el typo 'Facturcion' en el menú." | **Directo** | Trivial, una palabra. |
| "Agregá login con roles admin/vendedor." | **Plan-first** | Seguridad y permisos → siempre planeá. |

---

## El checklist para arrancar CUALQUIER sesión

Pegate esto en la cabeza (o en un post-it). Antes de empezar a laburar, corré estas 6 preguntas:

- [ ] **¿Feature nueva o cambio sobre app existente?** (nueva = entrevista con el Arquitecto; existente = primero explorar el código + propuesta de qué cambia y qué NO).
- [ ] **¿Lo describo en una frase?** → directo. Si no → **Plan mode**.
- [ ] **¿Necesito hablar/iterar?** → agente **principal**. ¿Leer mucho o revisar? → **subagente**.
- [ ] **Charla: ambiguo OK. Spec: específico**, con verificación de punta a punta y límites claros de qué puede y qué no puede tocar.
- [ ] **Antes de ejecutar autónomo:** commit en git + dial a **Auto**.
- [ ] **Spec aprobado → sesión fresca** para ejecutar (contexto limpio, sin arrastrar la charla).

---

## El flujo completo, juntando las 4 decisiones

Así se ven las 4 decisiones encadenadas en un caso real tuyo (el módulo de objetivos comerciales):

1. **Es feature nueva** → entrevista. **Principal** + **Plan mode**. Le hablás al Arquitecto en criollo, medio ambiguo: *"quiero seguir cómo venimos contra las metas de venta del mes"*.
2. El Arquitecto te entrevista (preguntas con opción **Recomendado**), lanza si hace falta el subagente **`redteam-spec`** para buscarle agujeros, y escribe un **`SPEC.md`** preciso a disco.
3. **Vos revisás el SPEC en español** (no el código). Lo aprobás.
4. **Handoff:** abrís una **sesión fresca** (contexto limpio). Antes de soltarla, **commiteás en git**.
5. En esa sesión, dial a **Auto/acceptEdits** y Claude construye de corrido. Un control de calidad automático (hook) corre las verificaciones al cerrar cada turno.
6. Vos pedís **evidencia** ("mostrame que anda"), no un "listo".

Cada paso es una de las 4 decisiones aplicada. Cuando lo hacés un par de veces, sale solo.

---

## Resumen en 4 líneas

```
¿Hablar/iterar? → principal.   ¿Leer mucho/revisar? → subagente.
¿Pensando? → ambiguo OK.       ¿Construir? → spec específico.
¿Planeando? → Plan mode.       ¿Ejecutando? → Auto (commiteá antes).
¿Entra en una frase? → directo. Si no → planeá primero.
```

Cuando dudes, la opción **más segura para un no-programador** casi siempre es: **principal, planear primero, Plan mode prendido, y revisar el spec en español.** Con el tiempo aflojás.

---

¿Querés ver esto en acción de punta a punta? Volvé al **[Tutorial 01 — Primer uso del Arquitecto](01-primer-uso-arquitecto.md)** (greenfield, app nueva) o mirá el **[Tutorial 02 — App existente (ERP)](02-app-existente-erp.md)** (brownfield, donde primero se explora el código). Y si te interesa que el rol del Arquitecto sobreviva a un `/compact`, está el **[Tutorial 04 — Compactación y roles](04-compactacion-y-roles.md)**.
