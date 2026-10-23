# Diseño · Racimo E: un molde y la flota (el Arquitecto como puerta)

> **Misión 4, tramo 4** · 2026-10-22 · **Estado: aprobado por Guido, decisión por decisión, y revisado.** Nueve
> decisiones más la de arranque, charladas en criollo y de a una. Después, **una revisión en frío** (un agente sin
> contexto de las charlas) **y una lectura del instalador de gentle-ai** trajeron 17 hallazgos: Guido aprobó aplicar
> 15 enteros y 2 recortados (§16). Es solo diseño: se construye en la misión 5. Se mide contra el norte del
> [PLAN](PLAN.md): **¿le baja la intervención a Guido o se la sube?** Se la baja: le saca el mantenimiento de la
> flota entero y le suma **dos preguntas nuevas**, las dos de diseño (§7 y §10).

## 1. Para qué es este racimo, en una línea

**Que todos los proyectos corran el mismo método, en la misma versión, y que ponerlos al día sea un pedido de una
línea y no una sesión de lectura por proyecto.**

Lo medido que dolía (tramo 2, [`FLOTA.md`](FLOTA.md)): 0 de 10 proyectos dicen qué versión del método tienen; cada
uno reescribió su `/inicio` y `/cierre` (se parecen al molde entre 5% y 81%); Portal tiene una copia del Arquitecto
que envejece sola; `/smoke` está en 9 proyectos y `/release` en 8, cada uno a su manera; el Equipador casi no se
usaba porque nada avisaba que había versión nueva (P13).

## 2. Lo que decidió Guido (2026-10-21 y 22)

1. **Una sola puerta, varias piezas adentro.** Guido le habla siempre al Arquitecto; él reconoce el pedido y deriva.
   Las piezas siguen siendo archivos chicos y separados (§3).
2. **El Arquitecto responde "¿cómo hago esto bien?"**: una PC, un proyecto, una feature, ponerlos al día. **El agente
   de ecosistema** ("¿qué tenemos y cómo se cruza?") **no es parte del Arquitecto**: es propio de la empresa, va al
   racimo I y probablemente viva en el Hub ([`TABLERO.md`](TABLERO.md) §10).
3. **El registro de proyectos de la empresa es el Hub**, no un segundo registro. Se le pidieron 4 cosas (§9). **El
   actualizador no lo necesita**: la flota del método se descubre con `gh` y las fichas.
4. **Cada repo lleva una ficha del kit** que dice qué versión tiene y cómo se adaptó cada pieza (§4), y una
   actualización **nunca pisa una adaptación** (§5 y §6).
5. **`/inicio` y `/cierre` varían por proyecto y está bien**; `/smoke` y `/release` son de cada repo, "a como dé lugar".
6. **Las decisiones se presentan en criollo, cortas, diciendo qué cambia para él.**

## 3. Qué es el Arquitecto: skill, agentes y scripts

| Parte | Qué es | Por qué así |
|---|---|---|
| **La puerta** | Una skill (`/arquitecto`), instalada en cada PC por el kit | Es lo único que puede charlar con Guido en el chat. No hace falta ningún chat "del Arquitecto" levantado |
| **Las manos** | Agentes de fondo: uno por proyecto al poner al día, el explorador del Modo B, el adoptador | Trabajo que no necesita a Guido, en paralelo, con sus propios límites de herramientas (§6) |
| **Los ojos** | Scripts, no el modelo: qué versión tiene cada repo y qué le falta lo calcula un script leyendo GitHub (`gh`), la ficha y la lista local de carpetas | Sale igual siempre y casi gratis (idea 1 de [`REFERENCIAS-EXTERNAS.md`](REFERENCIAS-EXTERNAS.md) §4; ya existe como `observatorio/investigacion/flota.py`) |
| **La memoria** | Ninguna propia. Lo que sabe vive en los repos (las fichas) y en GitHub | Por eso responde igual en cualquier PC y con cualquier cuenta |

