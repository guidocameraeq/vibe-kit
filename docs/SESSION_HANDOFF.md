# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**Última sesión cerrada:** 2026-10-29, sesión intermedia de la misión 5 en la PC `Usuario` (Opus, con Guido): historial de chats
completo en el privado, la PC preparada para seguir el paquete 3, y el paquete 3 partido en D3.2 y D3.3. `kit-sync` LIMPIO.

## Dónde estamos

- **Paquete 3 en curso**: delta sellado sin Guido (provisorio). En `main`: G2, G8, G9. **G3, G4, G5 y G6 a medias en ramas de `origin`**
  (`wip/d3.1-g3-git-seguro`, `-g4-sensible`, `-g5-secretos`, `-g6-barreras`). Qué tiene cada una: tracker, "Pendientes".
- **Guido trabaja ahora en `Usuario`**. Ya preparada: `kit-sync` LIMPIO, repos de prueba en `../vibe-kit-pruebas/` (verdes), y el corpus
  del historial en `C:\Users\Usuario\vibe-historial\` (16.470 llamadas; más chico que el de `clientes`, ver tracker).
- **Los chats**: `vibe-research/chats/` tiene todo el historial hasta hoy, de las tres PCs (A, C y E vinieron de la notebook del
  compañero). Desde ahora, **el `/cierre` sube el chat de cada sesión** (paso 5).
- Hoja de ruta ADR-025: 4 ✅ → 4½ ✅ → **5 construir v3.0** (paquetes 1 y 2 ✅, 3 🔨) → 6 el ciclo → 7 mensajería v3.1.

## Próximo paso

**D3.2**, en Opus, en `Usuario`, sin Guido: **`vibe-kit M5 · D3.2 · Paquete 3, segunda vuelta: terminar G3-G6 desde sus ramas WIP`**.
Guido pega el prompt de **"Abrir D3.2 y D3.3 sin Guido"** del tracker (`docs/kit-v3/PLAN-construccion.md`) y se va. Alcance: solo G3-G6,
de a dos Opus (G3 ∥ G6, después G4 ∥ G5), mutación con tope, merge a `main` y se borran las ramas `wip/*`. Después, **D3.3** (G7,
G10-G13, revisor frío, `/cierre`), con su propio prompt, recién cuando D3.2 cerró.

**Para Guido, cuando pueda (no traba a D3.2)**: repasar las ⚠️ de D3.1 y D2.2 en el tracker; las pruebas en una pestaña real de D2.2.
**Pendiente de la notebook**: borrar el repo temporal `jrobilara/vibe-chats-paso` (ya está todo en el privado); espera que Guido
apruebe `gh auth refresh -h github.com -s delete_repo` allá, o lo borra a mano desde la web.

## Cosas que muerden y no están en ningún otro doc

- 📉 **Cuota**: D3.1 cortó por eso; el plan semanal renueva el 1-11. Un freno con medición + mutación tarda 1-2 h: de a dos Opus.
- 🗂️ **El corpus no viaja** (secretos reales): vive en `C:\Users\Usuario\vibe-historial\`, fuera de todo repo. Se rehace con
  `node extraer.cjs` ahí mismo (~8 s). Los arneses originales: `vibe-research/mision-5/medicion-historial/`.
- 🗄️ **vibe-research está clonado** en `Desktop\Proyectos\vibe-research` (al lado de vibe-kit, fuera de él). La cuenta de la notebook
  (`jrobilara`) **no** tiene acceso, por decisión de Guido: lo de esa PC viaja por otro camino (su handoff anota el id).
- 🗂️ **Cada encargo en paralelo, su propia subcarpeta del scratchpad**: G2, G6 y G9 se pisaron los `mutar.cjs`.
- 🧪 **`claude -p` desde Git Bash con un prompt que empieza con `/`**: `MSYS_NO_PATHCONV=1`. En `-p` un clon que no es de confianza ignora el
  `permissions.allow` del proyecto.
- 🧪 **Los repos de prueba se miran con Bash, nunca con Read**. La suite: `node --test "kit/**/*.test.cjs"`, ~27 min.
- 🔑 **Identidad de git**: `guido.camera.eq@gmail.com`. Nunca `eq.chatgpt`. Los repos de prueba, `kit-pruebas`.
- 📬 **El Hub pushea a este repo desde otra sesión**: `git fetch` antes de cerrar. 🔴 **vibe-kit es PÚBLICO**: gitleaks antes de cada push.

## Bloqueos

Ninguno para D3.2.
