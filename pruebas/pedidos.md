# Pedidos de prueba

Pedidos de prueba del tamaño (criterio 2 del SPEC-0 y P5.1): diez pedidos en criollo, para `alfa` (estandar, con código de node) y `beta` (liviano, sin código), con el tamaño que la sesión tiene que decir.

`/inicio` se prueba en dos tamaños, chico y más que chico (cada sesión plana lo dice en una línea y sin preguntar); solo / con director lo decide el Arquitecto al listar las tareas y se prueba con él (orden 4).

La regla (B §6, H §5): es módulo si hace falta algo más que el pedido y el `git diff` para retomarlo, o si lleva más de una sesión; si ninguna de las dos, chico. Que toque datos reales, plata o producción no lo hace módulo. Con director solo si hay dos o más tareas que se escriben a la vez, o noche sin el dueño; varias sesiones seguidas no lo hacen director.

Cada pedido se pega tal cual en una sesión nueva del repo de prueba. Línea que la sesión tiene que decir como **primer bloque de texto**, antes de hacer nada (ver "Cómo se mide la línea", abajo): **chico** → "chico, lo hago acá" · **módulo solo** y **con director** → "más que chico: llamo al Arquitecto".

## `alfa`

Lo que tiene `alfa`: `suma.js` (`module.exports = (a, b) => a + b;`), `suma.test.js`, el `CLAUDE.md` y `docs/` del molde.

### 1 · chico
> "Che, en suma.js, si le paso un texto en vez de un número, la cuenta queda pegada: '2' y '3' dan '23'. Que tire un error claro cuando alguno de los dos no es un número, y agregale su prueba en suma.test.js."

- Tamaño esperado: **chico** (un ajuste puntual de algo que ya existe).
- ¿Hace falta algo más que el pedido y el `git diff` para retomarlo? **No**: una función, un arreglo, con su prueba.
- ¿Lleva más de una sesión? **No**.
- Primer bloque de texto: "chico, lo hago acá".

### 2 · chico
> "Urgente, se ve en producción: suma(0.1, 0.2) da 0.30000000000000004 y en el reporte sale horrible. Que el resultado se redondee a 2 decimales, ya."

- Tamaño esperado: **chico** (un hotfix; que toque producción no lo hace módulo: lo cuidan las 5 preguntas y la red de los frenos, no un spec).
- ¿Hace falta algo más que el pedido y el `git diff` para retomarlo? **No**: una línea en suma.js y su prueba.
- ¿Lleva más de una sesión? **No**.
- Primer bloque de texto: "chico, lo hago acá".

### 3 · módulo solo
> "Quiero que alfa lleve un historial de las cuentas que hace: que cada suma quede anotada, que se pueda listar por día y borrar una que hice mal, y que quede guardado entre una corrida y otra. Todavía no sé dónde ni en qué formato conviene guardarlo."

- Tamaño esperado: **módulo solo**.
- ¿Hace falta algo más que el pedido y el `git diff` para retomarlo? **Sí**: hay que decidir dónde se guarda, el formato y qué pasa al borrar; el diff solo no lo cuenta.
- ¿Lleva más de una sesión? **Sí**: guardar, listar y borrar no entran en una.
- Primer bloque de texto: "más que chico: llamo al Arquitecto"; el transcript invoca `arquitecto`.

### 4 · módulo solo
> "Quiero que alfa deje de ser solo un archivo: una pantalla web donde escribo dos números, veo el resultado y las últimas diez cuentas. Hay que decidir con qué se arma y cómo lo publico."

- Tamaño esperado: **módulo solo**.
- ¿Hace falta algo más que el pedido y el `git diff` para retomarlo? **Sí**: la tecnología, la pantalla y cómo se publica son decisiones de diseño que no se ven en el diff.
- ¿Lleva más de una sesión? **Sí**.
- Primer bloque de texto: "más que chico: llamo al Arquitecto"; el transcript invoca `arquitecto`.

### 5 · con director
> "Hay que hacer dos cosas nuevas de alfa a la vez porque no queremos esperar: el historial de cuentas (guardado en un archivo, que se pueda listar por día) y una calculadora de línea de comandos con las cuatro operaciones. Son independientes, que se hagan en paralelo."

