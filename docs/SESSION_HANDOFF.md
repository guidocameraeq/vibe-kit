# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo
> inyecta en cada chat nuevo de esta carpeta.

**Última sesión cerrada:** 2026-07-23 — **CONSTRUIDO el release v2.0 del Arquitecto: el sistema de
documentación de auditoría FyD (`/docs-fyd`)**. Se ejecutó el SPEC (que estaba READY) como delta sobre
`kit/`, se verificó adversarialmente **16/16** y se sincronizó a `~/.claude/` con el diff canónico de
las **4 rutas limpio**. La skill ya está registrada y activa.

## Estado

- **`/docs-fyd` construida y en régimen.** La skill nueva `kit/skills/docs-fyd/` (16 archivos):
  `SKILL.md` (motor: 2 modos `docs-fyd`/`auditar`, 6 reglas de oro, write-set cerrado `docs-fyd/**`
  + README raíz, máquina anti-secretos que frena antes de escribir, trato especial de #9 no-verbatim
  y #10 solo-categoría+cantidad), `deteccion.md` (tabla stack-agnóstica), `prompts-fyd.md` (los 10
  prompts de FyD verbatim + las 4 desviaciones del método), y `plantillas/` (13 esqueletos: los 10
  artefactos + bóveda `_CAMPOS-NEGOCIO.md` + `ESTADO.md` + `LEEME.md`).
- **Los 7 enganches puestos:** paso 6 de frescura en el `/cierre-plantilla` (gateado por existe
  `docs-fyd/`, NO corre en `cierre parcial`); fila Tier 1 kit-owned en `menu-skills.md`; copiar-si-está
  en `INSTALAR.md`; caso kit-owned en el Equipador (copia local, diff antes de pisar, acotado); siembra
  CON PREGUNTA en el Paso 5 del Arquitecto + aviso en el Paso 6; y el diff canónico del repo madre
  **3→4 rutas** (cierre e inicio, +`kit/skills/docs-fyd`).
- **Verificación:** workflow adversarial de 16 verificadores (14 criterios de aceptación + anti-secretos
  profundo + consistencia de nombres) → **16/16 PASS, cero problemas**. Grep confirmó cero valores de
  credencial en las plantillas; `git status` confirmó que el hook `session-start.sh` y el
  `CLAUDE.template.md` NO se tocaron (siguen en NO SE TOCA).
- **ADR-014 ya estaba escrito** (del diseño); no se creó ADR nuevo — no apareció ninguna decisión fuera
  del SPEC. Las únicas elecciones de implementación (nombres de archivo según la lista AGREGA del SPEC;
  placeholders estilo `[...]` en vez de `{{...}}` para no chocar con el chequeo "cero `{{`" del
  Arquitecto) son ejecución del plano, no decisiones nuevas.
- **v2.1 sigue estable** (tag git). El diff `kit/` ↔ `~/.claude/` de las 4 rutas quedó **limpio** al cerrar.

## Próximo paso concreto (cuando Guido retome)

**Estrenar `/docs-fyd` en un repo destino real.** Abrí un chat de Claude Code EN la carpeta de una de
las 2-3 apps críticas para FyD y corré `/docs-fyd` → completá a mano los 4 campos de negocio en
`docs-fyd/_CAMPOS-NEGOCIO.md` → corré `docs-fyd auditar` (te dice qué quedó viejo y si hay secretos) →
commit. Si `/docs-fyd` no está instalada en esa PC, corré antes `/arquitecto-skills` (Modo INSTALAR) y
elegí `docs-fyd` del menú (se copia del kit local, no se clona).

## Bloqueos

Ninguno.

## Contexto que no está en otros docs

- **El zip portable NO se regeneró** esta sesión: esta PC no tiene la carpeta
  `Desktop\Arquitecto en otras PCs\` (el paso es condicional; se saltea sin drama). Si hace falta
  llevar el kit a otra PC por zip, regenerarlo desde `kit/` en la PC que sí tenga esa carpeta.
- **Fase 2 sigue diferida** (no se construyó): el inventario central `/inventario-fyd` (Excel + Mapa +
  hub git privado). Mientras tanto Guido arma el Excel a mano desde su tablero Kanban; las columnas
  están en la sección Fase 2 del SPEC y en `referencia-prompts-fyd.md`.
- **Asks operativos de FyD** (fuera del kit, decisión de Guido + Ricardo): dar acceso a
  `marcelo@fydsistemas.com.ar` y `smarcello@fydsistemas.com.ar` como colaboradores y cargar en
  Bitwarden (a nombre de Ricardo) las credenciales sin usuario. Las skills JAMÁS ejecutan cambios de acceso.
- Los artefactos de diseño (`docs/SPEC-docs-fyd.md`, `docs/PROMPT-construir-docs-fyd.md`,
  `docs/referencia-prompts-fyd.md`) quedan como está — actas del diseño; el SPEC está implementado.
