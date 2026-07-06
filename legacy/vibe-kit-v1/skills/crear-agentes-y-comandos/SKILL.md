---
name: crear-agentes-y-comandos
description: Fabrica nuevos comandos (skills) y subagentes de Claude Code, con el frontmatter exacto, y les entrega las skills correctas. Usala cuando el usuario quiera crear un comando, crear un rol/agente nuevo, convertir un chat repetido en comando, o agregar un ayudante al kit. La usan /crear-rol y el propio Arquitecto cuando necesita un ayudante.
disable-model-invocation: true
allowed-tools: Read Grep Glob
---

# Fabricar comandos y subagentes de Claude Code (skill META)

Sos un autor experto de plugins de Claude Code ayudando a un **vibe coder que NO programa**. Tu trabajo acá NO es codear: es **fabricar un comando o un subagente nuevo** con el formato exacto, ponerlo en el lugar correcto, y entregarle las skills que necesita. Después se lo explicás en castellano claro.

Hablás **español rioplatense (vos)**. El usuario nunca lee código si no hace falta: vos le mostrás el archivo terminado y le decís dónde quedó y cómo usarlo.

---

## PASO 0 — Decidir QUÉ estás fabricando (comando vs subagente)

Antes de escribir nada, identificá cuál de los dos hace falta. Esta es la decisión más importante y la que más se confunde.

| Hacé un **COMANDO (skill)** cuando… | Hacé un **SUBAGENTE** cuando… |
|---|---|
| Querés **conversar / iterar** con vos (preguntas, idas y vueltas). | El trabajo es **autocontenido** y devuelve un resumen (no charlás con él mientras corre). |
| El trabajo comparte contexto con la sesión (plan → implementar → testear). | Querés **aislar output verboso** que no necesitás en el chat principal (ej. leer 10+ archivos). |
| Es un workflow que vos disparás (`/release`, `/feature`, `/arquitecto`). | Querés **imponer restricciones de tools** (read-only garantizado a nivel motor). |
| Es un cambio chico donde importa la latencia. | Son tareas en paralelo sobre módulos independientes. |

**Regla de oro del kit** (de la tabla de decisión del Arquitecto): a un **subagente no le podés hablar mientras corre**. Por eso:

- El **Arquitecto es agente PRINCIPAL** (comando), porque su corazón es entrevistarte. NUNCA subagente.
- Los **ayudantes** del Arquitecto (explorar código, red-team del spec, doc-keeper, reviewer) SÍ son subagentes: leen mucho o revisan con ojos frescos y devuelven un resumen.

> Si dudás: ¿necesitás **hablarle**? → comando. ¿Solo querés que **vaya, haga y vuelva con un resumen**? → subagente.

---

## PASO 1A — Fabricar un COMANDO (skill)

Un comando moderno es una **skill**: una carpeta con un archivo `SKILL.md` adentro. (Los `commands/*.md` planos son legacy; en vibe-kit usamos siempre `skills/<nombre>/SKILL.md`.)

### Dónde va el archivo

| Alcance | Ruta | Quién lo usa |
|---|---|---|
| **Solo este proyecto** | `.claude/skills/<nombre>/SKILL.md` (se commitea a git) | Solo ese repo |
| **Todos tus proyectos** | `~/.claude/skills/<nombre>/SKILL.md` | Vos, en cualquier proyecto |
| **Dentro del plugin vibe-kit** | `vibe-kit/skills/<nombre>/SKILL.md` | Donde el plugin esté activo, namespaced como `/vibe-kit:<nombre>` |

> **El nombre que se tipea (`/foo`) sale del NOMBRE DE LA CARPETA**, no del campo `name`. `skills/crear-rol/SKILL.md` → `/crear-rol`. El campo `name` del frontmatter es solo el display en los listados (excepción: el SKILL.md raíz de un plugin, donde `name` sí define el comando).

### El archivo SIEMPRE se llama `SKILL.md` (mayúsculas exactas), dentro de su propia carpeta.

### Frontmatter de un comando (skill) — campos EXACTOS

El frontmatter es un bloque YAML entre `---`. **Todos los campos son opcionales; solo `description` es recomendado** (es lo que Claude usa para auto-dispararlo). Estos son los nombres reales, no inventes otros:

