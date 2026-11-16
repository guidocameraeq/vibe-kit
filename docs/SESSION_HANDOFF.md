# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**CIERRE** 2026-11-16 a la tarde, del **director del tramo final** (PC `Usuario`, Opus 5.5). **Kit `v3.0.1` publicado** (tag sobre
`5c20e19`, con su página en GitHub). La tanda 1 de la v3 (de la `rc.6` a la `v3.0.1`) está cerrada y su log escrito.

## Dónde estamos

- **Kit `v3.0.1`**: la `v3.0.0` (el código de la `rc.8`) más el hotfix de un arranque propio que se pisaba al adoptar. Notas en
  `kit/CHANGELOG.md`. Esta PC: `kit-sync` LIMPIO; los hooks de la PC dicen 3.0.0 (no cambiaron; da un aviso).
- **El log por tanda**: `docs/kit-v3/TANDAS-DE-VERSIONES.md` (en números, paso a paso y cómo nos fue); con chats y costos en el
  privado (`TANDAS-DE-VERSIONES.md`). Los 18 chats de la tanda están allá; las sesiones del tramo, archivadas.
- **La madre tiene el kit adoptado**: ficha `.claude/kit.md` (estandar), los frenos con el portero; el arranque, `/inicio` y `/cierre`
  son los propios; `docs: no`, candado apagado. Quitados con su razón: `push-otra-rama` (se sube a `main`), `gate:entorno-prueba`
  (la suite tarda ~90 min) y `candado:raiz` (su propio mapa de `docs/`; aprobado `2026-11-16-quitar-arbol-docs-madre`).
  `--verificar`: ⚠ en el arranque (el propio anda) y "el repo quedó andando".
- **El ciclo de mejora**: `docs/CICLO-DE-MEJORA.md` (ADR-035). Las fechas, arriba del TODO: la medición ~2026-12-15, la vuelta 2 el
  2027-03-01.

## Próximo paso

1. **`vibe-kit Flota · Los repos reales a la v3.0.1`**: repo por repo con el OK de Guido (en el TODO, con lo que cambia en cada uno).
2. La falla del kit que vio la madre (en el TODO): adoptar con `docs: no` deja prendido el freno del árbol de `docs/`. Va a la `3.0.2`
   o a la `v3.1`, con el ciclo.
3. **`vibe-kit M7 · La v3.1`** (el buzón, "probar una idea nueva", el PO), con su charla de diseño.

## Te espera (Guido)

- El OK por repo de la flota real.
- En esta PC, "instalar hooks por PC" cuando quiera: solo sube el número a 3.0.1 y saca el aviso.
- En la otra PC (`clientes`): "actualizá el kit" e "instalar hooks por PC".
- El clic de P7 cuando quiera (`../vibe-kit-pruebas/rc7/p7-firma/LEEME-P7.txt`): tilda el criterio 18.

## Cosas que muerden y no están en ningún otro doc

- 🔑 **Identidad de git**: `guido.camera.eq@gmail.com`. Nunca `eq.chatgpt`.
- 🔴 **gitleaks antes de cada push, sobre el rango** (`--log-opts="origin/main..HEAD"`), sin tubería: vibe-kit es público.
- 🧷 **Un cambio de freno en la madre** va por `cambios.cjs nuevo` (`--toca frenos`, sin la ficha en el índice) → `cambios.cjs aprobar`
  **desde la carpeta, sin `cd`** → recién ahí el commit de la ficha. Los frenos leen la ficha de `origin/main`: sin push, no cambia nada.
- 🐍 **Python**: `py -3`; para leer los `.jsonl` de las charlas, `py -3 -I` con `sys.stdout.reconfigure(encoding="utf-8")`.
- 💻 **La terminal de Guido es PowerShell 5.1**: si queda una línea para él, en PowerShell y sin `&&` (mejor: ninguna).
- 🧱 **El clasificador del modo `auto`** frena a veces escribir `~/.claude/settings.json` y abrir sesiones nuevas desde un director;
  archivar sesiones pide reenviar la llamada con el `session` que agrega el hook.
- 🤖 **`start_session` con un modelo más caro que el del que lanza se ignora sin aviso**: verificar con `get_session`.
- 🧪 **Nunca dos tandas pesadas a la vez**. La suite entera tarda ~90 min; la de tiempo de `cambios-flota` falla con carga y sola pasa.
- 🗂️ La prueba de Juan está guardada en el tag `archivo/prueba-juan-2026-11-06`; la rama `prueba/juan` sigue, por si vuelve a subir.
- 🚪 **No le marques a Guido tareas de sus otros repos** desde acá (su regla, 2026-11-10): lo que se vea allá va al tracker.
- 🔒 Los repos del trabajo se leen en copias del scratchpad; a vibe-kit (público) va solo el comportamiento del kit, en abstracto.

## Bloqueos

Ninguno.
