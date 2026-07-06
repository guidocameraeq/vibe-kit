# Cómo usar el Arquitecto (y el proyecto que te deja montado)

> Guía de uso completa. El instalador está en `INSTALAR.md`. Si este documento y los archivos
> del sistema alguna vez difieren, **ganan los archivos** (`~/.claude/skills/arquitecto/`).
> Versión 2026-07-06.

---

## 1. Qué es, en una frase

El Arquitecto es el interlocutor con el que **pensás antes de hacer**, con tres puertas en la
misma conversación: **proyecto nuevo** (te entrevista, piensa lo que no ves venir — roles,
listas configurables, multi-tenant ⚠️, i18n ⚠️ —, escribe el plano SPEC-0 y te deja el
proyecto montado y en régimen), **feature grande sobre una app que ya anda** (explora tu
código real y arma el spec delta con su seguro de no romper), y **consultorio** (cuando no
sabés cómo pedirle algo a Claude). Él detecta la puerta por contexto; si duda, pregunta.

**Qué NO es**: no construye la app (eso lo hace otra sesión, con contexto limpio), no es para
features chicas ni para el trabajo del día a día.

---

## 2. Los 3 momentos — cuándo sí, cuándo no

| Momento | ¿Arquitecto? | Qué hacés |
|---|---|---|
| **Proyecto nuevo de cero** | ✅ SÍ — Modo A | `/arquitecto` en cualquier chat (caso A, abajo) |
| **Feature grande o riesgosa en una app que ya anda** | ✅ SÍ — Modo B | `/arquitecto <la feature>` en un chat abierto EN la carpeta del proyecto (caso B, abajo) |
| **Trabajo del día a día** (fix, ajuste, feature chica) | ❌ NO | El ciclo de siempre: `inicio` → pedís → verificás → `cierre` |

Y hay un cuarto momento que no es de construir nada: **no sabés cómo pedirle algo a
Claude** → también es `/arquitecto` (Modo C, el consultorio — caso C, abajo).

Regla de bolsillo: si la feature se hace en una tarde y no toca permisos/datos/plata, **no
hace falta spec** — pedila directo. Si "hacerla de a poquito puede salir mal", va con spec.

---

## 3. Caso A — Proyecto nuevo de cero (la película completa)

Ejemplo: se te ocurre *"una app para llevar los gastos de la casa"*.

1. **Abrís un chat nuevo** (en cualquier carpeta) y decís:
   `/arquitecto quiero una app para llevar los gastos de casa`
2. **Crea la carpeta y el borrador.** `<carpeta de proyectos>/GastosCasa/SPEC-0.md` en estado
   BORRADOR. Desde ahí, cada respuesta tuya queda grabada en disco: si te vas a mitad de
   charla, no se pierde nada.
3. **Te entrevista** — una pregunta por vez, opciones con "(Recomendado)", en criollo:
   ¿web o celular? ¿quién la usa? ¿login? Y las dos ⚠️ que SIEMPRE pregunta porque
   cambiar de opinión después es carísimo: ¿multi-idioma algún día? ¿clientes externos
   separados (multi-tenant)? Mientras charlan, manda ayudantes a investigar en paralelo
   (librerías vigentes del stack, apps parecidas).
   - **Atajo**: decí *"dale con los defaults"* y salta directo a confirmar solo las dos ⚠️
     y el tipo de app. Todo lo demás lo asume razonable y lo anota en **Supuestos** (lo
     corregís de un vistazo en el spec).
4. **Concerns**: te muestra la checklist con todo prendido por default — roles/permisos,
   listas configurables desde panel, manejo de errores, logging, auditoría (obligatoria si
   toca plata). Vos apagás lo que no aplique. *Tu dolor #1 — "me doy cuenta tarde de lo que
   la app necesitaba" — resuelto el día cero.*
