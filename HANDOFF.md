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

> **Nota de Guido (2026-11-05):** salió la **`3.0.0-rc.6`**, y la PC de Juan sigue en la `rc.3`. Lo que trae de nuevo:
> - la rc.4: `carpeta-docs:` y el caché de Python;
> - la rc.5: una sola ventana y la flota con obra;
> - la rc.6:
>   - el obrero de cierre de tramo;
>   - "a `main` sube solo el director";
>   - los avisos de la adopción (lock atrasado, gitleaks de la historia);
>   - h10, que trata la versión de `claude` y el `sh` de PowerShell, o sea, los dos hallazgos de Juan.
>
> Antes del paso 3, la PC va a la rc.6, así lo que Juan prueba y sube es lo último. Esta rama no lleva el kit, así que no hay nada que
> mezclar: el kit le llega siempre por `actualizate`.

1. **Paso 5, la PC a la rc.6.** Decile **"actualizate"** al Equipador; tiene que ir de `3.0.0-rc.3` a `3.0.0-rc.6`. Reiniciá Claude Code y
   corré el `doctor`. Guardá la prueba en `pruebas/2026-11-05-rc-6.md`, con:
   - de qué versión a cuál;
   - la tabla del `doctor`;
   - **si siguen los 3 ⚠ del paso 1**: el `claude` de la terminal, `automode` y `copias-kit`.
2. **La suite otra vez, en la rc.6** (el mismo paso 2, ~35 min, sola y en segundo plano). Guardá la prueba en `pruebas/2026-11-05-suite-rc6.md`.
   Lo que se busca:
   - si la roja `no hay sh` desapareció;
   - si las otras 7 se repiten.
3. **Paso 3** ya con la rc.6: Juan elige un proyecto **no crítico**. El alias va en `proyectos.md` y el nombre real solo en
   `.local/alias.md`. Después, `/arquitecto` → "adoptá <carpeta>"; primero corre `adoptar --mirar`, que no escribe nada.
4. **Regla desde hoy:** cada prueba nueva arranca con la línea `kit: <versión>`, la de `~/.claude/VERSION`, así Guido sabe con qué rc se vio.

## Para la sesión de Guido

- Del paso 1: el doctor no lee el `claude` de la terminal (2.1.252 a mano vs ≥ 2.1.295 pedido); `automode` ⚠ por dos checkouts del
  mismo origin; `copias-kit` ⚠ por 2 proyectos con su propia copia de `arquitecto` (no se tocaron).
- Del paso 2: la roja `no hay sh` (kit-githook) depende de la terminal: PowerShell no tiene `sh` en el PATH, Git Bash sí (verificado).
  Las otras 7 no se pueden atribuir con certeza a la carga de la PC (Docker corriendo) o a la terminal. La suite es lenta en Windows.

## Trabado

Nada.
