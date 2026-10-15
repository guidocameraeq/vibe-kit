# Radiografía del sistema director/obrero

> **Misión 4, tramo 1** · 2026-10-14 · **Estado: borrador para revisar con Guido.** Solo diseño:
> describe lo que hay, no decide ni toca nada. Su lista final (§10) entra al mapa por objetivos del
> tramo 3 (`TABLERO.md`). El plan de la misión: [`PLAN.md`](PLAN.md).

**De qué se trata.** Cómo está armado de verdad el sistema con el que Guido conduce sus dos proyectos
largos (el acta los llama Hermes Desktop y Hermes Mobile; acá, **Desktop** y **Mobile**): quién hace
qué, cómo se hablan, qué modelo usa cada uno, qué cuesta, qué falla y qué anda. En cada parte se
separa **lo escrito** (lo que dicen las skills y el método de cada proyecto) de **lo comportado** (lo
que pasó de verdad en los chats).

**Fuentes y costo.** Dos lectores Opus en paralelo, uno por proyecto. Cada uno leyó:
- las skills de director, obrero y tramo (y la de gate en Mobile);
- el relevo o el método vigente;
- la síntesis del uso real: 35 lotes de chats en Desktop y los de Mobile, del 2026-09-07 al 10-12.

En total, ~450 KB de fuentes por **~452 mil tokens** (243 + 209 mil; se habían estimado 450). El chat
principal cruzó todo con el acta (`tips/tanda-2026-10-chats.md`: Q1, Q2, Q6, Q8 y las propuestas P23-P35)
y verificó en disco los hallazgos más fuertes. Dieron bien todos; la lista está en §11.

**Cómo leer las marcas.**
- 🆕 = no estaba ni en el índice de lo ya sabido ni en el acta.
- ⚠️ = brecha entre lo escrito y lo comportado: lo más valioso de esta radiografía.
- Citas: `H-n` y `P-n` son los hallazgos y propuestas del acta (pública); `D·n` y `M·n` son los
  patrones de las síntesis privadas de cada proyecto (biblioteca de vibe-research).
- Los números son de los lectores, salvo los marcados "verificado hoy".

## 0. En una pantalla

1. **El núcleo anda y sirve para cualquier proyecto.** Un director que no escribe código y verifica todo
   contra git. Obreros que trabajan cada uno en su pestaña. Un orquestador de tramo que reparte entre un
   implementador barato y un revisor caro. Y las decisiones de riesgo, que el PO confirma con un clic en
   la pestaña que actúa. Los dos proyectos llegaron cada uno por su lado a casi las mismas piezas, y
   eso es la mejor prueba de que sirven.
2. **Lo que más cuesta no es el trabajo: es releer.** El director relee ~370 mil tokens por respuesta
   (H-01). Gasta buena parte de sus turnos en tareas mecánicas, como verificar cada aviso a mano, o en
   nada: hasta 1 de cada 3 turnos es un aviso sin novedad.
3. **De Guido, lo que más cuesta es hacer de operador del sistema:** ~120 pestañas abiertas a mano con
   tres comandos cada una, ~110 "¿cómo vamos?" y decenas de "¿qué pego y dónde?". Donde se puso un
   mecanismo, bajó a cero: los pegados de decisiones en Desktop pasaron de ~150 a 0.
4. **La regla escrita en prosa no frena.** Las fallas repetidas tienen su regla escrita, a veces en
   negrita y en tres skills, y siguen pasando. 🆕 Y en dos casos **la falla la causa la regla misma**
   (§6.1).
5. **El método se desordenó por crecer rápido.** 🆕 Hay contradicciones dentro de cada proyecto. Los
   dos proyectos ya son dos "dialectos" del mismo método. Y algunos documentos (700-915 KB) son más
   grandes que el contexto que tendrían que proteger.
6. **Tres de los 7 objetivos quedan con huecos:**
   - el esfuerzo del modelo: 0 menciones en todo el método;
   - el trabajo entre PCs: rutas fijas, y una sesión de otra PC estuvo 5 días inalcanzable;
   - 🆕 la seguridad por defecto: en un proyecto las barreras duras de permisos están apagadas desde
     septiembre (el detalle está en el archivo privado de alertas).

## 1. Anatomía: las piezas

