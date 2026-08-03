---
name: inicio
description: Ritual de inicio de sesión del repo vibe-kit — cruzar el handoff inyectado con la realidad (git, diff kit↔instalado, tandas sin procesar), confirmar en 3 líneas y esperar la misión. Usar cuando Guido dice "inicio", "retomemos", "arranquemos", "¿en qué quedamos?" o al abrir una sesión de trabajo nueva acá.
---

# /inicio — arrancar una sesión en el proyecto madre

El hook SessionStart ya inyectó `SESSION_HANDOFF.md` + los pendientes del README + los últimos
commits al abrir este chat. **NO los releas** — es costo puro de contexto. Releé el archivo solo
ante señal de drift (fecha vieja, contradicción con git) o si el hook no aparece en el contexto.

## Pasos

1. **Cruzar el handoff con la realidad** (barato, todo local — mostrar solo lo que llame la atención):
   - `git status -sb` → ¿working tree limpio? ¿`main` = `origin/main`? ¿el último commit coincide
     con el handoff?
   - **`diff -r kit/skills/arquitecto ~/.claude/skills/arquitecto`** (+ `arquitecto-skills`,
     `docs-fyd`, `relevamiento` y `agents/redteam-spec.md` — las **5 rutas canónicas**) → **el drift más peligroso de
     este repo**: si da sucio, alguien editó `~/.claude/` directo (prohibido) o quedó un cierre a
     medias. FRENAR y mostrarlo antes de trabajar — nunca pisar a ciegas en ninguna dirección.
   - ¿Hay tandas en `tips/` con propuestas sin procesar (checkboxes `- [ ]` sin marcar)? → es
     trabajo pendiente que el handoff puede no mencionar.
2. **Confirmar en 3 líneas**: **Estado** / **Próxima acción** (del handoff y los pendientes del
   README) / **Bloqueos**. Si no dio la misión, preguntarla.
3. **NO tocar nada hasta el OK explícito de Guido.**

## Reglas

- **Una sesión = una misión.** Si a mitad aparece una misión distinta de verdad, proponer
  `/cierre` y chat nuevo.
- Handoff de más de 7 días → avisar que puede estar viejo y confiar en git, no en él.
- Este repo MANTIENE el método; las apps se construyen en sus propios proyectos. Si la misión
  es "construir una app" → es `/arquitecto` en otro lado, no acá.
