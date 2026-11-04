# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**Última sesión cerrada:** 2026-11-03 a la noche, **D8r.1** (Opus, `Guido-PC-eQ`, ~4,8 h, 8 encargos, sin Guido): **la tanda de
correcciones de R1 = la beta `v3.0.0-rc.2`** (tag anotado `v3.0.0-rc.2`, pusheado). Suite 2.825/2.825 (dos re-corridas); flota 2.4.2 → rc.1 → rc.2 sale 0 y un módulo mezclado ya no saltea el repo. `kit-sync` LIMPIO.

## Dónde estamos

- **R1 arreglado entero** (`docs/kit-v3/SPEC-paquete-8r.md`): T1-T4 (la adopción trae `/director`; la pestaña nueva arranca en su rol;
  el sello con la tarea 0; la guía al día), los 8 que le cambian algo a Guido (la flota ya no saltea a Hermes para siempre, entre otros),
  lo de taller y las 2 preguntas con su A. Más los 10 del revisor frío que corrió el día de Guido (1 ALTO: la flota a la rc.2 dejaba ROTA
  a todo repo por el tope del `/inicio`).
- **Las 2 preguntas, respondidas por Guido el 03-11** (por la sesión madre): la 1, Hermes **sí** tiene base de prueba (mañana se declara en
  `entornos:` con `clase: prueba`; la tarea 0 queda para otros proyectos); la 2, la A, como la quiere vivir (nunca sola, en criollo, con
  recomendada con criterio).
- **El plan cambió**: esta tanda es la `rc.2`; **D8c.1 pasa a ser la `rc.3`** (cierre de tramo y experimentos). Tracker: "Cambios al plan".

## Próximo paso

**R1b: la sesión madre vuelve a correr la revisión integral** sobre la `rc.2` (mismo prompt que R1, tracker "Abrir R1 sin Guido"; el
informe nuevo al lado del de R1), y **después la mañana con Guido** (`vibe-kit M5 · Mañana: preparar la PC y adoptar Hermes`, tracker
"Mañana con Guido"): "preparame esta PC" (o "actualizate": la PC tiene que estar en la `rc.2` antes de adoptar, el paso 0 de
`flota.md`), `adoptar --mirar` sobre Hermes, `entornos:` con su base de prueba, `--aplicar … --principal … --claude-md` con su OK, y el
módulo con `/arquitecto`.

**Para Guido, cuando pueda**: las ⚠️ de D8r.1 (tracker, "D8r.1 · Decisiones sin Guido": D8r-3 a D8r-7, qué cambia en su día), más las
de antes.

## Cosas que muerden y no están en ningún otro doc

- 🔐 **En `Guido-PC-eQ` el push va por `gh`**: `GIT_TERMINAL_PROMPT=0 git -c credential.helper= -c 'credential.helper=!gh auth git-credential' push …`.
- 🔑 **Identidad de git**: `guido.camera.eq@gmail.com`. Nunca `eq.chatgpt`.
- 🔴 **gitleaks antes de cada push, sin tubería** (`~/AppData/Local/Microsoft/WinGet/Links/gitleaks.exe detect`; push solo con 0). Repo PÚBLICO.
- 🐍 **Python**: `py -3` (con `PYTHONIOENCODING=utf-8` si imprime acentos o emojis). En el Bash de esta app, un heredoc con comillas
  y acentos puede romper: escribir el `.py` a un archivo y correrlo.
- 🧪 **Los repos de prueba**: `bash pruebas/rehacer.sh` (~2 min; nacen con ficha `kit: 2.4.2`). **La flota**: copias de los remotos,
  canónico bare con tag anotado, `--claude no`. **Nunca a la vez que la suite.** La receta de D8r.1: `flota.sh` en su scratchpad
  (2.4.2 → rc.1 → mezclar → rc.2, con un módulo mezclado y uno sin mezclar).
- 🧪 **La suite entera tarda ~20-50 min**: en segundo plano, sola, al final. Los encargos NO la corren (uno la largó y cargó la PC).
- 🧩 **Copias byte a byte**: `pc/lib/*.cjs` y `arquitecto/scripts/lib/{ficha,sello}.cjs` copian `molde/hooks/lib/`. **Un tope, una
  fuente**: el de las skills sale de `chequeo.cjs topeSkill` (lo lee `skills.test`).
- 🧹 **`kit-sync.sh sync` ahora retira de `~/.claude` lo que el kit retiró** (solo si fue del kit en git).
- 🗂️ **Cada encargo, su worktree en `scratchpad/<x>/wt`**; el `--stat` antes del merge.
- 📬 **El Hub pushea a este repo desde otra sesión**: `git fetch` antes de cerrar.

## Bloqueos

Ninguno técnico. Lo que sigue: R1b (sin Guido) y la mañana con Guido.
