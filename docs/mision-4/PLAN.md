# Misión 4 — el plan

> Diseñado con Guido el 2026-10-14. **Solo diseño**: diseño → spec → construcción (la misión 5, en
> chats aparte). Este archivo es la guía de toda la misión; cada tramo deja su salida en esta carpeta
> y actualiza la tabla de tramos. Hoja de ruta: ADR-021. Material: `tips/tanda-2026-10-chats.md` y
> la biblioteca privada (`vibe-research/biblioteca/LEEME.md`).

## El foco (pedido de Guido, 2026-10-14)
No "profesionalizar lo que ya hace", sino **mejorar el proceso**. Es "su método": de acá sale todo y
las actualizaciones grandes son pocas (una cada varios meses), así que el diseño tiene que ser muy
bueno. Se mide contra **7 objetivos**:
1. **Menos tokens** · 2. **Mejor calidad de código** (menos fallas repetidas) · 3. **Proyectos más
documentables y estables** · 4. **Procesos estables** (menos trabajo a mano) · 5. **Trabajar bien entre
3 PCs y 2 personas** · 6. **El tiempo y la atención de Guido** (menos "dale", menos pestañas, menos
lectura; ej.: 39 de 115 turnos de un director eran ruido) · 7. **Seguridad por defecto** (hay alertas
reales abiertas).
Toda mejora dice qué objetivo mueve, **contra qué línea base medida** y cómo se va a saber si funcionó.

**El norte para todas las decisiones del diseño** (lo pidió Guido el 2026-10-21, en el tramo 4):
- **Un workflow ágil en el que Guido casi no interviene.** Él decide el diseño y las reglas de negocio;
  la ejecución queda en manos de los obreros y los agentes.
- **Los frenos no traban el trabajo.** En Hermes, muchos frenos entorpecían el desarrollo y le pedían
  intervención a Guido. Varios estaban "de adorno" para el tamaño de los trabajos, y en este contexto
  tocar producción no es tan riesgoso.
- Las reglas que salen de eso:
  - **un freno corrige al agente sin despertar a Guido**: le niega la acción y le dice qué hacer en su
    lugar;
  - **a Guido solo se le pregunta lo irreversible de verdad**, y esa lista corta la decide él;
  - **un freno que molesta más de lo que salva, se saca.**
- **La primera pregunta de toda pieza es si le baja la intervención a Guido o se la sube.**
- Las decisiones se le presentan en criollo, cortas, diciendo qué cambia para él en el día a día.
**La información de la investigación no se pierde**: se usa de verdad.

**La forma de pensar que pidió Guido** (puesta en limpio el 2026-10-22, al cerrar el racimo E; vale para todo el
diseño y después para la construcción). Es pragmática: **mejorar su workflow**, no "profesionalizar" ni sumar piezas.
- **El filtro de cuatro preguntas, antes de aplicar cualquier mejora o ajuste**: ¿corrige un error real o es "por las
  dudas"? · ¿lo hace más consistente (una sola verdad, sin contradicciones entre piezas)? · ¿lo hace menos propenso a
  errores? · ¿da mejores resultados **sin que Guido tenga que estar al tanto**? Lo que no pasa ninguna, no entra. Lo
  que pasa a medias, se recorta: **no se aplica "todo" porque venga en una lista**.
- **Partir de lo que ya existe y de lo medido.** Si el dato ya vive en un lugar (el Hub, GitHub, la lista de carpetas
  que Claude Code anota sola), se lee de ahí; nunca se crea un segundo registro. Un diseño arranca de un número
  medido, no de una intuición.
- **Cortar los roles por la pregunta que responden**, no por lo que "podrían" hacer. Si una pieza responde dos
  preguntas distintas, son dos piezas que se hablan.
- **Lo genérico, en el kit; lo de la empresa, aparte.** vibe-kit sigue siendo infraestructura general; la conexión
  con las cosas de Guido es una capa privada que se enchufa.
- **Cada decisión, de a una, en criollo, con "qué cambia para vos"**, opciones con pros y contras y **una**
  recomendación; Guido aprueba en bloque o corrige. Las listas largas se clasifican antes de mostrarlas: qué rompe,
  qué está flojo, qué mejora, qué sobra.
- **Un revisor frío después de decidir y antes de escribir el spec.** Las decisiones tomadas en la charla tienen
  puntos ciegos que solo ve alguien que no estuvo.
