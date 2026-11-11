# La revisión antes de la rc.7 — el plan y los prompts de sus cuatro sesiones

> Asentado el 2026-11-11 con Guido, en la sesión madre de la PC `Usuario`. Este archivo es la fuente de los prompts: cada sesión
> se lanza con "leé `docs/kit-v3/REVISION-rc7-PLAN.md`, tu sección es la N, y seguila". Si algo de acá choca con lo que diga el
> handoff inyectado, manda este archivo.

## Para qué

Antes de escribir el plano de la `rc.7`, una revisión de verdad en dos miradas, con Claude Fable 5.2 como el que piensa:

- **Mirada 1 — la fricción**: ¿lo que anotamos en el tracker (ítems 17-37 de "De la prueba real") es así, y qué más hay? Recorrer el
  kit como lo usa Guido y marcar cada lugar donde le toca hacer algo a mano, donde frena de más o donde le habla en jerga; y lo roto
  que aparezca en el camino.
- **Mirada 2 — el sistema**: ¿vibe-kit es un buen sistema de coding agéntico para hoy? Cómo encajan las piezas, qué reimplementa
  que Claude Code ya trae, qué le falta comparado con cómo se trabaja hoy, qué sobra, y qué anda y no hay que tocar.

El objetivo que guía las dos, el de la `rc.7`, dicho por Guido: **reducir las fricciones y mejorar el flujo del código, que él no
tenga que correr cosas a mano y le sea más fluido**. Afilado: *"el kit fluye: Guido no tipea nada, y una noche termina sola"*.

## Las cuatro sesiones

| # | Sesión | Modelo | Cuándo | Escribe (solo eso) |
|---|---|---|---|---|
| 1 | `vibe-kit M5 · Revisión rc.7 · Mirada 1: la fricción` | Fable 5.2, esfuerzo alto; lectores Sonnet | ya | `docs/kit-v3/REVISION-rc7-mirada1.md` |
| 2 | `vibe-kit M5 · Revisión rc.7 · Las tres pruebas` | Opus 5.5 | ya, en paralelo con la 1 | `docs/kit-v3/REVISION-rc7-pruebas.md` (y los repos de prueba, afuera) |
| 3 | `vibe-kit M5 · Revisión rc.7 · Mirada 2: el sistema` | Fable 5.2, esfuerzo alto; lectores e investigadores Sonnet | cuando terminen la 1 y la 2 | `docs/kit-v3/REVISION-rc7-mirada2.md` |
| 4 | `vibe-kit M5 · Revisión rc.7 · La charla y el plano` (la madre nueva) | Opus 5.5 | cuando termine la 3 | el tracker, `docs/README.md`, y después el plano |

