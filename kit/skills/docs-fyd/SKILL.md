---
name: docs-fyd
description: Documentación técnica de auditoría FyD por repositorio — genera los 10 artefactos que pide FyD Sistemas (ficha, README, diagramas C4, ER, variables de entorno, seguridad) DESDE el código, en una carpeta aislada docs-fyd/. Cuando duda de algo importante NO adivina: le da OPCIONES al humano para elegir (backups, RLS, base compartida, tokens); lo humano vive en una capa protegida que la regeneración nunca pisa; y se controla solo antes de entregar. Usar cuando el usuario dice "docs-fyd", "documentá para FyD", "la doc de auditoría", "generá la documentación técnica de este repo", o corre "docs-fyd auditar". Se corre por-repo, DENTRO de la carpeta del proyecto. NO usar para los docs de trabajo del método (esos son /inicio y /cierre).
---

# `/docs-fyd` — documentación técnica de auditoría FyD (por repositorio)

Sos el motor que arma, DESDE el código de ESTE repositorio, los 10 artefactos que pide la auditora
**FyD Sistemas** para que un equipo externo pueda levantar el proyecto si el autor desaparece.
Derivás del código lo que el código sabe (para que no mienta); cuando **dudás de algo importante NO
adivinás — le das opciones al humano para elegir**; preservás lo que solo sabe el humano en una capa
protegida que nunca pisás; te controlás solo antes de entregar; y dejás todo **aislado** en `docs-fyd/`.

> Por qué existe: ADR-014. Por qué v2 (dudas por opciones + capa humana protegida): ADR-015. Acá vive
> solo el motor.

## Dónde corrés y qué escribís

- Corrés **DENTRO de la carpeta del repositorio a documentar** (uno por vez). Si te invocan desde otro
  lado, pedí abrir el chat ahí — derivás del código real, no de rutas remotas.
- **Write-set CERRADO — la línea que no cruzás**: escribís SOLO en `docs-fyd/**` + `README.md` de la
  raíz. Nada más. **Antes de terminar corrés `git status` del repo destino y FRENÁS si hay UN solo
  cambio fuera de esos paths.** Si algo te tienta a escribir en `docs/`, `CLAUDE.md` o `.claude/` del
  repo destino → es un bug, frená.

## Dos modos

- **`docs-fyd`** (genera / regenera): deriva del código, **resuelve las dudas por opciones**, ensambla
  con la bóveda y `_ACLARACIONES.md`, se auto-verifica, escribe `docs-fyd/**` + README raíz, sella la
  fecha en `ESTADO.md`. **Idempotente**: correrlo dos veces da lo mismo (salvo que el código cambie).
  Regenerar arrasa solo lo derivado del código — **la bóveda, `_ACLARACIONES.md` y `ESTADO.md` no**.
- **`docs-fyd auditar`** (dry-run, **CERO escrituras**): no toca ningún archivo. Reporta en pantalla:
  - **dudas aún abiertas / pendientes de responder** (las que quedaron sin resolver),
  - **correcciones a mano que una regeneración haya pisado** (del registro en `_ACLARACIONES.md`),
  - artefactos viejos, campos de negocio en `[completar]`, diagramas Mermaid que no compilan, conteos
    que no cierran y enlaces internos rotos,
  - el **detalle `archivo:línea` de cada secreto hallado** — ÚNICO lugar donde ese detalle aparece,
  - si `_CAMPOS-NEGOCIO.md` / `_ACLARACIONES.md` tienen algo que **parece un valor de credencial**
    escrito a mano (no lo borrás: lo reportás para que lo saque antes de entregar).

  Es la red final del método: *"corré `docs-fyd auditar` antes de entregar a FyD"*.

## Las reglas de oro (no negociables)

1. **Aislás `docs/`.** Lo LEÉS para derivar el #9, pero JAMÁS escribís en `docs/`, `CLAUDE.md` ni
   `.claude/` del repo destino. Tu write-set es `docs-fyd/**` + README raíz, y nada más.
2. **Secretos: solo el nombre, en TODA la superficie de escritura — código Y capa humana.** El cepillo
   (abajo) es la última compuerta antes de cualquier escritura; ningún valor de credencial entra a
   `docs-fyd/**`, venga de un `.env`, de un config de deploy, o de una respuesta del humano.
3. **Sin stack por defecto.** Sin evidencia real → "NO DETERMINADO" + con qué lo buscaste. Nunca inventás.
4. **No pisás lo humano.** La bóveda y **todo archivo `_`** son de escritura restringida: podés
   crearlos si faltan y anexar, pero JAMÁS pisás ni borrás lo que puso una persona (ver "zona `_`").
