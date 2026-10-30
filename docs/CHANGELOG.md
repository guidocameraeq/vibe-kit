# CHANGELOG — vibe-kit

> Historia permanente. `/cierre` agrega una entrada AL TOPE en cada sesión; si hubo tag de versión, el título lo dice (` · vX.Y`). Orden descendente estricto. Nada de versiones duplicadas en otros docs. El porqué de cada cosa está en los ADR citados.

## 2026-10-30 — Misión 5, paquete 3 cerrado: githooks, instalador por PC, doctor, sesión real y revisor frío (D3.3)

PC `Usuario`, chat `vibe-kit M5 · D3.3 · Paquete 3, cierre: githooks, instalador, doctor, sesión real, revisor frío`, en Opus, sin Guido
(~9 h). 3 Sonnet y 14 Opus (nunca más de dos Opus a la vez; dos encargos colgados se retomaron). Sin tag. Decisiones sin Guido: tracker,
"D3.3 · Decisiones sin Guido".

**Added**
- **G7 · githooks** (`pre-commit`, `pre-merge-commit`, `pre-push` y `kit-githook.cjs`): candado doble (ref vigente + índice), `barreras
  --indice/--rango`, gitleaks sobre las líneas agregadas con la config commiteada; todos los hooks del molde registrados en forma exec con
  `onFailure: "block"`. 47 pruebas.
- **G10 · `instalar-hooks-pc.cjs`** (`--plan`, `--quitar` byte a byte, `--sacar-viejo`, `--home`). **G11 · `doctor.cjs`** (14 chequeos, solo
  lectura). **G12 · `rehacer.sh`** con el paso "molde v3 orden 3". **G13 · sesión real** con `claude.exe -p` (niega-aprobar en bypass,
  `salir-del-worktree` y `frenos-del-proyecto` vivos).
- **G5b** (`secretos`: `sk-viejo`, `conexion-con-clave`, `telegram`) y **G6b** (`barreras --molde-viejo`, adelantado del paquete 6).

**Changed**
- Revisor frío, dos vueltas: RF-A…D y RF-A2…D2 (githooks, `git-seguro`, `secretos`, `barreras`, `sensible`), cada uno con pruebas, mutación
  y medición del corpus (0 diferencias para el humano). Lo que dejó, en "Lo que esto no cierra" del delta.
- **ADR-029 · revisar y probar con presupuesto** (decisión de Guido al ver D3.3, medida en sus transcripts: 18 h de agentes y 21 M de tokens, el 61%
  en arreglos del revisor frío): contra accidentes y no contra trampas; revisor frío de una vuelta, hasta 10 hallazgos con escenario, arreglos
  en un encargo; mutación solo en piezas nuevas que deciden (20 min); corpus entero una vez por paquete; red team de una ronda; ~4 h y ~8
  encargos por director. En el SPEC-0 ("Ejecución"), el tracker ("Cómo se trabaja", el prompt de D4.1) y el playbook (§2.7).
- Tracker: paquete 3 ✅, fila D3.3, Pendientes con lo que espera a Guido, el prompt de D4.1. Delta: ✅ IMPLEMENTADO.
- **Suite entera: 2.121 pruebas, 2.121 verdes** (27 min). `rehacer.sh` ×2, mismos SHAs. Huella del `~/.claude/` real (settings y hooks) igual a la de la apertura.

## 2026-10-29 — Misión 5, paquete 3, segunda vuelta: G3-G6 terminados y en `main` (D3.2)

PC `Usuario`, chat `vibe-kit M5 · D3.2 · Paquete 3, segunda vuelta: terminar G3-G6 desde sus ramas WIP`, en Opus, sin Guido. 4 encargos
Opus, de a dos (G3 y G6 retomados después de un corte de cuota). Sin tag. Decisiones sin Guido: tracker, "D3.2 · Decisiones sin Guido".

**Added** (en el molde y en `pc/`, sin registrar todavía en ningún `settings.json`: eso es D3.3)
- **G3 · `m/hooks/git-seguro.cjs`** (P4.4, la tabla entera) y **`m/hooks/lib/agente.cjs`** ("sesión de agente" de P4.7): 41 pruebas (1 skip
  hasta que G7 lo registre), mutación 136/137, medición sobre el corpus `Usuario` (16.470): 90 frenos, 0 falsos positivos.
- **G4 · `m/hooks/sensible.cjs`** con el caché en el git-dir común (la huella suma la config del sistema y las `GIT_*`); `kit.ejemplo.md`
  con entradas reales: 306 pruebas (con `ficha.test`), mutación 62/64, 0 `ask`/`deny` con humano de día; criterio 7 en un worktree real.
- **G5 · `eq/pc/secretos.cjs`**, el corrector de la PC, y `pc/lib/` (copias byte a byte del molde, `agente.cjs` incluido): 29 pruebas,
  mutación 178/181, medición 16.470 llamadas + 1.003 prompts: 38 frenos correctos, 0 falsos positivos (empezó en 308; las correcciones,
  ⚠️ en el tracker).
- **G6 · `barreras --indice` y `--rango`** (la ref nueva con el sha de ceros; sin juzgar el commit sin padre) e **ids de D-3** (`secretos:`,
  `publicas:`, `datos-de-prueba` cuando aflojan): 134 pruebas, mutación 49/50.

**Changed**
- Tracker: fila D3.2 ✅, sus decisiones, y Pendientes con lo que G3-G6 dejaron para D3.3. Delta: G2-G6 con ✅ en "Los encargos".
- **Suite entera: 1.994 pruebas, 1.993 verdes, 1 skip, 0 rojas** (10 min). gitleaks verde en cada merge. Las cuatro ramas `wip/d3.1-*`, borradas de `origin`.

## 2026-10-29 — Retomar en `Usuario`: el historial de chats completo, la PC preparada y el paquete 3 partido en D3.2 y D3.3

PC `Usuario`, sesión intermedia de la misión 5, en Opus, con Guido. Sin tag; `kit/` sin cambios.

**Added**
- `/cierre` (paso 5): **el chat de cada sesión sube al privado** `vibe-research/chats/<pc>/`, condensado con la receta de allá. Si la PC no
  ve el repo privado, no se sube por otro lado: el handoff anota el id. Pedido de Guido: que el historial esté siempre completo.
- Tracker: **"Abrir D3.2 y D3.3 sin Guido"**, los dos prompts; filas D3.2 y D3.3; en Pendientes, la PC `Usuario` preparada.
- En el privado: los chats de vibe-kit que faltaban. Los **racimos A, C y E de la misión 4** y tres sesiones más (`chats/companero/`,
  de la notebook del compañero: su cuenta no ve el privado, así que viajaron por un repo privado temporal suyo); dos sueltos de `Usuario`
  y el de esta sesión (`chats/usuario/`); `FALTAN.md` sin pendientes; la fila del diario.

**Changed**
- **El paquete 3 pasa a tres directores**: D3.2 solo cierra G3-G6 (de a dos Opus), D3.3 hace G7, G10-G13, el revisor frío y el `/cierre`.
  Por qué: D3.1 cortó por cuota al meter todo junto (tracker, "Cambios al plan").
