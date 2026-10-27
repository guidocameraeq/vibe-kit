# Diseño · Racimo D: el método director/obrero y el workflow diario

> **Misión 4, tramo 4** · 2026-10-23 · **Estado: ✅ cerrado con Guido y revisado** (revisor frío: 25 hallazgos, 21 aplicados, 1 rechazado
> con razón, 3 decididos por Guido; §16). La decisión 5 (ramas y escritores) quedó **provisoria** por pedido de Guido hasta la revisión
> integral del tramo 4, y **se cerró el 2026-10-27** (§8): diseñada como las demás, se verifica en el piloto. Es solo diseño: se construye en la misión 5. Se mide contra el norte y los 11 criterios del [PLAN](PLAN.md).
> Respeta lo decidido en [A](DISENO-A-frenos.md), [B](DISENO-B-documentos.md), [C](DISENO-C-salida-hacia-Guido.md),
> [E](DISENO-E-molde-y-flota.md) y [F](DISENO-F-seguridad.md); donde los corrige o completa, lo dice y deja la nota allá.
> Alias: Desktop, Mobile, Deptos, Hub (el repo es público).

## 1. Para qué es este racimo, en una línea

**Un solo método director/obrero, el que Guido ya usa y le funciona, escrito una sola vez, con lo propio de cada proyecto en su lugar, y
con menos trabajo a mano y menos ruido para él.** Es el racimo donde Guido más participa: "es lo que más uso para codear; me encantó y lo
quiero en todos los proyectos".

## 2. Lo que decidió Guido (2026-10-23)

De la entrevista y de las once decisiones, lo que es de él:
- **Director por tamaño, no siempre.** Hotfix en chat plano; lo mediano en una sesión; director cuando hace falta más de una pestaña
  ejecutando. **Sin agente PO por proyecto**: lo que le pedía ya tiene dueño (§4). El molde manda llamar al Arquitecto cuando el tamaño no
  está claro, "para que salga a flote sin que me acuerde".
- **`/obrero` y `/tramo` siguen separados** ("el director es el que sabe cuándo necesita cada uno"); primero se propuso unificarlos y él
  pidió repensarlo: tenía razón (§5).
- **Sonnet por defecto en obrero y tramo; Opus si el director lo decide.** El red team entra a la tabla de roles: "lo amo, es de lo mejor
  que hicimos".
- **Por default, él abre las pestañas de los obreros.** El director las abre solo si él se lo pide, de noche o cuando no está. "Tengo la
  chance de pedírselo y probarlo; si me encuentro que se lo pido todo el tiempo, veré qué hago."
- **Compactar es una falla.** "Hace meses que ninguna sesión compacta." El obrero con contexto útil termina lo que le falta aunque pase
  el umbral blando, y se reutiliza en vez de descartarse. *(Decía "aunque pase de 800 mil"; corregido el 2026-10-26 para que diga lo mismo
  que §11: ningún número fijo, porcentaje de la ventana real medido por script. Un obrero de Mobile "quedó sin contexto" a 834 mil, ~83%
  de un millón, y hubo que relevarlo con cierre PARCIAL: chat ★ 6a9b5771.)*
- **La decisión 5 queda provisoria** y al final del tramo 4 va una revisión integral de D: "es el más complejo y el más importante". *(Cumplido:
  la revisión integral la miró dos veces y Guido la cerró el 2026-10-27; §8.)*
- **"Publicar un release" entra como quinta pregunta de su lista** (A §2), agrupada: un OK por release.
- **Cada proyecto lleva su ficha del kit con todas las adaptaciones y su razón**, y cuando el Arquitecto actualiza, mira el repo, decide la fusión y la informa con veto, sin preguntar (E §6; E-4, 26/10).
  "Mientras eso siga en línea, estas decisiones me parecen bien."
- **Piloto en Deptos primero, no ahora** ("puede ser en la semana"); Desktop y Mobile después.
- Dos pedidos que no estaban en ningún racimo: **el historial de estimado vs real por módulo** (ya lo diseñaron C y B; acá se dice quién lo
  llena y cuándo, §9) y **que el Arquitecto verifique que el proyecto tenga un entorno de prueba** (§12, para H).
- **El criterio que dejó para todo D**: "cada mensaje entre agentes trae algo nuevo y verificable; si no, es ruido. Los obreros no
  reportan menos: reportan por commit, y un script lo comprueba". Y para el contexto: "lo único que hay que evitar es compactar;
  mientras vaya en torno a eso, estamos bien".

## 3. Hoy (medido el 2026-10-23 sobre las skills reales de los tres proyectos, en disco)

Un lector Opus leyó enteras las skills de director, obrero, tramo, gate, inicio, cierre, release y smoke, los subagentes y el método de
Desktop, Mobile y Deptos (~365 mil tokens); otro Sonnet cruzó las trabas medidas en la tanda de chats, la radiografía y el tablero (~215
mil). Lo que cambió la mirada:

| Qué | Desktop | Mobile | Deptos |
|---|---|---|---|
| Quién mergea | **Guido** | el obrero con el clic de Guido | el director (a `main`, con «autorizo») |
| Quién escribe el estado y el relevo | el director, en una rama de bitácora aparte, estirando una excepción | el director, en una rama aparte | el director, dueño de la rama de la misión |
| Re-revisión tras un arreglo trivial | **obligatoria** | suprimida | sin regla |
| Esfuerzo del modelo | 0 menciones | 0 | 0 |
| Rutas absolutas en las skills | 34 | 65 | **0** (todo sale de un archivo de misión) |
| Líneas propias del proyecto en la skill | ~10-14% | 20-27% | **2-3%** |
| Tipos de paso que le tocan a Guido | ~11 | ~13 | ~6 |
| Gate | dentro de `/tramo` | skill `/gate`, **que existió y no se invocó** | sección del encargo + script |
| Verificación del aviso del obrero | 8 pasos a mano, suite incluida | a mano, delega lo mecánico | **un script por commit y otro por bloque** |

- **Deptos, la versión corta, es la más cerca del canon**: ya tiene hechas cuatro de las diez mejoras de la radiografía (verificador por
  script, revisión proporcional, skills sin datos del proyecto, evidencia commiteada antes del mensaje), y en 11 días hizo ~30 bloques sin
  una regresión por el método.
- **Contradicciones vivas**: el director de Desktop dice "pega el PO" en cuatro lugares contra la regla del clic; el comando de la suite
  aparece en cuatro versiones; el `/release` de Mobile está roto contra su `main` (sin flavor); Mobile tiene 7 y 8 capas de "historia"
  en la misma voz imperativa que las reglas; Deptos nombra un `/deploy` que no existe.
- **FLOTA §6 se apoyaba en una premisa falsa**: el `/estado` y el `/verificar` de Deptos son skills del negocio (semáforo de pagos, deudas
  en portales), no del método. El verificador mecánico real es `check_mision.py`.
- **Lo que le pesa a Guido** (entrevista): abrir pestañas a mano (~120 medidas), que el obrero le pida confirmar lo que ya decidió con el
  director (~30 frenos sobre lo ya autorizado), repetirle "reportame" al director (~110 "¿cómo vamos?"), y no tener claro cuándo
  `/obrero` y cuándo `/tramo`.
- **Lo que no ve y las fuentes sí**: 34% de los turnos de un director eran avisos sin novedad; 7 de 8 consultas del obrero volvieron con la
  opción que ya recomendaba; 7 de 8 segundas vueltas del revisor salieron "aprobado"; un obrero quedó parado 8,5 h de noche; la alarma
  "Guido intervino más de 3 veces por tramo" ya existe en Mobile y se cruzó dos veces sin que nadie la mirara.
- **Guido trabaja en la extensión de VS Code**, no en la app de escritorio: nada del método puede depender de herramientas de la app.

## 4. Cuándo hay director: por tamaño, con triage en la puerta, sin agente PO (decisión 1)

- **Tres tamaños, los de B §6**: **chico** (chat plano, sin spec ni director) · **módulo solo** (una sesión con spec del Arquitecto;
  `/cierre` mantiene la ficha) · **módulo con director** (nace con el módulo, muere cuando el módulo se completa).
- **El corte para director no es el tamaño del código: es cuántas manos escriben a la vez.** Hay director cuando hace falta más de una
  pestaña ejecutando: varios obreros, carriles en paralelo, noche desatendida, varios tramos. Si una sesión alcanza, es módulo solo.
- **El triage lo hace la puerta.** Cualquier sesión del proyecto, al recibir un pedido, pregunta una sola cosa, "¿es chico?" (las dos
  preguntas de B §6), y lo dice en una línea: "chico, lo hago acá" o "esto es más que chico: llamo al Arquitecto". Lo demás (módulo solo
  o con director, la carpeta, el spec) lo decide **el Arquitecto, única puerta de los módulos** (E §2). *Nota a B §6: la sesión plana solo
  pregunta "¿es chico?"; "con Guido" sobra en la prueba de director, que es del Arquitecto con la regla de arriba.*
