# SPEC delta: paquete 4 — el Arquitecto v3, el sello, `formato-spec.md`, el script `worktree` y `.kit-rol` — vibe-kit
Toda sesión dice el tamaño en la primera línea y, si no es chico, el Arquitecto viene solo, termina armando y deja su sello por
script; sin sello no hay READY; y los worktrees nacen, se abren y se cierran por un script que escribe el rol y no lleva la credencial
de escritura.
- Estado: **READY — sellado sin Guido (provisorio)**, 2026-10-30, por el director D4.1, después de la ronda única del red team con sus 5
  ALTOS integrados. Guido lo repasa al volver; todo se deshace antes del tag
- Fecha: 2026-10-30 · Misión: 5, director **D4.1**, sin Guido (tracker, "Abrir D4.1 sin Guido"; la vara: ADR-030; el presupuesto: ADR-029)
- Plano: [`SPEC-0-kit-v3.md`](SPEC-0-kit-v3.md), orden 4 = **P1.1-1.8 (con P1.4), P6.2**, y "se completa la parte de `/inicio` que invoca
  al Arquitecto sin sello" (P5.1); más, del tracker, **"Paquete 4 · de D2.2"** (la línea del tamaño primero; 10 de 10), **"Paquete 4 · de
  D3.3"** (`cerrar` no se traba con `frenos.log`) y el NO VERIFICADO **"Orden 4 · `.kit-rol`"**. Diseño: H §4-§14, §17, §17bis, §19bis ·
  E §2-§3, §9 · B §5-§6 · F §9, §13.
- Sello del Arquitecto: `arquitecto: 2026-10-30 · kit 2.4.3 · chequeos: tamaño — (paquete del método) · entorno ✅ (../vibe-kit-pruebas/ y HOME
  falso) · tope ⚠️ (41,4 KB y 19 criterios: paquete del método, no se parte; D4.1) · sellado sin Guido (provisorio)` — se reescribe con
  el script `sello` cuando J1 entre a `main` (D4-14).
- Red team: **obligatorio** (RF-16: P6.2 toca credenciales; el sello es un permiso), Opus con `redteam-spec`, **una ronda** (ADR-029).
  Revisor frío Opus al cerrar, una vuelta, hasta 10 hallazgos con su escenario del día normal.

## Por qué (el dolor)

El Arquitecto apareció en 11 de 41 lotes (Mobile, 0 de 18; E §2.1) y su `SKILL.md` pesa 20 KB en cada arranque. Los diez pedidos de D2.2
dieron 6 de 10: los "módulo solo" invocan al Arquitecto sin decir antes el tamaño. Un spec READY se revirtió 3 veces y la obra crece igual
(H §12). Hermes dejó 47 worktrees sueltos en `D:` (H §10), y en el paquete 3 los renglones de `frenos.log` trababan `git worktree remove`.

## Contexto (explorado el 2026-10-30)

- **El Arquitecto de hoy** (`kit/skills/arquitecto/SKILL.md`, 20.761 B): tres puertas, sin línea de tamaño, sin sello, sin "Ejecución";
  la `description` dice "grande **o riesgosa**" (línea 3). La regla vieja vive además en `anexos/consultorio.md:27` ("Regla de bolsillo")
  y en `templates/universales/CLAUDE.template.md:38` (el molde v2 que monta el Modo A). `anexos/formato-spec.md` (8.398 B) **manda
  archivar** el spec implementado y no tiene "Pedido original", "Ejecución", "Entorno de prueba" ni sello.
- **`kit-sync.sh`** (`.claude/scripts/`): copia con `cp -r` y compara con `diff -r` cuatro skills, el agente y `VERSION` (líneas 18-20, 34):
  **un archivo borrado o renombrado en `kit/` deja SUCIO** (queda en `~/.claude/`). Conserva la línea `**Carpeta de proyectos de esta
  máquina**` entre sus primeros backticks (líneas 11-16). **`kit/molde/` no llega a ninguna PC**: lo reparte el orden 6.
- **El molde**: `CLAUDE.md` (2.280 B) no trae la prueba de tamaño. `/inicio` la dice en su paso 5, después de "Confirmar en tres
  líneas", y su línea 28 avisa que "todavía no mira … el sello". `skills.test.cjs` fija el orden de los pasos, ≤ 8.000 B y ≤ 70 líneas, y que
  cada comando citado exista.
- **El rol**: `contexto.cjs:93-105` lee `.kit-rol` de la raíz del checkout del `cwd` (sin archivo → `humano`; BOM y espacios afuera; otra cosa
  o ilegible → `desconocido`). Lo usan `niega-aprobar`, `sensible`, `git-seguro` (`salir-del-worktree`), `secretos` (`frenos-del-proyecto`,
  D-10 protege `.kit-rol`), los githooks y `cambios`. **Nadie lo escribe todavía.** `gitignore.snippet` ya ignora `/.kit-rol` y
  `/.claude/worktrees/`; `gitattributes.snippet`: `frenos.log merge=union`.
- **`frenos.log`**: los hooks de sesión escriben en `.claude/frenos.log` del checkout (`frenos-log.cjs:12`); los githooks mudan lo que
  agregan a `<git-common-dir>/kit-frenos.log` y dejan el archivo como estaba (`kit-githook.cjs:29-30, 181-184`; RF-A2): **esa mudanza ya
  existe y se reusa**.
- **Credenciales**: la ficha no dice qué variable es la de escritura (`ficha.cjs:383`: un entorno trae solo `clase`, `herramientas`,
  `acceso`), pero P6.6 ya la sacó del `.env`: **`cargar-secreto` guarda por defecto en el almacén `~/.config/kit-secretos/<proyecto>.env`**, y
  `--al-env` es solo para `dummy`, `prueba` o solo lectura (SPEC-paquete-3, P6.6).
- **El candado** ya exige `docs/modulos/<x>/README.md` con `Estado:` (`candado.cjs:85-88`). **Estilo de script**: `cambios.cjs` (un `.cjs`
  con subcomandos, salidas 0/1/2, su `.test.cjs` al lado). **Copias byte a byte**: `pc/lib.test.cjs:19-25` (D-12).
- **La plataforma** (H §17bis): `-w` crea `worktree-<nombre>` desde la rama por defecto y no acepta otra base; `.worktreeinclude` copia lo
  ignorado; el `cwd` del JSON del hook sigue al worktree, `CLAUDE_PROJECT_DIR` no. `-w` con `-p`: ✅.

## Dónde vive cada pieza

| Pieza | En el kit | Instalada en | Quién la corre |
|---|---|---|---|
| `sello`, `ready`, `tope`, `entorno`, `registro` | `kit/skills/arquitecto/scripts/arquitecto.cjs` + `lib/sello.cjs` + `lib/ficha.cjs` (copia) | `~/.claude/skills/arquitecto/scripts/` (kit-sync; Equipador en el 6) | el Arquitecto; `/inicio` (`ready --pendientes`) |
| La skill y sus anexos | `kit/skills/arquitecto/SKILL.md`, `anexos/` | ídem | — |
| `worktree` | `kit/molde/scripts/worktree.cjs` | `.claude/scripts/` del proyecto (hoy `rehacer.sh`; el actualizador en el 6) | el Arquitecto (módulo con director); el director (orden 5) |
| La prueba de tamaño | `kit/molde/CLAUDE.md`, `kit/molde/skills/inicio/SKILL.md`; el `CLAUDE.template.md` v2 | el proyecto | toda sesión |

