# SPEC delta: paquete 8r4 — la `rc.5`: las correcciones del uso real — vibe-kit
Lo que dolió en la primera semana de uso real de la beta (Hermes Desktop con `cashflow`, el analytics de Arti, el bot que espera) y que
Guido quiere ya. El corazón: **el obrero (y el director) de una sola ventana** y **la flota con obra en curso como opción**. Lo que era
la `rc.5` (D8c.1: el obrero de cierre de tramo y los experimentos de método) pasa a la `rc.6`.
- Estado: READY (D8r.4, 2026-11-04, después de una ronda de red team)
- Fecha: 2026-11-04 · Misión: 5, director **D8r.4** (lo lanzó la sesión madre de la recta final; la vara: ADR-030 y ADR-034; el presupuesto: ADR-029)
- Plano: [`SPEC-0-kit-v3.md`](SPEC-0-kit-v3.md); el modelo: [`SPEC-paquete-8r3.md`](SPEC-paquete-8r3.md). La fuente: tracker, Pendientes, "De la
  prueba real, lo que cuenta Guido" (1, 2, 3, 4, 6, 7), "De la adopción real de Hermes" (1, 3, 4, 5, 6, 7, 8, 11 c) y lo que la `rc.4`
  deje de "De D8r.2".
- Red team: **sí, una ronda** (obligatorio: toca frenos — el `settings.json` del molde, `datos-reales`, la flota que actualiza `main`
  con obra en curso y un comando que mergea `main` en la rama de un módulo). Chequeo frío sobre clones (nunca las carpetas reales).
- **Base**: el tag `v3.0.0-rc.4` (D8r.3). No se codea ni se mergea antes; los worktrees salen de ese tag.

## Por qué (el dolor)

- **Guido trabaja en una sola ventana** (la extensión de Claude Code en VS Code, una ventana por proyecto): "New Session" nace en el
  workspace, o sea en `main`. `worktree crear`/`abrir` le imprimen `code "<worktree>"`, que abre **otra** ventana. Un `/obrero` tipeado
  en la ventana de siempre corre en `main`, no en su rama: `presentar` para con "rama equivocada" y no hay camino. Decidido con Guido el
  2026-11-04 (tracker, "lo que cuenta Guido" 3): *"esa forma de antes es muchísimo más práctica […] una vez ahí, ya el director logra
  gestionar a los obreros. Lo mismo pasará eventualmente con los gates"*.
- **La flota saltea el repo con obra en curso** (`lib/flota.cjs:305`): una `modulo/*` viva → `salteado`, sin tocar `main`. Hermes, el
  proyecto que más prueba la beta, es el que menos arreglos recibe. Decidido con Guido (ítem 6): *"quiero poder actualizar main y las
  ramas, que sea una opción. Que me recomiende no hacerlo, pero […] si yo sé que estoy en un momento en el que puedo, quiero poder"*.
- **El disco se llena de copias**: en `D:\` hay 9 worktrees de Hermes **registrados** (`git worktree list` de `D:\Hermes\Hermes.exe`:
  `D:/Hermes-5b-cc`, `D:/Hermes-cc-ui`, … — medido acá en solo lectura) fuera de `.claude/worktrees/`, y 66 carpetas `gate-*` en
  `D:\Hermes\` (el padre del repo; las crea el proceso propio de Hermes de antes de la adopción: `tests/test_candados_por_rol.py:148`
  lee `<padre del principal>/gate-candados/`). Nadie lo avisa (ítem 1).
- **`gitleaks detect` da 2, no 0** (ítem 2): dos claves de mentira de `doctor.test.cjs` (`f670568`): "push solo con 0" dejó de medir.
- **`modo-b.md` B0 se lee como si prohibiera retomar el diseño en `modulo/<x>`**, `/director` paso 2 manda ahí a `/arquitecto`, y B5
  pide el worktree después del READY cuando Guido quiere que el diseño corra bajo el director (ítem 4, `cashflow`).
- **`NORTE.md` queda con `[completar]`** después de la adopción y nadie lo dice (ítem 7, Hermes).
- **De la adopción de Hermes**: el renglón del CHANGELOG rompe un Keep a Changelog que lee `publicar.bat` (1); `NUCLEO.md` deja editar
  `CLAUDE.md`, skills y agentes como clase 1/2 y Guido eligió para Hermes "solo con mi clic" (3); los agentes propios con el nombre de
  los del kit solo se nombran (4); `datos-reales` pregunta también contra el ensayo (5); el Equipador no pide cruzar los patrones antes de
  `--sacar-viejo` (6); `--mirar` propone el `.worktreeinclude` pero `--aplicar` no lo escribe (7); las lecciones de Hermes (8); y en el
  analytics, un `ask Bash(ssh:*)` propio preguntaba en cada ssh aunque Guido dijera "no volver a preguntar" (11 c: *"me vuelve loco"*).

## Contexto (explorado el 2026-11-04, `Guido-PC-eQ`, sobre `main` @ `5465a56`)

- **`EnterWorktree` con `path`** (la herramienta de Claude Code): entra a un worktree que ya existe si la ruta está en `git worktree list`
  del repo; `ExitWorktree` nunca borra uno entrado así; cambiar a otro deja el anterior sin escritura. La descripción de la herramienta
  pide que la use solo si lo dice el usuario o "las instrucciones del proyecto": la skill tiene que nombrar `EnterWorktree` y "worktree".
  La madre lo probó en Hermes: `git branch` = `modulo/cashflow`, `.kit-rol` = director.
- **Los hooks ya leen bien el rol** después de entrar (`contexto.cjs:6,30`: la raíz por `rev-parse` desde el cwd de la entrada), pero los
  **scripts de hook y los permisos son los del arranque** (`${CLAUDE_PROJECT_DIR}` = `main`). El `settings.json` del molde trae `Read(./**/.env)`
  y `Read(./**/.env.*)` en `deny`; `worktree.cjs reglasDeny` (~422) suma al `settings.local.json` del worktree `Read` y `Edit` absolutos
  del `.env` del principal, que con EnterWorktree **no cargan**: falta el `Edit`. Y las `allow` de AUTORIZADO (también en ese
  `settings.local.json`) tampoco cargan: más ventanas, no menos frenos.
- `worktree.cjs lineasApertura` (~462): `code "<ruta>"`, la pestaña, la línea de terminal si hay `claude`, `primer mensaje: /obrero x--ID`.
  `equipar` (~514) escribe `.kit-rol`, copia los `.env`, suma el deny, corre el setup. La carpeta es `CARPETAS/<n.carpeta>`
  (`.claude/worktrees/modulo--<x>[--<ID>]`): se calcula del nombre, sin estado.
- `/obrero` paso 1 corre `encargo.cjs presentar` (para con rama equivocada); `/director` paso 1 llega por `/director` o por el paso 0 del
  `/inicio`. Ninguno sabe entrar.
- **El gate ya es del director**: `encargo.cjs verificar` y `worktree.cjs integrar` son scripts que corre él (el temporal de `integrar`
  vive en `.claude/worktrees/`). No hay "sesión de gate" en el kit: los `gate-*` de Hermes son de su proceso propio.
- **Flota**: `actualizarRepo` (~286) clona, saltea con obra (~305) y, en verde, avanza la rama por defecto con un commit (ff, ~427).
  El commit del kit se juzga con la exención (a) contra el molde nuevo.
- **Un merge de `main` en `modulo/<x>`** se juzga contra cada padre con `descontarMerge` (`barreras.cjs` ~345): lo que llega igual
  desde `main` (ya juzgado allá) se descuenta. Con remoto, el rango es `origin/<def>..HEAD`: el commit del kit ya está en `origin/main`
  y no entra. O sea: traer `main` limpio da verde; lo que puede dar rojo es lo que choca o lo que el módulo cambió de un freno.
- `adoptar.cjs`: `RUTA_CHANGELOG` (~72, el renglón al tope), `lineaWorktreeinclude` (~466-483, solo texto), los agentes propios en
  `distintos` (~555, solo una línea), `decisionesSettings` (~988: solo los `ask` que `frenaAlDirector`). `actualizar.cjs` escribe su renglón
  igual. El `/cierre` del molde impone `## AAAA-MM-DD — <tema>`.