- PC `Usuario` al día: `kit-sync sync` → LIMPIO (le faltaban `VERSION`, `pc/` y una línea del Equipador); repos de prueba con
  `rehacer.sh` (verdes); corpus del historial en `C:\Users\Usuario\vibe-historial\`: **16.470 llamadas únicas**, contra 91.298 de
  `clientes` (esta PC borró sus crudos de vibe-kit el 2026-10-28).

**Removed**
- TODO: "Juntar los chats de todas las PCs" (hecho: completo hasta el 2026-10-29; lo que sigue lo hace el `/cierre`).

## 2026-10-29 — Misión 5, paquete 3 a medias: el delta sellado sin Guido y tres piezas (D3.1, cortada por cuota)

PC `clientes`, chat `vibe-kit M5 · D3.1 · Paquete 3: seguridad — corrector, barreras, hooks por PC, doctor mínimo`, en Opus, sin Guido
hasta la tarde. Guido volvió con poca cuota y pidió un punto de corte: G3-G6 se frenaron a medias y quedaron en ramas WIP locales (tracker,
Pendientes). Sin tag. **Nada tocó el `~/.claude/` real**: la huella de `settings.json` y `hooks/` es igual a la de la apertura.

**Added**
- `docs/kit-v3/SPEC-paquete-3.md`: el delta del paquete 3, **sellado sin Guido (provisorio)** tras dos rondas de red team (r1: 6 ALTOS
  integrados —variables `GIT_*`, ref vigente falsificable, listas de verbos, claves literales en el repo público, `reset` en `main`, gitleaks
  colgado—; r2: 0 ALTOS, 11 medios y bajos). Decisiones D-1 a D-15 (las ⚠️, en el tracker).
- `kit/molde/hooks/lib/comando.cjs` (G2): el recorrido de comandos de Bash y PowerShell, port del de Hermes más asignaciones; 976 casos,
  mutación 384/384.
- `kit/skills/arquitecto-skills/pc/cargar-secreto.{sh,ps1}` (G8): entrada oculta, almacén `~/.config/kit-secretos/<proyecto>.env`, relee y
  compara, nunca imprime el valor; 38 pruebas.
- `kit/molde/hooks/lib/db-guardia.cjs` (G9): `db migrar` contra `real` sin veredicto del revisor para el hash del plan → niega; borrar
  `tabla:<x>` de `datos-reales` de noche → PARADA, de día → pide `--borra-datos-reales`; 38 pruebas, mutación 51/52.

**Medido** (G0, G0b; `claude.exe` 2.1.309 `-p`)
- `onFailure: "block"` frena las cuatro fallas de un hook (sin ejecutable, error, colgado a los `timeout` s, JSON inválido), con Bash y
  PowerShell; sin el campo pasan. El `.cjs` se relee en cada llamada. `deny` con ruta absoluta anda en Windows.
- La forma exec (`"command": "node"`, `"args": ["${CLAUDE_PROJECT_DIR}/…"]`) expande la variable sin Git Bash: todo hook del kit va así (D-7).
- `gitleaks version`: 47 s en frío en `clientes`, ~2 s después. El `block_secrets.ps1` viejo suma ~10-11 s a cada Bash.
- El corpus del historial (G1, solo en el scratchpad): 91.298 llamadas únicas de 2.218 transcripts, para medir los frenos.

**Para seguir en otra PC** (Guido, al cerrar)
- G3-G6 a medias, en ramas de `origin`: `wip/d3.1-g3-git-seguro`, `wip/d3.1-g4-sensible`, `wip/d3.1-g5-secretos`, `wip/d3.1-g6-barreras`
  (gitleaks verde en las cuatro).
- Al privado `vibe-research`: los 22 chats de vibe-kit de `clientes`, condensados (`chats/clientes/`), los arneses de la medición
  (`mision-5/medicion-historial/`, sin el corpus) y la fila de D3.1 en el diario.

## 2026-10-29 — Misión 5, paquete 2 ✅: zona propia, `cambios` con su sello, el candado, `/inicio` y `/cierre` del molde (D2.2, sin Guido)

PC `clientes`, chat `vibe-kit M5 · D2.2 · Paquete 2, segunda mitad: candado, cambios, zona propia, /inicio y /cierre v3`, en Opus.
**Primer director que corrió solo**, con la autorización previa de Guido: cada decisión con la recomendada, anotada en "Decisiones sin
Guido" de la fila D2.2 del tracker (las ⚠️ arriba). 6 encargos Sonnet y 6 Opus. Sin tag: `kit/VERSION` sigue en `2.4.3`; todo vive en
`kit/molde/` y no se instala en ningún proyecto hasta el orden 6.

**Added**
- `docs/kit-v3/SPEC-paquete-2.md`: la sección "D2.2 — el detalle" (F1-F7), dos rondas más de red team (r4-r5: 5 ALTOS integrados), "Lo que
  cambió en la construcción (D2.2)" y "El revisor frío" con lo hecho en cada hallazgo; Estado `D2.2 ✅ IMPLEMENTADO 2026-10-29`.
- `kit/molde/hooks/lib/zona-propia.cjs` (P3.2): zonas en textos, `hashPieza`, hermano `.propio.sh`, `settings.json` a tres puntas por regla
  con ids normalizados, `desviosSettings`.
- `kit/molde/hooks/lib/fabrica/ficha.{liviano,estandar}.md` y `fabrica.cjs`; `ficha.leerCabecera`.
- `cambios` (P6.8a): `hooks/lib/cambios.cjs` y `scripts/cambios.cjs` (`nuevo`, `listar`, `verificar`, `anotar-sha`, `rechazar`, **`aprobar`**
  con su sello y su commit), el campo nuevo **`ids:`**, y `hooks/niega-aprobar.cjs` (niega sin ventana o sin modo, pregunta con ventana).
- El candado (P6.1): `scripts/estructura.cjs`, `hooks/lib/candado.cjs` (nueve chequeos) y `hooks/lib/barreras.cjs` (rango, ids, un
  `aprobado` = un commit, las dos exenciones, merges juzgados contra cada padre).
- `scripts/agents.cjs` (P3.10), `skills/inicio` y `skills/cierre` del molde (P5.1, P5.2) con su zona propia, y `pruebas/pedidos.md`.

**Changed**
- `kit/molde/settings.json`: la `ask` de `aprobar`, el `allow` del script, el `deny` de `Write`/`Edit` sobre `.claude/cambios/**` y el hook nuevo.
- `pruebas/rehacer.sh`: carpeta hermana desde el checkout principal; `molde v3 orden 2` sale del molde de D2.1 y `molde v3 orden 2b` suma
  lo de D2.2 (en `alfa` y `beta`: `barreras --molde` 0, sin `--molde` 1, `todo` 0); dos corridas y desde un worktree, mismos SHAs.
- SPEC-0: los ✅ de 3.2, 3.10, 5.1 (con salvedad), 5.2, 6.1 y 6.8a, y la nota a 4.6. Notas en los diseños B §6 (la pregunta de tamaño estaba
  al revés de su regla), D §22ter y E §5.
- Tracker: fila D2.2, "Decisiones sin Guido", pendientes para los paquetes 3, 4 y 6, lo que espera a Guido, criterios y lecciones.

**Verificado**
- Suite **821 verde** (`node --test "kit/**/*.test.cjs"`, ~18 min). Mutación por encargo, vivos equivalentes y explicados; control del director 6/6.
- `claude.exe -p` 2.1.309: las filas 1-4 y 7 de "Lo prueba una sesión real"; el `settings` con `onFailure` carga, `PreToolUse` trae
  `permission_mode`, `'aprobar'` entre comillas no corre en `default`, `dontAsk` lo niega, `Write` a `cambios/` negado. **Bypass no se pudo
  lanzar** (lo frenó el clasificador).
- El caso "sí" de 6.8a, a mano en un clon de `alfa`: propuesto → aprobado → aplicado, con el id no declarado y el segundo uso en rojo.
- El revisor frío (tres vueltas, 6 ALTOS: `pull` con merge o `--rebase` desde la otra PC, `merge --no-ff`, la base del rango sin remoto, y
  dos formas de borrar un freno con un merge) quedó integrado.
- **Los diez pedidos dieron 6 de 10**: los "módulo solo" invocan al Arquitecto sin decir antes la línea del tamaño (pendiente al orden 4).

**Decidido por Guido al volver**
- `niega-aprobar.cjs` **pregunta en `auto`** en vez de negar (Guido trabaja siempre en `auto`, y ahí la ventana aparece); bypass y `dontAsk`
  siguen negando (los obreros nocturnos corren en bypass). SPEC-0 4.5, 6.8a y criterio 18 corregidos.

## 2026-10-29 — Misión 5, sesión intermedia DP: no se paraleliza; el director no corta por contexto

PC `clientes`, chat `vibe-kit M5 · DP · Planear la paralelización de lo que queda`, en Opus. Sin encargos ni código.

**Changed**
- Tracker (`docs/kit-v3/PLAN-construccion.md`): la sección "Paralelizar" pasa de evaluación a decisión: **un director por vez**, en el
  orden de la tabla. Se evaluó D2.2 ∥ paquete 3, el 5 partido y 7 ∥ 8 (de 9 a 6-7 pasos antes del piloto); con una PC por director rendía,
  en la misma PC pedía reglas nuevas (pruebas que se pisan, repos de prueba por director, frenos globales en un `HOME` falso, ramas y
  dueños por archivo) y un ensayo. Guido: "prefiero hacerlo bien y que tarde más".
- "Límites": **el director no corta por contexto**, termina su fila (D1.1 y D2.1 cerraron con mucho de sobra). **D2.2 corre sin Guido**
  con su autorización previa: decide con la recomendada y lo anota en "Decisiones sin Guido".
- Lección para la misión 6: paralelizar directores depende de cuántas PCs hay, no solo del grafo de dependencias.

## 2026-10-28 — Misión 5, paquete 2, primera mitad ✅: docs en capas, handoff y TODO con tope, hook de arranque en node y hook de escritura (D2.1)

PC `clientes`, chat `vibe-kit M5 · D2.1 · Paquete 2, primera mitad: docs en capas, handoff y TODO con tope, hook node`, en Opus.
Segundo director de la misión 5: spec delta redactado por un subagente, tres rondas de red team, sellado por Guido; 4 encargos Sonnet y
7 Opus. Sin tag: `kit/VERSION` sigue en `2.4.3`. Todo lo nuevo vive en `kit/molde/` y todavía no se instala en ningún proyecto.

**Added**
- `docs/kit-v3/SPEC-paquete-2.md` (READY, sellado "tal cual"; D2.1 ✅): partido en D2.1 y D2.2, con 22 cruces contra los diseños y tres
  rondas de red team (4 ALTOS cerrados: sello falsificable, `carpeta` absoluta, exención que se certificaba sola, `aprobar` mezclado).
- `kit/molde/docs/` en cuatro capas (NORTE, MAPA, README, CHANGELOG, SESSION_HANDOFF con secciones fijas, TODO, `referencia/`), el
  `CLAUDE.md` mínimo del molde, `gitignore.snippet` y `gitattributes.snippet`, y el runbook `manuales/se-filtro-una-credencial.md`.
- `kit/molde/hooks/lib/`: `git`, `contexto` (con `fichaVigente` y la regla 4.7), `arbol`, `topes` (con `revisarTopes`), `frenos-log`,
  `todo`, `inyeccion`; y `scripts/todo.cjs cierre` (`TODO: +n −m · k ítems · j bajaron a 🟢`).
- `kit/molde/hooks/session-start.cjs`: el hook de arranque en node, sin `.sh`, con presupuesto de 9.700, tope por bloque, CORTADO,
  edades y "estado viejo", por pestaña (director, encargo, `main`), marca de sesión y huella `inyectado: N de 9.700`. **Plazo propio de
  10 s** (E4b): medido, tardaba 10-24 s con la PC cargada contra un `timeout` de 20.
- `kit/molde/hooks/escritura-docs.cjs` (`PreToolUse` sobre `Write`) y `kit/molde/settings.json` con los dos hooks. Medido contra los
  5.007 `Write` de esta PC: 0 frenadas sobre los seis archivos y las tres carpetas.
- `pruebas/rehacer.sh`, paso `molde v3 orden 2`: `alfa` y `beta` con el molde nuevo y el settings mezclado; `gama` sigue en `2.4.2`.

**Changed**
- Los repos de prueba se mudan a `../vibe-kit-pruebas/` (decisión de Guido): adentro cargaban su `CLAUDE.md` en la sesión de vibe-kit.
- Tracker: la sesión intermedia **DP** (planear la paralelización, pedido de Guido) antes de D2.2, y la sección "Paralelizar".
- Notas con fecha en B §9 (9.700, `.cjs` directo, el plazo), F §5 (la `ask` de `cambios aprobar`) y SPEC-0 (repos afuera, P4.4);
  piezas 3.3, 3.5, 3.6, 3.9, 4.1 y 4.2 del SPEC-0 marcadas ✅.

**Verificado y pendiente**
- Suite: **496 pruebas verdes**. Mutación por encargo 87/87, 82/82, 88/91, 28/30, 35/35; control del director 6/6. `rehacer.sh` dos
  veces, mismos SHAs (alfa `894139e`, beta `715d541`, gama `982a231`); criterio 12 verificado por el director. `kit-sync` LIMPIO.
- Pendiente: las filas 1-7 de "Lo prueba una sesión real" (en el tracker) y lo de "Paquete 2 · para D2.2".

## 2026-10-28 — Misión 5, paquete 1 ✅: la ficha del kit, su parser, `kit/VERSION` y los repos de prueba (D1.1)

PC `clientes`, chat `vibe-kit M5 · D1.1 · Paquete 1: la ficha del kit y su parser`, en Opus. Primer director de la misión 5 (ADR-028):
spec delta sellado por Guido, 5 encargos Sonnet, revisor frío Opus. Sin tag: `kit/VERSION` sigue en `2.4.3`.

