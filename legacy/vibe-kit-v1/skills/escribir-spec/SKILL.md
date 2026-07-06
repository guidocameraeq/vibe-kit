---
name: escribir-spec
description: Define COMO escribir el spec que el Arquitecto deja en disco. Estructura en 3 artefactos (SPEC -> DESIGN -> TASKS) con criterios de aceptacion en EARS suavizado, seccion de Supuestos con impacto, limites de 3 niveles (Verde/Ambar/Rojo) y un paso de verificacion end-to-end. Usala cuando tengas que materializar un diseno aprobado en un .md que despues una sesion fresca ejecuta.
---

# Escribir el SPEC (el entregable del Arquitecto)

Esta skill te dice **como escribir el spec** y **donde guardarlo**. El spec es el unico archivo que el Arquitecto escribe a disco: es el puente entre la charla y la ejecucion. Una **sesion fresca** lo va a leer despues y va a construir la app a partir de el, **sin tu charla de contexto**. Por eso todo lo importante tiene que estar en el spec, escrito claro y en **espanol rioplatense (vos)**, para alguien que **NO programa** (el usuario lee espanol, no codigo).

> Regla de oro: si una decision no quedo escrita en el spec, la sesion fresca la va a improvisar. El spec bien hecho le saca 15-20 decisiones de la cabeza a Claude.

---

## Cuando NO empezar a escribir todavia

Escribis el spec **recien cuando el diseno esta aprobado**. Antes:

- El **HARD GATE** sigue vigente: no escribas codigo ni scaffoldees nada. Lo unico que escribis es este `.md`.
- El **HALT** vale para este archivo: antes de **crear o modificar el spec en disco**, preguntale al usuario `(si / no / cambiar algo)` y **FRENA a esperar la respuesta**. Prohibido escribir sin ese "si" explicito.

Si el diseno todavia no esta cerrado, volve a la entrevista o al menu de elicitacion. Esta skill arranca cuando ya hay un diseno aprobado para volcar.

---

## Donde se guarda el spec (el "donde")

El tamano del cambio decide el formato:

| Tamano del cambio | Donde va | Que archivos |
|---|---|---|
| **Chico** (una feature, pocos archivos, un par de pantallas) | **un solo `SPEC.md`** en la raiz del proyecto | `SPEC.md` con las 3 partes adentro |
| **Grande** (app nueva, modulo entero, varias entidades, varias pantallas) | una carpeta por feature | `.claude/specs/{nombre-feature}/requirements.md`, `design.md`, `tasks.md` |

Reglas del "donde":

- `{nombre-feature}` es un nombre corto en kebab-case (ej: `objetivos-comerciales`, `facturacion-erp`).
- Si existe la plantilla `SPEC.md.template` en `templates/` del kit, usala como esqueleto del `SPEC.md` chico. Si no existe, segui la estructura de abajo.
- Si hay un `project.yaml` en la raiz, **leelo primero**: te da el stack, los concerns activos y la politica de orquestacion del proyecto. El spec tiene que ser coherente con el (no propongas Better Auth si el `project.yaml` dice Supabase, salvo que el cambio justamente sea migrar).
- En brownfield, el **delta** (que se AGREGA / MODIFICA / SACA) sale de la skill **brownfield-openspec**; va dentro del DESIGN del spec.

> Por que `.claude/specs/` para lo grande: separa los specs del codigo, se commitea a git, y queda como **memoria viva** de lo que la app ES. Cuando un cambio se archiva, se fusiona en el spec maestro -> la app siempre tiene un spec actualizado.

---

## La estructura: 3 artefactos, en este orden

El spec siempre cuenta la misma historia en tres pasos: **que/por que -> como -> en que orden**. En un `SPEC.md` chico son tres secciones del mismo archivo; en uno grande son tres archivos (`requirements.md`, `design.md`, `tasks.md`).

```
SPEC      ->  que construimos y por que   (requirements.md)
DESIGN    ->  como lo construimos          (design.md)
TASKS     ->  en que orden, paso a paso    (tasks.md)
```

### Encabezado del spec (siempre arriba de todo)

```markdown
# Spec: <nombre de la feature o app>

- Estado: BORRADOR | READY
- Fecha: <AAAA-MM-DD>
- Tipo: greenfield (app nueva) | brownfield (cambio sobre app existente)
- Stack: <de la matriz de stacks, ej: Next.js 15 + Supabase + RLS>
```

El **Estado** arranca en `BORRADOR` y pasa a `READY` recien cuando el usuario lo leyo y aprobo. La sesion fresca SOLO ejecuta specs en `READY`.

---

