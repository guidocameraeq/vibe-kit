---
name: estado
description: Cómo vamos, para el dueño: cuatro secciones fijas armadas por script (lo que te necesito, el plan, lo que se hizo y lo que falta), y el clic para firmar ahí mismo si hace falta. Usar cuando el dueño dice "estado", "¿cómo vamos?", "¿qué me espera?", "¿en qué está el módulo X?" o "¿cómo terminamos?" (esta última trae también el resumen del día). No usar para retomar una sesión (eso es /inicio), para cerrarla (eso es /cierre) ni para decidir nada: solo informa.
---

# /estado — cómo vamos

Solo información. No decide, no pregunta cuál módulo, no frena nada: las cifras las calcula un script desde la ficha, `tiempos.md` y git, nunca la memoria de nadie.

## Pasos

1. **Elegir la vista, sin preguntar.** Con un nombre en el pedido (`/estado <x>`), o si esta pestaña es la de un módulo (la rama `modulo/<x>` o `modulo/<x>--NN` lo dice), corré `node .claude/scripts/estado.cjs <x>`. Si no, `node .claude/scripts/estado.cjs`. Nunca preguntes "¿de cuál?". Si no hay `.kit-rol` (el rol es `humano`: el dueño, en la carpeta principal), antes de la vista, callado, corré **siempre** `node .claude/scripts/noche.cjs volvi` (borra la marca de la noche que el director dejó en su worktree) y `node .claude/scripts/worktree.cjs limpiar` (cierra las carpetas ya mezcladas; lo que no puede, no lo fuerza). Con otro rol, no los corras. El director usa la suya: `estado.cjs --director [<x>]`.
2. **Mostrar la salida tal cual**: siempre cuatro secciones, en este orden: `TE NECESITO`, `EL PLAN`, `LO QUE SE HIZO` y `LO QUE FALTA`. No la resumas, no la reordenes, no le sumes cifras: `nada` y `no sé todavía` se muestran como vienen (nunca un número inventado).
3. **El clic, ahí mismo.** Si `TE NECESITO` trae algo de `un clic tuyo` (firmar un cambio de freno), ofrecé hacerlo ahí: `git pull --ff-only`, `node .claude/scripts/cambios.cjs aprobar <id>` (la ventana de permiso es su firma: el dueño solo aprieta) y `git push`. Nunca lo corras sin que lo pida, y nunca le des el comando para que lo corra él.
4. **El resumen del día.** Si el dueño pregunta "¿cómo terminamos?", corré `node .claude/scripts/resumen.cjs` (con el módulo si hay uno) y mostralo. Si dice que el de hoy ya existe, decí dónde está y no lo repitas.
5. **Líneas propias.** Si el dueño pide "agregá tal línea al estado", sumá un renglón con esa frase, tal cual la dijo, a `.claude/estado-lineas.md` (las muestra la vista del director). Quitarla es borrar el renglón.

## Reglas

- Lo que el dueño tiene que hacer está en `TE NECESITO`, y solo ahí (una sola lista); no lo repitas al pie de nada.
- Al dueño, en criollo: "pasó" o "falló", nunca rojo ni verde; sin códigos sueltos; nunca un comando para que lo corra él.
- Las cifras salen del script. Si algo no cuadra con lo que ves en git, decíselo al dueño, no lo corrijas a mano.

<!-- kit:propio -->
## Lo propio de este proyecto

*Las vistas y los avisos que agrega este proyecto. El kit no pisa esta zona al actualizar.*
<!-- /kit:propio -->
