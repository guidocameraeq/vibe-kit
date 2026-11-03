# Las decisiones que tomaron los directores sin vos, en criollo

> Fuente: `docs/kit-v3/PLAN-construccion.md` (las secciones "Decisiones sin Guido" de D2.2 a D7.1, "Cambios al plan" y "Pendientes"),
> cruzado con el SPEC-0, los deltas y `docs/DECISIONS.md`. Leído el 2026-11-03. No se tocó nada del repo.

## En una mirada

- **Hubo unas 150 decisiones** anotadas (cuento cada renglón del tracker; algunos traen varias juntas, por ejemplo "D4-9 a D4-18").
- **54 te afectan**: cambian algo que ves, hacés o aprobás, o un riesgo que corrés. **Las otras 95 son de taller**: no cambian tu día.
- **Corregiste o aprobaste 12**: las 10 de D3.2 ("me parecen ok", 2026-10-29), la del permiso en modo `auto` (2026-10-29) y la del banner
  (2026-11-02). **Corregiste a medias 2** más (la fusión de las skills adaptadas y en qué PC corría el corrector de afirmaciones). El resto: no
  encontré que las hayas repasado.
- **Casi todo se deshace fácil hasta el tag v3.0**: nada del kit nuevo llegó todavía a tus proyectos reales. La excepción es el
  Arquitecto v3, que **ya está andando en tus PCs** (D4-1).
- **Las 5 para mirar primero**:
  1. **D5-2 / D6-1 · Nadie trabaja en "piloto automático total"** (ni el obrero de noche ni el actualizador). Cambia cómo se diseñó la noche.
  2. **D4-1 · El Arquitecto nuevo ya lo estás usando**, también en tus proyectos viejos.
  3. **D6.2-7 · La pregunta abierta: qué cuenta como "porqué"** cuando un proyecto modificó una pieza del kit. Define si las
     actualizaciones te preguntan o pasan solas.
  4. **D2.2 (r4-1 b) · Una sesión en piloto automático podría falsificar tu firma** en tu carpeta principal. Quedó como pregunta.
  5. **D7-7 · El kit puede borrar solo una parte de un archivo que era tuya**, con cinco condiciones. Es de las que no se ven pasar.

---

## Palabras que aparecen (una vez, con imagen)

- **Hook**: un portero automático que mira cada cosa que Claude va a hacer y puede frenarla antes de que pase.
- **Freno**: una regla de ese portero ("no leas el archivo de claves"). **Barrera**: un freno con candado extra: para aflojarlo hace falta tu firma.
- **Aprobado** (tu firma): el clic tuyo en una ventana que deja un registro; sin eso, un cambio a una barrera no entra.
- **Candado**: un control que corre solo antes de cada commit (cada vez que se guarda algo en la historia del proyecto) y dice "rojo" si algo no cuadra.
- **Ficha** (`.claude/kit.md`): la libreta de cada proyecto: qué versión del kit tiene, qué frenos lleva, qué cosas son delicadas ahí.
- **Molde**: la plantilla del kit que se copia a cada proyecto. **Pieza**: una parte del molde (el `/inicio`, un hook, el `settings`…).
- **Adaptada**: una pieza que el proyecto modificó a su gusto. **Zona propia**: la parte de un archivo del kit marcada como "esto es del proyecto,
  no lo pises al actualizar".
- **Flota**: todos tus proyectos. **Actualizador**: el que los pone al día con la versión nueva del kit.
- **Modos de permiso de Claude**:
  - **bypass**: piloto automático total, no pregunta nada nunca.
  - **auto**: el tuyo de todos los días. Claude hace solo lo rutinario y un inspector (el **clasificador**) frena lo que le parece peligroso.
  - **acceptEdits**: puede editar archivos sin preguntar; para el resto solo puede lo que está en una lista corta que se le da al arrancar.
- **Worktree**: un banco de trabajo aparte, una copia del mismo proyecto en otra carpeta, para que el obrero no toque tu mesa.
- **main / push / origin**: la rama principal del proyecto / subir a GitHub / la copia que está en GitHub.
- **Clase 2 / 3-barrera**: los cambios al método de un proyecto se anotan en `.claude/cambios/`. Los de clase 2 los aplica Claude solo y deja
  constancia. Los 3-barrera tocan un freno y esperan tu firma.
- **Las 5 de A**: las cinco cosas que siempre te preguntan: borrar datos reales, plata, claves, mandar algo afuera, publicar una versión.

---

## Las que te afectan

### 1. Piloto automático y permisos: cuándo te pregunta Claude

- **`D2.2` · Aprobar un cambio a un freno, en modo `auto`, te pregunta (no te lo niega).**
  - *Qué decidió*: D2.2 había hecho que en modo `auto` la firma se negara siempre. Vos lo cambiaste.
  - *Qué cambia para vos*: en `auto` (tu modo de siempre) aparece la ventana y firmás. En piloto automático total sigue negado, porque si no un obrero nocturno se firmaría solo.
  - *Alternativa*: negar también en `auto`, que era fricción para vos.
  - ✅ **corregida el 2026-10-29**. *Deshacer*: fácil.

