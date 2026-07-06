# Tutorial 01 — Tu primer uso de `/arquitecto` en una app nueva (de punta a punta)

> **Para quién es esto:** vos, que **no programás**, querés arrancar una app desde cero y que Claude Code te la construya bien — sin olvidarte de las cosas que después duelen (roles, listas configurables, errores, logging). Este tutorial te muestra el camino completo, paso a paso, **con un ejemplo concreto** y mostrándote **qué vas a ver vos en cada momento**.
>
> **Antes de empezar:** tené el plugin instalado (mirá [`00-instalacion.md`](00-instalacion.md)). Si en el menú de `/` te aparecen `/vibe-kit:arquitecto` y `/vibe-kit:nueva-app`, estás listo.

---

## El mapa en una sola imagen

Todo el flujo son **5 etapas**. La idea de fondo: **vos dirigís y aprobás en español; Claude diseña y después ejecuta; vos nunca leés código.**

```
1) CHARLA          2) SPEC            3) APROBAR         4) SESIÓN FRESCA      5) EJECUTAR
   /arquitecto  →  el Arquitecto   →  vos leés el     →  abrís un chat      →  "implementá el
   te entrevista    escribe un         spec EN            NUEVO y limpio        spec en <ruta>"
   (read-only,      SPEC.md a          ESPAÑOL y          (commit en git        + dial en Auto
   no toca código)  disco              decís READY        primero)              → Claude trabaja solo
```

Dos reglas que el Arquitecto **nunca** rompe, y conviene que las tengas claras vos también:

- **HARD GATE:** el Arquitecto **no escribe ni una línea de código** hasta que vos apruebes el diseño. Lo único que toca en disco es el spec (un archivo `.md`).
- **El que ejecuta NO es el Arquitecto.** Cuando el spec está aprobado, **abrís una sesión nueva** y ahí recién se construye. Esto es a propósito: separa "pensar" de "hacer", y mantiene cada chat enfocado.

> **¿`/arquitecto` o `/nueva-app`?** Las dos arrancan una app de cero. `/nueva-app` te hace primero un cuestionario corto con pantallitas de opción múltiple y escribe un `project.yaml` (la "ficha" del proyecto), y después te pasa al Arquitecto. `/arquitecto` va directo a la entrevista conversacional. **En este tutorial usamos `/arquitecto` directo** para que veas la charla completa; al final te muestro cómo encaja `/nueva-app` si preferís empezar por ahí.

---

## El ejemplo que vamos a usar

Para que no sea abstracto, seguimos un caso concreto de punta a punta:

> **"Quiero una app web para cargar los objetivos de venta de mi equipo y ver cómo van contra lo facturado."**

Es una app de **gestión con tableros**, la usa **un equipo** (o sea, hay login y roles), y toca **datos de facturación** (puede entrar el especialista de datos en Python). Es justo el tipo de app donde, si te olvidás de los concerns transversales al principio, después llorás. Vamos a ver cómo el Arquitecto no te deja olvidártelos.

---

## ETAPA 1 — La charla (`/arquitecto`)

### Cómo arrancás

Abrí Claude Code en VSCode, **en la carpeta donde va a vivir tu proyecto** (puede estar vacía). En el cuadro de chat escribí:

```
/arquitecto una app para cargar objetivos de venta y compararlos con lo facturado
```

Lo que va después de `/arquitecto` es opcional: es tu pedido en una frase. Si no ponés nada, el Arquitecto te lo va a preguntar.

> **Tip de modo:** en tu primer mes, dejá **Plan Mode siempre prendido** (en VSCode lo cambiás con el indicador al pie del cuadro de prompt, o con `Shift+Tab`). El Arquitecto ya corre read-only de por sí, pero Plan Mode es tu cinturón de seguridad extra: garantiza que nada se escribe sin tu OK.

### Qué hace el Arquitecto por dentro (no lo ves, pero conviene saberlo)

1. **Mira la carpeta** para detectar si ya hay código. Tu carpeta está vacía → es una app **nueva** (greenfield), así que va directo a entrevistarte. (Si hubiera una app andando, primero la exploraría con un ayudante y recién después te preguntaría. Eso lo ves en el [Tutorial 02](02-app-existente-erp.md).)
2. **Carga su material de referencia del kit**, sin recitártelo:
   - el **checklist de concerns** (roles/permisos, listas configurables, manejo de errores, logging, auditoría, i18n) — son los dolores que SIEMPRE se olvidan, y vienen activados por defecto;
   - la **matriz de stacks** (el "golden path": Next.js para web, Expo para Android, Tauri para Windows; Supabase para datos+login; y **Python solo como especialista de datos detrás de una frontera**).

