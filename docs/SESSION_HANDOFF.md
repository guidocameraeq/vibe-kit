# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo
> inyecta en cada chat nuevo de esta carpeta.

**Última sesión cerrada:** 2026-10-14, PC `clientes` (`D:\vibe-kit`). **Misión 4, tramo 1 hecho: la
radiografía del sistema director/obrero** ([`docs/mision-4/RADIOGRAFIA-director-obrero.md`](mision-4/RADIOGRAFIA-director-obrero.md)).
Fue solo diseño: no tocó `kit/` ni ningún proyecto. El kit sigue sin bump (`v2.4.2`).

## Qué salió

- **La radiografía** (~30 KB). La hicieron 2 lectores Opus en paralelo, uno por Hermes, por ~452 mil
  tokens (lo estimado). Compara lo escrito con lo comportado, trae 10 hallazgos nuevos y **10 mejoras con
  su línea base medida**, cada una colgada de las propuestas del acta (§10). Esas 10 entran al mapa del
  tramo 3. Los hallazgos fuertes se verificaron en disco antes de escribirlos.
- **En pocas líneas**:
  - el núcleo anda y sirve para cualquier proyecto;
  - lo caro es releer (el director relee ~370 mil tokens por respuesta) y los avisos sin novedad;
  - Guido termina haciendo de operador del sistema;
  - la regla en prosa no frena, y dos reglas causan su propia falla;
  - el método tiene dos dialectos y contradicciones internas;
  - quedan huecos en el esfuerzo (0 menciones), el multi-PC y la seguridad.
- **`PLAN.md`**: el tramo 1 quedó ✅ y se corrigió el brief, que apuntaba al mapa del "tramo 2" cuando es
  el 3. Hay una sección nueva, **"Lecciones para el ciclo"**: cuando Guido dice "anotá esto para el
  ciclo", va ahí. Es la materia prima de la misión 6.
- **La misión 6 entró al TODO**: escribir el ciclo de mejora del método al terminar la 5. Lo pidió Guido a
  través de la sesión de la misión 3.

## Próximo paso concreto: misión 4, tramo 2 (la evidencia de afuera)

**Título de la sesión: `vibe-kit M4 · Tramo 2: evidencia de afuera`** (`/inicio` se lo pone al confirmar).

Chat nuevo acá → `/inicio` → Guido dice **"misión 4, tramo 2"**. El chat arranca leyendo **solo**
`docs/mision-4/PLAN.md` y la radiografía. El brief está en la fila del tramo 2 del PLAN:
- **(0) Inventario de la flota**, por script (casi gratis).
- **(a) Qué ofrece hoy la plataforma**, con el agente `claude-code-guide` (~100 mil tokens: **confirmar
  antes**). **Sumarle** las 4 preguntas de la radiografía (§10, "Para el tramo 2"): abrir una pestaña con
  modelo y esfuerzo, suscribirse a avisos, ver el estado de las sesiones y mandar mensajes entre PCs.
- **(b) Evidencia de los repos**, por script sobre git.

Sale con `FLOTA.md`, `PLATAFORMA.md` y `REPOS.md`. Después vienen el mapa (tramo 3), el diseño (tramo 4)
y el spec (tramo 5). **Orden fijo: diseño → spec → construcción** (la construcción es la misión 5).

## Cosas que muerden y no están en ningún otro doc

- 🔐 **Alertas de seguridad abiertas** de Hermes (el detalle, solo en el archivo privado
  `D:\vibe-hallazgos\ALERTAS-SEGURIDAD.md`):
  - credenciales que pasaron por chats;
  - `/smoke` de Hermes Desktop con un login real de producción;
  - rotaciones pendientes;
  - **nueva (2026-10-14, verificada en disco)**: una alerta sobre las barreras de permisos de Hermes
    Desktop.

  La misión 4 no toca proyectos: arreglarlas es una decisión de Guido en el chat de cada Hermes. **Rotar
  o arreglar: NO VERIFICADO.**
- 📏 **Hermes Mobile**: el método vigente está en `main`, pero su bitácora vive en una rama propia. Ahí
  están los documentos grandes de verdad (encargos de 703 KB, diario de ~915 KB); en `main` hay copias
  viejas. Antes de medir un documento, mirar en qué rama vive.
- 🖥️ **La PC `Usuario` está desfasada** hasta que le diga `actualizate` al Equipador. Ahí hay que mirar
  que la línea "Carpeta de proyectos" del Arquitecto **siga con su ruta** y no con
  `{{CARPETA_DE_PROYECTOS}}`. El Equipador lo tiene escrito, pero en esa PC está **NO VERIFICADO**. Si
  quedara vacía, el Arquitecto pregunta solo y se corrige en una línea.
- 📦 **`D:\vibe-hallazgos\` NO SE BORRA** hasta el final de la hoja de ruta (ADR-022). Tiene los hallazgos
  de las 3 PCs, los condensados, `ya-sabido.md`, `CORTE.md` y `ALERTAS-SEGURIDAD.md` (privado, **no** va
  al repo público). El repo privado `guidocameraeq/vibe-research` también queda de respaldo (con la
  biblioteca del tramo 0).
- 🔴 **vibe-kit sigue PÚBLICO**: los nombres reales (el compañero, clientes, cuentas) no entran. Antes de
  cada push: gitleaks sobre lo agregado (está instalado vía WinGet en esta PC).
- 🖥️ **Mesa entre PCs** por Remote Control: anduvo, pero el permiso no viaja con el mensaje (cada PC da
  su OK) y el clasificador puede frenar copias "sensibles". Va a la misión 4 (P34). La radiografía suma
  que una sesión en otra PC no aparece en la lista de agentes.
- La otra PC se llama `Usuario` (`C:\Users\Usuario\Desktop\Proyectos\vibe-kit`, sin disco D, Python
  3.14). El capataz (P41) no es parte del workflow: fue una idea para un compañero.

## Bloqueos

Ninguno.
