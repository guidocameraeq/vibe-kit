# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**CIERRE PARCIAL** 2026-11-04 ~16:40 de **la sesión madre de la recta final** (`vibe-kit M5 · Recta final: de la prueba en Hermes a la
v3.0`, sigue viva: Guido se fue de la oficina y retoma desde su casa). Orquesta la prueba real. `kit-sync` LIMPIO al abrir.

## Dónde estamos

- **Prueba real en marcha** con la `rc.3`: Hermes y Arti-bot-analytics adoptados (D1 A, D2/D3 recomendadas, D4 datos-reales). Hermes
  tiene `lector` (ready ✅) y `cashflow` con director (spec en BORRADOR). Cuenta Corriente salió (`v2026-11-04-01`). Juan prueba en la
  rama huérfana `prueba/juan` (pasos 0-2 hechos: suite 2858/2867, 8 rojas de carga).
- **D8r.3 = la `rc.4` exprés** (`local_819cdb4d…`): `carpeta-docs:` en la ficha, el hook de arranque con el mismo nombre, `barreras` borra
  el caché de Python, el texto de `adoptar`. Código en `main`, la suite dio 2957/2961 (3 de carga, 1 real arreglado). **Tag ~16:45**
  después de su flota. Con él, Guido adopta el bot (Arti-bot-eq).
- **D8r.4 = la `rc.5`** (`local_c71f12a5…`): la vuelta 1 junta en su rama del scratchpad (`d8r4/t`, 287/287): una sola ventana (el
  obrero nace en main, el director le da el worktree, EnterWorktree, verifica rama y rol; `donde`, `traer-main`, el deny del `.env` en el
  `settings.local.json` del principal), la flota `--con-obra`, u9 (el candado y gitleaks de los merges contra el otro padre), el tope de
  las skills que avisa por la zona propia, `.gitleaksignore`, `!.claude/frenos.log`. **No escribe en D:\vibe-kit hasta el tag de la
  rc.4**; después, ~3 h: merge, chequeo frío (clones de Hermes, analytics y bot), suite, flota, tag. **La vuelta 2 (u4-u8, u13, h5-h11) va
  a la rc.6** con D8c.1 (el obrero de cierre de tramo).
- **Commits locales míos sin push** (docs: tracker, TODO, ciclo §3.5): salen con el push de la rc.4.

## Decidido hoy con Guido (está en el tracker y el TODO, salvo lo marcado)

Una sola ventana como camino del kit; la flota con obra en curso como opción (avisa, recomienda no); el tope de skills avisa, no frena;
editar `CLAUDE.md`/skills/agentes es opción de la ficha; producción queda en Hermes (TODO, ideas); los choques de diseño, como el kit
hasta R2; el ask de `git merge` queda afuera (Hermes ya lo ajustó); **a `main` sube solo el director** (h11, rc.6); las pruebas de cada
rc contra clones de repos reales (ciclo §3.5); **la próxima versión junta el buzón, "probar una idea nueva" (sale de la v3.0) y un PO
como skill** (TODO, Misión 7).

## Próximo paso

Al volver Guido: seguir en ESTA sesión si sigue viva; si no, una nueva con el título `vibe-kit M5 · Recta final (2): de la rc.5 a la v3.0`.
1. Leer los reportes de D8r.3 y D8r.4 (`list_events`), verificar sus tags (`git tag`), y contarle a Guido.
2. Con la rc.4: adoptar el bot. Con la rc.5: "actualizate" y "poné al día" Hermes (con `--con-obra`), el analytics y el bot.
3. **Pasar al tracker** (Pendientes, "De la prueba real") lo que quedó en la nota de la madre: lo de Juan (el doctor no lee la versión
   de `claude` de la terminal; `automode` ⚠ por dos checkouts; `copias-kit` ⚠; la roja `no hay sh` en PowerShell; 7 rojas de carga);
   la lección "dos tandas a la vez en una PC se frenan (la suite 102 min contra 50)"; para Hermes cuando llegue la rc.5:
   `allow_abbrev=False` en `scripts/aplicar_migracion.py` y `andamiaje: con-ok-de-guido` en su ficha. En "Cambios al plan": rc.4 exprés,
   rc.5 del uso real, D8c.1 a la rc.6, los experimentos a la próxima versión.
4. Después: la rc.6 (vuelta 2 + cierre de tramo), el primer módulo de Hermes, la 6b, R2 contra un clon, la v3.0.

## Cosas que muerden y no están en ningún otro doc

- 🔐 **En `Guido-PC-eQ` el push va por `gh`**: `GIT_TERMINAL_PROMPT=0 git -c credential.helper= -c 'credential.helper=!gh auth git-credential' push …`.
- 🔑 **Identidad de git**: `guido.camera.eq@gmail.com`. Nunca `eq.chatgpt`.
- 🔴 **gitleaks antes de cada push, sobre el rango** (`--log-opts="origin/main..HEAD"`): toda la historia da 2 de mentira hasta que la rc.5 traiga el `.gitleaksignore`.
- 🐍 **Python**: `py -3`. En el Bash de esta app los heredocs pierden barras invertidas: escribir con Write/Edit.
- 🧪 **Nunca dos suites ni suite + flota a la vez**: con la PC cargada todo tarda el doble y salen rojas de carga.
- 📬 Guido trabaja en VS Code con una ventana por proyecto (memoria). Las sesiones de Hermes (director cashflow, arquitecto-cashflow,
  obrero-cc-ui) le escriben a la madre: el tracker lo escribe solo la madre.

## Bloqueos

Ninguno. Esperando los tags de la rc.4 y la rc.5.