5. **El plano y la puerta**: entra en modo solo-lectura (el sistema le IMPIDE escribir), te
   presenta 2-3 enfoques con pros/contras y su recomendación, y arma el SPEC-0: qué entra,
   **qué NO entra**, criterios verificables, supuestos, riesgos ⚠️. Si el proyecto toca
   plata, permisos o datos de terceros, primero lo ataca el agente **red-team** y te trae lo
   que sobrevivió. Aprobás como un presupuesto — tu OK es una puerta real del sistema.
6. **Montaje** (solo con tu OK): SPEC-0 pasa a READY → scaffolding oficial del stack →
   git init + .gitignore correcto → CLAUDE.md lleno con lo que charlaron → docs (handoff,
   TODO con las primeras tareas, changelog) → skills `/inicio` y `/cierre` → hooks →
   primer commit. Te muestra la checklist con evidencia (✅ por ítem).
7. **El handoff** — te da el prompt exacto, listo para copiar:
   > Abrí un chat nuevo en `<carpeta del proyecto>` y pegá:
   > `inicio — ejecutá el SPEC-0 (SPEC-0.md, está READY)`
8. **Y se apaga.** El chat nuevo construye la app siguiendo el plano; vos verificás y cerrás
   con `cierre`. De ahí en más, el ciclo de siempre.

**Duración típica**: 15-30 min de charla + el montaje.

---

## 4. Caso B — Feature grande en una app que YA anda ⭐

Ejemplo: la app de gastos ya funciona y querés agregarle *"presupuestos mensuales por
categoría"*. Eso toca datos que ya existen — va con Arquitecto.

1. **Abrís un chat EN la carpeta del proyecto** y decís:
   `/arquitecto quiero agregarle presupuestos mensuales por categoría`
   (Si lo invocás desde otra carpeta, te va a pedir que abras el chat ahí — no diseña a ciegas.)
2. **Primero explora TU código.** Antes de opinar, manda ayudantes de solo-lectura a mirar
   la app real: qué tablas existen (con sus nombres de verdad), cómo se corre, qué
   decidiste antes en `docs/`. Lo decidido no te lo re-pregunta.
3. **Te entrevista anclado a lo real.** No son preguntas genéricas: son sobre tu app —
   *"tu tabla `gastos` ya tiene categoría — ¿el presupuesto se calcula sobre eso o es
   aparte?"*. Es más corta que la del caso A (no hay stack que elegir), y *"dale con los
   defaults"* funciona igual.
4. **El spec delta** — en vez de un plano entero, el plano del CAMBIO, en tres bloques:
   **AGREGA** (lo nuevo), **MODIFICA** (lo existente que se toca, cada ítem con el efecto
   colateral a cuidar) y **NO SE TOCA** — la lista explícita de lo que tiene que seguir
   andando igual que hoy. Esa última es **el seguro de no romper**: tu miedo real de
   "arreglando esto se me rompe aquello", escrito y aprobado antes de tocar nada. Y es el
   criterio #1 de la verificación posterior.
5. **La puerta**: igual que en el caso A — entra en solo-lectura, te presenta el plano,
   aprobás como un presupuesto. Si toca plata/permisos/datos de terceros, red-team antes.
6. **Handoff y se apaga.** El spec queda READY en `docs/SPEC-<nombre>.md`. **No monta
   nada** — el proyecto ya tiene su sistema. Te da el prompt exacto:
   > Abrí un chat NUEVO en la misma carpeta y pegá:
   > `inicio — ejecutá el spec docs/SPEC-<nombre>.md (está READY)`

   La sesión fresca construye, verificás con `/smoke` (primero: lo de NO SE TOCA sigue
   andando) y `cierre` — que archiva el spec solo cuando está implementado.

**¿Por qué construir en un chat nuevo y no en el que pensaste?** Dos razones medidas:
(a) el chat de diseño está lleno de ideas descartadas y callejones — la sesión fresca lee
SOLO el plano aprobado y no se confunde; (b) es la puerta de control: entre pensar y
construir estás VOS aprobando un archivo.