- **`D5-2` · Ningún obrero corre en piloto automático total (bypass).**
  - *Qué decidió*: el director lanza al obrero en `acceptEdits`, con una lista corta de lo que puede hacer (leer, git, sus pruebas) más lo que el encargo dice en `## AUTORIZADO`.
  - *Qué cambia para vos*: lo que no está en la lista lo decide el inspector o te lo pregunta. Si un encargo de verdad necesita bypass, **lo tipeás vos** en tu terminal.
  - *Alternativa*: lo que decía el diseño ("de noche, bypass con el portero abajo"). Pero el inspector del modo `auto` ya frena lanzar sesiones en bypass (lo descubrió D4.2-2).
  - ⚠️ sin repasar: el tracker te pide repasarla. *Deshacer*: antes del tag. Pero el bypass lo frena Anthropic, no el kit, así que volver atrás no depende solo de vos.

- **`D5-19` · Tu pestaña de obrero abre en tu modo (casi siempre `auto`).**
  - *Qué cambia para vos*: lo autorizado no te pregunta, lo demás lo decide el inspector, y las 5 de A te las siguen preguntando.
  - *Alternativa*: forzarla a modo "pregunta todo", con pop-ups para cada cosa.
  - ⚠️ sin repasar (falta probarlo en una pestaña real de VS Code: Pendientes del paquete 5). *Deshacer*: fácil.

- **`D2.2` · En los proyectos, el `/inicio` dice el tamaño del pedido y sigue sin esperar tu OK.**
  - *Qué cambia para vos*: si abrís con el pedido en el mensaje, la sesión dice "chico, lo hago acá" (o llama al Arquitecto) y arranca. Una pausa menos. En vibe-kit, el `/inicio` sigue esperando tu OK.
  - *Alternativa*: esperar siempre el OK.
  - ⚠️ sin repasar. *Deshacer*: fácil.

- **`D3.1` (D-1) · Las 5 de A las pregunta un portero que lee la ficha, no reglas escritas en el `settings`.**
  - *Qué cambia para vos*: las preguntas de "esto borra datos reales / publica / cuesta plata" aparecen igual, y también frenan en piloto automático, donde una pregunta común no aparece.
  - *Alternativa*: reglas fijas en el `settings`, que el obrero podía editar y que en bypass no preguntan.
  - ⚠️ sin repasar. *Deshacer*: antes del tag.

- **`D5.1` (D5-14) · Si la ficha de un proyecto endureció "mezclar a main", juntar el trabajo del obrero pide `--ok-de-guido`.**
  - *Qué cambia para vos*: en esos proyectos, el último paso necesita tu OK explícito.
  - ⚠️ sin repasar. *Deshacer*: fácil.

### 2. De noche y cuando no estás

- **`D5.1` (D5-12) · Un commit en `main` de noche traba; de día solo avisa.**
  - *Qué cambia para vos*: de noche nadie guarda directo en la rama principal. De día te avisa y no te frena.
  - ⚠️ sin repasar. *Deshacer*: fácil.

- **`D5.2` (K1) · Cuando el director dice "me voy", la noche alcanza también a sus obreros.**
  - *Qué decidió*: el cartel "me fui a dormir" (`.kit-noche`) del director vale para sus obreros. Con eso, las cosas delicadas de noche **paran** en vez de preguntar.
  - *Qué cambia para vos*: un obrero no puede hacer de noche algo delicado aunque su carpeta no tenga el cartel. Si git falla, no inventa que es de noche.
  - *Alternativa*: un cartel por obrero, que había que acordarse de poner.
  - ⚠️ sin repasar (el tracker te lo marca). *Deshacer*: antes del tag.

- **`D5.2` (K1 + arreglo del revisor) · La noche termina sola cuando abrís `/inicio` o `/estado`.**
  - *Qué decidió*: al volver, se borra el cartel de todas las carpetas del proyecto. Antes había un error y **la noche no terminaba nunca**.
  - *Qué cambia para vos*: no tenés que acordarte de "ya volví". Cómo despierta el "despertador" al director: NO VERIFICADO, lo mira el piloto.
  - ⚠️ sin repasar. *Deshacer*: fácil.

- **`D5.1` (D5-3) · Juntar el trabajo del obrero (`integrar`) no corre el `/cierre`.**
  - *Qué decidió*: chequea, mezcla, sube a GitHub y listo. El handoff, el TODO y el CHANGELOG los pone al día el próximo `/cierre` en la carpeta principal.
  - *Qué cambia para vos*: después de integrar, los documentos quedan un paso atrás hasta tu próximo cierre.
  - *Alternativa*: lo que decía el diseño, el `/cierre` adentro de `integrar`.
  - ⚠️ sin repasar (el tracker te lo marca). *Deshacer*: antes del tag.

- **`D5.2` (K2) · Cómo cuenta `/estado`.**
  - *Qué decidió*: el avance es tareas tildadas sobre tareas de la ficha (sin tareas muestra "—"). "Podés cerrar" son las sesiones vivas cuyo trabajo ya está mezclado.
  - *Qué cambia para vos*: es lo que vas a leer cada mañana. El "ya te mostré el resumen" no ensucia el proyecto.
  - ⚠️ sin repasar. *Deshacer*: fácil.

