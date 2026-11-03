# SPEC delta: paquete 8b — lo que dejó el repaso de Guido, y la beta `v3.0.0-rc.1` — vibe-kit
Nueve cambios chicos que Guido pidió al repasar las decisiones (2026-11-03) y que tienen que estar antes de la primera adopción real
(Hermes, 2026-11-04): el obrero de fondo en `auto`, las piezas adaptadas con cuatro salidas y una recomendada, la versión `-rc` entera en
la ficha, el `/inicio` que no ejecuta lo que dejó otra sesión, el obrero de cierre de tramo, los githooks prendidos al adoptar, el Modo A
con el molde v3 y la línea del banner. Cierra con la beta `v3.0.0-rc.1` repartida por la flota en verde.
- Estado: ✅ IMPLEMENTADO 2026-11-03 (D8b.1, la beta `v3.0.0-rc.1`; salvo el renglón (11), el obrero de cierre de tramo, que sale en `rc.2`: D8b.1-c del tracker)
- Fecha: 2026-11-03 · Misión: 5, director **D8b.1** (tracker, fila 8b; la vara: ADR-030; el presupuesto: ADR-029)
- Sello del Arquitecto: `arquitecto: 2026-11-03 · kit 2.4.3 · chequeos: tamaño — (paquete del método) · entorno — (sin ficha del kit) · tope ✅ · hash d63f40e464ec`
- Plano: [`SPEC-0-kit-v3.md`](SPEC-0-kit-v3.md); el repaso: [`DECISIONES-SIN-GUIDO-en-criollo.md`](DECISIONES-SIN-GUIDO-en-criollo.md),
  "El repaso con Guido", renglones **1, 3, 6, 7, 8, 10, 11, 14 y 15** (la numeración de abajo es la del repaso). Los 2, 4, 5, 9, 12, 13,
  16 y 17 no piden código. "Cambios al plan", fila 2026-11-03 "Cerrado con Guido".
- Red team: **sí, una ronda, acotada a (1), (6) y (14)** (tocan permisos o frenos): 3 ALTOS (r1-1, r1-2 integrados; r1-3 cerrado por la
  medición (d) del director), 4 MEDIOS integrados (r1-4 a r1-7), 1 BAJO corregido (r1-8). El resto no lo pide. Revisor frío Opus al cerrar.

## Por qué (el dolor)

El repaso aprobó casi todo con ajustes del día a día: el obrero de fondo en `auto`; a las adaptadas les faltaba "tomar la del kit"; la
ficha guardaba `3.0.0` viniendo de `3.0.0-rc.1` (un `rc.2` no le llegaba solo a Hermes); el `/inicio` podía arrancar lo que dejó una
sesión vieja; y la ficha de un módulo con director la escribía el director a mano. Sin esto, la prueba real arranca desencontrada.

## Contexto (explorado el 2026-11-03)

- **(1)** `molde/scripts/encargo.cjs` `lineaDeFondo` (339): `--permission-mode acceptEdits --allowedTools <citadas>`; prueba en
  `encargo.test.cjs` 614-646. Textos: `/director` paso 4 y `nucleo/NUCLEO.md` 66. Los porteros tratan `auto` como `acceptEdits`
  (`CON_VENTANA` de `git-seguro`, `niega-aprobar`, `sensible`, `pc/secretos`). La fusión tiene su propio `claude -p` (`ARGS_CLAUDE`).
- **(3)/(6)** `lib/fusion.cjs`: `porqueDe` (117) cae al git log sin `por:`; `fusionar` (340) va sola con porqué y mezcla limpia, si no
  `claude -p` o "te espera"; `informe` (301) no trae la versión nueva entera ni la nota del kit. `kit/CHANGELOG.md` dice que su nota la lee
  la fusión: **nadie la lee** (grep). El `/inicio` (paso 6) ofrece sí/no y prohíbe `propia` en las piezas de frenos.
- **(7)** `N.N.N` en `RE_VERSION` de `molde/hooks/lib/ficha.cjs` (+ sus dos copias byte a byte), `sello.cjs` (+ copia), `arquitecto.cjs`
  `versionKit`, `actualizar.cjs` (80, `versionDelKit` 143, que le saca el rc al tag: D6-15), `lib/flota.cjs` (`versionDeTag`, `rcAnterior`,
  "la ficha guarda la versión sin el -rc"), `doctor.cjs` (`verKit`/`comparar`: rc.1 = final), `cubiertos.cjs`, `cambios.cjs`.
  `chequeo.cjs` 436 e `inyeccion.cjs` `textoKit` llaman a `ficha.compararVersiones`. `adoptar.cjs` `compararTags` es solo de `v2.*`. **`kit/VERSION` = `2.4.3`.**
