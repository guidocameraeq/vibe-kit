# SPEC delta: paquete 3 — seguridad: corrector de secretos, hook de git, preguntas de `sensible:`, pre-commit, `cargar-secreto`, hooks por PC y `doctor` mínimo — vibe-kit
Ningún agente ve, imprime ni commitea una clave; ningún git borra trabajo ni esquiva el pre-commit; las 5 de A preguntan solo donde la
ficha dice que duelen; y si un freno se rompe, frena.
- Estado: **READY — sellado sin Guido (provisorio)**, 2026-10-29, por el director D3.1, después de la ronda 2 del red team sin ALTOS. Guido lo
  repasa al volver; todo se deshace antes del tag
- Fecha: 2026-10-29 · Misión: 5, director **D3.1**, sin Guido (tracker, "Cambios al plan", 2026-10-29)
- Plano: [`SPEC-0-kit-v3.md`](SPEC-0-kit-v3.md), orden 3 = **P4.3-4.7, P6.6, P6.7, "instalar hooks por PC" (P2.2), `doctor` mínimo (P2.3)**,
  más **"Paquete 3 · de D2.2" (a)-(d)** del tracker y **las líneas de F del arranque** (P4.1, RF-9). Diseño: F §4-§17 · A §2-§6 · E §4, §5, §10 · B §9.
- Sello del Arquitecto: `arquitecto: 2026-10-29 · kit 2.4.3 · chequeos: tamaño — (paquete del método) · entorno ✅ (../vibe-kit-pruebas/ y HOME
  falso) · tope ⚠️ (44,7 KB y 18 criterios: paquete del método, no se parte; D3.1) · sellado sin Guido (provisorio)`.
- Red team: **obligatorio** (RF-16), Opus con `redteam-spec`, hasta 3 rondas (ronda 1 integrada: tabla al final). Revisor frío Opus al
  cerrar, **recorriendo el día normal** (dos PCs, `pull`, worktrees, Modo A), no solo ataques (lección de D2.2).

## Por qué (el dolor)

Un subagente frenado en Bash escribió lo mismo con `Write` (H-161). Un implementador corrió `git checkout -q -- .` sobre el árbol de otra
sesión (CM-65). ~25 cierres con falsas alarmas del escáner (F §10). Un freno que falla deja pasar, también en bypass (RT1-1). Y en bypass
se puede fabricar un `aprobado` (r4-1 b, rf-5).

## Contexto (explorado el 2026-10-29)

- **Ya existe** (paquete 2): `niega-aprobar.cjs` (el modelo de un hook que niega), `contexto.cjs` (`fichaVigente`, `refVigente`, `rol`),
  `frenos-log.cjs`, `barreras.cjs` (lo pendiente = índice y disco), `estructura.cjs`, `leerJsonSinDuplicados`. **El `settings.json` del molde no
  trae el `deny` de F §5**: ninguna P lo construye y el criterio 11 lo da por hecho.
- **Esta PC** (`clientes`, solo lectura): `block_secrets.ps1`, solo `Bash`, cinco patrones, falla abierto, **~10-11 s por Bash** (G0).
  `gitleaks version`: **47 s en frío** (Defender), 1,6-2,2 s después (director). Claude Code 2.1.308 y 2.1.309. El hook de Hermes (CM-65; 225
  casos, la mitad negativos) **falla abierto**: se portan la forma y los casos, la falla se da vuelta.
- **G0, director** (`claude.exe` 2.1.309 `-p`, clones de `alfa`): **verde**. Con `"onFailure": "block"` frenan los cuatro (sin ejecutable,
  salida 1, colgado —a los 5 s con `timeout: 5`, a los 20 con `20`—, JSON inválido), con `Bash` y `PowerShell`; sin el campo, pasan. Doc:
  "Requires v2.1.295 or later". **El `.cjs` se relee en cada llamada** (se tacha ese NO VERIFICADO). En `default` la plataforma ya niega un
  `cp` a `.claude/hooks/`. **Un `deny` con ruta absoluta anda en Windows** (`Read(//c/Users/…)`), también sin confianza. Un subagente trae
  `agent_id` (hereda el rol). **Sin Git Bash, `$CLAUDE_PROJECT_DIR` no se expande en la forma `command` de texto**.
- **G0b, director**: **verde**. La forma exec (`"command": "node"`, `"args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/x.cjs"]`) expande la
  variable, también con `"shell": "powershell"` (doc: se ignora con `args`). `command` tiene que ser un `.exe` real (`node` sí, un `.cmd` no).
- **G1, hecho**: el corpus en `historial/` del scratchpad de D3.1 (`correr.cjs`): 2.218 transcripts, **91.298 llamadas únicas** (Bash
  53.568, Edit 10.275, Write 5.123, PowerShell 1.117); `permission_mode` en ~40%.
- `kit-sync` copia `kit/skills/arquitecto-skills/` a cada PC **como archivos, sin registrar nada**: no es "tocar el `~/.claude/` real".

## Dónde vive cada pieza

Abreviaturas: **`m/`** = `kit/molde/`, **`eq/`** = `kit/skills/arquitecto-skills/`.

| Pieza | En el kit | Instalada en | La registra |
|---|---|---|---|
| Hook de git (4.4) · las 5 de A (4.5, 6.7) | `m/hooks/git-seguro.cjs` · `sensible.cjs` | `.claude/hooks/` del proyecto | `settings.json` del molde |
| Recorrido de comandos · guardia de `db` (6.6) | `m/hooks/lib/comando.cjs` · `db-guardia.cjs` | ídem | — · el `db` de cada stack (orden 4) |
| pre-commit, pre-merge-commit, pre-push (4.6) | `m/githooks/` | `.githooks/` (con `+x`) | `core.hooksPath`, el arranque |
| Corrector (4.3) · `cargar-secreto` | `eq/pc/` (`secretos.cjs`, `lib/`, `cargar-secreto.sh`/`.ps1`) | `<home>/.claude/hooks/kit/` | `instalar-hooks-pc.cjs` |
| Instalador y `doctor` | `eq/scripts/` | `~/.claude/skills/…` (`kit-sync`/Equipador) | — |

- `m/githooks/**` → `.githooks/**`, ejecutable (`update-index --chmod=+x`). `pc/` no se instancia.
- **El hook por PC nunca hace `require` fuera de su carpeta**: `pc/lib/` trae copias **versionadas** de `git`, `ficha`, `contexto`,
  `frenos-log`, `comando` y `zona-propia`, y una prueba exige que sean **idénticas byte a byte** a las del molde (D-12). **`<home>` sale del
  `__dirname` del hook instalado, nunca de `os.homedir()`** (r1-15). Las pruebas de `eq/` viven al lado; el instalador no las copia.
- **Ninguna clave literal en `kit/`** (el repo es público; r1-4): las pruebas arman las claves en tiempo de corrida, con cuerpos visiblemente
  falsos, y una prueba hace grep de los patrones literales sobre `kit/` y espera 0.

## AGREGA

### P4.7 · Lo que comparten los hooks que niegan (RT1-1, RT2-3)

Para `secretos`, `git-seguro`, `sensible` y el `niega-aprobar` que ya existe.
- **Registro**: `PreToolUse`, `"timeout": 20`, `"onFailure": "block"` (G0), **en forma exec** (`"command": "node"`, la ruta en `args`;
  D-7): los del proyecto con `${CLAUDE_PROJECT_DIR}`, el de la PC con la ruta absoluta.
