# Diseño · Racimo G: la mesa entre directores, las PCs y el buzón (G.1)

> **Misión 4, tramo 4** · 2026-10-24 · **Estado: ✅ cerrado con Guido y revisado** (12 decisiones aprobadas en bloque; revisor frío Opus:
> 34 hallazgos, 32 aplicados tal cual y 2 con otro arreglo; un ajuste de Guido después de la revisión, §9.3; §17). Es solo diseño: se construye en la misión 5. Se mide contra el norte y los 11 criterios del
> [PLAN](PLAN.md). Respeta lo decidido en [A](DISENO-A-frenos.md), [B](DISENO-B-documentos.md), [C](DISENO-C-salida-hacia-Guido.md),
> [D](DISENO-D-director-obrero.md), [E](DISENO-E-molde-y-flota.md) y [F](DISENO-F-seguridad.md); donde los corrige o completa, lo dice y
> deja la nota allá (la lista, en §22). Alias: Desktop, Mobile, Devoluciones, Deptos, Hub (el repo es público; ADR-021).

## 1. Para qué es este racimo, en una línea

Que dos directores de proyectos que comparten algo (una base, una API, una identidad) se pongan de acuerdo **sin que Guido sea el cartero,
sin contratos de 527 KB escritos a mano y sin que un mensaje se pierda porque una PC estaba apagada, una pestaña cambió de nombre o del otro
lado hay otra cuenta**; y que el kit diga cómo, de forma genérica, cuando del otro lado hay un agente que no puede leer el repo.

## 2. Lo que decidió Guido (2026-10-24)

- **La mesa se queda y es lo más importante**: la usa él, sobre todo entre dos sesiones de su misma PC; entre sus PCs, con Remote Control.
  **No se reemplaza por nada.** Lo que se mejora es **el sistema de contratos y documentación**: que los directores documenten lo que haga
  falta sin un contrato larguísimo, o con uno "bien armado, bien pensado" si eso es la solución.
- **El compañero ahora tiene su propia cuenta de Claude Code** (antes compartían la de Guido). Una mesa entre cuentas por Remote Control "ya
  no funciona más". Lo de dos cuentas se usa solo cuando trabaja con él.
- **El kit es genérico**: no se adapta a "Guido tiene un compañero con dos PCs". Eligió el **enfoque C**: la mesa de una cuenta como canon, y
  el buzón multiagente como **opt-in** que se diseña aparte (**racimo G.1**, con búsqueda en internet de quién ya lo hizo), se prueba en
  piloto, se usa y se corrige.
- Datos que cambian el diseño: el compañero firma los commits de Portal, Devoluciones y Hub (cierra la pregunta de FLOTA §8); sus tres PCs
  usan su cuenta de claude.ai (**NO VERIFICADO** explícito; inferido de "lo que yo ya uso").
- **Lo que el revisor frío cambió del enfoque C** (§4, R-6): el canon **ya cruza cuentas**, porque el contenido va por git y el compañero lee
  esos repos con su cuenta de GitHub. Entre cuentas solo se pierde el aviso inmediato.
- **Aprobado por Guido el 2026-10-24, las 12 decisiones en bloque**, con un ajuste suyo: **nadie le avisa** de un pedido que espera en otro
  proyecto; lo ve al abrir cualquier sesión de ese proyecto (§9.3). "Si el otro director no está trabajando, no se pueden poner de acuerdo, y
  está bien." Y dos aclaraciones que pidió: la mesa la instala el Arquitecto en el repo y el director la usa solo, sin que él le avise nada;
  los mensajes entre sesiones siguen igual, lo nuevo es la copia en el repo antes del aviso.

## 3. Hoy (medido el 2026-10-24 sobre disco, repo y la doc oficial)

Un lector Sonnet leyó la radiografía, el tablero, la plataforma, los contratos reales de Hermes en disco y los settings de esta PC (~245 mil
tokens); un agente guía verificó 25 afirmaciones contra `code.claude.com/docs` (13 páginas, ~155 mil). Lo que cambia la mirada:

| Qué | Hoy | Evidencia |
|---|---|---|
| `mesa/` (P32) | **No existe.** Es propuesta, no algo construido | disco; tanda P32 |
| La mesa real | Un contrato por par de proyectos, en el repo de cada uno, escrito a mano por el director: **527 KB / 3.583 líneas** en Mobile (98 commits en 36 días), **317 KB** en Desktop; 12 y 22 KB con Devoluciones (mesa de tres) | disco |
| Qué tiene adentro | Estado de cada proyecto, qué necesita cada uno, reglas, **mensajes redactados y archivados** (§8, §11, §12), respuestas, acuerdos `MT-1..12` con el mismo número en los dos archivos y un control de que los dos textos sean idénticos | contrato §1-§37 |
| Dónde quedan los mensajes | Parte en el contrato (copiada a mano), el resto en los chats: **no se puede contar** | ficha §1 |
| Tipos de mensaje escritos | Mobile 13 · Desktop 5 · Deptos 6: **tres dialectos**; "~18 en uso" no se puede contar | skills en disco |
| Lo que anda | Hecho más cita: 7 de 7 correcciones cruzadas buenas en un día; una falla de un proyecto fue regla en los dos en un día; el orden fijo "nosotros primero, después ustedes" eliminó la ventana simultánea | RAD §3, §7; H-56 |
| Lo que falla | Una sesión de otra PC **5 días inalcanzable**; ~20 textos pegados en la pestaña equivocada; un `/rename` rompe las direcciones; el hash de igualdad de la base compartida tardó ≥6 mensajes con tres proyectos; la misma regla escrita distinta en cada proyecto; la cuenta de GitHub del compañero **sin acceso** al repo privado de la investigación (su resumen volvió por mensaje en 5 partes) | RAD §3; H-56; CM-36; tanda §Mesa entre PCs |
| Config de mensajería en esta PC | **Ninguna**: ni `crossSessionInbound`, ni `isolatePeerMachines`, ni Remote Control en ningún settings. Le funciona por el default de la plataforma. El bypass está habilitado en la extensión | grep sobre `~/.claude` y los proyectos |
| El kit | **Cero menciones** a mensajería, mesa o Remote Control; el molde es node (B §9) | grep `kit/` |
| El buzón | El borrador (SPEC-0, red team, protocolo v0) está fuera del repo por ADR-021; corre como piloto en la organización. En un proyecto personal de esta PC corre un bus por archivos (5 agentes, 121 tareas, 233 eventos) | PLAN §Pilares; disco |

**Lo verificado en la doc oficial que manda sobre el diseño** (detalle en §16):
- `SendMessage` a otra PC: **misma cuenta de claude.ai** y Remote Control en las dos puntas. Entre dos cuentas: **no documentado** (toda la
  doc dice "your sessions"); Guido lo confirma por uso ("ya no funciona más"). Los equipos de agentes tampoco cruzan sesiones ni PCs.
- **VS Code y la app de escritorio no pueden mostrar el diálogo** de un mensaje retenido: lo guardan 5 minutos (`dialogExpiry`) y lo tiran.
  Y el default **retiene** cuando el que manda está en bypass y el que recibe no: con obreros en distintos modos (D §7), pasa.
