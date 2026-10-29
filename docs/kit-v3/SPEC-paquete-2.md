# SPEC delta: paquete 2 — documentos con tope, hook en node, candado, `cambios`, zona propia, `/inicio` y `/cierre` v3 — vibe-kit
Cada proyecto arranca viendo un estado que no miente (con edad y huella), no puede tirar archivos sueltos en `docs/`, cierra con un
candado que dice qué arreglar, y ningún freno se quita sin el clic de Guido.
- Estado: READY (sellado por Guido el 2026-10-28) · **D2.1 ✅ IMPLEMENTADO 2026-10-28** (ver "Lo que cambió en la construcción") · D2.2 pendiente
- Fecha: 2026-10-28
- Misión: 5, directores **D2.1** (este delta y la primera mitad) y **D2.2** (la segunda mitad y el revisor frío del paquete)
- Plano: [`SPEC-0-kit-v3.md`](SPEC-0-kit-v3.md), orden 2 = **P3.3, P3.5, P3.6, P3.9, P3.10, P4.1, P4.2, P6.1, P6.8a, P5.1, P5.2**, más
  **P3.2** y **`pruebas/pedidos.md`** (Guido, 2026-10-28). **P3.4 no entra** (el SPEC-0 la pone en el orden 5): acá solo se fija lo que el
  hook y el candado leen de una ficha de módulo (Cruces, fila 11). Diseño: B §4-§14 · E §4-§5, §11 · F §5-§7, §9, §15, §17 · H §4,
  §10.3, §11, §14 · D §7.3-§7.4, §12.6, §22ter · ADR-026.
- Sello del Arquitecto: `arquitecto: 2026-10-28 · kit 2.4.3 · chequeos: tamaño — (paquete del método) · entorno ✅ (../vibe-kit-pruebas/) · tope ⚠️ 41 KB (la tabla de cruces y el registro del red team) · sellado a mano por Guido` — sus palabras: "Sellado tal cual" (las tres ⚠️ ya las había decidido: "sí, las tres").
- Red team: **corresponde** (P6.8 está en RF-16; el paquete trae un hook que niega y `candado:barreras`): Opus con `redteam-spec`, tres
  rondas antes del sello, la última sin ALTOS (sección final). Revisor frío Opus sobre el diff entero, al cerrar D2.2.

## Por qué (el dolor)

Un handoff de 534 KB, hooks que inyectaban más de lo que la plataforma deja ver, estados que mintieron un mes ("el hook dice NO
ARRANCADO: ignoralo"), 171 archivos sueltos en Devoluciones (TABLERO §1; B §3, §9). Y lo que viene se para sobre esto: el candado exige
`cambios aprobar` desde acá (RF-2).

## Contexto (explorado el 2026-10-28)

- `kit/molde/` tiene solo lo del paquete 1 (`kit.ejemplo.md`, `hooks/lib/ficha.cjs`). El molde v2 (`kit/skills/arquitecto/templates/
  universales/`) trae el `session-start.sh` del `v2.4.3` (handoff 5.500, huella contra 10.000), un handoff con "Qué se hizo" y "Archivos
  tocados", un TODO con fecha a mano y un `/cierre` que ofrece `stash`. No hay hook de escritura, candado, `cambios` ni zona propia.
- **Los repos de prueba viven afuera**, en `../vibe-kit-pruebas/` (Guido, 2026-10-28: adentro se cargaban su `CLAUDE.md` y sus skills en
  la sesión de vibe-kit, y al revés). `rehacer.sh` y `pedidos.md` se quedan en `pruebas/`. **Corrige al SPEC-0** ("Entorno de prueba").
  Nunca `Read` adentro de un repo de prueba: Bash. `pedidos.md` todavía no existe.
- `kit/VERSION` = `2.4.3`; node 24: `node --test "kit/**/*.test.cjs"`.

## Cómo se instancia el molde

`kit/molde/hooks/**` → `.claude/hooks/**` · `scripts/**` → `.claude/scripts/**` · `docs/**` → `docs/**` · `settings.json` →
`.claude/settings.json` · `CLAUDE.md` → `CLAUDE.md` · `skills/**` → `.claude/skills/**` · los `.snippet` se agregan al `.gitignore` y al
`.gitattributes`. **`*.test.cjs` no se instancia.** Todo script node del molde es **`.cjs`** (⚠️ de D1.1). En este paquete instancia
`rehacer.sh`; desde el orden 4, el Arquitecto.

## La frontera entre D2.1 y D2.2

| | D2.1 (primero) | D2.2 (después) |
|---|---|---|
| Piezas | **Precondición** · P3.3 · P3.5 · P3.6 · P3.9 · P4.1 · P4.2 · **las librerías compartidas** | P3.2 · P6.1 · P6.8a · P3.10 · P5.1 · P5.2 · `pedidos.md` · **fichas de fábrica por nivel** |
| Por qué | Lo que **lee**, y su base. Si la precondición falla cambia la carpeta de `cambios/` y `frenos.log`: hay que saberlo antes de D2.2 | Lo que **decide y frena**, y las skills que lo usan todo. El revisor frío ve el paquete entero |
| Le deja al otro | `lib/topes.cjs` (`candado:topes`), `lib/arbol.cjs` (`candado:raiz`), `lib/contexto.cjs` (ficha vigente, pestaña, rol), `lib/frenos-log.cjs`, `lib/git.cjs`, `lib/todo.cjs` | — |

Se parte porque once piezas, dos de ellas las más delicadas del kit, pasan la mitad del contexto de un director (tracker, "Límites"). La
propuesta del tracker queda, con un cambio: **las fichas de fábrica por nivel entran a D2.2** (⚠️).

## D2.1 — AGREGA

### 0 · La precondición, primero (SPEC-0 Supuestos [ALTO], RF-18)

Un encargo Opus, **antes que ningún otro**, con `claude -p` en un clon temporal de `alfa` (nunca en vibe-kit). *En `clientes` no hay
`claude` en el PATH: se usa el `claude.exe` que trae la app de escritorio (`%APPDATA%\Claude\claude-code\<versión>\…\claude.exe`, la más
nueva; hoy 2.1.309), y la versión queda anotada con el resultado.*
1. `node .claude/scripts/prueba.cjs` (escribe en `.claude/`), en `--allowedTools`, con `--permission-mode` `default`, `acceptEdits` y
   `auto`, desde la raíz y desde `.claude/worktrees/w1/`. **Control**: un `Write` a `.claude/` con `--allowedTools Write` tiene que quedar
   negado; si pasa, la prueba no distingue → "no concluyente" → "Lo prueba una sesión real", fila 6.
2. `SessionStart` en subagentes: un hook que agrega un renglón a un archivo fuera del repo, y un `claude -p` que lanza un subagente.
- **Si pregunta**: RF-18 sin volver a Guido (ya decidido): `frenos.log`, `cambios/` y `revisiones/` a **`.kit/`**; ficha y `settings` se
  quedan en `.claude/`. La ruta es una constante (`lib/frenos-log.cjs`; la de `cambios`, en D2.2). **Si corre en subagentes**: E4 corta la
  inyección cuando la entrada trae marca de subagente; si no la trae, se anota el costo.

### P3.3 · `docs/` en cuatro capas (B §4, §12, §13; F §17)

- `kit/molde/docs/`: `NORTE.md` y `MAPA.md` (una pantalla; `MAPA` opcional), `README.md` (tres líneas a `NORTE`, `MAPA` y el mapa del
  `CLAUDE.md`, más la tabla de mudanza vacía), `CHANGELOG.md`, `referencia/trampas.md` y `referencia/PRUEBA.md` (vacíos con cabecera).
- `kit/molde/CLAUDE.md` **mínimo**: el mapa de documentación de las cuatro capas (única copia, B §15) y la regla **"la evidencia con datos
  reales vive fuera del repo, con registro, y se borra al cerrar"** (F §17). *Se completa en el orden 5 (P3.7).*
- `manuales/se-filtro-una-credencial.md`: el runbook de F §17 con **las cinco fugas laterales**.
- Raíz de `docs/`: **seis archivos** (`NORTE`, `MAPA`, `SESSION_HANDOFF`, `TODO`, `CHANGELOG`, `README`) y **tres carpetas** (`modulos/`,
  `referencia/`, `archive/`). Una carpeta que falta no es falla (git no guarda vacías); una de más, sí.
- **`lib/arbol.cjs`**: `SEIS`, `TRES` y `juzgarRuta(raiz, ruta)` → nada o `{id: 'candado:raiz', mensaje}`: la regla 1 de B §14 sobre una
  ruta. La usan el hook de escritura y `candado:raiz`.

### P3.5 · El handoff con tope (B §8)

`kit/molde/docs/SESSION_HANDOFF.md`, **tope 5.000 bytes**, secciones **en este orden** (se reconocen por el principio del título):
`# Handoff — {{PROYECTO}}` · `## Estado` (con `- Rama · entorno: …`, los accesos temporales a producción y su fecha de borrado, F §12, y
`- Producción: <estado> · <fecha> · <cómo se verificó>` o `REPORTADO POR EL USUARIO` o `no hay`) · `## Próximo paso` · `## Bloqueos` ·
`## Te espera` · `## En curso` · `## Contexto`. Se van "Qué se hizo", "Archivos tocados" y "Cierre:" (los imprime el hook o git).
`topes.revisarHandoff(texto, nivel)` da falla con: más de 5.000 bytes, sección faltante, desordenada o prohibida, y en `estandar` sin
`- Producción:`.

### P3.6 · El TODO que no miente (B §10; nota de H)

- `kit/molde/docs/TODO.md`: `## 🔴 …`, `## 🟠 …`, `## 🟡 …`, `## 🟢 …` (por el emoji; el título es libre) y `## Reportado por el usuario`.
  **Sin la línea de fecha de cabecera del v2.** Ítem = `- [ ] …` en la columna 0 más sus renglones con sangría; `espera hasta: AAAA-MM-DD`.
- `lib/todo.cjs`: `items`, `cabecera(texto, tope)` (🔴 y 🟠, cortada en ítem entero), `podar` (a 🟢 lo que lleva **90 días** sin tocarse,
  salvo 🔴, `espera hasta:`, "Reportado" y lo ya en 🟢), `balance`. Edad por `git blame --line-porcelain`: el renglón más nuevo del ítem.
- `kit/molde/scripts/todo.cjs cierre [--base <ref>]`: poda y imprime **exactamente** `TODO: +n −m · k ítems · j bajaron a 🟢`. Base por
  defecto: el último commit que tocó el handoff (el cierre anterior). Ítems comparados por su primer renglón normalizado; lo que bajó no
  cuenta. Salidas 0 · 2 mal llamado · 3 sin TODO.

### P3.9 · Los dos `.snippet` (F §9; H §10.10; SPEC-0 `merge=union`)

- `kit/molde/gitignore.snippet`: `.env`, `.env.*`, `*.pem`, `*.key`, `secrets/`, `/.claude/worktrees/`, `/.claude/settings.local.json`,
  `/.claude/launch.json`, `/.kit-rol`. **Anclados** (un `launch.json` suelto ignoraría el `.vscode/launch.json` que un proyecto versiona).
- `kit/molde/gitattributes.snippet`: `.claude/frenos.log merge=union` (o `.kit/`). **No se llama `.gitattributes`**: adentro de
  `kit/molde/` le cambiaría los atributos a vibe-kit.

### Las librerías compartidas (`kit/molde/hooks/lib/`)

- **`contexto.cjs`**: de la entrada JSON del hook (o de `process.cwd()`): raíz del checkout por `git rev-parse --show-toplevel` desde el
  `cwd` (**nunca `CLAUDE_PROJECT_DIR`**, H §10.3), `git-dir` propio, rama, rama por defecto y **la pestaña**: `modulo/<x>` director ·
  `modulo/<x>--<ID>` obrero · `worktree-*` misión plana · otra, plana. **El rol**, de `.kit-rol` en la raíz del checkout: sin archivo
  `humano`; `director`, `obrero`, `nocturno`, `actualizador` tal cual; otra cosa, `desconocido`. **`fichaVigente(raiz)`, la regla de
  4.7** (RT2-3): `origin/HEAD:.claude/kit.md`; si no resuelve, `origin/<rama por defecto>`; sin remoto, la rama local por defecto
  (`init.defaultBranch` si existe, si no `main`, si no `master`). Da `ok` (datos), `sin-ficha` (aunque esté en el disco sin commitear) o
  `rota` (`archivo:línea`). **`modulo/*` y `worktree-*` nunca son rama por defecto** (ni por `init.defaultBranch`, que un agente cambia con `git config`; r2-5).
  **`origin/HEAD` solo vale si apunta a `main`, `master` o `init.defaultBranch`**: si apunta a otra rama
  (`git remote set-head origin modulo/x--01` se hace sin red), se ignora y se lee `origin/<esa rama por defecto>` (RT-p2 4). **`principal`**:
  el checkout es el principal si `git rev-parse --git-dir` = `--git-common-dir`; `carpetaRelativa()` da `.` en el principal y
  `.claude/worktrees/<x>` en un worktree (RT-p2 2).
- **`topes.cjs`**: los números, una vez: presupuesto **9.700** caracteres (corte 10.000); cabecera 250 · líneas de F 500 · edades 100 ·
  handoff **5.000 bytes** · módulos 300 · cabecera de ficha de módulo 1.000 · cabecera del TODO 1.500 · git 800 · títulos y huella 250
  (B §9); ficha `EN OBRA`/`PAUSADO` ≤ 5.000 bytes (B §5); `MAPA.md` ≤ 5.000 (G §21); mesa ≤ 2.000 (*orden 5*). `revisarHandoff` y
  **`revisarTopes(raiz)`**: handoff, fichas activas, `MAPA`, y lo que inyectaría el hook **llamando a `inyeccion.armar`** (B §14).
- **`frenos-log.cjs`**: `anotar({id, herramienta, detalle})`, un renglón en `.claude/frenos.log`, UTF-8, LF, solo agregar:
  `<AAAA-MM-DDTHH:MM:SS±hh:mm> · <rol> · <rama> · <id> · <herramienta> · <detalle>`. El detalle es una ruta relativa o un texto fijo,
  **nunca un valor que escribió el usuario**.
- **`git.cjs`**: git con tiempo límite; `edades(archivo)` por `git blame --line-porcelain`.

### P4.1 · `session-start.cjs` (B §9; F §15; E §8; H §10.3, §11)

`kit/molde/hooks/session-start.cjs` (entrada, salida, marca, lo propio) y `lib/inyeccion.cjs` (`armar({cwd, entrada, home, ahora})` →
`{texto, n, cortes}`, sin escribir nada). En `kit/molde/settings.json`: `node "$CLAUDE_PROJECT_DIR/.claude/hooks/session-start.cjs"`,
`timeout: 20`, **sin `.sh` intermedio**. Imprime, en orden, cada bloque con su tope (cortado en renglón o ítem entero, y dicho):
1. Si algo se cortó, **primera línea**: `CORTADO: <qué> — leé el resto en <ruta> antes de confiar en lo de abajo`.
2. Cabecera: proyecto (`vars.proyecto` o la carpeta) · rama · `kit <v>` con **"hay kit nuevo: <x>"** o **"esta PC está atrás:
   actualizate"** contra `~/.claude/VERSION` (sin `VERSION`, calla; E §8) · nivel · modo (`permission_mode`; si no viene, `defaultMode`
   "(configurado)"; F §15) · `handoff: <commit> <fecha>` (`git log -1 -- docs/SESSION_HANDOFF.md`). Sin ficha: `sin ficha: valen los
   frenos de fábrica`. Ficha rota: `ficha rota: <archivo>:<línea> — corré doctor`, y sigue.
