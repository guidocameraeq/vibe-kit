# Diseño · Racimo H: niveles y puertas del Arquitecto

> **Misión 4, tramo 4** · 2026-10-25 · **Estado: ✅ cerrado el 2026-10-26** (decisiones 1-6 aprobadas en bloque por Guido el 2026-10-24;
> 7-14 aprobadas el 2026-10-26 desde la PC `clientes`, **con una corrección a la 9**: el tope del spec es un aviso y decide Guido, §12; revisor
> frío Opus: 45 hallazgos, todos aplicados, 6 con otro arreglo; §17). Es solo diseño: se construye en la misión 5. Se mide contra el norte y los 11 criterios del
> [PLAN](PLAN.md). Respeta lo decidido en [A](DISENO-A-frenos.md), [B](DISENO-B-documentos.md), [C](DISENO-C-salida-hacia-Guido.md),
> [D](DISENO-D-director-obrero.md), [E](DISENO-E-molde-y-flota.md), [F](DISENO-F-seguridad.md) y [G](DISENO-G-mesa-y-pcs.md); donde los
> corrige o completa, lo dice y deja la nota allá (la lista, en §22). Alias: Desktop, Mobile, Devoluciones, Deptos, Hub (repo público, ADR-021).

## 1. Para qué es este racimo, en una línea

Que **lo chico se haga en el chat sin pagar spec, chat nuevo ni director**, que **lo que es más que chico entre por una sola puerta** (el
Arquitecto) que lo deje armado y listo para abrir con una línea, y que un **subproyecto de un proyecto largo tenga nombre, carpeta, rama,
worktree y medición** sin que Guido tenga que inventar ni acordarse de nada de eso.

## 2. Lo que decidió Guido (2026-10-24 y 25)

- **Las seis decisiones del corazón, en bloque** (§4-§9): dos ejes con nombre, una sola regla de tamaño que dice la sesión, director solo
  cuando se escribe a la vez, subproyecto = módulo, el Arquitecto termina armando, y el entorno de prueba verificado por script. Con una
  reserva honesta: "me cuesta entender algunas cosas muy técnicas; si todas apuntan a mejorar mi workflow, dar mejor código, consistencia y
  que tenga que acordarme de menos cosas, estoy de acuerdo". **Por eso cada decisión de este documento dice cuál de esas cuatro cosas mueve.**
- **Las ocho de la mecánica** (§10-§17) las leyó el 25 sin objetar y pidió "cerrarlas como a vos te parezca". **El 2026-10-26, desde la PC
  `clientes`, las aprobó con una corrección**: "prácticamente todas me parecen súper bien"; la única duda fue el tope del spec (§12): "¿no puede
  haber un spec muy grande? siento que quizás entorpece un poco el desarrollo". Eligió **el tope como aviso**: el script mide, el Arquitecto
  propone dónde cortar y decide él; **"el spec no crece durante la obra" queda firme**. Y trajo una cicatriz para §10: en sus PCs los worktrees
  de Hermes le llenan la raíz de `D:` de carpetas ("necesitaría ordenar un poco eso"); medido ese día: 47 worktrees `D:\Hermes-*`.
- **Dos pedidos que no estaban en el racimo**: (a) que las sesiones encadenadas **se dejen solas el prompt de la siguiente** ("al cerrar le
  pido que me prepare el prompt para la otra"): ya lo resuelve B §8 (el "próximo paso" dentro del handoff, que `/inicio` toma sin pegar
  nada; P48, 22 lotes), y lo confirman dos plugins comunitarios y un pedido abierto a Anthropic (§18); (b) **una segunda lectura de los
  chats**, con las decisiones en la mano, en la PC `clientes`: la planificó esta sesión como **lectura de contraste**
  (`observatorio/investigacion/LECTOR-contraste.md` y `PLAN-lectura-contraste.md`), y una pasada de **hábitos** corre ya en la PC `Usuario`
  (uso personal, liviano). Las dos alimentan la revisión integral del tramo 4.
- **El contraste con otros métodos** (§18) lo pidió él: "buscar referencias de algún otro repo, a ver qué ideas nos podemos robar".

## 3. Hoy (medido el 2026-10-24 sobre el kit instalado, el acta y los diseños)

- **El Arquitecto instalado tiene tres puertas** (Modo A nuevo, B feature, C consultorio; `kit/skills/arquitecto/SKILL.md:33-42`). "Adoptar"
  existe solo en el diseño de E §7. **El Modo B termina siempre en "abrí un chat nuevo y pegá `inicio — ejecutá el spec`"** (`SKILL.md:157-161`),
  sin decir cómo se ejecuta: en su único uso real en Desktop (2026-09-14) Guido tuvo que preguntar cuántas sesiones, qué modelo, si orquestar
  y cómo testear, y dictó un blindaje de ~35 líneas a mano (H-39; ~6 dictados en la PC `Usuario`).
- **Nadie decide qué es chico.** La "regla de bolsillo" (sale en una tarde y no toca permisos/datos/plata) está repetida casi igual en cinco
  lugares (`SKILL.md:3`, `anexos/consultorio.md:26-27`, `templates/universales/CLAUDE.template.md:38`, `GUIA-DE-USO.md:78-80`,
  `manuales/COMO-USAR-EL-ARQUITECTO.md:34`) y **ningún paso la aplica**. Hay **cuatro criterios distintos de "cuándo spec"** que se contradicen,
  y uno (`CLAUDE.template.md:38`: toca plata/permisos/datos → spec) choca con lo que B §6 ya decidió (eso no hace módulo).
- **Cuatro vocabularios de tamaño sin reconciliar**: PLAYBOOK §1.5 (por proyecto: chico · mediano · grande/producción · con framework), B §6
  (chico · módulo solo · módulo con director), la ficha de E §4 (`nivel:` liviano · estándar · largo, "los nombres los fija H"), y el handoff.
- **El Arquitecto no conoce** director, obrero, tramo, subproyecto, módulo, worktree, rama ni entorno de prueba (grep en `kit/skills/arquitecto/`
  y el playbook: cero). Las skills de director viven copiadas a mano en cada proyecto largo (H-46; tres dialectos, FLOTA §2).
- **Uso real**: 10 llamadas a `/arquitecto` en 7 carpetas de la PC `clientes`; **0 en ~30 sesiones de la PC `Usuario`**; un solo Modo B en
  Desktop; en el compañero, "Modo B y C hechos a mano copiando el último spec" (10 lotes). Features de 2-3 archivos con chat nuevo "se
  sintieron burocracia"; **un hotfix de 15 líneas pasó por 3 auditores**; **un spec READY se ejecutó en 2 minutos**; specs de 43-55 KB con
  12-20 criterios para volúmenes chicos (A3). Nuestros propios specs pesan 15-66 KB.
- **Lo chico que salió bien, sin método**: "director de una pestaña + subagentes" (15 commits sin que Guido pegue un mensaje), la bandeja
  operador → dev con cuaderno de errores (~8 veces en ~5 chats), el prototipo clickeable antes del spec (5 lotes, aprobado en minutos).
- **Lo que dolió por no tener norte ni entorno de prueba**: el hueco mayor encontrado tras 9 sesiones, 67 pruebas de permisos para un rol sin
  uso, un contrato caído en 6 minutos (H-49, 28 lotes); "ensayo" confundido con local y nube 3 veces en un día y pruebas con un usuario real
  (H-50); 15 detectores de forma con regex y un falso verde (H-52).
- **Lo que los otros racimos dejaron a H**: los nombres de los tamaños y de los niveles (B §20, E §14); el texto del triage y el criterio
  "más de una pestaña ejecutando" como regla del Arquitecto (D §19); ramas y worktrees por módulo y por encargo, el script del worktree con
  su entorno, cuándo `/inicio` propone `-w`, el módulo que cruza dos repos (D §8, G §11, G §22); el entorno de prueba como verificación del
  Arquitecto (D §2, §12.8); mapear `sensible:` a reglas concretas (D §7.7, con F); los subproyectos (TABLERO §10); `/estado <subproyecto>` (C §2.5).

**El cuadro, antes de las decisiones.** *Sigue igual*: las puertas del Arquitecto (nuevo, feature, consultorio, adoptar), el spec SPEC-0 o
delta con NO SE TOCA, "el que piensa no construye" para módulos, el red team cuando toca plata/permisos/datos de terceros, la estructura de
módulos de B, la regla de director de D, las 5 preguntas de A. *Cambia*: una sola regla de tamaño que dice la sesión sin preguntar; el
Arquitecto termina armando el mini ecosistema y dando la línea de apertura; "subproyecto" pasa a ser un módulo con nombre. *Quién*: el tamaño
lo dice cualquier sesión plana en una línea; solo o con director lo decide el Arquitecto al listar las tareas; nombres de carpetas, ramas y
worktrees los pone un script; el entorno de prueba y el tope del spec los chequea un script. *No le toca a Guido*: decidir si es chico, elegir
si hay director, inventar nombres, acordarse del entorno de prueba, medir el spec (el recuento honesto de lo que sí le toca, en §20).

