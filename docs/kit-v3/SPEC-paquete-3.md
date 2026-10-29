# SPEC delta: paquete 3 — seguridad: corrector de secretos, hook de git, preguntas de `sensible:`, pre-commit, `cargar-secreto`, hooks por PC y `doctor` mínimo — vibe-kit
Ningún agente ve, imprime ni commitea una clave; ningún git borra trabajo ni esquiva el pre-commit; las 5 de A preguntan solo donde la
ficha dice que duelen; y si un freno se rompe, frena.
- Estado: BORRADOR (D3.1, 2026-10-29) — se sella provisorio "sellado sin Guido" después del red team
- Fecha: 2026-10-29
- Misión: 5, director **D3.1**, sin Guido (tracker, "Cambios al plan", 2026-10-29)
- Plano: [`SPEC-0-kit-v3.md`](SPEC-0-kit-v3.md), orden 3 = **P4.3-4.7, P6.6, P6.7, "instalar hooks por PC" (P2.2), `doctor` mínimo (P2.3)**,
  más **"Paquete 3 · de D2.2" (a)-(d)** del tracker y **las líneas de F del arranque** (P4.1, RF-9). Diseño: F §4-§17 · A §2-§6 · E §4, §5, §10 · B §9.
- Sello del Arquitecto: `arquitecto: 2026-10-29 · kit 2.4.3 · chequeos: tamaño — (paquete del método) · entorno ✅ (../vibe-kit-pruebas/ y HOME
  falso) · tope <al sellar> · sellado sin Guido (provisorio)` — pendiente del red team.
- Red team: **obligatorio** (secretos, permisos, datos; RF-16), Opus con `redteam-spec`, hasta 3 rondas, la última sin ALTOS. Revisor frío
  Opus al cerrar, sobre el diff entero, **recorriendo el día normal** (dos PCs, `pull`, worktrees, Modo A), no solo ataques (lección de D2.2).

## Por qué (el dolor)

Un subagente frenado en Bash escribió lo mismo con `Write` (H-161). Un implementador corrió `git checkout -q -- .` sobre el árbol de otra
sesión (CM-65). ~25 cierres con falsas alarmas del escáner (F §10). Un freno que falla deja pasar, también en bypass (RT1-1). Y en bypass
se puede fabricar un `aprobado` (r4-1 b, rf-5).

## Contexto (explorado el 2026-10-29)

- **Ya existe** (paquete 2): `niega-aprobar.cjs` (el modelo de un hook que niega), `contexto.cjs` (`fichaVigente`, `refVigente`, `rol`,
  `pestana`), `frenos-log.cjs`, `barreras.cjs` (lo pendiente = índice **y** disco), `estructura.cjs`, `zona-propia.leerJsonSinDuplicados`.
  **El `settings.json` del molde no trae el `deny` de archivos de F §5**: ninguna P lo construye y el criterio 11 lo da por hecho.
- **Esta PC** (`clientes`, solo lectura): `block_secrets.ps1`, `PreToolUse` sobre `Bash` solo, cinco patrones, falla abierto, **~10-11 s por
  cada Bash** (G0). gitleaks está (winget), pero `gitleaks version` no respondió en 120 s al explorar. Claude Code 2.1.308 y 2.1.309.
- **El hook de Hermes** (CM-65; 225 casos, la mitad negativos) **falla abierto**: se portan la forma y los casos; la falla se da vuelta.
- **G0, hecho por el director** (`claude.exe` 2.1.309 `-p`, clones de `alfa`): **verde**. Con `"onFailure": "block"` frenan los cuatro (sin
  ejecutable, salida 1, colgado —a los 5 s con `timeout: 5`, a los 20 con `20`—, JSON inválido), con `Bash` y `PowerShell`; sin el campo,
  pasan. Doc: "Requires Claude Code v2.1.295 or later". **El `.cjs` se relee en cada llamada** (se tacha ese NO VERIFICADO). En `default` la
  plataforma ya niega un `cp` a `.claude/hooks/`. **Un `deny` con ruta absoluta anda en Windows** (`Read(//c/Users/…)`), también en un clon
  sin confianza. En un subagente la entrada trae además `agent_id` (hereda el rol). **Sin Git Bash, `$CLAUDE_PROJECT_DIR` no se expande** (D-7).
- **G1, hecho**: el corpus en `historial/` del scratchpad de D3.1 (`correr.cjs`): 2.218 transcripts, **91.298 llamadas únicas** (Bash
  53.568, Edit 10.275, Write 5.123, PowerShell 1.117); `permission_mode` en ~40%.
- `kit-sync` copia `kit/skills/arquitecto-skills/` entera a cada PC **como archivos, sin registrar nada**: no es "tocar el `~/.claude/` real".

## Dónde vive cada pieza

| Pieza | Fuente en el kit | Instalada en | La registra |
|---|---|---|---|
| Hook de git (4.4) · las 5 de A (4.5, 6.7) | `kit/molde/hooks/git-seguro.cjs` · `sensible.cjs` | `.claude/hooks/` de cada proyecto | `settings.json` del molde |
| El recorrido de comandos · la guardia de `db` (6.6) | `kit/molde/hooks/lib/comando.cjs` · `db-guardia.cjs` | ídem | — · la llama el `db` de cada stack (orden 4) |
| Pre-commit, pre-merge-commit, pre-push (4.6) | `kit/molde/githooks/` | `.githooks/` (con `+x`) | `core.hooksPath`, el arranque |
| Corrector de secretos (4.3) · `cargar-secreto` | `kit/skills/arquitecto-skills/pc/` (`secretos.cjs`, `lib/`, `cargar-secreto.sh`/`.ps1`) | `<home>/.claude/hooks/kit/` | `instalar-hooks-pc.cjs` |
| Instalador y `doctor` | `kit/skills/arquitecto-skills/scripts/` | `~/.claude/skills/…` (`kit-sync`/Equipador) | — |

- **Cómo se instancia, suma**: `kit/molde/githooks/**` → `.githooks/**`, ejecutable (`update-index --chmod=+x`). `pc/` no se instancia.
- **El hook por PC nunca hace `require` fuera de su carpeta** (un obrero edita las librerías del proyecto): `pc/lib/` trae copias de `git`,
  `ficha`, `contexto`, `frenos-log`, `comando` y `zona-propia`, **versionadas**, y una prueba exige que sean **idénticas byte a byte** a las del
  molde (anti-desvío; D-12). Las pruebas de `pc/` y `scripts/` viven al lado: `kit-sync` las copia (no molestan), el instalador no.

