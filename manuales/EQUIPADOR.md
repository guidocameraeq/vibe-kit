# El Equipador (`/arquitecto-skills`) — la PC y la flota

> **Para qué sirve**: el Equipador deja **la máquina** lista (el kit, los frenos de la PC, las skills del menú) y pone **tus proyectos**
> al día con el kit nuevo. Es la hermana del Arquitecto: él diseña proyectos, ella equipa PCs y repos. Lo llamás directo
> (`/arquitecto-skills`) o se lo pedís al Arquitecto, que te pasa. Si este manual y el kit difieren, manda el kit
> (`kit/skills/arquitecto-skills/SKILL.md` y la cabecera de cada script en `scripts/`).

**La versión**: lo de este manual es el kit v3. "Preparame esta PC" y "actualizate" bajan **el último tag anotado** del repo (el que
imprime `actualizar.cjs ultimo-tag`, rc incluido), y andan desde la beta `v3.0.0-rc.1`.

---

## 1. "Preparame esta PC" (o "preparame esta máquina")

Deja la PC entera lista con **una sola pregunta** (o ninguna, si no hay nada que cambiar; más la de traer repos y la de publicar, solo
si hacen falta). Lo hace un script, `preparar-pc.cjs`; la sesión no lo repite a mano.

1. Clona el repo del kit **completo y con tags** a una carpeta temporal y se para en el último tag anotado (nunca en la punta de `main`).
2. Corre el `preparar-pc.cjs` **de ese clon** con `--plan`: no escribe nada, arma el plan. Arranca con **una línea**, `resumen · …`
   (qué cambiaría, cuántos avisos, cuántas cosas a arreglar).
3. **La pregunta**: si el resumen dice `sin cambios`, te lo dice y sigue, **sin preguntarte nada**. Si no, te muestra esa línea, lo que
   encontró editado a mano (con su diff) y la carpeta de proyectos que detectó: *"¿Lo aplico, con los proyectos en `<carpeta>`?"*.
4. Con tu sí lo aplica. Después, **los repos de tu cuenta** y **publicar sola** (abajo).
5. Te cuenta su `resumen ·` y la línea del `doctor` (`doctor · todo bien · N avisos · N cosas a arreglar · 29 chequeos`; la tabla
   entera, `✓ / ✗ / ⚠ · qué · cómo se arregla`, si la pedís). Termina con **"reiniciá Claude Code"**.

Qué deja puesto, en orden:
- **Chequea los programas** (node, git, `gh` y su cuenta, gitleaks, Claude Code). **No instala programas**: lo que falta sale en la
  tabla con cómo conseguirlo, y sigue.
- **El kit** en `~/.claude/`: el Arquitecto, el Equipador, `docs-fyd`, `relevamiento`, el agente `redteam-spec` y `VERSION`. Conserva
  la carpeta de proyectos de la PC. **Un archivo editado a mano no se pisa** sin que lo veas (si viste el diff y querés pisarlo, va
  `--pisar-editados`).
- **Los frenos de la PC** (los mismos que §3) y dos ajustes de Claude Code en `~/.claude/settings.json`: el bloque `autoMode` (siempre
  conservando las reglas de fábrica, `"$defaults"`) y `crossSessionInbound`. Todo en una sola escritura.
- **La capa privada**, si `kit-pc.md` dice dónde está: corre su propio instalador. **La credencial del Hub nunca pasa por el kit**
  (ADR-033): la maneja la capa privada; el `doctor` solo mira que la variable exista, sin leer su valor.
- **`~/.claude/kit-pc.md`**: la ficha de la PC (entorno, `gh`, carpeta de proyectos, capa privada, modo y, si dijiste que sí, qué
  proyectos publican solos desde acá).

### Los repos de tu cuenta

Con `traer-repos.cjs listar` ve los repos de tu cuenta de `gh` (y de sus organizaciones) que todavía no están en tu carpeta de
proyectos y te pregunta **una vez**, *"¿traigo repos de tu cuenta?"*, con la lista para marcar. **Nunca trae nada que no elegiste.**
Los elegidos se clonan a tu carpeta (`traer-repos.cjs clonar`): una carpeta que ya existe no se pisa, y a un repo con el kit le prende
los ganchos. **El `comando-setup` de un repo recién traído no corre solo** (es código de ese repo): te lo muestra y te pregunta, repo
por repo. A uno sin el kit te ofrece *"adoptá <repo>"* (§5). El paso a paso, en `kit/skills/arquitecto-skills/preparar-pc.md`.

### Publicar sola desde esta PC