3. Líneas de F: **nada**; 500 reservados (*orden 3*; RF-9).
4. **Por pestaña**: plana o misión → el handoff del disco. **Director** → cabecera de su ficha y el handoff de la rama por defecto por
   `git show`. **Obrero** → cabecera de la ficha por `git show modulo/<x>:docs/modulos/<x>/README.md` y **la ruta del encargo**
   (`docs/modulos/<x>/bitacora/*-encargo-<ID>.md`, D §15.2), **sin el handoff**; si el encargo no está, lo dice.
5. **Edad** al lado de `## Estado`, `## Próximo paso` y del `Estado:` de cada ficha: `(hace N días)` del renglón más nuevo por `git
   blame`, o `(sin commitear)`. **"estado viejo"** si después hubo commits fuera de `docs/` (handoff) o en la `rama:` del módulo.
6. Módulos activos (`Estado: EN OBRA` o `PAUSADO`; por `git show <rama>:` si tiene `rama:`, si no del disco): `<x> · <estado> ·
   próximo: <renglón "Próximo paso:">`.
7. Cabecera del TODO. 8. git: 5 commits, estado hasta 10 renglones, y **"origin tiene un handoff más nuevo (N commits): hacé pull"**,
   sin `fetch`. 9. El recordatorio de `/inicio`.
10. `session-start.propio.sh` con `bash`, con lo que sobre; **lo primero que se recorta** (B §9). Sin bash, una línea que lo dice.
11. **Última línea: `inyectado: N de 9.700`** (N con punto de miles, `.length` de JS de todo lo anterior).

Además deja la marca `<git-dir>/kit-sesiones/<session_id>` (solo `[A-Za-z0-9-]`) con fecha nueva: `/inicio` cuenta las otras de menos de
12 h (H §11). **Falla** (no niega nada; sale siempre con 0): ficha rota → arriba; error interno → `hook de arranque: error interno —
corré doctor`, el handoff crudo hasta 5.000 bytes y la huella; sin remoto ni ficha → entero; sin git → lo dice; sin node → no inyecta y
`/inicio` lo nota por la falta de huella (D2.2).

### P4.2 · El hook de escritura en `docs/` (B §7)

`kit/molde/hooks/escritura-docs.cjs`, `PreToolUse` sobre `Write`, en `kit/molde/settings.json` (`timeout: 20`). Juzga **solo la ruta**
con `arbol.juzgarRuta` contra la raíz del checkout del `cwd` (rutas de Windows y de worktree normalizadas): suelto en la raíz de `docs/`
o carpeta que no es de las tres → `permissionDecision: deny` con el mensaje de B §7 y un renglón en `frenos.log` (id `candado:raiz`,
herramienta `Write`); lo demás pasa sin salida. **Prendido** si la ficha vigente tiene `piezas.hook-escritura` distinto de `no`; apagado
sin ficha o sin la pieza. `candado:raiz` quitado con `hasta:` vigente → pasa. **Ficha rota → frena igual** y suma "corré doctor". **Si el
hook falla, deja pasar**: no está en la lista de 4.7; su red es el candado del cierre (B §7). **Medido antes de instalar** (A §5.2): los
`Write` de `~/.claude/projects/**/*.jsonl` de esta PC, **0 frenadas sobre los seis y las tres**; el conteo va al tracker.