- **Forma**: `decidir(entrada, opciones)` pura → `nada` · `ask` · `deny`; `principal()` imprime el JSON y ante cualquier error un `deny`
  **"freno roto: corré doctor"**; si ni eso, sale 2. **Ningún `.propio.sh`** (⚠️ de D2.2).
- **Barato cuando no frena**: no lee la ficha ni llama a git hasta que algo de fábrica frenaría. `sensible` necesita las listas: **caché en
  el `git-dir` común, con la clave sacada por `fs`** (el sha de la ref leído de `refs/`/`packed-refs`, sin lanzar procesos; r1-10).
- **La ficha**: `fichaVigente`. **Sin ficha**: fábrica, nada quitado, sin error. **Rota**: fábrica sin nada quitado y el motivo suma `ficha
  rota: <archivo>:<línea> — corré doctor`; `sensible:`, `secretos:`, `publicas:` y `datos-de-prueba:` salen de **la última que se lee** (hasta
  20 commits, como rf-14). `frenos.quitados`: un id con `hasta:` vigente apaga ese caso y nada más.
- **Sesión de agente** (la usan `secretos` y `git-seguro`) = pestaña obrero (rama `modulo/<x>--<ID>`) **o** `.kit-rol` `obrero`, `nocturno` o
  `desconocido`: las dos, porque `.kit-rol` es lo que se protege. `actualizador`, director y humano, no.
- **Renglón** (formato de D2.1): detalle = el caso, la clave, **el nombre** de la variable o el archivo relativo; **nunca el comando, un valor
  ni un recorte**. Sin ficha, el de la PC escribe en `<home>/.claude/hooks/kit/frenos.log`. Un `ask` también deja renglón (`preguntó`).
- **Los cuatro casos por hook** (crit. 16): sin node · ficha rota · error interno → frenan; sin remoto ni ficha → fábrica y nada se traba.

### Base · `lib/comando.cjs` (port de Hermes)

`partir(texto, {ps})` → los comandos simples `{argv, asignaciones: [{nombre, valor}], redirecciones}` de Bash o PowerShell: comillas,
escapes, `;`, `&&`, `||`, `|`, subshells, heredocs, y lo de adentro de `bash -c`/`sh -c`/`cmd /c`/`powershell -Command`/`pwsh -c`/`eval`
(hasta 4 niveles), saltando `env`, `time`, `nohup`, `sudo`, `command`. **Las asignaciones no se tiran** (`X=1 git …`, `env X=1 git …`, y
`export X=`/`$env:X=` anteriores en la misma llamada; r1-1). Mira lo que se invoca, no un pedazo de texto. PowerShell sin mayúsculas.

### P4.4 · `git-seguro.cjs` (F §6; A §6; RT2-2, RT3-1, RT-p2 4; rf-5, rf-16; r1-1, r1-2, r1-5, r1-7, r1-8)

`PreToolUse` sobre `Bash|PowerShell`. **Niega**, todo modo, todo rol (salvo donde dice), con la alternativa. Ids `hook:git-seguro/<caso>`:

| Caso | Frena | No frena · alternativa |
|---|---|---|
| `stash` · `reset-hard` · `clean-f` | stash salvo `list`/`show`; `reset --hard`; `clean -f` sin `-n` | commit de trabajo en curso por rutas |
| `restaurar-arbol` | `checkout`/`restore` de `.`, `*`, `:/` o una carpeta; `checkout -f`; `switch -f`/`--discard-changes` | un archivo nombrado; **`restore --staged` sin `--worktree`** (r1-18) |
| `push-force` · `push-borrar` · `push-punto` | `--force`, `-f`, `--force-with-lease`, refspec `+`; `--delete`/`:x` de una rama **no mergeada** o la por defecto; `--prune`, `--mirror` siempre; `push .` | **force solo sobre `kit/*`** (ahí "borrala y subila de nuevo", F §6); `--delete`/`:x` de una mergeada (r2-7). Mensaje: "si ya está mergeada pasa; si no, `worktree cerrar`" |
| `update-ref` · `replace` · `symbolic-ref` · `branch-f` | los dos primeros; `symbolic-ref` con valor o `-d`; `branch -f`/`-M`/`-C`, `branch -D` de una no mergeada, `checkout -B`, `switch -C` | `symbolic-ref -q HEAD`, `branch -d`. **"Mergeada" = contenida en `origin/<defecto>` o en su upstream** (r2-7) |
| `fetch-a-remotes` | `fetch` con destino `refs/remotes/*` | `fetch` sin refspec |
| `remote-set-head` · `remote-set-url` · `remote-remove` · `config-default-branch` · `hooks-path` | esos; `core.hooksPath` por `config` (con `--unset`), `-c` o `--config-env`; `config init.defaultBranch <x>` | `config --get`; **`git config core.hooksPath .githooks`, exacto, pasa en todo rol y todo modo, por encima de `config-agente`** (reponerlo; r2-3) |
| `hooks-path-ausente` (r1-8) | `commit`/`push`/`merge` con `.githooks/` en el árbol y `core.hooksPath` ≠ `.githooks` (un `config --get`, solo en esos tres) | "reponelo: `git config core.hooksPath .githooks`" |
| `variables-peligrosas` (r1-1, D-13) | un git con asignada alguna de: `GIT_CONFIG*` (con `_COUNT`/`_KEY_n`/`_VALUE_n`, `_PARAMETERS`, `_GLOBAL`, `_SYSTEM`, `_NOSYSTEM`), `GIT_DIR`, `GIT_WORK_TREE`, `GIT_COMMON_DIR`, `GIT_INDEX_FILE`, `GIT_OBJECT_DIRECTORY`, `GIT_ALTERNATE_OBJECT_DIRECTORIES`, `GIT_NAMESPACE`, `GIT_EXEC_PATH`, `GIT_TRACE*`, `GIT_CURL_VERBOSE` (r2-6), `PATH`. **La asignación misma de una de la lista (salvo `PATH`) se niega aunque no haya git en la llamada** (r2-8: la herramienta PowerShell podría guardar el entorno; G13 lo mide) | `GIT_EDITOR`, `GIT_PAGER`, `GIT_SEQUENCE_EDITOR`, `GIT_AUTHOR_*`, `GIT_COMMITTER_*`, `GIT_TERMINAL_PROMPT`; `export PATH=…` sin git |
| `config-include` · `config-agente` (r1-1) | `include.*`/`includeIf.*` siempre; en sesión de agente, toda escritura de `config` (set, `--add`, `--unset`, `--edit`, `--replace-all`; incluye `remote.*`, `branch.*`) | `core.longpaths`, `rerere.*`. Mensaje con la alternativa (r2-9): `pull --rebase`/`--no-rebase` en vez de `pull.rebase`, `push -u origin HEAD` en vez de `push.autoSetupRemote`, "`safe.directory` lo pone Guido" |
| `plomeria` (r1-2 c) | en sesión de agente: `remote add`/`rename`, `commit-tree`, `hash-object -w`, `mktree`, `read-tree`, `fast-import`, `update-index --index-info`/`--cacheinfo` | — |
| `no-verify` | `--no-verify` en cualquier subcomando; `commit -n` (también `-an`) | **`push -n`** (es `--dry-run`); falsa alarma → `.gitleaksignore` (pide `aprobado`) |
| `worktree-remove-force` · `matar-por-nombre` | `worktree remove -f`; `taskkill /IM`, `pkill`, `killall`, `Stop-Process -Name` | por PID |
| `update-index` (d) | `--skip-worktree`, `--assume-unchanged` | `--no-…`, `--chmod` |
| `historia-defecto` (d, rf-16, D-15, r2-4) | en la rama por defecto, `reset <x>`/`rebase`: **con remoto, solo si alguno de los commits que tira o reescribe está en `origin/<rama por defecto>`** (`rev-list <destino>..HEAD --not origin/<defecto>` cuenta menos que `rev-list <destino>..HEAD`); **sin remoto, `ask` con ventana, `deny` sin ventana** | `reset --soft HEAD~1` de lo propio sin pushear, **también con la rama divergida** (dos PCs); `pull --rebase` (rf-1), `fetch && rebase origin/main`, `--continue`/`--abort`; para deshacer lo publicado, `git revert` |
| `salir-del-worktree` (d, rf-5, r1-16, r2-2 c) | en sesión de agente: `cd`/`pushd`/`Set-Location`, `git -C`, `--git-dir`, `--work-tree` a una ruta **bajo la raíz del principal y no bajo la propia**, resolviendo los `cd` en secuencia; y `commit`/`push`/`merge` cuyo repo efectivo no es el propio worktree (un clon en otra carpeta). **El `.git` del worktree tiene que apuntar al `<principal>/.git` esperado** (una lectura de fs) | director, humano |

