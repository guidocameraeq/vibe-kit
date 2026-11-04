# SPEC delta: paquete 8r2 — la tanda de taller de la revisión integral R1b, y la beta `v3.0.0-rc.3` — vibe-kit
Los doce de taller (t1-t12) de `REVISION-INTEGRAL-rc2.md`. **D1-D4 son de Guido y no se deciden acá**: lo que hace esta tanda es dejar la
mecánica lista para que mañana él elija en la pantalla de adopción y el camino que elija ande **en un solo paso**. Única vuelta de
corrección (regla de Guido, 2026-11-03): nada de agrandar el alcance; lo que no entra, a Pendientes con su porqué.
- Estado: SELLADO sin Guido (D8r.2, después del red team)
- Fecha: 2026-11-04 · Misión: 5, director **D8r.2** (tracker, "Después de la rc.1"; la vara: ADR-030 y ADR-034; el presupuesto: ADR-029)
- Plano: [`SPEC-0-kit-v3.md`](SPEC-0-kit-v3.md); la fuente: [`REVISION-INTEGRAL-rc2.md`](REVISION-INTEGRAL-rc2.md) (sus `t<n>` y `D<n>`).
  El obrero de cierre de tramo y los experimentos no entran: pasan a la `rc.4` (D8c.1).
- Red team: **sí, una ronda** (toca el gate, `adoptar`, la mezcla y los permisos): 5 ALTOS (rt-1 a rt-5), 4 MEDIOS, 1 BAJO, todos
  integrados ("Lo que trajo el red team", que manda sobre lo de arriba donde lo corrige). Chequeo corto con un agente frío al cerrar,
  sobre un clon de Hermes y la flota (no una revisión integral: ADR-034, "no hay una tercera").

## Por qué (el dolor)

R1b corrió el día de Guido sobre un clon del Hermes real: adoptar anda, pero el módulo **con el director del kit** no sale solo (Hermes
ya tiene su director, `/inicio` y `/cierre`), lo adoptado no llega a la carpeta de Guido, los comandos de Python instalan en el Python
global, un gate `cmd //c …` da verde sin correr nada y la flota no ve a Hermes con la carpeta de proyectos `D:/`. Guido, la noche del
03-11: "no hay que hacer 800 revisiones integrales": una sola vuelta.

## Contexto (explorado el 2026-11-04, `Guido-PC-eQ`)

- `lib/adoptar.cjs`: `mirar` (~410) arma la propuesta (una ficha con un bloque de comentarios); `inferirVars` (~284) saca `proyecto` del
  nombre de la carpeta y en Python propone `pip install -r requirements.txt` / `pytest`; las piezas con un archivo distinto del molde
  van a `propia` (~478-495); `aplicarPropuesta` (~617) escribe en el clon y **no commitea** (imprime los dos commits); `--principal`
  solo prende `core.hooksPath` (`prenderGithooks`, ~805), antes de los commits y del push. `leerArgs` (~831) niega `--principal` con `--mirar`.
- Una pieza en `sí`/`molde` con su archivo distinto en el clon: el guardia de `aplicar` (`actualizar.cjs planear`) la deja `adaptada
  (desvío)` y no la escribe. El único camino que anduvo en R1b: `sí` + `--aplicar` + `resolver . director-obrero nueva --por …`.
- `molde/hooks/lib/proceso.cjs` `VIGIA` (~87): `spawn(cmd, { shell: true })` = `cmd.exe` en Windows; `cmd //c x` ahí abre un cmd
  interactivo con la entrada vacía y sale 0 (probado hoy: sale 0 sin correr nada). Lo mismo, `shell: true` a secas, en `worktree.cjs`
  (setup ~543, comando-test ~1019 con el `VIGIA`), `chequeo.cjs` (~623-643) y `arquitecto.cjs` (~185, el `sello`). Con `cmd.exe`,
  `.venv/Scripts/python.exe` no se encuentra (probado hoy).
- `fusion.cjs fusionar` (~527): `if (!porque) return espera('sin porqué …')` **antes** de mirar el choque. `SALIDAS` (~145) =
  `mezclar · propia · nueva · congelar`; `actualizar.cjs` (~1061) `propia` = quedarse con la tuya (sigue `adaptada`), y en la ficha
  `propia` = congelada.
