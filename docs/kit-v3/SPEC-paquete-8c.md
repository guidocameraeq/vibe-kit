# SPEC delta: paquete 8c — la `rc.6`: el obrero de cierre de tramo y la vuelta 2 del uso real — vibe-kit
La `rc.6` junta tres cosas ya diseñadas: **el obrero de cierre de tramo** (el renglón 11 del repaso con Guido, diseñado en
[`SPEC-paquete-8b.md`](SPEC-paquete-8b.md) "(11)"), **la vuelta 2 de [`SPEC-paquete-8r4.md`](SPEC-paquete-8r4.md)** (u4-u8, u13, h5-h12,
que pasó red team con ese delta) y **lo de Pendientes "De D8r.1" y "De D8r.2"** del tracker. Lo nuevo de diseño es solo **h11** (a
`main` sube solo el director, decidido con Guido) y el cómo de **h12**.
- Estado: BORRADOR (D8c.1, 2026-11-04)
- Fecha: 2026-11-04 · Misión: 5, director **D8c.1** (lo lanzó la sesión madre de la recta final; la vara: ADR-030 y ADR-034; el
  presupuesto: ~2 h de reloj después del tag de la `rc.5` y ~6 encargos, pedido de Guido)
- **Nivel de la `rc`: MEDIO-ALTO** (`docs/CICLO-DE-MEJORA.md` §3.6, pedido de Guido, 2026-11-04). Cada cambio dice su nivel en la tabla
  de abajo; el red team de una ronda va **solo** sobre h11 y h12 (los dos que tocan un freno o el actualizador); la mutación, en esos dos.
  La flota, contra **un** clon de Hermes, rc.5 → rc.6 con `--con-obra`. Los tres repos de prueba no corren.
- **Fuera de alcance**: los experimentos de método (pasaron a la próxima versión: TODO, Misión 7).
- **Base**: el tag `v3.0.0-rc.5`. Ni código ni merge antes; los worktrees salen de ese tag.

## Por qué (el dolor)

- **Nadie documenta el tramo cuando trabaja un director.** El director escribe la ficha él mismo (`/director` paso 7) y no corre el
  `/cierre` (con varios directores se pisarían). Guido lo hace a mano en Hermes. Lo decidió en el repaso del 2026-11-03 (renglón 11): *el
  cierre de tramo lo hace un obrero de cierre, lanzado por el director, siempre*. Se corrió de la `rc.1` a la `rc.6` por presupuesto
  (D8b.1-c, D8r-11, D8r2-8, D8r3-8, D8r4-14).
- **Un obrero pusheó directo a `origin main`** en Hermes (con el clic de Guido: la confirmación de CC va por mensaje). Hoy nada lo frena:
  `git-seguro` solo mira el destino para force o borrar, y el pre-push no mira ni el destino ni el rol (medido abajo). Guido, 2026-11-04,
  por la madre: **a `main` sube solo el director (o `integrar`), nunca un obrero**.
- **Un repo con `hooks-lib` esperando una fusión queda ROTA** en cada versión cuyos hooks pidan la lib nueva, y el mensaje no dice qué
  hacer (la flota de D8r.3 en `alfa` y `beta`: rc.3 → rc.4 ROTA; la línea 7 lo atajó).
- El resto, el dolor que ya dice el delta de la `rc.5` (vuelta 2) y el tracker ("De D8r.1", "De D8r.2").

## Contexto (explorado el 2026-11-04 sobre la rama `d8r4/t` @ `df68661`, que es la `rc.5` sin taggear)

- **`/director`** (`kit/molde/skills/director/SKILL.md`): 7.973 B, a 27 B del tope de 8.000 (`skills.test.cjs:216-222`, `chequeo.cjs:46`).
  El paso 7 (`:19`) dice *"sobreescribí la ficha: tareas con su commit, próximo paso, Parado, Te espera y `## Sesiones vivas`"*. No hay
  `plantilla-cierre.md` en `director/` (solo `SKILL.md` y `plantilla-encargo.md`).
- **`lib/encargo.cjs` `leerEncargo`** (`:175-262`): `Skill: obrero` (`:131`), `Spec: <carpeta>/modulos/<x>/SPEC[-N].md:<línea>` (`:124`),
  `Modelo: … · Esfuerzo: … · Por qué: …` (`:134`), `Riesgo` (`:142`), `AUTORIZADO` no vacío (`:247`). Una plantilla de cierre pasa con esos campos.
