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
- **REJ-011 · El método de arranque como 4º modo del Arquitecto** — mismo scope creep que mató
  el "Modo M" (REJ-003 + ADR-004), **más una razón propia**: un modo no puede sostener estado
  entre sesiones de días distintos, y un relevamiento dura semanas. Se resolvió como skill
  hermana `/relevamiento` (ADR-016). Anotado 2026-08-03.
- **REJ-012 · Word / `.docx` como entregable del kit** — no hay con qué generarlo (verificado:
  ni pandoc, ni LibreOffice, ni python-docx, ni skills docx/pdf disponibles), o sea dependencia
  nueva por algo que nadie pidió. Y un `.docx` es **editable**: ahí nace el espejo — a la semana
  la verdad está en el Word y el `.md` miente (principio 6 del playbook). El entregable es PDF
  vía Chrome headless. **Re-apertura escrita:** si alguien externo pide editar y devolver 3+
  veces, se instala pandoc y el `.docx` se **genera**, jamás se edita. Anotado 2026-08-03.
- **REJ-013 · La absorción mínima al Arquitecto** (meterle al banco 3-4 preguntas sueltas —
  apetito, norte medible, supuesto crítico— en vez de la skill) — se queda corta contra el dolor
  real: lo que falla no es que falten preguntas, es que **el relevamiento no ocurre**. Un puñado
  de preguntas nuevas adentro de una entrevista de una sentada no captura un proceso que dura
  semanas y pasa afuera del chat. Los toques al Arquitecto que sí sobrevivieron están en el SPEC
  (MODIFICA §1-2). Anotado 2026-08-03.
- **REJ-014 · La Fase 2 de `/relevamiento`** — siete piezas diseñadas y **deliberadamente no
  construidas** en la v1, cada una con su condición de reapertura escrita para que ningún chat
  futuro las "complete" creyendo que faltan: **(a) el censo automático del código** en brownfield
  (un agente que lee el repo y pre-llena la E2) — es la pieza más cara y su consumidor, el Modo B
  del Arquitecto, **nunca se estrenó** (ADR-012); reabre si el Modo B tuvo su primera misión real
  **y** Guido contestó esas preguntas a mano en 2 relevamientos. **(b) Los 3 ganchos de costura en
  el Modo B** (que lea el HANDOFF en B0 y acorte B2) — no se pule una interfaz contra un consumidor
  que nunca corrió; reabre con la primera misión real del Modo B. **(c) El circuito adaptativo de
  fatiga** — un controlador con realimentación para una función usada cero veces; reabre tras 3
  relevamientos donde el modo silencioso manual no alcanzó. **(d) El modo `listar` + poda de
  relevamientos viejos** — simultáneos hasta hoy: cero; reabre con 4+ abiertos a la vez. **(e) Que
  la skill aprenda entre relevamientos** qué lentes se bajaron — **nunca por sí solo, es YAGNI**: si
  una lente se baja 3 veces se poda **a mano**, con su razón. **(f) `pdf/historico/`** — los PDF se
  regeneran de un `.md` que sí está versionado (REJ-010); reabre si se pisó un PDF que ya había
  circulado y dolió. **(g) La mención condicionada del relevamiento en el ruteo del Arquitecto** —
  contaminaría el camino personal, que es justo lo que el token explícito protege; reabre tras 2
  pedidos reales donde Guido se olvidó de invocarla. Diseño conservado en `docs/SPEC-relevamiento.md`
  §"Fase 2". Anotado 2026-08-03.
