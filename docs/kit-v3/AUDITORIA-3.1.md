# Auditoría del sistema — kit 3.1.0 (`reflexion` y el buzón)

> La mirada del sistema antes del tag (paso 8 de `docs/CICLO-DE-MEJORA.md` §6, acá una sola sesión). 2026-11-20, Fable 5.2, solo
> lectura. Rango `f1e9077..e5e6d72`. No busca bugs línea a línea (eso lo hizo el revisor frío Opus, cuyos 6 hallazgos se cruzan abajo).
> Lo único que se corrió: `instalar-hooks-pc.cjs --plan` en esta PC (no escribe). La suite y `kit-sync` no se tocaron.

## Veredicto: **visto bueno con condiciones**

Para Guido, en criollo:

1. **Las dos piezas están bien encajadas y pueden salir hoy.** `reflexion` no toca nada de nadie; el buzón, sin registrarse, no
   lee, no escribe y no contesta nada.
2. **"Inerte" es verdad para el buzón, pero no para la actualización**: al actualizar, toda PC recibe un programita más que corre
   en cada herramienta, y el instalador reacomoda el registro del anti-secretos. Eso hay que decirlo en la nota y probarlo una vez
   en una PC de verdad antes de publicar.
3. **Sale sin piloto y sin banco: lo compro, con una condición de texto**: la nota tiene que decir que registrarse en el buzón es
   entrar al piloto, que "contestar solo" nace prendido y cómo se apaga.
4. **Tu caso (la misma persona en dos PCs) todavía no anda**: termina en disputa. No frena el tag ni el piloto (es en una sola PC),
   pero no te registres en la segunda PC hasta la 3.1.1.
5. **Antes del tag son tres cosas, todas chicas** (la nota, dejar escrita la excepción al banco, y la instalación real en una PC).
   Lo demás va a una 3.1.1 que sale del piloto, y dos temas a la 3.2 junto con el PO.

## Las condiciones (antes del tag)

