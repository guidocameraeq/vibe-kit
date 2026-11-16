# TODO — vibe-kit

> ÚNICA fuente de pendientes del proyecto. Completado → SE BORRA (la historia vive en `CHANGELOG.md` y git). Header de 1 línea, sin narrativa de sesión.

2026-11-16 — ver SESSION_HANDOFF.md

## 🔴 Crítico
> **La hoja de ruta, reordenada el 2026-10-26 (ADR-025)**: 4 cerrar el diseño sin mensajería → 4½ ordenar la casa → 5 construir **v3.0** →
> 6 el ciclo como proceso → 7 la mensajería agéntica (**v3.1**). Después, el reloj: una vuelta cada 3-4 meses (abajo, "El ciclo").

- [ ] **Poner al día la flota real con la `v3.0.0`, repo por repo con el OK de Guido** (los siete con kit están en la `rc.6`, foto del
  banco del 15/11: Deptos en dos vueltas por G1; uno pide `pnpm` en la PC; otro, sin pruebas, la ficha con `gate:entorno-prueba` y su
  firma; los que tienen obra viva, cuando la cierren). Lo que cambia en cada uno: el resumen de la sesión 6 en la nota del director.
- [ ] **v3.0.1 — la adopción con un arranque propio** (visto al adoptar la madre, 2026-11-16): con `hook-arranque: propia` (un
  `session-start.sh` propio), la mezcla del settings igual cambia el `SessionStart` a `session-start.cjs`, que no trae: el repo arrancaría
  sin handoff. Y `adoptar --verificar` exige ese `.cjs` (da ❌ "arranque" con el propio andando). En la madre se arregló a mano en la
  adopción (el settings apunta al `.sh`); el `--verificar` de la madre va a dar ese ❌ hasta el arreglo, y la flota la marcaría ROTA.
  Arreglo: con la pieza en `propia`, la mezcla deja el `SessionStart` propio y `--verificar` mira el hook registrado, no el nombre.
- [ ] **Misión 7 — la mensajería agéntica → kit v3.1** (lo que era G.1; brief en `DISENO-G` §18 + sus insumos del acta de contraste: hueco 3/P71,
  P68, P77 y las "otras" 5, 8 y 24). Con investigación en internet y piloto. Guido, 2026-10-26: "no está bien claro todavía; siguiente versión;
  no bien termine lo otro, lo hago".
  **Guido, 2026-11-04: la próxima versión (después de la v3.0) junta tres cosas, cada una con su charla de diseño con él:**
  1. **El buzón**, que es esta mensajería.
  2. **"Probar una idea nueva"** (los experimentos de método). Sale de la v3.0, donde estaba en D8c.1: "vamos a sacar esta versión bien
     armada y en la próxima versión traemos eso de la idea nueva".
  3. **Un "PO" como skill**: un rol al lado del director que responde el buzón, habla con los directores, entiende el proyecto en su
     totalidad y puede consultar las bases. Guido: "después me ayudás a desarrollarla".

  Para el diseño hay que mirar cuatro cosas:
  - Hermes ya tiene un PO de hecho: Guido decide "por clic" lo que le traen los directores.
  - Cruzarlo con la mesa entre directores (paquete 5).
  - Cruzarlo con lo que se escribió en Hermes (`docs/legacy/una-sola-identidad/`).
  - Las consultas a las bases van con el rol de solo lectura (el módulo `lector` de Hermes).
  **Lo que el tramo final dejó para la v3.1** (de taller, sin charla de diseño; el detalle y su porqué en cada informe):
  - del plan del tramo (`TRAMO-FINAL-PLAN.md`, "Lo que ya está decidido", 2): el director corto, el aviso al celular, el kit como
    plugin (REJ-001), la poda de frenos por evidencia, el costo por encargo, el director sin `EnterWorktree`, el candado en repos con
    historia (tracker, 58) y la mesa en lote;
  - de la `rc.8` (`SPEC-paquete-8e.md`, "A la v3.1"): que `publicar` acepte lo que ya estaba en origin (c1), la flota que dice qué
    ramas de módulo parecen muertas (b1), el checklist de "me voy" en criollo, la identidad de git en el `doctor` (c3), por qué el
    director narra algunos renglones en inglés (b9) y que la flota pregunte en el momento (G1);
  - del banco otra vez (`BANCO-rc8.md`): "no pude probar: falta pnpm" en vez de ROTA (n1), la fila "te espera una decisión" para un
    repo sin pruebas (n2), cómo prender lo base en una adopción "todo en no" (n3), un encargo cerrado que sale dos veces en `/estado`
    (n5), el renglón en inglés de Claude Code en el parte (n6) y los cinco arreglos del script del banco;
  - **una decisión de Guido**, anotada sin tocar: si *cambiar* el `comando-test` de la ficha tiene que pedir su firma (hoy la pide
    solo sacarlo).

