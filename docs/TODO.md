# TODO — vibe-kit

> ÚNICA fuente de pendientes del proyecto. Completado → SE BORRA (la historia vive en `CHANGELOG.md` y git). Header de 1 línea, sin narrativa de sesión.

2026-10-26 — ver SESSION_HANDOFF.md

## 🔴 Crítico
- [ ] **Misión 4 — diseñar el pack con Guido adentro, SOLO DISEÑO** (hoja de ruta: ADR-021; plan de 6
  tramos, 7 objetivos y el Arquitecto como puerta única: en docs/mision-4/PLAN.md). Tramo 0 (biblioteca) ✅ ·
  Tramo 1 (radiografía director/obrero) ✅ · Tramo 2 (flota, repos, plataforma) ✅ · Tramo 3 (el mapa por objetivos,
  `TABLERO.md`) ✅ · **Tramo 4 en curso, por racimos**: A ✅, C ✅, E ✅ (molde y flota), F ✅ (seguridad por defecto), B ✅ (documentos con tope),
  D ✅ (2026-10-23: el método director/obrero y el workflow diario; **su decisión 5, ramas y escritores, queda provisoria**), G ✅ (2026-10-24: la mesa por git, 12 decisiones aprobadas en bloque; **el buzón multiagente pasa a G.1**, opt-in, sesión propia con
  investigación en internet y piloto), H ✅ (2026-10-26: niveles y puertas del Arquitecto; 14 decisiones, el tope del spec como aviso que decide Guido).
  **I salió del kit** (2026-10-26, ADR-024: el agente de ecosistema se diseña en el Hub; acá queda el contrato del registro, nota en E).
  **Lo que queda, en el orden que fijó Guido el 2026-10-26**: (1) **revisión integral con el acta de contraste abierta** (`tips/tanda-2026-11-contraste.md`), **sin volver a los chats**: las ~10 decisiones a
  reabrir (A-1, E-1, F-1, H-6, D-8, B-6/B-7, H-5, E-4, D-10 y la D5 provisoria), el **triage de P58-P77 en tres pilas** (entra ya a un diseño ·
  misión 5 · espera al piloto), releer solo los 4-5 chats ★ del acta, y la nota del contrato del registro en E · (2) **G.1** (el buzón entre agentes;
  brief en G §18 + hueco 3/P71, P68, P77 y las "otras" 5, 8 y 24 del acta) · (3) el spec. **Cada racimo se diseña
  con los 11 criterios del PLAN y cierra con su tabla; al terminar los nueve, revisión integral de todas las decisiones con esa vara, antes
  del spec** (Guido la pidió especialmente para D). Fuentes: las 57 propuestas de
  `tips/tanda-2026-10-chats.md` + los métodos de Hermes Desktop y Mobile + `REFERENCIAS-EXTERNAS.md`.
- [ ] **Tope al hook de arranque del molde** (arreglo chico, fuera de la misión 4, que solo diseña).
  - **El problema**: el molde hace `cat` del handoff entero, y la plataforma corta lo inyectado a 10.000
    caracteres. Lo que se pasa, la sesión no lo ve.
  - **Hoy** (medido 2026-10-22): Bot inyecta 15.500 caracteres y el Panel del bot ~18.000: arrancan sin ver su estado.
    Arte está al 92%, vibe-kit al 88%. **El Hub ya lo arregló** (tope de 5.500 bytes al handoff, aviso "CORTADO", test;
    mergeado a su `main` el 2026-10-22).
  - **El arreglo**: solo el tope y la huella en `kit/…/hooks/session-start.sh` (bash) y "si dice CORTADO, leé el resto" en el
    `/inicio` del molde → `kit-sync.sh sync` LIMPIO → tag `v2.4.3`. **Guía: `DISENO-B-documentos.md` §9** y el hook del Hub.
    El diseño completo (node, presupuesto, módulos) llega con la misión 5. Bot y el Panel se arreglan en sus propios chats.
  - **Evidencia**: `docs/mision-4/FLOTA.md` §3 · DISENO-B §3.
