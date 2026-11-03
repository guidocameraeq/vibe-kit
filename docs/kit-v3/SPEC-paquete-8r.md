# SPEC delta: paquete 8r — la tanda de correcciones de la revisión integral R1, y la beta `v3.0.0-rc.2` — vibe-kit
Todo lo que encontró la revisión integral de la `rc.1` (`REVISION-INTEGRAL-rc1.md`): los cuatro que traban el módulo con director en
Hermes (T1-T4), los ocho que le cambian algo a Guido, lo de taller y las dos preguntas con su opción A. Que las piezas interactúen bien
entre sí (ADR-034). Cierra con la beta `v3.0.0-rc.2`.
- Estado: READY
- Fecha: 2026-11-03 · Misión: 5, director **D8r.1** (tracker, "Después de la rc.1", fila 2b; la vara: ADR-030 y ADR-034; el presupuesto: ADR-029)
- Sello del Arquitecto: `arquitecto: 2026-11-03 · kit 3.0.0-rc.1 · chequeos: tamaño — (paquete del método) · entorno — (sin ficha del kit) · tope ✅ · hash b26e76092b13`
- Plano: [`SPEC-0-kit-v3.md`](SPEC-0-kit-v3.md); la fuente: [`REVISION-INTEGRAL-rc1.md`](REVISION-INTEGRAL-rc1.md) (las citas `R:<n>` de
  abajo son sus renglones). El obrero de cierre de tramo (renglón 11 del repaso) y los experimentos **no entran**: son la `rc.3` (D8c.1).
- Red team: **sí, una ronda** (toca frenos: el sello, `adoptar`, la mezcla, el `/inicio`): 2 ALTOS (rt-1 la tarea 0 solo en texto y con
  la ficha equivocada, rt-2 `cerrar` borraba de origin lo mezclado solo en esta PC), 6 MEDIOS (rt-3 a rt-8), 2 BAJOS (rt-9, rt-10); todos
  integrados abajo. Revisor frío Opus al cerrar, sobre el día de Guido.

## Por qué (el dolor)

Con la `rc.1`, adoptar Hermes anda pero el módulo con director no arranca: la adopción no trae `/director` (T1), la pestaña nueva no sabe
su rol (T2), el sello se niega con solo la base real (T3) y la guía manda a la instalación v2 (T4). Y Hermes quedaría salteado por la
flota para siempre (R:30): la `rc.2` no le llegaría. Guido, 2026-11-03 a la noche: "todos esos arreglos… tienen que estar resueltos
inclusive en la beta. Que todas las partes interactúen correctamente entre sí".

## Contexto (explorado el 2026-11-03, `Guido-PC-eQ`)

- **T1** `lib/adoptar.cjs` `mirar` (~411): las piezas `OPCIONAL` van en `no` salvo `--nuevo` (`NUEVO_SI`); `director-obrero` = skills
  director, obrero, tramo, nucleo y `agents/` (`catalogo.cjs:70`); `worktree.cjs` viaja con la pieza base `scripts`. `modo-b.md:54` mira
  solo el script.
- **T2** `worktree.cjs` `lineasApertura` (~455) y `encargo.cjs` `autorizado` (~388) imprimen cómo abrir la ventana, no qué escribir;
  `modo-b.md:64` y `formato-spec.md:104` dicen `inicio — ejecutá …`; el `/inicio` (7.610 B, tope de `skills.test` 8.000 B y 70 renglones)
  no lee `.kit-rol` salvo para `noche volvi` (paso 3). `rolDe`: `director` · `obrero` · `nocturno`.
- **T3** `arquitecto.cjs` `chequearEntornoFicha` (~236): `real` sin `dummy`/`prueba` es falla. `sello.cjs` `validar` (~161): con ficha,
  entorno `—` vale solo `— (quitado: …)`. `revisarSello` lo usan `ready`, `ready --pendientes` y `hooks/lib/encargo.cjs` (el obrero).
- **R:30** `flota.cjs:264`: cualquier `modulo/*` en el remoto saltea el repo. `worktree.cjs cerrar` (~814) borra solo la rama local
  (`cancelar` sí borra la de origin).
