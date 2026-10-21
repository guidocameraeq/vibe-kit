# Referencias externas: qué hacen otros métodos y qué nos puede servir

> **Misión 4, tramo 4** · 2026-10-21 · Pedido de Guido: mirar otros workflows agénticos, no solo para
> resolver los problemas que ya medimos, sino para encontrar **ideas que no estábamos planteando** y
> problemas que todavía no nos pasaron. **Mapa, no decisión**: cada idea queda anotada al racimo donde se
> va a decidir (`TABLERO.md` §10). La regla de entrada es la del kit: nada entra por entrar.

**Qué se miró y cómo:**
- Se leyeron los README y algunos documentos clave de cada repo con `gh api`, unos 120 KB en total y
  desde el chat principal. **No se instaló ni se corrió nada.**
- Es una lectura de **lo que cada repo dice de sí mismo**, no de cómo se usa de verdad. Sus números son
  suyos y van marcados **NO VERIFICADO**.
- Las tres fichas, medidas el 2026-10-21:

| Repo | Qué es | Estrellas | Última actividad | Licencia |
|---|---|---:|---|---|
| gentle-ai | Un instalador que configura el agente que ya usás, sea Claude Code u otros 16, con un flujo de trabajo, revisión y memoria | ~7,9 mil | 21/10/2026 (activo) | MIT |
| agency-agents | Un catálogo de ~330 agentes con personalidad, en markdown, más una capa de coordinación ("NEXUS") | ~163 mil | 19/10/2026 (activo) | MIT |
| MetaGPT | Un framework en Python que arma una "empresa de software" con roles de LLM, a partir de un pedido de una línea | ~71 mil | 21/01/2026 (frenado hace ~9 meses; la empresa pasó a un producto comercial) | MIT |

## 0. En una pantalla

- **gentle-ai es el más parecido a nosotros, y el que más aporta.** Resuelve con reglas escritas y
  **medidas** varios problemas que nosotros tenemos medidos: delegar de más, revisar de más, encargos
  parafraseados, el estado que adivina el modelo. Trae 5 ideas fuertes (§1).
- **agency-agents sirve por partes chicas**: las plantillas de traspaso con "intento N de 3", el
  verificador que arranca en "le falta trabajo" y los **runbooks por escenario**, como un incidente en
  producción, que nosotros no tenemos. El catálogo de personajes, no: no es nuestro problema (§2).
- **MetaGPT es una referencia de ideas, nada para instalar.** Lo valioso es una idea, **suscribirse por
  tipo de mensaje**, que le sirve al buzón y al ruido de los avisos (§3).
- **Lo nuevo que no estábamos planteando** está en §4. Lo descartado, con su razón, en §5.

## 1. gentle-ai

**Qué hace:**
- **ODD** es su flujo del día a día:
  - si el pedido es una pregunta o una revisión, nada se toca hasta que pidas un cambio;
  - lo chico y entendido se hace en el mismo chat, sin subagentes ni documento;
  - lo grande tiene **un** documento de tarea que se puede retomar.
  - El criterio de tamaño **no es cuántos archivos se tocan**. Es si **se puede retomar solo con el
    diff**: lo que no se puede retomar así, porque lleva varias sesiones o depende de esperas externas,
    es grande.
- **Se delega solo con una razón que tenga nombre.** Son cuatro:
  - explorar;
  - escritores en paralelo sobre archivos distintos;
  - relevo de contexto en una sesión larga;
  - verificador independiente para lo de alto riesgo.

  Sin razón, el que manda trabaja solo. Dicen haberlo medido: un bug de 3 líneas pasó de 56 turnos a 10
  y costó un tercio (n=1, **NO VERIFICADO**).
- **El spec viaja por referencia, nunca parafraseado.** Con los traspasos parafraseados, 13 de 26
  chequeos fallaban; pasándolo por referencia, pasó (**NO VERIFICADO**).
