# SPEC delta: paquete 8 — el observatorio mide de nuevo, y la documentación dice lo que el kit v3 hace — vibe-kit
Antes del piloto hace falta el "antes" medido con los mismos scripts que van a medir el "después": `flota.py` aprende a leer la ficha del
kit, la corrida mensual repite las líneas base del TABLERO y queda escrita como receta. Y el que llega a la guía, a los manuales o al
playbook encuentra el kit v3, no el v2: los dos ejes de tamaño, las recetas nuevas, una página por pieza y las notas en los diseños.
- Estado: READY — sellado sin Guido (provisorio), 2026-11-03, por el director D8.1, sin red team (D8-1). Guido lo repasa al volver; todo
  se deshace antes del tag
- Fecha: 2026-11-03 · Misión: 5, director **D8.1**, sin Guido, PC `Guido-PC-eQ` (tracker, "Abrir D8.1 sin Guido"; la vara: ADR-030; el
  presupuesto: ADR-029)
- Sello del Arquitecto: `arquitecto: 2026-11-03 · kit 2.4.3 · chequeos: tamaño — (paquete del método) · entorno — (sin ficha del kit) · tope ✅ · hash 55e763f81745`
- Plano: [`SPEC-0-kit-v3.md`](SPEC-0-kit-v3.md), orden 8 = **P8 y P9**; "Medición" del SPEC-0; TABLERO §1. Diseño: H §4 y §22 · B §15 y §18
  · E §3 y §13. De Pendientes y NO VERIFICADO del tracker: **ninguno se tacha leyendo** (todos piden una pestaña real, una PC o el piloto;
  ver "Lo que esto no cierra"). **El piloto cambió** (Guido, 2026-11-03, tracker "Cambios al plan"): no hay piloto de prueba en Deptos,
  la prueba es en un proyecto de verdad (recomendado Hermes Desktop, a cerrar con Guido). Donde este delta dice "el piloto (D9.1)", es esa
  prueba; la línea base mide los 10 igual, así que no cambia nada de acá.
- Red team: **no** (D8-1). Revisor frío Opus al cerrar, una vuelta.

## Por qué (el dolor)

El SPEC-0 manda medir "antes del piloto y al mes" con los scripts de P8, pero `flota.py` es de la misión 4: no sabe qué es una ficha ni
una versión del kit, y `huella.py` busca el molde donde estaba en v2. Sin eso, el piloto (D9.1) no tiene contra qué compararse. Y la
documentación quedó en v2: §1.5 del PLAYBOOK clasifica en chico/mediano/grande (los cuatro vocabularios que H §3 midió el 2026-10-24), la
guía no tiene "me voy", `/estado` ni `cambios aprobar`, `manuales/` tiene 3 páginas para 11 skills, ~20 scripts y 5 hooks, y la tabla "Lo
que este spec corrige de los diseños" del SPEC-0 tiene 21 filas que los diseños no dicen.

## Contexto (explorado el 2026-11-03, en `Guido-PC-eQ`)

- **`observatorio/investigacion/`**: `condensar.py` (con `--desde`); `costos.py` (lee `costos.csv`; **sin `--desde`**: el corte es de
  `condensar.py`); `lotes.py` (**arma lotes para lectores**, no mide); `flota.py` (por `gh api`: skills, docs, `settings.json` con hooks y
  `permissions`, CLAUDE.md, pruebas, `.md` grandes; **no lee `.claude/kit.md`**); `huella.py` (parecido de `/inicio` y `/cierre` contra
  `kit/skills/arquitecto/templates/universales/…`, **el camino v2**; el v3 es `kit/molde/skills/`); `repos.py` (historial local,
  `alias=ruta[@desde=…]`). **Ninguno tiene pruebas.** `py -3` (3.14) anda; `python3` es el atajo de la Store; `gh` y `gitleaks`, sí.
- **El parser de la ficha** ya tiene CLI: `node kit/skills/arquitecto/scripts/lib/ficha.cjs leer <archivo>` → JSON (`campo` para uno).
- **La flota**: ningún repo real tiene `.claude/kit.md` todavía (todos son v2; la adopción es del piloto). Los de prueba sí (`alfa`:
  `kit: 2.4.2`, de `rehacer.sh`).
