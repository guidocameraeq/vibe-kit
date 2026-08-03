# Presupuesto de líneas — `/relevamiento`

> Reconciliación de tres estimaciones independientes (bottom-up · analogía · pesimista), cruzada contra el SPEC y contra los archivos reales del kit medidos con `wc -l -c` el 2026-08-03. Este documento es **el contrato**: el que construya escribe contra la tabla del motor, no contra su criterio.

---

## El número

| Pieza | Líneas | Bytes est. | Techo | ¿Entra? |
|---|---:|---:|---|---|
| `SKILL.md` (el motor) | **251** | ~22,6 KB | ≤260 | **SÍ** — 9 líneas de margen (3,5 %) |
| `anexos/revision.md` | 58 | ~5,2 KB | — | — |
| `anexos/lentes.md` | 82 | ~7,2 KB | — | — |
| `anexos/entregable.md` | 130 | ~9,6 KB | — | — |
| `anexos/brownfield.md` | 52 | ~4,6 KB | — | — |
| **Motor + anexos** | **573** | **~48 KB** | — | — |
| `plantillas/1..4-*.md` (fork de trabajo) | ~303 | ~10,3 KB | — | — |
| `plantillas/` auxiliares (8 archivos) | ~185 | ~10 KB | — | — |
| **Conjunto sin `_fuente/`** | **~1061** | **~68 KB** | ≤60 KB | **NO — se pasa por ~8 KB** |
| `plantillas/_fuente/` (medido, no estimado) | 277 | 7,9 KB | excluido | — |

**Veredicto en dos partes:**

1. **El techo de líneas se cumple: 251 de 260.** No por apretar prosa: por tres mudanzas que ya están descontadas (el cuerpo del HANDOFF, el esquema del TABLERO y el catálogo de las 9 lentes salen del motor). Si alguien las escribe en el `SKILL.md` "porque es más cómodo tenerlas a mano", el archivo se va a ~330 y revienta.
2. **El techo de 60 KB NO se cumple, y no se arregla moviendo cosas.** Mover contenido del motor a un anexo cambia **cero bytes** del conjunto. Sólo se arregla borrando ~120 líneas de contenido que el SPEC declara, o corrigiendo el techo. **Hay una recomendación abajo (§ El techo de 60 KB) y hay que decidirla antes de escribir la primera línea, no al final.**

**Medición de referencia (real, 2026-08-03):**

| Skill | Motor | Anexos | Plantillas | Total dir | B/línea |
|---|---:|---:|---:|---:|---:|
| `arquitecto` — 3 modos | 184 (19,1 KB) | 388 (33,0 KB) | templates | 821 / 68,4 KB | 85,3 |
| `arquitecto-skills` | 112 (8,3 KB) | 65 | — | 177 / 17,1 KB | 99,0 |
| `docs-fyd` | 281 (21,6 KB) | 206 (15,0 KB) | 312 (14,7 KB) | 799 / 50,2 KB | 64,3 |
| **`relevamiento` (presupuesto)** | **251** | **322** | **~488** | **~1061 / ~68 KB** | ~64 |

Sanidad: el Arquitecto resuelve 3 modos en 184 líneas de motor con 388 de anexos. `/relevamiento` tiene **un** flujo pero más maquinaria (revisor + lentes + 5 baldes + 3 gates + PDF + costura + tramo 5), y queda en 251 con 322 de anexos. El motor es **1,36×** el del Arquitecto y hace ~1,5× de trabajo. La proporción motor:anexos es 1:1,28 contra el 1:2,1 del Arquitecto — más pesado, y es el precio de tener un solo flujo con muchos gates. Es consistente, no optimista.

---

## El motor, bloque por bloque

En el orden en que van a estar en el archivo. **Esto es el contrato.**

