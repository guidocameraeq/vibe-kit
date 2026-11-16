# Tandas de versiones del kit v3 — el log

> Una sección por **tanda**: el tramo de trabajo que lleva al kit de una versión a la siguiente. Dice cuándo fue, qué se corrió y cómo
> nos fue, de un vistazo. Lo pidió Guido el 2026-11-16. **No repite**: el detalle de cada sesión está en `../CHANGELOG.md`, el de cada versión
> en `kit/CHANGELOG.md`, y cada paso en su informe. Los chats enteros y los costos están en el repo privado de investigación, con la misma
> tanda. **La tanda nueva va arriba.**

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