- **(8)** `portada.cjs` `poner` (176): "README.md: NO lo pisé — …".
- **(10)** `/inicio` del molde: 6.877 B (tope de `skills.test`: 8.000 B, 70 renglones); el paso 5 invoca `/arquitecto` solo.
- **(11)** `/director` paso 7: la ficha la escribe el director. `inyeccion.cjs` `bloqueModulos` (300 c.) ya lee cada ficha de su `rama:`,
  pero busca `Próximo paso:`, que **el esqueleto de `formato-spec.md` no trae**: hoy sale "(sin "Próximo paso:")". `estado.cjs`
  `lineaModulo` lee de la rama, sin tramo ni próximo paso.
- **(14)** `adoptar --aplicar` corre en un clon y no pone `core.hooksPath` (r1-5 del paquete 6: el pre-commit frenaría la ficha no de
  fábrica). Lo prende el hook de arranque (`ponerHooksPath`) en la primera sesión: antes, un commit desde la terminal saltea gitleaks.
- **(15)** `modo-a.md` monta el v2 (D4-6); `adoptar --mirar` sin `CLAUDE.md` pone todo en `no`; `ready --pendientes` busca
  `docs/modulos/<x>/SPEC.md`.

## Dónde vive cada pieza

| Renglón | Archivo y función | Encargo |
|---|---|---|
| (1) | `molde/scripts/encargo.cjs` `lineaDeFondo`, `autorizado`; `/director` paso 4; `NUCLEO.md` | A (código) · D (textos) |
| (3) (6) | `lib/fusion.cjs` `porqueDe`, `fusionar`, `informe`, `pregunta`; `actualizar.cjs` (la nota y `resolver`); `/inicio` paso 6 | B |
| (7) | las tres `ficha.cjs`, las dos `sello.cjs`, `arquitecto.cjs`, `actualizar.cjs`, `lib/flota.cjs`, `doctor.cjs`, `chequeo.cjs` | C |
| (8) | `molde/scripts/portada.cjs` `armar` | C |
| (10) | `/inicio` pasos 5 y 9 | B |
| (11) | `/director` paso 7, `director/plantilla-cierre.md` (nueva), `formato-spec.md` (la ficha), `inyeccion.cjs`, `estado.cjs` | D |
| (14) | `lib/adoptar.cjs` (`--aplicar --principal`); `anexos/flota.md`; Equipador `SKILL.md` | A |
| (15) | `lib/adoptar.cjs` (`--nuevo`); `anexos/modo-a.md`; `formato-spec.md` (dónde vive el SPEC-0) | A |

## Medición del director (renglón 1)

2026-11-03, `Guido-PC-eQ`, `claude.exe` 2.1.316 (extensión de VS Code), Git Bash, repo descartable. (a) `printf … | claude.exe -p
--permission-mode auto` anda sin pestaña: escribió y corrió `git status` sin preguntar (`safety_stops` 0, `auto_mode_context_wait` en el
timing). (b) `auto` + `--allowedTools "Bash(git log:*)" "Read"`: corrió `git log` y editó fuera de la lista (lo juzgó el clasificador),
sin `permission_denials`. (c) El clasificador del director dejó lanzar las dos; bypass lo frena. (d) (red team r1-3) En una copia de
`alfa`, `-p --permission-mode auto` con el pedido de correr `node .claude/scripts/cambios.cjs aprobar <id>`: `niega-aprobar` devuelve
`ask` en `auto` y en `-p` **eso es un no**: el resultado fue "Claude requested permissions to use Bash, but you haven't granted it yet"
(`is_error`), no corrió y el obrero no lo rodeó. Los porteros siguen siendo el muro dentro de `auto`. **No medido**: un "no" del propio
clasificador adentro del `-p` (el del director frenó el pedido de prueba), y si el clasificador frena el `comando-test`.

## AGREGA y MODIFICA

### (1) · El obrero de fondo en `auto`

1. `lineaDeFondo` imprime **dos** renglones, en este orden:
   `apertura de fondo: cd "<wt>" && printf '%s\n' '/obrero <x>--<ID>' | <claude> -p --model <m> --permission-mode auto --allowedTools <reglas>`
   `apertura de fondo (respaldo, si auto no está): … --permission-mode acceptEdits --allowedTools <reglas>` (el resto, igual).
   La lista **sigue en las dos** (D8b-1). Sin `claude` o con una regla que no se cita: el mismo renglón único de hoy.