- **`D5.2` (K3) · La mesa: `mesa nuevo` sube el mensaje a GitHub solo, antes de avisar.**
  - *Qué decidió*: la mesa es la conversación entre directores de proyectos distintos. El "otro proyecto" es un remoto de git con su apodo, y el candado de la mesa frena mensajes de más de 2 KB o reescritos.
  - *Qué cambia para vos*: un mensaje entre directores **se publica en el repo sin preguntarte**. Un obrero no puede mandar a la mesa.
  - *Alternativa*: escribir sin subir. Pero el criterio pide "primero el archivo, después el aviso".
  - ⚠️ sin repasar (el tracker te lo marca). *Deshacer*: antes del tag.

- **`D5.3` (D5.3-1 y -2) · El corrector de "esto promete de más" avisa, no frena.**
  - *Qué decidió*: cuando el obrero o el revisor escriben "está probado" sin evidencia, aparece un aviso que pregunta "¿promete de más?". No traba ningún commit.
  - *Por qué*: medido contra la historia de Hermes, se equivocaba demasiado para frenar. Caza 5 de 9 exageraciones y marca 2,5% de líneas buenas.
  - *Qué cambia para vos*: vas a ver avisos en lo que revisa el revisor, nunca un freno.
  - *Alternativa*: que frene. Queda la opción apagada para cuando no se equivoque.
  - ⚠️ sin repasar. *Deshacer*: fácil.

### 3. Seguridad: claves, datos reales, `.env`

- **`D2.2` (r4-1 b) · Una sesión en piloto automático, en tu carpeta principal, podría fabricar tu firma.**
  - *Qué pasa*: podría escribir el archivo del aprobado a mano y quedaría igual a uno tuyo.
  - *Qué decidió*: aceptarlo por ahora. Lo delata el `/inicio` ("aprobados nuevos desde tu última sesión") y lo cierran más las piezas del paquete 3 (el portero que niega firmar en bypass y el candado).
  - *Qué cambia para vos*: si un día ves un aprobado que no firmaste, eso es.
  - *Alternativa*: frenar todo hasta tener una firma que nada de Claude pueda imitar.
  - ⚠️ **quedó como pregunta para vos** (abajo, Preguntas abiertas). *Deshacer*: antes del tag.

- **`D3.1` (D-5) · El freno a una clave pegada en el chat, si se rompe, deja pasar.**
  - *Por qué*: si fallara cerrado, un error suyo te dejaría **sin chat**, ni siquiera para pedir el `doctor`. Es la única excepción a la regla "un portero roto frena".
  - *Qué cambia para vos*: si ese portero falla, una clave pegada podría pasar sin aviso.
  - ⚠️ sin repasar. *Deshacer*: antes del tag.

- **`D3.1` (D-14) · Una variable con una clave se frena solo cuando su valor saldría a la pantalla.**
  - *Qué cambia para vos*: `echo $CLAVE` frena. Usarla adentro de otro programa (por ejemplo para llamar a una API) pasa: es "usar sin ver". Menos frenazos en el trabajo normal.
  - *Alternativa* (del red team): negar cualquier mención salvo una lista.
  - ⚠️ sin repasar. *Deshacer*: antes del tag.

- **`D3.1` (D-6) · Claude no puede leer `.env*`, `*.pem`, `*.key` ni `secrets/`, de fábrica en todo proyecto.**
  - *Qué cambia para vos*: si le pedís "mirá el .env", no puede. Ninguna pieza lo construía y un criterio lo daba por hecho.
  - ⚠️ sin repasar. *Deshacer*: antes del tag.

- **`D3.2` (G5) · `.env.example` también queda frenado.**
  - *Por qué*: existe el `.env.example` con un valor real adentro.
  - *Qué cambia para vos*: Claude tampoco lee el de ejemplo. Son 14 de los 38 frenos medidos.
  - ✅ **aprobada el 2026-10-29** (junto con todo D3.2). *Deshacer*: fácil.

- **`D3.1` (D-4) · Para que una migración de base borre datos reales hace falta una bandera explícita (`--borra-datos-reales`) más tu clic en la ventana.**
  - *Qué cambia para vos*: un clic en el momento, no un archivo de aprobación aparte (que es lo que decía el SPEC-0).
  - *Alternativa*: un archivo firmado, con una palabra nueva en el formato.
  - ⚠️ sin repasar. *Deshacer*: antes del tag.

- **`D3.1` (D-15) · `reset`/`rebase` en `main` se frenan solo si tiran algo que ya está en GitHub.**
  - *Qué es eso*: comandos para deshacer o reordenar commits.
  - *Qué cambia para vos*: tu `reset --soft HEAD~1` (deshacer el último commit sin perder nada) sigue andando. Sin remoto, pregunta.
  - *Alternativa*: negar todo eso en `main`.
  - ⚠️ sin repasar. *Deshacer*: antes del tag.