- Tamaño esperado: **módulo con director** (dos tareas que se escriben a la vez, sobre archivos distintos).
- ¿Hace falta algo más que el pedido y el `git diff` para retomarlo? **Sí**.
- ¿Lleva más de una sesión? **Sí**.
- Primer bloque de texto: "más que chico: llamo al Arquitecto"; el transcript invoca `arquitecto` (el director lo decide él al listar las tareas).

## `beta`

Lo que tiene `beta`: solo el `CLAUDE.md` y `docs/` del molde (`NORTE.md`, `MAPA.md`, `SESSION_HANDOFF.md`, `TODO.md`, `CHANGELOG.md`, `README.md`, `referencia/PRUEBA.md`, `referencia/trampas.md`).

### 6 · chico
> "Poné al principio de docs/NORTE.md de beta una frase que diga que beta es el control de gastos de la oficina."

- Tamaño esperado: **chico**.
- ¿Hace falta algo más que el pedido y el `git diff` para retomarlo? **No**: es un texto agregado.
- ¿Lleva más de una sesión? **No**.
- Primer bloque de texto: "chico, lo hago acá".

### 7 · chico
> "Sumá al TODO de beta, en lo importante, que tengo que llamar al proveedor el lunes."

- Tamaño esperado: **chico**.
- ¿Hace falta algo más que el pedido y el `git diff` para retomarlo? **No**.
- ¿Lleva más de una sesión? **No**.
- Primer bloque de texto: "chico, lo hago acá".

### 8 · módulo solo
> "Armame una guía de cómo se hace el cierre de mes en beta, paso por paso, con quién hace cada cosa y qué se controla. Hoy está todo en mi cabeza, así que vas a tener que ir preguntándome."

- Tamaño esperado: **módulo solo**.
- ¿Hace falta algo más que el pedido y el `git diff` para retomarlo? **Sí**: la guía sale de lo que el dueño cuenta; sin esa charla el diff no explica el porqué de cada paso.
- ¿Lleva más de una sesión? **Sí**.
- Primer bloque de texto: "más que chico: llamo al Arquitecto"; el transcript invoca `arquitecto`.

### 9 · módulo solo
> "Quiero que beta tenga un registro de clientes: una ficha por cliente con sus contactos y lo que nos debe, y que se mantenga al día solo. Hay que ver qué va en cada ficha y dónde se guarda."

- Tamaño esperado: **módulo solo**.
- ¿Hace falta algo más que el pedido y el `git diff` para retomarlo? **Sí**: qué lleva cada ficha y cómo se mantiene se decide charlando.
- ¿Lleva más de una sesión? **Sí**.
- Primer bloque de texto: "más que chico: llamo al Arquitecto"; el transcript invoca `arquitecto`.

### 10 · con director
> "Esta noche no voy a estar. Dejá armadas, mientras duermo, las tres guías de beta: la de clientes, la de proveedores y la de cobranzas. Que cada una avance por su lado y a la mañana me muestres todo junto."

- Tamaño esperado: **módulo con director** (noche sin el dueño, y tres tareas que se escriben a la vez).
- ¿Hace falta algo más que el pedido y el `git diff` para retomarlo? **Sí**.
- ¿Lleva más de una sesión? **Sí**.
- Primer bloque de texto: "más que chico: llamo al Arquitecto"; el transcript invoca `arquitecto` (el director lo decide él al listar las tareas).

## Cómo se mide la línea

La línea del tamaño es el **primer bloque de texto del asistente** en el transcript (`claude.exe -p --output-format stream-json`), después de las herramientas que haya corrido antes (las lecturas de los primeros pasos de `/inicio`), no antes. En los seis "más que chico" (3, 4, 5, 8, 9, 10) el transcript además **invoca `arquitecto`**; en los cuatro "chico" no invoca nada del Arquitecto. Una corrida cuenta como pasada solo con las dos cosas.

## Las demás entradas y los modos del Arquitecto (P1.1, P1.2, P1.3, P1.6)

Estas corridas prueban al Arquitecto v3, no solo el tamaño. Mismo formato; el "primer bloque de texto" es la línea con que abre la sesión o el Arquitecto (D4-10). Donde la prueba tiene que escribir (14 a 17) no sirve `--permission-mode plan`: la corrida se hace con permisos de edición sobre un clon recién armado por `rehacer.sh`, y el OK de Guido se da con un segundo mensaje.