- **Decir la verdad sobre el costo**: cuántas preguntas nuevas le suma a Guido una pieza, contadas; qué es
  suposición (**NO VERIFICADO**) y qué se probó.

### Los 11 criterios de cada racimo (definidos con Guido el 2026-10-22)

Son la vara fija para lo que falta del tramo 4, para el spec del tramo 5 y para la construcción. **Cada
`DISENO-<racimo>.md` cierra con una tabla corta, criterio por criterio: cómo lo cumple, o por qué no aplica.** Los
criterios 1, 2, 4 y 5 son los que **deciden**; los demás son condiciones que una pieza no puede romper. **Al terminar el
tramo 4, antes del spec, se hace una revisión integral de todas las decisiones de todos los racimos con esta vara.**
Más adelante, estos criterios tienen que verse reflejados en el `CLAUDE.md` del molde y en el sistema de documentación
(racimo B): es donde van a brillar en el día a día.

| # | Criterio | La pregunta que se le hace a cada pieza | Hoy (línea base) |
|---|---|---|---|
| 1 | **Menos intervención de Guido** | ¿Le baja la intervención o se la sube? Solo se le pregunta lo irreversible | 39 de 115 turnos de un director eran ruido; ~110 "¿cómo vamos?" |
| 2 | **Pragmático, recortado** | El filtro de las cuatro preguntas (arriba). ¿Es "por las dudas"? ¿Pasa la regla de 3+? | — |
| 3 | **Medible** | ¿Qué objetivo mueve, contra qué línea base, y cómo se va a saber si funcionó? | Tabla de líneas base del `TABLERO.md` §1 |
| 4 | **Software que anda y se sostiene: consistente, seguro y escalable** | ¿Baja las fallas que vuelven y los arreglos del arreglo? ¿Deja cada cambio con su prueba y una verificación mecánica antes de "listo"? ¿Piensa la infraestructura (base, entornos, deploy, respaldos) y no solo la pantalla? | 26% de los arreglos arreglan otro arreglo; 0-45% traen su prueba; backups vacíos en verde |
| 5 | **Tokens y el modelo justo** | ¿Quién hace esto, y es el más barato que lo hace bien? Opus o Fable solo donde hay criterio; Sonnet para volumen; Haiku para lo mecánico; script donde no hace falta modelo. ¿Relee algo que podría no releer? | 98% del costo de un director es releer; ~370 mil tokens releídos por respuesta |
| 6 | **El script antes que el modelo** | Lo determinístico (estado, versión, chequeos, inventarios) ¿lo calcula un programa? Sale igual siempre, casi gratis y no se equivoca | El estado "ESPERO / TE NECESITO" lo decía el modelo y se equivocaba |
| 7 | **Seguro por defecto** | ¿Qué pasa si esta pieza se corre en el peor momento? Barreras de fábrica; secretos nunca en un repo ni impresos; el kit es público | 8 de 10 proyectos sin `deny`; 12 alertas abiertas |
| 8 | **Portable: igual en cualquier PC y para cualquier persona** | ¿Funciona en la notebook y en la PC del compañero sin explicación? Nada depende de la memoria de una máquina ni de quién está sentado | ~6 h de explicación a un usuario nuevo; una sesión 5 días inalcanzable |
| 9 | **Lo chico no paga el costo de lo grande** | ¿Se ajusta al tamaño del trabajo, o le pone el traje de Hermes a todo? Una feature chica sin spec, chat nuevo ni director | Un hotfix de 15 líneas pasó por 3 auditores; un spec READY se ejecutó en 2 min |
| 10 | **Autónomo pero con rastro** | Los agentes hacen solos y en silencio, pero cada cosa deja una marca verificable (commit, línea, tabla). Si salió mal, ¿se ve dónde y se deshace? | Avisos sueltos a una sesión cerrada; "aprobado, sin aplicar" mal anotado |
| 11 | **Piloto antes de flota, y lo aprendido vuelve al método** | ¿Se probó en un proyecto y se midió antes de soltarlo a los 10? ¿La lección volvió al kit o se quedó en un chat? | 36 cambios de método en 5 días sin saber si anduvieron |

## Los pilares que el diseño tiene que cubrir
- Las 4 capas del pack: **Base** (inicio/cierre/handoff, norte, manual por módulo) · **Dirección**
  (director/obrero/tramo + política de modelos) · **Mesa** (directores y PCs) · **el Arquitecto como
  puerta**, también sobre proyectos que ya andan.
