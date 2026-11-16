# SPEC delta: paquete 8e — la `rc.8`: todo corregido antes de la `v3.0` — vibe-kit

La `rc.8` no trae nada nuevo: arregla lo que encontraron la revisión integral de la `rc.7`
([`REVISION-INTEGRAL-rc7.md`](REVISION-INTEGRAL-rc7.md): G1-G5, c1-c21) y el banco de prueba ([`BANCO-rc7.md`](BANCO-rc7.md): B1,
B2, b1-b13), más lo que R2 dejó suelto. Cada arreglo es una función o una regla, con su prueba. Es la sesión 5b del tramo final
([`TRAMO-FINAL-PLAN.md`](TRAMO-FINAL-PLAN.md)).

- Estado: ✅ IMPLEMENTADO 2026-11-15: tag `v3.0.0-rc.8`. Sin sello del dueño: es un delta de arreglos (ADR-034, `docs/CICLO-DE-MEJORA.md` §7).
- Fecha: 2026-11-15 · Misión: 5, tramo final, sesión 5b · Decide y escribe: Fable 5.2; red team y revisor frío: Opus.
- **Nivel de la `rc`: MEDIO-ALTO** (§7 del ciclo): tres cambios tocan un freno o el actualizador (G1, G4, B1). El red team, una
  ronda, **solo** sobre esos tres; la mutación, solo en las reglas que cambian (G4 y B1). Lo demás, medio o liviano.
- **Base**: el tag `v3.0.0-rc.7`.
- **Fuera de alcance**: nada de diseño. Lo que pedía rediseñar va a la `v3.1` con su razón (abajo, "A la v3.1"); lo que es de los
  manuales (`manuales/`, `GUIA-DE-USO.md`) lo escribe la sesión 6, que es la dueña de esos archivos (abajo, "Para la sesión 6").

## Resumen para el director

1. **Hecho: el tag `v3.0.0-rc.8`** (commit `0332c92`, en `origin`), después de la suite; `kit-sync` LIMPIO, con el aviso de los hooks.
2. **Entró todo lo grande**: G1 a G5, B1 y B2, cada uno con su prueba. Y los chicos c2 a c9, c15 a c21, b2 a b8, b10 y b11.
3. **Red team** (Opus, sobre G1, G4 y B1): 7 hallazgos, 5 arreglados; dos eran altos (sacar el `comando-test` sin firma; el
   `pull` del cierre siguiendo una rama cambiada). **Revisor frío**: 12, 11 arreglados. **Mutación**: 28 de 28 muertos.
4. **La suite entera**: 3.264 de 3.265. La que falló es la prueba de tiempo de `cambios-flota`, por la PC cargada (con el código
   de la `rc.7` tarda igual); con la PC libre pasa, 20 de 20. **La flota de prueba**: mezclados y después al día, salida 0.
5. **El banco, vuelta 1, reducida**: preparar la PC anduvo; **17 de 18 adopciones quedan andando** (eran 12 de 19) y la otra se
   niega diciendo por qué; en la copia más usada, G1 deja el repo **entero en la versión vieja** con `te espera`. Lo real, sin tocar.
6. **El banco encontró una cosa más y se arregló**: con un módulo vivo, un renglón mandaba a mezclar la rama que no se mezcla.
7. **No se corrió** (es de la 5c): sesiones, noches, instalaciones, la flota de las otras seis copias con kit y, en la copia, el
   paso "resolver y volver a correr". Después de la suite entraron tres cambios chicos: se probaron sus archivos, no la suite.
8. **A la v3.1, con su razón**: b1, b9, el chequeo de identidad en el `doctor`, el checklist de "me voy", que la flota pregunte
   en el momento. **Para la sesión 6**: c1, c9 a c14 y c4 en `ROLES.md`. **Para el tracker**: b12 no es del kit; b13 es B2.
9. **Espera a Guido**: correr "instalar hooks por PC" (siguen en la `rc.6`), antes de la 5c. Y una decisión suya, anotada sin
   tocar: si *cambiar* el `comando-test` tiene que pedir su firma (hoy la pide solo sacarlo).

## Las decisiones de esta sesión (técnicas, ADR-034)

1. **G1 no se arregla con el guardia por archivo** que proponía R2. Lo medí con el archivo real: la mezcla del renglón tocado a mano
   en Deptos **choca de verdad** (`600000` contra `T_PUSH_INTEGRAR`), así que "lo tuyo ya es igual a lo nuevo" no se puede decidir
   por texto, y la regla del dueño es que la mezcla que choca nunca se resuelve sola (SPEC-paquete-8r §3). Actualizar 12 de 13
   scripts y dejar uno viejo es el mismo problema en chico (el `worktree.cjs` de la `rc.6` no tiene `limpiar`). Lo que se arregla es
   **en qué estado queda el repo mientras espera**: entero en la versión vieja, no a medias.