- **RDD, la revisión**:
  - el cambio se **congela** antes de que nadie lo lea, así la evidencia queda atada a esa versión
    exacta;
  - la profundidad la decide el riesgo y no el modelo: sin revisor, con una lente o con cuatro;
  - se permite **una sola corrección acotada**;
  - commit, push y release siguen siendo del humano.
- **El siguiente paso válido lo calcula un programa, no el modelo**: lee el estado del disco y contesta
  uno de **4 estados públicos**, que son trabajando, chequeando, listo o necesita tu decisión.
- **Pruebas primero, sin relleno**: una prueba en rojo por cada regla pedida, una por cada comando
  existente que se toca, y nada más.
- **Trinquetes** en el repo: archivos de línea base que no dejan crecer un número (código muerto,
  rechazos). Es el mismo patrón que el guardián de atribuciones de Desktop.
- **Banco de pruebas propio**: escenarios con pruebas de aceptación ocultas, que miden cada cambio del
  método antes y después.
- **Instalación cuidadosa**:
  - `doctor`, que solo lee;
  - `sync --dry-run`;
  - una copia de la config antes de cada escritura;
  - un `deny` de rutas sensibles que siembra **solo si no existe**.
- **Funciona con 17 agentes distintos**, cada uno con lo que trae nativo. Usa `AGENTS.md`.
- 🆕 **Retiraron su flujo guiado por specs (SDD) en la v4 y lo reemplazaron por ODD**, que es más
  liviano. Es una señal para nuestro método, que es fuerte en specs.

**Lo que nos sirve, por racimo:**

