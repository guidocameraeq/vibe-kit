# El ciclo de mejora del método

> Cómo se mejora el método (el kit, el playbook, director/obrero) **con evidencia del uso real**, cada 3-4 meses. Es una **receta**, no
> una skill (se corre pocas veces: regla de 3+). Escrita al terminar la primera vuelta (misiones 1-5, oct-nov 2026) en la misión 6a;
> la 6b completa §3.5 y §8 cuando cierre el primer módulo del proyecto real. Plan y medición de la 6a: [`mision-6/PLAN-6a.md`](mision-6/PLAN-6a.md).

## 1. Para qué, y qué no es

- **Para qué**: que el método no se quede quieto mientras se usa mucho (la primera vez pasaron 70 días sin tocar el kit mientras Hermes
  inventaba un método entero propio: ADR-021), y que cada cambio grande salga de **lo que pasó de verdad**, no de una impresión.
- **Los roles no se mezclan** (restricción dura 4 del `CLAUDE.md`): el observatorio **mide y propone** (actas en `tips/`); la sesión madre y
  Guido **deciden y aplican**.
- **Dónde va cada cosa** (ADR-025): vibe-kit es el método y es público: entra el acta con alias y lo destilado. Lo crudo (chats
  condensados, hallazgos, mediciones por repo, el diario de misiones) va al repo privado de investigación, **antes** de cerrar la madre.
- **No es**: un rediseño por las dudas, ni la mensajería (misión 7), ni el día a día de un proyecto (eso es su registro de cambios: §6).

## 2. El reloj: cuándo arranca una vuelta

- **Cada 3-4 meses**, y recién cuando la versión nueva lleva **un mes andando en un proyecto real** (si no, no hay uso que leer).
- **Antes también** si pasa mucho uso sin volver al kit, o si los registros de cambios de la flota muestran la misma regla en 3+ proyectos.
- **Lo urgente no espera la vuelta**: una cicatriz de seguridad, producción o plata sale como parche (`vX.Y.Z`; ADR-026; el antecedente es
  el tope del hook en `v2.4.3`).
- **Cada vuelta lee desde el corte anterior**, nunca todo de nuevo (§8).
- *La fecha de la próxima vuelta: 6b.*

## 3. Los cinco pasos

| # | Paso | Entra | Sale | Quién y en qué modelo | Lo que costó en la vuelta 1 |
|---|---|---|---|---|---|
| 1 | **Investigar** | chats desde el corte, registros de cambios de la flota, scripts sobre git/`gh` | un acta en `tips/` + líneas base medidas | observatorio; lectores Sonnet, síntesis Opus; scripts | ~69 M tokens (66 M en leer chats); 2 lecturas grandes |
| 2 | **Ordenar la casa** | el repo como quedó | repo prolijo, docs en su lugar, lo crudo al privado, el diario | una sesión Opus | ~1,9 M; 3 sesiones |
| 3 | **Diseñar con Guido** | el acta, las líneas base | un diseño por racimo con su tabla de criterios → SPEC-0 READY | Guido + sesión en Fable (criterio) | ~14 M; 13 sesiones en 14 días |
| 4 | **Construir** | el SPEC-0 | la versión nueva en `main`, con pruebas, como beta `-rc` | un director Opus por paquete + encargos | ~34 M; 19 sesiones; ~32 h de reloj medidas |
| 5 | **Probar en un proyecto real y medir** | la beta | los `rc.N`, la versión final, la medición contra la línea base | *6b* | *6b* |

**Los costos son tokens "nuevos"**: entrada + escritura de caché + salida, del chat principal **más** sus subagentes (la caché leída se
anota aparte). En la vuelta 1 se anotó con dos definiciones distintas (D3.3 figura con 21 M y con 2,5 M): desde la vuelta 2, **esta**, y
la anota el `/cierre` de cada sesión en el diario de misiones (una fila por sesión: fecha, misión y paso, PC, modelo, horas de reloj,
encargos por modelo, nuevos, caché, commit).