- La flota de la PC mira **un nivel** (`preparar-pc.cjs` ~400, `arquitecto.cjs registro` ~465, `lib/flota.cjs todosLosRepos` ~160,
  `cambios-flota.cjs`); con `D:/` Hermes vive en `D:/Hermes/Hermes.exe` y sus worktrees `D:/Hermes-*` son carpetas hermanas.

## Pedido original, textual

> Hacés la tanda de taller de la segunda revisión integral (R1b), sin Guido […] Alcance: t1 a t12. D1 a D4 son de Guido y NO se deciden:
> lo que hacés es dejar la mecánica lista para que mañana él elija en la pantalla de adopción y el camino que elija ande en un solo paso.
> Regla de Guido: esta es la única vuelta de corrección; nada de agrandar el alcance. *(La sesión madre, 2026-11-04.)*

## AGREGA y MODIFICA

Cada uno con su criterio verificable (crit. `n` = `t<n>`). Las rutas: `adoptar` = `kit/skills/arquitecto-skills/scripts/lib/adoptar.cjs`.

### t1 · Un choque sin porqué también es choque
`fusionar`: el gate "sin porqué" va **después** de clasificar el choque. Con conflicto de `merge-file`, un `choque` o una mezcla limpia que
no pasa `validar`, y sin `por:`: el motivo es `la mezcla chocó (sin porqué: la pieza no tiene \`por:\` en la ficha; …)`, con el informe
completo (`## Dónde chocan`) y, si hay `claude`, su propuesta (como con porqué; el `porque` del lanzador es "sin porqué en la ficha").
Sin choque y sin porqué, como hoy (`sin porqué …`).
- **crit. 1**: `fusion.test` — el caso `piezas.conflicto` con `valorFicha: 'adaptada'` da un motivo que empieza con `la mezcla chocó` y
  contiene `sin porqué`, el informe trae `## Dónde chocan`; una limpia sin porqué sigue `sin porqué (…)`. Se corrige la prueba de ~524.

### t2 · Lo adoptado llega a la carpeta de Guido (`--traer`)
El pull no puede ir en `--aplicar`: ahí todavía no hay commits ni push. Modo nuevo, el último paso de la adopción, después del push:
`actualizar.cjs adoptar <clon> --traer <carpeta de Guido>` (sin `--kit`). Valida lo mismo que `prenderGithooks` (raíz, sin `.kit-rol`,
mismo repo). Si la carpeta está limpia (`git status --porcelain` sin nada fuera de `.kit-rol`) y parada en la rama por defecto:
`git -C <carpeta> pull --ff-only` (sin origin: `pull --ff-only <clon> HEAD`, como el Modo A), y verifica que el `HEAD` del clon quedó
adentro (`merge-base --is-ancestor`); **después** prende los githooks (ya con `.githooks/` en el disco). Si no está limpia, en otra rama,
el ff no se puede o el `HEAD` del clon no llegó (no se pusheó): no toca nada y una línea con qué correr. `--aplicar --principal` deja de
prender los githooks: solo valida la carpeta y termina con la línea del `--traer`. Sale 0 aunque no pueda (las líneas dicen qué falta), 1
si la carpeta no es el mismo repo.
- **crit. 2**: `adoptar.test` — un clon con origin `bare` y la carpeta principal clonada del mismo: después de commitear y pushear en el
  clon, `--traer` deja la carpeta en el `HEAD` del clon y `core.hooksPath=.githooks`; con un archivo sin commitear, o en otra rama, no
  toca nada y la línea dice qué correr; sin push, dice "el HEAD del clon no está en origin"; sin origin, trae del clon. `--aplicar
  --principal` ya no cambia `core.hooksPath`.

### t3 · D1: traer el director, `/inicio` y `/cierre` del kit en un paso
- `--mirar`: cuando `director-obrero`, `estado`, `inicio` o `cierre` salen `propia` por un archivo distinto, un bloque **`D1`** con sus dos
  opciones, la recomendada del informe primero: **(A)** los del kit — "en la propuesta, `sí` en director-obrero y estado y `molde` en
  inicio y cierre"; **(B)** los tuyos — "dejá `propia`: el módulo arranca solo, sin el director del kit". Los renglones de lo distinto,
  con su ruta.
