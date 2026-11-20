# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**CIERRE** 2026-11-20, sesión `vibe-kit M7 · La 3.2`, PC `Usuario` (Opus 5.5 y después Fable 5.2), en `main`. Solo diseño: `kit/` sin tocar.
**Kit `v3.1.0` publicado. La 3.2 está diseñada y con sus dos specs READY, sin construir.**

## Dónde estamos

- **El PO** (ADR-042): la sesión principal del proyecto con oficio, skill `/po`, una por proyecto. Arma el panorama, atiende el buzón,
  les avisa a los directores, revisa que un módulo cierre documentado, cuida `NORTE` y `MAPA`, corre el release y hace lo chico solo si
  no hay nada en obra. `docs/kit-v3/DISENO-PO.md` y `SPEC-PO.md` (**si difieren, manda el spec**). Revisor frío y red team aplicados.
- **Probar una idea nueva** (ADR-043): `.claude/pruebas/`, `prueba.cjs`, la ofrece el PO, vibe-kit lista lo que hay para absorber.
  `docs/kit-v3/SPEC-prueba.md`, con red team.
- **El hallazgo que ordena todo**: el kit ya trae un turno de lo pesado por PC (`conTurno`, desde la `rc.7`) y **los dos repos donde
  nació el rol están en la `rc.6`**: no lo tienen. Ponerlos al día es el paso 0 y decide cuánto se construye.
- La evidencia en crudo (lo que contaron las dos sesiones que hoy improvisan el rol) quedó fuera del repo.

## Próximo paso

La tanda de la 3.2, una sesión por renglón (detalle en `SPEC-PO.md`, "Ejecución"):
0. **La compuerta**: los dos repos del piloto a la `v3.1.0` (es el ítem de la flota del TODO, con el OK de Guido por repo). A la semana,
   las mismas preguntas de `DISENO-PO.md` §3.1 a las sesiones que cumplan el rol, y medir si las sesiones de una PC comparten el temporal.
1. **`vibe-kit 3.2 · El turno y el panorama`** (~4 h, Opus): `conTurno` en sus tres copias, `turno.cjs`, `estado.cjs --obra`.
2. **`vibe-kit 3.2 · La skill del PO`** (~4 h): `po.cjs`, la skill, la pieza, `NUCLEO`, el arranque.
3. **`vibe-kit 3.2 · Probar una idea nueva`** (~3 h): `SPEC-prueba.md`, con red team de la regla `allow`.
4. **`vibe-kit 3.2 · La rc.1 y el piloto`**: revisor frío, suite, flota de prueba, tag, banco vuelta 1, piloto de dos semanas.

Siguen aparte: el piloto del buzón en la PC del probador, la 3.1.1 y la medición de la `v3.0` (~2026-12-15).

## Te espera (Guido)

- El OK por repo para poner al día los dos del piloto (la compuerta) y el resto de la flota.
- En la otra PC (`clientes`): "actualizá el kit" e "instalar hooks por PC". **No registres en el buzón una segunda PC tuya hasta la 3.1.1.**
- El clic de P7 (`../vibe-kit-pruebas/rc7/p7-firma/LEEME-P7.txt`).
- Decidir dónde viajan los ~20 arreglos sueltos "para la v3.1" del TODO (3.1.x o 3.2): no se trató.
- Los chats al privado desde una PC con acceso: el de esta sesión (`aaed1faa`) y los de la PC del probador (`git show e5e6d72:docs/SESSION_HANDOFF.md`).

## Cosas que muerden y no están en ningún otro doc

- 🔑 **Identidad de git**: `guido.camera.eq@gmail.com`. Nunca `eq.chatgpt`.
- 🔴 **gitleaks antes de cada push, sobre el rango** (`--log-opts="origin/main..HEAD"`), sin tubería: vibe-kit es público.
- 🔒 **El buzón es material privado**: en el repo van alias y números, nunca la ruta, nombres de personas o PCs, ni contenido de mensajes.
- 📏 **`director/SKILL.md` está a 14 bytes de su tope e `inicio` a 16**: lo nuevo va a `NUCLEO.md` y al arranque (`inyeccion.cjs`).
- 🧩 **`proceso.cjs` tiene tres copias** (molde, Arquitecto, lo de la PC): `conTurno` cambia en las tres.
- 🗣️ **Para saber qué hace una sesión viva, preguntale** (mensaje entre sesiones): así se relevó el PO. Anda en VS Code y por Remote Control.
- 🤖 **Una sesión en Fable desde una en Opus**: `start_session` la abre en Opus. Arreglo: `set_session_model`, `stop_session` y reenviar.
- 🧪 **`node --test` en paralelo da rojas de carga**: toda roja se corre sola antes de creerla. Nunca dos tandas pesadas a la vez. La
  suite entera tarda ~65 min. Las pruebas que dependen de la cuenta de Windows (`dueno`, `aviso-real`) se corren en las dos PCs.
- 🧪 **La flota de prueba**: `bash pruebas/rehacer.sh`, un `git clone --bare` con el tag puesto solo ahí, y
  `actualizar.cjs flota alfa beta gama --canon <bare> --tag vX --proyectos ../vibe-kit-pruebas`, dos vueltas (~20 min cada una).
- ✍️ **Un heredoc de Bash con comillas o acentos raros puede fallar**: el script va a un archivo (Write) y se corre.
- 💻 **La terminal de Guido es PowerShell 5.1**: si queda una línea para él, sin `&&` (mejor: ninguna).
- 🚪 **No le marques a Guido tareas de sus otros repos** desde acá (su regla, 2026-11-10): lo que se vea allá va al tracker.

## Bloqueos

Ninguno.
