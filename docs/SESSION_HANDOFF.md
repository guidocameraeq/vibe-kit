# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo
> inyecta en cada chat nuevo de esta carpeta.

**Última sesión cerrada:** 2026-10-13, PC `clientes` (`D:\vibe-kit`) — **misión 2 de 5 hecha: la
investigación de los chats.** Kit sin cambios (`v2.4.2`). Nuevo en el repo:
`tips/tanda-2026-10-chats.md` (el informe), `investigacion/` (scripts + `costos.md` + `LECTOR.md`),
ADR-022.

## Qué salió

- **68 hallazgos de las 2 PCs de Guido** (26 nuevos, 42 ya sabidos por las bitácoras de Hermes) +
  **un anexo de la PC del compañero de trabajo** (30 hallazgos, con su consentimiento, acotado a
  "cómo usa el kit"). **57 propuestas con checkbox** (P1-P57) → insumo de la misión 4.
- La idea fuerza: **las reglas escritas en prosa se siguen rompiendo; solo frenó lo mecánico**
  (script, hook, campo obligatorio). Y 13 problemas de Guido **se repiten en el compañero** → son del
  kit, no de Guido.
- **El estreno de `/relevamiento` existió, en la PC del compañero**: 7 chats, ninguno de punta a
  punta (Anexo A1). En las PCs de Guido: 0 invocaciones.
- **Costo (Q1)**: el 98% es relectura de caché; el director Opus relee ~370 mil tokens por respuesta.
  La investigación costó ~37 M tokens medidos (esta PC ~27 M + la del compañero ~9,5 M; la Etapa 1 de la otra PC de Guido, NO MEDIDA).

## Próximo paso concreto: la misión 3

Abrir un chat nuevo acá → `/inicio` → *"misión 3: profesionalizar vibe-kit"* (pasar el Arquitecto
por este repo: norte, estructura, docs, README). La misión 4 (diseñar el pack **con Guido adentro**,
recorriendo las 57 propuestas) viene después.

## Cosas que muerden y no están en ningún otro doc

- 📦 **`D:\vibe-hallazgos\` NO SE BORRA** hasta el final de la hoja de ruta (decisión de Guido,
  ADR-022): hallazgos de las 3 PCs, síntesis parciales, condensados de esta PC (51 MB, secretos
  tapados), `ya-sabido.md` (índice F/CM de Hermes), `CORTE.md` (fecha de corte),
  `ALERTAS-SEGURIDAD.md` (privado: **no** va al repo público). El repo privado
  `guidocameraeq/vibe-research` también queda como respaldo.
- 📅 **Fecha de corte**: clientes 2026-10-12 21:59 UTC · Usuario 2026-10-13 12:04 UTC · compañero
  2026-10-13. La próxima investigación lee solo lo posterior (a `condensar.py` le falta `--desde`).
- 🔴 **vibe-kit sigue PÚBLICO**: los nombres reales (el compañero, clientes, cuentas) no entran.
- 🔐 **Alertas de seguridad abiertas** (detalle solo en el archivo privado): credenciales que pasaron
  por chats de Hermes, la skill `/smoke` de Hermes Desktop con un login real de producción, rotaciones
  pendientes hace un mes. **Rotar: NO VERIFICADO.** Son de Hermes, no de acá.
- 🖥️ **Mesa entre PCs, probada**: Remote Control anduvo ida y vuelta con 2 PCs. Lo que muerde: el
  permiso del usuario no viaja con el mensaje (cada PC necesita su OK y reglas propias); la
  herramienta de borrado de una sesión no borra en la raíz de `C:`; el clasificador puede frenar copias
  de material "sensible" → el humano corre esos pasos a mano. Va a la misión 4 (P34).
- La otra PC de Guido se llama `Usuario` (`C:\Users\Usuario\Desktop\Proyectos\vibe-kit`, sin disco
  D, Python 3.14). El capataz: código **no está en esta PC** y no se ubicó (P41).
- **El diff kit↔instalado en esta PC** sigue sucio por una sola línea (carpeta de proyectos, ADR-021).

## Bloqueos

Ninguno.
