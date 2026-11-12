# El tramo final: de la `rc.7` a la `v3.0` — el plan y los prompts de sus sesiones

> Asentado el 2026-11-12 con Guido, en la sesión 4 de la revisión de la `rc.7` (la madre nueva), en la PC `Usuario`. Este archivo
> es la fuente de los prompts: cada sesión se lanza con "leé `docs/kit-v3/TRAMO-FINAL-PLAN.md`, tu sección es la N, y seguila".
> Si algo de acá choca con lo que diga el handoff inyectado, manda este archivo; si choca con "Cambios al plan" del tracker con una
> fecha posterior, manda el tracker.

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
| 5b | `vibe-kit M5 · Tramo final · La rc.8` (solo si R2 la pide) | Opus 5.5 | si R2 encuentra algo grande | como la 4, con `3.0.0-rc.8` |
| 6 | `vibe-kit M5 · Tramo final · La v3.0 y el repo cerrado` | Opus 5.5 | con R2 que dice "sale" | el tag `v3.0`, el ciclo escrito, la portada, `/cierre` completo |

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
| Al final de la sesión 5 | Si sale `v3.0` o va una `rc.8` | El veredicto de R2 en tres líneas y la recomendada |
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

## Sesión 5b — La `rc.8` (solo si R2 la pide)

Como las sesiones 2-4 en una sola tanda: los hallazgos grandes de R2, con su prueba, red team si tocan un freno, la suite, la flota y
el tag `v3.0.0-rc.8`. Después, **solo lo de R2 que falló** se vuelve a mirar (no otra R2 entera), y sigue la sesión 6.

## Sesión 6 — La `v3.0` y el repo cerrado

**Modelo**: Opus 5.5. **Escribe**: lo de abajo; `/cierre` completo al final.

> Sos la sesión que saca la `v3.0` y deja el repo cerrado. Guido: *"cerrar el repo con todo el ciclo de mejora, cómo lo hicimos, todas
> las RC que son los fixes, cómo sacar una versión nueva"*.
>
> 1. **Los arreglos chicos de R2** que el informe manda acá (con sus pruebas), si los hay.
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
