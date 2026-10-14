# Misión 4 — el plan

> Diseñado con Guido el 2026-10-14. **Solo diseño**: diseño → spec → construcción (la misión 5, en
> chats aparte). Este archivo es la guía de toda la misión; cada tramo deja su salida en esta carpeta
> y actualiza la tabla de tramos. Hoja de ruta: ADR-021. Material: `tips/tanda-2026-10-chats.md` y
> la biblioteca privada (`vibe-research/biblioteca/LEEME.md`).

## El foco (pedido de Guido, 2026-10-14)
No "profesionalizar lo que ya hace", sino **mejorar el proceso**. Es "su método": de acá sale todo y
las actualizaciones grandes son pocas (una cada varios meses), así que el diseño tiene que ser muy
bueno. Se mide contra **7 objetivos**:
1. **Menos tokens** · 2. **Mejor calidad de código** (menos fallas repetidas) · 3. **Proyectos más
documentables y estables** · 4. **Procesos estables** (menos trabajo a mano) · 5. **Trabajar bien entre
3 PCs y 2 personas** · 6. **El tiempo y la atención de Guido** (menos "dale", menos pestañas, menos
lectura; ej.: 39 de 115 turnos de un director eran ruido) · 7. **Seguridad por defecto** (hay alertas
reales abiertas).
Toda mejora dice qué objetivo mueve, **contra qué línea base medida** y cómo se va a saber si funcionó.
**La información de la investigación no se pierde**: se usa de verdad.

## Los pilares que el diseño tiene que cubrir
- Las 4 capas del pack: **Base** (inicio/cierre/handoff, norte, manual por módulo) · **Dirección**
  (director/obrero/tramo + política de modelos) · **Mesa** (directores y PCs) · **el Arquitecto como
  puerta**, también sobre proyectos que ya andan.
- **El Arquitecto como agente único — la visión de Guido** (2026-10-14): Guido lo piensa como **un solo
  agente**, portable a cualquier PC, que hace todo: **prepara la PC** (hoy lo hace el Equipador),
  **arranca proyectos con todo el armado inicial** (ya lo hace), **mantiene la flota al día** (nuevo:
  mira todos los proyectos, sabe qué versión del método tiene cada uno y propone actualizar skills,
  sistema de docs y CLAUDE.md, de a uno y con OK) y responde igual en otra PC.
  - ⚠️ **Choca con ADR-004 y REJ-003** (jul-2026: el Equipador se separó como skill hermana y se
    descartó un "modo máquina" dentro del Arquitecto, porque lo inflaba). El diseño lo tiene que
    resolver de frente, no pisarlo. **Camino propuesto, a decidir en el tramo 4: una sola puerta,
    varios módulos** — Guido habla siempre con el Arquitecto y él deriva adentro a la pieza
    (máquina · proyecto nuevo · proyecto existente · flota); por dentro siguen siendo piezas chicas.
    Chequear en el tramo 2 qué ofrece la plataforma para esto (agentes, plugins: ojo REJ-001).
  - Lo que hace posible la flota: **P31** (skills canónicas en el kit + una ficha por proyecto →
    actualizar = regenerar desde el molde sin tocar lo propio) y **P44** (versión del kit visible en
    cada proyecto). A decidir: cómo marca su versión cada proyecto, qué toca solo y qué con OK.
- **Niveles del método por tamaño de proyecto** (liviano · estándar · proyecto largo con director) y
  **camino de adopción** (un proyecto piloto → medir → extender; Hermes no se migra a mitad de un tramo).
- **Medición repetible**: los scripts de la investigación corridos cada mes sobre lo nuevo
  (`condensar.py --desde`, `costos.py`) + un tablero que compara contra la línea base.
- **Pocas cosas que muevan mucho**: el spec elige **las 10 de más impacto**; el resto queda en espera
  con su condición de entrada.

## Modelos, esfuerzo y tokens (chequeado contra la referencia oficial el 2026-10-14)
- **El chat donde Guido decide: Opus 5.5 en esfuerzo `high`.** Ojo: el esfuerzo por defecto de Opus 5.5
  es `medium`, y la guía oficial pide **mínimo `high` para trabajo de criterio** — elegirlo a mano en el
  selector del chat. `max` no: en un chat largo se paga en cada turno y rinde solo en problemas duros.
- **Los momentos de más peso** (cruzar la radiografía, escribir el SPEC final, el revisor frío): Opus 5.5
  en `xhigh`, o **Fable 5.1** (el modelo más capaz; cuesta ~2,5× Opus 5.5) — solo ahí, que es poco
  volumen y mucha decisión. Lo elige Guido al llegar.
- **Lectores de volumen: Sonnet 5.5**, con salida corta y techo. **Opus lee cuando vale la pena**
  (poco volumen, mucho criterio: los métodos de director/obrero y el uso real que describen las síntesis).
- Un lector gasta ~3× lo que lee. **Antes de toda lectura de más de ~100 KB: decir el costo y esperar
  el OK.** Nunca se leen enteros los hallazgos crudos (1,7 MB) ni los condensados (49 MB): solo grep.
- El acta (78 KB) se consulta por partes; los lectores devuelven resúmenes, no texto crudo.
- **Cada tramo cierra** actualizando la tabla de tramos de este archivo y el handoff: el chat siguiente
  arranca leyendo este PLAN + las salidas de los tramos anteriores, nada más.

