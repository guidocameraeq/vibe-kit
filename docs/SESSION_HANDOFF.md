# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**CIERRE PARCIAL** 2026-11-11 de la sesión madre de la PC `Usuario` (preparar la PC, adoptar Deptos, leer sus dos noches, el tracker
17-37). Sigue viva solo para **lanzar** las cuatro sesiones de la revisión de la `rc.7`; no las orquesta ni lee sus informes.

## Dónde estamos

- **Beta `v3.0.0-rc.6`.** Deptos adoptado en la rc.6 (2026-11-09) y con **dos noches de director**: `pulido` (lista fija, 19 encargos,
  0 intervenciones) y `cola` (24 encargos; el cierre de noche falló por el aislamiento del worktree). Todo lo medido está en el tracker,
  **"De la prueba real", ítems 17 a 37**, con "Lo abierto, de un vistazo" al día.
- **Cambio de plan (2026-11-10, Guido)**: la v3.0 ya no espera al primer módulo de Hermes; la prueba real es Deptos más lo que mostró
  Hermes. Camino: la revisión → la charla → el plano de la `rc.7` → una tercera noche en Deptos → M6b → R2 contra un clon de Deptos →
  `v3.0`. La cola y el cierre de noche grandes, a la v3.1 (el 17 bajó: fue el planteo con el Arquitecto).
- **El objetivo de la `rc.7`** (Guido): reducir fricciones y que fluya: *Guido no tipea nada y una noche termina sola*.

## Próximo paso

**La revisión de la `rc.7`, en cuatro sesiones**, con sus prompts en `docs/kit-v3/REVISION-rc7-PLAN.md` (manda ese archivo):
1. Mirada 1, la fricción (Fable 5.2) ∥ 2. las tres pruebas (Opus) → 3. mirada 2, el sistema (Fable 5.2) → 4. la madre nueva (Opus):
   el tracker, la charla con Guido y el plano. Cada una escribe solo su archivo `docs/kit-v3/REVISION-rc7-*.md`.
Si sos una de esas sesiones: tu tarea es tu sección de ese archivo, con el OK de Guido ya dado; no hace falta `/inicio`.

## Te espera (Guido)

- La charla de la sesión 4, cuando estén los tres informes.
- 🔴 El analytics: su `comando-test` usa la Supabase real (tracker, "De la prueba real", 14).

## Cosas que muerden y no están en ningún otro doc

- 🔑 **Identidad de git**: `guido.camera.eq@gmail.com`. Nunca `eq.chatgpt`.
- 🔴 **gitleaks antes de cada push, sobre el rango** (`--log-opts="origin/main..HEAD"`), sin tubería: vibe-kit es público.
- 🐍 **Python**: `py -3`; para leer los `.jsonl` de las charlas, `py -3 -I` con `sys.stdout.reconfigure(encoding="utf-8")`.
- 💻 **La terminal de Guido es PowerShell 5.1**: si alguna vez queda una línea para él, en PowerShell y sin `&&` (mejor: ninguna, ítem 33).
- 🧱 **El clasificador del modo `auto` frena escribir el `~/.claude/settings.json`** (preparar-pc, kit-sync sync): eso lo corre Guido.
- 🚪 **No le marques a Guido tareas de sus otros repos** desde acá (su regla, 2026-11-10): lo que se vea allá va al tracker.
- 🧪 **Nunca dos tandas pesadas a la vez** (suite + suite o suite + flota). El tag va siempre después de la suite.
- 📬 El tracker lo escribe solo la madre; las otras sesiones dejan su archivo y la madre lo integra.

## Bloqueos

Ninguno.
