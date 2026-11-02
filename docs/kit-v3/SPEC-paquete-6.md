# SPEC delta: paquete 6 — el Equipador v3, el `doctor` completo, el actualizador y el adoptador — vibe-kit
Una PC nueva queda lista con un pedido y una pregunta; el `doctor` dice qué falta y cómo se arregla, igual en dos corridas; y "poné al
día la flota" la corre un script de node que no pisa lo propio, chequea todo antes de mezclar y devuelve una tabla. Nadie corre en bypass.
- Estado: **READY — sellado sin Guido (provisorio)**, 2026-11-02, por el director D6.1, después de la ronda única del red team con sus
  6 ALTOS integrados. Guido lo repasa al volver; todo se deshace antes del tag
- Fecha: 2026-11-02 · Misión: 5, director **D6.1**, sin Guido (tracker, "Abrir D6.1 sin Guido"; la vara: ADR-030; el presupuesto: ADR-029)
- Plano: [`SPEC-0-kit-v3.md`](SPEC-0-kit-v3.md), orden 6 = **P2.2, P2.3 (el `doctor` completo), P2.4, P7.1, P7.2**; criterios del kit 1, 9,
  10 y 20; los ⚠️ "mezcla a `main` sin preguntar", "corren en bypass", "lo privado va aparte" y `crossSessionInbound`; NO VERIFICADO "bloque
  `autoMode`" y "adaptador local del registro". Del tracker, **"Paquete 6 · de D4.1"**, **"de D2.2 (F4)"**, **"6/7 · de D2.2"** y lo que sirva
  de **"de D5.2 y D5.3"**. Diseño: E §4-§10 · F §14 · G §10, §15 · A §3-§4, §9.
- Sello del Arquitecto: `arquitecto: 2026-11-02 · kit 2.4.3 · chequeos: tamaño — (paquete del método) · entorno — (sin ficha del kit) · tope ⚠️ (41,7 KB y 21 criterios; no partir: D6.1: partido en dos directores adentro) · hash 2674e101fae2`
- Red team: **obligatorio** (RF-16: el actualizador escribe `settings` y hooks de diez repos; "preparame esta PC" escribe el `settings.json`
  de la PC), Opus con `redteam-spec`, **una ronda** (ADR-029). Revisor frío Opus al cerrar cada director, una vuelta, hasta 10 hallazgos con
  su escenario del día normal.

## Por qué (el dolor)

La flota se pone al día a mano y envejece (Portal con una copia del Arquitecto adentro, E §3; ningún número de versión, P13); estrenar
una PC costó ~35 min en Windows (G §15). Y el plano pedía el actualizador **en bypass**, que el clasificador de `auto` frena (D4.2-2).

## Contexto (explorado el 2026-11-02)

- **El Equipador** (`kit/skills/arquitecto-skills/`): `SKILL.md` (10,2 KB, seis modos); `scripts/instalar-hooks-pc.cjs` (`--home`, `--plan`,
  `--quitar`, `--sacar-viejo`; merge por regla del `~/.claude/settings.json`, escritura atómica con relectura); `scripts/doctor.cjs` (el
  mínimo: 14 ids en orden fijo, `✓|✗|⚠ <id> · qué · cómo se arregla`, solo lectura, `--home`); `pc/` (`cargar-secreto`, y `pc/lib/` = copia
  byte a byte de `molde/hooks/lib/`).
- **El molde** (`kit/molde/`): `hooks/lib/ficha.cjs` (el parser) y `zona-propia.cjs` (`mezclarTexto`, `hashPieza`, `mezclarSettings`,
  `textoSettings`); `scripts/estructura.cjs barreras --rango … --molde <dir> --molde-viejo <dir>` (D3.3, G6b). **No hay un catálogo pieza →
  archivos**: lo sabe solo `rehacer.sh`, cuyos pasos "orden 2, 2b, 3" son **un actualizador a mano** congelado en bash.
- **El molde v2** (tag `v2.4.2`) tiene otra forma: `templates/universales/` del Arquitecto; `rehacer.sh` lo instancia con 13 marcadores.
- **El registro**: `arquitecto.cjs registro <carpeta>` es el adaptador local; `flota.md` da una línea para "poné al día X" y "adoptá X".
  `kit-sync.sh` copia 4 skills, el agente y `VERSION`, y conserva la línea de la carpeta de proyectos del `SKILL.md` del Arquitecto.
- **Los repos de prueba** (`../vibe-kit-pruebas/`): `alfa` y `beta` = `v2.4.2` + ficha + los pasos "orden 2, 2b, 3" (la ficha sigue diciendo
  `kit: 2.4.2`); `gama` pura del tag; `rehacer.sh --solo-tag` arma los tres puros. Remotos `bare` en `remotos/`.
- **La plataforma** (medida): `claude -p --permission-mode bypassPermissions` lanzado por una sesión en `auto` → frenado; con `acceptEdits` y
  un `--allowedTools` corto → pasa (D4.2-2). En `-p` sin confianza se ignora el `settings.json` **commiteado**; aplican el `settings.local.json`
  no trackeado, las `deny` y los hooks (D2.2). Las `deny` con `Write(...)` no frenan nada (W0, D5.2).
- **El githook choca con el actualizador** (encontrado al explorar): el pre-commit corre `barreras --indice` **sin** `--molde`, y el pre-push
  corre además el candado de la ref vigente: el commit del molde nuevo da rojo. `rehacer.sh` no pone `core.hooksPath`. Ver D6-6.

## Los dos directores

**D6.1 = la PC y el núcleo del actualizador** (lo que se prueba en una carpeta, sin remotos ni mezcla): **P2.2** "preparame esta PC" · **P2.3**
el `doctor` completo y el modo flota · **P2.4** · de **P7.1** el catálogo, `aplicar` (pieza por pieza, con tres de las cuatro de Pendientes: `core.hooksPath` va con `flota`, r1-5) y el
**chequeo mecánico completo**. Así se cumple el ⚠️ del SPEC-0: **el chequeo se construye antes que la mezcla**.

**D6.2 = la flota de punta a punta**: de **P7.1** el resto (clon temporal, tag, rama `kit/v*`, saltear, `core.hooksPath` y githooks en el clon, mezcla, push,
`main` protegido, `gh` sin red, la tabla, "toda la flota") y **la fusión `adaptada`** · **P7.2** el adoptador · `cargar-secreto` en un
worktree · `flota.md` y el `SKILL.md` del Equipador · la nota de migración de 3.0.0. Las dos mitades leen este delta; D6.2 no escribe otro.