| # | Bloque | Líneas | Qué contiene |
|---:|---|---:|---|
| 1 | Frontmatter | 4 | `---` · `name` · `description` (7 disparadores + los 4 "NO usar para", en UNA línea física) · `---` |
| 2 | H1 + identidad | 8 | Qué sos: ordenás el dictado, cobrás las deudas con revisor+lentes, decidís si termina en software. Puntero al ADR |
| 3 | Punteros a los 4 anexos + a `plantillas/` | 9 | Un bullet por anexo diciendo qué vive adentro + `_fuente/` no se toca nunca |
| 4 | Dónde escribís | 12 | Árbol de `_relevamientos/` (8, con fences) · ruta base de `arquitecto:20` + `AskUserQuestion` UNA vez si no se lee, nunca al cwd en silencio · el slug se propone, no se pregunta |
| 5 | Reglas de oro (8) | 15 | Persistir antes de la siguiente pregunta · una por vez, ≤4 opciones / header ≤12 · re-preguntar lo volcado es un bug · negativo por silencio ≠ ausencia comprobable · toda respuesta lleva balde · write-set cerrado + FRENÁ · privacidad de personas (3 líneas: qué se frena, el marcador, no frena sin guardar) · `notas/` append-only |
| 6 | El límite honesto | 6 | No habla con nadie · no mide · el vistazo de mercado · le va a errar a un gatillo · "toda pregunta de más muere en un clic". SPEC §6 lo exige literal acá |
| 7 | La guardia de entrada (5 señales, en orden) | 13 | Escaneo de `chequeo:` vencido (3) · 2+ relevamientos abiertos (2) · `relevamiento sirvió` → tramo 5 (1) · retome en 3 líneas (2) · señal dura brownfield: cwd o ancestro con `.git/` → carril, se confirma en una línea (3) |
| 8 | La entrada 1 — la pregunta cero | 8 | Blockquote textual de 2 opciones con sus dos destinos · "si ya lo dijo al invocar, no se hace" · la variante `caracter: personal` |
| 9 | La entrada 2 — el volcado + la degradación | 14 | La frase textual (con el escape "cancelá" adentro) · mostrar el mapeo campo/balde/contador · los 5 campos críticos con sus referencias `01:28,01:36,03:15,03:21,03:24` · auto-supuesto con antídoto · fast-path · `SUPUESTO` cuenta como respondido |
| 10 | La entrada 3 — la clasificación | 7 | Blockquote de ejemplo con la cita · 2 tandas multiSelect 4+3 = 2 interrupciones · la advertencia una sola vez |
| 11 | La entrada 4 — la lista de roles | 6 | Extraer de `02:24` a lista estructurada · confirmar en UNA línea · N = largo · lista vacía o genérica NO apaga el asimétrico |
| 12 | Instanciar el dossier | 6 | De `plantillas/1..4-*.md`, nunca de `_fuente/` · los 61 `{{LINEAS:N}}` → marcador de estado · el TABLERO sale de su plantilla, esquema cerrado, no inventes campos |
| 13 | Los 5 baldes | 11 | Los 5 con su regla · el default de todo lo dictado es `DE MEMORIA` · el acto de carga: sólo `notas/<persona>.md` produce `RELEVADA` · el contador se re-deriva de los sellos en cada apertura y antes de cada PDF |
| 14 | Los topes | 12 | Tabla de 6 filas · prioridad cuando aprieta (críticos > contradicciones > revisor > lentes) · lo que no entra va al TABLERO y al doc 4 bajo "Lo que no preguntamos" |
| 15 | **El ritual de cierre de etapa** | 11 | Escrito UNA vez: volcá → revisor (≤3, cobra primero) → lentes (≤2) → re-derivá el contador → gates → PDF → sellá. **Incluye la única regla de orden que no puede vivir en anexo: el revisor corre SIEMPRE antes de las lentes, porque el revisor apaga lentes** |
| 16 | Las 4 etapas + E3.5 | 30 | Sólo lo que cambia entre etapas. E1 5 (campos, clasificación, cierran L2/L3) · E2 7 (`02:18/24/30`, anotar L5b y L6 para E3, cierran L4/L5a/L8/L9) · E3 8 (`03:15/21/24`, **GATE 1**, sellar `chequeo: PENDIENTE`, cierran L1/L5b/L6/L7) · E3.5 1 (puntero) · E4 6 (lentes=0, `04:18` sólo-lectura, `[fp]`, el dossier) · header y blancos 3 |
| 17 | Las lentes: gobierno | 6 | REGLA MADRE (sin cita no dispara) · REGLA DE REPARTO (si la planilla lo pide es del revisor) · dónde aterrizan: anexo separable en 1/2/3, `[fp]` en el 4 · puntero a `lentes.md` |
| 18 | Los 3 gates + la cinta | 11 | Gate 1 E3 sin prueba barata · gate 2 PDF CERRADA · gate 3 simetrizado (ni "no construir" ni "sí construir" con nadie más que Guido) · las 3 razones de la cinta a/b/c · `SUPUESTO` cuenta como respondido |
| 19 | El PDF | 7 | Se emite al cerrar cada etapa (ver `entregable.md`) · **si Chrome falla la etapa CIERRA IGUAL**, el TABLERO anota `PDF pendiente` · nombres estables, regenerar pisa, `PDF VIEJO` si el `.md` cambió |
| 20 | La costura con el Arquitecto (E3.5) | 16 | La regla binaria con sus 3 tramos de apetito · el HANDOFF por **token explícito** con la línea exacta para pegar · la caducidad por hash (se regenera, no se advierte) · el stub si el Arquitecto no está · el dueño único de `03:21`/`03:24` |
| 21 | El caso "no construir" | 2 | Mismo chip, mismo peso visual, veredicto en positivo. La estructura vive en `entregable.md` |
| 22 | La mudanza | 7 | Brownfield en el momento / greenfield pendiente en el TABLERO · qué se muda (4 `.md` + TABLERO + 5-sirvio) y qué **NO** (`notas/`, `pdf/`) · la línea de reenvío en `INDICE.md` |
| 23 | El tramo 5 | 10 | El flujo (leer `3-necesidad`, re-correr la misma consulta) · las 3 preguntas · "todavía no se usa" → +4 semanas, se apaga a la 3ª · la rama no-construir · el pago como propuesta al repo madre |
| 24 | Frases-gatillo de cualquier momento | 5 | "prendé/apagá las lentes" · "cancelá" · "tachá esto" · "volví de hablar con X" · edita un `.md` a mano |
| 25 | Si algo sale mal | 9 | Los 6 casos que no quedaron cubiertos arriba: abandona a mitad (cero recordatorios) · vuelve a los 16 días · el supuesto riesgoso se cae (`apto: NO`, dos columnas, nada se tira) · edita a mano (`[pendiente]` + `notas/cambios.md`) · cambio de carril · la re-oferta del banco |
| 26 | Separadores `---` | 6 | 3 separadores × 2 líneas, entre los tres tramos grandes (entrada / etapas / cierre-costura) |
| | **TOTAL** | **251** | **Margen: 9 líneas** |

