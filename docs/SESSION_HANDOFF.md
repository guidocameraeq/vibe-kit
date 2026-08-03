# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo
> inyecta en cada chat nuevo de esta carpeta.

**Última sesión cerrada:** 2026-08-03 — **diseñada, red-teameada, presupuestada y aprobada la skill
`/relevamiento`: el tramo de ANTES del Arquitecto.** Guido trajo el método de arranque de proyectos de
4 etapas que **diseñó con su jefe** en FyD (papel + Word), con un dolor declarado textual: *"toda la parte
previa de recopilación de información no ha estado funcionando bien"*. Se analizó a fondo, se diseñó, se
atacó y se presupuestó. **NADA SE CONSTRUYÓ: el kit está idéntico y el `diff -r` de las 4 rutas da limpio.**

## Estado

- **`docs/SPEC-relevamiento.md` — READY** (aprobado por Guido 2026-08-03). Una skill hermana que lleva las
  etapas 1-3 del método, **escribe siempre** el documento 4, emite **un PDF al cerrar cada etapa** (el
  cierre oficial, requisito duro de Guido), y decide con evidencia escrita si el pedido **termina en
  software o no**. Sólo si termina en software le pasa el problema al Arquitecto, **por token explícito**.
  Aporta lo que el papel no puede: un **revisor** de 6 chequeos y **9 lentes** con gatillo por cita.
- **Red-team: 6 lentes · 93 hallazgos crudos · 79 verificados** (4 críticos, 24 graves, 34 medios, 17
  menores). **Todos los críticos y graves foldeados.** El crítico más caro: el gancho de vuelta al
  relevamiento estaba **después** del montaje — el repo se scaffoldeaba y commiteaba **antes** de que la
  propuesta llegara a la reunión, la inversión exacta del principio que el método defiende.
- **`docs/PRESUPUESTO-relevamiento.md`** — el contrato de construcción: 26 bloques del motor con sus
  líneas (**251 de 260**), el reparto a los 4 anexos, la escalera de poda cuantificada (−62 disponibles) y
  **las 99 líneas que NO se pueden sacar del motor**. Salió de 3 estimaciones independientes; dos con
  anclajes distintos convergieron en 247 y 251.
- **`docs/RECORRIDO-relevamiento.md`** — el relato de uso, 5 semanas / 9 sesiones / 3 tropiezos. **No es
  normativo**: si contradice al SPEC, manda el SPEC.
- **`docs/PROMPT-construir-relevamiento.md`** — el arranque para la sesión que construye.
- **Gobierno:** **ADR-016** · **REJ-011** (el 4º modo del Arquitecto) · **REJ-012** (Word) · **REJ-013**
  (la absorción mínima al banco).
- **La `GUIA-DE-USO.md` NO se tocó, a propósito:** esta sesión no sacó ninguna capacidad de cara al
  usuario — diseñó una. La receta se escribe **cuando la skill exista**, en el cierre del build.
- **Sin bump de versión, a propósito:** el kit no cambió. La versión estable sigue siendo `v2.2.1`.

## Próximo paso concreto (cuando Guido retome)

**Construir la skill, en un chat NUEVO de este repo:**
1. `/inicio`
2. Pegar el bloque de `docs/PROMPT-construir-relevamiento.md`.

**Paso 0 del build, antes de escribir una línea de la skill:** extraer las 4 plantillas del método desde
`proceso-arranque-proyectos.rar` (raíz del repo, **sin trackear**) a
`kit/skills/relevamiento/plantillas/_fuente/` y **commitearlas**. Son **277 líneas / 8.097 bytes / 61
placeholders `{{LINEAS:N}}`**, ya medidas. Herramienta: `"C:/Program Files/WinRAR/UnRAR.exe"`.
**El `.rar` se borra recién cuando `_fuente/` esté en git.**

**Después del build:** el estreno real — el próximo pedido de otro sector, de punta a punta. Es la única
señal que vale, y hasta que pase **no se declara estable**.

## Bloqueos

Ninguno.

## Contexto que no está en otros docs

- **El método es co-propiedad de Guido y su jefe**, y **no está versionado** (verificado: cero menciones de
  versión en los 4 `_fuente/`, en `GUIA-DEL-PROCESO.md` y en `DISENO-Y-DECISIONES.md`). Por eso la
  procedencia cita la fecha (2026-07-22) y el detector real es `git diff _fuente/`. **Las plantillas que el
  jefe ya repartió NO se tocan**; las 7 celdas que faltan (la grilla da 21 de 28) van sólo a la copia del kit.
- **Lo que hay que llevarle al jefe, aparte y sin apuro:** las 7 celdas faltantes · versionar el método ·
  y el hueco estructural — **el criterio de éxito a las 4-6 semanas no tiene dueño ni fecha en el método**,
  o sea que el papel no cierra su propio lazo. El tramo 5 de la skill lo cierra del lado de Guido.
- **Decisión de Guido sobre los nombres (2026-08-03): van a todos lados**, incluidos los `.md` que se mudan
  al repo del proyecto. **Consecuencia asumida y dicha: el historial de git no se borra.** Lo que sigue
  prohibido es el dato sensible de personas (sueldos, legajos, salud, sanciones), con mecanismo; y los
  **juicios sobre conducta se escriben por ROL**, nunca por nombre — eso es un hallazgo aparte que la
  decisión no cubría.
- **Los dos techos de tamaño, y por qué son distintos:** `SKILL.md` ≤260 líneas tiene mecanismo real (el
  motor se carga entero en cada invocación; si es largo, Claude se saltea pasos **en silencio**). El techo
  original de "60 KB del conjunto" incluía plantillas y **nunca se derivó de nada** — se corrigió a
  **motor + anexos ≤55 KB**, con las plantillas excluidas porque **se copian a disco, no se leen**.
  Modelo a copiar: **el Arquitecto (184 líneas de motor para 3 modos), no `docs-fyd`** (281 con anexo flaco).
- **El PDF está verificado en esta máquina, no supuesto:** Chrome headless, `%PDF-1.4`, ~1,2 s, con CSS y
  acentos. Tres hechos medidos que mandan sobre el diseño: **el exit code de Chrome no vale nada** (puede
  escribir 20-40 s después → poll acotado de 45 s), **Chrome imprime el error como si fuera el documento**
  (un HTML inexistente da un PDF válido de 23.943 B → verificar ANTES es la única defensa), y **sin
  `--no-pdf-header-footer` estampa la ruta del disco** en cada hoja.
- **El informe de diseño holístico** (el que Guido revisó y aprobó) se publicó como artefacto en claude.ai.
  Lo único que no estaba en ningún otro lado —el recorrido de uso— bajó a `docs/RECORRIDO-relevamiento.md`;
  el resto habría sido un espejo del SPEC.
- **La red se cayó dos veces a mitad de los workflows** (ENOTFOUND). El `resumeFromRunId` funcionó y
  recuperó las 6 lentes del red-team desde caché; la consolidación final se escribió a mano desde el
  `journal.jsonl`. Vale saberlo: **los hallazgos sobreviven en el journal aunque el workflow reporte 0.**
- **Fase 2 de `docs-fyd` sigue diferida**, y **el Modo B del Arquitecto sigue sin estrenarse** (ADR-012) —
  por eso `/relevamiento` v1 **no lo toca**: sus 3 ganchos de costura están en la Fase 2 del SPEC nuevo.
