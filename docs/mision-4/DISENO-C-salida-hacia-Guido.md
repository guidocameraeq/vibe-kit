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
- **Silencio por defecto.** Le hablan solo por las 4 cosas de su lista ([racimo A](DISENO-A-frenos.md)
  §2) o por una decisión de diseño o de negocio.
- **`/estado` cuando él quiera**, y un **resumen corto al final del día**.
- **Se terminan los textos para pegar entre pestañas**: los agentes se hablan entre ellos.

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
- La estructura de **subproyectos dentro del proyecto**, cada uno con sus documentos, su historial, su
  reporte, su estimación y su consumo, se diseña en el racimo H (`TABLERO.md` §10).

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
| Textos pegados a mano entre pestañas | ~55 problemas | 0 |
| Desvío entre lo estimado y lo real por subproyecto | Un tramo: ~20 h estimadas, ~100 h reales | Que el desvío baje de un subproyecto al siguiente |
| Mensajes de los agentes a Guido que no eran suyos | Sin medir | 0 (la lista de 4 + diseño y negocio) |

## 5. Pendiente

- El `/estado` general, que junta todos los proyectos: depende de los racimos E y G.