## 4. Dos ejes con nombre: el tamaño del pedido y el nivel del proyecto (decisión 1) `[consistencia · acordarse de menos]`

Hoy hay cuatro vocabularios porque miden dos cosas distintas. Quedan **dos ejes**:

| Eje | Valores | Quién lo pone | Dónde vive |
|---|---|---|---|
| **Tamaño del pedido** | **chico** · **módulo** (solo) · **módulo con director** (los de B §6 y D §4) | La sesión plana (chico o no, §5); el Arquitecto (solo o con director, §6) | En la ficha del módulo (`director: sí/no`); lo chico no deja rastro propio |
| **Nivel del proyecto** | **`liviano`** (sin código) · **`estandar`** (con código) | Guido con el Arquitecto al montar o adoptar | `nivel:` en `.claude/kit.md` (E §4), **en ASCII** |

- **`liviano` es solo "sin código"** (documentos, relevamientos, estudio): sin matriz de stacks, `docs-fyd`, `/smoke`, `/release` ni hook de
  código; con `/inicio`, `/cierre`, handoff, TODO, CHANGELOG y `NORTE.md` (§14). **Un proyecto personal con código es `estandar`**, con los
  defaults de F §14 (push y merge libres, sin director) **y la red de F §23.9 entera** (las 9 reglas, el corrector de secretos, el pre-commit,
  el hook de git): la primera versión de esta decisión ponía lo personal en liviano, y el revisor mostró que los incidentes reales son
  justamente de proyectos personales con código (mails reales ~5 veces en un día; un seed que habría corrido en producción; R-1).
- **"Largo" no se escribe: se calcula.** Un proyecto es *largo* cuando `piezas.director-obrero` está instalado en su ficha (E §4, D §14), y
  eso lo pone el Arquitecto solo, al abrir el primer módulo con director (§8). Escribirlo también en `nivel:` serían dos campos para un dato
  (criterio 2; y Guido puede "bajar" un módulo, D §4, y el proyecto seguiría diciendo largo; R-40). En la prosa se siguen usando las tres
  palabras, liviano · estándar · largo, como hasta ahora.
- **`nivel:` deja de tener dos sentidos en la misma ficha**: F §9 usa `nivel: real | dummy | prueba` para cada entorno; para que el parser
  sin librerías de B no se confunda y porque B ya arregló una vez un "`nivel:` con dos sentidos", el de los entornos pasa a llamarse
  **`clase:`** (nota a F §9; R-31). Y los valores de máquina van **sin tilde** (`estandar`): PowerShell 5.1 escribe ANSI por defecto y las
  3 PCs son Windows.
- **Reemplaza PLAYBOOK §1.5 en lo que clasifica** (tamaño por proyecto). Lo que §1.5 además **exige a lo grande o en producción**
  (`RECOVERY.md` probado, `PROTECTED_PATHS.md`, `CRONS.md`, el doc de framework upstream) **no se pierde**: va a F con la ficha (`entornos:` con
  un `clase: real` obliga a declarar respaldo probado, rutas protegidas y crons; es la línea base "backups vacíos en verde" del criterio 4) y
  a `referencia/` de B §4 como ubicación; lo cierra la revisión integral (R-19).

*Alternativas descartadas*: una sola escala (mezcla el proyecto con el pedido: Hermes tiene pedidos chicos todos los días) · deducir
liviano/estándar de las piezas (es una elección, no se deduce) · escribir `largo` (dato derivado, dos verdades). *Qué cambia para Guido*: una
sola palabra por cosa; elige liviano o estándar una vez al montar, dentro de la primera pregunta del Modo A ("qué es" incluye "¿lleva código?").

## 5. Una sola regla de tamaño, y la dice la sesión sin preguntar (decisión 2) `[workflow · consistencia · acordarse de menos]`

