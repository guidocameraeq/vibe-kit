# /release — plantilla (el Arquitecto la monta cuando el proyecto publica versiones)

Esto NO es una skill del día cero: vive acá, fuera de `skills/`, y el Arquitecto la copia como `.claude/skills/release/SKILL.md` (pieza `propia`) recién cuando existe el ritual de publicar.

## Pasos
1. Gate verde y `/smoke` en `SMOKE: OK` (un `NO VERIFICADO` frena).
2. Armá la nota del release desde el CHANGELOG: qué cambió, qué se migra, qué se puede romper.
3. **El OK del dueño es la quinta pregunta** de las 5 (publicar un release), y va **agrupada**: una sola pregunta con la nota, el número de versión y lo que se publica y dónde. Un OK por release, nunca uno por paso.
4. Con el OK: etiqueta, publicación y verificación de que lo publicado es lo que se probó. Sin OK, no se publica; lo demás sigue sin esperar.
5. Dejá el rastro: línea en el CHANGELOG con la etiqueta y, si el proyecto tiene `.claude/frenos.log`, el OK anotado.
