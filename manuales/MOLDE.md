# El molde: lo que un proyecto recibe del kit v3

> **Para qué sirve**: cuando un proyecto nace con el kit (o se adopta), el Arquitecto y el Equipador le ponen una "mochila":
> una ficha, una `docs/` ordenada, unos frenos, un registro de cambios. Esta página cuenta qué hay en esa mochila y para qué sirve
> cada cosa. Es lo que ves **dentro de un proyecto**, no del repo del método. Si difiere del kit, manda el kit: `kit/molde/`
> (empezá por su `CLAUDE.md`). Los scripts, uno por uno, están en [`SCRIPTS.md`](SCRIPTS.md).

Lo normal es que no toques nada de esto a mano: lo pone el Arquitecto (proyecto nuevo) o el adoptador del Equipador (proyecto que
ya existe), y lo mantiene el actualizador (`manuales/EQUIPADOR.md`). Lo que sí te toca a vos: leer la ficha de vez en cuando,
aprobar los cambios del método y contestar las cinco preguntas.

---

## 1. La ficha: `.claude/kit.md`

Es el DNI del proyecto frente al kit. **La lee un script**, no una persona: por eso tiene una forma estricta (mapas con sangría de
2 espacios, listas `[a, b]`, valores en texto, nada de comillas simples). El ejemplo comentado está en `kit/molde/kit.ejemplo.md`;
es un ejemplo de la forma, no una ficha para copiar.

| Campo | Qué dice |
|---|---|
| `kit` | La versión del kit con la que está al día el proyecto (la sube el actualizador). |
| `nivel` | `liviano` (sin código) o `estandar` (con código). |
| `vars` | Con qué se armó el molde: `proyecto`, `comando-test`, `comando-setup`, `lenguajes`. Sin esto no se puede regenerar. |
| `piezas` | Cada pieza del molde con su estado (`molde`, `molde+propio`, `adaptada`, `propia`, `sí`, `no`) y su `hash` (12 hexa de lo que escribió el molde). Una `adaptada` o `propia` lleva `por:` (el porqué): con él el actualizador fusiona sola. |
| `frenos` | `opcionales` y `quitados`: cada freno quitado con su `id`, la razón (`por`) y hasta cuándo (`hasta`: una fecha o `siempre`). |
| `autorizado` | Lo que **no** es pregunta en este proyecto (por ejemplo `merge-a-main: con-gate-verde`). |
| `sensible` | Las 5 preguntas de fábrica (§4): `no`, o los comandos que duelen acá. |
| `secretos` · `publicas` | Los **nombres** de las variables secretas y de las que parecen secreto y no lo son. Nunca valores. |
| `herramientas` · `entornos` | Qué herramientas se pueden usar (un chequeo de una línea y si necesita a Guido) y cada entorno (`real`, `prueba` o `dummy`) con las suyas. |
| `datos-de-prueba` · `push-publica` · `aprueba` | Dónde están los datos de prueba, si el push es público, y un alias (nunca un nombre real) de quien aprueba. |
| `mesa` | Los otros proyectos con los que habla este director (§9 de `manuales/ROLES.md`). |
| `multi-llm` | `sí` genera un `AGENTS.md` desde el `CLAUDE.md` (`agents.cjs`). |

Debajo de la cabecera, en prosa: "Cómo se adaptó el kit a este proyecto". **La ficha vigente es la de la rama por defecto**, no la
que tengas en el disco: así nadie se baja un freno editando un archivo en una rama suelta.

**Frenos quitados**: para apagar un freno hay que anotarlo en `frenos.quitados` con razón y fecha. Un `hasta` vencido deja de valer.
Unos pocos no se quitan nunca (las barreras del candado, §5).

## 2. `docs/` en capas

El mapa vive en el `CLAUDE.md` del proyecto (una sola copia). En la raíz de `docs/` hay **seis archivos y tres carpetas**; lo que no
encaja va a `referencia/`.

