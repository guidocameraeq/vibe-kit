# Guía del kit v3 — cómo queda y por qué es mejor

> Repaso del diseño del kit v3, charlado con Guido el 2026-10-27 (misión 4, tramo 5, paso 0). Es la charla textual, ordenada como guía. El diseño detallado vive en los ocho `docs/mision-4/DISENO-*.md` y en `docs/mision-4/TABLERO.md`; el plano de construcción es el `SPEC-0-kit-v3.md` de esta misma carpeta. Kit instalado al escribirse: v2.4.2. Nada de lo descrito está construido todavía: es lo que el kit v3 tiene que hacer.

## Para qué sirve este documento

Esto es el repaso del kit que le pediste a Claude una tarde: "contame cómo quedó mi kit y por qué es mejor que el anterior". Lo que sigue es esa charla tal cual fue, sin resumir ni maquillar, ordenada como guía para poder volver a ella cuando haga falta.

Son cinco partes, en el orden de tu workflow: primero el Arquitecto (con el que arrancás todo), después cómo se actualiza el kit y cómo llegan las mejoras a los repos, después tu día a día con director y obreros, después cómo quedan los repos y la documentación, y al final por qué todo esto es mejor que lo anterior, con lo medido.

Donde dice NO VERIFICADO es algo que está diseñado pero todavía no se probó en la práctica: eso se prueba en el piloto de Deptos, no antes. Nada de lo que se describe está construido: es lo que el kit v3 tiene que hacer cuando se construya.

## Índice

- Parte (a) · El Arquitecto nuevo
- Parte (b) · Cómo se actualiza el kit y después los repos
- Parte (c) · El día a día con director y obreros
- Parte (d) · Cómo quedan los repos y la documentación
- Parte (e) · Por qué es mejor que el kit anterior, con lo medido
- Qué sigue

## Parte (a) · El Arquitecto nuevo

### El Arquitecto de hoy, en una frase

Hoy el Arquitecto es un tipo muy bueno al que **vos tenés que ir a buscar**. Si te acordás de llamarlo, hace una entrevista larga, te arma el spec y te deja el proyecto montado. El problema no es lo que hace: es que casi nunca lo llamás. Lo medimos en el acta de contraste: apareció en 11 de 41 lotes de trabajo, y en Mobile en 0 de 18. Vos mismo lo dijiste el 26/10: "yo me olvido de llamarlo; planeo con el director y después meto al director". Y cada director se inventa su propio molde de "spec, dos rondas de red team". Portal, encima, envejeció con una copia vieja del Arquitecto adentro.

### Los 5 cambios del Arquitecto nuevo

**1. El Arquitecto viene a vos, no vos a él.** Cuando le pedís algo a cualquier sesión de un proyecto, ella misma mide el tamaño con dos preguntas (¿se retoma solo con el pedido más el diff? ¿lleva más de una sesión?). Si las dos dan no, dice "chico, lo hago acá" y arregla. Si alguna da sí, dice "esto es más que chico, llamo al Arquitecto" **en la misma pestaña**. Vos no decidís nada ahí, y nadie te pregunta "¿esto lleva spec?".

Ejemplo: en el Hub decís "el total del viernes suma mal". Chico: lo arregla, prueba, commitea, cierre de tres líneas. Sin spec, sin Arquitecto. En Devoluciones decís "que el cliente vea el estado desde el link del mail". Módulo: la sesión llama al Arquitecto sola.

**2. Modo B corto, para cuando ya planeaste con el director.** Hoy el Arquitecto siempre entrevista de cero. El nuevo, si llega con un plan ya charlado, hace solo lo que el director no hace: explora el código real, escribe el "qué NO se toca", corre los chequeos por script, decide si hace falta director, y arma la sección "Ejecución". La entrevista larga queda para proyecto nuevo o cuando no hay plan. Cuánto tarda el corto se mide en Deptos: si molesta, se recorta, porque si molesta lo vas a esquivar.

**3. El candado: sin sello del Arquitecto no hay READY ni obrero.** Esto es lo que hace que el cambio 1 no dependa de la buena voluntad de nadie. Cada spec lleva una línea que escriben los scripts, no el modelo: fecha, versión del kit, y los tres chequeos (tamaño, entorno de prueba, tope del spec). El script que marca READY se niega si falta el sello. Y un obrero que recibe un spec sin sello se frena y dice "corré Modo B". Meta medible: specs con sello, de 11 de 41 a 100%.

**4. Termina armando, no mandando a pegar.** Hoy te deja el spec y vos dictás unas 6 veces "planeá, spec, red team, ¿cuántas sesiones?". El nuevo deja un commit en main con la carpeta del módulo, la ficha, el spec y, si hace falta, el worktree y la rama. Y te da **una sola línea para pegar** en la pestaña nueva. También decide él si va director o módulo solo: director solo cuando hay dos o más tareas que se escriben a la vez, o cuando pedís noche sin vos. Que lleve varias sesiones seguidas no lo hace director. Vos podés pisar en los dos sentidos: "quiero director igual" o "bajá".

