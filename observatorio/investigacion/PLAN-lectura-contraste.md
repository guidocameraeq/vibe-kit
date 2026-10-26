# Plan · la lectura de contraste (PC clientes) — ✅ CORRIDA el 2026-10-26

> Segunda lectura de los chats, distinta de la de octubre: no barre por temas, **contrasta** los chats con
> las decisiones de los racimos A-H (`LECTOR-contraste.md`, tres lentes: contraste, hábitos, huecos, más la
> sección abierta "otras cosas"). Receta base: `observatorio/investigacion/METODO.md`. Corrió en la PC `clientes`
> el 2026-10-26, en una sesión del observatorio aparte de la madre. **Acta: `tips/tanda-2026-11-contraste.md`.**
> Abajo, el plan tal como se escribió; al final, **"Lo que de verdad pasó"** con lo que se apartó y por qué.

## Qué se reusa y qué es nuevo
- **Se reusa**: los condensados de la primera pasada en `D:\vibe-hallazgos\` (hasta el corte
  **2026-10-12 21:59 UTC**), `ya-sabido.md`, `lotes.py`, gitleaks. Se trabaja sobre una **copia** en la
  carpeta de trabajo; lo de `D:\vibe-hallazgos\` no se toca.
- **Se condensa solo lo nuevo**: `condensar.py --pc clientes --desde <corte> --excluir <esta sesión>`,
  con la prueba de 3 chats contando a mano los mensajes de Guido (METODO paso 1).
- **El recorte ya existe y tiene su modo**: `recortar.py --modo contraste` (agregado y probado el 2026-10-26 en la PC `clientes`):
  los `### DE <x> (mensaje entre sesiones)` (director↔obrero, la mesa) quedan **enteros** (o hasta `--bytes-mensaje` cada uno);
  las `(respuesta de tarea entre sesiones)` (informes que vuelven) quedan con sus primeras 5 líneas; y dentro de las respuestas de
  Claude se conservan las marcas `[SendMessage → x]`, `[Agent …]`, `[Skill x]` y `[AskUserQuestion]`. **Prueba con 3 chats** (semilla 7,
  dos de Mobile y uno de Desktop): mensajes de Guido 9/9, 3/3, 28/28 · entre sesiones 34/34, 5/5, 44/44 · cuerpos idénticos al condensado.
  **Carpeta de trabajo ya armada**: `D:\vibe-research\clientes\contraste\` (copia de los 1.175 condensados hasta el corte; fuera de todo repo).

## La entrada, recortada por default
- Queda: el encabezado · `### GUIDO` entero · `### DE <sesión> (mensaje entre sesiones)` entero · la primera línea de cada
  `**CLAUDE**` · las marcas `[SendMessage → x]` (solo la marca: el condensado no guarda su texto, solo el tamaño), `[comando /x]`,
  `[Skill x]`, `[Agent …]`, `[AskUserQuestion]`. Se van las demás líneas de herramienta y los chats de subagentes.
- Alcanza para las lentes A y B (casi todo se cuenta en lo que dice Guido y en lo que viaja entre
  sesiones). **La lente C puede necesitar más**: el lector marca `Necesita texto completo: sí (<archivo>)`
  y la síntesis relee **solo esos** chats desde el condensado completo, con techo (ej.: 15 chats).

## El costo (lo decide Guido con el número en la mano)
- Fórmula de METODO: **gasto real ≈ 3× el contenido** (relectura en cada paso, casi toda en caché).
  Referencia de octubre: 8,2 M de contenido → 25 M reales, 81 lectores.