### 11 · entrada suelta · la PC (`beta`)
> "Preparame esta máquina."

- Primer bloque de texto: "la PC: te paso al Equipador"; el transcript invoca `arquitecto-skills` (por `flota.md`), sin instalar nada por su cuenta.
- No crea archivos ni toca `~/.claude/`.

### 12 · entrada suelta · consultorio (`beta`)
> "¿Cómo le pido a Claude que me ordene los archivos de la carpeta de facturas sin que me borre ninguno?"

- Primer bloque de texto: "consultorio".
- Contesta con un pedido armado (Modo C); no abre spec ni carpeta de módulo ni usa herramientas que escriban.

### 13 · entrada suelta · la flota (`alfa`)
> "Adoptá beta."

- Primer bloque de texto: empieza con "la flota:".
- Responde la línea de `flota.md` (*"llega con el kit v3 (orden 6); hoy: `actualizate` del Equipador para la PC, el §2.9 del playbook para adoptar"*) y no toca `beta` ni `~/.claude/`.

### 14 · Modo B corto (`alfa`)
> "Hay que hacer dos cosas nuevas de alfa a la vez porque no queremos esperar: el historial de cuentas y una calculadora de línea de comandos con las cuatro operaciones. Son independientes, que se hagan en paralelo. El plan ya lo charlamos, es este: (1) `historial.js` guarda cada suma en `historial.json` con fecha, los dos números y el resultado; (2) `listar(dia)` devuelve las de un día; (3) `cli.js` con suma, resta, producto y cociente, y la división por cero tira un error claro; (4) cada una con su prueba en `node --test`; (5) `suma.js` no se toca y cada tarea va en archivos propios."

- Primer bloque de texto: "más que chico: llamo al Arquitecto"; el transcript invoca `arquitecto` (Modo B corto).
- **Sin preguntas**: el plan viene dado. Spec sellado (`arquitecto.cjs ready` sale 0) en **≤ 15 minutos de reloj** del transcript.
- Un commit en la rama por defecto con `docs/modulos/<x>/README.md` (`director: sí`, `rama: modulo/<x>`) y un `SPEC.md` con "Ejecución" y su línea para abrir.
- La rama `modulo/<x>` y `.claude/worktrees/modulo--<x>` creadas por `worktree.cjs crear`, con `.kit-rol` = `director` adentro.

### 15 · Modo B largo (`alfa`)
> El pedido 3, y al primer pedido de datos del Arquitecto: "dale con los defaults".

- Primer bloque de texto: "más que chico: llamo al Arquitecto".
- El spec trae la sección "Qué robar y qué no" (investigador Sonnet, ~15 búsquedas) y el transcript muestra la lectura de `docs/NORTE.md` **antes** de lanzar al explorador.

### 16 · pantalla (`alfa`)
> El pedido 4, y al primer pedido de datos del Arquitecto: "dale con los defaults".

- Primer bloque de texto: "más que chico: llamo al Arquitecto".
- Existe `docs/modulos/<x>/prototipo/` (HTML hecho por un Sonnet, con una pregunta escrita) y en el transcript se crea **antes** que el `SPEC.md`.

### 17 · Modo A desde una carpeta vacía
Repo: una carpeta nueva y vacía dentro de `../vibe-kit-pruebas/` (la crea quien corre; `rehacer.sh` no la toca).
> "Quiero armar un proyecto nuevo: una app para llevar el stock de un kiosco. Dale con los defaults."

- Primer bloque de texto: "más que chico: proyecto nuevo (Modo A)"; el transcript invoca `arquitecto`.
- **Monta ahí**, en la carpeta vacía donde corre, sin crear otra al lado.
- La línea del registro (`arquitecto.cjs registro ../vibe-kit-pruebas` y la pregunta "¿proyecto nuevo, módulo de otro o feature de otro?") sale **antes** de la primera pregunta.

Las entradas "proyecto nuevo" y "feature" las cubren 17 y 14 a 16.

## Cuenta

4 `chico` (1, 2, 6, 7) · 4 `módulo solo` (3, 4, 8, 9) · 2 `con director` (5, 10) · 3 entradas sueltas (11, 12, 13) · Modo B corto (14), Modo B largo (15), pantalla (16) y Modo A (17).