### `pruebas/rehacer.sh`, su paso

`alfa` y `beta` reciben, en un commit `molde v3 orden 2`, lo de este paquete según "Cómo se instancia" (settings mezclados: el
`SessionStart` pasa al de node y se suma el `PreToolUse`), el árbol de cuatro capas y la ficha con `hook-escritura: molde` y los hashes
nuevos. **`gama` queda en `2.4.2` pura** (el actualizador del orden 6 necesita un repo viejo); `--solo-tag` deja los tres puros. La tabla
final suma la huella de `alfa` y `beta`.

## D2.2 — AGREGA (nombres y formatos fijos acá; el resto se detalla al abrir D2.2)

- **P3.2 · Zona propia** (E §5), `lib/zona-propia.cjs`: textos entre `<!-- kit:propio -->` y `<!-- /kit:propio -->` (varias; suelta,
  repetida o anidada → no se toca y se informa) · hooks: el hermano `<nombre>.propio.sh` al final · `settings.json`: mezcla **por regla** a
  tres puntas, lo de `frenos.quitados` no vuelve, lo del proyecto gana aunque sea vacío, claves duplicadas → no se toca ·
  `hashPieza(texto)` = `ficha.hash` sin las zonas.
- **P6.8a · `cambios`** (ADR-026; D §22ter; RF-3): `kit/molde/scripts/cambios.cjs` `nuevo` · `listar` · `verificar` · `anotar-sha <id>
  <sha>` · `rechazar <id> "<motivo>"` · **`aprobar <id>`**. Un archivo por cambio, `.claude/cambios/<AAAA-MM-DD>-<slug>.md` (o `.kit/`);
  id = nombre sin `.md`. Cabecera con la gramática de la ficha:

  | Campo | Valores |
  |---|---|
  | `estado` | `propuesto` · `aprobado` (solo `3-barrera`) · `aplicado` · `rechazado` · `subio-al-kit` |
  | `sha` · `motivo` · `version` | con `aplicado` · `rechazado` · `subio-al-kit` |
  | `clase` · `toca` | `2` · `3-barrera` · lista de piezas o barreras |
  | `origen` o `cita` | texto · `"<alias> <id>"` |
  | `cicatriz` · `chico` · `chico-por` | `seguridad` · `produccion` · `plata` · `no` · `sí`/`no` · razón si `chico` va contra la cicatriz (RT2-8) |
  | `urgente` | `sí` · `no` |
  | `aplico` | `{archivo, hash}` del bloque en la zona propia |
  | `aprobo` | **el sello**: `{sesion, fecha, carpeta, rol, hash, freno}`; `carpeta` **relativa** (`contexto.carpetaRelativa()`: `.` en el principal; nunca una ruta absoluta, que da rojo en la otra PC y deja el usuario de la PC en el repo); `hash` = el del **archivo entero** sin `estado`, `aprobo`, `sha` ni `aplico` (la regla y el caso de abajo son lo que Guido lee en "te espera": no se editan después del clic; RT-p2 r2-4); `freno` = el renglón de `frenos.log` que escribió `aprobar`, **siempre entre comillas dobles** (la gramática corta el mapa en las comas, y una rama puede tener comas) |
  | `toca` | **lista cerrada**, escrita igual: `frenos` · `sensible` · `autorizado` · `settings` · `hooks` · `githooks` · `gitleaks` (las barreras de `candado:barreras`); se compara por igualdad |

  Abajo: caso de origen, regla y dónde vive, tabla de medición. **`verificar`** da rojo con `aplicado` sin `sha` o con uno inexistente,
  `aprobado` en clase 2, `3-barrera` aprobado/aplicado sin `aprobo`, sello con `carpeta` distinta de `.` o cuyo `freno` no está en
  `frenos.log`, `hash` que no coincide con el archivo recalculado, estado fuera de los cinco, y (RT-p2 1, el sello falsificado) **si el
  commit que agregó `aprobo:` no está en la historia `--first-parent` de la rama por defecto o toca algo más que ese archivo y
  `frenos.log`**: un `aprobado` escrito en un worktree y traído por merge `--no-ff` da rojo. **`aprobar` hace su propio commit**, solo con
  esos dos archivos (`git commit -- <rutas>`), así el `/cierre` que viene después no lo mezcla (RT-p2 r2-2). *Lo que esto no cierra*
  (r2-3): fast-forward, rebase, `cherry-pick` o squash de una rama que traiga solo el sello falso, y `git -C <principal>` desde un worktree;
  es el "camino largo y deliberado" que Guido aceptó (SPEC-0 6.8a), y su rastro llega en el orden 2 por **`/inicio`, que lista "aprobados
  nuevos desde tu última sesión: <ids>"** (F6) —el despertador y el resumen del día son del orden 5—; además el molde trae **`deny` de
  `Write` y `Edit` sobre `.claude/cambios/**`** (se escriben solo por el script; RT1-5): por eso **`cambios nuevo` recibe el cuerpo**
  (caso de origen, regla, tabla de medición) **por entrada estándar o desde un archivo temporal**, y el `deny` usa la misma constante de
  ruta que `cambios.cjs` (si E0 manda todo a `.kit/`, lo sigue; r3-2). *Riesgo aceptado* (r3-3, BAJO): el `hash` se toma en el clic; lo
  que Guido ve antes es la línea de "te espera", que por eso trae **la regla en una línea y los primeros 8 caracteres del `hash`**. **Un `aprobado`
  sirve para un solo commit**: el primero posterior al sello que toque lo de `toca`; después, `verificar` exige `anotar-sha` con ese commit y
  el estado `aplicado`. *Riesgo que queda* (r2-4): `toca: [frenos]` aprobado para quitar un freno deja pasar un commit que quite otros;
  atarlo al resultado (`aplico` esperado declarado en el `propuesto`) **se evalúa al abrir D2.2**, y si no entra queda escrito acá. **`aprobar`** se niega con rol `obrero`, `director`, `nocturno`, `actualizador` o `desconocido`, fuera del
  checkout principal, **si el checkout no está en la rama por defecto**, y **con `permission_mode` = `bypassPermissions`** (en bypass la `ask` no pregunta): lo niega el pedacito de 4.5 que se
  **adelanta acá**: `kit/molde/hooks/niega-aprobar.cjs`, `PreToolUse` sobre `Bash`/`PowerShell` cuando el comando llama a
  `cambios.cjs aprobar`, **con `onFailure: "block"` y `timeout: 20`** (es un hook que niega: regla 4.7, a diferencia del de escritura) y
  los cuatro casos de 4.7 (RT-p2 3; el resto de 4.5, orden 3, lo absorbe). `settings.json` suma **una `ask`** sobre `cambios.cjs aprobar` y un `allow` para el resto.
- **P6.1 · El candado**: `kit/molde/scripts/estructura.cjs [todo | parcial | <id>…]`; salidas 0 · 1 (`id · qué pasa · qué hacer` por
  falla) · 2; cada frenada a `frenos.log`. **Nueve ids**: `candado:raiz` · `candado:rutas` · `candado:topes` (`revisarTopes`) ·
  `candado:mesa` (*orden 5*: hoy verde) · `candado:estados` · `candado:lecturas` (solo lista) · `candado:estado-viejo` ·
  **`candado:barreras`** (un commit que toca `frenos:`, `sensible:`, `autorizado:`, `.claude/settings*.json`, `.claude/hooks/**`,
  `.githooks/**`, `.gitleaksignore` o `.gitleaks.toml` necesita un `aprobado` sellado que lo nombre en `toca`; solo las dos exenciones
  de P4.6; **mira lo que está por commitearse más `origin/<rama por defecto>..HEAD`**, así no se escapan los commits anteriores de la
  sesión. **La exención (a) compara contra un molde de afuera del repo** (RT-p2 r2-1: los hashes de `piezas` los reescribe el mismo
  commit, así que nunca valen de referencia): `estructura.cjs --molde <dir>`, el molde de la versión que el commit escribe en `kit:`; sin
  ese molde, **no hay exención**. **`--molde` lo pasa solo `rehacer.sh`** (la prueba): `/cierre`, el pre-commit (orden 3) y el chequeo de
  cierre del encargo lo corren sin `--molde`, así que no hay exención (a) hasta que el orden 6 fije una ruta que no sea un parámetro
  (un agente pasaría su propia carpeta; r3-1). Se aplica a los archivos que disparan `barreras` (cada uno, sin su zona propia, igual al del molde; un
  hook viejo borrado vale si el molde nuevo tampoco lo trae); a la ficha solo se le exige que `frenos`, `sensible` y `autorizado` no
  cambien. Dónde vive el molde en cada PC lo decide el actualizador (orden 6: hoy `kit-sync` no copia `kit/molde/`). El commit
  `molde v3 orden 2` de `rehacer.sh` en `alfa` y `beta` pasa por (a) con `--molde kit/molde` y es su caso "sí"; RT-p2 5) · **`candado:datos`** (crit. 14). Quitables con `hasta:` vigente **salvo `barreras`**. Entero si `piezas.candado` no es `no`;
  si no, solo `barreras`, que corre desde que hay ficha. *Pre-commit: orden 3 (P4.6); portada: orden 7 (P3.8).*
