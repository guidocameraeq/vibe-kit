# SPEC delta: paquete 8d — la `rc.7`, la candidata a la `v3.0`: el dueño no tipea nada y una noche termina sola — vibe-kit

La `rc.7` junta las **ocho partes** que Guido cerró el 2026-11-12 después de la revisión (cinco informes `REVISION-rc7-*.md`, ítems 17 a
60 de "De la prueba real" del tracker). No rediseña el kit: mueve el último tramo de la noche a donde hay alguien que lo haga, deja la
firma del dueño en un clic, y saca lo que frena sin proteger.

- Estado: **READY** (2026-11-12). Guido contestó la única pregunta de diseño (por el director del tramo): *"el clik lo quiero hacer
  siempre en director, las aprobaciones son con el, no con los obreros"* (A2.3, D8d-6, P7). Red team: una ronda sobre el spec entero
  (3 ALTOS, 8 MEDIOS, 3 BAJOS) y una segunda solo de lo ALTO (4 ALTOS, 3 MEDIOS): los 21, integrados (ver "El red team del spec").
- Fecha: 2026-11-12 · Misión: 5, tramo final, **sesión 1** (`TRAMO-FINAL-PLAN.md`). La vara: ADR-029, ADR-030 y ADR-034.
- **Nivel de la `rc`: COMPLETO** (`docs/CICLO-DE-MEJORA.md` §3.6): toca frenos, suma una pieza que publica y rediseña la adopción. Cada
  cambio dice su nivel en la tabla; cada tanda corre solo las pruebas de lo que toca; la suite entera, una vez, al final de la C.
- **Base**: el tag `v3.0.0-rc.6` más lo que tenga `main` (hoy, solo documentos). Explorado sobre `main` @ `622f919`.

## Resumen para el director

1. **Terminó**: el plano de la `rc.7` está escrito, con sus dos rondas de red team integradas, y está **READY**: Guido contestó la
   única pregunta de diseño.
2. **Cubre** las ocho partes en 21 cambios, repartidos en tres tandas que no tocan los mismos archivos: **A** los frenos, la ficha y la
   firma · **B** la noche, `/estado` y el camino de fondo · **C** adoptar, la PC, lo chico, y al final la suite, la flota y el tag.
3. **Ojo con el reloj**: la A entra en ~4 h; la **B y la C van a pedir una continuación cada una** (~6 h de trabajo cada una). Cada
   tanda trae su orden: primero lo que mide el criterio de éxito, después la "segunda línea". Son **cinco sesiones, no tres**.
4. **Pruebas corridas en esta sesión: ninguna** (no se tocó código). Lo afirmado sobre el código lo miraron cinco lectores y lo que
   decide el diseño lo verifiqué yo en el archivo; lo que no, dice `[L]`.
5. **Lo que decidió Guido** (2026-11-12): **el clic para aprobar un cambio de freno lo hace en la pestaña del director**, nunca con
   un obrero. Como eso no está probado con una persona y afloja un freno, va con su prueba (P7), su plan B (el clic en una sesión de
   la carpeta principal, que sigue andando) y el agujero cerrado: un obrero no puede firmar por el director (A2.3). **No le queda
   nada pendiente a Guido en este spec**; lo suyo vuelve en la tabla "Dónde lo necesita a Guido" del plan del tramo.
6. **Decisiones técnicas mías** (tabla "Decisiones de la sesión del spec"): 22. Las que más pesan: la noche publica por **un script
   del kit que chequea las dos autorizaciones** (la ficha y la PC) antes de correr nada, y la sesión de cierre corre con una **lista
   cerrada**: lo que no está en la lista no corre; si cambia cómo se publica, la noche **deja de publicar hasta que Guido vuelva a
   autorizar esa PC**; los tres frenos del proyecto pasan a **un solo proceso**; el registro de frenos del día a día **sale del
   árbol** de git; los nombres con "guido" quedan como alias viejos.
7. **Siete cosas se prueban antes de prometerlas**, cada una con su plan B escrito (sección "Probar antes de prometer"). Una le toca a
   Guido de costado: autorizar una PC a publicar es **un clic si la prueba P2 sale bien, y una línea de PowerShell si no**.
8. **La noche de prueba de R2** está armada sobre un clon de Deptos sin claves ni Docker, con un "publicar" de mentira contra un
   remoto de prueba, y dice cómo se mide cada uno de los cuatro criterios.
9. **Lo que más importa**: el éxito de la `rc.7` depende de la tanda B (el cierre de noche); si hay que recortar, se recorta la
   segunda línea de cada tanda, nunca el cierre, `/estado` ni la firma. Y **publicar sola es la pieza más delicada**: el red team
   le encontró siete cosas graves en dos rondas (todas arregladas en el texto); la tanda B le hace otra ronda antes de cerrarla.

## El cuadro conceptual: qué sigue igual, qué cambia y quién lo hace

**Sigue igual** (la mirada 2, A1-A10; nada de esto se toca): el plano sellado antes de construir y construir en otra sesión · "manda
git, no la charla" · un obrero por encargo, como sesión `claude -p` propia en su carpeta, con sus permisos justos · el gate por script y
la prueba que falla antes y pasa después · el revisor frío de una vuelta · el red team del encargo que toca plata · `secretos` y el
candado con gitleaks · el actualizador con zona propia y fusión · el presupuesto y la vara · el observatorio y el NO VERIFICADO. También
se quedan: `/tramo` y sus agentes (REJ-017), `idleCompaction` como viene, el director que entra con `EnterWorktree` y **nunca sale**, y
la firma de un cambio de freno tal cual se valida hoy (`validarSello`, `commitDelSello`).

**Cambia**, y quién lo hace:

| Quién | Antes (`rc.6`) | Ahora (`rc.7`) |
|---|---|---|
| **El dueño** | Pega comandos (aprobar, cerrar carpetas, el cierre, la limpieza), abre cada obrero, lee un `/estado` del director, recibe "rojo" y códigos | **No tipea nada.** Firma con un clic en la ventana de permiso, **en la pestaña del director**; lee un `/estado` suyo de cuatro secciones fijas y un parte de la mañana sin comandos; autoriza publicar una vez por PC |
| **El director** | Integra y le deja al dueño cerrar, publicar y limpiar; se muda al 40 %; ofrece un despertador que no despierta; no sabe cómo se llama nadie | Integra y **lanza la sesión de cierre**; lanza él a los obreros (de fondo, por defecto); antes de cada espera larga deja todo commiteado y el relevo; propone los cambios de freno directo en la rama por defecto y **le pide la firma al dueño en su pestaña**; tiene nombre fijo |
| **El obrero** | Manda mensajes que a veces le llegan a otro; no ve una corrección; para sin guardar | De fondo no manda mensajes: su resultado es el fin del proceso y lo que dejó en git; `presentar` le trae la corrección; guarda antes de parar; sabe quién es su director |
| **La sesión de cierre** (nueva) | No existe: la carpeta principal queda esperando al dueño | Una sesión de fondo **en la carpeta principal**, con una lista cerrada de lo que puede correr, que trae lo integrado, publica si el proyecto y la PC lo autorizan, corre la prueba de humo, hace el `/cierre` del proyecto, limpia y deja el parte. No toca código ni aprueba nada |
| **El Equipador** | Adopta poniendo "no" de fábrica y sin mirar si el repo queda andando; prepara la PC solo con lo que ya está bajado | Dice qué piezas propias reemplaza, verifica que el repo queda andando, pregunta si publica o gasta plata; trae los repos de la cuenta que el dueño elija; arma la autorización de publicar |
| **Los frenos** | Cuatro procesos por comando con 20 s; niegan por leer una palabra; el clic de aprobar vale solo si la sesión está en ese repo | Un proceso del proyecto y uno de la PC; miran el comando y no el texto; el freno de aprobar corre en toda sesión de la PC; dos agujeros cerrados |

**Las cinco puertas** (mirada 2, E5): dónde se abre cada autorización. Va también a `manuales/MOLDE.md` (C5).

| Puerta | Qué mira | Dónde se abre en la `rc.7` |
|---|---|---|
| Permisos (`allow`/`ask`/`deny`) | la forma del comando | Para una sesión de fondo, **solo** por la lista de su línea de lanzamiento (`autorizado` para el obrero, `noche.cjs cierre` para el cierre). Las `allow` del proyecto no valen de fondo (tracker 39): no se cuenta con ellas |
| Clasificador del modo `auto` | la intención (publicar, tocar la propia configuración) | El obrero sigue en `auto`. **La sesión de cierre no pasa por él**: corre en `dontAsk`, donde lo que no está en su lista se niega y lo que está corre (B3). Para una sesión de día del dueño, la entrada de `autoMode.environment` que escribe "preparame esta PC" (tracker 37) |
| Frenos del kit (hooks) | el comando partido, la carpeta de la sesión, el rol, la noche | `cambios aprobar`, con el clic del dueño, en la pestaña del director (o en una sesión de la carpeta principal); nunca en la de un obrero |
| Aislamiento de la carpeta | `git` hacia afuera | No se abre: el director no sale; lo de la carpeta principal lo hace la sesión de cierre o un script de `node` |
| Candado (githooks) | lo que se commitea y se sube | Un cambio aprobado |

## Por qué (el dolor)

- **La noche no termina sola** (18, 36, 38, 54). Las dos noches de Deptos integraron sin intervenciones y después esperaron al dueño
  entre 1,5 y 8 horas: cerrar, publicar, el `/cierre` y limpiar piden la carpeta principal, donde no vive ninguna sesión del kit.
- **El dueño tipea** (33): 66 renglones con un comando en el molde; en un día, dos aprobaciones a mano (una falló por `&&` en
  PowerShell), tres líneas de `preparar-pc`, siete tareas de limpieza. Un cambio de freno esperó 20 horas (41).
- 🔴 **La firma tiene un agujero** (40): una sesión abierta en otra carpeta aprueba un cambio de freno sin ventana, y el candado lo deja subir.
- **`/estado` no es del dueño** (32, 47): una sola de cuatro líneas de "te espera" era suya; el cambio que esperaba su clic no salía.
- **Jerga** (34, R21): "rojo" y "verde" le llegan por la prosa de las sesiones; "Guido" está escrito en el kit que se instala.
- **Dos diseños adentro** (46, 28, 31, 59): el de pestañas y el de fondo; las noches usan solo el segundo (60 de 60 encargos).
- **Los frenos se cuelgan y niegan lo inocente** (42-45, 55, 56): 12 cuelgues en dos noches, todos inocentes; la suite sin turno.
- **Adoptar rompe sin avisar** (52, 53; 5 de 7 repos) y **preparar la PC no trae los repos** (60).

## Contexto (explorado el 2026-11-12; `[L]` = lo trajo un lector y no lo abrí yo)

Rutas: `M` = `kit/molde/` · `H` = `M/hooks/` · `L` = `M/hooks/lib/` · `S` = `M/scripts/` · `K` = `M/skills/` · `EQ` =
`kit/skills/arquitecto-skills/` · `ES` = `EQ/scripts/` · `PC` = `EQ/pc/` · `AR` = `kit/skills/arquitecto/`.

- **Los frenos**: `M/settings.json` registra para `Bash|PowerShell` tres procesos (`niega-aprobar`, `git-seguro`, `sensible`), cada uno
  `timeout: 20` y `onFailure: block`; la PC suma `secretos.cjs` (`ES/instalar-hooks-pc.cjs:82-85`, un solo script cableado). Los tres
  exportan `decidir(entrada)` pura y guardan `principal()` bajo `require.main === module` `[L]`; solo `git-seguro` se pone un plazo
  propio (15 s) `[L]`. `niega-aprobar` decide por las dos palabras en cualquier lugar (`H/niega-aprobar.cjs:26-30`) y niega todo rol que
  no sea `humano` (`:84-87`). `sensible` exige cada bandera "tal cual" (`H/sensible.cjs:138-150`) y fuera de la noche devuelve `ask`
  (`:523-531`); la noche es la marca `.kit-noche` del worktree **del director** (`L/contexto.cjs:173-191`): la carpeta principal nunca
  es "de noche". `git-seguro` da por mezclada una rama por ancestría `[L]` y trata como "amplia" una ruta con `[` `[L]`.
- **La firma**: `S/cambios.cjs:404-424` exige rol `humano`, la carpeta principal, la rama por defecto y el cambio commiteado en `HEAD`;
  escribe `aprobo:` y un renglón en `.claude/frenos.log`, en un commit propio que el candado busca en la historia de la rama por defecto
  `[L]`. `autorizado:<clave>` de la ficha **ya es barrera por clave** (`L/cambios.cjs:26, 426, 506-507`).
- **`frenos.log`** está versionado a propósito (`M/gitignore.snippet`, última línea; `merge=union`) y **la firma depende de él** `[L]`.
- **El director** (`K/director/SKILL.md`, 7.983 B de 8.000): paso 4 "Por defecto la hace el dueño"; paso 7, mudanza al 40 %; paso 8, el
  despertador; paso 9, le da al dueño `cerrar <x>` y el `/cierre`; paso 10, nunca `/cierre`. `integrar` termina en *"después: /cierre en
  tu carpeta principal"* (`S/worktree.cjs:1128`), empuja con 120 s (`:1120`) y su candado de "encargo abierto" mira ramas, no la
  ficha (`:1172-1182`). `cerrar` se niega solo desde adentro (`:924`).
- **El encargo**: `Skill` solo admite `obrero` (`L/encargo.cjs:132-133`); `Apertura` es `Guido | director` (`:149-150`); `Suscripción`
  es obligatorio y nadie lo lee (`:68`). La línea de fondo es `cd "<wt>" && printf … | <claude> -p --model … --permission-mode auto
  --allowedTools …` (`S/encargo.cjs:355-364`). `presentar` corre el `comando-test` entero con 10 min fijos; `verificar` e `integrar`, 30 `[L]`.
- **`/estado`** (`S/estado.cjs`): "TE ESPERA" sale solo de las fichas; "cerrado" es "rama contenida", y un encargo cuya rama se borró
  deja de contarse `[L]`. `noche.cjs` usa otra cuenta (la evidencia sin PARADA en la rama del director, `:138-139`) y no arma ningún parte.
- **La PC**: `ES/preparar-pc.cjs` ya escribe `autoMode.environment` desde las fichas de la carpeta de proyectos (`:393-460`), anota lo
  suyo en `~/.claude/kit-pc.md` y el `doctor` lo compara (`ES/doctor.cjs:666-677`). No lista ni clona repos; deja carpetas vacías `[L]`.
- **La adopción** (`ES/lib/adoptar.cjs`): `sensible` y las piezas `release`/`smoke` salen de fábrica en `no` sin mirar el proyecto;
  `comando-test` es siempre `npm test`; no corre el arranque ni el `comando-test` al final; `molde+propio` sale de que el molde tenga
  zona propia, no de que esté tocada; `--traer` sale 0 sin traer `[L]`.
- **El actualizador nunca toca el `CLAUDE.md`** de un repo adoptado (`ES/lib/catalogo.cjs:63`): una regla nueva va en el núcleo, las
  skills o el arranque. `/inicio` (8.594 de 8.600) y `/cierre` (7.994 de 8.000) no admiten una línea más.
- **Copias que una prueba fija idénticas**: `ficha.cjs` y `proceso.cjs` ×3 (`L`, `PC/lib`, `AR/scripts/lib`); las otras ocho de `PC/lib` ×2 `[L]`.
- **Deptos** (leído de `origin/main`, sin tocarlo): ficha en `rc.6`, `release: no` en `sensible`; su `/release` publica a Vercel y
  aplica migraciones a la base real; su `comando-test` corre **sin base ni `.env`** (~3-5 min con la PC libre) `[L]`.

## Pedido original, textual

> Sos quien escribe el plano de la `rc.7`, la candidata a la `v3.0`. Guido: *"el spec es la parte más importante"*. El alcance ya está
> decidido […]: tu trabajo es convertirlo en un delta que una sesión de construcción pueda seguir sin volver a pensar el diseño. […]
> El cuadro conceptual primero […]. Cada cambio con: el ítem del tracker de donde sale, qué archivos toca, el criterio que lo prueba
> (que una prueba automática pueda fallar si el cambio no está), el nivel de control y la tanda a la que va. Partí las ocho partes en
> tres tandas que no toquen los mismos archivos […]. Lo que hay que probar antes de prometerlo […]. La noche de prueba de R2 […]. Red
> team obligatorio […]. El sello […]. *(`TRAMO-FINAL-PLAN.md`, sesión 1, 2026-11-12.)*

## AGREGA y MODIFICA

### La tabla: cada cambio con su ítem, sus archivos, su prueba, su nivel y su tanda