**Las cinco entradas de la puerta** (lo primero que hace siempre es reconocer cuál es):

1. **La PC**: "preparame esta máquina", "actualizate", "¿qué tengo instalado?" → deriva al Equipador.
2. **Proyecto nuevo**: el Modo A de hoy.
3. **Feature sobre uno que anda**: el Modo B de hoy.
4. **Consultorio**: el Modo C de hoy.
5. **La flota**: "¿cómo está la flota?" (el script), "poné al día X" (el Equipador, §6), "adoptá X" (el adoptador, §7).

**El `SKILL.md` del Arquitecto pasa a ser ruteo más reglas de oro** (de ~20 KB a ~5): cada puerta es un anexo que
se lee bajo demanda, como ya pasa con el banco de preguntas y los concerns. Menos tokens en cada arranque
(objetivo 1). Las entradas 1 y 5 **derivan, no ejecutan**. El nombre viejo del Equipador (`arquitecto-skills`)
sigue andando. Lo que **no** entra por esta puerta: el ecosistema (racimo I) y el relevamiento (`/relevamiento`,
REJ-011 y REJ-013 siguen); si Guido pide algo de eso, el Arquitecto lo dice en una línea y lo manda a la puerta
correcta.

**Choque con ADR-004 y REJ-003, resuelto de frente.** ADR-004 protegía dos cosas: archivos chicos y un disparador
claro. Las dos se mantienen, porque el procedimiento no se muda al Arquitecto, solo la entrada. REJ-003 se reabre
**solo en la forma de ruteo**, no en la de "modo adentro". Evidencia nueva: el Equipador casi no se usaba por tener
nombre propio (P13) y Portal envejeció con una copia del Arquitecto adentro (F§7). → **ADR nuevo al construir**, que
también escribe la única excepción a "el Equipador jamás maneja tokens" (§9).

**Cómo sabe qué proyectos hay.** Cruza tres cosas: la lista de carpetas que Claude Code ya anota en cada PC (en la
PC de hoy: 35 carpetas, de las cuales 9 son borradores de la app y unas 8 son proyectos con decenas de sesiones);
GitHub, con `gh` (el último push de cada repo); y la ficha de cada repo. Y clasifica solo:

| Grupo | Condición | Qué hace el Arquitecto |
|---|---|---|
| **Flota** | Tiene repo y tiene ficha | Es lo único que se mantiene. La ficha es el alta; la baja es sacarla o archivar el repo |
| **Vivo sin método** | Git y actividad reciente (último push o sesión local), sin ficha | Lo lista como candidato a adoptar, una vez. No insiste |
| **Efímero** | Sin git, o más de 30 días sin push ni sesión en ninguna PC | No existe para él. Aparece solo si Guido pregunta "¿qué tengo tirado?" |

Las cuentas de Claude Code no importan: los pushes salen con el GitHub logueado en cada PC, y el Arquitecto pregunta
con `gh` si esta PC puede pushear antes de tocar un repo; si no, lo informa y sigue. Los proyectos sin repo están en
el Hub y aparecen en el mapa del ecosistema, pero no se mantienen.

## 4. La ficha del kit (decisión 1)

**Dónde**: `.claude/kit.md` en cada repo, al lado de lo que describe. Una fila en el mapa de documentación del
`CLAUDE.md`. Viaja por git. (Alternativa descartada: `docs/KIT.md`, porque `docs/` es del proyecto y esto es del
método.) **Es la misma ficha que pide el racimo A** (DISENO-A §6): una sola por repo, con lo del método y lo de los
frenos.

**Qué**: una cabecera que lee un script, y abajo prosa para humanos.

