---
name: reflexion
description: Pasada por el contexto de la sesión antes de cerrarla — qué se pidió y qué se hizo, cabos sueltos, contradicciones, qué se aprendió del proyecto y del proceso, qué conviene persistir y en qué archivo, y si apareció un mejor camino de trabajo. Propone; no escribe nada sin el OK de cada ítem. Usar cuando dicen "reflexión", "reflexioná", "pasada de contexto", "atá cabos", "¿quedó algo suelto?", "¿qué aprendiste?", "¿vale la pena guardar algo?", o antes de un /cierre de una sesión larga. NO usar para escribir el HANDOFF ni dejar los docs al día (eso es /cierre), ni para revisar código buscando bugs (eso es /code-review).
---

# Reflexión (`/reflexion`)

> **PROPUESTA** para el kit (rama `prueba/juan`, 2026-11-19). No está instalada. La lleva la sesión de Guido.

Una pasada honesta por la sesión: lo que se pidió, lo que se hizo, lo que quedó suelto y lo que vale guardar. Lo genérico está
acá; lo particular de cada proyecto sale de su `CLAUDE.md` y sus docs (paso 0).

## Reglas

1. **Propone, no escribe.** Cada persistencia es una propuesta con archivo y texto exacto. Se aplica solo con el OK del usuario,
   ítem por ítem. Lo que el `CLAUDE.md` del proyecto prohíbe tocar (el kit, `~/.claude/`, otra rama) no se propone como edición:
   se propone como nota para quien lo mantiene.
2. **Evidencia o NO VERIFICADO.** "Funciona", "pasa", "quedó" solo si se corrió algo en esta sesión que lo muestre. Si no, NO
   VERIFICADO, con el porqué. Ante la duda, el veredicto baja, no sube.
3. **Decí lo que no ves.** Si la sesión se compactó, lo de antes del resumen se ve resumido: decilo en la primera línea y no
   afirmes detalles de esa parte.
4. **No dupliques lo que ya está.** No se persiste lo que el repo, git, el `HANDOFF` o un doc ya dicen.
5. **Repo público, ojo.** Si el destino es un repo público, la propuesta no lleva secretos, datos de clientes ni nombres o rutas
   reales (los alias del proyecto, si los hay).

## Proceso

0. **El terreno.** Leé el `CLAUDE.md` del proyecto (y el global) y mirá qué archivos de memoria y notas existen: memoria de
   Claude, `CLAUDE.md`, `HANDOFF`, docs del proyecto, bitácoras, notas de prueba. Eso define los destinos posibles del paso 5 y
   las reglas a respetar. `git status` y `git log` desde el inicio de la sesión, si hay repo.
1. **Pedido vs. hecho.** Qué pidió el usuario (con sus palabras) y qué se hizo de verdad (archivos, comandos, commits). Desvíos:
   lo pedido y no hecho, lo hecho y no pedido, lo que cambió de rumbo y por qué. Si hubo lista de tareas o plan en la sesión,
   cada paso que no se completó es un desvío, aunque nadie lo haya vuelto a mencionar. Y lo que pide el `CLAUDE.md` del proyecto
   después de cada acción (una prueba, una nota) cuenta como pedido.
2. **Cabos sueltos.** Lo que sigue abierto:
   - prometido y no hecho; preguntas al usuario sin respuesta; decisiones que esperan a alguien;
   - lo NO VERIFICADO (tests sin correr, algo que no se pudo probar);
   - restos: temporales, clones, procesos en segundo plano, cambios sin commit, ramas sin push. Separá los que dejó esta sesión
     de los que ya estaban al empezar (esos no se tocan sin preguntar: pueden ser trabajo de otro);
   - si hubo código: código muerto, logs de depuración, TODOs nuevos, docs o config que quedaron viejos.
3. **Contradicciones.** Lo que se dijo o decidió en un momento y se contradijo después; lo hecho contra una regla del
   `CLAUDE.md` o contra un pedido del usuario. Si el cambio de criterio fue válido, que quede explícito.
4. **Aprendizajes**, en dos grupos:
   - **del proyecto**: restricciones, comandos, trampas, cómo se comporta algo (lo que la próxima sesión querría saber);
   - **del proceso**: qué forma de pedir o de trabajar funcionó; qué corrigió el usuario; qué se hizo a mano y se repite entre
     sesiones (con 3 o más veces, candidato a skill o script).
5. **Qué persistir y dónde.** Para cada aprendizaje que valga, un destino:

   | Qué es | Destino |
   |---|---|
   | preferencia o corrección del usuario sobre cómo trabajar | memoria (`feedback` / `user`) |
   | regla o hecho estable del proyecto | `CLAUDE.md` del proyecto o su doc técnico |
   | estado, qué sigue | nada: lo escribe `/cierre` en el `HANDOFF` |
   | ritual repetido | candidato a skill (se anota; no se crea acá) |
   | falla o mejora de una skill o del kit | nota para quien lo mantiene (en el lugar que diga el proyecto) |

6. **Veredicto.** Conforme · Conforme con observaciones · No conforme. Con hechos, sin complacencia. Si no es Conforme, el ajuste
   mínimo que falta antes de cerrar.

## Salida

Corta. Una sección vacía va en una línea ("Cabos sueltos: ninguno"). Al final, las propuestas numeradas y **una sola pregunta**.

```markdown
## Reflexión — <fecha> · <proyecto>
<si se compactó: "La sesión se compactó; lo anterior a <punto> lo veo resumido.">

**Pedido vs. hecho:** <1-3 líneas> · Desvíos: <lista o "ninguno">
**Cabos sueltos:** <lista con archivo/comando, o "ninguno">
**Contradicciones:** <lista o "ninguna">
**Aprendizajes del proyecto:** <lista o "ninguno">
**Aprendizajes del proceso:** <lista o "ninguno">

**Veredicto:** <estado> — <motivo con hechos>. <Ajuste mínimo, si hace falta.>

**Propuestas** (no apliqué ninguna):
1. `<archivo>` — <qué agrega o cambia, el texto exacto o casi>
2. …

¿Cuáles aplico?
```

Con el OK, se aplican solo las elegidas y se cierra con la lista de lo que se escribió y dónde. Si no hay propuestas, se termina
en el veredicto, sin pregunta.
