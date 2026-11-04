# Modo A — proyecto nuevo

Entrevista → el SPEC-0 sellado → montaje del sistema → una línea para abrir. Las reglas de oro del `SKILL.md` valen enteras. **El SPEC-0 es el primer módulo**: vive en `docs/modulos/v1/SPEC.md`, con su ficha `docs/modulos/v1/README.md` (así `ready --pendientes`, `/inicio` y `/estado` lo ven como a cualquier módulo; D8b-8). **El montaje es el molde v3, con el adoptador** (`adoptar --nuevo`) sobre un clon, nunca a mano. `<arq>` = `node "$HOME/.claude/skills/arquitecto/scripts/arquitecto.cjs"` y `<act>` = `node "$HOME/.claude/skills/arquitecto-skills/scripts/actualizar.cjs"` (andan igual en Bash y en PowerShell).

## Paso 0 — ¿Retomamos algo?

Si el ruteo ya resolvió el retome, salteá este paso. Si no: `Glob` de `<carpeta de proyectos>/*/docs/modulos/v1/SPEC.md` y también de `<carpeta de proyectos>/*/SPEC-0.md` (los de antes del molde v3), y mirá cuáles dicen `Estado: BORRADOR`. Si hay, preguntá con AskUserQuestion: *"¿Proyecto nuevo, o retomamos <nombre> donde quedó?"*; el `<nombre>` sale del H1 del propio SPEC-0 (`# SPEC-0: ...`), no de la carpeta, y con más de un borrador va una opción por cada uno. Si retoma: leé el borrador, resumile en 3 líneas dónde quedaron y seguí desde la primera sección `(pendiente)`.

## Paso 1 — Arranque

**Antes de la primera pregunta, el registro** (E §9): corré `<arq> registro "<carpeta de proyectos>"` y decí una línea: *"registro: <N> proyectos con ficha (<alias>, …): ¿esto es proyecto nuevo, módulo de otro o feature de otro?"*. Si el pedido ya dice que es nuevo, la línea lo da por nuevo y seguís. Si es módulo o feature de otro, no es Modo A: decile que abra el chat en esa carpeta (Modo B corre ahí). Si el registro falla o la carpeta sigue con el placeholder, una línea y seguís.

Dos preguntas, no más:
1. **Qué es**: nombre, una línea de qué hace y para quién, y **¿lleva código?** → `estandar` (con código) o `liviano` (sin código: documentos, relevamientos, estudio). Si ya te lo dijo al invocarte, no re-preguntes.
2. **Dónde vive** (no se pregunta; **montás donde corre**, H §14): si la carpeta donde corre la sesión **está vacía**, ahí mismo, nunca una subcarpeta. Si no, `<carpeta de proyectos>/<nombre>`, creada **por ruta absoluta**. Él no tiene que saber de rutas.

Ahí creás `docs/modulos/v1/SPEC.md` con el esqueleto del SPEC-0 de `formato-spec.md` (H1 `# SPEC-0: <nombre>`): todas las secciones `(pendiente)` y `- Estado: BORRADOR`.

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
3. Armá el plano: el SPEC-0 según `formato-spec.md` (con **"Ejecución"** y **"Entorno de prueba"**) y el plan de montaje. La Ejecución dice `módulo solo`, salvo que el plan pida carriles en paralelo: entonces `módulo con director` (el molde v3 trae el director; la ficha de v1 lo dice igual, `director: sí` y `rama: modulo/v1`).
4. **Red team condicional**: si toca plata, permisos/multi-usuario o datos de terceros, lanzá `redteam-spec` con el borrador ANTES de presentar. Lo que sobrevive va **al plano que presentás** (en Plan Mode no se escribe: al archivo, recién en el Paso 5).
5. Llamá **ExitPlanMode** con el plan: el SPEC-0 resumido (qué se construye, nivel, stack, concerns, qué queda afuera) y qué va a montar el Paso 5. **Su aprobación es la puerta.** Si pide cambios, volvés al punto 2 o 3 sin salir del modo.
6. **⚠️ Si venís de un relevamiento** (la invocación nombró un `HANDOFF.md`): **NO montes todavía.** Devolvé el plano al dossier (`_relevamientos/<slug>/`), devolvele el control a `/relevamiento` para que escriba la **Etapa 4, la Propuesta de Valor**, y **frená ahí**. La propuesta va a una reunión con la gente que lo va a usar **antes** de que exista un repo; montar acá es la inversión exacta del principio del método. El Paso 5 corre en una pasada posterior, con la propuesta aprobada.

## Paso 5 — Montaje (solo con el plan aprobado)

**⚠️ Guarda:** si venís de un relevamiento, el montaje corre **solo con la propuesta aprobada**: `4-propuesta.md` con su Parte 2 llena, o un OK explícito de Guido. Si no, volvé al punto 6 del Paso 4.

En orden, mostrando qué hacés. `<carpeta>` = la del proyecto, por ruta absoluta; **nunca lleva `.kit-rol`** (lo lleva solo el clon). Los temporales (`<tmp>`), fuera de `<carpeta>`.

