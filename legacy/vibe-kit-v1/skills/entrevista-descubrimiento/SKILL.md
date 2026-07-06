---
name: entrevista-descubrimiento
description: Banco de preguntas de descubrimiento en espanol rioplatense, en 3 etapas (oportunidad, solucion, riesgo). Usala cuando el Arquitecto arranca una entrevista para una app nueva (greenfield) y necesita entender el dolor, los usuarios/roles y los concerns antes de escribir el spec. Una pregunta a la vez, multiple-choice con opcion Recomendado.
---

# Entrevista de descubrimiento

Esta skill es el **banco de preguntas** que usa el Arquitecto para entrevistarte cuando empezas una app nueva (greenfield). Sale de adaptar la mecanica de *Superpowers brainstorming* (una pregunta a la vez, hard gate) + *Spec Kit /clarify* (multiple-choice con opcion Recomendado, asumir lo no critico) traidas al espanol rioplatense para alguien que NO programa.

El objetivo: en 10-15 minutos de charla quedarte con la **oportunidad** (que dolor resolvemos), la **solucion** (que construir) y el **riesgo** (que puede salir mal y que NO hay que cambiar). Con eso el Arquitecto escribe el SPEC.

---

## Reglas de oro (no-negociables)

- **HARD GATE:** mientras estas en esta entrevista NO se escribe codigo, NO se scaffoldea nada, NO se toca el filesystem. Primero se entiende, despues se disena, recien al final se escribe el spec a disco. Si el usuario empuja a "arranca a programar ya", recordale amablemente que primero cerramos el diseno.
- **Una pregunta a la vez** (o tandas chiquitas de 2). No tires un cuestionario entero de 15 de golpe: abruma. Conversa.
- **Siempre multiple-choice numerada**, con UNA opcion marcada `[Recomendado]` y su razon en media linea. El usuario puede contestar con el numero, decir "el recomendado", o escribir su propia respuesta corta.
- **Fast-path:** ofrece "si queres, deci *acepto los recomendados* y avanzamos de un saque". Para un no-programador suele ser el mejor default.
- **Tope de 3-5 preguntas criticas por tanda.** Solo se preguntan las que **eliminan una rama entera de decision** (cambian el stack, activan/desactivan un concern caro, o son casi irreversibles). El resto NO se pregunta.
- **Lo no critico se asume y se registra.** En vez de preguntar todo, haces una conjetura razonable ("informed guess") y la anotas en la seccion `## Supuestos` del spec, con su impacto (ALTO / MEDIO / BAJO). Esa es la red anti-paralisis.
- **Lo que sobrevive al cupo de 5 y NO se puede asumir** se marca con el cartel literal `[NEEDS CLARIFICATION: ...]` en el spec, para resolverlo despues. Tope sugerido: 3 carteles.
- **Reparto de tiempo:** 30-40% en la ETAPA 1 (Oportunidad / el problema) y 60-70% en la ETAPA 2 (Solucion / que construir). La ETAPA 3 (Riesgo) son 2-3 confirmaciones rapidas porque casi todo va con default ON.
- **Tono:** rioplatense, vos, cero jerga tecnica. Hablas con alguien que dirige a Claude pero no lee codigo. Traduci cualquier termino tecnico ("RLS", "multi-tenant") a un beneficio concreto.

---

## Como usar el banco

1. Saluda y pregunta en una linea de que se trata la idea, para anclar el tono.
2. Entra a la **ETAPA 1 (Oportunidad)**. Hace P1 a P5 de a una, escuchando. No hace falta hacer las 5 si el dolor ya quedo clarisimo: el objetivo es entender el problema, no completar un formulario.
3. Pasa a la **ETAPA 2 (Solucion)**, P6 a P12. Aca te tomas mas tiempo: es donde se decide el stack y los modulos.
4. Cierra con la **ETAPA 3 (Riesgo)**, P13 a P15. Son confirmaciones rapidas; los concerns transversales (errores, logging, auditoria) van con **default ON** salvo que el usuario diga que no.
5. Antes de terminar, **re-enuncia un mini-contrato** ("entonces lo que entendi es...") y ofrece el menu de elicitacion de la skill `elicitacion-avanzada` por si quieren afilar algo antes de pasar al spec.
6. Todo lo que asumiste va a `## Supuestos`; lo no resuelto a `[NEEDS CLARIFICATION: ...]`; lo que quedo afuera a proposito alimenta el `Scope: fuera de alcance`.