```markdown
---
kit: 2.4.2
nivel: estándar            # liviano · estándar · largo (los nombres los fija el racimo H)
vars:                      # con qué se instanció el molde; sin esto no se puede regenerar
  proyecto: Hub
  comando-test: pnpm test
  lenguajes: [ts]
piezas:                    # estado · hash de lo que el molde escribió (para saber si está intacta)
  inicio: {estado: molde+propio, hash: 3f9a…}
  cierre: {estado: molde+propio, hash: b71c…}
  hook-arranque: {estado: molde, hash: 90e2…}
  settings: {estado: molde+propio, hash: 5d04…}   # lo quitado va en frenos.quitados (unificado por F §14, 2026-10-22)
  docs: molde              # solo las PLANTILLAS del nacimiento (handoff, TODO, CHANGELOG, NORTE, MAPA, README); docs/ es del proyecto (§5)
  hook-escritura: molde    # B §7: frena archivos sueltos en docs/ al escribirlos
  candado: molde           # B §14: el chequeo de estructura; se prende cuando el árbol cumple
  smoke: propia
  release: propia
  director-obrero: no       # D (2026-10-23): pasa a piezas con estado: director, obrero, tramo, nucleo (molde+propio), subagentes (molde+propio), scripts (molde + .propio); DISENO-D §14
  estado: no
  docs-fyd: sí
frenos:                    # lo que pide el racimo A
  opcionales: [rama-nueva-por-mision]
  quitados: []
sensible:                  # las 4 preguntas del racimo A, bajadas a este repo
  datos-reales: [tabla proyectos en Supabase]
  plata: no
  sale-afuera: [mails a gerencia]
multi-llm: no              # si es "sí", se genera AGENTS.md desde el CLAUDE.md
---
## Cómo se adaptó el kit a este proyecto
- `/inicio`: suma el chequeo de Vercel antes de arrancar, porque dos veces se trabajó sobre un deploy roto (2026-08).
- `settings`: se quitó el `deny` de `git stash` porque el flujo de release lo necesita (2026-09).
```

- **Cuatro estados por pieza**: `molde` (se regenera entera) · `molde+propio` (se regenera afuera de la zona propia) ·
  `adaptada` (reescrita a fondo; se actualiza por fusión a tres puntas, §6) · `propia` (**intocable**; a lo sumo se
  avisa si el contrato cambió). Más `sí`/`no` para lo que existe o no. `/smoke` y `/release` nacen `propia`.
- **`vars:` y el hash por pieza** son lo que hace posible regenerar sin volver a los `{{...}}` y saber, sin
  adivinar, si una pieza está intacta o editada. La fecha de la última actualización no se guarda: la da `git log`.
- **Quién la escribe**: el Arquitecto al montar (Modo A) o al adoptar (§7). El actualizador le cambia la versión y los
  hashes. La prosa de las adaptaciones la escribe quien adapta, **con su razón**: sin el "por qué", la fusión de §6
  no se hace. Es "cada regla lleva su cicatriz", bajado a los proyectos.
- **El guardia**: si una pieza `molde` o `molde+propio` no coincide con su hash fuera de la zona propia, el
  actualizador **no la pisa**, la marca `adaptada (desvío detectado)` y lo informa. Corrector, no pregunta.
- **Qué NO lleva**: "con qué se conecta" y "quién lo opera". Eso vive en el Hub.

## 5. La zona propia (decisión 2)

| Dónde | Cómo se marca |
|---|---|
| Skills y textos (`/inicio`, `/cierre`) | Una zona entre `<!-- kit:propio -->` y `<!-- /kit:propio -->`, con un título visible adentro ("Lo propio de este proyecto"). Todo lo de afuera es molde. Puede haber más de una zona. Si una marca está suelta o repetida, no se toca el archivo y se informa |
| Hooks y scripts | No se marcan. El molde queda intacto y llama al final a un archivo hermano si existe (`session-start.propio.sh`). Lo propio vive en el hermano |
| `settings.json` | **A tres puntas por regla** (molde viejo, molde nuevo, proyecto): solo se agrega lo nuevo de esta versión; lo que el proyecto quitó a propósito está en `frenos.quitados` de la ficha (un solo campo para todo freno, con id, razón y `hasta:`; lo unificó F §14) y **no vuelve** (regla 3 del racimo A). Lo del proyecto gana, incluso una lista vacía |
| `CLAUDE.md` y todo `docs/` | Del proyecto. El actualizador no los toca, con una sola excepción: **una línea en el CHANGELOG** por actualización ("kit 2.4.2 → 2.5: piezas X, Y"). *Nota de B (2026-10-22): por eso la migración del árbol de `docs/` al modelo de módulos la hace **el adoptador de §7**, no el actualizador ([DISENO-B](DISENO-B-documentos.md) §17).* |