2. **G4: `Bash(git pull:*)` pasa a ser un permiso ancho aceptado**, y lo peligroso se niega en el freno, no en la lista. Lo medí en
   las 19 copias del banco con settings: es el **único** permiso ancho que aparece (13 repos), y también el único en la carpeta real
   de Deptos con el settings de esta PC. De fondo, `git-seguro` ya niega `--upload-pack`, `--receive-pack`, `--exec` y `--output`;
   se suma que **en la sesión de cierre** `git pull` solo trae de `origin` y de la rama por defecto.
3. **G2: además del estado del encargo, `cerrar` no toca una carpeta en uso** (en Windows, una sesión parada adentro). Así el cierre
   de la noche deja sola la carpeta del director, sin una bandera nueva, y la cierra el `/estado` de la mañana.
4. **B1: una sola regla, en `ficha.cjs`** (`sinComandoTest`), que leen los tres lugares (y un cuarto que el banco no llegó a ver: el
   gate de `integrar`, `worktree.cjs:1102`).
5. **B2: `kit-sync` avisa y no cambia su salida.** Los hooks de la PC los instala otro paso, que es del dueño; si `kit-sync` diera
   SUCIO, ningún `/cierre` de vibe-kit pasaría hasta que Guido lo corra.
6. **c18 se arregla con texto** (el relevo va antes de `integrar`, y el mensaje de `cierre` dice qué hacer). Aceptar commits de
   papeles encima del merge deja una rama de módulo que nunca se cierra.

## La lista entera

Nivel: L liviano · M medio · MA medio-alto. "Freno": si el cambio decide algo que un freno niega o deja pasar.

### Los grandes