Que la ficha de un proyecto diga que la noche publica (`autorizado.publicar`, `manuales/MOLDE.md` §4) no alcanza: hace falta **tu sí
en esta PC**, por proyecto. Por cada uno que lo pida, la tabla trae un renglón `⚠ publicar` con cómo publica, cómo lo prueba y cómo
vuelve atrás, y la sesión te pregunta: *"¿autorizás que <proyecto> publique solo desde esta PC?"*. Con tu sí corre `preparar-pc.cjs
--publica <origin>` y aparece la ventana de permiso: **tu clic es la firma** (una sesión no se la da sola). El sí vale para **cómo publica
hoy** (su huella): si cambia el comando o el script de publicar, la noche deja de publicar y "preparame esta PC" te lo vuelve a
preguntar. Para sacar uno: `--no-publica <origin>`, igual. Una corrida sin ninguno de los dos no toca lo que ya autorizaste.

Si sale 1, la sesión te cuenta su línea. NO VERIFICADO todavía: la línea para instalar Claude Code y los ids de `winget` que sugiere.

## 2. "Actualizate" (o "actualizá el kit", "traé lo último del Arquitecto")

**Es el mismo camino que "preparame esta PC"**: clon con tags, último tag anotado, el script del clon nuevo, `--plan` y la una pregunta.
Actualiza solo lo del kit (Arquitecto, Equipador, `docs-fyd`, `relevamiento`, `redteam-spec`, `VERSION`). La versión nueva carga al
reiniciar Claude Code. **En este repo (vibe-kit) no se usa**: acá el kit se sincroniza con `/cierre`.

"Actualizá las skills" es otra cosa: actualiza las skills **del menú** (las externas), cada una desde su repo, con diff antes de pisar.

## 3. Los frenos de la PC — "instalar hooks por PC"

El corrector de secretos de toda la máquina: hooks en `~/.claude/hooks/kit/`, que frenan antes de que una sesión escriba o mande una
credencial. Lo instala `instalar-hooks-pc.cjs` (y "preparame esta PC" lo incluye).

- Primero `--plan`: te dice qué haría, sin escribir. **Una pregunta**: "¿lo aplico?".
- Sí → lo instala, corre el `doctor` y te pide **reiniciar Claude Code** (los hooks cargan al reiniciar).
- **Sacar el anti-secretos viejo** (el de antes del kit): cuando confirmes que el nuevo anda, `--sacar-viejo` (saca su registro; el
  archivo queda).
- **Deshacer todo**: `--quitar` deja el `settings.json` como estaba antes de la primera instalación.
- Si el `settings.json` está roto (JSON inválido, claves repetidas), no toca nada y te dice por qué: se arregla a mano.

Nunca se edita `~/.claude/settings.json` a mano: el instalador es el único que lo escribe. Qué hacer si se filtró una credencial:
`manuales/se-filtro-una-credencial.md`.

## 4. "Corré el doctor"

`doctor.cjs` revisa la PC y el repo donde estás parado. **Solo lee**: no cambia nada.

- Lo que te dice la sesión es **el resumen**: `doctor · todo bien · N avisos · N cosas a arreglar · 29 chequeos` (o `hay cosas que
  arreglar`), cada `✗` con su arreglo y el **inventario de frenos** del repo (las líneas `inventario ·`). El detalle, si lo pedís: una
  línea por chequeo (29), siempre en el mismo orden, `✓ / ✗ / ⚠ · qué · cómo se arregla`.
- Mira, entre otras cosas: la versión de Claude Code, `gh`, gitleaks, los hooks de la PC, copias del kit, frenos vencidos, el
  pre-commit y la ficha del repo, y las variables de la capa privada (por nombre). Parado en un proyecto, además: los **vecinos**
  (worktrees fuera de `.claude/worktrees/`, carpetas `gate-*`) y el **lock atrasado** (un `package.json` que su lock no tiene al día:
  regeneralo y commitealo, o la flota no puede probar tus tests). Los dos son ⚠.
- Sin red o sin poder correr algo: `⚠ NO VERIFICADO: <por qué>`, nunca ✓. Los `⚠` no traban; cada `✗` dice cómo se arregla.

NO VERIFICADO: que encuentre la ruta de la app de escritorio de Claude Code (con la app abierta tiene que decir `claude-code ✓`).

---

## 5. La flota: poner al día y adoptar

El Arquitecto deriva estos pedidos acá. Los corre `actualizar.cjs`, un script determinista: nadie corre en bypass, y **tu carpeta de
trabajo nunca se toca** (todo pasa en clones temporales del repo remoto).

### "Poné al día la flota" (o "poné al día X")