## 6. El actualizador (decisión 3) y los cuatro casos

Guido dice "poné al día Hub y Devoluciones", o "toda la flota". Entonces:

1. **"Actualizate" implícito primero**: no se reparte un kit viejo. El kit se baja **con sus tags**, para poder ver
   qué cambió entre versiones. El procedimiento y los templates se leen del clon fresco, no de la copia de la PC.
2. **Un agente por proyecto, en paralelo, siempre en un clon temporal o un worktree**: nunca en la carpeta donde
   Guido trabaja. Si la rama `kit/v<versión>` ya existe en el remoto, saltea ese proyecto y lo informa; si está
   marcada rota, **la borra y la sube de nuevo** desde `main` (sin `push --force`, que el hook de git de F §6 frena).
3. Por cada pieza, según la ficha:
   - **`molde`** → la reemplaza por la nueva, instanciada con `vars:`.
   - **`molde+propio`** → regenera lo de afuera de la zona; la zona queda intacta.
   - **`adaptada`** → sabe desde qué versión partió el proyecto, calcula qué mejoró el molde entre esa versión y la
     nueva, lee en la ficha qué se adaptó y por qué, y arma **el molde nuevo con la adaptación vuelta a aplicar
     encima**. Si la adaptación ya no tiene sentido (el molde ahora resuelve eso mismo), lo dice en una línea. Es
     una fusión a tres puntas, la hace un agente porque hay criterio, y no pregunta. **Si la ficha no trae el "por
     qué"**, lo busca en el `git log` de ese archivo; si tampoco está, **no fusiona y avisa** ("escribí por qué en
     la ficha y la próxima la actualiza").
   - **`propia`** → no la toca. Si el contrato cambió, una línea en el informe.
   - **Una pieza que el molde dio de baja** se retira solo si está intacta (coincide el hash); si no, se deja y se
     informa.
4. Toda escritura es **atómica** (archivo temporal y renombre): nunca un `settings.json` a medias.
5. Actualiza versión y hashes en la ficha, y la línea del CHANGELOG.
6. **Chequeo mecánico antes de dar por hecho**: ningún `{{` suelto · el hook inyecta menos de 10.000 caracteres ·
   el `settings.json` abre · las skills cargan · la ficha tiene la versión nueva.
7. **Si el chequeo pasa, el actualizador mezcla él a `main`**, en un solo commit fácil de revertir, y pushea. Es
   reversible, así que es corrector. La rama `kit/v<versión>` queda **solo si el chequeo falla**, marcada rota, y
   lo dice. El clon local de cada PC lo recibe en el próximo `git pull` (que `/inicio` ya hace, P37).
8. Devuelve **una tabla**: proyecto · versión vieja → nueva · piezas tocadas · desvíos detectados · si pasó el chequeo
   y se mezcló.
9. Si esta PC no puede pushear a un repo, lo informa y sigue con el resto.

**Los permisos de los agentes de fondo son una pieza del diseño**, no un detalle: cada agente corre con la lista de
herramientas justa (git, `gh`, lectura y escritura en el clon temporal), con `deny` de `.env*` y de toda lectura de
secretos, y con `allow` para pushear a `kit/*` y a `main` de los repos de la flota. Sin eso, el primer push pide
permiso y despierta a Guido (el obrero trabado 1,5 h de A.4). **No pregunta nada**: es reversible. Y **el `--dry-run`
no se construye**: la rama ya es la vista previa cuando algo falla, y git es el deshacer.

