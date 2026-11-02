# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**Última sesión cerrada:** 2026-11-02, **D6.1** (Opus, sin Guido, PC `Draco-PC`, ~3 h, 8 encargos): "preparame esta PC", el `doctor`
completo y el núcleo del actualizador (`aplicar` y `chequear`) en `main`. **El paquete 6 sigue en D6.2.** `kit-sync` LIMPIO.

## Dónde estamos

- **Paquetes 1 a 5 ✅; el 6 a medias.** D6.1 hizo el delta del paquete entero (`docs/kit-v3/SPEC-paquete-6.md`, red team 1 ronda, sellado
  por script), `preparar-pc.cjs`, el `doctor` de 26 chequeos, `actualizar.cjs aplicar` (catálogo, moldes, guardia) y `chequear` (nueve
  líneas). ⚠️ **D6-1: nadie corre en bypass**: el actualizador es un script de node; contradice el SPEC-0 y vuelve al diseño en D6.2.
- Suite entera **2.575 de 2.575**; pruebas del paquete 156/156; mutación 23/25 · 24/25 · 25/25.
- Hoja de ruta ADR-025: 5 construir v3.0 (1-5 ✅, 6 a medias; siguen 7, 8, 8½, piloto, tag) → 6 el ciclo → 7 mensajería v3.1.

## Próximo paso

**D6.2**, en Opus, sin Guido, en cualquier PC con el kit (`Draco-PC` lista): **`vibe-kit M5 · D6.2 · Paquete 6, cierre: la flota de punta
a punta y el adoptador`**. Guido pega el prompt de "Abrir D6.2 sin Guido (el prompt)" del tracker (`docs/kit-v3/PLAN-construccion.md`) y se
va. Sin delta nuevo ni red team. **Primero** "Paquete 6 · para D6.2" de Pendientes: la línea 7 de `chequear` (2 casos de `candado.test.cjs`
dan rojo fuera del repo, y la tanda de hooks tarda 12-18 min) haría "rota" toda actualización sana desde v2. **Y la fusión de piezas
adaptadas no se corta** (D6-19, opción C, decidida por Guido): con porqué, sola; sin porqué, a "te espera" con el diff y una pregunta.

**Para Guido, cuando pueda (no traba nada)**, con el detalle en Pendientes del tracker ("Paquete 6 · te espera a vos", y los del 3 al 5):
- repasar las ⚠️ de D6.1 (sobre todo D6-1, nadie en bypass) y las de D5.1-D5.3;
- "preparame esta PC" de verdad en la segunda PC, cuando haya un tag nuevo (el `v2.4.3` no trae `preparar-pc`);
- lo de antes: `/estado` y "me voy" en `alfa`, la pestaña del obrero sin pop-ups, el Arquitecto en un proyecto v2, los hooks por PC, borrar
  4 transcripts de D3.3.

## Cosas que muerden y no están en ningún otro doc

- 🔒 **El clasificador del modo `auto` frena lanzar `claude.exe -p` en bypass**; con `acceptEdits` + `--allowedTools` pasa. También frena
  `kit-sync sync` a mitad de sesión: va como primer paso del `/cierre`.
- 🔴 **gitleaks antes de cada push, sin tubería** (`gitleaks … ; echo $?`, push solo con 0): en D6.1 un `| tail` tapó la salida y un falso
  positivo llegó al repo público. vibe-kit es PÚBLICO. Y el repo no tiene `.githooks/` propios: el gitleaks del director es la única red.
- 🧪 **Sesiones reales**: el pedido por stdin con `printf`, el `claude.exe` de la extensión de VS Code (no está en el PATH). En un clon sin
  confianza se ignora el `allow` del `settings.json` (las `deny` y los hooks sí valen).
- 🧪 **La suite entera tarda ~16 min** (`node --test "kit/**/*.test.cjs"`): en segundo plano, una vez, al final.
- 🧩 **Copias byte a byte**: `pc/lib/*.cjs` del Equipador copia `molde/hooks/lib/` (lo vigila `pc/lib.test.cjs`).
- 🗂️ **Cada encargo, su worktree en `scratchpad/<x>/wt`**. Los repos de prueba se miran con Bash, nunca con Read; para probar el actualizador,
  un `git clone` de `../vibe-kit-pruebas/remotos/<x>.git` a un temporal con `.kit-rol` = `actualizador` y en `.git/info/exclude`.
- 💻 **En `Draco-PC`**: `python` es el atajo de la Store (el de verdad, `~/AppData/Local/Programs/Python/Python313/python.exe`); gitleaks en
  `~/AppData/Local/Microsoft/WinGet/Links/` (`--no-banner`). Heredocs largos con backticks se rompen: script a un archivo y correrlo.
- 🔑 **Identidad de git**: `guido.camera.eq@gmail.com`. Nunca `eq.chatgpt`.
- 📬 **El Hub pushea a este repo desde otra sesión**: `git fetch` antes de cerrar.

## Bloqueos

Ninguno.
