# Qué ofrece hoy la plataforma

> **Misión 4, tramo 2 (a)** · 2026-10-14 · Qué de lo que Guido armó a mano en director/obrero ya es nativo
> de Claude Code, para no reinventarlo en el diseño. Describe; no decide. Entra al mapa del tramo 3
> (`TABLERO.md`). El plan: [`PLAN.md`](PLAN.md). La radiografía: [`RADIOGRAFIA-director-obrero.md`](RADIOGRAFIA-director-obrero.md).

**Cómo se hizo y cuánto costó.** El agente `claude-code-guide` leyó la doc oficial
(`code.claude.com/docs/en/…`) con 14 preguntas. Las 4 primeras son las que dejó la radiografía (§10).
Costó **~312 mil tokens: 3 veces lo estimado** (~100 mil). Después, el chat principal leyó por su
cuenta las dos páginas que más pesan en el diseño (la de mensajes entre sesiones y la de la vista de
agentes), y las dos confirmaron lo que dijo el agente.

**Marcas.**
- ✅ = verificado hoy por el chat principal, en la doc.
- 📄 = doc oficial según el agente (la página va entre paréntesis).
- 👁️ = visto en una sesión de la app de escritorio, **sin doc pública**: puede cambiar sin aviso.
- NO VERIFICADO = la doc no lo dice.

## 0. En una pantalla

| Lo armado a mano | Lo nativo hoy | ¿Alcanza? | Mejora |
|---|---|---|---|
| Abrir la pestaña del obrero con 3 renglones tipeados (`/rename`, `/model`, la skill) | CLI: `claude -n <nombre> --model <m> --effort <e> -w <worktree>`. En segundo plano: `claude --bg --name <n> --model <m> "<encargo>"` ✅ | **Casi.** En la app, el esfuerzo no se elige al abrir, sino después | #6 |
| Pedir aviso en cada mensaje (la causa del ruido, radiografía §3) | `SendMessage` con `notify_when_idle`: **un** aviso cuando la otra sesión termina su turno o se cierra ✅ | **Sí, en la misma PC.** El filtro "solo si hay novedad" no existe: se arma con un script | #2 |
| "¿Cómo vamos?" (~110 veces) | `claude agents --json`: el estado de cada sesión (trabajando, bloqueada, terminada, falló, parada) y qué espera ✅ | **Sí, en la misma PC.** No hay tablero que junte las 3 PCs | #7 |
| Mensajes entre PCs, con una sesión inalcanzable 5 días | `SendMessage` llega a una sesión de otra PC por Remote Control. Si esa PC está apagada, llega cuando vuelve ✅ | **Sí, con condiciones** (§4) | #10 |
| Reglas del implementador escritas en el encargo | La definición del subagente admite `model`, `effort`, `tools`, `disallowedTools`, `hooks` e `isolation` 📄 | **Sí** | #3, #5 |
| Barreras `deny` (apagadas en un proyecto) | `deny` frena **en todos los modos, también en bypass**, y se puede bloquear el bypass 📄 | **Sí** | #9 |

## 1. Abrir una sesión en un paso (mejora #6)

- **CLI** 📄 (cli-reference, agent-view): `claude -n "nombre" --model <alias|id> --effort <nivel> -w <nombre>`.
  `claude --bg` la manda directo a segundo plano con `--name` y `--model` ✅. Que `--effort` funcione
  junto con `--bg` no está documentado: **NO VERIFICADO**.
- **App de escritorio** 📄 (desktop): al abrir se elige el entorno, la carpeta, el modelo, el modo de
  permisos y el worktree. **El esfuerzo no está entre esas opciones** y se cambia después.
- 👁️ La app le da a una sesión la herramienta `start_session`, que abre otra con modelo, esfuerzo,
  carpeta y worktree, y le avisa a la que la abrió cuando la nueva termina su turno (`wake_when_done`).
  Es exactamente "el director abre al obrero", pero **no tiene doc pública**.
- **Esfuerzo por rol** 📄 (sub-agents, model-config): el campo `effort` en el frontmatter de una skill o
  de un subagente rige mientras está activo.

## 2. Avisos (mejora #2)