- **Medido el 2026-10-26** sobre los condensados de `clientes` hasta el corte (229 chats con mensajes de Guido, 3.001 mensajes suyos,
  3.594 entre sesiones; falta sumar lo nuevo desde el 2026-10-12, a ojo +10-15%). Los mensajes entre sesiones son el grueso del peso:
  un encargo de director pesa 2-10 KB en pocas líneas. El script imprime dos cotas (el piso de 120 mil por lector, medido en la tanda
  de hábitos; y 3× el contenido + 60 mil fijos por lector) y la síntesis Opus va aparte (~1-1,5 M):

  | Modo | Contenido | Lotes de 200 KB | Lectores | Qué se pierde |
  |---|---:|---:|---|---|
  | `contraste`, mensajes enteros | 9,2 MB (~2,4 M tokens) | 59 | **~7-11 M** | nada |
  | `contraste --bytes-mensaje 1500` | 7,2 MB (~1,8 M) | 44 | ~5-8 M | la cola de los encargos largos (A-3 ve menos) |
  | `habitos` (solo marcas) | 2,5 MB (~0,65 M) | 15 | ~2-3 M | la lente A no puede juzgar G-* ni D-6 |

  Referencia: la lectura de octubre costó 25 M con 81 lectores. Con lotes de 90 KB serían 108 lectores y manda el piso (~13 M): por eso 200 KB.
- **La lente B absorbe la pasada de hábitos de `clientes`** (el §6 de `tips/tanda-2026-10-habitos.md`): una sola pasada, que cruza
  contra esa acta. Propuestas nuevas desde **P63**.
- **El número de verdad lo imprime el script después del recorte**, y se le muestra a Guido antes de
  lanzar nada. Si hay que ahorrar: lotes más chicos, solo las familias con director (Hermes, Deptos), o
  muestreo declarado con semilla fija.

## Lo que decidió Guido al lanzarla (2026-10-26)
- **Mensajes enteros, lotes de 200 KB** (la fila 1 de la tabla: ~8-12 M con la síntesis).
- **"Ya que vamos a hacer esto, relevar más información que la mínima, a ver si encontramos otras cosas útiles"**: además de las
  tres lentes, cada lector deja una **cuarta sección abierta, "Otras cosas que llamaron la atención"** (hasta 5 ítems por lote, con
  chat y ejemplo corto, sin contenido de negocio): fricciones, trucos que le funcionaron, cosas que pidió y no existen, lo que un
  diseño no previó. La síntesis C las junta y las ordena por repetición; lo que aparece 3+ veces entra al acta como hallazgo propio.
  El LECTOR se ajusta (tope ~12 KB sigue valiendo).

## Los pasos
1. `/inicio` + misión · leer `CORTE.md` · OK explícito de Guido para la **Workflow** · carpeta de trabajo
   fuera de todo repo.
2. Condensar lo nuevo (`--desde`) · escribir y probar el recorte · gitleaks sobre lo recortado.
3. **Presupuesto**: el número a Guido; decide él.
4. `ya-sabido.md` **al día** (un Sonnet: suma lo de la tanda de octubre y lo de los racimos).
5. **Lectores Sonnet por lote** (Workflow), cada uno con `LECTOR-contraste.md` + `ya-sabido.md` + su
   lista. Un archivo por lote; devuelven solo el objeto de conteos. Verificar: un archivo por lote,
   las tres secciones, gitleaks sobre `hallazgos/`.
6. **Síntesis Opus, una por lente**: A suma por decisión y revisa los ejemplos · B junta con la pasada
   de hábitos que corre en la PC `Usuario` (viaja solo su mini-síntesis, por el canal privado) · C
   cruza contra `ya-sabido.md` y los `DISENO-*.md` completos antes de llamarlo hueco.
7. **Acta `tips/tanda-2026-11-contraste.md`**: §0 (corte, costo, límites) + **tres tablas**:
   contraste (decisión · veredicto · ✔ · ✘ · lotes · ejemplo · qué tocaría en el diseño) · hábitos
   (hábito · conteo · proyectos · lo cubre) · huecos (con propuestas `- [ ]`).