- **La ficha del módulo** (`kit/skills/arquitecto/anexos/formato-spec.md:217-251`): cabecera `Estado`/`director`/`parte-de`/`rama`, **sin**
  `Próximo paso:`, `Tramo:` ni `Cierre de tramo:`. `inyeccion.cjs` `datosFichaModulo` (`:175-190`) busca `Próximo paso:` (`RE_PROXIMO_MOD`,
  `:170`) y no lee `Tramo:`; `bloqueModulos` (`:241-284`) lee de la `rama:` local con `git show` y **no cae a `origin/`** (la única caída a
  `origin/` es la de la ficha por pestaña del obrero, `:657`). `estado.cjs` `lineaModulo` (`:226-238`) no muestra tramo ni próximo.
- **h11, medido**: `git-seguro.cjs` `push()` (`:810-884`) frena force (salvo a `kit/*`), borrar la rama por defecto, `--prune`, `--mirror`
  y `git push .`; **`git push origin main`, `git push` a secas, `HEAD:main`, `x:refs/heads/main` y `--all` pasan en todo rol**. El
  pre-push (`kit-githook.cjs:785-806`, `refsQueSuben` `:712-722` con `refRemota`) mira remoto adelantado, gitleaks y el candado; el rol
  solo decide si pasa sin escáner (`ROLES_PASAN_SIN_ESCANER`, `:48`). El rol: `contexto.cjs rol()` (`:93-105`), `kit-githook rolEfectivo`
  (`:202`, el `.kit-noche` vuelve nocturno). **Quién sube a la rama por defecto en el kit**: `worktree integrar` (`:1111`, desde un
  temporal con `.kit-rol` = director), la flota (`flota.cjs:528`, rol actualizador), el `/cierre` del principal (humano). El director a mano
  solo pushea `modulo/<x>`; el obrero, `modulo/<x>--<ID>` ("nunca push a otra rama", `/obrero` `:24`).
- **h12, medido**: `hooks-lib` es un freno de `fusion.cjs` (`:142`). Una pieza que espera queda como estaba (`actualizar.cjs:444-449`),
  **y las `hook-*` se actualizan igual**: no hay acople entre los hooks y su lib. La línea 7 (`chequeo.cjs casos()`, `:580-645`) copia el
  molde nuevo con los hooks del proyecto (y su `lib/` vieja) y corre las pruebas nuevas: falla con *"el hook <dueño> pierde un caso"*
  (`:635-638`), sin nombrar `hooks-lib`. La flota arma ROTA con `primeraRoja` (`flota.cjs:229`, `:518-523`).
- **h10, medido**: no hay `spawn('sh'` ni `sh -c` en los scripts; el único `sh` es el hook previo del proyecto con shebang
  (`kit-githook.cjs:703`), que ya avisa *"no hay sh…"* (`:705`). `doctor.cjs version()` (`:66-69`) toma la primera `\d+.\d+.\d+`.
- **u4-u8, u13, h5, h6, h9**: los puntos de entrada están en el delta de la `rc.5` y siguen donde dice, con estas líneas nuevas:
  `adoptar.cjs` `mirar()` `:674`, `lineaWorktreeinclude` `:655-670`, `aplicarPropuesta` `:899`, `RUTA_CHANGELOG` `:971`, `distintosDe`
  `:1162`, `frenaAlDirector` `:1176`, `decisionesSettings` `:1195`, bloque D2 `:1251-1265`; `actualizar.cjs` `rutaChangelog` `:113` y la
  escritura `:684-694` (inserta antes del primer `## `); `ficha.cjs` `CONOCIDOS` `:232` (tres copias iguales: `copias.test.cjs`,
  `pc/lib.test.cjs`); `arquitecto.cjs` `PLAZO_TEST_MS` `:36`, `plazo()` `:192`, uso `:296`. **Adoptar no corre gitleaks** (h5).
- **De D8r.1**: `modo-a.md` Paso 5 (`:45-68`) no crea el worktree de `v1` con director y su línea (`:76`) es `inicio — ejecutá
  docs/modulos/v1/SPEC.md`; en `flota.md` paso 3 (`:45-46`) la portada **ya** va antes del push (el pendiente 2 está resuelto en el texto:
  se verifica contra `adoptar`, no se toca si coincide).