Ejemplo: en Mobile decís "una sola identidad entre Desktop y Mobile". El Arquitecto lista las tareas, ve cuatro carriles en paralelo y una noche, y decide director. Vos ves el OK del spec, una línea por pestaña, y después `/estado identidad`.

**5. Más piezas chicas adentro, y una puerta sola.** Al Arquitecto también le decís "preparame esta máquina" o "poné al día X" y él deriva al Equipador, que hoy casi no se usaba por tener nombre propio. Suma tres cosas nuevas: antes de explorar lee el `NORTE.md` del proyecto; si la feature es de pantalla te muestra un prototipo HTML antes del spec; y en el Modo B largo corre siempre "¿cómo lo resuelven otros?" con un investigador acotado, cosa que hoy solo pasaba si lo pedías. Y su archivo principal pasa de 20 KB a unos 5: solo ruteo y reglas de oro, cada puerta se lee cuando hace falta.

### Lo que NO cambia

Charla, no construye. La app la hace otra sesión. El estado vive en disco. Tus decisiones son la autoridad. Red team sigue siendo condicional: plata, permisos o datos de terceros. Y relevamiento sigue siendo su propia puerta.

### Lo que falta probar

Dos cosas quedan NO VERIFICADO hasta el piloto en Deptos: cuánto tarda el Modo B corto, y si el candado del sello frena a los obreros sin romper nada.

## Parte (b) · Cómo se actualiza el kit y después los repos

### Cómo es hoy

Hoy el kit se actualiza bien hasta la PC y mal de ahí en adelante. En vibe-kit editás, corrés el `kit-sync`, tag, push. En la PC decís "actualizate" y el Equipador baja lo último. Pero los repos no se enteran: cada proyecto tiene la copia del molde con la que nació. Mobile tiene un `/inicio` de una época, Hub de otra, Portal una copia vieja del Arquitecto adentro. Cuando algo mejora, se lleva a mano, por bloques enteros, pegando de un repo a otro. Y a la inversa, cuando Hermes mejora su método 32 veces en una semana, nada de eso vuelve al kit salvo que lo leamos nosotros.

### Escalón 1: cómo se actualiza el kit mismo

Dos cambios chicos que habilitan todo lo demás:

- **Un archivo `kit/VERSION`** con el número, el mismo del tag. Hoy la versión existe solo como tag y un script no la puede leer. El Equipador copia ese archivo a la PC al instalar.
- **Una nota de migración por versión** en el CHANGELOG del kit: qué piezas cambiaron, si el cambio es automático o pide revisión, qué chequear después. Es lo que lee el agente que actualiza.

La numeración queda con tres números: el primero solo si algo deja de ser compatible con las fichas viejas, el segundo cuando entra una pieza nueva al molde, el tercero para arreglos.

### Escalón 2: la PC

"Actualizate" sigue igual, pero ahora **el hook de cada proyecto compara su ficha con el `VERSION` de la PC**, en las dos direcciones. Al abrir Hub te dice "hay kit nuevo para este proyecto" o "esta PC está atrás, actualizate". Si el kit no está instalado en esa PC, calla. Esto resuelve lo de que el Equipador casi no se usaba: ya no tenés que acordarte de él.

### Escalón 3: los repos, el corazón de (b)

**Cada repo lleva una ficha**, `.claude/kit.md`. Es la libreta de ese proyecto: qué versión del kit tiene, con qué datos se instanció el molde (nombre, comando de test, lenguajes), y **el estado de cada pieza** con un hash para saber si está intacta. Cuatro estados posibles:

- `molde`: se regenera entera.
- `molde+propio`: se regenera lo de afuera de la zona propia, la zona queda intacta.
- `adaptada`: el proyecto la reescribió a fondo; se actualiza por fusión, con criterio.
- `propia`: intocable. `/smoke` y `/release` nacen así.

Abajo de la cabecera, en prosa, "cómo se adaptó el kit a este proyecto", **con el por qué**. Ejemplo real: "Hub: el `/inicio` suma el chequeo de Vercel porque dos veces se trabajó sobre un deploy roto". Sin ese por qué la fusión no se hace. Es "cada regla lleva su cicatriz" bajado a los proyectos.

**La zona propia** es cómo convive lo tuyo con lo del molde. En las skills de texto, un bloque marcado "Lo propio de este proyecto". En los hooks, no se marca nada: el molde queda intacto y llama al final a un archivo hermano si existe. En el `settings.json`, regla por regla: lo que el proyecto quitó a propósito queda anotado en la ficha y no vuelve. `CLAUDE.md` y todo `docs/` son del proyecto, el actualizador no los toca salvo una línea en el CHANGELOG.

**El actualizador.** Decís "poné al día Hub y Devoluciones" o "toda la flota", y pasa esto:

