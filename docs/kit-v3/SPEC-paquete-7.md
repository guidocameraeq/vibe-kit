# SPEC delta: paquete 7 — el ciclo del registro de cambios y la portada — vibe-kit
Lo que un proyecto aprende de su método vuelve al kit por un script, no por memoria: `cambios flota` cuenta qué regla se repite en la
flota, el `/inicio` de vibe-kit lista las urgentes, el actualizador retira lo que el kit ya cubre, y Hermes pasa su `CAMBIOS.md` de 230 KB a
archivos chicos con un comando. Y cada repo abre en GitHub con una portada que dice qué es en diez segundos.
- Estado: READY — lo escribe el director D7.1 sin Guido (provisorio, por la vara del ADR-030)
- Fecha: 2026-11-02 · Misión: 5, director **D7.1**, sin Guido (tracker, "Abrir D7.1 sin Guido"; la vara: ADR-030; el presupuesto: ADR-029)
- Sello del Arquitecto: `arquitecto: 2026-11-02 · kit 2.4.3 · chequeos: tamaño — (paquete del método) · entorno — (sin ficha del kit) · tope ✅ · hash 7679ee32ed7f`
- Plano: [`SPEC-0-kit-v3.md`](SPEC-0-kit-v3.md), orden 7 = **P6.8b, P3.8**; criterio 3 del TABLERO (la portada); el NO VERIFICADO "la
  migración del `CAMBIOS.md` de Hermes". Diseño: D §22ter (4, 5, 6) · B §12bis · E §7. De Pendientes, "Paquete 6 · para después": **nada toca
  esto** (la fusión real, el `-rc`, `chequeo.cjs`, `preparar-pc`, el Modo A con `docs/modulos/`): siguen ahí.
- Red team: **sí, una ronda, acotada** (D7-1): `subio-al-kit` cambia lo que acepta `cambios verificar`, que es el candado de estados y SHA (un
  freno del pre-commit), y el actualizador pasa a borrar contenido de la zona propia. La portada suma un id al candado, pero es corrector y
  apagado hasta que el árbol cumpla, como los otros: entra a la misma ronda sin pedirla aparte. Revisor frío Opus al cerrar, una vuelta.

## Por qué (el dolor)

Hermes cambió su método 32 veces en una semana (D §22bis) y lo anotó en un archivo único de 230 KB (`docs/metodo/CAMBIOS.md`, 103 CM) que
cada director relee. El paquete 2 dejó el formato chico (`.claude/cambios/<fecha>-<slug>.md`, P6.8a), pero **nada lo lee de la flota**: qué
se repite en tres proyectos, qué cicatriz espera al kit, qué ya entró. Sin eso, "sube al kit por el ciclo" (ADR-026) depende de que Guido se
acuerde. Y la portada (B §12bis): Guido quiere repos "lindos, que se entienda qué es"; hoy solo vibe-kit la tiene (1 de 10, TABLERO §3).

## Contexto (explorado el 2026-11-02)

- **El registro** (`kit/molde/hooks/lib/cambios.cjs`, barrera; `kit/molde/scripts/cambios.cjs`, el CLI): `nuevo`, `listar`, `verificar`,
  `anotar-sha`, `rechazar`, `aprobar`. Los cinco estados ya existen, **`subio-al-kit` incluido** (con `version` N.N.N; valida `sha` y `aplico`
  con él), pero **ningún comando lo escribe**. `aplico: {archivo, hash}` = hash (12 hexa) de **todas** las zonas `kit:propio` del archivo
  juntas, que escribe `anotar-sha --aplico`. Id = nombre del archivo, `AAAA-MM-DD-<slug>`. `cita: "<alias> <id>"`.
- **El alias de un proyecto**: `vars.proyecto` de su ficha (`.claude/kit.md`).
- **La carpeta de la flota**: `~/.claude/kit-pc.md`, campo `proyectos:` (lo escribe `preparar-pc`, D6.1). `actualizar.cjs flota todo` toma
  "toda carpeta de `--proyectos` con ficha u `origin`".
