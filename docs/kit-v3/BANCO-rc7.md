# El banco de prueba de la rc.7 (la sesión 5a del tramo final, 2026-11-15)

> El kit `v3.0.0-rc.7` contra **copias** de todos los repos de la cuenta de Guido (los que tienen el kit y los que no), haciendo de
> dueño: preparar la PC trayendo los repos, adoptar o poner al día, `/inicio` y un pedido chico, y noches enteras. Lo pidió Guido el
> 2026-11-15 (*"que alguien intente el kit con todos mis repos reales… algo útil pero inocuo"*). Del kit, solo lectura. Este informe
> va en abstracto (vibe-kit es público): sin nombres de repos del trabajo ni de clientes; el detalle por repo está en el privado
> (`vibe-research/banco/2026-11-15-banco-rc7.md`). El script queda en `pruebas/banco/` (con su `LEEME.md`) para 5c y cada vuelta.

## Resumen para el director

1. **Terminó**, en ~4 h: la vuelta 1 en los 26 repos (los 7 con kit y 19 sin) y **dos noches** (no tres: abajo, por qué).
2. **Nada de lo real cambió** (la foto de antes y después, 18 carpetas; lo que se movió es de otras sesiones o de este informe).
3. **Dos grandes nuevos.** **B1**: un repo sin `comando-test` (13 de 19 adoptados) no puede tener noche (`verificar` no mezcla nada)
   ni ponerse al día (la flota lo deja ROTA); el arreglo es una regla en tres lugares. **B2**: la PC real tiene el kit en `rc.7` y los
   hooks de la PC en `rc.6`, sin `niega-aprobar` a nivel PC; `kit-sync` dice LIMPIO igual. Solo leído.
4. **Las noches**: 0 comandos y cero "rojo" en las dos; **ninguna terminó ni publicó sola** (una por B1, otra por G4, con el permiso
   que dejó la adopción recomendada); `/estado` con sus cuatro secciones, pero G5 y G3 reproducidos en un repo que no es Deptos.
5. **Visto también**: G1 (solo 1 de 7 tiene un script tocado), G4 (13 de 26 repos con `git pull:*`), G3, G5, c5, c16 (dos de dos), c17.
6. **13 chicos nuevos** (b1-b13): la adopción (rutas largas, `.claude` ignorado, "todo en no", el linter, `carpeta-docs`), la PC
   (programas que faltan), `/inicio` con códigos de commit, frenos que niegan de más.
7. **No medido**: la flota no mezcló ninguno (4 de 7 salteados por ramas vivas, 2 ROTA por tiempo con la PC cargada, 1 cortado).
8. **Criterios**: ninguno nuevo; el 10 no (12 de 19 adopciones andan). Script en `pruebas/banco/`; detalle, en el privado.
9. **Espera a Guido**: "instalar hooks por PC" (B2). **Lo que más importa**: ningún repo recién adoptado cierra su noche solo.

## En criollo

1. **Probé el kit en copias de todos tus repos**, sin tocar nada real. Preparar una PC y traer los repos anduvo entero; adoptar
   anduvo en 12 de 19; el pedido chico, en todos.
2. **Lo que falla es la primera noche de un repo recién adoptado**: si el repo no tiene pruebas, la noche hace el trabajo pero no
   lo suma; si las tiene, lo suma pero no cierra, por un permiso que la misma adopción dejó. Los dos arreglos son chicos.
3. **Tu PC tiene una parte de los frenos en la versión anterior.** Se arregla con "instalar hooks por PC", que tenés que correr
   vos; te lo pide el director.

---

## Lo inocuo: qué se tocó y qué no

- **Todo en una carpeta del banco**, en el scratchpad de la sesión: un `bare` por repo y una copia con ese `bare` de origin. Todo
  push pasó por un guardia que mira que el origin caiga adentro del banco (se probó que niega GitHub y una carpeta real). El
  publicar es de mentira (una rama `produccion` del `bare`).