- **`D3.1` (D-3) · Sacar un nombre de la lista de claves de la ficha cuenta como aflojar una barrera.**
  - *Qué cambia para vos*: necesita tu firma. Antes se apagaba un freno sin que te enteraras.
  - ⚠️ sin repasar. *Deshacer*: antes del tag.

- **`D3.3` (G5b) · El corrector de claves nuevo suma tres que el viejo de tu PC `Usuario` frenaba.**
  - *Cuáles*: claves `sk-` viejas, cadenas de conexión con contraseña, tokens de Telegram.
  - *Qué cambia para vos*: cuando saques el corrector viejo (`--sacar-viejo`), no perdés protección.
  - ⚠️ sin repasar. *Deshacer*: antes del tag.

- **`D3.3` (G5b) · Una conexión con contraseña a tu propia máquina no frena.**
  - *Ejemplos*: `postgres:postgres@localhost`, `${VAR}`, Supabase local.
  - *Qué cambia para vos*: menos frenazos al trabajar en local. El corrector viejo sí lo frenaba.
  - ⚠️ sin repasar. *Deshacer*: antes del tag.

- **`D4.1` (D4-5) · Las claves del almacén nunca viajan al banco de trabajo del obrero.**
  - *Qué es el almacén*: `cargar-secreto`, que guarda las claves fuera de todo repo.
  - *Qué cambia para vos*: el obrero trabaja sin tus claves. Si el filtro duda, no copia nada.
  - *Alternativa*: un campo nuevo en la ficha para decir cuáles viajan.
  - ⚠️ sin repasar. *Deshacer*: antes del tag.

- **`D2.2` (`ids:`) · Cuando aprobás quitar un freno, el cambio tiene que nombrar exactamente qué frenos toca.**
  - *Qué cambia para vos*: si el commit cambia otro, da rojo. Cierra el hueco "aprobaste quitar X y se fue también Y".
  - *Alternativa*: dejarlo como riesgo escrito.
  - ⚠️ sin repasar. *Deshacer*: antes del tag.

- **`D2.2` · `cambios aprobar` se niega también con la ficha rota o con cosas sin guardar en el archivo del cambio.**
  - *Qué cambia para vos*: si te dice que no, primero hay que arreglar o guardar.
  - ⚠️ sin repasar. *Deshacer*: fácil.

- **`D2.2` · En un proyecto adoptado, el candado arranca apagado (corre solo el control de barreras).**
  - *Qué cambia para vos*: en un proyecto viejo traído al kit, los controles de orden de los documentos no saltan hasta que se prenden. Los frenos sí.
  - *Alternativa*: "si no dice que no, está prendido".
  - ⚠️ sin repasar. *Deshacer*: antes del tag.

- **`D3.3` (G7) · El portero de escritura de documentos, si se rompe, frena todas las escrituras.**
  - *Qué cambia para vos*: un error suyo traba que Claude escriba archivos hasta que corras el `doctor`. Es el precio de "un portero roto frena".
  - ⚠️ sin repasar. *Deshacer*: antes del tag.

- **`D6.1` (r1-1) · El bloque `autoMode` del `settings` de la PC arranca con `"$defaults"`.**
  - *Qué es eso*: la configuración del inspector, para toda la PC.
  - *Por qué*: sin eso, el inspector perdía su confianza de fábrica y **frenaba los push de toda la PC**. El kit solo toca una parte.
  - *Qué cambia para vos*: nada visible si sale bien. Fijate después de "preparame esta PC" en la segunda PC.
  - ⚠️ sin repasar. *Deshacer*: fácil.

- **`D6.1` (un tropiezo, no una elección) · Quedó en la historia pública de vibe-kit un commit con dos avisos del detector de claves.**
  - *Qué era*: un valor **falso** de prueba (`VALOR-SECRETO-123`), que ya se reescribió.
  - *Qué se decidió*: desde ahí, el detector corre sin filtros y solo se sube con resultado limpio.
  - *Qué cambia para vos*: nada grave, pero el repo es público.
  - ⚠️ sin repasar. *Deshacer*: **difícil** (está en la historia de GitHub). Tampoco hace falta.

### 4. La flota y las actualizaciones

- **`D6-1` (con ADR-032) · El actualizador y el adoptador son un programa común, no un Claude en piloto automático.**
  - *Qué decidió*: solo la mezcla de una pieza que el proyecto modificó usa un Claude, acotado.
  - *Qué cambia para vos*: "poné al día la flota" corre un script. Más predecible, y el inspector no lo frena.
  - *Alternativa*: un Claude en bypass por proyecto, como decía el SPEC-0.
  - ⚠️ **a medias**: vos corregiste el 2026-11-02 la parte de "si no entra, no fusiona y avisa" (D6-19, opción C: que las piezas adaptadas se actualicen igual). El resto, sin repasar. *Deshacer*: antes del tag.

