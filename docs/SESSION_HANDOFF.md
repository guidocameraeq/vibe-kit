# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo
> inyecta en cada chat nuevo de esta carpeta.

**Última sesión cerrada:** 2026-10-22, misión 4, tramo 4: **racimo F diseñado, corregido por Guido y revisado**. Solo
diseño, sin cambios al kit (sigue en `v2.4.2`). En la PC `Usuario`. `kit-sync` LIMPIO (el kit instalado acá estaba
del 3 de agosto: se sincronizó al arrancar).

## Dónde estamos

- **Misión 4**: tramos 0 a 3 hechos ([`PLAN.md`](mision-4/PLAN.md)). **Tramo 4 por racimos**: ✅ A · ✅ C · ✅ E ·
  ✅ **F** · siguen **B → D → G → H → I**.
- ✅ **F · Seguridad por defecto** ([`DISENO-F-seguridad.md`](mision-4/DISENO-F-seguridad.md)), en una línea: Claude
  con los ojos tapados y las manos libres. **9 barreras de archivos** de fábrica (verificado en la doc: frenan también
  en bypass) · **un corrector de secretos por PC** (el hook de esta PC, extendido a Write/Edit, instalado por el
  Equipador) · **usar sin ver** (`db consulta`, `db migrar`, `db foto` cargan la credencial por adentro;
  `cargar-secreto` con entrada oculta) · **niveles de base** en la ficha (dummy · prueba · real) · **las barreras son
  del proyecto** (`frenos.quitados` con id, razón y `hasta:`) · **con permiso, igual con red** (foto, transacción,
  rastro, revisión del plan) · gitleaks en el pre-commit versionado · el arranque declara modo y barreras. Revisión:
  26 hallazgos, 24 aplicados, 1 fundido, 1 descartado (§22). Tabla de criterios honesta (§23).
- 🆕 **Reglas de Guido de hoy** (ya en PLAN §Lecciones y en la memoria de esta PC): **antes de aplicar un hallazgo de
  un revisor, pasarlo por el criterio de diseño ya establecido** (el norte y el filtro de 4 preguntas); lo "por las
  dudas" no entra. Y **ninguna barrera se impone para siempre**: todo freno se puede quitar por proyecto con rastro, y
  lo peligroso autorizado se hace con red, no con pregunta.
- 🆕 **F dejó dos cosas a otros racimos**: a **A**, la ubicación del registro de frenos (propuesta: `docs/frenos.log`,
  versionado, commiteado en el cierre; DISENO-A §4 tiene la nota; se decide en la revisión integral). A **B**, el nombre
  del archivo público de datos de prueba (`docs/PRUEBA.md` o el que B fije) y las 3 líneas que F suma al hook de
  arranque (tienen que entrar en el tope). Y **E quedó corregido**: un solo campo `frenos.quitados` y el actualizador
  rehace una rama rota sin `push --force`.

## Próximo paso: racimo B (documentos con tope)

**Título de la sesión: `vibe-kit M4 · Tramo 4: racimo B`** (`/inicio` se lo pone al confirmar). Esfuerzo `high`.

- **Lee**: el norte, la forma de pensar y **los 11 criterios** del `PLAN.md` · `TABLERO.md` §4 (objetivo 3), §2 (las
  filas del hook y los documentos), §10 (la fila B **y la nota "Para el racimo B, las carpetas de `docs/`"**, con cómo
  lo resolvió el Hub ese día; también la nota de subproyectos) · `FLOTA.md` §3 y §4 (el hook sin tope; documentos sin
  tope en toda la flota) · de `DISENO-E`, §4 y §5 (la ficha y la zona propia: B escribe adentro de eso) · de
  `DISENO-C`, qué muestra la salida única y qué inyecta el hook · de `DISENO-F`, §9 (`docs/PRUEBA.md`), §15 (las 3
  líneas del arranque) y §21 (`frenos.log`) · el ítem **"Tope al hook de arranque del molde"** del TODO (B diseña el
  tope de verdad; el arreglo chico sigue pendiente aparte) · el molde actual: `kit/skills/arquitecto/templates/`
  (`CLAUDE.template.md`, `docs/`, `hooks/session-start.sh`, `skills/inicio` y `cierre`).
