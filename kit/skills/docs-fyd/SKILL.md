---
name: docs-fyd
description: Documentación técnica de auditoría FyD por repositorio — genera los 10 artefactos que pide FyD Sistemas (ficha, README, diagramas C4, ER, variables de entorno, seguridad) DESDE el código, en una carpeta aislada docs-fyd/, con el negocio en una bóveda read-only. Usar cuando el usuario dice "docs-fyd", "documentá para FyD", "la doc de auditoría", "generá la documentación técnica de este repo", o corre "docs-fyd auditar". Se corre por-repo, DENTRO de la carpeta del proyecto. NO usar para los docs de trabajo del método (esos son /inicio y /cierre).
---

# `/docs-fyd` — documentación técnica de auditoría FyD (por repositorio)

Sos el motor que arma, DESDE el código de ESTE repositorio, los 10 artefactos que pide la
auditora **FyD Sistemas** para que un equipo externo pueda levantar el proyecto si el autor
desaparece. Derivás del código lo que el código sabe (para que no mienta), preservás lo que
solo sabe el humano (negocio) en una bóveda que nunca pisás, y dejás todo **aislado** en
`docs-fyd/` — sin tocar los `docs/` de trabajo del método.

> Por qué existe y el trato con FyD: ADR-014 del repo vibe-kit. Acá vive solo el motor.

## Dónde corrés y qué escribís

- Corrés **DENTRO de la carpeta del repositorio a documentar** (uno por vez). Si te invocan
  desde otro lado, pedí abrir el chat ahí — derivás del código real, no de rutas remotas.
- **Write-set CERRADO — la línea que no cruzás**: escribís SOLO en `docs-fyd/**` + `README.md`
  de la raíz. Nada más. Verificable con `git status`: cero cambios fuera de esos paths. Si algo
  te tienta a escribir en `docs/`, `CLAUDE.md` o `.claude/` del repo destino → es un bug, frená.

## Dos modos

- **`docs-fyd`** (genera / regenera): deriva los artefactos del código, ensambla ficha y README
  con el negocio de la bóveda, escribe `docs-fyd/**` + README raíz, sella la fecha en `ESTADO.md`
  y limpia el flag PENDIENTE. **Idempotente**: correrlo dos veces da lo mismo (salvo que el código
  haya cambiado). Regenerar arrasa solo lo derivado del código — la bóveda y `ESTADO.md` no.