> Las respuestas se integran al toque al spec (entidades, roles, casos borde) y cada decision se anota como bullet con la fecha de hoy en la seccion `## Aclaraciones`.

---

## ETAPA 1 — OPORTUNIDAD (el problema, ~30-40% del tiempo)

Aca buscamos el dolor real, cada cuanto pega, quien lo sufre y que cambiaria si se resuelve. No hablamos todavia de "como" se construye.

**P1 — El dolor.** Pensa en algo que hoy haces a mano y te roba tiempo o te da bronca. Que es lo que mas te duele del proceso actual?
1. Cargo o copio datos de un lado a otro (ej: del ERP a un Excel). `[Recomendado para tu caso de facturacion]`
2. Tengo que acordarme de hacer algo a mano y a veces se me pasa.
3. No tengo una vista clara de como van los numeros.
4. Otra (contame en una frase).

**P2 — Cada cuanto duele.** Cada cuanto sufris esto?
1. Todos los dias. (si es diario, vale automatizar fuerte)
2. Cada semana o en el cierre de mes. `[Recomendado para reporting/facturacion]`
3. De vez en cuando.
4. Es un arranque de cero, todavia no pasa.

**P3 — Quien lo sufre.** Esta app la vas a usar vos solo, tu equipo, o tambien gente de afuera (clientes)?
1. Solo yo.
2. Mi equipo interno. `[Recomendado -> activa roles/permisos]`
3. Equipo + clientes externos. (esto abre multi-tenant, ojo: es una decision casi irreversible)
4. Todavia no se.

**P4 — El valor.** Si esto funcionara perfecto, que cambiaria para vos?
1. Ahorro horas todas las semanas. `[Recomendado: priorizar automatizacion]`
2. Dejo de cometer errores que cuestan plata.
3. Puedo tomar decisiones con datos al dia.
4. Otra.

**P5 — Como lo resolves hoy.** Hoy esto lo resolves con...?
1. Excel / planillas.
2. Una herramienta que pago pero no me alcanza.
3. Nada, esta todo en mi cabeza o en papel.
4. Una app vieja que quiero reemplazar. (esto es brownfield: conviene explorar lo existente primero)

---

## ETAPA 2 — SOLUCION (que construir, ~60-70% del tiempo)

Aca se decide el carril (web / Android / Windows / datos), las entidades del dominio y los modulos. Cada respuesta empuja una pieza concreta del stack del golden path.

**P6 — Tipo de app.** Donde la queres usar principalmente?
1. En el navegador, desde cualquier compu (web). `[Recomendado: Next.js]`
2. En el celular Android (APK).
3. Como programa de Windows en tu maquina.
4. Es sobre todo procesar datos y ver tableros. (caso datos: puede entrar Python detras de una frontera)

**P7 — Entidades del dominio.** Cuales son las cosas principales con las que trabaja la app? Marca las que apliquen.
1. Facturas / comprobantes. `[Recomendado para tu caso]`
2. Clientes / proveedores.
3. Productos / catalogo.
4. Objetivos o metas comerciales.
5. Otra (nombrala).

**P8 — Login.** La app necesita que la gente inicie sesion?
1. Si, cada uno con su usuario. `[Recomendado si la usa un equipo -> Supabase Auth + permisos por RLS]`
2. No, es solo para mi en mi maquina.
3. Si, y ademas con organizaciones / empresas separadas. (esto va con Better Auth + multi-tenant)

**P9 — Roles.** Va a haber gente con distintos permisos?
1. Si: un admin que configura todo + usuarios que solo usan. `[Recomendado, default ON]`
2. Todos pueden hacer todo.
3. Varios niveles (admin, supervisor, vendedor, solo-lectura).
4. Por ahora no, pero quiza despues. (igual lo dejamos preparado)

**P10 — Listas configurables.** Hay listas que vos querrias cambiar sin tener que pedirme ayuda (ej: categorias, sucursales, vendedores, estados)?
1. Si, varias, y quiero un panel para editarlas. `[Recomendado, default ON -> nunca hardcodeado, siempre una fila en una tabla]`
2. Una o dos, fijas.
3. No por ahora.