### Cómo te pregunta (y qué ves vos)

El Arquitecto pregunta **de a una cosa por vez** (o tandas muy chicas), **siempre con opciones numeradas** y **una marcada `Recomendado`** con el motivo en una frase. Vos podés responder de tres formas:

- el **número** de la opción (`1`),
- **"recomendado"** o **"dale"** (toma la sugerida),
- o una **respuesta libre corta**.

Y siempre tenés un atajo: si escribís **`defaults`**, avanza con todas las recomendadas de un saque.

El reparto del tiempo es a propósito: **primero el problema** (¿qué te duele, quién lo sufre, cada cuánto?), **después el diseño**.

#### Lo que vas a ver, mensaje por mensaje (ejemplo real)

**El Arquitecto:**

> ¡Buenas! Soy el Arquitecto. Antes de diseñar nada, quiero entender bien el problema. Te voy a hacer unas preguntas cortas, de a una, con opciones. Podés responder con el número, con "recomendado", o a tu manera. Si en algún momento querés ir rápido, escribí `defaults` y avanzo con las recomendaciones.
>
> Arranquemos por el dolor. **¿Qué es lo que hoy te roba más tiempo o te da más bronca?**
> 1. Cargo o copio datos de un lado a otro (ej.: del sistema de facturación a un Excel) — **Recomendado para tu caso**, suena a tu problema de objetivos vs. facturado.
> 2. Me tengo que acordar de hacer algo a mano y a veces se me pasa.
> 3. No tengo una vista clara de cómo van los números.
> 4. Otra (contámelo en una frase).

**Vos:**

> 3, y un poco la 1. Hoy tengo los objetivos en un Excel y la facturación en el sistema, y los cruzo a mano cada fin de mes.

**El Arquitecto:**

> Clarísimo. Entonces el dolor es **falta de visibilidad** + **cruce manual mensual**. **¿Esta app la vas a usar vos solo, tu equipo, o también gente de afuera (clientes)?**
> 1. Solo yo.
> 2. **Mi equipo interno** — **Recomendado** por lo que contás (vendedores con objetivos). Esto activa usuarios y roles.
> 3. Equipo + clientes externos (ojo: esto es una decisión casi irreversible, la vemos con cuidado si la elegís).

**Vos:**

> 2

**El Arquitecto:**

> Bien, equipo interno. Eso quiere decir que la app va a tener **login** y **roles** (no es lo mismo un vendedor que un gerente). Ya lo dejo anotado.
>
> Última del bloque "problema": **¿con qué resolvés esto hoy?**
> 1. Excel / planillas — **Recomendado como respuesta** si es tu caso, me dice de dónde venimos.
> 2. Una herramienta que pagás pero no te alcanza.
> 3. Nada, está todo en tu cabeza o en papel.
> 4. Una app vieja que querés reemplazar.

**Vos:**

> 1

A partir de acá el Arquitecto pasa al **diseño** (la parte larga, 60-70% del tiempo). Las preguntas se vuelven sobre *qué construir*: tipo de app, entidades, login, roles, si entra Python, dashboards. Por ejemplo:

> Ahora vamos al **qué construimos**. **¿Dónde la vas a usar principalmente?**
> 1. **En el navegador, desde cualquier compu (web)** — **Recomendado**: es lo más simple de arrancar y de compartir con tu equipo.
> 2. En el celular Android (app instalable).
> 3. Como programa de Windows en tu máquina.
> 4. Es sobre todo procesar datos y ver tableros.

> **¿La app necesita levantar datos de tu sistema de facturación, aplicar fórmulas o armar reportes pesados?**
> 1. **Sí: levanta la facturación, aplica fórmulas y arma tableros** — **Recomendado para tu caso** → activa un especialista de datos en Python *detrás de una frontera* (separado de la pantalla; en criollo: un motorcito aparte que hace los números pesados).
> 2. Cálculos simples nomás (sumas, totales) → todo en un solo lenguaje, sin Python.
> 3. No, es alta/baja/modificación común.

Fijate dos cosas clave:

- **El Arquitecto te explica la jerga en 5 palabras.** "Multi-tenant", "RLS", "sidecar" nunca aparecen pelados: siempre con una aclaración entre paréntesis.
- **No te pregunta de más.** Lo que no es crítico (¿qué color de botones? ¿qué nombre exacto de tabla?) **no te lo pregunta**: lo asume con un default sensato y lo anota como **supuesto** en el spec. Solo te pregunta lo que **cambia una rama entera** de la decisión.

