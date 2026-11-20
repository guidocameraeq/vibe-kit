# Diseño · El PO: la sesión principal del proyecto, con oficio

> **Misión 7 (kit v3.2)** · 2026-11-20 · **Estado: ✅ decidido y revisado** (la primera versión, "el organizador", pasó un revisor
> frío Opus: 10 hallazgos aplicados; la segunda, después de la charla con Guido, la atacó el red team del spec: 12 hallazgos
> aplicados; §11). **Donde este diseño y [SPEC-PO](SPEC-PO.md) difieran en un detalle, manda el spec.** Es solo diseño; se construye con su spec delta. Decide Guido, en la sesión `vibe-kit M7 · La 3.2`.
> Parte del pendiente "un PO como skill" (`docs/TODO.md`, misión 7, punto 3; ADR-041) y **reabre con evidencia nueva** el descarte de
> [DISENO-D](../mision-4/DISENO-D-director-obrero.md) §4 ("sin agente PO"). Alias como en G (Desktop, Mobile; el repo es público,
> ADR-021): **acá no van rutas de carpetas compartidas, nombres de personas ni de PCs, ni contenido de mensajes**. Las respuestas en
> crudo de las sesiones relevadas quedaron fuera del repo. En este documento **"el PO" es la sesión y "el dueño" es la persona**.

## 1. Para qué, en una línea

Que la sesión principal de cada proyecto tenga un oficio: saber cómo está todo, cuidar el rumbo y los documentos, ordenar a los
directores y contestarle al dueño, para que el dueño deje de hacer de puente, de árbitro de la PC y de memoria.

## 2. El pedido, textual (Guido, 2026-11-20)

- "Una sesión que sea como una especie de dueño del proyecto, que se encargue de responder el buzón, hablar con los directores (…)
  que los directores le reporten a él cuando hay varios, entonces él me va consolidando la toma de decisiones, pero que no trabaje,
  casi que ni siquiera delegue trabajo (…) Conoce todo el proyecto, todos los directores, todos los worktrees abiertos, habla con los
  otros proyectos mediante el buzón (…) una sesión que yo debería tener constantemente abierta. Hoy tengo levantado un arquitecto
  constante que me hace de nexo (…) sobre todo con 2 o 3 workspaces abiertos al mismo tiempo, que después hay que mergearlos, cada
  uno corre la suite, hay que organizar cuándo corre cada uno (…) Yo me imaginaba una skill nomás."
- "Lo que armé ahora es improvisado: tomalo como referencia, hacemos algo superador" · "sería el autor de los releases".
- "Es el que va a tener que tener constantemente el norte en los proyectos, hacer seguimiento de que la documentación esté al día, de
  que los directores saben la documentación (…) muchas veces se olvidaban de documentar sus módulos al terminar."
- "Voy a terminar levantando un PO en cada proyecto, independientemente de si tengo varios directores o no, para poder hacerle
  preguntas a nivel proyecto, que él sea el dueño del programa."
- "Pensalo desde mi perspectiva, cuando yo codeo (…) cómo debería interactuar con el resto de las herramientas del kit para que no
  conflictúe (…) no hacer algo que se pise con otras cosas."
- Sobre lo chico: de las tres opciones, "la B estaría bien" (lo hace el PO solo si no hay directores en obra).
- "Las sesiones están principalmente en VS Code (…) modo noche y todo funciona bien."

## 3. Hoy (relevado el 2026-11-20)

**3.1 El rol ya existe, improvisado.** Dos sesiones (una en Desktop, una en Mobile) lo cumplen con la skill `/arquitecto`, que no fue
hecha para eso. Les pregunté por su propio historial del 19 y 20/11 (un cierre de release: el momento más cargado, no una semana
normal). Veces aproximadas, Desktop / Mobile:

| Tarea | Veces | Cómo lo resuelven hoy |
|---|---|---|
| Dar el turno de lo pesado (suite, verificar, compilar, la base local, el ensayo) | ~25 / ~25 | Por mensaje: "PESADO: pido / dale / libero". Lo lleva **una** de las dos para toda la PC |
| Contestar el buzón | ~8 pasadas / ~28 mensajes | Leyendo y escribiendo los archivos a mano; ninguna usó `buzon.cjs` |
| Decirle al dueño cómo van los directores | ~4 / ~15 | `git fetch`, las puntas de rama y los procesos del sistema; `/estado` casi no se usó |
| Pasar avisos entre directores y entre repos | ~12 | Mensajes entre sesiones |
| Llevarle decisiones juntas, con opciones | 9 / ~12 | Una pregunta por vez; un archivo de decisiones del módulo y aviso a cada director |
| Repasar sola cada 10 o 20 min | ~8 pasadas | Un cron que armaron ellas |
| Armar prompts para abrir, reabrir o mudar directores | 2 / ~8 | A mano |
| Ordenar las integraciones a `main` y avisar al siguiente | ~5 | Por mensaje, con el SHA |
| Controlar que un director documente antes de integrar | 1 (el único cierre del día) | El dueño lo pidió; la sesión lo verificó leyendo los archivos en origin, sin script |