1. Primero se actualiza él, baja el kit fresco con sus tags. No se reparte un kit viejo.
2. **Un agente por proyecto, en paralelo, en un clon temporal.** Nunca en la carpeta donde estás trabajando.
3. Pieza por pieza según la ficha. Si una pieza `molde` no coincide con su hash, **no la pisa**: la marca como desvío y lo informa. Si es `adaptada`, el agente mira qué mejoró el molde desde la versión de la que partió el proyecto, lee en la ficha qué adaptaste y por qué, y arma el molde nuevo con tu adaptación encima. Si tu adaptación ya no hace falta porque el molde la resolvió, te lo dice en una línea.
4. Chequeo mecánico antes de dar por hecho: ningún placeholder suelto, el hook inyecta menos de 10.000 caracteres, el `settings.json` abre, las skills cargan.
5. **Si pasa, mezcla él a `main`** en un solo commit fácil de revertir, y pushea. No te pregunta: es reversible. Si falla, deja la rama `kit/v<versión>` marcada como rota y te lo dice.
6. Te devuelve una tabla: proyecto, versión vieja y nueva, piezas tocadas, desvíos, si se mezcló.

Los permisos de esos agentes son parte del diseño: herramientas justas, prohibido leer secretos, permitido pushear a `main` de la flota. Sin eso, el primer push pide permiso y te despierta a las tres de la mañana, que es exactamente el obrero trabado hora y media que ya vivimos.

Ejemplo: sale kit 2.5 con el hook nuevo. Decís "poné al día la flota". Diez minutos después tenés una tabla: Hub pasó, Devoluciones pasó, Mobile tiene un `/cierre` con desvío que no se tocó, Portal no se pudo porque esta PC no puede pushear ahí. Abrís Hub, hacés `git pull`, y ya está.

### Adoptar un repo que nunca pasó por el Arquitecto

Portal, el Bot. "Adoptá Portal": primero mira sin tocar, inventario de piezas, documentos, copias del kit adentro. Después **una sola pantalla con la propuesta de estado por pieza**, que aprobás en bloque o corregís. Esa es una de las pocas preguntas nuevas, porque es una decisión sobre un proyecto tuyo. Trae siempre la ficha, `/inicio` y `/cierre` si faltan, el hook con tope, las barreras base y los documentos del método vacíos. No trae `/smoke`, `/release` ni director: eso llega cuando el ritual exista. Las copias viejas del kit adentro las lista y propone sacarlas. Cierra igual que el actualizador.

### El camino de vuelta: del proyecto al kit

Esto es lo que cerró el ADR-026. **Cada proyecto puede seguir cambiando su método entre versiones del kit**, y eso es bueno, porque Hermes demostró que esperar tres meses para "el exe le pega a producción" no es serio. Pero se anota en una forma que un script pueda leer: `.claude/cambios/`, un archivo chico por cambio, con el caso que lo originó, la regla como queda, dónde vive, y cómo se sabe si funcionó. Lo decidiste vos el 26/10: **el agente aplica el cambio en la zona propia con el diff mostrado, sin preguntarte; solo lo que toca barreras va con tu clic.**

Cada tres o cuatro meses, el ciclo (misión 6): un script lee los registros de toda la flota. **Tres proyectos con la misma regla, o uno con cicatriz** de seguridad, producción o plata, entran al kit. El actualizador marca ese cambio como "subió al kit" y retira la zona propia que el molde ya cubre. Las urgencias no esperan al ciclo, salen como parche, como el tope del hook de la v2.4.3. Y un proyecto puede tomar el cambio de otro citándolo, dos citas ya cuentan dos para el tres.

### Lo que queda NO VERIFICADO al piloto

Tres cosas: migrar el archivo gigante de Hermes a archivos chicos al adoptarlo; que el actualizador reconozca un cambio propio por su id y no por el texto; y que el hash guardado alcance para saber si la zona propia sigue intacta.

## Parte (c) · El día a día con director y obreros

### Cómo es hoy

Hoy tenés tres métodos distintos con el mismo nombre. En Desktop mergeás vos. En Mobile mergea el obrero con tu clic. En Deptos mergea el director. Desktop obliga a re-revisar un arreglo trivial, Mobile lo prohíbe, Deptos no dice nada. Nadie habla de esfuerzo del modelo. Mobile tiene 65 rutas absolutas pegadas adentro de las skills. Y lo que te pesa, medido: abrir pestañas a mano (unas 120), que el obrero te pida confirmar lo que ya decidiste con el director (unos 30 frenos), repetirle "¿cómo vamos?" al director (unas 110 veces), y no saber cuándo `/obrero` y cuándo `/tramo`.

