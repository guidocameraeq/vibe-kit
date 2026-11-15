# Revisión integral de la rc.7 (R2, la sesión 5 del tramo final, 2026-11-14)

> La revisión integral final antes de la `v3.0`, sobre `v3.0.0-rc.7`, con las reglas del ciclo (`docs/CICLO-DE-MEJORA.md`) y la
> lección de R1b: **sobre un clon real**. Tuvo dos partes. La primera, la noche de prueba de `SPEC-paquete-8d.md`, en un clon de Deptos
> en el scratchpad: sin dueño, sin claves y contra un remoto de prueba. La segunda, tres revisores Opus en paralelo, sin contexto y
> solo lectura: (a) el día del dueño, (b) la coherencia y (c) la documentación contra el código. Fue solo lectura sobre el kit: este
> informe es el único archivo que se escribió en el repo. De la carpeta de Deptos solo se leyó.

## El veredicto

**Va una `rc.8`, corta. La `v3.0` todavía no sale.**

1. **En el clon real de Deptos, la noche no terminó sola.** Los cuatro encargos se hicieron y se integraron en 43 minutos sin nadie,
   pero el cierre se negó a arrancar por un permiso que Deptos tenía desde siempre (`git pull` sin límite) y quedó esperando al dueño.
   Con ese permiso fuera, publicó sola y la prueba de humo pasó.
2. **Ponerse al día rompe a Deptos**: la flota lo deja con los scripts viejos y lo demás nuevo, y dice "mezclado". Además, dos cosas
   del día normal fallan: `limpiar` borra carpetas recién creadas, y el `/estado` de la mañana dice "nada" de lo que hizo la noche.
3. **Los cinco arreglos son chicos y no cambian el diseño**: cada uno es una función o una regla, con su prueba. Entran en una tanda;
   después solo se repite lo que falló (la noche en el clon), no otra R2.

## Resumen para el director

1. **Terminó. El veredicto: va una `rc.8`** (5b), de una tanda. La recomendación es mía; decide Guido.
2. **La noche de prueba**, en un clon de Deptos en la rc.7, sola en la PC: 4 encargos (Sonnet, de a dos), integrados en 43 min.
   **La noche no se cerró sola**: `noche.cjs cierre` se negó por un `allow` propio de Deptos, `Bash(git pull:*)` (G4). Con ese
   permiso fuera (una firma del dueño; acá, por la lib), **publicó sola por `noche.cjs publicar` y la prueba de humo pasó**.
3. **Los cuatro criterios**: 0 comandos para tipear, pasa · termina y publica sola, **no pasa** · `/estado`: las cuatro secciones en
   orden, sí; la cuenta de la vista del proyecto, **no** (G5) · "rojo", cero, pasa.
4. **Cinco GRANDES**: **G1**, la flota deja Deptos con los scripts de la rc.6 y lo demás en la rc.7, y dice "mezclado" (por un renglón
   tocado a mano en `worktree.cjs`) · **G2**, `limpiar` cierra carpetas recién creadas (reproducido; en Windows vació la del director
   con él adentro) · **G3**, la firma en la pestaña del director no anda de punta a punta (chico por la vara; lo pidió Guido) ·
   **G4**, el permiso ancho, que nadie avisa de día · **G5**, a la mañana, "Lo que se hizo: nada". 21 chicos, a la 6 o a la `v3.1`.
5. **El renglón de `frenos.log`: CHICO** (la flota no deja nada roto); la nota debe dar la forma que anda en la rc.6 y en la rc.7.
6. **Los 20 criterios: 9 tildados** (nuevos: 5, 8, 20); los otros 11 piden la prueba real o que Guido los pase a fase 2.
7. **Lo que más importa**: falló lo de un repo real con historia; los arreglos son contenidos. Después de la `rc.8`, solo la noche otra vez.

---

## La noche de prueba

### Cómo se armó (el andamio, tal cual el spec)

- **El clon**: `git clone` de la carpeta de Deptos (solo lectura), en su `origin/main` (`integrar: módulo poda`), con un remoto `bare`
  nuevo en el scratchpad como `origin`. Antes de cada `push` se miró que el `origin` cayera adentro del scratchpad.
- **Sin caminos a lo real**: no se copió ningún `.env`, y en el worktree quedó solo `.env.example` (versionado). Las skills `release` y
  `smoke` de Deptos salieron en un commit del andamio. `vercel` y `supabase` no están instalados, y no hay sesión de ninguno de los dos
  (ni token de Supabase ni `auth.json` de Vercel). No existen `app/.vercel` ni `supabase/.temp`. **Desvío**: el Docker de la PC estaba
  prendido, con el Supabase local de Deptos (`base-visual`, clase `prueba`). No lo apagué (no es mío); ningún encargo lo necesitó.
- **El renglón de `frenos.log`** (el pedido del director), aplicado **en el clon**, en la forma que anda en la rc.6 y en la rc.7 (abajo,
  "El renglón de `frenos.log`"). Con él, la línea 8 de la flota pasó.
