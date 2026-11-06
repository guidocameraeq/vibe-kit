# HANDOFF — la prueba de Juan

> Dónde quedamos. El cierre lo sobreescribe entero.

**Última sesión:** 2026-11-06 (pc-juan). Kit en la `3.0.0-rc.6`. Pasos 0, 1, 2 y 5 (rc.6) hechos; el 3 a medias.

## Dónde quedamos

- **Paso 5, la PC en la rc.6:** hecho (`pruebas/2026-11-06-rc-6.md`). Doctor: 29 chequeos, 1 ✗ (`claude-code`: el `claude` de la
  terminal es 2.1.252 y pide ≥ 2.1.295), 4 ⚠. Se aplicó con `--pisar-editados`: 3 archivos "editados a mano" eran idénticos a la rc.3.
- **Suite en la rc.6:** hecha (`pruebas/2026-11-06-suite-rc6.md`). 3071 tests, 3061 pasan, 9 rojas. Repetidas desde PowerShell solo
  queda `no hay sh`; las otras 8 pasan.
- **Paso 3, `proyecto-x3`:** `--mirar` y `--aplicar` hechos **solo en un clon temporal** (2 commits, 77 archivos, barreras verde).
  `pruebas/2026-11-06-proyecto-x3-mirar.md` y `-aplicar.md`. **No se subió nada** al repo de la empresa y no se tocó la carpeta de Juan.
  El clon temporal se borró en el cierre: si se decide subir, se rehace la adopción (rápido, mismas elecciones).
- `proyecto-x2` no existe en `<proyectos>` (la carpeta entera); corregido en la prueba de la rc.6.

## Qué sigue

1. Juan **reinicia Claude Code** y se repite el `doctor` (mini-chequeo; nunca se corrió después del reinicio con la rc.6).
2. Juan decide si hace `claude update` en la terminal (arregla el ✗).
3. Para `proyecto-x3`: Juan commitea o guarda sus cambios locales (4 archivos + 1 carpeta nueva). Después decide el push a `main` del
   repo de la empresa (conviene avisar antes a quien lo lleva) y se hace el `--traer`. Si no quiere, el paso 3 queda en "mirar" y
   está bien. `docs/NORTE.md` tiene 5 `[completar]`.
4. Paso 4 (usarlo de verdad) solo si el paso 3 sube. Cada prueba arranca con `kit: <versión>`.

## Para la sesión de Guido

- **Falso "editado a mano" de rc.3 a rc.6:** 3 archivos idénticos a los del tag rc.3 (hash comprobado) figuraron como "no es ninguna
  versión del kit"; sin `--pisar-editados`, `VERSION` no subía. Causa no investigada.
- **`claude-code` ahora ✗** y el doctor lee bien la terminal (h10 anda para eso), pero deja exit 1.
- **`no hay sh` sigue** (kit-githook) desde PowerShell en la rc.6; h10 no lo cambió acá. Las otras 8 rojas son de carga/tiempos (no probado
  sin Docker). La suite tarda 38 min.
- `automode` ⚠ persiste (esta rama comparte origin con el canónico). `copias-kit` ⚠ en `proyecto-x1`.

## Trabado

Nada. Esperan decisiones de Juan (push del paso 3).