## Dónde vive cada pieza

| Pieza | En el kit | En la PC | Quién la corre |
|---|---|---|---|
| "Preparame esta PC" | `kit/skills/arquitecto-skills/scripts/preparar-pc.cjs` | `~/.claude/skills/arquitecto-skills/scripts/` | el Equipador (en una PC sin kit, desde un clon) |
| `doctor` completo | `…/scripts/doctor.cjs` (crece) | ídem | el Equipador, Guido |
| El archivo de la PC | — | `~/.claude/kit-pc.md` | lo escribe `preparar-pc`; lo lee `doctor` |
| Actualizador y adoptador | `…/scripts/actualizar.cjs` + `scripts/lib/{catalogo,molde,chequeo}.cjs` | ídem | el Equipador; el Arquitecto deriva (D6-13) |

## AGREGA

### P2.2 · "Preparame esta PC" (E §8, §10; F §14; G §10, §15)

```
node <eq>/scripts/preparar-pc.cjs --kit <raíz del kit> [--home <dir>] [--proyectos <carpeta>] [--plan] [--flota] [--pisar-editados]
```
`--kit` = la raíz de un clon del kit **con sus tags, parado en un tag** (en una PC sin kit, la línea del `SKILL.md`: `git clone` a un temporal y
`node <tmp>/kit/skills/arquitecto-skills/scripts/preparar-pc.cjs --kit <tmp>`). Salidas: 0 · 1 · 2. Sin `--home`, el `~/.claude/` real; **las
pruebas siempre con uno falso**. En orden, y **todo el plan antes de escribir nada**:

1. **Chequea, no instala programas** (D6-17): node ≥ 20, git, `gh` (y su cuenta), gitleaks ≥ 8.19.0, Claude Code ≥ 2.1.295 (el `MIN_CLAUDE` de
   `doctor`; cubre `onFailure: "block"` y el 2.1.234 de Windows). Lo que falta → la línea para instalarlo (`winget …`) y **sigue**.
2. **El kit**: las 4 skills, `agents/redteam-spec.md` y `VERSION` a `<home>/.claude/`, como `kit-sync sync` (conserva la carpeta de
   proyectos). **Un archivo editado a mano** (distinto de **toda** versión de ese archivo en la historia del kit, en LF y sin la línea de la
   carpeta; r1-7) **no se pisa**: va al plan; se pisa solo con `--pisar-editados` (Guido vio el diff). Con `--flota`, se saltea y se informa,
   sin preguntar (P2.3, E §10). `--kit` fuera de un tag anotado `v*` → 1 (las pruebas usan `--kit-sin-tag`, solo con `--home`).
3. **Los hooks por PC**: el plan de `instalar-hooks-pc.cjs` (su lógica, exportada; no se duplica), con el mismo `--home` y `--plan`.
4. **El `settings.json` de la PC, regla por regla** (el mismo lector sin duplicados; **los planes del paso 3 y este, juntos, en una sola
   escritura** atómica con relectura y 3 reintentos ante `EPERM`/`EBUSY` en el renombre; r1-12):
   - `crossSessionInbound: "accept"` (G §10.3): si falta, lo pone y lo dice; **si dice otra cosa, no lo toca** y avisa (D6-4).
   - **El bloque `autoMode`** (F §14 pieza 3; E §10): generado de las fichas de `--proyectos` (por el adaptador local, `arquitecto.cjs
     registro`): por cada entorno `clase: dummy` o `prueba`, una entrada `"<proyecto>: <entorno> (<clase>): <acceso>"` en
     `autoMode.environment`. **El kit es dueño solo de las entradas que escribió**, listadas en `kit-pc.md`: saca esas, pone las nuevas y
     reescribe la lista; **las demás no se tocan**, y una entrada del kit que Guido editó deja de ser del kit (queda como suya). **Si la lista
     no existe, se crea con `"$defaults"` primero**; `"$defaults"` nunca es del kit ni se saca (r1-1: una lista sin él reemplaza los defaults,
     entre ellos "Trusted repo" y "Source control"; `auto-mode-config`). La forma exacta se verifica contra la doc, con la cita (E1).
5. **La capa privada** (⚠️ SPEC-0 "lo privado va aparte"; E §9): `kit-pc.md` puede nombrar `privada: <carpeta>`; si trae `instalar.cjs`,
   corre `node <carpeta>/instalar.cjs --home <home> [--plan]` (con `--plan` se le pasa; plazo 2 min) y su salida va a la tabla; `instalar.cjs
   --variables` da los nombres de sus variables, uno por renglón (los mira `doctor`; r1-11). **Si no hay**: "capa privada: no
   hay — instalé solo lo público", salida 0. La credencial del Hub **nunca** pasa por el kit (va en una variable de entorno del sistema; E §9).
6. **El archivo de la PC** (`<home>/.claude/kit-pc.md`; G §15.3; D6-3): cabecera con la gramática de la ficha (la lee `pc/lib/ficha.cjs`
   `leerCabecera`): `entorno: nativo | wsl` · `gh: <cuenta>` · `proyectos: <carpeta>` · `privada: <carpeta> | no` · `auto-mode: [<entrada>, …]`.
   Fuera de `kit-sync` (no es del kit). La carpeta de proyectos se escribe en los dos lugares (acá y la línea del `SKILL.md`).
7. **La tabla final** (una línea por paso, `✓|✗|⚠ <paso> · qué · cómo se arregla`) y, sin `--plan`, **corre `doctor`** y pega su salida.
   Termina con "reiniciá Claude Code" (G §15.4).

**La pregunta, una sola** (E §10, D6-2): la skill corre `--plan` y, en **un** `AskUserQuestion`, muestra el plan, lo editado a mano con su
diff y la carpeta detectada ("¿Lo aplico, con los proyectos en `<carpeta>`?"). Sí → sin `--plan` (y con `--pisar-editados` si había).

### P2.3 · El `doctor` completo y el modo flota (E §8, §10; A §9; F §14; RF-1, RF-5)

Mismo contrato que el mínimo (solo lectura, orden fijo, `--home`, externos con plazo y en paralelo, **igual en dos corridas**, salida 1 solo
con un ✗). **Sin red o sin poder correr un externo → ⚠ "NO VERIFICADO: <por qué>", nunca ✓.** Suma, después de los 14 de hoy:

| id | ✓ cuando | si no (y cómo se arregla) |
|---|---|---|
| `version-kit` | `~/.claude/VERSION` = la del último tag `v*` anotado del canónico (`git ls-remote --tags`, 20 s) | ⚠ "atrás: decile al Equipador `actualizate`"; sin `VERSION` ✗ |
| `kit-sync` | parado en vibe-kit: `kit-sync.sh` LIMPIO (con `--home`, con `HOME` = ese home); en otro repo: ✓ "no aplica" (r1-9) | ✗ con la primera ruta sucia |
| `githooks` | sin `.githooks/` en el repo, o `core.hooksPath` = `.githooks` (D6-18) | ⚠ "`git config core.hooksPath .githooks`" |
| `archivo-pc` | `kit-pc.md` se lee y su carpeta = la del `SKILL.md` del Arquitecto | ⚠ "corré preparame esta PC" |
| `credencial` | sin capa privada: ✓ "no aplica"; con ella, cada variable de `instalar.cjs --variables` existe (sin imprimir el valor) | ⚠ |
| `gh-push` | `gh` logueado y `gh api repos/<o>/<r> --jq .permissions.push` = `true` para el `origin` del repo donde se corre | ⚠ |
| `mesa-gh` | `gh` lee cada repo de la `mesa:` de la ficha (G §10.4) | ⚠ "pedile acceso a <aprueba>" |
| `cross-session` | `crossSessionInbound` = `accept` | ⚠ |
| `automode` | el bloque que generaría `preparar-pc` hoy = el escrito (las entradas del kit) | ⚠ "una ficha cambió: corré preparame esta PC" |
| `copias-kit` | ningún repo de la carpeta de proyectos trae `.claude/skills/{arquitecto,arquitecto-skills}` adentro | ⚠ con la lista |
| `frenos-vencidos` | ningún `frenos.quitados` con `hasta:` pasado o sin `hasta:` en la ficha del repo | ⚠ "¿lo restauro o lo hago permanente?" (F §14) |
| `regla-tamano` | el `CLAUDE.md` del repo trae el título de la sección del tamaño del pedido del molde | ⚠ "el actualizador no toca el `CLAUDE.md`: pegala del molde" |

**El inventario de frenos** (A §9; formato fijo, debajo de los chequeos; nunca cambia la salida): con ficha, una línea por freno que aparece
en `.claude/frenos.log` **o** en la lista de fábrica, ordenadas por id: `inventario · <id> · <corrector|pregunta> · frenó <N> · molestó <M>`.
**La clase sale del id** (tabla fija: `pregunta:*` y `hook:sensible/*` → pregunta; lo demás, corrector). **Molestó** (D6-9): una pregunta
molesta cada vez (A §3: molesta a Guido); un corrector molesta cuando **el mismo id, rama y detalle se repite en ≤ 10 min** (la alternativa
no le alcanzó al agente). Después, `inventario · ask propia · <regla> · no está en las 5 de A: ¿pregunta o corrector?` por cada `ask` del
`settings.json` del repo que no trae el molde. Sin `frenos.log`: `inventario · sin frenadas`. Sin fechas ni horas en la salida.

**El modo flota del Equipador** (E §10): es `--flota` de `preparar-pc` (no pregunta, saltea lo editado a mano y lo informa); lo usa D6.2.

### P2.4 · El nombre viejo sigue andando

La skill sigue siendo `arquitecto-skills` (el "nombre viejo" de E §3; la puerta nueva es `/arquitecto` → "la PC"). Lo cuida
`scripts/skill.test.cjs` (nueva): el `name`, que cada comando citado exista en el `USO` de su script, y que `flota.md` derive ahí.

### P7.1 (núcleo, D6.1) · El catálogo, `aplicar` y el chequeo mecánico (E §4-§6; F §14; criterio 20 del kit)

```
node <eq>/scripts/actualizar.cjs aplicar  <carpeta> --kit <raíz del kit> [--molde-viejo <dir>] [--plan]
node <eq>/scripts/actualizar.cjs chequear <carpeta> --kit <raíz del kit> --base <sha> [--molde-viejo <dir>] [--plazo <min>]
```
Salidas como el resto: 0 · 1 · 2; error propio → "actualizador roto: corré doctor", 1 (en `chequear`, además `NO VERIFICADO`).

**El catálogo** (`scripts/lib/catalogo.cjs`; D6-5): por versión de molde (`2.4` = la forma de `templates/universales/`; `3` = `kit/molde/`),
cada pieza de la ficha con **sus rutas** (en el molde y en el proyecto), **su forma de zona propia** (texto con marcas · hook con hermano
`.propio.sh` · `settings` por regla · ninguna) y **si es `base` u `opcional`**. Base (siempre): `hook-arranque`, `hook-escritura`, `candado`,
`settings`, `inicio`, `cierre`, `cambios-metodo`, los hooks de F, `githooks`, `hooks/lib`, y `docs` = **solo el nacimiento: crea lo que
falta, nunca reemplaza, nunca es baja, nunca desvío** (r1-2; E §5, paso 7).
Opcional: `director-obrero` (director, obrero, tramo, núcleo, agentes), `estado`, `smoke`, `release`, `docs-fyd`. Las bajas: `check-code`
(v2) y las rutas de `session-start.sh`. **Toda ruta de `kit/molde/` (sin `*.test.cjs`) cae en una pieza**; una que no → la prueba del
catálogo da rojo (nada se reparte sin dueño).

**El molde viejo y el nuevo** (`scripts/lib/molde.cjs`): se **materializan en temporales con la forma de `kit/molde/`**, instanciados con
`vars:` de la ficha (el nuevo con `{{PROYECTO}}` y los de `kit/molde/`; el viejo, para `2.4.x`, con los 13 marcadores de `rehacer.sh`). El
nuevo sale de `--kit`; el viejo, de `git -C <kit> archive v<kit de la ficha>`. `--molde-viejo <dir>` lo reemplaza (para las pruebas y para los
repos de prueba, cuya ficha dice `2.4.2` con archivos de los pasos "orden 2-3"). La versión nueva = `kit/VERSION` del `--kit`.

**`aplicar`** (escribe solo en `<carpeta>`; no commitea, no pushea):
1. **Se niega** (1) si `<carpeta>` no es un repo con ficha que se lee, si `git status --porcelain` no está vacío **ignorando exactamente
   `.kit-rol`**, o **si `.kit-rol` no dice `actualizador`** (nunca la carpeta de Guido: RT1-5). Quien lo escribe (`flota`, las pruebas) lo
   suma también a `.git/info/exclude` del clon (r1-4: el molde viejo no lo ignora).
