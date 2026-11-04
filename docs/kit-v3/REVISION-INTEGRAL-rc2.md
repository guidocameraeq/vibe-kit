# Revisión integral de la rc.2 (R1b, la noche del 2026-11-03 al 04)

> La segunda revisión integral (ADR-034), sobre `v3.0.0-rc.2` (`c0ff1cd`), después de la tanda de correcciones D8r.1. Las mismas tres
> miradas que R1, con revisores Opus nuevos, sin contexto y solo lectura: (a) el día de Guido de punta a punta, **esta vez corriendo los
> scripts sobre un clon del Hermes real** (copias en el scratchpad; nada se tocó en `D:\Hermes` ni en `~/.claude/`); (b) la coherencia de
> las decisiones con el código y entre piezas; (c) la documentación contra el código. La corrió la sesión madre (por Remote Control no se
> abren sesiones). Regla de Guido para esta noche: **una sola vuelta de corrección**; lo chico se arregla y queda, lo de diseño se le deja
> para la mañana ("no hay que hacer 800 revisiones integrales").

## En una mirada

- **Lo que arregló D8r.1 está bien hecho**: el primer mensaje de la pestaña, la Tarea 0 en todas las piezas, `integrados`, `--claude-md`, la
  línea de `cambios aprobar` igual en todos lados, las copias byte a byte (11 de 11), 74 de 74 pruebas tocadas en verde. La mezcla que
  choca te pregunta, con un hueco (abajo, t1).
- **Adoptar Hermes anda**, probado sobre su clon: `adoptar`, las barreras, la migración de los 103 cambios, la flota con un `rc` nuevo
  contra una skill adaptada (sale "te espera").
- **El módulo *con el director del kit* en Hermes no sale solo**, por algo que R1 no podía ver sin el Hermes real: **Hermes ya tiene su
  propio director, `/inicio` y `/cierre`**. El kit los respeta (quedan como "propia") y entonces el Arquitecto arma un módulo sin director.
  Eso es una **decisión tuya** (D1, abajo). El resto se arregla esta noche.
- 20 hallazgos entre los tres (repetidos: quedan 17). **4 de diseño para vos**, el resto de taller y va a la tanda de esta noche (D8r.2).

## Para decidir con vos a la mañana (diseño)

| # | Qué pasa | Opciones | Recomendada |
|---|---|---|---|
| **D1** | **Hermes tiene su director (646 renglones), su `/inicio` y su `/cierre`.** Al adoptar quedan los suyos, y con eso el módulo arranca con el método de Hermes, no con el del kit: no se prueba el kit | **(A)** Los del kit: el director, obrero, `/inicio` y `/cierre` del kit reemplazan a los de Hermes; las reglas propias de Hermes que valgan pasan a la zona propia del `CLAUDE.md` o a sus cambios (los 103 CM ya migran). **(B)** Seguir con los de Hermes: el módulo arranca "solo" (sin el director del kit) y el kit se prueba a medias | **A**: la prueba real es para el kit, y los 103 cambios de Hermes no se pierden (quedan en `.claude/cambios/`). Se repasan las 3-4 reglas de Hermes que más usás antes de pisar |
| **D2** | **Los permisos de Hermes se mezclan con los del kit sin mostrarte la lista**: se van sus `allow` de git (fuera de `auto`, cada commit pide permiso) y quedan sus `ask` de `git merge`, que **frenan al director de noche** en cada merge | Ver la lista en la pantalla de adopción y decidir regla por regla | Dejar sus `allow` de git, y sacar los `ask` de merge (el director del kit ya tiene su propio freno para mergear) |
| **D3** | **Quedan dos hooks de arranque**, el de Hermes y el del kit, y el handoff de Hermes (7,7 KB) pasa el tope: cada pestaña arranca con "CORTADO" y el handoff dos veces | Cuál queda | El del kit (va con A de D1: el `/cierre` del kit mantiene el handoff bajo el tope) |
| **D4** | **Las cinco preguntas de seguridad** (`sensible:`) quedan todas en "no" al adoptar: ningún comando contra la base real te pregunta nada. Cambiarlas después es un freno (pide tu aprobación) | Cuáles van en "sí" para Hermes | `datos-reales: sí` como mínimo (Hermes toca el SQL Server de la empresa); se aprueba en la misma adopción |

## Lo que se arregla esta noche (taller, D8r.2 → `v3.0.0-rc.3`)

Decidido por la sesión (ADR-034). Cada uno con su escenario en el informe de cada revisor; acá, en una línea.

