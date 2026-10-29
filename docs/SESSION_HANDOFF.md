# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**Última sesión cerrada:** 2026-10-29, **misión 5, D2.2: paquete 2 ✅, hecho sin Guido** con su autorización previa. PC `clientes`, Opus.
`kit-sync` LIMPIO. Detalle: CHANGELOG del 2026-10-29 (D2.2), la fila D2.2 del tracker y su lista "Decisiones sin Guido".

## Dónde estamos

- **Paquete 2 cerrado** (D2.1 + D2.2): zona propia, `cambios` con `aprobar` y su sello, `niega-aprobar.cjs`, el candado (`estructura.cjs`,
  nueve chequeos), `agents.cjs`, `/inicio` y `/cierre` del molde, fichas de fábrica, `pedidos.md`, `rehacer.sh` con `molde v3 orden 2b`.
  Red team (rondas 4-5) y revisor frío (tres vueltas, 6 ALTOS) integrados. Kit: 14 de 57 piezas.
- Hoja de ruta ADR-025: 4 ✅ → 4½ ✅ → **5 construir v3.0** (paquetes 1 y 2 ✅) → 6 el ciclo → 7 mensajería v3.1.

## Próximo paso

**D3.1, sola, sin Guido**, en Opus: **`vibe-kit M5 · D3.1 · Paquete 3: seguridad — corrector, barreras, hooks por PC, doctor mínimo`**.
Guido abre el chat con el prompt de la sección "Abrir D3.1 sin Guido" del tracker (empieza con `inicio — misión 5, D3.1`) y se va:
**después del `/inicio` no espera OK**. Como D2.2: decide con la recomendada y lo anota en "Decisiones sin Guido" de su fila, no corta por
contexto, commitea después de cada encargo y cierra con `/cierre`. **Distinto de D2.2**: el delta lo sella el director (provisorio, tras el
red team sin ALTOS) y **nada toca el `~/.claude/` real de la PC** (hooks por PC y `doctor` con un `HOME` falso; instalarlos es de Guido).
Lo de "Paquete 3 · de D2.2" del tracker entra en su lista.

**Para Guido, más adelante (no traba a D3.1)**: repasar las ⚠️ de D2.2, contestar la pregunta del bypass en el checkout principal, y las
cuatro pruebas en una pestaña real de `alfa` ("Pendientes" → "Paquete 2 · te espera a vos").

## Cosas que muerden y no están en ningún otro doc

- 📉 **El plan semanal estaba al 83% el 2026-10-29 (renueva el 1-11)**: D2.2 gastó mucho en subagentes (el candado y sus arreglos: horas
  de mutación). D3.1 conviene después del 1-11.
- 🧪 **`claude -p` desde Git Bash con un prompt que empieza con `/`**: MSYS lo convierte en ruta (`C:/Program Files/Git/inicio`). Usar
  `MSYS_NO_PATHCONV=1`. Y en `-p` un clon que no es de confianza **ignora el `permissions.allow`** del proyecto.
- 🧪 **Los repos de prueba se miran con Bash, nunca con Read**: leer un archivo suyo mete su `CLAUDE.md` en la sesión.
- 🧪 **La suite**: `node --test "kit/**/*.test.cjs"`; con D2.2 tarda **~15-20 min** (las pruebas de `barreras` arman muchos repos).
  La mutación por encargo, horas: correr los mutantes sobre copias del molde, nunca sobre `kit/molde`.
- 🧪 **Un obrero en worktree nace de un commit viejo**: el brief le pide `git merge --ff-only main` primero.
- 🔑 **Identidad de git**: en `clientes` el mail es el `noreply` de `guidocameraeq` (vale). Nunca `eq.chatgpt`. Los repos de prueba
  commitean como `kit-pruebas`.
- 🗄️ **El privado `vibe-research`**: clon en el scratchpad con `core.longpaths`, `sparse-checkout` y `MSYS_NO_PATHCONV=1`. Los informes del
  red team y del revisor frío del paquete 2: `mision-5/redteam-paquete-2/`.
- 🗄️ **`D:\vibe-research\clientes\redteam-kit-v3\`** sigue en disco: nada se borra hasta cerrar la 5.
- 📬 **El Hub pushea a este repo desde otra sesión**: `git fetch` antes de cerrar.
- 🔴 **vibe-kit es PÚBLICO**: gitleaks antes de cada push. 🔐 **12 alertas abiertas**, las arregla Guido.
- 🧪 **Antes del piloto, trabajo de Guido** (spec, "Lo que hacés vos de nuevo"): credenciales de escritura al almacén en 2 PCs, usuario de
  solo lectura por base real, "preparame esta PC" en la del compañero.

## Bloqueos

Ninguno para D3.1. La pregunta ⚠️ de D2.2 no traba nada: lo decidido se deshace antes del tag.
