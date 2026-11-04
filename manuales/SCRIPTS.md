# Los scripts del kit: referencia

> **Para qué sirve**: una sección corta por script y por hook. Para cada uno: qué hace, cómo se llama y qué devuelve. Está sacado de
> la cabecera de cada archivo. **Es referencia, no tutorial**: para saber cuándo usar cada cosa, mirá la página de la pieza
> ([`MOLDE.md`](MOLDE.md), [`ROLES.md`](ROLES.md), [`EQUIPADOR.md`](EQUIPADOR.md), [`COMO-USAR-EL-ARQUITECTO.md`](COMO-USAR-EL-ARQUITECTO.md)).
> Si difiere del código, manda el código.

Casi todos son Node (`.cjs`, sin dependencias) y comparten una convención de salida: **0** anduvo · **1** se negó o dio rojo (con una
línea de qué hacer) · **2** mal llamado. Un error propio dice `<script> roto: corré doctor`. Lo que un script no pudo mirar es
**NO VERIFICADO**, nunca verde. Los del molde se llaman desde la raíz del proyecto como `node .claude/scripts/<nombre>.cjs …`.

Índice: [A. Molde, scripts](#a-molde-scripts-claudescripts) · [B. Molde, hooks de Claude](#b-molde-hooks-de-claude-claudehooks) ·
[C. Molde, githooks](#c-molde-githooks-githooks) · [D. Equipador](#d-equipador-skillsarquitecto-skillsscripts) ·
[E. Arquitecto](#e-arquitecto-skillsarquitectoscripts) · [F. Scripts de la PC](#f-scripts-de-la-pc-skillsarquitecto-skillspc) ·
[G. Del repo madre](#g-del-repo-madre-vibe-kit)

---

## A. Molde, scripts (`.claude/scripts/`)

### afirmaciones
Corrector de afirmaciones en prosa: marca comentarios, mensajes de error y viñetas de CHANGELOG que prometen de más.
`node .claude/scripts/afirmaciones.cjs <sha-base> [--frenar]`
Lista los hallazgos como "⚠️ a mirar" y sale 0 (avisa, no frena). Con `--frenar` sale 1 y anota en `frenos.log`. 1 también si no pudo leer el diff.

### agents
Genera el `AGENTS.md` (opt-in) a partir del `CLAUDE.md`.
`node agents.cjs generar [--raiz <dir>]`
Escribe `AGENTS.md` solo si la ficha vigente dice `multi-llm: sí`; con otro valor, sin ficha o ficha rota, no escribe. Un `AGENTS.md` que no trae su marca no se pisa. Imprime una línea de resultado.

### cambios
El registro de cambios del método (`.claude/cambios/`).
`node .claude/scripts/cambios.cjs nuevo --slug <s> --clase 2|3-barrera --toca <a,b> (--origen "<t>" | --cita "<alias> <id>") […]` · `listar [--te-espera | --aprobados-nuevos]` · `verificar` · `anotar-sha <id> <sha>` · `rechazar <id> "<motivo>"` · `aprobar <id>` · `subio-al-kit <id> <N.N.N>`
Escribe un archivo por cambio y hace su propio commit por rutas. **`aprobar` es del dueño**: `cambios aprobar` lo corre la sesión cuando el dueño lo pide, y su clic en la ventana es la firma; nunca por su cuenta. Se niega solo desde un agente, un modo sin ventana, un worktree o con la ficha rota. `nuevo` lo usa la sesión cuando cambió cómo trabaja el proyecto (un freno, una regla, un paso de un ritual). Detalle: [`MOLDE.md`](MOLDE.md) §7.

### contexto
Cuánto contexto lleva usada esta sesión y cuánto le falta (lee el transcript de la sesión).
`node .claude/scripts/contexto.cjs [--sesion <id|ruta.jsonl>] [--json] [--cwd <carpeta>]`
Imprime `contexto: <usado>k de <ventana>k (<pct>%) · faltan <falta>k · <modelo>`; con `--json`, `usado`, `ventana`, `pct`, `falta`, `modelo`, `sesion`. Sale 1 con `NO VERIFICADO · <por qué>` (por ejemplo, un modelo que no conoce). Dónde compacta la plataforma: NO VERIFICADO.

### encargo
El encargo por script: lo que usan el director y el obrero.
`node .claude/scripts/encargo.cjs partida <x>--<ID>` · `presentar <x>--<ID> [--sin-base] | --spec` · `mensaje <TIPO> [<ruta>[@<sha>]]` · `autorizado <x>--<ID>` · `verificar <x>--<ID> [--plazo <min>]`
Lee el encargo y el spec **de git**, nunca del disco. `partida` imprime la línea `- Partida:`. `presentar` chequea rama, encargo y sello del spec. `mensaje` dice si un aviso vale (git tiene que respaldarlo). `autorizado` reescribe `permissions.allow` del `settings.local.json` del worktree e imprime las líneas de apertura; la de Guido termina en `→ primer mensaje: /obrero <x>--<ID>`. **La tarea 0**: con el sello `entorno — (tarea 0: montar el entorno de prueba)` en el spec, `presentar` y `autorizado` niegan (1) todo encargo que no sea el `00` mientras la `.claude/kit.md` de la punta de `modulo/<x>` no tenga un entorno `dummy` o `prueba`. `verificar` imprime **seis líneas** (remoto · limpio · pruebas · alcance · main · barreras) y sale 0 si ninguna es ❌.

### estado
La vista de `/estado`.
`node .claude/scripts/estado.cjs [<x>]`
Arriba "TE ESPERA", después una línea por módulo activo (avance medido, encargos, "podés cerrar", esperas, uso de contexto) y las líneas propias de `.claude/estado-lineas.md`. Solo informa. Sale 1 si el módulo no existe.

### estructura
El candado de estructura: los diez ids (`raiz`, `rutas`, `topes`, `mesa`, `estados`, `lecturas`, `estado-viejo`, `barreras`, `datos`, `portada`).
`node .claude/scripts/estructura.cjs [todo | parcial | <id>…] [--molde <dir> [--molde-viejo <dir>]] [--sin-log]` · `estructura.cjs barreras (--indice | --rango <a>..<b>)`
Una línea por falla, con qué hacer, y la anota en `frenos.log`. `barreras --indice` juzga lo que lleva el commit en curso; `--rango` juzga los commits que sube el push (un rango vacío es verde). `--molde` lo pasan solo el actualizador y `rehacer.sh`. Detalle: [`MOLDE.md`](MOLDE.md) §5.

### mesa
La mesa entre directores de dos proyectos, por git.
`node .claude/scripts/mesa.cjs nuevo <TIPO> <alias>/<rol> <x> [--archivo <ruta>] [--de <alias>]` · `abiertos [--hilo <id>]` · `acordados [--hoy]` · `huella <alias>@<sha> <carpeta> [--copia <dir>]`
`nuevo` escribe el mensaje en `docs/modulos/<x>/mesa/<alias>/` (≤ 2 KB), lo commitea, lo sube a origin e imprime el aviso de una línea para mandar por el canal; si no sube, no hay aviso (sale 1). `abiertos` lista los pedidos sin respuesta de los dos lados; `acordados`, los acuerdos firmados; `huella`, el hash de un conjunto compartido (sale 1 si tu copia no coincide).

### noche
"Me voy": el checklist de la noche y el despertador.
`node .claude/scripts/noche.cjs me-voy [--hasta HH:MM]` · `volvi` · `despertador [--modulo <x>] [--cada <seg>] [--una-vez]`
`me-voy` escribe la marca `.kit-noche` en el worktree del director (desde ahí todo se trata como nocturno) e imprime el checklist. `volvi` borra la marca en todos los worktrees. `despertador` mira git y **solo imprime cuando algo cambió**: `DESPERTAR · <motivo> · <rama>@<sha7>` (motivos: `PARADA`, `commit`, `commit en <defecto>`, `sin red`). Cómo despierta de verdad al director: NO VERIFICADO, piloto.

### paquete
Arma en un solo archivo lo que el revisor necesita ver (el revisor no tiene shell).
`node .claude/scripts/paquete.cjs <sha-base> [--salida <archivo>] [--plazo <min>] [--pruebas <cmd> | --sin-pruebas]`
Junta el diff contra HEAD, el `git status`, los avisos de `afirmaciones` y la salida de las pruebas. Escribe en `.claude/paquetes/<sha7>.md` e imprime la ruta en la última línea. Sale 0 aunque las pruebas den rojo (el rojo es dato); 1 si no pudo armarlo.

### portada
Arma el `README.md` de la raíz.
`node .claude/scripts/portada.cjs armar [--plan] [--raiz <dir>]` · `chequear [--raiz <dir>]`
`armar` escribe `README.md` (y `assets/banner.svg`) desde `docs/NORTE.md` y la ficha; no pisa lo que se tocó a mano; con el marcador `{{…}}` sin llenar no escribe. Con un README propio sale 1 y, si el banner quedó, un renglón: `el banner quedó en assets/banner.svg: enlazalo arriba del README si querés`. `--plan` dice qué haría. `chequear` sale 0 si cumple, 1 con una línea por lo que falta. Detalle: [`MOLDE.md`](MOLDE.md) §8.

### resumen
El resumen del día.
`node .claude/scripts/resumen.cjs [<x>] [--forzar]`
Con un módulo con director lo escribe en `docs/modulos/<x>/bitacora/<fecha>-resumen.md`; sin director imprime el bloque para el CHANGELOG (no lo toca). Se muestra una vez por día: si ya existe, dice dónde está y sale 0; `--forzar` lo rehace.

### tiempos
Lo mecánico del módulo, desde git y los transcripts.
`node .claude/scripts/tiempos.cjs tiempos <x> [--ver]` · `alarma [--transcript <ruta>]` · `contador <x>`
`tiempos` escribe la duración y los sub-pasos de cada encargo en `docs/modulos/<x>/tiempos.md` (`--ver` solo imprime). `alarma` cuenta tus intervenciones en la pestaña: con más de 3 imprime la línea para las notas del CIERRE y sale 1. `contador` cuenta sub-pasos y desvíos y nunca frena.

### todo
El cierre del TODO.
`node todo.cjs cierre [--base <ref>]`
Poda `docs/TODO.md` (lo que lleva 90 días sin tocarse baja a 🟢) y imprime `TODO: +n −m · k ítems · j bajaron a 🟢`. Sale 3 si no hay `docs/TODO.md`.

### worktree
Los worktrees de los módulos: nacen, se abren y se cierran por script.
`node .claude/scripts/worktree.cjs crear|abrir <x>[--<ID>] [--noche] [--model <m>]` · `sync-env` · `cerrar <x>[--<ID>] [--cancelado]` · `integrar <x> [--ok-de-guido]` · `integrados`
`crear`/`abrir` escriben `.kit-rol`, copian los `.env` ignorados **sacando todo nombre que esté en el almacén de secretos**, corren `vars.comando-setup` e imprimen la línea de apertura, que termina en `primer mensaje: /director` (un módulo, también con `--noche`) o `primer mensaje: /obrero <x>--<ID>` (un encargo). `cerrar` hace todos los chequeos antes de borrar y nunca fuerza (salvo `--cancelado`); después de la rama local borra la de origin **solo si** el fetch anduvo y ya está mezclada en `origin/<madre>` (si no, la deja y lo dice en una línea). `integrar` lleva el módulo terminado a la rama por defecto: merge `--no-ff`, el gate y el push sin `--force`; nada sube si algo falla; termina en `después: /cierre en tu carpeta principal …`. `integrados` (lo corre el `/inicio` después del `pull`): una línea por cada `integrar: módulo <x>` de la rama por defecto local posterior al último commit que tocó el handoff, con "corré /cierre"; nada si no hay; sale 0 siempre.

---

## B. Molde, hooks de Claude (`.claude/hooks/`)

Los llama Claude Code, no vos: leen un JSON por stdin y devuelven su decisión por stdout. Están registrados en el `settings.json`. Detalle: [`MOLDE.md`](MOLDE.md) §3.

### session-start
Hook de arranque (`SessionStart`). Inyecta handoff, TODO, git y ficha dentro del presupuesto de 9.700 caracteres, deja la marca de sesión y pone `core.hooksPath=.githooks`. **Sale siempre 0 y no niega.** Plazo de 10 s: lo que no entra se saltea y lo dice ("arranque lento"). Si existe `session-start.propio.sh`, lo corre con bash.

### escritura-docs
`PreToolUse` sobre `Write`. Juzga solo la ruta: archivo suelto en la raíz de `docs/` o carpeta fuera de las tres → `deny` y un renglón en `frenos.log` (`candado:raiz`). Apagado sin la pieza `hook-escritura`. Si falla, deja pasar.

### git-seguro
`PreToolUse` sobre Bash y PowerShell. Frena el git que borra trabajo, falsifica referencias o esquiva el pre-commit (ids `hook:git-seguro/<caso>`). Mira cada comando simple, no el texto. Devuelve `ask` o `deny` con la alternativa en el mensaje, y deja un renglón en `frenos.log` (nunca el comando). Un error propio **frena** ("freno roto: corré doctor").

### niega-aprobar
`PreToolUse` sobre Bash y PowerShell, cuando el comando contiene `cambios` y `aprobar`. **Niega** en modos sin ventana (`bypassPermissions`, `dontAsk`), sin modo, con `.kit-rol` de agente o con la ficha rota; en los demás devuelve `ask`. Cada negativa deja un renglón en `frenos.log`.

### sensible
`PreToolUse` sobre Bash y PowerShell. Hace las cinco preguntas: pregunta si algún comando simple **empieza** con una entrada de `sensible:` de la ficha vigente. Ids `pregunta:<clave>`.

---

## C. Molde, githooks (`.githooks/`)

### kit-githook
El runner de `pre-commit`, `pre-merge-commit` y `pre-push`: `node .githooks/kit-githook.cjs <cuál> "$@"`.
Corre gitleaks sobre lo que entra (staged, o lo que sube el push; lo arma él para que un `-diff` en `.gitattributes` no esconda una clave) y el candado `barreras`. Con gitleaks colgado reintenta; sin escáner, el humano pasa en rojo con aviso y lo nocturno no pasa. `pre-merge-commit` no corre el candado.

---

## D. Equipador (`skills/arquitecto-skills/scripts/`)

### actualizar
El actualizador del kit. Un script determinista; el único agente es el de la fusión de una pieza adaptada con conflictos.
`node actualizar.cjs aplicar <carpeta> --kit <raíz> [--molde-viejo <dir>] [--plan] [--claude <exe>|no]` · `chequear <carpeta> --kit <raíz> --base <sha>` · `flota <repo>…|todo --canon <url|dir> [--tag <vX.Y.Z[-rc.N]>] [--proyectos <carpeta>]` · `adoptar <carpeta> --kit <raíz> --mirar [--nuevo] [--nivel …] [--comando-test "<c>"] | --aplicar <propuesta> [--principal <carpeta>] [--claude-md]` · `resolver <carpeta> <pieza> mezclar|propia|nueva|congelar --por "<texto>" [--a-mano]` · `ultimo-tag <clon del kit>`
`aplicar` pone al día una carpeta pieza por pieza según su ficha (no commitea ni pushea). `chequear` imprime las nueve líneas del chequeo mecánico. `flota` lo hace repo por repo en un clon temporal: verde → un commit a la rama por defecto; rojo → rama `kit/<tag>` ROTA; protegida → te espera; imprime la tabla y "te espera:". Saltea el repo con ramas `modulo/*` del remoto **sin mezclar** en su rama por defecto (la línea dice: si la mezclaste con squash en GitHub, borrá la rama desde la web). Sin `--tag` reparte el último tag anotado (el de `ultimo-tag`: **rc incluido**, y `v3.0.0` le gana a `v3.0.0-rc.N`) a todo proyecto con ficha; la versión se compara entera, también con `-rc`.
`adoptar` pasa un proyecto sin ficha al kit. `--mirar` solo propone: con `--nuevo` (un repo recién nacido, el Modo A) las bases en molde, el candado, `director-obrero` y `estado`; en un repo con código, `director-obrero` y `estado` en `sí` (o `propia` si ya hay unos distintos); dice si al `CLAUDE.md` le falta "El tamaño del pedido" y si tiene un director/obrero propio, y la receta de `migrar-cambios` si hay registro propio. `--aplicar` escribe en el clon; `--principal` prende `core.hooksPath` = `.githooks` en la carpeta principal (nunca en el clon); `--claude-md` le suma al `CLAUDE.md` la sección "El tamaño del pedido" del molde.
**Una pieza adaptada que choca nunca se resuelve sola**: queda en `.claude/fusiones/<pieza>.md` con el motivo `la mezcla chocó…` (si hay `claude`, con su propuesta, sin aplicar), `## Dónde chocan` y las cuatro salidas. `resolver` escribe la que eligió el dueño, en su checkout: lo del informe, la ficha (estado, `por:` y, con `propia`, `desde:`: la versión desde la que se le vuelve a ofrecer) y borra el informe; no commitea. Salidas: 0 · 1 se negó o falló · 2 uso. Detalle: [`EQUIPADOR.md`](EQUIPADOR.md).

### cambios-flota
Lo que la flota aprendió, contado.
`node cambios-flota.cjs [<repo>…] [--proyectos <carpeta>] [--urgentes] [--kit <raíz>]`
Solo lectura y sin red: lee lo commiteado en la rama por defecto local de cada repo. Sin `--urgentes` imprime la tabla del ciclo (qué regla se repite, cuál entra al kit); con `--urgentes`, una línea por cambio urgente vivo (lo que corre el `/inicio` de vibe-kit). Sale 0 (es un informe) o 2.

### doctor
El chequeo de salud de esta PC y de este repo.
`node doctor.cjs [--home <dir>]`
**Solo lectura.** Una línea por chequeo, `✓|✗|⚠ <id> · qué · cómo se arregla`, y debajo el inventario de frenos del repo. Ids: `node`, `gitleaks`, `claude-code`, `lefthook`, `git-bash`, `settings-pc`, `hooks-pc`, `hooks-pc-iguales`, `deny-almacen`, `anti-secretos-viejo`, `plazo-arranque`, `pre-commit`, `ficha`, `sensible-prosa`, `version-kit`, `kit-sync`, `githooks`, `archivo-pc`, `credencial`, `gh-push`, `mesa-gh`, `cross-session`, `automode`, `copias-kit`, `frenos-vencidos`, `regla-tamano`. Sin red o sin poder correr algo externo: ⚠ NO VERIFICADO. Sale 0 si no hay ningún ✗; 1 si hay alguno.

### instalar-hooks-pc
El corrector de secretos de la PC.
`node instalar-hooks-pc.cjs [--home <dir>] [--plan] [--quitar] [--sacar-viejo]`
Copia `pc/` a `~/.claude/hooks/kit/` y lo registra en `~/.claude/settings.json` regla por regla (los hooks `PreToolUse`, el `UserPromptSubmit` y el `deny` del almacén de secretos). Lo que no es del kit no se toca. Igual → "sin cambios". `--plan` no escribe; `--quitar` deja la PC como antes; `--sacar-viejo` saca solo el registro del anti-secretos viejo. JSON inválido o forma rara → no toca nada, sale 1.

### migrar-cambios
Pasa un `CAMBIOS.md` de archivo único (el de Hermes) al registro chico del kit.
`node migrar-cambios.cjs --repo <dir> [--fuente docs/metodo/CAMBIOS.md] [--plan] [--commit]`
Un archivo por `CM-n` en `.claude/cambios/`, con cabecera y las cuatro secciones; un CM aplicado solo lo es si su SHA existe y está en la rama por defecto. Idempotente. No toca la fuente. Una línea por CM y el total; sale 1 si alguno no se pudo escribir.

### preparar-pc
"Preparame esta PC".
`node preparar-pc.cjs --kit <raíz del kit> [--home <dir>] [--proyectos <carpeta>] [--plan] [--flota] [--pisar-editados]`
**Muestra todo el plan antes de escribir.** Chequea node, git, gh, gitleaks y Claude Code (no los instala); copia el kit a `~/.claude/`; instala los hooks de la PC; mezcla el `settings.json` (`crossSessionInbound`, `autoMode.environment`); corre la capa privada si hay; escribe `kit-pc.md`; imprime la tabla y corre `doctor`. Un archivo editado a mano no se pisa salvo `--pisar-editados`. Sale 0 (los ⚠ no traban), 1 o 2. Termina con "reiniciá Claude Code".

---

## E. Arquitecto (`skills/arquitecto/scripts/`)

### arquitecto
Los chequeos y el sello del Arquitecto. **El sello lo escribe este script, nunca el modelo.**
`node <skill>/scripts/arquitecto.cjs sello <spec> [--no-partir "<quién>"] [--no-aplica tamaño|entorno "<razón>"]` · `ready <spec>` · `ready --pendientes` · `tope <spec>` · `entorno` · `registro <carpeta de proyectos>`
`sello` corre los chequeos (tamaño, entorno, tope) y escribe la línea con el hash del spec. Con la base real y ninguna de prueba, acepta la **tarea 0** (el renglón `- **Tarea 0**: …` primero en `## Entorno de prueba`) solo en un módulo con director y con el `kit:` de la ficha ≥ `3.0.0-rc.2`: el sello dice `entorno — (tarea 0: montar el entorno de prueba)`. `ready` se niega sin sello válido o con el spec tocado después, y cambia BORRADOR por READY y nada más. `tope` mide el spec y avisa (no corta). `entorno` chequea el gate de entorno de prueba contra la ficha. `registro` lee la ficha de cada proyecto de la carpeta (adaptador de ejemplo). Salidas: 0 · 1 negado o con fallas · 2 mal llamado.

---

## F. Scripts de la PC (`skills/arquitecto-skills/pc/`)

Los instala `instalar-hooks-pc` en `~/.claude/hooks/kit/`: son de la PC, no de un proyecto. Se nombran acá porque el runbook de la credencial los usa.

### secretos
El corrector de secretos. Hook que **niega** (`PreToolUse` sobre Bash, PowerShell, Write, Edit…) lo que escribe o pega una clave con forma real, y `UserPromptSubmit` que bloquea el prompt con una clave (este último **falla abierto**). Corre en todo proyecto, con kit o sin kit.

### cargar-secreto
Guarda **una** credencial sin pasarla por el chat. La corre el humano, no Claude.
`bash ~/.claude/hooks/kit/cargar-secreto.sh NOMBRE [--al-env]` · `powershell -File $env:USERPROFILE\.claude\hooks\kit\cargar-secreto.ps1 NOMBRE [-AlEnv]`
Pide el valor oculto y lo guarda en `~/.config/kit-secretos/<proyecto>.env` (fuera del repo). Con `--al-env`, en el `.env` de la raíz (solo dummy, de prueba o solo lectura). El `<proyecto>` sale del checkout principal. Salidas: 0 guardado · 1 no pudo escribir · 2 uso o valor inválido.

---

## G. Del repo madre (vibe-kit)

Esto vive en `.claude/scripts/` de **vibe-kit**, no se instala en los proyectos.

### kit-sync.sh
Compara o sincroniza `kit/` con `~/.claude/` (las cuatro skills, `agents/redteam-spec.md` y `VERSION`).
`bash .claude/scripts/kit-sync.sh` (compara; lo usa `/inicio`) · `bash .claude/scripts/kit-sync.sh sync` (copia `kit/` → `~/.claude/` y después compara; lo usa `/cierre`)
Imprime una línea `✓` o `✗` por ruta y termina con `kit ↔ ~/.claude: LIMPIO` (salida 0) o la diferencia (salida 1). Ignora y conserva la línea "Carpeta de proyectos de esta máquina" del Arquitecto, que es de cada PC.