| # | Qué | Arreglo |
|---|---|---|
| t1 | La **primera vez** que una skill adaptada choca (todavía sin `por:`) sale "sin porqué" y no la pregunta charlada que decidiste | Un choque sin porqué también es choque: la pregunta charlada, con dónde chocan y la propuesta |
| t2 | **Lo adoptado no llega a tu carpeta**: el `/inicio` de Hermes no hace `pull`, y el Arquitecto ve "sin ficha" | `--aplicar --principal` termina con `pull --ff-only` en tu carpeta si está limpia (como el Modo A) |
| t3 | **El camino para traer el director del kit no está escrito** (solo anda `sí` + `--aplicar` + `resolver … nueva`) | Escrito en `flota.md` y hecho un solo paso; la pantalla de adopción pregunta D1 |
| t4 | **Las bases (`entornos:`) no están en la adopción**: sin declararlas, la base de prueba cuenta como real y la Tarea 0 nunca salta | `--mirar` avisa "ninguna base declarada" y la pantalla pregunta cada base y su clase |
| t5 | **Los comandos de Python que propone la adopción** instalan con el `pip` global de tu PC y `pytest` no anda (Hermes usa su `venv`) | En un repo Python, proponer el python del `venv` y mostrar los comandos en la pantalla |
| t6 | **Un gate escrito `cmd //c correr_tests.bat …` da verde sin correr nada** | El gate corre con la misma consola que el director, o se niega esa forma |
| t7 | **Con la carpeta de proyectos `D:/`, "¿cómo está la flota?" no ve Hermes** y "poné al día" agarra sus worktrees | Una fila por repo (no por worktree) y mirar dos niveles |
| t8 | El **nombre del proyecto** sale de la carpeta del clon: la credencial que cargás antes no se encuentra | El nombre sale de tu carpeta principal |
| t9 | `--mirar` no lista lo que se va del settings ni avisa de un hook de arranque propio o un handoff gordo (D2, D3) | Que los liste, para decidir en la pantalla |
| t10 | `propia` quiere decir dos cosas ("congelar" en la ficha y "quedarse con la tuya" en `resolver`) | `quedarse` como nombre de la salida; `propia` sigue de alias |
| t11 | La guía no tiene receta para "tengo un módulo con director andando"; el PLAYBOOK enseña a armar un proyecto existente a mano (v2); tres referencias rotas en los manuales | Una receta-puntero a `ROLES.md`; una línea en el PLAYBOOK hacia "adoptá X"; los números de sección |
| t12 | Menores: la config de base de Hermes (`config.ini`) no llega a los worktrees; el informe de fusión de la adopción no trae el qué y el porqué; `/estado` de noche dice "nada" sin decir que es de noche; `/smoke` que la adopción no trae | Lo que entre en el presupuesto; el resto, a Pendientes |

## Lo que esto no cierra

- No se corrió `claude -p` armando una mezcla real que choca, ni el push simple en esta PC, ni `pip install` de Hermes en Python 3.14.
- No se decide nada de D1-D4 sin vos: si a la mañana elegís B en D1, el módulo arranca con el método de Hermes y el kit se prueba en la
  adopción, la flota y los cambios.
- Regla de esta noche: después de D8r.2 **no hay una tercera revisión integral**; un chequeo corto de lo arreglado y la suite.

## Resultado de la tanda D8r.2 (2026-11-04, la `v3.0.0-rc.3`)

La corrió D8r.2 sin Guido (`SPEC-paquete-8r2.md`; tracker, "D8r.2 · Decisiones sin Guido"). **D1-D4 no se decidieron**: la pantalla de
adopción las muestra con la recomendada primero, y cada camino anda en un comando (`--director kit`, `--permisos recomendada`,
`--arranque kit`; D4 en la propuesta, `datos-reales:` con los comandos).

- **Quedó**: t1 (un choque sin porqué también pregunta charlado) · t2 (`adoptar <clon> --traer <carpeta>`: el pull y después los
  githooks) · t3 (D1 en un paso con `--director kit`) · t4 (`entornos: ninguno declarado` y `herramientas:`) · t5 (Python con el
  `.venv` de cada worktree) · t6 (el gate, el setup, `chequear` y el `sello` en Git Bash; `cmd /c` o `cmd //c` sin Git Bash → `no-corrio`) ·
  t7 (la flota de la PC a dos niveles, una fila por repo) · t8 (`--mirar --principal`: el nombre de tu carpeta) · t9 (lo que se va del
  settings, los `ask` que frenan al director, el SessionStart propio y el handoff gordo, con D2 y D3) · t10 (`quedarse`) · t11 (la
  receta, el PLAYBOOK, las referencias) · t12 (a) el `.worktreeinclude`, (b) el informe de la adopción, (c) `/estado` de noche, (d) `/smoke`
  solo si está.
- **El chequeo frío sobre un clon de Hermes**: el día anduvo de punta a punta; tres de sus cuatro arreglados en la misma tanda.
- **No quedó** (Pendientes del tracker, "De D8r.2", con su porqué): traer el director a un repo **ya** adoptado con la pieza en `propia`;
  el plazo del `sello` con un `comando-test` de 7 minutos; que el setup sume solo el `web/` de npm.
