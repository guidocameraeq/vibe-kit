# Revisión integral de la rc.1 (R1, 2026-11-03)

> La primera revisión del kit v3 **entero funcionando junto** (ADR-034: paso fijo del ciclo), sobre `v3.0.0-rc.1`. Tres revisores Opus en
> paralelo, sin contexto previo y solo lectura: (a) el día de Guido de punta a punta, (b) la coherencia de las decisiones con el código y
> entre paquetes, (c) la documentación contra el código. La corrió la sesión madre (no se pudo abrir una sesión aparte por Remote Control).
> Los arreglos los hace la tanda de correcciones (tracker, "Después de la rc.1", fila 2b): lo que traba la adopción, antes; el resto, en la rc.2.

## En una mirada

- **El código cumple lo que decidiste en el repaso** (los renglones 1, 3, 7, 8, 10, 13, 14 y 15, verificados con su `archivo:renglón`), y
  las 11 copias byte a byte coinciden. Los huecos están **entre piezas** y en **los textos que leen las sesiones**: justo lo que ningún
  revisor de paquete podía ver.
- **Adoptar Hermes mañana anda. Arrancar el módulo *con director* no**, por dos cosas (T1 y T2 abajo). Hay una tercera que depende de qué
  bases tenga Hermes (T3). Si no se arreglan antes, la red: el módulo arranca **sin director** (una sesión que trabaja sola, como el kit
  hace con un "módulo solo") o como hoy.
- **26 hallazgos** entre los tres (con repetidos: quedan 20 distintos): **4 traban mañana**, **8 te cambian algo** del día a día, el resto es
  de taller. **2 preguntas para vos** (abajo).

## Lo que traba mañana

| # | Qué pasa | Escenario | Arreglo (recomendado) |
|---|---|---|---|
| **T1** | **La adopción no trae las skills del director y el obrero**, pero sí sus scripts (`lib/adoptar.cjs:411-413`: las piezas opcionales quedan en "no"; `catalogo.cjs:70` trae `worktree.cjs`) | El Arquitecto arma el módulo con director, abrís la pestaña y `/director` no existe | `adoptar` prende `director-obrero` y `estado` por defecto en un repo con código, como ya hace el Modo A (`--nuevo`); y `modo-b.md:54` chequea la skill, no solo el script |
| **T2** | **La pestaña nueva no sabe qué rol tiene.** La línea para pegar dice `inicio — ejecutá …SPEC.md` (`modo-b.md:64`, `formato-spec.md:104`) y el `/inicio` no deriva a `/director` (ni a `/obrero`): mide el pedido como "más que chico" y vuelve a llamar al Arquitecto, que en una rama de módulo se apaga | La primera sesión del director no arranca, o se pone a codear en la rama del módulo | `worktree.cjs` y `autorizado` imprimen el primer mensaje exacto (`/director` · `/obrero <x>--<ID>`), y el `/inicio` con `.kit-rol` = director u obrero deriva a su skill sin medir |
| **T3** | **Con una base de producción y ninguna de prueba, el sello del spec se niega** (`arquitecto.cjs:236-238`), y la única salida es aflojar un freno con tu firma | Si Hermes solo tiene la base real, el Modo B no puede sellar el spec del módulo | Ver la **pregunta 1** |
| **T4** | **La guía dice que "preparame esta PC" llega recién con la versión oficial** (`GUIA-DE-USO.md:123,127,133,188,194`, `EQUIPADOR.md:8-10`) y manda a la instalación v2 | Si le hacés caso, la PC queda a medias (sin frenos ni `kit-pc.md`) | Borrar esas advertencias: anda desde la `rc.1` (ya lo verificó el revisor: `ultimo-tag` da `v3.0.0-rc.1`) |

## Lo que te cambia algo (para la rc.2, salvo que digas otra cosa)

1. **Hermes quedaría salteado por la flota para siempre** (ALTO): la flota saltea los repos con ramas `modulo/*` vivas, y al terminar un
   módulo nadie borra la rama de GitHub (`flota.cjs:264`, `worktree.cjs cerrar`). La `rc.2` no le llegaría nunca. → `cerrar` borra también la
   rama remota si está mezclada, y la flota saltea solo las ramas no mezcladas. *(No traba mañana; sí la rc.2: va primero en la tanda.)*
2. **Quién corre "aprobar" está dicho distinto** en el `/cierre` ("jamás lo corras") y en el portero (que pide tu clic). → Una línea igual en
   todos lados: "cuando el dueño lo pide, la sesión corre `cambios aprobar` y su clic es la firma; nunca por su cuenta". Puede trabar el primer
   freno propio de Hermes: conviene en la tanda de mañana.
3. **Una mezcla que choca se resuelve sola** (un Claude acotado, sin preguntarte), y en el repaso dijiste que preguntara. → Ver la **pregunta 2**.
4. **El `CLAUDE.md` de Hermes no se toca al adoptar**: queda sin "El tamaño del pedido" y con su director/obrero propio vivo, que choca con
   `/director`. El `doctor` solo te dice "pegala a mano". → La pantalla de adopción propone los dos cambios, con tu OK.
5. **Después de integrar un módulo, los papeles de `main` quedan atrás y nadie te lo dice** (hasta que llegue el obrero de cierre de tramo,
   rc.2). → `integrar` imprime "después: `/cierre` en tu carpeta", y el `/inicio` avisa si hubo un merge de módulo después del último handoff.
