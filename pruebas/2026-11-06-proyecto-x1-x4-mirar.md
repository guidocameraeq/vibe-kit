# Prueba 2026-11-06 — proyecto-x1 y proyecto-x4: la adopción, `--mirar` (paso 6)

kit: 3.0.0-rc.6

- **Fecha:** 2026-11-06 · **PC:** `pc-juan` (Windows 11 Pro 10.0.26200, node v24.19.0, git 2.55.0)
- Juan avisó que `proyecto-x1` y `proyecto-x4` están libres (no corre nada) y pidió ver qué se modificaría. Los dos estaban **limpios y
  sincronizados con origin** (`proyecto-x1` en `main`, 409 commits; `proyecto-x4` en una rama de trabajo, con un worktree aparte).
- Qué se corrió: clon de cada origin (solo lectura) con `.kit-rol` = `actualizador`, y `adoptar <clon> --kit <kit rc.6> --mirar --principal <carpeta>`.
  **Exit 0 en las dos, los clones quedaron sin cambios**, no se tocó ninguna carpeta de Juan.
- Resumen de la pantalla, no la salida completa (nombres de archivos y de reglas omitidos por ser del proyecto).

## Qué vio el adoptador

| | `proyecto-x1` | `proyecto-x4` |
|---|---|---|
| Nivel | `estandar` (hay código) | `estandar` (hay código) |
| `comandos:` | setup `npm ci` · test `npm test` | igual |
| `entornos:` | ninguno declarado (tienen base de datos; falta clase real/prueba/dummy) | ninguno declarado (ídem) |
| `papeles:` en `docs/` fuera de los seis | 18 | 28 |
| gitleaks de la historia | 3 (2 `generic-api-key` y 1 `jwt`, los 3 en archivos de tests) | 3 (1 `generic-api-key` en un test; 2 `jwt` en un `.env.example`) |
| Piezas propias (no se pisan) | `hook-arranque`, `inicio`, `cierre`, `githooks` | `hook-arranque`, `inicio`, `cierre` (`githooks` entra del molde) |
| Copias del kit adentro | **`.claude/skills/arquitecto`** (el kit vive en `~/.claude`; propone sacarla) | ninguna |
| `CLAUDE.md` | tiene un director/obrero propio (choca con `/director`); le falta "El tamaño del pedido" | le falta "El tamaño del pedido"; hay `AGENTS.md` con otro contenido (no se toca) |
| Reglas propias candidatas | ~32 reglas `deny` (git, `.env`, `printenv`) más 2 archivos de hook | 1 hook propio de `PreToolUse` y 3 archivos de hook |
| `SESSION_HANDOFF.md` contra el tope del hook (5000 B) | 23.254 B → entra cortado | **639.049 B** → entra cortado |
| Fuera del repo | — | 1 worktree hermano (ya mezclado en main): se puede borrar, lo decide Juan |

D1 (director e `/inicio`/`/cierre` propios), D2 (permisos), D3 (arranque propio) y D4 (las cinco de `sensible:` y `datos-reales`) aparecen
en los dos con las mismas recomendadas: `--director kit`, `--permisos recomendada`, `--arranque kit`; D4 pide declarar cada base y su clase.

## Lo que decide cada punto (para Juan)

- `proyecto-x1` y `proyecto-x4` tienen **base de datos real** (migraciones, docker/deploy): no es la situación de `proyecto-x3`. D4 y `entornos:` no se
  pueden dejar en "no" sin mirar: sin declararla, una base de prueba cuenta como real.
- Los 3 hallazgos de gitleaks por proyecto: o son claves reales (se rotan) o van a `.gitleaksignore` con su porqué; esto último es una
  barrera y pide aprobado. **NO VERIFICADO si son reales**; no se leyó el contenido (el hook del kit frena los `.env`).
- Una adopción empuja a `main` (o a la rama por defecto) del repo, que es de la empresa. El `--traer` además exige que la carpeta de Juan
  esté limpia y **en la rama del clon**: `proyecto-x4` está en una rama de trabajo, no en la principal.

## NO VERIFICADO

- Que `proyecto-x1`/`proyecto-x4` no tengan nada corriendo (lo dijo Juan; no se miró Docker ni el despliegue).
- La clase de cada base y si los gitleaks son reales.
- Qué pasa con las reglas propias de `proyecto-x1` al mezclar el `settings.json`; eso se ve en el `--aplicar`.