- **Los 10 repos** (alias de `FLOTA.md`): todos están en GitHub y `gh` los ve desde esta PC. Con checkout en esta PC: **6** (Desktop, Mobile,
  Hub, Devoluciones, Panel del bot y uno de los bots; más la copia vieja de Portapapeles); **sin checkout acá: Deptos, Portal, Bot
  personal**. El checkout de Devoluciones está ~7 semanas atrás de su remoto. El mapeo alias → repo **no está escrito en ningún lado**
  (FLOTA.md usa alias a propósito; el `flota.json` del 2026-10-14 no quedó guardado).
- **El corpus**: `vibe-research` (clon de solo lectura en el scratchpad) tiene los chats **del trabajo sobre vibe-kit** condensados por PC
  (`chats/{clientes,usuario,companero,draco}/`, hasta el 2026-11-02) y la `biblioteca/` de las misiones 2 y 4 (lo de los proyectos, hasta
  el corte del 2026-10-26 14:47 UTC). Los chats **de los proyectos** posteriores al corte están **crudos** en `~/.claude/projects` de esta PC:
  ~26 de Desktop (~360 MB), ~18 de Mobile (~195 MB), Hub, bots. Los de las otras PCs, no están acá.
- **Docs**: PLAYBOOK §1.5 (líneas 127-137) tiene chico/mediano/grande; "regla de bolsillo" ya da 0 en el PLAYBOOK. `GUIA-DE-USO.md` (15 KB)
  ya tiene "poné al día la flota", "adoptá X" y "¿qué aprendieron mis proyectos?"; le faltan pedir, "me voy", `/estado`, `cambios aprobar`
  y "preparame esta PC" en v3. `manuales/`: `COMO-USAR-EL-ARQUITECTO.md` (v2, 14 KB), `HOJA-DE-MANO-relevamiento.md`,
  `se-filtro-una-credencial.md`.
- **El ADR de E §3**: la puerta única **ya es ADR-031** (D4.1). Lo que E §3 y §9 pedían además, "la única excepción a 'el Equipador jamás
  maneja tokens'" (la credencial del Hub), **se construyó al revés**: SPEC-paquete-6 y `preparar-pc.cjs` dicen que la credencial del Hub
  **nunca** pasa por el kit (la instala la capa privada). El último ADR es el 032.

## Dónde vive cada pieza

| Pieza | Dónde | Público o privado |
|---|---|---|
| `flota.py` v3, `huella.py` v3, `frases-viejas.txt`, sus pruebas | `observatorio/investigacion/` | público (código, sin datos) |
| La receta de la corrida mensual | `observatorio/investigacion/METODO.md`, sección nueva | público |
| La corrida del 2026-11-03, en cifras agregadas | `observatorio/investigacion/mediciones/2026-11-03.md` (nuevo) | público |
| El detalle por repo y por chat (JSON, el mapeo alias → repo, costos por chat) | `vibe-research`, `mediciones/2026-11-03/` | **privado** |
| §1.5 reescrito | `PLAYBOOK-MAESTRO.md` | público |
| Recetas nuevas | `GUIA-DE-USO.md` | público |
| Una página por pieza | `manuales/` | público |
| Notas con fecha | `docs/mision-4/DISENO-{A,B,D,E,F,G,H}-*.md` | público |
| ADR-033 | `docs/DECISIONS.md` | público |

## AGREGA

### P8.1 · `flota.py` lee la ficha (E §10, E §13, B §18)

`py -3 -I flota.py <dueño>… [--kit <raíz de vibe-kit>] [--hook <alias>=<clon>…] > flota.json`. Sigue leyendo **GitHub por `gh`** (rama por
defecto, sin clonar; anda desde cualquier PC y ve los repos que no están acá, D8-2). Suma por repo, a lo que ya lee:

1. **La ficha**: si el árbol trae `.claude/kit.md`, la baja y la parsea **el parser del kit** (`node <kit>/kit/skills/arquitecto/scripts/lib/
   ficha.cjs leer <temporal>`), nunca uno en Python. Columnas: `kit` (versión), `nivel`, `piezas` (id → estado), `frenos_quitados` (cuántos),
   `ficha_error` (si no parsea: el motivo, sin el texto). Sin ficha → `kit: null` y se sigue.