---

## Los anexos

### `anexos/revision.md` — 58 líneas
> Puntero en el motor (dentro del ritual, paso 3): *"Corré el revisor — los 6 chequeos, sus prioridades y el contrato de repregunta están en `anexos/revision.md`. ≤3 por etapa y cobra primero."*

| Bloque | Líneas |
|---|---:|
| Preámbulo: mira hacia adentro, "Parte 1 completa salvo lo que es tarea de campo", su único gate es el PDF | 6 |
| Tabla de los 6 chequeos R1-R6 + la prioridad R1>R2>R3>R5>R4>R6 | 10 |
| Detalle de cada chequeo: qué mira exacto, sus referencias, qué ofrece (R3 sola necesita 4: `01:36`, `01:43`, `03:21` y la excepción de `01:28`) | 22 |
| La trampa de R2: el estimado marca `SUPUESTO`, no `DE MEMORIA`, y L4 sigue viva | 5 |
| El contrato de la repregunta: las 4 salidas siempre, con su consecuencia | 10 |
| Cupo agotado → al TABLERO y al doc 4 · cómo se marca "dejalo así" | 5 |

### `anexos/lentes.md` — 82 líneas
> Puntero en el motor (bloque 17): *"El catálogo de las 9, sus gatillos, el mensaje de encuadre y el contrato de 4 slots están en `anexos/lentes.md`."*

| Bloque | Líneas |
|---|---:|
| Preámbulo + REGLA MADRE desarrollada + REGLA DE REPARTO | 10 |
| Tabla de las 9 lentes (10 filas con L5a/L5b): gatillo · **NO dispara si** · header · etapa | 13 |
| **El detalle de cada lente: el texto de la pregunta y sus 2 respuestas probables** (10 × 3) | 30 |
| El reloj de L5b/L6 (se anotan en E2, se preguntan al cierre de E3) + el rango global de desempate | 6 |
| Los 4 slots con sus 2 fijos + los cupos + estado por lente (bajada no vuelve, no disparada se re-evalúa) | 9 |
| El mensaje de encuadre ASCII "FUERA DE PLANILLA" (bloque de código) | 12 |
| Cómo se arma el anexo separable y los `[fp]` | 2 |

