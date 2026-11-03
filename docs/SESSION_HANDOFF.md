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

**El orden de las sesiones que siguen está en el tracker, "Después de la rc.1: las sesiones que siguen"** (asentado con Guido el 03-11;
**la sesión madre las orquesta y lanza las que no piden a Guido**, con su visto bueno). **R1 ✅** (la revisión integral, la noche del 03-11:
`docs/kit-v3/REVISION-INTEGRAL-rc1.md`): **adoptar Hermes anda, arrancar el módulo con director no** (T1: la adopción no trae las skills
de director/obrero; T2: la pestaña nueva no sabe su rol; T3: el sello con solo la base real; T4: la guía dice que "preparame esta PC" no
existe). La mañana con Guido **abre con ese informe**: sus 2 preguntas y la tanda de correcciones (T1-T4 antes de adoptar, o el módulo
arranca sin director); después el diseño de los experimentos con Guido y D8c.1 (la `rc.2`). Criterio
nuevo para todas: ADR-034 (la coherencia entre piezas; lo técnico lo decide la sesión).

**La mañana: una sesión CON Guido**, en Opus: **`vibe-kit M5 · Mañana: preparar la PC y adoptar Hermes`**. Los pasos, con qué hace la sesión y qué
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
