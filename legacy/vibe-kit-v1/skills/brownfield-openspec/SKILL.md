---
name: brownfield-openspec
description: Plantilla para cambios sobre apps que YA andan (brownfield). Usala cuando el cambio es sobre una app existente, no una app nueva: arma una propuesta de 4 campos (Por que / Que cambia y que NO / Alcance / Criterios de exito) y delta specs (ADDED/MODIFIED/REMOVED), poniendo el foco en listar que se queda IGUAL para acotar el blast radius.
when_to_use: app existente, cambio sobre algo que ya funciona, brownfield, agregar feature a app andando, modificar comportamiento existente, sacar una feature, no romper lo que ya anda, acotar el impacto de un cambio, blast radius.
---

# Cambios sobre apps que ya andan (brownfield) — OpenSpec

Esta skill es para cuando NO arrancas de cero. La app ya existe y funciona, y vos
queres **agregar, cambiar o sacar** algo sin romper lo que ya anda. Acordate de la
regla de oro de brownfield: **lo mas valioso no es describir lo que cambia, es
describir lo que NO cambia.** Eso delimita el "blast radius" (el radio de explosion):
cuanto de la app puede verse afectado por este cambio.

> **Greenfield vs brownfield (no te confundas de skill):**
> - **App NUEVA, de cero** → no uses esta skill. Usa la entrevista de descubrimiento
>   (skill `entrevista-descubrimiento`) y el spec normal (skill `escribir-spec`).
> - **App que YA anda** → esta skill. Primero explora el codigo, despues escribi
>   la propuesta de 4 campos y los delta specs.

---

## Antes de escribir nada: explora el codigo (read-only)

En brownfield el orden importa. **Primero entender lo que ya hay, despues proponer.**

1. **Explora el codigo real** antes de entrevistar. Si sos el Arquitecto, podes
   delegarle esto al subagente `explorador-codigo` (read-only): que mapee los archivos,
   las entidades, los roles/permisos y los modulos que toca el pedido. Asi tus preguntas
   quedan ancladas a lo que existe de verdad, no a suposiciones.
