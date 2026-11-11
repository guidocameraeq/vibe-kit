# Revisión antes de la rc.7 — Mirada 1: la fricción

> Sesión 1 de `docs/kit-v3/REVISION-rc7-PLAN.md`. Escrita el 2026-11-11 (Claude Fable 5.2; seis lectores Sonnet). Solo mira y propone:
> no toca `kit/` ni el tracker. Las citas con **[L]** las trajo un lector y no las abrí yo; todo lo demás lo vi en el archivo y la línea,
> o en la charla con su hora (hora de Argentina).

## Resumen para la madre

- **Terminó**, dentro del presupuesto (menos de 1 h de reloj, 6 lectores Sonnet). Las tres tareas hechas.
- **Cubrió**: los ítems 17-37 contra el código de hoy y contra las dos noches (charlas de los dos directores y de ~60 obreros,
  reportes y notas); el recorrido entero, de preparar la PC a la flota; y lo roto que apareció.
- **No cubrió**: Hermes y los otros repos, `relevamiento`, `docs-fyd`, la mesa, las pruebas del kit. Es lectura de código y de
  charlas: nada se corrió de punta a punta (eso es de la sesión 2).
- **Ítems 17-37**: 14 confirmados, 7 corregidos (18, 20, 25, 31, 33, 34, 37), ninguno "no se sostiene".
- **Inventario**: 73 puntos de fricción en 10 pasos, 29 nuevos. **Lo roto**: 21 cosas con evidencia (R1 a R21).
- **Lo que más importa**: casi todo lo que le cae a Guido sale de una causa: lo que pide su firma o su carpeta principal vive
  donde las sesiones del kit no están, y el kit no manda a nadie hasta ahí; por eso las noches terminan en una lista de comandos.
- **Tres correcciones que cambian el diseño**: (1) el director no compactó por un tope de tokens sino **por estar 55 minutos
  quieto**, las dos noches (se apaga con una opción de Claude Code); (2) "aprobar con un clic" **ya existe**, pero solo vale en la
  carpeta principal y los carteles del kit empujan a pasarle el comando a Guido; (3) la primera noche **sí** se cerró y publicó
  desde el director, con una sesión de fondo en la carpeta principal; la segunda no lo intentó porque el kit no dice que esa es la vía.
- **Para la sesión 2**: después de `ExitWorktree` los frenos del kit siguieron viendo un director (R1), y la carpeta principal de
  Deptos figura sin confianza para las sesiones de fondo (R2).

---

## En criollo, para Guido

Lo que anotaste está bien anotado: de los 21 ítems, 14 son tal cual y 7 necesitan un ajuste, ninguno es humo. Y hay bastante más
de lo mismo que no habíamos visto: conté 73 lugares donde el kit te hace trabajar o te habla raro, y 29 no estaban en la lista.

**Lo que más te pesa, y por qué pasa.** No son veinte problemas sueltos: es uno grande con muchas caras. El kit pone a cada sesión
a trabajar en su propia carpeta aparte (está bien: así no se pisan), pero todo lo que necesita tu firma o tu carpeta de siempre
(aprobar un cambio, publicar, el cierre, limpiar las carpetas viejas) solo se puede hacer **desde tu carpeta**, y el kit no manda a
nadie hasta ahí. Entonces la sesión hace lo único que le queda: te pasa el comando. Por eso las dos noches terminaron igual, con
todo el trabajo hecho y una lista de cosas para que corras vos. La segunda noche fueron ocho horas con todo listo, esperándote.

Lo curioso es que **la primera noche sí lo resolvió sola**, cuando vos le insististe ("lanzá un subagente, hermano"): abrió otra
sesión en tu carpeta, y esa hizo el cierre y publicó. La segunda noche otra sesión, con el mismo problema, decidió que eso era
"rodear un freno" y no lo hizo. El kit no dice cuál de las dos tiene razón. Esa es la decisión más importante de la rc.7.

**Lo de "aprobar".** Lo que habíamos acordado (vos decís "aprobalo", la sesión lo corre y vos hacés un clic) **ya está hecho** en
el kit. No te funcionó porque solo anda en tu carpeta principal, y vos estabas hablando con el director, que vive en otra. Y los
carteles del kit le dicen a la sesión "esto lo hace una persona", así que te pasa la línea. Es más barato de arreglar de lo que
pensábamos: cambiar los carteles y hacer que el cambio se pueda aprobar desde donde estés.

