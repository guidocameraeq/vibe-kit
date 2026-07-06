---
name: playbook-orquestacion
description: Playbook de orquestacion de Claude Code para no-programador. Usala cuando hay que decidir COMO trabajar una tarea, no que construir: subagente vs agente principal, ambiguo vs especifico, nivel de autonomia (Plan vs Auto), plan-first o directo, una sesion por tarea, /clear vs /compact, y como hacer que el ROL del Arquitecto sobreviva a la compactacion. Es la guia de decision rapida antes de arrancar cualquier sesion.
---

# Playbook de orquestacion

Esta skill NO decide *que* construir (para eso estan `entrevista-descubrimiento` y `escribir-spec`). Decide **como trabajar**: cuando hablar y cuando ejecutar, cuando lanzar un ayudante en background, cuanta autonomia darle a Claude, y como no perder el hilo cuando la sesion se llena.

Es la traduccion al espanol rioplatense, para alguien que dirige a Claude pero NO lee codigo, de la tabla de decision del Arquitecto y del playbook de sesiones del kit. Pensala como el tablero de control que mira el Arquitecto antes de cada movida.

Modelo mental de todo el kit: **vos dirigis y aprobas en lenguaje natural; Claude ejecuta; los hooks hacen el control de calidad por vos. Nunca leés código.**

---

## 1) Tabla de decision (la guia rapida)

Cuatro decisiones, cuatro reglas simples. Memorizalas: cubren el 90% de los casos.

| Decision | Regla simple | Por que |
|---|---|---|
| **Subagente o agente principal?** | **Principal** para conversar, trabajo chico, o pasos encadenados que comparten contexto (= tu Arquitecto). **Subagente** solo como ayudante en background: leer 10+ archivos, 3+ tareas independientes, o revisar con ojos frescos. | A un subagente **no le podes hablar mientras corre**. NO uses subagentes para tareas chicas, trabajo secuencial dependiente, o dos que tocan el mismo archivo. |
| **Especifico o ambiguo?** | **Ambiguo temprano, especifico en el spec.** En la charla, deja que el agente te entreviste y proponga. Todo lo que queres construido va al spec con maxima precision. | "Instrucciones vagas -> resultados vagos." Un buen spec le saca a Claude 15-20 decisiones que si no improvisaria. |
| **Nivel de autonomia?** | Fase HABLAR/spec -> **Plan mode** (read-only). Fase EJECUTAR -> **Auto / acceptEdits**. Nunca bypass/YOLO fuera de un sandbox. | Mapea a tus dos fases. Siempre **commiteá en git ANTES** de la corrida autonoma, como red de seguridad. |
| **Plan-first o directo?** | **Si lo describis en UNA frase, salteá el plan; si no, planeá primero.** Planeá siempre que haya: incertidumbre, 3+ archivos, schema/seguridad, o no conoces el codigo. | En tu **primer mes**: dejá Plan mode SIEMPRE prendido y aflojá con el tiempo. |

### Ampliacion de cada regla

**Subagente vs principal.** El built-in `Explore` (read-only, modelo Haiku) y `Plan` ya son ayudantes de busqueda baratos. Los subagentes del kit (`explorador-codigo`, `redteam-spec`, `doc-keeper`, `reviewer`) son read-only y devuelven SOLO un resumen al chat padre — por eso ahorran contexto cuando el trabajo produce mucho ruido que no necesitas ver. Pero arrancan **con contexto en blanco**: no ven tu conversacion, ni las skills ya invocadas, ni los archivos que Claude ya leyo. Si una regla DEBE llegarles, hay que re-enunciarla en el pedido. Para una pregunta rapida sobre algo que ya esta en la charla, NO lances un subagente: usa `/btw`.

**Ambiguo vs especifico.** Es la regla de las dos fases. En la **fase HABLAR** (entrevista del Arquitecto) la ambiguedad es bienvenida: contas el dolor en lenguaje natural y el agente repregunta. En la **fase del SPEC** se invierte: cada cosa que quieras construida se escribe con precision maxima (entidades, roles, criterios EARS, limites). Lo que no se puede cerrar se asume y se anota en `## Supuestos`, o se marca `[NEEDS CLARIFICATION: ...]` si no se puede asumir.

**Nivel de autonomia.** Plan mode es read-only de verdad (Claude explora y propone pero NO escribe). Auto/acceptEdits deja que ejecute el spec aprobado. La transicion natural: aprobar un plan SALE de Plan mode y pasa la sesion al modo que elegiste (revisar cada edit / aceptar edits / auto). Antes de soltarle autonomia, **commit en git**: es tu boton de deshacer real (los checkpoints de Claude `/rewind` NO son git).

