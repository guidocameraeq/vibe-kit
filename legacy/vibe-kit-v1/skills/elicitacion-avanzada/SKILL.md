---
name: elicitacion-avanzada
description: Tras escribir una seccion de un spec (requisitos, diseno, alcance, riesgos), ofrece un menu numerado 1-5 de lentes de razonamiento para refinarla (pre-mortem, primeros principios, inversion, red team, socratico). Usala cuando el usuario quiera profundizar, criticar o mejorar lo que acabas de proponer, o cuando termines de redactar una seccion del spec y haga falta someterla a presion antes de seguir.
disable-model-invocation: false
allowed-tools: Read
---

# Elicitacion avanzada (menu de refinamiento estilo BMAD)

Esta skill es para el **Agente Arquitecto** (o cualquier sesion que este escribiendo un spec). Sirve para **someter a presion** una seccion recien escrita antes de darla por buena: la mira con distintas "lentes de razonamiento" (pre-mortem, primeros principios, red team, etc.) y propone mejoras. No reemplaza la entrevista de descubrimiento; viene **despues**, una vez que ya hay texto sobre la mesa.

> **Para que NO programa:** pensalo como un panel de asesores que revisa lo que escribimos desde angulos distintos. Vos elegis que angulo aplicar tipeando un numero. Nunca toco nada del documento sin tu OK explicito.

---

## Cuando se dispara

Ofrece este menu **inmediatamente despues de proponer/escribir una seccion del spec**, por ejemplo:

- Una user story o un bloque de requisitos.
- Una decision de diseno (que stack, que entidades, que frontera Python/TS).
- El **Scope** (que entra y que NO entra) de una propuesta.
- La seccion de **riesgos** o de concerns transversales (roles, logging, auditoria).

No lo ofrezcas en mitad de una pregunta de entrevista ni cuando todavia no hay nada redactado: primero se escribe la seccion, despues se refina.

---

## Como se usa (el loop)

**Paso 1 — Elegir 5 lentes segun el contexto.**
Antes de mostrar el menu, leé el catalogo completo con la herramienta Read sobre el archivo auxiliar:

- Catalogo de lentes: [methods.csv](methods.csv) — columnas `num,category,method_name,description,output_pattern`.

De ese catalogo elegí **5 lentes balanceadas y pertinentes a ESTA seccion** (no siempre las mismas). Guia rapida de seleccion:

- **Seccion de alcance / requisitos** → Replantear la pregunta, Simplificar (YAGNI), 5 Por Que, Primeros principios, Stakeholders olvidados.
- **Seccion de diseno / arquitectura** → Primeros principios, Pensamiento de segundo orden, Auditoria de supuestos, Criticar y refinar, Barrido de casos limite.
- **Seccion de riesgo / concerns** → Pre-mortem, Abogado del diablo (red-team), Que pasa si se cae X, Inversion, El peor usuario malicioso.
- **Decision con stakeholders / negocio** → Mesa de roles del producto, Stakeholders olvidados, 5 Por Que, Preguntas socraticas, Recorre el proceso real del usuario.

Usá siempre el nombre EXACTO de la columna `method_name` del CSV; si editás el CSV, revisá que estos nombres sigan existiendo.

**Paso 2 — Mostrar el menu.**
Presentá las 5 lentes elegidas, numeradas 1 a 5, cada una con su nombre y una linea de que hace. Cerrá SIEMPRE con esta linea de opciones (affordances):

```
Elegi un numero (1-5) para aplicar esa lente, [r] para rebarajar otras 5,
[a] para ver todas las lentes disponibles, o [x] para seguir adelante.
```

**Paso 3 — Reaccionar a lo que elija el usuario:**

- **1-5** → Aplicá ESA lente sobre la seccion actual: razoná en voz alta siguiendo el `output_pattern` de esa fila del CSV y proponé las mejoras concretas que surjan. **NO toques el documento todavia** (ver HALT abajo).
- **[r] (reshuffle / rebarajar)** → Elegí 5 lentes DISTINTAS del catalogo y volvé a mostrar el menu.
- **[a] (all / ver todas)** → Listá todas las lentes del `methods.csv` (numeradas) para que el usuario pueda pedir una puntual; despues volvé al menu de 5.
- **[x] (proceed / seguir)** → Cerrá la elicitacion de esta seccion y continuá con el spec. Es la unica forma de salir del loop.

**Paso 4 — Loop acumulativo.**
Tras aplicar una lente, las mejoras se **acumulan** y volvés a presentar el **mismo menu** (Paso 2). El usuario puede pasar varias lentes seguidas sobre la misma seccion. Seguís ofreciendo el menu hasta que elija **[x]**.

