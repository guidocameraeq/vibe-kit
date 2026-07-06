# El "Agente Arquitecto" de vibe-kit — prior-art y diseño

> Síntesis de un workflow de investigación (5 ángulos en paralelo + síntesis). La noticia: **casi todo ya está inventado.** No hay que construir un framework — hay que robar piezas y ensamblarlas sobre lo que Claude Code ya da nativo, y agregarle nuestros kits.

## 1) Qué ya existe que se parece a lo que querés

Ordenado por cercanía al flujo *hablar → super-spec → Claude trabaja solo*:

1. **obra/superpowers — skill `brainstorming`** — el match más cercano. Diálogo de diseño pre-coding con un *hard gate*: no escribe NADA de código hasta entrevistarte (una pregunta a la vez), proponer 2-3 alternativas, aplicar YAGNI, mostrarte el diseño por secciones con aprobación, escribir un design-doc fechado y recién ahí pasar la posta. → `https://github.com/obra/superpowers` (`skills/brainstorming/SKILL.md`)
2. **BMAD-METHOD** (~49k stars) — el prior-art más maduro. Equipo de producto (Analyst, PM, Architect, UX, SM, Dev) como personas en markdown+YAML. Su joya: **"Advanced Elicitation"** — tras generar cualquier sección, ofrece un menú 1-5 de lentes de razonamiento (pre-mortem, primeros principios, inversión, red/blue team, socrático) para refinar en loop. Pesado de más (12+ agentes), pero la mecánica de elicitación es oro. → `https://github.com/bmad-code-org/BMAD-METHOD`
3. **piercelamb/deep-plan** — plugin: spec crudo → plan TDD vía pipeline de 5 fases (research → entrevista de 5-10 preguntas guardada como transcript → síntesis del spec → revisión multi-modelo → partir el plan en secciones autónomas). Es tu "super-spec → Claude muele una hora" ya empaquetado, con *resumability*. → `https://github.com/piercelamb/deep-plan`
4. **GitHub Spec Kit** — oficial. Spec → Plan → Tasks → Implement (`/specify` `/clarify` `/plan` `/tasks` `/implement`). Su `/clarify` es el mejor modelo de desambiguación: preguntas multiple-choice con opción RECOMENDADA, tope de marcadores `[NEEDS CLARIFICATION]`, regla "informed guesses + sección Assumptions". → `https://github.com/github/spec-kit`
5. **AWS Kiro** — IDE spec-first (propietario, pero las ideas valen): formato **EARS** (`WHEN/IF/WHILE ... SHALL`) para criterios testeables, **steering docs** (`product.md`/`tech.md`/`structure.md`) como memoria de proyecto, y modo **Quick Plan** (todas las preguntas adelante, después corre de corrido) = tu "hablo una vez, trabaja una hora". → `https://kiro.dev/docs/specs/`

Complementos: **Agent OS v3** (kits `mission/roadmap/tech-stack.md`), **OpenSpec** (delta specs ADDED/MODIFIED/REMOVED para brownfield), y el patrón oficial de Anthropic **"Let Claude interview you"** → `https://code.claude.com/docs/en/best-practices`.

## 2) Las mejores ideas a robar

- **Superpowers:** una pregunta a la vez (multiple-choice); *hard gate* prohibido tocar código hasta aprobar el diseño; aprobación por sección; YAGNI despiadado; auto-descomponer pedidos grandes; auto-review del spec antes de mostrarlo.
- **BMAD:** el loop generar → menú 1-5 de refinamiento → aplicar → confirmar; `methods.csv` extensible; **HALT obligatorio** (nunca modifica sin tu y/n); personas con voz fuerte.
- **deep-plan:** transcript de la entrevista persistido (reviewable/resumable); retomar desde artefactos existentes; partir el plan en secciones autónomas; validar prerequisitos temprano.
- **Spec Kit:** marcadores `[NEEDS CLARIFICATION]` con tope (~3); "informed guesses + Assumptions"; prioridad **scope > seguridad > UX > técnico**; `constitution` = tu checklist de concerns.
- **Kiro:** EARS para criterios testeables; cubrir happy path + edge cases + fallos; steering docs como memoria; modo Quick Plan.
- **OpenSpec (brownfield):** propuesta de 4 campos **Why / What (+ qué NO cambia) / Scope / Success**; delta specs; listar explícitamente "qué se queda IGUAL" (delimita el blast radius).
- **Subagentes nativos (PubNub):** gate por status (`READY_FOR_ARCH`); tools por rol → Arquitecto **read-only**, ejecutor con Edit/Write/Bash.

