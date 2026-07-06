# Tutorial 04 — Por qué se te "pierde el rol" al compactar (y cómo blindarlo)

> Para no-programadores. Te explico en criollo qué pasa cuando Claude Code "se olvida" de que estaba siendo el Arquitecto, por qué pasa, y las tres cosas que tenés que hacer para que NUNCA más se te diluya el rol a mitad de un laburo largo.

---

## El problema, contado como te pasa a vos

Estás dirigiendo a Claude. Le dijiste "sos el Arquitecto, no escribís código, me entrevistás" — o arrancaste `/arquitecto`. Todo va bien: te hace preguntas, te propone alternativas, no toca nada. Pasan 40 minutos. La conversación se hace larga. De repente ves un cartelito que dice algo como *"compacting conversation…"* o lo lanzás vos con `/compact`.

Y a los dos mensajes… **Claude ya no es el Arquitecto.** Te empieza a escribir código sin preguntar, se olvidó de tu checklist de concerns, perdió el tono. Como si hubiera arrancado de cero.

Esto es lo más frustrante del vibe coding y tiene una explicación simple. No es que Claude "se canse": es **cómo funciona la memoria de la conversación**. Una vez que entendés el mecanismo, lo arreglás para siempre.

---

## Por qué pasa: la conversación tiene un techo

Claude Code tiene una **ventana de contexto** — un techo de cuánto texto puede "tener en la cabeza" a la vez. Tu conversación entera (cada pregunta tuya, cada respuesta suya, cada archivo que leyó) ocupa lugar dentro de ese techo.

Cuando la conversación se acerca al techo (alrededor del 60-80% lleno), pasa una de dos cosas:

1. **Auto-compactación:** Claude Code, solo, resume la conversación vieja para hacer lugar. Tira lo que considera menos importante y se queda con un resumen.
2. **Vos hacés `/compact`:** lo mismo, pero a pedido tuyo.

El problema es éste: **el resumen no garantiza que sobreviva tu rol.** Si vos definiste "sos el Arquitecto" en un mensaje suelto al principio de la charla, ese mensaje es justo del tipo de cosa que la compactación puede comprimir hasta dejarlo irreconocible. El resumen se queda con *de qué hablaron* (la facturación, los roles, las entidades) pero pierde *quién era Claude mientras hablaban*.

> **La regla de oro:** lo que vive solo en un mensaje suelto de la charla es **frágil**. Sobrevive a la compactación lo que está en un **lugar durable** — un archivo que Claude relee, o un comando que se vuelve a invocar. Tu trabajo es poner el rol en un lugar durable, no en un mensaje al pasar.

---

## Las DOS memorias de Claude Code (clave para entender todo esto)

Acá está el corazón del asunto. Claude Code tiene **dos sistemas de memoria distintos**, y confundirlos es lo que te hace perder el rol:

### Memoria 1 — `CLAUDE.md` (la que escribís VOS)

Es un archivo de texto que vos controlás. Hay varios niveles:

- **`~/.claude/CLAUDE.md`** (global): tu golden path personal, tu estilo, tu checklist corto de concerns. Aplica a TODOS tus proyectos. Ideal: menos de 80 líneas.
- **`./CLAUDE.md`** (en la raíz del proyecto, se sube a git): descripción, stack, comandos exactos, arquitectura, reglas de estilo. Lo comparte tu equipo.
- **`./CLAUDE.local.md`** (tus notas personales, NO se sube a git).

Lo importante: **el `CLAUDE.md` se vuelve a cargar siempre.** Después de compactar, después de cualquier cosa, Claude lo tiene presente. Es durable por diseño. Lo que escribís ahí, vuelve.

### Memoria 2 — la auto-memory (la que escribe CLAUDE solo)

Es lo que Claude anota por su cuenta en `~/.claude/projects/<tu-proyecto>/memory/`. Viene prendida por defecto. Sirve para que recuerde cosas entre sesiones.

**Trampa importante:** la auto-memory es **local a tu máquina y NO se versiona** (no va a git). Si cambiás de PC, se pierde. Por eso, **lo crítico (incluido el rol y las decisiones de arquitectura) NO puede vivir solo en la auto-memory.** Tiene que estar en lugares portables: el `CLAUDE.md`, el `project.yaml`, y los archivos de `docs/` que sí subís a git.

> En una línea: **CLAUDE.md = lo que escribís vos y siempre vuelve. Auto-memory = lo que Claude anota solo, vive solo en tu PC, y no te salva si querés algo durable y portable.**

