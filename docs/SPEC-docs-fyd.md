# SPEC: Documentación para FyD — motor `/docs-fyd` (v1: solo el lado documentación) — vibe-kit
Una skill global nueva, `/docs-fyd`, que arma por repo la doc técnica que pide la auditora FyD desde el código (para que no mienta), preserva lo que solo sabe el humano (negocio) en una bóveda read-only, se siembra día-cero desde el Arquitecto y se mantiene fresca sola con el /cierre — todo aislado de los docs de trabajo del método.
- Estado: **✅ IMPLEMENTADO 2026-07-23** — la skill vive en `kit/skills/docs-fyd/`.
  **⚠️ SUPERADO por `SPEC-docs-fyd-v2.md`**: lo vigente es el v2. Este queda como historia del v1.
- Fecha: 2026-07-23

## Por qué (el dolor)
FyD Sistemas (auditora) tiene que poder levantar los proyectos de Guido **si Guido desaparece**. Hoy la doc técnica no existe de forma estándar y, si se escribiera a mano, envejecería y mentiría al mes. El deadline son ~2 semanas para 2-3 apps críticas; el resto va progresivo, "de a una app, no tiene que quedar perfecto". Hace falta un sistema que **genere la doc desde el código** (para que no mienta), **preserve lo que solo sabe el humano** (criticidad, quiénes la usan, proceso manual alternativo), y **se mantenga vivo solo** con el mismo ritual que el resto de la doc — sin ensuciar los `docs/` de trabajo del método ni el repo canónico del kit.

## Alcance (IN / OUT) — v1 es SOLO el lado documentación
Este SPEC construye **una sola capa: el motor por repo y sus enganches**. El inventario central (Excel, Mapa, hub) queda diseñado pero fuera de v1 — está al final, en "Fase 2".

**IN (v1 — lo que este SPEC construye):**
- **(a)** La skill global `/docs-fyd`: motor per-repo que arma los **10 artefactos** (prompts 1-10 de FyD) en `docs-fyd/` + el `README.md` de la raíz, regenerable, con la bóveda de negocio `_CAMPOS-NEGOCIO.md` read-only, y **con todos los fixes anti-secretos aplicados**.
- **(b)** El **paso de frescura** en el `/cierre-plantilla` de cada proyecto: cuando la sesión tocó algo de la watchlist, marca `docs-fyd/ESTADO.md` = PENDIENTE (no regenera). Es la parte de "se mantiene al día como la otra doc".
- **(c)** La **instalación vía el Equipador**: `menu-skills.md`, `INSTALAR.md` y `arquitecto-skills/SKILL.md` aprenden a instalar/actualizar `/docs-fyd` (copiar del kit local, no clonar).
- **(d)** La **siembra-con-pregunta** en el Arquitecto Modo A (Paso 5): al arrancar un proyecto nuevo el Arquitecto **pregunta** si el proyecto lleva los dos sistemas o solo el del método; si lleva los dos, siembra `docs-fyd/`.
- **(e)** El **diff canónico del repo madre** pasa de 3 a **4 rutas** (+`kit/skills/docs-fyd`).

**OUT (v1) — diferido a Fase 2 (diseño conservado al final del SPEC):** la skill `/inventario-fyd`, el Excel `Inventario_Aplicaciones.xlsx`, el `Mapa_de_Servicios.md`, el hub central privado y `accesos.md`, y los asks operativos (alta de colaboradores, Bitwarden). Con ellos se difiere también el gate de repo-privado del hub. Mientras tanto el Excel lo resuelve Guido a mano con prompts contra su Kanban (ver Fase 2).