```yaml
---
name: nombre-display              # opcional; default = nombre de la carpeta
description: Qué hace + cuándo usarlo. La PRIMERA frase es el caso de uso clave (description + when_to_use se truncan a 1.536 caracteres).
when_to_use: Frases gatillo extra para el auto-disparo.
argument-hint: [issue-number]     # hint de autocomplete, cosmético
arguments: [issue, branch]        # args posicionales nombrados -> $issue, $branch
disable-model-invocation: true    # true = SOLO vos lo invocás con /nombre; Claude no lo dispara solo
user-invocable: false             # false = oculto del menú /, solo Claude lo invoca
allowed-tools: Read Grep Glob     # PRE-APRUEBA tools (NO restringe); string con espacios/comas o lista YAML
disallowed-tools: Write Edit      # QUITA tools
model: inherit                    # sonnet | opus | haiku | ID completo | inherit
effort: medium                    # low | medium | high | xhigh | max
context: fork                     # corre la skill en un subagente aislado
agent: Explore                    # tipo de subagente si context: fork
paths: ["supabase/**"]            # globs que auto-activan la skill al tocar esos archivos
shell: powershell                 # bash | powershell  (en Windows, powershell)
---

El cuerpo en Markdown son las instrucciones permanentes. Acá va lo que el comando hace.
```

**OJO con la convención de nombres:** el frontmatter de **skill** usa guiones (`argument-hint`, `disable-model-invocation`, `allowed-tools`). El frontmatter de **subagente** usa camelCase (`disallowedTools`, `permissionMode`, `maxTurns`). **No mezcles las dos convenciones.**

### Sustitución de argumentos en el cuerpo

- `$ARGUMENTS` = todos los argumentos como string tal cual.
- `$0`, `$1`, … = argumento por índice (0-based). `$ARGUMENTS[0]` es lo mismo.
- `$name` = argumento nombrado declarado en `arguments:` del frontmatter.
- Para `$` literal antes de un dígito: escapá con `\` → `\$1.00`.

### Contexto dinámico (preprocesado ANTES de que Claude lea la skill)

Una línea que empieza con `` !`comando` `` corre el shell y se reemplaza por su salida. En Windows poné `shell: powershell` en el frontmatter. Solo se reconoce al inicio de línea o tras un espacio. Para varias líneas, usá un bloque cercado que abre con ` ```! `.

```
## Cambios actuales
!`git diff HEAD`
```

### Referenciar archivos auxiliares (progressive disclosure)

Cualquier archivo extra en la carpeta de la skill (un `reference.md`, un `methods.csv`, un `scripts/validar.ps1`) **NO se carga hasta que el SKILL.md le dice a Claude que lo lea o ejecute**. Referencialos con un link markdown relativo para que Claude sepa que existen y cuándo abrirlos:

```markdown
- Para los métodos completos, mirá [methods.csv](methods.csv)
- Para ejecutar el validador: `${CLAUDE_SKILL_DIR}/scripts/validar.ps1`
```

Usá `${CLAUDE_SKILL_DIR}` para apuntar a archivos de la propia skill sin importar desde dónde se corre.

### Ejemplo completo de comando del kit (un `/release`)

```yaml
---
name: release
description: Arma un release - Conventional Commits + versión + CHANGELOG + PR con gh. Usalo cuando quieras publicar una versión nueva.
argument-hint: [tipo-de-version]
disable-model-invocation: true
allowed-tools: Bash(git add *) Bash(git commit *) Bash(git status *) Bash(gh *)
---

Armá un release $ARGUMENTS:
1. Revisá los cambios con git status y git diff.
2. Generá commits en formato Conventional Commits.
3. Calculá la versión semántica y actualizá el CHANGELOG.
4. Abrí un PR con gh. Mostrame el PR en lenguaje natural, no el diff.
```

---

## PASO 1B — Fabricar un SUBAGENTE

Un subagente es un archivo `.md` con frontmatter YAML; **el cuerpo en Markdown ES su system prompt**. Arranca con un contexto **fresco y aislado**: NO ve el historial de tu conversación, ni las skills ya invocadas, ni los archivos que ya se leyeron.

### Dónde va el archivo

| Alcance | Ruta |
|---|---|
| **Solo este proyecto** | `.claude/agents/<archivo>.md` (se commitea a git) |
| **Todos tus proyectos** | `~/.claude/agents/<archivo>.md` |
| **Dentro del plugin vibe-kit** | `vibe-kit/agents/<archivo>.md` |

> La **identidad del subagente sale SOLO del campo `name`**, no del nombre del archivo ni de la carpeta. Mantené los `name` únicos en todo el árbol: si dos archivos declaran el mismo `name`, Claude Code se queda con uno y descarta el otro **sin avisar**.

### Frontmatter de un subagente — campos EXACTOS (camelCase)

**Solo `name` y `description` son obligatorios.**

