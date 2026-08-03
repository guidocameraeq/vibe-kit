# vibe-kit — mi método de vibe coding con Claude Code

> El método completo para dirigir Claude Code sin ser programador: el playbook (documentación +
> sistema de trabajo), el Arquitecto (piensa y monta proyectos nuevos), el Equipador (equipa
> máquinas con skills curadas), y `/relevamiento` (el tramo de ANTES: entender un pedido que vino de
> otra persona). Nacido de auditorías reales sobre meses de trabajo (Hermes, Perseo).
> **Versión estable: `v2.3`** (tag de git, 2026-08-03 — la skill `/relevamiento`: el método de arranque
> de 4 etapas con PDF por etapa, revisor y lentes, y la costura al Arquitecto por token explícito.
> v2.2.1 fue `docs-fyd` con la checklist condicionada al repo; v2.1, el Arquitecto de 3 modos).

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
| **Guías de uso** (casos de uso, cuándo sí/no) | `guias/` |
| **El Extractor** — agente de tips: abrir Claude Code AHÍ + pegar links = extrae, evalúa y deja el informe | `extractor/` |
| Informes de tandas de tips (outputs del Extractor) | `tips/` |
| Estado del proyecto madre: handoff (lo inyecta el hook), DECISIONS (17 ADRs), REJECTED (14 REJ), **SPEC + PRESUPUESTO + RECORRIDO de `/relevamiento` (implementado → la skill vive en `kit/skills/relevamiento/`)** | `docs/` + `CLAUDE.md` raíz + skill `/cierre` |
| Archivo histórico (v1, auditorías, snapshots pre-git, la PROPUESTA-V2 ya cumplida) | `legacy/` |

## Instalar en una PC nueva

1. Clonar este repo (o llevar el zip de `Desktop\Arquitecto en otras PCs\` si no hay git).
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
- El zip de `Desktop\Arquitecto en otras PCs\` se regenera desde `kit/` tras cambios grandes.
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
- **Llevarle al jefe, aparte y sin apuro** (de la sesión de diseño): las **7 celdas faltantes** de la
  grilla (viven en la copia del kit, marcadas `[+fork]`, hasta que él las apruebe) · **versionar el
  método** (hoy no tiene número de versión: la procedencia cita la fecha 2026-07-22 y el detector es
  `git diff _fuente/`) · y el hueco estructural: **el criterio de éxito a las 4-6 semanas no tiene
  dueño ni fecha en el método** — el papel no cierra su propio lazo. El tramo 5 de la skill lo cierra
  del lado de Guido, pero del lado del método sigue abierto.
- ~~🔥 **CONSTRUIR la skill `/relevamiento`**~~ ✅ **construida (2026-08-03)**: motor de 224 líneas
  (techo 260) + 5 anexos + 12 plantillas, 51,3 KB de motor+anexos (techo 55). Los 8 enganches puestos
  (3 toques al Arquitecto —el de "no montes todavía" al final del Paso 4, donde el red-team lo movió—,
  las alternativas evaluadas en `formato-spec.md`, el paso 6-bis del `/cierre` universal, los 6 lugares
  kit-owned del Equipador, el menú, `INSTALAR.md`, y el diff canónico 4→5 rutas). Se tomó el **corte 1
  de la escalera de poda en su disparador** (5 anexos en vez de 4). Decisión = ADR-016 (diseño) +
  **ADR-017** (construcción) · descartes = REJ-011/012/013 + **REJ-014** (la Fase 2 entera).
- ~~🔥 **Construir el release v2.0 del Arquitecto — sistema `docs-fyd`**~~ ✅ **construido
  (2026-07-23)**: la skill `kit/skills/docs-fyd/` (motor + `deteccion.md` + `prompts-fyd.md` + 13
  plantillas) + los 7 enganches (frescura en el cierre-plantilla, fila kit-owned en el menú,
  copiar-si-está en INSTALAR, caso kit-owned en el Equipador, siembra CON PREGUNTA en el Paso 5 del
  Arquitecto, diff canónico 3→4 rutas). Verificado **16/16** (workflow adversarial sobre los 14
  criterios + anti-secretos + consistencia) y `diff -r` de las 4 rutas limpio.
- ~~🔥 **docs-fyd v2 — resolver las dudas POR OPCIONES**~~ ✅ **construido (2026-07-23)**: tras la 1ª
  corrida real (reporte de campo sobre Hermes), v2 hace que la skill **pregunte por opciones** cuando
  duda (backups/RLS/base compartida/tokens — checklist proactiva fija), **nunca afirme un negativo
  falso**, y la capa humana (`_ACLARACIONES.md`) **sobreviva la regeneración**. SPEC
  `docs/SPEC-docs-fyd-v2.md` (READY, endurecido tras red-team de 6 lentes / 26 hallazgos) + ADR-015 +
  protocolo `docs/EVALUACION-docs-fyd-v2.md`. Verificado (8 PASS + 5 PARTIAL foldeados). **Próximo real:**
  correr `/docs-fyd` (v2) en las apps críticas de FyD, completar bóveda/aclaraciones, y pasar el
  protocolo de evaluación sobre Hermes (señal vs ruido de las preguntas) antes de soltarlo al resto.
- **Fase 2 de `docs-fyd`**: el inventario central (`/inventario-fyd`, Excel + Mapa + hub privado)
  quedó diferido; mientras tanto el Excel lo arma Guido desde su tablero Kanban (columnas en la
  sección Fase 2 del SPEC).
- 🔥 **Estreno real del Modo B**: primera feature grande sobre el ERP con `/arquitecto` en la
  carpeta del proyecto (el modo está construido y validado adversarialmente; le falta su
  primera misión de verdad).
- **Compuerta del Modo C** (~2 semanas de uso de A+B): si no te trabaste 3+ veces pidiendo
  cosas, C queda como está; si sí, se afina con casos reales.
- Equipador: faltan estrenar "actualizar" y "agregar al menú".
- ~~🔮 **Equipador auto-actualizable**~~ ✅ **hecho (2026-07-24)**: `/arquitecto-skills` tiene el Modo
  **AUTO-ACTUALIZAR EL KIT** — baja lo kit-owned (arquitecto / arquitecto-skills / docs-fyd + redteam) del
  repo canónico y se actualiza a sí mismo, con diff-antes-de-pisar y preservando la ruta de proyectos
  por-PC. Se dispara con *"actualizá el kit"* / *"actualizate"*.
- ~~Llevar el kit a la PC d:\SAAS~~ ✅ instalado (2026-07-11). Colita: confirmar allá la
  reconciliación del catálogo viejo (superpowers/sql-expert) con el menú — `/arquitecto-skills`
  → *"qué skills tengo"*.
- Capturas del carrusel de @sabbb.md para cerrar el tip pendiente de la tanda 2.