- Hermes, en solo lectura: `scripts/aplicar_migracion.py` corre contra el **ensayo por defecto** y se niega contra producción sin
  `--confirmar-produccion`; su ficha lista `scripts/aplicar_migracion.py` en `datos-reales`. `sensible.cjs` ya matchea banderas de la
  entrada "en algún lugar del comando": la entrada `scripts/aplicar_migracion.py --confirmar-produccion` pregunta solo contra producción.
- `NUCLEO.md` §9.4: "El andamiaje del propio proyecto (`CLAUDE.md`, skills, agentes, CI) lo editan los agentes […] (clase 1 o 2)".

## Pedido original, textual

> **D8r.4 · la `rc.5`: las correcciones del uso real.** […] **3, el obrero de una sola ventana (DECIDIDO por Guido, es el corazón de esta
> rc).** El obrero nace donde sea (la extensión de VS Code abre en `main`) y `/obrero` se presenta. El director corre `abrir` y le da la
> ruta. El obrero entra con `EnterWorktree` y verifica rama y `.kit-rol` antes de tocar nada; si no coinciden, para. El `Edit` del `.env`
> del principal va al `settings.json` del molde. `crear`/`abrir` imprimen esta vía. Lo mismo para el director (lo levanta Guido con el
> Arquitecto en su worktree) y, si entra, para los gate. […] **6, la flota con obra en curso como OPCIÓN (DECIDIDO).** La flota, o "poné
> al día X", lo ofrece explícito, avisa y recomienda no hacerlo. Si Guido insiste, actualiza `main` y ofrece llevarlo a cada rama de
> módulo viva, con lo rojo de los frenos para que lo apruebe él. […] **El 5 no entra** […] **NO entran**: el 2 […] ni el 9 […]
> *(La sesión madre, 2026-11-04.)*

## AGREGA y MODIFICA

Rutas: `molde` = `kit/molde/`, `lib` = `kit/molde/hooks/lib/`, `wt` = `kit/molde/scripts/worktree.cjs`, `adoptar` =
`kit/skills/arquitecto-skills/scripts/lib/adoptar.cjs`, `flota` = `kit/skills/arquitecto-skills/scripts/lib/flota.cjs`.

### Vuelta 1 — lo que Guido decidió y quiere ya

#### u1 · Una sola ventana: el obrero y el director entran solos a su worktree

- **`wt donde <x>[--<ID>]`** (nuevo, solo lectura; no escribe nada, no hace fetch): desde cualquier carpeta del repo (el principal o un
  worktree) calcula el worktree esperado (`<principal>/.claude/worktrees/modulo--<x>[--<ID>]`, el principal por `git-common-dir`) y:
  - si el cwd **ya es** ese worktree (la raíz por `rev-parse --show-toplevel`, comparada con `mismaRuta`) y la rama es `modulo/<x>[--<ID>]`
    y `.kit-rol` dice el rol esperado (`obrero` con `<ID>`; `director` o `nocturno` sin él) → salida 0, `adentro: <rama> · rol <rol> ·
    <ruta>`;
  - si el cwd es otra carpeta del mismo repo y el worktree está en `git worktree list` con esa rama → salida 0, `entrar: <ruta absoluta>`
    y la línea `con la herramienta EnterWorktree (path = esa ruta); después volvé a correr donde`;
  - si no está registrado o no existe la carpeta → salida 1, `no hay worktree: el director corre worktree crear <x>--<ID> (o abrir, en
    otra PC)`; si existe con otra rama, o `.kit-rol` falta o dice otro rol → salida 1, `PARADA: <qué no coincide>`.
- **`/obrero` paso 0 (nuevo), antes de la presentación**: `node .claude/scripts/worktree.cjs donde <x>--<ID>`. `entrar:` → la herramienta
  `EnterWorktree` con esa ruta, y `donde` otra vez: tiene que decir `adentro:`. Cualquier otra cosa → PARADA sin tocar nada (no hay rol de
  obrero todavía: los frenos te leen como el dueño). El paso 1 (`presentar`) sigue igual: es el segundo candado de la rama.
- **`/director` paso 1**: lo mismo con `donde <x>` (sin `<ID>`) antes de leer el relevo. Lo levanta Guido en su ventana; el `/director` de
  una sesión nueva entra solo.
- **La apertura que imprimen `crear`/`abrir`** (`lineasApertura`): **primero la vía de una ventana**: `en tu ventana de siempre, una
  sesión nueva de Claude; primer mensaje: /obrero <x>--<ID> (entra sola al worktree)`; después, como alternativa, `o en otra ventana:
  code "<ruta>"` y la de terminal como hoy. `/director` paso 4 ("La apertura") dice lo mismo: dale al dueño el primer mensaje.
- **El `.env` del principal con EnterWorktree**: el `settings.json` del molde suma `Edit(./**/.env)` y `Edit(./**/.env.*)` al `deny`, al
  lado de las `Read` que ya están. Cubre el principal y todo `.claude/worktrees/**` desde el settings de `main`. El deny absoluto del
  `settings.local.json` (`reglasDeny`) queda: es el de una ventana aparte.
- **Lo que no carga**: las `allow` de AUTORIZADO viven en el `settings.local.json` del worktree; con una ventana, el obrero pide más
  ventanas (no menos frenos). `/obrero` paso 4 lo dice. El arreglo de fondo (que `autorizado` también sirva así) no entra: NO VERIFICADO
  cómo recarga permisos la extensión después de EnterWorktree (se mide en el piloto, "Lo que esto no cierra").
- **Los gate**: no cambian (ya los corre el director por script). `NUCLEO.md` §6 suma media línea: "el gate lo corre el director desde su
  worktree; nunca en una carpeta fuera del repo".
- **El molde `CLAUDE.md`**: una línea en "Autonomía": "Un `/director` o `/obrero` entra a su worktree con `EnterWorktree` (lo dice su
  skill); nunca trabaja en `main`". Así la herramienta tiene su instrucción del proyecto.
- **crit. 1**: `worktree.test` — `donde` en las cinco salidas: desde el principal con el worktree creado (`entrar:` y la ruta), desde
  adentro (`adentro:`), sin worktree (1), con `.kit-rol` de otro rol (1, PARADA), con otra rama en esa carpeta (1); y desde otro
  worktree del mismo repo (`entrar:`). `donde` no escribe nada (el `git status` del principal y del worktree, iguales antes y después).
  `lineasApertura`: la primera línea es la de una ventana. (El deny del `.env`: ver rt-1, que reemplaza el renglón de arriba.)
  `skills.test`: `/obrero` y `/director` nombran `worktree.cjs donde` y `EnterWorktree`, y el paso 0 va antes de `presentar`.

#### u2 · La flota con obra en curso: la opción explícita

- **`actualizar.cjs flota … --con-obra`** (nuevo; sin él, como hoy): un repo con `modulo/*` vivas no se saltea. Sin la bandera, el
  `porque` del `salteado` suma: `si sabés que podés: --con-obra (no lo recomiendo con un director trabajando: su rama queda atrás de main
  hasta que la traiga)`.
- **Con `--con-obra`**: `main` se actualiza por el camino de siempre (el commit del kit, `chequear`, ff o `kit/<tag>` que espera, ROTA).
  Después, **por cada `modulo/*` viva, una prueba en el clon, sin subir nada**: `git checkout -B` de `origin/modulo/<x>`, `git merge
  --no-ff --no-commit` de la rama por defecto **ya actualizada**, y `estructura.cjs barreras` sobre lo pendiente (el merge en curso, el
  camino de MERGE_HEAD). Cada módulo da una línea en "te espera": `modulo/<x>: trae main con worktree.cjs traer-main <x> (lo corre el
  director) — barreras verde` · `… — barreras rojo: <ids> (lo apruebas vos antes: cambios nuevo …)` · `… — choca en <rutas>: es un encargo
  del director`. La flota **nunca** sube a una `modulo/*`: la rama es del director.