### 3.1 Investigar

El detalle es [`observatorio/investigacion/METODO.md`](../observatorio/investigacion/METODO.md); acá, el orden y lo que no se negocia:
1. **Primero lo gratis**: la corrida mensual (`flota.py`, `huella.py`, `repos.py`, `costos.py`; ~25 min, casi cero tokens) y **los registros
   de cambios de método de cada proyecto** (`cambios-flota`): son más baratos y más precisos que los chats (32 fichas de Hermes, 90 KB,
   confirmaron el canon mejor que cualquier acta).
2. **Cruzar dos fuentes baratas** antes de leer nada caro (el tope del hook de la doc contra lo que inyecta cada proyecto: ninguna sola lo mostraba).
3. **Leer chats solo para lo que lo anterior no contesta**, con el costo dicho antes y el OK de Guido: recortados (`recortar.py`) si la
   pregunta mira a Guido o al proceso; enteros solo los ★ que un hallazgo pida.
4. **Un `ya-sabido`** para los lectores: sin él, redescubren lo escrito.
5. **Verificar en disco** lo fuerte antes de escribirlo; el acta pasa por gitleaks, búsqueda de nombres y el ojo de Guido.

### 3.2 Ordenar la casa

Va **entre investigar y diseñar** (M3) y **entre diseñar y construir** (M4½): una sesión, Opus, sin decisiones nuevas.
- **Qué se ordena**: carpetas y nombres, docs en su lugar (índice, lápidas en `legacy/`), lo crudo al privado, el diario de misiones, un
  parche si hay una cicatriz pendiente (en la vuelta 1, `v2.4.3`), y **el plan del paso siguiente con su dimensión** (cuántas sesiones, qué
  modelo, qué presupuesto).
- **Anda solo si las decisiones ya están escritas**: la M4½ hizo ~50 pasos sin una pregunta; la M3, 20 pasos seguidos con un spec READY
  de criterios verificables.
- **"Ordenado" incluye lo que se ve de afuera**: la M3 se dio por terminada y Guido, al mirar el repo en GitHub, dijo que estaba horrible:
  tres vueltas más de portada, banner e imagen. Se mira renderizado antes de cerrar.
- **La dimensión del paso siguiente se pregunta al abrir, no al cerrar**: el plan de construcción cambió dos veces en 17 horas (una
  sesión → ~20 sesiones → un director por paquete, ADR-028) porque las preguntas "¿cuántas sesiones?" y "¿un orquestador?" llegaron al final.

### 3.3 Diseñar con Guido

Es el paso donde Guido más participa y el que menos tokens gasta. **La receta que se repitió en cada racimo** (A a H, una sesión cada uno,
de ~2,5 a ~9 h, sin cortes de contexto):
1. `/inicio` → **un lector barato mide cómo se usa hoy** la pieza en los proyectos reales (la "ficha de hoy"), y en paralelo se verifica
   la plataforma contra la doc oficial.
2. **Decisiones de a una**, con opciones, pros y contras y UNA recomendación, cada una dicha como **qué cambia en el día de Guido**. Guido
   aprueba, corrige o pide "volvé a pensarlo".
3. Se escribe el `DISENO-<racimo>.md`, que cierra con **la tabla de los 11 criterios** (la vara: [`mision-4/PLAN.md`](mision-4/PLAN.md)).
4. **Revisor frío** (Opus sin contexto; devolvió 25-45 hallazgos por racimo) → cada hallazgo pasa por el criterio ya establecido antes de
   aplicarse → notas cruzadas en los otros diseños → `/cierre` → chat nuevo.

Al terminar los racimos: **una revisión integral** de todas las decisiones con la misma vara (con revisor frío sobre el conjunto), y el
**SPEC-0** con red team y revisor frío antes del sello de Guido. Modelo: Fable donde Guido decide; los subagentes, nunca en Fable.

