# TODO — vibe-kit

> ÚNICA fuente de pendientes del proyecto. Completado → SE BORRA (la historia vive en `CHANGELOG.md` y git). Header de 1 línea, sin narrativa de sesión.

2026-10-27 — ver SESSION_HANDOFF.md

## 🔴 Crítico
> **La hoja de ruta, reordenada el 2026-10-26 (ADR-025)**: 4 cerrar el diseño sin mensajería → 4½ ordenar la casa → 5 construir **v3.0** →
> 6 el ciclo como proceso → 7 la mensajería agéntica (**v3.1**). Después, el reloj: una vuelta cada 3-4 meses (abajo, "El ciclo").

- [ ] **Misión 4 — diseñar el pack con Guido adentro, SOLO DISEÑO** (hoja de ruta: ADR-021; plan y 11 criterios en docs/mision-4/PLAN.md).
  Tramos 0-3 ✅ · **Tramo 4 ✅ cerrado el 2026-10-27**: los 8 racimos (A, C, E, F, B, D, G, H), la revisión integral en dos sesiones (10
  decisiones reabiertas; el apartado director/obrero contra Hermes, D §22bis; el flujo proyecto ↔ kit, ADR-026 y D §22ter; la portada del repo,
  B §12bis; revisor frío de 30 hallazgos aplicados) y la charla final con Guido ("el recorrido queda como está"). I salió del kit (ADR-024);
  G.1, la mensajería, pasa a la misión 7 (ADR-025). D §8 (ramas y escritores) sigue **provisoria hasta el piloto**, por pedido de Guido. **Queda**:
  1. **El spec del pack** (tramo 5): SPEC-0 del kit v3 desde los 8 `DISENO-*`, red team, revisor frío, OK de Guido. Lo que el tramo 4 dejó
     explícitamente "para el spec": dónde caen release, relevamiento, bloque de documentos y tarea recurrente en los tres tamaños (B §24, H §25);
     la excepción de "chico" para las reglas propias del proyecto (revisor, mutaciones, gate; D §22 fila D-2); `merge=union` para
     `.claude/frenos.log` (A §4.2); la lista de herramientas por entorno (H §9.1); la pregunta menor de C §2.6 sin contar.
- [ ] **Misión 4½ — ordenar la casa antes de construir** (una sesión corta): el repo limpio y publicable; **`docs/chats-mision-4/` se muda al privado
  `vibe-research`** (Guido, 2026-10-26: "en este repo, que es genérico, queda medio raro"); **un diario de misiones en `vibe-research`** (qué se
  hizo cuándo, en qué PC, qué sesiones, qué costó: la documentación de las sesiones); legacy con lápida; `docs/README.md`, la guía y los manuales al día;
  README 100% portada. Incluye el **tope al hook del molde (v2.4.3)** de abajo si todavía no salió.
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
- [ ] **Misión 5 — construir el pack por piezas → kit v3.0** (después de la 4½). **Piloto del canon director/obrero en Deptos** (decisión de Guido,
  2026-10-23: "no ahora; puede ser en la semana"), con las 10 pruebas NO VERIFICADO de `DISENO-D` §7.7, §11 y §20, las de H §22 y las de G; un mes
  de uso y la medición contra las líneas base del TABLERO §1.
  - **La portada del repo** (pedido de Guido, 2026-10-26; `DISENO-B` §12bis): la pieza que viste el README raíz de cada repo desde el `NORTE.md`
    con el molde de la portada de vibe-kit (banner con el nombre, insignias, imagen para compartir, About y etiquetas por `gh`). Dónde vive
    (modo del Arquitecto o skill `portada`) lo fija el spec.
- [ ] **Misión 6 — escribir el ciclo de mejora del método** (al terminar la misión 5, con todo fresco; antes de la mensajería, porque es lo que
  más se evapora). Juntar en un documento reusable y genérico de vibe-kit lo que hoy está repartido (ADR-021, SPEC-investigacion-chats,
  observatorio/investigacion/METODO.md, docs/mision-4/PLAN.md):
  - **revisar cómo trabajamos de verdad en estas sesiones** (pedido de Guido, 2026-10-26): leer los chats de las misiones 2-5 (los de la 4 ya
    guardados; sumar los de A, C, E, los tramos 0-3 y la misión 5 desde `vibe-research`), cómo fue cada sesión y cuánto costó cada racimo;
  - cuándo arranca una vuelta y cada cuánto (el disparador: 3-4 meses, y recién con la versión nueva un mes andando en el piloto);
  - los 5 pasos: investigar → ordenar la casa → diseñar con Guido → construir con piloto → medir;
  - qué sale de cada paso y cuánto costó; los registros de cambios de método de los proyectos como fuente, además de los chats;
  - plantillas genéricas del SPEC de investigación y del PLAN de diseño;
  - la fecha de corte de la próxima vuelta;
  - las lecciones de esta vuelta (se juntan en `docs/mision-4/PLAN.md` §Lecciones para el ciclo).

  Es una receta, no una skill (regla de 3+).
- [ ] **Misión 7 — la mensajería agéntica → kit v3.1** (lo que era G.1; brief en `DISENO-G` §18 + sus insumos del acta de contraste: hueco 3/P71,
  P68, P77 y las "otras" 5, 8 y 24). Con investigación en internet y piloto. Guido, 2026-10-26: "no está bien claro todavía; siguiente versión;
  no bien termine lo otro, lo hago".

## 🔁 El ciclo (cada 3-4 meses; la próxima vuelta arranca del corte del 2026-10-26 y cae entre febrero y marzo de 2027)
1. **Investigar**: condensar los chats desde el corte anterior y leerlos con las decisiones vigentes en la mano (como la lectura de contraste);
   leer también los registros de cambios de método de los proyectos. Lo crudo al privado `vibe-research`, el acta con alias a `tips/`.
2. **Ordenar la casa**: repo limpio, legacy con lápida, guía y manuales.
3. **Diseñar con Guido**: solo lo que la evidencia reabre, en racimos, con los 11 criterios y revisor frío.
4. **Construir y pilotear**: versión nueva del kit, un proyecto piloto, un mes de uso.
5. **Medir**: los scripts gratis contra las líneas base; de ahí sale la fecha de la próxima vuelta. La misión 6 lo deja escrito.

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
