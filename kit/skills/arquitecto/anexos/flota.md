# La PC y la flota — las entradas que derivan

Estas dos entradas **derivan, no ejecutan** (E §3): el Arquitecto reconoce el pedido, dice su línea y lo pasa a quien lo hace. No instala, no actualiza y no toca ningún repo ni `~/.claude/`. `<arq>` = `node "$HOME/.claude/skills/arquitecto/scripts/arquitecto.cjs"` (anda igual en Bash y en PowerShell).

## La PC

"Preparame esta máquina", "actualizate", "actualizá las skills", "¿qué tengo instalado?", "instalame skills", "corré el doctor".

- Primera línea: `la PC: te paso al Equipador`.
- Invocá la skill **`/arquitecto-skills`** (el Equipador) con el pedido tal cual. Instalar, actualizar, podar y el doctor son suyos; vos no instalás nada por tu cuenta.

## La flota

**"¿Cómo está la flota?"**
- Primera línea: `la flota: así está` y corré `<arq> registro "<carpeta de proyectos>"`. Si la línea de la carpeta del `SKILL.md` sigue con el placeholder, hacé primero lo que dice ese párrafo.
- Mostrá **una tabla**: alias · tipo (`código` / `sin código`) · versión del kit · repo (o "sin remoto") · se conecta con (las `conexiones`). Una ficha rota sale por stderr: una línea por cada una, debajo de la tabla.
- Solo lectura. Es el adaptador de ejemplo (lee las fichas `.claude/kit.md` de los repos de esa carpeta, hasta dos niveles: una fila por repo, el checkout principal, nunca un worktree; si salen las líneas "solo worktrees de …" o "dos clones del mismo origin", decilas tal cual); el registro de la empresa es capa privada y no entra acá.

**"Poné al día X"** / "poné al día la flota" — derivás al Equipador (D6-13): primera línea `la flota: te paso al Equipador` e invocás **`/arquitecto-skills`**, que corre el script. Vos no tocás `X` ni abrís spec.
- `node "$HOME/.claude/skills/arquitecto-skills/scripts/actualizar.cjs" flota <X>… | todo --canon <url del repo canónico> [--proyectos <carpeta>]` (`<X>`: la carpeta de `--proyectos` —`Hermes/Hermes.exe` o `Hermes.exe`— o su `vars.proyecto`; sin `--tag`: el último tag anotado, **rc incluido**, a todo proyecto con ficha; para repartir solo una versión final (sin beta), `--tag v<X.Y.Z>`).
- Qué se repite en la flota (D7): `node "$HOME/.claude/skills/arquitecto-skills/scripts/cambios-flota.cjs" [--proyectos <carpeta>]` imprime la tabla del ciclo (qué regla anotada pasa a 3+ proyectos o es cicatriz grave); con `--urgentes`, solo los cambios urgentes vivos. Solo lectura.
- Muestra la tabla y "te espera:". Una sesión en `auto` puede no tener permiso para pushear: si el clasificador la frena, la línea la corre Guido en su terminal (nunca en bypass).
- Un repo `salteado` por obra en curso es uno con ramas `modulo/*` del remoto **sin mezclar** en su rama por defecto (las mezcladas no cuentan); si la mezcló con squash en GitHub, la línea dice la salida: borrar la rama desde la web. **Con obra, la opción es de Guido** (lo
  pidió así, 2026-11-04): el Equipador se la ofrece y recomienda esperar; si insiste, `--con-obra` actualiza `main` y prueba, en el clon y
  sin subir nada, traer `main` a cada `modulo/*` viva; la flota nunca sube a una rama de módulo. Lo trae el director con
  `worktree.cjs traer-main <x>`, que aborta si choca o da rojo.
- Piezas adaptadas (D6-19; 8r §3): con porqué y una mezcla limpia se fusionan solas; sin porqué, "te espera" en `.claude/fusiones/<pieza>.md`. **La mezcla que choca nunca se resuelve sola** (también sin `por:`): "te espera" con el motivo `la mezcla chocó…` (si hay `claude`, deja su propuesta en el informe, sin aplicarla). Al abrir la pregunta (el `/inicio` del proyecto, o vos si te la traen), **preguntá siempre**, de a una y charlando: en criollo, qué skill es, por qué la había adaptado (su `por:`), qué trae la nueva (`## Qué dice el kit` y el cambio del molde) y dónde chocan (`## Dónde chocan`); una recomendación con criterio (la vara del ADR-030: ¿lo nuevo vale la pena frente a su porqué?) y las cuatro salidas, la recomendada primera: **mezclar · quedarse con la tuya (`quedarse`) · tomar la nueva · congelar** (esta no en una pieza de frenos). Lo que elija lo escribe `actualizar.cjs resolver . <pieza> <salida> --por "<lo que dijo>"`.

