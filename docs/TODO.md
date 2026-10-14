# TODO — vibe-kit

> ÚNICA fuente de pendientes del proyecto. Completado → SE BORRA (la historia vive en `CHANGELOG.md` y git). Header de 1 línea, sin narrativa de sesión.

2026-10-14 — ver SESSION_HANDOFF.md

## 🔴 Crítico
- [ ] **Misión 4 — diseñar el pack con Guido adentro, SOLO DISEÑO** (hoja de ruta: ADR-021; plan de 6
  tramos, 7 objetivos y el Arquitecto como agente único: en docs/mision-4/PLAN.md). Tramo 0 (biblioteca) ✅ ·
  Tramo 1 (radiografía director/obrero) ✅ · Tramo 2 (flota, repos, plataforma) ✅ · **sigue el tramo 3 (el mapa
  por objetivos, `TABLERO.md`)**. Base con el norte del
  proyecto y manual por módulo · Dirección: director/obrero/tramo + política de modelos · Mesa entre
  directores y entre PCs · el Arquitecto como puerta, también para proyectos que ya andan. Fuentes:
  las 57 propuestas de `tips/tanda-2026-10-chats.md` + los métodos de Hermes Desktop y Mobile.
- [ ] **Tope al hook de arranque del molde** (arreglo chico, fuera de la misión 4, que solo diseña).
  - **El problema**: el molde hace `cat` del handoff entero, y la plataforma corta lo inyectado a 10.000
    caracteres. Lo que se pasa, la sesión no lo ve.
  - **Hoy**: Hub inyecta ~43 KB y el Panel del bot ~18 KB, así que arrancan sin ver su estado (deducido).
    vibe-kit está al 87% del tope.
  - **El arreglo**: poner un tope en `kit/…/hooks/session-start.sh`. Hub y el Panel se arreglan en sus
    propios chats.
  - **Evidencia**: `docs/mision-4/FLOTA.md` §3.
- [ ] **Misión 5 — construir el pack por piezas** (después de la 4).
- [ ] **Misión 6 — escribir el ciclo de mejora del método** (al terminar la misión 5, con todo fresco).
  Juntar en un documento reusable lo que hoy está repartido (ADR-021, SPEC-investigacion-chats,
  observatorio/investigacion/METODO.md, docs/mision-4/PLAN.md):
  - cuándo arranca una vuelta y cada cuánto (el disparador: la medición mensual o X meses);
  - los 5 pasos: investigar → ordenar la casa → diseñar con Guido → construir con piloto → medir;
  - qué sale de cada paso y cuánto costó;
  - plantillas genéricas del SPEC de investigación y del PLAN de diseño;
  - la fecha de corte de la próxima vuelta;
  - las lecciones de esta vuelta (se juntan en `docs/mision-4/PLAN.md` §Lecciones para el ciclo).

  Es una receta, no una skill (regla de 3+).

## 🟠 Importante
- [ ] **Estreno real de `/relevamiento`**: un pedido de otro sector, de punta a punta. Hasta que pase
  **no se declara estable**. Quedan 11 de 21 criterios sin verificar (checklist en
  `docs/SPEC-relevamiento.md`). Se mide: ¿la invocaste sin que te la recuerden? ¿cuántas preguntas de
  más? ¿el Arquitecto repitió alguna? (Hubo un estreno parcial en la PC del compañero: Anexo A1 del acta.)
- [ ] **Estreno real del Modo B**: primera feature grande sobre el ERP con `/arquitecto` en la carpeta
  del proyecto.
- [ ] **PC `Usuario`**: decirle `actualizate` al Equipador para traer la misión 3 (conserva sola su
  carpeta de proyectos).

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
- [ ] **Insumos para la misión 4** (de la misión 3, ADR-023): `docs/specs/` como carpeta de SPEC en
  todos los proyectos · "misión y visión" como nombre de P7 · lo que es de cada PC (hoy una línea con
  lugar vacío en el Arquitecto) quizá en un archivo local aparte.