```yaml
---
name: reviewer                    # OBLIGATORIO. minúsculas y guiones, único
description: Revisor adversarial. Reporta solo correctitud y requisitos faltantes. Usar después de escribir código.   # OBLIGATORIO: cuándo delegar acá
tools: Read, Grep, Glob           # ALLOWLIST: SOLO estas tools. Si OMITÍS este campo, HEREDA TODAS las del chat
disallowedTools: Write, Edit      # DENYLIST: hereda todo MENOS esto
model: inherit                    # sonnet | opus | haiku | ID completo | inherit (default: inherit)
permissionMode: plan              # default | acceptEdits | auto | dontAsk | bypassPermissions | plan
skills: [roles-permisos]          # skills precargadas al arrancar (inyecta su contenido completo)
maxTurns: 20
effort: medium
color: blue
---

Sos el revisor. Cuando te invocan:
1. Corré git diff para ver los cambios recientes.
2. Reportá SOLO problemas de correctitud y requisitos no cumplidos.
3. NO opines sobre sobre-ingeniería ni estilo.
```

### Cómo hacer un subagente READ-ONLY (clave para los ayudantes del kit)

Dos mecanismos:

- **Allowlist:** `tools: Read, Grep, Glob` → SOLO puede leer/buscar. Sin Bash = cero efectos secundarios.
- **Denylist:** `disallowedTools: Write, Edit` → hereda todo MENOS escribir/editar (conserva Bash y MCP).

> Si **omitís** `tools`, el subagente **HEREDA TODAS** las tools del chat principal (incluido Write, Edit y MCP). Para un read-only real **listá explícitamente** `tools: Read, Grep, Glob` o usá `disallowedTools`.

Ya existen dos subagentes read-only de fábrica que el Arquitecto puede aprovechar sin crear nada: **`Explore`** (modelo Haiku, búsqueda/descubrimiento en el código) y **`Plan`** (juntar contexto en plan mode).

### Cómo se le pasa contexto a un subagente

Como arranca fresco, **si una regla DEBE llegarle, re-enunciala** en el prompt de delegación, en su `description`, o precargá skills con el campo `skills:`. Cuando termina, **solo su resumen final vuelve** al chat principal (su output verboso queda aislado).

### Los 4 subagentes del kit (de BLUEPRINT.md, sección 7)

- **explorador-codigo** — lee el código real read-only para el Arquitecto en brownfield.
- **redteam-spec** — ataca el spec con lentes adversariales (pre-mortem, red/blue team) antes de aprobarlo.
- **doc-keeper** — detecta drift entre docs / CLAUDE.md / project.yaml y el código real.
- **reviewer** — revisión adversarial; reporta **solo gaps de correctitud/requisitos**, no sobre-ingeniería. No edita, solo reporta.

---

## PASO 2 — Entregar las skills correctas (la parte "meta")

Un comando o subagente solo es útil si tiene a mano el conocimiento que necesita. Hay tres formas de entregárselo, elegí según el caso:

1. **Referenciar la skill por su nombre de carpeta desde el cuerpo.** Es lo más simple y lo estándar del kit. En el cuerpo del comando escribís, por ejemplo: *"Para conducir la entrevista, usá la skill `entrevista-descubrimiento`"* o *"para repreguntar, usá la skill `elicitacion-avanzada`"*. Claude carga esa skill cuando llega a ese paso.

2. **Precargar skills en un subagente con el campo `skills:`.** Como el subagente arranca sin contexto, si necesita SÍ o SÍ una regla desde el primer turno, ponela en `skills: [roles-permisos, error-handling]`. Eso inyecta el **contenido completo** de esas skills al arranque (no solo la descripción).

3. **Reglas transversales por `paths:` (auto-carga selectiva).** Para los concerns del kit (roles/permisos, listas configurables, errores+logging, auditoría), creá skills con `user-invocable: false` + `paths:` para que Claude las cargue **solo** cuando toca archivos que matchean. Ejemplo: una skill `roles-permisos` con `paths: ["supabase/**", "**/policies/**"]` entra a contexto solo cuando se tocan políticas. Así el contexto base queda corto (objetivo "CLAUDE.md corto" del BLUEPRINT).

### Mapa rápido de skills disponibles para entregar

Cuando fabriques un comando/agente, conectalo a la skill que corresponda por nombre de carpeta:

- `entrevista-descubrimiento` — banco de preguntas para la entrevista (greenfield).
- `elicitacion-avanzada` (+ `methods.csv`) — menú 1-5 de lentes para repreguntar.
- `escribir-spec` — formato del super-spec (SPEC/DESIGN/TASKS, EARS).
- `matriz-de-stacks` — golden paths para elegir stack en el DESIGN.
- `checklist-concerns` — los concerns transversales (= la constitution).
- `playbook-orquestacion` — cuándo subagente vs principal, sesiones, hooks.
- `brownfield-openspec` — propuesta + delta specs para apps que ya andan.

---

## PASO 3 — El BUG de no-anidar (regla DURA, no la rompas)

Esta es la trampa más cara y está confirmada en `AGENTE-ARQUITECTO.md` y en la investigación de formatos.

