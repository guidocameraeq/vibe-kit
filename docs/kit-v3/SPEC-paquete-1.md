# SPEC delta: paquete 1 — la ficha del kit, su parser, `kit/VERSION` y los repos de prueba — vibe-kit
Cada repo va a poder decir qué versión del método tiene y cómo lo adaptó, en un archivo que un script lee sin librerías; y el kit
gana tres repos de prueba que se rehacen solos, para probar todo lo que viene.
- Estado: ✅ IMPLEMENTADO 2026-10-28 (sellado por Guido ese día; construido por D1.1 con 5 encargos Sonnet y el revisor frío Opus)
- Fecha: 2026-10-28
- Misión: 5, director D1.1 (`vibe-kit M5 · D1.1 · Paquete 1: la ficha del kit y su parser`)
- Plano: [`SPEC-0-kit-v3.md`](SPEC-0-kit-v3.md), orden 1 = **P3.1 + P2.1 + `pruebas/rehacer.sh`**. Diseño: E §4 y §8, F §9 y §14, G §12 y §15, H §4.
- Sello del Arquitecto: `arquitecto: 2026-10-28 · kit 2.4.3 · chequeos: tamaño — (paquete del método) · entorno ✅ (pruebas/) · tope — · sellado a mano por Guido` — sus palabras: "Sellado tal cual, con P3.2 al orden 2" (los scripts del sello llegan en el orden 4; SPEC-0, Ejecución).
- Red team: no corresponde (el paquete no toca permisos ni secretos; SPEC-0, RF-16). Revisor frío Opus al cerrar, sobre el diff entero.

## Por qué (el dolor)

Cero de diez proyectos saben qué versión del método tienen (TABLERO §1), y todo lo que viene en la misión 5 (el hook, el candado, los
frenos, el actualizador) lee una ficha que todavía no existe. Su forma queda **congelada** cuando el actualizador la lleve a la flota
(SPEC-0 ⚠️, RT1-9): por eso se fija acá, contra un ejemplo completo, y no sobre la marcha. Y sin repos de prueba nada se prueba.

## Contexto (lo que hay hoy, explorado el 2026-10-28)

- La versión existe solo como tag (`v2.4`, `v2.4.1`, `v2.4.2`, `v2.4.3`). No hay `kit/VERSION`.
- El molde v2 vive en `kit/skills/arquitecto/templates/universales/` (dos skills, dos hooks, settings, `CLAUDE.md`, tres docs) con 13
  marcadores `{{...}}` distintos; lo instancia el Arquitecto a mano (Modo A). No hay `kit/molde/`.
- `kit-sync.sh` compara y copia 5 rutas (4 skills y el agente). El Equipador, en "actualizate", copia las mismas 5 desde el repo.
- No hay `pruebas/`. En la PC `clientes`: node 24, git 2.53, gitleaks y `gh` instalados.

## AGREGA

| Archivo | Qué es |
|---|---|
| `kit/molde/kit.ejemplo.md` | La ficha de ejemplo: referencia de la forma y caso de prueba (no plantilla para copiar; ver "Lo que cambió en la construcción"). **Va tal cual el anexo A** |
| `kit/molde/hooks/lib/ficha.cjs` | El parser, node estándar sin dependencias. En cada proyecto va a `.claude/hooks/lib/ficha.cjs` |
| `kit/molde/hooks/lib/ficha.test.cjs` | Sus pruebas, `node --test`. Lo que termina en `.test.cjs` **no se instancia** en los proyectos |
| `kit/VERSION` | Una línea: `2.4.3` (la del último tag) |
| `kit/CHANGELOG.md` | El changelog **del kit**: una sección por versión con su nota de migración (E §8). Arranca con `2.4.3` |
| `pruebas/rehacer.sh` | Arma los tres repos de prueba y sus remotos desde el molde de un tag |
| `.gitignore` | `pruebas/*` con excepción para `rehacer.sh` y `pedidos.md` |

### El parser (`ficha.cjs`)

