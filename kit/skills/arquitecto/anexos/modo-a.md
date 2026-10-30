# Modo A — proyecto nuevo

Entrevista → `SPEC-0.md` sellado → montaje del sistema → una línea para abrir. Las reglas de oro del `SKILL.md` valen enteras. **El montaje sigue siendo el molde v2 de `templates/`** (el molde v3 y `docs/modulos/v1/` llegan con el instanciador del orden 6; D4-6). `<arq>` = `node "$HOME/.claude/skills/arquitecto/scripts/arquitecto.cjs"` (anda igual en Bash y en PowerShell).

## Paso 0 — ¿Retomamos algo?

Si el ruteo ya resolvió el retome, salteá este paso. Si no: `Glob` de `<carpeta de proyectos>/*/SPEC-0.md` y mirá cuáles dicen `Estado: BORRADOR`. Si hay, preguntá con AskUserQuestion: *"¿Proyecto nuevo, o retomamos <nombre> donde quedó?"*; el `<nombre>` sale del H1 del propio SPEC-0 (`# SPEC-0: ...`), no de la carpeta, y con más de un borrador va una opción por cada uno. Si retoma: leé el borrador, resumile en 3 líneas dónde quedaron y seguí desde la primera sección `(pendiente)`.

## Paso 1 — Arranque

**Antes de la primera pregunta, el registro** (E §9): corré `<arq> registro "<carpeta de proyectos>"` y decí una línea: *"registro: <N> proyectos con ficha (<alias>, …): ¿esto es proyecto nuevo, módulo de otro o feature de otro?"*. Si el pedido ya dice que es nuevo, la línea lo da por nuevo y seguís. Si es módulo o feature de otro, no es Modo A: decile que abra el chat en esa carpeta (Modo B corre ahí). Si el registro falla o la carpeta sigue con el placeholder, una línea y seguís.

Dos preguntas, no más:
1. **Qué es**: nombre, una línea de qué hace y para quién, y **¿lleva código?** → `estandar` (con código) o `liviano` (sin código: documentos, relevamientos, estudio). Si ya te lo dijo al invocarte, no re-preguntes.
2. **Dónde vive** (no se pregunta; **montás donde corre**, H §14): si la carpeta donde corre la sesión **está vacía**, ahí mismo, nunca una subcarpeta. Si no, `<carpeta de proyectos>/<nombre>`, creada **por ruta absoluta**. Él no tiene que saber de rutas.

Ahí creás `SPEC-0.md` con el esqueleto de `formato-spec.md`: todas las secciones `(pendiente)` y `- Estado: BORRADOR`.

## Paso 2 — Entrevista (el corazón)

Seguí `banco-de-preguntas.md`: etapas Oportunidad → Solución → Riesgo, ~30% problema / ~70% diseño, con su lógica de saltos (sin login no hay preguntas de roles, etc.). En `liviano`, sin las preguntas de stack.

- **Si la invocación nombró un HANDOFF de relevamiento** (ej. `usá el handoff de _relevamientos/<slug>/HANDOFF.md`): **leelo**, regenerándolo antes si los hashes de sus fuentes no coinciden. **Honrá lo contestado** (O1-O5 enteras, el criterio de éxito, la línea base, el apetito y lo descartado) y **arrancá en S1**. Decile en 5 líneas qué NO le vas a preguntar y por qué. Lo que el handoff no contesta se pregunta igual: la Etapa 2 queda intacta, con multi-tenant ⚠️ e i18n ⚠️ SIEMPRE explícitas.
- **Persistí cada tanda al borrador** antes de la siguiente pregunta (regla de oro 3).
- **Fast-path**: "dale con los defaults" / "confío en vos" → confirmá SOLO las dos ⚠️ (multi-tenant, i18n) y el tipo de app; todo lo demás va a Supuestos.
- **Investigación en paralelo**: con tipo de app y dominio claros (2-3 respuestas), lanzá 1-2 subagentes de investigación en background (`run_in_background`): estado actual de las librerías del carril (los [VERIFICAR] de la matriz) y apps parecidas. Si el background no avanza, corré la investigación entre rondas; nunca frenes la charla más de una ronda por esto.

## Paso 3 — Concerns (el dolor #1 de Guido)

Con el dominio claro, recorré `concerns.md` con AskUserQuestion multiSelect (default: ON los que apliquen al tipo de app). Las dos ⚠️ **SIEMPRE se preguntan explícitas y por separado**, con su consecuencia en criollo:
- **Multi-tenant**: "¿esto lo van a usar varias empresas/clientes separados algún día? Cambiarlo después es rehacer media app."
- **i18n**: "¿va a existir en más de un idioma alguna vez? Agregarlo tarde es carísimo."

