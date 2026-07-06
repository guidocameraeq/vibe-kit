# PROPUESTA — vibe-kit v2: "El Arquitecto"

> Rediseño del vibe-kit a partir de: (1) tu conversación original completa del 22-23 jun (leída entera, con tus palabras), (2) auditoría de los 35 archivos del kit v1 en disco, (3) el PLAYBOOK-MAESTRO como frontera, y (4) verificación técnica contra la doc de Claude Code. Pasó revisión adversarial (10 hallazgos, todos aplicados). Fecha: 2026-07-04.

---

## 1. El diagnóstico: por qué el v1 no te conformó

Tu visión del 22-jun fue siempre la misma y la dijiste dos veces:

> *"un agente que yo podría llamar y poder discutir con él mucho la app antes de empezar… que me pueda armar super prompts… a mí me sirve mucho charlar esas cosas con alguien… explicarle el proceso que quiero resolver, el dolor"*

Y el dolor de fondo: *"me cuesta darme cuenta de todas las cosas que el proyecto va a tener… siempre quiero agregar algo que me olvidé poner al principio — permisos, listas configurables en panel…"*.

Lo que se construyó fue OTRA cosa en el empaquetado: un plugin con marketplace, **7 comandos, 8 skills, 4 agentes, project.yaml de 260 líneas, constitución de 215, 6 tutoriales** — construido en un solo mega-build de 43 agentes, **jamás instalado, jamás probado** (verificado: no hay rastro del plugin en tu config; la conversación muere con "¿lo instalás ahora?" sin respuesta). Cuando te mostraron el blueprint, tu respuesta fue la más reveladora de toda la charla: *"no entendí cuál es la herramienta que vamos a crear"*.

**El contenido de fondo es ORO** (la matriz de stacks con librerías concretas, la checklist de concerns con default ON, la mecánica de entrevista). Lo que falló es el envoltorio: te dieron un producto-suite cuando pediste un interlocutor. Además el v1 tiene defectos objetivos: hooks que apuntan a scripts que nunca existieron (cáscara sin probar), **nadie escribe el CLAUDE.md del proyecto nuevo** (el paso bootstrap desapareció del diseño sin reemplazo — el flujo entrega a un vacío), un "Plan Mode read-only" que era solo texto (nada le impedía escribir), y la mitad "cómo trabajar" del kit quedó obsoleta frente al playbook que armaste después con uso real.

---

## 2. El concepto v2, en una frase

**UNA sola puerta: `/arquitecto` — un interlocutor charlable que te entrevista, piensa lo que vos no ves venir, escribe el plano, y deja el proyecto montado en régimen playbook.** Todo lo demás son ayudantes internos que él usa y vos nunca ves.

**Verificación técnica que define la forma** (confirmada contra la doc oficial): un subagente NO puede hacerte preguntas (AskUserQuestion está bloqueado en subagentes) — así que el Arquitecto NO es un subagente: es una **skill en el loop principal**, que te entrevista con preguntas de opción múltiple (sin límite de rondas) y delega investigación a subagentes cuando hace falta. Tu visión original es exactamente viable con esa forma.

### Los tres mecanismos anti-v1 (lo que garantiza que esta vez sea distinto)

El v1 murió por tres cosas; la v2 las ataca con MECANISMOS, no promesas:

1. **Gate real, no prompt**: la entrevista corre en **Plan Mode** (la skill lo activa al arrancar) — el sistema fuerza read-only; tu aprobación del plan ES la puerta física para escribir. El v1 decía "read-only" en el texto y tenía Write habilitado. *(Único punto a validar en la práctica en la prueba sintética: que el gate no se pueda saltear.)*
2. **La entrevista vive en DISCO, no en el chat**: desde la primera ronda, cada tanda de respuestas se persiste en un borrador (`SPEC-0.borrador.md`). Si te vas a la mitad — tu patrón real: la charla del v1 murió sin respuesta — `/arquitecto` detecta el borrador la próxima vez y te ofrece retomar donde quedaste. Es el principio §0 del playbook aplicado al propio Arquitecto.
3. **Build por hitos chicos validables, no mega-build**: el v1 nació de un solo saque de 43 agentes y nadie lo probó. La v2 se construye en entregas que se validan por separado, y los Modos B y C recién entran DESPUÉS de que el Modo A pase la prueba de fuego con vos (ver §8).