5. **Evidencia con jerarquía, o "NO DETERMINADO" — nunca un negativo absoluto.** Jerarquía:
   **sistema vivo (testimonio humano en `_ACLARACIONES`, datado) > código > scripts del repo > `docs/`.**
   Donde el código calla sobre un hecho de seguridad/continuidad, JAMÁS escribís "no hay X": escribís
   *"no se encontró X en el código — confirmar"* o lo convertís en duda (nada de "carece de", "sin",
   "ausencia de" tampoco).
6. **Los 10 siempre se escriben.** Cada artefacto existe en cada corrida: derivado, o "no aplica + razón".
   Un diagrama Mermaid roto NO tira el documento (se escribe con un cartel — ver "diagramas"). A FyD
   nunca le falta un documento.
7. **Cuando dudás de algo importante, PREGUNTÁS POR OPCIONES — no adivinás** (ver la sección siguiente).

## La pasada de dudas — POR OPCIONES (el corazón de v2) ⭐

Cuando no podés afirmar algo con confianza, no adivinás y no le pedís al humano que escriba
documentación: le presentás la duda como **pregunta de opción múltiple** (AskUserQuestion) con
**opciones que redactás vos** según el stack. El humano **elige**.

**Dos disparadores:**
- **Reactivo**: cuando ibas a afirmar algo no sostenido por la evidencia, o un negativo por ausencia.
- **Proactivo — la checklist FIJA, SIEMPRE, aunque el código no diga nada** (el silencio del código NO
  exime la pregunta; son los hechos de más valor para una auditoría de continuidad):
  1. ¿Hay **backups** de la base/datos, y dónde viven?
  2. ¿La base tiene **control de acceso por fila (RLS)** o equivalente?
  3. ¿La base es **compartida** con otras apps?
  4. ¿Los **tokens/credenciales** que usa siguen vigentes?

**Cada duda ofrece siempre estas opciones** (además de las respuestas-hecho probables que redactás vos,
todas **sin ningún valor de credencial**):
- **"Investigá acá →"** — el humano te manda a mirar un archivo/config puntual que no consideraste (te
  GUÍA). Vas, investigás eso, y volvés con el dato o con una pregunta más afinada.
- **"No me consta"** — queda como "a confirmar", honesto, sin afirmar nada falso.
- **"Otra"** (texto libre) — el escape raro. **SOLO este camino pasa por el freno anti-prosa** (ver
  anti-secretos): si el texto trae algo que parece credencial, FRENÁS y pedís sacarlo antes de guardar.

**Disciplina y tope (anti-fatiga):** preguntás SOLO en estas categorías — **seguridad · continuidad/
backups · compartición de datos · RLS/permisos · negativo-por-ausencia relevante**. Tope duro de
**≤10 dudas por corrida**, priorizadas por severidad. Todo dato menor no-determinable va a
**"NO DETERMINADO" sin preguntar** (no molestás por una falta de README de submódulo).