`actualizar.cjs flota <X>… | todo [--canon <repo del kit>] [--proyectos <carpeta>]` (sin `--canon`, el repo canónico del kit; tarda,
así que la sesión la corre en segundo plano). Por cada repo, uno detrás del otro:

1. Clona el kit en su último tag y **un clon temporal** del repo.
2. **Saltea con su porqué** el que tiene obra en curso (ramas `modulo/*` del remoto **sin mezclar** en su rama por defecto; las ya
   mezcladas no cuentan), el que ya está al día y el que ya tiene su rama `kit/<versión>` esperando. Si mezclaste el módulo con squash
   en GitHub, la flota no lo ve mezclado: la sesión te ofrece borrar esa rama del remoto, con tu OK, y la próxima vuelta entra.
3. En la rama `kit/<versión>` aplica el kit pieza por pieza según la ficha del proyecto (`.claude/kit.md`), commitea y corre el
   **chequeo** (nueve líneas) y después `adoptar --verificar` en el clon: si un hook registrado o el arranque no anda, no mezcla. El
   commit y el push los juzgan los frenos del molde nuevo.
4. **Verde** → la rama por defecto avanza con un commit del kit. **Rojo** → nada llega a la rama por defecto: queda la rama `kit/…`
   con un commit `kit: ROTA — <qué falló>` (la próxima vuelta la rehace). **Push rechazado** (rama protegida) → la rama queda
   "te espera".

Te devuelve **una tabla** (mezclado · salteado con su porqué · ROTA · te espera) y la lista "te espera:". **Con obra en curso**
(ramas `modulo/*` vivas) sale `salteado`; si sabés que podés, `--con-obra` actualiza `main` igual y prueba en el clon, sin subir nada,
traer `main` a cada módulo: "te espera:" dice por módulo verde, rojo (lo aprobás vos antes) o choca, y lo trae su director con
`worktree.cjs traer-main <x>`. Una skill que pasa su tope **por su zona propia** da ⚠ y no ROTA (decidido por Guido, 2026-11-04).
**El lock del proyecto atrasado** (el `comando-setup` ya fallaba antes de la actualización por eso, y el kit no tocó ni el lock ni el
setup) tampoco traba: el repo sale `mezclado` y "te espera:" dice que tus tests no se probaron hasta que regeneres el lock. Si
`hooks-lib` te espera y un hook nuevo la necesita, la fila dice que la resuelvas primero (`resolver . hooks-lib …`).

**`todo` sin `--tag` reparte el último tag anotado, rc incluido, a todo proyecto con ficha.** Hoy solo Hermes tiene ficha; cuando se
sumen otros, una beta les llega igual: para repartir solo una versión final (sin beta), pasá `--tag v<X.Y.Z>`.

**Lo que adaptaste en un proyecto no se pisa.** Una pieza adaptada (la cambiaste a tu gusto; su porqué es el `por:` en la ficha):
- con su porqué y una mezcla limpia (el kit cambió en otro lugar que vos) → se fusiona sola;
- sin porqué → queda en `.claude/fusiones/<pieza>.md` del proyecto, "te espera";
- **la mezcla que choca** (el kit cambió justo donde vos; también si la pieza no tiene porqué) **nunca se resuelve sola**: queda "te espera" con el motivo `la mezcla
  chocó…`. Si hay `claude`, arma una propuesta de fusión, pero no la aplica. El informe trae qué pieza es, por qué la habías adaptado,
  qué trae la versión nueva y `## Dónde chocan` (lo tuyo y lo nuevo, lado a lado).

La próxima vez que abras ese proyecto, `/inicio` te lo cuenta en criollo y te recomienda una salida con criterio (si lo nuevo vale la
pena frente a tu porqué); lo decidís charlando con la sesión, y lo escribe `actualizar.cjs resolver`. **Las cuatro salidas**, y qué
pierde cada una:
- **mezclar**: lo tuyo encima de lo nuevo (la fusión propuesta). No perdés nada, si la mezcla se puede armar.
- **quedarse con la tuya** (`quedarse`; antes `propia`, que sigue andando): sigue adaptada, sin lo nuevo; la próxima versión del kit se te vuelve a ofrecer. Perdés lo nuevo, por ahora.
- **tomar la nueva**: la versión del kit entera; la pieza pasa a `molde` y se actualiza sola de ahí en más. Perdés lo tuyo fuera de la
  zona propia (el informe dice qué).
- **congelar**: queda `propia`, el kit no la toca más. Perdés todas las mejoras futuras de esa pieza (no va en una pieza de frenos).

NO VERIFICADO: la propuesta con un `claude` real; todas las pruebas usan uno falso.

