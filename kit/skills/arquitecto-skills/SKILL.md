---
name: arquitecto-skills
description: El Equipador — instala, actualiza y poda las skills globales de Claude Code según el menú curado (hermana del Arquitecto). Usar cuando el usuario dice "preparame esta máquina", "instalame skills", "actualizá las skills", "qué skills tengo instaladas", "agregá tal skill al menú", o al estrenar una PC nueva. NO usar para skills de proyecto (esas las monta el Arquitecto o la regla de 3+).
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
   Nunca de copias locales viejas.
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

1. **Censo**: listá `~/.claude/skills/` y compará contra el menú (qué hay, qué falta).
2. **Menú con AskUserQuestion** (multiSelect): ofrecé lo FALTANTE del Tier 1 con default ON
   (en tandas de a 4 si son muchas), y mencioná el Tier 2 como "por-proyecto, cuando lo pidas".
3. **Instalá lo elegido** (regla 2): un clone por repo de origen (varias skills del mismo
   repo = un solo clone), copiar las carpetas elegidas, verificar frontmatter (`name` +
   `description` presentes) con `head -5`.
4. **Plugins/MCPs elegidos**: entregá los comandos exactos del menú para que él los corra.
5. **Cierre con evidencia** (regla 5) + si en esta máquina existe el PLAYBOOK-MAESTRO,
   actualizá su "Nota de máquina" (§2.3) con el set nuevo — es la única línea-fuente.
   Recordale: reiniciar Claude Code para que las skills nuevas aparezcan.

## Modo ACTUALIZAR — "actualizá las skills"

1. Censo de instaladas que estén en el menú (las de proyecto no se tocan).
2. Por repo de origen: clone fresco → diff carpeta por carpeta (regla 3).
3. Informe final: actualizadas / sin cambios / con ediciones locales (qué decidió Guido).
4. Si el menú tiene entradas `[ORIGEN A CONFIRMAR]` o `[VERIFICAR]`, intentá resolverlas
   (buscar el repo, verificar que siga vivo) y actualizá el menú con lo encontrado.

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