Lo que no ves y las fuentes sí: un tercio de los turnos de un director eran avisos sin novedad, cada uno releyendo medio millón de tokens. Siete de ocho consultas del obrero volvieron con la opción que él ya recomendaba. Siete de ocho segundas vueltas del revisor salieron "aprobado". Un obrero quedó parado ocho horas y media una noche. Deptos, la versión corta, es la que más se parece al canon: 30 bloques en 11 días sin una regresión por el método.

### El día, paso a paso

**0. Nace.** Pedís en criollo. Si no es chico, el Arquitecto abre la carpeta del módulo en `main` con la ficha y el spec, decide director por la regla de (a), y si hay director arma rama, worktree, bitácora, tiempos y planes. Si ya lo charlaste con el director de otro módulo, esa misma sesión invoca al Arquitecto en Modo B corto. Y ojo: **el director que charló no es el director del módulo nuevo**. Cada módulo tiene el suyo.

**1. Arranca el director.** Abrís la pestaña con la línea que te dio el Arquitecto. Opus, esfuerzo alto. Lee el relevo si hay, la ficha, el spec, el `git log` corto. Confirma en tres líneas y espera tu OK la primera vez; de un relevo, confirma y sigue.

**2. El encargo.** El director escribe un archivo en la bitácora, commiteado en la rama del módulo: estado de partida por script, archivos que toca, referencia al spec, sub-pasos de no más de tres archivos, qué NO se toca, modelo y esfuerzo con razón, riesgo, **AUTORIZADO**, el gate, quién abre la pestaña, la suscripción. El mensaje al obrero lleva solo la ruta.

**3. Se abre el obrero.** Default: pegás vos una línea, una por pestaña, y la ves en VS Code. Si lo pediste o es de noche, la lanza el director. El obrero no sabe quién lo abrió, arranca igual: se presenta con rama, commit, modelo real y contexto. Lo chico, un sub-paso o un documento, ni siquiera abre pestaña: va como subagente del director.

**4. El trabajo.** `/obrero` escribe él; `/tramo` delega, con una razón con nombre, y eso resuelve tu duda de cuál usar. Por sub-paso: explorador ubica, implementador escribe la prueba en rojo primero y después el código, commit congelado, **revisor Opus siempre en la primera vuelta**, una corrección acotada y chau. Segunda vuelta solo si el revisor dijo "rechazado", máximo dos y después PARADA. Avanza por commit, cinco líneas con SHA y cuánto contexto le queda. **El director no contesta los avances**: la evidencia es el commit y un script lo cruza.

Los permisos, que es donde más te molestaban: **lo que el encargo puso en AUTORIZADO no te pregunta más**. Un script lo convierte en reglas de permiso estrechas en el worktree del obrero. El hook queda solo para negar las cinco de A, que siempre piden tu clic en la pestaña que actúa: datos reales, plata, lo que sale afuera, claves, y publicar un release.

**5. El gate.** Sección GATE del encargo más el script del proyecto. Arreglo sin prueba es rojo. Riesgo alto, red team de construcción.

**6. Cierra el encargo.** El obrero deja su evidencia, pushea su rama, manda CIERRE con notas para el método, y no corre `/cierre`. Un verificador por script le da seis líneas al director; si el script falla, NO VERIFICADO y PARADA. **El director mergea a la rama del módulo sin preguntar.** El obrero se reutiliza para el siguiente encargo en su misma carpeta, o se cierra.

**7. Cierra el tramo.** El director sobreescribe la ficha: tareas con su commit, próximo paso, "parado", "te espera". Actualiza tiempos. Mira la alarma de intervenciones. Si pasó el 40% de su ventana, deja relevo en la bitácora, commit, push, y deja de escribir. Compactar es una falla, no un evento.

**8. La noche.** Decís "me voy" y el director contesta **un solo bloque**: qué necesita de vos ahora, todo junto; qué queda andando y hasta cuándo; con qué te vas a encontrar al volver. Esto vale también de día, si decís "corto a las 15:30". Los obreros de noche no esperan: si necesitan algo fuera de AUTORIZADO, PARADA. **El despertador es un script afuera del director**, mira git y solo lo despierta si hay PARADA o commit nuevo. Las cinco de A de noche se niegan y quedan en "te espera". Y por Hermes entraron dos cicatrices: el despertador mira también `main`, porque un test commiteó siete veces en el `main` real y nadie lo vio en doce horas; y la red está en el checklist, porque sin red no trabaja nadie y el despertador tampoco lo ve.

**9. Termina el módulo.** Merge a `main` por el director con el gate completo, `/cierre` del proyecto, `/release` con tu OK. La ficha pasa a COMPLETO y queda como manual.

**Módulo solo.** La misma carpeta con menos archivos. Tu sesión hace el trabajo, lanza el revisor Opus para código, corre el gate, `/cierre` mantiene la ficha. Sin bitácora, sin tiempos, sin encargos.

### Quién decide qué: tres clases

