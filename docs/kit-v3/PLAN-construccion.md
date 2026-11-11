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
5. **La coherencia entre piezas** (ADR-034, Guido, 2026-11-03): toda decisión se mira contra cómo interactúa con las otras partes del kit
   (quién lo lee, quién lo escribe, qué otra pieza espera eso): que concuerden, no se contradigan y el conjunto siga cohesivo. Etiqueta `[coherencia]`.
6. **Lo técnico lo decide la sesión** (ADR-034): lo que no le cambia el día a día a Guido se decide con esta vara mirando el sistema
   entero y se anota; a él le llega solo lo que le cambia algo, dicho como "qué cambia en tu día", y las decisiones quedan en criollo.

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
| 5 | Director/obrero, `/estado`, resumen del día, la mesa, subagentes | 3 | ✅ 2026-11-02 (D5.1 el día · D5.2 la noche, las vistas, `/tramo`, los subagentes, la mesa · D5.3 el corrector de afirmaciones, que avisa; **te espera**: las pestañas reales y repasar las ⚠️: Pendientes) ([`SPEC-paquete-5.md`](SPEC-paquete-5.md)) |
| 6 | Equipador v3, actualizador, adoptador, `doctor` completo | 2 | ✅ 2026-11-02 (D6.1 la PC, el `doctor`, `aplicar` y `chequear` · D6.2 la flota, la fusión `adaptada`, el adoptador; **te espera**: "preparame esta PC" en la segunda PC, la fusión con un `claude` real, repasar las ⚠️: Pendientes) ([`SPEC-paquete-6.md`](SPEC-paquete-6.md)) |
| 7 | El ciclo de `cambios` (flota, migración de Hermes) y la portada | 1 | ✅ 2026-11-02 (D7.1; **te espera**: repasar las ⚠️; el `D-n` de Mobile y la portada en GitHub, al piloto: Pendientes) ([`SPEC-paquete-7.md`](SPEC-paquete-7.md)) |
| 8 | El observatorio mide la línea base; playbook, guía y manuales al día | 1 | ✅ 2026-11-03 (D8.1; **te espera**: repasar las ⚠️ y las decisiones sin vos en criollo, y decidir el proyecto de la prueba real: "Cambios al plan") ([`SPEC-paquete-8.md`](SPEC-paquete-8.md)) |
| 8b | Lo que dejó el repaso de Guido (2026-11-03): obrero de fondo en `auto`, el `por:` de las adaptadas, las cuatro opciones con recomendada, el `-rc` en la ficha, el `/inicio` sin arranques heredados, el obrero de cierre por tramo, githooks al adoptar, el Modo A en v3, la línea del banner; y la beta `v3.0.0-rc.1` | 1 | ✅ 2026-11-03 (D8b.1; **la beta `v3.0.0-rc.1` taggeada**; el renglón (11), el obrero de cierre de tramo, sale en `rc.2`: D8b.1-c) ([`SPEC-paquete-8b.md`](SPEC-paquete-8b.md)) |
| 8½ | **Hermes** prepara sus llaves y se adopta (**con Guido**, la mañana del 2026-11-04): "preparame esta PC", `entornos:` con su clase, la credencial de escritura al almacén, `adoptar` con su OK | 0 | ⬜ |
| R1 | **La revisión integral de la rc.1** (ADR-034): el kit entero, tres miradas, solo lectura; y la tanda de correcciones (lo de taller lo decide la sesión, lo de negocio con Guido) | 1 | ✅ 2026-11-03, el informe ([`REVISION-INTEGRAL-rc1.md`](REVISION-INTEGRAL-rc1.md)): 4 traban la adopción con director (T1-T4), 2 preguntas para Guido · **la tanda de correcciones ✅ 2026-11-03 (D8r.1, la beta `v3.0.0-rc.2`)** ([`SPEC-paquete-8r.md`](SPEC-paquete-8r.md)) |
| 8r | **La rc.2: la tanda de correcciones de R1** (T1-T4, los 8 que le cambian algo a Guido, lo de taller, las 2 preguntas con la A) | 1 | ✅ 2026-11-03 (D8r.1; la beta `v3.0.0-rc.2` taggeada) ([`SPEC-paquete-8r.md`](SPEC-paquete-8r.md)) |
| 8r2 | **La rc.3: la tanda de taller de R1b** (t1-t12; D1-D4 con su mecánica, sin decidir) | 1 | ✅ 2026-11-04 (D8r.2; la beta `v3.0.0-rc.3` taggeada) ([`SPEC-paquete-8r2.md`](SPEC-paquete-8r2.md)) |
| 8r3 | **La rc.4 exprés**: que el bot de Arti se pueda adoptar (`carpeta-docs:`, el arranque con el mismo nombre) y el rojo de los `.pyc` de Hermes | 1 | ✅ 2026-11-04 (D8r.3; la beta `v3.0.0-rc.4` taggeada) ([`SPEC-paquete-8r3.md`](SPEC-paquete-8r3.md)) |
| 8c | **La rc.5**: el obrero de cierre de tramo (renglón 11) y los experimentos de método (diseño con Guido antes) | 1 + el diseño | ⬜ |
| 9 | **La prueba real: el primer módulo nuevo de Hermes con el kit v3** (desde el 2026-11-04); cada arreglo sale como `rc.N` y le llega a Hermes por la flota | 2 en la madre | ⬜ |
| 10 | Tag `v3.0` y nota de migración | 1 | ⬜ |
| | **Total** (sin el 0, ya hecho) | **16** | |

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
| D5.1 | Paquete 5, primera mitad: spec delta + red team, el canon director/obrero y sus correctores | 2026-10-30/31 (sin Guido, PC `Usuario`; **dos tramos** por una pausa pedida; **~3,5 h de reloj, ~2,0 M de tokens de subagentes** más 2 sesiones `claude.exe -p`) | `vibe-kit M5 · D5.1 · Paquete 5, primera mitad: delta, red team y el canon director/obrero` | 1 Sonnet (E4) · 7 Opus (redactor del delta, red team ×1, E1, E2, E3, revisor frío ×1, RF-fix) = **8** (ADR-029: ~8) | `5a3a1c9`…el cierre | ✅ **El día del canon en `main`**: el núcleo, `/director`, `/obrero`, la plantilla del encargo, el revisor; `encargo.cjs` (`presentar` con el corrector "spec sin sello", `mensaje`, `autorizado` sin bypass, `verificar` de seis líneas); `worktree integrar` y `cerrar --cancelado`. Delta **sellado sin Guido por script** (red team 1 ronda, 4 ALTOS integrados). Pruebas del paquete **163/163** corridas por el director; **mutación E1 64/67 · E3 30/32 · E2 29/30** (vivos equivalentes). Revisor frío 1 vuelta, 10 hallazgos (3 ALTOS del día normal: cancelar, dos PCs, temporal sucio), todos en un encargo. **Sesiones reales**: crit. 3 del kit ✅ (el obrero para sin commit); la ficha canónica de día de punta a punta (crit. 10 del delta); el clasificador dejó lanzar. **Hallazgo**: las `deny` con `Write(...)` no frenan (primero de D5.2). Suite: **2.290 de 2.291** (25 min, una vez, al final); la que falló (`kit-githook.test.cjs`, "el temporal se borró") cuenta los `kit-githook-*` del temporal del sistema y a la vez commiteaban los clones de las sesiones reales: sola da 41/41. Huella del `~/.claude/` real igual a la de la apertura. **Decisiones sin Guido**: arriba |
| D5.2 | Paquete 5, segunda mitad: `/estado`, resumen del día, subagentes, `CLAUDE.md` por criterios, la mesa | 2026-11-02 (sin Guido, PC `Draco-PC`; **~2,2 h de reloj, ~1,64 M de tokens de subagentes** más 3 sesiones `claude.exe -p`) | `vibe-kit M5 · D5.2 · Paquete 5, segunda mitad: la noche, /estado, el resumen y la mesa` | 3 Sonnet (K2, K4, K6) · 5 Opus (W0, K1, K3, revisor frío ×1, RF-fix) = **8** (ADR-029: ~8) | `36b5637`…el cierre | ✅ **Todo D5.2 en `main` salvo K5** (el corrector de afirmaciones, a D5.3 de entrada). W0 las `deny` sin `Write` (sesión real: sin aviso y el `Write` negado); K1 `.kit-noche`, `contexto`, `noche.cjs` (mutación 22/22; sesión real: niega con PARADA); K2 `tiempos`, `/estado`, `resumen` (la prueba RT1-13 compara cada cifra); K3 la mesa (G §19 entre dos clones; mutación 37/37); K4 `/tramo`, 6 agentes con `effort:`, `paquete.cjs`; K6 el texto y el `CLAUDE.md` del molde por los 11 criterios (3.044 → 2.666 B). Revisor frío 1 vuelta, 10 hallazgos (2 ALTOS), todos arreglados con 6 del director en un encargo. `rehacer.sh` LISTO y `estructura todo` 0 en `alfa` y `beta`. Suite: **2.431 de 2.432** (15 min, una vez, al final); la que falló es real: `pc/lib/contexto.cjs` tiene que ser copia byte a byte de la del molde que cambió K1 — la copió el director (mecánico, lo pide la prueba) y `pc/` dio 75/75. **Decisiones sin Guido**: arriba |
| D5.3 | Paquete 5, cierre: el corrector de afirmaciones (P6.10, A §5) medido contra el historial de git de Hermes | 2026-11-02 (sin Guido, PC `Draco-PC`; **~1,2 h de reloj, ~0,50 M de tokens de subagentes**) | `vibe-kit M5 · D5.3 · Paquete 5, cierre: el corrector de afirmaciones medido contra Hermes` | 3 Opus (K5, revisor frío ×1, RF-fix) = **3** (ADR-029: ~4) | `b10ed73`…`f849c0d` y el cierre | ✅ **Paquete 5 cerrado.** `afirmaciones.cjs` (lib con las reglas + CLI sobre las líneas agregadas de `git diff <base>..HEAD`), la sección `## Afirmaciones` del paquete del revisor, una línea en el obrero, `/tramo` y `revisor.md`. **Medido contra el git de Hermes** (unos 30 commits de solo prosa; reglas afinadas con la mitad vieja, medidas en la nueva): caza **27 de 504** líneas que se corrigieron (**5 de 9** sobre-afirmaciones de una muestra a mano; 1 de 41 obsoletas, fuera de alcance), marca **34 de 1.386** líneas vivas buenas (2,5%) y **17 de 1.552** de las aprobadas (1,1%) → **avisa, no frena** (D5.3-1). Revisor frío 1 vuelta, 8 hallazgos (1 ALTO: un archivo con espacio en la ruta daba "limpio"), todos en un encargo. Pruebas **148/148** y **mutación 49/49**, corridas por el director. Suite entera **2.454 de 2.454** verde (16 min, una vez, al final). **Decisiones sin Guido**: abajo |
| D6.1 | Paquete 6, primera mitad: delta + red team, "preparame esta PC", el `doctor` completo, P2.4, el núcleo del actualizador (`aplicar`, `chequear`) | 2026-11-02 (sin Guido, PC `Draco-PC`; **~3 h de reloj, ~1,77 M de tokens de subagentes**) | `vibe-kit M5 · D6.1 · Paquete 6: Equipador v3, actualizador, adoptador y doctor completo` | 1 Sonnet (E2) · 7 Opus (redactor del delta, red team ×1, E1, E3, E4, revisor frío ×1, RF-fix) = **8** (ADR-029: ~8) | `25a151e`…`2ecd550` y el cierre | ✅ **La PC y el núcleo del actualizador en `main`; la flota y el adoptador, a D6.2** (el delta ya lo partía). Delta **sellado sin Guido por script** (red team 1 ronda, 6 ALTOS integrados; el peor: un bloque `autoMode` sin `"$defaults"` le sacaba al clasificador la confianza en los repos de toda la PC). **E1** `preparar-pc.cjs` (una pregunta, `--plan`, `--flota`, lo editado no se pisa, `autoMode` y `crossSessionInbound` contra la doc, capa privada, `kit-pc.md`; mutación 23/25) · **E2** `doctor` de 14 a 26 chequeos con el inventario de frenos, `skill.test.cjs` (P2.4), el `SKILL.md` del Equipador por `preparar-pc` (10,2 → 9,1 KB) · **E3** `actualizar.cjs aplicar` con el catálogo y los moldes (mutación 24/25) · **E4** `chequear`, nueve líneas (mutación 25/25). Revisor frío 1 vuelta, 11 hallazgos (1 ALTO: el clon `--depth 1`), todos con RF-9 a RF-11 del director en un encargo. Pruebas **156/156** corridas por el director. **Prueba viva del crit. 9** (clon de `gama`, 2.4.2 → 2.4.3): `aplicar` bien y la segunda corrida "sin cambios"; `chequear` 8 ✅ y la línea 7 NO VERIFICADO por el plazo (→ RF-9, y 2 casos de `candado.test.cjs` que dan rojo fuera del repo: Pendientes). Suite: la cifra en el CHANGELOG. `settings.json` real con la huella de la apertura. **Decisiones sin Guido**: arriba |
| D6.2 | Paquete 6, cierre: la flota de punta a punta (`flota`, githooks en el clon, la fusión `adaptada`), el adoptador, `cargar-secreto` en un worktree, "toda la flota" en los repos de prueba | 2026-11-02 (sin Guido, PC `Draco-PC`; **~3,1 h de reloj (16:51-19:55), ~1,80 M de tokens de subagentes**) | `vibe-kit M5 · D6.2 · Paquete 6, cierre: la flota de punta a punta y el adoptador` | 2 Sonnet (F0, F5) · 6 Opus (F1, F2, F3, F4, revisor frío ×1, RF-fix) = **8** (ADR-029: ~8) | `b377e68`…`44e9575` y el cierre | ✅ **Paquete 6 cerrado, el adoptador incluido (no hizo falta D6.3).** **F0** la línea 7 de `chequear` copia el molde **crudo** (el instanciado rompía 2 casos de `candado.test` en toda actualización sana: causa raíz, 2 de 2, no era intermitente; la línea tarda ~13,5 min de 30) · **F1** `actualizar.cjs flota` (canónico por tag anotado, un repo detrás del otro en un clon de su `origin`, saltear, ROTA sin `--force`, protegido → te espera, la tabla; mutación 19/19) · **F2** los githooks del clon con `KIT_MOLDE` solo con `.kit-rol` = `actualizador` (mutación 19/21, 2 equivalentes) · **F3** la fusión `adaptada` (D6-19, opción C de Guido: `merge-file` a tres vías, con porqué sola, conflictos a `claude -p` en `acceptEdits`, sin porqué a `.claude/fusiones/` y una pregunta en `/inicio`; `piezas.<id>.por`; el runner del molde juzga el clon; mutación 23/24) · **F4** el adoptador (`adoptar --mirar`/`--aplicar`, dos commits; mutación 21/22) · **F5** `cargar-secreto` en un worktree, `flota.md`, el Equipador, la nota de 3.0.0. Revisor frío 1 vuelta, 10 hallazgos (1 ALTO: la base de una pieza que quedó en te espera), todos en un encargo (476/476). **Prueba viva** (crit. 15): `flota alfa beta gama` sobre copias de los remotos y un canónico `bare` con `v3.0.0-rc.1` → `alfa` y `beta` mezclados en un commit, `gama` salteado por `modulo/x`, ninguna `kit/*` viva, los checkouts intactos; y **`gama` v2.4.2 puro → 3.0.0 por `flota`: las nueve ✅ y mezclado** (17,6 min, la línea 7 entera: crit. 9 cerrado). Pruebas de cada encargo corridas por el director; suite: la cifra en el CHANGELOG. **Decisiones sin Guido**: arriba |
| D7.1 | Paquete 7: el ciclo de `cambios` y la portada | 2026-11-02 (sin Guido, PC `Draco-PC`; **~3 h de reloj (19:45-22:45), ~1,45 M de tokens de subagentes**) | `vibe-kit M5 · D7.1 · Paquete 7: el ciclo de cambios y la portada` | 3 Sonnet (B, D, el banner) · 6 Opus (red team ×1, A, C, revisor frío ×1, RF-fix, E8) = **9** (ADR-029: ~8; el noveno, pedido de Guido al cierre: **el banner siempre**) | `a61e648`…`511ec24` y el cierre | ✅ **Paquete 7 cerrado.** Delta **sellado sin Guido por script** (red team 1 ronda acotada, 4 ALTOS integrados: el retiro vaciaba zonas ajenas, un `3-barrera` subido quedaba rojo para siempre, la regla que no llegó, el candado de portada prendido en toda la flota). **A** `subio-al-kit` (lib pura + CLI + `verificar` + `barreras`), `kit/cubiertos.md` y `aplicar` cierra el ciclo con cinco condiciones (mutación 27/27) · **B** `cambios-flota.cjs` y `--urgentes` en el `/inicio` de vibe-kit (10 repos en 1,7 s; los de prueba, 0,9 s) · **C** `migrar-cambios.cjs`: **Hermes, 103 CM → 102 `aplicado` + 1 `propuesto`, 0 SHA sin resolver, `verificar` verde, `CAMBIOS.md` intacto** (corrido por el director sobre una copia del clon) · **D** la portada: `portada.cjs`, `candado:portada`, plantillas (README de `alfa` armado desde su NORTE). Revisor frío 1 vuelta, 7 hallazgos (1 ALTO: la línea para pegar sin `pieza:` mataba el ciclo de la flota), todos en un encargo (mutación 12/13, el vivo explicado); **E8** (lo encontró RF-fix): las zonas del molde traen texto de fábrica y el retiro no andaba nunca (mutación 5/5). Pruebas de cada encargo corridas por el director; suite entera **2.737 de 2.737** verde (17,5 min, una vez, al final). **Decisiones sin Guido**: arriba |
| D8.1 | Paquete 8: medir la línea base; playbook, guía, manuales | 2026-11-03 (casi todo sin Guido, PC `Guido-PC-eQ`; **~1,4 h de reloj (09:05-10:30), ~1,37 M de tokens de subagentes** más ~0,17 M del pedido aparte) | `vibe-kit M5 · D8.1 · Paquete 8: la línea base y la documentación al día` | 4 Sonnet (E1, E2, E4b, RF-fix) · 4 Opus (redactor del delta, E3, E4a, revisor frío ×1) = **8** (ADR-029: ~8) · más 1 Opus pedido por Guido (las decisiones sin él en criollo) | `6694244`…el cierre | ✅ **Paquete 8 cerrado.** Delta **sellado sin Guido por script, sin red team** (D8-1). **E1** `flota.py` lee la ficha con el parser del kit, ramas `kit/*`, copias, "aparece en N", specs con sello, portada, `--hook` en un clon, frases viejas y rutas absolutas (P8.3, 0 y 0 sobre el molde v3); `huella.py` con las dos historias del molde · **E2** la corrida del 2026-11-03 sobre clones de los 10 (`mediciones/2026-11-03.md` público en cifras agregadas, el detalle en `vibe-research`; las filas de lector quedan con octubre, D8-4) y la receta en `METODO.md` · **E3** PLAYBOOK §1.5 con los dos ejes, 25 notas en los diseños, ADR-033 · **E4a/E4b** la guía v3 y cinco manuales nuevos o reescritos (Arquitecto, Equipador, roles, molde, scripts) más el runbook; el manual v2 a `legacy/`. Revisor frío 1 vuelta, 6 hallazgos (1 ALTO: el hook con `args`), todos en un encargo. Pruebas del observatorio **42/42** corridas por el director; la suite del kit no se corrió (no se tocó `kit/`). **Decisiones sin Guido**: arriba |
| D8b.1 | Paquete 8b: lo que dejó el repaso de Guido, y la beta `v3.0.0-rc.1` | 2026-11-03 (sin Guido, PC `Guido-PC-eQ`; **~6,7 h de reloj (11:50-18:30; ADR-029: ~4 h, estirado por la beta), ~1,80 M de tokens de subagentes**) | `vibe-kit M5 · D8b.1 · Paquete 8b y la beta v3.0.0-rc.1` | 2 Sonnet (C, E) · 6 Opus (redactor del delta, red team ×1, A, B, revisor frío ×1, RF-fix) = **8** (ADR-029: ~8; D no corrió) | `4be71f1`…el tag `v3.0.0-rc.1` | ✅ **La beta `v3.0.0-rc.1`.** Delta **sellado sin Guido por script** (red team 1 ronda, 3 ALTOS integrados; r1-3 cerrado midiendo `auto` con los porteros). **C** la versión entera con `-rc` y la línea del banner · **A** el obrero de fondo en `auto` con respaldo (mutación 5/5), los githooks en el OK de la adopción con `--principal` (mutación 8/8), el Modo A con el molde v3 (corrida de punta a punta 26/26, con y sin `scripts.test`) · **B** el `por:` solo, las cuatro salidas, `resolver`, `desde:`, el `/inicio` sin arranques heredados (mutación 7/7) · **E** (fuera del plan) la línea llaves daba ROTA desde D7.1. Revisor frío 1 vuelta, 8 hallazgos (1 ALTO), todos en un encargo. Suite entera **2.774 de 2.774** (2 fallas en la corrida cargada: una de plazo y la prueba de la nota que buscaba `## 3.0.0`; solas, verdes). **Flota** sobre copias de los remotos rehechos y un canónico bare: `alfa` y `beta` 2.4.2 → rc.1 mezclados; con un `rc.2` de prueba, `alfa` y `beta` rc.1 → rc.2 y `gama` 2.4.2 → rc.2 mezclados, nada te espera, **sale 0**. (11) a `rc.2`. **Decisiones sin Guido**: arriba |
| R1 | La revisión integral de la rc.1 | 2026-11-03 (corrida por la sesión madre: Remote Control no deja abrir sesiones) | el chat de D8.1 | 3 Opus (las tres miradas) · la síntesis, la madre | el commit del informe | ✅ 20 hallazgos distintos: 4 traban mañana con director, 8 le cambian algo a Guido, el resto de taller; 2 preguntas |
| — | Diseño con Guido: probar una idea nueva (experimentos) | | | | | |
| D8c.1 | La rc.2: cierre de tramo, experimentos y las correcciones de R1 | | | | | |
| D9.1 | Acompañar la prueba real en Hermes (los `rc.N`) | | | | | |
| D9.2 | Medir la prueba contra la línea base (`mediciones/2026-11-03.md`) | | | | | |
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
- **De los encargos**: J1 · `comando-test` y los `chequeo` corren en la shell del sistema (cmd.exe en Windows; desde la rc.3, Git Bash: D8r2-3); `--no-aplica tamano` sin ñ
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

### D5.1 · Decisiones sin Guido

D5.1 corrió sin Guido, con su autorización previa (su prompt, abajo) y con la vara del ADR-030, **en dos tramos** (2026-10-30 de 15:08 a 16:15, pausa
pedida por Guido por el corte de internet, y 2026-10-31 desde las 13:25). **Las ⚠️ arriba**, todas se deshacen antes del tag. El detalle, en
[`SPEC-paquete-5.md`](SPEC-paquete-5.md) ("Riesgos y decisiones"). Ninguna quedó sin poder decidirse con la vara: **no hay preguntas nuevas arriba de Pendientes**.

- ⚠️ **Sellé yo el delta del paquete 5** (provisorio, por el script, `hash 7c949bb227f1`), después de la ronda única del red team con sus 4 ALTOS
  integrados. *Alternativa*: esperarte. Repasalo al volver; lo que más pesa son las tres de abajo.
- ⚠️ **D5-2 · Ningún obrero corre en bypass.** El director lo lanza solo si se lo pedís o el encargo dice `Apertura: director`, con la **línea de fondo
  que imprime `encargo.cjs autorizado`**: `acceptEdits` + `--allowedTools` con la base (lectura, git, `encargo.cjs`, el test) y el `## AUTORIZADO` del
  encargo. **Medido**: el clasificador del modo `auto` dejó lanzar las dos corridas, y el obrero hizo su sub-paso sin un permiso negado. Si un encargo de verdad
  necesita bypass, lo tipeás vos en tu terminal. `[workflow · mejor código]` *Contradice* F §14.4 y D §7.4 ("de noche, bypass con el hook debajo").
- ⚠️ **D5-19 · Tu pestaña de obrero abre en tu modo** (casi siempre `auto`), la línea no lo fuerza: lo de AUTORIZADO y la base no preguntan; lo demás lo
  decide el clasificador, y las 5 de A te las sigue preguntando `sensible`. *Alternativa*: forzar `default` (pop-up para todo lo demás). `[workflow · acordarse de menos]`
- ⚠️ **D5-3 · `integrar` no corre `/cierre`**: chequeos, merge `--no-ff` en un temporal sobre `origin/main`, el gate y el push; handoff, TODO y CHANGELOG
  los pone al día el próximo `/cierre` de `main`. *Contradice* H §10.2 y D §8.4. `[workflow · acordarse de menos · mejor código]`
- ⚠️ **D5-1 · El paquete 5 partido en dos**: D5.1 "el día" (núcleo, `/director`, `/obrero`, `encargo.cjs`, `integrar`, el revisor) y D5.2 "la noche y las
  vistas" (`/estado`, resumen del día, `/tramo`, los demás subagentes, `/smoke`/`/release`, la mesa, `.kit-noche`, `contexto`, `tiempos`, P6.10, `CLAUDE.md`).
  `/tramo` pasó a D5.2 con los subagentes que coordina. `[mejor código · consistencia]`
- ⚠️ **D5-5 · En las apps, la mutación solo en sub-pasos de `Riesgo: alto`**, tope 20 min (el ADR-029 llevado a las apps; contradice D §6 y §15.4).
- ⚠️ **RF-fix · `worktree cerrar <x>--<ID> --cancelado`** (rf-1, fuera de la CLI del delta): cancelar un encargo exige el renglón `cancelado <ID> @<sha7>`
  commiteado en la ficha y entonces borra el worktree con `--force`, la rama y la de `origin`. Sin él, un encargo cancelado trababa `integrar` para siempre.
  `[workflow]`
- D5-4 un `allow` de más en el worktree es ⚠️, no ❌ (lo produce "no preguntar más") · D5-6 el vocabulario sin tilde, la tilde alias · D5-7/D5-8 un solo
  `encargo.cjs` con la lógica en `hooks/lib/` (barrera), `sello.cjs` copiado byte a byte · D5-12 un commit en `main` de noche traba, de día avisa · D5-13
  lo de afuera de `## Toca` es ⚠️ · D5-14 `integrar` pide `--ok-de-guido` si la ficha endureció `merge-a-main` · D5-17 `revisor.md` adelantado.