| # | Origen | El arreglo quirúrgico | Archivos | Prueba | Freno · Nivel |
|---|---|---|---|---|---|
| G1 | R2 | (a) La flota **no mezcla** si después de aplicar queda esperando una pieza de **las que las skills llaman** (`scripts`, `candado`, `cambios-metodo`: todo lo de `.claude/scripts/`), salvo que espere porque el dueño ya eligió quedarse con la suya: sube `kit/<tag>` con el informe y la marca `kit: ESPERA`, la fila dice `te espera` y el repo queda entero en la versión vieja. Las demás piezas siguen como hoy (un hook que espera: criterio 18 del paquete 6; `hooks-lib`: su camino de la `rc.6`). (b) `resolver <pieza> nueva` sin informe vale también sobre una pieza `molde` o `molde+propio` con un archivo tocado: vuelve a la del molde de su versión, y la flota siguiente la actualiza limpia. (c) Una mezcla de tres vías **limpia cuyo resultado es igual a lo nuevo** (lo tocado a mano ya está en el kit) se toma sola, sin porqué. (d) El anexo de la flota dice qué hace la sesión con esa fila. | `lib/flota.cjs`, `actualizar.cjs`, `lib/fusion.cjs`, `anexos/flota.md` | `flota.test` (un repo con un renglón cambiado en `worktree.cjs` que choca → `te espera`, la rama por defecto sin tocar), `actualizar.test` (`resolver nueva` sobre `molde`; la mezcla limpia igual a lo nuevo) | No (actualizador) · MA |
| G2 | R2 | `limpiar` cierra un encargo solo si `estadoEncargo` dice `cerrado`, y un módulo solo si la punta de su rama es el segundo padre de un merge `integrar: módulo <x>` de la rama por defecto. Una rama sin commits propios no se toca. Y `cerrar` no borra una carpeta en uso (Windows: prueba de renombre; si no se deja, "hay una sesión adentro") | `scripts/worktree.cjs` | `worktree.test` (recién creada → queda; encargo en obra → queda; integrado → cierra; en uso → queda entera) | No · M |
| G3 | R2, banco | `deCambios` lee también los `propuesto` de la rama por defecto de origin (`ls-tree` + `show`), sin repetir. `/estado` paso 3, con rol director: la ruta de la carpeta principal y después `traer-main`. `/director`: el cambio de freno va con `--en-defecto` y se pide la firma ahí. `MOTIVOS.ruta` dice la ruta buena | `lib/espera.cjs`, `skills/estado`, `skills/director`, `hooks/niega-aprobar.cjs` (solo el texto) | `espera.test` (desde un worktree de director), `skills.test` | No (el freno no cambia qué niega) · M |
| G4 | R2, banco | (1) `Bash(git pull:*)` entra en las anchas aceptadas del cierre. (2) `git-seguro`, caso `pull-del-cierre`: en la sesión de cierre (`KIT_FONDO` y `KIT_CIERRE_ID`), `git pull` solo de `origin` y de la rama por defecto, con las opciones de una lista y sin `-c` ni `-C`; sin rama, solo si la rama por defecto sigue a la de origin. (3) De día: `adoptar --verificar` corre el mismo `loQueSobra` sobre los settings del proyecto y lo avisa (`verificar · noche · ⚠`); el `doctor` no, porque el permiso es del proyecto y no de la PC. (4) El mensaje de `cierre` dice que sacarlo es un cambio de freno y cuál es la forma angosta que vale | `scripts/noche.cjs`, `hooks/git-seguro.cjs`, `lib/chequeo.cjs` | `noche.test` (con `git pull:*` → lanza; con `Bash(git:*)` → no), `git-seguro.test` (pull de otro remoto en el cierre → niega; `--ff-only` → pasa) | **Sí** · MA, red team y mutación |
| G5 | R2, banco | `LO QUE SE HIZO` recorre también los módulos que no están activos y tienen encargos cerrados en las últimas 24 h (se miran solo los que tuvieron un commit en ese plazo). `EL PLAN` y `LO QUE FALTA`, solo los activos | `scripts/estado.cjs` | `estado.test` (un módulo en COMPLETO con un encargo de hace 1 h) | No · M |
| B1 | banco, red team | `ficha.sinComandoTest(datos, día)`: sin `comando-test` es legítimo solo si la ficha lo dice (nivel `liviano`, o `gate:entorno-prueba` quitado y vigente). Con eso, la línea 3 de `verificar`, el gate de `integrar` y la línea 8 de la flota dan ✅ `sin comando-test (<razón>)`; sin eso, siguen ❌. La adopción, si no encuentra un `comando-test`, lo pregunta en su mismo OK (`D5`). Y sacar `vars.comando-test` de la ficha pasa a ser barrera (red team, 1) | `lib/ficha.cjs` (y sus dos copias), `lib/cambios.cjs` (y su copia), `scripts/encargo.cjs`, `scripts/worktree.cjs`, `lib/chequeo.cjs`, `lib/adoptar.cjs`, `anexos/flota.md` | `ficha.test`, `cambios.test`, `encargo.test`, `worktree.test`, `chequeo.test` | **Sí** · MA, red team y mutación |
| B2 | banco | `kit-sync.sh` compara `~/.claude/hooks/kit/INSTALADO` con `kit/VERSION` y lo dice (`⚠️ … falta: instalar hooks por PC`), sin cambiar su salida. El "actualizate" del Equipador no cambia: va por `preparar-pc.cjs`, que ya instala los hooks de la PC; el hueco era solo de este repo, que sincroniza con `kit-sync` | `.claude/scripts/kit-sync.sh` | a mano, en esta PC (hoy tiene que avisar) | No · L |

### Los chicos que entran

