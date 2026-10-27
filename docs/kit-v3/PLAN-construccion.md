# Plan de construcción del kit v3 — el tracker de la misión 5

> **Qué es**: la vista de una pantalla de la misión 5. **El plano es [`SPEC-0-kit-v3.md`](SPEC-0-kit-v3.md)**: qué se construye, el
> orden, la prueba de cada pieza. Esto lleva **por dónde vamos**: qué sesión hizo qué, qué quedó a medias, qué se verificó.
> Lo pidió Guido el 2026-10-27, al ver que eran ~20 sesiones: "para hacerlo en secuencia, hacerlo bien, que no se pase nada por alto".
>
> **Reglas**:
> - **Cada sesión de la misión 5 abre leyendo esto** (el `/inicio`), y **lo actualiza en su `/cierre`**: su fila, las piezas, los
>   NO VERIFICADO y criterios que tachó. El spec solo recibe los `✅ <fecha>` de sus piezas (sección "Ejecución").
> - **Una sesión = un paso de una fila.** Si un paso no entra, se parte en dos filas; nunca se sigue en el mismo chat.
> - **Lo que no se hizo se escribe**: si una sesión deja algo a medias, va a "Pendientes del paquete" con qué falta. Nada vive solo en
>   el handoff.
> - **Si el plan cambia** (un paquete necesita otra sesión, algo se reordena), se cambia acá con la razón en "Cambios al plan".

## Cómo se trabaja cada paquete

1. **Spec delta** (`docs/kit-v3/SPEC-paquete-<N>.md`, formato SPEC-0/delta): qué piezas, qué NO SE TOCA, cómo se prueba.
   Los de los paquetes 1 a 3 **los sella Guido a mano**; desde el 4, el script del sello.
2. **Red team** si toca permisos, secretos o datos (paquetes 2, 3, 4 y 5 seguro): Opus, hasta 3 rondas. Los informes al privado.
3. **Construir**: pieza en `kit/`, prueba en el repo de prueba de `pruebas/`, `kit-sync.sh sync` LIMPIO.
4. **Revisor frío** al cerrar el paquete (Opus, sin contexto).
5. **Cerrar el paquete**: los `✅ <fecha>` en el spec, la línea en el CHANGELOG, esta tabla al día, `/cierre`.

**Modelos** (decisión de Guido, 2026-10-27; corrige la línea de Sonnet del spec): **la construcción en Opus**, porque esto define cómo
se codea los próximos meses. Red team y revisor frío en Opus. **Fable** solo en la sesión donde Guido decide algo nuevo.

## El estado, de un vistazo

| Paquete | Qué | Sesiones (estimadas) | Estado |
|---|---|---:|---|
| 0 | Misión 4½: ordenar la casa, `v2.4.3` | 1 | ✅ 2026-10-27 |
| 1 | La ficha del kit, el parser, `kit/VERSION`, los repos de prueba | 1 | ⬜ **el próximo** |
| 2 | Documentos con tope, hook en node, candado, `cambios`, `/inicio` y `/cierre` v3 | 3 | ⬜ |
| 3 | Seguridad: corrector de secretos, barreras, hooks por PC, `doctor` mínimo | 2-3 | ⬜ |
| 4 | El Arquitecto v3, el script `worktree`, el sello, `formato-spec.md` | 2-3 | ⬜ |
| 5 | Director/obrero, `/estado`, resumen del día, la mesa, subagentes | 3-4 | ⬜ |
| 6 | Equipador v3, actualizador, adoptador, `doctor` completo | 2 | ⬜ |
| 7 | El ciclo de `cambios` (flota, migración de Hermes) y la portada | 1 | ⬜ |
| 8 | El observatorio mide la línea base; playbook, guía y manuales al día | 1 | ⬜ |
| 8½ | Deptos prepara sus credenciales (**lo hace Guido**, sin sesión de construcción) | 0 | ⬜ |
| 9 | Piloto en Deptos, un mes; después Hub y Portal | 2 en la madre | ⬜ |
| 10 | Tag `v3.0` y nota de migración | 1 | ⬜ |
| | **Total** | **~18-21** | |

Estado: ⬜ sin empezar · 🔨 en curso · ✅ cerrado (con fecha) · ⏸️ frenado (con razón).

## Las sesiones

Título de cada sesión: `vibe-kit M5 · P<paquete>.<n> · <qué hace>`. La fila se llena en el `/cierre` de esa sesión.

| Sesión | Qué hace | Fecha | Chat | Commit | Resultado |
|---|---|---|---|---|---|
| P1.1 | Spec delta del paquete 1 (Guido lo sella) y construcción: ficha, parser, `VERSION`, `pruebas/rehacer.sh` | | | | |
| P2.1 | Spec delta del paquete 2 + red team | | | | |
| P2.2 | Construir: `docs/` en capas, handoff y TODO con tope, hook node (huella, edad, CORTADO) | | | | |
| P2.3 | Construir: el candado, `cambios` base y su sello, `/inicio` y `/cierre` v3; revisor frío | | | | |
| P3.1 | Spec delta del paquete 3 + red team (toca permisos: obligatorio) | | | | |
| P3.2 | Construir: corrector de secretos, barreras, hooks por PC, `doctor` mínimo; probar en las dos PCs; revisor frío | | | | |
| P4.1 | Spec delta del paquete 4 + red team | | | | |
| P4.2 | Construir: el Arquitecto v3, el sello, `formato-spec.md` | | | | |
| P4.3 | Construir: el script `worktree` y `.kit-rol`; revisor frío | | | | |
| P5.1 | Spec delta del paquete 5 + red team | | | | |
| P5.2 | Construir: el canon director/obrero y sus correctores | | | | |
| P5.3 | Construir: `/estado`, el resumen del día, los subagentes, el `CLAUDE.md` por criterios | | | | |
| P5.4 | Construir: la mesa (`mesa`, `candado:mesa`); revisor frío | | | | |
| P6.1 | Spec delta del paquete 6 + Equipador v3 | | | | |
| P6.2 | Actualizador, adoptador, `doctor` completo; "toda la flota" con los repos de prueba; revisor frío | | | | |
| P7.1 | El ciclo de `cambios` y la portada | | | | |
| P8.1 | Medir la línea base; playbook, guía, manuales | | | | |
| P9.1 | Arrancar el piloto en Deptos | | | | |
| P9.2 | Medir el mes del piloto contra TABLERO §1 | | | | |
| P10.1 | Tag `v3.0` y nota de migración | | | | |

## Pendientes de cada paquete

Lo que una sesión dejó a medias, con qué falta. Se borra cuando se hace (queda en el CHANGELOG).

- *(vacío)*

## NO VERIFICADO, para tachar

El detalle y cómo se prueba cada uno, en la sección "NO VERIFICADO" del spec. Se tacha con `[x]`, la fecha y la sesión que lo probó;
si falla, se anota qué pasó y va a "Pendientes".

**En la construcción** (los prueba la sesión del paquete):
- [ ] Orden 2 · Que una escritura por script de node a `.claude/` no pregunte de día, también dentro de `.claude/worktrees/`
- [ ] Orden 2 · Que el hook `SessionStart` no corra en los subagentes
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

## Lecciones (insumo de la misión 6)

- 2026-10-27 · La misión 4½ arrancó en Fable y pasó a Opus al empezar a ejecutar: las decisiones ya estaban escritas.