## AGREGA

### P4.7 · Lo que comparten los hooks que niegan (RT1-1, RT2-3)

Para `secretos.cjs`, `git-seguro.cjs`, `sensible.cjs` y el `niega-aprobar.cjs` que ya existe.
- **Registro**: `PreToolUse`, `"timeout": 20`, `"onFailure": "block"` (G0), `node "<ruta>"` sin `.sh`. Los del proyecto con
  `$CLAUDE_PROJECT_DIR` (pide Git Bash: D-7); el de la PC con la **ruta absoluta en `/`, sin variables**.
- **Forma**: `decidir(entrada, opciones)` pura → `nada` · `ask` · `deny` (motivo y renglón); `principal()` lee, imprime el JSON y ante
  cualquier error imprime `deny` **"freno roto: corré doctor"**; si ni eso, sale 2. **Ningún `.propio.sh`** (⚠️ de D2.2).
- **Barato cuando no frena**: no lee la ficha ni llama a git hasta que algo de fábrica frenaría. `sensible.cjs` necesita las listas: **caché en
  el `git-dir` común por el sha de la ref vigente**. Los hooks corren en paralelo (doc): **p95 ≤ 300 ms por llamada**, medido.
- **La ficha**: `fichaVigente` (regla 4.7). **Sin ficha**: fábrica, nada quitado, sin error. **Rota**: fábrica sin nada quitado, y el motivo
  suma `ficha rota: <archivo>:<línea> — corré doctor`; `sensible:`, `secretos:` y `publicas:` salen de **la última ficha que se lee** en la ref
  (hasta 20 commits, como rf-14), porque "de fábrica" ahí es "nada pregunta". Así "ficha malformada → frena" sin trabar todo `ls`.
- **`frenos.quitados`**: un id con `hasta:` vigente apaga ese caso y nada más.
- **Renglón** (formato de D2.1, igual): detalle = el caso, la clave de `sensible`, **el nombre** de la variable o el archivo relativo; **nunca
  el comando, un valor ni un recorte**. Sin ficha, el de la PC escribe en `<home>/.claude/hooks/kit/frenos.log`.
  Un `ask` también deja renglón (`preguntó`): la regla 2 de A mide lo que molesta.
- **Los cuatro casos por hook** (crit. 16): sin node → frena · ficha rota → frena con el motivo · error interno → "freno roto" · sin remoto ni
  ficha → fábrica y nada se traba.

### Base · `lib/comando.cjs`, el recorrido (port de Hermes)

`partir(texto, {ps})` → los comandos simples `{argv, redirecciones}` de Bash o PowerShell: comillas, escapes, `;`, `&&`, `||`, `|`,
subshells, heredocs, y lo de adentro de `bash -c`/`sh -c`/`cmd /c`/`powershell -Command`/`pwsh -c`/`eval` (hasta 4 niveles), saltando
`env X=1`, `time`, `nohup`, `sudo`, `command`. Mira **lo que se invoca**, no un pedazo de texto (`git commit -m "git stash"` no es un stash);
PowerShell sin mayúsculas. Es el único que parte comandos (los tres hooks y la medición). No es frontera (Lo que esto no cierra).

### P4.4 · `git-seguro.cjs` (F §6; A §6; RT2-2, RT3-1, RT-p2 4; rf-5, rf-16)

`PreToolUse` sobre `Bash|PowerShell`. **Niega siempre**, todo modo, todo rol; mensaje con alternativa. `git` con sus opciones globales
(`-C`, `-c`, `--git-dir`, `--work-tree`). Ids `hook:git-seguro/<caso>`:

| Caso | Frena | No frena | Alternativa |
|---|---|---|---|
| `stash` · `reset-hard` · `clean-f` | stash salvo `list`/`show`; `reset --hard`; `clean -f` sin `-n` | `reset --soft`/`--mixed` fuera de la rama por defecto; `clean -n` | commit de trabajo en curso por rutas |
| `restaurar-arbol` | `checkout`/`restore` de `.`, `*`, `:/` o una carpeta; `checkout -f`; `switch -f`/`--discard-changes` | un archivo nombrado, `checkout <rama>` | nombrá el archivo |
| `push-force` · `push-punto` | `--force`, `-f`, `--force-with-lease`, `--force-if-includes`, refspec con `+`; `push .` | `push` | borrá la rama remota y subila de nuevo (F §6) |
| `update-ref` · `replace` · `symbolic-ref` · `branch-f` | los dos primeros; `symbolic-ref` con valor o `-d`; `branch -f`/`-M`/`-C` | `symbolic-ref -q HEAD`, `branch -d` | "mover una rama a mano no se hace" |
| `fetch-a-remotes` | `fetch` con destino `refs/remotes/*` | `fetch`, `fetch origin` | `git fetch` sin refspec |
| `remote-set-head` · `remote-set-url` · `remote-remove` · `config-default-branch` · `hooks-path` | esos; `core.hooksPath` por `config` (con `--unset`), `-c` o `--config-env`; `config init.defaultBranch <x>` | `remote -v`, `config --get` | "lo setea el arranque" |
| `no-verify` | `--no-verify` en cualquier subcomando; `commit -n` (también `-an`) | **`push -n`** (es `--dry-run`) | arreglá lo que frena; falsa alarma → `.gitleaksignore` (pide `aprobado`) |
| `worktree-remove-force` · `matar-por-nombre` | `worktree remove -f`; `taskkill /IM`, `pkill`, `killall`, `Stop-Process -Name` | sin `-f`; por PID | `worktree cerrar` (orden 4); `taskkill /PID` |
| `update-index` (d) | `--skip-worktree`, `--assume-unchanged` | `--no-…`, `--chmod` | commitealo o anotalo |
| `historia-defecto` (d, rf-16) | parado en la rama por defecto: `reset <commit>` (cualquier modo; resuelve a commit y no es `HEAD`) y `rebase` (salvo `--continue`/`--abort`/`--skip`/`--quit`) | `reset`, `reset -- <rutas>`, **`pull --rebase`** (rf-1) | `git pull --rebase`; para deshacer, `git revert` |
| `salir-del-worktree` (d, rf-5) | en sesión de agente (P4.3): `cd`/`pushd`/`Set-Location`, `git -C`, `--git-dir`, `--work-tree` al checkout principal (la carpeta de `git-common-dir`) | director, humano, rutas del propio worktree | "lo del principal se lo pedís al director" |