| # | El arreglo | Archivos | Nivel |
|---|---|---|---|
| c2 | "Falta tu autorización para publicar" pasa a `decisión` y dice cómo darla ("decime: preparame esta PC"); `dePublicacion` lo descarta si la PC ya está autorizada con la huella de hoy | `scripts/noche.cjs`, `lib/espera.cjs` | M |
| c3 | La sesión que prepara la PC mira la identidad de git y, si falta, pregunta nombre y mail y los escribe ella; lo que falte instalar lo instala con el OK del dueño. `INSTALAR.md` ya no manda a tipear. (Texto; un chequeo nuevo en el `doctor` cambia su cuenta fija: a la `v3.1`) | `preparar-pc.md`, `INSTALAR.md` | L |
| c4 | Los textos que mandaban al dueño a la terminal (`NUCLEO.md`, `modo-b.md`, `flota.md`, `arquitecto-skills/SKILL.md`, `lib/flota.cjs` "mezclá … vos"). **Se deja** `modo-b.md:67`: es la línea con la que el dueño abre la sesión del director (lo único que hace él), la da `worktree.cjs` y la fija una prueba (RF-fix 10) | los cinco | L |
| c5 | Después de traer repos, "preparame esta PC" vuelve a armar su plan (así los traídos entran en las preguntas); la lista, de a 30 | `preparar-pc.md`, `scripts/traer-repos.cjs` | L |
| c6 | El `SKILL.md` del Equipador dice lo mismo que su anexo en la adopción; el repo sin remoto tiene su camino | `arquitecto-skills/SKILL.md`, `anexos/flota.md` | L |
| c7 | `/inicio` y `/estado` llaman `volvi --al-mirar`: de noche (20 a 6) no apaga la marca y lo dice; "volví" la apaga siempre | `scripts/noche.cjs`, `skills/inicio`, `skills/estado` | M |
| c8 | El escape de la regex de `espera.cjs:242` | `lib/espera.cjs` | L |
| c9 | `modo-a.md:68` (el `kit-frenos.log` no se commitea) | `anexos/modo-a.md` | L |
| c15, c21, b10 | El filtro de lo que lee el dueño: un código pasa a "un código" (no se borra), un comando corto entre comillas queda como nombre, y el corte del renglón va en el último punto o coma | `lib/espera.cjs`, `scripts/noche.cjs` | M |
| b8 | `/inicio` pide el último commit sin su código (`--format='%s (%cr)'`): la sesión no tiene de dónde nombrarlo | `skills/inicio` | L |
| c16 | Una línea de la flota que se pasa de tiempo se repite una vez; si vuelve a pasarse dice "no pude probar (la PC estaba cargada)" | `lib/chequeo.cjs` | M |
| c17 | Lo que trae "preparame esta PC" avisa que cada repo pide abrir una sesión ahí una vez (la carpeta todavía no es de confianza) | `scripts/traer-repos.cjs` | L |
| c18 | El paso 9 del director: el relevo, antes de `integrar`; `cierre` dice "integrá de nuevo" | `skills/director`, `scripts/noche.cjs` | L |
| c19 | "Las carpetas limpias" del parte sale de lo que dijo `limpiar` | `scripts/noche.cjs` | M |
| c20 | `fichas()` lee el disco cuando el checkout está parado en la rama del módulo o en un obrero suyo (reproducido: el resumen del obrero de cierre listaba como pendientes las tareas que él acababa de tildar) | `scripts/estado.cjs` | M |
| b2 | `traer-repos` avisa qué programa falta para el `comando-setup` de cada repo | `scripts/traer-repos.cjs` | M |
| b3 | `-c core.longpaths=true` en el clon de la adopción | `anexos/flota.md` | L |
| b4 | `--mirar` avisa si `.claude` está ignorado y propone la excepción; `--traer` sale distinto de 0 sin ficha | `lib/adoptar.cjs` | M |
| b5 | `--verificar` no pide lo que la ficha dice `no`; `--mirar` en un repo sin commits sugiere `--nuevo` | `lib/chequeo.cjs`, `lib/adoptar.cjs` | M |
| b6 | El mensaje de `carpeta-docs:` dice dónde va | `lib/adoptar.cjs` | L |
| b7 | Las líneas de la adopción que anuncian la falla de `barreras` (el commit de la ficha y el de los permisos) dicen además que es lo esperado con lo que el dueño eligió, y que a él se le dice que van con su OK de la adopción. La explicación de por qué falla no se toca (la fijó el red team 8r3) | `lib/adoptar.cjs` | L |
| b11 | `--mirar` ve el linter del proyecto y dice que `.claude/` y `.githooks/` van a lo que ignora | `lib/adoptar.cjs` | M |
| b12, b13 | Se reproducen primero (un lector Opus); el arreglo, según lo que salga | (abajo, "Lo que dio la investigación") | — |
| suelto | `git-seguro.test` "4.7 caso 1": la razón del salteo | `hooks/git-seguro.test.cjs` | L |
| suelto | La nota de `frenos.log`: la forma que anda en la `rc.6` y en la `rc.7` | `kit/CHANGELOG.md` | L |

### Para la sesión 6 (son de `manuales/` y de la guía: solo texto)

c1 (la guía: "si hiciste algo chico de día, la noche te pregunta antes de publicar") · c9 (`MOLDE.md` §3 y `SCRIPTS.md`: una línea
de `kit-frenos.log`) · c10 (`--traer` prende los githooks, en `MOLDE.md:10` y `COMO-USAR-EL-ARQUITECTO.md:78`) · c11 (`ROLES.md:140`:
las líneas propias salen en la vista del director, no en la del dueño) · c12 (el manual del Arquitecto con lo de la `rc.7`) · c13
(`SCRIPTS.md:139`) · c14 (rojo/verde y un comando en `EQUIPADOR.md`, `COMO-USAR-EL-ARQUITECTO.md` y `GUIA-DE-USO.md`) · c4 en
`ROLES.md:42`.

### A la v3.1 (con su razón)

- **c1, el fondo**: que `publicar` acepte lo que ya estaba en origin antes de `cierre-empieza`. Es la red de rt-1 / r2-6: cambiarla
  es diseño.