## 7. Adoptar un proyecto que ya anda (decisión 4)

Para Portal, el Bot, y cualquier repo que nunca pasó por el Arquitecto.

- **Primero mira, no toca**: inventario de piezas, parecido con el molde, documentos y tamaños, barreras, copias del
  kit adentro.
- **Una sola pantalla con la propuesta de estado por pieza**, que Guido aprueba en bloque o corrige, y en la misma
  pantalla la oferta de `docs-fyd` si el proyecto es de un cliente. **Es una de las dos preguntas nuevas del
  racimo**, porque es una decisión de diseño sobre un proyecto suyo, no una operación.
- **Trae siempre**: la ficha · `/inicio` y `/cierre` si faltan · el hook de arranque con tope · las barreras base ·
  los tres documentos del método si faltan (handoff, TODO, CHANGELOG), vacíos con su cabecera. *Nota de B (2026-10-22): pasan a ser
  los seis de la raíz de `docs/` (más `NORTE.md`, `MAPA.md` y `README.md`) y `referencia/trampas.md` y `referencia/PRUEBA.md`; y el
  adoptador es quien migra el árbol de `docs/` al modelo de módulos, mostrando el plano dentro de este mismo OK ([DISENO-B](DISENO-B-documentos.md) §17).*
- **No trae**: `/smoke`, `/release`, director/obrero, `/estado`. Se anotan como existentes si están; si no, recién
  cuando el ritual exista (regla de 3+).
- **Copias del kit adentro del proyecto** (Portal): las lista y propone sacarlas.
- **Cierra como el actualizador**: clon temporal, chequeo, mezcla a `main`, tabla. **El alta en el Hub no la hace**
  (el Arquitecto solo lee el Hub, §9): queda como una línea pendiente para el ritual del viernes, con los datos listos.

## 8. La versión del kit (decisión 5)

- **`kit/VERSION`** con el número, el mismo del tag. Hoy existe solo como tag y un script no lo puede leer. **El
  Equipador lo copia a `~/.claude/`** al instalar o actualizar.
- **Una nota de migración por versión** en el CHANGELOG del kit: qué piezas cambiaron, si el cambio es automático o
  pide revisión (toca algo que suele estar adaptado), y qué chequear después. Es lo que lee el agente de la fusión.
- **Numeración de tres números**: el primero cambia solo si una pieza deja de ser compatible con las fichas viejas;
  el segundo cuando entra una pieza nueva al molde; el tercero para arreglos.
- **El hook de cada proyecto compara su ficha con el `VERSION` de la PC**, en las dos direcciones: "hay kit nuevo
  para este proyecto" o "esta PC está atrás: actualizate". Si la PC no tiene `VERSION` (el kit no está instalado),
  **calla**. Sin preguntar. Resuelve P13. El `doctor` y el script de la flota comparan además contra **el último tag
  publicado**, para que una PC que nunca se actualizó también se entere.

## 9. El Hub como registro de la empresa, y las dos capas

Los dos agentes (el Arquitecto y, cuando exista, el de ecosistema) **miran los mismos datos y ninguno guarda nada
propio**. Pero tienen distinto alcance: **el actualizador no necesita el Hub** (`gh` más las fichas alcanzan, y el
kit sigue andando sin Hub para cualquiera que lo use); el Hub sirve para **"qué proyectos opera esta persona"** (el
onboarding, §10) y para el ecosistema (racimo I). Se le pidió al Hub el 2026-10-22 (brief entregado a su director,
que lo guardó como misión aparte): un campo `repo` (URL de GitHub) · un campo `tipo` (código · parcial · sin código)
· un campo corto "se conecta con" · **una credencial de solo lectura**. No hace falta: commits en el Hub, ni columna
de versión. **El Arquitecto nunca escribe en el Hub**: el alta de un proyecto nuevo queda como pendiente del viernes.

