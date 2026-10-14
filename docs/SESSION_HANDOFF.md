# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo
> inyecta en cada chat nuevo de esta carpeta.

**Última sesión cerrada:** 2026-10-13, PC `clientes` (`D:\vibe-kit`) — **misión 3 de 5 hecha: el repo
se profesionalizó** (`docs/SPEC-profesionalizar-repo.md` ✅ + una ampliación pedida por Guido, todo en
ADR-023). Kit sin bump (`v2.4.2`): solo textos.

## Qué salió

- **El repo ahora tiene el mismo sistema que los proyectos de Guido**: README solo portada (sin
  pendientes, historial ni versión) · `docs/TODO.md` (casillas, única fuente) · `docs/CHANGELOG.md`
  (por fecha) · `docs/MISION-Y-VISION.md` · `docs/README.md` (índice) · DECISIONS con índice · hook,
  `/inicio` y `/cierre` con el molde del Arquitecto · `LICENSE` MIT + `NOTICE` (excluye el texto de FyD).
- **La portada de GitHub se vistió**: banner + diagrama estilo plano (`assets/*.svg`), insignias, un día
  de trabajo de ejemplo. **El nombre está abierto**: a Guido no le cerró ninguno (Obrador, Andamio,
  Batuta, Cimientos, Plano); quedó vibe-kit hasta que elija. Cambiarlo toca el banner, el README y la
  URL del Equipador (`kit/skills/arquitecto-skills/SKILL.md`; GitHub redirige la vieja).
- **Mudanzas** (la tabla vieja → nueva está en ADR-023): `extractor/` e `investigacion/` →
  `observatorio/` · `guias/` → `manuales/` · `docs/consulta/` · el presupuesto de `/relevamiento` a
  `legacy/`. **El Extractor ahora se abre en `observatorio/extractor/`.**
- **`/relevamiento`**: la autoría de las plantillas dice "de Guido, aprobadas por su jefe"; `SYNC.md`
  es "cambiaste una versión aprobada". `_fuente/` intacta.
- **El sync del kit es un script**: `bash .claude/scripts/kit-sync.sh` (compara) / `... sync` (copia y
  verifica). El kit trae `{{CARPETA_DE_PROYECTOS}}` en el Arquitecto y el script conserva la ruta de
  cada PC. **Se acabó la excepción de ADR-021: el diff da LIMPIO también en esta PC.**

## Próximo paso concreto: la misión 4 — SOLO DISEÑO

Chat nuevo acá → `/inicio` → Guido dice **"misión 4, tramo 1"** → se sigue el brief de abajo (lo
diseñó Guido el 2026-10-14; no hace falta pegarlo). **Orden fijo: diseño → spec → construcción.** La
misión 4 no toca `kit/` ni ningún proyecto; construir es la misión 5, en chats aparte.

### El foco (pedido de Guido, 2026-10-14)
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

### Los pilares que el diseño tiene que cubrir
- Las 4 capas del pack: **Base** (inicio/cierre/handoff, norte, manual por módulo) · **Dirección**
  (director/obrero/tramo + política de modelos) · **Mesa** (directores y PCs) · **el Arquitecto como
  puerta**, también sobre proyectos que ya andan.
- **La flota — mantener los proyectos al día** (idea de Guido): un agente global (¿modo del Arquitecto,
  extensión del Equipador o agente aparte? → se decide en el diseño) que mira todos los proyectos, sabe
  qué versión del método tiene cada uno y propone actualizar skills, sistema de docs y CLAUDE.md, de a
  uno y con OK. Lo que lo hace posible: **P31** (skills canónicas en el kit + una ficha por proyecto →
  actualizar = regenerar desde el molde sin tocar lo propio) y **P44** (versión del kit visible en
  cada proyecto). A decidir: cómo marca su versión cada proyecto, qué toca solo y qué con OK.
- **Niveles del método por tamaño de proyecto** (liviano · estándar · proyecto largo con director) y
  **camino de adopción** (un proyecto piloto → medir → extender; Hermes no se migra a mitad de un tramo).
- **Medición repetible**: los scripts de la investigación corridos cada mes sobre lo nuevo
  (`condensar.py --desde`, `costos.py`) + un tablero que compara contra la línea base.
- **Pocas cosas que muevan mucho**: el spec elige **las 10 de más impacto**; el resto queda en espera
  con su condición de entrada.

### Modelos y tokens
- El chat donde Guido decide: **Opus**. Lectores de volumen: **Sonnet**, con salida corta y techo.
  **Opus lee cuando vale la pena** (poco volumen, mucho criterio: los métodos de director/obrero).
- Un lector gasta ~3× lo que lee. **Antes de toda lectura de más de ~100 KB: decir el costo y esperar
  el OK.** Nunca se leen enteros los hallazgos crudos (1,7 MB) ni los condensados (49 MB): solo grep.
- El acta (78 KB) se consulta por partes; los lectores devuelven resúmenes, no texto crudo.