### Los concerns transversales: acá está la magia

En algún punto del diseño, el Arquitecto te va a confirmar **los concerns que vienen activados por defecto**. Esto es el corazón del kit: es lo que evita que dentro de tres semanas descubras que te falta el registro de quién cargó cada objetivo.

**El Arquitecto:**

> Hay un set de cosas que casi siempre hacen falta y que, si te olvidás al principio, después salen carísimas de agregar. **Vienen TODAS activadas.** Te las muestro y vos destildás solo lo que estés 100% seguro de no querer:
>
> - ☑️ **Roles / permisos** — quién puede hacer qué (un vendedor ve lo suyo, el gerente ve todo).
> - ☑️ **Listas configurables desde un panel** — categorías, sucursales, vendedores, estados: los editás vos sin pedirle ayuda a nadie.
> - ☑️ **Manejo de errores estándar** — cuando el sistema de facturación no responde, la app avisa claro y reintenta.
> - ☑️ **Logging / observabilidad (Sentry)** — queda registro de los errores para poder revisarlos.
> - ☑️ **Auditoría / activity-log** — quién hizo qué y cuándo. **En apps de plata/facturación esto no es opcional.**
> - ☐ **i18n (varios idiomas)** — lo dejo apagado porque me dijiste "solo español por ahora".
>
> ¿Dejamos así, o querés sacar/agregar alguno?

**Vos:**

> Dejá todo así, está perfecto.

> **Por qué esto importa tanto:** este es exactamente tu dolor #1 (olvidar los concerns transversales y tener que refactorizar tarde). El Arquitecto los pone **default ON** para que el costo de tenerlos sea casi cero al principio, en vez de carísimo después.

### Refinar el diseño: el menú de elicitación (opcional pero potente)

Cuando el Arquitecto te presenta una sección del diseño, además de pedirte aprobación te ofrece un **menú para mejorarlo** mirándolo con "lentes" distintas:

> Esta sección del diseño quedó así. Antes de seguir, ¿querés que la afilemos un poco? Elegí una lente:
> 1. **Pre-mortem** — imaginemos que esto fracasó en 6 meses: ¿por qué?
> 2. **Primeros principios** — ¿estamos resolviendo el problema real o uno inventado?
> 3. **Inversión** — ¿qué garantizaría que esto salga mal?
> 4. **Red team** — busco agujeros como si quisiera romperlo.
> 5. **Socrático** — te hago preguntas que destapan supuestos ocultos.
>
> Elegí un número (1-5), `[r]` para rebarajar las opciones, `[a]` para ver todas, o `[x]` para continuar.

No estás obligado a usarlo. Si escribís `x`, sigue. Pero para decisiones importantes (sobre todo las que tocan plata o permisos), un **pre-mortem** suele ahorrarte un dolor de cabeza. Después de aplicar una lente, te vuelve a ofrecer el mismo menú, hasta que digas `x`.

> **Una protección que vas a notar:** el Arquitecto **nunca cambia el diseño sin tu OK explícito**. Antes de aplicar cualquier modificación al documento te pregunta `(s/n/otra)` y **frena a esperar tu respuesta**. A esto le decimos el **HALT**. Junto con el HARD GATE (no escribe código hasta aprobar), son los dos candados que te mantienen al volante.

### El mini-contrato (la charla converge)

Cuando ya está todo discutido, el Arquitecto te re-enuncia todo en un párrafo corto, para que confirmes que entendió bien:

> Entonces, para que quede claro lo que vamos a construir:
> **App web** para cargar **objetivos de venta** por vendedor y por período, y un **tablero** que los compara contra lo **facturado** (que se levanta de tu sistema). Con **login** y **dos roles** (gerente: ve y configura todo; vendedor: ve lo suyo y carga sus avances). Listas editables desde un panel (vendedores, sucursales, períodos). Errores manejados, todo logueado, y un registro de auditoría de quién tocó qué. La facturación pesada la procesa un **motorcito de datos aparte** (Python), separado de la pantalla.
> **Queda afuera de esta primera versión:** comisiones, exportar a PDF y notificaciones por mail (los dejamos para más adelante).
>
> ¿Lo escribo así en el spec? Te ofrezco dos modos:
> - **Borrador rápido** — escribo el spec ya, con los supuestos marcados — **suele ser el mejor default para vos.**
> - **Q&A exhaustivo** — te hago algunas preguntas más antes de escribir.

