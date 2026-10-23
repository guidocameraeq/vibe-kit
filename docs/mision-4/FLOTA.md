# Inventario de la flota

> **Misión 4, tramo 2, paso 0** · 2026-10-14 · Solo describe lo que hay; no decide ni toca nada. Entra al
> mapa del tramo 3 (`TABLERO.md`) junto con [`REPOS.md`](REPOS.md) y [`PLATAFORMA.md`](PLATAFORMA.md).
> El plan: [`PLAN.md`](PLAN.md).

**Cómo se midió.** Un script lee GitHub (la organización del trabajo y la cuenta personal) con `gh`,
sin abrir ningún proyecto: árbol de archivos de la rama principal, `.claude/settings.json`, el
`CLAUDE.md` y la cabecera de cada skill. Otro compara el `/inicio` y el `/cierre` de cada proyecto con
todas las versiones del molde del kit. Costo: casi cero tokens. Los scripts quedaron en
`observatorio/investigacion/` (`flota.py`, `huella.py`) para repetir la medición.

**Nombres.** El repo es público: los proyectos van con un alias. Desktop y Mobile son los dos proyectos
largos de la radiografía.

## La flota en una tabla

| Alias | Qué es | Dónde vive | Vida (commits) | Del método | Skills propias | Pruebas · CI |
|---|---|---|---|---|---|---|
| **Desktop** | App de escritorio, proyecto largo | Esta PC (+5 worktrees) | mar→hoy (1.586) | Completo + director/obrero/tramo, 3 subagentes | release, smoke | 161 archivos · sí |
| **Mobile** | App móvil, proyecto largo | Esta PC (+2 worktrees) | abr→hoy (1.098) | Completo + director/obrero/tramo/gate, 3 subagentes | release, smoke | 62 · sí |
| **Deptos** | Gestión de inmuebles + un agente que opera el negocio | Otra PC | jul→oct (359) | Completo + director/obrero (versión corta), 2 subagentes | 14 (estado, verificar, turno, parte…) | 285 · 11 workflows |
| **Hub** | Panel interno de proyectos | Esta PC | jun→oct (544) | Completo | 7 (horas, viernes, estimar, backup…) | 85 · no |
| **Devoluciones** | App de gestión | Esta PC | jun→hoy (615) | Parcial (handoff, sin TODO) | release | 90 · sí |
| **Portal** | Portal interno | Otra PC | sep→hoy (179) | Parcial + **copia del Arquitecto adentro** | — | 157 · no |
| **Bot** | Bot de WhatsApp (base open source) | Esta PC | feb→oct (95 propios) | Mínimo (sin docs/) | deploy, smoke | casi 0 · no |
| **Panel del bot** | Tablero del bot | Esta PC | mar→oct (135) | Completo | deploy, smoke, reporte mensual | casi 0 · no |
| **Bot personal** | Bot personal | Otra PC | may→oct (408) | Completo | deploy, smoke | casi 0 · no |
| **Portapapeles** | App de escritorio chica | Esta PC tiene una copia vieja; la viva, en otra | may→jul (148) | Completo | smoke | 0 · sí |
| vibe-kit | Este repo (el método) | Esta PC | jul→hoy (54) | — | — | — |
| research | Biblioteca de la investigación | GitHub | oct (11) | — | — | — |
| 4 más | Un fork ajeno, un repo de descargas, dos chicos | — | — | Nada | — | — |

"Completo" = tiene `CLAUDE.md`, `/inicio`, `/cierre`, el hook de arranque y los docs del método (handoff,
TODO, CHANGELOG, DECISIONS). "Otra PC" = no está clonado en esta; cuál de las otras dos es, no se sabe.
Proyectos en la PC `Usuario` o en la del compañero que **no** estén en GitHub: **NO VERIFICADO** (haría
falta mirar esas PCs por Remote Control).

## Lo que muestra

**1. 🆕 Ningún proyecto dice de qué versión del método es.** Confirma P44: no hay marca en ningún lado.
Y la huella no ayuda: el `/inicio` y el `/cierre` de cada proyecto se parecen al molde del kit entre
**5% y 81%**. Todos los reescribieron a su medida. El molde de `/inicio` no cambió desde el 2026-07-06; el
de `/cierre` tuvo 3 versiones. Para mantener la flota (la visión del Arquitecto como agente único), hoy
habría que leer proyecto por proyecto.

**2. 🆕 Hay un tercer proyecto con director/obrero, y es la versión corta.** Deptos tiene su director
(6,7 KB) y su obrero (4,8 KB): **5 a 8 veces más chicos** que los de Desktop (38 y 22 KB) y Mobile (38 y
30 KB). Es un tercer dialecto, y el único que entra en el "nivel liviano" del método. Hay que mirarlo en
el tramo 4 antes de diseñar los niveles.

