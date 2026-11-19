# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**CIERRE** 2026-11-19, sesión `vibe-kit M7 · El spec del buzón`, en la PC del probador de la beta (Opus 5.5), en `main`. Solo el spec:
`kit/` sin tocar. **Sin tag**: el kit sigue en `v3.0.1`, y `reflexion` espera en el `[Unreleased]` de `kit/CHANGELOG.md`.

## Dónde estamos

- **El spec del buzón está READY y sellado**: `docs/kit-v3/SPEC-G1-buzon.md` (ADR-038), con su red team aplicado (14 hallazgos, al
  final del spec). Lo decidió el probador con el OK de Guido. Las pruebas de §7 del diseño están medidas y anotadas en el spec, y la línea
  base del piloto, contada turno por turno.
- **Tres choques con el diseño, resueltos** (D1-D3 del spec): en el v0, `esperando_respuesta_de` abre turno; un remitente v0 se
  verifica con el dueño de su registro v0; la regla `allow` la pone `instalar-hooks-pc`.
- **El red team movió una pieza**: `buzon.cjs` vive en `kit/skills/arquitecto-skills/pc/buzon/` y viaja con los hooks por PC a
  `~/.claude/hooks/kit/buzon/` (protegido y con huella). La skill `buzon` trae solo su `SKILL.md` y el protocolo.
- **La skill `reflexion`** (ADR-036): hecha y probada, espera el tag. La suite entera **no** se corrió (~90 min): va antes del tag.

## Próximo paso

1. **`vibe-kit M7 · La construcción del buzón`**: chat nuevo en la raíz, `inicio — ejecutá docs/kit-v3/SPEC-G1-buzon.md (está
   READY)`. Son dos sesiones seguidas (§Ejecución del spec). Primero la **prueba 0**: el `CLAUDE_CODE_ENTRYPOINT` de una sesión de
   terminal y de VS Code, y si `PostToolUse` acepta `additionalContext`.
2. Después, el tag que lleve `reflexion` y el buzón (lo decide Guido, con la suite entera y el banco) y el piloto de un mes en la PC
   del probador, que arranca con `buzon.cjs medir --linea-base`.
3. **`vibe-kit Flota · Los repos reales a la v3.0.1`**: repo por repo con el OK de Guido (en el TODO).

## Te espera (Guido)

- Decidir cuándo sale el tag con `reflexion` (en el TODO).
- La tensión anotada en el acta de la prueba de `reflexion`: con el dueño ausente, "propone y no escribe" deja las propuestas esperando.
- El OK por repo de la flota real · "instalar hooks por PC" en las dos PCs · el clic de P7 (`../vibe-kit-pruebas/rc7/p7-firma/LEEME-P7.txt`).
- **Subir al privado los chats de esta PC** desde una PC con acceso: ids `7f248448-4f66-47cf-90bb-fb0e8e133c00` (la `reflexion`),
  `0f74d80f-5fc9-4431-a3bc-c5b60d1e9cbd` (el diseño del buzón) y `b84aa177-6e1d-4d72-b5c0-742eb755a31b` (este spec). La cuenta de
  GitHub de esta PC no ve ese repo, y el diario de misiones tampoco tiene sus filas.

## Cosas que muerden y no están en ningún otro doc

- 🔑 **Identidad de git**: en la PC de Guido, `guido.camera.eq@gmail.com`; nunca `eq.chatgpt`. Esta PC commitea con su propia identidad.
- 🔴 **gitleaks antes de cada push, sobre el rango** (`--log-opts="origin/main..HEAD"`), sin tubería: vibe-kit es público.
- 🔒 **El buzón es material privado**: en el repo van alias y números, nunca la ruta, nombres de personas o PCs, ni contenido de
  mensajes. La ruta está en la config del visor (carpeta hermana `visor-buzon`). Para medirlo, solo metadatos, con `py -3 -I` y
  `encoding='utf-8-sig'`. La construcción **no toca la carpeta real**: a lo sumo `mudar --plan` y `medir --linea-base`.
- 🧪 **Probar permisos de Claude Code**: `claude -p --model haiku --output-format json --settings <json> "…" </dev/null` en una carpeta
  del scratchpad, y leer `permission_denials`. Una `-p` lanzada desde esta sesión hereda `CLAUDE_CODE_ENTRYPOINT=claude-desktop`: para
  ver el valor real, `env -u CLAUDE_CODE_ENTRYPOINT`.
- 🧷 **Un cambio de freno en la madre** va por `cambios.cjs nuevo` (`--toca frenos`) → `cambios.cjs aprobar` **desde la carpeta, sin
  `cd`** → recién ahí el commit de la ficha. Los frenos leen la ficha de `origin/main`: sin push, no cambia nada.
- 📏 **El `SKILL.md` del Equipador tiene tope** (10.202 bytes; hoy 10.166): el spec lo resuelve sacando la repetición, sin subirlo.
- 🐍 **Python**: `py -3`; para los `.jsonl`, `py -3 -I` con `sys.stdout.reconfigure(encoding="utf-8")`.
- 💻 **La terminal de Guido es PowerShell 5.1**: si queda una línea para él, en PowerShell y sin `&&` (mejor: ninguna).
- 🧪 **Nunca dos tandas pesadas a la vez**. La suite entera tarda ~90 min; la de tiempo de `cambios-flota` falla con carga y sola pasa.
- 🗂️ La prueba de la beta sigue en la rama `prueba/juan` (y el tag `archivo/prueba-juan-2026-11-06`); desde ahí no se toca `main`.
- 🚪 **No le marques a Guido tareas de sus otros repos** desde acá (su regla, 2026-11-10): lo que se vea allá va al tracker.

## Bloqueos

Ninguno.