- `crossSessionInbound: accept` **solo vale en los settings de usuario** (o administrados); en el proyecto, la plataforma lo ignora salvo que
  sea más estricto. Por eso el molde no puede traerlo: lo pone el Equipador, y vale para todos los proyectos de esa PC.
- **WSL 2 y Windows nativo en la misma PC no se ven.**
- Un mensaje a una sesión cerrada: **no documentado**. Con la PC reiniciada nada reconecta solo: hay que reanudar la sesión. Una sesión
  vieja puede no aparecer en la lista (se lee "newest first" con tope de páginas).
- El receptor **descarta en silencio** por cola llena (50), por ráfaga, por repetidos idénticos y por lazos; el emisor se entera solo desde
  v2.1.238. Un mensaje no adjunta archivos ni cambia configuración.
- `claude --resume <nombre>` resuelve por nombre en el repo y sus worktrees; que el nombre sirva para mensajería tras reanudar: no documentado.

## 4. El canal según el destino (decisión 1)

**Hoy**: PLATAFORMA §6.2 dice "el canal oficial entre PCs es Remote Control + `SendMessage`; el archivo es solo respaldo". La evidencia dice
que lo que se rompió fue justo ese canal, y que entre cuentas no existe.

1. **El contenido siempre va por git** (§5): un archivo en el repo del que escribe, que el otro lee. **Eso vale entre cualquier par de repos
   que las dos PCs puedan leer, sea la cuenta de Claude que sea** (R-6): el compañero lee los repos de la organización con su cuenta de
   GitHub, no con la de Claude. Lo único que cambia por cuenta es el aviso.
2. **El aviso, según a quién**: dentro de la PC, `SendMessage` por nombre, como hoy (inmediato, ya anda, D lo diseñó). Entre PCs de la misma
   cuenta, `SendMessage` por Remote Control **si está prendido**. Entre cuentas, **no hay aviso**: el otro lo encuentra en su próximo
   arranque o cierre de tramo (§10). **La regla de una línea para el director**: *si el otro está en tu lista de agentes, avisale por nombre;
   si no, dejá el archivo y seguí*. Nunca espera un "leído".
3. **El buzón (G.1, §18)** es para lo que git no cubre: un agente **sin acceso al repo**, otro LLM que no corre git, otra organización, o el
   aviso inmediato entre cuentas. Opt-in; no se usa hasta que exista y se haya medido en piloto.

*Alternativas descartadas*: Remote Control como requisito de toda sesión de la mesa (no cubre al compañero; depende de nombres que se
pierden; privacidad: con Remote Control el transcript se guarda en servidores de Anthropic mientras está conectado; exige plan Pro, Max,
Team o Enterprise) · el buzón como base de todo (reemplaza lo único que a Guido le anda hoy, sin un número medido; criterio 9) · mandar lo
de otra cuenta "a mano" (Guido de cartero otra vez; R-6). *Reabre PLATAFORMA §6.2*: el canal por archivo deja de ser respaldo y pasa a ser
**la base del contenido**; Remote Control queda **opcional**, para la inmediatez y para que Guido hable con una sesión desde el teléfono.
*Qué cambia para Guido*: nada en su día a día; cuando una PC esté apagada o del otro lado esté el compañero, el mensaje espera en el repo
en vez de perderse o pasar por él.

## 5. El mensaje de mesa es un archivo del módulo; el mensaje de sesión lleva el puntero (decisión 2)

**Hoy**: el director redacta el mensaje en el chat, lo manda, y después **lo copia a mano** al contrato (de ahí los 527 KB y los 98 commits).
Deptos ya invirtió el orden para director/obrero: "la evidencia es el canal principal; si un mensaje no llega, leé `git show`". gentle-ai midió
lo mismo: el encargo por referencia, nunca parafraseado (REFERENCIAS §4.2).

1. **Primero el archivo, después el aviso.** Cada mensaje de mesa es **un archivo chico en `docs/modulos/<x>/mesa/<alias>/`** del módulo
   dueño de la conexión, en el repo del que escribe, commiteado y pusheado **antes** de mandar nada. Es parte del módulo: el director lo
   escribe en su rama (D §8.1 ya le permite todo `docs/modulos/<x>/`), una sesión plana lo escribe en `main` si el módulo no tiene director,
   y al cerrar el módulo la carpeta se queda con él (B §5). **Nota a B §12**: `referencia/contrato-<app>/` queda solo para el histórico de
   antes del método (los contratos de 527 y 317 KB, marcados `> Histórico`).
2. **El nombre lo genera el script** (`mesa nuevo`), nunca a mano: `<fecha>-<módulo>-<tipo>-<hhmmss>.md`, en ASCII y minúscula
   (`2026-10-24-identidad-pedido-154210.md`). Dos módulos del mismo repo el mismo día no chocan (R-4).
3. **Cabecera legible por script** (R-3), después prosa corta:
   - `tipo:` uno de la tabla (§6) · `de:` / `para:` `<alias>/<rol>` (§12) · `tema:` una línea
   - `responde-a: <alias>:<ruta>@<sha12>` (solo si contesta)
   - `resultado:` (solo en `RESPUESTA`): `aceptado` · `rechazado <razón>` · `devuelto <razón>` · `hecho <alias>:<sha12>`
   - `hechos:` una o más citas `<alias>:<archivo>:<línea>@<sha12>` al repo dueño. **Un hecho sin cita no es un hecho**: el receptor lo
     devuelve con `resultado: devuelto` (la regla "re-verificar antes de mandar" de hoy, hecha formato).
   - **No hay `estado:`** (R-2): **un mensaje no se edita después del push, nunca**. Si está abierto, acordado o cerrado **lo calcula el
     script**: un `PEDIDO` está abierto mientras ninguna `RESPUESTA` lo cite; una `PROPUESTA` está acordada cuando una `RESPUESTA` la cita
     con `resultado: aceptado`. Estado e historia nunca en el mismo archivo (B §5).
4. **Un escritor por archivo**: la respuesta es otro archivo, en el otro repo. **El hilo lo arma el script** (`mesa abiertos --hilo`) leyendo
   los dos repos; nadie lo escribe a mano.
5. **Tope ≤ 2 KB** por mensaje, chequeado por un candado nuevo **`candado:mesa`** (tamaño, cabecera válida, tipo de la tabla; nota a B §14),
   y **`candado:rutas` saltea las citas `<alias>:`** porque son de otro repo (R-18). Un paquete largo (el "borrador de mesa" de 31 KB que hoy
   existe) es un documento del módulo (`planes/` o el spec) y el mensaje lo cita.
6. **El receptor lee el archivo del otro repo**, como hoy: por el clon local si lo tiene, si no con `gh api` al SHA. Tras el `fetch`, **el
   script mira `docs/modulos/*/mesa/` en todas las ramas de `origin`** del otro repo (R-1), porque un módulo con director escribe en su rama.
   **Las ramas de módulo se mergean sin squash** (nota a D §8 y a H), para que el SHA citado siga existiendo después del merge.
7. **El aviso** es una línea: `PEDIDO · mobile → desktop · <tema> · mobile:docs/modulos/identidad/mesa/desktop/2026-10-24-identidad-pedido-154210.md@a1b2c3d4e5f6`.
   El destinatario del `SendMessage` es el nombre de sesión del contacto (§12); dentro del texto solo van alias (R-29).