- **`D6.1` (D6-7) · Si un archivo de una pieza fue editado, el actualizador no toca la pieza entera.**
  - *Qué cambia para vos*: una pieza tocada no se pisa. Con D6.2 eso pasa por la mezcla (abajo) en vez de quedar vieja para siempre.
  - ⚠️ sin repasar. *Deshacer*: antes del tag.

- **`D6.2` (D6.2-2) · La mezcla de una pieza adaptada se intenta primero sin Claude.**
  - *Cómo*: con una herramienta de git que junta lo viejo, lo nuevo y lo tuyo. Si sale limpia y hay porqué, entra sola. Solo si choca llama a un Claude acotado (5 min, sin consola), y después el script revisa lo que hizo.
  - *Qué cambia para vos*: la mayoría de las actualizaciones de skills adaptadas no te preguntan nada.
  - ⚠️ sin repasar. *Deshacer*: antes del tag.

- **`D6.2` (D6.2-3) · Un hook adaptado nunca se mezcla solo.**
  - *Qué cambia para vos*: **siempre te espera** y pide tu firma, porque los frenos los tocás vos.
  - ⚠️ sin repasar (el tracker te lo marca). *Deshacer*: antes del tag.

- **`D6.2` (D6.2-1) · La ficha guarda el porqué de cada pieza adaptada (`por:`).**
  - *Qué cambia para vos*: tu respuesta a "¿por qué la cambiaste?" queda escrita en el proyecto. El delta decía "ningún campo nuevo", pero vos habías pedido que el porqué quede en la ficha.
  - ⚠️ sin repasar (el tracker te lo marca). *Deshacer*: antes del tag.

- **`D6.2` (D6.2-7) · Hoy cuenta como "porqué" el título de cualquier commit que modificó la pieza.**
  - *Qué cambia para vos*: casi nunca te va a preguntar, aunque a veces fusione algo que nadie decidió.
  - ❓ **es la pregunta abierta** (abajo). *Deshacer*: fácil (una línea).

- **`D6.2` (arreglo del revisor) · Si a "¿mezclo esta pieza?" respondés "No" en `/inicio`, la pieza sigue adaptada con tu porqué.**
  - *Qué cambia para vos*: te lo vuelve a ofrecer en la versión siguiente. Pasa a "propia" (nunca más se actualiza) solo si lo pedís explícito, y nunca en un freno.
  - ⚠️ sin repasar. *Deshacer*: fácil.

- **`D6.2` (D6.2-8) · La flota sube directo a la rama principal cuando todo da verde, con la firma `kit-actualizador`.**
  - *Qué cambia para vos*: no hay ramas intermedias que revisar. Si GitHub rechaza el push (rama protegida), queda "te espera".
  - ⚠️ sin repasar. *Deshacer*: antes del tag.

- **`D6.1` (RF-12) · Si "actualizate" deja archivos editados sin pisar, la versión no sube.**
  - *Qué cambia para vos*: el `doctor` sigue diciendo "atrás" hasta que lo resuelvas. No te miente que está al día.
  - ⚠️ sin repasar. *Deshacer*: fácil.

- **`D6.1` (D6-18) · En tus carpetas principales nadie prende solo los controles de git del kit.**
  - *Qué cambia para vos*: el `doctor` te avisa con un ⚠ y la línea para copiar. **Es una cosa que hacés vos.** No se metió en el `/inicio` porque eso era decisión tuya.
  - ⚠️ sin repasar. *Deshacer*: fácil.

- **`D7.1` (D7-3) · Un freno nunca se retira solo, aunque el kit ya lo cubra.**
  - *Qué cambia para vos*: va a "te espera".
  - ⚠️ sin repasar. *Deshacer*: antes del tag.

- **`D7.1` (D7-7 + E8) · El kit borra solo una regla de la zona propia cuando el kit ya la cubre, con cinco condiciones a la vez.**
  - *Las condiciones*: es clase 2, no es un freno, su pieza llegó, esa zona era solo de ese cambio, y nadie la tocó.
  - *Qué hace*: retirar es volver la zona al texto de fábrica. Ante cualquier duda la deja y dice por qué.
  - *Qué cambia para vos*: un día una regla que tu proyecto había agregado desaparece porque "subió al kit".
  - ⚠️ sin repasar (**el handoff te la marca primero**). *Deshacer*: antes del tag.

- **`D7.1` (D7-4) · La tabla de cambios de la flota mira tu copia local, sin internet.**
  - *Qué cambia para vos*: si no hiciste `pull` en un proyecto, lo ves viejo. Un trabajo sin mezclar no aparece.
  - ⚠️ sin repasar. *Deshacer*: fácil.

- **`D7.1` (D7-5) · La migración del `CAMBIOS.md` de Hermes deja todo como clase 2, sin cita, y Mobile quedó afuera.**
  - *Cómo*: solo entra como "aplicado" lo que tiene su commit en la rama principal. Probado en una copia: 103 cambios, 102 aplicados y 1 propuesto. El `CAMBIOS.md` queda intacto.
  - *Qué cambia para vos*: Mobile se mira cuando lo adoptes.
  - ⚠️ sin repasar (el handoff te la marca). *Deshacer*: antes del tag.