## Pedido original, textual

> inicio — misión 5, **D8c.1: la `rc.6`** (`v3.0.0-rc.6`). […] **Alcance: una sola `rc`, en nivel MEDIO-ALTO.** […] 1. **El obrero de
> cierre de tramo.** […] Va con **h11: a `main` sube solo el director**, decidido con Guido el 2026-11-04. 2. **La vuelta 2 de
> `docs/kit-v3/SPEC-paquete-8r4.md`**: u4-u8, u13 y h5-h12. Ya está diseñada y pasó red team; no se rediseña. h12 es el aviso de piezas
> pendientes de `hooks-lib` […]. 3. **Lo de Pendientes "De D8r.1" y "De D8r.2"** […]. 4. **Fuera de alcance: los experimentos de método.**
> *(La sesión madre, 2026-11-04.)*

## AGREGA y MODIFICA

Rutas: `molde` = `kit/molde/`, `dir` = `kit/molde/skills/director/`, `lib` = `kit/molde/hooks/lib/`, `as` =
`kit/skills/arquitecto-skills/scripts/`, `anexos` = `kit/skills/arquitecto/anexos/`.

### La tabla: cada cambio con sus archivos, su prueba y su nivel (§3.6)

| # | Cambio | Archivos | Prueba que lo cubre | Nivel |
|---|---|---|---|---|
| c1 | El obrero de cierre de tramo (renglón 11) | `dir/plantilla-cierre.md` (nueva), `dir/SKILL.md` (paso 7), `anexos/formato-spec.md` (la ficha), `lib/inyeccion.cjs`, `molde/scripts/estado.cjs` | `inyeccion.test`, `estado.test`, `lib/encargo.test`, `scripts/encargo.test`, `skills.test` | medio |
| h11 | A la rama por defecto sube solo el director | `molde/hooks/git-seguro.cjs` (`push()`), `molde/githooks/kit-githook.cjs` (pre-push), los textos de `/obrero` y `/director` | `git-seguro.test`, `kit-githook.test`, `kit-githook-noche.test`, `worktree.test` (`integrar` sigue), **mutación** | **medio-alto** (freno) |
| h12 | Los hooks esperan junto con `hooks-lib` | `as/actualizar.cjs`, `as/lib/fusion.cjs` (si hace falta el acople), `as/lib/chequeo.cjs` (línea 7), `as/lib/flota.cjs` (la nota) | `actualizar.test`, `fusion.test`, `chequeo.test`, `flota.test`, **mutación** | **medio-alto** (actualizador) |
| u4 + h6 | Lo que queda fuera del repo: `vecinos` | `as/lib/vecinos.cjs` (nuevo), `as/lib/adoptar.cjs` (`mirar`), `as/doctor.cjs` | `vecinos.test` (nuevo), `adoptar.test`, `doctor.test`, `worktree.test` (h6) | medio |
| u6 + u13 a + h5 | Los avisos de la adopción, el CHANGELOG, lo que D2 saca y qué lo cubre, gitleaks de la historia | `as/lib/adoptar.cjs`, `as/actualizar.cjs` (solo el renglón del CHANGELOG), `molde/skills/cierre/SKILL.md` (con `[Unreleased]`) | `adoptar.test`, `actualizar.test`, `skills.test` | medio |
| u7 código + u8 | `andamiaje:` en la ficha; `vars.plazo-test` | `lib/ficha.cjs` y sus dos copias, `kit/skills/arquitecto/scripts/arquitecto.cjs`, `molde/kit.ejemplo.md` | `ficha.test`, `copias.test`, `pc/lib.test`, `arquitecto.test` | medio |
| h9 | `.worktreeinclude` con un `config.local.ini` con clave | — (se reproduce primero) | `worktree.test` | liviano si no pasa |
| h10 | `sh` y la versión de `claude` | `as/doctor.cjs` (`version()`, solo si se reproduce) | `doctor.test` con la salida de Juan | liviano |
| u5 + u7 textos + lecciones | `modo-b.md` B0/B5, `/director` paso 2 y 3, `NUCLEO.md` §7/§9/§9.4/§11, `flota.md` D4, el Equipador paso 4, `/cierre` y el CIERRE del obrero, el `explorador`, la plantilla del encargo | los de esa lista | `skills.test`, `skill.test` (topes y frases) | liviano |
| r1 | De D8r.1 (1-3) y De D8r.2 (lo que queda) | `anexos/modo-a.md`, `anexos/flota.md` (si no coincide), `formato-spec.md`/`flota.md` (la línea de `director-obrero`) | `skill.test` | liviano |
| doc | Guía y manuales: el cierre de tramo, h11, `andamiaje:`, `plazo-test`, `vecinos` | `GUIA-DE-USO.md` (una frase y un puntero), `manuales/` (el del director y el de la flota) | lectura del director | liviano |