- **Lo central**: qué carpetas tiene `docs/` (`docs/specs/`, referencia, archivo; el Hub ya eligió y sirve de
  comparación, no de molde) · **documentos con tope**: el hook inyecta solo estado, próxima acción y bloqueos
  (handoff de 503 KB, CHANGELOG de 260-440 KB, tablero de ~900 KB) · el TODO que no miente (fecha por ítem, poda y
  balance en el cierre, S-U-8) · `/cierre` cruza lo anunciado con lo anotado (S-U-7) · `docs/NORTE.md` (P7) · estados
  del entregable (S-R-7) · `AGENTS.md` (opt-in, E §11) · un test que falla si hay un archivo suelto o una ruta citada
  que no existe (lo tiene el Hub) · **los subproyectos con docs propios** (TABLERO §10) · **los 11 criterios reflejados
  en el `CLAUDE.md` del molde** (pedido de Guido) · el mapa de documentación del `CLAUDE.md` con carpetas.
- **Cómo**: ficha de una pantalla → decisiones de a una, en criollo, con "qué cambia para vos" → **revisor frío + lector
  de gentle-ai** (su `AGENTS.md` y su "documento de tarea que se puede retomar") → pasar los hallazgos por el criterio →
  `DISENO-B-*.md` con su tabla de criterios → marcar en el PLAN.

## Cosas que muerden y no están en ningún otro doc

- 🔑 **Identidad de git en la PC `Usuario`: no hay ninguna configurada** (ni global ni del repo). El commit de este
  cierre salió con la identidad de respaldo que fija el `/cierre` (`Guido <eq.chatgpt@gmail.com>` por `-c`). Los dos
  commits del racimo E y los dos del director del Hub de hoy salieron firmados por **la segunda cuenta** (FLOTA §8):
  cómo, desde una PC sin identidad, **NO VERIFICADO** (probablemente la app o una variable de entorno de esa sesión).
  Guido no contestó todavía con qué cuenta firma esta PC. Hasta que lo diga, cada cierre acá usa el `-c`.
- 📬 **El Hub**: su director (sesión `director-orden-hub`, en esta PC) recibió el brief con los 4 pedidos y el concepto
  del agente de ecosistema; **después del cierre de E mandó el contrato del registro** (API HTTP del Hub con **dos
  llaves propias**, lectura y notas, en variables de entorno; el actualizador solo usa la de lectura; el dueño amplió:
  el Arquitecto lee cada ficha y tiene un apartado de notas firmadas). Está anotado en TABLERO §10, racimo I, con la
  regla de E §9 ampliada a "lee, y agrega notas". Si vuelve a preguntar, la respuesta está ahí. El brief completo está
  en el escritorio de esta PC, `pedidos-al-hub-desde-el-arquitecto.md`, y en el repo del Hub. **Pushea a este repo
  desde otra sesión**: antes de cerrar, `git fetch` y mirar `origin/main` (hoy había 2 commits suyos).
- 🧪 **Lo que F manda al piloto** (misión 5, Hub y Portal): el hook anti-secretos corriendo en bypass en vivo ·
  `Get-Content .env` por PowerShell contra el `deny` · los falsos positivos de Write/Edit medidos contra el historial
  (el JWT de Supabase dispara) · `push --force` sumado al hook de Desktop y vuelto a medir · el pre-commit en las 3 PCs ·
  el conteo de 3+ del contrato `db` con `flota.py`. Esta PC **no tiene el comando `claude` suelto**: no se puede probar
  un hook en bypass desde acá.
- 📬 **El buzón multiagente**: se diseña recién en el racimo G; nada de rutas, nombres ni contenido entra acá
  (ADR-021). La firma por agente y el arnés de lo que pide OK humano, que la fila F del TABLERO le asignaba a F, van a G.
- 🧠 La memoria de Claude **no viaja entre PCs**: por eso el norte, la forma de pensar y los 11 criterios están en el
  PLAN. En esta PC hay además una memoria con la regla de hoy (filtrar hallazgos; barreras editables).
- 🔐 **Alertas abiertas de Hermes** (12), detalle solo en el archivo privado. Las arregla Guido; F le deja el runbook
  "se filtró una credencial" como página de manual a escribir en la misión 5. **NO VERIFICADO.**
- 🔴 **vibe-kit es PÚBLICO**: gitleaks antes de cada push (hoy: limpio sobre `docs/mision-4`). Con varias sesiones
  sobre el repo, mirar `git log` antes de cerrar.
- 🖥️ Los directores de los dos Hermes corren en la PC `clientes`; se los lee por `gh`.

## Bloqueos

Ninguno. (La identidad de git se resuelve con el `-c` del cierre hasta que Guido elija cuenta.)
