# El mapa por objetivos

> **Misión 4, tramo 3** · 2026-10-14 · **Estado: borrador para revisar con Guido.** Solo diseño: reparte
> todo lo que juntó la investigación entre los 7 objetivos, cada cosa con su línea base. No elige: el top
> 10 lo elige el spec (tramo 5) y el diseño de cada pilar es el tramo 4. El plan: [`PLAN.md`](PLAN.md).

**Qué entró:**
- las 57 propuestas del acta (`tips/tanda-2026-10-chats.md`, P1-P57);
- las 10 mejoras de la [radiografía](RADIOGRAFIA-director-obrero.md) §10;
- lo del tramo 2: [`FLOTA.md`](FLOTA.md), [`REPOS.md`](REPOS.md) y [`PLATAFORMA.md`](PLATAFORMA.md);
- 🆕 **el barrido**: 3 lectores Sonnet recorrieron las 5 síntesis de la investigación (los dos proyectos
  largos, los proyectos chicos, la otra PC de Guido y la del compañero) contra un índice de todo lo
  anterior, y devolvieron **50 cosas vistas que no habían llegado a ninguna conclusión**, más 3 menores.
  Van con código `S-` (§2-§8);
- el **Anexo A** de la radiografía: los 11 cambios que Mobile aprobó el 10-14 (código `A-n`).

**Costo:** el barrido gastó **~405 mil tokens**, 1,6 veces lo estimado (~250 mil). Lo que más pesó fue el
lector de las 3 síntesis chicas (~167 mil). El cruce lo hizo el chat principal.

**Cómo leer las tablas.** Cada cosa va en **un solo** objetivo, el que más mueve. Si mueve otro,
el número aparece entre paréntesis. Los códigos:
- `P-n`: propuesta del acta;
- `#n`: mejora de la radiografía;
- `S-x-n`: hallazgo del barrido (D = Desktop, M = Mobile, R = proyectos chicos, U = la otra PC, C = la
  PC del compañero);
- `F§n` y `R§n`: punto de FLOTA o de REPOS.

Los números del barrido son de lectores Sonnet sobre síntesis: son **conteos de lectura, no mediciones**.

## 0. En una pantalla

| Objetivo | Cosas | Línea base más fuerte | Estado |
|---|---:|---|---|
| 1 · Menos tokens | 20 | Director: **~370 mil releídos por respuesta**; el 98% del costo es releer | Medida (Q1) |
| 2 · Calidad | 27 | **26% de los arreglos arreglan otro arreglo**; casi ninguno trae su prueba | Medida (git) |
| 3 · Documentable | 15 | **0 de 10** proyectos marcan su versión; documentos de 500-915 KB | Medida |
| 4 · Procesos | 17 | **~120 pestañas abiertas a mano**; `/smoke` reinventado en 9 proyectos | Medida + lectura |
| 5 · Entre PCs y personas | 14 | Una sesión de otra PC **5 días inalcanzable**; un usuario nuevo necesitó ~6 h de explicación | Lectura |
| 6 · Atención de Guido | 25 | **~110 "¿cómo vamos?"**; 39 de 115 turnos de un director eran ruido | Lectura |
| 7 · Seguridad | 21 | **8 de 10 proyectos sin `deny`**; 12 alertas abiertas | Medida |

Lo que se lee del mapa:
1. **El 6 y el 2 son los objetivos con más cosas.** La mayoría de lo que molesta a Guido sale de dos
   causas: hacer de operador entre pestañas y que las fallas vuelvan.
2. **El barrido sumó sobre todo al 7 (seguridad) y al 2 (calidad).** Son casos concretos que no habían
   llegado al acta: defaults que apuntan a producción, guardas que se desarman, "no se toca" cruzado con
   herramientas amplias, backups vacíos en verde.
3. **El 5 es el más flaco en mediciones.** Casi todo es lectura de chats. Hace falta una medida antes del
   piloto (§1).
4. **Ocho racimos cruzan los objetivos** (§9): son los candidatos naturales a las piezas del pack.

## 1. Líneas base: qué se mide y cómo se repite

Cada objetivo tiene una o dos medidas **que se pueden volver a correr cada mes** con los scripts de
`observatorio/investigacion/`. Esto es el tablero de la medición repetible del PLAN.