- **`wt traer-main <x>`** (nuevo, lo corre el director en su worktree, `modulo/<x>`): `git fetch origin`; rama equivocada, árbol sucio o
  un obrero sin mergear con cambios en el disco → 1 sin tocar; `git merge --no-ff --no-commit origin/<def>`; **choca → `git merge --abort`**,
  salida 1 y las rutas ("es un encargo"); limpio → `barreras` sobre lo pendiente: **rojo → `git merge --abort`**, salida 1, los ids y la
  línea exacta del `cambios nuevo …` para que el dueño apruebe (el sello antes del commit, como i5 de la `rc.4`); verde → `git commit`
  (`módulo <x>: trae <def> @<sha7>`) y `git push origin modulo/<x>`. Nunca `--force`, nunca otra rama.
- **"Poné al día X" con obra** (`flota.md`): el Arquitecto lo ofrece explícito: *"X tiene obra en curso (modulo/a, modulo/b). Lo
  recomendado: esperar a que integre. Si sabés que podés, actualizo main y te digo, por módulo, si traerlo da verde"* — con AskUserQuestion,
  la recomendada primero. "Sí" → `--con-obra`; después le pasa al director de cada módulo la línea `traer-main`.
- **`/director`**: una línea en el paso 6: *"main trajo el kit (la flota te lo avisa, o el dueño): `node .claude/scripts/worktree.cjs
  traer-main <x>` entre dos encargos, nunca con un obrero a mitad de un sub-paso que toque lo mismo"*.
- **crit. 2**: `flota.test` — un remoto con `modulo/a` viva: sin `--con-obra` sale `salteado` y el porqué nombra la bandera; con ella,
  `main` avanza un commit, `modulo/a` en el remoto queda **igual** (mismo sha) y "te espera" trae la línea de `modulo/a` (verde); un
  módulo que tocó **el mismo freno que el kit** sin chocar (lo que el merge deja distinto de los dos padres) → la línea dice rojo con sus
  ids; uno que choca con el kit → "choca". *(Corregido por D8r.4 con lo que midió F: un `modulo/b` que cambió `.claude/settings.json` sin
  aprobado da **verde** en el merge, y está bien: `descontarMerge` descuenta lo que quedó igual a un padre que lo cambió, y eso lo juzga
  el push del propio módulo, no el merge. `[coherencia]`)*
  `worktree.test` — `traer-main` verde (commit con dos padres, push al bare), choca (aborta, el árbol y HEAD como antes, 1), rojo
  (aborta, 1, imprime el `cambios nuevo`), árbol sucio (1 sin tocar), parado en `main` (1). Mutación de `traer-main`: sacar el
  `--abort` del rojo, o el chequeo de rama, deja una prueba en rojo.

#### u3 · Taller: `.gitleaksignore` con las dos huellas de mentira

- En la raíz de vibe-kit, `.gitleaksignore` con las dos huellas (`<commit>:<archivo>:<regla>:<línea>`) que da `gitleaks detect` hoy.
  Solo esas dos. **crit. 3**: `gitleaks detect` sobre toda la historia sale 0; con una clave de mentira nueva en un archivo de prueba
  (sin commitear, `gitleaks protect`), sale 1.

#### u9 · El pre-commit de un merge de `main` en una rama vieja (lo trajo la madre, 2026-11-04)

- **El dolor** (tracker, "lo que cuenta Guido" 9): en Hermes, `ui/cc-seguimiento-circuitos` (304 commits atrás de `main`, de antes de la
  adopción) mergea `origin/main` con conflictos; al commitear, el candado da 36 rutas de barrera "sin un aprobado sellado" que llegaron
  iguales desde `main`, y gitleaks marca líneas viejas de `main`. La salida que da (`cambios aprobar`) pide estar en `main` y sin merge a
  medias. Es el mismo camino de `traer-main` (u2) y de "llevar `main` a una rama".
- **La causa, medida** (2026-11-04, D8r.4, en un clon de Hermes del scratchpad: `ui/cc-seguimiento-circuitos` + `merge --no-commit
  origin/main`, los dos conflictos `core/sql_catalog.json` y `docs/CHANGELOG.md` resueltos con el lado de `main`; el `barreras` del kit
  con `--indice`): **rojo, 38 rutas** (`.githooks/*`, `.claude/hooks/**`, …). Por archivo: `.claude/settings.json` se descuenta bien
  (`[]`); `.claude/hooks/git-seguro.cjs` y `.githooks/pre-commit` (idénticos a los de `main`) dan su par `hooks:`/`githooks:`. Es que
  `tocaContraUno` (`barreras.cjs` ~384) devuelve el par de `hooks`, `githooks` y `gitleaks` **sin comparar contenido**: contra el padre
  `main`, el archivo "cambió" aunque es igual, y `descontarMerge` no descuenta nunca. La ficha y el settings comparan contenido; por eso
  las pruebas de merge (todas con ficha o settings) no lo vieron. El supuesto de antes ("sin saber" por la ficha) **no** era (una
  reproducción chica con solo el settings da verde). Lo encontró también el red team de u9 leyendo el código.
- **El mismo caso en el pre-push** (la madre, Hermes, 2026-11-04): `merge --no-ff bb6f2f5d` (padres `origin/main` y la rama de CC),
  `git push origin HEAD:main`: rojo por `gitleaks:.gitleaksignore`, que contra `origin/main` no cambia y contra la rama trae +7 líneas ya
  aprobadas (`697fdc90`) y aplicadas (`97dcf288`) en `main`. Es la categoría `gitleaks` de la misma línea de `tocaContraUno`: el arreglo lo
  cubre; crit. 9 suma el caso, con `main` como primer padre y al revés, y el rf-13 de `.gitleaksignore`.
- **gitleaks**: `escanear(['diff', '--cached', …])` (`kit-githook.cjs` ~782), contra HEAD también con MERGE_HEAD: las líneas de `main`
  le salen como nuevas.
- **El arreglo (manda sobre la regla de "igual a MERGE_HEAD", que se cae: rt-u9-2)**:
  - **Candado**: en `tocaContraUno`, para las categorías que no son ficha ni settings, el par va **solo si `nuevas(f)` no está vacío**
    (algún después distinto del antes de ese padre); si no, nada. Corrige las dos mitades del descuento (lo distinto contra cada padre y
    lo que cambió el otro desde la base), así rf-13 sigue valiendo para los hooks. Vale para `--indice` y para el merge commiteado
    (`--rango`, el pre-push). Fuera de un merge no cambia nada (ahí solo se listan rutas que cambiaron).
  - **gitleaks del pre-commit con MERGE_HEAD**: `T=$(git write-tree)` y el diff combinado de `T` contra HEAD y cada MERGE_HEAD (`--cc`),
    con el `agregadas()` que ya entiende `@@@`: las mismas reglas con que el pre-push juzga el merge commiteado; una línea igual a la de un
    padre en ese hunk no es nueva. **NO VERIFICADO** que `git diff --cc` acepte un árbol: se prueba primero; si no, `git commit-tree` a un
    commit temporal sin ref (se lo lleva el gc).
  - **El pre-push de una rama que ya está en el remoto** (rt-u9-3 a): el rango `<remoto>..<local>` trae todo lo de `main` que la rama no
    tenía (304 commits, con los de antes de la adopción, que nunca se escanearon). Pasa a `<local> --not <remoto> <vigente>` en gitleaks y
    en el candado: lo que ya está en la vigente lo juzgó su push. Sin vigente, como hoy.
  - **El merge sin conflicto** corre `pre-merge-commit`, sin MERGE_HEAD y con el `diff --cached` contra HEAD (rt-u9-3 b): `traer-main`
    hace siempre `merge --no-ff --no-commit` + `commit --no-edit` (así corre el pre-commit con MERGE_HEAD), y el rojo de `pre-merge-commit`
    dice *"el merge quedó a medias: git commit lo juzga contra los dos padres"*.
  - **El texto del rojo en un merge en curso** (rt-u9-2): *"esto vino distinto de los dos lados: en el merge dejalo como el lado que lo
    cambió (casi siempre main: git checkout --theirs <archivo>), commiteá el merge, y tu cambio hacelo en un commit aparte con su
    aprobado"*. No manda a `cambios aprobar` sobre el merge.
- **crit. 9**: `barreras.test` y `kit-githook.test` — (a) una rama sin `.claude/`, `main` con la ficha, un `.claude/hooks/x.cjs`, un
  `.githooks/pre-commit` y el `settings.json`, un conflicto en un archivo común resuelto: el pre-commit del merge **verde** (hoy rojo:
  la prueba en rojo primero) y el push de la rama, que ya estaba en el remoto, **verde** (sin el candado sobre el sha del merge ni las claves
  viejas de `main`); (b) rf-13 con un hook: la rama endureció `.claude/hooks/x.cjs` con su aprobado, `main` no lo tocó, la resolución usa
  el de `main` → rojo en el pre-commit y en el push; (c) un MERGE_HEAD escrito a mano con un ancestro de HEAD → rojo; (d) el merge sin
  conflicto por `traer-main` en una rama vieja → verde; (e) una clave de mentira nueva en la resolución, y otra idéntica en texto a una
  línea de `main` en otra posición del mismo archivo → gitleaks rojo; una clave vieja de `main` → no sale; (f) un MERGE_HEAD de una rama
  cualquiera con un hook cambiado sin aprobado: pre-commit verde (lo trae la rama) y el push de esa rama rojo en el commit de la rama.
  Mutación: (i) `tocaContraUno` sin comparar → (a) rojo; (ii) comparar solo en lo distinto y no en lo que cambió desde la base → (b)
  verde; (iii) gitleaks sin `--cc` o sin los dos padres → la clave vieja sale.
- **Lo que trajo su red team** (una ronda, 2026-11-04, solo u9): **rt-u9-1** (ALTO) la causa es la de arriba, no "sin saber" (medido) ·
  **rt-u9-2** (ALTO) la regla "igual a MERGE_HEAD y en la vigente" reabría rf-13 (resolver con el lado que no lo tocó), aceptaba un
  MERGE_HEAD a mano ancestro de HEAD y, sin remoto, algo nunca juzgado: **se saca** (con rt-u9-1 sobra) · **rt-u9-3** (ALTO) el dolor
  se mudaba al pre-push de una rama ya subida y al `pre-merge-commit` · **rt-u9-4** (MEDIO) gitleaks por el diff combinado, no cruzando
  dos corridas · **rt-u9-5** (MEDIO) crit. 9 binario y con el push. Todo arriba.
- **El despliegue**: el candado corre también con la versión de `origin/main` (`kit-githook.cjs` ~599-613): hasta que la `rc.5` llegue al
  `main` de Hermes, la rama sigue en rojo. El chequeo frío actualiza `main` del clon primero. Mientras, en Hermes, ese merge espera la
  `rc.5` (se lo dice la madre a Guido).

#### u11 · `.claude/frenos.log` tapado por un `*.log` del proyecto (lo trajo la madre, de Hermes, 2026-11-04)

- **El dolor**: `cambios aprobar` decía *"no — .claude/frenos.log está ignorado en .gitignore"*: Hermes tiene un `*.log` genérico
  (`.gitignore:110`) y el snippet del molde no lo contemplaba; en cualquier proyecto con `*.log`, aprobar falla siempre. Hermes lo tapó a
  mano con `!.claude/frenos.log` (`f1c2de92`).
- **Vuelta 1**: `gitignore.snippet` suma `!/.claude/frenos.log`. El actualizador y la adopción suman lo que falta del snippet **al final**
  del `.gitignore` (`actualizar.cjs`, paso 5), así que la negación queda después del `*.log` del proyecto. Prueba: `kit/molde/gitignore.test.cjs`
  (con `*.log`: sin el snippet ignorado —el rojo, medido con el snippet viejo—, con él no; los otros `.log` y lo del kit siguen ignorados).
- **Vuelta 2** (con A): `adoptar --mirar`/`--aplicar` y el `doctor` avisan si `git check-ignore .claude/frenos.log` da ignorado (un
  `*.log` escrito **después** del bloque del kit).

#### u12 · El tope de las skills avisa, no frena, cuando lo pasa la zona propia (DECIDIDO por Guido, 2026-11-04)

- **El dolor** (lo midió D8r.3 en un clon de Hermes): la flota a Hermes sale ROTA en la línea 4 de `chequear` (skills): `cierre` 8975 B,
  `director` 13154, `inicio` 9171 y `tramo` 9179, contra 8000 y 8600. Lo que los pasa es su **zona propia**; ya pasaban en la `rc.3`, con
  la que se adoptó directo (nunca corrió una flota), y `adoptar --aplicar` con D1 A no lo avisa. Sin esto, Hermes no recibe ni la `rc.4` ni
  la `rc.5`, con obra o sin ella.
- **Decidido con Guido** (por la madre): *"que avise, no que frene"*. El tope sigue midiendo. Si lo que lo pasa es la zona propia, la
  línea 4 da ⚠ y no ROTA, con cuánto se pasa, y la actualización sigue; el `doctor` lo avisa igual. Si lo que lo pasa es la parte del kit
  (el texto sin lo de adentro de la zona), sigue ROTA: es un error nuestro. El aviso sugiere *"mové a un anexo lo propio que no hace falta
  siempre, nunca lo de producción"*.
- **Encargo S** (`chequeo.cjs` línea 4 y `doctor.cjs`, sus pruebas). **crit. 10**: `chequeo.test` — la zona propia que pasa el tope → la
  línea no es roja y dice cuánto; la parte del kit que lo pasa → roja; el `/inicio` con su 8600; `doctor.test` la línea ⚠. Chequeo frío:
  un clon de Hermes, flota `rc.3` → `rc.5` con la obra en curso y `--con-obra`: tiene que llegar (crit. 8 suma).
- **El salto del bot** (la madre, 2026-11-04): Guido adopta `Arti-bot-eq` hoy con la `rc.4`; el chequeo frío suma un clon suyo adoptado
  con la `rc.4` y "poné al día" `rc.4` → `rc.5`: tiene que llegar limpio.

#### u13 · Lo que D2 recomendada saca, y qué lo cubre (lo trajo la madre, de Hermes, 2026-11-04; vuelta 2)

- **El dolor**: la adopción de Hermes con D2 recomendada (`9056c05b`) sacó de las `ask` `Bash(git merge:*)`, `git push *--force*` y
  `PowerShell(git merge *)`. El push forzado lo sigue frenando `git-seguro`; un `git merge` a mano en `main` ya no pide nada, y el
  `CLAUDE.md` de Hermes dice que sí. Con una ventana, un obrero nace en `main` con rol humano antes de entrar.
- **(a) entra**: `adoptar --mirar` lista, en el bloque D2, cada `ask`/`deny` propio que la recomendada saca, con el freno del kit que lo
  cubre (`git-seguro: <regla>`, `sensible: <clave>`) o `ninguno` (`frenaAlDirector` ya los separa; falta decir qué los cubre). Con
  `ninguno`, la línea lo dice así, para que Guido elija con eso. **crit.**: `adoptar.test`.
- **(b) no entra**, con la vara: `ask Bash(git merge:*)` **no** va al set recomendado del kit. El director mergea a mano cada obrero
  (`/director` paso 6: `git merge --no-ff <sha7>`, "sin preguntar"): un `ask` lo frenaría en cada encargo, que es justo por qué D2 lo saca
  (`frenaAlDirector`). El obrero que nace en `main` lo cubre el paso 0 (rt-2: ningún comando antes de `adentro:`), y un merge del dueño en
  `main` es suyo. `[workflow · coherencia]`. Lo de Hermes (volver a poner su `ask`) lo decide Guido aparte.

#### u10 · Las trabas que todavía no saltaron (hipótesis; pedido de Guido por la madre, 2026-11-04)

Inferidas de lo que dolió hoy. **Cada una se reproduce primero** (una prueba o un clon del scratchpad); la que no se reproduce va al
tracker como `probada, no pasa` con su salida, y no se toca código. La que sí, se arregla con su prueba en rojo y entra al red team
de su clase.

| # | Hipótesis | Clase | Vuelta | Cómo se prueba |
|---|---|---|---|---|
| h1 | `integrar` de un módulo que ya trajo `main` (`traer-main`) ve el merge como barrera sin aprobar | base equivocada | 1 (con u9) | `worktree.test`: módulo → `traer-main` (main con un hook aprobado) → `integrar` verde |
| h2 | `git pull` con conflicto **en `main`** (el remoto trajo un freno aprobado en la otra PC): el pre-commit del merge sale rojo | base equivocada | 1 (con u9) | `kit-githook.test`: dos clones, uno aprueba y pushea un cambio de `settings.json`, el otro pull con conflicto → pre-commit |
| h3 | `cherry-pick` o `revert` de un commit de barrera ya aprobado pide aprobado de nuevo | base equivocada | — | **probada, no pasa** (en la vida real: el cherry-pick de 11 commits de `cc-ui` en Hermes anduvo sin pedir aprobados, la madre, 2026-11-04); el `revert` no se probó |
| h4 | El merge de upstream en un fork (el bot, OpenClaw): miles de rutas y contenido ajeno para gitleaks | base equivocada | 1 (con u9) | lo mismo que u9 con MERGE_HEAD **fuera** de la vigente (upstream): ¿qué dice, y qué tendría que decir? (no se afloja para upstream: se documenta el camino) |
| h5 | Secretos o falsos positivos viejos en la historia aparecen recién en un merge (Hermes: un `auth_uid` en `docs/legacy`) | antes de la adopción | 2 | `adoptar --mirar` corre `gitleaks detect` sobre toda la historia y lista `archivo:línea · regla` **sin el valor**, con la propuesta (rotar si es real; si no, `.gitleaksignore` con su porqué) |
| h6 | Worktrees fuera de `.claude/worktrees/` confunden `worktree estado`, `cerrar`, el `doctor` o la flota | antes de la adopción | 2 (con u4) | `worktree.test` con dos worktrees en `../` |
| h7 | Con una ventana, el hook de `main` (rc nueva) convive con los scripts y la ficha del worktree (rc vieja), o al revés: ¿choca un formato? | una ventana | 1 (con u1) | una prueba que corre los hooks del molde nuevo sobre un árbol con los scripts y la ficha de la `rc.4`, y al revés |
| h8 | Dos sesiones en el mismo árbol: `barreras --indice` o el candado le cargan a una lo que la otra dejó en el índice | una ventana | 1 (con rt-6) | se razona sobre el código y una prueba: lo que deja una en el índice entra en el commit de la otra (rt-6 ya lo frena en `donde`) |
| h9 | `.worktreeinclude` copia `config*.ini` con credenciales a cada worktree: ¿lo cubren el corrector de secretos y el deny? | una ventana | 2 (con u6) | `worktree.test`: un `config.local.ini` ignorado con una clave de mentira, copiado; `secretos.cjs` y el deny sobre esa ruta |
| h11 | Un obrero (rol `obrero`, en su worktree) pushea directo a `origin main` (pasó en Hermes, con el clic de Guido, porque CC va por mensaje): ¿el kit lo frena en `git-seguro` o en el pre-push, como con el principal? | una ventana | 2 | primero se mira qué hace hoy `git-seguro` con un push a la rama por defecto desde rol `obrero`; la recomendada: negarlo (el texto de `/obrero` ya dice "nunca push a otra rama" y el que mergea a `main` es `integrar`). **DECIDIDO por Guido (2026-11-04, por la madre)**: a `main` sube solo el director (o `integrar`), nunca un obrero. Va a la `rc.6` (vuelta 2) |
| h12 | Un repo con `hooks-lib` "te espera" (una fusión sin resolver) queda ROTA en toda versión cuyos hooks pidan la lib nueva, y el mensaje no dice "resolvé hooks-lib primero" (la flota de D8r.3 en alfa y beta: rc.3 → rc.4 ROTA, la línea 7 lo atajó; con la lib vieja el hook de escritura falla abierto, por diseño). Hermes y el analytics tienen `hooks-lib: molde`: no les pega | flota | rc.6 | el arreglo de fondo (que los hooks esperen junto con su lib, sin bajarlos si su lib queda esperando) es de diseño de piezas: va a la `rc.6`; la flota de prueba de la `rc.5` repite el paso del dueño que D8r.3 sumó en alfa y beta (resolver `hooks-lib`) antes del salto rc.4 → rc.5 |
| h10 | Un hook o comando del kit llama a `sh` y falla desde una sesión en PowerShell sin `sh` en el PATH; el `doctor` lee mal la versión de `claude` de la terminal | otra PC | 2 | `git grep` de `sh`/`spawn('sh'` en el molde y los scripts; `doctor.test` con una salida de `claude --version` como la de Juan (`prueba/juan`, `52e0ca3`) |

### Vuelta 2 — el resto de lo que dolió

#### u4 · Lo que queda fuera del repo: `--mirar` y el `doctor` lo avisan

- **`lib/vecinos.cjs`** (nuevo, en `arquitecto-skills/scripts/lib/`): `vecinos(principal)` → (a) los worktrees de `git worktree list
  --porcelain` **fuera** de `.claude/worktrees/`, cada uno con su estado: `mezclada` (su punta es ancestro de la rama por defecto y el
  árbol limpio), `viva` (commits que la rama por defecto no tiene), `suelta` (detached), `perdida` (prunable: la carpeta no existe);
  (b) las carpetas `gate-*` y `gate_*` en el **padre** del principal. Solo lee; nunca borra.
- **`adoptar --mirar`** (con `--principal`): una línea `fuera del repo: N worktrees (M ya mezclados) y K carpetas gate-* en <padre> — el
  kit los arma adentro (.claude/worktrees/; el gate, worktree integrar): lo que esté mezclado se puede borrar con git worktree remove
  <ruta> (lo decide Guido, una por una)`. Si un script del repo escribe `../gate-` o `parent / "gate-` (un `git grep` de esas dos formas),
  lo nombra: *"tu gate propio escribe fuera del repo: pasalo al del kit o a `.claude/worktrees/`"*.
- **`doctor`** (parado en un proyecto): la misma lista como ⚠ (nunca ✗), con `git worktree remove <ruta>` solo para las `mezclada`.
- **crit. 4**: `vecinos.test` con un repo y tres worktrees fuera (una mezclada, una viva, una prunable) y dos `gate-*` en el padre: los
  cuatro estados bien; `adoptar.test` y `doctor.test` imprimen la línea; ninguno borra (las carpetas siguen).

#### u5 · `modo-b.md` B0 y B5, y quién diseña bajo el director

- **B0**: la regla "parado en otra rama: no armás" vale para **nacer** (sin `docs/modulos/<x>/` en la rama por defecto). **Retomar** un
  módulo que ya nació (su `README.md` en la rama por defecto y `rama: modulo/<x>` en su ficha) se hace **en `modulo/<x>`**, en su worktree
  (`wt donde <x>`, u1): el spec y el prototipo se commitean por rutas ahí y se pushea esa rama.
- **B5**: con director, el worktree **puede** armarse con el spec en BORRADOR (el diseño corre bajo el director: Guido lo quiere así); el
  sello y el READY siguen siendo del Arquitecto, en `modulo/<x>`, y `presentar --spec` sigue frenando el reparto sin READY.
- **`/director` paso 2**: con el spec en BORRADOR, el diseño **lo hace una sesión de Arquitecto aparte** (Modo B, retome, en el mismo
  worktree: `/arquitecto` en una sesión nueva entra con `donde`); el director no diseña (rol 10: no escribe código ni specs) y espera el READY.
- `arquitecto.cjs` no cambia (no mira la rama: medido en el tracker, `:225`). **crit. 5**: `skills.test`/`arquitecto.test` — los textos
  dicen nacer/retomar y el BORRADOR bajo director; `worktree crear <x>` con el spec en BORRADOR sigue andando (ya anda) y `presentar --spec`
  sigue en 1.

#### u6 · Los avisos de la adopción

- **`NORTE.md` con `[completar`**: `--aplicar` termina con `NORTE.md tiene N [completar]: llenalo con Guido (lo usa el Arquitecto en B1)`
  si quedó alguno; la flota no lo mira. **crit.**: `adoptar.test`.
- **El CHANGELOG del proyecto** (`adoptar` y `actualizar`): si `<carpeta>/CHANGELOG.md` tiene un `## [Unreleased]` (Keep a Changelog), el
  renglón va **adentro de esa sección**, en una subsección `### Método (kit)` (creada si falta, al final de la sección), nunca en las otras
  subsecciones (las lee el release). Si no, como hoy. El `/cierre` del molde dice lo mismo: con `## [Unreleased]`, la entrada de la sesión
  va como renglones en `### Método (kit)` (o donde diga la zona propia del `/cierre`), sin `## AAAA-MM-DD`. **crit.**: `adoptar.test` y
  `actualizar.test` con un Keep a Changelog con `### Para usuarios`: esa subsección queda byte a byte; `skills.test` para el `/cierre`.
- **Los agentes propios** con el nombre de un agente del kit: `--aplicar … --agentes renombrar` los mueve a `.claude/agents/<nombre>-propio.md`
  (`git mv`, en el commit de las piezas) y la pieza pasa a `sí`; la línea dice que sus reglas pueden ir a la zona propia del `/tramo` o al
  brief. "Mezclar" no es un camino del script (dos agentes con instrucciones distintas no se funden solos): es la sesión con Guido, a mano.
  **crit.**: `adoptar.test` (el propio sigue con su contenido y el del kit queda; sin la opción, como hoy).
- **`.worktreeinclude`**: `--aplicar … --worktreeinclude` escribe en la raíz las líneas que propuso `--mirar` (en el commit de las piezas;
  si ya hay uno, se niega a pisarlo). **crit.**: `adoptar.test`.
- **Los `ask` propios** (11 c): `--mirar` suma `ask que preguntan en cada vuelta (también con "no volver a preguntar"): <lista>` con los
  `ask` del settings que no frenan al director, y el remedio: *"para que pregunte una vez: sacá el ask; si es para mirar (ssh de solo
  lectura), una allow con el comando exacto"*. No los saca solo (es decisión de Guido). **crit.**: `adoptar.test`.

#### u7 · Las opciones de la ficha y los textos

- **`andamiaje:`** (nueva, opcional, de arriba): `agentes` (por defecto, como hoy) · `con-ok-de-guido`. `NUCLEO.md` §9.4: con
  `con-ok-de-guido`, editar `CLAUDE.md`, skills o agentes es **clase 3** (el clic del dueño). `ficha.cjs` la valida (las copias byte a
  byte). La adopción la propone cuando el proyecto ya tiene esa regla (Hermes: CM-14). Es texto, no un hook (como la clase 3 de hoy).
- **`datos-reales` por entorno** (Hermes 5): sin código nuevo (ya anda, Contexto). `flota.md` D4 y el ejemplo de la ficha: *"si el
  comando elige el entorno con una bandera, la entrada lleva la bandera que apunta a lo real (`scripts/aplicar_migracion.py
  --confirmar-produccion`): pregunta solo contra lo real"*. **crit.**: `sensible.test` con esa entrada: pregunta con la bandera, no sin.
  A Hermes se lo propone la madre (su ficha es de Guido).
- **El Equipador** (Hermes 6): el modo HOOKS POR PC, paso 4, pide antes de `--sacar-viejo` cruzar los patrones del corrector viejo con los
  de `secretos.cjs` y decir cuáles faltan.
- **Las lecciones de Hermes** (8), con la vara del ADR-030, una línea cada una donde se lee:

  | CM de Hermes | Entra | Dónde / por qué no |
  |---|---|---|
  | 15, 37, 101 · un pendiente no queda huérfano, lleva su destino | sí | `/cierre` y el CIERRE del obrero: cada pendiente dice adónde va (TODO, un módulo, o "descartado: por qué") `[acordarse de menos]` |
  | 16, 70, 81 · fila por decisión, camino en papel, "qué ve hoy / qué va a ver" | no | ya está: B2 (prototipo antes del spec) y "Decisiones" del formato |
  | partir sin mezclar capas | sí | la plantilla del encargo: un sub-paso no mezcla capas (datos · lógica · pantalla) `[mejor código]` |
  | tope de 3 archivos por sub-paso | no | por las dudas: `## Toca` ya acota y un tope fijo no sirve para todos |
  | 34 · abrir la función entera antes de citar | sí | el `explorador` y B1: antes de citar `archivo:línea` de una función, leerla entera `[mejor código]` |
  | 17, 6, 74, 88 · contar los números contra el código; "X ya no existe" con su medición; una premisa corregida reabre la decisión | sí | `NUCLEO.md` §9: una sola línea `[mejor código · coherencia]` |
  | 31, 42, 55, 85 · un mutante vivo es un agujero de la prueba | sí | `NUCLEO.md` §7: un mutante vivo se mira y va una prueba o la nota de por qué es equivalente |
  | 93, 95 · antes de borrar un módulo, la suite con él bloqueado | no | regla de 3+: un caso en Hermes; queda en su zona propia |
  | 32, 63, 96 · no armar texto por partes para esquivar un control; sin atribuciones en el código | no | lo primero ya está (`/obrero` 4: "nunca un rodeo"); lo segundo choca con el kit, que cita su spec en los comentarios |
  | 28 · el gate prueba primero el camino de la mayoría | no | no tiene escenario de error medido en el kit |
  | 25 · el obrero sale con trabajo de reserva | no | va con D8c.1 (el obrero de cierre de tramo, `rc.6`) |
  | 3 · el entregable que no se parte se avisa antes | sí | `/director` paso 3: el encargo lo dice arriba y se avisa al dueño antes de lanzar `[workflow]` |
  | 87 · un archivo con una credencial adentro no se lee entero | sí | `NUCLEO.md` §11: fuera de los `.env`, se busca el nombre, nunca se abre entero `[mejor código]` |
  | 63 · cruzar el NO SE TOCA con decisiones posteriores al spec | sí | `/director` paso 3, al armar el encargo `[coherencia]` |

- **crit. 6** (ADR-034): los textos dicen lo mismo que el código (`flota.md`, `modo-b.md`, `NUCLEO.md`, `/obrero`, `/director`, `/cierre`,
  `EQUIPADOR`/`SKILL.md` del Equipador, el `USO` de `actualizar` y de `worktree`), y los topes de las skills siguen (`skills.test`).

### De la `rc.4` (lo que D8r.3 deje)

D8r.3 contestó (2026-11-04): la `rc.4` toma 11 (a) y (b) y, de "De D8r.2", solo el 1. Del resto de "De D8r.2", con la vara:

- **u8 · CF-3, el plazo del test en la ficha** (entra): `vars.plazo-test` (minutos, entero 1-60, opcional) lo lee el `sello` en vez de
  los 5 de `ARQUITECTO_PLAZO_TEST_MS` (la variable sigue mandando si está). Hermes tarda ~7 min: sin esto, en un proyecto sin base real
  el sello daría "colgado". `[workflow]` **crit.**: `arquitecto.test` con un test falso de más de 5 s y `plazo-test` chico/grande (con el
  plazo en segundos por la variable de pruebas).
- **CF-2, la mitad** (no entra): sumar `web/` al setup se decide en la pantalla con Guido (`--mirar` ya lo avisa); hacerlo solo es adivinar.
- **t12 (a), mirar si el código lee el archivo** (no entra): por las dudas; la línea ya lo deja a Guido.
- **El repo de prueba parecido a Hermes** (no entra en esta tanda): es grande y no arregla un dolor de uso; va antes de R2 (se le avisa a la madre).
- **Los NO VERIFICADO de D8r.2** (5): el de `--traer` sobre un clon de Hermes lo cubre el chequeo frío (crit. 8 c, sobre el bot); el resto sigue.

### Lo que trajo el red team (manda sobre lo de arriba)

Una ronda (2026-11-04): 4 ALTOS, 5 MEDIOS, 2 BAJOS, todos integrados. Contrastó con el código y con la documentación oficial de Claude
Code (permisos y worktrees).

- **rt-1 (ALTO, u1) · El `.env` del principal queda legible después de EnterWorktree.** Las reglas `./…` son relativas al directorio
  actual y `**/.env` no cubre un `.env` en un directorio **padre** (la tabla de la documentación de permisos): desde
  `<principal>/.claude/worktrees/modulo--x--01`, el `.env` del principal es un padre. Ni las `Read(./**/.env)` de hoy ni las `Edit` nuevas
  lo cubren. **Arreglo**: `equipar` suma `reglasDeny(principal)` (las cuatro absolutas, Read/Edit × .env/.env.*) **también** al
  `.claude/settings.local.json` del **principal** (ignorado por `IGNORADOS`; sin pisar lo que tenga: el mismo `sumarDeny`), que es donde
  nace la sesión de una ventana; y sigue sumándolas al del worktree. Cubre con cualquiera de las dos premisas (rt-5). **El `settings.json`
  del molde no cambia**: las `Edit(./**/.env*)` eran redundantes y trababan `.env.example` (rt-10). Reemplaza el renglón del `.env` de u1 y
  D8r4-3. crit. 1 suma: después de `crear`, el `settings.local.json` del principal tiene las cuatro y lo que tenía antes; uno roto → 1
  como hoy. **Que se sepa dónde vive** (la madre, 2026-11-04): ese archivo no viaja por git y cada PC lo necesita; `crear`/`abrir`
  imprimen `deny del .env del principal: en <principal>/.claude/settings.local.json (no viaja por git: cada PC lo arma con su primer
  crear o abrir)`, y el `doctor`, parado en un proyecto con worktrees en `.claude/worktrees/`, da ⚠ si a ese archivo le falta alguna de
  las cuatro, con la línea `node .claude/scripts/worktree.cjs abrir …` que lo rehace (sin pisar nada). crit. 8 suma: en una sesión real, después de EnterWorktree, `Read <principal>/.env` da deny (si no se mide: NO VERIFICADO).
- **rt-2 (ALTO, u1) · Antes de entrar, un obrero es `humano` para los frenos.** En `main` no hay `.kit-rol` (`contexto.cjs:100`): un
  `cambios aprobar` de esa sesión le da ventana a Guido en vez de negar (`niega-aprobar.cjs:84-87`). **Arreglo**, sin tocar la lógica de
  los porteros: (a) `/obrero` y `/director`: *"si `donde` no dice `adentro:`, ningún comando más que la PARADA; nunca `ExitWorktree`"*;
  (b) el texto de la ventana (`MOTIVO_ASK`, `niega-aprobar.cjs:42`) suma *"si te lo pide una sesión de /obrero o /director, decí que no"*;
  (c) una línea en "Lo que esto no cierra"; (d) `skills.test` y `niega-aprobar.test` miran los textos.
- **rt-3 (ALTO, u2) · `barreras` a secas no juzga un merge en curso.** El modo pendiente compara solo contra HEAD (`barreras.cjs:256-259`);
  el descuento por padre corre con `--indice` (~260-266) o con un merge commiteado: a secas, todo lo que el kit cambió en `main` saldría
  como cambio del módulo (rojo siempre). **Arreglo**: después de `git merge --no-ff --no-commit`, **`estructura.cjs barreras --indice`**,
  sin `--molde`, igual en la prueba de la flota y en `traer-main`. El caso verde de crit. 2 trae de `main` un cambio de
  `.claude/settings.json` y de un hook ya aprobado allá (si no, la prueba pasa con el modo equivocado).
- **rt-4 (ALTO, u1) · `donde` paraba a todo obrero de noche.** `crear x--ID --noche` escribe `nocturno` (`rolDe`, `worktree.cjs:452`).
  **Arreglo**: con `<ID>`, el rol esperado es `obrero` o `nocturno`; sin `<ID>`, `director` o `nocturno`. crit. 1 suma el caso.
- **rt-5 (MEDIO, u1) · La documentación dice que los settings sí se mudan con EnterWorktree** ("the move takes […] project configuration
  such as CLAUDE.md and settings"; solo `${CLAUDE_PROJECT_DIR}` se queda en `main`). La medición de la madre miró rama y `.kit-rol`, no
  los permisos. **Arreglo**: el Contexto, `/obrero` paso 4 y D8r4-4 lo dicen condicional (*"si la extensión no carga el settings del
  worktree, pedís más ventanas"*) y queda **NO VERIFICADO de verdad**: en el piloto, `/status` después de EnterWorktree (qué fuentes de
  settings cargaron). Con rt-1, el deny anda con las dos premisas. Si cargan los del worktree, la lista de hooks es la del módulo y los
  scripts los de `main`: otra razón para `traer-main` ("Lo que esto no cierra").
- **rt-6 (MEDIO, u1, u5) · Dos sesiones en el mismo worktree.** Con `code "<ruta>"` la ventana ya abierta tomaba el foco; con una ventana,
  un `/obrero x--02` mal tipeado entra al worktree de otro. **Arreglo**: `donde` para un obrero, con el árbol con cambios sin commitear
  (sin contar `.claude/frenos.log`) → 1, *"¿hay otra sesión en este worktree?"*. u5: *"mientras diseña el Arquitecto, el director no está
  vivo (cerró, o se mudó con relevo); el Arquitecto ahí corre con rol director"*.
- **rt-7 (MEDIO, u2) · Los bordes de `traer-main` y de la prueba de la flota.** (a) `frenos.log` con renglones agregados no es "sucio": el
  mismo trato que `integrar` (`worktree.cjs:1161-1185`, los commitea); (b) `modulo/<x>` que ya contiene `origin/<def>` → 0, `ya al día`,
  sin commit; (c) el `fetch` que falla → 1 sin tocar; (d) en la flota, `git merge --abort` (o `reset --hard`) entre un módulo y otro, y
  una prueba con dos módulos donde el primero choca; (e) la prueba por módulo **solo si `main` salió `mezclado`**; si salió `te espera`
  o ROTA, la línea es `modulo/<x>: primero mezclá kit/<tag> en <def>`.
- **rt-8 (MEDIO, u7) · La bandera de `datos-reales` se esquiva con una abreviatura.** `sensible.cjs:149` exige la bandera tal cual, y el
  `argparse` de `aplicar_migracion.py` (~587-591) acepta `--confirmar` por `--confirmar-produccion` (sin `allow_abbrev=False`): correría
  contra producción sin preguntar. **Arreglo**: el texto de `flota.md` D4 y del ejemplo dice *"solo si el script no acepta abreviaturas
  (en Python, `allow_abbrev=False`)"*; la madre se lo propone a Hermes junto con la entrada nueva, y hasta entonces queda la vieja.
  `sensible.test` documenta que la abreviatura no matchea.
- **rt-9 (MEDIO, u4) · `gate-candados` de Hermes es un dato, no un gate viejo** (`tests/test_candados_por_rol.py:148`: una foto de los
  roles de producción, compartida entre worktrees y PCs a propósito). **Arreglo**: los `gate-*` se cuentan, **sin** consejo de mudarlos (y
  sin el `git grep`); una `gate-*` sin `.git` se dice *"datos, no un gate: no tocar"*. La línea de las `mezclada` suma *"`git worktree
  remove` borra también lo ignorado (.env, config): miralo antes"*.
- **rt-10 (BAJO)**: lo cubre rt-1 (no se toca el `settings.json`).
- **rt-11 (BAJO, CF) · Los clones apuntan a las carpetas reales.** El chequeo frío, antes de cualquier push: `git remote get-url origin`
  de cada clon cae dentro del scratchpad; si no, para.
- **De paso**: el renglón del CHANGELOG es `<carpeta-docs>/CHANGELOG.md` (con la `rc.4`, la carpeta de papeles), no la raíz.

## NO SE TOCA

- Lo que frenan los porteros (`git-seguro`, `niega-aprobar`, `sensible`, `secretos`): de `niega-aprobar` cambia solo el texto de la
  ventana (rt-2). El `settings.json` del molde (rt-1). `presentar` sigue siendo el candado de la rama.
- La flota **sin** `--con-obra` (la tabla y el `salteado` de hoy, más una frase). La flota nunca sube a una `modulo/*`.
- `encargo.cjs autorizado` y las líneas de fondo (`-p`): el obrero de fondo sigue naciendo en su worktree.
- `arquitecto.cjs` (sello, ready). D1-D4 por defecto. El ítem 5 de "lo que cuenta Guido" (D8c.1), el 2 y el 9 de Hermes (decididos).
- Las carpetas reales de Guido (`D:\Hermes\*`, `D:\Arti-*`): solo lectura. Las actas de `tips/` y `_fuente/`.

## Entorno de prueba

Temporales y repos de prueba (`pruebas/rehacer.sh`), canónico `bare` con tag anotado, `--claude no`. Clones **solo** en el scratchpad,
cada uno con un `bare` falso de remoto: `git clone D:\Hermes\Hermes.exe` (más `modulo/cashflow` empujada al bare), `git clone
D:\Arti-bot-analytics-eq`, `git clone D:\Arti-bot-eq`.

## Criterios de aceptación

Los crit. 1 a 6 y los de u6, y: **crit. 7** la suite entera verde (sola, en segundo plano) y la flota 2.4.2 → rc.4 → rc.5 con canónico
`bare` sale 0; **crit. 8** el chequeo frío: (a) en un clon de Hermes con `main` y `modulo/cashflow` en su bare: `flota --con-obra` → `main`
avanza, `modulo/cashflow` igual, la línea de "te espera" → en el worktree del módulo, `traer-main cashflow` → verde y push; y el camino del
obrero hasta donde llega un script: `worktree crear cashflow--01` desde el principal → `donde cashflow--01` dice `entrar:` → desde la ruta,
`adentro:` (EnterWorktree mismo en una sesión: **NO VERIFICADO**, lo mira Guido); (b) en un clon del analytics: `poné al día` (la flota
de un repo) sale `mezclado` o `al día`; (c) en un clon del bot: la adopción completa (`--mirar` → `--aplicar` → commits → `barreras
--rango` verde → push → `--traer`).

## Decisiones (la vara)

- **D8r4-1 · El obrero se ubica con un script (`donde`), no con texto**: la ruta sale del nombre, y el chequeo de rama y rol es el mismo
  para el obrero, el director y el Arquitecto que retoma. `presentar` queda como segundo candado. `[acordarse de menos · coherencia]`
- **D8r4-2 · La vía de una ventana va primero en la apertura**, `code "…"` queda de alternativa: es como trabaja Guido. `[workflow]`
- **D8r4-3 · (rehecha por rt-1) El deny absoluto del `.env` del principal va también al `settings.local.json` del principal**, no al
  `settings.json` del molde: una regla relativa no cubre un `.env` en un directorio padre del worktree, y el del molde trababa
  `.env.example`. El pedido decía "al `settings.json` del molde"; esto cumple lo que buscaba (que el `.env` quede cerrado con una
  ventana) con las dos premisas de cómo cargan los settings. `[mejor código · coherencia]`
- **D8r4-4 · Las `allow` de AUTORIZADO con una ventana no se arreglan en esta tanda**: no se sabe cómo recarga la extensión (NO
  VERIFICADO) y el costo es más ventanas, no menos frenos. `[filtro pragmático]`
- **D8r4-5 · La flota prueba el merge a cada módulo en su clon y no sube nada a una `modulo/*`**; trae `main` el director con
  `traer-main`, que aborta ante choque o rojo. Así "con lo rojo para que lo apruebe Guido" es una línea antes del commit, y el director no
  se encuentra su rama movida. `[workflow · coherencia]`
- **D8r4-6 · Los vecinos se avisan, nunca se borran**: borrar un worktree vivo pierde trabajo; Guido decide uno por uno. `[mejor código]`
- **D8r4-7 · El CHANGELOG se detecta por `## [Unreleased]`, sin clave en la ficha**: una clave es una cosa más para acordarse y la marca
  ya dice el formato. `[acordarse de menos]`
- **D8r4-8 · `andamiaje:` es texto (clase 3), no un hook**: como las otras clases; un hook en cada `Edit` es caro para un caso. `[filtro pragmático]`
- **D8r4-9 · "Mezclar agentes" no es un comando**: fundir instrucciones es criterio, no mecánica. `[mejor código]`
- **D8r4-10 · Las lecciones de Hermes entran como una línea donde se lee**, nunca una sección nueva; seis no pasan la vara (tabla). `[acordarse de menos]`
- **D8r4-11 · Dos vueltas, un tag**: la vuelta 1 (u1-u3) y la 2 (u4-u7) van en la `rc.5`. Si la 2 no entra sana en esta sesión, la `rc.5`
  sale con la 1 y la 2 pasa a la `rc.6` junto a D8c.1 (se le avisa a la madre). `[workflow]`

## Lo que esto no cierra

- **EnterWorktree en una sesión real** de la extensión (el paso 0 del `/obrero` de punta a punta) y si `./**` del settings sigue resolviendo
  contra `main` después de entrar: NO VERIFICADO; lo mira Guido en el piloto (tracker, "NO VERIFICADO").
- **Con una ventana, los hooks son los de `main`** y los scripts (`.claude/scripts/…`, relativos al cwd) los del módulo: si `main` trajo un
  kit nuevo y el módulo no, conviven dos versiones hasta `traer-main`. Es lo que pide la flota con obra; se dice en `/director`.
- **Las `allow` de AUTORIZADO no cargan** con una ventana, si la extensión no carga el settings del worktree (D8r4-4, rt-5).
- **Antes de entrar, la sesión de un obrero es `humano` para los frenos** (rt-2): un `cambios aprobar` le da ventana a Guido en vez de
  negar. Lo cuidan el texto de la skill y el de la ventana; la lógica de los porteros no cambia.
- `andamiaje: con-ok-de-guido` depende de que el agente lea `NUCLEO.md` (D8r4-8).

## Los encargos (el director reparte, lee cada diff y corre las pruebas de cada uno)

Presupuesto (ADR-029): RT, **cuatro de trabajo en la vuelta 1 y 2**, el chequeo frío. Cada uno en `scratchpad/<x>/wt`, desde el tag
`v3.0.0-rc.4`, con el `--stat` antes del merge. Los textos, el director al final de cada vuelta.

| # | Encargo | Puede tocar | Prueba |
|---|---|---|---|
| RT | Red team, una ronda (sobre todo u1, u2 y `traer-main`) | — | — |
| W | u1 y `traer-main` (u2), rt-1/2/4/6/7 | `kit/molde/scripts/worktree.cjs`, el texto `MOTIVO_ASK` de `niega-aprobar.cjs` (solo el texto), sus pruebas | crit. 1, la mitad de crit. 2 |
| M | u9 (con su red team antes) | `kit/molde/githooks/kit-githook.cjs`, `kit/molde/hooks/lib/barreras.cjs` (y su copia si la hay), sus pruebas | crit. 9 |
| F | u2 en la flota | `flota.cjs`, `actualizar.cjs` (USO), sus pruebas | la otra mitad de crit. 2 |
| A | u4, u6 (vuelta 2) | `adoptar.cjs`, `actualizar.cjs` (el renglón), `lib/vecinos.cjs`, `doctor.cjs`, sus pruebas | crit. 4 y los de u6 |
| K | u7 en código (`andamiaje:`) y u8 (`plazo-test`) | `ficha.cjs` y sus copias, `arquitecto.cjs`, sus pruebas | `ficha.test`, `arquitecto.test`, copias iguales |
| CF | Chequeo frío (crit. 8) | — | — |

**Orden**: RT → RT de u9 → (vuelta 1) W ∥ F ∥ M (W y M no comparten archivos; F usa `barreras --indice`, que M cambia: se mergea M
antes que F, y F mergea `main` y vuelve a correr sus pruebas) → textos de u1-u2 → u3 → (vuelta 2) A ∥ K → textos de u5-u7 → CF → suite → la flota → tag.

## Ejecución

Un director Opus (D8r.4), este delta, una ronda de red team y un chequeo frío; el cómo, en [`PLAN-construccion.md`](PLAN-construccion.md).