1. **El SPEC-0 final, en `BORRADOR`**: completá `docs/modulos/v1/SPEC.md` (cero `(pendiente)`, con "Ejecución" y "Entorno de prueba"). El sello va en el punto 7, con la ficha del kit ya puesta.
2. **Scaffolding oficial** del carril elegido (comando exacto en `matriz-stacks.md`), dentro de la carpeta. En `liviano`, no hay.
3. **git init, `.gitignore`, la ficha de v1 y el primer commit**: `git init -b main`; EDITÁ el `.gitignore` que generó el scaffolding (trae las reglas del stack): agregale `settings.local.json` y `launch.json`, y verificá que NO aparezca `.claude/` (regla §2.6); sin uno, crealo con las reglas del stack más esas dos. La ficha `docs/modulos/v1/README.md` con el esqueleto de `formato-spec.md` (`- Estado: EN OBRA`, `- director: no` salvo que la Ejecución diga `módulo con director`). Después `git add -A` y `git commit -m "v1: scaffolding y el SPEC-0 en borrador"`.
4. **El kit, a un temporal** (como el Equipador): `git clone --quiet https://github.com/guidocameraeq/vibe-kit "<tmp>/kit"` (completo, con tags; nunca `--depth 1`) y `git -C "<tmp>/kit" checkout --quiet "v<la de ~/.claude/VERSION>"`. Si no está ese tag, una línea y frenás: es del Equipador.
5. **El molde v3, con el adoptador sobre un clon** (dentro del mismo OK de ExitPlanMode; cero preguntas nuevas):
   - `git clone --quiet "<carpeta>" "<tmp>/<nombre>"` (`<clon>`: **con el mismo nombre de carpeta** que el proyecto, porque de ahí sale `vars.proyecto` de la ficha); en el clon, `.kit-rol` con `actualizador` y `.kit-rol` en `<clon>/.git/info/exclude`.
   - `<act> adoptar "<clon>" --kit "<tmp>/kit" --mirar --nuevo --principal "<carpeta>" --nivel <liviano|estandar> --comando-test "<comando>" --propuesta "<tmp>/propuesta.md"` (el nivel, el del Paso 1; `<comando>`, el chequeo base de "Entorno de prueba" del SPEC-0, siempre: sin él, un repo sin `scripts.test` —un Vite o un Next recién nacidos— no tiene `vars.comando-test` y el `sello` del punto 7 se niega con el montaje a medias). **En `liviano`** ("no aplica: sin código"), sin `--comando-test`: antes del `--aplicar`, en `frenos.quitados` de la propuesta, `- {id: gate:entorno-prueba, por: "liviano: sin código, se revisa <lo que dice el SPEC-0>", hasta: siempre}` (en la propuesta, no después: con el candado prendido, después es un cambio con aprobado). Ese freno no es de fábrica: la línea `después:` lo dice en rojo y es de Guido aprobarlo; decíselo tal cual.
   - `<act> adoptar "<clon>" --kit "<tmp>/kit" --aplicar "<tmp>/propuesta.md" --principal "<carpeta>"`: valida tu carpeta y no la toca (los githooks se prenden en el punto 6, con `--traer`); una línea `traer · … ⚠`: decísela a Guido tal cual.
   - Parado en `<clon>`, los **dos** commits que imprime (piezas, ficha), tal cual, y la línea `después:` (`barreras --rango`) en verde.