| Obj. | Medida | Hoy | Cómo se repite |
|---|---|---|---|
| 1 | Lectura de caché por respuesta, según el rol | Director ~370 mil · obrero Opus ~320 mil · implementador ~230 mil | `costos.py` sobre los chats nuevos (`condensar.py --desde`) |
| 1 | % de turnos del director sin novedad | 34% (39 de 115) | Lector sobre los chats nuevos (muestra) |
| 1 | Lo que carga una pestaña antes de trabajar | 62-75 KB de skills | `wc -c` sobre las skills de cada rol |
| 1 | Lo que inyecta el hook de arranque | 2 proyectos se pasan del tope de 10.000 caracteres; vibe-kit al 87% | `wc -c` de lo que inyecta cada hook |
| 2 | % de arreglos que arreglan otro arreglo (72 h) | Mediana 26% (17-44%) | `repos.py` |
| 2 | % de arreglos que traen su prueba | 0-45% (uno: 94%) | `repos.py` |
| 2 | Archivos con 3 arreglos o más | 0-37 por proyecto | `repos.py` |
| 2 | CORREGIR del revisor en la 1.ª vuelta, por pruebas | 7 de 9 a 12 de 13 | Lector (muestra) |
| 3 | Proyectos que marcan su versión del método | 0 de 10 | `flota.py` |
| 3 | Documentos de estado por encima del tope | Handoff de 503 KB; tablero de ~900 KB; diario de ~915 KB | `flota.py` + `wc -c` |
| 3 | Contradicciones entre skills de un mismo proyecto | ≥8 | Grep de frases viejas (a escribir) |
| 3 | % de commits que solo tocan documentos | 51-82% con el método completo | `repos.py` |
| 4 | Comandos tipeados para abrir una pestaña | 3 por apertura, ~120 aperturas | Lector (muestra) |
| 4 | Parecido de `/inicio` y `/cierre` con el molde | 5-81% | `huella.py` |
| 4 | Duración de un `/cierre` de solo documentos | 15-84 min | Lector (muestra) |
| 5 | Tiempo de respuesta entre PCs | Un caso de 5 días | 🆕 **A medir**: no hay script; `claude agents --json` solo ve su PC |
| 5 | Abrir un rol en la 2.ª PC sin editar nada | No se puede: hay rutas absolutas en las skills | Grep de rutas absolutas en las skills (a escribir) |
| 6 | "¿Cómo vamos?" por día | ~110 en total (~80 + ~30) | Lector (muestra) |
| 6 | Pegados fuera de su pestaña | ~55 | Lector (muestra) |
| 6 | Intervenciones de Guido por tramo | La alarma (2-3) se cruzó dos veces | La alarma, mirada en cada cierre |
| 7 | Proyectos con `deny` | 2 de 10; el molde trae 0 | `flota.py` |
| 7 | Alertas de seguridad abiertas | 12 (detalle privado) | El archivo privado de alertas |

**Lo que falta medir antes del piloto**: el tiempo de respuesta entre PCs (objetivo 5) y el costo en
dólares (sigue **NO MEDIDO**, acta Q1). El resto ya tiene número.

## 2. Objetivo 1 · Menos tokens

| Qué | De dónde | Línea base |
|---|---|---|
| Verificador mecánico del aviso + estado de partida por script | #1 = P23 (2, 4) | 41 verificaciones a mano + 4 suites en 3 días |
| Silencio ante los avisos sin novedad | #2 = P27 (6) | 34% de los turnos del director |
| Revisión proporcional: el arreglo trivial no reabre al revisor | #4 = P28 (6) | 7 de 8 segundas vueltas salen APROBADO |
| Modelo y esfuerzo declarados en cada encargo | #5 = P26, P11, P29 | ~25 tareas de texto en Opus por proyecto; esfuerzo: 0 menciones |
| Handoff con tope; el hook inyecta solo estado, próxima acción y bloqueos | P47 (3) + F§3 | 2 proyectos se pasan del tope del hook |
| Imágenes al final, reducidas y en un subagente | P4 | 74 capturas llevaron una pestaña de 226 a 708 mil |
| Modos "consulta" y "hotfix" con arranque liviano | P51 (4) | Un hotfix de 15 líneas pasó por 3 auditores |
| `/cierre` en dos caminos: solo documentos o código | P53 (6) | 15-84 min por cierre |
| El cierre de cada sub-paso, en un solo script | S-M-2 (4) | ~12 llamadas iguales por sub-paso; totales recalculados a mano en 6 lugares |
| Un piloto antes de lanzar N agentes, por la misma ruta de salida | S-R-1 | Un workflow con 11 de 14 agentes caídos entregó igual su síntesis |
| Red-team con su modelo de amenaza y un tope de 3 rondas | S-U-1 (2) | 8 auditorías Opus seguidas hasta una limpia |
| Timeout por prueba y "rojo de red" separado de "rojo de código" | S-U-5 (2) | ~5 h en vez de 6 min; ~20 consultas manuales |
| Archivos generados sin fecha adentro | S-D-10 | La misma advertencia en ≥8 encargos y ~15 reportes |
| Duplicados entre tandas del Extractor, por script | S-U-10 | 4 de 15 links repetidos |
| Pestañas de solo texto y el merge, en una pestaña nueva Sonnet | P29 | Un obrero Opus a ~700 mil murió esperando un merge |
| La caché del subagente dura 5 min; cambiar de modelo o esfuerzo la invalida | PLATAFORMA §6.5 | Va a la política de modelos |
| Documentos que hay que leer enteros (después de compactar, solo el último encargo) | #8 (3) | Una receta lee 703 KB enteros |
| Lo que carga cada pestaña | #8 (3) | 62-75 KB |
| Commits por día activo de los proyectos largos | R§5 | 16-34 |
| Cortes de la API: estado en disco, confirmar qué quedó antes de seguir | S-R-8 (6) | ~12 "continue" a mano |

