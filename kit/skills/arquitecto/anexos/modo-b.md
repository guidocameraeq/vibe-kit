# Modo B — feature más que chica sobre una app que YA anda

Explora el código real → spec delta sellado → **termina armando** → una línea para abrir. Las reglas de oro del `SKILL.md` valen enteras (una pregunta por vez, borrador en disco, YAGNI, el que piensa no construye). `<arq>` = `node "$HOME/.claude/skills/arquitecto/scripts/arquitecto.cjs"` (anda igual en Bash y en PowerShell).

## B0 — Dónde, con ficha o sin ficha, corto o largo

- **Corre EN la carpeta del proyecto.** Si te invocaron desde otro lado ("quiero agregarle X a tal app"), pedile que abra el chat ahí: la exploración y el spec viven ahí. No explores proyectos por rutas remotas ni diseñes a ciegas.
- **¿Hay ficha?** = existe `.claude/kit.md` en la raíz del checkout (`git rev-parse --show-toplevel`). Es la misma pregunta que se hacen `sello` y `ready`.
  - **Con ficha**: el módulo vive en `docs/modulos/<x>/`: `README.md` (la ficha, con el esqueleto de `formato-spec.md`, en `Estado: EN OBRA`) y `SPEC.md` (el delta, en `- Estado: BORRADOR`). `<x>`: minúsculas, números y guiones simples (`^[a-z0-9]+(-[a-z0-9]+)*$`), ≤ 20, nunca `--`, único en el repo. Si es un tramo de una iniciativa abierta, `parte-de: <iniciativa>`; si no, módulo suelto (lo decidís vos).
    **Nacer** (sin `docs/modulos/<x>/` en la rama por defecto) **parado en otra rama** que no es la por defecto (`git symbolic-ref --short refs/remotes/origin/HEAD`; sin remoto, `main` o `master`): **no armás**. Una línea, *"el módulo nace en la rama por defecto: abrí una sesión ahí"*, y te apagás (lo resuelve `integrar`, orden 5; D4-2).
    **Retomar** un módulo que ya nació (su `README.md` en la rama por defecto y `rama: modulo/<x>` en su ficha) va **en `modulo/<x>`**, en su worktree: `node .claude/scripts/worktree.cjs donde <x>`; si dice `entrar:`, `EnterWorktree` a esa ruta. Ahí corrés con el rol director (el director no está vivo mientras diseñás: cerró, o se mudó con relevo); el spec y el prototipo se commitean por rutas ahí y se pushea esa rama.
  - **Sin ficha** (los proyectos v2): como siempre, `docs/SPEC-<x>.md` (creá `docs/` si no existe), sin carpeta de módulo y sin worktree; la regla de "otra rama" no aplica.
- **Retome**: un `docs/SPEC-*.md` o `docs/modulos/*/SPEC.md` en BORRADOR que eligió retomar. Si "Contexto del código" está completo, seguí desde la primera sección `(pendiente)` (salteás B1); si está vacío o el código cambió desde su fecha (`git log`), B1 primero. Es retome de Modo B, nunca de A. Un `SPEC.md` en BORRADOR y sin sello (`/inicio` lo lista como `borrador a medias`) es un retome, no un Modo B corto: el largo sigue con las preguntas que faltaban, no las improvisa. Solo el módulo que **nació sin sello** (sin `SPEC.md`, o con uno que no está en BORRADOR; te llama `/inicio`) se toma en Modo B corto con lo que tiene.
- **Corto o largo**: **corto** si el pedido trae un plan ya charlado (con el dueño o con el director); **largo** si no.

## B1 — `NORTE.md`, después la exploración

1. **`docs/NORTE.md` antes del explorador** (H §17). Con ficha, si falta, armalo desde el README, el `CLAUDE.md` y el código (la sección de lo que solo sabe el dueño, vacía) y mostralo **dentro de la misma aprobación del spec**, sin preguntas aparte. Sin ficha y sin `NORTE.md`: leé el README y el `CLAUDE.md` en su lugar; no lo creás.
2. **Exploración**, ANTES de opinar: hasta 3 subagentes read-only en paralelo, UNA ronda: **estructura y stack** (árbol, frameworks, cómo se corre, testea y deploya) · **modelo de datos** (migraciones/schema: las tablas como se llaman DE VERDAD) · **sistema y convenciones** (`CLAUDE.md`, `docs/`, DECISIONS/REJECTED si hay, skills del proyecto, últimos commits). Proyecto chico: explorá vos directo.
3. Resumí al borrador, en "Contexto del código", **con `archivo:línea`**; antes de citar la línea de una función, leela entera. Lo que ya está DECIDIDO en DECISIONS/REJECTED del proyecto no se re-propone.