**Por qué así** (D4-9): los scripts del Arquitecto los corre el Arquitecto **en cualquier proyecto, también en los v2 de hoy**, y el molde no
llega a las PCs hasta el orden 6: van en la skill. `lib/sello.cjs` usa solo node estándar, para que el orden 5 la copie al molde (el
corrector "spec sin sello" y `/obrero` leen el sello en el proyecto) con la prueba anti-desvío de D-12. `worktree` va en el molde: lo corre
el director en su proyecto, lee la ficha del proyecto (`comando-setup`) y escribe el `.kit-rol` que leen los hooks del molde.
`<skill>` = `~/.claude/skills/arquitecto` (o `kit/skills/arquitecto` en las pruebas); la versión sale de `<skill>/../../VERSION`, por
`__dirname`, nunca por `os.homedir()` (r1-15).

## AGREGA

### P1.4 · `arquitecto.cjs` y `lib/sello.cjs` (H §8.1, §9, §12; RF-28)

```
node <skill>/scripts/arquitecto.cjs sello <spec> [--no-partir "<quién>"] [--no-aplica tamaño|entorno "<razón>"]
node <skill>/scripts/arquitecto.cjs ready <spec>
node <skill>/scripts/arquitecto.cjs ready --pendientes          (parado en la raíz del repo)
node <skill>/scripts/arquitecto.cjs tope <spec>
node <skill>/scripts/arquitecto.cjs entorno
node <skill>/scripts/arquitecto.cjs registro <carpeta de proyectos>
```
Salidas como `cambios.cjs`: 0 anduvo · 1 negado o con fallas (una línea por qué, con qué hacer) · 2 mal llamado; error propio →
"arquitecto roto: …", 1. Todo en criollo, una línea por cosa.

**La línea** (en la lista de la cabecera, primeras 20 líneas; si falta, `sello` la pone después de `- Fecha:`):
`- Sello del Arquitecto: \`arquitecto: <AAAA-MM-DD> · kit <X.Y.Z> · chequeos: tamaño <c> · entorno <c> · tope <c> · hash <12 hexa>[ · <nota>]\``
- `<c>` = `✅` · `— (<razón>)` · y solo en tope `⚠️ (<KB> KB y <N> criterios; no partir: <quién>)`. `<nota>`: texto libre sin ` · `.
- **`hash`** (D4-8): 12 hexa del sha256 del spec **normalizado** (r1-7): sin BOM, CRLF→LF, sin espacios al final de cada renglón y sin
  saltos de línea al final; **se excluyen solo la primera línea `- Estado:` y la línea del sello, las dos dentro de las primeras 20 líneas**
  (un `Estado:` del cuerpo, como el esqueleto de la ficha, cuenta). Es "el spec no crece en la obra" (H §12) hecho chequeo: tocar el spec
  después del sello lo invalida, y un sello tipeado a mano no trae el hash bueno. **La línea del sello va en un solo renglón**, nunca partida.
- **`— (<razón>)` vale solo en un repo sin ficha** (`.claude/kit.md`): vibe-kit y los proyectos v2. Con ficha, tamaño y tope piden ✅ (o el ⚠️
  de tope), y entorno ✅, o `— (quitado: <por>)` si `gate:entorno-prueba` está en `frenos.quitados`. **"¿Hay ficha?" se decide igual en
  `sello` y en `ready`**: `.claude/kit.md` en el disco de la raíz del checkout del spec (r1-7).

**Los chequeos de `sello`** (cualquiera en rojo → 1 y no escribe nada):
- **tamaño**: el spec trae `## Ejecución` y su primera línea con texto dice `módulo solo` o `módulo con director`; si al lado está
  `docs/modulos/<x>/README.md`, su `director:` coincide, y con director su `rama:` es `modulo/<x>`. Sin ficha y sin Ejecución:
  `--no-aplica tamaño` con razón.
- **entorno** (`gate:entorno-prueba`, H §9.2), con la ficha del disco de la raíz: por cada entorno `clase: real` hay al menos un `dummy` o
  `prueba`; sin `real`, `vars.comando-test` existe y sale 0 (plazo 5 min); el `chequeo` de cada herramienta que nombra un entorno sale 0
  (plazo 30 s). Sin ficha: `— (sin ficha del kit)` solo, o la razón de `--no-aplica`.
- **tope** (H §12; "avisa, no corta"): bytes/1.024 con un decimal y los criterios = renglones `- ` o `N. ` de primer nivel bajo
  `## Criterios de aceptación` hasta el `##` siguiente. Módulo solo ≤ 10 KB y ≤ 8; con director ≤ 30 KB; sin tamaño, 30 KB. Pasado y sin
  `--no-partir` → 1 con los números y las secciones `##` de mayor a menor (la base de la propuesta de corte, que hace el Arquitecto).

**`tope <spec>`** imprime lo mismo y sale 0 siempre. **`entorno`** corre ese chequeo solo (lo que `/obrero` va a correr en el 5).

**`ready <spec>`** (P1.4; criterio 3 del kit): sin línea → 1 "spec sin sello: corré el Arquitecto (Modo B)"; gramática rota, un chequeo
que no vale (la tabla de arriba) → 1 "sello inválido: <qué>"; hash distinto → 1 "el spec cambió después del sello: corré sello de nuevo";
faltan secciones → 1 con cuáles: **todos** `## Ejecución` y `## Entorno de prueba`; **un delta** (H1 `# SPEC:` o `docs/modulos/*/SPEC.md`)
además `## Pedido original, textual` como primera sección y `## NO SE TOCA` (`ready` mira que los títulos existan, no su texto: un spec
anterior al kit v3 puede decir "(no quedó registrado: spec anterior al kit v3)"; el modelo **nunca lo inventa**; r1-3). Con todo: cambia `Estado: BORRADOR` por `Estado: READY` y nada
más, relee y compara (F §9) → 0; ya READY → 0 "ya estaba". **No vuelve a correr los chequeos** (los corrió `sello`; el hash prueba que
nada cambió).

**`ready --pendientes`**: una línea `<x> · sin sello | cambió después del sello` por cada `docs/modulos/<x>/` cuyo `Estado:` (en su
`README.md`) no empieza con `COMPLETO` ni `ABANDONADO` (pueden llevar fecha al lado; los valores, fijos en `formato-spec.md`; r1-11) y cuyo
`SPEC.md` no pasaría `ready` por el sello; sin nada, no imprime nada. Sale 0 siempre.

**`registro <carpeta>`** (P1.8; E §9): `{version: 1, fichas: [{alias, repo, tipo, kit}], conexiones: [{de, a, texto}]}` por stdout, una ficha
por `<carpeta>/*/.claude/kit.md` que se lee (una rota: se saltea con una línea por stderr). `alias` = `vars.proyecto` o la carpeta; `repo` =
`git remote get-url origin` o `null`; `tipo`: `estandar` → `código`, `liviano` → `sin código`; `kit` = `kit:`; `conexiones` sale de las claves de
`mesa:` (texto `mesa`). Es **el adaptador de ejemplo**; el del Hub es capa privada (ADR-021) y no entra.

**`lib/ficha.cjs`** = copia byte a byte de `kit/molde/hooks/lib/ficha.cjs`, con su prueba anti-desvío (D-12).

### P1.1-1.3, 1.5, 1.6, 1.8 · La skill del Arquitecto v3 (E §2-§3; H §5-§9, §12-§14, §17)