- **Clase 1**, técnica y reversible, no cambia lo que alguien ve: **el obrero decide y declara** el desvío en el avance. Un script los cuenta, pero el contador nunca lo frena ni le habla. Vos lo dijiste: "casi todos los obreros se desvían y siguen; que ese clic no me parta las cosas a la mitad".
- **Clase 2**, cambia lo que alguien ve, el plan o el NO SE TOCA: **el director decide** contra el spec. Y lo rutinario que hoy te subía como pregunta **no se pregunta más**: se aplica la recomendada y se avisa en una línea con veto. Los cambios de método del proyecto también son clase 2, con el diff mostrado.
- **Clase 3**, diseño, negocio y las cinco de A: **vos**. Diseño y negocio charlando con opciones y una recomendación. Lo demás con contexto, una RECOMENDADA primera, "qué cambia para vos", y siempre el botón "explicámelo en criollo". Nunca un pop-up a mitad de un encargo: va a la cola "te espera".

Lo pendiente vive en un solo lugar, dos campos de la ficha. `/estado` muestra arriba solo lo que te espera a vos. Nunca más al pie de cada mensaje. Y si un tramo te preguntó más de tres veces, el método lo registra solo en las notas.

### Lo que hacés vos en todo el ciclo, y nada más

Pedís en criollo. Das el OK del primer arranque. Abrís las pestañas que te pide el director, una línea cada una. Cliqueás las cinco de A. Decidís diseño y negocio con opciones. Decís "me voy". Mirás `/estado` cuando querés. Todo lo demás, merges, verificación, documentación, relevos, lo hacen los agentes con rastro en git.

### Las metas, contra hoy

| Medida | Hoy | Meta |
|---|---|---|
| Turnos vacíos del director | 34% | cerca de 0 |
| Intervenciones tuyas por tramo | 4 a 5 | 3 o menos |
| Vueltas del revisor por sub-paso | 19 para 8 | 1,3 o menos |
| Horas de obrero parado de noche | 8,5 | 0 |
| Pop-ups sobre lo ya autorizado | unos 30 | 0 |
| Arreglos que traen su prueba | 18 a 45% | hacia 94% |

### NO VERIFICADO al piloto

Que el director pueda lanzar sesiones de fondo desde Bash. Cómo despierta el script al director de noche. Que el script prediga los permisos del checklist. Que la alarma lea transcripts de varias sesiones. Todo eso se prueba en Deptos.

## Parte (d) · Cómo quedan los repos y la documentación

### Cómo es hoy

Medido el 22/10 con `gh`, sin abrir los proyectos:

- El hook hace `cat` del handoff entero y la plataforma corta a 10.000 caracteres sin avisar. **Bot inyecta 15.500 y el Panel 18.000**: arrancan ciegos y no lo saben.
- El handoff de Devoluciones pesa **534 KB**. El TODO de Desktop, 261 KB, y el hook muestra las primeras 40 líneas: el resto no lo ve nadie. Unos 29 ítems falsos en tres semanas.
- Estado e historia en el mismo archivo: el tablero del tramo de Desktop tiene **1,7 MB**, de los cuales lo vivo son 70 mil caracteres. El resto es "estado ahora" apilado por fecha.
- Lo que los rituales leen entero: el director de Desktop relee un contrato de 314 KB antes de cada mensaje. El obrero de Mobile relee 336 KB de encargos para encontrar el suyo, que está al final.
- Cuenta Corriente, un módulo terminado, quedó en **cuatro lugares**. Devoluciones tiene 111 specs planos en una carpeta.
- Ningún proyecto dice en una pantalla qué es, para quién y qué NO hace: unos 28 lotes donde el agente lo inventó.
- Y vos, el 26/10: "muchas cosas me quedan desactualizadas y nunca tengo claro qué hay que hacer y qué no".

### 1. Un solo árbol de `docs/`, en los diez repos

La raíz tiene **exactamente seis archivos y tres carpetas**:

- `NORTE.md`: qué es la app, para quién, qué NO hace, y los hechos que solo sabés vos. Una pantalla.
- `MAPA.md`: cómo se conecta por dentro, con un diagrama a nivel módulos que pediste vos, y con qué otras apps. Opcional si no hay conexiones.
- El handoff, el TODO, el CHANGELOG y el README de `docs/`, con tope.
- `modulos/<nombre>/`: una carpeta por feature, con su vida adentro.
- `referencia/`: lo que no cambia con el trabajo diario. Decisiones, rechazos, arquitectura, trampas, datos de prueba.
- `archive/`: solo lo que murió de verdad. Los módulos no vienen acá.

Lo que no encaja va a `referencia/` sin preguntar. Los archivos conservan su nombre, así nada se rompe. Se adoptó del Hub, que ya lo tiene andando desde el 22/10 con un test que falla si algo queda suelto.

Ejemplo: "¿dónde está el spec de Cuenta Corriente?" tiene una sola respuesta en los diez proyectos: `docs/modulos/cuenta-corriente/SPEC.md`.

### 2. El módulo: una carpeta, una ficha, una historia

