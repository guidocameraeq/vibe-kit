# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**Última sesión cerrada:** 2026-10-29, **misión 5, D3.1: paquete 3 a medias**, cortada en un punto pedido por Guido (poca cuota). PC
`clientes`, Opus. `kit-sync` LIMPIO. Detalle: CHANGELOG del 2026-10-29 (D3.1) y la fila D3.1 del tracker con "Decisiones sin Guido".

## Dónde estamos

- **Paquete 3 en curso**: el delta `docs/kit-v3/SPEC-paquete-3.md` está **sellado sin Guido** (provisorio; red team r1 6 ALTOS integrados,
  r2 0 ALTOS). En `main`: G2 `lib/comando.cjs`, G8 `cargar-secreto`, G9 `lib/db-guardia.cjs`. **G3, G4, G5 y G6 frenados a medias, en
  ramas de `origin`**: `wip/d3.1-g3-git-seguro`, `wip/d3.1-g4-sensible`, `wip/d3.1-g5-secretos`, `wip/d3.1-g6-barreras` (`git fetch`;
  qué tiene cada una, en "Pendientes" del tracker).
- **Guido sigue en la otra PC** (decidido 2026-10-29). Esta (`clientes`) queda sin trabajo a medias: todo está en `origin` y en el privado.
- Hoja de ruta ADR-025: 4 ✅ → 4½ ✅ → **5 construir v3.0** (paquetes 1 y 2 ✅, 3 🔨) → 6 el ciclo → 7 mensajería v3.1.

## Próximo paso

**D3.2**, en Opus: **`vibe-kit M5 · D3.2 · Paquete 3, segunda vuelta: terminar G3-G6, G7, G10-G13, revisor frío`**. Abre con
`inicio — misión 5, D3.2`, lee el tracker ("Pendientes" → "Paquete 3 · D3.1 quedó a medias") y el delta. **En una PC nueva, antes**:
`bash pruebas/rehacer.sh` (los repos de prueba en `../vibe-kit-pruebas/`) y `kit-sync.sh` (si da sucio, `sync`: es la PC que se pone al día).
Orden: relanzar G3, G4, G5 y G6 **sobre su rama `wip/*`** ("seguí desde este commit": cada uno tiene el brief en "Los encargos" del delta; les falta la medición contra el
historial y la mutación, y a G6 las pruebas nuevas de `barreras`); leer cada diff y mergear; después G7 (githooks, `settings.json` en forma
exec), G10 (instalador), G11 (`doctor`), G12 (`rehacer.sh`), G13 (sesión real `-p`), el revisor frío y el `/cierre` completo. **Nada toca
el `~/.claude/` real** (HOME falso); instalar en las dos PCs es de Guido (fila 4 de "Lo prueba una sesión real" del delta).

**Para Guido, cuando pueda (no traba a D3.2)**: repasar las ⚠️ de D3.1 y de D2.2 en el tracker; las pruebas en una pestaña real de D2.2.
**⏰ En `Usuario`, antes del 2026-11-20**: subir los chats que faltan (`vibe-research/chats/FALTAN.md`, con la receta en su `LEEME.md`;
TODO "Juntar los chats"). La sesión que lo haga lo puede correr con un Sonnet, como D3.1 lo hizo con los de `clientes`.

## Cosas que muerden y no están en ningún otro doc

- 📉 **Cuota**: D3.1 cortó por eso. Los encargos de un freno (medición sobre 91 mil llamadas + mutación) tardan 1-2 h cada uno; tres
  Opus en paralelo se comen la cuota. D3.2: de a dos, y la mutación con tope.
- 🗂️ **El corpus del historial no viaja** (tiene secretos reales: nunca a un repo). Los arneses (`extraer.cjs`, `correr.cjs`) están en el
  privado, `vibe-research/mision-5/medicion-historial/`: en la PC nueva se rehace el corpus en ~8 min con sus transcripts.
- 🗄️ **Los chats de vibe-kit de `clientes`** (22, condensados, secretos tapados) están en el privado, `vibe-research/chats/clientes/`.
- 🗂️ **Cada encargo en paralelo, su propia subcarpeta del scratchpad**: G2, G6 y G9 se pisaron los `mutar.cjs`.
- 🧪 **`claude -p` desde Git Bash con un prompt que empieza con `/`**: `MSYS_NO_PATHCONV=1`. En `-p` un clon que no es de confianza ignora el
  `permissions.allow` del proyecto. `claude.exe`: `%APPDATA%\Claude\claude-code\2.1.309\…\claude.exe`.
- 🧪 **En `clientes`, `bash` a secas resuelve al stub de WSL**: las pruebas buscan el bash de Git por ruta (G8).
- 🧪 **Los repos de prueba (y los de Hermes) se miran con Bash, nunca con Read**. La suite: `node --test "kit/**/*.test.cjs"`, ~27 min.
- 🔑 **Identidad de git**: en `clientes`, el `noreply` de `guidocameraeq`. Nunca `eq.chatgpt`. Los repos de prueba, `kit-pruebas`.
- 🗄️ **El diario de misiones** (privado) tiene la fila de D3.1. Los informes del red team del paquete 3 no subieron como archivo: están
  resumidos en la tabla "Red team" del delta y enteros en el chat condensado de D3.1.
- 📬 **El Hub pushea a este repo desde otra sesión**: `git fetch` antes de cerrar. 🔴 **vibe-kit es PÚBLICO**: gitleaks antes de cada push.
- 🧹 En `clientes`, `.claude/worktrees/` tiene los worktrees de los encargos de D3.1: ya está todo en `origin`, se pueden borrar.

## Bloqueos

Ninguno para D3.2.