Si la pestaña está en `auto` y el clasificador no la deja pushear, **la línea la corrés vos en tu terminal** (nunca en bypass).

### "Adoptá X" (un repo v2, sin ficha)

Un repo que todavía no tiene el kit v3 **se adopta, no se actualiza**. Va en dos tiempos:

0. **La PC al día primero**: `actualizar.cjs ultimo-tag <clon del kit>` contra `~/.claude/VERSION`. Si el tag es más nuevo, esta PC
   está atrás: primero *"actualizate"* (§2), porque si no el repo nace con el molde viejo. `--mirar` lo avisa igual, con una línea
   `⚠ el --kit tiene el tag …`.
1. **Mirar** (`actualizar.cjs adoptar <carpeta> --kit <clon del kit> --mirar --propuesta <archivo>`): no cambia nada. Deja una
   propuesta: la ficha que tendría el repo, qué piezas trae, cuáles son propias del proyecto y no se pisan. En un repo con código trae
   también `/director` y `/obrero` (el módulo con director los necesita); si ya tenés los tuyos y son distintos, quedan `propia` y la
   sesión lo resuelve con vos (D1, abajo). Corré `--mirar` con `--principal <tu carpeta>`: de ahí sale el nombre del proyecto (el que
   usa `cargar-secreto`). Del `CLAUDE.md` te dice si le falta "El tamaño del pedido" y si habla de un director u obrero propio. También
   te muestra lo que queda fuera del repo (los vecinos), un lock atrasado, y lo que gitleaks encuentra en la historia (solo
   `archivo:línea · regla`, nunca el valor). Dice **qué piezas tuyas reemplazaría** el kit y qué hacer con lo tuyo. Y lo que el repo
   muestra y no se puede adivinar (publica, gasta plata, manda cosas afuera) lo marca en la ficha propuesta con un renglón `# ¿?`:
   la sesión te lo pregunta **a vos**, de a una, y `--aplicar` no anda mientras quede uno.
2. **La pantalla, con vos delante**: la sesión arma el `NORTE.md`, el mapa, el plano de `docs/` y las reglas propias del proyecto
   como cambios. Y te pregunta, de a una con la recomendada primero: los comandos de setup y de test (en Python, con el `.venv` de
   cada worktree), cada base y su clase (`entornos:`: sin declararla, la de prueba cuenta como real), y lo que el comentario marque como
   **D1** (tu director, `/inicio` y `/cierre`, o los del kit: `--director kit`), **D2** (qué permisos se van y qué `ask` frenan al
   director: `--permisos recomendada`), **D3** (dos hooks de arranque, un `session-start.cjs` propio con el nombre del del kit, el
   handoff gordo: `--arranque kit`, que en el caso del mismo nombre lo reemplaza por el del kit) y **D4** (las cinco de `sensible:`).
   Si tus papeles no están en `docs/` (el bot: `docs/` es el sitio de OpenClaw y los papeles van en `arti-docs/`), la propuesta trae
   `carpeta-docs: <carpeta>` y todo el método usa esa carpeta; con un `docs/` ajeno y sin la clave, `--aplicar` se niega. Vos das el OK.
3. **Aplicar**, todo dentro de ese mismo OK. El clon sale del origin de tu carpeta (sin remoto, de tu carpeta misma) a un temporal;
   tu carpeta no se toca hasta el último paso.
   - `--aplicar <archivo> --principal <tu carpeta>` (y las opciones que elegiste): escribe las piezas en el clon y valida tu carpeta.
     Con `--claude-md`, le suma al final de tu `CLAUDE.md` la sección "El tamaño del pedido" del molde (si ya la trae, nada). Con
     `--director kit`, lo tuyo que se reemplaza no se pierde: queda en `<papeles>/referencia/adopcion/<pieza>-anterior.md`, con una
     línea en el TODO para destilarlo a su zona propia o descartarlo.
   - Si tu `CLAUDE.md` tiene su director u obrero propio, la sesión te propone cambiarlo a mano por un puntero a `/director` y
     `/obrero`.
   - Si el proyecto tiene su registro de cambios propio (el `CAMBIOS.md` de Hermes), la migración: `migrar-cambios.cjs --plan` para
     ver, después `--commit` (ver abajo).
   - Los commits (las piezas, la ficha y, si elegiste D2 o D3, el de los permisos), el chequeo de frenos (lo rojo no se aprueba
     después: el sello va antes del commit; con remoto el rojo es solo en el clon y, pusheado, ningún `/cierre` lo vuelve a mirar; sin
     remoto lo ve tu primer `/cierre`: la línea `después:` dice cuál) y push. Al final, `adoptar <clon> --traer <tu carpeta>`: trae lo adoptado a tu
     carpeta (solo si está limpia y en la rama) y **después prende ahí los githooks** (`core.hooksPath` = `.githooks`, nunca en el
     clon; la línea `githooks ·` dice cómo quedó). La **portada** (el README que se ve en GitHub, armado
     desde `NORTE.md`); si el repo ya tiene un README propio, queda como está y te avisa *"portada: README propio, queda apagada"*.
