# legacy/ — lo superado, con su lápida

Acá va lo que ya no se usa pero no se borra: el material **consumido** (criterio de ADR-020: nadie lo referencia y su trabajo
ya ocurrió) y lo que reemplazó una versión nueva. Nada de esto es normativo: si contradice al playbook o al kit, mandan ellos.
Cada archivo lleva su lápida arriba (cuándo se archivó, qué era, qué lo reemplazó). Las rutas viejas que citen se leen con la
tabla de ADR-023.

| Qué | Era | Archivado | Lo reemplazó |
|---|---|---|---|
| [`vibe-kit-v1/`](vibe-kit-v1/) | El kit v1: un plugin con comandos y agentes | 2026-07-06 (v2) | El kit v2; el formato plugin se descartó (REJ-001) |
| [`snapshots/`](snapshots/) | Copias del Arquitecto de cuando la fuente era `~/.claude/` (antes del repo) | 2026-07-06 (v2) | Los tags de git (ADR-008) |
| [`dialogo-chat-original-vibekit-jun2026.txt`](dialogo-chat-original-vibekit-jun2026.txt) | La charla original de junio de 2026 en la que nació vibe-kit | 2026-07-06 (v2) | Es fuente: de acá salió la propuesta v2 |
| [`BLUEPRINT.md`](BLUEPRINT.md) | El primer diseño de vibe-kit | 2026-07-06 (v2) | `PLAYBOOK-MAESTRO.md` y el Arquitecto |
| [`AGENTE-ARQUITECTO.md`](AGENTE-ARQUITECTO.md) | Prior-art y diseño del "agente arquitecto" | 2026-07-06 (v2) | `kit/skills/arquitecto/` |
| [`AUDITORIA-USO-CLAUDE-PERSEO.md`](AUDITORIA-USO-CLAUDE-PERSEO.md) | La auditoría del uso de Claude Code en Perseo | 2026-07-06 (v2) | Su evidencia está en el playbook |
| [`PROPUESTA-SISTEMA-PERSEO.md`](PROPUESTA-SISTEMA-PERSEO.md) | El playbook de Hermes fusionado con esa auditoría | 2026-07-06 (v2) | `PLAYBOOK-MAESTRO.md` |
| [`SISTEMA-DOCUMENTACION-VIVA.md`](SISTEMA-DOCUMENTACION-VIVA.md) | La referencia del sistema de documentación (v1.0) | 2026-07-06 (v2) | La parte 1 del playbook |
| [`KIT_SKILLS-maquina-dsaas-2026-07-05.md`](KIT_SKILLS-maquina-dsaas-2026-07-05.md) | El catálogo de skills de una sola máquina | 2026-07-06 (v2) | El menú del Equipador |
| [`PROPUESTA-VIBE-KIT-V2.md`](PROPUESTA-VIBE-KIT-V2.md) | La propuesta del kit v2, "El Arquitecto" | 2026-07-11 (v2.1) | El kit v2.1 (su hoja de ruta se cumplió) |
| [`PROMPT-construir-docs-fyd.md`](PROMPT-construir-docs-fyd.md) | El arranque de la sesión que construyó `/docs-fyd` | 2026-08-03 | `kit/skills/docs-fyd/` |
| [`PROMPT-construir-relevamiento.md`](PROMPT-construir-relevamiento.md) | El arranque de la sesión que construyó `/relevamiento` | 2026-08-03 | `kit/skills/relevamiento/` |
| [`RECORRIDO-relevamiento.md`](RECORRIDO-relevamiento.md) | El relato de uso que le pasó el tono al chat constructor | 2026-08-03 | La skill ya construida |
| [`PRESUPUESTO-relevamiento.md`](PRESUPUESTO-relevamiento.md) | El contrato de líneas del build de `/relevamiento` | 2026-10-13 (ADR-023) | La skill ya construida |

**Lo que no está acá**: lo crudo de las investigaciones (chats condensados, hallazgos, informes de revisión) no se archiva en este
repo público. Vive en el repo privado de investigación (ADR-025).
