# Diseño · Racimo B: documentos con tope

> **Misión 4, tramo 4** · 2026-10-22 · **Estado: ✅ cerrado con Guido y revisado dos veces** (revisor frío: 33 hallazgos, 30 aplicados;
> revisión de coherencia de Fable contra A, C, E y F: 20 correcciones; §22). Es solo diseño: se construye en la misión 5. Se mide
> contra el norte y los 11 criterios del [PLAN](PLAN.md). Respeta lo ya decidido en [A](DISENO-A-frenos.md),
> [C](DISENO-C-salida-hacia-Guido.md), [E](DISENO-E-molde-y-flota.md) y [F](DISENO-F-seguridad.md); donde los corrige o completa,
> lo dice y deja la nota allá.

## 1. Para qué es este racimo, en una línea

**Que cada sesión arranque viendo su estado entero, que los documentos no crezcan hasta mentir, y que cada cosa tenga una sola
carpeta donde vivir.** Es el sistema de documentación de cada proyecto: todo lo que vive en `docs/` y en el `CLAUDE.md`, cómo
lo escriben los agentes, cómo lo leen al arrancar y cómo se evita que se pudra sin que Guido lo vigile.

## 2. Lo que decidió Guido (2026-10-22)

1. **Una carpeta por módulo, con su vida adentro.** Guido trabaja por feature o módulo sobre apps que ya andan: levanta el
   módulo, escribe el plan, lo construye (solo o con director y obreros). Quiere que cada módulo tenga su carpeta con la
   documentación de toda su vida (el spec que le dio vida, los planes, las decisiones, la historia), y que **por fuera viva el
   plano de la app**: qué es, para qué, cuál es su objetivo, y cómo se conecta por dentro y con otras apps (con un diagrama). Hoy
   sus repos "no están desorganizados, pero tampoco tienen la mejor organización": las carpetas de specs son un historial casi
   inservible.
2. **Que funcione solo.** "Solo quiero que funcione bien, sin que yo me tenga que acordar de todo": la estructura se mantiene
   sin pedirlo, y cuando él dice "quiero pensar una feature", el sistema se da cuenta de que es un módulo y lo arma así. Un
   hotfix se hace y ya.
