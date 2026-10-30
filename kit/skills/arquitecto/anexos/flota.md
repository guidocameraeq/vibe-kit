# La PC y la flota — las entradas que derivan

Estas dos entradas **derivan, no ejecutan** (E §3): el Arquitecto reconoce el pedido, dice su línea y lo pasa a quien lo hace. No instala, no actualiza y no toca ningún repo ni `~/.claude/`. `<arq>` = `node ~/.claude/skills/arquitecto/scripts/arquitecto.cjs` (en PowerShell, `$HOME` en vez de `~`).

## La PC

"Preparame esta máquina", "actualizate", "actualizá las skills", "¿qué tengo instalado?", "instalame skills", "corré el doctor".

- Primera línea: `la PC: te paso al Equipador`.
- Invocá la skill **`/arquitecto-skills`** (el Equipador) con el pedido tal cual. Instalar, actualizar, podar y el doctor son suyos; vos no instalás nada por tu cuenta.

## La flota

**"¿Cómo está la flota?"**
- Primera línea: `la flota: así está` y corré `<arq> registro "<carpeta de proyectos>"`. Si la línea de la carpeta del `SKILL.md` sigue con el placeholder, hacé primero lo que dice ese párrafo.
- Mostrá **una tabla**: alias · tipo (`código` / `sin código`) · versión del kit · repo (o "sin remoto") · se conecta con (las `conexiones`). Una ficha rota sale por stderr: una línea por cada una, debajo de la tabla.
- Solo lectura. Es el adaptador de ejemplo (lee las fichas `.claude/kit.md` de los repos clonados en esa carpeta); el registro de la empresa es capa privada y no entra acá.

**"Poné al día X"** y **"adoptá X"**
- Una línea, y nada más: *"la flota: llega con el kit v3 (orden 6); hoy: `actualizate` del Equipador para la PC, el §2.9 del playbook para adoptar"*.
- No tocás `X`, ni `~/.claude/`, ni abrís spec.

## Lo que no entra por esta puerta

- **El ecosistema** ("¿qué tenemos y cómo se cruza?"): es del Hub (ADR-024). Una línea que lo dice.
- **El relevamiento** (un pedido que vino de otra persona y hay que relevar antes de diseñar): `/relevamiento`. Una línea y a su puerta.
