# SPEC: docs-fyd v2 — resolver las dudas por opciones, no generar por generar — vibe-kit
El motor `/docs-fyd` deja de adivinar: cuando no está seguro de algo importante (sobre todo un "no hay X" por no encontrarlo), **le da opciones a Guido para elegir** (no un cuadro de texto), o lo manda a investigar mejor. Lo que Guido decide vive en una zona protegida que la regeneración nunca pisa; y antes de entregar, el motor se controla solo. Sigue regenerando desde el código (eso no cambia) — pero lo que el humano sabe y el código no, se captura eligiendo, se conserva, y nunca deja entrar una credencial.
- Estado: **✅ IMPLEMENTADO 2026-07-23** (+ patch v2.2.1 tras la evaluación de campo) — la skill vive en
  `kit/skills/docs-fyd/`. Es la versión **vigente** de docs-fyd.
- Fecha: 2026-07-23
- Endurecido tras **1 ronda de red-team** (6 lentes, 26 hallazgos foldeados) + decisión de interacción de Guido.

## Por qué (el dolor)
Primera corrida real (repo Hermes Desktop, en producción). Los 10 artefactos salieron bien derivados del código y sin filtrar una credencial — pero **9 de 10 necesitaron corrección a mano, y las importantes eran hechos que el código no sabe** (backups en un servicio externo, RLS real en la base viva, si la base es compartida). Peor: el motor, al no encontrar algo, **afirmó el negativo** ("no hay backups", "falta RLS en la tabla de contraseñas") — falsedades que en un entregable de auditoría **acusan al propio cliente**. Y esas correcciones **se pierden en la próxima regeneración, en silencio**. El motor genera un excelente primer borrador, pero "genera por generar": no resuelve las dudas, las esconde.

## Contexto del código (de la exploración — nombres REALES)
La skill `kit/skills/docs-fyd/` (v1, construida 2026-07-23):
- **`SKILL.md`** — 2 modos (`docs-fyd` genera / `docs-fyd auditar` dry-run), 6 reglas de oro, write-set cerrado (`docs-fyd/**` + README raíz), el **cepillo anti-secretos** (parser de bloques de entorno: corta a la derecha del `=`, saca valores entre comillas, caza API keys hardcodeadas; frena antes de escribir) y el trato de #9 (no-verbatim) / #10 (solo categoría+cantidad). Flujo: paso 3 CREA `_CAMPOS-NEGOCIO.md` desde plantilla si falta; paso 5 cepillo; paso 6 escribe; paso 7 sella `ESTADO.md`.
- **Regla 5 hoy** = "Evidencia o NO DETERMINADO", **sin jerarquía**. Lo único que sobrevive la regeneración: `_CAMPOS-NEGOCIO.md` y `ESTADO.md`, protegidos **por nombre hardcodeado**.
- **No hay** pasada de verificación, ni validación de que los Mermaid rendericen, ni manejo de "el código puede estar viejo". Cabecera: `generado por /docs-fyd <fecha>` (nombra la herramienta; el marcador de protección del README se detecta por ese texto).
- El resto del kit (Arquitecto, Equipador, INSTALAR, rituales) **no se toca**.

## AGREGA (lo nuevo)

### 1. La pasada de dudas — POR OPCIONES (el corazón)
Cuando el motor no puede afirmar algo con confianza, **no adivina y no escribe un cuadro de texto en blanco**: presenta la duda como **pregunta de opción múltiple** (AskUserQuestion) con opciones que **redacta el motor** según el stack. Guido **elige**; no escribe documentación.
- **Dos disparadores:**
  - **Reactivo**: cuando el motor iría a afirmar algo no sostenido por evidencia, o un negativo por ausencia.
  - **Proactivo (checklist CONDICIONADA a lo que el repo tiene)** — se dispara según el subsistema: (1) backups, (2) RLS/control de acceso, (3) base compartida → **solo si hay base de datos**; (4) vigencia de tokens/credenciales → **solo si usa servicios externos con credenciales**. Si el subsistema EXISTE pero el código calla sobre el hecho, el silencio NO exime (se pregunta). Un repo sin estado no dispara ninguna (evita la fatiga). *(Ajuste v2.2.1 tras la evaluación de campo sobre Hermes, 2026-07-24: la checklist era fija y en un repo sin DB 3 de 4 preguntas eran ruido.)*