2. **Barreras de fábrica**: `deny` del `settings.json` (ya lo lee) y, con ficha, `piezas.hook-sensible`/`candado` presentes.
3. **Ramas `kit/*` vivas** (`gh api repos/<r>/branches`, solo nombres que empiezan con `kit/`) y su cantidad.
4. **Copias del kit**: skills de `DEL_KIT` dentro de `.claude/skills/` (ya lo hace `huella.py`; pasa acá, `huella.py` lo deja de calcular).
5. **"X aparece en N proyectos"**: al final, una tabla aparte con cada skill propia (no universal, no del kit) y en cuántos repos está;
   las de 3+ marcadas (la regla de 3+ por script, E §10). Las reglas de `.claude/cambios/` **no**: eso es `cambios-flota.cjs` (P6.8b-2).
6. **Handoff y docs de estado**: tamaño de `docs/SESSION_HANDOFF.md` (y del handoff de cada módulo si hay `docs/modulos/*/`), `docs/TODO.md`,
   y los `.md` de más de 100 KB (ya lo hace).
7. **Specs con sello**: cuántos `SPEC*.md` hay (`docs/` y `docs/modulos/**`) y cuántos tienen la línea `arquitecto: … hash` del sello
   (D8-5: el SPEC-0 lo asignaba a `lotes.py`, que no mide eso).
8. **Portada**: `README.md` en la raíz (sin mirar mayúsculas) y si enlaza a `docs/NORTE.md` (regex simple; el chequeo fino es
   `candado:portada`).
9. **La huella del hook** (`--hook <alias>=<clon>`): **solo sobre un clon temporal** (D8-3), nunca sobre el checkout de Guido: corre el
   comando `SessionStart` del `settings.json` del clon con stdin `{}` y plazo 20 s, y cuenta los caracteres de la salida. Columna
   `hook_chars`; sin clon o si falla → `null` y el motivo. "Pasado del tope" = más de 10.000.
10. **P8.3, las dos columnas del observatorio** (D8-1: medición, no candado): `frases_viejas` = por cada frase de `frases-viejas.txt`
   (nuevo, una por renglón con su fuente, por ejemplo `regla de bolsillo	# H §22`), cuántos archivos de `.claude/skills/**` y `CLAUDE.md`
   la traen; `rutas_absolutas` = cuántos archivos de `.claude/skills/**` traen una ruta absoluta de PC (`[A-Za-z]:[\\/]`, `/c/Users/`,
   `/Users/`, `/home/`), y **en qué archivo y renglón, nunca el texto** (la ruta lleva el usuario de la PC). `--carpeta <dir>` corre
   solo estas dos columnas sobre una carpeta local (para el molde).

La lista de `frases-viejas.txt` sale de H §3 (los cuatro vocabularios), H §22 (la regla de bolsillo), y lo que el kit v3 retiró por nombre
(el nivel `largo` escrito, `nivel:` de los entornos). Cada frase con su fuente; sin fuente no entra.

**`huella.py`** aprende el molde v3: busca las versiones de `/inicio` y `/cierre` en `kit/molde/skills/<x>/SKILL.md` **y** en el camino v2,
y reporta el parecido contra la más parecida de las dos historias (con cuál fue). Se le quita el cálculo de copias del kit (punto 4).

**Pruebas** (`test_flota.py`, `test_huella.py`, `unittest` de la librería estándar, sin red): `gh` y `node` se reemplazan por funciones
inyectadas. Casos sí/no: ficha válida → columnas; ficha rota → `ficha_error` sin el texto; sin ficha → `kit: null`; rama `kit/v3.0.0` viva
→ cuenta 1, `main` no; skill propia en 3 repos → marcada, en 2 → no; una frase vieja en un `SKILL.md` → 1, en un `.md` de `docs/` → 0;
`D:\x` y `/c/Users/x` en una skill → 2 con archivo y renglón y sin texto, una URL `https://` → 0; spec con sello → cuenta, sin → no; README
con enlace a `./docs/NORTE.md` → sí, sin enlace → no; `--hook` con un hook que imprime 12.000 caracteres → `hook_chars` 12000, con uno que
cuelga → `null` a los 20 s (el plazo se pasa corto en la prueba); `huella.py` con un molde falso en las dos rutas → elige el más parecido.
Sin mutación (no deciden ningún freno).

