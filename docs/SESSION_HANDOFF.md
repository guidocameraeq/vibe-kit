# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**Última sesión cerrada:** 2026-11-02, **D5.3** (Opus, sin Guido, PC `Draco-PC`, ~1,2 h, 3 encargos): el corrector de afirmaciones en
`main`, medido contra el git de Hermes. **El paquete 5 queda ✅.** `kit-sync` LIMPIO.

## Dónde estamos

- **Paquetes 1 a 5 ✅.** D5.3 hizo `afirmaciones.cjs` (lib + CLI sobre las líneas agregadas): **avisa, no frena**. Contra Hermes caza 5 de 9
  sobre-afirmaciones y marca 2,5% de la prosa buena; con falsos positivos, A §5 no lo deja frenar (`--frenar` latente). Lo que Hermes más
  corrigió es prosa obsoleta, que no se ve en las líneas agregadas. Engancha en el paquete del revisor, el obrero y `/tramo`.
- Revisor frío: 8 hallazgos (1 ALTO: una ruta con espacios daba "limpio"), arreglados en un encargo. Pruebas 148/148, mutación 49/49,
  suite entera **2.454 de 2.454**.
- Hoja de ruta ADR-025: 5 construir v3.0 (1-5 ✅; siguen 6, 7, 8, 8½, piloto, tag) → 6 el ciclo → 7 mensajería v3.1.

## Próximo paso

**D6.1**, en Opus, sin Guido, en cualquier PC con el kit (`Draco-PC` lista): **`vibe-kit M5 · D6.1 · Paquete 6: Equipador v3, actualizador,
adoptador y doctor completo`**. Guido pega el prompt de "Abrir D6.1 sin Guido (el prompt)" del tracker (`docs/kit-v3/PLAN-construccion.md`) y
se va. Lleva delta nuevo y red team (toca permisos); ~4 h y ~8 encargos; si no entra, D6.1 y D6.2.

**Para Guido, cuando pueda (no traba nada)**, con el detalle en Pendientes del tracker ("Paquete 5 · te espera a vos", y los del 3 y el 4):
- en una pestaña real en `alfa`: `/estado`, "me voy" en un módulo con director y `/inicio` al otro día (borra la marca);
- repasar las ⚠️ de D5.1, D5.2 y D5.3 (sobre todo: el corrector de afirmaciones avisa y no frena);
- lo de antes: la pestaña del obrero sin pop-ups, el Arquitecto en un proyecto v2, los hooks por PC (tres PCs), borrar 4 transcripts de D3.3.

## Cosas que muerden y no están en ningún otro doc

- 🔒 **El clasificador del modo `auto` frena lanzar `claude.exe -p` en bypass**; con `acceptEdits` + `--allowedTools` pasa. También frena
  `kit-sync sync` a mitad de sesión: va como primer paso del `/cierre`.
- 🧪 **Sesiones reales**: el pedido por stdin con `printf`, el `claude.exe` de la extensión de VS Code (no está en el PATH). Desde Git Bash,
  nunca `-p "/algo"` por argumento ni `MSYS_NO_PATHCONV`. En un clon sin confianza se ignora el `allow` del `settings.json` (las `deny` y
  los hooks sí valen).
- 🧪 **La suite entera tarda ~15-30 min** (`node --test "kit/**/*.test.cjs"`): en segundo plano, una vez, al final.
- 🧩 **Copias byte a byte**: `pc/lib/*.cjs` del Equipador copia `molde/hooks/lib/` (lo vigila `pc/lib.test.cjs`).
- 🗂️ **Cada encargo, su worktree en `scratchpad/<x>/wt`**; los clones no traen `core.hooksPath` (`git config core.hooksPath .githooks`).
  Los repos de prueba se miran con Bash, nunca con Read.
- 💻 **En `Draco-PC`**: `python` es el atajo de la Store; el de verdad es `~/AppData/Local/Programs/Python/Python313/python.exe`. gitleaks
  vive en `~/AppData/Local/Microsoft/WinGet/Links/` (sin `-q`: usá `--no-banner`). Los heredocs largos con backticks se rompen en el Bash de
  la extensión: script a un archivo y correrlo.
- 🔑 **Identidad de git**: `guido.camera.eq@gmail.com`. Nunca `eq.chatgpt`.
- 📬 **El Hub pushea a este repo desde otra sesión**: `git fetch` antes de cerrar. 🔴 **vibe-kit es PÚBLICO**: gitleaks antes de cada push.

## Bloqueos

Ninguno.
