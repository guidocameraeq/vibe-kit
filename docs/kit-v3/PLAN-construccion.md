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
3. **Red team** si toca permisos, secretos o datos (paquetes 2 a 5 seguro): subagente Opus con el agente `redteam-spec`, hasta 3 rondas.
   Lo que vuelva como decisión de diseño **se lo lleva a Guido**; lo demás lo integra. Los informes al repo privado.
4. **Encargos**: el director parte el paquete. Cada encargo dice **qué archivos puede tocar, qué prueba tiene que pasar y qué no se
   toca**. **Sonnet** para lo mecánico (parsers, pruebas, documentos, plantillas); **Opus** para hooks, seguridad, permisos y lo que
   decide. Dos encargos en paralelo solo si no comparten archivos, cada uno en su worktree; si no, uno detrás del otro.
5. **Revisar**: el director **lee cada diff y corre las pruebas él mismo**. El resumen del subagente no es evidencia. Si un encargo
   falla, se rehace con lo aprendido o va a "Pendientes"; nunca se tapa.
6. **Pruebas que un subagente no puede hacer** (un chat nuevo para ver el hook, un pop-up de VS Code, la segunda PC): el director las
   lista en "Pendientes" con qué hay que mirar, y se hacen en una sesión real (la del director siguiente, o Guido).
7. **Revisor frío** al cerrar: subagente Opus sin contexto, sobre el diff entero del paquete.
8. **Cerrar**: `kit-sync.sh sync` LIMPIO, los `✅ <fecha>` en el spec, la línea en el CHANGELOG, este tracker al día, `/cierre`.

**Límites**: un subagente no lanza otros subagentes ni le puede preguntar a Guido: todo lo que necesite una decisión vuelve al
director. **El director no edita código**: si se encuentra arreglando a mano, el encargo estaba mal escrito y se reescribe.
**El director no corta por contexto: termina su fila** (Guido, 2026-10-29: D1.1 y D2.1 cerraron con mucho contexto de sobra, y D2.1
propuso partir con 26% usado). Si la app compacta, relee este tracker y su delta antes de seguir editando.

**Modelos** (decisión de Guido, 2026-10-27): director, red team, revisor frío y encargos de riesgo en **Opus**; encargos mecánicos en
**Sonnet**. **Fable** solo en la sesión donde Guido decide algo nuevo.

## El estado, de un vistazo