- **Fichas de fábrica**: `kit/molde/ficha.liviano.md` y `ficha.estandar.md` (`frenos`, `sensible`, `autorizado` de E §4, F §14, H §4):
  contra ellas compara la exención (b) de `barreras`; las usan el Arquitecto v3 y el adoptador.
- **P3.10**: `kit/molde/scripts/agents.cjs`: con `multi-llm: sí` escribe `AGENTS.md` desde el `CLAUDE.md` con "generado desde CLAUDE.md:
  no editar"; con `no` o sin campo, nada; uno existente sin esa línea no se pisa y se avisa.
- **P5.1 / P5.2**: `kit/molde/skills/{inicio,cierre}/SKILL.md`, con zona propia. `/inicio`: `fetch`, cruce con git, `CORTADO` y huella (sin
  huella: "el hook de arranque no corrió: corré doctor"), tamaño en una línea, worktree solo con otra marca de sesión viva, **"aprobados nuevos desde tu última sesión: <ids>"** (r2-3); *mesa: orden 5;
  sello: orden 4*. `/cierre`: lo de B §11 (cruce, primeras 20 líneas, propone el cierre solo), `todo.cjs cierre`, `cambios verificar`,
  `estructura.cjs` antes de commitear, `agents.cjs`, aviso de `push-publica`, `fetch` + commit por rutas con `frenos.log`, una línea si
  nada cambió, `cierre parcial`, **sin `stash`** (F §6); *crear el módulo si lo chico creció: orden 5*.
- **`pruebas/pedidos.md`**: diez pedidos textuales con repo, tamaño esperado (4 chicos, 4 módulo solo, 2 con director) y las dos
  preguntas de B §6. `/inicio` se prueba en chico / más que chico; solo / con director es del Arquitecto (orden 4).
- `ficha.cjs` exporta `leerCabecera(texto)` (la gramática sin las reglas de la ficha); `rehacer.sh` suma su paso.

## D2.2 — el detalle (al abrir, 2026-10-28; sin Guido, con su autorización previa)

