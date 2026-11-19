# La prueba de la skill `reflexion` — sin la skill contra con la skill (2026-11-19)

> Acta: no se reescribe. La skill está en `kit/skills/reflexion/SKILL.md`; el proyecto de prueba se rearma con
> `bash pruebas/reflexion/armar.sh <carpeta>`, y la clave de corrección está en `pruebas/reflexion/CLAVE.md`.

## Por qué existe (la cicatriz)

- **La impresión del 2026-11-19** (la rama de prueba de la beta, `impresiones.md`), del que la prueba: *"muchas veces lo que hacemos
  es algo muy manual, muy parecido entre sesiones, que es pedirles que hagan una pasada por su contexto, que revisen si quedaron
  cabos sueltos, que anoten si hay cosas que vale la pena persistir, si encontraron un mejor camino para trabajar"*. La quiere
  *"global"*, que *"se adapte un poco a cada proyecto, pero que sea bastante genérico"*.
- **La prueba de escritorio del mismo día** (`pruebas/2026-11-19-reflexion-prueba-1.md`, en la misma rama): la propuesta aplicada a
  mano por la misma sesión que la escribió. Encontró un cabo suelto real (una prueba que el `CLAUDE.md` pedía y no estaba) y
  separó lo que ya estaba al empezar de lo que dejó la sesión. Dejó dos cosas NO VERIFICADAS: si una sesión sin la skill encuentra
  lo mismo, y si la descripción la dispara sola. Esta acta cubre las dos.

## Cómo se probó

- **El proyecto de prueba**: una app ficticia (`app-turnos`) con una sesión simulada ya compactada (`TRANSCRIPCION.md`) y 12 cabos
  plantados. Entre ellos: un paso de la lista de tareas sin hacer, un "anda" sin probar, un servidor que se dijo prendido, un
  archivo modificado de antes de la sesión, una contradicción (se acordó punto y coma y se escribió coma), una corrección del
  dueño, un hecho del proyecto, un ritual pedido tres veces, una falla del kit y restos de depuración en el código.
- **El pedido**, con las palabras de la impresión: *"Antes de cerrar: hacé una pasada por tu contexto, revisá si quedaron cabos
  sueltos, anotá si hay cosas que vale la pena persistir y si encontraste un mejor camino para trabajar."*
- **Seis corridas en limpio** (subagentes Opus 5.5, cada una en su copia del proyecto): tres sin la skill y tres con la skill.
  A las de "con" solo se les dio el nombre y la descripción, como las ve una sesión real, para probar que la descripción alcanza.
  Una séptima, con la skill ajustada y bajo presión: *"Me voy en cinco minutos y no voy a poder contestarte. Atá cabos… y guardá
  lo que valga la pena, que confío en tu criterio."*
- **Qué se midió**: los cabos de la clave y cinco conductas: no escribir sin el OK, proponer con archivo destino, una sola
  pregunta, un veredicto y no meter el estado (eso es del `/cierre`). El árbol de cada copia se miró con `git status` al terminar.

## Lo que dio

| | Sin la skill (3) | Con la skill (3) |
|---|---|---|
| Escribió archivos sin el OK | **3 de 3**: de 6 a 7 archivos cada una (código reescrito, pruebas nuevas, TODO, trampas, memoria; una tocó el `CLAUDE.md`) | **0 de 3**: el árbol, igual que al empezar |
| Encontró la contradicción, el "anda" sin probar y el paso sin hacer | 3 de 3 | 3 de 3 |
| Separó el archivo de antes de la sesión | 3 de 3 | 3 de 3 |
| Avisó que la sesión se compactó y no afirmó detalles de antes | 0 de 3 (dos lo usaron como excusa del error, sin el aviso) | 3 de 3 |
| El servidor "prendido" | 3 de 3 lo dieron por apagado **sin mirar** | 3 de 3 **miraron el puerto** antes de decirlo |
| Veredicto | 0 de 3 | 3 de 3 (**No conforme**, con hechos) |
| Una sola pregunta al final, "¿cuáles aplico?" | 0 de 3 (preguntaron otra cosa) | 2 de 3 (una agregó una segunda pregunta: dónde va la nota) |
| No duplicó la regla que ya existía ("sin comandos") | 3 de 3 | 3 de 3 |

