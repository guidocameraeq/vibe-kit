---
name: inicio
description: Ritual de inicio de sesión del proyecto. Cruza lo que inyectó el hook de arranque con git, confirma en tres líneas, dice el tamaño del pedido y sigue con él. Usar cuando el dueño dice "inicio", "retomemos", "arranquemos", "¿en qué quedamos?" o al abrir una sesión de trabajo nueva. No usar a mitad de una sesión ya arrancada ni para dejar anotado al terminar (eso es /cierre).
---

# /inicio — arrancar una sesión

El hook de arranque ya inyectó el handoff, la cabecera del TODO y el estado de git. **No los releas**: es costo puro de contexto. Solo mirá la primera y la última línea de lo inyectado.

## Pasos

1. **Chequear lo inyectado.**
   - Primera línea `CORTADO: …`: leé con Read lo que falta (la ruta viene en la línea) **antes** de confirmar, y anotá para el `/cierre` que hay que achicar el handoff o el TODO.
   - Última línea `inyectado: N de 9.700` (la huella). **Si no está**, el hook no corrió: decí "el hook de arranque no corrió: corré doctor" y leé a mano `docs/SESSION_HANDOFF.md` y la cabecera de `docs/TODO.md`.
2. **Cruzar con git** (todo local, mostrá solo lo que llame la atención):
   - `git fetch`, `git status -sb`, `git log -1 --format='%h %s (%cr)'`.
   - La rama en la que estás, y la rama por defecto contra `origin/<rama por defecto>` (`git rev-list --left-right --count <rama por defecto>...origin/<rama por defecto>`): ¿adelantada, atrasada, distinta?
   - ¿El último commit y el árbol coinciden con lo que dice el handoff? ¿Dice "estado viejo", "hacé pull" o tiene más de 7 días? Entonces manda git, no el handoff.
3. **Aprobados nuevos.** Corré `node .claude/scripts/cambios.cjs listar --aprobados-nuevos`. Si imprime líneas, mostrá "aprobados nuevos desde tu última sesión: <ids>" (el primer campo de cada línea) con quién los selló; si no imprime nada, no digas nada. Si el script falla, una línea que lo dice y seguí.
4. **Confirmar en tres líneas**: **Estado** · **Próximo paso** (del handoff y del TODO) · **Bloqueos** (y lo que le espera al dueño, si el handoff lo trae). Si no dio la misión, preguntala.
5. **El tamaño del pedido, en una línea y sin preguntar, antes de cualquier herramienta o skill** (antes de invocar `/arquitecto`). Dos preguntas: ¿hace falta algo más que el pedido y el `git diff` para retomarlo? ¿lleva más de una sesión? Ninguna sí: *"chico, lo hago acá"*. Alguna sí: *"esto es más que chico: llamo al Arquitecto"*. Un arreglo o ajuste puntual de algo que ya existe es chico; algo nuevo con decisiones de diseño abiertas (dónde se guarda, qué formato, qué pasa si…) es más que chico. Consultas y hotfixes son chicos; tocar plata, permisos o datos reales no lo agranda. Si el pedido nombra algo que no encontrás, igual medí por lo que pide; la duda va después de la línea.
6. **Worktree, solo si hay otra sesión viva en este checkout.** Contá las marcas de menos de 12 h: `find "$(git rev-parse --git-dir)/kit-sesiones" -type f -mmin -720 | wc -l`. Restale la tuya (la más nueva). Si queda alguna, proponé en una línea trabajar en un worktree aparte; si no, nada.
7. **Seguir o preguntar.** Si el pedido ya vino con el mensaje, decí el tamaño (paso 5) y seguí: chico, lo hacés; más que chico, invocás `/arquitecto`; no esperes otro OK. Si no vino, preguntá cuál es la misión y no toques nada hasta tenerla.

## Reglas

- **Una sesión = una misión.** Si a mitad aparece otra distinta de verdad, proponé `/cierre` y chat nuevo.
- Esta versión todavía no mira la mesa de proyectos ni el sello del Arquitecto en un módulo recién creado: llegan con un kit posterior. Si hacen falta, decíselo al dueño; no los improvises.

<!-- kit:propio -->
## Lo propio de este proyecto

*Los pasos que agrega este proyecto a su arranque. El kit no pisa esta zona al actualizar.*
<!-- /kit:propio -->
