# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**Última sesión cerrada:** 2026-11-03, **D8.1** (Opus, PC `Guido-PC-eQ`, ~1,4 h, 8 encargos; Guido estuvo al principio): la línea base
medida de nuevo (`observatorio/investigacion/mediciones/2026-11-03.md`, 10 de 10) y la documentación en v3 (PLAYBOOK §1.5, guía, cinco
manuales, notas en los diseños, ADR-033). **Paquete 8 ✅.** Pruebas del observatorio 42/42. `kit-sync` LIMPIO (no se tocó `kit/`).

## Dónde estamos

- **Paquetes 1 a 8 ✅.** Hoy **Guido cambió el plan** (tracker, "Cambios al plan", 2026-11-03): **sin piloto de prueba en Deptos**; antes del
  release repasa las decisiones sin él y después la prueba es **en un proyecto de verdad** (recomendado Hermes Desktop, con un módulo nuevo;
  Mobile no). El SPEC-0 (orden 9) y las filas D9.x **no se tocaron**: se reescriben con él.
- Para eso está `docs/kit-v3/DECISIONES-SIN-GUIDO-en-criollo.md`: ~150 decisiones, 54 que le afectan por tema, las 5 para mirar primero y 4
  preguntas abiertas.

## Próximo paso

**Una sesión CON Guido**, en Opus: **`vibe-kit M5 · Repaso de decisiones y la prueba real`**. Guido pega el prompt de "Después de D8.1: una
sesión CON Guido" del tracker (`docs/kit-v3/PLAN-construccion.md`): repasar la página en criollo y las ⚠️ de D8.1, decidir el proyecto,
cuándo va el tag (`-rc` o `v3.0`) y el 8½ (las llaves de ese proyecto); con eso se reescriben el orden 9, las D9.x y el prompt siguiente.
Nada de código ahí.

**Para Guido, cuando pueda** (detalle en Pendientes del tracker): lo de antes (las ⚠️ de D2-D7, "preparame esta PC" en la segunda PC, la
pestaña real en `alfa`, borrar 4 transcripts de D3.3) y de D8.1: mirar el mapeo alias → repo en `vibe-research/mediciones/2026-11-03/`
("Bot personal" quedó asignado por fecha).

## Cosas que muerden y no están en ningún otro doc

- 🔐 **En `Guido-PC-eQ` el administrador de credenciales de git pide una ventana** para pushear y para clonar el privado (a la mañana no;
  desde ~09:50 sí): sin nadie, falla con "User cancelled dialog" o se cuelga. Se pushea con
  `git -c credential.helper= -c 'credential.helper=!gh auth git-credential' push …`. `gh auth setup-git` lo deja fijo (es de Guido).
- 🔑 **Identidad de git**: `guido.camera.eq@gmail.com` (en esta PC estaba la `noreply` de GitHub: quedó fija en el `.git/config` local de
  vibe-kit; un commit del 03-11, `b10739c`, salió con la `noreply`). Nunca `eq.chatgpt`.
- 🔒 **El clasificador del modo `auto` frena lanzar `claude.exe -p` en bypass**; con `acceptEdits` + `--allowedTools` pasa. También frena
  `kit-sync sync` a mitad de sesión: va como primer paso del `/cierre`.
- 🔴 **gitleaks antes de cada push, sin tubería** (`gitleaks … ; echo $?`, push solo con 0). vibe-kit es PÚBLICO: es la única red.
- 🐍 **Python**: `py -3` (no `python3`, que es el atajo de la Store). La corrida mensual: `METODO.md`, con `diff.renames false` en cada clon
  `blob:none` (si no, `repos.py` cuelga).
- 🧪 **Probar la flota**: copias de `../vibe-kit-pruebas/remotos/*.git` a un temporal, un canónico `bare` con `kit/VERSION` 3.0.0 y un tag
  **anotado** `v3.0.0-rc.1`, y `actualizar.cjs flota … --canon <bare> --proyectos <temporal> --claude no`. `gama` puro tarda ~18 min.
- 🧪 **La suite entera tarda ~17-20 min** (`node --test "kit/**/*.test.cjs"`): en segundo plano, una vez, al final.
- 🧩 **Copias byte a byte**: `pc/lib/*.cjs` del Equipador y `arquitecto/scripts/lib/ficha.cjs` copian `molde/hooks/lib/`: `cmp` contra el molde.
- 🗂️ **Cada encargo, su worktree en `scratchpad/<x>/wt`**; un encargo puede commitear archivos de trabajo sueltos: mirar el `--stat` antes del merge.
- 📬 **El Hub pushea a este repo desde otra sesión**: `git fetch` antes de cerrar.

## Bloqueos

Ninguno técnico. **Lo que sigue espera a Guido** (la sesión de repaso y la elección del proyecto).