### P8.2 · La corrida mensual, documentada (TABLERO §1; SPEC-0 "Medición")

**La receta** va a `METODO.md`, sección "La corrida mensual" (anti-espejo: la guía solo apunta acá): cada paso con su comando, dónde
escribe y qué va al público y qué al privado. **La primera corrida** la hace E2 en esta PC, el 2026-11-03:

1. **Clones** de los 10 repos de `FLOTA.md` con `git clone --filter=blob:none` desde GitHub a `scratchpad/medicion/` (D8-7): sirven a
   `repos.py` (historial), a `--hook` y a `huella.py`; el checkout de Guido no se toca ni se lee. El mapeo alias → repo lo arma E2 con `gh
   repo list` y las descripciones de FLOTA.md, lo escribe **solo en el privado**, y lo que quede ambiguo lo marca para Guido (no adivina).
2. `flota.py` sobre los dos dueños, con `--hook` para los 10 clones · `huella.py` · `repos.py` con `@desde=2026-10-14` (lo posterior a
   REPOS.md) y una pasada sin `@desde` para comparar con REPOS.md.
3. **Costos**: `condensar.py --pc <esta PC> --desde 2026-10-26T14:47 --salida <fuera de todo repo>` (el corte de `CORTE.md`) en segundo
   plano, y `costos.py` sobre su `costos.csv`. Los condensados quedan en esa carpeta, fuera de los repos, y **no se suben**. Solo de esta
   PC (lo de las otras, al piloto).
4. **Lo que no es script**: el conteo de alertas abiertas (`ALERTAS-SEGURIDAD.md` de la biblioteca, solo el número) y `wc -c` de las
   skills de director y obrero de cada repo que las tenga (lo da `flota.py` por tamaño del árbol).
5. **gitleaks** (`gitleaks dir`, sin tubería) sobre todo lo que se va a escribir, público y privado; si da distinto de 0, no se escribe al
   repo hasta revisarlo sin imprimir el valor (METODO.md, paso 2).
6. **`mediciones/2026-11-03.md`** (público): la tabla de TABLERO §1 con tres columnas, **octubre · 2026-11-03 · cómo se midió**, en cifras
   agregadas ("N de 10", rangos, medianas) y los alias que ya son públicos; más las filas del SPEC-0 "Medición" que tienen script. Cada
   fila que no se re-midió dice **"no re-medido: lector, al piloto (D9.1)"** o **"no re-medido: otra PC"** (D8-4). Abajo: el detalle está en
   `vibe-research/mediciones/2026-11-03/` (sin ruta de PC).
7. **El privado**: E2 lo deja en `scratchpad/medicion/privado/`; el director lo sube a `vibe-research` con gitleaks (si no puede, a
   Pendientes con su ruta; el número público no depende de eso).

**Lo que no corre** (D8-4): `lotes.py` y los lectores. Las filas "Lector (muestra)" del TABLERO (turnos sin novedad, CORREGIR del revisor,
comandos por apertura, duración del `/cierre`, "¿cómo vamos?", pegados) y las del SPEC-0 que piden lector (encargos con dato falso,
dictados de ejecución, los 314 KB antes de un mensaje de mesa, credenciales por el chat) **quedan con el número de octubre**, marcadas.

### P9.1 · PLAYBOOK §1.5, con los dos ejes (H §4)

§1.5 pasa a "Tamaño del pedido y nivel del proyecto": la tabla de los dos ejes de H §4 (chico · módulo · módulo con director; `liviano`
· `estandar`, "largo" calculado), **la prueba de dos preguntas** de H §5 en dos renglones, y un renglón con lo que §1.5 exigía "a lo grande
o en producción": `RECOVERY.md` probado, rutas protegidas, crons y el pin del framework **no se pierden**, se reparten entre la ficha
(`entornos:` con `clase: real`, `autorizado:`, `sensible:`) y los frenos, con puntero a F §9 y B §4 (`referencia/`). El ejemplo de Perseo
(el pin) se conserva como cicatriz. **Cicatriz que cita** (restricción 5): H §3, los cuatro vocabularios medidos el 2026-10-24, y R-19/R-40
de la revisión de H. El resto del playbook **no se toca** salvo los renglones que el grep de frases viejas encuentre.