- **b1** (la flota saltea los repos con ramas de módulo vivas): es la regla que pidió el dueño ("con obra, la opción es mía", 2026-11-04) y la fila ya recomienda `--con-obra`. Decir cuáles ramas parecen muertas y ofrecer borrarlas es una pantalla nueva.
- **El checklist de "me voy" en criollo y el renglón de que la PC no se suspenda** (la mitad de c7): es texto que el director le muestra al dueño tal cual; reescribirlo pide probarlo en una noche.
- **c3, el chequeo en el `doctor`**: su cuenta de chequeos es fija en las pruebas y en el manual.
- **b9** (el director narra en inglés algunos renglones): la regla ya está escrita en el núcleo y en el `CLAUDE.md`; lo que falta es
  medir por qué no se cumple, y `/director` está a pocos bytes de su tope.
- **G1, que la flota pregunte en el momento** (una bandera para resolver la pieza en la misma corrida): es una entrada nueva del
  actualizador. Con (a) y (b) el camino existe y el repo no se rompe.
- **El guardia por archivo** (R2, G1.1): descartado arriba, decisión 1.

## Criterios de aceptación

1. Un repo con un script del kit tocado a mano que choca: la flota lo deja **entero en la versión vieja**, con `te espera` y el
   informe en `kit/<tag>`; después de `resolver <pieza> nueva`, la flota siguiente lo mezcla.
2. `worktree crear foo` y `limpiar` enseguida: la carpeta y la rama siguen.
3. Un cambio de freno propuesto con `--en-defecto` sale en "Te necesito" desde la pestaña del director sin `pull`.
4. Con `Bash(git pull:*)` en el settings del proyecto, `noche.cjs cierre` lanza el cierre; en esa sesión, `git pull` de otro remoto
   se niega.
5. A la mañana, después de una noche que terminó un módulo, `LO QUE SE HIZO` lo lista.
6. Un repo sin `comando-test` con el gate quitado en la ficha: `verificar` mezcla, `integrar` pasa y la flota no lo deja ROTA; sin
   el gate quitado, las tres siguen negando.
7. `kit-sync` avisa cuando los hooks de la PC no son de la versión del kit.
8. La suite entera pasa; la flota de prueba y el banco, vuelta 1, sin nada peor que en la `rc.7`.

## Lo que dio la investigación

Dos lectores Opus, solo lectura, reprodujeron lo que R2 y el banco habían dejado NO VERIFICADO. Lo que traen es dato; lo que
afirmo abajo lo miré en el archivo o lo corrí.

- **c20, reproducido: es un bug del kit.** `fichas()` de `estado.cjs` tiraba la ficha del disco y leía la de la punta de
  `modulo/<x>` también cuando el resumen corría parado en esa rama o en la de un obrero suyo. El obrero de cierre de tramo tilda
  las tareas y, antes de que el director lo mezcle, corre el resumen: salían como pendientes. Arreglado (c20 en la tabla), con su
  prueba.
- **b12, reproducido: no es un freno del kit.** El que negó por la palabra es un hook propio del repo de esa noche, que parte el
  texto del comando por renglones y toma cada renglón de un heredoc como un comando. Los frenos del kit no tienen ese problema:
  ningún hook del kit nombra esa palabra y el parser del kit (`lib/comando.cjs`) deja el cuerpo de un heredoc citado como texto.
  **No se arregla acá** (la madre no se mete en los otros repos): va al tracker como nota para ese proyecto.
- **b13, reproducido: es B2 otra vez.** El que dio por rota la línea `publicar` fue el corrector **de la PC**, que en esta PC es el
  de la `rc.6`: su `ficha.cjs` pide que todo `autorizado.*` sea un texto, y la forma de llaves es de la `rc.7`. La ficha y el
  parser del repo están bien. Se va solo cuando Guido corra "instalar hooks por PC". De paso: **el banco usa el `~/.claude` real
  para entrar**, así que hereda esos hooks viejos y eso contamina lo que mide; conviene que la 5c corra después de ese paso.
- **`git-seguro.test` "4.7 caso 1"**: se salteaba porque buscaba `git-seguro.cjs` registrado en el settings, y desde la `rc.7` el
  settings registra el portero, que lo carga adentro. La razón del salteo ("todavía no está registrado") ya no valía, y lo que
  cuidaba ese caso lo cubre `settings.test.cjs` (un solo hook, el portero, con su plazo y `onFailure: block`). Se borra el caso.

## El red team (una ronda, Opus, solo sobre G4, B1 y G1)

Siete hallazgos. Los verifiqué en el código antes de tocar nada.

