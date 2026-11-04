# Cómo usar el Arquitecto (kit v3)

> **Para qué sirve**: el Arquitecto es la puerta para **pensar antes de hacer**. Le decís qué querés y él decide por dónde
> entra: un proyecto nuevo, algo más que chico sobre una app que ya anda, una duda de cómo pedirle algo a Claude, la PC o la flota.
> Deja un plano **sellado por un script**, y construye otra sesión. Si este manual y el kit difieren, manda el kit
> (`kit/skills/arquitecto/SKILL.md` y sus `anexos/`). La versión v2 de este manual está en `legacy/COMO-USAR-EL-ARQUITECTO-v2.md`.

---

## 1. Las cinco entradas

Se llama con **`/arquitecto`** y lo que querés, en una frase. Lo primero que contesta, siempre, antes de tocar nada, es **una línea
que dice por qué entrada fue** (ADR-031):

| Decís algo como… | Entrada | Su primera línea | Qué pasa |
|---|---|---|---|
| "quiero una app para…" (no existe todavía) | **proyecto nuevo** | `más que chico: proyecto nuevo (Modo A)` | Entrevista → SPEC-0 sellado → monta el proyecto (§3) |
| "agregale X a esta app" (estás parado en ella) | **feature** | `más que chico: feature (Modo B)` | Explora el código → spec delta sellado → arma el módulo (§4) |
| "¿cómo le pido esto a Claude?", "armame el prompt" | **consultorio** | `consultorio` | Sale con un prompt pegable, un veredicto o el brief de una skill (§5) |
| "preparame esta máquina", "actualizate", "corré el doctor" | **la PC** | `la PC: te paso al Equipador` | Lo hace el Equipador (§6) |
| "¿cómo está la flota?", "poné al día X", "adoptá X" | **la flota** | `la flota: …` | La tabla la arma él; poner al día y adoptar, el Equipador (§6) |

Si el pedido es **chico**, contesta `esto es chico: hacelo en el chat del proyecto` y se apaga. Si no se da cuenta de qué entrada es,
te hace **una** pregunta con las opciones: nunca adivina.

Antes de elegir mira dos cosas: si quedó un spec a medias (`Estado: BORRADOR`; te ofrece retomarlo) y dónde estás parado (si es
un proyecto con código y el pedido es sobre él, es feature).

**Lo que no entra por esta puerta**: el ecosistema ("¿qué tenemos y cómo se cruza?") es del Hub; un pedido que vino de otra persona
y hay que relevar es `/relevamiento` (`manuales/HOJA-DE-MANO-relevamiento.md`). En los dos casos te lo dice en una línea.

---

## 2. La regla del tamaño

Dos preguntas: **¿hace falta algo más que el pedido y el `git diff` para retomarlo? ¿lleva más de una sesión?**

- **Ninguna sí → chico.** Se hace directo en el chat del proyecto, sin spec. Un arreglo puntual, una consulta, un hotfix.
- **Alguna sí → más que chico.** Va con el Arquitecto. Lo que sale de una charla con el dueño (una guía, un procedimiento) es más
  que chico aunque termine en un documento.
- **Tocar plata, permisos o datos reales no lo agranda**: eso lo cuidan los frenos, no un spec.

En un proyecto con el kit v3, **la sesión del proyecto mide sola**: la primera línea de su respuesta es *"chico, lo hago acá"* o
*"esto es más que chico: llamo al Arquitecto"*, y lo invoca ella (lo dicen el `CLAUDE.md` del molde y `/inicio`). En un proyecto v2
esa regla no está: al Arquitecto lo llamás vos.

Lo más que chico tiene **dos formas** (las elige el Arquitecto en Modo B, y queda en la primera línea de "Ejecución" del spec):

| Forma | Cuándo | Tope del spec |
|---|---|---|
| **módulo solo** | Lo normal: una sesión fresca lo construye | ≤ 10 KB y ≤ 8 criterios |
| **módulo con director** | Hay dos o más tareas que se escriben **a la vez** (carriles en paralelo), o pedís **noche sin vos** | ≤ 30 KB |

Varias sesiones seguidas no lo hacen director. Si decís "quiero director igual" o "bajá", manda lo que dijiste. Cómo trabajan el
director y sus obreros: `manuales/ROLES.md`. Si el spec pasa el tope, el Arquitecto propone dónde cortar y lo que sobra es un
módulo **hermano**; vos decidís con un clic.