## 3. Objetivo 2 · Mejor calidad de código

| Qué | De dónde | Línea base |
|---|---|---|
| **Freno mecánico, no prosa**: toda regla nacida de una falla trae algo que se ejecuta | P1 = #3 (4) | 5 familias de falla reincidieron con la regla escrita, en ≥60 lotes |
| Las reglas, **dentro de la definición del agente** que las tiene que cumplir | #3 + PLATAFORMA §6.3 | Las reglas de las pruebas viven en el encargo |
| Helper de edición exacta + hook que avisa ante heredoc o `python -c` | P17 (1) | ~290 casos |
| Gate de texto sobre las líneas agregadas | P18 | Atribuciones: la regla se cumplió 0 de 2 veces |
| `mutar` genérico + tabla prueba → mutación → línea del rojo | P19 | ~130 casos |
| Hora y fecha siempre medidas | P3 | ~33 casos |
| "Listo" dice qué cruzó y qué no miró | P5 (6) | ~16 lotes |
| Verificador en frío con plantilla fija | P24 | Encuentra algo real casi siempre |
| Red-team también para lo construido, con lentes por ronda | P25 | La ronda siguiente encuentra lo que rompió el arreglo |
| READY después del red-team; "verificado en el sistema vivo" y "supuestos sin contrastar" | P52 (3) | READY revertido 3 veces |
| Reglas de Windows sembradas en el `CLAUDE.md` | P54 (4) | 21 lotes en la PC del compañero |
| Hook post-edición que muestre el error real, o que no se instale | P56 | Claude aprende a ignorarlo |
| Arreglo con su prueba (la regla que anda en un proyecto) | R§3 | 0-45%; un proyecto: 94% |
| Las mismas familias de borde en cada revisión: la matriz va en el encargo | S-D-1 | 5 de 6 primeras pasadas con las mismas familias |
| Reproducir el hallazgo del revisor antes de devolverlo | S-M-3 | Un caso: calcular dio 3, correr dio 4 |
| Después del APROBADO, solo textos y datos de prueba | S-M-11 | ≥6 casos; un defecto entró por ahí |
| La skill de gate trae los casos que se repiten (clon sucio, CI sin runner, solo docs) | S-M-1 (4) | 3 de 5 líneas base repetidas por el entorno |
| El "no se toca" va por archivo y rango, no por sección entera | S-D-11 | 4 excepciones en una tarde |
| El verificador recibe la pregunta, no la teoría del que lo manda | S-R-2 | 3 premisas del director desmentidas por el código |
| Lo que se imprime o se ve se renderiza antes de decir "verificado" | S-R-4 | Una regla de estilo desbordó 7 de 17 tablas |
| Antes de borrar, mover o renombrar: censo de quién lo usa | S-U-3 | Un backup estuvo 6 días sin copia |
| Lanzar lo remoto para que sobreviva al cliente; relanzar sin pisar el respaldo | S-U-2 | Una copia de seguridad borrada por el relanzamiento |
| Leer `origin/main` y no el checkout local ni el repo hermano | S-C-3 (3) | Checkouts cientos de commits atrás |
| Script de integridad de las tablas markdown | S-D-9 (4) | 4 tablas rotas en ~10 h |
| Afirmar de memoria ("no existe") | H-12 | ~60 afirmaciones del director |
| Citas `archivo:línea` que se corren en el mismo commit | H-21 | 7 de 9 |
| El estado se escribe antes de que la acción pase | H-15 | `/cierre` lo multiplica en 4 documentos |

## 4. Objetivo 3 · Proyectos documentables y estables

