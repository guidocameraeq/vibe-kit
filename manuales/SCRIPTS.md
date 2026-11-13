# Los scripts del kit: referencia

> **Para qué sirve**: una sección corta por script y por hook. Para cada uno: qué hace, cómo se llama y qué devuelve. Está sacado de
> la cabecera de cada archivo. **Es referencia, no tutorial**: para saber cuándo usar cada cosa, mirá la página de la pieza
> ([`MOLDE.md`](MOLDE.md), [`ROLES.md`](ROLES.md), [`EQUIPADOR.md`](EQUIPADOR.md), [`COMO-USAR-EL-ARQUITECTO.md`](COMO-USAR-EL-ARQUITECTO.md)).
> Si difiere del código, manda el código.

Casi todos son Node (`.cjs`, sin dependencias) y comparten una convención de salida: **0** anduvo · **1** se negó o dio rojo (con una
línea de qué hacer) · **2** mal llamado. Un error propio dice `<script> roto: corré doctor`. Lo que un script no pudo mirar es
**NO VERIFICADO**, nunca verde. Los del molde se llaman desde la raíz del proyecto como `node .claude/scripts/<nombre>.cjs …`.

Índice: [A. Molde, scripts](#a-molde-scripts-claudescripts) · [B. Molde, hooks de Claude](#b-molde-hooks-de-claude-claudehooks) ·
[C. Molde, githooks](#c-molde-githooks-githooks) · [D. Equipador](#d-equipador-skillsarquitecto-skillsscripts) ·
[E. Arquitecto](#e-arquitecto-skillsarquitectoscripts) · [F. Scripts de la PC](#f-scripts-de-la-pc-skillsarquitecto-skillspc) ·
[G. Del repo madre](#g-del-repo-madre-vibe-kit)

---

## A. Molde, scripts (`.claude/scripts/`)

### afirmaciones
Corrector de afirmaciones en prosa: marca comentarios, mensajes de error y viñetas de CHANGELOG que prometen de más.
`node .claude/scripts/afirmaciones.cjs <sha-base> [--frenar]`
Lista los hallazgos como "⚠️ a mirar" y sale 0 (avisa, no frena). Con `--frenar` sale 1 y anota en `frenos.log`. 1 también si no pudo leer el diff.

### agents
Genera el `AGENTS.md` (opt-in) a partir del `CLAUDE.md`.
`node agents.cjs generar [--raiz <dir>]`
Escribe `AGENTS.md` solo si la ficha vigente dice `multi-llm: sí`; con otro valor, sin ficha o ficha rota, no escribe. Un `AGENTS.md` que no trae su marca no se pisa. Imprime una línea de resultado.

### cambios
El registro de cambios del método (`.claude/cambios/`).
`node .claude/scripts/cambios.cjs nuevo --slug <s> --clase 2|3-barrera --toca <a,b> (--origen "<t>" | --cita "<alias> <id>") [--en-defecto] […]` · `listar [--te-espera | --aprobados-nuevos]` · `verificar` · `anotar-sha <id> <sha>` · `rechazar <id> "<motivo>"` · `aprobar <id>` · `subio-al-kit <id> <N.N.N>`
Escribe un archivo por cambio y hace su propio commit por rutas. **`aprobar` es del dueño**: `cambios aprobar` lo corre la sesión cuando el dueño lo pide, y su clic en la ventana es la firma; nunca por su cuenta. Corre en la carpeta principal (en la rama por defecto) o en la pestaña del director (con el pase de un solo uso que deja la ventana, 15 min: firma en la carpeta principal y sube solo ese commit). Se niega solo desde un obrero u otro agente, de fondo, de noche, en un modo sin ventana o con la ficha rota. `nuevo` lo usa la sesión cuando cambió cómo trabaja el proyecto (un freno, una regla, un paso de un ritual). **`nuevo --en-defecto`** (el director, o una persona; nunca un obrero): el cambio va solo a la rama por defecto de origin, desde una carpeta temporal desprendida (un commit de un solo archivo, push sin `--force`; la temporal se borra siempre) y el worktree queda como estaba; imprime `propuesto en <defecto>: le queda al dueño en "Te necesito"`. De noche, de fondo o sin origin, se niega (1). Detalle: [`MOLDE.md`](MOLDE.md) §7.

### contexto
Cuánto contexto lleva usada esta sesión y cuánto le falta (lee el transcript de la sesión).
`node .claude/scripts/contexto.cjs [--sesion <id|ruta.jsonl>] [--json] [--cwd <carpeta>]`
Imprime `contexto: <usado>k de <ventana>k (<pct>%) · faltan <falta>k · <modelo>`; con `--json`, `usado`, `ventana`, `pct`, `falta`, `modelo`, `sesion`. Sale 1 con `NO VERIFICADO · <por qué>` (por ejemplo, un modelo que no conoce). Dónde compacta la plataforma: NO VERIFICADO.

### encargo
El encargo por script: lo que usan el director y el obrero.
`node .claude/scripts/encargo.cjs partida <x>--<ID>` · `presentar <x>--<ID> [--sin-base] | --spec` · `mensaje <TIPO> [<ruta>[@<sha>]]` · `autorizado <x>--<ID>` · `verificar <x>--<ID> [--plazo <min>]`
Lee el encargo y el spec **de git**, nunca del disco. `partida` imprime la línea `- Partida:`. `presentar` chequea rama, encargo y sello del spec. `mensaje` dice si un aviso vale (git tiene que respaldarlo). `autorizado` reescribe `permissions.allow` del `settings.local.json` del worktree e imprime las líneas de apertura: la del dueño (solo para un encargo con `- Apertura: dueño`; termina en `→ primer mensaje: /obrero <x>--<ID>`) y dos **de fondo**, que lanza el director: `apertura de fondo:` (en `auto`) y la de respaldo (en `acceptEdits`), con `KIT_FONDO=1`, `--name obrero-<x>--<ID>` y `--allowedTools` con la lista del encargo; sin `claude`, una línea que dice que la apertura es del dueño. **La tarea 0**: con el sello `entorno — (tarea 0: montar el entorno de prueba)` en el spec, `presentar`, `autorizado` y `worktree crear` niegan (1) todo encargo que no sea el `00` (y `presentar --spec` suma la línea `tarea 0 pendiente: el primer encargo es el 00`) mientras la `.claude/kit.md` de la punta de `modulo/<x>` no tenga un entorno `dummy` o `prueba`. `verificar` imprime **seis líneas** (remoto · limpio · pruebas · alcance · main · barreras) y sale 0 si ninguna es ❌.

### estado
La vista de `/estado`.
`node .claude/scripts/estado.cjs [<x>]` · `estado.cjs --director [<x>]`
Sin `--director`, **la del dueño**: siempre cuatro secciones, en este orden: `TE NECESITO` (la lista única de `hooks/lib/espera.cjs`), `EL PLAN`, `LO QUE SE HIZO` y `LO QUE FALTA` (con la mediana de los encargos cerrados; con menos de tres, "no sé todavía"); `- nada` si no hay. Con `<x>`, la de ese módulo. **`--director`**: la de antes de la `rc.7`: arriba "TE ESPERA", después una línea por módulo activo (avance medido, encargos, "podés cerrar", esperas, uso de contexto) y las líneas propias de `.claude/estado-lineas.md`. Solo informa. Sale 1 si el módulo no existe.

### estructura
El candado de estructura: los diez ids (`raiz`, `rutas`, `topes`, `mesa`, `estados`, `lecturas`, `estado-viejo`, `barreras`, `datos`, `portada`).
`node .claude/scripts/estructura.cjs [todo | parcial | <id>…] [--molde <dir> [--molde-viejo <dir>]] [--sin-log]` · `estructura.cjs barreras (--indice | --rango <a>..<b>)`
Una línea por falla, con qué hacer, y la anota en `frenos.log`. `barreras --indice` juzga lo que lleva el commit en curso; `--rango` juzga los commits que sube el push (un rango vacío es verde). `--molde` lo pasan solo el actualizador y `rehacer.sh`. Detalle: [`MOLDE.md`](MOLDE.md) §5.

### mesa
La mesa entre directores de dos proyectos, por git.
`node .claude/scripts/mesa.cjs nuevo <TIPO> <alias>/<rol> <x> [--archivo <ruta>] [--de <alias>]` · `abiertos [--hilo <id>]` · `acordados [--hoy]` · `huella <alias>@<sha> <carpeta> [--copia <dir>]`
`nuevo` escribe el mensaje en `docs/modulos/<x>/mesa/<alias>/` (≤ 2 KB), lo commitea, lo sube a origin e imprime el aviso de una línea para mandar por el canal; si no sube, no hay aviso (sale 1). `abiertos` lista los pedidos sin respuesta de los dos lados; `acordados`, los acuerdos firmados; `huella`, el hash de un conjunto compartido (sale 1 si tu copia no coincide).

### noche
"Me voy", el checklist de la noche y la noche que termina sola.
`node .claude/scripts/noche.cjs me-voy [--hasta HH:MM]` · `volvi` · `cierre <x>` · `cierre-empieza <x>` · `publicar <x> [--seguir]` · `subir <x>` · `parte <x> [--no-pude "<texto>"]…`
`me-voy` escribe la marca `.kit-noche` en el worktree del director (desde ahí todo se trata como nocturno) e imprime el checklist (`--hasta` es informativo: la noche termina con `volvi`). `volvi` borra la marca en todos los worktrees (lo corren el `/inicio` y el `/estado` del dueño). **El despertador ya no existe** (ni la mudanza al 40 %): el director lanza a los obreros de fondo y se entera cuando terminan; `despertador` solo dice eso y sale 0, para que una línea vieja no se rompa.
La noche que termina sola (la sesión de cierre: [`ROLES.md`](ROLES.md) §7):
- `cierre <x>` (lo corre el director, con el módulo ya en la rama por defecto de origin): imprime la línea `cierre de fondo:` de la sesión `cierre-<x>`, de fondo, en la carpeta principal, en `dontAsk`, con su lista cerrada en `--allowedTools`; lo demás que algún settings permite va a un deny aparte. Se niega (1) si el módulo no está integrado, si no encuentra `claude` o si un settings tiene un permiso ancho que no es del kit.
- `cierre-empieza <x>` (la sesión de cierre): toma el candado del cierre y mira la carpeta principal. 0 lista (en la rama por defecto, sin cambios sin guardar) · 1 no toca nada (va derecho al parte) · **4** otro cierre sigue corriendo (volver a probar en unos minutos).
- `publicar <x> [--seguir]`: el único camino por el que el kit publica sin persona. Mira la ficha vigente (`autorizado.publicar`), el sí de esta PC con su huella (salvo `al-subir`), que no haya una publicación trabada o a medias, la carpeta limpia e igual a origin, y que desde lo último publicado solo hayan entrado módulos integrados, papeles o lo del kit. Después corre el `comando-setup` y el `comando-test` en la carpeta principal (con el turno de la PC), publica, corre el humo y, si falla, `volver` (con `comando: al-subir`, solo el humo). Salidas: **0** publicó (o ya estaba, o no había nada nuevo) · **3** no publica (el proyecto no publica solo, falta el sí de la PC o cambió la huella, o quedó trabada: no es una falla) · **1** falló. Lo que corre va a un archivo temporal que se borra siempre (puede traer claves). `--seguir` destraba: es una firma del dueño (con su ventana); de fondo o de noche se niega.
- `subir <x>`: el único push del cierre. Sube a la rama por defecto **solo commits de papeles** (si origin avanzó, trae con `--rebase` y prueba una vez más); código, no. En un proyecto `al-subir` con la publicación trabada, no sube nada.
- `parte <x> [--no-pude "<texto>"]…`: escribe e imprime el parte de la noche en `<papeles>/modulos/<x>/bitacora/<fecha>-parte.md` (Qué quedó · Te necesito · Qué se hizo · Lo que no pude; sin SHAs ni comandos) y suelta el candado. Su "Te necesito" lo lee después el `/estado` del dueño.
De fondo, `publicar` y `subir` corren solo dentro de la sesión de cierre que tomó el candado.

### paquete
Arma en un solo archivo lo que el revisor necesita ver (el revisor no tiene shell).
`node .claude/scripts/paquete.cjs <sha-base> [--salida <archivo>] [--plazo <min>] [--pruebas <cmd> | --sin-pruebas]`
Junta el diff contra HEAD, el `git status`, los avisos de `afirmaciones` y la salida de las pruebas. Escribe en `.claude/paquetes/<sha7>.md` e imprime la ruta en la última línea. Sale 0 aunque las pruebas den rojo (el rojo es dato); 1 si no pudo armarlo.

### portada
Arma el `README.md` de la raíz.
`node .claude/scripts/portada.cjs armar [--plan] [--raiz <dir>]` · `chequear [--raiz <dir>]`
`armar` escribe `README.md` (y `assets/banner.svg`) desde `docs/NORTE.md` y la ficha; no pisa lo que se tocó a mano; con el marcador `{{…}}` sin llenar no escribe. Con un README propio sale 1 y, si el banner quedó, un renglón: `el banner quedó en assets/banner.svg: enlazalo arriba del README si querés`. `--plan` dice qué haría. `chequear` sale 0 si cumple, 1 con una línea por lo que falta. Detalle: [`MOLDE.md`](MOLDE.md) §8.

### resumen
El resumen del día.
`node .claude/scripts/resumen.cjs [<x>] [--forzar]`
Con un módulo con director lo escribe en `docs/modulos/<x>/bitacora/<fecha>-resumen.md`; sin director imprime el bloque para el CHANGELOG (no lo toca). Se muestra una vez por día: si ya existe, dice dónde está y sale 0; `--forzar` lo rehace.

### tiempos
Lo mecánico del módulo, desde git y los transcripts.
`node .claude/scripts/tiempos.cjs tiempos <x> [--ver]` · `alarma [--transcript <ruta>]` · `contador <x>`
`tiempos` escribe la duración y los sub-pasos de cada encargo en `docs/modulos/<x>/tiempos.md` (`--ver` solo imprime). `alarma` cuenta tus intervenciones en la pestaña: con más de 3 imprime la línea para las notas del CIERRE y sale 1. `contador` cuenta sub-pasos y desvíos y nunca frena.

### todo
El cierre del TODO.
`node todo.cjs cierre [--base <ref>]`
Poda `docs/TODO.md` (lo que lleva 90 días sin tocarse baja a 🟢) y imprime `TODO: +n −m · k ítems · j bajaron a 🟢`. Sale 3 si no hay `docs/TODO.md`.

### worktree
Los worktrees de los módulos: nacen, se abren y se cierran por script.
`node .claude/scripts/worktree.cjs crear|abrir <x>[--<ID>] [--noche] [--model <m>]` · `donde <x>[--<ID>]` · `traer-main <x>` · `sync-env` · `cerrar <x>[--<ID>] [--cancelado]` · `integrar <x> [--con-ok]` · `integrados` · `limpiar`
`crear`/`abrir` escriben `.kit-rol`, copian los `.env` ignorados **sacando todo nombre que esté en el almacén de secretos**, corren `vars.comando-setup` (lo que deja sin trackear va al `info/exclude` del repo y un trackeado que cambió, como un lock, vuelve con `git checkout --`: cada cosa con su línea) e imprimen la línea de apertura, que termina en `primer mensaje: /director <x>` (un módulo, también con `--noche`) o `primer mensaje: /obrero <x>--<ID>` (un encargo). `cerrar` hace todos los chequeos antes de borrar y nunca fuerza (salvo `--cancelado`); después de la rama local borra la de origin **solo si** el fetch anduvo y ya está mezclada en `origin/<madre>` (si no, la deja y lo dice en una línea). La línea de apertura sugiere el nombre de la sesión: `director-<x>` o `obrero-<x>--<ID>`. `integrar` lleva el módulo terminado a la rama por defecto: merge `--no-ff`, el gate y el push sin `--force`; nada sube si algo falla; `--con-ok` es el OK del dueño si la ficha lo pide (`--ok-de-guido`, el alias viejo, sigue andando); termina en `después: noche.cjs cierre <x> …` (la sesión de cierre). `integrados` (lo corre el `/inicio` después del `pull`): una línea por cada `integrar: módulo <x>` de la rama por defecto local posterior al último commit que tocó el handoff, con "corré /cierre"; nada si no hay; sale 0 siempre. **`limpiar`** (en la carpeta principal, rol humano; lo corren la sesión de cierre, el `/inicio` y el `/estado` del dueño): cierra con el `cerrar` de siempre cada worktree de `.claude/worktrees/` ya mezclado y limpio (los encargos primero, después los módulos) y hace `git worktree prune`; lo que no puede (en uso, sin mezclar, sucio) no lo fuerza: lo lista con `queda …`. Se puede correr mil veces; sale 0 (desde un worktree o con otro rol, 1).

---

## B. Molde, hooks de Claude (`.claude/hooks/`)

Los llama Claude Code, no vos: leen un JSON por stdin y devuelven su decisión por stdout. Están registrados en el `settings.json`; los tres de Bash/PowerShell (`git-seguro`, `niega-aprobar`, `sensible`), a través de un solo registro, el portero (`hooks/lib/portero.cjs`), que los corre en un proceso. Detalle: [`MOLDE.md`](MOLDE.md) §3.

### session-start
Hook de arranque (`SessionStart`). Inyecta handoff, TODO, git y ficha dentro del presupuesto de 9.700 caracteres, deja la marca de sesión y pone `core.hooksPath=.githooks`. **Sale siempre 0 y no niega.** Plazo de 10 s: lo que no entra se saltea y lo dice ("arranque lento"). Si existe `session-start.propio.sh`, lo corre con bash.

### escritura-docs
`PreToolUse` sobre `Write`. Juzga solo la ruta: archivo suelto en la raíz de `docs/` o carpeta fuera de las tres → `deny` y un renglón en `frenos.log` (`candado:raiz`). Apagado sin la pieza `hook-escritura`. Si falla, deja pasar.

### git-seguro
`PreToolUse` sobre Bash y PowerShell. Frena el git que borra trabajo, falsifica referencias o esquiva el pre-commit (ids `hook:git-seguro/<caso>`). Mira cada comando simple, no el texto. Devuelve `ask` o `deny` con la alternativa en el mensaje, y deja un renglón en `frenos.log` (nunca el comando). Un error propio **frena** ("freno roto: corré doctor").

### niega-aprobar
`PreToolUse` sobre Bash y PowerShell (adentro del portero, y en toda la PC por `secretos`). Mira las tres firmas: un comando con `cambios` y `aprobar`, `noche.cjs publicar --seguir` y `preparar-pc.cjs --publica|--no-publica`. `aprobar` y `--seguir` devuelven `ask` solo en la pestaña del director o en la carpeta principal (rama por defecto), de día y con ventana; **niega** desde un obrero o el tramo, de noche, de fondo (`KIT_FONDO=1`), en modos sin ventana (`bypassPermissions`, `dontAsk`) o desde una sesión abierta en otra carpeta. Cada negativa deja un renglón (nunca el comando).

### sensible
`PreToolUse` sobre Bash y PowerShell. Hace las cinco preguntas: pregunta si algún comando simple **empieza** con una entrada de `sensible:` de la ficha vigente. Ids `pregunta:<clave>`. Además, los comandos de `autorizado.publicar` tipeados por una sesión sin persona (de fondo, de noche, sin ventana, un agente) se **niegan** (`pregunta:publicar-sin-persona`): sin persona, publica solo `noche.cjs publicar`.

---

## C. Molde, githooks (`.githooks/`)

### kit-githook
El runner de `pre-commit`, `pre-merge-commit` y `pre-push`: `node .githooks/kit-githook.cjs <cuál> "$@"`.
Corre gitleaks sobre lo que entra (staged, o lo que sube el push; lo arma él para que un `-diff` en `.gitattributes` no esconda una clave) y el candado `barreras`. Con gitleaks colgado reintenta; sin escáner, el humano pasa en rojo con aviso y lo nocturno no pasa. `pre-merge-commit` no corre el candado.

---

## D. Equipador (`skills/arquitecto-skills/scripts/`)

### actualizar
El actualizador del kit. Un script determinista; el único agente es el de la fusión de una pieza adaptada con conflictos.
`node actualizar.cjs aplicar <carpeta> --kit <raíz> [--molde-viejo <dir>] [--plan] [--claude <exe>|no]` · `chequear <carpeta> --kit <raíz> --base <sha>` · `flota <repo>…|todo [--canon <url|dir>] [--tag <vX.Y.Z[-rc.N]>] [--proyectos <carpeta>]` · `adoptar <carpeta> --kit <raíz> --mirar [--nuevo] [--nivel …] [--comando-test "<c>"] | --aplicar <propuesta> [--principal <carpeta>] [--claude-md]` · `adoptar <clon> --traer <carpeta principal>` · `adoptar <carpeta> --verificar` · `resolver <carpeta> <pieza> mezclar|quedarse|nueva|congelar --por "<texto>" [--a-mano]` · `ultimo-tag <clon del kit>`
`aplicar` pone al día una carpeta pieza por pieza según su ficha (no commitea ni pushea). `chequear` imprime las nueve líneas del chequeo mecánico. `flota` lo hace repo por repo en un clon temporal: verde → un commit a la rama por defecto; rojo → rama `kit/<tag>` ROTA; protegida → te espera; imprime la tabla y "te espera:". Sin `--canon` usa el repo canónico del kit (el mismo que mira el `doctor`); tarda: la sesión la corre en segundo plano. Después de `chequear` corre `--verificar` en el clon y no mezcla si no andan los hooks o el arranque. Saltea el repo con ramas `modulo/*` del remoto **sin mezclar** en su rama por defecto (la línea dice: si la mezclaste con squash en GitHub, borrá la rama desde la web). Sin `--tag` reparte el último tag anotado (el de `ultimo-tag`: **rc incluido**, y `v3.0.0` le gana a `v3.0.0-rc.N`) a todo proyecto con ficha; la versión se compara entera, también con `-rc`.
`adoptar` pasa un proyecto sin ficha al kit. `--mirar` solo propone: con `--nuevo` (un repo recién nacido, el Modo A) las bases en molde, el candado, `director-obrero` y `estado`; en un repo con código, `director-obrero` y `estado` en `sí` (o `propia` si ya hay unos distintos); dice si al `CLAUDE.md` le falta "El tamaño del pedido" y si tiene un director/obrero propio, y la receta de `migrar-cambios` si hay registro propio. Además (8r2): `--principal` en `--mirar` da el nombre de la carpeta de Guido a `vars.proyecto`; la línea `comandos:` (en Python, el `.venv` de cada worktree), `entornos: ninguno declarado`, `herramientas:`, la `config local ignorada` (un `.worktreeinclude`) y los bloques `D1`-`D4`. `--aplicar` escribe en el clon y solo valida `--principal`; `--director kit` (D1: los del kit reemplazan director, estado, `/inicio` y `/cierre` propios), `--permisos recomendada` (D2) y `--arranque kit` (D3, estos dos en un tercer commit); `--claude-md` le suma al `CLAUDE.md` la sección "El tamaño del pedido" del molde. El último paso, después del push: `adoptar <clon> --traer <carpeta>` trae lo adoptado (`merge --ff-only`, solo limpia, en la rama y con el push hecho; lo sin seguir traba solo si choca con lo que viene) y **después** prende `core.hooksPath` = `.githooks` ahí (nunca en el clon); al final corre `--verificar` en tu carpeta. Sus salidas: **0** trajo y anda · **1** el clon o la carpeta no son lo que tienen que ser, el fetch no anduvo, o el merge falló y la dejó a medias (la línea da cómo volverla atrás) · **3** trajo bien pero algo no anda (las ❌ de `--verificar`): **no se deshace nada**, se arregla · **4** no trajo (el push no llegó, la carpeta tiene cambios sin commitear o en otra rama —y qué worktree la tiene tomada—, o tiene commits que no están en origin): la línea dice por qué y qué hacer, y no tocó nada. **`adoptar <carpeta> --verificar`** (¿quedó andando?): una línea `verificar · <id> · ✅|❌|⚠ · …` por cada uno de hooks · arranque · comando-test · hooksPath · zona, y al final `verificar · el repo quedó andando` (0) o `verificar · algo no anda` (1). Corre cada hook PreToolUse registrado con una entrada inocente (`echo hola`) y el de arranque, así que **corre código del repo**; no corre el `comando-setup`. Un hook del molde que no anda es ❌; uno propio que niega, ⚠ (puede ser a propósito). Y (8r3): `--mirar` detecta la carpeta de papeles (la única con `SESSION_HANDOFF.md` seguido) y la propone como `carpeta-docs:`; `--aplicar` escribe todo el árbol ahí y se niega con un `docs/` ajeno sin la clave; un `session-start.cjs` propio con el nombre del del kit abre `D3`, y `--arranque kit` lo reemplaza. `resolver <carpeta> <pieza> nueva --kit <clon> --por …` trae la del kit a una pieza `propia` sin informe; si es de frenos, imprime el `cambios nuevo` exacto y el orden (aprobado, después el commit).
**Una pieza adaptada que choca nunca se resuelve sola**: queda en `.claude/fusiones/<pieza>.md` con el motivo `la mezcla chocó…` (si hay `claude`, con su propuesta, sin aplicar), `## Dónde chocan` y las cuatro salidas. `resolver` escribe la que eligió el dueño, en su checkout: lo del informe, la ficha (estado, `por:` y, con `propia`, `desde:`: la versión desde la que se le vuelve a ofrecer) y borra el informe; no commitea. Salidas: 0 · 1 se negó o falló · 2 uso. Detalle: [`EQUIPADOR.md`](EQUIPADOR.md).

### cambios-flota
Lo que la flota aprendió, contado.
`node cambios-flota.cjs [<repo>…] [--proyectos <carpeta>] [--urgentes] [--kit <raíz>]`
Solo lectura y sin red: lee lo commiteado en la rama por defecto local de cada repo. Sin `--urgentes` imprime la tabla del ciclo (qué regla se repite, cuál entra al kit); con `--urgentes`, una línea por cambio urgente vivo (lo que corre el `/inicio` de vibe-kit). Sale 0 (es un informe) o 2.

### doctor
El chequeo de salud de esta PC y de este repo.
`node doctor.cjs [--home <dir>]`
**Solo lectura.** Una línea por chequeo, `✓|✗|⚠ <id> · qué · cómo se arregla`; después el resumen para el dueño, `doctor · todo bien · N avisos · N cosas a arreglar · 29 chequeos` (o `hay cosas que arreglar`), y debajo el inventario de frenos del repo. La sesión le dice al dueño el resumen y cada ✗ con su arreglo; el detalle, si lo pide. Ids (29): `node`, `gitleaks`, `claude-code`, `lefthook`, `git-bash`, `settings-pc`, `hooks-pc`, `hooks-pc-iguales`, `deny-almacen`, `anti-secretos-viejo`, `plazo-arranque`, `pre-commit`, `ficha`, `sensible-prosa`, `version-kit`, `kit-sync`, `githooks`, `archivo-pc`, `credencial`, `gh-push`, `mesa-gh`, `cross-session`, `automode`, `copias-kit`, `frenos-vencidos`, `regla-tamano`, `tope-skills`, `vecinos`, `locks`. Sin red o sin poder correr algo externo: ⚠ NO VERIFICADO. Sale 0 si no hay ningún ✗; 1 si hay alguno.

### instalar-hooks-pc
El corrector de secretos de la PC.
`node instalar-hooks-pc.cjs [--home <dir>] [--plan] [--quitar] [--sacar-viejo]`
Copia `pc/` a `~/.claude/hooks/kit/` y lo registra en `~/.claude/settings.json` regla por regla (los hooks `PreToolUse`, el `UserPromptSubmit` y el `deny` del almacén de secretos). Lo que no es del kit no se toca. Igual → "sin cambios". `--plan` no escribe; `--quitar` deja la PC como antes; `--sacar-viejo` saca solo el registro del anti-secretos viejo. JSON inválido o forma rara → no toca nada, sale 1.

### migrar-cambios
Pasa un `CAMBIOS.md` de archivo único (el de Hermes) al registro chico del kit.
`node migrar-cambios.cjs --repo <dir> [--fuente docs/metodo/CAMBIOS.md] [--plan] [--commit]`
Un archivo por `CM-n` en `.claude/cambios/`, con cabecera y las cuatro secciones; un CM aplicado solo lo es si su SHA existe y está en la rama por defecto. Idempotente. No toca la fuente. Una línea por CM y el total; sale 1 si alguno no se pudo escribir.

### preparar-pc
"Preparame esta PC".
`node preparar-pc.cjs --kit <raíz del kit> [--home <dir>] [--proyectos <carpeta>] [--plan] [--flota] [--pisar-editados] [--publica <origin>]… [--no-publica <origin>]…`
**Muestra todo el plan antes de escribir.** Chequea node, git, gh, gitleaks y Claude Code (no los instala); copia el kit a `~/.claude/`; instala los hooks de la PC; mezcla el `settings.json` (`crossSessionInbound`, `autoMode.environment`); corre la capa privada si hay; escribe `kit-pc.md`; imprime la tabla y corre `doctor`. La segunda línea de la salida es el plan en una: `resumen · cambiaría|cambié: … · N avisos · N cosas a arreglar`, o `resumen · sin cambios · …` (con eso la sesión no pregunta: lo dice y sigue). Un archivo editado a mano no se pisa salvo `--pisar-editados`. Sale 0 (los ⚠ no traban), 1 o 2. Termina con "reiniciá Claude Code".
**El sí de publicar, por repo**: por cada repo de la carpeta de proyectos cuya ficha vigente (la de origin) publica por comando y no tiene el sí de esta PC (o cambió su huella), un renglón `⚠ publicar · <proyecto> (<origin>) … · publica con: … · lo prueba con: … · vuelve atrás con: …`. **`--publica <origin>`** anota el sí en `kit-pc.md` (`publica:`, con el origin normalizado y la huella de hoy); si no encuentra ese repo con esa ficha, ✗ y no toca nada. **`--no-publica <origin>`** lo saca. Los dos son una firma del dueño: el freno de la PC muestra la ventana y, sin ventana, se niegan; con `--flota`, no valen. Una corrida sin ninguno de los dos deja las autorizaciones como estaban. Detalle: [`MOLDE.md`](MOLDE.md) §4.

### traer-repos
"Preparame esta PC" trae los repos de tu cuenta que elijas.
`node traer-repos.cjs listar --proyectos <carpeta> [--gh <ruta>]` · `clonar <dueño/repo>… --proyectos <carpeta> [--gh <ruta>]`
`listar`, con `gh`: los repos de la cuenta y de sus organizaciones, cada uno `ya está (<carpeta>)` (algún repo de la carpeta tiene ese origin) o `para traer`; no escribe nada. `clonar`: cada uno a `<carpeta>/<repo>`, con `core.longpaths`; nunca pisa una carpeta que existe (la saltea con su línea); si el repo trae el kit (ficha y `.githooks/`), prende los ganchos. **No corre el `comando-setup`** (es código de ese repo): lo nombra, y la sesión pregunta repo por repo. Nunca clona sin que el dueño elija. Salidas: 0 (lo salteado no traba) · 1 `gh` no anda o un clon falló · 2 mal llamado. Detalle: [`EQUIPADOR.md`](EQUIPADOR.md) §1.

---

## E. Arquitecto (`skills/arquitecto/scripts/`)

### arquitecto
Los chequeos y el sello del Arquitecto. **El sello lo escribe este script, nunca el modelo.**
`node <skill>/scripts/arquitecto.cjs sello <spec> [--no-partir "<quién>"] [--no-aplica tamaño|entorno "<razón>"]` · `ready <spec>` · `ready --pendientes` · `tope <spec>` · `entorno` · `registro <carpeta de proyectos>`
`sello` corre los chequeos (tamaño, entorno, tope) y escribe la línea con el hash del spec. Con la base real y ninguna de prueba, acepta la **tarea 0** (el renglón `- **Tarea 0**: …` primero en `## Entorno de prueba`) solo en un módulo con director y con el `kit:` de la ficha ≥ `3.0.0-rc.2`: el sello dice `entorno — (tarea 0: montar el entorno de prueba)`. `ready` se niega sin sello válido o con el spec tocado después, y cambia BORRADOR por READY y nada más. `tope` mide el spec y avisa (no corta). `entorno` chequea el gate de entorno de prueba contra la ficha. `registro` lee la ficha de cada proyecto de la carpeta (adaptador de ejemplo). Salidas: 0 · 1 negado o con fallas · 2 mal llamado.

---

## F. Scripts de la PC (`skills/arquitecto-skills/pc/`)

Los instala `instalar-hooks-pc` en `~/.claude/hooks/kit/`: son de la PC, no de un proyecto. Se nombran acá porque el runbook de la credencial los usa.

### secretos
El corrector de secretos. Hook que **niega** (`PreToolUse` sobre Bash, PowerShell, Write, Edit…) lo que escribe o pega una clave con forma real, y `UserPromptSubmit` que bloquea el prompt con una clave (este último **falla abierto**). Corre en todo proyecto, con kit o sin kit. En su mismo proceso carga `niega-aprobar.cjs` (copia idéntica del del molde): las tres firmas del dueño (`cambios aprobar`, `noche.cjs publicar --seguir`, `preparar-pc.cjs --publica|--no-publica`) preguntan con ventana en toda la PC y se niegan sin ella.

### cargar-secreto
Guarda **una** credencial sin pasarla por el chat. La corre el humano, no Claude.
`bash ~/.claude/hooks/kit/cargar-secreto.sh NOMBRE [--al-env]` · `powershell -File $env:USERPROFILE\.claude\hooks\kit\cargar-secreto.ps1 NOMBRE [-AlEnv]`
Pide el valor oculto y lo guarda en `~/.config/kit-secretos/<proyecto>.env` (fuera del repo). Con `--al-env`, en el `.env` de la raíz (solo dummy, de prueba o solo lectura). El `<proyecto>` sale del checkout principal. Salidas: 0 guardado · 1 no pudo escribir · 2 uso o valor inválido.

---

## G. Del repo madre (vibe-kit)

Esto vive en `.claude/scripts/` de **vibe-kit**, no se instala en los proyectos.

### kit-sync.sh
Compara o sincroniza `kit/` con `~/.claude/` (las cuatro skills, `agents/redteam-spec.md` y `VERSION`).
`bash .claude/scripts/kit-sync.sh` (compara; lo usa `/inicio`) · `bash .claude/scripts/kit-sync.sh sync` (copia `kit/` → `~/.claude/` y después compara; lo usa `/cierre`)
Imprime una línea `✓` o `✗` por ruta y termina con `kit ↔ ~/.claude: LIMPIO` (salida 0) o la diferencia (salida 1). Ignora y conserva la línea "Carpeta de proyectos de esta máquina" del Arquitecto, que es de cada PC.