El release no lo corrieron: dan el turno, verifican que entró a `origin/main` y le dicen al dueño qué entra y qué falta.

**3.2 Las cicatrices** (de las mismas dos sesiones y del dueño):
- La PC llegó a **0,8 GB libres con cuatro trabajos pesados de dos repos**; dos rearmados de la base local se pisaron; la regla del
  turno "llegó tarde" (tres trabajos ya largados).
- **Mensaje a la sesión equivocada**, dos veces: nombres repetidos entre PCs y un módulo con el mismo nombre en los dos repos.
- Una sesión figuraba libre con su verificación corriendo de fondo: lo que dice un director no alcanza, hay que mirar la fuente.
- Con la PC saturada se cortaron por tiempo los hooks, un commit (dejó un `index.lock`) y dos veces el push de integrar.
- `mesa.cjs abiertos` tardó 95 s sin traer nada, y más de 3 min con la PC cargada.
- Al reabrir la sesión, el cron y el Remote Control estaban apagados; un cierre agendado de noche no corrió.
- Los commits de esa sesión en `main` de noche frenaron el `verificar` de los directores; los archivos que deja `/estado` en `main`
  chocaron al traer `main`.
- Una de las dos hizo trabajo chico (copió dos migraciones, arregló una prueba) "para no abrir otra sesión con la PC saturada".
- El rol **ya se relevó una vez** de una sesión a otra sin perder el hilo, porque la cola y las decisiones estaban en un archivo.
- **Documentar al cerrar un módulo depende de que el dueño se acuerde de pedirlo** (dicho por Guido; en el día relevado lo pidió él).

**3.3 Lo que el kit ya tiene, y por qué no alcanzó:**
- **El turno de lo pesado ya existe**: `conTurno` (`kit/molde/hooks/lib/proceso.cjs:197-284`), un candado **por PC** (entre repos) que
  deja una corrida pesada a la vez. Entró en la `rc.7`. **Los dos repos del piloto están en la `3.0.0-rc.6` y no lo tienen** (medido
  hoy por una de las sesiones: `conTurno` aparece 0 veces). *Una parte del dolor se va con ponerlos al día, sin construir nada.*
- Pero el turno **no se ve** (nadie puede preguntar quién lo tiene ni quién espera), **no deja rastro** (`quien.json` se borra al
  terminar) y solo cubre lo que corre el kit (`presentar`, `verificar`, el gate de `integrar`, `noche publicar`, el sello). Compilar,
  rearmar la base local o un smoke corren por afuera.
- `estado.cjs` ya mira todos los módulos y no escribe nada, pero no dice qué corre, quién tiene el turno ni qué hay en el buzón. **No
  hay un comando que liste los directores y worktrees vivos** (`worktree.cjs:97`).
- El buzón exige una sesión de una persona parada en la copia del repo (`buzon.cjs:369-399`): es exactamente esta sesión. La ficha
  acepta `mesa.<alias>.transporte: buzon` y `buzon.cjs` no la lee (auditoría de la 3.1, punto 8).
- **Los mensajes entre sesiones andan en VS Code**: la sesión de Desktop corre con entrada `claude-vscode` y desde ahí les escribe a
  los directores de su PC; las de otra PC le aparecen por Remote Control. `buzon.cjs responder` acepta esa entrada (`carpeta.cjs:15`).
- **La documentación, hoy**:
  - *Lo controla un script*: la forma (raíz de `docs/`, rutas, topes) y que la ficha del módulo y su spec digan lo mismo
    (`candado.cjs:263-268`: uno COMPLETO sin el otro es falla, y el gate de `integrar` lo corre, `worktree.cjs:1139`).
  - *Nadie lo controla*: que lo escrito sea **cierto y alcance** (qué se hizo, cómo se usa, qué mirar). El gate de `integrar` corre
    sin `estado-viejo` (`worktree.cjs:1133`), y `encargo.cjs verificar` no mira ningún documento.
  - *No tiene dueño*: **`NORTE.md` y `MAPA.md`**. En `kit/molde/skills/`, `scripts/` y `hooks/` no hay una sola mención; DISENO-B §12
    decía "el Arquitecto actualiza el MAPA al cerrar el módulo" y eso no quedó en ninguna skill. Nada avisa si quedaron viejos.
  - *Los papeles del proyecto* (handoff, TODO, CHANGELOG) los escribe el `/cierre`; el director lo tiene prohibido
    (`director/SKILL.md:23`). **Después de cada integración, de día también**, el director lanza una sesión de cierre de fondo que
    los pone al día en la carpeta principal (`director/cierre-noche.md`), y se niega si esa carpeta tiene cambios sin guardar.