### c1 · El obrero de cierre de tramo (el diseño de `SPEC-paquete-8b.md` "(11)", sin rediseñar)

1. **La ficha** (`formato-spec.md`, el esqueleto, cabecera): `- Próximo paso: <uno, concreto>`, `- Tramo: <N> cerrado <AAAA-MM-DD>` y,
   solo con director, `- Cierre de tramo: cada encargo | cada <N> encargos | al checkpoint` (lo elige el Arquitecto en el Modo B con la
   Ejecución; sin el renglón, cada encargo). `## Fase y próximo paso` queda para la fase.
2. **`dir/plantilla-cierre.md`** (nueva): la plantilla de siempre ya llena. `Skill: obrero`; `Modelo: sonnet · Esfuerzo: low · Por qué:
   documentación`; `Riesgo: bajo · Por qué: no toca código`; `Spec:` la línea del spec que cita la Ejecución (la exige `leerEncargo`).
   `## Toca`: la ficha, `bitacora/` y `tiempos.md` del módulo. `## Alcance`: `tiempos.cjs tiempos <x>` y `contador <x>`; la ficha (tareas
   con su commit, `Próximo paso:`, `Tramo:` +1, Parado, Te espera, `## Sesiones vivas`); la bitácora del tramo; `resumen.cjs <x>` si toca.
   `## NO SE TOCA`: código, la `carpeta-docs` del proyecto fuera del módulo, `.claude/`. `## AUTORIZADO`: esos scripts. `## GATE`:
   `estructura.cjs todo` si el candado está prendido.
3. **`/director` paso 7**: al cerrar un tramo (según `Cierre de tramo:`), copia `plantilla-cierre.md` como cualquier encargo (paso 3), lo
   lanza (4), lo verifica y mergea (6) y pushea `modulo/<x>`. **No escribe la ficha él.** La mudanza y la alarma siguen; el paso 10 sigue
   (nunca `/cierre`). **El texto no crece**: el paso 7 nuevo reemplaza la frase de "sobreescribí la ficha" y queda ≤ 8.000 B y 70 renglones
   con u5 y las lecciones del paso 3 adentro (si no entra, el detalle va a `plantilla-cierre.md`, que es donde se lee).
4. **El arranque y `/estado`**: `datosFichaModulo` lee también `Tramo:`; la línea queda `<x> · tramo <N> cerrado <edad> · próximo: <…>`
   (sin `Tramo:`, la de hoy); el bloque sigue en 300 y el total en 9.700. `bloqueModulos` cae a `origin/<rama>` si no hay rama local (la
   otra PC). `estado.cjs lineaModulo` suma `tramo <N> cerrado` y `próximo: <…>` de la misma ficha.
5. **crit. c1**: `inyeccion.test` (ficha en `modulo/x` con `Tramo:` y `Próximo paso:` → la línea; sin rama local, de `origin/`; los que no
   entran → `… (N más …)`); `estado.test` (la misma línea); `encargo.test` (`presentar` acepta un encargo copiado de `plantilla-cierre.md`
   con `<x>` y el `Spec` llenos); `skills.test` (el paso 7 nombra la plantilla y no dice "sobreescribí la ficha"; ≤ 8.000 B).

### h11 · A la rama por defecto sube solo el director (DECIDIDO por Guido, 2026-11-04)

