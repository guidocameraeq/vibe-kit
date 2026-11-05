# Changelog del kit

Una sección por versión, la más nueva arriba. Cada una trae su **nota de migración** en tres partes fijas: **Qué piezas cambiaron** ·
**Automático o pide revisión** (pide revisión si toca algo que suele estar adaptado en los proyectos) · **Qué chequear después**.
Es lo que lee el agente de la fusión al actualizar un proyecto. La historia de sesiones del repo vive aparte, en `docs/CHANGELOG.md`.
`kit/VERSION` lleva la versión del último tag y se sube en el commit que pone el tag siguiente.

## 3.0.0-rc.5

Las correcciones del uso real, primera vuelta (2026-11-04, `docs/kit-v3/SPEC-paquete-8r4.md`): lo que dolió en la primera semana de la
beta en Hermes Desktop y el analytics de Arti, y lo que Guido decidió y quiere ya.

- **Qué piezas cambiaron**:
  - **Una sola ventana** (decidido por Guido): `/obrero` y `/director` pueden nacer en `main`. Su primer paso es
    `worktree.cjs donde <x>[--<ID>]` (nuevo, solo lee): si dice `entrar: <ruta>`, entran con EnterWorktree y verifican rama y `.kit-rol`
    antes de tocar nada; si no coinciden, PARADA. `crear`/`abrir` imprimen primero esa vía (`code "<ruta>"` queda de alternativa) y suman
    el deny del `.env` del principal también al `.claude/settings.local.json` del principal (una regla relativa no cubre un `.env` en una
    carpeta padre del worktree). La ventana de `cambios aprobar` dice *"si te lo pide una sesión de /obrero o /director, decí que no"*.
  - **La flota con obra en curso es una opción** (decidido por Guido): `actualizar.cjs flota … --con-obra` actualiza `main` igual y prueba,
    en el clon y sin subir nada, traer `main` a cada `modulo/*` viva (verde · rojo con el `cambios nuevo` exacto · choca). El director lo
    trae con `worktree.cjs traer-main <x>` (nuevo): aborta si choca o si `barreras --indice` da rojo; en verde, commit y push de su rama.
    Adentro del worktree, `donde` y `traer-main` van con el script de `main` (`node ../../../.claude/scripts/worktree.cjs …`): un
    módulo de antes de la rc.5 trae el `worktree.cjs` viejo, que no los tiene.
  - **El merge de `main` en una rama vieja** ya no da rojo por lo que llegó igual desde `main` (Hermes, `cc-ui`: 38 rutas): el candado
    compara contenido en hooks, githooks y `.gitleaksignore` contra cada padre; gitleaks del pre-commit de un merge mira el diff combinado
    contra los dos padres; el pre-push de una rama ya subida no vuelve a juzgar lo que ya está en `origin/<def>`; el rojo de un merge en curso
    dice cómo resolverlo (dejalo como el lado que lo cambió). rf-13 sigue: deshacer un freno de un lado en el merge es rojo.
  - **El tope de las skills avisa, no frena, cuando lo pasa la zona propia** (decidido por Guido): la línea 4 de `chequear` da ⚠ (no
    ROTA) con cuánto se pasa; la parte del kit que pasa el tope sigue ROTA. El `doctor` lo avisa por skill (`tope-skills`).
  - **`/estado` después de las 18 h** ya no sale `estado roto: S.papeles is not a function` (el resumen del día pedía `estado.cjs` antes
    de que exportara; lo trajo la suite de la rc.5, corrida a la noche).
  - **`gitignore.snippet`** suma `!/.claude/frenos.log`: un `*.log` del proyecto lo tapaba y `cambios aprobar` fallaba siempre.
  - Textos: `/obrero`, `/director` (el paso 0, `traer-main` entre encargos), `NUCLEO.md` (el gate desde el worktree del director), el
    `CLAUDE.md` del molde (una línea de EnterWorktree), el modo FLOTA del Equipador y `flota.md`.
- **Automático o pide revisión**: pide revisión en `/obrero` y `/director` si su zona propia nombra la apertura con `code "…"`. El commit
  del kit toca hooks (`niega-aprobar`, `barreras`), githooks y el snippet: como todo commit de la flota, va con la exención del actualizador.
- **Qué chequear después**: `node .claude/scripts/worktree.cjs donde <x>` desde `main` dice `entrar:` con la ruta del worktree; una flota
  con obra sale `salteado` con la bandera nombrada; `doctor` lista `tope-skills` si alguna skill pasa su tope por la zona propia;
  `git check-ignore .claude/frenos.log` no lo da ignorado.

## 3.0.0-rc.4

La `rc.4` exprés (2026-11-04, `docs/kit-v3/SPEC-paquete-8r3.md`): lo que trababa la adopción del bot de Arti (un fork de OpenClaw cuyo
`docs/` es el sitio publicado de OpenClaw) y el primer `/cierre` en Hermes.