**P11 — Datos / Python.** La app necesita levantar datos de tu ERP o Excel, calcular formulas, o hacer reportes pesados?
1. Si: levanta facturacion del ERP, aplica formulas y arma dashboards. `[Recomendado para tu caso real -> FastAPI + pandas detras de una frontera]`
2. Calculos simples nomas (sumas, totales). (esto va todo en TypeScript)
3. No, es ABM / CRUD comun. (sin Python)

**P12 — Dashboards.** Queres ver tableros con numeros, graficos y un modulo de objetivos comerciales?
1. Si, KPIs y avance de objetivos. `[Recomendado -> Tremor/Recharts]`
2. Una tabla simple alcanza.
3. No por ahora.

---

## ETAPA 3 — RIESGO (que puede salir mal y que NO cambiar)

Confirmaciones rapidas. Los concerns transversales van con **default ON**: si el usuario no opina, los activamos igual porque retrofitearlos despues duele mucho mas. Esta etapa alimenta directo el checklist de concerns (la constitucion) y el campo `Scope: fuera de alcance`.

**P13 — Errores y logging.** Cuando algo falle (ej: el ERP no responde), que preferis?
1. Que la app reintente, avise claro y registre el error para revisarlo. `[Recomendado, default ON -> Sentry + manejo estandar]`
2. Que solo me muestre un cartel.
3. No lo pense. (lo activamos por default igual)

**P14 — Auditoria.** Necesitas saber quien hizo que y cuando (sobre todo cuando hay plata o facturacion de por medio)?
1. Si, registro de actividad / audit-log. `[Recomendado y NO opcional en apps de facturacion]`
2. No hace falta.
3. No se. (en apps tipo ERP lo dejamos prendido por las dudas)

**P15 — Alcance / lo que NO entra.** Para esta primera version, que dejamos AFUERA a proposito para no engancharnos?
1. Arranco con lo minimo que resuelve el dolor #1 y despues sumo. `[Recomendado -> YAGNI]`
2. Quiero meter todo de una. (te muestro por que conviene partirlo)
3. Ayudame a decidir el corte.

> Esta ultima pregunta alimenta el `Scope: fuera de alcance` de la propuesta (lo que NO cambia delimita el alcance y evita el "kitchen sink").

---

## Que hacer con las respuestas

- **Decisiones que cambian rama** (tipo de app, login, multi-tenant, Python si/no) -> al SPEC con maxima precision. Son las unicas que vale la pena preguntar.
- **Concerns con default ON** (roles, listas configurables, errores+logging, auditoria, i18n) -> se asumen activos y se registran en la constitucion + en `.claude/rules/`. Solo se desactivan si el usuario dice explicitamente que no.
- **Lo de bajo impacto o que excede el cupo de 5** -> NO se pregunta: se asume y se anota en `## Supuestos` con su impacto (ALTO / MEDIO / BAJO), o se difiere y se reporta como "Diferido" con su razon.
- **Lo ambiguo que no se puede asumir** -> `[NEEDS CLARIFICATION: ...]` en el spec (tope ~3).
- **Lo que se deja afuera a proposito** -> `Scope: fuera de alcance`.

## Cuando NO usar esta skill

- Si la app **ya existe y anda** (brownfield), primero hay que explorar el codigo y arrancar con la propuesta OpenSpec ("Por que / Que cambia + que NO cambia / Alcance / Exito"). Para eso usa la skill `brownfield-openspec`, no esta.
- Para **afinar o criticar** una propuesta ya escrita (pre-mortem, red team, primeros principios), usa la skill `elicitacion-avanzada` con su menu 1-5.

## Skills relacionadas

- `elicitacion-avanzada` — menu 1-5 de lentes adversariales para refinar cada seccion antes del spec.
- `escribir-spec` — convierte las respuestas de esta entrevista en el SPEC / DESIGN / TASKS persistido a disco.
- `brownfield-openspec` — el camino paralelo para apps que ya existen (explorar primero, propuesta + delta).
- `checklist-concerns` — la lista de modulos transversales (la constitucion) que se confirman en la ETAPA 3.
