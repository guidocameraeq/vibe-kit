# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**CIERRE** 2026-11-19, sesión `vibe-kit M7 · El buzón`, en la PC del probador de la beta (Opus 5.5), trabajando en `main`. Solo diseño:
`kit/` sin tocar. **Sin tag**: el kit sigue en `v3.0.1`, y `reflexion` espera en el `[Unreleased]` de `kit/CHANGELOG.md`.

## Dónde estamos

- **El diseño del buzón está cerrado y revisado**: `docs/kit-v3/DISENO-G1-buzon.md` (ADR-037). Lo decidió **el probador con el OK de
  Guido**, de a una: el aviso del buzón en cada sesión (hook por PC), el id `proyecto/persona`, contestar solo con citas (pegar
  contenido y actuar piden OK), el vocabulario de la mesa del kit, todo en el kit con la ruta y la persona solo en la PC, y la mudanza
  PC por PC. Revisor frío Opus: 15 hallazgos, todos aplicados (§10 del diseño).
- **El buzón v0 sigue vivo** en la unidad de red (la ruta, en la config del visor del buzón, en el repo privado del visor). La medición
  en crudo y la investigación quedaron en el scratchpad de esta sesión: lo que importa está resumido en §2 y §3 del diseño.
- **La skill `reflexion`** (ADR-036): hecha y probada; espera el tag. La suite entera **no** se corrió (~90 min): va antes del tag.
- **Kit `v3.0.1`** (tag sobre `5c20e19`). La madre tiene el kit adoptado (ficha `.claude/kit.md`).

## Próximo paso

1. **`vibe-kit M7 · El spec del buzón`**: el spec delta desde el diseño (§4.5 lista lo que cambia en el instalador de frenos por PC:
   cuatro eventos, varias piezas por evento, `correctorRegistrado` por nombre), con su red team. Primero, las pruebas de §7: cuánto
   tarda leer la carpeta de red desde un hook, leer el dueño del archivo desde node, si escribir en la carpeta pide permiso.
2. Después la construcción y el piloto de un mes en la PC del probador (§5 del diseño: umbrales y corte).
3. **`vibe-kit Flota · Los repos reales a la v3.0.1`**: repo por repo con el OK de Guido (en el TODO).
4. El tag que lleve `reflexion` (y después el buzón): lo decide Guido, con la suite entera y el banco (§6 del ciclo).

## Te espera (Guido)

- Enterarte de las seis decisiones del buzón (las tomó el probador con tu OK): ADR-037 en una pantalla.
- Decidir cuándo sale el tag con `reflexion` (en el TODO).
- La tensión anotada en el acta de la prueba de `reflexion`: con el dueño ausente, "propone y no escribe" deja las propuestas esperando.
- El OK por repo de la flota real · "instalar hooks por PC" en las dos PCs · el clic de P7 (`../vibe-kit-pruebas/rc7/p7-firma/LEEME-P7.txt`).
- **Subir al privado los chats de esta PC** desde una PC con acceso: ids `7f248448-4f66-47cf-90bb-fb0e8e133c00` (la `reflexion`) y
  `0f74d80f-5fc9-4431-a3bc-c5b60d1e9cbd` (esta). La cuenta de GitHub de esta PC no ve ese repo; el diario de misiones tampoco tiene sus filas.

## Cosas que muerden y no están en ningún otro doc

- 🔑 **Identidad de git**: en la PC de Guido, `guido.camera.eq@gmail.com`; nunca `eq.chatgpt`. Esta PC commitea con su propia identidad.
- 🔴 **gitleaks antes de cada push, sobre el rango** (`--log-opts="origin/main..HEAD"`), sin tubería: vibe-kit es público.
- 🔒 **El buzón es material privado**: en el repo, alias y números; nunca la ruta, nombres de personas o PCs, ni contenido de mensajes.
  Para medirlo, leer solo metadatos (tipo, fechas, `de`, `responde_a`), con `py -3 -I` y `encoding='utf-8-sig'` (hay archivos con BOM).
- 🧷 **Un cambio de freno en la madre** va por `cambios.cjs nuevo` (`--toca frenos`) → `cambios.cjs aprobar` **desde la carpeta, sin
  `cd`** → recién ahí el commit de la ficha. Los frenos leen la ficha de `origin/main`: sin push, no cambia nada.
- 📏 **El `SKILL.md` del Equipador tiene tope** (10.202 bytes, `skill.test.cjs`; hoy 10.166): nombrar la skill `buzon` lo pasa.
- 🐍 **Python**: `py -3`; para los `.jsonl`, `py -3 -I` con `sys.stdout.reconfigure(encoding="utf-8")`.
- 💻 **La terminal de Guido es PowerShell 5.1**: si queda una línea para él, en PowerShell y sin `&&` (mejor: ninguna).
- 🧱 **El clasificador del modo `auto`** frena a veces escribir `~/.claude/settings.json` y abrir sesiones nuevas desde un director.
- 🧪 **Nunca dos tandas pesadas a la vez**. La suite entera tarda ~90 min; la de tiempo de `cambios-flota` falla con carga y sola pasa.
- 🗂️ La prueba de la beta sigue en la rama `prueba/juan` (y el tag `archivo/prueba-juan-2026-11-06`); desde ahí no se toca `main`.
- 🚪 **No le marques a Guido tareas de sus otros repos** desde acá (su regla, 2026-11-10): lo que se vea allá va al tracker.

## Bloqueos

Ninguno.
