---
name: reflexion
description: Pasada por el contexto de la sesión antes de cerrarla. Usar cuando el usuario dice "reflexión", "reflexioná", "pasada de contexto", "hacé una pasada por tu contexto", "atá cabos", "¿quedó algo suelto?", "cabos sueltos", "¿qué aprendiste?", "¿vale la pena guardar/persistir algo?", "¿encontraste un mejor camino?", o antes del /cierre de una sesión larga. NO usar para escribir el handoff ni dejar los docs al día (eso es /cierre), ni para buscar bugs en un diff (eso es /code-review).
---

# Reflexión

Una pasada honesta por la sesión: qué se pidió, qué se hizo, qué quedó suelto y qué vale guardar. **La pasada mira y
propone; no arregla ni escribe.** Lo genérico está acá; lo de cada proyecto sale de su `CLAUDE.md` y sus docs (paso 0).

## La regla: se propone, no se escribe

Durante la pasada **no se edita, crea ni borra ningún archivo** (ni código, ni docs, ni memoria, ni `CLAUDE.md`), y no se
corre nada que cambie algo. Se lee y se corren comandos que solo miran (`git status`, `git diff`, ver si un puerto está ocupado).
Cada cosa a guardar o arreglar es una propuesta con su archivo y su texto. Se aplica después, **solo las que el usuario elija**.

| Lo que se te va a cruzar | Lo que es |
|---|---|
| "Me dijo *anotá* / *guardá* / *persistí*" | Pidió la pasada. El OK es por ítem, después de ver la lista. |
| "Es un arreglo de dos líneas, ya que estoy" | Es una propuesta. El usuario elige si se hace ahora, en otra sesión o nunca. |
| "Si no lo escribo ya, se pierde" | No se pierde: está en la lista numerada que el usuario tiene adelante. |
| "La memoria es mía, no es un archivo del proyecto" | Es persistencia igual: va a la lista. |

Si te encontrás escribiendo "ya lo arreglé", "ya lo anoté" o "lo dejé guardado" en una reflexión, frená: eso es otra tarea.

## Proceso

0. **El terreno.** El `CLAUDE.md` del proyecto (y el global): sus reglas, su mapa de docs y, si tiene, su sección
   `## Reflexión` con chequeos propios (se suman a los de acá). Qué destinos existen: memoria, `CLAUDE.md`, el TODO, las
   trampas, notas de prueba. `git status` y `git log` desde el arranque de la sesión.
1. **Pedido contra hecho.** Lo que pidió el usuario, con sus palabras, y lo que se hizo de verdad (archivos, comandos,
   commits). Cada paso de la lista de tareas o del plan que no se completó es un desvío. Lo que el `CLAUDE.md` exige después
   de cada acción (una prueba anotada, una nota) cuenta como pedido.
2. **Cabos sueltos.**
   - Lo prometido y no hecho, las preguntas sin respuesta, las decisiones que esperan a alguien.
   - Lo que se afirmó sin evidencia ("anda", "pasa", "quedó"): **NO VERIFICADO**, con el porqué.
   - Los restos: temporales, procesos en segundo plano (miralos, no los supongas), cambios sin commit, ramas sin push.
     Separá los de esta sesión de los que ya estaban al empezar: esos no se tocan sin preguntar.
   - Si hubo código: logs de depuración, TODOs nuevos, docs o config que quedaron viejos.
3. **Contradicciones.** Lo decidido en un momento y contradicho después. Lo hecho contra una regla del `CLAUDE.md` o un pedido.
4. **Aprendizajes**, en dos grupos:
   - **del proyecto**: restricciones, trampas, cómo se comporta algo;
   - **del proceso**: qué corrigió el usuario, qué forma de trabajar anduvo, y qué se pide a mano y se repite entre sesiones.
     Con 3 o más veces, es candidato a skill o script: se anota, no se crea acá.
5. **Qué guardar y dónde.** No se guarda lo que ya dicen el repo, git, el handoff o un doc.
   Una regla que ya existe y no se cumplió no se duplica: el aprendizaje es cumplirla.

   | Qué es | Destino |
   |---|---|
   | Una corrección o preferencia del usuario sobre cómo trabajar | La memoria (`feedback` / `user`) |
   | Un hecho o una trampa del proyecto | Lo que diga su mapa de docs (en el molde, `docs/referencia/trampas.md`), o su `CLAUDE.md` |
   | El estado y lo que sigue | Nada: lo escribe `/cierre` |
   | Un ritual repetido, o una falla del kit o de una skill | El TODO del proyecto, para el dueño: el kit no se edita desde un proyecto |
   | Un cambio a cómo trabaja el proyecto (un freno, una regla, un paso) | Si el proyecto tiene `.claude/scripts/cambios.cjs`, propuesto como `cambios.cjs nuevo` |

   En un repo público, ninguna propuesta lleva secretos, datos de clientes ni nombres o rutas reales.
6. **Veredicto**: **Conforme**, **Conforme con observaciones** o **No conforme**, con hechos. Ante la duda, baja.
   Si no es Conforme, el ajuste mínimo que falta antes de cerrar.

## Salida

Corta, en el idioma y el tono del proyecto. Una sección vacía va en una línea. Si la sesión se compactó, lo dice primero.

```markdown
## Reflexión — <fecha> · <proyecto>
<si se compactó: "La sesión se compactó; lo de antes de <punto> lo veo resumido y no afirmo detalles de esa parte.">

**Pedido contra hecho:** <1-3 líneas> · Desvíos: <lista o "ninguno">
**Cabos sueltos:** <lista con archivo o comando, o "ninguno">
**Contradicciones:** <lista o "ninguna">
**Aprendizajes del proyecto:** <lista o "ninguno">
**Aprendizajes del proceso:** <lista o "ninguno">

**Veredicto:** <estado> — <motivo con hechos>. <El ajuste mínimo, si hace falta.>

**Propuestas** (no apliqué ninguna):
1. `<archivo>` — <qué agrega o cambia: el texto exacto o casi>
2. …

¿Cuáles aplico?
```

Si una propuesta necesita un dato del usuario (dónde va una nota, qué opción prefiere), la propuesta trae tu opción por
defecto ("si no me decís otra cosa, en `<ruta>`"): la única pregunta sigue siendo cuáles aplico.

Con la respuesta, se aplican solo las elegidas y se cierra con la lista de lo que se escribió y dónde. Lo que es estado o
TODO queda para el `/cierre`, si viene. Sin propuestas, se termina en el veredicto, sin pregunta.