| Qué | De dónde | Línea base |
|---|---|---|
| **Un solo método, podado**: skills canónicas en el kit + una ficha por proyecto | #8 = P31 (1, 4, 5) | 3 dialectos; ≥8 contradicciones |
| La versión del método, visible y legible por script | P44 (parte) + F§1 | 0 de 10 |
| `docs/NORTE.md`: para qué es, para quién, qué no hace, los hechos que solo sabe Guido | P7 | ~28 lotes |
| Regla de crecimiento: todo cambio dice cómo se sabrá si anduvo | P2 (1) | 36 cambios de método en 5 días |
| Documentos con tope (la cabecera corta que inyecta el hook) | #8 + F§4 | Handoff de 503 KB; 5 proyectos con CHANGELOG o DECISIONS de 260-440 KB |
| Estado "REPORTADO POR EL USUARIO" y estado de producción con fecha | P55 (2) | 10 lotes |
| Lo "no verificado" pasa a una verificación con fecha; `/cierre` cruza lo anunciado con lo anotado | S-U-7 | De 4 pendientes anunciados, faltaban 3 |
| El TODO miente por acumulación: fecha por ítem, poda y balance en el cierre | S-U-8 (6) | ~29 ítems falsos en 3 semanas |
| Archivo "ecosistema" y tabla de esperas con disparador | S-M-10 | Una cláusula cumplida sin que nadie la retome por 17 días |
| Entregable con estados (provisorio, vigente, histórico) | S-R-7 | Una ficha aprobada pisada |
| Copia del Arquitecto dentro de un proyecto | F§7 | 1 proyecto |
| `AGENTS.md`: otra convención de la que el kit no dice nada | F§9 | 4 proyectos |
| Datos del proyecto clavados dentro de las skills | Radiografía §8 + S-D-3 | 6 encargos seguidos dicen "la rama de la ficha está vencida" |
| % de commits que solo tocan documentos | R§4 | 51-82% |
| Plantilla de "riesgo aceptado" (qué, quién, fecha, disparador) | S-M-13 (6) | 4 riesgos aceptados en 24 h |

## 5. Objetivo 4 · Procesos estables (menos trabajo a mano)

| Qué | De dónde | Línea base |
|---|---|---|
| **`/smoke` y `/release` al molde** (pasaron la regla de 3+) | F§6 | En 9 y 8 proyectos, cada uno a su manera |
| Scripts de gate versionados (foto antes y después, lectura de producción con guarda, config con destino obligatorio) | S-D-4 (7) | ~25 llamadas de preparación por gate |
| Modo B cierra con "Ejecución" | P6 (3) | Un solo uso real |
| Perfil "proyecto sin código" y "feature chica" sin chat nuevo | P9 + S-R-6 (6) | 10 lotes; un spec READY se ejecutó en 2 min |
| Modo A verifica la carpeta real | P10 | 1 caso |
| `/retro`: "¿lo hago skill?" cuando algo se pidió 3 veces | P22 | H-36 |
| `/inicio` con misión incrustada, `git fetch` y aviso de handoff viejo | P37 + S-R-3 (5) | Un handoff de 70 días; repos 15-33 commits atrás |
| La próxima misión, dentro del handoff | P48 (6) | 22 lotes |
| Las variantes chicas: director de una pestaña + subagentes, y bandeja operador → dev | P35 (3) | Funcionaron |
| Prototipo antes del spec en features de pantalla | P57 (6) | Se aprobó en minutos |
| El arranque del rol imprime su ruta y la lista de sesiones ajenas esperables | S-M-9 (5) | 4 de 6 pestañas se alarmaron por sesiones ajenas |
| Worktree con su entorno ya enlazado | S-D-7 (5) | 5 tropiezos en un día |
| `simular-mensaje` para las pruebas de punta a punta de un bot | S-U-9 | 36 mensajes tipeados a mano |
| `/relevamiento` usado fuera de la skill: pedido a un tercero, formulario de campo, gate saltado | S-C-4 = P50 | 7 lotes |
| Antes de generalizar una skill, grep de lo que leen los hooks | S-D (menor) | — |
| Criterio escrito de qué modo de revisión usar | S-D (menor) | — |
| Similitud de `/inicio` y `/cierre` con el molde | F§1 | 5-81% |

## 6. Objetivo 5 · Trabajar bien entre 3 PCs y 2 personas