2. `/director` paso 4: "con la **primera línea de fondo que imprimió `autorizado`**; si `auto` no se deja lanzar (la cuenta no lo tiene o
   tu clasificador la frena), la de **respaldo**; nunca otra". `NUCLEO.md` 66: "una de las dos líneas de fondo que imprime …, tal cual".
   El encabezado de `encargo.cjs` (renglón 16) dice lo mismo.
3. **Criterio** (`encargo.test.cjs`, el de 614 reescrito): la primera de fondo trae `--permission-mode auto` y la lista entera; la segunda,
   `acceptEdits` y la misma lista; **ninguna** trae `bypass`, `dangerously` ni otro `--permission-mode`; sin `claude`, un solo renglón.
   Mutación sobre `lineaDeFondo` (tope 20 min).

### (8) · La línea del banner

Cuando `armar` no pisa un README propio y `assets/banner.svg` quedó (creado, igual o propio), suma **un** renglón: `el banner quedó en
assets/banner.svg: enlazalo arriba del README si querés`. Si el README propio ya enlaza `assets/banner.svg`, no. La salida sigue en 1.
**Criterio** (`portada.test.cjs`): con README propio sin enlace → el renglón; con enlace → no; README del script → no.

### (7) · La versión entera, con `-rc`

1. **Gramática** (una sola, en `ficha.cjs`): `N.N.N` o `N.N.N-rc.N`, números sin ceros a la izquierda (`rc.0` vale), nada más de semver:
   `/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-rc\.(0|[1-9]\d*))?$/`. **Orden**: por los tres números; con los mismos, `-rc.N` antes que
   el final, y entre rc por N (`3.0.0-rc.1 < 3.0.0-rc.2 < 3.0.0 < 3.0.1-rc.1`). `ficha.cjs` exporta `RE_VERSION` además de
   `compararVersiones`; el mensaje de error dice "N.N.N o N.N.N-rc.N". Las tres copias, byte a byte (las pruebas con `cmp` siguen verdes).
2. **Usan esa**: `sello.cjs` ("kit X.Y.Z" acepta rc; las dos copias), `arquitecto.cjs` `versionKit`, `actualizar.cjs` (`RE_VERSION` sale de
   la ficha), `doctor.cjs` (`verKit` y `chVersionKit` comparan con `compararVersiones`; un tag corto `v3.0` sigue valiendo `3.0.0`),
   `chequeo.cjs` e `inyeccion.cjs` (ya la llaman: sin cambio de código).