8. **Lo que esto hace con el contrato de 527 KB**: desaparece como archivo vivo. Los mensajes son los archivos; "estado de cada proyecto"
   es la ficha del módulo de cada lado (B §5); las reglas viven en **la sección "Mesa" del núcleo común de D §5** (el mismo archivo para
   `/director`, `/obrero` y `/tramo`; R-30) y en `mesa.js`; los acuerdos, en §7. El contrato viejo queda `> Histórico`.

*Alternativas descartadas*: mandar el contenido por mensaje y archivar después (doble trabajo y rastro a mano) · una carpeta `mesa/`
compartida entre los dos repos (un segundo registro con dos escritores: el espejo que B desarmó) · un archivo por hilo (dos escritores) ·
el estado dentro del archivo (R-2: nadie lo cierra si el director se mudó). *Qué cambia para Guido*: "¿qué le dijimos a Desktop?" es una
carpeta con fecha, no 3.583 líneas; y el director deja de releer 314 KB antes de cada mensaje (B §12).

**La vuelta de tuerca**: este archivo **es también el contenido que llevaría el buzón** (G.1). La mesa por git y el buzón comparten el
formato; G.1 solo agrega transporte e identidad. Lo que se diseña acá no se tira si el buzón entra.

## 6. Un vocabulario, cerrado y corto (decisión 3)

**Hoy**: tres dialectos (13, 5 y 6 tipos), "~18 en uso contra 10 escritos". D §13 resolvió el "desvío propuesto" con las clases de decisión,
pero **D no fija una tabla de tipos** (R-21): la fija G, y D la usa (nota a D §9).

1. **Una sola tabla en el kit**, dos columnas. **Entre director y obreros**: `PRESENTACION`, `ENCARGO`, `AVANCE`, `CONSULTA`, `RESPUESTA`,
   `CORRECCION`, `PARADA`, `CIERRE` (los que D §9 y §15 usan por nombre). **Entre directores (la mesa)**: `HECHO` (informa; no espera
   respuesta) · `PEDIDO` (necesito algo de tu proyecto) · `RESPUESTA` (con `resultado:`) · `PROPUESTA` (un acuerdo que se propone) · `ALERTA`
   (riesgo, producción, algo que se rompió del lado de ustedes) · `PRESENTACION` (quién soy y a qué nombre me escribís). **Seis tipos de
   mesa.** `ACUERDO` y `devuelto` no son tipos: son resultados que calcula el script (§5.3).
2. **La primera línea del aviso y el `tipo:` del archivo tienen que ser uno de estos.** El receptor **devuelve** lo que no cumple
   (`resultado: devuelto`, con el tipo que corresponde). Es la única corrección permitida sobre forma.
3. **Crece por la regla de 3+**: un tipo nuevo se usa tres veces como `HECHO` con `tema: tipo-propuesto <nombre>` antes de entrar a la
   tabla del kit, y entra por el actualizador (E §6), nunca por la skill de un proyecto.
4. **Las dos "mesas" de Mobile** (la de directores y la "mesa de decisiones" con el PO) dejan de compartir nombre: la segunda es **el
   "te espera"** de C §2.1 y de la ficha del módulo. La palabra *mesa* queda para directores.

*Alternativas descartadas*: una tabla por proyecto (los tres dialectos; H-151: una regla con dos definiciones) · 18 tipos (nadie los
distinguía). *Qué cambia para Guido*: ninguno; es entre agentes.

## 7. Quién acuerda qué: los directores solos dentro de lo aprobado, el PO cuando cambia el alcance (decisión 4)

**Hoy**: "ninguna decisión de un PO viaja por mensaje" (bien, se conserva) y "un acuerdo con el otro proyecto necesita a los dos PO" (regla
`MT`). En Hermes los dos PO son **la misma persona**: Guido firmó 12 acuerdos dos veces. A §2 dice que a Guido solo se le pregunta lo de la
lista de 5, y D §13 que los agentes deciden solos lo que está dentro del spec.

1. **Un acuerdo es una `PROPUESTA` con una `RESPUESTA` `resultado: aceptado`.** Vive una sola vez, **en el repo del que la propuso**; el otro
   la cita. **Se termina el mismo texto en dos archivos** y el control de igualdad (C-39). **Los acuerdos vigentes los lista el script**
   (`mesa acordados`); el `MAPA.md` de cada lado los copia cortos **al cerrar el módulo, cuando lo actualiza el Arquitecto** (B §12; el
   director no escribe fuera de su módulo, D §8.1; R-19).
2. **Los directores acuerdan solos** cuando lo acordado **cabe en los specs aprobados** de los dos módulos y no toca las 5 de A. Lo registran y
   siguen. Es la clase 1 de D §13 aplicada a la mesa.
3. **Va al PO** (al "te espera" del módulo, por el canal de C) cuando el acuerdo **cambia el alcance** de un spec (un módulo nuevo, un
   sub-paso que no estaba, un "no se toca" que se toca) **o toca las 5 de A**. Es la clase 3 de D §13 (diseño), no un punto nuevo de A. El
   director que la propuso la lleva a su "te espera"; del otro lado, solo si también le cambia el alcance. Con un solo PO para los dos
   proyectos, es **una** pregunta, no dos.
4. **Una decisión de PO viaja como `HECHO` con cita** a donde quedó registrada. Nunca como instrucción.
5. **Dos `PROPUESTA` cruzadas sobre el mismo recurso** (R-20): la acepta o rechaza **el proyecto dueño del recurso** (§8); la otra se contesta
   `resultado: devuelto ver <alias>:<ruta>`.
6. **No existe el "encargo entre proyectos"**: lo que un proyecto necesita del otro es un `PEDIDO`; **el trabajo lo encarga el director del
   otro proyecto a sus propios obreros**, contra su propio spec. **Un `PEDIDO` nunca entra a AUTORIZADO ni trae comandos** (R-28): el encargo
   lo redacta el director propio. Un director nunca dirige obreros ajenos. Lo que el PLAN anotó como "cambia una regla de la mesa" se
   resuelve **sin cambiarla**; G.1 hereda esta regla tal cual.

*Alternativas descartadas*: los dos PO firman siempre (una persona firmando dos veces; 12 veces en 36 días) · los directores acuerdan todo
(se saltarían un cambio de alcance; H-154). *Qué cambia para Guido*: firma solo los acuerdos que le cambian un spec, una vez.

## 8. Los recursos compartidos tienen dueño y conjunto declarado; la huella solo si hay copia (decisión 5)

**Hoy**: la base compartida se controla con un `sha256[:16]` "enseñado de memoria" que tardó 6 mensajes en coincidir con tres proyectos. Existía
porque **cada proyecto guardaba su copia del esquema** (R-17).

1. **Cada recurso compartido** (un esquema de base, un contrato de API, una identidad) **tiene un proyecto dueño** y **un conjunto de archivos
   declarado** (un glob: las migraciones, el OpenAPI) en el `MAPA.md` del dueño.
2. **Si el consumidor no guarda copia, alcanza con el SHA**: fija en su lado `usa: <alias>@<sha12>` (lo lista `mesa acordados`; va al MAPA
   al cerrar el módulo). El SHA ya prueba el contenido.