- ✅ **`notify_when_idle`** (cross-session-messaging):
  - es una suscripción a **un solo** aviso, para cuando la otra sesión queda quieta o se cierra;
  - no gasta tokens en la sesión vigilada;
  - si en 12 h no llega, se cancela y avisa;
  - **solo funciona entre sesiones de la misma PC**, y solo la puede pedir la conversación principal
    (no un subagente).
- 📄 Hooks (hooks): `Notification` (`agent_completed`, `agent_needs_input`, `idle_prompt`), `Stop`,
  `SubagentStop`, `TeammateIdle` y `TaskCompleted`. Un hook con `asyncRewake` corre en segundo plano y
  despierta a Claude si sale con código 2: ahí se puede escribir "avisá solo si hay novedad".
- 📄 `Monitor` corre un comando en segundo plano y le pasa a Claude cada línea que imprime. `/loop`,
  `CronCreate` y `ScheduleWakeup` sirven para revisar cada tanto, pero vencen a los 7 días.
- **Lo que no existe**: un aviso nativo de "solo si cambió algo". Hay que escribirlo.

## 3. El estado de las sesiones (mejora #7)

- ✅ `claude agents` (agent-view) es la vista de agentes. Es un **research preview**: la interfaz puede
  cambiar.
- ✅ `claude agents --json` es, según la doc, "la forma soportada de leer el estado desde afuera":
  - el estado: `working`, `blocked`, `done`, `failed` o `stopped`;
  - qué espera: un permiso, input, el sandbox…;
  - la carpeta y el nombre.
- ✅ Solo ve las sesiones de **esa** PC.
- 📄 La barra lateral de la app filtra por estado y proyecto. 👁️ La app también expone `list_sessions`
  y `get_session`.
- 📄 `/list-agents` (o `/peers`) muestra, desde una sesión, a quién le puede mandar mensajes.

## 4. Entre PCs (mejora #10)

Verificado en cross-session-messaging ✅:
- **Cómo viaja.** Un mensaje a otra PC pasa por los servidores de Anthropic y entra por el **Remote
  Control** de esa PC. Hace falta:
  - que **las dos** sesiones estén conectadas a Remote Control;
  - el login de claude.ai (con una API key no anda).

  Si la que manda no está en Remote Control, el mensaje sale **sin dirección de respuesta**.
- **Si la otra PC está apagada** (`offline`), el mensaje se encola y llega cuando reconecta.
- **Los permisos no viajan, por diseño.** Un mensaje "nunca cuenta como tu consentimiento": cada sesión
  aplica sus reglas y pide sus propios permisos. Lo que vio Guido en la mesa entre PCs no es una falla:
  es la regla.
- **Controles**:
  - `crossSessionInbound` (`accept`, `hold` o `refuse`) decide qué hace una sesión con los mensajes que
    le llegan;
  - `isolatePeerMachines: true` pide tu OK antes de que un mensaje salga de la PC.
- 🆕 **Una trampa de la app.** Si una sola de las dos sesiones está en modo bypass (y la otra no), por
  defecto el mensaje **queda retenido** para que lo apruebes. La app de escritorio no puede mostrar ese
  diálogo: retiene el mensaje 5 minutos y **lo tira**.

  Puede ser parte de por qué una sesión pareció "inalcanzable" (radiografía §3). **Hipótesis, NO
  VERIFICADO** en los chats.
- En Windows, los mensajes dentro de la misma PC piden Claude Code v2.1.234 o más nuevo.

## 5. El resto, en corto

