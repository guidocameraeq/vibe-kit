# HANDOFF — la prueba de Juan

> Dónde quedamos. El cierre lo sobreescribe entero.

**Última sesión:** 2026-11-19 (pc-juan). Kit en la `3.0.1` (último tag). Pasos 0, 1, 2 y 5 hechos; el 3 y el 6 en "mirar".

## Dónde quedamos

- **`actualizate`:** la PC ya estaba en 3.0.1, con `kit · sin cambios · 117 iguales` (`pruebas/2026-11-19-v3-0-1.md`). Juan no
  aplicó el PreToolUse del corrector ni el `settings.json` que proponía el `--plan`. `claude-code` ahora da ✓ (2.1.327). **NO
  VERIFICADO** cómo pasó la PC de la rc.6 a la 3.0.1: no hay prueba de ese salto (rc.7 y rc.8 en el medio).
- **Skill `reflexion`:** Juan la pidió como skill global del kit; según Juan, Guido le dio el OK. La propuesta ajustada está en
  `propuestas/reflexion/SKILL.md`, con una prueba de escritorio sobre esta sesión (`pruebas/2026-11-19-reflexion-prueba-1.md`).
  Encontró la prueba del `actualizate` que faltaba y el `HANDOFF` desfasado.
- **Buzón de agentes:** según Juan, Guido le encargó llevarlo al kit como skill de la organización y mejorarlo, sobre todo para que
  el Arquitecto, el PO y los directores se enteren solos de los mensajes nuevos. Ya funciona: protocolo v0 en la unidad de red,
  24 conversaciones, 9 agentes, y cruza PCs y cuentas. El kit ya acepta `transporte: buzon` en la ficha de la mesa. Su spec dice
  que el diseño va en el racimo G de la misión 4 del kit, y que el red team dejó dos críticos abiertos: el contenido puede leerse
  como orden, y el puntero de `leidos/` pierde mensajes.
- Se commitearon los resultados del 2026-11-06 que habían quedado sin subir: `proyecto-x1` y `proyecto-x4` en "mirar"
  (`proyectos.md` y `pruebas/2026-11-06-proyecto-x1-x4-mirar.md`).

## Qué sigue

1. **El trabajo del kit no se hace acá:** se hace en `<proyectos>/vibe-kit`, con su protocolo (`/inicio`, editar en `kit/`,
   `kit-sync` `LIMPIO`, `/cierre`). Ese clon estaba 622 commits atrás de `origin/main` el 2026-11-19, así que lo primero es `git pull`.
   - Misión 1: skill `reflexion` (insumo: `propuestas/reflexion/SKILL.md` de esta rama).
   - Misión 2: el buzón (insumo: su spec y el `LEEME` v0; antes, ver qué dejó el racimo G en `main`).
   - Las dos de a una: tocan los mismos archivos de `main`.
2. Antes de tocar `main`, confirmar con Guido que Juan trabaje en la sesión madre (para no chocar con él).
3. Con la skill ya en una rc: probarla acá en una sesión limpia, con y sin la skill (la línea de base de `writing-skills`).
4. Pendientes de antes: el `doctor` después de reiniciar, y las decisiones de `proyecto-x3` (push y `--traer`), `x1` y `x4` (D4:
   declarar la clase de cada base).

## Para la sesión de Guido

- El salto rc.6 → 3.0.1 de esta PC no tiene prueba, y la suite no se corrió en 3.0.1.
- Lo de antes sigue: el falso "editado a mano" de rc.3 a rc.6, `no hay sh` en kit-githook, y el ⚠ de `automode` (esta rama
  comparte origin con el canónico).

## Trabado

Nada. Falta el OK de Guido para que Juan trabaje en `main` del kit.