- `--aplicar`: una pieza que la propuesta trae en `sí` o `molde` **escrito a mano** sobre archivos que ya están y son distintos del molde
  (las que `mirar` habría puesto en `propia`) se escribe con la del kit, dentro del mismo OK: la ficha la deja en `molde` con su hash, y
  la línea dice `reemplacé los tuyos (D1: A) — lo tuyo queda en la historia: git show <antes>:<ruta>`. El `por:` no va en la ficha (una
  `molde` no lleva `por:`): va en el renglón del CHANGELOG de la adopción (`… — D1: A, los del kit reemplazan los propios`).
- `modo-b.md` B4 (la línea "para tenerlo"): con una pieza en `propia`, la salida es `actualizar.cjs resolver . director-obrero nueva --por
  "<por qué>"` (y la línea dice eso), no "poné al día": la flota saltea una ficha al día. `flota.md` escribe el camino (D1 en la pantalla).
- **crit. 3**: `adoptar.test` — un repo con `.claude/skills/director/SKILL.md`, `inicio` y `cierre` propios distintos: `--mirar` trae el
  bloque `D1` con (A) y (B); la propuesta editada a `sí`/`molde` → `--aplicar` escribe los del kit, la ficha queda `molde`, `barreras
  --rango` verde; la propuesta sin editar → no se tocan y quedan `propia`. `resolver . director-obrero nueva` sobre una pieza `propia`
  anda (o la línea de `modo-b.md` dice lo que sí anda: lo prueba el encargo).

### t4 · Las bases (`entornos:`) en la pantalla
`--mirar`, sin `entornos:` en la propuesta: `entornos: ninguno declarado — preguntale a Guido cada base y su clase (real · prueba · dummy);
sin declararla, la base de prueba cuenta como real` y el ejemplo de la gramática (`kit.ejemplo.md`). Y `herramientas:`: `herramientas:
ninguna — el ejemplo de kit.ejemplo.md ("db ping") no es un comando de este proyecto: si se copia, entorno da rojo`. `flota.md`: un paso
de la pantalla. Si la sesión escribe `entornos:` en la propuesta, `--aplicar` ya la conserva (verificado en R1b).
- **crit. 4**: `adoptar.test` — la línea `entornos: ninguno declarado` sale en un repo sin entornos; una propuesta con `entornos:` (un
  `real` y un `prueba`) aplicada deja los dos en la ficha.

### t5 · Python: el `venv`, nunca el pip global
`inferirVars` en un repo Python (`requirements.txt` o `pyproject.toml`): `comando-setup` = `<py> -m venv .venv && <venv-py> -m pip install
-r requirements.txt` (con `pyproject.toml` sin requirements: `-m pip install -e .`) y `comando-test` = `<venv-py> -m pytest` si nombra
pytest, con `<venv-py>` = `.venv/Scripts/python.exe` en win32 y `.venv/bin/python` en el resto (barras `/`: corre en la consola de t6),
`<py>` = `py -3` en win32 si el lanzador `py` está, si no `python`. El worktree no hereda el venv de la carpeta principal (está ignorado):
cada worktree crea el suyo. `.venv/` va al `gitignore.snippet` si no está. `--mirar` imprime los dos comandos en una línea propia
(`comandos: setup … · test …`) para la pantalla.
- **crit. 5**: `adoptar.test` — un repo con `requirements.txt` que nombra pytest, con la plataforma inyectada: win32 → los comandos de
  arriba con `.venv/Scripts/python.exe`; linux → `.venv/bin/python`; nunca `pip install` a secas ni `pytest` a secas. La línea `comandos:`
  sale.