### 1. La nota de migración no dice lo que la actualización le hace a una PC sin buzón
- **Evidencia**: `kit/CHANGELOG.md` `[Unreleased]` son tres sub-notas escritas sesión por sesión ("primera mitad… `buzon.cjs` llega
  en la sesión 2"), y la última dice "nada cambia… en una PC sin buzón" (`kit/CHANGELOG.md:45`, hallazgo 4 del revisor). El `--plan`
  real de hoy en esta PC, sin buzón: copia 7 archivos, **actualiza el `UserPromptSubmit` del corrector** y registra `SessionStart` y
  `PostToolUse`. ADR-039 lo acepta como costo ("un node más por herramienta", p95 de 68 a 114 ms).
- **Qué falta**: una sola nota `## 3.1.0` que diga: (a) qué cambia en toda PC aunque no uses el buzón; (b) que registrarse es entrar
  al piloto, que "contestar solo" nace prendido (`buzon.cjs:594`, `contestar_solo: true`) y se apaga con `registrar --apagar`;
  (c) que la misma persona en dos PCs espera a la 3.1.1 (hallazgo 5).
- **Toca**: consistencia · acordarse de menos. **Destino: antes del tag** (es el commit de `VERSION`, que ya toca esa nota).

### 2. Sale sin banco y sin `rc`, y eso contradice una regla propia sin dejarlo escrito
- **Evidencia**: ADR-035 punto 1, "el banco de prueba es paso fijo para sacar una versión"; `CICLO-DE-MEJORA.md` §6 pasos 4-14. El
  handoff y el TODO todavía hablan de `3.1.0-rc.1` y de "las tres cosas" de la 3.1 (`docs/TODO.md`, misión 7).
- **Mi lectura**: saltearlo es proporcional (ADR-029). El banco mide adoptar, la flota y la noche; de eso la 3.1 toca una línea del
  molde (`inyeccion.cjs`, `correctorRegistrado` por nombre), que la flota de prueba sí ejercita. Pero la excepción tiene que quedar
  con su razón, o la próxima versión no sabe si el banco sigue siendo fijo.
- **Qué falta**: dos renglones en la entrada de hoy del `docs/CHANGELOG.md` (o un ADR corto): por qué la 3.1.0 sale sin `rc` ni
  banco, y que el PO y "probar una idea nueva" pasan a la 3.2; el TODO al día con eso. De paso: a la entrada de `reflexion` del
  `docs/CHANGELOG.md` se le perdió el título (el bloque que arranca "La PC del probador… con su OK y el de Guido para trabajar en
  `main`", entre el diseño del buzón y la v3.0.1).
- **Toca**: consistencia. **Destino: antes del tag** (solo texto).

### 3. El instalador de hooks por PC cambió entero y nunca corrió en una PC de verdad
- **Evidencia**: `instalar-hooks-pc.cjs:111-119` (la tabla `PIEZAS`, cuatro eventos); todas sus pruebas usan `--home` de mentira;
  `pruebas/rehacer.sh` no lo llama (la flota de prueba no lo cubre); el handoff lo tiene en "Te espera" para las dos PCs. Es la pieza
  que sostiene el anti-secretos de **todas** las PCs, usen o no el buzón.
- **Lo que ya vi**: el `--plan` de hoy en esta PC sale 0, no toca `PreToolUse` y solo suma lo del aviso. Buena señal, no prueba.
  (Dato suelto: `~/.claude/hooks/kit/INSTALADO` dice `kit: 3.0.0` y el kit va por 3.0.1.)
- **Qué falta**: aplicarlo una vez en esta PC con el OK de Guido ("instalar hooks por PC"), el `doctor` (`hooks-pc ✓`,
  `buzon · sin buzón en esta PC`) y abrir una sesión nueva para ver que el corrector sigue frenando. Se deshace con `--quitar`.
- **Toca**: mejor código. **Destino: antes de publicar** (puede ir después del commit de versión y antes del push del tag).

## Para la 3.1.1 (sale del piloto)

### 4. El aviso se registra en toda PC "por las dudas"
- **Evidencia**: `PIEZAS` no mira la config; la regla `allow` sí (`manuales/SCRIPTS.md:158`). Y registrarse ya obliga a reinstalar
  los hooks (`buzon.cjs:604`, "falta: instalá los hooks por PC"). O sea: registrar el aviso sin config no ahorra ningún paso y le
  cobra un proceso por herramienta a las PCs que nunca van a tener buzón. El criterio 9 del diseño ("lo chico no paga lo grande") se
  cumple en tokens, no en procesos.
- **Propuesta**: que el aviso se registre con la misma condición que la regla (con config). **Toca**: workflow · "nada por las
  dudas". **Destino: 3.1.1** (es cambiar un freno de la PC: con su prueba, no hoy).

### 5. La misma persona en su segunda PC termina en disputa (hallazgo 3 del revisor): sube de prioridad
- **Evidencia**: `buzon.cjs:656-666` escribe un registro rival si la cuenta trae el agente v0 del proyecto; la skill promete un alta
  (`kit/skills/buzon/SKILL.md:72`). Y `--resolver` elige **una** cuenta por id en cada PC (ADR-040, 2): con dos PCs de la misma
  persona, una de las dos nunca verifica.
- **Mirado desde el sistema**: es exactamente el caso de Guido (dos PCs, las dos con agentes v0). No bloquea el tag ni el piloto,
  que corre en una sola PC; sí bloquea la mudanza de Guido. **Destino: 3.1.1, y antes de que Guido registre su segunda PC**; hoy,
  el renglón de aviso en la nota (condición 1).
- **Toca**: workflow.

### 6. Tres NO VERIFICADO que cierra el primer uso real, uno de ellos es VS Code
- **Evidencia**: `carpeta.cjs:15` acepta `claude-vscode` como sesión de persona, y eso está "leído en el binario; VS Code en vivo,
  NO VERIFICADO" (`docs/CHANGELOG.md:48`). Si la extensión manda otro valor, `responder` se niega: falla del lado seguro, pero en la
  PC de Guido "contestar solo" no andaría nunca. Los otros dos: que la plataforma dispare `reflexion` con "reflexioná" (ADR-036,
  costo aceptado) y los tiempos del aviso sobre la carpeta de red real (medido solo en disco local, ADR-040).
- **Nada depende de la app de escritorio**: todo es hooks, Bash y el pedido de permiso de Claude Code. Lo que falta es medir, no
  rediseñar. **Destino: 3.1.1** (un minuto en VS Code: mirar `CLAUDE_CODE_ENTRYPOINT` en una sesión de la extensión; lo demás lo
  cuenta `medir`). **Toca**: consistencia.

### 7. Los manuales nombran las skills nuevas pero no explican las piezas
- **Evidencia**: `manuales/SCRIPTS.md` tiene `aviso-buzon` y no tiene `buzon.cjs` (9 verbos, el único script que escribe sin OK);
  `manuales/EQUIPADOR.md` §3 y la sección "instalar hooks por PC" del `SKILL.md` del Equipador siguen presentándolo como "el
  corrector de secretos", sin el aviso ni la regla; `SCRIPTS.md:158` dice "el home no tiene espacios" y el código usa una lista
  blanca de caracteres (ADR-039, 2).
- **Toca**: consistencia. **Destino: 3.1.1** (o el mismo commit de la nota, si entra sin apuro).

### 8. Dos "mesas" con el mismo nombre, y la ficha declara un buzón que el buzón no lee
- **Evidencia**: la skill dispara con "abrí una mesa con Y" (`kit/skills/buzon/SKILL.md:3`) y el molde ya tiene la mesa por git
  (`kit/molde/scripts/mesa.cjs`, que `/inicio` muestra en su paso 4). La línea "NO usar" de la skill manda a `encargo.cjs mensaje`,
  que solo juzga un mensaje que llegó: el que abre una mesa por git es `mesa.cjs nuevo`. Aparte, la ficha acepta
  `mesa.<alias>.transporte: buzon` (`kit/molde/hooks/lib/ficha.cjs:512`, `doctor.cjs:694`) y `buzon.cjs` no la lee: los agentes se
  declaran otra vez en la config de la PC.
- **Propuesta**: en la 3.1.1, corregir el puntero a `mesa.cjs` y que la skill diga en una línea cuándo va cada mesa (el otro lee
  el repo → git; no lo lee → buzón; diseño §6). Unir la ficha con el buzón, **en la 3.2 con el PO**, que es quien va a necesitarlo.
- **Toca**: consistencia · acordarse de menos.

### 9. Los otros cuatro del revisor frío: mismo destino
- 1 (home con espacios, `buzon.cjs:89`), 2 (cuenta con tilde o eñe, `dueno.cjs:93`), 5 (`"allow": []` al reinstalar sin config) y
  6 (la skill y el protocolo se contradicen sobre mandar código). Ninguno cambia mirado desde el sistema: en las PCs de hoy no
  hay espacios ni tildes en el home. **Destino: 3.1.1.** El 6 es el único que conviene arreglar primero: es la regla de salida
  del buzón dicha de dos maneras.

## Para la 3.2

### 10. `reflexion` depende de que alguien se acuerde de pedirla, y con el dueño ausente no cierra nada
- **Evidencia**: ADR-036 la deja aparte del `/cierre` (que está en 7.957 de 8.000 bytes) y con OK por ítem; el acta
  (`PRUEBA-reflexion.md`, "una tensión a mirar") anota que sin dueño las propuestas quedan esperando.
- **Mi lectura**: está bien decidido para hoy. Pero de "las cuatro cosas" cumple *consistencia* y solo a medias *acordarse de
  menos*: la pasada ya no se dicta, pero hay que acordarse de pedirla. Cuándo se ofrece sola y qué hace una sesión sin nadie es una
  decisión de diseño que se cruza con el PO. **Destino: 3.2.** No se toca ahora: ninguna fricción real lo pidió todavía.

## Lo que miré y está bien (sin acción)

- **Privacidad del buzón**: en lo nuevo (`kit/skills/buzon/`, `pc/buzon/`, el diseño, el spec, los ADR 037-040) no hay rutas,
  nombres de PCs ni de personas, ni contenido de mensajes; solo conteos y ejemplos inventados. La config vive en
  `~/.config/kit-buzon/`, fuera de todo repo.
- **La plomería de kit-owned está completa**: `preparar-pc.cjs`, `kit-sync.sh` (7 rutas), `lib/adoptar.cjs`, el menú con la marca
  🔑 y la prueba que exige la fila de cada skill. El Equipador dejó de listar los nombres tres veces.
- **Cada pieza trae su cicatriz**: `reflexion`, la prueba con y sin la skill (3 de 3 escribían sin preguntar); el buzón, lo medido
  en el v0 (turnos parados de 16 a 29 días con 21 sesiones abiertas). Ninguna entró "por las dudas".
- **Barreras editables con rastro**: `registrar --apagar` / `--prender`, `instalar-hooks-pc --quitar`, y el `doctor` avisa una
  regla `allow` de más. El descarte de cada alternativa está escrito en su ADR.
- **ADR-029**: una vuelta de red team por pieza y mutación solo donde hay un freno (36 y 55 mutantes). Proporcional.
- **Frenos del molde, director/obrero/tramo y la noche**: no cambian. Un obrero o una sesión de fondo ven el aviso pero no pueden
  contestar (`.kit-rol` y `sdk-cli` quedan afuera). El cierre de noche lee el `/cierre` por archivo en una sesión nueva: no vi
  camino para que `reflexion` se le cruce.
- **Lo que se aparta del spec sellado** (la disputa) está dicho en su Estado, en ADR-040 y en `PROTOCOLO-v1.md`.
- **Flota y actualizador**: el buzón es de la PC, no de los repos; a los proyectos les llega una sola línea del molde.

## ¿Versión final o le falta?

Final, con las tres condiciones. El argumento "opcional e inerte" vale para el buzón y no para la actualización de la PC: por eso
la condición 3 pide verlo andar una vez en una PC real. El riesgo que queda después del tag está acotado al que se registre, y
tiene corte (`--apagar`) y medición (`medir`). Lo que no haría es llamarlo "probado": la nota tiene que decir "en piloto".