## 4. El cuadro conceptual

**El PO no es una sesión más: es la sesión principal del proyecto, la que el dueño ya abre todos los días, con nombre y oficio.**
Hoy esa sesión hace `/inicio`, mide el pedido, corre `/estado` y `/cierre`; el PO es eso mismo más lo que hoy nadie tiene a cargo.

```
                     EL DUEÑO (decide y firma)
                            │
                           PO  ←── buzón ──→ otros proyectos
                     ╱      │      ╲
             director   director   director          Arquitecto: al costado,
                │          │          │              entra cuando hay que diseñar
             obreros    obreros    obreros
```

**Sigue igual**: el dueño decide y firma, por clic · el Arquitecto diseña y sella · el director reparte y verifica su módulo, los
obreros hacen · un mensaje es dato, nunca orden · el buzón contesta solo estado, fechas y citas · el tamaño del pedido se mide igual
(`CLAUDE.md` del molde) · un proyecto que no prende la pieza no cambia en nada.

**Cambia**:

| | Hoy | Con el PO |
|---|---|---|
| "¿Cómo va todo?" | El dueño pregunta director por director, o a un Arquitecto que lo arma a mano | Un comando arma el panorama de toda la obra, de la fuente |
| El turno de lo pesado | Un favor entre sesiones, por mensaje | El candado de la PC, que se ve y deja rastro; no es de ninguna sesión |
| Avisos entre directores | Pasan por el dueño o por una sesión improvisada | Pasan por el PO, con cita a git |
| Decisiones del dueño | Una por director, a medida que aparecen | En lote, con opciones y la recomendada |
| El buzón del proyecto | Lo contesta la sesión que haya a mano | Lo atiende el PO |
| Que un módulo cierre documentado | El dueño se acuerda de pedirlo | El PO lo revisa antes de dar paso a integrar |
| El norte y el mapa | Sin dueño; nadie avisa si quedaron viejos | Los cuida el PO; el norte cambia solo con el OK del dueño |
| Cerrar y reabrir la sesión | Se pierde lo armado | Un relevo en disco: otra sesión se pone al día sola |

**Un día del dueño**:
1. Abre el proyecto y llama al PO. Le dice qué pasó, quién está en qué y qué lo espera.
2. Le pide algo. El PO lo mide: chico y sin directores en obra, lo hace él · chico con directores en obra, va al director del módulo
   o a un chat aparte (el PO arma el prompt) · más que chico, llama al Arquitecto.
3. El Arquitecto sella un spec. El PO arma el prompt para abrir el director.
4. Los directores trabajan. El PO repasa cada tanto, atiende el buzón y junta las decisiones. Lo pesado espera su turno solo.
5. Un director termina. El PO revisa que el módulo quedó documentado; si falta, se lo devuelve. Después, da paso a integrar.
6. Integrado: los papeles los pone la sesión de cierre que lanza el director. El PO lee su parte y anota si el norte o el mapa
   quedaron viejos; los cambia al cerrar.
7. El release lo corre el PO, con el clic del dueño.
8. Cierra: queda el relevo.

**Cada documento tiene un solo dueño**:

| Documentos | Los escribe | El PO |
|---|---|---|
| De un módulo: ficha, bitácora, tiempos | El director (o su obrero de cierre de tramo) | Controla que estén y que digan lo que se hizo; no los escribe |
| El spec | El Arquitecto | No lo toca |
| Del proyecto: handoff, TODO, CHANGELOG | El `/cierre`: tras integrar, la sesión de cierre del director | Corre el suyo al cerrar su sesión; no pisa el otro |
| `NORTE.md` y `MAPA.md` | Hoy, nadie después de montar | Los cuida: propone el cambio; el norte, con el OK del dueño |

## 5. Las decisiones

**[Guido ✅]** las que ya decidió en la charla · **[Guido]** las que faltan (§9) · **[técnica]** las que decide la sesión (ADR-034).

### 5.1 Qué es: una skill del molde para la sesión principal, una por proyecto [Guido ✅]
Una skill del molde que el dueño invoca en la sesión principal (checkout principal, rama por defecto). No se despierta sola. Es una
**pieza opcional** de la ficha: el dueño la prende en los proyectos donde la quiere, **tenga o no varios directores**.
- **Por qué no choca con el descarte de D §4.** Aquel "agente PO vivo" se descartó porque (1) pierde lo que sabe al mudarse, (2) no
  existe en la otra PC, (3) responde preguntas que ya tienen dueño y (4) es otra pestaña Opus.
  - (1) y (2): lo que sabe se arma de git por script, y lo poco que no sale de git va al relevo (5.11). El relevo ya funcionó una vez.
  - (3): no reemplaza a ningún dueño. Usa `/estado`, `/inicio`, `/cierre` y los documentos; el tamaño y el diseño siguen siendo del
    Arquitecto. Lo que suma es lo que **no** tenía dueño: el norte, el mapa, el control del cierre de módulo, el turno visible.
  - (4): no es otra pestaña: es la sesión principal que ya está abierta. *Costo que sí suma*: los turnos del repaso (5.10).