**"Adoptá X"** (un repo v2 sin ficha: se adopta, no se actualiza) — también deriva al Equipador, que corre:
0. **La PC al día primero**: `… actualizar.cjs ultimo-tag <clon del kit>` contra `~/.claude/VERSION`; si el tag es más nuevo, la PC está atrás: primero "actualizate" (si no, el repo nace con el molde viejo). `--mirar` lo avisa igual, con la línea `⚠ el --kit tiene el tag …`.
1. **De dónde sale el clon**: `git clone --quiet "<el origin de la carpeta de Guido>" "<tmp>/<nombre>"` (sin remoto, de la carpeta misma), con `.kit-rol` = `actualizador` y `.kit-rol` en `<clon>/.git/info/exclude`. Después `… actualizar.cjs adoptar <clon> --kit <raíz de un clon del kit parado en v<~/.claude/VERSION>> --mirar --principal <la carpeta de Guido> --propuesta <archivo fuera del repo>` — no cambia nada; `--principal` le da a la ficha el nombre de su carpeta (`vars.proyecto`: de ahí sale el almacén de `cargar-secreto`).
2. **La pantalla, con Guido delante** (D6-12), a partir del comentario de la propuesta: NORTE, MAPA, el plano de `docs/` y las reglas propias como cambios, cada uno con su `chico:`; y además, de a una y con la recomendada primero, lo que el comentario trae:
   - **`comandos: setup … · test …`**: se los mostrás (en Python van con el `.venv` de cada worktree, nunca el pip global).
   - **`entornos: ninguno declarado`**: preguntale cada base y su clase (`real` · `prueba` · `dummy`) y escribilas en la propuesta (`entornos:`, como en el ejemplo que imprime); sin declararla, la base de prueba cuenta como real. Lo mismo `herramientas:` (nunca el `db ping` del ejemplo).
   - **`D1`** (hay un director, `/inicio` o `/cierre` propios: `director-obrero`, `estado`, `inicio`, `cierre` en `propia`): (A, la recomendada) los del kit, con `--director kit`; (B) los suyos, sin la opción (el módulo arranca solo).
   - **`D2`** (lo que se va del `settings.json` y los `ask` que frenan al director) y **`D3`** (un SessionStart propio, un `session-start.cjs` propio con el nombre del del kit, un handoff que pasa el tope): la recomendada con `--permisos recomendada` y `--arranque kit` (con el mismo nombre, reemplaza el archivo por el del kit; lo que valga del suyo, a `session-start.propio.sh`, como dice la línea); la otra, sin la opción.
   - **`papeles:`** (la carpeta de papeles no es `docs/`, o `docs/` es de otra cosa, como el sitio de OpenClaw del bot): la propuesta trae `carpeta-docs: <carpeta>`; si hay dos o ninguna, elegila con él y escribila. Sin la clave y con un `docs/` ajeno, `--aplicar` se niega. Los sueltos de la raíz de esa carpeta que no son de los seis: `candado: no` como en Hermes, o a `referencia/`.
   - **`D4`** (las cinco de `sensible:` en no): lo que elija va en la propuesta (`datos-reales:` con la lista de comandos, nunca `sí`).
   - **`config local ignorada`**: con su OK, el `.worktreeinclude` que imprime.
3. Con el OK, en el clon:
   - `… adoptar <clon> --kit <…> --aplicar <archivo> --principal <la carpeta de Guido>` y las opciones que eligió (`--director kit`, `--permisos recomendada`, `--arranque kit`, `--claude-md` si dijo que sí a sumar "El tamaño del pedido"). No toca su carpeta: la valida y la última línea dice el `--traer`.
   - Los commits que imprime, tal cual (piezas, ficha y, con `--permisos`/`--arranque`, el de los permisos), y la línea `después:` (`node .claude/scripts/estructura.cjs barreras --rango <antes>..HEAD`): lo que diga rojo (la ficha o los permisos que no son de fábrica) no se aprueba después: el sello tiene que ser anterior al commit. Con origin, el rojo es solo en el clon, antes del push (después ningún `/cierre` lo vuelve a mirar); sin origin, lo ve el primer `/cierre` de Guido. La línea dice cuál y qué hacer; se lo contás así.
   - **Un repo ya adoptado con una pieza en `propia`** que Guido quiere del kit (`director-obrero`, `hook-arranque`): `… actualizar.cjs resolver . <pieza> nueva --kit <un clon del kit en la versión de la ficha> --por "<por qué>"` en su carpeta (el Equipador arma el clon como en la adopción); si es de frenos, la línea da el `cambios nuevo` exacto y el orden (aprobado primero, después el commit de la pieza).
   - Los otros dos cambios, dentro del mismo OK y ya con la ficha: el director/obrero propio del `CLAUDE.md` lo cambia la sesión **a mano** por un puntero a `/director` y `/obrero` (D8r-6), en un commit propio; y si hay registro de cambios propio, `node "$HOME/.claude/skills/arquitecto-skills/scripts/migrar-cambios.cjs" --repo <clon> [--fuente <archivo>] --plan` (se lo mostrás), después lo mismo con `--commit`.
   - La portada (cero preguntas nuevas): `node .claude/scripts/portada.cjs armar`; `piezas.portada: sí` en la ficha **solo si** `armar` salió 0 o `node .claude/scripts/portada.cjs chequear` da 0, y un commit más. Si no (un README propio que `armar` no pisa), la portada queda apagada y al dueño una línea: "portada: README propio, queda apagada".
   - El push del clon a origin (sin remoto, nada).
4. **Cómo vuelve**, el último paso: `… adoptar <clon> --traer <la carpeta de Guido>`. Trae lo adoptado (`fetch` y `merge --ff-only`, solo si su carpeta está limpia y en la rama del clon, y solo si el push llegó) y **después** prende los githooks ahí (`core.hooksPath` = `.githooks`; la línea `githooks ·` dice cómo quedó). Si no puede, no toca nada y la línea dice qué correr; si dice `en tu carpeta, una vez: <setup>`, corrélo ahí (el `sello` corre `comando-test` en su carpeta). Después, borrá `<tmp>`.

## Lo que no entra por esta puerta

- **El ecosistema** ("¿qué tenemos y cómo se cruza?"): es del Hub (ADR-024). Una línea que lo dice.
- **El relevamiento** (un pedido que vino de otra persona y hay que relevar antes de diseñar): `/relevamiento`. Una línea y a su puerta.
