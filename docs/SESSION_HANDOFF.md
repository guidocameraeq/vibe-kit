# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**Última sesión cerrada:** 2026-10-28, **misión 5, director D2.1: primera mitad del paquete 2 ✅**. PC `clientes`, Opus.
`kit-sync` LIMPIO. Detalle: CHANGELOG del 2026-10-28 (D2.1), la fila D2.1 del tracker y "Lo que cambió en la construcción" del delta.

## Dónde estamos

- **Hecho en D2.1** (en `kit/molde/`, todavía no se instala en ningún proyecto): las plantillas de `docs/` en cuatro capas, el handoff
  y el TODO con tope, los dos `.snippet`, las librerías de `hooks/lib/`, `scripts/todo.cjs`, el **hook de arranque en node** (con plazo
  propio de 10 s) y el **hook de escritura en `docs/`**. Suite: **496 pruebas verdes**. `rehacer.sh` arma `alfa` y `beta` con el molde
  nuevo; `gama` queda en `2.4.2`. Delta: `docs/kit-v3/SPEC-paquete-2.md` (READY; D2.1 ✅, D2.2 pendiente).
- **Los repos de prueba viven en `../vibe-kit-pruebas/`** (fuera del repo, decisión de Guido): se rehacen con `bash pruebas/rehacer.sh`.
- **Kit hecho**: 2 de 13 directores cerrados (D1.1 y D2.1 son el paquete 1 y medio paquete 2) y 8 de las 57 piezas del SPEC-0.
- Hoja de ruta ADR-025: 4 ✅ → 4½ ✅ → **5 construir v3.0** (paquete 1 ✅, paquete 2 a medias) → 6 el ciclo → 7 mensajería v3.1.

## Próximo paso: sesión intermedia DP

**Título: `vibe-kit M5 · DP · Planear la paralelización de lo que queda`**, en **Fable** (es una decisión nueva con Guido). Pedido de
Guido: antes de D2.2, planear cómo trabajar con dos o tres directores a la vez y dejarlo escrito en el tracker para el resto de la
misión. El insumo está en [`docs/kit-v3/PLAN-construccion.md`](kit-v3/PLAN-construccion.md), sección "Paralelizar" (dónde se puede, lo
que DP tiene que dejar escrito) y "Lecciones" (dos encargos en la misma PC se pisan: tardaron ~75 min cada uno). La línea para abrir:
`inicio — misión 5, sesión DP: planear la paralelización (docs/kit-v3/PLAN-construccion.md, "Paralelizar")`.
Después de DP: **D2.2** (la segunda mitad del paquete 2 y su revisor frío), que abre haciendo las filas 1-7 de "Lo prueba una sesión
real" del delta.

## Cosas que muerden y no están en ningún otro doc

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