La **ficha** del módulo es su estado, de una pantalla, con **tope de 5.000 bytes** mientras está en obra. Se sobreescribe, nunca apila. Trae estado, próximo paso, tareas tildadas solo con su commit, decisiones en una línea, y **"te espera"**: lo que necesita de vos. Al terminar pasa a COMPLETO y queda como el manual del módulo, en su carpeta. Cuenta Corriente estaría en un lugar, no en cuatro.

El `SPEC.md` arranca con **tu pedido textual**, porque los encargos parafraseados son los que fallan: 8 de 11 traían un dato falso. No se archiva al implementarse, se queda con su módulo.

La **bitácora** existe solo con director, y es una carpeta de archivos chicos, nunca uno que crece: un archivo por encargo, uno por relevo. El obrero lee su encargo de 3 KB en vez de 336 KB. Y **estado e historia nunca en el mismo archivo**: el tablero de 1,7 MB es exactamente lo que se prohíbe.

Tres tamaños, una estructura: chico no tiene nada en `docs/`, módulo solo tiene ficha y spec, módulo con director suma tiempos, planes y bitácora. Pasar de uno a otro es agregar archivos a la misma carpeta, no reorganizar.

### 3. El hook con presupuesto y huella

Un script en node, con **presupuesto de 9.700 caracteres** repartido por bloque: cabecera con versión del kit, las cinco líneas de seguridad, el handoff con tope de 5.000, una línea por módulo activo, la cabecera del TODO, cinco commits. Si algo se pasa, recorta en orden y **lo dice**: "CORTADO: leé el resto". Y al final imprime la huella: "inyectado: N caracteres de 9.700". Un número que se ve en todas las sesiones no crece en silencio. Es la lección de Desktop: medir lo que la sesión recibe, no lo que el hook emite.

Y la novedad de la revisión integral: **al lado de cada línea de estado y próximo paso, el hook imprime su edad**, calculada por `git blame`: "hace 6 días". Si un módulo tuvo commits después de que se tocó su estado, lo marca "estado viejo". El acta contradijo 211 a 2 la idea de que el estado se mantenía solo: un tracker en "NO ARRANCADO" con el tramo en curso, un mes de encabezados falsos. El hook ya no inyecta estado viejo sin decirlo.

El hook también sabe en qué pestaña está por la rama: en el worktree del director inyecta la ficha del módulo, en el del obrero la ruta de su encargo sin el handoff del proyecto.

### 4. El handoff y el TODO que no mienten

El handoff: **tope de 5.000 bytes**, secciones fijas en orden de importancia. Se van "qué se hizo" y "archivos tocados", porque ya están en el CHANGELOG y en git: hoy se escriben tres veces. Si no entra, no se apila: el detalle va al CHANGELOG, las trampas a `referencia/trampas.md`.

El TODO: **ningún ítem lleva fecha a mano**, la edad la da git. La cabecera es solo lo rojo y lo naranja, que es lo que ve el hook. Lo que lleva 90 días sin tocarse baja solo a "algún día", salvo lo crítico. El cierre imprime el balance: "TODO: +3 −2 · 41 ítems · 5 bajaron". Y `/cierre` cruza lo anunciado contra lo anotado: cada pendiente que el handoff nombra tiene su ítem, porque un día faltaban tres de cuatro.

### 5. El candado de estructura

Un script del molde, no un test del proyecto, así sirve en cualquier stack. Siete chequeos con id: raíz limpia, rutas citadas que existen, topes respetados, estados coherentes, módulos sin tildar que no pasan a COMPLETO, documentos de más de 100 KB citados por una skill, y estado viejo al cierre. Corrector, no pregunta: cada falla dice qué hacer y el agente lo arregla. Un repo adoptado arranca con el candado apagado hasta que el árbol cumple.

### 6. Ramas y worktrees con nombre

Módulo con director: rama `modulo/<x>`, worktree adentro del repo en `.claude/worktrees/modulo--<x>`. Encargo: `modulo/<x>--07`. **Los crea un script**, no vos ni el director a mano, con cinco modos: crear, abrir, sincronizar el entorno, cerrar e integrar. "Cerrar" se niega si la rama no está mergeada. "Integrar" es cómo el director mergea a `main` sin tocar tu checkout. Merges con `--no-ff`, nunca squash. El nombre de sesión sale de ahí: `director-identidad`, `obrero-identidad--07`.

La cicatriz que lo justifica es del 26/10 en esta PC: Hermes manda los worktrees afuera del repo, y había **47 carpetas `Hermes-*` en la raíz de D:**. "Se me llena de carpetas el disco". Adentro del proyecto, con nombre fijo, ignoradas por git.

### 7. La portada de cada repo