2. **Por pieza, según la ficha** (E §6.3), y **el guardia** (D6-7): un archivo de una pieza `molde` o `molde+propio` está **intacto** si, fuera
   de su zona propia, es igual al del molde viejo (LF) **o** su `hashPieza` coincide con el de la ficha. Intacto → `molde`: lo reemplaza;
   `molde+propio`: `mezclarTexto` (la zona queda byte a byte). No intacto → **no lo toca**, la pieza pasa a `"adaptada (desvío detectado)"`
   y va al informe. `adaptada` → en D6.1 **"no fusiona y avisa"** (la fusión es de D6.2). `propia` → no la toca; si el molde cambió su
   contrato, una línea. Opcional en `no` → no la trae; pieza nueva del catálogo → base: la trae como `molde`; opcional: la anota `no`.
   **Pieza nueva con la ruta ya ocupada y distinta del molde nuevo → desvío, no se toca** (r1-3).
3. **Las bajas** (E §6.3): un archivo que el molde viejo traía y el nuevo no, **intacto → se borra; editado → se deja y se informa**. Las
   de una pieza `propia` o `adaptada` **no se borran** (r1-3).
4. **`settings.json`**: `mezclarSettings(molde viejo, molde nuevo, proyecto)`; lo de `frenos.quitados` no vuelve; lo que el molde nuevo
   retira y el proyecto tenía igual al viejo se va. **Así se retiran las `deny` con `Write(...)`** de los proyectos armados con el molde de
   D2.2 (pendiente de W0). JSON roto o claves repetidas → 1 sin escribir nada.
5. **Los `.snippet`**: lo que falta de `gitignore.snippet` y `gitattributes.snippet`, renglón por renglón, sin duplicar (como `rehacer.sh`).
   Cierra el pendiente 2 de "de D5.2 y D5.3" (`.claude/paquetes/` sin trackear).
6. **`core.hooksPath`: `aplicar` no lo pone** (r1-5); lo pone `flota` en el clon, en D6.2, junto con D6-6 (pendiente de D4.1).
7. **La ficha**: `kit:` a la versión nueva y los hashes (`hashPieza`) de lo reemplazado; el estado de lo marcado; **todo lo demás byte a
   byte** (`frenos`, `sensible`, `autorizado`, la prosa). **El `CHANGELOG`**: un renglón al tope de `docs/CHANGELOG.md`, `kit <v> → <v'>:
   piezas <…>` (E §5, la única excepción en `docs/`). **Nunca** el `CLAUDE.md` ni otro archivo de `docs/`.
8. **Escritura atómica** (E §6.4): cada archivo, temporal en la misma carpeta + renombre; **todo el plan se arma antes de escribir el primero**.
9. Imprime una línea por pieza: `<pieza> · <estado> · reemplazada | mezclada (zona intacta) | propia | desvío: no se tocó | adaptada: no
   fusiona (<por qué>) | retirada | dejada (editada) | nueva | sin cambios`. **Dos corridas seguidas: la segunda, todo "sin cambios".**
   `--plan`: lo mismo sin escribir.

**`chequear`** (`scripts/lib/chequeo.cjs`, contrato fijo para que E3 y E4 vayan en paralelo: `chequear(carpeta, {moldeNuevo, moldeViejo,
base, plazoMs}) → {lineas, ok, noVerificado}`; el `actualizar.cjs chequear` de E3 lo llama). Sobre `<carpeta>` con lo aplicado ya
**commiteado** (`base..HEAD`). **Exactamente nueve líneas** `<n>. <id> · ✅|❌ · <detalle>`, en este orden, salida 0 si no hay ❌:
1. **`llaves`**: ningún `{{` suelto en lo que trae el molde (fuera de los `{{LINEAS:N}}` de `_fuente/`, que no viajan).
2. **`arranque`**: `node .claude/hooks/session-start.cjs` corre (plazo 20 s) y su huella dice ≤ 9.700.
3. **`settings`**: `.claude/settings.json` abre sin claves repetidas, y cada `command`/`args` de hook apunta a un archivo que existe y pasa
   `node --check` (r1-6).
4. **`skills`**: cada `SKILL.md` **de las skills que trae el molde** con `name` y `description` y ≤ 8.000 B (r1-10).
5. **`ficha`**: se lee y dice la versión nueva.
6. **`barreras`**: `node .claude/scripts/estructura.cjs barreras --rango <base>..HEAD --molde <nuevo> --molde-viejo <viejo> --sin-log`
   verde (N de N, menos las quitadas: lo quitado no lo cuenta el candado). **Crit. 20 del kit**: un `settings` `molde+propio` tocado sin
   cambiar su zona ni `frenos`, `sensible` o `autorizado` → verde.
7. **`casos`**: por cada hook o `hooks/lib` que cambió en `base..HEAD`, sus `*.test.cjs` **del molde nuevo**, corridos contra una copia
   temporal de `.claude/hooks/` (fuera del árbol); uno rojo → ❌ "el hook <x> pierde un caso: <cuál>"; un hook cambiado sin pruebas en el
   molde nuevo → ❌ (r1-6).
8. **`pruebas`**: `vars.comando-test` en `<carpeta>`, sin tuberías, plazo `--plazo` (30 min); colgado → **NO VERIFICADO** (❌); si ya estaba
   rojo en `<base>`, el ❌ lo dice: "ya estaba rojo antes" (r1-10).
9. **`gitleaks`**: sobre las líneas agregadas de `base..HEAD` (como el runner: `--text --no-textconv`); sin gitleaks → NO VERIFICADO (❌).

## MODIFICA

- El `SKILL.md` del Equipador: INSTALAR ("preparame") y AUTO-ACTUALIZAR pasan a `preparar-pc` (desde un tag anotado, nunca la punta de
  `main`); HOOKS POR PC suma el `doctor` completo y el inventario. **No crece**: lo que hace el script sale de la prosa. (E2)
- `scripts/doctor.cjs`: `IDS` suma los 12 de arriba al final (el orden de los 14 no cambia) e importa de `preparar-pc` el generador del bloque
  `autoMode` y el lector de `kit-pc.md` (una sola fuente). (E2)
- `scripts/instalar-hooks-pc.cjs`: solo lo que `preparar-pc` necesite exportar, dicho en el diff. (E1)
- **D6.2**: `kit/molde/githooks/kit-githook.cjs` (D6-6), `kit/skills/arquitecto/anexos/flota.md` y el `SKILL.md` del Arquitecto (solo la
  derivación), `pc/cargar-secreto.{sh,ps1}`, `kit/CHANGELOG.md` (la nota de 3.0.0), y el tracker, el SPEC-0 (`✅ <fecha>`) y `docs/DECISIONS.md`
  (un ADR por D6-1 y D6-6 si sobreviven al repaso de Guido).