| Qué | De dónde | Línea base |
|---|---|---|
| **Multi-PC de verdad**: sin rutas absolutas; estado y lecciones al repo | #10 = P42, P34 (3) | 5 días inalcanzable; una lección que vivía en una sola PC |
| Remote Control prendido en todas las sesiones de la mesa (canal oficial, con cola) | PLATAFORMA §4 | La trampa del bypass (hipótesis, **NO VERIFICADO**) |
| Carpeta `mesa/`: contrato, ~18 tipos de mensaje, plantilla hecho/decisión/pregunta | P32 | 10 tipos escritos, ~18 en uso |
| Onboarding: receta de bienvenida y bloque "Máquinas y personas" | P44 (6) | ~6 h de explicación de palabra |
| Instalar con chequeo previo | P45 (4) | ~35 min de tropiezos en Windows |
| "¿Hay versión nueva del kit?" y la línea por PC fuera del update | P13 (4) | El Equipador casi no se usa |
| Una misión = un worktree; foto de `git status` al arrancar; commit por rutas | P46 + S-C-1 (2) | 23 de 33 lotes en la PC del compañero |
| El segundo escritor es una persona: el cierre hace fetch y avisa commits ajenos | S-R-3 | 5 aperturas con pull a mano |
| Carriles paralelos: el director reserva los números de decisión | S-M-12 (2) | 6 rondas extra en 36 h |
| Quién opera y quién aprueba no son la misma persona | P44 (parte) | 8 lotes |
| La memoria automática no viaja entre PCs: lo que importa va por git | PLATAFORMA §5 | — |
| Dos cuentas de GitHub firman los commits | F§8 | ❓ Pregunta abierta para Guido |
| Tablero que junte las 3 PCs | PLATAFORMA §6.7 | No existe nativo |
| 🆕 Dos proyectos chocan en la misma máquina: los procesos se cortan por su identificador, nunca por nombre | A-3 (7) | Un subagente casi corta la corrida del proyecto hermano |
| 🆕 **Mensajería multiagente**: un buzón por carpeta compartida (un JSON por mensaje), entre cuentas, PCs y también agentes de otros LLM. Viene con firma por agente y un arnés mínimo para los encargos autónomos | Pedido de Guido + borrador externo (2026-10-21) (7, 6) | `SendMessage` no cruza cuentas; 5 días inalcanzable; Guido de cartero |

## 7. Objetivo 6 · El tiempo y la atención de Guido

| Qué | De dónde | Línea base |
|---|---|---|
| **Una sola salida hacia Guido** ("ESPERO / TE NECESITO / NADA") + `/estado` + la alarma de intervenciones | #7 = P15, P38 (7, 3) | ~110 "¿cómo vamos?"; la alarma se cruzó dos veces |
| Abrir una pestaña en un paso | #6 = P16 (4) | ~120 aperturas a mano |
| Mensaje a Guido de 5 líneas, con el pedido primero | P30 | ~300 resúmenes repetidos |
| Todo texto para pegar empieza con "DESTINO:", sin marcadores | P33 (7) | ~55 pegados equivocados o "¿qué pego?" |
| `/cierre` con 3 líneas fijas | P36 (4) | ~60 casos |
| Lista única de "Pendientes del PO" | P38 | Pedidos repetidos al pie de ~40 mensajes |
| Glosario de dictado | P21 (2) | ~34 casos |
| Entregables a terceros sin "tono IA" | P43 | H-25 |
| Ninguna sigla sin glosa; tope de líneas en `/inicio` | S-C-5 | 20 lotes |
| Sección "Autonomía" en el `CLAUDE.md`: qué resuelve solo y qué pregunta | S-U-6 | 4 malentendidos de "dale" en 3 h |
| Desvíos al derecho: el "desvío menor" lo decide el obrero y lo declara | S-M-5 (7) | 7 de 8 consultas volvieron con la opción que ya traía |
| La pregunta va del director, no del obrero (el obrero no se bloquea) | S-D-8 | Un obrero estuvo ~8,5 h parado |
| Al usar una pregunta estructurada o un plan, repetirlos en texto | S-R-9 | 17 min hasta "¿cuál es la pregunta?" |
| Horas máquina contra horas con Guido presente | S-R-5 | 9,5 h propuestas contra 5,5 reales |
| "No me traigan como hallazgo lo ya decidido" | S-M-13 | 6 secciones reescritas por algo ya decidido |
| El "sí" vale solo para lo que se preguntó | S-M-14 (7) | 2 ensanches en un proyecto |
| Llaves públicas y cuentas de prueba en un archivo con nombre no secreto | S-D-2 (7) | 4 "ya la tenés" en una noche |
| Frenos del clasificador sobre lo ya autorizado | H-33 | ~30 frenos |
| El contexto lo vigila el usuario a mano | Acta A3 | 10 lotes |
| Sin navegador, el usuario es el QA visual | Acta A3 | 9 lotes |
| Cierres de turno "qué hacés vos: nada" | Radiografía §5 | ~100 |
| Esperas largas por una frase | H-09 | Un merge esperó 16 h |
| Tareas de fondo que mueren: "¿se trabó?" | H-37 | — |
| 🆕 El silencio de un subagente parece trabajo: sin informe, se mira git y los procesos | A-1 (4) | 1 h perdida |
| Archivos que Guido no encuentra | H-38 | — |

## 8. Objetivo 7 · Seguridad por defecto