- **`SKILL.md` ≤ 6.000 bytes** (`wc -c`), en este orden:
  1. **Arriba de todo: "Tu primera línea, siempre, antes de cualquier herramienta: qué entrada es y, si es un pedido, su tamaño"** —
     `más que chico: <feature (Modo B) | proyecto nuevo (Modo A)>` · `esto es chico: hacelo en el chat del proyecto` (y se apaga; H §5.3)
     · `consultorio` · `la PC: te paso al Equipador` · `la flota: …`. Es el arreglo del pendiente de D2.2 (D4-10).
  2. **Las cinco entradas** (E §3; RF-21) con el anexo de cada una: la PC → `flota.md` (deriva: invoca `/arquitecto-skills`) · proyecto nuevo
     → `modo-a.md` · feature → `modo-b.md` · consultorio → `consultorio.md` · la flota ("¿cómo está la flota?", "poné al día X", "adoptá X") →
     `flota.md`. Ecosistema y relevamiento: una línea y a su puerta (E §3).
  3. **Las reglas de oro**: las seis de hoy, más: el sello lo escriben los scripts, nunca el modelo · termina armando (H §8.2) · `NORTE.md`
     antes de explorar (H §17) · monta donde corre, por ruta absoluta (H §14) · el que piensa no construye (H §8.3).
  4. Los scripts: `node ~/.claude/skills/arquitecto/scripts/arquitecto.cjs …` en Bash; **en PowerShell, `$HOME` en vez de `~`** (PowerShell
     5.1 no expande `~` en los argumentos de un programa; D4-17).
  5. **La línea `**Carpeta de proyectos de esta máquina**: \`{{CARPETA_DE_PROYECTOS}}\`` tal cual** (la conserva `kit-sync`).
  - `description`: las cinco entradas, cuándo no (chico: rebota), sin "o riesgosa" (P1.7).
- **Anexos nuevos** (ninguno de los de hoy se borra ni se renombra: `kit-sync` quedaría SUCIO):
  - **`modo-a.md`**: los pasos 0-6 de hoy; antes de la primera pregunta, `registro` y una línea "¿proyecto nuevo, módulo de otro o feature de
    otro?" (P1.8); la primera pregunta incluye "¿lleva código?" → `liviano`/`estandar` (H §4); **monta donde corre**: carpeta vacía → ahí; si
    no, la crea por ruta absoluta (H §14); el `SPEC-0` lleva "Ejecución" y "Entorno de prueba" y pasa por `sello` y `ready`; **el montaje
    sigue siendo el molde v2 de `templates/`** (D4-6).
  - **`modo-b.md`**: B0 dónde (**con ficha**: `docs/modulos/<x>/` con la ficha del esqueleto de `formato-spec.md`; **sin ficha**: lo de hoy,
    `docs/SPEC-<x>.md`, sin worktree; D4-1) · `NORTE.md` leído antes del explorador, y si falta se arma de README, `CLAUDE.md` y el código y se
    muestra en la misma aprobación (H §17) · **pantalla → prototipo** HTML por un Sonnet en `docs/modulos/<x>/prototipo/` con una pregunta
    escrita, antes del spec (H §13) · **corto** (con plan charlado: explora, NO SE TOCA, chequeos, director sí/no, Ejecución; sin entrevista;
    E §2.1) y **largo** (entrevista + "¿cómo lo resuelven otros?": investigador Sonnet, ~15 búsquedas, sección "Qué robar y qué no"; P1.3)
    · director **solo** si hay dos o más tareas que se escriben a la vez o noche sin Guido (H §6) · **termina armando** (H §8.2): `sello`,
    el OK de Guido, `ready`, **un commit en la rama por defecto** con la carpeta, la ficha y el `SPEC.md`, **con `git commit -- <esas rutas>`,
    nunca `add -A`** (push si hay remoto, con las reglas del paso de push del `/cierre`); con director, después `node .claude/scripts/worktree.cjs
    crear <x>`; y la línea de apertura. Parado en otra rama: no arma; una línea "el módulo nace en la rama por defecto: abrí una sesión ahí"
    (lo resuelve `integrar`, orden 5; D4-2). **Si no está `.claude/scripts/worktree.cjs`**: lo dice en una línea y **no arma el worktree a
    mano** (r1-6). **Sin ficha** (proyectos v2, r1-3): corren `sello` y `ready` sobre `docs/SPEC-<x>.md`, la Ejecución dice `módulo solo`, **sin
    commit, sin push, sin worktree y sin la regla de "otra rama"**: queda como hoy, para el `/cierre` del proyecto.
  - **`flota.md`**: la PC → `/arquitecto-skills`; "¿cómo está la flota?" → `registro` y una tabla; "poné al día X" y "adoptá X" → una línea:
    "llega con el kit v3 (orden 6); hoy: `actualizate` del Equipador para la PC, el §2.9 del playbook para adoptar".
- **`formato-spec.md` v3** (P1.5; B §5; H §8, §9, §12): "Pedido original, textual" primero (delta); "Ejecución" (tamaño, sesiones, solo el
  desvío del modelo con su razón, rama y worktree si hay director, **la línea para abrir**, puntero a Entorno de prueba; H §8.1) y "Entorno
  de prueba" (cómo se levanta, semilla, reset, chequeo base, compartido o por worktree, herramientas con su chequeo de una línea; H §9.1);
  la línea del sello en la cabecera; READY = aprobado **después** del red team cuando corresponde; **no se archiva**: `COMPLETO <fecha>` en
  su línea de Estado; "Contexto del código" con `archivo:línea`; "Supuestos" admite `[SIN CONTRASTAR]` (R-42); los topes de H §12; **el
  esqueleto de la ficha del módulo** (cabecera `Estado:` · `director:` · `parte-de:` · `rama:` y las seis secciones de B §5; D4-7).
- `consultorio.md:27` y `CLAUDE.template.md:38`: la regla vieja por la prueba de tamaño (dos preguntas, B §6 con la nota de D2.2).

### P1.7 y P5.1 · La prueba de tamaño en el molde y lo que le faltaba a `/inicio`

- **`kit/molde/CLAUDE.md`**: una sección corta "El tamaño del pedido": ante un pedido nuevo, **la primera línea de la respuesta** es el
  tamaño, sin preguntar (las dos preguntas; *"chico, lo hago acá"* o *"esto es más que chico: llamo al Arquitecto"* e invocás `/arquitecto`);
  tocar plata, permisos o datos no lo agranda (H §5.1-§5.3).
- **`/inicio`** (los pasos siguen en el mismo orden): el paso 5 dice además que **con el pedido en el mensaje, esa línea va primera en la
  respuesta, antes de las tres de confirmación**; paso nuevo, después de "aprobados nuevos": `node ~/.claude/skills/arquitecto/scripts/arquitecto.cjs
  ready --pendientes` → si lista un módulo: sin pedido en el mensaje, *"el módulo <x> nació sin sello: llamo al Arquitecto (Modo B corto)"* y
  lo invoca; con pedido, esa línea y sigue con el pedido (B §6; RT1-11); **`cambió después del sello` no invoca a nadie**: una línea "el spec
de <x> cambió después del sello; si fue a propósito, corré `sello` de nuevo" (r1-11); si el script falla, una línea y sigue. La línea 28 deja de decir
  "el sello" (la mesa sigue pendiente, orden 5).

### P6.2 · `worktree.cjs` (H §10; F §9; RT1-3, RT1-14, RT2-5, RT2-9, RT2-12; RF-11)

```
node .claude/scripts/worktree.cjs crear  <x>[--<ID>] [--noche] [--model <m>]
node .claude/scripts/worktree.cjs abrir  <x>[--<ID>] [--noche] [--model <m>]
node .claude/scripts/worktree.cjs sync-env
node .claude/scripts/worktree.cjs cerrar <x>[--<ID>]
```
Salidas 0/1/2 como `cambios.cjs`. **Un solo `.cjs` de node** (D4-4). Las carpetas van **siempre bajo el checkout principal**
(`<padre de git-common-dir>/.claude/worktrees/`), también corrido desde el worktree del director.