## B2 — Pantalla → prototipo, antes del spec

Si la feature es de pantalla (H §13; cualquier cosa que el usuario va a ver: una pantalla, una página, un formulario) **lleva prototipo siempre, antes del `SPEC.md`**: también en Modo B corto, con "dale con los defaults" (saltea las preguntas, no el prototipo) y aunque parezca chica. Es un **prototipo HTML estático** hecho por un subagente Sonnet, en `docs/modulos/<x>/prototipo/` (sin ficha: `docs/prototipo-<x>/`), que se abre en el navegador (nada depende de la app de escritorio), **con una pregunta escrita** ("¿esta pantalla te alcanza para decidir X?"). Lo aprueba el dueño o la usuaria final; **el spec se escribe desde lo aprobado** y lo cita. Reemplaza las preguntas de pantalla. Es descartable: nunca pasa a producción. Si nadie puede aprobarlo en el momento (de noche, por ejemplo), igual se arma y el OK del spec lo incluye.

## B3 — Corto o largo

- **Corto** (E §2.1): **sin entrevista**; el plan es la entrada. Hacés solo lo que el plan no trae (y el prototipo de B2, si hay pantalla): explorar, el NO SE TOCA, los chequeos, director sí/no y "Ejecución". "¿Cómo lo resuelven otros?" es opcional.
- **Largo**: entrevista corta, anclada al código:
  - ¿Qué tiene que pasar que hoy no pasa? (el resultado, no la implementación) · ¿Quién lo usa? ¿Cambia algo para los usuarios actuales?
  - **Las consecuencias que VOS ves en el código real**: *"tu tabla X ya tiene tal campo: ¿esto lo reemplaza o conviven?"*, *"esto toca los permisos que ya andan"*. Es tu valor acá.
  - Concerns SOLO del delta: ¿toca permisos? ¿datos que él creó (tabla "esto cambio / esto preservo")? ¿plata? ¿puede romper algo que hoy anda?
  - **"¿Cómo lo resuelven otros?"** (P1.3): un investigador Sonnet en background, tope ~15 búsquedas, que deja la sección **"Qué robar y qué no"** en el spec antes de las decisiones.
  - Fast-path igual que en A: "dale con los defaults" → todo a Supuestos, salvo el prototipo de pantalla (B2).
  - Si hay enfoques para elegir: **EnterPlanMode**, 2-3 con pros y contras y uno "(Recomendado)", **ExitPlanMode** aprueba el enfoque. Saliste de Plan Mode antes de escribir el spec.

## B4 — El spec delta