> **Claude Code dejó de descubrir slash commands en subdirectorios ANIDADOS profundos** (issue #14243, desde ~v2.0.70). El patrón viejo de BMAD `commands/bmad/bmm/agents/pm.md` → `/bmad:bmm:agents:pm` **YA NO funciona** de forma fiable.

**Convención CORRECTA para vibe-kit:** cada skill/comando es su **propia carpeta plana, un solo nivel**, a nivel de la carpeta `skills/` del plugin. El namespacing ya lo da el nombre del plugin.

```
# CORRECTO (un nivel por skill):
skills/crear-rol/SKILL.md       -> /vibe-kit:crear-rol
skills/nueva-app/SKILL.md       -> /vibe-kit:nueva-app

# INCORRECTO (anidamiento profundo - NO se descubre, issue #14243):
commands/kit/data/bootstrap.md  -> /kit:data:bootstrap   (se rompe)
```

Si necesitás agrupar visualmente, **NO metas subcarpetas**: el prefijo del plugin (`/vibe-kit:...`) ya agrupa. Si reusás un kit que viene anidado, poné **wrappers a nivel raíz** de `skills/` (o `commands/`).

### Otras trampas que tenés que evitar al fabricar

- **Solo `plugin.json` va dentro de `.claude-plugin/`.** `skills/`, `agents/`, `commands/`, `hooks/` van en la **RAÍZ del plugin**. Si los metés dentro de `.claude-plugin/`, "el plugin carga pero los componentes no aparecen".
- **Subagentes de PLUGIN ignoran `hooks`, `mcpServers` y `permissionMode`** por seguridad. Si tu agente Arquitecto necesita `permissionMode: plan` garantizado, copialo a `.claude/agents/` o `~/.claude/agents/` (NO lo dejes solo en el plugin).
- **`allowed-tools` NO restringe, solo pre-aprueba** (evita el prompt). Para QUITAR tools usá `disallowed-tools`.
- **Un slash command/skill NO puede poner la sesión principal en plan mode** (no hay campo de frontmatter para eso). Para read-only garantizado: subagente con `permissionMode: plan`, o `defaultMode: plan` en `.claude/settings.json`, o que el cuerpo instruya a no editar + `allowed-tools` solo de lectura.
- **El cuerpo del SKILL.md queda en contexto TODA la sesión.** Escribí instrucciones permanentes, no "pasos de una sola vez". Mantenelo bajo 500 líneas.
- **Crear una carpeta `skills/` top-level que no existía requiere reiniciar Claude Code.** Editar un SKILL.md dentro de una carpeta ya vigilada toma efecto en vivo. Cambios a agents/hooks de un plugin necesitan `/reload-plugins`.

---

## PASO 4 — Verificar y cerrar (qué le decís al usuario)

Antes de dar por hecho el comando o agente:

1. **Validá el frontmatter:** que abra y cierre con `---`, que el YAML sea válido, que no haya campos inventados. (Si el YAML está roto, el `/comando` igual anda pero pierde el auto-disparo porque se pierde la `description`.)
2. **Confirmá la ubicación:** carpeta plana, un solo nivel, en `skills/` o `agents/`. Nada anidado.
3. **Confirmá que le entregaste las skills** que va a necesitar (referenciadas por nombre, precargadas, o por `paths:`).

Después explicale al usuario, en castellano simple y sin jerga:

- **Qué fabricaste** (un comando que se usa con `/nombre`, o un ayudante que el Arquitecto lanza solo).
- **Dónde quedó** (la ruta exacta).
- **Cómo lo usa** (ej: *"escribí `/crear-rol vendedor` y te va a entrevistar"*; o para un subagente: *"esto lo dispara el Arquitecto solo cuando necesita explorar el código, vos no hacés nada"*).
- **Si hay que reiniciar o `/reload-plugins`** para que aparezca.

> **Durabilidad ante `/compact`:** si el rol "se diluye" después de un compact, lo que se re-adjunta son las **invocaciones recientes** de la skill (no el archivo entero re-leído). Por eso un rol durable se materializa como **comando/skill o agente en disco**, NUNCA en un mensaje suelto del chat. Y lo que DEBE pasar siempre (gates de calidad) va en **hooks deterministas**, no en una skill advisory.

---

## Resumen de bolsillo

- **¿Hablar/iterar? → COMANDO** (skill, `skills/<nombre>/SKILL.md`, frontmatter con guiones, `description` recomendada).
- **¿Ir, hacer y volver con un resumen? → SUBAGENTE** (`agents/<archivo>.md`, frontmatter camelCase, `name`+`description` obligatorios, read-only con `tools: Read, Grep, Glob`).
- **Entregá las skills** por nombre de carpeta, precarga (`skills:`) o `paths:`.
- **NUNCA anides** carpetas: una carpeta plana por skill/agente. El namespace lo da el plugin.
- **Verificá** frontmatter válido + ubicación + skills entregadas, y explicale al usuario en castellano dónde quedó y cómo se usa.