- **Sin rol nuevo en `.kit-rol`**: en el checkout principal la sesión ya es `humano` (`contexto.cjs:93-105`), que es lo que pide el
  buzón. Una marca sin versionar en el git común dice "acá hay PO", **con la hora de su último repaso**: si es de hace poco, la sesión
  que quiere arrancar pregunta "ya hay uno, ¿lo relevo?"; si venció, la toma. (Cerrar la pestaña no corre ningún cierre: por eso
  vence sola. Dos a la vez gastarían el mismo tope del buzón y avisarían doble.) [técnica]
- *Descartado*: el agente que se despierta solo y despacha (0 encargos en 169 mensajes del buzón, ADR-037) · solo para proyectos con
  varios directores (era la primera versión de este diseño; Guido: "voy a terminar levantando uno en cada proyecto") · estirar
  `/arquitecto` (mezcla "pensar antes" con "llevar el proyecto", y cada sesión lo reinventa).
- `[acordarse de menos · consistencia]`

### 5.2 El turno de la PC queda fuera de toda sesión [Guido ✅]
Un PO por proyecto. El turno de lo pesado, que es de **la PC** y cruza repos, no lo lleva ninguno: es el candado (5.3).
- *Descartado*: un solo PO por PC para todos los proyectos (los nombres repetidos entre repos ya causaron errores) · como hoy, que
  uno de los dos lleve el turno (depende de una sesión viva; "la regla llegó tarde").
- `[workflow · acordarse de menos]`

### 5.3 El turno de lo pesado: hacer visible el que ya existe [técnica]
No se construye un turno nuevo: se completa `conTurno`, y **cuánto** se completa lo decide la compuerta de §7.
1. **Se ve**: un comando dice quién lo tiene, desde cuándo, en qué worktree y con qué comando, y quién está esperando (el que espera
   deja su renglón con su proceso y su hora; un renglón de un proceso muerto o vencido se limpia solo).
2. **Deja rastro**: un renglón por corrida (quién, cuánto esperó, cuánto tardó, memoria libre al entrar).
3. **Cubre lo que no es del kit**: un envoltorio, "corré esto con turno", para lo pesado **que empieza y termina** (compilar, rearmar
   la base local, un smoke). Qué cuenta como pesado en cada proyecto lo dice la ficha (un campo nuevo). Lo usan el director, el
   obrero, `/tramo` y su verificador, y entra en la lista de AUTORIZADO que arma el encargo (si no, a un obrero de fondo se le niega).
4. **Sigue sin frenar**: "el turno ordena, no frena" (`proceso.cjs:199`); a los 60 min sigue igual.
- **Sin orden de llegada en esta versión.** Hoy pasa el primero que pregunta cuando se libera. Ninguna cicatriz muestra a alguien
  esperando de más; y una fila de verdad es frágil con este candado (un anotado que muere, los pids que Windows reusa, un repo en la
  versión vieja que no ve la fila y se cuela). Se reabre si el rastro muestra esperas largas de uno mientras pasan otros.
- **`proceso.cjs` tiene tres copias** (el molde, el Arquitecto y lo de la PC): cambian las tres juntas.
- **Lo que no cubre**: un servicio que queda prendido (la base local levantada) sigue ocupando memoria después de soltar el turno; y
  lo que alguien corre sin el envoltorio no se ve. Un freno que obligue a usarlo queda afuera (§8).
- `[workflow · acordarse de menos]` · cicatriz: 0,8 GB libres con cuatro pesados; dos rearmados pisados.

### 5.4 El panorama: una vista de toda la obra, armada por script [técnica]
Un modo nuevo de `estado.cjs` (que ya mira todos los módulos y no escribe): por cada módulo, su rama, la punta y su edad, cuánto le
falta o le sobra contra la rama por defecto, si ya integró, sus "te espera" y sus paradas; más el turno, la mesa y el buzón.
- **De la fuente**: git y los archivos, no lo que cuentan las sesiones.
- **Qué corre** sale del turno, no de espiar procesos del sistema (§8).
- **Rápido**: un solo `fetch`; lo que va a la red o a la carpeta del buzón lleva plazo corto y, si vence, lo dice y sigue.
- **Para el cierre de módulo** (5.6): por módulo, cuántos commits de código hay desde la última vez que se tocó su ficha.
- **Un modo "solo lo que cambió"** desde la pasada anterior, que no imprime nada si no cambió nada: es lo que hace barato el repaso.
  La foto anterior se guarda en el git común, aparte de la del `/estado` del dueño.