**Dos capas, para que el kit siga genérico**: el kit (público) define las piezas y los enchufes: la ficha, el molde,
la puerta, y un script que lee "un registro de proyectos" por adaptador. **La capa privada de la empresa** es la
conexión: el adaptador del Hub, los nombres de las variables, lo que la empresa quiere siempre prendido. El Equipador
instala las dos. Nada de la capa privada entra a vibe-kit (ADR-021). **La credencial del Hub** vive en una variable de
entorno del sistema de cada PC: nunca en `~/.claude/` (la vería `kit-sync`), nunca en un repo, nunca se imprime. Es
**la única excepción** a la regla del Equipador "jamás manejás tokens", y queda escrita en el ADR nuevo.

## 10. El Equipador atrás de la puerta (decisión 7)

- **"Preparame esta PC"**, en un pedido y **una sola pregunta** (la segunda pregunta nueva del racimo): chequea node,
  git, `gh` logueado y a qué cuenta · instala el kit canónico y copia `VERSION` · instala la capa privada · en una
  misma pregunta pide la credencial del Hub y si quiere clonar los proyectos que esa persona opera según el Hub ·
  tabla final. Es el onboarding de una PC o de una persona nueva (P44, P45).
- **Modo flota**: el Equipador de hoy pregunta ante cualquier edición local; en modo flota **no**: saltea esa pieza
  y la informa. Las preguntas son para cuando Guido lo invoca en su PC, no para los agentes.
- **`doctor`**, solo lectura: versión instalada contra `VERSION` canónico y contra el último tag publicado ·
  `kit-sync` limpio o no · falta la credencial del Hub · `gh` puede pushear a la organización · skills del kit
  copiadas dentro de proyectos. No arregla: lista, y cada línea dice cómo se arregla.
- **El script de la flota marca también**, con los mismos datos: ramas `kit/*` sin mezclar hace días (una corrida
  que falló), copias del kit en repos remotos (Portal está en otra PC), y **"X aparece en N proyectos"**: la regla de
  3+ medida por script, que alimenta la curaduría del kit en la sesión madre. La salud general de la flota
  (documentos pasados de tamaño, proyectos sin barreras) es del racimo I.

## 11. `/smoke` y `/release` al molde, y `AGENTS.md` (decisiones 8 y la cerrada por extensión)

- **`/smoke` y `/release`** pasaron la regla de 3+ (9 y 8 proyectos): **entran al molde como contrato más esqueleto**,
  pero **no nacen el día cero** (ADR-007 se mantiene): el Arquitecto los monta cuando el proyecto ya tiene el ritual,
  y desde que nacen son piezas `propia`, porque cada repo las hace a su manera. El actualizador nunca las toca; a lo
  sumo avisa si el contrato cambió.
- **`AGENTS.md`, opt-in.** El `CLAUDE.md` es la única fuente. Si la ficha dice `multi-llm: sí`, el molde genera un
  `AGENTS.md` desde él, con una línea arriba ("generado, no editar"), y `/cierre` lo regenera. **Por defecto, no**:
  Deptos usa `AGENTS.md` para otra cosa (F§9) y el kit se lo pisaría. El adoptador avisa si ya existe uno con otro
  contenido. Es la base del pedido multi-LLM del racimo G.

## 12. Las skills de hoy, con esto

| Skill | ¿Sigue? | Qué cambia |
|---|---|---|
| Equipador | Sí | De puerta propia a pieza atrás de la puerta. El nombre viejo sigue andando. Gana el modo flota |
| Relevamiento | Sí, con puerta propia | Otra pregunta, otro ritmo (semanas). REJ-011 y REJ-013 siguen |
| docs-fyd | Sí, igual | La dispara el Arquitecto al montar o adoptar; la ficha anota si el proyecto la usa |
| redteam-spec | Sí, igual | Y el actualizador lo usa cuando una versión del kit toque permisos |