### 5. Lo que ves en tus proyectos: el Arquitecto, el sello, la portada

- **`D4.1` (D4-1) · El Arquitecto v3 ya está andando en tus dos PCs, también en tus proyectos viejos.**
  - *Cómo trabaja en un proyecto viejo*: como siempre (spec en `docs/`, sin commit, sin push), con la línea del tamaño y el sello de más.
  - *Qué cambia para vos*: **ya lo estás usando**.
  - *Si molesta*: se deshace con un revert y `kit-sync`.
  - ⚠️ sin repasar. *Deshacer*: **fácil**, pero es la única que ya está viva.

- **`D4.1` (D4-6) · Un proyecto nuevo (Modo A) todavía se arma con el molde viejo, v2.**
  - *Qué cambia para vos*: un proyecto que armes hoy nace v2 y lo pone al día la flota más adelante.
  - ⚠️ sin repasar. *Deshacer*: antes del tag.

- **`D4.1` (D4-8) · El sello del spec lleva una huella del texto.**
  - *Qué cambia para vos*: si tocás el spec después de sellarlo, aunque sea un error de tipeo, hay que sellar de nuevo.
  - ⚠️ sin repasar. *Deshacer*: antes del tag.

- **`D7.1` (D7-6) · La portada (el README) la arma un script, siempre con banner.**
  - *Qué cambia para vos*: About y etiquetas de GitHub no los toca: los propone y los hacés vos. El candado de la portada solo se prende si la portada quedó armada.
  - ✅ **banner corregido por vos el 2026-11-02** ("yo siempre quiero tener banner"). Lo demás, sin repasar. *Deshacer*: fácil.

### 6. Specs que sellaron por vos

Los deltas de los paquetes 1 a 3 los ibas a sellar a mano.

- **`D3.1` · Sellé yo el delta del paquete 3.** Vos lo autorizaste de antemano en "Cambios al plan" (2026-10-29), "provisorio, lo repasás al volver". ⚠️ no encontré que lo hayas repasado. *Deshacer*: antes del tag.
- **`D4.1` · Sellé yo el delta del paquete 4** (el primero con el script del sello). ⚠️ sin repasar.
- **`D5.1` · Sellé yo el delta del paquete 5.** ⚠️ sin repasar.

### 7. Lo que te quedó para hacer a mano

- **`D3.3` (e) · Cruzar los cinco patrones del corrector viejo de la PC `clientes` con el nuevo.** Nadie lo pudo mirar desde la otra PC. Te queda a vos, o pedíselo a una sesión allá. ⚠️ pendiente.
- **`D3.3` (G10) · Instalar los porteros por PC.**
  - *Cómo*: primero `--plan` (te muestra qué va a tocar), después de verdad.
  - *Si algo traba*: `--quitar` deja el `settings` byte a byte como estaba.
  - *El corrector viejo*: `--sacar-viejo` lo saca, pero siempre instala el nuevo antes (nunca te deja sin corrector).
  - ⚠️ pendiente en las tres PCs.
- **`D4.2` (D4.2-4) · Probar el Arquitecto en un proyecto v2 de verdad.** La prueba automática falló dos veces por cómo estaba armada, no por el kit, y no se repitió. Lo que falta lo ve tu uso real. ⚠️ pendiente.

---

## Las súper técnicas (no cambian lo que ves ni lo que hacés)

**D2.2**
- `D2.2` · Los programas que hacen de candado también cuentan como barrera: así nadie los afloja y saca un freno en el mismo commit.
- `D2.2` · Borrar la ficha o volverla "de fábrica" no apaga las barreras.
- `D2.2` · Los porteros que niegan no corren el agregado propio del proyecto (un agregado podía destrabar un freno).
- `D2.2` · Las fichas de fábrica viven en una carpeta protegida del molde.
- `D2.2` · El cierre parcial también corre el control de barreras (también hace commit).
- `D2.2` · El portero de escritura sigue sin huella hasta el actualizador.
- `D2.2` · Un plazo del arranque se chequea en el `doctor` del paquete 3.
- `D2.2` · Una exención se compara contra la versión anterior, para que un commit no se certifique solo.
- `D2.2` · La huella del `settings` sale del molde. Los desvíos se dicen regla por regla.
- `D2.2` · El portero que niega firmar reconoce el comando aunque lo disfracen, y niega un modo que no conoce.
- `D2.2` · Un campo desconocido en un cambio da rojo. Tu firma se busca en el registro de ese mismo commit (vale en la otra PC).
- `D2.2` · El control de barreras no mira commits de antes de que el proyecto tuviera ficha.
- `D2.2` · Una regla del `settings` que el molde nuevo retira da rojo si no está el molde viejo para comparar.
- `D2.2` · El candado no exige carpetas que se crean solas cuando hacen falta.