- **No deja archivos en el repo**, y el repaso llama al script directo, **no a la skill `/estado`**: con rol `humano` esa skill corre
  `noche volvi` y `worktree limpiar`, y desde las 18 h `resumen.cjs` escribe en `docs/modulos/` sobre la rama por defecto (la cicatriz
  de los archivos que chocaron). Cuando el dueño pide el estado, sí es `/estado`, como siempre.

### 5.5 Cómo se hablan el PO y los directores [técnica; el dato lo dio Guido]
**La verdad está en git; el mensaje es solo el timbre.**
- El director **no reporta nada nuevo**: ya escribe la ficha del módulo, la bitácora y su rama. El PO lo lee con el panorama.
- El PO le avisa a un director con el **mensaje entre sesiones**, que anda en VS Code (§3.3), con tres reglas que salen de las
  cicatrices: (1) el nombre de cada sesión dice rol, proyecto y módulo, y se manda a la referencia exacta, no al nombre suelto;
  (2) un aviso cita el archivo o el SHA y **nunca lleva pegado texto que vino de afuera del proyecto**; (3) antes de afirmar que algo
  terminó, se mira git.
- **Lo que llega por el buzón o la mesa de otro proyecto no se reenvía.** Un mensaje entre sesiones le llega al director como si lo
  hubiera escrito el dueño; un pedido ajeno reenviado se vuelve una orden. Al director le llega solo el timbre: "hay algo para tu
  módulo en el buzón, `C<n>`: leelo con `/buzon`", una frase fija que arma un script con la etiqueta que pone el buzón (los nombres
  de la conversación y del mensaje los elige quien manda: tampoco viajan). Pegar contenido ajeno sigue pidiendo el OK del dueño
  (ADR-037, punto 3).
- **Si el mensaje no llega** (otra herramienta, otra PC sin Remote Control): el PO se lo dice al dueño en una línea para que lo
  pase. No se construyen avisos por archivos: se reabre si eso pasa seguido.

### 5.6 La documentación y el norte [Guido ✅ el qué; técnica el cómo]
**a. El cierre de un módulo.** Antes de que un director integre, el PO revisa que el módulo quedó documentado: lee la ficha y la
bitácora **en origin** contra lo que la rama cambió, y contesta tres preguntas: ¿dice qué se hizo? ¿dice cómo se usa o qué mirar?
¿quedó algún pendiente que la ficha no nombra? Si falta, se lo devuelve al director con la lista; **no lo escribe él**.
- Es una revisión de la sesión (juicio), apoyada en un dato de script (5.4). **No es un freno nuevo**: `integrar` sigue pasando sin
  el PO, porque un proyecto puede no tener PO y porque de noche no hay nadie. Un control por script en el gate de `integrar` queda
  afuera (§8) hasta ver si los módulos siguen pasando sin documentar.
- El director le avisa **antes de dejar la ficha en COMPLETO** (después de `integrar` ya no commitea), espera hasta 10 minutos y,
  si no hay PO o no contesta, sigue. El renglón va en `NUCLEO.md`.

**b. Los papeles del proyecto.** Después de una integración los sigue poniendo la sesión de cierre que lanza el director. El PO
**no corre `/cierre` ahí ni deja cambios sin guardar** en la carpeta principal (esa sesión se negaría): lee el parte.

**c. El norte y el mapa.** Pasan a tener dueño. El PO anota en su relevo si lo integrado cambia lo que dicen `NORTE.md` o `MAPA.md`,
y lo escribe **al cerrar su sesión**, en su único commit. El mapa lo actualiza y avisa en una línea; **el norte lo propone y espera el
OK del dueño** ("manda ante la duda"). Y al revés: si un pedido o un módulo va contra el norte, se lo dice al dueño antes de seguir.

**d. "Que los directores sepan la documentación".** Ya lo hace el hook de arranque, que le inyecta los documentos a cada sesión. No
se construye nada: lo que suma el PO es que esos documentos estén al día.
- `[consistencia · acordarse de menos]` · cicatriz: el dueño pidiendo "que documente todo" antes de cada integración.

### 5.7 El buzón: lo atiende el PO [técnica]
- No cambia el protocolo ni lo que se puede contestar solo: ya es una sesión de persona en la copia del repo.
- **La ficha y el buzón se unen en el panorama**: para un alias con `transporte: buzon`, lo abierto se lee del buzón; para uno con
  `git`, de la mesa (auditoría de la 3.1, punto 8).
- **Lo que informa el piloto del buzón**: el tope de 3 respuestas automáticas por conversación y por día. Una sesión que contestó ~20
  mensajes en sus repasos lo va a tocar. **No se cambia ahora**: se mira con los datos de `buzon.cjs medir`.

