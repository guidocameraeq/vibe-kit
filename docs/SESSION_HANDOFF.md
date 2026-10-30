# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**Última sesión cerrada:** 2026-10-30, **D4.2** de la misión 5 en la PC `Usuario` (Opus, sin Guido, ~1,15 h, 3 encargos Sonnet). **El paquete 4
quedó ✅.** `kit-sync` LIMPIO.

## Dónde estamos

- **Paquetes 1 a 4 ✅.** El 4 cerró con las sesiones reales: **Modo B corto de punta a punta** (crit. 4 del kit: sin preguntas, sello y `ready`
  en ~3 min, commit del módulo en `main`, rama y worktree con `.kit-rol` = `director`), **10 de 10 pedidos** (crit. 2 del kit) y el **prototipo**
  antes de las decisiones del spec. La regla del tamaño se afinó para guías que salen de charlar con el dueño y para "de noche" (siempre invoca).
- **Hallazgo**: `rehacer.sh` nunca había puesto el `CLAUDE.md` del molde en los repos de prueba (las corridas de D4.1 medían sin esa regla).
  Arreglado (K2); la verificación de `rehacer.sh` ahora lo exige.
- **El 14b (Modo B corto sin ficha)** quedó a medias por cómo estaba armada la prueba; lo de seguridad pasó. Lo que falta lo cubre tu uso real
  del Arquitecto en un proyecto v2 (abajo).
- **Decisiones sin Guido de D4.2**: tracker, "D4.2 · Decisiones sin Guido" (las ⚠️ arriba). Ninguna pregunta abierta.
- Hoja de ruta ADR-025: 5 construir v3.0 (paquetes 1-4 ✅, sigue el 5) → 6 el ciclo → 7 mensajería v3.1.

## Próximo paso

**D5.1**, en Opus, en `Usuario`, sin Guido: **`vibe-kit M5 · D5.1 · Paquete 5, primera mitad: delta, red team y el canon director/obrero`**.
Guido pega el prompt de "Abrir D5.1 sin Guido (el prompt)" del tracker (`docs/kit-v3/PLAN-construccion.md`) y se va. Es el paquete más
grande: el delta lo parte en dos directores (D5.1 núcleo y canon director/obrero; D5.2 `/estado`, resumen del día, mesa, subagentes).

**Para Guido, cuando pueda (no traba a D5.1)**, con el detalle en Pendientes del tracker ("Paquete 4 · te espera a vos" y "Paquete 3 · te
espera a vos"):
- usar el Arquitecto en un proyecto v2 de verdad (`/arquitecto …`), que además cierra el 14b;
- una pestaña de VS Code en un worktree de `worktree.cjs`;
- instalar los hooks por PC en las dos PCs;
- borrar los 4 transcripts con la clave FALSA de D3.3;
- repasar las ⚠️ de D2.2, D3.1, D3.3, D4.1 y D4.2.

## Cosas que muerden y no están en ningún otro doc

- 🔒 **El clasificador del modo `auto` frena lanzar `claude.exe -p --permission-mode bypassPermissions`** ("Create Unsafe Agents"). Con
  `acceptEdits` + un `--allowedTools` corto (Read, Write, Edit, Glob, Grep, Skill, Agent, `Bash(node:*)`, `Bash(git:*)`…) pasa y alcanza.
  También frena `kit-sync sync` a mitad de sesión: hacelo como primer paso del `/cierre` (así anduvo en D4.2), y las corridas que necesitan el
  kit instalado, después.
- 🧪 **Sesiones reales**: `claude.exe` está en la extensión de VS Code (`…/anthropic.claude-code-*/resources/native-binary/`), no en el PATH. El
  pedido entra **por stdin** desde un archivo: así no hace falta `MSYS_NO_PATHCONV` (si la sesión lo hereda, `node ~/…` falla con `C:\c\…`). El OK, por
  `--resume <session_id>`. Con un `HOME` falso da "Not logged in". Antes de lanzar, grep de la regla que medís en el clon.
- 🧪 **La suite entera tarda ~30 min**: siempre en segundo plano, una vez, al final.
- ⏱️ **Los encargos se cuelgan o terminan con trabajo de fondo vivo**: se retoman con `SendMessage`, o `TaskStop` si ya entregaron.
- 🗂️ **Cada encargo, su worktree en `scratchpad/<x>/wt`**; los clones no traen `core.hooksPath` (ponerlo a mano). Los repos de prueba se miran con
  Bash, nunca con Read. La suite: `node --test "kit/**/*.test.cjs"`.
- 🔑 **Identidad de git**: `guido.camera.eq@gmail.com`. Nunca `eq.chatgpt`.
- 📬 **El Hub pushea a este repo desde otra sesión**: `git fetch` antes de cerrar. 🔴 **vibe-kit es PÚBLICO**: gitleaks antes de cada push.

## Bloqueos

Ninguno para D5.1.
