# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**CIERRE PARCIAL** 2026-11-13 del **director del tramo final** (PC `Usuario`): cerraron la sesión 1 (el spec de la `rc.7`
READY), las tandas A y B enteras y la primera sesión de la C (en `main`); sigue la **continuación de la C**.

## Dónde estamos

- **Beta `v3.0.0-rc.6`.** La revisión de la `rc.7` terminó: cinco informes en `docs/kit-v3/REVISION-rc7-*.md` (mirada 1, pruebas,
  mirada 2, los siete repos con el kit, y el plan), integrados al tracker, **"De la prueba real", ítems 17 a 60**.
- **Decidido con Guido el 2026-11-12** (tracker, "Cambios al plan"): **ocho partes a la `rc.7`** (la noche termina sola y publica con
  red; aprobar con un clic y cerrar los agujeros; `/estado` del dueño; el parte sin comandos; un solo camino de fondo y los nombres de
  director y obrero; frenos que no se cuelgan; lo chico; **adoptar sin romper** y preparar la PC que traiga los repos de la cuenta).
  `/tramo` se queda (REJ-017). **No hay más noches de Deptos**: la `rc.7` es la candidata a la `v3.0` y su criterio se mide en una
  noche de prueba dentro de R2, sobre un clon de Deptos.

## Próximo paso

**El director del tramo final** sigue `docs/kit-v3/TRAMO-FINAL-PLAN.md`, sección 0 (**manda ese archivo**). Hecho: el spec
`SPEC-paquete-8d.md` READY (Fable 5.2), las tandas A, B y la C primera sesión. Sigue la continuación de la C (resto de
C4, C5, C6 con la suite, la flota y el tag; arranca en "Para la continuación de la C" del spec) → R2 con la noche de prueba → (`rc.8` solo si R2 la pide) → la `v3.0` y el repo cerrado (el M6b va ahí).
El director **no lanza solo**: cada sesión es una tarjeta que Guido arranca con un clic; después del clic, verificar el modelo con
`get_session` (pedir Fable desde Opus se ignora sin aviso). Si sos una de las sesiones 1 a 6: tu tarea es tu sección; no hace falta `/inicio`.

## Te espera (Guido)

- Arrancar con un clic cada sesión del tramo que el director propone (la próxima: la continuación de la C); opcional, el clic de P7 (`../vibe-kit-pruebas/rc7/p7-firma/LEEME-P7.txt`).
- Lo demás, solo lo de la tabla "Dónde lo necesita a Guido" del plan del tramo final.

## Cosas que muerden y no están en ningún otro doc

- 🔑 **Identidad de git**: `guido.camera.eq@gmail.com`. Nunca `eq.chatgpt`.
- 🔴 **gitleaks antes de cada push, sobre el rango** (`--log-opts="origin/main..HEAD"`), sin tubería: vibe-kit es público.
- 🐍 **Python**: `py -3`; para leer los `.jsonl` de las charlas, `py -3 -I` con `sys.stdout.reconfigure(encoding="utf-8")`.
- 💻 **La terminal de Guido es PowerShell 5.1**: si alguna vez queda una línea para él, en PowerShell y sin `&&` (mejor: ninguna).
- 🧱 **El clasificador del modo `auto` frena escribir el `~/.claude/settings.json`** (preparar-pc, kit-sync sync): eso lo corre Guido.
- 🚪 **No le marques a Guido tareas de sus otros repos** desde acá (su regla, 2026-11-10): lo que se vea allá va al tracker.
- 🧪 **Nunca dos tandas pesadas a la vez** (suite + suite o suite + flota). El tag va siempre después de la suite.
- 📬 El tracker lo escribe solo el director del tramo; las otras sesiones dejan su archivo y él lo integra.
- 🔒 Los repos del trabajo se leen en copias del scratchpad; a vibe-kit (público) va solo el comportamiento del kit, en abstracto.

## Bloqueos

Ninguno. **Falta al cierre completo de esta sesión** (lo hace el `/cierre` de la sesión 6): la entrada del CHANGELOG, el TODO
(la misión 5 dice todavía "la segunda noche de Deptos"), el diario y el chat al privado.