## 3) Qué integrar vs adaptar vs construir

**Integrar tal cual:** Claude Code **Plan Mode + ExitPlanMode** (el cimiento: discutir read-only → escribir el plan a archivo → aprobar → ejecutar; el handoff pasa por el filesystem — no reinventar el gate); docs oficiales de Anthropic; el skill **`bmad-advanced-elicitation`** (portable casi sin tocar; solo reescribir `methods.csv` para apps de negocio).

**Adaptar:** el flujo de **Superpowers brainstorming** como columna vertebral (traducido, con onboarding sobre dolor/usuarios/roles); el pipeline de **deep-plan**; las plantillas de **Spec Kit** en español; los **steering docs** como formato de kits; **EARS** suavizado; la propuesta + delta de **OpenSpec** para brownfield.

**Construir propio (lo único genuinamente tuyo):** el **contenido de tus kits** (checklist de concerns, matriz de stacks JS/TS + Python, reglas, playbook de orquestación); el **banco de preguntas de descubrimiento** en español rioplatense; el **empaquetado como plugin** (⚠️ bug de BMAD: Claude Code NO descubre slash commands en subdirectorios anidados — usar wrappers a nivel raíz).

> **Honestidad brutal:** Superpowers + BMAD elicitation + deep-plan, montados sobre Plan Mode, **ya resuelven ~85% de lo que querés.** Lo que justifica vibe-kit propio NO es el motor conversacional (eso se roba), sino **tus kits + el tono para no-programador + el empaquetado integrado.** Para validar rápido podés correr Superpowers brainstorming + Spec Kit `/clarify` casi sin escribir código.

## 4) Diseño recomendado del "Agente Arquitecto"

**Cómo se invoca:** como **agente PRINCIPAL** (no subagente) — decisivo, porque el corazón es dialogar a mitad de camino y a un subagente no le podés hablar mientras corre. Slash command a nivel raíz (`/arquitecto`, `/feature`, `/fix`). Corre en **Plan Mode forzado** (read-only: nunca codea). Los subagentes quedan como ayudantes que el Arquitecto lanza en background (explorar código, red-team del spec).

**Cómo conduce la conversación** (4 fases: Understanding → Design → Review → Final):
- **Greenfield (app nueva):** modo entrevista, banco de preguntas en 3 etapas (oportunidad/solución/riesgo): dónde se atasca el proceso, qué es repetitivo, qué errores duelen, usuarios y roles. Regla de tiempo: 30-40% al problema, 60-70% al diseño.
- **Brownfield (app andando):** primero explora el código (read-only), después entrevista con preguntas ancladas a lo que encontró. Arranca con la propuesta OpenSpec (Why / What + qué NO cambia / Scope / Success).
- **Cómo pregunta:** una a la vez o tandas chicas, SIEMPRE multiple-choice numerada con default "Recomendado" y fast-path "respondé los defaults"; solo preguntas que eliminan ramas enteras (tope ~3-5); lo no crítico se asume y se registra en `Assumptions` (impacto HIGH/MED/LOW).
- **Cómo repregunta:** menú de elicitación 1-5 (`[r]eshuffle [a]ll [x]proceed`) con lentes adversariales (pre-mortem, red/blue team, inversión, socrático); **HALT** tras cada propuesta.
- **Cómo converge:** re-enuncia los requisitos (mini-contrato); ofrece **modo Q&A exhaustivo** vs **borrador rápido** (genera ya + `[ASSUMPTION:]` rankeadas) — para vos el borrador rápido suele ser mejor default; auto-review del spec antes de entregar.