**Lo de "rojo".** El kit en sí casi no te lo dice: son 22 carteles. Te llega porque las sesiones hablan entre ellas así ("la prueba
da rojo", "quedó en verde") y nadie les dijo que con vos hablen distinto: en la mitad de los mensajes largos que te mandó el
director aparece. Se arregla con una regla corta de cómo se le habla al dueño, no cambiando 290 palabras.

**`/estado`.** Confirmado, y es peor de lo anotado: la vez que lo pediste la segunda noche, tres de los cinco números estaban mal
y el director te los corrigió de memoria. Hoy muestra lo que el director se anota para él.

**Los frenos.** En las dos noches hubo unos cien frenos. **Ninguno paró algo malo** y ninguno te despertó, pero doce veces un freno
se colgó por tiempo y bloqueó algo inocente (hasta un comando que solo escribía un texto), y dos veces frenó a una sesión por
*escribir* la palabra "aprobar" en un mensaje. Eso no te cae a vos directo, pero hace que las sesiones aprendan a decir "se colgó
el freno, reintento", que es justo lo que no querés que aprendan.

**Una buena.** Las dos noches trabajaron solas de punta a punta: 19 y 24 encargos, cero intervenciones tuyas de noche. Lo que
falla es el final y cómo te hablan, no el trabajo.

**Lo que propongo**, en orden de cuánto te saca (el detalle, al final): que la noche termine sola (una sesión que el kit abre en
tu carpeta cuando el módulo está listo) · aprobar con un clic desde donde estés · `/estado` para vos · un reporte de la mañana sin
comandos · la regla de cómo te hablan · publicar sin tocar las claves.

---

## Los ítems 17-37

Marcas: ✅ confirmado · ✏️ corregido (qué cambia) · ❌ no se sostiene. Abreviaturas: `M/` = `kit/molde/` · `PC/` =
`kit/skills/arquitecto-skills/pc/` · `EQ/` = `kit/skills/arquitecto-skills/` · `AR/` = `kit/skills/arquitecto/` · DIR, OBR, EST =
`M/skills/{director,obrero,estado}/SKILL.md`.

| # | Marca | En una línea |
|---|---|---|
| 17 | ✅ | El Arquitecto no pregunta "¿lista o cola?" (cero apariciones en `AR/`; `AR/anexos/formato-spec.md:130,134` asume lista) [L]. La cola anduvo planteada en el spec. Queda chica, como dijo Guido; lo que sí arrastra es `/estado` ("avance 0 de 3" con 12 de 25 hechos) y `me-voy`, que listó 4 encargos ya cerrados como "sin rama: el obrero no arrancó" (22:38, noche 2). |
| 18 | ✏️ | (a) `cerrar` no exige la carpeta principal: se niega solo si estás **adentro** del worktree que cerrás (`M/scripts/worktree.cjs:924`); el director cierra los de sus obreros y no el suyo. Y en Windows ni desde afuera se puede con la pestaña abierta (`cerrar cola` falló con "Permission denied", 11/11 10:11). (b) Confirmado: DIR:23 prohíbe `/cierre` y DIR:22 le da al dueño la línea. **El remedio que propone ya se probó**: ver 36. |
| 19 | ✅ | Noche 1: 9 mensajes de 2 obreros, 6 llegaron. Noche 2: 19, llegaron 13 y 6 fueron a otra sesión (otro obrero, la sesión de `main`). Causa: ningún texto le dice al obrero cuál es el director (OBR:13; `M/skills/nucleo/NUCLEO.md:15`). De las dos salidas del ítem, la medida es la segunda: al director lo mueven los avisos de fin de sus procesos de fondo (38 y 43 por noche), no los mensajes. |
| 20 | ✏️ | (a) `encargo.cjs mensaje` **no commitea nada**: solo juzga el mensaje (`M/scripts/encargo.cjs:231-252`); la CORRECCION la commitea el director a mano en `modulo/<x>` (DIR:18) y nada la lleva a la rama del obrero. El arreglo no es "que `mensaje` commitee en la rama del obrero" sino que `presentar` (lo corre todo obrero al arrancar) traiga o muestre lo corregido después de su partida. Se repitió la noche 2 (18:50) y quedó "CORRECCION = cancelar y recrear". (b) La confianza: el aviso "Ignoring 48 permissions.allow… not been trusted" nombra **la carpeta principal**, no un worktree (charla de `pulido`, 12:39): ver R2. |
| 21 | ✅ | Los cuatro, en el código: no hay commit de trabajo antes de parar (OBR:18,22); `donde` no deja entrar ni al mismo encargo (`worktree.cjs:1298-1305`); el candado de `integrar` mira ramas, no la ficha (`:1176-1182`); `cerrar --cancelado` borra con `--force` sin guardar (`:893`). Lo que faltaba: el rescate no lo impidió un freno del kit sino el aislamiento de Claude Code sobre un `git` del director hacia otro worktree (02:31, noche 1). Un script de node no tiene ese límite (`cerrar` ya opera sobre otros worktrees): el rescate tiene que ser un subcomando, no git a mano. |
| 22 | ✅ | (a)-(e) en el código [L, salvo (c) y (d) que abrí: `M/hooks/lib/encargo.cjs:125-134`]. `plantilla-encargo.md` (16 renglones) no aclara ninguna. Suma una contradicción: `Skill: tramo` lo ofrecen `M/skills/tramo/SKILL.md:3` y `manuales/ROLES.md:92-93`, y `autorizado` lo rechaza ("tiene que decir obrero"). |
| 23 | ✅ | `verificar` lee la ficha de la rama por defecto de origin (`encargo.cjs:129-132` [L]). La noche 2 lo repitió más fuerte: `main` sumó una prueba al `comando-test` y todas las ramas abiertas de `cola` empezaron a fallar (18:15). |
| 24 | ✅ | (a) "mergeado" = tiene sub-pasos y su punta está contenida en `modulo/<x>` (`M/scripts/estado.cjs:209-216`); una rama recién creada cumple si el director commiteó algo entre medio. (b)-(d) confirmados [L]. Se repitió la noche 2 (17:23). (e) `afirmaciones.cjs`: NO VERIFICADO (no se abrió). |
| 25 | ✏️ | **No fue el hook de escritura.** `escritura-docs` solo engancha `Write` sobre `docs/` (`M/settings.json:42`). El `Edit` lo negó `PC/secretos.cjs` (regla `frenos-del-proyecto`, `:354`, `:824-826`, `:863-869`), que también niega **leer** nombrando `.claude` (un `git grep`, un `sed`). Y aunque pasara, `.claude/hooks/**` es barrera para el candado (`M/hooks/lib/cambios.cjs:372`): el commit pediría un cambio aprobado. Autorizarlo "por el `## Toca`" obliga a abrir dos redes. `branch -D`: confirmado, sin excepción para ramas propias (`M/hooks/git-seguro.cjs:60-61`). El timeout no fue un caso: ver N1. |
| 26 | ✅ | Con una precisión: `crear` corre el `comando-setup` de la ficha (no un `npm ci` fijo) y **sin plazo** (`worktree.cjs:585`). El choque por datos de prueba se repitió la noche 2 (19:40). Suma: 31 denegaciones entre las dos noches a obreros que solo querían saber a qué banco de pruebas apuntaba su carpeta (ver N9). |
| 27 | ✅ | Sigue siendo la lista de lo no probado. (b) sigue: la noche 2 tampoco hubo mudanza. |
| 28 | ✅ | Confirmado, y la noche 2 ni se lanzó. El código lo sigue ofreciendo: `M/scripts/noche.cjs:20,33`, DIR:21, `ROLES.md:132-133`, y `me-voy` imprime la línea para lanzarlo (`noche.cjs:200` [L]). |
| 29 | ✅ | El mecanismo está en el kit: `integrar` corre el `comando-test` en un worktree **temporal** (`worktree.cjs:1041-1079`, `:1098-1125`); nada lo corre en la carpeta principal salvo el `sello` del Arquitecto. |
| 30 | ✅ | `worktree.cjs:1120` sigue en 120 s (hay 14 plazos fijos de 120 s en el archivo [L]). Costó 3 h 33 de "publiquemos" a publicado, 155 min esperando que Guido eligiera entre dos opciones. **Ojo con el remedio**: nadie midió qué tarda 12 minutos (el director midió gitleaks en menos de 1 s y lo descartó): antes de elegir un número, medir. |
| 31 | ✏️ | **No hay un "techo" de tokens: las dos compactaciones fueron por inactividad.** Las dos traen `precomputed: true` y el aviso *"Compacted using a summary written while you were away · turn off with "idleCompaction": false in settings.json"*. El resumen se escribió a los **54 min 50 s** (noche 1: último evento 04:13:54, resumen 05:08:44) y a los **55 min 12 s** (noche 2: 23:16:34 → 00:11:46) de quedar quieto, y se aplicó al despertar. Por eso 384 mil una noche y 801 mil la otra. Lo propuesto ("el techo es el más bajo medido") no arregla nada: un director compacta cada vez que espera más de ~55 min a un obrero, tenga el contexto que tenga. El umbral de DIR:20 y de `me-voy` mide otra cosa. |
| 32 | ✅ | Tal cual, con la causa: EST:13 manda mostrar la salida **cruda**; "TE ESPERA" es el volcado de la sección `Te espera` de cada ficha (`estado.cjs:251`), que escribe el director para él; el avance cuenta casillas de la ficha; solo ve ramas vivas. Una precisión: el script no imprime SHAs ni `CORRECCION`: llegan adentro de lo que el director escribió en la ficha. El arreglo tiene dos mitades: el script y qué se anota en "Te espera". |
| 33 | ✏️ | **La causa de (a) es otra.** Ningún mensaje del kit trae una línea con `&&` para aprobar: la improvisa la sesión. El kit **ya firma con un clic** (`M/hooks/niega-aprobar.cjs:8-10,91`; `GUIA-DE-USO.md:102`), pero solo en la carpeta principal, en la rama por defecto y con el cambio commiteado ahí (`M/scripts/cambios.cjs:409-422`), y sus textos dicen "es el OK de una persona" (`niega-aprobar.cjs:86`), "lo aprieta el dueño: un agente no aprueba" (`worktree.cjs:1455`; `EQ/scripts/actualizar.cjs:1130`). (b)-(f) confirmados; (b) además es recurrente [L]. El conteo real: 66 renglones con un comando en el molde y 30 en las skills globales [L]; de esos 30, de verdad del dueño son 6. |
| 34 | ✏️ | La medida y el remedio. Conté 290 apariciones en 45 archivos, pero **solo 22 renglones de salida en 8 archivos** traen la palabra [L]; `estado`, `resumen`, `noche`, `cambios` y los hooks, ninguna. A Guido le llega por la prosa de las sesiones (16 de 32 mensajes largos del director la noche 1; 15 de 45 la noche 2) y por los reportes que escribe un obrero. Arreglo: una regla de habla + esos 22 renglones, no las 290. |
| 35 | ✅ | Los tres [L, con prueba]: `EQ/scripts/preparar-pc.cjs:677` borra el archivo y no la carpeta; `EQ/scripts/doctor.cjs:93-96` usa `statSync().isFile()`, que con el `py.exe` de `WindowsApps` da error; `--traer` no nombra worktrees (`EQ/scripts/lib/adoptar.cjs:1566-1572`). |
| 36 | ✅ | Confirmado y ampliado: (i) el director no usó `ExitWorktree` porque su skill dice "nunca `ExitWorktree`" (DIR:12; OBR:12; lo fija `M/skills/skills.test.cjs:244-254`); (ii) el subagente vivió 26 s y probó dos comandos, los dos `git`; (iii) después de `ExitWorktree` los frenos del kit siguieron viendo un director (R1); (iv) **la vía que anda ya se usó**: la noche 1, a las 12:36, el director lanzó `claude.exe -p --model sonnet --permission-mode auto` parado en la carpeta principal, con el pedido en un archivo, y esa sesión hizo el `/cierre` y después el release. La noche 2, el director escribió que eso "sería rodear el freno". |
| 37 | ✏️ | `secretos.cjs` **no** niega cargar el `.env` sin imprimirlo (`PC/secretos.cjs:348`: "sí… `source` sin imprimir nada"). El único freno fue el clasificador. Lo que siguió fue peor de lo anotado: la línea con `!` era de bash, Guido la pegó en PowerShell y falló; la segunda línea, ya en PowerShell, **lee la clave del `.env` en la terminal de Guido**. (b) Hoy no se cumple: el adoptador no deja ninguna autorización de publicar y `preparar-pc` solo escribe `autoMode` para entornos de prueba [L]. |

---

## El inventario de fricción

Tipos: **(a)** le pide tipear o pegar · **(b)** lo deja esperando o con una tarea · **(c)** jerga · **(d)** frena algo inocente o
pide un permiso que igual se da. "Ítem" = dónde está en el tracker, o **nuevo**.

### 1. Preparar la PC y adoptar un repo

| Qué | Tipo | Dónde | Ítem | Qué lo sacaría |
|---|---|---|---|---|
| Una PC nueva no tiene Equipador y `INSTALAR.md` manda a pedírselo; el README habla de clonar, `INSTALAR.md` de un zip | b | `kit/INSTALAR.md:3-11` [L] | nuevo | Una sola ruta escrita |
| Los programas que faltan salen como líneas `winget install…` para el dueño | a | `EQ/scripts/preparar-pc.cjs:134-140` [L] | 33 | Que los instale la sesión con un clic; `gh auth login` sí es de él |
| El plan que se le muestra trae un renglón por archivo (~110) y la pregunta se hace aunque diga "sin cambios" | c, d | `preparar-pc.cjs:632-639,670`; `EQ/SKILL.md:42-43` [L] | nuevo | Resumen de una línea; sin cambios, no preguntar |
| La tabla final y el `doctor` se pegan crudos, con nombres internos (`automode`, `hooks-pc`, `tope-skills`…) | c | `EQ/SKILL.md:44,83-84` [L] | 34 | "Todo bien / 2 avisos / 1 cosa a arreglar", el detalle a pedido |
| Escribir el `autoMode` lo frena el clasificador y el kit no dice qué hacer; vuelve cada vez que cambia una ficha | a, d | `preparar-pc.cjs:612-619,679`; `doctor.cjs:674` [L] | 33b | Prueba 2 de la sesión 2; si frena, un clic |
| "corré doctor" en 27 archivos: no es un comando, es pedirle algo al Equipador, y ningún texto lo dice | c | [L, inventario] | nuevo | "pedile al Equipador que revise la PC" |
| La pantalla de la adopción son ~8 decisiones seguidas con nombres "D1…D4", "propia", "entornos" | c, d | `AR/anexos/flota.md:32-39`; `manuales/EQUIPADOR.md:141-148` [L] | nuevo | Preguntar solo lo que cambia el resultado, en criollo |
| `--traer` se niega por archivos sin seguir que no chocan, y por la rama, sin decir qué worktree la tiene | b, d | `adoptar.cjs:1539,1566-1572` | 11, 35c | Los del ítem |
| Cuando `--traer` se niega, le da al dueño líneas de git (una es `reset --hard`) | a | `adoptar.cjs:1564,1568,1571,1579` | 33 | La sesión lo hace con un clic |
| "En tu carpeta, una vez: `<setup>`", con `&&` | a | `adoptar.cjs:347-348,1590` [L] | 33 | Lo corre la sesión |
| El clon de la adopción y el de la flota, sin `core.longpaths` | b | `EQ/scripts/lib/flota.cjs:387`; `flota.md:31` [L] | 10 | El del ítem |
| `preparar-pc` deja carpetas vacías; el `doctor` no ve `py` | b, c | ver 35 | 35 | Los del ítem |

### 2. `/inicio`

| Qué | Tipo | Dónde | Ítem | Qué lo sacaría |
|---|---|---|---|---|
| "…si fue a propósito, corré `sello` de nuevo" | a, c | `M/skills/inicio/SKILL.md:23` | 33 | "¿lo vuelvo a sellar?" con botones |
| Una fusión del kit que toca un freno: tres pasos (`cambios nuevo` → `aprobar` → commit), "lo apretás vos" | a | `inicio/SKILL.md:25`; `actualizar.cjs:1128-1132` | 33 | El clic de aprobar, y lo demás lo corre la sesión |
| Lo que inyecta el arranque trae 🔴 y 🟠 y "rojo y naranja" con otro sentido (la urgencia del TODO) | c | `M/hooks/lib/inyeccion.cjs:727,735`; `topes.cjs:218` [L] | 34 | Decir "urgente / importante" |

### 3. Pedir algo chico

Nada nuevo en la skill: mide el tamaño sin preguntar y sigue (`inicio/SKILL.md:26-28`). La fricción de lo chico es la de los frenos
(paso 9) y la de `/cierre` (paso 8).

### 4. El Arquitecto (Modo B)

| Qué | Tipo | Dónde | Ítem | Qué lo sacaría |
|---|---|---|---|---|
| Invocado fuera de la carpeta o en otra rama: "abrí una sesión ahí" y se apaga | b | `AR/anexos/modo-b.md:6,8` [L] | nuevo | Que cambie de rama con un clic |
| Sin director prendido en el proyecto: una línea de `actualizar.cjs resolver…` "la corre el dueño en su carpeta" | a, c | `modo-b.md:42` | 33 | La corre la sesión |
| El `sello` falla: "¿corriste el comando-setup en esta carpeta?" | b, c | `AR/scripts/arquitecto.cjs:309-312` [L] | nuevo | Que lo corra la sesión |
| La apertura del director: tres vías, el nombre de la sesión, el modelo a mano, `code`, terminal | a, c | `worktree.cjs:487-496`; `modo-b.md:64-66` | 33 | Solo la primera vía |
| "Feature diseñada, sellada y armada" cuando con director el spec puede quedar en BORRADOR: le espera otra charla que nadie le avisó | b | `modo-b.md:55` contra `:63` | nuevo | Una línea para ese caso |
| Al terminar: "verificá que lo de NO SE TOCA sigue andando… si no, a mano" | b | `modo-b.md:68` | nuevo | Lo corre la sesión que construye |
| No pregunta "¿lista o cola?" para un módulo de noche | b | ver 17 | 17 | La pregunta |
| A mitad de la obra, sumar un diseño: "la tenés que abrir vos" (14:02, noche 2) | b | DIR:13 | nuevo | Va con el final de la noche: una sesión que el kit abre |

### 5. El director y sus obreros

| Qué | Tipo | Dónde | Ítem | Qué lo sacaría |
|---|---|---|---|---|
| **Abrir cada obrero es del dueño por defecto**: "dale las líneas de `worktree` y `autorizado`" | a | DIR:16; `ROLES.md:56`; `plantilla-encargo.md:7`; `encargo.cjs:404` | nuevo | Que el defecto sea el director (las dos noches se usó así) |
| Una regla con comillas dobles en `## AUTORIZADO` deja sin línea de fondo: "la apertura es de Guido" (14:35, noche 2) | a | `encargo.cjs:360` | nuevo | Avisarlo al escribir el encargo |
| "Lo que un encargo necesita va a su AUTORIZADO; si falta, lo tipeás vos" | a | `ROLES.md:41` | 33 | Un clic |
| El director dijo "no puedo" sin probar y le pidió a Guido correr un `npm` en la carpeta principal; 28 min después lo corrió él y anduvo | a | charla de `cola`, 17:39 y 18:07 | nuevo | Regla: probar antes de pedir; el aislamiento solo frena `git` |
| Una CORRECCION no le llega a un obrero de fondo | b | ver 20 | 20 | `presentar` la trae |
| Un obrero que para deja su carpeta sin poder retomarse | b | ver 21 | 21 | Los del ítem, por script |
| Los chequeos rechazan lo que la plantilla no dice | d | ver 22 | 22 | La plantilla |
| El `comando-test` cambia en `main` y las ramas abiertas empiezan a fallar | d | ver 23 | 23 | `verificar` lo dice |
| Los mensajes de los obreros van a otras sesiones (la de `main` de Guido los recibió) | c | ver 19 | 19 | Un obrero de fondo no manda mensajes |
| `cerrar` con archivos sin seguir: "los borrás vos (o el director) con `git -C … clean -fd`" | a | `worktree.cjs:969-978` | 33 | Preguntar con botones |

### 6. "Me voy" y la noche

| Qué | Tipo | Dónde | Ítem | Qué lo sacaría |
|---|---|---|---|---|
| **El final**: integrar anda, y publicar, el cierre y limpiar quedan para Guido. Noche 1: 3 comandos a las 07:36 y 7 tareas en el reporte. Noche 2: 3 pasos y 481 min quieto | a, b | DIR:22-23; ver 18 y 36 | 18, 36 | Propuesta 1 |
| El pedido para la mañana quedó en una carpeta temporal fuera del repo; Guido no lo usó | b | charla de `cola`, 01:56 | 36c | Commiteado en la bitácora, o mejor: que no haga falta |
| Tareas de limpieza para la mañana: `git branch -D`, `git worktree remove` ×3, `git worktree prune`, `sparse-checkout` en la otra PC | a | Deptos, `docs/modulos/pulido/bitacora/2026-11-10-reporte-final.md` ("Tareas de la mañana") | 33e | La hace el cierre de noche; lo que no pudo, "decime 'limpiá'" |
| El reporte de la noche le deja al dueño **el mismo comando que el freno le negó al agente** (`git branch -D tmp-mut-19`) | a, d | mismo reporte; `git-seguro.cjs:60-61` | 25 | Borrar ramas propias |
| `me-voy` le dice al director "pasa del 40 %: mudate antes de irte" con una cuenta que no mide lo que importa | c | `noche.cjs:196-197` [L]; ver 31 | 31 | Ver propuesta 9 |
| `me-voy` imprime la línea del despertador, que no despierta | a | `noche.cjs:200` [L] | 28 | Sacarlo |
| `me-voy`: "VPN, credenciales y dispositivos… miralos vos"; "pegá en el .gitignore…" | b | `noche.cjs:174,192` [L] | nuevo | Lo segundo lo hace el script |
| Esperas con Guido de despertador: 96 y 155 min (noche 1), 481 min (noche 2) | b | charlas, huecos medidos | 18 | Propuesta 1 |
| El reporte cita decisiones por un código de 8 letras (`f453df65`) y por "C13", "0057" | c | reportes finales de las dos noches | 34 | Plantilla del reporte |

### 7. `/estado`

| Qué | Tipo | Dónde | Ítem | Qué lo sacaría |
|---|---|---|---|---|
| Salida cruda del script; "TE ESPERA" con historia del director; 3 de 5 cifras mal (17:23, noche 2) | c | EST:13; `estado.cjs:209-216,251` | 32, 24 | El reporte del dueño (propuesta 3) |
| En la vista de un módulo, "TE ESPERA" no va primero | c | `estado.cjs:296-304` | nuevo | Mismo orden siempre |
| "resumen del día: falta — corré: `node .claude/scripts/resumen.cjs`" cuando el script ya lo tiene cargado | a | `estado.cjs:291` | 33 | Que lo corra él |
| El resumen del día trae SHAs, "sesión… carpeta…" y nombres de frenos | c | `M/scripts/resumen.cjs:59-67,162,204` [L] | 34 | Va con la plantilla |
| Guido preguntó tres veces más por el avance esa noche (18:17, 20:33, 22:37), en prosa | b | charla de `cola` | 32 | Que `/estado` conteste eso |

### 8. Integrar, publicar y `/cierre`

| Qué | Tipo | Dónde | Ítem | Qué lo sacaría |
|---|---|---|---|---|
| **Aprobar un cambio de freno desde un módulo**: negado al director, la línea a Guido; C13 esperó 20 h | a, b | `niega-aprobar.cjs:86`; `cambios.cjs:409-422` | 33a | Propuesta 2 |
| Un cambio de freno nacido en un módulo **no se puede aprobar hasta integrar el módulo**: el archivo no está en la rama por defecto (se sigue del código; nadie llegó a probarlo) | b | `cambios.cjs:146-153,418-419` | nuevo | Que el cambio viaje solo a la rama por defecto, o aprobar desde la del módulo (con red team) |
| `traer-main` con una barrera: una línea larga de `cambios nuevo…` "para el dueño, en su checkout principal" que el script ya tiene armada | a | `worktree.cjs:1452-1455` | 33 | Que la corra el script |
| El motivo del clic de aprobar habla de "barrera", "los 8 del hash" | c | `niega-aprobar.cjs:42-44` | 34 | "Vas a aprobar: <la regla, en una frase>" |
| El push de `integrar` se corta a los 2 minutos | b | `worktree.cjs:1120` | 30 | Medir y subir |
| Publicar frena por la clave; salida con `!`; la línea era de bash | a, d | charla de `cola`, 09:58-10:02 | 37 | Propuesta 6 |
| `integrar` termina en "después: /cierre en tu carpeta principal" y el director no puede | a, b | `worktree.cjs:1127`; DIR:22-23 | 18 | Propuesta 1 |
| `cerrar` del módulo falla con la pestaña abierta: "cerrá la pestaña y corré cerrar de nuevo" | a | `worktree.cjs:986-991`; 11/11 10:11 | nuevo | Lo hace una sesión que no vive ahí |
| `/cierre` commitea `frenos.log`, que se ensucia solo | d | `M/skills/cierre/SKILL.md:18,33` | nuevo | Ver N4 |

### 9. Los frenos (cruza todos los pasos)

Las dos noches: 43 y 59 frenos explícitos. Ninguno paró algo dañino ni cambió un resultado; casi todos costaron un reintento.

| Qué | Tipo | Dónde | Ítem | Qué lo sacaría |
|---|---|---|---|---|
| **N1 · Frenos que se cuelgan**: 2 (noche 1) y 10 (noche 2), todos inocentes, uno sobre un `echo`. `sensible` 9, `git-seguro` 1, `escritura-docs` 1, `secretos` 1 | d | `M/settings.json` (`timeout: 20`, `onFailure: block`); `EQ/scripts/instalar-hooks-pc.cjs:82`; `M/hooks/lib/git.cjs:12-14` lo anticipa | 25 (parte) | Medir bajo carga; plazo propio; con red team |
| **N2 · Frena por leer la palabra**: cualquier comando que contenga "cambios" y "aprobar" (un texto en un archivo, un mensaje de commit) | d | `niega-aprobar.cjs:26-30`; noche 2, 14:27 y 22:36 | nuevo | Mirar el comando, no el texto |
| **N3 · Niega lecturas** que nombran `.claude` o `.githooks` | d | `PC/secretos.cjs:354`; noche 1, 03:09 | nuevo | Dejar leer |
| **N4 · `frenos.log`** está versionado y cada freno lo ensucia: trabó un merge (22:35, noche 2) | d | `M/gitignore.snippet:13`; `M/gitattributes.snippet:1` | nuevo | Que no viva en el árbol |
| El obrero no sabe a qué banco apunta y los frenos no lo dejan mirar: 31 denegaciones | d | `secretos.cjs:348`; `M/settings.json` (`Read(./**/.env.*)`) | nuevo (N9) | Que el encargo o `crear` lo digan |
| Un `ls` o una búsqueda sobre un `.env` negados en sesiones de fondo aunque el freno dice que `ls` se puede: 15 veces. Causa: NO VERIFICADO | d | charlas de obreros | nuevo | Averiguar la causa primero |
| `git restore --source` negado por rutas con paréntesis; el obrero perdió la prueba previa | d | noche 2, 22:35 | nuevo | Revisar la regla |
| El aislamiento de Claude Code (no es del kit): 12 y 7 frenos al director, casi todos por comandos compuestos | d | charlas | 21, 36 | Skills con comandos simples; lo grande, por script |
| `sensible` pregunta también en una sesión de fondo, donde nadie contesta | d | `M/hooks/sensible.cjs:71` [L]; OBR:16 | nuevo | Tratar el fondo como la noche |
| Quitar cualquier freno pide `cambios nuevo` + clic + commit + push | b | `M/hooks/lib/cambios.cjs:368-377` [L] | 33 | Es a propósito; lo que sobra es el camino hasta el clic |

### 10. La flota y "actualizate"

| Qué | Tipo | Dónde | Ítem | Qué lo sacaría |
|---|---|---|---|---|
| Ni la skill ni el anexo dicen de correrla de fondo, y cada chequeo puede tardar 30 min | b | `flota.cjs:50,652`; `EQ/SKILL.md:93-95` [L] | nuevo | De fondo, con aviso |
| `--canon <url>` es obligatorio y ningún texto dice cuál es | b | `flota.cjs:635` [L] | nuevo | Un valor por defecto |
| Rama protegida o push rechazado: "mezclá `kit/<v>` vos" | b | `flota.cjs:554-556` [L] | nuevo | Un clic |
| Repo salteado por obra: "borrá la rama desde la web" | b | `flota.cjs:287,402` [L] | nuevo | Que lo ofrezca la sesión |
| "Si `auto` no deja pushear, la corre Guido en su terminal", y la tabla no trae la línea | a | `flota.md:22`; `EQ/SKILL.md:94` | 33 | Un clic |
| Después de la flota, la carpeta de Guido queda atrasada y nada lo dice | b | [L]; NO VERIFICADO si `/inicio` lo cubre | nuevo | Una línea al final |
| Líneas con `&&` que el kit dice que "andan igual" en todas las terminales | a | `adoptar.cjs:1206-1220`; `actualizar.cjs:1119` [L] | 33 | Pasos separados |

---

## Lo roto

Lo que no anda, se contradice o promete lo que el código no hace. Solo con evidencia.

**Lo que decide el diseño**

- **R1 · Después de `ExitWorktree`, el kit sigue viendo un director.** La mañana del 11, la sesión salió con `ExitWorktree`
  (`action: keep`) a las 09:57:28; cada comando siguiente termina en *"Shell cwd was reset to …\modulo--cola"*, y a las 10:01:01
  `cambios.cjs aprobar` (con `cd` a la carpeta principal adelante, y con Guido pidiéndolo) lo negó el hook: *"no corre desde una
  carpeta de agente (.kit-rol: director)"*. `ExitWorktree` levanta el aislamiento de Claude Code, pero los frenos del kit miran la
  carpeta de la sesión, que sigue siendo la del worktree. El remedio (a) del ítem 36 no alcanza solo.
- **R2 · La carpeta principal de Deptos figura sin confianza para las sesiones de fondo.** *"Ignoring 48 permissions.allow entries
  from .claude/settings.json: this workspace has not been trusted… projects["C:/…/Proyecto Deptos"].hasTrustDialogAccepted"*
  (salida del `claude -p` del cierre, 12:39 del 10/11). Guido trabaja en la extensión de VS Code; el `claude` de fondo no ve esa
  confianza. Todas las sesiones de fondo corren sin la lista de permisos del proyecto. Si aceptarla una vez en la carpeta
  principal cubre a los worktrees: NO VERIFICADO.
- **R3 · Dos directores, la misma pared, dos respuestas.** Noche 1: lanzó `claude -p` en la carpeta principal y cerró y publicó.
  Noche 2: *"lanzar un `claude -p` aparte en la carpeta principal sería rodear el freno, así que no se hizo"*. El kit no dice cuál
  es la vía (DIR:22-23 solo prohíbe).
- **R4 · El director tiene prohibida la salida que el ítem 36 propone**: "nunca `ExitWorktree`" (DIR:12, OBR:12), con una prueba
  que lo exige (`skills.test.cjs:244-254`).
- **R5 · La compactación**: `M/scripts/contexto.cjs:13-14,31`, DIR:20 y `me-voy` hablan de porcentajes; lo que compactó fue la
  inactividad (ver 31). `/director` llama "falla" a compactar y no tiene cómo evitarla.

**Lo que se contradice**

- **R6 · Quién aprueba.** `GUIA-DE-USO.md:102,199` y `cierre/SKILL.md:31`: "lo corre la sesión cuando el dueño lo pide, y su clic es
  la firma". `worktree.cjs:1455` y `actualizar.cjs:1130`: "lo aprieta el dueño: un agente no aprueba".
- **R7 · `Skill: tramo`**: lo ofrecen `tramo/SKILL.md:3` y `ROLES.md:92-93`; `autorizado` lo rechaza (`M/hooks/lib/encargo.cjs:132-134`).
- **R8 · "Nunca editar `settings.json` a mano"** (`EQ/SKILL.md:89`) y el `doctor` manda "corregilo a mano" (`doctor.cjs:280,670,675`) [L].
- **R9 · `autorizado:` de la ficha no autoriza nada de `sensible`**: el ejemplo dice "lo que no es pregunta" (`M/kit.ejemplo.md:38`)
  y `sensible.cjs` no lo lee [L].
- **R10 · Sin escáner**: el githook imprime "pasa por ser humano, en rojo" y cierra con "en verde", salida 0
  (`M/githooks/kit-githook.cjs:787,895`).
- **R11 · "Sellada y armada"** con el spec en BORRADOR (`modo-b.md:55` contra `:63`).
- **R12 · "Andan igual en todas las terminales"** y las líneas llevan `&&` (`adoptar.cjs:1206-1220`, `actualizar.cjs:1119`); y
  `EQ/SKILL.md:80` usa `node ~/…`, que en PowerShell 5.1 llega literal [L, probado].

**Lo que promete y no hace**

- **R13 · El despertador** (28): se ofrece en cuatro lugares y no despierta.
- **R14 · "Las cifras las calcula un script, nunca la memoria de nadie"** (EST:8): la noche 2 el director corrigió 3 de 5 de
  memoria.
- **R15 · `secretos.cjs` manda "pedíselo al director"** (`:354`): el director tampoco puede sin un cambio aprobado, y el cambio no
  se puede aprobar hasta integrar. La cadena termina en Guido, 20 horas después.
- **R16 · `--traer` sale con código 0 sin haber traído nada** (`adoptar.cjs:1564,1568,1571`).
- **R17 · `paquete.cjs --pruebas` con una ruta** da un fallo falso y el paquete sale igual con 0 [L].
- **R18 · El `comando-setup` de `crear` corre sin plazo** (`worktree.cjs:585`); el plazo del `sello` (hasta 60 min) no entra en
  los 10 min que le manda poner la skill (`arquitecto.cjs:201-206` contra `modo-b.md:49`) [L].
- **R19 · La línea de PowerShell de `cargar-secreto`** va sin `-ExecutionPolicy Bypass` (`PC/secretos.cjs:340`); su propia prueba
  la usa (`PC/cargar-secreto.test.cjs:50`). Si anda sin ella en la PC de Guido: NO VERIFICADO.
- **R20 · El `doctor`**: `EQ/SKILL.md:83` dice 26 chequeos y son 29; un arreglo apunta a una ruta relativa que no existe donde
  se corre (`doctor.cjs:410`) [L].
- **R21 · "Guido" está escrito en el kit que se instala**: `--ok-de-guido` (`worktree.cjs:1187`), "apertura de Guido"
  (`encargo.cjs:357-404`), "Lo hace Guido a mano" ×4 (`git-seguro.cjs:64-67`). Para Juan o cualquier otro, el kit le habla a otra persona.

---

## Lo que propongo para la rc.7

Ordenado por cuánto le saca a Guido. Costo: **chico** (textos y una prueba) · **mediano** (un script y sus pruebas) · **grande**
(diseño con red team). No es el plano: es el orden y el tamaño.

| # | Qué | Le saca | Depende de | Costo |
|---|---|---|---|---|
| 1 | **La noche termina sola.** Con el módulo integrado, el kit lanza **una sesión de fondo en la carpeta principal** (como lanza a los obreros; no un subagente) que trae lo integrado, publica si la ficha lo autoriza, prueba, hace el `/cierre`, limpia y cierra la carpeta del módulo. El pedido va commiteado en la bitácora. `/director` deja de prohibir y dice la vía | Los 3 a 7 pasos de cada mañana y las 8 horas quieto (18, 36, 33c-e, R3) | Prueba 1 de la sesión 2; R1 y R2 | grande (toca quién publica) |
| 2 | **Aprobar con un clic desde donde esté.** (a) Los textos de R6 y de `niega-aprobar` dejan de decir "lo corre una persona" y dicen "pedíselo a la sesión de la carpeta principal; el dueño hace clic". (b) Un cambio nacido en un módulo se puede aprobar sin esperar a integrar. (c) El motivo del clic, en una frase | Las dos corridas a mano y las 20 h de C13 (33a, R15) | Prueba 3 de la sesión 2 | (a) y (c) chico · (b) grande |
| 3 | **`/estado` del dueño** (el del ítem 32) + una regla de qué se anota en "Te espera": solo lo que pide un clic o una decisión suya, en criollo | El reporte que usa todo el día (32, 24, R14) | — | mediano |
| 4 | **El reporte de la mañana, con plantilla del dueño**: qué quedó · qué decidís (con botones) · nada para tipear. La limpieza es del cierre de noche; lo que no pudo, una línea | Las 7 tareas con comandos (33e) | 1 | chico |
| 5 | **La regla de habla**, en el núcleo y en el `CLAUDE.md` del molde: al dueño, "pasó / falló"; sin códigos sueltos; **nunca una línea para pegar** (si no hay otra, PowerShell, una por renglón, y se anota como falla del kit). Más los 22 renglones de salida y R21 | "Rojo", las siglas, los `&&` (34, 33) | — | chico |
| 6 | **Publicar sin leer claves**: lo que dé la prueba 2; hoy el kit no deja nada autorizado para publicar | El comando con `!` (37) | Prueba 2 de la sesión 2 | mediano, con red team |
| 7 | **Abrir obreros es del director por defecto**; y `autorizado` avisa al escribir el encargo si una regla lo va a dejar sin línea de fondo | Pegar líneas de apertura (inventario 5) | — | chico |
| 8 | **Los frenos que se cuelgan y los que leen la palabra** (N1, N2, N3): medir primero cuánto tarda cada uno con cuatro obreros vivos; después plazo propio, y mirar el comando y no el texto | Nada directo a Guido; les saca a las sesiones el "se colgó, reintento" | Medición | mediano, con red team |
| 9 | **La compactación**: decidir entre apagar `idleCompaction` desde `preparar-pc` o que el director deje todo commiteado antes de cada espera larga; y que `me-voy` deje de mandar a "mudarse" por porcentaje | La alarma falsa de cada "me voy" (31, R5) | Una prueba corta | chico |
| 10 | **El paquete de taller del director**: 20a (`presentar` trae la corrección) · 21 (commit de trabajo al parar, `donde` deja entrar al mismo encargo, el candado lee "cancelado", rescate por script) · 22 (la plantilla dice lo que los chequeos exigen; R7) · 23 · 24 · 28 (sacar el despertador) · 30 (medir y subir el plazo) · 19 (un obrero de fondo no manda mensajes) · N4 (`frenos.log` fuera del árbol) · 25 (borrar ramas propias) | Esperas y cancelaciones de noche | — | mediano (cada uno es chico) |
| 11 | **El paquete del Equipador**: 35a-c · 10 · 11 · R16 · R12 · R8 · R20 · el plan y el `doctor` resumidos · la flota de fondo | Detalles de preparar y adoptar | — | chico cada uno |
| 12 | **La confianza de la carpeta** para las sesiones de fondo (R2): que `preparar-pc` o la adopción lo detecten y lo digan una vez | Permisos que hoy se ignoran sin que nadie lo sepa | Averiguar qué cubre | chico, después de averiguar |

Lo que **no** propongo para la rc.7: el modo cola del kit (17: alcanza con la pregunta del Arquitecto); que un encargo autorice
tocar un freno por su `## Toca` (25: son dos redes y hay que pensarlo con red team; con la propuesta 2 el camino normal deja de
tardar 20 horas); y reescribir las 290 apariciones de rojo/verde.

**El criterio de éxito que sale de esto**, para la tercera noche: Guido dice "me voy" y a la mañana encuentra el módulo publicado,
el cierre hecho, las carpetas limpias y un reporte que no tiene ningún comando; lo único que hizo en el medio, si hizo algo, fueron
clics.

---

## Lo que no miré

- Hermes y los demás repos de la flota; el módulo `whatsapp` de Deptos; la otra PC.
- `relevamiento`, `docs-fyd`, la mesa, `/tramo` por dentro, `afirmaciones.cjs`, las ~40 mil líneas de pruebas.
- El Modo A más allá de dónde el dueño tipea o espera.
- Nada se corrió de punta a punta: `ExitWorktree` sin ventana, el clic de aprobar, el `autoMode` y el deploy son de la sesión 2.
- No verificado y dicho arriba: por qué `ls .env` se niega de fondo; qué tardó 12 minutos en el push de `integrar`; si la confianza
  de la carpeta principal cubre a los worktrees; qué hace `idleCompaction: false` con una espera de horas.

## Fuentes

- El kit en `8289944` (la base de esta sesión). El tracker: `docs/kit-v3/PLAN-construccion.md:1500-1765`.
- Deptos, `origin/main` (solo lectura): `docs/modulos/{pulido,cola}/bitacora/` (reporte final, `notas-del-metodo.md`) y
  `docs/modulos/cola/SPEC.md:140-175`.
- Las charlas: director de `pulido` (`d3f48853…jsonl`) y de `cola` (`2c6ed11c…jsonl`) y las de sus obreros, leídas por búsqueda.
  Las horas de las compactaciones, del `ExitWorktree`, del `aprobar` negado y del `claude -p` del cierre las saqué yo de esos archivos.