Lo que el bloque de arriba dejó "para al abrir". Cada decisión tomada sin Guido está en la fila D2.2 del tracker ("Decisiones sin
Guido"), con su alternativa; las ⚠️ son reversibles hasta el tag.

**F1 · `leerCabecera`, fichas de fábrica, `pedidos.md`.**
- `ficha.cjs` exporta `leerCabecera(texto)` → `{datos, avisos}`: la misma gramática (cabecera hasta el primer `---` en la columna 0),
  sin las reglas propias de la ficha (campos conocidos, `kit:`, estados). Error → `ErrorFicha` con línea, igual que `leer`.
- **Las fichas de fábrica viven en `kit/molde/hooks/lib/fabrica/ficha.liviano.md` y `ficha.estandar.md`** (no en `kit/molde/`):
  así "Cómo se instancia" las lleva a `.claude/hooks/lib/fabrica/`, **bajo `.claude/hooks/**`, que es barrera**: editarlas pide un
  `aprobado`. Son fichas completas que `ficha.leer` acepta. `frenos: {opcionales: [], quitados: []}` en las dos; `autorizado` de E §4
  (`liviano`: `merge-a-main: libre`, `escribir-produccion: libre`; `estandar`: `con-gate-verde`, `por-comando-con-foto`); `sensible`
  con las cinco claves en `no` (lo que duele lo nombra el Arquitecto al montar). `lib/fabrica.cjs` exporta `fabrica(nivel)` → los tres
  campos, y `NIVELES`.
- `pruebas/pedidos.md`: diez pedidos textuales en criollo, cada uno con repo (`alfa`, `beta`), tamaño esperado (4 `chico`, 4 `módulo
  solo`, 2 `con director`) y la respuesta esperada a las dos preguntas de B §6.

**F2 · La zona propia, `lib/zona-propia.cjs`.**
- **Textos**: `zonas(texto)` → `{ok, zonas: [{desde, hasta, contenido}]}` o `{ok: false, problema, linea}`; las marcas valen solas en su
  renglón (`<!-- kit:propio -->` y `<!-- /kit:propio -->`, espacios alrededor tolerados). Problemas: apertura sin cierre, cierre sin
  apertura, anidada. `mezclarTexto(moldeNuevo, proyecto)`: el molde nuevo con el contenido de las zonas del proyecto **por orden**; si
  cualquiera de los dos tiene un problema, o la cantidad de zonas difiere → `{ok: false, problema}` y no se escribe nada.
- **`hashPieza(texto)`** = `ficha.hash` del texto con el **contenido** de cada zona vaciado (las marcas quedan). Con una marca rota,
  `hashPieza` del texto entero (no explota: el guardia lo verá distinto).
- **Hooks**: `rutaPropia(hook)` → el hermano `<nombre>.propio.sh`. **Solo el hook de arranque lo corre** (ya lo hace, D2.1). **Los hooks
  que niegan y el de escritura no corren lo propio** (⚠️): un `.propio.sh` que imprime un `allow` destrabaría un freno sin pasar por
  `barreras` en su propio commit.
- **`settings.json`, `mezclarSettings({viejo, nuevo, proyecto, quitados})`** → `{ok, settings, informe}` o `{ok: false, problema}`.
  Una **regla** es un texto de `permissions.allow|ask|deny` (id `allow:<texto>`, `ask:<texto>`, `deny:<texto>`) o un hook
  (`hook:<evento>/<matcher>/<comando>`). Por regla: queda todo lo del proyecto; **se suma lo de `nuevo` que no estaba en `viejo`**, salvo
  que su id esté en `frenos.quitados` (vigente o no: lo quitado no vuelve); **se retira lo que `viejo` traía, `nuevo` ya no y el
  proyecto tiene igual**. Las demás claves: tres puntas por clave (proyecto distinto de `viejo` → gana el proyecto, aunque sea `[]` o
  `{}`; igual a `viejo` → `nuevo`). **Claves duplicadas** en cualquiera de los tres (`JSON.parse` las esconde: se detectan con un lector
  propio) o JSON inválido → no se toca. Salida estable: claves en el orden del `nuevo`, dos espacios, LF, con salto final.
- **El hash de `piezas.settings`** (pendiente b de D2.1) = `hashPieza` del `settings.json` **del molde** serializado así: dice qué molde se
  escribió. Que el proyecto siga teniendo lo del molde lo dice `desviosSettings(molde, proyecto, quitados)` → las reglas del molde que
  faltan sin estar quitadas.

**F3 · `cambios`, su `ask` y `niega-aprobar.cjs`** (sobre lo de "D2.2 — AGREGA").
- La carpeta es una constante, `lib/cambios-ruta.cjs` (`.claude/cambios`), que usan el script, el `deny` y el candado (E0: no hace falta
  `.kit/`). El archivo: cabecera (`leerCabecera`) + `---` + cuerpo con **cuatro secciones obligatorias**, `## Caso de origen`, `## Regla`
  (la primera línea no vacía es "la regla en una línea"), `## Dónde vive`, `## Medición`. `cambios nuevo` se niega sin las cuatro.
- **⚠️ `ids:` (r2-4, evaluado y entra; ampliado por r4-2 y r4-4):** todo cambio `3-barrera` **declara los ids que cambia**, y
  `barreras` da rojo si el commit cambia uno que no está declarado. Así "quitar el freno X" no deja pasar un commit que quite también Y,
  ni "tocar el hook A" uno que vacíe el hook B. Los ids, por categoría:
  - ficha (`frenos`, `sensible`, `autorizado`): `frenos.quitados` y `frenos.opcionales` por su `id` (o su texto); `sensible.<clave>` como
    `sensible:<clave>`; `autorizado.<clave>` como `autorizado:<clave>`; **y bajo `frenos`, `nivel` y `pieza:candado` / `pieza:hook-escritura`
    solo cuando aflojan** (r4-2, r5-3): el estado (`.estado` si la pieza es un mapa) pasa de algo distinto de `no` a `no` o a no estar, o el
    nivel baja de `estandar` a `liviano`. Prender una pieza o cambiarle el hash no es barrera. **Borrar la ficha cambia todos sus ids.**
  - archivos (`hooks`, `githooks`, `gitleaks`): `<categoría>:<ruta relativa>` por archivo tocado (`hooks:.claude/hooks/lib/contexto.cjs`).
  - `settings`: las reglas que cambian, con el id de `zona-propia.reglas` (`deny:<texto>`, `allow:…`, `ask:…`, `hook:<evento>/<matcher>/<comando>`),
    un cambio de otra clave, `settings:<clave>`. Quitar un `deny` del molde se hace sumando también su id a `frenos.quitados`, si no el
    guardia lo ve como desvío.
  - **Normalización, igual en `barreras`, `mezclarSettings` y `frenos.quitados`** (r5-4): sin comillas dobles y con `\` → `/` (la gramática no
    escapa ninguna de las dos); `nuevo` escribe entre comillas dobles todo id que tenga coma.
- **⚠️ Los scripts del candado son barrera (r4-3)**: `.claude/scripts/estructura.cjs` y `.claude/scripts/cambios.cjs` cuentan en la
  categoría **`hooks`** (sin palabra nueva en `toca`; su id, `hooks:<ruta>`); su lógica compartida vive en `.claude/hooks/lib/` (ya barrera:
  `lib/cambios-ruta.cjs`, `lib/cambios.cjs` con el formato y el sello, `lib/barreras.cjs`). *Lo que esto no cierra*: un candado editado y
  corrido en el mismo commit se aprueba solo, hasta que el pre-commit del orden 3 corra la versión de `origin/<rama por defecto>` (anotado
  al paquete 3).
- Comandos: `nuevo --slug <s> --clase <c> --toca <a,b> [--id <x>]… (--origen "<t>" | --cita "<alias> <id>") [--cicatriz <c>]
  [--chico sí|no] [--chico-por "<t>"] [--urgente sí|no] [--cuerpo <archivo>]` (sin `--cuerpo`, de la entrada estándar); `--id` se repite,
  uno por id, y es **obligatorio** en `3-barrera`; `chico` por defecto: `sí` sin cicatriz, `no` con cicatriz; `chico: sí` con cicatriz pide
  `chico-por`. **`nuevo` hace su propio commit** por rutas (`cambios: propuesto <id>`; r4-5), así `aprobar` no se traba en la misma sesión. `listar [--te-espera | --aprobados-nuevos]`:
  `--te-espera` da por cada `propuesto` `3-barrera` **la línea lista**, `<id> · <regla en una línea> · toca: … · ids: … · hash <8>`;
  `--aprobados-nuevos` da los sellados después de la marca de sesión anterior a la más nueva (lo usa `/inicio`). `anotar-sha <id> <sha>
  [--aplico <archivo>]` (`aplico.hash` = el `ficha.hash` de lo que hay **dentro** de las zonas de ese archivo en ese commit). `rechazar <id> "<motivo>"` desde `propuesto` o `aprobado`. Ningún texto del usuario con `"`, `\` o salto de línea.
- **`aprobar <id>`**, en este orden, y se niega (salida 1, una línea que dice por qué y nada escrito) con: rol que no sea `humano`; fuera
  del checkout principal; checkout fuera de la rama por defecto; el archivo del cambio con cambios sin commitear o sin commitear nunca;
  cambio que no es `propuesto` `3-barrera`; ficha rota (`ficha rota: <archivo>:<línea> — corré doctor; la última que se lee: git show
  <sha>:.claude/kit.md`). **`frenos.log` sucio no lo traba** (r4-5: el hook y el candado lo ensucian; solo se agrega y es `merge=union`): su
  commit lo lleva como esté. Si pasa: renglón en `frenos.log` (id
  `cambios:aprobar`, herramienta `cambios.cjs`, detalle = el id del cambio), `estado: aprobado`, el sello `aprobo: {sesion, fecha, carpeta,
  rol, hash, freno}` y **su propio commit** con `git commit -- <cambio> .claude/frenos.log`, mensaje `cambios: aprobado <id>`. `sesion` = la
  marca más nueva de `<git-dir>/kit-sesiones/` (rastro, no candado; Supuestos). Un renglón con `"` no se puede sellar → se niega.
- **`verificar`**: lo de "D2.2 — AGREGA", más **"consumido sin anotar"**: un `aprobado` que ya tiene después del sello un commit que toca su
  `toca` → rojo con el comando listo (`anotar-sha <id> <ese sha>`). Salidas 0 · 1 (`id · qué pasa · qué hacer`) · 2 mal llamado.
- **`verificar` y `barreras` leen la historia `--first-parent` de `refs/heads/<rama por defecto>`** (la local, donde corre `aprobar`; r4-5):
  con `origin/…`, el sello sin pushear daría rojo en el mismo `/cierre`.
- **`niega-aprobar.cjs`** (`PreToolUse`, matcher `Bash|PowerShell`, `onFailure: "block"`, `timeout: 20`): el comando es "de aprobar" si
  contiene las dos palabras `cambios` y `aprobar` (a propósito ancho: un falso positivo solo frena en los modos donde aprobar no vale).
  **Niega** con `permission_mode` `bypassPermissions`, `dontAsk` o `auto` (SPEC-0 4.5 y criterio 18: **los tres**, aunque el bloque de
  arriba nombre solo bypass; ⚠️ en `auto`, Guido aprueba cambiando a `default`; la doc dice que una `ask` pregunta también en `auto`, así
  que ahí es fricción y no seguridad: se puede aflojar) y **niega si la entrada no trae el modo** (r4-1: `--permission-mode` no deja rastro
  en ningún `settings`). **En los demás modos devuelve `permissionDecision: "ask"`** (r4-1): la ventana no depende de la forma del comando
  (`'aprobar'`, dos espacios, `--` esquivan la regla `ask` y caen en el `allow`); la regla `ask` queda como segunda red. **Niega** con
  `.kit-rol` de agente (defensa doble con el script) y con ficha rota. Error interno → `deny` "freno roto: corré doctor"; si ni eso, la salida
  distinta de 0 y `onFailure` frenan. No corre lo propio.
- **⚠️ Lo que esto no cierra (r4-1 b, para Guido)**: una sesión en bypass **en el checkout principal con rol `humano`** puede esquivar el hook
  (`camb*.cjs`, `apro''bar`) o fabricar el sello sin el script (Bash escribe el archivo, el renglón y el commit: el `deny` cubre `Write` y
  `Edit`, no Bash), y queda igual a uno legítimo. Guido aceptó en 6.8a el obrero que sale de su carpeta **en un modo con ventana**, no esto.
  Lo que lo delata hoy: `/inicio` lista "aprobados nuevos" con quién los selló; el orden 3 suma el hook de 4.5 y el pre-commit, y el orden 5
  el resumen del día. **Queda en "te espera"**: aceptarlo hasta el orden 3, o pedir más (por ejemplo, que el sello lo firme algo fuera del
  alcance de Bash). De la misma familia, y también hasta el orden 3 (4.4 ya lo lista): un obrero que mueve el `main` del principal desde su
  worktree, sin red, con `git update-ref refs/heads/main <sello falso>` (r5-5).
- `settings.json` del molde suma: `ask` `Bash(node .claude/scripts/cambios.cjs aprobar:*)` y `PowerShell(node .claude/scripts/cambios.cjs
  aprobar:*)`; `allow` `Bash(node .claude/scripts/cambios.cjs:*)` (la `ask` gana sobre el `allow`); `deny` `Write(./.claude/cambios/**)` y
  `Edit(./.claude/cambios/**)`; el `PreToolUse` de `niega-aprobar.cjs`. **Antes de darlo por hecho, F3 lo prueba con `claude.exe -p` en un
  clon de `alfa`**: que el `settings` con `onFailure` carga y los hooks corren, que la entrada de `PreToolUse` trae `permission_mode`, que en
  `-p` la `ask` no aprueba sola, que en bypass el hook niega, que un `Write` a `.claude/cambios/x.md` queda negado, **y que con
  `--permission-mode default` `node .claude/scripts/cambios.cjs 'aprobar' <id>` no corre** aunque el `allow` coincida (el `ask` del hook
  gana; r5-2). **Si la entrada no trae `permission_mode`**, "niega sin modo" dejaría a Guido sin poder aprobar: F3 usa entonces el
  `defaultMode` de los `settings` (sin ninguno, `ask`) y queda ⚠️ para Guido.
- `nuevo` y `aprobar` con un merge a medio hacer: "terminá el merge primero", no el error crudo de git (r5-5).

**F4 · El candado, `scripts/estructura.cjs`** (los nueve de "D2.2 — AGREGA").
- **Qué ficha**: `fichaVigente` (regla de 4.7); `frenos.quitados` y `piezas.candado` salen de ahí. **Prendido**: con `piezas.candado`
  presente y distinto de `no` corre entero; ausente o `no`, solo `barreras` (Cruces 8: ausente = apagado). **Sin ficha**, salida 0 y
  `sin ficha: candado apagado`, **solo si no está** en el disco, el índice, HEAD, la ficha vigente **ni el padre de ningún commit del rango**
  (r4-2: borrarla no apaga el candado). `todo` = los nueve; `parcial` = `topes` (solo el handoff) y `barreras`.
- `raiz`: `juzgarRuta` sobre `git ls-files --cached --others --exclude-standard -- docs` más que cada `docs/modulos/<x>/` tenga
  `README.md` con `Estado:`. `rutas`: en `CLAUDE.md`, `docs/README.md`, TODO, handoff, fichas de módulo y `docs/referencia/**`, los enlaces
  markdown relativos y las rutas entre comillas invertidas **cuyo primer tramo es una entrada de la raíz del repo según `git ls-files`**;
  se saltean URLs, anclas, `<placeholder>`, comodines, `<alias>:`, lo que está bajo un `> Histórico` y el CHANGELOG. `topes`:
  `revisarTopes`. `mesa`: verde. `estados`: el `SPEC*.md` más nuevo del módulo (`SPEC.md` = 1, `SPEC-2.md`…) contra el `Estado:` de la
  ficha, y `COMPLETO` con `- [ ]` en la ficha → rojo. `lecturas`: lista (sin frenar) lo de más de 100 KB que cita una skill de
  `.claude/skills/**`. `estado-viejo`: con cambios de código (fuera de `docs/` y `.claude/`) desde la base de `todo.cjs` (el último commit
  que tocó el handoff) hasta el disco, la sección `## Próximo paso` del handoff tiene que haber cambiado en ese tramo; un módulo con `rama:`
  igual a la rama actual, su `Estado:`. Sin base, verde. `datos`: en `.claude/skills/**` (zonas propias incluidas) cero rutas absolutas
  (`X:\`, `/c/Users/`, `/home/`, `/Users/`), ids de sesión (`local_` + hexa, un UUID), ramas concretas (`modulo/<nombre>` sin `<`) y SHAs
  (7 a 40 hexa con al menos una letra y un número, fuera de una URL).
- **`barreras`**: el rango es `origin/<rama por defecto>..HEAD` más lo pendiente (índice y disco) como un commit más; **sin remoto**, fuera de la
  rama por defecto `<rama por defecto>..HEAD`, y en ella, desde la base de `todo.cjs`; **sin base, solo lo pendiente** (r4-5: si no, el
  commit que creó el `settings` da rojo para siempre). Por commit: las categorías y los ids que toca (por ruta; la ficha, por comparar
  `frenos`, `sensible`, `autorizado`, `nivel` y las dos piezas de antes y después; `settings`, por `reglas`). Lo cubre la unión de los
  cambios válidos: `aprobado` con sello válido (las reglas de `verificar`), sello anterior al commit y **ningún commit entre el sello y
  este** que toque su `toca` (un `aprobado` = un commit), o `aplicado` con `sha` = ese commit **y ese commit es el primero que toca su
  `toca` después del sello** (`git rev-list --reverse <sello>..<commit>`; r5-1: si no, reapuntar el `sha` de un aprobado viejo tapa un
  commit nuevo; `verificar` chequea lo mismo); `toca` ⊇ categorías y `ids` ⊇ ids cambiados. Exención (a) solo con `--molde <dir>`, y a la ficha le exige además que ni `nivel` ni las dos piezas aflojen (r5-3). **Exención (b) solo para el commit que crea la ficha por primera vez** (`.claude/kit.md`
  nunca existió en `refs/heads/<rama por defecto>`; r4-2), contra `fabrica(nivel)` **del árbol del padre**; si el padre no la tiene, **no hay
  exención** (la del commit se certificaría sola). Con la ficha del padre rota, se compara contra la última versión que lee (hasta 20
  commits atrás); si no hay ninguna, rojo.
- Cada falla: `candado:<id> · qué pasa · qué hacer` y su renglón en `frenos.log` (herramienta `estructura`, detalle = ruta o texto fijo).
  `--sin-log` solo para pruebas. **Los cuatro casos** (son scripts, no hooks): sin node, `/cierre` no commitea (lo dice la skill); ficha
  rota → 1 con `ficha rota: …`; error interno → 1 con `candado roto: corré doctor`, **nunca 0**; sin remoto ni ficha → 0 sin trabar.

**F5 · `agents.cjs`**: `generar [--raiz <dir>]`: con `multi-llm: sí` escribe `AGENTS.md` = `<!-- generado desde CLAUDE.md: no editar -->` +
el `CLAUDE.md`; uno existente sin esa línea no se pisa (salida 1 y aviso); con `no` o sin campo, nada. Ficha por `fichaVigente`.

**F6 · `/inicio` y `/cierre` del molde** (`kit/molde/skills/{inicio,cierre}/SKILL.md`), con una zona propia vacía cada una y su
título. Las dos llaman a los scripts por ruta relativa (`node .claude/scripts/…`) y no traen datos de ningún proyecto (`candado:datos`).
Orden del `/cierre`: cruce → `todo.cjs cierre` → `agents.cjs` → `cambios verificar` → `estructura.cjs todo` (rojo: se arregla, nunca se
commitea encima) → `fetch` → commit **por rutas** con `frenos.log` → si un `aprobado` quedó consumido, `anotar-sha` y otro commit →
`cambios verificar` → aviso de `push-publica` → push. Sin node o sin salida de un script: no se commitea.

**F7 · `rehacer.sh`**: la carpeta hermana sale de `git rev-parse --git-common-dir` (pendiente c); `alfa` y `beta` reciben lo de D2.2 en un
commit `molde v3 orden 2b` **sobre** el de D2.1, `settings` por `mezclarSettings` y los hashes por `hashPieza`; ese commit corre
`estructura.cjs barreras --molde kit/molde` (caso "sí" de la exención a) y el resultado va a la tabla final.

## MODIFICA

- `kit/molde/kit.ejemplo.md`: suma `hook-escritura: molde` (E §4 la tiene) y su esperado en `ficha.test.cjs`; el resto, igual. (D2.1)
- `pruebas/rehacer.sh`: los pasos de arriba; `gama`, idéntica; dos corridas dan lo mismo. (D2.1, D2.2) · `ficha.cjs`: el `export`. (D2.2)
- `docs/README.md`: la fila de este delta. Diseños y SPEC-0, notas con fecha por lo que corrige este delta (Cruces), **y una nota a
  P4.4 del SPEC-0**: el hook de git del orden 3 suma `remote set-head`, `symbolic-ref`, `remote set-url`/`remove` y `config init.defaultBranch`, las formas de mover
  la ficha vigente sin red (RT-p2 4).

## NO SE TOCA

- **El kit v2** (`kit/skills/**`, el agente, `templates/universales/`): monta `2.4.x` hasta el orden 4.
- **El `.claude/` de vibe-kit** (ver ⚠️). `_fuente/` de relevamiento. `~/.claude/` salvo por `kit-sync.sh sync`. La flota. `tips/`.
- La gramática de `ficha.cjs` (ninguna forma nueva). `kit/VERSION` (sigue `2.4.3` hasta el tag).

## Criterios de aceptación

**D2.1**
1. Precondición y `SessionStart` en subagentes probados, con el control, escritos en el tracker; si pregunta, `.kit/` antes de E2.
2. `node --test "kit/**/*.test.cjs"` verde, con casos sí/no de cada librería y de los dos hooks.
3. Handoff de 20 KB: primera línea `CORTADO…`, total ≤ 9.700 (`.length`), última línea `^inyectado: \d{1,3}(\.\d{3})* de 9\.700$`.
4. Ramas `modulo/x` y `modulo/x--01` en worktrees armados a mano (el script `worktree` es del orden 4): el obrero ve la ruta del encargo y la
   cabecera de `modulo/x` y **ningún renglón del handoff**; el director, la cabecera y el handoff de la rama por defecto aunque el de su
   worktree diga otro; `main` y `worktree-a`, el del disco.
5. Edad al lado de Estado y Próximo paso; un commit de código posterior marca "estado viejo"; uno en `docs/`, no.
6. Ficha rota → `ficha rota: <archivo>:<línea>` y el resto; error interno forzado → línea de error, handoff y huella; sin remoto ni ficha →
   entero y "valen los frenos de fábrica"; sin git → no explota. Todo con salida 0.
7. `HOME` con `VERSION` mayor, menor o ausente → "hay kit nuevo", "esta PC está atrás" o nada.
8. La marca de sesión aparece en el `git-dir` propio, también en un worktree.
9. Hook de escritura: pasan los seis, lo de las tres carpetas y lo de afuera de `docs/`; frena otro archivo en la raíz y otra carpeta, con
   rutas de Windows y de worktree, **sin distinguir mayúsculas** (`Docs/x.md`, `DOCS\x.md`) y con `..` resuelto antes de juzgar; apagado sin ficha, con `hook-escritura: no` y con `candado:raiz` quitado vigente; frena con el quitado
   vencido y con ficha rota; sale el JSON `deny` y el renglón con su formato; la medición da 0 sobre los seis y las tres.
10. `todo.cjs cierre`: la línea exacta; poda a 90 días con sus excepciones; la segunda corrida no cambia nada.
11. `revisarTopes` falla con handoff > 5.000, sección faltante/desordenada/prohibida, ficha `EN OBRA` > 5.000, `MAPA` > 5.000, inyección
    > 9.700; verde con el molde recién instanciado.
12. `rehacer.sh` deja `alfa` y `beta` con el árbol, el handoff, el TODO, los dos `.snippet` y los dos hooks; `git check-ignore` da
    ignorado `.env`, `.env.local`, `.claude/settings.local.json`, `.kit-rol` y `.claude/worktrees/x/a`, y no `.vscode/launch.json`;
    `git check-attr merge` del registro da `union`; `gama` igual que hoy; dos corridas iguales; vibe-kit limpio.
13. El hook corrido de prueba sobre el árbol de vibe-kit (sin instalarlo) no explota y da huella.
14. `fichaVigente` con `origin/HEAD` apuntado a `modulo/x--01` (que trae `hook-escritura: no`) lee la de `main`; `principal` y
    `carpetaRelativa` dan `.` en el checkout y `.claude/worktrees/w1` en un worktree. **Prueba de mutación** (el director): borrar una por una las reglas de `arbol`, `contexto` (pestaña, rol, `fichaVigente`), `topes`,
    `todo` y los dos hooks; cada una pone alguna prueba en rojo. Las vivas se cubren o se anotan.
15. `kit-sync.sh` LIMPIO; diff sobre `kit/skills/` y el `.claude/` de vibe-kit = 0; runbook y regla del `CLAUDE.md` del molde, presentes.

**D2.2** (detalle al abrir): los "hecho cuando" del SPEC-0 para P3.2, P3.10, P5.1, P5.2, P6.1 y P6.8a; criterios del kit **6, 12, 14,
17, 18 y 20**; los cuatro casos de 4.7 para `estructura.cjs` y `cambios.cjs`; mutación sobre el candado y `cambios`; los diez pedidos;
el revisor frío leyó el diff entero del paquete y lo que encontró está aplicado o anotado.

## Los encargos (el director reparte, lee cada diff y corre las pruebas él)

| # | Modelo | Qué | Puede tocar | Criterios | Depende |
|---|---|---|---|---|---|
| E0 | Opus | Precondición y `SessionStart` en subagentes | nada del repo: un clon temporal de `alfa` | 1 | — |
| E1 | Sonnet | Plantillas, `CLAUDE.md` mínimo, runbook, `.snippet`, `hook-escritura` en el ejemplo | `kit/molde/docs/**`, `kit/molde/CLAUDE.md`, `kit/molde/*.snippet`, el runbook, `kit.ejemplo.md`, `ficha.test.cjs` | 15 | E0 |
| E2 | Opus | `contexto`, `arbol`, `topes` (sin `revisarTopes`), `frenos-log`, `git` | esos `.cjs` en `hooks/lib/` y sus pruebas | 2, 14 | E0 |
| E3 | Sonnet | `lib/todo.cjs` y `scripts/todo.cjs` | esos y sus pruebas | 10 | E1, E2 |
| E4 | Opus | `session-start.cjs`, `inyeccion.cjs`, `revisarTopes`, `settings.json` | esos, `lib/topes.cjs`, sus pruebas | 3-8, 11, 13 | E3 |
| E5 | Opus | Hook de escritura y su medición | `escritura-docs.cjs` y su prueba, `settings.json`; la medición en el scratchpad | 9 | E4 |
| E6 | Sonnet | El paso de `rehacer.sh` | `pruebas/rehacer.sh` | 12 | E1-E5 |

E1 y E2 en paralelo (no comparten archivos), cada uno en su worktree; el resto en fila. El director: tracker, índice, notas y mutación.
**D2.2** (se confirma al abrir): F1 Sonnet `leerCabecera`, fichas de fábrica, `pedidos.md` · F2 Opus zona propia · F3 Opus `cambios`, su
`ask` y `niega-aprobar.cjs` · F4 Opus `estructura.cjs` (tras F2, F3) · F5 Sonnet `agents.cjs` · F6 Sonnet `/inicio` y `/cierre` (tras F3-F5) · F7 Sonnet
`rehacer.sh` · RF Opus revisor frío. Si el detalle de D2.2 suma una decisión de permisos, una ronda de red team antes de F3.

## Lo prueba una sesión real

| # | Dónde | Qué mirar exactamente |
|---|---|---|
| 1 | Pestaña nueva de VS Code en `../vibe-kit-pruebas/alfa` | Que pida a la sesión su **última línea inyectada** y diga `inyectado: N de 9.700`; cabecera `kit 2.4.2 · hay kit nuevo: 2.4.3` |
| 2 | La misma, con un handoff de 20 KB | Que lo primero que ve sea `CORTADO` y que la huella llegue igual |
| 3 | La misma | "Creá `docs/notas.md`": frenado con el mensaje de B §7, **sin pop-up**, renglón nuevo en `.claude/frenos.log` |
| 4 | Pestaña en un worktree `modulo/x--01` armado a mano | La ruta del encargo, y nada del handoff |
| 5 | `alfa`, una sesión que lanza un subagente | Si E0 no concluyó: la huella una sola vez en el transcript |
| 6 | Modo `default`, con `node .claude/scripts/prueba.cjs` en `allow` | Si E0 no concluyó: si aparece **la pregunta de carpeta protegida** (no la de Bash) en `.claude/` y en `.claude/worktrees/w1/.claude/` |
| 7 | `alfa`, con la PC cargada (otra sesión corriendo pruebas) | Que la sesión arranque **con** lo inyectado (el `timeout` es 20 s; el plazo propio, 10 s) y, si el plazo actuó, el renglón `arranque lento: …` antes de la huella |

## Cruces contra los diseños (la lección de D1.1)

| # | Qué | Qué dice cada uno | Gana, y por qué |
|---|---|---|---|
| 1 | Tope del handoff | B §8 y SPEC-0 (P3.5, crit. 5): **5.000 bytes**; molde `v2.4.3` y hook de vibe-kit: 5.500 (el del Hub) | **5.000**: B §8 explica que el Hub eligió 5.500 sin los otros bloques. Un handoff de 5.0-5.5 KB va a decir CORTADO: lo avisa la nota de migración (orden 6) |
| 2 | Presupuesto | B §9: 9.500 en el texto, **9.700** en su tabla recalculada; B §14: 9.500; SPEC-0: 9.700; F §15: "10.000" | **9.700**; 10.000 es el corte de la plataforma. Nota a B §9 y §14 |
| 3 | Huella | B §9: `…N caracteres de 9.700`; SPEC-0 crit. 5: `inyectado: N de 9.700`; `v2.4.3`: `…de 10000` | **`inyectado: N de 9.700`**, la del criterio, última línea |
| 4 | Secciones del handoff | B §8 = SPEC-0; la plantilla v2 tiene "Qué se hizo", "Archivos tocados", "Cierre:" | B/SPEC-0, títulos fijos (P3.5) y chequeados |
| 5 | Recorte | B §9: en orden, lo propio primero; SPEC-0: "`.propio.sh` al final" | Compatibles: **tope por bloque** y lo propio con el resto, primero en caer |
| 6 | Archivo del hook | B §9 y SPEC-0: `session-start.js` desde un `.sh`; `estructura.js` | **`.cjs`** (D1.1) y **node directo**: el `.sh` sumaba Git Bash, NO VERIFICADO en Windows (orden 3) |
| 7 | Campos que lee cada hook | Arranque: `kit`, `nivel`, `vars.proyecto`; escritura: `piezas.hook-escritura`, `frenos.quitados`; candado: `piezas.candado`, `frenos`, `sensible`, `autorizado`; `/cierre`: `push-publica`, `multi-llm` | Existen todos en `ficha.cjs` (piezas de nombre libre). **Hueco**: el ejemplo no trae `hook-escritura` (E §4 sí): se suma |
| 8 | Qué prende el hook de escritura | B §7: "cuando el árbol cumple"; B §14: `piezas.candado`; E §4: pieza `hook-escritura` | **Cada uno su pieza**; `no` o ausente = apagado; `barreras` siempre con ficha. El hook usa el id `candado:raiz` (regla 1 de B §14) |
| 9 | `frenos.log` | A §4 (de F §21): `docs/`; B §4 y SPEC-0: `.claude/`; RF-18: `.kit/` si E0 falla | **`.claude/frenos.log`** salvo E0; renglón fijado acá (A §4.2: fecha, qué, herramienta; SPEC-0 suma hora y pestaña) |
| 10 | Formato de `cambios` | ADR-026: `propuesto → aprobado → aplicado (SHA) · rechazado (motivo)` + `subió-al-kit`; D §22ter: `estado: aplicado: <SHA>`, `subio-al-kit`, `urgente: si`, `aprobo`, `aplico`; SPEC-0 6.8a: suma `chico:` y el sello | **Estado solo, datos aparte** (`sha`, `motivo`, `version`: un valor con `: ` pide comillas en la gramática); `subio-al-kit` en ASCII (H §4); `sí`/`no` con tilde, como la ficha. **Se suma `cicatriz:`**: sin él no se calcula el default de `chico` (RT2-8). `aprobo` = el sello, carpeta con `/` |
| 11 | Ficha del módulo | P3.4 es del orden 5; hook y candado la leen desde el 2 | **Contrato mínimo**, que P3.4 respeta: `docs/modulos/<x>/README.md` con renglones `Estado:` (o `- Estado:`), `rama:` y `Próximo paso:`; cabecera = primeros 1.000 caracteres cortados en renglón |
| 12 | "estado viejo" de un módulo | B §9, §14: "commits de código del módulo" | Nada dice qué código es de qué módulo: **solo con `rama:`**; el resto, orden 5 |
| 13 | Por pestaña | SPEC-0 P4.1: director, encargo, `main`; H §10.3 y su nota en B §9: además `worktree-*` y **la marca de sesión en el `git-dir`** (H §11) | **H**, la fuente: `worktree-*` como `main`, y la marca entra a P4.1 (la usa P5.1). "Handoff de `main`" = el de la rama por defecto |
| 14 | "5 líneas de F" | B §9 lista cuatro; F §15, cinco con el modo; SPEC-0: modo en la cabecera | Modo en la cabecera **ya**; seguridad, orden 3 |
| 15 | Ids del candado | B §14: siete; SPEC-0 "Lo que corrige": "ocho"; SPEC-0 P6.1: **nueve** (+`datos`, RF-6); D §22ter.3: `candado:cambios` | **Nueve**. `candado:cambios` no es id: es `cambios verificar` (P6.1 lo dice); `/cierre` corre los dos |
| 16 | TODO | v2 y vibe-kit: fecha a mano en la cabecera; B §10: sin fechas a mano; H: "Reportado" como "sección con fecha"; balance B `…bajaron a 🟢`, SPEC-0 `…bajaron` | Sin fecha de cabecera; "Reportado" **sin fecha escrita**; balance con "a 🟢" (contiene al del SPEC-0) |
| 17 | `gitignore` | F §9: `.env`, `.env.*`, y `settings.local.json`, `launch.json` sin anclar; SPEC-0: `.env*` | Las dos de F (como el `deny`; `.env*` atrapa `.envrc`) y **anclado** lo de `.claude/` |
| 18 | `.kit-noche` | Entidades: la escribe el director "en la raíz del módulo"; el obrero la lee "desde el `cwd`" | **Hueco del orden 5**: así, el obrero no la ve desde su worktree. No entra al snippet hasta que se decida cómo viaja |
| 19 | `ask` en el molde | F §5: "sin ninguna `ask`"; SPEC-0 6.8a (RF-3): una sobre `cambios aprobar` | **La `ask`**, única excepción (Guido, 2026-10-27). Nota a F §5 |
| 20 | Valores de fábrica por nivel | P4.6 (b) y crit. 20 comparan contra ellos; nadie los escribe antes de los órdenes 4 y 6 | **Fichas de fábrica en D2.2** (⚠️) |
| 21 | Repos de prueba | SPEC-0: `pruebas/` adentro | **`../vibe-kit-pruebas/`** (Guido, 2026-10-28). Nota al SPEC-0 |
| 22 | Casos de falla | P4.7: cuatro; "Entorno de prueba": "tres" | **Cuatro** (4.7 es la regla) |

## Supuestos

- [ALTO] La precondición: E0 antes de construir; salida ya elegida (RF-18).
- [MEDIO] Que la entrada del `SessionStart` trae `cwd` y `session_id` (H §17bis) y `permission_mode` (no seguro: respaldo `defaultMode`).
- [MEDIO] Que `git blame` del handoff, el TODO y las fichas tarda poco en repos con historia larga: E4 lo mide; si no, tope de tiempo y
  "edad: sin datos".
- [MEDIO] (D2.2) Cómo sabe `cambios aprobar` el id de su sesión. Respaldo: la marca de sesión más nueva del `git-dir`, **que con dos
  sesiones abiertas puede ser la de la otra** (RT-p2, BAJO): el `sesion` del sello es rastro, no candado; los candados son rol, carpeta,
  `hash` y `--first-parent`.
- [BAJO] Que la plataforma cuenta como JS (margen de 300; piloto).

## Riesgos y decisiones ⚠️

**Para Guido** — *las tres, decididas por Guido el 2026-10-28 (D2.1): "sí, las tres", con la recomendada en cada una.*
- ⚠️ **vibe-kit sigue con su hook de hoy** hasta adoptarse a sí mismo. El nuevo pide `docs/` en cuatro capas y la raíz de `docs/` de vibe-kit
  tiene doce archivos y tres carpetas propias: el candado daría rojo en cada cierre. *Opciones*: (a) **no tocarlo en este paquete** y
  probar en los repos de prueba (RECOMENDADA: lo que se rompa, se rompe allá); (b) adoptarlo ya, migrando `docs/` de vibe-kit acá (más
  trabajo, y el riesgo en el repo madre). *Qué cambia para vos*: con (a), nada hasta el orden 6.
- ⚠️ **Cambio al plan: las fichas de fábrica por nivel pasan al orden 2.** El candado deja pasar el commit que crea una ficha "con los
  valores de fábrica", y esos valores no estaban en ningún archivo. Salen de lo ya decidido (E §4, F §14): en `liviano` mergear es libre;
  en `estandar`, con el gate verde; ningún freno quitado en los dos.
- ⚠️ **El paquete va en dos directores** con la frontera de arriba: lo que lee en D2.1, lo que frena en D2.2.

**Rutina técnica (decidida acá)**
- 5.000, 9.700 y la huella (Cruces 1-3); se calibran en el piloto.
- **El hook de escritura deja pasar si falla** (no está en 4.7) y **frena con ficha rota** (lo suelto se mueve fácil). *Descartado*:
  frenar todo `Write` con la ficha rota, que traba la sesión por algo que no tiene que ver.
- **Todos los hooks leen la ficha con la regla de 4.7 desde ya** (una sola regla para los órdenes 2 y 3). Consecuencia: una ficha sin
  commitear "no existe" hasta el commit.
- `gama` queda en `2.4.2`; `alfa` y `beta` suben. Sin `*.sh eol=lf` en el snippet: no hay cicatriz (regla 1 de A).
- **`cambios` y `frenos.log` se congelan al repartirse**, como la ficha: por eso su formato se fija acá (Cruces 9 y 10).

## Lo que se prueba más adelante

- Que todo hook que niega frene con ficha rota, y 4.7 en VS Code y Windows sin Git Bash: orden 3. `barreras` en el pre-commit: orden 3.
- `.kit-rol` escrito por `worktree`: orden 4 (acá, a mano). `candado:mesa`, P3.4 completa, "estado viejo" sin `rama:`, crear el módulo
  desde `/cierre`, `.kit-noche`: orden 5. La portada en `candado:raiz`: orden 7. Los topes con el mes: piloto.

## Lo que cambió en la construcción (D2.1, 2026-10-28)

- **Plazo propio del hook de arranque (E4b, no estaba en el delta).** Medido por el director: 15 consultas a git de ~250 ms cada una;
  4 s con la PC tranquila, 8,5 s en frío y **10-24 s con la PC cargada**, contra `timeout: 20` (si lo mata, la sesión arranca sin nada).
  `lib/git.cjs` suma `fijarPlazo`; el hook se da **10 s** desde que arranca: lo que no entra sale "sin datos" (no "no hay"), lo propio
  corre al final y un renglón `arranque lento: N consultas a git salteadas por tiempo (corré doctor si se repite)` va antes de la huella.
  `KIT_PLAZO_ARRANQUE_MS` lo cambia **solo para pruebas y mediciones**. Fila 7 de "Lo prueba una sesión real".
- **El hook de escritura no llama a git si la ruta no nombra `docs`**, y lee la ficha solo si la ruta frenaría: un `Write` común cuesta
  cero o un git. **Medido** (los `~/.claude/projects/**/*.jsonl` de `clientes`): 5.007 `Write`, 185 en `docs/`, 112 frenaría (74 rutas,
  todas de repos de antes del árbol: Hermes mobile 43, spec 25, Hermes.exe 22, vibe-kit 13, otros 9), **0 sobre los seis y las tres**.
- **`rehacer.sh`**: `hook-escritura: molde` va sin hash (como `kit.ejemplo.md`); el hash de `settings` es el del archivo ya mezclado;
  `CLAUDE.md` y `docs/{SESSION_HANDOFF,TODO,CHANGELOG}.md` v2 se pisan con los del molde y `session-start.sh` se borra. Corrido desde un
  worktree, la carpeta hermana cae adentro de `.claude/worktrees/`: pendiente para F7 (D2.2).

## Red team (Opus, `redteam-spec`; los informes, al repo privado)

| Ronda | ALTO | MEDIO | Integrado (RT-p2 n) |
|---|---|---|---|
| 1 · 2026-10-28 | 2 | 3 | **1** sello falsificable desde un worktree → `hash`, `--first-parent`, un `aprobado` = un commit · **2** `carpeta` absoluta y "principal" sin definir → relativa y `git-dir` = `git-common-dir` · **3** bypass sin ventana entre el orden 2 y el 3 → `niega-aprobar.cjs` adelantado a D2.2 · **4** `origin/HEAD` movible sin red → solo vale si apunta a la rama por defecto; nota a P4.4 · **5** rango y vocabulario de `barreras` → fijados; el commit de `rehacer.sh` pasa por la exención (a). BAJOS: mayúsculas y `..` en el hook de escritura; id de sesión = rastro |
| 2 · 2026-10-28 | 2 | 2 | **r2-1** la exención (a) se certificaba sola con los hashes del repo → compara contra un molde de afuera (`--molde`), sin molde no hay exención · **r2-2** `--first-parent` rompía el camino legítimo → `aprobar` hace su propio commit y exige la rama por defecto · **r2-3** caminos largos al first-parent → aceptados por Guido (6.8a); rastro adelantado a `/inicio` y `deny` de `Write`/`Edit` sobre `cambios/` · **r2-4** `hash` de todo el archivo; atar el commit al resultado, se evalúa en D2.2 · BAJO r2-5: `modulo/*`/`worktree-*` nunca rama por defecto |
| 3 · 2026-10-28 | **0** | 2 | **r3-1** `--molde` lo elegía quien corre el candado → solo `rehacer.sh`; sin exención (a) hasta el orden 6 · **r3-2** el `deny` sobre `cambios/` chocaba con `cambios nuevo` → el cuerpo por entrada estándar · BAJO r3-3: "te espera" muestra la regla y el `hash` corto. **Criterio de salida cumplido: sin ALTOS** |
| 4 · 2026-10-28 (D2.2, sobre "el detalle") | 4 | 1 | **r4-1** `'aprobar'` entre comillas esquivaba la `ask` → el hook devuelve `ask` en los modos con ventana y niega sin modo; bypass en el principal, a Guido · **r4-2** borrar o volver a fábrica la ficha lavaba las barreras → borrar = todos los ids, (b) solo la primera vez, `nivel` y piezas como ids · **r4-3** los scripts del candado no eran barrera → cuentan en `hooks` · **r4-4** un `aprobado` de archivos cubría cualquiera → `ids` por archivo y por regla · r4-5 trabas del camino legítimo (ref, `frenos.log`, `nuevo` sin commit, sin base) |
| 5 · 2026-10-28 (D2.2) | 1 | 2 | **r5-1** un `aplicado` se podía reapuntar → cubre solo si es el primer commit tras el sello · r5-2 la prueba `-p` suma el `ask` del hook contra el `allow` · r5-3 `nivel` y piezas cuentan solo cuando aflojan · BAJOS r5-4 normalizar `\` y comillas en los ids, r5-5 `update-ref` desde un worktree (al orden 3) y merge a medias. **Integrado tal cual; el red team dijo que con r5-1 así no hacía falta otra ronda** |