- **Nombres** (H §7.1, §10.1): `<x>` = `^[a-z0-9]+(-[a-z0-9]+)*$`, ≤ 20, sin `--`; `<ID>` = dos dígitos. Rama `modulo/<x>` →
  `.claude/worktrees/modulo--<x>`; `modulo/<x>--<ID>` → `.claude/worktrees/modulo--<x>--<ID>`. Otro nombre → 2.
- **`crear`**: se niega (1, con la línea que lo arregla: pegar el `gitignore.snippet` entero) si `.claude/worktrees/`, `.kit-rol` o
  `.claude/settings.local.json` no están ignorados (`git check-ignore`: un `.kit-rol` commiteado viajaría a `main` con el merge y haría
  "obrero" al checkout de Guido; un `settings.local.json` sin ignorar deja sucio el worktree o viaja con rutas de otra PC; r1-5) · si `docs/modulos/<x>/README.md` no está
  commiteado en la rama por defecto (H §8.2: primero el commit del módulo) · si la rama o la carpeta ya existen (eso es `abrir`). Base: `<x>`
  desde la rama por defecto local; `<x>--<ID>` desde la punta de `modulo/<x>` (H §10.1). Después: **`.kit-rol`** (`director` para `<x>`;
  `obrero` para `<x>--<ID>`; `nocturno` con `--noche`), escrito por node en ASCII, sin BOM, con LF: **los mismos bytes desde PowerShell o
  Bash**; **las credenciales** (abajo); `core.longpaths true` en Windows; `vars.comando-setup` de la ficha, en el worktree (si falla, lo dice
  y no borra nada). Al final, **la línea de apertura**: `cd "<ruta absoluta>"; claude --name director-<x> --model opus` (obrero:
  `obrero-<x>--<ID>`, `sonnet`; D §6; `--model` la cambia). Con `;` y no `&&` (D4-12).
- **`abrir`**: la rama existe local o en `origin` y la carpeta no está en esta PC (otra PC, el compañero; H §10.2, R-21). Antes: **las
  mismas negativas de `crear`** (lo ignorado), `git fetch` (sin remoto, sigue) y `git worktree prune` (una carpeta borrada a mano que
  seguía registrada); si la rama local está atrás de la de `origin` y se adelanta sin conflicto, la adelanta; **si divergió → 1** (r1-10).
  Después la crea sobre esa rama y hace lo mismo que `crear` desde `.kit-rol`.
- **Credenciales** (RT1-3, RT2-5; D4-5; r1-4): se copia lo que lista `.worktreeinclude` (sin el archivo: los `.env` y `.env.*` ignorados, y
  una línea que lo dice). **De cada `.env*` copiado se saca todo renglón cuyo nombre esté en el almacén del proyecto**
  (`<HOME>/.config/kit-secretos/<proyecto>.env`), con una línea "no copié <NOMBRE>: vive en el almacén"; del almacén se leen **solo los
  nombres**, y ningún valor sale nunca por pantalla ni a un renglón. Las reglas que lo hacen fallar cerrado y no abierto:
  - **`<proyecto>` sale siempre del checkout principal** (el padre del `git-common-dir`), con la misma regla que `cargar-secreto` aplicada a
    esa carpeta, también corrido desde el worktree del director (si no, saldría `modulo--x` y no encontraría el almacén).
  - **Almacén que no existe** → una línea "sin almacén para <proyecto>: no saqué nada" y sigue. **Almacén ilegible** (UTF-16, o renglones que
    no son `NOMBRE=…`, comentarios y vacíos aparte) → **1 sin copiar ningún `.env`**. El BOM UTF-8 se saca.
  - El nombre de cada renglón del `.env` se lee aceptando `export `, espacios alrededor del `=` y CRLF; un valor entre comillas que sigue en
    otros renglones se saca entero.
  - **`crear`/`abrir` → 1 si hay un `.env*` trackeado** (llega por el checkout, no por la copia) **con un nombre del almacén**. Y el
  `.claude/settings.local.json` del worktree **suma** (mezcla, no pisa: ahí van a ir las `allow` de AUTORIZADO, P6.5) un `deny` de `Read`,
  `Edit` y `Write` por ruta absoluta (`//c/…`, verificado en G0) al `.env` y `.env.*` del checkout principal.
- **`sync-env`**: en cada worktree vivo de `.claude/worktrees/modulo--*`, **saca de los `.env*` que ya están ahí** los renglones con nombres
  del almacén (para el `cargar-secreto` que llega después; R-33). **Nunca vuelve a copiar** (pisaría el `PORT` o la base propios del
  worktree; r1-8). Ignora los `worktree-*` del `-w` nativo.