- **Qué piezas cambiaron**:
  - **La carpeta de papeles se configura**: `carpeta-docs: <carpeta>` en la ficha (opcional; sin ella, `docs`; en minúsculas). La leen
    de la ficha vigente el arranque (que la nombra: `papeles: <carpeta>/`), el candado, `barreras`, el hook de escritura y todos los
    scripts del molde y del Arquitecto (`docs-ruta.cjs`, nuevo en `hooks/lib/`). Cambiarla es barrera (`frenos:carpeta-docs`); sin
    remoto, el commit que la cambia entra siempre al rango. Los rituales y `NUCLEO.md` dicen una vez que `docs/` es esa carpeta.
  - **Adoptar**: `--mirar` detecta la carpeta de papeles (la única con `SESSION_HANDOFF.md` seguido) y la propone, nombra los sueltos de
    su raíz y avisa de un `docs/` ajeno; `--aplicar` escribe todo el árbol ahí (el CHANGELOG de la adopción, las plantillas, la línea de
    la mesa del `.gitattributes`) y **se niega** con un `docs/` ajeno sin la clave. Un `session-start.cjs` propio con el nombre del del
    kit abre `D3` (con lo que hacía y el puntero a `session-start.propio.sh`), y `--arranque kit` lo reemplaza por el del kit. La línea
    `después:` dice la verdad: el sello va antes del commit; con remoto el rojo es solo en el clon antes del push, sin remoto lo ve el
    primer `/cierre`.
  - **`resolver <carpeta> <pieza> nueva --kit <clon> --por …`** trae la del kit a una pieza `propia` sin informe (el `director-obrero` o
    el arranque de un repo ya adoptado); si es de frenos, imprime el `cambios nuevo` exacto y el orden (aprobado, después el commit).
  - **`barreras` borra el caché de Python ignorado** (`*.pyc` en un `__pycache__/`) de `.claude/hooks`, `.claude/scripts` y `.githooks`
    antes de juntar lo pendiente, y lo dice en una línea que no frena; todo otro ignorado de esas carpetas sigue en rojo. `cambios.cjs`
    se copia byte a byte a `pc/lib/`.
  - **El `/inicio` sin huella** dice que el arranque puede ser otro y da el `resolver … hook-arranque nueva`.
  - **El chequeo de la flota mide el tope de las skills sin el `\r`** de un checkout con `core.autocrlf` (como lo guarda git): antes un
    `/inicio` dentro del tope daba ROTA por cómo se clonó.
  - **La línea 7 (casos) copia los hooks del proyecto como los guarda git**, sin ese `\r`: antes las fichas de fábrica de un checkout
    de Windows daban ROTA en toda puesta al día desde la `rc.3` (lo encontró la flota de prueba; al analytics real le pasaba).
- **Automático o pide revisión**: automático. Sin `carpeta-docs:` todo queda como en la `rc.3`. Si tus papeles no están en `docs/`, se
  agrega la clave con un aprobado (es barrera).
- **Qué chequear después**: `estructura.cjs todo` sin el rojo de los `.pyc` (en Hermes, `.claude/hooks/__pycache__/`); el arranque
  termina con la huella `inyectado: N de 9.700`.

## 3.0.0-rc.3

La tanda de taller de la segunda revisión integral R1b (2026-11-04, `docs/kit-v3/SPEC-paquete-8r2.md`): lo que se vio corriendo el día de
Guido sobre un clon de Hermes. Las cuatro de diseño (D1-D4) no se decidieron: la adopción deja la mecánica para que se elijan en la
pantalla y cada camino ande en un paso.

