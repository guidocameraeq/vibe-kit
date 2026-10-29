# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**Última sesión cerrada:** 2026-10-29, **misión 5, D3.1: paquete 3 a medias**, cortada en un punto pedido por Guido (poca cuota). PC
`clientes`, Opus. `kit-sync` LIMPIO. Detalle: CHANGELOG del 2026-10-29 (D3.1) y la fila D3.1 del tracker con "Decisiones sin Guido".

## Dónde estamos

- **Paquete 3 en curso**: el delta `docs/kit-v3/SPEC-paquete-3.md` está **sellado sin Guido** (provisorio; red team r1 6 ALTOS integrados,
  r2 0 ALTOS). En `main`: G2 `lib/comando.cjs`, G8 `cargar-secreto`, G9 `lib/db-guardia.cjs`. **G3, G4, G5 y G6 frenados a medias, en
  commits WIP en ramas locales** (`worktree-agent-…`, no pusheadas; la lista con SHA en "Pendientes" del tracker).
- Hoja de ruta ADR-025: 4 ✅ → 4½ ✅ → **5 construir v3.0** (paquetes 1 y 2 ✅, 3 🔨) → 6 el ciclo → 7 mensajería v3.1.

## Próximo paso

**D3.2**, en Opus: **`vibe-kit M5 · D3.2 · Paquete 3, segunda vuelta: terminar G3-G6, G7, G10-G13, revisor frío`**. Abre con
`inicio — misión 5, D3.2`, lee el tracker ("Pendientes" → "Paquete 3 · D3.1 quedó a medias") y el delta. Orden: relanzar G3, G4, G5 y G6
**sobre su rama WIP** ("seguí desde este commit": cada uno tiene el brief en "Los encargos" del delta; les falta la medición contra el
historial y la mutación, y a G6 las pruebas nuevas de `barreras`); leer cada diff y mergear; después G7 (githooks, `settings.json` en forma
exec), G10 (instalador), G11 (`doctor`), G12 (`rehacer.sh`), G13 (sesión real `-p`), el revisor frío y el `/cierre` completo. **Nada toca
el `~/.claude/` real** (HOME falso); instalar en las dos PCs es de Guido (fila 4 de "Lo prueba una sesión real" del delta).

**Para Guido, cuando pueda (no traba a D3.2)**: repasar las ⚠️ de D3.1 y de D2.2 en el tracker; las pruebas en una pestaña real de D2.2.

## Cosas que muerden y no están en ningún otro doc

- 📉 **Cuota**: D3.1 cortó por eso. Los encargos de un freno (medición sobre 91 mil llamadas + mutación) tardan 1-2 h cada uno; tres
  Opus en paralelo se comen la cuota. D3.2: de a dos, y la mutación con tope.
- 🗂️ **El corpus del historial y los arneses** viven en el scratchpad de D3.1
  (`C:\Users\clientes\AppData\Local\Temp\claude\D--vibe-kit\c11989ad-22a9-4f98-8d45-bb772b1c2b20\scratchpad\historial\`: `extraer.cjs`,
  `correr.cjs`, `LEEME.md`). **Tiene secretos reales: nunca al repo.** Si ya no está, `extraer.cjs` se rehace (~8 min).
- 🗂️ **Cada encargo en paralelo, su propia subcarpeta del scratchpad**: G2, G6 y G9 se pisaron los `mutar.cjs`.
- 🧪 **`claude -p` desde Git Bash con un prompt que empieza con `/`**: `MSYS_NO_PATHCONV=1`. En `-p` un clon que no es de confianza ignora el
  `permissions.allow` del proyecto. `claude.exe`: `%APPDATA%\Claude\claude-code\2.1.309\…\claude.exe`.
- 🧪 **En `clientes`, `bash` a secas resuelve al stub de WSL**: las pruebas buscan el bash de Git por ruta (G8).
- 🧪 **Los repos de prueba (y los de Hermes) se miran con Bash, nunca con Read**. La suite: `node --test "kit/**/*.test.cjs"`, ~27 min.
- 🔑 **Identidad de git**: en `clientes`, el `noreply` de `guidocameraeq`. Nunca `eq.chatgpt`. Los repos de prueba, `kit-pruebas`.
- 🗄️ **El diario de misiones** (repo privado `vibe-research`) **no recibió la fila de D3.1** (se salteó por la cuota): D3.2 la suma junto
  con la suya. Los informes del red team del paquete 3 tampoco subieron: están resumidos en la tabla "Red team" del delta.
- 📬 **El Hub pushea a este repo desde otra sesión**: `git fetch` antes de cerrar. 🔴 **vibe-kit es PÚBLICO**: gitleaks antes de cada push.
- 🧹 `.claude/worktrees/` de vibe-kit tiene los seis worktrees de los encargos (ignorados en `.git/info/exclude`): no borrar los de G3-G6.

## Bloqueos

Ninguno para D3.2.
