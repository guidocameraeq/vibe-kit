# Instalar el kit en esta PC

> **Hay un solo camino**, el de la sección **"Instalar"** del [`README.md`](../README.md) del repo:
>
> 1. Clonar el repo del kit **completo, con sus tags** (con un zip o un clon `--depth 1`, sin tag o sin historia, `preparar-pc` se
>    niega).
> 2. Abrir Claude Code en esa carpeta y decirle **"preparame esta PC"**.
>
> El Equipador se para en la última versión, te hace una sola pregunta y deja el kit en `~/.claude/`, los frenos de la PC, los ajustes
> de Claude Code y `~/.claude/kit-pc.md`; si querés, trae los repos de tu cuenta. Termina con "reiniciá Claude Code". El paso a paso:
> [`manuales/EQUIPADOR.md`](../manuales/EQUIPADOR.md) §1. ¿Ya lo tenés? **"actualizate"** (§2).

## Dos cosas que "preparame esta PC" no hace

- **La identidad de git.** Si `git config user.name` sale vacío, los commits de `/cierre` fallan en esta PC: configurala una vez
  (`git config --global user.name "<tu nombre>"` y `git config --global user.email "<tu mail>"`).
- **Instalar programas.** Chequea node, git, `gh`, gitleaks y Claude Code y te dice qué falta y de dónde sacarlo, pero no los instala.

*Hasta la `rc.6` este archivo era un prompt para instalar desde un zip copiando las skills a mano (sin los frenos de la PC ni
`kit-pc.md`). Quedó afuera: el camino es uno solo (SPEC-paquete-8d, C5). Lo viejo está en la historia de git de este archivo.*
