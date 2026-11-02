# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**Última sesión cerrada:** 2026-11-02, **D6.2** (Opus, sin Guido, PC `Draco-PC`, ~3,1 h, 8 encargos): la flota de punta a punta, la
fusión de piezas adaptadas (opción C de Guido) y el adoptador en `main`. **Paquete 6 ✅.** `kit-sync` LIMPIO.

## Dónde estamos

- **Paquetes 1 a 6 ✅.** `actualizar.cjs` hace `aplicar`, `chequear`, `flota` y `adoptar`; es un script de node, nadie corre en bypass
  (ADR-032); el único agente es el de la fusión con conflictos. Prueba viva: `flota alfa beta gama` (mezclados `alfa` y `beta`, `gama`
  salteado) y `gama` v2.4.2 puro → 3.0.0 con las nueve ✅ de `chequear` (crit. 9 del kit ✅).
- Hoja de ruta ADR-025: 5 construir v3.0 (1-6 ✅; siguen 7, 8, 8½, piloto, tag) → 6 el ciclo → 7 mensajería v3.1.

## Próximo paso

**D7.1**, en Opus, sin Guido, en una PC con el kit y acceso al git de Hermes: **`vibe-kit M5 · D7.1 · Paquete 7: el ciclo de cambios y la
portada`**. Guido pega el prompt de "Abrir D7.1 sin Guido (el prompt)" del tracker (`docs/kit-v3/PLAN-construccion.md`) y se va. Delta
nuevo (`SPEC-paquete-7.md`), red team solo si toca un freno o un permiso.

**Para Guido, cuando pueda (no traba nada)**, con el detalle en Pendientes del tracker:
- **una pregunta**: qué cuenta como "porqué" de una pieza adaptada (hoy cualquier commit; la recomendada, solo el `por:` de la ficha);
- repasar las ⚠️ de D6.1 y D6.2 (sobre todo ADR-032, `por:` en la ficha, un hook adaptado siempre pregunta, la adopción en dos commits);
- "preparame esta PC" en la segunda PC con un tag nuevo; "poné al día la flota" en una pestaña en `auto` (con los repos de prueba);
- lo de antes: `/estado` y "me voy" en `alfa`, la pestaña del obrero sin pop-ups, el Arquitecto en un proyecto v2, los hooks por PC,
  borrar 4 transcripts de D3.3.

## Cosas que muerden y no están en ningún otro doc

- 🔒 **El clasificador del modo `auto` frena lanzar `claude.exe -p` en bypass**; con `acceptEdits` + `--allowedTools` pasa. También frena
  `kit-sync sync` a mitad de sesión: va como primer paso del `/cierre`.
- 🔴 **gitleaks antes de cada push, sin tubería** (`gitleaks … ; echo $?`, push solo con 0). vibe-kit es PÚBLICO y no tiene `.githooks/`
  propios: el gitleaks del director es la única red.
- 🧪 **Probar la flota**: copias de `../vibe-kit-pruebas/remotos/*.git` a un temporal, un canónico `bare` clonado de este árbol con
  `kit/VERSION` 3.0.0 y un tag **anotado** `v3.0.0-rc.1`, y `actualizar.cjs flota … --canon <bare> --proyectos <temporal> --claude no`
  (con `--molde-viejo <este árbol>` para `alfa`/`beta`, que tienen el molde actual con ficha 2.4.2). `gama` puro tarda ~18 min (la línea 7).
- 🧪 **Sesiones reales**: el pedido por stdin con `printf`, el `claude.exe` de la extensión de VS Code (no está en el PATH). En un clon sin
  confianza se ignora el `allow` del `settings.json` (las `deny` y los hooks sí valen).
- 🧪 **La suite entera tarda ~16-20 min** (`node --test "kit/**/*.test.cjs"`): en segundo plano, una vez, al final.
- 🧩 **Copias byte a byte**: `pc/lib/*.cjs` del Equipador **y `arquitecto/scripts/lib/ficha.cjs`** copian `molde/hooks/lib/` (lo vigilan
  `pc/lib.test.cjs` y `arquitecto/scripts/lib/copias.test.cjs`): al tocar `ficha.cjs`, las tres.
- 🗂️ **Cada encargo, su worktree en `scratchpad/<x>/wt`**. Los repos de prueba se miran con Bash, nunca con Read.
- 💻 **En `Draco-PC`**: `python` es el atajo de la Store (el de verdad, `~/AppData/Local/Programs/Python/Python313/python.exe`); gitleaks en
  `~/AppData/Local/Microsoft/WinGet/Links/` (`--no-banner`). Heredocs largos con backticks se rompen: script a un archivo y correrlo.
- 🔑 **Identidad de git**: `guido.camera.eq@gmail.com`. Nunca `eq.chatgpt`.
- 📬 **El Hub pushea a este repo desde otra sesión**: `git fetch` antes de cerrar.

## Bloqueos

Ninguno.
