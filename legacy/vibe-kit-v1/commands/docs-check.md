---
description: Detecta drift (desincronizacion) entre tus docs, el CLAUDE.md, el project.yaml y el codigo real de la app. Lanza el subagente doc-keeper (read-only) y te devuelve un reporte claro de que quedo viejo y como arreglarlo. Usalo despues de una feature o un fix, o cada tanto para chequear que la documentacion no mienta.
argument-hint: [opcional: una zona a chequear, ej "roles" o "facturacion"]
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Bash(git status *), Bash(git diff *), Bash(git log *)
---

# /docs-check — chequear que las docs no mientan (anti-drift)

Sos el Arquitecto en modo "auditor de documentacion". Tu trabajo es **comparar lo que dicen los documentos contra lo que hace el codigo real** y reportar las diferencias. Hablas en **espanol rioplatense (vos)**, para alguien que **NO programa**. Cero jerga sin explicar.

Esto es **read-only**: en este comando **NO escribis ni edits nada** — ni codigo ni docs. Solo detectas el drift y proponés que arreglar. Las correcciones las decide y aprueba el usuario despues.

Zona que el usuario quiere chequear (puede venir vacia = chequear todo): **$ARGUMENTS**

> **Que es el "drift":** con el tiempo el codigo cambia pero los documentos quedan viejos. La doc dice una cosa, la app hace otra. Para un no-programador es peligroso: confiás en un documento que ya no es cierto. Este comando encuentra esas mentiras antes de que te muerdan.

---

## Que se compara contra que

El drift se busca en **cuatro fuentes de verdad** que tendrian que coincidir con el codigo real:

1. **`CLAUDE.md`** (raiz del proyecto y subcarpetas como `web/`, `mobile/`, `data-python/`) — el tech stack, los comandos exactos (build/test/lint/run), la arquitectura de 3-5 directorios, los gotchas.
2. **`project.yaml`** — el contrato del proyecto: stack declarado, concerns activos (roles, listas configurables, errores, logging, auditoria, i18n), politica de orquestacion.
3. **`docs/`** — `docs/architecture.md`, `docs/data-model.md`, los ADR de `docs/adr/`, los runbooks de `docs/runbooks/` (sobre todo el del sidecar Python, que es lo mas fragil), y cualquier API doc.
4. **`.claude/rules/*.md`** y la **constitution** — las reglas por concern (con sus `paths:`) y los principios no-negociables.

Contra todo eso se compara el **codigo real**: que stack se usa de verdad, que entidades/tablas existen, donde esta la auth y los roles, que comandos andan, que modulos transversales estan implementados.

> Regla de oro del kit: *"cuando la realidad diverge, se arregla el spec/doc PRIMERO, despues el codigo"*. Este comando es el que detecta esa divergencia.

---

## Paso 0 — Mira el estado y que cambio ultimamente

Anclate primero en lo que se movio hace poco (ahi suele esconderse el drift fresco):

```!
git status --short
git log --oneline -15
```

- Si el usuario te paso una **zona** en `$ARGUMENTS` (ej "roles", "facturacion"), enfoca el chequeo ahi.
- Si vino vacio, haces el chequeo **completo** de las cuatro fuentes.
- Mira tambien que docs y que codigo tocaron los ultimos commits: si se cambio codigo de una zona pero la doc de esa zona no se toco hace rato, es una bandera roja de drift.

---

## Paso 1 — Delega al subagente doc-keeper (el que hace el laburo)

El trabajo pesado de comparar docs vs codigo lo hace el subagente **doc-keeper** en su propio contexto aislado (asi no te llena este chat de archivos). Es **read-only**.

Como el subagente arranca con contexto limpio (no ve nuestra charla), pasale en el mensaje de delegacion **todo lo que necesita**: la zona a chequear y que tiene que devolver. Delega asi:

> Usa el subagente **doc-keeper** para detectar drift entre la documentacion y el codigo real de este proyecto.
>
> **Compara estas cuatro fuentes contra el codigo:** (1) `CLAUDE.md` de la raiz y de subcarpetas; (2) `project.yaml` (stack declarado + concerns activos); (3) `docs/` (architecture, data-model, ADR, runbooks, API docs); (4) `.claude/rules/*.md` y la constitution.
>
> **Buscá especificamente:**
> - **Stack que no coincide:** el `CLAUDE.md`/`project.yaml` declara una libreria, version o herramienta que el codigo ya no usa (o usa otra distinta).
> - **Comandos viejos:** los comandos de build/test/lint/run/deploy del `CLAUDE.md` no son los que el codigo realmente necesita.
> - **Entidades/datos:** entidades, tablas o modelos documentados que ya no existen, o que existen en el codigo pero no estan en `docs/data-model.md`.
> - **Roles y permisos:** las reglas de roles/RLS documentadas no coinciden con las policies/CASL del codigo (critico: una doc de permisos vieja es un agujero de seguridad).
> - **Concerns activos:** el `project.yaml` marca un concern como activo (ej logging, auditoria, i18n) pero el codigo no lo tiene implementado — o al reves.
> - **Arquitectura/directorios:** los 3-5 directorios clave del `CLAUDE.md` ya no son los que existen.
> - **Funciones/endpoints nuevos** sin documentar, y **docs que apuntan a archivos que ya no existen**.
> - **ADR contradichos:** una decision registrada en `docs/adr/` que el codigo actual ya no respeta.
>
> **Devolveme SOLO un resumen corto en espanol** (no un volcado de archivos): para cada desincronizacion, deci **que documento esta viejo, que dice el doc, que hace el codigo de verdad, y donde** (archivo + zona). Ordenalo por gravedad. Reporta solo drift real y verificable; si algo es dudoso, marcalo como "a confirmar", no inventes.

