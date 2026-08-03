# vibe-kit — mi método de vibe coding con Claude Code

> El método completo para dirigir Claude Code sin ser programador: el playbook (documentación +
> sistema de trabajo), el Arquitecto (piensa y monta proyectos nuevos), el Equipador (equipa
> máquinas con skills curadas), y `/relevamiento` (el tramo de ANTES: entender un pedido que vino de
> otra persona). Nacido de auditorías reales sobre meses de trabajo (Hermes, Perseo).
> **Versión estable: `v2.4.2`** (tag de git, 2026-08-03 — la skill `/relevamiento`: el método de arranque
> de 4 etapas con PDF por etapa, revisor y lentes, la costura al Arquitecto por token explícito, el
> abanico de 6 salidas —construir es sólo una— y el arranque desde material que ya existe; v2.4.1
> corrige la detección de Chrome con lo medido; v2.4.2 cablea las secciones del tablero que nadie escribía).
> v2.2.1 fue `docs-fyd` con la checklist condicionada al repo; v2.1, el Arquitecto de 3 modos.

## La regla de la casa (desde que esto es un repo)

**La fuente canónica es ESTE repo.** La copia instalada en `~/.claude/` de cada máquina se
sincroniza DESDE acá. El flujo de cambios:

```
editar en kit/ (este repo) → sincronizar a ~/.claude/ → commit + push
```

Para cambiar algo del Arquitecto/Equipador, en un chat de esta carpeta:
*"actualizá el arquitecto: [el cambio] — editá en kit/, sincronizá a ~/.claude y commiteá"*.
Nunca editar `~/.claude/` directo (queda huérfano del historial).

## Estructura

| Qué | Dónde |
|---|---|
| **La guía de uso** — recetas por situación + frases mágicas (empezá por acá) | `GUIA-DE-USO.md` |
| **El método** (documentación + sistema de trabajo, se lee 1 vez por proyecto) | `PLAYBOOK-MAESTRO.md` |
| **El kit instalable** — FUENTE CANÓNICA del Arquitecto + Equipador + menú + templates + agente red-team + **motor `docs-fyd`** + **skill `/relevamiento`** (con las plantillas del método en `_fuente/`) + su instalador | `kit/` |
| **Guías de uso** (casos de uso, cuándo sí/no) — incluye **`HOJA-DE-MANO-relevamiento.md`**, la hoja de una página para tener a mano cuando te piden algo | `guias/` |
| **El Extractor** — agente de tips: abrir Claude Code AHÍ + pegar links = extrae, evalúa y deja el informe | `extractor/` |
| Informes de tandas de tips (outputs del Extractor) | `tips/` |
| Estado del proyecto madre: handoff (lo inyecta el hook), DECISIONS (20 ADRs), REJECTED (15 REJ), **SPEC + PRESUPUESTO + RECORRIDO de `/relevamiento` (implementado → la skill vive en `kit/skills/relevamiento/`)** | `docs/` + `CLAUDE.md` raíz + skill `/cierre` |
| Archivo histórico (v1, auditorías, snapshots pre-git, la PROPUESTA-V2 ya cumplida) | `legacy/` |

## Instalar en una PC nueva

1. Clonar este repo (necesita git — ver REJ-015 si la máquina no lo tiene).
2. Abrir Claude Code en `kit/` y pegar el prompt de `kit/INSTALAR.md`. Se instala solo:
   copia skills y agente a `~/.claude/`, pregunta dónde viven tus proyectos, verifica todo.
3. Al final ofrece equipar la máquina (`/arquitecto-skills` — el menú curado de skills).

## El día a día (una vez instalado)

**→ [`GUIA-DE-USO.md`](GUIA-DE-USO.md)** — todas las recetas por situación ("quiero X → hacé Y")
y la chuleta de frases mágicas. Es LA puerta de entrada para usar el sistema.

## Mantenimiento

- Cambio al kit → editar en `kit/` → sincronizar a `~/.claude/` → commit + push (una sola
  fuente, historial completo). Los snapshots de `legacy/snapshots/` quedaron para la era
  pre-git; ahora versiona git.