**Qué entrega:** un **super-spec persistido en disco** (`.md`). Chico: un `SPEC.md`. Grande: `.claude/specs/{feature}/{requirements,design,tasks}.md`. Tres artefactos: **SPEC** (qué/por qué, user stories, criterios EARS) → **DESIGN** (cómo: stack de la matriz, archivos, contratos) → **TASKS** (plan ordenado, criterios binarios). Con **límites de 3 niveles** (Verde siempre / Ámbar preguntar / Rojo nunca) y un **paso de verificación end-to-end** para que Claude se auto-corrija durante la hora autónoma.

**Handoff a ejecución autónoma:** por **filesystem** (el spec vive en `.md`, se ejecuta vía ExitPlanMode). Spec aprobado (`READY`) → **sesión FRESCA** para implementar (contexto limpio). En esa sesión: dial de autonomía a **Auto/acceptEdits**, con **git commiteado antes** como red de seguridad.

**Cómo encaja con vibe-kit:** los kits viven en `.claude/steering/` y se cargan como contexto/constitution (el checklist de concerns = la `constitution`; la matriz de stacks alimenta DESIGN; reglas/playbook se inyectan just-in-time). Los specs son **memoria viva entre sesiones**: al archivar un cambio se fusiona en el spec maestro → la app siempre tiene un spec actualizado de lo que ES.

## 5) Tabla de decisión (cuándo qué)

| Decisión | Regla simple | Por qué |
|---|---|---|
| **¿Subagente o agente principal?** | **Principal** para conversar, trabajo chico o pasos encadenados (= tu Arquitecto). **Subagente** solo como ayudante en background: leer 10+ archivos, 3+ tareas independientes, o revisar con ojos frescos. | A un subagente no le podés hablar mientras corre. NO subagentes para tareas chicas, trabajo secuencial dependiente, o dos tocando el mismo archivo. |
| **¿Específico o ambiguo?** | **Ambiguo temprano, específico en el spec.** En la charla, dejá que el agente te entreviste y proponga. Todo lo que querés construido va al spec con máxima precisión. | "Instrucciones vagas → resultados vagos." Un buen spec quita 15-20 decisiones que Claude improvisaría. |
| **¿Nivel de autonomía?** | Fase HABLAR/spec → **Plan mode** (read-only). Fase EJECUTAR → **Auto/acceptEdits**. Nunca bypass/YOLO fuera de un sandbox. | Mapea a tus dos fases. Commit en git antes de la corrida autónoma. |
| **¿Plan-first o directo?** | **Si lo describís en UNA frase, salteá el plan; si no, planeá primero.** Planeá siempre que: hay incertidumbre, 3+ archivos, schema/seguridad, o no conocés el código. | En tu primer mes: dejá Plan mode SIEMPRE prendido y aflojá con el tiempo. |

**Checklist para arrancar cualquier sesión:**
- [ ] ¿Feature nueva o cambio sobre app existente? (greenfield = entrevista; brownfield = explorar código + propuesta OpenSpec)
- [ ] ¿Lo describo en una frase? → directo. Si no → Plan mode.
- [ ] ¿Necesito hablar/iterar? → agente principal. ¿Leer mucho / revisar? → subagente.
- [ ] Charla: ambiguo OK. Spec: específico, con verificación end-to-end y límites de 3 niveles.
- [ ] Antes de ejecutar autónomo: commit en git + dial a Auto.
- [ ] Spec aprobado → sesión fresca para ejecutar.

## URLs para clonar/leer
- `https://github.com/obra/superpowers` (skill `brainstorming`)
- `https://github.com/bmad-code-org/BMAD-METHOD/blob/main/src/core-skills/bmad-advanced-elicitation/SKILL.md`
- `https://github.com/piercelamb/deep-plan`
- `https://github.com/github/spec-kit`
- `https://code.claude.com/docs/en/best-practices` (patrón "Let Claude interview you")