Tu pedido del 26/10: "que los repos sean lindos y se entienda qué es el proyecto". El README de la raíz es **portada y nada más**: banner, qué es en tres líneas, cómo correrlo, enlaces a NORTE, MAPA y docs. Sin pendientes, sin historial, sin versión. La arma el Arquitecto desde el NORTE, al montar o adoptar. Lo liviano o personal no paga banner. Vestirla es una pieza de la misión 5, con el molde de la portada de vibe-kit.

### Las metas, contra hoy

| Medida | Hoy | Meta |
|---|---|---|
| Proyectos cuyo hook pasa los 10.000 | 2 de 10, 2 al borde | 0 |
| Handoff más grande de la flota | 534 KB | 5 KB o menos |
| Documentos de más de 100 KB leídos enteros | al menos 4 | 0 |
| Archivos sueltos en la raíz de `docs/` | 15 a 40 por proyecto | 0 |
| Módulos terminados en más de un lugar | al menos 1 | 0 |
| Huella al arrancar | 4.700 a 18.000 | 9.500 o menos, visible |

Se mide con scripts cada mes, no a ojo.

### NO VERIFICADO

Cómo abrir una pestaña de la extensión dentro de un worktree. Que Windows aguante las rutas largas de los worktrees. Cuánto cuesta el banner por proyecto. Y la migración del Hub al modelo de módulos, que es el primer caso real.

## Parte (e) · Por qué es mejor que el kit anterior, con lo medido

### Por qué es mejor, en siete razones

**1. Está medido, no opinado.** El kit anterior nació de tu experiencia y de lo que yo sabía. Este nació de leer 41 lotes de trabajo real, 365 mil tokens de skills de tus tres proyectos, los commits de los diez repos con scripts, y los 32 cambios de método que Hermes hizo solo. Cada decisión de los 8 diseños cita la cicatriz que la justifica, y cada racimo termina con una tabla "cómo se sabe si funcionó" que un script puede volver a correr cada mes. Cuando algo del kit anterior fallaba, no lo sabíamos. Con este, el número lo dice.

**2. Frenos mecánicos, no prosa.** Cinco familias de error reincidieron con la regla escrita en el CLAUDE.md. El kit anterior confiaba en que el agente leyera y obedeciera. El nuevo pone scripts donde hay riesgo: el sello del Arquitecto, el candado de estructura, el gate del encargo, el hook que niega las cinco de A, el guardia del actualizador, la huella del hook. Donde la regla es blanda queda escrito que es blanda y cómo se mide.

**3. Lo chico no paga lo grande.** Hoy un hotfix de 15 líneas pasaba por tres auditores y una feature de tres archivos abría chat nuevo. Con la prueba de tamaño en una línea y los tres tamaños sobre una sola estructura, el hotfix se hace y ya, y un tramo de Hermes entra al mismo sistema sin que tu feature de los sábados pague el traje.

**4. El estado deja de mentir.** El acta contradijo 211 a 2 la idea de que el estado se mantenía. Ahora la edad la da git, no la mano; el hook te dice qué no vio y qué está viejo; el handoff tiene tope; el TODO se poda solo; y `/cierre` cruza lo anunciado contra lo anotado. Tu frase "nunca tengo claro qué hay que hacer y qué no" tiene respuesta mecánica.

**5. Una sola cara en los diez repos.** Hoy tenés tres métodos con el mismo nombre, 65 rutas absolutas en las skills de Mobile, y el Equipador no se usaba. Con la ficha del kit, la zona propia y el actualizador, cada repo sabe qué versión tiene, se pone al día con un pedido, y lo tuyo nunca se pisa. Abrís cualquier repo en GitHub y en diez segundos sabés qué es.

**6. Vos hacés menos, y solo lo tuyo.** Pedir, dar el OK inicial, abrir pestañas con una línea, cliquear las cinco de A, decidir diseño y negocio, decir "me voy". Todo lo demás con rastro en git. Lo rutinario no te pregunta más, y si un tramo te pregunta de más, el método lo anota solo.

**7. Se mantiene solo.** El kit anterior se actualizaba cuando yo lo tocaba. Este tiene un ciclo: cada proyecto registra sus cambios de método en archivos chicos, un script los lee cada tres o cuatro meses, y lo que tres proyectos repiten o uno aprendió con sangre sube al kit. Las urgencias salen como parche.

### Los siete objetivos, con los números