### `anexos/entregable.md` — 130 líneas
> Puntero en el motor (bloques 3, 19 y 21): *"El pipeline del PDF, el CSS, la cabecera de procedencia, la aritmética de los baldes, la regla de redacción y el formato del caso 'no construir' viven en `anexos/entregable.md`."*

| Bloque | Líneas |
|---|---:|
| Preámbulo + la tabla "momento → sale" (5 filas) | 12 |
| El pipeline bash + los 3 hechos verificados que mandan | 20 |
| Detección de Chrome (`where chrome` primero) + plan B con su frase literal + poll de 45 s + limpieza del temp | 18 |
| El CSS autocontenido: los 5 badges legibles sin color, `print-color-adjust: exact`, `page-break-inside: avoid`, la prueba de la fotocopiadora | 30 |
| La cabecera de procedencia (bloque de 12) + la fila "Roles que intervienen" + la variante `caracter: personal` | 20 |
| Aritmética fina: números derivados heredan la marca más débil, el denominador, con su ejemplo (E1 sin casillas = 5, con dos = 7) | 8 |
| La regla de redacción: los juicios van por ROL, con su ejemplo contrastado | 6 |
| Chips CERRADA/BORRADOR y la cinta con su motivo impreso | 4 |
| La estructura del documento "no construir" (las 6 secciones + la caja del veredicto) | 12 |

### `anexos/brownfield.md` — 52 líneas
> Puntero en el motor (bloque 7): *"Si el carril es brownfield, todo lo que cambia está en `anexos/brownfield.md`."*

| Bloque | Líneas |
|---|---:|
| Preámbulo: qué cambia y qué no en esta rama | 5 |
| La señal dura completa: recorrido de ancestros, la confirmación en una línea, el dossier igual nace en `_relevamientos/` | 8 |
| `02:18` como lista cerrada: `Glob` de `<proyectos>/*/.git`, las 3 más recientes + "Otra cosa", el fallback a texto libre | 8 |
| Las 3 etapas en brownfield: E1 intacta, las 7 casillas se re-tildan, E2 achicada en lo técnico y agrandada en lo humano + "¿qué hacen hoy por afuera del sistema para tapar esto?" | 12 |
| El atajo `docs-fyd/`: cuándo se lee, la jerarquía de `deteccion.md:41-47`, cómo se cita. El balde `DEL CÓDIGO` con su fecha | 9 |
| Lo que v1 NO hace (el censo automático) — escrito para que ningún chat futuro lo "complete" | 4 |
| La mudanza en brownfield + el aviso al proyecto viejo sin paso 6-bis, con la línea para pegar | 6 |

### Plantillas (no cuentan contra el techo de líneas, sí contra el de KB)

| Archivo | Líneas | Por qué NO está en el motor |
|---|---:|---|
| `HANDOFF.md` | 45 | El SPEC §11 lo escribe verbatim: 38-40 líneas. **Es el ahorro más grande del presupuesto** — en el motor se comía el 16 % del techo para algo que se escribe una vez por relevamiento. Es un molde que se instancia, no una instrucción que se lee |
| `TABLERO.md` | 28 | Esquema YAML de 10 claves + las 7 secciones. Se copia a disco en el paso 2 del ruteo: en cada corrida el archivo real ya está abierto. En el motor quedan 2 líneas de puntero + los 5 campos que rutean |
| `1..4-*.md` | ~303 | Los 4 de trabajo: 277 líneas medidas de `_fuente/` + las 7 celdas `[+fork]` + 4 cabeceras de procedencia. **Las 7 preguntas faltantes viven acá, no en el `SKILL.md`: son texto de planilla, no instrucción** |
| `_fuente/01..04-*.md` | **277 (medidas)** | Los 4 originales del jefe, prístinos. 8.097 bytes exactos. Excluidos del techo por decisión del SPEC. **Primer paso del build: extraerlos del `.rar` y commitearlos** |
| `5-sirvio.md` | 30 | La estructura del documento del tramo 5 |
| `hoja-de-campo.md` | 22 | Con quién hablar, qué preguntar, qué escuchar |
| `FORK.md` | 30 | Las 7 celdas con su ubicación exacta (criterio 18) |
| `SYNC.md` | 12 | El ritual de 10 líneas. Manual, no de corrida |
| `INDICE.md` | 8 | Una línea por relevamiento + la línea de reenvío |
| `LEEME.md` | 10 | Los `{{LINEAS:N}}` no son placeholders del kit y no se tocan |