Persistí el resultado al borrador.

## Paso 4 — Diseño y EL GATE (Plan Mode)

1. Llamá **EnterPlanMode**. Hasta la aprobación: solo lectura y conversación (el sistema lo fuerza: es el gate real, no una promesa).
2. Con la matriz y la investigación, presentá **2-3 enfoques** con pros y contras en criollo y uno "(Recomendado)" (elige como un presupuesto, no como un examen). En `liviano` los enfoques son de cómo se organiza el trabajo, no de stack.
3. Armá el plano: el SPEC-0 según `formato-spec.md` (con **"Ejecución"** y **"Entorno de prueba"**) y el plan de montaje. La Ejecución dice `módulo solo`: el molde v2 no trae `worktree.cjs` ni director; si el plan pide carriles en paralelo, va a Supuestos y lo arma un Modo B cuando el proyecto tenga ficha.
4. **Red team condicional**: si toca plata, permisos/multi-usuario o datos de terceros, lanzá `redteam-spec` con el borrador ANTES de presentar. Lo que sobrevive va **al plano que presentás** (en Plan Mode no se escribe: al archivo, recién en el Paso 5).
5. Llamá **ExitPlanMode** con el plan: el SPEC-0 resumido (qué se construye, nivel, stack, concerns, qué queda afuera) y qué va a montar el Paso 5. **Su aprobación es la puerta.** Si pide cambios, volvés al punto 2 o 3 sin salir del modo.
6. **⚠️ Si venís de un relevamiento** (la invocación nombró un `HANDOFF.md`): **NO montes todavía.** Devolvé el plano al dossier (`_relevamientos/<slug>/`), devolvele el control a `/relevamiento` para que escriba la **Etapa 4, la Propuesta de Valor**, y **frená ahí**. La propuesta va a una reunión con la gente que lo va a usar **antes** de que exista un repo; montar acá es la inversión exacta del principio del método. El Paso 5 corre en una pasada posterior, con la propuesta aprobada.

## Paso 5 — Montaje (solo con el plan aprobado)

**⚠️ Guarda:** si venís de un relevamiento, el montaje corre **solo con la propuesta aprobada**: `4-propuesta.md` con su Parte 2 llena, o un OK explícito de Guido. Si no, volvé al punto 6 del Paso 4.

En orden, mostrando qué hacés:

1. **SPEC-0 final, sellado y READY**: completá `SPEC-0.md` (cero `(pendiente)`, con "Ejecución" y "Entorno de prueba") y dejalo en `BORRADOR`. Corré `<arq> sello "<ruta absoluta>/SPEC-0.md"` con timeout 600000 (`comando-test` puede pasar los 2 min). Si niega, arreglá lo que dice y volvé a correrlo. El SPEC-0 va con el tope de 30 KB (sin tope de criterios), aunque su Ejecución diga `módulo solo`. **Tope pasado**: proponé dónde cortar (las secciones que imprime, de mayor a menor) y Guido decide con un clic; si sigue entero, `--no-partir "Guido"`. Con el sello, `<arq> ready "<ruta>/SPEC-0.md"` (el OK fue el de ExitPlanMode; si el final agregó algo que el plan no tenía, mostráselo y pedí el OK antes). La sesión constructora solo ejecuta specs READY.
2. **Scaffolding oficial** del carril elegido (comando exacto en `matriz-stacks.md`), dentro de la carpeta. En `liviano`, no hay.
3. **git init** + `.gitignore`: EDITÁ el que generó el scaffolding (trae las reglas del stack): agregale `settings.local.json` y `launch.json`, y verificá que NO aparezca `.claude/` (regla §2.6). Sin uno, crealo con las reglas del stack más esas dos.
4. **Sistema del playbook** desde `templates/` (instanciá: reemplazá los `{{...}}` con lo de la entrevista):
   - `CLAUDE.md` (de `CLAUDE.template.md`, pre-llenado: qué es, stack, comandos, restricciones, concerns como reglas)
   - `docs/`: SESSION_HANDOFF + TODO (con las primeras tareas del SPEC-0) + CHANGELOG
   - `.claude/skills/inicio/` y `.claude/skills/cierre/` (instanciadas)
   - `.claude/hooks/` + `.claude/settings.json` (SessionStart, y check-code con los lenguajes del stack; en `liviano`, sin check-code)
   - `/smoke` y `/deploy` NO se montan (regla de 3+): los contratos quedan en los templates para cuando el ritual exista.
   - **Cero `{{` en lo instanciado**: reemplazá TODOS los `{{...}}` de settings.json, CLAUDE.md, inicio y cierre; si un slot no aplica (ej. no hay comando de salud), borrá la línea entera.
   - En `check-code.js` activá solo los lenguajes del stack; con TypeScript, `tsc --noEmit` chequea el proyecto entero en cada edición: solo si el proyecto es chico.