**Plan-first vs directo.** El test de la frase: si podes describir el cambio en una sola oracion sin "y... y... y...", anda directo. Si necesitas tres frases, o toca varios archivos, o hay schema/seguridad de por medio, o no conoces el codigo -> Plan mode primero. Atajo mental: ante la duda, planeá.

### Checklist para arrancar cualquier sesion

- [ ] Feature nueva o cambio sobre app existente? (greenfield = entrevista con `entrevista-descubrimiento`; brownfield = explorar codigo + propuesta con `brownfield-openspec`)
- [ ] Lo describo en una frase? -> directo. Si no -> Plan mode.
- [ ] Necesito hablar / iterar? -> agente principal. Necesito leer mucho o revisar con ojos frescos? -> subagente.
- [ ] Charla: ambiguo OK. Spec: especifico, con verificacion end-to-end y limites de 3 niveles (Verde siempre / Ambar preguntar / Rojo nunca).
- [ ] Antes de ejecutar autonomo: commit en git + dial a Auto.
- [ ] Spec aprobado -> **sesion fresca** para ejecutar (contexto limpio).

---

## 2) Estrategia de sesiones (1 sesion = 1 tarea)

**Modelo:** 1 proyecto = varias sesiones nombradas; **1 sesion = 1 tarea coherente**; contexto siempre por debajo del **~60%**.

Por que importa tanto: un contexto inflado o mezclado hace que Claude IGNORE tus reglas reales y se equivoque mas. Una sesion limpia y enfocada le rinde mucho mas que una larga y contaminada.

### Tipos de sesion

| Tipo de chat | Cuantos | Que hace | Cuando abrir uno nuevo |
|---|---|---|---|
| **Arquitectura / spec** | 1 por feature grande | constitution/specify/clarify/plan/tasks en Plan mode -> spec + plan + ADR | Al empezar una feature grande |
| **Implementacion** | 1+ por feature (cortos) | tasks/implement con verificacion; se cierra al terminar | Por cada tarea grande |
| **Release** | 1 por release | `/release` | En cada release |
| **Review** | 1 fresco | revision adversarial en contexto limpio | Para revisar codigo recien escrito |

### Reglas de sesion