---

## La solución, en tres niveles (de menos a más blindado)

Hay tres lugares donde podés "anclar" el rol para que sobreviva a `/compact`. Usá los que necesites; para el Arquitecto, conviene combinar los tres.

### Nivel 1 — El rol vive en un COMANDO, no en un mensaje suelto

Esta es la diferencia más grande y la más fácil.

**Mal (frágil):** abrís un chat y tipeás "ahora sos el Arquitecto, no escribas código, entrevistame…". Ese rol vive en un mensaje. Se compacta. Se diluye.

**Bien (durable):** invocás `/arquitecto`. ¿Por qué es durable? Porque un slash command es un archivo (`commands/arquitecto.md`) cuyo contenido se inyecta como instrucciones cada vez que lo llamás. Y lo más importante:

> Tras la auto-compactación, Claude Code **vuelve a adjuntar las invocaciones recientes** de tus skills/comandos (los primeros ~5.000 tokens de cada una, con un presupuesto combinado de ~25.000). O sea: el rol que entró por un comando **se re-engancha solo** después de compactar. El que entró por un mensaje suelto, no.

Por eso `vibe-kit` te da el rol del Arquitecto como el comando `/arquitecto` (a nivel raíz de `commands/`), no como un texto que copiás y pegás. Lo mismo con `/feature`, `/fix`, `/release`, etc.

**Y si igual se diluyó:** lo más simple es **re-invocar el comando**. Volvés a tipear `/arquitecto` y el rol vuelve fresco. No tenés que reescribir nada.

### Nivel 2 — Las reglas que NO pueden faltar viven en `CLAUDE.md`

El rol del Arquitecto es una cosa; las **reglas permanentes del proyecto** son otra. Cosas como:

- "Cuando la realidad diverge del spec, arreglá el spec PRIMERO, después el código."
- "Tras una feature, actualizá `CLAUDE.md` y `docs/` en el mismo commit."
- Tu checklist corto de concerns (roles/permisos, listas configurables, errores+logging…).
- Los boundaries: qué se puede tocar siempre (✅), qué hay que preguntar (⚠️), qué nunca (🚫).

Todo eso va en el `CLAUDE.md`, que **siempre se recarga**. No depende de que vos te acuerdes ni de que la compactación sea piola. Es la base que sobrevive a todo.

Regla de tamaño: **mantené el `CLAUDE.md` corto** (ideal 30-80 líneas, máximo 150-200). Un `CLAUDE.md` inflado hace que Claude IGNORE las reglas que sí importan. Test por línea: *"¿borrar esta línea haría que Claude se equivoque?"* Si no, borrala.

### Nivel 3 — Lo que DEBE pasar siempre va en un HOOK (no en un texto que aconseja)

Acá está el salto de calidad y la honestidad brutal del kit:

> **El `CLAUDE.md` y el rol son *advisory* — aconsejan, no obligan.** Claude puede saltarse una instrucción escrita, sobre todo en una conversación larga o después de compactar.

Si hay algo que tiene que pasar **sí o sí** (correr el lint/typecheck/test al cerrar cada turno, bloquear escrituras peligrosas, marcar cuándo cambió la API), eso NO se confía a un texto. Se mete en un **hook**: un pedazo de código determinista que Claude Code ejecuta solito, sin pedirle permiso al modelo.

Un hook no se compacta, no se diluye, no se olvida. Es la red de seguridad de hierro. Por eso `vibe-kit` trae el Stop hook de verificación y los hooks de control en `hooks/hooks.json`. La regla mental:

- ¿Es una preferencia o un criterio? → `CLAUDE.md` o el comando.
- ¿Es un rol conversacional? → el comando (`/arquitecto`).
- ¿Es algo que DEBE pasar siempre, sin excepción? → un **hook**.

---

## `/compact` vs `/clear`: cuándo cada uno

Dos comandos que parecen lo mismo y NO lo son:

| | `/compact` | `/clear` |
|---|---|---|
| **Qué hace** | Resume la conversación, preserva el código y las decisiones importantes | Borra TODO el contexto, empezás de cero |
| **Cuándo** | Cuando la sesión coherente se hizo larga (~60% del contexto) pero seguís en la misma tarea | Cuando cambiás a una tarea NO relacionada |
| **Cuidado** | Puede diluir un rol que vive en un mensaje suelto (por eso anclalo en comando/CLAUDE.md) | Te lleva puesto todo lo que no esté guardado en disco |

