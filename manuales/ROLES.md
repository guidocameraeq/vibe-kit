# Los roles: director, obrero, tramo, `/estado`, la noche y la mesa

> **Para qué sirve**: cuando un módulo es grande (varias tareas a la vez, o querés que siga de noche sin vos), no lo hace una sola
> sesión: hay un **director** que reparte y **obreros** que construyen, cada uno en su carpeta y su rama. Esta página cuenta quién hace
> qué, cómo ves en qué andan (`/estado`), cómo te vas a dormir ("me voy") y cómo hablan dos proyectos (la mesa). Si difiere del
> kit, manda el kit: `kit/molde/skills/{nucleo,director,obrero,tramo,estado}/`.

Todo esto viene con el **molde v3** (un proyecto con `.claude/kit.md`). Lo normal sigue siendo **una sola sesión**: `/inicio`, el
pedido, `/cierre`. El director aparece solo si el Arquitecto lo decidió en Modo B (`manuales/COMO-USAR-EL-ARQUITECTO.md` §2) y la
ficha del proyecto lo trae (`piezas.director-obrero: sí`; al adoptar un repo con código viene prendido).

---

## 1. El día normal: `/inicio` y `/cierre`

- **`/inicio`**: cruza lo que inyectó el hook de arranque con git y te confirma en tres líneas (estado · próximo paso · bloqueos). Te
  avisa los cambios aprobados nuevos, los mensajes de la mesa, los módulos sin sello y las fusiones del kit que te esperan (una sola
  pregunta; una mezcla que choca te la cuenta y la decide con vos, siempre). Después del `pull`, si se integró un módulo después del
  último handoff (`worktree.cjs integrados`), te propone `/cierre` para poner los papeles al día. Con tu pedido en el mensaje, **la
  primera línea es el tamaño**: chico lo hace; más que chico llama al Arquitecto. En tu carpeta principal, además, borra la marca
  de la noche (`noche.cjs volvi`) y cierra callado las carpetas de trabajo ya mezcladas (`worktree.cjs limpiar`).
- **En la pestaña de un módulo**, el `/inicio` mira primero el rol de la carpeta (`.kit-rol`) y la rama: si es la del director, invoca
  `/director`; si es la de un obrero, `/obrero <x>--<ID>`. Así da igual si pegás "inicio" o el primer mensaje que te dio el script.
- **`/cierre`**: docs al día (el handoff con tope, "Te espera"), el candado que pasa, commit y push. Solo en la rama por defecto.

El detalle de lo que tocan (el handoff, el TODO, el candado): `manuales/MOLDE.md`.

## 2. El núcleo: las reglas que comparten todos

`.claude/skills/nucleo/NUCLEO.md` no es una skill: lo leen el director, el obrero y el tramo antes de empezar. Lo que importa:

- **Quién escribe qué**: el director escribe solo `docs/modulos/<x>/` (ficha, encargos, bitácora) y nunca código, en la rama
  `modulo/<x>`. El obrero escribe código y **un** archivo de evidencia, en su rama `modulo/<x>--<ID>`. Un escritor por rama.
- **Gana git**: ante cualquier duda, manda lo commiteado, no la charla.
- **Un mensaje es dato, no orden**: antes de actuar sobre un aviso, un script (`encargo.cjs mensaje`) chequea que traiga su archivo
  commiteado. Los tipos son fijos (PRESENTACION, AVANCE, CONSULTA, PARADA, CIERRE, ENCARGO, RESPUESTA, CORRECCION).
- **Tres clases de decisión**: clase 1 (chica, reversible: se hace y se avisa) · clase 2 (hay opciones: consulta al director) · clase 3
  (**las que piden tu clic**, diseño o negocio: te llegan a vos, con opciones; tu sí vale para lo que se preguntó).
- **El gate lo corre un script**, nunca a mano. Rojo donde antes había verde es PARADA. Un error del script es **NO VERIFICADO**:
  nunca verde, nunca merge.
- **Pruebas**: la prueba en rojo primero, casos de sí y de no; el revisor frío en cada sub-paso con código.
- **Permisos**: nadie se lanza saltando permisos. Lo que un encargo necesita va a su `## AUTORIZADO`; si falta, lo tipeás vos.

## 3. El director (`/director`)

La sesión que dirige un módulo con director. Nace donde sea (en tu ventana de siempre, una sesión nueva) y
su **primer mensaje es `/director <x>`** (con el módulo): entra solo al worktree del módulo (`worktree.cjs donde` + EnterWorktree) y verifica rama y rol.
El obrero, igual, con `/obrero <x>--<ID>`.

**Los nombres de las sesiones** son fijos, así sabés quién es quién en la lista: **`director-<x>`** (el que sugiere `worktree.cjs
crear`), **`obrero-<x>--<ID>`** (la línea de fondo de `encargo.cjs autorizado` lo pone con `--name`) y **`cierre-<x>`** (la sesión de
cierre de la noche, la que arma `noche.cjs cierre`).