### P9.2 · La guía y los manuales (anti-espejo)

**`manuales/`, una página por pieza** (D8-10), no una por script:

| Página | Qué cubre | Sale de |
|---|---|---|
| `COMO-USAR-EL-ARQUITECTO.md` (**reescrita a v3**, mismo nombre: la apuntan la guía y el README) | Las cinco entradas, el tamaño, Modo A/B/B corto, consultorio, la flota, el sello, `arquitecto.cjs` | SPEC-paquete-4, ADR-031 |
| `EQUIPADOR.md` (nueva) | "Preparame esta PC", "actualizate", `doctor`, hooks por PC, la flota, adoptar, `cambios-flota`, `migrar-cambios` | SPEC-paquete-3, 6, 7 |
| `MOLDE.md` (nueva) | La ficha, `docs/` en capas, handoff y TODO con tope, los hooks y githooks, el candado y sus ids, la zona propia, el registro de cambios, la portada, los subagentes | SPEC-paquete-1, 2, 3, 7 |
| `ROLES.md` (nueva) | Núcleo, director, obrero, tramo, `/estado`, la noche ("me voy"), la mesa | SPEC-paquete-5 |
| `SCRIPTS.md` (nueva) | **Referencia**: una sección por script del kit (molde, Equipador, Arquitecto) y por hook: qué hace, cómo se llama, qué sale; sacado de la cabecera y del `--help` de cada uno | el código |
| `se-filtro-una-credencial.md` (al día) | Cruzado con `cargar-secreto`, el almacén y `doctor` del kit v3; nada nuevo si ya coincide | F §17, SPEC-paquete-3 |

La versión v2 del manual del Arquitecto va a `legacy/` con lápida (se archiva, no se borra). `docs-fyd` y `relevamiento` no cambian en v3:
su página sigue siendo su `SKILL.md` y la hoja de mano.

