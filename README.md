# vibe-kit — mi método de vibe coding con Claude Code

> El método completo para dirigir Claude Code sin ser programador: el playbook (documentación +
> sistema de trabajo), el Arquitecto (piensa y monta proyectos nuevos), el Equipador (equipa
> máquinas con skills curadas). Nacido de auditorías reales sobre meses de trabajo (Hermes,
> Perseo). Actualizado 2026-07-06.

## La regla de la casa (desde que esto es un repo)

**La fuente canónica es ESTE repo.** La copia instalada en `~/.claude/` de cada máquina se
sincroniza DESDE acá. El flujo de cambios:

```
editar en kit/ (este repo) → sincronizar a ~/.claude/ → commit + push
```

Para cambiar algo del Arquitecto/Equipador, en un chat de esta carpeta:
*"actualizá el arquitecto: [el cambio] — editá en kit/, sincronizá a ~/.claude y commiteá"*.
Nunca editar `~/.claude/` directo (queda huérfano del historial).

## Estructura

| Qué | Dónde |
|---|---|
| **El método** (documentación + sistema de trabajo, se lee 1 vez por proyecto) | `PLAYBOOK-MAESTRO.md` |
| **El kit instalable** — FUENTE CANÓNICA del Arquitecto + Equipador + menú + templates + agente red-team + su instalador | `kit/` |
| **Guías de uso** (casos de uso, cuándo sí/no) | `guias/` |
| Diseño y roadmap del Arquitecto (Modos B y C pendientes) | `PROPUESTA-VIBE-KIT-V2.md` |
| Archivo histórico (v1, auditorías, snapshots pre-git) | `legacy/` |

## Instalar en una PC nueva

1. Clonar este repo (o llevar el zip de `Desktop\Arquitecto en otras PCs\` si no hay git).
2. Abrir Claude Code en `kit/` y pegar el prompt de `kit/INSTALAR.md`. Se instala solo:
   copia skills y agente a `~/.claude/`, pregunta dónde viven tus proyectos, verifica todo.
3. Al final ofrece equipar la máquina (`/arquitecto-skills` — el menú curado de skills).

## El día a día (una vez instalado)

1. **Proyecto nuevo** → `/arquitecto` en cualquier chat: te entrevista, arma el SPEC-0 con
   gate de aprobación, monta el proyecto en régimen y te da el prompt para el chat constructor.
2. **Trabajo diario en un proyecto** → `inicio` → trabajás → `cierre` (vive en cada proyecto).
3. **Feature grande en app existente** → pensás en el chat del proyecto → spec formato SPEC-0
   a `docs/` → chat NUEVO la construye. Guía completa: `guias/COMO-USAR-EL-ARQUITECTO.md`.
4. **Equipar/actualizar skills de la máquina** → `/arquitecto-skills`.
5. **Montar el sistema en un proyecto existente** → prompt del atajo, `PLAYBOOK-MAESTRO.md` §2.9.

## Mantenimiento

- Cambio al kit → editar en `kit/` → sincronizar a `~/.claude/` → commit + push (una sola
  fuente, historial completo). Los snapshots de `legacy/snapshots/` quedaron para la era
  pre-git; ahora versiona git.
- El zip de `Desktop\Arquitecto en otras PCs\` se regenera desde `kit/` tras cambios grandes.
- PDFs de las guías: se generan a demanda (los MD de `guias/` son la fuente).
- En la otra PC (d:\SAAS): clonar este repo y correr el instalador — su catálogo viejo
  (`legacy/KIT_SKILLS-maquina-dsaas-2026-07-05.md`) se reconcilia con el menú del Equipador.

## Pendientes

- 🔥 **Prueba de fuego del Arquitecto**: primer proyecto real con `/arquitecto` (desbloquea
  Modos B y C — ver roadmap en `PROPUESTA-VIBE-KIT-V2.md`).
- Equipador: probado el modo censo/instalación; faltan estrenar "actualizar" y "agregar al menú".
- Llevar el kit a la PC d:\SAAS (clone + instalador).
