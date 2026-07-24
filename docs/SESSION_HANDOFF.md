# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo
> inyecta en cada chat nuevo de esta carpeta.

**Última sesión cerrada:** 2026-07-23 — **construido docs-fyd v2: "resolver las dudas POR OPCIONES, no
generar por generar".** Nació de la **1ª corrida real de v1** (reporte de campo del dev sobre el repo
Hermes): la doc salía bien pero 9/10 artefactos necesitaban corrección a mano, y el motor afirmaba
negativos falsos ("no hay backups") que acusaban al cliente. Se diseñó el delta, se **red-teameó (6
lentes, 26 hallazgos)**, se construyó y se verificó. Todo sincronizado, diff de las 4 rutas limpio.

## Estado

- **docs-fyd v2 CONSTRUIDO y sincronizado.** El motor `kit/skills/docs-fyd/` ahora, cuando duda de algo
  importante, **pregunta por OPCIONES** (el motor propone, el humano elige — no escribe documentación),
  con una **checklist proactiva condicionada** (backups/RLS/base-compartida si hay DB · tokens si usa
  servicios — v2.2.1); **nunca afirma un negativo por silencio**; lo humano vive en **`_ACLARACIONES.md`**
  (regla `_`=read-only: crear+anexar, nunca pisar); hay **auto-verificación en 2 momentos** (surtidor de
  dudas + chequeo final) con git-gate; las **herramientas auxiliares corren fuera del repo**; y un
  **Mermaid roto no tira el documento** (placeholder). Sigue siendo regenerable.
- **Cambios del build (solo `kit/skills/docs-fyd/`):** `SKILL.md` reescrito; `deteccion.md` (jerarquía
  de evidencia + entorno instalado + auxiliares en temp); `plantillas/_ACLARACIONES.md` nuevo;
  `plantillas/LEEME.md` al modelo v2; las 10 cabeceras sin el nombre de la herramienta + token de
  marcador `<!-- docs-fyd:marca v2 -->`.
- **Verificación:** workflow adversarial de 13 verificadores → **8 PASS, 5 PARTIAL, 0 FAIL**. Los 5
  PARTIAL (LEEME v1 stale, columna Clave sin la pregunta, orden del pipeline contradictorio, crear
  ESTADO si falta, mecanismo de caducidad) **fueron foldeados**. Cero fugas de secretos, los 13
  hallazgos graves del red-team resueltos en el código.
- **Docs de v2:** `docs/SPEC-docs-fyd-v2.md` (READY), `docs/EVALUACION-docs-fyd-v2.md` (cómo medir si
  mejoró: re-correr sobre Hermes), **ADR-015** en `docs/DECISIONS.md`.
- **v1 y todo lo anterior siguen estables.** Diff `kit/` ↔ `~/.claude/` de las 4 rutas **limpio**.
- **Release `v2.2` tagueado + ritual de release arreglado:** se tagueó **`v2.2`** (docs-fyd + Equipador
  auto-update). Se descubrió que el `/cierre` del repo madre NO actualizaba las guías cara-al-usuario ni
  versionaba → se le sumaron dos pasos: **actualizar `GUIA-DE-USO`/`guias/` si la sesión sacó una
  capacidad nueva**, y **bump + git-tag de versión cuando amerita**. La `GUIA-DE-USO` quedó al día
  (receta de docs-fyd, la vía `actualizate`, frases mágicas nuevas).
- **docs-fyd v2 EVALUADO en campo (Hermes, 2026-07-24) → PASS honesto + patch `v2.2.1`:** el dev re-corrió
  v2 en una rama descartable y comparó contra la doc v1 corregida (el answer key). Las 4 fallas de fondo
  cerradas — backups/RLS/base-compartida ahora son **preguntas, no mentiras**; la auto-verificación
  aterriza el conteo sola. De las 9 correcciones a mano de v1, v2 captura ~4-5 solas + muestra el resto
  como pendientes humanos. Reporte honesto (el dev se pasó un auditor adversarial a su propio reporte y
  declaró que la corrida fue parcial). **Único hallazgo → fix `v2.2.1`:** la checklist proactiva era FIJA
  → en un repo sin DB 3 de 4 preguntas eran ruido; ahora se **condiciona a lo que el repo tiene**, y la
  regla 5 distingue silencio (→ pregunta) de ausencia comprobable (→ se afirma). Reporte del dev en
  `Desktop\Reportes fyd\reporte-v2.md`.

## Próximo paso concreto (cuando Guido retome)

**v2 (con el patch `v2.2.1`) ya está validado en campo — quedan dos cosas:**
1. **Confirmar el fix de fatiga en el peor caso:** correr `/docs-fyd` en un repo **sin base de datos** y
   verificar que la checklist proactiva NO dispara las 3 preguntas de DB (cero ruido). Es la única prueba
   que quedó pendiente del eval.
2. **Soltar v2 al resto de las apps de FyD** (ya está listo). Por app, decidir si migrar la doc a la
   estructura v2. **Hermes:** la doc entregada queda intacta en `main`; migrar es decisión aparte (la
   rama `eval-docs-fyd-v2` es el preview — NO borrarla).

## Bloqueos

Ninguno.

## Contexto que no está en otros docs

- **Equipador auto-actualizable — HECHO en esta sesión (pedido de Guido):** `/arquitecto-skills` tiene el
  Modo **AUTO-ACTUALIZAR EL KIT** — baja lo kit-owned (arquitecto / arquitecto-skills / docs-fyd + redteam)
  del repo canónico y se actualiza a sí mismo, con diff-antes-de-pisar + preservando la ruta de proyectos
  por-PC. Se dispara con "actualizá el kit" / "actualizate". Acotado: en el repo madre sigue mandando `/cierre`.
- **El zip portable NO se regeneró** (esta PC no tiene `Desktop\Arquitecto en otras PCs\` — paso
  condicional). Para llevar a otra PC: mejor `git pull`, no el zip (quedó viejo).
- **Fase 2 sigue diferida** (verificación EN VIVO automática — que el motor consulte la base/API real):
  es su propio SPEC/red-team. Mientras tanto la checklist proactiva de v2 captura ese valor vía el humano.
- El reporte de campo del dev (Hermes) fue la evidencia que disparó v2; sus 11 correcciones y sus 6
  errores de hecho son los casos de prueba del protocolo de evaluación.