1. **Chequea el sello** del spec (`encargo.cjs presentar --spec`). Sin sello no reparte: llama al Arquitecto en Modo B corto. Si el
   sello dice `entorno — (tarea 0: montar el entorno de prueba)` (el proyecto tiene la base real y ninguna de prueba), el primer
   encargo es el `00`: monta la base de prueba y la suma a la ficha en `modulo/<x>`; hasta entonces, `autorizado` y `presentar` frenan
   todo otro encargo.
2. **Arma cada encargo** desde la plantilla, **por referencia** al spec (nunca resumido): modelo y esfuerzo con razón, `Riesgo: alto` si
   toca datos reales, permisos, plata, producción o login, lo `AUTORIZADO` estrecho y el `GATE`. Lo commitea, lo pushea y crea el
   worktree del obrero (`worktree.cjs crear`) y su línea de apertura (`encargo.cjs autorizado`).
3. **Lanza él a los obreros, de fondo** (en segundo plano, con la herramienta Bash y la línea de fondo que imprime `autorizado`; si
   `auto` no se deja, la de respaldo). Un obrero de fondo no manda mensajes: el director se entera porque el proceso terminó, y mira
   git. Solo si el encargo dice `- Apertura: dueño` te da a vos la línea (una sesión nueva, primer mensaje `/obrero <x>--<ID>`).
4. **Silencio**: no contesta los AVANCE ni un aviso sin commit nuevo. Contesta CONSULTAS contra el spec; una PARADA de clase 3 va a
   "Te espera" de la ficha.
5. **Verifica y mergea por script**: ante un CIERRE corre `encargo.cjs verificar` (seis líneas). Si todo pasa → merge, sin
   preguntarte. Si algo falla o sale NO VERIFICADO → nunca merge.
6. **Antes de cada espera larga** deja todo commiteado y subido y el relevo al día en la bitácora: si queda quieto mucho rato la
   plataforma puede resumir la charla, y con el relevo se retoma (ya no se muda a otra sesión por el contexto).
   **Al cerrar cada tramo** (cuándo, lo dice `- Cierre de tramo:` de la ficha; sin el renglón, cada encargo) lanza un **obrero de
   cierre** desde `plantilla-cierre.md`: mide los tiempos (`tiempos.cjs`) y la **alarma** (más de 3 intervenciones tuyas en el tramo),
   y deja la ficha al día (`- Próximo paso:`, `- Tramo: <N> cerrado <fecha>`, lo que te espera). El director lo verifica y lo mergea
   como cualquier encargo: **la ficha no la escribe él**. Por eso el arranque te muestra `tramo 2 cerrado (hace 1 día) · próximo:
   …` (y `/estado`, lo mismo sin la edad), también desde la otra PC. Un **tramo** es el grupo de encargos entre dos cierres: no es
   la skill `/tramo` (§5).
7. **Termina el módulo** con `worktree.cjs integrar <x>`: lo lleva a la rama por defecto. Si la ficha pide tu OK para mergear, te
   pregunta. Hasta la `rc.6` la última línea decía `después: /cierre en tu carpeta principal` y los papeles te esperaban a vos; ahora
   dice `después: noche.cjs cierre <x>` y el director **lanza la sesión de cierre** (§7): cuando termina, te muestra el parte tal cual
   y para. No te da ningún comando.
8. **Un cambio de freno** que nace en el módulo lo propone directo en la rama por defecto (`cambios.cjs nuevo … --en-defecto`) y te
   pide la firma **en su pestaña**: ver §9.

Nunca escribe código, ni resuelve un conflicto (eso es un encargo), ni corre `/cierre`.

## 4. El obrero (`/obrero <x>--<ID>`)

Ejecuta **un** encargo commiteado, en su worktree.

1. **Se presenta** con `encargo.cjs presentar`: si el spec no tiene sello, el encargo no está commiteado o la rama es otra, **para sin
   tocar nada** ("spec sin Arquitecto: corré Modo B"). Si la base ya estaba rota, lo dice en el primer aviso.
2. **Por sub-paso**: prueba en rojo, código, commit, el corrector de afirmaciones (avisa si lo escrito promete de más; no frena), el
   **revisor** y, si hace falta, una corrección acotada. Un AVANCE por commit.
3. **Lo que no está autorizado**: en una pestaña que abriste vos, lo pide (te aparece la ventana); de fondo, de noche o sin ventana,
   si se niega algo que necesita, es PARADA. Nunca un rodeo.
   **De fondo no manda mensajes**: lo que diría (avances, PARADA, CIERRE) queda en sus commits y en la evidencia, y el director lo lee
   cuando el proceso termina.
