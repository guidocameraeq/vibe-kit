# Modo B — feature más que chica sobre una app que YA anda

Explora el código real → spec delta sellado → **termina armando** → una línea para abrir. Las reglas de oro del `SKILL.md` valen enteras (una pregunta por vez, borrador en disco, YAGNI, el que piensa no construye). `<arq>` = `node "$HOME/.claude/skills/arquitecto/scripts/arquitecto.cjs"` (anda igual en Bash y en PowerShell).

## B0 — Dónde, con ficha o sin ficha, corto o largo

- **Corre EN la carpeta del proyecto.** Si te invocaron desde otro lado ("quiero agregarle X a tal app"), pedile que abra el chat ahí: la exploración y el spec viven ahí. No explores proyectos por rutas remotas ni diseñes a ciegas.
- **¿Hay ficha?** = existe `.claude/kit.md` en la raíz del checkout (`git rev-parse --show-toplevel`). Es la misma pregunta que se hacen `sello` y `ready`.
  - **Con ficha**: el módulo vive en `docs/modulos/<x>/`: `README.md` (la ficha, con el esqueleto de `formato-spec.md`, en `Estado: EN OBRA`) y `SPEC.md` (el delta, en `- Estado: BORRADOR`). `<x>`: minúsculas, números y guiones simples (`^[a-z0-9]+(-[a-z0-9]+)*$`), ≤ 20, nunca `--`, único en el repo. Si es un tramo de una iniciativa abierta, `parte-de: <iniciativa>`; si no, módulo suelto (lo decidís vos).
    **Parado en otra rama** que no es la por defecto (`git symbolic-ref --short refs/remotes/origin/HEAD`; sin remoto, `main` o `master`): **no armás**. Una línea, *"el módulo nace en la rama por defecto: abrí una sesión ahí"*, y te apagás (lo resuelve `integrar`, orden 5; D4-2).
  - **Sin ficha** (los proyectos v2): como siempre, `docs/SPEC-<x>.md` (creá `docs/` si no existe), sin carpeta de módulo y sin worktree; la regla de "otra rama" no aplica.
- **Retome**: un `docs/SPEC-*.md` o `docs/modulos/*/SPEC.md` en BORRADOR que eligió retomar. Si "Contexto del código" está completo, seguí desde la primera sección `(pendiente)` (salteás B1); si está vacío o el código cambió desde su fecha (`git log`), B1 primero. Es retome de Modo B, nunca de A. Un `SPEC.md` en BORRADOR y sin sello (`/inicio` lo lista como `borrador a medias`) es un retome, no un Modo B corto: el largo sigue con las preguntas que faltaban, no las improvisa. Solo el módulo que **nació sin sello** (sin `SPEC.md`, o con uno que no está en BORRADOR; te llama `/inicio`) se toma en Modo B corto con lo que tiene.
- **Corto o largo**: **corto** si el pedido trae un plan ya charlado (con Guido o con el director); **largo** si no.

## B1 — `NORTE.md`, después la exploración

1. **`docs/NORTE.md` antes del explorador** (H §17). Con ficha, si falta, armalo desde el README, el `CLAUDE.md` y el código (la sección de lo que solo sabe el dueño, vacía) y mostralo **dentro de la misma aprobación del spec**, sin preguntas aparte. Sin ficha y sin `NORTE.md`: leé el README y el `CLAUDE.md` en su lugar; no lo creás.
2. **Exploración**, ANTES de opinar: hasta 3 subagentes read-only en paralelo, UNA ronda: **estructura y stack** (árbol, frameworks, cómo se corre, testea y deploya) · **modelo de datos** (migraciones/schema: las tablas como se llaman DE VERDAD) · **sistema y convenciones** (`CLAUDE.md`, `docs/`, DECISIONS/REJECTED si hay, skills del proyecto, últimos commits). Proyecto chico: explorá vos directo.
3. Resumí al borrador, en "Contexto del código", **con `archivo:línea`**. Lo que ya está DECIDIDO en DECISIONS/REJECTED del proyecto no se re-propone.

## B2 — Pantalla → prototipo, antes del spec

