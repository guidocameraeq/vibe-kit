# Diseño · Racimo C: una salida hacia Guido

> **Misión 4, tramo 4** · 2026-10-21 · **Estado: ✅ cerrado con Guido**, salvo el `/estado` general (depende de E y G). Es solo diseño:
> se construye en la misión 5. Se mide contra el norte del [PLAN](PLAN.md): **¿le baja la intervención a
> Guido o se la sube?**

## 1. Para qué es este racimo, en una línea

**Que Guido sepa cómo van las cosas sin tener que preguntar, y que los agentes le hablen solo cuando es
algo suyo.**

El problema, medido en Hermes:
- ~110 "¿cómo vamos?";
- ~55 textos pegados en la pestaña equivocada o con un "¿qué pego?";
- ~300 resúmenes repetidos.

## 2. Lo que decidió Guido (2026-10-21)

### 2.1 Cuándo le hablan los agentes
- **Silencio por defecto.** Le hablan solo por las 5 cosas de su lista ([racimo A](DISENO-A-frenos.md)
  §2) o por una decisión de diseño o de negocio.
- **`/estado` cuando él quiera**, y un **resumen corto al final del día**.
- **Se terminan los textos para pegar entre pestañas**: los agentes se hablan entre ellos.

*Revisión integral (2026-10-26, con el acta de contraste)*:
- **C-1 (silencio por defecto) salió mixta** (✔124 / ✘86): seis turnos seguidos de "sigo esperando a los sub-agentes" sin novedad
  (9a0fa385). Por A-2 no se arregla con prosa: **el "sigo esperando" y el "Dónde estamos" repetido al pie se frenan mecánicamente**: un
  turno del director sin commit nuevo ni PARADA es cero texto (D §9.3), y la definición del subagente dice que una presentación sin novedad
  no se manda.
- **Cómo le hablan cuando sí le hablan** es la decisión E-4, rearmada con Guido: diseño y negocio charlando; lo rutinario sin pregunta
  (se aplica la recomendada y se avisa con veto); lo que queda con contexto, RECOMENDADA primera, "qué cambia para vos" y el botón
  "explicámelo en criollo" ([DISENO-D](DISENO-D-director-obrero.md) §13).
- **El resumen del día trae lo que Guido no ve** (P77): además de la parte común de §2.3, tres renglones fijos: "hablado con otros
  directores (qué se ofreció, qué se adoptó)", "lo que medimos y aprendimos", "lo que el método atajó hoy (en números)". Evidencia: 4-5
  "¿qué te dijo?" en una hora (L65); el resultado de una medición pagada que nadie reportó (L78).

### 2.2 El reporte tiene tres niveles
1. **Proyecto**: por ejemplo, Hermes, con sus propias skills.
2. **Iniciativa dentro del proyecto**: un tramo, una feature. Por ejemplo, el tramo "una sola
   identidad". **Cada iniciativa tiene su propio reporte, independiente de las demás.**
3. **Tareas** dentro de la iniciativa.

### 2.3 Qué tiene siempre el reporte
- La parte común: **qué se hizo, qué sigue, qué te espera, qué está trabado.**
- 🆕 **La tabla completa de la iniciativa**: todo lo que había que hacer, lo hecho y lo que falta.
- 🆕 **El tiempo**: cuánto tardó cada tarea hecha y, **según esa medición**, cuánto estima el director
  que va a tardar lo que falta.
- Más las líneas propias que el proyecto quiera sumar.

### 2.4 Quién lo setea
**El Arquitecto, una vez por proyecto.** Propone la parte común y pregunta qué agregar. Después, **cada
iniciativa que arranca nace sola con su ficha de estado**, sin que Guido configure nada.

## 3. De dónde salen los datos (propuesta de Claude)

- **La bitácora no es la fuente**: es la historia, y pesa 300-900 KB.
- **Lo mecánico lo calcula un script desde git**, así que nadie lo escribe y no se equivoca:
  - qué se commiteó y si está subido;
  - las pruebas;
  - **cuándo empezó y cuándo terminó cada tarea**, por los commits que la nombran.
- **Lo de criterio lo escribe el director** en pocos campos de la ficha de la iniciativa: próxima acción,
  bloqueos y qué te espera.
- **La estimación la hace el director, no un script** (corrección de Guido, 2026-10-21). Él sabe qué tan
  compleja es cada tarea que falta comparada con las hechas; un script no lo sabe. El script solo
  **junta los datos crudos**.
