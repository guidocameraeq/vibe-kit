# SPEC delta: paquete 8r3 — la `rc.4` exprés: que el bot de Arti se pueda adoptar, y el rojo de los `.pyc` — vibe-kit
Lo que traba **ya** la adopción del bot (`Arti-bot-eq`, un fork de OpenClaw) y el primer `/cierre` de Guido en Hermes. Nada más: el
resto de Pendientes sigue en la `rc.5` (D8c.1: el obrero de cierre de tramo y los experimentos).
- Estado: READY (D8r.3, 2026-11-04)
- Fecha: 2026-11-04 · Misión: 5, director **D8r.3** (lo lanzó la sesión madre de la recta final; la vara: ADR-030 y ADR-034; el presupuesto: ADR-029)
- Plano: [`SPEC-0-kit-v3.md`](SPEC-0-kit-v3.md); el modelo: [`SPEC-paquete-8r2.md`](SPEC-paquete-8r2.md). La fuente: tracker, Pendientes, "De la
  adopción real de Hermes" ítem 11 (a) y (b), y el pedido de la sesión madre.
- Red team: **sí, una ronda** (el ítem 3 toca un freno: lo que `barreras` cuenta como pendiente; y la carpeta nueva la leen el
  candado y las barreras). Chequeo frío sobre clones del bot y de Hermes (nunca sobre las carpetas reales).

## Por qué (el dolor)

- **El bot no se puede adoptar.** Su `docs/` es el sitio publicado de OpenClaw (699 archivos, `docs.json`, `CNAME`) y los papeles del
  método viven en `arti-docs/` (`SESSION_HANDOFF.md`, `TODO.md`, …). El kit da `docs/` por fija: adoptarlo metía el handoff, el TODO y el
  NORTE del kit en la documentación de OpenClaw, el hook de escritura frenaba cada archivo de OpenClaw y el arranque leía un handoff que
  no existe. (Tracker, Pendientes, ítem 11 a, 2026-11-04.)
- **Un hook de arranque propio con el nombre del del kit** (`.claude/hooks/session-start.cjs`, en los dos repos de Arti): con `propia` la
  adopción no lo toca; con `--arranque kit` el settings apunta al mismo archivo, o sea al hook viejo. El `/inicio` no encuentra su huella y
  dice "el hook no corrió", que es falso. En el analytics se arregló a mano (`resolver … nueva` con un informe de la flota, y `cambios
  aprobar`). (Ítem 11 b.)
- **`barreras` da rojo en Hermes por tres `.pyc` ignorados** en `.claude/hooks/__pycache__/` (19/10 y 26/10): el `/cierre` de Guido
  (`estructura.cjs todo`) va a dar rojo. Medido acá (solo lectura en `D:\Hermes\Hermes.exe`): los escriben (a) las pruebas de Hermes, que
  cargan sus hooks con `importlib.util.spec_from_file_location` (`tests/test_hook_*.py`: Python escribe el caché al importar), y (b) su
  hook propio `py_compile.ps1` (PostToolUse: compila cada `.py` editado; `py_compile` escribe el `.pyc` siempre). Los hooks en sí corren
  con `python -I -B` (no escriben). O sea: **cada worktree de Hermes que corra la suite los vuelve a crear**.
- **La línea `después:` de `adoptar --aplicar` promete algo que no existe**: "lo aprueba Guido después del merge (cambios nuevo + cambios
  aprobar)". `rango()` es `origin/main..HEAD`: pusheado, ningún `/cierre` vuelve a mirar ese commit; y el sello tiene que ser anterior al
  primer commit que toca (`barreras.cjs` ~13). Medido por la sesión "Preparar PC" en el analytics: `candado: en verde (barreras)`.

## Contexto (explorado el 2026-11-04, `Guido-PC-eQ`)

- `docs/` está escrita a mano en **~20 archivos** (`grep` de `'docs/`): `hooks/lib/{inyeccion,candado,barreras,topes,mesa,encargo,
  arbol,todo}.cjs`, `hooks/escritura-docs.cjs` (el segmento `docs`), `scripts/{worktree,todo,noche,estado,mesa,portada,resumen,tiempos,
  encargo}.cjs`, `arquitecto/scripts/arquitecto.cjs` (`docs/modulos/<x>/`), y en `arquitecto-skills`: `lib/adoptar.cjs` (`RUTA_HANDOFF`,
  `RUTA_CHANGELOG`), `actualizar.cjs` (`RUTA_CHANGELOG`), `lib/molde.cjs` (`esDoc`), `lib/catalogo.cjs` (`['docs/', 'docs/']` y la pieza
  `docs`). Más `gitattributes.snippet` (`docs/modulos/**/mesa/** text eol=lf`) y los textos de las skills.
