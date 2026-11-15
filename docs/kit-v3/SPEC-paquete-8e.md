# SPEC delta: paquete 8e — la `rc.8`: todo corregido antes de la `v3.0` — vibe-kit

La `rc.8` no trae nada nuevo: arregla lo que encontraron la revisión integral de la `rc.7`
([`REVISION-INTEGRAL-rc7.md`](REVISION-INTEGRAL-rc7.md): G1-G5, c1-c21) y el banco de prueba ([`BANCO-rc7.md`](BANCO-rc7.md): B1,
B2, b1-b13), más lo que R2 dejó suelto. Cada arreglo es una función o una regla, con su prueba. Es la sesión 5b del tramo final
([`TRAMO-FINAL-PLAN.md`](TRAMO-FINAL-PLAN.md)).

- Estado: EN OBRA (2026-11-15). Sin sello del dueño: es un delta de arreglos (ADR-034, `docs/CICLO-DE-MEJORA.md` §7).
- Fecha: 2026-11-15 · Misión: 5, tramo final, sesión 5b · Decide y escribe: Fable 5.2; red team y revisor frío: Opus.
- **Nivel de la `rc`: MEDIO-ALTO** (§7 del ciclo): tres cambios tocan un freno o el actualizador (G1, G4, B1). El red team, una
  ronda, **solo** sobre esos tres; la mutación, solo en las reglas que cambian (G4 y B1). Lo demás, medio o liviano.
- **Base**: el tag `v3.0.0-rc.7`.
- **Fuera de alcance**: nada de diseño. Lo que pedía rediseñar va a la `v3.1` con su razón (abajo, "A la v3.1"); lo que es de los
  manuales (`manuales/`, `GUIA-DE-USO.md`) lo escribe la sesión 6, que es la dueña de esos archivos (abajo, "Para la sesión 6").

## Resumen para el director

(se completa al cerrar la sesión)

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
| G1 | R2 | (a) La flota **no mezcla** si después de aplicar queda esperando una pieza de **código** del kit (`scripts`, `hooks-lib`, los hooks, `githooks`, `candado`, `cambios-metodo`): sube `kit/<tag>` con el informe, la fila dice `te espera` y el repo queda entero en la versión vieja. Las piezas de texto (skills) siguen como hoy. (b) `resolver <pieza> nueva` sin informe vale también sobre una pieza `molde` o `molde+propio` con un archivo tocado: vuelve a la del molde de su versión, y la flota siguiente la actualiza limpia. (c) Una mezcla de tres vías **limpia cuyo resultado es igual a lo nuevo** (lo tocado a mano ya está en el kit) se toma sola, sin porqué. (d) El anexo de la flota dice qué hace la sesión con esa fila. | `lib/flota.cjs`, `actualizar.cjs`, `lib/fusion.cjs`, `anexos/flota.md` | `flota.test` (un repo con un renglón cambiado en `worktree.cjs` que choca → `te espera`, la rama por defecto sin tocar), `actualizar.test` (`resolver nueva` sobre `molde`; la mezcla limpia igual a lo nuevo) | No (actualizador) · MA |
| G2 | R2 | `limpiar` cierra un encargo solo si `estadoEncargo` dice `cerrado`, y un módulo solo si la punta de su rama es el segundo padre de un merge `integrar: módulo <x>` de la rama por defecto. Una rama sin commits propios no se toca. Y `cerrar` no borra una carpeta en uso (Windows: prueba de renombre; si no se deja, "hay una sesión adentro") | `scripts/worktree.cjs` | `worktree.test` (recién creada → queda; encargo en obra → queda; integrado → cierra; en uso → queda entera) | No · M |
| G3 | R2, banco | `deCambios` lee también los `propuesto` de la rama por defecto de origin (`ls-tree` + `show`), sin repetir. `/estado` paso 3, con rol director: la ruta de la carpeta principal y después `traer-main`. `/director`: el cambio de freno va con `--en-defecto` y se pide la firma ahí. `MOTIVOS.ruta` dice la ruta buena | `lib/espera.cjs`, `skills/estado`, `skills/director`, `hooks/niega-aprobar.cjs` (solo el texto) | `espera.test` (desde un worktree de director), `skills.test` | No (el freno no cambia qué niega) · M |
| G4 | R2, banco | (1) `Bash(git pull:*)` entra en las anchas aceptadas del cierre. (2) `git-seguro`: en la sesión de cierre (`KIT_FONDO` y `KIT_CIERRE_ID`), `git pull` solo sin remoto o con `origin`, y sin rama o con la rama por defecto. (3) De día: el `doctor` y `adoptar --verificar` corren el mismo `loQueSobra` y lo avisan. (4) El mensaje de `cierre` dice la forma exacta que destraba | `scripts/noche.cjs`, `hooks/git-seguro.cjs`, `scripts/doctor.cjs`, `lib/chequeo.cjs` | `noche.test` (con `git pull:*` → lanza; con `Bash(git:*)` → no), `git-seguro.test` (pull de otro remoto en el cierre → niega; `--ff-only` → pasa) | **Sí** · MA, red team y mutación |
| G5 | R2, banco | `LO QUE SE HIZO` recorre también los módulos que no están activos y tienen encargos cerrados en las últimas 24 h (se miran solo los que tuvieron un commit en ese plazo). `EL PLAN` y `LO QUE FALTA`, solo los activos | `scripts/estado.cjs` | `estado.test` (un módulo en COMPLETO con un encargo de hace 1 h) | No · M |
| B1 | banco | `ficha.sinComandoTest(datos, día)`: sin `comando-test` es legítimo solo si la ficha lo dice (nivel `liviano`, o `gate:entorno-prueba` quitado y vigente). Con eso, la línea 3 de `verificar`, el gate de `integrar` y la línea 8 de la flota dan ✅ `sin comando-test (<razón>)`; sin eso, siguen ❌. La adopción, si no encuentra un `comando-test`, lo pregunta en su mismo OK | `lib/ficha.cjs` (y sus dos copias), `scripts/encargo.cjs`, `scripts/worktree.cjs`, `lib/chequeo.cjs`, `lib/adoptar.cjs`, `anexos/flota.md` | `ficha.test`, `encargo.test`, `worktree.test`, `chequeo.test`, `adoptar.test` | **Sí** · MA, red team y mutación |
| B2 | banco | `kit-sync.sh` compara `~/.claude/hooks/kit/INSTALADO` con `kit/VERSION` y lo dice (`⚠️ falta: instalar hooks por PC`), sin cambiar su salida. El "actualizate" del Equipador corre el `doctor` al final | `.claude/scripts/kit-sync.sh`, `arquitecto-skills/SKILL.md` | a mano, en esta PC (hoy tiene que avisar) | No · L |