3. **La huella** (`mesa huella <alias>@<sha>`: hash del conjunto a ese SHA) **solo cuando el consumidor guarda una copia** y necesita saber
   si coincide. La calcula el script de los dos lados; **nadie la escribe de memoria.**
4. **El gate del dueño (D §12) avisa** si el conjunto cambió sin una `PROPUESTA` acordada que lo nombre; no frena (criterio 2).
5. **El orden fijo se conserva como regla del acuerdo**, no como horario: "nosotros primero, después ustedes" es una línea de la `PROPUESTA`.

*Alternativas descartadas*: un hash por mensaje a mano · un freno que bloquee el cambio (lo chico pagaría lo grande). *Qué cambia para Guido*:
nada; deja de ver seis mensajes de hashes.

## 9. "Esperando respuesta desde": el silencio se ve, no se persigue (decisión 6)

**Hoy**: una sesión 5 días inalcanzable "sin que nadie se entere"; avisos pisándose; D §9 fijó silencio por defecto y un solo umbral.

1. **Lo abierto lo calcula el script** (`mesa abiertos`: míos sin respuesta, de ellos sin contestar, con la edad en días). Lo corren el
   `/inicio` de **toda sesión** de un proyecto con `mesa:` (R-5), el cierre de cada tramo del director (R-14), el `/estado` de C y el
   despertador nocturno de D §9. **Nadie manda "¿leíste?"**.
2. **Un umbral, de días**: un abierto **de más de 2 días** aparece como **"trabado por mesa"** en `/estado` y en el resumen del día de C §2.1.
   **No se escribe en la ficha** (un solo escritor, B §5): lo calcula quien lo muestra (R-15).