### 3.4 Construir

El cómo está en el tracker de la versión (en la v3: [`kit-v3/PLAN-construccion.md`](kit-v3/PLAN-construccion.md), "Cómo se trabaja") y en
ADR-028 (un director Opus por paquete con encargos), ADR-029 (presupuesto: ~4 h y ~8 encargos por director, red team de una ronda,
revisor frío de una vuelta con escenario del día normal, mutación solo donde se decide un freno) y ADR-030 (cómo decide una sesión sin
Guido: la vara, y si no alcanza, pregunta).

**Cómo se vio de verdad** (la secuencia que se repitió en los paquetes 2 a 8): `/inicio` con el nombre del paquete sacado del tracker →
el spec delta (lo redacta un subagente Opus) → red team de una ronda si toca un freno → **sellado por script** → encargos en worktrees →
el director lee cada diff y corre las pruebas → revisor frío de una vuelta → arreglos en un encargo → la suite una vez al final → `/cierre`,
que **deja armado el prompt del director siguiente**.
- **El cambio más importante de la vuelta**: el delta pasó de "lo sella Guido" (paquetes 1 y 2) a "lo sella el director por script y Guido
  lo repasa después" (desde D2.2). Con un prompt de arranque con las autorizaciones numeradas, la vara y el presupuesto, los directores
  siguientes corrieron sin que Guido tocara nada salvo "¿cuánto falta?" y "dame el prompt".
- **El precio**: una **deuda de comprensión**. Al final había ~150 decisiones tomadas sin él (54 le cambiaban algo), y hubo que hacer una
  página en criollo para repasarlas. **Cada director que decide sin Guido deja sus decisiones ya en criollo**, separadas las que le afectan.
- **Lo que no vio ningún revisor lo encontró Guido con una pregunta de usuario**: el freno que no tenía que molestar en `auto` (él
  trabaja así), las skills que él ya adaptó y el actualizador no fusionaba, el banner siempre. **El revisor frío recorre el día de Guido**
  (modo `auto`, sus adaptaciones, sus PCs), no solo el día del código.

### 3.5 Probar en un proyecto real y medir

*6b.* Lo ya decidido: la prueba es en un proyecto de verdad, con un módulo nuevo (no un piloto de juguete); cada arreglo sale como
`rc.N` y le llega por la flota; la versión final sale cuando el módulo cierra bien; se mide contra las líneas base del TABLERO §1.

## 4. Cómo trabajamos de verdad (la vuelta 1)

Sale de leer los 42 chats recortados (`recortar.py --modo contraste`: los 420 mensajes de Guido enteros, la primera línea de Claude y los
273 mensajes entre director y encargos), con 4 lectores Sonnet, el 2026-11-03. Costó ~0,64 M (se presupuestó ~1,1-1,3 M). Los hallazgos
crudos van al privado (`mision-6/`), nunca acá.

**Lo que más le costó a Guido no fue diseñar: fue la logística.** Tres PCs y dos cuentas de GitHub, Remote Control para que una sesión le
pida algo a otra, un repo temporal improvisado para pasar chats, comandos que tuvo que correr él porque el clasificador o una ruta protegida
los frenaba, renombrar pestañas a mano, preparar una PC nueva (30 min), y **pegar un prompt largo al abrir cada sesión** (8 directores
seguidos). → En el ciclo: **una PC por paso cuando se pueda**, la PC escrita en el prompt de arranque, y "preparame esta PC" antes de abrir.

**La pregunta que más se repitió fue "¿cuánto falta?"**: más de 15 veces en la M5, porque el director no sabe cuánto lleva ni cuánto le
queda y lo estima. Peor: un encargo quedó **19 horas parado esperando un OK de presupuesto** y Guido creía que se había corrido. → **Un
contador visible** (horas, encargos hechos y por hacer, "esperando tu OK") que el director actualiza solo en el tracker; es lo que el
`/estado` del kit v3 tiene que dar.

