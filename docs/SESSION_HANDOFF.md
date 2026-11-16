# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**CIERRE** 2026-11-16 del **director del tramo final** (PC `Usuario`, Opus 5.5): **la `v3.0.0` está publicada** (tag sobre
`cac9620`, con el OK de Guido). Las misiones 5 y 6 quedan cerradas.

## Dónde estamos

- **Kit `v3.0.0`**: el código de la `rc.8` más tres renglones de texto. Probado en copias de los 26 repos de la cuenta (dos bancos y
  R2): la noche termina y publica sola, adoptar no rompe (17 de 18), la flota no deja un repo a medias. Notas en `kit/CHANGELOG.md`.
- **Esta PC** tiene el kit y los hooks de la PC en 3.0.0 (`kit-sync` LIMPIO, `doctor` todo bien). La noche corta de confirmación pasó.
- **Los 20 criterios**: 11 con evidencia y nueve a fase 2 por escrito (tracker, "Los 20 criterios"; el 18 se tilda con el clic de P7).
- **El ciclo de mejora**, entero en `docs/CICLO-DE-MEJORA.md` (ADR-035): cómo sacar una versión en 16 pasos, el banco de prueba fijo,
  las `rc` quirúrgicas, el tramo con director y sesiones en espera. **La vuelta 2 arranca el 2027-03-01.**
- El tramo, paso a paso: `docs/kit-v3/TRAMO-FINAL-PLAN.md` y el tracker; los informes (`REVISION-INTEGRAL-rc7.md`, `BANCO-rc7.md`,
  `BANCO-rc8.md`, `SPEC-paquete-8d.md`, `SPEC-paquete-8e.md`) son actas.

## Próximo paso

1. **Adoptar el kit en este repo** (pedido de Guido, 2026-11-16): `adoptar . --kit . --mirar` ya corrió (la propuesta, fuera del
   repo). Antes de `--aplicar`, decidir con Guido: el `/inicio` y el `/cierre` de la madre (tienen el `kit-sync`, el diario, las actas)
   ¿quedan propios o los reemplaza el del kit?; el `comando-test` (la suite entera tarda ~90 min); los 4 docs que nacerían (`MAPA`,
   `NORTE`, `referencia/PRUEBA`…) frente al mapa de `CLAUDE.md`. Título de la sesión: `vibe-kit · Adoptar el kit en la madre`.
2. **La flota real con la `v3.0.0`, repo por repo con el OK de Guido** (en el TODO, con lo que cambia en cada uno).
3. La `v3.1` (misión 7: el buzón, "probar una idea nueva", el PO) con su charla de diseño.

## Te espera (Guido)

- Decidir lo de la adopción de este repo (arriba) y el OK por repo de la flota.
- El clic de P7 cuando quiera (`../vibe-kit-pruebas/rc7/p7-firma/LEEME-P7.txt`): tilda el criterio 18.
- En la otra PC (`clientes`): "actualizá el kit" e "instalar hooks por PC" (los de esta ya están).

## Cosas que muerden y no están en ningún otro doc

- 🔑 **Identidad de git**: `guido.camera.eq@gmail.com`. Nunca `eq.chatgpt`.
- 🔴 **gitleaks antes de cada push, sobre el rango** (`--log-opts="origin/main..HEAD"`), sin tubería: vibe-kit es público.
- 🐍 **Python**: `py -3`; para leer los `.jsonl` de las charlas, `py -3 -I` con `sys.stdout.reconfigure(encoding="utf-8")`.
- 💻 **La terminal de Guido es PowerShell 5.1**: si queda una línea para él, en PowerShell y sin `&&` (mejor: ninguna).
- 🧱 **El clasificador del modo `auto`** frena a veces escribir `~/.claude/settings.json` y abrir sesiones nuevas desde un director;
  "instalar hooks por PC" esta vez pasó con el OK de Guido en el chat.
- 🤖 **`start_session` con un modelo más caro que el del que lanza se ignora sin aviso**: verificar con `get_session` y corregir con
  `set_session_model` (Guido puede rechazarlo; entonces se deja).
- 🧪 **Nunca dos tandas pesadas a la vez**. La suite entera tarda ~90 min con la PC cargada.
- ⚙️ `core.hooksPath` de esta carpeta apunta a `.githooks`, que no existe (lo puso una sesión del kit): no frena nada; la adopción lo
  resuelve.
- 🚪 **No le marques a Guido tareas de sus otros repos** desde acá (su regla, 2026-11-10): lo que se vea allá va al tracker.
- 🔒 Los repos del trabajo se leen en copias del scratchpad; a vibe-kit (público) va solo el comportamiento del kit, en abstracto.

## Bloqueos

Ninguno.