- **El actualizador** (`kit/skills/arquitecto-skills/scripts/actualizar.cjs aplicar`, con `lib/catalogo.cjs`): pieza por pieza, la zona
  propia se lleva al molde nuevo con `zona-propia.mezclarTexto`. `pc/lib/` copia byte a byte `molde/hooks/lib/` (y
  `arquitecto/scripts/lib/ficha.cjs`), lo vigilan dos pruebas.
- **El candado** (`molde/hooks/lib/candado.cjs`): nueve ids, cada uno quitable salvo `barreras`, apagado hasta que el árbol cumple.
- **El molde no trae `README.md` raíz** ni banner; trae `docs/NORTE.md` (con "## Qué es") y `docs/MAPA.md`. La portada de vibe-kit
  (`README.md`, `assets/banner.svg`) es el precedente.
- **Hermes** (clon de solo lectura en el scratchpad, 2.359 commits): `docs/metodo/CAMBIOS.md`, índice `| **CM-N** | título | estado | aplicado
  en |` y una sección `## CM-N · <título>` por cambio con `**Estado**: ✅ **aplicado** en \`<sha corto>\` (<fecha>, …)`, `**Caso de origen**`,
  `**La regla, como quedaría**` y la tabla de medición (desde CM-63; las viejas no la tienen). Uno solo no aplicado (CM-103, "propuesto,
  aprobado por el PO"). `tests/test_cambios_no_se_contradice.py` lee ese archivo.

## Dónde vive cada pieza

| Pieza | En el kit | Quién la corre |
|---|---|---|
| `subio-al-kit` | `molde/hooks/lib/cambios.cjs` (la transición) + `molde/scripts/cambios.cjs subio-al-kit` + `actualizar.cjs aplicar` | el actualizador |
| Lo que el kit cubre | `kit/cubiertos.md` (nuevo, gramática de la ficha) | lo escribe la sesión madre en el ciclo |
| `cambios flota` | `kit/skills/arquitecto-skills/scripts/cambios-flota.cjs` (nuevo; lee con `pc/lib/ficha.cjs`) | el ciclo (misión 6); `--urgentes`, el `/inicio` de vibe-kit |
| La migración | `kit/skills/arquitecto-skills/scripts/migrar-cambios.cjs` (nuevo) | el adoptador o una sesión, una vez por proyecto |
| La portada | `molde/README.md` + `molde/assets/banner.svg` (plantillas) + `molde/scripts/portada.cjs` + `candado:portada` | el Arquitecto (Modo A y adopción) |

## AGREGA

### P6.8b-1 · `subio-al-kit`: el kit cubre lo que el proyecto aprendió (D §22ter.4)

1. **`kit/cubiertos.md`**: la lista de lo que entró al kit, en la gramática de la ficha (cabecera entre `---`):
   `cubiertos:` lista de mapas en línea `- {cita: "<alias> <id>", version: N.N.N, pieza: <id del catálogo>}` (`pieza` = dónde quedó la regla
   en el molde; r1-3). Nace vacía (`cubiertos: []`). La escribe la sesión madre cuando una regla sube; nunca el actualizador. `kit-sync` no
   la copia (no es de la PC).
2. **La transición es una función pura de la lib** (`aSubioAlKit(texto, version)` → texto; r1-8): solo desde `aplicado`; pone `estado:
   subio-al-kit` y `version`, y **conserva** `sha`, `aplico` y `aprobo`. **`version` entra a `FUERA_DEL_HASH`** del sello (r1-2: si no, un
   `3-barrera` subido daría "el sello no coincide" para siempre; no cambia ningún hash existente, porque `version` solo va con
   `subio-al-kit`). El CLI **`cambios subio-al-kit <id> <version>`** la envuelve con un commit propio por rutas, como `nuevo`; desde otro
   estado → 1 sin escribir.
3. **`verificar` acepta `subio-al-kit`** con las mismas reglas que `aplicado` (el SHA existe; un `3-barrera` con su sello válido) más
   `version`. Nada que hoy sea rojo pasa a verde (crit. 3). **Y no es callejón** (r1-5): `anotar-sha` reapunta también un `subio-al-kit`
   (la misma regla rf-2) y `rechazar` lo acepta (solo quita cobertura). **`candado:barreras`** (`barreras.cjs`, `cambiosValidos` y el
   arreglo del rebase) trata `subio-al-kit` igual que `aplicado` (r1-7).
4. **`actualizar.cjs aplicar` cierra el ciclo**, después de llevar las piezas al molde nuevo, **como `plan.ops`** (no commitea: `--plan` lo
   muestra sin escribir; r1-8). **Con un tag `-rc`, nada**: solo la línea "subiría al kit · <id>" (r1-6; `flota` le pasa si es rc). Para
   cada cambio del proyecto en `aplicado` **cuyo `verificar` da verde** (los rojos siguen `aplicado` con la línea "verificar en rojo";
   r1-5) y cuyo **id** (`<vars.proyecto> <id>`) **o `cita:`** esté en `cubiertos.md` del kit nuevo con `version` ≤ la del kit nuevo
   (comparación numérica, `ficha.compararVersiones`):
   - lo pasa a `subio-al-kit` con `version` = **la del kit nuevo**;
   - **retira la zona propia** de `aplico.archivo` (vacía el contenido de sus zonas, deja las marcas) **solo si se cumplen las cinco**:
     (a) es clase `2`; (b) `cambios.categoriaDe(aplico.archivo)` es `null` (no es barrera, la misma vara que el candado; r1-9); (c) la
     `pieza` de su entrada en `cubiertos.md` se reemplazó o se mezcló **en esta corrida** y `aplico.archivo` es de esa pieza (r1-3); (d) la
     zona de ese archivo **estaba vacía en `<sha>^`** (el cambio la escribió entera) y **ningún otro cambio** no `rechazado` ni
     `subio-al-kit` tiene el mismo `aplico.archivo` (r1-1); (e) el hash de las zonas **en el texto ya mezclado** coincide con `aplico.hash`.
   - si falla (a) o (b) → la zona queda y "te espera (freno)" (**nunca** se retira un freno sola, D7-3); (c) → "te espera (la regla no
     llegó por el actualizador)"; (d) → "zona compartida, queda"; (e) → "zona editada, queda".
   - la tabla de `aplicar` suma una línea por cambio: `subió al kit · <id> · zona retirada | <la razón por la que queda>`.
   El cruce es **por id o por cita, nunca por texto** (D §22ter.4). Si `cubiertos.md` no existe o no abre → no se marca nada y una línea lo
   dice (no rompe la actualización).