Dos puertas que hablan con Guido (`/arquitecto`, `/relevamiento`), más el ecosistema cuando exista.

## 13. Cómo se sabe si funcionó (decisión 9; se mide con los scripts, cada mes)

| Qué | Hoy | Meta |
|---|---|---|
| Proyectos con ficha y versión legible por script | 0 de 10 | 10 de 10 |
| Distancia a la última versión del kit | No se sabe | Ningún proyecto a más de una versión |
| Poner al día un proyecto | Una sesión de lectura | Un pedido; el agente lo hace solo y mezcla |
| Actualizaciones que pisaron una adaptación | — | 0 (lo cuenta el guardia) |
| Ramas `kit/*` sin mezclar | — | 0 (una rama viva es una corrida que falló) |
| Skills del kit copiadas dentro de proyectos | 1 | 0 |
| Proyectos con el hook pasado del tope | 2 (el Hub ya se arregló el 2026-10-22) | 0 |
| Preparar una PC nueva | Horas, de palabra | Un pedido, una pregunta |
| Preguntas nuevas a Guido que trae el racimo | — | 2 (adoptar, preparar la PC), ninguna por actualización |

## 14. Lo que se va a otro racimo o queda en espera

| Qué | A dónde | Por qué |
|---|---|---|
| El agente de ecosistema; la salud general de la flota (documentos pasados de tamaño, sin barreras, alertas abiertas) | **I** (último) | Propio de la empresa; vibe-kit sigue genérico. El actualizador solo mira lo que él mismo toca |
| Qué trae el molde (documentación con tope, cabecera del hook, barreras, correctores, `/estado`, roles) | B · F · A · C · D/H | Este racimo decide el mecanismo (el camión); la carga la decide cada racimo y sale como versión del kit |
| Scripts de gate versionados (S-D-4) y casos repetidos de la skill de gate (S-M-1) | D y H | Son del director de Hermes, no del molde |
| Los nombres de los niveles (`nivel:` en la ficha) | H | Ahí se decide liviano · estándar · largo |
| Columna "versión del kit" en el Hub; reporte de la flota los viernes como tarea programada | Fase 2 / I | Primero que la tabla salga del cruce |
| Una variable para probar el Arquitecto aislado, sin tocar `~/.claude` (idea de gentle-ai) | Piloto, misión 5 | Hoy es "por las dudas"; si el piloto la necesita, se agrega |
| Quién toca qué con dos cuentas | G | FLOTA §8 sigue abierta |
| Migrar Hermes | Misión 5, nunca a mitad de un tramo | Regla del PLAN |
| El piloto sugerido (recomendación, no decisión) | Misión 5 | El Hub (es el registro y acaba de ordenarse) y Portal (la copia del Arquitecto adentro) |

## 15. Límites de este diseño

- Las cifras de la flota son del 2026-10-14 (tramo 2), salvo el Hub, que se actualizó el 2026-10-22.
- La lista de carpetas de la PC se midió solo en la PC donde se diseñó; las otras dos no se miraron.
- La fusión a tres puntas de las piezas `adaptada` es el único paso con criterio de modelo: se prueba en el piloto
  antes de soltarlo a la flota; el guardia de la ficha y la mezcla reversible son la red.
- Que los agentes de fondo puedan pushear sin pedir permiso con un `allow` bien escrito es **NO VERIFICADO**: se
  prueba primero en el piloto (§6).
- Nada de esto se construyó: kit en `v2.4.2`.

## 16. La revisión (2026-10-22)

