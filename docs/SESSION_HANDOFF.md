# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**Última sesión cerrada:** 2026-11-02, **D7.1** (Opus, sin Guido, PC `Draco-PC`, ~3 h, 9 encargos; el noveno, al cierre: **todo repo lleva banner, siempre**, decisión de Guido): el ciclo del registro de cambios
(`subio-al-kit`, `cubiertos.md`, `cambios-flota`, la migración de Hermes) y la portada en `main`. **Paquete 7 ✅.** Suite 2.737/2.737.
`kit-sync` LIMPIO.

## Dónde estamos

- **Paquetes 1 a 7 ✅.** Lo nuevo de D7.1: `aplicar` marca `subio-al-kit` lo que `kit/cubiertos.md` nombra y retira la zona propia solo
  con cinco condiciones; `cambios-flota.cjs` (tabla del ciclo y `--urgentes`, renglón nuevo en el `/inicio` de acá); `migrar-cambios.cjs`
  (Hermes en un clon: 103 CM, `verificar` verde); `portada.cjs` + `candado:portada`.
- Hoja de ruta ADR-025: 5 construir v3.0 (1-7 ✅; siguen 8, 8½, piloto, tag) → 6 el ciclo → 7 mensajería v3.1.

## Próximo paso

**Guido sigue en otra PC**: `git pull` en vibe-kit y en `vibe-research` (los chats de `Draco-PC` están subidos hasta este cierre). En esa
PC: `/inicio` (que `kit-sync` dé LIMPIO; si no, `kit-sync sync` trae lo del paquete 7 a su `~/.claude/`), `bash pruebas/rehacer.sh` para los
repos de prueba, y el clon de Hermes se vuelve a bajar al scratchpad cuando haga falta.

**D8.1**, en Opus, sin Guido: **`vibe-kit M5 · D8.1 · Paquete 8: la línea base y la documentación al día`**. Guido pega el prompt de
"Abrir D8.1 sin Guido (el prompt)" del tracker (`docs/kit-v3/PLAN-construccion.md`) y se va. Delta nuevo (`SPEC-paquete-8.md`), sin red
team salvo que toque un freno. Necesita acceso a `vibe-research` (chats y corpus del observatorio).

**Para Guido, cuando pueda (no traba nada)**, con el detalle en Pendientes del tracker:
- repasar las ⚠️ de D7.1 (sobre todo D7-7: el retiro automático de la zona propia, y D7-5: la migración todo clase 2, Mobile afuera);
- la pregunta de D6.2 (qué cuenta como "porqué" de una pieza adaptada; recomendada: solo el `por:` de la ficha);
- "preparame esta PC" en la segunda PC con un tag nuevo (también escribe el `kit-pc.md` que el `--urgentes` necesita: en esta PC hoy dice
  "no sé dónde está la flota"); "poné al día la flota" en una pestaña en `auto` (con los repos de prueba);
- lo de antes: `/estado` y "me voy" en `alfa`, la pestaña del obrero sin pop-ups, el Arquitecto en un proyecto v2, los hooks por PC,
  borrar 4 transcripts de D3.3.

## Cosas que muerden y no están en ningún otro doc

- 🔒 **El clasificador del modo `auto` frena lanzar `claude.exe -p` en bypass**; con `acceptEdits` + `--allowedTools` pasa. También frena
  `kit-sync sync` a mitad de sesión: va como primer paso del `/cierre`.
- 🔴 **gitleaks antes de cada push, sin tubería** (`gitleaks … ; echo $?`, push solo con 0). vibe-kit es PÚBLICO y no tiene `.githooks/`
  propios: el gitleaks del director es la única red.
- 🧪 **Probar la flota**: copias de `../vibe-kit-pruebas/remotos/*.git` a un temporal, un canónico `bare` clonado de este árbol con
  `kit/VERSION` 3.0.0 y un tag **anotado** `v3.0.0-rc.1`, y `actualizar.cjs flota … --canon <bare> --proyectos <temporal> --claude no`
  (con `--molde-viejo <este árbol>` para `alfa`/`beta`). `gama` puro tarda ~18 min (la línea 7).
- 🧪 **Hermes**: se clona `https://github.com/guidocameraeq/hermes-desktop.git` al scratchpad y la migración corre sobre un `git clone` local
  de ese clon (`migrar-cambios.cjs --repo <copia>` y después `node kit/molde/scripts/cambios.cjs verificar` con cwd en la copia).
- 🧪 **La suite entera tarda ~17-20 min** (`node --test "kit/**/*.test.cjs"`): en segundo plano, una vez, al final.
- 🧩 **Copias byte a byte**: `pc/lib/*.cjs` del Equipador (ahora también `cambios.cjs` y `cambios-ruta.cjs`) **y
  `arquitecto/scripts/lib/ficha.cjs`** copian `molde/hooks/lib/`. Dos encargos que crean la misma copia chocan al mergear: quedarse con
  la nueva y `cmp` contra el molde.
- 🗂️ **Cada encargo, su worktree en `scratchpad/<x>/wt`**. Los repos de prueba se miran con Bash, nunca con Read.
- 💻 **En `Draco-PC`**: `python` es el atajo de la Store; gitleaks en `~/AppData/Local/Microsoft/WinGet/Links/` (`--no-banner`). Heredocs
  largos con backticks se rompen: script a un archivo y correrlo. La herramienta para titular la sesión no está en esta app.
- 🔑 **Identidad de git**: `guido.camera.eq@gmail.com`. Nunca `eq.chatgpt`.
- 📬 **El Hub pushea a este repo desde otra sesión**: `git fetch` antes de cerrar.

## Bloqueos

Ninguno.
