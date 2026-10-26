# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope**: con el TODO y git, lo inyectado tiene que quedar bajo 10.000 caracteres.

**Última sesión cerrada:** 2026-10-26, misión 4, tramo 4: **revisión integral con el acta de contraste, sesión 1 de 2** ✅. Las 10
decisiones reabiertas cerradas con Guido en 4 charlas, triage de P58-P77, 4 chats ★ releídos por Sonnet, y **las correcciones escritas en
los 7 `DISENO-*`** (cada uno cierra con su tabla "Revisión integral"). Solo diseño, kit `v2.4.2`. PC `clientes`. `kit-sync` LIMPIO.

## Dónde estamos

- **Misión 4**, tramo 4: ✅ A · C · E · F · B · D · G · H · **revisión integral (sesión 1)**. I salió del kit (ADR-024); hoja de ruta ADR-025
  (4 sin mensajería → 4½ → 5 v3.0 → 6 el ciclo → 7 mensajería v3.1). [`PLAN.md`](mision-4/PLAN.md) §4 tiene el resumen de la sesión 1.
- **Lo decidido hoy** (detalle y evidencia en la sección "Revisión integral" de cada diseño y en el CHANGELOG): A-1 merge y producción
  pre-autorizados por proyecto, no pregunta · F-1 capa del clasificador: AUTORIZADO como `allow` estrechas, hook solo `deny`, noche nunca
  `auto` · H-6 desvíos contados por script, **nunca frenan al obrero** · D-5 sin número fijo, duro ~80% · D-8 tope 2 + paquete por script +
  afirmaciones a un corrector · **E-1 "el Arquitecto viene a vos"** (la sesión lo invoca sola, Modo B corto, candado con sello) · H-5 entorno =
  base + herramientas · **E-4 en tres clases** (diseño charlando · rutinario sin pregunta · botón "explicámelo en criollo") · B-6/B-7 edad del
  estado por git + `candado:estado-viejo` · D-10 `/estado` con % medido, "podés cerrar", esperas y uso (solo información).
- **Triage P58-P77**: 16 entraron ya a los diseños (marcadas `[x]` en las actas con su puntero), 3 a la misión 5 (P70 `turno`, P72 `/release`,
  P19 `mutar.py`), 1 al piloto (el hook de `resume` de P62). Refuerzos aplicados: F §12 "sin config" mecánica; `taskkill` por nombre al hook.
- **Verificado hoy**: doc oficial del modo `auto` (`allow` estrecha gana al clasificador; ignora el `autoMode` del proyecto; 3 negaciones lo
  apagan; hook `allow` NO DOCUMENTADO) y **en la app de escritorio una sesión lee el uso del plan y el contexto propio y ajeno** (`get_usage`);
  CLI y VS Code siguen NO VERIFICADO.
- **Hermes medido hoy** (para la sesión 2): repo real `D:\Hermes\Hermes.exe` (49 worktrees), **38 commits** de método desde el 2026-10-20
  (director 9 · obrero 4 · tramo 6 · cierre 1 · smoke 1), `CAMBIOS.md` 230 KB, CM-103 aprobado sin aplicar (273e1d8).

## Próximo paso: la revisión integral, sesión 2

**Título: `vibe-kit M4 · Tramo 4: revisión integral, sesión 2 (director/obrero y revisor frío)`**. Esfuerzo `high`. En orden:
1. **El apartado director/obrero** (pedido de Guido): medir Hermes de nuevo (`git log --since=2026-10-20 -- .claude/skills docs/metodo` en
   `D:\Hermes\Hermes.exe`) y leer `docs/metodo/CAMBIOS.md` entero (CM-72 a CM-103 + lo aprobado sin aplicar); cruzar cada CM contra las 11
   decisiones de D (coincide · contradice · nuevo) con el filtro "un solo proyecto no alcanza salvo cicatriz o 3+"; traerle a Guido la tabla.
2. **El flujo proyecto ↔ kit**: opciones con pros y contras; recomendación la del ADR-025 (el registro de cambios de método por proyecto es
   pieza del canon, el ciclo lo lee, 3+ sube al kit). Termina en ADR nuevo + sección en D. E §14 ya apunta acá el caso de E-3.
3. **La nota del contrato del registro en E §9** (lo único que quedó de I; un párrafo).
4. **Revisor frío** (subagente, Opus, `high`) sobre los 7 diseños corregidos contra los 11 criterios: contradicciones entre racimos y con las
   notas nuevas. Cada hallazgo pasa primero por el criterio de diseño ya establecido (regla de Guido) antes de aplicarse.
5. **La charla final con Guido sobre cómo queda el método director/obrero de punta a punta** (pedido suyo: "es el 80% de cómo trabajo; que
   lo entienda muy bien y esté seguro de que queda como yo quiero"). En criollo, con un pedido de ejemplo recorrido entero. Es lo último
   antes del spec.
Después: el **spec** (tramo 5) → 4½ → 5 → 6 → 7 (ADR-025).

## Cosas que muerden y no están en ningún otro doc

- 🔑 **Identidad de git**: en `clientes` el mail es el `noreply` de GitHub de `guidocameraeq` (vale). Nunca `eq.chatgpt`.
- 🗄️ **Lo crudo vive en `D:\vibe-hallazgos\`** (no es repo); copia en `biblioteca/` del privado `vibe-research`. No se borra nada hasta que
  cierre la misión 5. Los chats ★ del acta están ahí (`clientes/condensados/` y `contraste-2026-11/condensados-nuevos-desde-corte/`).
- 📬 **El Hub pushea a este repo desde otra sesión**: `git fetch` antes de cerrar (hoy nada nuevo).
- 🧪 **NO VERIFICADO al piloto (Deptos)**: H §22, D §20, G, los topes de desvíos y del spec, el tiempo del Modo B corto, `settings.local.json`
  por script en VS Code, el hook de `resume`.
- 🔴 **vibe-kit es PÚBLICO**: gitleaks antes de cada push (hoy limpio). Alias en los diseños. 🔐 **12 alertas abiertas**, las arregla Guido.

## Bloqueos

Ninguno.
