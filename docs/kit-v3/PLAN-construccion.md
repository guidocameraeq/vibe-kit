# Plan de construcción del kit v3 — el tracker de la misión 5

> **Qué es**: la vista de una pantalla de la misión 5. **El plano es [`SPEC-0-kit-v3.md`](SPEC-0-kit-v3.md)**: qué se construye, el
> orden, la prueba de cada pieza. Esto lleva **por dónde vamos**: qué sesión hizo qué, qué quedó a medias, qué se verificó.
> Lo pidió Guido el 2026-10-27, al ver que eran ~20 sesiones (hoy 13 directores, ADR-028): "para hacerlo en secuencia, hacerlo bien, que no se pase nada por alto".
>
> **Reglas**:
> - **Cada director de la misión 5 abre leyendo esto** (el `/inicio`), y **lo actualiza en su `/cierre`**: su fila, las piezas, los
>   NO VERIFICADO y criterios que tachó. El spec solo recibe los `✅ <fecha>` de sus piezas (sección "Ejecución").
> - **Un director = una fila.** Si un paquete no entra en un director, se parte en dos filas; nunca se sigue en el mismo chat.
> - **Lo que no se hizo se escribe**: si una sesión deja algo a medias, va a "Pendientes del paquete" con qué falta. Nada vive solo en
>   el handoff.
> - **Si el plan cambia** (un paquete necesita otra sesión, algo se reordena), se cambia acá con la razón en "Cambios al plan".

## Cómo se trabaja: un director por paquete (ADR-028)

Cada paquete lo lleva **una sesión director en Opus**, que piensa, reparte y revisa; **el código lo escriben subagentes**. Así las ~20
sesiones bajan a 13 directores y el contexto de cada director queda acotado a su paquete. El tracker es la memoria entre un director y el siguiente.

1. **Abrir**: `/inicio` lee este tracker, la parte del spec del paquete y las secciones citadas de su diseño. Nada más.
2. **Spec delta** (`docs/kit-v3/SPEC-paquete-<N>.md`, formato SPEC-0/delta): las piezas, qué NO SE TOCA, cómo se prueba, y **la lista
   de encargos** (abajo). Los de los paquetes 1 a 3 **los sella Guido a mano**; desde el 4, el script del sello. **El director frena acá.**
   *(Salvo D3.1, que lo sella provisorio sin Guido: "Cambios al plan", 2026-10-29.)*
3. **Red team** si toca permisos, secretos o datos (paquetes 2 a 5 seguro): subagente Opus con el agente `redteam-spec`, **una ronda** (ADR-029; antes hasta 3).
   Lo que vuelva como decisión de diseño **se lo lleva a Guido**; lo demás lo integra. Los informes al repo privado.
4. **Encargos**: el director parte el paquete. Cada encargo dice **qué archivos puede tocar, qué prueba tiene que pasar y qué no se
   toca**. **Sonnet** para lo mecánico (parsers, pruebas, documentos, plantillas); **Opus** para hooks, seguridad, permisos y lo que
   decide. Dos encargos en paralelo solo si no comparten archivos, cada uno en su worktree; si no, uno detrás del otro.
   **Las pruebas de cada encargo, proporcionales al riesgo** (ADR-029): casos de sí y de no de lo que cambia; **mutación** solo al construir
   una pieza que decide un freno o un permiso, sobre esas reglas, **tope 20 min**; **el corpus**, una muestra (~2.000) y solo si cambia
   lo que frena al humano (el corpus entero, una vez por paquete, al final).
5. **Revisar**: el director **lee cada diff y corre las pruebas él mismo**. El resumen del subagente no es evidencia. Si un encargo
   falla, se rehace con lo aprendido o va a "Pendientes"; nunca se tapa.
6. **Pruebas que un subagente no puede hacer** (un chat nuevo para ver el hook, un pop-up de VS Code, la segunda PC): el director las
   lista en "Pendientes" con qué hay que mirar, y se hacen en una sesión real (la del director siguiente, o Guido).
7. **Revisor frío** al cerrar: subagente Opus sin contexto, sobre el diff entero del paquete. **Una vuelta, hasta 10 hallazgos, cada
   uno con su escenario del día normal** (dos PCs, `pull`, merge, worktrees, un proyecto nuevo); sin escenario no se reporta. **Contra
   accidentes, no contra trampas**: lo que necesita un agente que quiere esquivar el freno va a "Lo que esto no cierra", sin arreglo. Los
   arreglos, en **un solo encargo** (Sonnet si son chicos); sin segunda vuelta (ADR-029).
8. **Cerrar**: `kit-sync.sh sync` LIMPIO, los `✅ <fecha>` en el spec, la línea en el CHANGELOG, este tracker al día, `/cierre`.

**Presupuesto** (ADR-029): **~4 h de reloj y ~8 encargos por director**. Al llegar, cierra limpio (lo hecho en `main`, lo que falta en
Pendientes con su porqué) y Guido decide si sigue otra sesión; no se estira a 9 h. La fila del director anota horas, encargos y tokens.
La suite entera corre **una vez**, al final.

**Límites**: un subagente no lanza otros subagentes ni le puede preguntar a Guido: todo lo que necesite una decisión vuelve al
director. **El director no edita código**: si se encuentra arreglando a mano, el encargo estaba mal escrito y se reescribe.
**El director no corta por contexto: termina su fila** (dentro del presupuesto de arriba) (Guido, 2026-10-29: D1.1 y D2.1 cerraron con mucho contexto de sobra, y D2.1
propuso partir con 26% usado). Si la app compacta, relee este tracker y su delta antes de seguir editando.

**Modelos** (decisión de Guido, 2026-10-27): director, red team, revisor frío y encargos de riesgo en **Opus**; encargos mecánicos **y
los arreglos chicos** en **Sonnet** (ADR-029). **Fable** solo en la sesión donde Guido decide algo nuevo.

### Cómo decide una sesión sin Guido: la vara (ADR-030)

Vale para **toda decisión** de una sesión que trabaja sin Guido (el delta, lo que traiga el red team o el revisor frío, un encargo que
se desvía, qué se arregla y qué no). "Decidís con la recomendada" quiere decir: **la que mejor pasa esta vara**, no la más completa.

1. **Tus cuatro cosas** (las de Guido, 2026-10-24): ¿mejora el **workflow**? ¿da **mejor código**? ¿más **consistencia**? ¿hay que
   **acordarse de menos**? Cada decisión que se anota lleva su etiqueta, por ejemplo `[workflow · acordarse de menos]`. **Si no mueve
   ninguna, sobra: se descarta.**
2. **El filtro pragmático**: ¿corrige un error real o es "por las dudas"? ¿Lo que cuesta (horas, tokens, encargos, pruebas) se paga con lo
   que mejora? Si es overkill, se recorta a lo que rinde y el resto se anota como riesgo. No se aplica "todo" porque venga en una lista.
3. **Los 11 criterios del diseño** ([`docs/mision-4/PLAN.md`](../mision-4/PLAN.md), "Los 11 criterios"), como desempate. Deciden sobre
   todo el 1 (menos intervención de Guido), el 2 (pragmático), el 4 (software que anda y se sostiene) y el 5 (tokens y el modelo justo).
4. **Contra accidentes, no contra trampas, y con el presupuesto de la sesión** (ADR-029).

**Si con la vara no alcanza** (dos opciones empatadas en las cuatro cosas, o una que contradice el SPEC-0 o un ADR y no se puede hacer
reversible): **no se decide**. Va arriba de Pendientes como pregunta para Guido, con las opciones, sus pros y contras y la recomendada, y la
sesión sigue con lo que no depende de eso. Lo que sí se decide y es grande se marca ⚠️, como siempre.

## El estado, de un vistazo

| Paquete | Qué | Directores | Estado |
|---|---|---:|---|
| 0 | Misión 4½: ordenar la casa, `v2.4.3` | 1 | ✅ 2026-10-27 |
| 1 | La ficha del kit, el parser, `kit/VERSION`, los repos de prueba | 1 | ✅ 2026-10-28 ([`SPEC-paquete-1.md`](SPEC-paquete-1.md)) |
| 2 | Documentos con tope, hook en node, candado, `cambios`, `/inicio` y `/cierre` v3, **la zona propia (P3.2)**, `pruebas/pedidos.md` | 2 | ✅ 2026-10-29 (D2.1 y D2.2; lo que espera a Guido, en Pendientes) ([`SPEC-paquete-2.md`](SPEC-paquete-2.md)) |
| 3 | Seguridad: corrector de secretos, barreras, hooks por PC, `doctor` mínimo | 3 | ✅ 2026-10-30 (D3.1, D3.2, D3.3; **te espera**: instalar los hooks por PC en las dos PCs, la pestaña real, borrar 4 transcripts de prueba: Pendientes) ([`SPEC-paquete-3.md`](SPEC-paquete-3.md)) |
| 4 | El Arquitecto v3, el script `worktree`, el sello, `formato-spec.md` | 2 | ✅ 2026-10-30 (D4.1 y D4.2; **te espera**: el Arquitecto en un proyecto v2 de verdad, la pestaña en un worktree: Pendientes) ([`SPEC-paquete-4.md`](SPEC-paquete-4.md)) |
| 5 | Director/obrero, `/estado`, resumen del día, la mesa, subagentes | 2 | ⬜ |
| 6 | Equipador v3, actualizador, adoptador, `doctor` completo | 1 | ⬜ |
| 7 | El ciclo de `cambios` (flota, migración de Hermes) y la portada | 1 | ⬜ |
| 8 | El observatorio mide la línea base; playbook, guía y manuales al día | 1 | ⬜ |
| 8½ | Deptos prepara sus credenciales (**lo hace Guido**, sin director) | 0 | ⬜ |
| 9 | Piloto en Deptos, un mes; después Hub y Portal | 2 en la madre | ⬜ |
| 10 | Tag `v3.0` y nota de migración | 1 | ⬜ |
| | **Total** (sin el 0, ya hecho) | **14** | |

Estado: ⬜ sin empezar · 🔨 en curso · ✅ cerrado (con fecha) · ⏸️ frenado (con razón).

## Los directores

Título de cada sesión: `vibe-kit M5 · D<paquete>.<n> · <qué hace>`. La fila se llena en el `/cierre` de ese director. En "Encargos",
cuántos lanzó y en qué modelo (por ejemplo `4 Sonnet · 2 Opus`): es la medida de la misión 6.