### P6.8b-2 · `cambios flota`: lo que la flota aprendió, contado por un script (D §22ter.4-5)

`node cambios-flota.cjs [<repo>…] [--proyectos <carpeta>] [--urgentes] [--kit <raíz del kit>]`. Sin repos: todas las carpetas de
`--proyectos` con `.claude/cambios/`; sin `--proyectos`: el `proyectos:` de `~/.claude/kit-pc.md`; sin eso, una línea "no sé dónde está la
flota" y salida 0. **Solo lectura, sin red**: lee la rama por defecto **local** de cada repo (lo commiteado, `git ls-tree` + `git cat-file
--batch`, un proceso por repo), no el disco ni `origin`. Un repo que no se lee da una línea y se sigue.

- **Sin `--urgentes`**, la tabla del ciclo: una fila por **regla**, donde regla = la `cita:` de un cambio si la tiene, o `<alias> <id>` si no.
  Columnas: regla · proyectos que la tienen (el de origen, si su archivo está, más cada uno que la cita; un proyecto cuenta una vez) ·
  cicatriz (la peor) · estados · **entra**: `sí (3+)` con 3 o más proyectos, `sí (cicatriz)` con 1 o 2 y cicatriz `seguridad`, `produccion`
  o `plata`, `no` el resto. No cuentan los `rechazado`; los `subio-al-kit` y los que ya están en `cubiertos.md` (con `--kit`) van aparte,
  "ya en el kit". Abajo, para lo que entra, la línea lista para pegar en `cubiertos.md`. Orden fijo (entra primero, después por proyectos).
- **`--urgentes`**: una línea por cambio con `urgente: sí` que no esté `rechazado` ni `subio-al-kit`: `⚠ <alias> · <id> · <regla en una
  línea> · <estado>`; ninguno → "ninguna urgencia en la flota". **Tarda < 5 s** con diez repos (es del `/inicio`).
- Salida 0 siempre que corrió (es un informe); 2 mal llamado.

**En el `/inicio` de vibe-kit** (`.claude/skills/inicio/SKILL.md`, este repo, no el kit): un renglón más en el paso 1, "las urgencias de la
flota: `node kit/skills/arquitecto-skills/scripts/cambios-flota.cjs --urgentes`"; si lista algo, va a la confirmación de 3 líneas. Corre del
árbol del kit (no del instalado): es lo que se mantiene acá.

### P6.8b-3 · La migración del `CAMBIOS.md` de Hermes (E §7; D §22ter, NO VERIFICADO del SPEC-0)

`node migrar-cambios.cjs --repo <dir> [--fuente docs/metodo/CAMBIOS.md] [--plan] [--commit]`. Lee la fuente **del disco** del repo y escribe
un archivo por `## CM-N · <título>` en `.claude/cambios/`:

- **id**: `<fecha>-cm-<n>`; fecha = la de la línea `**Estado**` si trae una, si no la del commit que agregó la sección (`git log -S`), si no la
  del primer commit del archivo.
- **cabecera**: `clase: 2` · `toca: [metodo]` · `origen: "CAMBIOS.md CM-<n> (migrado)"` · `cicatriz: no` · `chico: no` · estado:
  `✅ aplicado en \`<sha>\`` → `aplicado` con el SHA **completo** (`git rev-parse <corto>^{commit}`; si hay varios, el primero, y los otros al
  cuerpo); `rechazado` → `rechazado` con el motivo de la línea; cualquier otro (`propuesto`, "propuesto, aprobado por el PO") → `propuesto`
  con la línea original al cuerpo. Un SHA que no resuelve → `propuesto` y la línea lo dice (nunca un `aplicado` falso).
- **cuerpo**, las cuatro secciones: `## Caso de origen` (el texto original entero de la sección del CM, citado); `## Regla` (primera línea: el
  título del CM, que en Hermes ya es la regla); `## Dónde vive` (la columna "Aplicado en" del índice); `## Medición` (la tabla de medición si
  la sección la trae; si no, "no está medido (migrado de CAMBIOS.md)").
- **No toca `CAMBIOS.md`** ni su test: retirarlo (lápida, test) es decisión del proyecto al adoptar; el script lo dice en su última línea.
- `--plan`: lista qué escribiría, sin escribir. Repetirlo con los archivos ya escritos e iguales → "sin cambios"; uno distinto → no lo pisa
  y lo informa. `--commit`: un commit por rutas (`git commit -- .claude/cambios/…`).
- **Salida**: una línea por CM con su id y estado, y el total. 0 anduvo; 1 algún CM no se pudo leer (los demás se escriben igual).

**El Mobile (`D-n`)**: fuera de este paquete (D7-5).

### P3.8 · La portada (B §12bis)

1. **`molde/README.md`** (plantilla): `# {{PROYECTO}}`, el banner opcional (`![{{PROYECTO}}](assets/banner.svg)`), "qué es" en hasta 3
   líneas, "Cómo correrlo" (`comando-setup` y `comando-test` de la ficha) y los enlaces a `docs/NORTE.md`, `docs/MAPA.md` y
   `docs/README.md`. Sin pendientes, historial ni versión (ADR-023).
2. **`molde/assets/banner.svg`** (plantilla): el estilo de `assets/banner.svg` de vibe-kit, plano, con `{{PROYECTO}}` y una línea, legible en
   claro y oscuro.
3. **`molde/scripts/portada.cjs armar [--banner] [--plan]`**: arma el `README.md` raíz desde `docs/NORTE.md` ("## Qué es") y la ficha
   (`vars.proyecto`, `comando-setup`, `comando-test`). Si el README existe y **no** es el que armó el script (marca `<!-- kit:portada -->` al
   pie con el hash de lo generado), no lo pisa: lo informa. `--banner` escribe `assets/banner.svg` con el nombre; **sin `--banner` no hay
   banner** (lo decide el Arquitecto: `liviano` o personal, sin). `chequear`: 0 si cumple, 1 con qué falta.
4. **`candado:portada`** (id nuevo, el décimo; quitable): **corre solo si la ficha tiene `piezas.portada` y no es `no`** (r1-4: el apagado
   del candado es por repo, no por id; así ningún repo existente se pone rojo al actualizarse). Rojo si no hay README en la raíz (sin mirar
   mayúsculas, como `entradasRaiz`) o si no enlaza a `docs/NORTE.md` (resuelto con `citas` + `aRuta` del mismo candado: vale `./docs/NORTE.md`,
   con ancla o de estilo referencia) o si ese archivo no existe (r1-10). Nada más (barato).