---

## Las tres estimaciones y dónde discreparon

| | Bottom-up | Analogía | Pesimista | **Decidido** |
|---|---:|---:|---:|---:|
| **Motor** | 247 | 251 | 289 | **251** |
| `revision.md` | 60 | 58 | 47 | 58 |
| `lentes.md` | 85 | 58 | 59 | **82** |
| `entregable.md` | 125 | 133 | 132 | 130 |
| `brownfield.md` | 52 | 52 | 53 | 52 |
| Techo de 60 KB | "se pasa por 5-7 KB" | "53 KB, entra" | "se pasa por 12 KB" | **~68 KB, se pasa por 8** |

**El dato que más pesa:** bottom-up y analogía usaron anclajes distintos (uno contó markdown bloque por bloque, el otro calibró contra los bloques equivalentes del Arquitecto) y llegaron a **247 y 251**. Dos métodos independientes que convergen en 4 líneas es evidencia fuerte. El pesimista dio 289, pero su propia tabla muestra de dónde sale: **doble contó privacidad** (5 líneas sueltas + adentro de las reglas de oro) y **doble contó el gobierno del revisor** (9 sueltas + adentro del común de las etapas), y no factorizó el ritual de cierre. Descontado eso, queda en ~272. No es una tercera estimación al mismo rigor: es la de bottom-up con relleno.

### Lo firme (los tres coincidieron dentro de ±2)

Frontmatter (4-5) · reglas de oro (15-17) · topes (11-15) · los 3 gates (8-12) · la mudanza (7-8) · el tramo 5 (10-13) · "si algo sale mal" (8-10) · **`brownfield.md` (52-53)** · **`entregable.md` (125-133)**. Estos números se pueden usar sin pensarlos de nuevo.

### Las discrepancias grandes, y qué decidí

**1. Las 4 etapas + el ritual de cierre — A 44 · B 26 · C 38 → decidí 41 (11 + 30).**
B comprimió las 4 etapas a una tabla de 5 filas (9 líneas). No entra: una celda de tabla no puede cargar el **GATE 1 de E3** (no cierra sin la prueba barata) ni la regla de **sólo-lectura de `04:18`**, y los dos son fallas silenciosas. A y C coinciden en 38-44. Lo que sí tomé de B es la factorización: **el ritual se escribe una sola vez y las 4 etapas lo referencian.** Sin esa factorización las etapas pasan de 30 a ~50. *Firmeza: es el bloque de mayor dispersión (26 a 44) y por lejos la mayor apuesta del presupuesto.*

**2. La entrada (pregunta cero + volcado + clasificación + roles) — A 34 · B 36 · C 50 → decidí 35.**
A y B coinciden con anclajes distintos; C infló (11 líneas sólo para la clasificación, 9 para los roles). La clasificación es un blockquote de ejemplo + 3 líneas de mecánica = 7. Los roles son la extracción + la confirmación en una línea + N + la regla de la lista vacía = 6. *Firmeza: alta.*

**3. Las lentes en el motor — A ~2 · B 15 · C 15 → decidí 6.**
Acá apliqué el criterio contra la mayoría. B y C metieron el gobierno entero (topes, 4 slots, modo silencioso, dónde aparecen) en el motor. Pero los topes ya están en la tabla de topes (bloque 14), los 4 slots se leen cuando el anexo ya está abierto, y el modo silencioso es una **frase-gatillo**, que va al bloque 24. Lo único que es ruteo puro: la REGLA MADRE, la de reparto y dónde aterrizan = 6. *Ahorro contra B/C: 9 líneas.*

**4. `lentes.md` — A 85 · B 58 · C 47-59 → decidí 82.**
Discrepancia al revés: acá **A tiene razón contra los otros dos**. A es el único que presupuestó **el texto de cada lente y sus 2 respuestas probables** (30 líneas). La tabla dice *cuándo* dispara pero no *qué pregunta*; sin ese texto la lente no es ejecutable y Claude improvisa la pregunta — y con ella el sesgo, que es lo que el criterio 11 mide. B y C se lo saltearon. *Es el bloque que más creció respecto de la mediana, y por buena razón.*