- **Qué piezas cambiaron**:
  - **Los comandos de la ficha y del gate corren en Git Bash en Windows** (la consola del director): el gate de `encargo`, `paquete`,
    `integrar`, el `comando-setup` de `worktree`, `chequear` y el `sello` (`proceso.cjs shellDeComandos`; nunca el `bash` de WSL). Un
    `cmd /c …` en Git Bash (es `cmd //c`), o un `cmd //c` sin Git Bash, sale `no-corrio`: antes daba verde sin correr nada. `chequear`
    acepta `&&`. `proceso.cjs` se copia byte a byte a `pc/lib/` y a `arquitecto/scripts/lib/`.
  - **Adoptar**: `--mirar --principal <tu carpeta>` (de ahí sale `vars.proyecto`); la línea `comandos:`; en Python, el `.venv` de cada
    worktree (`py -3 -m venv .venv && .venv/Scripts/python.exe -m pip install -r requirements.txt`; nunca el pip global); `entornos:
    ninguno declarado` y `herramientas:`; un `.worktreeinclude` para la config local ignorada; los bloques `D1`-`D4`. `--aplicar`:
    `--director kit` (D1: los del kit reemplazan el director, `/estado`, `/inicio` y `/cierre` propios), `--permisos recomendada` (D2) y
    `--arranque kit` (D3), estas dos en un tercer commit; `--principal` ya no prende los githooks: lo hace el paso nuevo **`adoptar
    <clon> --traer <carpeta>`**, después del push (trae lo adoptado con `merge --ff-only` y recién ahí prende `core.hooksPath`).
    `.venv/` en el `gitignore.snippet`.
  - **La mezcla**: un choque sin `por:` también es `la mezcla chocó (sin porqué: …)`, con el informe entero y la pregunta charlada. La
    salida `propia` de `resolver` pasa a llamarse **`quedarse`** (`propia` sigue andando). El informe de una adopción dice "adopción: el
    molde v2 contra el del kit <v>".
  - **La flota de la PC** (`registro`, la flota `todo`, el auto-mode de `preparar-pc`, `cambios-flota`): hasta dos niveles, una fila por
    repo (el checkout principal, nunca un worktree), rutas absolutas (`Hermes/Hermes.exe`).
  - **`/estado`** de noche lo dice arriba de TE ESPERA. Los textos: `flota.md` (la pantalla de adopción con D1-D4), `modo-a.md` y `modo-b.md`
    (`--traer`; `/smoke` solo si está), el Equipador y sus manuales, la guía (la receta del módulo con director) y el PLAYBOOK.
