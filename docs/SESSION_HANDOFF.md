# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**CIERRE** 2026-11-19, sesión `vibe-kit M7 · La construcción del buzón` (la 1 de 2), PC del probador (Opus 5.5), en `main`. **Sin
tag**: el kit sigue en `v3.0.1`; `reflexion` y esta mitad del buzón esperan en el `[Unreleased]` de `kit/CHANGELOG.md`.

## Dónde estamos

- **Sesión 1 del spec hecha** (ADR-039): el instalador por PC (4 eventos, `PIEZAS`, la regla `allow`), el aviso
  (`pc/aviso-buzon.cjs`), el `doctor` (chequeo `buzon`, 30 chequeos) y `correctorRegistrado`. Red team del código (11 de 12
  aplicados), mutación 36/36, 329 pruebas de lo tocado sin fallas. La suite entera no se corrió (va antes del tag).
- **Prueba 0**: terminal = `cli` (medido); `PostToolUse` acepta `additionalContext` (medido); `claude-vscode` está en el binario
  2.1.327 y una `-p` lanzada desde `cli` pasa a `sdk-cli` (leído en el código; VS Code en vivo, NO VERIFICADO). Va acá y no en el
  spec: el spec tiene sello y tocarlo lo rompe.
- **La regla no sale todavía en ninguna PC**: el instalador la pone solo si el kit trae `pc/buzon/buzon.cjs`, que llega en la sesión 2.

## Próximo paso

1. **`vibe-kit M7 · La construcción del buzón, sesión 2`**: chat nuevo en la raíz, `inicio — sesión 2 de
   docs/kit-v3/SPEC-G1-buzon.md`. `buzon.cjs` en `kit/skills/arquitecto-skills/pc/buzon/`, la skill, el protocolo, lo de kit-owned
   (`preparar-pc` `SKILLS`, `kit-sync`, `adoptar`, el menú, la guía) y el tope del Equipador. Lo que pide esta sesión:
   - **`paraAviso`** con el contrato del encabezado de `aviso-buzon.cjs` (corre en un `worker_thread`: puede ser síncrono);
   - **`responder` se niega si su entrada es un archivo** (`fs.fstatSync(0).isFile()`): medido, `responder < archivo` y `<<<` pasan
     la regla sin pedir permiso; en Git Bash el heredoc llega como tubo;
   - la ruta del comando que imprime `leer` = `reglasBuzon()` del instalador (exportado), y entrypoints `cli`, `claude-desktop`,
     `claude-vscode`;
   - las pruebas del instalador y del doctor usan un `buzon.cjs` de mentira en una copia del kit: con el de verdad tienen que seguir
     verdes. Al cerrar: red team, mutación en `responder`, y el spec a `✅ IMPLEMENTADO`.
2. Después, el tag que lleve `reflexion` y el buzón (lo decide Guido, con la suite entera y el banco), y el piloto de un mes.
3. **`vibe-kit Flota · Los repos reales a la v3.0.1`**: repo por repo con el OK de Guido (en el TODO).

## Te espera (Guido)

- Decidir cuándo sale el tag con `reflexion` (en el TODO).
- La tensión anotada en el acta de la prueba de `reflexion`: con el dueño ausente, "propone y no escribe" deja las propuestas esperando.
- El OK por repo de la flota real · "instalar hooks por PC" en las dos PCs · el clic de P7 (`../vibe-kit-pruebas/rc7/p7-firma/LEEME-P7.txt`).
- **Subir al privado los chats de esta PC** desde una PC con acceso: `7f248448-4f66-47cf-90bb-fb0e8e133c00` (`reflexion`),
  `0f74d80f-5fc9-4431-a3bc-c5b60d1e9cbd` (diseño del buzón), `b84aa177-6e1d-4d72-b5c0-742eb755a31b` (spec) y
  `88f05614-588d-4879-9a54-8f3396b06a88` (esta). La cuenta de GitHub de esta PC no ve ese repo; el diario tampoco tiene sus filas.

## Cosas que muerden y no están en ningún otro doc

- 🔑 **Identidad de git**: en la PC de Guido, `guido.camera.eq@gmail.com`; nunca `eq.chatgpt`. Esta PC commitea con su propia identidad.
- 🔴 **gitleaks antes de cada push, sobre el rango** (`--log-opts="origin/main..HEAD"`), sin tubería: vibe-kit es público.
- 🔒 **El buzón es material privado**: en el repo van alias y números, nunca la ruta, nombres de personas o PCs, ni contenido de
  mensajes. La construcción **no toca la carpeta real**: a lo sumo `mudar --plan` y `medir --linea-base`.
- 🧪 **Probar permisos**: `claude -p --model haiku --output-format json --settings <json> "…" </dev/null` en el scratchpad, con
  `env -u CLAUDE_CODE_ENTRYPOINT`, y leer `permission_denials`. Una sesión interactiva de prueba: `run_in_terminal` con
  `$env:CLAUDE_CODE_ENTRYPOINT = ''` y un hook `SessionStart` que anota la variable.
- ✍️ **Al escribir archivos, `\uXXXX` se vuelve el carácter literal** (y `\\` dentro de un heredoc de Bash, una sola barra). Para una
  regex con escapes, armala con `String.fromCharCode(92)` o con `\p{…}`.
- 🧬 **La mutación** edita los archivos un rato: nada de pruebas ni subagentes leyendo en paralelo. Script de esta sesión: hay que
  rehacerlo (vivía en el scratchpad).
- 🧷 **Un cambio de freno en la madre** va por `cambios.cjs nuevo` → `aprobar` desde la carpeta, sin `cd`. Editar `kit/` no lo es.
- 💻 **La terminal de Guido es PowerShell 5.1**: si queda una línea para él, en PowerShell y sin `&&` (mejor: ninguna).
- 🧪 **Nunca dos tandas pesadas a la vez**: el doctor dio 7 fallas en paralelo con `preparar-pc` y 0 solo.
- 🚪 **No le marques a Guido tareas de sus otros repos** desde acá (su regla, 2026-11-10): lo que se vea allá va al tracker.

## Bloqueos

Ninguno.