**3. ⚠️🆕 El hook de arranque del kit no tiene tope, y la plataforma corta.** El molde del kit hace
`cat` del handoff entero. La plataforma corta lo que inyecta el hook a **10.000 caracteres**: si se pasa,
la sesión ve una vista previa de 2.000 y el resto queda en un archivo que nadie abre ([`PLATAFORMA.md`](PLATAFORMA.md) §14).
Cuánto inyecta hoy cada uno (medido hoy):

| Proyecto | Inyecta | Estado |
|---|---:|---|
| Hub | ~43 KB (handoff entero de 39 KB + TODO) | 🔴 se pasa 4 veces |
| Panel del bot | ~18 KB (handoff + STATUS + TODO enteros) | 🔴 se pasa |
| Desktop | Lo achicó a mano | ✅ Ya lo sufrió: el 2026-09-21 una sesión arrancó viendo solo la cabecera. Quedó escrito en su hook |
| Mobile | Corto por diseño | ✅ |
| Devoluciones | ~7 KB (solo las primeras 90 líneas) | 🟡 cerca del tope |
| vibe-kit | 8,6 mil caracteres | 🟡 87% del tope |

Que Hub y el Panel arranquen ciegos es **deducido**: no se vio en una sesión de ellos.

**4. Documentos sin tope en toda la flota, no solo en los dos largos.** Ejemplos:
- un **handoff de 503 KB** (Devoluciones), cuando el handoff es el "save game" corto;
- bitácoras de 300-415 KB;
- CHANGELOG o DECISIONS de 260-440 KB en 5 proyectos.

Es el antipatrón de la radiografía §8, repetido en todos lados.

**5. Seguridad por defecto: el molde no trae barreras.** El `settings` del kit trae 12 reglas `allow` y
**ninguna `deny` ni `ask`**. Y **8 de los 10 proyectos con código no tienen ni una regla `deny`**. Los dos
que las tienen las agregaron por su cuenta. Es la causa de fondo de la mejora #9 de la radiografía.

**6. Las skills que nacieron en los proyectos** (candidatas al kit; la regla de 3+ ya se cumplió en las dos primeras):
- **`/smoke` está en 9 proyectos** y **`/release` o `/deploy` en 8**. El kit las deja afuera a propósito ("regla de 3+": se
  montan cuando el ritual exista). El ritual ya existe en casi todos: son candidatas firmes a molde.
- **Para la mejora #7** (el `/estado` de solo lectura): Deptos ya tiene un `/estado` de solo lectura.
- *Corregido por D (2026-10-23, lector sobre las skills en disco): el `/verificar` y el `/estado` de Deptos son skills **del negocio** (deudas en portales, semáforo de pagos), no del método; no cuentan para la regla de 3+. El verificador mecánico real de Deptos es `scripts/check_mision.py`. [DISENO-D](DISENO-D-director-obrero.md) §12.*
- **Para la mejora #1** (el verificador mecánico): Deptos tiene un `/verificar`, y un script de chequeo de la misión que se
  arregló 5 veces.
- **Propias de un negocio, se quedan donde están**: horas por commits, la carga de los viernes, estimar horas, backup y
  reporte mensual.

**7. 🆕 Una copia del Arquitecto vive adentro de un proyecto** (Portal). Envejece sola: no la toca `actualizate`. Es
justo lo que P31 tiene que evitar: las skills del kit viven en un solo lugar.

**8. 🆕 Dos cuentas de GitHub firman los commits.** La segunda firma casi todo lo reciente en Portal,
Devoluciones y Hub. **NO VERIFICADO**: ¿es el compañero o es otra PC de Guido? Cambia a quién le toca
cada proyecto en la mesa y en el mantenimiento de la flota. *(Pregunta para Guido.)*

**9. Cuatro proyectos usan también `AGENTS.md`** (Devoluciones, Hub, Bot, Deptos): en Deptos es el
manual del agente que opera el negocio. Es otra convención junto al `CLAUDE.md`, y el kit no dice nada
de ella.

## Para el tramo 3

- La versión del método tiene que ser **visible y legible por script** (P44). Sin eso, "mantener la flota
  al día" no es posible.
- **El tope del hook de arranque** es un arreglo chico con impacto grande en por lo menos dos proyectos.
  Está anotado como pendiente aparte, porque esta misión solo diseña.
- Hay **tres dialectos** de director/obrero, no dos. Para los niveles conviene partir del más corto.
- Las barreras `deny` tienen que venir **en el molde**: hoy ningún proyecto las hereda.
- `/smoke` y `/release` ya pasaron la regla de 3+.
