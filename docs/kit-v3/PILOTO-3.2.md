# El piloto de la 3.2: poner al día, probar y juntar lo que aparezca

> **Para qué**: la `v3.2.0` salió "en piloto" (ADR-044). Este es el plan para llevarla a los repos reales, usarla y juntar la
> evidencia que decide qué entra a la 3.2.1. Armado el 2026-11-24, a pedido de Guido. **Acá se anota lo que aparezca**: las tablas
> de abajo se van llenando. Regla de la madre: lo que se vea en otro repo se anota acá; no se le marcan tareas a ese repo.
>
> **Estado**: en `Usuario`, fases 0 y 1 hechas (Deptos y Perseo en 3.2.0, 2026-11-25); `clientes`, pendiente.

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

**Cómo quedó** (anotado por la sesión de la flota):
- `Usuario`, 2026-11-24: kit `3.2.0` ✅ · hooks por PC de 3.1.0 a 3.2.0 (cambió solo `lib/proceso.cjs`) ✅ · doctor `todo bien · 1 aviso ·
  0 cosas a arreglar · 30 chequeos` (el aviso: el `CLAUDE.md` de vibe-kit sin "El tamaño del pedido", viene de antes).
- La foto de `Usuario`: el único repo real con ficha es **Deptos** (`rc.6`). Los otros seis con kit están en `clientes`: su fase 0 y
  su fase 1 se hacen allá. Perseo está en `Usuario` **sin ficha** (no tiene el kit v3): no se pone al día, se adopta.