---

## 3. Modo A — proyecto nuevo

1. **El registro primero**: antes de preguntar nada, lee las fichas de los proyectos de tu carpeta de proyectos y te dice en una línea
   cuántos hay, por si lo que pedís es un módulo de otro (entonces no es Modo A: te pide abrir el chat en esa carpeta).
2. **Dos preguntas de arranque**: qué es (nombre, qué hace, para quién) y **¿lleva código?** (`estandar` con código, `liviano` sin
   código: documentos, relevamientos, estudio). Dónde vive no lo pregunta: si la carpeta donde corre la sesión está vacía, ahí; si
   no, `<carpeta de proyectos>/<nombre>`.
3. **La entrevista**: una pregunta por vez, con opciones y una "(Recomendado)", en criollo. Cada tanda queda escrita en el borrador
   (el SPEC-0, en `docs/modulos/v1/SPEC.md` del proyecto nuevo, `Estado: BORRADOR`; es el primer módulo, con su ficha
   `docs/modulos/v1/README.md`): si te vas a la mitad, no se pierde nada y la próxima vez te ofrece retomarlo. Atajo: **"dale con los defaults"** → solo confirma
   las dos ⚠️ y el tipo de app; lo demás va a "Supuestos".
4. **Las dos ⚠️, siempre y por separado**: ¿lo van a usar varias empresas separadas algún día (multi-tenant)? ¿va a existir en más de
   un idioma (i18n)? Cambiarlas después es rehacer media app. Después, la checklist de *concerns* (roles, listas configurables,
   errores, auditoría…).
5. **El gate**: te muestra 2-3 enfoques con pros y contras y uno recomendado, en Plan Mode. Si toca plata, permisos o datos de
   terceros, antes pasa el red team. **Tu aprobación es la puerta**: sin ella no escribe nada más que el borrador.
6. **El montaje**: corre el scaffolding del stack y `git init`, y monta **el molde v3 con el adoptador** (`adoptar --nuevo`) sobre
   un clon del proyecto, nunca a mano: la ficha `.claude/kit.md`, `CLAUDE.md`, `docs/`, `/inicio`, `/cierre`, los frenos, los hooks,
   el candado prendido y `/director` y `/obrero` (todo proyecto nuevo nace con módulos). Los githooks se prenden en tu carpeta
   (`--principal`) y el resultado vuelve a ella con un `pull`. Con la ficha puesta, sella el SPEC-0 (§7) y lo pasa a READY; si es
   `estandar`, te pregunta si lleva también `docs-fyd`. Termina con una tabla de lo montado.
7. **La línea**: te da la ruta y la frase para pegar en un chat nuevo ahí (`inicio — ejecutá docs/modulos/v1/SPEC.md (está READY)`).
   Y se apaga.

**Si venís de un relevamiento** (la invocación nombra un `HANDOFF.md`): honra lo ya contestado, arranca en las preguntas de
solución y **no monta**: devuelve el plano a `/relevamiento` para la propuesta de valor. Monta recién con la propuesta aprobada.

---

## 4. Modo B — algo más que chico sobre una app que ya anda

**Corre en la carpeta del proyecto.** Si lo llamás desde otro lado, te pide abrir el chat ahí.

- **Con ficha** (el proyecto tiene `.claude/kit.md`, el kit v3): el módulo vive en `docs/modulos/<x>/` (su `README.md`, la ficha, y su
  `SPEC.md`, el delta). Nace en la rama por defecto: si estás en otra rama, te lo dice y se apaga.
- **Sin ficha** (proyecto v2): deja `docs/SPEC-<x>.md`, siempre `módulo solo`, **sin commit, sin push y sin worktree**: lo guarda el
  `/cierre` del proyecto.

Los pasos:

1. **`docs/NORTE.md` primero** (con ficha, si falta, lo arma y te lo muestra junto con el spec). Después explora el código con hasta
   tres ayudantes de solo lectura: estructura, modelo de datos, convenciones. El resumen va al spec con `archivo:línea`.
2. **Pantalla → prototipo**: si lo que pedís se ve (una pantalla, un formulario), arma un prototipo HTML estático con una pregunta
   escrita **antes** del spec, siempre (también con "dale con los defaults"). Lo aprobás vos o la usuaria; el spec sale de lo aprobado.
