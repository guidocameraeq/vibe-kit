# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**CIERRE** 2026-11-16 del **director del tramo final** (PC `Usuario`, Opus 5.5): **la `v3.0.0` está publicada** (tag sobre
`cac9620`, con el OK de Guido) y el mismo día el **hotfix `v3.0.1`** (un arranque propio no se pisa). Misiones 5 y 6 cerradas.

## Dónde estamos

- **Kit `v3.0.0`**: el código de la `rc.8` más tres renglones de texto. Probado en copias de los 26 repos de la cuenta (dos bancos y
  R2): la noche termina y publica sola, adoptar no rompe (17 de 18), la flota no deja un repo a medias. Notas en `kit/CHANGELOG.md`.
- **Esta PC** tiene el kit en 3.0.1 (`kit-sync` LIMPIO) y los hooks de la PC en 3.0.0 (no cambiaron; solo el número da un aviso).
- **Los 20 criterios**: 11 con evidencia y nueve a fase 2 por escrito (tracker, "Los 20 criterios"; el 18 se tilda con el clic de P7).
- **El ciclo de mejora**, entero en `docs/CICLO-DE-MEJORA.md` (ADR-035): cómo sacar una versión en 16 pasos, el banco de prueba fijo,
  las `rc` quirúrgicas, el tramo con director y sesiones en espera. **La vuelta 2 arranca el 2027-03-01.**
- El tramo, paso a paso: `docs/kit-v3/TRAMO-FINAL-PLAN.md` y el tracker; los informes (`REVISION-INTEGRAL-rc7.md`, `BANCO-rc7.md`,
  `BANCO-rc8.md`, `SPEC-paquete-8d.md`, `SPEC-paquete-8e.md`) son actas.

## Próximo paso

1. **El kit ya está adoptado en este repo** (2026-11-16, con Guido): ficha `.claude/kit.md` (nivel estandar), los frenos (portero,
   escritura, `git-seguro` sin `push-otra-rama`: las sesiones suben a `main`), director/obrero/`/estado`; el arranque, `/inicio`
   y `/cierre` siguen siendo los de la madre; sin `comando-test` (la suite tarda ~90 min, con su razón); candado apagado; sin los docs
   del molde. Con la `v3.0.1`, `--verificar` da ⚠ en el arranque (el propio anda) y "el repo quedó andando". `candado:raiz` quitado
   (la madre tiene su propio mapa de `docs/`). El log por tanda: `docs/kit-v3/TANDAS-DE-VERSIONES.md` (se suma una sección por tanda).
2. **La flota real con la `v3.0.1`, repo por repo con el OK de Guido** (en el TODO, con lo que cambia en cada uno).
3. La `v3.1` (misión 7: el buzón, "probar una idea nueva", el PO) con su charla de diseño.

## Te espera (Guido)

- El OK por repo de la flota real.
- El clic de P7 cuando quiera (`../vibe-kit-pruebas/rc7/p7-firma/LEEME-P7.txt`): tilda el criterio 18.
- En la otra PC (`clientes`): "actualizá el kit" e "instalar hooks por PC". En esta, "instalar hooks por PC" cuando quiera: solo
  sube el número a 3.0.1 y saca el aviso.

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
- ⚙️ Los githooks del kit (`.githooks`) corren en cada commit y push de acá: con el candado apagado, solo las barreras.
- 🗂️ La prueba de Juan quedó guardada en el tag `archivo/prueba-juan-2026-11-06`; la rama `prueba/juan` sigue, por si él vuelve a subir.
- 🚪 **No le marques a Guido tareas de sus otros repos** desde acá (su regla, 2026-11-10): lo que se vea allá va al tracker.
- 🔒 Los repos del trabajo se leen en copias del scratchpad; a vibe-kit (público) va solo el comportamiento del kit, en abstracto.

## Bloqueos

Ninguno.
