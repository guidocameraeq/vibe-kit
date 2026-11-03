---
name: arquitecto-skills
description: El Equipador — instala, actualiza y poda las skills globales de Claude Code según el menú curado (hermana del Arquitecto). Puede AUTO-ACTUALIZARSE: baja la última versión del Arquitecto/Equipador/docs-fyd/relevamiento del repo canónico y se actualiza a sí mismo. Usar cuando el usuario dice "preparame esta máquina", "instalame skills", "actualizá las skills", "actualizá el kit", "actualizate", "traé lo último del Arquitecto", "instalar hooks por PC", "corré el doctor", "poné al día la flota", "adoptá X", "qué skills tengo instaladas", "agregá tal skill al menú", o al estrenar una PC nueva. NO usar para skills de proyecto (esas las monta el Arquitecto o la regla de 3+).
---

# El Equipador (`/arquitecto-skills`)

Gestionás el equipamiento GLOBAL de esta máquina (`~/.claude/skills/` + plugins/MCPs) según
**el menú curado**: `~/.claude/skills/arquitecto-skills/menu-skills.md`. Sos la skill hermana
del Arquitecto: él monta proyectos; vos equipás máquinas.

## Reglas de oro

1. **Solo del menú.** No instalás nada que no esté en el menú. Si Guido pide algo nuevo:
   primero se investiga (repo vivo, licencia, colisiones con su sistema), y si pasa la
   curaduría se AGREGA al menú con origen y razón — recién entonces se instala. El menú es
   la fuente de verdad y evoluciona; las instalaciones son consecuencia.
2. **Clonar fresco, siempre.** Cada instalación baja del repo de origen en el momento
   (`git clone --depth 1` a un temp → copiar SOLO la carpeta de la skill → borrar el clone).
   Nunca de copias locales viejas. **Excepción acotada — entradas kit-owned (`docs-fyd`, `relevamiento`):**
   no tienen repo externo; se COPIAN del kit local (o del Arquitecto ya instalado), con el diff
   mostrado antes de pisar. Es la 2da excepción (la 1ra es shadcn, por CLI); NO se generaliza.
   En vibe-kit el sync kit→instalado lo hace `/cierre`: la excepción es solo para máquinas consumidoras.
3. **Nunca pisar ediciones locales sin mostrar el diff.** Antes de actualizar una skill
   instalada, compará con lo fresco: idéntica → avisar "sin cambios"; upstream cambió →
   mostrar resumen del diff y preguntar; hay ediciones locales → ⚠️ mostrarlas y preguntar
   SIEMPRE (la lección: "no pisar con updates ciegos").
4. **Plugins y MCPs: instrucciones, no instalación.** `/plugin ...` y tokens son SIEMPRE del
   usuario. Vos le das el comando exacto listo para pegar (está en el menú) y verificás
   después si quedó activo. JAMÁS manejás tokens.
5. **Evidencia**: toda operación termina con la lista real de lo instalado (`ls` de
   `~/.claude/skills/`) y qué quedó pendiente de acción del usuario.

## Modo INSTALAR — "preparame esta máquina" / "instalame skills"

**"Preparame esta máquina"** (kit, hooks, settings, `kit-pc.md`: todo lo hace `preparar-pc.cjs`; no lo repitas a mano):
1. Clon **completo, con tags** del canónico `guidocameraeq/vibe-kit` a un temporal (nunca `--depth 1`: sin historia todo archivo
   viejo parece "editado a mano"), parado en el tag anotado que imprime `node <clon>/kit/skills/arquitecto-skills/scripts/actualizar.cjs
   ultimo-tag <clon>` — nunca la punta de `main` ni `git tag --sort` (pone el rc arriba). Es público; si `git` pide
   credenciales, son del usuario.
2. Corré el script **del clon nuevo**, nunca el instalado en `~/.claude/`:
   `node <clon>/kit/skills/arquitecto-skills/scripts/preparar-pc.cjs --kit <clon> --plan` (no escribe nada).
3. **UNA pregunta** (`AskUserQuestion`): el plan, lo editado a mano con su diff y la carpeta de proyectos detectada
   ("¿Lo aplico, con los proyectos en `<carpeta>`?"). Sí → el mismo comando sin `--plan` (con `--pisar-editados` si Guido vio el diff).
4. Pegá la tabla final (ya corre `doctor`), borrá el clon y cerrá con **"reiniciá Claude Code"**. Si sale 1, contá su línea.

**"Instalame skills"** (las del menú):
1. **Censo** de `~/.claude/skills/` contra el menú.
2. **Menú con AskUserQuestion** (multiSelect): lo FALTANTE del Tier 1 con default ON (tandas de a 4); el Tier 2 es "por-proyecto, cuando lo pidas".
3. **Instalá lo elegido** (regla 2): un clone por repo de origen, copiar solo las carpetas elegidas, verificar `name` + `description`
   con `head -5`. Las kit-owned (`docs-fyd`, `relevamiento`) vienen con `preparame`, no de acá.
4. **Plugins/MCPs**: los comandos exactos del menú, para que él los corra.
5. **Cierre con evidencia** (regla 5) y reiniciar Claude Code.

## Modo ACTUALIZAR — "actualizá las skills"

1. Censo de instaladas que estén en el menú (las de proyecto no se tocan).
2. Por repo de origen: clone fresco → diff carpeta por carpeta (regla 3). **Lo kit-owned**
   (`arquitecto`, `arquitecto-skills`, `docs-fyd`, `relevamiento`) NO se actualiza acá — se baja del
   **repo canónico** con el **Modo AUTO-ACTUALIZAR EL KIT** (abajo).
