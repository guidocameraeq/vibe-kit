# Tutorial 03 — Convertir tus chats-rol en comandos guardados (con `/vibe-kit:crear-rol`)

> Este tutorial resuelve un dolor concreto: armás un "rol" hablando con Claude (un revisor que mira los permisos, un asistente que prepara el release), funciona bárbaro… y dos compactaciones después **se diluyó y lo tenés que re-explicar de cero**. Acá aprendés a tomar ese rol improvisado y dejarlo **guardado en disco como un comando propio**, para invocarlo con un `/` cuando quieras y que **aguante el `/compact`, el `/clear` y cerrar VSCode**.

---

## El problema, en una frase

Vos hacés esto todo el tiempo (y está bien): en medio de una charla con Claude le decís algo como…

> *"Che, de ahora en más cuando termine una feature quiero que un revisor mire que no me haya olvidado los roles, las listas configurables, el manejo de errores y el logging, y me devuelva una lista corta de lo que falta."*

Claude lo hace, sale perfecto, y vos seguís. **Pero ese rol vive en un mensaje suelto de la conversación.** Cuando la sesión se compacta (`/compact`) o la limpiás (`/clear`), ese mensaje se resume o desaparece, y el rol **se diluye**. La próxima vez tenés que escribir el párrafo entero otra vez. Y la otra. Y la otra.

> **La regla de oro:** un rol durable **NO vive en un mensaje de la charla. Vive en un archivo en disco** (un comando en `commands/` o un agente en `agents/`). Así sobrevive a `/compact`, a `/clear` y a cerrar el editor, y se invoca con un `/` la próxima vez.

El comando **`/vibe-kit:crear-rol`** es justamente el que mueve tu rol *del aire* (un mensaje) *al disco* (un `.md` con el formato correcto). Vos lo describís en palabras; él te hace 4-6 preguntas simples y escribe el archivo por vos.

---

## Qué vas a lograr en este tutorial

Al final vas a tener:

1. Un **comando propio guardado**, por ejemplo `/vibe-kit:revisor-permisos`, que invocás cuando querés.
2. Entendido la diferencia entre **comando** (lo disparás vos, charla guiada) y **agente** (ayudante que corre solo y vuelve con un informe), para elegir bien la próxima vez.
3. Convertido un segundo rol (preparar el release) para que se note que el patrón se repite.

Tiempo estimado: **10-15 minutos.** No vas a escribir una sola línea de código: respondés preguntas en español y aprobás.

---

## Antes de empezar (chequeo rápido)

- [ ] Tenés vibe-kit **instalado** (si no, hacé primero el [Tutorial 00 — Instalación](00-instalacion.md)).
- [ ] Tipeás `/vibe-kit:crear-rol` y aparece en el autocompletado. Si no aparece, corré `/reload-plugins`.

> **Por qué este comando es "meta":** la mayoría de los comandos del kit hacen una tarea (planear, arrancar una app, preparar un release). `/vibe-kit:crear-rol` es distinto: **fabrica comandos y agentes nuevos.** Es la herramienta que usa el Arquitecto para darte más herramientas. Una vez que lo dominás, dejás de depender de los comandos que vienen en la caja: te fabricás los tuyos.

---

## Comando vs agente: cuál de los dos querés (la decisión raíz)

Antes de arrancar, conviene tener clara la primera pregunta que te va a hacer, porque define todo lo demás. Es la misma tabla de decisión del playbook del kit:

| | **Comando** | **Agente** |
|---|---|---|
| **Cómo lo invocás** | Vos, con un `/` cuando querés | Lo lanza Claude en segundo plano (o se lo pedís) |
| **Te puede preguntar cosas** | **Sí** — charlás mientras corre | **No** — arranca en contexto fresco y vuelve con un resumen |
| **Ideal para** | Planear, decidir, preparar un release, un checklist que vos disparás | "Andá a revisar/explorar/auditar esto y volvé con un informe" |
| **Tiene efectos (commit, escribir)** | Sí, es común | Por lo general read-only (solo mira y reporta) |
| **Dónde se guarda** | `vibe-kit/commands/<nombre>.md` | `vibe-kit/agents/<nombre>.md` |

