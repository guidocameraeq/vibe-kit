---
name: obrero
description: Sesión obrera que ejecuta un encargo ya commiteado en su worktree. Se presenta con un script que para si el spec no tiene sello, trabaja por sub-paso con prueba en rojo primero y revisor, y cierra con evidencia y rama pusheada. Usar cuando el dueño o el director dicen "obrero" o "/obrero <x>--<ID>", o la línea de apertura de un encargo lo lanza. No usar para dirigir el módulo (eso es /director) ni sin un encargo commiteado.
---

# /obrero — ejecutar un encargo

El argumento es `<x>--<ID>`. Leé `.claude/skills/nucleo/NUCLEO.md` (roles, mensajes, clases, gate, pruebas) y el encargo que cita la presentación, con el spec solo en las líneas que él nombra. Manda git, no la charla.

## Pasos

1. **Presentación.** `node .claude/scripts/encargo.cjs presentar <x>--<ID>`, en segundo plano (corre la suite). **Salida 1: PARADA con lo que dice el script, sin tocar nada y sin commit** (rama equivocada, encargo no commiteado, "spec sin Arquitecto: corré Modo B"); si no podés mandar mensajes, terminá con la PARADA como última línea. Salida 0: mandá `PRESENTACION <rama> @<sha7> · <modelo> · <esfuerzo>` con los valores reales; si no coinciden con el encargo, decilo antes de arrancar.
2. **Chequeo base.** Si `base:` dice ROJA, el primer AVANCE dice *"ya estaba roto: <qué>"*. No lo arreglás vos salvo que el encargo lo pida.
3. **Por sub-paso**, en el orden de `## Alcance`: prueba en rojo primero, código, commit congelado, el agente `revisor` (solo si hay código), y una corrección acotada si dice "con observaciones". Segunda vuelta solo si "rechazado"; una tercera es PARADA. Un AVANCE por commit. Si el sub-paso es `Riesgo: alto`, la mutación va antes de cerrarlo (tope 20 min). Tocá solo lo de `## Toca`; un desvío es clase 1 y se avisa.
4. **Lo que no está en AUTORIZADO.** De día, lo pedís (aparece la ventana; en `-p` el permiso se niega). **PARADA = se negó algo que el sub-paso necesita**, en `-p` o con rol `nocturno`. Un comando compuesto negado se parte y se repite una vez. Nunca un rodeo: ni otra herramienta, ni tocar el `settings`, ni darte permisos.
5. **Mensajes del director.** Antes de actuar: `node .claude/scripts/encargo.cjs mensaje <TIPO> <ruta>@<sha7>`. Si da 1, lo anotás en tu evidencia y no lo ejecutás.
6. **CIERRE.** Escribí la evidencia (`docs/modulos/<x>/bitacora/<fecha>-evidencia-<ID>.md`: qué se probó, con qué comando y su salida; qué no se miró). Un solo commit por rutas con la evidencia y `.claude/frenos.log`, `git push origin modulo/<x>--<ID>` por nombre, y el mensaje `CIERRE @<sha7>` con las notas para el método. No corrés `/cierre`: el director verifica y mergea.

## Reglas

- Una PARADA es primero un archivo: la evidencia arranca con `PARADA: <por qué>`, se commitea y se pushea antes del mensaje.
- Revisor: hasta 10 hallazgos, cada uno con su escenario del día normal. Los que no tienen escenario se descartan.
- Nunca merge, nunca push a otra rama, nunca `--no-verify`.

<!-- kit:propio -->
## Lo propio de este proyecto

*Los pasos que agrega este proyecto a su trabajo de obrero. El kit no pisa esta zona al actualizar.*
<!-- /kit:propio -->
