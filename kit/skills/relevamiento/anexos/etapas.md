# Las 4 etapas — qué cambia en cada una

> **El ritual de cierre vive en el `SKILL.md` y se corre igual en las cuatro.** Acá está sólo el
> inventario: qué campos toca cada etapa, qué lentes cierran, y las dos reglas propias (el GATE 1 de
> E3 y la sólo-lectura de `04:18`). **Abrí este anexo al entrar a cada etapa** — el motor te manda.

## Etapa 1 — El Problema (`1-problema.md`)

- **Los campos de Parte 1:** `01:28` (qué se pidió y quién — **acá la solución SÍ va**, la planilla lo
  pide textual en `01:29`) · `01:32` (cómo se hace hoy) · `01:36` (los por qué, 3 a 5 escalones) ·
  `01:40` (quién más lo sufre) · `01:43` (qué necesita lograr, **sin nombrar herramienta**).
- **Tres de los 5 críticos están acá**: `01:28` y `01:36` (el tercero, `01:40`, no lo es).
- **La clasificación vive en esta etapa** y sus 2 tandas cuentan dentro de las 6 interrupciones.
- **Los bloques de Parte 2** de las casillas tildadas entran al volcado como campos normales; si
  quedan vacíos, los cobra **R6**.
- **Cierran acá: L2 (Intentos previos) y L3 (Política).**

## Etapa 2 — El Sistema Actual (`2-sistema-actual.md`)

- **Los campos:** `02:15` (cómo se resuelve hoy) · `02:18` (qué herramientas — en brownfield es
  **lista cerrada**, ver `brownfield.md`) · `02:21` (dónde vive el dato) · `02:24` (**quiénes
  intervienen Y cada cuánto** — de acá sale la lista de roles, ver el motor) · `02:27` (qué se rompe)
  · `02:30` (¿toca un sistema con doc propia?).
- **`02:24` es la celda más cara del método**: son dos preguntas mezcladas. **Media respuesta no es
  respuesta**: si vino la frecuencia sin los roles, la mitad de roles queda `SIN RESPONDER` y prende
  la cinta. No la des por completa porque tenga texto.
- **Anotá L5b y L6 para E3** (con su cita, estado `en banco`): se gatean por el apetito, que todavía
  no existe. **No las preguntes acá.**
- **Cierran acá: L4 (Números), L5a (Comprar adentro), L8 (Dos verdades), L9 (El caso raro).**

## Etapa 3 — La Necesidad (`3-necesidad.md`)

- **Los campos:** `03:15` (**la línea base, con número**) · `03:18` (el resultado esperado) ·
  `03:21` (**el criterio de éxito, observable a las 4-6 semanas, sin nombrar solución**) ·
  `03:24` (**el apetito, en días**) · `03:27` (los supuestos) · `03:30` (el más riesgoso) ·
  `03:33` (la prueba barata y qué dio).
- **Tres de los 5 críticos están acá**: `03:15`, `03:21`, `03:24`.
- **⚠️ GATE 1 — la E3 no cierra sin `03:33`.** El supuesto más riesgoso (`03:30`) necesita su prueba
  barata: una charla, mirar un dato real, un boceto, resolver un caso a mano. **1-2 días, sin
  construir.** La etapa queda **abierta** hasta que él vuelva con eso. Es el único gate que frena.
- **Si el supuesto se cae:** escribilo **sin suavizarlo**, en **dos columnas — qué se cayó y qué sigue
  en pie**. **Nada se tira**: la línea base, el criterio, el apetito y todo E1/E2 sobreviven casi
  siempre, y muchas veces el problema sólo cambió de lugar. Seteá `apto: NO — <razón>` y ofrecé 3
  salidas (re-encuadrar el problema · probar otro supuesto · parar acá y escribir el "no construir").
- **Al cerrar E3 sellá `chequeo: PENDIENTE — arranca al primer uso`** en el TABLERO. **No lo calcules
  con el apetito**: el apetito es recorte de esfuerzo, no plazo. Se convierte en fecha (`+6 semanas`)
  la primera vez que el proyecto llega a producción.
- **Cierran acá: L1 (Reloj), L5b (Comprar afuera), L6 (Choque), L7 (El día después)** — las cuatro que
  esperaban el apetito.

## Etapa 3.5 — El abanico de salidas, y después el ruteo

No es una etapa del método del jefe: es donde se decide **qué se hace** y, recién después, **quién lo
piensa**.

### Primero el abanico — las 6 familias