## Contexto del código (de la exploración — nombres REALES)
- **El repo es vibe-kit**; `kit/` es LA fuente canónica. Se sincroniza a `~/.claude/` con `diff -r` y hoy el diff canónico cubre **3 rutas**: `kit/skills/arquitecto`, `kit/skills/arquitecto-skills`, `kit/agents/redteam-spec.md`. Regla dura: "sin diff limpio no hay cierre".
- **El Arquitecto** (`kit/skills/arquitecto/SKILL.md`): Modo A monta el proyecto en 6 pasos; el **Paso 5** instancia `templates/universales/` (CLAUDE.md, `docs/`, skills `/inicio` y `/cierre`, hooks) — su orden interno es: SPEC-0 final → scaffolding → git init → **"Sistema del playbook"** → **"Primer commit"** → checklist. El **Paso 6** cierra con un chequeo de 5 segundos que avisa qué skills del menú faltan. Modo B produce specs **delta**.
- **El Equipador** (`kit/skills/arquitecto-skills/SKILL.md` + `menu-skills.md`): modos INSTALAR / ACTUALIZAR / AUDITAR / AGREGAR. **Regla de oro 2 = clonado fresco** (`git clone --depth 1` a temp → copiar → borrar), con **una única excepción hoy documentada: shadcn** (viene por CLI, no git). `menu-skills.md` es la fuente de verdad (Tier 1 / Tier 2 / Descartadas-con-razón / Integradas); nada se instala si no está en el menú.
- **INSTALAR.md** (`kit/INSTALAR.md`): bootstrap por zip; verifica que existan `skills/arquitecto/`, `skills/arquitecto-skills/`, `agents/redteam-spec.md` y los copia a `~/.claude/`.
- **El /cierre-plantilla per-proyecto** (`kit/skills/arquitecto/templates/universales/skills/cierre/SKILL.md`): 11 pasos. El **trío base (pasos 2-4: HANDOFF/CHANGELOG/TODO) es incondicional**; los **pasos 5-9 son condicionales** (paso 5 "Otros docs de estado", paso 6 "SPECs"). El **`cierre parcial` corre SOLO los pasos 1-2**.
- **CLAUDE.template.md** (`kit/skills/arquitecto/templates/universales/`): tiene la sección `## Mapa de documentación` y el **slot `{{OTROS_DOCS}}` (línea 53)** como punto de extensión. Regla del sistema (línea 55): **"Lo derivable del código o de git NO se escribe en un doc."**
- **El hook** `session-start.sh`: catea `docs/SESSION_HANDOFF.md` + `head -40 docs/TODO.md` + git. **No conoce `docs-fyd/`.**
- **Los rituales del repo madre** (`.claude/skills/cierre/SKILL.md` e `.claude/skills/inicio/SKILL.md`): ambos corren el `diff -r` de las 3 rutas canónicas; el /inicio lo llama "el drift más peligroso de este repo".
- **Verificado por grep: `docs-fyd` no aparece en NINGÚN archivo del kit hoy (0 hits).** Los prompts de FyD tampoco existen. Se construye de cero.

## AGREGA (lo nuevo)
Skill `docs-fyd` — el **motor per-repo** (kit-owned, global). Es TODO lo que se agrega en v1:

