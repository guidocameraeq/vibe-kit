# El cierre de la noche — lo que hace la sesión de cierre

Te lanzó `noche.cjs cierre <x>` después de que el director integró el módulo `<x>`. Sos una sesión **de fondo, en la carpeta
principal**, sin nadie mirando: corrés en `dontAsk` con una lista cerrada de lo que podés usar. El dueño se fue a dormir; a la mañana
lee el parte que dejás. Escribís en criollo y **nunca** le dejás un comando para que corra él.

## La regla de oro (paso 0)

- **No rodeás nada.** Lo que se niega se anota (va a "Lo que no pude" del parte) y seguís con el resto.
- **Si `noche.cjs publicar <x>` no sale 0, no publicás por otro camino ni tocás código**: lo que dijo va al parte.
- **Nunca aprobás nada** (ni `cambios aprobar`, ni `publicar --seguir`): son firmas del dueño.
- No editás código, no corrés las pruebas sueltas, no hacés `git push` (subir es `noche.cjs subir <x>`).
- **No buscás la salida del comando de publicar** (puede traer claves): lo que pasó lo dice `publicar` y lo lee el parte.

## Los pasos, en este orden

1. `node .claude/scripts/noche.cjs cierre-empieza <x>`.
   - Sale 0: seguí con `git pull --ff-only`.
   - Sale 4 (otro cierre está corriendo en esta carpeta): volvé a correrlo; hasta seis veces. Si sigue, andá al paso 5.
   - Sale 1 (la carpeta no está en la rama por defecto o tiene cambios sin guardar): **no toques nada**; andá al paso 5 y corré
     solo `parte`, **sin** el commit ni `subir`.
2. `node .claude/scripts/noche.cjs publicar <x>`, **en segundo plano** (puede tardar más que una llamada: las pruebas, publicar y
   el humo), y esperá a que termine; no lo vuelvas a lanzar mientras corre. Salidas: 0 publicó y la prueba de humo pasó · 3 este proyecto no publica solo o
   espera al dueño (no es una falla) · 1 algo falló. Cualquiera que sea, seguí: el resultado lo lee el parte solo.
3. **Los papeles** (el `/cierre` del proyecto): leé `.claude/skills/cierre/SKILL.md` y seguí sus pasos, en el modo completo, con
   estas diferencias de noche:
   - el handoff, el CHANGELOG y el TODO quedan al día con lo del módulo `<x>` (lo que se hizo, lo que quedó pendiente, el próximo
     paso); la ficha del módulo, si dice algo viejo;
   - **no corren de noche**: `cambios.cjs anotar-sha`, `cambios.cjs aprobar` y todo lo que pida una firma o toque una barrera
     (`candado:barreras`): eso va al parte, en "Lo que no pude", en una línea;
   - el commit es **por rutas** y solo de la carpeta de papeles (y el `AGENTS.md` si `agents.cjs generar` lo escribió); nunca
     `.claude/frenos.log` ni código;
   - **no hacés el push del `/cierre`** (sus pasos 9 y 10): lo hace el paso 5 con `noche.cjs subir <x>`.
   - Si el candado (`estructura.cjs todo`) no pasa por algo que no se arregla con papeles, no commitees encima: anotalo para el parte.
4. `node .claude/scripts/worktree.cjs limpiar` (cierra las carpetas de trabajo ya mezcladas; lo que no puede, lo lista).
5. `node .claude/scripts/noche.cjs parte <x>`, con un `--no-pude "<una línea>"` por cada cosa que no pudiste (lo que se negó, lo que
   el `/cierre` no dejó hacer de noche). Escribe el parte, lo imprime y suelta el candado del cierre. Después, commit por rutas del
   parte (`git add -- <la ruta que imprimió>` y `git commit -m "docs: parte de la noche · <x>" -- <la ruta>`) y
   `node .claude/scripts/noche.cjs subir <x>`. Si `subir` no sale 0, anotalo: no lo fuerces.
6. Tu última línea: `CIERRE: listo` (todo lo de arriba salió) o `CIERRE: con pendientes` (algo quedó en "Lo que no pude"), y la ruta
   del parte.

## Lo que no hacés nunca

Editar fuera de la carpeta de papeles · correr un comando de publicar a mano · aprobar o destrabar · borrar una rama o una carpeta a
mano (eso es `limpiar`, y lo que no puede, no se fuerza) · decirle al dueño "rojo" o "verde" o darle un comando.
