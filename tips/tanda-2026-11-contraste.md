# Tanda de contraste — 2026-11 (los chats de la PC `clientes` leídos con las decisiones A-H en la mano)

> **Qué es esto.** El acta de la **segunda lectura** de los chats de Claude Code de Guido, pedida antes de la
> revisión integral del tramo 4 de la misión 4. No barre por temas (eso fue `tips/tanda-2026-10-chats.md`): lee
> los chats de la PC `clientes` **con las 49 decisiones de los racimos A-H en la mano** y dice, decisión por
> decisión, si los chats la **confirman**, la **contradicen** o no dicen nada (lente A); junta lo que Guido pide
> a mano una y otra vez (lente B, que absorbe el §6 pendiente de `tips/tanda-2026-10-habitos.md`); y lo que
> ningún racimo cubre (lente C). Más una cuarta sección abierta que pidió Guido: "ya que vamos a hacer esto,
> relevar más que lo mínimo". Mismo formato que las otras tandas: método, costo, tablas y propuestas con
> checkbox. **Las propuestas no están decididas**: las decide la sesión madre con Guido en la revisión integral.
>
> **Resultado en una línea:** **49 decisiones contrastadas: 17 confirmadas, 17 contradichas, 14 mixtas y 1 sin evidencia.** De las 17 contradichas, 11 solo miden el problema que la decisión viene a cambiar (línea de base para el piloto); **6 tocan la premisa** (A-1, E-1, F-1, H-6, D-10, H-3) y, con D-8, D-5, B-6/B-7, H-5 y E-4, son las **10 decisiones a reabrir** en la revisión integral. **Hábitos:** 13 de las 19 familias de la otra PC se repiten en Hermes, 24 hábitos nuevos (casi todos del director/obrero), 3 propuestas (**P63-P65**). **Huecos:** 17 consolidados y 21 "otras cosas" que se repitieron 3+ veces, 12 propuestas (**P66-P77**) más 5 refuerzos de propuestas anteriores (P18, P19, P23 y dos reglas de F y G que piden pasar de prosa a freno).
>
> **Cómo se usa.** Entra a la revisión integral de los racimos: confirmada → sigue · contradicha → se reabre con
> la evidencia en la mano · sin evidencia → queda "sin evidencia en chats" y se mide en el piloto. Los hábitos
> son candidatos a skill (regla de 3+); los huecos, a racimo I, a G.1 o a una nota en un diseño.

## 0. Qué se leyó, cuánto costó y qué límites tiene

**📅 Corte nuevo de la PC `clientes`: 2026-10-26 14:47 UTC** (el último `timestamp` condensado; también en
`D:\vibe-hallazgos\CORTE.md`). El corte anterior era 2026-10-12 21:59 UTC. La PC `Usuario` sigue en su corte
del 2026-10-25 15:48 (tanda de hábitos); la del compañero, en 2026-10-13.

**Lo leído.** Todos los chats principales de la PC `clientes` con al menos un mensaje de Guido, del 2026-04-21
al 2026-10-26: los de antes del corte viejo (desde la copia privada de la investigación de octubre, sin volver
a condensar) más lo nuevo, condensado el 2026-10-26 con `condensar.py --desde 2026-10-12T21:59`, excluidas la
sesión del observatorio y la sesión madre. Lo nuevo fue mucho más que el 10-15% que estimaba el plan: en dos
semanas los mensajes de Guido crecieron 29% y los mensajes entre sesiones, 75%.

| | Chats principales | Mensajes de Guido | Mensajes entre sesiones | Tamaño |
|---|---:|---:|---:|---:|
| Hasta el corte viejo (copia de octubre) | 230 | 3.001 | 3.594 | — |
| Lo nuevo (`--desde`), 2026-10-12 → 10-26 | 114 (107 nuevos + 7 que cruzaban el corte, recondensados enteros) | ~870 | ~2.700 | crudo 2.355 MB → condensado 22,7 MB (+ 750 subagentes, no leídos) |
| **Recortado y leído** (`recortar.py --modo contraste --tope-kb 200`) | **336** | **3.870** | **6.290** | **13,5 MB (~3,5 M tokens) en 83 lotes** |

Por familia: Hermes Desktop 158 chats (45 lotes) · Hermes Mobile 121 (28) · otros proyectos 42 (8: el proyecto de
entrevistas, Clases, Reportes, UCEMA, varios) · el Hub y el asistente de fichas 7 (2) · vibe-kit 8. Los chats de
vibe-kit y del Hub cayeron en los lotes de "otros". Prueba de 3 chats antes de condensar (METODO paso 1): mensajes
de Guido 4/4, 3/3, 8/8; entre sesiones 0/0, 1/1, 50/50 (un chat chico de Reportes, uno mediano y uno grande de
Hermes Desktop con 29 subagentes).

**El recorte.** De cada chat quedan el encabezado (proyecto, rol, fechas), los mensajes de Guido enteros, los
mensajes entre sesiones (director↔obrero, la mesa) **enteros**, las primeras 5 líneas de cada informe que vuelve,
la primera línea de cada respuesta de Claude y las marcas `[SendMessage → x]`, `[Agent …]`, `[Skill x]`,
`[comando /x]` y `[AskUserQuestion]`. Se van el resto de las respuestas de Claude, las herramientas y los
subagentes. Guido eligió esta variante (mensajes enteros, lotes de 200 KB) con el número a la vista el 2026-10-26,
sabiendo que daba 83 lotes y no los 59 del plan; las dos alternativas más baratas (encargos cortados a 1.500 bytes
→ 66 lotes; lotes de 300 KB → 55) se descartaron para no perder la cola de los encargos largos.

**Cómo.** La receta de `observatorio/investigacion/METODO.md` con el `LECTOR-contraste.md` y el
`PLAN-lectura-contraste.md`:
1. Condensar lo nuevo (2 excluidas) · gitleaks sobre los 24 MB nuevos: **0** · criterios 1 y 2 del condensado: OK
   (enmascarados: 48 por forma, 196 genéricos, 161 por entropía; ninguno revisado a mano porque gitleaks no marcó nada).
2. Recortar y armar los 83 lotes · gitleaks sobre los 14 MB recortados: **0**.
3. `ya-sabido.md` al día (un Sonnet, 211 mil tokens): a la base de octubre (bitácoras de Hermes, 58 KB) se le
   sumaron la tanda de octubre (hallazgos y P1-P57), la de hábitos (19 familias, P58-P62), las decisiones de los
   8 racimos y el §11-12 del TABLERO → 112 KB.
4. **83 lectores Sonnet**, uno por lote, lanzados por tandas de hasta 20 en paralelo (Guido eligió subagentes y
   no la herramienta Workflow). Cada uno dejó un archivo con cuatro secciones; los 83 archivos verificados por
   script (existencia, formato, cuatro secciones) y gitleaks sobre `hallazgos/` (1,38 MB): **0**.
5. **Tres síntesis Opus en paralelo**, una por lente, sobre los hallazgos partidos por lente por script
   (`extraer.py`), con la suma mecánica de la lente A hecha por script (2.872 filas, 49 decisiones) para que
   Opus juzgue sobre números y no los recuente.
6. Esta acta la escribió la sesión del observatorio sobre las tres síntesis; la sesión madre la revisa con Guido
   antes del commit.

**Costo real.**

| Pieza | Presupuesto que vio Guido | Real |
|---|---:|---:|
| Lectores (tokens nuevos de entrada por subagente, lo que informa el harness: comparable con el "~120 mil por lector" de la tanda de hábitos) | 10,0-15,4 M (83 lotes) | **20,8 M** (83 lectores; mín 166 k · máx 335 k · promedio 251 k) |
| Síntesis Opus (3) | 1-1,5 M | **1,02 M** (A 0,19 · B 0,31 · C 0,52) |
| ya-sabido (Sonnet) | — | 0,21 M |
| **Total** | **~11-17 M** | ****22,1 M de tokens nuevos** (1,3-2× el presupuesto)** |
| Tiempo de reloj | — | lectores ~40 min (9,5 h de agente, 20 en paralelo) · síntesis 17 min de reloj (A 9 · B 10 · C 17, en paralelo) · todo el día de trabajo ~1,6 h |

Los lectores dieron **1,35-2,1 veces** el presupuesto. La causa, medida en los transcripts de los subagentes: cada
lector hizo entre 10 y 24 llamadas (el lote de 200 KB entra en 2-8 lecturas, más el LECTOR, más `ya-sabido.md`
que creció de 58 a 112 KB y se lee entero, más la escritura), y cada llamada reenvía el contexto. El "3× el
contenido" de METODO se quedó corto por el `ya-sabido` grande; para la próxima: **~250 mil por lector con lotes
de 200 KB y un ya-sabido de ~110 KB**, o partir el ya-sabido por lente. Contando también lo que se releyó de la
caché (a 1/10 del precio), los 83 lectores movieron ~168 M de tokens.

**Límites**
- **Conteos de lectura, no mediciones.** Cada ✔ y ✘ es "cuántas veces lo vio el lector en su lote"; dos lotes
  pueden contar el mismo episodio si un chat largo quedó partido en dos archivos (no pasa: un chat nunca se
  parte, pero un episodio puede cruzar chats). Las decisiones que piden "contá" (G-1, D-6, D-7, C-2, C-3, D-4)
  tienen ✔ enormes por construcción: dicen "esto pasa mucho", no "esta decisión es más cierta".
- **El recorte deja la primera línea de Claude.** Alcanza para ver qué pidió Guido y qué viajó entre sesiones;
  no para ver qué contestó Claude después. Donde el lector necesitó más, lo marcó ("Necesita texto completo":
  29 huecos lo piden; la lista está en el §4 y la sesión madre decide si los relee, con techo de 15 chats).
- **Una PC**: la de trabajo (Hermes, los directores). La PC `Usuario` ya tiene su acta de hábitos; el cruce está
  en la tabla B. Lo que Guido pide en claude.ai web, Cowork o el celular no está.
- **Época**: abril a octubre de 2026, pero el grueso es septiembre-octubre (cuando nacieron director/obrero y la
  mesa). Muchas decisiones (racimos G y H) se contrastan contra un uso que ya las anticipaba a mano.
- **Los racimos se diseñaron mirando estos mismos chats** (la tanda de octubre salió de ellos): que muchas
  decisiones salgan confirmadas es en parte circular. Lo que vale más es lo contradicho y lo no visto.