3. **No todo lleva director y obrero.** Una feature hecha por él solo en una sesión tiene que entrar en el mismo sistema.
4. **Los subagentes van en Sonnet u Opus, nunca en Fable.** Fable es el chat donde él decide.
5. Lo demás lo propuso Claude y Guido lo aprobó en bloque ("me super gusta"), con los topes delegados a Claude ("no sé cuál
   es el tope correcto, acá te escucho a vos"). Pidió después **una revisión de coherencia del propio Fable** contra el resto
   de los racimos y el filtro, antes de cerrar (§22).

## 3. Hoy (la ficha de una pantalla, medida el 2026-10-22 con `gh` sin abrir los proyectos)

| Qué | Hoy | De dónde |
|---|---|---|
| El hook de arranque | Hace `cat` del handoff entero; la plataforma corta a **10.000 caracteres** sin avisar y la sesión ve una vista previa de 2.000. **Se pasan Bot (15.500) y el Panel del bot (~18.000)**; Arte está al 92%, vibe-kit al 88%. El Hub lo arregló hoy: tope de 5.500 bytes al handoff, aviso "CORTADO" y un test que lo vigila | FLOTA §3 · PLATAFORMA §5 · medido hoy en 4 proyectos de esta PC · Hub `main` |
| Handoffs | Devoluciones: **534 KB**. El molde pide "qué se hizo" y "archivos tocados", que ya están en el CHANGELOG y en git: se escribe tres veces | medido hoy · molde |
| TODOs | Desktop **261 KB**, Mobile 203, Bot 82, Hub 69. El hook inyecta las primeras 30-40 líneas; el resto no lo ve nadie. ~29 ítems falsos en 3 semanas (S-U-8); de 4 pendientes anunciados en un cierre, faltaban 3 en el TODO (S-U-7); una cláusula cumplida que nadie retomó en 17 días (S-M-10) | medido hoy · TABLERO §4 |
| Estado e historia en el mismo archivo | El tablero del tramo de Desktop: **1,7 MB**, de los cuales 820 mil caracteres son "estado ahora" apilado por fecha y 742 mil fichas de tramo; lo vivo son ~70 mil. El ESTADO del tramo de Mobile: 312 KB, con dos líneas de **6 mil y 15 mil caracteres** porque cada valor viejo se agrega al lado como "antes era…" | lector Opus sobre Hermes, hoy |
| Lo que los rituales leen entero | `/inicio` de Desktop dice "leé el tablero completo" (13.219 líneas). El director relee el contrato con la otra app (**314 KB**) antes de cada mensaje. El obrero de Mobile relee los encargos enteros (**336 KB**) tras compactar para encontrar el último, que está al final. El cierre relee el TODO (203-261 KB) | ídem |
| Un módulo terminado | Cuenta Corriente (Desktop) quedó en **4 lugares**: spec y decisiones en una carpeta, el plan de 252 KB en otra, el manual suelto en `docs/`, la bitácora en una tercera. Devoluciones: **111 specs planos** con fecha en una carpeta, agrupados solo por un índice | ídem |
| Carpetas de `docs/` | Desktop 116 archivos `.md`, Devoluciones 171, Mobile 95; casi todos sueltos. Dos skills globales escriben specs en dos carpetas (`docs/SPEC-*.md` y `docs/superpowers/specs/`). El Hub ordenó hoy: raíz con 4 archivos + `specs/` · `referencia/` · `archive/`, y un test que falla ante un archivo suelto o una ruta citada que no existe | TABLERO §10 · Hub |
| Las "cosas que muerden" | Viven en el handoff y lo engordan (el nuestro tiene 7). El Hub las mudó hoy a `referencia/trampas.md` (23 KB) | nuestro handoff · Hub |
| El plano de la app | Ningún proyecto dice en una pantalla qué es, para quién, qué NO hace ni qué otros sistemas tocan su base: ~28 lotes donde el agente no lo sabía (P7). Lo más cercano: una sección del `CLAUDE.md` de Mobile. La arquitectura de Desktop son 61 KB sin disparador de actualización. vibe-kit lo probó en casa con `MISION-Y-VISION.md` | acta P7 · ADR-023 · lector |
| Los 11 criterios | Viven en el PLAN; el `CLAUDE.md` del molde no los refleja (pedido de Guido) | PLAN |
| gentle-ai, el referente | Un archivo plano por tarea, sin carpetas, sin tope, sin archivar; sin handoff ni TODO (el estado vive en su memoria); sin plano de la app. Sí: plantilla de tarea con orden fijo, "un cambio reescribe solo la parte afectada", marca `Historical`, y tests que comparan los docs contra el código | lector Sonnet, hoy |

**Lo que ya decidieron otros racimos y B respeta**: la ficha del kit en `.claude/kit.md` (E §4) · `AGENTS.md` opt-in (E §11) · la zona
propia del hook `session-start.propio.sh` (E §5) · las 3 líneas de F en el hook (F §15) y la de E ("hay kit nuevo", E §8) · la ficha
de tiempos del subproyecto (C §2.3 y §2.6) · el silencio por defecto y "te espera" (C §2.1) · los vencimientos no se gritan en cada
sesión (F §14) · un corrector nace con la receta de A §5.

**Dos palabras que se parecen y no son lo mismo**: **la ficha del kit** (`.claude/kit.md`, una por repo: versión, piezas, frenos; E §4)
y **la ficha del módulo** (`docs/modulos/<x>/README.md`, una por módulo: su estado; §5). Acá "ficha" sola es la del módulo.

## 4. El árbol de `docs/` en cuatro capas (decisión 1)

```
docs/
  NORTE.md                 ← qué es la app, para qué, para quién, qué NO hace, los hechos que solo sabe Guido. Una pantalla
  MAPA.md                  ← cómo se conecta por dentro (diagrama a nivel módulos) y con qué otras apps (los acuerdos vigentes). Una pantalla. Opcional si no hay conexiones
  SESSION_HANDOFF.md · TODO.md · CHANGELOG.md · README.md      ← la capa de sesión, con tope (§8 a §11)
  modulos/<nombre>/        ← una carpeta por feature o módulo, con su vida adentro (§5)
    README.md              ← LA FICHA: estado con tope. Se sobreescribe; nunca apila
    SPEC.md                ← el spec que le dio vida (SPEC-2.md… si hubo deltas), con su línea de Estado; arranca con el pedido textual de Guido
    tiempos.md             ← la tabla de tiempos de C: registro, sin tope (solo si hay director)
    relevamiento/          ← los documentos de /relevamiento, si el módulo nació de uno
    planes/                ← los planes y las fichas de tramo (solo si hay director)
    bitacora/              ← la historia sin tope: un archivo por fecha o por encargo, NUNCA uno que crece (solo si hay director)
  referencia/              ← ARCHITECTURE.md, DECISIONS.md (ADR con índice), REJECTED.md, PRUEBA.md, trampas.md, accesos (nombres, no valores), glosario
  archive/                 ← solo lo que murió de verdad (banners viejos, docs superados). Los módulos NO vienen acá
```

- **La raíz de `docs/` tiene exactamente seis archivos y tres carpetas** (el `MAPA.md` puede faltar). Lo que no encaja en ninguna
  fila **va a `referencia/`**: es corrector, no pregunta (el Hub decía "preguntar antes de inventar una carpeta"; acá no se pregunta).
  Dentro de las carpetas, cualquier extensión (mockups `.html`, PNG, PDF) pasa: el candado mira solo la raíz y las rutas citadas.
- **Lo que hoy va suelto y a dónde se redirige** (los archivos **conservan su nombre**: menos rutas rotas, y grep los encuentra igual):
  `DECISIONS.md`, `REJECTED.md` y `ARCHITECTURE.md` → `referencia/` · `docs/superpowers/specs/` (lo que escribe brainstorming) y
  `docs/SPEC-*.md` (lo que escribe hoy el Arquitecto) → `modulos/<x>/SPEC.md` · **el archivo público de datos de prueba** que F §9 le
  pidió a B (cuentas de prueba, llaves públicas) → `referencia/PRUEBA.md` (la ficha del kit lo apunta en `datos-de-prueba:`) · **el
  registro de frenos** (A §4; F §21 proponía `docs/frenos.log`) → **`.claude/frenos.log`**: es del método, no del proyecto, igual que la
  ficha del kit. Y **las decisiones tienen dos alturas**: una que afecta a más de un módulo es un ADR de la app (`DECISIONS.md`); la de
  un solo módulo va en su ficha (una línea) y en su spec (el porqué).
- **El relevamiento no cambia dónde nace**: sigue en `_relevamientos/`, fuera de todo repo (su SKILL l.24: nunca adentro de uno). Lo
  que cambia es **el destino de la mudanza** al terminar: hoy `<repo>/docs/relevamiento/<slug>/`; pasa a `modulos/<slug>/relevamiento/`
  si parió un módulo, o a `referencia/relevamiento/` si parió el proyecto entero (está al lado del `SPEC-0`). El paso 6-bis de `/cierre`
  pasa a buscar `docs/**/relevamiento/TABLERO.md`. Son cambios de ruta en dos skills del kit, en la misión 5.
- **El `SPEC-0.md` del Modo A** sigue en la raíz del proyecto mientras es borrador o READY (el Arquitecto lo busca en `*/SPEC-0.md`);
  al implementarse va a `referencia/SPEC-0.md` con `COMPLETO <fecha>`: es el plano de nacimiento de la app, no de un módulo.
- **Se adopta del Hub**: `referencia/` y `archive/` con esos nombres (el `/cierre` del molde ya decía `docs/archive/`) y el test de
  estructura. **Se aparta del Hub** en los specs: no van a `specs/` + `archive/specs/`, viven siempre con su módulo (§5). El Hub es el
  primer caso real y se le ofrece la migración en el piloto.
- **`docs/README.md` no repite el mapa**: el mapa de documentación (qué carpeta, qué va, qué manda sobre qué) vive **una sola vez**, en
  el `CLAUDE.md` (§15). El README de `docs/` es la puerta para un humano que llega por GitHub: tres líneas que apuntan al `NORTE.md`, al
  `MAPA.md` y al mapa del `CLAUDE.md`, más **la tabla de mudanza** de rutas viejas cuando hubo migración (para que el CHANGELOG y las
  actas sigan legibles). **Sin lista de archivos**: eso envejece; lo listan `ls` y las fichas.
- **El Arquitecto** pasa a buscar borradores en `docs/modulos/*/SPEC*.md` con `Estado: BORRADOR`; sigue mirando `docs/SPEC-*.md`
  y `docs/specs/` para adoptar proyectos que ya andan (E §7).
- **El SQL no es documentación**: va en una carpeta del código (`db/` o la que fije el stack). No se estandariza.
- **Alternativa descartada**: inventar nombres propios del kit. Hay un caso real andando desde hoy, diseñado mirando el molde.

*Qué cambia para Guido*: "¿dónde está el spec de X?" tiene una sola respuesta en los 10 proyectos. Abre un repo y `NORTE.md` le dice
qué es; `MAPA.md`, con qué se conecta.

## 5. El módulo: la ficha y la historia (decisión 2)

**La ficha** (`modulos/<nombre>/README.md`) es el estado del módulo, y es la ficha del subproyecto que diseñó C (§2.3, §2.6), repartida
en dos archivos para que el estado no se llene de historia. **Tope de 5.000 bytes mientras el módulo está `EN OBRA` o `PAUSADO`** (es
lo que el hook puede inyectar); un módulo `COMPLETO` ya no se inyecta y su manual puede ser más largo. Sus secciones, en este orden:

1. Cabecera legible por script: `Estado:` (§13) · `director: sí/no` · `parte-de:` (si es hijo de una iniciativa) · `rama:` (solo si el
   módulo se construye en una rama propia; si no, no está).
2. Qué es el módulo y para qué, en 3 líneas, con la fecha del pedido. **El pedido de Guido, textual, va como primera sección del
   `SPEC.md`**, no acá: un pedido dictado pesa 2-3 KB y se comería la ficha, y el spec es lo que lee la sesión fresca que ejecuta.
   Los encargos parafraseados son los que fallan (8 de 11 con un dato falso; gentle-ai lo midió también), así que el textual tiene
   que estar; en el spec está donde se usa.
3. Fase y **próximo paso concreto**.
4. **Las tareas**: una línea por tarea con `[x]`/`[ ]`, tildada solo con evidencia (el commit). Si hay director, el detalle de tiempos
   vive en `tiempos.md` (§5bis) y la ficha trae solo el total: "6 de 9 tareas · 14 h máquina · 3 h con Guido · estimado lo que falta: 5 h".
5. Decisiones cerradas del módulo (una línea cada una; el porqué largo, en el spec o la bitácora).
6. Pendientes del módulo y **"te espera"** (lo que necesita de Guido, por la lista de 4 de A). **Acá vive el "te espera" del
   módulo**: el handoff y `/estado` lo derivan de acá y del TODO, no lo escriben de nuevo.

Al terminar, `Estado: COMPLETO <fecha>` y la ficha pasa a ser **el manual del módulo**: qué hace, cómo se usa, qué no toca; la lista de
tareas se borra (queda en `tiempos.md` y en git). **La carpeta se queda en `modulos/`**: hoy Cuenta Corriente está en 4 lugares; con
esto está en uno y se encuentra.

**Un solo dueño por ficha**: el director si lo hay; si no, el `/cierre` de la sesión que trabajó el módulo. Nunca los dos: si Guido
trabaja en una sesión suya sobre un módulo con director, su `/cierre` **no toca la ficha**; deja un archivo en `bitacora/` ("lo que hizo
esta sesión") que el director lee y vuelca. Cómo se entera el director es del buzón de G.

### 5bis. `tiempos.md`: la tabla de C, como registro (solo con director)

La tabla de C §2.6 (tarea · estimado · real de máquina · real con Guido · tokens · ¿más o menos compleja de lo previsto, y por qué?)
vive en `modulos/<x>/tiempos.md`, **sin tope**: C la quiere acumulada "para estimar mejor en el futuro", y eso no entra en una ficha
que se sobreescribe. Lo mecánico lo llena un script desde git; la estimación y el "por qué", el director. **Nace con el director**: C la
pidió para él (es él quien estima); en un módulo solo sería "por las dudas", y las tareas con su commit ya están en la ficha. **En una
iniciativa con hijos, la tabla vive solo en las hojas**; la ficha de la iniciativa agrega los totales. `/estado <x>` la lee de acá.

**Las reglas que lo sostienen:**

- **Estado e historia nunca en el mismo archivo.** La ficha dice cómo está hoy; lo que cambió va a la bitácora (o al CHANGELOG, si no
  hay bitácora). Es la regla del handoff bajada al módulo. El "antes era…" en la misma línea, el "estado ahora" apilado por fecha
  y las fichas de tramo dentro del tablero son exactamente lo que se prohíbe.
- **La bitácora es una carpeta de archivos chicos**, no un archivo que crece: `bitacora/2026-10-22-encargo-07.md`,
  `bitacora/2026-10-22-relevo.md`. Nadie la lee entera; el obrero lee **su** encargo (3 KB) en vez de 336 KB para encontrarlo, y
  **escribe su evidencia en ese mismo archivo**: es lo único de `docs/` que toca un obrero. Un índice de una línea por archivo lo
  arma un script si hace falta; no se escribe a mano.
- **Dónde nace y dónde se construye.** El módulo **nace en `main`**: un commit con la carpeta, la ficha y el spec en `BORRADOR`, así
  el hook, el TODO y `/estado` de cualquier sesión lo ven desde el primer día. **Se construye donde se construye el código**: en `main`
  si es un módulo solo (sin rama de más: criterio 9), o en su rama con worktree si tiene director y obreros que escriben a la vez
  (Hermes ya aprendió que eso pide rama aparte). La cabecera dice `rama:` solo en el segundo caso, y entonces el hook y `/estado`
  leen la ficha y la bitácora por `git show <rama>:docs/modulos/<x>/…`, como hace hoy Mobile con `origin/main`, para que `main` nunca
  muestre una ficha vieja. Al mergear, la ficha vuelve a `main` con el código. Cómo se nombran ramas y worktrees por módulo lo fija H.
- **Una iniciativa que agrupa módulos** (un tramo largo con varios módulos adentro) es un módulo más, y sus hijos llevan
  `parte-de: <iniciativa>` en la cabecera. **Todo plano, sin carpetas adentro de carpetas**: los scripts, el hook y `/estado` leen
  `modulos/*/README.md` y arman el árbol por `parte-de:`. Son los tres niveles de C §2.2 (proyecto · iniciativa · tareas) con un
  paso más cuando hace falta; el "subproyecto" de `/estado <x>` es cualquier módulo, hoja o iniciativa. Un módulo que **cruza dos
  repos** (una identidad compartida entre dos apps) tiene una ficha en cada repo; cómo se enlazan es de G y H.
- **Un pendiente vive en un solo lugar**: si es del módulo, en su ficha; el TODO global tiene lo de la app. Nunca el mismo ítem en
  los dos. Es criterio del modelo en el cruce del cierre (§11.1): ningún script compara frases.
- **Un cambio de pedido reescribe solo la parte afectada** del spec y reabre solo su tarea (de gentle-ai). No se rehace el spec entero.
- **La marca `> Histórico`** en las primeras 10 líneas de un archivo lo saca de los chequeos de rutas (§14) y le avisa a quien lo abre
  que es registro. Es "las actas no se editan", legible por script.
- **El spec** sigue el formato del kit (`formato-spec.md`: SPEC-0 o delta) con dos diferencias que se escriben en la misión 5: arranca
  con **"Pedido original, textual"**, y **no se archiva al implementarse**: su línea de Estado dice `COMPLETO <fecha>` y se queda con su
  módulo.

*Qué cambia para Guido*: "¿cómo va X?" tiene una ficha de una pantalla, siempre al día, en un lugar fijo; y un módulo que termina no
se pierde en un archivo, queda como su documentación.

## 6. Tres tamaños, una sola estructura (decisión 3)

| Tamaño | Qué tiene en `docs/` | Quién mantiene la ficha | La historia |
|---|---|---|---|
| **Chico** (un hotfix, un ajuste) | Nada. Se hace en el chat | — | La entrada del CHANGELOG y git |
| **Módulo solo** (Guido con una sesión) | `modulos/<x>/README.md` + `SPEC.md` | `/cierre`, en cada sesión | El CHANGELOG y git |
| **Módulo con director** | Lo anterior + `tiempos.md` + `planes/` + `bitacora/` | El director, al cerrar cada tramo | La bitácora (encargos, relevos, evidencia) |

- **La prueba de tamaño la aplica el Arquitecto**, única puerta (E §2), con **dos preguntas**: ¿se retoma solo con el pedido más el
  `git diff`? ¿lleva más de una sesión? **Si alguna es sí, es módulo**; si ninguna, chico. Contar archivos o líneas no decide (criterio
  de gentle-ai, medido por ellos: n=1, NO VERIFICADO). **Que toque datos reales, plata o producción no lo hace módulo**: eso lo cuidan
  las 4 preguntas de A y la red de F ("con permiso, igual con red"), no un spec. Si fuera módulo por eso, un hotfix en producción pagaría
  carpeta y spec, que es lo que el criterio 9 prohíbe. Cuándo un módulo lleva director lo decide H, y lo decide el Arquitecto con Guido
  al armar el módulo.
- **Si algo arrancó chico y creció** (ya lleva dos sesiones), **`/cierre` aplica la misma prueba** y crea el módulo desde el molde, con
  lo que haya: el pedido original y lo hecho hasta ahí. No hace falta volver al Arquitecto.
- **La bitácora y `tiempos.md` nacen solo con el director.** Es lo que el director ya escribe hoy (encargos, relevos, evidencia de
  tramo, tiempos), archivado en archivos chicos. Sin director, no existen: la historia son el CHANGELOG y git.
- **La misma carpeta, más o menos archivos.** Pasar de "solo" a "con director" es agregar tres cosas; no se reorganiza nada.

*Qué cambia para Guido*: una feature que hace él solo entra en el mismo sistema que un tramo de Hermes, sin pagar el traje grande
(criterio 9). Un hotfix se hace y ya.

## 7. Quién mantiene la estructura sin que nadie lo pida (decisión 4)

Cuatro momentos, todos automáticos; ninguno le pregunta nada a Guido.

| Momento | Quién | Qué hace |
|---|---|---|
| **Al nacer** | El Arquitecto (Modo B, o la puerta que fije H) | Guido dice "quiero pensar X". El Arquitecto aplica la prueba de §6; si es módulo, **crea la carpeta desde el molde** y la commitea en `main`: la ficha, y el `SPEC.md` en `BORRADOR` con el pedido textual arriba. Guido no elige carpeta ni nombre de archivo |
| **Al escribir** | Un hook `PreToolUse` sobre `Write` (script node del molde) | Si una sesión intenta crear un archivo **en la raíz de `docs/`** que no sea uno de los seis, o una carpeta que no sea una de las tres, **lo frena en el momento** y dice dónde va: "`docs/X.md` no va ahí: a `modulos/<x>/` o a `referencia/`". **Juzga solo la ruta que se está escribiendo**, nada más: no mira el contenido ni el resto del árbol, así no frena al Arquitecto creando un módulo ni al `/cierre` escribiendo el handoff. Lo que escribe Bash (`cat >`, `mv`) se le escapa: lo agarra el candado del cierre. Corrector, no pregunta (A §3). **Se construye con la receta de A §5**: medido contra los `Write` reales de los chats antes de instalar (cuántos habría frenado, cuántos eran legítimos), con su prueba de casos y el mensaje con la alternativa. **Se prende en la ficha del kit recién cuando el árbol cumple** (§14): en un repo adoptado sin migrar queda apagado |
| **Al cerrar la sesión** | `/cierre` | Actualiza la ficha del módulo en el que trabajó si es suya (§5: dueño único), el handoff, el TODO (§10) y el CHANGELOG. Corre **el candado completo** (§14): rutas, topes, estados. Si falla, arregla antes de commitear. En `cierre parcial` corre solo el tope del handoff |
| **Al arrancar** | El hook de arranque (§9) | Lee las fichas por script (por `git show` de cada `rama:`, o del disco si no hay) y lista los **módulos activos** (nombre · fase · próximo paso, una línea cada uno). Si la rama o el worktree de la sesión llevan el nombre de un módulo, inyecta la cabecera de esa ficha |

- **El director es el dueño de la ficha de su módulo**: la **sobreescribe** al cerrar cada tramo (como hoy con el tablero, pero sin
  apilar), archiva cada encargo y cada relevo en `bitacora/` al emitirlos, y actualiza `tiempos.md` con lo que el script trae de
  git. **Los obreros escriben solo en su encargo** (la evidencia, dentro del mismo archivo de la bitácora). Esto se escribe en las
  skills del director y del cierre en la misión 5 (C §3bis ya lo pide para los tiempos).
- **Por qué un hook al escribir y además el candado del cierre, si F §10 prohíbe el freno duplicado**: F prohibía correr gitleaks dos
  veces **sobre el mismo evento** (el mismo commit). Acá son dos eventos distintos con el mismo script: al escribir (frena el archivo
  suelto antes de que lo citen otros seis) y al cerrar (la red para lo que entró por Bash, más los chequeos que solo tienen sentido con
  el árbol entero: rutas, topes, estados). Cada frenada va una sola vez al registro. El cierre solo lo atraparía igual, pero una sesión
  que escribió 6 archivos en el lugar equivocado los tiene que mover al final, con las rutas ya citadas: es el arreglo del arreglo
  (criterio 4). Pasa el filtro: corrige un error real (111 specs planos; Cuenta Corriente en 4 lugares), hace el sistema consistente y
  no requiere que Guido sepa nada.

*Qué cambia para Guido*: nada que recordar. El desorden se frena cuando nace, no se acumula.

## 8. El handoff: tope y secciones fijas (decisión 5)

- **Tope: 5.000 bytes** (lo mide un script; en bytes, así las tildes juegan a favor). Es lo que queda del presupuesto de §9 después
  de la cabecera, las líneas de F y E, los módulos, el TODO y git. El Hub eligió 5.500 sin nada de eso y le sobra; el de vibe-kit hoy
  pesa 4.900 con secciones que se van. El número se ajusta con lo que mida el piloto, no se discute ahora.
- **Secciones fijas, en este orden** (lo importante primero, porque si algo se corta es el final): Estado (rama · entorno, con los
  accesos temporales a producción y su fecha de borrado, F §12 · **Producción**: estado · fecha · cómo se verificó, o `REPORTADO POR EL
  USUARIO`, P55) · Próximo paso concreto · Bloqueos · Te espera (derivado de las fichas y del TODO, §5) · En curso · Contexto que no
  está en otro doc.
- **Se van** "qué se hizo" (es la entrada del CHANGELOG de esa misma sesión), "archivos tocados" (lo dice `git show --stat`) y la
  línea "Cierre: fecha · último commit": **la imprime el hook** por `git log -1 --format='%h %ci' -- docs/SESSION_HANDOFF.md`
  (criterio 6), y `/inicio` la usa igual para el cruce con git y la regla de los 7 días. Hoy se escriben tres veces (criterio 2 y 5).
- **Si al cerrar no entra, no se apila**: el detalle va al CHANGELOG, las trampas nuevas a `referencia/trampas.md` (§13), los
  pendientes de sesiones anteriores al TODO. El script del candado se lo dice al `/cierre` antes de commitear.

*Qué cambia para Guido*: un handoff que se lee en un minuto, y nunca más un save game de 500 KB.

## 9. Lo que inyecta el hook, con presupuesto y huella (decisión 6)

**Un solo script en node** (`.claude/hooks/session-start.js`, llamado desde el `session-start.sh` de una línea). Por qué node: F ya
lo pide para sus 3 líneas (F §15); `head -c` en bash parte las tildes; y contar caracteres (lo que corta la plataforma) y no bytes
es trivial en node y frágil en bash. Node ya es dependencia del molde por `check-code.js`. **Depende de que la ficha del kit se pueda
leer sin librerías**: node no trae YAML; F y E definen el subconjunto (o frontmatter en JSON) en la misión 5.

**Presupuesto total: 9.500 caracteres** (500 de margen bajo el corte; un emoji cuenta 2 en JS y cómo cuenta la plataforma es NO
VERIFICADO, el margen lo cubre). Suma en el peor caso, **con** un módulo activo:

| Bloque | Tope | De dónde |
|---|---|---|
| Cabecera: proyecto · rama · versión del kit y **"hay kit nuevo / esta PC está atrás"** (E §8) · nivel · modo de permisos · fecha y commit del handoff | 250 | La ficha del kit (E §4), E §8, F §15, git |
| Las 3 líneas de F (barreras, hook anti-secretos) | 300 | F §15 |
| El handoff | 5.000 | §8 |
| Módulos activos: una línea cada uno | 300 | las fichas, por `git show` o disco |
| La cabecera de la ficha del módulo, si la rama o el worktree son de un módulo | 1.000 | §5 |
| La cabecera del TODO (solo 🔴 y 🟠), cortada en un ítem entero | 1.500 | §10 |
| git: 5 commits · estado hasta 10 líneas · **aviso si `origin/main` tiene un handoff más nuevo que el local** ("hace N commits: hacé pull"; sin `fetch`, con lo ya traído, como resolvió Mobile para sus dos carriles, P47) | 800 | git |
| Títulos de bloque, el recordatorio de `/inicio` y la **huella** `inyectado: N caracteres de 9.500` | 250 | el script |
| **Total** | **9.400** | |
| Lo propio del proyecto (`session-start.propio.sh`, E §5) | lo que quede; se recorta primero | el proyecto |

- **Si algo se pasa, recorta en orden** (lo propio → contexto del handoff → TODO → módulos → handoff) y **lo dice**: "CORTADO: leé el
  resto en `docs/SESSION_HANDOFF.md` antes de confiar en lo de arriba". Nunca en silencio. `/inicio` lee el resto cuando ve esa palabra
  (el Hub ya lo escribió así).
- **La huella es la lección de Desktop**: medía lo que emitía (13 KB) y no lo que la sesión recibía (2 KB); "medir al receptor, no
  al emisor". Un número que se ve en todas las sesiones no crece en silencio.
- **Los vencimientos no van acá** (`espera hasta:` del TODO, `hasta:` de los frenos): F §14 ya decidió que gritarlos en cada sesión es
  una pregunta repetida, también a los obreros de noche. Van a `/estado` y al "te espera" de C.
- **Alternativa descartada**: que el hook derive datos por script, como Desktop (~1.800 caracteres a partir de su tablero). Es lo
  mejor para ese proyecto, pero cada derivación es propia de él: no es molde. Lo propio va en el hermano `.propio.sh`.
- **Lo que sigue sin tope porque no se inyecta**: CHANGELOG, decisiones, bitácoras, `tiempos.md` (§11).

*Qué cambia para Guido*: la sesión arranca viendo todo, o le dice qué no vio. Nunca más "arrancó ciega" sin saberlo.

## 10. El TODO que no miente (decisión 7)

- **Ningún ítem lleva fecha escrita a mano**: la edad la da git (`git blame --line-porcelain docs/TODO.md`, una sola pasada), que sabe
  cuándo se escribió y cuándo se tocó por última vez cada línea. Escribirla a mano sería lo que el criterio 6 prohíbe: que el modelo
  anote lo que un script calcula.
- **La cabecera es solo 🔴 y 🟠**, y es lo que ve el hook. 🟡 y 🟢 van abajo. **Los pendientes de un módulo no van acá**: van en su ficha
  (§5); el hook ya lista los módulos activos, así que no hace falta repetirlos.
- **Un ítem que espera algo de afuera** lleva `espera hasta: <fecha>`. Solo fecha, como el `hasta:` de F §14: un evento ("cuando
  responda el proveedor") no lo evalúa ningún script. Los vencidos los lista `/estado` y el "te espera" de C, **no el hook** (§9).
  Evidencia: una cláusula cumplida que nadie retomó en 17 días (S-M-10).
- **Lo que lleva 90 días sin tocarse baja solo a 🟢 "algún día"** en el cierre, por la edad que da `git blame`. **Excluye los 🔴 y los
  que tienen `espera hasta:`**: lo crítico no se esconde solo. Corrector, no pregunta: no se le pide a Guido que pode.
- **El cierre imprime el balance en una línea**: `TODO: +3 −2 · 41 ítems · 5 bajaron a 🟢`. Un número visible no miente por acumulación.
- **Por qué no un tope al TODO entero**: lo que se inyecta es la cabecera, y esa ya tiene tope (§9). Ponerle tope al archivo sería
  "por las dudas".

*Qué cambia para Guido*: lo de arriba del TODO es lo que importa y es de verdad.

## 11. `/cierre` cruza, y no relee registros enteros (decisión 8)

Tres reglas nuevas en la skill del molde:

1. **Cruce anunciado contra anotado** (S-U-7): cada pendiente que el handoff nombra tiene su ítem en el TODO o en la ficha de su módulo,
   y en uno solo; cada 🔴 del TODO que el handoff da por resuelto se borra; cada tarea que la sesión dio por terminada está tildada en
   la ficha con su commit. Es criterio del modelo (no hay script que compare frases), pero es una regla de dos líneas y evita 3 de 4
   pendientes perdidos.
2. **Para agregar al tope del CHANGELOG o de `referencia/DECISIONS.md` se leen solo las primeras 20 líneas.** Hoy agregar una entrada
   a un CHANGELOG de 457 KB lo relee entero. Y para releer el TODO en el cierre, solo la cabecera y los ítems que la sesión tocó.
3. **Los registros no llevan tope** (CHANGELOG, decisiones, bitácoras, `tiempos.md`, los contratos-historia): nadie los lee enteros,
   se buscan con grep, y las decisiones tienen índice al tope (playbook §1.3). Rotarlos por año sería "por las dudas". **La regla es
   de lectura, no de tamaño**: ningún ritual del molde ni skill de director lee entero un archivo que no sea el handoff, la cabecera
   del TODO o una ficha. Lo demás, por índice, grep o extracto. El candado (§14) **lista** los documentos de más de 100 KB que alguna
   skill del proyecto **cita**; si la skill manda a leerlo entero lo juzga el modelo al leer la lista, no el script.

*Qué cambia para Guido*: cierres más baratos, y un TODO que coincide con lo que la sesión le contó.

## 12. El plano de la app: `NORTE.md` y `MAPA.md` (decisión 9)

- **`docs/NORTE.md`**, una pantalla: qué es la app, para qué, para quién, **qué NO hace**, y **los hechos que solo sabe Guido** y no
  están en el código (cómo se usa de verdad, qué pasa si se cae). Es el "README de GitHub al principio", pero para los agentes
  también (P7, ~28 lotes). **No lleva la lista de módulos** (se deriva de las fichas y la muestra el hook) ni "quién lo opera" (vive
  en el Hub, E §4).
- **`docs/MAPA.md`**, una pantalla: **cómo se conecta por dentro** (un diagrama en Mermaid **a nivel módulos**: módulos, base, servicios;
  lo pidió Guido textualmente) y **con qué otras apps** (los acuerdos vigentes, cortos: qué comparte, quién escribe qué). La
  arquitectura a fondo (hoy 61 KB en Desktop) va a `referencia/ARCHITECTURE.md`; el MAPA la apunta. **Puede no existir** en un
  proyecto sin conexiones ni módulos (un repo de método, un relevamiento).
- **El MAPA y el Hub responden preguntas distintas, y B no decide por I.** El `MAPA.md` es la fuente de "con qué se conecta **esta
  app**", técnica, escrita por quien construye y viajando con el código. El Hub tiene "se conecta con" para **toda la empresa**, que
  incluye sistemas sin repo y lo de negocio (TABLERO §10; Guido decidió que el Hub es el registro, E §2.3). Que lo técnico no se
  escriba dos veces (por ejemplo, que el Hub lea el MAPA de cada repo por script para precargar su tabla) **lo resuelve el racimo I**;
  acá queda anotado el riesgo de doble registro.
- **Quién los escribe y cuándo cambian**: el Arquitecto al montar (Modo A: la entrevista ya tiene todo eso) o `/relevamiento`; al
  **adoptar** un proyecto (E §7), los arma desde el README, el `CLAUDE.md` y el código, y los muestra **dentro del mismo OK de
  adopción** que E ya cuenta (una vez por repo); la sección de hechos que solo sabe Guido puede nacer vacía y llenarse cuando
  aparezcan. **El MAPA tiene disparador**: el spec delta de un módulo declara si toca una conexión o suma un módulo (es una línea de
  su esqueleto), y entonces el Arquitecto lo actualiza al cerrar el módulo. Sin eso, envejece como el ARCHITECTURE de 61 KB.
  **El hook no los inyecta**: los lee el Arquitecto en Modo B y quien dude del "para qué".
- **Los contratos entre apps** (hoy 314 y 524 KB, en espejo en dos repos) se parten: los acuerdos vigentes van cortos al `MAPA.md` de
  cada lado; el registro de mensajes entre directores es historia y va a `referencia/contrato-<app>/` como bitácora (archivos chicos
  por fecha, §5). El director deja de releer 314 KB antes de cada mensaje. Cómo viajan esos mensajes en adelante es del buzón de G.
- **Lo que no es de la app**: la vista de toda la flota ("qué tenemos y cómo se cruza") es del racimo I y vive en el Hub. `MAPA.md` es
  de **una** app.

*Qué cambia para Guido*: cero preguntas nuevas recurrentes (sale de lo que ya contestó) y los agentes dejan de inventar para qué sirve
el proyecto.

## 13. Estados, lo aprobado y las trampas (decisiones 10 y 11)

- **Los specs** siguen el ciclo que el Hub ya usa, en su línea de Estado: `BORRADOR → READY → EN CURSO → COMPLETO <fecha>`. **No se
  archivan**: se quedan con su módulo. La ficha del módulo tiene sus propios estados: `EN OBRA · PAUSADO (hasta <fecha>) · COMPLETO ·
  ABANDONADO (por qué)`; los nombres finos los cierra H con los niveles. El candado compara el módulo contra **su spec más nuevo**
  (`SPEC.md` COMPLETO con `SPEC-2.md` EN CURSO y el módulo EN OBRA es legítimo).
- **Lo que Guido aprobó no se pisa, se versiona** (S-R-7: una ficha aprobada sobreescrita). Una línea en el `CLAUDE.md` del molde. Si
  hay que cambiar algo aprobado, se escribe la versión nueva al lado y la vieja lleva `> Histórico`.
- **`referencia/trampas.md` viene de fábrica**, vacío con su cabecera. Es donde van las "cosas que muerden": lo que costó descubrir y
  la próxima sesión no tiene por qué volver a pagar. También es **el desborde del `CLAUDE.md`**: una regla operativa que no pasa el
  test "si la borro, ¿Claude se equivoca?" va acá, no al rol. Pasa la regla de 3+: el Hub (23 KB mudados del handoff), nuestro
  handoff (7 ítems) y los documentos de método de Hermes lo son de hecho.
- **Lo que un proyecto aprende del método** no es de la app: lo que es trampa del proyecto va a `trampas.md`; lo que es lección del
  método **vuelve al kit** (criterio 11), que es para lo que existe la misión 6. El molde no trae `docs/metodo/`.

*Qué cambia para Guido*: lo que dijo que sí queda intacto; el handoff y el `CLAUDE.md` quedan cortos sin perder las lecciones.

## 14. El candado de estructura (decisión 12)

**Un script del molde, no un test del proyecto**: `.claude/scripts/estructura.js`, node, para que sirva en cualquier stack (el del Hub
es vitest; la idea es suya). Lo corre el hook de escritura (§7, solo la regla 1 sobre la ruta que se escribe), `/cierre` antes de
commitear (todo; en `cierre parcial`, solo la 3 sobre el handoff) y `doctor` (E §10) para toda la PC. Cada chequeo tiene **su id**, para
poder quitarlo por proyecto en `frenos.quitados` con razón y `hasta:` (F §14):

| Id | Qué chequea |
|---|---|
| `candado:raiz` | La raíz de `docs/` tiene solo los 6 archivos y 3 carpetas de §4 (el MAPA puede faltar), y cada carpeta de `modulos/` tiene su `README.md` con `Estado:` |
| `candado:rutas` | Las rutas que citan `CLAUDE.md`, `docs/README.md`, el TODO, el handoff, las fichas y `referencia/` existen (excluye lo marcado `> Histórico` y el CHANGELOG, que son registro). Las carpetas del repo salen de `git ls-files`, no de una lista escrita a mano |
| `candado:topes` | El handoff y cada ficha `EN OBRA` o `PAUSADO` entran en su tope; lo que inyectaría el hook entra en 9.500 (lo calcula llamando al mismo script del hook) |
| `candado:estados` | Ningún spec más nuevo de un módulo está `COMPLETO` con el módulo `EN OBRA`, ni al revés; **un módulo no pasa a `COMPLETO` con tareas sin tildar** (se chequea en el cierre que lo marca; después la lista ya no está) |
| `candado:lecturas` | Lista los documentos de más de 100 KB citados por alguna skill del proyecto (§11.3). Solo lista, nunca frena |

- **Corrector, no pregunta** (A §3): cada falla dice qué hacer ("`docs/X.md` suelto: a `modulos/<x>/` o `referencia/`"), el agente lo
  arregla y el cierre sigue. Cada vez que frena deja su línea en el registro de frenos (`.claude/frenos.log`, §4): si en 3 meses no frenó
  nada, se revisa (regla 3 de A).
- **Se prende por proyecto cuando el árbol cumple**: en la ficha del kit, `piezas: candado: molde`. Un repo adoptado arranca con el
  candado apagado y el adoptador lo prende al terminar la migración (§17).

*Qué cambia para Guido*: nada que hacer. El desorden se frena solo.

## 15. El `CLAUDE.md` del molde, por los 11 criterios (decisión 13, pedido de Guido)

El rol que carga cada chat se reordena alrededor de los 11 criterios del PLAN: **cada criterio pasa a ser 1-3 líneas operativas, en
criollo**, y las reglas de hoy se reubican bajo el criterio que las justifica. Lo que no cae bajo ninguno se saca o va a `trampas.md`.
Sigue el test por línea: el objetivo es que quede **más corto**, no más largo. **Aplica a los proyectos nuevos y a los que se adoptan**
(el adoptador lo propone dentro de su OK): el `CLAUDE.md` es del proyecto (E §5) y el actualizador no lo toca.

| # | Criterio | Qué dice el `CLAUDE.md` (borrador de las líneas) | Reglas de hoy que absorbe |
|---|---|---|---|
| 1 | Menos intervención | Sección **Autonomía**: "resolvés solo todo, producción incluida; preguntás solo las 4 cosas de la ficha del kit (`sensible:`); si algo de afuera parece necesitar pregunta, proponés sumarlo a la lista" (S-U-6) | "No freno a pedir permiso intermedio" |
| 2 | Pragmático | "Lo chico se hace en el chat; antes de agregar una regla, un doc o una pieza: ¿corrige un error real?" | La regla de 3+; el test por línea |
| 3 | Medible | "Todo cambio de método dice cómo se sabrá si anduvo" (P2) | — |
| 4 | Software que anda | "Un bug está resuelto cuando se reprodujo y se vio andar; todo cambio con su prueba; evidencia real o NO VERIFICADO" | Las reglas de evidencia 1, 2 y 5 |
| 5 | Tokens y modelo justo | "No releés lo que el hook ya inyectó; registros por grep y primeras 20 líneas; el modelo de cada subagente lo fija la política de D; después de compactar, Read antes de Edit" | Evidencia 4; "NO los releas" de `/inicio` |
| 6 | Script antes que modelo | "Lo que puede calcular un programa (estado, versión, tamaños, fechas) no lo escribís a mano" | — |
| 7 | Seguro por defecto | "Secretos: nunca en el chat ni en un archivo versionado; `cargar-secreto`; usar sin ver" (F §7.2) | Restricción dura 2 |
| 8 | Portable | "Sin rutas absolutas; lo que vale para otra PC va al repo, no a la memoria de esta" | — |
| 9 | Lo chico no paga lo grande | "Chico, módulo solo, módulo con director: la prueba de dos preguntas la hace el Arquitecto (§6); un hotfix se hace y ya" | Evidencia 6 y 7 (spec: solo para módulos) |
| 10 | Autónomo con rastro | "Cada cosa que hacés solo deja commit, línea o tabla; la ficha es el estado, la bitácora la historia; lo aprobado no se pisa" | Restricción dura 1 (tabla "cambio / preservo") |
| 11 | Piloto antes de flota | "Un cambio de método se prueba en un módulo y se mide antes de proponerlo al kit; la lección va a `trampas.md` o al kit, no se queda en el chat" | — |

Más lo que no es criterio pero es del rol: qué es el proyecto (3 líneas, apuntando a `NORTE.md`), los comandos clave, el ciclo
(`/inicio` · `/cierre`), **el mapa de documentación con las carpetas y qué manda sobre qué** (§4; es la única copia del mapa), las
reglas operativas del stack (las que pasan el test; el resto a `trampas.md`), y comunicación (criollo, opciones con pros y contras y
una recomendación, qué cambió y no el proceso). El texto final se escribe en la misión 5 y pasa por el revisor frío de ese spec.

*Qué cambia para Guido*: el rol que carga cada chat es la vara que él definió, y nada más.

## 16. Engram queda en espera (decisión 14)

REFERENCIAS-EXTERNAS §5 dejó la condición: "si en B el tope y el índice no alcanzan, se prueba en un piloto". **No se prueba todavía**:
con el tope (§8-§9), los índices (el mapa del `CLAUDE.md`, el de decisiones), las fichas por módulo (§5) y `trampas.md` (§13), no hace
falta una memoria por MCP que guarda sola y vive en una PC. **El piloto mide dos cosas** para confirmarlo: caracteres inyectados al
arrancar (la huella) y documentos leídos enteros por sesión (`costos.py` sobre los transcripts). Si con la estructura nueva igual se
relee de más, ahí se prueba, en un proyecto.

## 17. Hermes y los proyectos que ya andan (decisión 15)

- **No se migra nada a mitad de un tramo** (regla del PLAN). El diseño deja el costo anotado para cuando cierre uno:
  - **Desktop**: ~75 archivos (la carpeta del tramo ya existe: cambia de lugar; más ~31 de specs y planes sueltos) y **partir el
    tablero de 1,7 MB** en ficha (lo vivo, ~70 mil caracteres), `tiempos.md` y bitácora (todo lo demás), que es lo caro: sus secciones
    tienen anclas citadas por título. Rutas a cambiar: el hook, dos hooks de git, dos tests, cuatro skills y el `CLAUDE.md`.
  - **Mobile**: ~40 archivos dentro de la carpeta del tramo y partir el ESTADO de 312 KB. Rutas: el hook, el hook de post-compactación,
    cinco skills y los agentes del tramo (NO VERIFICADO en los agentes).
  - **Lo delicado**: las bitácoras de los dos viven en **ramas aparte** con worktree y sparse-checkout por ruta. Con §5 ("la ficha y la
    bitácora de un módulo con director viven en su rama") eso deja de ser una excepción y pasa a ser la regla, pero la migración exige
    mover la rama y la configuración del worktree a la vez, o el merge choca. Y los dos repos se citan rutas entre sí (los contratos): se
    rompen en silencio.
- **La migración la hace el adoptador de E §7**, no el actualizador (E §5 dice que `docs/` es del proyecto y el actualizador no lo
  toca; E queda con esa nota). El adoptador muestra el plano por repo ("esto va acá") **dentro del OK de adopción** que E ya cuenta,
  lo ejecuta, deja la tabla de mudanza en `docs/README.md` y prende el candado al terminar. **Lo que el adoptador trae** pasa de "los
  tres documentos del método" (E §7) a los seis de la raíz más `referencia/trampas.md` y `referencia/PRUEBA.md`, vacíos con su
  cabecera (nota a E).
- **Piloto** (recomendación, no decisión): el Hub (ya tiene la mitad del orden; le falta mover `specs/` + `archive/specs/` a `modulos/`)
  y Portal, como propuso E. Devoluciones después: es el que más duele (534 KB de handoff, 111 specs planos) y el que más va a mostrar.
- **vibe-kit mismo** adopta el árbol en el piloto, no ahora: `consulta/` → `referencia/`, los SPEC a `modulos/` (el `/relevamiento`, el
  `docs-fyd`, la investigación: cada uno fue un módulo), `legacy/` sigue en la raíz con sus lápidas. ADR-023 lo había postergado a esta
  misión; queda decidido acá y se ejecuta allá.

## 18. Cómo se sabe si funcionó (decisión 16; se mide con los scripts, cada mes)

| Medida | Hoy (2026-10-22) | Meta | Cómo se mide |
|---|---|---|---|
| Proyectos cuyo hook inyecta más de 10.000 caracteres | 2 de 10 (Bot, Panel del bot); 2 más al borde | 0 | `flota.py`: corre el hook de cada repo y mide la huella |
| Tamaño del handoff más grande de la flota | 534 KB | ≤ 5 KB en todos | `flota.py` |
| Documentos de más de 100 KB citados por una skill | Al menos 4 (tablero 1,7 MB, contrato 314 KB, encargos 336 KB, TODOs de 200+ KB) | 0 que se lean enteros | `candado:lecturas` en cada repo, y el juicio del modelo |
| Archivos `.md` sueltos en la raíz de `docs/` | Desktop ~40, Devoluciones ~20, Mobile ~15 (estimado del árbol) | 0 fuera de los 6 | `candado:raiz` |
| Rutas citadas que no existen | Sin medir | 0 | `candado:rutas` |
| Ítems del TODO con más de 90 días sin tocar | Sin medir (TODOs de 69-261 KB) | Se miden; bajan a 🟢 solos | el script del cierre, con `git blame` |
| Pendientes anunciados en el handoff sin ítem | 3 de 4 en un caso (S-U-7) | 0 | muestra mensual de cierres |
| Módulos terminados en más de un lugar | Al menos 1 (Cuenta Corriente, 4 lugares) | 0 | a ojo, en el piloto |
| Caracteres inyectados al arrancar (la huella) | 4.700-18.000 | ≤ 9.500, visible | la última línea del hook |
| Documentos leídos enteros por sesión | "Una receta lee 703 KB" | Baja; se compara con la línea base | `costos.py --desde` |

## 19. Preguntas nuevas a Guido, contadas (recuento después de las dos revisiones)

**Cero recurrentes.** Todo lo que frena, corrige y dice qué hacer. Lo que sí le llega:
- una línea en el "te espera" de C cuando un ítem con `espera hasta:` vence (no es pregunta: es aviso, y va por la salida única);
- **al adoptar un proyecto, un solo OK por repo**, el que E §7 ya contó, que ahora incluye tres cosas más que antes no: el `NORTE.md`
  y el `MAPA.md` armados desde el código, y el plano de migración ("esto va acá"). La sección "hechos que solo sabe Guido" nace vacía
  si él no agrega nada en ese OK;
- al armar un módulo, si lleva director o no (es la decisión de diseño que ya tomaba al abrir un tramo; H dirá cuándo es obvia y no se
  pregunta).

## 20. Lo que se va a otro racimo o queda en espera

| Qué | A dónde | Por qué |
|---|---|---|
| Los nombres de los tamaños (chico · solo · con director), cuándo un módulo lleva director, y los estados finos de la ficha | **H** | Es la forma de los niveles; B deja la estructura |
| Cómo se nombran ramas y worktrees por módulo (lo que el hook usa para saber "qué pestaña es") | **H** | B solo fija que la ficha de un módulo con director vive en su rama y que el hook lee por `git show` |
| La skill del director: sobreescribir la ficha, archivar encargos en la bitácora, llenar `tiempos.md`; y cómo recibe lo que dejó una sesión de Guido en `bitacora/` | Misión 5, con lo de **C** §3bis y el buzón de **G** | C ya lo pidió; B dice dónde |
| Cómo viajan los mensajes entre directores de dos apps (hoy, en el contrato); un módulo que cruza dos repos | **G** (y H) | B solo saca la historia del documento vivo y pone una ficha por repo |
| Que el Hub no duplique lo técnico del `MAPA.md` (leerlo por script, o dejar cada cosa en su registro) | **I** | El Hub es el registro de la empresa (E §2.3); el MAPA es de la app. B no decide por I |
| La vista de toda la flota (los MAPA juntos; documentos pasados de tamaño en los 10 repos) | **I** | Propio de la empresa; B deja el MAPA por app y la huella por repo |
| **`.claude/frenos.log` de solo agregar, escrito desde varias ramas y worktrees a la vez, choca al mezclar** (obreros en paralelo; el actualizador mezcla sin preguntar, E §6.7). Propuesta: un archivo por mes (`frenos-2026-10.log`) o por rama; o que el merge lo resuelva con `union` en `.gitattributes` | **A**, en la revisión integral | B eligió la ubicación y destapó el choque; el registro es de A |
| El subconjunto de YAML (o JSON) que node lee sin librerías en la ficha del kit | **E/F**, misión 5 | El hook de B depende de eso |
| Las rutas que cambian en las skills del kit (`/relevamiento`: destino de la mudanza y el 6-bis de `/cierre`; el Arquitecto → `modulos/*/SPEC*.md`; `/cierre` paso 5 → `referencia/`) y en `formato-spec.md` (pedido textual al tope; no se archiva) | Misión 5 | Son consecuencia de §4 y §5 |
| Las piezas nuevas en la ficha del kit (`hook-escritura`, `candado`, `session-start.js`), que `docs: molde` en E §4 son solo las plantillas del nacimiento (E §5 dice que `docs/` es del proyecto), y que el adoptador trae los seis de la raíz más trampas y PRUEBA | **E**, nota | Para que el actualizador y el adoptador sepan qué tocan |
| El nombre `referencia/PRUEBA.md` para el archivo público de datos de prueba | **F**, nota | F §5 y §9 lo dejaron a B |
| Engram | Piloto, misión 5 | §16 |
| Migrar Hermes, Devoluciones y vibe-kit | Misión 5, al cerrar un tramo | §17 |
| El arreglo chico del tope en el molde (`v2.4.3`), anotado en el TODO fuera de esta misión | Una sesión corta, apenas cierre B | Para que Bot y el Panel dejen de arrancar ciegos antes de la misión 5; con §9 como guía |

## 21. Límites de este diseño

- Los tamaños de Hermes y Devoluciones los midió un lector Opus por `gh` sobre `main`, hoy; las bitácoras viven en ramas aparte y pueden
  pesar más. Lo que dice cada skill que lee se tomó de su letra; qué hace de verdad la sesión (lectura parcial por límite de la
  herramienta) es **NO VERIFICADO**.
- La prueba de tamaño de dos preguntas viene de gentle-ai (su medición es n=1, NO VERIFICADO) y de nuestros 10 lotes de "feature
  chica sin chat nuevo" (P9, S-R-6). Se calibra en el piloto.
- El tope de 5.000 y el presupuesto de 9.500 son un reparto que suma (§9), no medido contra calidad de arranque. El piloto los ajusta.
- El hook de escritura (§7) y el candado (§14) no se probaron en Windows ni en bypass: van al piloto, junto con lo de F. Normalizar rutas
  (`C:\…\docs\X.md` a relativa), ignorar lo que está fuera del proyecto y los worktrees son detalles de construcción, NO VERIFICADOS.
- "Un pendiente en un solo lugar" es criterio del modelo en el cruce del cierre; no hay script que lo chequee.
- gentle-ai se leyó solo en su parte de documentación (~45 mil tokens); lo que no tiene (tope, carpetas, plano) es ausencia en lo
  leído, no certeza.
- Nada de esto se construyó: kit en `v2.4.2`.

## 22. Las revisiones (2026-10-22)

### 22.1 Antes de decidir: dos lectores

Pedidos por Guido ("mandá a alguien a revisar Hermes"): **uno sobre Hermes** (Opus, ~80 mil tokens: cómo está documentado hoy un tramo,
qué leen enteros los rituales, qué árbol quedaría) y **uno sobre gentle-ai** (Sonnet, ~45 mil: solo su parte de documentación). El de
Hermes cambió el racimo de fondo: de "adoptar lo del Hub" a "una carpeta por módulo con estado e historia separados".

### 22.2 El revisor frío (Opus, ~45 mil de lectura)

Un agente sin contexto de la charla, leyendo el borrador contra el PLAN, A, C, E, F, el molde actual y el test del Hub. Trajo **33
hallazgos**: 8 que rompían, 11 flojos, 10 que faltaban, 4 que sobraban. Cada uno pasó por el filtro de cuatro preguntas del PLAN: **30
aplicados, 1 recortado, 2 descartados.**

**Lo que rompía y se arregló** (8): la cuenta del presupuesto daba ~11.700 con un módulo activo (§9) · la raíz de seis archivos frenaba a
`/relevamiento` y al registro de frenos del propio kit (§4) · el hook de escritura frenaba al Arquitecto creando un módulo y a todo repo sin
migrar (§7: juzga solo la ruta; se prende cuando el árbol cumple) · los obreros "no tocan docs" pero el encargo vive en docs (§5) · tres
preguntas a Guido escondidas tras un "cero" (§4 pasa a corrector; §19 cuenta las de adopción) · la migración la hacía el actualizador, que
por E no toca `docs/` (§17: el adoptador) · `nivel:` con dos sentidos (§5: `director: sí/no`) · "la skill del director le dice al hook qué
módulo es", imposible porque el hook corre antes (§7, §9: solo por rama o worktree).

**Lo flojo que se ajustó** (11): la tabla de tiempos sale de la ficha a `tiempos.md` como registro (§5bis) · un solo dueño por ficha · la
tabla vive solo en las hojas · los vencidos no van al hook, contradecía F §14 (§9, §10) · `git blame` en una pasada en vez de `log -L`, y
lo 🔴 no baja solo (§10) · "un pendiente en un solo lugar" es criterio del modelo (§5, §21) · el spec se compara con su versión más nueva
(§13, §14) · `candado:lecturas` lista, no juzga (§11, §14) · el MAPA tiene disparador y el NORTE no lista módulos (§12) · la ficha y la
bitácora viven en la rama del módulo (§5) · el hook imprime fecha y commit del handoff (§8, §9). **Uno recortado**: "con qué se conecta"
quedaba en dos registros (§12; Fable lo volvió a recortar, abajo).

**Lo que faltaba y se agregó** (10): dónde va el SPEC-0 · mockups y PDFs pasan dentro de las carpetas · el candado en cierre parcial · ids
por chequeo para quitarlos · el MAPA opcional · lo chico que creció lo convierte `/cierre` (§6) · un módulo que cruza dos repos (a G y H) ·
`docs/README.md` sin lista de archivos · las piezas nuevas en la ficha del kit (a E) · a dónde van DECISIONS, REJECTED y los specs de
brainstorming (§4).

**Lo que sobraba** (4): **se sacó** la lista de módulos escrita a mano en el NORTE y en el TODO (se deriva de las fichas). **Se recortó** el
balance del TODO a una línea. **No se aplicaron dos**: sacar `espera hasta:` (tiene evidencia: S-M-10, 17 días sin retomar una cláusula
cumplida) y sacar el diagrama interno del MAPA (lo pidió Guido textualmente; queda a nivel módulos, no código).

### 22.3 La revisión de coherencia de Fable (pedida por Guido después)

Guido pidió que el propio Fable, con el diseño ya escrito, lo leyera contra **todo** lo decidido en A, C, E y F, el norte y el filtro, "a
ver si tiene coherencia, si las decisiones están bien tomadas, si me va a hacer mejor developer". Se leyeron los cuatro diseños enteros.
**20 correcciones**, aplicadas:

**Contradicciones** (8), con qué chocaban:
1. **La fecha de alta escrita a mano en el TODO** chocaba con el criterio 6 y con el propio B ("lo que calcula un script no se escribe a
   mano"): `git blame` da la edad sin que nadie la anote. Se sacó (§10).
2. **La tercera pregunta de la prueba de tamaño** ("¿toca datos, permisos o plata?") convertía un hotfix en producción en módulo con
   spec: chocaba con "un hotfix se hace y ya" y con el criterio 9. La seguridad la dan A y F, no la documentación. Quedan dos (§6).
3. **El módulo nacía en su rama**, así que `main` (el hook, el TODO, `/estado`) no lo veía hasta el merge. Nace en `main` con un commit;
   se construye donde se construye el código (§5).
4. **`rama:` obligatoria** forzaba rama por módulo también a lo que Guido hace solo: traje grande. La ficha vive donde se construye;
   `rama:` solo si hay una (§5).
5. **B le debía a F el nombre del archivo público de datos de prueba** (F §5 y §9) y no lo había dado: `referencia/PRUEBA.md` (§4).
6. **E §8 pide una línea del hook** ("hay kit nuevo / esta PC está atrás") que B no presupuestaba. Va en la cabecera (§9).
7. **`candado:estados` chequeaba tareas sin tildar en un módulo `COMPLETO`** cuya lista de tareas §5 ya había borrado: vacío. Pasa a
   "no pasa a COMPLETO con tareas sin tildar" (§14).
8. **El tope de 5.000 aplicado al manual** (la ficha `COMPLETO`): un manual puede ser más largo, y ya no se inyecta. El tope es para
   `EN OBRA` y `PAUSADO` (§5, §14).

**Flojo** (11):
9. El pedido textual dictado (2-3 KB) se comía la ficha: va como primera sección del `SPEC.md`, donde lo lee la sesión fresca (§5).
10. `tiempos.md` en módulos solo era "por las dudas": C lo pidió para el director; nace con él (§5bis, §6).
11. B decidía por I que el Hub lee el MAPA, contra "el Hub es el registro" (E §2.3). Se recorta: responden preguntas distintas; que no se
    duplique lo técnico lo resuelve I (§12).
12. `docs/README.md` repetía el mapa del `CLAUDE.md`: queda como puerta de tres líneas más la tabla de mudanza (§4).
13. Renombrar `DECISIONS.md` a `decisiones.md` (y REJECTED, ARCHITECTURE) rompía rutas sin ganar nada: conservan el nombre dentro de
    `referencia/`. Y faltaba decir qué decisión es de la app y cuál del módulo (§4).
14. El hook de escritura es un corrector y A §5 manda medirlo contra el historial antes de instalar, con prueba de casos; y F §10 prohíbe
    el freno duplicado: se explica por qué acá son dos eventos distintos y no uno (§7).
15. Dos dueños de la misma ficha cuando Guido trabaja solo sobre un módulo con director: su `/cierre` no la toca, deja un archivo en
    `bitacora/` (§5).
16. El `CLAUDE.md` por criterios aplica a nuevos y adoptados (E §5: es del proyecto), y su fila 5 no fija modelos: eso es D (§15).
17. `/relevamiento` nace fuera del repo (`_relevamientos/`); B solo cambia el destino de la mudanza, y el 6-bis de `/cierre` (§4).
18. E §7 "trae los tres documentos" pasa a seis más `trampas.md` y `PRUEBA.md` (§17, nota a E).
19. F §12 pide "acceso temporal a producción con fecha de borrado en el handoff": va en Estado → entorno (§8).

**Un riesgo que no es de B pero B lo destapa** (1):
20. **`.claude/frenos.log` de solo agregar, escrito desde varias ramas y worktrees a la vez, choca al mezclar**, y el actualizador de E
    mezcla sin preguntar. Va a A para la revisión integral (§20), con tres salidas posibles.

**Lo que la revisión confirmó como bien tomado**: separar estado de historia (es lo que falló en los dos proyectos largos, medido);
el plano de la app en dos archivos de una pantalla con disparador; los tres tamaños con una sola estructura; el presupuesto con huella
("medir al receptor"); el candado como corrector por script; y Engram en espera.

**Lo que las revisiones dejaron como NO VERIFICADO para el piloto**: cómo cuenta caracteres la plataforma (emoji = 2 en JS), el hook de
escritura en Windows y con worktrees, que la ficha del kit se pueda leer en node sin librerías, y los falsos positivos del hook de
escritura contra el historial.

## 23. Los 11 criterios, aplicados a este racimo

| # | Criterio | Cómo lo cumple B, o por qué no aplica |
|---|---|---|
| 1 | Menos intervención | Cero preguntas recurrentes nuevas (§19); las de adopción van dentro del OK que E ya contó. El Arquitecto arma el módulo sin pedir carpeta ni nombres; el desorden se frena solo |
| 2 | Pragmático | 33 + 20 hallazgos pasados por el filtro; se sacó lo "por las dudas" que B mismo traía (la fecha a mano, `tiempos.md` sin director, la tercera pregunta, el renombre, la rama obligatoria). Sin tope a los registros, sin rotación, sin memoria por MCP, sin anidar carpetas |
| 3 | Medible | Tabla de §18, con `flota.py`, el candado y la huella, cada mes |
| 4 | Software consistente | Indirecto: estado e historia separados, una sola ubicación por cosa, rutas que existen, lo aprobado no se pisa, el módulo nace en `main` para que todos lo vean |
| 5 | Tokens y modelo justo | El director deja de releer 314 KB por mensaje y el obrero 336 KB por encargo; registros por primeras 20 líneas; lectores en Sonnet y Opus, revisor en Opus, nunca Fable; el modelo de los subagentes del proyecto lo fija D |
| 6 | Script antes que modelo | El hook, el presupuesto, la huella, la fecha del handoff, el candado, la edad del TODO por `git blame`, la lista de módulos: todo script. Lo que es criterio (el cruce del cierre) se dice que es del modelo |
| 7 | Seguro por defecto | `referencia/` guarda nombres de accesos, nunca valores (F §9); `PRUEBA.md` es lo público; el candado no lee contenido, solo ubicación; los chequeos se quitan con rastro (`frenos.quitados`) |
| 8 | Portable | Un solo script node para los 3 SO (Hermes tuvo que escribir el hook en PowerShell); nada en la memoria de una PC; las carpetas del repo salen de `git ls-files` |
| 9 | Lo chico no paga lo grande | Tres tamaños, una estructura (§6): chico sin carpeta; módulo solo sin bitácora, sin `tiempos.md` y sin rama propia; un hotfix en producción sigue siendo chico |
| 10 | Autónomo con rastro | La ficha es el estado, la bitácora la historia, `tiempos.md` el registro, `> Histórico` lo cerrado; el candado deja su línea en `.claude/frenos.log` (con el choque de ramas anotado para A) |
| 11 | Piloto antes de flota | Hub y Portal primero; Hermes al cerrar un tramo; topes, prueba de tamaño y el hook de escritura se calibran ahí |
