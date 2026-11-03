# Los roles: director, obrero, tramo, `/estado`, la noche y la mesa

> **Para qué sirve**: cuando un módulo es grande (varias tareas a la vez, o querés que siga de noche sin vos), no lo hace una sola
> sesión: hay un **director** que reparte y **obreros** que construyen, cada uno en su carpeta y su rama. Esta página cuenta quién hace
> qué, cómo ves en qué andan (`/estado`), cómo te vas a dormir ("me voy") y cómo hablan dos proyectos (la mesa). Si difiere del
> kit, manda el kit: `kit/molde/skills/{nucleo,director,obrero,tramo,estado}/`.

Todo esto viene con el **molde v3** (un proyecto con `.claude/kit.md`). Lo normal sigue siendo **una sola sesión**: `/inicio`, el
pedido, `/cierre`. El director aparece solo si el Arquitecto lo decidió en Modo B (`manuales/COMO-USAR-EL-ARQUITECTO.md` §2).

---

## 1. El día normal: `/inicio` y `/cierre`

- **`/inicio`**: cruza lo que inyectó el hook de arranque con git y te confirma en tres líneas (estado · próximo paso · bloqueos). Te
  avisa los cambios aprobados nuevos, los mensajes de la mesa, los módulos sin sello y las fusiones del kit que te esperan (una sola
  pregunta). Con tu pedido en el mensaje, **la primera línea es el tamaño**: chico lo hace; más que chico llama al Arquitecto.
- **`/cierre`**: docs al día (el handoff con tope, "Te espera"), el candado en verde, commit y push. Solo en la rama por defecto.

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

La sesión que dirige un módulo con director. Abre en el worktree del módulo (la línea `code "<ruta>"` que te dio el Arquitecto) y
arranca con `inicio — ejecutá docs/modulos/<x>/SPEC.md`.

1. **Chequea el sello** del spec (`encargo.cjs presentar --spec`). Sin sello no reparte: llama al Arquitecto en Modo B corto.
2. **Arma cada encargo** desde la plantilla, **por referencia** al spec (nunca resumido): modelo y esfuerzo con razón, `Riesgo: alto` si
   toca datos reales, permisos, plata, producción o login, lo `AUTORIZADO` estrecho y el `GATE`. Lo commitea, lo pushea y crea el
   worktree del obrero (`worktree.cjs crear`) y su línea de apertura (`encargo.cjs autorizado`).
3. **La apertura del obrero la hacés vos** por defecto, con la línea que te da; él lanza solo si se lo pedís o el encargo lo dice.
4. **Silencio**: no contesta los AVANCE ni un aviso sin commit nuevo. Contesta CONSULTAS contra el spec; una PARADA de clase 3 va a
   "Te espera" de la ficha.
5. **Verifica y mergea por script**: ante un CIERRE corre `encargo.cjs verificar` (seis líneas). Todo verde → merge del SHA, sin
   preguntarte. Rojo o NO VERIFICADO → nunca merge.
6. **Se muda a ~40 % de contexto** (la cifra la da `contexto.cjs`, no su cabeza): deja un relevo commiteado y uno nuevo sigue desde ahí.
   Al cerrar cada tramo mide los tiempos (`tiempos.cjs`) y la **alarma** (más de 3 intervenciones tuyas en el tramo).
7. **Termina el módulo** con `worktree.cjs integrar <x>`: lo lleva a la rama por defecto. Si la ficha pide tu OK para mergear, te
   pregunta. Después te da la línea para cerrar el worktree.

Nunca escribe código, ni resuelve un conflicto (eso es un encargo), ni corre `/cierre`.

## 4. El obrero (`/obrero <x>--<ID>`)

Ejecuta **un** encargo commiteado, en su worktree.

1. **Se presenta** con `encargo.cjs presentar`: si el spec no tiene sello, el encargo no está commiteado o la rama es otra, **para sin
   tocar nada** ("spec sin Arquitecto: corré Modo B"). Si la base ya estaba rota, lo dice en el primer aviso.
2. **Por sub-paso**: prueba en rojo, código, commit, el corrector de afirmaciones (avisa si lo escrito promete de más; no frena), el
   **revisor** y, si hace falta, una corrección acotada. Un AVANCE por commit.
