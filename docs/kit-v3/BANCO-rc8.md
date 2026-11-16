# El banco otra vez, sobre la rc.8 (la sesión 5c del tramo final, 2026-11-16)

> La verificación final antes de la `v3.0`: el script del banco (`pruebas/banco/`) sobre el kit `v3.0.0-rc.8`, contra **copias** de
> todos los repos de la cuenta de Guido, haciendo de dueño. Lo que la 5b ya había corrido (preparar la PC, las 18 adopciones, la flota
> en la copia de Deptos) no se repitió: se leyó su salida y se siguió desde ahí. Del kit, solo lectura. En abstracto (vibe-kit es
> público): sin nombres de repos del trabajo ni de clientes; Deptos se nombra porque R2 ya lo nombró. Base: `BANCO-rc7.md` (5a),
> `REVISION-INTEGRAL-rc7.md` (R2) y `SPEC-paquete-8e.md` (5b). Corrió de 23:40 a 03:00, con los hooks de la PC todavía en la `rc.6`.

## El veredicto

**Sale la `v3.0`, con una condición: que Guido instale los hooks de esta PC y se repita una noche corta (17 minutos).**

1. **Las dos noches terminaron y publicaron solas**: la de Deptos (la de R2) y la de un repo recién adoptado sin pruebas (el que en
   la 5a no sumó nada). Sin comandos para el dueño, sin "rojo", y a la mañana `/estado` cuenta bien lo que se hizo.
2. **No apareció nada grande del kit.** De los siete grandes, seis se vieron arreglados y ningún repo quedó a medias; el que no se
   pudo ver (G3, la firma en la pestaña del director) lo cubren sus pruebas y el clic de P7.
3. **Lo que queda es de esta PC**: sus hooks son de la `rc.6` y en las dos noches dijeron "ficha rota" sobre una ficha que está bien.
   Eso se va con "instalar hooks por PC" (es de Guido). Los chicos, a la sesión 6 como texto o a la `v3.1`.

## Resumen para el director

1. **Terminó**, en ~3 h 20: la flota en las siete copias con kit, 16 sesiones de dueño, dos `/cierre`, **dos noches enteras**, y "lo que falló", uno por uno.
2. **Nada de lo real cambió** (la foto de antes y después, 18 carpetas: solo este informe, sin commitear al sacarla).
3. **Las noches**: Deptos, 42 min (4 encargos, 57 de 57 pruebas, con `git pull:*` puesto, que en R2 la frenó); la del repo sin
   pruebas, 17 min. **Las dos publicaron y pasaron el humo.** Los cuatro criterios de éxito, **cumplidos en las dos**.
4. **La flota**: Deptos **mezclado** de la `rc.6` a la `rc.8` (G1 de punta a punta: esperó entero, se resolvió, mezcló). Las otras
   tres que corrieron no mezclaron y dicen por qué (falta `pnpm` en la PC; la ficha sin pruebas, B1; pruebas que esperan a GitHub). Tres salteadas por obra viva (b1, a la `v3.1`).
5. **Lo que falló en R2 y en la 5a**: seis grandes **arreglados con evidencia** y B2 con su aviso (la PC es de Guido); G3 no se pudo ver; los chicos, arreglados salvo b5 (a medias), b1 y b9 (a la `v3.1`) y b12 (no es del kit).
6. **Por los hooks viejos de la PC** (no del kit): en las dos noches los obreros vieron "ficha rota: .claude/kit.md" (la `rc.6` no lee
   la forma nueva de `publicar`; la `rc.8` sí, probado). En una noche, eso llegó al parte del dueño como un aviso falso.
7. **Seis chicos nuevos** (n1 a n6) y cinco arreglos para el script del banco. Ninguno es grande.
8. **Criterios**: se tilda el 10 (adoptar con un OK): quedan **10 de 20**. El 6, recomiendo tildarlo (Guido decide). Los otros nueve, a fase 2 por escrito.
9. **Espera a Guido**: "instalar hooks por PC" y después una noche corta (`banco.sh noche` sobre la copia sin pruebas); los criterios a fase 2; el OK de la `v3.0`.
10. **Lo que más importa**: el kit hizo dos noches solas en repos de verdad; lo que falta es poner al día los hooks de esta PC.

## En criollo

