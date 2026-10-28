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
**Si el contexto del director pasa la mitad** antes de terminar, cierra con lo hecho y el paquete sigue con un director nuevo.

**Modelos** (decisión de Guido, 2026-10-27): director, red team, revisor frío y encargos de riesgo en **Opus**; encargos mecánicos en
**Sonnet**. **Fable** solo en la sesión donde Guido decide algo nuevo.

## El estado, de un vistazo

| Paquete | Qué | Directores | Estado |
|---|---|---:|---|
| 0 | Misión 4½: ordenar la casa, `v2.4.3` | 1 | ✅ 2026-10-27 |
| 1 | La ficha del kit, el parser, `kit/VERSION`, los repos de prueba | 1 | ✅ 2026-10-28 ([`SPEC-paquete-1.md`](SPEC-paquete-1.md)) |
| 2 | Documentos con tope, hook en node, candado, `cambios`, `/inicio` y `/cierre` v3, **la zona propia (P3.2)**, `pruebas/pedidos.md` | 2 | ⬜ |
| 3 | Seguridad: corrector de secretos, barreras, hooks por PC, `doctor` mínimo | 1 | ⬜ |
| 4 | El Arquitecto v3, el script `worktree`, el sello, `formato-spec.md` | 1 | ⬜ |
| 5 | Director/obrero, `/estado`, resumen del día, la mesa, subagentes | 2 | ⬜ |
| 6 | Equipador v3, actualizador, adoptador, `doctor` completo | 1 | ⬜ |
| 7 | El ciclo de `cambios` (flota, migración de Hermes) y la portada | 1 | ⬜ |
| 8 | El observatorio mide la línea base; playbook, guía y manuales al día | 1 | ⬜ |
| 8½ | Deptos prepara sus credenciales (**lo hace Guido**, sin director) | 0 | ⬜ |
| 9 | Piloto en Deptos, un mes; después Hub y Portal | 2 en la madre | ⬜ |
| 10 | Tag `v3.0` y nota de migración | 1 | ⬜ |
| | **Total** (sin el 0, ya hecho) | **13** | |

Estado: ⬜ sin empezar · 🔨 en curso · ✅ cerrado (con fecha) · ⏸️ frenado (con razón).

## Los directores

Título de cada sesión: `vibe-kit M5 · D<paquete>.<n> · <qué hace>`. La fila se llena en el `/cierre` de ese director. En "Encargos",
cuántos lanzó y en qué modelo (por ejemplo `4 Sonnet · 2 Opus`): es la medida de la misión 6.

| Director | Qué lleva | Fecha | Chat | Encargos | Commit | Resultado |
|---|---|---|---|---|---|---|
| D1.1 | Paquete 1 entero: spec delta (Guido sella), ficha, parser, `VERSION`, `pruebas/rehacer.sh` | 2026-10-28 | `vibe-kit M5 · D1.1 · Paquete 1: la ficha del kit y su parser` | 5 Sonnet · 1 Opus (revisor frío) | `68b75e1`…`16f7cb2` | ✅ Criterios 1-8 del delta verificados por el director; parser con 255 pruebas y 0 mutantes vivos en las reglas; el revisor frío cambió la gramática antes de congelarla (3 ALTOS) y Guido decidió `herramientas` aparte |
| D2.1 | Paquete 2, primera mitad: spec delta + red team, `docs/` en capas, handoff y TODO con tope, hook node | | | | | |
| D2.2 | Paquete 2, segunda mitad: candado, `cambios` base y su sello, la zona propia (P3.2), `/inicio` y `/cierre` v3 con `pedidos.md`, revisor frío | | | | | |
| D3.1 | Paquete 3: spec delta + red team (obligatorio), corrector, barreras, hooks por PC, `doctor` mínimo | | | | | |
| D4.1 | Paquete 4: spec delta + red team, Arquitecto v3, sello, `formato-spec.md`, `worktree` y `.kit-rol` | | | | | |
| D5.1 | Paquete 5, primera mitad: spec delta + red team, el canon director/obrero y sus correctores | | | | | |
| D5.2 | Paquete 5, segunda mitad: `/estado`, resumen del día, subagentes, `CLAUDE.md` por criterios, la mesa | | | | | |
| D6.1 | Paquete 6: Equipador v3, actualizador, adoptador, `doctor` completo, "toda la flota" en los repos de prueba | | | | | |
| D7.1 | Paquete 7: el ciclo de `cambios` y la portada | | | | | |
| D8.1 | Paquete 8: medir la línea base; playbook, guía, manuales | | | | | |
| D9.1 | Arrancar el piloto en Deptos | | | | | |
| D9.2 | Medir el mes del piloto contra TABLERO §1 | | | | | |
| D10.1 | Tag `v3.0` y nota de migración | | | | | |

