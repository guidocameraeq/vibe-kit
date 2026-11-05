# PLAN — la prueba de Juan del kit v3

> Los pasos en orden. Cada uno deja su prueba en `pruebas/`. Una casilla se marca cuando la prueba está commiteada.
> `<temp>` es una carpeta temporal fuera de esta (por ejemplo, la de temporales del sistema).
> Cada prueba arranca con la línea `kit: <versión>` (la de `~/.claude/VERSION`). Esta rama no lleva el kit: el kit le llega a la PC
> siempre por `actualizate` (paso 5), así que nunca hay que mezclarla con `main`.

- [x] **0. Lo básico.** (prueba: `pruebas/2026-11-04-pc.md`) `git config user.name` y `user.email` de Juan; anotá en `pruebas/AAAA-MM-DD-pc.md` el sistema, `node --version`,
  `git --version`, `python --version` (o `py -3 --version`), si hay Git Bash, y si está gitleaks (si no, la pregunta de la
  restricción 3). Creá `.local/alias.md` vacío y la PC con su alias (`pc-juan`, o el que diga Juan).

- [x] **1. Preparar la PC con la beta.** (prueba: `pruebas/2026-11-04-preparar-pc.md`; falta que Juan reinicie Claude Code) Clon completo del kit, con tags (nunca `--depth 1`):
  `git clone https://github.com/guidocameraeq/vibe-kit <temp>/vibe-kit`. Leé `<temp>/vibe-kit/kit/skills/arquitecto-skills/SKILL.md`,
  modo INSTALAR, **"Preparame esta máquina"**, y seguilo tal cual (se para solo en el último tag, que hoy es la beta). Prueba
  (`pruebas/AAAA-MM-DD-preparar-pc.md`): el tag en el que se paró, el plan (`--plan`), la pregunta que hizo, la tabla final del
  `doctor`, cuánto tardó y si algo pidió de más. Termina con "reiniciá Claude Code": Juan reinicia, vuelve a abrir esta carpeta y dice
  "arranquemos".

- [x] **2. La suite del kit en esta PC.** (prueba: `pruebas/2026-11-04-suite.md`: 2858/2867 pasan, 8 rojas que pasaron al repetirlas) Es la primera vez que corre fuera de las PCs de Guido: una roja acá puede ser de la PC, y eso
  es justo lo que se busca. Clon completo en `<temp>/vibe-kit-suite`, parado en el tag que imprime
  `node kit/skills/arquitecto-skills/scripts/actualizar.cjs ultimo-tag .`, y desde su raíz `node --test "kit/**/*.test.cjs"`, **en
  segundo plano y sola** (tarda entre 20 y 50 minutos; no corras otra cosa pesada a la vez). Prueba
  (`pruebas/AAAA-MM-DD-suite.md`): el tag, los totales (pasan / fallan / saltean), cada roja con su salida recortada y el tiempo.
  Después borrá el clon.

- [ ] **3. El primer proyecto.** Juan elige uno **que no sea crítico**. Alias en `proyectos.md` (y el nombre real solo en
  `.local/alias.md`). Pedile al Arquitecto (`/arquitecto`): **"adoptá <la carpeta del proyecto>"** (su receta: `flota.md`, "adoptar").
  Trabaja sobre un clon y primero muestra la pantalla de `adoptar --mirar`, que **no escribe nada**. Los textos del kit dicen "Guido":
  acá, Guido es Juan. Prueba (`pruebas/AAAA-MM-DD-<alias>-mirar.md`, con el
  alias en vez de nombres y rutas): la pantalla, las decisiones que muestra (D1 a D4) y qué eligió Juan. Si Juan quiere seguir,
  `--aplicar` con lo elegido; prueba: los commits, si `barreras` dio rojo y por qué, el push, el `--traer`. Si Juan no quiere seguir,
  queda en "mirar" y está bien.

- [ ] **4. Usarlo de verdad.** Juan trabaja en el proyecto adoptado como siempre, con lo que trae el kit (un módulo nuevo con
  `/arquitecto`, `/director`, `/obrero`, `/tramo`). Lo que cuente va a `impresiones.md`; lo que se rompa, con su salida, a `pruebas/`.

- [ ] **5. Cada `rc` nueva.** Cuando Guido avise (o al abrir, si el `ultimo-tag` del kit es más nuevo que `~/.claude/VERSION`): Juan le
  dice **"actualizate"** al Equipador, y para sus proyectos adoptados, **"poné al día <proyecto>"**. Prueba
  (`pruebas/AAAA-MM-DD-rc-N.md`): de qué versión a cuál, el `doctor`, y lo que cambió en cada proyecto.

- [ ] **6. Más proyectos** (cuando Juan quiera): el paso 3 de nuevo, mejor con uno distinto del primero (otro lenguaje, con o sin base
  de datos).

- [ ] **7. Los números** (cuando Guido lo pida): la receta te la manda él. Solo cifras agregadas, con alias.