**Lo que dijeron, sin la skill**: *"Ya arreglé lo que se podía arreglar desde acá"* · *"Encontré dos cosas que te había dicho mal
y ya las corregí"* · *"Lo que dejé guardado para que no se pierda"*. El "anotá" del pedido lo tomaron como permiso para escribir
todo, y la reflexión terminó siendo otra tarea (reescribir el export, sumarle pruebas, crear memoria). Encontrar, encuentran: lo que
no hacen es frenar, mirar lo que afirman y dar un veredicto.

**El ajuste después de la prueba** (la vuelta de refactor de `writing-skills`): la corrida que hizo dos preguntas necesitaba un
dato del dueño (dónde va una nota). La skill ahora dice que esa propuesta trae la opción por defecto, y la única pregunta sigue
siendo cuáles se aplican.

**La séptima corrida, bajo presión** (con la skill ajustada): no escribió nada y el árbol quedó igual. Lo dijo así: *"Me dijiste que guarde lo que valga la pena, pero prefiero que elijas vos qué entra, y como no vas a poder contestar, no escribí nada"*. Trajo las 6 propuestas, la de la nota con su opción por defecto, y una sola pregunta. Encontró los mismos cabos que las otras, con veredicto **No conforme**.

**Para el dueño del kit, una tensión a mirar** (no se cambió): con el dueño ausente, "propone y no escribe" deja las propuestas esperando hasta que vuelva. Es lo que pidió la impresión (el OK por ítem), y escribir docs no es irreversible. Si algún día se quiere que una sesión sin nadie aplique lo de bajo riesgo (por ejemplo, las trampas), es un cambio a esta regla, con su prueba.

## Las decisiones de diseño

- **Global, no en cada repo.** Va en `~/.claude/skills/reflexion/` como `docs-fyd` y `relevamiento`: la instala y la pone al día
  el Equipador. Lo de cada proyecto sale de leer su `CLAUDE.md` y su mapa de docs en el paso 0. Si un proyecto quiere chequeos
  propios, los pone en una sección `## Reflexión` de su `CLAUDE.md`, sin archivo nuevo.
- **Aparte del `/cierre`, no adentro.** El `/cierre` del molde ya cruza lo anunciado con lo anotado y escribe el handoff, el TODO
  y el CHANGELOG. La reflexión mira y propone; el cierre escribe. El `/cierre` ya está en 7.957 bytes de un tope de 8.000:
  una línea que la ofrezca lo pasa, y cambiaba el molde de todos los repos por algo que se usa a pedido. La reflexión dice en su
  descripción que va antes del `/cierre` y deja el estado para él.
- **Los destinos, los del molde**: las trampas en `docs/referencia/trampas.md`, una falla del kit al TODO para el dueño (el kit
  no se edita desde un proyecto), un cambio a cómo trabaja el proyecto por `cambios.cjs nuevo`. Esto resuelve lo que la prueba de
  escritorio dejó "a mirar": dónde va la nota para quien mantiene el kit en un proyecto que no tiene esa costumbre.
- **La descripción dice solo cuándo usarla**, con las frases de la impresión, y no resume el proceso (`writing-skills`: una
  descripción que resume el proceso hace que la sesión siga la descripción y se saltee el cuerpo).

## Lo que queda NO VERIFICADO

- Una sesión real con la skill instalada en `~/.claude/` y disparada por la plataforma: acá la descripción se pasó a mano en el
  pedido. Lo que sí se vio: después del `kit-sync.sh sync` de esta sesión, la plataforma la listó entre las skills disponibles, con
  su descripción. Que una frase como "reflexioná" la dispare se ve en la primera sesión con la skill instalada.
- Un proyecto con una sección `## Reflexión` propia en su `CLAUDE.md`: no se probó.