**Vos:**

> Borrador rápido, dale.

---

## ETAPA 2 — El SPEC (el Arquitecto escribe a disco)

Acá el Arquitecto hace **su única escritura permitida**: deja un archivo de spec en tu proyecto.

- Si el cambio es **chico**, escribe un solo `SPEC.md`.
- Si es **grande** (como nuestro ejemplo), escribe una carpeta `.claude/specs/{feature}/` con tres archivos: `requirements.md` (qué y por qué), `design.md` (cómo) y `tasks.md` (el plan de tareas).

### Qué ves vos

> Listo, escribí el spec en **`.claude/specs/objetivos-vs-facturacion/`** (tres archivos: requisitos, diseño y tareas). Te dejo el resumen en castellano.

Y abre el archivo, o te lo resume. **Vos no leés código** — leés un documento en español que cualquiera entiende. Por ejemplo, la parte de requisitos se ve así (en lenguaje testeable, pero claro):

```markdown
# SPEC — Objetivos de venta vs. Facturación
Estado: BORRADOR

## Qué construimos y por qué
Una app web para que un equipo de ventas cargue objetivos por vendedor
y período, y vea un tablero que los compara contra lo facturado real.
Resuelve: hoy se cruza a mano en Excel cada fin de mes (lento y propenso a errores).

## User stories
- Como **gerente**, quiero cargar objetivos por vendedor y período,
  para fijar metas claras.
- Como **vendedor**, quiero ver mi objetivo y mi avance,
  para saber cómo voy sin pedírselo a nadie.

## Criterios de aceptación (en formato testeable)
- CUANDO un gerente carga un objetivo, el sistema DEBERÁ guardarlo
  asociado a un vendedor y un período.
- CUANDO se actualiza la facturación, el tablero DEBERÁ recalcular
  el % de avance de cada vendedor.
- SI el sistema de facturación no responde, ENTONCES la app DEBERÁ
  reintentar 3 veces y registrar el error.

## Supuestos (cosas que asumí sin preguntarte)
- [MED] La facturación se levanta una vez por día (no en tiempo real).
- [LOW] Los períodos son mensuales (no quincenales).

## Concerns activos (de la constitution)
- Roles/permisos · Listas configurables · Manejo de errores
- Logging (Sentry) · Auditoría

## Fuera de alcance (v1)
- Comisiones · Export a PDF · Notificaciones por mail
```

El `design.md` agrega el stack concreto (Next.js + Supabase + un sidecar Python para la facturación), qué archivos se tocan y los contratos. El `tasks.md` parte el trabajo en tareas chicas con criterios binarios ("hecho / no hecho"). **Todo en español, todo revisable por vos.**

> Fijate en la sección **`## Supuestos`**: ahí está todo lo que el Arquitecto **decidió por vos sin preguntarte** (porque no era crítico), con su nivel de impacto. Es tu oportunidad de decir "ojo, esto está mal" antes de que se construya nada.

---

## ETAPA 3 — Vos aprobás (y el spec queda `READY`)

Ahora viene **tu** trabajo, el único innegociable: **leer el spec en español y aprobarlo** (o pedir cambios). No leés código; leés el plan.

Cosas que conviene que mires:

- ¿La sección **"Qué construimos"** es realmente lo que querés?
- ¿Los **supuestos** te cierran? Si alguno está mal, decilo: *"Ojo, los períodos son quincenales, no mensuales"* → el Arquitecto corrige el spec (te va a pedir el `s/n` del HALT antes de tocarlo).
- ¿El **"Fuera de alcance"** te deja tranquilo de que no nos estamos enganchando de más en la v1?

Cuando estás conforme:

**Vos:**

> Está perfecto. Aprobado.

**El Arquitecto:**

> **Listo, marco el spec como `READY`.** A partir de acá, yo no lo ejecuto. Acordate del paso siguiente: abrís una **sesión NUEVA y fresca** para construirlo, así no arrastra toda esta charla. En esa sesión:
> 1. **Commiteá en git primero** (red de seguridad: si algo sale mal, volvés atrás).
> 2. Poné el dial de autonomía en **Auto / acceptEdits** (Claude edita sin pedirte permiso por cada cambio).
> 3. Decile: *"Implementá el spec en `.claude/specs/objetivos-vs-facturacion/`"*.
>
> Vos revisás en español el resultado y la **evidencia** (que ande, que pase los tests), no el código.