## NO SE TOCA

**El `~/.claude/` real** (solo `kit-sync` en el `/cierre`) y **los repos de `../vibe-kit-pruebas/` a mano** (se rehacen con `rehacer.sh`; se
prueba sobre clones en temporales). `kit/VERSION` (el tag `v3.0` es del orden 10). La gramática de `ficha.cjs` (`kit-pc.md` usa la misma;
ningún campo nuevo en la ficha del proyecto). `zona-propia.cjs`, `barreras.cjs` y `estructura.cjs` (se usan, no se cambian; si hace falta
algo, es un pendiente con su porqué). `pc/lib/` (copia del molde). Los hooks del molde y su `settings.json` (en D6.1; D6.2 solo el runner de
los githooks, D6-6). `pruebas/rehacer.sh` (en D6.1). `tips/`, `_fuente/`.

## Criterios de aceptación

**D6.1** (del 1 al 14):
1. **P2.2 en un `HOME` falso vacío** (`preparar-pc.test.cjs`, con `gh`, gitleaks y `claude` falsos en el `PATH`): `--plan` no escribe nada
   (el árbol del `HOME` byte a byte igual); sin `--plan` deja las 4 skills, el agente, `VERSION`, `hooks/kit/`, el `settings.json` con el
   `PreToolUse` del kit, `crossSessionInbound` y el bloque `autoMode` **con `"$defaults"` primero**, y `kit-pc.md`; y **`doctor --home` sale 0**
   (con el `cwd` fuera de vibe-kit; r1-9).
2. **Idempotente y respetuoso**: la segunda corrida dice "sin cambios" y no reescribe nada; un `settings.json` con `allow` propias, una entrada
   `autoMode` de Guido y `crossSessionInbound: "hold"` → las tres quedan, la tercera con ⚠; JSON roto o claves repetidas → 1 sin tocar; un
   `EBUSY` en el renombre → reintenta.
3. **El bloque `autoMode` por regla**: dos fichas con entornos `dummy` → dos entradas; se saca un entorno → su entrada sale y la de Guido queda;
   una entrada del kit editada por Guido → queda como suya y la nueva se suma; `"$defaults"` nunca sale. **Mutación** (tope 20 min) sobre esta
   mezcla y la de `crossSessionInbound`.
4. **Lo editado a mano y el modo flota**: un archivo del kit editado en el `~/.claude/` falso → sin `--pisar-editados` no se pisa y el plan lo
   muestra; con él, se pisa; con `--flota`, se saltea con ⚠ y la salida no pregunta nada; uno igual a una versión vieja del kit → no es
   editado; `--kit` fuera de un tag anotado → 1.
5. **La capa privada**: sin ella → "instalé solo lo público", 0; con una carpeta de prueba con `instalar.cjs` → corre con `--home` y su salida
   va a la tabla; si falla → 1 con su línea y lo público queda instalado. Un programa que falta (sin `gh` en el `PATH`) → su línea y sigue.
6. **`doctor` completo**: cada id nuevo con su caso ✓ y su caso ⚠/✗ con "cómo se arregla"; sin red → ⚠ NO VERIFICADO, nunca ✓; los 14 de
   hoy siguen igual (sus pruebas, verdes); **dos corridas seguidas sobre una copia de `alfa` con un `frenos.log` de prueba dan la misma salida
   byte a byte**.
7. **El inventario**: clase por id; una pregunta que frenó 3 veces → `molestó 3`; un corrector repetido en 5 min sobre el mismo detalle →
   `molestó 1`, a los 20 min → `molestó 0`; una `ask` propia del `settings` → su línea; sin `frenos.log` → `sin frenadas`.
8. **P2.4 y crit. 1 del kit**: `skill.test.cjs` verde; `arquitecto.test.cjs`, `kit-sync` LIMPIO y las pruebas de `pc/` verdes.
9. **`aplicar` sobre un `v2.4.2` puro** (prueba del director: `rehacer.sh --solo-tag`, un `git clone` de `remotos/gama.git` a un temporal,
   `.kit-rol` = `actualizador`, `--kit` = este árbol): piezas `molde` reemplazadas; la zona propia de `inicio` byte a byte; una pieza `propia`
   intacta; un hook editado → `"adaptada (desvío detectado)"` y sin tocar; `check-code.js` intacto → borrado, editado → dejado; un freno de
   `frenos.quitados` no vuelve al `settings`; los dos `.snippet` sin duplicados; `.kit-rol` en `.git/info/exclude`; githooks: los activa `flota`
   (D6.2), `aplicar` no; la ficha con la versión y los hashes nuevos y el resto byte a byte; un renglón en el `CHANGELOG`; `CLAUDE.md` y
   `docs/` existentes intactos. **La segunda corrida, todo "sin cambios".**
10. **`aplicar`, casos de no** (`actualizar.test.cjs`, con moldes chicos sintéticos): carpeta sucia → 1, pero solo `.kit-rol` sin trackear → 0;
    sin `.kit-rol` `actualizador` → 1; pieza nueva con la ruta ocupada y distinta → desvío sin tocar; la baja de una `propia` o `adaptada` → no
    se borra; un `docs/` editado → no se toca;
    ficha rota → 1; un error inyectado a mitad del plan → **ningún archivo a medias** (cada uno, el viejo o el nuevo entero); un proyecto con el
    molde de D2.2 (sus `deny` con `Write(...)`, `--molde-viejo`) → las `Write(...)` se van y `barreras --molde --molde-viejo` da verde; la
    prueba del catálogo: una ruta del molde sin pieza → rojo.
11. **`chequear`**: un caso ✅ y uno ❌ por cada una de las nueve líneas (un `{{X}}` suelto; un arranque de 9.800; un `settings` con clave
    repetida **o un hook que apunta a un archivo que no está o no compila**; una skill del molde sin `description` (una propia rota no cuenta);
    la ficha con la versión vieja; un hook tocado sin `aprobado` y sin molde; **un hook fusionado que pierde un caso** y uno cambiado sin pruebas;
    `comando-test` rojo, y rojo ya en `<base>` → "ya estaba rojo antes"; una clave falsa armada en el diff); colgado → NO VERIFICADO y 1;
    siempre nueve líneas.
12. **Mutación** (tope 20 min cada una, en copias, nunca sobre `kit/`) sobre lo que decide: el guardia y las bajas de `aplicar`, y las líneas
    ❌ de `chequear`.