*(D3.3, del revisor frío: tres casos nuevos. `alias`: `-c alias.*`/`--config-env=alias.*` siempre, y guardar un alias de shell o con
`--no-verify`/`commit -n` en todo rol; un alias ya guardado se resuelve leyendo la config cuando el subcomando no es de git (rf3-4).
`rm-forzado`: `git rm -f` sobre `.`, carpeta, comodín o `:/` (rf3-11). `red-de-rescate`: `gc --prune=now`, `prune`, `reflog expire`/`delete`
cortos (rf3-13). `variables-peligrosas` suma `GITLEAKS_*` y, con git en la llamada, `NODE_OPTIONS`/`NODE_PATH`; git se reconoce también con
escapes, `g\it` (rf3-10).)*

Se porta la tabla de Hermes. Hecho cuando (SPEC-0 4.4): casos sí/no, los nuevos medidos contra el historial (los `reset HEAD~n` sobre `main`,
aparte), ningún git de los `SKILL.md` del molde frena (una prueba los pasa por `decidir`), y `commit --no-verify` negado en todo modo.

### P4.5 y P6.7 · `sensible.cjs`, las 5 de A desde la ficha (A §2; F §13-§14; RT1-11)

`PreToolUse` sobre `Bash|PowerShell` (D-9). **Lee `sensible:` de la ficha vigente en cada llamada**, con el caché (D-1).
- **Cómo matchea** (contrato): cada entrada se parte con `comando.cjs`; **matchea si algún comando simple empieza con esas palabras**
  (PowerShell sin mayúsculas). **Prosa** y **`tabla:<nombre>`** (para la guardia de `db`; en la ficha, entre comillas: `"tabla:clientes"`)
  **no matchean nada**. **Toda palabra `--borra-datos-reales`** cuenta como `datos-reales` (D-4).
- **Ids**: `datos-reales` → `pregunta:borrar-datos-reales` (como el ejemplo y SPEC-0 6.3); las otras, `pregunta:<clave>`.
- **Devuelve**: quitado vigente → nada. **De noche o sin ventana** (`.kit-rol` `nocturno`; `bypassPermissions`, `dontAsk`, modo ausente o
  desconocido) → **`deny` con PARADA** ("esto es «<la pregunta>» y sin una persona no se hace: dejá PARADA en tu bitácora y pará"; la de
  verdad, con `/obrero`, orden 5). En `default`, `acceptEdits`, `plan` y `auto`, cualquier rol → **`ask`** (crit. 7). `.kit-noche`, orden 5.
- `m/kit.ejemplo.md` pasa a tener entradas reales (comandos y `"tabla:…"`; archivo de G4, que verifica que el parser las acepta sin cambiar la gramática).
- Hecho cuando (P6.7): las 5 son clic solo donde la ficha lo dice; **editar `sensible:` en un worktree no cambia nada** hasta el merge.

### P4.3 · `secretos.cjs`, el corrector de la PC (F §7, §11; RT1-4, RT2-2; r1-3, r1-9, r1-12, r1-14, r1-21)

`PreToolUse` sobre `Bash|PowerShell|Write|Edit|MultiEdit|NotebookEdit`, y `UserPromptSubmit` (D-5). Corre en todo proyecto, con kit o sin.
Mira `command`, `content`, `new_string` (`edits[]`, `new_source`) y el prompt. Ids `secretos:<qué>`, quitables por la ficha del `cwd`:

| Id | Frena |
|---|---|
| `github-pat` · `github-fino` · `sk-api` · `supabase-token` · `twilio` | los cinco de `block_secrets.ps1` |
| `aws` · `clave-privada` · `slack` · `stripe` | `AKIA[0-9A-Z]{16}`, `-----BEGIN … PRIVATE KEY-----`, `xox[baprs]-`, `sk_live_`/`rk_live_` (se miden; `google-api` sale: la de Firebase es pública y no hay cicatriz) |
| `jwt` | `eyJ….eyJ….…` **salvo con `"role":"anon"` en el cuerpo**, exigido también en `datos-de-prueba:` y en lo asignado a `publicas:` (r1-12; un `service_role` frena en `PRUEBA.md`) |
| `archivo-deny` (r1-3, r2-1, r2-5) | **todo comando simple cuyo argv o redirección nombre una ruta del deny, salvo lo permitido**: `ls`/`dir`/`Get-ChildItem` sin leer contenido, `test -f`/`-e`, `Test-Path`, `stat`, `rm`/`Remove-Item`, `git status`/`check-ignore`/`rm --cached`; **"usar sin ver"**: `--env-file[= ]<ruta>` en cualquier programa, y `source`/`.` de la ruta si en la misma llamada no hay impresor ni `set -x`; `echo`/`printf` redirigidos a `.gitignore`/`.dockerignore` (ahí la ruta es texto). **Se juzga el pipeline entero**: si un comando nombra la ruta, todos los del pipeline tienen que estar en lo permitido (`gci .env \| gc` frena). **En Windows, sin mayúsculas**; un comodín que pueda matchear una ruta del deny (`.e*`, `.en?`) y una variable asignada en la misma llamada (`F=.env; cat "$F"`) cuentan como nombrarla. Rutas: los 9 de F §5, `~/.config/kit-secretos/**`, `/proc/self/environ`, `/proc/*/environ` y los `Read(...)` de los `settings*.json` del proyecto (raíz por git desde el `cwd`) |
| `imprime-todas` | `printenv`, `env` y `set` **sin argumentos** (no `set -e`, no `env X=1 cmd`), `export -p`, `declare -p`, `Get-ChildItem Env:` sin nombre (F §9) |
| `imprime-variable` (D-14, r2-6) | **cuando el valor sale a la pantalla**, para un nombre de `secretos:` o de fábrica (`TOKEN`, `SECRET`, `PASSWORD`, `PASS`, `PWD`, `API_KEY`, `PRIVATE_KEY`, `SERVICE_ROLE`, `_KEY$`, `CREDENTIAL`, `DATABASE_URL`, `DB_URL`, `_DSN`, `CONNECTION_STRING`; se mide): (1) argv[0] impresor (`echo`, `printf`, `print`, `Write-Output`, `Write-Host`, `Write-Information`, `Out-Host`, `Out-String`, `tee`, `cat <<<`) con `$X`/`${X}`/`$env:X`/`%X%`; (2) una sentencia de PowerShell que es solo la variable o un string que la interpola (`$env:X`, `"$env:X"`, `${env:X}`, `GetEnvironmentVariable('X')`); (3) `printenv X`, `gci`/`ls`/`dir`/`Get-Item env:X` (también con comodín, `env:*URL*`), `node -e`/`-p`/`python -c` que imprimen `process.env.X`/`os.environ['X']`; (4) **la variable en la misma llamada que algo verboso**: `-v`/`--verbose`/`--trace*`, `set -x`, `bash -x`. **La variable como argumento de otro programa, sin nada verboso, pasa** (`curl -H "Authorization: token $GH_TOKEN"`: "usar sin ver") |
| `credencial-guardada` | `gh auth token`, `gh auth status -t`/`--show-token`, `git credential fill`, `git credential-manager get` |
| `frenos-del-proyecto` | en sesión de agente: `Write`/`Edit` sobre `.claude/hooks/**`, `.claude/settings*.json`, `.githooks/**`, `.kit-rol`, **el `.git` de la raíz del worktree** (r2-2 b), y en `<git-common-dir>`: `config`, `hooks/**`, **`refs/**`, `packed-refs`, `FETCH_HEAD`, `logs/**`, `worktrees/**`** (r1-2 b, r2-2 b; D-10; un `.lock` viejo: "pedíselo al director", r2-11; `index.lock` libre); y todo Bash/PowerShell que nombre esas rutas salvo la lista de lectura (lectores, `ls`, `git diff`/`log`/`show`/`status`, `node <la ruta>` como programa, hashes) |
| `frenos-de-la-pc` (r1-14) | `<home>/.claude/hooks/kit/**`, **siempre**; `<home>/.claude/settings.json`, en sesión de agente o sin ventana (en los demás, `ask`). El camino es el instalador |
| `cambios-sin-ventana` | en `bypassPermissions`/`dontAsk`, Bash/PowerShell que nombre `.claude/cambios/` salvo `node .claude/scripts/cambios.cjs` sin otra mención (achica r4-1 b) |

