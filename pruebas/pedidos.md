# Pedidos de prueba

Pedidos de prueba del tamaño (criterio 2 del SPEC-0 y P5.1): diez pedidos en criollo, para `alfa` (estandar, con código de node) y `beta` (liviano, sin código), con el tamaño que la sesión tiene que decir.

`/inicio` se prueba en dos tamaños, chico y más que chico (cada sesión plana lo dice en una línea y sin preguntar); solo / con director lo decide el Arquitecto al listar las tareas y se prueba con él (orden 4).

La regla (B §6, H §5): es módulo si NO se retoma solo con el pedido más el `git diff`, o si lleva más de una sesión; si ninguna de las dos, chico. Que toque datos reales, plata o producción no lo hace módulo. Con director solo si hay dos o más tareas que se escriben a la vez, o noche sin Guido; varias sesiones seguidas no lo hacen director.

Cada pedido se pega tal cual en una sesión nueva del repo de prueba. Línea que la sesión tiene que decir antes de hacer nada: **chico** → "chico, lo hago acá" · **módulo solo** y **con director** → "más que chico: llamo al Arquitecto".

## `alfa`

### 1 · chico
> "Che, cuando le paso un nombre con espacios al principio, la función que arma el saludo los deja y queda feo. Que los saque."

- Tamaño esperado: **chico**.
- ¿Se retoma solo con el pedido más el `git diff`? **Sí**: una función, un arreglo, con su prueba.
- ¿Lleva más de una sesión? **No**.
- La sesión dice: "chico, lo hago acá".

### 2 · chico
> "Se rompió algo en producción: el script que carga los datos falla si la variable de la base viene vacía, y ahora mismo no arranca. Que avise con un mensaje claro y no se caiga."

- Tamaño esperado: **chico** (un hotfix; que toque producción no lo hace módulo: lo cuidan las 5 preguntas y la red de los frenos, no un spec).
- ¿Se retoma solo con el pedido más el `git diff`? **Sí**.
- ¿Lleva más de una sesión? **No**.
- La sesión dice: "chico, lo hago acá".

### 3 · módulo solo
> "Necesito que alfa lleve un registro de las tareas hechas: que se puedan anotar, listar por día y borrar las que anoté mal. Que quede guardado entre una corrida y otra."

- Tamaño esperado: **módulo solo**.
- ¿Se retoma solo con el pedido más el `git diff`? **No**: hay que decidir dónde se guarda, el formato y qué pasa al borrar; el diff solo no lo cuenta.
- ¿Lleva más de una sesión? **Sí**: guardar, listar y borrar no entran en una.
- La sesión dice: "más que chico: llamo al Arquitecto".

### 4 · módulo solo
> "Quiero que alfa pueda exportar lo que tiene a un Excel prolijo, con las columnas que yo elija y un resumen arriba. Lo voy a usar todas las semanas."

- Tamaño esperado: **módulo solo**.
- ¿Se retoma solo con el pedido más el `git diff`? **No**: las columnas elegibles y el resumen son decisiones de diseño que no se ven en el diff.
- ¿Lleva más de una sesión? **Sí**.
- La sesión dice: "más que chico: llamo al Arquitecto".

### 5 · con director
> "Hay que rehacer dos cosas de alfa a la vez porque no queremos esperar: el cargador de datos nuevo y el reporte mensual. Son independientes, que se hagan en paralelo."

- Tamaño esperado: **módulo con director** (dos tareas que se escriben a la vez, sobre archivos distintos).
- ¿Se retoma solo con el pedido más el `git diff`? **No**.
- ¿Lleva más de una sesión? **Sí**.
- La sesión dice: "más que chico: llamo al Arquitecto" (el director lo decide él al listar las tareas).

## `beta`

### 6 · chico
> "En el documento de bienvenida de beta dice 'Octubre 2025' y es 2026. Corregilo."

- Tamaño esperado: **chico**.
- ¿Se retoma solo con el pedido más el `git diff`? **Sí**: es un texto cambiado.
- ¿Lleva más de una sesión? **No**.
- La sesión dice: "chico, lo hago acá".

### 7 · chico
> "Sumá al TODO de beta que tengo que llamar al proveedor el lunes, y sacá lo que ya hicimos."

- Tamaño esperado: **chico**.
- ¿Se retoma solo con el pedido más el `git diff`? **Sí**.
- ¿Lleva más de una sesión? **No**.
- La sesión dice: "chico, lo hago acá".

### 8 · módulo solo
> "Armame una guía de cómo se hace el cierre de mes en beta, paso por paso, con quién hace cada cosa y qué se controla. Hoy está todo en mi cabeza."

- Tamaño esperado: **módulo solo**.
- ¿Se retoma solo con el pedido más el `git diff`? **No**: la guía sale de lo que Guido cuenta; sin esa charla el diff no explica el porqué de cada paso.
- ¿Lleva más de una sesión? **Sí**.
- La sesión dice: "más que chico: llamo al Arquitecto".

### 9 · módulo solo
> "Quiero reorganizar todos los documentos de beta por cliente en vez de por fecha, y que después se mantenga así solo. Hay que ver qué va dónde."

- Tamaño esperado: **módulo solo**.
- ¿Se retoma solo con el pedido más el `git diff`? **No**: el criterio de qué va en cada carpeta se decide charlando.
- ¿Lleva más de una sesión? **Sí**.
- La sesión dice: "más que chico: llamo al Arquitecto".

### 10 · con director
> "Esta noche no voy a estar. Dejá armadas, mientras duermo, las tres guías de beta: la de clientes, la de proveedores y la de cobranzas. Que cada una avance por su lado y a la mañana me muestres todo junto."

- Tamaño esperado: **módulo con director** (noche sin Guido, y tres tareas que se escriben a la vez).
- ¿Se retoma solo con el pedido más el `git diff`? **No**.
- ¿Lleva más de una sesión? **Sí**.
- La sesión dice: "más que chico: llamo al Arquitecto" (el director lo decide él al listar las tareas).

## Cuenta

4 `chico` (1, 2, 6, 7) · 4 `módulo solo` (3, 4, 8, 9) · 2 `con director` (5, 10).
