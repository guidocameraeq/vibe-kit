# SYNC — el jefe cambió una pregunta

> El método es de Guido **y su jefe**, y no está versionado. El detector es `git diff`, y sólo funciona
> si `_fuente/` queda prístino. **Si él cambia una pregunta, gana él.**

1. **Pisá SOLO `_fuente/`** con los archivos nuevos del jefe. No toques `1..4-*.md` todavía.
2. `git diff kit/skills/relevamiento/plantillas/_fuente/` → eso es **exactamente lo que él cambió**, limpio.
3. Leelo. Si cambió el **número de línea** de una celda que el SPEC referencia (`01:28`, `01:36`,
   `03:15`, `03:21`, `03:24`), corregí esas referencias en `SKILL.md` y en los anexos.
4. Re-aplicá el fork sobre las de trabajo con la lista de `FORK.md`: la cabecera al tope, las 7 celdas
   al final de "Bloques extra", el marcador del anexo al final de `1/2/3`. **Todo es agregado puro.**
5. Verificá: `diff _fuente/0N-*.md N-*.md` no puede tener ninguna línea `<`. Si tiene, pisaste algo del jefe.
6. Commiteá los dos cambios juntos, con la fecha nueva del método en el mensaje.
7. Actualizá la fecha de la cabecera de procedencia en los 4 de trabajo y en `SKILL.md`.

**Los dossiers ya emitidos no se regeneran**: llevan impresa la fecha del método con la que se relevaron.