- **R:36/P2** `fusion.cjs fusionar` (~421): con conflictos, `conClaude` y, si valida, `resultado: 'claude'` (se aplica sola).
- **R:37** `adoptar.cjs` (~465): `CLAUDE.md: hay — no se toca`; `doctor.cjs:707` solo avisa.
- **R:39** `integrar` (~997) termina en `worktree integrar: módulo <x> en origin/<def> — merge <sha>`; el merge lleva el asunto
  `integrar: módulo <x>` (primer padre de la rama por defecto).
- `templates/universales/` del disco no lo lee ningún script para adoptar: el molde v2 sale de los tags `v2.*` (`moldeV2`).

## Pedido original, textual

> Hacés la tanda de correcciones de la revisión integral R1 […] Arreglás **todo** lo que dice: T1 a T4, cada uno con su arreglo
> recomendado. Los 8 de "Lo que te cambia algo", empezando por el 1 (Hermes salteado por la flota para siempre). Del 5 hacés solo la parte
> de `integrar` y del aviso del `/inicio`. El obrero de cierre de tramo no entra: queda para D8c.1. Todo lo de "De taller". Las 2
> preguntas, con su opción A. *(La sesión madre, en nombre de Guido, 2026-11-03.)*

## AGREGA y MODIFICA

Cada pieza con su criterio verificable (crit. `n`). "Una línea igual en todos lados" = el mismo texto en cada archivo que lo nombra.

