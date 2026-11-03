# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**Última sesión cerrada:** 2026-11-03, **D8b.1** (Opus, PC `Guido-PC-eQ`, ~6,7 h, 8 encargos, sin Guido): el paquete 8b y **la beta
`v3.0.0-rc.1` taggeada y pusheada**. Suite 2.774/2.774; la flota (2.4.2 → rc.1 → rc.2 de prueba) sale 0. `kit-sync` LIMPIO: **esta PC
ya tiene la beta en `~/.claude/`** (skills y `VERSION`; los settings y hooks los pone "preparame esta PC").

## Dónde estamos

- **Paquetes 1 a 8 y 8b ✅.** Lo que falta del 8b (el obrero de cierre de tramo, dos textos viejos, tres NO VERIFICADO) está en
  Pendientes del tracker, "De D8b.1, para el `rc.2`". Las decisiones sin Guido: tracker, "D8b.1 · Decisiones sin Guido" (⚠️ arriba).
- La beta nunca frena a Guido: si algo de mañana sale raro, arranca el módulo como hoy y Hermes se adopta al cierre del primer tramo.

## Próximo paso

**Una sesión CON Guido**, en Opus: **`vibe-kit M5 · Mañana: preparar la PC y adoptar Hermes`**. Los pasos, con qué hace la sesión y qué
Guido, en el tracker (`docs/kit-v3/PLAN-construccion.md`), sección **"Mañana con Guido: preparar la PC y adoptar Hermes (8½)"**:
"preparame esta PC" en cada PC → el cruce de `block_secrets.ps1` (está en esta PC) con `secretos.cjs` → `adoptar --mirar` sobre Hermes →
`entornos:` con su clase → `cargar-secreto` (la tipea Guido) → `adoptar --aplicar … --principal` con su OK → el módulo nuevo con
`/arquitecto`. Lo que haya que arreglar sale como `rc.2` (D9.1).

**Para Guido, cuando pueda**: las ⚠️ de D8b.1 (sobre todo D8b.1-c, el (11) a `rc.2`, y D8b.1-e, el gate quitado en un `liviano`), más
lo de antes (Pendientes del tracker).

## Cosas que muerden y no están en ningún otro doc

- 🔐 **En `Guido-PC-eQ` el administrador de credenciales de git pide una ventana**: se pushea con
  `git -c credential.helper= -c 'credential.helper=!gh auth git-credential' push …`. `gh auth setup-git` lo deja fijo (es de Guido).
- 🔑 **Identidad de git**: `guido.camera.eq@gmail.com`. Nunca `eq.chatgpt`.
- 🔴 **gitleaks antes de cada push, sin tubería** (`~/AppData/Local/Microsoft/WinGet/Links/gitleaks.exe`; push solo con 0). Repo PÚBLICO.
- 🐍 **Python**: `py -3` (con `PYTHONIOENCODING=utf-8` si imprime acentos o emojis).
- 🧪 **Los repos de prueba se rehacen al cambiar de PC** (`bash pruebas/rehacer.sh`): en esta PC eran del 29-10, sin el "orden 3", y la
  flota fallaba por eso. **Probar la flota**: copias de los remotos, canónico bare con `kit/VERSION` y tag anotado, `flota … --claude no`.
  **Nunca a la vez que la suite**: la línea 7 de `gama` (~14 min) pasa sus 30 min y da ROTA falsa.
- 🧪 **La suite entera tarda ~20-50 min** según la carga (`node --test "kit/**/*.test.cjs"`): en segundo plano, sola, al final. Las de
  plazo (`crit. 5` de `cambios-flota`) fallan con la PC cargada: se re-corren solas.
- 🧩 **Copias byte a byte**: `pc/lib/*.cjs` del Equipador y `arquitecto/scripts/lib/ficha.cjs` y `sello.cjs` copian `molde/hooks/lib/`.
- 🗂️ **Cada encargo, su worktree en `scratchpad/<x>/wt`**; mirar el `--stat` antes del merge (esta vez, todos limpios).
- 🔒 **`auto` para el obrero**: medido que anda en `-p` y que los porteros siguen negando; el clasificador frena el bypass.
- 📬 **El Hub pushea a este repo desde otra sesión**: `git fetch` antes de cerrar.

## Bloqueos

Ninguno técnico. **Lo que sigue es con Guido** (la mañana del 2026-11-04).