**`GUIA-DE-USO.md`**: una receta por situación nueva, **cada una de 1 a 3 renglones con su puntero** (anti-espejo: ningún procedimiento,
ningún bloque de comandos de más de un renglón): "Quiero pedir algo" (chico o no lo dice la sesión; si es más, el Arquitecto) · "Me voy"
(la noche del director) · "¿Cómo vamos?" (`/estado`) · "La sesión me pide aprobar un cambio de freno" (`cambios aprobar`, la ventana) ·
"Poné al día la flota" y "adoptá X" (ya están: se revisan contra lo construido) · "Preparame esta PC" (reemplaza la receta v2 de "PC
nueva"). La chuleta suma `me voy`, `/estado`, `cambios aprobar`, `preparame esta PC`. "Dónde profundizar" apunta a las páginas nuevas.

### P9.3 · Las notas en los diseños y el ADR-033

1. **Una nota por fila** de "Lo que este spec corrige de los diseños" (SPEC-0, 21 filas) en la sección que la fila cita, con el formato
   `*Corregido por el SPEC-0 del kit v3 (nota del 2026-11-03, D8.1): <qué dice ahora>, en una línea (<ids>).*`. **Antes de escribir, grep del
   id** (`RT1-5`, `RF-11`…) en el diseño: si la sección ya trae la corrección (varias se anotaron al construir, por ejemplo E §6 "Cómo quedó
   al construirse"), no se duplica. C no tiene fila: no se toca (D8-11).
2. **ADR-033** (D8-9): "La credencial del Hub no pasa por el kit: el Equipador no maneja tokens, sin excepciones". Contexto: E §3 y §9
   pedían un ADR con la puerta única **y** con la excepción del Equipador; la puerta ya es ADR-031; la excepción **no se construyó**:
   D6.1 (SPEC-paquete-6, "preparame esta PC" paso 5) mandó la credencial a la capa privada, y `doctor` solo mira el nombre de la variable.
   Descartado: la excepción como la escribió E §3 (el kit público manejaría la llave del registro de la empresa). Nota a E §3 y §9 que
   apunta al ADR.

## MODIFICA

Lo de la tabla de arriba, más `legacy/` (el manual v2 con lápida) y la fila de `flota.py` en "Las piezas" de `METODO.md`. Al cerrar, el
director: `docs/README.md` (la fila de este delta), el SPEC-0 (los `✅` de P8 y P9 y la nota "corregido" en 8.2, D8-4) y el tracker.

## NO SE TOCA

- **`kit/`** entero (este paquete no cambia el kit: nada de `kit-sync` más allá del LIMPIO del `/cierre`), `~/.claude/`, y los checkouts
  de Guido (`D:\Hermes\…`, `D:\Hub - Implementaciones`, etc.): se mide sobre clones temporales.
- `condensar.py`, `costos.py`, `lotes.py`, `recortar.py`, `repos.py` (se usan como están).
- `docs/mision-4/TABLERO.md`, `REPOS.md`, `FLOTA.md` (son la foto de octubre: la nueva va en `mediciones/`), los `tips/` (actas).
- El resto del PLAYBOOK, `README.md` (portada), `docs/MISION-Y-VISION.md`.
- `vibe-research`: E2 no lo escribe; lo copia el director.

## Entorno de prueba

`py -3` (no `python3`), `node` y `gh` logueado. Las pruebas de los `.py` sin red ni `gh` real. La corrida: GitHub de verdad (solo
lectura) y clones en el scratchpad. Una ficha de verdad: los remotos de prueba (`bash pruebas/rehacer.sh`, mirados por Bash).

## Criterios de aceptación

1. **`flota.py` lee la ficha**: con el `kit.md` de `alfa` servido por el `gh` falso, la fila trae `kit`, `nivel` y `piezas` (parseado por
   `ficha.cjs`); sobre la flota real, una fila por repo con `kit: null`, sin romperse. *Verifica: pruebas + una corrida del director.*
2. **Las columnas nuevas**: ramas `kit/*`, copias del kit, "aparece en N" con 3+ marcado, specs con sello, portada, `hook_chars` con
   `--hook`. *Verifica: los casos sí/no de `test_flota.py`, corridos por el director.*
3. **P8.3**: `frases_viejas` y `rutas_absolutas` dan **0 sobre el molde v3** (`kit/molde/skills/**` y `kit/molde/CLAUDE.md`: lo que
   recibe un repo adoptado; `flota.py --carpeta <dir>` corre solo esas dos columnas sobre una carpeta local) y dan su número (sin texto)
   en la flota real, como línea base; el "0 en los repos adoptados" lo confirma la corrida del piloto. *Verifica: corrida del director.*
4. **`huella.py`** encuentra el molde v3 y no rompe con el v2. *Verifica: prueba.*
5. **La corrida está documentada**: `mediciones/2026-11-03.md` con todas las filas de TABLERO §1 (re-medida o "no re-medido: por qué"),
   cifras agregadas, **sin nombres de repo que no estén ya en docs públicos, sin rutas de PC ni texto de chats**; gitleaks en 0 sobre lo
   público y lo privado; la receta en `METODO.md` alcanza para repetirla en otra PC. *Verifica: el director lee el archivo y corre
   gitleaks.*
6. **PLAYBOOK §1.5**: `grep -n -i "regla de bolsillo\|mediano\|grande / en producción"` da 0 en el PLAYBOOK; §1.5 cita su cicatriz.
   *Verifica: grep.*
7. **Cada pieza tiene su página**: para cada carpeta de `kit/skills/*/`, `kit/molde/skills/*/` y cada `*.cjs` que no es prueba ni `lib/` de
   `kit/molde/scripts/`, `kit/molde/hooks/` y `kit/skills/*/scripts/`, su nombre aparece en algún `manuales/*.md` (docs-fyd y relevamiento,
   por su puntero). *Verifica: un loop de grep del director, que lista las que faltan; tiene que salir vacío.*
8. **Anti-espejo**: la guía no tiene bloques de código de más de un renglón ni pasos numerados de un procedimiento que esté en un manual;
   cada receta nueva apunta a su página. *Verifica: lo mira el revisor frío como lector que sigue la guía.*
9. **P9.3**: cada una de las 21 filas tiene su nota (o ya la tenía) en el diseño que cita; ADR-033 existe, correlativo. *Verifica: el
   director cruza las 21 filas con grep del id en cada diseño.*
10. **Nada se rompe**: `kit-sync.sh` LIMPIO; las pruebas de los `.py` verdes; la suite del kit **no** se corre (no se tocó código del kit).

## Los encargos (el director reparte, lee cada diff y corre las pruebas de cada uno)

Presupuesto (ADR-029): ~4 h y **~8 encargos contando al redactor, al revisor frío y a su arreglo** → quedan **5 de trabajo**.

| # | Encargo | Modelo | Puede tocar | Prueba que tiene que pasar | Depende |
|---|---|---|---|---|---|
| E1 | P8.1 y P8.3: `flota.py` v3, `huella.py` v3, `frases-viejas.txt` y las dos pruebas | Sonnet | `observatorio/investigacion/{flota,huella}.py`, `frases-viejas.txt`, `test_*.py` | crit. 1-4 (pruebas + `alfa`) | delta |
| E3 | P9.1 y P9.3: §1.5, las notas en los diseños, ADR-033 | Opus | `PLAYBOOK-MAESTRO.md` (§1.5), `docs/mision-4/DISENO-*.md` (solo notas), `docs/DECISIONS.md` | crit. 6 y 9 | delta |
| E2 | P8.2: la corrida (clones, scripts, `condensar --desde` en segundo plano, gitleaks) y su documento | Sonnet | `observatorio/investigacion/METODO.md`, `mediciones/2026-11-03.md`; lo privado solo en `scratchpad/medicion/privado/` | crit. 5 | E1 |
| E4a | P9.2, la parte de método: la guía, el manual del Arquitecto v3 (y el v2 a `legacy/`), `EQUIPADOR.md`, `ROLES.md` | Opus | `GUIA-DE-USO.md`, `manuales/{COMO-USAR-EL-ARQUITECTO,EQUIPADOR,ROLES}.md`, `legacy/` | crit. 7 (su parte) y 8 | delta |
| E4b | P9.2, la parte de referencia: `MOLDE.md`, `SCRIPTS.md`, el runbook al día | Sonnet | `manuales/{MOLDE,SCRIPTS,se-filtro-una-credencial}.md` | crit. 7 (su parte) | delta |
| RF | Revisor frío, una vuelta, hasta 10, cada uno con su escenario (un lector que sigue la guía y se equivoca; una corrida que publica algo que no debía) | Opus | — (informe) | — | todo |
| RF-fix | Los arreglos, un encargo | Sonnet | lo que diga RF | lo que toque | RF |

**Orden**: E1 ∥ E3 (no comparten archivos) → E2 ∥ E4a → E4b → RF → RF-fix. Nunca más de dos a la vez, cada uno en su worktree en
`scratchpad/<x>/wt`. Ninguno toca `kit/`, `~/.claude/` ni un checkout de Guido. E2 corre `condensar.py` en segundo plano (puede tardar
decenas de minutos con ~560 MB crudos): si no termina en la hora del encargo, la fila de costos queda "no re-medido: corrida en curso" y va
a Pendientes; no se estira.

## Lo prueba una sesión real

Nada pide una pestaña: todo es script o texto. Queda para el piloto (D9.1): **la corrida al mes** con la receta de `METODO.md` (es la
prueba de que la receta alcanza), las filas de lector, los costos de las otras PCs, y que alguien que sigue la guía nueva haga "me voy" y
`cambios aprobar` sin abrir un manual.

## Riesgos y decisiones ⚠️

- **D8-1 · Sin red team.** Nada de P8 ni P9 toca un freno ni un permiso: P8.3 es una columna del observatorio que **mide**, no un id del
  candado que frena (CLAUDE.md, restricción 4: el observatorio mide y propone; si alguna vez sube al candado, eso es otro delta, con red
  team). `[workflow · mejor código]`
- ⚠️ **D8-2 · `flota.py` sigue por `gh` y la ficha la lee el parser del kit**, llamado por `node`. Alternativas descartadas: leer las
  fichas del disco (`arquitecto.cjs registro`: no ve Deptos, Portal ni Bot personal desde esta PC) · un parser en Python (dos verdades de la
  gramática; la de node tiene sus pruebas). `[consistencia · mejor código]`
- **D8-3 · La huella del hook, solo en un clon temporal.** Correr el hook en el checkout de Guido puede escribir algo (los v2 no se
  diseñaron para eso); en el clon no hay `.env` ni sesión. Es código de los repos de Guido, el mismo que corre en cada arranque. `[mejor código]`
- ⚠️ **D8-4 · Los lectores no corren en D8.1**: `lotes.py` y las filas "Lector (muestra)" quedan con el número de octubre, marcadas, para
  el piloto. Un lector cuesta ~250 mil tokens y harían falta varios, más el `ya-sabido` al día: no entra en 5 encargos, y la flota sigue
  en v2 (el "antes" de octubre es el antes). Corrige la celda 8.2 del SPEC-0; la nota la pone el director. `[workflow · acordarse de menos]`
- **D8-5 · Cada medida, con el script que de verdad la mide**: specs con sello → `flota.py` (no `lotes.py`); `costos.py` no gana
  `--desde` (el corte es de `condensar.py`, y ya anda); las del SPEC-0 que nombran un script que no las mide van a lector y piloto, dicho
  en `mediciones/`. `[consistencia]`
- ⚠️ **D8-6 · Lo público, en cifras agregadas; lo de cada repo y cada chat, al privado**: en `mediciones/`, "N de 10", rangos y los alias
  que FLOTA.md ya publicó; el JSON por repo, el mapeo alias → repo y los costos por chat, a `vibe-research`. `rutas_absolutas` guarda
  archivo y renglón, nunca el texto. gitleaks antes de escribir y de cada push. `[mejor código · consistencia]`
- **D8-7 · Todo sobre clones `blob:none` de GitHub**, también para los repos que están en esta PC: el checkout de Devoluciones está viejo,
  tres no están, y así la corrida es igual en cualquier PC. `[consistencia · acordarse de menos]`
- **D8-8 · `huella.py` mira las dos historias del molde** (v2 y v3): la flota es v2 hoy y v3 después del piloto; con una sola, una de las
  dos mediciones daría 0 falso. `[consistencia]`
- ⚠️ **D8-9 · ADR-033: no hay excepción del Equipador con la credencial del Hub.** El SPEC-0 (P9.3) pedía "el ADR nuevo que E §3 pidió (la
  puerta única, la excepción…)". La puerta ya es ADR-031; la excepción se construyó al revés en D6.1 (la credencial nunca pasa por el
  kit). El ADR escribe lo construido, no lo diseñado; si Guido quiere la excepción, se reabre. Reversible (texto). `[consistencia ·
  acordarse de menos]`
