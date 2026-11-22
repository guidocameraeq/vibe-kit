# El ciclo de mejora del método

> Cómo se mejora el método (el kit, el playbook, director y obrero) **con evidencia del uso real**, y cómo se saca una versión nueva.
> Es una **receta**, no una skill: se corre pocas veces (regla de 3+). La escribió la misión 6a (2026-11-03) con la vuelta 1 hasta la
> beta, y la rehízo la 6b (2026-11-15) con el tramo de las `rc`: de la `rc.1` a la `rc.7`, las dos revisiones finales, las noches
> reales y el banco de prueba. La sesión 6 (2026-11-16) le sumó el final: la `rc.8`, los dos bancos y la `v3.0`.
> Lo crudo de las dos lecturas está en el privado (`vibe-research/mision-6/lectura-6a/` y `lectura-6b/`). El plan de la 6a está en
> [`mision-6/PLAN-6a.md`](mision-6/PLAN-6a.md).

**Cómo se usa**: **la página que hay que leer es §6**, cómo sacar una versión: primero **qué vía toca** (la corta, "en piloto", o
la larga, ADR-046) y después la tabla con los 16 pasos de la larga: quién la hace y en qué modelo, qué hace el dueño y cuánto lleva. El resto es el detalle de cada paso. La vuelta entera son los pasos de §5. Una `rc` sigue §7 y un tramo de varias
sesiones, §8. Los prompts para copiar están en §9 y las plantillas en §10. Lo de la v3 (el anexo, §11 a §13) está para consultar, no
para seguirlo.

*Los documentos de antes de la 6b citan las secciones viejas: §3.4 ahora es §5.4 y §5.5, §3.5 es §5.6, §3.6 (los niveles de control) es §7,
y §8 (el corte) es §2.*

## 1. Para qué, y qué no es

- **Para qué**: que el método no se quede quieto mientras se usa mucho. La primera vez pasaron 70 días sin tocar el kit, y mientras
  tanto un proyecto se inventó un método entero propio (ADR-021). Y que cada cambio grande salga de **lo que pasó de verdad**, no de una impresión.
- **Los roles no se mezclan** (restricción dura 4 del `CLAUDE.md`): el observatorio **mide y propone**, con sus actas en `tips/`; la
  sesión madre y el dueño **deciden y aplican**.
- **Dónde va cada cosa** (ADR-025): vibe-kit es público, así que acá entra solo el comportamiento del método, en abstracto. Lo crudo va al
  repo privado de investigación **antes** de cerrar la madre: los chats, los hallazgos por repo y el diario. Eso incluye los nombres de
  los proyectos y de los clientes.
- **No es**: un rediseño por las dudas, ni la mensajería (misión 7), ni el día a día de un proyecto (eso vive en su registro de cambios).

## 2. El reloj y la fecha de corte

- **Una vuelta cada 3-4 meses**, y recién cuando la versión nueva lleva **un mes andando en un proyecto real**. Sin uso no hay nada que leer.
- **Puede arrancar antes** si se da alguna de estas tres:
  - pasa mucho uso sin volver al kit;
  - los registros de cambios de la flota muestran la misma regla en 3+ proyectos;
  - **sale algo grande de afuera**: una función nueva de Claude Code que reemplaza algo que el kit hace a mano (verificada en la doc
    oficial), o una tanda del Extractor con varias ideas que pasan la vara.
- **Lo urgente no espera la vuelta**: una cicatriz de seguridad, de producción o de plata sale como parche (`vX.Y.Z`, ADR-026) o
  como una `rc` quirúrgica (§7).
- **Cada vuelta lee desde el corte anterior**, nunca todo de nuevo. El corte de cada PC es el último mensaje leído: la columna
  `hasta` del `costos.csv`, el máximo. Se anota en el acta y en el `CORTE.md` privado, y la vuelta siguiente lee con `--desde <corte>`.

**La vuelta 1 y la que sigue** (cierra la 6b):
- **El corte de la vuelta 1, por PC**, es lo último que leyó la 6b: el **2026-11-15** en `Usuario` (el chat del director hasta las
  15:42 UTC) y el **2026-11-05** en `clientes`. Todo lo posterior entra a la vuelta 2: el director después de esa hora, el banco, la
  `rc.8`, la 6 y lo que se haya trabajado en `clientes` desde el 05/11. Está copiado tal cual en el `CORTE.md` privado.
- **La vuelta 2 arranca el 2027-03-01**, unos 3½ meses después del corte, o antes por uno de los disparadores. Mide la `v3.0` y,
  si ya salió y lleva un mes andando, la `v3.1`.
- **La `v3.1` (misión 7) no esperó la vuelta.** Iba a juntar el buzón, "probar una idea nueva" y el PO, siguiendo §6 desde el paso 1.
  No fue así: la `3.1.0` salió con `reflexion` y el buzón (ADR-041), y el PO y "probar una idea nueva" pasaron a la `3.2.0`
  (ADR-042 a ADR-044). Las dos salieron finales "en piloto", sin `rc` ni banco, cada una como excepción con su ADR (ADR-041 y
  ADR-044); desde ADR-046 (2026-11-22) eso es **la vía corta** (§6), escrita como regla. El "investigar" del buzón fue solo de afuera (la plataforma y cómo se hace la mensajería hoy), sin releer chats; el del PO relevó
  dos sesiones reales (ADR-042).
- **La medición de la `v3.0` contra su línea base** (§5.6) va al mes de la versión, alrededor del 2026-12-15, con la corrida mensual.
  Es el primer insumo de la vuelta 2.
- **Quién arranca**: la madre, con `/inicio` en vibe-kit, cuando el TODO lo diga; lee este documento, §5 y §6. Las tres fechas (la
  medición del 2026-12-15, la vuelta 2 del 2027-03-01 y el corte por PC) están en `docs/TODO.md`, en "El ciclo".

## 3. Cómo se decide

Una sola vara para todo el ciclo, esté el dueño o no. Viene de ADR-030 y ADR-034; acá solo se apunta:
- **Las cuatro cosas del dueño** (workflow, mejor código, consistencia, acordarse de menos) **más la coherencia entre piezas**, con
  la etiqueta en la decisión. Si no mueve ninguna, sobra.
- **El filtro pragmático**: ¿es un error real o es por las dudas? ¿El costo se paga? De desempate, los 11 criterios de
  [`mision-4/PLAN.md`](mision-4/PLAN.md). Y el ADR-029: **contra accidentes, no contra trampas**.
- **Lo técnico que no le cambia el día al dueño lo decide la sesión** y lo anota en criollo, con las decisiones que le afectan arriba.
  Al dueño le llega solo lo que le cambia algo, dicho como **qué cambia en su día**.
- **Cómo se le presenta una decisión**:
  - primero **el cuadro conceptual**: qué sigue igual, qué cambia y quién lo hace;
  - después, de a una, con la recomendada primero y qué de sus cuatro cosas mueve;
  - si la decisión es grande, **por partes**: qué pasaba, qué cambia, qué mueve y la recomendación. Así se contesta con una frase.

  Siete partes en renglones sueltos llevaron 22 h de calendario y una segunda explicación (2026-11-11).
- **Lo que no se poda con datos chicos**: una pieza pensada para proyectos grandes no se saca porque no se usó en proyectos chicos.
  El dueño revirtió así la poda de `/tramo` (2026-11-11).
- **Si con eso no alcanza, no se decide**: va como pregunta, con opciones y la recomendada, y la sesión sigue con lo demás (§8, "las preguntas").

## 4. Quién hace qué, y en qué modelo

| Rol | Qué hace | Modelo |
|---|---|---|
| **El dueño** | Decide lo de diseño, sella el SPEC-0 y el spec de la candidata, y da el OK de publicar, el OK por repo para poner al día sus proyectos y los clics de firma | — |
| **La madre** (sesión de vibe-kit) | Charla con el dueño, escribe el plan del tramo con sus prompts y lanza al director | Opus; Fable si la charla diseña |
| **El que decide y escribe lo pensado** | El SPEC-0, el spec de cada candidata, las sesiones de la revisión de la candidata (la fricción y el sistema) y la última `rc` | **Fable**, esfuerzo alto, como sesión principal |
| **El director de un tramo** | Activa las sesiones en fila, verifica cada una en disco, integra el tracker y deja cierres parciales. No escribe código ni specs | Opus |
| **El que ejecuta lo decidido** | Las tandas de construcción, la sesión de la integral, el banco y las `rc` del uso | Opus; los arreglos chicos y mecánicos, Sonnet (ADR-029) |
| **Red team, revisor frío, los tres revisores de la integral** | Son subagentes: leen sin contexto y traen hallazgos con escenario | Opus, **nunca Fable** |
| **Lectores, corridas largas, encargos mecánicos, obreros de una noche** | Leen, corren la suite o la flota, construyen lo que no pide criterio | Sonnet |