13. **Sin bypass**: `grep -rn bypassPermissions` en lo nuevo de `kit/skills/arquitecto-skills/` = 0 (salvo una línea que diga "nunca").
14. Suite entera verde **una vez, al final**; `kit-sync` LIMPIO; `~/.claude/settings.json` real con el hash de la apertura de D6.1; red team
    sin ALTOS abiertos; el revisor frío leyó el diff entero y lo suyo está arreglado (un encargo) o en "Lo que esto no cierra".

**D6.2** (del 15 al 21):
15. **Crit. 9 del kit, en los repos de prueba** (`flota alfa beta gama --canon <bare temporal> --tag v3.0.0-rc.1`; el canónico lo arma la
    prueba, nunca el `origin` real): una fila por repo; `alfa` y `beta` mezclados a `main` del remoto en un commit; `gama` con `origin/modulo/x` viva → salteado con su porqué;
    ninguna `kit/*` viva salvo las de abajo.
16. **Los casos de falla**: `main` protegido (un `pre-receive` en el `bare`) → queda `kit/v3.0.0` y una línea en "te espera"; `gh` o el remoto
    sin red → el repo sin tocar y la tabla dice por qué; `kit/v3.0.0` ya en el remoto → salteado; marcada `ROTA` → se borra y se rehace sin
    `--force`; `chequear` rojo (un molde roto a propósito) → nada a `main`, la rama queda `ROTA` con las nueve líneas.
17. **Los githooks en el clon** (D6-6): con `core.hooksPath` puesto, el commit y el push del actualizador pasan sus githooks **con el molde**;
    el mismo commit sin `KIT_MOLDE` → rojo; `KIT_MOLDE` con un `.kit-rol` que no es `actualizador` → se ignora. Mutación sobre esa regla.
18. **La fusión `adaptada`**: con "por qué" en la ficha → el molde nuevo con la adaptación encima, y pasa `chequear`; sin "por qué" (ni en la
    ficha ni en el `git log`) → "no fusiona y avisa"; una fusión que pierde un caso → no llega a `main`. Si va por `claude -p` (D6-1): la línea
    lleva `acceptEdits` y `--allowedTools`, nunca `bypassPermissions`, y **un `git reset --hard` del agente queda frenado en el clon** (fila 3).
19. **Crit. 10 y 20 del kit, el adoptador**: sobre un clon `v2.4.2` sin ficha, `adoptar --mirar` no cambia nada e imprime la
    propuesta; `--aplicar` → ficha por defecto del nivel, `/inicio`, `/cierre`, hook con tope, barreras base y documentos del método, `piezas.candado: no` (salvo `barreras`, que corre), y
    **`barreras` verde**; un repo sin ficha ni `CLAUDE.md` → la propuesta igual, con todo en `no`.
20. **`cargar-secreto` en un worktree** (`.sh` y `.ps1`): mismo `<proyecto>` y mismo almacén que en el checkout principal.
21. "Poné al día X" y "adoptá X" en `flota.md` derivan a esto (sin la línea "llega con el kit v3"); y lo mismo que 13-14, para D6.2.

## Los encargos de D6.1 (el director reparte, lee cada diff y corre las pruebas de cada uno)

Presupuesto (ADR-029): ~4 h y ~8 encargos; **cuatro ya están contados** (este delta, el red team, el revisor frío, los arreglos): quedan
**cuatro de construcción**. **Nunca más de dos Opus a la vez.** Cada uno en su worktree en `scratchpad/<e>/wt`, con el `cwd` adentro.
Las pruebas siempre con `--home` falso y sobre temporales; nunca el `~/.claude/` real ni un repo de `../vibe-kit-pruebas/` a mano.

| # | Modelo | Qué | Puede tocar (exacto) | Crit. | Mutación | Depende · paralelo |
|---|---|---|---|---|---|---|
| R0 | Opus | Este delta | `docs/kit-v3/SPEC-paquete-6.md` | — | — | — |
| RT | Opus | Red team, una ronda | nada | 14 | — | R0 · antes de E1 |
| E1 | Opus | `preparar-pc` (P2.2): chequeos, kit, editados, `--flota`, hooks por PC, `crossSessionInbound`, `autoMode` (la forma, contra la doc, con la cita), capa privada, `kit-pc.md`, tabla | `kit/skills/arquitecto-skills/scripts/preparar-pc.cjs`, `…/scripts/preparar-pc.test.cjs`, `…/scripts/instalar-hooks-pc.cjs` (solo exportar) | 1-5 | **sí** (crit. 3: escribe el `settings` de la PC) | RT · ∥ E3 |
| E2 | Sonnet | `doctor` completo, el inventario, P2.4, el `SKILL.md` | `…/scripts/doctor.cjs`, `…/scripts/doctor.test.cjs`, `…/scripts/skill.test.cjs`, `kit/skills/arquitecto-skills/SKILL.md` | 6-8 | no (solo lee) | E1 en `main` · ∥ E4 |
| E3 | Opus | El catálogo, materializar los moldes, `aplicar` y la CLI (`aplicar`, `chequear` que llama a `lib/chequeo.cjs`) | `…/scripts/actualizar.cjs`, `…/scripts/actualizar.test.cjs`, `…/scripts/lib/catalogo.cjs`, `…/scripts/lib/catalogo.test.cjs`, `…/scripts/lib/molde.cjs`, `…/scripts/lib/molde.test.cjs` | 9-10, 12 | **sí** (el guardia y las bajas) | RT · ∥ E1 |
| E4 | Opus | El chequeo mecánico (las nueve líneas) | `…/scripts/lib/chequeo.cjs`, `…/scripts/lib/chequeo.test.cjs` | 11-12 | **sí** (las líneas ❌) | RT y el contrato de arriba · ∥ E2; se mergea después de E3 |
| RF | Opus | Revisor frío, una vuelta, ≤ 10 hallazgos con escenario | nada | 14 | — | E1-E4 en `main` |
| RF-fix | Sonnet (Opus si toca `aplicar`, `chequear` o la escritura del `settings`) | Los arreglos, en un encargo, sin mutación | lo que liste el director | 14 | no | RF |

- **La prueba viva del crit. 9**, del director (D6-14): `rehacer.sh --solo-tag`, clon de `gama`, `aplicar`, commit, `chequear`; al final,
  `rehacer.sh` sin flags. La suite entera, una vez, al final, en segundo plano (15-30 min).
- **El orden de prioridad y el corte** (si a las ~3 h falta algo, corta ahí): 1. **E3 + E4** (el chequeo antes que la mezcla: es lo que
  destraba D6.2); 2. **E1**; 3. **E2**; 4. RF y RF-fix sobre lo que entró. **Tiene que quedar en `main` sí o sí**: E3 y E4. **Pasa a D6.2** si no
  entra: E2 (el `doctor` mínimo sigue andando) y, si hace falta, E1 en su rama WIP con qué falta.