1. **La prueba de tamaño son las dos preguntas de B §6**: ¿se retoma solo con el pedido más el `git diff`? ¿lleva más de una sesión?
   **Ninguna sí → chico. Alguna sí → módulo.** Contar archivos o líneas no decide. **Tocar plata, permisos o datos no hace spec**: eso lo cuidan
   las 4 preguntas de A y la red de F ("con permiso, igual con red", F §13), no un documento. Anthropic lo dice casi igual ("si podés describir
   el diff en una oración, salteá el plan", §18).
2. **Se retira la regla de bolsillo** de los cinco lugares, y se saca "o riesgosa" de la `description` del Arquitecto. **Dónde vive la regla
   nueva**: en el **`CLAUDE.md` del molde** (una línea, porque la aplica cualquier sesión a mitad de chat, no solo `/inicio`), en el `SKILL.md`
   del Arquitecto (como paso de ruteo) y en la guía. Para los repos que ya andan, **el `CLAUDE.md` es del proyecto y el actualizador no lo
   toca** (E §5): la línea vieja la reemplaza el adoptador o la migración (E §7, B §17) **dentro del OK de adopción que ya existe**, y
   `doctor` marca la regla vieja donde siga (R-7).
3. **Quién la aplica: cualquier sesión plana del proyecto**, al recibir un pedido, **en una línea y sin preguntar**: *"chico, lo hago acá"* o
   *"esto es más que chico: llamo al Arquitecto"*. El director no tría: un pedido chico que le llega es un encargo; uno que cambia el alcance
   va por G §7.3. El obrero tampoco: hace su encargo (R-26). **El Arquitecto llamado con algo chico rebota en una línea** ("esto es chico:
   hacelo en el chat del proyecto").
4. **Consulta y hotfix (P51) son chico**, sin modo propio. Lo único nuevo: **el `/cierre` de una sesión que no cambió nada termina en una línea**
   y no toca el handoff.
5. **Si algo arrancó chico y creció** (ya lleva dos sesiones), `/cierre` aplica la misma prueba y crea el módulo desde el molde (B §6, ya
   decidido; no se vuelve al Arquitecto).
6. **El arreglo del arreglo sigue siendo chico, con red (2bis).** 26% de los arreglos de la flota arreglan otro arreglo (criterio 4). Kiro lo
   manda a spec ("regresión previa, causa raíz no obvia"); nosotros no: sería el traje grande de nuevo. **La red se aplica al commit, no al
   triage** (al recibir el pedido todavía no se sabe qué archivos toca; R-17): el mismo chequeo `gate:fix-sin-prueba` de D §10.5 agrega
   *"este arreglo toca un archivo de un fix de los últimos N días → revisor Opus congelado en el commit antes del push"*. Por archivo, no por
   función (`log -L` es caro; B §22). Nota a A y D.

*Alternativas descartadas*: "una tarde" como tercera pregunta (es lo mismo que "más de una sesión") · plata/permisos como señal de tamaño
(contradice B §6 y pone spec a un hotfix en producción) · el arreglo del arreglo como módulo (Kiro). *Qué cambia para Guido*: el hotfix de 15
líneas no ve más auditores; una feature de 3 archivos no abre chat nuevo; nunca le preguntan "¿esto lleva spec?".

## 6. Cuándo hay director: lo decide el Arquitecto al listar las tareas (decisión 3) `[workflow · acordarse de menos]`

- **Default: módulo solo.** Director **solo** si el plan del spec tiene **dos o más tareas que se escriben a la vez** (carriles paralelos
  sobre archivos distintos) o si Guido pide **noche sin él**. Es la regla de D §4 ("más de una pestaña ejecutando") escrita como paso del
  Arquitecto: la decide él al listar las tareas, que lista igual.
- **Que lleve varias sesiones seguidas NO lo hace director**: es módulo solo y `/cierre` mantiene la ficha en cada sesión. D §4 decía "varios
  obreros, varios tramos": se precisa con una nota, "varios tramos u obreros **en serie** = módulo solo" (R-12). Lo mismo vale para la variante
  "director de una pestaña + subagentes" (§16): funcionó por liviana, y es un módulo solo.
- **Guido pisa en los dos sentidos** (D §4): "quiero director igual" queda en la ficha del módulo; "bajá" mergea lo verde y saca `director: sí`.
- Un módulo solo que de pronto necesita un segundo escritor (otra persona, un carril nuevo) **sube**: el Arquitecto lo convierte en módulo con
  director agregando lo que falta (B §6: "la misma carpeta, más o menos archivos"), con un OK dentro de la ficha.

*Alternativas descartadas*: director por cantidad de tareas o de archivos (puso el traje de Hermes a todo) · director siempre en nivel largo.
*Qué cambia para Guido*: nada que decidir; si quiere director igual, lo dice y queda anotado.
*Revisión integral (2026-10-26; E-1)*: la regla no cambia, pero **quién llama al Arquitecto, sí**: no Guido con otra pestaña, sino **la sesión
misma** (plana o `/director`) cuando el pedido no es chico; y si el director ya tiene un plan charlado con Guido, el Arquitecto entra en
**Modo B corto** y decide esto con el plan en la mano ([DISENO-E](DISENO-E-molde-y-flota.md) §3, [DISENO-D](DISENO-D-director-obrero.md) §4).

## 7. Subproyecto = módulo, con nombre (decisión 4) `[workflow · consistencia · acordarse de menos]`

Lo que Guido pidió el 2026-10-21 para cada subproyecto (nombre, documentos, historial, reporte, tiempos, tokens) **ya lo tiene el módulo** de
B §5 y C §2.5. H agrega lo que faltaba:

1. **El nombre `<x>`**: `^[a-z0-9]+(-[a-z0-9]+)*$`, **≤20 caracteres**, único en el repo, **nunca con `--`** (es el separador de encargo) y el
   mismo en los dos repos si el módulo cruza (`enlaza:` de G §12). Es el nombre de la carpeta `docs/modulos/<x>/`, de la rama, del worktree y
   de las sesiones (§10). **El `<ID>` de encargo son dos dígitos por módulo** (`07`), como ya usa D en `bitacora/<fecha>-encargo-07.md` (R-30).
2. **Cuándo es hijo**: si el pedido es un tramo de una iniciativa abierta, el Arquitecto lo abre con `parte-de: <iniciativa>` (B §5); si no,
   módulo nuevo. Lo decide él; Guido no elige.
3. **Tiempos y tokens, solo con director** (hay que decírselo en criollo: el módulo solo tiene nombre, documentos, historia y `/estado`; la
   tabla de tiempos nace con el director, B §5bis, y los tokens también; R-27). **Los tokens por subproyecto se miden solos**: cada worktree es
   un `cwd` distinto, los transcripts se registran bajo ese directorio (verificado en la doc, §17) y `costos.py` suma por carpeta. **NO
   VERIFICADO** que la carpeta de transcripts de un worktree sea distinta de la del checkout principal: piloto. Sin director no se mide por
   módulo: sería "por las dudas".
4. **Los estados de la ficha quedan los de B §13** (`EN OBRA · PAUSADO (hasta <fecha>) · COMPLETO · ABANDONADO (por qué)`); H no agrega ninguno.

*Qué cambia para Guido*: "¿cómo va identidad?" es `/estado identidad` y una carpeta, en cualquier PC; sabe de antemano que tiempos y tokens
los tiene solo lo que llevó director.

## 8. El Arquitecto termina armando, no mandando a pegar (decisión 5) `[workflow · mejor código · acordarse de menos]`

1. **Todo spec READY lleva una sección "Ejecución"** (P6): tamaño (módulo solo o con director); sesiones (una, o director con sus obreros);
   **solo el desvío del modelo por defecto**, con su razón (los defaults viven en la definición de los roles, D §6.3; repetirlos en cada spec es
   lo que D vio fallar; R-41); rama y worktree si hay director; **la línea única para abrir** (D §7); y un puntero a la sección "Entorno de
   prueba" (§9), que es la que dice cómo se prueba antes de producción (una sola sección, R-43). *Revisión integral (2026-10-26; E-1)*: y
   **el sello del Arquitecto**, una línea que escriben sus scripts, no el modelo (`arquitecto: <fecha> · kit <versión> · chequeos: tamaño ✅
   entorno ✅ tope ✅`). **Sin sello no hay READY** (el script que marca READY se niega) **y ningún obrero arranca** con un spec sin sello
   (corrector "spec sin Arquitecto: corré Modo B", [DISENO-A](DISENO-A-frenos.md) §6). Es el candado que hace que el Arquitecto juegue aunque
   Guido o el director se olviden: hoy aparecía en 11 de 41 lotes del acta de contraste, y en Mobile en 0 de 18. **"Spec + red team cuando corresponde + READY"
   es el disparador**: el red team sigue siendo condicional (plata, permisos, datos de terceros; `SKILL.md:80`, R-24).
2. **Antes de dar la línea, el Arquitecto deja armado el mini ecosistema, en este orden** (R-36): **un commit en `main`** con la carpeta
   `docs/modulos/<x>/`, la ficha (con `rama:` si va a haber director), el `SPEC.md` y, si hace falta, las piezas del kit (director/obrero/tramo
   instalados por el Equipador → el proyecto pasa a largo); y **recién después** la rama y el worktree del módulo (§10), con `tiempos.md`,
   `planes/` y `bitacora/` según B §6. Así el hook, el TODO y `/estado` de cualquier sesión ven el módulo desde el primer día (B §5).
3. **Módulo solo**: sesión fresca en `main` con la línea ("el que piensa no construye" sigue; el contexto del Arquitecto está lleno de
   entrevista y el spec en archivo existe para eso).
4. **Modo A**: la "Ejecución" va dentro del `SPEC-0` (que vive en la raíz, B §4). La primera construcción casi siempre es módulo (lleva más de
   una sesión): el Arquitecto abre `docs/modulos/v1/` (o el nombre que Guido le dé), cuya ficha cita al `SPEC-0` (R-20).

*Alternativas descartadas*: construir en el mismo chat del Arquitecto · dejar la ejecución a la sesión fresca (es lo de hoy: ~6 dictados).
*Qué cambia para Guido*: pega una línea y arranca; no dicta más "planeá → spec → red team → ¿cuántas sesiones?".
*Revisión integral (2026-10-26)*: **el Modo B corto.** Cuando el pedido llega con un plan ya charlado (Guido: "planeo con el director y
después meto al director"), el Arquitecto no entrevista de cero: toma el plan como entrada y hace solo lo que el director no hace: explorar
el código real con su subagente, escribir el "qué NO se toca", correr los chequeos por script (tamaño, entorno, tope), decidir director sí o
no (§6) y armar "Ejecución" con el sello. La entrevista larga queda para proyecto nuevo o sin plan. **Cuánto tarda se mide en Deptos**: si
molesta, se recorta, porque si molesta se esquiva y el candado no alcanza. El paso "¿cómo lo resuelven otros?" (P61: un investigador Sonnet
con tope de ~15 búsquedas que deja "qué robar y qué no" antes de las decisiones) es **obligatorio en el Modo B largo y opcional en el corto**.

## 9. El entorno de prueba: declarado en el spec, verificado por el Arquitecto y chequeado al abrir (decisión 6) `[mejor código · acordarse de menos]`

Pedido de Guido (D §2, §12.8): "que el Arquitecto verifique que el proyecto tenga un entorno de prueba". Nadie afuera lo exige como declaración
(§18); lo más cercano es el harness de Anthropic (levantar el entorno y correr una prueba de punta a punta al abrir cada sesión).

1. **El spec READY lleva una sección fija "Entorno de prueba"**: cómo se levanta (un comando), qué datos semilla usa, cómo se resetea, cuál es
   **el chequeo base** que tiene que dar verde, y **si el entorno es compartido entre carriles o por worktree** (R-16). *Revisión integral
   (2026-10-26; H-5 reabierta y cerrada con Guido)*: **y la lista de herramientas que el módulo necesita**: VPN, binario o `.exe`, APK y
   versión, MCP del navegador, Python, archivos que tienen que estar cerrados (un Excel abierto), puertos. El acta contradijo esta decisión
   176 a 100 y **lo que aparece roto tarde no es la base: son las herramientas** (el MCP del navegador no conectó en dos obreros y el ensayo
   quedó vacío, 85e17f12, 2026-10-19; un recorrido de teléfono de 67 min contra 40-60 previstos, L70). **Cada herramienta tiene su chequeo
   de una línea en el script** (verde o rojo) y se corre con el chequeo base (6.3). Lo que **solo Guido puede poner** (la VPN, el teléfono
   físico, la oficina, lo que pide administrador) **se declara en el encargo como "necesita a Guido de día"**: el director lo programa en su
   franja, primero y en orden de valor, y un obrero nocturno nunca depende de eso (absorbe P69; 15 lotes del acta). Si el MCP del navegador
   no conecta, el molde de `smoke` trae el fallback que cada obrero hoy reinventa: un Chrome o un puerto por obrero ("otras" 17 del acta).
2. **Un script del Arquitecto lo verifica antes del READY**, con una regla proporcional: **por cada entorno `clase: real` que el módulo toca**,
   la ficha (`entornos:`, F §9) tiene que declarar un `dummy` o `prueba` (R-15); **sin `real`, alcanza con que `comando-test` exista y corra**
   (un proyecto sin base no monta nada); si la feature es de pantalla, hay **corredor de pruebas del front y su navegador instalado en esta PC**
   (H-52; y P51, "si hay navegador": 9 lotes de "el usuario es el QA visual"; R-29). Si falta, **montarlo es la tarea 0 del spec**; si por sí
   solo pasa la prueba de tamaño (más de una sesión), **es su propio módulo y va antes** (es lo que D §12.8 llamó "el primer módulo";
   nota a D). No se pregunta; Guido solo carga la credencial de la base de prueba con `cargar-secreto` si hace falta (una vez por proyecto y PC).
   **Es un freno con nombre, `gate:entorno-prueba`, y como toda barrera se quita por proyecto con rastro** (`frenos.quitados`, F §14; un proyecto
   que declaró `unica: real` lo quita con su razón).
3. **Toda sesión de construcción corre el chequeo base antes de tocar código** (6bis): el obrero lo reporta en su primer AVANCE; la sesión plana
   de módulo lo dice en una línea. **Si da rojo, es "ya estaba roto"**: no se arregla en silencio. La sesión plana **sigue** si no toca su
   alcance y lo anota al TODO; si lo toca, el obrero hace CONSULTA al director y la plana lo dice y sigue con otra cosa. **Con entorno
   compartido, el chequeo base es de solo lectura** y nadie resetea sin acuerdo (G §8: los recursos compartidos tienen dueño). Para el obrero
   que es subagente, la orden va en su definición, no en el hook (R-35, §16). En Modo A y adoptar, lo mismo como parte del montaje. Chico: nada.
   *Revisión integral (2026-10-26)*: con las herramientas en la lista, **un rojo de herramienta no traba al obrero**: lo reporta en el primer
   AVANCE y sigue con lo que no depende de ella; lo que sí depende queda en "parado" de la ficha hasta que la herramienta vuelva.

*Alternativas descartadas*: una pregunta fija al arrancar (P8: preguntar no monta nada) · exigir dummy a todo proyecto (sin base, paga algo
inútil). *Qué cambia para Guido*: no vuelve a probar con un usuario real porque "ensayo" no existía (3 veces en un día); nunca se confunde "lo
rompí" con "ya estaba así".

## 10. Ramas y worktrees: un nombre por unidad, los crea un script, el prefijo dice qué es (decisión 7) `[consistencia · acordarse de menos]`

Lo verificado contra la doc oficial el 2026-10-24 (§17): `claude -w <nombre>` crea `.claude/worktrees/<nombre>` con la rama `worktree-<nombre>`
**saliendo de la rama por defecto del remoto** (o del HEAD con `worktree.baseRef: head`), no acepta una rama existente ni un nombre de rama
propio, **reabre el worktree existente si se repite el nombre**, y no corre nada después de crear (el hook `WorktreeCreate` reemplaza toda la
lógica y apaga `.worktreeinclude`). Por eso los módulos no usan `-w`.

1. **Nombres.** Módulo con director: rama **`modulo/<x>`**, worktree **`.claude/worktrees/modulo--<x>`**, nace de `main` después del commit de
   §8.2. Encargo: rama **`modulo/<x>--<ID>`**, worktree **`.claude/worktrees/modulo--<x>--<ID>`**, **nace de la punta de `modulo/<x>`**. El
   `--` evita el choque de refs de git (`modulo/<x>` no puede ser a la vez carpeta de `modulo/<x>/<ID>`); el prefijo `modulo--` en la carpeta
   evita que un `claude -w identidad` a mano reabra el worktree del director (R-2). La rama es `modulo/` en singular a propósito, para no
   confundirla con la carpeta `docs/modulos/`.
2. **El script del kit `worktree`** (misión 5), con cuatro modos: **`crear <x>[--<ID>]`** (verifica con `git check-ignore` que `.claude/worktrees/`
   esté ignorada y la agrega si no, como superpowers; crea rama y carpeta con la base correcta; copia lo que lista **`.worktreeinclude`**, la
   misma fuente que usa el `-w` nativo; corre el **`comando-setup`** de la ficha (`vars:`, E §4), que es lo que S-D-7 pedía (5 tropiezos en un
   día); imprime la línea de apertura con el nombre de sesión de §10.4); **`abrir <x>[--<ID>]`** (la rama ya existe local o en `origin` y la
   carpeta no está en esta PC: el compañero, otra PC, después de borrar; R-21); **`sync-env`** (vuelve a copiar `.worktreeinclude` a los
   worktrees vivos, para el `cargar-secreto` que llega después de crearlos; R-33); **`cerrar <x>--<ID>`** (borra rama y carpeta, y **se niega
   si la rama no está mergeada o si `git status --porcelain` del worktree no está vacío**; `worktree remove --force` entra al corrector de
   A §6; R-22). **La carpeta de un obrero se borra cuando el obrero cierra, no al mergear**: D §11.3 reutiliza al obrero justo después del merge,
   y su sesión seguiría parada en una carpeta borrada; un obrero reutilizado recibe en su misma carpeta la rama del encargo nuevo
   (`git switch -c modulo/<x>--<ID2> modulo/<x>`; R-3).
3. **El hook y los scripts identifican la pestaña por la rama que tiene el `cwd`** (`git branch --show-current`: `modulo/<x>` = director de x,
   `modulo/<x>--<ID>` = obrero del encargo ID, `main` = sesión plana, `worktree-*` = misión plana), **nunca por el nombre de la carpeta** ni
   por `CLAUDE_PROJECT_DIR`, que **no sigue al worktree** (verificado; el `cwd` del JSON de entrada sí). Lo que inyecta el hook por pestaña: en
   el worktree del **director**, primero **la cabecera de la ficha** del módulo (1.000 bytes, B §9; R-9) y el handoff de `main` por `git show
   main:docs/SESSION_HANDOFF.md`; en el del **encargo**, la cabecera de la ficha por `git show modulo/<x>:` y la ruta del encargo, **sin el
   handoff del proyecto** (R-34). Nota a B §9.
4. **Los nombres de sesión** (D §7.6 los dejó a H): director **`director-<x>`**; obrero **`obrero-<x>--<ID>`** (dos módulos con director a la
   vez darían dos `obrero-07`; R-5); si el módulo cruza dos repos (`enlaza:`), el director es **`director-<alias>-<x>`** para que no haya dos
   `director-identidad` en la misma PC (G §12: las direcciones del archivo siguen siendo `<alias>/<rol>`). Nota a D §7.6 y G §12.
5. **La línea de apertura es de terminal** (`cd <worktree> && claude --name <sesión> --model <m> …`; la integrada de VS Code sirve, D §7.6).
   Una pestaña de la extensión abre en la carpeta del workspace, o sea en `main` (R-6): por eso **el obrero imprime su rama al presentarse y
   hace PARADA si no es la de su encargo** (chequeo de script en `/obrero`). Cómo abrir una pestaña de la extensión dentro de un worktree
   (¿`code <ruta del worktree>` y la pestaña en esa ventana?): **NO VERIFICADO**, piloto.
6. **Encargos como subagente** (D §7.2, "lo chico sin sesión"): **no usan `isolation: worktree`** (ramifica desde el remoto, no desde
   `modulo/<x>`); el script crea `modulo--<x>--<ID>` y la definición del subagente dice "trabajá en `<ruta>`" (R-10).
7. **Misión plana con segunda sesión viva sobre el mismo checkout** (G §11.4): ahí sí **`claude -w <misión>` nativo tal cual** (rama
   `worktree-<misión>`; el nombre de misión nunca lleva `--`). **Su `/cierre` no toca el checkout de `main`**, que es donde está la otra sesión
   (R-4): integra `origin/main` en su rama, empuja por fast-forward (`git push origin HEAD:main`) y borra el worktree; la otra sesión lo recibe
   en su propio `/cierre` (G §11.2). Al salir, el `-w` con nombre pregunta "¿conservo el worktree?" (documentado): es un clic más, contado en §20.
8. **Merges**: encargo → módulo y módulo → `main` con `--no-ff` (marca dónde entró cada cosa, criterio 10) y **nunca squash** (G §5.6: los SHA
   que cita la mesa siguen existiendo); `worktree-*` → `main` por fast-forward (R-45).
9. **Módulo que cruza dos repos**: mismo `<x>` y misma rama `modulo/<x>` en los dos (`enlaza:`, G §12.5).
10. **`.claude/worktrees/` entra al `gitignore.snippet` del molde** (F §9). **Windows** (NO VERIFICADO, piloto; R-32): el script prende
    `core.longpaths` (rutas `…\.claude\worktrees\modulo--x--07\node_modules\…`) y verifica una vez por proyecto que `comando-test` corrido en
    `main` no entre a `.claude/worktrees/` (pruebas por duplicado).
11. **NO VERIFICADO** (piloto): que `claude --bg` lanzado desde Bash dentro del worktree del encargo **no** se cree otro worktree encima (la doc
    dice que salta el aislamiento si ya está en uno); que `--resume` encuentre la sesión por el `cwd` del worktree (la ficha guarda **la ruta
    del worktree junto al id de sesión**, y la línea de reanudar arranca con `cd`; R-21).

**La cicatriz de la carpeta `.claude/worktrees/` (2026-10-26, PC `clientes`).** La skill `director` de Hermes manda los worktrees **afuera del
repo, hermanos del checkout** (`D:\Hermes-<x>`), porque adentro aparecían como carpeta sin seguir. Resultado medido ese día: **47 worktrees
`Hermes-*` en la raíz de `D:`**, todos con commits de las últimas dos semanas y sin cambios sueltos, mezclados con los proyectos; Guido: "se me
llena de carpetas el disco D". Por eso §10.1 y §10.10: adentro del proyecto, con nombre fijo y la carpeta ignorada por git, que era justo lo
que Hermes esquivaba. Ordenar Hermes es trabajo de su repo (su skill pasa a la carpeta interna y `cerrar` borra lo mergeado), no de este diseño.

*Alternativas descartadas*: `claude -w` para todo (no puede ramificar desde el módulo ni elegir nombre) · ramas sin prefijo · tope de worktrees
vivos y foto antes de borrar (Codex: el script se niega a borrar lo no mergeado o con cambios, y la rama mergeada queda en el historial) ·
HEAD desacoplado (Codex: queremos la rama con nombre en el historial). *Qué cambia para Guido*: no inventa nombres ni corre `git worktree`;
pega la línea que le da el director; si hace `claude -w` a mano, no rompe nada: es una misión plana.

## 11. `/inicio` propone worktree solo si hay otra sesión viva en el mismo checkout (decisión 8) `[acordarse de menos]`

Es la pregunta de G §11.4, y **la única de worktree que Guido va a ver**. Dos precisiones (R-8): **se cuentan solo las sesiones vivas en el
mismo checkout**, no en el repo (en un proyecto largo siempre hay un director vivo en su worktree, y D §8.7 dejó `main` limpio justamente para
las sesiones planas): el hook de arranque deja una marca con el id de sesión en `$(git rev-parse --git-dir)`, que es propia de cada worktree, y
`/inicio` mira solo la suya; una marca con más de 12 h sin actividad no cuenta (G fijó "solo nombre y existencia", nunca el contenido de una
sesión). Director y obreros nunca preguntan: la línea de apertura ya los deja adentro (§10.5). Una sesión plana sola: `main`, sin worktree.

## 12. El spec tiene tope por tamaño: el script mide y avisa, el Arquitecto propone el corte y Guido decide (decisión 9, corregida el 2026-10-26; P52) `[consistencia · mejor código]`

- **Módulo solo: ≤10 KB y ≤8 criterios** (el formato ya dice 3-8; nadie lo chequea). **Módulo con director: ≤30 KB con las tareas listadas.**
  **El tope es un aviso, no un corte automático** (Guido, 2026-10-26: "siento que quizás entorpece un poco el desarrollo"): si se pasa, el
  script lo dice con el número, el Arquitecto **propone dónde cortar** y **Guido decide con un clic** si parte o sigue entero (una pregunta más,
  contada en §20, solo cuando se pasa). Si parte, lo que sobra es **otro módulo hermano** (mismo `parte-de:` que el original, o suelto),
  **nunca hijo** de un módulo que tiene tareas (B §5bis puso `tiempos.md` solo en las hojas; R-14). Lo que **no** se negocia es el punto siguiente.
- **El spec no crece durante la obra.** Un cambio de pedido **aprobado** va como `SPEC-2.md` en el mismo módulo (B §4, §13) y reescribe solo
  la parte afectada (B §5) **mientras el conjunto quepa en el tope**; lo que lo pasa, es otro módulo (R-13). Es la regla de Kiro ("el spec de
  un bug no crece; lo nuevo es otro spec") y la nuestra de S-M-14 ("el sí vale solo para lo que se preguntó": 2 ensanches medidos).
  *Revisión integral (2026-10-26; H-6 reabierta y cerrada con Guido).* El acta la contradijo 222 a 21: en Hermes el archivo READY no se
  edita, pero **la obra crece igual**: 9 a 12 desvíos declarados por tramo y sub-pasos nuevos (2b, 7b, 10b) a mitad de obra (497e15dd,
  2026-09-24/25). La regla era prosa, y A-2 (confirmada) dice que la prosa no frena fallas repetidas. Lo decidido: **el archivo sigue sin
  tocarse, el desvío declarado es el canal legal, y un script los cuenta** por módulo (desvíos de clase 1 de D §13 y sub-pasos nuevos, que
  son siempre clase 2 y los decide el director contra el spec; si el spec no alcanza, `SPEC-2`). **El contador nunca frena al obrero ni le
  habla** (Guido: "casi todos los obreros se desvían y siguen trabajando; que ese clic no me parta las cosas a la mitad"): va al director y a
  `/estado`. La pregunta "¿partimos el módulo?" aparece **solo en un corte natural** (encargo cerrado, el director armando el siguiente) y
  **solo si lo agregado cambia el alcance**; muchos desvíos técnicos son un dato para el cierre del módulo, sin pregunta. Cuando aparece,
  es el mismo mecanismo del tope de arriba: el script dice el número, el director propone (delta o módulo hermano) y Guido decide con un
  clic. Tope orientativo: 5 desvíos o 2 sub-pasos nuevos por módulo, **NO VERIFICADO**, se calibra en Deptos.
- **Al `formato-spec.md`, en la misión 5**: READY = aprobado por el dueño **después** del red team cuando corresponde, sobre la versión final
  (hoy se revirtió 3 veces); **sin secciones nuevas** (R-42): "Contexto del código" lleva `archivo:línea` obligatorio (es el "verificado en el
  sistema vivo" que pedía P52) y "Supuestos" admite la marca `[SIN CONTRASTAR]`.
- **Los números son NO VERIFICADO**: se calibran en el piloto con nuestros specs (15-66 KB), los de Hermes (43-55 KB) y el anti-ejemplo de
  Böckeler (16 criterios para un bug). Nadie afuera pone tope ni lo chequea con script (§18): acá somos originales.

*Qué cambia para Guido*: cuando un spec se pasa, ve el número y decide si lo parte; nunca lo frena un corte que no eligió; y no aprueba lo que
después se agranda solo.

## 13. Prototipo antes del spec, para features de pantalla (decisión 10; P57) `[workflow · acordarse de menos]`

En Modo B, si la feature es de pantalla, el Arquitecto **arma un prototipo clickeable antes del spec**: HTML estático, por un subagente Sonnet,
que se abre en el navegador (nada depende de la app de escritorio: Guido trabaja en la extensión de VS Code), **con una pregunta escrita**
("¿esta pantalla te alcanza para decidir X?"). Lo aprueba Guido o la usuaria final (como pasó: 5 lotes, aprobado en minutos), y **el spec se
escribe desde lo aprobado**, citando el prototipo. Vive en `docs/modulos/<x>/prototipo/` y **es descartable**: nunca pasa a producción (el spike
descartable de superpowers; Tessl: "el prototipo responde una pregunta"). **Reemplaza la entrevista de pantalla**: una aprobación en lugar de
varias preguntas (contada en §20).

*Alternativa descartada*: spec primero y pantalla después (lo que hacen todos; a Guido le funcionó al revés). *Qué cambia para Guido*: ve la
pantalla antes de leer un documento.

## 14. Proyecto sin código, y la carpeta real (decisión 11; P9, P10) `[acordarse de menos · consistencia]`

- **Nivel `liviano` = sin código** (§4): sin matriz de stacks, `docs-fyd`, `/smoke`, `/release` ni hook de código; con `/inicio`, `/cierre`,
  handoff, TODO, CHANGELOG y `NORTE.md`. Lo decide la primera pregunta del Modo A ("qué es" incluye "¿lleva código?").
- **El Arquitecto monta donde corre la sesión, por ruta absoluta, nunca un nivel más abajo** (P10). Si el proyecto va en una carpeta nueva,
  la crea y monta ahí **por ruta absoluta**; **la línea de apertura de §8 ya es el "reabrí ahí"**. Sin "reabrí antes de montar" (un paso de
  más) ni chequeo final del `CLAUDE.md` (nació de 1 caso; A §4.1: la primera vez se anota, no se agrega; R-44).

*Qué cambia para Guido*: UCEMA y el proyecto de entrevistas dejan de inventar su sistema cada vez (10 lotes); las skills no se le vuelven a
esconder.

## 15. `sensible:` pasa a reglas concretas, generadas por script (decisión 12; con F) `[mejor código · acordarse de menos]`

Cada entrada de `sensible:` (datos reales, plata, sale afuera) **nombra el comando del proyecto que la toca** (F §13 ya obliga a que lo
peligroso pase por un comando del proyecto, nunca suelto). **Un script** (`doctor` o el actualizador, no el modelo: es determinístico una vez
que cada entrada tiene su comando; criterio 6; R-23) **regenera en la zona propia de `settings`** la regla `ask` sobre ese comando contra los
entornos `clase: real`, y `deny` por fuera del comando donde se pueda; así el guardia de E §4 no lo marca como desvío. **Cuándo**: al montar,
adoptar o abrir un módulo. **NO VERIFICADO**: qué patrones distingue `settings` dentro de un mismo comando (`--env real` vs `--env dummy`); va a
F en la revisión integral. Hoy "manejar claves" es una categoría, no un patrón; con esto, cada una de las 5 preguntas de A tiene su regla
escrita por proyecto.

*Qué cambia para Guido*: nada que hacer; sus 5 preguntas aparecen como clic solo donde el proyecto dice que duele.

## 16. Las variantes chicas no son niveles (decisión 13; P35) `[consistencia]`

- **"Director de una pestaña + subagentes"** es un **módulo solo** cuya sesión delega a subagentes **en serie**, con razón con nombre (D §15,
  "Módulo solo"). Funcionó por liviana (15 commits, Guido nunca pegó un mensaje): **no se le pone rama, worktree, `bitacora/`, `tiempos.md` ni
  nivel largo** (R-11). Cuando el director de un módulo con director usa subagentes para encargos chicos (D §7.2), el worktree lo crea el
  script (§10.6) y la orden "leé tu encargo y corré el chequeo base" va en la definición del subagente (R-35).
- **"Bandeja operador → dev"** (el cuaderno de errores que quien opera el bot le deja a quien desarrolla; H-57, ~8 veces en ~5 chats): es una
  sección con fecha del **TODO del proyecto**, "Reportado por el usuario", que **B §10 todavía no tiene**: va como nota a B §10 con su evidencia
  (la cita anterior a "B §10, P55" estaba mal: P55 es el estado de Producción del handoff, B §8; R-25). Se documenta en la guía, no en el
  manual del director: es de proyectos sin director.

*Qué cambia para Guido*: nada; lo que ya le funcionó tiene nombre y lugar, y no paga de más.

## 17. `NORTE.md`: lo escribe el Arquitecto y lo lee antes de explorar (decisión 14; P7) `[mejor código · acordarse de menos]`

B §12 definió el archivo (para qué es la app, para quién, qué no hace, los hechos que solo sabe Guido, qué otros sistemas tocan la base). H
dice **cuándo**: lo escribe el Modo A y el adoptador desde la entrevista (y `/relevamiento` lo deja); **el Modo B lo lee antes de explorar el
código**; si falta, **lo arma desde README, `CLAUDE.md` y el código**, como el adoptador, con la sección "hechos que solo sabe Guido" vacía, y
lo muestra **dentro de la misma aprobación del spec**: sin preguntas aparte (B §12 decidió cero preguntas recurrentes; R-18). Evidencia:
H-49, 28 lotes.

## 17bis. Lo verificado contra la doc oficial (2026-10-24, agente `claude-code-guide`, 10 afirmaciones; páginas `worktrees`, `cli-reference`, `hooks`, `tools-reference`, `commands`, `agent-view`)

| Afirmación | Veredicto | Lo que manda |
|---|---|---|
| `claude -w <nombre>` crea `.claude/worktrees/<nombre>` con rama `worktree-<nombre>` | ✅ | Nombres de §10.1 y §10.7 |
| La rama nueva sale de la rama por defecto del remoto; `worktree.baseRef: head` la saca del HEAD; sin commits falla | ✅ | Los encargos no pueden salir de `modulo/<x>` con `-w`: script (§10.2) |
| `-w` acepta rama existente o nombre de rama propio | ❌ (solo nombre, o `#PR`/URL) | Ídem; partir de una rama existente es `git worktree add` a mano |
| Repetir el nombre reabre el worktree existente | ✅ | Prefijo `modulo--` en las carpetas del script (§10.1) |
| Sin cambios: el worktree sin nombre se borra solo; **con nombre pregunta**; con cambios pregunta; con `-p` no limpia | ✅ | Un clic más al salir de `-w <misión>` (§20); `-p` nunca para misiones |
| `.worktreeinclude` en la raíz, sintaxis gitignore, copia solo lo ignorado (`.env`); vale para `--worktree`, subagentes y la app; **no** con hook `WorktreeCreate` | ✅ | Una sola fuente para el `-w` nativo y el script (§10.2) |
| Subagente `isolation: worktree`: base = la misma que `--worktree`; carpeta y rama **NO DOC**; se limpia solo sin cambios; no carga el `CLAUDE.md` del worktree | ✅ / NO DOC | Los encargos no usan `isolation: worktree` (§10.6) |
| Hook `WorktreeCreate` **reemplaza** la lógica git (debe imprimir la ruta); no hay hook post-creación; no dispara con `git worktree add` | ✅ | El setup lo hace el script, no un hook |
| `SessionStart` no distingue worktree; `CLAUDE_PROJECT_DIR` apunta al proyecto original; el `cwd` del JSON sigue al worktree | ✅ | El hook identifica por el `cwd` (§10.3) |
| `-w` con `-p`: ✅ · con `--name`: implícito · `--bg` se aísla solo en un worktree y **salta el aislamiento si ya está en uno** · `--bg` con `-p`: ❌ | ✅ / NO DOC | §10.11, NO VERIFICADO para el `--bg` desde Bash |
| Windows: borrar un worktree respeta junctions y symlinks internos (≥ v2.1.205); no crea worktrees si `.claude/worktrees` es symlink; las aprobaciones "no preguntar más" se guardan en el worktree | ✅ | §10.10; el hook AUTORIZADO de D §7 importa más en worktrees |
| Reanudar vuelve al worktree si se lanza desde el checkout principal; si el worktree no existe, retoma en el directorio de lanzamiento | ✅ | La ficha guarda la ruta del worktree (§10.11) |
| `EnterWorktree` / `ExitWorktree` existen (herramientas); `/worktree` como comando **NO DOC** | ✅ / NO DOC | No se apoya nada ahí |

La tabla completa, con las citas en inglés y las URL, queda en [`PLATAFORMA.md`](PLATAFORMA.md) §7 (nota de H).

## 18. Lo que dicen otros métodos (2026-10-25, un investigador Sonnet; 19 búsquedas, 12 páginas; informe en el acta de la sesión)

| Idea | De quién | Qué hicimos con ella |
|---|---|---|
| "Si podés describir el diff en una oración, salteá el plan"; lo grande: entrevista → `SPEC.md` → sesión nueva | Anthropic, guía oficial de Claude Code | Confirma §5 y §8 |
| Lo chico lleva spec igual si hay **regresión previa** o la causa raíz no es obvia (eje de riesgo) | Kiro (AWS) | Tomado como **red al commit**, no como tamaño (§5.6) |
| Tres tamaños de documento (nada · corto · completo) con una sola puerta humana; el **spike descartable** como excepción | superpowers (`brainstorming`) | Confirma chico · módulo · con director; el spike es el prototipo (§13) |
| Nadie pone tope de criterios por tamaño ni lo chequea con script; Böckeler: 16 criterios para un bug | Thoughtworks, Osmani | §12 es original; el anti-ejemplo calibra |
| "El spec de un bug no crece; lo nuevo es otro spec" | Kiro | §12 |
| El prototipo responde **una pregunta** y su código es descartable | Tessl (registro de skills) | §13 |
| Un nombre por unidad con las convenciones nativas; `.worktreeinclude` es estándar de hecho (Claude Code y Codex); `git check-ignore` antes de crear | Claude Code, Codex, superpowers | §10 (con el prefijo por el reabrir por nombre) |
| Tope de worktrees vivos y foto antes de borrar; HEAD desacoplado | Codex | Descartados con razón (§10) |
| El handoff como **prompt de arranque autocontenido**, inyectado por `SessionStart`; **ofrecerlo** en vez de forzarlo; no hay función nativa (pedido abierto) | claude-handoff, cc-handoff, issue de Anthropic | Confirma B §8 y el pedido de Guido; nada que construir |
| Levantar el entorno y correr una prueba de punta a punta **al abrir cada sesión**; línea base de tests antes de implementar | Anthropic (harness de agentes largos), superpowers | §9.3 |
| Lanzar la pestaña nueva automáticamente | claude-handoff (Windows Terminal) | Descartado: Guido trabaja en la extensión de VS Code |
| Costo por rama/worktree nativo | OpenTelemetry de Claude Code | No existe; sumar transcripts por carpeta (§7.3), NO VERIFICADO |

## 19. La revisión (2026-10-25)

**Antes de decidir, dos lectores**: uno Sonnet sobre el kit instalado, el acta y el playbook (la ficha "hoy", §3, con cita archivo:línea), y el
agente guía sobre la doc oficial de worktrees (§17bis). **Después de la primera tanda**, un investigador Sonnet sobre otros métodos (§18).
**Después de las dos tandas, el revisor frío Opus** (~250 mil tokens): **45 hallazgos: 10 rompen, 18 flojos, 11 mejoras, 6 sobran. Los 45 se
aplicaron**; 6 con un arreglo distinto al propuesto:

| Lo más grave que encontró | Qué se hizo |
|---|---|
| "Liviano" dejaba sin red de F a los proyectos personales con código, donde pasaron los incidentes reales (R-1) | Liviano = solo sin código (§4) |
| La mecánica de worktrees rompía "un escritor por checkout" de cuatro formas: `-w` reabre por nombre (R-2), borrar al mergear deja parado al obrero reutilizado (R-3), mergear la misión plana escribe en el checkout ajeno (R-4), los subagentes ramifican desde el remoto (R-10) | Prefijo `modulo--`; borrar al cerrar el obrero; push por fast-forward sin tocar `main`; script para los subagentes (§10) |
| La línea de apertura no deja adentro del worktree a una pestaña de la extensión (R-6) | Línea de terminal; el obrero verifica su rama y hace PARADA; piloto |
| La regla de bolsillo sigue viva en el `CLAUDE.md` de cada proyecto, que el actualizador no toca (R-7) | La reemplaza el adoptador dentro de su OK; `doctor` la marca |
| `/inicio` preguntaría "¿abro un worktree?" en cada sesión de un proyecto largo (R-8) | Contar solo el mismo checkout, con marca en el `git-dir` propio |
| "Preguntas nuevas: una" no contaba seis cosas (R-28) | Recuento honesto en §20; dos se eliminaron (reabrir antes de montar, las 3 preguntas del NORTE) |

**Los seis con otro arreglo**: R-3 (se identifica la pestaña por la rama, no por la carpeta, y el obrero reutilizado cambia de rama en su carpeta) ·
R-5 (el alias entra al nombre del director solo si el módulo cruza repos) · R-15 (tarea 0 o módulo propio lo decide la misma prueba de tamaño) ·
R-20 (`modulos/v1/` por defecto) · R-28 (el recuento, con dos preguntas eliminadas en vez de contadas) · R-40 (`largo` se calcula; las tres palabras
siguen en la prosa). **Lo que el revisor dijo que estaba bien y no tocó**: la regla de tamaño dicha por la sesión, el script propio de worktree
con el `--`, el hook por `cwd`, el tope medido por script, el chequeo base con "ya estaba roto", el prototipo como spike, el cierre de una línea
y la ficha sin estados nuevos.

## 19bis. La ficha canónica: tres pedidos de punta a punta

**Chico.** Guido, en una sesión plana de Hub: "el total del viernes suma mal". La sesión: *"chico, lo hago acá"*. Arregla, prueba en rojo primero
(A), commitea. El gate ve que el archivo tocado tuvo un fix hace 9 días → revisor Opus congelado en el commit antes del push (§5.6). `/cierre`
de 3 líneas. Sin spec, sin carpeta, sin Arquitecto. **Lo que ve Guido**: una línea al principio y tres al final.

**Módulo solo.** Guido, en Devoluciones: "quiero que el cliente pueda ver el estado de su devolución desde el link del mail". La sesión: *"esto
es más que chico (no se retoma con el diff): llamo al Arquitecto"*. El Arquitecto lee `NORTE.md` (§17), ve que es de pantalla → **prototipo**
HTML con la pregunta "¿con estos tres estados le alcanza al cliente?" (§13); Guido aprueba; spec delta de 7 KB con 6 criterios, "Entorno de
prueba" (hay un `dummy`; chequeo base `pnpm test`) y "Ejecución: módulo solo, una sesión, sin desvío de modelo" (§8, §9, §12); el script da verde
al tope y al entorno; red team no corresponde (no toca plata). Commit en `main` con `docs/modulos/estado-devolucion/` (ficha, `SPEC.md`,
`prototipo/`). Línea: `claude --name sesion-estado-devolucion` + `inicio — ejecutá docs/modulos/estado-devolucion/SPEC.md`. La sesión fresca
corre el chequeo base, construye, `/cierre` mantiene la ficha. **Lo que ve Guido**: un prototipo, un spec de una pantalla, una línea para pegar.

**Módulo con director.** Guido, en Mobile: "una sola identidad entre Desktop y Mobile". El Arquitecto lista las tareas: cuatro carriles que se
escriben a la vez y una noche → **director** (§6). Commit en `main`: `docs/modulos/identidad/` con ficha (`director: sí`, `rama: modulo/identidad`,
`enlaza: desktop:docs/modulos/identidad/README.md@…`), `SPEC.md` de 22 KB con 9 tareas, `tiempos.md`, `planes/`, `bitacora/`; el Equipador instala
director/obrero/tramo → el proyecto pasa a largo (§8.2). `worktree crear identidad` → rama `modulo/identidad`, carpeta `.claude/worktrees/modulo--identidad`,
`.env` copiado, `pnpm install` corrido; línea: `cd .claude/worktrees/modulo--identidad && claude --name director-mobile-identidad --model opus`
(cruza repos: alias en el nombre, §10.4). El director abre el encargo 01: `worktree crear identidad--01` → `modulo/identidad--01` desde la punta
del módulo; línea `cd … && claude --name obrero-identidad--01 --model sonnet`; el obrero imprime su rama, corre el chequeo base (compartido:
solo lectura), reporta "ya estaba roto: 2 pruebas de tiempos" en su primer AVANCE, y sigue (§9.3). Merge `--no-ff` del encargo al módulo cuando
el verificador da verde; el obrero se reutiliza para el 02 en su misma carpeta; `worktree cerrar identidad--01` cuando cierra. Los tokens del
módulo salen de la carpeta de transcripts de `modulo--identidad*` (§7.3). **Lo que ve Guido**: el OK del spec, una línea por pestaña que abre,
los clics de las 5 de A, y `/estado identidad`.

## 20. Preguntas nuevas a Guido, contadas (recuento después de la revisión)

| Pieza | Qué le toca | Cuándo |
|---|---|---|
| §4 / §14 | "¿Lleva código?" dentro de la primera pregunta del Modo A (una respuesta más, no una pregunta más) | Una vez por proyecto nuevo |
| §13 | Aprobar el prototipo | Una vez por feature de pantalla; **reemplaza** varias preguntas de la entrevista |
| §12 | "¿Lo parto acá?" cuando el script avisa que el spec se pasó del tope | Solo si se pasa (corrección de Guido del 2026-10-26: aviso, no corte) |
| §10.7 | "¿Conservo el worktree?" al salir de un `claude -w <misión>` | Solo cuando `/inicio` propuso el worktree (la pregunta de G §11.4) |
| §9.2 | Correr `cargar-secreto` para la base de prueba (una acción, no una pregunta) | Una vez por proyecto y por PC, solo si hay un `real` y no había `prueba` |

**Cuatro preguntas (una negativa en el neto, otra solo si el spec se pasa) y una acción.** Se eliminaron en la revisión: "reabrí la sesión en la carpeta nueva antes
de montar" (R-44) y las 3 preguntas del `NORTE.md` (R-18). **Se van**: los dictados de ejecución (~6: "¿cuántas sesiones, qué modelo, cómo
testeo?"), "¿esto lleva spec?", el chat nuevo de lo chico, los nombres de ramas y worktrees a mano, las preguntas de pantalla que reemplaza el
prototipo, y "¿hay entorno de prueba?" (lo chequea un script).

## 21. Cómo se sabe si funcionó (se mide en el piloto, **Deptos** como D, contra las líneas base de hoy)

| Qué | Línea base | Cómo se mide |
|---|---|---|
| Lo chico no paga spec | Hotfix de 15 líneas con 3 auditores; spec READY ejecutado en 2 min; features de 2-3 archivos con chat nuevo | `lotes.py`: sesiones que llamaron `/arquitecto` o escribieron spec para pedidos que terminaron en <2 sesiones; meta 0 |
| Dictados de ejecución | ~6 ("planeá → spec → red team", "¿cuántas sesiones / qué modelo?", H-39) | `lotes.py` cuenta las frases (script, no lectura); meta 0 |
| Specs proporcionados | 43-55 KB (Hermes); 15-66 KB (vibe-kit); 16 criterios para un bug (afuera) | El script del tope al READY; tamaño medio y criterios de los specs nuevos |
| Entorno de prueba | "Ensayo" confundido 3 veces en un día; pruebas con usuario real (H-50) | `flota.py`: repos con `entornos:` y `clase: prueba`; "ya estaba roto" vs "rompí" en los AVANCE |
| El arreglo del arreglo con red (§5.6) | 26% de los arreglos arreglan otro arreglo; 0-45% traen prueba | `repos.py`: % de fixes sobre archivo con fix reciente que llevan prueba y revisión; meta: que el 26% baje |
| Prototipo (§13) | Idas y vueltas de pantalla después del spec; aprobación en minutos cuando hubo prototipo (5 lotes) | Features de pantalla con `prototipo/`; rondas de "no era así" después del READY |
| `sensible:` como reglas (§15) | "Manejar claves" es una categoría; ~30 frenos sobre lo ya autorizado (H-33) | Reglas `ask` generadas por repo (`flota.py`); pop-ups de las 5 de A por tramo (C §4) |
| Carpeta real | 1 caso (P10) | 0 |
| Uso del Arquitecto | 10 llamadas en 7 carpetas; 0 en la PC `Usuario`; 1 Modo B real | Módulos abiertos por el Arquitecto / módulos totales (ficha con `SPEC.md`) |
| Tokens por subproyecto | No existe | `costos.py` por carpeta de worktree (NO VERIFICADO, piloto) |

## 22. Lo que se va a otro racimo o queda en espera, y las notas que H deja

- **A**: §5.6 (el arreglo del arreglo: red al commit dentro de `gate:fix-sin-prueba`); `worktree remove --force` al corrector de A §6.
  **B**: §9 (el hook identifica la pestaña por la rama del `cwd`, inyecta la cabecera de la ficha, y en el encargo no inyecta el handoff);
  §10 (la sección "Reportado por el usuario" del TODO, H-57); §20 (nombres cerrados). **C**: §2.5 (subproyecto = módulo; `/estado <x>`).
  **D**: §4 (en serie = módulo solo); §7.6 (`obrero-<x>--<ID>`; `director-<alias>-<x>` si cruza); §8 (nombres de ramas; borrar al cerrar el
  obrero); §10.5 (la red del arreglo del arreglo); §12.8 (tarea 0 o módulo propio, por tamaño); §19 (cerrado). **E**: §4 (`nivel: liviano |
  estandar`; `largo` calculado; `comando-setup` en `vars:`); §14 (nombres cerrados; S-D-4 y S-M-1 cubiertos por D §12.1: el gate es script).
  **F**: §9 (`clase:` en vez de `nivel:` para los entornos; `.claude/worktrees/` en el snippet; `RECOVERY`, `PROTECTED_PATHS` y `CRONS` con los
  `real`); §13-§14 (los patrones de `sensible:` → reglas, NO VERIFICADO: revisión integral). **G**: §12 (el nombre del director con alias si
  cruza); §22 (cerrado). **TABLERO §10**: fila H ✅. **PLATAFORMA §7**: la tabla de worktrees.
- **Misión 5**: el script `worktree` (`crear`, `abrir`, `sync-env`, `cerrar`); el script del tope del spec; el chequeo de entorno
  (`gate:entorno-prueba`) y el chequeo base al abrir; `formato-spec.md` (Ejecución; Entorno de prueba; `archivo:línea` en Contexto;
  `[SIN CONTRASTAR]`; READY después del red team); el `SKILL.md` del Arquitecto (ruteo con triage, "Ejecución", `modulos/*/SPEC*.md`, el rebote de
  lo chico, el prototipo, `NORTE.md`); retirar la regla de bolsillo de los 5 archivos y de la `description`; la línea del triage en el
  `CLAUDE.md` del molde; el generador de reglas desde `sensible:`; la marca de sesión en el `git-dir` para `/inicio`; PLAYBOOK §1.5.
- **Piloto (Deptos)**: tokens por carpeta de worktree; `--bg` dentro del worktree; `--resume` por `cwd`; la pestaña de la extensión en un
  worktree; los números del tope; `core.longpaths` y el `comando-test` que no entre a `.claude/worktrees/`; que `SessionStart` no corra en
  subagentes.
- **En espera**: `/retro` (P22) y el glosario (P21), como en D · un chequeo de "es feature de pantalla" por script (hoy lo decide el Arquitecto).

## 23. Límites de este diseño

- **Lo que no vi**: cómo abrieron trabajo chico vs grande Hub, Deptos, Devoluciones, Bot y el Panel (no está caso por caso en el acta); el texto
  fuente de S-R-6 (no está en el repo; solo su cita "un spec READY se ejecutó en 2 min"). La lectura de contraste (§2) lo puede traer.
- **Evidencia de uso del Arquitecto escasa** para calibrar (10 llamadas, un Modo B real): los números de §12 y la frecuencia de §13 se calibran en
  el piloto.
- **Diez NO VERIFICADO** van al piloto (§22); ninguno frena el diseño: cada uno tiene un camino sin él (sin `--bg`, Guido abre; sin tokens por
  carpeta, el total del proyecto; sin pestaña en worktree, la terminal integrada).
- No decide la política de **cuándo un proyecto pasa de `liviano` a `estandar`** (le aparece código): hoy es "el Arquitecto lo adopta de nuevo";
  se verá si pasa.

## 24. Los 11 criterios, aplicados a este racimo

| # | Criterio | Cómo lo cumple H |
|---|---|---|
| 1 | Menos intervención de Guido | No decide tamaño, director, nombres ni entorno; tres preguntas nuevas contadas (una negativa en el neto) y una acción; se van ~6 dictados, "¿lleva spec?", el chat nuevo de lo chico y las preguntas de pantalla (§20) |
| 2 | Pragmático, recortado | Una sola regla de tamaño donde había cuatro; `largo` no se escribe; sin secciones nuevas en el spec; sin tope de worktrees ni foto; sin chequeo del `CLAUDE.md` por 1 caso; las variantes chicas no son niveles; el arreglo del arreglo no es módulo; descartes escritos con razón en cada sección |
| 3 | Medible | 10 medidas con línea base (§21), 8 por script; piloto nombrado (Deptos) |
| 4 | Software que anda y se sostiene | Entorno de prueba declarado y verificado, chequeo base al abrir con "ya estaba roto"; red del arreglo del arreglo (26%); `RECOVERY`/`PROTECTED_PATHS`/`CRONS` no se pierden (§4); `sensible:` como reglas escritas |
| 5 | Tokens y el modelo justo | Lo chico no paga spec ni auditores ni chat nuevo; el spec con tope; la Ejecución solo con el desvío del modelo; el hook del encargo no inyecta el handoff; prototipo por Sonnet; lectores Sonnet, revisor Opus, Fable solo en la charla |
| 6 | El script antes que el modelo | El tope del spec, el chequeo de entorno, el chequeo base, los nombres de ramas y worktrees, la identificación de la pestaña por la rama, la marca de sesión para `/inicio`, las reglas desde `sensible:`, el gate del arreglo del arreglo: ninguno lo dice el modelo. Lo que sigue siendo del modelo (y se dice): "¿es chico?", "¿es de pantalla?" y dónde proponer el corte de un spec que se pasó (la decisión es de Guido) |
| 7 | Seguro por defecto | Lo personal con código conserva toda la red de F; `gate:entorno-prueba` es freno con nombre y rastro; el script se niega a borrar lo no mergeado o con cambios; `worktree remove --force` al corrector; las 5 de A como reglas por proyecto; el prototipo nunca va a producción |
| 8 | Portable | Nombres y rutas los pone el script igual en las 3 PCs; `worktree abrir` para el compañero y la otra PC; la ficha guarda la ruta del worktree; valores de máquina en ASCII; nada depende de la app de escritorio (línea de terminal, HTML en el navegador) |
| 9 | Lo chico no paga lo grande | Es el racimo: chico sin spec, chat nuevo, director ni carpeta; módulo solo sin rama, worktree, `tiempos.md` ni bitácora; tiempos y tokens solo con director; sin dummy si no hay `real`; worktree solo con segunda sesión viva en el mismo checkout |
| 10 | Autónomo pero con rastro | Cada módulo nace con un commit en `main`; cada encargo es una rama con nombre mergeada `--no-ff`; el prototipo queda en la carpeta; "ya estaba roto" queda en el AVANCE y el TODO; el `gate:entorno-prueba` quitado queda en `frenos.quitados` |
| 11 | Piloto antes de flota | Deptos primero (como D); 10 NO VERIFICADO con su prueba y su camino sin ellos (§22-§23); los números del tope se calibran antes de la flota; la lectura de contraste contrasta estas decisiones con los chats antes de la revisión integral |

## 25. Revisión integral con el acta de contraste (2026-10-26)

Con [`tips/tanda-2026-11-contraste.md`](../../tips/tanda-2026-11-contraste.md) abierta. Lo que cambió en H:

| Qué | Veredicto del acta | Qué se hizo | Dónde |
|---|---|---|---|
| H-6 · el spec no crece | contradicha (✘222 / ✔21): 9-12 desvíos por tramo | El desvío declarado es el canal legal; contador por script que nunca frena al obrero; partir solo en corte natural y por alcance; tope orientativo NO VERIFICADO | §12 |
| H-5 · el entorno se verifica antes | contradicha (✘176 / ✔100): lo roto tarde son las herramientas | "Entorno" = base + herramientas, una línea de chequeo por herramienta; "necesita a Guido de día" en el encargo; fallback del navegador en `smoke`; absorbe P69 | §9 |
| E-1 · la puerta | contradicha (✘84 / ✔11) | El sello del Arquitecto en "Ejecución"; sin sello no hay READY ni obrero; Modo B corto; P61 obligatorio en el largo | §6, §8 |
| H-1 · lo chico no pasa por el Arquitecto | contradicha (base, 15 lotes) | Nada: H-2 es el remedio | — |
| H-2 · el arreglo del arreglo sigue chico, con prueba primero | confirmada (✔239 / ✘0) | Nada; el conteo justifica la prueba primero | §5.6 |
| H-3 · varias sesiones seguidas no justifican director | contradicha (base + premisa chica): el director en serie también lleva la mesa y el relevo | Quién lo hace sin director: `/cierre` mantiene la ficha (relevo) y la mesa la lleva la sesión plana con el aviso por mensaje de G; se mide en el piloto qué directores de Mobile dejan de existir (D-1) | §6 |
| H-4 · el Arquitecto termina armando | contradicha (base, ✘201) | Nada; es el mismo hecho que el ✔ de D-4 | — |
| H-7 · prototipo antes del spec | confirmada (✔103 / ✘15) | Nada; quedan 1-2 ajustes de rótulos, normal | §13 |
| H-8 · el Arquitecto monta en la carpeta real | sin evidencia (4 lotes) | Nada | — |
| B-2 · tres tamaños | confirmada, con un pedido: dónde caen release, relevamiento de solo lectura, bloque de mesa o documentos, tarea operativa recurrente | Para el spec: release es un pedido chico de `/release`; relevamiento y bloque de documentos son módulo solo si llevan más de una sesión; la tarea recurrente es chica y se repite | §4-§5 |

Los 11 criterios de §24 no cambian de veredicto. El criterio 9 (lo chico no paga lo grande) es el que Guido defendió en H-6: el contador
informa y no frena. **NO VERIFICADO nuevo para el piloto**: el tope de desvíos y sub-pasos; cuánto tarda el Modo B corto.