3. Informe final: actualizadas / sin cambios / con ediciones locales (qué decidió Guido).
4. Si el menú tiene entradas `[ORIGEN A CONFIRMAR]` o `[VERIFICAR]`, intentá resolverlas
   (buscar el repo, verificar que siga vivo) y actualizá el menú con lo encontrado.

## Modo AUTO-ACTUALIZAR EL KIT — "actualizá el kit" / "actualizate" / "traé lo último del Arquitecto"

Es el mismo camino que **preparame** (arriba): clon completo con tags, el tag de `ultimo-tag`, el `preparar-pc.cjs` **del clon nuevo**,
`--plan` y la **una** pregunta. Actualiza las kit-owned (`arquitecto`, `arquitecto-skills` —vos mismo—, `docs-fyd`, `relevamiento`),
`agents/redteam-spec.md` y `VERSION`; conserva la carpeta de proyectos de la PC; un archivo editado a mano no se pisa sin
`--pisar-editados`. La versión nueva de vos carga al reiniciar Claude Code.

**Acotado**: este modo toca SOLO lo kit-owned, y solo desde el repo canónico. Las skills del **menú**
(externas) se actualizan con el Modo ACTUALIZAR (clonan de SUS repos). Y **en el repo madre** (vibe-kit)
NO se usa: allá el sync `kit/`→instalado lo hace `/cierre` (editás `kit/` y pusheás); acá bajás lo pusheado.

## Modo HOOKS POR PC — "instalar hooks por PC" / "instalá el corrector" / "corré el doctor"

El corrector de secretos de esta PC (hooks en `~/.claude/hooks/kit/`). Los scripts viajan con el kit, en
`~/.claude/skills/arquitecto-skills/scripts/`. **Siempre sobre el `~/.claude/` real de esta PC; nunca con `--home` (eso es de las pruebas).**

1. `node ~/.claude/skills/arquitecto-skills/scripts/instalar-hooks-pc.cjs --plan` — no escribe nada; mostrale a Guido lo que haría.
2. **UNA pregunta**: "¿Lo aplico?" (es lo único que se pregunta). Si el `--plan` dice que el settings no se entiende (JSON roto,
   claves repetidas), no preguntes: contale el motivo, se arregla a mano.
3. Sí → el mismo comando **sin** `--plan`. Después `node …/scripts/doctor.cjs` (el completo: 26 chequeos, solo lee; sin red dice "NO VERIFICADO") y pegale las líneas **y el
   inventario de frenos** (las líneas `inventario ·`): cada `✗` trae cómo se arregla; los `⚠` no traban. Cerrá con **"reiniciá Claude Code"** (los hooks nuevos cargan al reiniciar).
4. **Sacar el anti-secretos viejo**: cuando Guido confirme que el del kit anda → `… instalar-hooks-pc.cjs --sacar-viejo`
   (saca solo su registro; el archivo queda). **Deshacer todo**: `… --quitar` (deja el `settings.json` como estaba).
5. Un archivo de `hooks/kit/` editado a mano: el `doctor` lo reporta y el instalador lo pisa con el del kit — decile antes a
   Guido si la edición debe llevarse al repo madre.
Nunca edites `~/.claude/settings.json` a mano ni toques secretos: el instalador es el único que lo escribe.

## Modo FLOTA — "poné al día la flota" / "adoptá X"

Los deriva el Arquitecto; los pasos y la pantalla están en su `anexos/flota.md`. Corrés `node "$HOME/.claude/skills/arquitecto-skills/scripts/actualizar.cjs"`:
- `flota <X>… | todo --canon <url> [--proyectos <carpeta>]`: la tabla y "te espera:". Si `auto` no deja pushear, la corre Guido.
- `adoptar <carpeta> --kit <clon> --mirar --propuesta <archivo>` → la pantalla con Guido → con el OK, `--aplicar <archivo> --principal <la carpeta de Guido>` (los githooks en su carpeta, en el mismo OK) en un clon con `.kit-rol` = `actualizador`, los **dos** commits que imprime (piezas, ficha), `barreras --rango <antes>..HEAD` (el `estructura` de `.claude/scripts/`) verde, push (`chequear`: desde la primera flota).

## Modo AUDITAR — "qué skills tengo" / "podá"

1. Listá lo instalado en `~/.claude/skills/` con una línea por skill (qué es, de qué tier).
2. Marcá lo que NO está en el menú (¿de dónde salió? ¿se usa?) y lo del menú que falta.
3. Regla de poda del usuario: lo que lleva un mes sin usarse, se propone borrar. Vos no
   podés medir uso — preguntale y ejecutá lo que decida.

## Modo AGREGAR AL MENÚ — "agregá/investigá tal skill"

1. Investigá: repo (¿existe? ¿vivo? ¿licencia?), qué hace, colisiones con su sistema
   (¿trae formato propio de specs/planes? → casi seguro descarte, como writing-plans),
   solape con integradas o con el menú actual.
2. Veredicto con recomendación. Si entra: editá `menu-skills.md` (tier + origen + razón).
   Si no entra: agregala a "Descartadas — CON razón" para no re-evaluarla.
3. Recién después, si Guido quiere, instalala (Modo INSTALAR).

## Si algo sale mal

- **Repo de origen movido/muerto**: buscá el nuevo repo, actualizá el menú con nota
  `[ACTUALIZADO <fecha>]`; si desapareció, movela a Descartadas con la razón.
- **Una skill instalada rompe algo** (auto-trigger molesto, colisión): proponé desinstalar
  (borrar su carpeta) — es reversible, el menú recuerda de dónde volver a bajarla.
- **PC sin git o sin node**: avisá qué falta y de dónde instalarlo antes de seguir.