- **Fable rinde donde se piensa.** El spec de la `rc.7` salió en ~56 min de trabajo, con 5 lectores, dos rondas de red team y 22
  decisiones técnicas tomadas solo, y le hizo **una sola pregunta** al dueño. Las miradas de la revisión de la `rc.7` tardaron
  20-35 min cada una, y la primera trajo 73 puntos de fricción. Opus cumple igual de bien ejecutando lo que ya está decidido.
- **Lo que la app deja y lo que no** (medido en la app de escritorio entre el 2026-11-11 y el 15; en la extensión de VS Code está
  **NO VERIFICADO**):
  - **Una sesión lanzada por otra no puede arrancar sesiones solas**: le queda una tarjeta que el dueño arranca con un clic, o
    lanzarlas cuando el dueño se lo pide en su propio chat. Por Remote Control tampoco se abren sesiones (2026-11-03): la madre usó subagentes.
  - **Pedir un modelo más caro que el del que lanza se ignora sin aviso**: la sesión nace con el modelo del que la lanzó. Se corrige
    con `set_session_model` y reenviando la tarea, y **se verifica siempre con `get_session`**. Pasó tres veces: el spec de la `rc.7`
    corrió 4 min en Opus, las miradas nacieron en Opus y esta misma 6b corrió en Opus.
  - **Una sesión abierta en espera y activada con un mensaje anda sin clic** (2026-11-15: la del banco arrancó así).
  - **Los mensajes a una sesión ocupada esperan a que termine su turno**, y una sesión desenganchada no avisa sola cuando termina (§8).
- **El dueño trabaja en la extensión de VS Code.** El tramo con director es una herramienta de la madre (vibe-kit), no del kit que se
  instala. Si la app no está, el plan del tramo sirve igual: el dueño abre cada sesión con el prompt de su sección.

## 5. La vuelta, paso a paso

| # | Paso | Entra | Sale | Disparador |
|---|---|---|---|---|
| 1 | **Investigar** | Desde el corte: lo de adentro (chats, registros de cambios, scripts) y lo de afuera (el Extractor, la plataforma, otros métodos) | Un acta en `tips/`, las líneas base medidas y las ideas con su veredicto | El reloj (§2) |
| 2 | **Ordenar la casa** | El repo como quedó | El repo prolijo, lo crudo en el privado y **la dimensión del paso siguiente**: cuántas sesiones, qué modelo, qué presupuesto | El acta cerrada |
| 3 | **Diseñar con el dueño** | El acta y las líneas base | Un diseño por racimo, y el SPEC-0 READY | La casa ordenada |
| 4 | **Construir** | El SPEC-0 | La versión en `main`, con pruebas | El SPEC-0 READY |
| 5 | **La beta y las revisiones integrales** | El kit entero | La beta `rc.1`, una o dos revisiones con su tanda y las `rc` que salen de ahí | El último paquete |
| 6 | **Probar en un proyecto real y medir** | La beta | Lo que mostró el uso, las `rc` quirúrgicas, la candidata, el banco, la versión final y la medición | La beta en `main` |

La versión (los pasos 4 a 6) se sigue con §6. Cada paso escribe **su disparador y su salida**: en la vuelta 1, los pasos los disparó el
dueño con una pregunta ("¿cuántas sesiones?", "es un gran momento para probarlo"), no el plan.

### 5.1 Investigar

Mira **para los dos lados con el mismo peso**. Lo de adentro dice dónde duele, y lo de afuera, con qué curarlo sin inventarlo. El
detalle está en [`observatorio/investigacion/METODO.md`](../observatorio/investigacion/METODO.md).

**Hacia adentro, en este orden:**
1. **Los experimentos de método de la flota**, si hay: son la prueba más directa (llegan con la misión 7). Los lista `pruebas-flota.cjs --para-absorber` (lo corre el `/inicio`).
2. **Lo gratis**:
   - la corrida mensual (`flota.py`, `huella.py`, `repos.py`, `costos.py`: ~25 min y casi cero tokens);
   - **los registros de cambios de método de cada proyecto**, más baratos y más precisos que los chats;
   - **las bitácoras de las noches** (§5.6) y los informes que dejó cada sesión del tramo, con su "Resumen para el director".
3. **Cruzar dos fuentes baratas** antes de leer nada caro.
4. **Los chats, solo para lo que lo anterior no contesta**, con el costo dicho antes:
   - condensados y repartidos en lotes de ~200-300 KB, **un lector Sonnet por lote** con un brief de preguntas y un `ya-sabido`;
   - el brief de la 6b está en el privado, en `mision-6/lectura-6b/LECTOR-ciclo-6b.md`;
   - seis lectores leyeron ~1,7 MB en ~6 min de reloj.
5. **Verificar en disco lo fuerte** antes de escribirlo: lo del lector es dato, no verdad. El acta pasa por gitleaks, por una búsqueda
   de nombres y por el ojo del dueño.

**Hacia afuera**: el Extractor de tips (las actas desde el corte, con sus `- [ ]` abiertas), las novedades de Claude Code verificadas
contra la doc oficial con techo de búsqueda, y los métodos de otros ([`mision-4/REFERENCIAS-EXTERNAS.md`](mision-4/REFERENCIAS-EXTERNAS.md)).
**Cada idea pasa dos filtros**: la vara (§3) y la curaduría del menú (restricción 2 del `CLAUDE.md`). Si además coincide con un dolor
medido adentro, va primero.

### 5.2 Ordenar la casa

Una sesión Opus, sin decisiones nuevas, entre investigar y diseñar, y otra vez entre diseñar y construir. Se ordena todo esto:
carpetas, nombres, el índice y las lápidas en `legacy/`, lo crudo al privado, el diario, un parche si hay una cicatriz pendiente, y
**el plan del paso siguiente con su dimensión**.
- **Anda sola si las decisiones ya están escritas.**
- **"Ordenado" se mira renderizado, desde afuera**: la portada de GitHub llevó tres vueltas más.
- **La dimensión se pregunta al abrir, no al cerrar.**

### 5.3 Diseñar con el dueño

Es el paso donde más participa el dueño y el que menos tokens gasta. Cada racimo lleva una sesión en Fable y sigue esta receta:
1. **Un lector barato mide cómo se usa hoy** la pieza en los proyectos reales, y se verifica la plataforma contra la doc oficial.
2. **Las decisiones, de a una**, como dice §3.
3. El `DISENO-<racimo>.md` cierra con la tabla de los 11 criterios.
4. **El revisor frío** (Opus sin contexto) trae 25-45 hallazgos por racimo. Cada uno pasa por el criterio ya establecido antes de
   aplicarse, y siguen las notas cruzadas, el `/cierre` y un chat nuevo.

Al terminar los racimos hay una revisión integral de todas las decisiones, y **el SPEC-0, con red team y revisor frío** antes del sello del dueño.

### 5.4 Construir

El cómo vive en el tracker de la versión, en "Cómo se trabaja", y en estos ADR:
- **ADR-028**: un director Opus por paquete, con encargos.
- **ADR-029**: el presupuesto. Son ~4 h y ~8 encargos por sesión, una ronda de red team, una vuelta de revisor frío con escenario del
  día normal, y la mutación solo la primera vez que se construye una pieza que decide un freno, con tope de 20 min. Nunca en los
  arreglos del revisor; para las `rc`, ver §7.
- **ADR-030** y **ADR-034**: cómo se decide sin el dueño.

