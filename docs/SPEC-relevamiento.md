# SPEC: `/relevamiento` — el tramo de ANTES del Arquitecto — vibe-kit

Una skill global nueva, `/relevamiento`, que convierte una charla dictada y desordenada en los 4 documentos del método "Cómo Arrancar un Proyecto" (el que Guido diseñó con su jefe), con **un PDF al cerrar cada etapa**, agregando dos cosas que el papel no puede: un **revisor** que cobra las deudas de la planilla y unas **lentes** que traen los ángulos que la planilla no contempla. Termina decidiendo, con evidencia escrita, si el pedido **termina en software o no** — y solo si termina en software le pasa el problema entendido al Arquitecto.

- Estado: **✅ IMPLEMENTADO 2026-08-03** — la skill vive en `kit/skills/relevamiento/` (v2.4.2).
  *Se conserva acá, no se archiva: los 21 criterios son la checklist del estreno y §Fase 2 es el diseño
  conservado que REJ-014 referencia.*
- Fecha: 2026-07-31 · aprobado por Guido 2026-08-03
- Diseño previo: 3 workflows (análisis 11 agentes · diseño 8 · cierre 7), informe holístico aprobado por Guido el 2026-07-31.
- **Endurecido tras 1 ronda de red-team (6 lentes / 93 hallazgos crudos → 79 verificados: 4 críticos, 24 graves, 34 medios, 17 menores). Todos los críticos y graves foldeados. Ver "Qué cambió tras el red-team".**

---

## Por qué (el dolor)

Guido tiene un método de arranque de proyectos de 4 etapas, en papel y Word, **que diseñó con su jefe** en FyD. El método es bueno: corto, con "clasificá y completá" (mínimo indispensable + bloques extra según 7 casillas), y termina en una Propuesta de Valor antes de construir. Pero **la parte previa de recopilación de información no viene funcionando** — palabras de Guido.

Las razones concretas, todas verificadas:

1. **La charla se evapora.** Las plantillas se llenan si alguien se sienta a llenarlas. Guido dicta por voz, desordenado, corrigiéndose, volviendo del pasillo con notas en el celular. Entre la charla y la planilla hay un trabajo de secretario que nunca se hace.
2. **No hay cierre oficial de etapa.** Un `.md` a medio llenar no se lleva a una reunión.
3. **El "no construir" no tiene forma.** La Etapa 4 pide 2 alternativas + "seguir igual" (`04-propuesta-de-valor.md:22,28`) pero nada obliga a que una sea comprar, usar lo que ya está, o cambiar el proceso. En la práctica A y B terminan siendo dos formas de construir lo mismo.
4. **La grilla del método está incompleta**: 21 celdas de 28, contadas a mano (ver AGREGA §7). Siete combinaciones casilla × etapa no tienen pregunta.
5. **El supuesto que hunde el proyecto entra al SPEC-0 sin probarse.** El Arquitecto tiene una sección `## Supuestos` con impacto ALTO/BAJO (`formato-spec.md:46-49`), pero nada dice "probalo antes". La diferencia entre *"se asume que los datos están al día"* y *"PROBADO FALSO (138 remitos, 28/08): atraso promedio 3,4 días"* es la diferencia entre un proyecto vivo y uno muerto en la semana 3.

Y un agujero de fondo que este SPEC cierra: **el método crea una obligación que nadie cobra.** Se escribe un criterio de éxito observable "a las 4-6 semanas de uso" y nunca vuelve nadie a mirarlo. El sistema entero existe para acertarle a la necesidad real y no tiene forma de enterarse si le acertó.

> **Lo que este SPEC NO reclama** (corregido tras el red-team): el Arquitecto **no** hace 12-14 preguntas de descubrimiento. Hace **hasta 5** (O1-O5, `banco-de-preguntas.md:18-22`), y el propio banco dice *"no hace falta hacer las 5 si el dolor ya quedó clarísimo"* (`:16`). El ahorro de preguntas es real pero chico: **5 en el mejor caso.** El valor de la costura no está en el ahorro — está en **la calidad de lo que llega**: un problema relevado con gente en vez de recordado, un techo de esfuerzo, un supuesto ya probado, y una lista de lo ya descartado.

---

## Alcance (IN / OUT)

**IN — lo que este SPEC construye:**

- La skill `kit/skills/relevamiento/`: motor + 4 anexos + plantillas.
- Las 4 planillas del método, en **dos capas**: los originales prístinos (`plantillas/_fuente/`, nunca se editan) y los de trabajo con las **7 celdas faltantes**, más su ritual de sincronización.
- El **modo volcado** (dictás de corrido, la skill ordena) como camino por default, **con degradación**.
- El **revisor** (6 chequeos) y las **lentes** (9, con gatillo por cita y condición negativa).
- La **hoja de campo** (con quién hablar, qué preguntar, qué escuchar).
- El **PDF por etapa** vía Chrome headless, con los 5 baldes de fuente y la cabecera de procedencia.
- El **abanico de 6 familias de salida** y la **regla binaria** de cuándo entra el Arquitecto.
- La **rama brownfield** (pedido sobre app que ya existe) — **sin el censo automático del código**.
- El **tramo 5 automático** (`relevamiento sirvió`), con **dos disparadores** para que funcione en las dos ramas.
- Los enganches al ecosistema (ver MODIFICA).

**OUT — diferido con razón escrita (ver "Fase 2"):**