Y acá **termina la sesión del Arquitecto**. Su trabajo era pensar y escribir el plan. No sigue a la ejecución a propósito.

> **¿Por qué una sesión nueva y no seguir en esta?** Porque esta charla tiene un montón de contexto (todas las preguntas y respuestas) que la fase de construcción no necesita y que solo le quita lugar al laburo real. Una sesión fresca arranca limpia, lee el spec, y se concentra 100% en construir. Es la diferencia entre un chat enfocado y un "mega-chat" que se ensucia.

---

## ETAPA 4 — Sesión fresca (preparás la ejecución)

### El commit primero (tu red de seguridad)

Antes de que Claude construya nada, **commiteá en git**. Así, si la corrida autónoma sale para cualquier lado, volvés atrás con un comando. Si no tenés nada commiteado todavía, en una terminal:

```bash
git init
git add -A
git commit -m "checkpoint: antes de implementar objetivos-vs-facturacion"
```

> No te asustes con git: pensalo como un "guardar partida". El commit es el punto al que podés volver. (Los checkpoints internos de Claude —`/rewind`— **no** son git; commiteá de verdad igual.)

### Abrís el chat nuevo

En Claude Code, **abrí una sesión nueva y limpia** (`/clear` borra todo el contexto del chat actual, o simplemente abrí un chat nuevo). Estás en cero, sin la charla del Arquitecto encima. 

### Subís el dial de autonomía

Para la fase de construcción querés que Claude **edite sin pedirte permiso por cada archivo**. Poné el modo en **Auto** o **acceptEdits** (en VSCode, con el indicador al pie del prompt o `Shift+Tab`). Esto es seguro **porque ya commiteaste**: tu red está puesta.

> ⚠️ **Nunca uses bypass/YOLO fuera de un entorno aislado.** Auto/acceptEdits alcanza y sobra para esto.

---

## ETAPA 5 — Ejecutar (Claude construye solo)

En la sesión fresca, con el dial en Auto, le pasás la orden:

```
Implementá el spec en .claude/specs/objetivos-vs-facturacion/.
Andá tarea por tarea. Al final, mostrame evidencia de que funciona.
```

A partir de acá, **Claude trabaja**. Lee el spec, sigue las tareas del `tasks.md`, escribe el código, instala lo que necesite, y va cerrando cada tarea. El kit trae un **Stop hook** (en `hooks/hooks.json`) pensado para que, al cerrar cada turno, corra **lint + typecheck + test** automáticamente — un control de calidad que no depende de que Claude se acuerde, sino que pasa siempre por código. Ojo: ese hook necesita que existan sus scripts (`hooks/scripts/verify.ps1`) para hacer algo; mientras no estén, no rompe nada pero tampoco verifica (sale con "todo OK" en vacío). Hasta que los tengas configurados para tu stack, el control de calidad lo hacés vos pidiendo **evidencia** (lo de abajo).

### Qué ves vos (y qué pedís)

Vas a ver a Claude trabajando: archivos que crea, comandos que corre. **No tenés que leer el código.** Lo que SÍ tenés que hacer es **pedir evidencia, no un "listo"**:

**Vos:**

> ¿Cómo sé que el tablero anda? Mostrame que carga un objetivo y se ve el avance.

**Claude:**

> Levanté la app en local. Cargué un objetivo de prueba (vendedor "Ana", período "junio", meta $500.000). El tablero muestra el avance contra la facturación de prueba (62%). Los tests pasan (8/8). Acá está la captura del tablero y la salida de los tests.

Eso es evidencia. Un "ya está implementado" sin nada que lo respalde, **no lo aceptes**: pedí que te muestre que funciona.

### Si algo sale mal

- ¿Claude corrigió **lo mismo dos o más veces** y no sale? El contexto está envenenado. **No insistas en el mismo chat**: hacé `/clear` y volvé a arrancar con una instrucción más precisa. Sesión limpia > sesión larga contaminada.
- ¿Se fue para cualquier lado? Para eso commiteaste. Volvés al checkpoint con git y arrancás de nuevo.

---

## Recapitulando: el camino completo

| Etapa | Comando / acción | Quién trabaja | Qué entregás vos | Qué obtenés |
|---|---|---|---|---|
| 1. Charla | `/arquitecto <tu pedido>` | Arquitecto (read-only) | Respondés preguntas de opción múltiple | Diseño consensuado |
| 2. Spec | (automático) | Arquitecto escribe a disco | Nada | `SPEC.md` o `.claude/specs/{feature}/` |
| 3. Aprobar | Leés el spec en español | Vos | "Aprobado" → spec `READY` | Plan firmado |
| 4. Sesión fresca | `git commit` + chat nuevo + dial Auto | Vos | Commiteás y abrís chat limpio | Red de seguridad puesta |
| 5. Ejecutar | "Implementá el spec en `<ruta>`" | Claude (autónomo) | Pedís **evidencia** | App funcionando |