- **`/clear` entre tareas no relacionadas.** NUNCA mezcles features en un mismo chat (el antipatron "kitchen sink"). Una feature = una sesion.
- **Antipatron "corregir una y otra vez":** si corregiste lo mismo 2+ veces y no sale, el contexto esta envenenado. No insistas: `/clear` + un prompt mejor. **Sesion limpia > sesion larga contaminada.**
- **El handoff es por filesystem.** El Arquitecto entrega un SPEC en `.md`. Para ejecutarlo, abri una **sesion FRESCA** (contexto limpio) y pasale el spec. Asi la sesion de implementacion no arrastra el ruido de la entrevista.
- **Sesiones como branches:** nombralas (`/rename`), retomalas con `claude --continue` / `--resume`. La continuidad real entre chats la dan **CLAUDE.md + `project.yaml` + ADRs + docs/** committeados — NO la memoria de un chat suelto.

### `/clear` vs `/compact` — cual y cuando

Son cosas distintas y se confunden seguido:

| | `/clear` | `/compact` |
|---|---|---|
| **Que hace** | Borra TODO el contexto, empezas de cero | Resume la conversacion preservando codigo y decisiones clave |
| **Cuando** | Cambiar a una tarea NO relacionada; o cuando el contexto se envenono (corregiste 2+ veces lo mismo) | La sesion sigue siendo la MISMA tarea pero el contexto llego a ~60% y no queres perder el hilo |
| **Ojo** | Perdes todo lo no guardado a disco | El resumen puede diluir reglas/rol (ver seccion 3) |

**Regla de oro antes de `/clear`:** guarda lo importante a disco PRIMERO (CLAUDE.md, `project.yaml`, un ADR, el spec). Lo que vive solo en el chat se evapora; lo que vive en archivos committeados sobrevive a cambiar de PC.

> Dato clave: la **auto-memory** (lo que Claude escribe solo en `~/.claude/projects/.../memory/`) es **local y NO se versiona**. Por eso lo critico vive en `project.yaml` + `docs/`, no en la auto-memory.

---

## 3) Durabilidad del rol ante /compact (tu dolor explicito)

El problema concreto: arrancas con el Arquitecto bien metido en su rol (read-only, entrevistador, no programa), la sesion se llena, se compacta... y de golpe "se diluye" y empieza a portarse distinto. Esto pasa porque tras una compactacion Claude re-adjunta solo un resumen de las invocaciones recientes, y un rol que estaba en un **mensaje suelto** puede no sobrevivir entero.

### La regla central: el rol va en un lugar DURABLE, no en un mensaje suelto

Un rol o una instruccion que DEBE mantenerse toda la sesion **nunca** se entrega como un mensaje de chat tirado al pasar. Va en un lugar que se vuelve a cargar:

| Lugar durable | Por que aguanta | Para que usarlo |
|---|---|---|
| **Comando / skill** (`/arquitecto`, esta skill, etc.) | El cuerpo del SKILL.md entra como un mensaje y se queda toda la sesion; tras auto-compaction se re-adjuntan las invocaciones recientes de cada skill | El rol y las reglas de orquestacion del Arquitecto |
| **CLAUDE.md** del proyecto | Se recarga en cada sesion y sobrevive a la compactacion | Golden path, comandos exactos, boundaries, "arregla el spec/doc antes que el codigo" |
| **`project.yaml`** | Archivo a disco, portable, lo leen las skills | Stack + concerns activos + politica de orquestacion |
| **Hooks** (deterministas) | Codigo que corre SIEMPRE, no depende del prompt | Lo que DEBE pasar si o si (lint/test al cerrar turno, bloquear escrituras peligrosas) |

Lo contrario — un mensaje suelto tipo "de ahora en mas portate como arquitecto y no escribas codigo" — es **fragil**: es lo primero que se pierde al compactar.

### Que hacer cuando el rol "se diluye"

1. **Re-invoca la skill / el comando.** Si el Arquitecto perdio el hilo, volver a tipear `/arquitecto` (o re-invocar la skill del rol) re-inyecta el cuerpo completo y lo vuelve a anclar. Es el arreglo mas rapido.
2. **Reforza la `description` / instrucciones** del comando si el problema se repite seguido — una description mas clara mejora el auto-trigger y el re-anclaje.
3. **`/compact` con instrucciones.** Cuando compactes una sesion donde el rol importa, NO compactes a ciegas: dale una consigna al resumen, por ejemplo *"al compactar, conserva textual que sos el Arquitecto en Plan mode, read-only, que no escribis codigo, y las reglas de orquestacion"*. Asi el resumen preserva el rol en vez de aplanarlo.
4. **Lo no-negociable, a HOOKS.** Si algo NO puede fallar nunca (que no se escriba en `/migrations`, que corra el test al cerrar turno), no lo dejes en un prompt advisory: ponelo en un hook. CLAUDE.md y la constitucion **sugieren**; los hooks **garantizan**. (Riesgo conocido del kit: "CLAUDE.md y constitucion son advisory".)

### Detalle util (sin tecnicismos)

Tras una compactacion automatica, Claude vuelve a enganchar las invocaciones recientes de cada skill (los primeros tramos de cada una, con un presupuesto acotado). Traduccion: lo que esta en una skill **tiene mejor chance de volver** que un mensaje suelto. Por eso el rol del Arquitecto vive en `/arquitecto` y en esta skill, no en algo que escribiste una vez.

---

## 4) Como encaja con el resto del kit

- **Plan mode read-only** es el cimiento del Arquitecto: discutir sin tocar nada -> escribir el plan/spec a archivo -> aprobar -> ejecutar. El gate pasa por el **filesystem**.
- **Subagents del kit** (read-only, 3-5 maximo): `explorador-codigo` (mapea el codigo en brownfield), `redteam-spec` (ataca el spec antes de aprobarlo), `doc-keeper` (drift docs vs codigo), `reviewer` (revision adversarial, solo correctitud/requisitos — NO sobre-ingenieria). Todos devuelven un resumen al chat padre.
- **Cuando usar que:** *slash command/skill* = template de prompt + logica de dominio; *subagent* = trabajo aislado/paralelo que devuelve un resumen; **hook = imponer una regla con codigo**.
- **El handoff a ejecucion autonoma:** spec aprobado (`READY`) -> sesion FRESCA -> dial de autonomia a Auto/acceptEdits -> con git commiteado antes como red de seguridad.

---

## Skills y comandos relacionados

- `/arquitecto` — el agente PRINCIPAL conversacional que usa esta tabla de decision en cada movida.
- `entrevista-descubrimiento` — la fase HABLAR para apps nuevas (greenfield).
- `brownfield-openspec` — la fase HABLAR para apps que ya existen (explorar codigo + propuesta).
- `escribir-spec` — convierte la charla en el SPEC/DESIGN/TASKS persistido a disco (el handoff por filesystem).
- `crear-agentes-y-comandos` — para fabricar nuevos comandos/agentes durables (el lugar correcto para un rol nuevo, no un mensaje suelto).
- `checklist-concerns` — la constitucion (concerns transversales con default ON).