Las lanza la sesión madre que escribió este archivo, una detrás de la otra, sin esperar a Guido (él lo autorizó: "ya te doy
autorización para que hagan lo que tengan que revisar"). La madre **no lee los informes**: solo su "Resumen para la madre", para ver
si la sesión trabajó bien, y lanza la que sigue.

## Las reglas comunes de las sesiones 1, 2 y 3

1. **No esperás el OK de Guido para arrancar**: el `/inicio` del repo dice "no toco nada sin OK"; acá el OK ya está dado para esta
   tarea y solo para esta. No hace falta correr `/inicio`.
2. **Escribís un solo archivo del repo**: el de tu fila. No tocás `kit/`, `~/.claude/`, el tracker (`docs/kit-v3/PLAN-construccion.md`),
   el handoff, el TODO, el CHANGELOG ni ningún otro doc; tampoco los repos de Guido (Deptos, Hermes…): de esos se **lee**, nunca se
   escribe ni se corre nada que escriba. La sesión 2 además escribe en los repos de prueba de `../vibe-kit-pruebas/`.
3. **Tus lectores van en Sonnet** (la regla de Guido: Fable solo en la sesión que decide; los que leen, revisan o buscan, en Sonnet u
   Opus). Usá la herramienta Agent con `model: "sonnet"`. Lo que te traen es **dato, no verdad**: lo que vayas a afirmar fuerte,
   miralo vos en el archivo y la línea.
4. **Evidencia o NO VERIFICADO**: cada afirmación lleva su fuente (`archivo:línea`, el commit, la hora de la charla, la URL con fecha).
   Si no lo pudiste ver, dice NO VERIFICADO.
5. **Presupuesto** (ADR-029): ~4 h de reloj y ~8 subagentes. Si no entra todo, cerrá lo que tengas y decí en el resumen qué faltó.
6. **En criollo para Guido** donde le hablás a él (el resumen y el veredicto): sin "rojo/verde" (decí "la prueba falló/pasó"), sin
   SHAs ni ids sueltos. Lo técnico va abajo, para la madre y el plano.
7. **Al terminar**: el archivo con un bloque **"Resumen para la madre"** arriba de todo (máximo 15 renglones: si terminó o no, qué cubrió,
   qué no, cuántos hallazgos y de qué tipo, lo que más importa en una línea). Después: commit **solo de tu archivo**, `gitleaks git
   --log-opts="origin/main..HEAD" --no-banner` (sin tubería; vibe-kit es público), `git fetch origin && git rebase origin/main` y
   `git push origin HEAD:main`. La identidad de git es `guido.camera.eq@gmail.com`. Tu último mensaje en el chat: el mismo resumen.
8. **Dónde están las cosas**:
   - El tracker: `docs/kit-v3/PLAN-construccion.md`, sección "De la prueba real" (ítems 17 a 37) y "Lo abierto, de un vistazo".
   - Los manuales: `manuales/` (ROLES, MOLDE, SCRIPTS, EQUIPADOR) y `GUIA-DE-USO.md`. Las decisiones: `docs/DECISIONS.md` (ADR-029
     presupuesto, ADR-030 la vara, ADR-034 la revisión integral) y lo descartado en `docs/REJECTED.md`.
   - El kit: `kit/` (el molde en `kit/molde/`, las skills del Arquitecto y del Equipador en `kit/skills/`).
   - Las dos noches de Deptos (solo lectura): el repo `C:/Users/Usuario/Desktop/Proyectos/Proyecto Deptos`, leído **desde
     `origin/main`** con `git show origin/main:<ruta>` (la carpeta de Guido puede estar atrasada: no hagas `pull` ahí). Módulo
     `pulido` (la primera noche, 2026-11-09/10) y módulo `cola` (la segunda, 2026-11-10/11): `docs/modulos/<x>/bitacora/` con
     `notas-del-metodo.md`, el reporte final, los encargos, las evidencias y los tiempos.
   - Las charlas de esas noches: `C:/Users/Usuario/.claude/projects/C--Users-Usuario-Desktop-Proyectos-Proyecto-Deptos--claude-worktrees-modulo--*`
     (director: `…modulo--pulido/d3f48853…jsonl` y `…modulo--cola/2c6ed11c…jsonl`; los obreros en `…modulo--<x>--NN/`). Son ~146 MB:
     **nunca se leen enteras**; se buscan cosas puntuales con `py -3 -I` y `json` (con `sys.stdout.reconfigure(encoding="utf-8")`).
   - Lo que vive en las memorias de Guido sobre cómo trabaja: usa **la extensión de VS Code** casi siempre y a veces la app de
     escritorio; nada del método puede depender de herramientas que solo tiene la app.

---

## Sesión 1 — Mirada 1: la fricción

**Modelo**: Claude Fable 5.2, esfuerzo alto. **Escribe**: `docs/kit-v3/REVISION-rc7-mirada1.md`.

Sos el revisor de la fricción del kit v3 antes de la `rc.7`. La pregunta: **¿dónde el kit le hace trabajar a Guido, y dónde no
fluye?** Guido lo dijo así: *"un montón de sesiones me están empezando a pedir que corra yo cosas, cuando habíamos dicho que la
gracia del kit era que fluya"*; *"/estado está escrito para el director y no para mí"*; *"me empezó a aparecer la palabra rojo"*.

Tres tareas, en este orden:

1. **Verificar lo anotado.** Cada ítem 17 a 37 de "De la prueba real": ¿es así en el código de hoy y en lo que muestran las dos noches?
   ¿La causa es la que dice? ¿El "para el kit" que propone arregla la causa o un síntoma? Marcá cada uno: confirmado · corregido (qué
   cambia) · no se sostiene (por qué). Ojo con lo ya corregido en el tracker (el 17 bajó de prioridad por Guido; el 31 se corrigió con la
   segunda noche: compactó a los 384 mil una y a los 801 mil la otra).
2. **El inventario de fricción.** Recorré el kit como lo usa Guido, de punta a punta: adoptar o preparar un repo · `/inicio` · pedir algo
   chico · el Arquitecto (Modo B) · el director y sus obreros · "me voy" y la noche · `/estado` · integrar, publicar y `/cierre` · la
   flota y "actualizate". En cada paso, listá todo lo que: (a) le pide a Guido tipear o pegar un comando; (b) lo deja esperando o le deja
   una tarea a mano para la mañana; (c) le habla en jerga (rojo/verde, SHAs, ids, nombres de scripts); (d) frena algo inocente o pide un
   permiso que después igual se da. Para cada uno: dónde vive (`archivo:línea` o el paso de la skill), si ya está en el tracker (qué
   ítem) o es nuevo, y qué lo sacaría.
3. **Lo roto que aparezca en el camino**: lo que no anda, se contradice entre piezas, o promete algo que el código no hace. Solo lo que
   veas con evidencia; nada "por las dudas" (regla de Guido).

Cómo repartir la lectura (sugerencia, ajustala): vos leés liviano lo que hace falta para entender el problema — el tracker (17-37 y "Lo
abierto"), `manuales/` y `GUIA-DE-USO.md`, los reportes finales y las notas del método de las dos noches, y los `SKILL.md` que Guido
toca todos los días (`kit/molde/skills/{inicio,cierre,director,obrero,estado}/`). Mandás 4 o 5 lectores Sonnet, uno por parte: (1) todo
lo que el kit le dice al dueño (mensajes de los scripts, líneas de "corré…", "te espera", rojo/verde) en `kit/molde/scripts/` y
`kit/molde/hooks/`; (2) los frenos (`git-seguro`, `sensible`, `secretos`, el candado, los githooks, `cambios aprobar`); (3) el camino
director → obrero → `verificar` → `integrar` → `cerrar` (`encargo.cjs`, `worktree.cjs`, `noche.cjs`); (4) el Arquitecto, el Equipador,
la adopción y la flota (`kit/skills/`); (5) las charlas de las noches, buscando puntual: cada denegación, cada "te espera", cada línea
que le dieron a Guido. El kit es grande (~620 mil tokens sin las pruebas): no lo leas entero.

**El informe** (`docs/kit-v3/REVISION-rc7-mirada1.md`): el "Resumen para la madre"; después **"En criollo, para Guido"** (media página:
qué encontraste, qué es lo que más le pesa); después **"Los ítems 17-37"** (una línea por ítem con su marca); **"El inventario de
fricción"** (una tabla por paso del recorrido: qué · dónde · ítem o nuevo · qué lo sacaría); **"Lo roto"**; y **"Lo que propongo para la
rc.7"** (ordenado por cuánto le saca a Guido, con su costo aproximado). No escribas el plano ni toques el código: eso viene después.

---

## Sesión 2 — Las tres pruebas

**Modelo**: Claude Opus 5.5. **Escribe**: `docs/kit-v3/REVISION-rc7-pruebas.md` (y lo que necesites en `../vibe-kit-pruebas/`).

Tres "no sé" que deciden el diseño de la `rc.7`. Probalos de verdad, en los repos de prueba (`../vibe-kit-pruebas/alfa`, `beta`, `gama`
y `remotos/`; si hace falta rearmarlos, `bash pruebas/rehacer.sh`; nunca en los repos reales de Guido). Lo que importa es **cómo
corre de noche en la extensión de VS Code**, que es donde corre el director de Guido: las sesiones de noche se lanzan sin ventana,
como lo hace el kit (`node .claude/scripts/encargo.cjs autorizado …` arma la línea: `claude.exe` de la extensión de VS Code, `-p`,
`--permission-mode auto` o `acceptEdits`, `--allowedTools …`, el pedido por stdin con `printf`; desde Git Bash nunca `-p "/algo"` por
argumento). Leé los ítems 33, 36 y 37 del tracker antes de empezar.

1. **¿Una sesión aislada en su worktree puede salir con `ExitWorktree` y trabajar en la carpeta principal, sin nadie mirando?** (ítem 36:
   la segunda noche, el subagente del cierre heredó el aislamiento y Claude Code le negó todo git sobre la carpeta principal; a la
   mañana, con Guido, la misma sesión salió con `ExitWorktree` `action: keep` y anduvo). Probá: una sesión de fondo que entra a un
   worktree con `EnterWorktree`, después `ExitWorktree` (keep), y desde la carpeta principal un `git pull --ff-only`, un commit y un push
   a un remoto de prueba. ¿Pide ventana? ¿El modo `auto` lo deja? ¿Y un subagente lanzado después de salir? Si `EnterWorktree` /
   `ExitWorktree` no existen en `-p`, decilo y probá la alternativa más simple que sí ande (otra sesión de fondo lanzada en la carpeta
   principal).
2. **¿Dejar autorizado de antemano un deploy alcanza para que el modo `auto` no lo frene?** (ítem 37). Sin claves reales y sin ningún
   proveedor real: un `.env` de prueba con un token inventado, un "deploy" de mentira (un script que solo imprime), y tres caminos: (a)
   el comando que lee el `.env` directo, (b) un envoltorio que inyecta el entorno sin mostrarlo (como `scripts/conenv.py` de Deptos o
   `cargar-secreto` del kit), (c) lo mismo con la regla `allow` del proyecto y una línea de `autoMode` que lo declara rutina. ¿Cuál pasa,
   cuál frena, y con qué mensaje? Solo configuración oficial (permisos, `autoMode`): **nada que esquive al clasificador**; el objetivo es
   saber si la autorización legítima anda.
3. **¿Cómo se hace que aprobar un cambio de freno sea un clic de Guido y no un comando?** (ítem 33; hoy `cambios.cjs aprobar` lo niega
   un hook desde una carpeta de agente y "un agente no aprueba": `kit/molde/hooks/niega-aprobar.cjs` y `kit/molde/scripts/cambios.cjs`).
   Mirá qué chequea hoy la firma y probá si una pregunta con botones o la ventana de permiso de esa misma acción, en la sesión
   principal, puede ser la firma, sin que un agente se la pueda dar solo. Lo que necesite un clic humano de verdad, dejalo armado y
   marcado NO VERIFICADO (no inventes el clic).

**El informe**: el "Resumen para la madre"; después, por prueba: qué probaste (los comandos y su salida), qué pasó, qué quiere decir para
el diseño de la `rc.7`, y lo que no pudiste probar. No toques `kit/`: si algo del kit está mal, se anota acá.

---

## Sesión 3 — Mirada 2: el sistema

**Modelo**: Claude Fable 5.2, esfuerzo alto. **Escribe**: `docs/kit-v3/REVISION-rc7-mirada2.md`. **Arranca cuando estén**
`REVISION-rc7-mirada1.md` y `REVISION-rc7-pruebas.md` en `origin/main`: leelos primero, son tu punto de partida.

La pregunta de Guido: *"¿es un buen sistema de coding agéntico para la época actual, o necesita muchos más ajustes u otra cosa le está
faltando? Quizá traer recursos, sumar skills"*. Sos una mirada desde afuera y desde arriba, con lo que encontró la mirada 1.

1. **¿Las piezas encajan?** El camino entero: Arquitecto → ficha (`.claude/kit.md`) → director y obreros → el gate de cada encargo →
   `integrar` → `/cierre` → la flota y el actualizador. Dónde se pisan, se contradicen, se pasan la pelota o dejan un hueco.
2. **¿Qué hace el kit a mano que Claude Code ya trae hoy?** Comparalo contra la herramienta de hoy, con su documentación oficial y su
   fecha: worktrees nativos (`EnterWorktree`/`ExitWorktree`), tareas de fondo que despiertan a la sesión, `Monitor`, flujos de varios
   agentes, sesiones programadas, el modo `auto` y su configuración (`autoMode`), hooks, skills, plugins, mensajes entre sesiones.
   Lo que se pueda delegar es código menos para mantener y menos fricción; lo que no, decí por qué.
3. **¿Qué le falta comparado con cómo se trabaja hoy con agentes?** Buscá afuera con 2 o 3 investigadores Sonnet (la documentación
   oficial de Anthropic y de Claude Code primero; la comunidad después, con fuente y fecha, y diciendo si es una práctica extendida o
   una opinión suelta). Antes, leé lo que el observatorio ya juntó (`observatorio/`, las tandas de `tips/`) para no repetirlo.
4. **¿Está sobredimensionado?** ~40 mil líneas de kit y ~40 mil de pruebas, para el método de una persona. Qué sobra, qué se puede
   simplificar, qué se puede sacar sin perder lo que protege.
5. **Lo que anda y no hay que tocar**, dicho explícito (por ejemplo: dos noches sin intervenciones de Guido, el revisor frío, la
   prueba por encargo, el gate por script).

Las reglas para no desbordarte: (a) leé `docs/DECISIONS.md` y `docs/REJECTED.md` antes de proponer: lo descartado (el plugin, el
asistente web…) solo vuelve con evidencia nueva y diciéndolo; (b) cada propuesta pasa la vara del ADR-030 (¿vale más que lo que
cuesta?) y dice cuál de las cuatro cosas de Guido mueve: flujo de trabajo, mejor código, consistencia, acordarse de menos; (c) sumar
una skill o un recurso pasa por la curaduría del menú (`kit/skills/arquitecto-skills/menu-skills.md`): fuente oficial, regla de 3+,
nada "por las dudas"; (d) sos el observatorio: mirás y proponés, no tocás el sistema (restricción 4 del `CLAUDE.md`); (e) no
propongas rehacer todo: si algo grande cambia, que sea con su porqué y su camino por pasos.

**El informe**: el "Resumen para la madre"; **"El veredicto, en criollo"** (una página: ¿es un buen sistema para hoy? lo que tiene de
bueno, lo que le falta, lo que le sobra); **"Cómo encajan las piezas"** (con un diagrama en texto si ayuda); y **"Las propuestas"**, cada
una con: seguir igual · cambiar · sacar · sumar; la evidencia; el costo; cuál de las cuatro cosas mueve; y adónde va: `rc.7`, `v3.1` o
nunca. Cerrá con **"Lo que no miré"**.

---

## Sesión 4 — La charla y el plano (la madre nueva)

**Modelo**: Claude Opus 5.5. Trabaja en la carpeta principal de vibe-kit (escribe el tracker). **Arranca cuando estén** los tres
informes en `origin/main`.

Sos la sesión madre nueva de la recta final. Leé los tres informes (`REVISION-rc7-mirada1.md`, `REVISION-rc7-pruebas.md`,
`REVISION-rc7-mirada2.md`) y este plan. Tres cosas, en orden:

1. **Al tracker**: lo que confirmen o corrijan los informes en los ítems 17-37, y lo nuevo como ítems nuevos de "De la prueba real" (con su
   fuente: el informe y su sección), y "Lo abierto, de un vistazo" al día. Una fila en `docs/README.md` por cada informe nuevo de
   `docs/kit-v3/`. Commit y push (gitleaks antes, sin tubería).
2. **La charla con Guido** (él está para esto): prepará **las decisiones que son de él**, de a una, en criollo, con la opción que
   recomendás primero y la vara del ADR-030 (para cada una: qué mueve de sus cuatro cosas). Las técnicas las decidís vos (ADR-034) y se
   las contás en una línea. Separá lo que va a la `rc.7` de lo que va a la `v3.1`. Empezá la charla con el cuadro conceptual: qué sigue
   igual, qué cambia, quién lo hace.
3. **Con lo decidido, el plano de la `rc.7`**: `docs/kit-v3/SPEC-paquete-<N>.md` con el formato de los anteriores (delta, criterios, los
   encargos, red team obligatorio porque toca frenos y permisos), y su nivel de control según `docs/CICLO-DE-MEJORA.md` §3.6. El criterio
   de éxito de la `rc.7` sale del objetivo: en una tercera noche en Deptos, 0 comandos tipeados por Guido, la noche termina publicada
   sola, `/estado` con sus cuatro secciones, y nada de lo que le llega dice "rojo".

No esperás el OK para leer y escribir el tracker; sí para lo que decide Guido.
