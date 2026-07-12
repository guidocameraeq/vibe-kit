# REJECTED — descartes a nivel proyecto

> Lo que se decidió NO hacer, con razón — para que ningún chat futuro lo re-proponga de cero.
> Los descartes de SKILLS van en el menú del Equipador (`kit/skills/arquitecto-skills/menu-skills.md`),
> no acá. Backfill 2026-07-11.

- **REJ-001 · Formato plugin para el kit** — el v1 entero (plugin + marketplace + 7 comandos)
  murió sin instalarse. Ver ADR-001. Re-abrir solo si se publica para terceros.
- **REJ-002 · Web wizard / arrancador externo** (concepto "B" del blueprint v1) — una app
  Next.js que mantener para mejorar el 5% del flujo (el arranque), reintroduciendo copy-paste.
  Los 3 jueces del v1 ya lo habían descartado; sigue muerto.
- **REJ-003 · "Modo M" (setup de máquina) adentro del Arquitecto** — scope-creep; se resolvió
  como skill hermana (ADR-004).
- **REJ-004 · Sub-skills jerárquicas** (`/arquitecto:skills`) — Claude Code no tiene jerarquía
  real de skills; nombres planos con prefijo común (`arquitecto-skills`) dan la misma
  agrupación mental sin inventar mecanismos.
- **REJ-005 · TODO.md para este repo** — los pendientes viven en el README (proyecto chico,
  §1.5 del playbook: un dato, un lugar). Si el volumen de pendientes crece 3×, se re-evalúa.
- **REJ-006 · `/inicio` para este repo** — el hook SessionStart + el README alcanzan; el
  ritual de inicio acá nunca se dictó 3 veces. `/cierre` sí existe (el ritual de cierre se
  repitió ~10 veces en una semana).
- **REJ-007 · Snapshots de carpeta post-repo** — reemplazados por tags de git (ADR-008).
- **REJ-008 · Google Stitch** — ver ADR-009 y el menú (Descartadas). Condición de re-apertura
  escrita: export React/shadcn nativo.
- **REJ-009 · Tandas de tips programadas (cron)** — el volumen actual (1-2 tandas/semana,
  manual) no lo justifica; sería infraestructura "por las dudas". Re-evaluar si el hábito de
  guardar TikToks crece a diario. Anotado 2026-07-11.
- **REJ-010 · PDFs versionados en el repo** — binarios que envejecen con cada edición de los
  MD. Los MD de `guias/` son la fuente; los PDFs se generan a demanda (Chrome headless) y
  viven en `Desktop\Arquitecto en otras PCs\`.
