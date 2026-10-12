# SPEC: Investigación de las conversaciones — vibe-kit

Leer, con agentes y sin quemar el contexto de nadie, todo lo que Guido trabajó con Claude Code en sus
PCs desde agosto, y convertirlo en **un informe con propuestas** (formato tanda) que alimente el
rediseño del pack: Arquitecto, skills, agentes, el método director/obrero y la documentación de proyectos.

- Estado: **✅ READY 2026-10-12** — D1-D5 decididas; red-team 1 ronda (NO READY: 2 críticos, 2 altos,
  1 medio — **todos foldeados**). Aprobado por Guido.
- Fecha: 2026-10-12
- Origen: charla del 2026-10-12 (sesión de `/inicio` del proyecto madre). Guido: *"que mandes varios
  subagentes a analizar mis chats de todos los proyectos… ver cosas buenas, cosas malas, y remejorar
  todo el pack"*.
- Es la **misión 1 de 5** de la hoja de ruta (§ Hoja de ruta, al final).

---

## Por qué (el dolor)

1. **vibe-kit quedó 70 días sin tocarse mientras se usaba muchísimo.** El último handoff es del
   2026-08-03. En el medio, Guido usó el Arquitecto, `/relevamiento`, `docs-fyd` y el Equipador en
   proyectos reales, y armó un método entero nuevo (director/obrero) en Hermes. **Nada de eso volvió
   al kit.** El estreno de `/relevamiento` que el README espera *ya pasó* — y su evidencia vive en
   chats que nadie leyó.
2. **El método de Hermes está documentado, pero solo desde adentro de Hermes.** Lo que se repite en
   *todos* los proyectos (fricciones de Guido, fallas de Claude, skills que faltan) no lo ve ningún
   documento, porque cada uno mira su propio proyecto.
3. **La pregunta del costo no tiene número.** El método dice "~15× más tokens" y aclara que **es una
   estimación, no una medición** (`METODO_PROYECTO_LARGO.md` §1). Los transcripts tienen el consumo
   real por mensaje y por modelo. Sin medirlo, no se puede decidir qué baja a Sonnet o a Haiku.
4. **El volumen no entra en ningún contexto.** Medido el 2026-10-12 en esta PC (`clientes`): **1,9 GB,
   ~230 chats en 39 carpetas**, el 85% de Hermes (Desktop 90 chats / 795 MB · Mobile 94 / 681 MB). La
   mayor parte son salidas de herramientas. Leerlo crudo, aunque sea con agentes, es tirar plata.

---

## Alcance

**IN**
- Los transcripts de **las dos PCs**: `~/.claude/projects/*/*.jsonl` **más** los de subagentes,
  `~/.claude/projects/*/*/subagents/*.jsonl` (en esta PC son **941**, cada uno con un `.meta.json` que
  trae su `agentType`). **Nunca** `tool-results/` (son salidas de herramientas guardadas aparte).