- **Biblioteca**: `leer(texto)` → `{datos, prosa, avisos}`; si algo no entra, lanza `ErrorFicha` con `linea` y `mensaje`.
  `leerArchivo(ruta)`, `hash(texto)`, `compararVersiones(a, b)`.
- **Línea de comandos**: `leer <archivo>` (imprime JSON) · `campo <archivo> <a.b.c>` · `hash <archivo>` · `version`.
  Salida: **0** bien · **1** ficha malformada o inválida, con `<archivo>:<línea>: <qué pasa> — <cómo se arregla>` · **2** mal llamado ·
  **3** no hay ficha (los hooks distinguen "sin ficha", que da los frenos de fábrica, de "ficha rota", que frena; P4.7).
- **`version`** imprime en una línea la **instalada** (`~/.claude/VERSION`), la **del proyecto** (la ficha del repo donde corre) y la
  **canónica** (`kit/VERSION` si corre dentro de vibe-kit). Lo que falta dice `—` con el porqué, y sale con 0. Contra el último tag
  publicado compara el `doctor` completo (orden 6), no esto.
- **`hash`**: sha256 del archivo con fines de línea pasados a LF, primeros **12** caracteres hexa. Sin las zonas propias cuando exista
  P3.2; hasta entonces, el archivo entero.

### La gramática (el subconjunto, cerrado)

1. Archivo: `---` en la primera línea, la cabecera, `---`, y abajo la prosa. Se aceptan BOM y fines de línea CRLF.
2. **Mapas** con sangría de **2 espacios**, hasta **tres niveles** (`entornos.<nombre>.clase`). Tabulador, sangría impar o un salto de
   más de un nivel → error.
3. **Listas en línea** de texto `[a, b]`, también vacías `[]`. **Mapas en línea** `{a: x, b: y}`. **Listas de mapas en línea**, una por
   renglón: `- {id: …, por: …, hasta: …}`. Nada anidado dentro de una lista en línea.
4. **Todo valor es texto**: `no`, `2026-11-15` y `2.4.3` llegan como texto; el que valida decide (así `no` nunca se vuelve "falso").
   Sin comillas, o entre **comillas dobles sin escapes** (para lo que lleva `, `, `: ` o `#`). Separador: `:` seguido de espacio.