---

## HALT obligatorio (no negociable)

Esta es la regla mas importante de la skill, robada de BMAD:

> **Nunca apliques cambios al documento sin confirmacion explicita.**

Despues de proponer mejoras con una lente, si el usuario quiere incorporarlas al spec, **frená y preguntá**:

```
¿Aplico estos cambios a la seccion? (s / n / otra cosa que quieras ajustar)
```

y **ESPERA la respuesta**. No edites, no reescribas la seccion, no avances a la siguiente hasta tener un `s` (o una instruccion concreta). Si el usuario dice `n`, dejá la seccion como estaba y volvé al menu. Este HALT es **por edicion** y es distinto del HARD GATE de fase (no escribir codigo hasta aprobar todo el diseno): los dos valen y ninguno se saltea.

---

## Reglas de oro

- **Una lente por vez.** No apliques varias juntas; el valor esta en ver la seccion desde un angulo claro cada vez.
- **Concreto, no abstracto.** Cada lente tiene que terminar en mejoras accionables sobre ESTA seccion, no en teoria.
- **Tono rioplatense, cero jerga.** El usuario no programa: explicá los hallazgos en criollo.
- **El menu siempre termina con la linea de affordances** `(1-5) [r] [a] [x]`. Si te olvidas las opciones, el usuario queda sin saber como salir.
- **[x] es la unica salida.** Mientras no aparezca, seguís ofreciendo el menu tras cada lente.

---

## Ejemplo de uso

**Contexto:** el Arquitecto acaba de escribir la seccion de *Scope* del spec de la app de facturacion (la que levanta datos del ERP).

**Arquitecto (tras escribir la seccion):**

> Listo, esta la seccion **Alcance** de la primera version:
> - **Entra:** levantar facturacion del ERP, aplicar las formulas y mostrar un dashboard de objetivos.
> - **No entra (por ahora):** edicion manual de facturas, multi-empresa, app movil.
>
> Antes de seguir, te paso 5 lentes para apretar esta seccion. (Para una de Scope conviene mirar simplicidad y limites.)
>
> 1. **Simplificar (YAGNI)** — buscar que features sobran y achicar al minimo que resuelve el dolor.
> 2. **Replantear la pregunta** — chequear si el problema que estamos atacando es el real.
> 3. **Stakeholders olvidados** — ver a quien mas le pega esto ademas del usuario obvio.
> 4. **Pre-mortem** — imaginar que esta v1 fracaso y por que.
> 5. **5 Por Que** — ir a la causa raiz de por que necesitamos esto.
>
> `Elegi un numero (1-5) para aplicar esa lente, [r] para rebarajar otras 5, [a] para ver todas, o [x] para seguir.`

**Usuario:** `4`

**Arquitecto (aplica Pre-mortem, patron `fracaso futuro -> causas -> prevencion ahora`):**

> **Pre-mortem.** Imaginemos que en 3 meses esto fracaso:
> - *Causa probable 1:* las formulas del ERP cambiaron y la app quedo desactualizada → **prevencion:** dejar las formulas configurables desde el panel, no hardcodeadas.
> - *Causa probable 2:* el ERP no respondia y la app se colgaba → **prevencion:** ya tenemos "manejo de errores + reintentos" en concerns; lo anclamos a esta seccion.
> - *Causa probable 3:* el dashboard mostraba numeros que nadie entendia → **prevencion:** sumar al alcance un "glosario / definicion de cada KPI".
>
> Mi sugerencia: agregar al Scope esos tres puntos de prevencion.
>
> `¿Aplico estos cambios a la seccion? (s / n / otra cosa que quieras ajustar)`  ← **HALT, espero tu respuesta.**

**Usuario:** `s`

**Arquitecto:** *(recien ahora actualiza la seccion Scope con los tres puntos y vuelve a mostrar el menu 1-5/r/a/x por si quiere aplicar otra lente, o `x` para seguir.)*

---

## Notas tecnicas (para quien arma el kit)

- El archivo **`methods.csv`** vive en esta misma carpeta y se carga **on-demand** (progressive disclosure): no ocupa contexto hasta que la skill lo lee con Read. Para sumar o cambiar lentes, editá solo el CSV manteniendo el header `num,category,method_name,description,output_pattern`.
- Esta skill se invoca dentro del plugin como **`/vibe-kit:elicitacion-avanzada`**, o el Arquitecto la usa sola cuando termina una seccion. El nombre de comando sale del **nombre de la carpeta** (`elicitacion-avanzada`), no del campo `name`.
- Corre **inline en la conversacion principal** (no lleva `context: fork`): tiene que poder dialogar con vos en el momento, justo lo que un subagente no puede hacer.