## Los tramos
| Tramo | Qué | Sale con |
|---|---|---|
| ✅ 0 · Biblioteca | Hecho el 2026-10-14: todo `D:\vibe-hallazgos\` respaldado en el repo privado `vibe-research/biblioteca/` (1.362 archivos) con un `LEEME.md` de capas y costos de lectura | Nada se pierde; accesible desde las 3 PCs |
| **1 · Radiografía director/obrero** | Cómo está armado el sistema de Guido de verdad (brief abajo) | `docs/mision-4/RADIOGRAFIA-director-obrero.md` |
| 2 · Evidencia de afuera | **(0) Inventario de la flota** (script, casi gratis): todos los proyectos de las 3 PCs — dónde viven, su repo, qué skills/docs/CLAUDE.md tienen y de qué versión del método son. Visto el 2026-10-14 en esta PC: 8 repos (6 en la organización `eQ-Repositorio`, accesible con `gh` desde cualquier PC) y **skills nacidas en los proyectos** que pueden ser candidatas al kit (en el Hub: actualizar, estimar horas, horas por commit, viernes, backup; en un bot: reporte mensual, deploy). La otra PC y la del compañero: por `gh` si están en GitHub, si no por Remote Control. **El capataz (P41) queda afuera**: fue una idea de proyecto para un compañero, no es parte del workflow de Guido (lo aclaró él, 2026-10-14). **(a) Qué ofrece hoy la plataforma**: el agente `claude-code-guide` chequea contra la doc oficial qué de lo armado a mano ya es nativo (equipos de agentes y mensajes, worktrees, workflows, memoria, Remote Control, agentes en segundo plano) — ~100 mil tokens. **(b) Evidencia de los repos**: scripts sobre el historial de git de los proyectos (commits de arreglo, reversiones, lo que se rompió dos veces, si hay pruebas) — casi gratis | `docs/mision-4/FLOTA.md` + `PLATAFORMA.md` + `REPOS.md` |
| 3 · Mapa por objetivos | P1-P57 + barrido de lo que quedó afuera (Sonnet sobre las síntesis, ~250 mil tokens) + lo de los tramos 1 y 2, repartido por los 7 objetivos con su línea base | `docs/mision-4/TABLERO.md` |
| 4 · Diseño por pilar | Las 4 capas + la flota + niveles/adopción + medición. De a una decisión | Cada parte del plano |
| 5 · El spec | Un SPEC del pack con **el top 10**, métricas, niveles, piloto y adopción → red-team → **revisor frío independiente** (un agente sin contexto de las charlas) → Guido lo aprueba | El plano READY + orden de construcción para la misión 5 |

**Cómo participa Guido** (lo eligió él): Claude recomienda, Guido corrige (aprueba temas en bloque o
cambia); lo que se discute va con opciones + pros/contras + UNA recomendación.

## Brief del tramo 1 — la radiografía de director/obrero
- **Qué es**: un apartado propio (pedido de Guido) que analiza **cómo está armado su sistema** de
  director y obreros: roles, cómo se abre una pestaña, cómo se hablan (mensajes, suscripciones), el
  relevo de director, el tramo, el gate, qué modelo usa cada uno. Y por cada parte: qué funciona
  (acta Q8), qué cuesta (Q1), qué falla (Q2, Q6), qué es propio de Hermes y qué sirve para cualquier
  proyecto, y qué mejora movería cuál de los 7 objetivos.
- **Fuentes** (medidas el 2026-10-14):
  - Desktop `D:\Hermes\Hermes.exe`: skills `director` (39 KB), `obrero` (22 KB), `tramo` (40 KB) +
    `docs/metodo/RELEVO_DIRECTOR.md` (10 KB) = ~111 KB.
  - Mobile `D:\Hermes\Hermes mobile`: skills `director` (39 KB), `obrero` (31 KB), `tramo` (28 KB), `gate`
    (15 KB) + `docs/v4/METODO.md` (80 KB) = ~193 KB. ⚠️ Ese checkout está en una rama de trabajo
    (`v4/m13-cronos-app`): el método vigente es el de `main` (leer con `git show main:<ruta>`).
  - **El uso real, no solo lo escrito**: las síntesis `parcial-hermes-desktop.md` (79 KB) y
    `parcial-hermes-mobile.md` (65 KB) de la biblioteca privada — cómo se comportó de verdad el sistema
    en ~65 lotes de chats. Las lee el mismo Opus de cada lado, junto con las skills.
  - El acta: solo Q1, Q2, Q6 y Q8. Y `ya-sabido.md` para no redescubrir lo escrito.
  - **NO se leen**: `METODO_PROYECTO_LARGO.md` (216 KB), `CAMBIOS.md` (121 KB) ni las bitácoras (~470 KB)
    — ya están resumidos en `ya-sabido.md`; se abren por grep si hace falta un detalle.
- **Cómo**: 2 subagentes **Opus** en paralelo (uno Desktop, uno Mobile) con la misma plantilla de
  salida (anatomía · flujo · mensajes · modelos · costo · fallas · qué funciona · propio vs genérico) y
  techo de **~12 KB** cada uno (4 KB perdía matices de un sistema de ~300 KB). Cada uno separa
  "cómo está escrito" de "cómo se comportó". El chat principal cruza los dos con el acta y arma el
  documento con Guido. **Costo estimado: ~450 mil tokens** (~450 KB de fuentes, Opus). Decirlo y esperar el OK antes de lanzar.
- **Reglas**: solo diseño · destilado y genérico (el repo es público: nada de nombres, rutas ni
  negocio de Hermes en lo que se escribe) · lo que es un hallazgo nuevo se marca como tal.
- **Sale con**: la radiografía + una lista corta de "qué mejoraría y por qué", que entra al mapa del
  tramo 2. Fila nueva en `docs/README.md` para `docs/mision-4/`.