| Director | Qué lleva | Fecha | Chat | Encargos | Commit | Resultado |
|---|---|---|---|---|---|---|
| D1.1 | Paquete 1 entero: spec delta (Guido sella), ficha, parser, `VERSION`, `pruebas/rehacer.sh` | 2026-10-28 | `vibe-kit M5 · D1.1 · Paquete 1: la ficha del kit y su parser` | 5 Sonnet · 1 Opus (revisor frío) | `68b75e1`…`16f7cb2` | ✅ Criterios 1-8 del delta verificados por el director; parser con 255 pruebas y 0 mutantes vivos en las reglas; el revisor frío cambió la gramática antes de congelarla (3 ALTOS) y Guido decidió `herramientas` aparte |
| D2.1 | Paquete 2, primera mitad: spec delta + red team, `docs/` en capas, handoff y TODO con tope, hook node | 2026-10-28 | `vibe-kit M5 · D2.1 · Paquete 2, primera mitad: docs en capas, handoff y TODO con tope, hook node` | 4 Sonnet (mudanza, E1, E3, E6) · 7 Opus (redactor del delta, red team ×3 rondas, E0, E2, E4, E4b, E5) | `cf21f40`…`ab64c22` y el cierre | ✅ Criterios 1-15 del delta; suite **496 verde**; mutación por encargo 87/87 · 82/82 · 88/91 · 28/30 · 35/35 y control del director 6/6. **E4b** (fuera del delta): el hook de arranque tardaba 10-24 s con la PC cargada contra un `timeout` de 20 → plazo propio de 10 s. Hook de escritura medido: 5.007 `Write`, 0 frenadas sobre los seis y las tres |
| DP | Sesión intermedia (pedido de Guido): planear la paralelización de lo que queda | 2026-10-29 | `vibe-kit M5 · DP · Planear la paralelización de lo que queda` | 0 | el cierre de DP | ✅ **Decidido: no se paraleliza**; la misión sigue un director por vez, en el orden de esta tabla (ver "Paralelizar") |
| D2.2 | Paquete 2, segunda mitad: candado, `cambios` base y su sello, la zona propia (P3.2), `/inicio` y `/cierre` v3 con `pedidos.md`, revisor frío | 2026-10-28/29 (sin Guido) | `vibe-kit M5 · D2.2 · Paquete 2, segunda mitad: candado, cambios, zona propia, /inicio y /cierre v3` | 6 Sonnet (F1, F5, F6 con 3 correcciones, F7, sesión real `-p`, diez pedidos ×2) · 6 Opus (red team ×2 rondas, F2, F3, F4, revisor frío ×3 vueltas, RF-fix ×3) | `12b7317`…el cierre | ✅ F1-F7 y los "hecho cuando" de 3.2, 3.10, 5.2, 6.1, 6.8a; 5.1 con salvedad (diez pedidos: 6 de 10). Red team r4-r5 (5 ALTOS) y revisor frío (6 ALTOS en tres vueltas) integrados; suite **verde** (cifra en el CHANGELOG); mutación por encargo 24/24 · 67/68 · 98/99 · 99/105 · 43/48 · 10/11 (vivos equivalentes, explicados) y control del director 3/3 + 3/3. Criterio 14 ✅; 6, 12, 17, 18, 20 con lo que falta escrito. **Decisiones sin Guido**: abajo |
| D3.1 | Paquete 3: spec delta + red team (obligatorio), corrector, barreras, hooks por PC, `doctor` mínimo | 2026-10-29 (sin Guido; frenada por cuota) | `vibe-kit M5 · D3.1 · Paquete 3: seguridad — corrector, barreras, hooks por PC, doctor mínimo` | 4 Sonnet (G0b, G1 corpus, G2, G8) · 8 Opus (G0, redactor del delta, red team ×2 rondas, G9; G3, G4, G5, G6 frenados a medias) | `1116698`…el cierre parcial | 🔨 **A medias, punto de corte pedido por Guido por la cuota.** Delta **sellado sin Guido** (r1: 6 ALTOS integrados; r2: 0 ALTOS). G0 y G0b verdes: `onFailure: "block"` frena las cuatro fallas, la forma exec anda sin Git Bash. En `main`: **G2** `comando.cjs` (976 casos, mutación 384/384), **G8** `cargar-secreto` (38/38, corridas por el director), **G9** `db-guardia.cjs` (38/38 por el director, mutación 51/52, el vivo equivalente y sacado). **G3-G6 en ramas WIP** (Pendientes). Huella del `~/.claude/` real igual a la de la apertura. **Decisiones sin Guido**: abajo |
| D3.2 | Paquete 3, segunda vuelta: terminar G3, G4, G5 y G6 desde sus ramas WIP (medición, mutación, pruebas), mergearlos y borrar las ramas | 2026-10-29 (sin Guido, PC `Usuario`) | `vibe-kit M5 · D3.2 · Paquete 3, segunda vuelta: terminar G3-G6 desde sus ramas WIP` | 4 Opus (G3, G4, G5, G6; nunca más de dos a la vez; G3 y G6 retomados tras un corte de cuota) | `10cd6e8` · `6714f43` · `4b28b45` · `7fcc734` y el cierre | ✅ **G3-G6 en `main`, las cuatro ramas `wip/*` borradas de `origin`.** Pruebas corridas por el director: G3 41 (40 + 1 skip hasta que G7 registre el hook), G6 134, G4 306 (con `ficha.test`), G5 29. **Mutación**: G3 136/137 · G6 49/50 · G4 62/64 · G5 178/181 (todos los vivos equivalentes, explicados). **Medición, corpus `Usuario` (16.470 llamadas únicas)**: `git-seguro` 90 frenos, 0 falsos positivos; `sensible` 0 `ask`/`deny` con humano de día con modo (1 `deny` correcto en bypass); `secretos` 38 frenos + 1.003 prompts con 0 frenos, 0 falsos positivos (empezó en 308: corregido). Suite: cifra en el CHANGELOG. **Decisiones sin Guido**: abajo |
| D3.3 | Paquete 3, cierre: G7, G10, G11, G12, G13, revisor frío, `/cierre` completo | 2026-10-29/30 (sin Guido, PC `Usuario`; ~10 h de reloj, 18 h de agentes, 21 M de tokens nuevos) | `vibe-kit M5 · D3.3 · Paquete 3, cierre: githooks, instalador, doctor, sesión real, revisor frío` | 3 Sonnet (G11, G12, G13) · 14 Opus (G7, G10, G5b, G6b, revisor frío ×2 vueltas, RF-A, RF-B, RF-C, RF-D, RF-A2, RF-B2, RF-C2, RF-D2; dos se colgaron y se retomaron) | `797eddc`…`387f481` y el cierre | ✅ **G7** githooks con candado doble y gitleaks, todos los hooks registrados en forma exec; **G10** instalador por PC (`--plan`, `--quitar` byte a byte, `--sacar-viejo`); **G11** `doctor` (14 chequeos); **G12** `rehacer.sh` con el paso "orden 3"; **G13** sesión real con `claude.exe` (niega-aprobar en bypass, `salir-del-worktree` y `frenos-del-proyecto` vivos); G5b y G6b de yapa. Pendientes a-g de D3.2 y a-d de D2.2 cerrados salvo (e), que es de `clientes`. Revisor frío: dos vueltas, todo lo del día normal arreglado; el resto a "no cierra". Suite y mutaciones: cifras en el CHANGELOG. Huella del `~/.claude/` real igual a la de la apertura. **Decisiones sin Guido**: arriba |
| D4.1 | Paquete 4: spec delta + red team, Arquitecto v3, sello, `formato-spec.md`, `worktree` y `.kit-rol` | 2026-10-30 (sin Guido, PC `Usuario`; **~3,2 h de reloj, ~2,9 h de agentes, ~2,0 M de tokens de subagentes**) | `vibe-kit M5 · D4.1 · Paquete 4: Arquitecto v3, sello, formato-spec, worktree y .kit-rol` | 3 Sonnet (J4, J5a, J5b) · 7 Opus (redactor del delta, red team ×1, J1, J2, J3, revisor frío ×1, RF-fix) = **10** (ADR-029: ~8) | `42344e4`…el cierre | 🔨 **El código del paquete entero en `main`**: `arquitecto.cjs` (`sello` con hash, `ready`, `--pendientes`, `tope`, `entorno`, `registro`), `worktree.cjs` (`crear`, `abrir`, `sync-env`, `cerrar`, `.kit-rol`, filtro de credenciales que falla cerrado), el Arquitecto v3 (5,6 KB, cinco entradas, la línea primero, `modo-a`/`modo-b`/`flota`, `formato-spec` v3), la regla del tamaño en el molde. Delta **sellado sin Guido y por script**; red team 1 ronda (5 ALTOS integrados); revisor frío 1 vuelta (9 hallazgos, todos arreglados en un encargo). Pruebas por encargo 35 · 19 · 39 → 99 tras RF-fix, verdes corridas por el director; **mutación J1 72/75 · J2 32/33** (vivos equivalentes). Sesiones reales: obrero en su worktree desde PowerShell ✅ (crit. 17 tildado, `.kit-rol` mitad PowerShell); **diez pedidos 8 de 10** (eran 6; fallan 8 y 10); **el Modo B corto no se midió** (el pedido 14 estaba mal armado: con el plan adentro es chico por la regla). Suite y huella: en el CHANGELOG. **Sigue en D4.2** (abajo) |
| D4.2 | Paquete 4, cierre: el Modo B corto de punta a punta (crit. 4), 10 de 10, el prototipo, el ✅ del paquete | 2026-10-30 (sin Guido, PC `Usuario`; **~1,15 h de reloj (1 h 09 min), ~0,4-0,6 M de tokens de subagentes** más 10 sesiones `claude.exe -p`) | `vibe-kit M5 · D4.2 · Paquete 4, cierre: Modo B corto real, 10 de 10 y prototipo` | 3 Sonnet (K1 texto, K2 `rehacer.sh`, K3 corridas, retomado dos veces) = **3** (ADR-029: ~3) | `31b7dac`…el cierre | ✅ **Paquete 4 cerrado.** K1: la regla del tamaño (charla con el dueño, siempre invoca de noche), el prototipo siempre en `modo-b.md`, el pedido 14 rearmado y el 14b; `skills.test` + `arquitecto.test` 80/80 corridas por el director. K2: `rehacer.sh` pone el `CLAUDE.md` del molde (las corridas de D4.1 medían sin él; el no, probado). K3: **crit. 4 del kit ✅** (14: sin preguntas, `ready` 0 en ~3 min, commit en `main`, rama y worktree con `.kit-rol` = `director`), **crit. 2 ✅ 10 de 10** (1, 2, 6, 7, 8, 10 hoy), **16 ✅** (criterio reescrito, D4.2-3); **14b a medias** por el armado (D4.2-4). Bypass frenado por el clasificador → `acceptEdits` + `--allowedTools` (D4.2-2). Suite entera **2.192 de 2.192** verde (19 min, una vez, al final). **Decisiones sin Guido**: arriba |
| D5.1 | Paquete 5, primera mitad: spec delta + red team, el canon director/obrero y sus correctores | 2026-10-30 (sin Guido, PC `Usuario`; **en pausa** a las 16:20 por el corte de internet de Guido) | `vibe-kit M5 · D5.1 · Paquete 5, primera mitad: delta, red team y el canon director/obrero` | 1 Sonnet (E4) · 4 Opus (redactor del delta, red team, E1, E3) hasta la pausa | `5a3a1c9` (delta sellado) · `40d3450` (E4) | 🔨 **En pausa, se retoma en esta misma sesión.** En `main`: el delta sellado sin Guido (red team 1 ronda, 4 ALTOS integrados) y **E4** (núcleo, `/director`, `/obrero`, plantilla del encargo, revisor; `skills.test` 72/72). **E1** (`encargo.cjs`: `presentar`, `mensaje`, `sello.cjs` al molde) y **E3** (`worktree integrar`) commiteados WIP en `d5.1/e1` y `d5.1/e3` (worktrees del scratchpad). Falta: terminar y mergear E1 y E3, E2 (`autorizado`, `verificar`), las filas 1-2 reales, revisor frío y arreglos, suite, `/cierre` |
| D5.2 | Paquete 5, segunda mitad: `/estado`, resumen del día, subagentes, `CLAUDE.md` por criterios, la mesa | | | | | |
| D6.1 | Paquete 6: Equipador v3, actualizador, adoptador, `doctor` completo, "toda la flota" en los repos de prueba | | | | | |
| D7.1 | Paquete 7: el ciclo de `cambios` y la portada | | | | | |
| D8.1 | Paquete 8: medir la línea base; playbook, guía, manuales | | | | | |
| D9.1 | Arrancar el piloto en Deptos | | | | | |
| D9.2 | Medir el mes del piloto contra TABLERO §1 | | | | | |
| D10.1 | Tag `v3.0` y nota de migración | | | | | |

### D2.2 · Decisiones sin Guido

D2.2 corrió sin Guido, con su autorización previa (Cambios al plan, 2026-10-29): cada decisión, con la recomendada. **Las ⚠️ (formato
que viaja, barrera, o contra el SPEC-0 o un ADR) van arriba, y todas se deshacen antes del tag.** El detalle técnico, en la sección
"D2.2 — el detalle" del delta.

- ⚠️ **Te espera una pregunta (r4-1 b del red team): una sesión en bypass, en tu checkout principal, puede fabricar un `aprobado` sin
  tu clic** (escribe el archivo, el renglón y el commit por Bash) y queda igual a uno legítimo. El orden 2 no lo puede cerrar: lo delata
  `/inicio` ("aprobados nuevos desde tu última sesión"), y el orden 3 suma el hook de 4.5 y el pre-commit. *Lo que decidí*: aceptarlo
  hasta el orden 3 y dejarlo escrito en el delta. *Alternativa*: frenar el paquete hasta que algo fuera del alcance de Bash firme el sello.
  Vos decidís si te alcanza.
- ⚠️ **`ids:` en el archivo de `cambios` (r2-4 entra, ampliado por el red team, rondas 4 y 5).** Todo cambio `3-barrera` declara los ids
  que cambia (frenos de la ficha, cada archivo de hook, cada regla de `settings`, y `nivel`/`pieza:candado`/`pieza:hook-escritura` cuando
  aflojan), y `barreras` da rojo si el commit cambia otro. *Alternativa*: dejar r2-4 como riesgo escrito. *Por qué*: es justo el hueco
  "aprobaste quitar X y se quitó también Y" (y "tocar el hook A" vaciando el B), y el chequeo es mecánico. Campo nuevo en un formato que
  viaja: se saca borrándolo del script y del candado.
- ⚠️ **`estructura.cjs` y `cambios.cjs` cuentan como barrera** (categoría `hooks`), además de la lista del SPEC-0 4.6. *Alternativa*: la
  lista tal cual. *Por qué* (r4-3): si no, un commit edita el candado para que dé verde y quita un freno en el mismo commit.
- ⚠️ **Borrar la ficha o volverla "a fábrica" no apaga las barreras** (r4-2): la exención (b) vale solo la primera vez que nace la ficha.
- ✅ **Resuelto por Guido (2026-10-29): `niega-aprobar.cjs` niega en `bypassPermissions` y `dontAsk`, y en `auto` pregunta.** D2.2 lo
  había hecho negar también en `auto` (el SPEC-0 nombraba los tres); Guido trabaja siempre en `auto` y ahí la ventana aparece, así que
  negar era fricción. Bypass sigue negado porque los obreros nocturnos corren en bypass: sin el freno, un agente se aprobaría solo. Sigue
  negando sin modo en la entrada, y en todos los modos con ventana **devuelve "preguntar"** (r4-1). SPEC-0 4.5, 6.8a y criterio 18 corregidos.
- ⚠️ **Los hooks que niegan y el de escritura no corren su `.propio.sh`**; solo el de arranque (E §5 decía "los hooks llaman al hermano").
  *Alternativa*: todos lo corren. *Por qué*: un `.propio.sh` que imprime `allow` destrabaría un freno sin pasar por `barreras`.
- Las fichas de fábrica van en `kit/molde/hooks/lib/fabrica/`, no en `kit/molde/`. *Alternativa*: `kit/molde/ficha.<nivel>.md`, como
  el delta. *Por qué*: así se instancian bajo `.claude/hooks/**`, que es barrera, sin una regla nueva de instanciación.
- El candado con `piezas.candado` **ausente** queda apagado (corre solo `barreras`). *Alternativa*: "no es `no`" = prendido. *Por qué*:
  Cruces 8 y B §14 (un repo adoptado arranca con el candado apagado).
- `estructura.cjs parcial` = `topes` del handoff **más `barreras`**. *Alternativa*: solo `topes` (B §14). *Por qué*: el cierre parcial
  también commitea.
- Pendiente (a) de D2.1: `hook-escritura: molde` **sigue sin hash** hasta el orden 6. *Alternativa*: `{estado, hash}` ya. *Por qué*: nadie
  lo lee antes del actualizador, que es el que define qué piezas llevan hash.
- Pendiente (d) de D2.1 (`KIT_PLAZO_ARRANQUE_MS` en `doctor`) **pasa al paquete 3**: `doctor` no existe todavía.
- La exención (b) compara contra las fichas de fábrica **del árbol del padre** si las tiene, y si no, las del commit. *Por qué*: que el
  commit no se certifique solo cuando ya había kit.
- `cambios aprobar` también se niega **con ficha rota** y con cambios sin commitear en el archivo del cambio o en `frenos.log`.
- El hash de `piezas.settings` = el del `settings.json` del molde (serialización estable); el desvío lo dice `desviosSettings` por regla.
- `niega-aprobar.cjs` reconoce el comando por contener `cambios` y `aprobar` (ancho a propósito: el falso positivo solo frena donde aprobar
  no vale), sin mayúsculas y sin comillas ni escapes de shell (`apro''bar` no lo esquiva); **niega también un modo que no conoce** (el delta
  decía "en los demás, preguntar"). *Por qué*: un modo nuevo de la plataforma no tiene que abrir la puerta.