5. **Siembra de `docs-fyd/` (CON PREGUNTA; solo `estandar`)**: antes del commit, una AskUserQuestion: *"¿este proyecto lleva los dos sistemas —el de trabajo del método + el de documentación de auditoría `docs-fyd`— o solo el mío (solo el del método)?"*. **"Los dos"** es (Recomendado) si el proyecto es para un cliente o va a producción (el caso FyD).
   - **"Los dos" + `/docs-fyd` instalado** (`~/.claude/skills/docs-fyd/`): invocá `/docs-fyd` UNA vez para sembrar `docs-fyd/`. **Pre-cargá `_CAMPOS-NEGOCIO.md` desde el SPEC-0** (función / quiénes / criticidad salen de la entrevista; el 4º, proceso manual alternativo, si la entrevista lo capturó, o `[completar]`). Agregá la **fila-puntero** de `docs-fyd/` al "Mapa de documentación" del CLAUDE.md (donde el punto 4 resolvió `{{OTROS_DOCS}}`), ej.: `| docs-fyd/ | Doc técnica de auditoría FyD (regenerable) | /docs-fyd la genera; /cierre la marca vieja |`. **Registrás y disparás, no duplicás el motor**: el molde vive en la skill global.
   - **"Solo el mío"**: no sembrás nada.
   - **"Los dos" sin `/docs-fyd` instalado**: un stub en el handoff o el CLAUDE.md (*"falta instalar /docs-fyd (Equipador) y correrlo acá"*) y **no rompas el montaje**.
   - **CERO `{{` en el CLAUDE.md**, sea cual sea la respuesta (incluido `{{OTROS_DOCS}}`): resuelto o borrado.
6. **Primer commit** y `git status`: las skills y settings quedaron **trackeadas** (y `docs-fyd/` si se sembró: que NO cayó en `.gitignore`).
7. **Checklist final visible**: la tabla de lo montado (✅ por ítem, con evidencia: archivo existe / SHA del commit).

## Paso 6 — Handoff (y te apagás)

Cerrá con EXACTAMENTE esto, listo para copiar (la línea es la de "Ejecución" del SPEC-0):

> **El proyecto quedó montado y en régimen.** Para construirlo:
> 1. Abrí un chat nuevo de Claude Code en `<ruta absoluta de la carpeta>`
> 2. Pegá: `inicio — ejecutá el SPEC-0 (SPEC-0.md, está READY)`
>
> La sesión nueva arranca con el sistema puesto (el hook le inyecta el contexto), construye por el spec y cierra con `cierre`. Vos aprobás y verificás, como siempre.

Antes de apagarte, 5 segundos: si el stack tiene skills del menú universal que NO están en esta máquina (ej. `shadcn` o `supabase` para un Next.js; mirá `~/.claude/skills/`), avisale: *"Para este stack te convienen las skills X e Y: corré `/arquitecto-skills` y te las instala del menú."* Y si dijo "los dos" en el Paso 5 pero `/docs-fyd` no estaba: *"corré `/arquitecto-skills` para instalar docs-fyd y después `/docs-fyd` acá."* Solo avisás; instalar es del Equipador.

No sigas trabajando después del handoff.

## Si algo sale mal

- **Plan Mode no disponible** (no existen EnterPlanMode/ExitPlanMode): el gate pasa a manual. NO escribas NADA más que el borrador hasta un OK explícito al plano presentado en texto, con AskUserQuestion ("¿Aprobás el plano? / Cambiar algo / Cancelar").
- **El scaffolding falla** (el comando no existe, la versión cambió): investigá el comando actual con un agente, anotá la corrección en `matriz-stacks.md` como `[ACTUALIZADO <fecha>]` y seguí.
- **Guido abandona a mitad de la entrevista**: no pasa nada; el `SPEC-0.md` quedó en BORRADOR con lo respondido y la próxima invocación lo detecta (Paso 0).
- **`sello` o `ready` niegan algo que no podés arreglar sin Guido**: decile la línea del script tal cual y preguntá; nunca escribas la línea del sello ni el READY a mano.