La secuencia que se repitió es esta: el spec delta (lo redacta un subagente Opus) → el red team si toca un freno → **el sello por
script** → los encargos en worktrees, **por archivos que no se pisan** → el director lee cada diff y corre las pruebas → el revisor
frío → los arreglos en un encargo → la suite una vez al final → `/cierre`, que **deja armado el prompt siguiente**. Lo que se decide
sin el dueño queda en criollo desde el director que lo decidió: si no, se junta una deuda de comprensión (llegaron a ser ~150 decisiones).

### 5.5 La beta y las revisiones integrales

**La revisión integral es paso fijo** (ADR-034). Va al terminar de construir, antes de usar la beta, y otra vez antes de la versión
final. Es solo de lectura y trae **tres miradas en paralelo**, cada una de un revisor Opus sin contexto:
1. el día del dueño de punta a punta;
2. la coherencia, que mira lo decidido contra el código y las piezas entre sí;
3. la documentación contra el código.

Cada hallazgo trae su escenario. El informe va en criollo, separado en **"te afecta"** y **"de taller"**, y arriba lleva el veredicto en tres líneas.

- **Siempre sobre un clon real, desde la primera.** R1 corrió sobre repos de prueba prolijos y no vio lo que R1b vio en un clon
  real, horas después: el director propio del proyecto, su `venv`, la carpeta dos niveles abajo y un gate que daba verde sin correr.
  Si R1 hubiera ido sobre el clon, alcanzaba con una sola.
- **Revisar son minutos, corregir son horas**: cada revisión tardó entre 5 y 20 min de reloj, y su tanda de corrección, 4-5 h y 8
  encargos. Después de cada revisión va **una sola tanda**, con nivel de control (§7); lo de diseño queda para el dueño.
- **No más de dos antes de usar.** Una tercera sin uso real busca en el mismo lugar ("no hay que hacer 800 revisiones integrales", el
  dueño). La integral final (R2) va con el uso ya hecho, sobre la candidata y **con una noche de prueba adentro** (§6, paso 12).

### 5.6 Probar en un proyecto real y medir

Cierra lo que la 6a dejó para la 6b. Lo que se decidió y lo que enseñó la vuelta 1:

- **La prueba es en un proyecto de verdad, con trabajo de verdad** (el dueño, 2026-11-03), no un piloto de juguete. **Se adopta
  primero en un clon**: así tardó ~23 min y lo decidió el dueño con un "sí", y recién después en la carpeta real.
- **La escalera de pruebas**: cada peldaño ve lo que el anterior no.

  | Peldaño | Qué ve | Ejemplo de la v3 |
  |---|---|---|
  | La suite | Cada pieza por separado | Nunca dio solo verde: siempre trajo 1 o 2 fallas reales |
  | El chequeo frío o el revisor sobre un repo de prueba | El recorrido entre piezas | El gate del cierre de tramo daba rojo siempre |
  | La flota de prueba | Poner al día un repo | El `\r` de Windows; dos pruebas de hooks que miraban fuera del molde |
  | La flota contra un clon real | La historia y lo propio de un proyecto | Skills sobre el tope, `.pyc`, ramas de antes |
  | **Una noche real con director** | Los tiempos, las esperas, el entorno del dueño y su cansancio | ~12 cosas que ningún peldaño vio |
  | **La noche de prueba en un clon real** | Que termine y publique sola, sin dueño | El permiso propio ancho que traba el cierre |
  | **El banco: copias de todos los repos** | Lo mismo en todos a la vez | Sobre la `rc.7`, 26 copias: un repo sin pruebas no tenía noche ni flota (13 de 19 adoptados) y ninguna noche se cerró sola; sobre la `rc.8`, las dos noches terminaron y publicaron solas |

  Los repos de prueba se arman parecidos a los reales (historia larga, método propio, `.gitignore` genéricos), pero **no reemplazan a los reales**.
- **Cada noche real lleva una bitácora de método**: `notas-del-metodo.md` en el proyecto, una línea por traba (hora, qué pasó, qué
  hice, PARADA sí o no) y las notas de cada cierre. Se commitea con cada merge. La primera noche dio más de 40 líneas, y fueron lo
  mejor que se leyó (2026-11-10).
- **Dos lectores independientes leen cada noche**: lo que dice la sesión del proyecto y lo que se mide en su repo. Se corrigieron
  tres veces entre ellos.
- **El proyecto que mide queda congelado**: no se actualiza hasta que termine la noche, así la prueba mide una sola cosa.
- **Una noche que corta antes de publicar no prueba el final.** Las dos noches reales dejaron el cierre y el deploy para la mañana, y
  ahí aparecieron los frenos.
- **Cada `rc` cuenta cuántas tareas a mano le deja al dueño**: en las noches reales fueron siete y cuatro, y R2 encontró seis lugares
  que todavía lo mandaban a tipear.
- **Cuándo se pasa de juntar a una `rc` candidata**: cuando una prueba real cerró y lo juntado tiene un objetivo dicho en una frase
  medible. El de la v3: *"el dueño no tipea nada y una noche termina sola"*. Antes de eso, "seguimos juntando" (el dueño, 2026-11-11).
- **Lo que solo ve el uso real** (para mirarlo a propósito):
  - el entorno del dueño: su carpeta principal contra los worktrees, la carpeta no confiable, el clasificador del modo `auto`, su terminal PowerShell;
  - lo que la plataforma hace y no avisa: la compactación, el aislamiento del worktree heredado por los subagentes;
  - los tiempos de verdad: en la noche real, 41 min por encargo contra 23 estimados.

  **Una hipótesis no se escribe como hecho**: la compactación del director tuvo cuatro explicaciones en 24 h, y cada una entró al
  tracker antes de la siguiente.
- **Medir contra la línea base**: la corrida mensual (`flota.py`, `huella.py`) al mes de la versión, comparada con la línea base que se
  midió antes de construir. La de la v3 es del 2026-11-03: la tabla pública está en
  [`observatorio/investigacion/mediciones/2026-11-03.md`](../observatorio/investigacion/mediciones/2026-11-03.md), y cómo se corre, en
  `METODO.md`, "La corrida mensual". La de la `v3.0` va alrededor del 2026-12-15 (§2).

## 6. Cómo sacar una versión nueva

La receta de punta a punta. Es la secuencia de la v3 sin las vueltas que se dieron (§11 cuenta cómo fue de verdad). El presupuesto
de cada paso sale de lo medido en la v3. Para planear: pasarlo es una señal para mirar, no para cortar.

**Qué vía toca** (ADR-046, 2026-11-22). Hay dos caminos, y antes de arrancar se elige uno:
- **La vía corta, versión final "en piloto"**: cuando la versión **suma piezas** (skills, scripts, verbos, piezas opcionales que
  llegan apagadas) y **no cambia cómo se comporta lo que ya anda**. Pasos fijos antes del tag: las pruebas de cada pieza · un
  revisor frío sobre lo integrado · la suite entera · una vuelta de la flota de prueba (alfa, beta y gama desde una versión vieja) ·
  red team de toda regla `allow` o freno nuevo. Sale marcada "en piloto" en `kit/CHANGELOG.md`; lo que encuentre el uso real va a
  una x.y.1. Así salieron la 3.1.0 y la 3.2.0.
- **La vía larga, la tabla de abajo entera, con `rc` y banco**: obligatoria cuando la versión **cambia un freno o una barrera que ya
  existe, el actualizador, la adopción o la flota**, o cuando es **una vuelta del ciclo** (la versión que sale de medir e investigar).
- **En la duda, la larga.** Cada versión dice en su entrada de `kit/CHANGELOG.md` por cuál vía salió.
- **Sin decidir todavía**: cómo sale un arreglo x.y.1 que toca una barrera o el actualizador (los 16 pasos no le calzan).
  Recomendado: una `rc` quirúrgica (§7) más el banco. Está en el TODO.

La tabla es la vía larga:

| # | Paso | Quién y en qué modelo | **Qué hace el dueño** | Sale | Presupuesto |
|---|---|---|---|---|---|
| 1 | **El objetivo en una frase medible**, y la línea base medida | La madre (Opus) | Dice qué quiere y lo afila con la madre | El brief y la corrida mensual | Una charla y ~25 min de scripts |
| 2 | **El SPEC-0** (§5.3) | Fable, con lectores Sonnet; red team y revisor Opus | Decide de a una y sella | SPEC-0 READY | Una sesión por racimo (~3-9 h); en la v3, 14 días |
| 3 | **Construir por paquetes** (§5.4) | Un director Opus por paquete | Nada; al final repasa en criollo las decisiones que le afectan | Todo en `main`, con pruebas | ~4 h y ~8 encargos por director (ADR-029) |
| 4 | **La beta `rc.1`**: la suite sola, la flota de prueba y el tag | El último director | Nada | `vX.0.0-rc.1` | Una sesión |
| 5 | **R1 sobre un clon real** (§5.5) y su tanda | Tres revisores Opus; la tanda, un director | Lo de diseño que la tanda le deje | `rc.2` | ~30 min + 4-5 h |
| 6 | **El uso real**: adoptar en un clon y después en la carpeta, con bitácora. Cada lote, una `rc` quirúrgica (§7), **de a una** | Las `rc`, sesiones Opus | Trabaja con la beta y cuenta lo que molesta; da el OK de adoptar | `rc.3…` | 1-2 semanas; cada `rc`, 1,5-4 h según su nivel |
| 7 | **Una noche real con director** (o el uso de punta a punta que la versión prometa), con el proyecto congelado | El director del proyecto; dos lectores Sonnet la leen | La lanza, y a la mañana lee el parte | La bitácora y lo que falló | Una noche |
| 8 | **La revisión de la candidata**, en paralelo: dos sesiones Fable (la fricción y el sistema), pruebas cortas Opus, lectores sobre **los repos reales que ya usan el kit** y **el banco, vuelta 1** | Una sesión por pieza, cada una con su archivo | Nada | Los informes, con su resumen arriba | ~1 h las miradas y los repos; el banco, ~4 h (26 copias y dos noches) |
| 9 | **La charla** (§3) y **el plan del tramo** con sus prompts (§8) | La madre; abre las sesiones en espera (§8) | Decide de a una y dice "lanzá" antes de irse | Lo decidido y `<versión>/TRAMO-...-PLAN.md` | ~2 h de charla |
| 10 | **El spec de la candidata** | Fable; lectores Sonnet; red team Opus | Lo sella | El delta READY, partido en tandas que no se pisan | ~1-3 h |
| 11 | **Las tandas** (§7). La última: la suite sola, la flota de prueba, un clon real y el tag | Opus, en fila | Nada (si el clasificador frena `kit-sync`, pega una línea) | La `rc` candidata | ~4 h por tanda; el spec dice cuántas |
| 12 | **R2, la integral final, con una noche de prueba** en un clon real: sin dueño, sin llaves y con publicar de mentira. Mide el criterio de éxito | Opus; tres revisores Opus | Decide si sale o va otra `rc` | El veredicto | ~3 h |
| 13 | **La última `rc`**: todo lo de R2 y del banco, quirúrgico (§7) | **Fable** decide y escribe; Opus revisa; Sonnet corre | Nada | `rc.N` | ~6 h (la `rc.8`: ~6,5 h) |
| 14 | **El banco otra vez**: el veredicto final | Opus; lectores Sonnet | Pasa a fase 2 por escrito lo que no se pudo medir | "Sale / no sale" | ~3 h (en la v3: ~3,3 h) |
| 15 | **La versión** (abajo) | Opus | **El OK de publicar** y el OK por repo para poner al día sus proyectos | `vX.0.0` | ~4 h (en la v3: ~1 h sin la flota real) |
| 16 | **Al mes, la medición** contra la línea base (§5.6) | La corrida mensual | Nada | El primer insumo de la vuelta siguiente | ~25 min |

**Lo que hace el dueño en toda la versión**: decidir lo de diseño (pasos 1, 2, 9 y 12), sellar dos specs, decir "lanzá" una vez por
tramo, trabajar con la beta, y dar los OK de publicar y de su flota. Todo lo demás lo hacen la madre y el director.

- **El banco va en el paso 8, no después de R2.** En la v3 nació después de R2, porque R2 probó un solo repo real y ahí aparecieron tres
  de sus cinco grandes. Ahora que el script existe (`pruebas/banco/`), su vuelta 1 entra en la revisión de la candidata: lo que
  encuentre va al spec y no a otra `rc`. El banco del paso 14 queda como veredicto.
- **Pasos fijos de la vía larga, porque fueron los que encontraron problemas de verdad**: revisar sobre un clon real, el banco, el revisor frío, y la
  suite y la flota de prueba antes de cada tag.
- **Lo que sale, con su razón**:
  - *una tercera revisión integral antes de usar*: busca en el mismo lugar, y lo que falta lo muestra el uso;
  - *revisar solo sobre repos de prueba*: R1 no vio lo que R1b vio horas después en un clon;
  - *la receta completa en una `rc` del uso*: la `rc.4` y la `rc.5` llevaron 10 y 15,5 h; ahora el nivel va por cambio (§7);
  - *dos `rc` que se esperan el tag*: horas perdidas; ahora van de a una, o se juntan;
  - *la noche en el proyecto real del dueño como prueba de salida*: toca lo real, mide un solo repo, y el cierre lo terminaba el dueño a
    mano. La reemplazan la noche de prueba en un clon (R2) y el banco. La noche real sigue como uso (paso 7);
  - *la madre que corre las tandas como subagentes*: va todo en un solo contexto, que se compactó dos veces, y el dueño no ve ni puede
    frenar cada pieza. Ahora son sesiones en fila con un director;
  - *el clic del dueño para cada sesión*: de noche la fila quedó parada ≥8 h. Ahora se abren en espera al principio;
  - *leer los chats dos veces, con otra lente*: en la vuelta 1, ~66 M. Ahora hay una lectura por pregunta, con un brief y lotes condensados.
- **El banco es inocuo, sí o sí**:
  - la foto de cada carpeta real antes y después (`HEAD`, rama, `git status`);
  - los clones con su `origin` apuntando a un `bare` local, y el script se niega a hacer `push` fuera del banco;
  - nada de `.env` y un HOME de mentira (`KIT_HOME_PC`, `GH_CONFIG_DIR` vacío y sin `GH_TOKEN`);
  - las skills que publican, fuera, y el publicar, de mentira.

  Tiene dos vueltas. La primera, barata, va en todos los repos: preparar la PC, adoptar o poner al día, `adoptar --verificar`, sus
  pruebas, un `/inicio` y un pedido chico. La segunda, cara, va en 2 o 3 repos elegidos con variedad: un módulo con director y la noche
  entera. Plan: [`kit-v3/TRAMO-FINAL-PLAN.md`](kit-v3/TRAMO-FINAL-PLAN.md), sesión 5a. Lo que midió, en [`kit-v3/BANCO-rc7.md`](kit-v3/BANCO-rc7.md) (la vuelta 1, sobre la candidata) y
  [`kit-v3/BANCO-rc8.md`](kit-v3/BANCO-rc8.md) (el veredicto).