Se porta la tabla de Hermes. Hecho cuando (SPEC-0 4.4): casos sí/no, los nuevos medidos contra el historial, ningún git de los `SKILL.md`
del molde frena (una prueba los pasa por `decidir`), y `commit --no-verify` negado en todo modo, también bypass.

### P4.5 y P6.7 · `sensible.cjs`, las 5 de A desde la ficha (A §2; F §13-§14; RT1-11)

`PreToolUse` sobre `Bash|PowerShell|mcp__.*` (D-9). **Lee `sensible:` de la ficha vigente en cada llamada**, con el caché (D-1).
- **Cómo matchea** (contrato): cada entrada se parte con `comando.cjs`; **matchea si algún comando simple empieza con esas palabras**
  (PowerShell sin mayúsculas). Una entrada `mcp__…` matchea por igualdad con `tool_name`. **Una en prosa no matchea nada** y `doctor` la lista.
  **Toda palabra `--borra-datos-reales`** cuenta como `datos-reales` (la bandera de `db migrar`, D-4).
- **Ids**: `datos-reales` → `pregunta:borrar-datos-reales` (como el ejemplo y SPEC-0 6.3); las otras, `pregunta:<clave>`.
- **Devuelve**: quitado vigente → nada. **De noche o sin ventana** (`.kit-rol` `nocturno`; `permission_mode` `bypassPermissions`, `dontAsk`,
  ausente o desconocido) → **`deny` con PARADA**: "esto es «<la pregunta>» (sensible: de la ficha) y sin una persona no se hace: dejá PARADA en
  tu bitácora con qué necesitabas y pará" (la PARADA de verdad, con `/obrero`, orden 5). En `default`, `acceptEdits`, `plan` y `auto`, cualquier
  rol → **`ask`** (crit. 7). `.kit-noche` no se lee todavía (orden 5). `niega-aprobar.cjs` sigue aparte, tal cual.
- Hecho cuando (P6.7): las 5 son clic solo donde la ficha lo dice; **editar `sensible:` en un worktree no cambia nada** hasta el merge.

### P4.3 · `secretos.cjs`, el corrector de la PC (F §7, §11; RT1-4, RT2-2)

`PreToolUse` sobre `Bash|PowerShell|Write|Edit|MultiEdit|NotebookEdit`, y `UserPromptSubmit` aparte (D-5). Corre en todo proyecto, con kit o
sin él. Ids `secretos:<qué>`, quitables por la ficha del proyecto del `cwd`. Mira `command`, `content`, `new_string` (`edits[]`, `new_source`)
y el prompt.

| Id | Frena |
|---|---|
| `github-pat` · `github-fino` · `sk-api` · `supabase-token` · `twilio` | los cinco de `block_secrets.ps1`, tal cual |
| `aws` · `clave-privada` · `slack` · `google-api` · `stripe` | `AKIA[0-9A-Z]{16}`, `-----BEGIN … PRIVATE KEY-----`, `xox[baprs]-`, `AIza…`, `sk_live_`/`rk_live_` (de gitleaks, costo cero) |
| `jwt` | `eyJ….eyJ….…`, **salvo** en el archivo de `datos-de-prueba:`, asignado a un nombre de `publicas:` (`NOMBRE=…`, `"NOMBRE": "…"`), o con `"role":"anon"` en el cuerpo (la llave anónima de Supabase, F §7.1) |
| `archivo-deny` | lectores (`cat`, `type`, `Get-Content`, `head`, `tail`, `sed`, `grep`/`rg`/`Select-String`/`findstr` **con la ruta**), copiadores (`cp`, `Copy-Item`, `mv`), intérpretes con `-c`/`-e` que la nombran, `curl` con `@<ruta>` — sobre los 9 de F §5, `~/.config/kit-secretos/**` y los `Read(...)` de los `settings*.json` del proyecto (raíz por git desde el `cwd`) |
| `imprime-todas` | `printenv`, `env` y `set` **sin argumentos** (no `set -e`, no `env X=1 cmd`), `export -p`, `declare -p`, `Get-ChildItem Env:` sin nombre; con o sin ficha (F §9) |
| `imprime-variable` | `echo`/`printf` de `$X`, `$env:X`, `printenv X`, `Get-Item Env:X`, `GetEnvironmentVariable('X')`, si `X` está en `secretos:` o tiene `TOKEN`, `SECRET`, `PASSWORD`, `API_KEY` (se mide) |
| `credencial-guardada` | `gh auth token`, `gh auth status -t`/`--show-token`, `git credential fill`, `git credential-manager get` |
| `frenos-del-proyecto` | **en sesión de agente**: `Write`/`Edit` sobre `.claude/hooks/**`, `.claude/settings*.json`, `.githooks/**`, `.kit-rol`, `<git-common-dir>/config` y `/hooks/**` (D-10); y todo Bash/PowerShell que nombre esas rutas **salvo la lista de lectura** (los lectores, `ls`, `git diff`/`log`/`show`/`status`/`blame`, `node <la ruta>` como programa, `diff`, hashes): lo permitido, no lo prohibido (F §12) |
| `frenos-de-la-pc` | toda sesión: lo mismo sobre `<home>/.claude/hooks/kit/**` y `<home>/.claude/settings.json` (el camino es el instalador, que esto no frena) |
| `cambios-sin-ventana` | en `bypassPermissions`/`dontAsk`, todo Bash/PowerShell que nombre `.claude/cambios/` salvo `node .claude/scripts/cambios.cjs` sin otra mención (achica r4-1 b) |

- **Sesión de agente** = pestaña obrero (rama `modulo/<x>--<ID>`) **o** `.kit-rol` `obrero`, `nocturno` o `desconocido`: las dos, porque
  `.kit-rol` es lo que se protege. **`actualizador` no** (reescribir hooks es su trabajo; lo cubre `barreras`); director y humano, no.
- **Mensaje** (F §7.2): "no lo escribas ni lo pegues: pedile al humano `cargar-secreto NOMBRE` y usá el comando o la variable", con la
  línea exacta para Git Bash y PowerShell.