**El texto de la duda nunca cita el valor de un secreto** — solo su ubicación (ej. *"confirmá el
contenido de docker-compose línea 12"*, nunca pegando la línea con la contraseña).

**Qué se guarda:** la **opción elegida** (un hecho normalizado que redactaste vos) se anexa a
`_ACLARACIONES.md` con su clave, y se funde en el artefacto que corresponde. Los hechos de la checklist
proactiva afloran en una nota rotulada **"Continuidad y acceso a datos (confirmado por el operador)"**
dentro de `ficha-producto.md` / `revision-seguridad.md` (es un agregado rotulado, no reescribe las
secciones de los prompts de FyD).

**Modo no-interactivo (siembra del Arquitecto, Paso 5):** cuando NO hay humano contestando, la pasada
de dudas **NO bloquea** el montaje: **parquea** las dudas como "pendientes de responder" en
`_ACLARACIONES.md` y sigue. El humano las resuelve después en una corrida normal.

## La máquina anti-secretos 🔒

Es lo más crítico del motor. Un secreto en un artefacto ya committeado **no se borra sin reescribir la
historia de git** — casi imposible una vez distribuido. Por eso todo freno actúa **ANTES de escribir**.

**El cepillo (para código y config — el de v1, intacto):** de cualquier bloque de entorno (`.env`, el
`environment:` de docker-compose, los `env:` de CI, terraform, k8s) tomás **solo el nombre** — cortás
TODO a la derecha del `=`. Ningún artefacto contiene texto a la derecha de un `=` ni un valor entre
comillas. Ojo especial con `c2-contenedores.md`, que sale de los configs de deploy (el lugar #1 de
secretos inline). Ante un secreto en cualquier fuente: reportás solo su **ubicación** (el `archivo:línea`
va únicamente al reporte de `auditar`) y **nunca transcribís el valor**.

**El freno anti-prosa (nuevo — para la capa humana):** una respuesta libre ("Otra") es prosa, no
`CLAVE=valor` — el cepillo de arriba NO la cubre. Antes de persistir o fundir cualquier texto libre del
humano, corré un chequeo de credenciales en prosa: **connection strings** (`esquema://user:pass@host`),
las palabras `password/clave/contraseña/pass/pwd/token/secret/key/apikey` seguidas de un valor, strings
largos de alta entropía (base64/hex), bearer tokens, bloques de clave privada, URLs con token embebido.
Si prende → **FRENÁ, no guardes**, y pedile al humano sacar el valor (dejá solo DÓNDE está).

**El cepillo es la ÚLTIMA compuerta antes de CUALQUIER escritura**, sin excepción. Orden del pipeline
(la auto-verificación corre en DOS momentos — ver su sección): **auto-verificación 1ª (surtidor de
dudas) → dudas/opciones → fusión de aclaraciones → auto-verificación 2ª (chequeo final) → cepillo
(env + prosa) → validación Mermaid → escribir → `git status`**. Cualquier artefacto que se toque o
reescriba vuelve a pasar el cepillo. El #9 (`instrucciones-ia`) pasa el cepillo igual que el resto.

## La zona protegida `_` (crear + anexar, nunca pisar)

Regla general (reemplaza el "proteger por nombre" de v1): **cualquier archivo de `docs-fyd/` cuyo
nombre empieza con `_`** es de escritura restringida para el motor:
- **PODÉS** crear su esqueleto desde su plantilla si falta (ej. la bóveda o `_ACLARACIONES.md` en un
  repo fresco), y **PODÉS anexar** entradas nuevas al final.
- **JAMÁS** pisás ni borrás una línea que ya escribió (o eligió) un humano.

Así la persistencia funciona (el motor anexa) sin riesgo de arrasar lo humano. Verificable: un
`_prueba.md` con una línea humana sobrevive intacto una regeneración.

## `_ACLARACIONES.md` — la capa humana (protegida)

El archivo donde vive todo lo que el humano sabe y el código no. Dos secciones:

- **Respuestas a dudas** — una entrada por duda, con **clave estable** = `(artefacto/tema + pregunta
  canónica)`, la **opción elegida** (hecho normalizado), la **fecha**, y una **referencia a la
  evidencia de código** que respondía (archivo/tema). Ej.:
  `RLS · diagrama-er | control de acceso por fila: SÍ (confirmado por operador) | 2026-07-23 | ev: supabase/migrations/`
- **Correcciones a mano** — para lo que el humano edite directo sobre un artefacto derivado (fuera del
  Q&A): fecha · archivos · qué se corrigió · **cómo se verificó**. (Se guarda acá, NO en `ESTADO.md`.)

**Cómo se usa en cada corrida:**
- Al arrancar, leés `_ACLARACIONES.md`. Una duda cuya **clave coincide** con una respuesta guardada
  **NO se re-pregunta**: fundís la respuesta guardada. Ante coincidencia **dudosa o parcial → RE-PREGUNTÁS**
  (nunca asumís que es la misma).
- **Caducidad:** en cada corrida mirás si la evidencia de código que respondía una duda **cambió** desde
  la fecha de la respuesta (ej. `git log --since=<fecha> -- <evidencia>`); si cambió, NO fundís la vieja:
  **re-abrís la duda** (*"antes elegiste X, pero el código cambió — ¿sigue valiendo?"*). Guardá la
  evidencia a nivel **carpeta/tema** (ej. `supabase/migrations/`), no un archivo append-only puntual,
  para que un cambio la dispare. Así la verdad humana tampoco envejece y miente.
- Lleva arriba de todo la **advertencia anti-credenciales** (igual que la bóveda). El motor lo lee y
  funde; lo crea si falta; anexa; **nunca pisa lo humano**.

## Auto-verificación (se controla solo — en DOS momentos)

- **1ª pasada (temprana — surtidor de dudas):** apenas derivás del código, contrastás cada afirmación de
  hecho contra su fuente. Las que **no tienen fuente** alimentan las **dudas reactivas** (junto con la
  checklist proactiva) → se preguntan por opciones, no se degradan en silencio. Es lo que hace que un
  negativo por ausencia se vuelva pregunta y no una mentira.
- **2ª pasada (final — antes de escribir):** sobre el artefacto **ya fusionado** con las respuestas del
  Q&A, dejás el **rastro afirmación → fuente** (una línea por afirmación: *"X = fuente Y (ok)"* o
  *"sin fuente → duda / NO DETERMINADO"*; sin fuente y sin marca = error) y corrés la **consistencia
  interna** (conteos que cierran — ej. "N contenedores" en la prosa = N en el diagrama — y enlaces
  internos que resuelven).
- **Eximís lo humano:** las afirmaciones cuya fuente es `_ACLARACIONES.md` o la bóveda NO necesitan
  respaldo en el código (son testimonio de "sistema vivo", el escalón más alto de la jerarquía) — no las
  conviertas en duda ni entres en loop con ellas.
- **Cierre con `git status`:** si hay UN cambio fuera de `docs-fyd/** + README`, FRENÁ.

## Herramientas auxiliares — fuera del repo

Toda herramienta auxiliar (mermaid-cli para validar diagramas, un venv descartable para `pip-audit`,
`pg_dump`, cualquier script que generes) corre en un **directorio TEMPORAL FUERA del repo objetivo**, o
se borra antes de terminar. **Nada de eso se commitea.** Un `pg_dump` puede volcar datos/credenciales —
jamás dentro del repo.

## Los 10 artefactos — el contrato de contenido

El **qué lleva cada uno** está en `prompts-fyd.md` (verbatim de FyD). Los **esqueletos** en `plantillas/`.
**Seguí los prompts al pie — no inventes el formato.** Todos van a `docs-fyd/`, salvo el README (raíz).

| # | Artefacto | Sale de | Nota |
|---|---|---|---|
| 1 | `docs-fyd/ficha-producto.md` | negocio (bóveda) + código + checklist proactiva | negocio de `_CAMPOS-NEGOCIO.md`; tec/servicios/repo del código; continuidad/acceso del operador |
| 2 | `README.md` (raíz) | código + negocio | único fuera de `docs-fyd/`; protegido por marcador (abajo) |
| 3 | `docs-fyd/c1-contexto.md` | código (usuarios, integraciones) | Mermaid C1 |
| 4 | `docs-fyd/c2-contenedores.md` | configs de deploy | Mermaid C2 — **fuente #1 de secretos: cepillo sí o sí** |
| 5 | `docs-fyd/c3-componentes.md` | módulos internos | Mermaid C3 — "no aplica + razón" si la app es simple |
| 6 | `docs-fyd/secuencia.md` | flujos de negocio | Mermaid secuencia, 2-3 procesos |
| 7 | `docs-fyd/diagrama-er.md` | migraciones / schema / modelos | Mermaid ER |
| 8 | `docs-fyd/variables-entorno.md` | `.env` / código + SDKs | solo nombres + servicios externos |
| 9 | `docs-fyd/instrucciones-ia.md` | `docs/` + `CLAUDE.md` del repo destino | **NO verbatim** (abajo) |
| 10 | `docs-fyd/revision-seguridad.md` | grep de secretos + deps + checklist proactiva | **solo categoría + cantidad** (abajo) |

**Los nombres son los de esta tabla** aunque el prompt de FyD diga `docs/diagramas-secuencia.md` o
`docs/modelo-datos-er.md`: acá van a `docs-fyd/secuencia.md` y `docs-fyd/diagrama-er.md`.

### Artefacto #9 (`instrucciones-ia.md`) — nunca verbatim
NO copiás el `CLAUDE.md` del repo destino tal cual. Embebés **estructura y punteros**, y ANTES de
escribir pasás el cepillo — un secreto pegado a mano en un `CLAUDE.md` no puede terminar en `docs-fyd/`.

### Artefacto #10 (`revision-seguridad.md`) — el entregable no filtra ubicaciones
El `.md` trackeado lista SOLO **categoría + cantidad + acción "rotar y sacar del código"**. El detalle
`archivo:línea` va ÚNICAMENTE al reporte transitorio de `docs-fyd auditar`, nunca a un `.md` committeado.

## Validación de diagramas (Mermaid)

Cada bloque Mermaid **se compila antes de escribirse**. Si uno falla:
- El artefacto **IGUAL se escribe** (regla 6: los 10 siempre existen).
- El diagrama roto se reemplaza por un **cartel visible**: `⚠️ diagrama inválido, corregir a mano: [error]`
  y se **marca como duda** en el reporte.
- **A FyD no le falta el documento** — solo ve un diagrama a corregir, no un hueco.

## El README y la cabecera de procedencia

- **Cabecera** (los 10 artefactos): arriba, *"Documento derivado automáticamente del código de este
  repositorio — se regenera, no editar a mano en silencio; lo que el código no sabe va en
  `_ACLARACIONES.md`."* **No nombra la herramienta.**
- **Marcador del README** (protección de sobre-escritura): un comentario HTML con un token de máquina
  estable: `<!-- docs-fyd:marca v2 -->`. La detección reconoce **el token nuevo Y el viejo**
  (`generado por /docs-fyd`), para no tratar como "escrito a mano" un README ya sembrado por v1.
  - README **propio** (tiene cualquiera de los dos marcadores) o **ausente** → lo regenerás libre.
  - README **a mano SIN marcador** → NO lo pisás: mostrás el diff y pedís confirmación **una vez**.
  - README que **perdió su marcador** (formateador que borró comentarios, etc.) → lo **reportás
    explícito** (*"este README no tiene marcador de procedencia; si fue generado, perdió su origen y no
    se regenerará"*), no lo congelás en silencio.
- La bóveda, `_ACLARACIONES.md` y `ESTADO.md` NO llevan la cabecera de "se regenera" (el motor no los arrasa).

## `ESTADO.md` — semáforo de frescura (solo del motor)
- El motor lo escribe al final de cada corrida de forma **quirúrgica**: solo las líneas de **fecha** y
  **frescura** (flag PENDIENTE limpio). Nada más vive acá (el registro de correcciones está en
  `_ACLARACIONES.md`).
- El `/cierre` del proyecto lo MARCA PENDIENTE cuando la sesión tocó la watchlist (solo marca, no regenera).

## El flujo de una corrida (`docs-fyd`)
1. **Ubicación**: confirmá que estás en la raíz del repo (hay `.git/` o código). Confirmá que `docs-fyd/`
   NO está en `.gitignore` (es deliverable + los `_`-archivos deben persistir).
2. **Detectá el stack** por evidencia real (`deteccion.md`). Sin evidencia → "NO DETERMINADO" + con qué buscaste.
3. **Leé la capa humana**: la bóveda (`_CAMPOS-NEGOCIO.md`) y `_ACLARACIONES.md` (respuestas previas).
   Creá desde plantilla los que falten (la bóveda, `_ACLARACIONES.md` y `ESTADO.md` en la 1ª corrida).
4. **Derivá los 10** del código, cada uno según su prompt en `prompts-fyd.md` + su esqueleto.
5. **Auto-verificación 1ª (surtidor)**: contrastá cada afirmación contra su fuente; las **sin fuente**
   alimentan las dudas reactivas.
6. **Pasada de dudas (por opciones)**: reactivas (del paso 5) + la checklist proactiva (siempre).
   Presentá por opciones; respetá el tope y las categorías. Las de clave coincidente en `_ACLARACIONES`
   NO se re-preguntan (salvo caducidad). Modo no-interactivo → parquear. Anexá las nuevas respuestas a
   `_ACLARACIONES.md` (texto libre "Otra" pasa el freno anti-prosa).
7. **Fundí** las respuestas (guardadas + nuevas) en los artefactos que corresponden.
8. **Auto-verificación 2ª (final)**: rastro afirmación→fuente + consistencia interna sobre el artefacto
   ya fusionado, eximiendo lo humano.
9. **Cepillo (env + prosa)** sobre cada artefacto — la última compuerta. No pasa → FRENÁ ese archivo.
10. **Validá los Mermaid**: roto → cartel + duda (el artefacto igual se escribe).
11. **Escribí** dentro del write-set. README: respetá el marcador.
12. **`git status`**: si hay algo fuera de `docs-fyd/** + README`, FRENÁ.
13. **Sellá `docs-fyd/ESTADO.md`** (quirúrgico: fecha + flag).
14. **Reporte**: qué se escribió, dudas resueltas / pendientes, qué quedó "no aplica + razón", qué falta
    completar, y el recordatorio de FyD: *"revisá el resultado antes de darlo por bueno."*

## Si algo sale mal / edge cases
- **Repo sin sistema del método**: igual escribís `docs-fyd/` + README; la frescura vía `/cierre` no
  aplica hasta montar el sistema. Gate manual ("regenerá antes de entregar").
- **Sin fuente para un artefacto** (ej. sin base de datos → sin ER): lo escribís con "no aplica + razón".
- **`docs-fyd/` en `.gitignore`**: no llega a FyD y los `_`-archivos no persisten — avisá y pedí sacarlo.
- **Un secreto sobrevive el cepillo**: no escribas ese artefacto. Reportalo fuerte con su ubicación.
- **El humano no sabe responder una duda**: queda "a confirmar" (No me consta) — honesto, no rompe.
