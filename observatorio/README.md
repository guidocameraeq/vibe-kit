# observatorio/ — los que miran y anotan, no tocan

Herramientas que **miran algo de afuera del kit, extraen lo que sirve y lo dejan escrito como acta**
en `../tips/`. Ninguna cambia el sistema: **la sesión madre (en la raíz del repo) lee el acta y
decide con Guido qué se aplica** (ADR-010, ADR-023).

```
mira → extrae → acta en tips/tanda-<fecha>.md (con propuestas - [ ]) → la sesión madre decide y aplica
```

| Observador | Qué mira | Cómo se usa |
|---|---|---|
| [`extractor/`](extractor/) | Links de TikToks con tips de vibe coding | Abrir Claude Code en esa carpeta y pegar los links ([guía](extractor/COMO-USAR-EL-EXTRACTOR.md)) |
| [`investigacion/`](investigacion/) | Los chats reales de Claude Code de cada PC | Chat en la raíz: *"investigación de chats, seguí `observatorio/investigacion/METODO.md`"* |

**Un tercero** (otra fuente que valga la pena mirar) va en su propia subcarpeta acá, con el mismo
contrato: escribe solo su acta en `tips/`, nunca toca `kit/`, el playbook ni ningún CLAUDE.md.