- `NORTE.md`: qué es la app y para qué. Manda ante la duda. `MAPA.md`: cómo se conecta (opcional).
- `SESSION_HANDOFF.md`: dónde quedamos. `/cierre` lo sobreescribe entero.
- `TODO.md`: **la única fuente de pendientes**. `CHANGELOG.md`: la historia, no se reescribe. `README.md`: la puerta, sin repetir el mapa.
- `modulos/<x>/`: una carpeta por módulo (ficha, `SPEC.md`, encargos, bitácora; el spec más nuevo manda).
- `referencia/`: lo que no cambia a diario (`PRUEBA.md`, `trampas.md`). `archive/`: solo lo muerto.

Un archivo suelto en la raíz de `docs/` que no es de los seis, o una carpeta que no es de las tres, **lo frena el hook de escritura**
(`escritura-docs`, §6) y lo marca el candado (`raiz`).

### Handoff y TODO con tope

- **Handoff: 5.000 bytes como máximo.** Secciones fijas, en orden: `# Handoff` · `## Estado` · `## Próximo paso` · `## Bloqueos` ·
  `## Te espera` · `## En curso` · `## Contexto`. Las del v2 (`Qué se hizo`, `Archivos tocados`) ya no van: eso lo dice git. El
  tope también lo mide el candado (`topes`). Si git dice otra cosa que el handoff, **manda git**.
- **TODO**: cada ítem es `- [ ] …` en la columna 0. Lo que espera algo de afuera lleva `espera hasta: AAAA-MM-DD`. Sin fechas a
  mano: la edad la da git. Lo que lleva 90 días sin tocarse baja solo a 🟢 (salvo 🔴 y los que tienen `espera hasta:`); lo hace
  `todo.cjs cierre` cuando corrés `/cierre`.
- **El hook de arranque inyecta con presupuesto**: en total **9.700 caracteres** (la plataforma corta en 10.000). Cada bloque tiene su
  tope (cabecera, líneas de la ficha, handoff 5.000, módulos, git, TODO…). Lo que no entra se corta en renglón o ítem entero y se
  dice. La última línea de lo inyectado es la huella: `inyectado: N de 9.700`. Si la ves cerca del tope, es hora de podar el handoff.

## 3. Los hooks de Claude (`.claude/hooks/`)

Se registran en el `settings.json` del molde (cada uno con `timeout: 20`). Los que **niegan** llevan `onFailure: "block"`: si el
hook se rompe, frena y dice "freno roto: corré doctor". Los hooks son avisos y frenos de primer nivel, **no una frontera** (un
script armado a propósito los esquiva); la red de verdad es el candado y los githooks.

| Hook | Cuándo corre | Qué hace |
|---|---|---|
| `session-start` | al abrir la sesión | Inyecta el handoff, el TODO, el estado de git y la ficha; deja la marca de sesión; pone `core.hooksPath=.githooks`. **Nunca niega**: si falla, deja pasar. Tiene un plazo de 10 s. |
| `escritura-docs` | antes de un `Write` | Frena el archivo suelto o la carpeta rara en `docs/`. Si falla, deja pasar (su red es el candado). |
| `niega-aprobar` | antes de Bash/PowerShell con "cambios aprobar" | Se niega sin ventana de permiso (§7). |
| `git-seguro` | antes de Bash/PowerShell | Frena el git que borra trabajo o falsifica referencias. |
| `sensible` | antes de Bash/PowerShell | Hace las 5 preguntas (§4). |

`git-seguro` mira cada comando simple (también lo de adentro de `bash -c`). Casos que frena, con su id `hook:git-seguro/<caso>`:
`stash`, `reset-hard`, `clean-f`, `restaurar-arbol`, `push-force`, `push-borrar`, `update-ref`, `branch-f`, `hooks-path`,
`remote-set-url`, `variables-peligrosas` y otros del mismo tipo. Cada mensaje trae la alternativa (por ejemplo, en vez de
`git stash`, un commit de trabajo en curso por rutas). Las excepciones están en el mensaje (el `push --force` solo se permite
sobre ramas `kit/*`).

**Lo propio**: cada hook tolera un hermano `<nombre>.propio.sh` del proyecto. El molde nunca lo pisa.