Los alias de PowerShell (`gc`, `gci`, `ls`, `dir`, `type`, `cat`) cuentan como su comando. **Mensaje**: "no lo escribas ni lo pegues: pedile al
humano `cargar-secreto NOMBRE` y usá el comando o la variable", con la línea exacta para Git Bash y PowerShell. **`UserPromptSubmit`**: los
patrones sobre lo que tipea Guido → `decision: block`, **`suppressOriginalPrompt: true`** y "ya quedó en tu historial local: rotala (runbook
`se-filtro-una-credencial`)", **sin `onFailure: "block"`** (D-5; r1-9).

### P4.6 · `core.hooksPath`, pre-commit y pre-push (F §10; RT1-7, RT2-4, RT2-9; r4-3, rf-7, rf-10; r1-2, r1-6, r1-19)

- **`core.hooksPath`**: lo pone `session-start.cjs` con su propio git, **solo si está vacío**, a `.githooks` (relativo: vale en cada worktree).
  Si dice otra cosa (husky, lefthook) no lo pierde: lo guarda en `kit.hooksPathPrevio`, apunta a `.githooks` y el pre-commit corre después
  el previo; con `hooksPath` vacío y `<git-common-dir>/hooks/pre-commit` (no `.sample`), lo encadena igual. Sin `.githooks/`, nada.
- **`.githooks/pre-commit`, `pre-merge-commit`, `pre-push`**: `sh` de tres renglones (git en Windows usa su `sh`) → `node .githooks/kit-githook.cjs
  <cuál> "$@"`. **Sin node, sale 1 para todos.** `pre-merge-commit` porque un merge automático no corre `pre-commit`. **Todo error del runner
  da 1 con motivo** (r1-19).
- **pre-commit** (y pre-merge-commit): gitleaks `git --staged --redact --no-banner`; `barreras --indice` (**solo el índice**, rf-10); el hook
  previo. *(D3.3, rf3-1: **el pre-merge-commit no corre el candado** —git no escribe `MERGE_HEAD` antes de ese hook y juzgaba el merge solo
  contra `HEAD`, rojo ante un cambio aprobado en la otra PC—; corre gitleaks y el previo y dice "el merge lo juzga el pre-push", que juzga
  cada padre con `--rango`. El `sh` hace `unset -f` de lo que usa y borra toda `NODE_*` antes del `exec node` (rf3-3, rf2-4); el runner borra
  `GITLEAKS_*` y `GIT_CONFIG_*` (rf3-2, rf2-1). **gitleaks no corre `git --staged`/`--log-opts`**: el runner saca las líneas agregadas (`git
  diff --cached` / `git log -p --cc --root`, con `--text --no-textconv --no-ext-diff`), las escribe en un temporal y corre `gitleaks dir` ahí,
  con el `.gitleaks.toml` commiteado (o uno que extiende el de fábrica) y el `.gitleaksignore` commiteado: nada del disco ni de los atributos
  cuenta (rf2-1, rf2-6). Todo lo que escribe un githook, verde o rojo, va a `<git-common-dir>/kit-frenos.log`, no al versionado (rf3-6, rf2-3).)* **pre-push**: por cada ref que sube, `<remoto>..<local>` o, si es nueva, `rev-list <local> --not --remotes`: gitleaks `git
  --log-opts=<rango> --redact` y `barreras --rango` (rf-7). Sale 1 si alguno da rojo, con `archivo:línea` tapado.
- **El candado corre dos veces** (pendiente b; r4-3, r1-2 a): **la versión de la ref vigente** (con remoto, `origin/<rama por defecto>`; sin
  remoto, la rama local, o sea lo commiteado), sacada con **un solo `git cat-file --batch`** a un temporal fuera del repo y corrida con el `cwd`
  en el repo, **y la del índice**; rojo si cualquiera da rojo. Si la ref no tiene ficha (nunca tuvo kit), solo el índice, y lo dice; **si la ref
  tiene ficha y no tiene candado, o el de la ref sale 2 por otra cosa que "no conoce `--indice`", rojo** (r2-2 a). Si la de la ref no conoce
  `--indice` (es del orden 2), sin él, y lo dice. El runner corre del disco (D-12).
- **gitleaks con plazo de 60 s y un reintento** (r1-6, r2-10: 47 s en frío); dos veces colgado = "sin escáner (colgado)". **Sin escáner**: `humano`, `director`, `obrero` pasan **en rojo**
  (`⚠️ sin escáner en esta PC: corré "preparame esta PC"`) con renglón; `nocturno`, `actualizador`, **`desconocido`** → **1**.
- `estructura.cjs` suma `--indice` y `--rango <a>..<b>`, solo con `barreras`.
- **Líneas de F del arranque** (500): `barreras de fábrica: N de N ✅` o `⚠️ falta <regla> · corré doctor` (por nombre, contra el `settings` menos
  `frenos.quitados`; F §15) · `corrector de la PC: ✅` o `⚠️ no está · pedile al Equipador "instalar hooks por PC"` · `pre-commit: ✅` o `⚠️ <qué
  falta>` (gitleaks: se busca el archivo, no se lo corre). Las de `gh`, no (D-11).

