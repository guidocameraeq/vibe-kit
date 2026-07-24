# DECISIONS — por qué el vibe-kit es como es

> ADRs del proyecto madre. Backfill escrito el 2026-07-11 (antes de comprimir el chat que
> construyó todo esto), desde la historia real: auditoría de Perseo (2/jul) → playbook →
> Arquitecto v2 (4-5/jul) → repo canónico y Equipador (6/jul) → v2.1 (11/jul).

## ADR-001 · El kit es una SKILL GLOBAL, no un plugin (2026-07-04)
El v1 (jun-2026) se construyó como plugin de Claude Code con marketplace propio: 35 archivos,
7 comandos… y **nunca se instaló** — murió en la fricción de `/plugin marketplace add` + la
complejidad de suite. El v2 es una carpeta en `~/.claude/skills/`: se copia, funciona, se
versiona en git. Alternativas: plugin (fricción de instalación/update sin beneficio para uso
personal), repo de prompts copy-paste (lo que el usuario quería matar). Re-evaluar plugin
SOLO si algún día se publica para terceros.

## ADR-002 · El Arquitecto corre en el LOOP PRINCIPAL, no como subagente (2026-07-04)
Descubrimiento técnico que definió toda la arquitectura: **los subagentes no pueden conversar
con el usuario** (AskUserQuestion existe solo en el chat principal). "Un agente con el que
pueda charlar" = skill del loop principal que entrevista, con subagentes NO interactivos de
apoyo (investigación, red-team). El v1 no entendió esto y diseñó "agentes" que jamás podrían
haber charlado.

## ADR-003 · El repo git es LA fuente canónica; `~/.claude/` es la copia instalada (2026-07-06)
Al principio la canónica era `~/.claude/` (se editaba ahí). Se invirtió: editar en `kit/` →
sync a `~/.claude/` → commit+push. Razones: historial real de cambios, replicabilidad
multi-PC (`git pull` + re-instalar), y el .gitignore de un solo lugar. Costo aceptado: el
paso de sync manual (lo hace `/cierre`).