3. **Si del otro lado no hay sesión viva**, el pedido espera en el repo y **nadie le avisa a Guido** (decisión suya, 2026-10-24: "si el otro
   director no está trabajando, no se pueden poner de acuerdo, y está bien"). **La próxima sesión que se abra en ese proyecto**, director o
   pestaña suelta, lo ve en sus 3 líneas de arranque: *"Mobile te dejó un PEDIDO hace 3 días: <tema>"*. No va a "te espera", ni a la lista de
   A §2, ni al resumen del día del otro proyecto. Del lado del que espera, sigue como "trabado por mesa" en su `/estado` (punto 2).
4. **Noches sin PO**: las tres reglas de hoy ya están en D §7 y §9 (AUTORIZADO, `deny` de noche, hecho con cita). No se repiten.

*Qué cambia para Guido*: cuando algo está trabado entre proyectos lo ve en `/estado` y en el resumen del día del proyecto que espera; y al
abrir el otro proyecto, lo primero que lee es lo que le dejaron. Hoy se enteraba a los 5 días.

## 10. Entre PCs y cuentas: git es la base, el aviso es opcional, y la configuración va en el Equipador (decisión 7)

**Hoy**: Remote Control anduvo ida y vuelta en la investigación; una sesión 5 días inalcanzable; en esta PC no hay nada configurado y la
mensajería funciona por el default; el kit no dice nada.

1. **El `/inicio` hace `fetch` del repo propio y de los repos de su `mesa:`** y corre `mesa abiertos`: lo nuevo aparece aunque ningún aviso
   haya llegado. Entre PCs y entre cuentas, **el peor caso es "me entero en mi próximo arranque o cierre de tramo"**, nunca "se perdió".
2. **Remote Control es opcional y por sesión**: Guido lo prende (`/rc`) cuando quiere inmediatez entre sus PCs o hablarle a una sesión desde
   el teléfono. **No va `remoteControlAtStartup: true`** en el molde: guarda el transcript en servidores de Anthropic mientras está
   conectado, exige plan pago y no hace falta para que la mesa funcione.
3. **Lo que el Equipador pone en los settings de usuario** al "preparame esta PC" (E §10), porque en el proyecto no vale:
   `crossSessionInbound: accept`, y nada más. **La razón** (R-26): con obreros en distintos modos (D §7), el default retiene un mensaje de un
   emisor en bypass a un receptor que no lo está, y en VS Code un mensaje retenido muere a los 5 minutos. Vale para todos los proyectos de
   la PC y para Remote Control: se dice en la receta. `isolatePeerMachines` **no** (preguntaría por cada aviso; todo lo que un aviso podría
   filtrar ya está en el repo). `dialogExpiry` no hace falta con `accept`.
4. **Acceso al repo ajeno, chequeado** (R-10): "preparame esta PC" y el `doctor` del kit prueban que `gh` **lea cada repo de la `mesa:`**. Si
   no puede, `mesa abiertos` lo dice en `/inicio`: *"no puedo leer Devoluciones: pedile acceso a <aprueba de ese proyecto>"*. **Nunca se cae en
   silencio** (ya pasó: la tercera PC sin acceso al canal privado).
5. **Un entorno por PC** (Windows nativo o WSL, no se ven): una línea de la receta del Equipador. Sin chequeo mientras ninguna PC use WSL
   (F §20; R-33). **Versión mínima** para mensajería en Windows nativo: 2.1.234 (chequeo de P45).
6. **La lista de agentes puede no mostrar una sesión vieja**: por eso el aviso va por nombre fijo (§12) y nunca se espera que esté.

*Alternativas descartadas*: Remote Control en todas las sesiones de la mesa (la "regla de oro" de PLATAFORMA §6.2; ver §4) ·
`autoMemoryDirectory` apuntando a una carpeta sincronizada (no avalado por la doc; §14 resuelve lo que importa por git). *Qué cambia para
Guido*: "preparame esta PC" le deja la mensajería andando sin que sepa qué es `crossSessionInbound`, y le dice si el compañero no puede leer
un repo antes de que la mesa se trabe.

## 11. Dos personas y sesiones paralelas: git manda, el cierre avisa, el commit va por rutas (decisión 8; P46, S-C-1, S-R-3)

**Hoy**: 23 de 33 lotes en la PC del compañero con problemas de sesiones paralelas; 5 aperturas con pull a mano. D §8 ya puso un escritor por
rama, worktree y archivo para los módulos con director; H nombra ramas y worktrees.

1. **`/inicio` hace `fetch` y saca la foto**: `git status` y `git log origin/main..HEAD`; lo ajeno (archivos modificados que la sesión no
   tocó) **no se toca ni se commitea**. B §9 ya avisa "hay un handoff más nuevo"; esto lo completa con el `fetch`.
2. **`/cierre` hace `fetch` antes de commitear**, avisa los commits ajenos desde el último cierre (quién, qué rutas) y **commitea solo por
   rutas explícitas**, nunca `git add -A`. Si `origin/main` avanzó, integra antes de pushear, **parte del handoff de `origin`** (R-31) y vuelve
   a correr el cruce de B §11. Un conflicto lo resuelve la sesión; si son dos personas sobre la misma línea y no puede decidir, va a "te
   espera" como decisión de diseño (clase 3, D §13).
3. **El handoff lo escribe solo quien cierra en `main`** (D §8.5). Sin "sección por sesión": tope y secciones fijas (B §8).
4. **Una misión = un worktree** solo cuando hace falta: módulo con director (D) o **una segunda sesión viva sobre el mismo repo**. El
   `/inicio` lo detecta (la lista de agentes, o la existencia de un archivo de sesión en `~/.claude/sessions`: **solo nombre y existencia,
   nunca su contenido**; R-27) y propone `claude -w <misión>`: **una pregunta a Guido** (contada en §20). Una sesión plana sola no paga el
   worktree (criterio 9). **Los nombres los fija H.**

*Alternativas descartadas*: worktree siempre (23 lotes eran de la PC del compañero: el problema es el segundo escritor) · bloquear el commit si
hay commits ajenos (molesta más de lo que salva). *Qué cambia para Guido*: deja de hacer `pull` a mano al abrir; cuando el compañero tocó el
repo, el cierre se lo dice con nombre y rutas; y a veces le pregunta "¿abro un worktree para esta misión?".

## 12. La dirección de mesa es del proyecto, no de la sesión; la ficha del kit solo agrega lo que no está (decisión 9)

**Hoy**: nombres fijos por tramo (`director-v4`, `director-identidad`); un `/rename` rompe las direcciones; CM-36: la pestaña volvió con nombre
automático y un CIERRE rebotó sin aviso. D §7.6 fijó `director-<módulo>` y `obrero-<ID>`, y que la ficha del módulo lista las sesiones vivas.

1. **La ficha del kit** (E §4) declara `mesa:` con, **por alias, solo `contacto:` y `transporte:`** (R-8). La URL del repo y "con qué se
   conecta" **ya viven en `MAPA.md`** (B §12) y, si está, en el registro del Hub (E §9): no se escriben de nuevo. `transporte:` es `git`
   (default) o `buzon` (G.1).
2. **El contacto es el director del módulo dueño de la conexión, si está vivo** (`director-<módulo>`, D §7.6; **no existe `director-<proyecto>`**,
   R-5); **si no, la próxima sesión del proyecto**, porque `mesa abiertos` corre en el `/inicio` de cualquiera. **Lo chico lo contesta una
   sesión plana**: un PEDIDO de 15 líneas no obliga a Guido a abrir un director (criterio 9).
3. **Las direcciones `de:`/`para:` del archivo son `<alias>/<rol>`** (`mobile/director`, `desktop/sesion`), no el nombre de sesión: una
   pestaña que cambió de nombre o se reinició **no cambia el rastro**. El nombre de sesión es solo el destinatario del aviso del momento.
4. **`PRESENTACION` al mudarse** (D §11): una sola línea con el nombre de sesión nuevo; si no la manda, el otro lado lee el repo igual.
5. **Un módulo que cruza dos repos** (B §5 lo dejó a G y H): **una ficha en cada repo** (B), **una `PROPUESTA` acordada que las enlaza**, y en
   cada ficha un campo nuevo **`enlaza: <alias>:<ruta de la otra ficha>@<sha12>`** (R-7; `parte-de:` sigue siendo solo el árbol local de B).
   Cómo se nombran sus ramas, H.

*Qué cambia para Guido*: el `/rename` que tipea al abrir la pestaña sigue igual (D); si se le olvida, la mesa no se rompe.

*Nota de H (2026-10-25): un módulo que cruza dos repos lleva el **mismo `<x>` y la misma rama `modulo/<x>`** en los dos, y su director se llama **`director-<alias>-<x>`** para que no haya dos `director-identidad` en la misma PC (las direcciones `<alias>/<rol>` del archivo no cambian). Y la pregunta de §11.4 cuenta solo sesiones vivas **en el mismo checkout** (marca en el `git-dir` propio), no en el repo: en un proyecto largo siempre hay un director vivo en su worktree ([DISENO-H](DISENO-H-niveles-y-puertas.md) §10.4, §10.9, §11).*

## 13. Los números de decisión son del módulo (decisión 10; S-M-12)

**Hoy**: dos carriles registraron el mismo número de decisión (H-22); 6 rondas extra en 36 h; la propuesta era "el director reserva números".

**Lo decidido**: no hay numeración global. **Las decisiones viven en la ficha de su módulo** (B §5.5) y se numeran por módulo:
`<módulo>-D-nn`. Con **un director por módulo y un escritor por ficha** (D §8), dos carriles son dos módulos y no chocan. Las decisiones del
proyecto entero (NORTE, MAPA) las numera el `/cierre` en `main`; **con dos personas hay dos `main` locales** (R-13): después de integrar
(§11.2), el `/cierre` **renumera lo suyo si el número ya existe en `origin`**. **Cuando la ficha llega al tope de 5 KB** (Mobile llegó a
D-92), las decisiones viejas pasan a `bitacora/decisiones.md` como historia y la ficha queda con las vigentes (R-31; nota a B §5).

*Alternativa descartada*: una numeración global con reserva (segundo registro). *Qué cambia para Guido*: nada.

## 14. Las lecciones no viven en la memoria de una PC (decisión 11; P42, mejora #10)

**Hoy**: la memoria automática vive en `~/.claude/projects/<proyecto>/memory/` de **cada PC** y no se sincroniza (doc oficial); una regla
vivía solo en la memoria de una máquina y cada sesión nueva preguntaba por sexta vez (H-48).

1. **La regla**: *lo que tiene que sobrevivir a esta PC no vive en la memoria*: va a `.claude/rules/` (cómo trabajar acá), a
   `docs/referencia/trampas.md` (una trampa del proyecto; B/Hub) o al kit (si es del método; criterio 11). La memoria queda para lo cómodo de
   **esta** PC y **esta** persona.
2. **`/cierre` lo levanta por script**: lista los archivos de memoria del proyecto modificados desde el último cierre (fecha del archivo, casi
   gratis). **La sesión decide adónde va cada lección y lo informa en una línea del cierre** (es documentación: clase 1 de D §13; R-9). Guido
   lo deshace si quiere; **no es una pregunta**.
3. **La memoria de los subagentes del kit** (`memory: project`): **no, por ahora**. El revisor y el red team son deterministas por diseño (su
   criterio está en su definición y en `trampas.md`); sería un segundo registro de trampas. Vuelve si un piloto muestra una trampa repetida en
   dos PCs.

*Qué cambia para Guido*: al cerrar, a veces lee "moví esta lección a `trampas.md`". Nada que contestar.

## 15. Quién aprueba, por alias; y el chequeo de instalación crece (decisión 12; P44, P45)

**Hoy**: ~6 h de explicación de palabra a un usuario nuevo; "quién opera ≠ quién aprueba" en 8 lotes; ~35 min de tropiezos al instalar en
Windows. E §8 dio la versión visible y E §10 "preparame esta PC" con chequeo de node, git y `gh`.

1. **La ficha del kit lleva `aprueba: <alias>`** (el PO del proyecto: a quién van las 5 de A, el "te espera" y las decisiones de diseño) y
   **nada más sobre personas** (R-8: "quién opera" ya vive en el Hub; el kit no lo necesita). **Por alias, nunca nombre real ni cuenta** (el kit
   es público; los repos privados pueden usar nombres).
2. **Si opera ≠ aprueba** (R-12): el clic de las 5 de A sigue siendo **de la pestaña que actúa** (D §7.3: el permiso es de la sesión; un mensaje
   nunca aprueba). Antes del clic, el agente muestra *"esto lo aprueba <alias>"*: **el que opera cliquea solo con el OK del que aprueba y lo cita**
   en el commit o en la evidencia (*"OK de <alias>, <fecha>"*). Es una regla, no un mecanismo: lo de hoy, "el sí de un PO vale solo para lo que
   se le preguntó", escrito.
3. **Las PCs no están en el repo**: el Equipador guarda en su archivo local por PC (E §10) el entorno, la cuenta de `gh` y la carpeta de
   proyectos. Es todo lo que el método necesita por máquina.
4. **"Preparame esta PC" suma** (P45): versión ≥ 2.1.234 en Windows nativo · `crossSessionInbound: accept` en user (lo pone si falta, con
   aviso) · `gh` lee cada repo de la `mesa:` · "reiniciá después de instalar" como línea de la receta. La tabla "qué trae un proyecto nuevo"
   es la ficha del kit de E §4.
5. **Onboarding de una segunda persona**: no hay receta nueva. Es "preparame esta PC" + el `NORTE.md` (B §12) + esta decisión. Si en el piloto
   el compañero necesita más, se escribe con esa evidencia.

*Qué cambia para Guido*: cuando el compañero opera un proyecto suyo, el agente sabe que las 5 de A las aprueba Guido, y se lo dice al
compañero antes del clic.

## 16. Lo verificado contra la doc oficial (2026-10-24)

| Afirmación | Veredicto | Lo que manda |
|---|---|---|
| Entre PCs: por servidores de Anthropic, Remote Control en las dos, login claude.ai | ✅ | Sin API key, setup-token ni Bedrock/Vertex |
| Emisora sin Remote Control: el mensaje sale, sin dirección de respuesta | ✅ | Es de una vía |
| Receptora `offline`: se encola | ✅ · TTL y tope **NO DOC** | Tras reinicio, hay que `--resume` |
| `crossSessionInbound` accept/hold/refuse; default retiene si el emisor está en bypass y el receptor no | ✅ | **Project/local solo si es más estricto**: `accept` va en user (§10.3) |
| `isolatePeerMachines` pide OK por mensaje saliente | ✅ | No se usa |
| VS Code y Desktop no muestran el diálogo: 5 min y se tira | ✅ | Por eso `accept` en user |
| Un mensaje nunca aprueba un permiso | ✅ | §15.2 |
| Windows nativo ≥ 2.1.234; WSL y nativo no se ven | ✅ | Una línea de la receta (§10.5) |
| `SendMessage` entre cuentas | **NO DOC** (todo dice "your sessions"); Guido: "ya no funciona más" | Git cruza cuentas (§4.1); el aviso no |
| Tamaño 1 M caracteres; cola 50; descarta repetidos y ráfagas; un destinatario por mensaje | ✅ (misma PC) | El puntero pesa una línea (§5.7) |
| `--resume <nombre>` resuelve por nombre | ✅ · nombre para mensajería tras reanudar **NO DOC** | La dirección es del proyecto (§12) |
| La lista de agentes se lee "newest first" con tope | ✅ | No se espera la lista (§10.6) |
| Mensaje a sesión cerrada | **NO DOC** | Git es la base (§5) |
| `remoteControlAtStartup` solo en user; transcript en servidores mientras está conectado; Pro, Max, Team o Enterprise | ✅ | Opcional, por sesión (§10.2) |
| Memoria automática por PC, no se comparte; `memory: project` viaja por git | ✅ | §14 |
| Equipos de agentes: un equipo por sesión, no cruzan PCs; experimental | ✅ | No se apoya nada ahí |
| `notify_when_idle`: un aviso, misma PC, 12 h | ✅ | Lo usa D §9, no la mesa |
| Un hook puede postear a su propia sesión (`CLAUDE_CODE_MESSAGING_SOCKET` + token), solo local | ✅ | Dato para el despertador de D (piloto); el token nunca se imprime |
| Suscripción por tipo de mensaje | **NO DOC** | La hace el script del lado del lector; en G.1, el buzón |

## 17. La revisión (2026-10-24)

Revisor frío Opus, sin contexto de la charla, sobre el borrador entero más A-F y la evidencia: **34 hallazgos** (10 rompe · 13 flojo · 9
mejora · 2 sobra). **32 aplicados tal cual**; **2 con otro arreglo**: R-1 (en vez de enmendar D §8.1, los mensajes van **dentro del módulo**,
`docs/modulos/<x>/mesa/`, que el director ya escribe) y R-12 (en vez de un mecanismo de OK por commit, **una regla**: el que opera cliquea solo
con el OK del que aprueba y lo cita). **Lo que más cambió**: el canon cruza cuentas por git (R-6); el estado lo calcula el script y el mensaje
nunca se edita (R-2); `mesa:` y `aprueba:` son lo único nuevo de la ficha, sin segundo registro (R-8); "abrí el director" y "¿esta lección va
al repo?" dejaron de ser preguntas (R-9); el script es node como el molde (R-11); el brief de G.1 creció seis puntos (R-23); y las medidas de
§21 se reescribieron con lo que un script puede contar (R-16). Lo que el revisor pidió no tocar: primero el archivo y después el aviso; la
dirección del proyecto; los recortes con razón. Informe completo en el scratchpad de la sesión (no entra al repo). **Después de la revisión,
Guido aprobó las 12 decisiones en bloque** y cerró lo único que quedaba abierto (§9.3): nadie le avisa; lo ve al abrir.

## 18. Racimo G.1 · el buzón multiagente (brief; se diseña en su propia sesión)

**Qué es**: un contrato genérico para que agentes **sin acceso al repo** (otra organización, otro LLM que no corre git, un agente que
solo ve una carpeta) se dejen mensajes, y para el **aviso inmediato entre cuentas**, montado sobre una carpeta compartida (pedido de Guido,
2026-10-21). **Opt-in** por alias en la ficha del kit (`mesa: <alias>: transporte: buzon`). **Lo que G ya cubre y G.1 no repite**: el formato
del mensaje (§5), el vocabulario (§6), quién acuerda qué y "un PEDIDO nunca entra a AUTORIZADO" (§7), los recursos compartidos (§8), "el
silencio se ve" (§9) y la mesa entre cuentas **por git** (§4.1). **G.1 arranca contando** cuántos casos reales hubo que git no cubrió.

**Las decisiones que G.1 tiene que tomar**, de a una con Guido:
1. **La dirección entre organizaciones** (`<org>/<alias>/<rol>`) y **el descubrimiento**: un `registro` de agentes en la carpeta, o el del Hub
   por adaptador (E §9).
2. **El transporte, por adaptador**: carpeta sincronizada (OneDrive, Drive), repo git aparte, o la puerta HTTP del Hub. El kit define **el
   contrato de la carpeta**: un archivo por mensaje, nunca se edita, nombre único, escritura atómica (la receta de *Maildir*: `tmp/` → `new/` →
   `cur/`); y un **lector chico en node, sin dependencias** (como el molde, B §9), que cualquier LLM puede correr. El transporte que usa la
   empresa es de la capa privada.
3. **Puntero o copia**: el buzón lleva **el puntero** (`<alias>:<ruta>@<sha12>`) cuando el otro puede leer el repo; **la copia del archivo,
   con su SHA, solo cuando no puede**. Nunca las dos (segundo registro, §5).
4. **La identidad y la firma** (F §20 lo pasó acá): identidad declarada (`de:` más el autor del transporte) contra firma criptográfica (HMAC con
   llave por agente, fuera de todo repo). **Modelo de amenaza**: un `HECHO` falso no sirve porque la cita se verifica contra el repo dueño; un
   `PEDIDO` falso sí importa porque dispara un encargo. Por eso G.1 hereda §7.6 (el encargo lo redacta el director propio contra su spec, nunca
   desde el PEDIDO) y decide si eso alcanza o hace falta firma.
5. **El arnés de lo que pide OK humano**: las 5 de A, del lado del que recibe, a su `aprueba:`. Un acuerdo que cambia el alcance es clase 3
   (diseño), como en §7.3; **no se le suma nada a la lista de A** sin el OK de Guido.
6. **Suscripción por tipo** (MetaGPT; REFERENCIAS §3): cada agente declara qué tipos lee; el lector filtra.
7. **Qué pasa cuando el repo del que manda no es legible del otro lado** y el mensaje llevaba puntero: el lector lo dice ("no puedo leer
   <alias>") y pide copia; nunca se cae en silencio (§10.4).

**Cómo arranca G.1** (pedido de Guido: "acá sí conviene buscar"): (1) **investigación** con un agente Sonnet (búsqueda extendida), **escrita en
el scratchpad, no en el repo** (hay material privado; ADR-021): protocolos de agentes (A2A de Google, ACP, MCP como transporte), buzones por
archivos (Maildir, colas sobre carpetas sincronizadas), cómo lo hacen los frameworks multiagente (MetaGPT `_watch`, AutoGen, CrewAI), y repos de
gente que montó un "agent mailbox" sobre OneDrive, Drive o git; sale una tabla "qué resuelven, qué se rompe, qué nos sirve" con URL; (2) **leer
el borrador y el protocolo v0** de la organización y el bus por archivos del proyecto personal (121 tareas, 233 eventos) como dato: **la ruta
va en el handoff de arranque**, no se le pregunta a Guido en la sesión; nada entra al repo; (3) decisiones con Guido de a una; (4) revisor frío;
(5) `DISENO-G1-buzon.md` con su tabla de los 11 criterios y **piloto** con el v0 que ya corre: un mes, contar mensajes reales que git no
cubría; si son cero, el buzón queda en contrato. **Esfuerzo `high`; subagentes en Sonnet u Opus, nunca Fable.** Lee: este diseño §4-§9, §12 y
§18; PLAN §Pilares (mensajería); TABLERO §6 última fila; REFERENCIAS §3-§4; DISENO-F §20; DISENO-E §9 y §11.

## 19. La ficha canónica: una mesa de punta a punta

**0.** El Arquitecto, al abrir un módulo que toca algo compartido (el spec delta lo declara: B §12), completa `mesa:` en la ficha del kit
(`desktop: contacto: director-identidad · transporte: git`) y chequea que `gh` lea el repo de Desktop [§10.4, §12].

**1.** El director de Mobile necesita que Desktop cambie un endpoint. `mesa nuevo pedido desktop` le crea
`docs/modulos/identidad/mesa/desktop/2026-10-24-identidad-pedido-154210.md`; lo completa (≤ 2 KB): `tipo: PEDIDO` · `de: mobile/director` ·
`para: desktop/director` · `hechos:` la cita del spec y del conjunto compartido con su SHA [§5, §8]. Commit y push en su rama del módulo.

**2.** Manda el aviso a `director-identidad` de Desktop, si está en la lista: `PEDIDO · mobile → desktop · endpoint X · mobile:docs/modulos/identidad/mesa/desktop/2026-10-24-identidad-pedido-154210.md@a1b2c3d4e5f6`.
Si no está, no manda nada y sigue [§4.2].

**3.** Del lado de Desktop lo lee el director en el momento (aviso) o **cualquier sesión** en su próximo `/inicio` (`fetch` + `mesa abiertos`
sobre todas las ramas de `origin` de Mobile) [§10.1, §12.2]. Verifica las citas contra el repo de Mobile a ese SHA. Decide: cabe en el spec de
su módulo → lo encarga a su obrero como un encargo más, redactado por él (D §15); no cabe → `PROPUESTA` de cambio de alcance, que va a "te
espera" de Guido [§7]. Si es chico y no hay director, lo hace la sesión plana.

**4.** La `RESPUESTA` es otro archivo, en el repo de Desktop, con `responde-a: mobile:…@a1b2c3d4e5f6` y `resultado: hecho desktop:9f8e7d6c5b4a`.
En el próximo arranque de cualquier sesión de Mobile, `mesa abiertos` ya no lo lista; **nadie editó nada** [§5.3, §9].

**5.** Si en 2 días no hay respuesta: "trabado por mesa" en `/estado Mobile` y en el resumen del día de Mobile. Del lado de Desktop nadie
avisa: la próxima sesión que Guido abra ahí lo ve al arrancar [§9.3].

**6.** Al cerrar el módulo, el Arquitecto copia al `MAPA.md` de cada lado los acuerdos vigentes que lista `mesa acordados` [§7.1, B §12]. El
contrato de 527 KB está en `> Histórico` y nadie lo abre.

## 20. Preguntas nuevas a Guido, contadas (recuento después de la revisión)

| Pieza | Qué le toca | Cuándo |
|---|---|---|
| §7.3 | Un acuerdo que cambia el alcance de un spec | Una vez por acuerdo así; hoy firmaba 12 en 36 días, dos veces cada uno |
| §11.4 | "¿Abro un worktree para esta misión?" | Solo si hay otra sesión viva sobre el mismo repo |
| §11.2 | Un conflicto entre dos personas sobre la misma línea que la sesión no puede decidir | Raro; clase 3 |

**Dos preguntas, una condicionada.** Dejaron de serlo: "abrí el director de X" (va a `/estado` y al resumen del día; §9.3) y "¿esta lección va
al repo?" (la sesión decide e informa; §14.2). **Le saca**: ser cartero entre proyectos y entre cuentas, firmar dos veces, enterarse a los 5
días, los hashes y el `pull` a mano. **La pregunta que quedaba (§9.3) la cerró Guido**: nadie le avisa de un pedido que espera en otro
proyecto; lo ve al abrir. Cero avisos nuevos.

## 21. Cómo se sabe si funcionó (se mide en el piloto, contra las líneas base de hoy)

| Medida | Hoy | Meta | Cómo se mide |
|---|---|---|---|
| Mensajes de mesa con archivo en un repo | Parcial, sin contar (una parte copiada al contrato) | 100% de los avisos | archivos en `modulos/*/mesa/` contra `SendMessage` con tipo de mesa en los transcripts (`costos.py`) |
| Tiempo de respuesta entre proyectos | No medido (la mejora #10 lo pedía) | Mediana ≤ 1 día | fecha de la `RESPUESTA` menos fecha del `PEDIDO` (`mesa abiertos`) |
| Edad máxima de un abierto | 5 días | ≤ 2 días | `mesa abiertos` |
| Lo que el director lee antes de un mensaje de mesa | 314 KB | ≤ 10 KB | `costos.py` sobre el transcript |
| Peso del contrato vivo por par de proyectos | 527 KB y 317 KB | `MAPA.md` ≤ 5 KB (nota a B §14: sumarlo a `candado:topes`); mensajes ≤ 2 KB | `candado:topes`, `candado:mesa` |
| Mensajes de Guido entre proyectos (tipo de mesa escrito por él) | No contado (~20 en la pestaña equivocada eran solo los errores) | 0 | mensajes de Guido que empiezan con un tipo de mesa, en los transcripts |
| Firmas de Guido en acuerdos | 12 acuerdos × 2 | solo los que cambian alcance, × 1 | `mesa acordados` contra "te espera" |
| Rondas para coincidir una huella | ≥ 6 mensajes | 1 | hilos con `huella` |
| Dialectos del vocabulario | 3 | 1 | `flota.py` sobre las skills |
| Mensajes devueltos por forma | Sin base (no existía el resultado) | < 10% al segundo mes | `resultado: devuelto` |
| Sesiones planas con `pull` a mano al abrir | 5 aperturas | 0 | `/inicio` con `fetch`, contado en la tanda |

## 22. Lo que se va a otro racimo o queda en espera, y las notas que G deja

- **G.1**: el buzón entero (§18). **H**: nombres de ramas y worktrees por módulo y por misión; cuándo `/inicio` propone `-w`; el módulo que
  cruza dos repos (ramas); **S-D-7** (el worktree con su entorno; D ya lo pasó). **E**: los campos `mesa:` y `aprueba:` de la ficha (§12, §15);
  los chequeos nuevos del Equipador (§15.4) y su archivo local por PC. **D** (piloto): cómo el despertador le avisa al director (el hook
  puede postear a su propia sesión, solo local; §16). **D/F**: "cortar procesos por identificador, nunca por nombre" (TABLERO §6, objetivo 5)
  es una regla de la definición del obrero y del subagente, ya adoptada en Desktop y Mobile; G no la toca. **Misión 5**: `mesa.js` (`nuevo`,
  `abiertos` con `--hilo`, `acordados`, `huella`), `candado:mesa`, el script de memoria del `/cierre`, y la migración de los contratos de
  Hermes al adoptar (E §7, B §17).
- **En espera**: el tablero que junte las 3 PCs (del Hub, racimo I) · `.claude/agent-memory/` para los agentes del kit (§14.3) · onboarding
  con receta propia (§15.5) · el chequeo de entorno WSL/nativo (§10.5).
- **Notas que G deja en los otros diseños** (R-24): **B §5** (la carpeta `mesa/` dentro del módulo; las decisiones viejas a
  `bitacora/decisiones.md` al llegar al tope) · **B §12** (`referencia/contrato-<app>/` solo histórico; los acuerdos al MAPA al cerrar el módulo)
  · **B §14** (`candado:mesa`; `candado:rutas` saltea `<alias>:`; el MAPA en `candado:topes`) · **D §8** (merge sin squash) · **D §9** (la tabla
  de tipos la fija G) · **E §4 y §10** (ficha y chequeos) · **TABLERO §6** (filas de la mesa y de Remote Control) · **PLATAFORMA §6.2** (reabierto)
  · **FLOTA §8** (la segunda cuenta es el compañero).

*Nota de H (2026-10-25): lo que G dejó a H quedó resuelto en [DISENO-H](DISENO-H-niveles-y-puertas.md) §10-§11: nombres de ramas y worktrees (`modulo/<x>`, `modulo/<x>--<ID>`, `.claude/worktrees/modulo--…`), el script `worktree` con el entorno (S-D-7), `/inicio` propone `-w` solo con otra sesión viva en el mismo checkout, el `/cierre` de la misión plana empuja por fast-forward sin tocar el checkout de `main`, y el módulo que cruza dos repos.*

## 23. Límites de este diseño

- **No se midió** cuántos mensajes de mesa hay por día (viven en chats); las metas de §21 se calibran en el piloto.
- Que las tres PCs de Guido usen la misma cuenta de claude.ai: inferido, **NO VERIFICADO**.
- Que el compañero opere y apruebe Devoluciones (solo se sabe que firma sus commits): **NO VERIFICADO**; cambia quién es `aprueba:` ahí.
- `gh api` para leer el archivo del otro repo a un SHA sin clon, de rutina y con repos privados: **NO VERIFICADO** (va al piloto, con el
  chequeo de §10.4 como red).
- Si GitHub conserva un commit citado cuando la rama se borró con squash: **NO VERIFICADO**; por eso §5.6 manda merge sin squash.
- Nada acá se probó entre PCs después de la investigación de octubre; el piloto de D en Deptos no tiene mesa. **La mesa se pilotea en Hermes
  al adoptar** (E §7), que es donde existe.
- El borrador del buzón no se leyó (está fuera del repo): §18 se escribió desde el tablero, el PLAN y la doc oficial.

## 24. Los 11 criterios, aplicados a este racimo

| # | Criterio | Cómo lo cumple G |
|---|---|---|
| 1 | Menos intervención de Guido | Deja de ser cartero entre proyectos y entre cuentas, firma una vez y solo cambios de alcance, no persigue mensajes ni hace `pull`; dos preguntas nuevas, contadas y condicionadas (§20) |
| 2 | Pragmático, recortado | Nada reemplaza lo que le anda; el buzón se separa en G.1 y entra solo con piloto; `isolatePeerMachines`, `remoteControlAtStartup`, agent-memory, numeración global, worktree siempre, `opera:`, huella sin copia, chequeo WSL y `mesa cerrar`: descartados con razón |
| 3 | Medible | 11 medidas con línea base y un script que las cuenta (§21) |
| 4 | Software que anda y se sostiene | Recursos compartidos con dueño y conjunto declarado; el gate avisa si cambian sin acuerdo; el SHA prueba el contenido (§8) |
| 5 | Tokens y el modelo justo | El director deja de releer 314 KB por mensaje (meta ≤ 10 KB); un mensaje ≤ 2 KB; el silencio de D vale en la mesa; el script lista, el modelo no busca |
| 6 | El script antes que el modelo | `nuevo`, `abiertos`, `acordados`, `huella`, `candado:mesa`, el `fetch` de `/inicio`, el aviso de commits ajenos y el inventario de memoria: el estado de un mensaje nunca lo dice el modelo |
| 7 | Seguro por defecto | Nada entra por mensaje sin cita verificable; un `PEDIDO` nunca entra a AUTORIZADO; un mensaje nunca aprueba; el clic es de la pestaña que actúa; `accept` en user (alcance global, dicho en la receta) y nada que abra la PC; Remote Control opcional por su privacidad; tokens de sesión nunca se leen ni imprimen; alias en el repo público |
| 8 | Portable | La dirección es del proyecto, no de la sesión ni de la PC; el contenido va por git y cruza cuentas; las PCs no están en el repo; el script es node como el molde |
| 9 | Lo chico no paga lo grande | Sin mesa no hay `mesa:` ni scripts; lo chico lo contesta una sesión plana; worktree solo con segunda sesión viva; el buzón solo cuando git no alcanza |
| 10 | Autónomo pero con rastro | Cada mensaje es un commit que nunca se edita; el hilo y el estado los reconstruye el script; los acuerdos viven una vez; lo abierto se ve en `/estado` |
| 11 | Piloto antes de flota | Hermes al adoptar, con las 11 medidas; el buzón con el v0 un mes antes de construir nada; 6 NO VERIFICADO con su prueba (§23) |
