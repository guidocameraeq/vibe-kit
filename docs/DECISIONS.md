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