Dos lectores, pedidos por Guido después de aprobar las decisiones: **un revisor frío** (un agente Opus sin contexto
de las charlas, leyendo este diseño contra el PLAN, el DISENO-A, FLOTA y las skills actuales; ~99 mil tokens) y **un
lector de gentle-ai** (Sonnet, ~120 KB del repo `Gentleman-Programming/gentle-ai` vía `gh api`, sin instalar nada;
~108 mil tokens). Trajeron 17 hallazgos; Guido aprobó aplicar 15 enteros y 2 recortados.

**Lo que rompía y se arregló** (4): la mezcla de la rama dependía de un `/inicio` que no sabe mezclar (§6.7) ·
`propia` significaba dos cosas opuestas (§4: ahora `adaptada` y `propia`) · regenerar perdía los valores de
instanciación (§4: `vars:` y hash) · el merge de `settings.json` reponía frenos quitados a propósito (§5).

**Lo flojo que se ajustó** (7): la fusión sin "por qué" · los choques entre corridas · el Equipador que pregunta ·
el conteo honesto de preguntas y los permisos de los agentes como pieza · `VERSION` que no llegaba a la PC · el Hub
fuera del camino del actualizador y la contradicción lectura/alta · una sola ficha con lo de A.

**Lo que se sumó** (4): el `SKILL.md` como ruteo con anexos · la línea en el CHANGELOG · lo que el script de la flota
marca (recortado: solo lo que el actualizador toca; la salud general va a I) · de gentle-ai, la escritura atómica y
retirar piezas solo si están intactas (recortado: la variable de aislamiento va al piloto).

**Lo que se sacó** (2): `actualizado:` y "lo que no toca" de la ficha, y la caché de la tabla · "efímero" medido
solo por una PC.

## 17. Los 11 criterios, aplicados a este racimo

Los criterios se definieron al cerrar este racimo ([PLAN](PLAN.md) §El foco), así que esta tabla se armó después; la
revisión integral del final del tramo 4 la vuelve a mirar.

| # | Criterio | Cómo lo cumple E, o por qué no aplica |
|---|---|---|
| 1 | Menos intervención | Le saca el mantenimiento de la flota; suma 2 preguntas de diseño (adoptar, preparar la PC); ninguna por actualización |
| 2 | Pragmático | 17 hallazgos → 15 enteros, 2 recortados; sin `--dry-run`, sin caché, sin segundo registro |
| 3 | Medible | Tabla de §13, con los scripts, cada mes |
| 4 | Software consistente, seguro, escalable | Indirecto: el mismo molde en los 10 proyectos y el chequeo mecánico tras cada actualización. La calidad del código en sí la mueven A, D y F |
| 5 | Tokens y modelo justo | El `SKILL.md` del Arquitecto baja de 20 a ~5 KB; el inventario y los chequeos son scripts; la fusión (único paso con criterio) la hace un agente con el modelo que fije D |
| 6 | Script antes que modelo | Versión, inventario, drift por hash, chequeo mecánico: todo script |
| 7 | Seguro por defecto | Agentes con herramientas acotadas y `deny` de secretos; la credencial del Hub en variable del sistema, nunca impresa; el kit público sin nada de la empresa |
| 8 | Portable | Sin memoria propia; fichas en los repos; "preparame esta PC" en un pedido |
| 9 | Lo chico no paga lo grande | No aplica directo; el `nivel:` de la ficha lo deja listo para H |
| 10 | Autónomo con rastro | Commit único reversible, línea en el CHANGELOG, tabla final, rama solo si falla |
| 11 | Piloto antes de flota | La fusión a tres puntas y los permisos de los agentes se prueban en el piloto (Hub y Portal) antes de soltarse |

**De gentle-ai, lo que no se copia y por qué**: el binario con 17 agentes (mantenemos 10 repos con un molde, no un
producto), las plantillas históricas de todas las versiones (con el hash de la anterior alcanza), la telemetría, el
backup comprimido (la rama y git ya lo dan) y el manifest con posiciones (frágil; mejor marcas explícitas). Nuestro
`doctor` compara fichas y drift; el de ellos chequea binarios y estado, no archivos contra una versión.
