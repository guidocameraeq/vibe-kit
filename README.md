# vibe-kit

**Un método para dirigir Claude Code sin saber programar, y las herramientas que lo vuelven
mecánico.** Son skills de Claude Code que planean y montan proyectos, preparan cada PC y
mantienen el orden de trabajo de un chat a otro, más el playbook que explica por qué.

> **Repo personal y en evolución.** Es el taller de Guido: lo usa todos los días en sus proyectos y
> lo cambia cuando la evidencia lo pide. Es público para que cualquiera lo mire o lo copie, pero
> **no es un producto ni tiene soporte**. Algunas cosas son propias de su trabajo (sus carpetas,
> su método de relevamiento).

## Misión y visión

- **Para qué existe:** juntar en un solo lugar el método para dirigir Claude Code sin escribir código,
  probado en proyectos reales, donde cada regla lleva escrito dónde dolió.
- **Adónde va:** a un pack que otra persona pueda instalar y usar con sus propios proyectos.
- **Qué NO hace:** no construye apps (eso pasa en la carpeta de cada proyecto), no es un plugin y no
  promete soporte.

Completo, en una pantalla: [`docs/MISION-Y-VISION.md`](docs/MISION-Y-VISION.md).

## Cómo se usa, en 4 pasos

1. **Instalar** el kit en la PC (abajo). Copia las skills a `~/.claude/`.
2. **Arrancar un proyecto con `/arquitecto`**: te entrevista, escribe el plano (SPEC) y monta el
   proyecto con su CLAUDE.md, sus docs y sus rituales.
3. **Trabajar con `inicio` y `cierre`**: un chat por tarea; el chat se descarta, lo que importa queda
   escrito en archivos.
4. **El observatorio propone mejoras**: mira tips y chats reales y deja actas en `tips/`; qué entra
   al kit se decide acá, con evidencia.

**Las piezas** (cada una es una *skill*: instrucciones que Claude Code carga cuando las llamás):

| Pieza | Qué hace |
|---|---|
| `/arquitecto` | Planea antes de hacer: proyecto nuevo, feature grande sobre una app que ya anda, o "cómo le pido esto a Claude" |
| `/arquitecto-skills` (el Equipador) | Instala y actualiza en la PC las skills de un menú curado |
| `/relevamiento` | Cuando el pedido viene de otra persona: ordena la charla en 4 documentos y decide si hace falta software |
| `/docs-fyd` | Documentación técnica de auditoría de un repo, derivada del código |
| `inicio` / `cierre` | Los rituales de cada chat de trabajo: arrancar sabiendo dónde quedaste, cerrar con todo guardado |

Las recetas por situación ("quiero X → hacé Y") están en **[`GUIA-DE-USO.md`](GUIA-DE-USO.md)**:
es la puerta de entrada para usarlo.

## Qué hay en cada carpeta

| Carpeta / archivo | Qué es |
|---|---|
| [`GUIA-DE-USO.md`](GUIA-DE-USO.md) | Recetas por situación y frases para decirle a Claude. **Empezá por acá** |
| [`PLAYBOOK-MAESTRO.md`](PLAYBOOK-MAESTRO.md) | El método completo: documentación y sistema de trabajo, con su porqué |
| [`kit/`](kit/) | **La fuente** de lo instalable: el Arquitecto, el Equipador (`/arquitecto-skills`), `/docs-fyd`, `/relevamiento`, el agente red-team y el instalador |
| [`manuales/`](manuales/) | El detalle a fondo de cada pieza: el Arquitecto y el Equipador, y la hoja de mano de `/relevamiento` |
| [`observatorio/`](observatorio/) | Los que miran y anotan, no tocan: el Extractor de tips y la investigación de chats |
| [`tips/`](tips/) | Las actas del observatorio, con propuestas para aprobar |
| [`docs/`](docs/) | El estado del repo: pendientes, versiones, decisiones, descartes y planos ([índice](docs/README.md)) |
| [`legacy/`](legacy/) | Lo superado, archivado con su lápida (no se borra) |
| `CLAUDE.md` · `.claude/` | Las reglas para Claude en este repo y sus rituales `/inicio` y `/cierre` |

## Instalar en una PC

Hace falta: [Claude Code](https://claude.com/claude-code) funcionando y git.

1. Clonar este repo.
2. Abrir Claude Code en `kit/` y pegar el prompt de [`kit/INSTALAR.md`](kit/INSTALAR.md). Copia las
   skills y el agente a `~/.claude/`, pregunta dónde viven tus proyectos y verifica todo.
3. Al final ofrece equipar la máquina con el menú curado de skills (`/arquitecto-skills`).

Para actualizar una PC que ya lo tiene: decirle al Equipador **`actualizate`**.

**La regla de la casa:** este repo es la fuente; `~/.claude/` es una copia. Los cambios se hacen en
`kit/`, se sincronizan a `~/.claude/` y se commitean. Nunca se edita `~/.claude/` directo.

## Versiones, pendientes, licencia

- **Versiones:** los tags de git (`git tag`); qué trajo cada una, en [`docs/CHANGELOG.md`](docs/CHANGELOG.md).
- **Qué falta:** [`docs/TODO.md`](docs/TODO.md) (la única lista de pendientes).
- **Licencia:** [MIT](LICENSE), salvo `docs/consulta/referencia-prompts-fyd.md`, que reproduce texto
  de FyD Sistemas y no está cubierto.