### P6.6 · `cargar-secreto`, el almacén y la guardia de `db migrar` (F §8-§9, §13; RT2-5, RT3-4)

- **`cargar-secreto.sh NOMBRE [--al-env]`** y **`.ps1 NOMBRE [-AlEnv]`**: `NOMBRE` en `MAYUSCULAS_CON_GUION_BAJO` (si no, 2). Valor **con entrada
  oculta** (`read -s`; `Read-Host -AsSecureString`; redirigida, un renglón). Por defecto a **`$HOME/.config/kit-secretos/<proyecto>.env`**
  (`$env:USERPROFILE\.config\kit-secretos\`); `<proyecto>` = `vars.proyecto` o la carpeta raíz, en `[a-z0-9-]`. `--al-env`, al `.env` (solo
  `dummy`, `prueba`, solo lectura). Reemplaza, temporal y renombre, **relee y compara** (F §9), `chmod 600` en Unix. **Nunca imprime el valor
  ni su largo; nunca toca una variable del sistema** ni de usuario. `Read(~/.config/kit-secretos/**)` lo suma el instalador a la PC.
- **`lib/db-guardia.cjs`**: `juzgar({raiz, entorno, plan, rol, banderas})` → `{ok}` o `{niega, id, motivo}`. `clase` ≠ `real` → ok. **Sin ficha o
  entorno no declarado → `real`**. Contra `real`: (1) `hash` del plan = `ficha.hash` de `ruta\0texto\0` por ruta; **sin
  `.claude/revisiones/<hash>.md` commiteado en `HEAD`** con `veredicto: aprobado` y ese `hash` → `db:sin-veredicto` (hasta P6.10, todo `real`
  se niega). (2) **Borra** si el SQL (sin comentarios ni mayúsculas) trae `DELETE FROM`, `DROP TABLE`, `TRUNCATE`, `ALTER TABLE … DROP` sobre una
  entrada **`tabla:<nombre>`** de `sensible.datos-reales` (con o sin esquema; r1-11), o `DROP SCHEMA`/`DATABASE` siempre: quitado
  `pregunta:borrar-datos-reales` → sigue; `nocturno` → `db:borra-de-noche` con PARADA; si no, **sin `--borra-datos-reales` niega** con la línea
  lista, y con la bandera pasa: **la ventana la puso `sensible`** (D-4).
- El molde suma `deny` de `Write`/`Edit(./.claude/revisiones/**)`, como `cambios/` (RT1-5).

### "Instalar hooks por PC" y el `doctor` mínimo (P2.2, P2.3; E §10; F §7.3, §9; RT1-11, RT2-11; r1-20)

**`instalar-hooks-pc.cjs [--home <dir>] [--plan] [--quitar] [--sacar-viejo]`** (sin `--home`, el real; las pruebas, siempre uno falso):
copia `pc/**` (sin pruebas) a `<home>/.claude/hooks/kit/` y escribe ahí **`INSTALADO`** (versión del kit y hash de cada archivo). Registra en
`<home>/.claude/settings.json` **por regla** un grupo `PreToolUse` propio, el `UserPromptSubmit` y el `deny` del almacén; lo del kit se reconoce
por `/.claude/hooks/kit/`; lo demás no se toca; igual → **"sin cambios"**, byte a byte. **No toca y sale 1** con JSON inválido o claves
duplicadas. Temporal, renombre, **relee y compara**. El anti-secretos viejo (un `PreToolUse` fuera de `hooks/kit/` cuyo archivo tiene `ghp_`):
lo deja y avisa; `--sacar-viejo` saca solo su registro. `--plan` no escribe. `--quitar` deja todo como estaba (el "cómo se deshace").

**`doctor.cjs [--home <dir>]`**, solo lectura, `✓|✗|⚠ <id> · qué · cómo se arregla`, orden fijo, **igual en dos corridas**, sale 0 sin `✗`; lo
externo con plazo. `doctor:` `node` (≥ 20) · `gitleaks` (≥ 8.19; plazo 60 s, y la causa: "lento en frío: Defender") · `claude-code` (cada
versión que encuentra contra **2.1.295**, D-8) · `lefthook` (`⚠` si está: escribe en `.githooks/` y pisa el pre-commit del kit; r2-3) · `git-bash` (`⚠`, informativo: solo lo usan los `.githooks/`, y su `sh` lo trae git) · `settings-pc` · `hooks-pc` (registrado con `block` y `timeout: 20`) ·
`hooks-pc-iguales` (contra `INSTALADO`; uno editado se reporta, no se pisa, F §7.3; **"hay versión nueva: corré el instalador"**, aparte) ·
`deny-almacen` · `anti-secretos-viejo` (`⚠` "sacalo cuando confirmes; demora cada Bash") · **`plazo-arranque`** (a: `KIT_PLAZO_ARRANQUE_MS` en
el entorno o en un `env` de los `settings` → `✗`) · `pre-commit` (en el repo del `cwd`) · `ficha` · `sensible-prosa` (`⚠` una entrada cuyo primer
token no está en el `PATH` ni en el repo; saltea `tabla:`).

El Equipador suma **"Modo HOOKS POR PC"** a su `SKILL.md` (~1 KB): `--plan` → **una pregunta** → aplica → `doctor` → "reiniciá Claude Code".

### La medición contra el historial (A §5.2; SPEC-0 4.3 y 4.4; r1-4)

Sobre el corpus de G1, **solo en el scratchpad**. El encargo de `secretos` le suma los prompts. Cada encargo de un freno corre su `decidir()`
con `correr.cjs` (`sensible` con la ficha de `kit.ejemplo.md`, rol humano). **Sin modo (~60%) se cuenta aparte.** Para clasificar, recortes de
60 caracteres **con todo valor tapado** (los patrones de 4.3, `://[^@/]+@` y `[A-Z_]*(PASS|TOKEN|KEY|SECRET)[A-Z_]*=\S+`), que **viven solo en el scratchpad del encargo**; al
director, al tracker y a este delta van **solo id y números**. Con un falso positivo, se corrige y se vuelve a medir.

### `pruebas/rehacer.sh`, el paso "molde v3 orden 3"

`alfa` y `beta`, commit `molde v3 orden 3` **sobre** el `2b`, que **se congela** en `D22=37906e8` (como `D21`; si no, se tragaría lo del orden 3).
`barreras --molde` 0, sin `--molde` 1, `todo` 0; `.githooks/` con `+x`; **no setea `core.hooksPath`**. `gama`, igual. Dos corridas, lo mismo.

## MODIFICA

- `m/settings.json`: **todo hook en forma exec** (D-7), también `session-start`, `escritura-docs` y `niega-aprobar` (su registro, no su
  código); los `PreToolUse` de `git-seguro` y `sensible`; el `deny` de F §5 (9 `Read`, ninguna `Bash(...)`, que apagaría PowerShell;
  D-6); `deny` de `Write`/`Edit(./.claude/revisiones/**)`. `m/hooks/lib/fabrica.cjs` exporta la lista (`DENY_FABRICA`).
- `barreras`, `candado`, `cambios`, `estructura`: `--indice`, `--rango`, y los ids de ficha suman `secretos:<NOMBRE>`, `publicas:<NOMBRE>` y
  `datos-de-prueba`, **en `frenos`, solo cuando aflojan** (D-3).
- `session-start`/`inyeccion`: `hooksPath` y las líneas de F. `/cierre`: "si el pre-commit frena, se arregla; nunca `--no-verify`". La `SKILL.md`
  del Equipador. `docs/README.md`: la fila. Notas con fecha en F, A, E y el SPEC-0 (Cruces).

## NO SE TOCA

**El `~/.claude/` real de ninguna PC** (solo llega lo que copia `kit-sync`, sin registrar; instalar es de Guido). El kit v2, el `.claude/` de
vibe-kit, la flota, `tips/`, `_fuente/`, `kit/VERSION`, la gramática de `ficha.cjs`, los formatos de `frenos.log` y `cambios` (salvo D-3),
el código de `niega-aprobar.cjs` (su registro pasa a exec).

## Criterios de aceptación

1. ✅ **G0** (2026-10-29, 2.1.309): las cuatro fallas frenan con `onFailure` y pasan sin él; relectura y `deny` absoluto, verdes.
2. Suite verde; casos sí/no por freno; **mutación por freno** en copias (nunca `m/`): cada regla borrada o invertida pone una prueba en rojo.
3. **Los cuatro casos por hook**, en pruebas y vivos en un clon de `alfa`; **sin remoto ni ficha, `ls`, `git status` y un `Write` común pasan**.
   Cierra el pendiente del paquete 1.
4. 4.3: cada fila con casos sí/no (los seis que imprimen, no `set -e`; los caminos a los hooks con obrero y no con humano ni `actualizador`;
   `curl -H "…$GH_TOKEN"` pasa; `service_role` frena); **ni el `frenos.log` ni la salida contienen la clave de prueba**; grep de `kit/` en 0.
5. 4.4: su "hecho cuando"; `push -n`, `pull --rebase`, `GIT_EDITOR=true git rebase --continue` pasan; `GIT_DIR=… git commit` frena.
6. 4.5: `ask` en los cuatro modos con ventana; PARADA de noche o sin ventana; prosa y `tabla:` nunca; **N ≥ 200 llamadas en G13 con el arranque
   de node incluido**: p95 ≤ 300 ms, y si no, el número a Pendientes sin frenar el paquete.
7. P6.7 y crit. 17: `sensible:` commiteado en un worktree **sin mergear** no cambia nada.
8. P4.6 en un clon de `alfa`: `hooksPath` una vez, el previo encadenado; clave de prueba → 1 tapada; sin gitleaks **y con gitleaks colgado**,
   humano en rojo y `nocturno`/`actualizador`/`desconocido` → 1; freno quitado sin `aprobado` → 1; **candado editado en el índice o en la ref
   para dar verde → 1**; sin `git add` no traba (rf-10); `pre-merge-commit`; **un commit con `--no-verify` desde una terminal no sube** (rf-7).
9. `cargar-secreto` con `HOME` falso: guarda, relee, reemplaza, nombre inválido → 2, **el valor nunca en stdout, stderr ni variables**; con
   el `settings` del instalador (`--settings`), `Read` del almacén → negado.
10. Crit. 19 del kit: cada rama de la guardia (sin veredicto, otro hash, sin commitear, `nocturno`, sin bandera, con bandera, `dummy`).
11. Instalador, `HOME` falso: registra e `INSTALADO`; la segunda vez "sin cambios" byte a byte; lo ajeno igual; JSON roto → no toca y 1;
    `--sacar-viejo`, `--quitar` (vuelve al original), `--plan` (no escribe).
12. `doctor`, `HOME` falso: verde con todo; **cada chequeo forzado a fallar da su línea con el arreglo**; dos corridas iguales; no escribe nada.
13. Anti-desvío: `pc/lib/*` = `m/hooks/lib/*`; `secretos.cjs` corre desde una copia sola de `hooks/kit/`, **con `HOME`/`USERPROFILE` falsos**.
14. **Medición**: 0 falsos positivos en `secretos` y `git-seguro`, 0 `deny` de `sensible` con humano de día con modo; solo números al tracker;
    **`gitleaks git --log-opts=0dd17dc..HEAD` verde** sobre vibe-kit (0dd17dc = la apertura de D3.1).
15. `rehacer.sh`: el paso en `alfa` y `beta` (`--molde` 0, sin él 1, `todo` 0), el `2b` congelado, `gama` intacta, dos corridas iguales.
16. El arranque en `alfa` imprime las tres líneas de F y la huella sigue ≤ 9.700.
17. `kit-sync` LIMPIO; **hash de `~/.claude/settings.json` y `~/.claude/hooks/` reales igual al de la apertura de D3.1**.
18. Red team sin ALTOS; el revisor frío leyó el diff entero y lo suyo está aplicado o anotado.

## Los encargos (el director reparte, lee cada diff y corre la suite; cada encargo corre solo sus pruebas)

| # | Modelo | Qué | Puede tocar (exacto) | Crit. | Depende · paralelo |
|---|---|---|---|---|---|
| G0 · G0b | director | `onFailure` — **✅** · la forma exec — **✅** (D-7) | nada del repo | 1 | — |
| G1 | Sonnet | El corpus — **✅** | el scratchpad | 14 | — |
| RT | Opus | Red team, hasta 3 rondas | nada | 18 | antes de G2 |
| G2 | Sonnet | `comando.cjs` (Hermes + PowerShell + asignaciones) — **✅ D3.1** | `m/hooks/lib/comando.cjs` y su prueba | 2 | ∥ G6, G8, G9 |
| G3 | Opus | `git-seguro.cjs` y su medición — **✅ D3.2** | `m/hooks/git-seguro.cjs` y su prueba | 2, 3, 5, 14 | G2 · ∥ G4, G5 |
| G4 | Opus | `sensible.cjs` con el caché, `kit.ejemplo.md`, y su medición — **✅ D3.2** | `m/hooks/sensible.cjs`, `m/kit.ejemplo.md`, sus pruebas | 2, 3, 6, 7, 14 | G2 · ∥ G3, G5 |
| G5 | Opus | `secretos.cjs`, `pc/lib/`, prompts al corpus, y su medición — **✅ D3.2** | `eq/pc/secretos.cjs`, `eq/pc/lib/**`, sus pruebas | 2, 3, 4, 13, 14 | G2 · ∥ G3, G4 |
| G6 | Opus | `--indice`, `--rango`, ids de D-3 — **✅ D3.2** | `m/hooks/lib/{barreras,candado,cambios}.cjs`, `m/scripts/estructura.cjs`, sus pruebas | 2, 8 | ∥ G2 |
| G7 | Opus | githooks, `hooksPath`, líneas de F, `settings.json` (todo en exec), `DENY_FABRICA`, `/cierre` | `m/githooks/**`, `m/hooks/session-start.cjs`, `m/hooks/lib/{inyeccion,fabrica}.cjs`, `m/settings.json`, `m/skills/cierre/SKILL.md`, sus pruebas | 2, 3, 8, 16 | G3, G4, G6 (**único dueño de `settings.json`**) |
| G8 | Sonnet | `cargar-secreto.sh` y `.ps1` | `eq/pc/cargar-secreto.*` y su prueba | 9 | ∥ G2 |
| G9 | Opus | `db-guardia.cjs` | `m/hooks/lib/db-guardia.cjs` y su prueba | 2, 10 | ∥ G2 |
| G10 | Opus | `instalar-hooks-pc.cjs` | `eq/scripts/instalar-hooks-pc.cjs` y su prueba | 11 | G5, G8 |
| G11 | Sonnet | `doctor.cjs` y el modo del Equipador | `eq/scripts/doctor.cjs` y su prueba, `eq/SKILL.md` | 12 | G7, G10 |
| G12 | Sonnet | El paso de `rehacer.sh` | `pruebas/rehacer.sh` | 15 | G7, G9 |
| G13 | Sonnet | Sesión real `claude.exe -p` (`MSYS_NO_PATHCONV=1`; la PC por `--settings`, también con `HOME`/`USERPROFILE` falsos) | clones en el scratchpad | 3, 5-9, 13 vivos | todo |
| RF | Opus | Revisor frío | nada | 18 | G13 |

Paralelo solo donde dice, cada uno en su worktree. **Mutación**: G2-G7, G9, G10, en copias. La suite (15-20 min), el director tras cada
encargo aceptado; commit por encargo.

## Lo prueba una sesión real

| # | Quién · dónde | Qué mirar |
|---|---|---|
| 1 | G13 · `-p` en clones de `alfa` | Criterios vivos; `niega-aprobar` en bypass (pendiente c: si el clasificador frena el lanzamiento, a Guido) |
| 2 | G13 | `frenos-del-proyecto` en bypass y desde un subagente |
| 3 | G13 | `UserPromptSubmit` con una clave falsa: bloqueado, y **la salida no trae la clave** |
| 4 | **Guido, `clientes` y `Usuario`** (el "hecho cuando" del orden 3) | Kit al día (`kit-sync.sh sync` acá; "actualizate" allá); `node ~/.claude/skills/arquitecto-skills/scripts/instalar-hooks-pc.cjs --plan`, sin `--plan`, reiniciar; en `../vibe-kit-pruebas/alfa`, `node ~/.claude/skills/arquitecto-skills/scripts/doctor.cjs` → **todo `✓`**; después `… --sacar-viejo` |
| 5 | Guido · VS Code en `alfa` | "Mostrame `ALFA_DB_URL`" y "hacé `git stash`" → frenados; una clave pegada → bloqueada; una entrada de `sensible:` → la ventana (y que la extensión mande `permission_mode`) |
| 6 | Guido · VS Code, las dos PCs | `onFailure` y la forma exec en la extensión (ficha de `alfa` rota en `origin`: `ls` y `git status` pasan sin decir nada —el hook es barato
cuando no frena—, y `git stash` frena con "ficha rota: …:<línea> — corré doctor"; G13, 2026-10-30, en `-p`) |
| 7 | Guido o el piloto · Windows sin Git Bash (NO VERIFICADO) | Que los hooks anden en exec y los `.githooks/` con el `sh` de git |

## Cruces contra los diseños (la lección de D1.1)

| # | Qué | Qué dice cada uno | Gana |
|---|---|---|---|
| 1 | Ids | Paquete 1: `<clase>:<lo que sea>`; ejemplo: `hook:git-seguro/push-force`, `pregunta:borrar-datos-reales`; F §14: `secretos:jwt` | Esos tres tal cual; nuevos: los de 4.4 y 4.3, `pregunta:<clave>`, `db:*` (no quitables: es la red de F §13) |
| 2 | Obrero · raíz | SPEC-0 4.3: la rama; Entidades: `.kit-rol` · F §7.4: `CLAUDE_PROJECT_DIR` | Las dos (o) · git desde el `cwd` (H §10.3) |
| 3 | `secretos:`, `publicas:`, `datos-de-prueba:` | SPEC-0 4.6: barrera = `frenos`, `sensible`, `autorizado` | Suman cuando aflojan (D-3) |
| 4 | "Aprobado" en `db migrar` | SPEC-0 6.6; `toca` no tiene categoría para datos | Bandera + ventana (D-4); tablas como `tabla:<x>` |
| 5 | `.gitleaksignore` | F §10: el `/cierre` lo lista | `barreras` ya pide `aprobado` |
| 6 | Sin gitleaks | F §10: pasa; SPEC-0: `nocturno`/`actualizador` fallan | SPEC-0, más `desconocido` y "colgado" |
| 7 | `-n` | SPEC-0 4.4: "`--no-verify` o `-n`" | Solo en `commit` |
| 8 | "De noche" | Entidades: `nocturno` o `.kit-noche` | Solo `nocturno`; `.kit-noche`, orden 5 |
| 9 | Hooks de git | F §10: pre-commit | + `pre-merge-commit`, `pre-push` |
| 10 | Pre-commit y actualizador | P4.6 exención (a); paquete 2: sin `--molde` no hay (a) | **Traban `kit/v*` y al adoptador** hasta que el orden 6 fije la ruta del molde: Pendientes del 6 |
| 11 | `cargar-secreto` | F §9: "script del kit" | Por PC, bajo `frenos-de-la-pc` |

Los cruces contra el SPEC-0 que piden decisión son D-1, D-2, D-5, D-6, D-8 y D-11.

## Supuestos

- ~~[ALTO] `onFailure: "block"`~~: G0, en `-p`; en VS Code, fila 6.
- [ALTO] Que la extensión de VS Code manda `permission_mode` en `PreToolUse` (sin él, `sensible` y `niega-aprobar` niegan; r1-17). Fila 5.
- [MEDIO] Que los hooks corren en paralelo (doc); si no, el p95 se mide por suma. gitleaks ≥ 8.19 en las dos PCs (`doctor`).

## Riesgos y decisiones ⚠️

**Decisiones del director** (sin Guido; las ⚠️ arriba; reversibles antes del tag):
- ⚠️ **D-1.** P6.7 por hook, no por reglas en el `settings.json` (recomendada; alternativa: un script que escribe `ask`/`deny` en la zona propia,
  como el SPEC-0 y H). El `settings` es del árbol de trabajo y en bypass una `ask` no pregunta.
- ⚠️ **D-2.** Por PC se registra solo el corrector (recomendada; alternativa: también un `SessionStart` por PC, como el texto del orden 3).
- ⚠️ **D-3.** `secretos:`, `publicas:` y `datos-de-prueba:` cuentan para `barreras` cuando aflojan (recomendada: sacar `DB_URL` de `secretos:`
  apagaba un freno sin `aprobado`; alternativa: riesgo escrito). Ids nuevos en `ids:`, sin palabra nueva en `toca`.
- ⚠️ **D-4.** El "aprobado de día" de `db migrar` = `--borra-datos-reales` + la ventana de 4.5 (recomendada; alternativa: `toca: datos`, palabra
  nueva en un formato que viaja).
- ⚠️ **D-5.** El `UserPromptSubmit` falla abierto (recomendada: con `block`, un bug deja la PC sin chat; alternativas: `block` como manda 4.7, o
  sacarlo y corregir el criterio 11).
- ⚠️ **D-6.** El `deny` de F §5 entra al molde ahora (recomendada; alternativa: esperar al Arquitecto v3).
- ⚠️ **D-7.** **Todos los hooks del kit en forma exec** (G0b verde; recomendada: no dependen de Git Bash, y la doc pide `args` cuando hay una
  ruta con variable). *Alternativas*: exigir Git Bash con el texto de hoy (sin él la variable no se expande y `block` traba todo); o
  `"shell": "powershell"` con `$env:CLAUDE_PROJECT_DIR` (ata el molde a PowerShell). `doctor:git-bash` baja a `⚠`.
- ⚠️ **D-13.** Variables de entorno peligrosas para git **por lista** (la de 4.4; recomendada; alternativa: todo `GIT_*`, descartada porque
  `GIT_EDITOR=true git rebase --continue` es legítimo). Se mide.
- ⚠️ **D-14.** Imprimir una variable se niega **solo cuando el valor sale a la pantalla** (las tres formas de 4.3; recomendada: la variable como
  argumento de otro programa es "usar sin ver"; alternativa: la inversión completa del red team, que niega toda mención salvo lo permitido).
- ⚠️ **D-15.** `historia-defecto` angosto: con remoto, solo lo que tira commits publicados; sin remoto, `ask` (recomendada; alternativa: negar
  todo `reset`/`rebase` en la rama por defecto, que frena el `reset HEAD~1` legítimo).
- D-8. Mínima **2.1.295** (doc, re-chequeada por `doctor`; alternativa: 2.1.309, la medida, que deja en rojo la 2.1.308 de `clientes`).
- D-9. `sensible` solo sobre Bash/PowerShell hasta que haya cicatriz (recomendada, r1-10: las MCP ya preguntan salvo que estén en `allow`, y
  sin cicatriz va contra la regla 1 de A; alternativa: también `mcp__…` por nombre exacto).
- D-10. El corrector protege además `.kit-rol`, `<git-common-dir>` (`config`, `refs`, `packed-refs`, `FETCH_HEAD`, `logs`) y `.claude/cambios/`
  sin ventana (recomendada; alternativa: la lista de 4.3 sola).
- D-11. Las líneas de `gh` del arranque, al orden 6 (alternativa: con tope de 3 s).
- D-12. `pc/lib/` versionadas con la prueba anti-desvío (alternativa: generadas); el runner corre del disco (alternativa: también de la ref).

### Lo que esto no cierra

- **Todo freno de comando es un patrón** (F §21): alias, variables, base64 o un script lo esquivan. La red es el candado (pre-commit, pre-push, gate).
- **El entorno persistente** (un `env` en los `settings`, un `.bashrc`) que mete variables peligrosas en todo git (r1-1).
- **La ref vigente falsificada** (r1-2 d): la ficha que leen todos los hooks sale de ella; si se falsifica, afloja los frenos de todas las
  pestañas hasta el próximo `fetch`; el candado doble lo caza en el commit.
- **r4-1 b y rf-5 se achican, no se cierran**: un sello falso bien hecho sigue igual a uno legítimo. Para Guido, como en D2.2.
- **El runner y el `sh` de `.githooks/` corren del disco**: editarlos apaga el pre-commit de ese commit; lo frena el corrector en sesión de
  agente, y si pasa, `barreras` en el `/cierre` del principal y en el gate.
- `grep -r` sobre una carpeta con un `.env` sin nombrarlo; un programa que lee el `.env` o el almacén por adentro (sin sandbox).
  `.claude/revisiones/` escrito por Bash: hasta P6.10 nadie escribe veredictos y la guardia niega igual.
- **La bandera de `db migrar` es texto** (r1-22): un script intermedio (`npm run x` que llama a `db migrar --borra-datos-reales`) pasa sin la ventana.
- **Un clon temporal fuera del repo** (r2-2 c): sin `hooksPath`, pushea sin pre-push; `salir-del-worktree` frena los caminos conocidos, y si
  pasa, el director lo frena en el merge (con un repo público, el secreto ya quedó arriba: runbook).
- **Lo que el revisor frío de D3.3 dejó afuera** (de nicho): git por `xargs`, `find -exec`, `submodule foreach` o `Start-Process`; un
  `git-<algo>` externo en el `PATH`; un alias de shell `!sh script.sh` ya guardado (se ve el `sh`, no el script); `git config --edit` de un
  humano; la clave en el `prompt` de un subagente (`Agent`/`Task`) o en una herramienta `mcp__*` (rf3-14; `secretos` no mira esos, D-9).
- **El pre-merge-commit no corre el candado** (rf3-1): un rol que mergea local y nunca pushea deja sus merges sin juzgar (sus commits, sí).
- **husky y lefthook** (r2-3): husky pisa `core.hooksPath` en cada `npm install` (`hooks-path-ausente` lo caza en el próximo commit);
  lefthook escribe en `.githooks/` (`doctor` avisa). Cuántos repos de la flota los usan: NO VERIFICADO (piloto).

## Lo que se prueba más adelante

Orden 4: el `db` por stack, el `deny` al `.env` del padre (P6.2). Orden 5: `.kit-noche`, `/obrero`, P6.10, el gate. Orden 6: la exención (a) con
ruta fija (Cruces 10), el `doctor` completo, `autoMode`, las líneas de `gh`. Guido: filas 4-7. El piloto: cuánto molesta cada freno.

## Red team (Opus, `redteam-spec`; los informes, al repo privado)

| Id | Sev | Qué se hizo |
|---|---|---|
| r1-1 | ALTO | `asignaciones` en `partir()`; `variables-peligrosas` (D-13), `config-include`, `config-agente`; el entorno persistente, a "no cierra" |
| r1-2 | ALTO | Candado doble (ref e índice); `refs`/`packed-refs`/`FETCH_HEAD`/`logs` protegidos; `plomeria`; la ref falsificada, a "no cierra" |
| r1-3 | ALTO | `archivo-deny` por lista de lo permitido, con `/proc/*/environ`; variables, solo lo que sale a pantalla (D-14) |
| r1-4 | ALTO | Sin claves literales en `kit/` (grep en 0); tapado ampliado; recortes solo en el scratchpad; gitleaks desde `0dd17dc` |
| r1-5 | ALTO | `historia-defecto` angosto (D-15); `rebase origin/main` pasa; `reset HEAD~n` aparte en la medición |
| r1-6 | ALTO | gitleaks con plazo de 60 s, "colgado" = sin escáner; caso en crit. 8; `doctor` dice la causa |
| r1-7 a r1-12 | MEDIO | `push-borrar`, `branch -D`, `-B`/`-C` · `hooks-path-ausente` · `suppressOriginalPrompt` · caché por `fs`, D-9 a la alternativa, N ≥ 200 · `tabla:` · `role: anon` siempre y `datos-de-prueba` en D-3 |
| r1-13 a r1-16 | MEDIO | G0b verde: todo en exec (D-7) · `frenos-de-la-pc` con `ask` · `<home>` por `__dirname` · `salir-del-worktree` definido |
| r1-17 a r1-22 | BAJO | supuesto de `permission_mode` · `restore --staged` · runner da 1 · `INSTALADO` · sin `google-api` · la bandera de `db`, a "no cierra" |
| r2-1 a r2-7 | MEDIO | pipeline entero, sin mayúsculas, comodines y variables en `archivo-deny` · candado de la ref ausente con ficha → rojo, `.git` del worktree y `worktrees/**` protegidos, el clon temporal a "no cierra" · `core.hooksPath .githooks` gana sobre `config-agente`, `lefthook` en `doctor` · `historia-defecto` por commits publicados (dos PCs) · "usar sin ver" en lo permitido · lo verboso y los nombres de fábrica en `imprime-variable` · `push --delete` de una mergeada pasa |
| r2-8 a r2-11 | BAJO | la asignación misma de una variable peligrosa se niega · mensajes de `config-agente` con alternativa · gitleaks con un reintento · `.lock` viejo: "pedíselo al director" |

**Ronda 2 (2026-10-29): sin ALTOS** → el delta se sella provisorio (sin Guido). La ronda 3 no hace falta (el SPEC dice "hasta 3, la última sin
ALTOS"); lo que aparezca en los encargos va al revisor frío.