### 5.8 Qué decide solo, qué le lleva al dueño y qué no hace [Guido ✅ lo chico; el resto viene de la práctica]
| Decide solo y avisa en una línea | Le lleva al dueño, en lote | Nunca |
|---|---|---|
| El orden de las integraciones | Las 5 de `sensible:` (producción, plata, claves, mandar afuera, publicar) | Diseñar o tocar un spec (es del Arquitecto) |
| Pasar un aviso propio (con cita), marcar leído | Cambiar el alcance (salir sin un módulo, de quién es algo) | Firmar por el dueño |
| Armar el prompt para abrir o mudar un director | Una excepción al método o a una regla de la casa | Darle un encargo a un obrero (es del director) |
| Devolverle a un director un módulo sin documentar | Un acuerdo con otro equipo · pegarle a un director texto que vino de afuera | Escribir los documentos de un módulo ajeno |
| Actualizar el mapa · correr el `/cierre` del proyecto | Cambiar el norte | Parar o borrar algo de otro sin preguntarle a su director |
| Recomendar qué entra a un release | Integrar salteando un control · mudar un director · terminar el modo noche | Commitear en la rama por defecto de a poco con directores en obra (5.11) |

**Lo chico** (decisión de Guido: la opción B). El PO mide el pedido como manda el `CLAUDE.md` del molde. Si es chico:
- **sin directores en obra**: lo hace él, como hoy cualquier sesión principal;
- **con directores en obra**: no toca código. Va al director del módulo, o a un chat aparte con el prompt que arma el PO.
- "En obra" lo dice un script mirando git (una rama de módulo sin integrar, una carpeta de módulo abierta, una integración en
  curso, o un módulo `EN OBRA`), no la memoria de la sesión ni la ficha sola: la ficha ya dice COMPLETO mientras `integrar` corre.
- *Por qué*: cada commit suyo en la rama por defecto les mueve el piso a los directores (cicatriz). *Costo aceptado*: con directores
  en obra y la PC cargada, un arreglo de dos renglones pide otra sesión.
- *Descartado*: que nunca trabaje (en un proyecto chico serían dos pestañas para cambiar un renglón) · PO solo donde hay directores.

Una decisión del dueño que afecta a un módulo la escribe **el director de ese módulo** en su ficha, con el aviso del PO.

### 5.9 El release [Guido ✅]
El PO es quien corre el release, con el clic del dueño. El kit ya trae el ritual (`kit/molde/rituales/release.md`, pieza opcional
que se monta como `/release`: gate, smoke, un OK agrupado y el rastro en el CHANGELOG): **lo invoca, no lo redefine**. "Publicar un
release" ya es una de las 5 de `sensible:`. *No hay cicatriz*: en los dos días relevados nadie corrió uno; entra porque Guido lo
pidió con esas palabras, y cuesta un renglón.

### 5.10 El repaso periódico [Guido]
El PO repasa solo cada tanto (20 min por defecto). Cada pasada llama al panorama en modo "solo lo que cambió": si no cambió nada, no
hay nada que leer. El agendado usa lo que tenga la herramienta donde corre, y **el arranque de la skill lo vuelve a armar** (cicatriz:
al reabrir estaba apagado). **Sin módulos abiertos no hay repaso**: no hay nada que mirar.
- **Un repaso solo mira y junta.** Sin el dueño delante puede dos cosas y nada más: contestar el buzón lo que el buzón ya deja
  contestar solo (ADR-037, con su tope) y mandarle a un director un timbre de frase fija. No escribe en git, no decide, no cambia el
  mapa. (La sesión principal tiene la autonomía del `CLAUDE.md`, "resolvés solo todo": sin esta regla, un repaso de madrugada podría
  actuar por un texto que llegó de afuera.)
- *Costo*: cada pasada es un turno del modelo aunque no haya novedades. El diseño del buzón descartó `/loop` por eso mismo; acá el
  dueño eligió tener la sesión abierta. Se mide en el piloto y, si pesa, se baja la frecuencia o pasa a "repasa cuando le hablan".

### 5.11 Abrir, relevar y cerrar [técnica]
- **Abrir**: es el `/inicio` del proyecto más el panorama, el relevo, el buzón y el repaso. La skill no repite el `/inicio`: lo llama.
- **Relevo**: un archivo **sin versionar, en el git común**, que la sesión siguiente lee **como propuesta, no como verdad** (se lo
  muestra al dueño), con lo que no sale de git: el orden acordado de integraciones, lo que
  espera al dueño, las decisiones tomadas hoy y a quién se avisó, las sesiones vivas con su referencia. No va a `docs/`: versionado,
  cada cambio sería un commit en la rama por defecto.