- El **censo automático del código** en brownfield.
- Word / `.docx` como entregable.
- Los **3 ganchos de costura en el Modo B** del Arquitecto (la mudanza sí se resuelve, ver decisión #8).
- Un modo para listar y podar relevamientos viejos.
- Que la skill aprenda entre relevamientos qué lentes se bajaron.
- El circuito adaptativo de fatiga.

---

## Contexto del kit (nombres REALES, verificados 2026-07-31)

- **`kit/skills/arquitecto/SKILL.md`** — 3 modos. **Ojo con la estructura, que costó un hallazgo crítico:** `:46` abre `## Flujo del Modo A` y **todo lo que sigue hasta `:119` es Modo A** — incluidos el Paso 0 (`:48-50`), el Paso 2 (`:57-63`), el Paso 5 = montaje (`:81-103`, con el **primer commit en `:102`**) y el Paso 6 = handoff (`:105-117`). El **Modo B** vive aparte, en `:121-157`, con su propio B0 (`:125-128`), B2 (`:138-144`) y B4 (`:149-157`, que dice literal *"No montás nada"*). La **carpeta de proyectos** está declarada en **`:20`** y es el único slot por-máquina.
- **`kit/skills/arquitecto/anexos/banco-de-preguntas.md`** — O1-O5 = **5** preguntas de descubrimiento (`:18-22`). S1-S11 = **11** de diseño. R1-R3 = riesgo. Tope: *"3-5 por tanda, 8-12 en total"* (`:11`). **Máx 4 opciones por pregunta, header ≤12 caracteres** (`:7`).
- **`kit/skills/arquitecto/anexos/formato-spec.md`** — SPEC-0 y SPEC delta. **No tiene sección de apetito, de línea base, de criterio de éxito de uso, ni de alternativas evaluadas.**
- **`kit/skills/docs-fyd/`** — el molde: `SKILL.md` (281 líneas / 21,5 KB) + `deteccion.md` + `prompts-fyd.md` + 13 plantillas. Patrones reusados: preguntas **por opciones** (`:85-91`), **gate por evidencia** (`:75-83`), **jerarquía de evidencia** (`:53-61`), **negativo por silencio ≠ ausencia comprobable** (`:55-61`), **Mermaid roto no tira el documento** (`:62-64`), **write-set cerrado + `git status`** (`:22-24`), **caducidad con clave estable** (`:151-166`), **regeneración quirúrgica del ESTADO** (`:245-249`).
- **`kit/skills/arquitecto/templates/universales/skills/cierre/SKILL.md`** — el `/cierre` que se monta en cada proyecto. 12 pasos. **El paso 6 es el precedente del tramo 5**: *"SOLO si existe `docs-fyd/` en la raíz; si no, salteá este paso entero"* (`:24-28`). **Es un TEMPLATE: los proyectos ya montados tienen una copia instanciada y no reciben cambios posteriores.**
- **Diff canónico del repo madre: hoy 4 rutas** — `.claude/skills/cierre/SKILL.md:11,13-14` y `.claude/skills/inicio/SKILL.md:17-18`.
- **El Equipador** (`kit/skills/arquitecto-skills/SKILL.md`) tiene la lista kit-owned **hardcodeada en 6 lugares**: `:3`, `:20`, `:43-44`, `:55`, `:63`, `:73`.
- **Verificado en la máquina:** Chrome headless genera PDF (`%PDF-1.4`, 40 KB, CSS y acentos, ~1,2 s). **NO hay** pandoc, LibreOffice, python-docx ni skills docx/pdf. `Desktop\Proyectos` **no es un repo git**.
- **El paquete del método** (`proceso-arranque-proyectos.rar`, en la raíz del repo, sin trackear): 4 plantillas en `plantillas/_fuente/*.md`, **sin número de versión**, fechadas 2026-07-22, con **61 placeholders `{{LINEAS:N}}`**.

---

## AGREGA (lo nuevo)

### 1. La skill

```
kit/skills/relevamiento/
├─ SKILL.md                  el motor: guardia de entrada, ruteo, las 4 etapas,
│                            los gates, la costura, el tramo 5           (≤260 líneas)
├─ anexos/
│   ├─ revision.md           los 6 chequeos, sus prioridades, el contrato de repregunta
│   ├─ lentes.md             las 9 lentes: gatillo, condición negativa, etapa, rango
│   ├─ entregable.md         el pipeline .md → .html → Chrome → .pdf: CSS, comando,
│   │                        protocolo, los 5 baldes, la cinta, la regla de redacción
│   └─ brownfield.md         la rama "el pedido cae sobre una app que ya existe"
└─ plantillas/
    ├─ _fuente/              LOS 4 ORIGINALES DEL JEFE, PRÍSTINOS. Nunca se editan.
    │   └─ 01..04-*.md
    ├─ FORK.md               celda por celda, qué agrega el kit sobre los originales
    ├─ SYNC.md               el ritual de 10 líneas para actualizar cuando el jefe cambie algo
    ├─ TABLERO.md            el save game (con su esquema declarado, §2)
    ├─ 1-problema.md · 2-sistema-actual.md · 3-necesidad.md · 4-propuesta.md
    ├─ 5-sirvio.md · hoja-de-campo.md · HANDOFF.md · INDICE.md
```

**Techo de tamaño — dos números, y sólo uno de ellos tiene un mecanismo detrás:**

- **`SKILL.md` ≤260 líneas.** *Mecanismo real:* el motor se carga entero en cada invocación; si es largo, Claude se saltea pasos en silencio. Corregido tras el red-team, que midió ~345 contra el techo original de 250.
- **Motor + anexos ≤55 KB.** *Mecanismo real:* es lo único que puede entrar a una ventana de contexto (el motor siempre, más el anexo que se haya abierto).
- **Las plantillas quedan EXCLUIDAS de todo techo** — mismo criterio con el que ya se excluyó `_fuente/`: **se copian a disco, no se leen**. Una plantilla de 10 KB cuesta cero contexto.

> *El techo original decía "el conjunto ≤60 KB", incluyendo las plantillas. El presupuesto lo midió en ~68 KB y encontró por qué el número no servía: **mover contenido del motor a un anexo no ahorra un solo byte del conjunto** — es el mismo texto en otro archivo. Y las plantillas, que son los 20 KB que rompían el techo, nunca entran a un contexto. Se corrigió el número, no se levantó el techo: motor + anexos da **~48 KB**, entre `docs-fyd` (36,6) y el Arquitecto (52,1). Decisión de Guido, 2026-08-03.*

**Las referencias reales del kit, medidas 2026-08-03:**

| Skill | Motor (se carga siempre) | Anexos (a demanda) |
|---|---:|---:|
| `arquitecto` — **3 modos** | **184 líneas** | 388 en 5 archivos |
| `arquitecto-skills` | 112 | 65 |
| `docs-fyd` | 281 | 206 en 2 archivos |

**El modelo a copiar es el Arquitecto, no `docs-fyd`.** El Arquitecto resuelve tres flujos distintos en 184 líneas de motor porque el contenido vive en anexos; `docs-fyd` es el caso invertido (motor pesado, anexo flaco) y por eso es la skill más cara del kit. `/relevamiento` maneja **un solo flujo**: 260 líneas no es un techo apretado, es holgado — **si el contenido va donde va**. La estructura de 4 anexos es la forma de cumplirlo.

**Antes de escribir una línea va el presupuesto por bloque** (`docs/PRESUPUESTO-relevamiento.md`): cuántas líneas se lleva cada sección del motor. Si la suma se pasa, se reacomoda ahí — no escribiendo y podando después.

**Si al escribirlo no entra, en este orden:** (1) mover a anexo lo que no se necesita en cada corrida · (2) podar, empezando por el detalle del brownfield, después el del CSS · (3) **y sólo si el contenido que queda es genuinamente necesario, subir el techo CON la razón escrita en el ADR.** El techo no es sagrado; lo que no se hace es correrlo *antes* de haber intentado las dos primeras.

**Disparadores** (en el `description`): "relevamiento" · "me pidieron algo en el laburo" · "hay un pedido nuevo" · "volví de hablar con X" · "seguimos con el relevamiento de X" · "armá la propuesta de valor" · "relevamiento sirvió".

**NO usar para** — **el primero de la lista, y es el deslinde que faltaba:**
1. **Proyectos personales de Guido, o cualquier cosa que quiera para sí mismo → `/arquitecto`, directo.**
2. La doc de auditoría → `/docs-fyd`. 3. Arrancar la sesión del día → `/inicio`. 4. Diseñar o elegir stack → `/arquitecto`.

### 2. La carpeta de trabajo y el esquema del TABLERO

```
<carpeta de proyectos>/_relevamientos/          ← NO es repo git. Nada acá se versiona.
├─ INDICE.md                                    una línea por relevamiento
└─ <AAAA-MM-slug>/
    ├─ TABLERO.md
    ├─ 1-problema.md · 2-sistema-actual.md · 3-necesidad.md · 4-propuesta.md
    ├─ 5-sirvio.md · HANDOFF.md
    ├─ notas/              CRUDO: dictados sin editar, lo que trajo de campo, cambios.md
    └─ pdf/                LOS ENTREGABLES. Nunca entran a git. Nunca se mudan.
```

- **La ruta base** sale de `arquitecto/SKILL.md:20`. **No se declara dos veces.** Si no se puede leer, **se pregunta UNA vez** con `AskUserQuestion` (opciones: la ruta del cwd · "elegí vos") y se guarda en el TABLERO. **Nunca se cae en silencio al cwd** — eso podía parir `_relevamientos/` adentro de un repo de producción.
- **Se crea en la primera frase, después de la pregunta cero (§3), antes de cualquier otra pregunta.**
- **Cada tanda se vuelca al `.md` ANTES de la siguiente pregunta.** Regla de oro de la skill.
- **El slug**: `AAAA-MM-<3-4-palabras-con-guiones>`, sin acentos, ≤40 caracteres. **Lo propone la skill y lo dice en una línea — no lo pregunta.** No se renombra nunca; lo que cambia es el **título**.

**El esquema del TABLERO — contrato cerrado** (lo leen cuatro consumidores distintos: la propia skill al retomar, el Arquitecto, el `/cierre` del proyecto y el tramo 5):

```yaml
titulo:      <texto libre, se puede cambiar>
slug:        <AAAA-MM-...>            # nunca se renombra
ruta_base:   <ruta absoluta>
caracter:    laboral | personal        # default laboral. "personal" apaga el asimétrico
carril:      greenfield | brownfield
proyecto:    <ruta del repo | ->       # lo escribe la mudanza
etapa:       E1 | E2 | E3 | E3.5 | E4
e3_cerrada:  <fecha | no>
apto:        SI | NO — <razón>         # NO cuando el supuesto riesgoso se cayó sin resolver
chequeo:     PENDIENTE | <fecha> | -   # el tramo 5
```

Más las secciones: `## Roles` (la lista estructurada, §4) · `## Casillas` · `## Lentes` (estado por lente) · `## Hoja de campo` · `## Tareas de Guido` · `## Descartados` · `## Bitácora`.

### 3. La entrada: pregunta cero, después volcado, después clasificación

**El red-team encontró que la salida en un clic no existía**: las 7 casillas + el escape son 8 opciones contra un tope de 4. Y que §3 y §9 se contradecían sobre qué ve Guido primero. Queda así, y se escribe igual en todos lados:

**Paso 1 — la pregunta cero (2 opciones, antes de crear NADA):**

> **¿Esto te lo pidió alguien, o es algo tuyo?**
> 1. Me lo pidieron / hay gente involucrada **(Recomendado)** → sigue, `caracter: laboral`
> 2. Es mío, no hay nadie más metido → **no se crea nada.** *"Esto no lleva proceso. Decí `/arquitecto` y arrancá."*

Si al invocarla ya dijo *"me pidieron esto en el laburo"*, **esta pregunta no se hace**: cero clics. Y la variante *"es mío pero lo quiero hacer con el método"* → `caracter: personal` (no borra nada; apaga el asimétrico y cambia la fila "Hablé con" por la leyenda de §8).

**Paso 2 — se crea la carpeta** y arranca el volcado:

> *"Contame lo que sepas, de corrido y como te salga. No me hagas de secretario: yo lo ordeno y te repregunto solo lo que quede en el aire. Si esto no era un relevamiento, decime 'cancelá' y borro todo."*

**El escape vive en esa frase: cuesta 0 opciones y funciona en cualquier momento.**

**Paso 3 — la clasificación, DESPUÉS del volcado y PRE-TILDADA por la skill**, mostrando su cita:

> *"Por lo que contaste tildé 'toca plata' (dijiste «las facturas quedan sin cruzar») y 'reemplaza un proceso manual' (dijiste «hoy lo hacen a mano»). Destildá lo que no vaya."*

Va en **2 tandas multiSelect (4 + 3)** para respetar el tope de 4 opciones, y cuenta como **2 interrupciones**. La advertencia *"lo que tildes activa preguntas extra en las 4 etapas; no tildes por las dudas"* va **una sola vez**.

### 4. El modo volcado, con degradación

Guido dicta → la skill parsea, llena campo por campo y **muestra el mapeo** (qué campo con qué, su balde, el contador) → recién ahí pregunta, y **sólo** por: los 5 campos críticos vacíos, contradicciones, el revisor y las lentes.

**Regla dura: una pregunta que repite algo que el volcado ya contestó es un bug.**

**La degradación (lo que faltaba, y sin lo cual la skill se volvía el formulario que vino a reemplazar):**

- **Los 5 campos críticos** —los únicos que se preguntan siempre si faltan— son: `01:28` (qué se pidió y quién), `01:36` (los por qué), `03:15` (la línea base), `03:21` (el criterio de éxito), `03:24` (el apetito).
- **Todo otro hueco de Parte 1 se completa solo como `SUPUESTO` con su antídoto, sin preguntar.**
- **Fast-path explícito:** *"dale con lo que dicté"* → todo lo no crítico va a supuesto de una.
- **Un campo en `SUPUESTO` cuenta como respondido a efectos del gate 2.** (Sin esta línea el gate se trababa solo.)

**La lista de roles — lo que hace computable el asimétrico.** Al volcar `02:24` (*"¿Quiénes intervienen, y cada cuánto pasa esto?"* — texto libre con dos preguntas mezcladas), la skill **extrae los roles a una lista estructurada** en el TABLERO, una línea por rol con estado `pendiente | relevado por <testimonio>`, y **la confirma en UNA línea, no en una pregunta**: *"anoté 3 roles: depósito, administración, compras — si falta alguno decímelo"*. **N = largo de esa lista.**
Y la regla que faltaba: **si la lista queda vacía o con un genérico ("varios", "el equipo"), el asimétrico NO se apaga** — la mitad de roles de `02:24` queda `SIN RESPONDER` y prende la cinta de borrador.

**Los topes — corregidos para que cierren entre sí** (el red-team los encontró aritméticamente incompatibles y contó 56 interrupciones reales contra las 20 declaradas):

| Tope | Número |
|---|---|
| Interrupciones por etapa | **6** (E1 incluye las 2 tandas de clasificación) |
| Interrupciones en todo el relevamiento | **24** = 6 × 4 etapas. *(E3.5 y el ruteo cuentan dentro de E3.)* |
| Revisor por cierre de etapa | ≤3, y **cobra primero** |
| Lentes por cierre de etapa | ≤2 · **no heredan el cupo del revisor** |
| Lentes en todo el relevamiento | ≤6 · en E4 = 0 |
| Opciones por pregunta / `header` | ≤4 / ≤12 caracteres (`banco:7`) |
| Costo de responder o bajar cualquier pregunta | **1 clic** |
| Re-oferta de lo que quedó en banco | **1 sola vez, y consume cupo** |

Prioridad cuando el techo aprieta: campos críticos > contradicciones > revisor > lentes. Lo que no entra va al TABLERO y aparece en el documento 4 bajo **"Lo que no preguntamos"**, con su riesgo en una línea.

### 5. El revisor (`anexos/revision.md`)

Mira **hacia adentro** del documento. Los 6 chequeos, y son los únicos:

| # | Chequeo | Qué mira |
|---|---|---|
| R1 | **Hueco crítico** | uno de los 5 campos críticos vacío y que no es tarea de campo |
| R2 | **Adjetivo donde va número** | `02:24` (frecuencia) y `03:15` (línea base) |
| R3 | **Solución colada** | `01:36`, `01:43` y `03:21` **no pueden nombrar una herramienta ni una pantalla**. Ojo: en `01:28` la solución SÍ va — la planilla lo pide textual (`:29`) |
| R4 | **Cadena de por qué cortada** | `01:36` pide 3 a 5 escalones; con ≤2 se ofrece la causa de fondo por opciones |
| R5 | **Contradicción** | dos respuestas que no pueden ser las dos ciertas. **Se escriben LAS DOS con su fuente.** Nunca elige sola |
| R6 | **Bloque extra tildado y vacío** | la casilla se tildó y su bloque está en blanco |

Prioridad: **R1 > R2 > R3 > R5 > R4 > R6**.

**Cuándo corre:** cuando la Parte 1 está completa **salvo lo que es tarea de campo**, no cuando la etapa cierra. **Siempre ANTES de las lentes**, y la razón es mecánica: **el revisor apaga lentes** (si R2 logra que "muchos" sea "34 por semana", L4 deja de disparar).

> **La trampa de R2, que el red-team encontró:** si R2 ofrece *"le pongo un estimado tuyo"*, **fabrica el número que L4 iba a controlar**. Regla: la opción "estimado" de R2 marca el campo `SUPUESTO`, **no `DE MEMORIA`**, y **L4 sigue disparando** mientras el campo esté en supuesto. Solo un número con fuente apaga L4.

**El contrato de la repregunta — 4 salidas siempre:**
1. La respuesta que la skill propone (Recomendado), redactada del dossier.
2. **"Anotalo como supuesto"** → balde `SUPUESTO`, **con antídoto** (cómo verificarlo barato y cuánto cuesta).
3. **"Hay que preguntárselo a alguien"** → hoja de campo, con la pregunta **reformulada para caminar**.
4. **"Dejalo así"** → se marca `[el revisor lo señaló, Guido lo dejó]` y **no se re-pregunta nunca más**.

**El revisor no bloquea la charla nunca.** Su único gate es el PDF (§9).

### 6. Las lentes (`anexos/lentes.md`)

> **REGLA MADRE: si no puede citar la línea del dossier que la dispara, la lente NO dispara.** Y toda lente **muestra su cita al preguntar**.
> **REGLA DE REPARTO: si la planilla lo pide, es del revisor. Si la planilla no lo pide, es de la lente.**

**La condición negativa es obligatoria en toda lente** — el red-team encontró que tres violaban la regla de reparto:

| # | Lente | Header | Gatillo | **NO dispara si…** | Cierre |
|---|---|---|---|---|---|
| L1 | Reloj | `+ Reloj` | mención de mes/fecha/temporada; o `02:24` responde con un ciclo; o apetito ≥5 días | — | E3 |
| L2 | Intentos previos | `+ Intentos` | marca de antigüedad; o `02:18` nombra un Excel con nombre propio | — | E1 |
| L3 | Política | `+ Politica` | `01:40` o la lista de roles tienen 2+; o el sistema hace **visible** algo que hoy no se ve | **`03:46` tiene contenido** (el bloque "muchos usuarios" ya lo pregunta) | E1 |
| L4 | Números | `+ Numeros` | adjetivo de cantidad sin número | **el revisor ya cobró el número con fuente** (no basta un supuesto) | E2 |
| L5a | Comprar — adentro | `+ Comprar` | `02:18` o `02:30` nombran un sistema comprado | — | E2 |
| L5b | Comprar — afuera | `+ Comprar` | el problema se enuncia sin nada propio de la empresa **Y** apetito ≥5 días | — | E3 |
| L6 | Choque | `+ Choque` | nombra un sistema; o apetito ≥5 días; **o hay otro `_relevamientos/<slug>/` abierto** | **`caracter: personal`** (no lee la carpeta de proyectos personales) | E3 |
| L7 | El día después | `+ Mantiene` | casilla "corre solo" o "terceros"; o `02:21` responde "la cabeza de alguien" | **`03:54` o `04:73` tienen contenido** | E3 |
| L8 | Dos verdades | `+ Cual manda` | 2+ lugares del mismo dato; o "lo pasamos", "lo copiamos" | — | E2 |
| L9 | El caso raro | `+ Caso raro` | proceso de 3+ pasos **sin una palabra de excepción** | **la casilla "reemplaza proceso manual" está tildada** (`02:39` lo cubre) | E2 |

**El reloj de L5b y L6:** se gatean por el apetito, que es de la Etapa 3. Se **anotan en E2 y se preguntan al cierre de E3**.

**Rango global** (desempate): L3 › L5 › L2 › L8 › L4 › L1 › L6 › L7 › L9.

**Cómo se presentan** — un mensaje de encuadre por cierre de etapa, en ASCII:

```
Etapa 2 cerrada — la planilla está completa.

FUERA DE PLANILLA (esto no es del método de tu jefe: es la máquina mirando
este proyecto en particular). Me quedaron 2 preguntas:

  · Comprar     — porque escribiste "lo llevamos en Tango" (P2.2)
  · Cual manda  — porque el dato vive en Tango Y en un Excel (P2.3)

Van de a una. Si alguna es al pedo, elegí "bajala" y no vuelve.
```

Y cada pregunta con **4 slots, 2 fijos en toda lente**: la respuesta probable (Recomendado) · la otra probable · **"No sé — anotala para el campo"** (→ hoja de campo) · **"Bajala"** (→ no vuelve nunca).

**Modo silencioso manual:** *"basta de preguntas de más"* → siguen disparando y anotando, dejan de preguntar. Se reabre con *"prendé las lentes"*.

**Dónde aparecen:** en 1/2/3, **anexo separable al final** — *el anexo se borra entero y lo que queda es la planilla del jefe*. En el 4, fundido pero marcado `[fp]`.

**El límite honesto, escrito en el `SKILL.md`:** no habla con nadie · no sabe lo que no está dicho · no mide nada · la investigación de mercado es un vistazo · **le va a errar a algún gatillo** — la promesa es *"toda pregunta de más muere en un clic y no vuelve"*.

### 7. Las plantillas: dos capas y su ritual de sincronización

**El red-team mató "git es el detector" tal como estaba escrito:** si se copian los originales y se les agregan las 7 celdas encima, no queda ninguna copia prístina, y cuando el jefe cambie algo el diff mezcla lo suyo con lo nuestro. Queda así:

- **`plantillas/_fuente/01..04-*.md`** — los 4 originales, **prístinos, nunca se editan** (~8 KB). Se copian del paquete del jefe y se commitean.
- **`plantillas/1..4-*.md`** — los de trabajo, con las 7 celdas nuevas marcadas **por celda** con `[+fork]`.
- **`plantillas/FORK.md`** — la lista celda por celda de qué agrega el kit sobre el original.
- **`plantillas/SYNC.md`** — el ritual, 10 líneas: *pisar solo `_fuente/` → `git diff _fuente/` muestra exactamente lo del jefe, limpio → re-aplicar el fork con la lista de `FORK.md`*.

**Cabecera de procedencia en cada archivo de trabajo:**

```
<!-- fuente: _fuente/01-*.md · versión del método: 2026-07-22 (el método no está
     versionado — ver Riesgos) · dueño humano: el jefe de Guido.
     Si él cambia una pregunta, GANA ÉL: ver plantillas/SYNC.md -->
```

**Los `{{LINEAS:N}}`.** Las plantillas del jefe traen **61** placeholders con esa sintaxis, que choca de frente con la convención `{{SLOT}}` del kit y con la regla "cero `{{` en los archivos instanciados" (`arquitecto/SKILL.md:94,101`). **Decisión:** al crear el dossier, la skill **reemplaza cada `{{LINEAS:N}}` por el marcador de estado del campo** (`[pendiente]` / el contenido / el sello). En `_fuente/` y en las plantillas de la skill **quedan tal cual** — y va una línea en `plantillas/LEEME.md` diciendo que **no son placeholders del kit y no se tocan**, para que ningún chat futuro los "arregle".

**Las 7 celdas faltantes.** Contadas a mano: `01` tiene los 7 bloques (`:52,56,60,64,68,72,76`) · `02` tiene 5 (`:38,42,46,50,54`) · `03` tiene 5 (`:42,46,50,54,58`) · `04` tiene 4 (`:65,69,73,77`). **21 de 28.**

| Etapa | Casilla | La pregunta |
|---|---|---|
| E2 | Muchos usuarios | ¿Cada rol lo hace igual, o cada uno tiene su propia versión (su planilla, su carpeta, su manera)? ¿Cuántas variantes hay dando vueltas? |
| E2 | Corre solo | Hoy, ¿quién se acuerda de dispararlo y cuándo? ¿Qué pasa cuando esa persona no está? |
| E3 | Reemplaza proceso manual | ¿Cómo vamos a saber que dejaron de hacerlo a mano? (qué se mira a las 4-6 semanas) |
| E3 | Maneja archivos | ¿Qué pasa con los archivos que YA existen: se migran, se dejan, o se arranca de cero? ¿Cuántos son? |
| E4 | Toca plata | ¿Quién revisa y aprueba los números antes de que salgan? Si un número sale mal, ¿cómo se corrige y quién se entera? |
| E4 | Muchos usuarios | ¿Quién arranca primero y quién queda para después? ¿Cuál de ellos ya lo pidió o se lo va a bancar adentro? |
| E4 | Maneja archivos | ¿Dónde van a vivir los archivos y quién los puede ver o borrar? ¿Se siguen guardando también donde están hoy? |

**Los bloques extra tienen quién los pregunte** (el red-team encontró que contaban como SIN RESPONDER sin que nadie los levantara): **entran al volcado como campos normales** y, si quedan vacíos con la casilla tildada, los cobra **R6**.

### 8. Los baldes, la procedencia y la regla de redacción

**Los 5 baldes — sello por RESPUESTA:**

| Balde | Cuándo | Cómo se produce |
|---|---|---|
| `RELEVADA` | una persona lo dijo | **SOLO desde un acto explícito de carga** (abajo) |
| `DE MEMORIA` | Guido, sin verificar | **el default de TODO lo dictado**, incluido *"me lo dijo Marcela"* |
| `DEL CÓDIGO` | derivado de la app, con fecha | brownfield |
| `SUPUESTO` | la skill lo completó sola, o R2 aceptó un estimado | siempre **con antídoto** |
| `SIN RESPONDER` | vacío o derivado al campo | con el motivo y a quién |

> **El acto de carga que faltaba.** El red-team encontró que `RELEVADA` no tenía forma de producirse y chocaba con "todo lo dictado es DE MEMORIA". Queda así: el disparador **"volví de hablar con X"** escribe `notas/<persona>.md` (nombre · rol · fecha · medio: charla/teléfono/mail · qué dijo · qué campos respalda), y **ese archivo es la única fuente de `RELEVADA`**. Todo lo parseado del volcado normal queda `DE MEMORIA (dice que se lo dijo X)`: se imprime así, **no cuenta como relevada y no levanta ningún gate**.

**La regla de los números derivados:** un número calculado **hereda la marca más débil de sus factores** y propaga los rangos. `"~30 h/mes 🔷 (120 relevados × ~15 min estimados)"`. **Nunca `RELEVADA`.**

**El contador se RE-DERIVA de los sellos** de los 4 `.md` en cada apertura y **antes de cada emisión de PDF**. Lo que queda en el TABLERO es **la última foto con su fecha, y nunca gana sobre los sellos**. El `INDICE.md` no lleva contadores.

**Denominador:** los campos de Parte 1 de la etapa **+** los bloques de las casillas tildadas. Los no tildados no entran (no son "sin responder": no aplican). *E1 sin casillas = 5 (`01:28,32,36,40,43`); con dos tildadas = 7.*

**Los nombres van a todos lados** (decisión de Guido, 2026-07-31): a los `.md`, al TABLERO, a los PDF y al proyecto cuando se muda. **Consecuencia asumida:** el historial de un repo no se borra. Lo que **no** va nunca: sueldos, legajos, datos de salud, evaluaciones de desempeño o sanciones. Si aparecen en el dictado, la skill **persiste el resto**, deja el fragmento fuera con un marcador `[dato sensible no guardado]` y pregunta **una vez** si va como rol. *(No frena sin guardar: eso rompería la regla de persistir antes de la siguiente pregunta.)*

> **La regla de redacción (hallazgo aparte, que la decisión de los nombres no cubre):** **toda afirmación que prediga o evalúe la conducta de una persona se escribe POR ROL y COMO RIESGO, nunca por nombre y nunca como atributo.** *"El rol que hoy no tiene visibilidad de su tiempo puede resistir"*, no *"a Jorge le va a quedar visible"*. Aplica al anexo "Fuera de planilla" de 1/2/3, a los párrafos `[fp]` del documento 4 y a la hoja de campo. Vive en `anexos/entregable.md`. **Los hechos y las citas textuales siguen llevando nombre; los juicios no.**

**`notas/cambios.md`** registra fecha · archivo · campo. **Nunca "qué decía antes"** — eso convertía el registro en el lugar donde sobrevive lo que se quiso sacar. Y `notas/` es append-only con **una sola excepción**: *"tachá esto"* a pedido explícito de Guido → la línea se reemplaza por `[retirado a pedido, <fecha>]`, sin copia del original.

**La cabecera de procedencia, en los 4 PDF:**

```
Relevado por             <nombre> (<rol>)
Hablé con                <nombre> (<área>, <fechas>) · <nombre> (<área>, <fecha>)
Roles que intervienen    depósito ✓ · administración ✓ · compras — sin hablar
Fechas del relevamiento  <desde> al <hasta>
Etapa cerrada el         <fecha>
Plantillas               método "Cómo Arrancar un Proyecto" (_fuente del 2026-07-22)
                         + 7 celdas del kit (ver FORK.md)
──────────────────────────────────────────────────────────────
N relevadas · N de memoria · N del código · N supuestos · N sin responder
Lo marcado como SUPUESTO no fue dicho por nadie: es una hipótesis de quien
relevó y todavía no se verificó. No debe leerse como un hecho.
```

La fila **"Roles que intervienen"** imprime **la lista con su estado**, no un número — es la que hace visible el asimétrico. Si `caracter: personal`, la fila "Hablé con" **no se imprime** y en su lugar va *"Relevamiento personal: todas las respuestas son del autor, sin verificación externa."*

### 9. Los entregables, el PDF y los gates

| Momento | Sale |
|---|---|
| Cierre de etapa 1, 2, 3 | `pdf/N-*.pdf`, chip **CERRADA** |
| A demanda, etapa a medio llenar | mismo PDF, chip **BORRADOR** + cinta |
| Cierre de etapa 4 | `pdf/4-propuesta.pdf` **+** `pdf/dossier-<slug>.pdf` |
| Derivaciones nuevas | `pdf/hoja-de-campo.pdf` |
| Tramo 5 | `pdf/5-sirvio.pdf` |

**La cinta de BORRADOR prende por 3 razones:** (a) un campo crítico `SIN RESPONDER` · (b) **el asimétrico** (la lista de roles tiene alguno sin testimonio, y `caracter` no es `personal`) · (c) un chequeo R1/R2/R3 sin resolver.

**Los 3 gates — los únicos:**
1. **La E3 no cierra sin la prueba barata del supuesto más riesgoso** (`03:33`).
2. **Ninguna etapa emite PDF CERRADA** con las 3 razones de arriba sin resolver. Sale BORRADOR con el motivo impreso. *(Un campo en `SUPUESTO` cuenta como respondido.)*
3. **Ni la recomendación "no construir" ni el veredicto "sí construir" se emiten CERRADA si `caracter: laboral` y nadie más que Guido habló.** *(Simetrizado tras el red-team: el gate original blindaba la decisión barata y dejaba libre la cara.)*

**El pipeline** (`anexos/entregable.md`):

```bash
# 1. ANTES de Chrome — la ÚNICA defensa determinística
[ -s "$HTML" ] || { echo "no hay HTML que imprimir"; exit 1; }

# 2. Chrome, SIN pipes
"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="$PDF" "$HTML" > "$LOG" 2>&1

# 3. DESPUÉS — POLL ACOTADO hasta 45 s. El exit code NO se mira.
#    Se verifica: existe · header %PDF- · pesa
# 4. LIMPIEZA: borrar $HTML y $LOG del temp (salvo que el paso 3 haya fallado)
```

Tres hechos verificados que mandan: **el exit code no vale nada y el `ls` inmediato tampoco** (un Chromium puede devolver éxito y escribir 20-40 s después — por eso el poll es de **45 s**, no de 10, que era más corto que la latencia que el propio SPEC declaraba) · **Chrome imprime el error como si fuera el documento** (un HTML inexistente da un PDF válido de 23.943 bytes) · **`--no-pdf-header-footer` es obligatorio** o estampa la ruta del disco en cada hoja.

**El `.html` y el `.log` viven en el temp del sistema y se borran** al terminar. **Única excepción:** si Chrome falló, el `.html` se copia a `pdf/` y **no se borra** — es el plan B.

**Chrome se detecta, no se hardcodea:** `where chrome` primero (el único camino que sirve en las dos PCs), después las 3 rutas conocidas. Si no aparece: plan B.

**Si Chrome no está o falla, la etapa CIERRA IGUAL** (precedente `docs-fyd/SKILL.md:62-64`). El TABLERO anota `PDF pendiente` y la skill dice: *"El PDF no salió. Te dejé el documento en `pdf/1-problema.html`: abrilo con doble clic y Ctrl+P → Guardar como PDF. Sale idéntico."*

**CSS autocontenido**, con los dos detalles que ya costaron: `print-color-adjust: exact` (sin eso el badge `SUPUESTO` sale blanco sobre blanco) y `page-break-inside: avoid`. **Ningún estado se distingue sólo por color** — la prueba de la fotocopiadora.

**Nombres estables, la fecha adentro. Regenerar pisa siempre, sin histórico.** Si el `.md` cambia después de emitido, el TABLERO marca **`PDF VIEJO`**.

### 10. El caso "no construir"

**No puede parecer un documento fracasado.** Mismo chip CERRADA, mismo peso visual, misma cabecera. Abre con el veredicto en una caja, **antes que nada y siempre en positivo** — *"No construir X. Hacer Y."*

Después: el problema en 3 líneas · **qué se evaluó** (con "seguir igual" y su costo) · **qué hay que hacer que no es software, con responsable** · qué NO se resuelve · **el supuesto que daría vuelta la recomendación** · **cuándo volver a mirar esto**.

### 11. La costura con el Arquitecto

**La regla binaria**, resuelta en E3.5:

- **La salida NO es "construir software nuevo"** → **la skill sola**, cero saltos.
- **La salida ES "construir software nuevo"** → por apetito: **≥5 días** o toca plata/permisos/datos que ya existen → **el Arquitecto piensa** (se avisa, no se pregunta) · **3-4 días** → ofrece las dos, Arquitecto recomendado · **≤2 días** y nada de lo caro → ofrece las dos, la skill recomendada.

**El handoff es por TOKEN EXPLÍCITO, no por glob.** El red-team encontró que *"solo si el pedido coincide"* era un juicio semántico cuyo modo de falla es el silencio — exactamente la cicatriz v2.2.1. Queda así:

> Al cerrar E3.5 con veredicto software **y `apto: SI`**, `/relevamiento` escribe el HANDOFF e imprime la línea exacta para pegar:
> `arquitecto — usá el handoff de _relevamientos/<slug>/HANDOFF.md`
>
> **El Arquitecto lee un dossier si y sólo si la invocación le nombra la ruta.** Cero glob, cero adivinanza, cero contaminación del camino personal. **La prueba de fuego pasa a ser cierta por construcción.**

**El HANDOFF, con su caducidad** (es 100% derivado y sus fuentes cambian después de escrito): lleva arriba la fecha y el hash corto de los 4 `.md`. Si alguno cambió, **se regenera antes de leerse** — no se advierte, se regenera.

```markdown
# Handoff al Arquitecto — Modo <A greenfield | B sobre <app>>
Relevamiento: <slug> · E1-E3 cerradas <fecha> · apto: SI · Veredicto: software
Derivado de: 1-problema.md <hash> · 2-sistema-actual.md <hash> · 3-necesidad.md <hash>

## 1. El pedido, ya desarmado
Como lo dijeron: <E1-P1 verbatim>       Lo que hay que resolver: <E1-P3, el fondo>
Quién lo sufre: <E1-P4>                 Cada cuánto: <E2-P4>
Lo que necesita lograr: <E1-P5, `01:43`>

## 2. El techo — es RECORTE, no plazo
Apetito: <E3-P4> días. Si el diseño no entra, se recorta el ALCANCE.
Recorte mínimo que ya sirve: <E4-P6>

## 2-bis. Cómo vamos a saber que sirvió
Criterio de éxito: <E3-P3 textual, `03:21`, sin nombrar solución>
Línea base hoy:    <E3-P1, el número, `03:15`>
Se mide así:       <la consulta escrita>
Traducilo a criterios de aceptación del SPEC-0. El texto NO se re-escribe:
es el que se chequea a las 4-6 semanas.

## 3. Ya decidido — NO lo re-propongas
Alternativas evaluadas y descartadas, con su razón y su número: <...>
Supuestos ya probados barato: <E3-P7: qué se probó y qué dio>
El supuesto más riesgoso VIVO: <E3-P6> — si es falso, el diseño se cae.

## 4. Candidatos a NO SE TOCA (de la etapa HUMANA, no del código)
Lo que la gente usa todos los días y no puede dejar de andar: <E2-P1, E2-P4>
Cruzalo con el código y completalo. Es materia prima, no la sección final.

## 5. Lo que el relevamiento NO respondió (tu trabajo)
Efectos colaterales en el código real · ¿toca datos que ya creó el usuario? ·
¿hay migración? · ¿puede romper algo que hoy funciona?
Casillas tildadas PARA ESTE PEDIDO: <lista>

## 6. [SOLO BROWNFIELD] Lo que Guido contó del sistema actual
Fuente: lo que dictó Guido / docs-fyd del <fecha> si existe.
NO es un censo del código: verificalo vos.
```

**Qué saltea el Arquitecto en Modo A:** O1-O5 (`banco:18-22`) — **5 preguntas**. Queda intacta la Etapa 2 (tipo de app, entidades, login, **multi-tenant ⚠️ e i18n ⚠️ SIEMPRE explícitas**, `concerns.md:5`), los concerns y el gate.
**En Modo B:** el Arquitecto lee el HANDOFF porque la invocación lo nombra, pero **B1 y B2 corren completos** — el Modo B no se toca en v1 (ver Fase 2). **Lo que sí funciona en Modo B es el tramo 5**, porque la mudanza la hace la skill (§13).

**Si el Arquitecto no está instalado:** la skill **escribe la propuesta igual** con la sección técnica `[pendiente — la piensa el Arquitecto]` y cierra con *"corré `/arquitecto-skills` para instalarlo"*. Mismo stub que `arquitecto/SKILL.md:100` al revés.

**Dueño único del criterio de éxito y el apetito:** viven en `03:21` y `03:24`. La `04:18` es **transcripción con sello** (*"copiado de 3-necesidad P3/P4 el <fecha>"*), de sólo-lectura para la skill. Si la reunión los ajusta, se edita en `3-necesidad.md` —lo que dispara `PDF VIEJO` en E3— y la `04:18` se regenera.

### 12. La rama brownfield (`anexos/brownfield.md`, sin censo automático en v1)

**La señal dura — una ruta absoluta o `null`, nunca el texto del pedido:**
1. **Dónde se abrió el chat.** Si el cwd (o un ancestro hasta la carpeta de proyectos) tiene `.git/` → brownfield sobre ese repo. Se confirma **en una línea, no en una pregunta**. **La carpeta del dossier igual nace en `_relevamientos/`, nunca adentro del repo.**
2. **La pregunta que la planilla ya tiene, convertida en lista cerrada.** Si el cwd no es un repo, `02:18` se hace con opciones construidas del disco: `Glob` de `<carpeta de proyectos>/*/.git` → las 3 apps tocadas más recientemente + "Otra cosa". Si no hay repos, la lista está vacía y vuelve a ser texto libre.

**Las tres etapas corren todas. E1 no se toca, cero.** Las 7 casillas **se re-tildan para el pedido, no se heredan de la app**. La E2 se achica en lo técnico y se agranda en lo humano, con la pregunta que la planilla no tiene: **"¿qué hacen hoy por afuera del sistema para tapar esto?"**

**El atajo `docs-fyd/`:** si la app la tiene y `ESTADO.md` no está PENDIENTE ni vencido, se lee y se cita, respetando su jerarquía (`docs-fyd/deteccion.md:41-47`: el código gana sobre `docs/`).

### 13. El tramo 5 — `relevamiento sirvió`

**Decisión de Guido: automático.** Con **dos correcciones** del red-team:

**(a) La mudanza la hace la skill, no el Arquitecto** (decisión de Guido, 2026-07-31). Al cerrar la E4 con veredicto software:
- **Brownfield:** el repo destino ya se conoce → `/relevamiento` escribe `<repo>/docs/relevamiento/<slug>/` **en el momento**.
- **Greenfield:** queda pendiente en el TABLERO y se ejecuta cuando el proyecto exista (la skill lo hace en la primera invocación posterior, o el Paso 5 del Arquitecto si ya pasó).

**Qué se muda:** los 4 `.md` + el `TABLERO.md` + `5-sirvio.md`. **`notas/` y `pdf/` NO se mudan** — `notas/` es material crudo de trabajo (dictados sin editar, append-only) y `pdf/` son vistas regenerables que además violarían REJ-010. Se deja la línea de reenvío en `INDICE.md` con las dos rutas.

**(b) La fecha NO se calcula con el apetito.** El apetito es recorte de esfuerzo, no plazo — calcular con él desarma el gate en la primera falsa alarma. Al cerrar E3 se sella `chequeo: PENDIENTE — arranca al primer uso`, y **se convierte en fecha (`+6 semanas`) la primera vez que el proyecto llega a producción**.

**Dos disparadores, para que funcione en las dos ramas:**
1. **El paso 6-bis del `/cierre`** del proyecto (sólo proyectos montados con el template nuevo).
2. **La propia skill**: en **cualquier** invocación de `relevamiento`, antes de arrancar, escanea `_relevamientos/*/TABLERO.md` y si hay un `chequeo:` vencido sin `5-sirvio.md` imprime **una línea**. Mismo contrato: no pregunta, no genera, no frena. **Son 3 líneas del motor y cubre la rama "no construir", que no tiene proyecto ni `/cierre`.**

**El flujo:** lee `3-necesidad.md`, saca la línea base y el criterio **tal cual se escribieron**, vuelve a correr **la misma consulta** escrita en "cómo se mide, y dónde", y hace **3 preguntas**: ¿se cumplió? (Sí / No / A medias / **Todavía no se usa**) · ¿lo están usando? · ¿apareció algo que el relevamiento no vio?

- **"Todavía no se usa"** → NO escribe `5-sirvio.md`, re-sella `chequeo: +4 semanas`, y **a la 3ª vez se apaga** con su razón en el TABLERO. Ni silencio eterno ni recordatorio infinito.
- **Rama "no construir"**: versión corta (*"¿el problema sigue vivo? / ¿se hizo lo que no era software? / ¿cambió algo?"* — "¿lo están usando?" no aplica).

**El pago que justifica el tramo:** si el fallo fue del relevamiento, la skill lo escribe como **propuesta de cambio a las plantillas o a las lentes**, que se lleva al repo madre. **La pieza propone; la sesión madre decide y aplica** (ADR-010).

### 14. La salida rápida y los tropiezos

| Situación | Qué hace | Costo |
|---|---|---|
| **La invocó por error** | La pregunta cero (2 opciones) sale antes de crear nada. Y si ya se creó, la frase *"cancelá"* del mensaje de volcado borra todo | **1 clic** o 1 palabra |
| **Abandona a mitad** | Nada. **Cero recordatorios**, salvo el aviso del tramo 5 si ya hay `chequeo:` vencido | 0 |
| **Vuelve a los 16 días** | Retoma en 3 líneas: dónde quedaron, qué le dejó sin ver, qué lentes quedaron en banco | 0 |
| **Dicta flaco** | Auto-supuesto en todo lo no crítico. Sólo se pregunta por los 5 campos críticos | ≤5 |
| **Trae "un montón"** | R2 lo cobra con sus 4 salidas. Si acepta estimado, va a `SUPUESTO` y L4 sigue viva | 1 clic |
| **Dos versiones contradictorias** | Escribe **las dos con su fuente**. No elige sola | 1 clic |
| **El supuesto riesgoso se cae** | Escribe **qué se cayó y qué sigue en pie**, en dos columnas. **Nada se tira.** Setea `apto: NO — <razón>` y ofrece 3 salidas | 1 clic |
| **Cambio de carril** | La carpeta no se mueve (nunca vivió adentro del repo). Sólo cambia `carril:` | 1 clic |
| **Chrome falla** | La etapa cierra igual, queda el `.html` en `pdf/` | 0 |
| **Edita un `.md` a mano** | La skill escribe **sólo donde dice `[pendiente]`** o en el campo que él nombró. Registra en `notas/cambios.md` (fecha · archivo · campo) | 0 |
| **2+ relevamientos abiertos** | **UNA** `AskUserQuestion` con los títulos + "es uno nuevo". Más de 3 → los 3 más recientes + "ver todos" | 1 clic |
| **Se cansó de las preguntas** | "prendé/apagá las lentes" | 1 frase |

---

## MODIFICA (lo existente que se toca — cada uno con su efecto colateral)

1. **`kit/skills/arquitecto/SKILL.md` — 3 toques, y el más importante cambió de lugar tras el red-team:**
   - **`:3` (description):** cláusula de deslinde — *"si el pedido vino de otra persona y hay que relevar antes de diseñar, eso es `/relevamiento`"*. **Es la única línea incondicional.** *Efecto colateral: se carga siempre y participa del ruteo. Por eso el criterio 1 se mide contra la conversación, no contra el archivo.*
   - **AL FINAL DEL PASO 4, después del `ExitPlanMode` aprobado y ANTES de `:81`** *(no en el Paso 6, que era el error crítico)*: *"si venís de un relevamiento: **NO montes todavía.** Devolvé el plano al HANDOFF, devolvé el control a `/relevamiento` para que escriba la Etapa 4, y frená."* **Y una guarda de una línea al inicio del Paso 5:** *"si venís de un relevamiento, el montaje corre sólo con la propuesta aprobada (`4-propuesta.md` con Parte 2 llena o un OK explícito de Guido)."*
     *Efecto colateral: **sin esto el repo se scaffoldea, se hace `git init` y se commitea (`:102`) antes de que la propuesta llegue a la reunión** — la inversión exacta del principio que el método defiende. El bloque `:107-113` queda intacto porque en esa pasada no se llega.*
   - **`:59` (Paso 2):** *"si la invocación nombró un HANDOFF: leelo (regenerándolo si sus hashes no coinciden), honrá lo que ya está contestado y arrancá en S1."*
   - **NO hay toque en `:50`.** El glob se eliminó: el handoff es por token explícito (§11).
   - **NO hay toque de mudanza en el Paso 5.** La mudanza es un acto de la skill (§13).

2. **`kit/skills/arquitecto/anexos/formato-spec.md:51-56`** — el esqueleto del SPEC-0 suma **las alternativas evaluadas y por qué se descartaron** en `## Riesgos y decisiones ⚠️`. *Efecto colateral: hoy el Arquitecto presenta 2-3 enfoques y **los tira**; sin esto la Etapa 4 no se puede escribir. **Aplica siempre, con o sin relevamiento**, y no rompe specs ya escritos (es una sección que se suma, no un formato que cambia).*

3. **`kit/skills/arquitecto/templates/universales/skills/cierre/SKILL.md`** — paso 6-bis, **gateado igual que el 6**: sólo si existe `docs/relevamiento/*/TABLERO.md` con `chequeo:` vencido y sin `5-sirvio.md`. **Imprime UNA línea, no pregunta, no genera, no frena.** NO corre en `cierre parcial`.
   *Efecto colateral doble: (a) es el único cambio que toca proyectos que nunca invocaron la skill — por eso el gate por existencia de archivo; **(b) los proyectos YA montados tienen una copia instanciada y no lo van a recibir nunca.** Por eso el segundo disparador de §13 vive en la propia skill. Y cuando un proyecto viejo reciba su primer relevamiento, la skill avisa: "este proyecto no tiene el aviso del tramo 5 en su cierre — te dejo la línea para pegarla".*

4. **`kit/skills/arquitecto-skills/SKILL.md` — los 6 lugares** con la lista kit-owned hardcodeada: `:3`, `:20` (reescribir *"hoy solo `docs-fyd`"* → *"entradas kit-owned"*), `:43-44`, `:55`, `:63`, `:73`. *Efecto colateral: si falta uno, la skill no llega a la otra PC con `actualizate`.*

5. **`kit/skills/arquitecto-skills/menu-skills.md`** — fila Tier 1 `relevamiento 🔑 kit-owned` con su cicatriz. Reescribir *"2da excepción… acotada a esta fila"* → *"entradas kit-owned"*. Y anotar en `:65` que `docx`/`pdf` **no están disponibles en esta máquina** (verificado) — la contradicción que hace re-litigar el `.docx` cada vez.

6. **`kit/INSTALAR.md:15`, `:17-21`, `:47`** — copiar-si-está, tolerante. **No** al chequeo duro del paso 1. Y actualizar el párrafo "Qué es este paquete", que hoy describe el kit sin mencionar ni `docs-fyd` ni la skill nueva.

7. **`.claude/skills/cierre/SKILL.md:11,13-14`** y **`.claude/skills/inicio/SKILL.md:17-18`** — el `cp -r` y el `diff -r` pasan de **4 a 5 rutas canónicas**. *Efecto colateral: sin esto el detector de drift no la mira.*

8. **`GUIA-DE-USO.md`** (receta *"📥 Me pidieron algo en el laburo"* + la línea que aclara que el camino de `/arquitecto` **no cambió**) · **`README.md`** (pendientes + estructura + versión) · **`CLAUDE.md`** (fila en el Mapa de documentación) · **`PLAYBOOK-MAESTRO.md §2.3`** "Nota de máquina" (**vencida**: no lista `docs-fyd`).

---

## NO SE TOCA (obligatoria — el seguro de no romper)

- **El camino `/arquitecto` sin relevamiento: idéntico.** Con el handoff por token explícito, **el Arquitecto no puede siquiera enterarse de que existe un dossier salvo que la invocación lo nombre.** El único texto incondicional es la cláusula de deslinde del `description`.
- **Las 11 preguntas de diseño del banco (S1-S11)** y **las dos decisiones irreversibles (multi-tenant ⚠️, i18n ⚠️)**: se preguntan SIEMPRE explícitas.
- **El gate de Plan Mode** (ADR-006) y el bloque de handoff literal de `:107-113`.
- **El Modo B del Arquitecto (`:121-157`): no se toca en v1.** *(Corregido tras el red-team, que encontró que el SPEC prometía cambios de comportamiento en Modo B que ningún MODIFICA implementaba, mientras esta sección los prohibía.)* Lo que sí funciona en brownfield es el tramo 5, porque la mudanza la hace la skill.
- **`kit/skills/docs-fyd/` entera.**
- **Los `docs/` de trabajo de cualquier proyecto**: el relevamiento vive en `docs/relevamiento/`.
- **Las plantillas que el jefe ya repartió**: las 7 celdas van a la copia del kit.
- **REJ-010** (PDFs versionados) intacto: los PDF nunca se mudan.

---

## Criterios de aceptación (verificables — cada uno con su test)

1. **La prueba de fuego, con el caso peligroso.** Existe un dossier con `e3_cerrada` y `apto: SI` sobre un pedido del laburo. Correr `/arquitecto quiero una app para llevar los gastos de casa` **sin nombrar ninguna ruta**: **cero menciones del relevamiento en toda la conversación.** *(Se cuenta en la corrida. Con el token explícito es cierto por construcción.)*
2. **Salida en un clic, medida en clics.** Invocar `relevamiento` para algo personal: la pregunta cero sale **antes** de crear nada, elegir "es mío" **no crea ningún archivo**, y el costo total es **1 clic**. *(Contar clics, no sólo verificar que la carpeta no esté.)*
3. **La costura no repite y no pierde.** Corrida sintética (dossier E1-E3 cerrado → `/arquitecto` con el token): **(a)** cero preguntas del Arquitecto ya contestadas en el dossier; **(b)** las 5 respuestas O1-O5 y el criterio de éxito y la línea base son rastreables a una línea del HANDOFF.
4. **El presupuesto se cumple en la etapa más cara.** Correr E1 completa (que incluye las 2 tandas de clasificación): **≤6 interrupciones**, ninguna con más de 4 opciones ni `header` >12 caracteres. Y la corrida completa E1→E4: **≤24**.
5. **El PDF sale y es correcto.** Existe `pdf/N-*.pdf`, header `%PDF-`, >20 KB, **no contiene la cadena `file:///`**, el badge `SUPUESTO` es legible en escala de grises, y **el temp quedó limpio** (`.html` y `.log` borrados).
6. **El PDF roto no tira el proceso.** Renombrar el ejecutable de Chrome y cerrar una etapa: **cierra igual**, el `.md` está completo, el `.html` quedó en `pdf/`, y el TABLERO dice `PDF pendiente`.
7. **El contador es derivado, no declarado.** Grep de los sellos en los 4 `.md` → el número del TABLERO → el número impreso en el PDF: **los tres coinciden**. Editar un `.md` a mano y re-abrir: **el contador se re-deriva solo**.
8. **El negativo por silencio no se afirma.** Grep de negativos absolutos ("no hay", "no existe", "ninguno") sobre los 4 `.md` de una corrida sintética: **0 hits** donde el dato no fue dicho por una persona.
9. **El revisor apaga la lente sólo con fuente.** Corrida A: Guido dice "un montón" y después da el número con fuente → **L4 no dispara**. Corrida B: acepta el estimado de R2 → el campo queda `SUPUESTO` y **L4 sigue viva**.
10. **Una lente bajada no vuelve.** Bajarla, cerrar el chat, retomar, agregar información: **no reaparece**. Una `no disparada` sí se re-evalúa.
11. **La regla de reparto se cumple.** Corrida con las casillas "reemplaza proceso manual", "muchos usuarios" y "corre solo" tildadas: **cero pares duplicados lente ↔ bloque de planilla** (L3, L7 y L9 no disparan).
12. **El asimétrico es computable y prende.** Corrida donde `02:24` se contesta con la frecuencia y sin los roles: la lista de roles queda vacía → **la mitad de `02:24` queda SIN RESPONDER y la cinta de borrador prende**. Corrida con 3 roles y 1 testimonio: **la cinta prende y la fila "Roles que intervienen" imprime los 3 con su estado.**
13. **El anexo es separable.** Borrar la sección "Fuera de planilla" de `1-problema.md`: lo que queda es la planilla del método (más las celdas `[+fork]`, marcadas), y el documento sigue siendo válido.
14. **El tramo 5 en las dos ramas, sin ensuciar.** **(a)** Proyecto montado **sin** relevamiento → `cierre` **no imprime nada**. **(b)** Con relevamiento y `chequeo:` vencido → **exactamente una línea** y el cierre termina normal. **(c)** Relevamiento con veredicto "no construir" y `chequeo:` vencido → invocar `relevamiento` imprime **una línea**. **(d)** `chequeo: PENDIENTE` (el proyecto no llegó a producción) → **nadie imprime nada**.
15. **La mudanza deja rastro y no lleva basura.** Después de la mudanza: los `.md` y el `TABLERO.md` están en `<repo>/docs/relevamiento/<slug>/`; **`git ls-files` del proyecto no devuelve ninguna ruta con `notas/` ni ningún `.pdf`**; `_relevamientos/<slug>/notas/` y `pdf/` siguen existiendo afuera; y el `INDICE.md` tiene la línea de reenvío con las dos rutas.
16. **Sin datos sensibles de personas ni credenciales.** Grep sobre todo lo trackeado del proyecto de: patrones de credencial (`api_key`, `token=`, `password`) y de dato sensible de personas (`sueldo`, `salario`, `legajo`, `licencia médica`, `apercibimiento`, `sanción`): **0 hits.** *(Los nombres propios SÍ pueden estar: decisión de Guido.)*
17. **Los juicios van por rol.** Grep del anexo "Fuera de planilla" y de los párrafos `[fp]` del documento 4: **ninguna afirmación que prediga la conducta de una persona nombrada.** Los hechos y las citas textuales sí llevan nombre.
18. **La sincronización de plantillas funciona.** Simular un cambio del jefe: pisar un archivo de `_fuente/` → `git diff _fuente/` muestra **sólo el cambio del jefe, limpio** → re-aplicar el fork con `FORK.md` → el archivo de trabajo tiene las dos cosas.
19. **El write-set está cerrado.** Después de una corrida completa: la skill escribió **sólo** en `_relevamientos/**` y (tras la mudanza) en `<repo>/docs/relevamiento/**`. **Si tocó algo fuera, FRENA y lo dice.** Se verifica con `git status` del repo + `ls` de la carpeta de proyectos.
20. **Tamaño.** `wc -l kit/skills/relevamiento/SKILL.md` ≤ **260**; y `SKILL.md` + `anexos/*.md` ≤ **55 KB**. *(Las plantillas no cuentan: se copian a disco, no entran a un contexto. El presupuesto por bloque está en `docs/PRESUPUESTO-relevamiento.md` y es el contrato contra el que se escribe.)*
21. **`diff -r` de las 5 rutas canónicas limpio** + cero `{{` sin resolver en los archivos instanciados **de un dossier** (los `{{LINEAS:N}}` de `_fuente/` y de las plantillas de la skill quedan intactos a propósito).

---

## Las decisiones de Guido (respuesta explícita)

| # | Pregunta | Decisión | Consecuencia |
|---|---|---|---|
| 1 | ¿El chequeo "¿sirvió?" es automático o a mano? | **Automático** | Dos disparadores: el paso 6-bis del `/cierre` y la propia skill |
| 2 | ¿Qué entra en la v1? | **Todo menos el censo automático del código** | El brownfield corre entero; las preguntas técnicas de E2 las contesta Guido |
| 3 | ¿Cómo se detecta un cambio del jefe? | **Git es el detector** | **Corregido tras el red-team:** hace falta `_fuente/` prístino + `FORK.md` + `SYNC.md`. Sin eso el diff mezcla lo suyo con lo nuestro |
| 4 | El nombre | **`relevamiento`** | No colisiona; `arranque` chocaba con `/inicio` y con el Arquitecto |
| 5 | Umbral de "software chico" | **≤2 / 3-4 / ≥5 días** | Default; se recalibra tras 3 corridas reales |
| 6 | Nombres propios en los archivos | **Van a todos lados** (2026-07-31) | Simplifica: se cae toda la maquinaria de identificadores. **Consecuencia asumida: el historial de un repo no se borra.** Sigue prohibido el dato sensible de personas, y los **juicios** van por rol |
| 7 | Las 7 celdas | **Van a la copia del kit** | Se le proponen al jefe aparte |
| 8 | El caso "app que ya existe" | **La mudanza la hace la skill** (2026-07-31) | El tramo 5 funciona en las dos ramas sin tocar el Modo B. Lo que no mejora: la entrevista del Modo B no se acorta |

---

## Supuestos

- **[ALTO]** Se asume que el motor entra en 260 líneas con 4 anexos. *Evidencia a favor: el Arquitecto resuelve 3 modos en 184. Mitigación: el presupuesto por bloque se escribe ANTES de construir. Si no entra: mover a anexo → podar → y recién ahí subir el techo con la razón escrita.*
- **[ALTO]** Se asume que Guido va a invocar la skill sin que nada se lo recuerde. **No hay ningún mecanismo que se lo recuerde, a propósito.** *Condición de reapertura escrita: si a los 2 pedidos reales se olvidó, se agrega la mención condicionada.*
- **[ALTO]** Se asume que dictar de corrido y dejar que la máquina ordene es más cómodo que un formulario. Es la apuesta central. *Mitigación construida: la degradación de §4 (auto-supuesto + fast-path + sólo 5 campos críticos). Sin ella el diseño perdía su ventaja sobre el Word.*
- **[MEDIO]** Se asume que las 9 lentes generan más señal que ruido. *Se mide en el estreno: cuántas se bajaron. Si en 2 relevamientos reales se bajó la misma, se poda a mano con su razón.*
- **[MEDIO]** Se asume que la lista de roles se puede extraer del texto libre de `02:24` con calidad razonable. *Si no: la lista queda vacía, el asimétrico prende igual (por diseño) y Guido la corrige a mano.*
- **[BAJO]** Chrome sigue disponible en las dos PCs. *Plan B idéntico.*
- **[BAJO]** `Desktop\Proyectos` sigue sin ser repo git. *Verificado; si cambiara habría que gitignorear `_relevamientos/`.*

---

## Riesgos y decisiones ⚠️

- ⚠️ **El método del jefe no está versionado.** **Consecuencia:** la procedencia cita la fecha del `_fuente/` (2026-07-22) y el detector real es `git diff _fuente/`. Versionarlo de verdad es una charla de Guido con su jefe.
- ⚠️ **El paso 6-bis toca el `/cierre` universal**, que se lee en cada cierre de cada proyecto para siempre. **Consecuencia:** revertirlo es fácil, pero los proyectos ya montados **nunca lo reciben** (son copias instanciadas) — por eso existe el segundo disparador en la skill.
- ⚠️ **Cero corridas del método de punta a punta.** **Consecuencia:** el estreno va a romper cosas, como pasó con `docs-fyd` (16/16 en verificación y aun así 9 de 10 artefactos corregidos a mano en la primera corrida real). **Acá el ciclo es peor: validar tarda un pedido de trabajo completo, semanas.** Decisión tomada: se construye igual, y **no se declara estable hasta el primer relevamiento real de punta a punta.**
- ⚠️ **Nombres de personas en el historial de git.** Decisión explícita de Guido. **Consecuencia:** un nombre commiteado no se saca sin reescribir la historia. Mitigaciones reales, no declamadas: `notas/` (con las citas crudas) **no se muda nunca**; los datos sensibles de personas se frenan antes de persistir; los juicios se escriben por rol; y **el momento de decidir que un relevamiento no se guarde es antes de la mudanza**, que es un acto explícito de la skill.
- ⚠️ **La skill agrega la 5ª ruta canónica.** Si se olvida uno de los 6 lugares del Equipador, la skill no viaja a la otra PC.
- ⚠️ **Word queda afuera.** No hay con qué generarlo. **Reapertura:** 3 pedidos externos de editar y devolver → se instala pandoc y el `.docx` se **genera**, jamás se edita.

---

## Fase 2 — fuera de v1 (diseño conservado, NO construir)

| # | Diferido | Razón | Se reabre si… |
|---|---|---|---|
| 1 | **El censo automático del código** (agente que lee el repo y pre-llena la E2) | Pieza más cara, y su consumidor —el Modo B— nunca se estrenó (ADR-012) | el Modo B tuvo su primera misión real **y** Guido contestó a mano esas preguntas en 2 relevamientos |
| 2 | **Los 3 ganchos de costura en el Modo B** (que lea el HANDOFF en B0 y acorte B2) | ADR-012: *"B y C esperan su estreno"*. No se pule una interfaz contra un consumidor que nunca corrió. **El tramo 5 ya funciona sin esto** | el Modo B tuvo su primera misión real |
| 3 | **Word / `.docx`** | Ver Riesgos | 3 pedidos externos de editar y devolver |
| 4 | **El circuito adaptativo de fatiga** | Controlador con realimentación para una función usada cero veces | 3 relevamientos donde el modo silencioso manual no alcanzó |
| 5 | **Modo `listar` + poda** | Relevamientos simultáneos hasta hoy: cero | 4+ abiertos a la vez |
| 6 | **Aprendizaje entre relevamientos** | Si una lente se baja 3 veces, se poda **a mano** con su razón | nunca por sí solo: es YAGNI |
| 7 | **`pdf/historico/`** | Los PDF se regeneran de un `.md` que sí está versionado | se pisó un PDF que ya había circulado y dolió |
| 8 | **Mención condicionada del relevamiento en el ruteo del Arquitecto** | Contaminaría el camino personal | 2 pedidos reales donde Guido se olvidó de invocarla |

---

## Qué cambió tras el red-team

Los **4 críticos**, todos foldeados:

1. **El gancho de vuelta estaba después del montaje** → el repo se scaffoldeaba y commiteaba antes de que la propuesta llegara a la reunión. **Movido al final del Paso 4**, con guarda al inicio del Paso 5.
2. **El Modo B no recibía ningún toque** → el tramo 5 estaba estructuralmente muerto en brownfield, y el SPEC prometía cambios que ningún MODIFICA implementaba. **Resuelto sacando la mudanza del Arquitecto y haciéndola un acto de la skill**; el Modo B queda intacto y su costura va a Fase 2.
3. **La salida en un clic no existía** (7 casillas + escape = 8 opciones contra un tope de 4). **Resuelto con la pregunta cero de 2 opciones + el escape en la frase de volcado + la clasificación en 2 tandas, pre-tildada.**
4. **El asimétrico contable no era computable** (N salía de texto libre con dos preguntas mezcladas). **Resuelto extrayendo los roles a una lista estructurada en el TABLERO, confirmada en una línea.**

Los **graves** más estructurales: la mitigación de privacidad se reescribió donde se ejecuta (no en Riesgos) · `RELEVADA` ganó su acto explícito de carga · `git es el detector` ganó `_fuente/` prístino + `FORK.md` + `SYNC.md` · el gate del dossier pasó de juicio semántico a **token explícito** · se definieron el flag `apto`, el esquema del TABLERO y `caracter` · el volcado ganó degradación · el HANDOFF ganó el criterio de éxito, la línea base y su caducidad · L3/L7/L9 ganaron condición negativa · el `chequeo:` dejó de calcularse con el apetito · el contador pasó a re-derivarse de los sellos · el gate 3 se simetrizó · **y se corrigieron los tres números inflados** (5 preguntas y no 12-14 · 24 interrupciones y no 20 · 260 líneas con 4 anexos y no 250 con 2).

**Lo que aguantó el ataque, y por eso no se tocó:** el pipeline del PDF y sus tres hallazgos verificados a mano · los 5 baldes como concepto · la regla de reparto revisor/lentes como principio · el caso "no construir" como entregable de primera clase (cero hallazgos).

---

## El camino hasta READY (cumplido)

1. ~~Red-team~~ **HECHO** (6 lentes · 93 hallazgos crudos · 79 verificados · 4 críticos y 24 graves foldeados).
2. ~~Presupuesto por bloque~~ **HECHO** (`docs/PRESUPUESTO-relevamiento.md` — 3 estimaciones independientes reconciliadas; motor 251/260).
3. ~~Aprobación explícita de Guido~~ **HECHO 2026-08-03.** → `Estado: READY`.

**El prompt para la sesión que construye:** `legacy/PROMPT-construir-relevamiento.md` (archivado: la sesión ya corrió).

## Referencias

- El informe de diseño holístico (con el recorrido día a día): artefacto publicado 2026-07-31.
- El método fuente: `proceso-arranque-proyectos.rar` en la raíz del repo (sin trackear). **Primer paso del build: copiar las 4 `_fuente/*.md` y commitearlas. El `.rar` se borra recién cuando `_fuente/` esté en git.**
