# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope**: con el TODO y git, lo inyectado tiene que quedar bajo 10.000 caracteres.

**Última sesión cerrada:** 2026-10-27 (arrancó el 26), misión 4, tramo 4: **revisión integral, sesión 2 de 2** ✅ → **tramo 4 cerrado**.
El apartado director/obrero contra Hermes, el flujo proyecto ↔ kit (ADR-026), la portada del repo, el revisor frío (30 hallazgos aplicados) y la
charla final con Guido ("el recorrido queda como está"). Solo diseño, kit `v2.4.2`. PC `clientes`. `kit-sync` LIMPIO.

## Dónde estamos

- **Misión 4**: tramos 0-3 ✅ · **tramo 4 ✅** (8 racimos + revisión integral en dos sesiones). Hoja de ruta ADR-025: 4 → **5 el spec** (tramo 5
  de la misión 4) → 4½ ordenar la casa → 5 construir v3.0 → 6 el ciclo → 7 mensajería v3.1. [`PLAN.md`](mision-4/PLAN.md) tiene el resumen de
  las dos sesiones en la fila del tramo 4 y una lección nueva al final.
- **Lo decidido en esta sesión** (detalle en D §22bis, §22ter, §13.2 d; B §12bis; ADR-026; CHANGELOG): **cambios de método del proyecto =
  clase 2 con diff, barreras con clic** · **registro de cambios de método por proyecto, pieza del canon** (`.claude/cambios/`, archivos chicos,
  sube al kit por el ciclo con 3+ o cicatriz, urgencias como parche, adopción citándolo) · **4 líneas de Hermes entraron con su cicatriz**
  (CM-79, 82, 86, 91) · **la portada del repo** es del Arquitecto desde el `NORTE.md`; vestirla es pieza de la misión 5.
- **Veredicto del contraste con Hermes**: de 32 cambios que se hizo solo en una semana, 0 contradicen D. El canon aguanta.
- **Revisor frío**: 30 hallazgos, todos aplicados; 3 con veto ofrecido a Guido y no vetados (clic de barreras → cola "te espera", no pop-up ·
  el actualizador informa con veto, no pregunta · `estandar` sin director mergea con gate verde, definido una vez en E §4).
- **Sigue provisoria** D §8 (ramas y escritores) hasta el piloto, por pedido de Guido.

## Próximo paso: el spec del pack (tramo 5)

**Título: `vibe-kit M4 · Tramo 5: el spec del pack (SPEC-0 del kit v3)`**. Esfuerzo `high`. Es la última pieza de la misión 4:
1. Releer los 8 `DISENO-*` **solo por sus secciones de decisiones y las tablas "Revisión integral"** (no enteros: ~400 KB) y el `TABLERO.md`
   §1 (líneas base); armar el **SPEC-0 del kit v3** con el formato del kit (`formato-spec.md`): el top 10, las piezas con su estado en la ficha,
   los scripts, los candados, los NO VERIFICADO del piloto, el orden de construcción para la misión 5 y la medición.
2. Lo que el tramo 4 dejó explícitamente "para el spec": está listado en el TODO (release/relevamiento/bloque de documentos en los tres tamaños;
   la excepción de "chico" para reglas propias; `merge=union` para `frenos.log`; herramientas por entorno; C §2.6).
3. **Red team** (`redteam-spec`, Opus, máximo 3 rondas, D §6.4) → **revisor frío** independiente → OK de Guido. Cada hallazgo pasa primero por el
   criterio ya establecido (regla de Guido).
Después: 4½ ordenar la casa (incluye mudar `docs/chats-mision-4/` al privado y el tope del hook v2.4.3 si no salió) → misión 5.

## Cosas que muerden y no están en ningún otro doc

- 🔑 **Identidad de git**: en `clientes` el mail es el `noreply` de GitHub de `guidocameraeq` (vale). Nunca `eq.chatgpt`.
- 🗄️ **Lo crudo vive en `D:\vibe-hallazgos\`** (no es repo); copia en `biblioteca/` del privado `vibe-research`. No se borra nada hasta que
  cierre la misión 5. El informe del revisor frío de esta sesión y el cruce de Hermes quedaron solo en el scratchpad de la sesión (lo que
  importa de los dos está en D §22bis y en el CHANGELOG); el próximo revisor frío escribe su informe en `vibe-research`, no en el scratchpad.
- 📬 **El Hub pushea a este repo desde otra sesión**: `git fetch` antes de cerrar (hoy nada nuevo).
- 🧪 **NO VERIFICADO al piloto (Deptos)**: lo de siempre (H §22, D §20, G) más lo nuevo de hoy: el modo `integrar` del script de worktrees en
  Windows, el `/cierre` fuera del checkout principal, la migración del `CAMBIOS.md` de Hermes a archivos chicos, el hash de `aplico:`.
- 🔴 **vibe-kit es PÚBLICO**: gitleaks antes de cada push (hoy limpio). Alias en los diseños. 🔐 **12 alertas abiertas**, las arregla Guido.
- 📏 Hermes se mide con `git log --since=<corte> -- .claude/skills docs/metodo` (38 al 26/10); "todo el repo" da 255: decir siempre qué mide la cifra.

## Bloqueos

Ninguno.