| Qué | De dónde | Línea base |
|---|---|---|
| **Seguridad que se verifica sola**: el molde trae `deny`, `/inicio` avisa si está apagado | #9 + F§5 + PLATAFORMA §6.4 | 8 de 10 sin `deny`; el molde trae 0 |
| Una skill nunca guarda credenciales | P14 | 1 caso abierto |
| Pre-commit de datos sensibles sobre las líneas agregadas | P20 | — |
| El escáner mira solo lo agregado y da `archivo:línea` | S-M-14 + P36 | ~25 cierres con falsas alarmas |
| Reglas de permiso duplicadas para Bash y PowerShell | P12 (6) | H-33 |
| Preguntas fijas al arrancar: qué es de prueba y qué es sensible | P8 (3) | H-50 |
| Política de push declarada en el `CLAUDE.md` | P49 | 11 lotes |
| "Resumen de exposición para el dueño" en docs-fyd | P39 (3) | 1 corrida real |
| El `deny` de `.env*` deja legible el `.env.example`; `/inicio` declara el modo de permisos | S-C-2 | Claude no sabía que estaba en modo automático |
| Los defaults del código nunca son los de producción | S-D-5 | ~12 casos |
| Guardas escritas como lista de lo permitido ("ruidoso antes que mudo") | S-M-8 | 3 de 3 guardas desarmadas en la primera forma |
| Cada "no se toca" trae al lado la alternativa permitida | S-M-4 | ~14 cruces con herramientas amplias |
| Ningún bloque para pegar lleva `<...>`; el dato se pregunta antes | S-M-7 = P33 | 1 episodio, con credencial a rotar |
| Scripts de teléfono versionados (foco verificado antes de tipear) | S-M-6 (1) | Una clave de prueba cayó 2 veces en el campo equivocado |
| Plantilla de autorización con "después": qué se limpia y quién decide | S-D-6 | 3 fotos previas contadas por módulo y no por tabla |
| El acceso a producción se borra después de la última verificación | S-D-12 | — |
| Backups y descargas: se validan los bytes, no el status | S-U-4 (2) | Backups de 20 bytes durante semanas |
| "Ensayo" nombra dos bases distintas | S-D (menor) | El control caducó en 4 días |
| Barreras duras apagadas en un proyecto | Radiografía §6.6 | Alerta privada |
| Credenciales que pasan por el chat | H-34 | Alertas privadas |
| Datos reales compartidos antes de avisar | H-27 | — |

## 9. Las 10 mejoras de la radiografía: ¿construir o adoptar?

Según [`PLATAFORMA.md`](PLATAFORMA.md) §6. **Adoptar** = la plataforma ya lo trae y el diseño se apoya
ahí. **Construir** = hay que escribirlo. Casi todas son mixtas: se adopta la base y se construye el hueco.

| # | Mejora | Veredicto | Lo que se adopta | Lo que se construye |
|---|---|---|---|---|
| 1 | Verificador mecánico del aviso | **Construir** | Un subagente con `model` y `tools` fijos (Haiku o script) | El script de chequeo y el aviso de ≤6 líneas después del push |
| 2 | Silencio ante los avisos sin novedad | **Adoptar** + hueco | `notify_when_idle`: un solo aviso, sin gastar tokens (misma PC) | El filtro "solo si hay novedad" (hook con `asyncRewake`) y reescribir la regla que genera el ruido |
| 3 | Frenos mecánicos | **Construir** sobre lo nativo | `hooks`, `tools` y `disallowedTools` en la definición del agente | Los frenos mismos: gate de texto, `mutar`, edición exacta, commit seguro |
| 4 | Revisión proporcional | **Construir** | — | La regla del orquestador y la prueba de que el diff solo toca texto |
| 5 | Modelo y esfuerzo declarados | **Adoptar** + tabla | `model` y `effort` en el frontmatter de skills y agentes | La tabla por tipo de trabajo; el chequeo en la presentación |
| 6 | Abrir una pestaña en un paso | **Adoptar** | `claude -n --model --effort -w`; `start_session` en la app (👁️ sin doc) | El chequeo previo de lo que depende de Guido. Hueco: el esfuerzo al abrir desde la app |
| 7 | Una sola salida hacia Guido | **Adoptar** el estado + **construir** el resto | `claude agents --json` (misma PC, research preview) | El formato de cierre de turno, la lista única de pendientes y la alarma |
| 8 | Un solo método, podado | **Construir** | A comparar en el tramo 4: plugin desde un repo privado contra el Equipador | Las skills canónicas, la ficha por proyecto, la marca de versión y el test de coherencia |
| 9 | Seguridad que se verifica sola | **Adoptar** + chequeo | `deny` frena también en bypass; `disableBypassPermissionsMode` | El `deny` en el molde y el chequeo en `/inicio` |
| 10 | Multi-PC de verdad | **Adoptar** + respaldo | Remote Control + `SendMessage` con cola | Sin rutas absolutas; lecciones al repo; el canal por archivo queda solo como respaldo |