| Tema | Qué hay | Ojo |
|---|---|---|
| **Equipos de agentes** 📄 | Líder + compañeros con lista de tareas y buzón compartidos | **Experimental y apagado por defecto.** En Windows no hay paneles divididos. Con la variable prendida, los subagentes con nombre se vuelven compañeros sin pedirlo. **No apoyar el diseño acá todavía** |
| **Worktrees** 📄 | `claude -w`, `isolation: worktree` en subagentes, `.worktreeinclude` para copiar el `.env` | Anda en Windows |
| **Workflows** 📄 | Scripts que orquestan hasta 16 subagentes a la vez (requieren opt-in) | Sirven para barridos grandes. **No cruzan sesiones ni PCs**: no reemplazan al director |
| **Memoria** 📄 | La memoria automática vive **en cada PC** y no se sincroniza | Por git viajan el `CLAUDE.md`, `.claude/rules/` y `.claude/agent-memory/` (de los subagentes con `memory: project`). Confirma la mejora #10: lecciones al repo |
| **Segundo plano y rutinas** 📄 | `claude --bg`, subagentes con `background: true`, rutinas en la nube (`/schedule`, cada 1 h como mínimo), tareas programadas en la PC | Las de la PC necesitan la PC prendida |
| **Frenos** 📄 | Orden: `deny`, después `ask`, después `allow`. Un hook PreToolUse puede bloquear. `disableBypassPermissionsMode`. Settings administrados que pisan todo | Para ver qué rige: `/status`, `/permissions`, `claude doctor` |
| **Plugins** 📄 | Empaquetan skills, agentes, hooks, comandos, MCP y workflows. Un repo git privado sirve de marketplace; `claude plugin update` | La actualización automática viene **apagada** en los privados, y cada PC instala por su cuenta. Ver §6.6 |
| **Esfuerzo** 📄 | Niveles: low, medium, high, xhigh, max. **Opus 5.5 viene en `medium`** (confirmado). Se fija con `--effort`, `/effort`, settings o el frontmatter de una skill o un agente | **Cambiarlo a mitad de sesión invalida la caché** |
| **Contexto y costo** 📄 | `/usage` (costo y caché), `/context`; la statusline trae costo, % de contexto y esfuerzo | La caché dura **1 h en la conversación principal y 5 min en subagentes**. Cambiar modelo, esfuerzo o MCP la invalida |
| **Hook de arranque** 📄 | Lo que inyecta tiene un **tope de 10.000 caracteres**. Si se pasa, la sesión ve una vista previa de 2.000 | Un proyecto lo vivió en carne propia; dos más se pasan hoy ([`FLOTA.md`](FLOTA.md) §3) |

## 6. Lo que cambia el diseño (para el tramo 3)

1. **Las mejoras #2, #6 y #7 pasan de "construir" a "adoptar".** Ya hay piezas nativas: abrir con
   modelo y worktree, un solo aviso al terminar, y el estado por `--json`. El diseño se apoya en ellas,
   con dos huecos:
   - el esfuerzo al abrir desde la app;
   - el "solo si hay novedad".
2. **Entre PCs, el canal oficial es Remote Control + `SendMessage`, con cola si la otra PC está
   apagada.** El "canal por archivo versionado" de la mejora #10 queda como respaldo, no como base. La
   regla de oro: **Remote Control prendido en todas las sesiones de la mesa**.
   *Reabierto por G (2026-10-24): el contenido de la mesa va siempre por git (un archivo por mensaje en el
   repo) y el aviso por `SendMessage` es opcional; Remote Control deja de ser requisito ([DISENO-G](DISENO-G-mesa-y-pcs.md) §4).*
