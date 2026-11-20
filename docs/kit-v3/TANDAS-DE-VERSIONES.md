# Tandas de versiones del kit v3 — el log

> Una sección por **tanda**: el tramo de trabajo que lleva al kit de una versión a la siguiente. Dice cuándo fue, qué se corrió y cómo
> nos fue, de un vistazo. Lo pidió Guido el 2026-11-16. **No repite**: el detalle de cada sesión está en `../CHANGELOG.md`, el de cada versión
> en `kit/CHANGELOG.md`, y cada paso en su informe. Los chats enteros y los costos están en el repo privado de investigación, con la misma
> tanda. **La tanda nueva va arriba.**

---

## Tanda 3 — de la v3.1.0 a la v3.2.0 (2026-11-20, un día)

El PO, el turno a la vista, el panorama y "probar una idea nueva". Diseño, dos specs y construcción en una sola sesión directora
(Fable), con tres sesiones Opus en paralelo. Sin compuerta, banco ni `rc`, por decisión de Guido (ADR-044).

### En números
| Qué | Cuánto |
|---|---|
| Versiones | una (`3.2.0`, final, "en piloto") |
| Sesiones | 1 directora + 3 de construcción en paralelo (~1 h cada una) |
| Lectores y revisores | 11 subagentes de lectura · 1 revisor frío del diseño · 2 red team de spec · 1 revisor frío del código |
| Suite | una, entera y sola: 3.476 pruebas, 50 min, una roja (expectativa vieja) |
| Flota de prueba | dos vueltas de ~18 min (la primera encontró un bug real) |

### Cómo nos fue
- **Preguntarles a las sesiones vivas** qué hacían fue la mejor fuente del diseño: evidencia en minutos.
- **El red team de cada spec cambió el diseño** (tres y un hallazgo que bloqueaban): valió su media hora cada uno.
- **En paralelo anduvo** porque cada sesión tenía su lista de archivos y la directora integró copiando, no mergeando.
- **Costó**: las carpetas de trabajo de la app chocaron con el guardia `git-seguro` (dos de tres no podían commitear, y una sesión
  lo rodeó). Y la estimación: "3 horas" fueron unas 5 de reloj, con un corte por el viaje.
- **La flota de prueba encontró lo que la suite no ve**: una prueba del molde que miraba fuera del molde.
- **Para la próxima**: decirles de entrada a las sesiones en paralelo que no commiteen · probar "cómo se prende" toda pieza
  opcional nueva antes de escribirlo en la nota · el banco sigue debiendo una vuelta sobre copias de repos reales.

## Tanda 2 — de la `v3.0.1` a la `v3.1.0` (2026-11-19 al 20)

Misión 7, primera mitad: `reflexion` y el buzón. Lo construyó la PC del probador de la beta, con el OK de Guido para trabajar en `main`;
la versión la sacó la PC `Usuario`. **Salió final sin `rc` ni banco**, por excepción y con su razón (ADR-041); el PO y "probar una idea
nueva" pasaron a la 3.2.

### En números

| Qué | Cuánto |
|---|---|
| Versiones publicadas | **1**: **`v3.1.0`** (20/11), con su página en GitHub |
| Sesiones | 7: `reflexion`, el diseño del buzón, su spec, dos de construcción (PC del probador), la versión y la auditoría Fable (`Usuario`) |
| Suites enteras | 1 (64 min, en paralelo con otras cosas): 6 rojas; 5 pasan solas (carga) y 1 real (abajo) |
| Revisiones antes del tag | El revisor frío (Opus, 6 hallazgos, ninguno bloqueante) y la mirada del sistema (Fable, [`AUDITORIA-3.1.md`](AUDITORIA-3.1.md)) |
| Flota de prueba | 2 vueltas sobre alfa, beta y gama: mezclados y después al día, salida 0 |

### Paso a paso

| Fecha | Paso | Cómo salió |
|---|---|---|
| 19/11 | `reflexion`, con su prueba con y sin la skill (ADR-036) | Sin la skill, 3 de 3 escribían sin preguntar |
| 19/11 | El buzón: diseño, spec con red team, construcción en dos sesiones (ADR-037 a ADR-040) | Red team del código con dos críticos arreglados; mutación 55/55 |
| 20/11 | La decisión con Guido: final hoy, el PO y la idea nueva a la 3.2 | ADR-041 |
| 20/11 | El revisor frío, la auditoría Fable y la suite, en paralelo | "Visto bueno con condiciones": la nota honesta, la excepción escrita y los hooks probados en una PC real |
| 20/11 | Los hooks por PC instalados en `Usuario`, con dos sesiones de prueba | El corrector frena; el aviso no molesta |
| 20/11 | La flota de prueba, el tag y la página de la versión | `v3.1.0` |

### Cómo nos fue

- **La suite encontró algo que ninguna revisión vio**: con una cuenta de Windows de 22 caracteres o más, `dir /q` la corta y el aviso no
  puede verificar (del lado seguro). En la PC del probador pasaba; en `Usuario`, no. **Para la próxima**: las pruebas que dependen de la
  cuenta corren en las dos PCs antes del tag.