- **`cerrar`** (H §10.2; R-22; el pendiente de D3.3; D4-3). **Todos los chequeos primero, después `remove`, después la rama** (r1-2):
  - se niega (1) si se corre desde adentro de ese worktree;
  - si la rama **no está mergeada en su madre**: `git merge-base --is-ancestor <rama> <madre>`, con madre = `modulo/<x>` para un encargo y la
    rama por defecto para `<x>`, **la local o la de `origin`, cualquiera de las dos** (no `git branch -d`, que mira contra `HEAD`);
  - la mudanza de `frenos.log` (r1-1): la base es `git show HEAD:.claude/frenos.log` del worktree; se comparan **los dos lados normalizados a
    LF** (con `core.autocrlf=true` el archivo sale con CRLF y los hooks agregan LF; verificado en `Usuario`); si el archivo es la base más
    renglones al final, esos renglones van a `<git-common-dir>/kit-frenos.log` (con el nombre del worktree), como los githooks (RF-A2), y el
    archivo vuelve con `git checkout -- .claude/frenos.log`; si no está en `HEAD` (lo creó un hook), se muda entero y se borra; si cambió en
    el medio, no se toca y cuenta como sucio;
  - si `git status --porcelain` del worktree no está vacío después de la mudanza.

  Pasando todo: `git worktree remove` **sin `--force`**; **si falla** (una pestaña o un `claude` vivos en Windows dejan archivos tomados: "cerrá
  la pestaña de ese worktree"), lo dice y **no borra la rama** (r1-9); si anduvo, `git branch -D` (ya se probó que está mergeada). Una carpeta
  ya borrada a mano: `prune` y la rama, con las mismas condiciones.
- **`integrar`: al orden 5** (D4-2).

### `pruebas/pedidos.md` (P1.1, P1.2, P1.3, P1.6)

Se suman, con el mismo formato de los diez (pedido textual, repo, qué tiene que pasar): **tres entradas sueltas** ("preparame esta
máquina" → Equipador; "¿cómo le pido a Claude que …?" → consultorio; "adoptá beta" → la línea de `flota.md`); **Modo B corto** (pedido 5 con
un plan charlado de cinco renglones: sin preguntas, spec sellado, director, rama y worktree, ≤ 15 min); **Modo B largo** (pedido 3 con "dale
con los defaults": "Qué robar y qué no" y `NORTE.md` leído antes del explorador); **pantalla** (pedido 4: `prototipo/` antes del `SPEC.md`);
**Modo A** desde una carpeta vacía de `../vibe-kit-pruebas/` con "dale con los defaults" (monta ahí; la línea del registro antes de la primera
pregunta). Las entradas "proyecto nuevo" y "feature" las cubren esos dos. Y **cómo se mide la línea**: es el **primer bloque de texto** del
asistente en el transcript (después de las herramientas que haya), y en los seis "más que chico" el transcript invoca `arquitecto`.

## MODIFICA

- `kit/skills/arquitecto/`: `SKILL.md`, `anexos/formato-spec.md`, `anexos/consultorio.md` (línea 27), `templates/universales/CLAUDE.template.md`
  (línea 38). Efecto a cuidar: **el Modo A v2 sigue montando igual** (criterio 1) y la línea de la carpeta sigue donde `kit-sync` la busca.
- `kit/molde/CLAUDE.md`, `kit/molde/skills/inicio/SKILL.md` y `kit/molde/skills/skills.test.cjs` (el orden de los pasos sigue; se suman los
  casos nuevos). Efecto: `/inicio` ≤ 8.000 B y ≤ 70 líneas, y `estructura.cjs todo` 0 en `alfa`/`beta` tras `rehacer.sh` (el paso "orden 3"
  copia el molde del árbol de trabajo: no hace falta tocar `rehacer.sh`).
- `GUIA-DE-USO.md:74-79` y `manuales/COMO-USAR-EL-ARQUITECTO.md:28-34`: **solo** la regla vieja por la nueva y "grande o riesgosa" por
  "más que chico" (el resto, orden 8; D4-16).
- `docs/DECISIONS.md` (el director, al cerrar): **ADR-031**, la puerta única con cinco entradas: REJ-003 se reabre solo en la forma de ruteo
  (E §3: "ADR nuevo al construir"). La excepción de tokens del Hub es capa privada (orden 6): una línea.
- El tracker: la fila D4.1, criterios 2, 3, 4, 17 y el NO VERIFICADO de `.kit-rol` con su evidencia; el SPEC-0, los `✅ <fecha>`.

## NO SE TOCA

**El `~/.claude/` real** (solo llega lo que copia `kit-sync`, que no registra nada; SPEC-paquete-3, Contexto). `kit/VERSION`. La gramática de
`ficha.cjs` (ningún campo nuevo: D4-5). Los formatos de `frenos.log` y de `cambios`. Los hooks y su registro (`settings.json` del molde,
`git-seguro`, `sensible`, `secretos`, `niega-aprobar`, `escritura-docs`, `session-start`, los githooks). El Equipador. Los anexos `banco-de-preguntas`,
`concerns`, `matriz-stacks`, `methods.csv` y el resto de `templates/`. **Ningún archivo de `kit/skills/arquitecto/` se borra ni se renombra.**
`pruebas/rehacer.sh`. `tips/`, `_fuente/`, el kit v2 instalado en la flota.

## Criterios de aceptación

1. **Regresión** (crit. 1 del kit, la parte de este paquete): el Modo A con el molde v2 monta un proyecto (fila 6 de la sesión real);
   `kit-sync` LIMPIO con la carpeta de esta PC conservada.
2. `wc -c` del `SKILL.md` ≤ 6.000; **una tabla "regla de hoy → dónde quedó"** de las reglas de oro, el ruteo y "si algo sale mal" con **0
   perdidas** (la escribe J3; la lee el director); ningún archivo de `kit/skills/arquitecto/` borrado ni renombrado.
3. `grep -rniE "bolsillo|en una tarde|o riesgosa|toca permisos/datos/plata" kit/` → 0 (P1.7).
4. **Los diez pedidos: 10 de 10** con `claude.exe -p` (una corrida cada uno, `--permission-mode plan`, `MSYS_NO_PATHCONV=1`, clones de
   `alfa`/`beta` tras `rehacer.sh`): el primer bloque de texto es la línea con el tamaño esperado, y los seis "más que chico" invocan
   `arquitecto` → **crit. 2 del kit** con 10; **con menos, el paquete cierra igual**: el número y el transcript que falló van a Pendientes
   y el crit. 2 queda sin tildar (r1-12).
5. **Las cinco entradas** rutean (las tres sueltas + filas 3 y 6), "adoptá" incluida (P1.1).
6. **Modo B corto**: pedido 5 con plan → sin preguntas, spec sellado (`ready` 0) en **≤ 15 min de reloj** del transcript (P1.2); commit en la
   rama por defecto con `docs/modulos/<x>/README.md` (`director: sí`, `rama: modulo/<x>`) y `SPEC.md` con "Ejecución" y su línea; rama
   `modulo/<x>` y `.claude/worktrees/modulo--<x>` creadas por el script, con `.kit-rol` = `director` → **crit. 4 del kit**. Si `--resume`
   no destraba el OK en `-p`, se mide hasta el pedido de OK y el resto (commit, rama, worktree) lo prueba J2 a mano (r1-12).
6b. **Sin ficha** (r1-3): en un clon sin `.claude/kit.md`, parado en una rama `feature` con un archivo en stage, el Modo B corto termina
   con `docs/SPEC-<x>.md` READY (`ready` 0), **sin commit en `main`, sin push y sin worktree**, y lo de Guido en stage sigue ahí.
7. Modo B largo: la sección "Qué robar y qué no" (P1.3) y la lectura de `NORTE.md` antes del explorador (P1.6). Pantalla: `prototipo/` antes
   del `SPEC.md` (P1.6). Modo A desde una carpeta vacía: monta ahí, y la línea del registro antes de la primera pregunta (P1.6, P1.8).
8. `registro ../vibe-kit-pruebas` devuelve las fichas de `alfa` y `beta` con la forma del contrato (P1.8).
9. `sello`/`ready`/`tope`/`entorno`, **casos sí/no de cada regla**: sin línea, gramática rota, `—` con ficha, ⚠️ sin "no partir", hash
   distinto, sección que falta → `ready` 1 con su mensaje; todo bien → `Estado: READY` y nada más cambia; `real` sin `dummy`, `comando-test`
   rojo, herramienta roja, colgado → `sello` 1; `gate:entorno-prueba` quitado → `—`; tope pasado sin `--no-partir` → 1 con los números y
   las secciones, con él → ⚠️ y `ready` 0. **Mutación** sobre las reglas de `ready` y de la línea, en copias, tope 20 min → **crit. 3 del kit,
   la mitad de `ready`**.
10. `ready --pendientes` y el paso de `/inicio`, en un clon: un módulo con `SPEC.md` sin sello → la línea y la invocación; sellado → nada.
11. `worktree`, casos sí/no de cada subcomando; **H §19bis reproducida** en un repo temporal (nombres, base del encargo en la punta de
    `modulo/<x>`, `.env` copiado, `comando-setup` corrido, la línea de apertura). `crear` y `abrir` → 1 si `.kit-rol`, `worktrees/` o
    `settings.local.json` no están ignorados (r1-5); `abrir` con la rama local atrás → la adelanta; divergida → 1; carpeta borrada a mano y
    registrada → anda (r1-10).
12. **Credenciales**: una variable que está en el almacén falso **y también, por error, en el `.env` del principal** → `grep` en el `.env` del
    worktree da 0, el resto sí viaja, y el valor no aparece en ninguna salida; `settings.local.json` del worktree con los `deny` absolutos y
    lo que ya tenía, intacto; `Read` del `.env` del padre desde el worktree → negado (fila 7). Y (r1-4): corrido **desde el worktree del
    director** saca lo mismo; almacén con BOM → saca; almacén en UTF-16 → 1 y ningún `.env` copiado; renglón `export NOMBRE = "…"` → sacado;
    `.env` trackeado con un nombre del almacén → 1; `sync-env` no pisa un `PORT` propio del worktree (r1-8). **Mutación** sobre el filtro, tope 20 min.
13. **`cerrar`**: sin mergear → 1 y nada borrado; sucio → 1; desde adentro → 1; con solo renglones agregados a `frenos.log` → mudados al
    `kit-frenos.log` común, el archivo como estaba y `git worktree remove` **sin `--force`** anda, **también con `core.autocrlf=true`** (r1-1);
    `frenos.log` cambiado en el medio → 1; **`cerrar x--01` desde el principal parado en `main`, mergeado en `modulo/x` y no en `main` → 0 y
    rama borrada** (r1-2); mergeado solo en `origin/<madre>` → 0; `remove` que falla → la rama sigue. **Mutación** sobre las
    negativas, tope 20 min → cierra "Paquete 4 · de D3.3".
14. **`.kit-rol`**: bytes iguales creado desde PowerShell y desde Bash; `rol()` lo lee con BOM y CRLF; uno en UTF-16 da `desconocido`, nunca
    `humano`; y vivo en `claude.exe -p` lanzado desde PowerShell en el worktree del obrero (fila 7) → **tacha la mitad PowerShell** del NO
    VERIFICADO; la de VS Code queda para Guido.
15. **Crit. 17 del kit vivo** (fila 7): en `<x>--01`, el obrero edita `frenos.quitados`: sus hooks no cambian y su commit da rojo en `barreras`.
16. `claude -w prueba` a mano en un clon (fila 8): `sync-env` y `cerrar` no lo tocan y no tiene `.kit-rol`.
17. `/inicio` y `CLAUDE.md` del molde: `skills.test.cjs` verde con los casos nuevos; `estructura.cjs todo` 0 en `alfa` y `beta`.
18. Suite entera verde **una vez, al final**; `kit-sync` LIMPIO; hash de `~/.claude/settings.json` y `~/.claude/hooks/` reales igual al de la
    apertura de D4.1.
19. Red team sin ALTOS abiertos; el revisor frío leyó el diff entero y lo suyo está arreglado (un encargo) o en "Lo que esto no cierra".

## Los encargos (el director reparte, lee cada diff y corre las pruebas de cada uno)

Presupuesto (ADR-029): ~4 h y ~8 encargos; este delta y el red team ya son dos. **De a dos Opus como máximo**; los Sonnet no cuentan.
Cada encargo en su worktree en `scratchpad/<j>/wt`, con el `cwd` adentro.

| # | Modelo | Qué | Puede tocar (exacto) | Crit. | Depende · paralelo |
|---|---|---|---|---|---|
| J0 | Opus | Este delta | `docs/kit-v3/SPEC-paquete-4.md` | — | — |
| RT | Opus | Red team, una ronda | nada | 19 | J0 · antes de J1 |
| J1 | Opus | `arquitecto.cjs`, `lib/sello.cjs`, `lib/ficha.cjs` (copia), sus pruebas y la mutación | `kit/skills/arquitecto/scripts/**` | 8, 9 | RT · ∥ J2, J4 |
| J2 | Opus | `worktree.cjs`, su prueba y la mutación | `kit/molde/scripts/worktree.cjs`, `kit/molde/scripts/worktree.test.cjs` | 11-14, 16 | RT · ∥ J1, J4 |
| J3 | Opus | `SKILL.md` ≤ 6.000, `modo-a.md`, `modo-b.md`, `flota.md`, `formato-spec.md` v3, las dos líneas viejas, la tabla del crit. 2 | `kit/skills/arquitecto/SKILL.md`, `kit/skills/arquitecto/anexos/{modo-a,modo-b,flota,formato-spec,consultorio}.md`, `kit/skills/arquitecto/templates/universales/CLAUDE.template.md` | 2, 3 | usa la CLI tal como la fija este delta · arranca cuando termina J1 o J2 (nunca tres Opus) |
| J4 | Sonnet | `CLAUDE.md` y `/inicio` del molde, `pedidos.md`, la guía y el manual | `kit/molde/CLAUDE.md`, `kit/molde/skills/inicio/SKILL.md`, `kit/molde/skills/skills.test.cjs`, `pruebas/pedidos.md`, `GUIA-DE-USO.md`, `manuales/COMO-USAR-EL-ARQUITECTO.md` | 3, 10, 17 | RT · ∥ todos |
| J5 | Sonnet | Las corridas `claude.exe -p` de "Lo prueba una sesión real" (filas 1-8), **una por pedido**, en tandas en segundo plano | clones en `scratchpad/j5/`; nada del repo | 1, 4-7, 12, 14-16 | J1-J4 en `main`, y el director corrió `kit-sync.sh sync` y `rehacer.sh` · ∥ RF |
| RF | Opus | Revisor frío, una vuelta, ≤ 10 hallazgos con escenario | nada | 19 | J1-J4 en `main` · ∥ J5 |
| RF-fix | Sonnet (Opus si toca `ready` o el filtro de credenciales) | Los arreglos, en un encargo, sin mutación | lo que liste el director | 19 | RF |

- **Pruebas proporcionales**: casos sí/no de cada regla; mutación solo en J1 (`ready` y la línea) y J2 (el filtro y las negativas de
  `cerrar`), en copias, nunca sobre `kit/`, tope 20 min cada una; la suite entera la corre el director una vez, al final, en segundo plano.
- **J5 corre por prioridad** (D4-18, del director: `[workflow]`, filtro pragmático: ~18 sesiones `-p` no entran enteras en el presupuesto):
  primero las filas que **no necesitan J2**: 1, 2 y 3b (crit. 2, 5 y 6b); después, **si J2 está en `main`**, 3 y 7 (crit. 4, 12, 14, 15); y 4,
  5, 6 y 8 si queda reloj (alineado con el corte; r1-6). Lo que no corra va a Pendientes con su porqué, no se estira.
- **J5 no repite**: si una corrida falla, el director mira el transcript; si el arreglo toca lo que esa corrida mide, se repite **esa** sola, una vez.
- **El orden de prioridad y el corte** (si el director llega a ~3 h sin J2 aceptado, corta ahí):
  1. **J1** y **J3** (el sello y la skill: el crit. 2 vive en J3); 2. **J4**; 3. **las corridas que no necesitan `worktree`** (diez pedidos,
     entradas, Modo B largo, pantalla, Modo A; criterios 1-5 y 7); 4. **J2** y sus filas (6, 7, 8; criterios 6, 11-16); 5. RF y RF-fix
     sobre lo que entró.
  - **Tiene que quedar en `main` sí o sí en D4.1**: J1, J3, J4 y los diez pedidos corridos (con su número, aunque no sea 10).
  - **Pasa a D4.2** si no entra: J2 (en su rama WIP, con qué falta), las filas 6-8 de J5, el revisor frío de lo que falte y el ✅ del
    paquete. El prompt de D4.2 lo arma el director, como el de D3.2.

## Lo prueba una sesión real

| # | Quién · dónde | Qué mirar |
|---|---|---|
| 1 | J5 · `-p` plan, clones de `alfa` y `beta` | Los diez pedidos (crit. 4) |
| 2 | J5 · ídem | Las tres entradas sueltas (crit. 5) |
| 3 | J5 · bypass, clon de `alfa` | Modo B corto con plan (crit. 6); el OK de Guido es un segundo mensaje por `--resume` ("aprobado") |
| 3b | J5 · bypass, clon sin ficha, en una rama `feature` con algo en stage | Modo B corto sin ficha (crit. 6b) |
| 4 | J5 · ídem | Modo B largo con "dale con los defaults" (crit. 7) |
| 5 | J5 · ídem | Pantalla: `prototipo/` antes del `SPEC.md`, aprobado por `--resume` (crit. 7) |
| 6 | J5 · bypass, carpeta vacía en `../vibe-kit-pruebas/` | Modo A con "dale con los defaults": monta ahí, la línea del registro, el molde v2 (crit. 1, 7) |
| 7 | J5 · **desde PowerShell**, en `modulo--<x>--01` creado por el script | `cambios aprobar` negado por el rol; `Read` del `.env` del principal negado; editar `frenos.quitados` y commitear → rojo (crit. 12, 14, 15) |
| 8 | J5 · `-p -w prueba` en un clon | `sync-env` y `cerrar` no lo tocan (crit. 16) |
| 9 | **Guido · VS Code** | Una pestaña de la extensión en `.claude/worktrees/modulo--<x>` (cómo abrirla: NO VERIFICADO, H §10.5): que el arranque y un freno lean el rol; y el Arquitecto en una pestaña real (la línea primero, las preguntas con opciones) |
| 10 | El piloto | Cuánto tarda el Modo B corto con Guido, y si molesta (NO VERIFICADO del SPEC-0) |

## Cruces contra los diseños (la lección de D1.1)

| # | Qué | Qué dice cada uno | Gana |
|---|---|---|---|
| 1 | La línea del sello | SPEC-0 P1.4 y H §8.1: `tamaño ✅ entorno ✅ tope ✅`, sin separador · los deltas de vibe-kit: ` · ` | ` · `, más `hash` y `— (razón)` sin ficha (D4-8) |
| 2 | Qué verifica "tamaño" | H §8.1 no lo dice | La Ejecución declara el tamaño y coincide con la ficha del módulo |
| 3 | `frenos.log` al cerrar | SPEC-0 6.2: `cerrar` commitea `frenos.log` · tracker D3.3: o escribir en `<git-common-dir>` | `cerrar` muda lo suelto al común; el commit antes del merge, al gate del 5 (D4-3) |
| 4 | `integrar` | SPEC-0 6.2, orden 4 · H §10.2: con gate y `/cierre` (el gate es P6.3, orden 5) | Orden 5 (D4-2) |
| 5 | Lenguaje de `worktree` | SPEC-0 "Stack": Bash y PowerShell donde el usuario lo tipea | Un `.cjs` (D4-4) |
| 6 | La línea de apertura | H §10.5: `cd <worktree> && claude …` | `;`: `&&` no existe en PowerShell 5.1 (D4-12) |
| 7 | Cuál es la credencial de escritura | SPEC-0 6.2 no dice cómo se sabe · F §9 y P6.6: vive en el almacén | Lo que está en el almacén no viaja; sin campo nuevo (D4-5) |
| 8 | "Si el usuario de solo lectura no existe, ninguna credencial de ese entorno (y `db consulta` lo dice)" | SPEC-0 6.2 · SPEC-paquete-3 dejó el `db` por stack "al orden 4" | El `db` es de cada proyecto (F §13): llega con el primero que lo necesite (8½ o el piloto); acá, D4-5 |
| 9 | La ficha del módulo | SPEC-0 P3.4, orden 5 · criterio 4 del kit (orden 4) la necesita | Su esqueleto mínimo, en `formato-spec.md`; `tiempos.md`/`planes/`/`bitacora/`, en el 5 (D4-7) |
| 10 | El Modo A | H §8.4: abre `docs/modulos/v1/` · el molde v3 no llega a las PCs hasta el 6 | Molde v2 con Ejecución y sello; el `v1/`, con el instanciador del 6 (D4-6) |
| 11 | Archivar el spec | `formato-spec.md` de hoy: archiva · B §5 y P1.5: no | `COMPLETO <fecha>` |
| 12 | Nombre de sesión con alias (`enlaza:`) | H §10.4 | Orden 5, con la mesa |
| 13 | `.worktreeinclude` que falta | H §10.2: copia lo que lista | Los `.env*` ignorados, con la línea que lo dice |

## Supuestos

- [MEDIO] Que en `-p` el gate del Arquitecto (EnterPlanMode/ExitPlanMode o el OK a mano) se destrabe con un segundo mensaje por `--resume`.
  **NO VERIFICADO**; si no, J5 lo anota y la fila se mide hasta el pedido de OK.
- [MEDIO] Que la línea en tres lugares (arriba del `SKILL.md`, el `CLAUDE.md` del molde, `/inicio`) alcance para el 10 de 10. Si da 9, no hay
  segunda vuelta de corridas: el número va al tracker con el transcript que falló.
- [MEDIO] Que las corridas usen el modelo por defecto de `claude.exe` en esta PC, como D2.2 (J5 lo anota): así se compara con el 6 de 10.
- [BAJO] KB = 1.024 bytes. Los topes de H §12 son NO VERIFICADO (se calibran en el piloto).

## Preguntas para Guido

Ninguna: todo se pudo decidir con la vara. Las que más pesan son D4-1 y D4-3.

## Riesgos y decisiones ⚠️

**Decisiones del redactor** (sin Guido, con la vara de ADR-030; las ⚠️ arriba; todas se deshacen antes del tag):

- ⚠️ **D4-1 · El Arquitecto v3 queda vivo en tus PCs desde el cierre de D4.1** (`kit-sync`, como manda la restricción 1 del `CLAUDE.md`), también
  en tus proyectos v2: **sin ficha trabaja como hoy** (`docs/SPEC-<x>.md`, sin worktree), con la línea del tamaño, el sello y la Ejecución de
  más. `[workflow · consistencia]` *Alternativa*: no sincronizar hasta el tag (contradice la restricción 1 y deja `kit/` sin ser canónico).
  *Si molesta*: revert del commit de J3 y `kit-sync`.
- ⚠️ **D4-2 · `integrar` pasa al orden 5**, con el gate (P6.3) y `/cierre`, que son de ahí. `[mejor código · workflow]` *Alternativa*: uno
  mínimo ahora (merge, candado, test, push) que el 5 reescribe. *Costo*: el Arquitecto no arma un módulo parado en otra rama (una línea).
- ⚠️ **D4-3 · `cerrar` muda los renglones sueltos de `frenos.log` a `<git-common-dir>/kit-frenos.log`**, como los githooks (RF-A2), y no
  commitea; **el commit de `frenos.log` antes del merge** (RT1-14, RT2-12) **lo hace el gate del orden 5**, que es cuando viaja con el merge.
  `[workflow · consistencia · mejor código]` *Alternativas*: commitearlo en `cerrar` (SPEC-0 6.2: después del merge deja la rama sin mergear y
  obliga a mergear desde el worktree del director, con su propio `frenos.log` sucio: la cicatriz de CM-65); o que los hooks de sesión de agente
  escriban siempre en el común (pierde el rastro versionado que lee el gate). *Costo*: los frenos posteriores al último merge quedan en el
  común de esa PC, no en git.
- ⚠️ **D4-4 · `worktree` es un solo `.cjs` de node**, no un par `.sh`/`.ps1` (SPEC-0 "Stack"). `[consistencia · mejor código · acordarse de menos]`
  Anda igual en Bash y PowerShell (como los hooks en exec, D-7), una sola prueba, y Guido no lo tipea: pega la línea que le da el script.
- ⚠️ **D4-5 · La credencial que no viaja = la que está en el almacén**, sin campo nuevo en la ficha; "solo la de solo lectura, o ninguna si ese
  usuario no existe, y `db consulta` lo dice" queda para el `db` por stack (Cruces 8). `[acordarse de menos · mejor código]` *Alternativa*:
  `escritura:`/`lectura:` por entorno (formato que viaja, para un caso que P6.6 ya resolvió sacando la de escritura del `.env`).
- ⚠️ **D4-6 · El Modo A sigue montando el molde v2**; su SPEC-0 suma Ejecución, Entorno de prueba y sello; `docs/modulos/v1/` y el molde v3 llegan
  con el instanciador del orden 6, que comparte con el adoptador. `[mejor código · consistencia]` *Alternativa*: copiar el instanciador de
  `rehacer.sh` a la skill y repartir `kit/molde/` por `kit-sync` ahora (dos instanciadores, y el molde en las PCs antes de su orden).
- ⚠️ **D4-7 · El esqueleto de la ficha del módulo se adelanta** (parte de P3.4) en `formato-spec.md`: el criterio 4 lo necesita. `[consistencia ·
  acordarse de menos]` El orden 5 lo toma de ahí; no hay dos fuentes.
- ⚠️ **D4-8 · El sello lleva `hash` y acepta `— (razón)` solo sin ficha.** `[mejor código · acordarse de menos]` El hash ataja el spec tocado
  después del OK (H §12: "se revirtió 3 veces") y el sello tipeado a mano; el `—` deja sellar los deltas de vibe-kit y los specs de los
  proyectos v2 sin aflojar los v3. *Costo*: corregir un typo después del sello pide `sello` de nuevo (un comando).
- D4-9 · Los scripts del Arquitecto, en la skill global; `lib/sello.cjs` lista para que el 5 la copie al molde (Dónde vive). `[consistencia ·
  acordarse de menos]`
- D4-10 · La línea del tamaño, **primera línea de texto** en tres lugares (Supuestos); se mide en el primer bloque de texto del transcript.
  `[workflow · consistencia]`
- D4-11 · `/inicio` con un módulo sin sello: sin pedido, invoca al Arquitecto; con pedido, una línea y sigue. `[workflow · acordarse de menos]`
- D4-12 · La línea de apertura con `;` (Cruces 6). `[workflow]` D4-13 · `crear` se niega si `.claude/worktrees/` o `.kit-rol` no están
  ignorados o si el módulo no está commiteado. `[mejor código]`
- D4-14 · **El sello de este delta se reescribe con el script** cuando J1 entre (lo que el tracker dice: "desde el 4, el script del sello"),
  con `--no-aplica tamaño "paquete del método"`; `entorno` pasa de `✅` a `— (sin ficha del kit)`, que es lo honesto: el script no lo midió.
  `ready` no se corre sobre deltas de vibe-kit (no llevan "Pedido original"). `[consistencia]`
- D4-15 · Las corridas con el modelo por defecto (Supuestos). `[consistencia]` D4-16 · Guía y manual: solo la regla vieja (orden 8).
  `[consistencia]` D4-17 · `$HOME` en PowerShell. `[workflow]`
- *Descartados*: que `crear`/`cerrar` se nieguen desde un obrero (sin cicatriz: "por las dudas"); un `.worktreeinclude` en el molde (la falta
  ya tiene default); el nombre de sesión con alias (orden 5).

### Lo que esto no cierra

- **Un sello con el hash bien calculado a mano** (copiado de lo que imprime el script) pasa `ready`. La red es el commit y, en el 5, el
  revisor y el gate.
- **Una credencial de escritura cargada por error con `--al-env`** (no está en el almacén): viaja al worktree. Lo ataja F §9 (`cargar-secreto`
  lo dice) y el `deny`; el script no la distingue.
- **Un `git worktree add` o `claude -w` hecho a mano por un agente**: sin `.kit-rol`, sus hooks lo ven `humano`. El candado lo caza al
  commit, y `cerrar` no lo toca.
- **Un programa del obrero que lee el almacén por adentro** (sin sandbox; ya en Riesgos del SPEC-0).
- Un obrero que edita `worktree.cjs` en su rama (llega al módulo con el merge); los frenos de sus herramientas no lo miran.
- Del red team (r1, "para no cierra"): el obrero que lee el `.env` del principal por Bash (`cat ../../../.env`; el `deny` es de
  Read/Edit/Write, y el corrector de secretos lo frena solo si el nombre está en `secretos:`); los `.env` anidados del principal
  (`backend/.env`), fuera del `deny` absoluto; un `.env.production` viejo con una credencial real que nunca pasó por el almacén (lo atajan el
  8½ y el `doctor`); un formateador que parte la línea del sello (`sello` de nuevo); un `comando-test` intermitente que impide sellar
  (salida: `gate:entorno-prueba` en `frenos.quitados`).
- `cargar-secreto` corrido adentro de un worktree guarda en otro almacén (calcula `<proyecto>` desde el `cwd`): pendiente del orden 6, no de este.

## Lo que se prueba más adelante

**Orden 5**: `integrar` con el gate (y el commit de `frenos.log` antes del merge), el corrector "spec sin sello" y la parada de `/obrero` (la
otra mitad del crit. 3), la copia de `lib/sello.cjs` al molde, `.kit-noche`, `tiempos.md`/`planes/`/`bitacora/`, nombres con alias. **Orden 6**: el
Modo A con el molde v3 y `docs/modulos/v1/`, el molde en las PCs, "adoptá" y "poné al día" de verdad. **Guido**: fila 9. **El piloto**: fila
10, `core.longpaths` y `comando-test` que no entre a `.claude/worktrees/` (H §10.10), `--bg` y `--resume` en el worktree (H §10.11).

## Red team (Opus, `redteam-spec`, una ronda; el informe, al repo privado)

| Id | Sev | Qué se hizo |
|---|---|---|
| r1-1 | ALTO | `cerrar` compara `frenos.log` contra `HEAD` normalizado a LF y lo devuelve con `git checkout --` (`core.autocrlf=true` verificado en `Usuario`); caso en crit. 13 |
| r1-2 | ALTO | `cerrar`: `merge-base --is-ancestor` contra la madre local u `origin`, chequeos → `remove` → `branch -D`; caso "desde el principal" en crit. 13 |
| r1-3 | ALTO | `modo-b.md` sin ficha: sin commit, push ni worktree; "Pedido original" puede decir "(no quedó registrado)", nunca inventado; crit. 6b y fila 3b |
| r1-4 | ALTO | El filtro falla cerrado: `<proyecto>` del principal, almacén ilegible → 1, BOM, `export`, multilínea, `.env` trackeado → 1; casos en crit. 12 |
| r1-5 | ALTO | `crear` y `abrir` exigen `settings.local.json` ignorado, y la línea pega el snippet entero |
| r1-6 | MEDIO | `modo-b.md`: sin `worktree.cjs`, no lo arma a mano; prioridad de J5 alineada con el corte |
| r1-7 | MEDIO | El hash normaliza (BOM, CRLF, espacios finales, saltos finales) y excluye solo la primera `- Estado:`; "¿hay ficha?" igual en `sello` y `ready` |
| r1-8 | MEDIO | `sync-env` solo saca, nunca vuelve a copiar |
| r1-9 | MEDIO | `remove` que falla → lo dice y no borra la rama. *Recortado*: la marca de sesiones vivas de menos de 12 h (no existe ese mecanismo; "por las dudas") |
| r1-10 | MEDIO | `abrir`: mismas negativas, `fetch`, `prune`, adelanta o 1 si divergió |
| r1-11 | MEDIO | `/inicio`: "cambió después del sello" da una línea y no invoca; valores de `Estado:` fijos en `formato-spec.md` |
| r1-12 | MEDIO | Crit. 4: con menos de 10 cierra igual con el número en Pendientes; crit. 6: sin `--resume`, se mide hasta el OK |

**Ronda 1 (2026-10-30): 5 ALTOS, los cinco integrados** (texto, sin rediseño); veredicto del red team: "con eso aplicado se puede sellar sin
otra ronda". ADR-029: una ronda. **El director sella el delta sin Guido.** Informe: `vibe-research/mision-5/redteam-paquete-4/RONDA-1.md`.