2. **Entrevista con preguntas ancladas a lo encontrado** ("vi que ya tenes una tabla
   `facturas` y un rol `admin`; el cambio que queres, ¿toca esos o son nuevos?").
3. Recien ahi escribi la propuesta.

**HARD GATE (no-negociable):** no escribas ni una linea de codigo, no toques archivos,
no scaffoldees nada hasta que la propuesta y los delta specs esten escritos y vos los
hayas aprobado. En brownfield este gate es todavia mas importante: un cambio mal acotado
puede romper cosas que hoy funcionan.

---

## Parte 1 — La propuesta de 4 campos

Toda propuesta de cambio brownfield tiene EXACTAMENTE estos 4 campos. Cortita, en
lenguaje claro, sin jerga. La escribis a un archivo `.md` (ej.
`docs/propuestas/AAAA-MM-DD-<tema>.md`).

```markdown
# Propuesta: <titulo corto del cambio>

## 1. Por que (Why)
<El problema o la necesidad, en 2-4 frases. Que duele hoy o que falta.
Por que vale la pena tocar algo que ya anda.>

## 2. Que cambia y que NO cambia (What)
**Lo que SI cambia:**
- <cambio 1, concreto>
- <cambio 2>

**Lo que NO cambia (queda IGUAL) — esto acota el blast radius:**
- <modulo / pantalla / tabla / rol que NO se toca>
- <comportamiento existente que se mantiene tal cual>
- <integracion / flujo que sigue funcionando igual>

## 3. Alcance (Scope)
**En alcance (entra en este cambio):**
- <lo que SI vamos a tocar ahora>

**Fuera de alcance (NO entra ahora, a proposito):**
- <lo que dejamos para despues para no engancharnos>

## 4. Criterios de exito (Success criteria)
- <senal medible y observable de que el cambio funciono>
- <otra senal, idealmente binaria: pasa / no pasa>
```

### Por que el campo "que NO cambia" es el corazon de todo

Es lo que distingue una propuesta brownfield de una greenfield. Listar
explicitamente lo que **se queda IGUAL** hace tres cosas:

1. **Acota el blast radius:** si decimos "el modulo de login, los roles y la tabla
   `clientes` NO se tocan", ya sabemos donde NO mirar si algo se rompe.
2. **Le da a Claude limites claros** para la fase de ejecucion autonoma: "esto es
   zona prohibida, no la toques".
3. **Te protege a vos:** si despues algo de lo que dijiste que NO cambiaba se rompe,
   sabemos que fue un efecto colateral no previsto, no parte del plan.

> **Regla practica:** si dudas entre poner algo en "que NO cambia" o no mencionarlo,
> ponelo. Cuanto mas grande la lista de "se queda IGUAL", mas seguro el cambio.

---

## Parte 2 — Los delta specs (ADDED / MODIFIED / REMOVED)

Mientras la propuesta dice **por que y con que alcance**, el delta spec dice
**que requisitos concretos cambian**, etiquetando cada uno como agregado, modificado
o eliminado. Asi se ve de un vistazo el impacto real sobre los requisitos de la app.

Lo escribis a un archivo `.md` (ej. `docs/propuestas/AAAA-MM-DD-<tema>-delta.md`).

```markdown
# Delta para <dominio / modulo>

## ADDED Requirements
### Requirement: <nombre del comportamiento nuevo>
El sistema DEBERA <comportamiento observable y testeable>.

#### Scenario: <nombre del escenario>
- GIVEN <estado inicial>
- WHEN <accion del usuario o del sistema>
- THEN <resultado esperado>
- AND <verificacion adicional>

## MODIFIED Requirements
### Requirement: <nombre del comportamiento que cambia>
El sistema DEBERA <comportamiento NUEVO / actualizado>. (Previously: <comportamiento original>)

#### Scenario: <nombre>
- GIVEN <estado inicial>
- WHEN <accion>
- THEN <resultado esperado actualizado>

## REMOVED Requirements
### Requirement: <nombre del comportamiento que se saca>
(Razon de la baja: <por que ya no hace falta>)
```

### Reglas de los delta specs

- **ADDED** = requisitos que NO existian antes. Comportamiento nuevo.
- **MODIFIED** = requisitos que ya existian y ahora cambian. **Siempre** llevan
  `(Previously: ...)` para dejar claro de que estado venimos. Sin el "Previously"
  no se entiende que se modifico.
- **REMOVED** = requisitos que se sacan. **Siempre** con la razon de la baja.
- **Cada requisito** se escribe con la palabra clave **DEBERA** (equivalente a SHALL /
  MUST de RFC 2119) y describe un **comportamiento observable** (algo que se puede ver
  y testear), no un detalle interno.
- **Cada escenario** va en formato **GIVEN / WHEN / THEN / AND** (dado un estado,
  cuando pasa algo, entonces ocurre tal cosa). Es lo que hace al requisito testeable.
- Cubri siempre: **happy path** (todo bien) + **casos borde** + **fallos** (que pasa
  cuando algo sale mal).

### Mini-ejemplo (cambio sobre una app de facturacion que ya anda)

```markdown
# Delta para Modulo de Facturacion

## ADDED Requirements
### Requirement: Exportar facturas a Excel
El sistema DEBERA permitir exportar la lista de facturas filtrada a un archivo Excel.

#### Scenario: Exportacion con filtro activo
- GIVEN un usuario con rol admin viendo facturas filtradas por mes
- WHEN hace clic en "Exportar a Excel"
- THEN el sistema genera un .xlsx solo con las facturas visibles
- AND registra la accion en el audit_log

## MODIFIED Requirements
### Requirement: Listado de facturas
El sistema DEBERA mostrar una columna "Estado" con color por estado. (Previously: el listado no mostraba el estado, solo numero y monto)

## REMOVED Requirements
### Requirement: Boton "Imprimir PDF viejo"
(Razon de la baja: se reemplaza por la exportacion a Excel; nadie lo usaba)
```

---

## Como conduce la conversacion el Arquitecto (preguntas en brownfield)

- **Una pregunta por mensaje o tandas chicas.** Siempre multiple-choice numerada,
  con una opcion marcada **Recomendado** y un fast-path "respondé los defaults".
- **Solo preguntas que eliminan ramas enteras** (tope ~3-5). Lo no critico no se
  pregunta: se asume y se registra en una seccion `## Supuestos` del archivo.
- Las preguntas clave en brownfield apuntan justo a acotar el blast radius:
  - *"¿Este cambio toca algo que ya existe, o es todo nuevo al costado?"*
  - *"De lo que ya anda hoy, ¿qué tiene que seguir funcionando EXACTAMENTE igual?"*
  - *"Para esta primera version, ¿qué dejamos AFUERA a proposito para no engancharnos?"*
    (alimenta el campo "Fuera de alcance" de la propuesta)

**HALT (no-negociable):** antes de aplicar cualquier cosa al archivo (o de pasar a
ejecutar), preguntale al usuario si esta de acuerdo (y/n/otra) y **FRENA a esperar la
respuesta**. Nunca apliques cambios sin ese OK explicito.

---

## Donde encaja esto en vibe-kit

- El **checklist de concerns** (roles/permisos, listas configurables, errores+logging,
  auditoria) sigue valiendo en brownfield: al modificar algo, chequea que no rompas un
  concern existente. Si tocas facturacion, el `audit_log` sigue siendo obligatorio.
- Estos archivos (propuesta + delta) son el **handoff a una sesion fresca**: una vez
  aprobados (estado `READY`), abris un chat nuevo y limpio para ejecutar, con el dial
  de autonomia en Auto/acceptEdits y **git commiteado antes** como red de seguridad.
- Los specs son **memoria viva**: al archivar el cambio, fusionalo en el spec maestro
  de la app, asi siempre hay un spec actualizado de lo que la app ES hoy.

---

## Checklist rapido antes de aprobar una propuesta brownfield

- [ ] Exploraste el codigo real ANTES de proponer (read-only).
- [ ] La propuesta tiene los 4 campos: Por que / Que cambia y que NO / Alcance / Exito.
- [ ] El campo "que NO cambia" lista explicitamente lo que se queda IGUAL (blast radius acotado).
- [ ] El delta spec etiqueta cada requisito como ADDED / MODIFIED / REMOVED.
- [ ] Cada MODIFIED tiene su `(Previously: ...)` y cada REMOVED su razon.
- [ ] Cada requisito usa DEBERA y tiene al menos un escenario GIVEN/WHEN/THEN.
- [ ] Cubriste happy path + casos borde + fallos.
- [ ] Los concerns existentes (auditoria, roles, logging) siguen respetados.
- [ ] Hiciste el HALT y el usuario aprobo antes de pasar a ejecutar.
