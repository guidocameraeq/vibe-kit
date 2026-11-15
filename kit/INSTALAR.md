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

## Dos cosas que el script no hace solo (las hace la sesión, con vos)

- **La identidad de git** y **los programas que falten** (node, git, `gh`, gitleaks) no los pone el script: los mira, y la sesión
  los resuelve con vos. Te pregunta tu nombre y tu mail y los escribe ella; lo que falte instalar lo instala con tu OK; para entrar
  a GitHub te abre el navegador y te da un código para pegar ahí. No tenés que tipear ningún comando.

*Hasta la `rc.6` este archivo era un prompt para instalar desde un zip copiando las skills a mano (sin los frenos de la PC ni
`kit-pc.md`). Quedó afuera: el camino es uno solo (SPEC-paquete-8d, C5). Lo viejo está en la historia de git de este archivo.*