### t6 · El gate corre en la consola del director
`proceso.cjs` suma `shellDeComandos()`: en win32, el `bash.exe` de Git (`CLAUDE_CODE_GIT_BASH_PATH` si está; si no, del `git --exec-path`
→ `<raíz de Git>/bin/bash.exe`; **nunca** el `bash` del PATH, que puede ser el de WSL); en el resto, `true` (la `/bin/sh` de siempre). Lo
usan **todos** los que corren un comando de la ficha o del gate: el `VIGIA` (gate de `encargo`, `paquete`, `integrar`), el setup de
`worktree.cjs`, `chequeo.cjs` y el `sello`. Sin Git Bash en win32: `cmd.exe` como hoy, pero un comando que empieza con `cmd //` o
`cmd.exe //` sale `no-corrio` ("`cmd //c` es de Git Bash: en cmd.exe no corre nada y saldría verde"). `proceso.cjs` se copia byte a byte
a `pc/lib/` (la prueba de `lib.test` lo cubre sola) y a `arquitecto/scripts/lib/` (`copias.test` suma la línea).
- **crit. 6**: `proceso.test` — en win32 con Git, `correrConPlazo('cmd //c exit 3')` sale `rojo` (corrió de verdad) y `correrConPlazo('exit
  0')` verde; con la shell inyectada en `cmd.exe`, `cmd //c …` sale `no-corrio`; `shellDeComandos` con un `PATH` donde `bash` es otro no lo
  elige. `copias.test` y `lib.test` verdes.

### t7 · La flota: una fila por repo, dos niveles
Un único recorrido (en `pc/lib`? no: en cada script, con la misma regla): las carpetas de `--proyectos` hasta **dos niveles**; un repo es
un checkout con `.git` (carpeta o archivo); se agrupan por `git rev-parse --git-common-dir` (y si dos checkouts distintos tienen el mismo
origin, por origin) y queda **el checkout principal** (el que tiene `.git` carpeta; nunca un worktree, que tiene `.git` archivo); entre dos
clones del mismo origin, el de la carpeta más corta. No se baja a un repo (un repo adentro de otro no es de la flota). Lo usan
`preparar-pc.cjs` (auto-mode), `arquitecto.cjs registro`, `lib/flota.cjs todosLosRepos` y `cambios-flota.cjs`.
- **crit. 7**: en cada una de las cuatro pruebas, una carpeta de proyectos con `Hermes/Hermes.exe` (con ficha), `Hermes-x` (un worktree
  suyo) y `Otro` (un repo de un nivel): sale una fila para Hermes (la de `Hermes/Hermes.exe`) y una para `Otro`; ninguna para `Hermes-x`.

### t8 · El nombre del proyecto sale de la carpeta de Guido
`--mirar` acepta `--principal <carpeta>` (solo lectura: de ahí sale `vars.proyecto`, "el nombre de tu carpeta"); sin él, como hoy y la
nota lo dice ("el nombre del clon: si no es el de tu carpeta, corré con --principal"). `flota.md` lo pide en el paso 1. El paso 5 de
"Mañana con Guido" (`cargar-secreto`) usa ese nombre.
- **crit. 8**: `adoptar.test` — un clon llamado `clon-x` con `--principal …/Hermes.exe` → `proyecto: Hermes.exe`.

### t9 · D2 y D3 en la pantalla, y cada camino en un paso
- `--mirar` lista: (a) **las reglas del `settings.json` que se van** con la mezcla (las iguales al molde v2), una por renglón; (b) los
  **`ask` que frenan un paso del director** (`git merge`, `git push`, `git worktree`, `git branch -d`); (c) **un SessionStart propio**
  (hook que no es del molde); (d) **el handoff** si pasa el tope del hook (5.000 B), con su tamaño. Con (a) o (b), el bloque **`D2`**; con
  (c) o (d), el **`D3`**, cada uno con la recomendada del informe primero y cómo se elige.
- `--aplicar` suma dos opciones, una por decisión: `--permisos recomendada` (D2: las `allow` que la mezcla iba a sacar se quedan y los
  `ask` de (b) se van) y `--arranque kit` (D3: el SessionStart propio sale del `settings.json`; su archivo queda). Sin ellas, como hoy.
  Las dos van en el commit de las piezas; si eso pone rojo `barreras`, la línea lo dice.
- **crit. 9**: `adoptar.test` — un settings con una `allow Bash(git add:*)` del v2, una `ask Bash(git merge:*)` y un SessionStart propio,
  y un handoff de 6 KB: `--mirar` las lista con `D2` y `D3`; `--aplicar --permisos recomendada --arranque kit` deja la `allow`, saca la
  `ask` y el SessionStart propio; sin las opciones, el settings sale como hoy.