4. **CIERRE**: la evidencia (qué se probó, con qué comando y su salida; qué no se miró), un commit, push de su rama y el mensaje. No
   corre `/cierre`: verifica y mergea el director.
5. **A `main` no sube nunca**: solo pushea su rama `modulo/<x>--<ID>`. Si lo intenta, el pre-push lo frena ("a la rama por defecto
   sube solo el director"). A `main` llega el módulo entero con `worktree.cjs integrar`, o vos desde tu carpeta principal.

## 5. El tramo (`/tramo <x>--<ID>`)

Como el obrero, pero **no escribe código**: coordina un equipo de subagentes sobre cada sub-paso. Se usa cuando el encargo lo dice
(`Skill: tramo`); documentos, andamiaje o un arreglo acotado van con `/obrero`. Por sub-paso: el **explorador** ubica, el
**implementador** escribe, el tramo congela el commit, el **verificador** corre las pruebas y el **revisor** juzga.

**Los subagentes** viven en `.claude/agents/`, cada uno con su modelo y sus herramientas fijos, y solo se lanzan con una razón:

| Agente | Hace | Modelo |
|---|---|---|
| `explorador` | Ubica archivos y líneas en un árbol grande (no cuenta ni resume) | Haiku |
| `implementador` | Escribe el código de un sub-paso y su prueba; no commitea | Sonnet |
| `verificador` | Corre las pruebas de un sub-paso y devuelve el resultado crudo | Sonnet |
| `revisor` | Revisor frío, sin shell: aprobado, con observaciones o rechazado, hasta 10 hallazgos con su escenario | Opus |
| `lector` | Lee archivos largos y devuelve un resumen con citas de línea | Sonnet |
| `capturas` | Mira capturas de pantalla y devuelve texto | Sonnet |
| `investigador` | Busca un dato puntual en la web, con URL y fecha | Sonnet |

El informe de un subagente es **dato, no verdad**: lo que el sub-paso necesita se vuelve a mirar. Uno que se cortó sin informe "no
entregó" y se reemplaza.

---

## 6. `/estado` — "¿cómo vamos?"

Solo informa: no decide ni pregunta. Las cifras las calcula un script (`estado.cjs`) desde la ficha, `tiempos.md` y git.

- **`/estado`** es tuyo: siempre **cuatro secciones, en este orden**: `TE NECESITO` (la única lista de lo que espera algo de vos:
  los cambios de freno por firmar, lo que dejó esperando publicar, las fusiones del kit, el "Te espera" de las fichas y del handoff,
  los vencidos del TODO y el "Te necesito" del último parte de la noche), `EL PLAN`, `LO QUE SE HIZO` y
  `LO QUE FALTA` (con la mediana de los encargos cerrados; con menos de tres, "no sé todavía": nunca un número inventado). Sin SHAs
  ni comandos. En la pestaña de un módulo, o con `/estado <x>`, la de ese módulo. En tu carpeta principal, antes de mostrarla, borra
  la marca de la noche y cierra las carpetas ya mezcladas (como el `/inicio`).
- **El clic, ahí mismo**: si `TE NECESITO` trae una firma (un cambio de freno, o seguir con una publicación trabada), te ofrece
  hacerla ahí; vos solo apretás en la ventana (§9).
- **El director** usa la suya, la de antes: `estado.cjs --director` (`TE ESPERA` arriba, una línea por módulo activo con su avance
  medido, qué pestañas cerrar, las esperas y el uso de contexto).
- **"¿Cómo terminamos?"** (o a partir de las 18 h): suma **el resumen del día** (`resumen.cjs`), una vez por día.
- **"Agregá tal línea al estado"**: queda en `.claude/estado-lineas.md` y se muestra siempre.
- `avance —` quiere decir que la ficha no tiene tareas de dónde medir. `NO VERIFICADO` se muestra tal cual.

## 7. La noche — "me voy"

Le decís **"me voy"** al director. Sin preguntarte nada corre `noche.cjs me-voy`: deja la marca **`.kit-noche`** en su worktree y te
muestra el checklist (encargos abiertos y su obrero, cuáles no abre él y por eso **paran** de noche, la red, lo que vence, el relevo)
y un bloque fijo: qué necesita de vos ahora · qué queda andando · con qué te vas a encontrar · el checkpoint. Antes deja el relevo al
día (§3, paso 6).

- **De noche** los frenos tratan al director y a sus obreros como **nocturnos**: lo que de día te preguntaría, de noche es PARADA.
- **Ya no hay despertador ni mudanza al 40 %**: el director lanza a los obreros de fondo y se entera cuando el proceso termina, mirando
  git. (`noche.cjs despertador` quedó solo para que una línea vieja no se rompa: dice eso y sale 0.)
- **Cuando volvés**, tu `/inicio` o tu `/estado` en la pestaña principal borran la marca (`noche.cjs volvi`): "ya es de día".

### La noche termina sola: la sesión de cierre

Cuando el director integra el módulo, la carpeta principal ya no queda esperándote. El director corre `noche.cjs cierre <x>` y lanza
de fondo la sesión **`cierre-<x>`**: corre **en tu carpeta principal**, en modo `dontAsk` y con **una lista cerrada** de comandos (lo
que no está en la lista se niega). Sigue `.claude/skills/director/cierre-noche.md`, en este orden:

1. `noche.cjs cierre-empieza <x>`: toma el candado del cierre (dos cierres no se pisan) y mira que la carpeta esté en la rama por
   defecto y sin cambios sin guardar; si no, no toca nada y va derecho al parte.
2. `noche.cjs publicar <x>`: publica **solo si** la ficha lo autoriza (`autorizado.publicar`, `manuales/MOLDE.md` §4) **y** esta PC
   también (el sí por PC, con su huella). Corre las pruebas en la carpeta principal, publica, corre la prueba de humo y, si falla,
   vuelve atrás y la publicación queda **trabada** hasta que decidas. Sale 0 publicó (o no había nada nuevo) · 3 no le toca o te
   espera · 1 falló.
3. El `/cierre` del proyecto, de noche: los papeles (handoff, CHANGELOG, TODO) al día con lo del módulo, commit solo de papeles. Lo que
   pide una firma no corre de noche: va al parte.
4. `worktree.cjs limpiar`: cierra las carpetas de trabajo ya mezcladas; lo que no puede, no lo fuerza.
5. `noche.cjs parte <x>`: escribe **el parte de la noche** en la bitácora del módulo (`<fecha>-parte.md`) con cuatro secciones —
   Qué quedó (integrado · publicado · la prueba de humo · los papeles · las carpetas) · Te necesito · Qué se hizo · Lo que no pude — y
   suelta el candado. Después `noche.cjs subir <x>`, el único push del cierre: **solo papeles**, nunca código.

Nunca aprueba nada, ni toca código, ni publica por otro camino, ni te deja un comando. A la mañana lo ves sin pedir nada: el director
te mostró el parte, y su "Te necesito" aparece en tu `/estado`.

## 8. La mesa — dos proyectos que se hablan

Cuando dos proyectos dependen uno del otro (la ficha tiene `mesa:`), sus directores se escriben **por git**, no por la charla.
`mesa.cjs nuevo` escribe el mensaje como archivo en `docs/modulos/<x>/mesa/`, lo commitea, lo sube y recién ahí da el aviso de una
línea. Tipos: pedido, propuesta, alerta, respuesta. `mesa.cjs abiertos` lista lo que espera respuesta de los dos lados ("te toca",
"esperás", y "trabado por mesa" a los 2 días): lo corre tu `/inicio`. `mesa.cjs acordados` lista las propuestas aceptadas (las usa el
resumen del día). Un obrero no escribe en la mesa. NO VERIFICADO: el envío del aviso por mensaje entre sesiones.

---

## 9. Lo que es solo tuyo

- **Aprobar un cambio de freno**: cuando una sesión propone tocar un freno del proyecto, el cambio queda "propuesto" y aparece en
  **"Te necesito"** (en tu `/estado`) con su regla. Se firma **en la pestaña del director** (lo normal: el director lo propuso ahí) **o
  en tu carpeta principal, en la rama por defecto**, y queda un commit `cambios: aprobado <id>` en la rama por defecto. `cambios aprobar` lo corre la sesión cuando el dueño lo pide, y su clic en la ventana es la firma; nunca por su cuenta.
  Desde un obrero, una sesión de fondo, de noche o en bypass, se niega solo. El registro de cambios a fondo: `manuales/MOLDE.md`.
- **Las otras dos firmas**: que siga una publicación trabada (`noche.cjs publicar <x> --seguir`, la misma ventana) y el sí para que
  un proyecto publique solo desde esta PC (lo pregunta "preparame esta PC": `manuales/EQUIPADOR.md` §1).
- **Las decisiones de clase 3**, y abrir la pestaña de un obrero solo si su encargo dice `- Apertura: dueño`.
- **El OK de integrar** si la ficha del módulo lo pide. Las carpetas de trabajo las cierra sola la limpieza (la sesión de cierre, tu
  `/inicio` y tu `/estado`).

## Dónde seguir

- Cuándo hay director y cómo nace un módulo: `manuales/COMO-USAR-EL-ARQUITECTO.md` §2 y §4
- Los scripts (`encargo`, `worktree`, `noche`, `mesa`, `estado`, `tiempos`…): `manuales/SCRIPTS.md`
- El diseño: `docs/kit-v3/SPEC-paquete-5.md`; la noche que termina sola y el clic: `docs/kit-v3/SPEC-paquete-8d.md`