5. **El catálogo no reparte la portada** (r1-4): `molde/README.md` y `molde/assets/banner.svg` van a `SUELTOS` de `catalogo.cjs` (plantillas
   sin pieza: el actualizador nunca hace nacer un README); el README lo crea solo `portada.cjs armar`. `portada.cjs` va en la pieza
   `scripts`. `piezas.portada: sí` la escribe el Arquitecto en la ficha al montar o adoptar (dentro del mismo OK), y lo admite el parser.
6. **El Arquitecto** (Modo A y adoptar): un renglón: "al montar o adoptar, `portada.cjs armar` (con `--banner` si es de la empresa y
   `estandar`)", dentro del mismo OK, cero preguntas nuevas (B §12bis.2). About y etiquetas por `gh`: fuera (D7-6).

## MODIFICA

- `molde/hooks/lib/cambios.cjs`, `barreras.cjs` y `scripts/cambios.cjs` (+ sus pruebas; las copias en `pc/lib/`); `actualizar.cjs` y su
  prueba; `lib/flota.cjs` (le pasa a `aplicar` si el tag es rc); `catalogo.cjs` (`SUELTOS`); `ficha.cjs` si hace falta para `piezas.portada`
  (+ sus dos copias);
  `candado.cjs` (+ copia en `pc/lib/`) y su prueba; `doctor` si cuenta los ids del candado; los `.md` del Arquitecto (`modo-a.md` y el de
  adoptar); `flota.md`; `kit/CHANGELOG.md` (la nota de 3.0.0 suma una línea); `.claude/skills/inicio/SKILL.md` de vibe-kit.

## NO SE TOCA

- El sello de `aprobar` y sus tres candados (P6.8a): `subio-al-kit` no crea ni mueve un `aprobado`.
- La zona propia de un freno: nunca se retira sola (ni con hash igual).
- `CAMBIOS.md` de Hermes y el repo real de Hermes; el `~/.claude/` real (salvo el `kit-sync` del `/cierre`).
- Los README de los repos que ya tienen uno propio.

## Entorno de prueba

Repos de prueba (`bash pruebas/rehacer.sh`: `alfa`, `beta`, `gama` y sus remotos, en `../vibe-kit-pruebas/`), copias a un temporal; el clon de
Hermes en el scratchpad, **solo lectura** (la migración corre sobre una copia); un canónico `bare` de prueba para `aplicar` con un
`cubiertos.md` de prueba. Ninguna prueba toca `~/.claude/` (`--home` o `HOME` falso).

## Criterios de aceptación

1. **`subio-al-kit` por el CLI**: un `aplicado` pasa con `version`, conserva `sha`/`aplico`/`aprobo`, un commit por rutas; desde `propuesto`,
   `aprobado` o `rechazado` → 1 sin escribir. *Verifica: prueba sí/no.*
2. **`aplicar` cierra el ciclo**: con `cubiertos.md` que nombra un cambio de clase 2 del proyecto (por id y, en otro caso, por cita) → queda
   `subio-al-kit` y su zona vacía; y una prueba por cada razón para que quede: zona editada · zona que ya traía algo propio antes del cambio
   · dos cambios en el mismo archivo · la pieza no se mezcló en la corrida · `3-barrera` · archivo de frenos · `verificar` rojo · tag `-rc` ·
   `--plan` no escribe; sin `cubiertos.md` → nada cambia y una línea. *Verifica: prueba sobre una copia de `alfa`.*
3. **`verificar` no se afloja y no traba**: un `subio-al-kit` sin `sha`, con SHA inexistente, sin `version`, o `3-barrera` sin sello válido →
   rojo, igual que `aplicado`; **un `3-barrera` sellado y llevado a `subio-al-kit` sigue verde**, y `barreras` cubre su commit; `anotar-sha`
   y `rechazar` sobre un `subio-al-kit` andan. *Verifica: prueba + mutación de las reglas nuevas (tope 20 min).*
