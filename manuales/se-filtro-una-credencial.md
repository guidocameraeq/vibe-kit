# Se filtró una credencial

> Qué hacer, en orden, cuando una clave, un token o una contraseña quedó donde no debía: en un commit, en el chat, en una captura. Una sola página, para el único escenario con cicatriz. Si este documento y el diseño (`docs/mision-4/DISENO-F-seguridad.md` §17) difieren, gana el diseño.

**Regla de oro: si pasó, se da por filtrada.** No importa que "seguro nadie la vio". Cuesta menos rotarla que averiguar si alguien la usó.

---

## 1. Los pasos, en este orden

1. **Rotá primero, limpiá después.** Entrá al servicio dueño de la credencial (la base, la API, GitHub), generá una nueva y **anulá la vieja**. Mientras la vieja siga viva, todo lo demás es maquillaje.
2. **Cargá la nueva sin verla.** Que la ponga una persona con `cargar-secreto <NOMBRE>`: pide el valor con entrada oculta y lo guarda en el `.env` o en la variable del sistema. Nunca la pegues en el chat para "que Claude la ponga". En Windows, una variable del sistema nueva se ve recién en la próxima sesión.
3. **Mirá si la usaron.** En el panel del servicio, revisá los accesos desde que se filtró (logs, últimas conexiones, facturación rara). Si hubo uso que no reconocés, avisá a quien corresponda en la empresa antes de seguir.
4. **Sacala del historial de git, solo si llegó a un commit.**
   - Si el commit **no se pushó**: se reescribe el historial local y listo.
   - Si **se pushó**: hay que reescribir el historial con una herramienta (por ejemplo `git filter-repo`), forzar el push y avisar a todos los que clonaron para que clonen de nuevo. Los forks, los PR abiertos y los clones viejos conservan el valor: por eso el paso 1 va primero.
   - Pedile a Claude que lo haga y te muestre antes qué commits toca; el `push --force` lo aprobás vos.
5. **Verificá que la vieja ya no sirve.** Probá la credencial vieja contra el servicio: tiene que responder que no (error de autenticación). Después corré el escáner sobre todo el historial (`gitleaks git --redact --no-banner`): tiene que dar cero hallazgos.
6. **Dejá la línea.** Una entrada en el `CHANGELOG.md` del proyecto: qué credencial (el **nombre** de la variable, nunca el valor), por dónde se filtró, cuándo se rotó y cómo se verificó. Si fue por un hueco del método (una regla que faltaba), eso va también a `referencia/trampas.md`.

---

## 2. Las cinco fugas laterales

Hay cinco caminos por donde un valor se va **sin que lo hayas pegado a propósito**. Si la filtración vino por uno de estos, el paso 1 igual rige; y después, cerrá el camino.

1. **La selección del editor que viaja sola.** El IDE adjunta al mensaje lo que tengas seleccionado o el archivo abierto. Si dejaste un `.env` abierto o un valor seleccionado, fue en el mensaje aunque no escribieras nada. *Antes de escribirle a Claude: cerrá el archivo con claves y deseleccioná.*
2. **El historial del portapapeles de Windows.** Lo que copiás queda en el historial (`Win` + `V`), y puede sincronizarse con otras PCs. *Después de copiar una clave: abrí el historial y borrá todo. Mejor: no la copies nunca; usá `cargar-secreto`.*
3. **La ventana de clave sin foco.** Un programa pide la clave en una ventana que quedó atrás, y la tipeás en el chat. *Si la pantalla no te pide la clave donde esperabas, no tipees nada: buscá la ventana primero.*
4. **La salida verbosa de builds y herramientas.** Un modo `--verbose` o `--debug`, un volcado de variables de entorno o un `curl -v` imprimen cabeceras y tokens, y esa salida pasa por el chat. *No corras herramientas en modo verboso contra producción; si hace falta el detalle, que vaya a un archivo y se lea filtrado.*
5. **El enmascarado improvisado.** Tapar a mano parte del valor ("abc…xyz") o dibujar un rectángulo sobre una captura no protege: lo que queda visible ayuda a adivinar, y el rectángulo se puede sacar. *Usá `--redact` donde la herramienta lo tenga; si no, no lo muestres.*

### Y una pregunta nueva antes de leer: "¿qué trae esta lectura?"

Hasta ahora se miraba solo "¿escribe algo?". Mirá también **qué trae lo que se lee o se adjunta**: un archivo de configuración, un log o una captura pueden traer un valor de producción sin que nadie lo pegue (pasó: un valor llegó adjunto sin pegarlo). Si lo que vas a leer puede traer un valor, no lo leas: pedí el nombre de la variable, no el contenido.

---

## 3. Imágenes y evidencia con datos reales

- La evidencia con datos reales (capturas, exports, volcados) **vive fuera del repo, con registro**: la ruta, el tramo de trabajo para el que sirve y quién la borra. Se borra al cerrar.
- Si vas a capturar un teléfono, **apagá las notificaciones antes** (pasó: 24 capturas quedaron sin dueño, sin saber de quién eran ni quién las borraba).

---

## 4. Si tenés dudas de por dónde se fue

Asumí el peor camino y seguí los seis pasos. Después, contale a Claude cuál de las cinco fugas fue, para que quede en `referencia/trampas.md` si es una trampa del proyecto, o vuelva al kit si es del método.
