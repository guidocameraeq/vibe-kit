# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**Última sesión cerrada:** 2026-10-29, **misión 5, sesión intermedia DP: decidido no paralelizar**. PC `clientes`, Opus.
`kit-sync` LIMPIO. Detalle: CHANGELOG del 2026-10-29 (DP) y la sección "Paralelizar" del tracker.

## Dónde estamos

- **DP decidió**: la misión 5 sigue **un director por vez**, en el orden del tracker. Paralelizar en la misma PC pedía reglas nuevas y un
  ensayo; Guido: "prefiero hacerlo bien y que tarde más". Lo evaluado quedó en el tracker por si se reabre con las dos PCs.
- **Dos reglas nuevas** (tracker, "Límites" y "Cambios al plan"): **el director no corta por contexto**, termina su fila; y **D2.2 corre
  sin Guido** con su autorización previa: decide con la recomendada y anota cada decisión en "Decisiones sin Guido" de su fila.
- **Kit hecho**: D1.1 y D2.1 (paquete 1 y medio paquete 2), 8 de las 57 piezas del SPEC-0; suite de 496 pruebas verde.
- Hoja de ruta ADR-025: 4 ✅ → 4½ ✅ → **5 construir v3.0** (paquete 1 ✅, paquete 2 a medias) → 6 el ciclo → 7 mensajería v3.1.

## Próximo paso: D2.2, sola

**Título: `vibe-kit M5 · D2.2 · Paquete 2, segunda mitad: candado, cambios, zona propia, /inicio y /cierre v3`**, en **Opus**.
Guido abre el chat con el prompt de DP (empieza con `inicio — misión 5, D2.2`) y se va: **después del `/inicio` no espera OK**. Hace
la fila D2.2 entera (F1-F7 y el revisor frío del delta, sección "Los encargos"), decide con la recomendada y lo anota, no corta por
contexto, deja lo que necesita una persona en "Pendientes", commitea después de cada encargo aceptado y termina con `/cierre` completo.
Lo de "Paquete 2 · para D2.2" del tracker entra en su lista.

## Cosas que muerden y no están en ningún otro doc

- 📉 **El plan semanal estaba al 75% el 2026-10-29 (renueva el 1-11)**: D2.1 gastó 36 M de caché y 7,4 M en subagentes. Si D2.2 se
  corta por el límite, retoma desde el último commit y la fila del tracker.
- 🧪 **Los repos de prueba se miran con Bash, nunca con Read**: leer un archivo suyo mete su `CLAUDE.md` en la sesión.
- 🧪 **`node --test kit/` no anda en node 24**: el comando es `node --test "kit/**/*.test.cjs"`; tarda ~5 min, más con otra cosa corriendo.
- 🧪 **Un obrero en worktree nace de un commit viejo**: el brief le pide `git merge --ff-only main` primero.
- 🔑 **Identidad de git**: en `clientes` el mail es el `noreply` de `guidocameraeq` (vale). Nunca `eq.chatgpt`. Los repos de prueba
  commitean como `kit-pruebas` y no leen la configuración global.
- 🗄️ **El privado `vibe-research`**: se clona en el scratchpad con `core.longpaths` y, para tocar solo el diario, `sparse-checkout` con
  `MSYS_NO_PATHCONV=1`. Los informes del red team del paquete 2: `mision-5/redteam-paquete-2/` del privado.
- 🗄️ **`D:\vibe-research\clientes\redteam-kit-v3\`** sigue en disco: nada se borra hasta cerrar la 5.
- 🧹 **`.claude/worktrees/agent-aedd…`** quedó trabada por Windows (sin rama ni registro en git): borrarla cuando se suelte.
- 📬 **El Hub pushea a este repo desde otra sesión**: `git fetch` antes de cerrar.
- 🔴 **vibe-kit es PÚBLICO**: gitleaks antes de cada push. 🔐 **12 alertas abiertas**, las arregla Guido.
- 🧪 **Antes del piloto, trabajo de Guido** (spec, "Lo que hacés vos de nuevo"): credenciales de escritura al almacén en 2 PCs, usuario de
  solo lectura por base real, "preparame esta PC" en la del compañero.

## Bloqueos

Ninguno.
