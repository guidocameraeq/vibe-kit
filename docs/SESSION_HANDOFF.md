# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope**: con el TODO y git, lo inyectado tiene que quedar bajo 10.000 caracteres.

**Última sesión cerrada:** 2026-10-26, misión 4, tramo 4: **H cerrado (✅, 14 decisiones)** y **la lectura de contraste de los chats, hecha**
(acta `tips/tanda-2026-11-contraste.md`, 98 KB; 22,1 M de tokens; lo crudo a salvo en el repo privado `vibe-research`). Solo diseño,
kit `v2.4.2`. PC `clientes`. `kit-sync` LIMPIO.

## Dónde estamos

- **Misión 4**, tramo 4: ✅ **A · C · E · F · B · D · G · H**. **I salió del kit** (ADR-024: el agente de ecosistema se diseña en el Hub; acá
  queda el contrato del registro, nota en E). Orden que fijó Guido hoy: **revisión integral → G.1 (mañana) → spec**. [`PLAN.md`](mision-4/PLAN.md).
- ✅ **H**: Guido aprobó las 7-14 **con una corrección a la 9**: el tope del spec es un **aviso** (el script mide, el Arquitecto propone el corte,
  decide Guido); "el spec no crece durante la obra" queda firme. Y trajo la cicatriz de la 7: 47 worktrees `D:\Hermes-*` en la raíz del disco,
  porque la skill `director` de Hermes los manda afuera del repo; H §10 los mete en `.claude/worktrees/`. Ordenar Hermes es trabajo de su repo.
- ✅ **La lectura de contraste** ([acta](../tips/tanda-2026-11-contraste.md)): 336 chats de `clientes` (todos, hasta el corte nuevo
  **2026-10-26 14:47 UTC**), 83 lectores Sonnet + 3 síntesis Opus. **Las 49 decisiones con veredicto**: 17 confirmadas · 17 contradichas ·
  14 mixtas · 1 sin evidencia (H-8). Ojo: "contradicha" casi siempre = *hoy pasa lo que la decisión viene a cambiar* (línea de base, no rompe);
  las que ponen en duda una **premisa** son ~10 y se reabren: **A-1, E-1, F-1, H-6, D-8, B-6/B-7, H-5, E-4, D-10 y la D5 provisoria**.
  Hábitos cruzados con el acta de `Usuario`; **propuestas nuevas P66-P77**; insumos para I y G.1; 7 lecciones de receta (§4).
- `recortar.py` tiene el modo `contraste` (mensajes entre sesiones enteros) y el presupuesto con dos cotas.

## Próximo paso: la revisión integral del tramo 4

**Título: `vibe-kit M4 · Tramo 4: revisión integral con el acta de contraste`**. Esfuerzo `high`. Con el acta abierta y **sin volver a los
chats**, cuatro cosas concretas: las ~10 decisiones a reabrir, una por una con Guido y en criollo (cierra la D5); **triage de P58-P77 en tres
pilas** (entra ya a un diseño · se construye en la misión 5 · espera al piloto); releer **solo** los 4-5 chats marcados ★ en el acta que toquen
una decisión; y **la nota del contrato del registro en E** (lo único que queda de I: el kit lee un registro por adaptador, forma `{version,
fichas, conexiones}`, y el Arquitecto mira el mapa antes de entrevistar por un proyecto nuevo). Todo con los 11 criterios; revisor frío al final.

**Después, en orden** (plan de Guido del 2026-10-26):
1. **G.1 (mañana)**: `vibe-kit M4 · Tramo 4: racimo G.1 (el buzón entre agentes)`, brief en G §18 **más sus insumos del acta**: subagentes sin
   tope ni latido (hueco 3 / P71), la cabecera "si no sos tal, ignorá", las defensas ante textos con forma de orden, el canal que se cae, la
   pausa ordenada (P68) y el resumen del día (P77).
2. **El spec** (tramo 5): red team, revisor frío, OK de Guido.

**Fuera de vibe-kit**: el agente de ecosistema arranca en el repo del Hub con su `/arquitecto` (Modo B), con lo del mapa y la flota del acta.

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