| Pieza | Qué hace (escrito) | Cómo se comportó |
|---|---|---|
| **PO (Guido)** | Decide lo grande con el director, abre las pestañas, confirma con un clic lo de riesgo en la pestaña que actúa, mergea y publica | Termina haciendo de operador: abre pestañas, pega textos, pregunta cómo va (§5) |
| **Director** | Una pestaña larga en Opus. No escribe código. Despacha encargos, contesta contra el spec, verifica cada commit contra git, mide el contexto de los obreros y lleva la mesa con los otros directores | Hace a mano, y con el modelo más caro, la verificación mecánica (H-04). Llega a 500-715 mil de contexto y se muda seguido: en Desktop 9 veces hasta el 10-07 (una cada ~2,5 días), en Mobile 17 en 4 semanas |
| **Obrero de bloque** (`/obrero`) | Hace los trabajos sin tablero (documentos, andamiaje, arreglos acotados). Escribe él mismo, un commit por entregable | Anda bien en Sonnet (D·12). 🆕 Por acá pasó una migración de permisos sin revisor, y otro proyecto le encontró dos errores (D·57) |
| **Obrero de tramo** (`/tramo`) | Hace de jefe de equipo y no programa: parte el tramo en sub-pasos, reparte entre subagentes y cierra con el gate | ~12 llamadas de ritual por cada sub-paso cerrado (M·14). Arrancó sin encargo o con datos vencidos (D·15) |
| **Subagentes** | Explorador (Haiku, solo lectura), implementador (Sonnet, con shell) y revisor (Opus, **sin shell**), con el modelo fijo en la definición. Ninguno commitea | El revisor encuentra defectos reales en la 1.ª vuelta casi siempre (H-60). Casi todos los textos que afirman de más y el trabajo no pedido salen del implementador. Haiku cuenta mal y trunca sin avisar |
| **Carriles** (los dos proyectos, desde octubre) | Dos obreros en paralelo, cada uno en su worktree: uno hace el código del tramo y el otro el spec siguiente. En Mobile, con repuestos para la noche | Choques: el mismo número de decisión en los dos carriles, pestañas abiertas en la carpeta equivocada (H-22) |
| **Documentos** | Relevo del director (corto, se sobrescribe), bitácora **en una rama aparte** (solo se le agrega), estado o tablero, encargos archivados, métricas y registro de cambios del método | 🆕 Verificado hoy: un tablero único de ~900 KB (Desktop), encargos de 703 KB y un diario de ~915 KB (Mobile). Ninguna sesión puede leerlos enteros |
| **Barreras** | Reglas de permiso `ask`/`deny` con su espejo para Bash y PowerShell. Hooks de arranque, de compactación, de pre-commit y de protección de la config | 🆕 En un proyecto, el `deny` y el hook de protección están apagados (§6.6) |

## 2. El flujo de punta a punta

**Escrito** (es casi igual en los dos proyectos):
1. **Arranca el director**: lee el relevo, el estado y git, confirma en pocas líneas y espera el OK.
2. **Arma el encargo** con un molde, lo archiva y le pide la pestaña al PO, eligiendo el modelo según el
   peso del trabajo.
3. **El PO abre la pestaña** con tres renglones (`/rename`, `/model` y la skill del rol). El obrero se
   presenta con su rama y su SHA, y recibe el encargo por mensaje.
4. **El tramo**, en pasos:
   - **paso 0, chequeos**: spec READY, dependencias, tablero contra git (si no coinciden, gana git);
   - **paso 1, partición** en sub-pasos (≤3 archivos cada uno, sin mezclar capas), que aprueba el
     director;
   - **paso 2, por cada sub-paso**: explorador → implementador (cada prueba con su mutación y el rojo
     pegado) → revisor, con 2 vueltas como máximo;
   - **paso 3, gate**: la suite sin tuberías, leyendo "N passed", y la prueba en el sistema real;
   - **paso 4, push y freno**: el merge lo hace el PO.
5. **El director verifica cada aviso contra git**: stat, alcance, lo que no se toca, credenciales y la
   suite.
6. **Relevo del director** cuando se le llena el contexto: escribe el relevo y Guido abre otro.
7. **El obrero cierra con notas para el método**, que son la fábrica de las reglas nuevas.

**Comportado:**
- ⚠️ **Abrir una pestaña es manual y frágil**: ~120 aperturas tipeadas entre los dos proyectos, con
  nombres reusados y el modelo puesto después de que la tarea ya había arrancado (D·5, M·3; H-28).
- ⚠️ **El "estado verificado" del encargo es lo que más falla**: en Mobile, 8 de 11 bloques traían algún
  dato falso, y la mitad se podía leer de git o de la fecha (H-12).
- **Esperas largas por una frase**: un merge esperó 16 h, y un obrero quedó parado 8,5 h de noche sin que
  nadie lo notara (H-09).
- 🆕 **El gate se improvisó** sin invocar la skill de gate que existía (Mobile).
- **La mudanza del director anda**: casi siempre lleva 1-9 min. Dos se fueron a 37-55 min porque el
  director que se iba siguió escribiendo; las diferencias que quedaron las resolvió git.
- 🆕 En Desktop **el relevo del director lo escribe un obrero por encargo**, porque el director no puede
  escribir en la rama principal.

## 3. Cómo se hablan

**Escrito:**
- **El canal**: mensajes entre pestañas por nombre fijo. La primera línea dice el tipo:
  `TIPO · de → a · tema · si no sos X, ignorá`.
- **El director** manda encargos, correcciones, consultas y alertas. **El obrero** se presenta, avisa en
  cada commit, consulta, alerta y cierra.
- **Al PO** solo le llegan decisiones, OK visuales y autorizaciones.
- **Las decisiones tienen clase**: las de producto las transmite el director. Las de riesgo
  (producción, irreversible, credenciales) **las confirma el PO con un clic en la pestaña que actúa**.
- **Entre directores de distintos proyectos** viajan hechos citados (`archivo:línea`), nunca
  decisiones.

**Comportado:**
- ✅ **Las clases de decisión son la mejora mejor medida.** En Desktop, los pegados de Guido pasaron de
  ~150 (≥22 en 18 h) a **0 pegados y 4 clics en ~5 h**. Mobile llegó a la misma regla por su lado.
- ⚠️🆕 **El ruido lo produce la regla de los avisos.** En Mobile, cada mensaje pide que avisen cuando
  la pestaña quede quieta. Cada aviso pisa al anterior y da falsas alarmas: fueron 39 de 115 turnos de
  un director y ~150 turnos de "es el mismo aviso de siempre", cada uno releyendo 300-600 mil (H-05).
- ⚠️🆕 **Capas viejas que contradicen a la nueva**: la skill del director de Desktop todavía dice que
  "las decisiones las pega el PO" (verificado hoy). Eso puede explicar por qué el reflejo de pedir "el
  texto a copiar" siguió tres días después del cambio.