1. **Probé la `rc.8` en copias de tus repos, sin tocar nada real.** Las dos noches de prueba terminaron solas, publicaron (de mentira)
   y a la mañana el resumen decía bien lo que se hizo. La copia de Deptos se puso al día entera.
2. **Lo único que molesta es tu PC**: una parte de los frenos está en una versión vieja y en las noches avisa un error que no existe.
   Se arregla con "instalar hooks por PC", que tenés que correr vos; después repito una noche corta para confirmarlo.
3. **Te toca decidir** qué criterios pasan a "fase 2" (los que solo se pueden ver en tu pestaña, en otra PC o con una persona que
   firma) y el OK para publicar la `v3.0`.

---

## Lo inocuo: qué se tocó y qué no

- **Todo en una carpeta del banco**, en el scratchpad de esta sesión. Los remotos `bare` salieron de los de la 5b (copias locales,
  con las 18 adopciones de la `rc.8` ya subidas), más una carpeta sin origin copiada de lo real. Todo push pasó por el guardia del
  banco; el publicar es de mentira (una rama `produccion` del `bare`).
- **De lo real solo se leyó**: la foto de las carpetas, un `git clone` de la carpeta sin origin, y `~/.claude` (la versión de los hooks
  de la PC y `kit-sync` sin `sync`). El freno de la PC no dejó ni copiar su lib (*"no toques el corrector de la PC… Leerlo pasa"*): para
  probarla se usó la misma lib desde el tag `v3.0.0-rc.6`, que es la versión que dice su `INSTALADO`.
- **Sin llaves**: como en la 5a (HOME de mentira, `gh` de mentira, sin `GH_TOKEN`, ningún `.env`). Docker no se tocó.
- **Lo que no se aisló**: la red (las instalaciones), el login de Claude Code y **los hooks de la PC**, que las sesiones cargan del
  `~/.claude` real (rc.6). Las carpetas del banco no son "de confianza": las sesiones de fondo ignoraron los `allow` del proyecto.
- **La foto de después** (18 carpetas): cambió una sola cosa, vibe-kit, con este informe sin commitear. **Nada más.**

## Qué se corrió

| Paso | Repos | Cómo | Reloj |
|---|---|---|---|
| La foto de antes y la de después | las 18 carpetas de repo de la PC | `banco.sh foto` y `comparar` | — |
| Preparar la PC con el HOME de mentira | los 25 de la cuenta y uno sin origin | `banco.sh preparar` (lo mismo que la 5b, otra vez para armar este banco) | 5 min |
| Resolver la pieza que esperaba (G1) | la copia de Deptos | como el dueño: el renglón de la nota de migración en su prueba propia (la forma que anda en las dos versiones) y `resolver . scripts nueva` | 5 min |
| La flota | las 7 con kit, de a una | `banco.sh flota` (con `--con-obra` en Deptos, como la 5b) | 1 h 45 |
| `/inicio` y el pedido chico | las 16 adoptadas que quedan andando (la 17ª se guardó para su noche) | `banco.sh sesion`, Sonnet, de fondo | 21 min |
| `/cierre` | 2 adoptadas | `claude -p "/cierre"`, Sonnet: una con un cambio sin commitear, otra con un archivo suelto en `docs/` | 10 min |
| Las pruebas propias | Deptos | `banco.sh pruebas` (setup e instalación, con un HOME vacío): las dos salieron 0 | ~8 min |
| La noche | Deptos y la adoptada sin pruebas | `noche-armar` y `noche`: el director de fondo en Opus, sin dueño, obreros en Sonnet, `/estado` a la mañana y `limpiar` | 42 y 17 min |

## La flota, en las siete copias con kit