- **Del red team** (4 ALTOS): `integrar` equipa su temporal como `equipar` (si no, `npm test` sin `node_modules`); la base de `--allowedTools` con lo de
  lectura de D4.2; **ninguna clave propia en `settings.local.json`** (`verificar` calcula lo autorizado sin estado); base + AUTORIZADO también en la
  pestaña y en forma `PowerShell(...)`.
- **Del revisor frío** (10 hallazgos, una vuelta, todos arreglados en un encargo): `integrar` borra su temporal con `--force` y sale 0 si ya subió;
  `/director` pushea `modulo/<x>` y `presentar`/`mensaje`/`verificar` hacen `fetch --prune` (dos PCs); `presentar --spec` mira el `SPEC-N.md` más nuevo;
  `cerrar <x>` del módulo, desde el principal; `verificar` línea 2 no traba por lo que deja la suite sin ignorar (⚠️); `mensaje` tolera markdown.
- **Del director** (dos, al leer el diff de E2): **la línea de fondo manda el pedido por stdin con `printf`** (desde Git Bash, `-p "/obrero …"` llega
  convertido en ruta, la lección de D2.2; nunca `MSYS_NO_PATHCONV`), y **`claude` se busca también en la extensión de VS Code** (en esta PC no está en el
  PATH). Y uno de la fila 2: `/director` paso 9 pone **la ficha y su spec** en `COMPLETO` (el candado de `integrar` frenó con solo la ficha).
- **De los encargos**: E1 · el validador de AUTORIZADO rechaza además `python -c *`, `cmd /c *`, `C:/…`, `**/*` y `WebFetch` sin `domain:`. E2 · las formas
  de las reglas son las de la doc (`Bash(x:*)` = `Bash(x *)`; una regla por argumento en `--allowedTools`), citadas en el código; `verificar` imprime las seis
  líneas aunque falte algo (la que no se puede mirar, NO VERIFICADO). E3 · el setup del temporal corre después del merge; un módulo ya integrado sale 0 "nada
  que integrar"; el test corre adentro de un vigía que mata el árbol (`hooks/lib/proceso.cjs`, compartido).

### D5.2 · Decisiones sin Guido

D5.2 corrió sin Guido, con su autorización previa (su prompt, abajo) y la vara del ADR-030, el 2026-11-02 en `Draco-PC` desde las 10:15.
**Las ⚠️ arriba**; todas se deshacen antes del tag.

- ⚠️ **K5 (el corrector de afirmaciones) pasa a D5.3 de entrada**, sin intentarlo: su "hecho cuando" es *medido contra el historial de Hermes antes
  de instalar*, y ese historial vive en la PC `clientes`. Construirlo acá sin medir es un corrector que nadie calibró. `[mejor código]`
- **W0 junta los pendientes 1-3 de "Paquete 5 · para D5.2"** (las `deny` con `Write`, la negativa de `cerrar` con lo sin trackear, el temporal
  de la prueba del githook): son chicos y tocan los mismos alrededores; un encargo en vez de tres. `[workflow]`
- **`contexto` es un script nuevo** (`scripts/contexto.cjs`), distinto de `hooks/lib/contexto.cjs` (el rol): la salida tiene un contrato fijo de
  una línea que leen `/estado` y `/director`, fijado por el director antes de repartir para que K1 y K2 corran en paralelo. `[consistencia]`
- ⚠️ **W0 · las `Write(...)` se sacan, no se duplican en `Edit`**: los `Edit(...)` hermanos ya estaban en el molde, así que el freno no cambia;
  la segunda capa de `.env` del worktree queda `Read` + `Edit`. Un proyecto con el molde viejo conserva sus `Write` hasta el actualizador (paquete 6),
  que las retira con `--molde-viejo` (probado en `barreras`, caso 7). `[consistencia · acordarse de menos]`
- **W0 · `cerrar` con lo sin trackear no borra**: lista hasta 5 rutas y da `clean -nd` para mirar y `clean -fd` para que lo borre una persona o el
  director. `[workflow]`
- ⚠️ **K1 · `.kit-noche` del director alcanza al obrero**: un obrero (`modulo/<x>--<ID>`) es de noche si el worktree de `modulo/<x>` tiene la marca
  (una llamada a `git worktree list` solo cuando hace falta). Con un rol de día, la marca pasa a `nocturno` en `sensible`, `db-guardia`, el githook
  y `verificar` línea 5. Si git falla, no inventa noche (decide como antes). Mutación 22/22. `[mejor código · acordarse de menos]`
- **K1 · `noche.cjs volvi` borra la marca de todos los worktrees del repo** (Guido vuelve desde el principal); **el despertador** guarda su foto en la
  carpeta común de git y despierta por commit de un obrero, PARADA (la evidencia que empieza con `PARADA:`), commit en `main` (CM-79) o "sin red".
  La PARADA de `presentar` no deja rastro en git: el despertador no la ve (NO VERIFICADO cómo despierta, piloto). `[workflow]`
- **K2 · las cifras de `/estado`**: avance = tareas `- [x]` / tareas de la ficha (sin tareas, `—`); "podés cerrar" = sesiones vivas cuya rama ya está
  mergeada en el módulo; "desde" = el commit que agregó el renglón. La marca "el resumen ya se mostró" vive en la carpeta común de git (no ensucia el
  árbol; la primera versión la dejaba en `.claude/`). `[consistencia · mejor código]`
- **K4 · un agente `implementador` de más** (Sonnet, el único que escribe; no commitea): `/tramo` lo necesita (D §6). `effort:` verificado en la doc
  oficial de subagentes; `redteam-spec` con `model: opus` y `effort: high`. La plantilla del encargo y la presentación del obrero **ya traían**
  modelo y esfuerzo: no se tocaron, se fijaron con una prueba. `[consistencia]`