**La regla que resume todo:** *ambiguo en la charla, específico en el spec.* En la charla dejás que el Arquitecto te entreviste y proponga (está bien ser impreciso). Todo lo que querés construido va al spec con la máxima precisión. Un buen spec le quita a Claude 15-20 decisiones que, si no, improvisaría.

---

## Variante: empezar por `/nueva-app` (cuestionario + ficha del proyecto)

Si preferís arrancar con un **cuestionario de pantallitas** en vez de una charla abierta, usá `/nueva-app` primero:

```
/nueva-app objetivos-de-venta
```

`/nueva-app` te hace 8-12 preguntas de opción múltiple (con `Recomendado` en cada una), te muestra el **checklist de concerns** como multi-select (todo tildado por defecto), y escribe un **`project.yaml`** en la raíz: la "ficha" portable de tu proyecto (qué es, qué stack, qué concerns están activos). Igual que el Arquitecto, **no escribe código**: lo único que toca es ese archivo, y solo después de tu "sí".

Cuando termina, **te pasa la posta al Arquitecto** automáticamente para el primer spec — y el Arquitecto **lee el `project.yaml`** como contexto base, así no repetís lo que ya respondiste. O sea, los dos caminos confluyen:

```
Camino A (charla directa):   /arquitecto  →  spec  →  aprobar  →  sesión fresca  →  ejecutar
Camino B (ficha primero):    /nueva-app  →  project.yaml  →  /arquitecto  →  spec  →  ...
```

**¿Cuál elegir?** Si ya tenés bastante claro qué querés, `/arquitecto` directo es más rápido. Si querés que te guíen decisión por decisión y dejar una ficha del proyecto a disco desde el minuto cero, empezá por `/nueva-app`.

---

## Mini-FAQ

**¿El Arquitecto puede romper algo de mi proyecto?**
No. Corre read-only, en Plan Mode. Su única escritura es el spec (`.md`). No instala, no scaffoldea, no corre comandos que cambien tu código.

**Me hizo una pregunta y no sé qué responder.**
Elegí la opción `Recomendado`, o escribí `defaults` para que avance con todas las recomendadas. Siempre podés cambiar algo después, en el spec.

**¿Tengo que leer el código que escribe en la etapa 5?**
No. Tu trabajo es leer el **spec en español** (etapa 3) y pedir **evidencia** de que funciona (etapa 5). El código no lo revisás.

**Cerré el chat del Arquitecto sin querer y el spec ya estaba escrito. ¿Lo perdí?**
No. El spec está **en disco** (`.claude/specs/...` o `SPEC.md`), no en el chat. Por eso el handoff es por archivo: abrís una sesión nueva, le decís "implementá el spec en `<ruta>`" y listo.

**¿Y si durante la charla me doy cuenta de que quiero un comando propio para algo que voy a repetir?**
Decíselo. El Arquitecto te ofrece **fabricarte un comando o un agente** propio (con la skill `crear-agentes-y-comandos`, o vos directamente con `/crear-rol`). Así la próxima lo invocás con un `/` y no se lo tenés que explicar de nuevo. Esto está bueno porque el rol queda en un **lugar durable** (un archivo en disco), no en un mensaje suelto que se pierde cuando hacés `/compact`. Eso se ve en detalle en [`03-convertir-chats-en-comandos.md`](03-convertir-chats-en-comandos.md) y [`04-compactacion-y-roles.md`](04-compactacion-y-roles.md).

---

## Próximos pasos

- **Tenés una app que ya anda** y querés cambiarla → [`02-app-existente-erp.md`](02-app-existente-erp.md) (brownfield: el Arquitecto explora el código antes de entrevistarte).
- **Querés fabricar tus propios comandos/agentes** → [`03-convertir-chats-en-comandos.md`](03-convertir-chats-en-comandos.md).
- **Te preocupa que Claude se "olvide" del rol al compactar** → [`04-compactacion-y-roles.md`](04-compactacion-y-roles.md).
- **No tenés claro cuándo usar qué** (subagente vs. principal, plan vs. directo) → [`05-cuando-usar-que-orquestacion.md`](05-cuando-usar-que-orquestacion.md).