**D3.1**
- `D-2` · Por PC se instala solo el corrector de claves; el arranque del proyecto ya avisa si falta.
- `D-7` · Todos los porteros se registran de una forma que anda con y sin Git Bash.
- `D-13` · Las variables de git peligrosas van en una lista, no todas (algunas son legítimas).
- `D-8` · Versión mínima de Claude Code 2.1.295.
- `D-9` · El portero de las 5 de A mira solo la consola.
- `D-10` · El corrector protege también la marca de rol y las tripas de git.
- `D-11` · Unas líneas de GitHub del arranque pasan al paquete 6.
- `D-12` · Las librerías del portero por PC son copias exactas de las del molde, con una prueba que lo exige.
- `D3.1` · El detector de claves tiene 60 s y un reintento: en `clientes` tardó 47 s la primera vez, por el antivirus.

**D3.2** (todas ✅ aprobadas por vos el 2026-10-29)
- `G5` · El freno de archivos juzga cada tramo de un comando encadenado por separado (bajó ~100 falsos frenos).
- `G5` · Casos que se decidieron midiendo (de 308 frenos a 38, todos correctos): `npx dotenv`, comandos a otra máquina, patrones de búsqueda.
- `G6` · Cómo se juzga una rama nueva al subirla.
- `G6` · El primer commit de un proyecto no se juzga (si no, todo proyecto nuevo nacía en rojo para siempre).
- `G3` · Una librería de "esto es un agente" entra al molde.
- `G4` · El orden de lanzar los encargos (nunca más de dos Opus a la vez).
- `G3` · Un detalle para simular fallas de git en las pruebas y un mensaje más claro.
- `G4` · El caché del portero se invalida bien con la config de git.
- `G5` · El registro de frenos de la PC se escribe solo con el portero instalado.

**D3.3**
- `G7` · El nombre interno de cada portero suma sus argumentos (si no, dos se pisaban).
- `G7` · `commit -a` con una barrera distinta en dos lugares da rojo ("hacé git add y volvé").
- `G7` · Los controles de otras herramientas (husky, lefthook) siguen corriendo encadenados.
- `G6b` · El control de barreras acepta comparar contra el molde viejo (lo necesita el actualizador).
- `G7` · Una firma que vive en otra rama da un rojo de más, con el mensaje "pusheá desde esa rama".
- `G7` · Con la ficha rota, los controles corren con los frenos de fábrica.
- `G10` · El instalador toma la versión de la PC y pisa un archivo suyo editado a mano (el `doctor` avisa antes).
- `G11` · El `doctor` fuera de un proyecto da ⚠ en dos chequeos; la ruta de la app de escritorio, NO VERIFICADO.
- `G12` · Los repos de prueba se arman desde un punto fijo del molde.
- `RF-A` · Mezclar ramas en tu PC no corre el candado; lo juzga la subida (frenaba mezclas legítimas).
- `RF-A2` · El detector de claves mira solo las líneas agregadas, con su config guardada en el proyecto.
- `RF-A/A2` · Lo que anotan los controles va a un registro fuera del proyecto (antes ensuciaba y trababa el `pull`).
- `RF-B/B2` · El portero de git frena más trucos para saltarse los controles. Medido: 0 diferencias en 11.304 llamadas.
- `RF-C2` · El corrector deja pasar más cosas legítimas al obrero y sigue los cambios de carpeta.
- `RF-D2` · Una rama "huérfana" se juzga contra la vigente.
- `RF-C/RF-D` · Ajustes chicos de los dos correctores.
- `De D3.2` · Un hueco de la adopción queda como riesgo escrito; otro, arreglado.

**D4.1**
- `D4-2` · "Juntar el módulo" pasa al paquete 5.
- `D4-3` · Cerrar un banco de trabajo muda su registro de frenos y no hace commit.
- `D4-4` · El script de bancos de trabajo es uno solo, que anda en Bash y en PowerShell.
- `D4-7` · El esqueleto de la ficha del módulo se adelanta.
- `D4-19` · El `kit-sync` no corre a mitad de sesión (lo frena el inspector): va en el `/cierre`.
- `D4-9 a D4-18` · Dónde viven los scripts del Arquitecto, el orden de sus líneas, cuándo se niega a crear un banco de trabajo, y otros detalles.
- `J1/J2/J3` · Detalles de los encargos. Entre ellos, que el OK del Modo B sea una pregunta con botones.

**D4.2**
- `D4.2-1` · Las pruebas de D4.1 medían sin la regla nueva del `CLAUDE.md`; se arregló y se repitieron.
- `D4.2-2` · Las pruebas corrieron en `acceptEdits` porque el inspector frenó el bypass (de acá nace D5-2).
- `D4.2-3` · Se reescribió el criterio del prototipo: prototipo antes de las decisiones del spec.
- `D4.2-5` · La línea del tamaño del Arquitecto suma una frase.
- `D4.2-6` · Sin una variable de Git Bash que daba problemas.
- `D4.2-7` · Volvió a probar los cuatro pedidos chicos.
- `D4.2-8` · Un spec del método ya construido no se vuelve a sellar.

