# Misión 6a — el plan (fase 1: inventario, costo y plan)

> Primera parte del ciclo de mejora del método (TODO, "Misión 6"). La 6b, corta, cuando cierre el primer módulo de Hermes.
> Fase 1 = medir sin leer chats; **sigue cuando Guido elige la opción de lectura** (§3). 2026-11-03.

## 1. Inventario del corpus (`vibe-research`, condensados)

| Misión | Chats | KB | PCs | Ya leído con otra lente |
|---|---:|---:|---|---|
| M1 · el spec de la investigación | 1 | 113 | clientes | — |
| M2 · la investigación | 2 | 199 | clientes, notebook | — |
| M3 · ordenar el repo (+ plan M4) | 2 | 100 | clientes | — |
| M4 · diseño (tramos 1-5) | 17 | 1.245 | las tres | en parte: hábitos (7 chats de vibe-kit en `Usuario`) y contraste (8 en `clientes`) |
| M4½ · ordenar la casa | 1 | 44 | clientes | — |
| M5 · construir (D1.1 a D8.1) | 19 | 1.560 | clientes, Usuario, Draco | **nada** |
| Sueltos (pulls, arranques cortados, julio) | 9 | ~55 | — | no hacen falta |

**42 chats de misión, 3,26 MB.** `FALTAN.md`: no falta nada; los chats de hoy después de D8.1 (el repaso, D8b.1, esta) suben con su `/cierre`.
Los subagentes no están condensados (a propósito): su costo sí, en `costos.csv`.

**Ya destilado, no se relee**: las actas `tips/tanda-2026-10-chats`, `-habitos` y `-11-contraste` (miran a Guido y las decisiones A-H, no
el proceso de las misiones); la biblioteca de la M2; `docs/mision-4/` (PLAN §Lecciones, 11 criterios, TABLERO); el tracker (§Lecciones,
§Cambios al plan, las 9 secciones "Decisiones sin Guido"); `DECISIONES-SIN-GUIDO-en-criollo.md`; el CHANGELOG; ADR-021, 025, 026, 028-030.

## 2. Lo que costó, sin leer un chat

Tokens **nuevos** (chat principal + subagentes; la caché aparte) del `DIARIO-MISIONES.md` y los `costos.csv`:

| Misión | Fechas | Sesiones | Nuevos | Lo grande |
|---|---|---:|---:|---|
| M1 | 12/10 | 1 | ~0,9 M | — |
| M2 | 12-13/10 | 2 + 81 lectores | ~38 M | los lectores (~37 M) |
| M3 | 13/10 | 2 | ~1,3 M | — |
| M4 | 14-27/10 | 17 | ~44 M | la lectura de contraste (~28 M) |
| M4½ | 27/10 | 1 | ~0,6 M | — |
| M5 | 28/10-3/11 | 19 | ~34 M | D2.1 (7,4 M de subagentes), D3.3 |

**Por paso** (la primera versión de "cuánto costó cada paso"):

| Paso | Qué entra | Nuevos | Horas |
|---|---|---:|---|
| Investigar | M1, M2, M4 tramos 1-3, hábitos, contraste | **~69 M** (66 M son lectores de chats) | no medidas |
| Ordenar la casa | M3, M4½ | ~1,9 M | no medidas |
| Diseñar con Guido | M4 tramos 4-5 (racimos, revisión integral, SPEC-0) | ~14 M | no medidas |
| Construir | M5 | ~34 M | **~32 h de reloj** en los 10 directores que las anotaron |
| Medir | la corrida mensual (3/11) | ~0 | ~25 min |

**Lo que se ve:** leer chats es más de la mitad de todo (~66 de ~119 M); diseñar con Guido, lo más caro en atención, es de lo más barato
en tokens; construir bajó a ~2 M y ~3 h por director después del ADR-029 (D3.3 había llevado 18 h de agentes).

**Tres agujeros en los números** (para el documento, no para leer chats):
- **D3.3**: el tracker y el ADR-029 dicen 21 M nuevos; el diario, ~2,5 M de subagentes. Dos definiciones de "nuevo".
- **Racimos A, C y E**: el diario dice "no registrado", pero el `costos.csv` de la notebook los tiene (~0,8 y ~1,3 M).
- **Subagentes de los racimos en `Usuario`** (B, D, F, G, H): no registrados; los revisores fríos de esos racimos (~150-300 mil cada uno)
  están solo en el PLAN de la M4. El diseño real está por arriba de 14 M.

→ El ciclo tiene que fijar **una sola medida** ("nuevos" = entrada + escritura de caché + salida, principal + subagentes) y quién la anota.

## 3. El costo de leer (medido con `recortar.py` sobre el corpus)

