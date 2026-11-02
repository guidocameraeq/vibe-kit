# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**Última sesión cerrada:** 2026-11-02, **D5.2** (Opus, sin Guido, PC `Draco-PC`, ~2,2 h, 8 encargos): la segunda mitad del paquete 5 en
`main` salvo el corrector de afirmaciones, que pasa a **D5.3**. `kit-sync` LIMPIO.

## Dónde estamos

- **Paquetes 1 a 4 ✅; el 5 🔨, le falta solo D5.3.** D5.2 hizo la noche (`.kit-noche` vale como `nocturno` en los hooks, `verificar` y el
  githook; `noche.cjs me-voy`/`volvi`/`despertador`), `contexto.cjs`, `tiempos.cjs`, `/estado`, el resumen del día, `/tramo` y 6 agentes con
  `effort:`, `paquete.cjs`, la mesa (`mesa.cjs`, `candado:mesa`, los seis tipos en `mensaje`), el `CLAUDE.md` del molde por los 11 criterios,
  `/smoke`/`/release` como contratos, y las `deny` del molde sin `Write(...)` (la plataforma solo mira `Edit`).
- Revisor frío: 10 hallazgos, 2 ALTOS (la noche no terminaba nunca; `verificar` contaba de noche lo de día), arreglados en un encargo.
- Sesiones reales: el `Write` a `.claude/cambios/` negado por la `deny` de `Edit` y sin el aviso; `/estado` de verdad; con `.kit-noche`, el hook
  niega con PARADA. Suite 2.431/2.432 (la que falló, una copia byte a byte que faltaba: arreglada, `pc/` 75/75).
- Hoja de ruta ADR-025: 5 construir v3.0 (1-4 ✅, el 5 casi) → 6 el ciclo → 7 mensajería v3.1.

## Próximo paso

**D5.3**, en Opus, sin Guido, **en la PC `clientes`** (ahí vive el historial de Hermes): **`vibe-kit M5 · D5.3 · Paquete 5, cierre: el
corrector de afirmaciones medido contra Hermes`**. Guido pega el prompt de "Abrir D5.3 sin Guido (el prompt)" del tracker
(`docs/kit-v3/PLAN-construccion.md`) y se va. Es chico: ~2 h y ~4 encargos. **Si Guido está en otra PC, D6.1 puede ir antes** (el corrector
no la traba); entonces se arma su prompt con el de D5.3 como modelo.

**Para Guido, cuando pueda (no traba nada)**, con el detalle en Pendientes del tracker ("Paquete 5 · te espera a vos", y los del 3 y el 4):
- en una pestaña real en `alfa`: `/estado`, "me voy" en un módulo con director y `/inicio` al otro día (borra la marca);
- repasar las ⚠️ de D5.1 y D5.2 (la noche del director alcanza a sus obreros, `mesa nuevo` sube solo, `Write`→`Edit` en AUTORIZADO);
- lo de antes: la pestaña del obrero sin pop-ups, el Arquitecto en un proyecto v2, los hooks por PC (tres PCs), borrar 4 transcripts de D3.3.

## Cosas que muerden y no están en ningún otro doc

- 🔒 **El clasificador del modo `auto` frena lanzar `claude.exe -p` en bypass**; con `acceptEdits` + `--allowedTools` pasa. También frena
  `kit-sync sync` a mitad de sesión: va como primer paso del `/cierre`.
- 🧪 **Sesiones reales**: el pedido por stdin con `printf`, el `claude.exe` de la extensión de VS Code (no está en el PATH). Desde Git Bash,
  nunca `-p "/algo"` por argumento ni `MSYS_NO_PATHCONV`. Leé el log entero: los avisos de la plataforma están arriba. En un clon sin
  confianza se ignora el `allow` del `settings.json` (las `deny` y los hooks sí valen). Para probar `sensible` en `alfa`: `release: no`, así
  que `vercel --prod` pasa; usá `--borra-datos-reales`.
- 🧪 **La suite entera tarda ~15-30 min**: siempre en segundo plano, una vez, al final. Ojo con `timeout` cortos en las pruebas largas
  (`encargo.test`, `worktree.test`, `barreras.test` ~14 min): cortan y parecen fallas.
- 🧩 **Copias byte a byte**: `pc/lib/*.cjs` del Equipador copia `molde/hooks/lib/` (lo vigila `pc/lib.test.cjs`); si un encargo toca una lib
  del molde, que copie también la del `pc/`.
- ⏱️ **Los encargos terminan con trabajo de fondo vivo**: esperan solos y avisan; si ya entregaron, `TaskStop`.
- 🗂️ **Cada encargo, su worktree en `scratchpad/<x>/wt`**; los clones no traen `core.hooksPath` (`git config core.hooksPath .githooks`).
  Los repos de prueba se miran con Bash, nunca con Read; para una corrida, un clon con copia propia del remoto (`remotos/alfa.git`).
- 💻 **En `Draco-PC`**: `python` es el atajo de la Store; el de verdad es `~/AppData/Local/Programs/Python/Python313/python.exe`. El repo
  privado se clona con `-c core.longpaths=true`. gitleaks vive en `~/AppData/Local/Microsoft/WinGet/Links/`.
- 🔑 **Identidad de git**: `guido.camera.eq@gmail.com`. Nunca `eq.chatgpt`.
- 📬 **El Hub pushea a este repo desde otra sesión**: `git fetch` antes de cerrar. 🔴 **vibe-kit es PÚBLICO**: gitleaks antes de cada push.

## Bloqueos

Ninguno para D5.3, salvo estar en la PC `clientes`.