- **Cerrar**: actualiza el relevo y corre el `/cierre` del proyecto. Con directores en obra, es **un solo commit** en la rama por
  defecto y el timbre a cada director ("se movió a `<sha>`: papeles"). (Una sesión no puede "tener el turno" entre dos comandos: el
  candado es de un proceso. Lo que evita moverles el piso a los directores es juntar, no sincronizar.) La marca vence sola.
- **Costo aceptado**: el relevo es de esa PC. En otra PC el PO arma el panorama de git y pierde lo anotado a mano; el cierre lo
  imprime para llevarlo.

### 5.12 El nombre [Guido]
**Recomendado: "PO"** (`/po`), que es como Guido lo llama desde el primer día. La persona es "el dueño", como ya dice todo el molde.
En `kit/molde/` nadie le dice "PO" a la persona (grep sin resultados): solo el texto de DISENO-G, que es un acta y no se toca; se
aclara acá. *Alternativas*: "organizador" (así se presenta una de las dos sesiones) · "jefe de obra".

### 5.13 Lo que se toca de lo que ya hay [técnica]
- `/arquitecto`: una línea en su "NO usar": llevar el proyecto en marcha es del PO.
- `NUCLEO.md` (lo leen director, obrero y tramo; tiene lugar): avisarle al PO antes de integrar, y lo pesado que no es del kit,
  con turno. **No se tocan `director/SKILL.md` (7.986 de 8.000 bytes) ni `inicio/SKILL.md` (8.584 de 8.600)**: no les entra un renglón.
- El arranque (`session-start.cjs`): si la pieza está prendida, una línea ("este proyecto lleva PO").
- El envoltorio del turno corre **solo nombres declarados en la ficha**, nunca un comando suelto: si no, sería una puerta para que
  un obrero de fondo corra cualquier cosa.
- `estado.cjs`, las tres copias de `proceso.cjs`, la ficha (la pieza y un campo), el AUTORIZADO del encargo y el catálogo del
  actualizador (la skill nueva es una pieza nueva).

## 6. Cómo se sabe si anduvo: el piloto

En el proyecto donde nació (Desktop y Mobile), dos semanas, con una `rc`. Línea base: §3.1 y §3.2.

| Medida | Hoy | Objetivo |
|---|---|---|
| Memoria libre al entrar cada corrida pesada (del rastro del turno) | llegó a 0,8 GB | nunca por debajo de un piso que fija el spec |
| Repasos con novedades contra repasos vacíos (de la foto del panorama) | sin dato | medido, y aceptado por el dueño |
| Corridas pesadas que el dueño vio correr por afuera del turno | sin dato | *lo cuenta Guido*: ninguna |
| Mensajes a la sesión equivocada | 2 en dos días | *lo cuenta Guido*: 0 |
| Veces que el dueño tuvo que pedir "que documente" antes de integrar | cada integración | *lo cuenta Guido*: 0 |
| Tiempo en ponerse al día al reabrir | se perdían el cron y lo sabido | *lo cuenta Guido*: minutos, sin su ayuda |

Solo las dos primeras las cuenta un script.

**Corte**: si a las dos semanas el dueño sigue abriendo un Arquitecto para esto, la skill se descarta con su razón y quedan el turno
y el panorama, que sirven solos.

## 7. El orden: primero lo que sirve aunque el resto no exista

0. **La compuerta: poner al día los dos repos del piloto** (ya está en el TODO como "la flota real"): les da el turno de la `rc.7` y
   `buzon.cjs`. No es de la 3.2. A la semana se les hacen **las mismas preguntas de §3.1** a las sesiones que cumplan el rol:
   - si los pedidos de turno por mensaje bajaron a casi nada, de 5.3 queda solo "se ve" y "deja rastro" (el envoltorio y el campo de
     la ficha esperan su cicatriz);
   - si siguen, 5.3 entra entera.
1. **El turno (lo que deje la compuerta) y el panorama** (5.3 y 5.4): sirven desde el primer día, incluso con el Arquitecto que hoy
   hace de nexo.
2. **La skill**, finita, arriba de eso.
3. Como manda el ciclo (§6): `rc.1` → **banco, vuelta 1** (toca el molde: paso fijo, ADR-041) → piloto de dos semanas → una `rc` de
   arreglos → banco como veredicto → versión.

El spec se puede escribir antes de la compuerta, con 5.3 partida en "seguro" y "si la compuerta lo pide".

## 8. Lo que no entra, y con quién se cruza

- **El agente que se despierta solo, firma o despacha encargos**: sigue descartado (ADR-037); se reabre si `buzon.cjs medir` muestra
  encargos esperando el OK.
- **Un control por script de la documentación en el gate de `integrar`**: se reabre si, con el PO revisando, siguen pasando módulos
  sin documentar (por ejemplo de noche, que no hay PO).
