---
name: cierre
description: Cierre de sesión del repo vibe-kit — sincronizar kit a ~/.claude con diff verificado, regenerar zip si cambió el kit, docs al día (handoff/ADR/REJ), commit + push. Usar cuando Guido dice "cierre", "cerrá la sesión", "guardá todo" o termina una misión en este repo. Modo "cierre parcial" si hay que compactar a mitad de trabajo.
---

# /cierre — el ritual de cierre del proyecto madre

Pasos en orden, mostrando evidencia de cada uno:

1. **¿Se tocó `kit/`?** → sincronizar a la copia instalada y VERIFICAR:
   - `cp -r` de `kit/skills/arquitecto`, `kit/skills/arquitecto-skills` y `kit/skills/docs-fyd` → `~/.claude/skills/`
   - `cp kit/agents/redteam-spec.md` → `~/.claude/agents/`
   - `diff -r` de las **4 rutas canónicas** (`kit/skills/arquitecto`, `kit/skills/arquitecto-skills`,
     `kit/skills/docs-fyd` y `kit/agents/redteam-spec.md`) contra su copia en `~/.claude/` → **debe dar
     limpio**; mostrar el resultado. Sin diff limpio no hay cierre.
2. **¿Cambió el kit?** → regenerar el zip portable, SOLO si esta máquina tiene la carpeta
   `$HOME/Desktop/Arquitecto en otras PCs/` (existe en la PC principal; en otras PCs este
   paso se saltea sin drama):
   `powershell Compress-Archive -Path 'kit\*' -DestinationPath "$env:USERPROFILE\Desktop\Arquitecto en otras PCs\arquitecto-portable.zip" -Force`
3. **Docs al día**:
   - `docs/SESSION_HANDOFF.md` — sobreescribir ENTERO (estado / próximo paso concreto /
     bloqueos / contexto que no está en otros docs).
   - ¿Hubo decisión con alternativas? → ADR nuevo en `docs/DECISIONS.md` (correlativo).
   - ¿Se descartó algo a nivel proyecto? → REJ nuevo en `docs/REJECTED.md`.
   - ¿Cambiaron los pendientes? → sección Pendientes del `README.md` (única fuente).
   - **¿Esta sesión sacó una capacidad nueva de cara al usuario** (skill/modo/flujo nuevo, o cambió
     cómo se usa algo)? → actualizá las **guías cara-al-usuario**: `GUIA-DE-USO.md` (receta por
     situación + la chuleta de frases mágicas) y `guias/` si aplica. **Sacar un release incluye que
     Guido pueda descubrir la capacidad nueva por la guía** — si no, el release quedó a medias.
4. **Memoria**: si cambió un hecho estructural del proyecto (release, pieza nueva, regla
   nueva), actualizar la memoria persistente.
5. **Commit + push**: mensaje descriptivo en español. Si la máquina no tiene identidad de
   git configurada (`git config user.name` vacío), commitear con
   `git -c user.name="Guido" -c user.email="eq.chatgpt@gmail.com" commit ...` y sugerir
   configurarla global una sola vez. Verificar `git status` limpio y `main...origin/main`
   sin diferencias. Reportar el SHA.
6. **Cierre**: resumen de 3 líneas + "chat listo para descartar".

## Modo `cierre parcial` (emergencia pre-compactación)

Contexto lleno a mitad de misión → SOLO el paso 3a (handoff con el trabajo a medias y el
próximo paso concreto) + avisar que está listo para `/compact`. Sin push obligatorio.

## Reglas

- Si el diff kit↔instalado da sucio y no sé por qué: FRENAR y mostrar — nunca pisar a ciegas
  en ninguna dirección (puede haber una edición directa a `~/.claude/` que hay que rescatar
  hacia el repo primero).
- Los informes de `tips/` no se tocan en el cierre (son actas).
