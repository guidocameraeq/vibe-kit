# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**Última sesión cerrada:** 2026-10-29, **D3.2** de la misión 5 en la PC `Usuario` (Opus, sin Guido): G3, G4, G5 y G6 del paquete 3
terminados, revisados y en `main`; las ramas `wip/d3.1-*` borradas de `origin`. Suite 1.994 (1 skip, 0 rojas). `kit-sync` LIMPIO.

## Dónde estamos

- **Paquete 3**: en `main` G2-G6, G8, G9 (`comando`, `git-seguro` + `agente`, `sensible`, `secretos` + `pc/lib/`, `barreras --indice/--rango`,
  `cargar-secreto`, `db-guardia`). **Ningún hook nuevo está registrado todavía** en el `settings.json` del molde ni en una PC: eso es G7 y G10.
- Lo que G3-G6 dejaron para D3.3, con qué falta: tracker, "Pendientes" → "de D3.2, para D3.3" (a-g).
- **Decisiones sin Guido de D3.2**: tracker, "D3.2 · Decisiones sin Guido" (5 ⚠️, casi todas de `secretos`, salidas de la medición).
- Hoja de ruta ADR-025: 4 ✅ → 4½ ✅ → **5 construir v3.0** (paquetes 1 y 2 ✅, 3 🔨) → 6 el ciclo → 7 mensajería v3.1.

## Próximo paso

**D3.3**, en Opus, en `Usuario`, sin Guido: **`vibe-kit M5 · D3.3 · Paquete 3, cierre: githooks, instalador, doctor, sesión real, revisor frío`**.
Guido pega el prompt **D3.3** de "Abrir D3.2 y D3.3 sin Guido" del tracker (`docs/kit-v3/PLAN-construccion.md`) y se va. Alcance: G7 y G10
primero, después G11 y G12, G13 al final; el revisor frío (el día normal, no solo ataques) y lo de "Pendientes" del paquete 3; `/cierre`
con el "Próximo paso" en D4.1.

**Para Guido, cuando pueda (no traba a D3.3)**: repasar las ⚠️ de D2.2 y D3.1 en el tracker (las de D3.2 ya las aprobó); las pruebas en
una pestaña real de D2.2 **las posterga a propósito**: D3.3 no lo espera. El prompt de D3.3 se reescribió al cierre de D3.2.
**Pendiente de la notebook**: borrar el repo temporal `jrobilara/vibe-chats-paso` (ya está todo en el privado).

## Cosas que muerden y no están en ningún otro doc

- 📉 **Cuota**: D3.2 cortó una vez a mitad (los dos encargos frenaron y se retomaron con `SendMessage` al renovar, sin perder nada). G5
  tardó ~2 h (la medición empezó con 308 frenos). Las mutaciones: G3 74 min, G6 40, G5 30, G4 25.
- 🧪 **Con dos encargos Opus a la vez la PC se arrastra**: 4 archivos de prueba de G6 tardaron 11-26 min (solos, ~2). La suite entera sola: 10 min.
- 🗂️ **El corpus no viaja** (secretos reales): `C:\Users\Usuario\vibe-historial\`. Cada encargo copia `correr.cjs` a su subcarpeta del
  scratchpad y lo corre con `--corpus` absoluto y `--cwd-raiz` propio (así nada escribe en vibe-historial).
- 🗂️ **Cada encargo, su worktree en `scratchpad/<gN>/wt` y su carpeta**: anduvo sin pisarse. Un archivo vacío `r2.txt` apareció en la raíz
  de vibe-kit mientras corrían G4 y G5 (algún `2>` con el `cwd` mal): se borró. Si vuelve a pasar, mirar el `cwd` de los encargos.
- 🗄️ **vibe-research está clonado** en `Desktop\Proyectos\vibe-research`. La cuenta de la notebook (`jrobilara`) no tiene acceso.
- 🧪 **`claude -p` desde Git Bash con un prompt que empieza con `/`**: `MSYS_NO_PATHCONV=1`. En `-p` un clon que no es de confianza ignora el
  `permissions.allow` del proyecto.
- 🧪 **Los repos de prueba se miran con Bash, nunca con Read**. La suite: `node --test "kit/**/*.test.cjs"`.
- 🔑 **Identidad de git**: `guido.camera.eq@gmail.com`. Nunca `eq.chatgpt`. Los repos de prueba, `kit-pruebas`.
- 📬 **El Hub pushea a este repo desde otra sesión**: `git fetch` antes de cerrar. 🔴 **vibe-kit es PÚBLICO**: gitleaks antes de cada push.

## Bloqueos

Ninguno para D3.3.