- **Dónde frena: en el pre-push** (`kit-githook.cjs`), que es el candado que ve toda subida (la herramienta, la terminal del worktree, un
  script) con las refs reales que da git, sin parsear el comando. Por cada ref que sube: si la `refRemota` es `refs/heads/<def>` (la rama
  por defecto del remoto: `origin/HEAD`, y si no está, la que ya lee el kit) **y** el `rolEfectivo` es `obrero`, `nocturno` o `desconocido`
  → 1, *"a `<def>` sube solo el director (`worktree.cjs integrar`) o vos desde la carpeta principal: un obrero pushea su rama
  `modulo/<x>--<ID>`"*. Pasan: `humano` (Guido en el principal, el `/cierre`), `director` (lo hace `integrar` desde su temporal con rol
  director), `actualizador` (la flota). Borrar la rama por defecto ya lo frena `git-seguro`.
- **Y antes, en `git-seguro` `push()`** (el aviso temprano, para que el agente no gaste el intento): en sesión de agente (`enAgente`), un
  refspec cuyo destino explícito es la rama por defecto (`main`, `HEAD:main`, `x:refs/heads/main`, `:main` ya va) o `--all`/`--branches`
  → deny con el mismo texto. `git push` a secas no se adivina acá (depende del upstream): lo ataja el pre-push.
- **El director no cambia**: no es agente (`agente.cjs:32`) y a mano solo pushea `modulo/<x>`; si pushea `main` a mano, el pre-push lo
  deja (es su rol), y el texto de `/director` paso 10 ya dice "a `main`, `integrar`".
- **Textos**: `/obrero` `:24` *"nunca push a otra rama: a `main` sube solo el director, y el pre-push lo frena"*; el manual del director.
- **Lo que no cierra** (va a "Lo que esto no cierra"): un obrero de una ventana **antes** de entrar a su worktree es `humano` (rt-2 de la
  `rc.5`): ahí el pre-push lo deja. Lo cubre el paso 0 del `/obrero` (ningún comando antes de `adentro:`).
- **crit. h11**: `kit-githook.test`: con rol `obrero` (y `nocturno`, y `obrero` con `.kit-noche`) un push a `refs/heads/main` → 1 con el
  texto; a `modulo/x--01` → como hoy; con rol `director`, `humano` y `actualizador` a `main` → como hoy; la rama por defecto sin
  `origin/HEAD`. `git-seguro.test`: en sesión de agente `git push origin main`, `HEAD:main`, `x:refs/heads/main`, `--all` → deny; `git
  push origin modulo/x--01` → como hoy; fuera de agente, como hoy. `worktree.test`: `integrar` sigue subiendo (su temporal es director).
  **Mutación**: (a) sacar la condición de rol → la prueba de `director`/`humano` a `main` se pone roja; (b) sacar la de la ref → la del
  obrero a su rama se pone roja; (c) comparar contra `main` fijo en vez de `<def>` → la prueba con la rama por defecto `trunk` se pone roja.

### h12 · Los hooks esperan junto con `hooks-lib`

- **El arreglo de fondo** (el de la nota de la `rc.5`): en `actualizar`, si `hooks-lib` queda esperando (choque, sin `por:`, informe previo),
  **las piezas `hook-*` también esperan**: quedan como estaban, con su línea *"espera a `hooks-lib`"* en el informe de `hooks-lib` (no un
  informe propio). Así el proyecto queda con hooks viejos y lib vieja, que andaban juntos, en vez de hooks nuevos con lib vieja (que fallan
  abiertos). Al resolver `hooks-lib` (`resolver … hooks-lib …`), el siguiente `actualizar` trae los `hook-*` como siempre.
- **La línea 7 con `hooks-lib` esperando**: no corre las pruebas del molde nuevo contra los hooks viejos (fallarían por diseño); da
  `⚠ casos: hooks-lib te espera — resolvela primero: <la línea de resolver>` y **no** cuenta como roja. Sin `hooks-lib` esperando, igual que hoy.
- **La flota**: con eso, el repo sale `te espera` (no ROTA) y la nota dice `hooks-lib (y los hook-* con ella): resolvé hooks-lib primero`.
- **Lo que no se afloja**: si `hooks-lib` **no** espera y la línea 7 da rojo, sigue ROTA como hoy. `settings` no se acopla (sus hooks
  enchufados son los mismos archivos; si un `hook-*` nuevo no llegó, el `settings` nuevo que lo nombra apuntaría a nada: **se acopla
  también** si el `settings` nuevo enchufa un hook que no está en el disco; se mide en la prueba).