| # | Qué encontró | Qué se hizo |
|---|---|---|
| 1 · ALTO · B1 | Un agente podía **borrar `vars.comando-test`** de la ficha en su rama sin firma de nadie (la barrera de la ficha no miraba `vars`). Con el gate quitado o en nivel liviano, `integrar` subía el módulo sin probar | **Arreglado**: sacar `comando-test` (o dejarlo vacío) es barrera, id `vars:comando-test`, en frenos (`lib/cambios.cjs`, `idsFicha`). Ponerlo o cambiarlo no cuenta. Con su prueba |
| 2 · ALTO · G4 | `git pull` sin rama trae **lo que diga el seguimiento** de la rama, y eso lo cambia cualquiera con `git branch --set-upstream-to`: de día se apunta a una rama sin revisar y a la noche el `git pull --ff-only` del cierre la trae a la carpeta principal. Ya estaba en la `rc.7`; G4 decía cubrirlo | **Arreglado**: en la sesión de cierre, el `pull` sin rama vale solo parado en la rama por defecto y con ella siguiendo a `origin/<defecto>`; si no, se niega. Con la rama dicha (`origin <defecto>`), el seguimiento no cuenta |
| 3 · MEDIO · G4 | El freno miraba solo los posicionales: `--recurse-submodules` (baja código de otras direcciones) y `--strategy=<x>` pasaban | **Arreglado**: las opciones van por lista de las que valen (`--ff-only`, `--rebase`, `--no-rebase`, `-q`, `--quiet`, `--no-edit`, `--no-stat`); otra, negada |
| 4 · MEDIO · G1 | La lista de piezas que frenan la mezcla (`scripts`, `candado`, `cambios-metodo`) era más corta que la que decía este delta | **El delta estaba mal, no el código**: quedan esas tres, que son las que las skills llaman. Un hook que espera ya tiene su decisión (SPEC-paquete-6, criterio 18: lo demás se mezcla) y `hooks-lib` su camino (8c h12 y la línea 7). Corregida la fila G1 |
| 5 · MEDIO · G1 | Con la marca ESPERA, el dueño que quería quedarse con lo suyo no tenía camino (el informe queda solo en `kit/<tag>`), y si lo elegía el repo no avanzaba nunca | **Arreglado**: una pieza que espera porque el dueño ya contestó "me quedo con la mía" no frena la mezcla (`fusionDe` las separa); el anexo dice cómo traer el informe para mezclar a mano o quedarse |
| 6 · BAJO · G1 | La marca ESPERA se reconoce por el asunto del commit | **Se deja**: un agente no puede subir a `kit/*` (lo niega `push-otra-rama`), y si el dueño commitea encima la rama pasa a `salteado` |
| 7 · BAJO · G4 | El `pull` del cierre no miraba `-c`, `-C`, `--git-dir` ni `--work-tree` | **Arreglado**: negado con cualquiera de los cuatro |

Lo que el red team probó y encontró cubierto: `Bash(git:*)`, un `Bash` pelado y las formas raras siguen frenando el cierre; pasar
de `estandar` a `liviano` y sumar el gate a `frenos.quitados` ya eran barrera; la regla "limpia e igual a lo nuevo" compara texto
exacto y no se traga una adaptación. **Queda anotado, sin tocar** (ya estaba en la `rc.7` y arreglarlo es diseño): *cambiar* el
`comando-test` por uno que no prueba nada no es barrera; pedir la firma del dueño en cada cambio de ese comando es una decisión suya.

## El revisor frío (Opus, todo el diff contra la `rc.7`)

Doce hallazgos, ninguno abre un freno. Las copias que tienen que ser idénticas lo son. Lo que traía lo verifiqué en el código.

