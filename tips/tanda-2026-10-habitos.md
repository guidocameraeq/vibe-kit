# Tanda de hábitos — 2026-10 (qué le pide Guido a mano, una y otra vez)

> **Qué es esto.** El acta de una pasada del observatorio con **una sola pregunta**, distinta a las de
> la tanda anterior (`tips/tanda-2026-10-chats.md`): **¿qué le pide Guido a Claude a mano, una y otra
> vez, en sus chats?** Frases repetidas al abrir, al cerrar, entre sesiones, al delegar y al revisar.
> Mismo formato que las otras tandas: método, costo, veredictos y propuestas con checkbox. Las
> propuestas **no están decididas**: las decide la sesión madre.
>
> **Resultado en una línea:** 19 familias de hábitos en la PC `Usuario`. **12 ya las absorbe el
> método** (sobre todo los diseños C, D y H), **5 en parte**, **1 es nueva** y 1 es propia de un
> proyecto. Salen **5 propuestas nuevas, P58-P62**. Lo más repetido es **abrir pestañas a mano** (~98
> comandos) y **preguntar cómo vamos** (~74 veces): las dos ya tienen diseño (D §7, C).
>
> **⚠️ Alcance.** Todo sale de la PC `Usuario`, que Guido usa para lo **personal y liviano** (Deptos,
> Perseo, Arte, el método mismo). Su PC principal de trabajo es `clientes` (Hermes, los directores
> largos). Acá hay **12 chats de Hermes Desktop** (del 2026-10-22 al 25), y se marcan aparte. **Lo de esta
> tabla no se generaliza al trabajo de Hermes**: para eso está el brief del §6, para correr la misma
> pasada en `clientes`.

## 0. Qué se leyó, cuánto costó y qué límites tiene

**Lo leído.** Todo el historial de la PC `Usuario` (**2026-06-13 a 2026-10-25**), con OK de Guido el
2026-10-25 con el número a la vista. La receta pedía arrancar en el corte anterior (2026-10-13 12:04), pero
eran 12 días y la pregunta es nueva: los chats anteriores al corte nunca se leyeron con esta lente.

| | Chats | Mensajes de Guido | Tamaño |
|---|---:|---:|---:|
| Condensado completo (`condensar.py`, sin `--desde`) | 393 transcripts (68 principales) | — | 9,1 MB (~2,4 M tokens) |
| Recortado (`recortar.py`): mensajes de Guido + 1.ª línea de Claude, sin subagentes ni avisos automáticos | 68 | **613** | 402 KB (~102 mil tokens) |

Se excluyó la sesión de esta pasada (se citaría a sí misma). Proyectos: Deptos (35 chats, de los cuales
~27 son obreros que solo traen los comandos de arranque), Hermes Desktop (12), vibe-kit (7), Perseo (7),
el asistente operativo de Deptos (2), Arte (1) y 4 chats sueltos.

**📅 Corte nuevo de la PC `Usuario`:** **2026-10-25 15:48 UTC** (el último `timestamp` leído). La próxima
pasada de esta PC arranca ahí.