| Idea | Racimo | Contra qué problema nuestro | ¿Nuevo para nosotros? |
|---|---|---|---|
| Delegar solo con una razón que tenga nombre (4 razones) | D | ~25 tareas de texto en Opus por proyecto; un hotfix de 15 líneas pasó por 3 auditores (P51) | 🆕 El criterio |
| El tamaño se mide por "¿se puede retomar desde el diff?" | H | Feature chica sin chat nuevo (P9, S-R-6); un spec READY se ejecutó en 2 min | 🆕 |
| El spec y el encargo viajan **por referencia**, nunca parafraseados | A · D | Encargos de 7-9 KB reenviados enteros (H-08); 8 de 11 encargos con un dato falso (#1) | 🆕 |
| Revisión **congelada en un SHA**, profundidad por riesgo, una sola corrección | D | 7 de 8 segundas vueltas salieron APROBADO (#4); 8 auditorías seguidas (S-U-1) | 🆕 Lo de congelar |
| El estado siguiente lo calcula un script, con 4 estados públicos | C | ~110 "¿cómo vamos?"; "ESPERO / TE NECESITO / NADA" (#7) | 🆕 Que lo calcule un script, no el modelo |
| Banco de pruebas para medir un cambio de método **antes** de adoptarlo | Medición · misión 6 | 36 cambios de método en 5 días sin saber si anduvieron (P2) | 🆕 |
| Una prueba en rojo por regla pedida, sin relleno | A | Arreglo con su prueba: 0-45% (R§3) | Confirma |
| Trinquetes con archivo de línea base | A | El guardián de Desktop (A.5) | Confirma |
| `doctor` de solo lectura + `--dry-run` + copia antes de escribir | E | El Equipador casi no se usa (P13) | En parte |
| `deny` sembrado solo si falta, con una lista concreta de rutas sensibles | F | 8 de 10 proyectos sin `deny` | Confirma; trae la lista |
| `AGENTS.md` como puente entre herramientas | E · G | 4 proyectos ya lo tienen (F§9); el pedido multi-LLM | 🆕 Para el multi-LLM |

## 2. agency-agents

**Qué hace:**
- **~330 agentes en markdown** repartidos en divisiones: ingeniería, diseño, marketing, ventas,
  finanzas, juegos y más. Cada uno con personalidad, entregables y "métricas de éxito".
- Se convierten con un script para ~15 herramientas distintas: **una fuente, muchos formatos**.
- **NEXUS**, la capa de coordinación, trae:
  - un playbook por fase (de descubrir a operar);
  - **plantillas de traspaso**: estándar, QA aprobado o rechazado con "intento N de 3", escalada al
    agotar los intentos, y cambio de fase;
  - **runbooks por escenario**: MVP, feature empresarial, campaña e **incidente en producción**;
  - tres tamaños: completo, sprint y micro.
- El agente "Reality Checker" arranca siempre en "le falta trabajo" y toma un 10/10 de otro agente como
  bandera roja.
- ⚠️ Sus cifras ("73% de las fallas en los traspasos", "95% de los defectos cazados") **no citan
  fuente**. Son de marketing: **NO VERIFICADO**.

**Lo que nos sirve:**

| Idea | Racimo | Contra qué problema nuestro | ¿Nuevo? |
|---|---|---|---|
| **Runbook de incidente en producción** (y otros por escenario) | F · H | No tenemos ninguno; hay alertas reales abiertas | 🆕 |
| Traspaso con "intento N de 3" y un informe de escalada al agotarlos | D · G | Las rondas de red-team y de revisión no tienen tope (S-U-1, H-158) | Ordena lo que ya hay |
| QA rechazado = problema + esperado + real + evidencia + archivo a tocar | A · G | El vocabulario de la mesa (P32: ~18 tipos en uso, 10 escritos) | Aporta la plantilla |
| El verificador arranca en "le falta trabajo"; un 10/10 es sospechoso | A | "Listo" sin decir qué no miró (P5); el verificador en frío (P24) | Confirma |
| Una fuente canónica que se convierte al formato de cada herramienta | E · G | El pedido multi-LLM | 🆕 Para el multi-LLM |

## 3. MetaGPT

**Qué hace:**
- La idea central es **"el código sale del procedimiento (SOP) aplicado a un equipo"**. Hay roles fijos
  (producto, arquitecto, jefe de proyecto, ingeniero, QA) y cada uno entrega un **documento con
  estructura**, no charla.
- Los roles **se suscriben a tipos de mensaje**: cada uno "mira" ciertas acciones, y el entorno le
  entrega solo lo que le corresponde. Verificado en el código: `metagpt/roles/role.py` (`_watch`,
  `cause_by`) y `metagpt/environment/base_env.py` (`publish_message`).
- Es una librería en Python que llama a las APIs de los modelos. **No es un flujo para Claude Code.**
- Trae trabajos de investigación sobre **generar y optimizar el workflow mismo de forma automática**
  (AFlow, ICLR 2025).

**Lo que nos sirve:**

| Idea | Racimo | Contra qué problema nuestro | ¿Nuevo? |
|---|---|---|---|
| **Suscribirse por tipo de mensaje**, no a todo | D · G | 34% de los turnos del director eran ruido (#2); el buzón multiagente | 🆕 |
| Optimizar el workflow con medición automática | Misión 6 | El ciclo de mejora del método | 🆕 Idea lejana |
| Cada rol entrega un documento con estructura fija | — | Ya lo hacemos (SPEC-0, encargos) | Confirma |

## 4. Lo nuevo que no estábamos planteando

Son las que pueden dar un **salto**, no solo pulir lo que hay. Están ordenadas por cuánto creo que
aportan; **es una recomendación, no una decisión**.

1. **El estado lo calcula un script, no el modelo** (gentle-ai). Hoy le pedimos al modelo que diga
   "ESPERO / TE NECESITO / NADA", y el modelo se equivoca. Si un script lee git y los archivos y devuelve
   uno de pocos estados fijos, sale siempre igual y no se desgasta. Junta los racimos C y A.
2. **El encargo por referencia, nunca parafraseado** (gentle-ai). Ataca de raíz el "dato falso en el
   encargo" y los encargos de 9 KB reenviados.
3. **Delegar con una razón que tenga nombre, y medir el tamaño por si se puede retomar** (gentle-ai).
   Da un criterio concreto para los niveles del método (racimo H) y para la política de modelos (D).
4. **La revisión congelada en un SHA, con una sola corrección** (gentle-ai). La revisión proporcional
   (#4) deja de ser una regla blanda y pasa a ser un procedimiento.
5. **Un banco de pruebas del método** (gentle-ai). Cambiar una regla y medirla contra escenarios fijos
   antes de mandarla a la flota. Es la pieza que le falta a la "medición repetible" del PLAN y a la
   misión 6.
6. **Runbooks por escenario, empezando por el incidente en producción** (agency-agents). Es un
   problema que todavía no nos explotó del todo, y las alertas abiertas dicen que puede pasar.
7. **Suscripción por tipo de mensaje** (MetaGPT). Para el buzón: cada agente recibe solo los tipos que
   le tocan.
8. **Una fuente canónica que se convierte a cada herramienta** (agency-agents, gentle-ai). Es la base
   técnica del pedido multi-LLM.

**Una señal para el método entero**: gentle-ai retiró su flujo guiado por specs por uno más liviano. No
dice que el spec sobre, pero sí que **lo chico no tiene que pagar el costo del spec**. Va al racimo H.

## 5. Lo que no entra, y por qué

| Qué | Por qué no |
|---|---|
| Instalar gentle-ai tal cual | Escribe en `~/.claude/` con su propio binario y lo gestiona él: choca con "el kit es la fuente canónica" (ADR-003) y se pisa con el Equipador. Trae telemetría. **Se toman ideas, no la herramienta.** |
| Engram (su memoria por MCP): **en espera, no descartado** (corregido el 2026-10-21 a pedido de Guido) | **En contra:** el agente guarda solo y nadie revisa lo que anota; la base vive en cada PC hasta que se exporta (ya hubo una lección que vivía solo en la memoria de una PC); y puede guardar algo sensible sin que nadie lo vea, con el repo público. **A favor:** buscar en lugar de releer documentos de 500-900 KB (objetivo 1), y un arranque de sesión más liviano que inyectar el handoff entero. **Condición para volver: racimo B.** Si ahí el tope y el índice no alcanzan, se prueba en un proyecto piloto. (Que el Equipador no instale MCP no es razón: solo da el comando, `kit/skills/arquitecto-skills/SKILL.md:30`.) |
| Personas y temas (gentle-ai) | No mueven ninguno de los 7 objetivos. |
| El catálogo de ~330 agentes (agency-agents) | Nuestro problema no es que falten especialistas, sino la coordinación y la verificación. Instalar "por las dudas" va contra la regla de 3+. Si un proyecto necesita uno puntual, se cura como cualquier skill. |
| El modo NEXUS completo (agency-agents) | Es pesado para el tamaño de nuestros proyectos y sus beneficios no están medidos. |
| El framework MetaGPT | Es otra cosa: una librería en Python que llama APIs, no un flujo de trabajo en Claude Code. Está frenado hace ~9 meses. Adoptarlo sería mantener una app propia (lo mismo que descarta REJ-002). |

## 6. Cómo entra al tramo 4

- **Cada idea ya está marcada con su racimo.** Cuando se diseñe ese racimo, se trae la fila de acá como
  una opción más, junto con las nuestras.
- Para las ideas marcadas 🆕, antes de adoptarlas: **¿hay evidencia de que funciona más allá de lo que
  el repo dice de sí mismo?** Si no la hay, entra al piloto, no al molde.
- **Lo que queda abierto:** el pedido es mirar varios repos, y estos son los 3 primeros. Si aparecen
  más, se suman acá con la misma plantilla (qué hace · qué nos sirve por racimo · qué no y por qué).
