# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**Última sesión cerrada:** 2026-10-31, **D5.1** de la misión 5 en la PC `Usuario` (Opus, sin Guido, dos tramos por una pausa pedida, ~3,5 h,
8 encargos). **El paquete 5 va por la mitad** (D5.1 ✅, sigue D5.2). `kit-sync` LIMPIO.

## Dónde estamos

- **Paquetes 1 a 4 ✅; el 5 🔨.** D5.1 hizo "el día" del canon director/obrero: núcleo, `/director`, `/obrero`, el revisor, `encargo.cjs`
  (`presentar` con el corrector "spec sin sello", `mensaje`, `autorizado`, `verificar`) y `worktree integrar`. Delta sellado sin Guido.
- **Medido en sesiones reales**: un obrero lanzado con la línea de `autorizado` (`acceptEdits`, sin bypass) **para sin commit** ante un spec sin
  sello (crit. 3 del kit ✅), y con uno sellado hace su sub-paso, revisor y CIERRE; después `verificar` 6/6, merge, `integrar` y `cerrar`.
- **Hallazgo de esas corridas**: Claude Code **ignora las `deny` con `Write(...)`** (solo mira `Edit(...)`); las del molde no frenan nada. Hoy
  las cubren los hooks. Es lo primero de D5.2.
- **Decisiones sin Guido de D5.1**: tracker, "D5.1 · Decisiones sin Guido" (las ⚠️ arriba). Ninguna pregunta abierta.
- Hoja de ruta ADR-025: 5 construir v3.0 (1-4 ✅, el 5 a la mitad) → 6 el ciclo → 7 mensajería v3.1.

## Próximo paso

**D5.2**, en Opus, en `Usuario`, sin Guido: **`vibe-kit M5 · D5.2 · Paquete 5, segunda mitad: la noche, /estado, el resumen y la mesa`**.
Guido pega el prompt de "Abrir D5.2 sin Guido (el prompt)" del tracker (`docs/kit-v3/PLAN-construccion.md`) y se va. Sin delta nuevo ni red
team (el delta es del paquete entero); primero "Paquete 5 · para D5.2" de Pendientes (las `deny` con `Write`). Si no entra, la mesa y el
corrector de afirmaciones a un D5.3.

**Para Guido, cuando pueda (no traba a D5.2)**, con el detalle en Pendientes del tracker ("Paquete 5 · te espera a vos", y los del 3 y el 4):
- la pestaña real del obrero en VS Code: cero pop-ups para git, `encargo.cjs` y el test (fila 3 del delta);
- repasar las ⚠️ de D5.1: nadie en bypass (D5-2), tu pestaña en tu modo (D5-19), `integrar` sin `/cierre` (D5-3);
- lo de antes: el Arquitecto en un proyecto v2, la pestaña en un worktree, los hooks por PC en las dos PCs, borrar los 4 transcripts de D3.3.

## Cosas que muerden y no están en ningún otro doc

- 🔒 **El clasificador del modo `auto` frena lanzar `claude.exe -p` en bypass**; con `acceptEdits` + `--allowedTools` pasa (D5.1 lo usa como
  canon). También frena `kit-sync sync` a mitad de sesión: va como primer paso del `/cierre`.
- 🧪 **Sesiones reales**: la línea de fondo de `encargo.cjs autorizado` ya trae todo (el pedido por stdin con `printf`, el `claude.exe` de la
  extensión de VS Code, que no está en el PATH). Desde Git Bash, nunca `-p "/algo"` por argumento (MSYS lo vuelve ruta) ni `MSYS_NO_PATHCONV`.
  Leé el log entero de la corrida: los avisos de la plataforma están arriba. Con un `HOME` falso da "Not logged in".
- 🧪 **La suite entera tarda ~20-30 min**: siempre en segundo plano, una vez, al final. `node --test "kit/**/*.test.cjs"`.
- ⏱️ **Los encargos se cuelgan o terminan con trabajo de fondo vivo**: se retoman con `SendMessage` (también tras un corte de internet: el WIP
  commiteado en su rama alcanza), o `TaskStop` si ya entregaron.
- 🗂️ **Cada encargo, su worktree en `scratchpad/<x>/wt`**; los clones no traen `core.hooksPath` (ponerlo a mano). Los repos de prueba se miran
  con Bash, nunca con Read; para una corrida, un clon con copia propia del remoto (`remotos/alfa.git`).
- 🔑 **Identidad de git**: `guido.camera.eq@gmail.com`. Nunca `eq.chatgpt`.
- 📬 **El Hub pushea a este repo desde otra sesión**: `git fetch` antes de cerrar. 🔴 **vibe-kit es PÚBLICO**: gitleaks antes de cada push.

## Bloqueos

Ninguno para D5.2.
