# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope**: con el TODO y git, lo inyectado tiene que quedar bajo 10.000 caracteres.

**Última sesión cerrada:** 2026-10-27 (arrancó el 26), misión 4, tramo 4: **revisión integral, sesión 2 de 2** ✅ → **tramo 4 cerrado**.
Solo diseño, kit `v2.4.2`. PC `clientes`. `kit-sync` LIMPIO. El detalle de todo lo de abajo está en el CHANGELOG del 2026-10-27.

## Dónde estamos

- **Misión 4**: tramos 0-3 ✅ · **tramo 4 ✅** (8 racimos + revisión integral en dos sesiones). Hoja de ruta ADR-025: **5 el spec** (tramo 5 de
  la misión 4) → 4½ ordenar la casa → 5 construir v3.0 → 6 el ciclo → 7 mensajería v3.1. [`PLAN.md`](mision-4/PLAN.md), fila del tramo 4.
- **Lo decidido en esta sesión**: cambios de método del proyecto = **clase 2 con diff, barreras con clic** (D §13.2 d) · **registro de cambios de
  método por proyecto, pieza del canon** (ADR-026, D §22ter) · 4 líneas de Hermes entraron con su cicatriz (D §22bis: de 32 cambios, 0
  contradicen D) · la portada del repo (B §12bis) · revisor frío: 30 hallazgos, todos aplicados · **D §8 cerrada por Guido el 27/10: nada queda
  provisorio**; lo NO VERIFICADO se prueba en el piloto.

## Próximo paso: el repaso del kit con Guido, y después el spec (tramo 5)

**Título: `vibe-kit M4 · Tramo 5: el repaso del kit con Guido y el spec del pack (SPEC-0 del kit v3)`**. Esfuerzo `high`.
0. **Primero el repaso, pedido de Guido el 27/10** ("contame cómo quedó mi kit y por qué es mejor que el anterior; después le doy el OK al
   spec"). En criollo, con ejemplos de sus proyectos, **parte por parte y en el orden de su workflow**: (a) qué hace el Arquitecto nuevo y qué lo
   diferencia del de hoy (E §2-§3, H §8); (b) cómo se actualiza vibe-kit y después los repos (E §6-§8, ADR-026); (c) su día a día con director y
   obreros (D §15; la charla final de la sesión 2 sirve de base, corta); (d) cómo quedan los repos y la documentación (B §4-§6, §12, §12bis;
   H §10); (e) **por qué es mejor que el kit anterior, con lo medido** (TABLERO §1, las tablas "Cómo se sabe si funcionó", los "Qué cambia para
   Guido"). Charlando, con pausas; nada se escribe hasta que diga "listo, dale al spec".
1. **El SPEC-0 del kit v3** desde los 8 `DISENO-*` (leer solo decisiones y tablas "Revisión integral", no enteros: ~400 KB) y TABLERO §1, con el
   formato del kit: top 10, piezas con su estado en la ficha, scripts, candados, NO VERIFICADO del piloto, orden de construcción, medición.
   Lo que el tramo 4 dejó "para el spec" está listado en el TODO.
2. **Red team** (`redteam-spec`, Opus, máximo 3 rondas) → **revisor frío** → OK de Guido. Cada hallazgo pasa primero por el criterio establecido.
Después: 4½ ordenar la casa → misión 5.

## Cosas que muerden y no están en ningún otro doc

- 🔑 **Identidad de git**: en `clientes` el mail es el `noreply` de GitHub de `guidocameraeq` (vale). Nunca `eq.chatgpt`.
- 🗄️ **Lo crudo vive en `D:\vibe-hallazgos\`** (no es repo); copia en el privado `vibe-research`. No se borra nada hasta cerrar la misión 5.
  El próximo revisor frío escribe su informe en `vibe-research`, no en el scratchpad (el de hoy quedó ahí; lo que importa está en D y el CHANGELOG).
- 📬 **El Hub pushea a este repo desde otra sesión**: `git fetch` antes de cerrar (hoy nada nuevo).
- 🧪 **NO VERIFICADO al piloto (Deptos)**: lo de siempre (H §22, D §20, G) más lo de hoy: el modo `integrar` del script de worktrees en Windows,
  el `/cierre` fuera del checkout principal, la migración del `CAMBIOS.md` de Hermes a archivos chicos, el hash de `aplico:`.
- 🔴 **vibe-kit es PÚBLICO**: gitleaks antes de cada push (hoy limpio). 🔐 **12 alertas abiertas**, las arregla Guido.
- 📏 Hermes se mide con `git log --since=<corte> -- .claude/skills docs/metodo` (38 al 26/10); todo el repo da 255: decir qué mide la cifra.
- 📐 **El hook quedó al borde del tope** (~9.700 de 10.000): si el TODO crece, recortar antes.

## Bloqueos

Ninguno.