### Los githooks (`.githooks/`)

Los tres (`pre-commit`, `pre-merge-commit`, `pre-push`) son un `sh` de tres renglones que llama a `kit-githook.cjs`. Hacen dos cosas:

- **gitleaks**: escanean lo que entra (lo staged, o lo que sube el push) en busca de claves. Si falta el escáner, el humano pasa
  **en rojo con aviso**; de noche, el actualizador o un desconocido no pasan.
- **candado de barreras**: corre `estructura.cjs barreras` sobre el índice (commit) o sobre cada commit que sube (push). El
  `pre-merge-commit` no corre el candado: el merge lo juzga el push.

Un hallazgo falso se marca en `.gitleaksignore`, con aprobado. Una clave real no se tapa: se rota (`manuales/se-filtro-una-credencial.md`).

## 4. Las cinco preguntas (`sensible:`)

Lo demás, el proyecto lo resuelve solo: producción incluida, y el merge con el gate verde. Hay **cinco** cosas que sí preguntan,
en la ficha bajo `sensible:`: borrar datos reales · tocar plata · manejar claves · mandar algo afuera a nombre del dueño ·
publicar un release. Cada una es `no` o una lista de comandos; el hook `sensible` pregunta si algún comando **empieza** con
las palabras de la lista (palabra entera: `npm run release-notes` no es `npm run release`). El id de cada una es
`pregunta:<clave>` (la de datos reales: `pregunta:borrar-datos-reales`).

`db migrar` tiene su guardia (`hooks/lib/db-guardia.cjs`): contra un entorno de clase `real` pide un veredicto aprobado del revisor,
y si el SQL borra datos reales, de día pregunta y de noche se niega.

## 5. El candado

`scripts/estructura.cjs` es el chequeo de que el proyecto sigue en forma. Lo corre `/cierre` y los githooks. Son **diez ids**:

| Id | Qué mira |
|---|---|
| `raiz` | Nada suelto en `docs/`; cada módulo tiene su ficha con `Estado:`. |
| `rutas` | Que las rutas que citan los documentos existan. |
| `topes` | El handoff y las fichas activas dentro de su tamaño. |
| `mesa` | Que los mensajes de la mesa tengan su forma. |
| `estados` | Que un módulo `COMPLETO` no tenga su spec o sus tareas abiertas. |
| `lecturas` | Aviso (no frena) de archivos grandes que una skill manda a leer enteros. |
| `estado-viejo` | Que el "Próximo paso" se haya reescrito si hubo cambios de código. |
| `barreras` | Que nadie haya tocado un freno sin un cambio aprobado (§7). |
| `datos` | Que las skills no lleven datos de ningún proyecto. |
| `portada` | Que el README de la raíz esté al día (solo si la ficha prende `piezas.portada`). |

Cada falla dice **qué pasa y qué hacer**. Un id se puede quitar en `frenos.quitados` con `hasta: vigente`, **salvo `barreras`**:
esa no se apaga. Con `piezas.candado: no` corre solo `barreras`. El código está en `hooks/lib/candado.cjs`.

## 6. La zona propia

Lo que escribe el proyecto no lo pisa el molde. Tiene tres formas, según la pieza:

- **En un texto** (un `CLAUDE.md`, una skill): lo que va entre `<!-- kit:propio -->` y `<!-- /kit:propio -->`.
- **En un hook**: el hermano `<nombre>.propio.sh`.
- **En `settings.json`**: la mezcla es regla por regla, entre el molde viejo, el molde nuevo y lo del proyecto.

Ante la duda no se toca: una marca rota o un JSON que no abre frena la actualización y lo dice. Las piezas `molde+propio` son las
que tienen zona propia.

## 7. El registro de cambios (`.claude/cambios/`)

Cuando un proyecto aprende una regla que sirve para todos (o necesita tocar un freno), no la mete a mano: la **registra**. Un
archivo por cambio, `AAAA-MM-DD-<slug>.md`, con la cabecera (clase `2` o `3-barrera`, qué toca, de dónde salió, la cicatriz) y
cuatro secciones: caso de origen, regla, dónde vive, medición.