**La regla simple para elegir:**

- Si el rol necesita **hablarte o que vos decidas a mitad de camino** → es un **comando**. (Un agente NO te puede preguntar nada mientras trabaja.)
- Si el rol es **trabajo auto-contenido que produce mucho texto** (leer 10+ archivos, revisar con ojos frescos, explorar el código) y a vos solo te importa **el resumen final** → es un **agente**.

> No te preocupes si dudás: el comando `/vibe-kit:crear-rol` te recomienda cuál según lo que le contaste, y si decís "no sé" te ayuda a decidir con un par de preguntas.

---

## Caso guiado: convertir "el revisor de permisos" en un comando

Vamos con un ejemplo concreto y real para tu perfil (apps de gestión donde **olvidarse de los concerns transversales es el dolor #1**). Vas a crear un revisor que, cada vez que lo llames, te chequee que no te olvidaste de roles/permisos, listas configurables, manejo de errores y logging.

### Paso 1 — Llamá al comando describiendo el rol

Escribí el comando y, en la misma línea, contá en una frase qué rol querés convertir:

```
/vibe-kit:crear-rol un revisor que despues de una feature mire que no me haya olvidado los permisos, las listas configurables, el manejo de errores y el logging
```

Eso que escribís después del comando le llega como contexto (es el `$ARGUMENTS`). Si lo llamás vacío (`/vibe-kit:crear-rol` y nada más), su primer mensaje va a ser una sola pregunta pidiéndote esa frase. Cualquiera de las dos formas está bien.

> **Lo que pasa por detrás (no hace falta que lo entiendas, pero ayuda):** antes de preguntarte nada, el comando carga su manual interno —la skill `crear-agentes-y-comandos`— que tiene el **formato exacto** de Claude Code para comandos y agentes (qué campos existen, cuáles son obligatorios, cómo se restringen los permisos). Por eso el archivo que te va a escribir va a estar bien armado y **no va a inventar campos** que no existen.

### Paso 2 — Respondé las preguntas (una por vez)

El comando pregunta **de a una**, siempre con opciones numeradas y una marcada **(Recomendado)**. Vos respondés con el número, o con "recomendado"/"dale", o con una frase corta. Si querés ir rápido, podés contestar **`defaults`** y avanza con todas las recomendadas.

Estas son las preguntas que vas a ver, con la respuesta típica para este caso:

| # | Pregunta | Qué te conviene acá | Por qué |
|---|---|---|---|
| 1 | **¿Comando o agente?** | **Agente** (pero un comando también sirve) | "Andá a revisar y volvé con un informe" es trabajo auto-contenido. Si preferís dispararlo vos con un `/` y que te muestre todo en la charla, elegí comando. |
| 2 | **Nombre del rol** | `revisor-permisos` | En minúsculas, con guiones, sin espacios ni acentos. De ahí sale el `/`. |
| 3 | **¿Qué hace, en una o dos frases?** | "Mira el último cambio y chequea que estén cubiertos roles/permisos, listas configurables, errores y logging; devuelve una lista corta de lo que falta." | Con esto se arma la descripción y las instrucciones del rol. |
| 4 | **¿Qué permisos necesita?** | **Solo mirar** (Recomendado para revisores) | Un revisor no tiene que cambiar nada: solo lee y reporta. Cero riesgo de que rompa algo. |
| 5 | **¿Qué skills del kit necesita?** | **checklist-concerns** | Es la skill que tiene la lista de concerns transversales (la "constitución"): roles, listas, errores, logging, auditoría, i18n. Es exactamente lo que este revisor tiene que saber mirar. |
| 6 | (solo si es agente) **Modelo y disparo** | Modelo `inherit`, que Claude lo pueda delegar solo | `inherit` es lo simple. Una descripción con "Usalo cuando…" hace que Claude lo llame solo después de una feature. |

> **Una aclaración importante sobre la Pregunta 4 (permisos):** elegir **"solo mirar"** es lo que hace que el revisor sea *read-only de verdad*. En un agente, esto se traduce en listarle solo las herramientas de lectura (`tools: Read, Grep, Glob`). Si NO se le ponen herramientas, un agente **hereda todas** y podría editar — por eso para un revisor siempre se elige "solo mirar".

### Paso 3 — Revisá el archivo y dale el OK (el HALT)

Acá está la parte clave. **Antes de escribir nada en el disco**, el comando te muestra **el archivo completo** que va a crear (la ruta y todo el contenido) y te pregunta si lo aplica: **sí / no / cambiar algo**. Y **frena a esperar tu respuesta.**

> Esto se llama **HALT** y es una regla no-negociable del kit: nunca escribe un archivo sin tu "sí" explícito. Si algo no te cierra (el nombre, lo que hace, los permisos), decís "cambiá X" y lo ajusta antes de guardar.

Lo que vas a ver es algo así (para el caso agente):

```markdown
---
name: revisor-permisos
description: Revisa que un cambio no se haya olvidado los concerns transversales (roles/permisos, listas configurables, manejo de errores, logging). Usalo despues de terminar una feature para que un par de ojos frescos chequee lo que se suele olvidar.
tools: Read, Grep, Glob
model: inherit
skills:
  - checklist-concerns
---

Sos el revisor-permisos, un ayudante de vibe-kit. Cuando te invocan, mirás
el último cambio (git diff y los archivos tocados) y chequeás, contra la
skill checklist-concerns, que estén cubiertos: roles/permisos, listas
configurables desde panel, manejo de errores estándar y logging.

Devolvés un resumen corto en español: qué concern está cubierto (✅) y cuál
falta o quedó a medias (⚠️), con una línea de qué haría falta. No editás
nada: solo mirás y reportás.
```

Fijate dos detalles que el comando cuidó por vos:

- El frontmatter (el bloque entre `---`) usa **solo campos que existen** y, como es un **agente**, va en **camelCase** donde corresponde. Para los comandos, en cambio, el frontmatter usa guiones (`allowed-tools`, `disable-model-invocation`). El comando no mezcla las dos convenciones.
- La skill `checklist-concerns` quedó **pre-cargada** con el campo `skills:`. Eso es importante en un agente: como arranca en contexto fresco y **no ve tu charla**, conviene que su know-how ya esté cargado desde el arranque.

Decís **"sí"** y recién ahí escribe el archivo en `vibe-kit/agents/revisor-permisos.md`.

### Paso 4 — Activá y usá tu rol nuevo

El comando te lo explica al terminar, pero el resumen es:

```
/reload-plugins
```

Eso recarga el kit sin reiniciar, para que el rol nuevo aparezca. Después:

- Si lo hiciste **agente**: aparece en `/agents`, y lo usás diciéndole a Claude *"usá el agente `revisor-permisos` para revisar lo último"*. O Claude lo delega solo cuando detecta que terminaste una feature (gracias al "Usalo cuando…" de su descripción).
- Si lo hiciste **comando**: lo llamás escribiendo `/vibe-kit:revisor-permisos`.

**Y eso es todo: ya no lo tenés que volver a explicar nunca.** Vive en disco, así que aguanta el `/compact`, el `/clear` y cerrar VSCode.

---

## Segundo caso (más rápido): "preparar el release" → un comando

Para que se note que el patrón se repite, convertí ahora un rol que **sí necesita charlar con vos y tiene efectos** (commitear, versionar). Ese es el caso típico de **comando**, no de agente.

```
/vibe-kit:crear-rol un comando para preparar el release: que arme los commits con buen formato, suba la version, actualice el changelog y prepare el PR, preguntandome antes de cada paso
```

Las respuestas típicas:

| # | Pregunta | Respuesta para este caso | Por qué |
|---|---|---|---|
| 1 | ¿Comando o agente? | **Comando** | Tiene que preguntarte antes de cada paso y tiene efectos (commit, PR). Un agente no te puede preguntar nada mientras corre. |
| 2 | Nombre | `preparar-release` | Kebab-case. |
| 3 | ¿Qué hace? | "Arma commits con Conventional Commits, sube la versión, actualiza el CHANGELOG y prepara el PR, confirmando conmigo cada paso." | — |
| 4 | ¿Permisos? | **Mirar, escribir y correr comandos** | Necesita git (terminal). Como son acciones sensibles, conviene permisos finos del estilo `Bash(git add *) Bash(git commit *)`. |
| 5 | ¿Skills? | `ninguna` (o `playbook-orquestacion` si querés) | Un release es bastante mecánico; no necesita el banco de preguntas ni la matriz de stacks. |

Acá, como tiene efectos, el comando le va a poner `disable-model-invocation: true` en el frontmatter. ¿Qué significa eso? Que **Claude no lo dispara solo**: lo corrés vos a propósito, escribiendo `/vibe-kit:preparar-release`. Eso es justo lo que querés para algo que commitea y abre PRs: que no se ejecute por sorpresa.

> **Patrón que conviene memorizar:** *ambiguo cuando charlás, específico y controlado cuando ejecuta.* Los roles que tienen efectos (release, commit, fabricar cosas) se hacen **comandos** con `disable-model-invocation: true`, para que los dispares vos. Los roles de revisar/explorar/auditar se hacen **agentes read-only** que Claude puede delegar solo.

---

## Por qué esto cura el dolor del `/compact` (el fondo del asunto)

Vale la pena entender por qué guardar el rol en disco lo hace durable, porque es el corazón de todo el kit:

- **Un mensaje de la charla es frágil.** Cuando Claude compacta la sesión (resume para liberar espacio), tu párrafo de "quiero un revisor que…" se resume junto con todo lo demás y pierde fuerza, o directamente se va. Con `/clear` desaparece entero.
- **Un archivo `.md` en disco es permanente.** El comando o agente vive en `vibe-kit/commands/` o `vibe-kit/agents/`. No es parte de la conversación: es parte del **kit**. Reiniciás VSCode, abrís otro proyecto, pasan diez compactaciones — sigue ahí, a un `/` de distancia.
- **Las instrucciones del rol son permanentes, no "de una vez".** Cuando invocás el comando, su contenido entra como instrucciones que valen para todo el trabajo, no como un pedido suelto que se diluye.

> **Cuándo SÍ y cuándo NO usar `/vibe-kit:crear-rol`:** úsalo para roles que **repetís** ("siempre que… quiero que alguien…"). Si es algo que vas a hacer una sola vez, no hace falta fabricar un comando: pedíselo a Claude y listo. La señal de que conviene fabricar el rol es cuando te escuchás explicando lo mismo por segunda o tercera vez.

---

## Dónde quedan guardados (y por qué a nivel raíz)

Los archivos que fabrica el comando van **directo dentro de su carpeta**, nunca en subcarpetas anidadas:

- Comando → `vibe-kit/commands/<nombre>.md`
- Agente → `vibe-kit/agents/<nombre>.md`

> **Por qué nunca anidados:** Claude Code dejó de descubrir de forma confiable los slash commands metidos en subcarpetas profundas (es un bug real, conocido desde fines de 2024). La agrupación visual ya te la da el prefijo del plugin (`/vibe-kit:…`), así que **no hace falta** meter subcarpetas. El comando `/vibe-kit:crear-rol` ya respeta esta regla por vos.

Si en algún momento querés fabricar un rol solo para **un proyecto puntual** (en vez de para el kit reusable), se puede guardar en `.claude/commands/<nombre>.md` o `.claude/agents/<nombre>.md` en la raíz de ese proyecto. Pero el default —y lo recomendado— es guardarlo en el kit (`vibe-kit/…`), así lo tenés disponible en **todos** tus proyectos.

---

## Ideas de roles que te conviene fabricar

Tres roles que pegan justo con tu perfil (apps de gestión, datos del ERP, concerns que se olvidan):

1. **`revisor-permisos`** (agente, read-only) — el del ejemplo: chequea que no falten roles, listas configurables, errores y logging. Skill: `checklist-concerns`.
2. **`auditor-datos`** (agente, read-only) — antes de tocar el módulo de objetivos o la facturación, que revise que la frontera con Python esté bien (que la lógica de datos no se haya filtrado a la UI). Skill: `matriz-de-stacks`.
3. **`preparar-release`** (comando, con efectos) — el segundo ejemplo: commits + versión + CHANGELOG + PR, con confirmación en cada paso.

---

## Troubleshooting

### El rol nuevo no aparece después de crearlo
Corré `/reload-plugins`. Si lo creaste como agente, fijate que aparezca en `/agents`; si es comando, tipeá `/vibe-kit:` y revisá el autocompletado. Si seguís sin verlo y acabás de crear la **primera** carpeta nueva de algún tipo, reiniciá Claude Code una vez.

### Lo hice agente y me doy cuenta de que necesitaba que me pregunte cosas
Es la confusión más común. Un **agente no te puede hablar** mientras corre. Si el rol necesita entrevistarte o que decidas a mitad de camino, tiene que ser **comando**. Volvé a correr `/vibe-kit:crear-rol`, elegí **comando** en la Pregunta 1 y dale el mismo nombre (te va a ofrecer reemplazar el archivo, siempre con el HALT antes).

### Quiero ajustar un rol que ya creé
Volvé a llamar a `/vibe-kit:crear-rol` y decile "quiero ajustar el `revisor-permisos`". Lo lee, te propone el cambio y vuelve a pedirte el "sí" (HALT) antes de re-escribir el archivo.

### El revisor que hice como agente "no es read-only" (toca cosas)
Revisá que en el archivo tenga `tools: Read, Grep, Glob` (allowlist de solo lectura). Si ese campo **falta**, el agente hereda todas las herramientas. Pedíle al comando que lo ajuste a "solo mirar".

> **Nota fina (solo si te importa el read-only garantizado):** si querés que un agente sea read-only *a nivel motor* —que ni con la herramienta puesta pueda editar—, eso se logra con `permissionMode: plan`. Pero ese campo **se ignora en agentes empaquetados dentro de un plugin** (por seguridad). Si necesitás ese candado duro, el agente tiene que vivir en `.claude/agents/` o `~/.claude/agents/` del proyecto, no dentro de vibe-kit. Para la mayoría de los casos, listar solo `tools: Read, Grep, Glob` alcanza de sobra.

---

## Resumen en 5 líneas

```
1. /vibe-kit:crear-rol <descripcion del rol en una frase>
2. Responde 4-6 preguntas (numeradas, con (Recomendado)). Atajo: responde "defaults".
3. Comando = vos lo disparas y te habla | Agente = corre solo y vuelve con un informe.
4. Revisa el archivo que te muestra y deci "si" (HALT). Se guarda en commands/ o agents/.
5. /reload-plugins  -> y ya lo invocas con / cuando quieras. Aguanta /compact y /clear.
```

Cuando tengas un par de roles propios andando, seguí con el **[Tutorial 04 — Compactación y roles durables](04-compactacion-y-roles.md)**, donde se profundiza en por qué los roles guardados en disco le ganan al `/compact` y cómo organizar tus sesiones para no perder contexto.
