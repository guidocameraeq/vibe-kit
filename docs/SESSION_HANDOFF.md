# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo
> inyecta en cada chat nuevo de esta carpeta.

**Última sesión cerrada:** 2026-07-23 — **diseño del release v2.0 del Arquitecto: el sistema de
documentación de auditoría FyD (`/docs-fyd`)**. Se investigó el kit, se diseñó de punta a punta,
se escribió el SPEC y se aprobó tras **3 rondas de red-team**. **NO se construyó nada todavía** —
el kit sigue idéntico (diff canónico limpio). Esta sesión solo agregó 3 docs de diseño.

## Estado

- **Proyecto REABIERTO** (venía cerrado en v2.1). Motivo: la auditora **FyD Sistemas** (encargo
  2026-07) pide documentación técnica por repo para el bus-factor ("si Guido desaparece, que un
  equipo externo levante los proyectos"). Deadline ~2 semanas para 2-3 apps críticas.
- **SPEC READY y APROBADO** en `docs/SPEC-docs-fyd.md`: la skill `/docs-fyd` genera 10 artefactos
  de FyD desde el código en una carpeta **aislada** `docs-fyd/`, con los campos de negocio en una
  bóveda read-only; se instala por el Equipador; el Arquitecto la **siembra opt-in** (pregunta
  "¿los dos sistemas o solo el mío?"); el `/cierre` **marca** staleness (no regenera). Todo
  aislado de los docs de trabajo del método (sección NO SE TOCA). Máquina anti-secretos blindada.
- **Decisión registrada:** ADR-014 en `docs/DECISIONS.md`.
- **v2.1 sigue estable** (tag git). El kit NO se tocó esta sesión — diff `kit/` ↔ `~/.claude/`
  limpio en las 3 rutas canónicas.

## Próximo paso concreto (cuando Guido retome)

**Construir el release v2.0 en un chat FRESCO.** El prompt listo está en
`docs/PROMPT-construir-docs-fyd.md` — copiarlo en un chat nuevo de esta carpeta (después de
`/inicio`). Esa sesión lee `docs/SPEC-docs-fyd.md` (el plano) + `docs/referencia-prompts-fyd.md`
(el contrato de contenido: los prompts originales de FyD) y ejecuta el delta sobre `kit/`, cerrando
con el ritual (sync → `diff -r` de las **4 rutas** limpio → commit+push). ADR-014 ya está escrito.

## Bloqueos

Ninguno.

## Contexto que no está en otros docs

- **Fase 2 diferida** (no se construye ahora, diseño conservado al final del SPEC): el inventario
  central `/inventario-fyd` (Excel + Mapa + hub git privado). Mientras tanto **Guido arma el Excel
  a mano desde su tablero Kanban** (que ya es su fuente de verdad de proyectos/servicios/costos);
  las columnas que necesita están en la sección Fase 2 del SPEC y en `referencia-prompts-fyd.md`.
- **Asks operativos de FyD** (fuera del kit, decisión de Guido + Ricardo): dar acceso a
  `marcelo@fydsistemas.com.ar` y `smarcello@fydsistemas.com.ar` como colaboradores
  (GitHub/Vercel/Supabase/tiendas) y cargar en Bitwarden (a nombre de Ricardo) las credenciales
  sin usuario. Las skills JAMÁS ejecutan cambios de acceso.
- El correo de FyD y sus 2 adjuntos (`.docx` de prompts + `.xlsx` de inventario) los tiene Guido;
  el contenido relevante quedó volcado en `docs/referencia-prompts-fyd.md`.