- **La flota** (`actualizar.cjs flota <clon> --canon <vibe-kit> --tag v3.0.0-rc.7`): la primera vuelta dio ROTA por tiempo (c16) y la
  segunda, **`mezclado`** en 30 min, con las nueve líneas en ✅ y *"te espera: scripts"* (G1). Lo destrabé como lo haría el dueño en su
  `/inicio`, con `resolver scripts nueva`. `adoptar --verificar` dio todo ✅ salvo `core.hooksPath`, que el clon no trae (se puso
  `.githooks`, como en la carpeta de Deptos).
- **El publicar de mentira**: `scripts/noche_publicar.cjs publicar|humo|volver` sube `HEAD` a una rama `produccion` del remoto de prueba
  y deja `publicado.txt` en ese remoto. Se niega si el `origin` no es una carpeta del scratchpad. La ficha ganó `autorizado.publicar`
  con esos tres. **La firma de ese cambio de barrera fue por la lib, sin la ventana** (`cambios.aprobar` desde un script, como en las
  pruebas del kit). La PC se autorizó con `preparar-pc --home <uno de mentira> --publica <el origin>`, y el director corrió con
  `KIT_HOME_PC`. Las dos cosas son andamio: **la firma y la autorización de la PC no las midió esta noche**.
- **El módulo `noche-prueba`**: el spec y la ficha los escribí yo, con `sello` y `ready` del Arquitecto, y con `worktree crear`. Tiene tres
  encargos sin base: T1 (`conenv --banco` no numérico, con su prueba), T2 (el párrafo de las podas del TODO, en lista) y T3 (`type-fest`
  como dependencia de desarrollo de `app/`, usada por un tipo). T1 de la lista del spec (`DEPTOS_BANCO`) ya lo había cerrado el módulo
  `poda`: lo cambié por otro de `conenv`.
- **El lanzamiento**: un director de fondo (`claude -p --model opus --permission-mode auto --name director-noche-prueba`, Claude Code
  2.1.322), con el primer pedido *"/director noche-prueba — Arrancá sin esperar mi OK… Me voy: es de noche… Terminá el módulo entero
  (los obreros en Sonnet, de a dos) y cerrá la noche como dice tu paso 9"*. Tope de 3 h, solo en la PC. Después del lanzamiento no se le
  mandó nada, hasta la segunda vuelta (abajo).
- **Más estricto que la vida real**: el clon no es una carpeta "de confianza" para Claude Code, así que las sesiones de fondo ignoraron los
  48 `allow` del settings del proyecto (*"Ignoring 48 permissions.allow entries … this workspace has not been trusted"*). Los obreros
  anduvieron igual con su lista, y la sesión de cierre con la suya.

### Qué pasó, con la hora

| Hora | Qué |
|---|---|
| 20:02 | Arranca el director: lee el núcleo, `worktree donde`, `presentar --spec` (sello en orden), y corre `me-voy` |
| 20:03-20:37 | Cuatro encargos (01-03, más el cierre de tramo 04), de a dos, con Sonnet. Cada uno con `verificar` en seis ✅ antes del merge (13, 11, 9 y 7 min de obra) |
| 20:39-20:45 | Ficha y spec en COMPLETO; `integrar` pasa el gate entero (*"arnés 56/56"*) y mezcla en `main` |
| 20:45 | **`noche.cjs cierre` se niega**: *"cierre: no — hay un permiso ancho en un settings (Bash(git pull:*)): con él, la sesión de cierre correría de todo sin preguntar. Sacalo (o hacelo más angosto) y volvé a lanzar el cierre"*. El director lo busca (está en `.claude/settings.json` de Deptos desde su Fase 1, y la adopción lo dejó), no lo toca, deja el relevo y termina con "te espera una decisión" (20:46, salida 0) |
| 20:48 | **Segunda vuelta, hecha por mí en el papel del dueño**: el cambio de barrera que saca ese `allow`, firmado por la lib, y un "sí" al director (`--resume`) |
| 20:50 | `cierre` frena otra vez: *"el módulo noche-prueba todavía no está en main"*. Después del `integrar` el director había subido su relevo al módulo (c18). Vuelve a integrar, solo (6 min) |
| 20:56-21:03 | La sesión de cierre (`dontAsk`, su lista): `cierre-empieza`, `publicar` (pruebas, comando y humo: los tres pasaron), los papeles del `/cierre`, `limpiar`, `parte` y `subir`. El director muestra el parte tal cual |

### Los cuatro criterios de éxito