| Copia | Antes → después | Resultado | Por qué | La línea de los hooks (7) |
|---|---|---|---|---|
| Deptos (la de R2) | `rc.6` → `rc.8` | **mezclado**, un commit | la 5b la había dejado *"te espera: quedó entero en la rc.6"*; el dueño resolvió (tomar la del kit: lo tocado a mano ya viene en la `rc.8`) y la flota siguiente mezcló. Después, `adoptar --verificar`: todo ✅, *"inyectado: 3.390 de 9.700"* | pasó (33 min la corrida) |
| una con kit, usada | `rc.6` → `rc.6` | no mezcló | **8 de 9 líneas bien**; la 8: *"comando-setup (pnpm install…) salió con 127: pnpm: command not found"*. Esta PC no tiene `pnpm` (n1) | pasó (25 min) |
| otra con kit | `rc.6` → `rc.6` | no mezcló | 8 de 9 bien; la 8: *"la ficha no dice vars.comando-test (si el proyecto no tiene con qué probar, que la ficha lo diga: gate:entorno-prueba en frenos.quitados, con su razón)"*. El dueño había sacado sus pruebas en noviembre: **B1 hace lo que se decidió** (n2) | pasó (23 min) |
| otra con kit | `rc.6` → `rc.6` | no mezcló | la 8: sus pruebas esperan la integración continua de GitHub, que en una copia no existe (*"ya falla"*, también antes de actualizar). Del banco, no del kit | pasó (22 min) |
| tres con kit | — | salteadas | ramas `modulo/*` vivas en el remoto (b1: es la regla del dueño, a la `v3.1`) | — |

**Ningún repo quedó a medias**: los que no mezclaron siguen enteros en la `rc.6`, con `kit/v3.0.0-rc.8` y las nueve líneas en su
último commit. **c16 mejoró**: en la 5a la línea 7 no terminó ni en 60 min en dos de dos; acá pasó en las cuatro, con la PC parecida
(~600-750 MB libres).

## Las sesiones de dueño

- **El tamaño en una línea**: en las **10 de 10** adoptadas con el kit, el primer renglón del pedido chico es *"Chico, lo hago acá."*.
  Las otras 6 son las de "todo en no": la adopción les trajo solo la ficha (sin `CLAUDE.md`, sin `/inicio`, sin la regla del tamaño),
  porque así sale cuando el repo no tiene ficha ni `CLAUDE.md` y "la sesión decide qué se prende"; el banco no decide, así que no se
  prendió nada (n3).