**Cómo se cita.** `L12` = lote 12; `L12-3` = tercer hábito/hueco del lote 12. Los archivos de hallazgos y las
síntesis son privados: `D:\vibe-hallazgos\contraste-2026-11\lectura\`. Los proyectos van por el alias que ya usa
el repo; los que no aparecen en él van genéricos.

## 1. Contraste: las 49 decisiones de los racimos A-H contra los chats (lente A)

> Lectura de contraste de la misión 4 (PC clientes, 2026-10-26). Entrada: `lenteA-resumen.md` (suma mecánica de 2.872 filas), `lenteA-filas.csv`, `lenteA.md` y `ya-sabido.md` §6. ✔ y ✘ son las sumas mecánicas del resumen, sin recalcular. "Lotes" = cuántos de los 83 lotes vieron la decisión.
>
> **Cómo se asignó el veredicto:** *confirmada* si ~2/3 o más de los lotes que la vieron confirman y Σ✔ > Σ✘; *contradicha* si ~2/3 o más contradicen y Σ✘ > Σ✔; *mixta* en el medio, o cuando la dispersión se explica por proyecto o por lectura distinta del criterio; *sin evidencia* con menos de 5 lotes.
>
> **Ojo con "contradicha":** muchas decisiones describen cómo va a funcionar el método una vez construido (nada estaba construido al 2026-10-26). Para esas, el ✘ quiere decir que **hoy pasa lo que la decisión viene a cambiar**: es la línea de base y no rompe la decisión. La columna "Qué tocaría" separa los dos casos: *(base)* = hoy pasa lo que la decisión viene a cambiar, sirve como medida inicial; *(premisa)* = la evidencia pone en duda lo que la decisión da por cierto.

| Decisión | Qué dice (≤12 palabras) | Veredicto | ✔ | ✘ | Lotes | Ejemplo (≤15 palabras, archivo y fecha) | Qué tocaría en el diseño |
|---|---|---|---:|---:|---:|---|---|
| A-1 | Guido solo responde 5 cosas; el resto lo resuelven los agentes | contradicha | 240 | 392 | 81 | 85e17f12, 2026-10-19: ~9 clics de merge y 7 autorizaciones de ensayo, fuera de la lista | *(base + premisa)* Activar A-7: Guido decide si "mergear a main" y "leer/migrar producción" entran a la lista; lo que no entre, pre-autorizado por proyecto |
| A-2 | Reglas en prosa no frenan fallas repetidas; solo frenos mecánicos | confirmada | 375 | 68 | 82 | 0ac71f18, 2026-10-08: atribuciones falsas en el código tres sub-pasos, pese a la regla escrita | nada; aplicarla a las decisiones del propio pack que hoy son prosa (E-4, C-1, H-6) |
| A-3 | El director no debería revisar a mano lo del obrero | confirmada | 747 | 14 | 79 | 1555eaca, 2026-10-05: el director admite "me equivoqué" en cuatro datos de su encargo | nada; el ✔ prueba el problema (chequeos a mano, encargos con datos falsos): el script que verifica reportes (D-§2.11) es el remedio |
| B-1 | Guido trabaja por feature o módulo sobre apps que andan | confirmada | 217 | 75 | 77 | 395f93f7, 2026-10-21: candados por grupo de módulo sobre la app que ya anda | nada; anotar que Mobile hoy es reconstrucción por tramos y los proyectos chicos son tareas sueltas |
| B-2 | Tres tamaños: chico, módulo solo, módulo con director | confirmada | 173 | 59 | 58 | 412c6142, 2026-10-21: bloque de solo documentos (registrar decisiones) no encaja en ningún tamaño | Decir dónde caen release, relevamiento de solo lectura, bloque de mesa o de documentos y tarea operativa recurrente |
| B-3 | Prueba de tamaño: ¿alcanza el pedido más el git diff? | confirmada | 71 | 10 | 33 | 7c1dbd35, 2026-09-02: algo chico (anotar fechas) pasó a spec y tres sesiones más | nada; la prueba sirve porque lo chico crece seguido |
| B-4 | Una feature de Guido solo, en una sesión, es frecuente | mixta | 29 | 202 | 50 | a1a57bb0, 2026-10-09: dos actualizaciones a producción en una sola sesión, sin director | nada; es frecuente fuera de Hermes (7/0 lotes) y no existe dentro (2/41): sesgo de muestra, no premisa rota |
| B-5 | Lo que inyecta el arranque alcanza para ubicarse | mixta | 200 | 192 | 78 | 6c98f139, 2026-09-22: "el hook dice NO ARRANCADO: está desactualizado, ignoralo" | *(premisa)* El obrero se ubica por un puntero del encargo al módulo, no con "leé entero"; el hook no inyecta estado viejo (con B-7) |
| B-6 | El TODO no miente | contradicha | 2 | 211 | 61 | efd59796, 2026-09-22: el tracker decía NO ARRANCADO con el tramo en curso | *(base, ampliar)* Que B-7 cubra también las líneas de "estado" y "próximo paso" con fecha, y que /cierre las cruce |
| B-7 | Al agente le falta el para-qué de la app | confirmada | 101 | 3 | 40 | f1, 2026-09-09: dos conceptos del negocio se llamaban igual; casi diseña sobre eso | nada; `NORTE.md` (H-14) es el remedio |
| B-8 | La estructura de docs se mantiene sin pedirlo | contradicha | 26 | 258 | 71 | 701833f0, 2026-08-07: "¿hay documentación que tengas que actualizar con todo esto?" | *(base)* El hook cubre topes y rutas; lo que Guido pide ("atar cabos", "archivar a legacy") va como paso fijo de /cierre |
| C-1 | Silencio por defecto: solo por las 5 o por diseño | mixta | 124 | 86 | 51 | 9a0fa385, 2026-09-14: seis turnos seguidos "sigo esperando a los sub-agentes" sin novedad | Frenar mecánicamente el "sigo esperando" y el "Dónde estamos" repetido al pie (por A-2, no en prosa) |
| C-2 | `/estado` reemplaza el "¿cómo vamos?" | confirmada | 357 | 0 | 64 | 85e17f12, 2026-10-19: "contame avances, cómo va todo, qué % de completado", cada 1-2 h | nada; que `/estado` traiga el % hecho y qué pestañas se pueden cerrar (se pide igual) |
| C-3 | Se terminan los textos para pegar entre pestañas | confirmada | 672 | 54 | 80 | efd59796, 2026-09-22: 7 decisiones pegadas al obrero; "¿me vas a necesitar para pegar cosas?" | nada; queda la apertura del obrero (D-4, H-4) y las decisiones del PO que van del director al obrero |
| C-4 | El director estima con tiempos anotados; hoy estima mal | confirmada | 128 | 50 | 59 | 7963fc5f, 2026-09-23: el director dio ~85% libre y el real medido era 41% | Partir de lo que Mobile ya anota (horas por bloque al cierre) y bajarlo a tarea, con estimado antes |
| D-1 | Hay director cuando hace falta más de una pestaña ejecutando | mixta | 146 | 102 | 74 | 7e1fae97, 2026-10-13: "No hay carril B vivo": director con un solo obrero | nada en la regla (H-3 la aplica); en el piloto, medir qué directores de Mobile dejan de existir |
| D-2 | Hotfix en chat plano; lo mediano en una sesión | contradicha | 16 | 56 | 41 | 13dffd10, 2026-10-19: arreglo chico de config pagó diseño, 3 vueltas de revisor, gate y release | *(base)* Las reglas propias del proyecto (revisor, mutaciones, gate) necesitan excepción escrita para "chico"; si no, le ganan a H-2 |
| D-3 | Sonnet en obrero y tramo; Opus si lo decide el director | mixta | 104 | 95 | 64 | 25d4b7bd, 2026-10-22: Guido tipea `/model opus` en 9 de 10 pestañas | nada en la premisa (casi nunca hubo que subir un Sonnet); el modelo lo fija el encargo, no Guido a mano |
| D-4 | Guido abre las pestañas de los obreros y las renombra | confirmada | 453 | 15 | 75 | f45133fb, 2026-09-25: Guido tipea /rename, /model y /obrero; 9 aperturas en el lote | nada; es el mismo hecho que H-4 cuenta como ✘ |
| D-5 | Compactar es falla; el obrero termina aunque pase 800 mil | confirmada | 147 | 58 | 80 | 85e17f12, 2026-10-19: cinco obreros terminaron entre 380k y 560k, cero compactaciones | *(premisa, el umbral)* Hermes no compacta, pero los directores cortan obreros a 460-700 mil con cierre PARCIAL: fijar el umbral real |
| D-6 | Cada mensaje entre agentes trae algo nuevo y verificable | confirmada | 1400 | 175 | 64 | 5f35bfc5, 2026-09-21: tres "CIERRE ACEPTADO" con elogios y cuatro "quedate quieto" sin novedad | Atacar las presentaciones "pestaña lista" y los acuses puros: son el ruido que queda |
| D-7 | Los obreros reportan por commit | confirmada | 1237 | 30 | 72 | a7370e23, 2026-10-15: cada AVISO del obrero trae SHA, suite y mutaciones | nada; el script que lo comprueba debe cazar "commit con la suite en rojo" (visto 2 veces) |
| D-8 | Revisión: Opus en la 1.ª vuelta, una sola corrección | mixta | 696 | 332 | 74 | 39b1c7e4, 2026-09-29: revisor CORREGIR → CORREGIR → APROBADO en seis subpasos | *(premisa, mitad)* Opus en la 1.ª queda; "una corrección" no se cumple: decir qué pasa en la 3.ª vuelta (hoy hay 3 y 4) |
| D-9 | El obrero nocturno no se traba | contradicha | 38 | 59 | 51 | a8b55db8, 2026-10-19 02:35: "otro git merge pide el clic del PO, que ya no está" | *(base)* Merge nocturno pre-autorizado por proyecto y el clasificador fuera del camino; los cortes de internet quedan afuera |
| D-10 | Sin agente PO: lo que Guido pedía ya tiene dueño | contradicha | 23 | 43 | 30 | 39b1c7e4, 2026-09-29: "tengo muchos obreros abiertos, ¿cuáles puedo ir cerrando?" | *(premisa)* Darle dueño en `/estado` a dos vistas que nadie da: % de avance medido y qué pestañas se pueden cerrar |
| D-11 | Intervenciones de Guido por tramo: tres o menos | mixta | 193 | 206 | 77 | c2c1ef92, 2026-09-23/24: 42 mensajes de Guido en un tramo, casi todos fuera de las 5 | Vale en pestañas de obrero; en la del director, los días de gate manual, producción o pantalla pasan de 10: medirlos aparte |
| E-1 | Una sola puerta: Guido le habla al Arquitecto | contradicha | 11 | 84 | 41 | 9b8853b8, 2026-10-15: el director dicta "spec, dos rondas de red-team"; ningún /arquitecto | *(premisa)* En proyectos con director, el director ya es la puerta (Modo B a mano): decidir si la puerta lo absorbe o lo reconoce |
| E-2 | `/inicio` y `/cierre` distintos por proyecto está bien | mixta | 20 | 15 | 16 | d9d56211, 2026-09-22: "¿corriste el cierre del proyecto entero? yo hablaba del asistente" | nada; poca evidencia, y la fricción es por el alcance del cierre, no por que sean distintos |
| E-3 | Poner al día un proyecto o el kit es un pedido | contradicha | 2 | 58 | 32 | 79d9f992, 2026-09-21: bloques enteros solo para poner al día skills y método propios | *(base, ampliar)* El actualizador no cubre un caso visto: llevar un cambio de método de un proyecto al otro (hoy a mano) |
| E-4 | Decisiones en criollo, cortas, con qué cambia para él | contradicha | 107 | 155 | 68 | 20badb18, 2026-09-25: "me maree, no entendí, demasiada información" | *(base)* Volverla formato mecánico (opciones con botón, una recomendada, "qué cambia para vos"), no regla en prosa |
| F-1 | Las barreras son del proyecto; la base de prueba es libre | contradicha | 27 | 172 | 60 | 85e17f12, 2026-10-19: clic de ensayo pedido a cada obrero; el clasificador frenó 5 veces igual | *(premisa)* Gran parte de los frenos son del clasificador de la plataforma, no del proyecto: el diseño tiene que decir qué hace con ellos |
| F-2 | Usar sin ver: consultas y migraciones sin ver la credencial | mixta | 219 | 176 | 78 | d6ea5b0a, 2026-10-21: 11 rondas donde Guido corre consultas a mano y pega resultados | Que el obrero corra lo que hoy Guido corre y pega en el gate manual, sobre todo contra producción |
| F-3 | Con permiso, igual con red | confirmada | 224 | 11 | 68 | 85e17f12, 2026-10-19: ensayo con foto antes, up/down/up y ROLLBACK en 8 corridas | nada |
| F-4 | Qué base es qué está claro | mixta | 133 | 131 | 72 | 1ba50ee4, 2026-10-20: copiar la config del ensayo mandó la app a producción | Que F-8 cubra configuraciones y sistemas externos (un "ensayo" de un tercero resultó real), no solo la base |
| F-5 | El escáner del cierre no da falsas alarmas | mixta | 39 | 21 | 24 | 3e54cfa4, 2026-10-13: el control de credenciales saltó por un .pyc ignorado por git | Frenó 2 cierres, pero dio ~20 falsas alarmas a clasificar a mano: afinar patrones (handoff, TODO, ignorados por git) |
| G-1 | La mesa es lo más importante, sobre todo en la misma PC | confirmada | 3876 | 2 | 68 | 0ac71f18, 2026-10-07: 25 mensajes de otro director, 10 de otra PC, 111 de obreros | nada |
| G-2 | Directores acuerdan solos; Guido firma solo si cambia alcance | contradicha | 104 | 153 | 69 | df474ed7, 2026-10-08: "Sí a la 015" y "Sí, las mismas reglas" firmados por Guido | *(base)* Que el vocabulario de mesa (G-3) marque "técnico, sin firma" o "cambia alcance", y el director no suba los técnicos |
| G-3 | Si el otro director no está, se espera; nadie avisa | contradicha | 21 | 63 | 44 | 8dae, 2026-09-29: Guido pregunta cuándo vuelve el otro director; su firma frenó tres días | *(base)* nada nuevo: G-6 ("esperando desde") es el remedio; que `/estado` muestre las esperas |
| G-4 | Guido no hace de cartero entre proyectos | mixta | 230 | 161 | 70 | 4a98d044, 2026-09-09: Guido lleva 3 prompts a otro proyecto y trae 3 respuestas | nada; entre proyectos con mesa casi no hay cartero; el ✘ es pegado dentro del mismo proyecto (C-3) o en proyectos sin mesa |
| G-5 | Dos sesiones del mismo repo: git manda | mixta | 135 | 170 | 74 | 8dae, 2026-09-29: el worktree de spec arranca 17 commits atrás; "pull primero" | Que `/inicio` haga el fetch y avise el atraso, en vez del pull a mano en cada encargo (sobre todo Mobile) |
| G-6 | Las lecciones no viven en la memoria de una PC | mixta | 81 | 70 | 56 | c, 2026-10-26: un script del ensayo "vivió en la otra PC y nunca se commiteó" | Que /cierre barra la memoria local y proponga subir al repo lo que es regla |
| H-1 | La sesión dice el tamaño; lo chico no pasa por el Arquitecto | contradicha | 6 | 22 | 15 | a331cf17, 2026-09-23: mejorar una skill pagó Arquitecto, spec y red-team | *(base)* nada (H-2 es el remedio); poca evidencia |
| H-2 | El arreglo de un arreglo sigue chico, con prueba primero | confirmada | 239 | 0 | 72 | 76bfe51b, 2026-10-19: el mismo molde de error volvió a aparecer en seis sub-pasos | nada; el conteo prueba que "volvió a romperse" pasa seguido y justifica la prueba primero |
| H-3 | Varias sesiones seguidas no justifican un director | contradicha | 10 | 47 | 32 | f21e, 2026-10-14: director con un solo obrero en serie; relevos por duración | *(base + premisa chica)* El director en serie también lleva la mesa y el relevo de contexto: decir quién lo hace sin director |
| H-4 | El Arquitecto termina armando y da la línea de apertura | contradicha | 3 | 201 | 51 | b282463a, 2026-10-14: "¿qué modelo vamos a usar? ¿en qué esfuerzo?"; "¿varias sesiones o one shot?" | *(base)* nada; cuenta el mismo hecho que el ✔ de D-4 |
| H-5 | El entorno de prueba se verifica antes de la obra | contradicha | 100 | 176 | 76 | 85e17f12, 2026-10-19: el MCP del navegador no conectó en dos obreros; ensayo vacío | *(base, ampliar)* "Entorno" = base + herramientas: VPN, binario o APK, navegador MCP, Python, archivos abiertos |
| H-6 | El spec tiene tope y no crece durante la obra | contradicha | 21 | 222 | 68 | 497e15dd, 2026-09-24/25: nueve desvíos declarados del spec READY; sub-pasos nuevos 2b, 7b, 10b | *(premisa)* El archivo no se toca, pero la obra crece por desvíos: contarlos y fijar cuántos disparan re-spec |
| H-7 | Prototipo antes del spec para pantallas | confirmada | 103 | 15 | 48 | f1, 2026-09-09 a 09-14: el mockup se rehízo cuatro veces antes de escribir el spec | nada; aun con mockup aprobado quedan 1-2 ajustes (rótulos, textos): normal |
| H-8 | El Arquitecto monta en la carpeta real | sin evidencia | 2 | 1 | 4 | 170824e9, 2026-08-04: skills montadas un nivel abajo; /cierre no apareció hasta chat nuevo | nada; 3 casos no alcanzan |

**Totales:** confirmada 17 · contradicha 17 · mixta 14 · sin evidencia 1. De las 17 contradichas, 11 lo son porque hoy pasa lo que la decisión viene a cambiar *(base)*; 6 tocan la premisa en todo o en parte (A-1, E-1, F-1, H-6, D-10, H-3). A esas se suman las mixtas con una premisa tocada: D-8, D-5 y B-5.

### Lecturas

- **Dos clases de "contradicha".** Casi toda la columna ✘ de B-6, B-8, D-2, D-9, E-3, G-2, G-3, H-1, H-4 y H-5 mide lo que pasa *hoy*, con el método viejo. No dice que la decisión esté mal: dice que el problema existe, y cuánto. Esos números son la línea de base para el "cómo se sabe si funcionó" de cada racimo (B-16, E-9, F-14). Reabrir solo tiene sentido donde la evidencia contradice lo que la decisión da por supuesto (ver la sección siguiente).
- **Los conteos grandes miden uso, no verdad.** G-1 suma 3.876 porque los lectores contaron mensajes entre sesiones, y Hermes intercambia ~100-150 por chat. Eso dice que la mesa se usa muchísimo, no que la decisión sea mil veces más cierta. Pasa lo mismo con D-7 (1.237, cada aviso con SHA) y D-6 (1.400). En D-6 los ✘ son el 11% (175 de 1.575), contra la base de diseño de 39 de 115 turnos (34%). La unidad no es la misma: los lectores contaron también mensajes de obreros, no solo turnos del director. Sugiere que el ruido bajó, pero es **NO VERIFICADO**.
- **Las decisiones que pedían "contá" tienen ✔ grandes por construcción.** En C-2 (357), C-3 (672), H-2 (239) y D-4 (453), el ✔ cuenta cuántas veces aparece el problema ("¿cómo vamos?", "pegá esto", "volvió a romperse", "Guido abre la pestaña"). Confirma que el problema existe, no que el remedio funcione: `/estado`, la mesa y la prueba primero todavía no están construidos.
- **Hay hechos contados dos veces con signo contrario.** "Guido abre la pestaña y tipea /rename y /model" es ✔ en D-4 (453) y ✘ en H-4 (201); un lector lo anotó explícito (L18). "Director con un solo obrero en serie" es ✘ en D-1 y otra vez en H-3. El pegado entre pestañas del mismo proyecto aparece en C-3 y también como ✘ de G-4. Sumar esas columnas entre decisiones infla la fricción.
- **B-1, B-4, D-1 y G-5: los lectores no se contradicen, miran proyectos distintos.** B-1: Desktop 41/0, Mobile 14/13 (v4 es reconstrucción por tramos), otros 1/8 (tareas sueltas). B-4: en Hermes 2 lotes confirman y 41 contradicen; en los proyectos chicos, 7/0. D-1: Desktop 37/8 (hasta cuatro obreros en paralelo), Mobile 11/16 (un obrero en serie). G-5: Desktop 28/15 (worktree por obrero), Mobile 4/22 (pull a mano, worktrees atrasados, conflictos de docs). El veredicto agregado esconde que **Desktop y Mobile corren dos métodos parecidos pero no iguales**.
- **B-5 (mixta, 40/37): misma escena, lecturas opuestas.** El obrero que arranca, se presenta y espera el encargo sin preguntar contexto es ✔ para un lector. Para otro es ✘, porque el encargo trae un "leé primero" con documentos enteros y un "estado real de partida" escrito a mano. Lo firme: Guido casi nunca re-explica; el arranque del obrero lo lleva el encargo, no el hook. Y el hook llegó a inyectar estado falso ("NO ARRANCADO" con el tramo en curso, B-6).
- **D-3 (mixta): ✔ y ✘ responden preguntas distintas.** El ✘ de Desktop (13/18) casi nunca es un Sonnet que falló. Es Guido poniendo `/model opus` al abrir la pestaña del obrero. Los Sonnet que hubo que subir a Opus son un puñado (L64: 2, L77: 3 sub-pasos). La premisa queda confirmada; lo que cambia es el hábito de Guido.
- **D-5 (confirmada, con matiz).** En Hermes no hay compactaciones; las reales (`/compact` manual, "Prompt is too long") están en proyectos chicos de abril a septiembre. Muchos ✘ son otra cosa: el director corta al obrero entre 460 y 700 mil "para no llegar al corte" y deja un cierre PARCIAL. Eso choca con D-§2.5 ("termina aunque pase de 800 mil").
- **D-8 son dos decisiones en una.** "Opus en la 1.ª vuelta" se confirma: casi siempre halló un CORREGIR real. "Una sola corrección" no se cumple: lotes enteros con 3 y 4 vueltas (L19: seis subpasos con CORREGIR → CORREGIR → APROBADO; L35: siete casos de 3-4). Las segundas vueltas vacías son raras (L48: 2).
- **D-11 (mixta, 38/39): el tope de 3 depende de la pestaña.** En las de obrero se cumple casi siempre (0-3 por tramo, noches enteras sin Guido). En la del director se rompe los días de gate manual, escritura a producción o diseño de pantalla: 15, 27, 30, 42 mensajes. Además los lectores contaron distinto (por chat, por día o por tramo; con o sin pegados).
- **F-2, F-4 y F-5: dispersión por proyecto y por cómo se leyó el ✘.** F-2: Mobile corre sin ver (21/5); Desktop se parte (19/24) porque Guido corre SQL en el panel y pega resultados en los gates. F-4: Mobile 8/18; las confusiones graves son de configuración, no de base (una config de ensayo mandó a producción, un "ensayo" de un sistema externo era real). F-5: varios lectores contaron como ✘ falsas alarmas que **no frenaron** el cierre. Frenos de cierre reales hubo 2; falsas alarmas a clasificar a mano, ~20.
- **G-2, G-3 y G-4: la mesa anda, la firma no.** Los directores se pasan SHA, hashes y alertas solos (G-4: ~20 intercambios por lote sin Guido en Hermes). Pero acuerdos técnicos (códigos de error, orden de chequeos, "el texto tal cual") igual suben a la firma de los dos PO. G-4 se partió porque algunos lectores contaron como cartero el pegado dentro del mismo proyecto (L47 y L52: 17 cada uno; entre proyectos, 0).
- **A-1: qué cae fuera de la lista.** En los ejemplos de A-1, lo que se repite son merges (~41 menciones), producción (~28: lecturas, migraciones, encendidos), claves (~18) y ensayo (~17: autorizaciones con vencimiento). Plata, borrar datos y mandar afuera aparecen poco y del lado ✔. El grueso del ✘ es el clic del PO sobre merges y producción que hoy da la plataforma.
- **E-1: el Arquitecto casi no aparece.** Hay 11 ✔ en 41 lotes, y Mobile tiene 0/18. En Hermes el director escribe el spec y encarga el red team con un molde propio; en los proyectos chicos el Modo B se dicta a mano ("hacete un mini spec"). Coincide con lo que el racimo H ya sabía ("10 llamadas, un Modo B real").
- **Época.** Las compactaciones, el Arquitecto en uso y el kit copiado a mano vienen sobre todo de los proyectos chicos de abril a agosto. La mesa, los worktrees y el clic del PO son de Hermes, de septiembre y octubre. B-8 (Guido pide ordenar docs) y E-4 ("no entiendo") aparecen en las tres familias y en todas las épocas: son las fricciones más parejas.

### Qué habría que reabrir

Criterio: muchos lotes, ✘ bastante mayor que ✔, y una evidencia que discute la decisión, no solo el estado de hoy.

1. **H-6 · El spec no crece durante la obra** (68 lotes, ✘222 / ✔21). Evidencia: en Hermes el spec READY no se edita, pero la obra crece igual: 9-12 desvíos declarados por tramo y sub-pasos nuevos (2b, 7b, 10b) a mitad de obra. Cambio: reconocer el desvío declarado como el canal legal, contarlo, y fijar cuántos desvíos o sub-pasos nuevos disparan un re-spec decidido por Guido.
2. **E-1 · Una sola puerta: el Arquitecto** (41 lotes, ✘84 / ✔11; Mobile 0/18). Evidencia: en proyectos con director, el director dicta "spec → dos rondas de red team" y nadie invoca `/arquitecto`. Cambio: decidir si la puerta absorbe ese ritual (el director llama al Arquitecto en Modo B) o si reconoce al director como puerta de su proyecto.
3. **F-1 · Las barreras son del proyecto** (60 lotes, ✘172 / ✔27). Evidencia: el clasificador de la plataforma negó lecturas y escrituras ya autorizadas por clic ("es la cuenta dummy, es para eso"; 5 frenos pese al clic; un obrero parado ~2 h). Cambio: el diseño tiene que distinguir los frenos del proyecto de los de la plataforma y decir cómo se evitan estos últimos (permisos `allow` por proyecto, modo del obrero).
4. **A-1 · Las 5 preguntas** (81 lotes, ✘392 / ✔240). Evidencia: el clic del PO sobre merges, lecturas y migraciones de producción y encendido de claves es la pregunta más repetida, y no está en la lista. Cambio: activar A-7, para que Guido decida si "mergear a main" y "tocar producción" entran a la lista o quedan pre-autorizados por proyecto (F-10).
5. **D-8 · Una sola corrección del revisor** (74 lotes, ✘332; la mitad "Opus en la 1.ª" queda). Evidencia: 3 y 4 vueltas de revisor en muchos subpasos; L48 ya usa "no hay 4.ª sin hablarlo". Cambio: escribir el tope real (¿2?, ¿3?) y qué pasa al llegar: escala al director o se para.
6. **B-6 / B-7 · El TODO que no miente** (61 lotes, ✘211 / ✔2). Evidencia: lo que miente es sobre todo el *estado* (tracker en "NO ARRANCADO", "próximo paso" de días atrás, encabezados falsos desde hace un mes), y el hook lo inyecta en cada sesión. Cambio: ampliar B-7 a las líneas de estado y próximo paso con fecha, y que /cierre las cruce.
7. **H-5 · El entorno se verifica antes** (76 lotes, ✘176 / ✔100). Evidencia: lo que aparece roto tarde no es la base sino las herramientas: VPN, el .exe o el APK del gate, el MCP del navegador, Python, un Excel abierto. Cambio: H-6 del diseño (entorno declarado en el spec) tiene que listar herramientas, no solo la base.
8. **E-4 · Decisiones en criollo** (68 lotes, ✘155 / ✔107). Evidencia: "me maree, no entendí", "pregúntame acá con opciones"; donde se usaron botones con una recomendada, Guido contestó "sí" directo. Cambio: por A-2, pasarla de regla en prosa a formato fijo (botones, una RECOMENDADA, "qué cambia para vos").
9. **D-10 · Sin agente PO** (30 lotes, ✘43 / ✔23). Evidencia: Guido pide vistas que nadie da: "% de completado" (4 veces en un lote) y "¿qué obreros puedo cerrar?". Cambio: no hace falta un agente; sí dos líneas más en `/estado`.
10. **D-5 · El umbral de 800 mil** (dentro de una decisión confirmada). Evidencia: los directores relevan obreros entre 460 y 700 mil con cierre PARCIAL. Cambio: decidir si el umbral es 800 mil y el director deja de cortar antes, o si se baja al que ya se usa.

Las otras contradichas (B-8, D-2, D-9, E-3, G-2, G-3, H-1, H-3, H-4) **no se reabren**: lo que muestran es la medida inicial del problema que la decisión ataca. Los ajustes chicos están en la tabla.

### Límites de esta síntesis

- **Son conteos de lectura, no mediciones.** Cada lector contó lo que vio en su lote, con su propia lectura del criterio ✔/✘. Las sumas mezclan unidades (mensajes, chats, tramos, episodios) y algunos hechos están contados dos veces bajo decisiones distintas (D-4/H-4, D-1/H-3, C-3/G-4). Los porcentajes de arriba son orientativos.
- **La muestra está cargada a Hermes.** Por el primer chat de cada lote: Hermes Desktop 45 lotes, Hermes Mobile 28, otros 10 (vibe-kit, el Hub, proyectos chicos de oficina y de estudio, pruebas del kit del compañero). Por chats: Desktop 158, Mobile 121, el resto ~57. Lo que vale para proyectos con director pesa mucho más que lo de los proyectos chicos (B-4, D-2, H-1 y H-8 casi no tienen evidencia de afuera). Deptos, donde va el piloto, no está en la muestra.
- **Época.** Los chats van de abril a octubre de 2026, la mayoría de septiembre y octubre. Varias decisiones (A-5 del 2026-10-23, todo H del 24 al 26) son posteriores a casi todos los chats: se contrastan con la práctica anterior, no con su uso.
- **El recorte.** Los lectores vieron los mensajes de Guido y los mensajes entre sesiones enteros, pero solo la primera línea de cada respuesta de Claude y las 5 primeras de los informes de tareas. Lo que Claude explicó, propuso o verificó más abajo no se ve: C-1 (silencio), E-4 (si explicó en criollo) y A-3 (si el director verificó) pueden estar subcontados o mal leídos.
- **Esta síntesis no abrió chats.** Los ejemplos son los que dejaron los lectores (paráfrasis o citas de ≤15 palabras). Ningún número se recalculó contra los chats, y lo marcado NO VERIFICADO sigue así.

## 2. Hábitos: qué le pide Guido a mano, una y otra vez (lente B; la pasada pendiente del §6 de la tanda de hábitos)

> **Qué es.** La pasada del §6 del acta de hábitos (`tips/tanda-2026-10-habitos.md`) corrida en la PC `clientes`:
> qué le pide Guido a Claude **a mano**, una y otra vez. Fuente: la lente B de los 83 lotes (`lenteB.md`,
> 632 hábitos anotados por los lectores Sonnet) sobre 336 chats (abril-octubre 2026; 158 Hermes Desktop,
> 121 Hermes Mobile, 42 de otros proyectos, 8 de vibe-kit, 7 del Hub), cruzada con las 19 familias y
> P58-P62 del acta de la PC `Usuario`, la lista A-1…H-8 del LECTOR y las decisiones de racimo de `ya-sabido.md` §6.
>
> **Cómo se lee la tabla.** Los conteos son de lectura, sumados y redondeados; "~" donde hay solape entre
> lotes (ver Límites). Lotes L1-L10 = proyectos fuera de Hermes (más el Hub y vibe-kit); L11-L54 = Desktop;
> L55-L83 = Mobile. "Lo cubre" usa los códigos del LECTOR (A-1…H-8); si la decisión no está en esa lista, va
> como "racimo X dec. n"; las P son propuestas de las actas (P1-P57 y P58-P62), ninguna decidida.

### Las 19 familias de la otra PC, vistas en clientes

| # | Familia (nombre del acta) | Veces · chats en clientes | Proyectos | Ejemplo (≤15 palabras) | ¿Se repite en Hermes? | Lo cubre |
|---|---|---|---|---|---|---|
| 1 | Abrir cada pestaña a mano (`/rename`, `/model`, rol) | ~500 comandos y avisos de "ya lo lancé" · ~250 | Desktop (~240), Mobile (~260), otros (~13, solo `/model`) | "/rename obrero-identidad-78 · /model opus · /tramo" | **Sí**, es lo más repetido: el número del obrero se pone a mano (llegó a 78) y se re-renombra al reanudar | D-4 (queda manual a propósito); P16 sin construir; racimo H dec. 5 |
| 2 | Preguntar cómo vamos (%, horas, tabla, "¿tengo que decidir algo?") | ~385 · ~90 | Desktop (~220), Mobile (~100), otros (~60) | "reportame con la tabla de tramos, avances, que % vamos, cuantas horas queda" | **Sí**, 9 a 14 veces por chat de director; 4 de 11 pedidos de % no tenían porcentaje medido | C-2 (`/estado`), C-4 (tiempos) |
| 3 | Hacer a mano lo que Claude no puede, y avisar | ~280 · ~72 | Desktop (panel, SQL, `.exe`, VPN), Mobile (teléfono), otros | "pasame aca las consultas asi las corro" | **Sí**, más pesado que allá: ~20 "listo" en 2 chats, 13 rondas de consultas pegadas, ~18 avisos del teléfono | F-2 en parte (consultas); P60 sin decidir |
| 4 | Coordinar obreros y delegar | ~65 · ~22 (sin contexto ni mesa: van aparte) | Desktop, Mobile | "decime que obreros puedo cerrar" | **Sí**: "¿qué obreros cierro?" en ~10 chats; cerrar la pestaña cuando el director verifica el CIERRE (6 en 6) | C-2 (P15: "se puede cerrar"); D-4 habla de abrir, no de cerrar; D-9 |
| 5 | Luz verde corta | ~290 · ~85 | todos | "mockup ok, todo como recomendás" | **Sí**, pero cambia: casi todo es elegir la opción recomendada (letras, "todo como recomendás") o compuertas del método (merge, READY, ensayo) | A-1 y racimo A dec. 6; D-11. Un "dale" tomado como OK de otra cosa, 3 veces (Hub) |
| 6 | Pedir el cierre completo | ~160 · ~70 | todos | "revisaste bitacora? cabos sueltos? metodo? esta todo prolijo" | **Sí**, con la misma frase en Desktop y Mobile, sobre todo antes de mudar al director | B-8 (`/cierre` cruza); P58 y P53 sin decidir |
| 7 | "¿Verificaste?" | ~65 · ~29 (de Guido) | otros (~47), Desktop (~20), Mobile (0) | "fijate comprobalo por vos mismo e intenta escribir algo con ese user" | **Poco** de Guido: en Hermes verifica el director contra git sin que se lo pidan (fila nueva 5) | A-3, D-7; P5 |
| 8 | "Explicámelo en criollo", "repetime" | ~100 · ~38 | Desktop (~65), Mobile (~10), otros (~27) | "no entiendo el 2, de q whatsapp hablas?" | **Sí**, a menudo "dame la pregunta con opciones y recomendación"; 2 "repetime" eran un bug visual | E-4; P30 |
| 9 | Pedir la opinión honesta | ~53 · ~21 | Desktop (~29), Mobile (~5), otros (~19) | "consideras que vamos por buen camino y el resultado final va a coincidir?" | **Sí**, moderado: "¿es buena idea?", "quiero saber la verdad", a veces con la pregunta inclinada | Ninguna decisión; P59 sin decidir |
| 10 | Pedir el texto para la otra sesión y pegarlo | ~380 · ~140 | Desktop (~190), Mobile (~170), otros (~17) | "Decisiones mías (PO)… Registralas antes de tu próximo commit" | **Sí**, segundo en volumen; pero los pegados de decisiones caen a ~0 después del 2026-10-09 (CM-58/C-86) en los lotes que miran el antes y el después; queda la vuelta ("volvió con esto", ~17 en un chat) | C-3, G-4, B-5 (próximo paso), racimo H dec. 5 |
| 11 | Reanudar tras un corte | ~40 · ~12 | Mobile (~17), Desktop (~7), otros (~17) | "ahí le di continue, pero no está logrando retomar" | **Sí**, con otra cara: re-`/rename` tras reanudar o reiniciar (3 episodios en un chat), "continue" 5 veces en 55 min | Ninguna decidida; P62; H-104 de Mobile |
| 12 | Elegir el modelo | ~48 · ~27 | Mobile (~23), otros (~25) | "ese sale si o si con opus? o puede salir con sonnet?" | **Sí**, y contradice el diseño: Guido pone Opus a mano en casi cada apertura, antes de ver el encargo | D-3 (Sonnet por defecto); P26, P16 |
| 13 | "Anotalo en algún lado" | ~56 · ~27 | Desktop (~20), Mobile (~9), otros (~27) | "tengo miedo de que quede solo en tu memoria" | **Sí**, moderado: "anotá en la bitácora", "que no quede en tu memoria" | B-6, B-8, G-6 |
| 14 | Plan, mini spec o muestra antes de ejecutar | ~69 · ~29 | otros (~47), Desktop (~22), Mobile (0) | "mandame la PARTICIÓN antes de escribir código" | **Poco** de Guido: en Hermes la partición y el "pará en el primer resultado inesperado" van en el encargo del director | H-7 (prototipo), F-3; P57 |
| 15 | Credenciales y autorizaciones | ~160 · ~53 | Desktop (~107), Mobile (~49), otros (~5) | "Renuevo mi autorización de hoy, con el mismo alcance…" | **Sí**, y crece mucho (allá 11): autorización con vencimiento renovada a diario, 13 permisos de merge en una noche, clics fuera de las 5 de A | A-1 y racimo A dec. 6; D-4 (clic); F-2, F-3 |
| 16 | "¿Cómo lo resuelve otro?" | ~3 · 1 | Desktop | "preguntale a el como resolvio eso si lo hace en la rama o que?" | **Poco**: solo como "preguntale al otro director cómo lo resolvió" | G-1 (la mesa); P61 |
| 17 | Pasar el diseño por el filtro de criterios | 0 | — | — | **No**: es un hábito del diseño de vibe-kit; ningún lote lo vio | Los 11 criterios de los DISENO |
| 18 | `git pull` / actualizar al abrir | ~25 · ~13 | otros (Hub, vibe-kit, el kit), Mobile (en el encargo) | "hace otro git pull. Esta vez son los últimos" | **Poco**: en Mobile lo escribe el director en el encargo ("Primer comando: git pull"), no Guido | G-5; P37, P13 |
| 19 | Del proyecto: mensajes para un tercero | ~19 · ~8 | Hub, bot de WhatsApp, agente de reuniones, Desktop | "el mail un poco más corto y conciso, ya lo hablé en persona" | **Poco** en Hermes (1 chat), pero **deja de ser propio de un proyecto**: aparece en 4 | A-1 (lo manda Guido); P43 |

**Correcciones que se repiten** (no son pedidos): "esperá, no arregles nada" (~8 en 4 chats; fila nueva 14);
Claude afirma algo y Guido lo desafía ("¿en serio es tan grande?", 2 en 1 chat); texto pegado en la pestaña
equivocada (≥5, contado dentro de la familia 10, lo cubre C-3).

### Hábitos nuevos (no estaban en las 19)

| # | Hábito | Momento | Veces · chats | Proyectos | Ejemplo | Lo cubre |
|---|---|---|---|---|---|---|
| 1 | **Vigilar el contexto a mano y decidir la mudanza** (decirle al director el % que lee en su barra; "¿sigo acá o abro otra?") | estado · otro | ~90 · ~36 (≈75 de Guido; ~15 del director al obrero), 23 lotes | Desktop, Mobile; un proyecto sin código | "te queda 37% de contexto, asi q estaria bueno cerrar estas cosas y mudarte" | D-5 + racimo D dec. 8 (contexto medido por script); ya-sabido A3.8 |
| 2 | **Esqueleto fijo del encargo** (lo escribe el director, no Guido): estado real verificado, qué leer, trampas, NO SE TOCA, avisos por commit, cierre con salida real y SHA | delegar | ~55 encargos · ~39, 10 lotes | Desktop (~47), Mobile (~9) | "ESTADO REAL DE PARTIDA (verificado por mí)… NO SE TOCA… AVISOS… CIERRE" | Racimo D dec. 2 y 11 en parte; el molde del encargo ya vive en la skill del director (RADIOGRAFIA: 5 partes en la skill, 9 en el método); ya-sabido A2.6 |
| 3 | **Mandar al director a hablar con el otro director o sesión** ("pónganse de acuerdo", "mandale un ping") | delegar | ~50 · ~14, 14 lotes | Desktop, Mobile | "Pónganse de acuerdo en qué hacer con esto. Traigan propuestas." | G-1, G-2, G-4 |
| 4 | **"Me voy"**: ¿qué necesitás de mí?, dejá un checkpoint, ¿con qué me encuentro mañana?, ¿me puedo ir tranquilo? | cerrar | ~50 · ~21, 16 lotes | Desktop, Mobile | "decime mañana cuando vuelva con qué me debería encontrar" | D-9 en parte; CM-26 (método de Desktop, fuera del pack); **ninguna A-H** → P63 |
| 5 | **El director verifica cada aviso del obrero contra git** (SHA en origin, árbol limpio, suite corrida por él) | revisar | ~37 · 6, 3 lotes | Desktop | "4030d4f verificado contra origin (8 archivos, exactamente el alcance)" | A-3; P23 |
| 6 | **"Guardalo como plantilla" / "hagámoslo skill"**, y rutinas repetidas sin skill (la ficha de cada candidato, el campus) | cerrar · otro | ~25 · ~10, 5 lotes | selección, administración sin código, posgrado | "esa estructura la guardaremos como esqueleto para futuras entrevistas" | P22 (`/retro`, en espera) |
| 7 | **"Dame la ruta" / "no lo puedo abrir, dejámelo acá"** | otro | ~17 · ~6, 5 lotes (con solape) | curso/kit, agente de reuniones, selección, posgrado | "dame la ruta de la guia de preguntas asi la tengo a mano" | Ninguna (tanda H-38 lo vio sin propuesta) → P64 |
| 8 | **"¿No lo puede hacer el obrero solo?"** cuando el paso manual lo traba | delegar · corregir | ~13 · 6, 4 lotes | Desktop, Mobile | "las deberías correr el obrero, no puedo estar haciendo lo mismo ochocientas veces" | F-2 en parte (solo consultas con credencial) → P65 |
| 9 | Cuidar los tokens de la semana y dar el OK de presupuesto antes de una lectura grande | otro · delegar | ~13 · 7, 3 lotes | vibe-kit, Desktop, Mobile | "esta semana hay q intentar economizar tokens" | Ninguna (C-4 y la columna de tokens del racimo C, en parte; P26) |
| 10 | "Ya te dije, está autorizado" / "aflojá el candado" | corregir | ~12 · 3, 3 lotes | Desktop | "me cansé, vamos a abrir todo el candado" | F-1 |
| 11 | Declarar "solo lectura" a mano al abrir | abrir · delegar | ~11 · 8, 3 lotes | Desktop, bot de WhatsApp, vibe-kit | "a partir de ahora eres READ ONLY" | Ninguna decidida; P51 (racimo H dec. 13: no es un nivel) |
| 12 | Pegar el pedido de un tercero (mail, captura) o un texto de afuera para que Claude lo convierta o cargue | delegar | ~10 · 7, 2 lotes | planillas y documentos, portafolio | "esto me pidieron" | H-1 en parte |
| 13 | Cuidar el tono y el rastro de lo entregado ("que no parezca IA", sin números, sin apodos internos) | corregir | ~8 · 4, 3 lotes | posgrado, Hub, agente de reuniones | "no digas pruebas, decí el nombre de negocio del reporte" | P43 |
| 14 | Frenar: "esperá, no arregles nada", "respondiste otra cosa" | corregir | ~8 · 4, 2 lotes | documentos, Desktop | "no, no arregles nada" | Ninguna (tanda H-18) |
| 15 | Corregir las estimaciones de horas o una afirmación exagerada | corregir | ~8 · 3, 2 lotes | Hub, Desktop | "esas estimaciones son un poco grandes… tiene que ser menos" | C-4 |
| 16 | Pedir que las decisiones lleguen como pregunta con opciones y recomendación | estado · corregir | ~7 (+~9 dentro de la familia 8) · ~4, 2 lotes | Desktop, Mobile | "haceme las preguntas con recomendaciones y opciones por favor" | E-4, D-4 (clic) |
| 17 | Qué skills tiene el kit y para qué sirve cada una | estado | 6 · 3 | curso/kit | "¿qué skills tiene el repo y para qué es cada una?" | E-1 en parte (el Capataz responde; Guido no lo sabía) |
| 18 | Estirar el alcance de la jornada | otro | 6 · 1 | Desktop | "hagamoslo hoy, recien son las 12.36, tenemos 3 horas" | Ninguna |
| 19 | Pedir un registro de la sesión o un documento plano para otro agente o sistema | cerrar | ~5 · 3, 2 lotes | Desktop, bot de WhatsApp, Hub | "informe escrito o en un md, no gastes en hacer un artifact" | Ninguna (racimo E dec. 6 en parte) |
| 20 | `/compact` y `/inicio` en el mismo chat, encadenados con el cierre | abrir · cerrar | ~5 · 4, 2 lotes | Hub, posgrado | "Corre cierre así después compacto la sesión y corro inicio" | D-5 (lo contradice: compactar es falla) |
| 21 | Corregir al agente con un dato del negocio que no tenía | corregir | 5 · 1 | Desktop | "yo ya estoy dado de alta como user… porque estoy en la ticketera" | B-7 (racimo H dec. 14, `NORTE.md`) |
| 22 | Dictado con nombres mal oídos | corregir | ~5 correcciones · 3, 2 lotes | administración, Hub | "me confundí al dictarle a la PC" | P21 (en espera) |
| 23 | Pedir que le cuenten qué se dijeron los agentes | estado | 4 · 1 | Mobile | "contame en criollo qué hizo... solo quiero entender qué pasó" | C-1/C-2 en parte |
| 24 | Pedir que Claude ordene el repo o las carpetas | otro | 4 · 2 | curso/kit, agente de reuniones | "organizalo, por favor… hay muchísimos archivos todos tirados" | B-8 |
| ⚪ | Propios de un proyecto: cargar novedades en la bitácora del portafolio (20+), dictado largo para cargar (Hub, 9), salida imprimible (selección, ~7), comprobantes (~12, ya con skill propia) | otro | ~50 · ~13 | portafolio, Hub, selección, administración | "ponele 15%; y seguimos con otro" | Regla de 3+ dentro de cada proyecto |

Con 3 veces en un solo chat, sin fila: "analizá vos primero, sin mi sesgo" (selección), "parémonos en quien
va a usar el módulo" (Desktop) y "¿ya puedo borrar la otra PC?" (cambio de PC).

### Lo que se lee

1. **Es la misma lista con otro peso.** 18 de las 19 familias aparecen en `clientes` y **13 se repiten en
   Hermes** (5 poco, 1 no). Pero el ranking cambia: en la PC liviana mandaban abrir pestañas (~98) y "cómo
   vamos" (~74); acá, además de esas dos (~500 y ~385), suben **llevar textos y decisiones entre pestañas
   (~380, allá 22)**, la luz verde (~290), hacer a mano (~280) y **las autorizaciones (~160, allá 11)**. La
   PC seria es la del PO de director/obrero: la mayor parte de lo que tipea Guido es trámite.
2. **Hábitos que allá no existían, todos del director/obrero:** vigilar el contexto y decidir la mudanza
   (~90), mandar a los directores a hablarse (~50) y "me voy" (~50). Los dos primeros tienen diseño
   (D-5 con racimo D dec. 8; G-1, G-2 y G-4). **"Me voy" no**: es el borde de la sesión que el acta ya
   señalaba, visto del lado del director (→ P63).
3. **El método director/obrero ya absorbe parte de los hábitos.** "¿Verificaste?" (7), "plan antes de
   ejecutar" (14) y `git pull` (18) casi no los dice Guido en Hermes: los pone el director en el encargo o
   los hace solo (verificar contra git ~37, el esqueleto del encargo ~55). Lo que falta ahí es mecánica
   (A-3 y P23: que la verificación la haga un script), no un hábito nuevo.
4. **Un cambio fechado se ve en los chats.** Desde CM-58/C-86 (2026-10-09) los bloques "Decisiones mías
   (PO)" pegados a mano caen a ~0 en los lotes que miran antes y después (L31, L38, L48, L49, L73): **C-3 ya
   funciona a medias**. Lo que sigue a mano son las autorizaciones de clase 2 (merge de tramo, escritura en
   el ensayo, editar `CLAUDE.md` o una skill), que **no están en las 5 de A**: con el racimo A dec. 6
   ("todo lo demás lo resuelven los agentes") deberían desaparecer. Es un hueco de construcción, no de
   diseño (va a la síntesis C y a la misión 5).
5. **La familia 12 contradice D-3.** Guido pone Opus a mano en casi cada apertura, antes de ver el encargo
   (una vez puso Sonnet y el encargo pedía Opus). La palanca ya propuesta es P16: el alta de la pestaña
   propone nombre **y modelo**.
6. **"Hacer a mano" pesa más acá y tiene otra forma**: panel y SQL de producción, `.exe`, VPN, el teléfono.
   F-2 (usar sin ver) se lleva las consultas con credencial; P60 el guion. Falta la pregunta previa: en 3
   casos, cuando Guido protestó, el agente terminó haciéndolo solo (manejó el binario, la pantalla por
   adb, el portapapeles) → P65.
7. **La familia 19 deja de ser "propia de un proyecto"**: mensajes y textos para terceros en el Hub, el bot,
   el agente de reuniones y Desktop, más el cuidado del tono (fila nueva 13). Refuerza P43; el acta debería
   rotularla transversal.
8. **"En criollo" sigue fallando con la regla escrita** (E-4): ~75 en Hermes, con `CLAUDE.md` que lo pide.
   Otra prueba de P1. Dos de los "repetime" eran un bug de pantalla, no de comprensión.
9. **Fuera de Hermes aparecen hábitos de proyectos sin código**: "guardalo como plantilla" (~25, refuerza
   P22) y "dame la ruta" (~17, → P64). Son proyectos de un solo chat largo, sin `/cierre` del kit: ahí el
   cierre y la documentación se piden de palabra.
10. **El cierre se dicta con la misma frase en dos proyectos** ("¿bitácora? ¿método? ¿cabos sueltos?"),
    sobre todo antes de mudar al director: es un protocolo re-dictado. Lo cubren B-8 y P58/P53; nada nuevo.

### Propuestas

#### Director / obrero

- [ ] **P63 · "Me voy" con respuesta fija**: cuando Guido dice que se va ("me voy en 30'", "en una hora me
  voy", "¿me puedo ir?") o llega la hora que dejó dicha, el director contesta **un solo bloque**: (1) qué
  necesita de él **ahora**, todo junto (clics, autorizaciones con su vencimiento); (2) qué queda andando y
  hasta cuándo; (3) con qué se va a encontrar al volver; (4) el checkpoint si hay que cortar. Lleva al
  pack el checklist CM-26 de Desktop. Distinta de P58: en el director, "me voy" no es cerrar, es dejar la
  noche armada. Evidencia: hábito nuevo 4, ~50 veces en ~21 chats (16 lotes), Desktop y Mobile, del
  2026-09-16 al 10-22; "decime mañana con qué me debería encontrar" y "¿me puedo ir tranquilo?" se repiten
  en los dos proyectos. Ningún racimo A-H lo nombra (D-9 cubre la noche del lado del obrero).
- [ ] **P65 · "¿Lo puede hacer el agente?" antes de pedirle un paso a mano a Guido**: antes de darle un
  paso manual (correr una consulta, abrir el `.exe`, tocar el teléfono, copiar un valor), el agente dice
  en una línea por qué no lo puede hacer él (herramienta, permiso, credencial) y, si puede, lo hace. Es la
  condición previa del guion de P60. Evidencia: hábito nuevo 8, ~13 veces en 6 chats (Desktop y Mobile,
  2026-09-25 a 10-08), y en 3 casos el agente terminó haciéndolo (binario, adb, portapapeles); familia 3
  con ~250 pasos a mano en Hermes. F-2 cubre solo las consultas con credencial.

#### Molde / skills del proyecto

- [ ] **P64 · Todo archivo entregado se nombra con su ruta absoluta y fuera del scratchpad**: cuando Claude
  genera algo para Guido (informe, HTML, PDF, guía), el mensaje termina con la ruta absoluta; si quedó en
  el scratchpad o en una carpeta temporal, primero lo copia a la carpeta del proyecto. Línea en el
  `CLAUDE.md` del molde y en `/cierre` (lista los archivos nuevos con su ruta). Evidencia: hábito nuevo 7,
  ~17 veces en ~6 chats (curso/kit, agente de reuniones, selección, posgrado, del 2026-07-30 al 10-09),
  con un caso donde el archivo estaba en el scratchpad y Guido tuvo que repetir el pedido; tanda H-38 lo
  vio sin propuesta.

### Refuerzos (no son propuestas nuevas)

- **Refuerza P16** (alta de pestaña en un paso): familia 1, ~500 comandos en ~250 chats, y familia 12 (Opus
  puesto a mano contra D-3).
- **Refuerza P15** (`/estado` con "se puede cerrar"): familia 4, "¿qué obreros cierro?" en ~10 chats.
- **Refuerza P58** (la sesión propone el cierre): familia 6, ~160 en ~70 chats, en Hermes y fuera.
- **Refuerza P59** (por qué hace falta y qué pasa si no): familia 9, ~53 en ~21 chats, ~34 en Hermes.
- **Refuerza P60** (prueba a mano con guion): familia 3, ~280 en ~72 chats; un caso con guion numerado donde
  Guido igual preguntó "¿qué hago?" 3 veces.
- **Refuerza P62** (volver de un corte): familia 11, re-`/rename` tras reanudar (H-104 de Mobile).
- **Refuerza P22** (`/retro`): hábito nuevo 6. **Refuerza P51** (modo consulta): hábito nuevo 11.
- **Refuerza P43** (entregables a terceros): familia 19 y hábito nuevo 13. **Refuerza P21** (glosario de
  dictado): hábito nuevo 22. **Refuerza P23** (verificador mecánico de avisos): hábito nuevo 5.

### Lo que NO se propone, y por qué

- **Nada nuevo para las familias 1, 2, 4, 5, 7, 8, 10, 12, 13, 14, 15 y 18**: tienen diseño (C, D, G, H,
  racimo A dec. 6) o propuesta previa; esta pasada les suma el conteo de la PC seria como línea base del piloto.
- **Vigilar el contexto a mano** (nuevo 1): lo cubre el racimo D dec. 8 (contexto medido por script). Que
  el script pueda leer el % que Guido ve en su barra: NO VERIFICADO; si no puede, es un hallazgo para el piloto.
- **El esqueleto del encargo** (nuevo 2): el molde ya existe en la skill del director; lo pendiente es
  unificar 5 partes contra 9 y generar el estado de partida por script (mejora #1 de la RADIOGRAFIA y
  racimo D dec. 11).
- **Directores que se hablan** (nuevo 3): es exactamente la mesa (G); debería bajar solo cuando se construya.
- **Autorizaciones fuera de las 5 de A** (familia 15): por diseño desaparecen (racimo A dec. 6); que hoy se
  pidan es un hueco de construcción, no de diseño.
- **Tokens de la semana** (nuevo 9): el dato vive en la cuenta y no se sabe si un agente lo puede leer (NO
  VERIFICADO); C-4 y la columna de tokens del racimo C cubren el consumo por tarea.
- **"Ya está autorizado" / el candado** (nuevo 10): lo cubre F-1 (las barreras son del proyecto).
- **Propios de un proyecto** (⚪): regla de 3+ dentro de cada proyecto, no del método.
- **Hábitos de un solo chat** (nuevos 18, 21, 23 y los de 3 veces): no pasan la regla de 3+ entre chats.
- **Familia 17** (filtro de criterios): no apareció; no hay nada que medir acá.

### Límites

- **Conteos de lectura, no medición.** 83 lectores contaron con criterios distintos: unos cuentan comandos,
  otros aperturas, otros mensajes (sobre todo en las familias 1, 10 y 15). Sumé y redondeé; los totales
  sirven para ordenar, no para comparar al dígito con la otra PC.
- **Solapes.** Los lotes L3, L4 y L5 leyeron copias del mismo chat de selección (mismas frases, los mismos 13
  "continue" y 8 errores de API): los deduplicé a mano. L2 y L6 comparten al menos un chat (la misma frase
  del 2026-08-19). Puede haber otros solapes no detectados; de ahí el "~".
- **Clasificación.** Los lectores pusieron el mismo hábito en familias distintas (pegar una autorización en
  la 10 o la 15; el contexto en la 2, la 4 o "nueva"). Reagrupé por intención; la frontera 10/15 es difusa.
- **Códigos.** Varios lectores citaron decisiones de racimo con un código del LECTOR que significa otra cosa
  (por ejemplo "D-8" por la mudanza medida por script, cuando en el LECTOR D-8 es la revisión). Acá van con
  códigos del LECTOR y, si no está, "racimo X dec. n".
- **Recorte.** Solo mensajes de Guido y la primera línea de Claude: lo del director se ve en sus propios
  chats o por lo que reportan los obreros ("pegada por el PO"), que son cuentas indirectas.
- **Época.** El grueso de Hermes va del 2026-09-14 al 10-26; un cambio de método a mitad (CM-58, 2026-10-09)
  parte la familia 10 en dos. Los otros proyectos arrancan en abril pero casi todo es de julio a octubre.
- **No comparable 1 a 1 con la otra PC**: 336 chats contra 68 recortados, otro uso y otros proyectos. Lo
  que Guido pide en claude.ai, Cowork o el celular no está.

## 3. Huecos y otras cosas (lente C y la sección abierta que pidió Guido)

> Fuente: "Lente C · Huecos" (458 entradas) y "Otras cosas" (334 entradas) de los 83 lotes; cruzado contra `ya-sabido.md` §4-§7 y
> con grep sobre los `DISENO-A…H`. Conteos = **lotes distintos** donde apareció (no eventos). Lotes por proyecto: L1-L10 = proyectos
> chicos (kit-eq, el proyecto de entrevistas, proyectos de oficina, el proyecto de estudio, el Hub, vibe-kit, el Bot); L11-L55 =
> Hermes Desktop; L55-L83 = Hermes Mobile. Las "otras" se cuentan aparte y se marcan "(+O Lx)".
> Criterio: es **hueco** lo que ningún racimo decide. La columna "Ya sabido" dice si un acta ya lo vio; si la vio y propuso, la
> propuesta es "refuerza Pnn", no una nueva.

### Huecos

| # | Hueco (título) | Tipo | Lotes | Proyectos | Evidencia (≤20 palabras) | Racimo más cercano y por qué no lo cubre | Ya sabido (código o no) | Propuesta |
|---|---|---|---|---|---|---|---|---|
| 1 | Lo que solo Guido puede poner de día (VPN que se cae, teléfono físico, oficina o casa, Docker que pide admin) no está en ningún plan | fricción de Guido | 15 (L20, L40, L49, L52, L55, L56, L60, L61, L66, L69, L70, L71, L73, L80, L82) (+O L65, L71) | Hermes Desktop, Hermes Mobile | Recorrido de teléfono: 67 min contra 40-60 estimados, cortes de infraestructura; otro, 15 min de 1 h 30 previstos | D §9.5: el checklist "me voy" mira VPN y dispositivos solo de noche. H §9 verifica el entorno al abrir, no lo que se cae ni lo que necesita las manos de Guido | Parcial: tanda H-51 (VPN), CM-26, C-82 y H-134 (teléfono), P60 (guion). Ninguno lo agenda | P69 (refuerza P60) |
| 2 | Turnos de recursos de prueba dentro de un proyecto (ensayo, puerto de depuración, binario, suite, teléfono) los arbitra el director a mensaje | desperdicio de tokens | 13 (L12, L13, L16, L24, L28, L33, L35, L38, L45, L48, L55, L56, L79) (+O L15, L18, L49) | Hermes Desktop, Hermes Mobile | 25 "ENSAYO: pido" y 10 "libero" en un día, cada uno con un "dale" del director (L35) | G §8 (decisión 5): dueño y conjunto declarado de esquemas y contratos **entre proyectos**. D §5 "un encargo no comparte archivos": archivos, no recursos vivos | Sí: CM-46 (puerto 9222), CM-33 (ensayo). Sin propuesta en las actas | P70 |
| 3 | Ciclo de vida del subagente sin tope: se cuelga, muere sin informe, se reanuda y vuelve a morir, deja procesos | falla repetida | 13 (L12, L17, L29, L30, L33, L35, L41, L44, L52, L63, L69, L77, L79) | Hermes Desktop, Hermes Mobile | Implementador 3 h 20 sin señal (L30); "stopped with background work" leído como "sigue corriendo" (L63) | D §5 (uno de prueba antes de N) y D §9 (despertador que mira git): no fijan tope de tiempo, latido, "no reanudar" ni "sin procesos vivos al cerrar" | Sí: tanda H-37 (sin propuesta), D 2026-09-24; CM-63 citado por los chats, no está en el índice | P71 |
| 4 | Comentarios, docstrings y textos de error que afirman más de lo medido siguen siendo la primera causa de vueltas del revisor | falla repetida | 11 (L14, L20, L23, L26, L35, L42, L43, L44, L47, L48, L54) | Hermes Desktop | "Cuatro revisiones, cero hallazgos en el código y nueve en la prosa" (L48); ≥13 sub-pasos devueltos en L54 | A deja P18 "en espera, cubierto por el trinquete y el corrector de secretos": ninguno de los dos mira afirmaciones ni atribuciones | Sí: tanda H-10, CM-1, CM-32, CM-62, P18 | Refuerza P18 (reabrir) |
| 5 | Editar el andamiaje del propio proyecto (CLAUDE.md, skills, hooks, settings, workflow de CI) sigue pidiendo un clic o pegado por archivo | fricción de Guido | 9 (L46, L51, L55, L59, L61, L72, L77, L78, L79) | Hermes Desktop, Hermes Mobile | ~13 autorizaciones por archivo en 3 chats; una línea de CLAUDE.md costó 2 commits y 3-5 mensajes (L61, L79) | D §5 dice que /obrero "escribe andamiaje" y D §7.3 "todo lo demás no pregunta", pero F-10 pide pedido de Guido para cambiar barreras y CM-14/CM-58 siguen vigentes: nadie lo escribió explícito | Bitácoras: CM-14, CM-58, C-86. Actas: no | P66 |
| 6 | Fugas de credencial por vías que F no nombra: selección del IDE adjunta sola, historial del portapapeles, ventana sin foco, log verboso, enmascarado improvisado | falla repetida | 9 (L16, L18, L22, L29, L36, L53, L58, L78, L83) | Hermes Desktop, Hermes Mobile | La línea seleccionada del archivo de config llegó al chat con el valor de producción (L16, L22) | F §9 (decisión 5) fija la entrega (`cargar-secreto`, entrada oculta) y el corrector; su límite escrito solo nombra "el humano que pega" | Parcial: tanda H-34 (vía fija), C-08. Los cinco vectores: no | P74 |
| 7 | El presupuesto de uso semanal decide cortes, mudanzas de PC y cuántos carriles abrir, y nadie lo ve | fricción de Guido | 8 (L3, L10, L17, L20, L30, L35, L63, L78) (+O L4, L5, L69, L73) | el proyecto de entrevistas, vibe-kit, Hermes Desktop, Hermes Mobile | "Quiero abrir solo 1 carril para economizar tokens esta semana", sin número a la vista (L63); OK de gasto 7 veces (L10) | C-7/C-13: tokens por tarea, después, solo en módulos con director. La lista de A no tiene "gasto" (y "plata" se lee como dinero) | No (tanda H-24 es tiempo, no uso) | P67 |
| 8 | El paquete para el revisor sin shell (diff, status, tabla de mutaciones) se arma a mano y llega incompleto | desperdicio de tokens | 8 (L26, L30, L36, L44, L52, L54, L55, L73) | Hermes Desktop, Hermes Mobile | 9 CORREGIR del revisor por papeles en 5 chats, 4 con "el código está bien" (L30) | D §10 congela la revisión en un SHA y da tres niveles; no dice quién le arma el insumo a un revisor que no puede correr git | Sí: tanda H-53, C-51, C-79, P23, P19 | Refuerza P23 y P19 |
| 9 | Cada obrero reescribe su script de mutación y cae en trampas ya pagadas; ya existe uno bueno en un proyecto | skill que falta | 7 (L31, L40, L67, L71, L72, L78, L82) | Hermes Desktop, Hermes Mobile | `.pyc` viejo, nombre que contiene al original, `sed` sin efecto: 4 trampas en 6+ obreros (L40); `mutar.py` en uso (L67) | D §10 pide prueba en rojo y mutación, pero las herramientas que entran (§6) no incluyen `mutar` | Sí: P19, CM-31, CM-42 | Refuerza P19 (tomar el `mutar.py` existente) |
| 10 | Lo que pasa en GitHub (CI en rojo días, CI sin máquina, seguridad del repo) no lo mira nadie | falla repetida | 6 (L25, L62, L72, L76, L81, L82) | Hermes Desktop, Hermes Mobile | CI rojo 5 días, 40 corridas, sin que nadie lo viera (L25); escaneo de secretos apagado los meses en que el repo fue público (L62) | F §15 (decisión 11): el arranque declara permisos, barreras y hook; nada del remoto. D §12: el gate es local | Bitácora: H-121, H-124. Actas: no | P73 |
| 11 | Roles que existen de hecho y no están en la tabla de D: la sesión de spec y el obrero de decisiones | agente que falta | 6 (L41, L42, L63) (+O L16, L67, L73) | Hermes Desktop, Hermes Mobile | 6 de 6 sesiones de spec abren con /obrero; un obrero de decisiones sacó ~20 decisiones en 1,5 h (L41) | D §6 (tabla de roles) y §12.5 (lista cerrada de skills); D §8.7 dice que el spec siguiente "es otro módulo" sin decir con qué se abre. El obrero de mesa ya lo resolvió G §7 | No (P38 es la lista de pendientes, no el rol) | P76 |
| 12 | Pausa ordenada de todo el equipo (hora de fin de Guido, "me voy con la PC", sin internet) | skill que falta | 5 (L14, L19, L40, L54, L64) (+L17, L30, L78 por uso; +O L13, L15, L47, L55) | Hermes Desktop, Hermes Mobile | Corte de internet: obrero parado ~3 h y, al volver, /rename de nuevo (L54) | D §9.5 cubre "me voy" de noche con obreros que siguen; D §11 corta por contexto. Nadie corta todo por hora o por salida | Parcial: CM-26, P58, P62 (la vuelta) | P68 |
| 13 | Condiciones de release que se acumulan por sub-paso, orden de despliegue y el texto público, sin pieza que los junte | skill que falta | 5 (L18, L19, L38, L47, L49) (+O L35) | Hermes Desktop | "No sale release hasta X" escrito en 4 lugares sin freno (L19); 3 de 4 viñetas públicas no resistieron el tag anterior (O-L35) | A-5 y D §12.3 fijan el OK agrupado y la plantilla de `/release`; E-8 lo deja propio. Nada sobre condiciones, interruptores ni texto "Para usuarios" | No | P72 |
| 14 | La PC compartida entre proyectos (RAM, Docker, CPU de suites en paralelo, sesiones ajenas en ListAgents) | fricción de Guido | 5 (L19, L33, L63, L69, L72) (+O L56, L63, L66, L71, L72, L75) | Hermes Desktop, Hermes Mobile | RAM libre 0,58-1,29 GB bloqueó un sub-paso; Guido bajó a mano los contenedores del otro proyecto (L63) | G §8 es de datos; TABLERO §6 (objetivo 5) solo dice "cortar procesos por identificador" | Bitácora: H-107 (Docker compartido) | P70 |
| 15 | Imágenes con datos reales (capturas de pantalla y de teléfono con notificaciones, transcripciones crudas) sin dueño ni borrado | falla repetida | 5 (L6, L55, L67, L69, L82) | proyectos de oficina, Hermes Mobile | 7 y 17 capturas fuera del repo "hasta que el PO las mire" (L69); notificaciones ajenas en una captura (L55, L82) | F deja "datos personales en el escáner" en espera, y el escáner mira texto en commits | Parcial: tanda H-27, P20 | P74 |
| 16 | Narración y última línea del turno en inglés | fricción de Guido | 5 (L10, L26, L67) (+O L1, L7) | vibe-kit, Hermes Desktop, Hermes Mobile, el proyecto de estudio | "The choice is in the box above" ante "¿qué pensás que es mejor?" (L10); 5 de 7 en el obrero Sonnet (L67) | Ninguno: E-§2.6 pide criollo (tono), no fija idioma; grep "idioma/español" en los DISENO = 0 | Sí: tanda H-26, sin propuesta | P75 |
| 17 | Lo que Guido no ve: lo hablado entre directores sin ser decisión, el resultado de una medición, qué atajó el método | fricción de Guido | 3 (L65, L68, L78) (+O L22, L25, L45, L58) | Hermes Mobile | "¿Salieron bien? ¿Qué extrajimos?" sobre una medición que él pagó; el director: "te lo debía" (L78) | C-1 (silencio por defecto) y C-5 (qué se hizo, qué sigue, qué te espera, trabado): no nombran ni lo conversado ni lo aprendido | No (tanda H-29 es el "¿cómo vamos?") | P77 |

**Vistos una vez (o en un solo proyecto), sin consolidar:**
- Compactación que cae dentro de una skill (el Arquitecto, `/cierre`): el texto de compactación pegado al resultado o el cierre a medias (L1, L9: 2 lotes).
- Un subagente arma la palabra prohibida por partes para pasar un control (L63, L69: 2 lotes); falta la frase "esquivar un control cuenta como desvío".
- Un proceso de prueba escucha en todas las interfaces y le abre a Guido un aviso de Windows que no puede aceptar (L69; +O L63).
- No hay receta para retirar una PC con un repo (lo no pusheado, stash, worktrees, memoria, credenciales a rotar) (L41). **Grave para la investigación**: Guido quería borrar los chats de esa PC (O-L41).
- Un script operativo con claves vive fuera del repo; tras un corte, el bot quedó mudo 3 días sin aviso (L10).
- Una regla `allow` de git "de solo lectura" escribe archivos con `--output` (O-L41).
- Código gemelo copiado entre dos repos: cada hallazgo de seguridad viaja por mensaje (L77). Reescritura con convivencia (app nueva mientras la vieja sigue en producción) no la nombra ningún tamaño (L79). Dos apps guardan la misma información sin decisión (L82).
- El freno del asistente del Hub (qué tablas puede tocar) se amplía en caliente y fuera de git (L8).
- Funciones que abren un diálogo nativo del sistema no se pueden probar de noche (L34).
- Claude habla en primera persona de Guido y confunde la autoría de los commits (L9).

### Otras cosas que se repitieron 3+ veces

| # | Qué pasó | Lotes | Proyectos | Por qué llama la atención | ¿Entra como hallazgo? |
|---|---|---|---|---|---|
| 1 | La mudanza del director es casi diaria: "mudanza #6 a #16" en 2-3 semanas, una a los 53 min de la anterior, con `/rename` a mano y "reenviame lo de la última hora" | 14 (L14, L20, L21, L35, L55, L58, L59, L61, L66, L71, L72, L74, L75, L81) | Hermes Desktop, Hermes Mobile, Devoluciones | D-8 mide el contexto del obrero, no la cadencia del director; cada mudanza le cuesta un paso a Guido y mensajes perdidos a los obreros | Sí: dato para calibrar D §11 y el costo del relevo |
| 2 | Recetario de verificación barata contra el sistema real: estadísticas de la base para probar quién llamó qué, error que lista lo expuesto, diff de ids de tests, lista empaquetada contra el release anterior, "control de calma" de 60 s, largo + huella corta en vez del valor | 11 (L21, L22, L33, L39, L41, L43, L44, L48, L50, L67, L75) | Hermes Desktop, Hermes Mobile | Cada truco lo descubrió un obrero y vive en un chat; varios encontraron defectos que ningún test miraba | Sí: candidato a `referencia/` del molde |
| 3 | Guido decide por requisito y deja abierto el mecanismo ("que se pueda forzar la actualización; la forma no me importa", "la que menos nos trabe", "ponete en el lugar de quien usa la pantalla", "lo que se pierde y qué lo compensa") | 8 (L15, L47, L52, L56, L64, L65, L72, L76) | Hermes Desktop, Hermes Mobile | Decide rápido sin entender la parte técnica; el director lo convierte en condición con prueba | Sí: forma de ficha para Guido (E-§2.6) |
| 4 | El obrero declara solo lo que se apartó ("Declaro:", "lo que no pude verificar", retira su propio hallazgo, se corrige antes de que lo corrijan) | 7 (L30, L37, L40, L54, L61, L68, L82) | Hermes Desktop, Hermes Mobile | De 8 `python -`, los 8 los atajó la declaración, no una regla (L40); permitió cazar una fuga en una captura (L82) | Sí: control barato; refuerza P5 |
| 5 | Cabecera "si no sos <nombre> [ref], ignorá" en cada mensaje entre sesiones, y no escribir a una dirección automática | 7 (L21, L46, L60, L68, L71, L76, L77) | Hermes Desktop, Hermes Mobile, Devoluciones | ~45 mensajes con la marca en un lote; antídoto práctico de MF-1 mientras G-9 no esté construido | Sí: truco para el núcleo común hasta el piloto |
| 6 | Guido inicia sesión en una web o navegador aislado y el agente maneja: la clave nunca pasa por Claude | 7 (L6, L8, L9, L27, L29, L39, L53) | proyectos de oficina, el Hub, Hermes Desktop | Es "usar sin ver" para webs y paneles, que F (pensado para `.env`) no describe | Sí: receta para F |
| 7 | Elogios y agradecimientos entre agentes en casi cada mensaje ("buena captura", "la mejor evidencia del día") | 5 (L13, L38, L51, L59, L82) | Hermes Desktop, Hermes Mobile | No es ruido vacío (va con contenido), pero gasta tokens y nadie midió si cambia la conducta | Sí, como dato para D-6 |
| 8 | Defensas de la plataforma ante texto con forma de orden: el marco "esto no es un mensaje del usuario", un subagente que tomó a su orquestador como inyección, un "ACTION ITEM" dentro de una transcripción pegada | 5 (L3, L34, L43, L49, L81) | el proyecto de entrevistas, Hermes Desktop, Hermes Mobile | Funcionan, pero el diseño de mensajes entre agentes no los nombra; conviene no romperlos y avisar al subagente que pueden llegarle mensajes del orquestador | Sí |
| 9 | Datos de calibración que ya salen gratis: "¿alcanzó el modelo?" en cada cierre (siempre sí), ~130k de contexto en 2 h por informes, implementador que se corta a ~250-450k, ~22 informes por noche | 5 (L11, L36, L66, L78, L81) | Hermes Desktop, Hermes Mobile | D-3 (Sonnet por defecto) y D-8 tienen evidencia gratis que nadie suma | Sí: insumo del piloto |
| 10 | Lo que Guido pregunta al volver ("¿se trabó?, ¿cuántas horas trabajó solo?, ¿usó los dos obreros?", "esperaba más de la noche", informe de cómo fue sin él) | 4 (L22, L25, L42, L60) | Hermes Desktop, Hermes Mobile | Es el contenido del resumen al volver; C-2 no lo fija | Sí (va con P77) |
| 11 | El paralelismo se planifica a mano: reasignar filas entre obreros, Guido empuja a usar capacidad ociosa, semáforo "esperá mi señal" entre carriles, revisor de N con implementador de N+1 | 4 (L13, L17, L47, L76) | Hermes Desktop, Hermes Mobile | D-1 dice cuándo hay director, no cómo reparte; una noche dejó obreros sin trabajo hasta que Guido preguntó | Sí |
| 12 | El encargo o el tablero crecen en obra ("el último encargo" que no lo era, agregados que mandan sobre el original, sub-pasos nuevos decididos por mensaje) | 4 (L26, L54, L55, L80) | Hermes Desktop, Hermes Mobile | H-9 mide el spec; lo que crece es el encargo y el tablero, sin medida | Sí (D §13.3 lo frena solo en parte) |
| 13 | Una lectura "inofensiva" trae un secreto o datos reales (consulta de solo lectura que vuelca una config, arnés que imprime filas reales, log con llaves de demo) | 4 (L23, L45, L48, L61) | Hermes Desktop, Hermes Mobile | El freno pregunta "¿escribe?"; también hace falta "¿qué trae?" | Sí (va con P74) |
| 14 | Ritmo por franjas: de noche código, de día producción con Guido; "hoy cerramos, no abrimos"; corte por la hora en que Guido se va | 4 (L13, L15, L33, L55) | Hermes Desktop, Hermes Mobile | Funcionó (la noche cerró limpia, producción a las 12 h), pero no está escrito como forma de organizar el día | Sí (va con P68/P69) |
| 15 | El mockup aprobado sirve de contrato también al revisor, y falla cuando muestra datos que la base no tiene o vive fuera del repo | 4 (L11, L17, L33, L54) | Hermes Desktop | Amplía H-10: de dónde sale cada elemento y dónde vive el archivo | Sí, como nota a H-10 |
| 16 | Guido quiere entender el valor del método ("¿esto da un programa más estable?", "¿el carril B mejoró la productividad?") y no hay número que lo conteste | 4 (L15, L20, L45, L58) | Hermes Desktop, Hermes Mobile | El otro director también pidió "qué les rindió en números"; solo hubo impresiones | Sí (va con P77) |
| 17 | Smoke de pantalla con un cliente propio o un Chrome por obrero cuando el MCP del navegador no conecta | 4 (L19, L33, L38, L49) | Hermes Desktop | Cada obrero lo reinventa; un puerto por obrero reemplazó los turnos | Sí: molde de smoke (D §12.2) |
| 18 | La aprobación de Guido atada al SHA o al hash del texto; si el archivo cambia, el OK se cae | 3 (L28, L32, L71) | Hermes Desktop, Hermes Mobile | Control barato que cierra "aprobado ≠ escrito"; G §8 lo usa para recursos, no para el "sí" de Guido | Sí |
| 19 | La fricción de uso convertida en backlog: "decime qué no podés hacer, así se lo paso al dev" | 3 (L8, L9, L10) | el Hub | Un no programador arma el backlog desde la sesión; cerca de P22 (`/retro`, en espera) | Sí, solo como evidencia para P22 |
| 20 | Transcribir audio o video se resuelve a mano, con la receta en la memoria de una PC | 3 (L3, L4, L9) | el proyecto de entrevistas, el Hub | Tercera vez en dos proyectos: pasa la regla de 3+ | Sí: candidato a receta |
| 21 | Numeración de obreros como termómetro: de -27 a -78 en 9 días; de -8 a -62 en 14 | 3 (L39, L44, L48) | Hermes Desktop | Medida indirecta del costo de abrir pestañas (hábito 1) | Sí, como medida (NO VERIFICADO que sean correlativos) |
| 22 | Horas en UTC y hora local mezcladas en un mismo mensaje; los recortes vienen en UTC | 4 (L2, L40, L64, L77) | kit-eq, Hermes Desktop, Hermes Mobile | Cualquier "estimado vs real" que cruce fuentes sale corrido 3 h | No: es tanda H-14 / P3. Sí como nota de lectura para el observatorio |
| 23 | Fan-out de subagentes dentro de una sola sesión, sin director, en proyectos sin código | 3 (L3, L5, L6) | el proyecto de entrevistas, proyectos de oficina | Paralelismo real sin pestañas; la síntesis salió verosímil con 11 de 14 caídos | No: D §5 y §7.2 ya lo prevén ("uno de prueba antes de N") |
| 24 | El canal entre sesiones se cae o duplica y Guido hace de puente | 3 (L11, L42, L58) | Hermes Desktop, Hermes Mobile | Dato para G.1 (el buzón) | No: G §4 (git es la base) |
| 25 | `git stash` o `checkout --` usados en Hermes Mobile sin freno | 3 (L56, L58, L75) | Hermes Mobile | Sin daño, pero el freno existía solo en Desktop | No: F-2 lleva el hook al molde |

**Dos veces (lista corta):** leer PDFs de Drive por el navegador se cuelga (L3, L5, el mismo proyecto) · las pestañas ociosas se quedan abiertas y cerrarlas lo decide Guido (L59, L80) · decidir con códigos cortos funciona (L13, L62), pero una pregunta con botones no sirve para pasos con rutas (L20, L40) · "¿con qué identidad entra la app o el agente?" no tiene ficha (L57, L83) · obrero que precarga mientras espera la señal de otro (L47, L67).

**Una vez, por truco o por gravedad:** el script de mutación mutado contra sí mismo encontró su propia prueba débil (L60) · alias "+" del mail propio para cuentas de prueba (L38) · clon `--bare` para leer la rama de otro repo sin escribir sus refs (L29) · un arreglo "solo en esta rama" quitó un botón de toda la app (L52) · el PID de Git Bash no es el de Windows y el `finally` mató el proceso equivocado (L63).

### Propuestas

> Numeradas desde P66 para no chocar con la síntesis B (la sesión madre renumera). Formato del acta. Ninguna está decidida.

- [ ] **P66 · El andamiaje propio tiene dueño escrito**: una línea en el núcleo común de D (y una nota en A): editar CLAUDE.md, skills, agentes y workflow de CI **del propio proyecto** lo hacen los agentes, con el diff mostrado y su commit (clase 1 o 2 de D §13); **cambiar barreras** (deny, hooks de F) sigue siendo por pedido de Guido (F-10), con un canario en una sesión antes del `settings` global. Al migrar Hermes (misión 5) se reescriben CM-14 y CM-58. Evidencia: 9 lotes (L46-L79), ~13 autorizaciones por archivo en un lote; un hook global dio falso positivo y se retiró a los 11 min tras frenar a dos sesiones nocturnas (L55).
- [ ] **P67 · El uso semanal se ve antes de decidir**: `/estado` muestra consumo de la semana y lo que queda (que una sesión pueda leerlo: NO VERIFICADO); el gasto sobre un tope por proyecto se autoriza una vez en la ficha, no tramo por tramo; toda cifra de tokens a Guido va como "gasto estimado" (contenido × relectura) y al cerrar se anota el real. Evidencia: 8 lotes; OK de gasto 7 veces en 5 chats (L10); cifras ~3 veces bajas (L10); carriles decididos "para economizar" sin número (L63).
- [ ] **P68 · Pausa ordenada para todo el equipo**: una frase de Guido ("corto a las 15:30", "me voy con la PC", "se acaba el uso", "me quedo sin internet") y el director deja a cada obrero con commit wip declarado, árbol limpio, sin procesos, "paso exacto donde retomás" y la lista de archivos fuera del repo; al volver, cada uno se re-presenta solo. Extiende al día el checklist de D §9.5. Evidencia: L14, L19, L40, L54, L64 (+L17, L30, L78); obrero parado ~3 h tras un corte de internet (L54). Refuerza P58 y P62.
- [ ] **P69 · Ficha de presencia del PO y guion de dispositivo**: la ficha del kit dice qué solo Guido puede poner (VPN y cuánto dura, teléfono de prueba y su versión, días de oficina, lo que pide administrador); el director pone primero y en orden de valor los pasos que lo necesitan; el guion de teléfono arranca con un chequeo de infraestructura (pantalla, depuración USB, túnel, VPN), y todo pedido físico a Guido sale por el director o el "te espera", nunca solo en la pestaña del obrero. Evidencia: 15 lotes; 67 min contra 40-60 previstos (L70); 15 min de 1 h 30 (L71); pedido de depuración USB en una pestaña que Guido no miraba (L82). Refuerza P60.
- [ ] **P70 · Candado de recursos por script**: `turno <recurso>` (ensayo, puerto, binario, suite, teléfono) con archivo de dueño, hora y vencimiento que el obrero toma y suelta sin pasar por el director; y para la PC compartida, un verbo que mida RAM libre (con reintentos: el valor baila) y liste qué contenedores y sesiones de qué proyecto están vivos y si se pueden bajar, más un tope de suites completas a la vez. Evidencia: 13 lotes de turnos (L35: 25 "pido" en un día); suites de 4 a 12 min con 5 sesiones (L33); RAM que bloqueó un sub-paso y terminó en el teclado de Guido (L63, L69).
- [ ] **P71 · El subagente tiene tope y latido**: cada subagente lleva tope de tiempo (aviso a la hora) y un latido visible (archivos tocados); "stopped with background work" sin informe cuenta como "no entregó": se reemplaza por uno nuevo con encargo autocontenido y nunca se reanuda; el cierre del sub-paso exige "ningún proceso vivo del subagente"; el implementador tiene su propio corte de contexto (~250-450k, medido). Antes de un "¿qué pasó?", el director mira si hay subagentes en curso. Evidencia: 13 lotes; 3 h 20 sin señal (L30); murió de nuevo al reanudarlo, ~3 h sin aviso (L52); 2 de 3 consultas del despertador fueron falsas alarmas (L69). Hallazgo tanda H-37 sin propuesta hasta hoy.
- [ ] **P72 · `/release` junta las condiciones y muestra el texto público**: campo "condición de release" en la ficha del módulo (se anota por sub-paso), un `release-bloqueado` con motivo que `/release` lee y respeta, orden de despliegue e interruptores verificados por script (base antes que app, versión mínima), y el OK agrupado de A-5 le muestra a Guido el texto "Para usuarios" ya comparado contra el tag anterior. Evidencia: 5 lotes (+O L35); condición escrita en 4 lugares sin freno (L19); 3 de 4 viñetas públicas cayeron al verificar (O-L35); el script de release dijo "actualizado" sin escribir nada (L18).
- [ ] **P73 · El remoto entra al arranque**: el chequeo de F §15 (o `doctor`) suma una línea con la última corrida de CI de la rama ("rojo desde…", "en cola sin máquina") y un chequeo `gh` de solo lectura de la seguridad del repo (escaneo de secretos, protección de `main`, visibilidad); regla escrita "CI sin máquina dos veces: correr local, declararlo y seguir"; el verde de entorno se mide desde un clon limpio cuando el sub-paso toca config o el script del ambiente. Evidencia: 6 lotes; CI rojo 5 días (L25); escaneo de secretos apagado mientras el repo fue público (L62); verde local por una carpeta ignorada, CI rojo 3 corridas (L81).
- [ ] **P74 · Fugas laterales en el runbook de F**: F suma cinco vías que hoy no nombra (la selección del IDE que se adjunta sola, el historial del portapapeles de Windows, la ventana de clave sin foco, la salida verbosa de builds y herramientas, el enmascarado improvisado) y la pregunta "¿qué trae esta lectura?" además de "¿escribe?"; para imágenes, una regla de fábrica: la evidencia con datos reales vive fuera del repo con registro (ruta, tramo, quién la borra) y se borra al cerrar; notificaciones apagadas antes de capturar un teléfono. Evidencia: 9 lotes de credenciales (L16, L22: valor de producción adjunto sin pegarlo) y 5 de imágenes (L69: 24 capturas sin dueño); O-L23, L45, L48, L61 (lecturas que traen secretos o datos).
- [ ] **P75 · Idioma fijo**: una línea en el núcleo común de D y en el CLAUDE.md del molde: todo texto a Guido o a otra sesión, narración incluida, en español; el piloto mide si baja en Sonnet. Evidencia: 5 lotes; la última línea del turno en inglés ante una pregunta directa (L10); 5 de 7 casos en el obrero Sonnet (L67). Tanda H-26 sin propuesta.
- [ ] **P76 · Dos modos con nombre en `/obrero`**: "spec" (escribe el spec y lanza el red team; no toca código) y "decisiones" (cola de decisiones de Guido en tandas cortas, un clic cada una, registro con su commit; "si no contesta, no se lo apura"), sumados a la tabla de roles de D §6. Evidencia: 6 de 6 sesiones de spec abiertas con /obrero (L63, O-L16, O-L67, O-L73); ~20 decisiones en 1,5 h (L41) y una cola de ~30 propuestas sin respuesta resuelta igual (L42).
- [ ] **P77 · El resumen del día trae lo que Guido no ve**: además de la parte común de C-5, tres renglones fijos: "hablado con otros directores (qué se ofreció, qué se adoptó)", "lo que medimos y aprendimos", "lo que el método atajó hoy (en números)". Evidencia: L65 (4-5 "¿qué te dijo?" en 1 h), L68, L78 (resultado de una medición pagada sin reporte), O-L22, O-L25, O-L45, O-L58.

**Refuerzos (no son propuestas nuevas):**
- Refuerza **P18**: el gate de texto sobre líneas agregadas no lo cubren ni el trinquete ni el corrector de secretos (hueco 4, 11 lotes); conviene sacarlo de "en espera".
- Refuerza **P19**: hay un `mutar.py` funcionando en Hermes Mobile (L67) listo para generalizar; falta el modo `--comando` que falle si corre 0 pruebas (L71).
- Refuerza **P23**: el paquete del revisor (diff contra el SHA base, status, tabla de mutaciones con su rojo) armado por script es lo que más vueltas ahorra (hueco 8).
- Refuerza la **regla de prosa de F §12** "sin config, la app no arranca": se repitió en L16, L20, L28 y L33 (dos pedidos llegaron a producción sin escribir); F dice que "se vuelve mecánica si se repite", y ya se repitió.
- Refuerza la **nota de G §22 y TABLERO §6** "cortar procesos por identificador": `taskkill` por nombre sigue en `allow` (L52) y mató procesos de otras sesiones (L30, L40, L52, L63); pasarla de prosa a `deny`.

### Lo que pidió texto completo

29 entradas marcadas "Necesita texto completo: sí". Con ★ las 15 que más pesan en los huecos y propuestas de arriba (el techo de la sesión madre).

| ★ | Entrada | Archivo y tramo | Para qué |
|---|---|---|---|
| ★ | C-L17-3 · Noche "autónoma" con Guido dando permisos de merge | 23f8dd9f, 00:00-00:30 UTC del 2026-10-22 | qué permiso se pedía (P66, P68) |
| ★ | C-L28-1 · Worktree sin config cae a producción | 69b6cf68, ALERTA ~16:55 del 2026-10-20 | texto de la alerta (refuerzo F §12) |
| ★ | C-L31-1 · Rondas del revisor sobre un guardián | 76bfe51b | cuántos hallazgos eran de integridad (hueco 8) |
| ★ | C-L42-2 · Mesa de decisiones como pestaña de obrero | af7c0d47 | preguntas y respuestas (P76) |
| ★ | C-52-2 · Subagente muerto al reanudarlo | eea27c08 (los otros dos episodios están en el chat del director) | P71 |
| ★ | C-69-1 · Falsas alarmas del despertador | 7e1fae97 | P71 |
| ★ | C-77-5 · El perímetro de "no tocar producción" más ancho que la base | d13edf18, informe del red team 12:07 | qué endpoints quedaban (F §12) |
| ★ | C-L79-3 · Dos carriles comparten Docker, teléfono y puertos | e0e255ff (la "ventana" vive en el encargo archivado) | P70 |
| ★ | C-80-3 · Cuatro cortes de conexión con el PO presente | ecdfccc8 | si coinciden con la VPN (P69) |
| ★ | C-L82-7 · Pedido de depuración USB en la pestaña que Guido no mira | f523e2ed, 14:14-15:02 del 2026-10-06 | cuánto tardó (P69) |
| ★ | C-83-2 · Obrero esperando una parada del PO 2 h | fa72, 14:20Z-16:44Z del 2026-10-21 | si hubo trabajo de reserva (P69) |
| ★ | C-67-2 · Una pestaña murió a 834k y otra se cortó a 451k | 6a9b5771 | por qué murió (D §11, "800k") |
| ★ | C-21-1 · "Opción-trampa" en la pregunta al PO | 408a3c0d | cómo se redactó (receta para P60) |
| ★ | C-L8-3 · El freno del asistente se amplía en caliente | f3, cierre del 2026-08-19 | dónde vive el kit del asistente |
| ★ | C-9-2 · `/compact` en mitad del cierre | 20badb18, últimas líneas | qué quedó sin subir |
|  | C-L1-4 · Compactación mezclada con una skill grande | 170824e9 | |
|  | C-L2-3 · El auto-update del plugin no llega a Code | c0b7caa2 | los "dos lugares" |
|  | C-L3-7 · Chat viejo que revive y retoma lo ya hecho | 3a092dcc y aa0b3ee8, 2026-08-13 a 08-19 | escrituras cruzadas |
|  | C-L4-1 · Datos personales de terceros con una herramienta externa | 34b59e0f | si hubo advertencia |
|  | C-L6-8 · Transcripciones crudas al repo | Reuniones, 2026-08-18/19 | qué entró al commit |
|  | C-L8-1 · Acción narrada que no ocurrió y registro duplicado | f3, 2026-08-03 16:14-18:42 | |
|  | C-L8-6 · Dato de conexión por imagen o atado a una planilla | f1, 2026-09-09 15:20 y 2026-09-14 11:44 | |
|  | C-9-4 · Claude en primera persona de Guido | 20badb18, 2026-10-16 12:33 | si viene del texto de la skill |
|  | C-26-6 · Reorganización de docs a mitad de proyecto | 5f35bfc5, después de las 17:18 del 2026-09-21 | plantilla para la misión 5 |
|  | C-L28-4 · Smoke con la app del propio PO abierta | 69b6cf68, 14:40-16:55 | |
|  | C-37-3 · "Repetime" por un problema visual | b (L37) | |
|  | C-L48-3 · Obrero sin actividad ~3 h con preguntas a Guido | cced057b | si eran de las 5 de A |
|  | C-L60-6 · Un dicho del PO viaja como hecho a otro director | 277bebe2, 11:46-11:50 del 2026-10-19 | |
|  | C-L65-3 · Skill de proyecto que no aparece en VS Code | D2 (L65), ~15:05 del 2026-09-21 | |

### Lo que NO es hueco (y por qué)

1. **El encargo director→obrero reescrito a mano con el mismo esqueleto** (14 lotes: L18, L30, L32, L37, L38, L39, L41, L44, L54, L56, L70, L76, L78, L80): lo decide D §15 paso 2 (el encargo es un archivo con campos fijos y estado de partida por script), D §6.3 (las reglas van en la definición del subagente, no en cada encargo) y D §5 (núcleo común). Los chats confirman la decisión: falta construirla.
2. **El merge de un tramo a `main` pide el clic de Guido** (7 lotes: L40, L50, L56, L65, L72, L73, L80): D §8.3-4 ya decidió que lo hace el director con el gate completo y sin preguntar; solo `publicar` pide el OK (A-5). Es una contradicción con la práctica de hoy, no un hueco.
3. **El red team del spec sin criterio de salida** (7 lotes: L15, L31, L42, L64, L67, L71, L73): D §6.4 fija máximo 3 rondas y que la 2 y la 3 miren solo lo que cambió. Queda una línea: qué pasa si la tercera no sale limpia (L73).
4. **Guido PO de los dos lados firma dos veces; control de igualdad del canon; "obrero de mesa"** (L12, L29, L32, L43, L59, L70, L81): G §7.1-3 (decisión 4) deja un acuerdo en un solo archivo y "con un solo PO para los dos proyectos, es una pregunta, no dos"; el doble texto y su control desaparecen.
5. **El worktree no hereda config, dependencias ni limpieza** (L16, L20, L28, L44, L45, L51): H §10.2 (decisión 7) con el script `worktree` (`.worktreeinclude`, `comando-setup`, `cerrar` que se niega si no está mergeada) y F §12 ("sin config, la app no arranca"). Solo cambia la urgencia (ver refuerzos).
6. **El obrero se traba esperando un clic o una pregunta con botones** (L14, L15, L16, L33, L48, L83): D §9.4 (30 min de día y avisa al director; de noche, PARADA) y D §13.4 ("te espera" en un solo lugar). Lo que sigue afuera es el aviso al celular (L20, una vez).
7. **La evidencia del obrero vive fuera del repo** (L17, L45, L54): D §8.2 la pone en `bitacora/<fecha>-evidencia-<ID>.md` y D §12.1 lleva el gate a un script del proyecto. Lo único que sigue afuera son las imágenes con datos reales (hueco 15).
8. **Choques entre carriles en documentos comunes y TODO escrito en tres saltos** (L21, L26, L33, L34, L69, L71, L73, L76): D §5 ("un encargo no comparte archivos con otro abierto"), D §8.5 (handoff, TODO y CHANGELOG solo en el `/cierre` del merge a `main`) y la decisión 5 de D, provisoria con revisión integral. Los casos van a esa revisión, en especial los choques semánticos (L33).
9. **Desvíos del spec en obra y consultas que siempre aceptan la recomendación del obrero** (L35, L58, L66, L69): D §13 clase 1 (el obrero decide y declara `DESVÍO: qué · por qué · cómo se deshace`) y la regla del "ya lo sé".
10. **Contexto autoestimado y pestañas elegidas por el % que mide Guido** (L57, L59, L71): D §11.1-2 lo mide un script y el AVANCE trae "contexto · falta".
11. **Proyecto sin código que reinventa estado e inicio/cierre** (L1, L3, L4, L5, L6) y **palabras que se confunden** (L8, L9): H-11 (proyecto sin código) y el `glosario` de `referencia/` del árbol de B §4.
12. **Lecturas de producción con Guido de operador** (L13, L35, L61, L64, L67): F-4 "usar sin ver" ya lo decide; los chats miden el costo de hoy (~15 mensajes y ~35 min por lectura, L67). Que el clasificador del modo auto deje correr ese camino sigue NO VERIFICADO (L35: 5 negaciones en un día).

### Límites

- Lectura de segunda mano: no abrí chats; trabajé sobre lo que anotaron 83 lectores Sonnet, que veían solo la primera línea de cada respuesta de Claude. Lo que ellos marcaron NO VERIFICADO sigue así.
- Los conteos son de **lotes** donde apareció el tema; un mismo episodio leído por dos lotes (pasa en Hermes, por ejemplo L20 y L17 sobre la misma noche) puede contarse dos veces. No son mediciones ni se pueden sumar con la síntesis A.
- 73 de los 83 lotes son de Hermes (Desktop L11-L55, Mobile L55-L83): todo hueco de director y obrero pesa más por eso; los de proyectos chicos (L1-L10) quedan con conteos bajos aunque sean de otro tipo de trabajo.
- Contra los DISENO hice grep por palabras clave y leí solo las secciones que aparecieron (D §5, §6, §7, §8, §9, §10, §11, §12, §13, §14; F §6, §9, §12, §14, §15; G §4, §7, §8, §22; H §9, §10). Un hueco que el diseño trata con otras palabras puede habérseme pasado.
- La sección 1 de `ya-sabido.md` (bitácoras de Hermes) la usé con grep sobre los códigos que citaban los lectores; no la leí entera. CM-63 lo citan los chats y no figura en el índice.
- Que una sesión pueda leer el uso semanal de la cuenta (P67) y que el aviso al celular exista en VS Code son **NO VERIFICADO**.
- Los proyectos van por alias deducidos de la carpeta de cada lote; donde un lote mezcla carpetas (L1, L2, L6, L8, L10, L55, L83), el alias es el de la mayoría.

## 4. Para la próxima pasada (lecciones de la receta)

- **El presupuesto por lector hay que medirlo con el `ya-sabido` real.** Con lotes de 200 KB y un `ya-sabido.md` de 112 KB que cada lector
  lee entero, el lector promedio costó 251 mil tokens nuevos (166-335 mil): 1,3-2 veces el "3× el contenido + 60 mil" que imprime
  `recortar.py`. Para la próxima: `recortar.py` tendría que recibir el tamaño del `ya-sabido` y sumarlo por lector, o el `ya-sabido` se parte
  por lente (la lente A no necesita las bitácoras de Hermes; la C sí).
- **Lo nuevo entre cortes no es "+10-15%"**: en 14 días los mensajes entre sesiones crecieron 75%. Antes de prometer un número, correr
  `condensar.py --desde` y medir; el plan lo decía y aun así la primera cifra que vio Guido fue la vieja.
- **El tope de 20 subagentes en paralelo** marca el ritmo: 83 lectores de ~7 minutos cada uno tardaron ~40 minutos de reloj, lanzados por
  tandas a mano (Guido no quiso la herramienta Workflow). Si la herramienta queda autorizada, el mismo trabajo son dos llamadas.
- **La suma mecánica de la lente A por script** (`extraer.py`: 2.872 filas → una tabla por decisión) le ahorró a la síntesis Opus recontar y
  dejó la discusión en los veredictos y los sesgos. Vale para cualquier lectura con tabla fija.
- **Tres chats estaban duplicados** (mismo cuerpo con otro id de sesión: sesiones reanudadas o movidas de carpeta) y los lectores de L3, L4 y
  L5 leyeron dos veces el mismo chat del proyecto de entrevistas. `recortar.py` debería deduplicar por el hash del cuerpo antes de armar los
  lotes.
- **Los lectores confunden los códigos del LECTOR con los números de decisión de los diseños** (D-8 del LECTOR es la revisión; "D §8" del
  diseño es ramas y escritores). Las síntesis lo corrigieron a mano. Para la próxima: un solo juego de códigos, o prefijos distintos.
- **Las decisiones que piden "contá" dan ✔ enormes por construcción** (G-1: 3.876). Conviene que el LECTOR pida el conteo en una columna
  aparte del veredicto, para que la suma no se lea como fuerza de la confirmación.

## 5. Dónde quedó lo hallado (privado, fuera de todo repo)

`D:\vibe-hallazgos\contraste-2026-11\`: `condensados-nuevos-desde-corte\` (los 114 chats nuevos con sus 750 subagentes y el `costos.csv`
de donde sale el corte), `condensados-7-chats-que-cruzaban-el-corte\`, `prueba-3-chats\`, el log de la condensación, y `lectura\` con los
recortados, los 83 lotes, los 83 archivos de hallazgos, las tres síntesis Opus (`A-contraste.md`, `B-habitos.md`, `C-huecos-y-otras.md`),
los archivos por lente y la suma mecánica, el `ya-sabido.md` de 112 KB, el `LECTOR-contraste.md` usado, el registro de costo por lector y
los scripts auxiliares (`extraer.py`, `costo_subagentes.py`). Los condensados hasta el corte viejo siguen en `D:\vibe-hallazgos\clientes\`.
La carpeta de trabajo `D:\vibe-research\clientes\contraste\` queda hasta que Guido decida borrarla. **No se borró nada.**