6. **El manual del Equipador no cuenta las cuatro opciones de las skills adaptadas** ni que la adopción prende los controles de git en tu
   carpeta (`EQUIPADOR.md:78-79,96-112`). → Un párrafo con las cuatro salidas y qué pierde cada una.
7. **El manual del Arquitecto dice que el Modo A monta el molde v2** y habla de un `SPEC-0.md` en la raíz (`COMO-USAR-EL-ARQUITECTO.md`). → Al día con el 8b.
8. **El consultorio recomienda `acceptEdits`** para dejar algo trabajando, y decidiste `auto` (`consultorio.md:28`). → `auto`, con `acceptEdits` de respaldo.

## De taller (decididos por la sesión, ADR-034; van a la rc.2)

- **Nadie le dice a la sesión que anote los cambios de método** en `.claude/cambios/` (ningún `SKILL.md` nombra `cambios nuevo`): sin eso,
  `cambios-flota` y el retiro automático no tienen datos. → Una línea en el `CLAUDE.md` del molde y en el `/cierre`. `[coherencia · acordarse de menos]`
- **La migración del `CAMBIOS.md` de Hermes no tiene receta**: `migrar-cambios.cjs` existe pero ningún texto lo nombra, y la propuesta de
  adopción dice un código interno ("P6.8b, orden 7"). → Un paso en `flota.md`, dentro del mismo OK de la adopción (`--plan`, después
  `--commit`). **Mañana lo corre la sesión a mano**, con la receta de D7.1, si querés ver los 103 cambios en la tabla. `[workflow · coherencia]`
- **La línea de fondo del obrero solo anda en Bash** (`encargo.cjs:349`: `&&` y `printf`). → En `director/SKILL.md`, "corréla con la herramienta Bash". `[mejor código]`
- **`flota.md` no dice de dónde sale el clon de la adopción ni cómo vuelve a tu carpeta** (el Modo A sí). → Dos renglones, igual que `modo-a.md`. `[coherencia]`
- **El Arquitecto todavía apunta a los moldes v2** en `templates/` (`arquitecto/SKILL.md:37`, `modo-b.md:66`). → Apuntar a `adoptar`; `templates/universales` a `legacy/`. `[coherencia]`
- **El texto del obrero y el del `CLAUDE.md` del molde quedaron del diseño anterior** (la ventana en `acceptEdits`; "preguntás únicamente las 5"). → Al día con `auto` y con el paso 9 del `/inicio`. `[coherencia]`
- **El ruteo del Arquitecto busca borradores de Modo A solo en `*/SPEC-0.md`** y `modo-a.md` ya los pone en `docs/modulos/v1/SPEC.md`; `flota.md:23` conserva el texto viejo de las adaptadas; la línea del banner no figura en los manuales. → Alinear. `[coherencia]`
- **`SCRIPTS.md` y `MOLDE.md` sin lo nuevo del 8b** (`resolver`, `--nuevo`, `--principal`, la versión con `-rc`, `desde:`); el **README** manda a la instalación v2. → Al día. `[consistencia]`
- **`flota todo` sin `--tag` manda el último tag, rc incluido, a todos los proyectos con ficha.** Hoy solo Hermes va a tener ficha, así que no
  muerde; **queda escrito** para cuando se sumen otros. `[acordarse de menos]`

## Las preguntas para vos (mañana, antes de adoptar)

1. **¿Hermes tiene una base de prueba o solo la de producción?** *(T3)*
   - **Si tiene una de prueba** (o una copia local): se declara en la ficha y el sello anda. Nada que decidir.
   - **Si solo tiene la real**, dos caminos: **(A, recomendada)** que el primer encargo del módulo sea "montar una base de prueba" y el sello
     lo acepte cuando el spec trae esa tarea 0 (es lo que el diseño quería: los obreros nunca prueban contra producción); **(B)** aflojar el
     freno de "entorno de prueba" en Hermes con tu firma (más rápido, pero los obreros quedan sin dónde probar).
   - *Qué cambia en tu día*: con A, el módulo arranca con un paso más (la base de prueba); con B, arranca ya, y las pruebas las hacés vos.
2. **Cuando una skill adaptada choca con la versión nueva, ¿la resuelve sola o te pregunta?** Hoy la resuelve un Claude acotado y un script
   revisa lo que hizo; en el repaso dijiste "pregunta cuando la mezcla choca".
   - **(A, recomendada) Que pregunte**, como dijiste: queda en "te espera" con la propuesta armada, y en el `/inicio` elegís. Es tu skill.
   - **(B) Que la resuelva sola** y te avise en una línea.
   - *Qué cambia en tu día*: con A, una pregunta por skill que choque (pocas); con B, ninguna, pero puede cambiar algo tuyo sin que lo veas.

## Lo que esto no cierra

- No se corrió nada sobre el Hermes real (`adoptar --mirar` es lo primero de mañana, y ahí se verá lo que ningún revisor pudo: sus hooks
  propios, si quedan duplicados con los del kit, y qué hace su `comando-test`).
- No se revisaron a fondo `escritura-docs`, `niega-aprobar` ni los casos límite de la mezcla.
- Lo de producción en Hermes se apoya en el portero `sensible` y en los permisos de la base: la guardia de migraciones pide un comando `db`
  que Hermes no tiene.
