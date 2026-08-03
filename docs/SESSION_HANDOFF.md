# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo
> inyecta en cada chat nuevo de esta carpeta.

**Última sesión cerrada:** 2026-08-03 — **`/relevamiento` CONSTRUIDA y ampliada. Release `v2.4`.** El
tramo de ANTES del Arquitecto existe: motor de **231 líneas** (techo 260) + **5 anexos** + **12
plantillas**, con los **8 enganches** puestos y el `diff -r` de las **5 rutas canónicas** limpio.
Se construyó contra el SPEC READY y la tabla de 26 bloques del presupuesto (→ v2.3), y después Guido
comparó contra el artefacto de diseño y se recuperó lo que el SPEC había perdido (→ v2.4).

## Lo que sumó v2.4 (ADR-018) — leer esto antes que nada

Guido cruzó el **artefacto de diseño** (publicado 2026-07-31, *anterior al red-team*) contra lo
construido. La mayoría de las diferencias eran **correcciones deliberadas del red-team** y se
confirmaron. Pero **cuatro cosas se habían traspapelado** al comprimir el informe en el SPEC, más una
capacidad nueva que pidió él:

1. **⚠️ El abanico de 6 familias de salida — era un hueco grave.** El SPEC lo declaraba IN en su
   línea 40 y **nunca lo detallaba**; el presupuesto no le dio una línea, así que el build (que
   escribió contra esa tabla) no lo hizo. Sin él, la E3.5 decidía *quién piensa* la propuesta pero no
   ofrecía **qué hacer que no fuera software** — o sea que la skill heredaba el defecto #3 del método
   en papel, que es su propio motivo de existir. Ahora corre **antes** de la regla binaria.
2. ***"No expliques la solución. Preguntá cómo lo hace hoy."*** Impreso arriba de la hoja de campo.
3. ***"Ninguna alternativa nombra una tecnología."*** En el anexo de etapas, junto a las alternativas.
4. **El orden de la hoja de campo por peso** + el **esfuerzo escrito contra el apetito**
   (`ENTRA` / `ENTRA con plata a aprobar` / `NO ENTRA` / `NO SE SABE`), **sin tocar la celda del jefe**.
5. **NUEVO — arrancar desde material que ya existe** (planilla llena, Word, mails). Entra por el mismo
   volcado. Dos reglas: **se pregunta UNA vez quién lo llenó** (de eso depende el sello: "lo llenó X
   hablando con la gente" es acto de carga → `RELEVADA`; "lo llené yo" o "no sé" → `DE MEMORIA`), y
   **que una etapa venga llena NO la cierra** — corre el ritual igual, que es donde están las deudas.

**⚠️ Ninguna de las cinco pasó por red-team**, y se agregaron a una skill que nunca corrió. Las cuatro
recuperadas tapan agujeros ya diagnosticados por escrito (riesgo bajo); **la quinta es una apuesta
nueva** que Guido pidió con su caso a la vista, sabiendo esto.

**El techo de KB se llenó y se resolvió podando duplicación, no subiéndolo:** las adiciones lo
llevaron a 56.814 B contra 56.320; se cortaron **cinco repeticiones literales** donde el motor ya era
la copia autoritativa y quedó en **56.126 B — 194 de margen**. Cero contenido perdido.
**Señal para la próxima sesión: el techo de KB está esencialmente lleno. Lo que se agregue después
necesita una decisión sobre el número, no más deduplicación.**

## Estado

- **La skill está instalada y registrada** (aparece en el listado de skills de este chat, con su
  `description` entero y el disparador nuevo). El Arquitecto ya muestra la cláusula de deslinde.
- **Los dos techos, medidos:** `SKILL.md` **231 líneas** (260, margen 29) · **motor + anexos 56.126 B**
  (techo 56.320, margen 194).
- **Sale por `actualizate`**: el Equipador conoce `relevamiento` en los 6 lugares donde lleva la lista
  kit-owned, así que la otra PC la baja del repo canónico sin tocar nada a mano.
- **`plantillas/_fuente/` commiteado y el `.rar` borrado** (en ese orden, como mandaba el paso 0).
  277 líneas / 8.097 bytes / 61 `{{LINEAS:N}}` — clavó la medición, y las 5 referencias de celda del
  SPEC verificaron contra el archivo real.
- **Gobierno:** **ADR-017** (la construcción: las 3 desviaciones del plano) · **ADR-018** (v2.4: lo
  recuperado del artefacto + el arranque desde material existente) · **REJ-014** (la Fase 2 entera,
  7 diferidos con su condición de reapertura). ADR-016 ya tenía el diseño — **no se duplicó**.
- **Fase 2 ahora se encuentra desde el README** (pedido de Guido: le interesa sobre todo que la skill
  lea sola el código). Sigue viviendo en REJ-014 por convención del repo; el README sólo apunta.
- **`GUIA-DE-USO.md` al día**: receta **📥 "Me pidieron algo en el laburo"** + 5 frases nuevas en la
  chuleta + la línea que aclara que **el camino de `/arquitecto` no cambió**.

## Las 3 desviaciones del plano (todas en ADR-017)

1. **5 anexos, no 4.** El disparador del presupuesto se activó de verdad: **202 líneas en el bloque 15
   contra el umbral de 200**. Se tomó el **corte 1 en ese momento**, no al final — las 4 etapas fueron a
   `anexos/etapas.md`. El ritual se quedó en el motor, y el GATE 1 de E3 y la sólo-lectura de `04:18`
   se citan **también** en el motor porque su falla es silenciosa.
2. **El TABLERO suma una 8ª sección** (`## Etapas y PDF`, marcada DERIVADA): `PDF pendiente`,
   `PDF VIEJO` y la foto del contador no tenían dónde vivir en el esquema cerrado del SPEC.
3. **El criterio 5 traía un test que no podía fallar** — ver abajo.

## Lo que se verificó CON EVIDENCIA REAL (10 de 21 criterios)

- **El pipeline del PDF, corrido de punta a punta**: 58.173 B, `%PDF-1.4`, y **los 5 baldes se
  distinguen en escala de grises** (sólido / punteado / rayado / doble+trama / invertido) — se abrió el
  PDF y se miró, no se declaró.
- **Los 3 hechos de Chrome, re-confirmados a mano**: `where chrome` lo encuentra · un HTML inexistente
  vuelve a dar un PDF válido de **23.943 bytes exactos** con exit code 0 · sin `--no-pdf-header-footer`
  estampa `file:///C:/Users/...` al pie de cada hoja.
- **⚠️ HALLAZGO NUEVO — el criterio 5 estaba mal instrumentado.** Pedía *"que el PDF no contenga la
  cadena `file:///`"*, pero **`grep` sobre el `.pdf` da 0 aunque la ruta esté impresa** (el texto va en
  streams comprimidos): los dos PDF, con y sin el flag, dieron **0 hits**. El chequeo válido es que el
  flag esté en el comando. Corregido en `anexos/entregable.md` con su razón, para que nadie "verifique"
  con el grep que siempre pasa.