Formato delta de `formato-spec.md`. Lo propio de acá:
- **"Pedido original, textual"**, primera sección: el pedido tal cual llegó. Si no quedó registrado (un retome, un módulo que nació en `/cierre` sin él), *"(no quedó registrado: <por qué>)"*. **Nunca lo inventás ni lo parafraseás.**
- **AGREGA / MODIFICA / NO SE TOCA**: NO SE TOCA es obligatoria y explícita (el seguro de no romper lo que anda y el criterio #1 del smoke).
- **Director, solo si** el plan tiene **dos o más tareas que se escriben a la vez** (carriles paralelos sobre archivos distintos) o el dueño pide **noche sin él** (H §6), **y la ficha del proyecto dice `piezas.director-obrero: sí` (o `molde`)**: la ficha, no que exista el archivo (un `/director` propio del proyecto no conoce `encargo.cjs`). Si no lo dice, `módulo solo` y una línea: *"el director no está prendido en este proyecto: se trae al adoptarlo (`--director kit`, la A de D1 en `flota.md`)"*; en un repo ya adoptado con la pieza en `propia`, la línea es `node "$HOME/.claude/skills/arquitecto-skills/scripts/actualizar.cjs" resolver . director-obrero nueva --kit <clon del kit> --por "<por qué>"` (la corre el dueño en su carpeta, con un clon del kit en la versión de la ficha, como en `flota.md`; trae la del kit sin informe y dice los commits): decilo así y no lo armes a mano. Varias sesiones seguidas no lo hacen director. "Quiero director igual" o "bajá" del dueño mandan, y quedan en la ficha. La primera línea de "Ejecución" y la ficha dicen lo mismo (`sello` lo mira): `módulo solo` ↔ `director: no`, sin `rama:`; `módulo con director` ↔ `director: sí` y `rama: modulo/<x>`. **Sin ficha, siempre `módulo solo`.**
- **Con director, "¿lista o cola?"** (una pregunta al dueño): **lista** = las tareas del spec, y termina cuando están; **cola** = va tomando pedidos con una regla, y dice cuándo termina. Va a la ficha: `- Plan: lista` o `- Plan: cola — <la regla> · termina: <cuándo>`. Las tareas de la ficha, agrupadas por tramo (`### Tramo 1`, `### Tramo 2`…): es lo que lee `/estado`. La sesión del director se llama `director-<x>`: decilo al armar.
- **"Antes de lanzar: lo del dueño"** (con director): la lista del spec con cada cambio de freno y cada paso que solo puede dar el dueño (`formato-spec.md`). El director no reparte un encargo que dependa de uno de esos hasta que esté hecho; si la lista está vacía, decí "nada".
- **"Ejecución"** y **"Entorno de prueba"**. Con ficha, corré `<arq> entorno`: si da rojo, montar el entorno es **la tarea 0** del spec; si eso solo es más que chico, es su propio módulo y va antes. Si el rojo es solo "real sin dummy ni prueba" (el proyecto tiene la base real y ninguna de prueba), en un **módulo con director** la tarea 0 se escribe como primer renglón de `## Entorno de prueba`: `- **Tarea 0**: montar la base de prueba` (o `- Tarea 0: …`), y el `sello` la acepta con `entorno — (tarea 0: montar el entorno de prueba)` si el `kit:` de la ficha es ≥ `3.0.0-rc.2` (si no, "poné al día el proyecto"). Es el encargo `00`: monta la base y suma su entorno (`dummy` o `prueba`) a la ficha en `modulo/<x>`; hasta entonces, `autorizado` frena todo otro encargo. En un módulo solo la tarea 0 no vale: la base de prueba es un módulo previo.
- **Tope** (`<arq> tope <spec>`): módulo solo ≤ 10 KB y ≤ 8 criterios; con director ≤ 30 KB. Si se pasa, proponé dónde cortar (las secciones, de mayor a menor): lo que sobra es un módulo **hermano** (mismo `parte-de:`), nunca hijo. El dueño decide con un clic.
- **Red team**: si toca plata, permisos o datos de terceros, `redteam-spec` sobre el spec antes del sello; lo que sobrevive, adentro.

## B5 — Termina armando (H §8.2)

1. **`<arq> sello <spec>`** (desde la raíz; `sello` **en segundo plano** (`run_in_background`) y esperá su aviso: corre el `comando-test` con su `plazo-test` (hasta 60 min) y espera el turno de la PC si otra corrida pesada lo tiene, así que puede pasar los 10 min de una llamada; `worktree.cjs crear`, con timeout 600000). Si niega, arreglá lo que dice y volvé a correrlo. Tope pasado y el dueño eligió seguir entero: `--no-partir "el dueño"`.
2. **El OK del dueño** sobre el spec sellado (y el `NORTE.md`, si lo armaste): AskUserQuestion "¿Aprobás el spec? / Cambiar algo / Cancelar". Si cambia algo, editás y **`sello` de nuevo** (el hash cambió).
3. **`<arq> ready <spec>`**.
4. **Con ficha**, en este orden:
   1. **Un commit en la rama por defecto**, solo con lo del módulo: `git add -- docs/modulos/<x>` (y `docs/NORTE.md` si lo armaste) y `git commit -m "módulo <x>: ficha y spec sellado" -- <esas mismas rutas>`. **Nunca `git add -A` ni `commit -a`**: lo que el dueño tenga en stage queda como estaba. Si el pre-commit frena, se arregla lo que dice; nunca `--no-verify`.
   2. **Push si hay remoto** (`git remote`), con las reglas del paso de push del `/cierre` del proyecto: si origin avanzó, `git pull --rebase`, nunca un merge sobre la rama por defecto; nunca `--force` ni `--no-verify`.
   3. **Con director**: chequeá la ficha **y** el script: `piezas.director-obrero: sí` (o `molde`) en `.claude/kit.md` y `.claude/scripts/worktree.cjs` en el disco. Con los dos, `node .claude/scripts/worktree.cjs crear <x>` desde la raíz (timeout 600000): crea la rama `modulo/<x>` y `.claude/worktrees/modulo--<x>` con su `.kit-rol`, y al final imprime la apertura, con `primer mensaje: /director <x>`. **Con director, el worktree puede armarse con el spec todavía en BORRADOR** (el diseño corre bajo el director: lo quiere así el dueño): el commit con la ficha y el borrador, `crear`, y los pasos 1 a 3 los hace una sesión de Arquitecto en `modulo/<x>` (B0, retomar); `presentar --spec` frena el reparto sin READY. Si niega, decí su línea tal cual (dice qué hacer) y preguntá. **Si falta alguno**, una línea: *"este proyecto todavía no tiene el director (`piezas.director-obrero` en la ficha o `worktree.cjs`): la rama y el worktree del módulo quedan para cuando llegue"*, y **no armás el worktree a mano** (ni `git worktree add` ni `claude -w`).
5. **Sin ficha**: **sin commit, sin push y sin worktree**. El spec queda READY en `docs/SPEC-<x>.md` para el `/cierre` del proyecto, y lo que el dueño tenga en stage, intacto.
6. ¿El proyecto no tiene su sistema (no existe `.claude/skills/inicio/`)? Ofrecé adoptarlo primero (el kit v3, con `adoptar`: "adoptá <proyecto>", `flota.md`) como paso aparte, con su propio OK.

## B6 — La línea (y te apagás)

Listo para copiar; es la de "Ejecución":

> **Feature diseñada, sellada y armada.** Para construirla: *(con director y el spec todavía en BORRADOR, la primera línea es **"Feature diseñada y armada; el sello lo hace la sesión del director"**: nunca "sellada" sin sello)*
> - **Módulo solo**: abrí un chat NUEVO en `<ruta absoluta del proyecto>` (en VS Code, una pestaña de Claude nueva ahí; sesión `sesion-<x>`) y pegá `inicio — ejecutá docs/modulos/<x>/SPEC.md (está READY)`.
> - **Con director**: lo que imprimió `worktree.cjs`: en tu ventana de siempre, una sesión nueva de Claude con Opus (sesión `director-<x>`) y el primer mensaje, `/director <x>` (entra sola al worktree); o en otra ventana, `code "<ruta del worktree>"` con el mismo primer mensaje. La línea de terminal la da solo si hay `claude`: con `claude` en el PATH, `cd "<ruta>"; claude --name director-<x> --model opus`; si no, con el de la extensión de VS Code, la de Git Bash (`cd "<ruta>" && "<ese binario>" --name director-<x> --model opus`).
> - **Sin ficha**: abrí un chat NUEVO en `<ruta>` y pegá `inicio — ejecutá el spec docs/SPEC-<x>.md (está READY)`.
>
> El que piensa no construye. Verificá que lo de NO SE TOCA sigue andando (el criterio #1: con `/smoke` si el proyecto lo tiene, `piezas.smoke` en la ficha; si no, a mano) y cerrá con `cierre`.

Implementado, el spec no se archiva: su Estado pasa a `COMPLETO <fecha>` (`formato-spec.md`).

## Si algo sale mal

- **Plan Mode no disponible**: los enfoques van en texto y el OK, con AskUserQuestion; no escribís nada más que el borrador hasta el OK.
- **Te invocaron fuera de la carpeta del proyecto**: pedile abrir el chat ahí. No explores por rutas remotas.
- **La exploración vuelve pobre** (repo raro, sin docs): decilo honesto, seguí con lo que hay, y lo no verificado va a Supuestos con `[SIN CONTRASTAR]`.
- **`sello`, `ready` o `worktree.cjs` niegan algo que no podés arreglar sin el dueño**: su línea tal cual y una pregunta; nunca sellás, marcás READY ni armás el worktree a mano.
