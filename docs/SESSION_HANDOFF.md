# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**Última sesión cerrada:** 2026-11-02, **preparar la PC `Draco-PC`** para D5.2 (Opus, con Guido, sin trabajo de misión). La última de
misión sigue siendo **D5.1** (2026-10-31, PC `Usuario`): **el paquete 5 va por la mitad**, sigue D5.2. `kit-sync` LIMPIO.

## Dónde estamos

- **Paquetes 1 a 4 ✅; el 5 🔨.** D5.1 hizo "el día" del canon director/obrero: núcleo, `/director`, `/obrero`, el revisor, `encargo.cjs`
  (`presentar` con el corrector "spec sin sello", `mensaje`, `autorizado`, `verificar`) y `worktree integrar`. Delta sellado sin Guido.
- **Hallazgo de D5.1**: Claude Code **ignora las `deny` con `Write(...)`** (solo mira `Edit(...)`); las del molde no frenan nada. Hoy
  las cubren los hooks. Es lo primero de D5.2.
- **`Draco-PC` (2026-11-02) quedó lista**: kit instalado por `kit-sync sync` (carpeta de proyectos `C:\Users\guido\Desktop\(1) Claude`),
  identidad de git global, repos de prueba por `rehacer.sh` (LISTO), y por winget gitleaks 8.30.1, gh, VS Code y la extensión de Claude Code
  (`encargo.cjs` encuentra su `claude.exe`). Los hooks por PC **no** se instalaron (igual que en `Usuario`: es de Guido).
- Hoja de ruta ADR-025: 5 construir v3.0 (1-4 ✅, el 5 a la mitad) → 6 el ciclo → 7 mensajería v3.1.

## Próximo paso

**D5.2**, en Opus, sin Guido, **en `Draco-PC`**: **`vibe-kit M5 · D5.2 · Paquete 5, segunda mitad: la noche, /estado, el resumen y la mesa`**.
Antes, Guido: (1) **inicia sesión en Claude dentro de VS Code** (el `claude.exe` de la extensión hoy da "Not logged in": sin eso no hay
obreros reales) y (2) **reinicia la app de Claude** (la sesión que instaló no ve gitleaks ni gh en el PATH). Después pega el prompt de "Abrir
D5.2 sin Guido (el prompt)" del tracker (`docs/kit-v3/PLAN-construccion.md`) y se va. Primero "Paquete 5 · para D5.2" de Pendientes (las
`deny` con `Write`). Si no entra, la mesa y el corrector de afirmaciones a un D5.3.

**Para Guido, cuando pueda (no traba a D5.2)**, con el detalle en Pendientes del tracker ("Paquete 5 · te espera a vos", y los del 3 y el 4):
- la pestaña real del obrero en VS Code: cero pop-ups para git, `encargo.cjs` y el test (fila 3 del delta);
- repasar las ⚠️ de D5.1: nadie en bypass (D5-2), tu pestaña en tu modo (D5-19), `integrar` sin `/cierre` (D5-3);
- lo de antes: el Arquitecto en un proyecto v2, la pestaña en un worktree, los hooks por PC (ahora en tres PCs), borrar los 4 transcripts de D3.3.

## Cosas que muerden y no están en ningún otro doc

- 🔒 **El clasificador del modo `auto` frena lanzar `claude.exe -p` en bypass**; con `acceptEdits` + `--allowedTools` pasa (D5.1 lo usa como
  canon). También frena `kit-sync sync` a mitad de sesión: va como primer paso del `/cierre`.
- 🧪 **Sesiones reales**: la línea de fondo de `encargo.cjs autorizado` ya trae todo (el pedido por stdin con `printf`, el `claude.exe` de la
  extensión de VS Code, que no está en el PATH). Desde Git Bash, nunca `-p "/algo"` por argumento (MSYS lo vuelve ruta) ni `MSYS_NO_PATHCONV`.
  Leé el log entero de la corrida: los avisos de la plataforma están arriba. Con un `HOME` falso da "Not logged in".
- 🧪 **La suite entera tarda ~20-30 min**: siempre en segundo plano, una vez, al final. `node --test "kit/**/*.test.cjs"`.
- ⏱️ **Los encargos se cuelgan o terminan con trabajo de fondo vivo**: se retoman con `SendMessage`, o `TaskStop` si ya entregaron.
- 🗂️ **Cada encargo, su worktree en `scratchpad/<x>/wt`**; los clones no traen `core.hooksPath` (ponerlo a mano). Los repos de prueba se miran
  con Bash, nunca con Read; para una corrida, un clon con copia propia del remoto (`remotos/alfa.git`).
- 💻 **En `Draco-PC`**: `python` es el atajo de la Store; el de verdad es `~/AppData/Local/Programs/Python/Python313/python.exe`. El repo
  privado se clona con `-c core.longpaths=true` (si no, falla el checkout). gitleaks vive en `~/AppData/Local/Microsoft/WinGet/Links/`.
- 🔑 **Identidad de git**: `guido.camera.eq@gmail.com`. Nunca `eq.chatgpt`.
- 📬 **El Hub pushea a este repo desde otra sesión**: `git fetch` antes de cerrar. 🔴 **vibe-kit es PÚBLICO**: gitleaks antes de cada push.

## Bloqueos

Para D5.2 en `Draco-PC`: el login de Claude en VS Code y reiniciar la app (Guido, cinco minutos).