Existe porque la planilla pide "2 alternativas + seguir igual" pero no obliga a que ninguna sea
distinta de construir — y en la práctica A y B terminan siendo dos formas de construir lo mismo.

| Familia | Se ofrece si… |
|---|---|
| **Seguir igual / no hacer nada** | **siempre** — ya está en la planilla (`04:28`), con su costo escrito |
| **Arreglar lo que ya usan** | `02:18` nombra una herramienta (el Excel, la planilla compartida) |
| **Cambiar el proceso o quién lo hace** | la lista de roles tiene 2+ |
| **Prender algo que ya pagamos y nadie usa** | `02:18` o `02:30` nombran un sistema comprado (lo mismo que gatilla L5a) |
| **Comprar o contratar** | la investigación trajo algo. Si no se miró, se escribe **"no se investigó el mercado"** — **nunca "no hay nada"** |
| **Construir software nuevo** | **siempre disponible, nunca por default** |

**Las que no aplican se descartan solas, pero CON la razón escrita** al lado, y van a
`## Descartados` del TABLERO. De ahí salen a dos lados: a las alternativas del documento 4, y a
la sección 3 del HANDOFF (*"ya decidido, no lo re-propongas"*). Una familia descartada sin razón
escrita vuelve a proponerse dentro de un año y hay que averiguar todo de nuevo.

**Se ofrecen las que quedan** con `AskUserQuestion` (≤4 por tanda). Si quedan más de 4, van las 4
mejor apoyadas por evidencia y el resto se nombra en una línea.

### Después el ruteo

Sólo si la elegida es **construir software nuevo** hay algo que rutear. Todo el detalle está en
**el motor**, sección "La costura con el Arquitecto": la regla binaria, los 3 tramos de apetito y
el token explícito. Si la elegida es cualquier otra, **la skill escribe el documento 4 sola** y el
Arquitecto no se entera de nada.

## Etapa 4 — La Propuesta de Valor (`4-propuesta.md`)

- **Se escribe SIEMPRE**, termine en software o no. En el caso "no construir" es un entregable de
  primera clase, con su formato propio en `entregable.md`.
- **⚠️ Lentes = 0.** Este documento va a una reunión con la gente que lo va a usar; no es el momento
  de traer ángulos nuevos. Lo que quedó sin preguntar va a **"Lo que no preguntamos"** con su riesgo.
- **⚠️ `04:18` es SÓLO-LECTURA para vos.** Es **transcripción con sello** del criterio de éxito y el
  apetito: *"copiado de 3-necesidad P3/P4 el `<fecha>`"*. **Nunca lo edites acá.** Si la reunión los
  ajusta, se edita en `3-necesidad.md` —lo que marca `PDF VIEJO` en E3— y `04:18` se regenera.
  Editarlo acá parte el criterio en dos versiones y el tramo 5 chequea la equivocada.
- **Las alternativas (`04:22`, `04:28`)**: salen del abanico de E3.5, al menos 2 + **"seguir igual"
  con su costo**. Que una de ellas **no sea construir** — si A y B son dos formas de construir lo
  mismo, no se evaluó nada.
- **⚠️ Ninguna alternativa nombra una tecnología.** Si "Alternativa A" dice Next.js, Supabase o
  "una app web con login", es un bug: dejaste de comparar **caminos** y empezaste a comparar
  herramientas, delante de gente que no sabe qué es ninguna. Las alternativas se escriben por lo
  que **cambia para la gente**. Lo técnico entra recién en `04:35` (*"cómo funcionaría, en
  criollo"*) y, si hay que precisarlo, es del Arquitecto — no de este documento.
- **El "esfuerzo" de cada alternativa se escribe contra el apetito, no en abstracto**: `ENTRA` ·
  `ENTRA (con plata a aprobar)` · `NO ENTRA` · `NO SE SABE — falta averiguar <qué>`. Comparar
  contra un número que ya se decidió (`03:24`) es discutible; inventar una estimación absoluta
  antes de diseñar, no. *(La celda de la planilla no se toca: se completa así.)*
- **Lo que vino de una lente va fundido pero marcado `[fp]`.**
- **Parte 2 es la reunión**, y se llena **después** de tenerla: se presentó a quiénes, objeciones,
  ajustes acordados, aprobada sí/con ajustes/no.
- **Al cerrar E4 salen DOS PDF**: `4-propuesta.pdf` y `dossier-<slug>.pdf` (los 4 juntos).
