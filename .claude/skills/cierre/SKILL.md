---
name: cierre
description: Cierre de sesión del repo vibe-kit — sincronizar kit a ~/.claude con diff verificado, docs al día (handoff/CHANGELOG/TODO/ADR/REJ), commit + push. Usar cuando Guido dice "cierre", "cerrá la sesión", "guardá todo" o termina una misión en este repo. Modo "cierre parcial" si hay que compactar a mitad de trabajo.
---

# /cierre — el ritual de cierre del proyecto madre

Mismo esqueleto que el `/cierre` que el Arquitecto monta en cada proyecto
(`kit/skills/arquitecto/templates/universales/skills/cierre/`), más el sync del kit. Pasos en orden,
mostrando evidencia de cada uno:

1. **¿Se tocó `kit/`?** → sincronizar a la copia instalada y VERIFICAR, con el script (ADR-023):
   - **Primero** `bash .claude/scripts/kit-sync.sh` (solo compara). Lo sucio tiene que ser
     **exactamente** lo que esta sesión cambió en `kit/`. Si aparece otra cosa, alguien editó
     `~/.claude/` directo: FRENAR y mostrarlo (hay que rescatarlo hacia el repo antes de pisar).
   - **Después** `bash .claude/scripts/kit-sync.sh sync` → copia y vuelve a comparar. **Debe terminar
     en `LIMPIO`**; mostrar la salida. Sin LIMPIO no hay cierre. La carpeta de proyectos de cada PC
     la conserva el script: no se toca a mano.
2. **`docs/SESSION_HANDOFF.md`** — sobreescribir ENTERO (estado / próximo paso concreto / bloqueos /
   contexto que no está en otros docs). Es la única narrativa de la sesión. El próximo paso lleva el
   **título exacto de la sesión siguiente** (`vibe-kit M<n> · <qué hace>`), que `/inicio` le pone.
3. **`docs/CHANGELOG.md`** — entrada nueva AL TOPE: `## YYYY-MM-DD — <tema>` (+ ` · vX.Y` si hubo tag),
   con Added / Changed / Fixed / Removed según corresponda.
4. **`docs/TODO.md`** — lo completado SALE (la historia queda en el CHANGELOG); lo nuevo entra con su
   prioridad. El header es solo `YYYY-MM-DD — ver SESSION_HANDOFF.md`.
5. **Otros docs**:
   - ¿Hubo decisión con alternativas? → ADR nuevo en `docs/DECISIONS.md` (correlativo) **+ su línea
     en el índice** del tope.
   - ¿Se descartó algo a nivel proyecto? → REJ nuevo en `docs/REJECTED.md`.
   - ¿Archivo nuevo en `docs/`? → su fila en `docs/README.md`.
   - **¿Esta sesión sacó una capacidad nueva de cara al usuario** (skill/modo/flujo nuevo, o cambió
     cómo se usa algo)? → actualizá `GUIA-DE-USO.md` (receta por situación + la chuleta de frases) y
     `manuales/` si aplica. **Sacar un release incluye que Guido pueda descubrir la capacidad nueva
     por la guía** — si no, el release quedó a medias.
   - **SPEC implementado** → `Estado: ✅ IMPLEMENTADO <fecha>` y **se queda en `docs/`** (ADR-020: acá
     no se archiva, a diferencia de los proyectos).
6. **Memoria**: si cambió un hecho estructural del proyecto (release, pieza nueva, regla
   nueva), actualizar la memoria persistente.
7. **Commit + push**: mensaje descriptivo en español. Si la máquina no tiene identidad de
   git configurada (`git config user.name` vacío), commitear con
   `git -c user.name="Guido" -c user.email="guido.camera.eq@gmail.com" commit ...` (la cuenta de Guido; **nunca** `eq.chatgpt@gmail.com`, que es la del plugin v1) y sugerir
   configurarla global una sola vez. Verificar `git status` limpio y `main...origin/main`
   sin diferencias. Reportar el SHA.
   - **Versión (si amerita):** ¿la sesión sacó una **capacidad nueva** o un cambio grande de cara al
     usuario? → bump + **git tag anotado** sobre el commit del cierre: `vX.Y` — subí el **MINOR** para
     capacidades nuevas compatibles (v2.1 → v2.2), un **3er número** para fixes (v2.2.1), **MAJOR**
     para algo que cambia cómo se usa todo (v3). `git tag -a vX.Y -m "<qué trae>"` → `git push origin
     vX.Y`, y la entrada del CHANGELOG lleva el ` · vX.Y`. **El README no lleva versión** (playbook
     §1: sin números que roten). Un fix chico o doc-only **NO** amerita bump.
8. **Cierre**: resumen de 3 líneas + "chat listo para descartar".

## Modo `cierre parcial` (emergencia pre-compactación)

Contexto lleno a mitad de misión → SOLO el paso 2 (handoff con el trabajo a medias y el
próximo paso concreto) + avisar que está listo para `/compact`. Sin push obligatorio.

## Reglas

- Si el diff kit↔instalado da sucio y no sé por qué: FRENAR y mostrar — nunca pisar a ciegas
  en ninguna dirección (puede haber una edición directa a `~/.claude/` que hay que rescatar
  hacia el repo primero).
- Los informes de `tips/` no se tocan en el cierre (son actas).