- **`UserPromptSubmit`**: los patrones sobre lo que tipea Guido → `decision: block` con el mismo mensaje, **sin `onFailure: "block"`** (D-5).

### P4.6 · `core.hooksPath`, pre-commit y pre-push (F §10; RT1-7, RT2-4, RT2-9; r4-3, rf-7, rf-10)

- **`core.hooksPath`**: lo setea `session-start.cjs` con su propio git (no es una herramienta), **solo si está vacío**, a `.githooks`
  (relativo: vale en cada worktree). Si dice otra cosa (husky, lefthook) **no lo pierde**: lo guarda en `kit.hooksPathPrevio`,
  apunta a `.githooks` y el pre-commit del kit corre después el previo; si está vacío pero hay `<git-common-dir>/hooks/pre-commit` (no `.sample`), lo
  encadena igual. Sin `.githooks/` en el árbol, nada.
- **`.githooks/pre-commit`, `pre-merge-commit`, `pre-push`**: `sh` de tres renglones (git en Windows usa su `sh`, también desde PowerShell)
  que llaman a `node .githooks/kit-githook.cjs <cuál> "$@"`. **Sin node, sale 1 para todos**: nunca verde en silencio. `pre-merge-commit`
  porque un merge automático no corre `pre-commit`.
- **pre-commit** (y pre-merge-commit), en orden: gitleaks `git --staged --redact --no-banner`; `barreras --indice` (**solo el índice**, rf-10);
  el hook previo. Sale 1 si alguno da rojo, con sus líneas (`archivo:línea`, tapado).
- **pre-push**: por cada ref que sube (no los borrados), `<remoto>..<local>`, o si la rama es nueva `rev-list <local> --not --remotes`:
  gitleaks `git --log-opts=<rango> --redact` y `barreras --rango`. Cierra rf-7.
- **El candado corre desde la ref vigente, no del disco** (pendiente b; r4-3): el runner saca `.claude/scripts/estructura.cjs` y
  `.claude/hooks/lib/**` de `refVigente` (con remoto, `origin/<rama por defecto>`; sin remoto, la rama local por defecto, o sea **lo
  commiteado**) con **un solo `git cat-file --batch`** a un temporal fuera del repo, y lo corre con el `cwd` en el repo (sus `require` son
  relativos). Si la ref no lo tiene (primer commit, o el repo recién recibe el orden 3): el del índice, y lo dice. Si la versión de la ref no
  conoce `--indice` (sale 2: es del orden 2), reintenta sin él (más estricto) y lo dice. El runner mismo corre del disco (D-12).
- **Sin gitleaks** (RT1-7): con rol `humano`, `director` u `obrero`, pasa y sale **en rojo** `⚠️ sin escáner en esta PC: corré "preparame esta
  PC"`, con renglón; con `.kit-rol` `nocturno`, `actualizador` o **`desconocido`** → **sale 1**.
- `estructura.cjs` suma **`--indice`** y **`--rango <a>..<b>`**, solo con `barreras`.
- **Líneas de F del arranque** (500 reservados): `barreras de fábrica: N de N ✅` o `⚠️ falta <regla> · corré doctor` (por nombre, contra el
  `settings.json` menos `frenos.quitados`; F §15) · `corrector de la PC: ✅` o `⚠️ no está · pedile al Equipador "instalar hooks por PC"` ·
  `pre-commit: ✅` o `⚠️ <qué falta>` (gitleaks: se busca el archivo en el `PATH`, no se lo corre). Las de `gh`, no (D-11).

### P6.6 · `cargar-secreto`, el almacén y la guardia de `db migrar` (F §8-§9, §13; RT2-5, RT3-4)