6. **Traerlo a la carpeta**: `<act> adoptar "<clon>" --traer "<carpeta>"` (trae del clon con `merge --ff-only` y **después** prende los githooks: la línea `githooks · <carpeta> · puesto`; otra cosa que `puesto` o `ya estaba`, o una línea que dice qué correr: decísela a Guido tal cual). Borrá `<tmp>` (el clon, el kit y la propuesta).
7. **Sello y READY** (con la ficha puesta, el sello chequea el entorno): `<arq> sello "<carpeta>/docs/modulos/v1/SPEC.md"` con timeout 600000 (`comando-test` puede pasar los 2 min). Si niega, arreglá lo que dice y volvé a correrlo. El SPEC-0 va con el tope de 30 KB (sin tope de criterios), aunque su Ejecución diga `módulo solo`. **Tope pasado**: proponé dónde cortar (las secciones que imprime, de mayor a menor) y Guido decide con un clic; si sigue entero, `--no-partir "Guido"`. Con el sello, `<arq> ready "<carpeta>/docs/modulos/v1/SPEC.md"` (el OK fue el de ExitPlanMode; si el final agregó algo que el plan no tenía, mostráselo y pedí el OK antes). Antes del commit, **los docs con lo de la entrevista**: `docs/NORTE.md` (qué es, para qué, quiénes, qué no hace), `docs/TODO.md` (las primeras tareas del SPEC-0), `docs/MAPA.md`, el renglón del día de `docs/CHANGELOG.md` y el `CLAUDE.md` (stack, comandos, restricciones y concerns como reglas, en su zona propia): **cero `[completar` y cero `{{`** en `CLAUDE.md` y `docs/` (salvo el handoff, que va en el punto 10); un slot que no aplica (ej. `MAPA.md` sin módulos todavía), resuelto o con su línea borrada. Un commit: `git add -A` y `git commit -m "v1: el SPEC-0 sellado y READY, y los docs"` (ya pasa por el pre-commit del kit).
8. **Portada**, dentro del mismo OK y sin preguntar nada: `node .claude/scripts/portada.cjs armar`, y `piezas.portada: sí` en la ficha **solo si** `armar` salió 0 o `node .claude/scripts/portada.cjs chequear` da 0; si no (un README propio que `armar` no pisa), la portada queda apagada y al dueño una línea: "portada: README propio, queda apagada". El README lo arma el script, no vos. Un commit.
9. **Siembra de `docs-fyd/` (CON PREGUNTA; solo `estandar`)**: una AskUserQuestion: *"¿este proyecto lleva los dos sistemas —el de trabajo del método + el de documentación de auditoría `docs-fyd`— o solo el mío (solo el del método)?"*. **"Los dos"** es (Recomendado) si el proyecto es para un cliente o va a producción (el caso FyD).
   - **"Los dos" + `/docs-fyd` instalado** (`~/.claude/skills/docs-fyd/`): invocá `/docs-fyd` UNA vez para sembrar `docs-fyd/`, `piezas.docs-fyd: sí` en la ficha. **Pre-cargá `_CAMPOS-NEGOCIO.md` desde el SPEC-0** (función / quiénes / criticidad salen de la entrevista; el 4º, proceso manual alternativo, si la entrevista lo capturó, o `[completar]`). Sumá `docs-fyd/` al "Mapa de documentación" del `CLAUDE.md` (una línea: doc técnica de auditoría FyD, regenerable; `/docs-fyd` la genera). **Registrás y disparás, no duplicás el motor**: el molde vive en la skill global. Un commit.
   - **"Solo el mío"**: no sembrás nada.
   - **"Los dos" sin `/docs-fyd` instalado**: un stub en el handoff (*"falta instalar /docs-fyd (Equipador) y correrlo acá"*) y **no rompas el montaje**.
10. **El handoff, el último** (`candado:estado-viejo` pide que `## Próximo paso` cambie en el mismo tramo que el último código: la portada y `docs-fyd/` cuentan): `docs/SESSION_HANDOFF.md` entero, cero `[completar`, con `## Próximo paso` = la línea del Paso 6. Un commit: `git add -A` y `git commit -m "v1: el handoff"`.
11. **Checklist final visible**: la tabla de lo montado (✅ por ítem, con evidencia): la ficha `.claude/kit.md` con `kit:` = la de `~/.claude/VERSION`; `node .claude/scripts/estructura.cjs todo` → 0 (si frena, su renglón queda en `.claude/frenos.log`: arreglá lo que dice y commiteá los dos); `<arq> ready --pendientes` → nada; `git config core.hooksPath` → `.githooks`; `git status` limpio; cero `{{` y cero `[completar` (los del punto 7 y el handoff); el SHA de cada commit.

## Paso 6 — Handoff (y te apagás)

Cerrá con EXACTAMENTE esto, listo para copiar (la línea es la de "Ejecución" del SPEC-0):

> **El proyecto quedó montado y en régimen.** Para construirlo:
> 1. Abrí un chat nuevo de Claude Code en `<ruta absoluta de la carpeta>`
> 2. Pegá: `inicio — ejecutá docs/modulos/v1/SPEC.md (está READY)`
>
> La sesión nueva arranca con el sistema puesto (el hook le inyecta el contexto), construye por el spec y cierra con `cierre`. Vos aprobás y verificás, como siempre.

Antes de apagarte, 5 segundos: si el stack tiene skills del menú universal que NO están en esta máquina (ej. `shadcn` o `supabase` para un Next.js; mirá `~/.claude/skills/`), avisale: *"Para este stack te convienen las skills X e Y: corré `/arquitecto-skills` y te las instala del menú."* Y si dijo "los dos" en el Paso 5 pero `/docs-fyd` no estaba: *"corré `/arquitecto-skills` para instalar docs-fyd y después `/docs-fyd` acá."* Solo avisás; instalar es del Equipador.

No sigas trabajando después del handoff.

## Si algo sale mal

- **Plan Mode no disponible** (no existen EnterPlanMode/ExitPlanMode): el gate pasa a manual. NO escribas NADA más que el borrador hasta un OK explícito al plano presentado en texto, con AskUserQuestion ("¿Aprobás el plano? / Cambiar algo / Cancelar").
- **El scaffolding falla** (el comando no existe, la versión cambió): investigá el comando actual con un agente, anotá la corrección en `matriz-stacks.md` como `[ACTUALIZADO <fecha>]` y seguí.
- **Guido abandona a mitad de la entrevista**: no pasa nada; el SPEC-0 (`docs/modulos/v1/SPEC.md`) quedó en BORRADOR con lo respondido y la próxima invocación lo detecta (Paso 0).
- **`sello` o `ready` niegan algo que no podés arreglar sin Guido**: decile la línea del script tal cual y preguntá; nunca escribas la línea del sello ni el READY a mano.