- **De lo real solo se leyó**: `git clone --bare` de las carpetas de la PC, `gh repo clone`/`gh repo list` de la cuenta, y
  `~/.claude` para el `doctor` (B2). Nada se escribió en ninguna carpeta real de proyecto ni en `~/.claude`.
- **Sin llaves**: ningún repo versiona un `.env`; las skills que publican o pegan contra lo real salieron en un commit del andamio;
  "preparame esta PC" corrió con un HOME de mentira y un `gh` de mentira; las sesiones, con `KIT_HOME_PC` de mentira, `GH_CONFIG_DIR`
  vacío y sin `GH_TOKEN`; la instalación de las pruebas, con un HOME vacío. Docker no se tocó.
- **Lo que no se aisló**: la red (las instalaciones bajan paquetes; `worktree crear` corre el `comando-setup` con el HOME real);
  el login de Claude Code (las sesiones usan el `~/.claude` real para entrar).
- **La foto de después** (18 carpetas): **nada de lo real cambió por el banco.** Cambiaron tres, y ninguna por esto: la carpeta de
  Deptos sumó una carpeta de trabajo (una sesión real de Deptos estaba trabajando ahí toda la tarde, con pruebas de navegador; de esa
  carpeta el banco solo hizo un `git clone --bare` al principio); vibe-kit avanzó con los commits del director del tramo y tiene sin
  commitear lo de esta sesión (este informe y `pruebas/banco/`); vibe-research avanzó con los commits del ayudante del director y
  tiene sin commitear el detalle del banco.

## Qué se corrió

| Paso | Repos | Cómo |
|---|---|---|
| La foto de antes | las 18 carpetas de repo de la PC | `HEAD`, rama, origin, stash, worktrees, refs y `git status --porcelain` |
| Los remotos | 26 (25 de la cuenta, sin vibe-kit, y una carpeta local sin origin) | un `bare` por repo en el banco: de la carpeta real si había, si no de GitHub (solo lectura) |
| Preparar la PC | la PC de mentira | `preparar-pc` del clon del kit en el tag, con un HOME de mentira; después `traer-repos listar` y `clonar` de los 25, con un `gh` de mentira que clona de los `bare` |
| El andamio | 26 | fuera las skills que publican o pegan contra lo real (`deploy`, `release`, `smoke`: 12 repos); ningún `.env` versionado |
| Poner al día | los 7 con kit (todos en `rc.6`) | `actualizar.cjs flota`, de a uno, contra el clon del kit en `v3.0.0-rc.7` |
| Adoptar | los 19 sin kit | `adoptar --mirar` y `--aplicar` con lo recomendado (`--director kit --permisos recomendada --arranque kit --claude-md`), los commits que imprime tal cual, barreras, push al `bare`, `--traer` y `--verificar`. Las preguntas del dueño, contestadas a lo seguro (`publicar: no`, la carpeta de papeles `metodo`) y contadas como "preguntó" |
| `/inicio` y un pedido chico | 17 | `claude -p` en Sonnet, de fondo: `/inicio`, y después "sumá en el TODO un pendiente…" |
| Las pruebas propias | 1 | `comando-setup` y `comando-test` de la ficha, con un HOME vacío |
| La noche | 2 | el andamio de R2 (el publicar de mentira firmado por la lib, la PC autorizada), un módulo `banco-noche` de tres encargos chicos sellado por el Arquitecto, el director de fondo en Opus sin dueño, obreros en Sonnet, y `/estado` a la mañana |

## La tabla, por repo (en abstracto)

Los nombres, en el privado. "Con kit" = 7 repos en `rc.6`; "sin kit" = 19.