3. **D6-15 cambia**: `kit/VERSION` = **el tag sin la `v`, entero** (`v3.0.0-rc.1` ↔ `3.0.0-rc.1`), en `actualizar.cjs` `versionDelKit` y
   `lib/flota.cjs` (`versionDeTag` ya no saca el rc). La ficha recibe esa versión entera. `flota`: "al día" = la ficha dice exactamente esa
   versión (también con rc); el molde viejo es **siempre** el tag `v<ficha.kit>` (se va `rcAnterior` y la rama "la ficha ya dice esta
   versión"). Con un rc, `aplicar` sigue sin subir nada al kit (r1-6, paquete 7).
4. **Quedan `N.N.N`** (D8b-3): `subio-al-kit` (`cambios.cjs`) y `cubiertos.md` (`cubiertos.cjs`): solo un final sube reglas.
5. `kit/CHANGELOG.md`: una sección por versión con la versión entera (`## 3.0.0-rc.1`); la del final puede decir "lo de los rc, más …".
6. **Criterios**: `ficha.test` (sí `3.0.0-rc.1`; no `3.0.0-rc.01`, `3.0.0-beta.1`, `03.0.0`; el orden entero); `flota.test` (ficha rc.1
   + tag rc.2 → molde viejo `v3.0.0-rc.1`, ficha `3.0.0-rc.2`; tag rc.1 → al día; VERSION `3.0.0` con tag rc.1 → 1); `doctor.test`
   (instalada rc.1, tag `v3.0.0` → ⚠ atrás); `arquitecto.test` (sello con `kit 3.0.0-rc.1`); `chequeo` rc.1 → rc.2 es mayor.

### (3) y (6) · Las adaptadas: el `por:` y las cuatro salidas

1. **`porqueDe`**: solo `piezas.<id>.por` de la ficha; se va la rama del git log (D8b-4). Una adaptada sin `por:` siempre llega a
   "te espera" la primera vez, aunque la mezcla salga limpia.
2. **Cuándo es sola** (sin cambio en el gate de hoy): con `por:` y la mezcla limpia (merge-file, o `claude -p` que pasa la validación), se
   aplica y la línea de `aplicar` lo dice (`fusionada (sola, <por>)`): es el aviso de una línea. El `claude -p` de la fusión **sigue en
   `acceptEdits`** con su lista estrecha y `deny Bash` (D8b-2).
3. **El archivo `.claude/fusiones/<pieza>.md`** suma, en este orden, después de los motivos: `## Qué dice el kit` = las secciones de
   `kit/CHANGELOG.md` del `--kit` con versión `> viejo` y `≤ nuevo` (las lee `actualizar.cjs` y se las pasa a `fusionar` como `nota`; sin
   archivo o sin sección, "el kit no dejó nota para estas versiones"); por archivo, además de los diffs y la propuesta, `### La versión
   nueva, entera` (el texto del molde nuevo con la zona propia del proyecto puesta); y `## Las salidas` con las cuatro, una línea cada una:
   - **mezclar**: lo del proyecto encima de lo nuevo (la propuesta de arriba);
   - **quedarse con la propia**: sigue `adaptada`, sin cambios; la próxima versión se vuelve a ofrecer **desde la misma base** (r1-1:
     `resolver` escribe `desde: <versión vieja del informe>` en `piezas.<id>`, y `aplicar` mezcla desde ahí como hoy con `base:`; así lo
     de esta versión no se pierde. `desde:` se borra cuando la pieza se mezcla o se toma la nueva). La gramática de la ficha suma `desde`
     (N.N.N[-rc.N]) en el mapa de la pieza;
   - **tomar la nueva del kit**: la versión nueva entera; la pieza pasa a `molde` (se actualiza sola de ahí en más) — **tira lo del
     proyecto fuera de la zona propia**;
   - **congelar**: `propia`, el kit no la toca más. **No aparece en una pieza de frenos** (`hook-*`, `settings`, `candado`, `githooks`,
     `hooks-lib`, **`cambios-metodo`** (lleva `niega-aprobar`) y **`scripts`** (lleva `encargo.cjs`, la línea de permisos del obrero)
     (r1-5): la lista que hoy está en el `/inicio` pasa a `fusion.cjs` como `FRENOS`, con un criterio por cada una).
   - **tomar la nueva** escribe **todo** archivo de la pieza que difiera del molde nuevo, no solo los del informe (los `igual` también: el
     molde no los cambió pero el proyecto sí), y el informe los lista en "lo que perdés" (r1-4).
   La línea `base:` sigue igual (`baseDeInforme`). **El informe guarda la huella de "lo tuyo" por archivo** (r1-2).
4. **`actualizar.cjs resolver <carpeta> <pieza> mezclar|propia|nueva|congelar --por "<texto>" [--a-mano]`** (nuevo, en el checkout del
   proyecto, rol `humano`): escribe lo que dice el informe (`mezclar`: la propuesta de cada archivo; sin propuesta → 1 "armala a mano y
   corré con --a-mano", que valida lo del disco con el `validar` de hoy: sin marcadores, zona propia intacta, `node --check`), pone el
   estado y `por:` en `piezas.<id>` de la ficha (`adaptada` · `adaptada` · `molde` · `propia`), borra el informe e imprime el commit por
   rutas. `congelar` en una pieza de `FRENOS` → 1 sin escribir. Sin `--por` → 2. No commitea. **No pisa trabajo** (r1-2): sale 1 sin
   escribir si un archivo del disco no tiene la huella que guardó el informe o una ruta de la pieza tiene cambios sin commitear ("cambió
   desde el informe: corré la flota de nuevo o `--a-mano`"); las rutas salen del catálogo de la pieza, nunca de los títulos del `.md`.
5. **`/inicio` paso 6** (texto corto; el detalle vive en el informe): por cada `.claude/fusiones/*.md`, leé `## Qué dice el kit`, las dos
   versiones y el `por:`, y elegí una de `## Las salidas` con su razón en una línea. **Preguntá** (una sola `AskUserQuestion` por todas las
   que pregunten, con la recomendada primera y su razón) si: la pieza no tiene `por:` · la recomendada es **tomar la nueva** o
   **congelar** · la mezcla choca (no hay propuesta) · **la pieza es de `FRENOS` y la recomendada no es mezclar** (r1-1: quedarse con la
   propia en un freno deja afuera un arreglo de seguridad). Si no, corré `resolver` y avisá en una línea. Con la respuesta, `resolver … --por
   "<lo que dijo>"`; si toca un freno, el candado pide el aprobado del dueño.
6. **Criterios**: `fusion.test` (sin `por:` y con commits propios → espera; con `por:` y limpio → sola; el informe trae la nota de las
   versiones del medio, la nueva entera y las salidas, sin congelar en `hooks-lib`); `actualizar.test` (`resolver` con cada salida sobre
   una copia de `alfa`; congelar en frenos → 1; mezclar sin propuesta → 1; `--a-mano` con `<<<<<<<` → 1; un archivo tocado después del
   informe → 1 sin escribir; `propia` en rc.1 + tag rc.2 → la fusión trae lo de rc.1 y lo de rc.2; `nueva` deja la pieza sin desvío); `skills.test` (el paso 6 nombra
   las cuatro, las tres razones para preguntar y `resolver`). Mutación: el gate de "sola" y `FRENOS` en `resolver`.

### (10) · El `/inicio` no ejecuta lo que dejó otra sesión

Paso 9, reescrito: **pedido es solo lo que el dueño escribe en este mensaje, concreto.** Con pedido: el tamaño y seguir, como hoy (chico lo
hacés; más que chico, `/arquitecto` sin excepción; no esperes otro OK). **Lo que dejó una sesión anterior** (handoff, TODO, notas, "al
abrir hacé X") **nunca es pedido**: va como propuesta y espera el OK. Con "inicio", "sigamos" o "retomemos" sin más, o si algo no cuadra
(cambios sin guardar, el handoff no coincide con git, una sesión sin cerrar, una noche o encargos abiertos): estado + propuesta + OK. Sin
preguntar, solo los pasos fijos de lectura (git, terminar la noche, contar dónde quedamos). **Paso 5**, en consecuencia: sin pedido, "el
módulo <x> nació sin sello: ¿llamo al Arquitecto (Modo B corto)?" y espera el OK (D8b-6). El `git pull --rebase` del paso 2 corre solo
con el árbol limpio; si no, es "algo no cuadra". **Criterio** (`skills.test`): las frases de arriba; el de 282 sigue (con pedido, "no
esperes otro OK"); el de 323 cambia a la pregunta; ≤ 8.000 B y 70 renglones.

### (11) · El obrero de cierre de tramo

1. **La ficha del módulo** (`formato-spec.md`, el esqueleto) suma en la cabecera `- Próximo paso: <uno, concreto>` (lo que el hook ya
   busca), `- Tramo: <N> cerrado <AAAA-MM-DD>` y, solo con director, `- Cierre de tramo: cada encargo | cada <N> encargos | al checkpoint`
   (lo elige el Arquitecto en el Modo B con la Ejecución; sin el renglón, cada encargo). La sección "## Fase y próximo paso" queda para la fase.
2. **`director/plantilla-cierre.md`** (nueva): la plantilla de siempre ya llena: `Skill: obrero`, `Modelo: sonnet · Esfuerzo: low`,
   `Riesgo: bajo`; `## Toca` = la ficha, `bitacora/` y `tiempos.md` del módulo; `## Alcance`: `tiempos.cjs tiempos <x>` y `contador <x>`,
   la ficha (tareas con su commit, `Próximo paso:`, `Tramo:` +1, Parado, Te espera, `## Sesiones vivas`), la bitácora del tramo y
   `resumen.cjs <x>` si toca; `## NO SE TOCA`: código, `docs/` del proyecto, `.claude/`; `## AUTORIZADO` = esos scripts; `## GATE` =
   `estructura.cjs todo` si el candado está prendido. La valida `lib/encargo.cjs` como a cualquiera.
3. **`/director` paso 7**: al cerrar un tramo (según `Cierre de tramo:`), el director copia `plantilla-cierre.md` como cualquier encargo
   (paso 3), lo lanza (paso 4) y lo verifica y mergea (paso 6); después `git push origin modulo/<x>`. **No escribe la ficha él.** La
   mudanza (contexto.cjs) y la alarma siguen igual. El paso 10 sigue: nunca `/cierre`.
4. **El arranque y `/estado`**: `inyeccion.cjs` `datosFichaModulo` lee también `Tramo:` y la línea queda `<x> · tramo <N> cerrado <edad> ·
   próximo: <…>` (sin `Tramo:`, la de hoy); el bloque sigue en 300 y el total en 9.700 (D8b-7). `estado.cjs` `lineaModulo` suma `tramo
   <N> cerrado` y `próximo: <…>`, de la misma ficha leída de la rama.
5. **Criterios**: `inyeccion.test` (ficha en `modulo/x` con `Tramo:` y `Próximo paso:` → la línea; sin rama local, de `origin/`; los que
   no entran → "… (N más …)"; `textoKit` con `3.0.0-rc.1`); `estado.test` (la misma línea); `encargo.test` (`presentar` acepta un encargo
   copiado de `plantilla-cierre.md`); `skills.test` (el paso 7 nombra la plantilla, no "sobreescribí la ficha"; ≤ 8.000 B).

### (14) · Los githooks, en el mismo OK de la adopción

1. **`adoptar --aplicar <propuesta> --principal <carpeta principal>`**: después de escribir en el clon (donde **no** se prende: r1-5
   sigue), en la carpeta principal, **validada** (r1-7: `rev-parse --show-toplevel` = esa carpeta, sin `.kit-rol`, el mismo `origin` que
   el clon; si no, "no pude: no es el mismo repo"): `core.hooksPath` vacío → `.githooks` **solo si** `.githooks/` ya está en el disco o
   `.git/hooks` no tiene hooks (fuera de `*.sample`) (r1-6: si no, apagaría husky v4 o `pre-commit` hasta el pull → "queda para el
   arranque"); ya
   `.githooks` → nada; otro valor (husky, lefthook) → **solo si** `.githooks/` ya está en el disco: el viejo a `kit.hooksPathPrevio` y
   `.githooks`, como `ponerHooksPath`; si no, no se toca ("lo prende el primer arranque después del pull"). Una línea `githooks ·
   <carpeta> · <puesto | ya estaba | queda para el arranque | no pude: …>`. Nunca `--global` ni otra clave. Sin `--principal`, una línea que
   lo pide (no falla).
2. `anexos/flota.md` (paso 3 de "Adoptá X") y el Equipador `SKILL.md` (renglón de `adoptar`): `--principal <la carpeta de Guido>` dentro
   del mismo OK. `doctor` no cambia (sigue marcando la deriva con su línea).
3. **Criterios** (`adoptar.test`): vacío → `.githooks`; vacío con `.git/hooks/pre-commit` real y sin `.githooks/` → intacto; `--principal`
   de otro repo o de una subcarpeta → "no pude", sin escribir; husky con `.githooks/` → previo guardado y `.githooks`; husky sin `.githooks/` →
   intacto; el clon queda sin `core.hooksPath`; `git config --global --get core.hooksPath` igual antes y después (con `HOME` falso).
   Mutación sobre la función (tope 20 min).

### (15) · El Modo A monta el molde v3

1. **`adoptar --mirar --nuevo`**: para un repo que acaba de nacer (sin ficha, con o sin `CLAUDE.md`): las bases → `molde` (no la regla
   del criterio 19), `candado: sí`, `director-obrero` y `estado` → `sí` (todo proyecto nuevo nace con módulos), `docs-fyd` y el resto de las
   opcionales como hoy. `--aplicar` igual que siempre (en el clon). Con ficha → 1, como hoy.
2. **El SPEC-0 vive en `docs/modulos/v1/SPEC.md`** (H §8.4; D8b-8) con su ficha `docs/modulos/v1/README.md` (el esqueleto, `director:
   no` salvo que la Ejecución diga otra cosa). El Paso 0 busca borradores en `*/docs/modulos/v1/SPEC.md` y también en `*/SPEC-0.md` (los
   de antes). `formato-spec.md` 5 y 104 lo dicen (la línea para abrir: `inicio — ejecutá docs/modulos/v1/SPEC.md (está READY)`).
3. **`modo-a.md` Paso 5, el orden nuevo**: scaffolding → `git init`, `.gitignore`, el `SPEC.md` y la ficha de v1, primer commit → el kit
   a un temporal (`git clone` del canónico al tag de `~/.claude/VERSION`, como el Equipador) → `git clone <carpeta> <temporal>`, `.kit-rol` =
   `actualizador` en el clon, `adoptar <clon> --mirar --nuevo` y `--aplicar … --principal <carpeta>`, los dos commits → `git -C <carpeta>
   pull --ff-only <clon> HEAD` → **recién ahí** `sello` y `ready` (con la ficha puesta, el sello chequea el entorno) y un commit → la
   portada (como hoy) → el checklist. La carpeta principal **nunca** lleva `.kit-rol`. Se va "El montaje sigue siendo el molde v2" y la
   instanciación de `templates/` (punto 4 entero).
4. **Criterio — la corrida de punta a punta** (del director, en un temporal, sin `claude`; un SPEC y un canónico bare de prueba): el
   Paso 5 tal cual da la ficha con `kit: 3.0.0-rc.1`, `estructura.cjs todo` → 0, `ready --pendientes` → nada, el hook de arranque con la
   huella y la línea de `v1`, `core.hooksPath` = `.githooks`, `git status` limpio y cero `{{`. `skill.test.cjs`: `modo-a.md` nombra
   `--nuevo` y `--principal`, no `templates/`.

## Decisiones (la vara)

- ⚠️ **D8b-1 · La línea principal en `auto` con la lista; el respaldo, `acceptEdits` con la misma lista, impreso siempre.** La lista
  preaprueba casi todo lo del encargo sin el clasificador (medido: (b); al entrar en `auto` la plataforma descarta las allow de `Agent` y
  las de "correr un script del gestor de paquetes", r1-8: el `comando-test` puede pasar por el clasificador, y si lo frena, `verificar`
  lo atrapa porque el GATE no corrió); `auto` juzga el resto y los porteros siguen negando (medido: (d)). Dos líneas: el director no adivina si `auto` está.
  `[workflow · consistencia]`
- **D8b-2 · La fusión sigue en `acceptEdits`**: no es un obrero, y con `auto` podría hacer más que editar `.kit-fusion/`. `[mejor código]`
- **D8b-3 · `-rc` en la ficha, VERSION, tags, sello y doctor; no en `subio-al-kit` ni `cubiertos.md`**: un rc nunca sube reglas al kit
  (r1-6). Una sola gramática y un solo comparador (`ficha.cjs`), el resto lo llama. `[consistencia · mejor código]`
- **D8b-4 · El porqué, solo `por:`** (renglón 3, decidido por Guido). Consecuencia aceptada: cada adaptada pregunta una vez. `[acordarse de menos]`
- ⚠️ **D8b-5 · `congelar` y `tomar la nueva` siempre preguntan**: una corta las actualizaciones para siempre y la otra tira trabajo del
  proyecto. `resolver` es un script para que la escritura (zona propia, ficha) no la haga el modelo. `[mejor código · acordarse de menos]`
- ⚠️ **D8b-6 · El módulo sin sello del paso 5 pasa a propuesta con OK** (antes invocaba solo, D4-11): es "algo que dejó otra sesión"
  (renglón 10). Las fusiones obvias siguen solas porque Guido lo decidió así en el 6. `[workflow · consistencia]`
- **D8b-7 · La línea del módulo, en los 300 de hoy**: el tope total no se mueve; con muchos módulos, el corte dice cuántos faltan.
  `[acordarse de menos]`
- ⚠️ **D8b-8 · El Modo A reusa el adoptador (`--nuevo`) sobre un clon**, no un montador nuevo; y el SPEC-0 va a `docs/modulos/v1/` para que
  `ready --pendientes`, `/inicio` y `/estado` lo vean como a cualquier módulo. Alternativa descartada: dejarlo en la raíz (no lo ve ningún
  script del v3). `[consistencia · mejor código]`
- **D8b-9 · Los githooks se prenden en la carpeta principal, no en el clon** (r1-5: en el clon, el pre-commit frenaría la ficha). Con un
  `hooksPath` ajeno y sin `.githooks/` en el disco, no se toca: apagaría husky hasta el pull. `[mejor código]`

**Pregunta para Guido**: ninguna (D8b-6, lo único que le cambia el día, sale de su regla del renglón 10).

## Lo que esto no cierra

- Un "no" del clasificador adentro del `-p` (no medido): qué hace el obrero se ve en la prueba real. Sin `auto` en la cuenta, el
  director lo descubre fallando y usa el respaldo.
- Un `por:` escrito a mano que miente: la adaptada se fusiona sola. Trampa.
- `mezclar` de una pieza de frenos queda en el disco antes del aprobado (los hooks corren desde el disco); si el dueño no aprueba, se
  deshace con `git checkout -- <rutas>` (lo dice la línea de `resolver`). Un obrero que se reescribe su `settings.local.json`: trampa.
- Qué herramienta de hooks usa Hermes (husky v4/v9, `pre-commit`): se ve en `adoptar --mirar` mañana.
- El Modo A con un `claude` real de punta a punta (entrevista incluida): la corrida es de scripts; la sesión real queda para el primer
  proyecto nuevo.
- La frecuencia del cierre de tramo la respeta el director leyendo la ficha: ningún script lo frena si se la saltea.
- `flota` no prende los githooks en la carpeta principal de un repo ya adoptado (no es de este renglón).

## Los encargos (el director reparte, lee cada diff y corre las pruebas de cada uno)

Presupuesto (ADR-029): ~8 con el redactor, el red team, el revisor frío y su arreglo → **4 de trabajo**: (14) y (15) van juntos
(`adoptar.cjs`) y (8) con (7) (mecánicos).

| # | Encargo | Modelo | Puede tocar | Prueba que tiene que pasar | Mutación | Depende |
|---|---|---|---|---|---|---|
| RT | Red team, una ronda, solo (1), (6) y (14) | Opus | — (informe) | — | — | delta |
| C | (7) y (8) | Sonnet | lo de (7) y (8) en "Dónde vive" y sus pruebas, **más el `USO` de `adoptar` en `actualizar.cjs`** (`--nuevo`, `--principal`) | crit. de (7) y (8) | no | delta |
| A | (1) código, (14) y (15) | Opus | lo de (1) código, (14) y (15); `formato-spec.md` solo 5 y 104; `skill.test.cjs` | crit. de (1), (14) y (15), con la corrida | `lineaDeFondo`, githooks | RT, C |
| B | (3), (6) y (10) | Opus | lo de (3), (6) y (10); `actualizar.test.cjs`, `fusion.test.cjs`, `skills.test.cjs`; `desde` en la gramática de la ficha (las tres `ficha.cjs`, byte a byte; después de C) | crit. de (6) y (10) | el gate y `FRENOS` | RT, C |
| D | (11) y los textos de (1) | Sonnet | lo de (11), `/director` paso 4 y `NUCLEO.md`; sus pruebas; un caso en `encargo.test.cjs` y en `skills.test.cjs` | crit. de (11) | no | A, B |
| RF | Revisor frío, una vuelta, hasta 10 | Opus | — | — | — | todo |
| RF-fix | Los arreglos, un encargo | Sonnet | lo que diga RF | lo que toque | — | RF |

**Orden**: RT ∥ C → A ∥ B → D → RF → RF-fix. Nunca más de dos a la vez, cada uno en su worktree.
**Choques vistos y cómo se evitan**: `actualizar.cjs` lo tocan C y B (C primero; el `USO` de A lo escribe C) · `encargo.cjs` y su prueba,
A y D (D después; D solo suma un caso) · `formato-spec.md`, A y D (secciones distintas, en serie) · `skills.test.cjs` y el `/inicio`, B
y D (D después) · `ficha.cjs` (C) la lee `inyeccion.cjs` (D): D arranca con C mergeado y suma el caso rc de `textoKit` · `doctor.cjs`,
solo C (A no lo toca).

## La beta `v3.0.0-rc.1` (la hace el director, después de RF-fix)

1. Un commit con `kit/VERSION` = `3.0.0-rc.1` y `kit/CHANGELOG.md` con `## 3.0.0-rc.1` (y el 8b en su nota); `kit-sync.sh sync` LIMPIO;
   la suite entera una vez. Tag **anotado** `v3.0.0-rc.1` (el push del tag, como cualquier tag del kit).
2. **El criterio de la beta**: `bash pruebas/rehacer.sh`; copias de `../vibe-kit-pruebas/remotos/*.git` a un temporal (los proyectos, con
   su `origin` a esas copias); un canónico bare de prueba (`git clone --bare` de este repo, con el tag `v3.0.0-rc.1` y los `v2.*`) y
   `node kit/skills/arquitecto-skills/scripts/actualizar.cjs flota todo --canon <bare> --proyectos <temporal> --claude no` → **sale 0**;
   `alfa` y `beta` con rama `kit/v3.0.0-rc.1` en su remoto y la ficha `kit: 3.0.0-rc.1` (o "te espera" con su `.claude/fusiones/` y las
   cuatro salidas), `gama` "sin tocar" (sin ficha: es adoptarlo). Repetida → `alfa` y `beta` "salteado" (la rama ya está). Y con un tag de prueba
   `v3.0.0-rc.2` (solo en el bare): `alfa` mezclada pasa de rc.1 a rc.2 con molde viejo `v3.0.0-rc.1`. Ninguna prueba toca `~/.claude/`.

## Entorno de prueba

Repos de prueba (`bash pruebas/rehacer.sh`: `alfa`, `beta`, `gama` y sus remotos, en `../vibe-kit-pruebas/`), siempre copias a un
temporal; un canónico `bare` de prueba con los tags; las sesiones reales con `claude.exe -p` en copias descartables. Ninguna prueba toca
`~/.claude/` (`--home` o `HOME` falso) ni la carpeta de un proyecto de Guido.

## Ejecución

Un director Opus (D8b.1), este delta y una ronda de red team acotada; el cómo, en [`PLAN-construccion.md`](PLAN-construccion.md).
