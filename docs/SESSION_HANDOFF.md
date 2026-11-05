# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**CIERRE PARCIAL** 2026-11-05 ~14:45 de **la sesión madre de la recta final** (`vibe-kit M5 · Recta final: de la prueba en Hermes a la
v3.0`, sigue viva). Orquesta la prueba real. Lo detallado está en el tracker (`docs/kit-v3/PLAN-construccion.md`).

## Dónde estamos

- **Beta `v3.0.0-rc.6` taggeada** (`3d206d6`, 2026-11-05). La rc.4 (exprés: `carpeta-docs:`, `.pyc`), la rc.5 (una ventana, `--con-obra`,
  u9) y la rc.6 (cierre de tramo, h11, la vuelta 2, el lock atrasado), las tres verificadas por la madre en origin. Sus sesiones están
  archivadas y los chats, en vibe-research.
- **5 repos en la rc.6**: Hermes.exe, Hermes Mobile (D1 A con anexos), analytics, bot y Hub. La PC también; doctor 0 ✗. La sesión
  `Preparar PC` (`local_16646404…`) sigue viva. Hermes usa una sola ventana con el director en el worktree (visto en uso real).
- **Juan** (`prueba/juan` @ `3662205`): tiene que pasar su PC a la rc.6 y correr de nuevo el doctor y la suite antes de adoptar. Cada
  prueba suya dice su versión.
- **Ciclo §3.6**: los niveles de control de las `rc` (liviano · medio · medio-alto · completo). La rc.6 salió en medio-alto, y la suite corrió
  en paralelo con el chequeo frío.
- **Tracker limpio**: "Lo abierto, de un vistazo" arriba de Pendientes; 27 resueltos en una línea.

## Te espera (Guido)

- 🔴 **El analytics**: su `comando-test` usa la Supabase real (`test.js` viejo + `DATABASE_URL`). Hay que sacarlo de la ficha o
  reescribir el test contra una base de prueba antes de que lo corra un gate o la flota (tracker, "De la prueba real", 14).
- Decidir para la próxima: `ssh` adentro de `sensible` (12); si un subagente cortado se retoma (Mobile, regla 4).
- Mobile: `flutter pub get`, el NORTE, `COMPACTION_PROTOCOL.md` en su `CLAUDE.md`. Bot y Hub: el NORTE. Hermes y Mobile: `allow_abbrev=False`.

## Próximo paso

Seguir en ESTA sesión si sigue viva; si no, una nueva con el título `vibe-kit M5 · Recta final (2): de la rc.6 a la v3.0`.
1. Acompañar el uso: lo que se rompe va al tracker ("De la prueba real"); los arreglos se juntan para una `rc.7`, con el nivel de §3.6.
   El próximo hook decidido por Guido: después de compactar (regla 2 de Mobile).
2. Al cerrar el primer módulo de Hermes (cashflow): impresiones y números → la 6b (con los chats ya en vibe-research) → R2 contra un
   clon de Hermes → la `v3.0` (el tag igual al último rc, y publicar solo con el OK de Guido).
3. Al final: los chats que falten a vibe-research (esta madre `aa0d1ed2` y el Preparar PC `8a1f81ee`), el diario y `/cierre` completo.

## Cosas que muerden y no están en ningún otro doc

- 🔐 **En `Guido-PC-eQ` el push va por `gh`**: `GIT_TERMINAL_PROMPT=0 git -c credential.helper= -c 'credential.helper=!gh auth git-credential' push …`.
- 🔑 **Identidad de git**: `guido.camera.eq@gmail.com`. Nunca `eq.chatgpt`.
- 🔴 **gitleaks antes de cada push, sobre el rango** (`--log-opts="origin/main..HEAD"`), sin pipe.
- 🐍 **Python**: `py -3`. En el Bash de esta app los heredocs pierden barras invertidas: escribir con Write/Edit.
- 🧪 **Nunca dos tandas pesadas a la vez** (suite + suite o suite + flota). El tag va siempre después de la suite: en las tres `rc` encontró rojas reales.
- 📬 El tracker lo escribe solo la madre: las otras sesiones le mandan sus hallazgos por mensaje. Las notas compartidas de las sesiones
  están en `AppData\Roaming\Claude\side-session-notes\`, no en el temp.

## Bloqueos

Ninguno.