- **`cargar-secreto.sh NOMBRE [--al-env]`** y **`.ps1 NOMBRE [-AlEnv]`**: `NOMBRE` en `MAYUSCULAS_CON_GUION_BAJO` (si no, sale 2). Valor **con
  entrada oculta** (`read -s`; `Read-Host -AsSecureString`); con la entrada redirigida, un renglón (pruebas, gestor de claves). Por defecto a
  **`$HOME/.config/kit-secretos/<proyecto>.env`** (PowerShell: `$env:USERPROFILE\.config\kit-secretos\`); `<proyecto>` = `vars.proyecto` de la
  ficha del disco, si no la carpeta raíz, en `[a-z0-9-]`. `--al-env`, al `.env` del proyecto (solo `dummy`, `prueba` y solo lectura: lo dice).
  Reemplaza el renglón si estaba; temporal y renombre; **relee y compara** (F §9); en Unix, `chmod 600`. **Nunca imprime el valor ni su
  largo**; **nunca toca una variable del sistema** ni de usuario.
- `Read(~/.config/kit-secretos/**)` lo suma el instalador al `settings.json` de la PC; el corrector lo tiene en su lista.
- **`lib/db-guardia.cjs`** (sin base real): `juzgar({raiz, entorno, plan, rol, banderas})` → `{ok}` o `{niega, id, motivo}`; el `db` de cada
  stack la llama antes de aplicar. `clase` distinta de `real` → ok. **Sin ficha o entorno no declarado → `real`** (ruidoso antes que mudo).
  Contra `real`:
  1. `hash` del plan = `ficha.hash` de `ruta\0texto\0` de cada archivo, por ruta. **Sin `.claude/revisiones/<hash>.md` commiteado en `HEAD`**
     con `veredicto: aprobado` y `hash: <hash>` → niega `db:sin-veredicto` (hasta P6.10, orden 5, toda migración `real` se niega).
  2. **Borra** si el SQL (sin comentarios ni mayúsculas) trae `DELETE FROM`, `DROP TABLE`, `TRUNCATE [TABLE]` o `ALTER TABLE … DROP` sobre una
     tabla de `sensible.datos-reales` (las entradas de **una palabra**, con o sin esquema), o `DROP SCHEMA`/`DATABASE` siempre. Entonces:
     quitado `pregunta:borrar-datos-reales` → sigue; `nocturno` → niega `db:borra-de-noche` con PARADA; si no, **sin `--borra-datos-reales`
     niega** `db:borra-datos-reales` con la línea lista, y con la bandera pasa: **la ventana la puso `sensible.cjs`** (D-4).
- El molde suma `deny` de `Write`/`Edit(./.claude/revisiones/**)`, como `cambios/` (RT1-5).

### "Instalar hooks por PC" y el `doctor` mínimo (P2.2, P2.3; E §10; F §7.3, §9; RT1-11, RT2-11)

**`instalar-hooks-pc.cjs [--home <dir>] [--plan] [--quitar] [--sacar-viejo]`** (sin `--home`, el real; las pruebas, siempre uno falso):
- Copia `pc/**` (sin pruebas) a `<home>/.claude/hooks/kit/`. Registra en `<home>/.claude/settings.json` **por regla**: un grupo `PreToolUse`
  propio, el `UserPromptSubmit` y el `deny` del almacén. Lo del kit se reconoce por `/.claude/hooks/kit/` en el comando; lo demás no se toca.
  Una entrada del kit distinta se reemplaza; igual → **"sin cambios"**, byte a byte.
- **No toca y sale 1** con JSON inválido o claves duplicadas (F §9). Temporal, renombre, **relee y compara**; conserva orden y fin de línea.
- **El anti-secretos viejo** (un `PreToolUse` fuera de `hooks/kit/` cuyo archivo tiene `ghp_`): lo deja y lo dice; `--sacar-viejo` saca solo
  su registro. `--plan` dice qué haría. `--quitar` saca lo del kit y deja el resto como estaba (el "cómo se deshace").

**`doctor.cjs [--home <dir>]`**, solo lectura, una línea por chequeo `✓|✗|⚠ <id> · qué · cómo se arregla`, orden fijo, **igual en dos
corridas**, sale 0 sin `✗`; lo externo con plazo de 5 s. Ids `doctor:<x>`: `node` (≥ 20) · `gitleaks` (≥ 8.19, el subcomando `git`) ·
`claude-code` (cada versión que encuentra —`claude --version`, `%APPDATA%\Claude\claude-code\<v>\`, la extensión— contra **2.1.295**, D-8) ·
`git-bash` (D-7) · `settings-pc` (sin duplicadas ni JSON roto) · `hooks-pc` (registrado con `onFailure: "block"` y `timeout: 20`, el archivo
existe) · `hooks-pc-iguales` (iguales a los de la skill; uno editado se reporta, no se pisa: F §7.3) · `deny-almacen` · `anti-secretos-viejo`
(`⚠` "sacalo cuando confirmes (`--sacar-viejo`); además demora cada Bash") · **`plazo-arranque`** (a: `KIT_PLAZO_ARRANQUE_MS` en el entorno o
en un `env` de los `settings` → `✗` "es solo para pruebas: sacala") · `pre-commit` (en el repo del `cwd`: `core.hooksPath` = `.githooks` y los
tres archivos; fuera de un repo, salteado) · `ficha` (rota → `✗`) · `sensible-prosa` (entradas cuyo primer token no está en el `PATH` ni es
un archivo del repo → `⚠` "no es un comando: no pregunta nada").

El Equipador suma **"Modo HOOKS POR PC"** a su `SKILL.md` (~1 KB): `--plan` → se lo muestra a Guido → **una pregunta** → aplica → `doctor` →
"reiniciá Claude Code". "Preparame esta PC" completo es del orden 6.

### La medición contra el historial (A §5.2; SPEC-0 4.3 y 4.4)

Sobre el corpus de G1 (**solo en el scratchpad de D3.1, nunca en el repo**: tiene secretos reales). El encargo de `secretos` le suma los
mensajes del usuario (para `UserPromptSubmit`). Cada encargo de un freno corre su `decidir()` con `correr.cjs` (`sensible` con la ficha de
`kit.ejemplo.md` y rol humano). **`permission_mode` falta en ~60%: lo que depende del modo se cuenta aparte "sin modo"** (ahí `sensible` y
`niega-aprobar` niegan por diseño). El informe da id, cuántos y un recorte de 60 caracteres **con todo valor tapado** (`****`). Cada acierto
se clasifica a mano; **con un falso positivo, se corrige y se vuelve a medir**. El conteo va al tracker.

### `pruebas/rehacer.sh`, el paso "molde v3 orden 3"

`alfa` y `beta` reciben lo nuevo en un commit `molde v3 orden 3` **sobre** el `2b`, que **se congela** en `D22=37906e8` (el último commit de
D2.2 que tocó `kit/molde/`, como `D21`): si no, se tragaría lo del orden 3. `barreras --molde` 0, sin `--molde` 1, después del push `todo` 0.
`.githooks/` con `+x`; **no setea `core.hooksPath`** (es del arranque). `gama`, igual. Dos corridas, lo mismo.

## MODIFICA

- `kit/molde/settings.json`: los `PreToolUse` de `git-seguro` y `sensible` (4.7); el `deny` de F §5 (9 `Read`, ninguna `Bash(...)`, que
  apagaría PowerShell: F §4; D-6); `deny` de `Write`/`Edit(./.claude/revisiones/**)`. `lib/fabrica.cjs` exporta la lista (`DENY_FABRICA`).
- `lib/barreras.cjs`, `candado.cjs`, `cambios.cjs`, `scripts/estructura.cjs`: `--indice`, `--rango`, y los ids de ficha suman
  **`secretos:<NOMBRE>` (sacar uno) y `publicas:<NOMBRE>` (sumar uno), en `frenos`, solo cuando aflojan** (D-3).
- `session-start.cjs`/`inyeccion.cjs`: `hooksPath` y las líneas de F. `skills/cierre/SKILL.md`: "si el pre-commit frena, se arregla; nunca
  `--no-verify`". La `SKILL.md` del Equipador: el modo. `docs/README.md`: la fila. Notas con fecha en F, A, E y el SPEC-0 (Cruces).

## NO SE TOCA

- **El `~/.claude/` real de ninguna PC** (ni `settings.json`, ni `hooks/`, ni `block_secrets.ps1`); solo llega lo que copia `kit-sync`, sin
  registrar. Instalar es de Guido.
- El kit v2, el `.claude/` de vibe-kit, la flota, `tips/`, `_fuente/`, `kit/VERSION` (`2.4.3`), la gramática de `ficha.cjs`, los formatos de
  `frenos.log` y `cambios` (salvo los ids de D-3), `niega-aprobar.cjs` (G0 dio verde: su registro queda).

## Criterios de aceptación

1. ✅ **G0** (2026-10-29, 2.1.309): las cuatro fallas frenan con `onFailure` y pasan sin él; relectura del hook y `deny` absoluto, verdes.
2. Suite verde; cada freno con casos sí/no; **mutación por freno** en copias (nunca `kit/molde`): cada regla borrada o invertida pone alguna
   prueba en rojo; las vivas, explicadas.
3. **Los cuatro casos por hook** (4.7), en pruebas y vivos en un clon de `alfa`; **sin remoto ni ficha, `ls`, `git status` y un `Write` común
   pasan** y los de fábrica frenan. Cierra el pendiente del paquete 1.
4. 4.3: cada fila de su tabla con casos sí/no; en especial los seis que imprimen (no `set -e` ni `env X=1 node a.js`), los tres caminos a
   los hooks (sí con obrero o `nocturno`, no con humano ni `actualizador`) y la `anon`, `publicas:` y `PRUEBA.md` (no); **ni el `frenos.log` ni
   la salida contienen la clave de prueba**; el mensaje trae `cargar-secreto`.
5. 4.4: su "hecho cuando"; `push -n` y `pull --rebase` pasan.
6. 4.5: comando → `ask` en `default`/`acceptEdits`/`plan`/`auto`, humano y obrero; PARADA con `nocturno`, bypass, `dontAsk` o sin modo; prosa,
   nunca; quitado, nada; la bandera cuenta siempre; p95 ≤ 300 ms.
7. P6.7 y crit. 17: `sensible:` commiteado en un worktree **sin mergear** no cambia nada.
8. P4.6 en un clon de `alfa` con el arranque corrido: `hooksPath` puesto una vez, un valor previo encadenado; clave de prueba → 1 tapada; sin
   gitleaks, humano en rojo y `nocturno`/`actualizador`/`desconocido` → 1; freno quitado sin `aprobado` → 1; **`estructura.cjs` editado para dar
   verde y un freno quitado en el mismo commit → 1**; sin remoto, la rama local; sin `git add` no traba (rf-10); `pre-merge-commit` en un merge;
   **un commit con `--no-verify` desde una terminal no sube** (rf-7).
9. `cargar-secreto` (las dos), `HOME` falso: guarda, relee, reemplaza, nombre inválido → 2, **el valor nunca en stdout, stderr ni variables**;
   `--al-env` al `.env`; con el `settings` del instalador (`--settings`), `Read` del almacén → negado.
10. Crit. 19 del kit: cada rama de la guardia (sin veredicto, otro hash, sin commitear, `nocturno`, sin bandera, con bandera, `dummy`).
11. Instalador, `HOME` falso: registra; la segunda vez "sin cambios" byte a byte; lo ajeno igual; duplicadas o JSON roto → no toca y 1; el viejo,
    avisado; `--sacar-viejo`, `--quitar` (vuelve al original) y `--plan` (no escribe).
12. `doctor`, `HOME` falso: verde con todo en un clon de `alfa`; **cada chequeo forzado a fallar da su línea con el arreglo**; dos corridas
    iguales; no escribe nada (hash antes y después).
13. Anti-desvío: `pc/lib/*` = `kit/molde/hooks/lib/*` byte a byte; `secretos.cjs` corre desde una copia sola de `hooks/kit/`.
14. **Medición**: 0 falsos positivos en `secretos` y `git-seguro`, 0 `deny` de `sensible` con humano de día y con modo; el conteo en el tracker;
    `git status` de vibe-kit sin corpus y gitleaks verde sobre el commit.
15. `rehacer.sh`: el paso en `alfa` y `beta` (`--molde` 0, sin él 1, `todo` 0), el `2b` congelado, `gama` intacta, dos corridas iguales.
16. El arranque en `alfa` imprime las tres líneas de F (`HOME` falso con y sin el corrector) y la huella sigue ≤ 9.700.
17. `kit-sync` LIMPIO; **hash de `~/.claude/settings.json` y `~/.claude/hooks/` reales igual al de la apertura de D3.1** (el director lo anota).
18. Red team sin ALTOS; el revisor frío leyó el diff entero y lo suyo está aplicado o anotado.

## Los encargos (el director reparte, lee cada diff y corre la suite; cada encargo corre solo sus pruebas)

| # | Modelo | Qué | Puede tocar (exacto) | Crit. | Depende · paralelo |
|---|---|---|---|---|---|
| G0 | director | `onFailure` con `claude.exe -p` — **✅ hecho** | nada del repo | 1 | — |
| G1 | Sonnet | El corpus del historial — **✅ hecho** | el scratchpad | 14 | — |
| RT | Opus | Red team, hasta 3 rondas | nada | 18 | antes de G2 |
| G2 | Sonnet | `lib/comando.cjs` (port de Hermes con sus casos, más PowerShell) | `kit/molde/hooks/lib/comando.cjs` y su prueba | 2 | ∥ G6, G8, G9 |
| G3 | Opus | `git-seguro.cjs` y su medición, clasificada | `kit/molde/hooks/git-seguro.cjs` y su prueba; el informe al scratchpad | 2, 3, 5, 14 | G2 · ∥ G4, G5 |
| G4 | Opus | `sensible.cjs` con el caché, y su medición | `kit/molde/hooks/sensible.cjs` y su prueba | 2, 3, 6, 7, 14 | G2 · ∥ G3, G5 |
| G5 | Opus | `secretos.cjs`, `pc/lib/`, los prompts al corpus, y su medición | `kit/skills/arquitecto-skills/pc/secretos.cjs`, `pc/lib/**`, sus pruebas | 2, 3, 4, 13, 14 | G2 · ∥ G3, G4 |
| G6 | Opus | `--indice`, `--rango`, ids `secretos:`/`publicas:` | `kit/molde/hooks/lib/{barreras,candado,cambios}.cjs`, `kit/molde/scripts/estructura.cjs`, sus pruebas | 2, 8 | ∥ G2 |
| G7 | Opus | githooks, `hooksPath`, líneas de F, `settings.json`, `DENY_FABRICA`, la línea del `/cierre` | `kit/molde/githooks/**`, `hooks/session-start.cjs`, `hooks/lib/{inyeccion,fabrica}.cjs`, `settings.json`, `skills/cierre/SKILL.md`, sus pruebas | 2, 3, 8, 16 | G3, G4, G6 (**único dueño de `settings.json`**) |
| G8 | Sonnet | `cargar-secreto.sh` y `.ps1` | `kit/skills/arquitecto-skills/pc/cargar-secreto.*` y su prueba | 9 | ∥ G2 |
| G9 | Opus | `lib/db-guardia.cjs` | ese y su prueba | 2, 10 | ∥ G2 |
| G10 | Opus | `instalar-hooks-pc.cjs` | `kit/skills/arquitecto-skills/scripts/instalar-hooks-pc.cjs` y su prueba | 11 | G5, G8 |
| G11 | Sonnet | `doctor.cjs` y el modo del Equipador | `scripts/doctor.cjs` y su prueba, `kit/skills/arquitecto-skills/SKILL.md` | 12 | G7, G10 |
| G12 | Sonnet | El paso de `rehacer.sh` | `pruebas/rehacer.sh` | 15 | G7, G9 |
| G13 | Sonnet | Sesión real con `claude.exe -p` (`MSYS_NO_PATHCONV=1`; el hook de la PC por `--settings`, nunca en el `HOME` real) | clones en el scratchpad | 3, 5-9 vivos | todo lo anterior |
| RF | Opus | Revisor frío | nada | 18 | G13 |

Paralelo solo donde dice, cada uno en su worktree. **Mutación**: G2-G7, G9, G10, en copias. La medición, cada encargo de un freno con el
corredor de G1. La suite (15-20 min), el director tras cada encargo aceptado; commit por encargo.

## Lo prueba una sesión real

| # | Quién · dónde | Qué mirar exactamente |
|---|---|---|
| 1 | G13 · `-p` en clones de `alfa` | Criterios 3, 5-9 vivos; `niega-aprobar` en bypass (pendiente c: si el clasificador vuelve a frenar el lanzamiento, a Guido con el comando) |
| 2 | G13 | `frenos-del-proyecto` en **bypass** (en `default` ya niega la plataforma) y desde un **subagente** (trae `agent_id`) |
| 3 | G13 | `UserPromptSubmit` con una clave falsa: bloqueado, y si el texto queda en el `.jsonl` (NO VERIFICADO) |
| 4 | **Guido, en `clientes` y `Usuario`** (el "hecho cuando" del orden 3) | Kit al día (`kit-sync.sh sync` acá; "actualizate" en la otra); `node ~/.claude/skills/arquitecto-skills/scripts/instalar-hooks-pc.cjs --plan`, sin `--plan`, reiniciar; en `../vibe-kit-pruebas/alfa`, `node ~/.claude/skills/arquitecto-skills/scripts/doctor.cjs` → **todo `✓`** (o el Equipador: "instalar hooks por PC"); después, `… --sacar-viejo` |
| 5 | Guido · VS Code en `alfa` | "Mostrame `ALFA_DB_URL`" y "hacé `git stash`" → frenados con la alternativa; una clave falsa pegada en el chat → bloqueada; una entrada de `sensible:` → la ventana |
| 6 | Guido · VS Code, las dos PCs | `onFailure` en la extensión (ficha de `alfa` rota en `origin`: `git status` dice "ficha rota", `ls` pasa) y qué shell usa para los hooks (D-7) |
| 7 | Guido o el piloto · Windows sin Git Bash | `doctor:git-bash` en `✗` con el arreglo, y qué hacen los hooks (G0 lo simuló) |

## Cruces contra los diseños (la lección de D1.1)

| # | Qué | Qué dice cada uno | Gana |
|---|---|---|---|
| 1 | Ids | Paquete 1: `<clase>:<lo que sea>`; ejemplo: `hook:git-seguro/push-force`, `pregunta:borrar-datos-reales`; F §14: `secretos:jwt` | Los tres prefijos tal cual. Nuevos: los casos de 4.4, `pregunta:<clave>`, los `secretos:` de 4.3, `db:*` (no quitables: es la red de F §13) |
| 2 | Qué se registra por PC | SPEC-0 orden 3: "el corrector **y el hook de arranque**"; P2.2: el corrector | Solo el corrector (D-2) |
| 3 | De dónde salen las preguntas | P6.7: "reglas `ask`/`deny` concretas por repo"; H en F §14: "regenera en la zona propia de `settings`" | El hook (D-1) |
| 4 | Obrero · raíz | SPEC-0 4.3: la rama; Entidades: `.kit-rol` · F §7.4: `CLAUDE_PROJECT_DIR` | Las dos (o), `actualizador` exento · git desde el `cwd` (H §10.3) |
| 5 | `deny` de archivos | F §5 y crit. 11 lo dan por hecho; ninguna P lo construye | Entra acá (D-6) |
| 6 | `secretos:`/`publicas:` | SPEC-0 4.6: barrera = `frenos`, `sensible`, `autorizado` | Suman cuando aflojan (D-3) |
| 7 | "Aprobado" de día en `db migrar` | SPEC-0 6.6: "exige un `aprobado`"; `toca` no tiene categoría para datos | Bandera + ventana (D-4) |
| 8 | La clave en el chat | Crit. 11: "en el chat"; 4.3: Bash, PowerShell, Write, Edit | `UserPromptSubmit` (D-5) |
| 9 | `.gitleaksignore` nuevo | F §10: el `/cierre` lo lista | `barreras` ya pide `aprobado` (`gitleaks`) |
| 10 | Sin gitleaks | F §10: pasa y se dice; SPEC-0: `nocturno`/`actualizador` fallan | SPEC-0, y `desconocido` también |
| 11 | `-n` | SPEC-0 4.4: "`--no-verify` o `-n`" | Solo en `commit`: en `push` es `--dry-run` |
| 12 | Líneas de F | B §9: cinco, con CI y seguridad por `gh`; F §15: modo, barreras, anti-secretos, `hooksPath` | Tres; el modo ya está en la cabecera (D-11) |
| 13 | "De noche" | Entidades: `nocturno` o `.kit-noche`; paquete 2, Cruces 18: `.kit-noche` es del orden 5 | Solo `nocturno` y los modos sin ventana |
| 14 | Hooks de git | F §10: pre-commit | + `pre-merge-commit`, `pre-push` |
| 15 | Versión mínima | E §10 y G: 2.1.234; SPEC-0 2.2: ≥ 2.1.295 | 2.1.295 (D-8) |
| 16 | Pre-commit y actualizador | P4.6 exención (a); paquete 2: sin `--molde`, no hay (a) hasta el orden 6 | **Traban la rama `kit/v*` y el commit del adoptador** hasta que el orden 6 fije la ruta del molde: Pendientes del 6 |
| 17 | `cargar-secreto` | F §9: "script del kit"; SPEC-0 6.6: no dice dónde | Por PC, bajo `frenos-de-la-pc` (en el molde, un obrero lo editaría) |

## Supuestos

- ~~[ALTO] `onFailure: "block"`~~: verificado por G0 en `-p`; en VS Code, fila 6.
- [ALTO] Que las dos PCs y la extensión corren los hooks con **Git Bash** (D-7). Filas 6 y 7.
- [MEDIO] Que los hooks que coinciden corren **en paralelo** (doc); si no, el p95 se mide por suma.
- [MEDIO] Que `UserPromptSubmit` con `block` saca el texto del contexto (doc); del transcript, fila 3.
- [MEDIO] gitleaks ≥ 8.19 en las dos PCs (`doctor`).

## Riesgos y decisiones ⚠️

**Decisiones del director** (sin Guido; las ⚠️ arriba; todas reversibles antes del tag):
- ⚠️ **D-1. Decisión del director: P6.7 por hook, no por reglas en el `settings.json`** (recomendada; alternativa: un script que escribe `ask`/`deny`
  en la zona propia del `settings`, como el SPEC-0 y H). El `settings` es del árbol de trabajo y en bypass una `ask` no pregunta.
- ⚠️ **D-2. Decisión del director: por PC se registra solo el corrector** (recomendada; alternativa: también un `SessionStart` por PC,
  como el texto del orden 3). El arranque del proyecto ya dice si el corrector está.
- ⚠️ **D-3. Decisión del director: `secretos:` y `publicas:` cuentan para `barreras` cuando aflojan** (recomendada: sacar `DB_URL` de
  `secretos:` apagaba un freno sin `aprobado`; alternativa: riesgo escrito). Ids nuevos en `ids:`, sin palabra nueva en `toca`.
- ⚠️ **D-4. Decisión del director: el "aprobado de día" de `db migrar` = `--borra-datos-reales` + la ventana de 4.5** (recomendada;
  alternativa: un `cambios` con `toca: datos`, palabra nueva en un formato que viaja).
- ⚠️ **D-5. Decisión del director: el `UserPromptSubmit` del corrector falla abierto** (recomendada: con `block`, un bug deja la PC sin chat,
  ni para pedir el `doctor`; alternativas: `block` como manda 4.7, o sacarlo y corregir el criterio 11).
- ⚠️ **D-6. Decisión del director: el `deny` de F §5 entra al molde ahora** (recomendada: sin él no se cumple el criterio 11 y "barreras de
  fábrica" no tiene contra qué contar; alternativa: esperar al Arquitecto v3).
- ⚠️ **D-7. Decisión del director: los hooks del proyecto exigen Git Bash** (G0: sin él, `$CLAUDE_PROJECT_DIR` no se expande y, con `block`,
  traba toda acción vigilada; recomendada: exigirlo, con `doctor:git-bash` y rutas absolutas en lo de la PC). *Alternativas*: `command` +
  `args` (sin probar); `"shell": "powershell"` con `$env:CLAUDE_PROJECT_DIR` (anda, pero ata el molde a PowerShell). La ⚠️ del SPEC-0 sobre
  `onFailure` queda cerrada en `-p`; en VS Code, fila 6.
- D-8. Decisión del director: **mínima 2.1.295** (la de la doc, re-chequeada por `doctor`; G0 la vio andar en 2.1.309; recomendada;
  alternativa: 2.1.309, la medida, que dejaría en rojo la 2.1.308 de `clientes`).
- D-9. Decisión del director: `sensible.cjs` mira también `mcp__…` por nombre exacto (recomendada: "mandar afuera" hoy pasa por MCP;
  alternativa: solo Bash/PowerShell hasta tener cicatriz).
- D-10. Decisión del director: el corrector protege además `.kit-rol`, `<git-common-dir>/config` y `.claude/cambios/` sin ventana
  (recomendada: sostienen el rol, el `hooksPath` y el sello; alternativa: la lista de 4.3 sola).
- D-11. Decisión del director: las dos líneas de `gh` del arranque **no entran** (recomendada: su costo sin red no está medido y el plazo de
  10 s ya es justo; alternativa: entrar con tope de 3 s). Al orden 6.
- D-12. Decisión del director: `pc/lib/` versionadas con la prueba anti-desvío (alternativa: generadas por script, un paso que se olvida); el
  runner de los githooks corre del disco y solo el candado sale de la ref (alternativa: el runner también, repitiendo `refVigente` en `sh`).

### Lo que esto no cierra

- **Todo freno de comando es un patrón** (F §21): alias, variables, base64 o un script intermedio lo esquivan. La red es el candado en el
  pre-commit, el pre-push y el gate.
- **r4-1 b y rf-5 se achican, no se cierran**: en bypass, en el principal, fabricar un sello pide ofuscar el comando, y un obrero ya no hace
  `cd` al principal por los caminos conocidos; un sello falso bien hecho sigue igual a uno legítimo. Sigue para Guido, como en D2.2.
- **El runner y el `sh` de `.githooks/` corren del disco**: editarlos apaga el pre-commit de ese commit. Lo frena el corrector en sesión de
  agente; si pasa, lo marca `barreras` en el `/cierre` del principal y en el gate.
- `grep -r` sobre una carpeta con un `.env` sin nombrarlo; un programa que lee el `.env` o el almacén por adentro (SPEC-0, sin sandbox).
- Un agente puede escribir `.claude/revisiones/<hash>.md` por Bash: hasta P6.10 (orden 5) nadie escribe veredictos y la guardia niega igual.

## Lo que se prueba más adelante

- Orden 4: el `db` por stack, el `deny` al `.env` del padre (P6.2). Orden 5: `.kit-noche`, `/obrero`, P6.10, el gate. Orden 6: la exención
  (a) con ruta fija (Cruces 16), el `doctor` completo, `autoMode`, las líneas de `gh`. Guido: filas 4-7. El piloto: cuánto molesta cada freno.