| Objetivo | Medida | Hoy | Meta |
|---|---|---|---|
| Menos tokens | Turnos del director sin novedad | 34% | cerca de 0 |
| | Lo que carga una pestaña de obrero | 62 a 75 KB | menos, con núcleo común |
| | Proyectos con el hook pasado del tope | 2 de 10 | 0 |
| | Lo que el director lee antes de un mensaje a otra app | 314 KB | 10 KB o menos |
| Mejor código | Arreglos que arreglan otro arreglo | 26% | que baje |
| | Arreglos que traen su prueba | 0 a 45% | hacia 94% |
| | Vueltas del revisor por sub-paso | 19 para 8 | 1,3 o menos |
| | Encargos con un dato falso | 8 de 11 | 0 |
| Documentos estables | Proyectos que marcan su versión del método | 0 de 10 | 10 de 10 |
| | Handoff más grande | 534 KB | 5 KB o menos |
| | Archivos sueltos en `docs/` | 15 a 40 | 0 |
| | Módulos terminados en más de un lugar | al menos 1 | 0 |
| Procesos estables | Dictados de ejecución por módulo | unos 6 | 0 |
| | Specs con sello del Arquitecto | 11 de 41 | 100% |
| | Pop-ups sobre lo ya autorizado | unos 30 | 0 |
| | Duración de un cierre de solo documentos | 15 a 84 min | que baje |
| Tres PCs, dos personas | Abrir un rol en otra PC sin editar nada | no se puede | sí, cero rutas absolutas |
| | Edad máxima de un pedido abierto entre proyectos | 5 días | 2 o menos |
| | Firmas tuyas en acuerdos entre apps | 24 | solo las que cambian alcance |
| Tu tiempo | "¿Cómo vamos?" | unos 110 | los da `/estado` |
| | Pegados fuera de su pestaña | unos 55 | 0 |
| | Intervenciones por tramo | 4 a 5 | 3 o menos |
| | Horas de obrero parado de noche | 8,5 | 0 |
| Seguridad | Proyectos con barreras de fábrica | 2 de 10 | 10 de 10 |
| | Credenciales que pasaron por el chat | unos 23 episodios | 0 |
| | Falsas alarmas del escáner al cerrar | unas 25 | 0 |
| | Pre-commit en las tres PCs | 0 de 3 | 3 de 3 |

Todo lo de "hoy" tiene fuente y script para repetirse. Lo de "meta" se mide en el piloto de Deptos, un mes de uso, contra estas líneas base.

### Lo que todavía no está

Para que no te lleves una idea equivocada: **nada de esto existe todavía**. Es diseño, 8 documentos y unos 400 KB. El kit instalado sigue siendo el 2.4.2. Lo que viene es el spec, después ordenar la casa, después construir pieza por pieza hasta el v3.0, y el piloto en Deptos. La mensajería entre directores quedó para el v3.1.

### Lo que no sé

Dos cosas siguen sin medir: cuánto cuesta en dólares, y el tiempo real de respuesta entre tus dos PCs. Y las piezas NO VERIFICADO que te fui marcando en cada parte se prueban en el piloto, no antes: el Modo B corto, el sello frenando obreros, la migración de Hermes, el despertador de noche, los worktrees en Windows, las pestañas de la extensión dentro de un worktree.

## Qué sigue

Lo que viene, en orden, y sin saltearse ninguno:

1. **El spec del kit v3** (tramo 5): el `SPEC-0-kit-v3.md` armado desde los ocho `DISENO-*`, con red team en Opus, revisor frío y tu OK. Nada se construye antes de ese OK.
2. **Misión 4½, ordenar la casa**: una sesión corta para dejar el repo limpio y publicable antes de construir.
3. **Misión 5, construir**: pieza por pieza hasta el kit v3.0, con el piloto del canon director/obrero en Deptos y la medición contra las líneas base.
4. **Misión 6, el ciclo como proceso escrito**: una vuelta cada 3-4 meses.
5. **Misión 7, la mensajería entre directores** (kit v3.1).

## Fe de erratas (2026-10-27, tarde)

Esta guía es la charla de la mañana. Esa misma tarde el spec pasó por tres rondas de red team y un revisor frío en Opus, y cuatro cosas quedaron distintas de como se cuentan arriba. El detalle está en el spec, sección "Lo que cambió desde la guía que leíste".

1. **Parte (b)**: el actualizador no usa permisos `allow` para pushear. Corre en modo bypass dentro de un clon temporal, con hooks que frenan si fallan, reparte desde un tag y su chequeo antes de mezclar es más completo (barreras, casos de los hooks, el `comando-test` del proyecto, gitleaks).
2. **Partes (b) y (c)**: "barreras con tu clic" sigue siendo tu clic en la ventana de permiso, como hoy. El red team mostró que un agente podía esquivar esa ventana llamando al script por otro camino; lo decidiste vos esa tarde: se queda el clic, con tres candados detrás que no te piden nada (el script se niega a correr desde una carpeta de agente, el OK anota desde dónde se dio, y los modos sin ventana lo niegan). Lo que queda sin cubrir, y aceptaste: un obrero que salga de su carpeta a propósito deja rastro y lo ves al día siguiente.
3. **Parte (d) §5**: el candado tiene nueve chequeos, no siete. Suma `barreras` (nadie quita un freno sin tu OK) y `datos` (cero rutas y nombres de sesión en las skills).
4. **Parte (c)**: de noche, un obrero sin gitleaks en su PC no commitea, para. Y quitar un freno de un proyecto lleva commit, tu OK y merge, también en los personales.