- **Automático o pide revisión**: automático, salvo una ficha con `comando-test` o `comando-setup` escritos para `cmd.exe` (barras `\`,
  un `.bat` sin `./`, `cmd /c`): ahora salen rojo o `no-corrio` (nunca verde). Si tu proyecto lo tiene, pide revisión.
- **Qué chequear después**: `chequear` verde en la flota; en Windows, que `comando-test` corra en Git Bash (`worktree crear` y un gate).

## 3.0.0-rc.2

La tanda de correcciones de la revisión integral R1 (2026-11-03, `docs/kit-v3/SPEC-paquete-8r.md`): que las piezas interactúen bien entre
sí, para que el primer módulo con director de un proyecto adoptado arranque.

- **Qué piezas cambiaron**:
  - **Adoptar**: un repo con código (`estandar`) trae `director-obrero` y `estado` en `sí` (si ya tiene los suyos distintos, `propia`);
    `--mirar` dice si al `CLAUDE.md` le falta "El tamaño del pedido" y si tiene su director/obrero propio, y `--aplicar … --claude-md`
    suma la sección; la receta de `migrar-cambios`; el aviso si la PC está atrás del último tag; `npm ci` (o el install congelado) con
    el lock commiteado; el aviso si la ficha existió antes en la historia.
  - **La flota** saltea solo las ramas `modulo/*` **sin mezclar** en la rama por defecto (antes, cualquiera: un proyecto con un módulo
    terminado quedaba salteado para siempre).
  - **La mezcla de una pieza adaptada que choca nunca se resuelve sola**: queda en `.claude/fusiones/<pieza>.md` con qué pieza es, por qué
    la habías adaptado (su `por:`), qué trae la versión nueva, `## Dónde chocan` y, si hubo `claude`, una propuesta armada que no se
    aplicó; el motivo empieza con `la mezcla chocó` y el `/inicio` pregunta siempre, con una recomendada con criterio.
  - **El sello** acepta la **tarea 0** (`- **Tarea 0**: montar la base de prueba` en `## Entorno de prueba`) con solo una base real, en un
    módulo con director y con la ficha en `3.0.0-rc.2` o más; `worktree crear`, `encargo presentar` y `autorizado` frenan todo encargo que
    no sea el `00` hasta que la ficha de `modulo/<x>` tenga el entorno de prueba.
  - **`worktree.cjs`**: la apertura termina en `primer mensaje: /director` o `/obrero <x>--<ID>`; `cerrar` borra la rama de origin si está
    mezclada en `origin/<madre>`; `integrar` termina en `después: /cierre …`; `integrados` nuevo; lo que el `comando-setup` deja sin
    trackear va a `info/exclude`. `chequear` y `skills.test` leen el mismo tope por skill (el `/inicio`, 8.600 B).
  - **Los textos**: el `/inicio` (paso 0: con `.kit-rol` y la rama de un módulo, deriva a `/director` u `/obrero`; `integrados` después
    del pull; la mezcla que choca), el `/director` (la tarea 0, la línea de fondo con Bash, `integrar` y `cerrar`), el `/cierre` (quién
    corre `cambios aprobar`: la sesión cuando el dueño lo pide, su clic es la firma; anotar con `cambios nuevo`), el `/obrero` y el
    `CLAUDE.md` (el obrero en `auto`), la plantilla del encargo (el formato de `## GATE`).
- **Automático o pide revisión**: pide revisión: el `/inicio`, el `/director`, el `/cierre`, el `/obrero` y el `CLAUDE.md` del molde
  cambiaron, y son piezas que se adaptan. Con `por:` y una mezcla limpia, se fusionan solas; si chocan, te pregunta el `/inicio`.
  `director-obrero` y `estado` no se prenden solos en un proyecto ya adoptado: `piezas.director-obrero: sí` y `piezas.estado: sí` en la
  ficha, y la flota los trae.
- **Qué chequear después**: `chequear` con las nueve líneas en ✅ (el `/inicio` en 8.600 B o menos); abrir el `/inicio` y ver que confirme en
  tres líneas; `node .claude/scripts/worktree.cjs integrados` sale 0.

## 3.0.0-rc.1

La beta de la v3 (2026-11-03): el molde v3 entero, más el paquete 8b. La `3.0.0` final saldrá con su sección propia; mientras tanto,
cada arreglo sale como `rc.N` y llega por `flota`.

- **Qué piezas cambiaron**: el molde v3 entero. La ficha `.claude/kit.md` (versión, nivel, `vars`, frenos); los hooks, ahora en node, con
  candado y barreras; `/inicio` y `/cierre` v3; director/obrero (worktrees por módulo); `/estado`; la mesa; los githooks del clon.
  Se retiran `check-code` y `session-start.sh`, y las `deny` con `Write(...)` de los settings. Del lado de la PC: `actualizar.cjs`
  (`aplicar`, `chequear`, `flota`, `adoptar`) y `cargar-secreto`, que ahora calcula el `<proyecto>` desde el checkout principal.
  Lo nuevo del paquete 7: el estado `subio-al-kit` de los cambios y `kit/cubiertos.md` (aplicar cierra el ciclo); `portada.cjs armar`
  y la pieza `piezas.portada`; `cambios-flota.cjs` (la tabla del ciclo y las urgencias); `migrar-cambios.cjs` para un `CAMBIOS.md` único.
  Lo nuevo del paquete 8b: la versión entera con `-rc` (ficha, `VERSION`, tags, sello, `doctor`); el obrero de fondo en `auto` (con
  una línea de respaldo en `acceptEdits`); `resolver` y `desde:` en las piezas; el `/inicio` que no ejecuta lo que dejó otra sesión;
  `adoptar --mirar --nuevo` y `--aplicar --principal` (los githooks en la carpeta del dueño); el Modo A monta el molde v3 y el SPEC-0
  vive en `docs/modulos/v1/SPEC.md`; la línea "llaves" de `chequear` mira solo lo que el molde instancia.
- **Automático o pide revisión**: pide revisión, porque casi todo es pieza que los proyectos adaptan. Un repo v2 **sin ficha se adopta,
  no se actualiza**: `adoptar` (con Guido delante, la pantalla). Uno **con ficha** se pone al día con `flota`. Una pieza adaptada se
  fusiona sola solo si tiene `por:` en la ficha y la mezcla sale limpia; si no, queda en `.claude/fusiones/<pieza>.md` con lo que dice
  el kit, las dos versiones y cuatro salidas (mezclar · quedarse con la propia · tomar la nueva · congelar, que no va en una pieza de
  frenos), y el `/inicio` elige o le pregunta al dueño y lo escribe `actualizar.cjs resolver`. Una rama `kit/v<tag>` ROTA se rehace sin `--force`; un repo protegido deja la rama "te espera".
- **Qué chequear después**: `doctor` sin ✗; `chequear` con las nueve líneas en ✅; abrir el `/inicio` del proyecto y ver que confirme
  en tres líneas, sin avisos de fusión pendientes.

## 2.4.3

- **Qué piezas cambiaron**: el hook de arranque del molde (`templates/universales/hooks/session-start.sh`) ahora le pone tope al
  handoff (5.500 bytes) y, si se pasa, lo corta con el aviso "CORTADO"; muestra 30 líneas del TODO (antes 40), títulos de commit
  cortados a 100 y hasta 15 renglones de estado; al final imprime la huella `inyectado: N caracteres de 10000`. También cambian los
  `/inicio` y `/cierre` del molde (qué hacer ante "CORTADO", el tope) y la cabecera del handoff del molde.
- **Automático o pide revisión**: pide revisión. Toca el hook y las dos skills, que los proyectos suelen tener adaptados: no se pisan
  a ciegas.
- **Qué chequear después**: abrir un chat nuevo y ver que la última línea del arranque sea la huella; con un handoff de más de 5.500
  bytes, que aparezca "CORTADO".

## 2.4.2

Versión base de la v3: los repos de prueba nacen de este tag. Sin nota de migración (anterior a este archivo).