- **El director anota los tiempos a medida que se trabaja**: cuánto tardó cada tarea y si fue más o menos
  compleja de lo previsto. Con eso estima lo que falta y, a la larga, el proyecto va juntando datos para
  **estimar mejor en el futuro**.
  - Se separan **horas de máquina** y **horas con Guido presente**. Hay evidencia de que se confunden:
    9,5 h propuestas contra 5,5 reales (S-R-5).
  - Hay evidencia de que hoy se estima mal: un tramo estimado en ~20 h midió ~100 h (H-24, radiografía §5).
  - **¿Hoy se anotan los tiempos por tarea en la bitácora o en el tracker?** Guido cree que sí. **NO
    VERIFICADO**: se confirma con el pedido de formato fijo a los directores de Hermes.
- Las skills "estimar horas" y "horas por commit" del Hub **no tienen que ver con esto**: son de otro
  producto, un asistente de fichas. `TABLERO.md` §12 queda como estaba.
- El `/estado` de solo lectura de Deptos se mira antes de construir (FLOTA §1).

### 2.5 Dos alturas (decidido 2026-10-21)
- **`/estado`**: la vista corta del proyecto, con una línea por subproyecto activo (avance, ritmo, lo que
  falta, bloqueos) y "Te espera" arriba de todo.
- **`/estado <subproyecto>`**: la tabla completa de ese subproyecto, con los tiempos y la estimación del
  director.
