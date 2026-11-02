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
- Solo lectura. Es el adaptador de ejemplo (lee las fichas `.claude/kit.md` de los repos clonados en esa carpeta); el registro de la empresa es capa privada y no entra acá.

**"Poné al día X"** / "poné al día la flota" — derivás al Equipador (D6-13): primera línea `la flota: te paso al Equipador` e invocás **`/arquitecto-skills`**, que corre el script. Vos no tocás `X` ni abrís spec.
- `node "$HOME/.claude/skills/arquitecto-skills/scripts/actualizar.cjs" flota <X>… | todo --canon <url del repo canónico> [--proyectos <carpeta>]` (sin `--tag`: el último tag anotado).
- Qué se repite en la flota (D7): `node "$HOME/.claude/skills/arquitecto-skills/scripts/cambios-flota.cjs" [--proyectos <carpeta>]` imprime la tabla del ciclo (qué regla anotada pasa a 3+ proyectos o es cicatriz grave); con `--urgentes`, solo los cambios urgentes vivos. Solo lectura.
- Muestra la tabla y "te espera:". Una sesión en `auto` puede no tener permiso para pushear: si el clasificador la frena, la línea la corre Guido en su terminal (nunca en bypass).
- Piezas adaptadas (D6-19): con porqué se fusionan solas; sin porqué quedan en `.claude/fusiones/` del proyecto y la próxima sesión ahí (`/inicio`) le hace **una** pregunta al dueño.

**"Adoptá X"** (un repo v2 sin ficha: se adopta, no se actualiza) — también deriva al Equipador, que corre:
1. `… actualizar.cjs adoptar <carpeta> --kit <raíz de un clon del kit> --mirar --propuesta <archivo fuera del repo>` — no cambia nada.
2. A partir del comentario de la propuesta, la sesión arma con Guido delante **la pantalla** (D6-12): NORTE, MAPA, el plano de `docs/` y las reglas propias como cambios, cada uno con su `chico:`.
3. Con el OK, en un clon con `.kit-rol` = `actualizador`: `… adoptar <clon> --kit <…> --aplicar <archivo>`, los **dos** commits que imprime (piezas, ficha), `node .claude/scripts/estructura.cjs barreras --rango <antes>..HEAD` verde y push (`chequear`: desde la primera flota).
4. Dentro de ese mismo OK, ya con los scripts y la ficha puestos, la portada (cero preguntas nuevas): `node .claude/scripts/portada.cjs armar` (con `--banner` si es de la empresa y `estandar`), `piezas.portada: sí` en la ficha y un commit más.

## Lo que no entra por esta puerta

- **El ecosistema** ("¿qué tenemos y cómo se cruza?"): es del Hub (ADR-024). Una línea que lo dice.
- **El relevamiento** (un pedido que vino de otra persona y hay que relevar antes de diseñar): `/relevamiento`. Una línea y a su puerta.