3. **Lo que no está autorizado**: de día lo pide (te aparece la ventana); de noche o sin ventana, es PARADA. Nunca un rodeo.
4. **CIERRE**: la evidencia (qué se probó, con qué comando y su salida; qué no se miró), un commit, push de su rama y el mensaje. No
   corre `/cierre`: verifica y mergea el director.

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

- **`/estado`** en la pestaña principal: la vista corta del proyecto. **`TE ESPERA` arriba**, después una línea por módulo activo con
  su avance medido, qué pestañas podés cerrar, las esperas con su fecha y el uso de contexto. En la pestaña de un módulo, o con
  `/estado <x>`, la vista de ese módulo.
- **"¿Cómo terminamos?"** (o a partir de las 18 h): suma **el resumen del día** (`resumen.cjs`), una vez por día.
- **"Agregá tal línea al estado"**: queda en `.claude/estado-lineas.md` y se muestra siempre.
- `avance —` quiere decir que la ficha no tiene tareas de dónde medir. `NO VERIFICADO` se muestra tal cual.

## 7. La noche — "me voy"

Le decís **"me voy"** al director. Sin preguntarte nada corre `noche.cjs me-voy`: deja la marca **`.kit-noche`** en su worktree y te
muestra el checklist (encargos abiertos y su obrero, cuáles abrís vos y por eso **paran** de noche, la red, lo que vence, su contexto)
y un bloque fijo: qué necesita de vos ahora · qué queda andando · con qué te vas a encontrar · el checkpoint. Si está pasado de ~40 %,
se muda antes de que te vayas.

- **De noche** los frenos tratan al director y a sus obreros como **nocturnos**: lo que de día te preguntaría, de noche es PARADA.
- **El despertador** (`noche.cjs despertador`) mira git y avisa solo si hay una PARADA o un commit nuevo. **Cómo despierta de verdad
  al director está NO VERIFICADO** (lo mira el piloto).
- **Cuando volvés**, tu `/inicio` o tu `/estado` en la pestaña principal borran la marca (`noche.cjs volvi`): "ya es de día".

## 8. La mesa — dos proyectos que se hablan

Cuando dos proyectos dependen uno del otro (la ficha tiene `mesa:`), sus directores se escriben **por git**, no por la charla.
`mesa.cjs nuevo` escribe el mensaje como archivo en `docs/modulos/<x>/mesa/`, lo commitea, lo sube y recién ahí da el aviso de una
línea. Tipos: pedido, propuesta, alerta, respuesta. `mesa.cjs abiertos` lista lo que espera respuesta de los dos lados ("te toca",
"esperás", y "trabado por mesa" a los 2 días): lo corre tu `/inicio`. `mesa.cjs acordados` lista las propuestas aceptadas (las usa el
resumen del día). Un obrero no escribe en la mesa. NO VERIFICADO: el envío del aviso por mensaje entre sesiones.

---

## 9. Lo que es solo tuyo

- **Aprobar un cambio de freno**: cuando una sesión propone tocar un freno del proyecto, el cambio queda "propuesto" y aparece en
  **"Te espera"** del handoff con su regla. Se aprueba con `cambios.cjs aprobar <id>` **en la pestaña principal, en la rama por
  defecto**: aparece la ventana de permiso y **tu clic es la firma** (queda un commit `cambios: aprobado <id>`). Desde la pestaña de un
  director, un obrero, de noche o en bypass, se niega solo. El registro de cambios a fondo: `manuales/MOLDE.md`.
- **Abrir las pestañas** de los obreros (la línea que te da el director), y las decisiones de clase 3.
- **El OK de integrar** si la ficha del módulo lo pide, y cerrar el worktree al final (la línea que te da el director).

## Dónde seguir

- Cuándo hay director y cómo nace un módulo: `manuales/COMO-USAR-EL-ARQUITECTO.md` §2 y §4
- Los scripts (`encargo`, `worktree`, `noche`, `mesa`, `estado`, `tiempos`…): `manuales/SCRIPTS.md`
- El diseño: `docs/kit-v3/SPEC-paquete-5.md`