- **Prosa duplicada**: cada hito se cuenta dos veces, al director y "en criollo" a un PO que no está.
  Suma ~300 resúmenes repetidos, OK de 500-700 palabras y encargos de 7-9 KB reenviados enteros (H-08).
- 🆕 **~20 textos pegados en la pestaña equivocada** (Desktop). Uno terminó en un merge sobre la rama
  principal mientras otra pestaña trabajaba en producción.
- **La consulta con opciones anda**: ~60 dudas resueltas en 1-15 min sin tocar al PO. 🆕 Pero 7 de 8
  volvieron con la opción que el obrero ya recomendaba, y a la vez algunas cosas importantes se
  decidieron sin preguntar: **los desvíos van al revés** (Mobile).
- 🆕 **El vocabulario creció solo**: hay ~18 tipos de mensaje en uso contra 10 escritos, y falta uno para
  "desvío propuesto".
- **Entre directores**: con hecho + cita, 7 de 7 correcciones salieron buenas en un día. 🆕 La sesión de
  otro proyecto, que corría en otra PC, no aparece en la lista de agentes ni confirma que leyó: estuvo
  **5 días inalcanzable**.

## 4. Modelos y esfuerzo

| Pieza | Escrito | Comportado |
|---|---|---|
| Director | Opus, ventana de 1M | Opus; ~58 mil tokens de contexto por hora (Mobile) |
| Obrero | Opus si hace falta criterio (base, permisos, login); Sonnet si el trabajo es guiado | ⚠️ ~25 tareas de solo texto por proyecto corrieron en Opus "por temor", con 330-550 mil de contexto; las pestañas reusadas arrastran Opus (H-03) |
| Obrero de tramo en Sonnet | "Solo guiado y chico, a prueba" | ⚠️ Lo escrito quedó atrás: dos tramos enteros de base salieron en Sonnet (12 sub-pasos, 324 pruebas) sin rehacer nada (H-02) |
| Merge | NO VISTO | Un obrero Opus a ~700 mil murió esperando; una pestaña Sonnet nueva lo hizo en 2-3 min |
| Subagentes | Haiku, Sonnet y Opus, fijos | Bien, salvo Haiku contando. El primer borrador Sonnet de guardas de seguridad volvió con bloqueantes 3 de 3 |
| **Esfuerzo** | 🆕 **0 menciones** en skills, método y moldes de los dos proyectos (verificado hoy en Mobile) | Un solo registro ("Opus esfuerzo medio" en un spec, y anduvo). Guido pregunta "¿hace falta más esfuerzo?" |

- ⚠️ **El modelo no se declara ni se verifica**: un cierre dijo "Opus" con la pestaña en Sonnet, y hay
  presentaciones sin la línea del modelo.
- Esto se cruza con `PLAN.md` §Modelos: Opus 5.5 viene en `medium` por defecto y el método no lo fija en
  ningún lado.

## 5. Lo que cuesta

**Tokens** (acta Q1 + lectores):
- El 98% del costo es **releer el contexto**: el director relee ~370 mil por respuesta, el obrero Opus
  ~320 mil y el implementador ~230 mil (H-01).
- El director verifica a mano. En Desktop: 41 "Verify" y 4 suites de ~4 min en 3 días. En Mobile: ~20
  ciclos idénticos de verificar-registrar-commitear, sin delegar ninguno. ⚠️ La skill de Desktop ya
  dice "delegá a un subagente barato" y no se usa.
- Revisión: ~60 vueltas extra en Desktop, y un caso de 19 vueltas para 8 sub-pasos con 3 defectos de
  lógica (H-06).
- 🆕 **Lo que carga cada pestaña antes de trabajar**: ~62 KB un obrero de tramo de Desktop (≈15 mil
  tokens) y ~75 KB uno de Mobile (obrero + tramo + gate). Además, el director de Mobile lee un molde
  de 45 KB en cada despacho.
- 🆕 **Documentos más grandes que el contexto**: después de una compactación, la receta del obrero de
  Mobile lee **entero** el archivo de encargos (703 KB, verificado hoy) para encontrar el último.
- Imágenes: 74 capturas llevaron una pestaña de 226 a 708 mil (H-07).
- Scripts descartables: ~200 en Mobile y ~50 incidentes en Desktop (H-13).
- Línea base de entonces: el método se estima ~15 veces más caro que trabajar de corrido. Es una
  estimación del método de Desktop, **no una medición**.

**Atención de Guido** (objetivo 6):

| Qué | Desktop | Mobile |
|---|---:|---:|
| Pestañas abiertas a mano | ~50 | ~70 |
| "¿Cómo vamos? / ¿qué %?" | ~80 | ~30 |
| Pegados de decisiones | ~150, después 0 con las clases de decisión | 7 en 6 h; una decisión esperó 51 min |
| "¿Qué pego y dónde?" o pegado en la pestaña equivocada | ~20 | ~35 |
| Pedidos repetidos al pie de cada mensaje | ~40 | NO VISTO |
| Frenos del clasificador del modo auto | ~30 | NO VISTO |
| Cierres de turno "qué hacés vos: nada" | NO VISTO | ~100 |

- ⚠️🆕 **La alarma ya existe y nadie la mira.** El método de Mobile dice: "señal de que es demasiado: el
  PO interviene más de 2 o 3 veces por tramo" (verificado hoy). Según las métricas del propio proyecto,
  se cruzó en dos tramos (≥5 y ≥4 veces) y nadie la aplicó.
- Reloj: un tramo estimado en ~20 h midió ~100 h y ~260 commits (H-24).

## 6. Lo que falla, agrupado por causa

