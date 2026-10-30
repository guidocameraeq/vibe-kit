# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**Última sesión cerrada:** 2026-10-30, **D3.3** de la misión 5 en la PC `Usuario` (Opus, sin Guido, ~9 h): **paquete 3 ✅**. G7, G10-G13
(más G5b y G6b) y dos vueltas del revisor frío, todo en `main`. Suite 2.121/2.121. `kit-sync` LIMPIO. Huella del `~/.claude/` real sin tocar.

## Dónde estamos

- **Paquete 3 cerrado**: githooks con candado doble y gitleaks, todos los hooks del molde registrados (exec, `onFailure: block`), instalador
  de hooks por PC, `doctor`, sesión real con `claude.exe`. **Los hooks por PC NO están instalados en ninguna PC real**: es de Guido.
- **Decisiones sin Guido de D3.3**: tracker, "D3.3 · Decisiones sin Guido" (las ⚠️ arriba, también las del revisor frío).
- **Regla nueva (Guido, 2026-10-30)**: el revisor frío de cada paquete hace **una vuelta con tope** (SPEC-0, "Ejecución"). D3.3 tardó ~9 h
  por las vueltas: no repetir.
- Hoja de ruta ADR-025: 4 ✅ → 4½ ✅ → **5 construir v3.0** (paquetes 1, 2 y 3 ✅; sigue el 4) → 6 el ciclo → 7 mensajería v3.1.

## Próximo paso

**D4.1**, en Opus, en `Usuario`, sin Guido: **`vibe-kit M5 · D4.1 · Paquete 4: Arquitecto v3, sello, formato-spec, worktree y .kit-rol`**.
Guido pega el prompt de "Abrir D4.1 sin Guido (el prompt)" del tracker (`docs/kit-v3/PLAN-construccion.md`) y se va. Primero el spec delta
del paquete 4 con red team (lo sella el director), después los encargos; revisor frío de una vuelta; `/cierre` con el "Próximo paso" en D5.1.

**Para Guido, cuando pueda (no traba a D4.1)** — el detalle, en Pendientes del tracker, "Paquete 3 · te espera a vos":
instalar los hooks por PC en `clientes` y `Usuario` (`--plan`, después sin él, reiniciar, `doctor` en `alfa`, `--sacar-viejo`); la pestaña
real de VS Code; cruzar `block_secrets.ps1` en `clientes`; **borrar 4 transcripts con la clave FALSA de prueba** en `~/.claude/projects`
(`grep -rl "ghp_FALSO" ~/.claude/projects`; el clasificador no dejó que una sesión los borre); repasar las ⚠️ de D2.2, D3.1 y D3.3; borrar
el repo temporal `jrobilara/vibe-chats-paso`.

## Cosas que muerden y no están en ningún otro doc

- ⏱️ **Los encargos Opus se cuelgan** ("stalled: no progress for 600s"): se retoman con `SendMessage` y siguen, sin perder trabajo. Un
  encargo que terminó con trabajo de fondo vivo (una mutación), pararlo con `TaskStop` para que la PC no se arrastre.
- 🧪 **La suite entera tarda ~27 min** (2.121 pruebas) y la de `barreras` sola ~20 con la PC cargada: siempre en segundo plano.
- 🗂️ **El corpus no viaja** (secretos reales): `C:\Users\Usuario\vibe-historial\`. Cada encargo copia `correr.cjs` a su subcarpeta del
  scratchpad y lo corre con `--corpus` absoluto y `--cwd-raiz` propio.
- 🗂️ **Cada encargo, su worktree en `scratchpad/<x>/wt`**, con el `cwd` adentro: anduvo sin pisarse.
- 🧪 **`claude.exe`** está en la extensión de VS Code (`…/anthropic.claude-code-*/resources/native-binary/`), no en el PATH; con un `HOME`
  falso da "Not logged in": la PC falsa va por `--settings`. Prompt que empieza con `/` → `MSYS_NO_PATHCONV=1`.
- 🧪 **Los repos de prueba se miran con Bash, nunca con Read**. La suite: `node --test "kit/**/*.test.cjs"`.
- 🔑 **Identidad de git**: `guido.camera.eq@gmail.com`. Nunca `eq.chatgpt`. Los repos de prueba, `kit-pruebas`.
- 📬 **El Hub pushea a este repo desde otra sesión**: `git fetch` antes de cerrar. 🔴 **vibe-kit es PÚBLICO**: gitleaks antes de cada push.

## Bloqueos

Ninguno para D4.1.