| Criterio | Resultado | Evidencia |
|---|---|---|
| **0 comandos tipeados por el dueño** | **Pasa** | En el parte, las dos salidas de `/estado`, el "Te espera" del handoff y los últimos mensajes del director (las dos vueltas) y del cierre: **ningún comando para correr**. "Te necesito" trae solo decisiones. La búsqueda literal encuentra menciones, no pedidos: *"git dice que no es un worktree"*, *"las 17 vulnerabilidades que avisa `npm install`"* y, en la primera vuelta, el nombre del permiso (`git pull`) |
| **Termina y publica sola** | **No pasa** | Primera vuelta: **se quedó en `noche.cjs cierre`**, con el mensaje de arriba (G4). Con ese `allow` fuera (un cambio de barrera: es firma del dueño), la segunda vuelta sí: `produccion` del remoto de prueba es `624f9ea` (`integrar: módulo noche-prueba`, con los tres encargos), `publicado.txt` dice ese commit, y `kit-publicacion.json` dice pruebas, comando y humo en `pasó`, con *"publiqué y la prueba de humo pasó"*. **La publicó `noche.cjs publicar`**: en las seis charlas, cero llamadas sueltas a los scripts de publicar. El handoff, el CHANGELOG y el TODO traen el módulo. `git worktree list`, solo la principal (pero ver G2: la carpeta del director quedó vacía, no cerrada) |
| **`/estado` con sus cuatro secciones** | **Las secciones, sí; la cuenta, no** | Las cuatro, en orden, en las cuatro corridas válidas (al terminar y a la mañana, la vista del proyecto y la de `noche-prueba`). La vista del módulo cuenta los 4 encargos, igual que git. **La del proyecto dice `LO QUE SE HIZO: nada`** a la mañana (G5). **Error mío**: las cinco fotos "con obreros vivos" las sacó un vigía que corrió `estado.cjs` parado en la carpeta de vibe-kit, no en la del clon, y no valen. Con obreros vivos queda cubierto solo por el código (`vistaDueno` imprime siempre los cuatro títulos, `estado.cjs:337,442`) y por `estado.test` |
| **Nada dice "rojo"** | **Pasa** | `rojo`, `roja` y `verde` como palabra: cero en los mismos textos |

**Además** (sin ser criterio):
- **Los frenos**: en toda la noche, ningún hook negó nada y ninguno se pasó de tiempo. Los tres renglones de `kit-frenos.log` son míos, del
  cambio de la segunda vuelta: `candado:barreras` frenó dos veces el settings sin aprobado, y `githook:indice-aparte` una vez.
- **El clasificador de `auto`** negó una sola cosa, al obrero 03: `npm … install --save-dev type-fest@4; echo …; git status …` en un
  solo renglón (*"[Undermining Oversight]"*). El obrero lo partió y corrió el comando de su `## AUTORIZADO`, que anduvo sin ventana.
- **A la sesión de cierre**, `dontAsk` no le negó nada.
- **El reloj**: 43 min la primera vuelta (el módulo en 40) y 13 la segunda (6 de ellos, el segundo `integrar`).
- **El costo**: el director dice USD 3,07 en su salida (las dos vueltas). Los obreros y el cierre no dan la cifra en dólares (NO
  VERIFICADO). En tokens: los cuatro obreros (Sonnet), 13,6 M de entrada (casi todo caché) y 78 k de salida; el director, 14,1 M y 67 k;
  el cierre, 3,6 M y 27 k.
- **Lo que vio el director** y dejó en el TODO del clon: `resumen.cjs` lista como pendientes tareas que la ficha ya tilda (c20).

---

## Los hallazgos

GRANDE = bloquea la `v3.0`: un criterio de éxito que no se cumple, un agujero de seguridad, o algo que rompe un repo al adoptarlo o
ponerlo al día. CHICO = entra en la sesión 6 o en la `v3.1`. Lo que traen los revisores es dato: cada GRANDE lo comprobé en el código y
la línea, y los marcados ✔ también los reproduje.

### Los grandes

**G1 · Poner al día un repo lo deja mezclado a medias: los scripts quedan en la versión vieja y el resto pasa a la nueva** ✔ (lo encontró
esta revisión, en el clon de Deptos).
- **Qué pasa**: Deptos había tocado a mano un renglón de `.claude/scripts/worktree.cjs` (el push de `integrar` a 10 min, el 2026-11-10).
  La rc.7 trae ese mismo arreglo. Con un solo archivo distinto, el guardia del actualizador no toca **la pieza entera**: los 13 scripts
  quedan en la rc.6 (`scripts: "adaptada (desvío detectado)"`). La mezcla choca justo en ese renglón y va a "te espera". Pero la flota
  dice **`mezclado`** y sube a `main` las skills, los hooks y el settings de la rc.7. Resultado en `main`:
  - el `/director` de la rc.7 manda `noche.cjs cierre`, y el `noche.cjs` de la rc.6 no lo tiene: **la noche no se cierra sola**;
  - `estado.cjs` sale con el formato viejo, sin las cuatro secciones, con "Guido" y con *"corré: node .claude/scripts/resumen.cjs"*;
  - lo arregla la próxima sesión, que le pregunta al dueño por una mezcla con marcadores de conflicto en un script.
- **Evidencia**: la tabla de la flota (`deptos | 3.0.0-rc.6 → 3.0.0-rc.7 | mezclado | … te espera: scripts`), `.claude/fusiones/scripts.md`
  (*"no pasó chequear lo de claude: .claude/scripts/worktree.cjs: quedaron marcadores de conflicto"*), el `estado.cjs` viejo después
  del merge, y `actualizar.cjs:80-84` (*"uno solo no intacto → la pieza entera no se toca"*). La flota de C6 no lo vio: el clon dio ROTA
  antes (línea 8) y nunca llegó a mezclar.