- **El Arquitecto como agente único — la visión de Guido** (2026-10-14): Guido lo piensa como **un solo
  agente**, portable a cualquier PC, que hace todo: **prepara la PC** (hoy lo hace el Equipador),
  **arranca proyectos con todo el armado inicial** (ya lo hace), **mantiene la flota al día** (nuevo:
  mira todos los proyectos, sabe qué versión del método tiene cada uno y propone actualizar skills,
  sistema de docs y CLAUDE.md, de a uno y con OK) y responde igual en otra PC.
  - ⚠️ **Choca con ADR-004 y REJ-003** (jul-2026: el Equipador se separó como skill hermana y se
    descartó un "modo máquina" dentro del Arquitecto, porque lo inflaba). El diseño lo tiene que
    resolver de frente, no pisarlo. **Camino propuesto, a decidir en el tramo 4: una sola puerta,
    varios módulos** — Guido habla siempre con el Arquitecto y él deriva adentro a la pieza
    (máquina · proyecto nuevo · proyecto existente · flota); por dentro siguen siendo piezas chicas.
    Chequear en el tramo 2 qué ofrece la plataforma para esto (agentes, plugins: ojo REJ-001).
  - Lo que hace posible la flota: **P31** (skills canónicas en el kit + una ficha por proyecto →
    actualizar = regenerar desde el molde sin tocar lo propio) y **P44** (versión del kit visible en
    cada proyecto). A decidir: cómo marca su versión cada proyecto, qué toca solo y qué con OK.
- **Mensajería multiagente — pedido de Guido (2026-10-21)**: es un buzón entre agentes de distintas
  cuentas, distintas PCs y también **de otros LLM**, montado sobre una carpeta compartida de la
  organización. **Va al racimo G (Mesa y PCs)** y se diseña recién ahí, no antes *(2026-10-24: G lo separó en el racimo **G.1**, opt-in, porque git ya cruza cuentas; brief en [DISENO-G](DISENO-G-mesa-y-pcs.md) §18)*. Toca también otros
  racimos:
  - **F**: la firma por agente y el arnés de lo que pide OK humano;
  - **E**: la skill canónica más el hook del molde;
  - **B**: lo que inyecta el hook va con tope.

  Lo que se decide en G:
  - **reabre `PLATAFORMA.md` §6.2**: hoy el canal oficial es Remote Control + `SendMessage` y el canal
    por archivo es solo un respaldo;
  - **cambia una regla de la mesa**: hoy entre directores viajan hechos y nunca decisiones; con encargos
    autónomos entre proyectos, eso deja de ser así.

  El material está fuera de este repo: un SPEC-0 en borrador, con su red team, y el protocolo v0 que
  hizo otra sesión. **Ninguna ruta, ningún nombre ni ningún contenido del buzón entra acá** (ADR-021).
  El v0 corre mientras tanto como piloto, igual que los de Hermes.
- **El agente de ecosistema, aparte — decisión de Guido (2026-10-22)**: la idea de un agente que conozca todos
  los proyectos a la vez (el mapa, la salud de la flota, "¿esto es nuevo o va adentro de algo?") **no es parte
  del Arquitecto**. El Arquitecto queda en lo que venía: la PC, el proyecto nuevo, la feature, el consultorio y
  poner al día la flota. El ecosistema es propio de la empresa y vibe-kit se mantiene genérico: va al
  **racimo I, el último**, y probablemente viva en el Hub. Detalle y lo ya decidido: `TABLERO.md` §10.
- **Niveles del método por tamaño de proyecto** (liviano · estándar · proyecto largo con director) y
  **camino de adopción** (un proyecto piloto → medir → extender; Hermes no se migra a mitad de un tramo).
- **Medición repetible**: los scripts de la investigación corridos cada mes sobre lo nuevo
  (`condensar.py --desde`, `costos.py`) + un tablero que compara contra la línea base.
- **Pocas cosas que muevan mucho**: el spec elige **las 10 de más impacto**; el resto queda en espera
  con su condición de entrada.

## Modelos, esfuerzo y tokens (chequeado contra la referencia oficial el 2026-10-14)
- **El chat donde Guido decide: Opus 5.5 en esfuerzo `high`.** Ojo: el esfuerzo por defecto de Opus 5.5
  es `medium`, y la guía oficial pide **mínimo `high` para trabajo de criterio** — elegirlo a mano en el
  selector del chat. `max` no: en un chat largo se paga en cada turno y rinde solo en problemas duros.
