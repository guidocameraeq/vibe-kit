---
name: inicio
description: Ritual de inicio de sesión del repo vibe-kit — cruzar el handoff inyectado con la realidad (git, diff kit↔instalado, tandas sin procesar), confirmar en 3 líneas y esperar la misión. Usar cuando Guido dice "inicio", "retomemos", "arranquemos", "¿en qué quedamos?" o al abrir una sesión de trabajo nueva acá.
---

# /inicio — arrancar una sesión en el proyecto madre

El hook SessionStart ya inyectó `SESSION_HANDOFF.md` + los pendientes de `docs/TODO.md` + los últimos
commits al abrir este chat. **NO los releas** — es costo puro de contexto. Releé el archivo solo
ante señal de drift (fecha vieja, contradicción con git) o si el hook no aparece en el contexto.
**Si dice `CORTADO`, o falta la huella** (`inyectado: N caracteres de 10000`, la última línea), leé
lo que falta con Read antes de confirmar, y el `/cierre` achica el handoff o el TODO.

## Pasos

1. **Cruzar el handoff con la realidad** (barato, todo local — mostrar solo lo que llame la atención):
   - `git status -sb` → ¿working tree limpio? ¿`main` = `origin/main`? ¿el último commit coincide
     con el handoff?
   - **`bash .claude/scripts/kit-sync.sh`** (compara las 5 rutas canónicas kit↔`~/.claude/`, ignorando
     la carpeta de proyectos de cada PC) → **el drift más peligroso de este repo**: si no da `LIMPIO`,
     alguien editó `~/.claude/` directo (prohibido) o quedó un cierre a medias. FRENAR y mostrarlo
     antes de trabajar — nunca pisar a ciegas en ninguna dirección.
   - ¿Hay tandas en `tips/` con propuestas sin procesar (checkboxes `- [ ]` sin marcar)? → es
     trabajo pendiente que el handoff puede no mencionar.
2. **Confirmar en 3 líneas**: **Estado** / **Próxima acción** (del handoff y los pendientes de
   `docs/TODO.md`) / **Bloqueos**. Si no dio la misión, preguntarla.
3. **NO tocar nada hasta el OK explícito de Guido.**
4. **Con la misión confirmada, ponerle nombre a esta sesión**: el título exacto que trae el "próximo
   paso" del handoff (si no trae, armarlo con la convención `vibe-kit M<n> · <qué hace>`). Se pone con
   `mcp__ccd_session_mgmt__set_session_title`, con `session_id` `"self"`, para que en la misión 6 se
   sepa qué hizo cada sesión. Si la herramienta no está (CLI u otra app), avisarlo en una línea y seguir.

## Reglas

- **Una sesión = una misión.** Si a mitad aparece una misión distinta de verdad, proponer
  `/cierre` y chat nuevo.
- Handoff de más de 7 días → avisar que puede estar viejo y confiar en git, no en él.
- Este repo MANTIENE el método; las apps se construyen en sus propios proyectos. Si la misión
  es "construir una app" → es `/arquitecto` en otro lado, no acá.
