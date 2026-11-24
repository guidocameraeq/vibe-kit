# TODO — vibe-kit

> ÚNICA fuente de pendientes del proyecto. Completado → SE BORRA (la historia vive en `CHANGELOG.md` y git). Header de 1 línea, sin narrativa de sesión.

2026-11-24 — ver SESSION_HANDOFF.md

> ⏰ **Fechas del ciclo** (si hoy ya pasó alguna, avisale a Guido al arrancar): **~2026-12-15** la medición de la `v3.0` ·
> **2027-03-01** la vuelta 2. El detalle, abajo en "El ciclo".

## 🔴 Crítico
> **La hoja de ruta, reordenada el 2026-10-26 (ADR-025)**: 4 cerrar el diseño sin mensajería → 4½ ordenar la casa → 5 construir **v3.0** →
> 6 el ciclo como proceso → 7 la mensajería agéntica (**v3.1**). Después, el reloj: una vuelta cada 3-4 meses (abajo, "El ciclo").

- [ ] **Poner al día la flota real con la `v3.2.0`, probar y juntar: el plan está en [PILOTO-3.2](kit-v3/PILOTO-3.2.md)** (la PC primero, de a
  un repo, dos semanas de uso y la revisión antes de la 3.2.1). Sesión en Opus. **2026-11-24**: fase 0 hecha en `Usuario`; Deptos,
  dos vueltas sin mezclar (sigue en `rc.6`, sano): falta la vuelta 3, con la PC enchufada (~1 h). Falta `clientes` entera (los otros
  seis). Perseo no tiene ficha: se adopta, en sesión aparte, cuando Guido quiera. (era con la `v3.1.0`; Guido, 2026-11-20: una sola puesta al día, con la 3.2), **repo por repo con el OK de Guido** (los siete con kit están en la `rc.6`, foto del
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
  2. **"Probar una idea nueva"**. **✅ Construida en la `3.2.0`** (2026-11-20; [SPEC-prueba](kit-v3/SPEC-prueba.md), ADR-043).
  3. **El PO** (la sesión principal del proyecto, skill `/po`). **✅ Construido en la `3.2.0`** (2026-11-20;
     [DISENO-PO](kit-v3/DISENO-PO.md), [SPEC-PO](kit-v3/SPEC-PO.md), ADR-042 y 044), con el turno a la vista y el panorama.

  **Sigue**: la flota real a la 3.2.0 (el ítem de arriba) · el uso real hace de piloto: mirar las medidas de `DISENO-PO.md` §6 y
  **si las sesiones de una PC comparten el temporal del candado** · la 3.2.1 (el ítem de abajo).
  - **No se construyó** (espera evidencia): `turno.cjs correr`, `pesados:` y el envoltorio en AUTORIZADO.
  - Sin leer: `docs/legacy/una-sola-identidad/` del proyecto del piloto (ese repo no está en `Usuario`).
- [ ] **La 3.2.1 — lo que deje el uso.** Sale **después de ver el uso real**; no se construye antes. Qué vía le toca lo dice ADR-046: el
  renglón 4 cambia una barrera y los renglones 1, 2 y 8 tocan la adopción y la flota, así que no va por la corta.
  **⏳ Decisión de Guido, sin tomar**: cómo sale un arreglo x.y.1 que toca eso (los 16 pasos no le calzan). Recomendado: una `rc`
  quirúrgica (§7 del ciclo) más el banco, con los cinco arreglos del script del banco hechos antes. Ordenado por cuánto muerde
  (repartido con Guido el 2026-11-22; el detalle de cada uno, en su informe de origen):
  1. **Prender una pieza por script.** No hay camino para prender una pieza opcional después de adoptar (`po: sí` y volver a poner
     al día: con la ficha al día la flota lo saltea y `aplicar` lo marca "adaptada (desvío detectado)"; a mano anda: copiar la skill
     y `po: molde`). Vale igual para `estado` y `release`. Se funden acá: cómo prender lo base en una adopción "todo en no" (6 de 18
     en el banco; `BANCO-rc8.md`, n3) y que la flota pregunte en el momento (`SPEC-paquete-8e.md`, G1; el fondo ya se arregló en la `rc.8`).
  2. **La flota dice ROTA cuando el repo no está roto**: "no pude probar: falta pnpm en esta PC" (n1) y la fila "te espera una
     decisión" para un repo sin pruebas (n2). Los dos casos están en la flota real.
  3. **La identidad de git en el `doctor`** (c3): el texto ya manda mirarla; el chequeo no existe. La cuenta de chequeos está fija
     en las pruebas y en el manual.
  4. **Que *cambiar* el `comando-test` pida firma** (ADR-045, 2026-11-22): ponerlo por primera vez, no. Se toca `idsFicha` en las
     dos copias de `cambios.cjs` (`kit/molde/hooks/lib/` y `kit/skills/arquitecto-skills/pc/lib/`), con su prueba.
  5. **Los cinco del revisor frío de la 3.2** (Opus, 2026-11-20, sobre `6162b6a..2ff16c1`; los otros tres se aplicaron en `1ab34fd`):
     - `estado.cjs` (`cambiosObra`): una fuente que falla una pasada sale como "ya no:" y vuelve como nueva en la siguiente;
     - `pruebas-flota.cjs:110-119, 239-253`: no valida el alias (con mayúsculas o espacios, `--vista` lo rechaza y la prueba queda
       para siempre en el `/inicio`); alias y `hasta` salen sin encerrar;
     - (menor) `prueba.cjs:62`: un texto de `anotar` que empieza con `--` se toma como opción;
     - (menor) `prueba.cjs:322`: el veredicto se agrega al final del archivo, no dentro de `## Veredicto`;
     - (menor) `po.cjs:285`: un error inesperado sale como traza de node en vez de una línea.
  6. **Adoptar con `docs: no` deja prendido el freno del árbol de `docs/`** (visto en la madre, 2026-11-16): `hook-escritura` queda
     en `molde` y `candado:raiz` frena todo archivo nuevo en `docs/` aunque el repo use su propio mapa. En la madre se quitó
     `candado:raiz` (aprobado `2026-11-16-quitar-arbol-docs-madre`). Arreglo: con `docs: no`, que la adopción proponga
     `hook-escritura: no` o el `candado:raiz` quitado con su razón, y que el banco sume un repo así. Es el mismo tema que "el
     candado en repos con historia" (tracker, 58): 3 de 7 repos lo tienen apagado. Mudar los documentos de cada repo no es del kit.
  7. **`mesa.cjs abiertos` lento** (95 s, y más de 3 min con la PC cargada; `DISENO-PO.md:60`): trae de cada remoto en fila. El
     panorama (`estado.cjs --obra`) ya lo hace de una sola vez.
  8. **La flota dice qué ramas de módulo parecen muertas** (b1; en el banco salteó 4 de 7 repos por ramas vivas): **solo si la
     flota real lo repite**.
  9. **Comprobar primero si siguen**: un encargo cerrado que sale dos veces en `/estado` (n5; un repo, una noche) · `SCRIPTS.md`
     dice que `turno.cjs` "solo lee" y `ver` borra las esperas de un proceso muerto (NO VERIFICADO) · si un proyecto nuevo arranca
     con `po: no` (NO VERIFICADO).
  10. **Textos del kit** (del repaso de coherencia del 2026-11-22): la descripción del Equipador no trae "preparame esta PC", que
      es la frase del README, la guía e `INSTALAR.md` · `kit.ejemplo.md` no muestra la pieza `po`.
  11. **Una sesión en una carpeta de trabajo de la app no puede commitear** en un repo con el kit si su `core.hooksPath` quedó
      absoluto (`git-seguro`, `hooks-path-ausente`); pasó en dos de tres carpetas el 2026-11-20. Hoy se rodea a mano (el handoff).
  **No se miró** (2026-11-20): si las pruebas pasan, el actualizador con una pieza aplicada a medias (`scripts` nuevo con `hooks-lib`
  viejo), el tiempo que suman al arranque las consultas a git de la línea de pruebas.
- [ ] **Más adelante, cada uno con su disparador** (del tramo final y del relevamiento del PO; repartido el 2026-11-22):
  - **El director corto y el director sin `EnterWorktree`**: una sola charla de diseño con Guido, con el piloto del PO a la vista
    (384 mil y 801 mil tokens en una noche; 12 y 7 frenos; `REVISION-rc7-mirada2.md`, V1 y V8). El segundo pide antes una prueba en
    la extensión.
  - **El aviso al celular**: primero la prueba de 15 min de si llega desde la extensión (V2; 481 minutos esperando una noche).
  - **El checklist de "me voy" en criollo**: cuando haya una noche real para probarlo.
  - **Los plazos de los hooks y del push de `integrar` con la PC cargada**: espera el rastro del turno (`turno.cjs rastro`); la
    causa no se midió.
  - **El candado `topes` en rojo con cuatro módulos**: no hay caso anotado. La próxima vez, anotar qué tope y en qué proyecto.

## 🔁 El ciclo (cada 3-4 meses; la vuelta en `docs/CICLO-DE-MEJORA.md` §2 y §5, y cómo sacar una versión, §6)
- [ ] **La medición de la `v3.0`**, al mes de la versión (~2026-12-15): la corrida mensual (`flota.py`, `huella.py`) contra la línea
  base del 2026-11-03 (§5.6 del ciclo). Es el primer insumo de la vuelta 2.
- [ ] **La vuelta 2 arranca el 2027-03-01** (o antes por un disparador, §2). Lee desde el corte de la vuelta 1: **`Usuario`
  2026-11-15, 15:42 UTC** y **`clientes` 2026-11-05** (`CORTE.md` del privado). La v3.1 (misión 7) no la espera.
  Entran a esa vuelta (repartido el 2026-11-22):
  - **Los cinco arreglos del script del banco, antes de correrlo la próxima vez** (la 3.2.1 si le toca banco, o esta vuelta) (`BANCO-rc8.md:189-198`; ya lo manda el ciclo, §6): el pedido
    por entrada estándar (10 de 16 `/inicio` lo sufrieron), `flota` con `--con-obra`, el `&` del `comando-test` en la plantilla
    de la noche, no correr `barreras` en un repo "todo en no", y una tanda que mida los criterios de `/cierre`.
  - **La poda de frenos por evidencia** (`REVISION-rc7-mirada2.md`, V4): primero contar en los `frenos.log` de la flota qué regla
    frenó qué y cuántas veces de más; recién después sacar de a una, midiendo y con red team.

## 🟠 Importante
- [ ] **La 3.1.1, del piloto del buzón** (ADR-041; el detalle en `docs/kit-v3/AUDITORIA-3.1.md` y el revisor frío del 2026-11-20):
  - **la misma persona en su segunda PC termina en disputa** (`buzon.cjs:656-666` contra la skill, que promete un alta): Guido no
    registra su segunda PC hasta arreglarlo;
  - **una cuenta de Windows de 22 caracteres o más** (la de Guido en `Usuario` tiene 22): `dir /q` la corta y el aviso deja sus mensajes
    "sin verificar todavía" hasta "revisá el buzón" (Get-Acl). Arreglo: resolverla en el hilo aparte del aviso y guardarla en el
    índice. Lo encontró la suite del 2026-11-20 (`aviso-real.test.cjs` mide hoy los dos lados);
  - el aviso del buzón se registra en toda PC: que vaya con la misma condición que la regla `allow` (con config);
  - el home con espacios (`rutaComando` sin comillas) y la cuenta con tilde o eñe (`whoami` leído como utf8; NO VERIFICADO);
  - reinstalar sin config deja `"allow": []`;
  - las dos "mesas": el puntero de la skill va a `mesa.cjs`;
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