- PDFs de las guías: se generan a demanda (los MD de `guias/` son la fuente).
- En la otra PC (d:\SAAS): clonar este repo y correr el instalador — su catálogo viejo
  (`legacy/KIT_SKILLS-maquina-dsaas-2026-07-05.md`) se reconcilia con el menú del Equipador.

## Pendientes (post-v2.1)

- 🔥 **EL ESTRENO REAL de `/relevamiento`** — el próximo pedido de otro sector, de punta a punta.
  Es la única señal que vale, y hasta que pase **no se declara estable** (precedente: `docs-fyd`
  pasó 16/16 en verificación y la primera corrida real le corrigió 9 de 10 artefactos). De los 21
  criterios de aceptación, **10 se verificaron en el build con evidencia real** (los dos techos, el
  pipeline del PDF, los 3 hechos de Chrome, el ritual de sync de plantillas, el token explícito);
  **los otros 11 necesitan una corrida con Guido adentro** y están sin verificar, dichos como tales.
  Lo que se mide en el estreno no es la calidad del documento: ¿la invocaste sin que nadie te la
  recuerde? ¿cuántas preguntas te parecieron de más? ¿el Arquitecto repitió alguna?
- 💡 **Las opciones guardadas de `/relevamiento` (la "Fase 2")** — siete piezas **diseñadas y no
  construidas todavía**, no descartadas: que la skill **lea sola el código** de la app cuando el
  pedido cae sobre algo que ya existe (la que más interés despertó) · que el **Modo B** del Arquitecto
  use el dossier · Word como entregable · que se dé cuenta sola de que está cansando · un modo para
  listar y podar relevamientos viejos · que aprenda entre relevamientos · guardar los PDF viejos.
  **Cada una tiene escrita la condición exacta que la despierta** en **REJ-014**, y el diseño completo
  quedó en `docs/SPEC-relevamiento.md` §"Fase 2" para no re-pensarlo. Casi todas esperan **evidencia
  de uso**, no tiempo de desarrollo. *(Están en REJECTED.md por convención del repo — es donde viven
  las cosas con condición de reapertura; esta línea existe para que se encuentren desde acá.)*
- **Llevarle al jefe, aparte y sin apuro** (de la sesión de diseño): las **7 celdas faltantes** de la
  grilla (viven en la copia del kit, marcadas `[+fork]`, hasta que él las apruebe) · **versionar el
  método** (hoy no tiene número de versión: la procedencia cita la fecha 2026-07-22 y el detector es
  `git diff _fuente/`) · y el hueco estructural: **el criterio de éxito a las 4-6 semanas no tiene
  dueño ni fecha en el método** — el papel no cierra su propio lazo. El tramo 5 de la skill lo cierra
  del lado de Guido, pero del lado del método sigue abierto.
- **Fase 2 de `docs-fyd`**: el inventario central (`/inventario-fyd`, Excel + Mapa + hub privado)
  quedó diferido; mientras tanto el Excel lo arma Guido desde su tablero Kanban (columnas en la
  sección Fase 2 del SPEC).
- 🔥 **Estreno real del Modo B**: primera feature grande sobre el ERP con `/arquitecto` en la
  carpeta del proyecto (el modo está construido y validado adversarialmente; le falta su
  primera misión de verdad).
- **Compuerta del Modo C** (~2 semanas de uso de A+B): si no te trabaste 3+ veces pidiendo
  cosas, C queda como está; si sí, se afina con casos reales.
- Equipador: faltan estrenar "actualizar" y "agregar al menú".
- Capturas del carrusel de @sabbb.md para cerrar el tip pendiente de la tanda 2.

### Ya hecho (la historia, en una línea cada uno)

- ~~**CONSTRUIR la skill `/relevamiento`**~~ ✅ **2026-08-03** — `v2.4.2`. ADR-016 a 019 · REJ-011 a 014.
- ~~**Release v2.0: el sistema `docs-fyd`**~~ ✅ **2026-07-23** — 16/16 verificado. ADR-014.
- ~~**docs-fyd v2: dudas por opciones**~~ ✅ **2026-07-23**, evaluado en campo → PASS + `v2.2.1`. ADR-015.
- ~~**Equipador auto-actualizable**~~ ✅ **2026-07-24** — el modo `actualizate`.
- ~~**Llevar el kit a la PC d:\SAAS**~~ ✅ **2026-07-11**.
