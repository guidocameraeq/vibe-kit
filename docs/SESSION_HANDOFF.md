# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope**: con el TODO y git, lo inyectado tiene que quedar bajo 10.000 caracteres.

**Última sesión cerrada:** 2026-10-24, misión 4, tramo 4: **racimo G cerrado y revisado** (la mesa entre directores, las PCs y el buzón;
12 decisiones aprobadas en bloque; revisor frío con 34 hallazgos, todos aplicados). Solo diseño, kit `v2.4.2`. PC `Usuario`. `kit-sync` LIMPIO.

## Dónde estamos

- **Misión 4**: tramos 0 a 3 hechos ([`PLAN.md`](mision-4/PLAN.md)). **Tramo 4**: ✅ A · ✅ C · ✅ E · ✅ F · ✅ B · ✅ D · ✅ G · **orden que fijó
  Guido (2026-10-24): H → I → G.1 al final**, después la **revisión integral de todos con los 11 criterios** (ahí se cierra la D5, provisoria) y
  el spec (tramo 5).
- ✅ **G · Mesa y PCs** ([`DISENO-G-mesa-y-pcs.md`](mision-4/DISENO-G-mesa-y-pcs.md), 51 KB): el contenido de la mesa va **siempre por git**
  (un archivo ≤2 KB por mensaje en `docs/modulos/<x>/mesa/<alias>/`, que nunca se edita; abierto/acordado lo calcula `mesa.js`) y el aviso por
  `SendMessage` es opcional (por nombre si el otro está en la lista; si no, nada) · 6 tipos de mesa en una tabla única del kit · acuerdos que
  viven una vez y van al PO solo si cambian el alcance · recursos compartidos con dueño y conjunto declarado · "trabado por mesa" calculado,
  **nadie le avisa a Guido: lo ve al abrir el otro proyecto** (ajuste suyo) · `crossSessionInbound: accept` lo pone el Equipador en user ·
  dos personas: `fetch`, aviso de commits ajenos, commit por rutas · números de decisión por módulo · lecciones al repo por script · `aprueba:`
  por alias. **Git ya cruza cuentas** (el compañero lee los repos con su GitHub): el buzón quedó como **G.1, opt-in**, brief en G §18.
- 🆕 **Datos de Guido**: el compañero **tiene su propia cuenta de Claude Code** (antes compartían); la segunda cuenta de GitHub es él (FLOTA §8
  cerrada). La mesa la usa sobre todo entre dos sesiones de su misma PC. Pidió que los diseños se le presenten con el cuadro conceptual antes
  de las decisiones (memoria).

## Próximo paso: racimo H · niveles y puertas del Arquitecto

**Título: `vibe-kit M4 · Tramo 4: racimo H (niveles y puertas del Arquitecto)`**. Esfuerzo `high`. Decisiones de a una, en criollo; **antes de
la lista, un párrafo con qué sigue igual, qué cambia, quién lo hace y qué NO le toca a Guido**.

- **Qué cubre** (TABLERO §10, fila H): P6, P7, P9, P10, P35, P51, P52, P57; S-R-6; **los subproyectos** (TABLERO §10, bloque 🆕); los tres
  tamaños (liviano · estándar · proyecto largo con director) y las puertas del Arquitecto (nuevo, feature, consultorio, adoptar); "lo chico no
  paga el costo del spec" (REFERENCIAS §4, señal de gentle-ai).
- **Lo que le dejaron**: de **D** (§19): el texto del triage, el criterio "más de una pestaña ejecutando", nombres de ramas y worktrees por
  módulo y por encargo, el script del worktree con su entorno (S-D-7), el entorno de prueba como verificación del Arquitecto, mapear `sensible:`
  a reglas concretas (con F); de **G** (§22): cuándo `/inicio` propone `claude -w`, el módulo que cruza dos repos (`enlaza:`), merge sin
  squash; de **B** (§5-§6): módulos planos con `parte-de:`, tres tamaños con una sola estructura; de **C** (§2.5): `/estado <subproyecto>`.
- **Cómo arranca**: (1) lector barato (Sonnet) sobre las puertas reales de hoy: `kit/skills/arquitecto/SKILL.md` (Modos A/B/C) y sus
  templates, más cómo los proyectos abrieron features chicas vs grandes (tanda P9, P51, S-R-6) → ficha "hoy"; (2) verificar contra doc oficial
  solo lo que H necesite (worktrees ya está en G §16); (3) decisiones → revisor frío Opus → filtro → `DISENO-H-*.md` con su tabla → notas y PLAN.
  Subagentes en Sonnet u Opus, nunca Fable.
- **Lee**: PLAN §El foco · TABLERO §4, §5, §7, §10 · DISENO-D §4, §19 · DISENO-G §11, §12, §22 · DISENO-B §5, §6 · DISENO-E §4, §7 · DISENO-A §6 ·
  DISENO-C §2.5 · FLOTA §2 · REFERENCIAS §1 y §4.

**Después de H**: **I** (el agente de ecosistema; vive en el Hub, el kit solo consume el `registro`) y **G.1 al final** (hay una tarjeta de sesión
propuesta con el brief; si venció, el brief está en G §18). **Sesión corta aparte, cuando Guido quiera**: `vibe-kit · Tope al hook del molde
(v2.4.3)`, esfuerzo `medium`; guía DISENO-B §9 y el hook del Hub.

## Cosas que muerden y no están en ningún otro doc

- 🔑 **Esta PC no tiene identidad de git**; el cierre commitea con el `-c` de respaldo. Con qué cuenta firma, **NO VERIFICADO**.
- 📬 **El Hub pushea a este repo desde otra sesión.** **Antes de cerrar, `git fetch` siempre** (hoy no había nada nuevo).
- 🧪 **NO VERIFICADO que van al piloto de Hermes (G §23)**: que `gh api` lea el archivo del otro repo a un SHA de rutina; que GitHub conserve un
  commit citado si la rama se borró; la memoria de G: las tres PCs de Guido con la misma cuenta de claude.ai. Los 10 de D (§7.7, §11, §20) siguen.
- 🔴 **vibe-kit es PÚBLICO**: gitleaks antes de cada push (hoy limpio). En los diseños, alias (Desktop, Mobile, Hub, Deptos, Devoluciones).
- 🔐 **12 alertas abiertas** (archivo privado), las arregla Guido. 🖥️ Los directores de Hermes corren en la PC `clientes`.

## Bloqueos

Ninguno.
