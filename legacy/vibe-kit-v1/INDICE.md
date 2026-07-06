# Indice de vibe-kit

> Mapa del plugin: que es cada archivo, en una linea. Si buscas donde toca algo, empeza aca.
> Todos los comandos y agentes viven a NIVEL RAIZ de su carpeta (nunca anidados), para que Claude Code los descubra bien.

## Arbol del plugin

```
vibe-kit/
├── .claude-plugin/
│   ├── plugin.json            Manifest del plugin: nombre, version, autor, keywords. Lo lee Claude Code al instalar.
│   └── marketplace.json       Catalogo del marketplace local: deja instalar vibe-kit con /plugin install.
├── README.md                  Presentacion del kit, tabla de comandos, pasos de instalacion y quickstart.
├── INDICE.md                  Este archivo: mapa de todo el plugin con una linea por archivo.
│
├── commands/                  Slash commands (los disparas con / en el chat). A NIVEL RAIZ, sin subcarpetas.
│   ├── arquitecto.md          /arquitecto — AGENTE PRINCIPAL: te entrevista en Plan Mode, no toca codigo y escribe el SPEC a disco.
│   ├── nueva-app.md           /nueva-app — arranque greenfield: cuestionario + checklist de concerns, escribe project.yaml y pasa la posta al Arquitecto.
│   ├── feature.md             /feature — agregar una feature a una app existente (brownfield): explora primero, propone que SI/que NO cambia, escribe el spec.
│   ├── fix.md                 /fix — arreglo acotado de un bug o cambio chico; decide si va directo o con plan, y deja explicito que NO se toca.
│   ├── release.md             /release — Release Manager: Conventional Commits, SemVer + CHANGELOG, corre /docs-check y abre un PR con gh.
│   ├── docs-check.md          /docs-check — detecta drift entre docs/CLAUDE.md/project.yaml y el codigo real; delega en el agente doc-keeper.
│   └── crear-rol.md           /crear-rol — META: convierte un rol que repetis en un comando o agente durable en disco (sobrevive a /compact).
│
├── agents/                    Subagentes ayudantes que el Arquitecto delega. Todos read-only (el reviewer tampoco edita).
│   ├── explorador-codigo.md   Explora una app existente y devuelve un mapa de terreno (stack, entidades, concerns, riesgos). Read-only (Read/Grep/Glob).
│   ├── redteam-spec.md        Red-team adversarial de un SPEC ya escrito: busca ambiguedades, supuestos riesgosos, edge cases y contradicciones. Read-only.
│   ├── doc-keeper.md          Detective de drift docs vs codigo: compara las fuentes de verdad contra el codigo y propone parches de doc. Read-only.
│   └── reviewer.md            Revisa codigo recien escrito con ojos frescos; reporta solo huecos de correctitud y de requisitos (no estilo). Read-only.
│
├── skills/                    Know-how reusable. Una carpeta por skill, cada una con su SKILL.md. Los comandos las referencian por nombre de carpeta.
│   ├── entrevista-descubrimiento/
│   │   └── SKILL.md           Banco de preguntas en 3 etapas (oportunidad/solucion/riesgo) para la entrevista greenfield del Arquitecto.
│   ├── elicitacion-avanzada/
│   │   ├── SKILL.md           Menu 1-5 de lentes (pre-mortem, primeros principios, inversion, red team, socratico) para afilar una seccion del spec.
│   │   └── methods.csv        Catalogo de tecnicas de elicitacion que alimenta el menu (id, nombre, cuando usarla).
│   ├── escribir-spec/
│   │   └── SKILL.md           Como y donde escribir el spec: 3 artefactos (SPEC/DESIGN/TASKS), criterios EARS, Supuestos, limites de 3 niveles, verificacion.
│   ├── matriz-de-stacks/
│   │   └── SKILL.md           Golden paths por tipo de app (web Next.js / Android Expo / Windows Tauri / datos + Python detras de una frontera).
│   ├── checklist-concerns/
│   │   └── SKILL.md           La constitution: catalogo de concerns transversales (roles, listas configurables, errores, logging, auditoria, i18n, etc.).
│   ├── playbook-orquestacion/
│   │   └── SKILL.md           Como trabajar: subagente vs principal, ambiguo vs especifico, Plan vs Auto, /clear vs /compact, rol durable.
│   ├── brownfield-openspec/
│   │   └── SKILL.md           Propuesta de cambio para apps que ya andan: 4 campos (Por que/Que cambia y que NO/Alcance/Exito) + delta ADDED/MODIFIED/REMOVED.
│   └── crear-agentes-y-comandos/
│       └── SKILL.md           Manual de fabricacion: frontmatter exacto de comandos y agentes, como restringir tools y como entregarles skills. La usa /crear-rol.
│
├── templates/                 Plantillas que el kit rellena al arrancar un proyecto.
│   ├── CLAUDE.md.template          CLAUDE.md de proyecto (memoria durable que se commitea): stack, comandos, arquitectura, boundaries. Corto (<150 lineas).
│   ├── constitution.md.template    Constitution del proyecto: principios no-negociables y los concerns activados, con su Sync Impact Report.
│   ├── SPEC.md.template            Esqueleto de un SPEC chico: que/por que, user stories, criterios EARS, Supuestos, concerns activos, fuera de alcance.
│   └── project.yaml.template       Contrato portable del proyecto (raiz): tipo de app, stack, concerns ON/OFF, orquestacion. Lo escribe /nueva-app.
│
├── hooks/
│   └── hooks.json             Hooks deterministas: Stop (verificacion lint+typecheck+test al cerrar turno) y PostToolUse (marca drift de docs). Llaman a scripts PowerShell.
│
└── tutoriales/                Guias paso a paso en espanol rioplatense, para no-programador.
    ├── 00-instalacion.md              Instalar el kit de cero (marketplace local o GitHub), verificar y troubleshooting.
    ├── 01-primer-uso-arquitecto.md    Primer uso de /arquitecto en una app nueva, de punta a punta, con ejemplo concreto.
    ├── 02-app-existente-erp.md        Brownfield: sumar una feature a una app que ya anda (caso ERP) con /feature.
    ├── 03-convertir-chats-en-comandos.md  Convertir un rol improvisado en un comando/agente durable con /crear-rol.
    ├── 04-compactacion-y-roles.md     Por que se pierde el rol al /compact y como blindarlo (comando + CLAUDE.md + hooks).
    └── 05-cuando-usar-que-orquestacion.md  Chuleta de decision: principal vs subagente, ambiguo vs especifico, plan vs directo, autonomia.
```

## Notas de cruce (como encaja todo)

- **`/arquitecto`** es el agente principal: usa las skills `entrevista-descubrimiento`, `matriz-de-stacks`, `checklist-concerns`, `elicitacion-avanzada` y `escribir-spec`, y delega en los agentes `explorador-codigo` y `redteam-spec`.
- **`/nueva-app`** escribe `project.yaml` (desde `templates/project.yaml.template`) y le pasa la posta al Arquitecto.
- **`/feature`** y **`/fix`** usan `explorador-codigo` + `brownfield-openspec` + `escribir-spec` + `checklist-concerns`.
- **`/docs-check`** delega en `doc-keeper`; **`/release`** lo corre antes de abrir el PR.
- **`/crear-rol`** usa la skill `crear-agentes-y-comandos` para fabricar nuevos comandos/agentes a nivel raiz.
- Los **hooks** materializan lo innegociable (verificacion y anti-drift) en codigo, no en prompt.