- **El ritual de sync de plantillas (criterio 18), corrido de verdad**: se simuló un cambio del jefe →
  `git diff _fuente/` mostró **1 sola línea, limpia** → se re-aplicó el fork → **0 líneas `<`** → se
  revirtió. Y el diff `_fuente/` ↔ plantillas de trabajo **no tiene una sola línea `<`**: todo el fork
  es agregado puro.
- **El token explícito (criterio 1), por construcción**: en el Arquitecto hay **cero** globs o búsquedas
  de dossiers, y **la única mención incondicional es la del `description`**. Todo lo demás está
  condicionado a *"si la invocación te nombró un HANDOFF"*.
- **El Modo B, byte a byte idéntico** a antes de la sesión (41 líneas, 0 diferencias). El único borrado
  en todo el Arquitecto fue la línea del `description`.

## Lo que NO está verificado (11 criterios) — dicho como tal

Los **2, 3, 4, 7, 8, 9, 10, 11, 12, 15, 17, 19** necesitan **una corrida real con Guido adentro**:
clics contados, contradicciones reales, lentes que se bajan, el asimétrico prendiendo, la mudanza.
**No se declara estable hasta el primer relevamiento de punta a punta.**

## Próximo paso concreto (cuando Guido retome)

**El estreno real.** El próximo pedido que le llegue de otro sector: chat nuevo → `relevamiento` →
dictar de corrido. Lo que se mide **no es la calidad del documento**: ¿la invocaste sin que nadie te la
recuerde? ¿cuántas preguntas te parecieron de más? ¿el Arquitecto repitió alguna que ya estaba en el
dossier? Precedente que manda: `docs-fyd` pasó 16/16 en verificación y **la primera corrida real le
corrigió 9 de 10 artefactos**.

## Bloqueos

Ninguno.

## Contexto que no está en otros docs

- **El zip portable NO se regeneró: la carpeta `Desktop\Arquitecto en otras PCs\` ya no existe en esta
  máquina** (se buscó por nombre en todo el `$HOME`, incluido OneDrive). El paso 2 del `/cierre` la
  declara opcional, así que no frenó el cierre — pero **la otra PC (d:\SAAS) no tiene forma de recibir
  `/relevamiento` por zip**. El camino que sí funciona es `actualizate` (Modo AUTO-ACTUALIZAR EL KIT del
  Equipador), que ya la conoce en los 6 lugares. Si Guido quiere el zip de vuelta, hay que recrear la
  carpeta y correr el paso 2.
- **La lección de tamaño, para la próxima skill:** el techo es **de líneas** pero el contenido se
  presupuesta **en bytes**, y las dos cosas se desacoplan. Tras el corte 1 el archivo tenía 317 líneas
  con 20.799 bytes — o sea el contenido entraba holgado en el presupuesto (22,6 KB) y lo que sobraba era
  **el formato**: 65 B/línea contra las 77 de `docs-fyd` y las 104 del Arquitecto. Reflowar a 92,8
  B/línea lo bajó a 224 sin sacar contenido. **Escribir fino infla el conteo sin ahorrar un token.**
- **No se usó ningún otro corte de la escalera de poda**: quedan los 7 restantes (−35 líneas) sin gastar,
  documentados en `docs/PRESUPUESTO-relevamiento.md`.
- **Lo que hay que llevarle al jefe, aparte y sin apuro** (sigue pendiente, ahora en el README): las **7
  celdas faltantes** (viven en la copia del kit, marcadas `[+fork]`) · **versionar el método** · y el
  hueco estructural — **el criterio de éxito a las 4-6 semanas no tiene dueño ni fecha en el método**.
  El tramo 5 lo cierra del lado de Guido; del lado del papel sigue abierto.
- **`docs/PROMPT-construir-relevamiento.md` ya cumplió su función** (era el arranque de esta sesión).
  No se archivó a `legacy/` a propósito: es barato y documenta cómo se encaró el build.
- **Fase 2 de `docs-fyd` sigue diferida** y **el Modo B del Arquitecto sigue sin estrenarse** (ADR-012)
  — por eso `/relevamiento` v1 no lo toca, y sus 3 ganchos de costura están en REJ-014.