### t10 · `quedarse`, y `propia` de alias
La salida de `resolver` y del informe pasa a llamarse **`quedarse`** (quedarse con la tuya: la pieza sigue `adaptada`); `propia` sigue
andando como alias (mismo efecto). El `USO`, el informe (`## Las salidas`), el `/inicio`, `flota.md` y
`DECISIONES-SIN-GUIDO-en-criollo.md` dicen `quedarse`; `propia` queda solo para la ficha (congelar).
- **crit. 10**: `resolver . x quedarse` y `resolver . x propia` dejan la misma ficha; el informe nombra `quedarse`; `grep` de
  `mezclar|propia|nueva|congelar` en el kit da cero.

### t11 · La guía, el PLAYBOOK y las referencias
- `GUIA-DE-USO.md`: receta "Tengo un módulo con director andando", un puntero a `ROLES.md` §3, §4 y §9.
- `PLAYBOOK-MAESTRO.md` (evidencia: R1b, 2026-11-04): en "Proyecto existente", §1.3 y "El atajo", una línea "en el kit v3 esto lo pone el
  molde: *adoptá X* (`manuales/MOLDE.md`)"; el atajo, marcado v2.
- `MOLDE.md` (la mesa es §8), `COMO-USAR-EL-ARQUITECTO.md` (§5), `HOJA-DE-MANO-relevamiento.md` (sin "v2.4"); `PLAN-construccion.md`
  "rc.1" → "la última rc"; `director/SKILL.md`: si el encargo `00` toca `datos-de-prueba:`, va por `cambios`.
- **crit. 11**: los `grep` de cada referencia dan la sección nueva; `skills.test` verde.

### t12 · Menores (si entran)
(a) `--mirar` con un archivo de config ignorado en la raíz (`*.ini`, `*.env.example` no; `config*.ini`, `*.local.*`) que el código lee:
propone un `.worktreeinclude` con esas rutas (sin leerlas). (b) El informe de fusión de la adopción: sin "rc.2 → rc.2" ni "el kit no dejó
nota" (en una adopción, "adopción: el molde v2 contra el del kit <v>"). (c) `/estado` con `.kit-noche`: "es de noche: el director trabaja
solo" arriba de TE ESPERA. (d) `modo-b.md` B6: `/smoke` solo si el proyecto lo tiene (`piezas.smoke`); si no, "probalo a mano".
- **crit. 12**: una prueba por cada uno que entre; lo que no, a Pendientes.

### Lo que trajo el red team (manda sobre lo de arriba)

- **rt-1 (ALTO, t5×G)**: `chequeo.cjs` `RE_TUBERIA` niega todo `&`: el setup nuevo de Python saldría NO VERIFICADO. Acepta `&&` y sigue
  negando `|`, `;`, `<`, `>`, un `&` solo, backtick y `$(`. crit. 6 suma: `chequear` con un setup `a && b` lo corre.