**Resultado: 4 adoptar (#2, #5, #6, #9), 4 construir (#1, #3, #4, #8) y 2 mixtas (#7, #10).** Lo
experimental (equipos de agentes, la vista de agentes) va al piloto, no al molde.

**Pilotos que ya nacieron solos** (Anexo A de la radiografía, aprobados en Mobile el 10-14): la **#4**
(el orquestador aplica los arreglos de solo texto sin otra vuelta), una parte de la **#3** (un script
de mutaciones de la casa, el único freno mecánico de los 11 cambios) y el gate corrido siempre con su
skill. Sirven para medir el antes y el después sin esperar a la misión 5. Y repiten el patrón: de 11
reglas nuevas, 1 es freno y ninguna dice cómo se sabrá si anduvo (P1, P2).

## 10. Los racimos: lo que va junto

Las ~140 cosas de las tablas caen en **8 racimos**. Cada racimo es una pieza posible del pack. Es la
entrada al tramo 4, que diseña de a un pilar, y al top 10 del spec.

| Racimo | Lo central | Objetivos | Capa del pack |
|---|---|---|---|
| **A · Frenos y verificación** | #1, #3, P1, P17-P19, P23; S-M-2, S-M-3, S-U-4, S-U-5, S-D-9 | 2 · 1 · 4 | Dirección |
| **B · Documentos con tope** | #8 (tope), P47, el tope del hook; S-U-7, S-U-8, S-M-10 | 1 · 3 | Base |
| **C · Una salida hacia Guido** | #7, P15, P30, P33, P36, P38; S-C-5, S-R-9, S-U-6, S-M-5 | 6 | Base + Dirección |
| **D · Modelos, ruido y revisión** | #2, #4, #5, P26-P29; S-U-1 | 1 · 6 | Dirección |
| **E · Un molde y la flota** | #8 (molde), P31, P44 (versión), P13, `/smoke` y `/release`; S-D-3, S-D-4, S-M-1 | 3 · 4 · 5 | El Arquitecto como puerta |
| **F · Seguridad por defecto** | #9, P8, P12, P14, P20, P49; S-C-2, S-D-5, S-M-4, S-M-7, S-M-8, S-D-12 | 7 | Base (molde) |
| **G · Mesa y PCs** | #10, P32, P34, P42, P44-P46; S-R-3, S-C-1, S-M-12, S-D-7; 🆕 el buzón multiagente (2026-10-21) | 5 | Mesa |
| **H · Niveles y puertas del Arquitecto** | P6, P7, P9, P10, P35, P51, P52, P57; S-R-6; 🆕 **los subproyectos** (2026-10-21) | 4 · 3 · 6 | El Arquitecto como puerta |
| **I · El agente de ecosistema** 🆕 (2026-10-22) | Conocer todos los proyectos a la vez y pensar entre ellos: el mapa (qué se conecta con qué), la salud de la flota, el reporte semanal, y "¿esto es proyecto nuevo, subproyecto o feature de otro?" | 5 · 6 · 3 | **Fuera del kit, o como adaptador**: es propio de la empresa de Guido. Se diseña último |

🆕 **Subproyectos dentro de un proyecto** (pedido de Guido, 2026-10-21, mientras se diseñaba el racimo C).
Un proyecto grande, como Hermes, tiene adentro subproyectos (por ejemplo, el tramo "una sola identidad").
Cada uno lleva su nombre y su propio:
- sistema de documentación y carpetas;
- historial;
- reporte (`/estado <subproyecto>`);
- estimación y registro de tiempos;
- consumo de tokens.

El Arquitecto abre cada subproyecto. Va en el **racimo H**, porque es la forma del nivel "proyecto largo".
Toca también:
- **B**: cada subproyecto con sus documentos propios corta el tablero único de ~900 KB;
- **C**: el reporte por subproyecto;
- **E**: el molde lo trae;
- el **objetivo 1**: el consumo por subproyecto se mide con `costos.py`.

🆕 **El agente de ecosistema, aparte del Arquitecto** (decisión de Guido, 2026-10-22, mientras se diseñaba el
racimo E). Se cortó por la pregunta que responde cada uno: el Arquitecto responde **"¿cómo hago esto bien?"**
(una PC, un proyecto, una feature, ponerlos al día); el agente de ecosistema responde **"¿qué tenemos y cómo
se cruza?"** (muchos proyectos a la vez). Meter los dos en uno repetía el scope-creep de ADR-004. Lo que ya
quedó decidido para que el camino esté allanado:
- **el registro de proyectos es el tablero interno de la empresa** (el Hub de la flota), no un segundo
  registro: ahí se dan de alta los proyectos y se cargan novedades cada semana. Se le piden 4 cosas: la URL
  del repo, el tipo (código · parcial · sin código), "se conecta con" y una credencial de **solo lectura**
  para un script. La credencial vive en cada PC, fuera de todo repo;