Base: METODO.md, lotes de ~200 KB, **~250 mil por lector Sonnet** (lo que costó en la M4 con un `ya-sabido` de 112 KB; acá el
`ya-sabido` sería este plan y las lecciones, ~30 KB) y una síntesis Opus.

| Opción | Qué se lee | Tamaño | Lotes | Costo | Contesta | No contesta |
|---|---|---:|---:|---:|---|---|
| **A · Todo** | los 42 chats enteros | 3,26 MB | ~17 | **~4-5 M** | todo, también por qué tardó cada cosa | nada, pero repite parte de M4 ya leída con otra lente |
| **B · Muestra** | ~9 chats enteros: M1, M2, M3, racimo D, revisión integral 2, tramo 5, D2.2, D3.3, D8.1 | ~1,1 MB | ~6 | **~1,6-1,8 M** | a fondo una sesión típica de cada paso | lo que pasa entre sesiones; un patrón que se repite en las que no entraron |
| **C · Recortado** (`--modo contraste`) | los 42: mensajes de Guido enteros (420), 1ª línea de Claude, mensajes director↔encargo enteros (273) | 670 KB | 4 | **~1,1-1,3 M** | qué pidió Guido, dónde corrigió o dio vueltas, cuántas veces, cómo fue cada encargo y qué volvió | el razonamiento de Claude y el detalle técnico de por qué algo tardó |
| C' · Solo Guido (`--modo habitos`) | los 42, solo sus mensajes | 308 KB | 2 | ~0,6 M | qué le costó a Guido | todo lo de la M5, que fue casi sin él (director↔encargos) |

**Recomendada: C.** Los costos ya salen gratis de los números (§2); lo que falta saber es *cómo* se trabajó, y eso está en lo que dijo
Guido y en lo que se dijeron director y encargos. Cuesta ~5% de la lectura de contraste y cubre
las 5 misiones, M5 incluida (que nunca se leyó). Si un hallazgo pide detalle, se relee **ese** chat entero (la regla de los ★ de la M4).

## 4. El plan del documento

**Dónde vive: `docs/CICLO-DE-MEJORA.md`**, una sola página-receta (no skill: se corre cada 3-4 meses). Fila en `docs/README.md`, en "El
norte": *"El ciclo de mejora del método: cuándo arranca una vuelta, sus 5 pasos, qué sale y cuánto cuesta cada uno, y las plantillas"*.
METODO.md queda como el detalle del paso 1 (anti-espejo: el ciclo apunta, no copia). `docs/mision-6/` guarda solo este plan y el de la 6b.

| § | Sección | De dónde sale | Lee chats |
|---|---|---|---|
| 1 | Para qué y qué NO es (receta, no skill; el observatorio mide, la madre aplica) | ADR-021, 025, CLAUDE.md | no |
| 2 | El reloj: cada 3-4 meses, con la versión nueva andando en un proyecto real; las urgencias como parche | ADR-025, 026 | no (la fecha, 6b) |
| 3 | Los 5 pasos, una tabla: qué entra, qué sale, quién (modelo), cuánto cuesta | §2 de este plan, METODO, PLAN M4, tracker | no |
| 3.1 | Investigar: scripts y **registros de cambios antes que chats**, `ya-sabido`, lectores con techo, acta | METODO, SPEC-investigacion, lecciones M4 | no |
| 3.2 | Ordenar la casa: qué se ordena y por qué antes de diseñar | M3, M4½ (CHANGELOG) | **sí, poco** |
| 3.3 | Diseñar con Guido: racimos con los 11 criterios, revisor frío por racimo, revisión integral, spec con red team | PLAN M4 | **sí** |
| 3.4 | Construir: un director por paquete, presupuesto (ADR-029), la vara sin Guido (ADR-030) | tracker, ADR-028-030 | **sí** (M5) |
| 3.5 | Probar en un proyecto real y medir | — | **6b** |
| 4 | Cómo trabajamos de verdad: dónde se dio vueltas, qué le costó a Guido, qué anduvo solo | — | **sí: es la lectura** |
| 5 | Lo que costó la vuelta 1 y la medida única de tokens | §2 | no |
| 6 | Lecciones de la vuelta 1, ordenadas por paso (hoy ~40 sueltas en dos archivos) | PLAN M4 §Lecciones, tracker §Lecciones | completa con §4 |
| 7 | Plantillas: SPEC de investigación, PLAN de diseño (con los 11 criterios), tracker de construcción, fila del diario | SPEC-investigacion, PLAN M4, tracker | no |
| 8 | La fecha de corte y el diario de la vuelta siguiente | CORTE.md, METODO | **6b** |

**Queda para la 6b**: §3.5 con lo que pase en Hermes (los `rc.N`, la medición contra TABLERO §1), §2 y §8 con la fecha real de la
próxima vuelta, y el costo del paso "probar". **Después de la 6a**, `FALTAN.md` se puede borrar (lo dice él mismo).
