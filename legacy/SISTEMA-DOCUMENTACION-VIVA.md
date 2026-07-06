# Sistema de Documentación Viva para Proyectos con Claude Code

> Documento de referencia para implementar un sistema de documentación que sobrevive a sesiones largas, compactación de chat, y pérdida de contexto entre Claude y el desarrollador.

**Versión:** 1.0
**Última actualización:** 2026-05-07
**Validado en:** 4 proyectos productivos (Flutter móvil, Python desktop, Bot WhatsApp, Dashboard Next.js)

> ⚠️ **2026-06-24 — La "Capa 5: Visualización" (`master-plan.html`) fue ELIMINADA** (ver `REJECTED.md` REJ-016). El HTML 1:1 con los markdowns era overkill y no se usaba. Las menciones a `master-plan.html` de acá para abajo quedan como **registro del diseño original** — ignorá todo lo que diga regenerar/sincronizar ese HTML. El sistema quedó en **5 capas** (sin la de visualización).

---

## Tabla de contenidos

1. [Por qué existe este sistema](#1-por-qué-existe-este-sistema)
2. [Filosofía del sistema](#2-filosofía-del-sistema)
3. [Arquitectura de las 6 capas](#3-arquitectura-de-las-6-capas)
4. [Archivos del sistema (qué va en cada uno)](#4-archivos-del-sistema-qué-va-en-cada-uno)
5. [El dashboard HTML como pieza central](#5-el-dashboard-html-como-pieza-central)
6. [Protocolo de compactación (las 3 fases)](#6-protocolo-de-compactación-las-3-fases)
7. [Reglas de actualización con disparadores](#7-reglas-de-actualización-con-disparadores)
8. [Separación entre proyectos hermanos](#8-separación-entre-proyectos-hermanos)
9. [Adaptaciones por tipo de proyecto](#9-adaptaciones-por-tipo-de-proyecto)
10. [Implementación paso a paso en un proyecto nuevo](#10-implementación-paso-a-paso-en-un-proyecto-nuevo)
11. [Implementación en un proyecto existente con docs previos](#11-implementación-en-un-proyecto-existente-con-docs-previos)
12. [Mantenimiento del sistema](#12-mantenimiento-del-sistema)
13. [Disciplina mínima del usuario](#13-disciplina-mínima-del-usuario)
14. [Errores comunes y cómo evitarlos](#14-errores-comunes-y-cómo-evitarlos)
15. [Lecciones aprendidas](#15-lecciones-aprendidas)
16. [Templates de prompts](#16-templates-de-prompts)
17. [Glosario](#17-glosario)

---

## 1. Por qué existe este sistema

### El problema que resuelve

Cuando trabajás con Claude Code en proyectos largos, tarde o temprano te encontrás con estos problemas:

- **Drift entre sesiones**: Claude te propone cosas que ya descartaste hace 2 semanas.
- **Pérdida de contexto al compactar**: cada vez que comprimís el chat, se pierden decisiones importantes.
- **Pendientes fantasmas**: te trae tareas que ya resolviste.
- **Decisiones técnicas olvidadas**: en 3 meses no recordás por qué elegiste X tecnología sobre Y.
- **No saber dónde quedaste**: al retomar después de una semana sin trabajar el proyecto, no sabés en qué estabas.
- **Documentación dispersa**: tenés notas en Notion, comentarios en código, READMEs, mensajes de commit, y nada se habla entre sí.

### Por qué los enfoques tradicionales no alcanzan

- **Solo READMEs**: los READMEs no capturan decisiones ni descartes.
- **Solo comentarios en código**: el "qué" está en el código, pero el "por qué" se pierde.
- **Solo memoria de Claude**: la memoria persistente ayuda pero no es estructurada ni completa.
- **Solo notas personales**: no las lee Claude, no se sincronizan automáticamente.

### Lo que sí funciona

Un sistema de documentación viva que cumple 4 condiciones:

1. **Estructurado**: cada tipo de información tiene un archivo dedicado con formato claro.
2. **Automático**: Claude sabe cuándo actualizar qué archivo, sin que tengas que pedírselo cada vez.
3. **Visible**: tenés un dashboard HTML para ver el estado completo del proyecto en un solo lugar.
4. **Resistente a compactación**: al iniciar sesión nueva, Claude se reorienta leyendo archivos específicos.

---

## 2. Filosofía del sistema

### Principios fundamentales

**Principio 1 — Markdown es fuente, HTML es reflejo completo.**

Los markdowns en `docs/` son la fuente de verdad. El HTML maestro refleja el contenido completo de los markdowns para visualización. Si difieren, gana el markdown y se propaga al HTML.

**Principio 2 — Una sola fuente de verdad por concepto.**

Los pendientes viven en `TODO.md` y nada más. El estado de bloques vive en `STATUS.md` y nada más. Si la misma información aparece en 2 lugares, garantizás desincronización en 3 meses.

**Principio 3 — DECISIONS y REJECTED son distintos y obligatorios.**

- DECISIONS = decisiones técnicas tomadas con alternativas analizadas (formato ADR).
- REJECTED = ideas/features descartadas por preferencia o contexto.

Sin REJECTED, Claude vuelve a proponer cosas que ya descartaste.

**Principio 4 — El HTML es dashboard completo, no vitrina con links.**

Cuando abrís el HTML, ves TODO el estado del proyecto sin tener que abrir markdowns. Sí, es trabajo doble. El valor de la experiencia visual unificada lo justifica.

**Principio 5 — Antes de compactar, siempre se ejecuta un protocolo.**

Compactar sin avisar es la forma más rápida de romper el sistema. Existe un checklist explícito que actualiza todos los archivos relevantes antes del compact.

**Principio 6 — `CLAUDE.md` es solo para reglas, no para contenido.**

`CLAUDE.md` se carga automáticamente al inicio de cada sesión consumiendo contexto. Cuanto más liviano, mejor. El contenido técnico (arquitectura, schemas, debugging) va a archivos dedicados que Claude lee solo cuando hace falta.

**Principio 7 — Las adaptaciones son aceptables; el esqueleto, no.**

Cada proyecto tiene particularidades. La cantidad de archivos puede variar, los nombres pueden adaptarse. Pero la filosofía y la mecánica son las mismas. Si saltás de un proyecto a otro, los reflejos mentales son iguales.

---

## 3. Arquitectura de las 6 capas

El sistema organiza la documentación en 6 capas, de lo más estable a lo más volátil:

| Capa | Nombre | Propósito | Frecuencia de cambio |
|------|--------|-----------|----------------------|
| 1 | Identidad | Qué es el proyecto y cómo está construido | Baja (cambia con módulos grandes) |
| 2 | Decisiones | Por qué hicimos lo que hicimos / qué descartamos | Append-only (casi nunca se borra) |
| 3 | Estado | Qué está hecho, qué falta, historial | Alta (cambia cada sesión) |
| 4 | Sesión | Dónde quedamos al cerrar la última sesión | Cada sesión |
| 5 | Visualización | Dashboard HTML autocontenido | Cada vez que cambia algo en capas 2-3 |
| 6 | Reglas | Cómo se comporta Claude en este proyecto | Baja (cambia cuando ajustás el sistema) |

### Mapa visual de la arquitectura

```
proyecto/
├── README.md                 ← Capa 1: Identidad pública
├── CLAUDE.md                 ← Capa 6: Reglas para Claude
└── docs/                     (o nombre adaptado: arti-docs/, project-docs/)
    ├── ARCHITECTURE.md       ← Capa 1: Identidad técnica
    ├── DECISIONS.md          ← Capa 2: Decisiones tomadas (ADRs)
    ├── REJECTED.md           ← Capa 2: Decisiones de no-hacer
    ├── STATUS.md             ← Capa 3: Estado actual de bloques
    ├── TODO.md               ← Capa 3: Tareas accionables
    ├── CHANGELOG.md          ← Capa 3: Historial cronológico
    ├── SESSION_HANDOFF.md    ← Capa 4: Snapshot al cierre
    ├── master-plan.html      ← Capa 5: Dashboard completo
    ├── COMPACTION-PROTOCOL.md ← Protocolo dedicado de compactación
    ├── RESUME-PROMPT.md      ← Prompt para retomar sesión nueva
    └── legacy/               ← Archivos históricos preservados
```

---

## 4. Archivos del sistema (qué va en cada uno)

### Capa 1 — Identidad

#### `README.md` (raíz del repo)

**Qué contiene:**
- Nombre del proyecto y descripción de 2-3 líneas.
- Stack y tecnologías principales.
- Setup local básico (cómo correrlo).
- Quick reference operacional (paths, URLs, modelos).
- Links a los docs principales.
- Contacto / información de propietario.

**Audiencia:** cualquiera que llegue al repo (incluyendo vos en 6 meses).

**Cuándo se actualiza:** rara vez. Solo cuando cambia descripción a alto nivel, stack principal, o links de docs.

**Ejemplo de estructura:**

```markdown
# Nombre del Proyecto

Descripción de 2-3 líneas.

## Quick reference
| Item | Valor |
|------|-------|
| Repo | github.com/... |
| Path local | D:\... |
| Path VPS | /root/... |
| Stack | ... |

## Setup local
[instrucciones]

## Documentación
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/STATUS.md](docs/STATUS.md)
- ...
```

#### `docs/ARCHITECTURE.md`

**Qué contiene:**
- Visión técnica del sistema.
- Stack detallado por capa.
- Estructura de carpetas con explicación.
- Patrones arquitectónicos críticos.
- Flujos de datos principales.
- Sistemas externos e integraciones.
- Convenciones críticas que afectan el código.

**Audiencia:** vos y Claude cuando tocan algo arquitectónico.

**Cuándo se actualiza:** cuando se agrega/saca un módulo grande, cambia el stack, o se reorganizan capas.

**Tamaño objetivo:** 5-10KB. Si crece más, probablemente esté absorbiendo contenido que debería ir en archivos más específicos.

**Anti-patrón:** no duplicar contenido que vive en `CLAUDE.md`. Si algo está en CLAUDE.md, ARCHITECTURE.md no lo repite.

---

### Capa 2 — Decisiones

#### `docs/DECISIONS.md`

**Qué contiene:** decisiones técnicas tomadas con razón documentada (formato ADR — Architecture Decision Records).

**Formato de cada entrada:**

```markdown
## ADR-001 — Título corto y descriptivo

- **Fecha:** YYYY-MM-DD
- **Estado:** Aceptada / Reemplazada por ADR-XXX / Revertida
- **Contexto:** qué problema queríamos resolver
- **Decisión:** qué elegimos
- **Razón:** por qué (alternativas consideradas y descartadas dentro)
- **Consecuencias:** qué cambia, qué riesgo asumimos, qué cuesta
```

**Cuándo se crea un ADR:**

- Decisión técnica con trade-offs reales (ej: elegir framework, modelo de DB, stack de auth).
- Decisión que en 3 meses te vas a preguntar "¿por qué hicimos esto?".
- Decisión donde hay alternativas razonables que descartaste.

**Cuándo NO se crea un ADR:**

- Decisiones triviales obvias del código.
- Decisiones forzadas (no hay alternativa, lo hiciste así porque era lo único posible).
- Cosas que cualquier dev haría igual.

**Numeración:** secuencial, sin saltos. ADR-001, ADR-002, ADR-003... Si descartás un ADR, lo dejás como "Revertida" pero no reusás el número.

**Tamaño:** crece append-only. No te preocupes por el tamaño total. 30-40 ADRs en un proyecto de 1 año es normal y saludable.

#### `docs/REJECTED.md`

**Qué contiene:** ideas, features, enfoques que se evaluaron y se descartaron por preferencia o contexto, sin que haya una alternativa técnica analizada formalmente.

**Diferencia clave con DECISIONS:**

| DECISIONS | REJECTED |
|-----------|----------|
| Decisión técnica con alternativas analizadas | Idea descartada por preferencia o contexto |
| Formato ADR completo | Formato breve (3-5 líneas) |
| Hubo trade-off real | Costo > beneficio sin necesidad de análisis |
| "Elegí A vs B vs C" | "No hago X porque Y" |

**Formato de cada entrada:**

```markdown
## REJ-001 — Título de lo descartado

- **Fecha:** YYYY-MM-DD
- **Razón:** por qué no se hace
- **Reconsiderar si:** condición que justificaría volver a evaluarlo (opcional)
- **Referencia:** ADR-X si la decisión apareció como alternativa de un ADR (opcional)
```

**Por qué REJECTED es crítico:**

Sin este archivo, en 2 meses Claude (o vos) van a proponer las mismas ideas que ya descartaron. REJECTED es tu defensa principal contra el drift.

**Ejemplo real:**

```markdown
## REJ-001 — Migrar el dashboard a Vercel/Netlify
- **Fecha:** 2026-05-06
- **Razón:** el dashboard hace queries directas a Supabase con conexiones
  persistentes. Funciones serverless cierran/abren conexiones por request,
  generando latencia y costo de DB. VPS persistente es mejor fit.
- **Reconsiderar si:** el patrón de conexiones cambia o usuarios crecen >100x.
```

---

### Capa 3 — Estado

#### `docs/STATUS.md`

**Qué contiene:** estado actual de cada bloque/módulo del proyecto.

**Estructura típica:**

```markdown
# Estado actual

**Última actualización:** YYYY-MM-DD HH:MM (commit XXXXX)

## Bloques principales

| Bloque | Estado | Notas |
|--------|--------|-------|
| Bot core | 🟢 Producción | Stable, gpt-5.1 |
| Skills EQ | 🟢 Producción | 4 skills activas |
| Hardening seguridad | 🟡 En progreso | 3/4 etapas |
| Analytics | 🟡 Funciona | Hardening pendiente |
| FAQs basadas en data | ⏸️ Pausado | Esperando 2 semanas de tráfico |

## Bugs vigentes
[lista de bugs activos no resueltos]

## Resueltos recientes
[últimos 10-15 bugs resueltos con fecha y commit]

## Métricas
[opcional, métricas relevantes del momento]
```

**Cuándo se actualiza:** cada vez que un bloque cambia de estado (idea → progreso → producción → pausado).

**Convención de estados:**
- 🟢 Producción / Estable
- 🟡 En progreso / Funciona pero hardening pendiente
- 🔵 Idea / Aún no empezamos
- ⏸️ Pausado
- 🔴 Bug crítico / Bloqueado

#### `docs/TODO.md`

**Qué contiene:** tareas accionables abiertas, agrupadas por criticidad.

**Estructura típica:**

```markdown
# Pendientes

> Solo pendientes accionables. Lo completado va a CHANGELOG.md.

## 🔴 Críticos
| # | Tarea | Tiempo | Por qué |
|---|-------|--------|---------|
| 1 | Rotar password X | 5min | Expuesta en commit Y |

## 🟠 Importantes
[tabla similar]

## 🟡 No urgentes
[tabla similar]

## 🟢 Ideas / Mejoras
[tabla similar]

## ❓ Decisiones pendientes
[items que esperan tu decisión, no acción]

## 🔒 Bloqueados
[items que esperan input externo]
```

**Reglas:**
- Solo pendientes accionables. Si algo no es accionable, no va acá.
- Las tareas completadas se MUEVEN a CHANGELOG (no se borran).
- Las tareas descartadas se MUEVEN a REJECTED.
- Si una tarea está bloqueada por algo externo, se marca como tal con razón.

#### `docs/CHANGELOG.md`

**Qué contiene:** historial cronológico de qué se hizo, ordenado del más reciente al más viejo.

**Formato (estilo Keep a Changelog):**

```markdown
# Changelog

## [Unreleased]
- Cambios pendientes de release

## [v3.8.0] — 2026-05-06
### Added
- Edge Functions para auth
### Changed
- OpenAI key sale del APK
### Fixed
- Bug X corregido

## [v3.7.3] — 2026-04-29
[...]
```

**Alternativa para proyectos sin releases formales:**

```markdown
# Changelog

| Fecha | Commit | Tipo | Descripción |
|-------|--------|------|-------------|
| 2026-05-07 | abc1234 | docs | Refactor de documentación |
| 2026-05-06 | def5678 | feat | Fallback message OpenAI |
```

**Cuándo se actualiza:** después de cada commit relevante o al cierre de cada sesión.

---

### Capa 4 — Sesión

#### `docs/SESSION_HANDOFF.md`

**Qué contiene:** snapshot del estado al cierre de cada sesión. Es el "save game" del proyecto.

**Estructura típica:**

```markdown
# Session Handoff

**Última sesión:** YYYY-MM-DD HH:MM
**Último commit:** XXXXX
**Próxima acción esperada:** [acción concreta]

## ¿Qué se hizo?
[5-10 bullets de la sesión que cierra]

## ¿En qué estado quedó?
- Branch: main (limpio / con cambios)
- VPS: actualizado / desactualizado
- DB: en sync con docs/DATABASE.md

## ⏸️ Lo que quedó en curso
[Si algo quedó a medias, decir qué falta]

## 🚧 Próximo paso al retomar
[Acción CONCRETA. No "seguir", "avanzar". Algo específico]

## ⚠️ Bloqueado por
[Si hay bloqueo. Si no, "Nada"]

## 📂 Archivos tocados en esta sesión
[Lista para que la próxima sesión sepa qué releer si hay duda]

## 💡 Contexto importante que no quedó en otros docs
[Cosas dichas en chat que vale guardar antes del compact]
```

**Reglas críticas:**

- Se SOBREESCRIBE entera cada vez. No es histórico, es el estado actual.
- El histórico va a CHANGELOG.md.
- Se regenera al final de cada sesión, ANTES de compactar.
- Es lo PRIMERO que Claude lee al iniciar sesión nueva.

---

### Capa 5 — Visualización

Ver sección [5. El dashboard HTML como pieza central](#5-el-dashboard-html-como-pieza-central).

---

### Capa 6 — Reglas

#### `CLAUDE.md` (raíz)

**Qué contiene:** reglas para Claude sobre cómo se comporta en este proyecto.

**Tamaño objetivo:** 150-200 líneas. Máximo 250.

**Estructura típica:**

```markdown
# CLAUDE.md — Reglas para Claude Code en [Proyecto]

## 🚨 ARCHIVOS Y CARPETAS PROTEGIDOS
[Lista de paths intocables o referencia a PROTECTED_PATHS.md si existe]

## 🚨 LO PRIMERO QUE HAGO AL INICIAR UNA SESIÓN
1. Leer docs/SESSION_HANDOFF.md
2. Leer docs/STATUS.md
3. Leer docs/TODO.md
4. Confirmar al usuario en 3 líneas: estado, próxima acción, bloqueos
5. NO TOCAR código hasta tener OK del usuario

## 📁 Sistema de documentación viva
[Tabla con archivos, ubicación, disparador específico]

## 📍 Disparadores de actualización durante sesión
[Tabla: trigger → archivo a actualizar]

## 🔄 Protocolo pre-compactación
Frases de disparo: "voy a comprimir", "cerrá sesión", "compact ya".
Cuando se dispare, ejecutar checklist completo en docs/COMPACTION-PROTOCOL.md.

## 🧭 Separación con [Proyecto Hermano]
[Reglas de paths cruzados, permisos, redirección por keywords]

## 🔀 Diferencia DECISIONS vs REJECTED
[Tabla comparativa breve]

## ⚠️ master-plan.html
OBLIGATORIO actualizar cada vez que cambia STATUS, TODO, DECISIONS,
REJECTED o CHANGELOG. Refleja contenido COMPLETO, no resumen.

## Reglas técnicas extra
[Reglas específicas del proyecto: convenciones de código, gotchas, etc.]
```

**Anti-patrones:**

- ❌ Schemas de DB detallados → van a `ARCHITECTURE.md`
- ❌ Debugging tips de código → van a `ARCHITECTURE.md` o doc temático
- ❌ Patrones de implementación detallados → van a `ARCHITECTURE.md`
- ❌ Lista completa de pendientes → vive en `TODO.md`
- ❌ Estado de bloques completo → vive en `STATUS.md`

`CLAUDE.md` es para reglas del comportamiento, no para contenido del proyecto.

---

## 5. El dashboard HTML como pieza central

### Qué es

Un archivo HTML único, estático, autocontenido, que muestra el estado completo del proyecto cuando lo abrís en el navegador. Funciona offline, sin servidor, sin dependencias.

### Filosofía: dashboard completo, no vitrina con links

**Mal modelo (vitrina):**

```html
<h2>Pendientes</h2>
<p>Ver docs/TODO.md para lista completa</p>
<a href="docs/TODO.md">Abrir TODO.md</a>
```

**Buen modelo (dashboard completo):**

```html
<h2>Pendientes</h2>
<table>
  <!-- TODOS los pendientes con criticidad, tiempo, razón -->
</table>
```

**Por qué:** cuando abrís el HTML, querés ver TODO el estado del proyecto en un solo lugar visual sin tener que abrir 5 markdowns. El "trabajo doble" de mantener info en markdown Y en HTML es aceptado a cambio de la experiencia visual unificada.

### Secciones del dashboard

1. **Header**: nombre, fecha de última actualización, commit actual.
2. **Estado de bloques**: refleja `STATUS.md` completo.
3. **Pendientes**: refleja `TODO.md` completo con criticidades.
4. **Decisiones**: lista TODOS los ADRs de `DECISIONS.md` con título + razón corta + alternativas descartadas.
5. **Rechazos**: refleja `REJECTED.md` completo.
6. **Timeline / Changelog**: refleja `CHANGELOG.md` completo.
7. **Stack y arquitectura**: resumen de `ARCHITECTURE.md` o link a diagrama si existe.

### Comentarios HTML invisibles (importantes)

Cada sección lleva al inicio un comentario invisible que indica la fuente:

```html
<!-- Source of truth: docs/TODO.md -->
<!-- Sync rule: when TODO.md changes, mirror full content here -->
<h2>Pendientes</h2>
[contenido]
```

Estos comentarios:
- No se ven en el navegador.
- Le dicen a Claude (y a vos en 6 meses) de dónde sale cada sección.
- Hacen que el HTML sea autoexplicable como artefacto.

### Nota visible al pie

```
Este documento es el dashboard maestro del proyecto. Refleja el contenido
completo de los markdowns en docs/, no resumen. Cuando se edita un markdown,
la sección correspondiente del HTML debe actualizarse también.
Markdown es fuente, HTML es reflejo completo.
```

### Regla 1:1

El HTML refleja el contenido **uno a uno** con los markdowns. Si TODO.md tiene 16 entradas, el HTML tiene 16 entradas. Si DECISIONS.md tiene 8 ADRs, el HTML lista los 8.

**No consolidar para "legibilidad":** consolidar entradas (ej: agrupar 7 commits del mismo día en 1 entrada del HTML) parece útil pero erosiona el sistema. Las auditorías futuras de sincronización se complican porque "16=16" deja de ser válido.

**Si la legibilidad preocupa:** agrupar visualmente con headers (ej: header "06/05/2026" con 7 cards debajo) en lugar de consolidar entradas.

### Regeneración: manual vs automática

**Recomendación: manual.**

Cuando cambia un markdown relevante (STATUS, TODO, DECISIONS, REJECTED, CHANGELOG), el HTML se regenera manualmente como parte del flujo. Esto se cubre en el checklist pre-compactación.

**Por qué no automática:**

- Robustez: HTML estático funciona offline, sin server, sin parser de markdown.
- Consistencia: una regla simple ("regenerar al cambiar fuente") es más fácil de seguir.
- Performance: para un dashboard que abrís 1-2 veces por día, no hay beneficio en regen automática.

**Cuándo evaluar automatización:** si en 6 meses el regen manual te cansa, podés agregar un script Python que regenere el HTML desde los markdowns. Pero arrancá manual.

---

## 6. Protocolo de compactación (las 3 fases)

El protocolo de compactación es la parte más operativa del sistema. Cubre 3 momentos distintos.

### Dónde vive

En un archivo dedicado: `docs/COMPACTION-PROTOCOL.md` (o nombre adaptado).

`CLAUDE.md` solo tiene un puntero corto a ese archivo + las frases de disparo.

### Fase 1 — PRE-compactación

**Cuándo se dispara:** cuando vos decís alguna de estas frases:

- "voy a comprimir"
- "cerrá sesión"
- "compact ya"
- "prepará todo para compactar"
- "hacé el checklist pre-compact"

**Qué hace Claude:**

```
PRE-COMPACTACIÓN — CHECKLIST

[ ] 1. Releer estos archivos para verificar consistencia:
      - docs/SESSION_HANDOFF.md (anterior)
      - docs/STATUS.md
      - docs/TODO.md
      - docs/CHANGELOG.md (entrada del día si existe)

[ ] 2. Verificar git status (limpio o con cambios)

[ ] 3. Si aplica: verificar VPS / pm2 list contra STATUS.md
      Si difieren, REALIDAD GANA, actualizar el doc.

[ ] 4. Actualizar OBLIGATORIO:
      [ ] docs/SESSION_HANDOFF.md — sobreescribir completo:
          • Estado actual
          • Lo que se hizo en la sesión
          • Lo que quedó en curso
          • Próximo paso CONCRETO
          • Bloqueos
          • Archivos tocados
          • Contexto importante del chat

      [ ] docs/CHANGELOG.md — entrada nueva al tope con fecha de hoy:
          • Versión publicada (si aplica)
          • Trabajo realizado (bullets)
          • Decisiones (ADRs creados)

      [ ] docs/TODO.md:
          • Mover tareas completadas a CHANGELOG
          • Agregar tareas nuevas surgidas

      [ ] docs/STATUS.md — si cambió estado de algún bloque

[ ] 5. Si hubo decisiones técnicas hoy:
      [ ] Crear ADR-NNN nuevo en docs/DECISIONS.md
      [ ] Actualizar índice si existe

[ ] 6. Si se descartaron opciones hoy:
      [ ] Agregar entradas en docs/REJECTED.md

[ ] 7. Si cambió arquitectura:
      [ ] Actualizar docs/ARCHITECTURE.md

[ ] 8. REGENERAR docs/master-plan.html:
      Verificar que refleja contenido completo y actualizado de:
      - STATUS.md
      - TODO.md
      - DECISIONS.md
      - REJECTED.md
      - CHANGELOG.md

[ ] 9. Commit:
      git add -A
      git commit -m "docs: pre-compaction sync — YYYY-MM-DD"

[ ] 10. Push:
      git push origin main

[ ] 11. Si aplica: verificar sync con VPS

[ ] 12. Devolver al usuario resumen estructurado:

═══════════════════════════════════════════════════
RESUMEN PRE-COMPACT — [fecha]
═══════════════════════════════════════════════════

Archivos actualizados:
- docs/SESSION_HANDOFF.md ✅
- docs/CHANGELOG.md ✅ (entrada nueva)
- docs/TODO.md ✅ (X tareas movidas)
- docs/DECISIONS.md ✅ (si aplica)
- docs/REJECTED.md ✅ (si aplica)
- docs/master-plan.html ✅

Próximo paso al retomar: [acción concreta]

Bloqueos: [si hay]

Estás listo para /compact.
═══════════════════════════════════════════════════
```

### Fase 2 — Compactación

Vos ejecutás `/compact` en Claude Code. Esto NO lo hace Claude solo, lo hacés vos cuando Claude te confirmó que el checklist está completo.

### Fase 3 — POST-compactación (al iniciar sesión nueva)

**Cómo:** pegás el contenido de `docs/RESUME-PROMPT.md` (o `POST_COMPACT_PROMPT.md`) al inicio de la sesión nueva.

**Qué contiene `RESUME-PROMPT.md`:**

```markdown
Estás retomando trabajo en [Proyecto].

Por favor leé en este orden y mantené en contexto:
1. docs/SESSION_HANDOFF.md — dónde quedamos
2. docs/STATUS.md — qué está vivo, qué está roto
3. docs/TODO.md — pendientes priorizados
4. docs/DECISIONS.md — decisiones técnicas vigentes
5. docs/REJECTED.md — qué descartamos (no proponer estas cosas)

Después confirmá conmigo en 3 líneas:
a) Estado del proyecto (versión, bloques activos)
b) Próxima acción esperada
c) Top 3 pendientes en orden de prioridad

NO toques código hasta tener mi OK.
```

### Diferencia crítica: SESSION_HANDOFF vs RESUME-PROMPT

| | SESSION_HANDOFF.md | RESUME-PROMPT.md |
|---|---|---|
| Quién lo escribe | Claude al cierre | Vos al armarlo (una vez) |
| Quién lo lee | Claude al inicio | Vos lo pegás como prompt |
| Cuándo cambia | Cada sesión | Casi nunca |
| Contenido | Estado snapshot | Instrucciones de retorno |

Confusión común: pensar que son lo mismo. NO lo son. Mantenelos como archivos separados.

---

## 7. Reglas de actualización con disparadores

Esta es la tabla central que va en `CLAUDE.md`. Define exactamente cuándo se actualiza cada archivo según un disparador específico.

### Tabla de disparadores

| Trigger / Acción | Archivo a actualizar | Cómo |
|------------------|---------------------|------|
| Tomé decisión técnica con alternativas analizadas | `docs/DECISIONS.md` | Crear ADR-NNN nuevo |
| Descarté una idea/feature por preferencia | `docs/REJECTED.md` | Agregar entrada REJ-NNN |
| Cerré una tarea pendiente | `docs/TODO.md` → `docs/CHANGELOG.md` | Mover de uno a otro |
| Agregué una tarea nueva accionable | `docs/TODO.md` | Agregar con criticidad |
| Cambió estado de un bloque (idea→progreso→producción) | `docs/STATUS.md` | Actualizar tabla |
| Hice commit que cambia comportamiento | `docs/CHANGELOG.md` | Agregar fila |
| Cambió arquitectura (módulo nuevo, stack) | `docs/ARCHITECTURE.md` + `master-plan.html` | Editar ambos |
| Cambió schema de DB | `docs/DATABASE.md` + crear migration SQL | Documentar y crear archivo |
| Edit de archivo crítico que afecta runtime | Verificar tests / sync con VPS | Validación adicional |
| Aprendí algo persistente sobre el proyecto | `~/.claude/.../memory/` o doc apropiado | Según naturaleza |
| Voy a comprimir | Ejecutar checklist pre-compactación | Ver protocolo |
| Inicio de sesión nueva | Leer SESSION_HANDOFF, STATUS, TODO | Confirmar antes de tocar código |

### Regla general

> Si la información puede ser útil en una sesión futura post-compact y NO se deriva del código actual o de git log, va a un MD. Si es derivable, NO lo escribo.

---

## 8. Separación entre proyectos hermanos

Cuando tenés 2 o más proyectos relacionados (ej: bot + dashboard, mobile + desktop), necesitás reglas explícitas de separación para evitar que sesiones de un proyecto contaminen al otro.

### Regla base

Cada `CLAUDE.md` tiene una sección `🧭 Separación con [Proyecto Hermano]` que define:

```markdown
## 🧭 Separación con [Proyecto Hermano]

- Mi proyecto: [nombre] ([path local concreto, ej: D:\proyecto-A])
- Otro proyecto: [nombre del hermano] ([path local concreto, ej: D:\proyecto-B])
- Permisos: leer sí, editar NO
- Si el usuario menciona [keywords del otro proyecto] → redirijo al otro chat
- Si necesito entender algo del otro proyecto, puedo leer pero NO modificar
```

### Importante: paths concretos, no placeholders

❌ Mal: `Mi proyecto: (path local del bot)`
✅ Bien: `Mi proyecto: D:\Tobybot V0`

Sin paths concretos, Claude no sabe qué redirigir.

### Keywords de redirección

Listar palabras o frases específicas que disparan redirección. Ejemplos:

- Bot WhatsApp → keywords: "OpenClaw", "knowledge files", "prompts del bot", "SOUL.md", "SKILL.md", "skills EQ".
- Dashboard → keywords: "Next.js", "Tailwind", "session-analyzer", "watchdog", "PM2 dashboard".

### Modelo bidireccional

La separación se documenta en LOS DOS proyectos. P3 menciona a P4, P4 menciona a P3. Así la regla funciona desde cualquier sesión en la que estés.

### Decisiones que afectan a ambos proyectos

Cuando una decisión afecta a los dos (ej: cambio de schema DB compartida):

**Opción 1 (recomendada para acoplamiento bajo):** documentar en el proyecto "dueño" del cambio. El otro tiene una entrada corta en su CHANGELOG referenciando el ADR del primero.

**Opción 2 (para acoplamiento alto):** ADR duplicado en ambos proyectos con el mismo contenido. Riesgo: desincronización futura.

**Opción 3 (para casos extremos):** repo separado solo de docs compartidas. Riesgo: 3 lugares para mantener.

Para 2 proyectos típicos, **Opción 1 alcanza**.

---

## 9. Adaptaciones por tipo de proyecto

El esqueleto de 6 capas sirve para todos los proyectos, pero la cantidad de archivos y el peso relativo varía.

### Proyectos pequeños (script, herramienta single-file)

**Capas innegociables:**
- `CLAUDE.md`
- `docs/DECISIONS.md`
- `docs/REJECTED.md`
- `docs/SESSION_HANDOFF.md`

**Capas opcionales:**
- `README.md` puede absorber `ARCHITECTURE.md` (proyecto pequeño no necesita arquitectura formal).
- `STATUS.md` y `TODO.md` pueden fusionarse en uno.
- `master-plan.html` puede ser overkill — capaz no aporta valor.
- `CHANGELOG.md` puede ser sección de `SESSION_HANDOFF.md`.

### Proyectos medianos (app standalone, módulo de SaaS)

**Modelo completo de 6 capas aplica directo.** Es el sweet spot.

### Proyectos grandes (sistema complejo, multi-módulo)

**Modelo completo + extensiones:**
- `ARCHITECTURE.md` puede subdividirse en archivos temáticos (DATABASE.md, SECURITY.md, DEPLOYMENT.md, etc.).
- `DECISIONS.md` puede subdividirse en carpeta `docs/decisions/` con archivo por ADR.
- `RUNBOOK.md` y `MONITORING.md` para operaciones.

### Proyectos con framework upstream (bot OpenClaw, fork de proyecto público)

**Cuidado especial:**
- Detectar carpetas/archivos que son del framework, NO tuyos.
- Usar nombre de carpeta de docs distinto a la del framework (ej: `arti-docs/` en lugar de `docs/` si `docs/` está tomada).
- Crear `PROTECTED_PATHS.md` listando explícitamente qué NO se toca.
- Reglas firmes en `CLAUDE.md` de "carpeta X intocable bajo ninguna circunstancia".

### Proyectos en producción

**Capas adicionales útiles:**
- `RUNBOOK.md` — procedimientos operativos.
- `MONITORING.md` — qué se monitorea, alertas, runbook por error.
- `SECURITY.md` — capas de seguridad documentadas.

### Proyectos con espacio personal del usuario

Si el repo tiene una carpeta donde vos guardás tests, exploraciones, materiales operativos (no docs del proyecto):

- Documentar explícitamente en `CLAUDE.md` que esa carpeta es intocable.
- Listar en `PROTECTED_PATHS.md`.
- Regla firme: "no mover archivos hacia adentro o hacia afuera".

---

## 10. Implementación paso a paso en un proyecto nuevo

### Pre-requisitos

- Proyecto con repo Git inicializado (aunque sea local).
- Claude Code configurado en el proyecto.
- Decisión sobre nombre de carpeta de docs (`docs/` por default, otro nombre si hay conflicto).

### Paso 1 — Crear estructura mínima

```bash
mkdir docs
cd docs
touch README.md  # si no existe en raíz, crear allí
touch DECISIONS.md REJECTED.md STATUS.md TODO.md CHANGELOG.md
touch SESSION_HANDOFF.md
touch COMPACTION-PROTOCOL.md
touch RESUME-PROMPT.md
mkdir legacy  # por si después rescatás algo
```

### Paso 2 — Crear `CLAUDE.md` en raíz

Usar el template de la [sección 16](#16-templates-de-prompts).

### Paso 3 — Llenar archivos iniciales con esqueletos mínimos

Cada archivo arranca con un esqueleto que explica su propósito. Ver formatos en sección [4](#4-archivos-del-sistema-qué-va-en-cada-uno).

### Paso 4 — Crear `master-plan.html` inicial

HTML estático con secciones para los 6 puntos del dashboard. Inicialmente vacías o con placeholders. Se va llenando a medida que el proyecto avanza.

### Paso 5 — Configurar protocolo de compactación

Llenar `docs/COMPACTION-PROTOCOL.md` con el checklist completo (ver sección [6](#6-protocolo-de-compactación-las-3-fases)).

Llenar `docs/RESUME-PROMPT.md` con el prompt de retorno.

### Paso 6 — Primer commit

```bash
git add -A
git commit -m "docs: initialize 6-layer documentation system"
```

### Paso 7 — Empezar a usar el sistema

A partir de acá, cada sesión de trabajo:

1. Claude lee SESSION_HANDOFF al inicio (vacío al principio, eso está bien).
2. Confirma con vos en 3 líneas.
3. Trabajan en lo que sea.
4. Al cerrar: protocolo pre-compactación.

### Tiempo estimado

- Setup inicial: 30-45 minutos.
- Primera sesión real con el sistema funcionando: depende del trabajo, pero el overhead del sistema es ~5 minutos al cierre.

---

## 11. Implementación en un proyecto existente con docs previos

Si el proyecto ya tiene documentación dispersa, el proceso es más complejo. Consiste en 2 fases.

### Fase A — Auditoría

Pedirle a Claude Code que audite la documentación existente contra el modelo de 6 capas. El prompt está en la sección [16](#16-templates-de-prompts).

La auditoría debe devolver:

1. Inventario completo de docs actuales con estado (vigente, stale, mezclado).
2. Comparación contra modelo ideal.
3. Análisis de consistencia (duplicaciones, contradicciones).
4. Plan de movimiento de archivos (renombrar, mover, fusionar, descartar).
5. Reglas de actualización propuestas.
6. Checklist pre-compactación.
7. Esqueletos de archivos a crear.
8. Tabla resumen final.

**Importante:** la auditoría NO ejecuta nada. Solo propone. Vos revisás y decidís.

### Fase B — Implementación

Pegar un prompt específico de implementación que:

1. Confirma decisiones tomadas en la auditoría.
2. Define orden de pasos (mover legacy → crear estructura → editar → commit).
3. Lista validaciones obligatorias pre-commit.
4. Espera tu OK antes de commitear.

Ejemplos reales en sección [16](#16-templates-de-prompts).

### Lecciones aprendidas en proyectos retrofiteados

- **No mover docs vivos a legacy automáticamente.** Si el contenido está al día, mejor renombrar in-place que mover a legacy.
- **Detectar "docs que parecen docs pero son código".** Algunos archivos `.md` son leídos por el runtime del proyecto (skills, prompts, configs). Esos NO se mueven.
- **Detectar archivos de espacio personal del usuario.** Carpetas tipo "(1) New/", "Notes/", etc. NO son docs del proyecto.
- **Detectar conflictos con framework.** Si la carpeta `docs/` pertenece a un framework, usar otra carpeta.

---

## 12. Mantenimiento del sistema

### Mantenimiento pasivo (lo hace Claude solo)

Si `CLAUDE.md` está bien armado, Claude hace solo:

- Lectura de SESSION_HANDOFF al inicio.
- Confirmación contigo antes de tocar código.
- Actualización de archivos según disparadores.
- Ejecución del checklist pre-compactación cuando se dispara.

### Mantenimiento activo (lo hacés vos)

**Cada 2-4 semanas:**
- Abrir `master-plan.html` y verificar visualmente que refleja la realidad.
- Revisar `STATUS.md` contra el código real (¿hay módulos en estado distinto al documentado?).
- Verificar que `REJECTED.md` siga siendo una buena referencia (no items obsoletos).

**Cada 2-3 meses:**
- Revisar si `CLAUDE.md` se infló o tiene contenido que debería ir a `ARCHITECTURE.md`.
- Verificar que los disparadores realmente se dispararon (¿hay decisiones que no quedaron como ADR?).
- Considerar si surgieron patrones que deberían formalizarse.

**Cada 6 meses:**
- Auditoría completa: ¿el sistema sigue siendo útil? ¿hay redundancias? ¿hay archivos muertos?

### Síntomas de que el sistema está fallando

- Claude te trae cosas que ya descartaste → REJECTED no se está leyendo o no está completo.
- Claude no sabe dónde estás al iniciar sesión → SESSION_HANDOFF desactualizado o no se está leyendo.
- HTML y markdowns desincronizados → checklist pre-compactación no se ejecutó.
- `CLAUDE.md` infladísimo → contenido técnico se está mezclando con reglas, hay que aliviar.

---

## 13. Disciplina mínima del usuario

El sistema funciona si vos sostenés 3 hábitos:

### Hábito 1 — Anunciar antes de comprimir

**Nunca compactes sin avisar.** Frase mágica: *"voy a comprimir"* o *"cerrá sesión"*.

Si compactás sin avisar, Claude no ejecuta el checklist y la próxima sesión arranca con info vieja. Eventualmente el sistema falla silenciosamente.

### Hábito 2 — Cerrar sesión explícitamente

No cierres la pestaña. Decí *"cerrá sesión"* y dejá que actualice los docs.

Si terminás una tarea grande pero seguís usando Claude, decí *"actualizá los docs con lo que hicimos hasta ahora"* aunque no compactes todavía.

### Hábito 3 — Confiar pero verificar

Cada 2-3 sesiones, abrí `master-plan.html` en el navegador y mirá si refleja el estado real. Si ves un desajuste, decile a Claude *"sincronizá el HTML con los markdowns"*.

Esa verificación visual de 30 segundos te ahorra problemas.

### Frases de poder (para tener a mano)

| Situación | Frase |
|-----------|-------|
| Cerrar sesión / comprimir | "voy a comprimir, ejecutá checklist pre-compactación" |
| Iniciar sesión nueva | Pegar contenido de RESUME-PROMPT.md |
| Claude trae algo descartado | "eso está en REJECTED, leelo y proponé otra cosa" |
| Claude trae algo ya hecho | "eso ya lo hicimos, revisá CHANGELOG" |
| Decisión técnica nueva | "esto va a un ADR nuevo" |
| Algo descartado nuevo | "agregá esto a REJECTED con la razón" |
| Cambio de estado de bloque | "actualizá STATUS, este bloque pasó de progreso a producción" |
| HTML desincronizado | "sincronizá master-plan.html con los markdowns" |

---

## 14. Errores comunes y cómo evitarlos

### Error 1 — Compactar sin avisar

**Síntoma:** próxima sesión arranca sin saber dónde estabas.
**Solución:** siempre decir "voy a comprimir" antes de `/compact`.

### Error 2 — `CLAUDE.md` que crece sin control

**Síntoma:** archivo de 500+ líneas con arquitectura, debugging, schemas mezclados.
**Solución:** auditar cada 2-3 meses. Si tiene contenido técnico, migrarlo a `ARCHITECTURE.md` o doc temático.

### Error 3 — HTML como vitrina con links

**Síntoma:** abrís el HTML y solo ves resúmenes con "ver TODO.md para detalle".
**Solución:** dashboard completo, contenido 1:1 con markdowns. Trabajo doble aceptado.

### Error 4 — Pendientes en múltiples lugares

**Síntoma:** `TODO.md`, `STATUS.md`, `master-plan.html` y comentarios en CLAUDE.md tienen versiones distintas de los pendientes.
**Solución:** una sola fuente de verdad (TODO.md). El resto refleja, no duplica.

### Error 5 — Documentar decisiones después de implementar

**Síntoma:** Claude te propone X, vos aceptás, implementan, no se crea ADR.
**Solución:** disparador explícito en `CLAUDE.md`: "antes de implementar decisión técnica, crear ADR".

### Error 6 — Confundir SESSION_HANDOFF con RESUME-PROMPT

**Síntoma:** vos pegás SESSION_HANDOFF al inicio y Claude lee instrucciones que no estaban pensadas para él.
**Solución:** son archivos distintos. SESSION_HANDOFF lo escribe Claude al cierre. RESUME-PROMPT lo pegás vos al inicio.

### Error 7 — No tener separación con proyectos hermanos

**Síntoma:** desde el chat de un proyecto, Claude te propone editar archivos del otro.
**Solución:** sección `🧭 Separación con [otro proyecto]` en `CLAUDE.md` con paths concretos y keywords.

### Error 8 — Eliminar archivos en lugar de moverlos a legacy

**Síntoma:** información histórica importante perdida.
**Solución:** mover a `docs/legacy/` antes de eliminar. Solo eliminar carpetas si están vacías.

### Error 9 — No verificar workflows de CI/CD antes de mover archivos

**Síntoma:** después del refactor, GitHub Actions falla porque apunta a paths que ya no existen.
**Solución:** investigar `.github/workflows/` antes de mover. Actualizar workflows o deshabilitarlos.

### Error 10 — Asumir que un archivo `.md` es documentación

**Síntoma:** moviste un archivo que era leído por el runtime, rompiste el bot.
**Solución:** distinguir docs (para humanos) vs código que parece doc (leído por programa). Documentar explícitamente cuáles son cuáles en `PROTECTED_PATHS.md`.

---

## 15. Lecciones aprendidas

Después de implementar el sistema en 4 proyectos productivos con perfiles muy distintos, estas son las lecciones más valiosas:

### Sobre el sistema en sí

1. **El esqueleto sirve para todos los proyectos, las adaptaciones son necesarias.** No tratar de forzar el modelo idéntico en 4 proyectos distintos. Mantener filosofía y mecánica iguales, pero ajustar cantidad de archivos y nombres según contexto.

2. **REJECTED es el archivo más subestimado al inicio y el más valioso al uso.** Sin REJECTED, Claude vuelve a proponer cosas descartadas todo el tiempo. Con REJECTED, Claude se autocorrige cuando le decís "eso está en REJECTED".

3. **El HTML completo vale el trabajo doble.** Tener un dashboard visual donde ves todo el estado del proyecto es enormemente más útil que tener que abrir 6 markdowns para entender dónde estás.

4. **`CLAUDE.md` se infla naturalmente, hay que aliviarlo activamente.** Cada 2-3 meses, revisar y mover contenido técnico a archivos dedicados.

### Sobre el proceso de implementación

5. **Auditar antes de implementar.** Nunca arrancar a refactorizar docs sin entender primero qué hay. La auditoría revela problemas que no veías.

6. **No mover docs vivos a legacy automáticamente.** Si el contenido está al día, renombrar in-place. Mover a legacy solo lo realmente obsoleto.

7. **Pedir validación numérica cruzada (HTML ↔ markdown).** "16 entradas en MD, 16 en HTML" es una validación de 5 segundos que detecta desincronizaciones.

8. **Investigar antes de mover si hay incertidumbre.** Workflows de CI/CD, espacios personales del usuario, archivos del framework. Mejor preguntar que romper.

9. **Hacer el commit y verificar antes del push.** Si rompiste algo, todavía estás en local y podés revertir limpio.

### Sobre la convivencia con Claude Code

10. **Los reportes detallados de Claude son fiables si pedís evidencia, no solo checkmarks.** "✅ X completo" no es suficiente. Pedir contenido pegado, números concretos, comparaciones.

11. **Claude aprende entre proyectos si reusás patrones.** Después de 4 proyectos, los reportes de calidad mejoraron progresivamente porque Claude reconocía el patrón.

12. **Disparadores explícitos en CLAUDE.md son críticos.** "Cuando X pase, hacé Y" es más confiable que "trata de mantener actualizado Z".

### Sobre el uso a largo plazo

13. **El sistema requiere disciplina mínima del usuario.** Si no anunciás antes de compactar, el sistema falla. No hay forma de automatizar esa disciplina.

14. **Cada 2-3 meses, vale auditar.** El sistema entropía. Aliviar `CLAUDE.md`, verificar consistencia HTML-MD, ver si hay archivos muertos.

15. **El meta-documento (este) es la pieza final.** Sin un documento que explique el sistema completo, dependés de tu memoria para replicarlo en proyectos nuevos.

---

## 16. Templates de prompts

### Template 1 — Auditoría inicial para proyecto existente

```
Necesito que audites el sistema de documentación viva de este proyecto y
me ayudes a cerrar los huecos. Vas a actuar como un tech lead haciendo
code review del proceso, no del código.

CONTEXTO DEL PROBLEMA
En sesiones largas pierdo continuidad: me proponés tareas que ya
resolvimos, volvés a sugerir enfoques que descartamos, y al comprimir
el chat se pierden decisiones importantes. Quiero un sistema de
documentación que sobreviva a la compactación y a sesiones nuevas, donde
vos seas responsable de mantenerlo actualizado según reglas claras.

PASO 0 — ESTRUCTURA DE CARPETAS
Toda la documentación viva del proceso debe vivir dentro de una carpeta
dedicada en la raíz del repo:
- Si NO existe carpeta `docs/` → crearla.
- Si YA existe `docs/` con contenido previo:
  1. Crear `docs/legacy/`.
  2. Mover TODO el contenido actual de `docs/` ahí.
  3. Listame qué se movió.
- Si `docs/` está bloqueada (framework, etc.) → usar `docs2/` o
  `[proyecto]-docs/` y avisame por qué.

ÚNICA EXCEPCIÓN: `CLAUDE.md` va en raíz, no dentro de docs/.

Antes de mover nada, mostrame el plan de movimiento. Esperá mi OK.

PASO 1 — INVENTARIO
Listá todos los archivos de documentación existentes (markdowns, HTMLs,
READMEs). Para cada uno:
- Nombre y ruta actual
- Qué información contiene (resumen 2 líneas)
- Última modificación
- Si está desactualizado
- Destino propuesto en la nueva estructura

PASO 2 — COMPARACIÓN CONTRA MODELO IDEAL
Compará lo que tengo contra esta arquitectura de 6 capas:

Capa 1 — Identidad: README.md (raíz), docs/ARCHITECTURE.md
Capa 2 — Decisiones: docs/DECISIONS.md, docs/REJECTED.md
Capa 3 — Estado: docs/STATUS.md, docs/TODO.md, docs/CHANGELOG.md
Capa 4 — Sesión: docs/SESSION_HANDOFF.md
Capa 5 — Visualización: docs/master-plan.html
Capa 6 — Reglas: CLAUDE.md (raíz)
Adicional: docs/COMPACTION-PROTOCOL.md, docs/RESUME-PROMPT.md

Para cada archivo: ¿existe?, ¿cubre lo que debería?, ¿hay que crearlo,
fusionarlo o reescribirlo?

PASO 3 — ANÁLISIS DE CONSISTENCIA
Revisá contradicciones o duplicaciones entre docs existentes.

PASO 4 — REGLAS DE ACTUALIZACIÓN
Decime si hay reglas escritas. Si no, proponelas:
- Inicio de sesión: qué leer y confirmar antes de tocar código
- Durante la sesión: cuándo agregás a cada archivo
- Antes de compactar: cómo regenerás SESSION_HANDOFF
- Al cambiar arquitectura: qué propagás

PASO 5 — PROTOCOLO DE PRE-COMPACTACIÓN
Checklist concreto que ejecutás cuando diga "voy a comprimir".

PASO 6 — DASHBOARD HTML
Filosofía: el HTML es dashboard COMPLETO autocontenido, no vitrina con
links. Markdown es fuente, HTML es reflejo COMPLETO. Acepto trabajo
doble.

ENTREGABLE FINAL
Devolveme:
A) Plan de movimiento de archivos (tabla)
B) Tabla resumen: archivo | ruta destino | existe sí/no | acción
C) Esqueletos iniciales de archivos a crear
D) Bloque listo para pegar en CLAUDE.md
E) Checklist de pre-compactación copy-paste
F) Tres preguntas que necesites que yo responda antes de implementar

REGLA IMPORTANTE
No toques ningún archivo todavía. Esto es solo auditoría y propuesta.
Cuando me devuelvas todo, yo te voy a decir qué aprobás y recién ahí
implementás.
```

### Template 2 — Implementación después de auditoría aprobada

Adaptar según resultados de la auditoría. Estructura general:

```
Necesito que implementes el sistema según la auditoría que hicimos.
Confirmaciones:
- Carpeta de docs: [docs/ o nombre adaptado]
- Convención: [inglés / castellano]
- Decisiones de las 3 preguntas: [respuestas]
- Estructura final: [como acordamos]

ORDEN DE IMPLEMENTACIÓN:
1. Crear estructura de carpetas
2. [Si aplica] Crear PROTECTED_PATHS.md
3. Mover archivos legacy
4. Mover archivos vivos con git mv
5. Crear archivos nuevos del modelo
6. Reescribir/editar archivos a actualizar
7. Crear master-plan.html como dashboard completo
8. Aliviar CLAUDE.md
9. Eliminar carpetas vacías

FILOSOFÍA DEL HTML:
Dashboard completo autocontenido. NO vitrina con links. Reflejo COMPLETO
de los markdowns, no resumen. Trabajo doble aceptado.

VALIDACIONES OBLIGATORIAS PRE-COMMIT:
[Lista de checks específicos del proyecto, ver ejemplos en otros proyectos]

NO hagas el commit hasta que yo confirme los checks.
```

### Template 3 — Verificación post-implementación

```
Antes del OK al commit, necesito evidencia concreta de:

1. NOTA AL PIE DEL HTML — pegamela tal como quedó.
2. REGLA DEL HTML EN CLAUDE.md — pegame la sección.
3. PASO DE VERIFICACIÓN DEL HTML EN CHECKLIST PRE-COMPACT — pegámelo.
4. COMENTARIOS HTML INVISIBLES — listame qué secciones tienen y a qué
   markdown apuntan.
5. CONSISTENCIA NUMÉRICA HTML ↔ MARKDOWNS — los números deben coincidir
   item por item:
   - Bloques en STATUS vs HTML
   - Pendientes en TODO vs HTML
   - ADRs en DECISIONS vs HTML
   - Rechazos en REJECTED vs HTML
   - Entradas en CHANGELOG vs HTML

Si los 5 están bien, push. Si encontrás algo, corregí antes del push.
```

### Template 4 — `CLAUDE.md` para proyecto nuevo

```markdown
# CLAUDE.md — Reglas para Claude Code en [Proyecto]

## 🚨 LO PRIMERO QUE HAGO AL INICIAR UNA SESIÓN
1. Leer docs/SESSION_HANDOFF.md — dónde quedamos
2. Leer docs/STATUS.md — qué está vivo
3. Leer docs/TODO.md — pendientes priorizados
4. Confirmar al usuario en 3 líneas:
   - Estado del proyecto
   - Próxima acción esperada
   - Top 3 pendientes en orden de prioridad
5. NO TOCAR código hasta tener OK del usuario.

## 📁 Sistema de documentación viva

| Capa | Archivo | Cuándo lo actualizo |
|------|---------|---------------------|
| 1 | README.md (raíz) | Cambia descripción a alto nivel |
| 1 | docs/ARCHITECTURE.md | Módulo nuevo, stack cambia |
| 2 | docs/DECISIONS.md | Decisión técnica con alternativas |
| 2 | docs/REJECTED.md | Idea descartada por preferencia |
| 3 | docs/STATUS.md | Bloque cambia de estado |
| 3 | docs/TODO.md | Tarea nueva / completada |
| 3 | docs/CHANGELOG.md | Después de commit relevante |
| 4 | docs/SESSION_HANDOFF.md | Final de sesión / pre-compact |
| 5 | docs/master-plan.html | Cuando cambian capas 2-3 |
| 6 | CLAUDE.md (raíz) | Cambian las reglas |

## 📍 Disparadores de actualización durante sesión

| Trigger | Archivo |
|---------|---------|
| Decisión técnica con razón no obvia | docs/DECISIONS.md (ADR nuevo) |
| Descarto enfoque por preferencia | docs/REJECTED.md |
| Cierro tarea | TODO.md → CHANGELOG.md |
| Agrego tarea | docs/TODO.md |
| Cambio estado de bloque | docs/STATUS.md |
| Cambio arquitectura | ARCHITECTURE.md + master-plan.html |

## 🔄 Protocolo pre-compactación

Frases de disparo: "voy a comprimir", "cerrá sesión", "compact ya".

Cuando se dispare, ejecutar checklist completo en
`docs/COMPACTION-PROTOCOL.md`.

Resumen de pasos:
1. Verificar consistencia (leer SESSION_HANDOFF, STATUS, TODO)
2. Actualizar SESSION_HANDOFF, CHANGELOG, TODO, STATUS
3. Crear ADR / REJECTED si aplica
4. Regenerar master-plan.html
5. Commit + push
6. Pasar prompt de retorno al usuario

## 🧭 Separación con [Proyecto Hermano]

- Mi proyecto: [path local concreto]
- Otro proyecto: [path local del hermano]
- Permisos: leer sí, editar NO
- Si el usuario menciona [keywords] → redirijo al otro chat

## 🔀 Diferencia DECISIONS vs REJECTED

- DECISIONS = decisión técnica con alternativas analizadas (formato ADR)
- REJECTED = idea/feature descartada por preferencia o contexto

## ⚠️ master-plan.html

OBLIGATORIO actualizar cada vez que cambia STATUS.md, TODO.md,
DECISIONS.md, REJECTED.md o CHANGELOG.md. Refleja contenido COMPLETO,
no resumen. Trabajo doble aceptado a cambio de experiencia visual
unificada.

## Reglas técnicas extra
[Reglas específicas del proyecto: convenciones de código, gotchas, etc.]
```

---

## 17. Glosario

**ADR (Architecture Decision Record):** entrada formal en DECISIONS.md que documenta una decisión técnica con contexto, decisión, razón y alternativas analizadas.

**Capa:** nivel de la arquitectura del sistema de docs. Hay 6 capas, de más estable (Identidad) a más volátil (Sesión).

**Compactación:** acción de comprimir el contexto del chat con Claude. Borra parte de la conversación previa.

**Dashboard maestro:** archivo `master-plan.html` que muestra el estado completo del proyecto en formato visual.

**Disparador (trigger):** acción específica durante una sesión que dispara la actualización automática de un archivo (ej: tomar decisión técnica → crear ADR).

**Drift:** fenómeno donde Claude pierde consistencia entre sesiones (propone cosas descartadas, repite tareas hechas).

**Espacio personal del usuario:** carpeta dentro del repo donde el usuario guarda archivos para uso diario (no son docs del proyecto). Debe ser intocable para Claude.

**Framework intocable:** caso donde el repo contiene archivos de un framework upstream que NO se deben modificar. Requiere reglas específicas en CLAUDE.md.

**Legacy:** carpeta `docs/legacy/` donde se mueven archivos históricos preservados (no se actualizan, sirven como referencia).

**MD vs HTML 1:1:** principio de que el HTML refleja contenido uno-a-uno con los markdowns, sin consolidar entradas.

**Memoria persistente:** archivos en `~/.claude/projects/.../memory/` que Claude Code mantiene como memoria de comportamiento. Distinto de la documentación del proyecto.

**PROTECTED_PATHS.md:** archivo opcional que lista explícitamente carpetas y archivos intocables. Útil en proyectos con framework o espacio personal.

**Proyecto hermano:** proyecto relacionado al actual (ej: bot + dashboard). Requiere reglas de separación bidireccional.

**REJ (Rejected entry):** entrada en REJECTED.md que documenta una idea descartada con razón.

**Reflejo completo:** principio de que el HTML muestra el contenido completo de los markdowns, no resumen ni vitrina con links.

**RESUME-PROMPT:** archivo que contiene el prompt que el usuario pega al iniciar sesión nueva post-compactación.

**SESSION_HANDOFF:** archivo que Claude escribe al cierre de cada sesión con snapshot del estado actual.

**Source of truth:** principio de que cada concepto tiene una sola fuente de verdad (ej: pendientes solo en TODO.md, no en 4 lugares).

**Sync rule:** regla que define cuándo actualizar el HTML según cambios en markdowns.

---

## Apéndice A — Diferencias entre los 4 proyectos validados

| Aspecto | P1 Mobile | P2 Desktop | P3 Bot WhatsApp | P4 Dashboard |
|---------|-----------|------------|-----------------|--------------|
| Stack | Flutter | Python + .exe | OpenClaw + Twilio | Next.js + Node workers |
| Madurez de docs previa | Alta | Media-alta | Media-alta dispersa | Alta |
| Conflicto con framework | No | No | Sí (carpeta `docs/`) | No |
| Espacio personal usuario | No | No | Sí (`(1) New/`) | No |
| Memoria externa relevante | No | No | Sí (`~/.claude/...`) | No |
| Carpeta de docs | `docs/` | `docs/` | `arti-docs/` | `docs/` |
| ADRs creados | 7 | 11 | 18 | 8 |
| Rechazos | 6 | 6 | 7 | 9 |
| CLAUDE.md final (líneas) | ~150 | 130 | 152 | 241 |
| Protocolo dedicado | Sí | Sí | Sí | Sí |
| Tiempo total implementación | ~horas | ~horas | 60-90 min | 45-60 min |

---

## Apéndice B — Convenciones recomendadas

### Nombres de archivos

- **Inglés** para nombres de archivos (DECISIONS.md, STATUS.md, etc.).
- **Razones:** estándar global, mejor reconocimiento por IDEs, plugins de markdown los esperan, ejemplos online están en inglés.
- **Excepción aceptable:** si el proyecto entero está en castellano y nadie externo va a verlo, podés usar nombres en castellano (DECISIONES.md). Pero conviene mantener inglés.

### Contenido

- **Castellano argentino** (o el idioma natural del usuario).
- **No mezclar idiomas dentro del mismo archivo.**

### Convenciones de Git

- **Commits semánticos:** `docs:`, `feat:`, `fix:`, `refactor:`, `chore:`, etc.
- **Mensaje de pre-compactación:** `docs: pre-compaction sync — YYYY-MM-DD`.
- **Mensaje de implementación inicial:** `docs: implement 6-layer documentation system in [carpeta]/`.
- **Para todos los renombres:** usar `git mv` para preservar historial.

### Numeración

- **ADRs:** secuencial sin saltos (ADR-001, ADR-002, ...). Si descartás un ADR, marcás "Revertida" pero no reusás el número.
- **REJECTED:** secuencial sin saltos (REJ-001, REJ-002, ...).

---

## Apéndice C — Recursos y referencias

### Documentos relacionados (este sistema se inspira en):

- **Architecture Decision Records (ADRs)**: patrón de Michael Nygard, usado por ThoughtWorks, AWS, etc.
- **Keep a Changelog**: formato estándar para CHANGELOG.md (https://keepachangelog.com).
- **Semantic Versioning**: para versiones (https://semver.org).

### Cuándo NO usar este sistema

Este sistema es overkill si:

- Proyecto de 1 archivo que sabés que vas a abandonar en 2 semanas.
- Script de uso único.
- Prototipo descartable.
- Proyecto donde nunca vas a volver.

Para esos casos, alcanza con un README mínimo.

### Cuándo SÍ vale la pena

- Proyectos que vas a mantener por más de 1-2 meses.
- Proyectos donde tomás decisiones técnicas no triviales.
- Proyectos donde Claude Code es parte regular del flujo de trabajo.
- Proyectos en producción con usuarios reales.
- Proyectos donde otra persona va a leer el código en algún momento.

---

**Fin del documento.**

> Este documento es una destilación de 4 implementaciones reales del sistema en proyectos productivos con perfiles muy distintos. Lo aprendido está acá para que no tengas que reinventar la rueda en proyectos futuros.