| Paso | Pasó | Falló | Preguntó | Evidencia |
|---|---|---|---|---|
| Preparar la PC con el HOME de mentira | ✓ (0 cosas a arreglar, el `doctor` "todo bien") | — | — | `preparar.log` del banco; ⚠ `gh` sin sesión, como debe ser |
| Traer los repos de la cuenta (C2) | 25 de 25 traídos; los 7 con kit con los ganchos prendidos y su `comando-setup` nombrado, sin correrlo | — | elegir cuáles (el banco eligió todos) | `traer-repos clonar` salió 0 |
| Poner al día (flota) | 0 de 7 | 2 ROTA (la línea 7 por tiempo; en uno, además, la 8 por no tener `comando-test`) · 1 cortada por mí | 4 **salteados** por ramas `modulo/*` vivas en el remoto | las nueve líneas en el commit de `kit/v3.0.0-rc.7` de cada `bare`; las líneas 1-6 y 9 dieron ✅ en los dos ROTA |
| Adoptar (`--traer` + `--verificar`) | 12 de 19 quedan andando | 6 traen solo la ficha y `--verificar` da ❌ hooks y arranque · 1 no adopta (`.claude` en su `.gitignore`) | 4 la publicación (`publicar`, `release`, uno también `sale-afuera`); 3 la carpeta de papeles | `salidas/adoptar-*.log` |
| `/inicio` | 17 de 17 resumen y esperan la misión | — | — | `salidas/sesion-*-inicio.jsonl` |
| El pedido chico | 17 de 17 dicen "Chico, lo hago acá." como primer renglón | — | — | `salidas/sesion-*-pedido.jsonl`; en dos repos con la carpeta de papeles propia lo anotó ahí, bien |
| Las pruebas propias | 1 de 1, la segunda vez (instaló en 5 min, 1.648 casos pasaron) | la primera vez no terminó de instalar en 20 min (la carga) | — | `salidas/pruebas-*.log` |

## Las dos noches

El plan pedía 2 o 3, con variedad: uno usado entero, uno que nunca usó director y uno recién adoptado. **Se hicieron dos, las dos en
repos recién adoptados** (uno sin pruebas y uno con), porque eran los que corrían en esta PC: el repo más usado tiene un
`comando-test` que espera la integración continua de GitHub (no existe en una copia), dos piden `pnpm` y uno `flutter`, que la PC no
tiene, y la noche de un repo usado entero ya la hizo R2 sobre la misma `rc.7`. Cada noche, sola en la PC y sin dueño: el director
de fondo en Opus (`claude -p --permission-mode auto`), con el mismo primer pedido que en R2, y obreros en Sonnet de a dos.

| | Noche 1: recién adoptado, con código, **sin `comando-test`** | Noche 2: recién adoptado, **con `comando-test`** (1.648 casos) |
|---|---|---|
| El armado | el publicar de mentira firmado; **el sello pidió quitar `gate:entorno-prueba`** (otra firma) | el publicar de mentira firmado; el sello, de una |
| El reloj | 15 min | 1 h 20 min (cada carpeta de obrero instala dependencias, ~5 min cada una) |
| Los encargos | 3 hechos y subidos; **0 mezclados** (B1) | 3 más el cierre de tramo, mezclados después de `verificar`; `integrar` con las 1.651 pruebas pasando |
| El cierre de la noche | no llegó | **se negó por `Bash(git pull:*)`**, el permiso que la adopción recomendada dejó (G4). El director lo dejó propuesto para firmar |
| **0 comandos para el dueño** | **pasa** | **pasa** |
| **Termina y publica sola** | **no pasa** (B1) | **no pasa** (G4) |
| **`/estado`: las cuatro secciones** | sí; la cuenta coincide (nada mezclado) | **las secciones sí, la cuenta no**: en la vista del proyecto, *"LO QUE SE HIZO: nada"* con el módulo ya integrado (G5); la del módulo, los cuatro |
| **Nada dice "rojo"** | **pasa** (cero) | **pasa** (cero) |
| Además | "Te necesito" con el renglón cortado (b10); el director narró en inglés (b9) | **"TE NECESITO: nada"** aunque el cambio para firmar existe: quedó solo en la rama del módulo, que ya estaba integrada (G3 parte 1, c18). El director lo dice en su parte, pero `/estado` no lo muestra |