**D5.1**
- `D5-1` · El paquete 5 se partió en dos directores.
- `D5-5` · En las apps, la prueba más cara (mutación) solo en pasos de riesgo alto, con tope de 20 min.
- `RF-fix` · Cómo se cancela un encargo sin que trabe para siempre.
- `D5-4/6/7/8/13/17` · Detalles de vocabulario, dónde vive la lógica, avisos en vez de rojos.
- `Red team` · Que el temporal de "juntar" tenga sus dependencias; ninguna clave propia en el `settings.local`.
- `Revisor frío` · Arreglos para dos PCs, cancelar y temporales sucios.
- `Del director` · El pedido al obrero viaja de una forma que Git Bash no rompe, y se busca a `claude` también en la extensión de VS Code.
- `De los encargos` · Qué rechaza el validador de AUTORIZADO, y otros detalles.

**D5.2**
- `K5` · El corrector de afirmaciones pasó a D5.3. Corregiste el razonamiento el 2026-11-02: no hacía falta la PC `clientes`.
- `W0` · Tres arreglos chicos en un solo encargo.
- `contexto` · Un script nuevo con salida fija de una línea.
- `W0` · Las reglas `Write(...)` se sacan, porque Claude Code las ignora.
- `W0` · Cerrar un banco con archivos sueltos no los borra: los lista.
- `K4` · Un agente "implementador" más.
- `RF + director` · Varios: un `Write` autorizado se traduce a `Edit`, la marca de noche protegida, y el resto.

**D5.3**
- `D5.3` · Lo que enseñó la medición: lo que Hermes corregía era sobre todo texto viejo, no exageraciones.
- `Revisor frío` · Una ruta con espacios daba "limpio"; arreglado junto con otros detalles.
- `RF-fix` · La evidencia vale a ±3 renglones del texto.

**D6.1**
- `D6-5` · Un catálogo de qué archivos tiene cada pieza.
- `D6-6` · Los controles en la copia del actualizador (se completó en D6.2).
- `RF-9` · La línea 7 de `chequear` corre todas las pruebas juntas.
- `Revisor frío` · Una copia parcial hacía que todo pareciera "editado a mano"; arreglado junto con otros 10.

**D6.2**
- `D6.2-4` · La copia del actualizador la juzgan los controles del molde nuevo.
- `D6.2-5` · Un proyecto v2.4.2 con ficha y sin candado se juzga con el del molde.
- `D6.2-6` · Adoptar un proyecto viejo son dos commits (el tracker igual te lo marca para repasar).
- `D6.2-9` · Una mezcla que falla se rehace sin mezclar antes de dar el proyecto por roto.
- `Adoptador` · Toma como "molde viejo" la versión v2 que más coincide.
- `Revisor frío` · La base de una pieza que quedó esperando, la rama `kit/<tag>`, ssh, y otros.

**D7.1**
- `D7-1` · Hubo red team, una ronda acotada.
- `D7-2` · Lo que el kit ya cubre vive en `kit/cubiertos.md`, con un solo lector.
- `D7.1` · Con una versión de prueba (`-rc`) no se sube nada al kit.
- `Revisor frío` · La línea para pegar salía incompleta, y otros seis.

---

## Preguntas que siguen abiertas

1. **¿Qué cuenta como "porqué" de una pieza adaptada?** (de D6.2; el tracker la pone arriba de Pendientes)
   - *El problema*: hoy alcanza cualquier commit que tocó la pieza. Un "cierre: docs al día" que pasó de costado por el `/cierre` ya cuenta como porqué, y la próxima flota la mezcla sola.
   - **(A) Como hoy**: menos preguntas, pero mezcla cosas que nadie decidió.
   - **(B) Solo el `por:` de la ficha**, que escribe `/inicio` con tu respuesta: la primera vez de cada pieza adaptada te pregunta una vez, y después va sola.
   - **(C) Solo un renglón `Por: …` explícito en el commit**: hay que acordarse de escribirlo.
   - **Recomendada: B.** Es una línea de código.

2. **¿Te alcanza que una sesión en piloto automático pueda fabricar tu firma en tu carpeta principal?** (de D2.2, r4-1 b; Pendientes del paquete 2, punto 1)
   - *Qué recomendó D2.2*: aceptarlo hasta el paquete 3, donde se sumaban el portero que niega firmar en bypass y el candado.
   - *Dónde está hoy*: el paquete 3 ya está cerrado, así que lo que queda es confirmar que te alcanza. El `/inicio` te muestra los aprobados nuevos.
   - *Alternativa*: frenar hasta tener una firma que nada de Claude pueda imitar.

3. **Antes del tag: ¿cómo sale el 3.0.0 final después de una versión de prueba?** (Pendientes del paquete 6, punto 2; no es una pregunta formal)
   - *El problema*: la ficha guarda "3.0.0" sin el "-rc", así que si el final trae algo que el último rc no tenía, la flota lo saltea.
   - *Opciones*: o el rc se reparte solo a los repos de prueba, o el tag final es idéntico al último rc. El tracker no da recomendada.

4. **Menor: un repo con README propio igual recibe su banner, que queda sin enlazar** (Pendientes del paquete 7, punto 5).
   - *Opción del tracker*: "si molesta, que el banner dependa de que el README sea el del script".
   - Sin recomendada fuerte. Es consecuencia directa de tu "banner siempre".