- **rt-2 (ALTO, t6)**: en Git Bash, `cmd /c …` (una barra) vuelve a dar un cmd interactivo que sale 0. `proceso.cjs` exporta
  `comandoQueNoCorre(cmd, shell)` y lo usan los cuatro lugares: con Git Bash, `cmd /…` o `cmd.exe /…` con una barra → `no-corrio` ("en Git
  Bash es `cmd //c`"); sin Git Bash, `cmd //…` → `no-corrio`. crit. 6 suma: con Git Bash, `cmd /c exit 0` nunca sale verde.
- **rt-3 (ALTO, t2)**: `modo-a.md` (pasos 5, 6 y 11), `arquitecto-skills/SKILL.md` y la nota de migración dicen que `--aplicar
  --principal` prende los githooks: pasan a `adoptar "<clon>" --traer "<carpeta>"` (entran al crit. 13).
- **rt-4 (ALTO, t3)**: `--aplicar` no distingue un `sí` escrito a mano de uno de `mirar --nuevo`. **El OK de D1 es una opción, como D2 y
  D3: `--aplicar … --director kit`** (D1: A). Solo con ella, y solo en `director-obrero`, `estado`, `inicio` y `cierre`, lo distinto se
  reemplaza con lo del kit (la ficha, `molde`/`sí` con su hash). Sin ella, todo como hoy (`propia` o desvío). El bloque `D1` de `--mirar`
  dice esa opción. crit. 3 suma dos en contra: un `--nuevo` con director propio sin la opción no se toca; un `githooks` propio puesto en
  `molde` tampoco.
- **rt-5 (ALTO, t7)**: `rutaDeRepo('Hermes/Hermes.exe')` resuelve contra el cwd y la fila sale "sin tocar"; y `--git-common-dir` en el
  principal es `.git` relativo. Los cuatro recorridos devuelven rutas absolutas; se agrupa por `git rev-parse --path-format=absolute
  --git-common-dir`, comparable (real, minúsculas en win32). crit. 7 pide que la fila de Hermes **no** diga "sin tocar".
- **rt-6 (MEDIO, t7)**: try/catch en cada carpeta del segundo nivel (se saltea), y no se baja a `$*` ni a `System Volume Information`; un
  grupo con solo worktrees da una línea ("el principal está fuera de --proyectos").
- **rt-7 (MEDIO, t2)**: `--traer` primero `fetch` y `merge-base --is-ancestor <HEAD del clon> <origin>/<rama del clon>` (sin origin: el
  clon); si no está, la línea "no llegó" y nada más. La carpeta tiene que estar en la rama del clon y limpia; recién ahí `merge
  --ff-only`. Si el merge falla y deja la carpeta sucia: la línea con `git -C "<carpeta>" reset --hard <HEAD de antes>`, sin githooks y
  salida 1.
- **rt-8 (MEDIO, t5×sello)**: con el venv solo en los worktrees, el `sello` en la carpeta de Guido da rojo. `--traer` termina con "en tu
  carpeta, una vez: <comando-setup>" si hay setup y falta `.venv`; y el rojo del `sello` (G) suma "¿corriste el comando-setup en esta
  carpeta? (<setup>)" cuando hay setup.
- **rt-9 (MEDIO, t9)**: `--permisos`/`--arranque` sacan reglas propias: rompe la exención de `barreras` del commit de las piezas. Van en
  un **tercer commit** propio (`kit: adopción <v> (permisos: D2/D3)`), y la línea `después:` da el camino (`cambios nuevo` + `cambios
  aprobar`) si ese commit sale rojo. crit. 9 verifica la línea.
- **rt-10 (BAJO, t7)**: dos checkouts del mismo origin (normalizado con `normalizarOrigen`): el de HEAD más nuevo, y una línea que nombra
  los dos.

## NO SE TOCA

- D1-D4: no se decide nada; la propuesta por defecto sigue como hoy (lo propio, `propia`; la mezcla del settings, como hoy).
- La gramática de la ficha (`ficha.cjs` y sus copias). Las copias byte a byte siguen byte a byte.
- Los porteros (`git-seguro`, `niega-aprobar`, `sensible`, `secretos`) y el candado: no cambian lo que frenan.
- El obrero de cierre de tramo y los experimentos (`rc.4`). Las actas de `tips/` y `_fuente/`.

## Entorno de prueba

Temporales y repos de prueba (`pruebas/rehacer.sh`), canónico `bare` con tag anotado, `--claude no`. El clon de Hermes, **solo** en el
scratchpad (`git clone D:\Hermes\Hermes.exe`, con un `bare` falso de remoto); nunca se toca `D:\Hermes` ni `~/.claude/`.

## Criterios de aceptación

Los crit. 1 a 12, y: **crit. 13** (ADR-034) cada texto que nombra lo que cambió dice lo mismo (`flota.md`, `modo-b.md`, `EQUIPADOR.md`, el
`USO`, el `/inicio`); **crit. 14** la suite entera verde y la flota con canónico `bare` (`v3.0.0-rc.3`) sale 0; **crit. 15** el chequeo
frío sobre el clon de Hermes: `--mirar` (con `--principal`) → `--aplicar` con la A de D1 en un paso → commits, `barreras`, push al `bare`
falso → `--traer` → Modo B con director: `worktree crear` y un gate.

## Decisiones (la vara)

- **D8r2-1 · El pull va en un paso propio, `--traer`, no al final de `--aplicar`**: `--aplicar` no commitea ni pushea; un pull ahí no
  trae nada. Y los githooks se prenden **después** del pull (con `.githooks/` en el disco), en el mismo paso. `[workflow · mejor código ·
  coherencia]`
- **D8r2-2 · D1-D3 se eligen en la propuesta (D1) y con dos opciones de `--aplicar` (D2, D3)**; D4 ya tiene camino (`sensible:` en la
  propuesta, barreras rojo y `cambios aprobar`): `--mirar` lo dice con los comandos. Sin opciones nada cambia: el default es el de hoy.
  `[workflow · acordarse de menos]`
- **D8r2-3 · El gate, el setup, el test del chequeo y el del sello corren en Git Bash en Windows** (la consola del director), no solo el
  gate: un comando de la ficha tiene que dar lo mismo en los cuatro. `cmd //…` sin Git Bash se niega. `[mejor código · coherencia]`
- **D8r2-4 · El venv vive en `.venv` de cada worktree**, creado por el setup: el de la carpeta principal está ignorado y no viaja; uno
  compartido entre worktrees mezcla dependencias de ramas distintas. `[mejor código]`
- **D8r2-5 · La flota agrupa por `git-common-dir` y origin, dos niveles**: un nivel más ya cubre `D:/Hermes/Hermes.exe`; más hondo es
  caro y nadie lo pidió. `[workflow]`
- **D8r2-6 · `quedarse` con `propia` de alias**: nadie tiene que reaprender; lo nuevo dice lo mismo en todos lados. `[consistencia]`
- **D8r2-7 · Esta tanda es la `rc.3`; D8c.1 pasa a la `rc.4`.** `[workflow]`

## Lo que esto no cierra

- Un comando de una ficha vieja escrito para `cmd.exe` (barras `\`, `.bat` sin `./`) ahora corre en Git Bash: sale rojo o `no-corrio`,
  nunca verde. Se ve en la flota.
- `pip install` de Hermes en Python 3.14 (las ruedas de sus dependencias): no se corre esta noche.
- Una mezcla real que choca armada por `claude -p`: igual que R1b, no se corre.

## Los encargos (el director reparte, lee cada diff y corre las pruebas de cada uno)

Presupuesto (ADR-029): ~8 → RT, **cinco de trabajo**, el chequeo frío y su arreglo si hace falta. Cada uno en `scratchpad/<x>/wt`. Los
textos (`flota.md`, `modo-b.md`, `EQUIPADOR.md`, guía, PLAYBOOK, manuales) los escribe el director al final, contra el código mergeado.

| # | Encargo | Puede tocar | Prueba |
|---|---|---|---|
| RT | Red team, una ronda | — | — |
| F | t1, t10, t12b | `lib/fusion.cjs`, `actualizar.cjs` (resolver, USO), `inicio/SKILL.md`, sus pruebas | crit. 1, 10 |
| G | t6, t12c | `proceso.cjs` (y sus copias), `worktree.cjs` (setup, test), `chequeo.cjs`, `arquitecto.cjs` (sello), `estado.cjs`, sus pruebas | crit. 6 |
| L | t7 | `preparar-pc.cjs`, `arquitecto.cjs registro`, `lib/flota.cjs`, `cambios-flota.cjs`, sus pruebas | crit. 7 |
| A1 | t3, t9 | `adoptar.cjs` (mirar: D1-D3; aplicar: el reemplazo, `--permisos`, `--arranque`), `adoptar.test.cjs` | crit. 3, 9 |
| A2 | t2, t4, t5, t8, t12a | `adoptar.cjs` (`--traer`, `inferirVars`, entornos, `--principal` en mirar, `.worktreeinclude`), `gitignore.snippet`, `adoptar.test.cjs` | crit. 2, 4, 5, 8 |
| CF | Chequeo frío (crit. 15) | — | — |

**Orden**: RT → F ∥ G ∥ L ∥ A1 ∥ A2 (A1 y A2 tocan el mismo archivo en funciones distintas: el director mergea A1 y después A2) → textos
→ CF → suite → la flota.

## Ejecución

Un director Opus (D8r.2), este delta, una ronda de red team y un chequeo frío; el cómo, en [`PLAN-construccion.md`](PLAN-construccion.md).