- **D8-10 · Una página por pieza, no por script**; `SCRIPTS.md` es la referencia con una sección por script, sacada de su cabecera (no se
  inventa lo que el script no dice). El manual del Arquitecto se reescribe con el mismo nombre (lo enlazan la guía y el README) y el v2
  va a `legacy/`. `[acordarse de menos · consistencia]`
- **D8-11 · Las notas en los diseños, sin duplicar**: grep del id antes de escribir; C no tiene fila y no se toca. `[consistencia]`
- **D8-12 · Ningún Pendiente ni NO VERIFICADO del tracker se tacha leyendo**: todos piden una pestaña real, otra PC o el piloto. Los
  manuales nuevos no los tachan; a lo sumo los nombran. `[acordarse de menos]`

### Lo que esto no cierra

- **La línea base de lector y de las otras PCs**: el "antes" de esas filas es el de octubre; si la flota cambia antes del piloto, se
  compara contra algo viejo. Se acepta: el piloto mide al mes con la receta.
- **El mapeo alias → repo** lo arma E2 por descripción; un alias mal asignado mueve una fila. Lo ambiguo va marcado para Guido.
- **Las frases viejas son una lista**: una contradicción que no está en la lista no se cuenta (el "≥ 8 contradicciones" de octubre fue
  lectura). Es un piso, no un conteo completo.
- **Un hook que hace algo raro en el clon** (red, un proceso que queda): plazo de 20 s y temporal; sin más arreglo.

## Ejecución

Paquete del método de vibe-kit, un director Opus (D8.1), sin red team (D8-1), con este delta; el cómo, en
[`PLAN-construccion.md`](PLAN-construccion.md) y en "Los encargos" de arriba.