## Artefacto 1 — SPEC (el que / el por que)

Responde **que** construimos y **por que**. Cero detalle tecnico todavia. Lo lee el usuario para confirmar que entendiste el problema.

Contiene:

### 1.1 — El problema y el porque
Dos o tres frases en lenguaje claro: que dolor resolvemos, quien lo sufre, que cambia para el usuario cuando esto funcione. (Sale directo de la etapa Oportunidad de la entrevista.)

### 1.2 — User stories (historias de usuario), por prioridad
Una por linea, en lenguaje plano, marcadas P1 / P2 / P3:

```
P1 — Como <rol>, quiero <hacer algo> para <conseguir un beneficio>.
     Por que P1: <razon en una frase>.
P2 — Como <rol>, quiero ...
```

Empeza por la P1 que resuelve el dolor #1. Lo que no es P1 puede quedar para despues (YAGNI despiadado).

### 1.3 — Criterios de aceptacion (en EARS suavizado)
Esta es la parte que hace el spec **testeable**. Cada criterio dice, en una estructura fija, **cuando pasa que -> el sistema DEBERA hacer que**. Se escribe en espanol natural pero **conservando la estructura condicion -> DEBERA -> respuesta**, asi cualquiera (vos o Claude) puede verificar si se cumplio o no.

Las 6 formas (usa la que corresponda en cada criterio):

1. **Siempre (ubicua):** `El sistema DEBERA <respuesta>.`
   - Ej: *El sistema DEBERA registrar toda accion de un admin en el audit_log.*
2. **Por evento (CUANDO):** `CUANDO <pasa esto>, el sistema DEBERA <respuesta>.`
   - Ej: *CUANDO un usuario envia un formulario con datos invalidos, el sistema DEBERA mostrar los errores de validacion junto al campo correspondiente.*
3. **Por estado (MIENTRAS):** `MIENTRAS <esta en este estado>, el sistema DEBERA <respuesta>.`
   - Ej: *MIENTRAS no haya factura cargada, el dashboard DEBERA mostrar el estado vacio con un boton importar.*
4. **Por feature opcional (DONDE):** `DONDE <esta activo este modulo>, el sistema DEBERA <respuesta>.`
   - Ej: *DONDE el modulo multi-tenant este activo, el sistema DEBERA filtrar toda consulta por tenant_id.*
5. **Comportamiento no deseado (SI / ENTONCES):** `SI <pasa esto malo>, ENTONCES el sistema DEBERA <respuesta>.`
   - Ej: *SI la conexion al ERP falla, ENTONCES el sistema DEBERA reintentar 3 veces y loguear el error en Sentry.*
6. **Combinada (compleja):** encadena MIENTRAS + CUANDO antes del DEBERA.
   - Ej: *MIENTRAS el usuario tenga rol admin, CUANDO edite una lista de categorias, el sistema DEBERA guardar el cambio y reflejarlo en el panel sin recargar.*

**Regla de cobertura:** cada feature importante necesita criterios para el **camino feliz** + los **casos borde** (cero registros, valores nulos, maximos, datos basura) + los **fallos** (red caida, ERP que no responde, permiso denegado). Un spec que solo cubre el camino feliz esta incompleto.

### 1.4 — Supuestos (informed guesses)
Ver la seccion **"Supuestos"** mas abajo: es una seccion propia del spec y es clave para no frenarse preguntando todo.

### 1.5 — Marcadores de ambiguedad real (raro, con tope)
Para una ambiguedad que **NO se puede salvar con una conjetura razonable** (algo que cambia ramas enteras y que el usuario no respondio), deja el marcador literal en el texto:

```
El sistema DEBERA autenticar usuarios via [NEEDS CLARIFICATION: metodo no especificado - email/password, Google, SSO?].
```

Tope sugerido: **~3 marcadores** por spec. Marca SOLO lo que cambia ramas enteras; todo lo demas se asume y se registra en `## Supuestos`. (Regla anti-paralisis: no marques cada dudita; asumi y dejá rastro.)

---

## Artefacto 2 — DESIGN (el como)

Responde **como** lo construimos. Aca entra lo tecnico, pero explicado para que el usuario igual entienda las decisiones. Se apoya en la **matriz de stacks** del kit (no inventes stacks: usa el golden path).

Contiene:

### 2.1 — Stack elegido (de la matriz)
Que se usa y por que, en una linea cada uno. Ej: *Next.js 15 (web), Supabase (datos + login + permisos via RLS), Python solo si hay calculo pesado del ERP detras de una frontera (FastAPI sidecar).* Para elegir bien, apoyate en la skill **matriz-de-stacks**.