4. **`cambios flota` cuenta**: un cambio en `alfa` citado por `beta` → una fila con 2 proyectos y "no"; citado además por `gama` → "sí (3+)";
   uno solo con cicatriz `produccion` → "sí (cicatriz)"; un `rechazado` no cuenta; un `subio-al-kit` va a "ya en el kit". *Verifica: prueba.*
5. **`--urgentes`**: lista el `urgente: sí` de `beta` y no el `rechazado`; diez repos en < 5 s (medido); y el `/inicio` de vibe-kit lo
   nombra. *Verifica: prueba + tiempo medido por el director.*
6. **La migración de Hermes** sobre una copia del clon: un archivo por CM (103), `cambios verificar` (el del molde) en verde sobre la copia,
   **0 `aplicado` sin SHA resolvible**, CM-103 en `propuesto`, `--plan` repetido → "sin cambios", `CAMBIOS.md` intacto. *Verifica: corrida del
   director, con las cifras.*
7. **La portada**: `portada.cjs armar` en una copia de `alfa` arma el README desde su NORTE (3 líneas, cómo correrlo, los tres enlaces);
   repetido → "sin cambios"; con un README propio → no lo pisa; `--banner` → `assets/banner.svg` con el nombre; `candado:portada` rojo sin
   README o sin el enlace, verde con él (también con `./docs/NORTE.md`, con ancla y con `Readme.md`), y **callado sin `piezas.portada`**; y
   `aplicar` no hace nacer ningún README. *Verifica: prueba + una corrida del director.*
8. **Nada se rompe**: las pruebas de lo tocado (cambios, actualizar, candado, catálogo, copias `pc/lib`) verdes corridas por el director; la
   suite entera una vez al final.

## Los encargos (el director reparte, lee cada diff y corre las pruebas de cada uno)

| # | Encargo | Modelo | Archivos | Depende |
|---|---|---|---|---|
| RT | Red team del delta, una ronda, acotado a P6.8b-1 y `candado:portada` | Opus | — (informe) | delta |
| A | P6.8b-1 entero: `cubiertos.md`, `subio-al-kit` (lib + CLI + `verificar`), `aplicar` cierra el ciclo; copias `pc/lib`; mutación | Opus | `molde/hooks/lib/cambios.cjs`, `molde/scripts/cambios.cjs`, `actualizar.cjs`, `kit/cubiertos.md`, pruebas | RT |
| B | P6.8b-2: `cambios-flota.cjs`, `--urgentes`, el renglón del `/inicio` de vibe-kit | Sonnet | `cambios-flota.cjs` (+ prueba), `.claude/skills/inicio/SKILL.md` | delta |
| C | P6.8b-3: `migrar-cambios.cjs` y su corrida sobre la copia de Hermes | Opus | `migrar-cambios.cjs` (+ prueba) | delta |
| D | P3.8: plantillas, `portada.cjs`, `candado:portada`, `SUELTOS`, Arquitecto, y la línea de `cambios-flota` en `arquitecto/anexos/flota.md` | Sonnet | `molde/README.md`, `molde/assets/`, `portada.cjs`, `candado.cjs`, `catalogo.cjs`, `.md` del Arquitecto | RT (solo el candado) |
| RF | Revisor frío, una vuelta, hasta 10 | Opus | — | todo |
| RF-fix | Los arreglos, un encargo | Sonnet u Opus | lo que diga | RF |

B y C en paralelo con RT (no tocan frenos); A y D después de RT. Nunca más de dos Opus a la vez. Total: **7**.

## Lo prueba una sesión real

Nada nuevo pide una pestaña: todo es script. Queda NO VERIFICADO (al piloto): el ciclo entero con un cambio de verdad que sube (misión 6), y
la portada en GitHub (cómo se ve renderizada en un repo de la empresa).

## Riesgos y decisiones ⚠️

- ⚠️ **D7-1 · Red team sí, una ronda acotada**: `subio-al-kit` toca lo que acepta el candado de estados y el actualizador borra zona propia.
  `[mejor código]`
- ⚠️ **D7-2 · Lo que el kit cubre vive en `kit/cubiertos.md`**, una lista explícita escrita por la sesión madre. Alternativa descartada:
  deducirlo del texto del molde (D §22ter pide el cruce por id, nunca por texto). `[consistencia · acordarse de menos]`