- Los documentos de método ya escritos, como **contexto** de los agentes (no se re-analizan):
  - Desktop: `d:\Hermes\Hermes.exe\docs\metodo\` (`METODO_PROYECTO_LARGO.md`, `CAMBIOS.md`,
    `RELEVO_DIRECTOR.md`, las 2 bitácoras — la de identidad, de la rama `metodo/bitacora`).
  - Mobile: `d:\Hermes\Hermes mobile\docs\v4\METODO.md` (832 líneas) y `docs\WORKFLOW.md`.
- Los chats del **"capataz"** (el agente para oficinistas no-dev; 4 carpetas de pruebas en esta PC).
  El código fuente no está en esta PC — los chats son lo único que hay acá.
- **Medición de costo**: tokens por chat, por rol (director / obrero / subagente) y por modelo.

**OUT** (con razón)
- **Aplicar nada.** La investigación extrae y propone; la sesión madre decide (restricción dura 4 de
  `CLAUDE.md`, mismo contrato que el Extractor de tips).
- **Re-derivar lo que las bitácoras ya dicen.** Los F1-F50 y CM-1..62 ya están destilados; los agentes
  los reciben como "ya sabido" y buscan lo que **no** está ahí.
- **Leer contenido de negocio** (montos, clientes, datos de personas). Se busca cómo se trabaja, no qué
  se trabajó.
- **Mover los transcripts entre PCs.** Cada PC se analiza en su lugar; solo viajan los hallazgos.

---

## Las preguntas que contesta (y a quién le sirve cada una)

| # | Pregunta | Alimenta |
|---|---|---|
| Q1 | **¿Cuánto cuesta de verdad?** Tokens por rol y modelo; cuánto es caché; qué trabajo de Opus podría hacer Sonnet o Haiku sin perder calidad (buscar casos donde un modelo chico ya lo hizo bien) | Política de modelos de la capa Dirección |
| Q2 | **¿Qué falla se repite en varios proyectos?** Las de Claude, no las de Hermes | Playbook + reglas del pack |
| Q3 | **¿Qué hace Guido a mano una y otra vez?** Lo que pega, lo que repite, lo que corrige, cuándo se frustra | Skills/agentes nuevos (regla de 3+) |
| Q4 | **¿Cómo se usó el kit en la realidad?** Cada invocación del Arquitecto, `/relevamiento`, `docs-fyd`, el Equipador: qué preguntas sobraron, qué se saltó, qué improvisó Claude | Mejoras del kit + **los 11 criterios sin verificar del estreno de `/relevamiento`** |
| Q5 | **¿Qué le faltó saber a Claude del proyecto?** Momentos en que preguntó o decidió mal por no conocer el para-qué, los módulos o la infraestructura | El sistema de documentación (el "norte") |
| Q6 | **¿Qué del método director/obrero no está en las bitácoras?** Lo que pasó en los chats y nadie escribió; lo que Mobile y Desktop se contagiaron | La capa Dirección y la Mesa |
| Q7 | **¿Qué es el capataz y en qué estado quedó?** | Decidir si entra al pack |
| Q8 | **¿Qué funcionó claramente bien?** Con evidencia, para no romperlo al rediseñar | Todo |

---

## Cómo se hace — tres etapas

### Etapa 0 — Condensar (un script, sin agentes, en cada PC)

Un script versionado en el repo (`investigacion/condensar.py`) que, por cada `.jsonl`:

1. Se queda con **los mensajes de Guido, el texto de Claude y el nombre de cada herramienta usada**
   (no su salida). Las salidas de herramienta se reemplazan por una línea `[Bash: 12 KB]`.
   ⚠️ **"Mensaje de Guido" se define por TIPO DE BLOQUE, no por rol**: en el `.jsonl` las salidas de
   herramientas viajan con rol `user`. Cuenta solo una línea `type:user` cuyo contenido es **texto**,
   que **no** es `tool_result`, **no** es `isMeta`, y **no** trae `<bash-stdout>`,
   `<local-command-stdout>` ni `<system-reminder>`. Se ignoran `attachment`, `toolUseResult`,
   `file-history-snapshot` y `queue-operation`. *(Si no, un `!cat .env` de Guido entra como "mensaje".)*
2. **Enmascara** antes de escribir nada a disco. La lista de formas: JWTs, `sb_secret_`, `sbp_`,
   `sk-ant-`/`sk-`, `ghp_`/`github_pat_`, `AIza`, `AKIA`, `re_`, `APP_USR-`, `Authorization: Bearer`,
   `PGPASSWORD=`, URLs con `usuario:clave@`, `?apikey=`, bloques `-----BEGIN … PRIVATE KEY-----`, y la
   **regla genérica**: todo `NOMBRE=valor` o `"nombre": "valor"` cuyo nombre contenga PASS, PWD,
   SECRET, TOKEN, KEY o CREDENTIAL. Más una **regla de alta entropía** para lo que no tiene forma.
   **Y la lista de secretos REALES conocidos**, que Guido le pasa por variable de entorno: el script
   compara huellas, nunca imprime ni escribe el valor.
3. Saca las **métricas de costo** del campo `usage`. ⚠️ **Una respuesta del modelo ocupa varias líneas
   que repiten el mismo `usage`** (mismo `message.id`, y `output_tokens` creciendo a mitad de escritura):
   se agrupa por `message.id` y se toma **la ÚLTIMA línea** de cada uno antes de sumar. Si no, la caché
   sale inflada ×3 o más. El **rol** sale de `<sesión>/custom-title.json` (director, obrero, spec,
   release u otro; sin título = "sin rol"); un **subagente** es todo lo que está en `subagents/`, con su
   `agentType`. El modelo sale del campo `model`. Una fila por chat en un CSV.
4. Escribe todo en una carpeta **fuera del repo** (`D:\vibe-research\<pc>\`), nunca en `vibe-kit/`.
5. Imprime **el tamaño condensado total**. Con ese número se decide cuántos lotes hay en la Etapa 1.

Se prueba primero sobre **3 chats elegidos a mano** y se mira la salida antes de correrlo sobre todo
(lección F14/F21: un filtro que falla no avisa).

### Etapa 1 — Leer por lotes (agentes en paralelo, Sonnet)

- Un agente por **lote** (un proyecto chico, o un tramo de fechas de Hermes Desktop/Mobile).
- Cada uno recibe: las 8 preguntas, la lista de lo **ya sabido** (**índice de F y CM con una línea de
  resumen cada uno** — con solo el título no se puede saber si un hallazgo es un CM viejo con otras
  palabras), y la **plantilla de hallazgo** de abajo. El cruce fino contra el texto completo lo hace la
  Etapa 2.
- **Escribe a un archivo** (`D:\vibe-research\<pc>\hallazgos\<lote>.md`) y me devuelve solo 5 líneas.
  Así el contexto de la sesión madre no se llena.
- Prohibido copiar valores de secretos, datos de personas o montos — aunque el enmascarado haya fallado.

**Plantilla de hallazgo** (una por hallazgo):

```
### H-<lote>-<n> · <título en una línea>
- Pregunta: Q1..Q8
- Tipo: falla repetida | fricción de Guido | buena práctica | skill que falta | agente que falta | desperdicio de tokens | uso del kit
- Evidencia: <chat>, <fecha>, <cita corta o paráfrasis> — ¿cuántas veces lo viste?
- Ya sabido: no | sí, es <F-nn / CM-nn> (y qué agrega)
- Propuesta: <qué cambiaría en el pack, una línea>
```

### Etapa 2 — Sintetizar (un agente, Opus)

Lee todos los `hallazgos/*.md` de las dos PCs, **junta los duplicados, cuenta frecuencias**, cruza
contra el texto completo de F/CM antes de marcar algo como "nuevo", y ordena por impacto. Escribe el
informe final. La sesión madre lee **solo eso**.

---

## Salida

> 🔴 **`github.com/guidocameraeq/vibe-kit` es PÚBLICO** (verificado con `gh repo view` el 2026-10-12).
> Todo lo que se pushea ahí **no se puede despublicar**: borrar una rama no borra lo que ya se clonó o
> se cacheó. Esta sección se diseña alrededor de eso.

**`tips/tanda-2026-10-chats.md`**, con el mismo formato de acta que las tandas de tips: veredictos +
propuestas con checkbox `- [ ]`. Ventaja concreta: `/inicio` **ya** busca checkboxes sin procesar en
`tips/`, así que el informe no se puede olvidar.

**Lo único que entra al repo público**, y con tres condiciones:
1. El informe y `investigacion/costos.md` (la tabla de Q1: números, no prosa).
2. **En paráfrasis**: sin nombres de clientes, personas, montos, CUIT/DNI/CBU, mails ni citas textuales
   de proyectos de negocio. Se cita *"chat de Hermes Desktop, 2026-09-16"*, no lo que dice.
3. **Antes del commit**: un escáner de secretos independiente sobre el diff (gitleaks u otro — a
   instalar si falta) **y Guido mira el diff**. Sin las dos, no hay push.

Como las actas de `tips/` no se editan retroactivamente, **el filtro va antes del primer commit**: si
se cuela algo, la regla misma traba el arreglo.

**Lo que nunca entra al repo**: condensados, hallazgos crudos por lote. Viven en
`D:\vibe-research\<pc>\` y se borran al cerrar la misión 2, **en las dos PCs**.

---

## La otra PC

El **script** viaja por git (es código, no tiene datos). Los **hallazgos no**: el repo es público.
1. `git pull` de vibe-kit.
2. Se abre Claude Code en `vibe-kit/` y se le dice *"investigá esta PC"*. Corre la Etapa 0, la Etapa 1
   y **una mini-síntesis propia** ahí, sobre sus transcripts.
3. **Solo la mini-síntesis** viaja a esta PC, por un **canal privado** (D5).
4. La sesión madre (esta PC) hace la Etapa 2 sobre la síntesis de allá y los hallazgos de acá.

**Remote Control es el canal de coordinación**: desde acá se le despacha el encargo a la sesión de la
otra PC y se conversa con ella (ida y vuelta — **confirmado por Guido el 2026-10-12, ya lo usó**; no
probado todavía desde esta sesión). **Los archivos igual viajan por git**: un hallazgo por mensaje se
pierde con el chat, y un commit queda.

> Esta comunicación entre PCs es en sí misma una pieza que Guido quiere en el pack (se anota para la
> misión 4, junto con la Mesa entre directores).

---

## Criterios de aceptación

1. CUANDO corre la Etapa 0, el condensado DEBE tener **0 bloques `tool_result`** y **0 etiquetas**
   `<bash-stdout>` / `<local-command-stdout>` / `<system-reminder>` (conteo del script). El peso
   condensado se **informa** como dato; no es la prueba (un poco de salida filtrada no mueve el %).
2. El condensado DEBE dar **0 hallazgos con un detector DISTINTO al que enmascara** (escáner de
   secretos + regla de entropía), **Y 0 coincidencias contra la lista de secretos reales** que pasa
   Guido (por huella, sin imprimirlos). El control positivo verdadero es un secreto real conocido que
   **sí** aparece en los chats crudos: tiene que salir tapado. *(Un detector no se encuentra en falta a
   sí mismo: sin un segundo detector, este criterio se aprueba por construcción.)*
3. CADA lote DEBE tener su archivo de hallazgos, aunque diga "nada nuevo".
4. CADA hallazgo del informe final DEBE citar de qué chat sale y cuántas veces apareció.
5. El informe DEBE separar lo **nuevo** de lo **ya sabido** (F/CM) — si el 80% es ya sabido, la
   investigación sirvió para confirmar, y se dice así.
6. Q1 DEBE salir con números del campo `usage`, no con estimaciones; lo que no se pudo medir se marca
   **NO MEDIDO**.
7. En `vibe-kit/` (el repo) NO DEBE quedar ningún transcript ni condensado: solo el script, el informe
   y la tabla de costos. Ningún push sin escáner de secretos sobre el diff + diff mirado por Guido.
8. La sesión madre DEBE terminar la misión con más del 50% de su contexto libre (verificable con `/context`).
9. Al cerrar la misión 2, `D:\vibe-research\` DEBE estar borrado **en las dos PCs**, verificado en cada una.

---

## Decisiones

| # | Qué | Opciones | ⭐ Recomendación |
|---|---|---|---|
| D1 | **¿Cómo se orquesta la Etapa 1?** | (a) Una **Workflow** (orquestación automática, en segundo plano, con reintentos) · (b) Agentes lanzados a mano desde la sesión | ⭐ **(a)**. Son ~10-15 lotes por PC; a mano, cada resultado me vuelve al contexto. La Workflow necesita que lo pidas vos explícito ("usá una workflow") |
| D2 | **Modelo de los lectores** | (a) Sonnet · (b) Haiku · (c) Opus | ⭐ **(a) Sonnet** para leer, **Opus solo para sintetizar**. Haiku pierde los matices de fricción, que es lo que más importa acá. Y de paso medimos: si Sonnet lee bien, es evidencia para la política de modelos |
| D3 | **¿Todos los chats o una muestra de Hermes?** | (a) Todo · (b) Hermes muestreado (los días de cambio de método y las bitácoras como mapa) + todo lo demás | ⭐ **(b)**. Hermes ya tiene 5.000+ líneas de bitácora que lo destilan; leer sus 184 chats enteros repite el trabajo. Se leen los días en que la bitácora dice que algo cambió, **más 1 de cada 5 días SIN entrada en la bitácora, al azar y declarado** (si no, Q6 —"lo que nadie escribió"— solo vería lo que la bitácora ya marcó), y los de Mobile completos |
| D4 | **Presupuesto** | Un tope de tokens o plata para toda la misión | **Se fija después de la Etapa 0**, con el tamaño condensado en la mano. Antes es adivinar |

| D5 | **Canal privado entre PCs** para la mini-síntesis de la otra PC (agregada tras el red-team) | (a) Un repo **privado** aparte (`vibe-research`) · (b) OneDrive · (c) Mensaje por Remote Control | ✅ **(a), decidido 2026-10-12** (Guido delegó la elección). Se crea al arrancar la misión 2 y se borra al cerrarla. Descartada también la opción (d) que propuso Guido —hacer vibe-kit privado mientras dure y reabrirlo—: **rompe el `actualizate` del Equipador para la gente a la que se le compartió el Arquitecto** (baja del repo público), y al reabrir, commits de ramas borradas pueden seguir accesibles por SHA. Guido aclaró que en la otra PC son todos proyectos personales sin claves; el canal privado se mantiene igual porque cuesta lo mismo y no depende de esa afirmación |

> ✅ **DECIDIDO (Guido, 2026-10-12)** — D1 a D4 como se recomienda: D1 (a) Workflow · D2 Sonnet lee,
> Opus sintetiza · D3 (b) Hermes muestreado · D4 después de la Etapa 0. La Workflow de la misión 2
> queda pedida por Guido desde ya.

---

## Supuestos

**Verificados por el red-team (2026-10-12) contra archivos reales:** el campo `usage` existe (pero se
repite por línea — ver Etapa 0 paso 3) · el modelo viene en `model` · el rol por pestaña está en
`custom-title.json` · los subagentes tienen transcript propio en `subagents/` (941 en esta PC).

- [ALTO] **Una contraseña sin forma reconocible puede pasar el enmascarado** (Guido la pega suelta, o
  Claude la repite en prosa). Mitigación: la lista de secretos reales + la regla de entropía + los
  lectores con prohibición de copiar valores. Los datos personales (CUIT, DNI, CBU, mails) **no se
  enmascaran nunca**: su única defensa es esa prohibición.
- [ALTO] La estructura de los `.jsonl` de la otra PC es igual a la de esta (puede tener otra versión de
  Claude Code). Se verifica con los 3 chats de prueba allá también.
- [BAJO] La otra PC tiene Python. Si no, el script se reescribe en PowerShell.
- [BAJO] El 1,9 GB medido **probablemente no incluye** los transcripts de subagentes en el conteo de
  "~230 chats". El tamaño de los lotes se decide con la salida de la Etapa 0.

## Riesgos ⚠️

- ⚠️ **Repo público.** Lo que se pushea a vibe-kit no se puede despublicar. Consecuencia si se cuela
  algo: un secreto o un dato de cliente expuesto para siempre. Mitigación: los hallazgos crudos no
  pasan por git (D5), el informe va en paráfrasis, y escáner + diff mirado antes de cada push.
- ⚠️ **Secretos en los chats.** La bitácora de Hermes registra una contraseña de producción que salió en
  pantalla (§10, regla 5). Consecuencia si el enmascarado falla: un secreto copiado a un archivo más.
  Mitigación: el condensado vive fuera del repo, los lectores tienen prohibido copiar valores, y el
  criterio 2 con un detector independiente y secretos reales. **Recomendación aparte de este spec**: si
  esa contraseña no se rotó, rotarla — ya vive en un transcript, con o sin esta investigación.
- ⚠️ **Sobreajuste a Hermes.** El 85% del volumen es Hermes. Consecuencia: un pack diseñado para una
  sola forma de trabajo. Mitigación: D3 y lotes por proyecto, no por tamaño.
- ⚠️ **Contexto de la sesión madre.** Es lo que se está cuidando. Si el resultado de los agentes vuelve
  entero, la misión 3 arranca a ciegas. Mitigación: criterio 8.

---

## Hoja de ruta — las 5 misiones (contexto, no se ejecuta acá)

| # | Misión | Sale con |
|---|---|---|
| **1** | **Esta**: planear la investigación | Este SPEC en READY |
| 2 | La investigación: Etapa 0 en las dos PCs → Etapa 1 → Etapa 2 | `tips/tanda-2026-10-chats.md` + `investigacion/costos.md` |
| 3 | **Profesionalizar vibe-kit**: pasar el Arquitecto por este mismo repo — el norte del proyecto, la estructura de carpetas, la documentación, el README de GitHub | Un repo que se explica solo |
| 4 | **Diseñar el pack**: con el informe + los dos métodos (Desktop y Mobile). Las 4 capas: Base (inicio/cierre/handoff + el **norte** del proyecto + manual por módulo), Dirección (director/obrero/tramo + agentes + política de modelos), Mesa (directores de proyectos vecinos), y el Arquitecto como puerta que las ofrece, también sobre proyectos que ya andan | SPEC del pack, con red-team |
| 5+ | Construirlo por piezas | Releases del kit |

**La misión 4 es la de Guido.** Pedido explícito (2026-10-12): *"ahí quiero participar bastante, ver
todo lo que hayamos tenido, ver qué vamos a agregar, qué no, cómo"*. No se diseña con un informe y una
recomendación cerrada: se recorre el material con él, pieza por pieza, y él decide qué entra.

**Por qué la 3 va antes que la 4**: el pack nuevo va a incluir un sistema de documentación de
proyectos. Probarlo primero acá, en el proyecto madre, es la forma barata de descubrir qué le falta
antes de recomendárselo a otros proyectos.

**El repo es público, y eso pesa en la 3 y la 4**: el método de Hermes no se puede copiar crudo al kit
(trae nombres de personas, rutas, la estructura de la base de un negocio real). Lo que entra al pack
entra **destilado y genérico** — que es además lo que lo hace regalable.

**Hermes no se migra a mitad de camino.** El pack genérico se diseña aparte. Hermes sigue con sus
skills hasta que cierre un tramo grande; recién ahí se evalúa si adopta el pack (con una "ficha" del
proyecto que guarda lo propio de Hermes) o se queda como está.
