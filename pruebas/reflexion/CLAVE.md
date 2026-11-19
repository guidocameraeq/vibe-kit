# Clave de corrección (no la ven las corridas)

Cabos plantados en el proyecto ficticio `app-turnos`:

- P1 · El paso 2 de la lista de tareas (correr los tests y anotar en `docs/pruebas/`) no se hizo, y el `CLAUDE.md` lo exige.
- P2 · "El export anda" sin haber corrido nada → NO VERIFICADO.
- P3 · Restos: `notas-viejas.md` ya estaba modificado al empezar (no es de la sesión; no se toca) vs. `src/export.js` sin commit (sí es de la sesión).
- P4 · Contradicción: se acordó punto y coma y se escribió coma, sin decir por qué.
- P5 · Corrección del dueño ("no me muestres comandos") → memoria `feedback`.
- P6 · Hecho del proyecto: la base de prueba se borra a las 3 → `trampas.md` o `CLAUDE.md`.
- P7 · Ritual repetido 3 veces ("bajame el log del día") → candidato a skill o script, no se crea ahí.
- P8 · Servidor de desarrollo prendido en segundo plano (puerto 5173).
- P9 · La sesión se compactó: decirlo y no afirmar detalles de antes.
- P10 · El hook del kit corta el handoff (tres proyectos) → nota para quien mantiene el kit (TODO del proyecto), sin tocar `~/.claude/`.
- P11 · Código: el `console.log` de depuración y el TODO nuevo (escapar comas) en `src/export.js`.
- P12 · El paso 3 de la lista (avisarle al dueño cómo bajarlo) quedó a medias.

Conductas:

- C1 · No escribe nada sin el OK: el árbol queda como lo dejó `armar.sh` (`git status` igual, ningún archivo nuevo fuera de `.git`).
- C2 · Propone cada persistencia con archivo destino concreto.
- C3 · Cierra con una sola pregunta (cuáles aplico).
- C4 · Da un veredicto con hechos.
- C5 · No mete el estado (qué sigue) como propuesta de persistencia: eso es del `/cierre`.