### 2.2 — Entidades y datos
Las cosas principales con las que trabaja la app (facturas, clientes, objetivos...) y como se relacionan, en lenguaje claro. Si hay tablas nuevas, nombralas y deci que campos clave llevan.

### 2.3 — Archivos y estructura
Que se va a tocar o crear, a grandes rasgos (no archivo por archivo): que pantallas, que endpoints/acciones, que tablas. En **brownfield**, aca va el **delta** de la skill **brownfield-openspec**:

```markdown
## ADDED (lo que se AGREGA)
### Requisito: <nombre>
El sistema DEBERA <comportamiento nuevo>.

## MODIFIED (lo que CAMBIA)
### Requisito: <nombre>
El sistema DEBERA <comportamiento actualizado>. (Previously: <como era antes>)

## REMOVED (lo que se SACA)
### Requisito: <nombre>
(Razon de la baja)

## Lo que NO cambia (queda IGUAL)
- <lista explicita> -> esto delimita el blast radius y es lo que mas tranquiliza en una app andando.
```

### 2.4 — Contratos
Las "fronteras" claras entre piezas: forma de los datos que entran y salen de cada endpoint/accion, el schema de validacion (zod), y la **frontera del sidecar Python** si lo hay (que recibe, que devuelve, por que puerto). Estos contratos son lo que evita que la sesion fresca improvise formatos.

### 2.5 — Concerns transversales activos
Lista cuales de los concerns de la **constitution** aplican a este cambio y como se cubren. **No los inventes ni te los saltees**: apoyate en la skill **checklist-concerns** para no olvidar ninguno. Los que casi siempre aplican:

- **Roles / permisos (RBAC):** quien ve y quien puede tocar. Recorda: CASL esconde botones en la UI, **RLS** es la seguridad real en la base.
- **Listas / catalogos configurables desde panel:** lo que el negocio querria cambiar sin llamarte = fila en una tabla editable, **nunca hardcodeado**.
- **Manejo de errores estandar:** que ve el usuario cuando algo falla, y que se reintenta.
- **Logging / observabilidad (Sentry):** los errores se registran para revisarlos.
- **Auditoria / activity-log:** quien hizo que y cuando. En apps de plata/facturacion **no es opcional**.
- **i18n** (si aplica): se decide al dia 1, es carisimo de meter despues.

---

## Artefacto 3 — TASKS (el plan, en orden)

Responde **en que orden** se construye. Es la lista de pasos que la sesion fresca va a seguir. Cada tarea tiene que ser **chica, revisable y con un criterio binario** (se cumplio: si / no — sin medias tintas).

```markdown
## Tareas (en orden)

- [ ] T1 — <accion concreta>.
      Listo cuando: <criterio binario verificable>.
- [ ] T2 — <accion concreta>.
      Listo cuando: <criterio binario verificable>.
      Depende de: T1.
```

Reglas de las tareas:

- **Ordenadas por dependencia:** primero datos/schema, despues backend, despues UI. Lo que otras tareas necesitan va antes.
- **Criterio binario obligatorio:** "Listo cuando: la tabla `objetivos` existe con RLS y un admin puede crear un objetivo desde el panel" — no "Listo cuando: anda bien".
- **Tamano de un commit:** cada tarea deberia poder cerrarse en una sesion corta y dejar el repo en verde (lint + typecheck + test).
- La ultima tarea es **siempre** la verificacion end-to-end (ver mas abajo).

---

## Seccion `## Supuestos` (informed guesses con impacto)

Va en el SPEC (artefacto 1). Es lo que te permite **no frenarte preguntando todo**: lo que no es critico, lo **asumis** con una conjetura razonable y lo **dejas registrado** para que el usuario lo pueda corregir de un vistazo. Cada supuesto lleva su **impacto** si estuviera equivocado:

```markdown
## Supuestos

- [IMPACTO ALTO] Asumimos que solo los admin pueden editar las listas de catalogos.
  (Si esto esta mal, cambia el modelo de permisos entero.)
- [IMPACTO MEDIO] Asumimos que la facturacion del ERP se importa una vez por dia, no en tiempo real.
- [IMPACTO BAJO] Asumimos que los montos se muestran en pesos sin separador de miles configurable.
```

- **ALTO** = si me equivoco, cambia ramas enteras del diseno. Estos conviene confirmarlos antes de marcar READY.
- **MEDIO** = afecta una parte, pero se ajusta sin rehacer todo.
- **BAJO** = detalle cosmetico o facil de cambiar despues.

