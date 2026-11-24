# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**CIERRE** 2026-11-24, sesión `vibe-kit Flota · Los repos reales a la v3.2.0`, PC `Usuario` (Opus 5.5, sin subagentes), en `main`.
Kit `v3.2.0`, **en piloto**. `kit/` no se tocó. Cerrada a las apuradas: Guido se iba con la PC sin wifi.

## Dónde estamos

- **El plan es `docs/kit-v3/PILOTO-3.2.md`**: ahí está todo lo que apareció (fase 0 y las filas de Deptos). Leelo antes de tocar nada.
- **Fase 0 en `Usuario`: hecha.** Kit 3.2.0, hooks por PC 3.2.0 (cambió solo `lib/proceso.cjs`), doctor en verde. **Falta reiniciar
  Claude Code** si no se hizo (los hooks cargan al reiniciar). `clientes`: entera pendiente.
- **La foto de `Usuario`**: el único repo real con ficha es **Deptos**. Los otros seis con kit están en `clientes`. **Perseo** está acá
  pero sin ficha: no se pone al día, se adopta (sesión aparte, cuando Guido quiera; tiene un worktree de agente viejo, `rev/f2-version`).
- **Deptos, sano y entero en `rc.6`**, en dos vueltas:
  1. **te espera**: chocó `worktree.cjs` (el plazo del push de `integrar`, subido a mano a 10 min el 2026-11-10; la 3.2.0 trae lo
     mismo como `T_PUSH_INTEGRAR`). Con el OK de Guido: `resolver . scripts nueva`, commit `e4d7115` en `main` de Deptos, pusheado.
  2. **ROTA**, pero **no cuenta**: la PC se apagó sin batería en el medio (las pruebas de los hooks pasaron el tope y el remoto no
     respondió). En GitHub queda `kit/v3.2.0` de la vuelta 1 (`kit: ESPERA`); la próxima vuelta la rehace sola.
- Guido pidió **no anotar** dos cosas que charlamos: que una vuelta tarde ~1 h, y que la propuesta de fusión llame a `claude -p` sin
  `--model`. No las re-propongas como hallazgo.

## Próximo paso

1. **`vibe-kit Flota · Deptos y clientes a la v3.2.0`** (en Opus): **la vuelta 3 de Deptos con la PC enchufada** (~1 h en segundo
   plano: `actualizar.cjs flota "Proyecto Deptos" --tag v3.2.0 --proyectos <carpeta>`). Si mezcla, abrir Deptos y `/inicio` (fase 2).
   La línea 8 (`pruebas`) dio ❌ en la vuelta 1 con "en base pasaba": NO VERIFICADO si fue el choque o algo de Deptos; si vuelve, se
   para y se le muestra. Después, en `clientes`: fase 0 y los seis, de a uno, con su OK (los que tengan worktree en uso, salteados).
2. Dos semanas de uso (fase 3) y la revisión de la 3.2.1 (fase 4, ~2026-12-15 con la medición de la `v3.0`).
3. Siguen aparte: el piloto del buzón y la 3.1.1.

## Te espera (Guido)

- Reiniciar Claude Code en `Usuario` (los hooks nuevos).
- Una ventana de ~1 h con la PC enchufada para la vuelta 3 de Deptos.
- **Una decisión, antes de la 3.2.1**: cómo sale un arreglo x.y.1 que toca una barrera o la flota (ADR-046 punto 5). Recomendado:
  una `rc` quirúrgica más el banco.
- Leer la regla de ADR-046 tal como quedó escrita. "Instalar hooks por PC" y "actualizá el kit" en `clientes`.
- Los chats de la PC del probador, al privado. El clic de P7 (`../vibe-kit-pruebas/rc7/p7-firma/LEEME-P7.txt`).

## Cosas que muerden y no están en ningún otro doc

- 🔑 **Identidad de git**: `guido.camera.eq@gmail.com`. Nunca `eq.chatgpt`.
- 🔴 **gitleaks antes de cada push, sobre el rango** (`--log-opts="origin/main..HEAD"`), sin tubería: vibe-kit es público.
- 🔒 **El buzón y las pruebas de los proyectos son material privado**: en el repo, alias y números; nunca rutas, nombres ni contenido.
- 📥 **El privado se clona con `-c core.longpaths=true`**.
- ⏱️ **Una vuelta de la flota sobre Deptos tarda ~1 h** (57 min la primera; corre sus pruebas dos veces y las 27 de los hooks).
  Corréla en segundo plano y avisale a Guido el tiempo real, no el de la flota de prueba (~18 min).
- 🗂️ **El log de la flota sale entero al final**: el archivo queda vacío mientras corre. Para ver si vive, mirá los procesos.
- 🧾 **Un aplicador puede inventar la razón de un descarte**: toda razón nueva en `REJECTED.md` se comprueba contra su cita.
- 🧱 **Una sesión en una carpeta de trabajo de la app puede no poder commitear** (`git-seguro` y `core.hooksPath` absoluto): no se rodea.
- 📏 **`director/SKILL.md` está a 14 bytes de su tope e `inicio` a 16**: lo nuevo va a `NUCLEO.md` y al arranque.
- 🧩 **`proceso.cjs` y `cambios.cjs` tienen más de una copia**: un cambio va en todas.
- 🧪 La suite entera, **sola**: `node --test "kit/**/*.test.cjs"` (~50 min). La flota de prueba: `bash pruebas/rehacer.sh` y
  `actualizar.cjs flota alfa beta gama --canon <bare> --tag vX --proyectos ../vibe-kit-pruebas`.
- ✍️ **Un heredoc de Bash se come las barras**: el código con escapes va por Write o Edit.
- 🚪 **No le marques a Guido tareas de sus otros repos** desde acá: lo que se vea allá va al tracker.

## Bloqueos

Ninguno.