- **los dos agentes miran los mismos datos** (el Hub, la ficha del kit de cada repo y un mismo script) y
  ninguno guarda nada propio;
- **se hablan en las dos direcciones**: el ecosistema diagnostica y reparte un plano de conjunto que el
  Arquitecto ejecuta proyecto por proyecto; el Arquitecto, antes de entrevistar por un proyecto nuevo, mira
  el mapa y avisa si algo parecido ya existe;
- **dónde vive**: probablemente dentro del propio Hub (es de la empresa), no en vibe-kit. El kit, a lo sumo,
  deja el enchufe genérico ("leer un registro de proyectos" por adaptador). Se decide en el racimo I.

🆕 **Para el racimo B, las carpetas de `docs/`** (evidencia: el director del Hub lo preguntó el 2026-10-22, mientras
ordenaba sus carpetas, para no chocar con lo que el kit estandarice). Quedan abiertas: **`docs/specs/`** para los specs
vivos (ADR-023 lo postergó a esta misión; hoy el Arquitecto retoma borradores con `docs/SPEC-*.md`), el nombre de la
**carpeta de referencia** (`docs/consulta/` es propio de vibe-kit; el Hub propone `docs/referencia/`), y si el mapa de
documentación del `CLAUDE.md` lista también carpetas. Las migraciones SQL **no** se estandarizan: son por stack.
**Cómo lo resolvió el Hub ese mismo día** (primer caso real, para comparar cuando se diseñe B): `docs/` raíz solo con
handoff, TODO, CHANGELOG y README; `docs/specs/` para los vivos (archivo o carpeta si tiene satélites, con su ciclo de
vida en un README); `docs/archive/{specs,planes,historial}/` para lo terminado; `docs/referencia/` con un `trampas.md`;
el SQL en `db/`; el mapa del `CLAUDE.md` con el formato del molde más una fila que declara que `docs/specs/` manda
sobre el Glob del Arquitecto; y **un test que falla** si aparece un archivo suelto, una ruta citada que no existe o un
handoff pasado del tope. También le puso tope al hook: de ~43 KB a 7.400 caracteres (tope de 6.000 bytes al handoff).

**Mi lectura para el tramo 4** (recomendación, no decisión): los racimos **A, C y E** son los que mueven
más objetivos a la vez y tienen la línea base más firme. **F** es chico de construir y cierra alertas
reales: es un buen primer paso del piloto. **G** depende de la pregunta abierta de las dos cuentas.

## 11. Lo que no se rompe

Las 15 piezas que funcionan (radiografía §7) son **restricciones** del diseño: ninguna mejora puede
sacarlas. Las más cercanas a lo que se toca:
- el director verifica contra git: **se automatiza, no se saca** (racimo A);
- el revisor Opus sin shell en la 1.ª vuelta: la revisión proporcional (#4) solo toca las vueltas 2 y 3;
- las clases de decisión con el clic del PO;
- la bitácora en su propia rama y un solo escritor por checkout.

Y del barrido: el **prototipo antes del spec** (acta A3) y la **regla de "arreglo con su prueba"**, que en
un proyecto está viva (94%).

## 12. Lo que queda afuera o en espera

| Qué | Por qué | Condición para volver |
|---|---|---|
| P41 · el capataz | No es parte del workflow de Guido (2026-10-14) | — (fuera) |
| P40 · el estreno de `/relevamiento` | Es un pendiente propio del TODO, no del pack | El estreno real de punta a punta |
| P50 y S-C-4 · `/relevamiento` sin jerga | Es una pieza aparte del pack | Después del estreno |
| P39 · docs-fyd con resumen de exposición | Es una pieza aparte; entra al racimo F solo como idea | Una segunda corrida real |
| Skills de negocio (horas, viernes, estimar, backup, reporte mensual) | Son propias de cada proyecto | — (se quedan donde están) |
| Equipos de agentes y la vista de agentes | Experimentales | Que salgan de experimental; mientras tanto, solo en el piloto |
| Herramientas de sesión de la app sin doc (👁️) | Pueden cambiar sin aviso | Doc pública; si se usan, van marcadas como inestables |

## 13. Límites

- Cada cosa va en un solo objetivo: la elección del principal es mía, para discutir.
- Los números del barrido son conteos de lectores Sonnet sobre síntesis, no mediciones. Los de
  `REPOS.md` y `FLOTA.md` sí son medidos.
- El barrido miró solo las síntesis, no los ~980 hallazgos por lote ni los chats: lo que una síntesis ya
  había descartado no volvió.
- Las propuestas del acta se leyeron por su título y su evidencia, no se re-verificaron.
- Medido el 2026-10-14.