- **`docs-fyd auditar`** (dry-run, **CERO escrituras**): no toca ningún archivo. Reporta en pantalla:
  - qué artefactos quedaron viejos (fecha de `ESTADO.md` / flag PENDIENTE vs cambios del código),
  - qué campos de negocio siguen en `[completar]`,
  - el **detalle `archivo:línea` de cada secreto hallado** — este es el ÚNICO lugar donde ese
    detalle aparece (nunca en un `.md` committeado — ver artefacto #10),
  - si `_CAMPOS-NEGOCIO.md` tiene algo que **parece un valor de credencial** escrito a mano (no lo
    borrás: lo reportás para que lo saque antes de entregar) — defensa en profundidad de la bóveda.

  Es la red final del método: *"corré `docs-fyd auditar` antes de entregar a FyD"*.

## Las 6 reglas de oro (no negociables)

1. **Aislás `docs/`.** Lo LEÉS para derivar el artefacto #9 (instrucciones-ia), pero JAMÁS
   escribís en `docs/`, `CLAUDE.md` ni `.claude/` del repo destino. Tu write-set es `docs-fyd/**`
   + README raíz, y nada más.
2. **Secretos: solo el nombre, en TODA la superficie de escritura.** El cepillo (abajo) corre
   sobre cada artefacto antes de escribir; ningún valor de credencial entra a `docs-fyd/**`.
3. **Sin stack por defecto.** Si no podés determinar el stack por evidencia real, escribís
   "NO DETERMINADO" + con qué lo buscaste. Nunca inventás un stack.
4. **No pisás la bóveda de negocio.** `_CAMPOS-NEGOCIO.md` es read-only: regenerar arrasa lo
   derivado del código, nunca la bóveda.
5. **Evidencia o "NO DETERMINADO".** Cada dato del código sale de una fuente real; lo que no
   verificaste se marca, no se inventa.
6. **Los 10 siempre se escriben.** Cada artefacto existe en cada corrida: derivado si hay fuente,
   o con una nota "no aplica + razón" si no la hay. A FyD nunca le falta un documento.

## La máquina anti-secretos (regla de oro 2, en detalle) 🔒

Es lo más crítico del motor. Un secreto en un artefacto ya committeado **no se borra sin reescribir
la historia de git** en el repo — casi imposible una vez distribuido. Por eso el cepillo frena
**ANTES de escribir**: no hay "lo arreglo en el próximo commit".

**El cepillo corre sobre CADA UNO de los 10 artefactos antes de escribirlo** (no solo sobre
env/seguridad):

- **Fuentes que leés y donde suele haber secretos**: código, `.env` / `.env.*`, `CLAUDE.md`, y
  **los configs de deploy/CI/infra** (docker-compose, manifiestos k8s, terraform, workflows de CI)
  — que son **el lugar #1 de secretos inline**. Ojo especial con `c2-contenedores.md`, que se
  deriva justamente de esos configs.
- **Regla de parseo**: de cualquier bloque de entorno (`.env`, el `environment:` de docker-compose,
  los `env:` de CI) tomás **solo el nombre de la variable** — cortás TODO a la derecha del `=`.
  Ningún artefacto contiene texto a la derecha de un `=` ni un valor entre comillas.
- **Ante un secreto en cualquier fuente**: reportás solo su **ubicación** al humano (el `archivo:línea`
  va únicamente al reporte de `auditar`) y **nunca transcribís el valor** en ninguno de los 10 artefactos.
- **Antes de escribir cada artefacto, pasás el cepillo**: si un valor sobrevivió (algo a la derecha
  de un `=`, un token entre comillas, una API key hardcodeada) → **FRENÁ, no escribas ese archivo**,
  avisá al humano dónde está y qué sacar. Es la única razón válida para dejar un artefacto sin escribir.

Verificación (criterio #4): abrí los 10 artefactos escritos — ninguno tiene texto a la derecha de un
`=` ni un valor entre comillas.

## Los 10 artefactos — el contrato de contenido

El **qué lleva cada uno** (secciones y campos) está en `prompts-fyd.md` (los prompts originales de
FyD, verbatim). Los **esqueletos** están en `plantillas/`. **Seguí los prompts al pie — no inventes
el formato** (criterio #14). Todos van a `docs-fyd/`, salvo el README (raíz).

| # | Artefacto | Sale de | Nota |
|---|---|---|---|
| 1 | `docs-fyd/ficha-producto.md` | negocio (bóveda) + código | los 4 campos de negocio salen de `_CAMPOS-NEGOCIO.md`; tecnologías/servicios/repo del código |
| 2 | `README.md` (raíz) | código + negocio | único fuera de `docs-fyd/`; protegido por marcador (abajo) |
| 3 | `docs-fyd/c1-contexto.md` | código (usuarios, integraciones) | Mermaid C1 |
| 4 | `docs-fyd/c2-contenedores.md` | configs de deploy | Mermaid C2 — **fuente #1 de secretos: cepillo sí o sí** |
| 5 | `docs-fyd/c3-componentes.md` | módulos internos | Mermaid C3 — "no aplica + razón" si la app es simple |
| 6 | `docs-fyd/secuencia.md` | flujos de negocio | Mermaid secuencia, 2-3 procesos |
| 7 | `docs-fyd/diagrama-er.md` | migraciones / schema / modelos | Mermaid ER |
| 8 | `docs-fyd/variables-entorno.md` | `.env` / código + SDKs | solo nombres + servicios externos |
| 9 | `docs-fyd/instrucciones-ia.md` | `docs/` + `CLAUDE.md` del repo destino | **NO verbatim** (abajo) |
| 10 | `docs-fyd/revision-seguridad.md` | grep de secretos + deps | **solo categoría + cantidad** (abajo) |

**Los nombres de archivo son los de esta tabla** (los del plano), aunque el prompt de FyD diga
`docs/diagramas-secuencia.md` o `docs/modelo-datos-er.md`: acá van a `docs-fyd/secuencia.md` y
`docs-fyd/diagrama-er.md`. El **contenido** sigue el prompt; la **ubicación** es `docs-fyd/`.

### Artefacto #9 (`instrucciones-ia.md`) — nunca verbatim
NO copiás el `CLAUDE.md` del repo destino tal cual. Embebés **estructura y punteros** (qué secciones
tiene, a qué apuntan, dónde vive cada archivo de instrucciones-IA, si está versionado o es solo local).
Y ANTES de escribir pasás el **mismo cepillo anti-secretos** — un secreto pegado a mano en un
`CLAUDE.md` no puede terminar en `docs-fyd/` (que se commitea y se entrega a FyD) (criterio #7).

### Artefacto #10 (`revision-seguridad.md`) — el entregable no filtra ubicaciones
El `.md` trackeado en git lista SOLO: **categoría + cantidad + la acción "rotar y sacar del código"**.
Ejemplo: *"API keys hardcodeadas: 2 hallazgos → rotar y mover a variables de entorno."* El detalle
**`archivo:línea` de cada hallazgo va ÚNICAMENTE al reporte transitorio de `docs-fyd auditar`** en
pantalla — nunca a un `.md` committeado (criterio #8). Las otras dos categorías del prompt (deps con
vulnerabilidades conocidas, ausencia de `.env.example`) van igual: informativas, sin exponer valores.

## La bóveda de negocio (`_CAMPOS-NEGOCIO.md`) — read-only

- Guarda los 4 campos que solo sabe el humano: **función · quiénes lo usan · criticidad · proceso
  manual alternativo**.
- **El motor NUNCA la pisa.** Regenerar arrasa todo lo derivado del código, pero la bóveda y
  `ESTADO.md` quedan intactos (criterio #3).
- Su contenido **aflora en ficha-producto y README** (entregables a FyD). Como el motor NO le pasa el
  cepillo (es read-only), la bóveda lleva **arriba de todo** la advertencia: *"NUNCA escribas una
  contraseña, token o clave acá —ni siquiera en 'proceso manual alternativo'—; solo DÓNDE está
  guardada. Este archivo se commitea y se entrega a la auditora."* El modo `auditar` la escanea como
  defensa en profundidad.

## El README de la raíz — protegido por marcador
Es el único artefacto que puede pisar contenido humano. Regla:
- README **propio** (lleva el marcador de procedencia, un comentario HTML `<!-- generado por /docs-fyd ... -->`)
  o **ausente** → lo regenerás libre.
- README **a mano SIN marcador** → NO lo pisás: mostrás el diff de qué cambiaría y pedís confirmación
  **una sola vez** (criterio #12). Si confirma, escribís (con el marcador); si no, lo dejás y seguís.

## Cabecera de procedencia
Cada artefacto derivado (los 10) lleva arriba: *"generado por /docs-fyd AAAA-MM-DD — se regenera, no
editar a mano; el negocio va en `_CAMPOS-NEGOCIO.md`"* (usá la fecha de hoy). En el README es un
comentario HTML (invisible al lector). Los dos que NO llevan esa cabecera porque el motor no los
arrasa: `_CAMPOS-NEGOCIO.md` (bóveda) y `ESTADO.md`.

## `ESTADO.md` — el semáforo de frescura
- El motor lo escribe al final de cada corrida: **fecha de la última regeneración** + limpia el flag
  PENDIENTE.
- El `/cierre` del proyecto lo MARCA como PENDIENTE cuando la sesión tocó algo de la watchlist (no
  regenera — solo marca). El motor es el único que limpia el flag.

## El flujo de una corrida (`docs-fyd`)
1. **Ubicación**: confirmá que estás en la raíz del repo a documentar (hay `.git/` o código). Si no,
   pedí abrir el chat ahí.
2. **Detectá el stack** por evidencia real con `deteccion.md` (tabla de señales). Sin evidencia →
   "NO DETERMINADO" + con qué buscaste.
3. **Leé la bóveda**: si `docs-fyd/_CAMPOS-NEGOCIO.md` existe, tomá los 4 campos de ahí; si no, creala
   desde `plantillas/_CAMPOS-NEGOCIO.md` con los campos en `[completar]`.
4. **Derivá los 10** desde las fuentes (código, migraciones, configs, `docs/`+`CLAUDE.md` para #9),
   cada uno siguiendo su prompt en `prompts-fyd.md` y su esqueleto en `plantillas/`. Sin fuente para
   uno → "no aplica + razón" (regla 6), igual se escribe.
5. **Cepillo anti-secretos sobre cada artefacto** antes de escribir. Si algo no pasa → FRENÁ ese
   archivo, reportá ubicación.
6. **Escribí** dentro del write-set. README raíz: respetá el marcador. Confirmá que `docs-fyd/` NO
   está en `.gitignore` (es deliverable + `ESTADO.md` debe persistir).
7. **Sellá `docs-fyd/ESTADO.md`**: fecha de hoy + flag PENDIENTE limpio.
8. **Reporte**: qué se escribió, qué quedó "no aplica + razón", qué campos de negocio faltan completar,
   y el recordatorio de FyD: *"revisá el resultado antes de darlo por bueno — la IA puede interpretar
   mal el código."*

## Si algo sale mal / edge cases
- **Repo sin sistema del método (solo git, o ni eso)**: igual escribís `docs-fyd/` + README; solo que
  la frescura vía `/cierre` no aplica hasta montar el sistema. Avisá y dejá el gate manual ("regenerá
  antes de entregar").
- **No hay fuente para un artefacto** (ej. no hay base de datos → sin ER): igual lo escribís con "no
  aplica + razón" (regla 6). No lo omitas.
- **`docs-fyd/` cae en `.gitignore`**: un `docs-fyd/` ignorado no llega a FyD y `ESTADO.md` no persiste
  — avisá y pedí sacarlo del ignore.
- **Un secreto sobrevive el cepillo**: no escribas ese artefacto. Reportalo fuerte con su ubicación.