| Paquete | Qué | Directores | Estado |
|---|---|---:|---|
| 0 | Misión 4½: ordenar la casa, `v2.4.3` | 1 | ✅ 2026-10-27 |
| 1 | La ficha del kit, el parser, `kit/VERSION`, los repos de prueba | 1 | ✅ 2026-10-28 ([`SPEC-paquete-1.md`](SPEC-paquete-1.md)) |
| 2 | Documentos con tope, hook en node, candado, `cambios`, `/inicio` y `/cierre` v3, **la zona propia (P3.2)**, `pruebas/pedidos.md` | 2 | ✅ 2026-10-29 (D2.1 y D2.2; lo que espera a Guido, en Pendientes) ([`SPEC-paquete-2.md`](SPEC-paquete-2.md)) |
| 3 | Seguridad: corrector de secretos, barreras, hooks por PC, `doctor` mínimo | 3 | 🔨 D3.1 y D3.2 hechos (en `main`: G2-G6, G8, G9); sigue D3.3 (G7, G10-G13, revisor frío) |
| 4 | El Arquitecto v3, el script `worktree`, el sello, `formato-spec.md` | 1 | ⬜ |
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
| D3.3 | Paquete 3, cierre: G7, G10, G11, G12, G13, revisor frío, `/cierre` completo | | `vibe-kit M5 · D3.3 · Paquete 3, cierre: githooks, instalador, doctor, sesión real, revisor frío` | | | |
| D4.1 | Paquete 4: spec delta + red team, Arquitecto v3, sello, `formato-spec.md`, `worktree` y `.kit-rol` | | | | | |
| D5.1 | Paquete 5, primera mitad: spec delta + red team, el canon director/obrero y sus correctores | | | | | |
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
- **Paquete 3 · lo que sigue es D3.3** (G7, G10, G11, G12, G13, el revisor frío y el `/cierre`; los briefs en "Los encargos" del delta). En
  `main` ya están G2-G6, G8 y G9 (D3.1 y D3.2). **El corpus del historial no viaja** (tiene secretos reales): en `Usuario` vive en
  `C:\Users\Usuario\vibe-historial\` (16.470 llamadas únicas; no se compara contra las cifras de `clientes`).
- **Paquete 3 · de D3.2, para D3.3** (lo que dejaron G3-G6 y es de otro encargo): (a) **G7** registra `git-seguro` y `sensible` en
  `settings.json` en forma exec con `timeout: 20` y `onFailure: "block"`: la prueba "sin node" de `git-seguro.test.cjs` se activa sola y lo
  exige; (b) **G7, el runner del pre-push**: `--rango` sale 2 si el remoto tiene un sha que esta PC no (remoto adelantado, force push) → tiene
  que darlo como rojo con motivo; y un `aprobado` que vive solo en la rama que se pushea (no en `HEAD`) da un rojo de más: correrlo con esa
  rama, o aceptarlo; (c) **G10** registra `secretos` (el caso "sin node" depende de ese registro); (d) **G13/revisor frío**: `frenos-del-proyecto`
  y `salir-del-worktree` no se midieron contra el historial con rol obrero (forzar el `cwd` vuelve todo `cd` "otro repo"): medirlos con el
  `cwd` real de cada llamada, o en la sesión real; (e) **NO VERIFICADO**: los regex de los cinco de `block_secrets.ps1` en `secretos.cjs`
  son los del WIP de D3.1; cruzarlos contra el archivo de `clientes` en esa PC; (f) `secretos` no cubre un heredoc sin comillas que imprime
  `$X` en el cuerpo; (g) la huella del caché de `sensible` no sigue los `include.path` (git-seguro niega escribirlos).
- **Paquete 3 · de D3.2, fuera del paquete** (vienen de antes de G6): la exención (b) de `barreras` compara solo `frenos`, `sensible` y
  `autorizado`, así que la ficha puede nacer con `publicas:` cargado sin `aprobado` (es la adopción; gramática de D2.2); y `barreras` a secas
  en un repo sin ningún commit da rojo con la ficha de fábrica. Decidir en el revisor frío de D3.3 si se tocan.
- **Paquete 3 · de D2.2**: (a) `KIT_PLAZO_ARRANQUE_MS` en `doctor` (era la (d) de D2.1); (b) el pre-commit corre `estructura.cjs` **desde
  la versión de `origin/<rama por defecto>`**, no la del disco (r4-3: un candado editado y corrido en el mismo commit se aprueba solo); (c)
  `niega-aprobar.cjs` en `bypassPermissions` **no se probó con `claude.exe`**: el clasificador del modo `auto` frenó lanzar una sesión en bypass
  ("Create Unsafe Agents") y F3 lo probó con `dontAsk`, que va por el mismo camino; en bypass lo cubren las pruebas; (d) del revisor frío
  de D2.2: el hook de git de 4.4 suma `git update-index` (skip-worktree), `git reset`/`rebase` de la rama por defecto (rf-16) y `cd` al checkout
  principal desde un worktree (rf-5); en el pre-commit, lo pendiente de `barreras` es solo el índice (rf-10); y lo ya pusheado se juzga en un
  pre-push (rf-7).
- **Paquete 4 · de D2.2: los diez pedidos de P5.1 dieron 6 de 10** (`claude.exe -p` 2.1.309, `--permission-mode plan`, dos corridas por
  pedido, mismo veredicto). Los 4 chicos y los 2 con director, bien; **los 4 "módulo solo" invocan `/arquitecto` (la conducta correcta) pero
  sin escribir antes la línea del tamaño**, aunque la skill lo pide "antes de cualquier herramienta"; y los chicos la dicen al final, no al
  principio. *Arreglo propuesto para el orden 4*: que el Arquitecto v3 abra diciendo "esto es más que chico: …" como primera línea (es el
  que siempre llega). Evidencia: `pedidos/v2/` del scratchpad de D2.2 (no se guarda). El criterio 2 del kit queda sin tildar.
- **Paquete 6 · de D2.2 (F4)**: la exención (a) de `barreras` da rojo con una regla de `settings` que el molde nuevo retira, porque sin el
  molde viejo no la distingue de una propia: el actualizador tiene que pasarle también el molde viejo. Y la correspondencia de
  `.githooks/**` y gitleaks con el molde es provisoria (el molde todavía no los trae; orden 3).
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
- [ ] Orden 4 · Que `.kit-rol` se escriba y se lea bien desde la extensión de VS Code y desde PowerShell
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
- [ ] 2 · El tamaño del pedido dicho en una línea
- [ ] 3 · Sin sello, `ready` se niega
- [ ] 4 · El Arquitecto deja el commit del módulo en `main`
- [ ] 5 · El hook inyecta ≤ 9.700, con huella, edad y CORTADO
- [ ] 6 · `/cierre` encuentra lo suelto, lo roto y lo pasado de tope — *D2.2: el candado lo encuentra, frena y anota (pruebas de
  `estructura.cjs` y `todo` 0 en `alfa`/`beta`); falta ver una sesión real que corra el `/cierre` del molde y no commitee encima*
- [ ] 7 · Sin pop-up ante lo AUTORIZADO
- [ ] 8 · El director no escribe ante un aviso sin novedad
- [ ] 9 · "Poné al día la flota" devuelve una tabla por repo
- [ ] 10 · Adoptar un repo viejo con un OK
- [ ] 11 · La lista cerrada de lo que se frena, también en bypass
- [ ] 12 · Los cambios de método de clase 2 quedan en `.claude/cambios/` — *D2.2: el script es el único camino (el `Write` a `cambios/`
  negado en `-p`), un `3-barrera` queda `propuesto` con su línea de "te espera" y `barreras` da rojo sin el sellado (caso a mano en `alfa`);
  falta que un agente aplique uno de clase 2 en una sesión real*
- [ ] 13 · La mesa escribe el archivo antes del mensaje
- [x] 14 · Ninguna skill con rutas absolutas, sesiones, ramas ni SHAs — 2026-10-29, D2.2: `candado:datos` verde sobre las skills del molde
  instaladas en `alfa` y `beta` (`estructura.cjs todo` 0), con casos sí/no en sus pruebas
- [ ] 15 · Lo `sensible:` pregunta solo en el paso que lo toca
- [ ] 16 · Si un hook que niega falla, la acción se frena
- [ ] 17 · Un obrero que edita sus frenos no se los saca — *D2.2: su commit da rojo en `barreras` (prueba) y los hooks leen la ficha de la
  rama por defecto (D2.1); que el corrector frene la edición misma de los hooks es del orden 3 (4.3)*
- [ ] 18 · `cambios aprobar` se niega desde un worktree de obrero — *D2.2: se niega con cada `.kit-rol` de agente, por nombre y por ruta,
  fuera del principal y fuera de la rama por defecto (pruebas); el hook niega en `dontAsk` (`claude.exe -p`) y bypass (pruebas), y en `auto` pregunta (Guido, 2026-10-29);
  sello a mano o de otra carpeta → rojo. **Falta**: la ventana en una pestaña real de Guido, bypass con `claude.exe`, y el resumen del día
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
| 2026-10-28 | **Un director Opus por paquete con subagentes** en vez de una sesión por paso: de ~18-21 sesiones a 13 directores; los encargos mecánicos vuelven a Sonnet | ADR-028: propuesta de Guido (un orquestador para todo el spec), acotada a uno por paquete |

## Lecciones (insumo de la misión 6)

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