3. **Largo o corto**:
   - **Largo** (no hay plan charlado): una entrevista corta anclada al código ("tu tabla X ya tiene tal campo: ¿esto lo reemplaza o
     conviven?"), los concerns solo del cambio y, si sirve, un investigador de "¿cómo lo resuelven otros?".
   - **Corto / B corto** (el pedido ya trae un plan charlado, con vos o con el director): **sin entrevista**. Hace solo lo que el plan
     no trae: explorar, el NO SE TOCA, los chequeos, director sí/no y "Ejecución". También es el que toma un módulo que **nació sin
     sello** (te lo avisa `/inicio`: *"el módulo <x> nació sin sello: llamo al Arquitecto (Modo B corto)"*) y el que llama el
     director cuando su spec no tiene sello.
4. **El spec delta**: "Pedido original, textual" (nunca inventado), AGREGA / MODIFICA / **NO SE TOCA** (obligatoria), "Ejecución" y
   "Entorno de prueba". El director va solo si la ficha del proyecto lo trae (`piezas.director-obrero: sí`); si no, módulo solo y te
   dice cómo prenderlo. Con ficha corre el chequeo del entorno: si da rojo, montarlo es **la tarea 0**. Si el proyecto tiene la base
   real y ninguna de prueba, en un módulo con director la tarea 0 va como primer renglón de "Entorno de prueba"
   (`- **Tarea 0**: montar la base de prueba`): el sello la acepta y el primer encargo, el `00`, monta la base; hasta que esté,
   ningún otro obrero arranca. En un módulo solo no vale: la base de prueba es un módulo previo.
5. **Termina armando**: sello → tu OK (si cambiás algo, sella de nuevo) → READY. Con ficha: un commit en la rama por defecto **solo
   con lo del módulo** (nunca `git add -A`), push si hay remoto y, si es con director, `worktree.cjs crear <x>` (la rama
   `modulo/<x>` y su carpeta aparte). Si el proyecto no tiene `worktree.cjs`, lo dice y no arma el worktree a mano.
6. **La línea**: módulo solo → chat nuevo en la carpeta, `inicio — ejecutá docs/modulos/<x>/SPEC.md (está READY)`; con director → en tu
   ventana de siempre, una sesión nueva con Opus y el primer mensaje `/director`: entra sola al worktree (`worktree.cjs donde` y
   EnterWorktree); la alternativa, `code "<worktree>"` en otra ventana; sin ficha → `inicio — ejecutá el spec docs/SPEC-<x>.md (está READY)`.

Implementado, el spec no se archiva: su estado pasa a `COMPLETO <fecha>`.

---

## 5. El consultorio

Para cuando **sabés qué querés pero no cómo pedírselo a Claude**, o dudás de la mecánica. Hace 2-3 preguntas y te clasifica la duda:

- **Problema de prompt** ("lo pido y hace otra cosa") → **un prompt listo para pegar**, con resultado esperado, contexto mínimo,
  límites (qué NO tocar), evidencia pedida y prioridad. La regla: *especificá el resultado, no la receta*.
- **Problema de orquestación** ("¿subagentes?", "¿background?", "¿spec o directo?") → **un veredicto** con la regla que lo respalda.
  Si el veredicto es "spec", te ofrece pasar a Modo B ahí mismo.
- **Problema de ritual** (algo que ya pediste 3+ veces igual) → **el brief para crear la skill** (con `writing-skills`, en un chat del
  proyecto). El consultorio no crea la skill: arma el pedido.

Nunca te deja con pura teoría. Si lo que traés es una feature o un proyecto, te lo dice y cambia de puerta.

---

## 6. La PC y la flota (derivan)

Estas dos entradas **derivan, no ejecutan**: el Arquitecto no instala nada ni toca ningún repo.

- **La PC** ("preparame esta máquina", "actualizate", "corré el doctor", "instalame skills") → invoca al Equipador
  (`/arquitecto-skills`) con tu pedido tal cual. Todo eso está en `manuales/EQUIPADOR.md`.
- **"¿Cómo está la flota?"** → corre `arquitecto.cjs registro` sobre tu carpeta de proyectos y te muestra **una tabla**: alias · con o
  sin código · versión del kit · repo · con qué se conecta. Una ficha rota sale debajo, una línea por cada una. Solo lee las fichas
  `.claude/kit.md` de los repos clonados en esa carpeta; el registro de la empresa es capa privada y no entra.
- **"Poné al día X"**, **"poné al día la flota"**, **"adoptá X"**, **"qué se repite en la flota"** → `la flota: te paso al Equipador`.
  El detalle: `manuales/EQUIPADOR.md` §5.

---

## 7. El sello y `arquitecto.cjs`

**El sello lo escribe un script, nunca el modelo.** Un spec sin sello no puede pasar a READY, y una sesión constructora solo ejecuta
specs READY. El obrero de un módulo con director también frena si el spec no tiene sello.

Qué mira `sello` antes de escribir la línea:
- **tamaño**: que "Ejecución" diga `módulo solo` o `módulo con director` en su primera línea, y que coincida con la ficha del módulo.
- **entorno** (solo con ficha): que haya dónde probar. Si la ficha declara un entorno real, tiene que haber uno de prueba al lado (o,
  en un módulo con director y con el kit ≥ `3.0.0-rc.2`, la tarea 0 en el spec: el sello dice `entorno — (tarea 0: montar el entorno
  de prueba)`); si no, `comando-test` tiene que dar verde (corre en la misma consola que el gate: Git Bash en Windows; si da rojo y la ficha tiene `comando-setup`, el sello te pregunta si lo corriste en esa carpeta). Y las herramientas que nombra la ficha tienen que andar.
- **tope**: el tamaño del spec contra su límite (avisa; si decidiste seguir entero, va `--no-partir "Guido"`).

Si niega, dice qué falta en una línea; se arregla y se vuelve a correr. Si después del sello alguien toca el spec, el sello deja de
valer: `/inicio` te avisa *"el spec de <x> cambió después del sello"* y hay que sellar de nuevo.

Los comandos (los corre el Arquitecto; vos casi nunca): `node "$HOME/.claude/skills/arquitecto/scripts/arquitecto.cjs" <comando>`

| Comando | Qué hace |
|---|---|
| `sello <spec> [--no-partir "<quién>"] [--no-aplica tamaño\|entorno "<razón>"]` | Corre los chequeos y escribe la línea del sello con el hash del spec |
| `ready <spec>` | Pasa `BORRADOR` a `READY`, y nada más; se niega sin sello válido |
| `ready --pendientes` | Lista los módulos sin sello, a medias o con el sello roto (lo corre `/inicio`) |
| `tope <spec>` | Cuánto pesa el spec contra su límite, y dónde cortar |
| `entorno` | Si el entorno de prueba del proyecto está listo |
| `registro <carpeta de proyectos>` | La tabla de la flota |

Sale 0 si anduvo, 1 si niega (con qué hacer), 2 si lo llamaron mal. Con `arquitecto roto: …`, la sesión lo dice y frena: nunca sella
ni marca READY a mano. El detalle de cada script del kit: `manuales/SCRIPTS.md`.

**La carpeta de proyectos** de cada PC la escribe el instalador en el `SKILL.md` instalado y `actualizate` la conserva. Si todavía no
está, el Arquitecto te pregunta dónde viven tus proyectos y la anota.

---

## 8. Las reglas que no cambian

- **El que piensa no construye**: el Arquitecto nunca escribe código de la app. "Ya que estás, hacelo": no, y te explica por qué.
- **Una pregunta por vez**, en criollo, con una recomendada.
- **Lo que decidiste es la autoridad**: marca el riesgo una vez y sigue.
- **Evidencia, no vibras**: una librería sale de la matriz o verificada ese día; lo demás va como NO VERIFICADO.
- **Termina armando** y se apaga: vos pegás una sola línea.

## Dónde seguir

- El Equipador (la PC, poner al día, adoptar): `manuales/EQUIPADOR.md`
- Director, obrero, tramo, la noche y la mesa: `manuales/ROLES.md`
- Lo que trae un proyecto con el kit v3 (la ficha, los frenos, `docs/`): `manuales/MOLDE.md`
- El por qué: ADR-031 (las cinco entradas) en `docs/DECISIONS.md`; el diseño, `docs/kit-v3/SPEC-paquete-4.md`