**Antes de `/clear` siempre:** asegurate de que lo importante esté guardado en `CLAUDE.md` o en el `project.yaml`. El `/clear` no perdona — lo que no escribiste a disco, se fue.

**Tip de oro (el antipatrón "corregir una y otra vez"):** si ya corregiste lo mismo 2 o más veces y Claude vuelve a equivocarse, el contexto está **envenenado**. No insistas en el mismo chat. Hacé `/clear` (con lo importante ya guardado) y volvé a arrancar con `/arquitecto` y un prompt mejor. **Una sesión limpia rinde más que una sesión larga contaminada.**

---

## El `/compact` con instrucciones (truco subestimado)

No hace falta que `/compact` resuma "a ciegas". Le podés decir QUÉ preservar.

En vez de un `/compact` pelado, le pasás una instrucción de qué te importa que sobreviva:

```
/compact Preservá: que sos el Arquitecto en Plan Mode (no escribís código),
el checklist de concerns activos, las entidades del dominio (facturas,
clientes, objetivos), y las decisiones de arquitectura que ya aprobamos.
```

Así el resumen se arma alrededor de lo que vos marcaste como crítico, en vez de lo que la heurística adivine. Es una red de seguridad extra cuando estás en una sesión larga y no querés perder ni el rol ni las decisiones.

Combinalo con re-invocar el comando: `/compact` con instrucciones **y** después un `/arquitecto` para refrescar el rol = cinturón y tiradores.

---

## Por qué esto importa especialmente para el Arquitecto

El Arquitecto de `vibe-kit` es un caso límite, porque su valor está justo en lo que la compactación tiende a romper:

- Corre como **agente principal** (no subagente) en **Plan Mode** (read-only: NUNCA escribe código). Si se diluye el rol, lo primero que se pierde es ese "no escribas código" — y ahí empieza a tocar cosas sin tu permiso.
- Su persona (español rioplatense, vos, preguntas multiple-choice con opción **Recomendado**, una pregunta a la vez) es exactamente el tipo de instrucción que un resumen aplana.
- Su HARD GATE ("no escribo nada hasta que apruebes el diseño") es no-negociable y no puede depender de que el modelo "se acuerde".

Por eso el Arquitecto está blindado en las tres capas:

1. **Comando durable:** vive en `commands/arquitecto.md`, se re-engancha tras compactar, y lo refrescás re-invocándolo.
2. **Reglas en `CLAUDE.md` / constitución:** el checklist de concerns y los boundaries de 3 niveles (Verde siempre / Ámbar preguntar / Rojo nunca) viven en lugares que siempre se recargan.
3. **Hooks deterministas:** lo que DEBE pasar (gates de verificación) no se confía al prompt.

Y el handoff está pensado a prueba de compactación: el Arquitecto **escribe el spec a disco** (un `.md`). Una vez que el spec está en un archivo, ya no importa si la charla se compacta o se borra — **el spec es la memoria durable**. La ejecución arranca en una **sesión FRESCA** que lee ese archivo. Nada crítico queda colgado de la conversación.

---

## Resumen para pegar en la heladera

1. **El rol se pierde porque vive en un mensaje suelto.** Ponelo en un **comando** (`/arquitecto`) o en `CLAUDE.md` → ahí es durable.
2. **Hay dos memorias:** `CLAUDE.md` (la escribís vos, siempre vuelve) y la auto-memory (la escribe Claude, es local y NO se versiona). Lo crítico va en `CLAUDE.md` + `project.yaml` + `docs/`, no solo en la auto-memory.
3. **Tras compactar, los comandos recientes se re-enganchan solos.** Si igual se diluyó, **re-invocá el comando** — vuelve fresco.
4. **`/compact`** resume y preserva (misma tarea); **`/clear`** borra todo (tarea nueva). Antes de `/clear`, guardá lo importante a disco.
5. **`/compact` con instrucciones:** decile qué preservar (el rol, los concerns, las decisiones).
6. **Lo que DEBE pasar siempre va en un HOOK**, no en un texto. El `CLAUDE.md` aconseja; el hook obliga.
7. **El Arquitecto escribe el spec a disco** → la memoria durable es el archivo, no la charla. La ejecución corre en sesión fresca.

> En criollo: no le pidas a la conversación que se acuerde de quién es Claude. Poné el rol en un comando, las reglas en `CLAUDE.md`, los gates en hooks, y el resultado en un `.md` a disco. La charla puede ir y venir; el rol y el laburo quedan anclados.