- **La versión (paso 15)**:
  1. `kit/VERSION` y la nota de migración en `kit/CHANGELOG.md`, en un commit sobre el código de la última `rc` (`VERSION` se sube
     en el commit que lleva el tag: `kit/CHANGELOG.md`, arriba);
  2. el tag anotado sobre ese commit;
  3. **publicar (el push del commit y del tag) con el OK del dueño**, y después `kit-sync.sh sync` hasta `LIMPIO`;
  4. **la flota real, con OK por repo**: antes de pedirlo, mirar contra el molde los scripts del kit que el repo tocó a mano. G1 de R2:
     un renglón tocado a mano deja el repo "mezclado". Junto al pedido va la lista de lo que cambia en cada repo, en criollo;
  5. la portada, la guía, los manuales y el TODO al día, y los specs marcados `✅ IMPLEMENTADO`;
  6. los chats al privado, el diario y `/cierre`.

  **Cómo salió en la v3** (2026-11-16):
  - el banco otra vez dijo *"sale, con una condición"*: los hooks de la PC seguían en la `rc.6` (los instala el dueño con "instalar
    hooks por PC": el clasificador del modo `auto` no deja que lo haga una sesión) y, después, una noche corta de confirmación
    (~17 min). **Para la próxima**: mirar los hooks de la PC antes del banco del paso 14 (`kit-sync` lo avisa desde la `rc.8`) y
    pedírselo al dueño ahí, no al final. Y el `kit-sync sync` va **antes** de instalar los hooks (el instalador toma la versión de
    `~/.claude/VERSION`): es local y no publica nada;
  - la sesión de la versión no tocó código: tres renglones de texto de las skills (sin códigos en `/inicio` y `/cierre`, el "todo en
    no" de la adopción), sin pruebas nuevas (las de los textos siguen pasando), y los manuales al día con lo que la `rc.8` y el banco le dejaron;
  - `kit/VERSION` y la nota se commitearon de noche, con el dueño durmiendo; el tag esperó su OK. Subir ese commit no publica: el
    actualizador baja el último tag anotado, nunca la punta de `main`;
  - los criterios que no se pudieron medir, el dueño los pasa a fase 2 por escrito con la lista del banco otra vez, cada uno con su porqué.
- **El presupuesto de una versión, para planear**: en la v3, del paso 8 al 12 (del 11 al 15/11), las sesiones trabajaron ~24 h en cuatro
  días de calendario, y el resto fue espera. Con las esperas cortadas (§8), del paso 8 al 15 debería entrar en ~3-4 días y ~25-30 h de
  sesiones (era el estimado de la 6b). **Lo medido en la v3**: del paso 8 al 15 (11 al 16/11), ~6 días de calendario y ~37 h de
  sesiones: las miradas y la charla ~4 h, el spec y las tandas ~16 h, R2 2,5 h, el banco ~4 h, la `rc.8` ~6,5 h, el banco otra vez
  ~3,3 h y la versión ~1 h. Con las sesiones abiertas en espera, del banco a la versión (5a a 6) corrió de un tirón en ~15 h de
  reloj, de la tarde a la madrugada y sin clics. **Para planear: ~5 días y ~40 h.**


## 7. Una `rc`: los arreglos quirúrgicos y su nivel de control

Una `rc` arregla, no rediseña. La idea es del dueño: *"¿no podemos hacer ajustes más quirúrgicos sin pasar por todo el ciclo?"*
(2026-11-04) y *"correcciones quirúrgicas usando a Fable"* (2026-11-15). La cicatriz que lo motivó: la `rc.4` "exprés" pagó la receta
completa y tardó 10 h contra las 2-3 estimadas, y la `rc.5` llevó 15,5 h de reloj, ~4 de ellas esperando el tag de la `rc.4`.

**La receta:**
1. **El delta corto**, en formato delta. Lleva la lista entera de arreglos, cada uno con:
   - su origen (el hallazgo y el informe);
   - **el arreglo quirúrgico**: la función o la regla que cambia, no un rediseño;
   - los archivos que toca y la prueba que lo cubre;
   - si toca un freno, y **su nivel** (la tabla de abajo).

   Lo que sea de diseño, o lo que no entre sin rediseñar, va a la versión siguiente con su razón. **No lleva el sello del dueño**:
   es un delta de arreglos (ADR-034). Lo de diseño se lo pregunta la madre o el director.
2. **Cada arreglo**: la prueba primero (que falle sin el cambio), el cambio, la prueba que pasa, **un commit chico y push**. Si toca un
   freno, lleva red team **de ese cambio** (Opus, una ronda) y mutación **solo de las reglas que cambió**, con el tope de 20 min del
   ADR-029. Los arreglos que salen del revisor frío de la misma `rc` van sin mutación (ADR-029, regla 3; ADR-035).
3. **Al final, de a una**:
   1. el revisor frío (Opus) sobre todo el diff;
   2. la suite entera, sola y en segundo plano;
   3. la flota de prueba y un clon real, o el banco, vuelta 1;
   4. el tag, **siempre después de la suite**;
   5. push y `kit-sync.sh sync`.

| Nivel | Cuándo | Qué corre | Reloj |
|---|---|---|---|
| **Liviano** | Textos, avisos, manuales, la guía, la nota de migración | Las pruebas de los archivos tocados (las de texto, y `skills.test` si toca una skill) | Minutos |
| **Medio** | Código que no decide un freno ni cómo se actualiza un proyecto | Lo del liviano + un chequeo frío corto (un revisor, el día del dueño) + la suite una vez + la flota contra **un** clon real | ~1,5 h |
| **Medio-alto** | Toca un freno o el actualizador, con un cambio acotado y el diseño ya hablado | Lo del medio + el red team **solo de lo que toca el freno** + la mutación en ese freno | ~2 h |
| **Completo** | Una pieza nueva, o un freno o el actualizador rediseñados | Todo: delta, red team, revisor frío, la suite, la flota en los repos de prueba y en los clones reales | ~4 h por tanda |

- **El nivel de cada cambio lo pone la sesión** (es técnico) y queda en la tabla del delta. La `rc` va con el más alto de sus cambios,
  o con el que pida el dueño.
- **Una `rc` por vez.** La `rc.5` esperó ~4 h el tag de la `rc.4`, y la `rc.6`, ~5 h el de la `rc.5`, porque tocaban los mismos
  archivos. La siguiente arranca del tag anterior, o se juntan las dos en una.
- **Nunca dos tandas pesadas a la vez en una PC** (suite y suite, suite y flota, mutación y suite). Todo tarda el doble y salen fallas
  de carga: la suite pasó de 50 a 102 min. **Tampoco adentro de una misma sesión**: la tanda A corrió a la vez la mutación, una prueba de
  28 min y dos subagentes, y midió los frenos con esa carga encima.
- **No se edita un archivo que una prueba en segundo plano todavía está usando**: salen fallas falsas (16 en una corrida). Cada
  archivo de prueba lleva su turno o su carpeta temporal propia, y las mutaciones van solas.
- **El tag espera a la suite, aunque apure.** La suite encontró fallas reales en la `rc.4` (1), la `rc.5` (2) y la `rc.7` (2), y la
  flota de prueba, un bug real en la `rc.4` y dos en la `rc.7`.
- **Cómo se corre cada cosa** (no se repite acá): la suite es `node --test "kit/**/*.test.cjs"` (~65 min sola en la `rc.7`); la flota de
  prueba, `bash pruebas/rehacer.sh` y la receta de la última `rc` en el tracker (~25-50 min por vuelta); el banco, `pruebas/banco/`.
  Los clones, siempre en el scratchpad.

## 8. Cómo se arma un tramo: el director y las sesiones en fila

Un tramo es una cadena de sesiones (una revisión, un spec, tandas, una integral) que corre **sin que el dueño empuje**. Lo armó así la
madre el 2026-11-11 y 12, y el director lo corrió del 12 al 15/11.

**El plan es un archivo, no una charla.** Va en `docs/<versión>/<TRAMO>-PLAN.md`. Los ejemplos son
[`kit-v3/REVISION-rc7-PLAN.md`](kit-v3/REVISION-rc7-PLAN.md) y [`kit-v3/TRAMO-FINAL-PLAN.md`](kit-v3/TRAMO-FINAL-PLAN.md). Lleva:
- **el objetivo en una frase medible** y lo ya decidido, que no se vuelve a discutir;
- **la tabla de sesiones**: número, título, modelo, cuándo arranca y **qué archivo escribe, solo ese**;
- **"dónde lo necesita al dueño"**: es la única lista de lo que se le pide, con cuándo y cómo. Todo lo demás lo decide la sesión;
- **las reglas comunes**: escribir solo lo suyo, subagentes nunca en Fable, evidencia o NO VERIFICADO, presupuesto, criollo, git;
- **una sección por sesión con su prompt**. Cada una se lanza con *"leé `<plan>`, tu sección es la N, seguila"*.

Si el plan choca con el handoff, manda el plan; si choca con "Cambios al plan" del tracker, manda lo que tenga fecha posterior.

**El director**:
- es **una sesión nueva** (Opus), no la madre que planeó: la madre ya se compactó y el tramo dura días;
- la madre lo lanza y **se desengancha**, para no archivarlo con ella ni despertarse en cada paso;
- **en fila, una por vez**, nunca dos pesadas a la vez. Antes de activar la siguiente, `git pull --ff-only` y chequear que no corra otra;
- **verifica en disco, no le cree a la nota**: `fetch`, los commits en `origin/main` con la identidad, que el archivo diga lo que dice,
  correr él las pruebas que la sesión dice que pasaron, gitleaks y el modelo con `get_session`. Así vio "2 h sin ningún commit" y un
  commit único gordo, y lo pidió distinto en la siguiente;
- **es el único que escribe el tracker y el handoff** del tramo, y deja un cierre parcial con cada sesión que cierra;
- **anota cada sesión en el diario** (fecha, reloj, modelo, tokens): las sesiones de un tramo no corren `/cierre`, y en el tramo final
  nadie lo hizo (el diario quedó en el 2026-11-05).

**Cómo arrancan las sesiones**, de mejor a peor:
1. **Abiertas todas al principio, en espera, con su modelo puesto y verificado.** El director activa cada una con un mensaje
   ("arrancá") cuando cierra y verifica la anterior, sin el clic del dueño (2026-11-15). **Las abre la madre antes de lanzar al
   director**, en el chat donde el dueño se lo pide, con el modelo verificado con `get_session` y antes de que el dueño se vaya. Las
   abre la madre porque abrirlas necesita las palabras del dueño, y el director, que lo lanzó otra sesión, no puede.
2. **La autorización escrita del dueño** en el chat del director ("cuando termine, lanzá la siguiente; no voy a estar"). El director
   las lanza él mismo (2026-11-14).
3. **Una tarjeta con el clic del dueño**: anda, pero de noche la fila se para hasta que se despierta (≥8 h el 13/11).

**Cada sesión del tramo**:
- **commits chicos y push por cambio**, y la lista de tareas al día: lo que ven el director y el dueño es eso;
- arriba de su archivo, **un "Resumen para el director"** de hasta 15 renglones: si terminó, qué cubrió y qué no, qué pruebas corrió y
  con qué resultado, qué espera al dueño y lo que más importa, en una línea. **Su último mensaje** es ese mismo resumen;
- si no termina, deja **una nota de relevo** en la carpeta compartida: qué queda, en orden, y "cosas que muerden". **Verificar que la
  nota quedó donde dice** (dos veces no estaba). Con la nota y el spec vivo ("Lo que salió al construir"), la continuación estuvo
  en el código a los 2 min, y otra retomó después de 19 h de pausa sin perder el hilo;
- **una pausa limpia**: todo en GitHub, el árbol limpio, la nota escrita y los procesos de prueba parados.

**Las esperas son lo más caro** (en el tramo final valieron más horas que el trabajo):
- **El director no se despierta solo**: la app no lo despertó cuando terminó una sesión y se perdieron ~1,5 h (2026-11-14). Le puede
  pedir aviso a la sesión que corre (`notify_when_idle`; **NO VERIFICADO** si alcanza), y si no, el dueño escribe "ya terminó".
- **Una pregunta de diseño a mitad de una sesión la frena**: el spec esperó 1 h 44 una sola respuesta. Las preguntas de diseño se
  juntan **antes**, en la charla, y la que aparezca después va con su recomendada mientras la sesión sigue. **Si la respuesta reabre
  un freno, lleva su red team en la tanda siguiente**: la del spec entró sin red team, y el de la tanda A encontró que un script podía
  firmar sin el clic.
- **Antes de que el dueño se vaya, todo lo suyo junto**: qué contestar, qué autorizar, qué clic falta.
- **La cuota**: cada sesión pesada gasta ~7-10 % de la semana. Las que importan se agendan antes de la renovación, y una pausa pedida
  (19 h el 13/11) se hace limpia.

**El tamaño de cada sesión**: ~4 h (ADR-029). **El spec dice de entrada cuántas sesiones son**: en el tramo final, "cinco, no tres",
con lo que va a la continuación de cada tanda. Así una continuación es parte del plan y no un accidente. El reloj de una tanda se va
casi todo en pruebas lentas. Las mutaciones de la `rc.7` tardaron 1-1 h 40 y pasaron el tope de 20 min del ADR-029, y las suites,
28-65 min. **La mutación va al final de la tanda, de una vez, solo de las reglas tocadas y con su tope.**
Las estimaciones fallan hacia los dos lados: la A, la B y R2 tardaron menos que lo estimado, y la continuación de la C, 5 h 37 contra 3-4.

## 9. Prompts para copiar

Se copian, se cambia lo que va entre `< >` y se pegan. Los de la v3, ya llenos, están en
[`kit-v3/TRAMO-FINAL-PLAN.md`](kit-v3/TRAMO-FINAL-PLAN.md) y [`kit-v3/REVISION-rc7-PLAN.md`](kit-v3/REVISION-rc7-PLAN.md).

**A · La madre arma el tramo** (lo pega el dueño en la sesión de vibe-kit, después de la charla):
> Dejá planeado el tramo `<de la candidata a la versión>` en `docs/<versión>/<TRAMO>-PLAN.md`, como dice `docs/CICLO-DE-MEJORA.md`
> §8: el objetivo en una frase medible, lo ya decidido, la tabla de sesiones (título, modelo, cuándo, qué archivo escribe), "dónde me
> necesitás" y una sección con su prompt por sesión. Después abrí todas las sesiones en espera, con el modelo de su fila verificado
> con `get_session`, y lanzá al director. Desenganchate.

**B · El director del tramo** (lo lanza la madre, en Opus):
> Sos el director del tramo `<nombre>`. Leé `docs/<versión>/<TRAMO>-PLAN.md` entero y `docs/CICLO-DE-MEJORA.md` §8. No escribís
> código ni specs. (1) Activás las sesiones de a una, con "arrancá" (ids: `<…>`); antes, `git pull --ff-only` y que no corra otra
> tanda pesada. (2) Cuando una vuelve, verificás en disco: los commits en `origin/main` con la identidad, el archivo, las pruebas que
> dice que pasaron (las corrés vos) y gitleaks. (3) Integrás el tracker y el diario (una fila por sesión) y dejás un cierre parcial.
> (4) Al dueño: cada paso en tres líneas, en criollo, y solo lo de "dónde me necesitás", de a una cosa. (5) Si una no terminó,
> abrís su continuación con "seguí desde: …"; si falla dos veces en lo mismo, parás y le contás al dueño con opciones.

**C · Una sesión del tramo** (cuando la abre la madre o el dueño):
> Leé `docs/<versión>/<TRAMO>-PLAN.md`: tu sección es la `<N>`, y seguila. No corrás `/inicio`: el OK ya está dado para esta tarea.
> Escribís solo lo de tu fila. Commits chicos y push por cambio; la lista de tareas, al día. Si no terminás, dejá la nota de relevo
> en `<carpeta de notas>` (y fijate que haya quedado). Tu último mensaje: el "Resumen para el director" (hasta 15 renglones).

**D · Una `rc` quirúrgica** (la sección de la última `rc` en el plan, o una `rc` del uso):
> Sos la `rc.<N>`. Traés corregido: `<la lista, con su informe de origen>`. (1) Primero, el delta corto
> `docs/<versión>/SPEC-<…>.md`, en formato delta: cada arreglo con su origen, la función o regla que cambia, los archivos, la prueba y
> su nivel (`docs/CICLO-DE-MEJORA.md` §7). Lo de diseño, o lo que pida rediseño, va a la versión siguiente con su razón. (2) Cada
> arreglo: la prueba que falla, el cambio, la prueba que pasa, un commit chico y push; si toca un freno, red team de ese cambio (Opus,
> una ronda) y mutación solo de las reglas que cambió, con tope de 20 min. (3) Al final, de a una: el revisor frío (Opus), la suite sola en segundo plano, la flota de prueba y
> `<un clon real | el banco, vuelta 1>`; si todo pasa, `kit/VERSION`, la nota de migración, el tag **después** de la suite, push y
> `kit-sync.sh sync`. Subagentes nunca en Fable. ~4-6 h; si no entra, la nota de relevo con lo que falta.

**E · La revisión integral** (R1 o R2):
> Sos `<R1|R2>`, la revisión integral de `<versión>`, solo lectura: el único archivo que escribís es `docs/<versión>/REVISION-<…>.md`.
> Corre **sobre un clon real** en el scratchpad (y sobre los repos de prueba). `<Solo R2: primero, la noche de prueba en el clon:
> sin dueño, sin llaves y con publicar de mentira contra un remoto `bare`; medís el criterio de éxito con su evidencia.>` Tres
> revisores Opus en paralelo y sin contexto: el día del dueño de punta a punta, la coherencia y la documentación contra el código.
> Hasta 10 hallazgos cada uno, con su escenario. Arriba, en criollo, el veredicto en tres líneas; después "te afecta" y "de taller",
> cada hallazgo grande o chico, con su arreglo.

**F · El lector de chats** (para investigar): el brief de la 6b sirve tal cual, cambiando las preguntas
(`vibe-research/mision-6/lectura-6b/LECTOR-ciclo-6b.md`). Va un lector Sonnet por lote de 200-300 KB, y al prompt solo se le suman
su lote y su archivo de salida.

**G · El banco**: su prompt es la sesión 5a de [`kit-v3/TRAMO-FINAL-PLAN.md`](kit-v3/TRAMO-FINAL-PLAN.md) (y la 5c para la vuelta del
veredicto), y su script, `pruebas/banco/` con su `LEEME.md`. La 5c corrió una copia con dos cambios (el pedido a Claude por la
entrada estándar y `--con-obra`) y dejó cinco arreglos para el script en [`kit-v3/BANCO-rc8.md`](kit-v3/BANCO-rc8.md), "Para el script
del banco": se hacen al principio de la próxima vuelta, antes de correrlo.

## 10. Plantillas

Son esqueletos; el ejemplo lleno de cada uno es el de la v3.

**SPEC de investigación** (ejemplo: [`SPEC-investigacion-chats.md`](SPEC-investigacion-chats.md)):
1. el estado y el origen (la frase del dueño), y el porqué (el dolor, con su número);
2. el alcance, lo que entra y lo que no, con su razón;
3. las preguntas, y a quién le sirve cada una;
4. las fuentes de adentro y de afuera;
5. cómo se hace (condensar, lotes, lectores, síntesis, con el corte `--desde`);
6. **el presupuesto con tres opciones y lo que contesta cada una** ([`mision-6/PLAN-6a.md`](mision-6/PLAN-6a.md) §3);
7. la salida, los criterios de aceptación y los riesgos (secretos, nombres, un filtro que falla callado).

**PLAN de diseño** (ejemplo: [`mision-4/PLAN.md`](mision-4/PLAN.md)):
1. el foco: los objetivos con su línea base;
2. los criterios de cada pieza;
3. los modelos y los tokens por rol;
4. los tramos y el brief del tramo siguiente;
5. las lecciones.

**Tracker de construcción** (ejemplo: [`kit-v3/PLAN-construccion.md`](kit-v3/PLAN-construccion.md)):
1. cómo se trabaja y la vara;
2. **el estado de un vistazo, con el contador**;
3. los directores, con su fila de reloj, encargos, tokens y commit, y sus decisiones en criollo;
4. pendientes, NO VERIFICADO y los criterios del producto;
5. cambios al plan (fecha, qué, por qué) y lecciones.

**Plan de un tramo** (ejemplo: [`kit-v3/TRAMO-FINAL-PLAN.md`](kit-v3/TRAMO-FINAL-PLAN.md)):
1. el objetivo en una frase y lo ya decidido;
2. la tabla de sesiones (título, modelo, cuándo, qué escribe);
3. "dónde lo necesita al dueño";
4. las reglas comunes;
5. una sección con su prompt por sesión (§8).

**Spec delta de una `rc`** (ejemplos: `kit-v3/SPEC-paquete-8c.md` y `8d.md`):
1. el estado y el nivel de la `rc`;
2. el cuadro conceptual;
3. la tabla de cambios (origen, arreglo, archivos, prueba, nivel, tanda);
4. "probar antes de prometer", cada prueba con su plan B;
5. las decisiones de la sesión;
6. lo que esto no cierra;
7. **"Lo que salió al construir"**, una por tanda, con su "Resumen para el director".

**El "Resumen para el director"** (hasta 15 renglones):
1. si terminó, y qué cubrió y qué no;
2. qué pruebas corrieron, con qué resultado;
3. qué espera al dueño;
4. lo que más importa, en una línea.

**La nota de relevo** (en la carpeta compartida):
1. qué entró, con el commit;
2. qué queda, en orden;
3. lo que la sesión siguiente tiene que saber;
4. "cosas que muerden".

**El prompt de arranque "sin el dueño"**:
1. el alcance numerado y la PC;
2. el presupuesto y qué hacer si no alcanza;
3. la revisión con tope;
4. qué no se toca;
5. qué se mide y dónde;
6. al terminar: la fila, las decisiones en criollo, el prompt siguiente y `/cierre`.

**La bitácora de una noche** (`notas-del-metodo.md` en el proyecto):
1. una línea por traba: `HH:MM · qué pasó · qué hice · PARADA sí/no`;
2. abajo, las notas de cada cierre, con las intervenciones del dueño contadas.

**Fila del diario de misiones** (privado): fecha y hora, misión y paso, qué se hizo, PC, chat, modelo, horas de reloj, encargos por
modelo, nuevos, caché, subagentes y commit.

---

# Anexo: cómo fue la v3 (para consultar, no para seguir)

## 11. Cómo lo hicimos en la v3: de la beta a la versión

El detalle de cada `rc` está en [`kit/CHANGELOG.md`](../kit/CHANGELOG.md) (su nota de migración) y en el tracker
[`kit-v3/PLAN-construccion.md`](kit-v3/PLAN-construccion.md), en "Cambios al plan". Acá va el resumen.

| Versión | Fecha | Qué trajo | De dónde salió | Reloj |
|---|---|---|---|---|
| `rc.1` | 03/11 | La beta: el molde v3 entero y el paquete 8b | El repaso de las ~150 decisiones sin el dueño (17 renglones) | ~6,7 h |
| `rc.2` | 04/11 | Que las piezas se hablen entre sí | R1 (tres revisores en repos de prueba) | ~4,6 h |
| `rc.3` | 04/11 | El kit contra un proyecto real | R1b (sobre un clon real) | ~5 h |
| `rc.4` | 04/11 | Adoptar un repo con un `docs/` ajeno; los `.pyc` | La primera mañana de uso real (12 hallazgos) | ~10 h ("exprés") |
| `rc.5` | 04/11 | El uso real, vuelta 1: una sola ventana, la flota con obra, el merge de `main` | El primer uso en dos proyectos | ~15,5 h (~4 esperando el tag de la `rc.4`) |
| `rc.6` | 05/11 | El obrero de cierre de tramo; a `main` sube solo el director | El uso real, vuelta 2, y una decisión del dueño | ~13,5 h (~3,5 de trabajo; el resto, el tag de la `rc.5` y un revisor cortado) |
| — | 09-11/11 | Dos noches de director en un proyecto real | — | 8 h la primera, sin intervenciones |
| `rc.7` | 14/11 | La candidata, en ocho partes: la noche termina sola, aprobar con un clic, `/estado` del dueño, sin comandos, adoptar sin romper | La revisión de 4 sesiones, la charla, el spec en Fable y 5 sesiones de obra | 11/11 al 14/11 |
| R2 | 14-15/11 | El veredicto: va una `rc.8` (cinco grandes, todos chicos de arreglar) | La noche de prueba en un clon real y tres revisores | 2,5 h |
| `rc.8` | 15/11 | Todo corregido: los cinco grandes de R2, los dos del banco (un repo sin pruebas, los hooks de la PC sin aviso) y ~24 chicos; red team, revisor frío y mutación (28 de 28) | R2 y el banco (5a) | ~6,5 h, en Fable |
| `v3.0` | 16/11 el commit; el tag, con el OK del dueño | El código de la `rc.8`, más tres renglones de texto de las skills y los manuales al día | El banco otra vez (5c): sale, con los hooks de la PC al día y una noche corta | ~1 h |

**Lo que haríamos distinto** (ya está en §6 y §7):
- **R1 sobre un clon real**, y no R1 más R1b.
- **Las `rc` del uso, de a una y quirúrgicas**: seis `rc` en tres días costaron ~55 h de reloj, y ~15 se fueron esperando el tag de
  otra `rc` o un revisor cortado.
- **El banco antes del spec de la candidata.**
- **Lo que el dueño pidió no se corre de versión**: el obrero de cierre pasó por la `rc.1`, `rc.2`, `rc.3` y `rc.4` hasta entrar en la `rc.6`.
- **Las sesiones abiertas en espera desde el principio del tramo.**

**Lo que la 6b le cambió al ciclo** (2026-11-15). Cada cambio con lo que mueve de la vara (ADR-030 y ADR-034):

| Cambio | Mueve |
|---|---|
| "Cómo sacar una versión" en una sola tabla, con qué hace el dueño en cada paso y su presupuesto (§6) | workflow · acordarse de menos |
| El banco como paso fijo y antes del spec de la candidata (§6, ADR-035) | mejor código |
| Las `rc` quirúrgicas de a una, con el nivel por cambio (§7) | workflow · mejor código |
| El tramo con un director y las sesiones abiertas en espera (§8, ADR-035) | workflow · acordarse de menos |
| El modelo de cada rol, y verificarlo después de lanzar (§4) | consistencia |
| Los prompts para copiar (§9) | acordarse de menos |
| La fecha de corte y la de la vuelta 2 (§2), y la escalera de pruebas con su bitácora (§5.6) | acordarse de menos · mejor código |
| El director anota el diario de cada sesión, porque las del tramo no corren `/cierre` (§8) | consistencia |

## 12. Lo que llevó y costó

**La medida** son los tokens "nuevos" (entrada + escritura de caché + salida) del chat principal más sus subagentes; la caché leída va
aparte. La anota en el diario el `/cierre` de cada sesión o, en un tramo, el director (§8).

**La vuelta 1 hasta la beta** (12/10 al 03/11, de la 6a): son ~119 M en 22 días. **Leer chats es más de la mitad** (~66 M). Diseñar
con el dueño, que es lo más caro en atención, es de lo más barato en tokens (~14 M). Construir bajó a ~2 M y ~3 h por director después
del ADR-029. El detalle por misión está en [`mision-6/PLAN-6a.md`](mision-6/PLAN-6a.md) §2.

**El tramo de las `rc`** (03/11 al 15/11, de `costos.csv`): estos números son solo de las sesiones principales. **Los subagentes de
este tramo no se anotaron**: en la vuelta 1 sumaban ~1,5-2 M por director, así que el total real es varias veces más.

| Paso | Sesiones | Reloj | Nuevos (principal) |
|---|---|---|---|
| La beta, R1, R1b y sus dos tandas (03-04/11) | La madre, la sesión de la beta y las tandas como subagentes | ~21 h de calendario, ~10 h de agentes de noche | ~2,0 M |
| El uso real y la `rc.4` a la `rc.6` (04-05/11) | 3 sesiones y la de preparar la PC | ~39 h de reloj, ~15 de esperas | ~3,4 M |
| Preparar la PC, leer las noches y llegar a la candidata (10-11/11) | La madre | 37 h de calendario, ~4 h activas | ~1,8 M |
| La revisión de la candidata (11-12/11) | 3 en paralelo y la charla | 20-35 min cada mirada; la charla ~2 h de trabajo en 29 h | ~2,1 M |
| El spec en Fable, 5 tandas y el tag `rc.7` (12-14/11) | 1 Fable y 5 Opus | ~16 h de sesiones en 2 días | ~5,7 M |
| R2 con la noche de prueba (14-15/11) | 1 Opus y 3 revisores | 2,5 h | ~0,5 M |
| El ciclo rehecho, el banco y la `rc.8` (15/11) | La 6b y la 5a (Opus), la 5b (Fable) | ~11 h de sesiones en un día | ~2,3 M |
| El banco otra vez y la versión (16/11) | La 5c y la 6 (Opus) | ~4,5 h, de noche | ~0,9 M |
| El director del tramo (12-16/11) | 1 Opus | 4 días de calendario | ~1,8 M |
| **El tramo de las `rc`, entero** | ~25 sesiones | 14 días | **~20 M + los subagentes** |

**Lo que dice**: el tramo de las `rc` costó en tokens menos que leer chats en la vuelta 1, pero **el reloj se fue en esperas**. Hubo tags
que se esperaban entre sí, clics de noche, el director sin despertar y decisiones que tardaban un día. Un día de calendario rinde entre
4 y 8 h de sesiones. **El final** (los dos bancos, la `rc.8` y la versión) llevó ~15 h de reloj en un solo tirón (15 al 16/11), casi sin
esperas: las sesiones abiertas en espera (§8) cortaron lo que más costaba.

## 13. Lecciones, por paso

Cada una va en una línea y lleva su fuente:
- **M4**: [`mision-4/PLAN.md`](mision-4/PLAN.md) §Lecciones.
- **M5**: el tracker, §Lecciones.
- **6a**: la lectura del 2026-11-03.
- **6b**: la lectura del 2026-11-15, con su chat y su hora en el privado (`lectura-6b/L1`-`L6`).

**Investigar**
- Lo gratis primero, y **cruzar dos fuentes baratas** antes de leer nada caro (M4).
- **Los registros de cambios y las bitácoras antes que los chats** (M4, 6b).
- Un `ya-sabido` y un brief de preguntas por lector, en lotes de 200-300 KB: seis lectores Sonnet leyeron 1,7 MB en ~6 min (6a, 6b).
- Techo de búsqueda a los agentes que consultan la doc (M4). **Un filtro que falla no avisa**: se prueba con 3 chats contados a mano (METODO).
- **Lo del lector es dato, no verdad**: lo fuerte se mira en el archivo y la línea. Las miradas corrigieron a sus lectores y entre sí (6b, 11/11).
- Las ideas de afuera pesan lo mismo que las pruebas de adentro, con la vara y la curaduría (6a).

**Ordenar la casa**
- Los objetivos escritos de entrada y el inventario de proyectos como paso 0 (M3). "Ordenado" se mira renderizado (6a).
- La dimensión del paso siguiente se pregunta al abrir (6a). Con dos sesiones en el mismo repo, **mirar el log antes de cerrar** (M4).

**Diseñar con el dueño**
- Un revisor frío después de las decisiones y antes del spec, en cada racimo (M4).
- **Un lector mide el uso de hoy** antes de diseñar, y la plataforma se verifica antes de decidir (M4).
- **El cuadro conceptual primero**; una decisión grande, por partes; la recomendada de proceso, la conservadora (6a, 6b 11/11).
- **No se poda con datos de proyectos chicos** lo que se usa en los grandes (6b, 11/11, `/tramo`).
- Fable para decidir y Opus para ejecutar lo decidido, y **el modelo se verifica después de lanzar** (M4½, 6b).

**Construir**
- Para un formato que viaja a la flota, el revisor frío va **antes** del sello (M5, D1.1). La mutación encuentra reglas sin prueba aunque la suite pase (M5).
- **El director mide antes de aceptar** un informe (M5, D2.1). **Fijar el contrato entre dos encargos** deja correr varios a la vez (M5, D5.2).
- **Los encargos van por archivos que no se pisan, y también por pruebas que no se pisan**: los textos de una tanda rompieron en
  cascada pruebas de las dos siguientes (6b, 12-13/11).
- El revisor recorre el día normal, no los ataques; una sesión real ve lo que ninguna prueba ve, **y hay que leer su log entero** (M5).
- Revisor sin piso de severidad → ADR-029 (M5, D3.3). Las decisiones sin el dueño, en criollo desde quien las toma (6a).
- **Medir un freno contra el historial real** antes de instalarlo (M5, D5.3). Un pedido de prueba también tiene que pasar la regla que prueba (M5, D4.1).
- A cada director, un pedido de informe con formato fijo (qué cambió, si es freno o regla blanda, el commit y el dato medido), y cada
  línea se verifica en su git (M4, checkpoint).

**La beta, las `rc`, el uso real y el tramo** (6b). Casi todas ya viven donde se aplican (§5.5 a §8), con su fecha. Las que no tienen otro lugar:
- **Lo que el dueño pidió entra en la `rc` que sigue**, no se corre de versión en versión (6b, 03-06/11: el obrero de cierre).
- **Correr la pieza de verdad antes de la integral**: ocho cierres de noche reales encontraron dos fallas que la suite no veía (6b, 13/11).
- **El contador de avance, visible**: "¿cuánto falta?" sigue siendo la pregunta más repetida, y la lista de tareas quieta lo empeora (6a, 6b).
- En la terminal de Windows, los heredocs largos y las barras se rompen: el script va a un archivo y se corre (6b, ≥8 veces en un día).