4. **¿Quedó andando?** Al final, `--traer` corre `adoptar <tu carpeta> --verificar`: prueba cada hook registrado con algo inocente,
   el arranque, el `comando-test` y `core.hooksPath` (corre código de tu repo, como abrir una sesión ahí; no corre el setup). Lo que
   te importa de `--traer` es cómo salió:
   - **0**: lo trajo y anda.
   - **1**: el clon o tu carpeta no son lo que tienen que ser, o el merge la dejó a medias (la línea dice cómo volverla atrás).
   - **3**: lo trajo bien pero algo no anda (las ❌): **no se deshace nada**; se arregla y se vuelve a correr `--verificar`.
   - **4**: no lo trajo (faltaba el push, tu carpeta tenía cambios sin guardar, estaba en otra rama —y te dice qué worktree la tiene
     tomada— o tiene commits que origin no tiene). La línea dice qué hacer; tu carpeta quedó como estaba.
   `adoptar <carpeta> --verificar` se puede correr solo, cuando quieras (sale 0 si anda, 1 si no).

### "¿Qué se repite en la flota?" — `cambios-flota`

`cambios-flota.cjs [--proyectos <carpeta>]` lee el registro de cambios de método (`.claude/cambios/`) de cada proyecto y arma **la
tabla del ciclo**: qué regla aparece en 3 o más proyectos o tiene cicatriz de producción, seguridad o plata (candidata a subir al
kit). Solo lee lo commiteado en la rama por defecto local, sin red.

- Con **`--urgentes`**: una línea por cada cambio urgente que sigue vivo. Es lo que corre el `/inicio` de este repo.
- Lo que sube al kit se anota en `kit/cubiertos.md` (lo escribe la sesión madre); al poner al día la flota, cada proyecto lo marca solo
  como "subió al kit".
- Sin `~/.claude/kit-pc.md` (lo escribe "preparame esta PC") no sabe dónde está la flota: hay que pasarle `--proyectos`.

### `migrar-cambios` — el `CAMBIOS.md` gigante

`migrar-cambios.cjs --repo <dir> [--fuente docs/metodo/CAMBIOS.md] [--plan] [--commit]` pasa un `CAMBIOS.md` de un solo archivo (el de
Hermes, con sus `CM-N`) al registro chico del kit: un archivo por cambio en `.claude/cambios/`. Respeta lo que ya estaba aplicado (con
su SHA) o rechazado; lo que no puede probar, lo deja como propuesto y lo dice. `--plan` muestra sin escribir. No borra la fuente: eso lo
decide el proyecto al adoptar. NO VERIFICADO: el formato de Mobile (`D-n`), que no se exploró.

---

## 6. Las skills del menú

- **"Instalame skills"**: censo de lo instalado contra el menú curado (`kit/skills/arquitecto-skills/menu-skills.md`), y un menú para
  elegir. Solo instala lo que está en el menú, clonando fresco de su repo.
- **"Qué skills tengo" / "podá"**: lista lo instalado y marca lo que no está en el menú; lo que lleva un mes sin usarse, te propone
  borrarlo (vos decidís).
- **"Agregá tal skill al menú"**: primero la investiga (repo vivo, licencia, choques con tu sistema); si pasa, entra con origen y razón;
  si no, va a "Descartadas" con su razón.
- **Plugins y MCPs**: te da el comando para pegar; los tokens son siempre tuyos.

## Dónde seguir

- El Arquitecto y sus cinco entradas: `manuales/COMO-USAR-EL-ARQUITECTO.md`
- Qué trae un proyecto con el kit v3 (la ficha, el registro de cambios, la portada): `manuales/MOLDE.md`
- Cada script, sus opciones y sus salidas: `manuales/SCRIPTS.md`
- El por qué: ADR-032 (el actualizador es un script) y ADR-033 (la credencial del Hub) en `docs/DECISIONS.md`; el diseño en
  `docs/kit-v3/SPEC-paquete-3.md`, `-6.md`, `-7.md` y, para traer repos, publicar sola y adoptar sin romper, `-8d.md`