## 🔁 El ciclo (cada 3-4 meses; la vuelta en `docs/CICLO-DE-MEJORA.md` §2 y §5, y cómo sacar una versión, §6)
- [ ] **La medición de la `v3.0`**, al mes de la versión (~2026-12-15): la corrida mensual (`flota.py`, `huella.py`) contra la línea
  base del 2026-11-03 (§5.6 del ciclo). Es el primer insumo de la vuelta 2.
- [ ] **La vuelta 2 arranca el 2027-03-01** (o antes por un disparador, §2). Lee desde el corte de la vuelta 1: **`Usuario`
  2026-11-15, 15:42 UTC** y **`clientes` 2026-11-05** (`CORTE.md` del privado). La v3.1 (misión 7) no la espera.

## 🟠 Importante
- [ ] **El hook v2.4.3 al Bot y a su Panel** (inyectaban 15.500 y ~18.000 caracteres el 2026-10-22: arrancan sin ver su estado).
  En un chat de cada uno: *"traé el hook de arranque del molde del kit y medilo"* (receta en `GUIA-DE-USO.md`). El molde nuevo solo
  llega a los proyectos que se montan desde ahora.
- [ ] **Estreno real de `/relevamiento`**: un pedido de otro sector, de punta a punta. Hasta que pase
  **no se declara estable**. Quedan 11 de 21 criterios sin verificar (checklist en
  `docs/SPEC-relevamiento.md`). Se mide: ¿la invocaste sin que te la recuerden? ¿cuántas preguntas de
  más? ¿el Arquitecto repitió alguna? (Hubo un estreno parcial en la PC del compañero: Anexo A1 del acta.)
- [ ] **Estreno real del Modo B**: primera feature grande sobre el ERP con `/arquitecto` en la carpeta
  del proyecto.

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
- [ ] **Ideas para una versión futura del kit (después de la v3.0)**, de la prueba real:
  - **Un protocolo de producción**: lo que Hermes ya tiene en la zona propia de sus skills, es decir la ALERTA con las filas
    esperadas, la autorización por tramo con vencimiento (CM-7, 27 y 53 de Hermes) y los 4 pasos (ensayo, foto, revisión,
    verificación). El kit hoy solo tiene `Riesgo: alto` y la clase 3. Guido, 2026-11-04: queda en Hermes y se anota para una
    versión futura. Se reabre cuando lo pidan 3 proyectos (el analytics y el bot tocan un VPS real). Detalle: tracker, Pendientes,
    "De la adopción real de Hermes", ítem 2.
- [ ] **Fase 2 de `/relevamiento`**: 7 piezas diseñadas y no construidas (la más pedida: que lea sola
  el código de la app). Cada una tiene su condición de reapertura en REJ-014; el diseño, en
  `docs/SPEC-relevamiento.md` §Fase 2. Esperan evidencia de uso, no tiempo.
- [ ] **Fase 2 de `docs-fyd`**: `/inventario-fyd` (Excel + Mapa + hub privado). Mientras, el Excel sale
  del Kanban (columnas en `docs/SPEC-docs-fyd.md` §Fase 2).
- [ ] **Insumo para la misión 4** (de la misión 3, ADR-023): lo que es de cada PC (hoy una línea con lugar vacío en el
  Arquitecto) quizá en un archivo local aparte. (`docs/specs/` y el nombre de P7 quedaron resueltos en `DISENO-B` §4 y §12:
  sin `specs/`, los specs viven con su módulo; el norte se llama `NORTE.md`.)
