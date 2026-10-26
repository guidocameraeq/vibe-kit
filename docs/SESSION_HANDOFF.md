# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope**: con el TODO y git, lo inyectado tiene que quedar bajo 10.000 caracteres.

**Última sesión cerrada:** 2026-10-26, misión 4, tramo 4: **H cerrado (✅, 14 decisiones)** y **la lectura de contraste de los chats, hecha**
(acta `tips/tanda-2026-11-contraste.md`, 98 KB; 22,1 M de tokens; lo crudo a salvo en el repo privado `vibe-research`). Solo diseño,
kit `v2.4.2`. PC `clientes`. `kit-sync` LIMPIO.

## Dónde estamos

- **Misión 4**, tramo 4: ✅ **A · C · E · F · B · D · G · H**. **I salió del kit** (ADR-024: el agente de ecosistema se diseña en el Hub; acá
  queda el contrato del registro, nota en E). **Hoja de ruta reordenada (ADR-025)**: 4 cierra el diseño **sin mensajería** (revisión integral → spec) → 4½ ordenar la casa → 5 v3.0 →
  6 el ciclo como proceso → 7 mensajería (v3.1). El TODO la lleva, con el ciclo de 3-4 meses. [`PLAN.md`](mision-4/PLAN.md).
- ✅ **H**: Guido aprobó las 7-14 **con una corrección a la 9**: el tope del spec es un **aviso** (el script mide, el Arquitecto propone el corte,
  decide Guido); "el spec no crece durante la obra" queda firme. Cicatriz de la 7 en H §10 (47 worktrees de Hermes en la raíz de `D:`).
- ✅ **La lectura de contraste** ([acta](../tips/tanda-2026-11-contraste.md)): 336 chats de `clientes` (todos, hasta el corte nuevo
  **2026-10-26 14:47 UTC**), 83 lectores Sonnet + 3 síntesis Opus. **Las 49 decisiones con veredicto**: 17 confirmadas · 17 contradichas ·
  14 mixtas · 1 sin evidencia. "Contradicha" casi siempre = línea de base (hoy pasa lo que la decisión viene a cambiar); las ~10 que ponen en
  duda una premisa se reabren (lista en el TODO). **P66-P77** nuevas; 7 lecciones de receta (§4). `recortar.py --modo contraste` listo.

## Próximo paso: la revisión integral del tramo 4

**Título: `vibe-kit M4 · Tramo 4: revisión integral con el acta de contraste`**. Esfuerzo `high`. Con el acta abierta y **sin volver a los
chats**, cuatro cosas concretas: las ~10 decisiones a reabrir, una por una con Guido y en criollo (cierra la D5); **triage de P58-P77 en tres
pilas** (entra ya a un diseño · se construye en la misión 5 · espera al piloto); releer **solo** los 4-5 chats marcados ★ en el acta que toquen
una decisión; **la nota del contrato del registro en E** (lo único que queda de I); y **el apartado de director/obrero** (pedido de Guido):
el canon de D contra lo que **Hermes Desktop cambió en su método mientras diseñábamos** (126 commits desde el 20/10 en `director`, `obrero`,
`tramo`, `cierre`, `smoke`; registro formal `docs/metodo/CAMBIOS.md`, **CM-72 a CM-103** aprobados por el PO el 26/10; Mobile: 0; **se mide de nuevo ese día**, Guido lo sigue cambiando), y **decidir el
flujo proyecto ↔ kit** (¿un proyecto cambia su método entre versiones, con registro, o espera al kit? ¿cómo vuelve lo aprendido?; propuesta en
ADR-025 y TODO). Todo con los 11 criterios; revisor frío al final.

**Después, en orden** (ADR-025): el **spec** (tramo 5; red team, revisor frío, OK de Guido) → **4½ ordenar la casa** (chats de la misión 4 y un
diario de misiones al privado; repo limpio) → **5** construir v3.0 + piloto Deptos → **6** el ciclo escrito → **7** la mensajería (G §18 + sus
insumos del acta: hueco 3/P71, P68, P77, "otras" 5, 8 y 24). **Fuera del kit**: el agente de ecosistema arranca en el repo del Hub.

## Cosas que muerden y no están en ningún otro doc

- 🔑 **Identidad de git**: en `clientes` el mail es el `noreply` de GitHub de `guidocameraeq` (vale; es su cuenta). Nunca `eq.chatgpt`.
- 🗄️ **Lo crudo vive en `D:\vibe-hallazgos\`** (no es repo); su copia, `biblioteca/` del privado `vibe-research` (al día). No se borra nada
  hasta que cierre la misión 5. `D:\vibe-research\` es solo carpeta de trabajo.
- 📬 **El Hub pushea a este repo desde otra sesión**: `git fetch` antes de cerrar (hoy nada nuevo).
- 🧪 **NO VERIFICADO al piloto (Deptos)**: H §22, D, G y los números del tope del spec.
- 🔴 **vibe-kit es PÚBLICO**: gitleaks antes de cada push (hoy limpio). Alias en los diseños. 🔐 **12 alertas abiertas**, las arregla Guido.

## Bloqueos

Ninguno.