- En un archivo de cambio, **un campo desconocido da rojo**, y un clase 2 que nombra una barrera en `toca` también. El renglón del sello se
  busca en el `frenos.log` **del commit del sello** (tiene que agregarlo ese commit), no en el del disco: vale igual en la otra PC.
  `aprobar` se niega si `frenos.log` está ignorado. *Por qué*: lo más estricto que no traba el camino de Guido.
- `barreras` **no mira los commits de antes de que el proyecto tuviera ficha** (la ficha nunca existió antes y el commit no la toca).
  *Alternativa*: mirarlos. *Por qué*: si no, el commit que instala hooks y `settings` antes de crear la ficha queda rojo para siempre; borrar
  la ficha después no saca a nadie de la vista. Las exenciones valen **por archivo** y la (b) cubre **solo la ficha**.
- La exención (a) del `settings` va **regla por regla**, y **una regla que el molde nuevo retira da rojo** (sin el molde viejo no se distingue de
  una del proyecto). *Por qué*: lo que frena. Muerde al actualizador del orden 6 (anotado en Pendientes).
- `candado:rutas` **no exige** lo que el árbol crea a demanda: las tres carpetas de `docs/`, `docs/MAPA.md`, `.claude/frenos.log` y
  `.claude/cambios/` (lo de adentro, sí). *Alternativa*: un `.gitkeep` y un `frenos.log` de arranque en el molde. *Por qué*: git no guarda
  carpetas vacías y el delta ya decía "una carpeta que falta no es falla"; sin esto, el `CLAUDE.md` del molde daba rojo en un repo recién montado.
- En `/inicio` del molde, con el pedido en el mensaje, la sesión dice el tamaño **y sigue**, sin esperar otro OK (criterio 2); el de vibe-kit
  espera el OK, pero es otra skill.

### D3.1 · Decisiones sin Guido

D3.1 corre sin Guido, con su autorización previa (Cambios al plan, 2026-10-29), como D2.2: cada decisión con la recomendada, **las ⚠️
arriba**, todas se deshacen antes del tag. El detalle, en [`SPEC-paquete-3.md`](SPEC-paquete-3.md).

- ⚠️ **Sellé yo el delta del paquete 3** (provisorio, como autorizaste), después de la ronda 2 del red team sin ALTOS (r1: 6 ALTOS
  integrados; r2: 0 ALTOS, 11 medios/bajos integrados). *Alternativa*: esperarte. Repasalo al volver: las ⚠️ de abajo son lo que más pesa.
- ⚠️ **D-1 · Las 5 de A salen de un hook (`sensible.cjs`) que lee `sensible:` de la ficha vigente**, no de reglas `ask`/`deny` escritas en el
  `settings.json` (lo que decía el SPEC-0 6.7). *Por qué*: el `settings` es del árbol de trabajo (el obrero lo edita) y en bypass una `ask` no
  pregunta. *Alternativa*: el script que escribe las reglas en la zona propia.
- ⚠️ **D-2 · Por PC se registra solo el corrector de secretos**, no un hook de arranque por PC (el orden 3 del SPEC-0 nombraba los dos). El
  arranque del proyecto ya dice si el corrector está.
- ⚠️ **D-3 · `secretos:`, `publicas:` y `datos-de-prueba:` de la ficha cuentan como barrera cuando aflojan** (sacar un nombre de `secretos:`
  apagaba un freno sin tu OK). Ids nuevos en `ids:` del archivo de cambio, sin palabra nueva en `toca`.
- ⚠️ **D-4 · El "aprobado de día" para que `db migrar` borre datos reales = la bandera `--borra-datos-reales` + la ventana de `sensible`**,
  no un archivo de `cambios` (el SPEC-0 decía "exige un `aprobado`"). *Alternativa*: `toca: datos`, palabra nueva en un formato que viaja.
- ⚠️ **D-5 · El freno a una clave pegada en el chat (`UserPromptSubmit`) falla abierto**: con `block`, un bug te dejaría sin chat ni para
  pedir el `doctor`. Contradice la regla 4.7 para ese único hook.
- ⚠️ **D-6 · El `deny` de archivos de F §5 (`.env*`, `*.pem`, `*.key`, `secrets/`…) entra al molde ahora**: ninguna pieza lo construía y el
  criterio 11 lo daba por hecho.
- ⚠️ **D-7 · Todos los hooks del kit se registran en forma exec** (`"command": "node", "args": […]`), también los tres que ya existían. Medido
  (G0b): así andan con y sin Git Bash. *Alternativa*: exigir Git Bash.
- ⚠️ **D-13 · Las variables de entorno de git peligrosas van por lista** (`GIT_DIR`, `GIT_CONFIG_*`…), no todo `GIT_*`: `GIT_EDITOR=true git
  rebase --continue` es legítimo.
- ⚠️ **D-14 · Una variable secreta se frena solo cuando su valor sale a la pantalla** (`echo $X`, `$env:X` suelto, con `-v`/`set -x`); como
  argumento de otro programa (`curl -H "…$GH_TOKEN"`) pasa: es "usar sin ver". *Alternativa del red team*: negar toda mención salvo una lista.
- ⚠️ **D-15 · `reset`/`rebase` en `main` se frenan solo si tiran commits ya publicados en `origin`**; sin remoto, preguntan. *Alternativa*:
  negar todo `reset`/`rebase` en `main`, que frenaba tu `reset --soft HEAD~1`.
- D-8 · Versión mínima de Claude Code **2.1.295** (la de la doc; medido en 2.1.309). D-9 · `sensible` solo sobre Bash/PowerShell (las MCP ya
  preguntan solas; sin cicatriz). D-10 · El corrector protege también `.kit-rol`, el `.git` del worktree y lo de adentro del git común (`refs`,
  `config`, `worktrees`…). D-11 · Las líneas de `gh` del arranque, al orden 6. D-12 · Las librerías del hook por PC van copiadas y
  versionadas, con una prueba que exige que sean idénticas a las del molde.
- `gitleaks` con plazo de 60 s y un reintento: en `clientes` tardó **47 s en frío** (Defender) y ~2 s después.

### D3.2 · Decisiones sin Guido

D3.2 corrió sin Guido, con su autorización previa (su prompt, abajo): como D3.1, **las ⚠️ arriba** y todas se deshacen antes del tag.
**✅ Aprobadas por Guido el 2026-10-29**, al leer el resumen del cierre ("me parecen ok").

- ⚠️ **G5 · `archivo-deny` juzga el pipeline por tramos, no entero** (`;`, `&&`, `||`, renglón): la regla "todos los del pipeline en lo
  permitido" vale para los que listan (`ls .env | cat` frena, `gci .env | gc` frena); "usar sin ver" se juzga solo, y después de un `ls`
  pasan los filtros de texto (`grep`, `head`, `wc`). *Alternativa*: el texto literal del delta, que en el corpus daba ~100 falsos positivos
  (`npx dotenv -e .env.x -- … | tail`). *Por qué*: el criterio 14 pide 0 falsos positivos y el caso que se frena sigue frenado.
- ⚠️ **G5 · lo que el delta no nombraba y se decidió con la medición** (de 308 frenos a 38, todos correctos): `npx dotenv -e <ruta>` es "usar sin
  ver" como `--env-file`; un texto con espacios y operadores de shell (`ssh host "cat .env; ls"`, `docker exec`) no es ruta: corre en otra
  máquina; un patrón de `grep` y un comodín sin letras (`*`) no son ruta; `mkdir` permitido; con `source`, el impresor cuenta solo si
  imprime una variable; `node -e`/`python -c` cuentan solo lo de adentro de `print`/`console`; `sk-api` exige letras y dígitos en el cuerpo
  (frenaba ejemplos en mayúsculas). **Más estricto que la tabla**: `ls .env | cat` y `git rm .env` sin `--cached` frenan.
- ⚠️ **G5 · `.env.example` sigue frenado** (14 de los 38 de la medición): F §5 nombra `.env*` a propósito. *Alternativa*: dejar pasar
  `.env.example`. *Por qué*: el que lo cambie lo decide con la cicatriz; un `.env.example` con un valor real existe.
- ⚠️ **G6 · una ref nueva del pre-push va en `--rango <sha de ceros>..<b>`** (lo que git le pasa al pre-push): sus commits son los que ningún
  remoto tiene. *Alternativa*: una bandera aparte, o que G7 pase `origin/<defecto>..<b>`, que sin remoto no anda.
- ⚠️ **G6 · el commit sin padre no se juzga en `--rango`, ni el índice sin `HEAD` en `--indice`**: si no, el primer commit y el primer push de
  todo proyecto nuevo quedaban rojos para siempre (ningún `aprobado` puede existir antes). Una rama huérfana se juzga igual al mergearla.
- **`lib/agente.cjs` entra al molde** (G3, fuera de su "puede tocar"): "sesión de agente" de P4.7 la usan `git-seguro` y `secretos`, y
  `pc/lib/agente.cjs` es su copia byte a byte (la de 32 líneas de D3.1 se reemplazó). G4 tocó el `ESPERADO` de `lib/ficha.test.cjs` (fuera
  de su lista) solo para seguir a `kit.ejemplo.md`; la gramática no cambió.
- **G4 se lanzó cuando terminó G6, mientras G3 seguía** (el prompt decía G3 ∥ G6 y después G4 ∥ G5): nunca hubo más de dos Opus, y G5
  esperó a G3 porque copia su `agente.cjs`.
- G3: `decidir` acepta `opciones.git`, solo para que las pruebas simulen una falla de git; el mensaje de `config-agente` suma la identidad
  por comando (`git -c user.name=… commit`). La prueba "sin node" queda en skip hasta que G7 registre el hook en `settings.json`.
- G4: la clave del caché suma la config del sistema de git y las `GIT_*` del entorno (por fs, sin procesos); un caché con `hasta` que no es
  fecha no apaga nada.
- G5: el `frenos.log` de la PC se escribe solo si el hook corre instalado (con `INSTALADO`): las pruebas del WIP lo escribían adentro del repo.

### D3.3 · Decisiones sin Guido

D3.3 corrió sin Guido, con su autorización previa (su prompt, abajo): como D3.1 y D3.2, **las ⚠️ arriba**, todas se deshacen antes del tag.

- ⚠️ **G5b (fuera de los encargos del delta) · `secretos` suma `sk-viejo`, `conexion-con-clave` y `telegram`.** En `Usuario` el anti-secretos
  viejo no es `block_secrets.ps1` sino `~/.claude/hooks/anti-secretos.js`, y frenaba tres cosas que `secretos` no: si lo sacabas con
  `--sacar-viejo`, se perdían. *Alternativa*: dejarlos afuera (no estaban en la tabla de 4.3). *Por qué*: el instalador te propone sacar el
  viejo; sin esto, sacarlo aflojaba. Medidos: 0 frenos y 0 falsos positivos en el corpus (casi no hay casos: los cubren las pruebas).
- ⚠️ **G5b · `conexion-con-clave` no frena con host local ni con placeholders** (`postgres:postgres@localhost`, `user:password@`, `${VAR}`): el
  viejo sí. *Por qué*: es la base de tu propia máquina (Supabase local), no un secreto, y aparecía en el corpus. Suma `mysql`, `mariadb`,
  `mongodb(+srv)` y `redis(s)` además de postgres. `sk-viejo` exige un tramo de 20+ con letras y dígitos (no frena `sk-learn-…`).
- ⚠️ **G7 · el id de un hook en `zona-propia` suma los `args`.** En forma exec todos los hooks dicen `node`: con el id de antes, `mezclarSettings`
  perdía `git-seguro` y `sensible`. Cambia los ids de hook que se escriben en `frenos.quitados` e `ids:` de `cambios` (un hook en texto, sin
  `args`, mantiene el suyo). Nada llegó a la flota: es gratis ahora.
- ⚠️ **G7 · `escritura-docs` también con `onFailure: "block"`** (P4.7 nombraba los cuatro que niegan Bash). *Por qué*: niega escrituras, y el
  criterio 16 del kit dice "si un hook que niega falla, la acción se frena". Un bug suyo traba los `Write` hasta el `doctor`.