**5. El árbol de `_relevamientos/` — A ~3 · B 14 · C 17 → decidí 12.**
A lo disolvió en el bloque de punteros. B y C quieren el árbol dibujado. Van B y C: **el criterio 19 (write-set cerrado) y el 15 (la mudanza no lleva basura) dependen de que Claude tenga presente la diferencia entre los 4 `.md` y `notas/`+`pdf/`.** Dibujarlo cuesta 8 líneas y evita el error caro (parir el dossier adentro de un repo de producción). El write-set en cambio va a reglas de oro, no acá.

**6. La tabla "momento → sale" — A motor · B anexo · C anexo → anexo.**
Criterio limpio: se consulta cuando ya decidiste emitir, y en ese instante `entregable.md` se abre igual. Lo que **sí** queda en el motor es "Chrome falla → la etapa CIERRA IGUAL" y `PDF VIEJO`, porque su falla es que Claude frena en silencio (criterio 6). El bloque del PDF baja de 12 (A) a 7.

**7. El techo de 60 KB — A "se pasa por 5-7" · B "entra en 53" · C "se pasa por 12" → medí: ~68 KB, se pasa por ~8.**
Los tres estimaron a ojo. **Fui a medir.** El `.rar` está en la raíz sin trackear y se puede leer con el UnRAR que ya está instalado: las 4 `_fuente/*.md` son **277 líneas / 8.097 bytes = 29,2 B/línea** — son archivos **sparse** (61 placeholders `{{LINEAS:N}}` y mucho blanco). A y C las presupuestaron a ~85 B/línea y les salieron 25 KB de plantillas de trabajo; el número real es **10,3 KB**. Eso baja el total ~14 KB respecto de C. Pero B se pasó para el otro lado con las auxiliares: las plantillas de `docs-fyd` miden 312 líneas / 14.740 bytes = **47,2 B/línea**, no 28. Con las densidades medidas el número honesto es **~68 KB**.

### Lo que queda como apuesta

- **Las 4 etapas en 30 líneas.** Rango de las estimaciones: 13 a 38. Es el bloque que más fácil se desborda al escribirse, y el primero de la escalera de poda por eso.
- **`lentes.md` en 82.** Depende de que el texto de cada lente entre en 3 líneas. Si necesita 4, son +10.
- **El motor en 251 con 9 líneas de margen.** Dos estimaciones convergentes lo respaldan, pero 9 líneas se las come cualquier bloque que crezca 2. Por eso la escalera de abajo está cuantificada de antemano.

---

## Si no entra — el orden de poda

Ninguno de estos cortes toca el ruteo, los gates ni la costura. En orden de rendimiento:

| # | Corte | Ahorro | Riesgo |
|---:|---|---:|---|
| 1 | **Las 4 etapas + E3.5 (30) → 5º anexo `anexos/etapas.md`**, dejando 3 líneas de puntero dentro del ritual | **−27** | MEDIO-BAJO. Precedente exacto: el Arquitecto manda su entrevista entera a `banco-de-preguntas.md` (77 líneas) y la invoca desde el Paso 2 con una línea, y no se la saltea porque el motor la nombra como paso obligatorio. **El ritual se queda en el motor**, así que la costura no se rompe: lo que se muda es el inventario de campos por etapa, que es catálogo. Desvía del SPEC §1 (declara 4 anexos) → una línea en el ADR. El criterio 20 sólo mide `SKILL.md` |
| 2 | **El tramo 5 (10) → `plantillas/5-sirvio.md`**, dejando el disparo + 1 puntero | **−7** | BAJO. El escaneo de `chequeo:` vencido ya vive en la guardia de entrada (bloque 7), que es lo único que rutea. El flujo de las 3 preguntas corre pocas veces y siempre abre el archivo |
| 3 | **La tabla de topes (12) → los cupos de revisor y lentes bajan a sus anexos**, queda la fila de interrupciones + la prioridad | **−6** | BAJO. Quien ejecuta el revisor ya está leyendo `revision.md`; ahí el cupo se repite a propósito |
| 4 | **El árbol de `_relevamientos/` (8) → 2 líneas de prosa** | **−6** | BAJO. Se pierde legibilidad, no comportamiento |
| 5 | **Los 5 baldes (11) → `entregable.md`**, quedan los 5 nombres + la re-derivación del contador | **−5** | MEDIO. El sello se aplica a cada respuesta; si no está presente Claude escribe sin sellar y el criterio 7 no cierra. Dejar los 5 nombres es el mínimo |
| 6 | **La clasificación (7) → el blockquote de ejemplo a `plantillas/`**, queda la mecánica de 2 tandas | **−4** | BAJO |
| 7 | **"Si algo sale mal" de 9 a 5 casos** | **−4** | BAJO. Los 4 que salen ya están cubiertos por su bloque o su anexo |
| 8 | **La lista de roles (6) → 3 líneas**: se queda la extracción + "lista vacía no apaga el asimétrico"; el texto de la confirmación va a `plantillas/TABLERO.md` | **−3** | MEDIO. Es uno de los 4 críticos del red-team |
| | **Total disponible** | **−62** | Piso real del motor: **189 líneas** |

