# Prompt para construir el release v2.0 del Arquitecto — sistema `docs-fyd`

> Copiá el bloque de abajo en un **chat nuevo** dentro del repo `Guia de vibe coding` (vibe-kit), **después de correr `/inicio`**.
> El diseño ya está hecho y aprobado: esta sesión **construye**, no rediseña.

---

Misión: construir la **v1 del sistema de documentación de auditoría FyD** (`/docs-fyd`) en el kit, según el SPEC ya aprobado. Es un **delta (Modo B) sobre el kit** — una feature grande sobre algo que ya anda. **No rehagas el diseño: el SPEC está READY, ejecutalo.**

**Leé primero, completos:**
- `docs/SPEC-docs-fyd.md` — el SPEC READY (aprobado tras 3 rondas de red-team). Es tu plano. Respetalo al pie: **AGREGA / MODIFICA / NO SE TOCA**, los **14 criterios de aceptación**, las **6 reglas de oro del motor** y los **riesgos ⚠️**.
- `docs/referencia-prompts-fyd.md` — el **contrato de contenido**: los 10 prompts originales de FyD. Cada plantilla sigue ESTO, no un formato inventado (criterio #14).

**Qué construir (todo en `kit/`, la fuente canónica):**
1. La skill nueva `kit/skills/docs-fyd/`:
   - `SKILL.md` — motor de los 10 artefactos, 2 modos (`docs-fyd` / `docs-fyd auditar`), las 6 reglas de oro, write-set CERRADO (`docs-fyd/**` + README raíz).
   - `deteccion.md` — el anexo stack-agnóstico de señales.
   - `prompts-fyd.md` — copiá el contenido de `docs/referencia-prompts-fyd.md`.
   - `plantillas/` — los 10 artefactos + `_CAMPOS-NEGOCIO.md` (bóveda, con su advertencia anti-credenciales) + `ESTADO.md` + `LEEME.md`.
2. Los enganches (MODIFICA — cada uno con su efecto colateral, están en el SPEC):
   - Paso de frescura condicional en el `/cierre-plantilla` (`templates/universales/skills/cierre/SKILL.md`).
   - Fila kit-owned en `menu-skills.md`, copiado en `INSTALAR.md`, manejo kit-owned en `arquitecto-skills/SKILL.md`.
   - **Siembra-con-pregunta** en el Arquitecto Modo A Paso 5 (`arquitecto/SKILL.md`) + aviso en el chequeo del Paso 6.
   - Sumar `kit/skills/docs-fyd` al `diff -r` del `/cierre` y del `/inicio` del **repo madre** (3 → 4 rutas).

**Reglas duras (del SPEC + del `CLAUDE.md` del repo):**
- Editás en `kit/`, **NUNCA** en `~/.claude/` directo.
- **La máquina anti-secretos es lo más crítico:** ningún valor de credencial puede terminar en ninguno de los 10 artefactos — solo el nombre y DÓNDE está guardado. El gate frena **ANTES de escribir** (el historial de git es permanente).
- No tocar **nada** de lo listado en **NO SE TOCA** (los `docs/` de trabajo, el trío base del `/cierre`, el `cierre parcial`, el hook, el `/inicio`, `CLAUDE.template.md`, etc.).
- Andá **artefacto por artefacto**, verificando cada criterio de aceptación con evidencia real (o marcá "NO VERIFICADO").
- El inventario central (`/inventario-fyd`, Excel, Mapa, hub) es **Fase 2 — NO lo construyas ahora**.

**Al terminar:** `/cierre` del repo madre → sync `kit/` → `~/.claude/`, `diff -r` de las **4 rutas** limpio, escribí el **ADR-014** (`docs-fyd/` es build-artifact regenerable, exento de "lo derivable no se escribe"), commit + push. Eso es el **release v2.0 del Arquitecto**.

**Antes de codear:** mostrame un plan corto (qué archivos vas a crear/tocar y en qué orden) y esperá mi OK.