- **`/inicio`**: en las 10 con el kit, resume y espera la misión; en las 6 de "todo en no" no existe (la sesión lo dice y resume
  igual). **b8 arreglado**: el último trabajo sale por lo que hizo (*"el último commit
  es la adopción del kit 3.0.0-rc.8, de hace 86 minutos"*). **Pero siguen apareciendo códigos** en 7 de 16, copiados del handoff
  del proyecto o del `git log` (*"la producción sigue en `051cfe0`"*), y uno en un `/cierre` (n4).
- **`/cierre`**: con un archivo suelto en la raíz de `docs/`, **lo encontró, no lo commiteó y le preguntó al dueño** (*"no es de esta
  sesión, así que lo dejé afuera. Decime si lo borro o lo guardo"*). Con un cambio sin commitear del día, lo sumó al commit de
  papeles y lo dijo. No dejó renglón en el registro de frenos: no corrió el candado porque no había nada que cerrar.
- **Del banco, no del kit**: en 10 de 16 `/inicio`, el script del Arquitecto falló la primera vez (*"Cannot find module
  'C:\c\Users\…'"*) y la sesión lo corrió de nuevo con la ruta de Windows. Es la variable que el banco le pasa a Claude para Git Bash,
  que se hereda y rompe `$HOME` (arreglo del script, abajo). Las noches se lanzaron sin ella.

## Las dos noches

Cada una sola en la PC y sin dueño, con el mismo primer pedido de R2 y de la 5a. El módulo `banco-noche` (tres encargos chicos y el
cierre del tramo), sellado por el Arquitecto; el publicar de mentira firmado por la lib y la PC autorizada (andamio, como en R2).

| | Deptos (la noche de R2), con `comando-test` | Recién adoptado, **sin `comando-test`** (la noche 1 de la 5a) |
|---|---|---|
| El armado | sus pruebas: instalación y `comando-test`, las dos salieron 0; `Bash(git pull:*)` **sigue en su settings** | el dueño contesta la pregunta nueva de la adopción (D5): "no hay pruebas", con su razón, firmado; **el sello pasó de una** |
| El reloj | 42 min (02:03 a 02:45) | 17 min (01:41 a 01:55) |
| Los encargos | 4, cada uno mezclado después de `verificar`; `integrar` con **57 de 57** pruebas | 4, cada uno mezclado (*en la 5a: 0 de 3*); `pruebas: pasó` sin `comando-test`, porque la ficha lo dice (B1) |
| Integrar | una vez (el relevo del director fue antes: c18) | una vez |
| El cierre de la noche | **arrancó solo** con el permiso puesto (G4); publicó, humo, papeles, parte, `subir` | arrancó solo; publicó, humo, papeles, parte, `subir` |
| `produccion` del remoto de prueba | el merge del módulo, con `publicado.txt`; `kit-publicacion.json`: pruebas, comando y humo *"pasó"* | ídem |
| **0 comandos para el dueño** | **pasa** (en lo que escribe el kit; dos renglones de "te necesito" traen un comando, pero son del módulo propio de Deptos, de su handoff del 12 de noviembre) | **pasa** |
| **Termina y publica sola** | **pasa** | **pasa** |
| **`/estado`: las cuatro secciones** | **pasa**, con obreros vivos y a la mañana; *"LO QUE SE HIZO"* lista los cuatro encargos (G5). Chico nuevo n5 | **pasa**, con obreros vivos y a la mañana, y la cuenta coincide |
| **Nada dice "rojo"** | **pasa**: la única palabra es del módulo propio de Deptos (*"dos redes con ≤ 1 rojo"*) | **pasa** (cero) |
| A la mañana, `limpiar` | cerró la carpeta y la rama del módulo integrado; **dejó la del módulo con obra viva** (G2) | cerró la carpeta del director y la rama (G2) |
| El costo del director | USD 2,76 | USD 1,76 |

**Lo que dijo el director, sin que nadie se lo pida**: en Deptos, las cuatro decisiones que tomó solo (con el archivo donde las
anotó) y que el parte decía "dos". Bien. Una de esas decisiones es del banco: el spec del módulo traía el comando de pruebas roto,
porque la plantilla del banco no escapa el `&&` (arreglo del script, abajo).

### Lo que falló por los hooks de la PC, no por el kit

- **Qué**: en las dos noches, los frenos que corren a nivel PC (los de `~/.claude/hooks/kit/`, que dicen `kit: 3.0.0-rc.6`)
  agregaron a cada negativa *"ficha rota: .claude/kit.md:33 — corré doctor"* (en Deptos, `:40`). Lo vieron dos obreros en una noche y
  tres sesiones en la otra.
- **La evidencia**: el renglón 33 es `autorizado.publicar` en la forma de llaves `{comando, humo, volver}`, que existe desde la
  `rc.7`. Con la lib de la `rc.6`: *"autorizado.<clave> tiene que ser un texto, no un mapa"*. Con la de la `rc.8`, la misma ficha se
  lee bien. Es b13 de la 5a, otra vez.
- **Qué le llegó al dueño**: en la noche del repo sin pruebas, el parte dice *"La configuración del kit avisó que tiene un error en
  `.claude/kit.md`"*. **Es falso**, y con los hooks de la PC al día no sale.
- **Lo que no se pudo medir por esto**: la defensa doble de las firmas en la PC (B2). La negativa que acompañó el aviso (un obrero
  que quiso tocar los ganchos del repo) es legítima: la habrían dado los dos frenos.
- **Para cerrarlo**: Guido corre "instalar hooks por PC" (lo frena el clasificador de `auto`: es suyo) y se repite la noche corta,
  `banco.sh noche-armar` y `noche` sobre la copia sin pruebas. Si el parte ya no trae ese aviso y los obreros no ven "ficha rota",
  la condición se cumple.

## Lo que falló en R2 y en la 5a, uno por uno

"Arreglado" quiere decir que lo vi pasar en este banco (o, si el banco no lo toca, en el código del tag y su prueba).

### Los grandes

| # | Qué era | ¿Arreglado? | Evidencia |
|---|---|---|---|
| G1 | La flota deja a Deptos a medias | **Sí** | la 5b: `te espera`, entero en la `rc.6`; acá, resuelto como el dueño y la flota siguiente: **mezclado**, `--verificar` todo ✅. En las otras tres que corrieron, ninguna a medias |
| G2 | `limpiar` borra carpetas recién creadas | **Sí** | en las dos copias, a la mañana: cerró solo lo integrado y dejó el módulo con obra viva; el cierre de la noche dejó la carpeta del director, *"porque su sesión está adentro, como corresponde"* |
| G3 | La firma que nadie ve en la pestaña del director | **No se pudo ver** | con G4 arreglado, ninguna noche tuvo que proponer un cambio de freno. Lo cubren `espera.test` y `skills.test` (la 5b) y el clic de P7, que sigue pendiente |
| G4 | El permiso ancho que frena el cierre | **Sí** | Deptos con `Bash(git pull:*)` en su settings: el cierre arrancó solo y publicó |
| G5 | A la mañana, "lo que se hizo: nada" | **Sí** | las dos vistas del proyecto listan los encargos de la noche, con su tiempo |
| B1 | Un repo sin `comando-test` no tiene noche ni flota | **Sí** | el sello pasó con la ficha diciéndolo; la noche mezcló 4 de 4 y publicó; la flota, en un repo que no lo dice, se niega y dice qué hacer (n2) |
| B2 | Los hooks de la PC en la `rc.6`, sin aviso | **El aviso, sí; la PC, no** | `kit-sync`: *"los hooks de la PC son del kit 3.0.0-rc.6 y el kit es 3.0.0-rc.8 — falta: instalar hooks por PC"*. Instalarlos es de Guido |

### Los chicos

| # | ¿Arreglado? | Evidencia |
|---|---|---|
| b2 | Sí | preparar la PC: *"falta pnpm en esta PC: sin él ese comando no corre, ni una noche de ese repo"* (pnpm en 2, yarn en 1, flutter en 1) |
| b3, b4, b6, b7, b11 | Sí | el anexo clona con `core.longpaths`; la 5b: el repo con `.claude` ignorado se niega antes de escribir y dice por qué; el texto de `carpeta-docs` dice dónde va; `barreras` dice que es lo esperado; 2 propuestas avisan el linter |
| b5 | **A medias** | `--verificar` ya no pide lo que la ficha dice `no` (la 5b). Pero el repo queda solo con la ficha y nadie le dice a la sesión qué prender (n3) |
| b8 | Sí (con un resto, n4) | `/inicio` dice el último trabajo por lo que hizo |
| b10, c15, c21 | Sí | los dos partes y los cuatro `/estado` sin renglones cortados a mitad de frase |
| c2, c19, c20 | Sí | ninguna noche pidió autorización de publicar con la PC autorizada; el parte: *"las carpetas limpias: sí (la del director queda hasta que cierres su pestaña)"*; el cierre de tramo tildó y nadie lo listó como pendiente |
| c5, c17 | Sí | preparar la PC: *"y ahora volvé a armar el plan…"* y *"las carpetas recién traídas todavía no son de confianza…"* |
| c7 | Sí | `/inicio` a la medianoche, sin marca de noche: *"volví: no había ninguna .kit-noche"* (el "(ya era de día)" de ese renglón quiere decir "sin marca", no la hora) |
| c16 | Sí | la línea 7 pasó en las cuatro flotas (22 a 33 min) |
| c18 | Sí | el relevo fue antes de `integrar`: una sola integración en cada noche |
| c3, c4, c6, c8, c9 | Sí (en el código) | están en el tag; el banco no los toca. La 5b los probó con `skills.test` y `espera.test` |
| b12, b13 | No eran del kit | b12, un hook propio de un repo (la 5b); b13 es B2, visto otra vez arriba |
| b1, b9 | A la `v3.1` | decidido en la 5b, con su razón. b9, visto otra vez: un renglón en inglés en cada noche (1 de 32 y 1 de 12 textos del director: *"Now the encargo 03 (queued)…"*), en la charla del director, no en lo que lee el dueño |

### Lo nuevo de este banco (todo chico)

| # | Qué | Evidencia | Para |
|---|---|---|---|
| n1 | **La flota dice "ROTA" cuando falta un programa en la PC**: *"comando-setup (pnpm install…) salió con 127"*. No mezcla (bien), pero el repo no está roto: es la PC. Preparar la PC ya avisa que falta `pnpm` | la flota de una copia con kit | `v3.1`: decir *"no pude probar: falta pnpm en esta PC"*, como c16 con el tiempo |
| n2 | **Un repo que ya había sacado sus pruebas con el dueño no se pone al día** hasta que la ficha lo diga (B1), y eso es una firma más. La fila dice qué hacer, pero con la palabra "ROTA" | la flota de otra copia | sesión 6: que la nota de migración de la `rc.8` lo diga en criollo; `v3.1`: que la fila diga "te espera una decisión" |
| n3 | **"Todo en no" deja al repo sin el método**: 6 de 18 adoptados sin `/inicio`, sin `/cierre` y sin la regla del tamaño. La propuesta dice *"la sesión decide qué se prende"*, y ni el anexo ni el Equipador dicen cómo | 6 sesiones de dueño | sesión 6 (texto): una línea en el anexo de la adopción (lo base, como `--nuevo`) |
| n4 | **Siguen llegando códigos de commit al dueño**: 7 de 16 `/inicio` y 1 de 2 `/cierre`, copiados del handoff o del `git log`. El núcleo dice "sin códigos sueltos" | las sesiones de dueño | sesión 6 (texto en `/inicio` y `/cierre`) o `v3.1` |
| n5 | **En un módulo con obra viva, un encargo cerrado sale dos veces**: en *"lo que se hizo"* (su evidencia está mezclada en el módulo) y en *"lo que falta"* (la casilla de la ficha se tilda al cerrar el tramo) | `/estado` de Deptos a la mañana, con el módulo propio que tiene obra | `v3.1`: que "lo que falta" no cuente un encargo con evidencia mezclada |
| n6 | **El parte copia tal cual la salida de la sesión de cierre**, con un renglón en inglés de Claude Code (*"Ignoring 48 permissions.allow entries…"*). Solo pasa en carpetas que no son de confianza (c17), como las del banco | el parte de Deptos | `v3.1`, si se ve en una carpeta real |

### Para el script del banco (`pruebas/banco/`, la próxima vuelta del ciclo)

Esta sesión corrió una copia del script con dos de estos cambios (el 1 y el 2); el script del repo no se tocó (no es de esta fila).

1. **El pedido a Claude, por la entrada estándar** (`printf "%s" "$prompt" | claude -p …`) en vez de `MSYS_NO_PATHCONV=1`, que se
   hereda a las sesiones y les rompe `$HOME` en Git Bash (10 de 16 `/inicio` lo sufrieron). Probado: la skill se llama igual.
2. **`flota` con `--con-obra`** cuando se lo pida (`CON_OBRA=1`): la 5b y esta sesión lo necesitaron.
3. **La plantilla del módulo de la noche escapa el `&`** del `comando-test` (con `sed`, `&` es "lo encontrado"): el spec de Deptos salió con el comando roto.
4. **`adoptar`, en un repo de "todo en no"**, no corre `barreras` (no hay `estructura.cjs`: hoy cae con un error de node).
5. **Una tanda que mida los criterios de `/cierre`** (un archivo suelto, una ruta que no existe, un tope pasado), como la de este informe.

## Los 20 criterios

Ya estaban tildados 9 (R2): 2, 3, 4, 5, 8, 9, 14, 17 y 20. El banco suma evidencia al 2 (10 de 10 sesiones), al 5 (Deptos,
*"inyectado: 3.390 de 9.700"*), al 8 (dos noches: cada encargo mezclado después de `verificar`), al 9 (la tabla de siete copias) y al 20
(la flota mezcló Deptos, con su settings `molde+propio`, sin tocar su zona).

| # | Criterio | Qué propongo | Por qué |
|---|---|---|---|
| 10 | Adoptar un repo viejo con un OK | **Se tilda** | 17 de 18 adopciones quedan andando y la otra se niega diciendo por qué (la 5b); la primera noche de uno recién adoptado y sin pruebas terminó y publicó sola. Lo que no vio el banco es la charla con el dueño (contestó a lo seguro); con lo que se pedía en la 5a (B1, b4 y b5), alcanza |
| 6 | `/cierre` encuentra lo suelto y no commitea | **Tildarlo (decide Guido)** | con un archivo suelto en `docs/`, lo encontró, no lo commiteó y preguntó. El renglón del registro no salió porque no hubo frenada (no había nada que commitear); el candado lo deja en sus pruebas (D2.2). Si Guido quiere verlo frenar de verdad, a fase 2 |
| 1 | Regresión de la `v2.4.2` | **Fase 2** | nadie corrió el Modo A de punta a punta en la `rc.8`; la suite y la flota de prueba cubren los scripts. Se ve en el primer proyecto nuevo |
| 7 | Sin pop-up ante lo AUTORIZADO; de noche, PARADA | **Fase 2** | la mitad se vio otra vez (dos noches de obreros de fondo, sin ventanas); la otra mitad pide que un encargo toque una de las cinco de A de noche |
| 11 | La lista cerrada de lo que se frena, también en bypass | **Fase 2** | pide la pestaña real de VS Code y otra PC |
| 12 | Clase 2 en `.claude/cambios/` | **Fase 2** | ninguna noche tuvo un cambio de clase 2; lo cubren las pruebas de `cambios` |
| 13 | La mesa escribe antes del mensaje | **Fase 2** | la mesa real es de la `v3.1`, con el buzón |
| 15 | Lo `sensible:` pregunta solo en su paso | **Fase 2** | ningún encargo tocó nada sensible; se ve en el primer módulo real que toque datos |
| 16 | Un hook que falla, frena | **Fase 2** | pide la pestaña de VS Code y otra PC |
| 18 | `aprobar` se niega desde un obrero | **Fase 2, o el clic de P7** | lo cierra el clic de Guido (`../vibe-kit-pruebas/rc7/p7-firma/LEEME-P7.txt`, ~5 min); si no lo hace antes de la 6, a fase 2 |
| 19 | Una migración a `real` sin veredicto no corre | **Fase 2** | sin migraciones en el banco; lo cubre `db-guardia.test` |

**La cuenta**: **10 de 20** con evidencia (con el 10); **11** si Guido acepta el 6. Los otros nueve, a fase 2 por escrito, cada uno con su porqué.

## Lo que este banco no midió

- **La PC con los hooks al día**: todo lo de arriba corrió con los de la `rc.6`. Es la condición del veredicto.
- **La firma en la ventana** (P7, G3) y **la autorización de la PC**: andamio, como en R2 y en la 5a.
- **La flota mezclando en las tres copias con obra viva** (`--con-obra` solo en Deptos) ni en la que espera a GitHub.
- **La charla de la adopción con el dueño**: el banco contesta a lo seguro.
- **Las carpetas "de confianza"**: las sesiones de fondo del banco ignoran los `allow` del proyecto (c17); en la PC de Guido no.
- **La suite entera**: no se volvió a correr (la corrió la 5b; después entraron tres cambios chicos, probados por archivo).

## La noche corta, con los hooks al día (2026-11-16, 09:01 a 09:17)

La condición del veredicto. Guido instaló los hooks de la PC (`~/.claude/hooks/kit/INSTALADO`: `kit: 3.0.0`; `kit-sync`: `LIMPIO`,
sin el aviso). La misma copia sin pruebas, sola en la PC, con la copia del script de `$BANCO/corrida/`: un commit del andamio sacó
el módulo de la noche anterior, y después `noche-armar` (el sello pasó de una) y `noche`.

| Criterio | Resultado | Evidencia |
|---|---|---|
| **Ni el parte ni los obreros dicen "ficha rota"** | **Pasa** | cero avisos en las charlas de los cuatro obreros. Las menciones de la carpeta principal y del director son lecturas del TODO de la noche anterior, que tenía anotado ese aviso como pendiente: ningún hook lo volvió a decir. El parte no habla de un error en la ficha |
| **0 comandos para el dueño** | **Pasa** | el parte y `/estado`, sin comandos para correr |
| **Termina y publica sola** | **Pasa** | 16 min: 4 encargos mezclados, una integración, el cierre arrancó solo. `produccion` del remoto de prueba es el merge del módulo, con `publicado.txt`; `kit-publicacion.json`: pruebas, comando y humo *"pasó"* |
| **`/estado`: las cuatro secciones** | **Pasa** | con obreros vivos y a la mañana; *"LO QUE SE HIZO"* lista los cuatro encargos de esta noche |
| **Nada dice "rojo"** | **Pasa** | cero |

**Además**: un solo freno negó algo en toda la noche: un obrero que quiso tocar los ganchos del repo (`secretos:frenos-del-proyecto`).
Es legítimo y esta vez su mensaje no trae el agregado de "ficha rota". El director costó USD 1,80.

**La condición se cumple: sale la `v3.0`.**