**El disparador para tomar el corte 1, decidido de antemano:** si al llegar al bloque 15 (el ritual) el archivo ya pasó de **200 líneas**, se toma el corte 1 en ese momento, no al final. Los bloques crecen al escribirse; podar lo último que se escribió significa podar el tramo 5 y los tropiezos, que no es lo que sobra.

### El techo de 60 KB — hay que decidirlo antes de escribir

**Mover contenido del motor a un anexo no ahorra un solo byte del conjunto.** La escalera del SPEC §1 tiene tres escalones y para este techo el primero no sirve:

- **Escalón 1 (mover a anexo):** ahorro = **0 KB**. Es la misma cantidad de texto en otro archivo.
- **Escalón 2 (podar, brownfield primero y CSS después):** `brownfield.md` entero (52 líneas ≈ 4,6 KB) + el CSS de 30 a 18 (≈1 KB) + `FORK.md` y `hoja-de-campo.md` al hueso (≈1,5 KB) = **~7 KB**. Alcanza justo, y a costa de borrar la rama brownfield, que es IN por la decisión #2 de Guido.
- **Escalón 3 (subir el techo con la razón escrita en el ADR): es el que recomiendo, y la razón es medible.**

**La razón:** el techo de 260 líneas tiene un mecanismo real detrás — el motor se carga entero en cada invocación, y si es largo Claude se saltea pasos en silencio. **El techo de 60 KB del directorio no tiene ningún mecanismo.** Las plantillas no se leen: **se copian a disco**. Una plantilla de 10 KB cuesta cero contexto. Lo único que puede entrar a una ventana de contexto es **motor + el anexo que se abrió**, y ese número está sano:

| | Motor + anexos | Bytes |
|---|---:|---:|
| `docs-fyd` | 487 líneas | 36,6 KB |
| **`relevamiento` (presupuesto)** | **573 líneas** | **~48 KB** |
| `arquitecto` | 572 líneas | 52,1 KB |

`/relevamiento` cae **entre** las dos skills que ya existen, exactamente donde debería estar. Los 20 KB que rompen el techo son **enteramente plantillas** — la misma clase de archivo que el SPEC ya excluyó cuando dejó `_fuente/` afuera.

**Recomendación:** re-declarar el techo como **"motor + anexos ≤ 55 KB; las plantillas quedan excluidas, con el mismo criterio que `_fuente/` — se copian a disco, no entran a un contexto"**, con la línea en el ADR y el criterio 20 reescrito así. Es la corrección de un número que nunca se derivó de nada, no un permiso para engordar. Si Guido prefiere no tocarlo, el escalón 2 alcanza pero se lleva puesta la rama brownfield entera.

---

## Lo que NO se puede sacar del motor

Estos bloques tienen todos el mismo modo de falla: **no tiran error.** La skill sigue andando y hace lo incorrecto en silencio — que es exactamente el problema que el techo de líneas existe para evitar, y la cicatriz que dejó v2.2.1.

