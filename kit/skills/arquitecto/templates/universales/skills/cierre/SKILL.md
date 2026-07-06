---
name: cierre
description: Ritual de cierre de sesión de {{PROYECTO}}. Usar cuando el usuario dice "cierre", "cerrá la sesión", "voy a comprimir", "compact ya", "prepará todo para compactar" o "cierre parcial".
---

# /cierre — cerrar la sesión (después el chat se descarta)

Dos modos:

- **`cierre`** (default, cierre completo): docs al día → commit → push → reporte. Después el usuario descarta el chat y la próxima misión arranca con `/inicio` en un chat nuevo.
- **`cierre parcial`** (la emergencia): el contexto se llenó a mitad de misión. Ejecutar SOLO los pasos 1-2 + avisar "listo para `/compact`". Sin push obligatorio; el chat sigue. Tras el `/compact`, el hook SessionStart re-inyecta el handoff — asumir que NO leí ningún archivo.

## Pasos (modo completo)

1. **Verificar consistencia**: releer `docs/SESSION_HANDOFF.md` (el previo) + `git status` + `git log` de la sesión. Si se tocó un entorno externo (servidor, DB, servicio), verificar su estado real y comparar contra los docs — **la realidad gana**.
2. **`docs/SESSION_HANDOFF.md`** — sobreescribir ENTERO. Es la ÚNICA narrativa de la sesión:
   - Fecha/hora de cierre · último commit
   - Qué se hizo (5-15 bullets) · en qué estado quedó (branch / entorno / DB)
   - Lo que quedó en curso · **próximo paso CONCRETO** (nunca "seguir avanzando") · bloqueos
   - Archivos tocados · contexto importante que no esté en otros docs
3. **`docs/CHANGELOG.md`** — entrada nueva al tope (Added / Changed / Fixed / Removed según corresponda).
4. **`docs/TODO.md`** — tareas completadas AFUERA (la historia queda en CHANGELOG); nuevas con criticidad. El header es solo `YYYY-MM-DD — ver SESSION_HANDOFF.md`.
5. **Otros docs de estado** (si el proyecto los tiene): STATUS solo si cambió el estado de un bloque (tocar la fila, nunca re-contar la sesión); DECISIONS si hubo decisión técnica con alternativas (ADR-NNN + línea en el índice); REJECTED si se descartó algo por preferencia.
6. **SPECs**: si alguna SPEC de `docs/` quedó implementada en esta sesión → marcar el estado en su línea 1 y moverla a `docs/archive/`.
7. **Checklist de regresión** — {{BUGS_HISTORICOS}} — *se llena cuando el proyecto los tenga: los 2-4 bugs que ya volvieron alguna vez, con su verificación de 1 línea. Verificar solo los que esta sesión pudo haber tocado.*
8. **Consistencia de números**: verificar que ningún dato quedó duplicado en dos docs — cada número vive solo en su fuente única.
9. **Memoria**: si cambió un hecho estructural (de cómo trabaja el usuario o del stack) → actualizar la memoria persistente de Claude.
10. **Commit + push**: `git add -A` → mostrar `git status` al usuario → commit `docs: cierre de sesión YYYY-MM-DD — <tema>` → push.
11. **Reporte final**: SHA · archivos actualizados · próximo paso al retomar · bloqueos · **"Chat listo para descartar — la próxima misión arranca con /inicio en un chat nuevo."**

## Edge cases

- Cambios sin commitear que el usuario NO quiere commitear → preguntar: stash / descartar / commit selectivo / dejar sin commitear y anotarlo en el HANDOFF.
- Drift entorno↔repo sin resolver → documentarlo en el HANDOFF como PRIMER paso de la próxima sesión.
- Push falla por conflicto remoto → pull + merge; si el conflicto no es trivial, parar y avisar antes de seguir.