## Los encargos de D6.2 (provisorios; los ajusta su director)

Sin delta ni red team nuevos: ~5 de construcción + revisor frío + arreglos.

| # | Modelo | Qué | Mutación |
|---|---|---|---|
| F1 | Opus | `actualizar.cjs flota`: registro, clon con `.kit-rol`, tag, saltear (`modulo/*` vivas, `director: sí` en obra, `kit/v*` ya está), rama, `aplicar`, `chequear`, mezcla, push, protegido, `ROTA`, sin red, tabla (D6-11) | sí (saltear y mezclar) |
| F2 | Opus | Los githooks en el clon (D6-6, `kit-githook.cjs`) | sí |
| F3 | Opus | La fusión `adaptada` (D6-1): `claude -p` o "no fusiona y avisa" | no |
| F4 | Opus | El adoptador (P7.2): `adoptar --mirar` / `--aplicar <propuesta>`; la pantalla, en `flota.md` | sí (lo que trae y el candado apagado) |
| F5 | Sonnet | `cargar-secreto` en worktree; `flota.md` y el `SKILL.md` (derivar); la nota de 3.0.0 | no |

**El corte de D6.2**: F3 queda en "no fusiona y avisa" (ya lo hace `aplicar`) si no entra; F4, a un D6.3.

## Lo prueba una sesión real

| # | Quién · dónde | Qué mirar |
|---|---|---|
| 1 | **Guido o el compañero · una PC nueva** | "Preparame" de punta a punta: una pregunta, la tabla, "reiniciá", `doctor` sin ✗; el bloque `autoMode` lo lee el clasificador (NO VERIFICADO del SPEC-0) |
| 2 | Director D6.2 · su sesión en `auto` | Que el clasificador deje correr `actualizar.cjs flota`; si no, la línea es de Guido (Supuestos) |
| 3 | Director D6.2 · un clon de `alfa` con una `adaptada` | La fusión por `claude -p` pasa el clasificador y un `git reset --hard` pedido al agente queda frenado (RT2-6) |
| 4 | **El piloto** | El primer "toda la flota" con un repo real (Deptos); la capa privada de la empresa |

## Cruces contra los diseños (la lección de D1.1)

| # | Qué | Qué dice cada uno | Gana |
|---|---|---|---|
| 1 | Cómo corre | P7.1 y su ⚠️: proceso `claude` por proyecto, **en bypass** · D4.2-2: el clasificador lo frena | Un script; solo la fusión usa `claude -p` en `acceptEdits` (D6-1) |
| 2 | Sus permisos | E §6: `allow` para pushear · D2.2: en un clon sin confianza el `allow` commiteado se ignora | El script no pide; la fusión, en el `settings.local.json` del clon y `--allowedTools` |
| 3 | "Cargaron los hooks" | P7.1: un `git reset --hard` del agente queda frenado | Para la fusión (fila 3); al script lo cuidan los githooks (D6-6) y `chequear` |
| 4 | El adoptador | P7.2: "en el mismo modo" que el actualizador | Script para mirar y aplicar; la pantalla, la sesión con Guido (D6-12) |
| 5 | La pregunta · qué instala · la carpeta | E §10, G §15, SPEC-0 2.2, ADR-023 | D6-2, D6-17, D6-3 |

## Supuestos

- [ALTO] Que una sesión en `auto` pueda correr `node …/actualizar.cjs flota` (pushea a `main`). Si el clasificador lo frena, Guido corre la
  línea en su terminal (fila 2); nadie lo lanza en bypass.
- [MEDIO] La forma exacta del bloque `autoMode` (y que `"$defaults"` siga siendo como se conservan los de fábrica) y de `crossSessionInbound`
  (`accept` · `hold` · `refuse`): E1 la verifica contra la doc oficial y la cita en el código; si dice otra cosa, gana la doc y se anota.
- [MEDIO] Que en `-p` con `acceptEdits` una `allow` `Edit(...)` cubra crear un archivo (la fusión); si no, "no fusiona y avisa" (F3).
- [BAJO] Que el molde `2.4.x` con los 13 marcadores de `rehacer.sh` alcance: ningún repo real tiene ficha (se adoptan), lo recorren los de prueba.

## Preguntas para Guido

Ninguna. Las que más pesan, para tu repaso: **D6-1** (el actualizador es un script) y **D6-6** (`KIT_MOLDE` en los githooks del clon).

## Riesgos y decisiones ⚠️

**Decisiones del redactor** (sin Guido, con la vara del ADR-030; las ⚠️ arriba; todas se deshacen antes del tag):

- ⚠️ **D6-1 · El actualizador y el adoptador son un script de node determinista; nadie corre en bypass.** `aplicar`, `chequear`, la rama, la
  mezcla, el push y la tabla los hace `actualizar.cjs` en el clon temporal, sin agente. **Solo la fusión de una pieza `adaptada` necesita
  criterio** (E §6.3): un `claude -p` en el clon con `acceptEdits`, `--allowedTools` estrecho (leer; `Edit` solo en `.kit-fusion/`) y
  esas `allow` en el `settings.local.json` del clon; el script valida y escribe. Si no entra, "no fusiona y avisa". `[workflow · mejor
  código · acordarse de menos]` Un script sale igual siempre y no lo frena el clasificador. *Contradice* SPEC-0 P7.1, P7.2 y el ⚠️ "corren en bypass" (Cruces 1-4):
  **vuelve al diseño E §6 con fecha** al cerrar D6.2. *Costo*: la protección del clon pasa de "hooks de Claude" a githooks + `chequear` (D6-6).
- ⚠️ **D6-5 · Un catálogo pieza → rutas, por versión de molde, con `base` u `opcional`.** Una pieza opcional en `no` no se trae; las base (lo
  de seguridad y el método) vienen siempre. `[consistencia · mejor código]` Sin él, "pieza por pieza" no tiene con qué; hoy lo sabe solo
  `rehacer.sh`. *Alternativa*: inferir la pieza por la ruta (frágil con las bajas de v2).