| # | Qué encontró | Qué se hizo |
|---|---|---|
| 1 · MEDIO | `limpiar` cerraba un módulo solo con el asunto exacto `integrar: módulo <x>`: uno mergeado por un PR de GitHub o a mano quedaba para siempre, sin aviso | **Arreglado**: un módulo está cerrado si su punta entró a la rama por defecto **por un merge** (es ancestro y no está en su línea de primer padre). Una rama recién creada sí está en esa línea, y no se toca. Con su prueba |
| 2 · MEDIO | Los scripts nuevos llaman a `ficha.sinComandoTest` sin mirar si existe: con la lib de los hooks en una versión anterior (su pieza esperando) caían con un error | **Arreglado**: con `typeof`, y si no está se niega como antes |
| 3 · MEDIO | En la flota, el chequeo se miraba antes que la marca ESPERA: el estado a medias podía dar `ROTA` en vez de la pregunta | **Arreglado**: la marca ESPERA va primero; si además el chequeo falló, sus líneas viajan en el commit de la marca |
| 4 · MEDIO | "Te necesito" tapaba el disco con lo de origin: el dueño que firmó en su carpeta y no subió veía el pedido otra vez | **Arreglado**: con el cambio en los dos lados, espera solo si los dos dicen `propuesto`. Con su prueba |
| 5 · MEDIO | "Lo instala la sesión" chocaba con comandos que preguntan en pantalla | **Arreglado** (texto): las banderas que no preguntan, el código de GitHub lo copia el dueño, y después de instalar se sigue en una sesión nueva |
| 6 · MEDIO | `volvi --al-mirar` con la ventana fija de 20 a 6 apagaba la noche que empezó a las 18 | **Arreglado**: la marca queda también si se escribió hoy después de las 6; la borra la mañana siguiente o un "volví". Con su prueba |
| 7 · MEDIO | A la mañana `/estado` corre `limpiar` antes de la vista: sin las ramas y sin renglón en `tiempos.md`, el encargo no salía en `LO QUE SE HIZO` | **Arreglado**: "cuándo se cerró" sale también del commit que trajo su evidencia. Con una prueba que borra las ramas antes de mirar |
| 8 · BAJO | En `/estado`, `publicar --seguir` quedó pegado a la frase de la pestaña del director, donde se niega | **Arreglado** (texto): "solo en la carpeta principal" |
| 9 · BAJO | A la receta del anexo le faltaban el `git fetch`, de dónde sale el clon del kit y que con una pieza de frenos hay firma | **Arreglado** (texto) |
| 10 · BAJO | Nadie le decía al dueño que cierre la pestaña del director | **Arreglado**: el parte lo dice en la línea de las carpetas |
| 11 · BAJO | La carpeta de un encargo cancelado queda en `limpiar` | **Se deja**: la cierra el director con `cerrar --cancelado` (su paso 3); que `limpiar` cancele por su cuenta es otra regla |
| 12 · BAJO | Un error de la prueba de "en uso" tiraba abajo `limpiar` | **Arreglado**: va a "queda", con su motivo |

## Cómo se hizo y qué quedó

**Cada arreglo**, con su prueba primero (la vi fallar antes del cambio y pasar después), en commits chicos, con gitleaks sobre el
rango antes de cada push. Los que tocan un freno (G4, B1) y el actualizador (G1) pasaron por el red team; todo el diff, por el
revisor frío (arriba, las dos tablas).

- **Mutación** (solo en las reglas que cambian: el `pull` del cierre, `sinComandoTest` y la barrera `vars:comando-test`): 28
  mutantes, los 28 muertos. Uno sobrevivió en la primera pasada (el seguimiento de la rama): la prueba no lo cubría y se corrigió.
- **La suite entera**, sola y en segundo plano, en `023baa4`: **3.265 casos, 3.264 pasaron, 1 falló, ninguno salteado** (91 min; en
  la `rc.7` eran 65: la PC tenía ~900 MB de memoria libre y varias sesiones abiertas). El que falló es `cambios-flota.test` "en
  menos de 5 s" (6.295 ms), **el mismo que falló bajo carga en la suite de la `rc.7`**. Esta vez tampoco pasa solo (5,6 a 6,2 s), y
  **no es de la `rc.8`**: con el código de la `rc.7` sacado a una carpeta aparte y corrido en el mismo momento tarda lo mismo
  (5.580 y 5.763 ms contra 5.579 y 5.640). Lo que mide es la PC: hoy cada llamada a `git` tarda ~200 ms. No se tocó ni la prueba
  ni el código. **Con la PC libre, al final, pasa**: 2.070 y 2.252 ms, y su archivo entero, 20 de 20.
- **Después de la suite** entraron tres cambios chicos: dos textos que el repaso de la tabla contra el diff mostró sin hacer (b7
  y un renglón de `modo-b.md`, de c4) y el renglón de la flota que encontró el banco (abajo). **No se volvió a correr la suite
  entera**; se corrieron, de a uno, los archivos de prueba que los miran: `flota.test` (los 9 casos de G1, de módulos con obra y
  de rt-7: 9 de 9), `adoptar.test` entero (65 de 65) y las pruebas de los textos de las skills (138 de 138).
- **La flota de prueba** (`bash pruebas/rehacer.sh`: LISTO; `actualizar.cjs flota alfa beta gama` contra un canónico de prueba con
  el tag anotado `v3.0.0-rc.8`): primera vuelta, **mezclados los tres** (32 min); segunda, **al día los tres**; salida 0 en las dos.