## ADR-004 · El Equipador es skill HERMANA (`/arquitecto-skills`), no un modo del Arquitecto (2026-07-06)
Meter gestión de skills adentro del Arquitecto engordaba su SKILL.md y diluía su disparador —
el fantasma del scope-creep que mató al v1. Separado: triggers precisos ("preparame esta
máquina" vs "quiero una app"), archivos chicos, viajan juntos en el mismo paquete igual.

## ADR-005 · SPEC-0 = UN archivo con `Estado: BORRADOR → READY` en la raíz del proyecto (2026-07-05)
El v1 tenía 3 artefactos por spec; el primer diseño v2 tenía borrador + archivo final
separados. Se simplificó a un único archivo con campo de estado: retomable tras abandono
(el borrador ES el spec), gate por estado (la sesión constructora solo ejecuta READY), y
cero renombres. Las features usan el mismo patrón como SPEC delta (AGREGA/MODIFICA/NO SE
TOCA) en `docs/` del proyecto.

## ADR-006 · El gate de aprobación es Plan Mode NATIVO, no una promesa de prompt (2026-07-05)
Lección anti-v1 cazada por el revisor adversarial: "prohibido codear" escrito en un prompt es
una promesa; EnterPlanMode/ExitPlanMode es el sistema impidiéndolo físicamente. El Arquitecto
entra en Plan Mode para diseñar y la aprobación del usuario pasa por la UI nativa.

## ADR-007 · Templates estratificados: universales vs adaptables; smoke/deploy NO nacen el día cero (2026-07-05)
Los templates del playbook se separan en universales (inicio, cierre, hooks, CLAUDE
esqueleto — se copian tal cual) y adaptables (smoke, deploy — contrato + huecos). Un proyecto
nuevo nace SOLO con inicio+cierre: una skill nace de un ritual repetido 3+ veces, no "por las
dudas". Los contratos esperan en los templates.

## ADR-008 · Tags de git reemplazan los snapshots de carpeta (2026-07-11)
Los snapshots (`legacy/snapshots/`) nacieron cuando la canónica era `~/.claude/` (pre-repo).
Con el repo canónico, un tag anotado (`v2.1`) hace lo mismo con menos ceremonia. Los
snapshots viejos quedan como archivo de la era pre-git.

## ADR-009 · v0 de Vercel (y no Google Stitch) para dirección visual de webs (2026-07-11)
Investigado a fondo (tanda 2 de tips): Stitch genera HTML/Tailwind genérico que requiere
traducción con pérdida a shadcn, y su MCP exige Google Cloud con billing. v0 genera
Next.js+shadcn/Tailwind — el stack EXACTO del kit — con tier gratis e integración
`npx shadcn add`. Además: patrón gratis "mockup-en-casa" (3-4 variantes HTML descartables
con frontend-design+theme-factory) antes de recurrir a v0. Re-evaluar Stitch solo si saca
export React/shadcn.

## ADR-010 · Curaduría de tips en DOS etapas separadas (2026-07-08)
El Extractor (sesión barata/otro modelo) extrae, verifica contra fuentes oficiales y PROPONE
en un informe; la sesión madre (acá) decide y aplica. Razones: costo (extracción no necesita
el contexto del sistema), seguridad (quien extrae no puede tocar el sistema), y el informe
queda como acta auditable. Los 3 baldes: ya-lo-tenemos / bueno-y-nuevo-verificado /
humo-con-razón.

## ADR-011 · El Extractor es un AGENTE-CARPETA (2026-07-11)
Su CLAUDE.md ES el rol: abrir Claude Code en `extractor/` = el agente está levantado, sin
prompt ni skill global. Razones: es específico de este repo (no contamina el set global de
skills), se versiona con el repo, y usa el mecanismo más simple que existe (CLAUDE.md se
carga solo). Patrón reutilizable para futuros "agentes de carpeta" del proyecto.

## ADR-012 · v2.1 se declaró estable con el Modo A validado por USO REAL; B y C esperan su estreno (2026-07-11)
Una semana de uso real del Modo A (con una fricción encontrada y corregida: la regla del spec
proactivo) vale más que el protocolo sintético de 1 hora. B y C están construidos y validados
adversarialmente pero sin primera misión real — el tag lo dice honesto en sus release notes.
"No está terminado hasta que lo usaste" se aplica por modo, no por release.

## ADR-013 · El repo madre TAMBIÉN lleva `/inicio` (2026-07-12)
En la profesionalización (11/jul) se decidió NO crear `/inicio` acá: el hook SessionStart
inyecta el handoff y el CLAUDE.md explica el ciclo, así que la skill parecía overkill en un
repo chico. **Revertido al día siguiente, con cicatriz**: en el primer chat post-cierre Guido
escribió `/inicio` por reflejo y recibió "Unknown command". Tres razones: (1) el playbook §2.3
lista `/inicio` como **"Siempre"**, sin excepción — el proyecto madre no puede contradecir el
método que fabrica; (2) los mismos nombres en todos los proyectos ES el punto (memoria
muscular), y acá se rompía; (3) el costo real era 5 minutos, no una decisión de arquitectura.
La versión de este repo no es el template pelado: su chequeo de realidad incluye el **diff
`kit/` ↔ `~/.claude/`** (el drift más peligroso acá, equivalente al health-check de un bot) y
las tandas de `tips/` con propuestas sin procesar. Lección de fondo: aquella decisión vivió
solo en el chat y nunca se escribió como ADR — por eso no aguantó el primer contacto con el
uso real.

## ADR-014 · El kit suma un sistema de documentación de auditoría (FyD): `/docs-fyd`, capa regenerable separada (2026-07-23)
El proyecto se **reabrió** (venía cerrado en v2.1): la auditora **FyD Sistemas** (encargo
2026-07) exige documentación técnica por repo para el bus-factor — *"si Guido desaparece, que
un equipo externo levante los proyectos"* — con deadline de ~2 semanas para 2-3 apps críticas.
**Decisión:** incorporar al método un motor **`/docs-fyd`** que **genera la doc desde el código**
(10 artefactos: ficha, README, C4 c1/c2/c3, secuencia, ER, variables-entorno, instrucciones-IA,
seguridad) en una carpeta **AISLADA `docs-fyd/`**, con los 4 campos de negocio humanos en una
bóveda read-only (`_CAMPOS-NEGOCIO.md`). Se instala vía el Equipador (2da excepción a
clonado-fresco, kit-owned, análoga a shadcn), se **siembra opt-in** desde el Arquitecto (Paso 5
pregunta *"¿los dos sistemas o solo el mío?"*) y el `/cierre` **marca staleness** (no regenera).
Núcleo del desvío: **`docs-fyd/` es un build-artifact regenerable, EXENTO de "lo derivable del
código no se escribe a mano"** — porque es entregable EXTERNO para auditores que no leen código,
y una vista regenerada no miente (el `/cierre` la marca vieja, `/docs-fyd` la reconstruye).
**Alternativas descartadas:** (1) extender los `docs/` de trabajo existentes → mezclaba dos
audiencias en la misma carpeta (ahí ya viven HANDOFF/CHANGELOG/TODO); (2) capa paralela mantenida
a mano → el pecado de los espejos que se pudren (principio 6); (3) construir el Excel/inventario
central (`/inventario-fyd`) ahora → **diferido a Fase 2** (Guido arma el Excel desde su tablero
Kanban, que ya es su fuente de verdad de servicios/costos); (4) nombres neutros → YAGNI, se usa
`/docs-fyd` con el cliente. **Consecuencias:** el diff canónico del repo madre pasa de 3 a 4
rutas; la máquina anti-secretos (solo nombres/ubicación, nunca el valor, frena antes de escribir)
es la parte más blindada; el diseño quedó en `docs/SPEC-docs-fyd.md` (READY, aprobado tras **3
rondas de red-team**) con su contrato de contenido en `docs/referencia-prompts-fyd.md`. Reversión
mediana (borrar la excepción + decidir qué pasa con los `docs-fyd/` ya sembrados). La Fase 2
(inventario-fyd/Excel/Mapa/hub privado) será su propio delta con su propio red-team y su propio
ADR. *Este ADR se escribió en el cierre del diseño; la sesión que CONSTRUYE no lo duplica.*

## ADR-015 · docs-fyd v2: resolver las dudas POR OPCIONES + capa humana protegida, no generar por generar (2026-07-23)
La **primera corrida real** de `/docs-fyd` (repo Hermes, en producción) destapó el límite de v1: 9 de
10 artefactos necesitaron corrección a mano, y las importantes eran **hechos que el código no sabe**
(backups en un servicio externo, RLS real en la base viva, si la base es compartida). Peor, el motor
**afirmó negativos falsos por ausencia** ("no hay backups", "falta RLS") que en un entregable de
auditoría **acusan al propio cliente**, y esas correcciones **se perdían en la regeneración, en
silencio**. **Decisión:** construir **docs-fyd v2** — cuando el motor duda, **pregunta por OPCIONES**
(AskUserQuestion: el motor propone, Guido elige; no escribe documentación), con una **checklist
proactiva fija** (backups · RLS/control de acceso · base compartida · vigencia de tokens) que se
dispara **aunque el código calle**; **nunca afirma un negativo absoluto** (fórmula "no se encontró X
en el código — confirmar"); lo humano vive en **`_ACLARACIONES.md`** bajo una regla `_`=read-only
generalizada (**crear + anexar, nunca pisar contenido humano**); hay **auto-verificación con rastro**
antes de entregar; las herramientas auxiliares corren **fuera del repo**; y un Mermaid roto **no tira
el documento** (placeholder). Sigue siendo **regenerable** — NO se vuelve a mantenimiento incremental
(ese es el pecado que v1 mata). **Alternativas descartadas:** (1) volver a doc mantenida a mano →
espejos que se pudren; (2) que el humano escriba **prosa libre** → riesgo de fuga de credenciales +
fricción (Guido no escribe doc) → se eligió **opciones** con freno bloqueante para el texto libre
raro; (3) que el motor guarde **solo el hecho pelado** (máxima seguridad) → descartado por perder
contexto que el auditor valora; (4) **verificación EN VIVO automática** (que el motor consulte la
base/API) → **diferida a Fase 2** (toca producción, su propio red-team); mientras tanto la checklist
proactiva captura ese valor vía el humano. **Consecuencias:** es un delta sobre docs-fyd que YA anda
(NO SE TOCA protege el cepillo, el write-set, la bóveda, los 10, el contrato de contenido); el diseño
quedó en `docs/SPEC-docs-fyd-v2.md` (READY, endurecido tras **1 ronda de red-team, 6 lentes, 26
hallazgos foldeados** — que cazó contradicciones internas graves: la regla `_` que se contradecía, el
cepillo que no cubre prosa, el disparo de dudas que se cancelaba con el auto-control, Mermaid vs "los
10 siempre"); cómo se mide si mejoró está en `docs/EVALUACION-docs-fyd-v2.md` (re-correr sobre Hermes,
señal vs ruido de las preguntas). Reversión mediana. La Fase 2 (verificación en vivo) será su propio
delta/ADR.