- **crit. h12**: `actualizar.test`: un proyecto con `hooks-lib` adaptada sin `por:` y un `hook-*` que cambió en el molde → los dos quedan
  como estaban, el informe de `hooks-lib` nombra el `hook-*`; sin `hooks-lib` esperando, el `hook-*` se actualiza (como hoy); `chequeo.test`:
  la línea 7 con `hooks-lib` esperando → ⚠ con la línea de resolver, sin rojo; sin esperar y con un caso perdido → ❌ como hoy; `flota.test`:
  la nota. **Mutación**: (a) sacar el acople → el `hook-*` se actualiza y la prueba se pone roja; (b) que la línea 7 dé ⚠ siempre → la prueba
  sin `hooks-lib` esperando se pone roja.

### La vuelta 2 de la `rc.5` (sin rediseñar; el texto que manda es el de `SPEC-paquete-8r4.md`, con su red team)

- **u4 + h6** (`vecinos`, rt-9 incluido: los `gate-*` se cuentan, sin consejo de mudarlos; una `gate-*` sin `.git` es *"datos, no un
  gate: no tocar"*; la línea de las `mezclada` suma lo de `git worktree remove` y lo ignorado). h6 se reproduce con `worktree.test` (dos
  worktrees en `../`): si `estado`/`cerrar` no se confunden, `probada, no pasa`.
- **u5** (textos): B0 nacer/retomar, B5 con BORRADOR bajo director, `/director` paso 2 (el diseño lo hace una sesión de Arquitecto
  aparte; rt-6: el director no está vivo mientras diseña el Arquitecto).
- **u6**: NORTE con `[completar`, el CHANGELOG con `## [Unreleased]` (`### Método (kit)`), `--agentes renombrar`, `--worktreeinclude`,
  los `ask` que preguntan en cada vuelta. Con la `rc.4`, el CHANGELOG es `<carpeta-docs>/CHANGELOG.md`.