3. **Los roles pasan a definiciones de subagente** con `model`, `effort`, `tools`, `hooks` y
   `isolation`. Así las reglas van dentro del agente que las tiene que cumplir (mejoras #3 y #5).
4. **El `deny` frena incluso en bypass.** El molde del kit tiene que traerlo, y `/inicio` puede
   chequear que esté (mejora #9).
5. **El costo de releer tiene reglas nuevas.** La caché de un subagente dura 5 minutos. Un director que
   cambia de modelo o de esfuerzo en caliente vuelve a pagar todo su contexto. Esto va a la política de
   modelos.
6. **Plugins: REJ-001 no se reabre por ahora, pero cambió el terreno.** Hoy un plugin puede llevar
   skills, agentes, hooks y workflows desde un repo privado, con `claude plugin update`. Es la opción a
   comparar en el tramo 4 para "el Arquitecto como agente único que mantiene la flota", contra el
   Equipador actual. Sigue en contra: cada PC instala por su cuenta y no se actualiza solo.
7. **No existe todavía**:
   - un tablero que junte las 3 PCs;
   - el aviso "solo si hay novedad";
   - la memoria compartida entre PCs;
   - doc pública de las herramientas de sesión de la app.

   Lo que se apoye en lo que no tiene doc (👁️) va marcado como inestable.
8. **Lo experimental** (equipos de agentes, la vista de agentes) se usa en un piloto, no en el molde.

## 7. Worktrees, verificado contra la doc oficial (nota de H, 2026-10-24)

Agente `claude-code-guide` sobre `code.claude.com/docs/en/{worktrees,cli-reference,hooks,tools-reference,commands,agent-view}.md`. Decide la
mecánica de ramas y worktrees de [DISENO-H](DISENO-H-niveles-y-puertas.md) §10. Citas en inglés, tal como las escribe la doc.

| Afirmación | Veredicto | Lo que dice la doc |
|---|---|---|
| `claude -w <nombre>` crea el worktree en `.claude/worktrees/<nombre>/` con la rama `worktree-<nombre>` | ✅ | "By default, the worktree is created under `.claude/worktrees/<name>/` at your repository root … on a new branch named `worktree-<name>`" (worktrees) |
| Se puede pasar una rama existente o el nombre de la rama | ❌ | `-w` toma solo un nombre (o `#<PR>`, URL de PR/MR → `pr-<n>`); "To start a worktree from a specific existing branch, create it with git directly" (`git worktree add …`) |
| La rama sale de la rama por defecto del remoto | ✅ | `worktree.baseRef`: `"fresh"` (default) "branch from the repository's default branch on the remote"; `"head"` desde el HEAD local; sin commits falla |
| Sin nombre, genera uno | ✅ | "If you omit the name, Claude generates one such as `bright-running-fox`" (que sea al azar: NO DOC) |
| Limpieza al salir | ✅ | Sin nombre y limpio: se borra solo. **Con nombre: pregunta** ("A named session prompts you first"). Con cambios: pregunta, y al conservar imprime `claude --worktree <name> --resume`. Con `-p`: no limpia y queda el lock |
| `.worktreeinclude` | ✅ | En la raíz, sintaxis `.gitignore`; "Only files that match a pattern and are also gitignored are copied"; vale para `--worktree`, subagentes y la app; **con hook `WorktreeCreate` no se procesa** |
| Subagente `isolation: worktree` | ✅ / NO DOC | Misma base que `--worktree`; se limpia solo sin cambios y el barrido periódico (`cleanupPeriodDays`) borra los viejos sin trabajo pendiente; **no carga el `CLAUDE.md` del worktree**; carpeta y nombre de rama: NO DOC |
| Hook al crear el worktree | ✅ con matiz | `WorktreeCreate` **reemplaza** la lógica git ("replaces that default git behavior"), debe imprimir la ruta; no hay post-create; no dispara con `git worktree add` por Bash |
| `SessionStart` distingue worktree; variable de entorno del worktree | ❌ / NO DOC | `SessionStart` no lo indica; `${CLAUDE_PROJECT_DIR}` "is the project root where the session started" y **no sigue al worktree**; el `cwd` del JSON de entrada sí |
| `-w` con `-p`, `--name`, `--bg` | ✅ / NO DOC | `-p --worktree` documentado (salta el trust check); `--name` implícito; `--bg` "moves the session into an isolated git worktree under `.claude/worktrees/`" por sí solo y **salta el aislamiento si ya está en uno**; `--bg` con `-p`: ❌ ("Can't be combined") |
| Windows | ✅ (poco) | Borrar un worktree respeta junctions y symlinks internos (≥ v2.1.205); no crea worktrees si `.claude`, `.claude/worktrees` o el destino son symlinks; las aprobaciones "don't ask again" se guardan en el worktree; sin resume en rutas de red |
| Reanudar vuelve al worktree | ✅ | "returns the session to that worktree" (interactivo, `--continue`, `--resume` con `-p`, SDK) si se lanza desde el checkout principal; si no existe, retoma en el directorio de lanzamiento |
| `/worktree`; `EnterWorktree` / `ExitWorktree` | NO DOC / ✅ | No hay comando `/worktree` (sí `/background`, `/cd`, `/stop`); las herramientas existen; una `path` fuera de `.claude/worktrees/` pide aprobación |

**Lo que se sigue de esto para el método** (H §10): los módulos no usan `-w` (no pueden ramificar desde `modulo/<x>` ni elegir nombre de rama);
el setup del entorno lo hace un script del kit, no un hook; el hook de arranque lee el `cwd` del JSON; `.claude/worktrees/` va al `.gitignore`;
`--bg` y `-p` no se combinan.