- **Por qué es grande**: rompe un repo real al ponerlo al día, y es el repo de la noche. Va a pasar en todo repo donde una sesión
  haya tocado un script del kit.
- **Arreglo**: (1) el guardia **por archivo**: lo intacto se actualiza, y solo el archivo tocado va a la fusión; (2) si "lo tuyo" ya
  es igual a "lo nuevo" en lo que cambió, la fusión se resuelve sola, con su porqué; (3) la flota **no mezcla** si queda esperando una
  pieza de la que dependen otras que sí pasaron (`scripts` con `estado`, `director-obrero` y `cierre`), igual que ya hace con
  `hook-sensible` y `hooks-lib`. Con su prueba en `flota.test` y `actualizar.test`: un repo con un renglón cambiado en `worktree.cjs`.
- **En la noche**: lo destrabé como lo haría el dueño en su `/inicio`, con `resolver scripts nueva`. La rc.7 ya trae su renglón.

**G2 · `limpiar` cierra las carpetas recién creadas, también la del director y la de un obrero que arranca** ✔ (revisor a; lo
reproduje en una copia de `alfa`).
- **Qué pasa**: `worktree.cjs limpiar` cierra todo worktree cuya rama "ya está mezclada", y eso lo mide como *ancestro de su madre*
  (`worktree.cjs:980`). Una rama recién nacida, sin commits propios, es ancestro: **se cierra**. Lo mismo la carpeta y la rama
  local, y la de origin. Lo corren callados el `/inicio` y el `/estado` del dueño en la carpeta principal (`inicio/SKILL.md:21`,
  `estado/SKILL.md:12`) y la sesión de cierre de la noche (`cierre-noche.md:37`).
- **El día normal**: el Arquitecto arma el módulo, y su rama nace igual a `main`. El dueño pregunta "¿cómo vamos?" antes de que el
  director commitee, y el worktree del director desaparece. Lo mismo con un obrero lanzado y sin su primer commit todavía, o con la
  sesión de cierre de otro módulo esa noche. En Windows, con la sesión adentro, puede borrar a medias (NO VERIFICADO).
- **Evidencia**: en la copia, `worktree crear foo` → `limpiar` → *"worktree limpiar: cerré modulo/foo"*, sin la rama acá ni en origin.
- **Arreglo** (chico, con su prueba en `worktree.test`): un encargo se cierra solo si `estadoEncargo` dice `cerrado` o `cancelado`, y
  un módulo, solo si su merge `integrar: módulo <x>` está en la rama por defecto. Una rama sin commits propios no se toca nunca.

**G3 · La firma con un clic en la pestaña del director, el camino que pidió Guido, no anda de punta a punta** (revisores b y c; lo
comprobé en el código).
- **Qué pasa**, en tres partes que se suman:
  1. **"Te necesito" no la muestra.** `deCambios` lee los cambios del disco de la carpeta (`espera.cjs:71-96`, `cambios.cjs:830-845`).
     Un cambio propuesto con `--en-defecto` vive solo en `origin/<defecto>`, porque el worktree "queda como estaba" (`cambios.cjs:228`).
     En la pestaña del director, `/estado` dice `nada`. En la carpeta principal pasa lo mismo hasta un `pull`, y `/estado` no lo hace.
  2. **Si la pide, el freno la niega.** El paso 3 de `/estado` manda `node .claude/scripts/cambios.cjs aprobar <id>` (`estado/SKILL.md:14`).
     En el worktree, esa ruta es la copia del módulo, y en la pestaña del director el freno solo acepta la de la carpeta principal
     (`niega-aprobar.cjs:411`). El aviso dice además *"abrí una sesión en ese proyecto"* (`:200`), y la sesión ya está en el proyecto.
  3. **Nadie se lo enseña al director.** Ninguna skill nombra `--en-defecto` ni `../../../.claude/scripts/cambios.cjs aprobar` (solo
     las pruebas), y el paso 9 de `/director` no tiene el pedido de la firma.