Lo que anotaron los obreros de la noche 2 y el director pasó al parte: **el lint del proyecto da 299 errores, todos en los archivos
del kit dentro de `.claude/`** (la adopción no los suma a lo que ignora el linter; acá no rompe nada porque el lint no está en el
`comando-test`, pero en un repo que sí lo tenga rompe el gate: lo mismo que el informe de los siete repos vio en uno, con
`.githooks`); **un freno negó un comando porque la palabra "supabase" estaba en el texto que se escribía** (un falso positivo de
la familia de la parte 6); y **un freno dio por rota la línea de `publicar` de la ficha** (la del andamio, con la forma de llaves que
usó R2: NO VERIFICADO cuál freno ni por qué).

## Los hallazgos

Con la vara de R2: **GRANDE** = un criterio de éxito que no se cumple, un agujero de seguridad, o algo que rompe un repo al
adoptarlo o ponerlo al día. **CHICO** = lo demás. Lo que ya estaba en R2 no se repite: va abajo, "visto también".

### Los grandes

**B1 · Un repo sin `comando-test` no puede tener una noche ni ponerse al día** ✔ (la noche en un repo recién adoptado, y la flota).
- **Qué pasa**, en tres lugares que dicen lo mismo:
  1. **El sello** del primer módulo se niega: *"sin entorno real hace falta vars.comando-test en la ficha — agregalo"*; con
     `--no-aplica entorno`, *"con ficha del kit no se saltea — quitá gate:entorno-prueba en frenos.quitados con su razón"*. Quitarlo
     es un cambio de barrera: **una firma del dueño antes del primer módulo**.
  2. **La noche no mezcla nada**, aunque el gate esté quitado y firmado: `encargo.cjs verificar` da `3. pruebas · ❌ · NO VERIFICADO
     — la ficha vigente no tiene vars.comando-test` (`molde/scripts/encargo.cjs:580`, sin excepción por nivel ni por el gate
     quitado). En la noche: tres encargos hechos y subidos en 15 min, **ninguno mezclado**, sin cierre ni publicar; el director le
     deja al dueño "una decisión tuya".
  3. **La flota lo deja ROTA siempre**: en nivel `estandar`, la línea 8 da ❌ *"NO VERIFICADO: la ficha no dice vars.comando-test"*
     (`lib/chequeo.cjs:758-764`; el nivel `liviano` sí está exento). Pasó en el repo con kit que había sacado su `comando-test` con
     el dueño.
- **Cuántos**: 13 de los 19 adoptados no tienen `comando-test` (10 en `estandar`, 3 en `liviano`), y 1 de los 7 con kit. Y la
  adopción no lo para: `--verificar` dice *"el repo quedó andando"* con un ⚠ (*"el gate no tiene con qué probar"*), sin decir que
  la noche no va a poder mezclar.
- **Por qué es grande**: el criterio de éxito "la noche termina y publica sola" **no se cumple en ningún repo adoptado sin
  pruebas**, y la flota no los puede poner al día (rompe la puesta al día).
- **Arreglo** (quirúrgico, una regla en tres lugares): "sin `comando-test`" es un estado legítimo **solo si la ficha lo dice**
  (`gate:entorno-prueba` quitado, con su razón, o nivel `liviano`). Con eso, la línea 3 de `verificar` y la 8 de la flota dan ✅
  *"sin comando-test (quitado: <razón>)"*; sin eso, siguen ❌. Y la adopción, cuando no encuentra un `comando-test`, **lo pregunta
  en el mismo OK** (una D5: el comando que la sesión encuentre en el repo, o quitar el gate con su razón, que entra en el commit de
  la ficha). Pruebas: `encargo.test` (con el gate quitado → ✅; sin quitar → ❌), `chequeo.test` y `adoptar.test`. **Toca un
  freno** (afloja el gate cuando se lo quitó): red team del cambio.