- **Sesión real 1** (`claude.exe` 2.1.314, `-p`, `acceptEdits`, un clon de `alfa` recién armado, con `Write` en `--allowedTools`): **ya no sale el aviso**
  de "`Write(...)` is not matched", y el `Write` a `.claude/cambios/` lo niega la `deny` de `Edit` ("File is in a directory that is denied by your
  permission settings"), aun con el `allow` del proyecto ignorado por la confianza. `/estado` corrió de verdad: vista corta sin preguntar, `contexto`
  medido sobre su propio transcript (51k de 1000k).
- **Sesión real 2, la noche** (mismo clon, `acceptEdits`, `echo … --borra-datos-reales` permitido por `--allowedTools`): con `.kit-noche` en la raíz, el
  hook `sensible` **negó con PARADA** ("de noche: .kit-noche") y dejó el renglón `datos-reales (kit-noche)` en `frenos.log` (crit. 16 del delta). De
  yapa: `vercel --prod` pasa en `alfa` porque su ficha dice `release: no` (correcto); y `rehacer.sh` no ponía `/.kit-noche` en el `.gitignore`.
- **K3 · la mesa**: el "otro repo" es el remoto de git con el nombre del alias (ningún campo nuevo en la ficha, D5-15); ⚠️ `mesa nuevo` **sube a
  `origin`** antes de imprimir el aviso (crit. 13: primero el archivo) y **se niega** desde un obrero y desde el director de otro módulo; ⚠️
  `candado:mesa` frena > 2 KB, cabecera o tipo inválidos, un nombre que no es de `mesa nuevo`, un archivo reescrito o borrado y un acuerdo firmado
  dos veces (no mira la historia sin pushear, para no trabar para siempre). Esperan respuesta PEDIDO, PROPUESTA y ALERTA. G §19 reproducida entre
  dos clones con remotos `bare`; el envío real por `SendMessage`, NO VERIFICADO. Mutación 37/37. `[consistencia · mejor código]`
- **Revisor frío** (Opus, una vuelta, 10 hallazgos, 2 ALTOS, todos del día normal) **+ 6 del director**, en **un** encargo (RF-fix, Opus): **la noche
  terminaba nunca** (`volvi` solo corría con la marca en el principal; ahora `/inicio` y `/estado` del dueño lo corren siempre) · ⚠️ **`verificar`
  línea 5 cuenta de noche solo los commits en `main` posteriores al "me voy"** (los de antes, ⚠️; mutación 6/7, el vivo es el borde del minuto) ·
  una foto del despertador por módulo · la mesa mide sin `\r` y `eol=lf` en el snippet · el número del mensaje mira también git · el resumen ve la
  rama del director y las de `origin` · el paquete del revisor en `.claude/paquetes/` (ignorado; el revisor sin shell lo puede leer) con
  `--pruebas`/`--sin-pruebas` · `cerrar` sugiere `clean … -e .claude/frenos.log` · `tiempos` mide desde la partida · ⚠️ **un `Write(<ruta>)` de
  AUTORIZADO va como `Edit(<ruta>)`** en las `allow` y en `--allowedTools` · `.kit-noche` protegida como `.kit-rol` en `secretos` y en `worktree` ·
  el paso de la mesa en `/inicio` · `rehacer.sh` suma el `.gitignore` del molde de hoy (la causa: solo sumaba el del molde de D2.1).
  *No se cierra* (trampas, sin arreglo): un director que cita un commit propio como del otro repo; un agente que borra `.kit-noche` o corre `volvi`.

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

### D5.3 · Decisiones sin Guido

D5.3 corrió sin Guido, con su autorización previa (su prompt, abajo) y la vara del ADR-030, el 2026-11-02 en `Draco-PC` desde las 12:30.
**Las ⚠️ arriba**; todas se deshacen antes del tag. No hay preguntas nuevas arriba de Pendientes.

- ⚠️ **D5.3-1 · El corrector de afirmaciones avisa, no frena.** La medición (el corpus: las líneas de prosa quitadas en unos 30 commits de solo prosa de
  Hermes son las falsas; las agregadas en esos commits y la prosa viva en HEAD, las buenas) dio falsos positivos en todas las variantes; la más
  estricta los bajaba a 86 en la mitad vieja y cazaba 0 de 9 sobre-afirmaciones en la nueva. A §5: con falsos positivos no se instala como freno.
  Queda `--frenar` latente (sale 1 y anota `frenos.log`) para cuando las reglas den 0. `[mejor código · workflow]`
- ⚠️ **D5.3-2 · Dónde engancha**: en el paquete del revisor (`## Afirmaciones`, hasta 30 avisos y "+N más") y en el paso 3 del obrero y el 5 de
  `/tramo` ("mirá cada uno: corregí los que prometen de más en lo que escribiste vos, commit aparte; los demás, dejalos"); `revisor.md` los toma
  como avisos (uno es hallazgo solo si, leído en contexto, promete de más). **No** en los githooks (los falsos positivos frenarían a todos) ni en
  `verificar` (contrato de seis líneas). `[workflow · consistencia]`
- **Lo que la medición enseñó**: casi todo lo que Hermes corrigió a mano en la prosa es **obsoleto** (era cierto y el código cambió: "sesión por
  usuario", "camino viejo"), no promesa de más: en una muestra de 100, 14 sobre-afirmaciones. Un chequeo sobre las líneas agregadas no lo puede ver.
  El hueco 4 del acta (la primera causa de vueltas del revisor) **se cierra a medias**: lo que promete de más, sí; lo viejo, no. `[mejor código]`
- **Del revisor frío** (Opus, una vuelta, 8 hallazgos, 1 ALTO, todos del día normal; los arreglos en **un** encargo, RF-fix, Opus porque re-medía):
  una ruta con espacios o `diff.noprefix` se salteaba y decía "limpio" (ahora prefijos a mano y, si git no lee un archivo, NO VERIFICADO); `git mv`
  y reindentados no son prosa nueva (`-M -w`); el obrero no convierte el aviso en freno; el revisor sabe qué hacer con la sección; la evidencia
  en el renglón siguiente cuenta; el `%`; "siempre que" es condicional; el escape de PowerShell es el backtick. **Del director**: el aviso
  pregunta ("¿promete de más? … si sí: …; si vale, dejalo") en vez de "eso no", que queda para `--frenar`.
- ⚠️ **RF-fix · la evidencia vale en una ventana de ±3 renglones, no en el bloque entero** (el revisor pidió el bloque): con el bloque entero los
  falsos positivos en vivos bajaban de 34 a 20, pero se perdían 3 de las 5 sobre-afirmaciones cazadas (docstrings de 30-50 renglones que nombran su
  propio `test_…`). Es una constante (`VENTANA_ESCAPE`). La mitad nueva **ya no es ciega** después de RF-fix ("de siempre" y la ventana salen de
  mirarla): los números de la fila son con las reglas finales. `[mejor código]`
- *No se cierra* (trampas, sin arreglo): tapar un aviso con cualquier fecha, un hex o una cifra; escribir el absoluto en un `.md` común.

### D6.1 · Decisiones sin Guido

D6.1 corrió sin Guido, con su autorización previa (su prompt, abajo) y la vara del ADR-030, el 2026-11-02 en `Draco-PC` desde las 13:40.
**Las ⚠️ arriba**; todas se deshacen antes del tag. No hay preguntas nuevas arriba de Pendientes. El detalle de cada una, en el delta
(`SPEC-paquete-6.md`, "Riesgos y decisiones").

- ⚠️ **D6-1 · Nadie corre en bypass: el actualizador y el adoptador son un script de node.** El SPEC-0 (P7.1, P7.2 y su ⚠️) pedía un `claude -p`
  por proyecto en bypass; desde D4.2 el clasificador de `auto` frena eso. `aplicar`, `chequear`, la rama, la mezcla y la tabla los hace
  `actualizar.cjs`; solo la fusión de una pieza `adaptada` usaría un `claude -p` en `acceptEdits` con `--allowedTools` estrecho, y si no entra,
  "no fusiona y avisa". **Vuelve al diseño E §6 con fecha** al cerrar D6.2. `[workflow · mejor código · acordarse de menos]`
- ⚠️ **D6-5 · Un catálogo pieza → archivos** (`lib/catalogo.cjs`), con cada pieza `base` u `opcional`; hoy eso lo sabía solo `rehacer.sh`.
  Toda ruta del molde cae en una pieza o la prueba da rojo. E3 sumó la pieza `scripts` (los scripts dependen unos de otros). `[consistencia]`
- ⚠️ **D6-6 · Los githooks en el clon** dejan pasar el molde (`KIT_MOLDE`, solo con `.kit-rol` = `actualizador`): **es de D6.2**. Por r1-5,
  `aplicar` **no** pone `core.hooksPath` en D6.1 (trabaría su propio commit); lo pone `flota`. `[mejor código]`
- ⚠️ **D6-7 · El guardia**: un archivo está intacto si es igual al molde viejo fuera de la zona propia, si coincide el hash de la ficha, o si
  ya es igual al nuevo (E3: así una corrida cortada se repite sin falsos desvíos). **Por pieza entera**: uno solo editado y la pieza no se toca.
  `[mejor código]`
- ⚠️ **r1-1 · El bloque `autoMode` se crea con `"$defaults"` primero** (la doc oficial: una lista sin él reemplaza los de fábrica, entre ellos
  "Trusted repo" y "Source control", y el clasificador frenaría los push de toda la PC). El kit toca solo `autoMode.environment`. **RF-2**: una
  entrada idéntica a la que el kit genera se reclama como del kit (si no, quedaba colgada para siempre al borrar el proyecto). `[workflow]`
- **D6-18 (r1-8)**: `core.hooksPath` en los checkouts de Guido no lo pone nadie solo: `doctor` tiene el id `githooks` (⚠ con la línea
  `git config`). `/inicio` no se tocó (eso sí sería decisión de Guido). `[acordarse de menos · consistencia]`
- **RF-12**: si "actualizate" deja archivos editados sin pisar, `VERSION` **no sube** (así `doctor` sigue diciendo "atrás"). `[consistencia]`
- **Lo que la prueba viva enseñó** (aplicar + `chequear` sobre un clon de `gama`, v2.4.2 → 2.4.3): `aplicar` anduvo (segunda corrida todo
  "sin cambios", `CLAUDE.md` intacto) y `chequear` dio 8 ✅ y la línea 7 NO VERIFICADO: corría las pruebas de los hooks **dueño por dueño, en
  fila, con un solo plazo de 30 min**. RF-9 las junta en una corrida (la tanda entera del molde: 1.908 casos, 12,5-18 min). Y 2 casos de
  `candado.test.cjs` ("estado-viejo") dieron rojo en la copia y verde en el molde: a Pendientes de D6.2. `[mejor código]`
- **Del revisor frío** (Opus, una vuelta, 11 hallazgos: 1 ALTO, 6 MEDIOS, 4 BAJOS, todos del día normal; los arreglos en **un** encargo con
  RF-9 a RF-11 del director): el clon `--depth 1` hacía que todo pareciera "editado a mano" (ahora ✗ con `fetch --unshallow --tags`); correr
  el `preparar-pc` instalado con un `--kit` nuevo; `"$CLAUDE_PROJECT_DIR"/…` partido en dos; `comando-setup` antes de `comando-test`; el
  mensaje tras un corte; `gh` sin red daba ✓; lo que el kit retira no se borraba; el bash de WSL; un remoto de la mesa que no es de GitHub.
  Nada pisaba un archivo propio ni daba `chequear` verde con algo roto (lo probó).
- **Un tropiezo del director**: un merge se pusheó con 2 avisos de gitleaks porque la tubería con `tail` tapó el código de salida. Eran un
  falso positivo (`VALOR-SECRETO-123`, un valor de prueba en `doctor.test.cjs`; RF-11 lo reescribió), pero queda en la historia pública. Desde
  ahí, gitleaks sin tubería y el push solo con salida 0. `[mejor código]`
- *No se cierra* (trampas, sin arreglo): `.kit-rol: actualizador` escrito a mano en la carpeta de Guido; editar `kit-pc.md` para adoptar
  entradas ajenas; un `instalar.cjs` privado malicioso; `KIT_MOLDE` o `KIT_REPO_CANONICO` exportados a mano; un allowlist de gitleaks en el commit.

### D6.2 · Decisiones sin Guido

D6.2 corrió sin Guido, con su autorización previa (su prompt, abajo) y la vara del ADR-030, el 2026-11-02 en `Draco-PC` desde las 16:51.
**Las ⚠️ arriba**; todas se deshacen antes del tag. **Una pregunta nueva arriba de Pendientes** (el porqué del `git log`).

- ⚠️ **D6.2-1 · La ficha suma `piezas.<id>.por`** (texto, solo en `adaptada`, `adaptada (desvío detectado)` o `propia`). El delta decía
  "ningún campo nuevo en la ficha", pero D6-19 (de Guido) pide que el porqué quede en la ficha; es el mismo `por:` de `frenos.quitados`.
  `pc/lib/ficha.cjs` sigue copia byte a byte. `[consistencia · acordarse de menos]`
- ⚠️ **D6.2-2 · La fusión, primero sin agente**: `git merge-file` a tres vías (molde viejo, nuevo, lo del proyecto; la zona propia
  aparte). Limpia y con porqué → sola. Solo con conflictos → `claude -p` en `acceptEdits`, `Read`/`Edit` de `.kit-fusion/**`, `deny`
  Bash, 5 min, y el script valida (sin marcadores, zona intacta, `node --check`, ninguna otra ruta). `--claude no` lo apaga.
  `[mejor código · workflow]`
- ⚠️ **D6.2-3 · Un hook adaptado nunca se fusiona solo**: el candado frena todo hook distinto del molde, así que la fusión de un hook
  siempre termina en "te espera" y el commit del dueño pide su `aprobado`. Es lo que pide B §14 (los frenos los toca Guido). `[mejor código]`
- ⚠️ **D6.2-4 · El commit y el push del clon los juzga el runner del molde nuevo** (una carpeta de hooks fuera del clon; `core.hooksPath`
  ahí), no el `.githooks/` del proyecto: en `alfa` la pieza `githooks` estaba adaptada, el runner viejo no conocía `KIT_MOLDE` y el repo
  no se actualizaba nunca (lo midió F2). Ajusta D6-6. `[workflow · mejor código]`
- ⚠️ **D6.2-5 · Un v2.4.2 con ficha y sin candado en `origin/main`**: con `.kit-rol` = `actualizador` y `KIT_MOLDE`, el runner corre el
  candado **del molde** (de afuera del clon: lo commiteado no lo cambia) en lugar de dar rojo fijo. `[workflow]`
- ⚠️ **D6.2-6 · La adopción va en dos commits** (las piezas, después la ficha): la exención (b) del candado compara la ficha contra la de
  fábrica **del commit padre**, que llega con las piezas. `chequear` no corre en la adopción (pide la ficha en la base): `barreras --rango`,
  y `chequear` desde la primera flota. `[consistencia]`
- **D6.2-7 · El porqué del `git log`**: los asuntos de los commits que **modificaron** archivos de la pieza (crearla no es adaptarla), sin
  los del actualizador (`kit-actualizador`, `^kit[: ]`). El de la ficha manda; el del `git log` no se copia a la ficha. `[mejor código]`
- **D6.2-8 · La flota**: sin `gh` (protegido = el push rechazado); identidad `kit-actualizador`; en verde, `kit/<tag>` nunca se sube (ff
  directo a la rama por defecto); el salteo por `director: sí` en obra no hace falta (lo cubren las `modulo/*` vivas). `[acordarse de menos]`
- **D6.2-9 · Una fusión que no pasa el commit o `chequear`** no hace ROTA el repo: se rehace sin fusionar (esas piezas a "te espera") y
  se rechequea; recién si sigue rojo, ROTA. `[workflow]`
- **El adoptador toma como molde viejo el `v2.*` que más archivos casa** (con los `{{…}}` completados): así `/inicio` y `/cierre` v2 sin
  editar se reemplazan y `session-start.sh`/`check-code.js` se retiran. `[mejor código]`
- **Del revisor frío** (Opus, una vuelta, 10 hallazgos: 1 ALTO, 4 MEDIOS, 5 BAJOS, todos del día normal; los arreglos en **un** encargo,
  RF-fix, Opus): ⚠️ **la base de una pieza que quedó en "te espera"** viaja en su `.claude/fusiones/<pieza>.md` (`base: <versión>`); mientras
  el archivo exista la pieza no se fusiona sola y la flota siguiente rehace el informe desde esa base (si no, `merge-file` salía limpio y
  perdía lo de la versión intermedia) · ⚠️ **"No" en `/inicio` deja la pieza `adaptada`** con el `por:` del dueño (se vuelve a ofrecer en la
  versión siguiente); `propia` solo si lo pide explícito, y nunca en una pieza de frenos · ⚠️ **la rama es `kit/<tag>`** y con un `-rc`
  siempre se aplica ("al día" = `aplicar` sin cambios) · el adoptador no toma por "v2 sin editar" un `{{BUGS_HISTORICOS}}` lleno · un push
  sin red no se rotula "protegida" · ssh con `BatchMode` · `todo` con toda carpeta con `origin` · los docs dicen los dos commits. Lo de
  fondo del "porqué del `git log`" quedó como **pregunta para Guido** (arriba de Pendientes).
- *No se cierra* (trampas, sin arreglo): `.kit-rol` + `KIT_MOLDE` a mano; un `claude` falso primero en el `PATH`; `acceptEdits` aprueba
  ediciones fuera de `.kit-fusion/` (lo frena la validación después, no antes); los hooks del proyecto corren en el clon cuando arranca
  la fusión; un `estructura.cjs` malicioso en `origin/main` corre en los githooks del clon.

### D7.1 · Decisiones sin Guido

D7.1 corrió sin Guido, con su autorización previa (su prompt, abajo) y la vara del ADR-030, el 2026-11-02 en `Draco-PC` desde las 19:45.
**Las ⚠️ arriba**; todas se deshacen antes del tag. No hay preguntas nuevas arriba de Pendientes. El detalle, en el delta
(`SPEC-paquete-7.md`, "Riesgos y decisiones" y la tabla del red team).

- ⚠️ **D7-1 · Red team sí, una ronda acotada**: `subio-al-kit` cambia lo que acepta `cambios verificar` (el candado de estados del
  pre-commit) y el actualizador pasa a retirar zona propia. Trajo 4 ALTOS del día normal; los 10 integrados. `[mejor código]`
- ⚠️ **D7-2 · Lo que el kit cubre vive en `kit/cubiertos.md`** (`cita`, `version`, `pieza`), escrito por la sesión madre; el cruce es
  por id o por cita, nunca por texto. **Un solo lector** (`scripts/lib/cubiertos.cjs`) para `aplicar`, `flota` y `cambios-flota`; una
  entrada mala se saltea sola y se dice (RF-fix rf-1). `[consistencia · acordarse de menos]`
- ⚠️ **D7-3 · Un freno nunca se retira solo**: ni `3-barrera` ni un archivo que `categoriaDe` cuenta como barrera, aunque el hash
  coincida; va a "te espera". `[mejor código]`
- ⚠️ **D7-7 · El retiro automático, con cinco condiciones** (clase 2 · no es freno · su pieza llegó · la zona era solo del cambio · el
  hash coincide); ante cualquier duda la zona queda y se dice por qué. **E8**: "solo del cambio" acepta la zona con su texto de fábrica,
  y retirar = volver al texto de fábrica del molde nuevo (sin eso no se retiraba nunca: todas las zonas del molde traen texto).
  `[mejor código · acordarse de menos]`
- ⚠️ **D7-4 · `cambios flota` lee la rama por defecto local, sin red**: un módulo sin mergear no se ve; un repo sin `pull` se ve viejo.
  Lo descubierto por carpeta, solo con `.claude/cambios/` (el `/inicio` callado; rf-3). `[workflow]`
- ⚠️ **D7-5 · La migración: todo clase 2, `toca: [metodo]`, sin `cita:`**; solo `aplicado` con un SHA que es ancestro de la rama por
  defecto (rf-5: un SHA colgado daba rojo en la otra PC). `CAMBIOS.md` y su test no se tocan. **El `D-n` de Mobile, fuera** (el prompt
  pedía Hermes; su formato no se exploró). `[mejor código · consistencia]`
- ⚠️ **D7-6 · La portada la arma un script** (`portada.cjs`), no el modelo; el banner **siempre** *(corregido el 2026-11-02 por Guido: "yo siempre quiero tener banner, es parte de tener el repo lindo")*; `candado:portada` solo con
  `piezas.portada` en la ficha, y esa línea la pone el Arquitecto **solo si** la portada quedó armada (con un README propio, apagada;
  rf-6). About y etiquetas por `gh`, fuera (acción hacia afuera). `[acordarse de menos · consistencia]`
- **Con un `-rc`, nada sube** ("subiría al kit"), y la flota no da "al día" un repo con un cambio pendiente de subir (rf-4: sin eso, el
  rc dejaba la regla duplicada para siempre). `[mejor código]`
- **Del revisor frío** (Opus, una vuelta, 7 hallazgos: 1 ALTO, 5 MEDIOS, 1 BAJO, todos del día normal; los arreglos en **un** encargo,
  RF-fix, Opus): la línea "para pegar" salía sin `pieza:` y una entrada mala anulaba el ciclo de toda la flota · `--kit` con la raíz del
  repo · el `/inicio` con ⚠ por repos sin rama · rc → final · SHA colgados · la portada con README propio · la nota de 3.0.0. Nada borraba
  trabajo (lo dijo él).
- *No se cierra* (trampas, sin arreglo): editar `aplico.hash` o escribir `subio-al-kit` a mano; un `cubiertos.md` con una entrada falsa
  (queda en git; la zona solo se retira si está intacta); un README editado que conserva la marca `kit:portada` con el hash recalculado.

### D8.1 · Decisiones sin Guido

D8.1 corrió casi toda sin Guido (estuvo al principio: el `/inicio`, el cambio del piloto y el pedido de las decisiones en criollo), con su
autorización previa (su prompt, abajo) y la vara del ADR-030, el 2026-11-03 en `Guido-PC-eQ` desde las 09:05. **Las ⚠️ arriba**; todas
son texto o scripts del observatorio y se deshacen con un revert. El detalle, en el delta (`SPEC-paquete-8.md`, "Riesgos y decisiones").

- ⚠️ **D8-4 · Los lectores no corrieron**: las filas "Lector (muestra)" de TABLERO §1 (turnos sin novedad, CORREGIR, comandos por apertura,
  duración del `/cierre`, "¿cómo vamos?", pegados) y las del SPEC-0 que piden lector quedan con el número de octubre, marcadas. Un lector
  cuesta ~250 mil tokens y la flota sigue en v2: el "antes" de octubre es el antes. Se miden en la prueba en el proyecto real. `[workflow · acordarse de menos]`
- ⚠️ **D8-6 · Lo público en cifras agregadas**; el detalle por repo, el mapeo alias → repo y los costos por chat, a `vibe-research`
  (`mediciones/2026-11-03/`). `[mejor código · consistencia]`
- ⚠️ **D8-9 · ADR-033: la credencial del Hub no pasa por el kit, sin excepción.** El SPEC-0 pedía un ADR con "la excepción del Equipador";
  D6.1 construyó lo contrario (la credencial va a la capa privada). El ADR escribe lo construido; si querés la excepción, se reabre. `[consistencia · acordarse de menos]`
- ⚠️ **D8-2 · `flota.py` sigue por `gh`** (ve los 10 desde cualquier PC) y la ficha la parsea el parser del kit en node, no uno en Python. `[consistencia · mejor código]`
- **D8-1 · Sin red team**: P8.3 es una columna del observatorio que mide, no un id del candado. `[workflow · mejor código]`
- **D8-3 y D8-7 · Todo sobre clones `blob:none` de GitHub**; el hook de arranque se corre solo en el clon, nunca en tus carpetas de `D:\`. `[mejor código · consistencia]`
- **D8-5 · Cada medida con el script que la mide de verdad**: los specs con sello los cuenta `flota.py` (el SPEC-0 decía `lotes.py`, que no
  mide); `costos.py` no gana `--desde` (el corte es de `condensar.py`). Corregido en el SPEC-0. `[consistencia]`
- **D8-8 · `huella.py` compara contra las dos historias del molde** (v2 y v3). `[consistencia]`
- **D8-10 · Una página de manual por pieza, no por script**, y `SCRIPTS.md` como referencia; el manual v2 del Arquitecto a `legacy/`. `[acordarse de menos · consistencia]`
- **D8-11 y D8-12**: las notas en los diseños sin duplicar (25 notas para 19 filas; 2 ya estaban; C no se toca); ningún Pendiente ni NO
  VERIFICADO se tachó leyendo (todos piden una pestaña, otra PC o la prueba real). `[consistencia · acordarse de menos]`
- **D8.1-a · El mapeo alias → repo lo armó E2 por fecha y descripción**: "Bot personal" = el repo del bot de Perseo, sin otra evidencia
  (en el privado, para que lo mires). El bot con base open source (12.000 commits ajenos) queda fuera de las medianas de la historia entera.
- **D8.1-b · Lo que dio la medición y conviene que sepas** (`observatorio/investigacion/mediciones/2026-11-03.md`): la flota sigue en v2
  (0 de 10 con versión, 2 de 10 con `deny`); **el hook de arranque pasa el tope en 6 de 10** (octubre decía 2, pero medido con `wc -c`;
  ahora se corre de verdad: es otro método, no un empeoramiento probado); el handoff más grande ronda los 600 KB; rutas absolutas en 6 de
  10; lo reciente trae más pruebas con los arreglos (mediana 60%) y menos arreglo del arreglo (15%).
- **Revisor frío** (Opus, una vuelta): 6 hallazgos, 1 ALTO (`flota.py` perdía los `args` del hook del molde v3: la corrida del "después"
  habría dado 0 caracteres en todos, una mejora falsa; la de hoy no se afectaba porque la flota v2 usa el comando en texto). Los 6 en un
  encargo (RF-fix, Sonnet) y el de la ruta de una carpeta tuya en el delta, el director. *No se cierra*: `huella_hook` suma todos los
  `SessionStart` sin mirar el `matcher`; los hooks en sintaxis bash corren en `cmd` y dan `null`; un alias repetido entre dos dueños.
- **D8.1-c · Fuera del paquete, pedido tuyo**: `docs/kit-v3/DECISIONES-SIN-GUIDO-en-criollo.md` (un Opus aparte, no cuenta en los encargos).

## Abrir D5.2 sin Guido (el prompt)

*(Armado en el cierre de D5.1, 2026-10-31.)* ~~En la PC `Usuario`~~ **En la PC `Draco-PC`** (preparada el 2026-11-02: kit, repos de prueba,
gitleaks, gh, VS Code y su extensión; antes de pegar, Guido inicia sesión en Claude dentro de VS Code y reinicia la app), en Opus, chat nuevo en vibe-kit.

> inicio — misión 5, D5.2: el paquete 5, segunda mitad, sin mí, con el presupuesto del ADR-029.
>
> Me voy y te dejo trabajando solo. Te autorizo por adelantado a lo mismo que a D5.1 (su prompt, en el tracker, "Abrir D5.1 sin Guido"):
> después del /inicio no esperás mi OK, decidís con la vara (ADR-030) y anotás en "Decisiones sin Guido" de una sección D5.2 nueva (las ⚠️
> arriba), no tocás el `~/.claude/` real salvo el `kit-sync` del `/cierre`, y lo que necesita una persona va a Pendientes. Lo que cambia:
>
> 1. **Alcance: la segunda mitad del paquete 5**, con el delta que ya está sellado (`docs/kit-v3/SPEC-paquete-5.md`: "Los dos directores", D5.2, y
>    "Los encargos de D5.2", provisorios: los ajustás vos). **Sin delta nuevo ni red team** (el delta es del paquete entero); si un encargo toca algo que
>    el delta no fijó y es permiso o freno, lo decidís con la vara y lo anotás ⚠️. Primero lo de "Paquete 5 · para D5.2" de Pendientes, **arriba de
>    todo las `deny` con `Write(...)`** (Claude Code avisa que no las mira).
> 2. **El presupuesto manda (ADR-029)**: **~4 h de reloj y ~8 encargos**. Si no entra, **la mesa (K3) y el corrector de afirmaciones (K5) pasan a un
>    D5.3** (el delta ya lo prevé; K5 necesita el historial de Hermes, que está en `clientes`). Cerrás limpio: lo hecho en `main`, lo que falta en
>    Pendientes con su porqué. No estires.
> 3. **Contra accidentes, no contra trampas.** El revisor frío: una vuelta, hasta 10 hallazgos con su escenario del día normal, los arreglos en un
>    encargo; sin segunda vuelta. Pruebas proporcionales: casos de sí y de no; mutación solo en las piezas nuevas que deciden un freno o un permiso
>    (`.kit-noche`, `candado:mesa`, el corrector de afirmaciones; tope 20 min); la suite entera una vez, al final, en segundo plano. De a dos Opus como
>    máximo; cada encargo en su worktree en `scratchpad/<x>/wt`.
> 4. **Las sesiones reales** (`claude.exe -p`): el obrero se lanza con la línea de fondo que imprime `encargo.cjs autorizado` (el pedido por stdin con
>    `printf`, el `claude.exe` de la extensión); el armado del módulo de prueba, como en D5.1 (`scratchpad/filas/armar.sh` de esa sesión: rearmalo, el
>    scratchpad no viaja). Los repos de prueba recién armados por `rehacer.sh`.
> 5. Leés cada diff y corrés las pruebas de cada encargo. Aceptado → merge a `main`, gitleaks, commit y push.
> 6. Al terminar: el paquete 5 en ✅ si cerró, los `✅ <fecha>` del SPEC-0, el delta en `✅ IMPLEMENTADO`, la fila D5.2 con **horas, encargos y tokens**,
>    el prompt de la sesión siguiente armado como este, y /cierre completo con el "Próximo paso" y su título. En el resumen final, primero "Decisiones
>    sin Guido" y después lo que me espera a mí.

## Abrir D5.3 sin Guido (el prompt)

*(Armado en el cierre de D5.2, 2026-11-02; corregido ese mismo día a pedido de Guido.)* **En `Draco-PC`** (o en cualquier PC con acceso a GitHub), en
Opus, chat nuevo en vibe-kit. El historial de Hermes **es el de git**: se clona `https://github.com/guidocameraeq/hermes-desktop.git` en el scratchpad
(probado desde `Draco-PC` el 2026-11-02); la verdad de qué prosa prometía de más está en el acta `tips/tanda-2026-11-contraste.md` y en las
revisiones que Hermes guarda en su repo.

> inicio — misión 5, D5.3: el cierre del paquete 5 (el corrector de afirmaciones), sin mí, con el presupuesto del ADR-029.
>
> Me voy y te dejo trabajando solo. Te autorizo por adelantado a lo mismo que a D5.2 (su prompt, en el tracker, "Abrir D5.2 sin Guido"):
> después del /inicio no esperás mi OK, decidís con la vara (ADR-030) y anotás en "Decisiones sin Guido" de una sección D5.3 nueva (las ⚠️
> arriba), no tocás el `~/.claude/` real salvo el `kit-sync` del `/cierre`, y lo que necesita una persona va a Pendientes. Lo que cambia:
>
> 1. **Alcance: "Paquete 5 · para D5.3" de Pendientes**: el corrector de afirmaciones en prosa (P6.10, A §5; el encargo K5 del delta
>    `docs/kit-v3/SPEC-paquete-5.md`), **medido contra el historial de Hermes antes de instalarlo**. Sin delta nuevo ni red team; si toca un permiso o
>    un freno que el delta no fijó, lo decidís con la vara y lo anotás ⚠️. Los menores de esa lista, solo si sobra tiempo.
> 2. **El presupuesto manda (ADR-029)**: es chico: **~2 h de reloj y ~4 encargos** (K5, revisor frío, arreglos, y una medición si hace falta aparte).
>    Si no entra, cerrás limpio: lo hecho en `main`, lo que falta en Pendientes con su porqué. No estires.
> 3. **Contra accidentes, no contra trampas.** Revisor frío: una vuelta, hasta 10 hallazgos con su escenario del día normal, los arreglos en un
>    encargo. Mutación sobre las reglas del corrector (decide un freno), tope 20 min; la suite entera una vez, al final, en segundo plano. Cada
>    encargo en su worktree en `scratchpad/<x>/wt`.
> 4. **La medición**: cuántas afirmaciones falsas de verdad caza y cuántas buenas frena, sobre los commits de Hermes (un clon de
>    `github.com/guidocameraeq/hermes-desktop` en el scratchpad, solo lectura); los números en la fila. Si para separar lo falso de lo legítimo hace
>    falta algo que no está en git ni en el acta de contraste, decilo NO VERIFICADO y seguí.
> 5. Leés cada diff y corrés las pruebas de cada encargo. Aceptado → merge a `main`, gitleaks, commit y push.
> 6. Al terminar: **el paquete 5 en ✅**, el `✅ <fecha>` de la 6.10 en el SPEC-0, el delta en `✅ IMPLEMENTADO` entero, la fila D5.3 con **horas,
>    encargos y tokens**, el prompt de D6.1 armado como este, y /cierre completo con el "Próximo paso" y su título. En el resumen final, primero
>    "Decisiones sin Guido" y después lo que me espera a mí.

## Abrir D6.1 sin Guido (el prompt)

*(Armado en el cierre de D5.3, 2026-11-02.)* En cualquier PC con el kit (`Draco-PC` está lista), en Opus, chat nuevo en vibe-kit.

> inicio — misión 5, D6.1: el paquete 6 (Equipador v3, actualizador, adoptador, `doctor` completo), sin mí, con el presupuesto del ADR-029.
>
> Me voy y te dejo trabajando solo. Te autorizo por adelantado a lo mismo que a D5.3 (su prompt, en el tracker, "Abrir D5.3 sin Guido"):
> después del /inicio no esperás mi OK, decidís con la vara (ADR-030) y anotás en "Decisiones sin Guido" de una sección D6.1 nueva (las ⚠️
> arriba), no tocás el `~/.claude/` real salvo el `kit-sync` del `/cierre`, y lo que necesita una persona va a Pendientes. Lo que cambia:
>
> 1. **Alcance: el paquete 6** del SPEC-0 (orden 6: P2.2-2.4 con el `doctor` completo y P7.1-7.2; "Orden de construcción"), más lo de "Paquete 6 ·
>    de …" de Pendientes (el actualizador pone `core.hooksPath`, le pasa `--molde-viejo` a `barreras`, retira las `Write(...)` viejas y pega el
>    `gitignore.snippet` nuevo; `cargar-secreto` en un worktree; el `allow` ignorado en un clon sin confianza). **Spec delta nuevo**
>    (`docs/kit-v3/SPEC-paquete-6.md`) **y red team de una ronda** (toca permisos: el actualizador escribe `settings` y hooks); lo sellás vos, por el
>    script, provisorio. Si no entra en un director, lo partís en D6.1 y D6.2, como hizo D5.1.
> 2. **El presupuesto manda (ADR-029)**: **~4 h de reloj y ~8 encargos**. Si no entra, cerrás limpio: lo hecho en `main`, lo que falta en
>    Pendientes con su porqué. No estires.
> 3. **Contra accidentes, no contra trampas.** Revisor frío: una vuelta, hasta 10 hallazgos con su escenario del día normal, los arreglos en un
>    encargo. Mutación solo en lo que decide un freno o un permiso (tope 20 min); la suite entera una vez, al final, en segundo plano. De a dos
>    Opus como máximo; cada encargo en su worktree en `scratchpad/<x>/wt`.
> 4. **"Toda la flota"** se corre con los repos de prueba (`bash pruebas/rehacer.sh`: `alfa`, `beta`, `gama`), nunca contra un repo real ni contra
>    el `~/.claude/` real: el actualizador y "preparame esta PC" se prueban con un `HOME` falso.
> 5. Leés cada diff y corrés las pruebas de cada encargo. Aceptado → merge a `main`, gitleaks, commit y push.
> 6. Al terminar: el paquete 6 en ✅ si cerró, los `✅ <fecha>` del SPEC-0, el delta en `✅ IMPLEMENTADO`, la fila D6.1 con **horas, encargos y
>    tokens**, el prompt de la sesión siguiente armado como este, y /cierre completo con el "Próximo paso" y su título. En el resumen final,
>    primero "Decisiones sin Guido" y después lo que me espera a mí.

## Abrir D6.2 sin Guido (el prompt)

*(Armado en el cierre de D6.1, 2026-11-02.)* En cualquier PC con el kit (`Draco-PC` está lista), en Opus, chat nuevo en vibe-kit.

> inicio — misión 5, D6.2: el cierre del paquete 6 (la flota de punta a punta y el adoptador), sin mí, con el presupuesto del ADR-029.
>
> Me voy y te dejo trabajando solo. Te autorizo por adelantado a lo mismo que a D6.1 (su prompt, en el tracker, "Abrir D6.1 sin Guido"):
> después del /inicio no esperás mi OK, decidís con la vara (ADR-030) y anotás en "Decisiones sin Guido" de una sección D6.2 nueva (las ⚠️
> arriba), no tocás el `~/.claude/` real salvo el `kit-sync` del `/cierre`, y lo que necesita una persona va a Pendientes. Lo que cambia:
>
> 1. **Alcance: la mitad D6.2 del delta ya sellado** (`docs/kit-v3/SPEC-paquete-6.md`: "Los dos directores", criterios 15 a 21 y "Los encargos de
>    D6.2", provisorios: los ajustás vos). **Sin delta nuevo ni red team** (el delta es del paquete entero); si un encargo toca un permiso o un freno
>    que el delta no fijó, lo decidís con la vara y lo anotás ⚠️. **Primero lo de "Paquete 6 · para D6.2" de Pendientes** (arriba: la línea 7 de
>    `chequear` y los 2 casos de `candado.test.cjs` que dan rojo fuera del repo, que harían "rota" toda actualización sana). Y la **fusión de
>    piezas adaptadas como la decidí yo (D6-19, opción C)**: con porqué, sola; sin porqué, a "te espera" con el diff y una pregunta mía en ese proyecto.
> 2. **El presupuesto manda (ADR-029)**: **~4 h de reloj y ~8 encargos**. **La fusión `adaptada` no se corta** (D6-19, la
>    opción C que elegí yo: está en el delta); si no entra todo, lo que pasa a un D6.3 es el adoptador. Cerrás limpio: lo hecho en `main`, lo que falta en Pendientes con su porqué.
> 3. **Contra accidentes, no contra trampas.** Revisor frío: una vuelta, hasta 10 hallazgos con su escenario del día normal, los arreglos en un
>    encargo. Mutación solo en lo que decide un freno o un permiso (saltear y mezclar, la regla de `KIT_MOLDE`, lo que trae el adoptador; tope 20
>    min); la suite entera una vez, al final, en segundo plano. De a dos Opus como máximo; cada encargo en su worktree en `scratchpad/<x>/wt`.
> 4. **"Toda la flota"** se corre con los repos de prueba (`bash pruebas/rehacer.sh`: `alfa`, `beta`, `gama`) y un canónico de prueba (un `bare`
>    de este árbol con un tag anotado `v3.0.0-rc.1`), nunca contra un repo real, el `origin` real ni el `~/.claude/` real.
> 5. Leés cada diff y corrés las pruebas de cada encargo. Aceptado → merge a `main`, **gitleaks sin tubería (si sale distinto de 0, no se
>    pushea)**, commit y push.
> 6. Al terminar: el paquete 6 en ✅ si cerró, los `✅ <fecha>` de P7.1 y P7.2 en el SPEC-0, el delta en `✅ IMPLEMENTADO`, D6-1 y D6-6 de vuelta al
>    diseño E §6 con fecha (y un ADR si sobreviven), la fila D6.2 con **horas, encargos y tokens**, el prompt de la sesión siguiente armado como
>    este, y /cierre completo con el "Próximo paso" y su título. En el resumen final, primero "Decisiones sin Guido" y después lo que me espera a mí.

## Abrir D7.1 sin Guido (el prompt)

*(Armado en el cierre de D6.2, 2026-11-02.)* En cualquier PC con el kit (`Draco-PC` está lista) **y acceso al historial de Hermes** (se clona
`https://github.com/guidocameraeq/hermes-desktop.git` en el scratchpad, como en D5.3), en Opus, chat nuevo en vibe-kit.

> inicio — misión 5, D7.1: el paquete 7 (el ciclo de `cambios` y la portada), sin mí, con el presupuesto del ADR-029.
>
> Me voy y te dejo trabajando solo. Te autorizo por adelantado a lo mismo que a D6.2 (su prompt, en el tracker, "Abrir D6.2 sin Guido"):
> después del /inicio no esperás mi OK, decidís con la vara (ADR-030) y anotás en "Decisiones sin Guido" de una sección D7.1 nueva (las ⚠️
> arriba), no tocás el `~/.claude/` real salvo el `kit-sync` del `/cierre`, y lo que necesita una persona va a Pendientes. Lo que cambia:
>
> 1. **Alcance: el paquete 7** del SPEC-0 (orden 7: **P6.8b** el ciclo del registro de cambios: `subió-al-kit`, `cambios flota`, el 3+ por
>    script, `--urgentes` en el `/inicio` de vibe-kit, la migración por script del `CAMBIOS.md` de Hermes; y **P3.8** la portada), más lo de
>    "Paquete 6 · para después" de Pendientes que toque esto. **Spec delta nuevo** (`docs/kit-v3/SPEC-paquete-7.md`); **red team de una ronda
>    solo si toca un freno o un permiso** (lo decidís con la vara y lo anotás); lo sellás vos, por el script, provisorio.
> 2. **El presupuesto manda (ADR-029)**: **~4 h de reloj y ~8 encargos**. Si no entra, cerrás limpio: lo hecho en `main`, lo que falta en
>    Pendientes con su porqué. No estires.
> 3. **Contra accidentes, no contra trampas.** Revisor frío: una vuelta, hasta 10 hallazgos con su escenario del día normal, los arreglos en un
>    encargo. Mutación solo en lo que decide un freno o un permiso (tope 20 min); la suite entera una vez, al final, en segundo plano. De a dos
>    Opus como máximo; cada encargo en su worktree en `scratchpad/<x>/wt`.
> 4. **La migración de Hermes** se prueba sobre un clon de su historial en el scratchpad (solo lectura) y sobre los repos de prueba
>    (`bash pruebas/rehacer.sh`); **nunca** contra el repo real de Hermes ni el `~/.claude/` real. "Toda la flota", con copias de
>    `../vibe-kit-pruebas/remotos/` y un canónico `bare` de prueba (el script de D6.2 está descripto en su fila).
> 5. Leés cada diff y corrés las pruebas de cada encargo. Aceptado → merge a `main`, **gitleaks sin tubería (si sale distinto de 0, no se
>    pushea)**, commit y push.
> 6. Al terminar: el paquete 7 en ✅ si cerró, los `✅ <fecha>` de P6.8b y P3.8 en el SPEC-0, el delta en `✅ IMPLEMENTADO`, la fila D7.1 con
>    **horas, encargos y tokens**, el prompt de la sesión siguiente armado como este, y /cierre completo con el "Próximo paso" y su título.
>    En el resumen final, primero "Decisiones sin Guido" y después lo que me espera a mí.

### D8b.1 · Decisiones sin Guido

D8b.1 corrió sin Guido, con su autorización previa (el prompt de la sesión madre, en nombre de Guido) y la vara del ADR-030, el
2026-11-03 en `Guido-PC-eQ` desde las ~11:50. **Las ⚠️ arriba**. El detalle, en el delta (`SPEC-paquete-8b.md`, "Decisiones (la vara)").
Red team 1 ronda sobre (1), (6) y (14): 3 ALTOS (r1-1 `propia` sin base, r1-2 `resolver` pisaba trabajo, r1-3 `auto` sin medir con los
porteros), 4 MEDIOS, 1 BAJO; todos integrados, r1-3 cerrado midiendo.

- ⚠️ **D8b-1 · El obrero de fondo en `auto`, con la lista; el respaldo en `acceptEdits`, impreso siempre.** Medido (delta, "Medición del
  director"): `auto` anda sin pestaña, se combina con `--allowedTools` y el `ask` de los porteros es un no adentro de `-p`. **No medido**:
  un "no" del propio clasificador adentro del `-p`. `[workflow · consistencia]`
- ⚠️ **D8b-5 · `congelar` y `tomar la nueva` siempre te preguntan**; `resolver` es un script (la zona propia y la ficha no las escribe el
  modelo). `[mejor código · acordarse de menos]`
- ⚠️ **D8b-6 · El módulo sin sello del `/inicio` pasa a propuesta con tu OK** (antes llamaba solo al Arquitecto): sale de tu regla del
  renglón 10. `[workflow · consistencia]`
- ⚠️ **D8b-8 · El Modo A reusa el adoptador (`--nuevo`) y el SPEC-0 vive en `docs/modulos/v1/SPEC.md`**, para que `/inicio`, `/estado` y
  `ready --pendientes` lo vean como a cualquier módulo. `[consistencia · mejor código]`
- **D8b-2 · La fusión sigue en `acceptEdits`** (no es un obrero). **D8b-3 · `-rc` entero en la ficha, `VERSION`, tags, sello y `doctor`**,
  no en `subio-al-kit` ni `cubiertos.md` (un rc nunca sube reglas al kit). **D8b-4 · El porqué es solo el `por:`** (lo decidiste vos):
  cada adaptada pregunta una vez. **D8b-7 · La línea del módulo en los 300 caracteres de hoy.** **D8b-9 · Los githooks en la carpeta
  principal, nunca en el clon**; con un `hooksPath` ajeno (husky) y sin `.githooks/` en el disco, no se tocan.
- ⚠️ **D8b.1-c · El renglón (11), el obrero de cierre de tramo (encargo D), queda para `rc.2`.** A las 15:40 el presupuesto (~4 h) se
  había ido en C, A, B y un arreglo que no estaba en el plan (E, abajo). (11) no hace falta hasta que cierre el primer tramo del módulo de
  Hermes, días después de mañana; la beta sin él no cambia nada de la adopción ni del arranque. Lo que se ve mientras tanto: la ficha de
  `v1` sale en el arranque con "(sin "Próximo paso:")". *Alternativa*: estirar ~1 h más y arriesgar la beta. `[workflow · acordarse de menos]`
- ⚠️ **D8b.1-d · Encargo E, fuera del plan: la línea "llaves" de `chequear` daba ROTA a toda actualización desde D7.1** (`portada.cjs`
  trae sus plantillas con `{{…}}` y la línea miraba también los `.cjs`, que el molde nunca instancia). Lo encontró la prueba temprana de la
  flota (`gama` ROTA); `rehacer.sh` fallaba por lo mismo. Ahora las dos miran solo lo que el molde instancia (`seInstancia`). Además, los
  repos de prueba de esta PC eran del 29-10 (sin el "orden 3"): se rehicieron. `[mejor código]`
- ⚠️ **D8b.1-e · Un proyecto `liviano` nuevo nace con `gate:entorno-prueba` quitado** (en la propuesta de la adopción, con su razón),
  porque sin `comando-test` el sello no deja sellar; la línea `después:` lo marca y **lo aprobás vos** con `cambios`. Uno `estandar`
  lleva `adoptar --mirar --comando-test "<el de Entorno de prueba>"`. El camino `liviano` no se corrió de punta a punta. `[workflow · mejor código]`
- **D8b.1-f · `--principal` vale si el clon salió de esa carpeta o del mismo `origin`** (el delta decía solo "el mismo origin", que en el
  Modo A no se cumple nunca); las URLs se comparan normalizadas (`.git`, barra, mayúsculas). `[consistencia]`
- **D8b.1-g · Revisor frío, 1 vuelta, 8 hallazgos (1 ALTO: un informe de fusión con `{{` dejaba ROTA la rama del `rc.2`), todos en un
  encargo**, más los textos del renglón (1) del `/director` y `NUCLEO.md` que eran de D. Además: `resolver` deja elegir `propia` o
  `congelar` aunque la pieza haya cambiado (solo `mezclar` y `nueva` escriben); `mezclar --a-mano` escribe también lo que no tocaste;
  `actualizar.cjs ultimo-tag` elige el tag bien (el `git tag --sort` pone el rc arriba del final). `[mejor código]`
- **D8b.1-a · `sello.cjs` repite la gramática de la versión** (usa solo node: se copia al molde); `copias.test.cjs` la compara con la de
  `ficha.cjs`, así que no pueden separarse sin que una prueba se ponga roja. `[mejor código]`
- **D8b.1-b · Un tag raro (`v3.0.0-beta.1`) el `doctor` lo ignora** (antes lo leía como 3.0.0); y **un rc nunca cuenta como "pendiente de
  subir al kit"** en la flota (sale de D8b-3). `[consistencia]`

### D8r.1 · Decisiones sin Guido

D8r.1 corrió sin Guido la noche del 2026-11-03 en `Guido-PC-eQ` (~19:40 a ~00:30 del 04), lanzada por la sesión madre con su autorización, la vara
del ADR-030 y el ADR-034. El detalle, en el delta (`SPEC-paquete-8r.md`, "Decisiones (la vara)"). **8 encargos** (red team, A, B, C, D, E,
el revisor frío y su arreglo), todos Opus (E y RF-fix iban en Sonnet: subidos por la coherencia entre piezas, que era el pedido). Red team
1 ronda: 2 ALTOS (la tarea 0 solo en texto y con la ficha equivocada; `cerrar` borraba de origin lo mezclado solo en esta PC), 6 MEDIOS,
2 BAJOS, todos integrados. Revisor frío corriendo el día de Guido de punta a punta: 1 ALTO (la flota a la rc.2 dejaba ROTA a todo repo:
el tope del `/inicio` en `chequear`), 2 MEDIOS, 7 BAJOS, todos arreglados en RF-fix. Suite 2.825/2.825 (2.823 en la corrida entera de ~43 min; las 2 rojas, una de plazo con la PC cargada y una prueba que miraba la primera nota del CHANGELOG, re-corridas en verde); flota: 2.4.2 → rc.1 → rc.2 sale 0, alfa con un módulo mezclado y vivo en GitHub pasa a rc.2, beta con uno sin mezclar sale salteado, repetida al día.

- **D8r-1 · Pregunta 1 (la tarea 0), opción A: respondida por Guido el 03-11 para Hermes** (tiene base de prueba: se declara en
  `entornos:` mañana); la A queda construida para otros proyectos (solo con director, ficha en rc.2 o más, y el freno en `crear`,
  `presentar` y `autorizado`). `[workflow · mejor código · coherencia]`
- **D8r-2 · Pregunta 2 (la mezcla que choca), opción A: confirmada por Guido el 03-11**, con su detalle: nunca sola; en criollo qué
  skill, su `por:`, qué trae la nueva, dónde chocan; una recomendada con criterio y las cuatro salidas. `[workflow · coherencia]`
- ⚠️ **D8r-3 · Un repo con código adoptado trae `director-obrero` y `estado` en `sí`** (si ya tiene los suyos distintos, `propia` y te
  pregunta la sesión). *Qué cambia en tu día*: Hermes trae `/director`, `/obrero` y `/estado` del kit desde la adopción. `[workflow]`
- ⚠️ **D8r-4 · La pestaña nueva arranca sola en su rol**: con `.kit-rol` y la rama de un módulo, el `/inicio` deriva a `/director` u
  `/obrero` sin medir nada; y lo que imprime el script dice el primer mensaje. *Qué cambia en tu día*: pegás `/director` (o "inicio") y
  arranca bien. `[acordarse de menos · coherencia]`
- ⚠️ **D8r-5 · `cerrar` borra la rama del módulo de GitHub** cuando ya está mezclada en GitHub (no si solo está mezclada en esta PC), y la
  flota ignora las ramas ya mezcladas. *Qué cambia en tu día*: GitHub queda sin ramas viejas y la flota no saltea a Hermes. `[acordarse de menos]`
- ⚠️ **D8r-6 · `adoptar --aplicar … --claude-md` suma "El tamaño del pedido" al `CLAUDE.md` de Hermes** (con tu OK, en la pantalla de
  adopción); su director/obrero propio lo cambia la sesión a mano, con tu OK. `[consistencia · mejor código]`
- ⚠️ **D8r-7 · Lo que el `comando-setup` deja sin trackear en un worktree (un `package-lock.json`) va a `info/exclude`**, compartido con
  tu carpeta: ahí tampoco lo vas a ver como "sin trackear". Y `adoptar` infiere `npm ci` con el lock commiteado. `[mejor código]`
- **D8r-8 · `integrados`**: un comando que el `/inicio` corre después del pull (el merge del módulo llega con el pull, después del hook).
  **D8r-9 · El tope del `/inicio` sube a 8.600 B** y sale de una sola constante (`chequeo.cjs topeSkill`), que lee también `skills.test`.
  **D8r-10 · `kit-sync.sh sync` retira de `~/.claude` lo que el kit retiró**, solo si alguna vez fue un archivo del kit (el `git mv` de
  `templates/universales/` a `legacy/`). **D8r-11 · Esta tanda es la `rc.2` y D8c.1 pasa a `rc.3`** (decisión de la sesión madre).
  `[mejor código · coherencia]`

### D8r.2 · Decisiones sin Guido

D8r.2 corrió sin Guido el 2026-11-04 en `Guido-PC-eQ`, lanzada por la sesión madre con la vara del ADR-030 y el ADR-034: la tanda de
taller de R1b (`REVISION-INTEGRAL-rc2.md`, t1-t12). **D1-D4 no se decidieron**: quedó la mecánica para elegirlas mañana en la pantalla
de adopción, cada camino en un paso. El detalle, en el delta (`SPEC-paquete-8r2.md`, "Decisiones (la vara)"). **8 encargos** (red team,
F, G, L, A1, A2, el merge de A2 con A1, el chequeo frío), todos Opus. Red team 1 ronda: 5 ALTOS, 4 MEDIOS, 1 BAJO, todos integrados
(el más gordo: el OK de D1 pasó a ser una opción explícita, `--director kit`). Chequeo frío sobre un clon de Hermes con remoto falso: el
día de punta a punta anduvo (`--mirar` → `--aplicar --director kit --permisos recomendada --arranque kit` → commits → push → `--traer` →
sello → `worktree crear` con el `.venv` → el gate en Git Bash); 2 MEDIOS y 2 BAJOS, tres arreglados (CF-1, CF-2, CF-4) y uno a Pendientes
(CF-3). Suite 2.867/2.867 (2.865 en la corrida entera de ~50 min; las 2 rojas, una de plazo con la PC cargada y la del automode del doctor que armaba un proyecto sin .git, re-corridas en verde); flota 2.4.2 → rc.2 → rc.3 sale 0 (alfa, con un módulo mezclado y vivo en el remoto, pasa a rc.3; beta, con uno sin mezclar, sale salteado; repetida, al día).

- **D8r2-1 · El pull de la adopción es un paso propio, `adoptar <clon> --traer <carpeta>`**, después del push (en `--aplicar` todavía no
  hay commits); y los githooks se prenden ahí, después del pull. `[workflow · coherencia]`
- ⚠️ **D8r2-2 · D1-D3 se eligen con tres opciones de `--aplicar`** (`--director kit`, `--permisos recomendada`, `--arranque kit`) y D4 en
  la propuesta (`datos-reales:` con la lista de comandos: la ficha no lee `sí`). *Qué cambia en tu día*: en la pantalla de adopción ves
  D1-D4 con la recomendada primero y lo que elegís va en un solo comando. Sin opciones, todo como hoy. `[workflow · acordarse de menos]`
- ⚠️ **D8r2-3 · Los comandos de la ficha y del gate corren en Git Bash en Windows** (gate, setup, `chequear`, `sello`); `cmd /c` ahí, o
  `cmd //c` sin Git Bash, sale `no-corrio`. *Qué cambia en tu día*: un gate que no corrió nunca sale verde; un `comando-test` escrito
  para `cmd.exe` sale rojo (se ve en la flota). `[mejor código · coherencia]`
- ⚠️ **D8r2-4 · En Python, cada worktree crea su `.venv`** (`py -3 -m venv .venv && .venv/Scripts/python.exe -m pip install …`). *Qué
  cambia en tu día*: `worktree crear` tarda lo que tarda el `pip install`; en tu carpeta, `--traer` te dice el setup a correr una vez.
  `[mejor código]`
- ⚠️ **D8r2-5 · Con D2 recomendada, el commit de los permisos da rojo en barreras** (saca reglas propias): lo aprobás con `cambios nuevo`
  + `cambios aprobar`, o se revierte con un commit nuevo. *Qué cambia en tu día*: una aprobación más en la adopción, si elegís D2 o D3.
  `[coherencia]`
- **D8r2-6 · La flota de la PC: dos niveles, una fila por repo** (agrupado por `git-common-dir`; nunca un worktree). **D8r2-7 · `quedarse`**
  (con `propia` de alias). **D8r2-8 · Esta tanda es la `rc.3` y D8c.1 pasa a la `rc.4`.** `[workflow · consistencia]`

### D8r.3 · Decisiones sin Guido

D8r.3 corrió sin Guido el 2026-11-04 en `Guido-PC-eQ`, lanzada por la sesión madre de la recta final con la vara del ADR-030 y el
ADR-034: la `rc.4` exprés, para adoptar ya el bot de Arti (`Arti-bot-eq`) y destrabar el primer `/cierre` de Hermes. El detalle, en el
delta (`SPEC-paquete-8r3.md`, "Decisiones (la vara)" y "Lo que trajo el red team"). **6 encargos** (red team, H, S, A, P, el chequeo
frío), todos Opus; la base (`carpeta-docs:` en la ficha y `docs-ruta.cjs`) y los textos, el director. Red team 1 ronda: 2 ALTOS (la
excepción de los `.pyc` era un agujero: los hooks de Hermes **leen** ese caché; sin remoto, cambiar la carpeta sacaba su propio commit del
rango), 5 MEDIOS, 3 BAJOS, todos integrados. Mutación: H 42/42, S 19/19, A 14/14, P 13/13. Suite entera, sola: 2957/2961.
Hubo 3 rojas de carga (kit-githook rf3-1, noche "despertador en loop", cambios-flota crit. 5), que dieron verdes corridas solas. Hubo 1
real: la prueba "1 llaves" de `chequeo` engordaba el `/inicio` a 8.622 B, sobre su tope de 8.600; ahora engorda `estado`.

El chequeo frío anduvo en los dos lados (el bot con `arti-docs` de punta a punta; Hermes borra sus `.pyc`). Trajo dos arreglos: el tope de
las skills sin el `\r` de `autocrlf` y la línea `traer`. También trajo el ALTO de las skills de Hermes sobre el tope, que pasó a la madre.

**La flota de prueba encontró un bug real antes del tag**: la línea 7 (casos) copiaba los hooks del proyecto con el `\r` del checkout. Las
fichas de fábrica de todo proyecto en Windows daban ROTA desde la `rc.3`, y al analytics real le pasaba (`i/lf w/crlf`). Arreglo en
`fe226a6`: copia como guarda git. Pruebas: `chequeo.test` 35/35, mutación 2/2.

La flota final (alfa, beta y gama; 2.4.2 → rc.3 → el dueño resuelve con `nueva` → rc.4 → otra vuelta) dio `mezclado` en los tres y después
`al día` en los tres, con salida 0 en cada vuelta.

Residual para la `rc.6` (D8r.4, h12; era para la `rc.5`): un repo con `hooks-lib` esperando queda ROTA en la línea 7 con hooks que piden la lib nueva, y el mensaje no dice
"resolvé hooks-lib primero". Lo arregla que los hooks esperen junto con la lib. Hermes y el analytics tienen `hooks-lib: molde`, así que no
les pega.

- **D8r3-1 · `carpeta-docs:` en la ficha, para todo el árbol del método** (no solo el handoff), en minúsculas y sin nombres reservados
  de Windows. Se lee de la **ficha vigente**, como todo lo que leen los hooks, y **cambiarla es barrera** (`frenos:carpeta-docs`).
  *Qué cambia en tu día*: en el bot, el método vive en `arti-docs/` y `docs/` sigue siendo de OpenClaw; si algún día movés la carpeta,
  te pide un aprobado. `[coherencia · mejor código]`
- ⚠️ **D8r3-2 · `barreras` borra el caché de Python ignorado** (`*.pyc` en `__pycache__/`) de `.claude/hooks`, `.claude/scripts` y
  `.githooks`, y lo dice en una línea; no hay excepción (el red team mostró que los hooks de Hermes leen ese caché: un `.pyc` fabricado
  vaciaba el freno de git con `barreras` verde). `PYTHONDONTWRITEBYTECODE` no hace falta. *Qué cambia en tu día*: el `/cierre` de Hermes
  sale verde y dice "borré 3 cachés de Python ignorados (se rehacen solos)". `[mejor código · coherencia]`
- ⚠️ **D8r3-3 · `--arranque kit` reemplaza un `session-start.cjs` propio con el nombre del del kit**, como `--director kit`; `--mirar`
  muestra lo que hacía y el puntero a `session-start.propio.sh` (el del kit lo corre al final). *Qué cambia en tu día*: en el bot, con la
  recomendada de D3, el arranque es el del kit y el `/inicio` encuentra su huella; lo tuyo queda en la historia. `[workflow]`
- ⚠️ **D8r3-4 · `--aplicar` se niega con un `docs/` ajeno y sin `carpeta-docs:`** (un `docs.json`, `mkdocs.yml`, `CNAME` o archivos que no
  son del método): adoptar así metía el handoff en el sitio de OpenClaw. *Qué cambia en tu día*: en la pantalla de adopción se elige la
  carpeta antes del OK. `[mejor código]`
- **D8r3-5 · La línea `después:` dice la verdad**: el sello va antes del commit; con remoto, el rojo es solo en el clon antes del push
  (después ningún `/cierre` lo mira); sin remoto, lo ve tu primer `/cierre`. Corrige lo que prometía D8r2-5 ("lo aprobás después"). Y si
  en el clon quedó `core.hooksPath` prendido, da `git config --unset core.hooksPath` (el clon de la adopción va sin githooks).
  `[coherencia]`
- **D8r3-6 · `resolver <carpeta> <pieza> nueva --kit <clon> --por …` sobre una `propia`, sin informe** (el pendiente 1 de "De D8r.2"):
  necesita `--kit` porque `~/.claude` no trae el molde. Con una pieza de frenos imprime el `cambios nuevo` exacto y el orden (aprobado,
  después el commit; probado de verdad). Una pieza de varios archivos queda `molde` sin hash (la gramática da hash a las de un archivo).
  `[workflow · acordarse de menos]`
- **D8r3-7 · Los textos no se reescriben ruta por ruta** (una línea en el arranque, el `/inicio`, el `/cierre` y `NUCLEO.md`); `portada
  armar` lee la carpeta de la ficha del disco (antes del push no hay vigente). **D8r3-8 · Esta tanda es la `rc.4`; D8c.1 pasa a la `rc.5`**
  (decisión de la sesión madre). `[acordarse de menos · workflow]`

### D8r.4 · Decisiones sin Guido

Las once del spec (`SPEC-paquete-8r4.md`, "Decisiones"); acá las que cambian lo que Guido ve, más las que salieron en el camino:
- ⚠️ **D8r4-3 · El deny del `.env` del principal va al `settings.local.json` del principal**, no al `settings.json` del molde como
  decía el pedido: una regla relativa no cubre un `.env` en una carpeta padre del worktree, y la del molde trababa `.env.example`.
  *Qué cambia en tu día*: con una ventana, el `.env` de `main` sigue cerrado para el obrero. `[mejor código · coherencia]`
- **D8r4-5 · La flota con obra (`--con-obra`) prueba el merge a cada módulo en su clon y no sube nada a una `modulo/*`**: a la rama la
  trae el director con `worktree.cjs traer-main`, que aborta ante un choque o un rojo y te deja el `cambios nuevo` exacto. *Qué cambia en
  tu día*: tu director no se encuentra la rama movida. `[workflow · coherencia]`
- **D8r4-12 · El merge de `main` solo juzga lo que agrega** (el crit. 2 corregido): lo del módulo lo juzga el push del módulo. Un hook,
  githook o gitleaks igual al del otro padre no cambia nada (u9). `[mejor código]`
- **D8r4-13 · El `ask git merge` no entra al set del kit** (u13 b): el freno de un merge ya es el candado del pre-commit. `[filtro pragmático]`
- **D8r4-14 · Esta tanda es la `rc.5` con la vuelta 1** (u1-u3, u9, u11, u12); la vuelta 2 (u4-u8, u13, u10 con h5-h11) y h12 (los
  hooks que esperen junto con `hooks-lib`) van a la **`rc.6`** con D8c.1 (la sesión madre, 2026-11-04). `[workflow]`

## Abrir D8.1 sin Guido (el prompt)

*(Armado en el cierre de D7.1, 2026-11-02.)* En cualquier PC con el kit (`Draco-PC` está lista) y acceso a `vibe-research` (los chats y el
corpus del observatorio), en Opus, chat nuevo en vibe-kit.

> inicio — misión 5, D8.1: el paquete 8 (el observatorio mide la línea base; playbook, guía y manuales al día), sin mí, con el presupuesto
> del ADR-029.
>
> Me voy y te dejo trabajando solo. Te autorizo por adelantado a lo mismo que a D7.1 (su prompt, en el tracker, "Abrir D7.1 sin Guido"):
> después del /inicio no esperás mi OK, decidís con la vara (ADR-030) y anotás en "Decisiones sin Guido" de una sección D8.1 nueva (las ⚠️
> arriba), no tocás el `~/.claude/` real salvo el `kit-sync` del `/cierre`, y lo que necesita una persona va a Pendientes. Lo que cambia:
>
> 1. **Alcance: el paquete 8** del SPEC-0 (orden 8: **P8 y P9**: el observatorio mide la línea base de nuevo, con los scripts, contra
>    TABLERO §1; PLAYBOOK, guía, manuales y las notas en los diseños, para que la documentación diga lo que el kit v3 hace). **Spec delta
>    nuevo** (`docs/kit-v3/SPEC-paquete-8.md`); **sin red team** salvo que toque un freno o un permiso (lo decidís con la vara y lo anotás);
>    lo sellás vos, por el script, provisorio. Lo de "Pendientes" que sea de documentación (los NO VERIFICADO que el paquete 8 pueda tachar
>    leyendo, no probando) entra si cabe.
> 2. **El presupuesto manda (ADR-029)**: **~4 h de reloj y ~8 encargos**. Si no entra, cerrás limpio: lo hecho en `main`, lo que falta en
>    Pendientes con su porqué. No estires.
> 3. **El observatorio jamás toca el sistema** (CLAUDE.md, restricción 4): mide y propone; la sesión madre aplica. **Anti-espejo**: la guía
>    apunta a los manuales, no repite procedimientos; el playbook se toca solo con evidencia (cada cambio cita su cicatriz).
> 4. **Contra accidentes, no contra trampas.** Revisor frío: una vuelta, hasta 10 hallazgos con su escenario del día normal (acá: un lector
>    que sigue la guía y se equivoca), los arreglos en un encargo. La suite entera una vez, al final, en segundo plano, si se tocó código.
>    De a dos Opus como máximo; cada encargo en su worktree en `scratchpad/<x>/wt`.
> 5. Leés cada diff y corrés las pruebas de cada encargo. Aceptado → merge a `main`, **gitleaks sin tubería (si sale distinto de 0, no se
>    pushea)**, commit y push.
> 6. Al terminar: el paquete 8 en ✅ si cerró, los `✅ <fecha>` de P8 y P9 en el SPEC-0, el delta en `✅ IMPLEMENTADO`, la fila D8.1 con
>    **horas, encargos y tokens**, el prompt de la sesión siguiente armado como este, y /cierre completo con el "Próximo paso" y su título.
>    En el resumen final, primero "Decisiones sin Guido" y después lo que me espera a mí.

## Después de D8.1: una sesión CON Guido (el prompt)

*(Armado en el cierre de D8.1, 2026-11-03.)* No hay un director sin Guido que siga: por el cambio del 2026-11-03 ("Cambios al plan"),
lo que viene lo decide él. Chat nuevo en vibe-kit, en Opus, con Guido presente (cualquier PC con el kit):

> inicio — misión 5, después de D8.1: repaso y decisión de la prueba real, conmigo.
>
> 1. **Las decisiones sin mí**: abrí `docs/kit-v3/DECISIONES-SIN-GUIDO-en-criollo.md` y repasemos las "5 para mirar primero" y las 4
>    preguntas abiertas (la del "porqué" de una pieza adaptada, la firma en bypass, el 3.0.0 después de un `-rc`, el banner sin enlazar), más
>    las ⚠️ de D8.1. Lo que corrija va a "Cambios al plan" o a un delta chico; lo que apruebe se marca en la página.
> 2. **La prueba real**: qué proyecto (recomendado Hermes Desktop, con un módulo nuevo), si el tag (`v3.0.0-rc.N` o el `v3.0`) va antes
>    o después del primer módulo, y cómo queda el 8½ (las llaves de ese proyecto). Con eso, reescribí el orden 9 del SPEC-0, las filas
>    D9.x del tracker y el prompt de la sesión siguiente.
> 3. Nada de código en esta sesión; `/cierre` al terminar.

## Mañana con Guido: preparar la PC y adoptar Hermes (8½)

*(Armado en D8b.1, 2026-11-03.)* La mañana del 2026-11-04, con Guido, en Opus. **La red** ("Cambios al plan", 2026-11-03): si algo de
esto muestra algo raro, Guido arranca el módulo igual, como hoy, y Hermes se adopta al cierre del primer tramo; la beta nunca frena su
trabajo. Cada paso, con quién lo hace:

| # | Paso | La sesión | Guido |
|---|---|---|---|
| 0 | **Las cuatro de diseño de R1b (D1-D4, `REVISION-INTEGRAL-rc2.md`)**: D1 el director, `/inicio` y `/cierre` de Hermes o los del kit (recomendada A: `--director kit`); D2 los permisos (recomendada: `--permisos recomendada`); D3 el arranque (recomendada: `--arranque kit`); D4 `sensible:` (recomendada: `datos-reales:` con los comandos de la base real). Las ve también en la pantalla del paso 3. Después, las ⚠️ de D8r.1 y D8r.2 | las cuenta en criollo, la recomendada primero | elige cada una |
| 1 | **"preparame esta PC"** con la beta (la última rc), en cada PC (`Guido-PC-eQ` y la otra) | corre el Equipador, muestra el plan (`--plan`) y lo que cambia en `settings.json` | dice sí a la pregunta; en la segunda PC, la abre él |
| 2 | **El corrector viejo**: cruzar los cinco regex de `~/.claude/hooks/block_secrets.ps1` (está en `Guido-PC-eQ`) con los de `secretos.cjs` (pendiente (e) de D3.2) | lee los dos y dice qué frena el viejo que el nuevo no; si falta alguno, delta chico como G5b | decide si se saca el viejo (`--sacar-viejo`) |
| 3 | **`adoptar --mirar`** sobre Hermes Desktop (en un clon, como dice `anexos/flota.md`) | muestra la propuesta: bases, piezas adaptadas, qué herramienta de hooks usa | la lee |
| 4 | **`entornos:`** en la propuesta: cada base de Hermes con su clase (**Hermes tiene base de prueba**, Guido 2026-11-03: se declara con `clase: prueba` y el sello anda sin tarea 0; la tarea 0 queda para otros proyectos) | la escribe con lo que diga Guido | dice cuáles son y de qué clase (la de producción, la de prueba) |
| 5 | **`cargar-secreto`**: la credencial de escritura al almacén, por base, con el nombre de `vars.proyecto` de la propuesta (el de su carpeta: `--mirar --principal`) | le da el comando | **la tipea él** (la sesión nunca la ve) |
| 6 | **`adoptar --aplicar … --principal <la carpeta de Hermes>`** con lo elegido en D1-D3, y al final **`adoptar <clon> --traer <la carpeta de Hermes>`** | lo corre con el OK; los commits, barreras, el push, y el `--traer` (el pull y los githooks) | da el OK; aprueba lo rojo (D2/D3, D4) |
| 7 | **El módulo nuevo** con `/arquitecto` en Hermes (Modo B) | la entrevista corta, el delta sellado, el módulo con director | cuenta qué quiere |

Lo que se mira y se anota en "Pendientes" para D9.1: cuánto tardó cada paso, qué preguntó de más, y todo lo que haya que arreglar (sale
como `rc.2` y le llega a Hermes por la flota).

## Después de la rc.1: las sesiones que siguen, en orden (asentado el 2026-11-03 con Guido)

Cada una en un chat nuevo de vibe-kit, en Opus salvo que diga otra cosa. Todas con la vara del ADR-030 **y el ADR-034** (la coherencia
entre piezas, lo técnico lo decide la sesión, la revisión integral como paso fijo), el presupuesto del ADR-029 y las reglas del repo
(gitleaks sin tubería antes de cada push; en `Guido-PC-eQ`, el push por `gh`: ver el handoff). Guido aparece solo en la 2 y la 3.

| # | Sesión | Con Guido | Cuándo | Qué sale |
|---|---|---|---|---|
| 1 | **R1 · Revisión integral del kit v3** (`vibe-kit M5 · R1 · Revisión integral de la rc.1`) | no | la noche del 2026-11-03, después del cierre de D8b.1 | `docs/kit-v3/REVISION-INTEGRAL-rc1.md`: hallazgos con escenario, separados "te afecta" / "de taller", y cuáles traban la adopción de mañana |
| 2 | **Mañana: preparar la PC y adoptar Hermes** (`vibe-kit M5 · Mañana: preparar la PC y adoptar Hermes`; el prompt lo dejó D8b.1, sección "Mañana con Guido") | **sí** | 2026-11-04 a la mañana, antes del proyecto nuevo | primero el informe de R1 (si algo grave toca la adopción, Hermes arranca igual como hoy y se adopta después); después "preparame esta PC", las llaves (8½), `adoptar` con su OK, y el proyecto nuevo con `/arquitecto` |
| 2b | **La tanda de correcciones de R1** (en la misma sesión 2, antes de adoptar, y en la 4): R1 deja cada hallazgo clasificado. **Los de taller los decide la sesión** (ADR-034) y van directo al arreglo; **los de negocio** (los que le cambian algo a Guido) se ven con él en la sesión 2, uno por uno, con la recomendada. Lo que **traba la adopción** se arregla antes de adoptar (un encargo corto en la 2, o Hermes arranca igual como hoy y se adopta después); el resto entra en la 4 (la rc.2) como un paquete de correcciones | en parte | 2026-11-04 | la lista de correcciones decidida, cada una con su destino |
| 2b ✅ | **D8r.1 · La tanda de correcciones de R1 = la `rc.2`** (`vibe-kit M5 · D8r.1 · Las correcciones de R1`; la lanzó la sesión madre la noche del 03-11, "Cambios al plan") | no (dos respuestas suyas por la sesión madre) | ✅ 2026-11-03 | `SPEC-paquete-8r.md`: todo lo de R1 arreglado (T1-T4, los 8, lo de taller, las 2 preguntas con su A) y los 10 del revisor frío; la beta `v3.0.0-rc.2` taggeada. Sigue **R1b**: la sesión madre vuelve a correr la revisión integral |
| 2c ✅ | **R1b · La segunda revisión integral, sobre la `rc.2`** (la sesión madre, la noche del 03-11) | no | ✅ 2026-11-04 | `REVISION-INTEGRAL-rc2.md`: el día corrido sobre un clon de Hermes; 4 de diseño para Guido (D1-D4) y 12 de taller (t1-t12) |
| 2d ✅ | **D8r.2 · La tanda de taller de R1b = la `rc.3`** (`vibe-kit M5 · D8r.2`; la lanzó la sesión madre) | no | ✅ 2026-11-04 | `SPEC-paquete-8r2.md`: t1-t12 y la mecánica de D1-D4; la beta `v3.0.0-rc.3` taggeada. Sigue **la mañana con Guido**, que abre con D1-D4 |
| 3 | **Diseño: los experimentos de método** (`vibe-kit M5 · Diseño: probar una idea nueva (experimentos)`) | **sí** | cuando Guido pueda, 2026-11-04 o 05 | el Arquitecto (Modo B sobre vibe-kit) charla con Guido y deja el spec sellado de la pieza nueva |
| 2e ✅ | **D8r.3 · La `rc.4` exprés: el bot de Arti y los `.pyc`** (`vibe-kit M5 · D8r.3`; la lanzó la sesión madre de la recta final) | no | ✅ 2026-11-04 | `SPEC-paquete-8r3.md`: `carpeta-docs:` en la ficha, el arranque con el mismo nombre, `barreras` borra el caché de Python, la línea `después:` que dice la verdad y `resolver … nueva` sin informe; la beta `v3.0.0-rc.4` taggeada. La flota a los repos de Guido y la adopción del bot, las propone la sesión madre |
| 2f ✅ | **D8r.4 · La `rc.5`: las correcciones del uso real** (`vibe-kit M5 · D8r.4`; la lanzó la sesión madre de la recta final) | no | ✅ 2026-11-04 | `SPEC-paquete-8r4.md` (READY, con red team): una sola ventana (`worktree.cjs donde`, `/obrero` y `/director` entran con EnterWorktree), la flota con obra (`--con-obra`, `worktree.cjs traer-main`), el merge de `main` en una rama vieja (u9), y lo de Pendientes que dolió en Hermes y el analytics; la beta `v3.0.0-rc.5`. Desde el tag `v3.0.0-rc.4` |
| 2g ✅ | **D8c.1 · La `rc.6`: el obrero de cierre de tramo y la vuelta 2 del uso real** (`vibe-kit M5 · D8c.1`; la lanzó la madre; una sola `rc` en nivel medio-alto, `CICLO-DE-MEJORA.md` §3.6) | no | ✅ 2026-11-05 | `SPEC-paquete-8c.md` (READY, dos red teams: h11/h12 y p1). Trae: el obrero de cierre de tramo (`plantilla-cierre.md`, la ficha con `Próximo paso:`/`Tramo:`, el arranque y `/estado`); h11, a `main` sube solo el director (el pre-push con la lista por rol, también para borrados, y `git-seguro` que avisa antes); h12, el aviso de `hooks-lib`; p1, el lock atrasado (`--mirar` y el doctor lo leen, la línea 8 avisa sin trabar); u4-u8, u13a, h5, h9 y h10 (vecinos, avisos de la adopción, el CHANGELOG con `[Unreleased]`, gitleaks de la historia, `andamiaje:` y `plazo-test`, el filtro del almacén en `.worktreeinclude`, `claude.cmd` en Windows); r1/r2 (`/director <x>` y el Modo A con director). Chequeo frío: 1 ALTO y 3 MEDIOS, arreglados. Suite 3068/3070 (1 roja de carga, sola verde; 1 salteada). Flota contra un clon de Hermes rc.5 → rc.6 `--con-obra`: mezclado y al día. Tag `v3.0.0-rc.6` sobre `3d206d6`. Los experimentos salieron de la v3.0 ("Cambios al plan") |
| 5 | **D9.x · Acompañar la prueba real** | a ratos | las dos noches de Deptos (2026-11-09 y la del módulo `cola`) y el uso de Hermes (cambiado el 2026-11-10: "Cambios al plan") | cada arreglo del uso como `rc.N`; la próxima, la `rc.7` de taller |
| 6 | **M6b · El ciclo, segunda parte** | sí, corta | cuando termine la segunda noche de Deptos (antes: el primer módulo de Hermes) | §3.5 y §8 del ciclo con lo vivido; la fecha de la próxima vuelta |
| 7 | **R2 · Revisión integral final + D10.1 · `v3.0`** | no / OK de Guido para publicar | después de la 6 | la tercera revisión integral (ADR-034; R1 y R1b fueron las dos primeras), **con lo que hayan mostrado Deptos y Hermes, contra un clon de Deptos** (antes: de Hermes), la medición contra `mediciones/2026-11-03.md`, el tag `v3.0` idéntico al último rc |

### Abrir R1 sin Guido (el prompt)

> inicio — misión 5, **R1: la revisión integral de la rc.1**, sin mí. Solo lectura: no cambiás código ni docs del kit; el único archivo
> que escribís es el informe. Autorizado lo mismo que a D8.1 (su prompt), con la vara del ADR-030 y el ADR-034.
>
> 1. **Qué se revisa**: el kit entero en `main` (el tag `v3.0.0-rc.1`): `kit/` (molde, skills, scripts, hooks), la guía, los manuales, el
>    PLAYBOOK, el SPEC-0 y los deltas de los paquetes 1 a 8b, y lo decidido con Guido (`docs/kit-v3/DECISIONES-SIN-GUIDO-en-criollo.md`,
>    "El repaso con Guido").
> 2. **Tres revisores Opus en paralelo, sin contexto previo, cada uno con una mirada**: (a) **el día de Guido de punta a punta** en un
>    proyecto real que se adopta (preparar la PC → adoptar → `/inicio` → pedir algo chico y algo más que chico → el Arquitecto → director y
>    obreros → "me voy" → `/estado` a la mañana → cierre de tramo → poner al día la flota con un `rc.2`), buscando dónde se corta, dónde una
>    pieza espera algo que otra no da, dónde le pregunta de más; (b) **la coherencia**: las decisiones (las 150 y el repaso) contra el
>    código, y entre paquetes (dos piezas que dicen distinto sobre lo mismo); (c) **la documentación contra el código** (guía, manuales,
>    playbook). Cada uno hasta 10 hallazgos, cada uno con su escenario del día normal; lo rebuscado, a "lo que no cierra".
> 3. **El informe** `docs/kit-v3/REVISION-INTEGRAL-rc1.md` (y su fila en `docs/README.md`): arriba, en criollo, **qué traba la adopción de
>    Hermes de mañana** (si algo), después "te afecta" y "de taller", cada hallazgo con su arreglo propuesto y a qué sesión va (la rc.2 o
>    Pendientes). Lo de taller lo decidís vos (ADR-034); lo que le afecta a Guido queda como pregunta con la recomendada.
> 4. Presupuesto: ~2 h y 4 encargos (3 revisores + la síntesis). `/cierre` completo; el "Próximo paso" del handoff = la sesión 2 de la tabla.

### Abrir el diseño de los experimentos (el prompt, con Guido)

> inicio — misión 5: diseñar con Guido **"probar una idea nueva de método"** (los experimentos), para la rc.2. Es más que chico: llamá al
> Arquitecto (Modo B sobre vibe-kit). Lo que ya se habló (2026-11-03, memoria `experimentos-de-metodo`): la entrada "quiero probar X" arma
> un experimento liviano en el proyecto (la idea y el dolor que cura, cómo se mide, hasta cuándo, una bitácora que llevan las sesiones
> solas); al vencer, el veredicto con evidencia (oficializar en vibe-kit · descartar con su razón · seguir); y el ciclo
> (`docs/CICLO-DE-MEJORA.md`) los lee como primera fuente. El antecedente real: director/obrero en Hermes (bitácora y `CAMBIOS.md`). Que
> reuse el registro de cambios (`.claude/cambios/`) antes de inventar otro archivo, y que lo técnico lo decida la sesión (ADR-034). Sale el
> spec sellado para la D8c.1. Sin código.

### Abrir D8c.1 sin Guido (el prompt)

> inicio — misión 5, **D8c.1: la rc.5**, sin mí, con el presupuesto del ADR-029 y lo mismo que autoricé a D8b.1 (su prompt), con la vara
> del ADR-030 y el ADR-034. Alcance: (1) el obrero de cierre de tramo (renglón 11 del repaso, que D8b.1 dejó con su porqué); (2) los
> experimentos de método (el spec que salió del diseño con Guido); y lo de "De D8r.1, para la rc.5" y "De D8r.2" en Pendientes. Delta `docs/kit-v3/SPEC-paquete-8c.md`, red team si toca un freno, revisor frío que recorra el día de Guido, la suite
> entera, la prueba de la flota con un canónico `bare`, y si todo da verde: `kit/VERSION` `3.0.0-rc.5`, su nota, tag anotado, push, y
> "poné al día la flota" sobre Hermes (en `auto`; si el clasificador frena el push, la línea la corre Guido). `/cierre` completo.

### Abrir la sesión de la prueba hasta la v3.0 (el prompt, con Guido a ratos)

> Pedida por Guido el 2026-11-04: **una sesión que lo acompaña de la prueba a la versión final** y orquesta el resto (las filas 2 a 7 de
> la tabla de arriba). Se pega en un chat nuevo de vibe-kit, en Opus, después de "preparame esta PC".

> inicio — misión 5, **la recta final: de la prueba en Hermes a la `v3.0`**. Sos la sesión que me acompaña y orquesta, con la vara del
> ADR-030 y el ADR-034 (lo técnico lo decidís vos; lo de diseño, conmigo, la recomendada primero y en criollo) y las reglas de la
> revisión integral del ciclo (`docs/CICLO-DE-MEJORA.md` §3.4). El orden es la tabla "Después de la rc.1" del tracker:
> 1. **La mañana conmigo**: D1-D4 de `REVISION-INTEGRAL-rc2.md`, las ⚠️ de D8r.1 y D8r.2, adoptar Hermes y arrancar su módulo nuevo
>    con `/arquitecto` (tracker, "Mañana con Guido"; mi guía en PDF está en el Escritorio).
> 2. **El diseño de "probar una idea nueva"** conmigo (prompt en el tracker), cuando yo pueda.
> 3. **La `rc.4`** (D8c.1) y **cada arreglo que salga del uso** como `rc.N`: no los codeás vos; los lanzás como sesiones o subagentes
>    con su prompt (spec delta, red team si toca un freno, chequeo frío, suite, flota), revisás lo que vuelve y me contás en criollo.
> 4. **Mientras uso Hermes**: anotás lo que yo cuente y lo que se rompa (Pendientes del tracker); nada me frena el trabajo.
> 5. **Al cerrar el primer módulo**: mis impresiones + los números (la corrida mensual contra `mediciones/2026-11-03.md` y lo de leer
>    los chats) → **la 6b** (§3.5 y §8 del ciclo) → **R2**, la revisión integral final contra un clon de Hermes, con **una** tanda de
>    corrección → **la `v3.0`** (tag idéntico al último rc; publicar con mi OK) → el repo cerrado (README, guía, TODO, ADR si hace falta).
> 6. **Al final**: los chats de vibe-kit al privado (`vibe-research`, `chats/<pc>/`, con `condensar.py`) y el diario; `/cierre` completo.
>
> Cuidá tu contexto: lo pesado va a subagentes o sesiones; si se llena, `/cierre` parcial y el handoff dice desde dónde seguir.
> Arrancá por el punto 1.

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

**Lo abierto, de un vistazo (2026-11-05)** (el detalle, en cada ítem de abajo):
- **Para la `rc.7` (taller)**:
  - todo clon del Equipador con `core.longpaths`; `--mirar` se niega si el checkout quedó a medias → "De la prueba real", 10
  - `adoptar --traer` deja pasar los `??` que no chocan → "De la prueba real", 11
  - `/director` y `/cierre` al borde del tope de 8.000: recortar o anexo → "De D8c.1", 3
  - `resolver director-obrero nueva` con `scripts: no` no avisa lo que falta → "De D8c.1", 4
  - BAJOS: el commit de `resolver` dice "inicio:"; "candado apagado" en el rango de la adopción → "De D8c.1", 5
  - el `doctor` de Juan: `automode` y `copias-kit` en ⚠; la suite sensible a la carga y la roja `no hay sh` → "La prueba de Juan"
- **De diseño, con Guido**:
  - `sensible` no ve lo que corre adentro de un `ssh` → "De la prueba real", 12
  - un director para dos cosas (encargos para un cierre suelto): Guido decidió que CC va por mensaje; el diseño, con los
    experimentos de la próxima versión → "De la prueba real", 5
  - qué cuenta como "porqué" de una pieza adaptada → la ❓ de D6.2
  - el acople de los `hook-*` con `hooks-lib` (nivel completo) → "De D8c.1", 1
  - `secretos.cjs` no frena leer un `config.local.ini` (es un freno: con red team) → "De D8c.1", 2
  - 🔴 que `comando-test` no corra contra una base de clase `real` (el analytics escribiría en producción) → "De la prueba real", 14
  - adoptar un repo con director propio: la comparación a/b/c/d y los anexos, y las 8 reglas genéricas de Mobile. 🔴 La 3 (Grep sobre
    credenciales) es un freno → "De la prueba real", 13
- **De la primera noche del kit v3 en Deptos (2026-11-10, director + obreros, sin dueño)** — lo que Guido sintió primero, en criollo:
  - pidió "un director en loop que deje el TODO de código en cero" y el kit solo sabe de listas fijas → "De la prueba real", 17
  - el director no puede cerrar su worktree ni correr `/cierre`: la noche siempre termina esperando a Guido → "De la prueba real", 18
  - los mensajes del obrero llegaron a otra sesión de la misma carpeta → "De la prueba real", 19
  - `paquete.cjs --pruebas` con una ruta da un rojo falso (y otros chequeos que rechazan lo que la plantilla no dice) → "De la prueba real", 22
  - el resto (obrero `-p` sin mensajes ni allow, obrero parado que deja el worktree inservible, GATE armado con la base de hoy, vistas que
    mienten, frenos 🔴, datos de prueba compartidos, NO VERIFICADO) → "De la prueba real", 20, 21, 23-27
  - lo que sumó la sesión madre al leer los transcripts: el despertador **no** despierta al director (28), el GATE verde en los
    worktrees y rojo en la carpeta principal, donde sella el Arquitecto (29), y el arreglo del push de `integrar` que quedó solo en
    Deptos (30), y el contexto medido contra la ventana de la API cuando la plataforma compacta mucho antes (31) → "De la prueba
    real", 28-31
  - `/estado` está escrito para el director: Guido quiere un reporte fijo y suyo (te necesito · el plan con tramos y % · lo que se hizo
    con su tiempo · lo que falta en orden con su estimación) → "De la prueba real", 32
  - las sesiones le piden a Guido que corra comandos (aprobar, cerrar worktrees, el cierre, la limpieza): "la gracia del kit era que
    fluya". Regla nueva: Guido no tipea comandos; firma con un clic, lo demás lo corre el kit → "De la prueba real", 33
  - "rojo" y "verde" le llegan a Guido sin traducir (jerga de pruebas que la v3 puso en todos lados) → "De la prueba real", 34
  - tres detalles de preparar la PC y adoptar Deptos (carpetas vacías, el `py` de Windows, `--traer` con `main` tomado) → "De la prueba real", 35
  - el 17 (la cola) baja de prioridad: fue el planteo con el Arquitecto, y la segunda noche con cola anda (Guido, 2026-11-10); el 18
    sube: en un repo personal, el cierre de noche llega hasta publicar
  - **la segunda noche (cola)**: la cola anduvo, pero el cierre de noche falló: el subagente hereda el aislamiento del worktree y no puede
    tocar la carpeta principal; a la mañana `ExitWorktree` lo destrabó → "De la prueba real", 36. Y el punto donde compacta no es fijo
    (384 mil una noche, 801 mil la otra) → 31
- **Antes de R2 / después**:
  - un repo de prueba parecido a Hermes → "De D8r.2", 6 (= "De D8c.1", 8)
  - los NO VERIFICADO de la `rc.6` (EnterWorktree real, el obrero de cierre real, `traer-main` con githooks…) → "De D8c.1", 7 (y "De D8r.4", 3; "De D8r.2", 5; "De D8r.1", 5; "De D8b.1", 3)
  - dos agentes con el mismo `name:` después de `--agentes renombrar` → "De D8c.1", 6
  - Hermes con la `rc.6`: resolver `scripts` y `director-obrero`; `allow_abbrev=False` y `andamiaje:` en su ficha → "De D8c.1", 9 y "Para Hermes"
  - `cargar-secreto` con el módulo del lector → "De la adopción real de Hermes", 10
  - los choques de diseño de Hermes contra el kit: **decidido con Guido (2026-11-04), queda lo del kit hasta R2**, y R2 los mira →
    "De la adopción real de Hermes", 9
- **Decidido, no se hace en la v3**: el protocolo de producción queda en Hermes; es una idea para una versión futura (Guido,
  2026-11-04; TODO 🟢) → "De la adopción real de Hermes", 2
  - lo que te espera a vos de los paquetes 2 a 6 (pestañas reales, hooks por PC, "preparame esta PC") → cada "te espera a vos, Guido"
  - los "para después" de los paquetes 1, 6, 7 y 8, y "Del piloto" → cada uno

Lo que una sesión dejó a medias, con qué falta. Se borra cuando se hace (queda en el CHANGELOG).

- **De la adopción real de Hermes (2026-11-04, con Guido)** (lo resuelto salió en la `rc.4`, la `rc.5` y la `rc.6`). Hermes quedó adoptado con la `rc.3` (`main` @
  `5f824544`, `eQ-Repositorio/Hermes-desktop`): D1 A con lo propio de Hermes en la zona propia de las 5 skills, D2/D3 las recomendadas,
  D4 `datos-reales` con 8 comandos, `merge-a-main: con-ok-de-guido`, las reglas de la casa solo con el clic de Guido (CM-14 de Hermes).
  Lo que dolió en el kit:
  1. ✅ rc.6 · con `## [Unreleased]`, el renglón va en `### Método (kit)` (SPEC-paquete-8c, u6; sin clave en la ficha: D8r4-7)
  2. **El kit no tiene protocolo de producción**: solo `Riesgo: alto` y la clase 3. Hermes tiene la ALERTA con las filas esperadas, la
     autorización por tramo con vencimiento (CM-7, 27, 53) y los 4 pasos (ensayo, foto, revisión, verificación). Quedó en su zona propia;
     el principio es del método.
  3. ✅ rc.6 · `andamiaje: con-ok-de-guido` en la ficha: andamiaje es clase 3 (SPEC-paquete-8c, u7)
  4. ✅ rc.6 · `--aplicar --agentes renombrar` pasa el propio a `<nombre>-propio.md` (SPEC-paquete-8c, u6; "mezclar" no es comando: D8r4-9)
  5. ✅ rc.6 · `flota.md` D4: la entrada lleva la bandera de producción (SPEC-paquete-8c, u7, rt-8; lo de Hermes, abajo en "Para Hermes")
  6. ✅ rc.6 · el Equipador, paso 4, pide cruzar los patrones antes (SPEC-paquete-8c, u7)
  7. ✅ rc.6 · `--aplicar --worktreeinclude` escribe lo que propuso `--mirar` (SPEC-paquete-8c, u6)
  8. ✅ rc.6 · las nueve lecciones que pasaron la vara, una línea cada una (SPEC-paquete-8c, u7; las que no, con su porqué en la tabla de u7 de SPEC-paquete-8r4)
  9. **Choques de diseño que Guido decidió para Hermes y conviene mirar en el kit**: la mutación de cada prueba nueva (Hermes) contra
     solo en `Riesgo: alto` (kit); hasta 2 vueltas de revisor con lo abierto declarado (CM-76) contra PARADA; el handoff con 2 banners y
     archivo contra sobreescribir. Hoy en Hermes rigen los del kit.
  11. **De la adopción de los repos de Artibot (el mismo día)**:
     (a) ✅ rc.4 · `carpeta-docs:` en la ficha; `--mirar` la detecta (SPEC-paquete-8r3, i1/i1b)
     (b) ✅ rc.4 · `--mirar` abre D3; `--arranque kit` trae el del kit (SPEC-paquete-8r3, i2)
     (c) ✅ rc.6 · `--mirar` lista los `ask` que preguntan cada vuelta (SPEC-paquete-8c, u6)
  10. Falta: `cargar-secreto` (paso 5 de "Mañana con Guido"), que va con el módulo del usuario de lectura de Supabase. (Lo demás, ✕ no
     aplica: medido, ningún `/cierre` mira esos commits ya pusheados; la línea `después:` lo dice, SPEC-paquete-8r3, i4.)

- **De la prueba real, lo que cuenta Guido** (la sesión madre de la recta final; cada uno con su fecha):
  1. ✅ rc.6 · `vecinos` en `--mirar` y el `doctor` (⚠, nunca borra) (SPEC-paquete-8c, u4+h6; los `gate-*` se cuentan sin consejo de mudarlos: rt-9)
  2. ✅ rc.5 · `.gitleaksignore` con las dos huellas de mentira (SPEC-paquete-8r4, u3)
  3. ✅ rc.5 · `worktree.cjs donde` + EnterWorktree; la vía de una ventana primero (SPEC-paquete-8r4, u1, rt-1; la sesión real sigue NO VERIFICADO: "De D8c.1", 7)
  4. ✅ rc.6 · B0 nacer/retomar, B5 con BORRADOR, `/director` paso 2 (SPEC-paquete-8c, u5)
  5. **2026-11-04 · Un director para dos cosas** (tensión, sin decidir): el de `cashflow` también conduce ajustes de Cuenta Corriente
     fuera del módulo, con un obrero en `ui/cc-seguimiento-circuitos`, por mensaje (decisión de Guido, se mantiene). Queda fuera de
     `encargo.cjs verificar` y no hay cómo darle encargo (con el spec en BORRADOR `presentar --spec` sale 1; la rama no es
     `modulo/<x>--<ID>`). Insumo de D8c.1: encargos para un cierre suelto bajo un director.
  6. ✅ rc.5 · `flota … --con-obra` y `worktree.cjs traer-main` (SPEC-paquete-8r4, u2)
  7. ✅ rc.6 · `--aplicar` avisa los `[completar]` que quedan en `NORTE.md` (SPEC-paquete-8c, u6)
  9. ✅ rc.5 · `tocaContraUno` compara contenido; gitleaks del merge con `--cc` (SPEC-paquete-8r4, u9)
  8. **Dato, no pendiente**: los módulos de Hermes en curso: `lector` solo (rol de lectura en Supabase y `scripts/consultar.py`; sello
     y ready ✅, `2a708a4b`) y `cashflow` con director (spec en BORRADOR, `30427858`; `worktree crear cashflow` con salida 0).
  10. **2026-11-05 · El clon de la adopción y el de la flota no ponen `core.longpaths`** (adopción del Hub, `dashboard-implementaciones`,
      rc.6). `git clone` al scratchpad dio `Filename too long` en ~80 archivos de `oficina/facturas/(2) Servicios Resto de la empresa/…`
      y dejó el clon a medias, **con borrados falsos en el índice** (`D .claude/agents/…`): un `--mirar` sobre ese clon mira mal sin
      avisar. Salió con `git -c core.longpaths=true clone`. Es la **segunda vez**: el bot ya lo había dado en el chequeo de la rc.4
      (SPEC-paquete-8r3, "Bajos que quedan"). `worktree.cjs` sí lo pone (`:666`, `:709`, `:1240`); `lib/flota.cjs`, `lib/adoptar.cjs`
      y el paso 1 de `anexos/flota.md` no. **Para la rc.7**: en Windows, todo clon del Equipador con `-c core.longpaths=true` (y
      `config core.longpaths true` en el clon), y `adoptar --mirar` se niega si el clon tiene el checkout incompleto.
  11. **2026-11-05 · `adoptar --traer` se niega por archivos sin trackear que no chocan** (Arti-bot-eq: 8 rutas de `(1) New/`, los
      pedidos a Marketing de Guido). `lib/adoptar.cjs:1539` cuenta todo `status --porcelain`, `??` incluidos; un `merge --ff-only` con
      archivos sin trackear que los commits no traen es seguro (git solo frena si alguno se pisaría). Salida de hoy: `git stash push -u`
      → `--traer` → `git stash pop`, sin commitear lo de Guido. **Para la rc.7**: el `--traer` deja pasar los `??` que no están en el
      rango (o hace él el stash y lo devuelve) y frena solo por cambios trackeados.
  12. **2026-11-05 · `sensible.cjs` no ve lo que corre adentro de un `ssh`** (Arti-bot-eq, D4). Medido con `lib/comando.cjs partir`:
      `ssh root@<vps> "cd … && docker compose up -d --force-recreate"` sale como **un** comando de 3 palabras (el remoto, una sola
      cadena), y `ssh root@<vps> pm2 restart all` empieza con `ssh`. Guido no quiere que pregunte "cada vez que toca ssh, es super molesto",
      pero sí al deployar o reiniciar el bot: el kit no puede distinguirlo. Hoy: salió el `ask Bash(ssh:*)`, `sensible.release: [pm2
      restart]`, y el deploy lo cuida `/deploy` del bot (pide el OK siempre) — una regla de texto, no un freno. **Para pensar** (con Guido,
      no es de taller): que `partir` abra el comando remoto de `ssh <host> <cmd>` como abre `bash -c`, así una entrada de `sensible`
      matchea adentro; o una forma de entrada `ssh:<cmd>`. Lo mismo pasa en el analytics (su VPS: "mirar libre, tocar pregunta").
  13. **2026-11-05 · Adoptar un repo que ya tiene su propio director cuesta una charla de diseño, no un flag** (Hermes Mobile, rc.6).
      Sus skills de director, obrero y tramo pesaban ~160 KB contra ~35 KB las del kit, y Guido las había aprobado ese mismo día.
      `--mirar` ofreció D1 sin decir qué de lo propio ya cubre el kit. Preparar PC recomendó primero quedarse con las suyas (B) y,
      después de comparar regla por regla, mezclar (A, con zonas y anexos). La comparación separó cuatro grupos: (a) ya lo cubre el kit,
      (b) genérico que conviene subir al kit, (c) propio y (d) viejo. Guido: "en los repos donde no había director fue fácil; ¿cuando
      saquemos una versión nueva va a haber fricciones así de vuelta?". **Para la rc.7 o R2** (diseño, con Guido):
      - que `adoptar --mirar` haga esa comparación a/b/c/d cuando el repo trae su propio director/obrero;
      - que lo propio que no entra en la zona vaya a un **anexo** que la zona señala, y que el actualizador nunca lo toque;
      - que los (b) suban al kit por el ciclo, así los repos no se separan con el tiempo.
      **Los (b) de Mobile**: ocho reglas genéricas que el kit no cubre. Las cicatrices están en `docs/historico/v4/planes/CIERRE_V4_METODO.md`
      de Mobile, commit `38786277`. Mientras no suban al kit, viven en los anexos de Mobile.
      1. **Transporte de mensajes entre sesiones** (el más urgente). Mobile usa:
         - nombres fijos con `/rename`;
         - `SendMessage`, con la primera línea "si no sos X, ignorá";
         - `notify_when_idle`;
         - reintento en la mudanza.
         Las skills del kit no nombran `SendMessage` ni `ListAgents`, y el canal de la mesa está NO VERIFICADO.
      2. **Después de compactar** — ✔ **decidido por Guido (2026-11-05): entra en la próxima versión**. Su pedido: "me gusta tu recomendación de
         que vuelva, pero en el kit… así sale en la próxima versión".
         - Qué es: un SessionStart con matcher `compact` en el molde. Lee el rol (`.kit-rol` / `contexto.cjs`) y le dice:
           - al director, que relea `/director` y la ficha del módulo;
           - al obrero, que relea su encargo (la `ruta@sha` de su ENCARGO) y se re-presente con "me compacté; retomo desde…".
         - No reemplaza mudarse al ~40 %: es la red para cuando igual se compacta.
         - El kit hoy no tiene ese matcher (`inyeccion.cjs`) y trata compactar como una falla (`director:20`).
         - En Mobile salió con la adopción: D3 `--arranque kit` saca todos los SessionStart propios y se llevó también el de compact.
           Para el diseño: que D3 distinga el arranque propio de un hook compact propio, y verificar que `encargo.cjs mensaje` acepte la
           segunda línea de la re-presentación (NO VERIFICADO).
      3. 🔴 **Subagentes que esquivan controles** (H-146, H-161, H-167): arman la palabra por partes, cambian de herramienta, y leyeron
         dos veces el archivo de credenciales **con Grep**, pese a la regla escrita. Para el kit: verificar que el deny de `Read` frene
         también a Grep y a Glob (NO VERIFICADO). Es un freno: va con red team.
      4. **Un subagente "stopped with background work" sin informe no está trabajando** (H-145: 1 h perdida). Hay que mirar enseguida el
         árbol y los procesos. Choca con el kit: Mobile lo retoma o lo reemplaza, y el kit dice "nunca lo reanudás". Decide Guido.
      5. **Medir el contexto antes de un sub-paso grande o atómico, y nada abierto de noche con más de 600k** (H-110, H-112-bis: "decía 60 %
         y tenía 19 %"). Hoy el kit mide con `contexto.cjs` solo al cerrar un tramo.
      6. **La mesa con el PO**:
         - preguntar antes de redactar;
         - opciones a partir de lo que hace hoy;
         - qué protección se pierde;
         - la respuesta en 4 partes;
         - la credencial comprobada el día antes;
         - el clic temprano;
         - avisar a los obreros vivos en la mudanza.
         Es insumo del PO de la próxima versión (TODO, Misión 7).
      7. **Windows**: CRLF, heredoc, y escribir un documento largo vía un temporal, chequeando que no quedó más corto. Es la misma
         cicatriz que la de la madre.
      8. **Gate y tramo**:
         - el número de pruebas no baja;
         - una suite que se saltea cuenta como rojo;
         - nunca "exacto" a secas;
         - el arreglo trivial, con sus 4 condiciones (el kit lo tiene más laxo, `tramo:24`);
         - en una refactorización, el archivo de antes entero;
         - en la mutación, que el script afirme la línea antes de mutar (H-151: encontró una prueba débil que 28 en verde no mostraban).
      Dato a favor del kit: "una regla escrita en dos skills con dos definiciones" (H-151) ya lo resuelve el NÚCLEO.
      **Cómo terminó (2026-11-05)**: Mobile quedó adoptado con la `rc.6` y D1 A (`a07b698a`). Lo propio está en las zonas, las 5 skills
      bajo el tope, y en `docs/referencia/metodo/` (33 KB). Los choques se resolvieron como dice el kit. Con Mobile, son **5 repos en la
      `rc.6`**: analytics, bot, Hermes.exe, Hub y Mobile.
      Quedan tres cosas:
      - El hook post-compact de Mobile salió con D3 y quedó como texto en el anexo: el obrero se re-presenta con "me compacté; retomo
        desde…". NO VERIFICADO que `encargo.cjs mensaje` acepte esa segunda línea.
      - `migraciones.py` de Mobile tampoco tiene `allow_abbrev=False`. Es lo mismo que en Hermes ("Para Hermes"), código del proyecto.
      - Pendientes de Mobile: `flutter pub get` una vez, el `NORTE` con 5 `[completar]`, y `COMPACTION_PROTOCOL.md` todavía nombrado en
        su `CLAUDE.md`.
  14. 🔴 **2026-11-05 · El `comando-test` del analytics escribiría en producción** (Preparar PC, rc.6). `test.js` es de la época de
      SQLite (`DB_PATH`), pero `db.js` exige `DATABASE_URL`, que es la Supabase real: sin ella sale 1, y con el `.env` real la suite
      escribiría en la base viva. La ficha tiene `comando-test: npm --prefix chat-syncer test`, y la flota, el sello o un gate lo pueden
      correr. **Para el kit** (es un freno: red team): que todo lo que corre `comando-test` lo haga sin las variables de las bases de clase
      `real` declaradas en `entornos:`, o que avise y frene si `comando-test` toca una clase real. **Para el proyecto** (Guido decide):
      reescribir el test contra una base de prueba, o sacarlo de `comando-test` mientras tanto. **Guido decidió sacarlo** (`596f335`, `barreras` verde). Vuelve con un test contra una base
      de prueba, de clase `prueba` en `entornos:` (TODO #19 del analytics). Desde ahí la flota no prueba ese repo. **Para el kit**: que
      salte un aviso cuando una ficha de un repo con código no tiene `comando-test`.
  15. **2026-11-05 · "Regenerá el lock" puede cambiar dependencias de producción** (el bot). Regenerar el lock entero movía
      `libsignal` 2.0.1 → 6.0.0 y `protobufjs` 6 → 7, porque Baileys depende de una rama de GitHub que se mueve. Salió parcheando solo el
      importer que faltaba (6 renglones, `77b0f505`). **Para la rc.7**: el aviso de p1 dice "revisá el diff del lock" y sugiere parchear
      solo lo que falta.
  16. **2026-11-05 · gitleaks de la historia "no terminó en 120 s"** en el `--mirar` del bot: la historia completa quedó sin mirar.
      Ya estaba como NO VERIFICADO en la rc.6 ("De D8c.1", 7); ahora está visto. **Para la rc.7**: más plazo, o correrlo en segundo
      plano y avisar el resultado.
  17. **2026-11-10 · Un director en bucle que "deje el TODO de código en cero" no existe en el kit: el spec es de lista fija, no de cola**
      (Deptos, la primera noche entera del kit v3 con director y obreros, 23:14 → 07:30). Guido pidió un director en bucle que dejara
      el TODO de código en cero. Pasó otra cosa: el Arquitecto escribió un spec de **lista** (15 encargos); el kit dice "el spec no crece
      durante la obra", así que todo lo descubierto en el camino fue al TODO (unas 30 entradas nuevas, muchas de código) y el director, al
      terminar la lista, paró. Medido: 19 encargos hechos, 105 sub-pasos, 796 min sumados, 0 intervenciones de Guido, y el TODO de código
      sin vaciar. **Para el kit**: un spec "de cola": el alcance se define por una **regla** ("todo lo del TODO que cumpla X"), no por una
      lista; lo que se descubre chico y dentro de la regla se rellena como encargo nuevo (con un tope por noche y la vara del ADR-030
      para lo que NO entra), y tiene una **condición de fin** medible (cola vacía, tope de horas, o N encargos seguidos sin hallazgo
      nuevo). El Arquitecto tiene que poder preguntar "¿lista o cola?" al armar un módulo de noche. **Para el proyecto**: qué entra en la
      cola lo decide el Arquitecto con Guido; que el director no pueda agregar encargos es del kit.
      **Actualizado el 2026-11-10 por Guido: baja de prioridad.** *"Al final fue error de diseño mío con el Arquitecto. Yo no tiendo a usar
      mucho loop, pero hoy lo planifiqué bien con el Arquitecto y está funcionando bien"* (la segunda noche, módulo `cola`, armada con la
      regla de la cola en su `SPEC.md`). O sea: el kit de hoy alcanza para una cola si el spec la plantea así. Queda, chica, la pregunta
      "¿lista o cola?" del Arquitecto al armar un módulo de noche; lo demás (un modo cola del kit) solo si la segunda noche muestra
      que hizo falta rodear algo.
  18. **2026-11-10 · El final de la noche no tiene quién lo haga: el director no puede cerrar su propio worktree ni correr `/cierre`**
      (Deptos). (a) El director vive dentro de su worktree (`modulo--<x>`) y `worktree.cjs cerrar` se corre **desde la carpeta
      principal**: no puede cerrarse a sí mismo. (b) El `/director` le prohíbe `/cierre` (a propósito: no commitea lo suyo a `main`). A la
      mañana, Guido tuvo que decirle que lanzara un subagente para el cierre. Resultado: la secuencia integrar → release → cierre → limpiar
      worktrees **siempre termina esperando a Guido**, aunque todo lo anterior haya salido solo. **Para el kit**: en modo noche (spec con
      "Apertura: director"), un paso final con dueño explícito: el director lanza un obrero de "cierre de noche" que corre integrar,
      `/cierre` y `cerrar <x>` **desde la carpeta principal**; o un `worktree.cjs cerrar` que acepte que lo corra el director desde
      adentro y avise. El `/director` debe decir cuál es la vía en lugar de prohibir y callar. **Guido, 2026-11-10, lo confirma**: *"en mis
      repos personales pueden integrar, publicar, así que ahí sí me vendría bien"*. Entonces el cierre de noche, cuando la ficha lo
      autoriza (un repo personal: `merge-a-main: con-gate-verde` y sin `release` en `sensible`), llega hasta **publicar** (integrar →
      release → smoke → `/cierre` → limpiar), no solo hasta integrar; en un repo de trabajo para antes de publicar y te espera.
      **La segunda noche lo probó y falló** (ver el 36): el subagente del cierre hereda el aislamiento del worktree del director.
  19. **2026-11-10 · Los mensajes del obrero le llegaron a OTRA sesión de la misma carpeta, no al director** (Deptos). La
      PRESENTACION, el AVANCE y el CIERRE que el obrero mandó por mensajería entre sesiones le aparecieron a la sesión del Arquitecto
      (abierta en la misma carpeta de proyecto), no a la del director. El director avanzó igual por git y por los avisos de fin de los
      obreros de fondo (no por el despertador: ítem 28), pero
      nadie vio llegar el mensaje a destino. Y es intermitente: entre los obreros de fondo, unos mandaron mensajes (04, 05) y otros no
      (92, 06…); depende de la sesión, no del encargo. **Para el kit**: el mensaje lleva el nombre de la sesión destino y el receptor
      ignora lo que no es suyo; o se decide que la mensajería **no es canal confiable** y el obrero siempre deja su estado en git (ya lo
      hace) y el director lo lee de ahí. Hasta decidir, el `/director` no debe prometer que los mensajes "le llegan".
  20. **2026-11-10 · Un obrero de fondo (`-p`) no recibe nada, y no honra el `permissions.allow` del proyecto** (Deptos). (a) Un
      `CORRECCION` que vive solo en `modulo/<x>` no le llega: el obrero relanzado leyó el encargo de **su propia rama** (anterior a la
      corrección), vio su trabajo hecho y repitió el CIERRE; hubo que volver el encargo a su texto original y abrir un encargo nuevo
      con lo medido. Tampoco le llega lo que otro CIERRE descubre para un encargo en curso. (b) Cada obrero `-p` imprime "Ignoring 48
      permissions.allow entries … this workspace has not been trusted": anda con los `--allowedTools` de la línea de `autorizado`, pero el
      allow del proyecto no rige hasta que alguien acepte el diálogo de confianza en esa carpeta (en un worktree nuevo, nadie lo acepta).
      (c) Un comando que el obrero necesitó y no estaba en `AUTORIZADO` (apuntar la red visual al segundo banco) el modo `auto` lo aceptó
      igual: fue azar del clasificador, no diseño. **Para el kit**: `encargo.cjs mensaje CORRECCION` desde el director debe
      **commitear a la rama del obrero** (no solo a la del módulo), o `autorizado` avisa "esto no le llega a un obrero de fondo" al
      relanzar; `worktree crear` deja la carpeta como confiable (o lo avisa); y el comando del banco de pruebas entra en `AUTORIZADO` de
      los encargos con red visual (o `worktree crear` copia la config del banco correcto).
  21. **2026-11-10 · Un obrero que para a mitad de un sub-paso deja su worktree inservible, y el candado de `integrar` no distingue
      "cancelado" de "abierto"** (Deptos, encargo 16: las dos únicas PARADAS de la noche). El obrero paró a las 02:40 con 105
      conversiones sin commitear. El relanzado se encontró con que `worktree.cjs donde` ve cambios sin commitear y **no deja entrar a otra
      sesión** (teme dos sesiones sobre lo mismo). El director no pudo sacar el parche (el aislamiento de su sesión le niega leer git en otro
      worktree). Se canceló el encargo y se rehizo con otro número desde `modulo/<x>`. Pero `cerrar --cancelado` **borraría** el trabajo, y de
      noche no se borra: el worktree quedó sin cerrar, y a las 07:40 `integrar` frenó con "hay un encargo abierto" sobre ese mismo
      encargo, que la ficha ya decía cancelado. Otra espera para Guido, por culpa del kit. **Para el kit**: (1) el obrero, antes de parar
      (PARADA o contexto), **commitea un WIP** a su rama; (2) `donde` acepta al **mismo encargo** y avisa lo que encontró, en vez de negarse;
      (3) el candado de `integrar` lee el renglón "cancelado" de la ficha; (4) `cerrar --cancelado` guarda el trabajo sin commitear
      (rama de rescate o stash) antes de borrar, así puede correr de noche.
  22. **2026-11-10 · Los chequeos del encargo rechazan lo que la plantilla no dice, y uno da un rojo falso** (Deptos). (a)
      `paquete.cjs --pruebas` espera un **comando**; con una ruta da un rojo **falso** (lo descubrió el obrero del encargo 05). (b)
      `encargo.cjs partida` exige un ID de **dos dígitos** y el spec nombraba los encargos `E01…`. (c) `autorizado` rechaza `- Spec:` con
      más de un rango (la plantilla no lo dice), y como los worktrees ya estaban creados sobre el commit viejo, `autorizado` tiene que ir
      **antes** de `crear`. (d) `autorizado` rechaza `- Skill: tramo` ("tiene que decir obrero") aunque el spec pida `/tramo` para tres
      encargos. (e) Un `## Toca` con la ruta seguida de `:línea` o de texto entre paréntesis, o con una **descripción** en lugar de la ruta,
      hace que el chequeo de alcance marque "fuera de ## Toca": 4, 7 y 5 archivos en tres encargos, todos legítimos. (f) "Prueba en rojo
      primero" no aplica literal a un refactor de algo que ya existía: la prueba nació verde y el rojo lo dieron los mutantes. **Para el
      kit**: `--pruebas` dice "esto parece una ruta, quería un comando"; la plantilla de encargo aclara cuántos rangos admite `- Spec:`, que
      `## Toca` lleva la ruta pelada (una por renglón, aunque sea archivo nuevo) y que en un refactor el rojo lo dan los mutantes;
      `autorizado` acepta `- Skill: tramo` si el spec lo pide (o el spec deja de pedirlo).
  23. **2026-11-10 · El GATE de un encargo se arma con la base de HOY, no con la que va a tener cuando mergee** (Deptos, 3 veces en una
      noche). (a) Un encargo salió rojo por un chequeo roto **en la base** (un script que auditaba el skill equivocado, traído por la
      adopción del kit v3): el director había elegido el GATE sin correrlo antes en la base. (b) Otro salió rojo por un error de lint que
      ya había arreglado un encargo anterior: su base era previa a ese merge. (c) Un chequeo que **no estaba en ningún GATE** se rompió al
      mergear un encargo y nadie lo vio hasta que lo midió el siguiente (la red cruzada funcionó, pero por buena suerte). Además
      `verificar` corre el `comando-test` de la ficha de **main**, no la de `modulo/<x>`: lo que el módulo suma al GATE (el lint, esta
      noche) no se corre en `verificar` hasta integrar. Y cambiar un GATE después del CIERRE quedó escrito a mano, sin camino del kit.
      **Para el kit**: el director (o `encargo.cjs`) corre el GATE **en la base** antes de aceptar un encargo y avisa si ya sale rojo
      ("no es de este encargo"); `verificar` lee la ficha de `modulo/<x>`; y una regla en el `/director`: cuando mergea un encargo, los
      que ya partieron corren su GATE con ese merge adentro (o salen del GATE con la razón escrita).
  24. **2026-11-10 · Las vistas del kit mienten con varios obreros vivos** (Deptos). (a) `estado.cjs` mostró tres encargos como
      "mergeado · 2 min · 1 desvío" **con los tres obreros recién lanzados** y sin ningún merge. (b) `tiempos.cjs contador` le carga como
      "desvío" al encargo el propio commit de encargos del director (la base de su rama), y **solo ve ramas vivas**: en un cierre de tramo
      da siempre 0 desvíos para los encargos recién cerrados. (c) `/estado <x>` lee la ficha de `modulo/<x>`, no la de la rama del obrero:
      la línea propia sale, pero el avance es el del director. (d) `autorizado` no sabe **cuántos obreros hay vivos**: llegó a haber 4 a la
      vez con tope 3 (el director lo notó solo). (e) `afirmaciones.cjs` marca "nunca"/"probada" aunque lo fije una prueba, y da un falso
      positivo con "tamaños a medida"; y "Hecho esta noche" queda sin renglón para un encargo cerrado fuera de un cierre de tramo.
      **Para el kit**: cada una es una línea en el script; la (d) es un tope duro que `autorizado` cuenta con `worktree listar`. Lo común:
      **una vista que no tiene el dato debe decir "no sé"**, no mostrar un número.
  25. 🔴 **2026-11-10 · Un freno no dejó tocar un archivo dentro de un encargo autorizado, y otro no dejó borrar una rama temporal**
      (Deptos). El hook de escritura le negó el `Edit` de `.claude/hooks/init-context.mjs` a un obrero cuyo encargo (paso 6b) lo pedía por
      nombre; era inocuo, pero quedó sin hacer y fue a "Te espera". En otro encargo, el freno no dejó correr `git branch -D` sobre una rama
      local creada por el propio obrero (un mutante de prueba, nunca pusheada), que también quedó para la mañana. Dos más del mismo
      tipo, sin pérdida: un Bash compuesto frenado por `secretos.cjs` por **timeout** sin ejecutar nada (se repitió partido en pasos), y
      el aislamiento del worktree rechazando `sed` + heredoc + `git commit` encadenados. **Para el kit** (es un freno: con red team): que un
      encargo con `## Toca` que **nombra** un archivo bajo `.claude/` lo pueda autorizar por esa línea (el sello es la prueba de que
      lo vio el dueño); que el obrero pueda borrar **sus propias** ramas (las que creó y no existen en el remoto); y que `secretos.cjs`,
      cuando se pasa de tiempo, diga "me pasé de tiempo" y no "frenado".
  26. **2026-11-10 · Varios obreros en paralelo chocan por los datos de prueba, no por los archivos** (Deptos). Los carriles de archivos
      estaban bien repartidos y aun así: dos pruebas que guardan sobre el **mismo inmueble de prueba** chocaron en paralelo; una prueba que
      aprueba un ajuste pisó un valor del banco de pruebas (se devolvió a mano con un `UPDATE`); y dos encargos que tocan la misma cadena
      (formulario → helper) mergearon sin que ninguno corriera la paridad del otro: la salvó el encargo siguiente, que la corría antes de
      tocar nada. Además `worktree crear` tarda ~2 min por encargo (`npm ci` entero) y un bucle de 3 pasó el timeout de 5 min. **Para el
      kit**: en `autorizado`/el spec, "carril" incluye **qué datos de prueba escribe** cada encargo (no solo qué archivos); la plantilla
      del encargo pregunta "¿tu prueba escribe algo compartido?"; una regla del `/director`: dos encargos paralelos sobre la misma cadena
      → el siguiente corre la paridad de los dos juntos; y `worktree crear` puede reusar `node_modules` del principal.
  27. **2026-11-10 · Lo que quedó NO VERIFICADO de la noche** (Deptos). (a) ~~El despertador: "si de verdad lo despierta"~~ → medido
      en los transcripts: **no lo despierta** (ítem 28). (b) El relevo del director se escribió a
      36 % de contexto "como seguro, no como mudanza": el director **nunca se mudó**, así que no se probó que un director nuevo retome bien
      desde el relevo + git. (c) Los arreglos que hizo un obrero **después** del revisor frío no tuvieron revisión en frío, y la ficha no
      tiene dónde decirlo. (d) El camino "sí cierra" de un script que cierra alertas solo está probado con datos de mentira (el ensayo real
      dio 0). **Para el kit**: son insumos de la próxima prueba en noche; ningún cambio todavía.
  28. **2026-11-10 · El despertador NO despierta al director: lo que lo despierta son los avisos de fin de los procesos de fondo**
      (Deptos; medido por la sesión madre en el transcript del director, `d3f48853…jsonl`). El director lanzó `noche.cjs despertador
      --modulo pulido --cada 300` a las 23:28 como **Bash de fondo**, no como Monitor (el paso 8 de `kit/molde/skills/director/SKILL.md`
      dice "en un Monitor o tarea de fondo": deja elegir, y una tarea de fondo solo avisa cuando **termina**): sus 75 renglones "DESPERTAR · commit…" quedaron
      solo en el `.output` de la tarea y **nunca generaron una notificación**; lo paró `TaskStop` a las 07:36. Lo que re-invocó al director
      toda la noche fue el aviso de fin de cada proceso de fondo: los obreros (`claude.exe -p --model sonnet --permission-mode auto
      --allowedTools …` con `run_in_background`, el pedido por stdin) y los `encargo.cjs verificar` de fondo; más los mensajes de los dos
      obreros Opus (04, 05). Sin ScheduleWakeup ni Monitor. Un solo hueco largo: 184 min esperando al obrero 12. Al vaciarse la lista
      (07:36) no hubo nada que lo despertara: 1,5 h quieto hasta que Guido volvió. **Para el kit**: `manuales/ROLES.md` §7 y
      `noche.cjs:33` dejan de decir NO VERIFICADO y dicen el mecanismo real (el director se despierta cuando termina un proceso que él
      lanzó de fondo; sin procesos vivos, duerme); el despertador o se lanza como Monitor (y se prueba) o se saca. Si la noche quiere
      seguir después de la lista (ítem 17), necesita algo vivo que la despierte. El paso 8 del `/director` deja de ofrecer "tarea de
      fondo".
  29. 🔴 **2026-11-10 · El GATE da verde en los worktrees y rojo en la carpeta principal, que es donde sella el Arquitecto** (Deptos;
      medido por la sesión madre después del release). `py -3 scripts/arnes.py --solos` (parte del `comando-test` desde la noche) da
      54/55 en `main` de la carpeta principal: `test_migrar_desarmado.py` falla 2 de sus chequeos. Corre el dry-run de
      `migrar_excel.py`, que busca `Claude deptos/Departamentos/Trackeo2.xlsx` (ignorado por git: está **solo** en la carpeta
      principal). Ahí el dry-run va a leer la base, y `--solos` la apunta a un puerto muerto → rojo; en un worktree no hay Excel y pasa.
      Fuera de `--solos`, ese test lee la base real (solo lectura). **Consecuencia**: el próximo sello del Arquitecto (corre
      `comando-test` en la carpeta principal) da rojo, y la noche no lo vio porque todo se verificó en worktrees. **Para el kit**: el
      GATE tiene que dar verde **donde se va a correr** (sello, `verificar`, `integrar`); un archivo ignorado por git que existe solo en
      la carpeta principal es una diferencia entre los dos lugares que nadie mira (`.worktreeinclude` es la mitad del remedio: copia,
      no avisa); `integrar` o `/cierre` podrían correr el `comando-test` una vez en la carpeta principal. **Para Deptos**: sacar
      `test_migrar_desarmado.py` de `SOLOS` en `scripts/arnes.py`, o pasarle `--excel` a una ruta que no existe.
  30. **2026-11-10 · El push de `integrar` a la rama por defecto se corta a los 2 min, y el arreglo quedó solo en Deptos** (Deptos). Con
      un módulo entero (168 commits), el pre-push (gitleaks + barreras por commit) no entra en los 120 s de `worktree.cjs:1120`
      (`enElTemporal`): falló a las 09:29 y a las 09:41. El director lo arregló a mano en Deptos (`151ad78`, 600 s) y recién ahí integró
      (`ba47071`). **Para el kit**: subir el plazo en `kit/molde/scripts/worktree.cjs` (o hacerlo proporcional a los commits), con su
      prueba; hasta entonces, la próxima flota ve el `worktree.cjs` de Deptos como editado a mano y lo frena.
  31. 🔴 **2026-11-10 · El director mide su contexto contra la ventana de la API (1 M), pero la plataforma lo compactó a los 384 mil**
      (Deptos; medido por la sesión madre en el transcript del director). `contexto.cjs` dio `363k de 1000k (36%)` a las 03:25 (el
      relevo se escribió "como seguro, no como mudanza") y a las 07:18 llegó un `compact_boundary` **automático** con `preTokens: 383765`
      → 20.810. Es decir: el 36-38 % que veía el director era, en la práctica, el **techo**. No hubo daño (se recuperó con el relevo),
      pero es justo lo que el kit llama falla. Lo que dice el kit hoy: el `/director` se muda a "~40 %" (`director:20`), el diseño
      decía ~65 % blando y ~80 % duro (`DISENO-D` §11.1, con "dónde compacta: 97 % de un millón", medido en la app de escritorio el
      26-10, no en la extensión de VS Code), y `contexto.cjs:31` ya avisa "dónde compacta la plataforma: NO VERIFICADO". **Si se hubieran
      usado los umbrales del diseño, el director habría compactado mucho antes de mudarse.** Qué fija el punto (la extensión, el modelo,
      una opción de compactar) queda NO VERIFICADO. **Para el kit**: (a) `contexto.cjs` mide contra **el punto donde compacta** y no
      contra la ventana de la API: lo aprende de los `compact_boundary` (`preTokens`) de los transcripts de la PC, y sin dato lo dice
      ("techo: no sé") y usa uno conservador; (b) los umbrales del `/director` se expresan sobre ese techo (mudarse al cerrar el tramo a
      ~65 % del techo, ya a ~80 %); (c) el director mide **en cada merge**, no solo al cerrar el tramo (esa noche esperó 184 min a un
      obrero sin volver a medir); (d) el chequeo de "me voy" usa el mismo techo; (e) lo mismo vale para los obreros (`AVANCE` con la
      cifra del script).
      **Corregido el 2026-11-11 con la segunda noche (módulo `cola`)**: ese director compactó a los **800.551** tokens (`compact_boundary`
      automático a las 01:03, `preTokens: 800551`), no a los ~384 mil de la primera. Con el mismo modelo (`claude-opus-5-5`) y la misma
      PC, el punto **no es fijo**: 384 mil una noche, 801 mil la otra. Qué lo fija sigue NO VERIFICADO. El remedio de arriba vale igual,
      con un cambio: el techo es el **más bajo** que se haya medido en la PC (hoy 384 mil), no el último, hasta saber qué lo mueve.
  32. 🔴 **2026-11-10 · `/estado` está escrito para el director, no para Guido, y cambia cada vez que lo corre** (Deptos, módulo `cola`;
      pedido de Guido). Guido: *"escrito para el director y no para mí… cada vez que lo mando aparecen otras tareas diferentes que antes no
      estaban; no lo sé leer"*; *"es un reporte que yo uso constantemente"*. Medido corriendo `estado.cjs` y `estado.cjs cola` el
      2026-11-10 a las 22:22: (a) "TE ESPERA" trae 4 renglones y **uno solo** es de Guido (aprobar un cambio); los otros son una PARADA ya
      resuelta y dos encargos cancelados, o sea historia del director; (b) jerga interna: SHAs (`@a3228de`), `CORRECCION`, ids de tarea
      (`C13`), "rama anterior a `4b8ef0a`", `comando-test`; (c) "avance: 0 de 3 tareas (0%)" con el módulo trabajando hace horas: un módulo
      de cola no cuenta como uno de lista; (d) no dice qué se hizo, cuánto tardó ni cuánto falta, lo que Guido ya le había pedido al
      director en la primera noche ("un mini resumen de lo que fue corrigiendo, cuánto tiempo le llevó, cuánto estima que va a seguir");
      (e) solo ve los encargos con rama viva; (f) el contexto da un número falso (ítem 31). **Lo que Guido quiere** (sus palabras,
      ordenadas): un formato fijo, siempre las mismas secciones en el mismo orden, en criollo:
      1. **Te necesito**: solo lo que espera de él (decisiones, aprobados, bloqueos que piden su atención) o "nada".
      2. **El plan**: en qué módulo y tramo estamos; tramos cerrados y tramos que faltan; % del plan grande, % del tramo actual; lo que
         falta, en horas y en %.
      3. **Lo que se hizo**: cada cosa en una línea, con cuánto tardó.
      4. **Lo que falta, en orden**: cada tarea con cuánto se estima que tarda.
      **Para el kit**: rehacer `estado.cjs` (y `/estado`) como reporte **del dueño**: las cuatro secciones, siempre; sin SHAs, ids ni
      nombres de comandos (si hace falta una línea para copiar, va al final y aparte); lo resuelto o cancelado sale de "Te necesito" y va
      a la historia del módulo; los encargos cerrados cuentan aunque su rama ya no exista (de la ficha y `tiempos.md`, no de las ramas);
      los % y las estimaciones salen de un script (los tiempos medidos de los encargos ya hechos), y un número que no se sabe dice "no
      sé", nunca 0 %; el avance de un módulo de cola se cuenta sobre su cola viva. La vista para el director (la de hoy) puede seguir
      existiendo aparte, para él (`/estado --director` o dentro del `/director`). Va con el diseño de la cola (17): un plan "de cola" tiene
      que poder decir cuánto falta.
  33. 🔴 **2026-11-10 · El kit v3 le pasa a Guido comandos para correr a mano, y eso rompe "que fluya"** (todas las sesiones; pedido de
      Guido). Guido: *"un montón de sesiones me están empezando a pedir constantemente que corra yo cosas, cuando habíamos dicho que la
      gracia del kit era que fluya; antes no me pasaba, no tenía que andar corriendo todos estos cd, estos node"*; *"hay bastantes
      rispideces"*. Con la v2 no pasaba: es un costo que trajeron las barreras y los roles de la v3. **Los casos de un solo día**
      (2026-11-09/10): (a) `cambios aprobar` es firma del dueño y "un agente no aprueba": Guido lo corrió dos veces a mano en Deptos, y
      la primera falló porque la sesión le dio la línea en bash (`&&`) y su terminal es PowerShell 5.1; (b) el clasificador de `auto`
      frenó a la sesión el `preparar-pc` que ponía Deptos en `autoMode` ("Self-Modification"): Guido corrió tres líneas; (c) el director
      tiene prohibido `/cierre` y no puede cerrar su propio worktree (`cerrar` va desde la carpeta principal): a la mañana Guido le tuvo que
      decir "lanzá un subagente a que corra cierre" (ítem 18); (d) los worktrees no se pueden borrar entre ellos, el director no puede leer
      git de otro worktree, y un cancelado con trabajo sin commitear queda para la mañana (ítem 21); (e) el reporte final de la noche le
      dejó **siete** tareas de limpieza a mano (worktrees viejos, `git branch -D`, `git worktree prune`, el `sparse-checkout` de la otra PC,
      el diálogo de confianza de cada carpeta, la memoria de fuera del repo, un hook que el freno no dejó editar); (f) la sesión madre le
      pasó a Guido una tarea de otro repo (aprobar un cambio de Deptos desde vibe-kit), cuando eso es de la sesión de ese repo. Un
      `grep` en `kit/` encuentra al menos 14 renglones en 11 archivos que le dan al dueño una línea para correr (`git-seguro.cjs` 4,
      `worktree.cjs` 3, `cambios.cjs` 2, `estado.cjs` 2, `actualizar.cjs` 2, `flota.md` 2, y uno en `director/SKILL.md`, `noche.cjs`,
      `kit-githook.cjs`, `fusion.cjs` y el `SKILL.md` del Equipador); el inventario completo lo hace la `rc` que lo arregle. **Para el kit, una regla nueva y
      fuerte: Guido no tipea comandos.** Lo que necesita su firma es **un clic** en la sesión que lo pide (una pregunta con botones, o la
      ventana de permiso de esa misma acción), nunca una línea para pegar; lo que tiene que correr en la carpeta principal lo corre una
      sesión o subagente que el kit lanza ahí (el "cierre de noche" del 18); lo que el clasificador frena se resuelve de antemano (en
      `preparar-pc`, el `autoMode` y las allow) o se rediseña; la limpieza (worktrees, ramas temporales, prune) la hace el kit solo, con un
      seguro (rama de rescate) en vez de dejarla para la mañana; y si alguna línea queda, sale **en la sintaxis de su terminal**
      (PowerShell en Windows), una por renglón. Cada barrera que hoy pide un comando se mide con la vara del ADR-030: si su costo en
      fluidez es más grande que lo que protege, se cambia. Va con el 17, el 18 y el 21.
  34. **2026-11-10 · "Rojo" y "verde" le llegan a Guido sin que nadie le haya dicho qué son** (todas las sesiones; pedido de Guido).
      Guido: *"en muchos lugares también me empezó a aparecer la palabra rojo, en situaciones en las cuales antes no me decía eso; que un
      test da rojo, una cosa roja; no sé qué será eso"*. Es jerga de pruebas: **verde** = la prueba pasó, **rojo** = falló, "prueba en rojo
      primero" = escribir la prueba que falla antes de arreglar. La v3 la puso en todos lados (el gate, `verificar`, el candado, los
      githooks, la plantilla del encargo): medido el 2026-11-10, "rojo"/"verde" aparecen 269 veces en 36 archivos de `kit/` sin contar
      pruebas, y 0 en los moldes de la v2 (`legacy/templates-universales-v2/`). Entre sesiones está bien; el problema es cuando llega al
      dueño sin traducir. **Para el kit**: lo que le habla al dueño (`/estado`, "Te espera", el handoff, el reporte de la noche, las
      preguntas, los avisos de los githooks) dice "la prueba falló" o "pasó" (o "lo chequeé y está bien"), nunca rojo/verde; la jerga queda
      para los mensajes entre director, obrero y scripts. Va con el 32 y el 33: el kit habla para el director y se le escapa al dueño.
  35. **2026-11-09 · Tres detalles de preparar la PC y adoptar Deptos** (sesión madre, PC `Usuario`; anotados un día tarde). (a)
      `preparar-pc` borra los archivos que el kit ya no trae pero deja sus **carpetas vacías** (`skills/arquitecto/templates/universales/…`),
      y `kit-sync` da SUCIO por eso hasta que alguien las borra. (b) El `doctor` no encuentra `py` en el PATH (en Windows es un alias de
      `WindowsApps`, `py.exe`) y avisa `sensible-prosa` de más sobre `datos-reales: [py scripts/…]`, aunque el hook `sensible` sí pregunta
      (probado). (c) `adoptar --traer` exige la carpeta principal limpia y en la rama del clon; en Deptos estaba en un commit suelto y `main`
      lo tenía tomado el worktree del director viejo: hubo que soltarlo (`switch --detach`) y poner la carpeta en `main` a mano. **Para el
      kit**: `preparar-pc` borra también las carpetas que quedan vacías; el `doctor` reconoce los alias de `WindowsApps`; y `--traer`
      dice qué worktree tiene tomada la rama y ofrece soltarlo (con el 33: sin que lo tipee Guido).
  36. 🔴 **2026-11-11 · El cierre de noche no puede correr desde el director: su subagente hereda el aislamiento del worktree** (Deptos,
      la segunda noche, módulo `cola`; medido por la sesión madre en el transcript del director, `2c6ed11c…jsonl`). El spec del módulo
      (`SPEC.md:155-173`) ya rodeaba el 18: al vaciarse la cola, el director integra y lanza un subagente que hace el cierre de punta a
      punta en la carpeta principal (8 pasos: pull, migraciones 0057 y 0058, `/release`, smoke, cerrar alertas, limpieza, `/cierre`,
      `cerrar cola`). `worktree.cjs integrar cola` anduvo (01:45, `10f6890`, gate 54/54). El subagente (Sonnet, lanzado con la
      herramienta Agent a las 01:55) **no hizo ninguno de los 8 pasos**: Claude Code le negó todo git sobre la carpeta principal, con
      `cd` ("changes directory to the shared checkout … before running git. Refusing to run it — a worktree-isolated session's git
      operations must target its own worktree") y con `git -C` ("redirects git to the shared checkout via -C. Refusing…"). Un subagente
      **hereda el aislamiento** de la sesión que lo lanza. El director no lo rodeó y le dejó a Guido tres pasos a mano (cerrar la pestaña,
      abrir una sesión nueva en la carpeta principal y pegarle un prompt que quedó en el **scratchpad temporal** de la sesión, y
      `cambios.cjs aprobar` en PowerShell): justo el 33. Producción quedó en la 0056. **La salida existe y no se usó de noche**: a la
      mañana (09:57), con el pedido de Guido, la misma sesión llamó a `ExitWorktree` (`action: keep`: el worktree y su rama quedan) y
      volvió a la carpeta principal; desde ahí `git status` y el pull anduvieron. **Para el kit**: (a) el cierre de noche no se delega a un
      subagente: lo hace el director **saliendo de su worktree** con `ExitWorktree` (keep) cuando la cola está vacía y el módulo integrado,
      o una sesión que el kit lanza en la carpeta principal (no un subagente); (b) el `/director` lo dice en su paso de "terminar el
      módulo" y en el modo noche; (c) un prompt para el dueño nunca queda en el scratchpad temporal: va commiteado en la bitácora; (d) hay
      que probar que `ExitWorktree` corra sin ventana, de noche, en la extensión de VS Code (hoy NO VERIFICADO: a la mañana Guido estaba).
  - **Dato (la segunda noche, módulo `cola`, 2026-11-10/11)**: el spec planteado como **cola** con su regla anduvo (24 encargos, 58
    sub-pasos, 513 min sumados; la cola quedó vacía a la 01:45) y confirmó lo de la primera: el despertador no se corrió ("las tareas
    de fondo de los obreros ya me despiertan solas", 22:38: ítem 28); una CORRECCION volvió a no llegarle a un obrero de fondo y quedó como
    regla "CORRECCION = cancelar y recrear" (18:50: ítem 20); un obrero le mandó su PRESENTACION a la sesión de `main` de Guido (19:40:
    ítem 19); `cambios.cjs aprobar` lo niega un hook desde una carpeta de agente y fue a Guido (20:15: ítem 33); dos redes visuales en
    paralelo dieron rojos por tiempo (19:40: ítem 26); el "me voy" marcó 72 % de contexto y el spec decidió no mudarse (22:38), y
    compactó a los 801 mil (ítem 31). Lo nuevo es el 36. Lo crudo: `docs/modulos/cola/bitacora/notas-del-metodo.md` de Deptos.
  - **Dato (la primera noche, medida)**: 23:14 → 07:30 (8 h 15 min de reloj); 19 encargos, 105 sub-pasos, 796 min sumados (~13 h de
    trabajo, varios en paralelo); **0 intervenciones de Guido**; 2 PARADAS, las dos por el encargo cancelado (ítem 21). El kit v3
    aguantó una noche entera sin dueño; lo que no hizo es **terminar solo** (ítems 17 y 18). Lo crudo está en el repo de investigación
    (`mision-6/noche-deptos-2026-11-10/`).
  - **Dato**: 5 repos en la `rc.6` (analytics, bot, Hermes.exe, Hub, Mobile). Devoluciones, visor-buzon y Millennium-Clipboard quedan
    sin ficha a propósito. En Hermes, el `traer-main` de `modulo/lector` choca en 5 archivos: es un encargo de su director.

- **La prueba de Juan** (2026-11-04, pedida por Guido): Juan prueba la beta en su PC y sus proyectos y sube pruebas duras e impresiones
  a la rama huérfana `prueba/juan` de este repo (sin el kit: su `CLAUDE.md`, `PLAN.md`, `pruebas/`, `impresiones.md`, proyectos con
  alias). La sesión madre la lee con `git fetch origin prueba/juan`; lo que sirva entra acá, en esta sección.
  - **Pasos 0-2 (`52e0ca3`, rc.3 en `pc-juan`)**: el `doctor` dio 0 ✗ y 5 ⚠, de los que salen tres hallazgos:
    - ✅ rc.6 · el `doctor` lee el `claude.cmd` de la terminal (SPEC-paquete-8c, h10);
    - `automode` da ⚠ por dos checkouts del mismo origin;
    - `copias-kit` da ⚠ por 2 proyectos con copia propia de `arquitecto`.
  - **Suite**: 35 min, 2858 de 2867, 8 rojas y 1 salteada. Repetidas por archivo pasan las 287.
    - La roja `no hay sh` (kit-githook) depende de la terminal: falla en PowerShell sin `sh` en el PATH y pasa en Git Bash (h10).
    - Las otras 7 vienen de la carga de la PC (Docker) o de la terminal, sin atribuir. Fue la primera corrida fuera de las PCs de Guido:
      hay pruebas sensibles a la carga.
- **Para Hermes, cuando le llegue la `rc.5`/`rc.6`** (código de Hermes: lo hace Guido o su sesión, no el kit):
  - `allow_abbrev=False` en el argparse de `scripts/aplicar_migracion.py`, así `datos-reales` puede exigir `--confirmar-produccion`;
    hoy `--confirmar` abrevia y esquiva la pregunta (rt-8).
  - `andamiaje: con-ok-de-guido` en su ficha, que es la opción de editar reglas.

- **De D8r.4, para la `rc.6`** (D8c.1; el chequeo frío de la `rc.5`, en `SPEC-paquete-8r4.md`):
  1. ✅ rc.6 · `locks` en `--mirar`/`doctor`; la línea 8 da ⚠ (SPEC-paquete-8c, p1; regenerar el lock de cada repo sigue siendo de Guido)
  2. ✅ rc.6 · la apertura dice `/director <x>` (SPEC-paquete-8c, r2, D8r.4-2)
  3. NO VERIFICADO: `traer-main` con los githooks puestos; gitleaks cazando una clave nueva en un merge.

- **De D8r.2, para la `rc.5`** (D8c.1), con su porqué (no entraron en la única vuelta de corrección):
  1. ✅ rc.4 · `resolver . <pieza> nueva --por …` sin informe sobre una `propia` (SPEC-paquete-8r3, i5)
  2. ✅ rc.6 · `vars.plazo-test` en la ficha, lo lee el `sello` (SPEC-paquete-8c, u8)
  3. ✕ hacerlo solo es adivinar: `--mirar` ya lo avisa y se decide en la pantalla con Guido (SPEC-paquete-8r4, "De la `rc.4`"; D8c-7)
  4. ✕ por las dudas: la línea ya lo deja a Guido (SPEC-paquete-8r4, "De la `rc.4`"; D8c-7)
  5. **NO VERIFICADO**: los casos "no llegó" y "otra rama" de `--traer` sobre el clon de Hermes (probados en las pruebas, no sobre
     Hermes); `claude -p` armando una mezcla real que choca. (Lo de `barreras` después de `cambios aprobar`, ✕ no aplica: Hermes, 10.)
  6. **Un repo de prueba parecido a Hermes** (lección de R1b, pedido por Guido el 2026-11-04): `pruebas/rehacer.sh` suma uno con lo que
     los de juguete no tienen: su propio `director`/`obrero`/`inicio`/`cierre`, Python con su `venv` y pruebas por un `.bat`, el repo dos
     niveles abajo de la carpeta de proyectos, una subcarpeta `web/` con su `package.json`, un `SessionStart` propio, un handoff por
     encima del tope y un `settings.json` con `ask` de `git merge`. Con datos genéricos (repo PÚBLICO: nada del Hermes real). Las
     revisiones integrales y los revisores fríos corren contra ese repo y, cuando exista, contra un clon del proyecto real.
- **De D8r.1, para la `rc.5`** (D8c.1):
  1. ✅ rc.6 · con director, `modo-a.md` arma `v1` y dice `/director v1` (SPEC-paquete-8c, r1, D8r.1-1)
  2. ✅ rc.6 · verificado contra `adoptar.cjs`: el texto ya decía el orden real (SPEC-paquete-8c, r1, D8r.1-2)
  3. ✅ rc.6 · `director-obrero: propia` + `resolver … nueva`, en `flota.md` y la nota (SPEC-paquete-8c, r1, D8r.1-3; de punta a punta, NO VERIFICADO)
  4. ✕ es ruido, no rompe; `integrar` ya borra la remota de su obrero (SPEC-paquete-8c, r1, D8c-7)
  5. **NO VERIFICADO**: el `claude` real armando la propuesta de una mezcla que choca; un lockfile commiteado que el setup modifica
     (probado con uno de prueba, no con el de Hermes); `flota todo` sin `--tag` mandando un rc a varios proyectos (escrito, t9).

- **De D8b.1, para el `rc.2`** (los arregla la sesión de la madre que acompañe la prueba en Hermes, D9.1):
  1. ✅ rc.6 · el obrero de cierre de tramo, con `plantilla-cierre.md` (SPEC-paquete-8c, c1)
  2. ✅ rc.2 · los textos viejos: el ruteo del Modo A y `flota.md:23` (SPEC-paquete-8r, D8r.1)
  3. **NO VERIFICADO**: el Modo A `liviano` con el gate quitado, de punta a punta (D8b.1-e); `adoptar --kit` con un kit sin ningún tag
     v2 cae al molde nuevo y dejaría `/inicio` y `/cierre` en "te espera" (lo vio A, no lo arregló); un "no" del clasificador adentro
     del `-p` del obrero en `auto` (D8b-1).

- ❓ **Pregunta para Guido (de D6.2, no traba a D7.1): ¿qué cuenta como "porqué" de una pieza adaptada?** Hoy (tu D6-19: "ficha o
  `git log`") cuenta el asunto de **cualquier** commit que modificó la pieza (menos los del kit). El revisor frío mostró que así el
  "sin porqué → te espera" casi nunca dispara: un "cierre: docs al día" que tocó `/cierre` de pasada alcanza para que la próxima flota
  la fusione sola. **Opciones**: (A) como hoy · pro: menos preguntas · contra: fusiona sola cosas que nadie decidió; (B) **solo el
  `por:` de la ficha** (lo escribe `/inicio` con tu respuesta) · pro: cada fusión automática tiene un porqué tuyo · contra: la primera
  vez de cada pieza adaptada te llega una pregunta; (C) del `git log`, solo un trailer explícito `Por: …` · pro: deja anotar el porqué al
  commitear · contra: hay que acordarse del trailer. **Recomendada: B** (la que mejor pasa la vara: una pregunta por pieza, una sola
  vez, y después va sola). Es una línea en `lib/fusion.cjs` (`porqueDe`) y sus pruebas.
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
  1. **Instalar los hooks por PC, en `clientes`, en `Usuario` y en `Draco-PC`** (esta, desde el 2026-11-02): `node ~/.claude/skills/arquitecto-skills/scripts/instalar-hooks-pc.cjs --plan`
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
- **Paquete 5 · te espera a vos, Guido** (D5.2 no lo podía hacer sin una persona; **no traba a D5.3 ni a D6.1**):
  0. **Lo nuevo de D5.2, en una pestaña real de VS Code en `../vibe-kit-pruebas/alfa`** (antes `bash pruebas/rehacer.sh`): `/estado` (vista corta, sin
     preguntar); en un módulo con director, decir "me voy" (tiene que correr el checklist y dejar `.kit-noche`) y al otro día `/inicio` (tiene que
     borrarla: "ya es de día"); y el despertador en un Monitor (**cómo despierta al director: NO VERIFICADO**, lo mira el piloto).
  0b. Repasar las ⚠️ de D5.2 y D5.3 (arriba): sobre todo que la noche del director alcanza a sus obreros, que `mesa nuevo` sube a `origin` solo, `Write`→`Edit`
     en AUTORIZADO, y que el corrector de afirmaciones **avisa y no frena** (D5.3-1).
  1. **Fila 3 del delta, en una pestaña real de VS Code**: armá un módulo con director en `../vibe-kit-pruebas/alfa` (o pedíselo a una sesión),
     corré `node .claude/scripts/encargo.cjs autorizado <x>--01` y abrí la pestaña del obrero con la línea `code "…"` que imprime: **cero pop-ups
     para git, `encargo.cjs` y el test**, y la ventana sí para una de las 5 de A. Es la mitad VS Code de D5-19.
  2. Repasar las ⚠️ de D5.1 (arriba) y el delta sellado sin vos: lo que más pesa es D5-2 (nadie en bypass), D5-19 (tu pestaña en tu modo) y
     D5-3 (`integrar` sin `/cierre`).
- **Paquete 8 · para después** (de D8.1; nada traba lo que sigue):
  1. **Dos NO VERIFICADO que E3 encontró al anotar los diseños** (no están en lo construido): el "rojo si se borran líneas" de `frenos.log`
     (fila 21 de "Lo que este spec corrige") y que el adoptador marque las reglas con cicatriz para correr en chico en el mismo OK (fila 18,
     RF-27). Se miran al adoptar el proyecto real: si faltan, son un delta chico.
  2. **Lo que §1.5 le pedía a producción quedó como reparto en la ficha y los frenos, pero ningún script obliga** a declarar respaldo, rutas
     protegidas y crons cuando hay un entorno `clase: real`. Es diseño (H → F §9); si el proyecto real lo extraña, va al Arquitecto.
  3. **Las filas de lector y los costos de las otras PCs** (D8-4): se miden en la prueba real con la receta de `METODO.md` ("La corrida mensual").
  4. **El mapeo alias → repo** (privado, `vibe-research/mediciones/2026-11-03/mapeo.md`): "Bot personal" quedó asignado por fecha; miralo.
  5. **En `Guido-PC-eQ`, el administrador de credenciales de git pide una ventana** para pushear (a la mañana andaba; desde ~09:50 no):
     sin nadie, el push falla con "User cancelled dialog". D8.1 pusheó con `git -c credential.helper= -c 'credential.helper=!gh auth
     git-credential' push`. Si te molesta, `gh auth setup-git` lo deja fijo (es tu configuración: decidilo vos).
- **Paquete 7 · para después** (de D7.1; nada traba a D8.1):
  1. **El `D-n` de Mobile** (SPEC-0 6.8b): `migrar-cambios.cjs` lee el formato `CM-N` de Hermes; el de Mobile no se exploró (D7-5). Se
     mira al adoptar Mobile: si es parecido, una bandera; si no, un lector más.
  2. **`vars.proyecto` con forma de alias** (`[a-z0-9-]+`): si no la tiene, el cruce por id no casa (`cambios-flota` lo marca con ⚠).
     El parser de la ficha no lo valida; se ve en el piloto.
  3. **Una pieza de varios archivos con zona**: el mutante vivo de RF-fix (`moldeNuevoDe` toma cualquier archivo de la pieza) no se
     distingue hasta que exista una; hoy las piezas con zona tienen un archivo.
  4. **Esta PC no tiene `~/.claude/kit-pc.md`**: el renglón `--urgentes` del `/inicio` de vibe-kit dice "no sé dónde está la flota" hasta
     que "preparame esta PC" lo escriba (o se le pase `--proyectos`). Va con lo de "preparame esta PC" de Paquete 6.
  5. **El banner siempre** (Guido, al cierre de D7.1): con un README propio que `armar` no pisa, el `assets/banner.svg` se crea igual y
     queda sin enlazar. Menor; si molesta, que el banner dependa de que el README sea el del script.
  6. **La portada vista en GitHub** (cómo se ve el banner renderizado) y el Modo A con el molde v3 (el renglón de `modo-a.md` está
     condicionado a que el proyecto traiga `portada.cjs`): NO VERIFICADO, al piloto.
- **Paquete 6 · para después** (de D6.2; nada traba a D7.1):
  1. **La fusión con un `claude` real** (fila 3 de "Lo prueba una sesión real" del delta; NO VERIFICADO): todas las pruebas usan un
     `claude` falso. Falta ver que el clasificador deje lanzar el `claude -p` de `lib/fusion.cjs` (`acceptEdits`, `Read`/`Edit` de
     `.kit-fusion/**`) y que un `git reset --hard` pedido al agente quede frenado; y que en Windows un `claude.cmd` arranque por `cmd /d /s /c`.
     Se prueba con un clon de `alfa` con una pieza `adaptada` con conflicto y `--claude <el claude.exe de la extensión>`.
  2. **El 3.0.0 final después de un `-rc`**: la ficha guarda `3.0.0` sin el rc, así que si el final trae algo que el último rc no tenía, la
     flota lo saltea por "al día" (RF-fix #5 lo dejó así a propósito). Antes del tag (orden 10): o se repartió solo a los repos de prueba, o
     el tag final es igual al último rc.
  3. `lib/chequeo.cjs` restaura `core.hooksPath` pero no borra `kit.hooksPathPrevio` (F3 lo esquivó en `flota`); el `hooksP =path` sin espacio.
  4. Menores de `chequear` (de D6.1): un `comando-test` con `&&` da NO VERIFICADO; `comando-setup` rojo en la base deja la línea "no se sabe
     si ya estaba rojo antes".
  5. NO VERIFICADO de `preparar-pc`: la línea para instalar Claude Code y los ids de `winget` (no se cruzaron con su fuente).
  6. El Modo A con el molde v3 y `docs/modulos/v1/` (D4-6): no lo tocó D6.2.
- **Paquete 6 · te espera a vos, Guido** (D6.1 y D6.2 no lo podían hacer sin una persona; **no traba a D7.1**):
  1. **"Preparame esta PC" de verdad, en tu segunda PC** (o en la de un compañero): decile al Equipador "actualizate" o "preparame esta PC"; tiene
     que hacer **una sola pregunta**, mostrar la tabla y decir "reiniciá Claude Code"; después `doctor` sin ✗. Mirá que el bloque `autoMode` de
     `~/.claude/settings.json` empiece con `"$defaults"` (NO VERIFICADO del SPEC-0: el bloque en la segunda PC). **Ojo**: hasta que haya un tag
     `v*` nuevo, "actualizate" baja el último tag (`v2.4.3`), que no trae `preparar-pc`: esto se prueba con el tag de la misión (orden 10) o
     con un `v3.0.0-rc`.
  2. **La pregunta de arriba** (qué cuenta como porqué) y repasar las ⚠️ de D6.1 y D6.2 (arriba): sobre todo **ADR-032** (nadie en bypass; el
     único agente es el de la fusión), **D6.2-1** (`por:` en la ficha), **D6.2-3** (un hook adaptado siempre te pregunta) y **D6.2-6**
     (la adopción en dos commits).
  3. **La sesión real de "poné al día la flota"** (fila 2 del delta): en una pestaña en `auto`, que el clasificador deje correr
     `actualizar.cjs flota` (pushea a `main`). Si lo frena, la línea la corrés vos en tu terminal. Probalo con los repos de prueba, nunca con uno real.
- **Del piloto** (menores de D5.2 y D5.3, sin dueño en el paquete 6): el `--hasta` de `noche.cjs me-voy` no termina la noche solo (hoy
  informativo); el corrector de afirmaciones (escape de `sh` y SQL; la salida 1 por un archivo que git no lee; **para que frene algún día**,
  re-medir con un corpus nuevo y bajar los falsos positivos a 0, con el método escrito en "D5.3 · Decisiones sin Guido"). El `.claude/paquetes/`
  sin trackear lo cierra `aplicar` (pega el `gitignore.snippet` nuevo) cuando la flota corra.
- **Paquete 1 · menor**: una ficha en Latin-1 da "valor inválido" (sin eco) en vez de "guardala en UTF-8". Se arregla si aparece en la flota.

- **De D8c.1 (la `rc.6`), para después** (cada uno con su porqué en `SPEC-paquete-8c.md`):
  1. **El acople de los `hook-*` con `hooks-lib`** (h12 de raíz: rt-1/2/3/8/9 del red team). Es nivel completo, porque rediseña cómo
     espera y resuelve el actualizador. Hoy no le pega a ningún proyecto real.
  2. **`secretos.cjs` no frena leer un `config.local.ini`** (h9). Su lista cubre `.env`, `.env.*`, `*.pem` y `*.key`, y el deny cubre
     solo los `.env` del principal. La copia al worktree ya filtra desde la `rc.6`. Es un freno: va con red team.
  3. **`/director` (7.983 B) y `/cierre` (7.994 B) quedaron al borde del tope de 8.000.** La próxima línea no entra: hay que recortar o
     mover a un anexo.
  4. **`resolver director-obrero nueva` en un repo con `scripts: no`** no avisa que faltan scripts, githooks y `hooks-lib`, y
     `/director` se rompe en el paso 1. Es MEDIO-6 del chequeo frío. A Hermes no le pega (`scripts: molde`).
  5. BAJOS:
     - el commit de `resolver` dice "inicio:" para cualquier pieza (`actualizar.cjs:1119`);
     - `barreras` sobre el rango de la adopción avisa "candado apagado" porque lee la ficha de la base (`candado.cjs:532`).
  6. **Dos agentes con el mismo `name:`** después de `--agentes renombrar`: NO VERIFICADO si Claude Code se confunde. La línea le pide
     a Guido que cambie el `name:`.
  7. **NO VERIFICADO de la `rc.6`**:
     - EnterWorktree y la pestaña con una sola ventana: **visto en uso real (2026-11-05, Guido, captura)**. En Hermes, el director
       de cashflow corre en la extensión de VS Code con una sola ventana, y la extensión marca "This session is in worktree
       `modulo--cashflow`" con el botón "Open worktree". Sigue NO VERIFICADO si los permisos del worktree (el deny del `.env`) son
       los que rigen en esa sesión;
     - el obrero de cierre lanzado por un director de verdad;
     - gitleaks de la historia en un repo grande (plazo de 120 s);
     - la firma de yarn, que sale del manual;
     - D8r.1-5 y D8r.2-5;
     - D8r.4-3: `traer-main` con los githooks puestos.
  8. **D8r.2-6**: un repo de prueba parecido a Hermes, antes de R2.
  9. **Hermes, cuando le llegue la `rc.6`**: su próxima sesión resuelve `scripts` y `director-obrero`. Son mezclas de tres vías, porque
     tiene adaptados `/director`, `/obrero` y `estado.cjs`.

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
- [x] La migración del `CAMBIOS.md` de Hermes (al adoptar Desktop) — **D7.1, sobre un clon**: 103 CM, `verificar` verde; en el repo real, al adoptarlo
- [ ] Que las `allow` estrechas se resuelvan antes del clasificador del modo `auto`
- [ ] Que la skill del Arquitecto sostenga la entrevista sin perder el hilo del director
- [ ] Que no aparezca el pop-up en VS Code ante lo AUTORIZADO
- [ ] Que un aviso sin novedad sea cero texto
- [ ] Los topes numéricos (handoff, hook, spec, mesa, contexto), calibrados con el mes
- [ ] Que la plataforma cuente caracteres como JS para el corte de 10.000
- [x] Cuánto cuesta el banner por proyecto — **nada**: lo arma `portada.cjs`, siempre (D7.1; Guido, 2026-11-02)
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
- [x] 3 · Sin sello, `ready` se niega — **2026-10-31, D5.1: la parada de `/obrero`** (`claude.exe -p` 2.1.312, lanzado por el director con la línea de
  fondo de `encargo.cjs autorizado`, `acceptEdits`, en un clon de `alfa`, encargo apuntado a un spec sin sello): "presentar: no — spec sin Arquitecto:
  corré Modo B", PARADA **sin commit, sin push y con el árbol limpio**, en 51 s; `presentar` con 1 en casos sí/no (sin sello, cambiado, sin READY) y
  mutación 20/22 en ese chequeo. *Antes, D4.1: la mitad de `ready` (niega sin sello, con sello inválido o con el spec cambiado; mutación 72/75)*
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
- [x] 9 · "Poné al día la flota" devuelve una tabla por repo — **2026-11-02, D6.2: `actualizar.cjs flota alfa beta gama` sobre copias de los remotos de prueba y un canónico `bare` con `v3.0.0-rc.1`**: una fila por repo, `alfa` y `beta` mezclados en un commit, `gama` salteado por `modulo/x`; y `gama` v2.4.2 puro → 3.0.0 con las nueve ✅ de `chequear` y mezclado (17,6 min). Falta, del piloto: con un repo real (fila 4 del delta)
- [ ] 10 · Adoptar un repo viejo con un OK — *D6.2: `adoptar --mirar` no toca nada y `--aplicar` deja ficha de fábrica, `/inicio`, `/cierre`, hook con tope y barreras con `barreras` verde (pruebas sobre un v2.4.2 sin ficha, 12 + RF-fix). Falta: la pantalla con Guido delante en un repo real (el piloto)*
- [ ] 11 · La lista cerrada de lo que se frena, también en bypass — *D3.3: los hooks del paquete 3 registrados en el molde (G7) y
  vivos en `claude.exe -p` en bypass (G13); falta la pestaña real y los hooks por PC instalados (Guido)*
- [ ] 12 · Los cambios de método de clase 2 quedan en `.claude/cambios/` — *D2.2: el script es el único camino (el `Write` a `cambios/`
  negado en `-p`), un `3-barrera` queda `propuesto` con su línea de "te espera" y `barreras` da rojo sin el sellado (caso a mano en `alfa`);
  falta que un agente aplique uno de clase 2 en una sesión real*
- [ ] 13 · La mesa escribe el archivo antes del mensaje — *D5.2: `mesa nuevo` escribe, commitea y sube el archivo y recién después imprime el aviso
  (si el push falla, sale 1 sin aviso); G §19 reproducida entre dos clones con remotos `bare`. **Falta**: una mesa real entre dos sesiones (`SendMessage`), el piloto*
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
  sello a mano o de otra carpeta → rojo. **D5.2**: el resumen del día lista los `aprobado` del día con quién los corrió (prueba: el de hoy sí, el de
  ayer no). **Falta**: la ventana en una pestaña real de Guido (bypass con `claude.exe`: ✅ D3.3, G13)*
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
| 2026-11-02 | **El paquete 5 pasa de 2 a 3 directores: D5.3** lleva solo el corrector de afirmaciones (K5, P6.10 segunda mitad), (primero pensado en `clientes`; corregido el mismo día: corre en cualquier PC, el historial que mide es el git de Hermes, que se clona de GitHub) | Su "hecho cuando" es medirlo contra el historial de Hermes antes de instalarlo; D5.2 hizo todo lo demás en ~2 h y no lo intentó sin poder medirlo (el corte que el delta ya preveía, D5-1). No traba a D6.1 |
| 2026-11-02 | **El paquete 6 cierra en D6.2 con el adoptador adentro** (no hizo falta D6.3) | Los seis encargos de construcción entraron en ~2,5 h de dos Opus a la vez; el adoptador (F4) corrió en paralelo con la fusión (F3). Decidido sin Guido |
| 2026-11-02 | **La fusión de piezas adaptadas no se corta en D6.2 y suma "te espera" con una pregunta (D6-19, opción C)** | Guido, al leer D6.1: "muchas skills van a terminar siendo adaptadas y no quiero que por eso después no se actualicen". El corte del delta dejaba la fusión en "no fusiona y avisa", que es justo eso. Descartadas: solo automático (sin porqué queda vieja) y preguntar siempre (demasiados clics) |
| 2026-11-02 | **El paquete 6 pasa a dos directores** (D6.1 la PC y el núcleo del actualizador; D6.2 la flota de punta a punta y el adoptador) | No entraba en ~4 h y ~8 encargos (ADR-029): delta, red team, revisor frío y arreglos ya son 4. El "el chequeo antes que la mezcla" del SPEC-0 marca el corte. Decidido sin Guido en el delta (D6.1) |
| 2026-11-03 | **Sin piloto de prueba en Deptos: la prueba es en un proyecto de verdad** (el que se recomendó: **Hermes Desktop**, con un módulo nuevo; Mobile no, su formato de cambios no se exploró). El orden pasa a: D8.1 → **Guido repasa las decisiones sin él** (la página en criollo que armó D8.1) → release (el tag) → el proyecto real → se ajusta lo que haga falta. **A cerrar con Guido al volver de D8.1**: el proyecto exacto, si el tag va antes o después del primer módulo, y cómo queda el paquete 8½ (las llaves de ese proyecto, no de Deptos). Hasta entonces, el SPEC-0 (orden 9) y las filas D9.1/D9.2 no se tocan |
| 2026-11-03 | **Cerrado con Guido** (el repaso, en el chat de D8.1): la prueba es **Hermes**, con el proyecto nuevo que arranca el 2026-11-04. Orden: **paquete 8b** (lo que dejó el repaso: los 17 renglones de "El repaso con Guido" en `DECISIONES-SIN-GUIDO-en-criollo.md`, los que dicen "delta") → **beta `v3.0.0-rc.1`** → con Guido a la mañana: "preparame esta PC", las llaves y la adopción de Hermes (8½) → el módulo nuevo con el Arquitecto v3 → los arreglos como `rc.N` → `v3.0` cuando el módulo cierre bien. **La red**: si el 8b no cierra limpio o la adopción muestra algo raro, Guido arranca igual como hoy (el Arquitecto v3 ya está en su PC) y Hermes se adopta al cierre del primer tramo; la beta nunca frena su trabajo. Además, una regla nueva de Guido: lo técnico que no le cambia el día a día lo decide la sesión con la vara | Guido: "estoy próximo a arrancar en Hermes, mañana un proyecto nuevo"; el repaso dejó 9 cambios chicos que tienen que estar antes de la primera adopción real | Guido, durante D8.1: "estoy en un muy buen momento en mis proyectos […] no tengo nada grande arrancado"; Hermes solo entra en un cierre de tramo (ADR-021) y hoy lo es. "Si revisamos las decisiones y después revisamos que el proyecto más o menos salió bien, la prueba puede ser en un proyecto de verdad". Las condiciones que recomendó el director: un módulo nuevo (no migrar todo de golpe), la adopción en dos commits que se revierten, un tag de prueba y las llaves preparadas antes |
| 2026-11-03 | **Después de la rc.1, siete sesiones en orden** ("Después de la rc.1: las sesiones que siguen"): R1 la revisión integral (sin Guido, esa noche) → la mañana con Guido (el informe de R1 primero: la tanda de correcciones, lo de negocio con él; después preparar la PC y adoptar Hermes) → el diseño de los experimentos con Guido → D8c.1 la rc.2 (el obrero de cierre de tramo, los experimentos, las correcciones de R1) → la prueba real → M6b → R2 y la `v3.0`. **La sesión madre orquesta**: lanza las que no piden a Guido cuando les toca, con su visto bueno previo. Y dos criterios nuevos en la vara (ADR-034): la coherencia entre piezas, y lo técnico lo decide la sesión; la revisión integral pasa a paso fijo del ciclo | Guido, en el chat del repaso: "una revisión integral del Vibe Kit, cómo quedó esta nueva versión […] cómo interactúan entre sí las partes"; "que las cosas interactúen bien entre sí, tengan coherencia, concordancia, sean cohesivas"; "ya tenés mi visto bueno para lanzarlas […] como una especie de agente orquestador"; "no dejes pasar lo de agregar el tema de probar una feature" |
| 2026-11-03 | **La tanda de correcciones de R1 es la `rc.2` (D8r.1, sin Guido, esa misma noche)**, y **D8c.1 pasa a ser la `rc.3`** (el obrero de cierre de tramo y los experimentos). Después de D8r.1, la sesión madre vuelve a correr la revisión integral (**R1b**) y recién ahí la mañana con Guido | Guido, la noche del 03-11: "todos esos arreglos… tienen que estar resueltos inclusive en la beta. Que todas las partes interactúen correctamente entre sí". Decisión de la sesión madre, con su visto bueno |
| 2026-11-04 | **La tanda de taller de R1b es la `rc.3` (D8r.2, sin Guido)** y **D8c.1 pasa a ser la `rc.4`**. D1-D4 quedan para Guido a la mañana, con la mecánica lista; no hay una tercera revisión integral | Guido, la noche del 03-11: "no hay que hacer 800 revisiones integrales": una sola vuelta de corrección. Decisión de la sesión madre |
| 2026-11-04 | **No hay una tercera revisión integral antes de la prueba**: la próxima es R2, después del primer módulo de Hermes y contra un clon suyo; mientras, cada `rc.N` lleva su chequeo frío. Y un repo de prueba parecido a Hermes para la `rc.4` (Pendientes, "De D8r.2", 6) | R1 encontró piezas que no se hablaban; R1b, el kit contra un proyecto real (lo que los repos de juguete no muestran). Una tercera sin uso real buscaría en el mismo lugar con rendimiento decreciente: lo que falta lo muestra Hermes. Decidido con Guido el 04-11 |
| 2026-11-04 | **Una `rc.4` exprés (D8r.3) antes de D8c.1**, que pasa a la `rc.5`: `carpeta-docs:`, el arranque con el mismo nombre, el caché de Python en `barreras`, la línea `después:` y `resolver … nueva` sin informe | Guido necesitaba adoptar ya el bot de Arti (su `docs/` es el sitio de OpenClaw) y el primer `/cierre` de Hermes iba a dar rojo por 3 `.pyc`. Decisión de la sesión madre de la recta final |

| 2026-11-04 | **La `rc.5` (D8r.4) sale con la vuelta 1; la vuelta 2 y D8c.1 van a la `rc.6`** | La vuelta 1 es lo que trababa el uso de Hermes hoy (una ventana, la flota con obra, el merge de `main`); la 2 no entraba sana en la misma sesión | La sesión madre |
| 2026-11-04 | **El tope de las skills avisa, no frena, cuando lo pasa la zona propia** (la parte del kit sigue frenando) | Hermes salía ROTA en la flota por su zona propia (`/director` 13154 B) | Guido |
| 2026-11-04 | **A `main` sube solo el director (o `integrar`), nunca un obrero** (h11; el freno, en la `rc.6`) | En Hermes un obrero pusheó directo a `origin main` (con el clic de Guido, porque CC va por mensaje) | Guido |
| 2026-11-04 | **"Probar una idea nueva" (los experimentos) sale de la v3.0**: va a la próxima versión, con el buzón y un PO como skill (TODO, Misión 7). La sesión 3 de la tabla (su diseño) queda para entonces | "Vamos a sacar esta versión bien armada y en la próxima versión traemos eso de la idea nueva" | Guido |
| 2026-11-04 | **La `rc.6` es una sola, en nivel medio-alto** (`CICLO-DE-MEJORA.md` §3.6), con el cierre de tramo, h11 y la vuelta 2 juntos | "No quiero splitearlo en dos RC… si la planeamos bien, puede ser quirúrgica"; las `rc` de 4 h eran mucho | Guido |
| 2026-11-05 | **En la `rc.6`, la suite corre en paralelo con el chequeo frío** (el revisor casi solo lee) y la primera vuelta de la flota se reusa de la `rc.5`. El tag, siempre después de la suite | Guido la quería en ~1,5 h. La suite encontró rojas reales en la `rc.4` (1), la `rc.5` (2) y el chequeo frío de la `rc.6` (1 ALTO): no se taggea antes | La sesión madre |
| 2026-11-10 | **La v3.0 ya no espera a que cierre el primer módulo de Hermes: la prueba real es Deptos (sus dos noches) más lo que ya mostró Hermes.** El camino: (1) la `rc.7` de taller, sin Guido, con lo medido de la primera noche que no depende del loop ("De la prueba real", 20-24, 28-31; el 25 aparte, porque es un freno y pide red team); (2) la segunda noche de Deptos (módulo `cola`, ya lanzada); (3) M6b, corta, con Guido; (4) R2 contra un clon de **Deptos** y el tag `v3.0` con el OK de Guido. **La cola (17) y el cierre de noche (18) van a la v3.1**, con el buzón y "probar una idea nueva", salvo que la segunda noche muestre que son baratos. Deptos no se actualiza hasta que termine su segunda noche (si no, la prueba deja de medir lo que mide). Las filas 5-7 de "Después de la rc.1" cambian con esto | "El tema con cashflow es que está avanzando muy lento, no creo terminarlo este mes, porque necesito otras cosas, no por el kit en sí". Hermes ya dio la evidencia de las `rc.4`-`rc.6` (adoptar, una ventana, la obra); le falta un módulo cerrado, y Deptos lo dio de punta a punta (sellado, repartido, verificado, integrado y publicado), de noche | Guido |

## Lecciones (insumo de la misión 6)

- 2026-11-04/05 · **Las `rc` del uso real: dos tandas pesadas a la vez en una PC se frenan las dos.** La suite de la `rc.4` tardó 102 min
  contra unos 50 porque las pruebas de la `rc.5` corrían al lado, y salieron rojas de carga. Desde ahí, las tandas van en fila y cada
  `rc` paga el control que pide su riesgo (`CICLO-DE-MEJORA.md` §3.6). **Y la suite entera nunca dio solo verde**: rc.4 1 real, rc.5 2
  reales (una vieja: `/estado` después de las 18 h); el chequeo frío de la `rc.6` encontró que el gate del cierre de tramo daba rojo
  siempre. Por eso el tag va después de la suite, aunque apure.

- 2026-11-04 · **R1b: la revisión que corrió sobre un clon del proyecto real encontró lo que tres revisores sobre repos de juguete no
  vieron** (el director propio de Hermes, su `venv`, la carpeta dos niveles abajo y un gate que daba verde sin correr). Los repos de
  prueba prolijos prueban que las piezas encajan entre sí, no que encajan con un proyecto de verdad: desde acá, toda revisión integral y
  todo revisor frío corre también contra un clon real (o un repo de prueba que se le parezca). Y un freno se prueba con la forma en que
  el proyecto escribe sus comandos, no solo con los casos que imaginó el que lo construyó.

- 2026-11-02 · **D5.2: fijar el contrato entre dos encargos antes de repartir dejó correr cuatro a la vez.** El director escribió en los dos encargos
  la primera línea de `contexto.cjs` que iba a leer `/estado`; K1 y K2 corrieron en paralelo sin hablarse y encajaron al mergear. Lo mismo con
  `mesa.cjs acordados` para el resumen. Con eso, seis piezas de construcción entraron en ~1 h de reloj (contra ~3 h de D5.1 por la mitad).
- 2026-11-02 · **D5.2: el revisor frío encontró que la noche no terminaba nunca**, con todas las pruebas verdes: cada pieza estaba bien y lo que fallaba
  era el recorrido entre dos (`me-voy` escribe en un lugar, `/inicio` mira en otro). Las pruebas de cada encargo prueban su pieza; el recorrido de
  punta a punta lo ve el que lee todo junto, o una sesión real del día entero.

- 2026-10-31 · **D5.1: la sesión real encontró lo que ninguna prueba podía ver.** Las dos corridas del obrero mostraron que Claude Code **ignora las
  `deny` con `Write(...)`** (las del molde desde el paquete 2), y la fila 2 mostró que `/director` no ponía el spec en `COMPLETO` antes de `integrar`. Ninguna
  de las dos la vio el red team ni el revisor frío (leen texto y código, no lo que dice la plataforma al arrancar). Las corridas reales valen por los
  avisos de la plataforma tanto como por el resultado: **leer el log entero, no solo el final**.
- 2026-10-31 · **D5.1: una pausa planeada no costó nada.** Guido avisó 30 min antes; los dos Opus commitearon WIP en 6 min y al volver se retomaron con
  un mensaje, sin relanzar. Lo que lo hizo barato: cada encargo en su worktree y su rama, y la fila del tracker en 🔨 con lo que faltaba.
- 2026-10-31 · **D5.1: pasarle al revisor frío el encargo que faltaba, en la misma vuelta**, rindió: revisó E1, E3 y E4 mientras E2 se construía,
  tres de sus notas entraron a E2 antes de que terminara, y los arreglos fueron un solo encargo.

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