*Nota: si preferís hacerlo a mano o el Arquitecto no está instalado en esa máquina, el
patrón manual sigue válido: charlás la feature en un chat del proyecto → "cristalizá esto
en un spec formato SPEC-0 en `docs/`, con qué NO se toca explícito" → READY → chat nuevo lo ejecuta.*

---

## 4b. Caso C — El consultorio (cómo pedirle cosas a Claude)

El modo liviano: acá no hay spec ni puerta de aprobación — hay una duda de **cómo dirigir
a Claude**, y salís con algo concreto en la mano. Cuándo va:

- *"No sé cómo pedirle esto"* → te devuelve **el prompt listo para pegar**, con 2 líneas
  de por qué está armado así.
- *"¿Esto va con subagentes, en background, con spec o directo?"* → **el veredicto**, con
  la regla que lo respalda.
- *"Quiero una skill para…"* → **el brief listo** para armarla con `writing-skills` en el
  proyecto (si el ritual de verdad se repitió 3+ veces; si no, te lo dice).

La regla del consultorio: **siempre salís con algo accionable** — nunca solo teoría.

Dos consultas reales de ejemplo:
- *"/arquitecto — cada vez que le pido que revise el Excel de ventas me tira cualquier
  cosa. ¿Cómo se lo pido bien?"* → te pregunta qué esperabas y qué probaste, y te arma el
  prompt con lo que le faltaba al tuyo: el archivo exacto, qué columnas, qué significa "bien".
- *"/arquitecto — el informe semanal se lo vengo pidiendo a mano todas las semanas,
  ¿conviene una skill?"* → veredicto: sí (ritual repetido 3+), y te da el brief para crearla.

**Cuándo NO es Modo C**: si lo que tenés es una feature ("quiero que la app haga X") →
eso es el caso B. Si es laburo normal (un fix, un ajuste chico) → pedilo directo en el
chat del proyecto, sin Arquitecto. Y si la consulta crece a diseño en serio, él mismo te
avisa *"esto ya es Modo B/A"* y cambia de puerta con lo charlado.

---

## 5. El proyecto que te deja montado — cómo se usa después

El Arquitecto te entrega un proyecto **en régimen**: el mismo sistema que corre en Perseo y
Hermes. Tu día a día ahí:

- **Abrís chat en la carpeta del proyecto** → decís `inicio` → Claude ya sabe dónde
  están parados (el hook le inyectó el estado) → te confirma en 3 líneas → le das la misión.
- **Trabajás.** Las reglas del CLAUDE.md operan solas: evidencia real o "NO VERIFICADO",
  tus datos son intocables sin tabla "cambio/preservo", tareas largas en background.
- **Terminás** → `cierre` → docs al día, commit, push, y el chat se descarta.
  **Cambió la misión → cambiá el chat.**
- **`/smoke` y `/deploy` no existen todavía** en un proyecto recién nacido — a propósito
  (regla de 3+: una skill nace de un ritual repetido, no "por las dudas"). El día que
  repetiste 3 veces el mismo ritual de probar o deployar, pedile a Claude que la cree — los
  contratos ya están esperando en los templates del Arquitecto.

---

## 5b. El Equipador (`/arquitecto-skills`) — la skill hermana

El Arquitecto monta **proyectos**; el Equipador equipa **máquinas**. Gestiona las skills
globales según un **menú curado** (con orígenes y razones, incluso de lo descartado):

- **"preparame esta máquina"** → censa qué falta del menú, te ofrece el Tier 1 con
  multiSelect, clona fresco de los repos oficiales e instala. Los plugins que necesitan
  comandos tuyos (`/plugin`, tokens) te los deja listos para pegar.
- **"actualizá las skills"** → re-clona y compara; si vos editaste algo local, te muestra
  el diff y pregunta — nunca pisa a ciegas.