**Cómo.** La receta de `observatorio/investigacion/METODO.md`, con la pregunta cambiada:
1. `condensar.py` a `C:\vibe-research\usuario\`, fuera del repo. 129 enmascarados en el historial
   completo (57 genéricos, 72 por entropía); 0 bloques prohibidos.
2. **Recorte nuevo** (`recortar.py`, agregado en esta pasada): esta pregunta solo necesita lo que
   escribe Guido. Baja la entrada **24 veces** (2,4 M → 102 mil).
3. **gitleaks** sobre condensados y recortados **antes** de que leyera nadie: 1 alerta en el condensado,
   revisada sin imprimir el valor (era un nombre de archivo seguido de un identificador entre comillas,
   dentro de un subagente que el recorte no incluye): **falso positivo**. Recortados: **0**.
4. **5 lectores Sonnet** en paralelo, uno por lote (65 a 99 KB), con `LECTOR-HABITOS.md`. Cada uno dejó
   su archivo fuera del repo. gitleaks sobre los hallazgos: **0**.
5. Síntesis y cruce en el chat principal (Opus) contra el acta anterior (Q3, H-28 a H-38 y P1-P57), el
   `TABLERO.md` (los S-) y los `DISENO-A` a `DISENO-H`.

**Costo real.** Lectores: **~601 mil tokens de subagente** (entre 110 y 129 mil cada uno). El
presupuesto que vio Guido era **~310 mil** (la regla de METODO, contenido × 3): **dio 1,9 veces más**. La
causa: con lotes chicos manda el **piso por lector** (instrucciones, herramientas y una lectura por
archivo: el lote de 32 chats chicos hizo 36 llamadas), no el contenido. Para lotes recortados, **presupuestar
~120 mil por lector**, no × 3 (`recortar.py` ya lo imprime así). Síntesis: **NO MEDIDO** (corrió en este
chat). Condensar y recortar: gratis (scripts, ~20 s).

**Límites**
- **Conteo de lectura, no medición.** Los lectores agruparon por intención, y dos lotes pueden haber
  contado la misma frase en dos familias. Las sumas de la tabla son de los lectores, redondeadas; "~"
  donde hay solape.
- **Solo hay mensajes de Guido + la primera línea de Claude.** Alcanza para ver qué se pide; no para ver
  qué contestó Claude después.
- **Una sola PC, de uso personal y liviano** (ver el aviso de arriba). Los proyectos largos de Hermes no
  están, salvo 12 chats de sus últimos 4 días.
- Lo que Guido pide en claude.ai web, Cowork o el celular no está.

**Cómo se cita.** `L3-4` = hábito 4 del lote 3 (los archivos de hallazgos son privados, en
`C:\vibe-research\usuario\habitos-todo\hallazgos\`). Los proyectos van con el nombre que ya usa el repo;
los que no aparecen en él van genéricos ("suelto").

## 1. La tabla de hábitos (ordenada por frecuencia)

Todas las filas son de la **PC `Usuario`**. **Uso**: P = personal/liviano (Deptos, Perseo, Arte,
sueltos) · M = el método (vibe-kit) · **H = trabajo de Hermes** (los 12 chats de Desktop). Leyenda de
la última columna: ✅ ya lo absorbe · 🟡 en parte · 🆕 nuevo · ⚪ propio de un proyecto.

| # | Hábito | Momento | Veces · chats | Uso | Ejemplo (corto) | ¿Lo absorbe el método? |
|---|---|---|---|---|---|---|
| 1 | **Abrir cada pestaña a mano**: `/rename`, `/model` y `/obrero`, `/tramo` o `/director` | al abrir | **~98 · ~42** | P (Deptos, 84), H (11), M (3) | "[/rename] c10" · "cada vez que abro un obrero le tengo que hacer un rename" | ✅ H-28, P16 → **D §7** (una línea de apertura, el nombre al nacer) y **H §8** (el Arquitecto deja la línea) |
| 2 | **Preguntar cómo vamos**: %, horas que faltan, la tabla por tramo, "¿tengo que decidir algo?", "¿qué falta?" | al volver al chat | **~74 · ~19** | P, M, **H (23 en 2 chats)** | "dame la tabla de los tramos y qué % vamos" · "¿tengo que decidir algo o va todo encaminado?" | ✅ H-29, P15, P38 → **C** (`/estado`, "Te espera" arriba, silencio por defecto, resumen de fin de día). *Agrega:* pasa igual en proyectos sin director (Arte, Perseo); `/estado` por módulo de H §7 lo cubre |
| 3 | **Hacer a mano lo que Claude no puede, y avisar**: "ya probé, revisá los logs", "listo, ya lo lancé", "ya lo destrabé", "¿qué tengo que probar yo?", pegar el resultado de una consulta | al revisar · al delegar | **~35 · ~12** | P (Perseo, Deptos), H (9) | "listo, ya terminé todas las pruebas, podés ir a revisarlas" · "¿qué debería probar del corte 1?" | 🟡 H-63, S-U-9 (simular mensajes), D §7 (pop-ups), F §15 (el arranque verifica Docker). **Falta:** el guion de la prueba a mano y leer el resultado sin pedir permiso → **P60** |
| 4 | **Coordinar obreros y delegar**: cuáles están libres, cuáles archivo, "que trabajen solos mientras no estoy", "no te bloquees", paralelizar | al delegar | **~29 · ~10** | P (Deptos), **H (15)**, sueltos | "¿los otros obreros los puedo archivar todos?" · "mientras esperás respuesta, seguí con otra cosa" | ✅ **D** §4, §7 (apertura de noche), §9, §11 (el obrero se administra el contexto); S-D-8; H-67; P15 |
| 5 | **Luz verde corta**: "dale", "continuá", "vamos con esa", "tomá vos las decisiones" | al decidir | **~26 · ~10** | P | "bueno dale, vamos con esa, y testeemos" · "continuá y tomá todas las decisiones sin preguntarme" | 🟡 S-U-6 (sección Autonomía en el `CLAUDE.md`), **D §13** (desvíos al derecho). *Agrega:* la mitad son compuertas que puso el mismo Guido ("no construyas nada sin mostrarme antes"); no es un olvido de Claude |
| 6 | **Pedir el cierre completo**: "sin cabos sueltos", "documentá", "podá el TODO", "¿ya hiciste el cierre?" | al cerrar | **~26 · ~15** | P, M, H (7) | "dejá el repo prolijo, todos los cabos sueltos atados" · "dale, cierre" | 🟡 H-44, P36, P53, **B §11** (el cierre cruza). **Falta:** que la sesión **proponga** el cierre (H-44 lo vio y nadie lo diseñó) → **P58** |
| 7 | **"¿Verificaste?"**: contra la base, en el sistema real, un agente aparte que intente romperlo, "acordate de borrar las pruebas" | al revisar | **~24 · ~14** | P (6 proyectos) | "¿verificaste que ninguno pisa un pago existente?" · "lanzá un agente aparte a intentar romper tu arreglo" | ✅ H-12, H-16, P5, P24, P25 → **A §7**, **D §10**; borrar las pruebas: H-50, **H §9** |
| 8 | **"Explicámelo en criollo"**, "no entendí", "repetime" | al pedir explicación | **~23 · ~13** | P, **M (5 chats en 4 días)**, H (2) | "contame en criollo cómo quedó el diseño y por qué es buena idea" · "para, no entendí" | ✅ H-31, P30, S-C-5. *Agrega:* en vibe-kit pasa **con la regla escrita en el `CLAUDE.md`**: la prosa sola no frena (P1); la memoria "primero el cuadro conceptual" (2026-10-24) es la respuesta de hoy |
| 9 | **Pedir la opinión honesta**: "¿es buena idea o capricho?", "¿hace falta?", "¿qué riesgo tiene?", "volvé a pensarlo" | al decidir | **~22 · ~12** | P (Perseo, Deptos), M | "¿es una buena decisión de diseño o es solamente por capricho?" · "¿son realmente necesarias?" | 🟡 H-64, la "UNA recomendación" del `CLAUDE.md`, los 11 criterios (solo en los diseños de vibe-kit). **Falta:** que la recomendación diga por qué hace falta y qué pasa si no → **P59** |
| 10 | **Pedir el texto para la otra sesión** (el prompt de la próxima, "dame un texto que le llevo a Mobile") **y pegarlo** después | entre sesiones · al cerrar | **~22 · ~16** | P, M, H (3) | "dame el prompt para la próxima sesión" · "preparame el prompt para la otra" | ✅ P48 → **B §8** (el próximo paso dentro del handoff), **H §8** (una línea), **C §2.1** (sin textos para pegar), **G** (entre proyectos, la mesa por git). *Agrega:* los bloques de reglas que Guido pega al abrir son protocolos re-dictados: H-36, **B §15** |
| 11 | **Reanudar tras un corte**: "continue", "inténtalo de nuevo", "presentate al director", en varias pestañas a la vez | al volver de un corte | **~18 · ~12** | P (Deptos), **H (7: 2 o 3 pestañas en el mismo minuto)**, M | "inténtalo de nuevo" · "presentate al director" | 🟡 H-37 lo vio (~12 "continue") **sin propuesta**; D §7.6 (el nombre al reanudar, NO VERIFICADO) → **P62** |
| 12 | **Elegir el modelo**: subagentes en Sonnet o Haiku, "nunca en Fable", ¿obrero en Opus o Sonnet? | al delegar | **~15 · ~9** | P, M | "si vas a usar subagentes, no pueden ser en Fable" · "¿en Opus o Sonnet ese?" | ✅ P26, P11 → **D §6** (modelo por rol); la memoria "subagentes nunca en Fable" (vibe-kit) |
| 13 | **"Anotalo en algún lado"** (pendientes, la bandeja del dev, el ticket), y "eso ya lo resolví yo" contra un TODO viejo | al cerrar · al pasar | **~13 · ~8** | P (Deptos, Perseo), M | "dale, anotalo en los pendientes y corré un cierre" · "ya fui resolviendo varios" | ✅ **B §7, §10, §11**; P55 (REPORTADO POR EL USUARIO); la nota de H en B §10 (la bandeja). Lo que falta va con **P58** |
| 14 | **Plan, mini spec o muestra antes de ejecutar**; "si algo no cierra, frená y avisá, no improvises" | al decidir · al abrir | **~11 · ~6** | P (Arte, Perseo, suelto) | "armate un mini spec para hacer el fix 2 y 3" · "si algo del spec no está escrito, preguntame" | ✅ H-36, P57 → **H §5** (tamaño del pedido), **H §13** (prototipo) |
| 15 | **Credenciales y autorizaciones**: "poné vos las credenciales", "autorizo aplicar la 00NN" (en el director y en el obrero) | al delegar · al decidir | **~11 · ~6** | P (Deptos) | "autorizo aplicar la 0049 y el ajuste" | ✅ H-34 → **F §8** (usar sin ver); **D §7** (AUTORIZADO y las 5 de A con clic) |
| 16 | **"¿Cómo lo resuelve otro?"**: mirar otro repo o buscar en internet antes de decidir | al decidir | **~9 · 7** | M (5), P (Perseo, 4) | "buscar alguna referencia de algún otro repo, a ver qué ideas robar" | 🆕 Se hizo **a pedido** (H §18, REFERENCIAS-EXTERNAS) pero no es un paso del método → **P61** |
| 17 | **Pasar el diseño por el filtro** de criterios antes de aplicarlo | al revisar | 4 · 3 | M | "antes de aplicar, pasalo por nuestro criterio de diseño" | ✅ La sección fija "Los 11 criterios, aplicados" de los diseños B a H |
| 18 | **`git pull` / actualizar al abrir** | al abrir | 3 · 3 | P, M | "hacé un git pull" | ✅ P37, P13 → **G §11** (`fetch` y aviso de commits ajenos) |
| 19 | **Del proyecto, no del método**: armar el mensaje para un tercero (7 en 1 chat) y procesar audios y comprobantes (6 en 1 chat), en el asistente de Deptos | otro | 13 · 2 | P | "armame el mensaje así le mando" | ⚪ Regla de 3+ **dentro de ese proyecto** (skill propia); el tono hacia terceros, P43 |

**Correcciones que se repiten** (aparte, porque no son pedidos sino arreglos):
- "Esperá, pará, no nos mezclemos" cuando Claude avanza por su lado (6 en 4 chats, Perseo y Deptos) →
  ✅ H-18, S-M-14 (el sí vale solo para lo preguntado).
- Claude afirma un estado y Guido lo desmiente ("¿por qué decís que faltan?"; 5 en 1 chat) → ✅ H-12.
- Un "dale" ambiguo tomado como OK de otra cosa (2 en 1 chat) → ✅ S-U-6.
- "Usá el Chrome que ya está abierto, no abras otro" (2 en 2 chats, Perseo) → ✅ H-51; va a
  `referencia/trampas.md` de ese proyecto (B §13).
- Obreros con poco contexto usado y sin encargo (3 en 2 chats, **Hermes**) → ✅ D §11, P15.

## 2. Lo que se lee de la tabla

1. **El método ya vio casi todo.** 12 de 19 familias tienen diseño, y las tres más repetidas (abrir
   pestañas, cómo vamos, coordinar obreros) son exactamente las que atacan C, D y H. Esta pasada **no
   cambia las prioridades**; las confirma con otra lente y en otra PC.
2. **Lo que se escapó es chico y está en los bordes de la sesión:** quién propone el cierre (6), qué
   hace Guido cuando la prueba es a mano (3), qué pasa al volver de un corte (11). Son los momentos donde
   ninguna skill está corriendo.
3. **Guido se pone sus propias compuertas** ("mostrame antes", "P0 me la pedís con OK") y después las
   paga con "dale" (5). No es un problema a arreglar: es la autonomía declarada (S-U-6) haciendo su
   trabajo. Solo se mide.
4. **"En criollo" falla con la regla escrita** (8): en vibe-kit, con el `CLAUDE.md` que lo pide, Guido lo
   pidió en 5 chats en 4 días. Es otra prueba de P1 (la prosa no frena).

## 3. Propuestas

### Molde / skills del proyecto

- [x] **P58 · La sesión propone el cierre sola**, en una línea, cuando pasa una de tres: la tarea pedida
  quedó hecha y verificada, el contexto pasa el umbral de D §11, o Guido dice que se va ("me voy",
  "cortemos por hoy"). La línea dice **qué surgió en la charla y dónde quedó anotado** (TODO, ficha,
  bandeja), así no hace falta el "anotalo en algún lado". No cierra sola: propone (el cierre commitea).
  Evidencia: hábito 6 (~26 pedidos en ~15 chats, 5 proyectos, del 2026-08-19 al 10-25) + hábito 13 (~13
  en ~8); H-44 ya lo había visto ("4 de 4 cierres arrancaron por pregunta de Guido") sin propuesta. *(✅ Revisión integral 2026-10-26: entró a DISENO-B §11.5.)*
- [x] **P59 · Toda recomendación trae "por qué hace falta" y "qué pasa si no lo hacemos"**, en una línea
  cada una, en cualquier proyecto (no solo en los diseños de vibe-kit, que ya pasan los 11 criterios).
  Es la pregunta "¿es capricho?" contestada antes de que la haga. Evidencia: hábito 9 (~22 en ~12 chats:
  vibe-kit, Perseo, Deptos, del 2026-09-21 al 10-25) + la corrección "volvé a pensarlo" (3 en 2 chats). *(✅ Revisión integral 2026-10-26: entró a DISENO-E §2.6.)*
- [x] **P60 · Prueba a mano con guion**: cuando la prueba la tiene que hacer Guido (el celular, WhatsApp,
  el navegador, una consulta que Claude no puede correr), Claude le da **los pasos numerados, qué tiene
  que ver en cada uno y cómo avisar** ("listo" alcanza), y al "listo" **va a leer el resultado solo**
  (logs, base, respuestas del bot), con esa lectura ya autorizada en el `CLAUDE.md` del proyecto, sin
  pedir permiso cada vez. Evidencia: hábito 3 (~35 en ~12 chats: Perseo, Deptos y Hermes, del 2026-08-20
  al 10-23), con "te doy permiso para que leas las respuestas" repetido; H-63 y S-U-9 cubren el "Claude
  prepara, Guido aprieta" y la simulación, no el guion. *(✅ Revisión integral 2026-10-26: entró a DISENO-F §8 y DISENO-E §2.6.)*

### Arquitecto / diseño

- [x] **P61 · "¿Cómo lo resuelven otros?" como paso fijo antes de diseñar** algo con alternativas (Modo B
  del Arquitecto y los racimos de vibe-kit): un investigador Sonnet con tope de búsquedas, que deja
  "qué robar y qué no" en una sección del diseño, **antes** de las decisiones. Hoy se hace solo cuando
  Guido lo pide (H §18 se hizo así). Evidencia: hábito 16 (9 en 7 chats: vibe-kit 5, del 2026-10-22 al
  25, en casi cada racimo; Perseo 4, del 2026-09-21 al 10-23). *(✅ Revisión integral 2026-10-26: entró a DISENO-E §3 y DISENO-H §8 (obligatorio en Modo B largo, opcional en el corto).)*

### Director / obrero

- [x] **P62 · Volver de un corte sin tipear lo mismo en cada pestaña**: (a) al reanudar (hook
  `SessionStart` con origen `resume`), el obrero **se vuelve a presentar solo** al director con el
  núcleo común de D §5; (b) el director, al ver que el corte fue de toda la cuenta (límite de uso), le
  dice a Guido **una sola vez** qué pestañas reanudar. Que el hook vea el origen `resume` en la extensión
  de VS Code: **NO VERIFICADO**. Evidencia: hábito 11 (~18 en ~12 chats; en Hermes, "inténtalo de nuevo"
  en 2 pestañas en el mismo minuto, dos noches (2026-10-22 y 24), y "presentate al director" en 3
  pestañas en el mismo minuto el 2026-10-25); H-37 ya contaba ~12 "continue" sin propuesta. *(✅ Revisión integral 2026-10-26: la regla entró a DISENO-D §5; el hook de resume al piloto.)*

## 4. Lo que NO se propone, y por qué

- **Nada nuevo para los hábitos 1, 2, 4, 7, 8, 10, 12, 13, 14, 15, 17 y 18**: ya tienen diseño (el 13 suma
  su parte a P58). Esta tanda solo
  les suma un conteo de otra PC; si la sesión madre quiere, va como línea base en el piloto.
- **Hábito 5 ("dale")**: no se toca. La mitad son compuertas que Guido pide; la otra mitad la cubre
  S-U-6.
- **Hábito 19**: es del asistente de Deptos (regla de 3+ dentro de ese proyecto), no del método.
- **Los cortes por límite de uso** (hábito 11): el kit no los puede evitar; P62 solo baja lo que cuesta
  volver.

## 5. Para la próxima pasada (lección de la receta)

- **Para lotes recortados, presupuestar ~120 mil tokens por lector**, no contenido × 3: el × 3 de METODO
  vale para lotes de 500 KB; acá dio 1,9 veces más que lo presupuestado. `recortar.py` ya imprime el piso.
- **El recorte "mensajes de Guido + 1.ª línea de Claude"** sirve para cualquier pregunta sobre Guido (qué
  pide, qué corrige, cuándo se frustra) y baja la entrada 24 veces.
- Los chats de obrero con solo el comando de arranque inflan el lote sin aportar (27 de 32 en el lote 5):
  en `clientes` conviene agruparlos en un lote propio y contarlos por script, no por lector.

## 6. Pendiente: la PC `clientes` (la parte seria)

**Por qué.** Ahí están los proyectos largos de Hermes (Desktop y Mobile), los directores y la mayor parte
del trabajo de Guido. Esta acta los ve solo por 12 chats. Las frecuencias de arriba **no** representan
ese uso.

**El brief, listo para correr allá** (sesión abierta en `vibe-kit` de la PC `clientes`, después de
`git pull`; los comandos de a uno):

1. Condensar todo el historial, desde el arranque de la investigación anterior en esa PC (la pregunta es
   nueva para esos chats también), excluyendo la sesión que corre:
   ```
   python -I observatorio/investigacion/condensar.py --pc clientes --salida D:\vibe-research\clientes\habitos --desde 2026-04-21 --excluir <id de esta sesión>
   ```
2. gitleaks sobre `D:\vibe-research\clientes\habitos\condensados` y revisar cada alerta sin imprimir el
   valor (METODO paso 2).
3. Recortar y armar los lotes:
   ```
   python -I observatorio/investigacion/recortar.py --origen D:\vibe-research\clientes\habitos --tope-kb 90
   ```
   gitleaks también sobre `recortados\`.
4. **Pedirle el OK a Guido con el número** que imprime `recortar.py` (lotes × ~120 mil). Si es mucho:
   arrancar en el corte de esta tanda para esa PC (`--desde 2026-10-12T21:59`) o solo Hermes Desktop.
5. Un lector Sonnet por lote, en paralelo, con `observatorio/investigacion/LECTOR-HABITOS.md` y la ruta
   de salida `D:\vibe-research\clientes\habitos\hallazgos\<lote>.md`.
6. Cruzar contra **esta acta** (además del acta anterior, el TABLERO y los DISENO): para cada familia de
   arriba, ¿se repite en Hermes y con qué frecuencia?; ¿hay hábitos de trabajo que acá no aparecen?
   Propuestas nuevas desde **P63**.
7. Guardar los hallazgos en `D:\vibe-hallazgos\` y anotar el corte nuevo de `clientes` en el acta que
   salga y en `CORTE.md`.

**La pregunta, igual que acá:** ¿qué le pide Guido a Claude a mano, una y otra vez? (abrir, cerrar, entre
sesiones, delegar, revisar), con veces, chats, un ejemplo corto y si el método ya lo absorbe.

## 7. Dónde quedó lo hallado (privado, fuera de todo repo)

`C:\vibe-research\usuario\habitos-todo\`: condensados, recortados, lotes, `costos.csv`, los 5 archivos de
hallazgos y las instrucciones del lector. `C:\vibe-research\usuario\habitos\` es la corrida solo desde el
corte (la prueba del script). **No se borró nada**; mover a la carpeta de hallazgos de esta PC lo decide
Guido.