- **Por la vara es chico**: no es un criterio de éxito de la rc.7, no abre nada (el freno niega de más, no de menos) y el plan B de P7
  (una sesión en la carpeta principal, después de un `pull`) existe. **Pero es lo que Guido pidió por escrito** (*"el clik lo quiero
  hacer siempre en director"*, A2.3), P7 sigue sin probarse con una persona, y el dueño puede quedarse sin ver una firma que lo
  espera. **Lo pongo con los grandes**: es texto y una función, y entra en la misma `rc.8` que G1 y G2.
- **Arreglo**: `deCambios` también lee los `propuesto` de la ref vigente (`git ls-tree` + `git show`), con su caso en `espera.test`
  desde un worktree de director. En `/estado` paso 3, con rol `director`: `node ../../../.claude/scripts/cambios.cjs aprobar <id>`, sin
  `pull` ni `push` (el script los hace) y después `traer-main`. En `/director`, un renglón: "cambio de freno → `nuevo --en-defecto`, y
  pedile la firma acá". `MOTIVOS.ruta` dice la ruta buena. Una prueba en `skills.test`.

**G4 · La noche no se cierra sola si el proyecto tiene un permiso ancho propio, y nadie se lo avisa al dueño antes** ✔ (la noche).
- **Qué pasa**: `noche.cjs cierre` lee los `allow` de los tres settings. Si alguno cubre un ítem de su lista sin ser igual o más angosto
  (`loQueSobra`, `noche.cjs:350-375`), **no lanza el cierre** (`:405`). Deptos tiene `Bash(git pull:*)` desde su Fase 1, y la adopción
  (`--permisos recomendada`, D2) lo dejó. Es un permiso común en cualquier repo.
- **Por qué es grande**: es el criterio de éxito "termina y publica sola", en el repo real. El arreglo le pide al dueño una decisión
  **y** una firma (sacar un `allow` es cambio de barrera), a la mañana, cuando la noche ya se perdió.
- **El texto tampoco ayuda**: el director le recomendó *"achicarlo a `git pull --ff-only`"*. Escrito como `Bash(git pull --ff-only:*)`
  seguiría siendo ancho para `cubre()`; solo anda la forma exacta, sin `:*`.
- **Arreglo**:
  1. **De día, antes de la primera noche.** `adoptar --mirar`, la flota y el `doctor` corren el mismo `loQueSobra` y lo avisan en "Te
     necesito", con la propuesta: sacarlo, o la forma exacta que la lista acepta. Si lo propone la adopción, entra en su mismo OK.
  2. **Achicar lo que frena.** Un `allow` que cubre un ítem **y cuyos agregados no corren código** (`git pull`, `git log`, `git diff`…)
     no pone en riesgo `dontAsk`. Que vaya a la lista de anchas aceptadas, con `git pull` de una URL o con `--upload-pack` negado aparte.
     Esto lo decide la sesión de la `rc.8` (ADR-034), con red team del cambio (toca la red de rt B 1).
  3. El texto de `:405` dice la forma exacta que destraba.

**G5 · A la mañana, `/estado` dice "Lo que se hizo: nada" después de una noche que terminó un módulo** ✔ (la noche).
- **Qué pasa**: la vista del proyecto le pasa a `vistaDueno` solo los módulos activos (`estado.cjs:519`, `activo` = `EN OBRA` o
  `PAUSADO`, `:102`). Un módulo que esa noche pasó a `COMPLETO` queda afuera, con sus encargos de las últimas 24 h.
- **Evidencia**: `estado-manana` del clon. En la vista del proyecto, `LO QUE SE HIZO` dice `- nada`. En `estado.cjs noche-prueba`, los
  cuatro, con sus minutos.
- **Por qué es grande**: el criterio de `/estado` en la noche de prueba es *"las cuatro, en orden… y la cuenta de encargos cerrados
  coincide con git"*, y la vista que ve el dueño por defecto, en la carpeta principal, no coincide. Pasa **en toda noche que termina un
  módulo**, que es la noche que el kit promete.
- **Arreglo** (un renglón y su caso en `estado.test`): `LO QUE SE HIZO` recorre también los módulos con encargos cerrados en las
  últimas 24 h, activos o no. `EL PLAN` y `LO QUE FALTA` siguen solo con los activos.

**Agrava G2 (comprobado esta noche)**: la sesión de cierre corrió `limpiar` con el director todavía adentro de su carpeta. En Windows,
`git worktree remove` **borró todo el contenido** y no pudo borrar la carpeta, que estaba en uso. El parte dice *"limpiar no pudo cerrar
la carpeta de trabajo del módulo (git dice que no es un worktree): la rama modulo/noche-prueba sigue"*. Quedaron una carpeta vacía en
`.claude/worktrees/` y las ramas `modulo/noche-prueba` (acá y en origin) y `origin/modulo/noche-prueba--04`. Esta vez no se perdió nada:
el director ya había subido todo, y `cerrar` exige la carpeta limpia. Pero con un obrero vivo (el caso de G2) la carpeta vacía queda
**adentro del repo principal**: su próximo `git` sube hasta la `.git` de la principal, y su `.kit-rol` ya no está (NO VERIFICADO; es
la razón para no tocar nunca una carpeta con una sesión viva). **Arreglo**, además del de G2: `limpiar` no cierra la carpeta de la
sesión que lo pide ni la de un proceso vivo (mirar si hay un `claude` con esa carpeta, o una marca que deja cada sesión al entrar), y el
cierre de la noche deja la del director para el `/estado` de la mañana.

### El renglón de `frenos.log` en Deptos: chico

El director me pidió decidirlo. **Chico**: alcanza con el aviso de la nota, con un retoque.
- La flota **no deja nada roto**: da ROTA en la línea 8 con *"en base pasaba: lo rompió la actualización"* (`chequeo.cjs:821`) y no
  mezcla. Con el renglón, sus 224 casos pasan y la línea 8 da ✅ (en esta revisión, las dos flotas).
- Es un caso raro: un freno propio que escribe con `frenos-log.anotar` y una prueba propia que lee el archivo.
- **El retoque, para la sesión 6**: el arreglo de la nota, tal cual, **rompe la prueba en la rc.6**, porque `leerTodo` no existe ahí
  (la lib de la rc.6 exporta `RUTA, SEP, LARGO_MAX, rutaAbsoluta, fechaConZona, renglon, anotar`). Si la sesión del proyecto lo aplica
  antes de la flota, que es lo que pide la nota, el `comando-test` del repo falla hasta que llegue la rc.7. La nota tiene que dar la
  forma que anda en las dos versiones, que es la que usé en el clon:
  `typeof fl.leerTodo === 'function' ? fl.leerTodo(repo) : <leer .claude/frenos.log como antes>`.

### Los chicos

Para la sesión 6 o la `v3.1`. Cada uno, con su escenario en el informe de su revisor.

| # | De | Qué | Arreglo |
|---|---|---|---|
| c1 | a | **Un pedido chico de día deja a la noche sin publicar**: un commit en `main` que no es módulo ni papeles hace que `publicar` salga con *"decidí si se publica"* (`noche.cjs:610-611`). Es la regla de rt-1 / r2-6, a propósito | No se toca la regla (es la red). La guía lo dice: "si hiciste algo chico de día, la noche te pregunta antes de publicar". A la `v3.1`: aceptar lo que ya estaba en origin antes de `cierre-empieza` |
| c2 | a, b | **"Falta tu autorización para publicar"** sale como "un clic tuyo" y nadie dice cómo darlo. Además, queda viejo después de autorizar (`espera.cjs:209`; `preparar-pc` no toca `kit-publicacion.json`) | El texto: *"decime 'preparame esta PC'"*, tipo `decisión`; `dePublicacion` lo descarta si `kit-pc.md` ya tiene la huella de hoy |
| c3 | a, c | **PC nueva: comandos para tipear**: `gh auth login` (`preparar-pc.cjs:176`, `traer-repos.cjs:46`) y la identidad de git (`kit/INSTALAR.md:15-16`). Ni el `doctor` ni `preparar-pc` miran la identidad, y sin ella fallan todos los commits de la noche | El `doctor` la chequea; la sesión la escribe con el OK del dueño (pide nombre y mail) |
| c4 | a, c | **Quedan textos que mandan al dueño a la terminal**: `NUCLEO.md:71`, `ROLES.md:42`, `modo-b.md:42,67`, `flota.md:22`, `arquitecto-skills/SKILL.md:93`, `lib/flota.cjs:563` ("mezclá … vos") | PARADA o "Te necesito"; la sesión lo corre con la ventana del dueño |
| c5 | a | **Lo que trae "preparame" queda a medias**: `traer-repos` corre después del plan, así que los repos clonados no entran en las preguntas de publicar ni en `autoMode` de esa corrida; la lista puede traer hasta 1000 repos para una sola pregunta | Volver a correr el plan después de clonar; la lista en tandas |
| c6 | a | **El Equipador y su anexo se contradicen en la adopción** (`SKILL.md:96` contra `flota.md:42` y `adoptar.cjs:48,191`), y sin remoto el primer `/cierre` queda trabado (`adoptar.cjs:194`) | Alinear el SKILL con el anexo; un camino para el repo sin remoto |
| c7 | a | **La noche se apaga sola si el dueño mira**: `/inicio` y `/estado` corren `volvi` siempre (a las 23 h también). El checklist de "me voy" trae `.kit-noche`, `AUTORIZADO`, `PARADA` | `volvi` solo con "volví" o de mañana; el checklist en criollo; un renglón sobre que la PC no se suspenda |
| c8 | b | **Una línea corrompida en `espera.cjs:242`**: el reemplazo del escape de la regex es un texto pegado, no `'\\$&'`. Hoy no hace daño (los ids son `[a-z0-9-]`) | Volver a `'\\$&'`, con un caso con un punto |
| c9 | c | **`kit-frenos.log` no está en ningún manual** (`SCRIPTS.md:24,54,113,116`, `MOLDE.md`), y `modo-a.md:68` dice "commiteá los dos" | Una línea en MOLDE §3 y SCRIPTS; corregir `modo-a.md:68` |
| c10 | c | **Los manuales dicen que `--principal` prende los githooks** (`MOLDE.md:10`, `COMO-USAR-EL-ARQUITECTO.md:78`): desde la rc.6 los prende `--traer` (`adoptar.cjs:55`) | `--traer` en los dos |
| c11 | c | **`ROLES.md:140`**: "agregá tal línea al estado" no se ve en el `/estado` del dueño (`estado.cjs:432-485`) | Corregir ROLES, o sumarlas a la vista del dueño |
| c12 | c | **El manual del Arquitecto es de antes de la rc.7**: sin "¿lista o cola?", "Antes de lanzar" ni `### Tramo N`; `/director` sin `<x>` (`COMO-USAR-EL-ARQUITECTO.md:105-125`, `MOLDE.md:257`) | Sumar los tres y el `<x>` |
| c13 | c | **`SCRIPTS.md:139`**: "borrá la rama desde la web"; el código ofrece que lo haga la sesión (`flota.cjs:403`) | Copiar el texto del código |
| c14 | c | **Rojo/verde y un comando en lo que lee el dueño**: `EQUIPADOR.md:116,122`, `COMO-USAR-EL-ARQUITECTO.md:113,166`, `GUIA-DE-USO.md:206` (`cambios aprobar <id>` en "Decís…") | "Pasó/falló"; *"firmá el cambio que está en Te necesito"* |
| c15 | R2 | **El filtro de lo que lee el dueño deja frases rotas**: los ids de alerta de 8 hexa salen y queda *"Las 4 alertas de negocio , , y ."* (el `/estado` del clon) | Cambiar el id por "(una alerta)" en vez de borrarlo |
| c16 | R2 | **La línea 7 de la flota da ROTA por tiempo con la PC cargada**: la primera flota de esta revisión, con los tres revisores corriendo al lado, dio *"NO VERIFICADO: las pruebas de los hooks (26 archivos) no terminaron en 30 min"* → ROTA. Sola, pasó (30 min la flota entera) | Un ROTA por tiempo es "no pude probar": que diga eso y lo repita una vez, o que use el turno de la PC (B5) |
| c17 | R2 | **Un repo recién clonado no es "de confianza" para Claude Code**: las sesiones de fondo ignoran sus `allow` (*"Ignoring 48 permissions.allow entries … this workspace has not been trusted"*). Pasa con lo que trae "preparame esta PC" hasta que el dueño abra una sesión ahí una vez | `preparar-pc` o el `doctor` lo avisan; o el primer `/inicio` en la carpeta. Lo que cambia en la noche: NO VERIFICADO (abajo) |

| c18 | noche | **El relevo después de `integrar` traba el cierre**: el paso 7 del director pide el relevo antes de cada espera larga; subido al módulo después del `integrar`, `cierre` dice *"todavía no está en main"* y hay que integrar de nuevo (6 min más de gate) | `cierre` acepta encima del merge los commits de la rama del módulo que tocan solo papeles; o el paso 9 dice "el relevo, antes del `integrar`" |
| c19 | noche | **El parte se contradice**: *"Las carpetas limpias: sí"* y, abajo, *"limpiar no pudo cerrar la carpeta de trabajo del módulo"* | "Las carpetas limpias" sale de lo que dijo `limpiar`, no de `git worktree list` |
| c20 | noche (el director) | **`resumen.cjs` lista como pendientes tareas que la ficha ya tilda** (T1 a T3, con `[x]` y su merge). Lo vio el director y lo dejó en el TODO del clon; no lo reproduje (NO VERIFICADO) | Reproducirlo con su caso y arreglarlo |
| c21 | noche | **El filtro cambió el sentido de un renglón**: en el handoff, *"el cambio del `git pull` ancho"* salió en "Te necesito" como *"el cambio del un paso del kit ancho"* | Igual que c15: cambiar lo técnico por una palabra que lea bien, o dejarlo |

---

## Los 20 criterios de aceptación

Los del tracker ("Los 20 criterios"), con lo que agrega esta revisión. Ya estaban tildados el 2, 3, 4, 9, 14 y 17.

| # | Criterio | ¿Se tilda? | Evidencia, o lo que falta |
|---|---|---|---|
| 1 | Regresión de la `v2.4.2` | **No** | La suite (3.236 casos, C6) y `kit-sync` LIMPIO cubren la parte de scripts; nadie corrió el Modo A de punta a punta en la rc.7. A fase 2, o una corrida de Modo A en la sesión 6 |
| 2 | El tamaño en una línea | ya ✅ | — |
| 3 | `ready` sin sello se niega | ya ✅ | — |
| 4 | El Arquitecto deja el commit del módulo | ya ✅ | Repetido en esta revisión: `sello` y `ready` sobre el spec de `noche-prueba`, y `worktree crear` dejó la rama y el worktree con `.kit-rol: director` |
| 5 | El hook inyecta ≤ 9.700, con huella | **Sí** | En el clon real de Deptos: *"2. arranque · ✅ · inyectado: 4.573 de 9.700"* (la flota) y *"inyectado: 4.519 de 9.700"* (`adoptar --verificar`). La edad y CORTADO, en `inyeccion.test` (suite de C6) |
| 6 | `/cierre` encuentra lo suelto y no commitea | **No** | La sesión de cierre corrió los pasos del `/cierre` de noche (handoff, CHANGELOG, TODO, ficha) y su candado pasó, pero no había nada suelto ni roto que encontrar |
| 7 | Sin pop-up ante lo AUTORIZADO; de noche niega | **No: la mitad** | La primera mitad, sí: cuatro obreros de fondo corrieron lo de su `## AUTORIZADO` sin ninguna ventana, y la única negativa fue un renglón compuesto que no estaba en la lista. Lo de "una de las 5 de A → de noche, PARADA" no lo tocó ningún encargo |
| 8 | El director no escribe ante un aviso; rojo → nunca merge | **Sí, la mitad que queda** | Desde B4 un obrero de fondo no manda avisos: el director se entera cuando el proceso termina. En la noche: cuatro encargos, y cada uno se mezcló solo después de las seis líneas en ✅ de `verificar` (*"Pasó. Lo mezclo…"*). El rojo → PARADA, en `encargo.test` |
| 9 | La flota devuelve una tabla | ya ✅ | Ahora también con un repo real: el clon de Deptos `mezclado`. **Ojo G1**: la tabla dice "mezclado" con una pieza esperando |
| 10 | Adoptar un repo viejo con un OK | **No** | Ninguna adopción nueva en la rc.7 (Deptos ya estaba adoptado). Va con el primer repo que se adopte (Hermes o el Hub), o a fase 2 |
| 11 | La lista cerrada de lo que se frena, también en bypass | **No** | Las pruebas de los hooks pasan (línea 7 de la flota, en el clon). Falta la pestaña real de VS Code y la otra PC (Guido) |
| 12 | Clase 2 en `.claude/cambios/` | **No** | La noche no tuvo ningún cambio de clase 2. El 3-barrera sí: `candado:barreras` frenó dos veces el commit del settings sin aprobado (`kit-frenos.log` del clon) y pasó con el aprobado |
| 13 | La mesa escribe antes del mensaje | **No** | Sin mesa real (es de la `v3.1`, con el buzón). A fase 2 |
| 14 | Ninguna skill con rutas, sesiones ni SHAs | ya ✅ | — |
| 15 | `sensible:` pregunta solo en su paso | **No** | La noche no tocó nada sensible. A fase 2 o a la prueba real |
| 16 | Un hook que falla frena | **No** | Igual que antes: las pruebas y `-p`; falta VS Code y la otra PC |
| 17 | Un obrero no se saca sus frenos | ya ✅ | — |
| 18 | `aprobar` se niega desde un obrero | **No** | Las pruebas del freno pasan. Falta la ventana con una persona (P7), y ahora también G3 |
| 19 | Una migración a `real` sin veredicto no corre | **No** | Sin migraciones en la noche (`db-guardia.test` en la suite). A fase 2 o a la prueba real |
| 20 | El actualizador respeta la zona propia del settings | **Sí** | En el clon real: el `settings` de Deptos es `molde+propio` y la flota pasó *"6. barreras · ✅ · candado: pasa (barreras)"* sin tocar su zona ni sus `frenos:`/`sensible:`/`autorizado:` |

**La cuenta**: **9 de 20 se tildan con evidencia** (2, 3, 4, 5, 8, 9, 14, 17 y 20; nuevos: 5, 8 y 20). Quedan 11: 1, 6, 7, 10, 11, 12,
13, 15, 16, 18 y 19. Ninguno se puede cerrar sin la prueba real (una pestaña de VS Code, otra PC, una persona que firma, una adopción
nueva, una migración). **Para el tag `v3.0`, Guido tiene que pasar a fase 2 por escrito los que no se verifiquen antes.** La
recomendación: 13 (la mesa es de la `v3.1`); 10, 15 y 19 a la prueba real del primer repo que se adopte. Y 1, 6, 7, 11, 12, 16 y 18 se
tildan con lo que la sesión 6 pueda correr en una pestaña de verdad (el clic de P7 cierra el 18), o a fase 2.

---

## Lo que esta revisión no midió

- **Lo que el spec ya dejaba afuera**: un proveedor de verdad, la pestaña de la extensión, la firma con una persona, dos módulos que
  terminan a la vez, un proyecto que publica al subir (`al-subir`) y un comando de publicar de la forma `npm run`.
- **La firma y la autorización de la PC**: fueron andamio (la lib, y `KIT_HOME_PC`). Las cubren sus pruebas; P2 y P7 siguen abiertos.
- **`/estado` con obreros vivos**: las fotos salieron de la carpeta equivocada (error mío, arriba).
- **Qué cambia la falta de "confianza" de la carpeta**: en el clon, Claude Code ignoró los `allow` del proyecto. En la carpeta real de
  Deptos (de confianza) el director y los obreros tendrían esos `allow` además de su lista. NO VERIFICADO si eso cambia algo de la noche.
- **El `git-seguro.test` "4.7 caso 1"**, que se saltea solo desde A5 con una razón vieja (de C6): no lo miré. Va a la `rc.8` con lo demás.
- **La flota con `--con-obra`** (el clon no tenía `modulo/*` vivas).
- **G1 en los otros seis repos de Guido**: cualquiera con un script del kit tocado a mano cae igual. No los miré: el director, antes de
  pedir el OK de la flota real, puede comparar `.claude/scripts/` de cada uno con el molde de su versión.