- Los hooks leen la ficha **de git** (`contexto.fichaVigente`: la rama por defecto, `origin` si hay), nunca del disco: una ficha sin
  subir no existe todavía. `cambios.cjs idsFicha` decide qué cambio de la ficha es barrera (`datos-de-prueba:` cuenta siempre que cambia).
- `cambios.cjs` `IGNORADOS_BARRERA` = `.claude/hooks`, `.claude/scripts`, `.githooks` (rf-6 b, SPEC-paquete-2: "un hook ignorado que
  corre tiene que verse"); `ignoradosDeBarrera` los suma a lo pendiente en `barreras.cjs` (~144) y en `rutasPendientes`.
- `adoptar.cjs`: `APRUEBA` (~154) es el texto de la promesa falsa; D3 (`--arranque kit`) saca del settings los SessionStart que no son
  del molde (`settingsElegido` ~1001): el del bot **es** del molde por su comando (`node "$CLAUDE_PROJECT_DIR/.claude/hooks/session-start.cjs"`),
  así que no sale nada y el archivo sigue siendo el viejo. La pieza `hook-arranque` queda `propia` (archivo distinto).
- `actualizar.cjs resolver` pide un informe de fusión (`.claude/fusiones/<pieza>.md`) siempre: sobre una `propia` no hay informe (la flota
  saltea una ficha al día). Es el pendiente 1 de "De D8r.2".

## Pedido original, textual

> **D8r.3 · la `rc.4` exprés: que el bot de Arti se pueda adoptar, y el rojo de los `.pyc`** […] 1. La carpeta de papeles se configura en
> la ficha […] con `docs/` por defecto. […] `adoptar --mirar` tiene que detectarla […] y proponerla; `--aplicar` la toma. 2. Un hook de
> arranque propio con el mismo nombre que el del kit […] tiene que haber un camino que ande en un comando […] 3. `barreras` cuenta `.pyc`
> ignorados como cambios a un freno. […] Conservá la intención de rf-6 b y buscá el arreglo angosto […] 4. El texto de la línea
> "después:" de `adoptar --aplicar` […] Que diga la verdad. 5. Si entra sin agrandar el riesgo: el pendiente 1 de "De D8r.2".
> *(La sesión madre, 2026-11-04.)*

## AGREGA y MODIFICA

Rutas: `molde` = `kit/molde/`, `lib` = `kit/molde/hooks/lib/`, `adoptar` = `kit/skills/arquitecto-skills/scripts/lib/adoptar.cjs`.

### i1 · `carpeta-docs:` en la ficha (la carpeta de papeles)

- **La clave**: `carpeta-docs: arti-docs`, de arriba, opcional; sin ella, `docs`. Un texto con la forma de una ruta relativa con `/`:
  segmentos de `[A-Za-z0-9._-]`, cada uno empieza con letra o número y no termina en `.` (Windows), sin `..`, sin `/` al principio ni al
  final, hasta 80 caracteres. Se acepta `docs` (igual que no ponerla). `ficha.cjs`: a `CONOCIDOS`, su validación (el mensaje sin eco del
  valor) y dos exportados: `RE_CARPETA_DOCS` y `carpetaDocs(datos)` → el valor o `'docs'`. Las dos copias de `ficha.cjs` siguen byte a byte.
- **De dónde se lee**: de la **ficha vigente** (`contexto.fichaVigente`), como todo lo que leen los hooks; sin ficha vigente o rota,
  `docs`. Un módulo nuevo `lib/docs-ruta.cjs` (bajo `.claude/hooks/**`: tocarlo es barrera) con `deDatos(datos)`, `deRaiz(raiz)` (una
  lectura por proceso, guardada) y `rel(carpeta, sub)`. Lo usa **todo** lo que hoy escribe `docs/` a mano en el molde (la lista de
  "Contexto"); `arquitecto.cjs` lee la ficha como ya lo hace (del disco del proyecto) y usa `ficha.carpetaDocs`.
- **El árbol del método vive en la carpeta**: los seis archivos, `modulos/`, `referencia/`, `archive/`, la mesa, la bitácora, el NORTE. Lo
  que **no** se mueve: `.claude/` (la ficha, los cambios, `frenos.log`), el `README.md` de la raíz (la portada enlaza `<carpeta>/NORTE.md`).
- **El hook de escritura y el candado** juzgan la carpeta configurada, no el segmento `docs` (`arbol.juzgarRuta` recibe la carpeta): con
  `arti-docs`, escribir en `docs/` de OpenClaw pasa y un suelto en `arti-docs/` frena.
- **Cambiarla es barrera**: `idsFicha` suma `par('frenos', 'carpeta-docs')` cuando el valor cambia (ponerla, sacarla o cambiarla), como
  `datos-de-prueba:`. Sin esto, mover la carpeta corre la base del rango de `barreras` (`git log -- <carpeta>/SESSION_HANDOFF.md`) y el
  candado miraría otra carpeta. La adopción no paga: la ficha nace (exención b).
- **El arranque lo dice**: con una carpeta que no es `docs`, la cabecera del hook suma `papeles: <carpeta>/ (carpeta-docs de la ficha) —
  donde el método dice docs/, es esta carpeta`. El `/inicio`, el `/cierre` y `NUCLEO.md` dicen una vez "`docs/` es la carpeta de papeles:
  la `carpeta-docs:` de la ficha si la hay (el arranque la nombra)". Los textos no se reescriben ruta por ruta.
- **`gitattributes.snippet`**: la línea de la mesa se escribe con la carpeta al instanciar (`adoptar` y el Modo A).
- **crit. 1**: `ficha.test` acepta `arti-docs` y `a/b-c`, y rechaza `../x`, `/x`, `x/`, `.claude`, `x.`, `a\b` y 81 caracteres, sin eco del
  valor. Una prueba de punta a punta (`docs-ruta.test` o en cada `*.test`) con `carpeta-docs: arti-docs` en la ficha vigente y un `docs/`
  ajeno con archivos sueltos: el arranque inyecta `arti-docs/SESSION_HANDOFF.md` y dice `papeles: arti-docs/`; el candado y `barreras`
  no miran `docs/`; `escritura-docs` deja escribir `docs/x.md` y frena `arti-docs/suelto.md`; `worktree crear`, `todo`, `estado`, `mesa
  nuevo` y `noche` usan `arti-docs/modulos/`. Sin la clave, todo idéntico a la `rc.3` (la suite entera lo dice). `cambios.test`: cambiar
  `carpeta-docs:` en un commit da `frenos:carpeta-docs`.

### i1b · `adoptar --mirar` la detecta y `--aplicar` la toma

- `--mirar`: la carpeta de papeles es la **única** carpeta de la raíz (o de un nivel abajo) que tiene `SESSION_HANDOFF.md` seguido por git.
  Si es `docs/`, nada cambia. Si es otra (`arti-docs/`): la propuesta trae `carpeta-docs: arti-docs` y una línea `papeles: arti-docs/
  (tiene SESSION_HANDOFF.md) — docs/ tiene N archivos y no es del método: queda del proyecto`. Si hay más de una: ninguna en la propuesta,
  y una línea que las nombra y dice cómo elegir. Si no hay ninguna y `docs/` existe con archivos que no son del método (más de los seis y
  las tres carpetas, o un `docs.json`/`mkdocs.yml`/`CNAME`): una línea `papeles: docs/ ya tiene N archivos que no son del método — si es
  de otra cosa, escribí carpeta-docs: <otra> en la propuesta`.
- `--aplicar`: usa la `carpeta-docs:` de la propuesta (la valida la ficha) para escribir las plantillas de la pieza `docs` (`molde.cjs`:
  lo que en el molde está en `docs/` va a `<carpeta>/`; nunca reemplaza), el renglón de la adopción en `<carpeta>/CHANGELOG.md`, el aviso
  del handoff sobre el tope y la línea de la mesa del `.gitattributes`. `actualizar.cjs` (la flota) escribe su renglón en
  `<carpeta>/CHANGELOG.md`.
- **crit. 2**: `adoptar.test` — un repo con `docs/` ajeno (un `docs.json` y 10 archivos) y `arti-docs/SESSION_HANDOFF.md` seguido:
  `--mirar` trae `carpeta-docs: arti-docs` y la línea `papeles:`; `--aplicar` no escribe nada en `docs/` (el `git status` de `docs/`
  vacío) y escribe lo que falta en `arti-docs/`; la ficha aplicada tiene la clave; `barreras --rango` verde en los commits de la adopción.
  Dos carpetas con handoff: ninguna en la propuesta y la línea las nombra. Un repo con `docs/SESSION_HANDOFF.md`: sin la clave, como hoy.

### i2 · El hook de arranque propio con el nombre del del kit

- `--mirar`: si `.claude/hooks/session-start.cjs` existe y no es el del molde, una línea `arranque: tu .claude/hooks/session-start.cjs
  tiene el nombre del hook del kit y es otro — el settings del kit lo corre igual y el /inicio no encuentra su huella` y el bloque `D3`
  aparece (hoy solo sale con un SessionStart de otro comando o un handoff sobre el tope), con la recomendada: `--arranque kit` lo
  reemplaza por el del kit.
- `--aplicar --arranque kit`: además de lo de hoy, **reemplaza el archivo** por el del molde, como `--director kit` con las cuatro de D1:
  la pieza `hook-arranque` queda `molde` con su hash, en el commit de las piezas (es la fábrica: la exención b), y la línea dice
  `hook-arranque · reemplacé el tuyo (D3: kit) — lo tuyo queda en la historia: git show <antes>:.claude/hooks/session-start.cjs`. Sin la
  opción, como hoy (queda `propia`).
- **Un repo ya adoptado con `hook-arranque: propia`** (el camino del analytics, ahora en un comando): ver i5.
- **El `/inicio` sin huella**: "falta la huella: el arranque que corrió no es el del kit, o no corrió — corré doctor; si tu
  `session-start.cjs` es propio: `actualizar.cjs resolver . hook-arranque nueva --por "<por qué>"`", y lee a mano el handoff y el TODO de
  la carpeta de papeles. (El `doctor` no mira el hash del arranque: no entra en esta tanda; la línea del `/inicio` ya da el arreglo.)
- **crit. 3**: `adoptar.test` — un repo con un `session-start.cjs` propio y el settings con el comando del molde: `--mirar` trae la línea
  y `D3`; `--aplicar --arranque kit` deja el archivo igual al del molde, la ficha `hook-arranque: {estado: molde, hash: …}` y `barreras
  --rango` verde en los commits de las piezas y la ficha; sin la opción, el archivo no se toca. `skills.test`: el `/inicio` nombra el
  `resolver … hook-arranque nueva`.

### i3 · `barreras` y el caché de bytecode de Python

- **El arreglo angosto**: `ignoradosDeBarrera` deja afuera un ignorado **solo si** es caché de bytecode de un `.py` seguido:
  `<dir>/__pycache__/<nombre>.<etiqueta>[.opt-1|.opt-2].pyc` (la etiqueta, `[a-z]+-\d+`, p. ej. `cpython-314`), con `<dir>/<nombre>.py`
  **en el índice**, y el `.pyc` con la cabecera de Python 3 por fecha (los 4 bytes de banderas en cero: el modo por defecto; un `.pyc`
  por hash, `unchecked-hash` sobre todo, corre sin mirar el fuente) y de hasta 1 MB. Todo lo demás sigue contando como hoy: un `.pyc`
  suelto al lado del `.py` (Python lo carga sin fuente), uno sin `.py` seguido, un `.pyo`, uno por hash, cualquier otro ignorado.
- **Por qué alcanza (la intención de rf-6 b)**: un `__pycache__/x.<etiqueta>.pyc` por fecha solo lo carga Python al **importar** `x.py`
  y solo si su cabecera coincide con la fecha y el tamaño del `.py`; si no coincide, lo recompila del fuente seguido. Lo que corre es,
  de hecho, el `.py` que `barreras` ya cuida. El caso que queda (alguien que fabrica un `.pyc` con la cabecera calcada) tiene el mismo
  alcance que lo que ya está fuera de la vista de `barreras` para un hook en Python: el `site-packages` y los `.pth` del intérprete o del
  `venv`, ignorados y fuera de `.claude/`. Se escribe como residual en "Lo que esto no cierra".
- **`PYTHONDONTWRITEBYTECODE`**: **no hace falta**. Con la excepción, ningún regenerador traba; y la variable no cubre los dos que
  midió Hermes (`py_compile` escribe igual; la suite de Guido corre fuera del kit). No se toca el ambiente de nadie.
- Lo que siga contando dice qué es: un `.pyc` que no entra en la excepción sale con `(caché de Python: si no lo usa ningún hook,
  borralo: git clean -fX -- <dir>/__pycache__)`.
- `cambios.cjs` se copia byte a byte a `pc/lib/`.
- **crit. 4**: `cambios.test`/`barreras.test` — con `__pycache__/` en `.gitignore`: un `.claude/hooks/__pycache__/h.cpython-314.pyc`
  por fecha con `h.py` seguido → `barreras` verde; el mismo con `h.py` sin seguir, por hash (banderas 1 y 3), al lado (`h.pyc`), `.pyo`,
  de 2 MB o con otro nombre (`h.pyc.sh`) → rojo como hoy; el `.propio.sh` ignorado de rf-6 b sigue rojo. Mutación: sacar cada condición
  de la excepción pone verde algún caso rojo.

### i4 · La línea `después:` dice la verdad

- `APRUEBA` y sus usos (`adoptar` ~154, ~920-925): el rojo de un commit de la adopción (la ficha sin la fábrica en el padre, una pieza no
  de fábrica, los permisos de D2/D3) **es solo en el clon, antes del push**: `barreras` mira `origin/<rama>..HEAD`; después del push
  ningún `/cierre` lo vuelve a mirar, y un aprobado posterior no lo cubre (el sello tiene que ser anterior al primer commit que toca).
  La línea dice eso, y que lo que se decidió queda en el commit y en el renglón del CHANGELOG de la adopción. Sin "después del merge".
- Si en el clon ya hay `githooks` prendidos (no los hay hasta `--traer`), el `pre-push` lo mira: la línea no lo promete; lo verifica la
  prueba.
- **crit. 5**: `adoptar.test` — la línea de cada caso rojo no contiene `después del merge` ni `cambios aprobar` como camino, y dice
  `solo en este clon, antes del push`. La verificación: tras el push al `bare`, `barreras` en la carpeta (`--traer`) sale verde.

### i5 · `resolver . <pieza> nueva` sobre una `propia`, sin informe

- `actualizar.cjs resolver <carpeta> <pieza> nueva --por "<por qué>"`: si la pieza está `propia` en la ficha y **no hay** informe, escribe
  lo del molde de la versión de la ficha (`kit:`; el molde instalado si es esa versión, si no se niega y dice "poné al día primero"),
  pone la pieza en `molde` con su hash, guarda `por:` en el renglón del CHANGELOG (una `molde` no lleva `por:`) e imprime los commits.
  Mismas negativas de hoy: carpeta de un agente, una ruta de la pieza con cambios sin commitear, una pieza que no se actualiza. Las otras
  salidas sin informe siguen negándose (`mezclar`, `quedarse`, `congelar` piden el informe).
- **Si la pieza es de frenos** (`hook-arranque`, `settings`, los porteros…), la línea da el orden verdadero: primero `cambios nuevo` +
  `cambios aprobar` (el sello), después el commit de la pieza — el sello tiene que ser anterior (i4).
- `modo-b.md` B4 y `flota.md`: dicen este camino para traer `director-obrero` (o el arranque) a un repo ya adoptado.
- **crit. 6**: `actualizar.test` — un repo adoptado con `director-obrero: propia` y sin informe: `resolver . director-obrero nueva --por x`
  escribe los archivos del molde, la ficha queda `molde` con hash; con `hook-arranque: propia`, igual y la línea pide el aprobado antes del
  commit; sin `--por`, se niega; con cambios sin commitear en la pieza, se niega sin escribir.

### Lo que trajo el red team (manda sobre lo de arriba)

Una ronda (2026-11-04): 2 ALTOS, 5 MEDIOS, 3 BAJOS, todos integrados.

- **rt-1 (ALTO, i3) · La excepción de los `.pyc` se cae: i3 se rehace.** Los hooks de Hermes **cargan** `bloquear_python_stdin.py` en
  cada corrida con `spec_from_file_location` (`bloquear_git_destructivo.py` ~61-66, `bloquear_metacaracteres_tests.py` ~51): ese
  cargador **lee** `__pycache__/*.pyc` si la cabecera coincide (`-B` apaga la escritura, no la lectura), y la cabecera (por fecha o por
  hash, PEP 552) se calca en cinco líneas: no ata el código al fuente. Un `.pyc` fabricado vaciaría el freno de git de Hermes con
  `barreras` verde. **El arreglo nuevo**: `barreras`, antes de juntar lo pendiente, **borra** los `.pyc` ignorados que están en una carpeta
  `__pycache__` bajo `.claude/hooks`, `.claude/scripts` o `.githooks` (archivos comunes, nunca un enlace; `__pycache__` sin mirar
  mayúsculas) y lo dice en una línea (`borré N cachés de Python ignorados (se rehacen solos): <rutas>`). Un caché borrado se rehace del
  fuente seguido; uno fabricado deja de estar. Si no lo puede borrar, cuenta como hoy (rojo). Todo otro ignorado, como hoy (rf-6 b
  intacta). El residual: un `.pyc` fabricado corre **hasta el próximo `barreras`**, que lo borra y lo nombra. `PYTHONDONTWRITEBYTECODE`
  sigue sin hacer falta. Reemplaza i3 y crit. 4 (abajo, "i3 · el arreglo que va").
- **rt-2 (ALTO, i1) · Sin remoto, el commit que cambia `carpeta-docs:` se sacaba solo del rango.** Sin origin la vigente es `main`: un
  commit X que pone `carpeta-docs: nada` y vacía los `deny` deja a `rango()` sin base (`git log -- nada/SESSION_HANDOFF.md` vacío → solo
  lo pendiente); o X pone `zzz` y un Y crea `zzz/SESSION_HANDOFF.md` y la base es Y. **Arreglo**: sin remoto, la base nunca es posterior
  al último commit que cambió el valor de `carpeta-docs:` (X entra al rango; la ficha que nace con la clave, la adopción, no cuenta: ya la
  cubre `esAdopcion`). Y la clave va **solo en minúsculas** (`Docs` en Windows es `docs` en el disco y otra ruta para git). crit. 1 suma
  los dos casos en `barreras.test`. El rango arranca en X hasta que la clave vuelva a cambiar o haya remoto (dicho en "Lo que esto no cierra").
- **rt-3 (MEDIO, i4) · La línea depende de si hay origin.** Sin origin, `--traer` adelanta la carpeta desde el clon y el rango del primer
  `/cierre` de Guido arranca en el último commit del handoff (anterior a la adopción): los commits rojos caen ahí, no "solo en el clon".
  Y si en el clon arrancó una sesión después de `--arranque kit`, el hook del kit prendió `core.hooksPath` y el `pre-push` frena el push.
  La línea dice cada caso (con origin: rojo solo antes del push; sin origin: lo ve tu primer `/cierre` y un aprobado posterior no lo
  cubre: el sello va antes del commit, o se revierte). crit. 5 suma el caso sin origin y el del `pre-push` prendido.
- **rt-4 (MEDIO, i1b) · `arti-docs/` tiene 8 sueltos en la raíz** (`ARCHITECTURE`, `DECISIONS`, `MODELS`, …): con la clave vigente y el
  candado prendido, `candado:raiz` da rojo (como pasó en Hermes, que se adoptó con `candado: no`). `--mirar` los nombra ("no son de los
  seis: con el candado prendido van a `referencia/`; si no, `candado: no` como en Hermes") y crit. 9 (a) corre `estructura.cjs todo`.
- **rt-5 (MEDIO, i1b) · Un `docs/` ajeno sin la clave en la propuesta**: `--aplicar` **se niega** (no escribe nada) si `docs/` es ajeno
  (tiene `docs.json`, `mkdocs.yml`, `CNAME`, o archivos que no son del método) y la propuesta no trae `carpeta-docs:`; la línea dice cómo
  elegir. crit. 2 lo suma.
- **rt-6 (MEDIO, i3)**: el remedio `git clean -fX` lo niega `git-seguro` (y el freno propio de Hermes): con el borrado de rt-1 ya no hay
  remedio que dar.
- **rt-7 (MEDIO, i5) · El aprobado exacto.** La línea imprime el `cambios nuevo …` entero, con `--toca` y los ids que `barreras` va a pedir
  (salen de `categoriaDe`/`idsSettings` sobre las rutas de la pieza, no de una lista a mano), y el orden: `cambios nuevo` → `cambios
  aprobar` (commit del sello, que solo toca el cambio y `frenos.log`) → el commit de la pieza. La prueba corre ese orden con la pieza
  escrita en el disco y sin commitear mientras se aprueba, y `barreras` sale verde.
- **rt-8 (BAJO, i1) · Lugares que faltaban**: `hooks/session-start.cjs` ~187-198 (el arranque de emergencia, sin `docs-ruta`: lee la
  clave de la ficha del disco con una regex cruda; si no la entiende, `docs`), `inyeccion.cjs` ~131 (`:(exclude)docs`), `encargo.cjs`
  ~122 y ~535 (las citas `docs/modulos`), `adoptar.cjs` ~92 (`NO_MIRAR`), ~219 (el `docs/` salteado al casar el molde v2), ~427-438 (los
  cambios propios buscados en `docs/`), `migrar-cambios.cjs` ~36 (`FUENTE`). Se suman a H, S y A.
- **rt-9 (BAJO, i2) · Lo que hacía el hook propio**: `--mirar` muestra sus primeras líneas de comentario y lo que lee (las rutas que
  nombra) y dice `lo que quieras conservar, a .claude/hooks/session-start.propio.sh (el del kit lo corre)`. Y el porqué del verde: el
  commit de las piezas va **antes** del de la ficha (`barreras.cjs` ~659), no por la exención b; la prueba no afirma la exención b.
- **rt-10 (BAJO, i1) · Bordes**: la validación rechaza los nombres reservados de Windows en cualquier segmento (`con`, `nul`, `aux`,
  `prn`, `com1-9`, `lpt1-9`, con o sin extensión). Con la ficha vigente rota, `docs-ruta` usa la última ficha que se lee (como el
  candado, `barreras.ultimaFichaQueSeLee`). Un `docs` (o una carpeta) que es un enlace a otro lado: igual que hoy con `docs/`, no se
  cubre (no lo agranda esta tanda).

### i3 · el arreglo que va (reemplaza al de arriba, por rt-1)

- `cambios.cjs` (y su copia `pc/lib/`): `limpiarCachePython(raiz)` → `[rel]` borrados: de `git ls-files --others --ignored
  --exclude-standard` bajo `IGNORADOS_BARRERA`, los que terminan en `.pyc` y cuya carpeta madre se llama `__pycache__` (sin mirar
  mayúsculas), `lstat` archivo común; `unlinkSync` cada uno (el que falla no va en la lista y sigue contando). Lo llama `barreras`
  antes de juntar lo pendiente (`rutasPendientes`, `rutasPendientesContra`), y su salida suma la línea `borré N cachés de Python
  ignorados (se rehacen solos del .py seguido): <hasta 5 rutas>…`. `ignoradosDeBarrera` no cambia.
- **crit. 4 (el que va)**: `barreras.test` — con `__pycache__/` en `.gitignore`: `.claude/hooks/__pycache__/h.cpython-314.pyc` (y uno en
  `.githooks/__pycache__/`, y `__PyCache__/` en mayúsculas) → `barreras` verde, el archivo ya no está y la línea lo nombra; un enlace
  llamado así, un `.pyc` suelto al lado (`h.pyc` fuera de `__pycache__`), un `.pyo` y el `.propio.sh` ignorado de rf-6 b → rojo como hoy y
  el archivo sigue; un `.pyc` en `__pycache__` **fuera** de las tres carpetas (en `src/`) no se toca. Mutación: sacar cada condición pone
  verde un caso rojo o borra algo que no debía.

## NO SE TOCA

- Lo que frenan los porteros (`git-seguro`, `niega-aprobar`, `sensible`, `secretos`). La gramática de la ficha salvo la clave nueva.
- D1-D4 y la propuesta por defecto: sin opciones, `--aplicar` hace lo de la `rc.3`.
- El obrero de cierre de tramo, los experimentos y el resto de Pendientes (`rc.5`). Las actas de `tips/` y `_fuente/`.
- Las carpetas reales de Guido (`D:\Hermes\*`, `D:\Arti-*`): solo lectura; las pruebas, en clones del scratchpad.

## Entorno de prueba

Temporales y repos de prueba (`pruebas/rehacer.sh`), canónico `bare` con tag anotado, `--claude no`. Clones del bot y de Hermes **solo**
en el scratchpad (`git clone D:\Arti-bot-eq`, `git clone D:\Hermes\Hermes.exe`), con un `bare` falso de remoto.

## Criterios de aceptación

Los crit. 1 a 6, y: **crit. 7** (ADR-034) los textos dicen lo mismo que el código (`flota.md`, `modo-b.md`, `EQUIPADOR.md`, el `/inicio`,
el `/cierre`, `NUCLEO.md`, el `USO` de `actualizar`); **crit. 8** la suite entera verde y la flota 2.4.2 → rc.3 → rc.4 con canónico `bare`
sale 0; **crit. 9** el chequeo frío: (a) en un clon del bot, `--mirar` (con `--principal`) propone `carpeta-docs: arti-docs` y el D3 →
`--aplicar … --arranque kit` → commits → `barreras --rango` verde → push al `bare` → `--traer` a una segunda copia → el hook de arranque del
kit corre ahí y su salida termina con la huella e inyecta `arti-docs/SESSION_HANDOFF.md`; (b) en un clon de Hermes con los tres `.pyc`
copiados a su `__pycache__/` ignorado, `estructura.cjs todo` sin el rojo de los `.pyc`.

## Decisiones (la vara)

- **D8r3-1 · La clave se llama `carpeta-docs:`** y vale para todo el árbol del método (no solo el handoff): partirlo (handoff acá, módulos
  allá) deja dos lugares para lo mismo. `[coherencia · consistencia]`
- **D8r3-2 · Se lee de la ficha vigente**, no del disco: como el resto de lo que leen los hooks, y para que una sesión no pueda mover lo
  que miran el candado y las barreras editando el disco. Y cambiarla es barrera. `[mejor código]`
- **D8r3-3 · Los textos de las skills no se reescriben ruta por ruta**: una línea en el arranque y una en los rituales ("`docs/` es la
  carpeta de papeles"). Reescribir ~200 menciones rompe los topes de las skills y no cambia lo que hace un script. `[acordarse de menos]`
- **D8r3-4 · `barreras` borra el caché de Python ignorado de las tres carpetas de barrera y lo dice**; todo otro ignorado sigue en rojo
  (rf-6 b intacta). No hay excepción (rt-1: los hooks de Hermes leen ese caché) ni `PYTHONDONTWRITEBYTECODE`. `[mejor código · coherencia]`
- **D8r3-5 · `--arranque kit` reemplaza el archivo con el mismo nombre**, como `--director kit`: un comando, y lo tuyo en la historia.
  `[workflow]`
- **D8r3-6 · El pendiente 1 de "De D8r.2" entra** (i5): es el mismo camino que pedía el analytics para el arranque. `[workflow]`
- **D8r3-7 · Esta tanda es la `rc.4`; D8c.1 pasa a la `rc.5`** (decisión de la sesión madre). `[workflow]`

## Lo que esto no cierra

- **Residual de i3** (rt-1): un `.pyc` fabricado bajo `.claude/hooks/__pycache__/` corre hasta el próximo `barreras`, que lo borra y
  lo nombra en una línea (antes lo decía en rojo y quedaba).
- **Residual de rt-2**: en un repo **sin remoto** que cambió `carpeta-docs:` después de adoptar, el rango de `barreras` arranca en ese
  commit hasta que la clave vuelva a cambiar o haya remoto (más commits por `/cierre`, nunca menos).
- Los textos que nombran `docs/…` en las skills y los manuales siguen diciendo `docs/` (D8r3-3).
- La adopción real del bot y la flota a los repos de Guido: las propone la sesión madre.

## Los encargos (el director reparte, lee cada diff y corre las pruebas de cada uno)

Presupuesto (ADR-029): ~7 → RT, **cuatro de trabajo**, el chequeo frío. Cada uno en `scratchpad/<x>/wt`. La clave en `ficha.cjs`, sus
copias y `lib/docs-ruta.cjs` los escribe el director primero (todos los demás dependen de eso). Los textos, el director al final.

| # | Encargo | Puede tocar | Prueba |
|---|---|---|---|
| RT | Red team, una ronda (sobre todo i1 e i3) | — | — |
| H | i1 en `hooks/`: `inyeccion`, `candado`, `barreras`, `topes`, `mesa`, `encargo`, `arbol`, `todo` (lib), `escritura-docs`, `idsFicha` | `kit/molde/hooks/**`, sus pruebas | crit. 1 (la mitad de los hooks) |
| S | i1 en los scripts: `worktree`, `todo`, `noche`, `estado`, `mesa`, `portada`, `resumen`, `tiempos`, `encargo`, `arquitecto.cjs` | `kit/molde/scripts/**`, `kit/skills/arquitecto/scripts/**`, sus pruebas | crit. 1 (la mitad de los scripts) |
| A | i1b, i2, i4, i5 | `adoptar.cjs`, `actualizar.cjs`, `lib/molde.cjs`, `lib/catalogo.cjs`, `doctor.cjs`, sus pruebas | crit. 2, 3, 5, 6 |
| P | i3 | `lib/cambios.cjs` (`ignoradosDeBarrera`) y su copia, `barreras.cjs` (el texto), sus pruebas | crit. 4 |
| CF | Chequeo frío (crit. 9) | — | — |

**Orden**: base (director) → RT → H ∥ S ∥ A ∥ P (H y P tocan `cambios.cjs` en funciones distintas: se mergea P y después H) → textos →
CF → suite → la flota.

## Ejecución

Un director Opus (D8r.3), este delta, una ronda de red team y un chequeo frío; el cómo, en [`PLAN-construccion.md`](PLAN-construccion.md).