- [ ] **Misión 5 — construir el pack por piezas** (después de la 4). **Piloto del canon director/obrero en Deptos** (decisión de Guido,
  2026-10-23: "no ahora; puede ser en la semana"), con las 10 pruebas NO VERIFICADO de `DISENO-D` §7.7, §11 y §20.
- [ ] **Misión 6 — escribir el ciclo de mejora del método** (al terminar la misión 5, con todo fresco).
  Juntar en un documento reusable lo que hoy está repartido (ADR-021, SPEC-investigacion-chats,
  observatorio/investigacion/METODO.md, docs/mision-4/PLAN.md):
  - cuándo arranca una vuelta y cada cuánto (el disparador: la medición mensual o X meses);
  - los 5 pasos: investigar → ordenar la casa → diseñar con Guido → construir con piloto → medir;
  - qué sale de cada paso y cuánto costó;
  - plantillas genéricas del SPEC de investigación y del PLAN de diseño;
  - la fecha de corte de la próxima vuelta;
  - las lecciones de esta vuelta (se juntan en `docs/mision-4/PLAN.md` §Lecciones para el ciclo).
  - **leer los chats de la misión 4** que Guido pidió guardar para esto (`docs/chats-mision-4/`, con su LEEME): cómo se trabajó de verdad
    y cuánto costó cada racimo. Faltan los de A, C y E y los de los tramos 0-3 (sumarlos desde la PC `clientes`). Al terminar, la carpeta se borra.

  Es una receta, no una skill (regla de 3+).

## 🟠 Importante
- [ ] **Estreno real de `/relevamiento`**: un pedido de otro sector, de punta a punta. Hasta que pase
  **no se declara estable**. Quedan 11 de 21 criterios sin verificar (checklist en
  `docs/SPEC-relevamiento.md`). Se mide: ¿la invocaste sin que te la recuerden? ¿cuántas preguntas de
  más? ¿el Arquitecto repitió alguna? (Hubo un estreno parcial en la PC del compañero: Anexo A1 del acta.)
- [ ] **Estreno real del Modo B**: primera feature grande sobre el ERP con `/arquitecto` en la carpeta
  del proyecto.
- [ ] **PC `Usuario`**: traer la misión 3 antes de trabajar ahí. `git pull` y después
  `bash .claude/scripts/kit-sync.sh sync` hasta que dé LIMPIO (el script conserva solo su carpeta de
  proyectos), o decirle `actualizate` al Equipador. Los pasos están en el handoff del 2026-10-21.

## 🟡 Cuando se pueda
- [ ] **Elegir el nombre del proyecto** (descartados: Obrador, Andamio, Batuta, Cimientos, Plano). Al
  cambiarlo: banner, README, About de GitHub y la URL del Equipador.
- [ ] **Llevarle al jefe**, sin apuro: aprobar las 7 celdas `[+fork]` de las plantillas · versionar el
  método · darle dueño y fecha al chequeo de éxito a las 4-6 semanas.
- [ ] **Compuerta del Modo C**: tras ~2 semanas de uso de A+B, si te trabaste 3+ veces pidiendo cosas,
  se afina con casos reales; si no, queda como está.
- [ ] Equipador: estrenar "actualizar" y "agregar al menú".
- [ ] Capturas del carrusel de @sabbb.md para cerrar el tip pendiente de la tanda 2.

## 🟢 Ideas / algún día
- [ ] **Fase 2 de `/relevamiento`**: 7 piezas diseñadas y no construidas (la más pedida: que lea sola
  el código de la app). Cada una tiene su condición de reapertura en REJ-014; el diseño, en
  `docs/SPEC-relevamiento.md` §Fase 2. Esperan evidencia de uso, no tiempo.
- [ ] **Fase 2 de `docs-fyd`**: `/inventario-fyd` (Excel + Mapa + hub privado). Mientras, el Excel sale
  del Kanban (columnas en `docs/SPEC-docs-fyd.md` §Fase 2).
- [ ] **Insumo para la misión 4** (de la misión 3, ADR-023): lo que es de cada PC (hoy una línea con lugar vacío en el
  Arquitecto) quizá en un archivo local aparte. (`docs/specs/` y el nombre de P7 quedaron resueltos en `DISENO-B` §4 y §12:
  sin `specs/`, los specs viven con su módulo; el norte se llama `NORTE.md`.)