- ⚠️ **G7 · `commit -a` / `commit <rutas>` con una barrera distinta entre el índice aparte y el de siempre → rojo** ("git add y volvé a
  commitear"): el candado leía otro índice y una barrera se colaba con `-a`.
- ⚠️ **G7 · el hook previo (husky, lefthook, `.git/hooks`) se encadena en los tres githooks**, no solo en el pre-commit.
- ⚠️ **G10 · el `deny` del almacén va con ruta absoluta** (`Read(//c/Users/<vos>/.config/kit-secretos/**)`), no con `~`: con `--home`, `~`
  apuntaría a otro lado. **`--quitar` vuelve byte a byte** con una copia del settings de antes en `hooks/kit/settings.antes.json`; si el settings
  no existía, lo borra. **`--sacar-viejo` también instala** (nunca deja la PC sin corrector).
- ⚠️ **G6b · `barreras --molde-viejo`** (adelantado del paquete 6, pendiente F4 de D2.2): con los dos moldes, una regla que el molde viejo traía y
  el nuevo retira puede irse. Sin él, el paso "orden 3" de `rehacer.sh` (la migración a exec) daba rojo, y lo mismo le iba a pasar al
  actualizador. *Alternativa de G12*: aceptar una regla retirada si el molde nuevo trae un hook del mismo script (dejaba pasar un hook propio renombrado).
- G7 · un `aprobado` que vive solo en la rama que se pushea (no en `HEAD`) da un rojo de más: **aceptado**, con un mensaje "pusheá desde esa
  rama" (pendiente b de D3.2). El remoto adelantado da rojo con "hacé `git fetch` y `git pull --rebase`".
- G7 · el runner de los githooks no usa las librerías del kit (copia propia de `rol` y de la ref vigente, con una prueba que exige que den lo
  mismo que `contexto.cjs`); con la ficha rota, los githooks corren con los frenos de fábrica (rf-9), no frenan solos.
- G10 · la versión de `INSTALADO` sale de `~/.claude/VERSION` (la que copia `kit-sync`). Un archivo de `hooks/kit/` editado a mano, el
  instalador lo pisa (el `doctor` lo reporta antes).
- G11 · `doctor` fuera de un repo: `pre-commit` y `ficha` dan ⚠. `claude-code` mira `claude --version` y los nombres de carpeta de las
  extensiones y de la app (la ruta de la app de escritorio, **NO VERIFICADO**). Ningún ✗ nuevo para `git-bash` ni `lefthook` (⚠).
- G12 · el `2b` se congela en `D22=37906e8` (el último commit que tocó `kit/molde/` antes del paquete 3); el paso 3 reescribe el "Próximo
  paso" del handoff de `alfa`/`beta` (`.githooks/` cuenta como código para `candado:estado-viejo`, y le va a pasar igual a un adoptador).
- (e) de D3.2: los regex de los cinco de `block_secrets.ps1` siguen **NO VERIFICADOS** contra el archivo de `clientes` (no está en esta PC):
  te queda a vos. Lo local (`anti-secretos.js` de `Usuario`), cruzado y cerrado en G5b. (g): cerrado (el caché sigue `include.path`).

**Lo que decidió el revisor frío** (dos vueltas, Opus; arreglos RF-A…D y RF-A2…D2, cada uno con pruebas, mutación y la medición del corpus):

- ⚠️ **RF-A · el `pre-merge-commit` no corre el candado** (rf3-1): un merge local con una barrera cambiada lo juzga el `pre-push`, por padre.
  *Por qué*: el candado en el merge frenaba merges legítimos (dos PCs, `pull`). Riesgo escrito en "no cierra": un rol que mergea y nunca pushea.
- ⚠️ **RF-A2 · gitleaks no corre sobre git sino sobre las líneas agregadas** (`gitleaks dir` en un temporal), con el `.gitleaks.toml`
  commiteado: un atributo `-diff`, un `textconv` o un diff externo ya no esconden una clave, y una config del disco distinta no cuenta.
- ⚠️ **RF-A/A2 · todo lo que escribe un githook, verde o rojo, va a `<git-common-dir>/kit-frenos.log`**, no al `frenos.log` versionado
  (antes ensuciaba el árbol y trababa el `pull --rebase`).
- ⚠️ **RF-B/B2 · `git-seguro` frena más**: alias con `--no-verify` (resueltos como git 2.54: `alias.x.command`, mayúsculas), `HOME`/`XDG_CONFIG_HOME`
  delante de git, `GITLEAKS_*`/`NODE_*` cuando llegan al git, `core.attributesFile`/`--attr-source`, `git rm -f` de carpetas-freno, la red de
  rescate, y **`--orphan` en sesión de agente**. Medición: 0 diferencias en 11.304 llamadas.
- ⚠️ **RF-C2 · `secretos` deja pasar más al obrero**: extraer un archivo en la raíz (`tar -C .`, `unzip -d .`), `find -name … -delete` cuando el
  filtro no puede agarrar un freno, y `cp -r <dir>/.` de una carpeta sin `.claude`. Y **sigue los `cd`** (`cd .claude && echo > settings.json`
  ahora frena). Medición: humano 0 diferencias; obrero, 8 falsos positivos menos.
- ⚠️ **RF-D2 · `barreras` juzga una rama huérfana** contra la ref vigente: lo que trae se mira; lo que no trae no cuenta como borrado (una
  `gh-pages` vaciada queda verde). Una prueba vieja cambió de verde a rojo: era el hueco.
- RF-C · `secretos` cuida también los frenos del checkout principal y de los otros worktrees, y deja pasar `$PWD`; `--quitar` repone el
  anti-secretos viejo. RF-D · `barreras` da el `anotar-sha` listo tras un rebase; `sensible` matchea las banderas en cualquier lugar.
- **"De D3.2, fuera del paquete"**: (a) la exención (b) con `publicas:` sin `aprobado` **no se toca** (es la adopción; riesgo en "no cierra");
  (b) `barreras` en un repo sin ningún commit **arreglado** (RF-D, afinado en RF-D2: sin commits = sin `HEAD` y sin ninguna rama).
- **No hubo tercera vuelta**: Guido, al ver ~9 h, puso el tope (una vuelta por paquete; SPEC-0, "Ejecución"). Lo que la segunda dejó, a "no cierra".

### D4.1 · Decisiones sin Guido

D4.1 corrió sin Guido, con su autorización previa (su prompt, abajo) y **con la vara del ADR-030**: cada decisión con su etiqueta. **Las ⚠️
arriba**, todas se deshacen antes del tag. El detalle, en [`SPEC-paquete-4.md`](SPEC-paquete-4.md) ("Riesgos y decisiones"). Ninguna quedó
sin poder decidirse con la vara: **no hay preguntas nuevas arriba de Pendientes**.

- ⚠️ **Sellé yo el delta del paquete 4** (provisorio), después de la ronda única del red team con sus 5 ALTOS integrados; **es el primero sellado
  por el script `sello`** (D4-14; re-sellado en el cierre, `hash d20de2987a9a`). *Alternativa*: esperarte. Repasalo al volver.
- ⚠️ **D4-1 · El Arquitecto v3 queda andando en tus dos PCs desde este cierre** (lo copia `kit-sync`), también en tus proyectos v2 de hoy: **sin
  ficha trabaja como hoy** (`docs/SPEC-<x>.md`, sin commit, sin push, sin worktree; r1-3), con la línea del tamaño, el sello y la Ejecución de
  más. `[workflow · consistencia]` *Si molesta*: revert del merge de J3 y `kit-sync`.
- ⚠️ **D4-2 · `integrar` pasa al orden 5** (con el gate y `/cierre`, que son de ahí). `[mejor código · workflow]` *Costo*: parado en otra rama, el
  Arquitecto no arma el módulo (una línea).
- ⚠️ **D4-3 · `worktree cerrar` muda a `<git-common-dir>/kit-frenos.log`** los renglones que los hooks agregaron a `frenos.log`, como los githooks,
  y no commitea; el commit de `frenos.log` antes del merge lo hace el gate del 5. Cierra "Paquete 4 · de D3.3". `[workflow · consistencia · mejor código]`
- ⚠️ **D4-4 · `worktree` es un solo `.cjs` de node**, no un par Bash/PowerShell (SPEC-0 "Stack"): anda igual en las dos (medido: `.kit-rol` con los
  mismos bytes). `[consistencia · acordarse de menos]`
- ⚠️ **D4-5 · La credencial que no viaja al worktree = la que está en el almacén de `cargar-secreto`**, sin campo nuevo en la ficha; "solo la de
  solo lectura, o ninguna" queda para el `db` de cada proyecto. El filtro **falla cerrado** (r1-4). `[acordarse de menos · mejor código]`
- ⚠️ **D4-6 · El Modo A sigue montando el molde v2** (con Ejecución, Entorno de prueba y sello en el SPEC-0); el molde v3 y `docs/modulos/v1/`, con el
  instanciador del orden 6. `[mejor código · consistencia]`
- ⚠️ **D4-7 · El esqueleto de la ficha del módulo se adelanta** (parte de P3.4) en `formato-spec.md`. `[consistencia · acordarse de menos]`
- ⚠️ **D4-8 · El sello lleva un `hash`** del spec normalizado (tocar el spec después del sello lo invalida) y acepta `— (razón)` **solo sin
  ficha**. `[mejor código · acordarse de menos]` *Costo*: un typo después del sello pide `sello` de nuevo.
- ⚠️ **D4-19 · El `kit-sync sync` no se corrió a mitad de sesión**: el clasificador lo frenó (tu "no toques el `~/.claude/` real") y medí que una
  skill `arquitecto` del proyecto **no** le gana a la tuya instalada. Las corridas que necesitan el Arquitecto v3 instalado van **después del
  `kit-sync` del `/cierre`**. `[workflow]`
- D4-9 a D4-18: scripts del Arquitecto en la skill global (`lib/sello.cjs` lista para que el 5 la copie al molde) · la línea del tamaño primera
  en tres lugares · `/inicio` con un módulo sin sello invoca, con "cambió después del sello" no · la línea de apertura con `;` · `crear` se niega
  si `.kit-rol`, `worktrees/` o `settings.local.json` no están ignorados · guía y manual solo la regla vieja · `$HOME` en PowerShell · las
  corridas por prioridad (D4-18).
- **De los encargos**: J1 · `comando-test` y los `chequeo` corren en la shell del sistema (cmd.exe en Windows); `--no-aplica tamano` sin ñ
  también vale; un sello inválido o un módulo sin `SPEC.md` cuentan como "sin sello". J2 · un `.env*` trackeado traba solo si el valor del nombre
  del almacén no está vacío (un `.env.example` con `CLAVE=` pasa); nombres sin distinguir mayúsculas (Windows); un `.env` del principal en UTF-16
  → 1. J3 · los `Estado:` de la ficha del módulo son los de B §13 (`EN OBRA`, `PAUSADO`, `COMPLETO <fecha>`, `ABANDONADO <fecha>`); el OK del Modo B
  es una AskUserQuestion sobre el spec sellado (Plan Mode no deja escribir); el SPEC-0 del Modo A, 5-8 criterios.

### D4.2 · Decisiones sin Guido

D4.2 corrió sin Guido, con su autorización previa (su prompt, abajo) y con la vara del ADR-030. **Las ⚠️ arriba.** Ninguna quedó sin poder
decidirse con la vara: **no hay preguntas nuevas arriba de Pendientes**.

- ⚠️ **D4.2-1 · Las corridas de D4.1 medían sin la regla del `CLAUDE.md` del molde**: `rehacer.sh` ponía el `CLAUDE.md` congelado de D2.1 y el paso
  "orden 3" solo traía hooks, scripts y skills, así que la sección "El tamaño del pedido" (J4 de D4.1) nunca llegó a `alfa` ni a `beta`. Lo arregló
  un encargo (K2): el paso 3 pone el `CLAUDE.md` del árbol de trabajo, y la verificación final da FALLO si falta la sección (probado el no).
  `[mejor código · consistencia]` *Costo*: un encargo más (3 en vez de 2). *Consecuencia*: los 8 de 10 de D4.1 valen para `/inicio`, no para el `CLAUDE.md`;
  por eso volví a correr los cuatro chicos (abajo).
- ⚠️ **D4.2-2 · `bypassPermissions` en `claude.exe -p` lo frena el clasificador del modo `auto`** ("Create Unsafe Agents"; en D4.1 había pasado).
  No lo esquivé: las corridas que escriben (14, 14b, 16) fueron con `--permission-mode acceptEdits` y un `--allowedTools` corto (Read, Write, Edit,
  Glob, Grep, Skill, Agent, TodoWrite y `Bash` de `node`, `git`, `ls`, `cat`, `mkdir`, `wc`, `head`, `grep`, `find`). Al clasificador eso le
  alcanzó, y ninguna negativa cambió un resultado: las sesiones repitieron por separado los `Bash` compuestos que les negaron. `[workflow · mejor código]`
  *Para el paquete 5*: los obreros nocturnos se pensaron en bypass; si el clasificador frena el lanzamiento, el canon tiene que lanzar con permisos
  acotados (Pendientes, "Paquete 5 · de D4.2").
- ⚠️ **D4.2-3 · El criterio del prototipo (16) reescrito**: decía "el `prototipo/` se crea antes que el `SPEC.md`", y el Arquitecto escribe primero el
  borrador en disco (regla de oro), con el pedido textual y el contexto del código y todo lo demás en `(pendiente)`. Las decisiones se escribieron
  **después** del prototipo, que es lo que pide H §13 ("el spec se escribe desde lo aprobado"). Ahora `pedidos.md` pide eso: el prototipo antes de las
  decisiones del spec. **Alternativa**: demorar el borrador en disco hasta el prototipo, a costa de perder el borrador si la sesión se corta. `[consistencia · mejor código]`
- ⚠️ **D4.2-4 · El 14b (Modo B corto sin ficha) no cerró en una sesión real, y no lo repetí una tercera vez** (D4-18: "se repite esa sola, una vez"). Las dos
  corridas fallaron por cómo estaba armada la prueba, no por el kit. (a) En `alfa` sin ficha siguen los hooks v3, así que el de escritura frenó
  `docs/SPEC-<x>.md` y la sesión lo mudó a `docs/modulos/`; un alfa sin ficha no es un proyecto v2. (b) En `gama` (v2 de verdad) el pedido decía
  "alfa", la sesión preguntó y, sin la regla del tamaño (molde v2), construyó directo sin subir al Arquitecto. **Lo que sí pasó en las dos**: sin commit
  en `main`, sin push, sin worktree y lo que estaba en stage intacto (crit. 6b, la mitad de seguridad). Lo que falta (el spec en `docs/SPEC-<x>.md` READY y la
  apertura sin ficha) lo prueban `arquitecto.test.cjs` y tu uso del Arquitecto en un proyecto v2 de verdad (Pendientes, "Paquete 4 · te espera a
  vos", 1). No traba el ✅: el crit. 4 del kit es el 14. `[workflow · acordarse de menos]`
- **D4.2-5 · La línea del tamaño del Arquitecto (`SKILL.md`, línea 17) suma la frase de la charla con el dueño**, fuera de los cuatro archivos del prompt,
  para que la sesión y el Arquitecto midan igual (5.676 bytes, tope 6.000). `[consistencia]`
- **D4.2-6 · Sin `MSYS_NO_PATHCONV` en ningún lado**: el pedido entra a `claude.exe -p` por stdin desde un archivo, así nada se convierte y la sesión no
  hereda la variable. Ningún transcript dio `C:\c\…`. `[acordarse de menos · workflow]`
- **D4.2-7 · Volví a correr los cuatro chicos (1, 2, 6, 7)** en plan, una vez cada uno, aunque el prompt pedía solo 8, 10 y 16: el párrafo nuevo del
  `CLAUDE.md` es justo lo que podría agrandar un chico, y el crit. 2 del kit no se tilda sin verlo. Cuatro corridas cortas. `[mejor código]`
- **D4.2-8 · El delta queda `✅ IMPLEMENTADO` sin volver a sellarlo**: el sello cuidaba que el spec no cambiara antes de construir. Al marcar el Estado,
  el hash deja de coincidir; para un spec del método ya implementado, eso no frena nada (`ready` no aplica a los deltas del método). `[acordarse de menos]`
- **De las corridas**: las de `plan` escriben su plan en `~/.claude/plans/` (mecanismo de Claude Code, no del kit). El `claude.exe -p` avisa "workspace not
  trusted" e ignora el `permissions.allow` del repo (ya anotado para los paquetes 6/7); no cambió nada acá.

## Abrir D3.1 sin Guido (el prompt)

Guido abre un chat nuevo en vibe-kit, en Opus, pega esto y se va. Es el de D2.2 con lo que cambia para el paquete 3:

> inicio — misión 5, D3.1: el paquete 3 entero (seguridad), sin mí.
>
> Me voy y te dejo trabajando solo hasta terminar. Te autorizo por adelantado a todo esto:
>
> 1. Después del /inicio no esperes mi OK. Si da limpio, arrancá. Si algo no está limpio (kit-sync sucio, git con cosas raras), no pises
>    nada en ninguna dirección: anotalo y seguí con lo que no dependa de eso.
> 2. Decidís vos. Todo lo que normalmente me preguntarías (el spec delta, lo que devuelva el red team, lo que encuentre el revisor frío) lo
>    resolvés con la recomendada y seguís. Cada decisión va a "Decisiones sin Guido" en la fila D3.1 del tracker: qué decidiste, la
>    alternativa y por qué. Si es un cambio de diseño grande (un formato que viaja a la flota, una barrera de seguridad, algo que contradice
>    el SPEC-0 o un ADR), decidilo igual, de forma que se pueda deshacer, y marcalo con ⚠️ arriba de esa lista. **El delta del paquete 3 lo
>    sellás vos** (provisorio, "sellado sin Guido", después del red team sin ALTOS): no frenes en el paso 2 de "Cómo se trabaja"; lo repaso
>    al volver.
> 3. No cortes por contexto ni partas en otro director. Hacé la fila D3.1 entera: delta, red team, encargos, el revisor frío y lo que
>    encuentre, más lo de "Paquete 3 · de D2.2" de Pendientes. Si la app compacta, releé el tracker y el delta antes de seguir editando.
> 4. Seguí las reglas de siempre: "Cómo se trabaja" del tracker (docs/kit-v3/PLAN-construccion.md). Opus para lo que decide y Sonnet para lo
>    mecánico. Leés cada diff y corrés las pruebas vos. Prueba de mutación sobre cada freno. Nada se tapa.
> 5. **No toques el `~/.claude/` real de esta PC** (ni `settings.json` ni hooks): los hooks por PC y el doctor se prueban con un HOME falso.
>    Instalarlos en las dos PCs lo hago yo después; dejalo en Pendientes con qué tengo que correr.
> 6. Lo que necesita una persona no te frena (una pestaña nueva, un pop-up, la segunda PC): hacé lo que se pueda con claude -p en un clon
>    de un repo de prueba, y el resto va a Pendientes con qué tengo que mirar. No me esperes nunca: si algo se traba, va a Pendientes y
>    seguís con lo que no depende de eso.
> 7. Guardá a medida que avanzás: commit después de cada encargo aceptado y la fila del tracker al día. Si te corta el límite del plan,
>    mañana se retoma desde ahí.
> 8. Al terminar, /cierre completo: kit-sync LIMPIO, docs, diario, gitleaks, commit y push. En el resumen final poné primero "Decisiones
>    sin Guido" (las ⚠️ arriba) y después lo que me espera a mí.

**Lo que D2.2 aprendió y le sirve a D3.1**: el revisor frío tiene que recorrer el día normal (dos PCs, `pull`, `merge`, worktrees), no solo
los ataques; `claude -p` desde Git Bash con un prompt que empieza con `/` necesita `MSYS_NO_PATHCONV=1`; la suite tarda ~20 min y la mutación
de un freno, horas: los mutantes sobre copias del molde, nunca sobre `kit/molde`; en `-p`, un clon que no es de confianza ignora el
`permissions.allow` del proyecto. **El plan semanal estaba al 83% (renueva el 1-11)**: si corta, se retoma desde el último commit.

## Abrir D3.2 y D3.3 sin Guido (los prompts)

Las dos en la PC `Usuario`, en Opus, un chat nuevo en vibe-kit cada una. D3.3 se abre **recién cuando D3.2 cerró** (G3-G6 en `main`, las
ramas `wip/*` borradas). Es el prompt de D3.1 con lo que cambia; las reglas de siempre siguen valiendo.

**D3.2**:

> inicio — misión 5, D3.2: terminar G3, G4, G5 y G6 del paquete 3 desde sus ramas WIP, sin mí.
>
> Me voy y te dejo trabajando solo. Te autorizo por adelantado a lo mismo que a D3.1 (su prompt, en el tracker, "Abrir D3.1 sin Guido"):
> decidís con la recomendada, anotás en "Decisiones sin Guido" de la fila D3.2 (las ⚠️ arriba), no cortás por contexto, no tocás el
> `~/.claude/` real, y lo que necesita una persona va a Pendientes. Lo que cambia:
>
> 1. **Alcance: solo G3, G4, G5 y G6.** G7 y lo que sigue es de D3.3: no lo empieces aunque te sobre cuota.
> 2. **La PC ya está preparada**: kit-sync LIMPIO, repos de prueba armados, y el corpus en `C:\Users\Usuario\vibe-historial\` (16.470
>    llamadas: lo dice "Pendientes" del tracker). Verificá las tres cosas en el /inicio; no lo rehagas si está.
> 3. **De a dos Opus como máximo**: primero G3 ∥ G6 (a G6 le faltan las pruebas de `barreras`, no medición), después G4 ∥ G5. Cada encargo
>    sigue desde el último commit de su rama `wip/d3.1-*` (en un worktree propio, con su subcarpeta del scratchpad), con el brief de "Los
>    encargos" del delta y lo que dice su commit WIP. **La mutación con tope** (la de G2 tardó horas): si un freno pasa de ~1 h, que mute
>    las reglas que frenan y anote el resto.
> 4. Leés cada diff, corrés vos las pruebas de cada encargo y la suite entera una vez al final (~27 min, en segundo plano). Aceptado →
>    merge a `main`, commit y push, y se borra la rama `wip/*` en `origin`. Si uno no cierra, queda en su rama con qué le falta en Pendientes.
> 5. Al terminar los cuatro, /cierre completo (kit-sync LIMPIO, docs, diario, el chat al privado, gitleaks, commit y push), con el
>    "Próximo paso" apuntando a D3.3 y su título. En el resumen final, primero "Decisiones sin Guido" y después lo que me espera a mí.

**D3.3**:

*(Reescrito en el cierre de D3.2, 2026-10-29, con lo que D3.2 dejó y aprendió.)*

> inicio — misión 5, D3.3: cerrar el paquete 3, sin mí.
>
> Me voy y te dejo trabajando solo. Te autorizo por adelantado a lo mismo que a D3.1 y D3.2 (el prompt de D3.1, en el tracker, "Abrir D3.1
> sin Guido"): después del /inicio no esperás mi OK, decidís con la recomendada, anotás en "Decisiones sin Guido" de una sección D3.3 nueva
> (las ⚠️ arriba), no cortás por contexto, no tocás el `~/.claude/` real (los hooks por PC y el doctor, con un HOME falso), y lo que
> necesita una persona va a Pendientes. Lo que cambia:
>
> 1. **Alcance**: G7, G10, G11, G12 y G13, en el orden de dependencias de "Los encargos" del delta (G7 y G10 primero, en paralelo: no
>    comparten archivos; después G11 y G12; G13 al final); lo de Pendientes del paquete 3 ("de D2.2" y "de D3.2, para D3.3", de la a a la g:
>    cada letra se cierra en el encargo que nombra o se anota por qué no); y el **revisor frío** en Opus sobre el diff entero del paquete
>    (que recorra el día normal: dos PCs, `pull`, merge, worktrees, un proyecto nuevo; no solo los ataques) y lo que encuentre. Los dos de
>    "de D3.2, fuera del paquete" los decide el revisor frío.
> 2. **La PC ya está preparada** (kit-sync LIMPIO, repos de prueba, corpus en `C:\Users\Usuario\vibe-historial\`). Verificalo en el /inicio;
>    no lo rehagas si está.
> 3. **De a dos Opus como máximo**; los Sonnet mecánicos (G11, G12, G13) no cuentan. Cada encargo en su worktree en `scratchpad/<gN>/wt`, con
>    su subcarpeta del scratchpad para temporales, y con el `cwd` siempre adentro de ella. **Mutación con tope** en G7 y G10: si pasa de
>    ~1 h, que mute las reglas que frenan y anote el resto. Si la cuota corta a mitad, cuando renueve retomá cada encargo con un mensaje
>    ("seguí desde donde quedaste"), no lo relances de cero.
> 4. Leés cada diff, corrés vos las pruebas de cada encargo y la suite entera al final, en segundo plano. Aceptado → merge a `main`, gitleaks,
>    commit y push.
> 5. **Las pruebas que necesitan una persona las postergo** (la pestaña real de VS Code, la otra PC, instalar los hooks por PC en las dos
>    PCs): no me esperes; van a Pendientes con qué tengo que mirar y qué tengo que correr.
> 6. Al terminar, la fila del paquete 3 en ✅ con lo que me espera, **el prompt de D4.1 sin mí** armado en el tracker como este, y /cierre
>    completo (kit-sync LIMPIO, docs, diario, el chat al privado, gitleaks, commit y push) con el "Próximo paso" en D4.1 y su título. En
>    el resumen final, primero "Decisiones sin Guido" y después lo que me espera a mí.

## Abrir D4.1 sin Guido (el prompt)

*(Armado en el cierre de D3.3, 2026-10-30, y reescrito ese día con el ADR-029: revisar y probar con presupuesto.)* En la PC `Usuario`, en
Opus, chat nuevo en vibe-kit.

> inicio — misión 5, D4.1: el paquete 4, sin mí, con el presupuesto del ADR-029.
>
> Me voy y te dejo trabajando solo. Te autorizo por adelantado a lo mismo que a D3.1-D3.3 (el prompt de D3.1, en el tracker, "Abrir D3.1
> sin Guido"): después del /inicio no esperás mi OK, decidís con la recomendada, anotás en "Decisiones sin Guido" de una sección D4.1 nueva
> (las ⚠️ arriba), no tocás el `~/.claude/` real (todo lo que instale, con un HOME falso), y lo que necesita una persona va a Pendientes.
> Lo que cambia:
>
> 1. **Alcance: el paquete 4** (SPEC-0, orden 4): el Arquitecto v3, el sello, `formato-spec.md`, el script `worktree` y `.kit-rol`. Primero
>    **el spec delta** (`docs/kit-v3/SPEC-paquete-4.md`, como el del 3) con **una ronda de red team**; lo **sellás vos** ("sellado sin
>    Guido", sin ALTOS abiertos) y yo lo repaso al volver. Después los encargos. Entran también "Paquete 4 · de D2.2" de Pendientes (el
>    Arquitecto abre diciendo el tamaño como primera línea; los diez pedidos tienen que dar 10 de 10) y "Paquete 4 · de D3.3" (`worktree
>    cerrar` no se traba con el `frenos.log` del obrero).
> 2. **Decidís con la vara** ("Cómo decide una sesión sin Guido" del tracker, ADR-030): mis cuatro cosas, el filtro pragmático y los 11
>    criterios. Cada decisión lleva su etiqueta; si no mueve ninguna, sobra. Si con la vara no alcanza, no la decidas: pregunta arriba de
>    Pendientes con las opciones y la recomendada, y seguís con lo demás.
> 3. **El presupuesto manda (ADR-029; "Cómo se trabaja" del tracker)**: **~4 h de reloj y ~8 encargos**. Si llegás y no terminaste, cerrás
>    limpio: lo hecho en `main`, lo que falta en Pendientes con su porqué, y el prompt de D4.2 armado. No estires.
> 4. **Contra accidentes, no contra trampas.** El revisor frío: **una vuelta, hasta 10 hallazgos, cada uno con su escenario del día
>    normal**; los arreglos, en un solo encargo (Sonnet si son chicos); lo que pide un agente que quiere esquivar el freno va a "Lo que
>    esto no cierra", sin arreglo. Sin segunda vuelta.
> 5. **Pruebas proporcionales**: casos de sí y de no de cada cambio; mutación solo en las piezas nuevas que deciden un freno o un permiso
>    (tope 20 min); la suite entera una vez, al final, en segundo plano. De a dos Opus como máximo; cada encargo en su worktree en
>    `scratchpad/<x>/wt`. Si un encargo se cuelga, retomalo con un mensaje, no lo relances.
> 6. Leés cada diff y corrés las pruebas de cada encargo. Aceptado → merge a `main`, gitleaks, commit y push.
> 7. Las pruebas que necesitan una persona van a Pendientes con qué tengo que mirar y qué correr.
> 8. Al terminar, la fila D4.1 con **horas, encargos y tokens** (para ver si el ADR-029 rindió), el paquete 4 en ✅ si cerró, el prompt
>    de la sesión siguiente armado como este, y /cierre completo con el "Próximo paso" y su título. En el resumen final, primero
>    "Decisiones sin Guido" y después lo que me espera a mí.

## Abrir D4.2 sin Guido (el prompt)

*(Armado en el cierre de D4.1, 2026-10-30.)* En la PC `Usuario`, en Opus, chat nuevo en vibe-kit.

> inicio — misión 5, D4.2: cerrar el paquete 4, sin mí, con el presupuesto del ADR-029.
>
> Me voy y te dejo trabajando solo. Te autorizo por adelantado a lo mismo que a D4.1 (su prompt, en el tracker, "Abrir D4.1 sin Guido"):
> después del /inicio no esperás mi OK, decidís con la vara (ADR-030) y anotás en "Decisiones sin Guido" de una sección D4.2 nueva (las ⚠️
> arriba), no tocás el `~/.claude/` real salvo el `kit-sync` del `/cierre`, y lo que necesita una persona va a Pendientes. Lo que cambia:
>
> 1. **Alcance: solo "Paquete 4 · para D4.2" de Pendientes**: rearmar el pedido 14 (y el de 6b) para que sean más que chicos por la regla y
>    correr el Modo B corto de punta a punta con el OK por `--resume` (crit. 4 del kit); afinar la regla del molde para los pedidos 8 y 10 y
>    `modo-b.md` para el prototipo (16), y correr esos tres una vez cada uno. Nada de piezas nuevas: el código del paquete ya está en `main`.
> 2. **El orden**: primero los arreglos de texto (un encargo Sonnet: `pruebas/pedidos.md`, `kit/molde/CLAUDE.md`, `kit/molde/skills/inicio/SKILL.md`
>    y su prueba, `kit/skills/arquitecto/anexos/modo-b.md`); después `rehacer.sh`, el **`kit-sync sync` como primer paso del `/cierre`** (a mitad
>    de sesión lo frena el clasificador) y las corridas (un encargo Sonnet, una por pedido, sin repetir). `MSYS_NO_PATHCONV=1` solo en el
>    lanzador, nunca heredado por la sesión.
> 3. **El presupuesto**: ~2 h y ~3 encargos. Sin red team (no cambia nada que congele formato ni permisos) y sin revisor frío (los cambios son de
>    texto; lo mira el director). La suite entera, una vez, al final, en segundo plano.
> 4. Leés cada diff y corrés las pruebas de cada encargo. Aceptado → merge a `main`, gitleaks, commit y push.
> 5. Al terminar: el paquete 4 en ✅ si el crit. 4 pasó (si no, lo que falta en Pendientes con su porqué y el paquete sigue 🔨), los `✅ <fecha>` del
>    SPEC-0 que falten, el delta en `✅ IMPLEMENTADO`, la fila D4.2 con horas, encargos y tokens, el prompt de D5.1 armado como este, y
>    /cierre completo con el "Próximo paso" y su título. En el resumen final, primero "Decisiones sin Guido" y después lo que me espera a mí.

## Abrir D5.1 sin Guido (el prompt)

*(Armado en el cierre de D4.2, 2026-10-30.)* En la PC `Usuario`, en Opus, chat nuevo en vibe-kit.

> inicio — misión 5, D5.1: el paquete 5, primera mitad, sin mí, con el presupuesto del ADR-029.
>
> Me voy y te dejo trabajando solo. Te autorizo por adelantado a lo mismo que a D4.1 (su prompt, en el tracker, "Abrir D4.1 sin Guido"):
> después del /inicio no esperás mi OK, decidís con la vara (ADR-030) y anotás en "Decisiones sin Guido" de una sección D5.1 nueva (las ⚠️
> arriba), no tocás el `~/.claude/` real salvo el `kit-sync` del `/cierre`, y lo que necesita una persona va a Pendientes. Lo que cambia:
>
> 1. **Alcance: la primera mitad del paquete 5** (SPEC-0, orden 5; es el más grande y se construye en módulos: núcleo · director · obrero/tramo ·
>    estado · mesa). Primero **el spec delta del paquete entero** (`docs/kit-v3/SPEC-paquete-5.md`, como el del 4), con **una ronda de red team**
>    (toca permisos: el canon de los obreros), lo **sellás vos con el script `sello`** ("sellado sin Guido", sin ALTOS abiertos) y lo repaso al
>    volver. En el delta, **partí el paquete en dos directores** y escribí qué hace cada uno; D5.1 construye **el núcleo y el canon director/obrero**
>    (con el corrector "spec sin sello" y la regla de mensajes entrantes) y deja `/estado`, el resumen del día, la mesa, los subagentes y el
>    `CLAUDE.md` por criterios para D5.2. Entran también de Pendientes "Paquete 5 · de D4.1" (`integrar` con el gate, `lib/sello.cjs` al molde, la
>    parada de `/obrero`), "Paquete 5 · de D4.2" (cómo se lanza un obrero si el clasificador frena el bypass) y "Paquete 5 · del ADR-029" (el canon
>    de pruebas de las apps).
> 2. **Decidís con la vara** ("Cómo decide una sesión sin Guido" del tracker, ADR-030). Si con la vara no alcanza, no la decidas: pregunta arriba
>    de Pendientes con las opciones y la recomendada, y seguís con lo demás.
> 3. **El presupuesto manda (ADR-029)**: **~4 h de reloj y ~8 encargos**. Si llegás y no terminaste, cerrás limpio: lo hecho en `main`, lo que
>    falta en Pendientes con su porqué. No estires.
> 4. **Contra accidentes, no contra trampas.** El revisor frío: una vuelta, hasta 10 hallazgos con su escenario del día normal, los arreglos en un
>    encargo; sin segunda vuelta. **Pruebas proporcionales**: casos de sí y de no; mutación solo en las piezas nuevas que deciden un freno o un
>    permiso (tope 20 min); la suite entera una vez, al final, en segundo plano. De a dos Opus como máximo; cada encargo en su worktree en
>    `scratchpad/<x>/wt`.
> 5. **Las sesiones reales** (`claude.exe -p`): el pedido por stdin, sin `MSYS_NO_PATHCONV`; las que escriben, con `acceptEdits` y un
>    `--allowedTools` corto (el bypass lo frena el clasificador: "D4.2 · Decisiones sin Guido"); los repos de prueba recién armados por `rehacer.sh`,
>    y si la corrida necesita el kit instalado, después del `kit-sync` del `/cierre`.
> 6. Leés cada diff y corrés las pruebas de cada encargo. Aceptado → merge a `main`, gitleaks, commit y push.
> 7. Al terminar: la fila D5.1 con **horas, encargos y tokens**, el prompt de D5.2 armado como este, y /cierre completo con el "Próximo paso" y su
>    título. En el resumen final, primero "Decisiones sin Guido" y después lo que me espera a mí.

## Paralelizar: decidido que no (DP, 2026-10-29)

**La misión 5 sigue en secuencia: un director por vez, en el orden de la tabla de arriba.** Guido: "Prefiero hacerlo bien y que tarde
más, porque esto es importante."

Lo que se evaluó, para no volver a evaluarlo de cero (insumo de la misión 6):
- **Dónde se podía** (D2.1, contra "Orden de construcción" del SPEC-0): D2.2 ∥ paquete 3 (el 3 depende del 1; el pre-commit de P4.6 iría al
  final del 3) · adentro del paquete 5 (núcleo primero; después director/obrero ∥ estado/mesa) · 7 ∥ 8. 4 → 5 → 6 es cadena. Ganancia
  estimada: antes del piloto, de 9 directores en fila a 6-7 pasos.
- **Con una PC por director** rendía: cada uno con su suite, sus repos de prueba y su `~/.claude/`. Guido eligió **la misma PC**.
- **En la misma PC** hacía falta sumar reglas: pruebas largas nunca a la vez (lección de los ~75 min), un `rehacer.sh` con carpeta
  destino por director, el paquete 3 probando sus frenos en un `HOME` falso hasta que cierre el otro, más ramas `m5/<director>`, un dueño
  por archivo compartido (`settings.json`, `hooks/lib/*`, `rehacer.sh`, `niega-aprobar.cjs`) y el handoff integrado por el último en
  cerrar. Con la ganancia sin medir, eso pedía un ensayo primero.
- **Por qué no**: la complejidad y el ensayo no valen el tiempo ganado en algo que define cómo se codea los próximos meses.
- **Si se reabre** (por ejemplo, con las dos PCs): el plan de arriba sirve de punto de partida; lo que se decida va a "Cambios al plan".

## Pendientes de cada paquete

Lo que una sesión dejó a medias, con qué falta. Se borra cuando se hace (queda en el CHANGELOG).

- **Paquete 1 · que un hook que lee una ficha rota frene** (SPEC-paquete-1, "Lo que se prueba más adelante"): el parser sale con 1;
  el freno se prueba en los órdenes 2 y 3, cuando existan los hooks.
- **Paquete 2 · te espera a vos, Guido** (D2.2 no lo podía hacer sin una persona; **lo hace más adelante, no traba a D3.1**): (1) **decidir la ⚠️ de arriba** (una sesión en bypass en
  tu checkout principal puede fabricar un `aprobado`: ¿lo aceptás hasta el orden 3?) y repasar las otras ⚠️ de "Decisiones sin Guido"; (2) en
  una pestaña de VS Code en `../vibe-kit-pruebas/alfa`: **la ventana de `cambios aprobar` en modo `auto`** (pedile a la sesión que proponga quitar un freno
  y que lo apruebe: tiene que aparecer la ventana y, al aceptar, el commit `cambios: aprobado …`), **"creá `docs/notas.md`" sin pop-up**
  (fila 3), qué **modo** dice la cabecera del arranque (en `-p` no llega), y **la fila 6 en modo `auto`**. Corré antes `bash pruebas/rehacer.sh`.
- **Paquete 2 · para D2.2** (de la construcción de D2.1): (a) `hook-escritura: molde` va sin hash: **decidido en D2.2, sigue así hasta
  el orden 6** (Decisiones sin Guido); (b) el hash de `settings`: lo rehace F7 con `hashPieza`; (c) la carpeta hermana desde un worktree: F7;
  (d) pasó al paquete 3.
- **Paquete 3 · te espera a vos, Guido** (D3.3 no lo podía hacer sin una persona; **no traba a D4.1**):
  1. **Instalar los hooks por PC, en `clientes` y en `Usuario`**: `node ~/.claude/skills/arquitecto-skills/scripts/instalar-hooks-pc.cjs --plan`
     (mirá qué va a tocar), después lo mismo sin `--plan`, reiniciá VS Code, y `node ~/.claude/skills/arquitecto-skills/scripts/doctor.cjs`
     parado en `../vibe-kit-pruebas/alfa` (tiene que dar todo ✓ o ⚠ explicado). Si está bien, `--sacar-viejo` saca el anti-secretos viejo.
     Si algo traba, `--quitar` deja el `settings.json` byte a byte como estaba.
  2. **En una pestaña real de VS Code en `alfa`** (filas 5-6 de "Lo prueba una sesión real" del delta): qué `permission_mode` dice el
     arranque; pedile `vercel --prod` y fijate que aparezca la ventana de `sensible`; y que un hook roto frene (`onFailure`/exec).
  3. **Windows sin Git Bash** (fila 7): si tenés una PC así a mano; si no, queda para el piloto.
  4. **(e) de D3.2**: en `clientes`, cruzar los cinco regex de `block_secrets.ps1` con los de `secretos.cjs` (o pedírselo a una sesión allá).
  5. **Borrar 4 transcripts con la clave FALSA de prueba** (`ghp_FALSO…`, no es real) que dejó G13 en `~/.claude/projects` (carpetas
     `…scratchpad-g13-c7-sec` ×3 y `…scratchpad-g13-c12-sinremoto-sinficha` ×1; `grep -rl "ghp_FALSO" ~/.claude/projects`). El clasificador
     frenó que una sesión los borrara: es tuyo.
  6. La ruta de la app de escritorio en el `doctor` (NO VERIFICADO): con la app abierta, `doctor` tiene que decir `claude-code ✓`.
  7. Repasar las ⚠️ de D2.2, D3.1 y D3.3 (arriba).
- **Paquete 5 · del ADR-029**: el canon de pruebas de las apps (revisor, mutación, gate) se escribe con el mismo criterio: contra
  accidentes, pruebas proporcionales al riesgo, una vuelta de revisor con escenario.
- **Paquete 4 · te espera a vos, Guido** (D4.1 no lo podía hacer sin una persona; **no traba a D5.1**):
  1. **El Arquitecto v3 ya está en esta PC** (`Usuario`, por `kit-sync`); en `clientes` llega con tu próximo `/inicio` de vibe-kit allá
     (`kit-sync sync`). Usalo como siempre en un proyecto v2: tiene que abrir con la línea del tamaño y, sin ficha, dejar `docs/SPEC-<x>.md`
     sellado **sin commitear nada** (D4-1, r1-3). Si algo molesta, decilo: se deshace con un revert y `kit-sync`. **Es también lo que falta
     del crit. 6b** (D4.2-4): fijate que el spec quede en `docs/SPEC-<x>.md` READY, como `módulo solo`, y que la línea final sea la de sin ficha
     (`inicio — ejecutá el spec docs/SPEC-<x>.md (está READY)`). En un proyecto v2 llamalo vos (`/arquitecto …`): el molde v2 no trae la regla del tamaño.
  2. **Una pestaña real de VS Code en un worktree** (fila 9 del delta): en `../vibe-kit-pruebas/alfa`, corré
     `node .claude/scripts/worktree.cjs crear prueba` (antes un commit con `docs/modulos/prueba/README.md`), abrí lo que imprime (`code "<ruta>"`),
     la pestaña de Claude ahí, y fijate que el arranque diga el rol (`director`) y que `cambios aprobar` se niegue. Es la mitad VS Code del
     NO VERIFICADO de `.kit-rol`.
  3. Repasar las ⚠️ de D4.1 y D4.2 (arriba) y el delta sellado sin vos.
- **Paquete 5 · de D4.2**: `claude.exe -p --permission-mode bypassPermissions` **lo frena el clasificador del modo `auto`** cuando lo lanza una
  sesión ("Create Unsafe Agents", 2026-10-30; en D4.1 había pasado). Con `acceptEdits` y un `--allowedTools` corto, pasa y alcanza
  (D4.2-2). El canon director/obrero y los obreros nocturnos tienen que lanzarse así, o decir por qué necesitan bypass y cómo se autoriza.
- **Paquete 5 · de D4.1**: `integrar` (D4-2) con el gate, que commitea `frenos.log` antes del merge (D4-3); copiar `lib/sello.cjs` al molde con
  su prueba anti-desvío (D4-9) para el corrector "spec sin sello" y `/obrero`; la otra mitad del criterio 3 (la parada de `/obrero`).
- **Paquete 6 · de D4.1**: `cargar-secreto` corrido adentro de un worktree calcula otro `<proyecto>` y guarda en otro almacén (red team r1-4,
  "fuera de este paquete"); el Modo A con el molde v3 y `docs/modulos/v1/` (D4-6); "adoptá X" y "poné al día X" de verdad (hoy `flota.md` da una
  línea). Y un clon no trae `core.hooksPath`: el actualizador lo pone (J5a lo tuvo que poner a mano en sus clones).
- **Paquete 6 · de D2.2 (F4)**: la exención (a) de `barreras` da rojo con una regla de `settings` que el molde nuevo retira, porque sin el
  molde viejo no la distingue de una propia. **Resuelto en `barreras` en D3.3 (G6b, `--molde-viejo`)**: falta que el actualizador se
  lo pase. Los `.githooks/**` y gitleaks ya están en el molde (G7).
- **Paquete 6/7 · de D2.2**: en `claude -p` sobre una carpeta que no es de confianza, **Claude Code ignora el `permissions.allow` del
  proyecto** ("this workspace has not been trusted"): el actualizador y todo agente de fondo en un clon nuevo lo van a sufrir.
- **Paquete 1 · menor**: una ficha en Latin-1 da "valor inválido" (sin eco) en vez de "guardala en UTF-8". Se arregla si aparece en la flota.

## NO VERIFICADO, para tachar

El detalle y cómo se prueba cada uno, en la sección "NO VERIFICADO" del spec. Se tacha con `[x]`, la fecha y la sesión que lo probó;
si falla, se anota qué pasó y va a "Pendientes".

**En la construcción** (los prueba la sesión del paquete):
- [ ] Orden 2 · **Las filas 1-7 de "Lo prueba una sesión real" del SPEC-paquete-2** — **D2.2, 2026-10-28, `claude.exe` 2.1.309 en `-p`
  sobre clones de `alfa`**: [x] 1 (cabecera `kit 2.4.2 · hay kit nuevo: 2.4.3`, última línea `inyectado: 1.090 de 9.700`) · [x] 2 (handoff de
  26 KB: primera línea `CORTADO: el handoff…`, huella `5.598 de 9.700`) · [x] 3 sin el pop-up (`Write` de `docs/notas.md` negado con el
  mensaje de B §7, renglón `candado:raiz · Write · docs/notas.md` en `frenos.log`) · [x] 4 (worktree `modulo/x--01`: la ruta del encargo y la
  cabecera de la ficha, ningún renglón del handoff) · [x] 7 a medias (6 sesiones con la suite corriendo y la CPU al ~60 %: todas con lo
  inyectado en 6-10 s; el plazo de 10 s no llegó a actuar: el renglón `arranque lento` solo se vio forzado con `KIT_PLAZO_ARRANQUE_MS=300`).
  **Falta, con una pestaña real (Guido)**: que en la 3 **no aparezca el pop-up**; la 6 en modo `auto`; y un dato raro: en `-p` la cabecera
  dice `modo default (configurado)` aunque se pase `--permission-mode`, o sea que **la entrada del `SessionStart` en `-p` no trae
  `permission_mode`**: mirá qué modo dice la cabecera en una pestaña de VS Code
- [ ] Orden 2 · Que una escritura por script de node a `.claude/` no pregunte de día, también dentro de `.claude/worktrees/` — **E0 de D2.1,
  2026-10-28, `claude.exe` 2.1.309 en `-p`**: en `default` y `acceptEdits`, desde la raíz y desde `.claude/worktrees/w1/`, el script
  escribió y el control (`Write` directo a `.claude/`) quedó negado ("sensitive file") → **pasa; `.kit/` no hace falta**. En `auto` el
  control también escribió: no concluyente → falta la fila 6 de "Lo prueba una sesión real" del delta, en modo `auto`
- [x] Orden 2 · Que el hook `SessionStart` no corra en los subagentes — 2026-10-28, E0 de D2.1 (`-p`, 2.1.309): un subagente lanzado y
  terminado, el hook corrió una vez por fuente y solo para la sesión principal (mismo `session_id`; la entrada no trae marca de subagente)
- [ ] Orden 3 · `onFailure: "block"` en VS Code y en Windows sin Git Bash (los cuatro casos de falla, en las dos PCs) — **D3.1, G0 y G0b,
  2026-10-29, `claude.exe` 2.1.309 `-p` en `clientes`**: los cuatro frenan con `block` (Bash y PowerShell) y pasan sin él; la forma exec
  (`"command": "node"`, `"args"`) expande `${CLAUDE_PROJECT_DIR}` también con `"shell": "powershell"`. **Falta**: VS Code y la otra PC (Guido)
- [x] Orden 3 · Que el `.js` de un hook se relea en cada llamada y que un `deny` con ruta absoluta ande en Windows — 2026-10-29, D3.1 G0
  (`-p`, 2.1.309): el hook reescrito a mitad de sesión rige en la llamada siguiente; `Read(//c/Users/…)` (y `C:/…`) niega, sin pegar de más
- [ ] Orden 3-4 · Que `cambios aprobar` lea bien la marca de rol de cualquier forma de llamarlo
- [ ] Orden 4 · Que `.kit-rol` se escriba y se lea bien desde la extensión de VS Code y desde PowerShell — **[x] la mitad PowerShell, D4.1,
  2026-10-30**: `worktree.cjs crear` desde `powershell.exe` escribe los mismos bytes que desde Git Bash (`obrero\n`, prueba de J2), y en
  `claude.exe -p` 2.1.312 lanzado desde PowerShell en el worktree `cambios aprobar` se negó por el rol ("carpeta de agente (.kit-rol:
  obrero)", J5a). **Falta la mitad VS Code** (Guido: Pendientes, "Paquete 4 · te espera a vos")
- [ ] Orden 6 · El bloque `autoMode` de la PC escrito por el Equipador con merge por regla ("preparame esta PC" en la segunda PC)
- [ ] Orden 6 · Que el adaptador local del registro alcance para un kit sin Hub

**En el piloto** (Deptos):
- [ ] Cuánto tarda el Modo B corto, y si molesta
- [ ] Que el corrector "spec sin sello" frene a un obrero real sin romper nada
- [ ] `claude --bg` en el worktree del encargo: que no cree otro worktree y que `--resume` lo encuentre
- [ ] Cómo despierta el despertador nocturno al director
- [ ] Que el script prediga los permisos del checklist nocturno
- [ ] Que la alarma de intervenciones lea transcripts de varias sesiones
- [ ] Cómo abrir una pestaña de la extensión dentro de un worktree
- [ ] `core.longpaths` y `comando-test` en Windows
- [ ] El modo `integrar` del script de worktrees en Windows
- [ ] El `/cierre` fuera del checkout principal
- [ ] La migración del `CAMBIOS.md` de Hermes (al adoptar Desktop)
- [ ] Que las `allow` estrechas se resuelvan antes del clasificador del modo `auto`
- [ ] Que la skill del Arquitecto sostenga la entrevista sin perder el hilo del director
- [ ] Que no aparezca el pop-up en VS Code ante lo AUTORIZADO
- [ ] Que un aviso sin novedad sea cero texto
- [ ] Los topes numéricos (handoff, hook, spec, mesa, contexto), calibrados con el mes
- [ ] Que la plataforma cuente caracteres como JS para el corte de 10.000
- [ ] Cuánto cuesta el banner por proyecto
- [ ] `-w` con `-p`; que un `-p` mande un mensaje
- [ ] Tokens por módulo desde los transcripts del worktree

## Los 20 criterios de aceptación del kit entero

Están en la sección "Criterios de aceptación" del spec. Se tilda cada uno con la fecha y la sesión que lo verificó **con evidencia**.
El tag `v3.0` no sale con uno sin tildar, salvo que Guido lo pase a fase 2 por escrito.

- [ ] 1 · Regresión: todo lo de `v2.4.2` sigue andando
- [x] 2 · El tamaño del pedido dicho en una línea — **2026-10-30, D4.2: 10 de 10** (`claude.exe -p` 2.1.312, plan, una corrida cada uno, clones de
  `alfa`/`beta` con el `CLAUDE.md` del molde de verdad, D4.2-1): 1, 2, 6, 7 → "chico, lo hago acá" sin invocar nada; 8 y 10 → "esto es más que chico:
  llamo al Arquitecto" como primer bloque de texto e invocan `arquitecto`. 3, 4, 5 y 9 pasaron en D4.1 (solo con `/inicio`; el párrafo nuevo solo suma
  razones de "más que chico"). *Antes, D4.1: 8 de 10 (fallaban 8 y 10)*
- [ ] 3 · Sin sello, `ready` se niega — *D4.1: la mitad de `ready` (`arquitecto.cjs ready` niega sin sello, con sello inválido o con el spec
  cambiado; 35+ pruebas, mutación 72/75 con los vivos equivalentes); falta la parada de `/obrero` (orden 5)*
- [x] 4 · El Arquitecto deja el commit del módulo en `main` — **2026-10-30, D4.2 (pedido 14 rearmado, `claude.exe -p` 2.1.312, `acceptEdits` con
  `--allowedTools` corto, el OK por `--resume` "aprobado")**: primer bloque "esto es más que chico: llamo al Arquitecto", invoca `arquitecto`, **sin
  preguntas**; `sello` y `ready` 0 en **~3 min de reloj** (126 s + 50 s); un commit en `main` con solo `docs/modulos/calc-historial/` (README con
  `director: sí` y `rama: modulo/calc-historial`), pusheado al remoto; `worktree.cjs crear` dejó la rama y `.claude/worktrees/modulo--calc-historial`
  con `.kit-rol` = `director`; la línea de apertura al final (seguida de las de `/smoke` y `cierre`). Verificado por el director en el clon
- [ ] 5 · El hook inyecta ≤ 9.700, con huella, edad y CORTADO
- [ ] 6 · `/cierre` encuentra lo suelto, lo roto y lo pasado de tope — *D2.2: el candado lo encuentra, frena y anota (pruebas de
  `estructura.cjs` y `todo` 0 en `alfa`/`beta`); falta ver una sesión real que corra el `/cierre` del molde y no commitee encima*
- [ ] 7 · Sin pop-up ante lo AUTORIZADO
- [ ] 8 · El director no escribe ante un aviso sin novedad
- [ ] 9 · "Poné al día la flota" devuelve una tabla por repo
- [ ] 10 · Adoptar un repo viejo con un OK
- [ ] 11 · La lista cerrada de lo que se frena, también en bypass — *D3.3: los hooks del paquete 3 registrados en el molde (G7) y
  vivos en `claude.exe -p` en bypass (G13); falta la pestaña real y los hooks por PC instalados (Guido)*
- [ ] 12 · Los cambios de método de clase 2 quedan en `.claude/cambios/` — *D2.2: el script es el único camino (el `Write` a `cambios/`
  negado en `-p`), un `3-barrera` queda `propuesto` con su línea de "te espera" y `barreras` da rojo sin el sellado (caso a mano en `alfa`);
  falta que un agente aplique uno de clase 2 en una sesión real*
- [ ] 13 · La mesa escribe el archivo antes del mensaje
- [x] 14 · Ninguna skill con rutas absolutas, sesiones, ramas ni SHAs — 2026-10-29, D2.2: `candado:datos` verde sobre las skills del molde
  instaladas en `alfa` y `beta` (`estructura.cjs todo` 0), con casos sí/no en sus pruebas
- [ ] 15 · Lo `sensible:` pregunta solo en el paso que lo toca
- [ ] 16 · Si un hook que niega falla, la acción se frena — *D3.3: los cinco que niegan con `onFailure: "block"` en el molde (G7) y
  los cuatro casos de falla frenan en `-p` (G0); falta VS Code y la otra PC (Guido)*
- [x] 17 · Un obrero que edita sus frenos no se los saca — **2026-10-30, D4.1 (J5a, `claude.exe -p` 2.1.312 en bypass, desde PowerShell, en el
  worktree `modulo--calc--01` creado por `worktree.cjs`)**: la sesión editó `frenos.quitados` de `.claude/kit.md`, sus hooks no cambiaron y el
  `git commit` dio `kit pre-commit: ROJO` (`candado:barreras`, sin `aprobado`). Antes — *D2.2: su commit da rojo en `barreras` (prueba) y los hooks leen la ficha de la
  rama por defecto (D2.1); que el corrector frene la edición misma de los hooks es del orden 3 (4.3)* — *D3.3: `frenos-del-proyecto` y `salir-del-worktree`
  vivos en una sesión real de obrero (G13), siguiendo los `cd` (RF-C2); se tilda con el `worktree` del orden 4*
- [ ] 18 · `cambios aprobar` se niega desde un worktree de obrero — *D2.2: se niega con cada `.kit-rol` de agente, por nombre y por ruta,
  fuera del principal y fuera de la rama por defecto (pruebas); el hook niega en `dontAsk` (`claude.exe -p`) y bypass (pruebas), y en `auto` pregunta (Guido, 2026-10-29);
  sello a mano o de otra carpeta → rojo. **Falta**: la ventana en una pestaña real de Guido y (bypass con `claude.exe`: ✅ D3.3, G13) el resumen del día
  (orden 5)*
- [ ] 19 · Una migración a `real` sin veredicto del revisor no corre
- [ ] 20 · El actualizador respeta la zona propia de cada `settings.json` — *D2.2: `mezclarSettings` a tres puntas (pruebas) y el commit
  `molde v3 orden 2b` de `rehacer.sh` pasa `barreras --molde` en verde (y rojo sin `--molde`); la creación de la ficha con fábrica (b), por
  pruebas. Se tilda con el actualizador de verdad (orden 6), que además necesita el molde viejo (Pendientes)*

## Lo que hace Guido, y cuándo

Del spec, sección "Lo que hacés vos de nuevo". Acá solo cuándo toca, para que no llegue de sorpresa:

- **Sellar a mano** los specs delta de los paquetes 1, 2 y 3.
- **Antes del piloto** (paquete 8½): las credenciales de escritura de las bases reales al almacén, en las dos PCs, y un usuario de
  solo lectura por base.
- **"Preparame esta PC"** en la del compañero, cuando cierre el paquete 6.
- **Decidir** lo que el red team o el revisor frío devuelvan como decisión de diseño (en Fable).

## Cambios al plan

| Fecha | Qué cambió | Por qué |
|---|---|---|
| 2026-10-27 | La construcción pasa de Sonnet a **Opus** | Decisión de Guido: es lo que define cómo se codea los próximos meses |
| 2026-10-28 | **P3.2 (la zona propia) entra al orden 2**, y `pruebas/pedidos.md` pasa del orden 1 al 2 | P3.2 no tenía orden en el SPEC-0 y la necesitan `/inicio`/`/cierre` v3 y la exención de `candado:barreras`; `pedidos.md` lo usa `/inicio` v3 (P5.1). Decidido por Guido al sellar el delta del paquete 1 (D1.1) |
| 2026-10-28 | **Los repos de prueba se mudan a `../vibe-kit-pruebas/`**, fuera del repo; `rehacer.sh` y `pedidos.md` se quedan en `pruebas/` | Adentro, leer un archivo suyo cargaba su `CLAUDE.md` (y, según la doc, sus skills `/inicio` y `/cierre`) en la sesión de vibe-kit, y una sesión abierta en un repo de prueba heredaba el `CLAUDE.md` de vibe-kit: las pruebas del hook del paquete 2 nacían sucias. Guido: "si molesta y no cambia nada, movelos" (D2.1) |
| 2026-10-29 | **El director no corta por contexto**; y **D2.2 corre sin Guido presente**, con su autorización previa: decide con la recomendada y lo anota en "Decisiones sin Guido" de su fila para que él lo revise al volver | Guido (DP): "lo que la sesión recomendaba tendía a ser lo correcto"; los directores anteriores cerraron con mucho contexto de sobra. Nada del molde v3 llega a la flota antes del tag, así que toda decisión es reversible hasta ahí |
| 2026-10-29 | **D3.1 también corre sin Guido**, como D2.2, con dos diferencias: **el director sella el delta del paquete 3** (provisorio: "sellado sin Guido", después del red team sin ALTOS; Guido lo repasa al volver), y **nada toca el `~/.claude/` real de la PC**: los hooks por PC y el `doctor` se prueban con un `HOME` falso; instalarlos en `clientes` y `Usuario` (el "hecho cuando" del orden 3) queda para Guido. Las pruebas de D2.2 en una pestaña real, Guido las hace más adelante: no traban a D3.1 | Guido, al volver de D2.2: "hoy no tengo tiempo", quiere que siga codeando como a la noche. El sello a mano de los paquetes 1-3 era para que Guido leyera el formato que se congela antes de construir; como nada llega a la flota antes del tag, lo puede leer después y todo se deshace. La PC real no: un hook roto con `onFailure: block` traba todas sus sesiones |
| 2026-10-29 | **El paquete 3 pasa a dos directores (D3.1 y D3.2)**: D3.1 cortó a medias en un punto pedido por Guido; sus encargos a medio hacer quedan en ramas WIP locales y D3.2 los termina | Guido, a la tarde: "estamos con poca cuota de sesión"; prefirió frenar G3-G6 y cerrar limpio antes que quemar 1-2 h más de cuota en trabajo que igual había que revisar |
| 2026-10-29 | **El paquete 3 pasa a tres directores**: D3.2 solo cierra G3-G6 (de a dos Opus: G3 ∥ G6, después G4 ∥ G5) y D3.3 hace G7, G10-G13, el revisor frío y el `/cierre`. Las dos corren en la PC `Usuario`, preparada antes por otra sesión (abajo, "Abrir D3.2 y D3.3") | Guido, al retomar en `Usuario`: D3.1 cortó por meter todo junto; cada medición tarda 1-2 h y el plan semanal renueva el 1-11. Partido, si la cuota corta, corta en un punto limpio |
| 2026-10-29 | **No se paraleliza: un director por vez**, en el orden de la tabla (DP) | Decisión de Guido: en la misma PC, paralelizar pedía reglas nuevas y un ensayo antes de saber si rendía; "prefiero hacerlo bien y que tarde más" |
| 2026-10-30 | **El paquete 4 pasa a dos directores (D4.1 y D4.2)**: D4.1 deja todo el código en `main`; D4.2 rearma el pedido del Modo B corto y cierra las sesiones reales que faltan (crit. 4, 10 de 10, el prototipo) y el ✅ | D4.1 llegó a ~3 h y 10 encargos con el código, el red team, el revisor y sus arreglos hechos; el criterio 4 no se pudo medir porque el pedido de prueba estaba mal armado, y otra vuelta de corridas estiraba la sesión más allá del ADR-029 |
| 2026-10-30 | **La vara para decidir sin Guido (ADR-030)**: toda decisión de una sesión sin Guido se elige con sus cuatro cosas (con etiqueta; si no mueve ninguna, sobra), el filtro pragmático y los 11 criterios; si no alcanza, no se decide: pregunta arriba de Pendientes. En "Cómo decide una sesión sin Guido" | Guido: las decisiones sin él decían "la recomendada" sin vara; "de ahora en más, cuando se tengan que tomar decisiones, que use eso; y si aun así no puede resolver, que la deje para más adelante y pregunte" |
| 2026-10-30 | **Revisar y probar con presupuesto (ADR-029)**: contra accidentes y no contra trampas; revisor frío de una vuelta con hasta 10 hallazgos con escenario, y los arreglos en un encargo; mutación solo en piezas nuevas que deciden (tope 20 min); el corpus entero una vez por paquete; red team de una ronda; **~4 h y ~8 encargos por director**. Las reglas, en "Cómo se trabaja" y en el SPEC-0, "Ejecución" | Guido, después de D3.3 (18 h de agentes, 21 M de tokens, el 61% en arreglos del revisor frío): "hacer 60 revisiones en frío es una estupidez […] hay que probar lo que realmente importa, con criterio" |
| 2026-10-30 | **El revisor frío del paquete: una vuelta, con tope** (primer paso, a mitad de D3.3; lo amplió el ADR-029 el mismo día): se arregla en el paquete solo lo que rompe el día normal o deja pasar una clave sin que nadie lo intente; los ataques rebuscados van a "Lo que esto no cierra" y a Pendientes. D3.3 termina las rondas que ya corrían (RF-C2, RF-D2) y no hace una tercera vuelta | Guido, al ver D3.3 en ~9 h: "hay que corregir ese revisor frío, no hay que hacer tantas vueltas". D2.2 hizo tres vueltas; D3.3, dos vueltas y seis rondas de arreglos, cada una más cara (mutación + 16.470 llamadas del corpus) y rindiendo menos |
| 2026-10-28 | **Un director Opus por paquete con subagentes** en vez de una sesión por paso: de ~18-21 sesiones a 13 directores; los encargos mecánicos vuelven a Sonnet | ADR-028: propuesta de Guido (un orquestador para todo el spec), acotada a uno por paquete |

## Lecciones (insumo de la misión 6)

- 2026-10-30 · **D4.2: antes de medir una regla, mirar que la regla esté en el repo de prueba.** Las corridas de D4.1 midieron el tamaño
  sin la sección del `CLAUDE.md` del molde, porque `rehacer.sh` no la llevaba, y dieron 8 de 10 igual. El "grep de la regla en el clon antes
  de lanzar" lo atrapó. Y **dos de cinco corridas fallaron por el armado de la prueba, no por el kit** (14b dos veces, 16 con un criterio que
  chocaba con otra regla de la misma skill): una prueba de sesión real se diseña contra el repo donde va a correr, no en abstracto.

- 2026-10-30 · **D4.1: el ADR-029 rindió.** Un paquete entero (delta, red team, 5 encargos de construcción, revisor, arreglos, 3 de sesiones
  reales) en ~3,2 h de reloj y **~2,0 M de tokens de subagentes**, contra 18 h y 21 M de D3.3. Lo que lo hizo: una ronda de red team y una
  vuelta de revisor con hallazgos de escenario (9, todos chicos, un encargo), mutación solo en `ready`/sello y en el filtro/`cerrar` (≤ 20 min
  cada una), y dos Opus a la vez como máximo. Se pasó de ~8 a 10 encargos por las sesiones reales, que el presupuesto no contaba aparte.
- 2026-10-30 · **D4.1: un pedido de prueba también tiene que pasar la regla que prueba.** El pedido 14 ("Modo B corto con plan") traía un plan
  que entra en una sesión: por la regla del tamaño es chico, y la sesión y el Arquitecto tenían razón. Los pedidos de prueba se escriben
  mirando la regla, no el resultado que uno quiere ver.
- 2026-10-30 · **D4.1: `MSYS_NO_PATHCONV=1` solo en el lanzador.** Si la sesión de `claude.exe -p` la hereda, todo `node ~/…` desde Git Bash
  falla con una ruta `C:\c\Users\…` y parece un bug del kit (J5b lo reportó así; el director lo midió).
- 2026-10-30 · **D4.1: el clasificador del modo `auto` frenó el `kit-sync sync` a mitad de sesión** (por "no toques el `~/.claude/` real" del
  prompt) y lo dejó pasar en el `/cierre`. Una skill del proyecto no le gana a la personal del mismo nombre: para probar una skill nueva con
  sesiones reales, el sync va antes, como paso del cierre.

- 2026-10-30 · **D3.3: el revisor frío sin piso de severidad se come la sesión.** 17 encargos, 18 h de agentes y 21 M de tokens nuevos; **el
  61% en ocho rondas de arreglos** de 24 hallazgos, casi todos trampas a propósito que el delta ya daba por perdidas ("todo freno es un
  patrón"). Cada arreglo pagaba mutación + corpus entero + suite. El costo no estaba en revisar (20 min por vuelta) sino en arreglar todo
  lo que salía. → ADR-029.

- 2026-10-29 · **D2.2: las pruebas de skills con `claude -p` desde Git Bash mienten si el prompt empieza con `/`**: MSYS convierte
  `"/inicio …"` en `C:/Program Files/Git/inicio …` y la sesión nunca recibe la skill. La mitad de la primera vuelta de los diez pedidos
  salió así. Se corre con `MSYS_NO_PATHCONV=1`, y el informe mira el primer mensaje del transcript, no solo la respuesta.
- 2026-10-29 · **D2.2: el revisor frío encontró lo que el red team no podía ver**: el red team juzgó el texto (dos rondas, 5 ALTOS); el revisor
  armó repos y siguió el camino legítimo con dos PCs (`pull` con merge, con `--rebase`, `integrar`), y ahí aparecieron 4 ALTOS que traban a
  Guido, no a un atacante. Para lo que frena: el revisor tiene que recorrer el día normal, no solo los ataques.
- 2026-10-29 · **D2.2 corrió sin Guido de punta a punta**: 9 encargos, red team, revisor frío y sus arreglos, con las decisiones en su lista.
  Lo que no se pudo cerrar sin una persona (la ventana de `aprobar`, el pop-up, el modo `auto`, bypass con `claude.exe`) quedó en Pendientes.

- 2026-10-29 · **DP: paralelizar directores depende del hardware, no solo del grafo.** El grafo daba tres lugares; lo que lo hacía barato
  era una PC por director. En una sola PC aparecen las pruebas que se pisan, los repos de prueba compartidos y los frenos globales de un
  paquete metiéndose en la sesión del otro, y cada uno pide una regla. Para la misión 6 y para D (director/obrero): **antes de proponer
  paralelizar, preguntar cuántas PCs hay**, y presentar el costo en reglas junto con la ganancia.

- 2026-10-28 · **D2.1: el director no sabe cuánto contexto lleva.** Propuso cerrar "por pasar la mitad" con 26% usado (lo vio Guido en la
  app). La regla de "Límites" necesita una medida, no una impresión: hasta que exista el script `contexto` (P6.4, orden 5), el director
  **le pregunta a Guido el % que muestra la app** antes de cortar por contexto.
- 2026-10-28 · **D2.1: dos encargos Opus en paralelo tardaron ~75 min cada uno**: la suite entera (5 min sola)
  y la mutación de los dos se pisan en la misma PC (el archivo de pruebas del hook de escritura tardó de 85 a 330 s según la carga). Paralelizar encargos que corren suites largas no rinde el doble; **para DP**:
  dos directores en la misma PC compiten igual, y uno por PC (las dos PCs de Guido) puede rendir más.
- 2026-10-28 · **D2.1: el director midió antes de aceptar.** El informe de E4 decía "~2 s"; medido con una traza de los git, eran 15
  llamadas de ~250 ms y 10-24 s bajo carga. El arreglo (el plazo, E4b) salió de la medición, no del informe.
- 2026-10-28 · D2.1: el spec delta lo redactó un subagente Opus y el director lo revisó: el director quedó con contexto para seguir. El red
  team en tres rondas, retomando el mismo subagente, encontró 4 ALTOS (2 por ronda) en lo que congela formato; la ronda 3 dio 0.

- 2026-10-28 · **D1.1: el sello no alcanzó para congelar un formato.** Guido selló el delta y el revisor frío encontró después que la
  gramática no podía escribir dos cosas que los diseños ya habían decidido (el `deny` por su texto de F §14, las herramientas del SPEC-0) y
  que el ejemplo, copiado, sacaba frenos. Para lo que se congela (formatos que viajan a la flota), el delta tiene que cruzar **cada campo
  contra los diseños que lo citan** antes del sello, o pasar el revisor frío antes del sello y no después.
- 2026-10-28 · D1.1: **la prueba de mutación** (borrar una regla y ver si alguna prueba se pone roja) encontró que 15 de 21 reglas no tenían
  prueba propia aunque la suite daba 85 en verde. Vale como chequeo del director para todo parser o corrector del kit.
- 2026-10-28 · D1.1: los encargos en Sonnet salieron bien a la primera en lo mecánico; las fallas fueron de diseño (del delta), no de
  código. El revisor frío en Opus fue el encargo más caro y el que más valió.
- 2026-10-28 · Construir el kit con director y subagentes es un ensayo de lo que el kit v3 diseña (D): lo que moleste acá se anota
  como lección antes del piloto.
- 2026-10-27 · La misión 4½ arrancó en Fable y pasó a Opus al empezar a ejecutar: las decisiones ya estaban escritas.
