# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**Última sesión cerrada:** 2026-10-28, **misión 5, director D1.1: paquete 1 ✅** (la ficha del kit y su parser). PC `clientes`, Opus.
`kit-sync` LIMPIO. Detalle: CHANGELOG del 2026-10-28 (D1.1) y la fila D1.1 del tracker.

## Dónde estamos

- **Paquete 1 cerrado**: `kit/molde/kit.ejemplo.md` (la forma de la ficha, no plantilla), `kit/molde/hooks/lib/ficha.cjs` (parser, 255
  pruebas), `kit/VERSION` = `2.4.3` (instalado en esta PC), `kit/CHANGELOG.md`, `pruebas/rehacer.sh` (alfa, beta, gama desde `v2.4.2`).
  Plano: `docs/kit-v3/SPEC-paquete-1.md` (✅ IMPLEMENTADO), con "Lo que cambió en la construcción".
- **Decisiones de Guido hoy**: P3.2 (zona propia) y `pruebas/pedidos.md` pasan al **orden 2**; las herramientas van en un **campo aparte**
  `herramientas.<nombre>: {chequeo, necesita-guido}` que cada entorno nombra (tres niveles).
- Hoja de ruta ADR-025: 4 ✅ → 4½ ✅ → **5 construir v3.0** (paquete 1 ✅; sigue el 2) → 6 el ciclo → 7 mensajería v3.1.

## Próximo paso: misión 5, director D2.1

**Título: `vibe-kit M5 · D2.1 · Paquete 2, primera mitad: docs en capas, handoff y TODO con tope, hook node`**, en **Opus**. El tracker
manda ([`docs/kit-v3/PLAN-construccion.md`](kit-v3/PLAN-construccion.md), "Cómo se trabaja" y su fila D2.1). La línea para abrir:
`inicio — misión 5, paquete 2: documentos, hook y candado (docs/kit-v3/SPEC-0-kit-v3.md, orden 2)`.
D2.1 = spec delta del paquete 2 **partido en dos directores** (D2.1 y D2.2: cuál pieza va en cuál lo fija el delta), con red team, que
Guido sella a mano. **Antes del delta**: resolver con Guido el primer pendiente del tracker (`pruebas/` carga el `CLAUDE.md` de los repos
de prueba). **Lección de D1.1 para el delta**: cruzar cada campo y formato contra los diseños que lo citan *antes* del sello.

## Cosas que muerden y no están en ningún otro doc

- 🧪 **No usar Read dentro de `pruebas/alfa|beta|gama`**: mete su `CLAUDE.md` en la sesión (verificado). Mirarlos por Bash.
- 🧪 **`node --test kit/` no anda en node 24**: el comando es `node --test "kit/**/*.test.cjs"`.
- 🔑 **Identidad de git**: en `clientes` el mail es el `noreply` de `guidocameraeq` (vale). Nunca `eq.chatgpt`. Los repos de prueba
  commitean como `kit-pruebas` y no leen la configuración global.
- 🗄️ **El privado `vibe-research`**: se clona en el scratchpad con `core.longpaths` y, para tocar solo el diario, `sparse-checkout` con
  `MSYS_NO_PATHCONV=1` (Git Bash convierte `/DIARIO-MISIONES.md` en una ruta de Windows).
- 🕵️ **Los racimos A, C y E**: chats sin aparecer en ninguna PC; NO VERIFICADO en el diario.
- 🗄️ **`D:\vibe-research\clientes\redteam-kit-v3\`** sigue en disco: nada se borra hasta cerrar la 5.
- 📬 **El Hub pushea a este repo desde otra sesión**: `git fetch` antes de cerrar.
- 🔴 **vibe-kit es PÚBLICO**: gitleaks antes de cada push. 🔐 **12 alertas abiertas**, las arregla Guido.
- 🧪 **Antes del piloto, trabajo de Guido** (spec, "Lo que hacés vos de nuevo"): credenciales de escritura al almacén en 2 PCs, usuario de
  solo lectura por base real, "preparame esta PC" en la del compañero.

## Bloqueos

Ninguno.