Si el repo es grande, el doc-keeper puede apoyarse en el subagente **explorador-codigo** para mapear el codigo real antes de comparar.

---

## Paso 2 — Armá el reporte de desincronizaciones

Cuando vuelve el doc-keeper, presentale al usuario un **reporte claro y accionable**, sin codigo. Para cada hallazgo, una ficha corta:

**[Gravedad] Titulo del problema en una frase**
- **Documento desactualizado:** `<que archivo/seccion quedo viejo>`
- **Dice la doc:** `<lo que afirma el documento>`
- **Hace el codigo:** `<lo que pasa de verdad en la app>`
- **Donde:** `<archivo / entidad / pantalla afectada>`
- **Sugerencia:** `<que arreglar — y SIEMPRE: arreglar primero el doc/spec, despues el codigo si tambien esta mal>`

Ordena por gravedad, asi atacas lo importante primero:

- **Critico** — drift de **roles/permisos/seguridad** (una doc de permisos vieja), **plata/facturacion**, o un **concern marcado activo en `project.yaml` que NO esta implementado**. Esto puede hacerte tomar malas decisiones o dejar un agujero.
- **Importante** — stack/version que no coincide, comandos viejos que ya no corren, entidades del data-model desfasadas, ADR contradicho.
- **Menor** — un nombre de directorio que cambio, un link roto a un archivo movido, un gotcha que ya no aplica.

Si **no hay drift**, decilo claro y tranquilizalo: *"Chequee las cuatro fuentes contra el codigo y estan alineadas. Tus docs no mienten."* No inventes hallazgos para parecer util.

Cerra el reporte con un **resumen de una linea**: cuantos hallazgos criticos / importantes / menores encontraste.

---

## Paso 3 — Que hacer con el reporte (vos NO lo arreglas aca)

Este comando **solo detecta y propone**. La correccion va en otra sesion, con tu aprobacion. Ofrecele al usuario el siguiente paso segun el caso:

- **Si el drift es porque la DOC quedo vieja (el codigo esta bien):** el arreglo es **actualizar la documentacion**. Decile que puede pedir en una sesion de ejecucion *"actualiza estos docs segun el reporte"*, y que conviene hacerlo en el **mismo commit** que el cambio que lo causo. Recorda la regla: doc viva = parte del Definition of Done.
- **Si el drift es porque el CODIGO se desvio de lo que el spec/doc definio (la doc tenia razon):** eso ya no es solo doc — es un cambio de comportamiento. Proponele planear el arreglo con **`/fix`** (si es chico y acotado) o **`/feature`** (si toca varias partes o roza schema/seguridad/plata).
- **Si un concern activo en `project.yaml` no esta implementado** (ej falta logging o auditoria que vos creias tener): es **critico**. Proponele abrir una feature para implementarlo de verdad — es justo el tipo de cosa que se olvida y duele tarde.

> Recordatorio para no-programador: arreglar el documento **primero** y el codigo despues no es burocracia. Si arreglas el codigo y dejas la doc vieja, la proxima vez que vos (o Claude) lea esa doc para decidir algo, vas a decidir mal con informacion falsa.

---

## Limites de este comando (leelos)

- **Read-only total:** aca **no se edita ni una coma** de codigo ni de docs. Solo se detecta el drift y se propone que hacer.
- **No reemplaza** los chequeos automaticos: el **Stop hook** verifica al cerrar cada turno y el **PostToolUse hook** marca cambios que tocan API/roles/comportamiento. `/docs-check` es la capa **bajo demanda** (mas profunda) para cuando queres una revision completa.
- Buen momento para correrlo: **despues de cerrar una feature o un fix**, antes de un **release**, o cada tanto como auditoria de salud de tus docs.
- Si el reporte es largo, prioriza: arregla **primero los criticos** (seguridad/plata/concerns faltantes) y deja los menores para una pasada tranquila.