8. Revisión de la sesión madre antes del repo (nombres, montos, gitleaks, **Guido mira el diff**) ·
   guardar en `D:\vibe-hallazgos\contraste-2026-11\` · corte nuevo en el acta y en `CORTE.md`.

## Para qué se usa
Entra a la **revisión integral de todos los racimos**, al final del tramo 4, **decisión por decisión**:
confirmada → sigue · contradicha → se reabre con la evidencia en la mano · no vista → queda "sin
evidencia en chats" y se mide en el piloto. Los hábitos son candidatos a skill (regla de 3+); los
huecos, a racimo I, a G.1 o a nota en un diseño.

## Lo que no hace
No aplica nada (propone; decide la sesión madre con Guido) · no lee contenido de negocio · no lee la PC
del compañero (eso pide su consentimiento en su pantalla, METODO) · si I o G.1 cierran antes de correr,
sus decisiones se suman a la lista con el mismo formato y se vuelve a medir el LECTOR (tope ~12 KB).

## Lo que de verdad pasó (2026-10-26, PC `clientes`; el detalle y los números están en el §0 del acta)

- **Lo nuevo no fue +10-15%.** `condensar.py --desde 2026-10-12T21:59` (2 sesiones excluidas: la del observatorio y la madre)
  dio 114 chats principales con mensajes nuevos (107 nuevos + 7 que cruzaban el corte) y 750 subagentes: 2,36 GB crudo → 22,7 MB.
  Mensajes de Guido 3.001 → 3.870 (+29%); entre sesiones 3.594 → 6.290 (+75%). Prueba de 3 chats OK (4/4, 3/3, 8/8; la primera
  cuenta a mano dio 5 en el chico porque contaba el eco de `/model`). gitleaks 0 en condensados, recortados y hallazgos.
- **Los 7 chats que cruzaban el corte se recondensaron enteros** (sin `--desde`) y reemplazaron su versión vieja en la carpeta de
  trabajo: para esta lectura el episodio completo vale más que "solo la parte nueva". El CORTE queda igual: 2026-10-26 14:47 UTC.
- **El número final fue 83 lotes, no 59** (13,5 MB, ~3,5 M tokens). Se le mostró a Guido con dos alternativas (encargos cortados a
  1.500 bytes → 66; lotes de 300 KB → 55); eligió los 83 enteros. **No quiso la herramienta Workflow**: los lectores fueron
  subagentes lanzados a mano por tandas, con el tope de 20 en paralelo del harness (~40 min de reloj, 9,5 h de agente).
- **El paso 6 cambió**: la pasada de hábitos de la PC `Usuario` ya estaba hecha (su acta es `tips/tanda-2026-10-habitos.md`), así que la
  síntesis B no "junta con la que corre allá": cruza la lente B contra esa acta (sus 19 familias y P58-P62). Y la lente A no se sumó a
  mano: un script (`extraer.py`, guardado con lo hallado) partió los 83 archivos por lente y sumó las 2.872 filas de la lente A por
  decisión; Opus juzgó sobre esa tabla.
- **El costo real: 22,1 M de tokens nuevos** (lectores 20,8 · síntesis 1,0 · ya-sabido 0,2) contra 11-17 M presupuestados: 1,3-2×. Con
  la caché que se relee, ~200 M. El lector promedio costó 251 mil (166-335 mil) y no los 120-185 mil de las dos cotas del script: el
  `ya-sabido.md` creció de 58 a 112 KB y cada lector lo lee entero. Lección para `recortar.py`: sumar el tamaño del `ya-sabido` por
  lector, o partirlo por lente.
- **Tres chats estaban duplicados** (mismo cuerpo, otro id: sesiones reanudadas o movidas de carpeta) y L3, L4 y L5 leyeron dos veces el
  mismo chat del proyecto de entrevistas. `recortar.py` debería deduplicar por hash del cuerpo. Está anotado en los límites del acta.
- **La relectura de los chats que pidieron texto completo (29, 15 marcados ★) no se hizo acá**: queda para la sesión madre, con el
  techo de 15 que fija este plan.
- El `LECTOR-contraste.md` quedó en 12,8 KB (sumó la cuarta sección, el objeto de salida con `"otras"` y las marcas del recorte en
  modo contraste; perdió el "BORRADOR"). El paso 8 (revisión de la sesión madre, Guido mira el diff, commit) sigue pendiente a la hora de
  escribir esto: esta sesión no commitea.