**Donde se dio vueltas fue en el alcance y en las explicaciones, no en los detalles.** Unas diez veces "no entendí" o "en criollo", y la
segunda explicación siempre resolvió; la que más costó fue una decisión dicha en técnico ("aprobar desde la terminal") que tres rondas de
red team no le plantearon. El alcance se rehízo entero dos veces (el Arquitecto como agente del ecosistema, descartado a las 24 h; unificar
obrero y tramo, revertido tras "¿es capricho?"). → Cada decisión se le presenta como **qué cambia en su día**; la recomendada va primero
por "¿es por las dudas?" y, si propone algo nuevo de proceso, **es la conservadora** (la sesión que propuso paralelizar con tres directores
duró 14 minutos: Guido la vetó con "prefiero hacerlo bien y que tarde más").

**Lo que anduvo solo tenía siempre lo mismo**: un spec READY o un brief con el "hecho cuando" numerado, el presupuesto (tokens o horas y
encargos) aprobado de entrada, las autorizaciones escritas en el prompt, qué hacer si no alcanza ("frená y avisá", "a Pendientes"), y el
cierre que deja armado el arranque siguiente. Así corrieron la lectura de 81 lectores de la M2, la M3, la M4½ y los directores D2.2 a D8.1.

**Las revisiones sin tope se comen la sesión**: el red team del paquete 2 en tres rondas reabría lo cerrado, los arreglos del revisor de
D2.2 dieron tres vueltas sobre el mismo tema, y D3.3 llegó a ~11 h y 17 encargos hasta que Guido lo frenó ("60 revisiones en frío es una
estupidez") → ADR-029. **Desde ahí, ningún corte por cuota** y ~1-3 h por director.

**Los presupuestos de lectura se pasaron 1,3 a 3 veces** (la consulta a la plataforma, la lectura de contraste), y leer chats se hizo dos
veces con otra lente (M2 por temas, M4 en contraste). Esta lectura, recortada y con una pregunta sola, gastó la mitad de lo estimado.

**Los pasos los disparó Guido, no el plan**: de ordenar a diseñar con "¿es el siguiente paso el más importante?", de diseñar a construir con
"¿cuántas sesiones?", de construir a la prueba real con "es un gran momento para probarlo en un proyecto de verdad". → El ciclo escribe
**el disparador y la salida de cada paso** (§3) para que la pregunta llegue al abrir el paso y no al cerrarlo.

**Chats que valdría releer enteros** si la 6b necesita detalle (no se releyeron: los hallazgos alcanzaron): D3.3 (el quiebre que dio el
ADR-029), D2.2 (el primer director solo, 11 h), el racimo D (cómo se discute una decisión con Guido) y la M2 etapa 0 (tres PCs, bloqueos
y el nacimiento del método).

## 5. Lo que costó la vuelta 1

| Misión | Paso | Fechas | Sesiones | Nuevos |
|---|---|---|---:|---:|
| M1 · el spec de la investigación | investigar | 12/10 | 1 | ~0,9 M |
| M2 · la investigación de los chats | investigar | 12-13/10 | 2 + 81 lectores | ~38 M |
| M3 · ordenar el repo | ordenar | 13/10 | 2 | ~1,3 M |
| M4 · el diseño (tramos 1-3 investigan, 4-5 diseñan) | investigar + diseñar | 14-27/10 | 17 | ~44 M (28 M la lectura de contraste) |
| M4½ · ordenar la casa | ordenar | 27/10 | 1 | ~0,6 M |
| M5 · construir v3 | construir | 28/10-3/11 | 19 | ~34 M |

**En total ~119 M en 22 días.** Lo que dice: **leer chats es más de la mitad**; diseñar con Guido, lo más caro en atención, es de lo más
barato en tokens; construir bajó a ~2 M y ~3 h por director después del ADR-029 (D3.3 había llevado 18 h de agentes).
Huecos: los subagentes de los racimos B, D, F, G y H no quedaron anotados (el diseño real está por arriba de 14 M); las horas de reloj,
solo en 10 de los directores.

## 6. Lecciones de la vuelta 1, por paso

Una línea cada una; la fuente tiene el detalle (M4 = [`mision-4/PLAN.md`](mision-4/PLAN.md) §Lecciones; M5 = el tracker §Lecciones; 6a = §4).

**Investigar**
- Lo gratis primero (scripts sobre git y `gh`, la corrida mensual) y **cruzar dos fuentes baratas** antes de leer nada caro (M4, tramo 2).
- **Los registros de cambios de los proyectos antes que los chats** (M4, revisión integral 2; ADR-026).
- Un `ya-sabido` para los lectores; **un lector por síntesis** (M4, tramo 3). Recortar la entrada cuando la pregunta mira a Guido (6a).
- Techo de búsqueda a los agentes que consultan la doc, no solo de salida: sin él, 3× lo estimado (M4, tramo 2).
- **Un filtro que falla no avisa**: probar el condensado con 3 chats contando a mano (METODO, paso 1).
- Verificar en disco lo fuerte antes de escribirlo; mirar en qué rama vive cada documento (M4, tramo 1).
- Respaldo de lo hallado en el privado desde el día uno (M3); los chats los sube cada `/cierre` (6a).

**Ordenar la casa**
- Los objetivos escritos de entrada (sin ellos el plan cambió tres veces) y el inventario de proyectos como paso 0 (M3).
- Nombre de sesión `vibe-kit M<n> · <qué hace>`: en la vuelta siguiente se sabe qué hizo cada una sin abrirla (M4, tramo 1).
- Con dos sesiones en el mismo repo, **mirar el log antes de cerrar** (M4, tramo 3).
- "Ordenado" se mira renderizado, desde afuera (6a). La dimensión del paso siguiente se pregunta al abrir (6a).

**Diseñar con Guido**
- **Revisor frío después de las decisiones y antes del spec, en cada racimo**, y obligatorio después de toda corrección transversal (M4: E, F, revisión integral 2).
- Antes de aplicar un hallazgo, **pasarlo por el criterio ya establecido** (M4, F).
- Antes de diseñar una pieza, **un lector mide cómo se usa hoy**; medir en disco antes que confiar en un inventario por nombres (M4, B y D).
- Verificar la plataforma contra la doc oficial **antes** de decidir (M4, F y D).
- Cuando una recomendación junta dos piezas, cortar los roles por la pregunta que responden (M4, D).
- La seguridad se revisa en frío aunque su racimo ya esté cerrado (M4, D).
- Opus viene en esfuerzo `medium`: para criterio, `high`; Fable para decidir, Opus para ejecutar lo decidido (M3, M4½).
- Cada decisión, dicha como "qué cambia en tu día"; la recomendada de proceso, la conservadora (6a).

**Construir**
- Para un formato que viaja a la flota, el revisor frío va **antes** del sello, o el delta cruza cada campo contra los diseños (M5, D1.1).
- La mutación encuentra reglas sin prueba aunque la suite dé verde (M5, D1.1).
- El director **mide antes de aceptar** un informe; el resumen del subagente no es evidencia (M5, D2.1).
- El director no sabe cuánto contexto lleva: pregunta el % de la app o usa el script (M5, D2.1).
- Paralelizar depende del hardware: una PC por director; dos suites largas en la misma PC no rinden el doble (M5, DP y D2.1).
- **Fijar el contrato entre dos encargos antes de repartir** deja correr varios a la vez (M5, D5.2).
- El revisor recorre el día normal, no los ataques; el recorrido de punta a punta lo ve el que lee todo junto o una sesión real (M5, D2.2 y D5.2).
- **La sesión real ve lo que ninguna prueba ve**: leer su log entero (M5, D5.1). Un pedido de prueba también tiene que pasar la regla que prueba (M5, D4.1).
- Una pausa avisada no cuesta nada si cada encargo está en su worktree con WIP commiteado (M5, D5.1).
- Revisor sin piso de severidad → ADR-029 (M5, D3.3).
- Las decisiones sin Guido, en criollo desde el director que las toma; el contador de avance, visible (6a).

**Medir**
- Un pedido con formato fijo a cada director (número · qué cambió · freno o regla blanda · SHA · dato medido) y verificar cada línea en su git (M4, checkpoint).
- Medir un freno contra el historial real antes de instalarlo: el corrector de afirmaciones quedó en "avisa" por eso (M5, D5.3).
- *El resto, 6b.*

## 7. Plantillas

Esqueletos para la vuelta siguiente; el ejemplo lleno de cada uno es el de la vuelta 1.

**SPEC de investigación** (ejemplo: [`SPEC-investigacion-chats.md`](SPEC-investigacion-chats.md)) — Estado y origen (la frase de Guido) ·
Por qué (el dolor, con su número) · Alcance IN/OUT con razón (OUT siempre: aplicar, contenido de negocio, mover crudos) · Las preguntas y a
quién le sirve cada una · Cómo se hace (condensar → recortar → lectores → síntesis, con el corte `--desde`) · **Presupuesto con tres opciones
y lo que contesta cada una** (el modelo: [`mision-6/PLAN-6a.md`](mision-6/PLAN-6a.md) §3) · Salida (acta en `tips/`, crudo al privado) ·
Criterios de aceptación · Riesgos (secretos, nombres, un filtro que falla callado).

**PLAN de diseño** (ejemplo: [`mision-4/PLAN.md`](mision-4/PLAN.md)) — El foco: objetivos con su línea base y el norte · Los criterios de
cada pieza (la vara, con su tabla al cierre) · Modelos y tokens por rol, con "decir el costo antes de leer más de ~100 KB" · Los tramos
(tabla: qué, sale con, costo real) · El brief del tramo siguiente · Lecciones para el ciclo (una línea con fecha).

**Tracker de construcción** (ejemplo: [`kit-v3/PLAN-construccion.md`](kit-v3/PLAN-construccion.md)) — Cómo se trabaja (director por
paquete, presupuesto, límites) · La vara para decidir sin Guido · **El estado de un vistazo, con el contador** (paquete · directores · horas
y encargos hechos/por hacer · esperando a Guido) · Los directores (fila: fecha, PC, horas de reloj, encargos por modelo, tokens nuevos,
commit, resultado) · Decisiones sin Guido, **en criollo**, las que le afectan arriba · Pendientes · NO VERIFICADO · Criterios del producto ·
Cambios al plan (fecha, qué, por qué) · Lecciones.

**Prompt de arranque "sin mí"** (lo arma el `/cierre` anterior) — 1. alcance numerado y la PC donde corre · 2. presupuesto (horas,
encargos) y qué hacer si no alcanza · 3. revisión con tope (una vuelta, hasta 10 hallazgos con escenario) · 4. qué no se toca · 5. qué
mide y dónde se anota · 6. al terminar: la fila del tracker, las decisiones en criollo, el prompt siguiente y `/cierre`.

**Fila del diario de misiones** (privado) — fecha y hora del cierre · misión y paso · qué se hizo · PC · chat (8 caracteres) · modelo ·
horas de reloj · encargos por modelo · nuevos · caché · subagentes · commit.

## 8. La fecha de corte y el diario

- **El corte** de cada PC es el último mensaje leído (la columna `hasta` del `costos.csv`, el máximo); se anota en el acta (§0) y en el
  `CORTE.md` privado. La vuelta siguiente lee con `--desde <corte>`.
- **El diario de misiones** (privado) lleva una fila por sesión con la medida de §3; los chats de cada sesión los sube su `/cierre`.
- *El corte de la vuelta 1 y la fecha de la vuelta 2: 6b.*
