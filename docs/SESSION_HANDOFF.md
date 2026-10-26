# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope**: con el TODO y git, lo inyectado tiene que quedar bajo 10.000 caracteres.

**Última sesión cerrada:** 2026-10-26, misión 4, tramo 4: **H cerrado (✅, 14 decisiones)** y **la lectura de contraste de los chats, hecha**
(acta `tips/tanda-2026-11-contraste.md`, 98 KB; 22,1 M de tokens; lo crudo a salvo en el repo privado `vibe-research`). Solo diseño,
kit `v2.4.2`. PC `clientes`. `kit-sync` LIMPIO.

## Dónde estamos

- **Misión 4**, tramo 4: ✅ **A · C · E · F · B · D · G · H**. Orden que fijó Guido hoy: **I → revisión integral → G.1 (mañana) → spec**
  ("resolver todo el resto antes de G.1"). [`PLAN.md`](mision-4/PLAN.md).
- ✅ **H**: Guido aprobó las 7-14 **con una corrección a la 9**: el tope del spec es un **aviso** (el script mide, el Arquitecto propone el corte,
  decide Guido); "el spec no crece durante la obra" queda firme. Y trajo la cicatriz de la 7: 47 worktrees `D:\Hermes-*` en la raíz del disco,
  porque la skill `director` de Hermes los manda afuera del repo; H §10 los mete en `.claude/worktrees/`. Ordenar Hermes es trabajo de su repo.
- ✅ **La lectura de contraste** ([acta](../tips/tanda-2026-11-contraste.md)): 336 chats de `clientes` (todos, hasta el corte nuevo
  **2026-10-26 14:47 UTC**), 83 lectores Sonnet + 3 síntesis Opus. **Las 49 decisiones con veredicto**: 17 confirmadas · 17 contradichas ·
  14 mixtas · 1 sin evidencia (H-8). Ojo: "contradicha" casi siempre = *hoy pasa lo que la decisión viene a cambiar* (línea de base, no rompe);
  las que ponen en duda una **premisa** son ~10 y se reabren: **A-1, E-1, F-1, H-6, D-8, B-6/B-7, H-5, E-4, D-10 y la D5 provisoria**.
  Hábitos cruzados con el acta de `Usuario`; **propuestas nuevas P66-P77**; insumos para I y G.1; 7 lecciones de receta (§4).
- `recortar.py` tiene el modo `contraste` (mensajes entre sesiones enteros) y el presupuesto con dos cotas.

## Próximo paso: el racimo I

**Título: `vibe-kit M4 · Tramo 4: racimo I (el agente de ecosistema)`**. Esfuerzo `high`. Mismo molde que los otros racimos: decisiones con
Guido, una por una y en criollo, con "qué cambia para él"; los 11 criterios del PLAN y su tabla al cierre; revisor frío; verificación contra la doc
oficial. Punto de partida: TABLERO §10 (el agente vive en el Hub, el kit solo consume el `registro`) y E §4. **Del acta le entran**: los roles que
existen de hecho (sesión de spec, obrero de decisiones; P76), lo del Hub y la ficha de presencia del PO (P69). **No se leen más chats.**

**Después, en orden** (plan de Guido del 2026-10-26, armado con la sesión del observatorio):
1. **Revisión integral del tramo 4, con el acta abierta**: `vibe-kit M4 · Tramo 4: revisión integral con el acta de contraste`. Tres cosas
   concretas: las ~10 decisiones a reabrir, una por una (cierra la D5); **triage de P58-P77 en tres pilas** (entra ya a un diseño · se
   construye en la misión 5 · espera al piloto); releer **solo** los 4-5 chats marcados ★ en el acta que toquen una decisión. Con los 11 criterios.
2. **G.1 (mañana)**: `vibe-kit M4 · Tramo 4: racimo G.1 (el buzón entre agentes)`, brief en G §18 **más sus insumos del acta**: subagentes sin
   tope ni latido (hueco 3 / P71), la cabecera "si no sos tal, ignorá", las defensas ante textos con forma de orden, el canal que se cae, la
   pausa ordenada (P68) y el resumen del día (P77).
3. **El spec** (tramo 5): red team, revisor frío, OK de Guido.

**Sesión corta aparte, cuando Guido quiera**: `vibe-kit · Tope al hook del molde (v2.4.3)`, esfuerzo `medium`.

## Cosas que muerden y no están en ningún otro doc

- 🔑 **Identidad de git**: en `clientes` el mail es el `noreply` de GitHub de `guidocameraeq` (vale; es su cuenta). Nunca `eq.chatgpt`.
- 🗄️ **Lo crudo de las dos lecturas vive en `D:\vibe-hallazgos\`** (no es repo); su copia, `biblioteca/` del privado `vibe-research` (al día).
  **No se borra nada hasta que cierre la misión 5** (memoria). `D:\vibe-research\` es solo carpeta de trabajo.
- 📬 **El Hub pushea a este repo desde otra sesión**: `git fetch` antes de cerrar (hoy nada nuevo).
- 🧪 **NO VERIFICADO al piloto (Deptos)**: los 10 de H §22 y los de D y G; los números del tope del spec.
- 🔴 **vibe-kit es PÚBLICO**: gitleaks antes de cada push (hoy limpio en `tips/`, `observatorio/` y `docs/mision-4/`). Alias en los diseños.
  🔐 **12 alertas abiertas**, las arregla Guido.

## Bloqueos

Ninguno.
