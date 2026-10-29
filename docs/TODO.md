# TODO — vibe-kit

> ÚNICA fuente de pendientes del proyecto. Completado → SE BORRA (la historia vive en `CHANGELOG.md` y git). Header de 1 línea, sin narrativa de sesión.

2026-10-29 — ver SESSION_HANDOFF.md

## 🔴 Crítico
> **La hoja de ruta, reordenada el 2026-10-26 (ADR-025)**: 4 cerrar el diseño sin mensajería → 4½ ordenar la casa → 5 construir **v3.0** →
> 6 el ciclo como proceso → 7 la mensajería agéntica (**v3.1**). Después, el reloj: una vuelta cada 3-4 meses (abajo, "El ciclo").

- [ ] **Misión 5 — construir el pack por piezas → kit v3.0** (en curso: paquetes 1 y 2 ✅; el modelo de cada rol, en la sección "Ejecución" del spec). **El plano es `docs/kit-v3/SPEC-0-kit-v3.md` (READY, 2026-10-27)**:
  9 paquetes en el orden de su tabla "Orden de construcción" (1 ficha y parser · 2 documentos, hook, candado, `cambios` · 3 seguridad · 4 Arquitecto
  y `worktree` · 5 canon director/obrero, `/estado`, mesa · 6 Equipador, actualizador, adoptador · 7 ciclo y portada · 8 observatorio y docs del
  método · 8½ credenciales de Deptos · 9 piloto · 10 tag). Cada paquete con spec delta en `docs/kit-v3/SPEC-paquete-N.md`, red team si toca
  permisos, revisor frío. **Piloto en Deptos**, un mes, medición contra TABLERO §1; su lista NO VERIFICADO y "Lo que hacés vos de nuevo" están
  en el spec. La primera sesión abre con la línea de la sección "Ejecución". **Por dónde vamos: `docs/kit-v3/PLAN-construccion.md`** (el tracker: no
  se repite acá; este ítem sale cuando el tracker diga ✅ el paquete 10).
- [ ] **Misión 6 — escribir el ciclo de mejora del método** (al terminar la misión 5, con todo fresco; antes de la mensajería, porque es lo que
  más se evapora). Juntar en un documento reusable y genérico de vibe-kit lo que hoy está repartido (ADR-021, SPEC-investigacion-chats,
  observatorio/investigacion/METODO.md, docs/mision-4/PLAN.md):
  - **revisar cómo trabajamos de verdad en estas sesiones** (pedido de Guido, 2026-10-26): leer los chats de las misiones 1-5, que están
    **todos en el privado `vibe-research/chats/`** (índice por PC y la receta en su `LEEME.md`; los de `clientes` hasta D3.1, los de `Usuario`
    de la misión 4; faltan A, C y E), cómo fue cada sesión y cuánto costó cada racimo. **Antes, cada PC suma lo suyo con la receta**: al
    terminar la misión 5 en `Usuario` (y en `clientes` si se vuelve a trabajar ahí), sus chats van a `chats/<pc>/`;
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
- [ ] **Fase 2 de `/relevamiento`**: 7 piezas diseñadas y no construidas (la más pedida: que lea sola
  el código de la app). Cada una tiene su condición de reapertura en REJ-014; el diseño, en
  `docs/SPEC-relevamiento.md` §Fase 2. Esperan evidencia de uso, no tiempo.
- [ ] **Fase 2 de `docs-fyd`**: `/inventario-fyd` (Excel + Mapa + hub privado). Mientras, el Excel sale
  del Kanban (columnas en `docs/SPEC-docs-fyd.md` §Fase 2).
- [ ] **Insumo para la misión 4** (de la misión 3, ADR-023): lo que es de cada PC (hoy una línea con lugar vacío en el
  Arquitecto) quizá en un archivo local aparte. (`docs/specs/` y el nombre de P7 quedaron resueltos en `DISENO-B` §4 y §12:
  sin `specs/`, los specs viven con su módulo; el norte se llama `NORTE.md`.)