- ⚠️ **D7-3 · Un freno nunca se retira solo**: ni `3-barrera` ni un archivo de frenos, aunque el hash coincida; va a "te espera". Es B §14:
  los frenos los toca Guido. `[mejor código]`
- ⚠️ **D7-4 · `cambios flota` lee la rama por defecto local, sin red**: lo de un módulo sin mergear no se ve hasta el merge, y un repo sin
  `pull` se ve viejo. Con red tardaría y fallaría sin conexión en el `/inicio`. `[workflow]`
- ⚠️ **D7-5 · La migración: todo clase 2, `toca: [metodo]`, sin `cita:`**: Hermes no distingue barreras ni guarda las citas a Mobile en
  forma de id; inventarlas sería un dato falso. El caso entero queda citado en el cuerpo. **Mobile (`D-n`) queda fuera**: el prompt de D7.1
  pide Hermes, y el formato de Mobile no se exploró. `[mejor código · consistencia]`
- ⚠️ **D7-6 · La portada la arma un script, no el modelo** (criterio 6: lo que puede calcular un programa); el banner, solo con
  `--banner`; About y etiquetas por `gh` quedan fuera (son una acción hacia afuera sobre GitHub: el Arquitecto la propone, no la hace sola).
  `[acordarse de menos · consistencia]`
- ⚠️ **D7-7 · El retiro automático, con cinco condiciones** (red team r1-1, r1-3, r1-9): ante cualquier duda la zona queda y se informa. Se
  prefirió a "nunca retirar solo" (más simple, pero deja a mano lo que D §22ter.4 pide automático). `[mejor código · acordarse de menos]`

### Lo que esto no cierra

- Un `cubiertos.md` con una entrada falsa que retira la zona propia de un proyecto: la escribe la sesión madre y queda en git; la zona solo
  se retira si está intacta (sigue en la historia del proyecto). Trampa, sin arreglo.
- Un `urgente: sí` escrito a mano en un cambio viejo: aparece en el `/inicio`; lo ve Guido.

## Red team (Opus, `redteam-spec`, una ronda, acotada a P6.8b-1 y `candado:portada`)

Veredicto: 4 ALTOS, todos del día normal; los 10 integrados arriba. Lo que solo es trampa (editar `aplico.hash`, un `subio-al-kit` a mano,
un `cubiertos.md` falso) va a "Lo que esto no cierra".

| Id | Sev | Qué se hizo |
|---|---|---|
| r1-1 | ALTO | El retiro vaciaba toda la zona (el hash es de todas juntas): solo si estaba vacía en `<sha>^` y nadie más la usa; crit. 2 |
| r1-2 | ALTO | `version` a `FUERA_DEL_HASH` (un `3-barrera` subido quedaba rojo para siempre); crit. 3 |
| r1-3 | ALTO | `cubiertos.md` lleva `pieza`; se retira solo si esa pieza llegó en la corrida |
| r1-4 | ALTO | `candado:portada` solo con `piezas.portada`; las plantillas a `SUELTOS` (el actualizador hacía nacer un README) |
| r1-5 | MEDIO | `anotar-sha` y `rechazar` sobre `subio-al-kit`; solo sube lo que `verificar` da verde |
| r1-6 | MEDIO | Con `-rc`, nada: "subiría al kit" |
| r1-7 | MEDIO | `barreras` trata `subio-al-kit` como `aplicado` |
| r1-8 | BAJO | Transición pura en la lib; en `aplicar`, como `plan.ops`; `version` = la del kit nuevo, comparación numérica |
| r1-9 | BAJO | "Archivo de frenos" = `categoriaDe(...) !== null`, la vara del candado |
| r1-10 | BAJO | README sin mirar mayúsculas; el enlace por `citas` + `aRuta` |

**Abierto, al piloto**: que `vars.proyecto` tenga forma de alias (`[a-z0-9-]+`); si no, el cruce por id no casa. `cambios-flota` y `aplicar`
usan el mismo alias, así que se ve en la tabla.

## Ejecución

Paquete del método de vibe-kit, un director Opus (D7.1), con este delta y una ronda de red team; el cómo, en
[`PLAN-construccion.md`](PLAN-construccion.md) y en "Los encargos" de arriba.