| Bloque | Líneas | Qué pasa si se va a un anexo |
|---|---:|---|
| **El ritual de cierre de etapa** (15) | 11 | Claude cierra una etapa **sin correr el revisor y sin emitir el PDF**. Es LA costura: si no está presente en cada cierre, no hay nada que lo llame. Acá vive además la única regla de orden que no puede estar a demanda — el revisor antes que las lentes, porque el revisor apaga lentes |
| **Los 3 gates + la cinta** (18) | 11 | Sale **CERRADA** algo que tenía que salir BORRADOR. El único freno de calidad de toda la skill, y su falla no se ve hasta que el documento está en la reunión |
| **La costura E3.5 + el token explícito** (20) | 16 | El Arquitecto **nunca se entera del handoff**, o peor, lo busca por glob — que es el juicio semántico que el red-team mató. Los criterios 1 y 3 dependen de que la línea para pegar sea exacta |
| **La guardia de entrada** (7) | 13 | Se saltea el escaneo del tramo 5, no detecta 2+ relevamientos abiertos, no ve la señal dura del brownfield. Es literalmente "por dónde seguir": se ejecuta **antes** de que haya motivo para abrir ningún anexo |
| **El volcado + la degradación** (9) | 14 | **La skill se vuelve el formulario que vino a reemplazar.** Es el supuesto [ALTO] del SPEC y la apuesta central del diseño; sin el auto-supuesto, el fast-path y los 5 campos críticos, el diseño pierde su ventaja sobre el Word |
| **Las reglas de oro** (5) | 15 | Se aplican en **cada volcado**. Ninguna es consultable a demanda: si "persistir antes de la siguiente pregunta" no está presente, la charla muere y se pierde todo |
| **La pregunta cero** (8) | 8 | El criterio 2 (salida en 1 clic **antes** de crear nada) no se puede cumplir desde un anexo: la pregunta sale antes de que exista un motivo para abrir uno. Es texto literal — no se parafrasea |
| **Los topes** (14) | 12 | Gobierna cada `AskUserQuestion`. El red-team contó **56 interrupciones reales contra 20 declaradas** justamente por no tener la tabla a la vista |
| **"Chrome falla → la etapa CIERRA IGUAL"** (19, 2 de las 7) | 2 | Claude **frena**. Criterio 6. Dos líneas que valen una corrida entera |
| **Las frases-gatillo** (24) | 5 | "prendé las lentes", "cancelá", "tachá esto" llegan **en cualquier turno**. Si viven en un anexo, la skill no las reconoce — porque no tiene ningún motivo para abrir ese anexo en ese momento |
| **El límite honesto** (6) | 6 | El SPEC §6 lo exige literal *"escrito en el `SKILL.md`"*. Es una declaración de la pieza sobre sí misma: si no se lee siempre, la skill promete de más |
| | **99 líneas** | **El 39 % del motor. Esto es el hueso.** |

---

## Antes de escribir la primera línea

1. **Extraer `plantillas/_fuente/01..04-*.md` del `.rar` y commitearlas.** Ya están medidas: **277 líneas / 8.097 bytes / 61 placeholders `{{LINEAS:N}}`**, y las referencias de celda del SPEC (`01:28`, `01:36`, `03:15`, `03:21`, `03:24`) verifican contra el archivo real. El `.rar` se borra recién cuando `_fuente/` esté en git.
2. **Decidir el techo de KB** (§ arriba). Es el único número del SPEC que este presupuesto no puede cumplir tal como está escrito, y decidirlo al final significa podar el brownfield con el trabajo ya hecho.
3. **Escribir contra la tabla del motor**, en orden, midiendo con `wc -l` cada 5 bloques. Si al llegar al bloque 15 pasó de 200 → corte 1.

**Archivos de referencia usados** (todos absolutos):
- `c:/Users/Usuario/Desktop/Proyectos/Guia de vibe coding/docs/SPEC-relevamiento.md` (664 líneas, leído entero)
- `c:/Users/Usuario/Desktop/Proyectos/Guia de vibe coding/kit/skills/arquitecto/SKILL.md` — 184 líneas / 19.093 B
- `c:/Users/Usuario/Desktop/Proyectos/Guia de vibe coding/kit/skills/docs-fyd/SKILL.md` — 281 líneas / 21.574 B
- `c:/Users/Usuario/Desktop/Proyectos/Guia de vibe coding/proceso-arranque-proyectos.rar` — las 4 `_fuente/*.md` medidas con `UnRAR.exe` (`C:/Program Files/WinRAR/UnRAR.exe`), extraídas al scratchpad