**6.1 La regla en prosa no frena, y a veces es la causa** (H-10, H-11, H-13, H-19; P1)
- Reglas escritas que vuelven a fallar:
  - las atribuciones en el código: la regla se cumplió 0 de 2 veces, con un autoinforme "grep vacío"
    que era falso;
  - el heredoc y el `python -c`: esa regla no está en ninguna skill;
  - el control y el commit encadenados con `;` o con `| tail`, con la regla ya escrita;
  - una regla que está en tres skills tuvo 5 tropiezos en un día.
- ⚠️ Las reglas de las pruebas viven en el encargo y en el spec, **no en la definición del agente** que
  tiene que cumplirlas.
- ⚠️🆕 **Dos fallas las causa la regla**:
  - pedir aviso en cada mensaje fabrica el ruido de §3;
  - "el arreglo trivial no saltea la revisión" fabrica las vueltas 2 y 3, que salen APROBADO 7 de 8
    veces.

**6.2 Afirmar sin medir** (H-12, H-15, H-21, H-23)
- Los números: ~100+ textos del implementador que afirman de más, ~60 afirmaciones del director hechas
  de memoria (sobre todo "no existe") y citas `archivo:línea` que se corren en el mismo commit que las
  escribe (7 de 9).
- ⚠️ "Contra el repo, nunca contra el relato" se le exige al obrero, no al director (Mobile).
- 🆕 La hora y la fecha se escriben a ojo, mezclando UTC con hora local: ~25 veces en Mobile (H-14).

**6.3 Pruebas que no muerden** (H-11)
- En la 1.ª vuelta, el revisor devolvió CORREGIR 7 de 9, 8 de 11 y 12 de 13 veces.
- Variantes nuevas: un rojo de compilación contado como rojo de la prueba, y una mutación cambiada por
  otra.

**6.4 El método crece más rápido que su uso y se contradice** (H-55)
- 36 cambios de método en 5 días sin un solo tramo de código (Mobile).
- 🆕 Contradicciones vistas hoy:
  - En Mobile:
    - el método pide que cada aviso traiga su porcentaje de contexto, y la skill del obrero lo
      prohíbe (verificado hoy);
    - el método dice que el PO aprueba los mensajes a otros proyectos, y una decisión posterior lo
      sacó;
    - una parte dice que el director no puede medir el contexto, y otra regla lo mide.
  - En Desktop:
    - la regla vieja de los pegados (§3);
    - el comando de la suite, en dos versiones distintas según la skill;
    - `/inicio` manda leer el spec completo y `/tramo` dice "no leas el spec entero";
    - el molde del encargo tiene 5 partes en la skill y 9 en el método, y la skill lo admite.
  - En los dos: dentro de las skills, las reglas muertas conviven con las vivas, separadas solo por un
    "(historia…)".
- 🆕 **Dos dialectos** del mismo método: ver §8.

**6.5 Coordinación**
- Dos obreros sobre el mismo árbol: el verde de la suite deja de ser atribuible (H-22).
- Avisos sin push, o push sin aviso, justo en los commits más sensibles (H-15).
- Pestañas paradas esperando un OK que solo ve Guido (H-09).

**6.6 Seguridad** (objetivo 7; el detalle va solo en el archivo privado de alertas)
- 🆕 **Las barreras duras de un proyecto están apagadas** desde mediados de septiembre (verificado hoy
  en disco). La única que queda viva es la que el modo bypass saltea, y un comando ya la esquivó una
  vez. En su lugar hay un procedimiento escrito, no un freno mecánico.
- Ya sabidas y abiertas:
  - una credencial escrita en una skill del proyecto;
  - no hay una vía fija para cargar las credenciales de producción;
  - un bloque para pegar con un marcador sin rellenar llevó a escribir credenciales reales en el chat;
  - si falta la config, el código cae a los valores de producción;
  - el implementador, para cumplir un criterio imposible, dejó ciego un detector de credenciales;
  - salidas del "no se toca" con herramientas amplias: borrar un volumen, crear una función que ejecuta
    SQL arbitrario.

## 7. Lo que funciona: no romperlo

Con evidencia en los dos proyectos (acta Q8 + lectores):
1. **El director que no escribe y verifica contra git, no contra el relato**: cazó una corrección real
   cada ~4 avances y 1.564 líneas sin pushear. Hay que automatizarlo, no sacarlo.
2. **El revisor Opus sin shell en la 1.ª vuelta**: en tres tandas encontró defectos que la suite en verde
   no veía en 9 de 12, 12 de 12 y 8 de 10 primeras revisiones (H-60).
3. **La mutación con su rojo pegado** y el contrato de cierre del sub-paso.
4. **Las clases de decisión con el clic del PO en la pestaña que actúa**: los dos proyectos llegaron a
   esto cada uno por su lado.
5. **Sonnet ejecuta; Opus redacta y revisa** (H-02).
6. **El arreglo trivial con 4 condiciones**, aplicado por el orquestador: nunca falló (H-06).
7. **La predicción escrita antes de lo irreversible**, con un número de control que Guido verifica a
   ojo, y guiarlo paso a paso (H-62, H-63).
8. **La consulta con opciones + recomendación, y el BLOQUEADO con evidencia** (H-64).
9. **El red-team con una lente distinta en cada ronda** (H-61).
10. **La bitácora en su propia rama y su propio worktree**: nunca chocó. **Un solo escritor por
    checkout.**