### El banco, vuelta 1 (reducida)

Con una copia del script (`pruebas/banco/`), sobre las copias que dejó el banco de la `rc.7`, vueltas a como estaban antes de que
ese banco las tocara: 25 repos (18 sin kit, 7 con el kit en la `rc.6`). **Reducida, y esto es lo que no se corrió**: ninguna sesión
(`/inicio` y el pedido chico), ninguna noche, ninguna instalación (`pruebas`), y la flota sobre **una** de las siete copias con kit
(la más usada, que es donde R2 vio G1). Eso es de la 5c, el banco entero.

| Paso | `rc.7` (5a) | `rc.8` (esta vuelta) |
|---|---|---|
| "Preparame esta PC" trayendo los repos | anduvo | anduvo, salida 0; ahora avisa que las carpetas traídas no son de confianza todavía (c17) y manda a rearmar el plan (c5) |
| Adoptar los que no tienen kit, con lo recomendado | 12 de 19 quedan andando · 6 con ❌ en hooks y arranque (b5) · 1 no adopta y nadie lo dice (b4) | **17 de 18 quedan adoptados y verificados** · las 6 de "todo en no" pasan con un ⚠ que dice que la ficha lo eligió así · la que tiene `.claude` ignorado **se niega con el motivo y el camino** antes de escribir nada |
| La pregunta de las pruebas (B1) | no existía: 13 de 19 quedaban sin `comando-test` y sin aviso | sale en 10 de las 18 propuestas (`D5`); las 9 que se adoptaron sin contestarla quedan con el ⚠ de `verificar` que dice qué no va a poder hacer ese repo |
| El linter del proyecto (b11) | 299 errores en una noche | 2 propuestas lo avisan |
| `barreras` después de la adopción recomendada | 17 de 19 en 1, como falla | 15 de 17 en 1 (es lo esperado: b7 cambia cómo se dice, no el resultado) |
| La flota sobre la copia con scripts tocados a mano (G1) | la dejó a medias: scripts viejos con libs nuevas | **`te espera`: quedó entera en la `rc.6`**, la rama por defecto sin tocar, y `kit/v3.0.0-rc.8` con la marca `kit: ESPERA — scripts`, el informe y las nueve líneas del chequeo (30 min). Ocho líneas bien (la 7: 16 hooks cambiados, 26 archivos de pruebas del molde); la 8 falla por lo que ya dice la nota de la `rc.7` (una prueba propia de ese repo lee el registro viejo de frenos) |

**La segunda mitad del criterio 1** (resolver la pieza y que la flota siguiente mezcle) **no se corrió en la copia**: su línea 8
la dejaría `ROTA` por esa prueba propia, que es del repo y no del kit. Queda cubierta por `flota.test` ("8e G1": resuelta, la
corrida siguiente la rehace y mezcla).

**Lo que encontró esta vuelta y se arregló**: con `--con-obra` y un módulo vivo, debajo de "quedó entero" salía *"modulo/x:
primero mezclá kit/<tag> en main"*. Esa rama lleva la marca ESPERA: mezclarla es el repo a medias que G1 evita. Ahora dice
*"espera a lo de arriba (kit/<tag> lleva el informe y no se mezcla)"*, con su prueba (falló antes, pasa después).

**Lo inocuo**: la foto de las carpetas reales antes y después (`foto`, `comparar`): **ninguna cambió**, salvo vibe-kit mismo
(los archivos de esta sesión, en obra en ese momento). Todo push fue a los `bare` del scratchpad.

### Lo que queda

- **Espera a Guido**: correr "instalar hooks por PC" (los hooks de esta PC siguen en la `rc.6`; desde hoy `kit-sync` lo avisa).
  `kit-sync.sh sync` corrió bien acá: LIMPIO, con ese aviso.
- **Anotado, sin tocar (es decisión suya)**: *cambiar* el `comando-test` por uno que no prueba nada no es barrera (red team).
- **La prueba de tiempo de `cambios-flota`** depende de la PC: en una de 8 GB con sesiones abiertas no pasa, con este código ni con
  el de la `rc.7`. Si se quiere que la suite no dependa de eso, es cambiar un criterio del paquete 7 (medir contra lo que tarda
  `git` en esa PC): no lo decidí yo.
- **Para el tracker** (no son del kit): b12 (un hook propio del repo de esa noche) y b13 (es B2).
- **Para la 5c**: que corra después de "instalar hooks por PC" (si no, el banco hereda los hooks de la `rc.6` de esta PC); y la
  flota de las otras seis copias con kit, las sesiones y las noches, que esta vuelta no corrió.