### Los chicos que entran

| # | El arreglo | Archivos | Nivel |
|---|---|---|---|
| c2 | "Falta tu autorización para publicar" pasa a `decisión` y dice cómo darla ("decime: preparame esta PC"); `dePublicacion` lo descarta si la PC ya está autorizada con la huella de hoy | `scripts/noche.cjs`, `lib/espera.cjs` | M |
| c3 | El `doctor` mira la identidad de git (`user.name` y `user.email`); sin ella, lo dice y la sesión la escribe con el OK del dueño. `INSTALAR.md` ya no manda a tipear | `scripts/doctor.cjs`, `INSTALAR.md` | M |
| c4 | Los textos que mandaban al dueño a la terminal (`NUCLEO.md`, `modo-b.md`, `flota.md`, `arquitecto-skills/SKILL.md`, `lib/flota.cjs` "mezclá … vos") | los cinco | L |
| c5 | Después de traer repos, "preparame esta PC" vuelve a armar su plan (así los traídos entran en las preguntas); la lista, de a 30 | `preparar-pc.md`, `scripts/traer-repos.cjs` | L |
| c6 | El `SKILL.md` del Equipador dice lo mismo que su anexo en la adopción; el repo sin remoto tiene su camino | `arquitecto-skills/SKILL.md`, `anexos/flota.md` | L |
| c7 | `/inicio` y `/estado` llaman `volvi --al-mirar`: de noche (20 a 6) no apaga la marca y lo dice; "volví" la apaga siempre. El checklist de "me voy", en criollo, con el renglón de que la PC no se suspenda | `scripts/noche.cjs`, `skills/inicio`, `skills/estado` | M |
| c8 | El escape de la regex de `espera.cjs:242` | `lib/espera.cjs` | L |
| c9 | `modo-a.md:68` (el `kit-frenos.log` no se commitea) | `anexos/modo-a.md` | L |
| c15, c21, b10 | El filtro de lo que lee el dueño: un código pasa a "un código" (no se borra), un comando corto entre comillas queda como nombre, y el corte del renglón va en el último punto o coma | `lib/espera.cjs`, `scripts/noche.cjs` | M |
| c16 | Una línea de la flota que se pasa de tiempo se repite una vez; si vuelve a pasarse dice "no pude probar (la PC estaba cargada)" | `lib/chequeo.cjs` | M |
| c17 | Lo que trae "preparame esta PC" avisa que cada repo pide abrir una sesión ahí una vez (la carpeta todavía no es de confianza) | `scripts/traer-repos.cjs` | L |
| c18 | El paso 9 del director: el relevo, antes de `integrar`; `cierre` dice "integrá de nuevo" | `skills/director`, `scripts/noche.cjs` | L |
| c19 | "Las carpetas limpias" del parte sale de lo que dijo `limpiar` | `scripts/noche.cjs` | M |
| c20 | `fichas()` lee el disco cuando el checkout está parado en la rama del módulo o en un obrero suyo (reproducido: el resumen del obrero de cierre listaba como pendientes las tareas que él acababa de tildar) | `scripts/estado.cjs` | M |
| b1 | La fila `salteado` dice hace cuánto está quieta cada rama y recomienda `--con-obra` | `lib/flota.cjs` | L |
| b2 | `traer-repos` avisa qué programa falta para el `comando-setup` de cada repo | `scripts/traer-repos.cjs` | M |
| b3 | `-c core.longpaths=true` en el clon de la adopción | `anexos/flota.md` | L |
| b4 | `--mirar` avisa si `.claude` está ignorado y propone la excepción; `--traer` sale distinto de 0 sin ficha | `lib/adoptar.cjs` | M |
| b5 | `--verificar` no pide lo que la ficha dice `no`; `--mirar` en un repo sin commits sugiere `--nuevo` | `lib/chequeo.cjs`, `lib/adoptar.cjs` | M |
| b6 | El mensaje de `carpeta-docs:` dice dónde va | `lib/adoptar.cjs` | L |
| b7 | La línea del commit de los permisos lo dice como esperado, no como falla | `lib/adoptar.cjs` | L |
| b8 | `/inicio`: el último trabajo por lo que hizo, nunca por su código | `skills/inicio` | L |
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

(se completa cuando vuelvan los lectores)

## Cómo se hizo y qué quedó

(se completa al cerrar)