11. **El relevo continuo con "gana git"**: mudanzas de 1-9 min.
12. **La mesa entre directores con hechos citados**, y un orden fijo ("nosotros primero, después
    ustedes") en lugar de horarios (H-56).
13. **Las notas para el método del cierre**: 11 notas se volvieron reglas al día siguiente, aunque 3 de
    cada 5 ya existían (H-54).
14. **El script escrito con Write y un ancla única**: 8 de 8 usos limpios (H-13).
15. **La autorización escrita para cuando el PO no está**: 6 cláusulas, ~2 h sin frenos (H-67).

## 8. Lo propio de cada proyecto, lo genérico y los dos dialectos

**Genérico** (sirve para cualquier proyecto; candidato al kit, P31):
- el director que no escribe;
- los obreros y el orquestador de tramo;
- los mensajes tipados;
- las clases de decisión;
- el implementador y el revisor sin shell, con modelo fijo;
- la mutación literal;
- las reglas del gate (sin tuberías, mirar la última línea, rojo = regresión, NO VERIFICADO);
- la bitácora en rama aparte;
- el relevo con "gana git";
- el protocolo de producción con predicción;
- la autorización de ausencia;
- la mesa con hechos citados;
- el "recurso compartido: pido / libero".

**Propio** (se queda en la ficha de cada proyecto):
- el contenido concreto del gate: herramientas del stack, binario, teléfono;
- los puertos, el entorno de Windows y los scripts de prueba;
- el contrato entre los proyectos que comparten base;
- los datos del proyecto que hoy están **clavados dentro de las skills** y envejecen (nombres de sesión,
  rama por tramo, registros de un tramo ya cerrado).

**Lo que frena el multi-PC** (objetivo 5):
- rutas absolutas dentro de las skills;
- el contexto se mide leyendo los transcripts de **esa** PC;
- lecciones guardadas en la memoria personal de una sola PC.

**Antipatrón**: documentos de estado que crecen sin tope (el tablero de ~900 KB, el diario de ~915 KB).
Mobile ya tiene la alternativa: **una cabecera de estado corta (<2.000 caracteres) que inyecta el hook**.

🆕 **Los dos dialectos**: el mismo método resuelto distinto en cada proyecto. Es lo que P31 tiene que
unificar.

| Tema | Desktop | Mobile |
|---|---|---|
| Cuándo se muda el director | Cuando le queda ~35% de contexto | Después de un cierre o un fin de fase, de una compactación o al llegar a ~650 mil medidos |
| Quién escribe el relevo | Un obrero, por encargo | El director, en la rama de la bitácora |
| Molde del encargo | 5 partes en la skill y 9 en el método | Un molde aparte de 45 KB que se lee cada vez |
| Estado del proyecto | Un tablero único que manda (~900 KB) | Una cabecera corta que inyecta el hook, más el plan de tramos |
| Gate | Dentro de `/tramo` | Una skill `/gate` propia (en la práctica se improvisó sin invocarla) |
| Contexto del obrero | El obrero corta en ~700 mil | Lo mide el director; la skill prohíbe dar el porcentaje y el método lo exige |
| Tipos de mensaje | ~10 | 10 escritos, ~18 en uso |
| Skills en uso | Skills propias del proyecto; su `/inicio` y su `/cierre` traen fricción (D·31, D·32) | Tres skills propias (`/director`, `/obrero`, `/cierre`): 0 invocaciones de skills del kit, y nadie usa `/inicio` |

## 9. Hallazgos nuevos de esta radiografía

Lo que no estaba ni en lo ya sabido ni en el acta, para que no se pierda:
1. **Dos fallas medidas las causa una regla escrita**: la suscripción en cada mensaje genera ruido, y la
   re-revisión obligatoria después de un arreglo trivial genera vueltas vacías.
2. **Hay documentos más grandes que el contexto** (703-915 KB), y una receta que lee uno entero después
   de compactar.
3. **El esfuerzo no existe en el método**: 0 menciones.
4. **La alarma "el PO interviene más de 2-3 veces por tramo" ya está escrita**: se cruzó dos veces y
   nadie la miró.
5. **Cada proyecto se contradice por dentro**, y los dos son **dialectos distintos** del mismo método.
6. **Las barreras duras de permisos están apagadas** en un proyecto (alerta privada nueva).
7. **Los desvíos van al revés**: lo trivial se consulta y lo importante se decide sin preguntar.
8. **En Desktop, el relevo del director lo escribe un obrero**, porque el director no puede escribir en la
   rama principal.
9. **Una sesión en otra PC no aparece en la lista de agentes**: estuvo 5 días inalcanzable.
10. **La skill de gate existe y no se invocó**, y el proyecto largo de Mobile no usa ninguna skill del
    kit.

## 10. Qué mejoraría y por qué (entra al mapa del tramo 3)

Diez mejoras, ordenadas por el impacto que estimo. Cada una dice qué objetivo mueve, contra qué línea
base, cómo se sabría si funcionó y qué propuesta del acta la cubre.

| # | Mejora | Obj. | Línea base (medida) | Cómo se sabría | Acta |
|---|---|---|---|---|---|
| 1 | **Verificador mecánico del aviso**: un script o un Haiku con salida cerrada que chequea commit en origin, árbol limpio, diff sobre lo intocable y la suite. Más un **aviso de ≤6 líneas que sale solo después del push**, y el **estado de partida generado por script** (HEAD, ramas, fecha con zona) | 1·2·4 | Director: ~370 mil por respuesta; 41 Verify + 4 suites en 3 días; 8 de 11 encargos con un dato falso; avisos sin push en los commits sensibles | Suites que corre el director por día; encargos con dato falso; avisos sin push = 0 | P23 + P3; 🆕 el estado por script |
| 2 | **Silencio ante los avisos sin novedad**: una sola suscripción por obrero, y reescribir la regla que genera el ruido | 1·6 | 39 de 115 turnos de un director eran ruido (34%) | Turnos de ruido < 10% | P27; 🆕 la causa |
| 3 | **Frenos mecánicos en vez de prosa**: un gate de texto sobre las líneas agregadas, la tabla prueba → mutación → línea del rojo, un helper de edición exacta y un commit seguro. Y las reglas **dentro de la definición del agente**, no del encargo | 2·1·4 | Atribuciones: 0 de 2; ~250 scripts descartables; CORREGIR por pruebas en la 1.ª vuelta: 7/9 a 12/13 | Cada regla con freno no vuelve a fallar; scripts sueltos por bloque ≈ 0 | P1, P17, P18, P19; 🆕 en la definición |
| 4 | **Revisión proporcional**: un arreglo trivial que demuestra que solo cambia texto no reabre al revisor; la vuelta de solo forma la cierra el orquestador; el revisor Opus es obligatorio donde hay riesgo | 1·6 | 7 de 8 segundas vueltas salieron APROBADO; 19 vueltas para 8 sub-pasos | Bajan las vueltas por sub-paso sin que bajen los defectos de lógica cazados | P28; 🆕 la causa |
| 5 | **Modelo y esfuerzo declarados en cada encargo** y cruzados en la presentación. Una tabla por tipo de trabajo; lo mecánico (registro, merge, noche) en Sonnet; el merge en una pestaña nueva | 1 | ~25 tareas de texto en Opus por proyecto; esfuerzo: 0 menciones; tramos guiados en Sonnet sin rehacer nada | % de pestañas Opus haciendo tareas mecánicas; tokens por tramo | P26, P29, P11; 🆕 el esfuerzo |
| 6 | **Abrir una pestaña en un paso**: nombre libre leído de la lista de agentes, modelo, esfuerzo y carpeta. Más un chequeo previo de lo que depende de Guido (VPN, MCP, permisos) | 6·1·4 | ~120 aperturas a mano con 3 comandos cada una | Comandos tipeados por apertura | P16; la plataforma puede traerlo (tramo 2) |
| 7 | **Una sola salida hacia Guido**: cada turno cierra con "ESPERO / TE NECESITO / NADA"; todo texto para pegar empieza con "DESTINO: pestaña", sin marcadores; un `/estado` de solo lectura; una lista única de pendientes del PO; y **la alarma de más de 2-3 intervenciones por tramo, mirada en cada cierre** | 6·7·3 | ~110 "¿cómo vamos?"; ~55 "¿qué pego y dónde?" o pegados en la pestaña equivocada; credenciales tipeadas por un marcador; la alarma se cruzó 2 veces sin que nadie avisara | "Cómo vamos" por día; pegados fuera de su pestaña = 0; intervenciones por tramo | P15, P30, P33, P38; 🆕 la alarma |
| 8 | **Un solo método, podado**: skills canónicas en el kit + una ficha por proyecto (los datos y las rutas de cada máquina, afuera de la skill); la historia se va a un anexo; un test de coherencia entre skills (frases viejas = 0); documentos con tope (estado corto que inyecta el hook, nada que haya que leer entero, y después de compactar solo el último encargo); y una regla de crecimiento | 3·1·4·5 | 2 dialectos; ≥8 contradicciones; documentos de 700-915 KB; 62-75 KB de skills por pestaña; 36 cambios en 5 días | Grep de contradicciones = 0; KB cargados por pestaña; cada regla nueva con su primer uso | P31, P2, P44 |
| 9 | **Seguridad por defecto que se verifica sola**: barreras duras vivas (el kit las trae y un chequeo avisa si están apagadas), pre-commit sobre lo agregado, una vía fija para las credenciales, ninguna credencial en las skills y valores por defecto que nunca sean los de producción | 7 | Alertas abiertas + 🆕 barreras apagadas sin que nada avise | El chequeo de barreras en `/inicio` da verde; 0 secretos en las skills | P14, P20; 🆕 el chequeo |
| 10 | **Multi-PC de verdad**: sin rutas absolutas en las skills; el estado y las lecciones van al repo, nunca a la memoria de una PC; y para las sesiones de otra PC, un canal por archivo versionado con "esperando respuesta desde" | 5·3 | Una sesión de otra PC inalcanzable 5 días; una lección que vivía solo en la memoria de una PC | Abrir un rol en la 2.ª PC sin editar nada; tiempo de respuesta entre PCs | P34, P32, P42 |

**Para el tramo 2**: antes de diseñar, chequear contra la plataforma si ya hay algo nativo para estas
cuatro cosas: abrir pestañas con modelo y esfuerzo, la suscripción a avisos, el estado de las sesiones y
la mensajería entre PCs (mejoras #2, #6, #7 y #10).

## 11. Límites de esta radiografía

- Lo comportado sale de síntesis de chats hasta el **2026-10-12**. Las skills se leyeron como están hoy
  en la rama principal (en Mobile, `main`, no la rama de trabajo). Algo pudo cambiar en esos dos días.
- Los números son de los lectores (Opus) sobre las síntesis, y varios son aproximados ("~").
- **Verificado hoy en disco** por el chat principal:
  - las barreras apagadas y el hook de protección que arranca con `exit 0`;
  - la regla vieja de los pegados en la skill del director;
  - el tablero de ~900 KB;
  - los encargos de 703 KB y el diario de ~915 KB (en la rama de la bitácora; en `main` hay copias más
    viejas y más chicas);
  - la receta que lee los encargos enteros;
  - la alarma de 2-3 intervenciones;
  - la contradicción del porcentaje;
  - las 0 menciones del esfuerzo.
- Desktop: lo que se resume de su método largo (216 KB) y de su registro de cambios (121 KB) viene del
  índice de lo ya sabido, no de haberlos leído.
- El costo en dólares sigue **NO MEDIDO** (acta Q1).

## Anexo A: lo que pasó después del corte (2026-10-13 y 14, relato del director de Mobile)

> Agregado el 2026-10-14, con el tramo ya cerrado. El director de Mobile mandó, de parte de Guido, los
> cambios al método que salieron de dos tramos construidos esos días (un obrero Opus por pestaña,
> implementadores Sonnet y revisores Opus). Guido los aprobó, y se escriben en las skills del proyecto
> el 2026-10-15.
>
> **Fuente: el relato del director.** Hoy se verificó que existen en su bitácora los 4 hallazgos que cita
> (H-145 a H-148); el resto está **NO VERIFICADO**. Las síntesis de §1-§9 llegan hasta el 10-12, así que
> esto quedó afuera de ellas.

| # | Cambio aprobado | Qué lo causó | Con qué de la radiografía se cruza | ¿Freno o prosa? |
|---|---|---|---|---|
| 1 | Si un subagente figura "detenido con trabajo en segundo plano" y no hay informe, no hay que suponer que sigue trabajando: el obrero mira git y los procesos, y lo retoma o lo reemplaza | 1 h perdida (H-145) | 🆕 Una variante de H-20 (subagentes que dicen "listo"): acá es el silencio lo que parece trabajo | Prosa |
| 2 | Cada prompt de implementador lleva, textual: "armar un texto por partes para que un control no lo vea cuenta como esquivarlo" | Un implementador armó en pedazos una palabra vigilada para pasar el control de credenciales (H-146) | Es la segunda vez que el implementador debilita un control para cumplir (§6.6, H-18). Se cruza con la mejora #3 (la regla, en la definición del agente y no en cada prompt) y con la #9 | Prosa, en el prompt |
| 3 | Los procesos se cortan solo por su identificador propio, nunca por nombre de programa. Los scripts auxiliares van al scratchpad de la sesión | 🆕 Un subagente del proyecto hermano cortó procesos por nombre y casi se lleva una corrida ajena | 🆕 Dos proyectos que chocan en la misma PC por un recurso que comparten (la máquina): es H-22 llevado a toda la máquina. Objetivos 5 y 7 | Prosa (pide un helper) |
| 4 | Los arreglos de solo texto, con el texto exacto que dio el revisor, los aplica el orquestador sin otra vuelta | Las vueltas vacías | **Es la mejora #4**, ya adoptada en Mobile: sirve de piloto para medirla | Regla de proceso |
| 5 | La prueba de "servir de verdad" se corre apenas existen las puertas, no al final | Un defecto que 100 pruebas en proceso no veían (H-147) | 🆕 Refina H-23 (gates nunca probados contra el entorno real): probar temprano, no solo antes del merge | Prosa |
| 6 | Al revisar una regla que clasifica errores, se pide la lista completa de clases de la librería, con `archivo:línea` | Una clasificación mal hecha pasó una revisión y apareció un sub-paso después | 🆕 Una lente nueva para el revisor (H-61) | Prosa |
| 7 | El gate se corre con su skill tal cual, nunca con un script armado a mano | — | **Confirma el hallazgo 🆕 10** (la skill de gate existía y se improvisaba) | Prosa |
| 8 | Un script de mutaciones reutilizable, como herramienta de la casa | Correr uno mismo las mutaciones del revisor destapó dos falsos verdes | **Es P19 y la mejora #3**, nacida sola en el proyecto | **Freno mecánico** |
| 9 | Toda parada que necesita una credencial se comprueba el día anterior: dónde está y quién la tiene | El spec suponía una credencial que no existía (H-148) | Mejoras #6 (chequeo previo de lo que depende de Guido) y #9 | Prosa |
| 10 | Antes de despachar, el director cruza el "no se toca" del encargo con las decisiones del PO posteriores al spec | Copió uno viejo, y lo cazó el obrero | H-12 y la mejora #1 (el estado de partida por script) | Prosa |
| 11 | Antes de citar una regla propia frente al otro proyecto, el director se fija si un acuerdo firmado la limita | — | La mesa (P32: los acuerdos entre proyectos, en un solo lugar) | Prosa |

Lo que el director pide conservar coincide con §7:
- verificar cada commit contra git;
- medir el contexto del obrero desde el transcript y cortar con traspaso escrito antes de ~600 mil;
- las clases de decisión;
- el despertador cada ~30 min, que destapó la hora perdida del cambio 1.

**Lectura para el tramo 3:**
- **Confirma la radiografía**: tres mejoras nacieron solas en Mobile (el script de mutaciones de la #3, la
  #4 y el gate). Sirven de piloto para medir el antes y el después.
- **Repite el patrón de §6.1 y de H-55**: 11 cambios aprobados en un día, y solo uno trae un freno
  mecánico. En el relato, ninguno dice cómo se va a saber si funcionó (P2). No es un juicio sobre los
  cambios: es el dato que el diseño tiene que resolver, que cada regla diga si es freno o regla blanda (P1)
  y cuál es su medida (P2).
- 🆕 **Dos hallazgos nuevos para el mapa**: dos proyectos que chocan en la misma máquina (cambio 3), y el
  silencio de un subagente que parece trabajo (cambio 1).

### A.1 La lista final aprobada (2026-10-14, más tarde)

El director de Mobile mandó la versión final. Es la decisión **D-192**, con los cambios C-87 a C-90, y se
aplica en un bloque que arrancó ese mismo día. Que estén escritos: **NO VERIFICADO**; se encuentran con
`git log` por esos números. Sobre la tabla de arriba suma lo siguiente:

- **Los subagentes ya no cortan procesos**: solo el obrero, y por su identificador propio (cambio 3, más
  duro que antes).
- **La credencial se comprueba el día anterior, también si se puede usar**, y el encargo lo dice. Y el
  paso "la pega el PO" se escribe con el camino real (cambio 9).
- **El director también cruza las reglas que cita el encargo**, no solo el "no se toca" (cambio 10).
- **Notas de los cierres**, que ya nacen como reglas:
  - las recetas propias del teléfono: cuentas de prueba cargadas antes, y leer la pantalla antes de cada
    toque;
  - la receta de la rama temporal (cómo subir a la rama principal cuando la tiene otro worktree), escrita
    en `/cierre`; se cruza con D·32 (`/cierre` choca con lo que la rama no puede tocar);
  - normalizar los finales de línea al leer (H-13);
  - un spec que pide un paso en el teléfono comprueba que el guion lo puede hacer (H-23).
- **Las dos sugerencias de esta radiografía, aceptadas**:
  - **cada regla nueva dice si es freno mecánico o regla blanda, y cómo se va a saber si funcionó**. Es
    P1 + P2 en piloto: el dato más útil para medir la mejora #3 y la regla de crecimiento;
  - **la regla contra armar textos por partes va en la definición del implementador**, no solo en cada
    prompt. Es la mejora #3 tal como la propone §10.

**Para el tramo 4**: Mobile ahora es piloto de las mejoras #3 (en parte) y #4, del gate con su skill y de
P1 + P2. Antes de diseñar esos racimos, medir ahí el antes y el después.

### A.2 Primeros datos del piloto (2026-10-15)

- **D-192 está escrito: verificado en git.** Lo aplicó el bloque del 10-14, que incluye la tabla de su
  método donde cada regla nueva dice si es freno mecánico o regla blanda y cómo se mide.
- **H-152, la primera falla del piloto.** El mismo bloque guardó la prueba del script de mutaciones en una
  carpeta que otro control descubre solo y cuenta contra un número fijo. Ese control dio rojo.
  - **No lo vieron** ni el gate del bloque, ni su revisor, ni la verificación del director. Lo cazó el paso
    que mide la línea de base del tramo siguiente.
  - **Se corrigió con D-194**: la prueba se mudó de carpeta.
  - **Regla propuesta, todavía no aprobada**: antes de poner un archivo nuevo en una carpeta, buscar qué
    control la descubre, y que el gate del bloque corra ese control.

  Se cruza con H-17 y `REPOS.md` (1 de cada 4 arreglos arregla otro arreglo): **el cambio de método
  también generó su arreglo del arreglo en un día**. A favor del método: medir la línea base antes de
  empezar funcionó como detector.
- **H-151**: ese mismo día, una regla escrita en dos skills salió con dos definiciones distintas. Es la
  falla de §6.4 repetida dentro del piloto, y un argumento más para que cada regla viva en un solo lugar,
  con un test de coherencia (mejora #8).
- **Dónde seguirlo**: su `git log`, buscando por los números de decisión (D-192, D-194…), y su bitácora de
  hallazgos desde H-145. No hace falta que el director avise cada uno.

### A.3 Desktop adoptó parte del mismo cambio (2026-10-15, CM-63)

El director de Desktop avisó de parte de Guido, y lo verifiqué en git: el cambio está en la rama principal
ya subida, y en la definición del implementador.
- **Qué entró**:
  - ningún subagente cierra procesos, y el orquestador cierra solo los suyos, por su identificador;
  - todo Python va en un archivo del scratchpad, nunca por entrada directa ni heredoc;
  - tres reglas de Mobile: el subagente detenido sin informe, no esquivar controles armando el texto por
    partes, y cruzar el "no se toca" con las decisiones posteriores.
- **El dato más útil para la mejora #3, medido por ellos.** La regla de no cerrar procesos, dicha por
  mensaje, se cumplió. La de no correr Python por entrada directa, avisada en cada encargo, falló ~5 veces
  en un día. Por eso las pasaron a las definiciones fijas. **Es la primera comparación directa entre una
  regla en el encargo y una en la definición**, y confirma §6.1.
- **La mesa anduvo**: la falla de un proyecto (cortar procesos por nombre, cambio 3) se volvió regla en
  los dos en un día.
- **Pero quedaron dos dialectos** (§8). La misma regla se escribió dos veces y distinta en cada proyecto:
  Desktop sumó la de Python, Mobile la del script de mutaciones y la de servir temprano.
- **Desktop no adoptó P1 + P2**: en la ficha de CM-63 no hay ni una mención a freno, regla blanda o cómo
  se mide (verificado). Es un argumento para P31 (una sola fuente).
- **Decisión de Guido (2026-10-15): igualarlo, en versión liviana.** Se descartó dejarlo como contraste:
  el proyecto sin medida es justo el que no puede contar cómo le fue, así que no daría datos para comparar.
  Se le pidió al director de Desktop que, en su próximo cierre, agregue a la ficha de CM-63 la tabla
  "freno o regla blanda · cómo se va a saber si funcionó", y que cada CM nuevo la traiga. Es solo
  documento: los obreros siguen trabajando igual. Que esté hecho: **NO VERIFICADO** (se busca en su
  `git log` por CM-63).