**Added**
- `docs/kit-v3/SPEC-paquete-1.md` (✅ IMPLEMENTADO): la gramática cerrada de la ficha, lo que valida, los encargos y "Lo que cambió en la
  construcción".
- `kit/molde/kit.ejemplo.md` (la forma de la ficha y su caso de prueba, no una plantilla para copiar) y `kit/molde/hooks/lib/ficha.cjs`
  (parser en node estándar, `.cjs` para que corra en proyectos ESM; `leer`, `campo`, `hash`, `version`; salidas 0·1·2·3·4) con
  `ficha.test.cjs`: **255 pruebas** y 0 mutantes vivos en las reglas.
- `kit/VERSION` (`2.4.3`) y `kit/CHANGELOG.md` (el del kit, con la nota de migración por versión que leerá el actualizador).
- `pruebas/rehacer.sh`: arma `alfa` (estandar), `beta` (liviano) y `gama` (estandar) desde el molde de `v2.4.2`, con ficha `kit: 2.4.2`,
  remoto `bare` y `origin/HEAD`; identidad y fechas fijas (dos corridas, mismos SHAs); guardia antes de borrar. `pruebas/` ignorado salvo
  el script y `pedidos.md`.

**Changed**
- `kit-sync.sh` y el "actualizate" del Equipador copian `VERSION` a `~/.claude/`.
- Tras el revisor frío (3 ALTOS): el `id` de un freno quitado acepta una regla `deny` por su texto (F §14); **las herramientas van en un
  campo aparte, `herramientas.<nombre>: {chequeo, necesita-guido}`, que cada entorno nombra (decisión de Guido)**; una clave desconocida
  en un submapa avisa en vez de frenar; ningún error repite un valor; el ejemplo dejó de sugerirse como plantilla.
- Plan: **P3.2 (zona propia) y `pruebas/pedidos.md` pasan al orden 2** (decisión de Guido al sellar). Notas con fecha en E §4 y F §9; el
  mapa del `CLAUDE.md` suma `pruebas/` y `kit/VERSION`·`kit/CHANGELOG.md`.

**Verificado y pendiente**
- Verificado: leer un archivo de `pruebas/alfa/` carga su `CLAUDE.md` en la sesión. Va a "Pendientes" del tracker para que D2.1 lo decida
  con Guido; mientras, el mapa dice que se miren por Bash.

## 2026-10-28 — Misión 5, antes de empezar: un director por paquete (ADR-028)

PC `clientes`, mismo chat que la misión 4½. Guido propuso un orquestador Opus que gestione todo el spec con subagentes; se acotó a uno por
paquete (los motivos, en el ADR).

**Changed**
- `docs/kit-v3/PLAN-construccion.md`: "Cómo se trabaja" pasa a los 8 pasos de un director por paquete, con sus límites (no edita código,
  revisa cada diff, frena para el sello, las pruebas de sesión real quedan como pendientes). La tabla de sesiones pasa a **13 directores**
  (D1.1 a D10.1; dos en los paquetes 2 y 5), con una columna de encargos y modelos para medir en la misión 6.
- El spec, sección "Ejecución": el tamaño (un director por paquete) y los modelos (director y encargos de riesgo en Opus, mecánicos en
  Sonnet). `/inicio`, `/cierre` y `docs/README.md` hablan de directores.

**Added**
- ADR-028: un director Opus por paquete que reparte encargos a subagentes; descartados el orquestador para todo el spec y la sesión por paso.

## 2026-10-27 — Misión 4½: la casa ordenada antes de construir · v2.4.3

PC `clientes`. Arrancó en Fable y pasó a Opus al empezar a ejecutar (decisión de Guido: las decisiones ya estaban en el spec).

**Added**
- **El hook de arranque con tope y huella** (molde, `kit/…/templates/universales/hooks/session-start.sh`): el handoff se corta a
  5.500 bytes con aviso "CORTADO", 30 líneas del TODO, títulos de commit cortados a 100, hasta 15 renglones de estado, y al final
  `inyectado: N caracteres de 10000`; si pasa los 9.700, avisa también arriba (la línea del final es la que se pierde). Sigue al
  hook del Hub (2026-10-22). Probado con handoff chico, uno de 26 KB con tildes y un proyecto vacío. *Cicatriz: el Bot inyectaba
  15.500 caracteres y su panel ~18.000 (FLOTA §3, 2026-10-22).*
- `/inicio` y `/cierre` del molde: qué hacer con "CORTADO" y el tope del handoff; la cabecera del handoff del molde dice su tope.
- `GUIA-DE-USO.md`: receta "El arranque dice CORTADO", con la frase para llevar el hook a un proyecto viejo. Manual del Arquitecto y
  playbook §2.4 al día.
- `legacy/LEEME.md`: el índice de lo archivado, con qué lo reemplazó. Lápidas en los 9 archivos que no tenían (incluidos el README
  del kit v1 y el INSTALAR del snapshot, que daban instrucciones de instalación como si estuvieran vigentes).
- En el repo privado de investigación: `DIARIO-MISIONES.md` (de la misión 1 a hoy: PC, chat, modelo, tokens, commit; los de esta PC
  medidos sobre los transcriptos), una portada, y `mision-4/` con los chats y los 4 informes de revisión del spec.
- `/cierre` de acá: suma la fila del diario, mide la huella y pide mensajes de commit de una línea.

**Changed**
- El hook de vibe-kit es el del molde con sus textos: de 10.199 a ~7.700 caracteres.
- `docs/README.md`: sección del kit v3; la misión 4 marcada como cerrada; lo crudo, en el privado. Fila de `docs/kit-v3/` en el mapa
  del `CLAUDE.md`. La portada ya no dice "ahora: diseñar el pack".

**Removed**
- `docs/chats-mision-4/`: mudado al privado, byte por byte igual (ADR-025). Sigue en el historial de git; no hay nada secreto.

**NO VERIFICADO**: el hook nuevo en un chat de verdad (se ve en el próximo `/inicio`); en qué PC se hicieron los racimos A, C y E.

**Después del cierre, mismo chat** (pedido de Guido: "que no se pase nada por alto"):
- `docs/kit-v3/PLAN-construccion.md`, **el tracker de la misión 5**: estado por paquete con las sesiones estimadas (~18-21), una fila por
  sesión (P1.1 a P10.1), pendientes, los NO VERIFICADO del spec repartidos entre construcción y piloto, los 20 criterios para tachar, lo
  que hace Guido y cuándo, cambios al plan y lecciones. Enganchado en el `/inicio` y el `/cierre` de acá, `docs/README.md`, el `CLAUDE.md`
  y el TODO.
