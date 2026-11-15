# El tramo final: de la `rc.7` a la `v3.0` — el plan y los prompts de sus sesiones

> Asentado el 2026-11-12 con Guido, en la sesión 4 de la revisión de la `rc.7` (la madre nueva), en la PC `Usuario`. Este archivo
> es la fuente de los prompts: cada sesión se lanza con "leé `docs/kit-v3/TRAMO-FINAL-PLAN.md`, tu sección es la N, y seguila".
> Si algo de acá choca con lo que diga el handoff inyectado, manda este archivo; si choca con "Cambios al plan" del tracker con una
> fecha posterior, manda el tracker.

> **Cambió el 2026-11-15** (Guido, después de R2): antes de la `rc.8` va **el banco de prueba** (5a: el kit contra copias de todos
> los repos de la cuenta, inocuo); la `rc.8` (5b) la decide y la escribe **Fable 5.2** y trae **todo** corregido (los grandes de R2,
> los del banco y los chicos); después, **el banco otra vez** (5c) da el veredicto final, y la sesión 6 ya no arregla código.
> Mandan las secciones 5a, 5b y 5c de abajo y la fila del 2026-11-15 de "Cambios al plan" del tracker.
>
> **Y cómo se lanzan, desde el 2026-11-15** (Guido: *"ya abrir las sesiones y dejarlas esperando… te van a quedar como obreros y vos
> vas a ser el director… las vas a poder largar en secuencia, sin necesitar mi aprobación"*): las cuatro (5a, 5b, 5c, 6) se abrieron
> juntas, **en espera**; el director activa cada una con un mensaje ("arrancá") cuando cierra y verifica la anterior, sin el clic de
> Guido. Las ids: 5a `local_24efab7c-6f5f-4f45-b0e1-db7e512568bf` · 5b `local_d9243a07-fa50-4a6e-ba5d-3aa94a56f848` (en Fable 5.2,
> verificado) · 5c `local_11c5923f-eb21-4f76-974a-5c35d535fe34` · 6 `local_ec361f24-9162-41e9-8b21-da3a50ca82c7`. Si una necesita
> continuación, el director la abre nueva. Lo que sigue siendo de Guido (publicar la `v3.0`, sus repos reales, los criterios a fase
> 2, lo de diseño) no lo cubre este permiso.

## Para qué

Guido, 2026-11-12: *"esta RC nueva podría llegar a ser la versión oficial. Si ya la planeamos bien, hacemos un spec bien pensado,
que el spec lo haga Fable… y después el formato completo para crearla"*; *"no necesito hacer ninguna noche de Deptos más"*; *"al
final, cuando saquemos la versión, vamos a tener que cerrar el repo con todo el ciclo de mejora, cómo lo hicimos, todas las RC, cómo
sacar una versión nueva"*; *"lanzás esa sesión y te desenganchás, así la labura autónoma"*.

**El objetivo de la `rc.7`** (Guido): reducir las fricciones y que fluya. Afilado: *el dueño no tipea nada y una noche termina sola*.
**La `rc.7` es la candidata a la `v3.0`**: la `v3.0` es su mismo código si R2 no encuentra nada grande (si encuentra, una `rc.8`).

## Lo que ya está decidido (no se vuelve a discutir)

Todo en el tracker `docs/kit-v3/PLAN-construccion.md`, "Cambios al plan", las filas del 2026-11-12, y en "De la prueba real", 17 a 60:

1. **Las ocho partes de la `rc.7`** (todas entran; Guido: "todo a la rc.7"):
   1. la noche termina sola (una sesión de fondo en la carpeta principal cierra: integra, publica si la ficha lo dice, prueba de
      humo, parte); **con red**: la ficha de cada repo dice si la noche publica, y el dueño autoriza el deploy con un clic por PC;
   2. aprobar con un clic, y cerrar los agujeros (aprobar desde otra carpeta, 40; la bandera abreviada y `merge -s ours`, 55);
   3. `/estado` para el dueño, con una sola lista de "te espera" y una sola cuenta de "encargo cerrado" (32, 47, 54);
   4. el parte de la mañana sin comandos, la regla de cómo hablarle (en el núcleo o las skills, nunca en el `CLAUDE.md` del repo) y
      "el dueño" en vez de "Guido" en el kit que se instala (34, R21);
   5. un solo camino para lo de fondo: sin el despertador ni la regla del 40 %; `/tramo` **se queda** (REJ-017), `autorizado` acepta
      `Skill: tramo` y la plantilla del encargo dice cuándo cada uno; y **los nombres**: director y obreros con un esquema fijo, el
      encargo dice quién es su director, el mensaje que quede lleva su destino (46, 59);
   6. frenos que no se cuelgan ni niegan lo inocente, y las pruebas pesadas en fila (42-45, 55, 56);
   7. los arreglos chicos del director y del Equipador (38, 39, 41, 44, 49-51, 57);
   8. **adoptar sin romper**: decir qué piezas propias reemplaza, verificar que el repo queda andando, preguntar si publica o gasta
      plata en vez de poner "no", declarar las skills propias, `molde+propio` solo si se tocó (52, 53); y **preparar la PC trae los
      repos de la cuenta** que el dueño elija (60).
2. **Para la `v3.1`**, no ahora: el director corto, el aviso al celular, el kit como plugin (REJ-001), la poda de frenos por evidencia,
   el costo por encargo, el director sin `EnterWorktree`, el candado en repos con historia (58), la mesa en lote, el buzón, "probar una
   idea nueva" y el PO.
3. **Las decisiones técnicas de la madre** (ADR-034, ya contadas a Guido): el cierre de noche es una sesión de fondo en la carpeta
   principal, no el `ExitWorktree` del director; `idleCompaction` no se toca (el director commitea y deja el relevo antes de cada espera
   larga); `niega-aprobar` pasa a los hooks de la PC; el clic de publicar lo arma "preparame esta PC" y lo corre el dueño; "el dueño"
   reemplaza a "Guido" solo en lo instalable.
4. **No hay más noches de Deptos.** El criterio de éxito se mide en **una noche de prueba dentro de R2, sobre un clon de Deptos**.

## El criterio de éxito de la `rc.7`

En la noche de prueba de R2, sin dueño: **0 comandos tipeados por el dueño**, la noche **termina y publica sola** (contra un remoto
de prueba), `/estado` tiene **sus cuatro secciones**, y **nada de lo que le llega al dueño dice "rojo"**. Y para el tag `v3.0`: los
20 criterios de aceptación del kit entero tildados con evidencia (tracker, "Los 20 criterios"), salvo los que Guido pase a fase 2 por
escrito.

## Las sesiones

| # | Sesión | Modelo | Cuándo | Escribe |
|---|---|---|---|---|
| 0 | `vibe-kit M5 · Tramo final · El director` | Opus 5.5 | cuando Guido diga "lanzá" | el tracker, `docs/README.md`, el handoff (cierres parciales) |
| 1 | `vibe-kit M5 · Tramo final · El spec de la rc.7` | **Fable 5.2**, esfuerzo alto; red team y lectores en Opus/Sonnet | primera | `docs/kit-v3/SPEC-paquete-8d.md` |
| 2 | `vibe-kit M5 · Tramo final · Construcción, tanda A` | Opus 5.5 | con el spec READY | `kit/` y lo que diga su tanda |
| 3 | `vibe-kit M5 · Tramo final · Construcción, tanda B` | Opus 5.5 | cuando cierre la 2 | ídem |
| 4 | `vibe-kit M5 · Tramo final · Construcción, tanda C y el tag rc.7` | Opus 5.5 | cuando cierre la 3 | ídem, `kit/VERSION`, `kit/CHANGELOG.md`, el tag |
| 5 | `vibe-kit M5 · Tramo final · R2 y la noche de prueba` | Opus 5.5; revisores Opus | con la `rc.7` taggeada | `docs/kit-v3/REVISION-INTEGRAL-rc7.md` |
| 5a | `vibe-kit M5 · Tramo final · El banco de prueba` | Opus 5.5; un lector Sonnet por repo | con R2 cerrada (Guido, 2026-11-15) | `pruebas/banco/` (el script), `docs/kit-v3/BANCO-rc7.md`; el detalle de los repos del trabajo, en `vibe-research` |
| 5b | `vibe-kit M5 · Tramo final · La rc.8` | **Fable 5.2** (decide y escribe); red team y revisor Opus; corridas Sonnet | con el banco cerrado | `docs/kit-v3/SPEC-paquete-8e.md`, `kit/`, el tag `3.0.0-rc.8` |
| 5c | `vibe-kit M5 · Tramo final · El banco otra vez` | Opus 5.5; lectores Sonnet | con la `rc.8` taggeada | `docs/kit-v3/BANCO-rc8.md` (el veredicto final) |
| 6 | `vibe-kit M5 · Tramo final · La v3.0 y el repo cerrado` | Opus 5.5 | con el banco otra vez que dice "sale" | el tag `v3.0`, el ciclo escrito, la portada, `/cierre` completo |

- **En fila, una por vez** (tracker, "Paralelizar: decidido que no"; y nunca dos tandas pesadas a la vez en la PC).
- **Las tandas A, B y C las define el spec**: el que lo escribe parte las ocho partes en tres grupos que **no tocan los mismos
  archivos** y dice qué prueba cubre cada cambio. La propuesta de la madre, para que el spec la confirme o la cambie con su razón:
  A = frenos y seguridad (partes 2 y 6: red team del cambio); B = la noche, `/estado`, el parte y el camino de fondo (partes 1, 3, 4
  y 5); C = la adopción, preparar la PC y lo chico (partes 7 y 8), más la suite entera, la flota y el tag.
- **El nivel de control** (`docs/CICLO-DE-MEJORA.md` §3.6): **completo**, porque toca frenos y rediseña la adopción. Cada tanda corre
  solo las pruebas de lo que toca; la suite entera, una vez, al final de la C.
- **El M6b va al final** (sesión 6), junto con el ciclo escrito que pidió Guido: R2 no lo necesita, y así se escribe con la vuelta
  entera vivida, rc.1 a v3.0. (Cambia el orden del 2026-11-10, que ponía M6b antes de R2: decisión técnica de la madre.)

## Dónde lo necesita a Guido (y nada más)

| Cuándo | Qué | Cómo se lo pide el director |
|---|---|---|
| Al final de la sesión 1 | **Sellar el spec** (pasa a READY) y contestar lo de diseño que el spec no pudo cerrar | En criollo, una decisión por vez, la recomendada primero, con la vara del ADR-030 |
| En la sesión 4, si el clasificador frena | Correr `kit-sync.sh sync` (escribe su `~/.claude/`) | Una sola línea, en PowerShell, sin `&&` |
| Al tag `rc.7` | **OK para poner al día sus repos reales** con la flota (cuáles) | La lista de repos con lo que cambia en cada uno, en criollo |
| Al final de la sesión 5 | Si sale `v3.0` o va una `rc.8` | El veredicto de R2 en tres líneas y la recomendada (✅ 2026-11-15: `rc.8`, con el banco antes) |
| Cuando quiera, antes de la 6 | **El clic de P7** (firmar un cambio de freno en la pestaña del director, ~5 min): cierra el criterio 18 | `../vibe-kit-pruebas/rc7/p7-firma/LEEME-P7.txt` |
| Al final de la 5c | **Qué criterios de los 20 pasan a fase 2 por escrito** (los que piden una pestaña de VS Code, otra PC o una migración real) | La lista, cada uno con por qué no se pudo medir y la recomendada |
| En la sesión 6 | **OK para publicar la `v3.0`** (tag y push) | Qué se publica y qué cambia para él |

Todo lo demás lo decide la sesión que lo encuentra (ADR-034) y lo anota. Si Guido no está, lo de diseño **espera** y lo técnico sigue.

## Las reglas comunes de las sesiones 1 a 6

1. **No esperás el OK de Guido para arrancar** ni corrés `/inicio`: el OK ya está dado para esta tarea y solo para esta.
2. **Escribís solo lo de tu fila.** El tracker, `docs/README.md` y el handoff los escribe **el director** (sesión 0): vos dejás tu
   archivo y tu "Resumen para el director". No tocás `~/.claude/` (lo instala `kit-sync.sh sync`) ni los repos de Guido (Deptos,
   Hermes, Millennium…): de esos se **lee**, desde `origin/main` (`git show origin/main:<ruta>`) o desde un clon en el scratchpad,
   nunca se escribe en su carpeta.
3. **Tus subagentes nunca van en Fable** (regla de Guido): lectores, revisores e investigadores en Sonnet u Opus; el red team, Opus
   (`redteam-spec`). Lo que te traen es **dato, no verdad**: lo que afirmes fuerte, miralo vos en el archivo y la línea.
4. **Evidencia o NO VERIFICADO**; root cause, no parches; las tareas de más de 2 min en segundo plano; **nunca dos tandas pesadas a la
   vez** (suite + suite, suite + flota): si el director te dice que hay otra corriendo, esperás.
5. **Presupuesto** (ADR-029): ~4 h de reloj por sesión, una vuelta de revisor, pruebas proporcionales. Si no entra, cerrá lo que
   tengas bien y decí qué faltó: el director lanza la continuación.
6. **En criollo para Guido** donde le hablás a él: sin "rojo/verde" ("la prueba falló/pasó"), sin SHAs ni ids sueltos. Trabaja en la
   extensión de VS Code: nada del kit puede depender de herramientas que solo tiene la app de escritorio.
7. **Git**: la identidad es `guido.camera.eq@gmail.com` (nunca `eq.chatgpt`). Commits chicos por cambio, que terminan con
   `Co-Authored-By: Claude <modelo> <noreply@anthropic.com>`. Antes de cada push, `gitleaks git --log-opts="origin/main..HEAD"
   --no-banner` **sin tubería** (vibe-kit es público), después `git fetch origin && git rebase origin/main` y `git push origin HEAD:main`.
   Python con `py -3`; la terminal de Guido es PowerShell 5.1.
8. **Al terminar**: arriba de tu archivo (o, en las de construcción, en tu fila del spec) un **"Resumen para el director"** de máximo 15
   renglones: si terminó, qué cubrió y qué no, qué pruebas corrieron y con qué resultado, lo que espera a Guido, lo que más importa en
   una línea. Tu último mensaje en el chat: ese mismo resumen.
9. **Dónde están las cosas**: el tracker (`docs/kit-v3/PLAN-construccion.md`: "De la prueba real" 17-60, "Lo abierto, de un vistazo",
   "Cambios al plan", "Los 20 criterios"); los cinco informes de la revisión (`docs/kit-v3/REVISION-rc7-mirada1.md`, `-pruebas.md`,
   `-mirada2.md`, `-repos.md`, y el plan `REVISION-rc7-PLAN.md`); el plano madre (`docs/kit-v3/SPEC-0-kit-v3.md`) y el último delta
   (`SPEC-paquete-8c.md`, la `rc.6`); el ciclo (`docs/CICLO-DE-MEJORA.md`); las decisiones (`docs/DECISIONS.md`: ADR-029 presupuesto,
   ADR-030 la vara, ADR-034 lo técnico es de la sesión) y lo descartado (`docs/REJECTED.md`, REJ-017); el kit (`kit/`: el molde en
   `kit/molde/`, el Arquitecto y el Equipador en `kit/skills/`); los manuales (`manuales/`) y `GUIA-DE-USO.md`; las lecciones que
   Deptos escribió para el kit (`docs/metodo/para-el-kit.md` de Deptos, por `git show origin/main:`).

---

## Sesión 0 — El director del tramo final

**Modelo**: Opus 5.5. **La lanza** la sesión madre que escribió este archivo, cuando Guido diga "lanzá", y se desengancha.

> Sos el director del tramo final del kit v3, de la `rc.7` a la `v3.0`. Leé este archivo entero (`docs/kit-v3/TRAMO-FINAL-PLAN.md`)
> y el tracker en lo que este archivo nombra. Tu trabajo es que las sesiones 1 a 6 corran en orden y bien, sin que Guido tenga que
> empujar; **no escribís código ni specs**.
>
> 1. **Lanzás una sesión por vez** (`start_session`, contexto "fresh", el modelo de su fila, `use_worktree: false`, en esta carpeta),
>    con el prompt "leé `docs/kit-v3/TRAMO-FINAL-PLAN.md`; tu sección es la N, seguila", y su título de la tabla. Antes de lanzar,
>    `git pull --ff-only` y chequeá que no haya otra tanda pesada corriendo.
> 2. **Cuando una vuelve**, su nota es su informe, no la prueba: mirá vos el resultado (el archivo existe y dice lo que dice, los
>    commits están en `origin/main`, las pruebas que dice que pasaron tienen su salida). Leé solo su "Resumen para el director" y lo
>    que necesites para chequear; no releas los informes enteros.
> 3. **Integrás**: el tracker (la fila del tramo, "Lo abierto", "Cambios al plan" si algo cambió, los ítems de "De la prueba real" que
>    se cerraron, tildados con la fecha), la fila de cada archivo nuevo en `docs/README.md`, y commit con gitleaks. Sos el único que
>    escribe el tracker en este tramo.
> 4. **A Guido** le contás cada paso terminado en tres líneas, en criollo, y le pedís solo lo de la tabla "Dónde lo necesita a Guido",
>    una cosa por vez, la recomendada primero. Si no está, lo técnico sigue y lo de diseño espera; no lances la sesión siguiente si
>    depende de una respuesta suya.
> 5. **Si una sesión no terminó** (presupuesto, bloqueo), lanzás su continuación con lo que falta, en una sesión nueva, con la misma
>    sección y "seguí desde: …". Si una falla dos veces en lo mismo, pará y contáselo a Guido con opciones.
> 6. **Tu contexto**: cuidalo. Con cada sesión cerrada, un `/cierre` parcial (el handoff dice en qué sesión va el tramo y qué espera
>    a Guido), así otro director puede seguir si te llenás.
> 7. **Al final** (después de la sesión 6): el handoff entero al día y un resumen para Guido de todo el tramo: qué salió, qué quedó
>    para la `v3.1`, cuánto llevó.
>
> Arrancá lanzando la sesión 1.

## Sesión 1 — El spec de la `rc.7`

**Modelo**: Claude Fable 5.2, esfuerzo alto. **Escribe**: `docs/kit-v3/SPEC-paquete-8d.md` (el delta de la `rc.7`; `8c` fue la `rc.6`).

> Sos quien escribe el plano de la `rc.7`, la candidata a la `v3.0`. Guido: *"el spec es la parte más importante"*. El alcance ya
> está decidido (la sección "Lo que ya está decidido" de este archivo): tu trabajo es convertirlo en un delta que una sesión de
> construcción pueda seguir sin volver a pensar el diseño.
>
> 1. **Leé** lo decidido, los ítems 17-60 de "De la prueba real" (cada uno trae su evidencia y su "para el kit"), los cinco informes de
>    la revisión y el delta `SPEC-paquete-8c.md` (el formato a seguir: SPEC-0/delta, la tabla de cambios con su nivel, criterios
>    verificables, los encargos). Lo pesado, con lectores en Sonnet; lo que vayas a afirmar, miralo vos en el código de `kit/`.
> 2. **El cuadro conceptual primero** (cómo le gusta a Guido): qué sigue igual (lo de "lo que no se toca", A1-A10 de la mirada 2), qué
>    cambia y quién lo hace (el dueño, el director, el obrero, la sesión de cierre, el Equipador).
> 3. **Cada cambio** con: el ítem del tracker de donde sale, qué archivos toca, el criterio que lo prueba (que una prueba automática
>    pueda fallar si el cambio no está), el nivel de control (§3.6) y la tanda a la que va. **Partí las ocho partes en tres tandas que
>    no toquen los mismos archivos** (la propuesta de la madre está en "Las sesiones"; confirmala o cambiala con su razón) y cada tanda
>    tiene que entrar en ~4 h.
> 4. **Lo que hay que probar antes de prometerlo**, como un paso explícito de la tanda que lo usa: en la extensión de VS Code, si una
>    sesión puede renombrarse sola y si un mensaje entre sesiones llega por nombre (59); si el `autoMode` del settings de usuario
>    destraba publicar de fondo (37, pruebas 2); y lo demás que esté NO VERIFICADO en el tracker y la `rc.7` necesite. Si una prueba
>    sale mal, el spec dice qué se hace en su lugar.
> 5. **La noche de prueba de R2**: cómo se arma (el clon de Deptos en el scratchpad, al día a la `rc.7`; un módulo chico de dos o
>    tres encargos; publicar contra un remoto `bare` y una prueba de humo que no toque nada real), qué se mide y cómo se mide cada uno
>    de los cuatro criterios de éxito. La corre la sesión 5, sin Guido.
> 6. **Red team obligatorio** (toca frenos, permisos y la adopción): el agente `redteam-spec` en Opus sobre el spec terminado; lo que
>    encuentre, arreglado en el spec o descartado con su razón. Una ronda; si encuentra algo ALTO, una segunda solo de eso.
> 7. **El sello**: lo técnico lo decidís vos (ADR-034) y queda en una tabla "Decisiones de la sesión del spec"; lo de diseño que no
>    esté en "Lo que ya está decidido" se lo planteás a Guido, una por vez, en criollo, la recomendada primero, con qué de sus cuatro
>    cosas mueve. Con su OK, el estado pasa a `READY` con la fecha. Sin su OK queda en `BORRADOR` y el director se lo lleva.
>
> Presupuesto ~4 h. Escribís solo el spec (el director lo suma al índice y al tracker).

## Sesiones 2, 3 y 4 — La construcción, tandas A, B y C

**Modelo**: Opus 5.5. **Escribe**: `kit/` y lo que diga su tanda en el spec; las pruebas en `kit/**/*.test.cjs`.

> Sos la tanda <A|B|C> de la construcción de la `rc.7`. El plano es `docs/kit-v3/SPEC-paquete-8d.md` (READY): seguí **solo los
> cambios de tu tanda**; si el plano no alcanza para decidir algo técnico, decidilo vos (ADR-034) y anotalo en la tabla de decisiones
> de tu tanda en el spec; si es de diseño, pará ese cambio y seguí con los otros.
>
> 1. **Cada cambio**: la prueba primero (que falle sin el cambio), el cambio, la prueba que pasa, commit chico. Un cambio que toca un
>    freno lleva **red team de ese cambio** (`redteam-spec` en Opus, una ronda) y **mutación** en ese freno (`CICLO-DE-MEJORA.md` §3.6).
> 2. **Corrés solo las pruebas de los archivos que tocás** mientras trabajás. La suite entera **no** la corrés vos (salvo la tanda C).
> 3. **Los pasos de "probar antes de prometer"** de tu tanda, con su resultado escrito (pasó / falló / qué se hizo en su lugar).
> 4. **Un revisor frío** (Opus, sin tu contexto) al final, sobre el diff de tu tanda contra lo que pide el spec; lo que encuentre, arreglado
>    o anotado con su razón.
> 5. **Solo la tanda C, al final**: la suite entera **sola y en segundo plano** (`node --test "kit/**/*.test.cjs"`); la flota de prueba
>    (`bash pruebas/rehacer.sh` y la flota contra `alfa`, `beta` y `gama`, con la receta de la última `rc` en el tracker) y contra **un clon
>    real** en el scratchpad (Deptos, `--con-obra` si hace falta); si todo pasa: `kit/VERSION` `3.0.0-rc.7`, su nota de migración en
>    `kit/CHANGELOG.md`, el tag anotado `v3.0.0-rc.7` **después** de la suite, push, y `bash .claude/scripts/kit-sync.sh sync` (si el
>    clasificador lo frena, se lo pedís al director para Guido, en una línea de PowerShell). Si algo falla, no hay tag: lo arreglás o
>    lo dejás anotado para el director.
>
> Presupuesto ~4 h. Escribís en `kit/` y en tu parte del spec; el tracker lo integra el director.

## Sesión 5 — R2 y la noche de prueba

**Modelo**: Opus 5.5; revisores Opus. **Escribe**: `docs/kit-v3/REVISION-INTEGRAL-rc7.md`.

> Sos R2, la revisión integral final antes de la `v3.0`, con las reglas de la revisión integral del ciclo (`docs/CICLO-DE-MEJORA.md`)
> y la lección de R1b: **corre sobre un clon real**, no sobre repos de juguete. Solo lectura sobre el kit: no cambiás código ni docs;
> el único archivo del repo que escribís es el informe.
>
> 1. **La noche de prueba**, tal cual la arma el spec (`SPEC-paquete-8d.md`, "La noche de prueba"), sobre un clon de Deptos en el
>    scratchpad al día a la `rc.7`, sin dueño. Medís los cuatro criterios de éxito con su evidencia (la salida, el archivo, la hora).
>    En segundo plano, sola en la PC.
> 2. **Tres revisores Opus en paralelo, sin contexto previo**, como R1: (a) el día del dueño de punta a punta en un repo que se adopta
>    (preparar la PC trayendo un repo de la cuenta → adoptar → `/inicio` → algo chico y algo más que chico → el Arquitecto → director y
>    obreros → la noche → `/estado` a la mañana → poner al día la flota); (b) la coherencia: lo decidido contra el código, y entre piezas;
>    (c) la documentación contra el código (guía, manuales, playbook). Hasta 10 hallazgos cada uno, con su escenario.
> 3. **Los 20 criterios de aceptación** del kit entero (tracker): cuáles se pueden tildar con evidencia y cuáles no.
> 4. **El informe**: arriba, en criollo, **el veredicto: sale la `v3.0` o va una `rc.8`**, y por qué en tres líneas; después lo que le
>    afecta al dueño y lo de taller, cada hallazgo con su arreglo y si es grande (bloquea la `v3.0`) o chico (entra en la sesión 6 o en
>    la `v3.1`). "Grande" es: un criterio de éxito que no se cumple, un agujero de seguridad, o algo que rompe un repo al adoptar.
>
> Presupuesto ~4 h y ~5 subagentes.

## Sesión 5a — El banco de prueba (2026-11-15, pedido de Guido)

**Modelo**: Opus 5.5; un lector Sonnet por repo (nunca Fable). **Escribe**: `pruebas/banco/` (el script, genérico: sin nombres de
repos ni de clientes), `docs/kit-v3/BANCO-rc7.md` (en abstracto: vibe-kit es público) y el detalle por repo en el privado
(`../vibe-research/banco/`). Del kit, solo lectura.

Guido: *"que alguien intente el kit con todos mis repos reales, que haga pruebas falsas, intente adaptarlo… algo útil pero inocuo"*.
R2 probó un solo repo real (Deptos) y ahí salieron tres de los cinco grandes: el banco hace lo mismo con **todos**.

> Sos el banco de prueba de la `rc.7`. Hacés de dueño, con el kit, sobre **copias** de todos los repos de la cuenta de Guido (los que
> tienen el kit y los que no), y medís qué se rompe, qué pregunta y qué no se entiende. **Nada de lo real se toca.**
>
> **Lo inocuo, primero (no se negocia):**
> 1. **La foto de antes**: de cada carpeta real de proyecto (la carpeta de proyectos de la PC), `HEAD`, rama y `git status --porcelain`,
>    a un archivo del banco. **Al final, la misma foto y la comparación**: si algo cambió, eso va primero en el informe.
> 2. **Todo en una carpeta del banco** en el scratchpad: cada repo, `git clone` (de la carpeta real si está en la PC, si no de GitHub
>    con `gh`, solo lectura) y su `origin` cambiado a un `bare` local del banco. **Antes de cada `push`**, el script mira que el `origin`
>    caiga adentro del banco; si no, se niega.
> 3. **Sin llaves**: no se copia ningún `.env` (solo los `.env.example` versionados); las sesiones corren con un **HOME de mentira**
>    (`KIT_HOME_PC`, `GH_CONFIG_DIR` vacío, sin `GH_TOKEN`), así no ven el `~/.claude/` real, la sesión de `gh` ni la de Vercel o
>    Supabase. Las skills que publican (`release`, `deploy` y parecidas) salen en un commit del andamio; el "publicar", de mentira
>    (como el de R2). Docker no se toca.
> 4. Lo que no se puede aislar (la red), se dice en el informe.
>
> **Qué se prueba:**
> 1. **Primera vuelta, en todos los repos** (barata, un lector Sonnet por repo, de a uno o dos):
>    - preparar la PC con el HOME de mentira trayendo los repos de la cuenta (prueba C2 de verdad);
>    - adoptar los que no tienen kit (criterio 10) y poner al día con la flota los que lo tienen (G1 de R2: los scripts tocados a mano);
>    - `adoptar --verificar`, las pruebas propias de cada repo, un `/inicio` y un pedido chico de mentira (el tamaño en una línea).
> 2. **Segunda vuelta, en 2 o 3 repos elegidos** (cara, Opus, sola en la PC): un módulo chico con director y obreros, **la noche
>    entera** y `/estado` a la mañana, como la noche de R2. Elegí con variedad: uno que se usó entero, uno que nunca usó director y uno
>    recién adoptado.
> 3. **La tabla**: por repo, qué pasó en cada paso (pasó / falló / preguntó), con su evidencia; y la lista de hallazgos, cada uno
>    **grande** (rompe un repo, un criterio de éxito o un agujero) o **chico**, con su arreglo propuesto. Lo que ya está en R2
>    (G1-G5, c1-c21) no se repite: se marca "visto también en N repos".
> 4. **Los 20 criterios**: los que el banco deja tildar con evidencia (el 10 seguro; el 6, el 15 y el 19 si algún repo lo da).
> 5. **El script queda** para correrlo otra vez (5c) y en cada vuelta del ciclo.
>
> Presupuesto ~4-5 h. Si no entra, primero la vuelta 1 entera y una noche; el resto, anotado.

## Sesión 5b — La `rc.8`: todo corregido, con Fable

**Modelo**: **Fable 5.2** como modelo principal: decide y escribe los arreglos (Guido, 2026-11-15: *"correcciones quirúrgicas, con
Fable de tomador de decisiones"*). Sus subagentes, nunca en Fable: el red team y el revisor frío en Opus, las corridas largas
(suite, flota, banco) en Sonnet u Opus. **Escribe**: `docs/kit-v3/SPEC-paquete-8e.md` (delta corto), `kit/`, `kit/VERSION`
`3.0.0-rc.8`, `kit/CHANGELOG.md`, el tag. **La lanza el director, que verifica el modelo con `get_session`** (pedir Fable desde
Opus se ignora sin aviso: se corrige con `set_session_model`).

> Sos la `rc.8`, la última `rc` antes de la `v3.0`. Traés **todo** corregido, para que la sesión 6 no arregle código:
>
> 1. **El delta** (`SPEC-paquete-8e.md`, corto, formato delta): la lista entera con su origen: los cinco grandes de R2 (G1-G5,
>    `REVISION-INTEGRAL-rc7.md`), los grandes y chicos del banco (`BANCO-rc7.md`), los chicos de R2 (c1-c21) y lo que R2 dejó suelto
>    (`git-seguro.test` "4.7 caso 1", el renglón de `frenos.log` en la forma que anda en las dos versiones). De cada uno: el arreglo
>    **quirúrgico** (la función o la regla que cambia, no un rediseño), su prueba y si toca un freno. Lo que sea de diseño o no entre
>    sin rediseñar, a la `v3.1` con su razón. Sin sello de Guido: es un delta de arreglos (ADR-034); lo de diseño, se lo pregunta el
>    director.
> 2. **Cada arreglo**: la prueba primero (que falle sin el cambio), el cambio, la prueba que pasa, commit chico y push. Si toca un
>    freno, red team de ese cambio (Opus, una ronda) y mutación.
> 3. **Al final, en este orden y de a una**: el revisor frío (Opus) sobre todo el diff; la suite entera sola en segundo plano; la flota
>    de prueba (alfa, beta, gama) y **el script del banco, vuelta 1**, sobre las copias; si todo pasa, `kit/VERSION`, la nota de
>    migración, el tag `v3.0.0-rc.8` después de la suite, push y `kit-sync.sh sync`.
>
> Presupuesto ~6 h; si no entra, el director lanza su continuación (con el revisor, la suite, la flota y el tag).

## Sesión 5c — El banco otra vez

**Modelo**: Opus 5.5; lectores Sonnet. **Escribe**: `docs/kit-v3/BANCO-rc8.md`. Del kit, solo lectura.

> Sos la verificación final antes de la `v3.0`. Con el script del banco (`pruebas/banco/`) sobre la `rc.8`:
> 1. la vuelta 1 en todos los repos (lo que la 5b ya corrió no se repite: se lee su salida);
> 2. **la noche entera** en el clon de Deptos (la de R2) y en uno más de los que fallaron en 5a; los cuatro criterios de éxito con su
>    evidencia;
> 3. **solo lo que falló** en R2 y en el banco, uno por uno: arreglado o no;
> 4. los 20 criterios: cuáles se tildan y cuáles **le propone a Guido pasar a fase 2 por escrito**, cada uno con por qué;
> 5. arriba, en criollo, **el veredicto: sale la `v3.0` o no**, en tres líneas. "No" solo por algo grande; lo chico va a la sesión 6
>    como nota o a la `v3.1`.
>
> Presupuesto ~3 h. La foto de antes y después de las carpetas reales, como en 5a.

## Sesión 6 — La `v3.0` y el repo cerrado

**Modelo**: Opus 5.5. **Escribe**: lo de abajo; `/cierre` completo al final.

> Sos la sesión que saca la `v3.0` y deja el repo cerrado. Guido: *"cerrar el repo con todo el ciclo de mejora, cómo lo hicimos, todas
> las RC que son los fixes, cómo sacar una versión nueva"*.
>
> 1. **Sin arreglos de código** (desde el 2026-11-15 todo va a la `rc.8`). Si el banco otra vez (5c) dejó algo chico, solo texto o
>    docs; lo que sea código, a la `v3.1`. Con la lista de 5c, Guido pasa a fase 2 por escrito los criterios que no se pudieron medir.
> 2. **El ciclo escrito** en `docs/CICLO-DE-MEJORA.md` (es una receta, no una skill: regla de 3+), con la vuelta 1 vivida entera:
>    - **la 6b**: §3.5 (probar en un proyecto real y medir: lo que hicimos con Deptos, Hermes y los siete repos) y §8 (la fecha de
>      corte de la próxima vuelta y el diario);
>    - **cómo lo hicimos**: de la `rc.1` a la `v3.0`, cada `rc` con qué arregló y de dónde salió (el tracker y `kit/CHANGELOG.md`
>      tienen el detalle: acá va el resumen y el puntero, sin duplicar);
>    - **cómo sacar una versión nueva**: la receta paso a paso (la revisión, la charla, el spec, la construcción por tandas, el nivel
>      de control, la flota, el tag, poner al día los repos), escrita para la próxima vuelta.
> 3. **La `v3.0`**: el tag anotado sobre el mismo código de la última `rc` (más los arreglos chicos, con su suite), `kit/VERSION`
>    `3.0.0`, la nota en `kit/CHANGELOG.md`; **publicar (tag y push) con el OK de Guido**; `kit-sync.sh sync`.
> 4. **La portada y los docs**: `README.md` (100 % portada, sin versión ni pendientes), `GUIA-DE-USO.md` y `manuales/` al día con lo
>    nuevo de la `rc.7`; `docs/TODO.md` (salen la misión 5 y la 6; queda la 7, la `v3.1`, con lo que este plan manda allá); un ADR si
>    alguna decisión del tramo tuvo alternativas; los specs implementados marcados `✅ IMPLEMENTADO <fecha>` (no se archivan).
> 5. **Los chats de vibe-kit al privado** (`vibe-research`, `chats/<pc>/`, con `condensar.py`) y el diario, como dice el ciclo.
> 6. **Poner al día la flota** con la `v3.0`: los repos que Guido elija, con su OK.
> 7. `/cierre` completo (sync, docs, commit, push, `LIMPIO`).
>
> Presupuesto ~4 h; si no entra, el ciclo escrito y el tag primero, la portada después.
