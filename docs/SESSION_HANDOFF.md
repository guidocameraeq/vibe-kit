# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**CIERRE** 2026-11-25, sesión `vibe-kit Flota · Los repos reales a la v3.2.0` (el mismo chat del 24, día 2), PC `Usuario`, Opus 5.5
(una sesión de firmas en Perseo, Sonnet), en `main`. Kit `v3.2.0`, **en piloto**. `kit/` no se tocó.

## Dónde estamos

- **El plan es `docs/kit-v3/PILOTO-3.2.md`**: ahí está todo lo que apareció, fila por fila. Leelo antes de tocar nada.
- **`Usuario`, fases 0 y 1 hechas.** Deptos y Perseo, en 3.2.0, en GitHub y en su carpeta, con `adoptar --verificar` en verde. No hay
  otro repo con kit en esta PC (Guido lo confirmó); los otros con Claude (volumen-maestro, Arte, museum-slideshow…) no se adoptan.
- **Deptos**: cuatro vueltas. La 3 dio ROTA real (su prueba del freno de WhatsApp leía `.claude/frenos.log`; desde la rc.8 va a la
  carpeta común): arreglo de una línea con `leerTodo`, y la 4 dio mezclado. Traer el commit del kit a mano a `main` no pasa el pre-push
  (bien: sin la flota no tiene exención); no lo vuelvas a intentar.
- **Perseo**: adoptado "por el sello" (pedido de Guido). La firma sale solo de una sesión abierta en la carpeta del proyecto, en la rama
  por defecto: no desde el clon ni desde la madre. Le quedan: `NORTE.md` con 5 `[completar]` (anotado en su TODO como KIT-NORTE), su
  handoff sobre el tope, 5 falsos de gitleaks en pruebas viejas y un worktree de agente del 2-nov.
- Guido pidió **no anotar** que una vuelta tarde ~1 h ni que la fusión llame a `claude -p` sin `--model`. No los re-propongas.

## Próximo paso

1. **`vibe-kit Flota · clientes a la v3.2.0`** (en Opus, sentado en la PC `clientes`): fase 0 allá ("actualizá el kit", "instalar hooks
   por PC", doctor) y los otros seis, de a uno, con su OK (los que tengan worktree en uso, salteados).
2. La fase 2 en Deptos y Perseo: abrir cada uno y `/inicio` (lo hace Guido con su uso; se anota lo que pase).
3. Dos semanas de uso (fase 3) y la revisión de la 3.2.1 (fase 4, ~2026-12-15 con la medición de la `v3.0`).
4. Siguen aparte: el piloto del buzón y la 3.1.1.

## Te espera (Guido)

- Abrir Deptos y Perseo y correr `/inicio` en cada uno.
- **Una decisión, antes de la 3.2.1**: cómo sale un arreglo x.y.1 que toca una barrera o la flota (ADR-046 punto 5). Recomendado:
  una `rc` quirúrgica más el banco. Y leer la regla de ADR-046 tal como quedó escrita.
- Los chats de la PC del probador, al privado. El clic de P7 (`../vibe-kit-pruebas/rc7/p7-firma/LEEME-P7.txt`).

## Cosas que muerden y no están en ningún otro doc

- 🔑 **Identidad de git**: `guido.camera.eq@gmail.com`. Nunca `eq.chatgpt`.
- 🔴 **gitleaks antes de cada push, sobre el rango** (`--log-opts="origin/main..HEAD"`), sin tubería: vibe-kit es público.
- 🔒 **El buzón y las pruebas de los proyectos son material privado**: en el repo, alias y números; nunca rutas, nombres ni contenido.
- 📥 **El privado se clona con `-c core.longpaths=true`**.
- ⏱️ **Una vuelta de la flota sobre Deptos tarda 25 a 60 min**: en segundo plano, y avisale a Guido el tiempo real. El log sale entero
  al final (vacío mientras corre): para ver si vive, mirá los procesos.
- 🧱 **El guardia `git-seguro` frena commit, push, stash y `git rm` en un clon sin `core.hooksPath`**: no lo rodees (ni con una
  variable que esconda el `git commit`: pasó sin querer el 25, quedó dicho). Para adoptar, el trabajo se trae a la carpeta del
  proyecto (`fetch` del clon + `merge --ff-only`) y se prenden ahí los githooks.
- 🧾 **Un aplicador puede inventar la razón de un descarte**: toda razón nueva en `REJECTED.md` se comprueba contra su cita.
- 📏 **`director/SKILL.md` está a 14 bytes de su tope e `inicio` a 16**: lo nuevo va a `NUCLEO.md` y al arranque.
- 🧩 **`proceso.cjs` y `cambios.cjs` tienen más de una copia**: un cambio va en todas.
- 🧪 La suite entera, **sola**: `node --test "kit/**/*.test.cjs"` (~50 min). La flota de prueba: `bash pruebas/rehacer.sh` y
  `actualizar.cjs flota alfa beta gama --canon <bare> --tag vX --proyectos ../vibe-kit-pruebas`.
- ✍️ **Un heredoc de Bash se come las barras**: el código con escapes va por Write o Edit.
- 🚪 **No le marques a Guido tareas de sus otros repos** desde acá: lo que se vea allá va al tracker.

## Bloqueos

Ninguno.
