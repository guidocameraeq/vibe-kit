# Chats de la misión 4 — material temporal para revisar el proceso

> **Para qué está esto**: Guido lo pidió el 2026-10-26. Son los chats en los que se diseñaron los racimos del tramo 4 en la PC
> `Usuario`, guardados para **la revisión del proceso** que hace la **misión 6** (escribir el ciclo de mejora del método, `docs/TODO.md`).
> Ahí se leen para ver cómo se trabajó de verdad: qué preguntas le costaron a Guido, dónde se dio vueltas, qué hizo bien el método,
> cuánto costó cada racimo.
>
> **Es temporal**: cuando la misión 6 los haya usado, esta carpeta **se borra** (o pasa a `legacy/` con lápida si algo se quiere
> conservar). No es documentación del método y nadie la lee en el día a día.

## Qué hay

| Archivo | Racimo | Fechas (UTC) |
|---|---|---|
| `2026-10-22-racimo-F.md` | F · seguridad por defecto | 2026-10-22, 14:13 a 16:59 |
| `2026-10-22-racimo-F-rama-corta.md` | F, una rama del mismo chat que se cortó a los 20 minutos (mismo arranque) | 2026-10-22, 14:13 a 14:35 |
| `2026-10-22-racimo-B.md` | B · documentos con tope | 2026-10-22 17:03 a 2026-10-23 11:19 |
| `2026-10-23-racimo-D.md` | D · director/obrero y el workflow diario | 2026-10-23, 14:46 a 19:19 |
| `2026-10-24-racimo-G.md` | G · mesa entre directores, PCs y buzón | 2026-10-24, 13:55 a 23:23 |
| `2026-10-24-racimo-H.md` | H · niveles y puertas del Arquitecto (hasta el cierre del 2026-10-26) | 2026-10-24 23:24 a 2026-10-26 12:48 |
| `2026-10-25-observatorio-habitos.md` | La pasada de hábitos del observatorio (`tips/tanda-2026-10-habitos.md`) | 2026-10-25 15:47 a 2026-10-26 12:28 |
| `costos.csv` | Tokens por chat (entrada, caché, salida), modelo y tamaño | — |

**No están**: los chats de los racimos **A, C y E** (2026-10-21 y 22) y los de los tramos 0 a 3: no están en esta PC. Si viven en la PC
`clientes`, se condensan igual allá y se suman a esta carpeta antes de la revisión.

## Qué tienen y qué no

Son **condensados**, no los chats crudos (`observatorio/investigacion/condensar.py`, el mismo de la investigación de octubre):
- **Sí**: los mensajes de Guido enteros, el texto de Claude, los mensajes entre sesiones y el nombre de cada herramienta que se usó.
- **No**: lo que devolvieron las herramientas (archivos leídos, salidas de comandos), los chats de los subagentes (lectores, revisores:
  lo que importa volvió al chat principal como informe) ni los recordatorios del sistema.
- Los posibles secretos se taparon **antes** de escribir (3 por entropía, ninguno real) y **gitleaks** corrió limpio. Antes de subirlos se
  revisaron a mano mails, links, números de documento, montos y el detalle de las alertas de seguridad: lo que aparece ya era público en
  los diseños (`DISENO-F` §3).

**vibe-kit es público**: esto lo ve cualquiera. Lo decidió Guido el 2026-10-26, frente a la alternativa del repo privado `vibe-research`.
Los crudos (23 MB) quedan en la PC `Usuario`, en la carpeta de proyectos de Claude Code, y no se suben nunca.