| # | Cambio | Ítems | Archivos | Prueba que lo cubre | Nivel |
|---|---|---|---|---|---|
| **A1** | La ficha: `autorizado.publicar` y los nombres sin persona | 48, R21 | `L/ficha.cjs` (y sus dos copias), `M/kit.ejemplo.md`, `H/sensible.cjs` (la guardia de publicar) | `ficha.test`, `copias.test`, `pc/lib.test`, `sensible.test`, `lib/cambios.test` | medio-alto |
| **A2** | Aprobar: el freno corre en toda la PC, mira el comando y habla claro | 40, 43a, 33, R6 | `H/niega-aprobar.cjs`, `PC/niega-aprobar.cjs` (copia), `PC/secretos.cjs`, `ES/instalar-hooks-pc.cjs` | `niega-aprobar.test`, `pc/secretos.test`, `instalar-hooks-pc.test`, **mutación** | **completo** (freno) |
| **A3** | Un cambio de freno nacido en un módulo se propone directo en la rama por defecto | 41, R15 | `S/cambios.cjs` (`nuevo --en-defecto`), el aviso de `PC/secretos.cjs` | `scripts/cambios.test`, `pc/secretos.test` | medio-alto |
| **A4** | Los dos agujeros: la bandera abreviada y `merge -s ours` | 55 | `H/sensible.cjs` (`empiezaCon`), `H/git-seguro.cjs` | `sensible.test`, `git-seguro.test`, **mutación** | **completo** (freno) |
| **A5** | Frenos que no se cuelgan: un proceso, plazo propio y aviso honesto | 42, 25 | `L/portero.cjs` (nuevo), `M/settings.json`, el plazo en los tres hooks y en `PC/secretos.cjs` | `lib/portero.test` (nuevo), `settings.test`, los tres `*.test`, **mutación** | **completo** (freno) |
| **A6** | `frenos.log`: lo de todos los días sale del árbol; la firma se queda | 44 | `L/frenos-log.cjs` (y su copia) | `frenos-log.test`, `lib/cambios.test` (la firma sigue), `kit-githook.test` | medio-alto |
| **A7** | Lo inocente: leer `.claude/`, las ramas `tmp/`, borrar con el clic del dueño, rutas con corchetes, `sensible` de fondo | 43, 55, 25 | `PC/secretos.cjs`, `H/git-seguro.cjs`, `H/sensible.cjs` | `pc/secretos.test`, `git-seguro.test`, `sensible.test`, **mutación** | **completo** (freno) |
| **A8** | Lo que estos archivos le dicen al dueño | R10, R21, 34, 33 | `H/git-seguro.cjs`, `M/githooks/kit-githook.cjs`, `L/candado.cjs`, `S/cambios.cjs`, `kit/habla.cjs` (nuevo, ayuda de pruebas) | `hooks/habla.test` (nuevo), `kit-githook.test`, `git-seguro.test` | liviano |
| **B1** | Una sola cuenta de "encargo cerrado" y una sola lista de "te espera" | 47, 24, 21 | `L/encargo.cjs` (`estadoEncargo`), `L/espera.cjs` (nuevo) | `lib/encargo.test`, `lib/espera.test` (nuevo) | medio |
| **B2** | `/estado` del dueño | 32, 54, 24 | `S/estado.cjs`, `K/estado/SKILL.md` | `estado.test`, `skills.test` | medio |
| **B3** | La noche termina sola: la sesión de cierre, publicar, limpiar y el parte | 18, 36, 38, 48, 54, 37, 33 | `S/noche.cjs` (`cierre`, `cierre-empieza`, `publicar`, `subir`, `parte`), `K/director/cierre-noche.md` (nuevo), `S/worktree.cjs` (`limpiar`, la última línea de `integrar`), `K/director/SKILL.md` (paso 9) | `noche.test`, `worktree.test`, `skills.test`, **mutación** en `publicar` | **completo** (pieza nueva que publica) |
| **B4** | Un solo camino, el de fondo; `Skill: tramo`; los nombres | 46, 28, 31, 19, 20, 59, R7 | `L/encargo.cjs`, `S/encargo.cjs`, `S/noche.cjs` (sin despertador ni 40 %), `K/director/*`, `K/obrero`, `K/tramo`, `K/nucleo` | `lib/encargo.test`, `scripts/encargo.test`, `noche.test`, `skills.test` | medio |
| **B5** | El turno de la suite | 45, 56 | `L/proceso.cjs` (y sus dos copias), `S/encargo.cjs`, `S/worktree.cjs`, `S/noche.cjs` | `proceso.test`, `scripts/encargo.test`, `worktree.test` | medio |
| **B6** | La regla de cómo se le habla al dueño | 34, 33 | `K/nucleo/NUCLEO.md` (§9), `L/inyeccion.cjs`, `M/CLAUDE.md`, `L/topes.cjs`, los textos de `S/*` | `skills.test`, `inyeccion.test`, `scripts/habla.test` (nuevo) | liviano |
| **B7** | El taller del director (segunda línea) | 21, 22, 24, 30, 43c, 57, R17, R18 | `S/worktree.cjs`, `S/paquete.cjs`, `S/tiempos.cjs`, `S/encargo.cjs`, `L/encargo.cjs`, `K/obrero` | `worktree.test`, `paquete.test`, `tiempos.test`, `encargo.test` | medio |
| **C1** | Adoptar sin romper | 52, 53 | `ES/lib/adoptar.cjs`, `ES/lib/chequeo.cjs`, `ES/actualizar.cjs` (el estado `molde+propio`) | `adoptar.test`, `chequeo.test`, `actualizar.test`, **mutación** en la verificación | **completo** (adopción) |
| **C2** | Preparar la PC: trae los repos de la cuenta, arma la autorización de publicar, no deja carpetas vacías | 60, 10, 37, 35a | `ES/preparar-pc.cjs`, `ES/traer-repos.cjs` (nuevo), `ES/doctor.cjs` (`automode`), `ES/lib/flota.cjs` (`core.longpaths`) | `preparar-pc.test`, `traer-repos.test` (nuevo), `doctor.test` | medio-alto |
| **C3** | El Arquitecto: lista o cola, lo del dueño antes de lanzar, el nombre del director | 17, 57, 59, R11, R18 | `AR/anexos/modo-b.md`, `AR/anexos/formato-spec.md`, `AR/scripts/arquitecto.cjs` | `skill.test`, `arquitecto.test` | liviano |
| **C4** | Lo chico del Equipador | 35b, 35c, 11, 50, 51 | `ES/doctor.cjs`, `ES/lib/adoptar.cjs` (`--traer`), `ES/actualizar.cjs`, `ES/lib/flota.cjs`, `EQ/SKILL.md`, `AR/anexos/flota.md` | `doctor.test`, `adoptar.test`, `actualizar.test`, `flota.test`, `skill.test`, `skills/habla.test` (nuevo) | medio |
| **C5** | La guía, los manuales, una sola ruta de instalación y la nota de migración | 51, B4 | `GUIA-DE-USO.md`, `manuales/*`, `kit/INSTALAR.md`, `kit/CHANGELOG.md` | lectura del revisor frío | liviano |
| **C6** | La suite, la flota, el clon real y el tag | — | `kit/VERSION`, el tag | crit. 20-22 | — |

No hay un archivo en dos tandas. Tres cosas cruzan y se parten **por dueño del archivo**: los textos con "Guido" y "rojo/verde" (A8, B6,
C4, cada una con su prueba `habla.test` en su carpeta, las tres con la ayuda `kit/habla.cjs` que crea la A); quién **escribe**
`frenos.log` (A6) y quién lo **lee** (B: `resumen.cjs`, `/cierre`; C: `doctor`, `adoptar`); y el turno (la lib en B5, la llamada del
`sello` en C3).

---

### Tanda A — los frenos, la ficha y la firma

**Orden**: A0 → A1 → (A2+A3 ∥ A4+A7 de `git-seguro` ∥ A4+A7 de `sensible` ∥ A6) → A5 → A8 → el revisor frío. Los cuatro grupos del medio
no comparten archivos (`secretos.cjs` va entero con A2+A3+A7). **Segunda línea** (si no entra): A7 (d), A8.

**A0 · Medir antes** (no cambia código; 30 min). Con la suite corriendo sola en segundo plano y cuatro lanzadores en paralelo, cien
llamadas a cada hook con una entrada inocente (`echo hola`) y una que niega: el tiempo de cada una (mediana, percentil 99, máximo), y lo
mismo con los tres dentro de un solo proceso. El número queda en "Lo que salió al construir" y fija el plazo de A5.

**A1 · La ficha.**
1. `autorizado.publicar`: `no` (lo que rige si falta) o un mapa en línea `{comando: "<uno>", humo: "<uno>", volver: "<uno>"}`. `comando`
   y `humo` obligatorios, `volver` opcional. Cada uno es **un** comando, sin `&`, `|`, `;`, `>` ni `<`, y de **una de dos formas**
   (r2-4: así se sabe qué archivo mirar para saber si cambió cómo se publica): `<node|py|python|bash|sh|pwsh> … <un archivo del
   repo> …`, o `<npm|pnpm|yarn> … run <script>`. Si publicar pide varios pasos o leer claves, el proyecto los envuelve en un
   script suyo. **`comando: al-subir`** es el proyecto que publica solo cuando se sube a la rama por defecto (rt-8): no hay nada
   que correr ni que autorizar de nuevo (integrar ya es publicar, y lo gobierna `merge-a-main`); lleva `humo` y **no** lleva `volver`.
2. **Quién manda entre `sensible` y `publicar`** (tracker 48): los dos no pueden decir cosas distintas. Si un comando de
   `autorizado.publicar` empieza como una entrada de `sensible.release`, la ficha **no valida**: *"publicar es una pregunta en este
   proyecto (`sensible.release`) y a la vez automático (`autorizado.publicar`): elegí una"*.