---

## 3. Las tres puertas de la misma conversación (modos)

`/arquitecto` arranca preguntándote (o detectando) cuál de estos tres escenarios es:

### Modo A — Proyecto nuevo (greenfield)
1. **Entrevista**: una pregunta por vez, opción múltiple con "(Recomendado)", 30% problema / 70% diseño. Existe el fast-path *"dale con los defaults"*. Entre las preguntas: **¿dónde vive el proyecto?** (default: `Desktop\Proyectos\<nombre>`) — el Arquitecto crea la carpeta y scaffoldea AHÍ; no tenés que saber de rutas. **Cada tanda de respuestas se persiste al borrador en disco** (mecanismo anti-v1 #2).
2. **Cuando ya se sabe tipo de app y dominio** (tras las primeras 2-3 respuestas), lanza en background la investigación: librerías/stack para tu caso + prior-art de apps parecidas. *(Si el background con la entrevista abierta no funciona en la práctica, el fallback es investigar entre rondas — se valida en la prueba sintética.)*
3. **Checklist de concerns, default ON, SIEMPRE** (tu dolor #1): roles/permisos (RLS + CASL, "esconder un botón no es seguridad"), listas del negocio configurables desde panel (fila en tabla, NUNCA hardcode), manejo de errores, logging/Sentry, auditoría (no opcional en apps de plata), dashboards; y las 2 decisiones ⚠️ casi irreversibles preguntadas explícitamente: **multi-tenant** e **i18n**.
4. **Propone 2-3 enfoques** con pros/contras y recomendación; elegís como un presupuesto.
5. **HARD GATE (Plan Mode — mecanismo anti-v1 #1)**: no se puede tocar código hasta que apruebes. Escribe el **SPEC-0** final (el plano: qué es, entidades, stack, concerns activados, qué NO entra en v1, criterios de aceptación verificables). Si el proyecto es grande o sensible (plata, permisos, datos de terceros), un subagente **red-team lo ataca** antes de mostrártelo — condicional, como en el v1, para no frenar el fast-path.
6. **Con tu OK, monta el proyecto**: scaffolding del stack elegido + **ejecuta la receta §2.9 del playbook** — CLAUDE.md pre-llenado con todo lo de la entrevista, docs de estado, skills `/inicio` y `/cierre` (las universales del día cero, regla §2.9), hooks, .gitignore verificado, primer commit. `/smoke` y `/deploy` NO se inventan el día cero (regla de 3+): quedan como templates listos que se montan cuando el ritual real aparezca.
7. **Handoff**: *"Abrí un chat nuevo en `<ruta exacta>` y decí: `inicio` — ejecutá el SPEC-0"*. El Arquitecto se apaga; el playbook gobierna.

### Modo B — App existente (brownfield)
1. Manda primero al subagente **explorador** a mapear el código real; la entrevista arranca anclada en lo que existe, no en abstracto.
2. Para features grandes o reorganizaciones: **delta spec** — qué cambia, y explícitamente **qué NO se toca** (tu seguro de no romper).
3. Si el proyecto no tiene el sistema del playbook, ofrece montarlo (§2.9 para proyectos existentes, respetando tus docs actuales).
4. Mismo hard gate, mismo handoff.

### Modo C — Consultorio (la idea tuya que quedó en el camino) — entra en v2.1
Sin proyecto que montar: es la charla para **armar prompts y skills**. *"Ayudame a armar el prompt para X"*, *"¿esto lo hago con subagentes o directo?"*, *"¿específico o ambiguo?"*, *"convertime este ritual en skill"*. Sale con el prompt/skill escrito y listo. (Es tu traba confesada: *"no estoy certero cuándo mandar subagentes, cuándo ser superespecífico… me trabo mucho en eso"* — y la regla de 3+ del playbook como criterio.)
**Nota de alcance**: los Modos B y C entran en la **v2.1**, después de que el Modo A pase la prueba de fuego (mecanismo anti-v1 #3). El Modo C además necesita conservar destilada la skill `crear-agentes-y-comandos` del v1 (el CÓMO se escribe una skill/comando/agente en esta máquina Windows — el playbook solo dice CUÁNDO).

---

## 4. Qué se conserva del v1 (el oro) y qué se tira

| Se conserva (destilado como anexos de la skill) | Se tira (y por qué) |
|---|---|
| **matriz-de-stacks** (golden paths web/Android/Windows/datos, regla dura de Python) | Plugin + marketplace (fricción de instalación que nunca pasaste; innecesario para un usuario) |
| **checklist-concerns** (default ON, ⚠️ irreversibles) | project.yaml (segunda fuente de verdad; choca con "un dato, un lugar" — sus datos van al SPEC y al CLAUDE.md) |
| **entrevista-descubrimiento** (banco de preguntas en 3 etapas) | constitution.md como archivo (los concerns elegidos viven en SPEC + CLAUDE.md) |
| **elicitacion-avanzada** (methods.csv, 18 lentes de refinamiento) | 6 de los 7 comandos: /nueva-app, /feature, /fix eran el MISMO rol con otra puerta → se funden en los modos A/B; /release, /docs-check, /crear-rol → los cubre el playbook |
| **escribir-spec** (formato EARS simplificado — pasa a ser EL formato de spec compartido con el playbook) | hooks.json propio (scripts inexistentes, fallan en silencio; los hooks del proyecto los pone §2.9) |
| **brownfield-openspec** (delta specs) → se funde en el Modo B | skill playbook-orquestacion (duplica al playbook con doctrina divergente — dos biblias divergen) |
| Subagentes **explorador-codigo** y **redteam-spec** (los únicos 2 que quedan) | doc-keeper y reviewer (el playbook y /code-review nativo los cubren) |
| **crear-agentes-y-comandos** (destilada) → anexo del Modo C en v2.1 | 5 de 6 tutoriales (queda UNO corto; la skill se explica sola charlando) |
| Los DOS bancos de preguntas (P0-P11 de nueva-app CON su lógica de saltos, + las 3 etapas de entrevista-descubrimiento) → se **fusionan en UN solo banco** (la destilación debe reconciliarlos, no elegir uno) | AGENTE-ARQUITECTO.md no se tira: queda como doc de diseño/prior-art en la Guia |

El `vibe-kit/` viejo NO se borra: se mueve a `legacy/vibe-kit-v1/` (regla del playbook: lo superado se archiva con lápida).

---

## 5. Dónde vive (y por qué NO es un plugin)

- **UNA sola copia canónica** (regla "un dato, un lugar" del playbook — sin fuente + espejo que van a divergir): TODO vive en **`~/.claude/skills/arquitecto/`** — la SKILL.md + los anexos de conocimiento + los **templates del playbook como subcarpeta** (`templates/`). Los 2 subagentes en `~/.claude/agents/`. Disponible en TODOS tus chats, en cualquier carpeta, sin marketplace, sin `/plugin install`. Decís `/arquitecto` y listo.
- **Dónde se edita: ahí, siempre.** En la carpeta Guia queda solo un LEEME que apunta (lápida-puntero, como con el playbook viejo) + la instrucción de backup: al cerrar una mejora grande del Arquitecto, copiar la carpeta a la Guia como snapshot con fecha (o zip). En PC nueva: copiar la carpeta a `~/.claude/skills/` — un paso del checklist que ya existe en tu guía.
- Es coherente con el playbook §2.8: el Arquitecto es un GENERADOR — todo lo que un proyecto necesita para operar queda **commiteado en el repo del proyecto** (CLAUDE.md, skills, hooks, docs, SPEC). El proyecto nunca depende del kit. El Arquitecto solo se vuelve a llamar para la próxima feature grande.

## 6. La pieza que falta y esta propuesta cierra: los `templates/` del playbook

Verificado hoy: el molde del playbook **no existe como templates** — las únicas instancias reales de `/inicio` `/cierre` `/smoke` `/deploy` + hooks viven dentro de Bot Perseo (con detalles específicos de WhatsApp/VPS que hay que genericizar). El paso 6 del Modo A necesita ese molde. El plan lo extrae como **primer entregable con valor propio** (sirve para §2.9 aunque el Arquitecto no existiera): universales (inicio/cierre + hooks + CLAUDE esqueleto) y adaptables (smoke/deploy como contrato + huecos, para montar cuando el ritual aparezca). Viven dentro de la carpeta del Arquitecto (§5) y el §2.9 del playbook pasa a apuntarlos — esa actualización del playbook es real (media hora, §2.3 y §2.9), no "una línea".

---

## 7. La lección #1 del v1: no está terminado hasta que lo uses

El v1 murió sin instalarse. El v2 tiene definition-of-done dura: **una corrida real de punta a punta con vos**. Y la prueba sintética previa no la valida solo el constructor (el "no pude probarlo" del v1 en versión suave): incluye ítems adversariales explícitos — intentar que escriba código antes de tu aprobación (el gate), y abandonar la entrevista a la mitad y retomarla (el borrador). Hasta que la corrida real no salga bien, el kit está "en construcción", no "listo".

---

## 8. Plan de construcción (hitos chicos validables — mecanismo anti-v1 #3)

### Hito 1a — Los templates del playbook (valor propio inmediato)
Extraer de Bot Perseo el molde genérico → `~/.claude/skills/arquitecto/templates/` + actualizar PLAYBOOK-MAESTRO (§2.3 y §2.9: día cero = inicio+cierre, smoke/deploy cuando aparezca el ritual, apuntar a los templates). **Validable solo**: aunque el Arquitecto nunca existiera, §2.9 ya queda con moldes reales.

### Hito 1b — La skill `/arquitecto`, SOLO Modo A
SKILL.md (entrevista + Plan Mode gate + borrador incremental + montaje §2.9 + handoff) + anexos destilados del oro v1 (matriz-stacks, concerns, **banco de preguntas ÚNICO** fusionando P0-P11 con su lógica de saltos + las 3 etapas, methods.csv, formato de spec) + subagente redteam-spec. Instalación global + **prueba sintética adversarial** (gate + retome + entrevista de juguete completa).

### Hito 2 — La prueba de fuego (vos + yo, ~1 h)
Corrés `/arquitecto` sobre un proyecto nuevo REAL (Modo A). Yo observo dónde trastabilla y ajustamos en caliente: ¿entrevista muy larga? ¿preguntas obvias? ¿faltó un concern? **Hasta acá no se construye nada más.**

### Hito 3 — v2.1: Modos B y C (solo después de que A funcione)
Modo B (brownfield: subagente explorador + delta specs) con SU prueba de fuego natural: **tu app del ERP** (el caso que nombraste el primer día). Modo C (consultorio) con el anexo crear-agentes-y-comandos destilado, probado armando un prompt/skill real tuyo. + Archivar `vibe-kit/` viejo a `legacy/vibe-kit-v1/` con lápida, el tutorial único, memoria y docs al día.

---

## Al final, tu caja de herramientas completa queda así

| Herramienta | Cuándo la usás |
|---|---|
| **`/arquitecto`** (global, cualquier carpeta) | Arrancar un proyecto (A); luego: feature grande en app existente (B) y consultorio de prompts/skills (C) |
| **PLAYBOOK-MAESTRO + templates/** | El sistema de régimen: se monta una vez por proyecto (el Arquitecto lo monta por vos) |
| **`/inicio` `/cierre`** (por proyecto, en su repo) + las skills que cada proyecto gane con la regla de 3+ | El día a día de cada proyecto |

Un interlocutor para pensar, un sistema para trabajar. Nada más.
