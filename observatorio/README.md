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

## Dónde queda lo crudo (regla, ADR-025)

Este repo es público y genérico: **adentro entra solo el acta**, con alias y gitleaks limpio. **Todo lo crudo de una lectura** (los chats
condensados, los hallazgos por lote, las síntesis, los costos, lo que no se puede mostrar) **va a un repo privado de research propio de quien
usa el método**, en una carpeta por lectura, y **se pushea antes de cerrar la sesión madre** que la lanzó. Nada de eso se borra entre vueltas:
la lectura siguiente arranca de la fecha de corte anterior y vuelve a esas síntesis cuando hace falta. Cuál es ese repo y dónde está su copia
local es de la capa privada (el handoff y la memoria de cada PC), nunca de este archivo.