- ⚠️ **D6-6 · Los githooks corren en el clon y dejan pasar el molde.** `flota` pone `core.hooksPath` en el clon (pendiente de D4.1; `aplicar` no, r1-5); el runner, **solo
  con `.kit-rol` = `actualizador`**, lee `KIT_MOLDE` y `KIT_MOLDE_VIEJO` del entorno y se los pasa a los dos candados como `--molde` y
  `--molde-viejo`. La exención (a) solo deja pasar lo que es igual al molde dado. `[mejor código · consistencia]` *Alternativa* (si el candado
  de la ref vigente no lo acepta, lo mide F2): no poner `hooksPath` en el clon y confiar en `chequear`, que corre lo mismo que los githooks.
- ⚠️ **D6-7 · El guardia**: intacto = igual al molde viejo fuera de la zona, **o** el hash de la ficha. `[mejor código]` Las piezas sin hash
  (`candado: molde`) también se cuidan; un hash viejo no hace pisar un archivo que sigue igual al molde.
- ⚠️ **D6-12 · El adoptador mira y aplica por script; la pantalla la arma la sesión del Arquitecto con Guido delante** (NORTE, MAPA y el
  plano de `docs/` necesitan leer el código: es la sesión, no un `-p`). La migración del registro de cambios (Hermes) se ofrece y queda en
  "te espera": su script es P6.8b, orden 7. `[workflow · acordarse de menos]`
- D6-18 · `doctor` suma el id `githooks` (hay `.githooks/` y `core.hooksPath` no apunta ahí → ⚠ con la línea); `/inicio` no se toca.
  `[acordarse de menos · consistencia]`
- D6-17 · "Preparame" chequea node, git, `gh`, gitleaks y Claude Code y da la línea para instalarlos; no instala programas. `[workflow]`
- D6-2 · Pregunta única: plan y carpeta, un `AskUserQuestion`. `[acordarse de menos]` · D6-3 · `kit-pc.md` con la gramática de la ficha,
  fuera de `kit-sync`. `[consistencia]` · D6-4 · `crossSessionInbound` ajeno no se pisa. `[workflow]` · D6-8 · Capa privada = carpeta con
  `instalar.cjs`. `[consistencia]`
- D6-9 · Molestó: la pregunta siempre; el corrector, cuando se repite en ≤ 10 min. `[mejor código]` NO VERIFICADO que mida lo que importa:
  lo mira la revisión mensual.
- D6-10 · Modo flota = `--flota` de `preparar-pc`. `[acordarse de menos]` · D6-11 · La flota, un repo detrás del otro. `[mejor código]` ·
  D6-13 · El actualizador vive en el Equipador (E §3, §6); el Arquitecto deriva. `[consistencia]` · D6-14 · La prueba viva del crit. 9, del
  director. `[workflow]` · D6-15 · Versión = `kit/VERSION` del tag (`-rc.N` fuera); no coinciden → 1. `[consistencia]` · D6-16 · "Rota" =
  commit vacío `kit: ROTA — <primera ❌>`. `[acordarse de menos]`
- *Descartados*: un manifiesto de lo instalado (la historia del kit ya lo dice) · `--dry-run` en la flota (E §6: la rama es la vista previa).

### Lo que esto no cierra

- **Una cuenta que pushea un tag `v*` malo**: el tag evita repartir trabajo a medias, no autentica (tags firmados: fase 2; RT2-10).
- **Un proyecto que declara todo `propia`** para que nunca lo actualicen: queda en la tabla ("propia, no se tocó"); lo ve Guido.
- **Pasar `KIT_MOLDE` a mano** desde un clon con `.kit-rol` `actualizador` escrito a mano: es trampa; la exención solo deja pasar lo igual al molde.
- **`.kit-rol: actualizador` escrito a mano en la carpeta de Guido** para que `aplicar` corra ahí; **editar `kit-pc.md`** para que el kit
  adopte (y después saque) entradas `autoMode` ajenas; **un `instalar.cjs` privado malicioso**: corre con los permisos de quien lo instala. Trampas.
- **Lo que el actualizador no toca**: el `CLAUDE.md` (la regla del tamaño vieja la marca `doctor`) y `docs/`.

## Lo que se prueba más adelante

**D6.2**: su lista. **El piloto**: fila 4. Los pendientes 1 y 3 de "de D5.2 y D5.3" no entran: quedan en Pendientes.

## Ejecución

Paquete del método de vibe-kit, en dos directores Opus (D6.1, D6.2), con este delta y una ronda de red team; el cómo, en
[`PLAN-construccion.md`](PLAN-construccion.md) y en "Los encargos" de arriba.

## Red team (Opus, `redteam-spec`, una ronda; el informe, al repo privado)

| Id | Sev | Qué se hizo |
|---|---|---|
| r1-1 | ALTO | `autoMode`: lista nueva con `"$defaults"` primero; `"$defaults"` nunca es del kit ni se saca; crit. 1 y 3; Supuesto MEDIO |
| r1-2 | ALTO | Catálogo: `docs` = solo el nacimiento (crea lo que falta; nunca reemplaza, baja ni desvío) |
| r1-3 | ALTO | Guardia: pieza nueva con la ruta ocupada y distinta → desvío; bajas de `propia`/`adaptada` no se borran; crit. 10 |
| r1-4 | ALTO | `.kit-rol` a `.git/info/exclude` del clon; el chequeo de limpio ignora exactamente `.kit-rol`; crit. 9 y 10 |
| r1-5 | ALTO | `aplicar` no pone `core.hooksPath`: lo pone `flota` en D6.2 con D6-6; crit. 9 |
| r1-6 | ALTO | `chequear` 3: hooks del `settings` que existen y pasan `node --check`; 7: hook cambiado sin pruebas → ❌; crit. 11 |
| r1-7 | MEDIO | Editado a mano = distinto de toda versión del archivo en la historia del kit; `--kit` fuera de un tag anotado → 1 (`--kit-sin-tag` para pruebas) |
| r1-8 | MEDIO | `doctor` suma `githooks` (D6-18); `/inicio` no se toca |
| r1-9 | MEDIO | `kit-sync` con `--home`: `HOME` = ese home o "no aplica"; pruebas con el `cwd` fuera de vibe-kit |
| r1-10 | MEDIO | `chequear` 4 solo las skills del molde; 8 dice "ya estaba rojo antes" |
| r1-11 | BAJO | Contrato `instalar.cjs --home <h> [--plan]` y `--variables` |
| r1-12 | BAJO | La prueba usa `"hold"`; pasos 3 y 4 en una sola escritura; 3 reintentos ante `EPERM`/`EBUSY` |

**Ronda 1 (2026-11-02): 6 ALTOS, los seis integrados; veredicto: se sella sin otra ronda. ADR-029: una ronda. El director sella el delta sin
Guido. Informe: `vibe-research/mision-5/redteam-paquete-6/RONDA-1.md`.**