## Pendientes de cada paquete

Lo que una sesión dejó a medias, con qué falta. Se borra cuando se hace (queda en el CHANGELOG).

- **Paquete 1 · que un hook que lee una ficha rota frene** (SPEC-paquete-1, "Lo que se prueba más adelante"): el parser sale con 1;
  el freno se prueba en los órdenes 2 y 3, cuando existan los hooks.
- **Paquete 1 · menor**: una ficha en Latin-1 da "valor inválido" (sin eco) en vez de "guardala en UTF-8". Se arregla si aparece en la flota.

## NO VERIFICADO, para tachar

El detalle y cómo se prueba cada uno, en la sección "NO VERIFICADO" del spec. Se tacha con `[x]`, la fecha y la sesión que lo probó;
si falla, se anota qué pasó y va a "Pendientes".

**En la construcción** (los prueba la sesión del paquete):
- [ ] Orden 2 · Que una escritura por script de node a `.claude/` no pregunte de día, también dentro de `.claude/worktrees/` — **E0 de D2.1,
  2026-10-28, `claude.exe` 2.1.309 en `-p`**: en `default` y `acceptEdits`, desde la raíz y desde `.claude/worktrees/w1/`, el script
  escribió y el control (`Write` directo a `.claude/`) quedó negado ("sensitive file") → **pasa; `.kit/` no hace falta**. En `auto` el
  control también escribió: no concluyente → falta la fila 6 de "Lo prueba una sesión real" del delta, en modo `auto`
- [x] Orden 2 · Que el hook `SessionStart` no corra en los subagentes — 2026-10-28, E0 de D2.1 (`-p`, 2.1.309): un subagente lanzado y
  terminado, el hook corrió una vez por fuente y solo para la sesión principal (mismo `session_id`; la entrada no trae marca de subagente)
- [ ] Orden 3 · `onFailure: "block"` en VS Code y en Windows sin Git Bash (los cuatro casos de falla, en las dos PCs)
- [ ] Orden 3 · Que el `.js` de un hook se relea en cada llamada y que un `deny` con ruta absoluta ande en Windows
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
- [ ] 6 · `/cierre` encuentra lo suelto, lo roto y lo pasado de tope
- [ ] 7 · Sin pop-up ante lo AUTORIZADO
- [ ] 8 · El director no escribe ante un aviso sin novedad
- [ ] 9 · "Poné al día la flota" devuelve una tabla por repo
- [ ] 10 · Adoptar un repo viejo con un OK
- [ ] 11 · La lista cerrada de lo que se frena, también en bypass
- [ ] 12 · Los cambios de método de clase 2 quedan en `.claude/cambios/`
- [ ] 13 · La mesa escribe el archivo antes del mensaje
- [ ] 14 · Ninguna skill con rutas absolutas, sesiones, ramas ni SHAs
- [ ] 15 · Lo `sensible:` pregunta solo en el paso que lo toca
- [ ] 16 · Si un hook que niega falla, la acción se frena
- [ ] 17 · Un obrero que edita sus frenos no se los saca
- [ ] 18 · `cambios aprobar` se niega desde un worktree de obrero
- [ ] 19 · Una migración a `real` sin veredicto del revisor no corre
- [ ] 20 · El actualizador respeta la zona propia de cada `settings.json`

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
| 2026-10-28 | **Un director Opus por paquete con subagentes** en vez de una sesión por paso: de ~18-21 sesiones a 13 directores; los encargos mecánicos vuelven a Sonnet | ADR-028: propuesta de Guido (un orquestador para todo el spec), acotada a uno por paquete |

## Lecciones (insumo de la misión 6)

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