- **Los momentos de más peso** (cruzar la radiografía, escribir el SPEC final, el revisor frío): Opus 5.5
  en `xhigh`, o **Fable 5.1** (el modelo más capaz; cuesta ~2,5× Opus 5.5) — solo ahí, que es poco
  volumen y mucha decisión. Lo elige Guido al llegar.
- **Lectores de volumen: Sonnet 5.5**, con salida corta y techo. **Opus lee cuando vale la pena**
  (poco volumen, mucho criterio: los métodos de director/obrero y el uso real que describen las síntesis).
- Un lector gasta ~3× lo que lee. **Antes de toda lectura de más de ~100 KB: decir el costo y esperar
  el OK.** Nunca se leen enteros los hallazgos crudos (1,7 MB) ni los condensados (49 MB): solo grep.
- El acta (78 KB) se consulta por partes; los lectores devuelven resúmenes, no texto crudo.
- **Cada tramo cierra** actualizando la tabla de tramos de este archivo y el handoff: el chat siguiente
  arranca leyendo este PLAN + las salidas de los tramos anteriores, nada más.

## Los tramos
| Tramo | Qué | Sale con |
|---|---|---|
| ✅ 0 · Biblioteca | Hecho el 2026-10-14: todo `D:\vibe-hallazgos\` respaldado en el repo privado `vibe-research/biblioteca/` (1.362 archivos) con un `LEEME.md` de capas y costos de lectura | Nada se pierde; accesible desde las 3 PCs |
| ✅ 1 · Radiografía director/obrero | Hecho el 2026-10-14 (~452 mil tokens, 2 lectores Opus): anatomía, flujo, mensajes, modelos, costo, fallas, qué anda, los dos dialectos del método y 10 mejoras con su línea base. Trajo 10 hallazgos nuevos, entre ellos una alerta de seguridad (al archivo privado) | [`RADIOGRAFIA-director-obrero.md`](RADIOGRAFIA-director-obrero.md) |
| ✅ 2 · Evidencia de afuera | Hecho el 2026-10-14. **Costo: ~312 mil tokens** (el agente de la plataforma, 3× lo estimado); los scripts, casi gratis (`observatorio/investigacion/`: `flota.py`, `huella.py`, `repos.py`). Lo fuerte: 3 dialectos de director/obrero (Deptos, el corto); ningún proyecto marca su versión; **el hook de arranque del kit no tiene tope y la plataforma corta a 10.000 caracteres** (2 proyectos arrancan sin ver su estado); el molde no trae `deny`; 1 de cada 4 arreglos es arreglo de otro y casi nunca trae su prueba; abrir, avisar, ver estado y mensajear entre PCs ya son nativos (con huecos). **Pregunta abierta**: a quién pertenece la segunda cuenta que firma 3 proyectos (FLOTA §8). Brief original: **(0) Inventario de la flota** (script, casi gratis): todos los proyectos de las 3 PCs — dónde viven, su repo, qué skills/docs/CLAUDE.md tienen y de qué versión del método son. Visto el 2026-10-14 en esta PC: 8 repos (6 en la organización `eQ-Repositorio`, accesible con `gh` desde cualquier PC) y **skills nacidas en los proyectos** que pueden ser candidatas al kit (en el Hub: actualizar, estimar horas, horas por commit, viernes, backup; en un bot: reporte mensual, deploy). La otra PC y la del compañero: por `gh` si están en GitHub, si no por Remote Control. **El capataz (P41) queda afuera**: fue una idea de proyecto para un compañero, no es parte del workflow de Guido (lo aclaró él, 2026-10-14). **(a) Qué ofrece hoy la plataforma**: el agente `claude-code-guide` chequea contra la doc oficial qué de lo armado a mano ya es nativo (equipos de agentes y mensajes, worktrees, workflows, memoria, Remote Control, agentes en segundo plano) — ~100 mil tokens. **(b) Evidencia de los repos**: scripts sobre el historial de git de los proyectos (commits de arreglo, reversiones, lo que se rompió dos veces, si hay pruebas) — casi gratis | [`FLOTA.md`](FLOTA.md) · [`PLATAFORMA.md`](PLATAFORMA.md) · [`REPOS.md`](REPOS.md) |
| ✅ 3 · Mapa por objetivos | Hecho el 2026-10-14. **Costo: ~405 mil tokens** en el barrido (3 lectores Sonnet sobre las 5 síntesis; 1,6× lo estimado). Todo repartido por los 7 objetivos: P1-P57, las 10 mejoras, el tramo 2, el Anexo A y **50 hallazgos del barrido que no habían llegado a ninguna conclusión** (código `S-`, sobre todo de seguridad y calidad). Las 10 mejoras: 4 adoptar, 4 construir, 2 mixtas. Una tabla de líneas base que se repiten cada mes con los scripts. **8 racimos** como entrada al tramo 4; la recomendación: arrancar por frenos y verificación (A), una salida hacia Guido (C) y el molde único (E). Falta medir: el tiempo entre PCs y el costo en dólares | [`TABLERO.md`](TABLERO.md) |
| 4 · Diseño por pilar | Las 4 capas + la flota + niveles/adopción + medición. De a una decisión. **Orden** (2026-10-21): A → C → E → F → B → D → G → H, por racimo del tablero. **I** (el ecosistema, sumado el 2026-10-22) **salió del kit el 2026-10-26** (ADR-024: se diseña en el Hub; acá queda el contrato del registro, como nota en E). **Desde el 2026-10-22, cada racimo se diseña con los 11 criterios de §El foco y cierra con su tabla; al terminar los nueve, una revisión integral de todas las decisiones con esa vara, antes del spec.** Cada racimo trae sus ideas de [`REFERENCIAS-EXTERNAS.md`](REFERENCIAS-EXTERNAS.md). **✅ A · ✅ C** (2026-10-21) · **✅ E** (2026-10-22: la puerta única, la ficha del kit, el actualizador que nunca pisa una adaptación, el Hub como registro) · **✅ F** (2026-10-22: 9 barreras de archivos que frenan también en bypass, un solo corrector de secretos por PC, "usar sin ver" con comandos que cargan la credencial, niveles dummy/prueba/real, las barreras son del proyecto con `hasta:`, y "con permiso, igual con red") · **✅ B** (2026-10-22: el árbol de `docs/` en cuatro capas, una carpeta por módulo con la ficha y la historia separadas, el plano de la app en `NORTE.md` y `MAPA.md`, el hook con presupuesto y huella, el TODO que no miente, el candado de estructura por script, el `CLAUDE.md` por los 11 criterios; 33 hallazgos del revisor, 30 aplicados; más 20 correcciones de la revisión de coherencia de Fable contra A, C, E y F) · **D, ampliado el 2026-10-23 por pedido de Guido**: además de modelos, ruido y revisión, es **el racimo del método director/obrero y de su workflow diario** ("es lo que más uso para codear; acá es donde más quiero participar"): la anatomía canónica del director, el obrero y el tramo (un solo dialecto de los tres que hay), la revisión de las skills que hoy viven en sus repos, qué skills faltan o sobran (regla de 3+ medida con `flota.py`), cómo estandarizar la metodología sin perder lo propio de cada proyecto, y las mejoras que puede sumar a su día a día. Arranca con una ficha "el director y el obrero canónicos" que junta lo que ya decidieron A, B y C, y con una entrevista corta a Guido sobre su día. **✅ D** (2026-10-23: 11 decisiones con Guido adentro; director por tamaño y sin agente PO; `/obrero` y `/tramo` separados con núcleo común; Sonnet por defecto y el red team con criterio de salida; Guido abre las pestañas por default y un hook aprueba lo autorizado; una rama por módulo con el director dueño, **provisoria**; silencio entre agentes y el despertador afuera; revisión congelada con ≤2 vueltas; "compactar es una falla"; el gate como script y cero datos clavados; tres clases de decisión; el canon entra por el módulo nuevo con piloto en Deptos. Verificado contra la doc oficial; revisor frío: 25 hallazgos, 21 aplicados. **"Publicar un release" entra como quinta pregunta de A §2.** **✅ G** (2026-10-24: la mesa por git con el aviso por mensaje; un archivo por mensaje dentro del módulo, que nunca se edita y cuyo estado calcula un script; 6 tipos de mesa en una tabla única; acuerdos que viven una vez y van al PO solo si cambian el alcance; recursos compartidos con dueño; `crossSessionInbound: accept` por el Equipador; dos personas con `fetch`, aviso y commit por rutas; números de decisión por módulo; lecciones al repo; `aprueba:` por alias. 12 decisiones aprobadas en bloque; revisor frío con 34 hallazgos, todos aplicados; git ya cruza cuentas, así que **el buzón multiagente pasa al racimo G.1**, opt-in, con investigación en internet y piloto). **✅ H** (2026-10-25 y 26: dos ejes con nombre, tamaño del pedido y nivel del proyecto; una sola regla de tamaño que dice la sesión sin preguntar; director solo si se escribe a la vez; subproyecto = módulo con nombre; el Arquitecto termina armando el mini ecosistema y dando la línea de apertura; el entorno de prueba declarado en el spec, verificado por script y chequeado al abrir; ramas `modulo/<x>` y worktrees por script; tope del spec como aviso que decide Guido; prototipo antes del spec; `sensible:` a reglas por script. Decisiones 1-6 aprobadas en bloque el 24 y 7-14 el 26, con el tope del spec corregido a aviso; revisor frío: 45 hallazgos, todos aplicados; verificado contra la doc oficial de worktrees y contrastado con otros métodos). **✅ Lectura de contraste** (2026-10-26, PC `clientes`, sesión del observatorio: 336 chats, 83 lectores Sonnet, 3 síntesis Opus, 22,1 M; acta `tips/tanda-2026-11-contraste.md`: 17 confirmadas · 17 contradichas, casi todas línea de base · 14 mixtas · 1 sin evidencia; ~10 a reabrir; P66-P77). **Orden del resto, fijado por Guido el 2026-10-26**: **revisión integral con el acta abierta, sin volver a los chats** (decisiones a reabrir una por una, triage de P58-P77 en tres pilas, relectura solo de los 4-5 chats ★, y la nota del contrato del registro en E) → **G.1** → el spec. **I ya no es racimo del kit** (ADR-024)) | Un `DISENO-<racimo>.md` por racimo: [A · frenos](DISENO-A-frenos.md) · [C · salida hacia Guido](DISENO-C-salida-hacia-Guido.md) · [E · molde y flota](DISENO-E-molde-y-flota.md) · [F · seguridad](DISENO-F-seguridad.md) · [B · documentos](DISENO-B-documentos.md) · [D · director/obrero](DISENO-D-director-obrero.md) · [G · mesa y PCs](DISENO-G-mesa-y-pcs.md) · [H · niveles y puertas](DISENO-H-niveles-y-puertas.md) |
| 5 · El spec | Un SPEC del pack con **el top 10**, métricas, niveles, piloto y adopción → red-team → **revisor frío independiente** (un agente sin contexto de las charlas) → Guido lo aprueba | El plano READY + orden de construcción para la misión 5 |

**Cómo participa Guido** (lo eligió él): Claude recomienda, Guido corrige (aprueba temas en bloque o
cambia); lo que se discute va con opciones + pros/contras + UNA recomendación.

## Brief del tramo 1 — la radiografía de director/obrero
- **Qué es**: un apartado propio (pedido de Guido) que analiza **cómo está armado su sistema** de
  director y obreros: roles, cómo se abre una pestaña, cómo se hablan (mensajes, suscripciones), el
  relevo de director, el tramo, el gate, qué modelo usa cada uno. Y por cada parte: qué funciona
  (acta Q8), qué cuesta (Q1), qué falla (Q2, Q6), qué es propio de Hermes y qué sirve para cualquier
  proyecto, y qué mejora movería cuál de los 7 objetivos.
- **Fuentes** (medidas el 2026-10-14):
  - Desktop `D:\Hermes\Hermes.exe`: skills `director` (39 KB), `obrero` (22 KB), `tramo` (40 KB) +
    `docs/metodo/RELEVO_DIRECTOR.md` (10 KB) = ~111 KB.
  - Mobile `D:\Hermes\Hermes mobile`: skills `director` (39 KB), `obrero` (31 KB), `tramo` (28 KB), `gate`
    (15 KB) + `docs/v4/METODO.md` (80 KB) = ~193 KB. ⚠️ Ese checkout está en una rama de trabajo
    (`v4/m13-cronos-app`): el método vigente es el de `main` (leer con `git show main:<ruta>`).
  - **El uso real, no solo lo escrito**: las síntesis `parcial-hermes-desktop.md` (79 KB) y
    `parcial-hermes-mobile.md` (65 KB) de la biblioteca privada — cómo se comportó de verdad el sistema
    en ~65 lotes de chats. Las lee el mismo Opus de cada lado, junto con las skills.
  - El acta: solo Q1, Q2, Q6 y Q8. Y `ya-sabido.md` para no redescubrir lo escrito.
  - **NO se leen**: `METODO_PROYECTO_LARGO.md` (216 KB), `CAMBIOS.md` (121 KB) ni las bitácoras (~470 KB)
    — ya están resumidos en `ya-sabido.md`; se abren por grep si hace falta un detalle.
- **Cómo**: 2 subagentes **Opus** en paralelo (uno Desktop, uno Mobile) con la misma plantilla de
  salida (anatomía · flujo · mensajes · modelos · costo · fallas · qué funciona · propio vs genérico) y
  techo de **~12 KB** cada uno (4 KB perdía matices de un sistema de ~300 KB). Cada uno separa
  "cómo está escrito" de "cómo se comportó". El chat principal cruza los dos con el acta y arma el
  documento con Guido. **Costo estimado: ~450 mil tokens** (~450 KB de fuentes, Opus). Decirlo y esperar el OK antes de lanzar.
- **Reglas**: solo diseño · destilado y genérico (el repo es público: nada de nombres, rutas ni
  negocio de Hermes en lo que se escribe) · lo que es un hallazgo nuevo se marca como tal.
- **Sale con**: la radiografía + una lista corta de "qué mejoraría y por qué", que entra al mapa del
  tramo 3 (el mapa por objetivos). Fila nueva en `docs/README.md` para `docs/mision-4/`.

## Lecciones para el ciclo
> Materia prima de la misión 6 (escribir el ciclo de mejora del método). Cuando Guido dice "anotá esto
> para el ciclo", va acá: una línea por lección, con su fecha.
- **(misión 3)** La información de la investigación casi se pierde por no tener respaldo; se resolvió
  con la biblioteca en el repo privado (tramo 0).
- **(misión 3)** El plan cambió tres veces porque los objetivos no estaban escritos de entrada.
- **(misión 3)** Faltaba el inventario de proyectos (entró como el paso 0 del tramo 2).
- **(misión 3)** Opus 5.5 viene con esfuerzo `medium` por defecto; para trabajo de criterio hace falta
  `high`.
- **(tramo 1, 2026-10-14)** Verificar en disco los hallazgos fuertes de los lectores antes de escribirlos
  costó 4 comandos y los confirmó todos. Un número que parecía mal estaba en otra rama: mirar dónde vive
  cada documento antes de medirlo.
- **(tramo 1, 2026-10-14)** **Convención de nombres de sesión**: `vibe-kit M<n> · <qué hace>` (por
  ejemplo, "vibe-kit M3b · Profesionalizar repo + portada + plan M4"). Guido renombró todas las sesiones
  de la hoja de ruta en esta PC. Así, en la misión 6 se sabe qué hizo cada una sin abrirla. El handoff
  trae el título de la sesión siguiente y `/inicio` se lo pone solo.
- **(tramo 2, 2026-10-14)** Una consulta de 14 preguntas al agente `claude-code-guide` costó ~312 mil
  tokens: **3× lo estimado**. Poner un techo de salida no alcanza; hace falta también un **techo de
  búsqueda** (cuántas páginas puede abrir) o partir las preguntas en tandas chicas. Leer las 2 páginas
  clave por WebFetch desde el chat principal fue barato y confirmó lo que dijo el agente.
- **(tramo 2, 2026-10-14)** Lo más valioso salió de **cruzar dos fuentes baratas**: el tope del hook que
  dice la doc, contra lo que inyecta cada proyecto (medido con `wc -c`). Ninguna de las dos sola lo
  mostraba. Y los scripts sobre git y `gh` dieron líneas base reales casi gratis: conviene hacerlos
  primero en cada vuelta.
- **(tramo 3, 2026-10-14)** Pasarles a los lectores del barrido un **índice de lo ya cubierto** (16 KB:
  títulos de H-nn, P-nn y los hallazgos de los tramos) fue lo que hizo útil el barrido: devolvieron solo lo
  nuevo (50 cosas) en vez de repetir. Costó 1,6× lo estimado; el lector con 3 síntesis gastó más que los
  otros dos juntos, así que conviene **un lector por síntesis**.
- **(tramo 3, 2026-10-14)** Mientras se armaba el tablero, otra sesión commiteó un anexo con novedades de
  un proyecto. `/cierre` lo detectó por el `git log`. Con dos sesiones sobre el mismo repo, **mirar el log
  antes de cerrar** (es P46 en carne propia).
- **(tramo 4, racimo E, 2026-10-22)** Después de aprobar las 9 decisiones con Guido, **un revisor frío** (agente sin
  contexto de las charlas) encontró **4 errores que rompían el diseño** tal como estaba escrito (una palabra con dos
  sentidos, una dependencia circular, dos merges que pisaban adaptaciones) y 11 ajustes más; una lectura dirigida de
  un repo parecido (gentle-ai) sumó 3 piezas chicas. Costó ~210 mil tokens entre los dos. **Regla para el ciclo: el
  revisor frío va después de las decisiones y antes de escribir el spec, en cada racimo**, no solo al final del tramo 5.
- **(tramo 4, racimo F, 2026-10-22)** El revisor frío volvió a rendir: 9 cosas que rompían, entre ellas **una pregunta a
  Guido escondida** (escribir en una base real) que contradecía la lista de 4 del racimo A sin que nadie lo viera, y una
  tabla de criterios que se autoelogiaba en 4 de 11. **Regla nueva de Guido: antes de aplicar un hallazgo de la
  revisión, pasarlo por el criterio de diseño ya establecido** (el norte y el filtro de cuatro preguntas); de 26, uno no
  pasó (era "por las dudas"). Verificar la mecánica de la plataforma contra la doc oficial **antes** de decidir (agente
  `claude-code-guide`, 2 tandas, ~234 mil tokens) evitó diseñar sobre supuestos: dos "no verificado" se cerraron ahí.
  Costo de la revisión: ~264 mil tokens entre los dos lectores.
- **(tramo 4, racimo B, 2026-10-22)** Guido pidió, antes de decidir, **mirar sus repos de verdad** ("mandá a alguien a revisar
  Hermes") y al referente externo. Un lector Opus sobre Hermes por `gh` (~80 mil tokens) cambió el diseño de fondo: de "adoptar
  lo del Hub" a "una carpeta por módulo con estado e historia separados", porque mostró que el tablero de 1,7 MB tenía ~70 mil
  caracteres vivos y que los rituales mandaban a leer enteros documentos de 300 KB. **Regla para el ciclo: antes de diseñar una
  pieza, un lector barato mide cómo se usa hoy en los proyectos reales**; la ficha de "hoy" se arma con eso, no con lo que dice el
  molde. El revisor frío volvió a encontrar lo que nadie ve desde adentro: una suma de presupuesto que no cerraba y tres preguntas
  a Guido escondidas tras un "cero". Y una regla de Guido de hoy: **los subagentes van en Sonnet u Opus, nunca en Fable**.
- **(checkpoint, 2026-10-21)** Durante una semana, los directores de los proyectos mandaron sus cambios de
  método como avisos sueltos a una sesión ya cerrada (la del tramo 1). Hubo avisos repetidos y uno quedó mal
  anotado ("aprobado, sin aplicar", cuando ya estaba aplicado). Lo que anduvo fue **un pedido con formato
  fijo a cada director** (número · qué cambió · freno o blanda · SHA · pusheado · dato medido) y verificar
  cada línea en su git: dos respuestas, todo comprobado en minutos. Para medir el piloto en la misión 5,
  así.
- **(tramo 4, racimo D, 2026-10-23)** El racimo donde Guido más participa rindió distinto: **dos veces pidió repensar una recomendación**
  (unificar `/obrero` y `/tramo`; el agente PO) y las dos veces tenía razón, porque la regla del PLAN "cortar los roles por la pregunta
  que responden" decidía al revés de lo recomendado. **Regla para el ciclo: cuando una recomendación junta dos piezas, pasarla primero por
  esa regla.** Dos lectores antes de decidir (Opus sobre las skills en disco, ~365 mil; Sonnet sobre las trabas registradas, ~215 mil)
  mostraron que el dialecto más corto (Deptos) era el más cerca del canon y que una línea base de FLOTA se apoyaba en skills con el mismo
  nombre y otro oficio: **medir en disco antes de confiar en un inventario por nombres**. Verificar la plataforma contra la doc oficial
  (~118 mil, 5 preguntas, techo de 10 páginas) cambió una decisión entera: Guido trabaja en VS Code, y "un mensaje de otra sesión nunca
  aprueba un permiso" explicó el pop-up que más le molesta. El revisor frío (~158 mil) encontró 7 que rompían, entre ellas **un permiso
  que el obrero se daba solo** y **las 4 de A sin freno en bypass de noche**: la seguridad hay que revisarla en frío aunque F ya esté
  cerrado. Y una regla de Guido: **"cada mensaje entre agentes trae algo nuevo y verificable; si no, es ruido"**; el criterio antes que la
  decisión ("si el norte está claro, la decisión sale bien").

