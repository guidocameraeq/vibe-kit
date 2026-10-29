# Pedidos de prueba

Pedidos de prueba del tamaño (criterio 2 del SPEC-0 y P5.1): diez pedidos en criollo, para `alfa` (estandar, con código de node) y `beta` (liviano, sin código), con el tamaño que la sesión tiene que decir.

`/inicio` se prueba en dos tamaños, chico y más que chico (cada sesión plana lo dice en una línea y sin preguntar); solo / con director lo decide el Arquitecto al listar las tareas y se prueba con él (orden 4).

La regla (B §6, H §5): es módulo si hace falta algo más que el pedido y el `git diff` para retomarlo, o si lleva más de una sesión; si ninguna de las dos, chico. Que toque datos reales, plata o producción no lo hace módulo. Con director solo si hay dos o más tareas que se escriben a la vez, o noche sin el dueño; varias sesiones seguidas no lo hacen director.

Cada pedido se pega tal cual en una sesión nueva del repo de prueba. Línea que la sesión tiene que decir antes de hacer nada: **chico** → "chico, lo hago acá" · **módulo solo** y **con director** → "más que chico: llamo al Arquitecto".

## `alfa`

Lo que tiene `alfa`: `suma.js` (`module.exports = (a, b) => a + b;`), `suma.test.js`, el `CLAUDE.md` y `docs/` del molde.

### 1 · chico
> "Che, en suma.js, si le paso un texto en vez de un número, la cuenta queda pegada: '2' y '3' dan '23'. Que tire un error claro cuando alguno de los dos no es un número, y agregale su prueba en suma.test.js."

- Tamaño esperado: **chico** (un ajuste puntual de algo que ya existe).
- ¿Hace falta algo más que el pedido y el `git diff` para retomarlo? **No**: una función, un arreglo, con su prueba.
- ¿Lleva más de una sesión? **No**.
- La sesión dice: "chico, lo hago acá".

### 2 · chico
> "Urgente, se ve en producción: suma(0.1, 0.2) da 0.30000000000000004 y en el reporte sale horrible. Que el resultado se redondee a 2 decimales, ya."

- Tamaño esperado: **chico** (un hotfix; que toque producción no lo hace módulo: lo cuidan las 5 preguntas y la red de los frenos, no un spec).
- ¿Hace falta algo más que el pedido y el `git diff` para retomarlo? **No**: una línea en suma.js y su prueba.
- ¿Lleva más de una sesión? **No**.
- La sesión dice: "chico, lo hago acá".

### 3 · módulo solo
> "Quiero que alfa lleve un historial de las cuentas que hace: que cada suma quede anotada, que se pueda listar por día y borrar una que hice mal, y que quede guardado entre una corrida y otra. Todavía no sé dónde ni en qué formato conviene guardarlo."

- Tamaño esperado: **módulo solo**.
- ¿Hace falta algo más que el pedido y el `git diff` para retomarlo? **Sí**: hay que decidir dónde se guarda, el formato y qué pasa al borrar; el diff solo no lo cuenta.
- ¿Lleva más de una sesión? **Sí**: guardar, listar y borrar no entran en una.
- La sesión dice: "más que chico: llamo al Arquitecto".

### 4 · módulo solo
> "Quiero que alfa deje de ser solo un archivo: una pantalla web donde escribo dos números, veo el resultado y las últimas diez cuentas. Hay que decidir con qué se arma y cómo lo publico."

- Tamaño esperado: **módulo solo**.
- ¿Hace falta algo más que el pedido y el `git diff` para retomarlo? **Sí**: la tecnología, la pantalla y cómo se publica son decisiones de diseño que no se ven en el diff.
- ¿Lleva más de una sesión? **Sí**.
- La sesión dice: "más que chico: llamo al Arquitecto".

### 5 · con director
> "Hay que hacer dos cosas nuevas de alfa a la vez porque no queremos esperar: el historial de cuentas (guardado en un archivo, que se pueda listar por día) y una calculadora de línea de comandos con las cuatro operaciones. Son independientes, que se hagan en paralelo."

- Tamaño esperado: **módulo con director** (dos tareas que se escriben a la vez, sobre archivos distintos).
- ¿Hace falta algo más que el pedido y el `git diff` para retomarlo? **Sí**.
- ¿Lleva más de una sesión? **Sí**.
- La sesión dice: "más que chico: llamo al Arquitecto" (el director lo decide él al listar las tareas).

## `beta`

Lo que tiene `beta`: solo el `CLAUDE.md` y `docs/` del molde (`NORTE.md`, `MAPA.md`, `SESSION_HANDOFF.md`, `TODO.md`, `CHANGELOG.md`, `README.md`, `referencia/PRUEBA.md`, `referencia/trampas.md`).

### 6 · chico
> "Poné al principio de docs/NORTE.md de beta una frase que diga que beta es el control de gastos de la oficina."

- Tamaño esperado: **chico**.
- ¿Hace falta algo más que el pedido y el `git diff` para retomarlo? **No**: es un texto agregado.
- ¿Lleva más de una sesión? **No**.
- La sesión dice: "chico, lo hago acá".

### 7 · chico
> "Sumá al TODO de beta, en lo importante, que tengo que llamar al proveedor el lunes."

- Tamaño esperado: **chico**.
- ¿Hace falta algo más que el pedido y el `git diff` para retomarlo? **No**.
- ¿Lleva más de una sesión? **No**.
- La sesión dice: "chico, lo hago acá".

### 8 · módulo solo
> "Armame una guía de cómo se hace el cierre de mes en beta, paso por paso, con quién hace cada cosa y qué se controla. Hoy está todo en mi cabeza, así que vas a tener que ir preguntándome."

- Tamaño esperado: **módulo solo**.
- ¿Hace falta algo más que el pedido y el `git diff` para retomarlo? **Sí**: la guía sale de lo que el dueño cuenta; sin esa charla el diff no explica el porqué de cada paso.
- ¿Lleva más de una sesión? **Sí**.
- La sesión dice: "más que chico: llamo al Arquitecto".

### 9 · módulo solo
> "Quiero que beta tenga un registro de clientes: una ficha por cliente con sus contactos y lo que nos debe, y que se mantenga al día solo. Hay que ver qué va en cada ficha y dónde se guarda."

- Tamaño esperado: **módulo solo**.
- ¿Hace falta algo más que el pedido y el `git diff` para retomarlo? **Sí**: qué lleva cada ficha y cómo se mantiene se decide charlando.
- ¿Lleva más de una sesión? **Sí**.
- La sesión dice: "más que chico: llamo al Arquitecto".

### 10 · con director
> "Esta noche no voy a estar. Dejá armadas, mientras duermo, las tres guías de beta: la de clientes, la de proveedores y la de cobranzas. Que cada una avance por su lado y a la mañana me muestres todo junto."

- Tamaño esperado: **módulo con director** (noche sin el dueño, y tres tareas que se escriben a la vez).
- ¿Hace falta algo más que el pedido y el `git diff` para retomarlo? **Sí**.
- ¿Lleva más de una sesión? **Sí**.
- La sesión dice: "más que chico: llamo al Arquitecto" (el director lo decide él al listar las tareas).

## Cuenta

4 `chico` (1, 2, 6, 7) · 4 `módulo solo` (3, 4, 8, 9) · 2 `con director` (5, 10).
