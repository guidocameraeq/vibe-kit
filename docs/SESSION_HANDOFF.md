# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo
> inyecta en cada chat nuevo de esta carpeta.

**Última sesión cerrada:** 2026-08-03 — **`/relevamiento` CONSTRUIDA, ampliada y el repo ordenado.
Versión estable `v2.4.2`.** El tramo de ANTES del Arquitecto existe y está instalado. Nueve commits,
cuatro tags, y una limpieza final para llegar al estreno sin frentes abiertos.

## Estado en una pantalla

| | |
|---|---|
| La skill | `kit/skills/relevamiento/` — **232 líneas** de motor (techo 260) + **5 anexos** + **12 plantillas** |
| Tamaño | motor+anexos **56.240 B** (techo 56.320 · **margen 80**) |
| Enganches | **8**, verificados uno por uno |
| Rutas canónicas | **5**, `diff -r` limpio |
| Gobierno | **20 ADRs** · **15 REJ** |
| Tags | `v2.3` → `v2.4` → `v2.4.1` → `v2.4.2` |

## Próximo paso concreto — y es uno solo

**El estreno real.** Cuando llegue el próximo pedido de otro sector: chat nuevo → `relevamiento` →
dictar de corrido. **Lo que se mide no es la calidad del documento:**

1. ¿La invocaste sin que nadie te la recuerde? *(no hay ningún mecanismo que lo haga, a propósito)*
2. ¿Cuántas preguntas te parecieron de más?
3. ¿El Arquitecto repitió alguna que ya estaba en el dossier?
4. ¿Dictar fue más cómodo que llenar el Word? — **es la apuesta central de todo el diseño**

Precedente que manda: `docs-fyd` pasó **16/16** en verificación y **la primera corrida real le corrigió
9 de 10 artefactos**. Acá el ciclo es peor: validar tarda un pedido de trabajo completo, semanas.

## Qué está verificado y qué no

**Verificado con evidencia real (10 de 21 criterios):** el pipeline del PDF de punta a punta (58.173 B,
`%PDF-1.4`, los 5 baldes distinguibles en escala de grises — se abrió el PDF y se miró) · los 3 hechos
de Chrome re-confirmados a mano (el HTML inexistente vuelve a dar **23.943 bytes exactos**) · el ritual
de sincronización de plantillas corrido y revertido · cero glob en el Arquitecto (el token explícito es
cierto por construcción) · el fork de plantillas sin una sola línea `<` · los dos techos · las 8
secciones del TABLERO con quien las escriba · los 44 mecanismos del SPEC presentes.

**NO verificado — necesita una corrida con Guido adentro:** los criterios **2, 3, 4, 7, 8, 9, 10, 11,
12, 15, 17, 19**. Clics contados, contradicciones reales, lentes que se bajan, el asimétrico
prendiendo, la mudanza. **No se declara estable hasta el primer relevamiento de punta a punta.**

## Los tres riesgos que más me preocupan (opinión, no dato)

1. **El tope de 24 interrupciones no tiene mecanismo.** Es un número declarado: nada lo cuenta, lo
   tiene que contar Claude solo a lo largo de semanas. El red-team ya encontró una vez 56 reales
   contra 20 declaradas. **Si algo arruina el estreno, es esto.**
2. **El volcado es la apuesta central y sigue sin probar.** Si el mapeo sale mediocre, Guido va a
   sentir que corrige a un mal secretario — peor que el Word.
3. **Mucha maquinaria para algo que se usa 4-5 veces al año.** Lo que se usa poco se pudre en silencio.

## Contexto que no está en otros docs

- **⚠️ El techo de KB está lleno: 80 bytes.** Es la **tercera vez consecutiva** que se salva podando
  duplicación, y ya no queda grasa evidente. **Lo próximo que se agregue necesita una decisión sobre
  el número, con su razón escrita en un ADR** — no alcanza con limpiar. Los 7 cortes restantes de la
  escalera (−35 líneas) siguen sin gastar, en `docs/PRESUPUESTO-relevamiento.md`.
- **La lección de tamaño:** el techo es **de líneas** pero el contenido se presupuesta **en bytes**, y
  se desacoplan. En el build, tras el corte 1, el archivo tenía 317 líneas con 20.799 B — el contenido
  entraba holgado y lo que sobraba era **el formato** (65 B/línea contra 77 de `docs-fyd` y 104 del
  Arquitecto). Reflowar a 92,8 lo bajó a 224 sin sacar nada. **Escribir fino infla el conteo sin
  ahorrar un token.**
- **La primera vez que algo de la skill tocó un caso real, encontró un bug.** Generando el PDF de la
  hoja de mano se descubrió que **`where chrome` devuelve vacío en esta máquina** y lo que funciona es
  el fallback a las 3 rutas. La skill ya lo hacía bien, pero el anexo le daba autoridad al camino
  equivocado. Corregido en `v2.4.1`. *Es exactamente lo que se espera del estreno.*
- **⚠️ El criterio 5 del SPEC estaba mal instrumentado y quedó corregido en el anexo:** `grep "file:///"`
  sobre un `.pdf` **da 0 aunque la ruta esté impresa** (streams comprimidos). El chequeo válido es que
  `--no-pdf-header-footer` esté en el comando.
- **`docs/` quedó en 9 archivos**, todos con razón de estar. La convención documental está escrita en
  el Mapa de `CLAUDE.md` (**ADR-020**): un SPEC implementado **se marca y se queda**; lo consumido va a
  `legacy/` con lápida. Incluye la divergencia deliberada con `formato-spec.md` del kit y su porqué.
- **El zip portable se retiró** (**REJ-015**) con el paso del `/cierre` que lo regeneraba. La evidencia
  que lo mató: la carpeta desapareció de la PC principal **sin que nadie lo notara**. Los caminos vivos
  son `git clone` + `kit/INSTALAR.md`, y **`actualizate`** para una PC que ya lo tiene.
- **La hoja de mano está en tres lados:** `guias/HOJA-DE-MANO-relevamiento.md` (versionada), un PDF en
  el Escritorio, y el artefacto en claude.ai. Enlazada desde el README y la guía.
- **De las 5 cosas que se agregaron en `v2.4`, ninguna pasó por red-team.** Cuatro se recuperaron del
  artefacto de diseño y tapan agujeros ya diagnosticados por escrito (riesgo bajo). **La quinta —
  arrancar desde material que ya existe— es una apuesta nueva** que Guido pidió con su caso a la vista.
- **Lo que hay que llevarle al jefe, sin apuro:** las 7 celdas faltantes (viven en la copia del kit,
  marcadas `[+fork]`) · versionar el método · y el hueco estructural: **el criterio de éxito a las 4-6
  semanas no tiene dueño ni fecha en el método**. El tramo 5 lo cierra del lado de Guido; del lado del
  papel sigue abierto.
- **Fase 2 de `/relevamiento`** (7 piezas, la más pedida: que lea sola el código) vive en **REJ-014**
  con su condición de reapertura, y se encuentra desde los Pendientes del README.
- **Sin estrenar todavía:** el **Modo B** del Arquitecto (ADR-012) y los modos "actualizar"/"agregar al
  menú" del Equipador.

## Bloqueos

Ninguno.