- **Cada duda ofrece siempre:** las respuestas-hecho más probables (redactadas por el motor, sin ningún valor de credencial) + **"Investigá acá →"** (Guido lo manda a mirar un archivo/config que no consideró — lo GUÍA, el motor investiga y vuelve) + **"No me consta"** (queda "a confirmar", honesto) + **"Otra"** (texto libre — el escape raro).
- **Disciplina y tope (anti-fatiga):** el motor pregunta SOLO en estas categorías: **seguridad · continuidad/backups · compartición de datos · RLS/permisos · negativo-por-ausencia relevante**. Tope duro de **≤10 dudas por corrida**, priorizadas por severidad. Todo dato menor no-determinable va a **"NO DETERMINADO" sin preguntar**.
- **Nunca un negativo absoluto:** todo enunciado de seguridad/continuidad usa la fórmula **"no se encontró X en el código — confirmar"**, JAMÁS "no hay X" (ni parafraseado: "carece de", "sin", "ausencia de").
- **El texto de la duda nunca cita el valor de un secreto** — solo su ubicación (igual que el #10 manda el `archivo:línea` solo al reporte transitorio).
- **Modo no-interactivo (siembra del Arquitecto, Paso 5):** cuando no hay humano contestando, la pasada de dudas **NO bloquea** el montaje: **parquea** las dudas como "pendientes de responder" en `_ACLARACIONES.md` y sigue. Guido las resuelve después en una corrida normal.

### 2. La zona protegida `_` — crear + anexar, nunca pisar
Regla nueva, precisa (reemplaza "proteger por nombre"): **cualquier archivo de `docs-fyd/` cuyo nombre empieza con `_`** → el motor **PUEDE** crear su esqueleto desde plantilla si falta, y **PUEDE anexar** entradas nuevas al final; **JAMÁS pisa ni borra contenido que puso un humano**. (Create-if-missing + append-only + never-overwrite-human.)

### 3. `_ACLARACIONES.md` (archivo nuevo, protegido)
Donde vive todo lo humano que el código no sabe. Dos secciones:
- **Respuestas a dudas** — una entrada por duda, con **clave estable** = (artefacto/tema afectado + pregunta canónica) + la **opción elegida** (hecho normalizado, redactado por el motor) + **fecha** + **referencia a la evidencia de código** que respondía (archivo/tema).
- **Correcciones a mano** — para lo que Guido edite directo sobre un artefacto derivado (fuera del Q&A): fecha · archivos · qué se corrigió · **cómo se verificó**. (Se mudó acá desde `ESTADO.md`, ver MODIFICA.)

Lleva arriba la misma **advertencia anti-credenciales** que la bóveda. El motor lo lee y funde; lo crea si falta; anexa; nunca pisa lo humano.

### 4. Anti-secretos en la capa humana (el camino nuevo)
- **Por defecto es seguro por construcción:** Guido elige opciones que **redactó el motor** → sin credenciales.
- **El único texto libre** ("Otra") pasa, **antes de persistir o fundir**, un **freno anti-prosa BLOQUEANTE** (además del cepillo-env): detecta connection strings, `password/clave/contraseña/token/key` seguido de valor, strings de alta entropía, rutas con token. Si prende → **FRENA, no guarda**, y le pide a Guido sacar el valor.
- **El cepillo (env + prosa) es la ÚLTIMA compuerta antes de CUALQUIER escritura**, sin excepción. Orden del pipeline (la auto-verificación corre en 2 momentos — ver §6): auto-verificación 1ª (surtidor de dudas) → dudas/opciones → fusión de aclaraciones → auto-verificación 2ª (chequeo final) → **cepillo** → validación Mermaid → escribir → chequeo `git status`.

### 5. Jerarquía de evidencia (con caducidad)
Refuerza la regla 5: **sistema vivo (testimonio humano en `_ACLARACIONES`, datado) > código > scripts del repo > `docs/`**. `docs/` NO es fuente de verdad salvo para el #9.
**Caducidad:** si la evidencia de código que respondía una duda **cambió** desde la respuesta, el motor **NO funde la respuesta vieja**: **re-abre la duda** ("antes elegiste X sobre esto, pero el código cambió — ¿sigue valiendo?"). Así lo humano tampoco envejece y miente.

### 6. Auto-verificación (con rastro auditable)
Antes de terminar, el motor **contrasta cada afirmación de hecho contra su fuente** y deja un **log** (una línea por afirmación → "afirmación X = fuente Y (ok)" o "sin fuente → duda/NO DETERMINADO"). Incluye **consistencia interna** (conteos que cierran, enlaces internos que resuelven — lo que el reporte encontró y hoy solo está en `auditar`). **Exime** las afirmaciones cuya fuente es `_ACLARACIONES` o la bóveda (testimonio humano = "sistema vivo", no necesita respaldo del código → no entra en loop). Cierra con **`git status`**: si hay UN cambio fuera de `docs-fyd/** + README`, FRENA.

### 7. Herramientas auxiliares fuera del repo
Toda herramienta auxiliar (mermaid-cli, venv de pip-audit, pg_dump, scripts generados) corre en un **directorio temporal FUERA del repo objetivo**, o se borra antes de terminar. **Nada de eso se commitea.** (Un `pg_dump` puede volcar datos/credenciales — jamás dentro del repo.)

### 8. Validación de diagramas — sin tirar el documento
Cada bloque Mermaid **se compila antes de escribirse**. Si uno falla, el artefacto **IGUAL se escribe**, con el diagrama reemplazado por un cartel visible **"diagrama inválido, corregir a mano: [error]"** + marcado como duda. **Los 10 siempre existen** (regla 6): a FyD nunca le falta un documento.

## MODIFICA (lo existente que se toca — cada uno con su efecto colateral)
- **`kit/skills/docs-fyd/SKILL.md`** — el grueso: pasada de dudas por opciones (reactiva + checklist proactiva + tope + modo no-interactivo), la regla `_` (crear/anexar/nunca-pisar), la jerarquía de evidencia con caducidad, la auto-verificación con log + consistencia + git-gate, el freno anti-prosa, el orden de pipeline con el cepillo como última compuerta, y la validación Mermaid con placeholder. **Efecto colateral**: NO debilita el cepillo-env (se le SUMA el freno de prosa, no se reemplaza), ni el write-set, ni "los 10 siempre". La "única razón para no escribir un artefacto" pasa de 1 a 2 casos claros: **secreto que no se puede sanear = no escribir; Mermaid roto = escribir con placeholder**.
- **Modo `auditar` (en `SKILL.md`)** — reporta (sin escribir): **dudas aún abiertas/pendientes**, correcciones del registro que una regeneración haya pisado, diagramas que no compilan, conteos que no cierran y enlaces rotos. **Efecto colateral**: sigue cero-escrituras.
- **`kit/skills/docs-fyd/plantillas/ESTADO.md`** — vuelve a ser **solo del motor**: fecha + flag de frescura, y nada más. El registro de correcciones **se muda a `_ACLARACIONES.md`** (protegido). El motor actualiza `ESTADO.md` de forma **quirúrgica** (solo las líneas fecha/frescura). **Efecto colateral CRÍTICO que el red-team cazó**: si el registro quedaba en `ESTADO.md` (que el motor reescribe cada corrida), se borraba solo — el dolor original. Mudarlo a `_` lo salva.
- **La cabecera de procedencia (10 plantillas + lógica del SKILL)** — deja de nombrar la herramienta; el texto visible queda "derivado automáticamente del código — se regenera, no editar a mano en silencio". **El marcador de máquina** del README pasa a un token estable **`<!-- docs-fyd:marca v2 -->`**; la detección reconoce **el viejo (`generado por /docs-fyd`) Y el nuevo**. Un README **sin ningún marcador** se **REPORTA** ("perdió su marcador, no se regenera") en vez de congelarse en silencio. **Efecto colateral**: sin la detección dual, todo README v1 se trataría como escrito a mano.
- **`kit/skills/docs-fyd/deteccion.md`** — suma la jerarquía de evidencia ("`docs/` no es fuente de verdad"), las notas operativas (auditar el **entorno instalado**, no solo el manifiesto; herramientas faltantes → venv/temp descartable) y la regla "auxiliares en temp fuera del repo". **Efecto colateral**: sigue stack-agnóstica.
- **`kit/skills/docs-fyd/plantillas/` (nueva `_ACLARACIONES.md`)** — con la advertencia anti-credenciales arriba y el esquema de entradas (clave + hecho + fecha + evidencia). Donde afloran los hechos de la checklist proactiva: una **nota rotulada "Continuidad y acceso a datos (confirmado por el operador)"** en `ficha-producto.md` / `revision-seguridad.md`. **Efecto colateral**: es un AGREGADO rotulado de hechos del operador, NO una reescritura de las secciones de los 10 prompts de FyD (el contrato de contenido se respeta).

## NO SE TOCA (obligatoria — el seguro de no romper)
El reporte probó todo esto impecable; el delta no lo puede romper:
- **El cepillo-env anti-secretos** (corta a la derecha del `=`, saca comillas, caza API keys; frena antes de escribir): intacto. v2 le SUMA un freno de prosa para el camino humano; no lo reemplaza.
- **El write-set cerrado** (`docs-fyd/**` + README raíz): intacto, y ahora blindado por el chequeo `git status` final.
- **La bóveda `_CAMPOS-NEGOCIO.md`** (los 4 campos de negocio): intacta, read-only. `_ACLARACIONES.md` es aparte.
- **Regla 6 (los 10 siempre se escriben)** y **"NO DETERMINADO" válido**: intactas (reforzadas — Mermaid roto NO tira el documento).
- **El contrato de contenido** (`prompts-fyd.md` + las secciones de los 10 prompts de FyD): intacto. La nota "Continuidad y acceso" es un agregado rotulado, no una reescritura.
- **Los 2 modos** (`docs-fyd` / `auditar`): se enriquecen, no se reemplazan.
- **Todo lo del SPEC original** en su NO SE TOCA (los `docs/` de trabajo del método, el hook, el CLAUDE.template, los rituales del repo madre): fuera de este delta.

## Datos del usuario: esto cambio / esto preservo
| Dato del usuario | Esto cambio | Esto preservo |
|---|---|---|
| Decisiones/aclaraciones del humano (por opciones) | Antes se perdían al regenerar | Viven en `_ACLARACIONES.md` (`_`-protegido, append-only): el motor lo crea/anexa pero NUNCA pisa lo humano |
| Correcciones a mano sobre artefactos | Se perdían en silencio | Registradas en `_ACLARACIONES.md` con "cómo se verificó"; `auditar` avisa si una regeneración pisó una |
| Los 4 campos de negocio (`_CAMPOS-NEGOCIO.md`) | Nada | Intactos, read-only |

## Criterios de aceptación (verificables — cada uno con su test)
1. **[Regresión]** Todo lo de NO SE TOCA sigue igual: el cepillo-env no filtra, el write-set cerrado, los 10 siempre, la bóveda intacta, el contrato de contenido respetado. **Test:** un repo ya documentado regenera sin romper nada de eso.
2. **[Negativo por silencio, no absoluto]** Un negativo cuyo hecho vive FUERA del código (backups, RLS real, rotación de tokens) NUNCA se afirma ("no hay X" ni parafraseado): va a pregunta o "no se encontró X en el código — confirmar". Una **ausencia comprobable** (no hay `Dockerfile` / FK / `.env.example` — si estuviera, estaría en el código) SÍ se puede afirmar. **Test:** repo sin backups en el código → pregunta/condiciona, no afirma "no hay backups"; pero "no hay Dockerfile" (comprobable) es válido.
3. **[Checklist proactiva condicionada]** El motor plantea las dudas de continuidad/acceso **condicionadas a que el subsistema exista**: backups/RLS/base-compartida **si hay base de datos**; vigencia de tokens **si usa servicios con credenciales**. Si el subsistema existe pero el código calla sobre el hecho, igual pregunta. **Test:** repo con DB → aparecen las de datos; repo sin DB ni servicios → NO aparecen (cero ruido).
4. **[Disciplina + tope]** El motor pregunta SOLO en las categorías fijadas, con tope ≤10 por corrida, priorizadas por severidad; lo menor no-determinable → "NO DETERMINADO" sin preguntar. **Test:** toda pregunta pertenece a una categoría (una fuera → falla); un dato menor no-determinable (ej. falta un README de submódulo) NO genera pregunta.
5. **[Interacción por opciones]** Cada duda se presenta como opción múltiple con opciones que redacta el motor (+ "investigá acá", "no me consta", "otra"); se guarda la **opción elegida** (hecho normalizado), no prosa cruda. **Test:** una corrida presenta las dudas como opciones; `_ACLARACIONES.md` guarda hechos, no párrafos del humano.
6. **[Anti-secretos capa humana]** Ninguna credencial entra a `_ACLARACIONES.md` ni a un artefacto por el camino humano: las opciones (sin valor) las redacta el motor; el texto libre "Otra" pasa un freno anti-prosa BLOQUEANTE antes de persistir; el texto de la duda cita ubicación, nunca el valor; el cepillo es la última compuerta. **Test:** responder "Otra" con una connection string con contraseña → FRENA y no persiste.
7. **[`_` = crear + anexar, nunca pisar]** El motor crea un `_`-archivo desde plantilla si falta y anexa; JAMÁS pisa/borra contenido humano. **Test:** un `_prueba.md` con una línea humana sobrevive intacto una regeneración; y en un repo fresco se crean la bóveda y `_ACLARACIONES.md`.
8. **[Persistencia + clave estable + no re-preguntar]** Las respuestas se guardan con clave estable (artefacto+tema) + fecha + evidencia; una regeneración las lee, las funde, y NO re-pregunta las de clave coincidente; ante coincidencia dudosa, RE-PREGUNTA. **Test:** elegir una opción para la duda D, regenerar → `_ACLARACIONES` conserva D, la 2da corrida NO re-plantea D, D aparece fundida en su artefacto; una duda de tema nuevo NO se da por respondida por parecerse a otra.
9. **[Caducidad]** Si la evidencia de código que respondía una duda cambió desde la respuesta, el motor NO funde la vieja: re-abre la duda. **Test:** elegir "RLS activo", agregar una migración que lo saca, regenerar → re-pregunta, no afirma lo viejo.
10. **[Auto-verificación con rastro + consistencia + git-gate]** Antes de terminar, el motor deja un log afirmación→fuente, corre consistencia interna (conteos, enlaces), exime lo proveniente de `_ACLARACIONES`/bóveda, y frena si `git status` muestra algo fuera del write-set. **Test:** cada afirmación tiene entrada con fuente o está marcada duda; un conteo que no cierra o un link roto → lo caza; un archivo auxiliar fuera de `docs-fyd/**` → frena.
11. **[Auxiliares fuera del repo]** Toda herramienta auxiliar corre en temporal fuera del repo; nada se commitea. **Test:** tras una corrida, `git status` = solo `docs-fyd/** + README`, sin `.svg`/venv/dumps sueltos.
12. **[Mermaid roto no tira el documento]** Si un Mermaid no compila, el artefacto igual se escribe con el cartel + marca de duda. **Test:** meter un Mermaid roto → el artefacto existe con el cartel, no se dropea.
13. **[Modo no-interactivo]** Cuando la siembra del Arquitecto invoca `/docs-fyd` sin humano, la pasada de dudas NO bloquea: parquea las dudas como pendientes y deja completar el montaje. **Test:** siembra → montaje completa, dudas quedan "pendientes de responder".
14. **[Cabecera + marcador]** La cabecera no nombra la herramienta; el README lleva el token `<!-- docs-fyd:marca v2 -->` y la detección reconoce viejo Y nuevo; un README sin marcador se reporta, no se congela mudo. **Test:** un README v1 (marcador viejo) se reconoce propio; un README sin marcador → aviso explícito.

## Supuestos
- **[ALTO]** Asumimos que Guido resuelve las dudas **eligiendo** entre las opciones que propone el motor (a veces mandándolo a investigar), sin escribir documentación. Si una duda no tiene buena opción, existen "Investigá acá" y "Otra". (Si está mal: vuelve la fricción de escribir — pero el modelo de opciones es exactamente lo que Guido pidió.)
- **[ALTO]** Asumimos que las categorías de pregunta + el tope alcanzan para evitar fatiga. Si igual sale larga en repos grandes, se baja el tope. (Riesgo principal, medido en la evaluación — ver `EVALUACION-docs-fyd-v2.md`.)
- **[BAJO]** Asumimos mermaid-cli disponible o degradado a chequeo de sintaxis básico.

## Riesgos y decisiones ⚠️
- ⚠️ **Interacción por OPCIONES (decidido con Guido):** el motor propone, Guido elige; el texto libre es un escape con freno bloqueante. Consecuencia: menos incidencia del humano + más seguro (el camino default no es prosa). Si las opciones son pobres, se corrige con "Investigá acá". Revertir a "escribir libre" reintroduce la fricción y el riesgo de fuga.
- ⚠️ **La verificación EN VIVO (que el motor consulte solo la base/API/artefacto) sigue FUERA — es Fase 2.** Consecuencia: los hechos vivos se capturan porque la **checklist proactiva** los pregunta SIEMPRE (aunque el código calle) y Guido responde con lo que sabe o manda a investigar; automatizar la consulta a prod es un salto de riesgo con su propio red-team. El red-team confirmó que diferirlo es correcto **siempre que la checklist proactiva exista** (por eso es criterio #3, no opcional).
- ⚠️ **Herramientas auxiliares en temp fuera del repo + git-gate.** Consecuencia: si el ejecutor las corre adentro, rompe el write-set y puede volcar credenciales (pg_dump) — por eso el gate `git status` es criterio #11.
- ⚠️ **Caducidad de aclaraciones.** Consecuencia: una aclaración contradicha por código nuevo re-pregunta en vez de afirmar lo viejo — evita que la verdad humana envejezca y mienta (el mismo dolor que v1 mató para el código, cerrado ahora para lo humano).
- ⚠️ **`ESTADO.md` se actualiza quirúrgico** (solo fecha/flag) y el registro se mudó a `_ACLARACIONES.md`. Consecuencia: si el ejecutor "regenera ESTADO.md desde plantilla", borra el registro — por eso el registro ya NO vive ahí.
- ⚠️ **Costo por corrida** (opciones + auto-verificación) más alto. Consecuencia: para un entregable de auditoría se acepta; si molesta, la auto-verificación puede ir tras un flag más adelante.

---
**Gate:** **READY.** Endurecido tras el red-team (6 lentes, 26 hallazgos foldeados) + la decisión de interacción de Guido. Se construye como delta del kit, cerrando con el ritual del repo madre (sync → `diff -r` de las 4 rutas limpio → commit+push + **ADR-015**). La validación de si "mejoró de verdad" corre por `docs/EVALUACION-docs-fyd-v2.md` (re-correr sobre Hermes). La **Fase 2** (verificación en vivo) es su propio SPEC.