Si la feature es de pantalla (H §13): un **prototipo HTML estático** hecho por un subagente Sonnet, en `docs/modulos/<x>/prototipo/` (sin ficha: `docs/prototipo-<x>/`), que se abre en el navegador (nada depende de la app de escritorio), **con una pregunta escrita** ("¿esta pantalla te alcanza para decidir X?"). Lo aprueba Guido o la usuaria final; **el spec se escribe desde lo aprobado** y lo cita. Reemplaza las preguntas de pantalla. Es descartable: nunca pasa a producción.

## B3 — Corto o largo

- **Corto** (E §2.1): **sin entrevista**; el plan es la entrada. Hacés solo lo que el plan no trae: explorar, el NO SE TOCA, los chequeos, director sí/no y "Ejecución". "¿Cómo lo resuelven otros?" es opcional.
- **Largo**: entrevista corta, anclada al código:
  - ¿Qué tiene que pasar que hoy no pasa? (el resultado, no la implementación) · ¿Quién lo usa? ¿Cambia algo para los usuarios actuales?
  - **Las consecuencias que VOS ves en el código real**: *"tu tabla X ya tiene tal campo: ¿esto lo reemplaza o conviven?"*, *"esto toca los permisos que ya andan"*. Es tu valor acá.
  - Concerns SOLO del delta: ¿toca permisos? ¿datos que él creó (tabla "esto cambio / esto preservo")? ¿plata? ¿puede romper algo que hoy anda?
  - **"¿Cómo lo resuelven otros?"** (P1.3): un investigador Sonnet en background, tope ~15 búsquedas, que deja la sección **"Qué robar y qué no"** en el spec antes de las decisiones.
  - Fast-path igual que en A: "dale con los defaults" → todo a Supuestos.
  - Si hay enfoques para elegir: **EnterPlanMode**, 2-3 con pros y contras y uno "(Recomendado)", **ExitPlanMode** aprueba el enfoque. Saliste de Plan Mode antes de escribir el spec.

## B4 — El spec delta