- *Revisión integral (2026-10-26; D-10 reabierta, ✘43 / ✔23; C-2 confirmada 357 a 0 pero "% de completado" y "¿qué obreros cierro?" se
  piden igual)*: **cuatro líneas más en la vista corta**, sin agente PO: (1) **el % de avance medido** por script (tareas terminadas sobre
  el plan del módulo, de la ficha y los commits; nunca de la cabeza del director); (2) **"podés cerrar: obrero-<x>--07, obrero-<x>--12"**: los
  obreros cuyo CIERRE el director ya verificó, de la lista de sesiones vivas de la ficha (D §7.6); (3) **las esperas**: desde cuándo se
  espera a otro director o a una firma (G-3: una firma frenó tres días sin que nadie avisara) y los `espera hasta:` vencidos del TODO
  (B §10); (4) **el uso**: el plan (5 horas y semana, en %) y el contexto de las pestañas del módulo. **Solo información** (Guido: "el
  filtro de decidir soy yo; si no entorpece, dejémoslo"): ningún tope frena, nadie pregunta, ningún agente decide por costo; las cifras
  de tokens a Guido van como "estimado" al pedir y "real" al cerrar (P67: cifras ~3 veces bajas, L10). **VERIFICADO 2026-10-26** que una
  sesión de la app de escritorio lee el plan y el contexto propio y ajeno (`get_usage`); en terminal y VS Code, NO VERIFICADO. **El camino principal es el script que lee el transcript** (D §11.1), porque Guido trabaja en VS Code (D §3); `get_usage` es la mejora donde exista (revisor frío 26/10, hallazgo 26).
- **Las líneas propias se suman en cualquier momento** (pregunta de Guido, 2026-10-26): "agregá tal línea al estado" se lo dice al director,
  queda en la configuración del `/estado` del proyecto y se da siempre, en cualquier pestaña y PC. No depende de la memoria de nadie.
- La estructura de **subproyectos dentro del proyecto**, cada uno con sus documentos, su historial, su
  reporte, su estimación y su consumo, se diseña en el racimo H (`TABLERO.md` §10).

> **Nota de B (2026-10-22)**: la ficha del subproyecto vive en `docs/modulos/<x>/README.md` (el estado, con tope de 5.000 bytes) y la
> tabla de tiempos de §2.6 en `docs/modulos/<x>/tiempos.md` (registro sin tope, para acumular y estimar mejor). En una iniciativa con
> hijos, la tabla vive solo en las hojas y la ficha de la iniciativa agrega. Detalle: [DISENO-B](DISENO-B-documentos.md) §5 y §5bis.

> **Nota de H (2026-10-25)**: subproyecto = módulo, con nombre `<x>` fijado por el Arquitecto; `/estado <x>` es cualquier módulo, hoja o iniciativa. **Tiempos y tokens solo en módulos con director** (los tokens, por carpeta de transcripts del worktree; NO VERIFICADO): el módulo solo tiene nombre, documentos, historia y `/estado`. Detalle: [DISENO-H](DISENO-H-niveles-y-puertas.md) §7.

### 2.6 La tabla, los nombres y el contexto (decidido 2026-10-21)
- **Las columnas de la tabla de tiempos**: tarea · estimado (antes de empezar) · real de máquina · real con
  Guido · tokens · ¿más o menos compleja de lo previsto, y por qué?
- **`/estado` se llama con el nombre**: `/estado Hermes` (el proyecto) o `/estado una sola identidad` (el
  subproyecto).
- **Sin nombre, se saca del contexto.** Si la pestaña es la del director de "una sola identidad",
  `/estado` es ese subproyecto, no todo Hermes. Si el contexto no alcanza, pregunta con opciones. **Ese
  mapeo de pestaña a subproyecto va escrito en la skill.**
- **No se les pregunta a los directores de Hermes** si hoy anotan los tiempos. Se oficializa directamente
  al escribir las skills del director (misión 5), y ahí se ve cómo funciona.

## 3bis. Lo que se construye (misión 5)
- La skill `/estado` (corta y por subproyecto), con su mapeo de contexto.
- La ficha de cada subproyecto, con la tabla de tiempos, que nace sola al abrirlo.
- En la skill del director: anotar la fila de cada tarea terminada, estimar lo que falta comparando
  complejidad y dejar la línea de lección en el histórico al cerrar el subproyecto.
- El script que junta los datos crudos de git: commits, push, pruebas, inicio y fin de cada tarea.
- El silencio por defecto y el resumen de fin de día.

## 4. Cómo se sabe si funcionó

| Medida | Hoy | Meta |
|---|---|---|
| "¿Cómo vamos?" de Guido | ~110 | Que los reemplace `/estado` (se cuenta en el piloto) |
| Textos pegados a mano entre pestañas | ~55 problemas | 0 (*nota de D, 2026-10-23: la **línea de apertura** de un obrero que Guido pega por default no cuenta como texto pegado; se mide aparte, [DISENO-D](DISENO-D-director-obrero.md) §7*) |
| Desvío entre lo estimado y lo real por subproyecto | Un tramo: ~20 h estimadas, ~100 h reales | Que el desvío baje de un subproyecto al siguiente |
| Mensajes de los agentes a Guido que no eran suyos | Sin medir | 0 (la lista de 5 + diseño y negocio) |
| "% de completado" y "¿qué obreros cierro?" pedidos a mano *(2026-10-26)* | 4 en un lote · ~10 chats | 0: los da `/estado` |
| Preguntas rutinarias a Guido que vuelven con la recomendada *(2026-10-26)* | 7 de 8 | 0: se aplican y se avisan (E-4) |
| Turnos "sigo esperando" sin novedad *(2026-10-26)* | 6 seguidos en un chat | 0 |

## 5. Pendiente

- El `/estado` general, que junta todos los proyectos: depende de los racimos E y G.

## 6. Revisión integral con el acta de contraste (2026-10-26)

| Qué | Veredicto del acta | Qué se hizo | Dónde |
|---|---|---|---|
| C-1 · silencio por defecto | mixta (✔124 / ✘86) | El "sigo esperando" se frena mecánicamente | §2.1 |
| C-2 · `/estado` reemplaza el "¿cómo vamos?" | confirmada (✔357 / ✘0) | Suma el % medido y qué pestañas cerrar (D-10) | §2.5 |
| C-3 · se terminan los textos para pegar | confirmada (✔672 / ✘54) | Nada; queda la línea de apertura del obrero (D §7), que se mide aparte | §4 |
| C-4 · el director estima con tiempos anotados | confirmada (✔128 / ✘50): el director dio ~85% libre y el real era 41% | Se parte de lo que Mobile ya anota (horas por bloque al cierre) y se baja a tarea, con estimado antes | §2.6, §3 |
| D-10 · sin agente PO | contradicha en D | Cuatro líneas más en `/estado`; líneas propias en cualquier momento | §2.5 |
| E-4 · cómo le hablan | contradicha en E | Tres clases; botón "explicámelo en criollo" | §2.1 |
| P67 · el uso antes de decidir | 8 lotes | Solo información en `/estado`; sin tope; verificado en la app de escritorio | §2.5 |
| P77 · el resumen del día | 7 lotes | Tres renglones fijos | §2.1 |
| G-3 · si el otro director no está, se espera | contradicha (base): nadie avisa | `/estado` muestra las esperas con su "desde" | §2.5 |

El pendiente de §5 (el `/estado` general de todos los proyectos) sigue dependiendo de E y G.