- El molde (`CLAUDE.md` y `/inicio`) manda **llamar al Arquitecto cuando el tamaño no está claro**. *Revisión integral (2026-10-26;
  decisión E-1 reabierta y rearmada con Guido: "quiero que el Arquitecto juegue más; yo me olvido de llamarlo; planeo con el director y
  después meto al director")*: **"llamar" no es pedirle a Guido que abra otra pestaña: la sesión invoca sola la skill del Arquitecto, en
  la misma pestaña**, cuando el pedido no es chico; con director, es **un paso fijo de `/director`** cuando nace algo nuevo en su proyecto.
  Si ya hay un plan charlado con el director, el Arquitecto entra en **Modo B corto**: toma el plan como entrada y hace solo lo que el
  director no hace (explorar el código real con su subagente, "qué NO se toca", los chequeos por script, director sí o no, la sección
  "Ejecución") y le devuelve el spec. **El candado es por script**: ningún spec pasa a READY sin el sello del Arquitecto y ningún obrero
  arranca con un spec sin sello (corrector de A §6). Hoy el Arquitecto aparecía en 11 de 41 lotes (Mobile 0 de 18): el director dictaba
  "spec, dos rondas de red team" con un molde propio. Detalle: [DISENO-E](DISENO-E-molde-y-flota.md) §2, [DISENO-H](DISENO-H-niveles-y-puertas.md) §8.
  El Arquitecto rutea, decide si hay director y **arma el mini ecosistema**: carpeta del módulo, ficha, `SPEC.md`, `tiempos.md`, `bitacora/`, rama y worktree, nombres, y en
  la ficha del kit el default de apertura y las preguntas de A bajadas al proyecto.
- **Guido puede pisar el default** ("quiero director igual"): queda anotado en la ficha del módulo. **Y puede bajar**: se mergea lo que
  esté verde y se saca `director: sí` de la ficha; el módulo sigue como módulo solo.
- **Sin agente PO.** Lo que Guido le pedía ya tiene dueño: el tamaño → Arquitecto; la documentación al día → el molde (B §7, cuatro
  momentos automáticos y el candado); la vista completa → `/estado` (C), `NORTE.md` y `MAPA.md` (B §12), el ecosistema (el Hub, ADR-024); "alguien que
  conozca el proyecto" → los documentos que inyecta el hook, en cualquier PC. Un agente vivo pierde lo que sabe al mudarse y no existe en la
  otra PC (criterio 8); responde preguntas que ya tienen dueño (scope creep, ADR-004); y es otra pestaña Opus que abrir y mantener.
  *Revisión integral (2026-10-26; D-10 reabierta)*: el acta encontró **dos vistas que Guido pide y nadie da**: "% de completado" (4 veces en
  un lote) y "¿qué obreros puedo cerrar?" (~10 chats). Sigue sin agente: **son dos líneas más de `/estado`** (C §2.5): el % de avance medido
  por script (tareas terminadas sobre el plan del módulo, de la ficha y los commits) y "podés cerrar: obrero-<x>--07, obrero-<x>--12" (los obreros cuyo
  CIERRE el director verificó, de la lista de sesiones vivas de la ficha, §7.6). Y las líneas propias del `/estado` se suman en cualquier
  momento pidiéndoselo al director; quedan en la configuración del proyecto.

*Alternativas descartadas*: director siempre (relee ~370 mil por respuesta; suma pestañas; pone el traje de Hermes a un hotfix) · agente
PO vivo por proyecto. *Qué cambia para Guido*: una sola puerta por proyecto; no elige él la herramienta; el medio deja de ir al director
de más.

*Nota de H (2026-10-25): precisión a "varios obreros, varios tramos": **en serie = módulo solo**. Hay director solo si el plan tiene dos o más tareas que se escriben **a la vez** o si Guido pide noche sin él; que lleve varias sesiones seguidas no lo hace director, y la variante "director de una pestaña + subagentes en serie" es un módulo solo. Lo decide el Arquitecto al listar las tareas del spec ([DISENO-H](DISENO-H-niveles-y-puertas.md) §6, §16).*

## 5. `/obrero` y `/tramo`, separados, con un núcleo común (decisión 2)

- **Dos skills, dos preguntas**: `/obrero` responde "hacé esto" (escribe él: documentos, andamiaje, arreglos acotados); `/tramo` responde
  "coordiná a un equipo para hacerlo" (parte en sub-pasos, reparte entre explorador, implementador y revisor, cierra con el gate). Es la
  regla del PLAN: cortar los roles por la pregunta que responden. **El director elige cuál.**
- **Un núcleo común en un solo archivo**, que las dos skills leen: la presentación (rama, SHA, modelo real, contexto medido), el chequeo de
  arranque contra git ("gana git"), el formato de los mensajes, las reglas de commit (pathspec explícito, un commit por entregable, primera
  línea autosuficiente), las 5 reglas del gate (§12), la espera de un OK, qué hacer con el director caído, el cierre con notas para el
  método, y las definiciones que hoy faltan: **tramo** (un lote de encargos que el director abre y cierra, anotado en la ficha; de ahí
  cuelgan la mudanza, el cierre de tramo y la alarma de §13), **un encargo no comparte archivos con otro abierto** (los declara en su
  estado de partida; el director no lanza dos que se pisen; *apartado director/obrero, 2026-10-26, CM-91 de Hermes*: **tampoco recursos
  exclusivos de la máquina**, la suite entera, un puerto, el navegador, que el encargo declara igual que los archivos; dos suites a la vez en
  una PC dieron 232 rojos falsos por `0xC0000142`, y Hermes lo resolvió con turnos pedidos por mensaje; acá lo evita el director al repartir), **un encargo que cruza dos módulos se parte en uno por módulo**, **cancelar**
  (CORRECCIÓN "cancelado": la rama queda sin mergear y el script de worktrees la desmonta), y **si el verificador por script falla** (error,
  no rojo): NO VERIFICADO, no se mergea, PARADA.
- *Revisión integral (2026-10-26)*: **cinco líneas más al núcleo común**, de las propuestas del acta aprobadas por Guido: (P65) antes de
  pedirle a Guido un paso a mano, una línea con por qué no lo puede hacer el agente, y si puede, lo hace; (P75) **todo texto a Guido o a otra
  sesión, narración incluida, en español** (5 de 7 casos en inglés fueron del obrero Sonnet; el piloto mide si baja); (P62) **al reanudar
  tras un corte, el obrero se vuelve a presentar solo** al director (hoy Guido tipea "presentate al director" en 3 pestañas en el mismo
  minuto); que el hook vea el origen `resume` en VS Code: NO VERIFICADO, piloto; (P66) **el andamiaje del propio proyecto** (CLAUDE.md,
  skills, agentes, workflow de CI) **lo editan los agentes**, con el diff mostrado y su commit (clase 1 o 2 de §13); cambiar barreras sigue
  siendo por pedido de Guido (F §14); hoy ~13 autorizaciones por archivo en un lote; (P73) "CI sin máquina dos veces: correr local,
  declararlo y seguir".
- **Delegar solo con razón con nombre** (gentle-ai, REFERENCIAS §1): escritores en paralelo sobre archivos distintos · verificador
  independiente · relevo de contexto · exploración de un árbol grande. Sin razón, no hay subagente. **El código de `/obrero` lanza el
  revisor** (razón: verificador independiente, §10); lo demás lo hace él. Antes de lanzar N subagentes por la misma ruta, uno de prueba
  (11 de 14 caídos entregaron una síntesis igual, S-R-1).
- En la construcción: **un test de coherencia entre skills** (frases viejas = 0; una regla, una definición). Hoy una regla salió con dos
  definiciones en dos skills (H-151).

*Alternativa descartada*: una sola skill con dos modos según el encargo. Primero se recomendó; Guido pidió repensarla y tenía razón: no
mejora resultados (salen del procedimiento, que se conserva igual), la "una sola verdad" la da el núcleo común, y una skill con una
bifurcación grande adentro son dos skills disfrazadas. Deptos no era evidencia a favor: su `/obrero` es un `/tramo` con otro nombre.
*Qué cambia para Guido*: nada en el uso; una regla del núcleo se cambia en un solo lugar.

## 6. Los roles por dentro: modelo, esfuerzo, herramientas, subagentes (decisión 3)

| Rol | Modelo · esfuerzo | Puede | No puede | Subagentes |
|---|---|---|---|---|
| **Director** | Opus · `high` | leer todo; git de lectura; correr los scripts; **mergear limpio**; escribir `docs/modulos/<x>/` en su rama, más `.claude/cambios/` y la zona propia de las skills del proyecto cuando aplica un cambio de método de clase 2 (§22ter); mensajes | **escribir código ni resolver conflictos de código** (un conflicto es un encargo a un obrero); tocar `docs/` fuera del módulo en su rama (§8); verificar a mano lo que calcula un script | ninguno fijo; un lector Sonnet para relevo de contexto |
| **`/obrero`** | **Sonnet por defecto**; Opus si el director lo decide con razón (base, permisos, login, plata) · `high` si Opus | todo lo del proyecto dentro de las barreras de F; commitea él | subagentes sin razón con nombre | el revisor, para código |
| **`/tramo`** | igual que el obrero (dos tramos enteros de base salieron en Sonnet sin rehacer nada, H-02) | partir, repartir, commitear, correr el gate | escribir código él | explorador · implementador · revisor |
| **Explorador** | Haiku · sin shell | ubicar archivos y líneas, con techo de salida | **contar, resumir, afirmar que leyó todo** (dio un "alto" falso; contó 8 y declaró 9) | — |
| **Implementador** | Sonnet · con shell · **`tools:` declaradas** (el de Deptos hoy hereda todas) | el sub-paso y su prueba con la mutación en rojo | commitear; salirse del NO SE TOCA; debilitar un control para pasar | — |
| **Revisor** | Opus · `high` · **sin shell** | el diff congelado y sus pruebas; veredicto en **3 niveles**: aprobado · con observaciones · rechazado (Deptos) | escribir; correr | — |
| **Red team** | Opus · `high` · sin shell (lee; Web solo para verificar hechos) · máx. 5 hallazgos | atacar el spec antes de READY (hoy, 5 lentes) **y la construcción antes del merge de un módulo de riesgo alto** (P25) | editar; hablarle a Guido | — |
| **Lector de volumen** | Sonnet, salida corta con techo | leer grande y resumir | decidir | — |
| **Lector de capturas** 🆕 | Sonnet | recibe la imagen reducida, devuelve texto (74 capturas llevaron una pestaña de 226 a 708 mil; P4) | — | — |
| **Verificador de avisos** | **script** (A §7) | commit en remoto, árbol limpio, pruebas, alcance; 6 líneas | — | — |

**Las reglas que atan la tabla:**
1. **El encargo declara modelo y esfuerzo con su razón** ("Modelo: Sonnet, porque es guiado"; P26). Sin razón, Sonnet.
2. **El obrero imprime el modelo real al presentarse**; si no coincide con el encargo, lo dice antes de arrancar (hoy un cierre dijo "Opus"
   con la pestaña en Sonnet). Cómo lee su propio modelo: **NO VERIFICADO**, piloto.
3. **Las reglas van dentro de la definición del subagente**, no repetidas en cada encargo: la dicha en cada encargo falló ~5 veces en un
   día; la de la definición se cumplió (radiografía).
4. **Red team**: el kit hoy **no fija `model:`** en `redteam-spec.md` (verificado en el frontmatter) → se fija Opus. **Criterio de salida**:
   la ronda 1 pasa las 5 lentes del kit; las rondas 2 y 3 miran **solo lo que cambió** desde la anterior, con una lente; **máximo 3**
   (hubo 6 pasadas NO LISTO seguidas; 5 de 6 hallazgos de la ronda 2 eran restos de la 1). Lo lanza el Arquitecto (spec) o el director o
   tramo (construcción).
5. **El revisor arranca en "le falta"**: un 10/10 sin observaciones es bandera roja (REFERENCIAS §2). **El tramo reproduce el hallazgo del
   revisor antes de pasarlo al implementador** (S-D-1).
6. **Haiku ubica, Sonnet lee.** El "lector Haiku en bulk" que pidió Guido se parte: explorador Haiku (ubicar) + lector Sonnet (leer y
   resumir); 12 lectores baratos dijeron "completé" con error adentro.
7. *Revisión integral (2026-10-26; P71 del acta)*: **todo subagente tiene tope de tiempo y latido**: tope con aviso a la hora; latido visible
   (archivos tocados); **"stopped with background work" sin informe cuenta como "no entregó"**: se reemplaza por uno nuevo con encargo
   autocontenido y **nunca se reanuda** (uno murió de nuevo al reanudarlo, ~3 h sin aviso, L52; 3 h 20 sin señal, L30); el cierre del sub-paso
   exige "ningún proceso vivo del subagente"; antes de un "¿qué pasó?", el director mira si hay subagentes en curso. Los números (corte de
   contexto del implementador, ~250-450 mil medido) se calibran en el piloto.
8. *Revisión integral (2026-10-26; P76, transformada)*: los dos "modos" de `/obrero` que el acta vio en uso no se agregan como modos: el modo
   **"spec"** (6 de 6 sesiones de spec abiertas con `/obrero`) lo reemplaza E-1: el spec lo escribe el Arquitecto invocado por la sesión (§4);
   el modo **"decisiones"** (cola de decisiones de Guido en tandas cortas) lo cubren la clase 2 de E-4 (lo rutinario no se pregunta) y la
   cola "te espera" de §13.4.
9. *Revisión integral (2026-10-26)*: **el paquete del revisor lo arma un script** (hueco 8 del acta): diff contra el SHA base, status y la
   tabla de mutaciones con su rojo. El revisor sin shell que no lo recibe pide papeles en vez de revisar código (§10).

**Herramientas nuevas que entran** (pasaron el filtro de cuatro preguntas): **`subpaso-cierre`**, un script para el contrato de cierre del
sub-paso (~12 llamadas iguales por sub-paso; 10-13 scripts rearmados a mano por tramo; S-M-2), que además comprueba que una corrección tocó
solo lo señalado (§10) · **el lector de capturas** · **el red team de construcción**. **No entran, con razón**: auditor documental (lo cubre
el candado de B §14) · "verificador frío" de construcción como agente aparte (es el revisor Opus) · banco de pruebas del método (misión 6) ·
runbook de incidente (F) · catálogos de decenas de roles (no pasan la regla de 3+) · worktree con entorno enlazado (script del molde, **para H**).

*Qué cambia para Guido*: deja de preguntar "¿hace falta más esfuerzo?" y de pagar Opus por texto; el red team deja de dar vueltas vacías;
las capturas no matan pestañas.

## 7. Pestañas y permisos: Guido abre por default; el director cuando se lo pide; las 5 de A con clic (decisión 4)

Verificado contra la doc oficial el 2026-10-23 (agente guía, 10 páginas, ~118 mil tokens; `code.claude.com/docs/en/{agent-view,
cross-session-messaging,headless,hooks,permissions,permission-modes,sub-agents,vs-code,cli-reference}.md`):

| Mecanismo | Qué permite | Estado |
|---|---|---|
| `claude --bg "<prompt>" --name <n> --model <m>` | arrancar una sesión en segundo plano, con nombre y modelo, y devolver el control (CLI) | documentado; **que lo corra el director desde Bash: NO DOCUMENTADO** |
| `claude attach <nombre>` | entrar a una sesión `--bg` desde una terminal | documentado |
| ListAgents / SendMessage por nombre | lo que hoy usan director y obreros | documentado en CLI (Windows nativo ≥ 2.1.234); **en VS Code, la pestaña no puede mostrar el diálogo de aprobación del mensaje entrante**: espera 5 min salvo `crossSessionInbound: accept` |
| `claude -p "<encargo>" --model --permission-mode --allowedTools --permission-prompts none --max-turns --max-budget-usd` | obrero **headless**, sin pestaña, con tope de gasto | documentado (`-w` con `-p`: NO VERIFICADO; que un `-p` mande un mensaje: NO VERIFICADO) |
| Subagente `background: true` + `isolation: worktree` + `model:` | obrero como subagente, cero pestañas, reanudable; **sus prompts de permiso aparecen en la pestaña del director** | documentado |
| Hook `PreToolUse` → `permissionDecision: allow / deny` | aprobar o negar por regla propia | documentado; **un `allow` no pasa por encima de reglas `deny` ni `ask` de settings**; un `deny` frena también en bypass (F §4) |
| Modos `default`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions` · `--permission-mode` | cuánto pregunta cada obrero | documentado (VS Code: solo por setting de usuario, sin `auto`) |
| **Un mensaje de otra sesión nunca aprueba un permiso** | — | documentado: el director **no puede** aprobar por mensaje |

**Lo decidido:**
1. **Dos formas de apertura, las dos canónicas**, por un campo del encargo `apertura: Guido | director`, con default por proyecto en la ficha
   del kit. **Default: Guido** pega **una sola línea** que le da el director (nombre, modelo, modo, `/obrero <ID>`) y ve la pestaña en VS
   Code. **Director**: solo si Guido se lo pide, de noche o cuando no está; lanza con `--bg` (o headless con topes de plata y turnos, de
   noche) en el worktree del módulo. Guido entra a uno con `claude attach`. **El obrero no sabe quién lo abrió**: arranca igual.
2. **Lo chico sin sesión**: un encargo de un sub-paso o un documento va como subagente del director en segundo plano, con razón con nombre.
3. **Permisos.** Las **5 de A** (las 4 más "publicar un release", decisión de Guido) piden **el clic de Guido en la pestaña que actúa**:
   razón técnica confirmada, el permiso es de la sesión. **Todo lo demás no pregunta**: (a) las `allow` del molde (F), (b) el modo que el
   encargo fija al lanzar, (c) **la sección AUTORIZADO del encargo** (comandos y rutas), que un hook `PreToolUse` aprueba. El hook lee
   AUTORIZADO con `git show <rama-del-módulo>:…`, **que el obrero no puede escribir**; *pero con F-1 (abajo) las reglas que de ahí salen van al `settings.local.json` del worktree del
   obrero, que él sí puede editar: el riesgo real es que se dé permisos durante el encargo, y se caza al cierre (el gate cruza ese archivo
   contra el encargo; F §14). Las 5 de A no dependen de eso: las niega el hook (revisor frío 26/10, hallazgo 5).* Aclaración: "reglas
   `ask`" son las 5 de A; el modo `default` además pregunta por todo comando fuera de `allow`, y eso es lo que AUTORIZADO cubre.
   *Revisión integral (2026-10-26; F-1)*: **el hook ya no aprueba: AUTORIZADO se vuelve reglas `allow` estrechas** que un script escribe en el
   `settings.local.json` del worktree del obrero, leyendo la sección del encargo commiteado. Razón verificada contra la doc oficial: una
   `allow` estrecha se resuelve antes del clasificador del modo `auto` y vale igual en `default`; que un hook `allow` evite al clasificador
   **no está documentado**. El hook queda solo para **negar** las 5 de A, que sí frena en todos los modos ([DISENO-F](DISENO-F-seguridad.md) §14).
4. **De noche** (`apertura: director`), el hook devuelve **`deny`** en las 5 de A (frena también en bypass, F §4) y el obrero hace PARADA
   (*y nunca corre en `auto`: tres negaciones del clasificador lo apagan y la sesión vuelve a preguntar; revisión integral 2026-10-26*):
   lo de Guido amanece anotado, nunca pasa solo. *Nota a F §16: el obrero nocturno corre en el modo que fija su encargo, con el hook
   debajo.* Mientras no se verifique que un obrero headless pueda mandar mensajes, **su PARADA es un archivo commiteado** que ve el
   verificador.
5. **Si falla**: sin `--bg` desde el director → siempre "Guido abre"; sin hook en VS Code → el obrero pregunta como hoy. **Ninguna falla deja
   a Guido peor que hoy.** Entra por **tres escalones** (criterio 11): (1) la línea única + las `allow` por script y el hook que niega, un proyecto, medir pop-ups y aperturas
   por tramo · (2) la noche con `apertura: director` y topes, medir horas de obrero parado · (3) el día en autónomo, opcional para siempre.
   Cada escalón se deshace sin tocar el anterior.
6. **Los nombres de sesión** (pedido de Guido, 2026-10-23: "cada vez que abro un obrero le tengo que hacer un rename, y cuando se
   reinicia la computadora se reinician los renames; así se identifican entre ellos"). Hoy el nombre es el tercer renglón que tipea
   Guido, las skills traen nombres fijos que en la práctica llevan sufijo (hasta `-79` en Desktop), y Deptos registró dos veces al
   director perdiendo su nombre al reanudarse (de ahí su canal por archivo). Lo decidido: (a) **el nombre va en la línea de apertura**
   (`--name obrero-<ID>`, documentado) **cuando el obrero se abre desde una terminal** (la integrada de VS Code sirve); **en una pestaña
   de la extensión**, el nombre y el modelo salen de sus comandos (`/rename`, `/model`) y **si la skill `/obrero` puede fijarse el nombre
   sola está NO VERIFICADO**: si no puede, quedan dos renglones más la skill, y el director los entrega listos para pegar con el nombre ya
   decidido. Ninguna sesión puede renombrar a otra (nada documentado): la vuelta de tuerca es el nombre al nacer, no el rename después;
   (b) **el nombre es el del encargo**, `obrero-<x>--<ID>` (H §10.4), y el del director es
   fijo por módulo, `director-<módulo>` (§11): no se inventan ni se reusan; (c) **la ficha del módulo lista las sesiones vivas con su nombre
   y su id de sesión**, así después de un reinicio el director (o Guido) las reabre con `--resume <id> --name <nombre>` desde la misma
   ficha; (d) **el canal por archivo es la red**: la evidencia y la PARADA se commitean antes del mensaje (Deptos), así un nombre perdido no
   pierde trabajo. **NO VERIFICADO**: que `--name` se conserve o se pueda fijar al reanudar con `--resume`; va al piloto.
7. **NO VERIFICADO, en orden, para el piloto**: (i) ~~la mensajería en VS Code con el default~~ → **Guido confirma que funciona** (2026-10-23:
   "los obreros y lectores se mandan mensajes constantemente mientras haya un rename hecho"); queda solo anotar en el molde cómo está
   configurado (G); (ii) ¿el director puede correr `claude
   --bg` desde Bash, y la hija aparece en ListAgents y sobrevive a su mudanza?; (iii) `--bg` con `--permission-mode` y `-w`; (iv) las `allow` por script
   (F-1; antes, el hook `allow`) en VS Code sobre lo que `default` preguntaría; (v) las 5 de A como reglas concretas de settings: **para F/H**, mapear
   `sensible:` de la ficha (A §6) a reglas por proyecto (hoy "manejar claves" es una categoría, no un patrón).

*Alternativas descartadas*: solo subagentes para todo (mueren con el director; Guido no puede hablarles) · aprobar por mensaje (la
plataforma no lo permite) · `bypassPermissions` para todo (tira las 5 de A). *Qué cambia para Guido*: la apertura pasa de tres renglones a
una línea (se cuenta como intervención y se mide: nota a C §4); los ~30 pop-ups por cosas ya decididas desaparecen; le quedan los clics de
las 5 de A; de noche nada se cuelga esperando.

*Nota de H (2026-10-25): los nombres de sesión quedan **`director-<x>`** y **`obrero-<x>--<ID>`** (dos módulos con director a la vez daban dos `obrero-07`); si el módulo cruza dos repos (`enlaza:`), **`director-<alias>-<x>`**. La línea de apertura es **de terminal** (`cd <worktree> && claude --name …`): una pestaña de la extensión abre en `main`, así que el obrero imprime su rama al presentarse y hace PARADA si no es la de su encargo. Los encargos como subagente (7.2) **no usan `isolation: worktree`** (ramifica desde el remoto): el script `worktree` crea `modulo--<x>--<ID>` y la definición del subagente dice en qué ruta trabajar, y lleva adentro "leé tu encargo y corré el chequeo base" ([DISENO-H](DISENO-H-niveles-y-puertas.md) §10.4-§10.6).*

## 8. Ramas y escritores (decisión 5; cerrada el 2026-10-27, se verifica en el piloto)

*Fue provisoria por pedido de Guido (2026-10-23) hasta la revisión integral. La cerró él el 2026-10-27, con tres cosas a favor: el acta de
contraste no la contradijo (G-5 mixta: "gana git" funciona); Hermes llegó solo a la misma regla de commits por rutas y push por nombre
(CM-102, §22bis); y el revisor frío le encontró el único hueco real, dónde mergea el director a `main`, que cerró el modo `integrar` (§8.4).
Queda como todas las demás: diseñada, con lo NO VERIFICADO para el piloto en Deptos.*

Lo que B ya decidió y D hereda: la bitácora es una **carpeta de archivos chicos** dentro del módulo, no una rama (B §5); el módulo con
director se construye en su rama con worktree; el hook y `/estado` leen la ficha por `git show <rama>:`; el director es el único dueño de la
ficha. H nombra ramas y worktrees.

1. **Una rama por módulo con director. El director es su dueño**: trabaja en su worktree sobre esa rama y ahí escribe **solo
   `docs/modulos/<x>/`** (ficha, `tiempos.md`, `bitacora/`, `planes/`), *y desde el 26/10 también `.claude/cambios/` y la zona propia de las
   skills cuando aplica un cambio de método de clase 2 (§22ter); un cambio aplicado en `modulo/<x>` llega a los otros módulos con el merge a
   `main`, o antes si otro módulo lo cita (revisor frío, hallazgo 6)*. Nadie más commitea directo en la rama del módulo. **Se termina la
   rama de bitácora aparte**: existía porque el director no podía escribir `main` y los obreros sí. **Enmienda a TABLERO §11** (decisión de
   Guido): lo que se conserva de esa pieza es "**un escritor por checkout**"; la rama aparte ya la había reemplazado B.
2. **Cada obrero trabaja en su rama por encargo, en su worktree**, y commitea él. Escribe código y **un solo archivo de `docs/`: su
   evidencia**, en `bitacora/<fecha>-evidencia-<ID>.md`, hermano del encargo. *Enmienda a B §5: el encargo (del director) y la evidencia (del
   obrero) son dos archivos; "en ese mismo archivo" tenía dos escritores.* **Un escritor por rama, por worktree y por archivo.**
3. **El merge del encargo a la rama del módulo lo hace el director**, cuando el verificador por script da verde. No se le pregunta a Guido.
4. **El merge del módulo a `main` lo hace el director**, con el gate completo. *Dónde (revisor frío 26/10, hallazgo 4)*: **nunca en el
   checkout de `main`**, que es de las sesiones planas de Guido (§8.7). El script `worktree integrar <x>` (H §10.2) abre un worktree temporal
   sobre `origin/main`, mergea `modulo/<x>` con `--no-ff`, corre el gate y el `/cierre` del proyecto ahí mismo, empuja a `origin/main` y borra el
   worktree; el checkout de `main` lo recibe en su próximo `/inicio` (G §11.1). El merge del encargo al módulo no lo necesita: el director ya
   está en `modulo/<x>`. **NO VERIFICADO** (piloto): el worktree temporal en Windows y que el `/cierre` corra bien fuera del checkout principal. **Publicar** (release, deploy) pide **un OK de Guido por
   release**, agrupado: es la quinta pregunta de A §2. Guido puede endurecerlo por proyecto en la ficha del kit ("en Desktop, el merge a
   `main` me lo preguntás"): queda escrito, no en la memoria del director.
5. **Qué se cierra cuándo.** Al cerrar un tramo, el director sobreescribe la ficha, actualiza `tiempos.md` y, si se muda, escribe el relevo:
   todo dentro de `docs/modulos/<x>/`. **El handoff, el TODO y el CHANGELOG del proyecto se tocan solo en el `/cierre` del merge a
   `main`**: si el director los commiteara en su rama, el hook de `main` inyectaría un handoff viejo y dos módulos chocarían en cada
   merge (es el choque que B §20 vio con `frenos.log`). Los obreros no corren `/cierre`: cierran con su CIERRE por mensaje y su evidencia.
6. **El relevo del director es un archivo de `bitacora/`** que escribe en su rama. Se acaba la "Excepción 2" estirada de Desktop.
7. **`main` queda limpio para las sesiones planas de Guido**: un módulo con director no toca `main` hasta su merge. El segundo carril de
   Mobile (el spec siguiente) es otro módulo que nace en `main` con su ficha.

*Alternativas descartadas*: rama de bitácora aparte · el obrero mergea con clic (un clic más por encargo) · Guido mergea (16 h de espera
medidas por una frase). *Qué cambia para Guido*: no mergea ni cliquea merges; un OK por release; deja de explicar la rama de bitácora.
**NO VERIFICADO**: por qué el director de Desktop no puede escribir `main` hoy; se mira al adoptar (E §7).
*Nota de G (2026-10-24): las ramas de módulo se mergean sin squash, para que los SHA que cita la mesa sigan existiendo; y el director escribe también `docs/modulos/<x>/mesa/`, que es parte del módulo ([DISENO-G](DISENO-G-mesa-y-pcs.md) §5).*
*Nota de H (2026-10-25): los nombres: rama **`modulo/<x>`** y worktree **`.claude/worktrees/modulo--<x>`** para el módulo (nacen de `main` después del commit que crea el módulo); rama **`modulo/<x>--<ID>`** y worktree **`modulo--<x>--<ID>`** para el encargo (nacen de la punta del módulo). Los crea el script del kit `worktree` (`crear`, `abrir`, `sync-env`, `cerrar`), no `claude -w`. Merges encargo → módulo y módulo → `main` con `--no-ff`. **La carpeta del obrero se borra cuando el obrero cierra, no al mergear** (§11.3 lo reutiliza justo después del merge): el obrero reutilizado cambia de rama en su misma carpeta ([DISENO-H](DISENO-H-niveles-y-puertas.md) §10).*

## 9. Ruido y noche: silencio entre agentes, una suscripción por obrero, el despertador afuera (decisión 6)

**El criterio** (Guido): cada mensaje entre agentes trae algo nuevo y verificable; si no, es ruido. Hoy: 39 de 115 turnos de un director
eran avisos sin novedad, cada uno releyendo 300-600 mil; la causa es una regla (Mobile pide aviso en cada mensaje y tiene despertador cada
30 min siempre); ~300 resúmenes repetidos; un obrero parado 8,5 h de noche; otro trabado 1,5 h por un `ask` que el checklist de irse no previó.

1. **Silencio por defecto en los dos sentidos.** El director escribe solo si cambia el trabajo (CORRECCIÓN) o si el obrero preguntó
   (CONSULTA, PARADA). **El AVANCE no se contesta**: la evidencia es el commit, y el verificador por script lo cruza. El obrero habla por
   commit (AVANCE ≤5 líneas con SHA y contexto) y por CIERRE; nunca "sigo trabajando".
2. **Una suscripción por obrero, no por mensaje** (P27): el "avisame cuando quedes quieto" va solo en el ENCARGO.
3. **Aviso sin novedad = cero texto**: el director corre el verificador y, si no hay commit nuevo, no escribe. **Pero un turno vacío relee
   igual** (el revisor frío lo marcó): por eso **el despertador de noche es un script fuera del director** (un loop o tarea programada) que
   mira git y **solo lo despierta** si hay PARADA o commit nuevo. De día no hay despertador. Cómo despierta al director (mensaje, tarea):
   **NO VERIFICADO**, piloto. *Apartado director/obrero (2026-10-26, CM-79 de Hermes)*: **el despertador y el verificador miran también el
   checkout principal** (`git status -sb` y `git log` de `main`), no solo las ramas de los encargos: un test con `GIT_DIR` apuntando al `.git`
   principal commiteó 7 veces en el `main` real y nadie lo vio en 12 horas porque el chequeo miraba los worktrees. Un commit en `main` que no
   salió de un merge del director es PARADA.
4. **"Algo está parado", un solo umbral**: de día, 30 min esperando un OK y el obrero se lo dice al director. **De noche no espera**: si
   necesita algo que no está en AUTORIZADO, PARADA; el despertador la ve, el director la anota en **"parado"** de la ficha (lo suyo) o en
   **"te espera"** (solo si es de las 5 de A o diseño/negocio). Nunca más 8,5 h sin que nadie sepa.
5. **Antes de irse, un checklist que arma un script** desde los encargos de la noche: qué va a preguntar `default` (→ AUTORIZADO), qué
   vence (VPN, credenciales), qué dispositivos; y **si el director pasa de ~40% de su ventana, se muda primero** (§11). Lo que Guido hace:
   decir "me voy" y resolver lo que vence. Una frase por noche. Que el script prediga los permisos: **NO VERIFICADO**.
   *Revisión integral (2026-10-26; P63 + P68 del acta, aprobadas por Guido)*: **"me voy" tiene respuesta fija y vale también de día.** Cuando
   Guido dice que se va ("me voy en 30'", "corto a las 15:30", "¿me puedo ir?", "me quedo sin internet") o llega la hora que dejó dicha, el
   director contesta **un solo bloque**: (1) qué necesita de él **ahora**, todo junto (clics, autorizaciones con su vencimiento); (2) qué queda
   andando y hasta cuándo; (3) con qué se va a encontrar al volver; (4) el checkpoint si hay que cortar. *Apartado director/obrero (2026-10-26,
   CM-86 de Hermes)*: **la red es un riesgo del checklist** (sin red no trabaja nadie, tampoco el despertador lo ve), y **el resumen del
   amanecer dice de qué hora a qué hora no hubo commits y por qué**, si se sabe: ~7 horas de una noche se perdieron por un `ENOTFOUND` sin
   que nadie lo supiera hasta la tarde. Y si la pausa es de todo el equipo,
   deja a cada obrero con commit wip declarado, árbol limpio, sin procesos, "paso exacto donde retomás" y la lista de archivos fuera del
   repo; al volver, cada uno se re-presenta solo (§5). Es el hábito más repetido de Guido que ningún racimo tenía: ~50 veces en ~21 chats
   ("decime mañana con qué me debería encontrar", "¿me puedo ir tranquilo?"); un obrero parado ~3 h tras un corte de internet (L54).
6. **Un resumen por hito, al director.** A Guido solo las 5 de A y diseño/negocio (C §2.1). "Qué hacés vos: nada" no se escribe. **El
   encargo viaja por referencia** (la ruta en `bitacora/`), nunca los 7-9 KB en el mensaje (A §7; Deptos ya lo hace).

*Tensión declarada*: el director de Mobile pidió conservar el despertador de 30 min siempre; la evidencia dice que un Monitor disparó ~30
turnos vacíos. *Qué cambia para Guido*: de día no lee avisos; de noche duerme sabiendo que lo parado amanece anotado, no colgado.
**El historial de estimado vs real** (pedido de Guido): lo mecánico lo llena el script desde git y la estimación la escribe el director en
`tiempos.md` al cerrar cada tramo (C §2.6, §3; B §5bis); la lección va al histórico al cerrar el módulo. D no agrega nada: dice cuándo.
*Nota de G (2026-10-24): la tabla de tipos de mensaje (los ocho de director/obrero y los seis de la mesa) la fija G y D la usa; `PRESENTACION` y `RESPUESTA` quedan definidos ahí ([DISENO-G](DISENO-G-mesa-y-pcs.md) §6).*

## 10. La revisión: Opus siempre en la 1.ª vuelta del código, profundidad por riesgo, congelada en un commit, una corrección (decisión 7)

Hoy: el revisor Opus sin shell encuentra en la 1.ª vuelta defectos que la suite en verde no ve (9 de 12, 12 de 12, 8 de 10; TAB §11: no
tocar); pero 7 de 8 segundas vueltas salieron "aprobado" y hubo ~60 vueltas extra en Desktop, fabricadas por la regla "arreglarlo vos no
saltea la revisión" (Desktop); Mobile la sacó y nunca falló. 26% de los arreglos arreglan otro arreglo porque casi ninguno trae su prueba
(0-45%; Portal, con la regla viva, 94%).

1. **Primera vuelta: revisor Opus sin shell, siempre, en todo sub-paso con código**, en `/tramo` y en `/obrero` (razón con nombre:
   verificador independiente) y **también en el módulo solo** (la sesión lo lanza). Lo de solo texto o andamiaje sin lógica va sin revisor.
   El riesgo decide la **profundidad**, no si hay revisor.
2. **Profundidad por riesgo**, escrito por el director en el encargo: **bajo** → una lente · **alto** (datos reales, permisos, plata,
   producción, login; y **el plan de una base real de F §13**, que es sub-paso de riesgo alto y lo revisa el revisor, no el director: nota a F)
   → cuatro lentes y red team de construcción antes del merge del módulo.
3. **Congelada en un SHA**: el tramo commitea el sub-paso **antes** de pedir la revisión; el revisor lee ese commit. Nadie revisa un árbol
   que cambia debajo.
4. **Tres niveles**: **aprobado** → cierre · **con observaciones** → una sola corrección acotada; `subpaso-cierre` comprueba que el diff tocó
   solo lo señalado; **sin segunda vuelta** · **rechazado** → corrección + segunda vuelta con una sola lente (lo rechazado). **Máximo 2**; si
   sigue rechazado, PARADA al director. (Guido: "si la primera encontró mucho, vale una segunda; si ya cierra, no hay corrida por correr".)
   El arreglo trivial con 4 condiciones aplicado por el orquestador se mantiene dentro de "con observaciones".
5. **Todo arreglo trae su prueba en rojo primero, y el gate lo marca**: un commit de arreglo sin archivo de prueba tocado es rojo. **Se
   construye con la receta de A §5** (medido contra el historial antes de instalarlo, 0 falsos positivos como "fix typo" en docs, con id
   `gate:fix-sin-prueba` quitable por proyecto, F §14). La "misma tasa de defectos cazados" es **meta del piloto**, no un hecho.

*Qué cambia para Guido*: nada que haga él; los tramos cierran más rápido y más baratos, y los arreglos dejan de volver.

*Revisión integral (2026-10-26; D-8 reabierta y cerrada con Guido).* El acta partió D-8 en dos: "Opus en la 1.ª vuelta" se confirma (casi
siempre halló un CORREGIR real); **"una sola corrección" no se cumple**: lotes enteros con 3 y 4 vueltas (L19: seis sub-pasos con CORREGIR →
CORREGIR → APROBADO; L35: siete casos de 3-4). El chat ★ 76bfe51b (obrero-identidad-53, 2026-10-19) muestra la causa: 3 vueltas sobre el
mismo guardián, **11 hallazgos sobre el test y 2 sobre prosa, cero bugs en el código de producción**, el paquete armado a mano sin diff ni
status ("un revisor sin git ni shell pide siempre el diff como comando"), y el orquestador cerrando solo con "tres rondas ya dan rendimiento
decreciente". **El tope de 2 vueltas (10.4) se queda, y se atacan las tres causas**: (a) **el paquete del revisor lo arma un script**
(`subpaso-cierre` o hermano): diff contra el SHA base, status, tabla de mutaciones con su rojo (P23, hueco 8); (b) **las afirmaciones en
prosa** (docstrings, comentarios, textos de error que prometen más de lo medido) **salen de la revisión y van a un corrector de A** sobre las
líneas agregadas (P18 reabierto, A §6): son la primera causa de vueltas en 11 lotes ("cuatro revisiones, cero hallazgos en el código y nueve
en la prosa"); (c) **la tercera vuelta es PARADA al director, que decide una de dos**: cerrar con lo pendiente anotado como deuda en la ficha
del módulo y que lo mire el revisor final del cierre, o encargo nuevo. Nunca sube a Guido. Y **un script cuenta las vueltas por sub-paso**:
es la métrica del piloto (hoy 3-4; meta ≤2). Lo mismo vale para el red team de construcción (§6.4): paquete por script y tope.

*Nota de H (2026-10-25): al `gate:fix-sin-prueba` (10.5) se le suma una condición: si el arreglo toca un archivo de un fix de los últimos N días (el arreglo del arreglo, 26% en la flota), **revisor Opus congelado en el commit antes del push**, por archivo (no `log -L`). Sigue siendo chico: sin spec ni módulo ([DISENO-H](DISENO-H-niveles-y-puertas.md) §5.6).*

## 11. La mudanza del director y el contexto: medido por script, compactar es una falla, el obrero se administra (decisión 8)

Hoy: Desktop se muda "cuando le queda ~35%" según el indicador que mira Guido; Mobile al cerrar fase, tras compactar o a ~650 mil medidos.
Son el mismo número. Mudanzas de 1-9 min; dos de 37-55 porque el saliente siguió escribiendo. Se matan obreros al 25-28% con contexto útil y
se abren otros que recargan 62-75 KB.

1. **Dos umbrales medidos por un script** que lee el transcript de la propia sesión **y la ventana real** del modelo (Sonnet y Opus no tienen
   la misma): **blando, ~65%** → mudarse al cerrar el tramo en curso · **duro, antes del punto donde la plataforma compacta** → mudarse ya,
   con relevo, aunque sea a mitad de encargo. **Compactar es una falla**, no una señal: si pasa, va como incidente a las notas para el
   método. Dónde está el punto exacto por ventana: **NO VERIFICADO**, piloto (arranca en ~85%). *Revisión integral (2026-10-26; D-5)*:
   **arranca en ~80%**, no 85: el obrero del Bloque AK de Mobile "quedó sin contexto" a 834 mil (~83% de un millón) y hubo relevo con cierre
   PARCIAL (chat ★ 6a9b5771; la causa exacta no está en ese chat). Los directores de Hermes cortan obreros entre 460 y 700 mil "por las dudas"
   (acta, D-5): con las dos cifras del script el director decide con datos, no por instinto. **VERIFICADO el 2026-10-26 en la app de
   escritorio**: una sesión lee su ventana (tokens usados, %, dónde compacta: 97% en una ventana de un millón) **y la de otras sesiones**,
   con una herramienta de la app (`get_usage`). El director puede medir el contexto de cada obrero sin que el obrero lo diga; el AVANCE deja
   de traer el porcentaje si la plataforma lo da. En la terminal pelada y en VS Code: NO VERIFICADO, piloto.
2. **El obrero no se corta a un número fijo.** El director decide con dos datos del script: **contexto usado** y **lo que falta**. Si falta
   poco (un sub-paso, el cierre), **termina aunque pase del umbral blando**; si falta mucho, traspaso escrito ahora. El umbral duro es el
   mismo. El AVANCE trae las dos cifras. El porcentaje **sí** se da, pero sale del script, nunca de la cabeza del modelo (resuelve la
   contradicción de Mobile).
3. **Un obrero con contexto útil se reutiliza**: el director puede darle el encargo siguiente del mismo módulo si (a) es el mismo módulo,
   (b) su rama ya se mergeó, (c) el modelo coincide con el que pide el encargo nuevo (las pestañas reusadas arrastran el modelo, H-03) y
   (d) está bajo ~50%. El encargo nuevo arranca igual con "gana git". Si no, obrero fresco.
4. **La mudanza, cuatro pasos**: (a) relevo en `bitacora/<fecha>-relevo.md`, con el tope del handoff (B §8) y secciones fijas (dónde
   estamos, obreros vivos con rama y SHA, encargos abiertos, decisiones pendientes, parado, te espera); (b) commit + push; (c) **dejar de
   escribir**; (d) el director nuevo arranca, lee relevo + ficha + `git log` corto y aplica "gana git". **El que arranca de un relevo no
   espera OK**: confirma en 3 líneas y sigue; el OK es solo del primer arranque del módulo (con 9-17 mudanzas por mes, son 9-17 "dale"
   menos). **De día lo abre Guido** con la línea; **de noche** (`apertura: director`) **el saliente lanza al entrante con `--bg`** como último
   paso del relevo, y el nombre es fijo por módulo (`director-<módulo>`, cerrando antes el viejo) para que los obreros vivos no le escriban
   a un nombre muerto: **NO VERIFICADO**, piloto.
5. **Mudarse antes para lo mecánico** (P29): un director con más de ~50% no hace tareas de solo texto o registro; las delega a un
   subagente Sonnet. **El merge limpio no necesita pestaña nueva**; resolver un conflicto es un encargo a un obrero (§6).
6. **Después de compactar** (red, no regla): releer solo relevo + ficha + `git log` corto; nunca registros enteros (B §11).

*Qué cambia para Guido*: deja de vigilar el indicador de contexto; el director le dice "me mudo al cerrar este tramo" y le da la línea; el
relevo está siempre en el mismo lugar; y de noche se muda solo.

## 12. Las skills chicas y las que faltan o sobran: el gate es script, `/smoke` firma, cero datos clavados (decisión 9)

1. **El gate no es una skill.** Es (a) una **sección GATE del encargo** (qué se chequea) y (b) **el script del proyecto** (el `check_mision.py`
   de Deptos, generalizado) que corre el verificador y que `/tramo` llama en su último paso. **Las 5 reglas del gate** van al núcleo común.
   Razón: la skill `/gate` existió en Mobile y se improvisó sin invocarla; un script que llama el tramo no se puede saltear.
2. **`/smoke` conserva el nombre y gana un contrato**: escribe **en un archivo** (no en el chat) una línea `SMOKE: OK | FALLÓ | NO VERIFICADO ·
   <qué probó>`, legible por el script del gate. Un `/smoke` que solo compila lo dice ahí. La profundidad sigue siendo del proyecto.
3. **`/release` nace `propia`** (E §11 se mantiene); el molde trae **la plantilla con la que nace**: OK explícito de Guido (la quinta de A) →
   gates rojos frenan → versión → publicar → commit/tag → docs → reporte con números. Los comandos, del proyecto.
4. **`/inicio` y `/cierre` del molde, con lo que D decidió**: `/inicio` pregunta "¿es chico?" (§4) y, si la rama o el worktree son de un
   módulo con director, lee la ficha y **no la toca** (B §5); `/cierre` del proyecto se corre al mergear a `main` (§8); en modo parcial, solo
   el tope del handoff (B §11).
5. **Skills del método, lista cerrada**: `/director`, `/obrero`, `/tramo`, `/inicio`, `/cierre`, `/estado` (C), `/smoke`, `/release`. **Se
   elimina `/gate`. No se agrega ninguna**: nada más pasó la regla de 3+ (`/encargo` es un paso del director; `/retro`, P22, en espera).
6. **Cero datos clavados en las skills** (criterio 8): nombres de sesión, ramas, rutas, SHAs y registros de tramos salen de **la ficha del
   módulo y la ficha del kit** (el `MISION_ACTIVA.md` de Deptos, generalizado). **Candado `candado:datos`**: `grep` de rutas absolutas y
   nombres de sesión en `.claude/skills/` = 0, dentro del candado de B §14. **Las cicatrices** (el origen fechado de cada regla, hoy ~80
   líneas por skill grande) van a la prosa "Cómo se adaptó" de la ficha del kit (E §4); la skill queda con la regla.
7. **FLOTA §6 se corrige con una nota**: `/estado` y `/verificar` de Deptos no cuentan para la regla de 3+.
8. 🆕 **Entorno de prueba** (pedido de Guido): no todos los proyectos tienen ambiente de testing. **El Arquitecto verifica que exista** (base
   de prueba o datos ficticios, F §12) al montar o al abrir un módulo; si no existe, **armarlo es el primer módulo**. Sin eso, el gate y
   "todo arreglo trae su prueba" son letra muerta. **Para H.**
 *Resuelto por H (2026-10-25): el spec lleva una sección fija "Entorno de prueba" y un script lo verifica antes del READY, **proporcional**: por cada entorno `clase: real` que el módulo toca, un `dummy` o `prueba` declarado; sin `real`, alcanza `comando-test`; de pantalla, corredor del front con su navegador. Si falta, **montarlo es la tarea 0 del spec, y si por sí solo lleva más de una sesión es su propio módulo y va antes** (es lo que acá se llamó "el primer módulo"). Toda sesión de construcción corre el chequeo base antes de tocar código y reporta "ya estaba roto" si da rojo. Es `gate:entorno-prueba`, quitable con rastro ([DISENO-H](DISENO-H-niveles-y-puertas.md) §9).*

**Para la adopción de cada proyecto (E §7), no para el método**: el `/release` de Mobile roto; el `/deploy` fantasma de Deptos; los cuatro
"pega el PO" y las cuatro versiones del comando de la suite de Desktop; los worktrees de bloques cerrados montados en Deptos; los dos
`/cierre` que apuntan a la memoria de otro usuario de Windows. *Qué cambia para Guido*: una skill menos que explicar; `/smoke` le dice
qué probó; cambiar de PC o de nombre no rompe nada.

## 13. Quién decide qué: tres clases, los desvíos al derecho, la alarma de intervenciones (decisión 10)

Hoy: las clases de decisión con el clic en la pestaña que actúa son la mejora mejor medida (~150 pegados → 0 y 4 clics en ~5 h; no se toca).
Pero con dos clases **los desvíos van al revés**: 7 de 8 consultas volvieron con la opción que el obrero ya recomendaba, y cosas importantes
se decidieron sin preguntar. La alarma "Guido intervino más de 2-3 veces por tramo" existe en Mobile y se cruzó dos veces sin que nadie la
mirara. ~40 pedidos repetidos al pie de cada mensaje; una decisión recordada 4 veces bloqueó 6 h.

1. **Tres clases, por quién decide**, escritas una vez en el núcleo común:
   - **Clase 1 · técnica y reversible, no cambia lo que alguien ve ni el plan** → **el obrero decide y declara** en el AVANCE: `DESVÍO: qué ·
     por qué · cómo se deshace`. No consulta. (Deptos: "lo reversible que no cambia lo que alguien ve lo decidís vos".)
   - **Clase 2 · técnica pero cambia lo que alguien ve, el plan, el alcance o el NO SE TOCA** → **el director decide**, con la CONSULTA del
     obrero en opciones + recomendación. Contesta contra el spec; si el spec no alcanza, **sube a Guido como decisión de diseño**, con opciones.
   - **Clase 3 · diseño, negocio y las 5 de A** → **Guido**. Diseño y negocio las lleva el director con opciones y una recomendación, en
     criollo; las 5 de A son el clic en la pestaña que actúa.
2. **La regla del "ya lo sé"**: si el obrero tiene una recomendación y es clase 1, actúa.
   *Revisión integral (2026-10-26; H-6 y E-4 reabiertas con Guido)*: **(a) los desvíos de clase 1 se cuentan por script**, por módulo, junto
   con los sub-pasos nuevos (un sub-paso nuevo es siempre clase 2). **El contador nunca frena al obrero ni le habla**: va al director y a
   `/estado`. La pregunta "¿partimos el módulo?" solo aparece en un corte natural (encargo cerrado, el director armando el siguiente), nunca
   a mitad de un encargo, y solo si lo agregado cambia el alcance; muchos desvíos técnicos son un dato para el cierre, sin pregunta (Guido:
   "casi todos los obreros se desvían, y siguen trabajando; que ese clic no me parta las cosas a la mitad"). Detalle en [DISENO-H](DISENO-H-niveles-y-puertas.md) §12.
   **(b) La clase 2 que hoy sube a Guido como pregunta rutinaria no se pregunta más**: el agente aplica la recomendada y avisa en una línea
   ("hice X por Y; si querías otra, decímelo"); 7 de 8 consultas volvían con la recomendada (Guido: "durante el desarrollo casi siempre le
   doy el recomendado"). Reversible por definición; las 5 de A siguen con clic. **(c) La clase 3 tiene formato fijo** (E §2.6): diseño y
   negocio, charlando; lo demás con una línea de contexto, una RECOMENDADA primera, "qué cambia para vos", y **siempre el botón "explicámelo
   en criollo"** (qué decido · qué cambia para mí · un ejemplo concreto del proyecto).
   **(d)** *Apartado director/obrero (2026-10-26, decisión de Guido)*: **los cambios de método del propio proyecto son clase 2**: el agente
   los aplica en las skills, los agentes y los scripts del proyecto **con el diff mostrado y su commit**, sin preguntar, y quedan en el
   registro de cambios de método del proyecto (§22ter); **solo los que tocan barreras son clase 3**: un hook que niega, una regla `deny`
   o `ask` de settings, las 5 de A o `frenos.quitados` (F §14); un hook propio de arranque o una skill no son barrera. **Y clase 3 no es un
   pop-up**: el agente lo deja `propuesto` en el registro y en la cola "te espera" (§13.4) con el formato de E-4; nada cambia hasta que Guido
   actúa, que es lo que F §14 ya decía ("por pedido de Guido"). Se cuenta en §17 como decisión condicionada y rara (revisor frío 26/10,
   hallazgo 2). Es la misma línea que P66 (§5) y E-4 (b), dicha para el caso que Hermes resolvió al revés: su trámite exige
   un clic del PO por cada regla (F40, CM-14, CM-58) y el 26/10 fueron **31 clics en 8 tandas** en una pestaña dedicada a decisiones, la
   última con "lo que vos recomiendes acepto". Guido eligió el diff sin clic: "que los agentes apliquen los cambios de método del proyecto
   con el diff mostrado, sin preguntarme; solo las barreras con mi clic".
3. **El "sí" vale solo para lo que se preguntó** (S-M-14): un OK a una opción no autoriza el ensanche.
4. **Lo pendiente vive en un solo lugar, en dos campos de la ficha**: **"te espera"** (solo clase 3: decisiones, clics pendientes de las 5
   de A) y **"parado"** (PARADAs técnicas y clase 2, del director). `/estado` pone arriba solo el primero. Nunca al pie de cada mensaje.
5. **La alarma de intervenciones, por script, en cada cierre de tramo**: cuenta los mensajes de Guido a obreros y director durante el tramo
   (sin las 5 de A). **Más de 3 = línea obligatoria en las notas para el método**: qué le preguntaron de más y de qué clase debería haber
   sido. Que el script lea los transcripts de varias sesiones: **NO VERIFICADO**, piloto.

*Qué cambia para Guido*: le llegan solo las decisiones de clase 3; lo pendiente está en un solo lugar; si un tramo le preguntó de más, el
método lo registra solo.

## 14. Estandarizar sin perder lo propio: un dialecto en el molde, lo propio en cuatro casas, el canon entra por el módulo nuevo (decisión 11)

1. **Un solo dialecto, en el molde**: el núcleo común, `/director`, `/obrero`, `/tramo`, los subagentes y los scripts (verificador,
   `contexto`, `subpaso-cierre`, checklist nocturno, despertador, alarma, worktrees). Estado en la ficha del kit (E §4): skills, núcleo y
   subagentes `molde+propio` (la zona propia del implementador lleva las reglas del stack, hoy ~20 clavadas en Desktop); scripts `molde` con
   hermano `.propio` (E §5). *Nota a E §4: las piezas `director`, `obrero`, `tramo`, `nucleo`, los subagentes y los scripts entran a la ficha;
   hoy dice `director-obrero: no`.*
2. **Lo propio tiene cuatro casas, y ninguna es el cuerpo de la skill**: los **comandos del stack** → el script del gate y las skills
   `/smoke` y `/release`; los **datos del proyecto** → la ficha del módulo y la ficha del kit (§12); las **reglas de la casa** (la receta del
   worktree de Desktop, la noche, el contrato con un proyecto hermano) → la **zona propia** de la skill, **con su razón escrita** (E §4); las
   **cicatrices** → "Cómo se adaptó" de la ficha del kit. Y la condición de Guido: cuando el Arquitecto actualiza, **mira el repo y decide** la fusión (E §6.3) **y la informa sin preguntar, con veto** (E-4, 26/10, que reinterpreta la condición dicha el 23/10 como "pregunta")
   qué adaptación se mantiene (E §6).
3. **Lo que cada dialecto pierde al adoptar, con nombre**: Desktop y Mobile dejan la rama de bitácora aparte, `/gate`, las pestañas de repuesto
   y el checklist en prosa, la re-revisión obligatoria, el despertador permanente, el relevo por excepción y el encargo entero por mensaje.
   Deptos pierde poco y suma la medición de contexto, el máximo de vueltas, el explorador definido, el `tools:` del implementador y las tres
   clases. **Lo que nadie pierde**: TAB §11, con su enmienda de §8.
4. **El canon entra por el módulo nuevo, nunca por un tramo en curso.** Se adopta **en un cierre de tramo con los obreros cerrados**: el
   adoptador (E §7) instala, migra lo propio a sus cuatro casas con la ficha, y el **siguiente** director arranca con el canon. Dos skills con
   el mismo nombre no conviven: por eso el corte es en un cierre.
5. **Piloto: Deptos primero** (decisión de Guido; es el más cercano al canon), cuando él diga; después Desktop (donde más duele: 11 tipos
   de paso del PO, 34 rutas, 4 versiones de la suite) y Mobile (65 rutas, `/release` roto). Un módulo nuevo, el día primero y la noche
   después (§7). *Para G*: la "coordinación con Mobile" de Desktop es la mesa; va al buzón.

## 15. La ficha canónica: un módulo con director, de punta a punta

Lo que hace cada pieza y en qué orden, juntando las once decisiones con A, B, C, E y F. Entre corchetes, de dónde sale cada regla.

**0. Nace.** Guido pide en criollo. La sesión pregunta "¿es chico?" [§4]. Si no, el Arquitecto abre `docs/modulos/<x>/` en `main` con la ficha
y el `SPEC.md` en BORRADOR, con el pedido textual [B §5, §7]; aplica la prueba de director ("¿más de una pestaña ejecutando?") [§4]; verifica
el **entorno de prueba** [§12]; corre el **red team del spec** [§6]; y con director arma rama, worktree, `bitacora/`, `tiempos.md`,
`planes/`, nombres y la ficha del kit [§4, §7, §8]. **Si el plan ya se charló antes** (el hábito de Guido, E-1: "planeo con el director y
después meto al director"): se charla en la sesión que esté abierta, plana o el director de otro módulo, y **ahí mismo** esa sesión invoca al
Arquitecto en Modo B corto, que toma la charla como entrada; el módulo nuevo nace en `main` por el mismo worktree temporal de §8.4
(`worktree integrar`), porque esa sesión puede estar en `modulo/<y>`; y **el director que charló no es el director del módulo nuevo**: cada
módulo con director tiene el suyo [§4, §8] (revisor frío 26/10, hallazgo 30).

**1. Arranca el director.** Guido abre la pestaña con una línea. Opus `high`. Lee relevo (si hay), ficha, spec, `git log` corto, contexto
por script. Primer arranque: confirma en 3 líneas y espera el OK; de un relevo: confirma y sigue [§5, §11].

**2. El encargo.** `bitacora/<fecha>-encargo-<ID>.md`, commiteado en la rama del módulo [§8]: estado de partida por script y **archivos que
toca** [A §7, §5] · referencia al spec por `archivo:línea` [A §7] · alcance en sub-pasos (≤3 archivos, sin mezclar capas; RAD §2) · NO SE
TOCA · modelo y esfuerzo con razón [§6] · riesgo [§10] · AUTORIZADO [§7] · GATE [§12] · apertura [§7] · suscripción [§9] · skill. El mensaje al
obrero lleva la ruta [§9].

**3. Se abre el obrero.** Guido pega la línea (o el director lo lanza, si Guido lo pidió o es de noche) [§7]. Se presenta: rama, SHA,
modelo real, contexto. "Gana git" [§6, §11].

**4. El trabajo.** `/obrero` escribe él; `/tramo` delega con razón con nombre [§5]. Por sub-paso: explorador ubica → implementador (prueba en
rojo, mutación, código) → commit congelado → revisor Opus (lente por riesgo, 3 niveles, arranca en "le falta") → una corrección acotada
comprobada por `subpaso-cierre`; segunda vuelta solo si "rechazado"; máximo 2 → PARADA [§6, §10]. AVANCE por commit, ≤5 líneas, con SHA y
"contexto: N · falta: M"; el director no lo contesta: el verificador lo cruza [§9]. Clase 1 → DESVÍO declarado; clase 2 → CONSULTA al
director; clase 3 → Guido [§13]. Lo de AUTORIZADO son reglas `allow` estrechas que un script escribe en el `settings.local.json` del worktree del obrero (F-1); el hook solo niega las 5 de A, que piden el clic de Guido [§7]. Capturas al lector de capturas
[§6]. Espera de un OK: 30 min de día; de noche, PARADA [§9].

**5. El gate.** Sección GATE + el script del proyecto; las 5 reglas; `/smoke` con su contrato en archivo; arreglo sin prueba = rojo
(`gate:fix-sin-prueba`); riesgo alto → red team de construcción [§10, §12].

**6. Cierra el encargo.** El obrero escribe su evidencia en su archivo hermano, pushea su rama, manda CIERRE con notas para el método, y no
corre `/cierre` [§8, §9]. El verificador por script da 6 líneas al director; si el script falla, NO VERIFICADO y PARADA [§5]. El director
mergea a la rama del módulo sin preguntar [§8]. El obrero se reutiliza o se cierra [§11].

**7. Cierra el tramo (el director).** Sobreescribe la ficha (tareas con su commit, próximo paso, parado, te espera), actualiza `tiempos.md`
con lo mecánico del script y su estimación [C §2.6, B §5bis], mira la alarma de intervenciones [§13]. Si pasó el umbral blando: relevo en
`bitacora/`, commit, push, deja de escribir [§11].

**8. La noche.** Checklist por script; Guido dice "me voy" y resuelve lo que vence [§9]. Director bajo ~40% o se muda antes [§11]. Obreros
con `apertura: director` y topes [§7]. El despertador afuera mira git y solo despierta al director si hay PARADA o commit [§9]. Las 5 de A
→ `deny` + PARADA → "te espera" [§7].

**9. Termina el módulo.** Merge a `main` por el director con el gate completo; **`/cierre` del proyecto** (handoff, TODO, CHANGELOG, candado)
[§8]; `/release` con un OK de Guido [§8]. La ficha pasa a `COMPLETO` y queda como manual; `tiempos.md` queda; la lección va al histórico
[B §5, C §3bis].

**Módulo solo (sin director).** La misma carpeta con menos archivos (B §6). La sesión de Guido hace el trabajo; para código lanza el revisor
Opus en la 1.ª vuelta [§10]; corre el script del gate; `/cierre` mantiene la ficha. Sin bitácora, sin `tiempos.md`, sin encargos.

**Lo que hace Guido en todo el ciclo, y nada más**: pide, en criollo · da el OK del primer arranque del módulo · **abre las pestañas** que
le pide el director, una línea cada una (default; se mide) · cliquea **las 5 de A** en la pestaña del obrero · decide **diseño y negocio**
con opciones y una recomendación · dice "me voy" y resuelve lo que vence, una frase por noche · `/estado` cuando quiere y el resumen de fin
de día [C]. Todo lo demás, incluidos merges, verificación, documentación y relevos, lo hacen los agentes con rastro en git.

## 16. La revisión (2026-10-23)

Un revisor frío (Opus, sin contexto de la charla, ~158 mil tokens) leyó las once decisiones, la ficha canónica, A, C enteros y las
secciones de B, E, F y TABLERO que D toca. **25 hallazgos: 7 que rompían, 5 preguntas a Guido escondidas, 4 supuestos tratados como hechos,
3 piezas que el filtro no dejaba pasar enteras, 5 huecos de operación, 1 de tablas que se autoelogian.** Pasados por el criterio
establecido (regla de Guido del racimo F): **21 aplicados** en el texto de arriba, **3 decididos por Guido** (la quinta pregunta, la enmienda
a TAB §11, y la pregunta sobre la mensajería en VS Code, que quedó NO VERIFICADO como prueba 1 del piloto), **1 rechazado con razón** (que
el checklist nocturno quedaba vacío: confundía las reglas `ask` con lo que pregunta el modo `default`).

Lo que rompía y cómo quedó: el director mergeaba sin poder commitear código (§6) · el obrero podía escribirse su propio AUTORIZADO (§7) · de
noche en bypass las 5 de A no frenaban (§7) · `/cierre` en la rama del módulo pisaba el handoff de `main` (§8) · D5 sacaba una pieza de TAB
§11 sin decirlo (§8) · "te espera" y "tramo" con dos sentidos (§13, §5). Las preguntas escondidas: el OK por release (ahora quinta de A), el
OK en cada mudanza (sacado), abrir pestañas (contado y medido), PARADAs en "te espera" (campo aparte), y "me voy" (contado). Lo que el
revisor pidió proteger y se protegió: las tres clases con el desvío declarado, la revisión congelada con ≤2 vueltas, "compactar es una
falla", el gate como script y cero datos clavados, y "ninguna falla deja a Guido peor que hoy".

## 17. Preguntas nuevas a Guido, contadas

Fuera de las 5 de A y de diseño/negocio, D le suma **dos acciones**, las dos elegidas por él: **abrir las pestañas** de los obreros con una
línea (default; se mide en el piloto y se puede delegar por encargo) y **decir "me voy"** más resolver lo que vence, una frase por noche. Le
**saca**: el merge y el clic de merge, el OK en cada mudanza (9-17 por mes), vigilar el indicador de contexto, pegar textos, ~30 pop-ups
sobre lo ya autorizado, y las decisiones de clase 1 y 2. *Revisor frío (26/10, hallazgo 2)*: y **una decisión condicionada, rara**: un
cambio de método que toca una barrera queda `propuesto` en "te espera" hasta que Guido actúe (§13.2 d); no es un pop-up ni se le pregunta.

## 18. Cómo se sabe si funcionó (se mide en el piloto de Deptos, contra las líneas base de hoy)

| Medida | Hoy | Meta |
|---|---|---|
| Turnos vacíos del director (avisos sin novedad) | 34% (39 de 115) | cerca de 0 |
| Intervenciones de Guido por tramo (sin las 5 de A) | ≥4-5 (alarma cruzada dos veces) | ≤3, y la alarma mirada en cada cierre |
| Vueltas del revisor por sub-paso | 19 para 8 (7 de 8 segundas vacías) | ≤1,3 por sub-paso, misma caza en la 1.ª |
| Horas de obrero parado de noche | 8,5 | 0 (PARADA anotada) |
| Duración de la mudanza | 1-9 min; 2 de 37-55 | ≤9, ninguna por seguir escribiendo |
| Compactaciones | 0 (Guido) | 0, con los dos umbrales medidos |
| KB que carga un obrero al arrancar | 62-75 | menos, con el núcleo común y cero cicatrices |
| Arreglos que traen su prueba | 18-22% (Desktop/Mobile), 45% (Deptos) | hacia 94% (Portal) |
| Pop-ups por tramo sobre lo ya autorizado | ~30 | 0 con las `allow` por script (F-1) |
| Aperturas de pestaña a mano | ~120 | contadas; menos si Guido delega |
| `/rename` a mano por obrero | 1 por pestaña (~120) | 0 desde terminal; en pestaña de la extensión, según la prueba del piloto (el nombre lo decide el director igual) |
| Rutas absolutas y nombres de sesión en skills | 34 / 65 / 0 | 0 en los tres (candado) |

## 19. Lo que se va a otro racimo o queda en espera

- **H**: el criterio "más de una pestaña ejecutando" como regla del Arquitecto; el texto del triage; nombres de la rama del módulo, de la
  rama por encargo y de los worktrees; el script del worktree con su entorno; **el entorno de prueba como verificación del Arquitecto**;
  mapear `sensible:` a reglas concretas (con F); P35 queda resuelto acá como el escalón "lo chico sin sesión".
  *Todo resuelto por H el 2026-10-25 ([DISENO-H](DISENO-H-niveles-y-puertas.md) §5, §6, §9, §10, §15, §16); P35: la variante de una pestaña + subagentes es un módulo solo, no un escalón con director.*
- **G**: `crossSessionInbound` y el mismo entorno por PC (WSL y Windows nativo no se ven); la suscripción por tipo de mensaje del buzón; la
  mesa entre directores.
- **E**: las piezas de director/obrero en la ficha del kit.
- **F**: el modo del obrero nocturno con el hook debajo (§16); el plan de base real como sub-paso de riesgo alto (§13).
- **Misión 6**: el banco de pruebas del método. **En espera**: `/retro` (P22), el glosario de dictado (P21).

## 20. Límites de este diseño

- Las skills de Desktop y Mobile se leyeron enteras; sus métodos largos (216 y 88 KB) solo por las secciones que las skills citan. Deptos se
  juzgó por su tracker y su git, no por sus chats.
- Nada de la plataforma se probó: todo lo marcado NO VERIFICADO (10 puntos) es del piloto. La mensajería en VS Code la confirmó Guido
  (funciona con `/rename` hecho); la primera prueba pasa a ser **el nombre al reanudar** (§7.6) y `claude --bg` desde el director.
- Los números de otros métodos (gentle-ai y los demás) son lo que cada repo dice de sí mismo.
- La decisión 5 es provisoria: el revisor frío la ajustó en tres puntos (§8), pero Guido la quiere ver otra vez en la revisión integral del
  tramo 4. *(La vio, y la cerró el 2026-10-27.)*

## 21. Los 11 criterios, aplicados a este racimo

| # | Criterio | Cómo lo cumple D (con la evidencia) |
|---|---|---|
| 1 | Menos intervención de Guido | Le saca el merge, el OK por mudanza, el indicador de contexto, los pegados, ~30 pop-ups y las clases 1-2 (§17); le suma dos acciones que eligió él, contadas y medidas (§18) |
| 2 | Pragmático, recortado | Ninguna skill nueva; `/gate` eliminado; 3 herramientas con número atrás y 6 descartadas con razón (§6); el agente PO y la skill unificada, descartados (§4, §5); 1 hallazgo del revisor rechazado por "por las dudas" al revés |
| 3 | Medible | 11 medidas con su línea base de hoy (§18); la alarma de intervenciones calculada, no recordada (§13) |
| 4 | Software que anda y se sostiene | Revisor Opus intocable en la 1.ª vuelta; revisión congelada; arreglo con su prueba como regla del gate construida con A §5; red team de construcción en riesgo alto; entorno de prueba verificado por el Arquitecto (§10, §12) |
| 5 | Tokens y el modelo justo | Sonnet por defecto en obrero y tramo con razón escrita; Haiku solo ubica; vueltas vacías del revisor eliminadas; el despertador afuera del director para que un turno vacío no relea 400 mil (§6, §9, §10) |
| 6 | El script antes que el modelo | Verificador de avisos, contexto, `subpaso-cierre`, gate, checklist nocturno, despertador, alarma, candado de datos: 8 scripts; el modelo no cuenta ni mide (§6-§13) |
| 7 | Seguro por defecto | Las 5 de A como `ask` de día y `deny` + PARADA de noche; AUTORIZADO son `allow` estrechas escritas por script en el worktree del obrero (F-1), que él podría editar: el gate del cierre lo cruza (F §14), y las 5 de A no dependen de eso porque las niega el hook; topes de plata y turnos en headless; nada de esto depende de la app de escritorio (§7) |
| 8 | Portable | Cero datos clavados con candado; cada sesión mide su propio contexto; lo propio en cuatro casas con razón; el obrero no sabe quién lo abrió (§11, §12, §14) |
| 9 | Lo chico no paga lo grande | Tres tamaños con triage en la puerta; `/obrero` no carga el ritual del equipo; lo chico sin sesión como subagente; sin revisor en texto (§4, §5, §7, §10) |
| 10 | Autónomo pero con rastro | Encargo, evidencia y relevo commiteados en la bitácora; desvío declarado con cómo se deshace; revisión atada a un SHA; PARADA anotada en la ficha (§8, §10, §13) |
| 11 | Piloto antes de flota | Deptos primero, un módulo nuevo, tres escalones que se deshacen; 10 NO VERIFICADO con su prueba nombrada; el canon entra por el módulo nuevo (§7, §14) |

## 22. Revisión integral con el acta de contraste (2026-10-26)

Con [`tips/tanda-2026-11-contraste.md`](../../tips/tanda-2026-11-contraste.md) abierta y tres chats ★ releídos por lectores Sonnet
(6a9b5771, 76bfe51b, 23f8dd9f). D es "el más complejo y el más importante" (§2) y el que más decisiones reabrió. Lo que cambió:

| Qué | Veredicto del acta | Qué se hizo | Dónde |
|---|---|---|---|
| D-5 · el umbral de 800 mil | confirmada, con la premisa del umbral tocada: los directores cortan a 460-700 mil; uno murió a 834 mil | §2 corregido para decir lo de §11 (sin número fijo); el duro arranca en ~80%; **la lectura del contexto propio y ajeno está verificada en la app de escritorio** | §2, §11 |
| D-8 · una sola corrección | mixta (✔696 / ✘332): Opus en la 1.ª queda; 3-4 vueltas son la norma | Tope 2 se queda; paquete por script, afirmaciones en prosa a un corrector, la 3.ª para al director; conteo por script | §10, §6.9 |
| D-10 · sin agente PO | contradicha (✘43 / ✔23): % de avance y qué pestañas cerrar | Dos líneas más en `/estado`, sin agente | §4, C §2.5 |
| E-1 · la puerta | contradicha (✘84 / ✔11) | La sesión invoca sola al Arquitecto; Modo B corto; candado por script; paso fijo de `/director` | §4, E §2, H §8 |
| E-4 · decisiones en criollo | contradicha (✘155 / ✔107) | Tres clases: diseño charlando · rutinaria sin pregunta con veto · formato fijo con "explicámelo en criollo" | §13 |
| H-6 · el spec no crece | contradicha (✘222 / ✔21): 9-12 desvíos por tramo | Contador por script que nunca frena al obrero; partir solo en corte natural y por alcance | §13, H §12 |
| F-1 · el clasificador | contradicha en F | AUTORIZADO como `allow` estrechas; hook solo `deny`; noche nunca `auto` | §7.3, §7.4 |
| D-2 · hotfix en chat plano | contradicha (base): lo chico pagó revisor, gate y release | Queda para el spec: las reglas propias del proyecto (revisor, mutaciones, gate) declaran su excepción para "chico" en la ficha, o le ganan a H-2 | spec |
| D-3 · Sonnet por defecto | mixta: Guido tipea `/model opus` en 9 de 10 pestañas | Nada en la premisa; el modelo lo fija el encargo y la línea de apertura, no Guido a mano (§7.6) | — |
| D-6 · cada mensaje trae algo | confirmada (✔1400 / ✘175); queda el ruido de "pestaña lista" y acuses | A la definición del subagente y al verificador: una presentación sin novedad = cero texto | §9 |
| D-7 · reportan por commit | confirmada (✔1237 / ✘30) | El verificador por script caza "commit con la suite en rojo" (visto 2 veces) | A §7 |
| D-9 · el nocturno no se traba | contradicha (base): merge nocturno con clic | Lo resuelve A-1 (merge pre-autorizado con gate verde) y la noche sin `auto` | A §2, §7.4 |
| D-11 · ≤3 intervenciones por tramo | mixta: vale en pestañas de obrero; en la del director, los días de gate manual o producción pasan de 10 | La alarma de §13.5 cuenta **por pestaña** y separa los días con Guido de operador (F §8 los reduce) | §13.5 |
| P63/P68 · "me voy" | ~50 veces en ~21 chats | Respuesta fija del director, también de día | §9.5 |
| P65 · P75 · P62 · P66 · P73 | hábitos y huecos | Cinco líneas al núcleo común | §5 |
| P71 · subagente con tope y latido | 13 lotes | Regla en la tabla de roles; los números al piloto | §6.7 |
| P76 · modos de `/obrero` | 6 lotes | Transformada: "spec" → E-1; "decisiones" → E-4 clase 2 + §13.4 | §6.8 |

**Ya no queda nada provisorio**: la decisión 5 (ramas y escritores, §8) no la tocó el acta (G-5 mixta: "gana git" funciona; el atraso de los
worktrees lo arregla el `fetch` en `/inicio`, G §11.1), el revisor frío le cerró el hueco del merge a `main`, y Guido la cerró el 2026-10-27. **El apartado propio de director/obrero** (el canon
de D contra lo que Hermes Desktop cambió en su método entre el 2026-10-20 y hoy) está en §22bis, escrito en la sesión 2 con Guido adentro.

## 22bis. El apartado director/obrero: el canon contra lo que Hermes Desktop cambió solo (sesión 2, 2026-10-26)

**Por qué existe** (pedido de Guido, ADR-025 decisión 2): mientras se diseñaba D, Hermes Desktop siguió cambiando su propio método con un
registro formal, `docs/metodo/CAMBIOS.md`. Medido hoy en `D:\Hermes\Hermes.exe`: **38 commits** desde el 2026-10-20 en `.claude/skills` y
`docs/metodo` (255 en todo el repo, 9 solo en las skills; la cifra de 126 del ADR-025 era de una medición anterior que no se
reprodujo); el registro pesa 230 KB; **las 31 fichas CM-72 a CM-102 se aprobaron y aplicaron el 26/10** en 8 tandas con clic del PO en una
pestaña dedicada (`obrero-identidad-decisiones`), y **CM-103 quedó aprobada sin aplicar**. Mobile no tocó el suyo. Se leyeron las 32 fichas
enteras y se cruzó cada una contra las 11 decisiones de arriba con el filtro **"un solo proyecto no alcanza, salvo cicatriz o 3+"**.

**Coinciden con el canon (12), nada nuevo para D**: CM-72 (verificar en la punta del repo del otro → G §5/§7: el script lee el archivo
commiteado de `origin`, que es siempre la punta; la firma por hash es propia) · CM-73 (tras un reinicio, ListAgents y pedir reenvío → §7.6 d, el
canal por archivo es la red) · CM-74 (leer la estructura del JSON, no la línea del grep → criterio 6, settings por script) · **CM-76** (tras 2
vueltas, commit con lo abierto declarado y OK del director → **la misma decisión que D-8 tomó el mismo día**, §10.4) · CM-81 (una decisión que
pide dos cosas se mide contra el código antes de partir → el Arquitecto en Modo B corto explora el código real, §4) · **CM-83** (el gate del
binario lo manejó el agente en 16 minutos contra 1-2 h previstas del PO copiando claves → **la prueba de P65**, §5) · CM-87 (un archivo con
una credencial no se lee entero → F §4 y F §8; nota a F: la credencial dentro de un `.py` es el problema de fondo) · CM-88 ("X ya no existe"
se mide antes de decirlo; una premisa corregida reabre la decisión → regla de evidencia, §6.5) · **CM-92** (el orquestador confirma cada
hallazgo del revisor con un script → §6.5, textual) · CM-96 (al implementador se le dice textual que no esquive controles → §6, con una
**tensión en dónde vive**: Hermes lo repite en cada encargo además de la definición; §6.3 dice definición, porque lo dicho por encargo falló
~5 veces; gana §6.3) · CM-101 (etiqueta fija de destino para pendientes → B §10 y §13.4: un solo lugar la hace innecesaria) · **CM-102**
(`/cierre` con pathspec, push de la rama por nombre, sin rutas fijas → G §11.2, D §12.6 `candado:datos` y H §10.7; **convergencia total**, y
Hermes llegó solo por la cicatriz de la mudanza de PC del 22/10).

**Propias del stack de Hermes (15), a la zona propia del implementador (§14.2)**: CM-75 lista blanca para un clasificador de SQL · CM-77
índice contra disco antes del commit (sin medir) · CM-78 mutaciones en bytes · CM-80 barrido de importadores de 1.º y 2.º grado · CM-84 una
clave por archivo sin fin de línea · CM-85 la mutación de un `!=` en las dos direcciones · CM-89 mutar la llamada, no la función · CM-90 el valor
sensible fuera del `assert` · CM-93 recuento de aserciones por AST antes y después · CM-94 congelados bajo un stub · CM-95 la suite con el módulo
bloqueado antes de borrarlo · CM-97 mutar la guarda · CM-98 rojo sin la llamada antes de sacarla · CM-99 marcador sin mayúsculas · CM-100 la
red mira el camino que llena el campo. Todas respetan el espíritu de §6 (la mutación en rojo, "la ejecución es la medición") y ninguna es del
kit: son reglas de pytest, de `db-migr` y de Windows.

**Nuevas con cicatriz (4), entraron al canon con el OK de Guido**, una línea cada una, en el lugar que ya las esperaba:

| CM | La cicatriz | Dónde entró |
|---|---|---|
| 79 | un test con `GIT_DIR` commiteó 7 veces en el `main` real; 12 h sin verse porque el chequeo miraba solo los worktrees | §9.3: el despertador y el verificador miran también el checkout principal |
| 82 | el `.exe` del gate le habló a producción con el `config.ini` igual al del ensayo; el PO entró a producción con código de rama | H §9.3: el chequeo base entra con una cuenta que solo existe en el entorno de prueba |
| 86 | ~7 h de noche sin commits por un corte de red, sin que nadie lo supiera | §9.5: la red en el checklist; el resumen del amanecer dice las horas perdidas y por qué |
| 91 | dos suites a la vez en la misma PC: 232 rojos falsos (`0xC0000142`) | §5: un encargo tampoco comparte recursos exclusivos de la máquina con otro abierto |

**Para el flujo proyecto ↔ kit (1)**: CM-103 define los estados del registro (`propuesto → aprobado → aplicado (SHA) · rechazado (motivo)`),
con un test que los distingue, dos commits por cambio (aplicar, y después el SHA) y **una tabla de medición por cambio** (mecánico o blando ·
cómo se sabe si funcionó · línea base con fuente), que **la pidió esta misión el 2026-10-15** y Mobile hace desde su `D-192`. Es el contrato
del registro que se decide en §22ter y en el ADR nuevo.

**Lo que contradice al canon no es una ficha, es el trámite**: cada cambio de método pide un clic del PO. Guido decidió por el canon
(§13.2 d): los cambios de método del proyecto son clase 2, con el diff mostrado; solo las barreras son clase 3.

**Otras tres cosas de los 38 commits**: el relevo del director se reescribió 4 veces en 4 días más un `RETOMAR_PC_NUEVA.md` temporal (coincide
con §11.4: el relevo es un archivo; el canon lo pone por fecha en `bitacora/` en vez de pisar uno solo) · las rutas fijas `D:\` pasaron a
relativas el 22/10 (coincide con §12.6, cicatriz real) · la mesa de decisiones en una pestaña propia es el "modo decisiones" de `/obrero` que
§6.8 ya transformó en E-4 clase 2 más la cola "te espera".

**Veredicto del apartado**: de 32 cambios que Hermes se hizo solo en una semana, **ninguno contradice una decisión de D**, 12 ya estaban, 4
sumaron una línea con su cicatriz y 15 son del stack. El canon aguanta el contraste con el proyecto que más cambió. Lo que sí hay que diseñar
es el circuito por el que esos cambios viajan (§22ter).

## 22ter. El flujo proyecto ↔ kit: el registro de cambios de método es pieza del canon (sesión 2, 2026-10-26; ADR-026) `[consistencia · autónomo con rastro]`

**La pregunta** (ADR-025, decisión 2; E §14, caso E-3): ¿un proyecto sigue cambiando su método entre versiones del kit, y cómo vuelve al kit
lo que aprende? Hermes Desktop ya contestó la primera parte con hechos (§22bis): 32 cambios en una semana, 4 con cicatriz de producción.
Congelarlo hasta la versión no aguanta; propagar entre proyectos sin curaduría tampoco. **Guido eligió la opción B**: registro por proyecto,
archivos chicos, sube al kit por el ciclo con 3+ o cicatriz, urgencias como parche, adopción entre proyectos citándolo.

1. **Qué es.** Cada proyecto `estandar` lleva su **registro de cambios de método**: `piezas.cambios-metodo: molde` en la ficha del kit (E §4).
   Un cambio es **un archivo chico**, `.claude/cambios/<fecha>-<slug>.md` (es del método, no del proyecto: va al lado de la ficha y de
   `frenos.log`, B §4; nunca un archivo que crece, B §5), con **cabecera legible por script**: `estado:` (`propuesto` · `aprobado` · `aplicado:
   <SHA>` · `rechazado: <motivo>` · `subio-al-kit: v<x>`) · `clase:` (`2` · `3-barrera`) · `toca:` (las piezas) · `origen:` (la bitácora o el
   encargo con fecha, **o `cita: <alias> <id>`** si viene de otro proyecto) · `aprobo:` (solo clase `3-barrera`: quién y cómo; **`aprobado` existe solo para esa clase**: la clase 2 va de `propuesto` a `aplicado`
   directo y el diff es su rastro; revisor frío, hallazgo 17) · `aplico:` (archivo y hash del bloque escrito en la zona propia, para que el
   actualizador sepa si sigue intacto; hallazgo 29). Abajo, el contrato de
   CM-103 de Hermes, que esta misión ya había pedido en parte el 2026-10-15: **el caso de origen** (citado, no copiado), **la regla como
   queda** y dónde vive, y **la tabla de medición** (freno mecánico o regla blanda, y dónde · cómo se va a saber si funcionó · línea base con
   su fuente, o "no está medido"). El índice no se escribe: lo arma el script (`cambios listar`), y lo muestra `/estado` si se le pide.
2. **Quién lo escribe y quién lo aplica.** Lo escribe quien lo detecta: el director en su rama, el obrero como nota de su CIERRE (el director
   la pasa a archivo), la sesión plana en el `/cierre` de un módulo solo. **Se aplica como clase 2** (§13.2 d): el agente lo escribe en la zona
   propia de la skill, el agente o el script con el diff en su AVANCE o su cierre, sin preguntar, y vuelve a poner el SHA (dos commits: el que
   aplica y el que anota el SHA; uno no puede contener su propio SHA, lo aprendió Hermes). **Solo lo que toca barreras es clase 3**: hooks,
   reglas `deny`, las 5 de A (F §14), con el clic de Guido en la pestaña que actúa. La prosa "Cómo se adaptó" de la ficha del kit (E §4) **no
   se escribe dos veces**: su línea es el puntero al archivo y la razón en una frase; el archivo tiene el caso, la regla y la medición. *Nota a
   E §4.*
3. **El candado** (`candado:cambios`, dentro del de B §14; es el test de CM-4 y CM-103 de Hermes vuelto genérico): `aplicado` sin SHA, SHA que
   no existe en el repo, `aprobado` o `aplicado` de clase `3-barrera` sin `aprobo:`, `aprobado` en una clase 2 (que va de `propuesto` a `aplicado` directo), o estado que no es uno de los cinco = rojo. Corrector, no
   pregunta.
4. **Cómo sube al kit: por el ciclo.** El ciclo de mejora (misión 6, cada 3-4 meses) corre `cambios flota` sobre los registros de todos los
   proyectos **antes de leer chats** (criterio 6: lo que puede calcular un programa no lo lee un modelo): agrupa por regla y por `cita:`.
   **Entran al kit**: lo que aparece en **3 o más proyectos** (dos citas de un mismo cambio ya cuentan 2), y lo que aparece en **uno solo con
   cicatriz** de seguridad, producción o plata. Lo demás queda propio, con su razón. Lo que entra sale en la versión nueva; **el actualizador
   (E §6) al bajarla marca `subio-al-kit: v<x>`** en los archivos que el kit ya cubre y **retira la zona propia correspondiente si está intacta**
   (el hash que el archivo del cambio guardó en `aplico:` coincide con el bloque; igual que una pieza que el molde dio de baja); si está editada, la deja y lo informa. El cruce es **por `cita:` o por id**, nunca por texto.
5. **Urgencias como parche.** Una cicatriz de seguridad o producción no espera al ciclo: el director la marca `urgente: si` en el archivo y lo
   dice en el cierre a Guido en una línea ("esto es para el kit ya"); la sesión madre de vibe-kit saca una versión de parche (como el tope del
   hook, v2.4.3) y la flota la recibe con el actualizador. El observatorio lee los registros igual que los chats (ADR-025, decisión 3). Y para que no dependa de que Guido se acuerde (criterio 8;
   revisor frío, hallazgo 25): **el `/inicio` de vibe-kit lista por script los `urgente: si` de la flota** (`cambios flota --urgentes`, sobre
   los repos de `flota.py`), misión 5.
6. **Adopción entre proyectos, citándolo.** Antes de la versión, un proyecto puede tomar un cambio de otro: lo copia a su registro con `origen:
   cita: <alias> <id>`, lo aplica en su zona propia como clase 2 y listo. Es lo que Hermes ya hace con tres reglas de Mobile (CM-55, 56 y 57
   citan C-71, 73 y 76). **Nada se propaga solo** (alternativa C descartada: dos proyectos no hacen regla, y el dialecto de uno se impondría
   sin la curaduría que este repo exige).
7. **Lo que se acepta**: entre versiones, dos proyectos pueden tener reglas distintas para lo mismo; es el precio de que la cicatriz se
   escriba el día que pasa. Lo que se mide en el piloto: cambios propios por proyecto y por mes (línea base: Hermes Desktop, 32 en la semana
   del 20 al 26/10), cuántos subieron al kit en el ciclo, y cuántos clics de Guido por cambio (línea base: 31 en un día, 26/10; meta: solo las
   barreras).

*Alternativas descartadas*: congelar el método del proyecto hasta la versión (A) · propagación automática entre proyectos (C) · el archivo
único de Hermes (230 KB que el director relee; B §5). *Qué cambia para Guido*: no aprueba cambios de método uno por uno (ve el diff); cada 3-4
meses el ciclo le trae la tabla de lo que sube al kit y por qué; las barreras siguen con su clic; y un cambio que Hermes aprendió hoy puede
estar en Mobile mañana, citado, sin esperar a nadie. **NO VERIFICADO** (piloto): la migración del `CAMBIOS.md` de Hermes a archivos chicos al
adoptar (E §7, por script, uno por CM, como el Hub con sus specs), y que el actualizador case por id lo propio con lo que entró al kit.