- **Espiar los procesos del sistema** para saber qué corre: se reabre si, con el turno andando, sigue habiendo pesados invisibles.
- **Un freno que obligue a usar el turno** · **el orden de llegada en el turno**: se reabren con el rastro del piloto.
- **Avisos por archivos entre sesiones**: se reabre si los mensajes entre sesiones fallan seguido.
- **Consultar las bases en solo lectura** (estaba en el pedido original): el kit ya tiene el contrato (`db consulta` con un usuario de
  solo lectura, DISENO-F); el PO lo usa como cualquier sesión. No se construye nada.
- **`reflexion` ofrecida sola** (auditoría de la 3.1, punto 10): no entra; ninguna fricción lo pidió todavía.
- **Arreglos sueltos que mostró el relevamiento**, que van a la lista de arreglos y no a este diseño: `mesa.cjs abiertos` lento · los
  plazos de los hooks y del push de integrar con la PC cargada · el candado `topes` con cuatro módulos.
- **"Probar una idea nueva"** (la otra pieza de la 3.2): se diseña después. Este caso es su mejor ejemplo: un rol nuevo que se probó
  dos días en un proyecto real sin anotar qué se probaba ni cómo se medía; y el piloto de §6 sería su primer experimento.

## 9. Lo que falta decidir (Guido)

1. **El nombre** (5.12). *Recomendado: "PO".*
2. **El repaso solo cada 20 min mientras haya directores en obra** (5.10), sabiendo que gasta aunque no pase nada. *Recomendado: sí,
   y se mide.*
3. Un dato: ¿tenés directores del **mismo** proyecto en dos PCs a la vez? (Si es así, el PO los ve por lo que suben a origin y les
   avisa por Remote Control.)

## 10. Lo NO VERIFICADO y los supuestos

- Que con el turno puesto la PC deje de saturarse: lo que corre por afuera del kit puede seguir encimándose.
- Por qué se cortan los hooks con la PC cargada (se supone falta de memoria; no se midió).
- Si `integrar` deja pasar un módulo con la ficha pobre: por el código, sí (solo mira que ficha y spec coincidan); no se probó.
- Que un director reciba bien el mensaje de una sesión de otra PC por Remote Control en todos los casos (anduvo en los dos días).
- Las cuentas de §3.1 son lo que cada sesión contó de su propio historial, a grandes rasgos, en dos días de cierre de release. La de
  documentación es de un solo cierre; "muchas veces se olvidaban" es el recuerdo del dueño, sin casos contados.
- `docs/legacy/una-sola-identidad/` del proyecto del piloto (lo pedía el TODO) no se leyó: ese repo no está en esta PC.

## 11. La revisión

**Primera versión ("el organizador": solo para varios directores, sin documentación ni norte).** Revisor frío (Opus, una vuelta,
ADR-029), 2026-11-20: **con observaciones**, 10 hallazgos contra el código real, los 10 aplicados.
- **Bloqueaban** (2): el relevo versionado en la rama por defecto repetía la cicatriz que el diseño quería curar → relevo en el git
  común (5.11) · "reenviar" entre lo que decide solo contradecía el ADR-037 → lo ajeno no se reenvía, solo el timbre (5.5, 5.8).
- **Ajustes** (7): el canal por mensajes dependía de la app → se midió: anda en VS Code (§3.3) · la fila con orden era frágil y sin
  cicatriz → afuera (5.3) · `director/SKILL.md` está a 14 bytes del tope, y faltaban `/tramo`, el `verificador` y el AUTORIZADO
  (5.3, 5.13) · era falso que el kit no trae release (5.9) · cuatro medidas del piloto no las cuenta un script (§6) · el paso 0 no
  condicionaba nada → es compuerta; el banco va donde manda el ciclo (§7) · la marca y la foto de "lo que cambió" no tenían dónde
  vivir ni vencimiento (5.1, 5.4).
- **Menor** (1): el repaso no pasa por la skill `/estado`, que con rol `humano` limpia carpetas y escribe resúmenes (5.4).

**Segunda versión (esta).** Cambió después de la revisión, por la charla con Guido: el PO es la sesión principal de todo proyecto que
lo prenda (5.1); hace lo chico si no hay directores en obra (5.8); cuida la documentación, el norte y el mapa (5.6). La atacó el red
team del spec (`redteam-spec`, Opus, una ronda): **12 hallazgos, 3 que bloqueaban el sello**, los 12 aplicados acá y en el spec.
- El `/cierre` del PO chocaba con la sesión de cierre que el director lanza tras cada integración → no lo corre ahí (5.6).
- El repaso podía actuar sin el dueño con texto ajeno → solo mira y junta (5.10); el timbre es fijo (5.5).
- "¿Puedo tocar código?" daba sí mientras otro módulo integraba → mira git (5.8).
- El detalle de los otros nueve, en [SPEC-PO](SPEC-PO.md), § Red team.