Formato delta de `formato-spec.md`. Lo propio de acá:
- **"Pedido original, textual"**, primera sección: el pedido tal cual llegó. Si no quedó registrado (un retome, un módulo que nació en `/cierre` sin él), *"(no quedó registrado: <por qué>)"*. **Nunca lo inventás ni lo parafraseás.**
- **AGREGA / MODIFICA / NO SE TOCA**: NO SE TOCA es obligatoria y explícita (el seguro de no romper lo que anda y el criterio #1 del smoke).
- **Director, solo si** el plan tiene **dos o más tareas que se escriben a la vez** (carriles paralelos sobre archivos distintos) o Guido pide **noche sin él** (H §6). Varias sesiones seguidas no lo hacen director. "Quiero director igual" o "bajá" de Guido mandan, y quedan en la ficha. La primera línea de "Ejecución" y la ficha dicen lo mismo (`sello` lo mira): `módulo solo` ↔ `director: no`, sin `rama:`; `módulo con director` ↔ `director: sí` y `rama: modulo/<x>`. **Sin ficha, siempre `módulo solo`.**
- **"Ejecución"** y **"Entorno de prueba"**. Con ficha, corré `<arq> entorno`: si da rojo, montar el entorno es **la tarea 0** del spec; si eso solo es más que chico, es su propio módulo y va antes.
- **Tope** (`<arq> tope <spec>`): módulo solo ≤ 10 KB y ≤ 8 criterios; con director ≤ 30 KB. Si se pasa, proponé dónde cortar (las secciones, de mayor a menor): lo que sobra es un módulo **hermano** (mismo `parte-de:`), nunca hijo. Guido decide con un clic.
- **Red team**: si toca plata, permisos o datos de terceros, `redteam-spec` sobre el spec antes del sello; lo que sobrevive, adentro.

## B5 — Termina armando (H §8.2)

1. **`<arq> sello <spec>`** (desde la raíz; corré `sello` y `worktree.cjs crear` con timeout 600000: `comando-test` y el setup pueden pasar los 2 min). Si niega, arreglá lo que dice y volvé a correrlo. Tope pasado y Guido eligió seguir entero: `--no-partir "Guido"`.
2. **El OK de Guido** sobre el spec sellado (y el `NORTE.md`, si lo armaste): AskUserQuestion "¿Aprobás el spec? / Cambiar algo / Cancelar". Si cambia algo, editás y **`sello` de nuevo** (el hash cambió).
3. **`<arq> ready <spec>`**.
4. **Con ficha**, en este orden:
   1. **Un commit en la rama por defecto**, solo con lo del módulo: `git add -- docs/modulos/<x>` (y `docs/NORTE.md` si lo armaste) y `git commit -m "módulo <x>: ficha y spec sellado" -- <esas mismas rutas>`. **Nunca `git add -A` ni `commit -a`**: lo que Guido tenga en stage queda como estaba. Si el pre-commit frena, se arregla lo que dice; nunca `--no-verify`.
   2. **Push si hay remoto** (`git remote`), con las reglas del paso de push del `/cierre` del proyecto: si origin avanzó, `git pull --rebase`, nunca un merge sobre la rama por defecto; nunca `--force` ni `--no-verify`.
   3. **Con director**: `node .claude/scripts/worktree.cjs crear <x>` desde la raíz (timeout 600000). Crea la rama `modulo/<x>` y `.claude/worktrees/modulo--<x>` con su `.kit-rol`, y al final imprime la apertura. Si niega, decí su línea tal cual (dice qué hacer) y preguntá. **Si no existe `.claude/scripts/worktree.cjs`**, una línea: *"este proyecto todavía no tiene `worktree.cjs`: la rama y el worktree del módulo quedan para cuando llegue"*, y **no armás el worktree a mano** (ni `git worktree add` ni `claude -w`).
5. **Sin ficha**: **sin commit, sin push y sin worktree**. El spec queda READY en `docs/SPEC-<x>.md` para el `/cierre` del proyecto, y lo que Guido tenga en stage, intacto.
6. ¿El proyecto no tiene su sistema (no existe `.claude/skills/inicio/`)? Ofrecé montarlo primero (§2.9 del playbook, los templates de esta skill) como paso aparte, con su propio OK.

## B6 — La línea (y te apagás)

Listo para copiar; es la de "Ejecución":

> **Feature diseñada, sellada y armada.** Para construirla:
> - **Módulo solo**: abrí un chat NUEVO en `<ruta absoluta del proyecto>` (en VS Code, una pestaña de Claude nueva ahí; sesión `sesion-<x>`) y pegá `inicio — ejecutá docs/modulos/<x>/SPEC.md (está READY)`.
> - **Con director**: lo que imprimió `worktree.cjs`: `code "<ruta del worktree>"`, y en esa ventana la pestaña de Claude con Opus (sesión `director-<x>`); adentro, `inicio — ejecutá docs/modulos/<x>/SPEC.md (está READY)`. La línea de terminal (`cd "<ruta>"; claude --name director-<x> --model opus`) la da solo si `claude` está en el PATH.
> - **Sin ficha**: abrí un chat NUEVO en `<ruta>` y pegá `inicio — ejecutá el spec docs/SPEC-<x>.md (está READY)`.
>
> El que piensa no construye. Verificá con `/smoke` (el criterio #1: lo de NO SE TOCA sigue andando) y cerrá con `cierre`.

Implementado, el spec no se archiva: su Estado pasa a `COMPLETO <fecha>` (`formato-spec.md`).

## Si algo sale mal

- **Plan Mode no disponible**: los enfoques van en texto y el OK, con AskUserQuestion; no escribís nada más que el borrador hasta el OK.
- **Te invocaron fuera de la carpeta del proyecto**: pedile abrir el chat ahí. No explores por rutas remotas.
- **La exploración vuelve pobre** (repo raro, sin docs): decilo honesto, seguí con lo que hay, y lo no verificado va a Supuestos con `[SIN CONTRASTAR]`.
- **`sello`, `ready` o `worktree.cjs` niegan algo que no podés arreglar sin Guido**: su línea tal cual y una pregunta; nunca sellás, marcás READY ni armás el worktree a mano.
