# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**CIERRE** 2026-11-20, sesión `vibe-kit M7 · La 3.2`, PC `Usuario` (Opus 5.5 y después Fable 5.2), en `main`.
**Kit `v3.2.0` publicado** (tag sobre `26bcaaf`, con su página en GitHub), **en piloto**.

## Dónde estamos

- **La 3.2 trae** (ADR-042 a 044): el **PO** (skill `/po`, `po.cjs`, pieza opcional), el **turno de lo pesado a la vista**
  (`conTurno` con rastro y esperas, `turno.cjs`), el **panorama** (`estado.cjs --obra`) y **probar una idea nueva** (`prueba.cjs`,
  `pruebas-flota.cjs`). Diseñada y construida el mismo día, con tres sesiones Opus en paralelo. Sin banco ni `rc` (ADR-044).
- **Pasó**: la suite entera (3.476; una roja que era una expectativa vieja, corregida), el revisor frío (8 hallazgos: 1, 2 y 3
  aplicados), el red team de la regla `allow` de `anotar` (24 trucos, ninguno pasó) y la flota de prueba (alfa, beta y gama de la
  2.4.2 a la 3.2.0; la primera vuelta encontró un bug real, arreglado).
- **No viene**: el envoltorio para lo pesado que corre por fuera del kit (`turno.cjs correr`, `pesados:`): espera evidencia.
- Esta PC: `kit-sync` LIMPIO. **Los hooks de la PC siguen en 3.1.0**: falta "instalar hooks por PC" (lo corre Guido).
- Las tres carpetas de trabajo de la construcción se borraron (sin forzar) y sus sesiones se archivaron. Queda una rama **local**,
  `claude/kit32-skill-po-fbd663`: su contenido entró a `main` como parche, así que git no la borra sin forzar. Se puede borrar.

## Próximo paso

1. **"Instalar hooks por PC"** en esta PC (los hooks siguen en 3.1.0; lo corre Guido).
2. **`vibe-kit Flota · Los repos reales a la v3.2.0`**: repo por repo con el OK de Guido. En los que quiera PO: "prendé la pieza po"
   (copiar la skill y `po: molde`; `po: sí` no alcanza).
3. **`vibe-kit 3.2.1 · Lo que deje el uso`**: los cinco hallazgos del revisor que quedaron, prender una pieza opcional por script, y
   lo que muestre el uso real (la lista, en el TODO, misión 7).
4. Siguen aparte: el piloto del buzón, la 3.1.1 y la medición de la `v3.0` (~2026-12-15).

## Te espera (Guido)

- "Instalar hooks por PC" en `Usuario` y en `clientes` (y allá, "actualizá el kit"). No registres una segunda PC en el buzón hasta la 3.1.1.
- El OK por repo de la flota real · decidir dónde van los ~20 arreglos sueltos "para la v3.1" del TODO.
- Los chats al privado desde una PC con acceso: el de esta sesión (`aaed1faa`) y los de la PC del probador.
- El clic de P7 (`../vibe-kit-pruebas/rc7/p7-firma/LEEME-P7.txt`).

## Cosas que muerden y no están en ningún otro doc

- 🔑 **Identidad de git**: `guido.camera.eq@gmail.com`. Nunca `eq.chatgpt`.
- 🔴 **gitleaks antes de cada push, sobre el rango** (`--log-opts="origin/main..HEAD"`), sin tubería: vibe-kit es público.
- 🔒 **El buzón y las pruebas de los proyectos son material privado**: en el repo, alias y números; nunca rutas, nombres ni contenido.
- 🧱 **Una sesión en una carpeta de trabajo de la app puede no poder commitear** (el guardia `git-seguro` frena si su `core.hooksPath`
  es una ruta absoluta). No se rodea: deja el trabajo sin commitear y la sesión de la carpeta principal lo trae (`cp`) y lo commitea.
- 🧪 **Una prueba del molde no puede mirar archivos de fuera del molde**: el actualizador corre las pruebas de los hooks dentro del
  proyecto y deja el repo ROTA. La suite no lo ve; la flota de prueba sí.
- 🧪 **Una prueba que fija una lista del molde** (los `allow` de `settings.json` están en `settings.test.cjs` y en
  `niega-aprobar.test.cjs`): al cambiar la lista, cambian las dos.
- 📏 **`director/SKILL.md` está a 14 bytes de su tope e `inicio` a 16**: lo nuevo va a `NUCLEO.md` y al arranque (`inyeccion.cjs`).
- 🧩 **`proceso.cjs` tiene tres copias** (molde, Arquitecto, lo de la PC): `conTurno` cambia en las tres.
- 🧪 La suite entera, **sola**: `node --test "kit/**/*.test.cjs"` (~50 min). Toda roja se corre sola antes de creerla.
- 🧪 La flota de prueba: `bash pruebas/rehacer.sh`, un `git clone --bare` con el tag puesto solo ahí, y
  `actualizar.cjs flota alfa beta gama --canon <bare> --tag vX --proyectos ../vibe-kit-pruebas` (~18 min la vuelta).
- ✍️ **Un heredoc de Bash se come las barras** (`\n` queda en salto real): el código con escapes va por Write o Edit.
- 🚪 **No le marques a Guido tareas de sus otros repos** desde acá (su regla, 2026-11-10): lo que se vea allá va al tracker.

## Bloqueos

Ninguno.
