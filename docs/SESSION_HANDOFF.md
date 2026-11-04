# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**Última sesión cerrada:** 2026-11-04, **D8r.2** (Opus, `Guido-PC-eQ`, ~5 h, 8 encargos, sin Guido): **la tanda de taller de R1b =
la beta `v3.0.0-rc.3`** (tag anotado `v3.0.0-rc.3`, pusheado). Suite 2.867/2.867 (2 re-corridas: una de plazo, una prueba del doctor
que ya no armaba un repo); flota 2.4.2 → rc.2 → rc.3 sale 0 (un módulo mezclado no saltea, uno sin mezclar sí). `kit-sync` LIMPIO.

## Dónde estamos

- **R1b arreglado en su parte de taller** (`docs/kit-v3/SPEC-paquete-8r2.md`, t1-t12): el pull de la adopción es un paso propio
  (`adoptar <clon> --traer <carpeta>`, después del push, y recién ahí los githooks); los comandos de la ficha y el gate corren en Git
  Bash (un `cmd //c` ya no da verde sin correr); Python con el `.venv` de cada worktree; la flota de la PC a dos niveles; `quedarse`.
- **D1-D4 NO se decidieron**: la pantalla de adopción (`--mirar`) las muestra con la recomendada primero, y cada camino anda en un
  comando: `--director kit` (D1 A), `--permisos recomendada` (D2), `--arranque kit` (D3); D4 en la propuesta (`datos-reales:` con la
  lista de comandos: `sí` no se lee).
- **Chequeo frío sobre un clon de Hermes**: anduvo de punta a punta (mirar → aplicar con la A → commits → push → traer → sello →
  `worktree crear` con el `.venv` → el gate en Git Bash). El test de Hermes corrió de verdad en el worktree (15.168 pasan, 1 roja,
  supuestamente por `node_modules` de `web/`: `--mirar` ahora avisa el `web/package.json`).
- **El plan cambió**: D8c.1 pasa a ser la `rc.4`. Tracker: "Cambios al plan", "D8r.2 · Decisiones sin Guido", Pendientes "De D8r.2".

## Próximo paso

**La mañana con Guido** (`vibe-kit M5 · Mañana: preparar la PC y adoptar Hermes`, tracker "Mañana con Guido"). **Abre con D1-D4**
(`REVISION-INTEGRAL-rc2.md`, en criollo, la recomendada primero), después las ⚠️ de D8r.1 y D8r.2; "actualizate" (la PC en la `rc.3`),
`adoptar --mirar --principal` sobre un clon de Hermes, la pantalla (comandos, `entornos:`, D1-D4, el `web/`), `cargar-secreto` con
`vars.proyecto`, `--aplicar` con lo elegido, commits, barreras, push, `--traer`, y el módulo con `/arquitecto`.

## Cosas que muerden y no están en ningún otro doc

- 🔐 **En `Guido-PC-eQ` el push va por `gh`**: `GIT_TERMINAL_PROMPT=0 git -c credential.helper= -c 'credential.helper=!gh auth git-credential' push …`.
- 🔑 **Identidad de git**: `guido.camera.eq@gmail.com`. Nunca `eq.chatgpt`.
- 🔴 **gitleaks antes de cada push, sin tubería** (`~/AppData/Local/Microsoft/WinGet/Links/gitleaks.exe detect`; push solo con 0). Repo PÚBLICO.
- 🐍 **Python**: `py -3`. **En el Bash de esta app los heredocs pierden barras invertidas**: escribir archivos con Write/Edit.
- 🧪 **La flota**: copias de los remotos de `../vibe-kit-pruebas/`, canónico bare con tag anotado, `--claude no`; la receta de D8r.2:
  `flota.sh` en su scratchpad (2.4.2 → rc.2 → mezclar → rc.3). **Nunca a la vez que la suite** (~50 min, en segundo plano, sola).
- 🧩 **Copias byte a byte**: `pc/lib/*.cjs` (ahora con `proceso.cjs`) y `arquitecto/scripts/lib/{ficha,sello,proceso}.cjs` copian
  `molde/hooks/lib/`; `repos.cjs` vive en `arquitecto/scripts/lib/` con su copia en `arquitecto-skills/scripts/lib/`.
- 🗂️ **Cada encargo, su worktree en `scratchpad/<x>/wt`**; el `--stat` antes del merge. Dos encargos en el mismo archivo: mergeá uno y
  que el otro mergee `main` y resuelva (lo hizo A2).
- 📬 **El Hub pushea a este repo desde otra sesión**: `git fetch` antes de cerrar.

## Bloqueos

Ninguno técnico. Lo que sigue: la mañana con Guido, que abre con D1-D4.
