# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**CIERRE** 2026-11-19, sesión `vibe-kit · La skill reflexion`, en la PC del probador de la beta (Opus 5.5), con su OK y el de Guido para
trabajar en `main`. **Sin tag**: el kit sigue en `v3.0.1`, y `reflexion` espera en el `[Unreleased]` de `kit/CHANGELOG.md`.

## Dónde estamos

- **Skill nueva `reflexion`** (ADR-036): global, kit-owned, como `docs-fyd` y `relevamiento`. Una pasada por la sesión antes de cerrarla
  que propone y no escribe sin el OK de cada ítem. La instala el Equipador (`preparar-pc.cjs`, `kit-sync.sh` con 6 rutas, el menú).
  Queda aparte del `/cierre`: el del molde no cambió (está en 7.957 de 8.000 bytes).
- **Su prueba** (`writing-skills`): `docs/kit-v3/PRUEBA-reflexion.md`, con el proyecto ficticio en `pruebas/reflexion/`. Sin la skill, 3 de
  3 escribieron 6 o 7 archivos sin preguntar; con la skill, 4 de 4 no escribieron nada y dieron veredicto.
- Tests de lo tocado: 131 de 131 (`preparar-pc`, `adoptar`, `habla`, `skill`). La suite entera **no** se corrió (~90 min): va antes del tag.
- **Kit `v3.0.1`** (tag sobre `5c20e19`). El log de la tanda 1: `docs/kit-v3/TANDAS-DE-VERSIONES.md`. La madre tiene el kit adoptado
  (ficha `.claude/kit.md`). El ciclo: `docs/CICLO-DE-MEJORA.md` (ADR-035); las fechas, arriba del TODO.

## Próximo paso

1. **El buzón de agentes como skill de la organización, con avisos** (pedido del mismo probador, 2026-11-19): es la misión 7 / v3.1 del
   TODO, con su charla de diseño con Guido. Sesión `vibe-kit M7 · El buzón`.
2. **`vibe-kit Flota · Los repos reales a la v3.0.1`**: repo por repo con el OK de Guido (en el TODO).
3. El tag que lleve `reflexion`: lo decide Guido, con la suite entera y el banco (§6 del ciclo).

## Te espera (Guido)

- Decidir cuándo sale el tag con `reflexion` (en el TODO).
- La tensión anotada en el acta de la prueba: con el dueño ausente, "propone y no escribe" deja las propuestas esperando.
- El OK por repo de la flota real · "instalar hooks por PC" en las dos PCs · el clic de P7 (`../vibe-kit-pruebas/rc7/p7-firma/LEEME-P7.txt`).
- **Subir el chat de esta sesión al privado** desde una PC con acceso: id `7f248448-4f66-47cf-90bb-fb0e8e133c00` (la cuenta de GitHub
  de esta PC no ve ese repo; el diario de misiones tampoco tiene su fila).

## Cosas que muerden y no están en ningún otro doc

- 🔑 **Identidad de git**: en la PC de Guido, `guido.camera.eq@gmail.com`; nunca `eq.chatgpt`. Esta sesión commiteó con la identidad
  de la PC donde corrió.
- 🔴 **gitleaks antes de cada push, sobre el rango** (`--log-opts="origin/main..HEAD"`), sin tubería: vibe-kit es público.
- 🧷 **Un cambio de freno en la madre** va por `cambios.cjs nuevo` (`--toca frenos`) → `cambios.cjs aprobar` **desde la carpeta, sin
  `cd`** → recién ahí el commit de la ficha. Los frenos leen la ficha de `origin/main`: sin push, no cambia nada.
- 📏 **El `SKILL.md` del Equipador tiene tope** (10.202 bytes, `skill.test.cjs`): nombrar una skill nueva en cada lista lo pasa.
- 🐍 **Python**: `py -3`; para los `.jsonl`, `py -3 -I` con `sys.stdout.reconfigure(encoding="utf-8")`.
- 💻 **La terminal de Guido es PowerShell 5.1**: si queda una línea para él, en PowerShell y sin `&&` (mejor: ninguna).
- 🧱 **El clasificador del modo `auto`** frena a veces escribir `~/.claude/settings.json` y abrir sesiones nuevas desde un director.
- 🤖 **`start_session` con un modelo más caro que el del que lanza se ignora sin aviso**: verificar con `get_session`.
- 🧪 **Nunca dos tandas pesadas a la vez**. La suite entera tarda ~90 min; la de tiempo de `cambios-flota` falla con carga y sola pasa.
- 🗂️ La prueba de la beta sigue en la rama `prueba/juan` (y el tag `archivo/prueba-juan-2026-11-06`); desde ahí no se toca `main`.
- 🚪 **No le marques a Guido tareas de sus otros repos** desde acá (su regla, 2026-11-10): lo que se vea allá va al tracker.
- 🔒 Los repos del trabajo se leen en copias del scratchpad; a vibe-kit (público) va solo el comportamiento del kit, en abstracto.

## Bloqueos

Ninguno.