- El spec, sección "Ejecución": **la construcción en Opus** (decía Sonnet; decisión de Guido, "esto va a determinar cómo codeo los
  próximos meses") y el tracker como parte de lo que se hace antes y después de cada paquete.

## 2026-10-27 — Misión 4, tramo 5: el repaso del kit con Guido y el SPEC-0 del kit v3, READY. Misión 4 cerrada

### Added
- **El repaso del kit con Guido** (paso 0, pedido suyo): cinco partes charladas en el orden de su workflow (el Arquitecto nuevo · cómo se
  actualiza el kit y los repos · el día a día con director y obreros · repos y documentación · por qué es mejor, con lo medido). Quedó como
  **`docs/kit-v3/GUIA-KIT-V3.md`** (36 KB, la charla textual armada por un subagente Sonnet desde el transcript, con introducción, "Qué sigue" y
  una fe de erratas de la tarde) y como **PDF de 14 páginas** en los dos escritorios de Guido (`Desktop` y `OneDrive\Desktop eQ`).
- **`docs/kit-v3/SPEC-0-kit-v3.md`** (95 KB, **READY**, sellado a mano por Guido): el plano del kit v3 desde los 8 `DISENO-*` y TABLERO §1. Top 10,
  9 paquetes (P1 Arquitecto · P2 Equipador · P3 molde · P4 hooks · P5 skills del método · P6 scripts · P7 actualizador y adoptador · P8 observatorio ·
  P9 documentación del método) con "hecho cuando" verificable, 20 criterios, entorno de prueba propio (`pruebas/` con remotos bare), orden de
  construcción en 10 pasos (+ 8½ credenciales), medición contra las líneas base, supuestos, ⚠️ con consecuencia, tabla "Lo que este spec corrige
  de los diseños" (20 filas, a anotar con fecha al construir), "Lo que hacés vos de nuevo", NO VERIFICADO con su "cuándo", "Ejecución". Resueltos
  los 5 puntos que el tramo 4 dejó "para el spec".
- **Cuatro revisiones en Opus**: red team `redteam-spec` en 3 rondas (15 + 12 + 4 hallazgos; el tema de fondo: la red de seguridad no puede
  depender de hooks que leen archivos que el propio obrero edita ni de patrones sobre el texto de un comando → `onFailure: block`, la ficha se lee
  de la rama por defecto del remoto, `candado:barreras` en el pre-commit de toda sesión, almacén de credenciales fuera de todo repo, el actualizador
  en bypass dentro de un clon, mensajes entrantes como dato) y **revisor frío** sin contexto (28 hallazgos: `doctor` mínimo al orden 3, `cambios`
  partido, pieza "resumen del día", 9 decisiones de los diseños sin pieza ubicadas, `.kit-rol`/`.kit-noche` en vez de una variable de entorno, fe
  de erratas, "qué cambia para vos"). **59 aplicados, 0 rechazados, 0 contradicen una decisión de Guido.** Informes en
  `D:\vibe-research\clientes\redteam-kit-v3\` (carpeta local, todavía fuera del repo privado).
- **ADR-027**: el OK de Guido a un cambio de barrera es **el clic en la ventana de permiso, con tres candados** (el script se niega desde carpetas
  de agentes, el sello anota la carpeta, los modos sin ventana lo niegan); descartada la línea en la terminal que propuso el red team ("si me
  molesta la esquivo"). Decisión de Guido del 2026-10-27, charlada en criollo con el riesgo residual explícito.
- `docs/README.md`: filas de la guía y del spec.

### Changed
- `TODO.md`: la misión 4 sale (terminada); la 5 apunta al spec; la 4½ suma subir los informes al privado y la fila de `docs/kit-v3/` en el mapa.
- Handoff recortado: el hook inyectaba ~10.800 caracteres (pasado del tope), en parte por los mensajes de commit largos; desde hoy, commit de una línea.

### Fixed
- El PDF de la guía se generó dos veces más tras la fe de erratas; la versión final es la del clic con candados.

## 2026-10-27 — Misión 4, tramo 4: revisión integral, sesión 2 (director/obrero contra Hermes, el flujo proyecto ↔ kit, revisor frío). Tramo 4 cerrado

### Added
- **El apartado director/obrero** (`DISENO-D` §22bis): Hermes Desktop medido (38 commits de método desde el 20/10; 255 en todo el repo) y sus 32
  fichas CM-72 a CM-103 leídas enteras y cruzadas contra las 11 decisiones de D con el filtro "un solo proyecto no alcanza salvo cicatriz o 3+":
  **12 coinciden** (CM-76 es la misma decisión que D-8 tomó el mismo día; CM-102 converge con G, D y H; CM-83 es la prueba de P65), **15 son
  del stack** (a la zona propia del implementador), **4 entraron al canon con su cicatriz** (CM-79: el despertador mira también `main`, D §9.3 ·
  CM-82: el chequeo base entra con una cuenta que solo existe en el ensayo, H §9.3 · CM-86: la red en el checklist nocturno, D §9.5 · CM-91: un
  encargo tampoco comparte recursos de la máquina, D §5), **0 contradicen**. Lo que sí contradecía era el trámite (31 clics del PO en un día):
  **Guido decidió "cambios de método del proyecto = clase 2 con diff; solo las barreras con mi clic"** (D §13.2 d).
- **El flujo proyecto ↔ kit: ADR-026 y `DISENO-D` §22ter**. El registro de cambios de método por proyecto es pieza del canon
  (`piezas.cambios-metodo`): un archivo chico por cambio en `.claude/cambios/` con el contrato de CM-103 (estados, SHA, tabla de medición, `cita:`,
  `aplico:` con hash), candado `candado:cambios`, sube al kit por el ciclo con 3+ o cicatriz, urgencias como parche, adopción entre proyectos
  citándolo; el actualizador marca `subio-al-kit` y retira lo propio que el molde ya cubre. Cierra E-3 (E §14) y suma `cambios-metodo` a la ficha
  del kit (E §4) y a la adopción (E §7). Descartados: congelar hasta la versión · propagación automática · el archivo único de Hermes.
- **La portada del repo** (`DISENO-B` §12bis, pedido de Guido: "que los repos sean lindos y se entienda qué son"): el README raíz como portada
  armada por el Arquitecto desde el `NORTE.md`; vestirla es pieza de la misión 5 (TODO). Era un hueco entre B y E: GitHub muestra el README
  raíz, y B había puesto la puerta humana en `docs/README.md`.
- **La nota del contrato del registro de proyectos** en E §9 (lo que quedó de I, ADR-024): forma `{version, fichas, conexiones}`, adaptador de
  ejemplo local, cuándo lo mira el Arquitecto.
- `DISENO-G` §25: su sección "Revisión integral" (era el único sin ella).

### Changed
- **Revisor frío sobre los 8 diseños** (Opus, sin contexto, ~306 mil tokens; informe de 30 hallazgos): **todos aplicados** contra el criterio
  ya establecido; ninguno contradecía una decisión de Guido. Los 5 que rompían: H §15 volvía a preguntar por producción (ahora `ask` solo
  sobre el subcomando que borra) · el clic de barreras como pregunta fuera de la lista de A (ahora es la cola "te espera", no un pop-up, y se
  cuenta en D §17) · `/cierre` creaba un módulo sin el sello del Arquitecto (ahora nace sin sello y `/inicio` lo invoca) · nadie decía dónde
  mergea el director a `main` (modo `integrar` del script de worktrees, H §10.2, D §8.4) · D prometía que el obrero no podía darse permisos
  (ahora dice el riesgo real de F-1). Los 16 que contradecían: 9 lugares con "las 4 preguntas", 10 con "racimo I", nombres de sesión viejos,
  "el hook aprueba" en la ficha canónica y los criterios, `sensible:` sin campos para claves y release, yaml con `nivel` viejo, el presupuesto
  del hook recalculado (9.700), los conteos de H §20 y §24, el actualizador que "pregunta" (gana E-4: informa con veto), el merge de un
  `estandar` sin director (definido una vez en E §4: gate verde), `aprobado` solo para barreras. Más 2 referencias rotas, 2 preguntas
  escondidas contadas, 4 supuestos marcados NO VERIFICADO y el hueco del "plan charlado antes" (D §15.0).
- `TODO.md`: el tramo 4 queda cerrado; el próximo es el spec (tramo 5) con la lista de lo que el tramo 4 le dejó, **y antes, el repaso del kit
  entero con Guido** (pedido suyo del 27/10: "contame cómo quedó mi kit y por qué es mejor que el anterior; después le doy el OK al spec").
- **D §8 (ramas y escritores) deja de ser provisoria** (Guido, 27/10): el acta no la contradijo, Hermes convergió (CM-102) y el revisor frío
  le cerró el hueco del merge a `main`; queda como las demás, diseñada y a verificar en el piloto. Notas en D §2, §8, §16, §22 y G §25.
- `PLAN.md`: fila del tramo 4 con la sesión 2 y una lección para el ciclo (revisor frío obligatorio tras una corrección transversal; los
  registros antes que los chats).

### Fixed
- ADR-026 decía que las 4 cicatrices eran de producción: era una. La cifra de 126 commits del ADR-025 no se reprodujo; D §22bis dice qué mide cada número.

## 2026-10-26 — Misión 4, tramo 4: revisión integral con el acta de contraste, sesión 1 (las 10 decisiones reabiertas, cerradas con Guido)

### Changed
- **Los 7 `DISENO-*` corregidos con el acta abierta** (cada uno cierra con una sección "Revisión integral" con tabla veredicto → qué se hizo → dónde,
  y notas fechadas en las decisiones tocadas). Las 10 decisiones reabiertas, en 4 charlas en criollo: **A-1** (merge y producción no entran a la
  lista de 5: `autorizado:` por proyecto, gate verde y comando con foto; cicatriz: 13 clics de merge a las 00:26 por una `ask` propia de Hermes),
  **F-1** (capa del clasificador del modo `auto`: AUTORIZADO como `allow` estrechas por script, hook solo `deny`, `autoMode` por el Equipador en
  la PC, noche nunca `auto`; verificado contra la doc oficial), **H-6** (el desvío declarado es el canal legal, contado por script, **nunca frena
  al obrero**), **D-5** (sin número fijo; duro ~80%; D §2 corregido), **D-8** (tope 2 se queda; paquete del revisor por script, afirmaciones en
  prosa a un corrector de A con P18 reabierto, la 3.ª para al director), **E-1 rearmada por pedido de Guido** ("el Arquitecto viene a vos": la
  sesión lo invoca sola en la misma pestaña, Modo B corto, candado por script con sello), **H-5** (entorno = base + herramientas; "necesita a Guido
  de día"), **E-4 rearmada** (diseño charlando · rutinario sin pregunta con veto · formato fijo con botón "explicámelo en criollo"), **B-6/B-7**
  (edad del estado por `git blame`, `candado:estado-viejo`), **D-10** (sin agente: `/estado` suma % medido, "podés cerrar", esperas y uso, solo
  información).
- **Triage de P58-P77**: 16 entraron a los diseños (marcadas en `tips/tanda-2026-10-habitos.md` y `tips/tanda-2026-11-contraste.md` con su
  puntero), 3 a la misión 5 (P70, P72, P19), 1 al piloto (hook de `resume`). Refuerzos: "sin config no arranca" mecánica (F §12); `taskkill`
  por nombre al hook (F §6). 4 chats ★ releídos por lectores Sonnet (relevo a 834k, rondas del revisor, opción-trampa, permisos de noche).
- **Verificado**: en la app de escritorio una sesión lee el uso del plan y el contexto propio y de otras sesiones (D §11, C §2.5). Hermes medido:
  38 commits de método desde el 20/10, CM-103 aprobado sin aplicar. `PLAN.md` §4 con el estado; memoria `guido-como-decidir` nueva.
- **Queda para la sesión 2**: el apartado director/obrero (CM-72 a CM-103 contra D), el flujo proyecto ↔ kit, la nota del contrato en E, el revisor
  frío y la charla final con Guido sobre el método director/obrero.

## 2026-10-26 — La hoja de ruta reordenada: v3.0 sin mensajería, el ciclo como misión 6, la mensajería como v3.1 (ADR-025)

### Changed
- **El orden de las misiones** (Guido): 4 cierra el diseño sin la mensajería → 4½ ordenar la casa → 5 construir v3.0 → 6 el ciclo de mejora como
  proceso escrito (con la revisión de cómo trabajamos en estas sesiones) → 7 la mensajería agéntica, v3.1 (lo que era G.1). El TODO lleva la hoja
  de ruta y **el ciclo** (cada 3-4 meses; la próxima vuelta, entre febrero y marzo de 2027).
- **La revisión integral suma un apartado de director/obrero**: el canon de D contra lo que Hermes Desktop cambió en su método mientras
  diseñábamos (126 commits desde el 20/10; CM-72 a CM-103 de su `CAMBIOS.md`; Mobile sin cambios) y la decisión del flujo proyecto ↔ kit.
- **Regla del research** en `observatorio/README.md`: al público solo el acta; todo lo crudo a un repo privado propio, pusheado antes de cerrar la
  madre. `docs/chats-mision-4/` se mudará al privado en la 4½, con un diario de misiones. ADR-025; PLAN, TABLERO, DISENO-G §18 y handoff al día.

## 2026-10-26 — El agente de ecosistema se va del kit (ADR-024)

### Changed
- **El racimo I deja de existir en vibe-kit** (decisión de Guido: el kit tiene que quedar genérico; lo de su empresa va por afuera). El agente de
  ecosistema se diseña y construye en el repo del Hub; acá queda solo el contrato genérico del registro (leerlo por adaptador, forma
  `{version, fichas, conexiones}`; el Arquitecto mira el mapa antes de un proyecto nuevo), como nota en E en la revisión integral. ADR-024,
  REJ-016; TABLERO §10, PLAN, TODO y handoff al día. El tramo 4 queda: revisión integral → G.1 → spec.

## 2026-10-26 — Misión 4, tramo 4: H cerrado con Guido y la lectura de contraste de los chats, hecha (observatorio)

### Added
- `tips/tanda-2026-11-contraste.md` (acta, 98 KB): los 336 chats de la PC `clientes` (todos hasta el corte nuevo, **2026-10-26 14:47 UTC**)
  leídos **con las 49 decisiones de A-H en la mano**. 83 lectores Sonnet por lotes de 200 KB, 3 síntesis Opus, suma mecánica por script.
  Veredictos: 17 confirmadas · 17 contradichas (casi todas "línea de base": hoy pasa lo que la decisión viene a cambiar) · 14 mixtas · 1 sin
  evidencia. ~10 decisiones a reabrir en la revisión integral; hábitos cruzados con el acta de `Usuario`; **propuestas P66-P77**; una cuarta
  sección abierta ("otras cosas") por pedido de Guido; 7 lecciones de receta. **Costo real: 22,1 M de tokens nuevos**, 1,3-2× el presupuesto que
  vio Guido (la causa, medida: el `ya-sabido` de 112 KB que cada lector lee entero). Lo crudo (lo nuevo condensado, hallazgos, síntesis, scripts)
  en `D:\vibe-hallazgos\contraste-2026-11\` y su copia en el privado `vibe-research` (`biblioteca/`, 1.399 archivos).
- `recortar.py --modo contraste`: conserva enteros los mensajes entre sesiones (o hasta `--bytes-mensaje`), 5 líneas de cada respuesta de tarea
  y las marcas `[SendMessage →]`, `[Agent]`, `[Skill]`, `[AskUserQuestion]`; el presupuesto se imprime con dos cotas. Probado con 3 chats.

### Changed
- **H cerrado (✅)**: Guido aprobó las decisiones 7-14 **con una corrección a la 9**: el tope del spec pasa de corte automático a **aviso** (el
  script mide, el Arquitecto propone dónde cortar, decide él; "el spec no crece durante la obra" queda firme). Evidencia nueva en §10: 47
  worktrees `D:\Hermes-*` en la raíz del disco de Guido (la skill `director` de Hermes los manda afuera del repo a propósito); el método los
  mete en `.claude/worktrees/`. DISENO-H (cabecera, §2, §10-§17, §20, §23, §24), TABLERO §10, PLAN y el LECTOR al día.
- `PLAN-lectura-contraste.md`: números medidos, las decisiones de Guido al lanzarla (mensajes enteros; "relevar más que lo mínimo"); `LECTOR-contraste.md`
  con la cuarta sección; `METODO.md` con la fila corrida.
- **Orden del resto del tramo 4** (Guido, 2026-10-26): I → revisión integral con el acta abierta (sin volver a los chats) → G.1 mañana → spec.
  Handoff y TODO al día.

## 2026-10-26 — Los chats de la misión 4, guardados para la revisión del proceso

### Added
- `docs/chats-mision-4/`: siete chats condensados de la PC `Usuario` (racimos B, D, F, G y H, una rama corta de F y la pasada de hábitos;
  0,5 MB de 23 MB crudos) y su tabla de tokens, con un `LEEME.md` que dice para qué están: **la revisión del proceso de la misión 6**, y
  que la carpeta se borra después. Condensados con `condensar.py` (secretos tapados antes de escribir, sin salidas de herramientas ni
  subagentes), gitleaks limpio y revisión a mano de mails, links, documentos, montos y alertas. Va al repo público por decisión de Guido,
  frente a la alternativa del privado `vibe-research`. Asentado en la misión 6 del TODO y en `docs/README.md`.

## 2026-10-26 — El acta de hábitos de la PC `Usuario` (observatorio)

### Added
- `tips/tanda-2026-10-habitos.md`: qué le pide Guido a mano, una y otra vez, en sus chats de la PC `Usuario` (uso personal; 68 chats, 613
  mensajes suyos, 2026-06-13 a 10-25). 19 familias: 12 ya cubiertas por los diseños A-H, 5 en parte, 1 nueva; propuestas **P58-P62**. 5
  lectores Sonnet, ~600 mil tokens (1,9× lo presupuestado). Corte nuevo de esta PC: 2026-10-25 15:48 UTC. Trae el brief para `clientes` (§6),
  que absorbe la lente B de la lectura de contraste.
- `observatorio/investigacion/recortar.py` (el recorte "mensajes de Guido + primera línea de Claude": baja la entrada ~24 veces) y
  `LECTOR-HABITOS.md`; las dos filas en `METODO.md`.

### Changed
- `PLAN-lectura-contraste.md`: el recorte ya existe (le falta conservar el cuerpo de los mensajes entre sesiones); ~120 mil por lector; la
  lente B cruza contra el acta de hábitos. Handoff y TODO al día.

## 2026-10-26 — Misión 4, tramo 4: el racimo H (niveles y puertas del Arquitecto), con Guido adentro y revisado; la lectura de contraste planificada

### Added
- `docs/mision-4/DISENO-H-niveles-y-puertas.md`: el racimo H, catorce decisiones (1-6 aprobadas en bloque el 2026-10-24; 7-14 presentadas el 25
  sin objeción, **provisorias hasta el OK explícito de Guido**). Antes de decidir, un lector Sonnet levantó la ficha "hoy" del kit instalado
  (~168 mil tokens: tres puertas, ninguna aplica la regla de tamaño, cuatro criterios de "cuándo spec" que se contradicen, cuatro vocabularios
  de tamaño, el Arquitecto no conoce director ni worktrees, 0 llamadas en la PC `Usuario`) y el agente guía verificó 10 afirmaciones sobre
  worktrees contra la doc oficial (~85 mil: `-w` ramifica solo desde el remoto y no acepta rama propia, reabre por nombre, `.worktreeinclude`,
  `CLAUDE_PROJECT_DIR` no sigue al worktree). Después de la primera tanda, un investigador Sonnet contrastó con otros métodos (~147 mil, 19
  búsquedas: Anthropic, Kiro, superpowers, Codex, Thoughtworks; nadie pone tope al spec ni exige entorno de prueba declarado). Lo central: **una
  sola regla de tamaño** (las dos preguntas de B) que la sesión plana dice en una línea sin preguntar, y lo chico nunca pasa por el Arquitecto;
  dos ejes con nombre (tamaño del pedido · nivel del proyecto `liviano | estandar`, largo calculado); director solo si se escribe a la vez;
  subproyecto = módulo con nombre; el Arquitecto termina armando el módulo y dando la línea de apertura; entorno de prueba declarado en el spec,
  verificado por script y chequeado al abrir; ramas `modulo/<x>` y worktrees por el script `worktree`; tope del spec por tamaño; prototipo antes
  del spec; `sensible:` a reglas por script. Revisor frío Opus (~250 mil): **45 hallazgos (10 rompe), todos aplicados, 6 con otro arreglo**; los
  más graves: "liviano" dejaba sin red a lo personal con código, y la mecánica de worktrees rompía "un escritor por checkout" de cuatro formas.
  Cada decisión dice cuál de las cuatro cosas de Guido mueve (workflow · mejor código · consistencia · acordarse de menos). Tres preguntas
  nuevas contadas (una negativa en el neto) y una acción.
- `observatorio/investigacion/LECTOR-contraste.md` y `PLAN-lectura-contraste.md` (borradores, redactor Opus ~122 mil): la **segunda lectura de
  los chats** que pidió Guido, como lectura de contraste (49 decisiones de A-H con qué cuenta como confirmación y qué como contradicción; más
  hábitos y huecos). Corre en la PC `clientes`; alimenta la revisión integral. Falta `recortar.py`.
- Fila de H en `docs/README.md`; `PLATAFORMA.md` §7 (worktrees verificados, con las citas).

### Changed
- Notas de H en `DISENO-A` (§6), `DISENO-B` (§6, §9, §10, §13, §20), `DISENO-C` (§2.5), `DISENO-D` (§4, §7, §8, §10, §12.8, §19), `DISENO-E` (§4,
  §14), `DISENO-F` (§9, §14), `DISENO-G` (§12, §22), `TABLERO.md` (fila H; subproyectos resueltos), `PLAN.md` (H 🟡; el orden I → G.1 →
  revisión integral con la lectura de contraste), `observatorio/investigacion/METODO.md` (las dos piezas nuevas).
- `docs/TODO.md`: H 🟡 con las 7-14 a confirmar; la lectura de contraste y el acta de hábitos de la PC `Usuario` como pendientes.
- Memoria: dos notas nuevas (las cuatro cosas con que Guido juzga una decisión; las dos PCs tienen uso distinto).

### Pendiente que esta sesión deja abierto
- La sesión del observatorio "hábitos que Guido repite a mano" condensó los chats de la PC `Usuario` (fuera del repo) y quedó esperando el OK
  de Guido con el presupuesto; sin acta todavía.

## 2026-10-24 — Misión 4, tramo 4: el racimo G (la mesa entre directores, las PCs y el buzón), con Guido adentro y revisado

### Added
- `docs/mision-4/DISENO-G-mesa-y-pcs.md`: el racimo G, doce decisiones aprobadas en bloque por Guido. Antes de decidir, un lector Sonnet
  midió la mesa real en disco (~245 mil tokens: `mesa/` no existe; la mesa son dos contratos de 527 y 317 KB escritos a mano, tres
  vocabularios de 13, 5 y 6 tipos, ninguna configuración de mensajería en esta PC) y un agente guía verificó 25 afirmaciones contra la doc
  oficial (~155 mil: `SendMessage` entre PCs solo con la misma cuenta y Remote Control; VS Code tira un mensaje retenido a los 5 minutos;
  `crossSessionInbound: accept` solo vale en los settings de usuario; WSL y Windows nativo no se ven; entre cuentas no hay camino nativo).
  Lo central: **el contenido de la mesa va siempre por git** (un archivo ≤2 KB por mensaje dentro del módulo, que nunca se edita; abierto o
  acordado lo calcula un script) y el aviso por `SendMessage` es opcional; seis tipos de mesa en una tabla única; acuerdos que viven una vez
  y van al PO solo si cambian el alcance; recursos compartidos con dueño; "trabado por mesa" calculado y, por decisión de Guido, **nadie le
  avisa: lo ve al abrir el otro proyecto**; `crossSessionInbound: accept` lo pone el Equipador; dos personas con `fetch`, aviso de commits
  ajenos y commit por rutas; números de decisión por módulo; lecciones al repo por script; `aprueba:` por alias. Revisor frío Opus: 34
  hallazgos (10 rompe), 32 aplicados tal cual y 2 con otro arreglo. El más importante dio vuelta el planteo: **git ya cruza cuentas** (el
  compañero lee los repos con su GitHub), así que **el buzón multiagente pasa al racimo G.1, opt-in**, con su brief de siete decisiones,
  investigación en internet y piloto de un mes (§18). Guido eligió el enfoque C ("la mesa se queda y es lo más importante; el buzón, aparte")
  y pidió que los diseños se le presenten con el cuadro conceptual antes de las decisiones.
- Fila de G en `docs/README.md`.

### Changed
- Notas de G en `DISENO-B` (§5, §12, §14: la carpeta `mesa/` del módulo, el contrato viejo como histórico, `candado:mesa`), `DISENO-D` (§8
  merge sin squash; §9 la tabla de tipos la fija G), `DISENO-E` (§4 `aprueba:` y `mesa:` en la ficha; §10 cuatro chequeos nuevos del
  Equipador), `TABLERO.md` (cinco filas resueltas, entre ellas la segunda cuenta de GitHub: es el compañero), `PLATAFORMA.md` §6.2
  (reabierto: Remote Control deja de ser requisito), `FLOTA.md` §8 (cerrada) y `PLAN.md` (G ✅; el buzón a G.1).
- `docs/TODO.md`: G ✅; el orden que fijó Guido: **H → I → G.1 al final**, después la revisión integral y el spec.
- Memoria: nueva nota de feedback (el cuadro conceptual antes de las decisiones).

### Fixed
- **La identidad de git**: la cuenta de Guido es `guido.camera.eq@gmail.com`, no `eq.chatgpt@gmail.com` (la del plugin v1), que era la de
  respaldo de la skill `/cierre` y con la que salieron los commits de esta PC. Configurada global en la PC `Usuario`; la skill corregida; los
  commits viejos no se reescriben (repo público).

## 2026-10-23 — Misión 4, tramo 4: el racimo D (el método director/obrero y el workflow diario), con Guido adentro y revisado

### Added
- `docs/mision-4/DISENO-D-director-obrero.md`: el racimo D, once decisiones tomadas de a una con Guido (es el racimo que más usa: "lo quiero
  en todos los proyectos"). Nació de una entrevista a él y de dos lectores antes de decidir: uno Opus sobre las skills reales de Desktop,
  Mobile y Deptos en disco (~365 mil tokens; mostró que **Deptos, la versión corta, es la más cerca del canon**: 97% genérica, 0 rutas
  clavadas, verificador por script, y que el `/estado` y el `/verificar` de Deptos son del negocio, no del método) y uno Sonnet sobre las
  trabas registradas (~215 mil). La mecánica de la plataforma se verificó contra la doc oficial (~118 mil): Guido trabaja en VS Code, una
  sesión puede lanzar otra con nombre y modelo desde el CLI, un hook puede aprobar por regla propia, y **un mensaje nunca aprueba un permiso**.
  - Director **por tamaño**, con triage en la puerta y el Arquitecto como ruteador; **sin agente PO** (lo que Guido le pedía ya tiene dueño).
  - `/obrero` y `/tramo` **separados con un núcleo común** (Guido pidió repensar la unificación y tenía razón); delegar solo con razón con nombre.
  - Tabla de roles: Sonnet por defecto en obrero y tramo, Opus si el director lo decide; red team con `model:` fijo y criterio de salida (máx. 3
    rondas); tres herramientas nuevas (`subpaso-cierre`, lector de capturas, red team de construcción) y seis descartadas con razón.
  - **Guido abre las pestañas por default** (una línea en vez de tres renglones); el director solo si se lo pide o de noche; un hook aprueba la
    sección AUTORIZADO del encargo leída desde la rama del módulo; **las 5 de A** piden clic de día y `deny` + PARADA de noche.
  - Una rama por módulo con el director dueño, un escritor por rama y por archivo, el director mergea, `/cierre` del proyecto solo al mergear a
    `main` (**provisoria**, a revisar en la integral del tramo 4).
  - Silencio entre agentes, una suscripción por obrero, el despertador nocturno **afuera** del director; revisión congelada en un SHA con tres
    niveles y ≤2 vueltas; "**compactar es una falla**", dos umbrales por script, el obrero termina si le falta poco y se reutiliza; el gate como
    script, `/smoke` con contrato, cero datos clavados con candado; tres clases de decisión y la alarma de intervenciones por script; el canon
    entra por el módulo nuevo, **piloto en Deptos**.
  - La ficha canónica del ciclo de punta a punta, con "lo que hace Guido y nada más".

### Changed
- **Revisor frío** (Opus, ~158 mil): 25 hallazgos; 21 aplicados en el texto (entre ellos: el obrero podía escribirse su propio AUTORIZADO; de
  noche en bypass las 4 de A no frenaban; `/cierre` en la rama del módulo pisaba el handoff de `main`), 1 rechazado con razón, 3 decididos por
  Guido: **"publicar un release" entra como quinta pregunta de A §2**; TABLERO §11 enmendado (la bitácora ya no es rama aparte; se conserva
  "un escritor por checkout"); la mensajería en VS Code, confirmada por él.
- Notas cruzadas en `DISENO-A` §2, `DISENO-B` §5 y §6, `DISENO-C` §4, `DISENO-E` §4, `DISENO-F` §13 y §16, `FLOTA.md`, `TABLERO.md` §11,
  `PLAN.md` (tabla del tramo 4, lección nueva para el ciclo) y `docs/README.md`.
- Memoria: Guido trabaja en la extensión de VS Code; la mensajería entre sesiones le funciona con `/rename`.

## 2026-10-23 — Nota post-cierre: el racimo D se amplía al método director/obrero y al workflow diario de Guido

### Changed
- Guido preguntó en qué racimo se diseñaba el método director/obrero y la respuesta fue "en ninguno con ese nombre": estaba
  repartido entre A (qué pregunta y verifica), C (cómo reporta), B (qué escribe), D (modelos y revisión), G (cómo se hablan) y H
  (cuándo hay director). Pidió que **D** lo tome entero: la anatomía canónica de director, obrero y tramo (un solo dialecto de
  los tres), la revisión de las skills que viven en sus repos, qué skills faltan o sobran, cómo estandarizar sin perder lo propio,
  y las mejoras a su día a día. "Es lo que más uso para codear; acá es donde más quiero participar." Anotado en `PLAN.md`
  (tabla del tramo 4), `TABLERO.md` §10 (fila D), el TODO y el handoff, que trae el brief de D.

## 2026-10-22 — Misión 4, tramo 4: el racimo B (documentos con tope), con el modelo de módulos de Guido y revisado dos veces

### Added
- `docs/mision-4/DISENO-B-documentos.md`, el racimo B: el sistema de documentación de cada proyecto. Nació de dos lectores
  pedidos por Guido antes de decidir (Opus sobre Hermes por `gh`, ~80 mil tokens; Sonnet sobre gentle-ai, ~45 mil): el de
  Hermes mostró que el tablero de un tramo pesa 1,7 MB con ~70 mil caracteres vivos, y cambió el diseño de "adoptar lo del
  Hub" a **una carpeta por módulo con la ficha (estado, con tope) y la historia (bitácora de archivos chicos) separadas**.
  - `docs/` en cuatro capas: el plano de la app (`NORTE.md`, `MAPA.md` con diagrama a nivel módulos) · la capa de sesión con tope
    (handoff de 5.000 bytes, secciones fijas; cabecera del TODO) · `modulos/<x>/` (ficha, spec con el pedido textual, y con
    director `tiempos.md`, `planes/`, `bitacora/`) · `referencia/` y `archive/`. Seis archivos y tres carpetas en la raíz.
  - Tres tamaños, una estructura: chico (en el chat), módulo solo, módulo con director. La prueba de dos preguntas la hace el
    Arquitecto; lo que creció lo convierte `/cierre`. El módulo nace en `main` y se construye donde se construye el código.
  - El hook de arranque en node, con presupuesto de 9.500 caracteres, orden de recorte, aviso "CORTADO" y huella; las líneas de F
    y de E adentro. El TODO con edad por `git blame` (lo de 90 días baja a 🟢 solo; 🔴 nunca). El cierre cruza lo anunciado con lo
    anotado y lee los registros solo por sus primeras 20 líneas. El candado de estructura por script, con cinco ids quitables
    por proyecto, en el hook de escritura, en el cierre y en `doctor`. El `CLAUDE.md` del molde reordenado por los 11 criterios.
    Engram queda en espera con dos medidas para el piloto.
  - Revisor frío (Opus): 33 hallazgos, 30 aplicados, 1 recortado, 2 descartados con razón. Revisión de coherencia de Fable
    contra A, C, E y F, pedida por Guido: 20 correcciones (entre ellas, la fecha a mano en el TODO contra el criterio 6, la
    tercera pregunta que hacía módulo a un hotfix, y el módulo que nacía en una rama que `main` no veía).

### Changed
- `docs/mision-4/PLAN.md`: B ✅ en la tabla del tramo 4; lección nueva (un lector barato mide los repos reales antes de diseñar;
  subagentes nunca en Fable). `docs/README.md`: la fila de DISENO-B.
- Notas cruzadas de B: `DISENO-A` §4 (`.claude/frenos.log` y el choque al mezclar desde varias ramas), `DISENO-C` §2
  (ficha + `tiempos.md`), `DISENO-E` §4, §5 y §7 (piezas nuevas; el adoptador migra `docs/` y trae seis documentos), `DISENO-F`
  §5 y §9 (`referencia/PRUEBA.md`), `TABLERO.md` §10 (sin `docs/specs/`).
- Mezclados dos commits del director del Hub en `TABLERO.md` §10: el registro separado del ecosistema, publicado en producción.
- Memoria de Claude: regla "subagentes nunca en Fable".

## 2026-10-22 — Misión 4, tramo 4: el racimo F (seguridad por defecto), revisado y con tres correcciones de Guido

### Added
- `docs/mision-4/DISENO-F-seguridad.md`, el racimo F, aprobado por Guido en bloque, corregido por él en tres puntos y
  revisado por dos lectores.
  - **Nueve barreras de archivos de fábrica** en el `settings.json` del molde (`.env`, `secrets/`, `*.pem`, `*.key`,
    `~/.ssh`, `~/.aws`, la config de `gh`), verificadas contra la doc oficial: frenan en todos los modos, incluido
    bypass; ningún nivel las anula. Sin reglas `ask` ni `Bash(...)`. Lo público va a un archivo con nombre no secreto.
  - **Un solo corrector de secretos por PC**: el hook que Guido armó a mano en esta PC, extendido a Write y Edit
    (cerraba H-161), instalado por el Equipador, con mensaje que da la alternativa, medido contra el historial antes
    de instalar, y leyendo la ficha para las excepciones.
  - **Usar sin ver** (corrección de Guido): comandos del proyecto (`db consulta`, `db migrar`, `db foto`) que cargan
    la credencial por adentro; Claude conoce el nombre de la variable, nunca el valor. `cargar-secreto` con entrada
    oculta para el humano. Las consultas y migraciones pasan de Guido a los obreros.
  - **Niveles de base** en la ficha (`entornos:` dummy · prueba · real), `secretos:`, `publicas:`,
    `datos-de-prueba:`, `push-publica:`. Una base dummy se declara en una línea.
  - **Las barreras son del proyecto** (corrección de Guido): `frenos.quitados` con id, razón y `hasta:` (`siempre` o
    fecha); los hooks y el actualizador lo leen; el vencimiento va a la salida única de C.
  - **Con permiso, igual con red** (corrección de Guido): foto verificada, transacción, rastro y revisión del plan
    (director o subagente fresco) antes de tocar una base real. Escribir en real no es pregunta; borrar sí (A §2).
  - gitleaks en el pre-commit versionado (`core.hooksPath` lo setea el arranque), `.gitleaksignore` vigilado, el
    arranque declara modo y barreras por lista de reglas, el bypass no se traba, una página de runbook "se filtró una
    credencial", tabla de medición y los 11 criterios con honestidad.
  - **§22, la revisión**: revisor frío (Opus, ~136 mil tokens) y lector de gentle-ai (Sonnet, ~128 mil): 26 hallazgos,
    9 que rompían (entre ellos una pregunta a Guido escondida); Guido pidió pasarlos por el criterio de diseño antes de
    aplicar: 24 aplicados, 1 fundido, 1 descartado por "por las dudas". Mecánica de `deny`, hooks y modos verificada
    contra la doc oficial con el agente `claude-code-guide` (2 tandas, ~234 mil tokens), con fuentes en §4.

### Changed
- `PLAN.md`: el tramo 4 marca ✅ F; una lección nueva (la regla de Guido de filtrar los hallazgos por el criterio
  establecido; verificar la plataforma contra la doc antes de decidir).
- `DISENO-E-molde-y-flota.md`: lo quitado pasa a un solo campo (`frenos.quitados`, unificado por F §14); el
  actualizador rehace una rama rota borrándola y subiéndola de nuevo, sin `push --force`.
- `DISENO-A-frenos.md` §4: ubicación propuesta por F para el registro de frenos (`docs/frenos.log`), a decidir en la
  revisión integral.
- `docs/README.md`: fila del DISENO-F. `docs/TODO.md`: F ✅, sigue B.
- El kit instalado en esta PC estaba viejo (del 3 de agosto; nadie había corrido el sync después de la misión 3): se
  sincronizó con `kit-sync.sh sync`, LIMPIO. Y la sesión arrancó con los dos commits del director del Hub ya en
  `origin/main` (contrato del registro, dos llaves): traídos con avance limpio antes de cerrar.

## 2026-10-22 — Misión 4, tramo 4: el racimo E (molde y flota), los 11 criterios y el ecosistema aparte

### Added
- `docs/mision-4/DISENO-E-molde-y-flota.md`, el racimo E, aprobado por Guido decisión por decisión y revisado.
  - **El Arquitecto como puerta única**: una skill que rutea 5 entradas (PC · proyecto nuevo · feature · consultorio ·
    flota) y deriva a piezas chicas; agentes como manos, scripts como ojos, sin memoria propia. Resuelve de frente el
    choque con ADR-004 y REJ-003 (el ADR se escribe al construir).
  - **La ficha del kit** por repo (`.claude/kit.md`): versión, `vars` de instanciación, estado y hash por pieza
    (`molde` · `molde+propio` · `adaptada` · `propia`), los frenos y lo sensible que pedía el racimo A. Una sola ficha.
  - **El actualizador**: clon temporal, regenera el molde sin pisar adaptaciones (zona `<!-- kit:propio -->`, archivo
    hermano para hooks, `settings.json` a tres puntas con `quitado:`), chequeo mecánico, mezcla a `main` si pasa, una
    línea en el CHANGELOG del proyecto, tabla final. Sin preguntas: reversible.
  - **Adoptar** un proyecto que ya anda (una pantalla y un "dale"), `kit/VERSION` con notas de migración, el hook que
    avisa versión nueva en las dos direcciones, el Equipador atrás de la puerta con `doctor`, `/smoke` y `/release`
    como contrato que no nace el día cero, `AGENTS.md` opt-in.
  - **El Hub como registro de la empresa** (4 pedidos: `repo`, `tipo`, "se conecta con", credencial de solo lectura)
    y las dos capas: kit genérico público · capa privada de la empresa. El actualizador no necesita el Hub.
  - **§16, la revisión**: un revisor frío (Opus) y una lectura del instalador de gentle-ai trajeron 17 hallazgos
    (4 que rompían el diseño); Guido aprobó 15 enteros y 2 recortados. **§17**: la tabla de los 11 criterios.
- `PLAN.md` §El foco: **la forma de pensar que pidió Guido** (filtro de 4 preguntas, recortar en vez de aplicar todo,
  partir de lo que existe, roles por la pregunta que responden) y **los 11 criterios de cada racimo**, con la regla
  de que cada `DISENO-*` cierra con su tabla y de la revisión integral al terminar el tramo 4.

### Changed
- `PLAN.md`: **el agente de ecosistema no es parte del Arquitecto** (decisión de Guido): va al racimo I, el último;
  orden A → C → E → F → B → D → G → H → I; el tramo 4 marca ✅ E; una lección nueva para el ciclo (el revisor frío va
  después de las decisiones de cada racimo).
- `TABLERO.md` §10: fila del **racimo I** con lo ya decidido (Hub como registro, dos agentes que se hablan, dónde
  vive); nota para el **racimo B** con las preguntas de carpetas del Hub (`docs/specs/`, carpeta de referencia) y cómo
  las resolvió ese mismo día.
- `DISENO-A-frenos.md` §6: apunta a la ficha del kit de E como la misma ficha que pedía.
- `docs/README.md`: fila del DISENO-E. `docs/TODO.md`: el Hub ya le puso tope a su hook; falta el Panel.
- Fuera del repo: brief entregado al director del Hub (sesión en esta PC) con los 4 pedidos y el concepto del agente
  de ecosistema; respondidas sus 5 preguntas de convención de carpetas separando lo firme del kit de lo abierto.

## 2026-10-21 — Misión 4, tramo 4: el norte del diseño y los racimos A y C

### Added
- `docs/mision-4/DISENO-A-frenos.md`, el racimo A.
  - **Decisión de Guido**: un agente le pregunta solo 4 cosas (borrar datos reales, tocar plata, manejar
    claves, mandar algo hacia afuera a su nombre).
  - Hay correctores y hay preguntas. Un corrector se pone recién a la segunda vez que se repite un
    error, y se saca si molesta más de lo que salva.
  - La receta de un freno sale del piloto de Desktop.
  - El molde trae de fábrica las 4 preguntas y el freno contra git destructivo.
  - El director verifica con scripts y los encargos van por referencia.
- `docs/mision-4/DISENO-C-salida-hacia-Guido.md`, el racimo C.
  - Silencio por defecto y un resumen de fin de día.
  - `/estado <proyecto>` y `/estado <subproyecto>`; sin nombre, sale del contexto de la pestaña.
  - La tabla de tiempos tiene estimado, real de máquina, real con Guido, tokens y complejidad.
  - **Estima el director, no un script** (corrección de Guido).
- `docs/mision-4/REFERENCIAS-EXTERNAS.md`, el mapa de gentle-ai, agency-agents y MetaGPT.
  - 8 ideas nuevas, cada una con su racimo.
  - Los descartes, con su razón. Engram quedó en espera para el racimo B.

### Changed
- `PLAN.md`:
  - **el norte para todas las decisiones** (Guido casi no interviene; ningún freno de adorno; decisiones
    en criollo);
  - el orden de los racimos (A → C → E → F → B → D → G → H);
  - la mensajería multiagente como pilar del racimo G.
- `TABLERO.md`: el buzón multiagente (objetivo 5, racimo G) y los **subproyectos dentro de un proyecto**
  (racimo H).
- `docs/README.md`: las filas de los 3 archivos nuevos.
- Fuera del repo:
  - vibe-kit se registró en el buzón piloto de la organización y contestó;
  - el kit se sincronizó en la notebook (`kit-sync` en LIMPIO).

## 2026-10-21 — Misión 4: checkpoint para mudarse de PC

### Changed
- `RADIOGRAFIA-director-obrero.md`, Anexo A.5: el estado del piloto, pedido a los dos directores en un
  mensaje con formato fijo y verificado en su git.
  - **Desktop**: el segundo freno (CM-65, git destructivo) y el trinquete de atribuciones, los dos ya
    aplicados; el A.4 se corrigió, porque los daba "en curso" y "sin aplicar".
  - **Mobile**: sin cambios de método desde D-194, con 8 hallazgos de reglas blandas. En H-161, un subagente
    rodeó un freno cambiando de herramienta.
  - Dos recetas nuevas para el racimo A: cubrir todas las herramientas, y que los permisos no desmientan la
    regla.
- `PLAN.md`: una lección para el ciclo. Pedir novedades con formato fijo anda; los avisos sueltos a una
  sesión cerrada, no.
- El handoff, reescrito para arrancar el tramo 4 en la PC `Usuario` (pull, sync del kit, gitleaks). El TODO
  quedó al día.
- El repo privado `vibe-research` subió las alertas al 21/10, así la otra PC las tiene.

## 2026-10-19 — Misión 4: el primer freno mecánico medido (Desktop)

### Changed
- `RADIOGRAFIA-director-obrero.md`, Anexo A.4. La tabla de CM-63 está hecha (verificado). CM-64 convirtió
  una regla blanda en un hook: contra 37.842 comandos reales dio 0 falsos positivos y habría frenado
  ~2.500, o sea que la regla blanda se rompía en ~6,6% de los comandos. Nace la receta "medir el freno
  contra el historial antes de instalarlo". Además, un cambio de método rompió un control propio, por
  segunda vez en la semana. El handoff apunta ahí; la alerta de caída a producción, ahora ocurrida, va
  solo al archivo privado.

## 2026-10-15 — Misión 4: Desktop también va a medir sus reglas nuevas

### Changed
- Decisión de Guido: Desktop no queda como contraste. En su próximo cierre agrega a la ficha de CM-63 la
  tabla "freno o regla blanda · cómo se mide", así los dos proyectos juntan datos comparables. El pedido
  salió por la mesa. Que esté hecho: no verificado. Quedó registrado en la radiografía (Anexo A.3) y en
  el handoff.

## 2026-10-15 — Misión 4: Desktop adopta parte del cambio (CM-63)

### Changed
- `RADIOGRAFIA-director-obrero.md`, Anexo A.3: Desktop adoptó en un día las reglas de procesos de Mobile y
  pasó una regla a la definición del agente, porque avisada en cada encargo había fallado ~5 veces.
  Quedaron dos dialectos de la misma regla, y Desktop no adoptó P1 + P2, lo que deja un contraste para
  medir el piloto. Verificado en git. El handoff apunta ahí.

## 2026-10-15 — Misión 4: primeros datos del piloto de Mobile

### Changed
- `RADIOGRAFIA-director-obrero.md`, Anexo A.2: D-192 está escrito (verificado en git). Trae la primera
  falla del piloto (H-152: el cambio de método rompió otro control en un día; la cazó la medición de la
  línea base) y una regla que quedó con dos definiciones (H-151). El handoff apunta ahí.

## 2026-10-14 — Misión 4: la lista final de Mobile en la radiografía

### Changed
- `RADIOGRAFIA-director-obrero.md` suma el Anexo A.1, con la lista final que aprobó Mobile (D-192). Las
  dos sugerencias de la radiografía quedaron aceptadas: cada regla dice si es freno o regla blanda, y cómo
  se sabrá si funcionó (P1 + P2), y la regla contra esquivar controles va en la definición del
  implementador. El handoff lo anota como piloto para el tramo 4.

## 2026-10-14 — Misión 4, tramo 3: el mapa por objetivos

### Added
- `docs/mision-4/TABLERO.md` reparte todo lo investigado entre los 7 objetivos, cada cosa con su línea base:
  P1-P57, las 10 mejoras de la radiografía, el tramo 2, el Anexo A y 50 hallazgos nuevos del barrido.
  - Una tabla de líneas base que se repiten cada mes con los scripts de `observatorio/investigacion/`.
  - Las 10 mejoras marcadas: 4 adoptar, 4 construir y 2 mixtas.
  - 8 racimos como entrada al tramo 4.
  - Lo que no se rompe y lo que queda afuera.
- El barrido: 3 lectores Sonnet sobre las 5 síntesis, contra un índice de lo ya cubierto. Costó ~405 mil
  tokens (1,6× lo estimado).

### Changed
- `PLAN.md`: el tramo 3 quedó ✅ y hay 2 lecciones nuevas para el ciclo.
- `docs/README.md`: fila de `TABLERO.md`.

## 2026-10-14 — Misión 4: anexo de la radiografía (novedades de Mobile)

### Added
- `RADIOGRAFIA-director-obrero.md`, Anexo A: los 11 cambios al método que Mobile aprobó el 10-14, que
  mandó su director de parte de Guido. Cada uno está cruzado con la radiografía (3 mejoras ya en piloto,
  2 hallazgos nuevos) y marcado como freno o prosa (solo 1 es freno). El brief del tramo 3 en `PLAN.md`
  ya lo incluye.

## 2026-10-14 — Misión 4, tramo 2: la evidencia de afuera

### Added
- `docs/mision-4/FLOTA.md`: el inventario de los proyectos, armado por script sobre GitHub. Muestra:
  - 3 dialectos de director/obrero;
  - que ningún proyecto marca su versión del método;
  - que el hook de arranque del molde no tiene tope (dos proyectos se pasan del corte de la plataforma);
  - que el molde no trae reglas `deny`;
  - que `/smoke` y `/release` ya pasaron la regla de 3+.
- `docs/mision-4/REPOS.md`: lo que cuenta el historial de git de 10 proyectos (arreglo del arreglo: 26%
  de mediana; arreglos con prueba: 0-45%; commits de solo documentos: 51-82%). Son las líneas base del
  objetivo 2.
- `docs/mision-4/PLATAFORMA.md`: qué de lo armado a mano ya es nativo de Claude Code (abrir sesiones,
  avisos, estado, mensajes entre PCs, frontmatter de subagentes, barreras, plugins, esfuerzo y caché).
  Lo hizo el agente `claude-code-guide`: ~312 mil tokens, 3× lo estimado. El chat principal verificó las
  2 páginas clave.
- `observatorio/investigacion/`: `flota.py`, `huella.py` y `repos.py`, para repetir la medición.
- TODO 🔴: ponerle tope al hook de arranque del molde (fuera de la misión 4).

### Changed
- `PLAN.md`: el tramo 2 quedó ✅, el brief del tramo 3 dice qué entra del tramo 2, y hay 2 lecciones
  nuevas para el ciclo.
- `docs/README.md` y `observatorio/investigacion/METODO.md`: sus filas nuevas.

## 2026-10-14 — Misión 4, tramo 1: la radiografía de director/obrero

### Added
- `docs/mision-4/RADIOGRAFIA-director-obrero.md`: cómo está armado de verdad el sistema director/obrero
  de los dos proyectos largos, comparando lo escrito con lo comportado. Trae costo, fallas por causa, lo
  que no hay que romper, los dos dialectos del método, 10 hallazgos nuevos y 10 mejoras con su línea base
  (para el mapa del tramo 3). Costó ~452 mil tokens, con 2 lectores Opus.
- `docs/mision-4/PLAN.md`: la sección "Lecciones para el ciclo", con 4 lecciones de la misión 3 y una
  del tramo 1. El plan mismo, el tramo 0 (la biblioteca privada) y el inventario de la flota se habían
  armado antes ese día, en los commits `21eee8c`..`da07786`.
- TODO: la **misión 6, escribir el ciclo de mejora del método** (pedido de Guido).

### Changed
- `PLAN.md`: el tramo 1 quedó ✅, y el brief ahora apunta al mapa del tramo 3 (decía "tramo 2").
- `docs/README.md`: la fila de la radiografía.
- `/inicio` y `/cierre` del repo (no los del kit): el handoff trae el título de la sesión siguiente
  (`vibe-kit M<n> · <qué hace>`) y `/inicio` lo pone al confirmar la misión. Lo pidió Guido.

## 2026-10-13 — Misión 3: el repo se ordena

### Added
- **La portada se viste**: banner y diagrama con estilo de plano de arquitecto (`assets/`), insignias
  que se actualizan solas, un día de trabajo de ejemplo y los principios. El nombre del proyecto queda
  abierto (Guido lo decide más adelante).
- En GitHub: la descripción "About" nueva y las etiquetas `claude-code`, `vibe-coding`, `claude-skills`,
  `metodo`; la imagen para compartir (Social preview) subida. Se genera desde el banner y no se versiona
  (REJ-010).
- `docs/MISION-Y-VISION.md` (para qué existe, para quién, qué NO hace) · `docs/TODO.md` · este CHANGELOG ·
  `docs/README.md` (índice de `docs/`) · índice al tope de `DECISIONS.md` · `LICENSE` (MIT pura, para que GitHub la reconozca) + `NOTICE` (la excepción del texto de FyD) · ADR-023.
- `observatorio/` con su README: el Extractor y la investigación, juntos.
- `.claude/scripts/kit-sync.sh`: compara y sincroniza kit↔`~/.claude/` conservando la carpeta de
  proyectos de cada PC (antes, el `cp -r` del `/cierre` la pisaba).

### Changed
- README: solo portada, sin pendientes, historial ni versión. Pendientes → `docs/TODO.md` (REJ-005
  reabierto); versiones → este archivo.
- `guias/` → `manuales/`; la guía del Extractor, al lado de su herramienta; `docs/consulta/` para lo de
  referencia.
- El hook, `/inicio` y `/cierre` del repo siguen el molde de los proyectos del Arquitecto.
- Kit: la carpeta de proyectos del Arquitecto es un lugar vacío (`{{CARPETA_DE_PROYECTOS}}`) que llena
  el instalador; `/relevamiento` corrige la autoría de las plantillas (de Guido, aprobadas por su jefe).
  Sin bump: solo textos.

### Fixed
- REJ-006 marcado como reabierto (el repo lleva `/inicio` desde ADR-013) · el CLAUDE.md suma "Comandos
  clave" como los proyectos · rutas viejas de la carpeta "Guia de vibe coding" en el Extractor y los templates.

### Removed
- `docs/PRESUPUESTO-relevamiento.md` → `legacy/`, con lápida.

## 2026-10-12/13 — Misiones 1 y 2: la investigación de los chats

### Added
- `docs/SPEC-investigacion-chats.md` y la hoja de ruta de 5 misiones (ADR-021).
- `tips/tanda-2026-10-chats.md`: 68 hallazgos + anexo de la PC del compañero, 57 propuestas (ADR-022).
- El método escrito con sus scripts y la medición de costos (hoy en `observatorio/investigacion/`).

## 2026-08-03 — `/relevamiento` · v2.3 → v2.4.2

### Added
- **v2.3**: la skill `/relevamiento`, el tramo de ANTES del Arquitecto: método de arranque de 4 etapas
  con PDF por etapa, revisor de 6 chequeos, 9 lentes con gatillo por cita y costura al Arquitecto por
  token explícito (ADR-016, ADR-017).
- **v2.4**: el abanico de 6 salidas (construir es solo una), arrancar desde material que ya existe, la
  regla de oro de la hoja de campo (ADR-018).

### Fixed
- **v2.4.1**: la detección de Chrome, con evidencia medida (`where chrome` devuelve vacío; anda el
  respaldo a las 3 rutas conocidas).
- **v2.4.2**: las 4 secciones huérfanas del TABLERO ya tienen quién las escriba; las tareas pendientes
  se guardan cuando aparecen (ADR-019).

### Changed
- Convención documental del repo: los SPEC implementados se marcan y se quedan; lo consumido va a
  `legacy/` (ADR-020). Se retiró el zip portable.

## 2026-07-24 — `docs-fyd` y el Equipador auto-actualizable · v2.2, v2.2.1

### Added
- **v2.2**: `docs-fyd`, la documentación de auditoría FyD por repo, con las dudas resueltas por
  opciones (construido 2026-07-23, 16/16 verificado — ADR-014, ADR-015) · el Equipador se
  auto-actualiza (`actualizate`).

### Fixed
- **v2.2.1**: la checklist proactiva de `docs-fyd` queda condicionada al repo (arreglo de fatiga tras la
  evaluación de campo sobre Hermes: PASS).

## 2026-07-11 — El Arquitecto completo · v2.1

### Added
- El Arquitecto con sus Modos A, B y C, el Equipador y los templates del playbook (ADR-012).
- El kit llega a la segunda PC (d:\SAAS).