3. **La guardia en `sensible`** (rt-1): los tres comandos de `autorizado.publicar`, tipeados como herramienta, se **niegan** en toda
   sesión **sin ventana**: una carpeta de agente (rol distinto de `humano`), un modo sin ventana (`dontAsk`, `bypassPermissions`) o
   una sesión de fondo (`KIT_FONDO`, P3), **también en la carpeta principal**: *"publicar sin persona va solo por `noche.cjs
   publicar`"*. `noche.cjs` los corre como proceso hijo, no como herramienta: la guardia no lo toca. Una sesión de día del dueño, con
   ventana, sigue como hoy.
4. **Los nombres sin persona**, como alias: `andamiaje: con-ok` (vale igual que `con-ok-de-guido`) y `herramientas.<x>.necesita-persona`
   (igual que `necesita-guido`; uno de los dos, no los dos). Los viejos siguen validando **para siempre en la v3**: cambiar esas claves
   en una ficha viva es un cambio de barrera, así que ningún script las reescribe. `kit.ejemplo.md` y los mensajes usan los nuevos, y el
   comentario de `autorizado:` del ejemplo deja de prometer lo que `sensible` no lee (R9).
5. **crit. A1**: `ficha.test` (`no`, el mapa completo, sin `volver`, `comando: al-subir` con y sin `volver`; las dos formas de comando
   y una tercera que no valida (`vercel deploy --prod`); el choque con `sensible.release`; un comando con `;`; los dos alias y el doble); `lib/cambios.test` (cambiar `autorizado.publicar` da el id `autorizado:publicar`: sigue siendo
   barrera); `sensible.test` (el comando de publicar en un worktree de obrero → `deny`; en la principal en `dontAsk` → `deny`; en la
   principal con `KIT_FONDO` → `deny`; en la principal, `humano`, modo `default` → nada); las tres copias de `ficha.cjs` idénticas.

**A2 · Aprobar.**
1. **`esDeAprobar` sigue ancho, con tres excepciones** (rt-5: achicarlo a "la forma del comando" dejaba pasar `$(…)`, las comillas
   invertidas y `pwsh -c`). Es de aprobar todo comando que traiga las dos palabras, **salvo** que estén solo en: el mensaje de un `git
   commit` (`-m`, `-F`), el cuerpo de un heredoc, o los argumentos de `grep`, `rg`, `echo` y `printf`; y la excepción **no vale** si
   ese argumento trae una sustitución (`$(`, comilla invertida). Con eso se van los tres falsos positivos de las noches y no se abre nada.
2. **Corre en toda la PC**: `PC/niega-aprobar.cjs` es una copia idéntica de `H/niega-aprobar.cjs` (una prueba la fija, como las de
   `PC/lib`); `PC/secretos.cjs` la carga y combina (niega > pregunta > nada) **dentro de su mismo proceso**: la PC sigue con un solo
   hook. `instalar-hooks-pc` no suma registros: ya copia `pc/**`. En el proyecto sigue adentro del portero (A5): una PC sin preparar
   conserva la red de hoy.
3. **Quién puede y desde dónde** (rt-4; **Guido, 2026-11-12: *"el clik lo quiero hacer siempre en director, las aprobaciones son
   con el, no con los obreros"***). El freno **pregunta** (la ventana) solo en dos lugares, de día y con ventana:
   - **la pestaña del director**: la carpeta de la sesión es el worktree de un módulo (`.kit-rol: director`, rama `modulo/<x>`).
     Es el camino normal. El director corre `node ../../../.claude/scripts/cambios.cjs aprobar <id>` (el de la carpeta principal,
     como ya hace con `worktree.cjs donde`), y **el script hace todo en la carpeta principal**: la trae al día (`pull --ff-only`),
     firma ahí, commitea y sube. El sello queda igual que hoy (carpeta `.`, rol `humano`: el de la principal, que es donde vive la
     firma), así que `validarSello` no cambia. Las condiciones de la principal son las de hoy (en la rama por defecto, el cambio
     commiteado ahí); si no se cumplen, dice cuál y no firma;
   - **una sesión abierta en la carpeta principal** de ese repo, en la rama por defecto (rol `humano`): para los proyectos sin
     director, y como plan B (P7). `/estado` lo ofrece ahí (B2).

   **Todo lo demás se niega**, y es lo que cierra el agujero que esto abre (que un obrero firme por el director):
   - un obrero, un `/tramo`, un nocturno o un rol desconocido: por su `.kit-rol` **y por su rama** (una rama `modulo/<x>--<ID>`
     niega aunque el `.kit-rol` diga otra cosa);
   - un comando que se va a otro lado (`cd`, `pushd`, `Set-Location`, `git -C`), o una ruta a `cambios.cjs` que no es la de la
     carpeta de la sesión ni la de su principal: un obrero no llega a la carpeta del director para firmar desde ahí, porque el
     freno juzga la carpeta **de la sesión**;
   - de noche (la marca `.kit-noche`), de fondo (`KIT_FONDO`) o en un modo sin ventana: el director solo, sin el dueño, no firma;
   - una sesión abierta en otra carpeta (*"abrí una sesión en ese proyecto"*): cierra el 40 y el 33 (f).
   El script repite lo mismo por su lado (defensa doble, como hoy): corre con rol `humano` en la principal, o con rol `director`
   en un worktree de módulo sin `.kit-noche`; con cualquier otro, no. Los textos:
   - la ventana (rt-2: nada que escriba el agente): *"Es tu firma para cambiar un freno de este proyecto. Te la pide: <director-<x>
     | la sesión de la carpeta principal>. Cambio <id> · toca: <los ids de la cabecera> · control: <los 8 del hash>. Aceptá solo si
     es lo que viste en "Te necesito"."*;
   - a un obrero: *"la firma la da el dueño con un clic, en la pestaña del director. Pará y dejalo anotado: el director lo propone
     (`cambios.cjs nuevo … --en-defecto`) y se lo pide."*
4. **Las otras dos firmas del dueño** entran por la misma puerta, en el freno de la PC (r2-3: si no, el director, que corre en
   `auto`, se autoriza solo en cuanto `publicar` le dice "falta tu autorización"): `preparar-pc.cjs` con `--publica` o
   `--no-publica` (C2.4) y `noche.cjs publicar --seguir` (B3.2.3). `--seguir` sigue la regla de `aprobar` (el director, de día y con
   ventana, o la carpeta principal). Autorizar la PC es del Equipador, no de un módulo: **pregunta** solo con ventana y rol `humano`.
   En una carpeta de obrero, en un modo sin ventana o de fondo, las dos **niegan**. Lo mismo un comando que nombre `KIT_HOME_PC` (el home de prueba de R2).
5. **crit. A2**: `niega-aprobar.test` (sí: `node .claude/scripts/cambios.cjs aprobar x`, con ruta absoluta, con comillas, por
   `bash -c` y `pwsh -c`, dentro de `$(…)` y de comillas invertidas, `echo $(node … aprobar x)`; no: `git commit -m "… cambios.cjs
   aprobar …"`, `grep aprobar cambios.cjs`, un heredoc); `pc/secretos.test` (una sesión parada en otra carpeta, modo `auto`, con `cd
   <repo> && node .claude/scripts/cambios.cjs aprobar x` → `deny`; en la principal y la rama por defecto → `ask`; en la principal con
   `dontAsk` → `deny`; **en el worktree de un director, de día → `ask`; ahí mismo con `.kit-noche` → `deny`; con `KIT_FONDO` → `deny`;
   en el worktree de un obrero → `deny`; en uno con `.kit-rol: director` pero rama `modulo/x--01` → `deny`; un obrero con `cd` al
   worktree del director → `deny`**; `preparar-pc.cjs --publica` y `noche.cjs publicar --seguir`: desde un worktree de
   director en `auto` → `deny`, con `KIT_FONDO` → `deny`, en la principal con ventana → `ask`; `preparar-pc.cjs` sin esas banderas →
   nada); la copia idéntica; `scripts/cambios.test` (`aprobar` corrido desde un worktree de director con un remoto de prueba: el sello queda en
   la principal con carpeta `.` y rol `humano`, subido, y `validarSello` lo acepta; desde uno de obrero → no; con `.kit-noche` → no;
   con la principal en otra rama → no, y dice por qué). **Mutación** sobre `esDeAprobar`, sobre "desde dónde" (cada una de las cuatro
   negativas), sobre las otras dos firmas y sobre la combinación en `secretos`.

**A3 · El cambio que nace en un módulo.** `cambios.cjs nuevo … --en-defecto`, para el director (rol `director` o `humano`; un obrero
para y se lo pide): arma el cambio propuesto en una carpeta temporal parada en `origin/<defecto>`, commitea **solo ese archivo**
(`cambios: propuesto <id>`), sube y borra la temporal, como hace `integrar`; si origin avanzó, reintenta una vez. Imprime *"propuesto
en <defecto>: le queda al dueño en "Te necesito""*. Después, el director le pide la firma al dueño en su pestaña (A2.3): corre `aprobar`
(el clic), sube; el director trae `main` (`traer-main`). El aviso de `secretos` (`:354`) deja de decir *"pedíselo al director"* y dice
el camino. **crit. A3**: `scripts/cambios.test` (desde un worktree de director con un remoto de prueba: el archivo aparece en
`origin/<defecto>` en un commit de un solo archivo y el worktree del director queda como estaba; desde uno de obrero → negado; con
origin adelantado → reintenta y entra).

**A4 · Los dos agujeros.**
1. **La bandera abreviada**: en `empiezaCon`, una bandera larga de la ficha (`--produccion`) matchea también una palabra del comando que
   sea **su prefijo** con al menos una letra después de `--` (`--prod`, `--p`), y la forma `--bandera=valor`. Las banderas de un guion,
   tal cual. Falla para el lado seguro: `--pro` pregunta aunque el programa tenga `--profile`.
2. **`merge -s ours`**: `git merge` o `git pull` con `-s ours`, `-sours` o `--strategy=ours` (no `-X ours`, que es otra cosa): en una
   sesión de agente, `deny`; con rol `humano` y ventana, `ask`: *"esto marca como mezclada una rama sin traer su contenido; después se
   puede borrar con trabajo adentro"*.
3. **crit. A4**: `sensible.test` (`--prod`, `--produccion=si`, `--p` preguntan; `-p` y `--otra` no); `git-seguro.test` (las tres formas
   en obrero → `deny`; en humano → `ask`; `-X ours` → nada). **Mutación** en las dos reglas.

**A5 · Frenos que no se cuelgan.**
1. **Un proceso**: `L/portero.cjs` lee la entrada una vez, se pone **un** plazo y llama a `decidir` de `niega-aprobar`, `git-seguro` y
   `sensible`, en ese orden; corta en el primer `deny`; si no, devuelve el primer `ask`; si no, nada. `M/settings.json` deja **un** hook
   para `Bash|PowerShell`. Vive en `hooks/lib/` a propósito: viaja con la pieza `hooks-lib`, sin tocar el catálogo. Los tres archivos
   **siguen andando solos** (su `principal()` no se toca): es el plan B.
2. **El portero no carga lo que no conoce** (rt-9): carga como módulo solo el hook cuya pieza la ficha dice `molde`
   (`hook-git-seguro`, `hook-sensible`, `cambios-metodo`). Uno `adaptada` o `propia` (o con la ficha ilegible, los tres) lo corre
   **como proceso aparte**, con la misma entrada, igual que hoy: un hook de un proyecto que no exporta `decidir` o no trae la guarda de
   `require.main` no rompe nada. Un error del portero mismo: `deny` con *"freno roto: corré doctor"*, como hoy. Y la flota **no mezcla**
   un settings que registra un archivo que no va a estar (C1.5): si `hooks-lib` espera una fusión, el settings nuevo espera con ella.
3. **El plazo**: el `timeout` del settings pasa de 20 a `max(60, 3 × el percentil 99 de A0)`, con tope 120; el plazo propio es ese
   número menos 10 s, para todos (hoy solo lo tiene `git-seguro`).
4. **El aviso honesto** (tracker 25): si se le acaba el plazo propio, el freno **niega** (falla cerrado) pero dice la verdad: *"el freno
   no llegó a mirar a tiempo (la PC está cargada): repetí el mismo comando; no es un no"*, con el id `freno:sin-tiempo` en el registro.
   `PC/secretos.cjs` hace lo mismo.
5. **crit. A5**: `lib/portero.test` (un `deny` de cualquiera de los tres gana; un `ask` solo, pregunta; los tres callados, nada; uno
   que tira → "freno roto"; con `hook-sensible: adaptada` en la ficha, ese corre como proceso y su `deny` vale; un hook propio sin
   `decidir` no rompe a los otros dos; el plazo vencido → `freno:sin-tiempo`; **un solo renglón** en el registro por comando negado);
   `settings.test` (un hook para `Bash|PowerShell`, con `onFailure: block`); los casos de los tres `*.test` pasan **también por el
   portero** (el mismo juego de casos, dos entradas). **Mutación** sobre el orden y la combinación. Y A0 repetido con el portero: el
   percentil 99 baja (si no baja, ver "Probar antes de prometer", P5).

**A6 · `frenos.log`.** La firma depende del archivo versionado, así que **no se muda**: se parte. `frenos-log.anotar` manda los renglones
de **aprobar** (el id **exacto** `cambios:aprobar`, la firma; `cambios:aprobar-negado` es un freno más: rt-12) a `.claude/frenos.log`,
como hoy, y **todo lo demás** (cada freno que negó o preguntó) a
`<carpeta común de git>/kit-frenos.log`, sin versionar, compartido por la principal y sus worktrees (es donde `cerrar` ya muda el de un
worktree). El archivo versionado deja de ensuciarse solo: no traba merges ni el `pull` del cierre. Los renglones viejos quedan. **crit.
A6**: `frenos-log.test` (un `deny` de `git-seguro` no cambia `git status`; el renglón está en el común; `aprobar` sigue escribiendo en
el versionado y `lib/cambios.test` valida la firma sin cambios; un `cambios:aprobar-negado` va al común). Los que **leen** (B:
`resumen.cjs`, `verificar`; C: `doctor`, `adoptar`) pasan a leer los dos lugares en su tanda, y la B saca de sus textos el "commiteá
`frenos.log`" (la fila CIERRE del núcleo, `/obrero`, `/tramo`, `/cierre`, y el commit solo de `integrar`, `S/worktree.cjs:1213-1216`
`[L]`); entre la A y la B, lo único que pasa es que el resumen cuenta de menos.

**A7 · Lo inocente** (cada uno **se reproduce antes de tocar**, con el comando real de la noche; si no se reproduce, no se toca y se anota).
- **(a) Leer `.claude/` y `.githooks/`** (43b; Deptos ×4, el Hub ×3): `sed -n '1,40p' .claude/hooks/x.cjs`, `git grep foo -- .claude/`,
  `node .claude/hooks/x.cjs < entrada.json` desde una sesión de agente. La regla `frenos-del-proyecto` tiene que negar **solo** escribir
  o destruir (`sed -i`, `>`, `>>`, `tee`, `rm`, `mv`, `cp` hacia ahí, `git checkout|restore` sobre esas rutas).
- **(b) Las ramas de usar y tirar** (25, 55): un obrero puede borrar **las suyas**: `tmp/<x>--<ID>-<algo>`, con el `<x>--<ID>` de su
  propia rama (`git branch -D` y `git push origin --delete`). Las `tmp/` de otro siguen la regla de siempre (rt-13: las ramas se
  comparten entre worktrees). `K/obrero` dice el nombre (B4).
- **(c) Borrar con el clic del dueño** (55: una rama que entró aplastada "no se puede borrar nunca"): con rol `humano` y ventana,
  `branch -D` o `push --delete` de una rama **no mezclada** deja de negar y **pregunta**: *"la rama <r> tiene <N> commits que no están en
  <defecto>: si la borrás se pierden"*. La rama por defecto sigue negada siempre; en una sesión de agente o sin ventana, todo como hoy.
- **(d) Rutas con corchetes** (43e): en `restaurar-arbol`, una ruta con `[` `]` que **existe como archivo con ese nombre exacto** no es
  "amplia" (`app/[id]/page.tsx`). `*` y `?` siguen siéndolo.
- **(e) `sensible` de fondo** (43f): una sesión de fondo es como la noche: en vez de `ask` (que nadie contesta), `deny` con el texto de
  PARADA. Se sabe por la variable `KIT_FONDO=1` que ponen las líneas de fondo del kit (B3, B4); ver P3.
- **(f) Los 15 `ls` sobre un `.env`** (43d): solo averiguar la causa en las charlas (20 min). Si es el `deny` de Claude Code y no un
  freno del kit, se anota y no se toca nada.
- **No entra**: aflojar la lectura del `.env` de una base `clase: prueba` (lo resuelve B7: el encargo y `presentar` dicen a qué entorno
  apunta), ni las claves ficticias (`conexion-con-clave`, `jwt`), ni `restaurar-arbol` sobre un gate que reescribe archivos: a la
  `v3.1`, con la poda por evidencia (V4).
- **crit. A7**: un caso de sí y uno de no por letra en `pc/secretos.test`, `git-seguro.test` y `sensible.test`; **mutación** en (a), (c) y (e).

**A8 · Lo que estos archivos le dicen al dueño.** `kit/habla.cjs` (ayuda de pruebas, no se instala): dado un archivo, devuelve sus
textos (todo un `.md`; de un `.cjs`, lo que no es comentario) y dice si alguno trae `guido` como palabra, o `rojo`/`roja`/`verde`.
`H/habla.test` lo corre sobre `M/hooks/**`, `M/githooks/**`, `S/cambios.cjs` y `PC/**`: **cero**, salvo los alias viejos de A1.
Los comentarios se quedan (citan la cicatriz). Los textos: *"Lo hace Guido a mano"* → *"pedíselo al dueño: es un clic en su sesión"*;
el githook sin escáner deja de decir "en rojo" y cierra *"pasa, con un aviso: esta PC no tiene el revisor de secretos (lo instala
"preparame esta PC")"* (R10); `kit <gancho>: ROJO — no pasa` → `no pasa`; `en verde` → `pasa`. La línea de PowerShell de
`cargar-secreto` suma `-ExecutionPolicy Bypass`, que su propia prueba ya usa (R19). **crit. A8**: `habla.test`; las
aserciones de `kit-githook.test` y `git-seguro.test` con los textos nuevos.

**El red team y el revisor de la tanda A**: red team (`redteam-spec`, Opus, una ronda) de A2, A4, A5 y A7 antes de cerrarlos; un revisor
frío al final sobre el diff entero.

---

### Tanda B — la noche, `/estado` y el camino de fondo

**Orden**: B1 → (B2 ∥ B3 en `noche.cjs` y `cierre-noche.md` ∥ B4 en `encargo.cjs` y `lib/encargo.cjs` ∥ B5 en `proceso.cjs`) → lo de
`worktree.cjs` (B3 `limpiar`, B5, B7), de a uno → las skills, al final y por la sesión misma (los topes) → B6 → el revisor frío.
**Primera línea**: B1, B2, B3 (con `conTurno`, la mitad de lib de B5), B4, B6. **Segunda línea** (la continuación): el resto de B5, B7.

**B1 · Una sola cuenta.**
1. `L/encargo.cjs` suma `estadoEncargo(raiz, x, id)` → `cerrado` · `cancelado` · `parado` · `en obra` · `sin arrancar`. **Cerrado** = su
   evidencia está en la rama del módulo y no empieza con `PARADA:` (la cuenta de `noche.cjs`, que sobrevive a que la rama se borre).
   **Cancelado** = el renglón `cancelado <ID>` de la ficha. La usan `estado.cjs`, `noche.cjs`, `tiempos.cjs` y el candado de
   `integrar`, que deja de frenar por un cancelado con su rama viva (21).
2. `L/espera.cjs` (nuevo): `teEspera(raiz)` → la lista **única** de lo que espera al dueño, de las cinco fuentes: la sección "te
   espera" de cada ficha activa, el handoff, los cambios `propuesto` (y las fusiones del actualizador que esperan), el TODO (las
   esperas vencidas) y el último parte. Cada ítem: de dónde sale, desde cuándo, y su **tipo**: `clic` (aprobar un cambio) · `decisión`.
   Sin repetidos (el mismo texto en dos fuentes sale una vez).
3. **crit. B1**: `lib/encargo.test` (un encargo cerrado cuya rama ya no existe sigue `cerrado`; uno con el renglón de la ficha,
   `cancelado`); `lib/espera.test` (un cambio propuesto aparece; el mismo ítem en ficha y handoff, una vez; nada → lista vacía).

**B2 · `/estado` del dueño.** `estado.cjs` (sin argumento, o `<x>`) imprime **siempre** las mismas cuatro secciones, con estos títulos
y en este orden; una sección sin nada dice `nada`:
1. `TE NECESITO` — `teEspera`, cada ítem en una línea, en criollo, con su tipo y desde cuándo. Solo lo que pide un clic o una decisión.
2. `EL PLAN` — por módulo activo: en qué tramo está, tramos cerrados y los que faltan, % del plan, % del tramo, y lo que falta en horas.
   Los % salen de las tareas de la ficha (por tramo si la ficha las agrupa con `### Tramo N`, C3); un plan `cola` (C3) dice
   *"es una cola: N hechos, M abiertos"* y no inventa un %.
3. `LO QUE SE HIZO` — cada encargo cerrado en una línea, con sus minutos (de `tiempos.md` y `estadoEncargo`, no de las ramas vivas); en
   la vista del proyecto, lo de las últimas 24 h.
4. `LO QUE FALTA` — cada tarea que queda, en orden, con su estimación: la mediana de los encargos cerrados del módulo; con menos de
   tres, *"no sé todavía"*. **Nunca 0 % ni un número inventado.**

**El formato que lee queda fijado acá** (rt-14: la C le enseña al Arquitecto a escribirlo, la B ya lo lee): en la cabecera de la
ficha, `- Plan: lista | cola` (sin el renglón, lista); en `## Tareas`, un `### Tramo <N>` por tramo. Una ficha sin esas marcas se
muestra como un solo tramo.

Sin SHAs, ids sueltos, nombres de scripts ni "rojo/verde". La vista de hoy queda para el director en `estado.cjs --director [<x>]`.
`K/estado/SKILL.md`: en la carpeta principal, primero `volvi` y `worktree.cjs limpiar` (callado); muestra las cuatro secciones tal
cual; si "Te necesito" trae un `clic`, **ofrece hacerlo ahí** (`pull`, `aprobar`, `push`: el dueño solo aprieta). **crit. B2**:
`estado.test` (las cuatro secciones en orden con un repo vacío, con un módulo de lista y con uno de cola; la salida no matchea
`@[0-9a-f]{7}`, `node \.claude`, `rojo|verde`; un cambio propuesto sale en "Te necesito"; con dos encargos cerrados, "no sé
todavía"); `skills.test` (la skill nombra las cuatro secciones y el ofrecimiento del clic).

**B3 · La noche termina sola.** Seis piezas; el director no sale de su worktree. Es **la pieza más delicada de la `rc.7`**: dos
rondas de red team la reescribieron (rt-1, rt-2, rt-6, rt-7, rt-10 y la segunda ronda entera), y la tanda le hace otra antes de cerrarla.
1. **`noche.cjs cierre <x>`** (lo corre el director después de un `integrar` que salió 0; chequea que `modulo/<x>` esté en
   `origin/<defecto>`). Imprime la línea de fondo, como `autorizado`:
   `cd "<principal>" && printf '%s\n' 'Leé .claude/skills/director/cierre-noche.md y seguilo para el módulo <x>.' | KIT_FONDO=1
   <claude> -p --model opus --permission-mode dontAsk --allowedTools <la lista> --disallowedTools <lo que sobra>`.
   - **Corre en `dontAsk`, no en `auto`** (rt-1): en `auto`, lo que no está en la lista lo decide el clasificador (publicó 3 de 4
     veces sin autorización en las pruebas). En `dontAsk` no hay clasificador ni preguntas: corre lo permitido y nada más.
   - **La lista**, con sus argumentos fijos, vive en el script y **sale de leer el `/cierre` paso por paso** (r2-5): leer dentro del
     repo; editar y escribir **solo en la carpeta de papeles**; `git status|diff|log|show|fetch`, `git add` y `git commit` por rutas,
     `git pull --ff-only` y `git pull --rebase origin <defecto>`; `node .claude/scripts/noche.cjs cierre-empieza|publicar|parte|subir
     <x>`, `worktree.cjs limpiar|integrados`, `estado.cjs`, `resumen.cjs`, `todo.cjs`, `tiempos.cjs`, `estructura.cjs`, `agents.cjs
     generar`, y de `cambios.cjs` **solo** `verificar` y `listar`; la herramienta de skills. **No hay `git push` suelto**: subir es
     `noche.cjs subir` (punto 3).
   - **Lo que sobra** (r2-1: en `dontAsk` también corre todo lo que algún settings tenga en `allow`, y el molde permite `cambios.cjs`
     entero): el script lee los `allow` del settings de usuario, del proyecto y del local, y manda a `--disallowedTools` cada uno que no
     cubre nada de la lista (un "sí, no preguntes más" que el dueño dio un día en esa carpeta); de `cambios.cjs`, `aprobar` y `nuevo`.
   - La sesión de cierre no puede editar código, correr las pruebas sueltas, publicar por otro camino ni aprobar nada.
2. **`noche.cjs publicar <x>`** — el **único** camino por el que el kit publica sin persona. Corre en la carpeta principal, en la rama
   por defecto, con rol `humano`; en cualquier otro lado se niega. En orden, y corta en el primero que no da:
   1. la ficha vigente trae `autorizado.publicar` → si no, sale **3**: *"este proyecto no publica solo"* (no es una falla);
   2. **el dueño autorizó esta PC para esto mismo**: `~/.claude/kit-pc.md` trae este repo (por su `origin`, normalizado) en
      `publica:`, con una **huella** que coincide con la de hoy (C2.2) → si no está, sale **3** y deja en "Te necesito": *"falta tu
      autorización para publicar desde esta PC"*; si la huella no coincide: *"cambió cómo se publica este proyecto: falta tu OK de
      nuevo"* (rt-2); si lo que cambió es el `origin`, lo dice así;
   3. **no quedó trabado**: si la última publicación terminó con el humo fallando, sale **3** hasta que el dueño diga que siga
      (`publicar --seguir`, que es una firma: solo con ventana, ver A2.4) (rt-6);
   4. la carpeta está limpia en lo que git sigue, `HEAD` es `origin/<defecto>` y trae el módulo `<x>`; y **desde lo último que se
      publicó no entró más que módulos y papeles** (rt-1, r2-6): cada commit entre el commit de `kit-publicacion.json` (o, la primera
      vez, el anterior al merge de `<x>`) y `HEAD` es un merge de `integrar` o toca solo la carpeta de papeles;
   5. el `comando-setup` y después el `comando-test`, **acá**, con el turno (B5) → si falla, sale 1: *"las pruebas fallaron en la
      carpeta principal: no publiqué"* (29; rt-10: sin el setup, un obrero que sumó una dependencia rompe cada publicación);
   6. `comando` (plazo 30 min). Su salida va a un archivo **fuera del repo**, con nombre al azar y **sin imprimir su ruta** (r2-1:
      puede traer claves); a la pantalla va solo si salió bien o mal;
   7. `humo`; si falla y hay `volver`, lo corre;
   8. deja el resultado en `<git común>/kit-publicacion.json` (el commit, cuándo, cada paso `pasó`/`falló`/`no hay`, y si quedó
      trabado) y una línea.

   **Con `comando: al-subir`** (rt-8: el proyecto publica solo cuando se sube a la rama por defecto) no hay nada nuevo que autorizar:
   integrar ya es publicar y lo gobierna `merge-a-main`, como hoy. `publicar` saltea los pasos 2, 5 y 6 y corre **solo el humo**; si
   falla, queda trabado, y un `integrar` **de noche** con la publicación trabada no integra: queda en "te espera".

   **Salidas**: **0** publicó y el humo pasó (o ese mismo commit ya estaba publicado: no repite) · **1** algo falló (las pruebas; el
   comando; el humo, haya vuelto atrás o no: queda trabado) · **3** no publica (no autorizado, cambió, o trabado). Como el comando lo
   corre el script y no la sesión, las autorizaciones se chequean **por código**, no por la lectura de un modelo.
3. **`noche.cjs subir <x>`**: el único `push` del cierre. Sube `HEAD` a la rama por defecto **solo si** lo que hay para subir son
   papeles (cada commit que origin no tiene toca solo la carpeta de papeles); si origin avanzó, trae con `--rebase` y prueba una
   vez más. Así "la sesión de cierre no sube código" lo cuida un script y no una lista.
4. **`K/director/cierre-noche.md`** (nuevo, ≤ 60 renglones; viaja con la pieza `director-obrero`): las instrucciones de la sesión de
   cierre. (0) No rodea nada: lo que se niega se anota y sigue con el resto; **si `publicar` no sale 0, no publica por otro camino ni
   toca código: va al parte**; nunca aprueba. (1) `noche.cjs cierre-empieza <x>`: toma el **candado de cierre del repo** (rt-7: dos
   módulos que terminan la misma noche cierran de a uno; el segundo espera) y chequea la carpeta: si no está en la rama por defecto o
   tiene cambios sin guardar en archivos que git sigue, no toca nada, va al parte y termina. Después `git pull --ff-only`. (2)
   `noche.cjs publicar <x>`. (3) El `/cierre` del proyecto: handoff, CHANGELOG y TODO con los pendientes del módulo (54); si no se
   puede invocar como skill, sigue sus pasos leyendo su `SKILL.md` (P6). **Qué pasos del `/cierre` no corren de noche** lo dice este
   archivo (los que piden una firma o tocan una barrera: van al parte). (4) `worktree.cjs limpiar`. (5) `noche.cjs parte <x>`
   (suelta el candado), commit por rutas y `noche.cjs subir <x>`. (6) Su última línea: `CIERRE: listo` o `CIERRE: con pendientes`,
   y la ruta del parte.
5. **`worktree.cjs limpiar`** (carpeta principal, rol `humano`): cierra cada worktree de `.claude/worktrees/` cuya rama ya está
   mezclada en su madre y está limpio (con el `cerrar` de hoy); un cancelado con cambios, después de guardarlos (B7); `git worktree
   prune`. Lo que no puede (una carpeta en uso, algo sin mezclar) **no lo fuerza**: lo lista, y lo que pide una decisión va a "Te
   necesito". Se puede correr mil veces. Lo llaman el cierre, y `/estado` e `/inicio` de la carpeta principal.
6. **`noche.cjs parte <x>`**: lo escribe **el script, no el modelo**: `docs/modulos/<x>/bitacora/<fecha>-parte.md`, y lo imprime.
   Cuatro secciones fijas: **Qué quedó** (integrado · publicado y la prueba de humo · los papeles al día · las carpetas limpias; cada
   uno `sí`, `no` o `no tocaba`; un humo que falló va **primero**, con si se volvió atrás) · **Te necesito** (`teEspera`) · **Qué se
   hizo** (los encargos con sus minutos) · **Lo que no pude** (una línea cada uno). **Ningún comando, ningún SHA, ni "rojo" ni
   "verde"**, y nada de la salida del comando de publicar.
7. **`K/director/SKILL.md`, paso 9**: ficha y spec en `COMPLETO`, `push`, `integrar <x>` en segundo plano (si la ficha pide el OK del
   dueño: se lo pregunta y suma `--con-ok`, alias nuevo de `--ok-de-guido`; de noche queda en "te espera"). Sale 0: `noche.cjs cierre
   <x>`, lanza la línea en segundo plano, y cuando ese proceso termina **muestra el parte tal cual** y para. No le da ningún comando
   al dueño, **ni intenta autorizar la PC él** (A2.4). La última línea de `integrar` pasa a *"después: noche.cjs cierre <x>"*. El paso
   10 sigue: el director nunca corre `/cierre`.
8. **crit. B3**: `noche.test` — `cierre`: sin integrar se niega; la línea trae `dontAsk`, `KIT_FONDO=1` y la carpeta principal; su
   lista **no** trae un `git push`, el comando de publicar, ni un `Edit` fuera de la carpeta de papeles; **con un `allow` de más en el
   settings local, ese `allow` aparece en `--disallowedTools`**, y `cambios.cjs aprobar` también · `publicar`, con un remoto de
   prueba, scripts de mentira y un `kit-pc.md` de mentira: sin la clave de la ficha → 3; sin el repo en `publica:` → 3 y el ítem en
   `teEspera`; **con el script de publicar cambiado después de autorizar → 3** ("cambió cómo se publica"); con el `origin` escrito de
   otra forma (`git@…` contra `https://…`) → lo reconoce; en un worktree o con rol de agente → negado; con un commit de código
   posterior a lo último publicado → negado; con el `comando-test` fallando → 1 y el comando de publicar **no corrió**; humo que
   falla con `volver` → corre `volver`, sale 1 y la corrida siguiente da 3; `--seguir` de fondo → negado; el mismo commit dos veces →
   la segunda no corre el comando; la salida del comando no aparece en lo que imprime; con `al-subir` → corre solo el humo; todo bien
   → 0 y el archivo de resultado · `subir`: con un commit de código por subir → no sube; con solo papeles → sube; con origin
   adelantado → trae y sube · `cierre-empieza`: con el candado tomado, espera; con la carpeta en otra rama → sale distinto de 0 sin
   tocar nada · `parte`: las cuatro secciones, y no matchea comandos, SHAs ni rojo/verde. `worktree.test` — `limpiar` cierra lo
   mezclado, deja lo sucio y repetido no hace nada; `integrar` de noche con la publicación trabada no sube nada. `skills.test` — el
   paso 9 nombra `noche.cjs cierre` y ya no dice "dale al dueño la línea"; ≤ 8.000 B. **Mutación** sobre los chequeos 1 a 5 de
   `publicar` y sobre `subir`: sin cualquiera de ellos, una prueba falla.

**B4 · Un solo camino.**
1. **Abrir obreros es del director**: paso 4 del `/director`: los lanza él, de fondo, con la primera línea de `autorizado`. La
   plantilla nace con `- Apertura: director`; `dueño` (alias viejo: `Guido`) es la excepción, cuando el dueño quiere esa pestaña.
2. **Un obrero de fondo no manda mensajes**: su PRESENTACION, su PARADA y su CIERRE son commits; el director se entera porque el proceso
   terminó y mira git. El núcleo §3 lo dice; la tabla de mensajes queda para las pestañas y `/tramo`. `Suscripción:` pasa a opcional.
3. **La corrección llega** (20): `presentar` mira si `modulo/<x>` avanzó después de la partida del obrero; si avanzó y el worktree
   está limpio, **trae ese merge él** y lo dice (*"traje lo corregido"*); si choca, lo deshace y es PARADA. Corregir es relanzar.
4. **Sin despertador ni 40 %** (28, 31): `noche.cjs despertador` deja de existir (dice una línea y sale 0); `me-voy` no imprime ni la
   línea del despertador ni "mudate". El paso 7 del `/director` cambia la mudanza por: *"antes de cada espera larga, todo commiteado y
   subido y el relevo al día: si quedás quieto cerca de una hora la plataforma puede resumir la charla, y con el relevo se retoma"*.
   `contexto.cjs` queda como dato.
5. **`Skill: tramo`** (R7, REJ-017): `L/encargo.cjs` admite `obrero | tramo`; la línea de fondo manda `/<skill> <x>--<ID>`. La
   plantilla dice cuándo: *obrero, un encargo acotado que hace una sesión; tramo, un tramo grande que conviene repartir entre
   subagentes (proyectos grandes)*.
6. **Los nombres** (59), con el esquema que el kit ya sugiere: `director-<x>`, `obrero-<x>--<ID>`, `cierre-<x>`. El encargo lleva
   `- Director: director-<x>` (opcional; la plantilla lo trae); la línea de fondo pasa `--name` (P1). Todo mensaje que quede empieza
   con su destino (`PARA director-<x> · PARADA …`) y `encargo.cjs mensaje` dice *"no es para vos"* si el destino no es el nombre que
   sale de la rama de quien lo recibe. **El nombre sale de la rama, no de la plataforma**: el diseño no depende de que una sesión se
   pueda renombrar sola.
7. Una regla de `## AUTORIZADO` que no se puede citar deja de terminar en *"la apertura es de Guido"*: `autorizado` sale 1 y le dice al
   director qué regla reescribir.
8. **Nadie commitea más `frenos.log`** (A6): salen ese pedido de la fila CIERRE del núcleo, de `/obrero`, `/tramo` y `/cierre`, y el
   commit solo que hace `integrar`; `resumen.cjs` y `verificar` leen también el registro común.
9. **crit. B4**: `lib/encargo.test` (`Skill: tramo` vale; `Apertura: dueño`, `Guido` y `director` valen; sin `Suscripción` vale);
   `scripts/encargo.test` (la línea de fondo con `/tramo`, `KIT_FONDO=1` y `--name`; `presentar` trae un commit posterior a la
   partida y con un choque para; `mensaje` con `PARA` de otro → 1); `noche.test` (`me-voy` sin "despertador" ni "mudate");
   `skills.test` (el director dice "los lanzás vos"; no dice "40 %" ni "despertador"; ≤ 8.000 B; el orden de comandos sigue).

**B5 · El turno de la suite.** Dos mitades: **la lib** (`conTurno`, primera línea: `publicar` la usa) y **el cableado** en
`presentar`, `verificar` e `integrar`, con el no repetir la base y los plazos (segunda línea). `L/proceso.cjs` suma `conTurno(quien, fn)`: un candado **por PC** (una carpeta en el temporal del
sistema, con quién lo tiene y su proceso), una corrida pesada a la vez; el que espera lo dice cada tanto; un candado de un proceso que
ya no existe se toma; a los 60 min de espera sigue igual con un aviso (nunca se cuelga). Lo usan `presentar` (la base), `verificar`,
el gate de `integrar`, `publicar` y el `sello` (C3). La espera **no cuenta** en el plazo. `presentar` no repite la base si ese commit ya
pasó con ese `comando-test` (lo anota en el git común). Los plazos fijos leen el `plazo-test` de la ficha cuando es más grande (E13).
**crit. B5**: `proceso.test` (dos corridas a la vez: la segunda espera y entra; un candado huérfano se toma; la espera no gasta el
plazo); `scripts/encargo.test` (la segunda `presentar` sobre el mismo commit no corre el comando).

**B6 · Cómo se le habla al dueño.** La regla, en una frase: *al dueño, en criollo: "pasó" o "falló", nunca rojo ni verde; sin códigos
sueltos; nunca un comando para que lo corra él: lo corre la sesión y, si hace falta su firma, es un clic.* Va en tres lugares que el
actualizador **sí** lleva a un repo adoptado: el núcleo (§9, reemplaza la línea "en español"), **una línea fija en lo que inyecta el
arranque** (`L/inyeccion.cjs`: así le llega a toda sesión, también a la que no tiene director) y el `CLAUDE.md` del molde (para los
repos nuevos). `K/habla.test` (con la ayuda de A8) sobre `S/**` y `K/**`: cero "guido" y cero rojo/verde en lo que **le llega al
dueño** (`estado`, `noche`, `resumen`, `worktree`, las skills); lo que es entre sesiones y scripts (`verificar`, `presentar`,
`paquete`) se queda. `topes.cjs:218` deja "rojo y naranja" por "urgente e importante". **crit. B6**: `skills.test` (el núcleo trae la
regla; ≤ 8.000 B); `inyeccion.test` (la línea está y el total sigue ≤ 9.700); `habla.test`.

**B7 · El taller del director** (segunda línea; cada uno, chico y con su caso):
- **21**: el obrero guarda (un commit de trabajo) antes de parar (`K/obrero`); `donde` deja entrar al **mismo** encargo aunque haya
  cambios sin commitear, y lo avisa; `cerrar --cancelado` guarda antes lo que no está commiteado en una referencia de rescate
  (`refs/kit/rescate/<x>--<ID>`), así puede correr de noche.
- **22, R17**: `paquete.cjs --pruebas` con una ruta dice *"esto parece una ruta: quería un comando"* y sale distinto de 0; `## Toca`
  tolera `ruta:línea` y `ruta (texto)`; la plantilla dice que el ID son dos dígitos y `- Spec:` un solo rango.
- **43c**: `presentar` imprime los entornos de prueba de la ficha (`entornos:` con `clase: prueba` o `dummy`, y su `acceso:`), y la
  plantilla pide decir a cuál apunta el encargo. El freno del `.env` no se afloja.
- **30, R18**: el `push` de `integrar` pasa de 120 a 600 s; el `comando-setup` de `crear` gana plazo (30 min) y, al terminar,
  **vuelve a prender `core.hooksPath`** (52: un `prepare` del proyecto lo cambia).
- **57, 24**: `tiempos.cjs contador` no cuenta como desvío el commit del director y conserva los encargos de ramas borradas; `cerrar`
  reintenta una vez si `git worktree remove` falla y la carpeta no está en uso.
- **23**: `verificar` dice *"el `comando-test` cambió desde tu partida"* cuando es eso.
- **51**: `me-voy` deja de decir "pegá en el `.gitignore`": dice que lo arregla "poné al día este repo".

**El red team y el revisor de la tanda B**: red team de B3 (`publicar` y la línea del cierre) antes de cerrarlo; revisor frío al final.

---

### Tanda C — adoptar, la PC y lo chico; después la suite, la flota y el tag

**Orden**: (C1 en `adoptar.cjs` y `chequeo.cjs` ∥ C2 en `preparar-pc.cjs`, `traer-repos.cjs` y `doctor.cjs` ∥ C3) → C4 → el revisor
frío → C5 **mientras** corre C6. **Primera línea**: C1, C2, C3. **Segunda línea**: C4, C5. C6 no se recorta.

**C1 · Adoptar sin romper.**
1. **Decir qué reemplaza**: `--mirar` suma un bloque *"Lo tuyo que cambia"*: cada pieza propia que la adopción reemplaza (D1, D3), cada
   hook propio registrado que repite uno del kit, cada hook propio en disco **sin registrar** (queda muerto) y las reglas apagadas del
   settings. Por cada uno: qué le pasa y qué se puede hacer (pasarlo a la zona propia · retirarlo · dejarlo).
2. **Lo reemplazado no se pierde de vista**: con `--director kit`, `--aplicar` guarda el texto anterior de cada skill reemplazada en
   `<carpeta-docs>/referencia/adopcion/<pieza>-anterior.md` y deja **una línea por pieza** en el TODO del repo (*"destilar lo propio de
   <pieza> a su zona propia, o descartarlo"*). No lo vuelca a la zona propia (rompería el tope de la skill): eso lo hace una sesión.
3. **Detectar y preguntar, no poner "no"** (53): la propuesta marca con `¿?` y su evidencia cada clave de `sensible` y
   `autorizado.publicar` donde el repo muestra que **sí**: publica (`release`/`deploy` en `.github/workflows/`, `vercel.json`, un
   `Dockerfile` o `docker-compose`, un script `deploy|release|publish`, una skill `release` o `deploy` propia) · gasta plata o sale
   afuera (dependencias de mensajería, mail o cobro, o de un modelo pago). `--aplicar` **se niega** mientras quede un `¿?`: el dueño
   contesta cada una. Las piezas `smoke` y `release` salen `propia` si esa skill ya existe en el repo. **Si el repo publica solo al
   subir a la rama por defecto** (una integración del proveedor con GitHub, un workflow de deploy en `push`), lo dice aparte (rt-8):
   *"en este proyecto, integrar es publicar"*, y pregunta las dos cosas: si integrar de noche sin el dueño está bien (si no,
   `merge-a-main: con-ok`) y con qué se prueba después (`autorizado.publicar`, `comando: al-subir`, con su `humo`).
4. **El `comando-test` con el gestor del repo**: `pnpm test` o `yarn test` según el lockfile, como ya hace con el `comando-setup`.
5. **Verificar que queda andando**: `adoptar --verificar <repo>` (lo corre `--traer` al final, y la flota en su chequeo): cada hook
   registrado en el `settings.json` **existe y carga**; el arranque corre y sale 0; el programa del `comando-test` existe; después del
   `comando-setup`, `core.hooksPath` sigue en `.githooks`; una pieza reemplazada con su zona propia todavía con el texto de relleno,
   avisa. La función vive en `chequeo.cjs`. **No corre el `comando-setup` por su cuenta**: mira `core.hooksPath` después del setup
   que la flota ya corre en su clon; en la carpeta del dueño solo mira (no le ensucia el lockfile ni le frena el cierre). Y la flota
   **no mezcla** un árbol cuyo settings registra un archivo que no está (A5.2).
6. **`molde+propio` solo si se tocó**: el estado es `molde` mientras la zona propia esté vacía o con el relleno; el hash da lo mismo
   con CRLF que con LF.
7. **crit. C1**: `adoptar.test` (un repo con `/inicio` propio y `--director kit`: el bloque lo lista, el archivo anterior queda y el
   TODO tiene su línea; un repo con `release.yml` → `¿?` en `autorizado.publicar` y `--aplicar` se niega hasta contestarlo; lockfile
   de pnpm → `pnpm test`); `chequeo.test` (un settings que apunta a un hook que no está → falla y nombra el archivo; un `prepare` que
   cambia `hooksPath` → falla); `actualizar.test` (zona vacía → `molde`; el mismo texto en CRLF y LF → el mismo hash). **Mutación** en
   los chequeos de `--verificar`.

**C2 · Preparar la PC.**
1. **Trae los repos de la cuenta** (60): `ES/traer-repos.cjs listar` (con `gh`: los de la cuenta y los de sus organizaciones; marca
   los que ya están en la carpeta de proyectos, por su `origin`) y `clonar <dueño/repo>…` (a la carpeta de proyectos, con
   `core.longpaths`; si el repo trae ficha, prende los ganchos). "Preparame esta PC" lo ofrece como una pregunta: *"¿traigo repos de
   tu cuenta?"*, con la lista. Nunca clona sin que el dueño elija, ni pisa una carpeta que existe. **El `comando-setup` de un repo
   recién traído no corre solo**: es código de ese repo; la sesión muestra el comando y pregunta, repo por repo. Todo clon del
   Equipador lleva `core.longpaths` (10).
2. **La autorización de publicar es un sí por repo** (37, 48; rt-3: que una ficha diga `publicar` no alcanza, y menos la de un repo
   de una organización que mantiene otro). "Preparame esta PC" **pregunta**, por cada repo cuya ficha **vigente** (la de
   `origin/<defecto>`, no la del disco) trae `autorizado.publicar` con un comando (no `al-subir`) y que esta PC todavía no autorizó o
   cuya huella cambió: *"¿autorizás que <proyecto> publique solo desde esta PC? Publica con: <comando> · lo prueba con: <humo> · vuelve
   atrás con: <volver>"*. Con el sí corre `preparar-pc.cjs … --publica <origin>`; con el no, `--no-publica <origin>` (así también se
   **saca** una autorización). Una corrida sin ninguna de las dos (la de siempre, o la de la flota) **conserva `publica:` tal cual**
   (r2-7): ni agrega ni borra.
   **El contrato** (`noche.cjs` lo lee en la B, `preparar-pc.cjs` lo escribe en la C; las dos tandas lo prueban con **el mismo
   ejemplo**, que la C copia de `noche.test`):
   - en `~/.claude/kit-pc.md`, `publica:` es una lista de mapas en línea: `- {origin: "<origin normalizado>", huella: <12 hexa>}`;
   - **el `origin` normalizado**: sin `.git` al final, el host en minúsculas, y `git@host:dueño/repo` igual a `https://host/dueño/repo`;
   - **la huella** es `ficha.hash` de un texto de renglones unidos con `\n`: `comando=<…>`, `humo=<…>`, `volver=<…>` (vacío si no
     hay), y después un renglón `<ruta>=<hash>` por cada **archivo nombrado**, en el orden en que aparecen y sin repetir. La ruta,
     relativa a la raíz y con `/`; el hash, `ficha.hash` del contenido en `origin/<defecto>` (`git show`), con los fines de línea en LF;
   - **archivo nombrado** (r2-4): por eso la ficha (A1.1) solo admite dos formas de comando. `<intérprete> … <archivo del repo> …` →
     ese archivo; `<npm|pnpm|yarn> … run <script>` → el `package.json` de esa carpeta, **entero** (cambiar el script `deploy` mueve la
     huella).
   Si cambia un comando o uno de esos archivos, la noche **deja de publicar** y "preparame esta PC" vuelve a preguntar.
3. **Para las sesiones de día**, por cada repo autorizado `generarAutoMode` suma una entrada en `autoMode.environment`: `<proyecto>
   (<origin>): publicar con «node .claude/scripts/noche.cjs publicar» está autorizado por el dueño en esta PC`. La sesión de cierre
   no la necesita (corre en `dontAsk`). El `doctor` (`automode`) avisa si una ficha con `publicar` no está autorizada en esta PC o
   si su huella cambió.
4. **Quién firma** (r2-3): `--publica` es una firma del dueño, y **una sesión no se la puede dar sola**: el freno de la PC la trata
   como a `aprobar` (A2.4): con ventana, pregunta, y ese clic es la firma; sin ventana, de fondo o en una carpeta de agente, niega.
   Que con ese clic la escritura en `~/.claude/` corra sin que el clasificador la frene es P2; si no, la línea la corre el dueño.
5. **Las carpetas vacías** (35a): al borrar lo que el kit ya no trae, borra también las carpetas que quedan vacías.
6. **crit. C2**: `traer-repos.test` (con un `gh` de mentira: lista cuenta y organizaciones, marca el que ya está; `clonar` no pisa una
   carpeta existente y **no corre** el `comando-setup`; el clon queda con `core.longpaths` y los ganchos); `preparar-pc.test` (una
   ficha con `autorizado.publicar` y sin `--publica` → ni `publica:` ni entrada; con `--publica <origin>` → el renglón con **la huella
   del ejemplo compartido** y la entrada exacta; una corrida después sin banderas → `publica:` sigue igual; `--no-publica` → se va;
   la ficha del disco dice `publicar` y la de `origin/<defecto>` no → no hay nada que autorizar; `npm run deploy` → la huella cambia
   al cambiar `package.json`; una carpeta que queda vacía se borra); `doctor.test` (ficha con publicar y PC sin el sí → ⚠).

**C3 · El Arquitecto.** `modo-b.md` y `formato-spec.md`: al armar un módulo con director pregunta **"¿lista o cola?"** y lo deja en la
ficha (`- Plan: lista | cola`; una cola dice su regla y cuándo termina) (17); las tareas de la ficha van agrupadas por tramo (`###
Tramo N`), que es lo que lee `/estado`; el spec gana una lista **"Antes de lanzar: lo del dueño"** (cada cambio de freno y cada paso
que solo puede dar el dueño), y el director no reparte lo que depende de ella hasta que esté hecha (57); al armar dice el nombre de la
sesión del director (`director-<x>`) (59); con director y el spec en BORRADOR no dice "sellada" (R11). `arquitecto.cjs`: el `sello`
toma el turno (B5) y su plazo coincide con el que manda la skill (R18). **crit. C3**: `skill.test` (las frases y los topes);
`arquitecto.test` (el `sello` con el turno tomado espera).

**C4 · Lo chico del Equipador.** `doctor`: reconoce `py` cuando es el alias de Windows (35b), dice 29 chequeos y no 26, su arreglo de
`:410` apunta a una ruta que existe y deja de mandar "corregilo a mano" (R8, R20); avisa si un repo tiene `autorizado.publicar` y la PC
no. `--traer`: sale **distinto de 0** cuando no trajo (R16), deja pasar los archivos sin seguir que no chocan (11) y dice qué worktree
tiene tomada la rama (35c). Las líneas que el kit imprime para correr dejan de llevar `&&`: un paso por renglón, y las corre la sesión
(R12). `actualizar.cjs:1130` y los textos hermanos dicen quién aprueba como A2 (R6). La flota: `--canon` con valor por defecto (el
repo canónico del `doctor`), dice que se corre de fondo, y *"mezclá vos"* y *"borrá la rama desde la web"* pasan a ser algo que ofrece la
sesión (51). "Preparame esta PC": el plan resumido en una línea y sin pregunta cuando dice "sin cambios"; el `doctor`, *"todo bien · N
avisos · N cosas a arreglar"* y el detalle a pedido (51). `skills/habla.test` sobre `EQ/**` y `AR/**`: cero "guido" (salvo la URL del
repo canónico y los alias) y cero rojo/verde en lo que ve el dueño (la tabla de la flota, la pantalla de la adopción, el `doctor`).
Si `EQ/SKILL.md` no entra en su tope (le quedan 31 B), se recorta; no se sube el tope. **crit. C4**: un caso por arreglo en su `*.test`.

**C5 · Los papeles.** `GUIA-DE-USO.md` (una frase y un puntero por cosa nueva: el parte, `/estado`, el clic, publicar sola, traer
repos); `manuales/ROLES.md` (§3 y §7: sin despertador ni 40 %; la sesión de cierre; los nombres), `MOLDE.md` (la tabla de las cinco
puertas; `autorizado.publicar`), `SCRIPTS.md` (`noche cierre|publicar|parte`, `worktree limpiar`, `estado --director`, `cambios nuevo
--en-defecto`), `EQUIPADOR.md` (traer repos; adoptar); `kit/INSTALAR.md` queda en una sola ruta, la del README (51);
`kit/CHANGELOG.md` con la **nota de migración**: el settings pasa a un hook; los frenos del día a día salen del árbol; `Apertura` nace
en `director`; el despertador ya no existe; `autorizado.publicar` nace en `no`; los alias viejos siguen valiendo.

**C6 · La suite, la flota y el tag** (como manda el plan del tramo, sesión 4, punto 5): la suite entera sola y en segundo plano; la
flota de prueba (`pruebas/rehacer.sh` y la flota contra `alfa`, `beta` y `gama`); la flota contra **un clon de Deptos** en el
scratchpad, `rc.6` → `rc.7`, y después `adoptar --verificar` sobre ese clon; si todo pasa, `kit/VERSION` `3.0.0-rc.7`, el tag anotado
**después** de la suite, `push` y `kit-sync.sh sync`.

## Probar antes de prometer

Cada una es un paso de la tanda que la usa, con su resultado escrito en "Lo que salió al construir" (pasó · falló · qué se hizo).

| # | Qué hay que saber | Tanda | Cómo se prueba | Si sale mal |
|---|---|---|---|---|
| **P1** | Si una sesión de la extensión de VS Code se puede poner nombre sola (`--name` en `-p`) y si un mensaje entre sesiones llega por nombre (59) | B | Con el `claude.exe` de la extensión, en `-p`: lanzar con `--name` y ver si aparece; mandar un mensaje a ese nombre desde otra `-p` | Nada se rompe: el nombre sale de la rama y el destino va escrito en el mensaje. Se saca `--name` de la línea y queda NO VERIFICADO para la pestaña |
| **P2** | Si autorizar una PC puede ser **un clic**: el freno de la PC pregunta por `preparar-pc.cjs --publica` (A2.4) y, con el clic, el clasificador no frena la escritura en `~/.claude/` | C | En un `--home` de mentira no se puede (el clasificador mira el de verdad): queda armado, y se prueba el día que Guido corra "preparame esta PC" con un repo que publique | Como hoy, y ya decidido: lo corre el dueño, **una línea de PowerShell**, una vez por PC y cada vez que cambia cómo publica un repo. El kit la da entera y sola en su renglón |
| **P3** | Si un hook hereda las variables de la sesión que lo dispara (`KIT_FONDO=1`) | A | Una `-p` lanzada con la variable y un hook de prueba que la imprime | `autorizado` y `noche.cjs cierre` escriben una marca `.kit-fondo` en la carpeta (como `.kit-rol`) y los frenos miran la marca. Para el cierre no hace falta: `dontAsk` ya es "sin ventana" |
| **P4** | Si la sesión de cierre, en `dontAsk` y con su lista, llega al final: `pull`, `noche.cjs publicar`, los papeles del `/cierre`, `limpiar`, el parte y el `push` | B | En un repo de prueba con un publicar de mentira y **un `allow` de más en su settings local**, ocho corridas; se cuenta qué se negó y que ese `allow` no corrió | Lo que falte se **suma a la lista** con su argumento fijo (nunca un comodín). **No hay plan B en `auto`** (r2-6: devuelve la decisión al clasificador): si `dontAsk` no alcanza, el cierre se queda sin `/cierre` de papeles (publica, limpia y deja el parte) y los papeles van a "Te necesito" |
| **P5** | Si un solo proceso de freno baja de verdad el tiempo bajo carga | A | A0, antes y después | Se queda el plazo nuevo y el aviso honesto; el settings vuelve a los tres hooks (siguen andando solos) |
| **P6** | Si una sesión de fondo en la carpeta principal puede correr el `/cierre` del proyecto con el director todavía vivo en su worktree | B | En un repo de prueba, con una `-p` parada en un worktree y otra en la principal | La sesión de cierre sigue los pasos del `/cierre` leyendo su `SKILL.md`, sin invocarlo como skill |
| **P7** | Si **el clic en la pestaña del director** anda: con el director adentro de su worktree (entró con `EnterWorktree`) y en `auto`, ¿aparece la ventana de `aprobar`, y con el clic el script firma en la carpeta principal sin que el aislamiento lo frene? | A | Lo automático, en la tanda: el freno y el script, con sus casos (crit. A2), y una `-p` de director en `../vibe-kit-pruebas/rc7/alfa` que corre `aprobar` y tiene que salir **negada por falta de ventana**, no por el aislamiento. El clic de verdad pide una persona: queda armado en ese repo, y se le pide a Guido **un clic** cuando el director del tramo lo vea oportuno | **El clic se hace en una sesión abierta en la carpeta principal** (`/estado` lo ofrece): ese camino no depende del aislamiento y queda siempre. Si el problema es solo el aislamiento, antes se prueba que el director lance el `aprobar` como hace con `integrar` (un script que trabaja en la principal); si igual no hay ventana, plan B y se anota para la `v3.1`, con el director sin `EnterWorktree` (V8) |

**Queda NO VERIFICADO y la `rc.7` no depende de eso**: la pestaña de la extensión (todo se prueba con su binario en `-p`, que es como
corre lo de fondo); el clic de aprobar con una persona de verdad (armado en `../vibe-kit-pruebas/rc7/alfa` desde la revisión); y cómo
trata Claude Code un `ask` de un hook cuando una `allow` coincide (el diseño no cuenta con eso: donde no hay ventana, el freno niega).

## La noche de prueba de R2 (la corre la sesión 5, sin Guido)

**Dónde**: un clon de Deptos en el scratchpad de esa sesión. Nunca la carpeta de Guido, de la que solo se lee.

**El armado**, en orden:
1. `git clone` desde la carpeta de Deptos (solo lectura), parado en lo que ahí es `origin/main`. Un remoto `bare` nuevo en el
   scratchpad, y el `origin` del clon apuntando a él. **Antes de cualquier `push`**: `git remote get-url origin` cae dentro del
   scratchpad; si no, para.
2. **Sin claves, sin Docker y sin caminos a lo real** (rt-11: "sin `.env`" no alcanza si la PC tiene una sesión abierta en algún
   programa del proveedor). No se copia ningún `.env`. En el clon se **sacan**, en un commit del andamio, las skills de publicar y de
   humo propias de Deptos (`.claude/skills/release`, `.claude/skills/smoke`). Y antes de lanzar, **desde el clon**: los programas del
   hosting y de la base (`vercel`, `supabase`) no tienen sesión abierta (`vercel whoami` y `supabase projects list` fallan), y no
   existen `app/.vercel` ni `supabase/.temp`. Si algo de eso no se cumple, **para** y lo dice: no se lanza.
3. El `comando-test` de Deptos corre sin base (`arnes.py --solos`). Se instala lo que pide (`npm --prefix app ci`, los paquetes de
   `scripts/requirements.txt`).
4. El clon al día a la `rc.7`, con la flota (`--canon` = este repo en el tag). `adoptar --verificar` tiene que pasar.
5. **Un publicar de mentira**, tres scripts chicos en el clon: `publicar` sube `main` a una rama `produccion` del remoto de prueba y
   deja un archivo con la fecha y el commit; `humo` chequea que `produccion` sea ese commit y que el archivo esté; `volver` repone el
   anterior. La ficha del clon gana `autorizado.publicar` con esos tres. Como no hay dueño, ese cambio de barrera se firma **como lo
   hacen las pruebas del kit** (por la lib, sin la ventana), y la autorización de la PC se arma con `preparar-pc --home <uno de
   mentira> --publica <el origin>`; `noche.cjs` acepta ese home de prueba (la variable `KIT_HOME_PC`, que ninguna skill nombra)
   **solo si el `origin` del repo es una carpeta de esta PC**. Las dos cosas quedan dichas en el informe: son el andamio de la
   prueba, no el camino del dueño, y por eso **la firma y la autorización de la PC no las mide esta noche** (las cubren sus pruebas).
6. **Un módulo chico, `noche-prueba`, de tres encargos** que no dependen de la base (del TODO de Deptos): exigir `DEPTOS_BANCO` en
   `conenv` para un banco 2 o más, con su caso en `test_conenv.py`; un arreglo de solo texto en el TODO; y uno que **suma una
   dependencia chica de desarrollo** en `app/` (rt-10: así el cierre tiene que instalar antes de probar, como en la vida real). El
   spec lo escribe y lo sella la sesión 5 (es el andamio).
7. **El lanzamiento**: un director de fondo en el clon (`-p`, Opus, modo `auto`), con un primer pedido que le dice que arranque sin
   esperar el OK, que el dueño ya se fue y que termine el módulo y cierre la noche. Obreros en Sonnet, de a dos. En segundo plano, sola
   en la PC. Tope: 3 horas.

**Qué se mide, y cómo**:

| Criterio | Cómo se mide | Pasa si |
|---|---|---|
| **0 comandos tipeados por el dueño** | Se buscan comandos (`node `, `git `, `cd `, una línea entre comillas invertidas para correr, un `!`) en lo que le llega: el parte, las salidas de `estado.cjs`, el "Te espera" del handoff y el último mensaje del director y del cierre | Cero. Y "Te necesito" trae solo clics o decisiones |
| **Termina y publica sola** | Después del lanzamiento no se le manda nada. Se mira: el proceso del director terminó solo; `produccion` del remoto de prueba es el `main` que trae los tres encargos; el resultado de `publicar` dice que el humo pasó; **la publicación la hizo `noche.cjs publicar`** (su archivo de resultado está, y en las charlas del director y del cierre nadie corrió los scripts de publicar sueltos); el handoff, el CHANGELOG y el TODO tienen lo del módulo; `git worktree list` da solo la principal después de un `estado.cjs` | Todo eso, dentro del tope |
| **`/estado` con sus cuatro secciones** | `estado.cjs` y `estado.cjs noche-prueba` tres veces: con obreros vivos, al terminar, y a la "mañana" | Las cuatro, en orden, las seis veces; y la cuenta de encargos cerrados coincide con git |
| **Nada dice "rojo"** | `rojo`, `roja`, `verde` como palabra en los mismos textos del primer criterio | Cero |

Además, sin ser criterio: cuántos frenos negaron y cuántos se pasaron de tiempo (del registro común), qué le negó `dontAsk` a la sesión
de cierre, los minutos de reloj, y el costo. Si la noche no termina, el informe dice **en qué paso se quedó** y con qué mensaje: eso es
lo "grande" de R2. **Lo que esta noche no mide** (y R2 lo dice): un proveedor de verdad, la pestaña de la extensión, la firma con una
persona, dos módulos que terminan a la vez, un proyecto que publica al subir, y un comando de publicar de la forma `npm run`.

## NO SE TOCA

- Lo de A1-A10 y lo que dice "Sigue igual" arriba. `/tramo` y los seis agentes. `idleCompaction`. La regla "nunca `ExitWorktree`".
- **Cómo se valida una firma** (`validarSello`, `commitDelSello`): A2, A3 y A6 no cambian ni una. De las condiciones de `aprobar`
  cambia una sola: **quién lo puede correr** (A2.3); lo que exige de la carpeta principal y lo que escribe el sello, igual.
- Lo que frenan `secretos` y `git-seguro` fuera de A4 y A7. El `deny` de leer `.env`. `escritura-docs`.
- El `CLAUDE.md` de un repo ya adoptado (`trato: nunca`). El tope de 8.000 B de las skills (`/director` no crece: lo que no entra va a
  `cierre-noche.md`). El catálogo de piezas.
- Las carpetas reales de Guido: solo lectura, desde `origin/main` o un clon. `~/.claude/` lo escribe `kit-sync.sh sync`. Las actas de
  `tips/` y `_fuente/`. El tracker, `docs/README.md` y el handoff son del director del tramo.
- **Ningún patrón de freno nuevo que no sea un arreglo** (la regla barata de V4): los únicos que entran son A1.3, A2.4 y A4.

## Entorno de prueba

Temporales de las pruebas (`node --test`), con la rama por defecto `main` y `trunk`. Los repos de `../vibe-kit-pruebas/` (`alfa`,
`beta`, `gama`, y `rc7/` de la revisión para P3, P4 y P6). El clon de Deptos en el scratchpad, con su remoto `bare` chequeado antes de
cualquier `push`. Nunca el `~/.claude/` real: las pruebas pasan un `--home` de mentira.

## Criterios de aceptación

Los **crit.** de cada cambio (A1 a C4) y:
- **crit. 20** · la suite entera pasa, **una sola vez, al final de la C, sola y en segundo plano** (las que fallan por carga se repiten
  solas antes de contarlas).
- **crit. 21** · la flota: `alfa`, `beta` y `gama` quedan `mezclado` o `te espera` con su porqué, y repetida, `al día`; el clon de
  Deptos, `rc.6` → `rc.7`, `mezclado`, con **un** hook para `Bash|PowerShell` en su settings y `adoptar --verificar` en 0.
- **crit. 22** · el revisor frío de cada tanda (uno, una vuelta) sin nada ALTO abierto.
- **crit. 23** · en todo el kit instalable, las tres `habla.test` en cero.
- **El criterio de éxito de la `rc.7`** se mide en R2 (los cuatro de la tabla de arriba), no acá.

## Decisiones de la sesión del spec (la vara: ADR-030 y ADR-034)

| # | Decisión | Por qué | Mueve |
|---|---|---|---|
| D8d-1 | **La noche publica por un script del kit** (`noche.cjs publicar`), no porque la sesión tipee el comando | Las autorizaciones, las pruebas y el estado de la carpeta se chequean por código antes de correr nada; un modelo que lee una instrucción puede saltearse un paso | mejor código · consistencia |
| D8d-2 | **La clave es `autorizado.publicar`**, un comando por paso | `autorizado:` ya es "lo que no es pregunta" y ya es barrera por clave: cambiarla pide el clic del dueño sin tocar el candado. Un solo comando obliga a que publicar no lea claves a la vista (37) | consistencia · acordarse de menos |
| D8d-3 | **Si publicar está en `sensible.release`, la ficha no valida con `autorizado.publicar`** | Contesta "cuál manda" (48) sin una marca nueva: no pueden decir cosas distintas | consistencia |
| D8d-4 | **Vale de día y de noche** | La autorización es del proyecto, no de la hora; lo que el dueño dijo es "en mis repos personales pueden integrar, publicar" | flujo |
| D8d-5 | **La autorización de la PC es un sí por repo, con huella**, anotado en `kit-pc.md` por "preparame esta PC" (rt-2, rt-3) | Que la ficha lo diga no alcanza (la puede traer un repo ajeno), y sin huella el sí cubría cualquier cosa que después se le agregara al script de publicar | mejor código |
| D8d-6 | **El clic es en la pestaña del director** — **decisión de Guido**, 2026-11-12: *"el clik lo quiero hacer siempre en director, las aprobaciones son con el, no con los obreros"*. Lo técnico, mío: el script firma en la carpeta principal, el sello no cambia, la sesión de la principal queda como segundo camino, y cuatro negativas cierran que un obrero firme por él | Es donde el dueño ya está charlando; la recomendada era la otra (lo probado), así que va con P7 y su plan B | flujo |
| D8d-7 | **Un cambio nacido en un módulo viaja solo a la rama por defecto**; no se aprueba "desde el módulo" | No abre un camino nuevo de confianza: la firma sigue viviendo solo en la rama por defecto | mejor código |
| D8d-8 | **Un proceso de freno en el proyecto y uno en la PC**, con el portero en `hooks/lib/`, que carga solo lo que está en `molde` | Baja de cuatro procesos a dos sin tocar el catálogo; lo adaptado sigue corriendo como hoy; los tres hooks siguen andando solos como plan B | flujo · mejor código |
| D8d-9 | **Un freno sin tiempo niega, pero dice la verdad** | Fallar abierto con la PC cargada es justo cuando más obreros hay | mejor código |
| D8d-10 | **`frenos.log` se parte**: la firma versionada, lo demás fuera del árbol | La firma depende del archivo versionado; sacarlo entero era rediseñar el candado | filtro pragmático · flujo |
| D8d-11 | **Los nombres con "guido" quedan como alias**; los nuevos no nombran a nadie (`con-ok`, `--con-ok`, `necesita-persona`, `Apertura: dueño`) | Las claves de una ficha viva son barrera: ningún script puede reescribirlas. Y sin ñ ni persona en un nombre que se parsea | consistencia |
| D8d-12 | **`con-gate-verde` se queda** | Es un valor que lee un script, no algo que se le dice al dueño; la pantalla de la adopción lo explica en palabras | filtro pragmático |
| D8d-13 | **Los comentarios que citan a Guido se quedan** | Son la cicatriz de cada regla, y no los lee quien instala | filtro pragmático |
| D8d-14 | **No se afloja ningún freno por la clase del entorno**; al obrero se le dice a qué banco apunta | El pedido era saber, no leer el `.env` | mejor código |
| D8d-15 | **El nombre de una sesión sale de su rama** (`director-<x>`, `obrero-<x>--<ID>`), el esquema que el kit ya sugería | No depende de que la plataforma deje renombrarse sola (NO VERIFICADO) | consistencia · acordarse de menos |
| D8d-16 | **La regla de habla va en lo que inyecta el arranque** | Es el único lugar que llega a toda sesión de un repo adoptado; `/inicio` no tiene lugar y el `CLAUDE.md` no viaja | consistencia |
| D8d-17 | **No entran**: un tope de obreros vivos en `autorizado` (24d), reusar `node_modules` (26), `verificar` con la ficha del módulo (23), las claves ficticias y `restaurar-arbol` del gate (55), el cierre desde una carpeta temporal, marcar los scripts de publicar como barrera | Sin cicatriz que lo pida, o cambian una protección pensada (la ficha vigente es la de la rama por defecto a propósito; "ningún patrón de freno nuevo") | filtro pragmático |
| D8d-18 | **La sesión de cierre corre en `dontAsk` con una lista cerrada**, no en `auto` (rt-1) | En `auto`, lo que no está en la lista lo decide un clasificador que en las pruebas dejó publicar sin autorización; acá tiene que ser "no corre" | mejor código |
| D8d-19 | **Aprobar se sigue reconociendo ancho** (con tres excepciones) y **solo desde la carpeta principal de ese repo** (rt-4, rt-5) | Achicarlo abría `$(…)` y `pwsh -c`; y una ventana en la sesión de otro proyecto es justo el 33 (f) | mejor código · consistencia |
| D8d-20 | **Un humo que falla traba la publicación siguiente** hasta que el dueño diga (rt-6) | Si no, la noche siguiente publica encima de algo roto | mejor código |
| D8d-21 | **Un proyecto que publica al subir no gana una autorización nueva**: lo gobierna `merge-a-main`, y el kit solo le suma la prueba de humo y la traba (rt-8, r2-2) | Tratarlo como al que publica por comando pedía una huella del pipeline, que puede vivir fuera del repo, y dejaba al `push` de los papeles volviendo a publicar | filtro pragmático · consistencia |
| D8d-22 | **Las tres firmas del dueño** (`aprobar`, autorizar la PC, destrabar una publicación) **entran por el mismo freno de la PC**: con ventana preguntan, sin ventana niegan (r2-3) | Sin eso, una sesión en `auto` se daba sola la autorización que le faltaba | mejor código · consistencia |

## Lo que esto no cierra

- **El clic en la pestaña del director no está probado con una persona** (P7): si no anda, el clic es en una sesión de la carpeta
  principal. Y el director puede pedirte la firma de un cambio que él mismo propuso: la red es que la ventana dice quién la pide
  y qué toca, que de noche no hay firma, y que un obrero no puede.
- **Publicar sin persona no es una frontera**: quien puede escribir en el `~/.claude/` de la PC puede fabricarse la autorización; y
  la huella mira los archivos que los comandos **nombran**, no lo que esos archivos cargan por dentro, ni una variable del
  entorno, ni (en un proyecto que publica al subir) el pipeline del proveedor. Es contra accidentes
  (ADR-029): lo que se cuida es que una sesión no publique **sin querer**, y que un cambio en cómo se publica no pase callado.
- **Autorizar una PC puede seguir siendo una línea** que corre el dueño (P2). No entra en "la noche": es una vez por PC, y otra
  cuando cambia cómo publica un repo.
- **Volver atrás es del proyecto**: si no declara `volver`, una prueba de humo que falla deja lo publicado, lo dice primero en el
  parte y traba la publicación siguiente.
- **Una carpeta principal con cambios sin guardar o en otra rama frena el cierre** (no se pisa el trabajo del dueño): la noche
  integra, no publica, y lo dice.
- **La carpeta del director puede quedar abierta** hasta que se cierre su sesión (Windows); la cierra `limpiar` la próxima vez.
- **`esDeAprobar` sigue sin ver** un alias, una variable o un script que llame a `cambios.cjs` por dentro (ya lo dice el hook).
- **Las `allow` del proyecto siguen sin valer de fondo** (39): no se arregla, se deja de contar con ellas.
- **El obrero sigue en `auto`**: lo que no está en su lista lo decide el clasificador, como en las dos noches. Pasarlo a una lista
  cerrada es otra conversación (cambia cómo trabaja), para la `v3.1`.
- **A la `v3.1`**: el director corto, el aviso al celular, el plugin, la poda de frenos por evidencia, el costo por encargo, la mesa en
  lote, el candado en repos con historia (58), probar el `/tramo` del kit en un proyecto grande, el buzón, "probar una idea nueva" y el PO.

## El red team del spec

**Primera ronda** (`redteam-spec`, Opus, sobre el spec entero, 2026-11-12): **3 ALTOS, 8 MEDIOS, 3 BAJOS. Los 14, integrados**; ninguno descartado.

| # | Sev. | Qué encontró | Qué cambió en el texto |
|---|---|---|---|
| rt-1 | ALTO | La sesión de cierre es "humano" para todos los frenos y en `auto` su lista no cierra nada: si `publicar` fallaba, podía correr el comando suelto o arreglar código y subirlo | B3.1 (`dontAsk`, lista con argumentos fijos, sin editar código), B3.2.4 (desde lo último publicado, solo módulos y papeles), B3.3 (`subir`), B3.4 (0), A1.3 (la guardia vale en toda sesión sin ventana); D8d-18 |
| rt-2 | ALTO | Ninguna autorización fijaba **qué** se publica: el sí cubría lo que después se le agregara al script (una migración a la base real) | La huella (B3.2.2, C2.2); la ventana de aprobar muestra los ids y el control, no un título que escribe el agente (A2.3) |
| rt-3 | ALTO | La autorización de la PC salía sola de las fichas en disco: un repo ajeno recién traído quedaba autorizado | Un sí por repo, preguntado y anotado, leyendo la ficha vigente (C2.2); `traer-repos` no corre el setup solo (C2.1); D8d-5 |
| rt-4 | MEDIO | El criterio de A2 contradecía la prueba 3g: una sesión de otro proyecto mostraba la ventana | Solo desde la carpeta principal de ese repo; el resto se niega (A2.3) |
| rt-5 | MEDIO | Achicar `esDeAprobar` dejaba pasar `$(…)`, las comillas invertidas y `pwsh -c` | Sigue ancho, con tres excepciones (A2.1); D8d-19 |
| rt-6 | MEDIO | Con el humo fallando, la noche siguiente publicaba encima | Queda trabado hasta que el dueño diga; las salidas, definidas (B3.2); D8d-20 |
| rt-7 | MEDIO | Dos cierres a la vez en la misma carpeta | El candado de cierre del repo (B3.4) y no repetir el mismo commit (B3.2) |
| rt-8 | MEDIO | Un proyecto que publica al subir ya publica en cada `integrar` | `comando: al-subir` (A1.1; rehecho por r2-2), el humo y la traba (B3.2), la adopción lo pregunta (C1.3) |
| rt-9 | MEDIO | El portero cargaba lo que hubiera en disco: un hook adaptado, o un settings adelantado a su lib, bloqueaba todo | Carga solo lo `molde`; lo demás, como proceso (A5.2); la flota no mezcla un settings que apunta a algo que no está (C1.5) |
| rt-10 | MEDIO | `publicar` probaba con las dependencias viejas de la carpeta principal, y R2 no lo medía | El `comando-setup` antes (B3.2.5); un encargo de R2 suma una dependencia |
| rt-11 | MEDIO | R2 podía tocar lo real por una sesión abierta del proveedor en la PC | El andamio saca las skills de publicar del clon y chequea que no haya sesión; si no, para (R2, paso 2) |
| rt-12 | BAJO | Un prefijo mal elegido devolvía la suciedad al `frenos.log` versionado | El id exacto (A6); la B saca los "commiteá `frenos.log`" (B4.8) |
| rt-13 | BAJO | Las `tmp/` borrables por cualquiera | Solo las del propio encargo (A7 b) |
| rt-14 | BAJO | `publicar` usaba el turno de la segunda línea; `/estado` leía un formato que definía la C | `conTurno` pasa a la primera línea (B5); el formato queda fijado en B2 |

**Segunda ronda** (solo los tres ALTOS, sobre el texto ya corregido): **4 ALTOS, 3 MEDIOS, integrados**. En R2, nada ALTO. Es la
última que manda el plan; la tanda B vuelve a pasar B3 por red team antes de cerrarlo.

| # | Sev. | Qué encontró | Qué cambió en el texto |
|---|---|---|---|
| r2-1 | ALTO | `dontAsk` no es "solo la lista": corre también todo `allow` de cualquier settings (el molde permite `cambios.cjs` entero; un "sí, no preguntes más" del dueño), y la sesión podía leer la salida con claves | Lo que sobra va a `--disallowedTools`; la salida, a un archivo de nombre al azar que no se imprime (B3.1, B3.2.6); P4 se prueba con un `allow` de más |
| r2-2 | ALTO | En un proyecto que publica al subir, el `push` de los papeles volvía a publicar y deshacía el `volver` | `al-subir` no lleva `volver` ni autorización nueva (A1.1, B3.2); D8d-21 |
| r2-3 | ALTO | El director, en `auto`, podía correr `preparar-pc --publica` y autorizarse solo | Las tres firmas del dueño, por el freno de la PC (A2.4, C2.4); D8d-22 |
| r2-4 | ALTO | La huella no veía `npm run` ni estaba definida como para que dos tandas calcularan lo mismo | Dos formas de comando (A1.1) y el contrato entero, con un ejemplo compartido (C2.2) |
| r2-5 | MEDIO | El `/cierre` pide cosas que la lista no traía | La lista sale de leer el `/cierre` paso por paso; `cierre-noche.md` dice qué pasos no corren de noche (B3.1, B3.4) |
| r2-6 | MEDIO | El plan B de P4 (volver a `auto`) reabría rt-1 | Se saca; el chequeo mira desde lo último publicado, no desde el merge del módulo (B3.2.4, P4) |
| r2-7 | MEDIO | `kit-pc.md` perdía los sí en una corrida común, no había cómo sacar uno, y un `origin` escrito distinto no se reconocía | Se conservan; `--no-publica`; el `origin` normalizado (C2.2) |

**Después de las dos rondas**: la respuesta de Guido cambió A2.3 (el director puede pedir la firma). Ese cambio **no pasó por el red
team del spec**: lo ataca el red team de A2 que la tanda A ya tiene que correr, con esto adentro, antes de cerrarlo. Lo que tiene que
buscar: un camino por el que un obrero, una sesión de fondo o el director de noche lleguen a una firma.

## Lo que salió al construir

*(Lo llena cada tanda: las mediciones de A0, el resultado de P1 a P6, sus decisiones técnicas con la forma `D8d-A1`, `D8d-B1`…, la
mutación, lo que dijo su revisor frío, y su "Resumen para el director".)*

### Tanda A (sesión 2 del tramo final, 2026-11-12, Opus 5.5)

#### Resumen para el director

1. **Terminó casi entera**: A0, A1, A2, A3, A4, A5, A7 y A8 están en `main`, en 9 commits. **A6 no entró** (partir `frenos.log`): toca a
   todos los que escriben el registro y unas 20 pruebas, varias de la B y la C. Va a la continuación, con la nota `sesion-2-tanda-A.md`.
2. **Pruebas**: corrí solo las de lo que toqué, y todas pasan (más de 600 casos en 19 archivos). La suite entera no la corrí: es de la C.
3. **A0**: con la suite atrás, el peor percentil 99 fue 4,8 s → el plazo queda en 60 s (el propio, 50 s). **P5**: con el portero, lo
   inocente (lo que se colgaba) baja de 1,4 s a 0,4 s; lo que niega no baja. **P3 pasó**: el hook ve `KIT_FONDO`.
4. **P7**: lo automático pasó. Un director de fondo recibe la ventana entera y no firma, porque no hay ventana, no por el aislamiento.
   **El clic con una persona sigue NO VERIFICADO**: está armado en `../vibe-kit-pruebas/rc7/p7-firma` (ver `LEEME-P7.txt`).
5. **Red team** (dos rondas, Opus) y **revisor frío**: 5 ALTOS, los 5 arreglados con su prueba. Eran: firmar sin clic con un
   script, un `cd` en otra llamada, la ventana que decía "no aceptes", `sed -Ei` que escribía, y el portero que escondía la segunda
   pregunta. Los MEDIOS y BAJOS, arreglados o anotados con su razón.
6. **Mutación**: la prueba detectó todas las reglas rotas. Firma 39 de 39, `sensible` 25, `git-seguro` 13, portero 7 (con una prueba
   nueva), lo último 9.
7. **Cambios técnicos míos** (D8d-A1 a A11):
   - la firma desde el director exige el "pase" que deja su ventana;
   - una sesión que trabajó como obrero ya no firma.
8. **Para la B**: hay que limpiar textos con "Guido" o "rojo" en `encargo`, `proceso` y `topes`, y decir que las ramas `tmp/` son
   locales. **Para la C**: `hook-sensible` y `hooks-lib` viajan juntos, igual que el settings y el portero.
9. **A Guido no le queda nada obligatorio**. Si el director lo ve oportuno, el clic de P7.

#### A0 y P5: medir antes y después

Cien llamadas por hook y por entrada, de a cuatro en paralelo (`echo hola`, y una que niega). Milisegundos: mediana · percentil 99.

| Cuándo | niega-aprobar | git-seguro | sensible | los tres en un proceso |
|---|---|---|---|---|
| Sin carga, inocente / niega | 114·175 / 394·692 | 158·583 / 998·1307 | 178·1034 / 181·348 | 168·258 / 1014·1578 |
| **Con la suite atrás** (A0), inocente / niega | 388·778 / 1157·2336 | 445·1111 / 2899·**4716** | 442·805 / 702·1570 | 610·1070 / 3078·**4842** |
| P5, con otra carga igual para los dos: los tres sueltos / el portero | inocente: el peor p99 **1440** · niega: el peor p99 1901 | | | portero: inocente p99 **422** · niega p99 2901 |

- **El plazo** (A5.3): el peor percentil 99 fue 4,8 s → `max(60, 3 × 4,8)` = **60 s** en el settings; el plazo propio, 50 s.
- **P5: pasó para lo que dolía.** Los 12 cuelgues de las noches fueron comandos inocentes, y ahí el peor percentil 99 baja de 1,4 s
  a 0,4 s (y un proceso por comando en vez de tres). Lo que niega no baja: lo domina el trabajo de git, no arrancar procesos. Se queda el
  portero; los tres hooks siguen andando solos (el plan B), con el mismo plazo y el aviso honesto.

#### Probar antes de prometer

- **P3 · pasó.** Una `-p` del binario de la extensión (2.1.322) lanzada con `KIT_FONDO=1`, y un hook de prueba que imprime su entorno:
  el hook vio `KIT_FONDO: "1"` (y el modo `auto`). Los frenos leen la variable (`contexto.deFondo`); no hace falta la marca `.kit-fondo`.
- **P5 · pasó a medias** (arriba): baja lo inocente; se queda el portero.
- **P7 · lo automático pasó; el clic con una persona queda NO VERIFICADO.** Armado en `../vibe-kit-pruebas/rc7/p7-firma` (un clon de
  `rc7/alfa` con su propio remoto: `alfa` no se toca a mano), con los frenos de la `rc.7` y la pestaña de un director (`modulo/p7`) que
  ya propuso su cambio con `nuevo --en-defecto` (A3 anduvo en un repo de verdad). Una `-p` de director en ese worktree, en `auto`, corrió
  `aprobar`: le llegó la ventana entera (*"Es tu firma… Te la pide: director-p7. Cambio … · toca: deny:Bash(git stash:*) · control:
  3c2368c5…"*) y, como en `-p` no hay quien la acepte, **no firmó nada**: lo frenó la falta de ventana, no el aislamiento. El clic de
  verdad: las instrucciones están en `p7-firma/LEEME-P7.txt` (abrir la carpeta del director en VS Code y pedir esa línea). Si no
  anda, rige el plan B (el clic en una sesión de la carpeta principal), que no cambió.

#### Decisiones de la tanda A (ADR-034)

| # | Decisión | Por qué |
|---|---|---|
| D8d-A1 | Las tres firmas (y KIT_HOME_PC) viven en `niega-aprobar.cjs`, la misma copia en el proyecto (adentro del portero) y en la PC (adentro de `secretos`) | Una sola regla para las dos puertas; la PC sin preparar conserva la de hoy |
| D8d-A2 | `noche.cjs publicar --seguir` sigue la regla de `aprobar` (pregunta en la pestaña del director, de día, también en `auto`); `preparar-pc --publica` pregunta solo con rol humano o fuera de un repo | El crit. de A2 juntaba las dos con "desde un director en auto → deny"; A2.4 dice que `--seguir` sigue a `aprobar`, y en `auto` la ventana aparece (verificado en la doc por el red team). Manda el texto |
| D8d-A3 | **El pase de un solo uso** (red team de la tanda, ALTO): cuando sale la ventana de aprobar en la pestaña del director, queda `<git común>/kit-firma-pedida.json` (id, control, hora; lo escribe quien decide al final, y solo si lo que sale es esa pregunta); el script, corrido desde el director, exige ese pase (mismo id, mismo control después del `pull`, menos de 15 min) y lo borra | Sin él, un script que el freno no ve (escrito y corrido en la misma línea, o un `npm run`) firmaba desde el director sin clic: la defensa doble del script miraba solo la carpeta |
| D8d-A4 | **Las sesiones de agente quedan anotadas** por `session_id` en `<git común>/kit-sesiones-rol/` en cuanto corren algo en una carpeta de agente (que no sea el director); esa sesión no firma aunque después haga `cd` a la principal | El `cwd` que recibe el hook es el de después del `cd` (doc de hooks): un obrero en otra llamada se volvía "humano" |
| D8d-A5 | La ventana muestra el cambio de la ref (desde el director, la rama por defecto vigente; en la principal, su `HEAD`), no el disco; una firma por clic; desde el director vale solo el script de la carpeta principal; no se firma si la principal tiene commits sin subir; `nuevo --en-defecto` no corre de noche ni de fondo | Red team de la tanda (3, 4, 5, 6 y uno "a propósito") |
| D8d-A6 | La excepción de `esDeAprobar` (commit, heredoc, grep/rg/echo/printf) se apaga si la línea escribe un archivo y corre un intérprete, si un intérprete lee la entrada (`| bash`, `bash /dev/stdin`), con `rg --pre`; las asignaciones cuentan | Red team: escribir y correr en un comando volvía invisible el `aprobar` |
| D8d-A7 | A7 (a): `sed`/`awk` sin `-i` leen; `git grep`/`ls-files`/`blame`/`cat-file` también. `git grep` y `node <archivo>` ya pasaban: no se tocaron | Reproducido antes de tocar: `sed -n '1,40p' .claude/hooks/x.cjs` y `awk` se negaban |
| D8d-A8 | `KIT_FONDO` vacío o `0` es "no"; cualquier otro valor, "sí" (`contexto.deFondo`, una para todos) | Falla para el lado seguro; antes cada freno lo leía distinto |
| D8d-A9 | El portero decide qué carga por la ficha **del disco** (no la vigente) | Lo que se carga es el archivo del disco; y no gasta git |
| D8d-A10 | `sensible`: el id de la guardia es `pregunta:publicar-sin-persona`; ningún `frenos.quitados` la apaga (se apaga con `autorizado.publicar: no`); una ficha rota aporta su `publicar` de la última que se lee; `npm deploy` sin `run` no cuenta | Decididas por la sesión de `sensible`; ver su prueba |
| D8d-A11 | A8: `habla.test` de `hooks/` no mira las librerías que el spec le da a la B (`encargo`, `proceso`, `inyeccion`, `topes`) | "No hay un archivo en dos tandas". **Para la B**: `encargo.cjs` (`Apertura: Guido`, "tiene que ser Guido o director", "falta el OK de Guido"), `proceso.cjs` ("saldría verde") y `topes.cjs` ("el TODO en rojo") tienen texto que limpiar, y su `habla.test` los tiene que sumar |

#### El red team y el revisor de la tanda A

Tres miradas en Opus, sin el contexto de la sesión: un red team de la firma y de `sensible` (A1.3, A2, A3, A4.1, A7 e), otro de
`git-seguro`, el portero y A7 a (A4.2, A5, A7 a-d), y el revisor frío sobre el diff entero.

| Quién | Sev. | Qué encontró | Qué se hizo |
|---|---|---|---|
| rt A 1 | ALTO | Escribir un script y correrlo en la misma línea (`cat > f.sh <<EOF … EOF; bash f.sh`) firmaba desde el director sin clic: la excepción del heredoc lo dejaba pasar y el script solo miraba la carpeta | Arreglado: la excepción se apaga si la línea escribe y corre (D8d-A6), y el pase de un solo uso (D8d-A3) |
| rt A 2 | ALTO | El `cwd` del hook es el de después del `cd`: un obrero en otra llamada se volvía "humano" en la principal | Arreglado: las sesiones de agente quedan anotadas (D8d-A4) |
| rt A 3 | ALTO | Con `nuevo --en-defecto`, la ventana leía el disco de la principal (sin traer): decía "no aceptes" | Arreglado: la ventana lee la ref; el script compara el control (D8d-A5) |
| rt A 4-6 | MEDIO | Dos firmas en un clic; la firma subía commits ajenos; `--en-defecto` de noche | Arreglados (D8d-A5) |
| rt A 7-9, 11 | MEDIO/BAJO | `sensible`: formas de npm/yarn/pnpm, banderas con valor y PowerShell, la rama de obrero, `KIT_FONDO` leído distinto | Arreglados (segunda vuelta de la sesión de `sensible`) |
| rt A 10, 12 | BAJO | Dos preguntas de la PC mostraban una; un `grep KIT_HOME_PC` se negaba | Arreglados |
| rt A "a propósito" | — | Una variable con la palabra, `rg --pre`, `bash /dev/stdin`, la copia de `cambios.cjs` de la rama del módulo | Arreglados (D8d-A5, D8d-A6) |
| rt A2 1 · revisor 1 | **ALTO** | A7 a: `sed -Ei`, `-ni`, `--in-pl`, el comando `w`/`e` de sed y `awk '{print > FILENAME}'` escriben y pasaban como lectura (también sobre `~/.claude/settings.json`) | Arreglado: con `sed`, la `i` en cualquier grupo o `--i…`, y `w`/`W`/`e` en el programa, es escribir; con `awk`, `-i`/`--incl…` y `>`, `|`, `system(`, `getline` en el programa. La línea de PowerShell lleva `-NoProfile -ExecutionPolicy Bypass` |
| rt A2 2 · revisor 2 | **ALTO** | El portero mostraba solo la primera pregunta: con un clic se aceptaba la segunda sin verla | Arreglado: la ventana junta todas las preguntas (la firma primero: "… Además: …") y quedan todos sus renglones; sin plazo corta en el acto; entiende la salida 2 con el motivo en stderr y el JSON con sangría |
| rt A2 3 | MEDIO | `git-seguro` preguntaba al dueño de fondo o de noche | Arreglado |
| rt A2 4 | MEDIO | `pull.twohead=ours` por config era `merge -s ours` sin la bandera | Arreglado |
| rt A2 5, 6 | BAJO | El portero no entendía un hook aparte que niega con salida 2 o con JSON con sangría; el aviso honesto se podía perder | Arreglado: la ventana junta todas las preguntas (la firma primero: "… Además: …") y quedan todos sus renglones; sin plazo corta en el acto; entiende la salida 2 con el motivo en stderr y el JSON con sangría |
| rt A2 7 | BAJO | Un hook `adaptada` que corre aparte anota su propio renglón | Anotado: "un solo renglón por comando negado" vale para lo que corre adentro del portero |
| rt A2 8 | BAJO | El número de commits sale de lo último traído | Arreglado: el texto lo dice |
| rt A2 9 · revisor 10 | BAJO | Una ruta con corchetes que existe igual es un patrón para git (`app/[id]` toca `app/i` si existe) | Anotado: en un proyecto Next.js casi no pasa; `:(literal)` queda para la `v3.1` |
| revisor 3 | MEDIO | La firma en toda la PC negaba dos palabras sueltas en repos sin el kit (`cat src/cambios/aprobar.ts`) | Arreglado: en un repo sin el kit, dos palabras sueltas no son firma (sí si nombra el script o se va a otro lado); `pull --ff-only origin <defecto>`; el pase lo deja quien decide al final, solo si sale la pregunta (en la PC, solo si el proyecto no tiene los frenos del kit) |
| revisor 4 | MEDIO | Faltaba `-ExecutionPolicy Bypass` en la línea de PowerShell de `cargar-secreto` (R19) | Arreglado: con `sed`, la `i` en cualquier grupo o `--i…`, y `w`/`W`/`e` en el programa, es escribir; con `awk`, `-i`/`--incl…` y `>`, `|`, `system(`, `getline` en el programa. La línea de PowerShell lleva `-NoProfile -ExecutionPolicy Bypass` |
| revisor 5 | BAJO | Un obrero puede borrar su `tmp/` en origin según `git-seguro`, pero el githook no le deja subirla ni borrarla | **Para la B (B4, `/obrero`)**: decir que las `tmp/` son locales |
| revisor 6 | BAJO | `aprobar` desde el director hacía `pull` sin remoto ni rama | Arreglado: en un repo sin el kit, dos palabras sueltas no son firma (sí si nombra el script o se va a otro lado); `pull --ff-only origin <defecto>`; el pase lo deja quien decide al final, solo si sale la pregunta (en la PC, solo si el proyecto no tiene los frenos del kit) |
| revisor 7 | BAJO | El pase quedaba escrito aunque otro freno negara | Arreglado: en un repo sin el kit, dos palabras sueltas no son firma (sí si nombra el script o se va a otro lado); `pull --ff-only origin <defecto>`; el pase lo deja quien decide al final, solo si sale la pregunta (en la PC, solo si el proyecto no tiene los frenos del kit) |
| revisor 8 | BAJO | La prueba del portero pasa 12 casos de los tres, no "el mismo juego entero" | Anotado: se quedó en 12 casos representativos (decide lo mismo que los tres sueltos) |
| revisor 9 | BAJO | Los hooks sueltos (el plan B) niegan con el aviso honesto pero no anotan `freno:sin-tiempo` | Anotado: solo lo anota el portero, que es el camino normal |

#### La mutación

Cada regla rota a propósito, la prueba corrida, y restaurada (el archivo, igual al final).

- **La firma** (`niega-aprobar`, el script, la combinación en `secretos`, A7 a): **39 de 39** reglas detectadas por la prueba, después
  del red team. Una primera vuelta, antes del red team, dejó viva "la excepción vale con `$( )`": es redundante (lo de adentro se mira
  como comando propio), quedó como defensa de más.
- **El portero** (A5): 6 de 7; la que vivía ("un solo renglón" con uno que pregunta y otro que niega) tiene ahora su prueba.
- **`sensible`** (A1.3, A4.1, A7 e y su red team): 13 + 12 reglas, todas detectadas (dos sobrevivientes eran código que no hacía nada:
  se sacó).
- **`git-seguro`** (A4.2, A7 b-d): 13 de 13.
- **Lo último** (el `sed`/`awk` que escribe, las preguntas juntas, el pase): 9 de 9.

#### Para las tandas que siguen

- **C (C1.5, la flota)**: `hook-sensible` ahora necesita el `contexto.cjs` nuevo (`deFondo`): **`hook-sensible` y `hooks-lib` viajan
  juntos**, como el settings y el portero; si no, todo comando niega con "freno roto".
- **B y C, los que leen `frenos.log`**: como A6 quedó para la continuación, por ahora nada cambia de lugar.
- **Lo que esto no cierra** (suma): si el dueño dice que no a la ventana del director, el pase queda hasta 15 min (de un solo uso); un
  script del director que lo usara en ese rato firmaría. Es a propósito, no un accidente (ADR-029). Y una sesión de día que alguna vez
  corrió algo adentro de la carpeta de un obrero ya no firma en ese repo (lo dice: *"esta sesión trabajó como obrero"*).

### Tanda B (sesión 3 del tramo final, 2026-11-12, Opus 5.5) — primera sesión; sigue una continuación

#### Resumen para el director

1. **Entró a `main`** (cinco commits): **A6** (el `frenos.log` partido, que la A no alcanzó), **B1** (una cuenta de "encargo cerrado"
   y una lista de "te espera"), **B2** (`/estado` del dueño en cuatro secciones, script y skill), **B3** entero (la sesión de cierre,
   `publicar`, `subir`, `parte`, `limpiar`, `cierre-noche.md` y el paso 9 del director), la lib de **B5** (`conTurno`), buena parte de
   **B4** (el director lanza los obreros; sin 40 % ni despertador en su skill; `Skill: tramo`, `Apertura: dueño`, `- Director:`; la
   línea de fondo con `/<skill>`, `KIT_FONDO=1` y `--name`; B4.7 y B4.8) y de **B6** la regla en el núcleo, el arranque y el molde.
2. **Queda para la continuación de la B** (sigue desde "Para la continuación", abajo): de B4, `presentar` que trae la corrección,
   `mensaje` con `PARA` y sacar el despertador de `noche.cjs`; de B5, el turno en `presentar`/`verificar`/`integrar`; de B6, su
   `habla.test`; **B7 entero**; P4 y P6 (la sesión de cierre de verdad en `dontAsk`); cinco puntos del red team; el revisor frío.
3. **Pruebas**: solo las de lo que toqué, unos 35 archivos (`barreras` 89, `kit-githook` 61, `noche` 30, `worktree` 60, `skills` 109
   entre ellas); todas pasan. La suite entera no (es de la C). `doctor.test` falla desde la A: es de la C (ver "Para la C").
4. **Red team de B3** (Opus, una ronda): 4 ALTOS y 8 MEDIOS/BAJOS. Arreglados con su prueba 3 de los 4 ALTOS y 7 de los otros; el ALTO
   que queda (opciones de git que escriben archivos) y cuatro medios van a la continuación, anotados abajo con su razón.
5. **Mutación de B3**: **21 de 21** reglas detectadas (dos necesitaron una prueba más directa).
6. **P1 pasó a medias**: `--name` en `-p` anda; el mensaje por nombre queda NO VERIFICADO y el diseño no depende de él.
7. **A Guido no le queda nada.** Lo que más importa: la noche ya tiene con qué cerrarse sola; falta probarla de verdad (P4, P6) antes de R2.

#### Probar antes de prometer

- **P1 · pasó a medias.** Una `-p` del `claude` de esta PC con `--name p1-prueba-kit`: la charla quedó con ese título (`custom-title`
  en su `.jsonl`). Que un mensaje llegue por nombre a otra sesión no se probó: queda NO VERIFICADO, y no hace falta (D8d-15).
- **P4 y P6 · no se corrieron** (piden lanzar la sesión de cierre de verdad, en `dontAsk`, ocho veces): van a la continuación, con
  el repo de prueba de `../vibe-kit-pruebas/rc7/` y un `allow` de más en su settings local.

#### Decisiones de la tanda B (ADR-034)

| # | Decisión | Por qué |
|---|---|---|
| D8d-B1 | A6: el renglón va por el id **exacto** `cambios:aprobar` al versionado; el común se encuentra **solo con fs** (`.git` → `gitdir:` → `commondir`); sin repo, todo al versionado como antes; `leerTodo` junta los dos | Corre en cada freno: no puede lanzar git. `validarSello` no cambia |
| D8d-B2 | `verificar` no lee el registro común | Lo que mira es que la rama no borre renglones del **versionado**; el común no viaja en ramas |
| D8d-B3 | `estado.cjs` sin bandera es la vista del dueño; la de antes queda en `--director` | El spec lo pide así; las pruebas viejas pasan a `--director` |
| D8d-B4 | Los minutos de "lo que se hizo" salen de las ramas vivas y, si la rama ya no está, del renglón de `tiempos.md` | "Nunca de la memoria de nadie"; sobrevive a `limpiar` |
| D8d-B5 | El contrato de la huella vive en `hooks/lib/publicar.cjs` (nuevo; viaja con `hooks-lib`) | La C lo copia para `preparar-pc` sin escribirlo dos veces |
| D8d-B6 | Lo negado de la sesión de cierre va en un `--settings` aparte (`<común>/kit-cierre-settings.json`), no en `--disallowedTools` | Red team 11: una regla con `'` o `\` en el settings de la PC rompía la línea en todos los proyectos |
| D8d-B7 | Una `allow` ancha que cubre un ítem de la lista y no es del kit **frena** el cierre; la del kit (`cambios.cjs:*`) se queda y se niegan aparte `aprobar`, `nuevo`, `rechazar`, `anotar-sha`, `subio-al-kit` | Red team 1: con un `Bash` pelado, `dontAsk` corre de todo |
| D8d-B8 | `subir` acepta como papel el `AGENTS.md` de la raíz | Lo genera `agents.cjs` en el `/cierre` |
| D8d-B9 | `publicar` exige también que no haya archivos sin seguir fuera de los papeles, y lo vuelve a mirar antes del comando; la salida se borra siempre; una corrida cortada deja "a medias" (cuenta como trabada); un comando que falla traba | Red team 3, 4 y 5 |
| D8d-B10 | Con `--seguir` (la firma del dueño) se acepta lo que entró por fuera de un módulo | Red team 8: si no, un commit directo de día dejaba la noche sin publicar para siempre |
| D8d-B11 | `--con-ok` es el nombre nuevo de `--ok-de-guido` en `integrar` (el viejo sigue) | B3.7 y D8d-11 |
| D8d-B12 | La sesión de cierre lleva `KIT_CIERRE_ID`; `parte` suelta el candado solo si es el suyo | Red team 6 |
| D8d-B14 | La línea de fondo del obrero lleva `KIT_FONDO=1` y `--name obrero-<x>--<ID>`, y manda `/<skill>` (obrero o tramo); `Apertura: Guido` se lee como `dueño` | P1 y P3 pasaron; el alias viejo sigue validando (D8d-11) |
| D8d-B13 | La regla de habla: los textos que **le llegan al dueño** (`estado`, `noche`, `tiempos`, `portada`, `topes`, `proceso`, las skills que corre él) quedan sin "Guido" ni rojo/verde; lo de entre sesiones (`presentar`, `verificar`, `paquete`, el "prueba en rojo primero" del obrero) se queda | B6 dice "lo que es entre sesiones y scripts se queda" |

#### El red team de B3

Una ronda (`redteam-spec`, Opus, sin el contexto de la sesión) sobre el código, con el spec al lado.

| # | Sev. | Qué encontró | Qué se hizo |
|---|---|---|---|
| 1 | ALTO | Una `allow` ancha que "cubre" un ítem de la lista quedaba viva: `cambios.cjs rechazar`/`anotar-sha`; con `Bash` o `Bash(git:*)`, push de código | Arreglado (D8d-B7), con prueba |
| 2 | ALTO | `git log --output=` escribe archivos (también `kit-publicacion.json`); `git fetch --upload-pack` corre un comando | `git fetch` salió de la lista. **`--output` y las otras opciones: anotado, para la continuación** (es una regla de freno para la sesión de cierre; contra accidentes es poco probable, ADR-029, pero un modelo que "arregla" la traba lo haría) |
| 3 | ALTO | Se publicaba lo que git no sigue (una página suelta en la carpeta) | Arreglado (D8d-B9), con prueba |
| 4 | ALTO | La salida del comando (con claves) quedaba en el temporal | Arreglado: se borra siempre, y `cierre-noche.md` dice que no se busca; con prueba |
| 5 | MEDIO | `publicar` dura más que una llamada de Bash; cortado, no dejaba traba | Arreglado: la marca "a medias" y `cierre-noche.md` lo lanza de fondo; con prueba |
| 6 | MEDIO | El candado lo soltaba cualquiera | Arreglado (D8d-B12), con prueba. **Que `publicar` y `subir` exijan el candado: continuación** |
| 7 | MEDIO | El chequeo 4 se fía del asunto del merge; si git falla, dejaba pasar | Que git falle ya no deja pasar (prueba en la mutación). **El segundo padre del merge: continuación** |
| 8 | MEDIO | El chequeo 4 trababa sin decir por qué | Arreglado: su motivo va a "Te necesito" y `--seguir` lo destraba; con prueba |
| 9 | MEDIO | Huellas que no se mueven: `-w`/`--filter` de npm/pnpm; un archivo que no está en origin | El archivo que falta da 3, con prueba. **`-w`/`--filter`: a la ficha (A1, `formaDePublicar`), continuación o C** |
| 10 | MEDIO | Al parte le llegaba texto del modelo sin filtrar | Arreglado: `paraElDueno`, con prueba |
| 11 | MEDIO | En la PC `Usuario` el cierre no arrancaba (una regla con comillas en su settings); la forma ` *` no se entendía | Arreglado (D8d-B6, `cubre` con ` *` y `./`), con prueba |
| 12 | BAJO | `subir` en un proyecto que publica al subir, con la publicación trabada; el commit del parte con la carpeta no lista | Arreglados (el segundo, en `cierre-noche.md`); el primero con prueba |
| — | — | Matiz: `publicar --seguir` exige la carpeta principal, y A2.4 dice que el director también puede | **Continuación**: decidir si `--seguir` corre desde el director como `aprobar` |

#### La mutación

Cada regla rota a propósito, las pruebas de B3 corridas, y el archivo restaurado (igual al final).

- **`publicar`**: la ficha sin `publicar`, la PC sin autorizar, la huella distinta, el archivo nombrado que falta, la traba, la
  corrida a medias, solo módulos y papeles, las pruebas que fallan, la carpeta principal y el rol, `--seguir` de fondo, el comando
  que falla traba, la salida que se borra: todas detectadas. **La carpeta sucia y `HEAD = origin` sobrevivieron** la primera vuelta
  (el segundo chequeo, antes del comando, las tapaba): con la prueba "mutación de B3" (frenan antes de correr nada), detectadas.
- **`subir`**: solo papeles, y no subir en un proyecto que publica al subir con la publicación trabada: detectadas.
- **La línea del cierre**: negar `git push`, negar `aprobar` y los otros de `cambios.cjs`, frenar una `allow` ancha: detectadas.
- **`parte`**: no soltar un candado ajeno, el filtro de lo que viene del modelo: detectadas.

#### Para la continuación de la B

Sigue el orden del spec: **lo que falta de B4** (`presentar` trae la corrección, B4.3; `mensaje` con `PARA`, B4.6; `noche.cjs despertador` sale y `me-voy` sin despertador ni "mudate", B4.4; el núcleo §3 y `/obrero`: guardar antes de parar, las `tmp/` son locales) → **B6** (`scripts/habla.test` y `skills/habla.test` sobre lo que le llega al dueño:
los textos de `worktree.cjs` con "rojo/verde", el paso 4 del `/cierre`, `encargo.cjs` "apertura de Guido") → **B5** (el turno en
`presentar`, `verificar` e `integrar`, no repetir la base, `plazo-test`) → **B7** → **P4 y P6** → el red team 2, 6, 7 y 9 que quedó
→ el revisor frío de toda la B. Las cosas que muerden están en la nota `sesion-3-tanda-B.md`.

#### Para la C

- `doctor.test` falla en 11 casos desde la A: `hooks-pc` espera el plazo de 20 s y la A5 lo subió a 60; y el inventario lee solo el
  `frenos.log` versionado (A6: tiene que leer `frenos-log.leerTodo`, la copia de `pc/lib`).
- `adoptar` también lee el registro: lo mismo.
- `preparar-pc --publica` escribe `publica:` con el contrato de `hooks/lib/publicar.cjs` (el ejemplo compartido está en `noche.test`,
  "B3 el contrato").
- `hooks/lib/` suma `espera.cjs` y `publicar.cjs`, que viajan con `hooks-lib`; `noche.cjs` y `estado.cjs` los necesitan.

## Ejecución

Tres tandas en fila, cada una una sesión Opus 5.5 (subagentes en Sonnet u Opus, nunca en Fable), con este delta y las reglas comunes de
`TRAMO-FINAL-PLAN.md`: **A** (~4 h) → **B** (~6 h: una continuación prevista, con B5 y B7) → **C** (~6 h con la suite y la flota: una
continuación prevista, con C4, C5 y C6). Dentro de cada tanda, los grupos marcados con ∥ no comparten archivos y se pueden repartir.
El cómo de cada sesión, en [`TRAMO-FINAL-PLAN.md`](TRAMO-FINAL-PLAN.md); por dónde va, en [`PLAN-construccion.md`](PLAN-construccion.md).
