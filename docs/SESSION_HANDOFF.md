# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**Última sesión cerrada:** 2026-10-28, misión 4½ y su cola: **`v2.4.3`**, el tracker de la misión 5 y **ADR-028** (un director por paquete).
PC `clientes`. `kit-sync` LIMPIO. Detalle: CHANGELOG del 2026-10-27 (misión 4½) y del 2026-10-28.

## Dónde estamos

- **`v2.4.3`**: el hook de arranque del molde (y el de acá) corta el handoff a 5.500 bytes con aviso "CORTADO", muestra 30 líneas
  del TODO y termina con la huella `inyectado: N caracteres de 10000`. Acá bajó de 10.199 a ~7.700.
- Los chats de la misión 4 y los 4 informes de revisión del spec se mudaron al repo privado de investigación, con el **diario de
  misiones** (una fila por sesión; el `/cierre` la suma). Legacy con lápida e índice; `docs/README.md`, guía, manual y portada al día.
- **El tracker de la misión 5** y **ADR-028**: cada paquete lo lleva **un director Opus** que reparte encargos a subagentes (Sonnet lo
  mecánico, Opus lo de riesgo), lee cada diff y corre las pruebas él. **13 directores** en vez de ~20 sesiones.
- Hoja de ruta ADR-025: 4 ✅ → 4½ ✅ → **5 construir v3.0 (por `docs/kit-v3/SPEC-0-kit-v3.md`)** → 6 el ciclo → 7 mensajería v3.1.

## Próximo paso: misión 5, director D1.1

**Título: `vibe-kit M5 · D1.1 · Paquete 1: la ficha del kit y su parser`**, en **Opus**. **El tracker manda**:
[`docs/kit-v3/PLAN-construccion.md`](kit-v3/PLAN-construccion.md), sección "Cómo se trabaja": los 8 pasos del director y sus límites
(no edita código; frena para el sello; el resumen de un subagente no es evidencia). La línea para abrir:
`inicio — misión 5, paquete 1: la ficha del kit y su parser (docs/kit-v3/SPEC-0-kit-v3.md, orden 1)`.
D1.1 = spec delta del paquete 1 (lo sella Guido a mano) con su lista de encargos, y la construcción: ficha con `kit.ejemplo.md`, parser,
`kit/VERSION`, `pruebas/rehacer.sh`. Al cerrar, su fila con cuántos encargos lanzó y en qué modelo.

## Cosas que muerden y no están en ningún otro doc

- 🔑 **Identidad de git**: en `clientes` el mail es el `noreply` de `guidocameraeq` (vale). Nunca `eq.chatgpt`.
- 🧪 **El hook nuevo no se vio todavía en un chat de verdad**: en el próximo `/inicio`, la última línea inyectada tiene que ser la huella.
- 🕵️ **Los racimos A, C y E**: sus commits firman con la cuenta del compañero y sus chats no aparecen en ninguna PC. En el diario
  quedaron NO VERIFICADO. Si aparecen, se condensan y van al privado.
- 🗄️ **`D:\vibe-research\clientes\redteam-kit-v3\`** sigue en disco aunque ya está en el privado: nada se borra hasta cerrar la 5.
- 📬 **El Hub pushea a este repo desde otra sesión**: `git fetch` antes de cerrar.
- 🔴 **vibe-kit es PÚBLICO**: gitleaks antes de cada push. 🔐 **12 alertas abiertas**, las arregla Guido.
- 🧪 **Antes del piloto, trabajo de Guido** (spec, "Lo que hacés vos de nuevo"): credenciales de escritura de 5 proyectos al almacén en 2 PCs,
  usuario de solo lectura por base real, "preparame esta PC" en la del compañero.

## Bloqueos

Ninguno.