- **"qué skills tengo"** → auditoría + propuesta de poda (lo que no se usa, afuera).
- **"agregá/investigá tal skill"** → investiga (repo vivo, licencia, colisiones), y si pasa
  la curaduría entra AL MENÚ primero, con razón escrita. El menú evoluciona; nada entra
  "por las dudas".

## 6. Qué hace bien y qué no (los límites, honestos)

**Hace bien**: pensar los concerns que olvidarías · elegir stack con evidencia del día
(lo que puede envejecer está marcado `[VERIFICAR]` y lo re-chequea al usarlo) · el gate de
aprobación · el montaje completo · explorar tu código real antes de opinar (Modo B) ·
retomar borradores abandonados · el red-team de specs sensibles · el consultorio (Modo C).

**Estado honesto**: los 3 modos están construidos. Validados: el Modo A parcialmente
(tests adversariales + uso real inicial); los Modos B y C **sin prueba de fuego todavía**
— la prueba integral de los tres está pendiente. Usalos, pero con el ojo un poco más
abierto que de costumbre.

**No hace (nunca)**:
- ❌ Construir la app ni la feature — es el diseño; eso lo hace otra sesión con el spec.
- ❌ Deployar.
- ⚠️ Si le pedís que "ya que está, programe algo": se va a negar y explicarte por qué.

---

## 7. Trucos y preguntas frecuentes

- **"¿Mismo chat o chat nuevo?"** — Para PENSAR: donde corresponde al modo (proyecto
  nuevo: cualquier chat; feature: chat en la carpeta del proyecto). Para CONSTRUIR:
  SIEMPRE chat nuevo con el spec como única fuente.
- **"¿Cómo sabe en qué modo estar?"** — Por dos señales: dónde estás parado (chat en una
  carpeta con proyecto real → huele a B) y qué pedís ("app nueva" → A; "agregale algo a
  esta app" → B; "¿cómo le pido…?" → C). Si duda, te pregunta antes de arrancar — nunca
  adivina. Y podés forzarlo directo: *"modo B: quiero agregarle tal cosa"*.
- **"¿El Modo B monta el sistema del playbook (inicio/cierre, hooks)?"** — No: el proyecto
  ya lo tiene. Si detecta que NO lo tiene, te ofrece montarlo primero como paso aparte,
  con su propio OK — recién después diseña la feature.
- **"Me fui a mitad de entrevista"** — Nada se perdió: `/arquitecto` de nuevo y te ofrece
  retomar donde quedaron (el borrador vive en disco).
- **"Quiero ir rápido"** — *"dale con los defaults"*: solo confirma las 2 ⚠️ y asume el
  resto en Supuestos.
- **"¿Y si me arrepiento del stack a mitad de entrevista?"** — Decilo nomás: el borrador se
  actualiza; nada está construido hasta que aprobás el plano.
- **"¿Dónde quedó el spec?"** — Proyecto nuevo: `SPEC-0.md` en la raíz del proyecto.
  Feature: `docs/SPEC-<nombre>.md`. Implementado → `docs/archive/` (lo archiva `/cierre`).
- **"El Arquitecto se equivocó en algo"** — Se edita como cualquier skill: chat nuevo,
  *"con writing-skills, corregí tal cosa en ~/.claude/skills/arquitecto"*. Y al cerrar una
  mejora grande: snapshot a `legacy/snapshots/` (regla del LEEME).
- **"¿Sirve en la otra PC?"** — Sí: `arquitecto-portable.zip` → `INSTALAR.md` → pegar el
  prompt. Una sola línea se adapta por máquina (la carpeta de proyectos).

---

*Estado al 2026-07-06: los 3 modos construidos. Modo A validado adversarialmente (6 tests,
8 fixes) + uso real inicial; Modos B y C sin prueba de fuego. Pendiente: la prueba de fuego
INTEGRAL de los tres (decisión: construir todo → testear todo junto). El diseño completo
vive en `PROPUESTA-VIBE-KIT-V2.md` (Guia de vibe coding); el método madre en `PLAYBOOK-MAESTRO.md`.*