- `clientes`: pendiente.

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
| Deptos (vuelta 1) | 2026-11-24 | `Usuario` | **te espera** (quedó entero en `rc.6`, `kit: ESPERA — scripts`) | (a) choque en `worktree.cjs`: el plazo del push de `integrar` subido a mano de 2 a 10 min (2026-11-10), y el kit trajo el mismo arreglo con otro nombre (`T_PUSH_INTEGRAR = 600000`); la pieza no tenía `por:`. (b) La línea 8 (`pruebas`) en ❌, "en base pasaba": sin explicar todavía. (c) `/inicio` del proyecto pesa 9.955 B, 1.355 de más por su zona propia (⚠, no traba). (d) **La vuelta tardó 57 min** (12:53 a 13:50; ~25 en las pruebas de los hooks), contra los ~18 de la flota de prueba | (a) sí: es el caso de la rc.8 ("un script tocado a mano"); (d) no |
| Deptos (vuelta 2, después de `resolver . scripts nueva`) | 2026-11-24 | `Usuario` | **ROTA** sin estar roto: `main` sigue en `rc.6`, intacto | La línea 7 (`casos`): las pruebas de los hooks (27 archivos) no terminaron en 30 min, **dos veces** ("¿la PC estaba cargada?"); en la vuelta 1 habían terminado en ~25. Y no pudo subir `kit/v3.2.0` ("el remoto no respondió"): en GitHub quedó la de la vuelta 1. La vuelta: 13:52 a 15:39 (1 h 47) | **No cuenta como caso**: la PC se apagó sin batería en medio de la vuelta (lo contó Guido). Eso explica el tope pasado y el remoto que no respondió. Lo que sí deja: la flota se recupera bien de un apagón (nada a medias en `main`) |
| Deptos (vuelta 3) | 2026-11-25 | `Usuario` | **ROTA, de verdad** (`main` sigue en `rc.6`, sano) | Las líneas 1 a 7 y 9, ✅; la 8 (`pruebas`), ❌: de las seis partes del `comando-test` falla una, `node scripts/test_whatsapp_freno.mjs` (1 de 316 casos: "la negativa no dejó su renglón whatsapp:envio-negado"); en la base pasa. **Causa**: el hook propio de Deptos (`whatsapp-no-envia.cjs`) escribe con la `frenos-log.cjs` del kit, que desde la rc.8 manda los renglones que no son firma a `<git común>/kit-frenos.log`; la prueba propia lee `.claude/frenos.log` directo. Es la nota de la `rc.7` (`fl.leerTodo`), que Deptos nunca necesitó porque venía de la `rc.6`. El arreglo es de una línea, en la prueba de Deptos. La vuelta: 09:07 a 09:38 (31 min) | (en parte) la nota de migración ya lo decía, pero la flota no la conecta con la falla: la fila dice "lo rompió la actualización" sin decir dónde. Nuevo: que la línea 8 diga qué parte del `comando-test` falló |
| Deptos (después de la vuelta 3) | 2026-11-25 | `Usuario` | **sigue en `rc.6`**, con el arreglo de la prueba en `main` (`1f7acf51`, con su OK) | Con el commit de la flota traído a mano a `main`, todo verde en la carpeta (el `comando-test` entero y `adoptar --verificar`), pero **el pre-push no lo deja subir**: el commit del kit toca 25 frenos y permisos y, fuera de la flota, no tiene la exención (está bien que frene). Se subió solo el arreglo (anda con la lib vieja y con la nueva) y se dejó `main` igual a GitHub. Guido: la vuelta 4, otro día. Debería salir mezclado | no: el freno hizo lo que tenía que hacer |
| **Perseo (adopción)** | 2026-11-25 | `Usuario` | **adoptado** ✅ (sin kit → `3.2.0`, "por el sello", con su OK de todo lo recomendado) | D1 los del kit, con lo propio (VPS, cuadernos de errores, los 4 fantasmas, memoria al repo) en las zonas propias y el detalle en `docs/referencia/rituales-perseo.md` · D2 y D3 recomendadas · sin `comando-test` (`gate:entorno-prueba`) · `publicar: no` · sensible: `vps.sh sql` y `vps.sh run` · dos cambios de freno firmados por Guido desde una sesión en Perseo (la firma no sale de un clon ni de otra carpeta), aplicados y anotados; barreras pasa. Quedan: el `NORTE.md` con 5 `[completar]`, el handoff de 5.353 B sobre el tope (el `/cierre` del kit lo baja), 5 falsos de gitleaks en pruebas viejas, y el worktree de agente del 2-nov | nuevo: la firma pide una sesión en la carpeta del proyecto; desde la madre, con la carpeta sin confiar o por control remoto, no se puede abrir |
| Perseo (después) | 2026-11-25 | `Usuario` | aflojado ✅ | Guido: "son míos personales, no quiero tantas trabas". Se sacaron las dos preguntas de `vps.sh` (`sensible` en `no`) con un cambio de freno firmado; en Deptos no hizo falta (la puesta al día no le sumó ningún freno: solo dos `allow`). Lo recomendado en la adopción de un repo personal fue demasiado: la adopción no pregunta si el repo es personal | nuevo |
| **Deptos (vuelta 4)** | 2026-11-25 | `Usuario` | **mezclado** ✅ (`rc.6` → `3.2.0`, un commit a `main`) | Limpio: rehízo sola la `kit/v3.2.0` ROTA de antes. Queda el ⚠ del `/inicio` (1.355 B de más por su zona propia). En la carpeta: `pull`, `adoptar --verificar` "el repo quedó andando". La vuelta: 10:02 a 10:27 (25 min). Falta la fase 2 (abrir Deptos y `/inicio`) | — |

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
| 2026-11-25 | Perseo (adopción) | **La adopción no se puede pushear desde la sesión.** El clon de la adopción no lleva `core.hooksPath` (el adoptador lo prende solo en la carpeta del dueño, con `--traer`), y el `git-seguro` de la sesión frena todo `git commit`/`push`/`rm` ahí (`hooks-path-ausente`). Prenderlo no sirve: el pre-push corre barreras, y la ficha y los permisos de la adopción fallan sin sello, como el mismo adoptador avisa ("lo cubre tu OK"). Los tres commits de la adopción sí pasaron (la misma cadena, antes); el que no pasó fue uno de `git rm` y el push. El adoptador y el guardia se contradicen | nuevo (parecido al renglón 11) |

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