### Los tramos
| Tramo | Qué | Sale con |
|---|---|---|
| ✅ 0 · Biblioteca | Hecho el 2026-10-14: todo `D:\vibe-hallazgos\` respaldado en el repo privado `vibe-research/biblioteca/` (1.362 archivos) con un `LEEME.md` de capas y costos de lectura | Nada se pierde; accesible desde las 3 PCs |
| **1 · Radiografía director/obrero** | Cómo está armado el sistema de Guido de verdad (brief abajo) | `docs/mision-4/RADIOGRAFIA-director-obrero.md` |
| 2 · Evidencia de afuera | **(a) Qué ofrece hoy la plataforma**: el agente `claude-code-guide` chequea contra la doc oficial qué de lo armado a mano ya es nativo (equipos de agentes y mensajes, worktrees, workflows, memoria, Remote Control, agentes en segundo plano) — ~100 mil tokens. **(b) Evidencia de los repos**: scripts sobre el historial de git de los proyectos (commits de arreglo, reversiones, lo que se rompió dos veces, si hay pruebas) — casi gratis | `docs/mision-4/PLATAFORMA.md` + `docs/mision-4/REPOS.md` |
| 3 · Mapa por objetivos | P1-P57 + barrido de lo que quedó afuera (Sonnet sobre las síntesis, ~250 mil tokens) + lo de los tramos 1 y 2, repartido por los 7 objetivos con su línea base | `docs/mision-4/TABLERO.md` |
| 4 · Diseño por pilar | Las 4 capas + la flota + niveles/adopción + medición. De a una decisión | Cada parte del plano |
| 5 · El spec | Un SPEC del pack con **el top 10**, métricas, niveles, piloto y adopción → red-team → **revisor frío independiente** (un agente sin contexto de las charlas) → Guido lo aprueba | El plano READY + orden de construcción para la misión 5 |

**Cómo participa Guido** (lo eligió él): Claude recomienda, Guido corrige (aprueba temas en bloque o
cambia); lo que se discute va con opciones + pros/contras + UNA recomendación.

### Brief del tramo 1 — la radiografía de director/obrero
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
  - El acta: solo Q1, Q2, Q6 y Q8. Y `ya-sabido.md` para no redescubrir lo escrito.
  - **NO se leen**: `METODO_PROYECTO_LARGO.md` (216 KB), `CAMBIOS.md` (121 KB) ni las bitácoras (~470 KB)
    — ya están resumidos en `ya-sabido.md`; se abren por grep si hace falta un detalle.
- **Cómo**: 2 subagentes **Opus** en paralelo (uno Desktop, uno Mobile) con la misma plantilla de
  salida (anatomía · flujo · mensajes · modelos · costo · fallas · qué funciona · propio vs genérico) y
  techo de ~4 KB cada uno. El chat principal cruza los dos con el acta y arma el documento con Guido.
  **Costo estimado: ~300 mil tokens.** Decirlo y esperar el OK antes de lanzar.
- **Reglas**: solo diseño · destilado y genérico (el repo es público: nada de nombres, rutas ni
  negocio de Hermes en lo que se escribe) · lo que es un hallazgo nuevo se marca como tal.
- **Sale con**: la radiografía + una lista corta de "qué mejoraría y por qué", que entra al mapa del
  tramo 2. Fila nueva en `docs/README.md` para `docs/mision-4/`.

## Cosas que muerden y no están en ningún otro doc

- 🖥️ **La PC `Usuario` está desfasada** hasta que le diga `actualizate` al Equipador. Lo que hay que
  mirar ahí: que la línea "Carpeta de proyectos" del Arquitecto **siga con su ruta** y no con
  `{{CARPETA_DE_PROYECTOS}}`. El Equipador lo tiene escrito, pero **NO VERIFICADO** en esa PC. Si
  quedara vacía, el Arquitecto pregunta solo; se corrige en una línea.
- 📦 **`D:\vibe-hallazgos\` NO SE BORRA** hasta el final de la hoja de ruta (ADR-022): hallazgos de las
  3 PCs, condensados, `ya-sabido.md`, `CORTE.md`, `ALERTAS-SEGURIDAD.md` (privado, **no** va al repo
  público). El repo privado `guidocameraeq/vibe-research` también queda de respaldo.
- 🔴 **vibe-kit sigue PÚBLICO**: los nombres reales (el compañero, clientes, cuentas) no entran.
  Antes de cada push: gitleaks sobre lo agregado (está instalado vía WinGet en esta PC).
- 🔐 **Alertas de seguridad abiertas** de Hermes (detalle solo en el archivo privado): credenciales que
  pasaron por chats, `/smoke` de Hermes Desktop con un login real de producción, rotaciones
  pendientes. **Rotar: NO VERIFICADO.**
- 🖥️ **Mesa entre PCs** por Remote Control: anduvo, pero el permiso no viaja con el mensaje (cada PC
  da su OK) y el clasificador puede frenar copias "sensibles". Va a la misión 4 (P34).
- La otra PC se llama `Usuario` (`C:\Users\Usuario\Desktop\Proyectos\vibe-kit`, sin disco D, Python
  3.14). El capataz: código **no está en esta PC** y no se ubicó (P41).

## Bloqueos

Ninguno.
