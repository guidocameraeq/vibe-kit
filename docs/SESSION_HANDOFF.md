# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**Última sesión cerrada:** 2026-10-30, **D4.1** de la misión 5 en la PC `Usuario` (Opus, sin Guido, ~3,2 h, 10 encargos, ~2,0 M de tokens
de subagentes: **el ADR-029 rindió**). Todo el código del paquete 4 en `main`; el paquete **sigue en D4.2**. `kit-sync` LIMPIO.

## Dónde estamos

- **Paquete 4 🔨**: `arquitecto.cjs` (sello con hash, `ready`, `--pendientes`, `tope`, `entorno`, `registro`), `worktree.cjs` (`crear`,
  `abrir`, `sync-env`, `cerrar`, `.kit-rol`, credenciales que fallan cerrado), el Arquitecto v3 (5,6 KB, cinco entradas, la línea primero,
  `modo-a`/`modo-b`/`flota`, `formato-spec` v3), la regla del tamaño en el molde. Delta **sellado sin Guido y por script**; red team y
  revisor frío de una vuelta, todo integrado.
- **El Arquitecto v3 ya está instalado en `Usuario`** (`kit-sync` del cierre; D4-1): en tus proyectos v2 sin ficha trabaja como hoy, sin
  commitear nada. En `clientes` llega con el próximo `kit-sync` allá.
- **Lo que no cerró** (tracker, Pendientes "Paquete 4 · para D4.2"): el Modo B corto de punta a punta (crit. 4: el pedido 14 era chico por
  la regla y así lo midieron), los diez pedidos en **8 de 10** (fallan el 8 y el 10) y el prototipo de pantalla (16).
- **Decisiones sin Guido de D4.1**: tracker, "D4.1 · Decisiones sin Guido" (las ⚠️ arriba). Ninguna pregunta abierta.
- Hoja de ruta ADR-025: 5 construir v3.0 (paquetes 1-3 ✅, el 4 en D4.2) → 6 el ciclo → 7 mensajería v3.1.

## Próximo paso

**D4.2**, en Opus, en `Usuario`, sin Guido: **`vibe-kit M5 · D4.2 · Paquete 4, cierre: Modo B corto real, 10 de 10 y prototipo`**. Guido
pega el prompt de "Abrir D4.2 sin Guido (el prompt)" del tracker (`docs/kit-v3/PLAN-construccion.md`) y se va. Es corto (~2 h, ~3
encargos): arreglos de texto, `rehacer.sh`, el `kit-sync` del cierre y las corridas; el paquete 4 a ✅ y el prompt de D5.1.

**Para Guido, cuando pueda (no traba a D4.2)** — el detalle, en Pendientes del tracker, "Paquete 4 · te espera a vos" y "Paquete 3 · te
espera a vos": probar el Arquitecto nuevo en un proyecto v2 de verdad; una pestaña de VS Code en un worktree creado por `worktree.cjs`
(la mitad VS Code de `.kit-rol`); instalar los hooks por PC en las dos PCs; borrar los 4 transcripts con la clave FALSA de D3.3; repasar
las ⚠️ de D2.2, D3.1, D3.3 y D4.1.

## Cosas que muerden y no están en ningún otro doc

- ⏱️ **Los encargos Opus se cuelgan** a veces: se retoman con `SendMessage`. Un encargo que terminó con trabajo de fondo vivo: `TaskStop`.
- 🧪 **La suite entera tarda ~30 min**: siempre en segundo plano, una vez, al final.
- 🧪 **`claude.exe`** está en la extensión de VS Code (`…/anthropic.claude-code-*/resources/native-binary/`), no en el PATH (por eso la
  línea de apertura de `worktree.cjs` dice `code "<ruta>"`). Con un `HOME` falso da "Not logged in". **`MSYS_NO_PATHCONV=1` solo en el
  lanzador**: si la sesión lo hereda, `node ~/…` falla con `C:\c\Users\…`.
- 🔒 **El clasificador del modo `auto` frena `kit-sync sync` a mitad de sesión** (prompt "no toques el `~/.claude/` real"); en el `/cierre`
  pasa. Una skill del proyecto no le gana a la personal del mismo nombre: las sesiones reales de una skill nueva van después del sync.
- 🗂️ **Cada encargo, su worktree en `scratchpad/<x>/wt`**; los clones de los repos de prueba no traen `core.hooksPath` (ponerlo a mano).
- 🧪 **Los repos de prueba se miran con Bash, nunca con Read**. La suite: `node --test "kit/**/*.test.cjs"`.
- 🔑 **Identidad de git**: `guido.camera.eq@gmail.com`. Nunca `eq.chatgpt`.
- 📬 **El Hub pushea a este repo desde otra sesión**: `git fetch` antes de cerrar. 🔴 **vibe-kit es PÚBLICO**: gitleaks antes de cada push.

## Bloqueos

Ninguno para D4.2.