**B2 · La PC real quedó a medias: el kit en `rc.7`, los hooks de la PC en `rc.6`, sin el freno de las firmas a nivel PC** (solo
leído; no se tocó nada).
- **Qué pasa**: `~/.claude/VERSION` y las skills son de la `rc.7` (`kit-sync` LIMPIO), pero `~/.claude/hooks/kit/INSTALADO` dice
  `kit: 3.0.0-rc.6`, **no está `niega-aprobar.cjs`** en `~/.claude/hooks/kit/`, y el `PreToolUse` de la PC está registrado con plazo
  20 (la `rc.7` lo registra con 60, `instalar-hooks-pc.cjs:82`). En la `rc.7`, `niega-aprobar` corre en el proyecto **y en toda la
  PC** (`molde/hooks/niega-aprobar.cjs:3-4`: la copia de la PC la carga `secretos.cjs`). El `doctor` lo ve (*"✗ hooks-pc · el
  corrector de la PC está mal registrado · PreToolUse: timeout 20 y no 60"*, *"⚠ hooks-pc-iguales · hay versión nueva del
  corrector"*); `kit-sync` no lo mira.
- **Por qué es grande**: la defensa doble de las tres firmas (aprobar un cambio de freno, destrabar un publicar, autorizar la PC)
  queda en una sola capa en la PC del dueño, y en los repos que siguen en `rc.6` esa capa es la vieja, que no conoce
  `--publica` ni `--seguir`. Es la PC en la que corren las noches.
- **Arreglo**: (1) que Guido corra "instalar hooks por PC" (escribe su `~/.claude/settings.json`: lo frena el clasificador, es suyo;
  va antes de poner al día sus repos); (2) que `kit-sync` (el de vibe-kit) y el "actualizate" del Equipador comparen
  `hooks/kit/INSTALADO` con `VERSION` y lo digan: *"falta: instalar hooks por PC"* (NO VERIFICADO qué hace hoy "actualizate" con
  los hooks de la PC). El director decide si es de la `rc.8` o una tarea de Guido.

### Los chicos

| # | Qué | Evidencia | Arreglo |
|---|---|---|---|
| b1 | **La flota saltea 4 de 7 repos con kit** por ramas `modulo/*` vivas en el remoto; en uno, un módulo quieto desde hace 11 días y ramas de encargos viejos | la fila "salteado · obra en curso: …" de los cuatro | La fila dice cuáles parecen cerradas (el encargo ya mezclado en su módulo, el módulo ya integrado) y ofrece borrarlas con el OK del dueño; si no, recomienda `--con-obra`. Va con G2 (qué rama está cerrada) |
| b2 | **Preparar la PC no avisa que faltan programas** que piden los `comando-setup` de los repos que trae (`pnpm` en 2, `yarn` en 1, `flutter` en 1) | `which` en la PC; `traer-repos` nombra cada `comando-setup` sin mirar si su programa está | `traer-repos clonar` (o el `doctor`) mira el primer programa de cada `comando-setup` y lo dice: *"falta pnpm: sin él no anda la noche de X"* |
| b3 | **La adopción clona sin `core.longpaths`**: un repo con rutas largas no sale en Windows (*"Filename too long"*, el clon queda sucio y `--aplicar` se niega) | el anexo de la flota, paso 1 (`git clone --quiet "<origin>" "<tmp>/<nombre>"`); `traer-repos` ya lo pone | `-c core.longpaths=true` en el paso 1 del anexo (y donde el Equipador clone) |
| b4 | **Un repo con `.claude` en su `.gitignore` no se adopta**: `--mirar` no lo ve, `--aplicar` sale 0, el `git add -- .claude/kit.md` que imprime falla, y `--traer` sale 0 con *"sin .claude/kit.md: no es un repo adoptado"* | la adopción de ese repo | `--mirar` lo avisa (`git check-ignore .claude/kit.md`) y propone la excepción en el `.gitignore`; `--traer` sale distinto de 0 si no hay ficha |
| b5 | **"Todo en no"** (repo sin ficha ni `CLAUDE.md`, 6 de 19, uno vacío): `--aplicar` trae solo la ficha y `--traer` sale 3 con ❌ hooks y ❌ arranque, que la ficha dice que no vienen. El vacío no sugiere `--nuevo`; el anexo no le dice a la sesión qué hacer | `--verificar` en los seis | `--verificar` no pide lo que la ficha dice `no`; `--mirar` en un repo sin commits sugiere `--nuevo`; el anexo dice qué prender (lo base, como `--nuevo`) |
| b6 | **`carpeta-docs:` sin dónde**: el mensaje dice *"escribí carpeta-docs: <otra> en la propuesta"* y no que va en el primer nivel; en `vars:` no vale y `--aplicar` se niega igual | el banco la puso primero en `vars:` | El texto: *"…en el primer nivel de la propuesta, arriba de vars:"* |
| b7 | **Lo recomendado de la adopción "falla en barreras"**: con `--permisos recomendada`, el tercer commit falla en barreras y se sube igual (el texto lo explica); en las de solo ficha también. El dueño lee "falla" en lo que se le recomendó | 17 de 19 adopciones con `barreras` en 1 | Que la línea lo diga como esperado (*"el commit de los permisos va sin sello: lo cubre tu OK de la adopción"*) o que la adopción selle ese commit |
| b8 | **`/inicio` nombra commits por su código** al dueño (4 de 17) | *"El último commit es `4e3c04c`…"*; `NUCLEO.md:60`: "sin códigos sueltos" | Un renglón en `/inicio`: el último trabajo por lo que hizo, nunca por su código |
| b9 | **El director narra en inglés** algunos renglones de la noche (*"Now the handover note…"*) | la charla del director de la noche | `NUCLEO.md:60` ya lo pide: el renglón de la narración en el director, o un caso en `habla.test` |
| b11 | **El lint del proyecto choca con los archivos del kit** (299 errores en `.claude/`): la adopción no los suma a lo que ignora el linter | el parte de la noche 2 | `--mirar` ve el linter (`eslint.config.*`, `.eslintignore`, `biome.json`…) y propone ignorar `.claude/` y `.githooks/` en el mismo OK |
| b12 | **Un freno niega por una palabra en el texto** ("supabase" dentro de lo que se escribía, no en el comando) | el parte de la noche 2 (NO VERIFICADO cuál freno) | Reproducirlo con su caso; es de la parte 6 de la `rc.7` (frenos que no niegan lo inocente) |
| b13 | **Un freno dio por rota la línea `publicar` de la ficha** (`autorizado.publicar` con la forma de llaves `{comando, humo, volver}`, la de R2) | el parte de la noche 2 (NO VERIFICADO cuál) | Reproducirlo: si la forma de llaves no se lee en algún lado, es un bug de la ficha |
| b10 | **"Te necesito" corta el renglón a mitad de frase**: *"…verificar da la línea 3 (pruebas) en NO VERIFICADO porque la · una decisión tuya"* | `/estado` de la mañana | Cortar en el último punto o coma antes del tope, no en una palabra (de la familia de c15 y c21) |

### Visto también (ya estaba en R2)

- **G1** (la flota deja mezclado un repo con un script del kit tocado a mano): lo predice la comparación de `.claude/scripts/` de los
  7 repos con kit contra el molde de la `rc.6`: **solo 1 de 7 tiene uno tocado** (el de R2); otro tiene scripts propios, que no
  cuentan. La flota no llegó a mezclar ninguno (abajo, "no medido").
- **G4** (el permiso ancho que frena el cierre, sin aviso de día): `Bash(git pull:*)` está en **13 de los 26** repos (en 9 de los
  adoptados, porque `--permisos recomendada` deja lo que el molde v2 traía). El `doctor` dice *"todo bien"* y `--verificar` *"el repo
  quedó andando"* con ese permiso puesto. **Y en la noche 2 pasó igual que en R2**: módulo integrado, cierre negado, nada publicado.
  El arreglo de R2 (avisarlo de día y achicar lo que frena) alcanza; sumarle que **la opción recomendada de la adopción no deje ese
  permiso** (o lo deje en la forma exacta que la lista acepta).
- **G3** (la firma que nadie ve): en la noche 2, el director propuso el cambio en su rama, después de integrar, sin `--en-defecto`;
  `/estado` en la carpeta principal dice *"TE NECESITO: nada"*. Va con el arreglo de G3 y con c18.
- **G5** (*"LO QUE SE HIZO: nada"* a la mañana): reproducido en la noche 2, en un repo que no es Deptos.
- **c15/c21** (el filtro que deja frases rotas): una forma nueva, el corte a mitad de frase (b10).
- **c3** (`gh auth login` en una PC nueva): la línea de preparar la PC, igual.
- **c5** (lo que trae "preparame" queda a medias): el `doctor` de esa corrida cuenta *"1 repo"* y `autoMode` *"ningún entorno"*,
  antes de traer los 25.
- **c16** (la línea 7 ROTA por tiempo con la PC cargada): **dos de dos** flotas que llegaron a esa línea, con 30 y con 60 min.
- **c17** (las carpetas clonadas no son "de confianza"): todas las sesiones del banco.

## Los 20 criterios

Los de R2 siguen como estaban (9 de 20). El banco suma evidencia a estos:

| # | Criterio | ¿Se tilda? | Evidencia, o lo que falta |
|---|---|---|---|
| 2 | El tamaño del pedido en una línea | ya ✅ (más evidencia) | 17 de 17 sesiones de mentira, en repos que no son de juguete: *"Chico, lo hago acá."* como primer renglón |
| 10 | Adoptar un repo viejo con un OK | **No** | Con lo recomendado y una ronda de preguntas, **12 de 19** quedan andando (`--traer` 0). Pero 6 quedan con ❌ (b5), 1 no adopta (b4), y en los 13 sin `comando-test` el primer módulo y la primera noche no andan (B1). Y "con un OK" es la pantalla con el dueño, que el banco no hace. Se tilda en 5c si la `rc.8` arregla B1, b4 y b5 |
| 6 | `/cierre` encuentra lo suelto | **No** | Ningún `/cierre` en el banco: los pedidos chicos quedaron sin commitear, como dijeron |
| 15 | Lo `sensible:` pregunta solo en su paso | **No** | Ningún encargo tocó nada sensible (las noches eran de papeles y de una prueba) |
| 19 | Una migración a `real` sin veredicto no corre | **No** | Sin migraciones |
| 8 | El director no escribe ante un aviso; rojo → nunca merge | ya ✅ (más evidencia) | Noche 1: con la línea de pruebas en NO VERIFICADO, **no mezcló ninguno** de los tres; noche 2: mezcló cada uno después de las seis líneas |
| 7 | Sin pop-up ante lo AUTORIZADO | **No** (igual que R2) | Obreros de fondo sin ventana en las dos noches; la segunda mitad (de noche, PARADA) no la tocó nadie |

## Lo que el banco no midió

- **La flota mezclando de verdad**: de los 7 repos con kit, 4 salteados por obra viva, 2 ROTA por tiempo y 1 cortado por mí. G1 se
  midió por comparación de archivos, no por una flota que mezcle. Para 5c: la flota con `--con-obra` en uno salteado, y con la PC
  sola (la línea 7 necesita ~30 min sin nada más corriendo).
- **Las pruebas propias de los repos**: solo una (la que hizo falta para la noche). La primera instalación no terminó en 20 min con
  la PC cargada; la segunda, sola, en 5.
- **La pantalla de la adopción con el dueño** (lo de "con un OK"): el banco contestó a lo seguro y lo contó.
- **Las sesiones como en la vida real**: `claude -p` de fondo, en carpetas que no son "de confianza" (c17), con el login y las
  skills del `~/.claude` real (la `rc.7`, la misma del tag).
- **Un repo que se usó entero, en una noche**: el que se usó más, en el banco, tiene un `comando-test` que espera la integración
  continua de GitHub (`ci-verde --esperar`), que en una copia no existe: su noche no se puede probar acá sin un `gh` de mentira para
  eso. La noche de un repo usado entero es la de R2 (Deptos, la misma `rc.7`).
- **La firma y la autorización de la PC**: andamio (la lib y `KIT_HOME_PC`), como en R2.