- **`kit/skills/docs-fyd/SKILL.md`** — motor de los **10 artefactos de FyD** (prompts 1-10): `ficha-producto.md`, `README.md` (raíz), `c1-contexto.md`, `c2-contenedores.md`, `c3-componentes.md`, `secuencia.md`, `diagrama-er.md`, `variables-entorno.md`, `instrucciones-ia.md`, `revision-seguridad.md`. **2 modos**:
  - `docs-fyd` (genera/regenera idempotente).
  - `docs-fyd auditar` (dry-run, **cero escrituras**: reporta qué quedó viejo + qué campos `[completar]` de negocio faltan; y es el ÚNICO lugar donde puede aparecer el detalle archivo:línea de un secreto — ver regla de oro 2 y artefacto #10). **También revisa `_CAMPOS-NEGOCIO.md`** y avisa si detecta algo que parezca un valor de credencial escrito a mano (no lo borra, solo lo reporta para que lo saques antes de entregar) — defensa en profundidad detrás de la advertencia de la bóveda.
  - **Write-set CERRADO** = `docs-fyd/**` + `README.md` de la raíz. Nada fuera de ahí.
- **6 reglas de oro del motor** (viven en el SKILL):
  1. **Aislar `docs/`**: lo LEE para derivar el artefacto #9 (instrucciones-ia), pero JAMÁS escribe en `docs/`, `CLAUDE.md` ni `.claude/` del repo destino.
  2. **Secretos solo por nombre, en TODA la superficie de escritura.** Ante un secreto en **cualquier** fuente que el motor lea —código, `.env`/`.env.*`, `CLAUDE.md`, y **configs de deploy/CI/infra** (docker-compose, manifiestos k8s, terraform, workflows de CI: el lugar #1 de secretos inline)—: reporta solo su ubicación al humano y **nunca transcribe el valor** en **NINGUNO de los 10 artefactos** de `docs-fyd/**` (sin excepción — el cepillo corre sobre cada artefacto antes de escribir, no solo sobre env/IA; ojo con `c2-contenedores.md`, que se deriva de esos configs de deploy). De cualquier archivo o bloque de entorno (`.env`, el `environment:` de docker-compose, los `env` de CI) se toma **solo el nombre** — se corta todo a la derecha del `=`; ningún artefacto contiene texto a la derecha de un `=` ni un valor entre comillas.
  3. **Sin stack por defecto.** Si no puede determinar el stack por evidencia real, escribe "NO DETERMINADO" + con qué lo buscó. Nunca inventa un stack.
  4. **No pisar la bóveda de negocio.** `_CAMPOS-NEGOCIO.md` es read-only para el motor; regenerar arrasa solo lo derivado del código. **Como el motor NO le pasa el cepillo (es read-only) y su contenido aflora en ficha/README entregables a FyD, la bóveda lleva arriba de todo la advertencia: "NUNCA escribas una contraseña, token o clave acá —ni siquiera en 'proceso manual alternativo'—; solo DÓNDE está guardada. Este archivo se commitea y se entrega a la auditora."**
  5. **Evidencia o "NO DETERMINADO".**
  6. **Los 10 siempre se escriben.** Cada artefacto existe en cada corrida: derivado si hay fuente, o con una nota "no aplica + razón" si no la hay (no solo `c3`). A FyD nunca le falta un documento.
- **Artefacto #9 (`instrucciones-ia.md`) — NO copia el `CLAUDE.md` del repo destino verbatim.** Embebe **estructura/punteros** (secciones y a qué apuntan), y ANTES de escribir pasa el **mismo cepillo anti-secretos** que `variables-entorno.md`. Así un secreto pegado a mano en un `CLAUDE.md` no puede terminar en `docs-fyd/` (que se commitea y se entrega a FyD).
- **Artefacto #10 (`revision-seguridad.md`) — el entregable (trackeado en git) lista SOLO categoría + cantidad + acción "rotar y sacar del código".** El detalle `archivo:línea` de cada hallazgo va **únicamente al reporte transitorio del modo `auditar`** que ve Guido en pantalla — nunca a un `.md` committeado.
- **`docs-fyd/ESTADO.md`** — el motor lo escribe/limpia: fecha de la última regeneración + limpia el flag PENDIENTE.
- **`kit/skills/docs-fyd/deteccion.md`** — anexo stack-agnóstico: tabla de señales (manifiestos→framework / migraciones→ER / configs deploy→contenedores / `.env`+grep→env / archivos-IA→#9 / SDKs→servicios). Se amplía sin tocar el SKILL.
- **`kit/skills/docs-fyd/prompts-fyd.md`** — el **contrato de contenido**: los 10 prompts originales de FyD (qué secciones/campos lleva cada artefacto), copiados de `docs/referencia-prompts-fyd.md` (extraídos del `.docx` del encargo 2026-07). La sesión que construye **NO inventa el formato**: sigue estos prompts al pie.
- **`kit/skills/docs-fyd/plantillas/`** — esqueletos de los 10 artefactos + `_CAMPOS-NEGOCIO.md` (bóveda) + `ESTADO.md` + `LEEME.md`. **Cabecera de procedencia** en cada artefacto derivado: "generado por /docs-fyd AAAA-MM-DD — se regenera, no editar a mano; negocio en `_CAMPOS-NEGOCIO.md`". El template de `_CAMPOS-NEGOCIO.md` y su `LEEME.md` llevan arriba la **advertencia de no escribir valores de credenciales** (ver regla de oro 4). Los dos archivos NO-arrasados: `_CAMPOS-NEGOCIO.md` (bóveda) y `ESTADO.md` (solo fecha + flag).

## MODIFICA (lo existente que se toca — cada uno con su efecto colateral)
- **`kit/skills/arquitecto/templates/universales/skills/cierre/SKILL.md`** — se inserta **UN paso condicional de frescura FyD** en la franja condicional (tras el paso 5 "Otros docs de estado", antes del 6 "SPECs"), gateado por "existe `docs-fyd/`". El paso **corre su propio `git diff --name-only` (working tree) + `git log --name-only` de los commits de la sesión** — costo trivial, **NO** depende de lo que el paso 1 haya sacado — y cruza esos archivos contra una watchlist chica (migraciones/schema, manifiestos, env/config, instrucciones-IA, infra/deploy); si hay match, escribe `docs-fyd/ESTADO.md` = PENDIENTE REGENERAR (fecha + categorías). **Efecto colateral a cuidar**: NO corre los prompts pesados, NO reescribe `.md` de `docs-fyd/` ni campos `[completar]`, NO toca `docs/`; por ser paso ≥3 **NO corre en `cierre parcial`** (dejarlo explícito para que un `/compact` a mitad de misión no lo espere); el **trío base (pasos 2-4) queda idéntico**.
- **`kit/skills/arquitecto-skills/menu-skills.md`** — **una fila Tier 1 kit-owned** (`docs-fyd`) con Origen "copiar del kit local, NO clonar de repo externo" + cicatriz "encargo FyD 2026-07", documentando la **2da excepción** a clonado-fresco (la 1ra es shadcn). **Efecto colateral**: sin esa fila, el Modo AUDITAR del Equipador la marcaría como "desconocida"; tocar el menú es cambio al kit → dispara sync+diff+commit (la copia instalada del menú debe quedar idéntica aunque la skill no esté instalada en esa PC).
- **`kit/INSTALAR.md`** — sumar `skills/docs-fyd/` al copiado a `~/.claude/` (paso 2). **Efecto colateral**: en la verificación "si falta, frená" se suma como **copiar-si-está**, no como requisito duro — una PC con un zip viejo sin esa carpeta NO debe frenar el bootstrap del Arquitecto.
- **`kit/skills/arquitecto-skills/SKILL.md`** — enseñar a INSTALAR/ACTUALIZAR a manejar una entrada **kit-owned**: copiar del kit local (o del hermano Arquitecto ya instalado), nunca `git clone`; en ACTUALIZAR mostrar el diff antes de pisar (regla de oro 3). **Efecto colateral**: la excepción debe quedar **ACOTADA a `docs-fyd`** y solo en máquinas consumidoras — no puede aflojar la regla de oro 2 (clonado fresco) para el resto del menú; en el repo madre el sync lo hace `/cierre`, no el Equipador.
- **`kit/skills/arquitecto/SKILL.md`** — Modo A **Paso 5**: substep nuevo de **siembra CON PREGUNTA** (tras "Sistema del playbook", antes de "Primer commit"). El Arquitecto **pregunta**: *"¿este proyecto lleva los dos sistemas (el de trabajo del método + el de documentación `docs-fyd`) o solo el mío (solo el del método)?"*.
  - Si **"los dos"** y `/docs-fyd` está instalado: invoca `/docs-fyd` una vez, **pre-carga `_CAMPOS-NEGOCIO.md` desde el SPEC-0** (la entrevista ya conoce **función/quiénes/criticidad**; el 4º campo, "proceso manual alternativo", PUEDE quedar `[completar]` salvo que la entrevista lo haya capturado — el criterio #9 pide "negocio precargado", no "cero `[completar]`"), y registra la **fila-puntero** de `docs-fyd/` en el slot `{{OTROS_DOCS}}` del CLAUDE.md.
  - Si **"solo el mío"**: no siembra nada.
  - Si **"los dos" pero `/docs-fyd` NO está instalado**: deja un stub + nota y **no rompe el montaje**.
  - Extender el chequeo de 5 seg del **Paso 6** para avisar si `/docs-fyd` falta.
  - **Efecto colateral**: el substep debe dejar **CERO `{{...}}`** en el CLAUDE.md; **registra+dispara, no duplica el motor** (el molde single-source vive en la skill global).
- **`.claude/skills/cierre/SKILL.md`** (repo madre) — Paso 1: sumar `kit/skills/docs-fyd` al `cp -r` de sync y al `diff -r` de verificación. **Efecto colateral**: el diff canónico pasa de **3 a 4 rutas**; "sin diff limpio no hay cierre" ahora lo cubre.
- **`.claude/skills/inicio/SKILL.md`** (repo madre) — sumar la ruta `kit/skills/docs-fyd` al `diff -r` de drift. **Efecto colateral**: detecta edición directa a `~/.claude/` o cierre a medias en la skill nueva.
- **`docs/DECISIONS.md`** (repo madre) — **ADR-014 YA ESTÁ ESCRITO** (en el cierre del diseño, 2026-07-23): captura `docs-fyd/` como build-artifact regenerable exento de "lo derivable del código no se escribe a mano" + la decisión estratégica completa. **La sesión que construye NO crea un ADR** salvo que aparezca una decisión nueva durante el build. *(El ADR del hub central es Fase 2 — ver al final.)*

**Nota de liberación (cómo se construye este delta):** ejecutar este SPEC = editar `kit/` + las skills del repo madre; se cierra con el ritual del repo madre — sync `kit/` → `~/.claude/`, `diff -r` **de las 4 rutas** limpio, commit+push (ADR-014 ya existe, no se duplica).

## Datos del usuario: esto cambio / esto preservo
El motor toca dos clases de dato humano; la regla del método exige declararlo y aprobarlo:

| Dato del usuario | Esto cambio | Esto preservo |
|---|---|---|
| 4 campos de negocio (función, quiénes, criticidad, proceso manual alt.) | Nada: viven en `_CAMPOS-NEGOCIO.md`, archivo-bóveda **read-only** que el motor nunca pisa | Intactos entre regeneraciones; regenerar arrasa solo lo derivado del código |
| README de la raíz preexistente escrito a mano | Solo si tiene el marcador de procedencia (propio) o está ausente | Si hay README humano SIN marcador: NO lo pisa, muestra qué cambiaría y pide confirmación (una vez) |
| `docs/` de trabajo del método, CLAUDE.md, `.claude/` | Nada | El write-set de `docs-fyd` es EXACTAMENTE `docs-fyd/**` + README raíz; verificable con `git status` |

## NO SE TOCA (obligatoria — el seguro de no romper)
- **Los `docs/` de trabajo del método** (`SESSION_HANDOFF.md` / `TODO.md` / `CHANGELOG.md`), en el repo madre y en `templates/universales/docs/`: intactos. `docs-fyd/` está AISLADO por decisión de Guido.
- **El trío base del /cierre-plantilla (pasos 2-4) y el `cierre parcial` (pasos 1-2)**: intactos. El paso de frescura FyD es ≥3 y condicional; no altera el ritual liviano.
- **El hook `session-start.sh`**: sigue inyectando solo handoff + cabecera del TODO + git. `docs-fyd/` se lee **bajo demanda**, no se inyecta (es derivable del código → la regla prohíbe inyectarlo).
- **El `/inicio` per-proyecto** (`templates/universales/skills/inicio/SKILL.md`): no cruza `docs-fyd/` (no es contexto de arranque). Su lógica queda igual.
- **`CLAUDE.template.md`**: el molde no se edita; solo se usa el slot `{{OTROS_DOCS}}` al instanciar. El CLAUDE.md queda como puntero puro (anti-espejo, cero copias de prompts).
- **La regla de oro 2 del Equipador (clonado fresco)** para todo lo que NO es kit-owned: intacta. La excepción nueva es acotada a `docs-fyd`.
- **El `menu-skills.md` como fuente de verdad** y sus secciones (Tier 1/2/Descartadas/Integradas): se agrega 1 fila, no se reescribe la estructura ni las reglas de curaduría.
- **La invariante de secretos del método** ("secretos nunca a un archivo persistente"): los 10 artefactos de `docs-fyd/**` (sin excepción) listan SOLO nombres y DÓNDE; nunca el valor.
- **Los `docs/` y `CLAUDE.md`/`.claude/` de los repos destino de `docs-fyd`**: la skill los LEE para derivar el #9, pero NUNCA escribe ahí.
- **Los 3 formatos de spec, el PLAYBOOK-MAESTRO, las actas de `tips/`, el Extractor**: fuera de este encargo, sin cambios.

## Criterios de aceptación (verificables)
1. **[Regresión — el criterio #1]** Todo lo listado en NO SE TOCA sigue funcionando igual que antes: el `diff -r` de las 3 rutas canónicas viejas sigue limpio; un proyecto existente SIN `docs-fyd/` corre `/cierre` (completo y parcial), `/inicio` y el hook `session-start.sh` con comportamiento idéntico al de hoy.
2. CUANDO corro `/docs-fyd` en un repo, el sistema DEBE escribir SOLO dentro de `docs-fyd/**` + `README.md` de la raíz — verificable con `git status`: cero cambios fuera de esos paths.
3. CUANDO regenero (`/docs-fyd` por 2da vez) después de editar `_CAMPOS-NEGOCIO.md`, el sistema DEBE conservar intactos los 4 campos de negocio y actualizar en `ESTADO.md` la fecha + limpiar el flag PENDIENTE.
4. **[Secretos — toda la superficie]** SI `/docs-fyd` detecta un secreto en CUALQUIER fuente que lee (código, `.env`/`.env.*`, `CLAUDE.md`, y configs de deploy/CI/infra: docker-compose, manifiestos k8s, terraform, workflows de CI), ENTONCES DEBE reportar solo su ubicación al humano y NO transcribir el valor en NINGUNO de los 10 artefactos de `docs-fyd/**` (sin excepción — incluidos c1/c2/c3/secuencia/ER, no solo env/seguridad/ficha/README/instrucciones-ia). Verificable además: ningún artefacto contiene texto a la derecha de un `=` ni un valor entre comillas (parseo de `.env` y de los bloques `environment:`/`env` = solo el nombre).
5. CUANDO no puede determinar el stack por evidencia real, el sistema DEBE escribir "NO DETERMINADO" + con qué lo buscó, nunca inventar un stack por defecto. Y **los 10 artefactos DEBEN existir siempre** bajo `docs-fyd/` — cada uno derivado si hay fuente, o con una nota "no aplica + razón" si no la hay (no solo `c3-componentes.md`) → **a FyD nunca le falta un documento**.
6. **[Frescura]** CUANDO `/cierre` corre en un proyecto con `docs-fyd/` y la sesión tocó un archivo de la watchlist, el sistema DEBE marcar `docs-fyd/ESTADO.md` = PENDIENTE REGENERAR (fecha + categorías) SIN regenerar, SIN invocar ningún motor y SIN tocar `docs/`. La detección DEBE correr su propio `git diff --name-only` + `git log --name-only` (no reutilizar como dado lo del paso 1).
7. **[Artefacto #9]** El `instrucciones-ia.md` generado NO DEBE contener una copia verbatim del `CLAUDE.md` del repo destino: embebe estructura/punteros y pasó el cepillo anti-secretos antes de escribirse.
8. **[Artefacto #10]** El `revision-seguridad.md` trackeado en git DEBE listar solo categoría + cantidad + acción "rotar y sacar del código"; el detalle `archivo:línea` DEBE aparecer únicamente en el reporte transitorio de `docs-fyd auditar`, nunca en un `.md` committeado.
9. **[Siembra i]** CUANDO monto un proyecto NUEVO con `/docs-fyd` instalado y respondo "los dos", el sistema DEBE dejar `docs-fyd/` sembrado, el negocio precargado desde el SPEC-0, y **CERO `{{`** en el `CLAUDE.md`.
10. **[Siembra ii]** CUANDO monto un proyecto NUEVO y respondo "solo el mío", O `/docs-fyd` no está instalado, el montaje DEBE completar igual, dejar stub + nota si corresponde, y NO romperse.
11. **[Instalación iii]** CUANDO corro INSTALAR con un zip viejo SIN la carpeta `docs-fyd/`, el bootstrap NO DEBE frenar (copiar-si-está).
12. **[README humano]** SI existe un `README.md` a mano SIN marcador de procedencia, `/docs-fyd` NO DEBE pisarlo: muestra el diff y pide confirmación una sola vez.
13. **[Repo madre]** CUANDO cierro una sesión del repo madre que tocó `kit/skills/docs-fyd`, el `diff -r` de las **4 rutas** DEBE dar limpio (sin diff limpio no hay cierre).
14. **[Contenido FyD]** Cada uno de los 10 artefactos DEBE seguir el prompt de FyD correspondiente (secciones/campos de `kit/skills/docs-fyd/prompts-fyd.md`), no un formato inventado.

## Las 5 preguntas (respuesta explícita para Guido)
**1) ¿Qué skill voy a tener que correr?** **UNA sola: `/docs-fyd`** (por repo). Nada más — el resto lo dispara el Arquitecto (siembra) o el /cierre (frescura) solos. *(El inventario central `/inventario-fyd` es Fase 2 — ver al final.)*

**2) ¿En qué orden?**
- *Repo que ya existe*: corrés `/docs-fyd` → el humano completa los `[completar]` de negocio en `_CAMPOS-NEGOCIO.md` → commit.
- *Proyecto nuevo*: no corrés nada — el Arquitecto **te pregunta** si el proyecto lleva los dos sistemas o solo el suyo; si decís "los dos", **lo siembra en el Paso 5** con los campos de negocio ya cargados desde el SPEC-0.
- *El inventario central (Excel + Mapa)*: **es Fase 2, no se construye ahora.** Mientras tanto lo armás vos con prompts contra tu tablero Kanban (que ya es tu fuente de verdad de proyectos/servicios/costos) — la lista de columnas que necesita el Excel está documentada en la sección Fase 2.

**3) ¿Qué hace `/docs-fyd`?** Detecta el stack por evidencia, **deriva del código** 8 artefactos (c1, c2, c3, secuencia, ER, env, IA, seguridad), **ensambla** ficha-producto y README (derivado + negocio), y **preserva** la bóveda `_CAMPOS-NEGOCIO.md`. Modo `auditar` = dry-run que te dice qué quedó viejo antes de entregar (y es el único lugar donde ves el detalle archivo:línea de un secreto).

**4) ¿Cómo garantizamos que esos repos tengan la documentación necesaria?** Dos redes en v1: (a) `docs-fyd/` es **regenerable** — se corre a mano en los repos que ya existen; (b) en proyectos nuevos **se siembra día-cero** por el Arquitecto (si respondés "los dos"), así nace con la doc puesta. *(El reporte de cobertura del CENSO cross-proyecto es Fase 2.)*

**5) ¿Cómo se mantiene al día sola, como el resto de la doc?** El `/cierre` de cada proyecto, en un paso condicional nuevo (solo si existe `docs-fyd/`), corre su propio `git diff --name-only` + `git log --name-only` y cruza lo que la sesión tocó contra una watchlist chica (migraciones, manifiestos, env, instrucciones-IA, deploy). Si tocaste algo relevante, **marca `ESTADO.md` como PENDIENTE REGENERAR** — igual que STATUS: toca el estado, no re-cuenta. La regeneración pesada la corrés vos on-demand con `/docs-fyd` (que limpia el flag), y el modo `auditar` + el gate "regenerá antes de entregar a FyD" son la red final. El /cierre **marca**, no regenera.

## Supuestos
- **[ALTO]** Asumimos que los repos destino ya tienen su sistema del método (o al menos git). Si no lo tienen, `/docs-fyd` igual escribe `docs-fyd/` + README, pero la frescura vía `/cierre` no aplica hasta montar el sistema. (Si está mal: el "resto progresivo" corre standalone + gate manual "regenerá antes de entregar".)
- **[ALTO]** Asumimos que los 4 campos de negocio salen de la entrevista (proyecto nuevo) o del humano (existente); el motor nunca los inventa. (Si está mal: la ficha queda con `[completar]` y hay que completarla a mano — no rompe, avisa.)
- **[BAJO]** Asumimos que el marcador de procedencia del README es un comentario HTML (invisible al lector, detectable por el motor).

## Riesgos y decisiones ⚠️
- ⚠️ **`docs-fyd/` es build-artifact regenerable, EXENTO de "lo derivable del código no se escribe en un doc"** (ADR-014). Consecuencia: es la nota-de-desvío central del método, va en cada `LEEME.md`; revertirla obliga a borrar la excepción y decidir qué pasa con los `docs-fyd/` ya sembrados en N repos (reversión mediana). Se justifica porque es **entregable EXTERNO para auditores que no leen código**, y una vista regenerada no miente (el /cierre la marca vieja, /docs-fyd la reconstruye).
- ⚠️ **Campos de negocio en archivo-bóveda aparte (`_CAMPOS-NEGOCIO.md`) read-only, NO en bloques marcados dentro de la ficha.** Consecuencia: cambiar a marcadores HTML después obliga a migrar todas las fichas sembradas y reescribir la lógica de preservación. Se elige la bóveda porque es a-prueba-de-balas: regenerar arrasa todo lo derivado sin riesgo de tocar un valor humano.
- ⚠️ **README raíz protegido por marcador de procedencia (comentario HTML).** Consecuencia: es el único artefacto fuera de `docs-fyd/` y el único que puede pisar contenido humano; si se saca el marcador se pierde el seguro y se puede borrar un README escrito a mano. Regenera libre si es propio/ausente; si hay humano sin marcador, confirma una sola vez.
- ⚠️ **Invariante de secretos en TODA la superficie de escritura: los 10 artefactos de `docs-fyd/**` (sin excepción) listan SOLO nombres y DÓNDE; ante secreto en cualquier fuente (código, `.env`/`.env.*`, `CLAUDE.md`, y configs de deploy/CI/infra: docker-compose, k8s, terraform, CI), reporta ubicación al humano y frena, nunca el valor.** Ojo especial con `c2-contenedores.md`, que se deriva de los configs de deploy (donde más aparecen secretos inline). Todo bloque de entorno se parsea por nombre (se corta a la derecha del `=`); el #9 pasa el mismo cepillo antes de escribir. Consecuencia: si se afloja, el propio doc de seguridad se vuelve la fuga que denuncia. Verificable por criterio #4.
- ⚠️ **[NUEVO — irreversible] El historial de git es permanente.** Un secreto colado en un artefacto ya committeado **no se borra sin reescribir historia** en N repos (`git filter-repo` / re-push forzado) — casi imposible una vez que se distribuyó. Por eso el gate anti-secretos frena **ANTES de escribir**: no hay "lo arreglo en el próximo commit".
- ⚠️ **Distribución kit-owned: el Equipador pasa a poder tocar 1 skill kit-owned (`docs-fyd`), solo en máquinas consumidoras y con diff-antes-de-pisar; COPIA del kit local, nunca clona repo externo.** Consecuencia: es la 2da excepción a clonado-fresco (análoga a shadcn); si se generaliza, se rompe la regla de oro 2 del Equipador.
- ⚠️ **El /cierre DETECTA y MARCA staleness, NO regenera ni invoca ningún motor.** Consecuencia: la frescura real depende de correr `/docs-fyd` antes de entregar a FyD (gate manual). Se decide así porque regenerar ~10 docs (Mermaid/C4/ER/seguridad) en cada cierre encarece el ritual liviano de gusto, y FyD necesita un snapshot correcto AL ENTREGAR, no frescura por-sesión.
- ⚠️ **Nombre con el cliente (`/docs-fyd`) en vez de neutro.** Consecuencia: si aparece un 2do cliente, renombrar una skill global instalada en 2 PCs cuesta (mover carpeta + línea de menú + INSTALAR + re-sync). Decidido YAGNI: se paga barato después y solo si aparece el 2do cliente.
- ⚠️ **`docs-fyd/` se trackea en git** (es deliverable + `ESTADO.md` debe persistir entre sesiones). Consecuencia: se acepta el ruido de un diff chico de `ESTADO.md` por cada sesión que toca la watchlist; la siembra debe confirmar que `docs-fyd/` NO caiga en `.gitignore`.

---

## Fase 2 — fuera de v1 (diseño conservado, NO construir)
Todo esto quedó diseñado y validado, pero **no se construye en v1**. Se guarda acá para no perderlo. Cuando se encare, es su propio delta con su propio red-team y su propio ADR.

**Lo que se difiere:**
- **Skill `/inventario-fyd`** — el motor central cross-proyecto (kit-owned, global). 3 modos:
  - **CENSO**: descubre repos con `docs-fyd/ficha-producto.md` bajo la carpeta de proyectos → arma el Excel de 2 hojas + **reporta cobertura** (qué repos conocidos aún no tienen ficha).
  - **MAPA**: artefacto 11 — lee la hoja Servicios → `Mapa_de_Servicios.md` en Mermaid, subgraph por cuenta titular.
  - **CHECKLIST**: los asks operativos como lista humana, **nunca ejecuta cambios de acceso** (alta de `marcelo@fydsistemas.com.ar` y `smarcello@fydsistemas.com.ar` como colaboradores en GitHub/Vercel/Supabase/tiendas; cargar en Bitwarden, a nombre de Ricardo, las credenciales sin usuario).
  - Anexo `columnas.md` = EL CONTRATO (columnas exactas, mapeo `ficha-producto.md`→Inventario, clave de join, spec del Mermaid).
  - Templates del hub: `accesos.md` (titular + DÓNDE viven las credenciales, nunca el valor), `README.md`, `.gitignore`.
- **El Excel `Inventario_Aplicaciones.xlsx` y el `Mapa_de_Servicios.md`** — generados por `/inventario-fyd`, viven en el **hub central**.
- **El hub central** — repo git **PRIVADO propio** (default `C:/Users/Usuario/Desktop/Auditoria-FyD`), FUERA del vibe-kit y FUERA del diff canónico. Su ADR (hub privado propio, dato del cliente nunca entra al repo del método) se escribe al construir Fase 2.
- **El gate de repo-privado del hub** (finding del red-team) — se **difiere con el hub**: antes de escribir/pushear `accesos.md`, verificar la visibilidad real del remoto (ej. `gh repo view --json visibility`); si es público o no se puede confirmar, FRENAR y pedirle a Guido que lo ponga privado. Un comentario en `.gitignore` NO hace privado un repo, y `accesos.md` revela titular + ubicación de credenciales. Es tema de v2 junto con el hub.
- **El diff canónico del repo madre** sumaría `kit/skills/inventario-fyd` (pasaría de 4 a 5 rutas) al construir Fase 2.

**Nota para Guido — cómo resolver el Excel MIENTRAS TANTO (sin la skill):**
El Excel lo armás vos con prompts contra tu **tablero Kanban** (que ya es tu fuente de verdad de proyectos/servicios/costos). NO hace falta construir la skill para tener el entregable a tiempo. La info que necesita el Excel es:
- **Hoja Inventario** (1 fila por app): Aplicación · Función · Quiénes la usan · Criticidad · Proceso manual alternativo · Tecnologías · Servicios/Proveedores · Repositorio (URL + rama) · link a la doc (`docs-fyd/`).
- **Hoja Servicios y Accesos** (1 fila por App+Servicio): Servicio/Proveedor · Aplicación · Proyecto/Instancia · Tipo · Cuenta titular · Credenciales (**solo DÓNDE está guardado, nunca el valor**) · Observaciones.

---
**Gate:** este SPEC está en **READY** — **APROBADO** tras **tres rondas de red-team** (diseño → re-verificación → aprobación final). Todos los hallazgos están foldeados en artefactos y criterios: el cierre del camino de fuga por configs de deploy (`c2-contenedores.md`), la advertencia anti-credenciales de la bóveda + su escaneo en `auditar`, la garantía de que los 10 artefactos existen siempre, y el contrato de contenido (`prompts-fyd.md` ← `docs/referencia-prompts-fyd.md`). Una sesión fresca lo ejecuta como delta del kit y lo cierra con el ritual del repo madre (sync → `diff -r` de las 4 rutas limpio → commit+push; ADR-014 ya está escrito).