# HANDOFF — la prueba de Juan

> Dónde quedamos. El cierre lo sobreescribe entero.

**Última sesión:** 2026-11-04 (pc-juan). Pasos 0, 1 y 2 del plan hechos.

## Dónde quedamos

- **Paso 0** (lo básico) y **paso 1** (kit `3.0.0-rc.3`, doctor 0 ✗ · 5 ⚠): hechos. Juan reinició Claude Code y dijo que no le molestó nada
  (en `impresiones.md`).
- **Paso 2** (la suite): hecho. `pruebas/2026-11-04-suite.md`. Corrida entera 35 min: 2867 tests, 2858 pasan, 8 rojas, 1 salteado.
  Repetidas por separado (7 archivos, 21 min) pasaron las 287. Clon temporal borrado.
- **No se volvió a correr el doctor** después del reinicio (queda como mini-chequeo pendiente).

## Qué sigue

1. Correr el doctor otra vez y adjuntarlo (hooks cargados tras el reinicio).
2. Paso 3: Juan elige un proyecto **no crítico**, alias en `proyectos.md` (nombre real solo en `.local/alias.md`), y `/arquitecto`
   → "adoptá <carpeta>" (primero `adoptar --mirar`, que no escribe nada).

## Para la sesión de Guido

- Del paso 1: el doctor no lee el `claude` de la terminal (2.1.252 a mano vs ≥ 2.1.295 pedido); `automode` ⚠ por dos checkouts del
  mismo origin; `copias-kit` ⚠ por 2 proyectos con su propia copia de `arquitecto` (no se tocaron).
- Del paso 2: la roja `no hay sh` (kit-githook) depende de la terminal: PowerShell no tiene `sh` en el PATH, Git Bash sí (verificado).
  Las otras 7 no se pueden atribuir con certeza a la carga de la PC (Docker corriendo) o a la terminal. La suite es lenta en Windows.

## Trabado

Nada.
