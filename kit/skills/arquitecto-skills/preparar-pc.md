# "Preparame esta máquina": los repos de tu cuenta y publicar sola

El paso 4 del Modo INSTALAR del `SKILL.md`, después de aplicar el plan. `<scripts>` = `<clon>/kit/skills/arquitecto-skills/scripts`.

## Los repos de tu cuenta

1. `node <scripts>/traer-repos.cjs listar --proyectos <carpeta>`: los repos de la cuenta de `gh` y de sus organizaciones, cada uno
   "ya está" o "para traer".
2. Si hay alguno para traer, **una pregunta** (`AskUserQuestion`, varias opciones a la vez): *"¿traigo repos de tu cuenta?"*, con la
   lista. Nunca se trae nada que el dueño no eligió.
3. Con los elegidos: `node <scripts>/traer-repos.cjs clonar <dueño/repo>… --proyectos <carpeta>`. No pisa una carpeta que ya está
   (la saltea y lo dice), deja `core.longpaths` y prende los ganchos de un repo con el kit.
4. **El `comando-setup` de un repo recién traído no corre solo**: es código de ese repo. Por cada uno que lo traiga, mostrá el
   comando y preguntá, repo por repo, antes de correrlo. Un repo sin el kit: ofrecé "adoptá <repo>".

## Publicar sola desde esta PC

Que la ficha de un repo diga `autorizado.publicar` no alcanza: el sí es del dueño, por repo y por PC, y vale para **cómo publica
hoy** (la huella de los comandos y de los archivos que nombran). Si eso cambia, la noche deja de publicar hasta un sí nuevo.

1. Por cada renglón `⚠ publicar · …` de la tabla, **una pregunta por repo**, con lo que dice el renglón: *"¿autorizás que
   <proyecto> publique solo desde esta PC? Publica con: … · lo prueba con: … · vuelve atrás con: …"*.
2. **Sí** → `node <scripts>/preparar-pc.cjs --kit <clon> --publica <origin>`. El freno de la PC muestra la ventana: **ese clic es la
   firma del dueño** (una sesión no se la da sola). Si no aparece la ventana, o el clasificador frena la escritura en `~/.claude/`,
   dale al dueño esa línea entera, sola en su renglón, para PowerShell.
3. **No** → nada. Para sacar uno que ya estaba: `--no-publica <origin>`, igual que el sí.
4. Una corrida sin `--publica` ni `--no-publica` (la de siempre, o la de la flota) deja las autorizaciones como estaban.