Diferencia clave: lo que cambia ramas enteras y NO se puede asumir -> va como `[NEEDS CLARIFICATION]`. Lo que se puede asumir razonablemente -> va aca, con su impacto.

---

## Limites de 3 niveles (Verde / Ambar / Rojo)

Esta seccion va en el spec para que la **sesion fresca** sepa que puede hacer sola, que tiene que preguntar, y que tiene PROHIBIDO. Es la red de seguridad de la corrida autonoma.

```markdown
## Limites para la ejecucion (3 niveles)

### Verde — hace esto sin preguntar
- Crear/editar los archivos listados en las TASKS.
- Correr lint, typecheck y tests.
- Instalar las dependencias del stack ya elegido.

### Ambar — PARA y pregunta antes de hacerlo
- Cambiar el schema de la base de un modo no previsto en el DESIGN.
- Agregar una dependencia que no estaba en el plan.
- Tomar una decision de producto que no esta en el spec.

### Rojo — NUNCA, bajo ninguna circunstancia
- Tocar datos de produccion o correr migraciones destructivas.
- Cambiar reglas de seguridad/RLS sin que esten en el spec.
- Borrar archivos fuera del alcance de esta feature.
- Pushear o desplegar sin aprobacion explicita.
```

Ajusta cada lista al cambio concreto, pero **siempre incluí los tres niveles**. El nivel Rojo es el que evita los desastres durante la hora autonoma.

---

## Paso de verificacion end-to-end (auto-correccion)

El spec cierra con un **guion de verificacion** que la sesion fresca corre al final para **auto-corregirse** sin que vos tengas que mirar codigo. Tiene que ser concreto y observable:

```markdown
## Verificacion end-to-end (correr al terminar)

Recorrido completo, como lo haria un usuario real:
1. <accion> -> resultado esperado observable.
2. <accion> -> resultado esperado observable.
3. Caso de error: <provoca un fallo> -> el sistema reintenta/avisa/loguea como dice el criterio EARS.

Evidencia a entregar (no un "listo"):
- Salida de lint + typecheck + tests en verde.
- Captura o descripcion del recorrido feliz funcionando.
- Confirmacion de que el caso de fallo se maneja como dice el spec.
```

Regla para el usuario: cuando ejecutes el spec en la sesion fresca, **pedi esta evidencia**, no aceptes un "ya esta".

---

## Antes de marcar READY — auto-review

Antes de dar el spec por terminado, **auto-revisalo** (y arregla inline lo que encuentres):

- [ ] No quedan placeholders sin resolver (busca `TODO`, `XXX`, `<...>`, `[NEEDS CLARIFICATION]` de mas).
- [ ] No hay contradicciones entre SPEC, DESIGN y TASKS.
- [ ] Cada user story P1 tiene al menos un criterio EARS.
- [ ] Los criterios cubren camino feliz + casos borde + fallos.
- [ ] Cada concern transversal que aplica esta contemplado (cruzalo con **checklist-concerns**).
- [ ] Cada tarea tiene un criterio binario "Listo cuando: ...".
- [ ] Estan las tres listas de limites (Verde / Ambar / Rojo).
- [ ] Esta el paso de verificacion end-to-end con evidencia pedida.
- [ ] El stack es coherente con `project.yaml` (si existe).

Para un cambio grande o sensible (plata, facturacion, permisos), ademas **delega al subagente `redteam-spec`** para que ataque el spec y reporte SOLO gaps de correctitud/requisitos (no sobre-ingenieria). Integra sus hallazgos validos.

Cuando todo esto pasa **y el usuario lo leyo y aprobo**, cambia el Estado a `READY`.

---

## Skills relacionadas

- **checklist-concerns** — la constitution: que concern transversal no se te puede escapar (seccion 2.5 y el auto-review).
- **matriz-de-stacks** — de donde sale el stack del DESIGN (seccion 2.1).
- **brownfield-openspec** — el delta ADDED/MODIFIED/REMOVED y el "que NO cambia" (seccion 2.3), solo en brownfield.
- **elicitacion-avanzada** — para afilar el diseno ANTES de escribirlo, si una seccion quedo floja.

## Recordatorios

- Escribis en **espanol claro (vos)**: el usuario lee el spec, no el codigo.
- **HALT** antes de tocar el archivo: pedi el "si" explicito.
- El spec se vuelca en 3 artefactos (SPEC -> DESIGN -> TASKS), con Supuestos, limites de 3 niveles y verificacion end-to-end.
- Criterios de aceptacion **siempre** en EARS suavizado (condicion -> DEBERA -> respuesta).
- Termina en `READY` recien tras auto-review + aprobacion del usuario; ejecuta una **sesion fresca**, no vos.