Los estados, en orden de vida: **propuesto → aprobado → aplicado → subió-al-kit**; o **rechazado**.

- `cambios.cjs nuevo` crea uno; `listar` los muestra; `verificar` revisa que el registro esté sano; `anotar-sha` guarda con qué
  commit se aplicó; `rechazar` lo descarta con motivo; `subio-al-kit` marca que ya está en una versión del kit.
- **`cambios aprobar <id>` es del dueño** (vos). Es el único camino a `aprobado`, y el OK para tocar un freno. Pasa por una ventana
  de permiso, y además se niega solo si lo corre un agente, un modo sin ventana (bypass, de noche), un worktree, una rama que no es
  la por defecto, un archivo sin commitear o con la ficha rota. Ni el director ni un obrero lo corren.
- Los archivos de `.claude/cambios/` no se editan a mano (hay un `deny`): cada cambio de estado lo hace el script y deja su commit.
- La flota agrega: `cambios-flota.cjs` cuenta lo que se repite entre proyectos (`manuales/EQUIPADOR.md`).

## 8. La portada

El `README.md` de la raíz lo arma un **script**, no el modelo: `portada.cjs armar`. Sale de `docs/NORTE.md` ("## Qué es", hasta 3
líneas) y de la ficha. Lleva título, banner (`assets/banner.svg`), qué es, cómo correrlo y los enlaces al NORTE, al MAPA y a `docs/`.
**Sin pendientes, historial ni versión**: eso vive en el TODO, el CHANGELOG y la ficha. Si "Qué es" sigue con el marcador `{{…}}`, no
escribe nada (no inventa). Lo que escribió lleva una marca con su hash: si lo tocaste a mano, no lo pisa. `chequear` es el mismo
chequeo que el id `portada` del candado.

## 9. Los subagentes del molde (`.claude/agents/`)

Siete ayudantes, cada uno con una sola tarea y las herramientas justas. Los lanzan `/tramo`, `/obrero` o el director; vos no los
llamás.

| Subagente | Para qué | Herramientas |
|---|---|---|
| `explorador` | Ubicar archivos y funciones; solo lectura. | Read, Grep, Glob |
| `implementador` | Escribir el código de **un** sub-paso y su prueba en rojo; no commitea. | + Edit, Write, Bash |
| `verificador` | Correr las pruebas y el gate y devolver el resultado crudo. | Read, Grep, Glob, Bash |
| `revisor` | Revisor frío del commit congelado: veredicto y hasta 10 hallazgos. Sin shell. | Read, Grep, Glob |
| `lector` | Leer archivos largos y devolver un resumen con citas. | Read, Grep, Glob |
| `investigador` | Un dato de la web con su URL y fecha. | WebSearch, WebFetch |
| `capturas` | Mirar imágenes y devolver texto. | Read, Glob |

## 10. Las skills del molde (`.claude/skills/`)

`inicio`, `cierre`, `estado`, `director`, `obrero`, `tramo` y el `nucleo` (que no es una skill: lo leen los demás antes de
empezar). Cómo se usan: `manuales/ROLES.md`.

## 11. Lo que no viene en el molde

Las skills globales (`docs-fyd`, `relevamiento`, el Arquitecto y el Equipador) viven en `~/.claude/`, no en el proyecto. El
Equipador las instala y las pone al día (`manuales/EQUIPADOR.md`); `docs-fyd` y `relevamiento` tienen su guía propia
(`HOJA-DE-MANO-relevamiento.md`, y el `SKILL.md` de `docs-fyd`).

---

## Dónde seguir

- Cada script del molde, sus opciones y salidas: [`SCRIPTS.md`](SCRIPTS.md)
- Director, obrero, tramo, la noche y la mesa: [`ROLES.md`](ROLES.md)
- Cómo se instala y se pone al día el molde: [`EQUIPADOR.md`](EQUIPADOR.md)
- Si se filtró una clave: [`se-filtro-una-credencial.md`](se-filtro-una-credencial.md)