- **u7**: `andamiaje:` (código en `ficha.cjs` y sus copias; texto en `NUCLEO.md` §9.4), `datos-reales` por entorno (texto en `flota.md` D4,
  con rt-8: *"solo si el script no acepta abreviaturas"*; `sensible.test` documenta que la abreviatura no matchea), el Equipador paso 4, y
  las lecciones de Hermes de la tabla del delta de la `rc.5` (las nueve que entran, una línea cada una; la 25, "el obrero sale con trabajo
  de reserva", sigue en **no**: el obrero de cierre no la necesita).
- **u8**: `vars.plazo-test` (1-60 min) en el `sello`.
- **u13 a**: el bloque D2 de `--mirar` dice qué freno del kit cubre cada `ask`/`deny` que saca, o `ninguno`. u13 b sigue en no (D8r4-13).
- **h5**: `adoptar --mirar` corre `gitleaks detect --redact` sobre toda la historia si gitleaks está (si no, una línea `gitleaks: no está,
  no miré la historia`) y lista `archivo:línea · regla`, **nunca el valor**, con la propuesta (rotar si es real; si no, `.gitleaksignore`
  con su porqué, que pide aprobado). No escribe nada. **crit.**: `adoptar.test` con un repo con una clave de mentira en un commit viejo
  (con gitleaks en la PC; sin él, la línea de "no está").
- **h9**: se reproduce primero (`worktree.test`: un `config.local.ini` ignorado con una clave de mentira, copiado por `.worktreeinclude`;
  `secretos.cjs` sobre esa ruta y el deny). Si está cubierto, `probada, no pasa` con la salida; si no, el arreglo entra con su prueba.
- **h10**: el `sh` está medido (Contexto: solo el hook previo, que ya avisa) → `probada, no pasa`. La versión de `claude`: si la salida de
  Juan (`prueba/juan`, `52e0ca3`) está en el canónico, `doctor.test` con ella; si no, **NO VERIFICADO** y se le pide a la madre.
- **h7, h8** eran de la vuelta 1 (con u1): lo que la `rc.5` haya dejado, se mira en su tracker; no se rehace acá.

### r1 · Pendientes "De D8r.1" y "De D8r.2"

- **D8r.1-1, el Modo A con director**: `modo-a.md` Paso 5, con director, arma el worktree de `v1` (`worktree.cjs crear v1`, la vía de una
  ventana de la `rc.5`) y la línea del Paso 6 es la del director (`/director v1`, con `donde`), no `inicio — ejecutá …`. Solo texto: el
  script ya existe. **crit.**: `skill.test` (la frase).
- **D8r.1-2, la portada antes del push**: el texto ya lo dice (Contexto). Se verifica contra `adoptar.cjs` (el orden de los commits); si
  el código pushea antes, una línea en el texto que diga el orden de verdad. No se toca código.
- **D8r.1-3, `director-obrero: sí` en un repo ya adoptado**: una línea en `flota.md` (paso de la flota) y en la nota de migración: *"si tu
  proyecto se adoptó sin director y lo querés, poné `piezas.director-obrero: sí` y corré `resolver . director-obrero nueva`"*.
- **D8r.1-4** (ramas de obrero mezcladas que quedan en GitHub): **no entra**, con la vara: es ruido, no rompe; `integrar` ya borra la
  remota de su obrero. Va al tracker como `por las dudas`.
- **D8r.1-5, D8r.2-5 (NO VERIFICADO)**: siguen; los cubre lo que el chequeo frío y la flota contra el clon de Hermes alcancen.
- **D8r.2-2 (CF-3)** = u8. **D8r.2-3 (CF-2, la mitad)** y **D8r.2-4 (t12 a)**: no entran (D8r.4 ya lo decidió con la vara: adivinar /
  por las dudas). **D8r.2-6 (el repo de prueba parecido a Hermes)**: no entra en esta `rc` (es grande y no arregla un dolor de uso; va
  antes de R2: se le avisa a la madre).

## NO SE TOCA

- Lo que frenan los porteros fuera de h11: `sensible`, `secretos`, `niega-aprobar`, `escritura`. Lo que frena `git-seguro` hoy (force,
  borrar, `--prune`, `--mirror`): h11 solo **suma** un caso.
- El `settings.json` del molde. La flota sin `--con-obra`. `presentar` como candado de la rama. `arquitecto.cjs` salvo el plazo (u8).
- Los experimentos de método. El ítem 5 de "lo que cuenta Guido" y el 2 y el 9 de Hermes.
- Las carpetas reales de Guido (`D:\Hermes\*`, `D:\Arti-*`): ni lectura con escritura ni push. Las actas de `tips/` y `_fuente/`.

## Entorno de prueba

Temporales de las pruebas (`node --test`), con la rama por defecto `main` y `trunk`. **El clon de Hermes**: `git clone D:\Hermes\Hermes.exe`
al scratchpad, con un `bare` falso de remoto en el scratchpad (rt-11 de la `rc.5`: `git remote get-url origin` del clon cae dentro del
scratchpad antes de cualquier push; si no, para), `modulo/cashflow` empujada al bare, y la ficha llevada a la `rc.5` antes de la flota.

## Criterios de aceptación

Los crit. de c1, h11, h12 y de cada ítem de la vuelta 2 (los del delta de la `rc.5`, con su número), y:
- **crit. 7** la suite entera verde, **una sola vez, al final, sola y en segundo plano** (las rojas de carga se repiten solas antes de
  contarlas).
- **crit. 8** la flota contra el clon de Hermes: rc.5 → rc.6 con `--con-obra` → `main` sale `mezclado` (o `te espera` con su porqué),
  `modulo/cashflow` igual, la línea de "te espera" del módulo; repetida, `al día`.
- **crit. 9** el chequeo frío corto (un revisor, una vuelta) que recorre el día de Guido: VS Code con una sola ventana, el director en su
  worktree gestiona dos obreros (uno de trabajo y el de cierre de tramo), modo `auto`; un obrero que intenta `git push origin main` choca
  con el texto de h11; el arranque muestra `tramo 1 cerrado · próximo: …`. Lo que necesita la extensión de verdad, **NO VERIFICADO**.

## Decisiones (la vara)

- **D8c-1 · h11 frena en el pre-push, y `git-seguro` solo avisa antes** cuando el destino es explícito: el pre-push ve las refs reales
  (también `git push` a secas, un script o la terminal), y parsear todo refspec en el portero es adivinar. `[mejor código]`
- **D8c-2 · h11 deja pasar a `humano`, `director` y `actualizador`**: el pedido es "nunca un obrero"; Guido en el principal y la flota
  suben a `main` por diseño. `desconocido` frena (un `.kit-rol` roto no es un permiso). `[coherencia]`
- **D8c-3 · h12: los `hook-*` esperan con `hooks-lib`, en vez de un mensaje mejor sobre el ROTA**: el mensaje solo no arregla que los
  hooks nuevos con la lib vieja fallen abiertos; esperar juntos deja el proyecto como andaba. `[mejor código · acordarse de menos]`
- **D8c-4 · El cierre de tramo se construye como lo diseñó D8b.1, sin cambiar nada**: lo charló Guido en el repaso. `[coherencia]`
- **D8c-5 · El `/director` no crece**: el tope de 8.000 B está a 27 B; lo que no entra va a `plantilla-cierre.md`, que es donde se lee.
  `[acordarse de menos]`
- **D8c-6 · h9 y h10 se reproducen antes de tocar código** (como manda u10). `[filtro pragmático]`
- **D8c-7 · D8r.1-4 y D8r.2-3/4/6 no entran**: por las dudas, adivinar, o grande sin dolor de uso. `[filtro pragmático]`

## Lo que esto no cierra

- **Un obrero de una ventana antes de entrar** a su worktree es `humano` para el pre-push (rt-2 de la `rc.5`): h11 no lo ve. Lo cubre el
  paso 0 del `/obrero`.
- **La frecuencia del cierre de tramo** la respeta el director leyendo la ficha: ningún script lo frena si se la saltea.
- **EnterWorktree y los settings con una ventana** siguen NO VERIFICADO (de la `rc.5`).
- `andamiaje: con-ok-de-guido` depende de que el agente lea `NUCLEO.md` (D8r4-8).

## Los encargos (el director reparte, lee cada diff y corre las pruebas de cada uno)

Presupuesto: ~2 h de reloj y ~6 encargos de trabajo, más el red team y el chequeo frío. Cada uno en `scratchpad/<x>/wt`, desde el tag
`v3.0.0-rc.5`, con el `--stat` antes del merge. Mientras se construye, **solo las pruebas de lo tocado**.

| # | Encargo | Puede tocar | Prueba |
|---|---|---|---|
| RT | Red team, una ronda, **solo h11 y h12** | — | — |
| P | h11 + su mutación | `git-seguro.cjs`, `kit-githook.cjs`, sus pruebas | crit. h11 |
| L | h12 + su mutación | `actualizar.cjs` (solo el acople), `fusion.cjs`, `chequeo.cjs`, `flota.cjs`, sus pruebas | crit. h12 |
| C | c1 + los textos de `/director` (u5 paso 2, lecciones del paso 3) | `dir/*`, `formato-spec.md`, `inyeccion.cjs`, `estado.cjs`, sus pruebas | crit. c1 |
| V | u4 + h6 + h9 + h10 | `lib/vecinos.cjs`, `adoptar.cjs` (solo `mirar`, la línea de vecinos), `doctor.cjs`, `worktree.test` | crit. 4, h6, h9, h10 |
| D | u6 + u13 a + h5 | `adoptar.cjs`, `actualizar.cjs` (solo el renglón del CHANGELOG), `cierre/SKILL.md`, sus pruebas | crit. u6, u13, h5 |
| K | u7 código + u8 | `ficha.cjs` y sus copias, `arquitecto.cjs`, `kit.ejemplo.md`, sus pruebas | `ficha`, `copias`, `arquitecto` |
| T | Textos (u5 resto, u7, r1, la guía y los manuales) | el director, al final | `skills.test`, `skill.test` |
| CF | Chequeo frío (crit. 9) | — | — |

**Orden**: RT → P ∥ L ∥ C (no comparten archivos) → V ∥ K → D (después de L y V: comparte `actualizar.cjs` con L y `adoptar.cjs` con V;
mergea `main` y vuelve a correr sus pruebas) → T → CF → la suite (sola) → la flota contra el clon de Hermes → tag.

## Ejecución

Un director Opus (D8c.1), este delta, una ronda de red team solo de h11 y h12 y un chequeo frío corto; el cómo, en [`PLAN-construccion.md`](PLAN-construccion.md).
