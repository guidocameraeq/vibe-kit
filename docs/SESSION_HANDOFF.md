# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**CIERRE** 2026-11-24 (el repaso fue el 22; el 24 se sumó el plan del piloto), sesión `vibe-kit M7 · El repaso del TODO y de coherencia`, PC `Usuario` (Fable 5.2; lectores Sonnet,
aplicadores y revisores Opus), en `main`. Kit `v3.2.0`, **en piloto**. Hoy solo documentos: `kit/` no se tocó.

## Dónde estamos

- **El TODO quedó repartido** (con Guido): un ítem **"La 3.2.1"** con once renglones por cuánto muerde, un ítem **"Más adelante"**
  con el disparador de cada uno, dos renglones nuevos en el ciclo (vuelta 2) y cinco descartes en **REJ-020**.
- **Dos decisiones nuevas**: **ADR-045** (cambiar el `comando-test` pide firma; ponerlo por primera vez, no; se construye en la
  3.2.1) y **ADR-046** (dos vías para sacar una versión: la corta "en piloto" y la larga con `rc` y banco; en la duda, la larga).
  El §6 del ciclo abre con "Qué vía toca".
- **El repaso de coherencia** (tres versiones en una semana): la guía, el README, el índice de `docs/`, cinco manuales, seis ADR
  con su marca, REJ-018 y 019, y el playbook con notas "En el kit v3…" por sección (no se reescribió). Dos vueltas de revisor
  frío Opus, 18 observaciones, todas corregidas.
- Esta PC: `kit-sync` LIMPIO. **Los hooks de la PC siguen en 3.1.0**: falta "instalar hooks por PC" (lo corre Guido).
- Queda una rama **local**, `claude/kit32-skill-po-fbd663` (ya está en `main`): se puede borrar.

## Próximo paso

**El plan entero está en `docs/kit-v3/PILOTO-3.2.md`** (armado el 2026-11-24): leelo antes de tocar nada y anotá ahí lo que aparezca.

1. **`vibe-kit Flota · Los repos reales a la v3.2.0`**, **en Opus, no en Fable** (pedido de Guido). Fase 0: la PC al día y los
   hooks. Fase 1: de a un repo, con su OK antes de cada uno, una fila por repo. Fase 2: una vuelta corta de uso en cada uno.
2. Dos semanas de uso (fase 3): Guido cuenta en el chat lo que pasa y la sesión lo anota en el plan.
3. **`vibe-kit 3.2.1 · La revisión del piloto`** (fase 4), junto con la medición de la `v3.0` (~2026-12-15): scripts, tablas,
   reordenar la 3.2.1 y recién ahí construir.
4. Siguen aparte: el piloto del buzón y la 3.1.1.

## Te espera (Guido)

- **Una decisión, antes de la 3.2.1**: cómo sale un arreglo x.y.1 que toca una barrera o la flota (ADR-046 punto 5 lo deja
  abierto). Recomendado: una `rc` quirúrgica (§7 del ciclo) más el banco, con los cinco arreglos del script del banco antes.
- **Leer la regla de ADR-046 tal como quedó escrita**: la redactó la sesión a partir de lo que hicieron la 3.1 y la 3.2.
- "Instalar hooks por PC" en `Usuario` y `clientes` (y allá, "actualizá el kit"). Sin segunda PC en el buzón hasta la 3.1.1.
- El OK por repo de la flota real.
- Los chats de la PC del probador, al privado. Los de esta PC ya están.
- El clic de P7 (`../vibe-kit-pruebas/rc7/p7-firma/LEEME-P7.txt`).

## Cosas que muerden y no están en ningún otro doc

- 🔑 **Identidad de git**: `guido.camera.eq@gmail.com`. Nunca `eq.chatgpt`.
- 🔴 **gitleaks antes de cada push, sobre el rango** (`--log-opts="origin/main..HEAD"`), sin tubería: vibe-kit es público.
- 🔒 **El buzón y las pruebas de los proyectos son material privado**: en el repo, alias y números; nunca rutas, nombres ni contenido.
- 📥 **El privado se clona con `-c core.longpaths=true`**: sin eso el clon queda a medias (todo "borrado" en el índice) y un commit
  desde ahí borraría el repo entero. Pasó hoy; se tiró ese clon y se hizo otro.
- 🧾 **Un aplicador puede inventar la razón de un descarte**: los dos revisores encontraron una razón que ningún informe decía
  (REJ-001 y REJ-020). Toda razón nueva en `REJECTED.md` se comprueba contra su cita.
- 🧱 **Una sesión en una carpeta de trabajo de la app puede no poder commitear** (el guardia `git-seguro` frena si su `core.hooksPath`
  es una ruta absoluta). No se rodea: deja el trabajo sin commitear y la sesión de la carpeta principal lo trae (`cp`) y lo commitea.
- 🧪 **Una prueba del molde no puede mirar archivos de fuera del molde**: el actualizador corre las pruebas de los hooks dentro del
  proyecto y deja el repo ROTA. La suite no lo ve; la flota de prueba sí.
- 🧪 **Una prueba que fija una lista del molde** (los `allow` de `settings.json` están en `settings.test.cjs` y en
  `niega-aprobar.test.cjs`): al cambiar la lista, cambian las dos.
- 📏 **`director/SKILL.md` está a 14 bytes de su tope e `inicio` a 16**: lo nuevo va a `NUCLEO.md` y al arranque (`inyeccion.cjs`).
- 🧩 **`proceso.cjs` y `cambios.cjs` tienen más de una copia** (molde, Arquitecto, lo de la PC): un cambio va en todas.
- 🧪 La suite entera, **sola**: `node --test "kit/**/*.test.cjs"` (~50 min). Toda roja se corre sola antes de creerla.
- 🧪 La flota de prueba: `bash pruebas/rehacer.sh`, un `git clone --bare` con el tag puesto solo ahí, y
  `actualizar.cjs flota alfa beta gama --canon <bare> --tag vX --proyectos ../vibe-kit-pruebas` (~18 min la vuelta).
- ✍️ **Un heredoc de Bash se come las barras** (`\n` queda en salto real): el código con escapes va por Write o Edit.
- 🚪 **No le marques a Guido tareas de sus otros repos** desde acá (su regla, 2026-11-10): lo que se vea allá va al tracker.

## Bloqueos

Ninguno.
