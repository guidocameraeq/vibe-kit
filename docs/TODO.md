# TODO — vibe-kit

> ÚNICA fuente de pendientes del proyecto. Completado → SE BORRA (la historia vive en `CHANGELOG.md` y git). Header de 1 línea, sin narrativa de sesión.

2026-11-20 — ver SESSION_HANDOFF.md

> ⏰ **Fechas del ciclo** (si hoy ya pasó alguna, avisale a Guido al arrancar): **~2026-12-15** la medición de la `v3.0` ·
> **2027-03-01** la vuelta 2. El detalle, abajo en "El ciclo".

## 🔴 Crítico
> **La hoja de ruta, reordenada el 2026-10-26 (ADR-025)**: 4 cerrar el diseño sin mensajería → 4½ ordenar la casa → 5 construir **v3.0** →
> 6 el ciclo como proceso → 7 la mensajería agéntica (**v3.1**). Después, el reloj: una vuelta cada 3-4 meses (abajo, "El ciclo").

- [ ] **Poner al día la flota real con la `v3.1.0`, repo por repo con el OK de Guido** (los siete con kit están en la `rc.6`, foto del
  banco del 15/11: Deptos en dos vueltas por G1; uno pide `pnpm` en la PC; otro, sin pruebas, la ficha con `gate:entorno-prueba` y su
  firma; los que tienen obra viva, cuando la cierren). Lo que cambia en cada uno: el resumen de la sesión 6 en la nota del director.
  Con la `3.0.1` un repo con arranque propio ya no lo pierde al ponerse al día.
- [ ] **Misión 7 — la mensajería agéntica: el buzón y `reflexion` en la 3.1.0; el PO y "probar una idea nueva" en la 3.2** (ADR-041) (lo que era G.1; brief en `DISENO-G` §18 + sus insumos del acta de contraste: hueco 3/P71,
  P68, P77 y las "otras" 5, 8 y 24). Con investigación en internet y piloto. Guido, 2026-10-26: "no está bien claro todavía; siguiente versión;
  no bien termine lo otro, lo hago".
  **Guido, 2026-11-04: la próxima versión (después de la v3.0) junta tres cosas, cada una con su charla de diseño con él:**
  1. **El buzón**, que es esta mensajería. **Diseño ✅ 2026-11-19** ([DISENO-G1-buzon](kit-v3/DISENO-G1-buzon.md), ADR-037; lo decidió
     el probador con el OK de Guido). **Spec ✅ READY 2026-11-19** ([SPEC-G1-buzon](kit-v3/SPEC-G1-buzon.md), ADR-038, con red team).
     **Construcción ✅ 2026-11-19** (sesión 1: el instalador, el aviso y el `doctor`, ADR-039; sesión 2: `buzon.cjs`, la skill, el
     protocolo, kit-owned y el tope, ADR-040; el spec, ✅ IMPLEMENTADO). **✅ Publicado en la `v3.1.0`** (2026-11-20, sin `rc` ni banco: ADR-041).
     **Sigue**: el piloto de un mes en la PC del probador: actualizar el kit, `registrame en el buzón`, "instalar
     hooks por PC" y `buzon.cjs medir --linea-base`. Una disputa de registros la resuelve la persona en cada PC (ADR-040).
  2. **"Probar una idea nueva"**. **Spec ✅ READY 2026-11-20** ([SPEC-prueba](kit-v3/SPEC-prueba.md), ADR-043, con red team). Sin construir.
  3. **El PO** (la sesión principal del proyecto, skill `/po`). **Diseño y spec ✅ READY 2026-11-20** ([DISENO-PO](kit-v3/DISENO-PO.md),
     [SPEC-PO](kit-v3/SPEC-PO.md), ADR-042; revisor frío y red team). Sin construir. Une la ficha `transporte: buzon` con el buzón.

  **Sigue: la tanda de construcción de la 3.2** (el detalle en `SPEC-PO.md`, "Ejecución"):
  - **0, la compuerta**: los dos repos del piloto a la `v3.1.0` (el ítem de la flota, arriba). A la semana, las mismas preguntas de
    `DISENO-PO.md` §3.1 a las sesiones que cumplan el rol, y medir si las sesiones de una PC comparten el temporal del candado. Con
    eso Guido decide si entra lo marcado "solo si la compuerta lo pide" (el envoltorio del turno y `pesados:`).
  - `vibe-kit 3.2 · El turno y el panorama` → `vibe-kit 3.2 · La skill del PO` → `vibe-kit 3.2 · Probar una idea nueva` →
    `vibe-kit 3.2 · La rc.1 y el piloto` (banco vuelta 1, dos semanas de piloto, `rc` de arreglos, banco, versión).
  - Sin leer: `docs/legacy/una-sola-identidad/` del proyecto del piloto (ese repo no está en `Usuario`).
  - **Sin ubicar**: los arreglos de abajo ("para la v3.1") no se trataron en la charla: van a una 3.1.x o a la 3.2, lo decide Guido.
    Se suman tres que mostró el relevamiento: `mesa.cjs abiertos` lento (95 s y más de 3 min con la PC cargada) · los plazos de los
    hooks y del push de `integrar` con la PC cargada · el candado `topes` en rojo con cuatro módulos.
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
- [ ] **Kit: adoptar con `docs: no` deja prendido el freno del árbol de `docs/`** (visto en la madre, 2026-11-16): `hook-escritura` queda
  en `molde` y `candado:raiz` frena todo archivo nuevo en `docs/` aunque el repo use su propio mapa. En la madre se quitó `candado:raiz`
  (aprobado `2026-11-16-quitar-arbol-docs-madre`). Arreglo: con `docs: no`, que la adopción proponga `hook-escritura: no` o el
  `candado:raiz` quitado con su razón, y que el banco sume un repo así. Para la `3.0.2` o la `v3.1`, con el ciclo (§6).
- [ ] **La 3.1.1, del piloto del buzón** (ADR-041; el detalle en `docs/kit-v3/AUDITORIA-3.1.md` y el revisor frío del 2026-11-20):
  - **la misma persona en su segunda PC termina en disputa** (`buzon.cjs:656-666` contra la skill, que promete un alta): Guido no
    registra su segunda PC hasta arreglarlo;
  - **una cuenta de Windows de 22 caracteres o más** (la de Guido en `Usuario` tiene 22): `dir /q` la corta y el aviso deja sus mensajes
    "sin verificar todavía" hasta "revisá el buzón" (Get-Acl). Arreglo: resolverla en el hilo aparte del aviso y guardarla en el
    índice. Lo encontró la suite del 2026-11-20 (`aviso-real.test.cjs` mide hoy los dos lados);
  - el aviso del buzón se registra en toda PC: que vaya con la misma condición que la regla `allow` (con config);
  - el home con espacios (`rutaComando` sin comillas) y la cuenta con tilde o eñe (`whoami` leído como utf8; NO VERIFICADO);
  - reinstalar sin config deja `"allow": []`;
  - los manuales (`SCRIPTS.md` sin `buzon.cjs`, el Equipador sin el aviso) y las dos "mesas": el puntero de la skill va a `mesa.cjs`;
  - lo NO VERIFICADO del primer uso real: VS Code en vivo (`CLAUDE_CODE_ENTRYPOINT` de la extensión), los tiempos del aviso sobre la
    carpeta de red, y que "reflexioná" o "¿quedó algo suelto?" disparen `reflexion` solos.
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