- **Abrir una sesión en Fable desde una en Opus no se puede**: arranca en Opus sin avisar. Se resolvió cambiándole el modelo y relanzando
  el turno (`set_session_model` vale desde el turno siguiente).
- **La versión entera en un día** (~6 h de reloj, del pull al release), porque el código ya venía revisado y lo nuevo es opcional.

---

## Tanda 1 — de la `rc.6` a la `v3.0.1` (2026-11-10 al 16)

PC `Usuario`, misión 5, el tramo final ([`TRAMO-FINAL-PLAN.md`](TRAMO-FINAL-PLAN.md), tracker en
[`PLAN-construccion.md`](PLAN-construccion.md)). Lo llevó un director con las sesiones en fila; desde el 15/11 las sesiones
quedaban abiertas en espera y el director las activaba sin el clic de Guido (ADR-035). Guido decidió lo de diseño.

### En números

| Qué | Cuánto |
|---|---|
| Versiones publicadas | **4**: `v3.0.0-rc.7` (14/11), `v3.0.0-rc.8` (15/11), **`v3.0.0`** y el hotfix **`v3.0.1`** (las dos el 16/11) |
| Sesiones | 18: 5 de preparación y de la revisión de la `rc.7`, y 13 del tramo (spec, tandas A, B y C, R2, ciclo, dos bancos, la `rc.8`, la v3.0, el director) |
| Suites enteras | 3: `rc.7` (3.236 casos), `rc.8` (3.264 de 3.265), `v3.0.1` (3.272 de 3.273); la que falla es de tiempo bajo carga y sola pasa |
| Revisión integral | 1, R2 ([`REVISION-INTEGRAL-rc7.md`](REVISION-INTEGRAL-rc7.md)): 5 grandes y ~21 chicos |
| Bancos de prueba | 2, sobre copias de los 26 repos de la cuenta ([`BANCO-rc7.md`](BANCO-rc7.md), [`BANCO-rc8.md`](BANCO-rc8.md)) |
| Noches de prueba enteras | 5, más la noche corta de confirmación (16 min). **Ninguna necesitó a Guido** |

### Paso a paso

| Fecha | Paso | Cómo salió |
|---|---|---|
| 10-11/11 | La PC preparada; la revisión de la `rc.7` en tres miradas y la charla con Guido | "Todo a la rc.7"; el tramo final planeado |
| 12-14/11 | El spec ([`SPEC-paquete-8d.md`](SPEC-paquete-8d.md)) y las tandas A, B y C → **`rc.7`** | La noche que termina sola, `/estado`, el clic, adoptar sin romper; la flota de prueba agarró dos bugs antes del tag |
| 14-15/11 | **R2**, con una noche de prueba en un clon de un repo real | 4 encargos en 43 min, pero el cierre se negó → hace falta una `rc.8` |
| 15/11 | El ciclo de mejora rehecho con lo vivido ([`../CICLO-DE-MEJORA.md`](../CICLO-DE-MEJORA.md)) y el banco de la `rc.7` | El banco agarró dos grandes nuevos (un repo sin pruebas, los hooks de la PC viejos sin aviso) |
| 15-16/11 | **`rc.8`** ([`SPEC-paquete-8e.md`](SPEC-paquete-8e.md)) y el banco otra vez | Todo corregido; sale la v3.0 con los hooks de la PC al día y una noche corta, que pasó |
| 16/11 | **`v3.0.0`**, con el OK de Guido | El código de la `rc.8` más tres renglones de texto |
| 16/11 | La madre adopta el kit → **`v3.0.1`** | Al adoptar, se le pisaba el arranque propio; hotfix con pruebas, revisor frío y suite, el mismo día |
| 16/11 | La ordenada del repo y este log | La página de la versión en GitHub, las ramas viejas afuera, las fechas del ciclo arriba del TODO; el freno del árbol de `docs/` quitado en la madre con el aprobado de Guido (frenaba todo archivo nuevo) |

### Cómo nos fue

**Lo que anduvo:**
- **El director con sesiones en espera** sacó el tramo sin que Guido apretara botones de noche.
- **Probar en copias de los repos reales** (el banco) y **una noche de verdad** (R2) encontraron lo que las pruebas no ven.
- **El hotfix siguió el ciclo** y salió en el día.

**Lo que costó:**
- **Una `rc` de más**: la `rc.7` se dio por candidata antes de probarla en un repo real.
- **La suite tarda ~90 min.**
- **La app ignora sin avisar un modelo más caro** al abrir una sesión.
- **El clasificador del modo `auto`** frena a veces pasos de configuración.
- **Dos fallas de la adopción las agarró la madre, no el banco**: se le pisaba el arranque propio (la `v3.0.1`), y con `docs: no` el
  freno del árbol de `docs/` igual quedaba prendido (en el TODO).

**Para la tanda siguiente:**
- Ningún candidato sin una noche entera en una copia de un repo real.
- Sumar al banco un repo con arranque propio y otro con su propio orden de `docs/`.
- Adoptar en la madre antes del tag.