5. Comentarios con `#` (al principio del renglón o después de un espacio, fuera de comillas).
6. **Error con número de línea** para: comillas simples, `\` dentro de comillas, anclas y alias (`&`, `*`), etiquetas (`!!`), texto en
   varias líneas (`|`, `>`), listas de texto en bloque (`- a`), una clave repetida en el mismo mapa, una clave sin valor ni hijos,
   corchetes o llaves sin cerrar, y lo que no sea nada de lo de arriba. Nunca "lo mejor que pude" (SPEC-0 P3.1).

### Lo que valida, además de la forma

| Campo | Regla |
|---|---|
| `kit` | obligatorio; tres números `N.N.N` |
| `nivel` | obligatorio; `liviano` o `estandar` |
| `vars` | mapa; `proyecto` obligatorio; `lenguajes` es lista |
| `piezas.<nombre>` | un estado, o `{estado, hash}`. Estados: `molde`, `molde+propio`, `adaptada`, `"adaptada (desvío detectado)"`, `propia`, `sí`, `no`. `hash`: 12 hexa |
| `frenos` | `opcionales` lista; `quitados` lista de `{id, por, hasta}`, los tres obligatorios; `id` es `<clase>:<lo que sea>` (`hook:git-seguro/push-force`, `"deny:Bash(git stash:*)"`), sin repetirse; `hasta` es `siempre` o `AAAA-MM-DD` (F §14) |
| `sensible` | solo las cinco claves de A (`datos-reales`, `plata`, `sale-afuera`, `claves`, `release`); cada una `no` o una lista |
| `secretos`, `publicas` | listas de nombres de variable (`MAYUSCULAS_CON_GUION_BAJO`) |
| `entornos.<nombre>` | `clase` obligatoria (`real`, `prueba`, `dummy`); `herramientas` lista de nombres, **cada uno declarado en `herramientas:`**; `acceso` texto |
| `herramientas.<nombre>` | `{chequeo, necesita-guido}`: `chequeo` texto obligatorio (el comando de una línea), `necesita-guido` `sí` o `no` (SPEC-0, "La lista de herramientas por entorno"; decidido por Guido el 2026-10-28) |
| `mesa.<alias>` | `contacto` texto obligatorio; `transporte` `git` o `buzon`, opcional (sin él, `git`; G §12) |
| `push-publica`, `multi-llm` | `sí` o `no` |
| `aprueba` | un alias en minúsculas, nunca un nombre real (G §15) |
| `autorizado`, `datos-de-prueba` | mapa de textos · texto. Los valores los valida la pieza que los usa (órdenes 3 a 5) |
| **campo de arriba desconocido** | **aviso, no error**: va a `avisos` y `leer` lo imprime por stderr (ver ⚠️) |

### `pruebas/rehacer.sh`

- Arma desde cero, en `pruebas/`: **`alfa`** (`estandar`, con un `comando-test` real de node), **`beta`** (`liviano`, sin código) y
  **`gama`** (`estandar`, con prueba de node; el segundo para la mesa y el actualizador), cada uno con su remoto `bare` en
  `pruebas/remotos/<x>.git`, `main` pusheada y `origin/HEAD` apuntando a `main`.
- El molde sale de **`git archive` del tag** (por defecto `v2.4.2`, como dice el SPEC-0; `--desde <tag>` para otro), se reemplazan los
  13 marcadores con valores fijos, y si queda un `{{` suelto, falla.
- A cada repo le escribe **una ficha `.claude/kit.md` con `kit: 2.4.2`**, como si lo hubiera adoptado un adoptador en esa versión, con el
  hash real de cada pieza: es lo que el actualizador del orden 6 tiene que poner al día. Las tres fichas son distintas a propósito
  (`alfa` con entornos, secretos y mesa hacia `gama`; `beta` mínima; `gama` con mesa hacia `alfa` y un freno quitado).
- Commits con la identidad local **`kit-pruebas <pruebas@kit.invalid>`**, nunca la de Guido.
- **Guardia antes de borrar**: solo borra si la carpeta del script se llama `pruebas` y su padre tiene `kit/VERSION`; nunca recibe una
  ruta para borrar. Si no, sale con 1 sin tocar nada.
- Termina leyendo las tres fichas con el parser y corriendo el `comando-test` de `alfa` y `gama`; una tabla de cuatro renglones; sale con
  1 si algo falló. Correrlo dos veces da lo mismo.
- Cada orden siguiente le suma su paso ("rehacer con lo nuevo que ya existe"; RF-8).

## MODIFICA

- `.claude/scripts/kit-sync.sh`: suma `kit/VERSION` → `~/.claude/VERSION` al copiar y al comparar. *Efecto a cuidar*: las cinco rutas de
  hoy y la línea de la carpeta de proyectos se siguen tratando igual; `/inicio` y `/cierre` lo llaman igual.
- `kit/skills/arquitecto-skills/SKILL.md`: **una línea** en "actualizate", paso 2: copiar también `VERSION` → `~/.claude/VERSION`.
  *Efecto a cuidar*: así la PC `Usuario` tiene versión antes del orden 6; el resto del Equipador, intacto.
- `CLAUDE.md` (mapa): filas para `pruebas/` (lo pide el SPEC-0) y `kit/CHANGELOG.md`. `docs/README.md`: la fila de este delta.
- Diseño E §4: una nota con fecha (hash de 12 hexa, todo valor es texto, el estado con desvío entre comillas, el parser en `.claude/hooks/lib/`).

## NO SE TOCA

- **El kit v2 entero**: las cuatro skills, el agente y el molde de `templates/` siguen montando proyectos `2.4.x` hasta el orden 4. En
  `kit/skills/` cambia **solo** la línea del Equipador de arriba.
- `kit/skills/relevamiento/plantillas/_fuente/`: ni un byte.
- `~/.claude/`: solo por `kit-sync.sh sync`.
- **Los diez repos de la flota**: nada. La ficha recién viaja en el orden 6.
- El hook de arranque y las skills `/inicio` y `/cierre` de vibe-kit.
- `tips/` y los diseños (salvo la nota de E §4).

## Criterios de aceptación

1. **Regresión**: `kit-sync.sh` da LIMPIO (con `VERSION`); el diff del paquete sobre `kit/skills/` es solo la línea del Equipador.
2. `node --test "kit/**/*.test.cjs"` en verde (*corregido el 2026-10-28 en la construcción: decía `node --test kit/`, que node 24 toma como glob y falla*): el ejemplo da el JSON esperado (comparado entero) y **cada uno de los ≥ 20 casos malformados** da error
   en el número de línea esperado.
3. `ficha.cjs leer kit/molde/kit.ejemplo.md` sale con 0; con una ficha rota sale con 1 y `<archivo>:<línea>:`; sin ficha, con 3.
4. `ficha.cjs version` muestra instalada y canónica `2.4.3` después del sync; con un `HOME` sin `VERSION`, dice `—` y sale con 0.
5. `bash pruebas/rehacer.sh` desde cero deja los tres repos y los tres remotos, `origin/HEAD` puesto, las tres fichas leídas por el
   parser, los dos `comando-test` en verde y cero `{{`; la segunda corrida da lo mismo; `git status` de vibe-kit queda limpio.
6. Copiado fuera de `pruebas/`, `rehacer.sh` sale con 1 sin borrar nada.
7. `git log` de los repos de prueba muestra solo `kit-pruebas`.
8. El revisor frío leyó el diff entero; lo que encontró está aplicado o anotado en el tracker con su razón.

## Los encargos (el director reparte, lee cada diff y corre las pruebas él)

| # | Modelo | Qué | Puede tocar | Prueba que tiene que pasar | Depende |
|---|---|---|---|---|---|
| E1 | Sonnet | Parser, sus pruebas y la ficha de ejemplo | `kit/molde/**` | Criterios 2 y 3, y `version` del 4 | — |
| E2 | Sonnet | `VERSION`, `kit/CHANGELOG.md`, `kit-sync.sh`, la línea del Equipador | esos cuatro archivos | Criterios 1 y 4 | — |
| E3 | Sonnet | `rehacer.sh` y el `.gitignore` | `pruebas/rehacer.sh`, `.gitignore` | Criterios 5, 6 y 7 | E1 |
| RF | Opus | Revisor frío sobre el diff del paquete | nada (lee y reporta) | Criterio 8 | E1-E3 |

Mecánicos en Sonnet, como fija el tracker; nada de esto es hook, permiso ni secreto. Uno detrás del otro, en `main` (E1 y E2 no comparten
archivos, pero son chicos: no vale un worktree). Lo que el director hace a mano son documentos: este delta, el mapa del `CLAUDE.md`, el
índice, la nota de E §4 y el tracker.

## Supuestos

- [MEDIO] Que **un `.cjs` corre igual** en un proyecto con `"type": "module"` (Hub, Portal) y en uno sin `package.json`. Es la regla de
  node; la prueba E1 lo cubre con un `package.json` de módulo al lado.
- [BAJO] Que Claude Code **no confunde** las skills `/inicio` y `/cierre` de los repos de prueba (que viven adentro de vibe-kit) con las
  de vibe-kit al leer archivos de `pruebas/`. Se mira una vez en esta sesión; si pasa, va a "Pendientes" y se decide con Guido.

## Riesgos y decisiones ⚠️ (las aprobás con el sello)

- ⚠️ **El formato queda congelado al repartirse.** Por eso la gramática es chica y cerrada: lo que no está en la lista da error. Agregar
  una forma después es fácil; sacarla, una migración en la flota.
- ⚠️ **Un campo de arriba desconocido avisa, no frena.** La ficha y la PC pueden estar en versiones distintas (el hook por PC del orden 3
  lee la ficha de cada repo): si un campo nuevo frenara, una PC atrasada trabaría todo. Lo que sí frena es una forma rota o un valor
  inválido en un campo conocido. *Descartado*: frenar ante lo desconocido, que caza los errores de tipeo pero traba a la PC atrasada; los
  tipeos los muestra el aviso, y `doctor` los lista.
- ⚠️ **`.cjs` y no `.js`**: un `.js` en un proyecto con `"type": "module"` no corre como script común, y el hook que lo use fallaría.
  Corrige al SPEC-0, que dice "node" sin extensión.
- ⚠️ **El parser vive en `.claude/hooks/lib/`** de cada proyecto: queda bajo los mismos candados que los hooks (`candado:barreras`, el
  freno del obrero sobre `.claude/hooks/**`). Falsear el parser es falsear un freno, y se frena igual. Cómo llega a la PC lo decide el orden 3.
- ⚠️ **Los repos de prueba nacen con ficha `2.4.2`**, aunque ningún repo real de `2.4.x` tiene ficha: es el caso que el actualizador
  necesita. El caso "repo viejo sin ficha" del adoptador lo suma el orden 6 a `rehacer.sh`.
- ⚠️ **Cambio al plan: P3.2 (la zona propia) no tiene orden en el SPEC-0.** La necesitan el `/inicio` y `/cierre` v3 con sus marcas y la
  exención del actualizador en `candado:barreras`. **Va al orden 2** (decidido por Guido con el sello, 2026-10-28; anotado en el tracker,
  "Cambios al plan").
- ⚠️ **`pruebas/pedidos.md` pasa al orden 2**: lo usa `/inicio` v3 (P5.1), que es del orden 2; acá solo queda su excepción en el `.gitignore`.
- ⚠️ **`kit/VERSION` dice la versión del último tag** y se sube en el commit que pone el tag siguiente. Mientras se construye la v3
  dice `2.4.3`, que es lo que de verdad está repartido.

## Lo que cambió en la construcción (2026-10-28: el revisor frío y Guido)

El revisor frío (Opus, sin contexto) encontró que la gramática, tal como estaba, congelaba cosas que los diseños ya habían decidido
distinto. Se corrigió antes de cerrar:
- **El `id` de un freno quitado acepta una regla `deny` por su texto**, como manda F §14 (`"deny:Bash(git stash:*)"`). Antes la regla lo
  rechazaba. Y dos frenos quitados con el mismo `id` dan error.
- **Las herramientas de un entorno** (el SPEC-0 pedía nombre, chequeo y `necesita-guido` dentro de cada entorno, y eso no entra en tres
  niveles): **decidido por Guido**, "campo aparte: `herramientas.<nombre>` con su chequeo y `necesita-guido`, y cada entorno las nombra en
  su lista. Se queda en tres niveles". Una herramienta que nombra un entorno y no está declarada da error.
- **Una clave desconocida dentro de un campo conocido avisa, no frena** (salvo en `sensible`, que es la lista cerrada de las 5 de A): es
  la misma razón del ⚠️ de los campos de arriba, que si no trababa a toda PC atrasada la primera vez que un campo sume una clave.
- **El ejemplo no es una ficha para copiar** (sus frenos quitados son de muestra; copiarlo sacaba el freno al `push --force`): lo dice su
  primera línea, y el error de "no hay ficha" dice "valen los frenos de fábrica" en vez de "copiá el ejemplo". La ficha de un proyecto la
  arma el Arquitecto o el adoptador con los valores de fábrica de su nivel (órdenes 4 y 6): **el ejemplo es la referencia de la forma y el
  caso de prueba, no la plantilla** (corrige "plantilla y caso de prueba a la vez" de arriba y del SPEC-0 P3.1).
- **Ningún mensaje de error repite lo que escribió el usuario** (podría ser una clave pegada por error): dice el campo, la línea y qué
  se acepta.
- **Salida 4 = campo ausente** en `campo` (antes salía 0 con nada, que en bash no se distingue de un texto vacío).
- Chicos: el hash ignora el BOM; una ficha en UTF-16 dice "guardala en UTF-8"; versiones sin ceros a la izquierda; corchete suelto en
  un texto es error; vacío es vacío después de recortar espacios; `transporte` de la mesa es opcional; `version` no revienta sin carpeta
  de usuario; `rehacer.sh` fija las cuatro identidades de git y no lee la configuración global.

## Lo que se prueba más adelante (no en este paquete)

- Que **todo hook que lee una ficha malformada frene** (SPEC-0 P3.1, RT1-1): este paquete deja el parser saliendo con 1; el freno se
  prueba cuando existan los hooks (órdenes 2 y 3).
- Que el `hash` excluya las zonas propias: con P3.2.

---

## Anexo A — `kit/molde/kit.ejemplo.md` (va tal cual; actualizado con las correcciones de la construcción)

```markdown
---
# Ficha del kit de este repo. La lee un script: respetá la forma.
# Mapas con sangría de 2 espacios (hasta 3 niveles) · listas [a, b] · listas de mapas en línea: - {a: x, b: y}
# Todo valor es texto, sin comillas o entre comillas dobles. Nada de comillas simples, \, & ni texto en varias líneas.
# Es un ejemplo de la forma, no una ficha para copiar: sus frenos quitados y autorizaciones son de muestra.
kit: 2.4.3
nivel: estandar                      # liviano (sin código) · estandar (con código)
vars:                                # con qué se instanció el molde: sin esto no se puede regenerar
  proyecto: ejemplo
  comando-test: node --test
  comando-setup: npm install
  lenguajes: [js, ts]
piezas:                              # molde · molde+propio · adaptada · propia · sí · no; hash: 12 hexa de lo que escribió el molde
  inicio: {estado: molde+propio, hash: 3f9a0c1d2e4b}
  cierre: {estado: molde+propio, hash: b71c55d0a9e3}
  hook-arranque: {estado: molde, hash: 90e2f1aa7c06}
  settings: {estado: molde+propio, hash: 5d04e9b3c218}
  check-code: {estado: "adaptada (desvío detectado)", hash: 7a1b2c3d4e5f}
  docs: molde                        # solo las plantillas del nacimiento; docs/ es del proyecto
  candado: molde
  smoke: propia
  release: propia
  director-obrero: no
  cambios-metodo: molde
  docs-fyd: sí
frenos:
  opcionales: []
  quitados:                          # cada uno con razón y hasta: siempre, o una fecha
    - {id: hook:git-seguro/push-force, por: "proyecto personal, el push es libre", hasta: siempre}
    - {id: pregunta:borrar-datos-reales, por: "base dummy #3 de la misión 3", hasta: 2026-11-15}
    - {id: deny:Bash(git stash:*), por: "el flujo de release lo necesita", hasta: siempre}
autorizado:                          # lo que no es pregunta
  merge-a-main: con-gate-verde
  escribir-produccion: por-comando-con-foto
sensible:                            # las 5 preguntas de fábrica: no, o qué duele en este repo
  datos-reales: [tabla clientes de la base real]
  plata: no
  sale-afuera: [mails a gerencia]
  claves: [cargar-secreto]
  release: [npm run release]
secretos: [DB_URL, HUB_TOKEN]        # nombres, nunca valores
publicas: [SUPABASE_ANON_KEY]        # parecen secreto y no lo son
herramientas:                        # lo que se puede usar: un chequeo de una línea y si necesita a Guido; cada entorno nombra las suyas
  db: {chequeo: "db ping", necesita-guido: no}
  sqlite:
    chequeo: sqlite3 --version
    necesita-guido: no
entornos:
  base-real:
    clase: real                      # real · prueba · dummy
    herramientas: [db]
    acceso: "db (solo lectura)"
  base-local:
    clase: dummy
    herramientas: [db, sqlite]
    acceso: db (todo)
datos-de-prueba: docs/referencia/PRUEBA.md
push-publica: no
aprueba: po-ejemplo                  # un alias, nunca un nombre real
mesa:
  hub:
    contacto: hub/director
    transporte: git
  deptos: {contacto: deptos/sesion, transporte: buzon}
multi-llm: no
---

## Cómo se adaptó el kit a este proyecto

- `check-code`: se reescribió para validar también los `.sql`, porque dos migraciones rotas llegaron a `main` (2026-09).
- `frenos`: se quitó el freno al `push --force` porque es un proyecto personal sin nadie más en la rama (2026-10).
```
