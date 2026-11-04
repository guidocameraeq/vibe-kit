# TODO — vibe-kit

> ÚNICA fuente de pendientes del proyecto. Completado → SE BORRA (la historia vive en `CHANGELOG.md` y git). Header de 1 línea, sin narrativa de sesión.

2026-11-04 — ver SESSION_HANDOFF.md

## 🔴 Crítico
> **La hoja de ruta, reordenada el 2026-10-26 (ADR-025)**: 4 cerrar el diseño sin mensajería → 4½ ordenar la casa → 5 construir **v3.0** →
> 6 el ciclo como proceso → 7 la mensajería agéntica (**v3.1**). Después, el reloj: una vuelta cada 3-4 meses (abajo, "El ciclo").

- [ ] **Misión 5 — construir el pack por piezas → kit v3.0** (en curso: paquetes 1 a 8, 8b, 8r y 8r2 ✅, **beta `v3.0.0-rc.3` taggeada** el 2026-11-04 (la tanda de taller de R1b; `flota todo` sin `--tag` manda el último tag, rc incluido, a todo proyecto con ficha: hoy solo Hermes); siguen, en orden (tracker, "Después de la rc.1: las sesiones que siguen"): **la mañana con Guido** (abre con D1-D4 de `REVISION-INTEGRAL-rc2.md`; preparar la PC y adoptar Hermes) → **el diseño de los experimentos de método con Guido** → **D8c.1 la `rc.4`** (el obrero de cierre de tramo, los experimentos, lo de "De D8r.1" y "De D8r.2" en Pendientes) → la prueba real en Hermes con los `rc.N` → R2 y la `v3.0`; el modelo de cada rol, en la sección "Ejecución" del spec). **El plano es `docs/kit-v3/SPEC-0-kit-v3.md` (READY, 2026-10-27)**:
  9 paquetes en el orden de su tabla "Orden de construcción" (1 ficha y parser · 2 documentos, hook, candado, `cambios` · 3 seguridad · 4 Arquitecto
  y `worktree` · 5 canon director/obrero, `/estado`, mesa · 6 Equipador, actualizador, adoptador · 7 ciclo y portada · 8 observatorio y docs del
  método · 8½ credenciales de Deptos · 9 piloto · 10 tag). Cada paquete con spec delta en `docs/kit-v3/SPEC-paquete-N.md`, red team si toca
  permisos, revisor frío. **Prueba real: Hermes Desktop, con su módulo nuevo, desde el 2026-11-04** (ya no un piloto en Deptos), medición contra TABLERO §1; su lista NO VERIFICADO y "Lo que hacés vos de nuevo" están
  en el spec. La primera sesión abre con la línea de la sección "Ejecución". **Por dónde vamos: `docs/kit-v3/PLAN-construccion.md`** (el tracker: no
  se repite acá; este ítem sale cuando el tracker diga ✅ el paquete 10).
- [ ] **Misión 6 — el ciclo de mejora del método** (adelantada por Guido el 2026-11-03 y partida en dos). **6a ✅ 2026-11-03**:
  `docs/CICLO-DE-MEJORA.md` (la receta: el reloj, los cinco pasos con lo de adentro y lo de afuera, cómo se decide con ADR-030 y ADR-034,
  la revisión integral como paso fijo, cómo trabajamos de verdad en la vuelta 1, lo que costó, las lecciones y las plantillas; el plan y la
  medición en `docs/mision-6/PLAN-6a.md`). **Falta la 6b**, corta, cuando cierre el primer módulo de Hermes: §3.5 (probar en un proyecto
  real y medir) y §8 (la fecha de corte de la próxima vuelta) con lo vivido. Es una receta, no una skill (regla de 3+).
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

## 🔁 El ciclo (cada 3-4 meses; la próxima vuelta arranca del corte del 2026-10-26 y cae entre febrero y marzo de 2027)
1. **Investigar**: condensar los chats desde el corte anterior y leerlos con las decisiones vigentes en la mano (como la lectura de contraste);
   leer también los registros de cambios de método de los proyectos. Lo crudo al privado `vibe-research`, el acta con alias a `tips/`.
2. **Ordenar la casa**: repo limpio, legacy con lápida, guía y manuales.
3. **Diseñar con Guido**: solo lo que la evidencia reabre, en racimos, con los 11 criterios y revisor frío.
4. **Construir y pilotear**: versión nueva del kit, un proyecto piloto, un mes de uso.
5. **Medir**: los scripts gratis contra las líneas base; de ahí sale la fecha de la próxima vuelta. La misión 6 lo deja escrito.

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