### T1 · La adopción trae `/director` y `/obrero` (R:23)
`mirar`: con nivel `estandar` (un repo con código), `director-obrero` y `estado` en `sí` ("repo con código: el módulo con director
necesita /director y /obrero"), salvo que alguno de sus archivos ya esté y sea distinto del molde: entonces `propia`, con "⚠ <rutas> ya
está y es distinto: /director del kit no queda hasta resolverlo con Guido"; si lo distinto está **solo en `agents/`**, la línea nombra
esos agentes y propone renombrar los propios (rt-4). La regla va **después** del corte del criterio 19 (sin `CLAUDE.md` ni `--nuevo`, todo
en `no`). En `liviano`, como hoy (`no`). `modo-b.md` B4: "Director, solo si…" suma *y la ficha dice `piezas.director-obrero: sí` (o
`molde`)*: la ficha, no si existe el archivo (rt-4: un `/director` propio de Hermes no conoce `encargo.cjs`); si no, `módulo solo` y una
línea (cómo prenderla: `piezas.director-obrero: sí` y "poné al día X"). B5.4.3 chequea la ficha **y** el script.
- **crit. 1** (rt-8: los repos de prueba nacen con ficha y `adoptar` la niega): sobre un repo temporal con código (`package.json` con
  `scripts.test`) y `CLAUDE.md`, sin ficha → `director-obrero · sí` y `estado · sí`; el mismo con un `.claude/skills/director/SKILL.md`
  propio distinto → `propia`; con solo un `agents/<x>.md` propio distinto → `propia` y la línea nombra el agente; un temporal con solo
  `docs/` (`liviano`) → `no`. `--aplicar` del primero deja `.claude/skills/director/SKILL.md` del molde. `modo-b.md` nombra
  `piezas.director-obrero` en B4 y en B5.

### T2 · La pestaña nueva sabe su rol (R:24)
`lineasApertura` suma, último renglón, según `n.id` (no el rol, rt-5: `crear x --noche` es el director de noche): `primer mensaje:
/director` (sin ID) o `primer mensaje: /obrero <x>--<ID>`.
`autorizado`: la "apertura de Guido" termina en `→ primer mensaje: /obrero <x>--<ID>`. `modo-b.md:64` y `formato-spec.md:104`: con
director, el primer mensaje es `/director` (no `inicio — ejecutá`). El `/inicio`, **paso 0 nuevo**, solo si el rol y la rama coinciden
(rt-5): `.kit-rol` `director` o `nocturno` en una rama `modulo/<x>` (sin `--`) → invocá `/director`; `obrero` o `nocturno` en
`modulo/<x>--<ID>` → `/obrero <x>--<ID>`; en los dos, nada más (no medís el tamaño ni llamás al Arquitecto). Si no coinciden, una línea
("el `.kit-rol` dice <rol> y la rama es <r>: sigo como inicio normal") y el paso 1; sin `.kit-rol` u otro rol, el paso 1.
- **crit. 2**: `worktree crear <x>` y `crear <x> --noche` imprimen `primer mensaje: /director`; `crear <x>--01` imprime `primer mensaje: /obrero <x>--01`;
  `autorizado <x>--01` imprime `primer mensaje: /obrero <x>--01`. `skills.test` exige en el `/inicio` el paso 0 con `.kit-rol`,
  `/director`, `/obrero` y la rama, dentro del tope nuevo de 8.600 B y 70 renglones (rt-9); `modo-b.md` y `formato-spec.md` no dicen `inicio — ejecutá` en la
  línea del director.

### T3 · Pregunta 1, opción A: el sello acepta la tarea 0 (R:25, R:64-69) ⚠️
`sello.cjs` (y su copia byte a byte): `tareaCero(lineas)` → el primer renglón del cuerpo de `## Entorno de prueba`, fuera de bloques de
código, que casa con `/^(?:- )?(?:\*\*)?tarea 0(?:\*\*)?:/i` (rt-10), o `null`. `chequearEntornoFicha`: si la **única** falla de entornos
es "real sin dummy ni prueba", el spec trae la tarea 0, es **`módulo con director`** (rt-1: en un módulo solo nadie ordena los pasos; ahí
niega y dice "montá la base de prueba como módulo previo") y el `kit:` de la ficha es ≥ `3.0.0-rc.2` (rt-3: un proyecto con un molde viejo
no entiende ese sello; si no, "poné al día el proyecto (flota) antes de sellar con tarea 0") → `entorno — (tarea 0: montar el entorno de
prueba)` (las herramientas se siguen chequeando). `validar` con ficha acepta esa razón **solo si** el spec la trae (`revisarSello` calcula
`tareaCero` con el texto). `<arq> entorno` en rojo por eso lo dice. **El freno, en script** (rt-1): con ese sello en el spec del módulo,
`molde/scripts/encargo.cjs autorizado` (y `presentar`) **niega** todo encargo con ID distinto de `00` mientras la `.claude/kit.md` **de la
punta de `modulo/<x>`** (la del módulo; la vigente de `origin/<def>` no la ve hasta `integrar`) no tenga un entorno `dummy` o `prueba`:
"la tarea 0 (encargo 00) va primero: el entorno de prueba no está en la ficha de modulo/<x>". El encargo `00` es la tarea 0 y suma el
entorno a la ficha en `modulo/<x>`. `/director` paso 1 lo dice; `modo-b.md:42` y `formato-spec.md:117`: la forma del renglón y el `00`.
- **crit. 3**: ficha `kit: 3.0.0-rc.2` con solo `clase: real`: spec sin tarea 0 → `sello` niega como hoy; con director y `- **Tarea 0**:
  montar la base de prueba` (o `- Tarea 0: …` sin negrita) → sella con `entorno — (tarea 0: montar el entorno de prueba)` y `ready` pasa;
  módulo solo con tarea 0 → niega; ficha `kit: 3.0.0-rc.1` → niega con "poné al día"; un sello de tarea 0 con el renglón quitado y el hash
  rehecho → `sello inválido`. Con un `dummy`, `✅`. `autorizado <x>--02` con la tarea 0 pendiente → sale 1; `<x>--00` → 0; con el
  `prueba` en la ficha de `modulo/<x>` → `02` sale 0. `copias.test` verde.

### T4 · La guía y el manual dicen que "preparame esta PC" anda (R:26)
Fuera las advertencias de `GUIA-DE-USO.md` (123, 127, 133, 188, 194) y `EQUIPADOR.md:8-10`: anda desde la `rc.1` (el último tag).
- **crit. 4**: `grep -n "v2.4.3\|versión oficial\|cuando exista el tag" GUIA-DE-USO.md manuales/EQUIPADOR.md` no trae ninguna advertencia de
  que "preparame esta PC" o "actualizate" no anden.

### 1 · La flota no saltea para siempre (R:30-32)
`flota.cjs`: saltea solo las `modulo/*` del remoto **no mezcladas** en `origin/<def>` (`merge-base --is-ancestor`); las mezcladas no
cuentan. La línea `salteado` suma la salida (rt-7): "si la mezclaste con squash en GitHub, borrá la rama desde la web". `worktree.cjs
cerrar` (común, no `--cancelado`): después de la rama local, borra la de origin (`git push origin --delete <rama>`) **solo si** el `fetch`
de esta corrida anduvo **y** la punta de `origin/<rama>` es ancestro de **`origin/<madre>`** (rt-2: no de la local, que puede no estar
pusheada); si no, la deja con una línea: "la de origin queda: la flota la ignora cuando <madre> llegue a <def>" (o "no la borré: el fetch
falló").
- **crit. 5**: `flota` con `modulo/x` mezclada en `main` en el remoto → no "salteado"; con una sin mezclar → "salteado" como hoy.
  `cerrar x` con `origin/modulo/x` mezclada en `origin/main` → la borra de origin; adelantada (sin mezclar) → no; mezclada solo en la madre
  **local** (sin push) → no la borra de origin y lo dice; con el fetch fallado → no.

### 2 · Quién corre `aprobar`, dicho igual (R:33-35)
La línea, igual en `/cierre` (paso 4), `MOLDE.md` §7, `ROLES.md`, `SCRIPTS.md`, `GUIA-DE-USO.md` (95-97 y 187): *"`cambios aprobar` lo
corre la sesión cuando el dueño lo pide, y su clic en la ventana es la firma; nunca por su cuenta"*.
- **crit. 6**: `grep -rn "jamás lo corras" kit manuales GUIA-DE-USO.md` vacío; la línea está en los seis lugares.

### 3 · Pregunta 2, opción A: la mezcla que choca te pregunta (R:36, R:70-74) ⚠️
`fusionar`: con conflictos, el `claude` acotado (si está) **arma la propuesta y no se aplica**: `resultado: 'espera'`, motivo `la mezcla
chocó: la propuesta la armó claude, elegí vos`, y su texto validado va al informe como "La fusión propuesta" (así `resolver … mezclar` la
toma). Sin claude o si falla: motivo `la mezcla chocó (<por qué>)`, sin propuesta, como hoy. **Todo** motivo de una mezcla con conflicto
empieza con `la mezcla chocó` (rt-6): los `choque`, el "no pasó chequear (lo de claude…)" y el forzado de una pieza que ya esperaba
(`la mezcla chocó (todavía espera tu respuesta desde …)`); como claude ya nunca aplica, el forzado lo lanza igual y deja la propuesta
nueva. Desaparece `'claude'` de los resultados. El `/inicio` paso 6: **preguntá siempre** si el motivo empieza con `la mezcla chocó`. Los textos que dicen que la resuelve sola (SCRIPTS,
EQUIPADOR, la cabecera de `fusion.cjs`) cambian igual.
- **crit. 7**: `fusion.test`: con conflicto y un claude falso que resuelve bien → `espera`, motivo `la mezcla chocó: …`, el informe trae su
  propuesta y `leerInforme` la lee; `resolver … mezclar` la escribe; una segunda corrida con el informe pendiente → sigue `la mezcla
  chocó` y con propuesta. `grep -rn "fusionada (claude)" kit` vacío.

### 4 · El `CLAUDE.md` de Hermes, con tu OK (R:37-38)
`mirar`, con `CLAUDE.md`: si le falta la sección (la misma regla que `doctor.cjs:707`: `^#{1,6}[ \t]+El tamaño del pedido`) → `CLAUDE.md: le falta "El tamaño del pedido" — con tu OK, --aplicar …
--claude-md la suma al final (la del molde)`; si habla de un director u obrero propio (renglones con `director` u `obrero`, sin contar los
que ya nombran `/director` o `/obrero`; hasta 5 números y "…") → `CLAUDE.md: tiene su director/obrero propio (renglones <n…>): choca con /director — la sesión le
propone a Guido cambiarlo por un puntero a /director y /obrero (a mano, con su OK)`. `--aplicar --claude-md`: suma la sección del molde
en el primer commit (si ya está, una línea y nada). `flota.md` (la adopción): los dos cambios van en el mismo OK.
- **crit. 8**: `mirar` sobre un repo temporal sin ficha, con `CLAUDE.md` sin la sección y con "el director reparte" → las dos líneas; `--aplicar --claude-md` →
  el `CLAUDE.md` commiteado trae `## El tamaño del pedido` una vez; sin `--claude-md`, intacto.

### 5 · Después de integrar, los papeles (R:39-40; solo `integrar` y el aviso del `/inicio`)
`integrar`, al final: `después: /cierre en tu carpeta principal (los papeles de <def> quedaron atrás del módulo <x>)`. Nuevo
`worktree.cjs integrados`: los merges `integrar: módulo <x>` del primer padre de la rama por defecto local posteriores al último commit
que tocó `docs/SESSION_HANDOFF.md` → `módulo <x> integrado después del último handoff (@<sha7>): corré /cierre para poner los papeles al
día`; nada si no hay; sale 0. El `/inicio` paso 2, después del pull: corrélo; si imprime, va en Bloqueos con la propuesta de `/cierre`.
- **crit. 9**: `integrar` imprime la línea `después:`; `integrados` con un merge de módulo después del handoff → la línea; con el handoff
  commiteado después → nada; `skills.test` exige `integrados` en el `/inicio`.

### 6, 7, 8 · Los manuales y el consultorio (R:41-44)
`EQUIPADOR.md`: un párrafo con las cuatro salidas de una adaptada (mezclar · quedarse con la propia · tomar la nueva · congelar), qué
pierde cada una, que la mezcla que choca te pregunta, y que adoptar prende los githooks en tu carpeta (`--principal`).
`COMO-USAR-EL-ARQUITECTO.md`: el Modo A monta el molde v3 con `adoptar --nuevo` y el SPEC-0 vive en `docs/modulos/v1/SPEC.md`.
`consultorio.md:28`: ejecutar → `auto` (con `acceptEdits` de respaldo y el commit previo como red).
- **crit. 10**: `EQUIPADOR.md` nombra las cuatro salidas y `core.hooksPath`; `COMO-USAR-EL-ARQUITECTO.md` no dice "molde v2" para el Modo A
  y nombra `docs/modulos/v1/SPEC.md`; `consultorio.md` dice `auto` en "¿Autonomía?".

### De taller (R:46-60)
- **t1** (R:48): el `CLAUDE.md` del molde y el `/cierre` (paso de docs): *"si la sesión cambió cómo trabaja el proyecto (un freno, una
  regla, un paso de un ritual), lo anota: `node .claude/scripts/cambios.cjs nuevo …`"*.
- **t2** (R:50-52): la línea de `mirar` del registro propio deja el código interno y da la receta: `migrar-cambios.cjs --repo <clon>
  --plan`, después `--commit`, dentro del OK de la adopción; `flota.md` la suma como paso.
- **t3** (R:53): `/director` paso 3: la línea de fondo se corre con la herramienta Bash.
- **t4** (R:54): `flota.md` (adoptar): de dónde sale el clon y cómo vuelve (`--principal`), en dos renglones como `modo-a.md`.
- **t5** (R:55): `arquitecto/SKILL.md:37` y `modo-b.md` B5.6 apuntan a `adoptar`; `templates/universales/` a `legacy/` con lápida (los
  `adaptables/` se quedan).
- **t6** (R:56): `/obrero` y el `CLAUDE.md` del molde al día con `auto` y con el paso 9 del `/inicio` (nada de "la ventana en
  `acceptEdits`" ni "preguntás únicamente las 5").
- **t7** (R:57): el ruteo del Arquitecto busca borradores de Modo A también en `docs/modulos/v1/SPEC.md`; `flota.md:23` con las cuatro
  salidas; la línea del banner en `MOLDE.md`.
- **t8** (R:58): `SCRIPTS.md` y `MOLDE.md` con `resolver`, `--nuevo`, `--principal`, `--claude-md`, `integrados`, la versión con `-rc` y
  `desde:`; el `README.md` manda a "preparame esta PC", no a la instalación v2.
- **t9** (R:59-60): `flota todo` sin `--tag` manda el último tag (rc incluido) a todo proyecto con ficha: escrito en `flota.md`,
  `SCRIPTS.md` y en `docs/TODO.md`.
- **crit. 11**: `grep` de cada uno: `cambios.cjs nuevo` en el `CLAUDE.md` del molde y en el `/cierre`; `P6.8b, orden 7` fuera de
  `adoptar.cjs` y `migrar-cambios` en `flota.md`; "herramienta Bash" en `/director`; `templates/universales` ya no está en
  `kit/skills/arquitecto/` y sí en `legacy/`; `SPEC-0.md` del ruteo con `docs/modulos/v1/SPEC.md`; `resolver` y `--principal` en
  `SCRIPTS.md` y `MOLDE.md`; el README sin `INSTALAR.md` como camino principal.

## NO SE TOCA

- El obrero de cierre de tramo (renglón 11) y los experimentos: `rc.3`.
- La gramática de la ficha (`ficha.cjs` y sus copias): no cambia. `pc/lib/*.cjs` byte a byte con `molde/hooks/lib/`; `ficha.cjs` y
  `sello.cjs` del Arquitecto, byte a byte con las del molde.
- Los porteros (`git-seguro`, `niega-aprobar`, `sensible`, `secretos`) y el candado: no cambian lo que frenan.
- Los pasos 1, 3 (`noche volvi`), 7 y 9 del `/inicio`: se pueden acortar de prosa, sin cambiar su sentido (rt-9); el tope de
  `skills.test` para el `/inicio` pasa de 8.000 a 8.600 B (el de los demás, igual).
- `PLAYBOOK-MAESTRO.md`, las actas de `tips/`, las plantillas `_fuente/`.

## Entorno de prueba

Repos de prueba (`bash pruebas/rehacer.sh`: `alfa`, `beta`, `gama` y sus remotos en `../vibe-kit-pruebas/`), siempre copias a un
temporal; un canónico `bare` con `kit/VERSION` y tags anotados; `--claude no` o un claude falso. Ninguna prueba toca `~/.claude/`
(`--home` o `HOME` falso) ni una carpeta de proyecto de Guido.

## Criterios de aceptación

Los crit. 1 a 11 de arriba, y además:
- **crit. 12** (ADR-034): cada texto que nombra lo que cambió dice lo mismo (skills, molde, guía, manuales, `SCRIPTS.md`, `MOLDE.md`,
  README); `copias.test` y `lib.test` verdes.
- **crit. 13**: la suite entera verde (`node --test "kit/**/*.test.cjs"`); la flota con canónico `bare`, tag anotado `v3.0.0-rc.2` y
  `--claude no` sale 0, y un repo con `modulo/x` mezclada **no** sale "salteado".
- **crit. 14**: el revisor frío recorre el día de Guido (preparar la PC → `adoptar --mirar`/`--aplicar` → Modo B arma un módulo con
  director → la pestaña nueva arranca como director → un obrero → `integrar` → la flota con un rc nuevo no lo saltea) sin cortes.

## Decisiones (la vara)

- ⚠️ **D8r-1 · Pregunta 1, opción A, sin Guido** (la recomendada de R1): el sello acepta la tarea 0 con solo la base real. *Qué cambia en
  tu día*: si Hermes solo tiene la base de producción, el módulo arranca con un paso más (el primer obrero monta la base de prueba) y los
  obreros nunca prueban contra producción. `[workflow · mejor código · coherencia]`
- ⚠️ **D8r-2 · Pregunta 2, opción A, sin Guido** (lo que dijiste en el repaso): la mezcla que choca queda en "te espera" con la propuesta de
  claude armada, y el `/inicio` te pregunta. *Qué cambia en tu día*: una pregunta por skill adaptada que choque. `[workflow · coherencia]`
- **D8r-3 · `director-obrero` y `estado` en `sí` en `estandar`, no en `liviano`**: un repo sin código no arma módulos con obreros que
  codean. Si ya tiene su propia `skills/director/`, `propia` (no se pisa lo de Guido). `[workflow · acordarse de menos]`
- **D8r-4 · El rol lo decide el `/inicio` leyendo `.kit-rol`**, y además la línea de apertura dice el primer mensaje: lo que Guido pegue
  ("inicio" o "/director") arranca bien. `[acordarse de menos · coherencia]`
- **D8r-5 · El aviso de "integrado después del handoff" es un comando (`integrados`) que corre el `/inicio` después del pull**, no el hook:
  el merge llega con el pull del paso 2, después del hook. `[mejor código]`
- **D8r-6 · El director/obrero propio del `CLAUDE.md` lo cambia la sesión a mano con el OK**, no un script: es prosa de Hermes; el script
  solo lo encuentra y lo dice. La sección del tamaño sí la suma el script (`--claude-md`). `[mejor código · consistencia]`
- **D8r-7 · `cerrar` borra la rama de origin solo si está mezclada, y la flota saltea solo las no mezcladas**: las dos, porque una rama
  vieja que nadie cerró (otra PC, un módulo cancelado a mano) también trababa. `[acordarse de menos · mejor código]`
- **D8r-8 · Esta tanda es la `rc.2`; D8c.1 pasa a `rc.3`** (decisión de la sesión madre). `[workflow]`

## Lo que esto no cierra

- Un encargo `00` que no monta la base y suma un `dummy` falso a la ficha: trampa. La ficha de la punta de `modulo/<x>` la lee
  `autorizado`; `db-guardia` y el resto leen la vigente, que recién la ve con `integrar`.
- Un módulo mezclado con squash o rebase en GitHub: la flota lo saltea hasta que se borre la rama desde la web (lo dice la línea, rt-7);
  una `modulo/x` empujada sin commits propios cuenta como mezclada y la flota entra.
- Qué hay en `.claude/skills/`, `.claude/agents/` y el `CLAUDE.md` de Hermes: se ve en `adoptar --mirar` a la mañana.
- Un `CLAUDE.md` con "director" en otro sentido (un director de la empresa): la línea de `mirar` es una propuesta; Guido dice que no.
- El merge de un módulo hecho en GitHub (no con `integrar`): `integrados` no lo ve (busca el asunto `integrar: módulo`).
- Lo que se vea sobre el Hermes real (`adoptar --mirar` es lo primero de la mañana).

## Los encargos (el director reparte, lee cada diff y corre las pruebas de cada uno)

Presupuesto (ADR-029): 8 con el red team, el revisor frío y su arreglo → **5 de trabajo**, cada uno en su worktree
(`scratchpad/<x>/wt`), de a dos.

| # | Encargo | Modelo | Puede tocar | Prueba | Depende |
|---|---|---|---|---|---|
| RT | Red team, una ronda: T1, T3, 3, 4 y el paso 0 del `/inicio` | Opus | — | — | delta |
| A | T1, 1 (la flota), 4, t2 (la línea) | Opus | `lib/adoptar.cjs`, `lib/flota.cjs`, `actualizar.cjs` (`USO`, `--claude-md`), sus pruebas | crit. 1, 5 (flota), 8 | RT |
| B | T2 (scripts), T3 (con el freno de `autorizado`), 1 (`cerrar`), 5 | Opus | las dos `sello.cjs`, `arquitecto.cjs`, `worktree.cjs`, `molde/scripts/encargo.cjs`, `molde/hooks/lib/encargo.cjs`, sus pruebas | crit. 2 (scripts), 3, 5 (cerrar), 9 | RT |
| C | 3 (la mezcla) | Opus | `lib/fusion.cjs`, `actualizar.cjs` (solo lo de la fusión), sus pruebas | crit. 7 | A |
| D | Los textos del molde: T2 (`/inicio`), T3 y t3 (`/director`), 2 y t1 (`/cierre`), 3 y 5 (`/inicio`), t1 y t6 (`CLAUDE.md`), t6 (`/obrero`) | Opus | `kit/molde/skills/**`, `kit/molde/CLAUDE.md`, `skills.test.cjs` | crit. 2, 6, 9, 11 (molde) | B |
| E | Los textos del Arquitecto, el Equipador y la documentación: T1, T2, T3 (anexos), T4, 2, 4, 6-8, t2, t4, t5, t7-t9 | Sonnet | `kit/skills/arquitecto/**` (salvo scripts), `kit/skills/arquitecto-skills/SKILL.md`, `manuales/`, `GUIA-DE-USO.md`, `README.md`, `legacy/`, `skill.test.cjs` | crit. 4, 6, 10, 11 | A, B, C |
| RF | Revisor frío: el día de Guido sobre un repo de prueba | Opus | — | crit. 14 | todo |
| RF-fix | Los arreglos, un encargo | Opus | lo que diga RF | lo que toque | RF |

**Orden**: RT → A ∥ B → C ∥ D → E → RF → RF-fix. **Choques**: `actualizar.cjs` A y C (secciones distintas, en serie) · `worktree.cjs` y
`encargo.cjs` solo B · el `/inicio` solo D (con los nombres que fija este delta: `integrados`, `la mezcla chocó`, `primer mensaje:`).

## La beta `v3.0.0-rc.2` (la hace el director, después de RF-fix)

`kit/VERSION` = `3.0.0-rc.2` y `## 3.0.0-rc.2` en `kit/CHANGELOG.md` con la nota de migración; la suite entera, sola; después la flota con
un canónico `bare` (tag anotado `v3.0.0-rc.2`, `--claude no`) → sale 0 y `alfa`/`beta` pasan de rc.1 a rc.2. Si todo da verde: tag
anotado, push de `main` y del tag. Si no: no se taguea y se escribe qué falta.

## Ejecución

Un director Opus (D8r.1), este delta, una ronda de red team y un revisor frío; el cómo, en [`PLAN-construccion.md`](PLAN-construccion.md).
