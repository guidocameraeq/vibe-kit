# El piloto de la 3.2: poner al día, probar y juntar lo que aparezca

> **Para qué**: la `v3.2.0` salió "en piloto" (ADR-044). Este es el plan para llevarla a los repos reales, usarla y juntar la
> evidencia que decide qué entra a la 3.2.1. Armado el 2026-11-24, a pedido de Guido. **Acá se anota lo que aparezca**: las tablas
> de abajo se van llenando. Regla de la madre: lo que se vea en otro repo se anota acá; no se le marcan tareas a ese repo.
>
> **Estado**: sin arrancar.

## Cómo se trabaja

- **La sesión**: `vibe-kit Flota · Los repos reales a la v3.2.0`, en **Opus** (no en Fable), abierta en vibe-kit. La flota la
  corre el Equipador con `actualizar.cjs` (`manuales/EQUIPADOR.md` §5): trabaja en clones temporales y **no toca tu carpeta**.
- **De a un repo, con tu OK antes de cada uno.** Nada de `flota todo` de una.
- Cada repo deja una fila en la tabla de la fase 1, pase lo que pase.

## Fase 0 — La PC primero (en cada PC donde haya repos)

1. *"actualizá el kit"* → `~/.claude/VERSION` tiene que decir `3.2.0`. (En `Usuario` ya está; en `clientes`, falta.)
2. *"instalar hooks por PC"* → hoy los hooks de `Usuario` siguen en 3.1.0. Lo corrés vos.
3. *"corré el doctor"* → los 30 chequeos en verde, o anotar acá cuál no.

No registres una segunda PC en el buzón: eso espera a la 3.1.1.

## Fase 1 — Poner al día, repo por repo

Arrancá con *"¿cómo está la flota?"* para la foto de hoy (los siete con kit estaban en la `rc.6` el 2026-11-15). Orden recomendado:

1. **Uno tranquilo primero**: sin obra en curso, con pruebas y sin nada raro. Es el ensayo.
2. Los demás sin obra en curso.
3. **El que pide `pnpm`** y **el que no tiene pruebas**: van a salir "ROTA" sin estar rotos (renglón 2 de la 3.2.1). Para el
   segundo, la ficha tiene que decir `nivel: liviano` o `gate:entorno-prueba` en `frenos.quitados`, con tu firma.
4. **Deptos**: en el banco necesitó dos vueltas.
5. **Los que tienen obra viva**: cuando la cierren. `--con-obra` existe, pero no se recomienda con un director trabajando.

Por cada repo: *"poné al día X"* → mirar la fila que devuelve → si dice "te espera", resolverlo con la sesión → abrir el proyecto
y correr `/inicio`.

| Repo | Fecha | PC | Resultado (mezclado · salteado · ROTA · te espera) | Qué apareció | ¿Ya estaba en la 3.2.1? |
|---|---|---|---|---|---|
| | | | | | |

## Fase 2 — Probar que anda (en cada repo puesto al día)

Una vuelta corta de uso real, no una prueba armada:

1. `/inicio`: ¿arranca, cuenta dónde quedaste, no se queja de nada?
2. Un pedido chico de verdad, de punta a punta.
3. `/estado` y `/cierre`.
4. **Donde quieras PO**: *"prendé la pieza po"* (la sesión copia la skill y pone `po: molde`; `po: sí` no alcanza) y después
   *"¿cómo viene el proyecto?"*.

Lo que falle o moleste va a la tabla de la fase 3, con el repo y la fecha.

## Fase 3 — Usarlo y juntar (dos semanas desde el primer repo)

**Lo que cuenta un script** (lo corre la sesión de la revisión, en cada proyecto):
- `turno.cjs rastro`: memoria libre al entrar cada corrida pesada, y si hubo esperas.
- El panorama (`estado.cjs --obra --cambios`): repasos con novedades contra repasos vacíos.
- `cambios-flota.cjs` (*"¿qué se repite en la flota?"*) y `pruebas-flota.cjs`: lo que se repite entre repos.

**Lo que contás vos** (las medidas de `DISENO-PO.md` §6). Alcanza con decirlo en el chat cuando pase; la sesión lo anota:

| Medida | Antes | Objetivo | Lo que pasó |
|---|---|---|---|
| Corridas pesadas que viste correr por afuera del turno | sin dato | ninguna | |
| Mensajes a la sesión equivocada | 2 en dos días | 0 | |
| Veces que tuviste que pedir "que documente" antes de integrar | cada integración | 0 | |
| Tiempo en ponerse al día al reabrir | se perdía lo sabido | minutos, sin tu ayuda | |
| ¿Seguís abriendo un Arquitecto para llevar el proyecto? | sí | no (si sigue, el PO se descarta: el corte de §6) | |

**Lo que hay que mirar si aparece** (ya está anotado en la 3.2.1; si aparece, sube; si no aparece, baja):
- una fila "ROTA" en un repo que no está roto (renglón 2);
- la flota salteando repos por ramas de módulo que ya nadie usa (renglón 8);
- un encargo cerrado que sale dos veces en `/estado` (renglón 9);
- `mesa.cjs abiertos` tardando más de un minuto (renglón 7);
- una sesión de la app que no puede commitear (renglón 11);
- hooks o el push de `integrar` cortados por tiempo con la PC cargada, y el candado `topes` en rojo con varios módulos: anotar
  **qué tope, en qué proyecto y con qué corriendo** (están en "Más adelante" porque no hay caso anotado).

| Fecha | Repo | Qué pasó | ¿Renglón de la 3.2.1, nuevo, o de "Más adelante"? |
|---|---|---|---|
| | | | |

## Fase 4 — La revisión, y recién ahí la 3.2.1

Sesión `vibe-kit 3.2.1 · La revisión del piloto`, a las dos semanas del primer repo. Conviene juntarla con **la medición de la
`v3.0`** (~2026-12-15), que también corre scripts sobre la flota.

1. Correr los scripts de la fase 3 y completar las tablas.
2. Reordenar el ítem "La 3.2.1" del TODO con lo que apareció: lo que dolió sube, lo que no se vio baja o se descarta con su razón.
3. Decidir el corte del PO (§6 de su diseño).
4. **Una decisión tuya, antes de construir**: cómo sale un arreglo x.y.1 que toca una barrera o la flota (ADR-046, punto 5).
   Recomendado: una `rc` quirúrgica más el banco, con los cinco arreglos del script del banco hechos antes.
5. Recién entonces se construye la 3.2.1.

## Lo que este plan no sabe

- Cuáles de los siete repos tienen hoy obra en curso: lo dice *"¿cómo está la flota?"*.
- Si la puesta al día de la `rc.6` a la `3.2.0` trae algo que la flota de prueba (alfa, beta y gama, desde la 2.4.2) no vio.
- Si `prueba.cjs` anda sin el PO prendido (NO VERIFICADO).
