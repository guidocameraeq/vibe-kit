# El Equipador (`/arquitecto-skills`) — la PC y la flota

> **Para qué sirve**: el Equipador deja **la máquina** lista (el kit, los frenos de la PC, las skills del menú) y pone **tus proyectos**
> al día con el kit nuevo. Es la hermana del Arquitecto: él diseña proyectos, ella equipa PCs y repos. Lo llamás directo
> (`/arquitecto-skills`) o se lo pedís al Arquitecto, que te pasa. Si este manual y el kit difieren, manda el kit
> (`kit/skills/arquitecto-skills/SKILL.md` y la cabecera de cada script en `scripts/`).

**Ojo con la versión**: lo de este manual es el kit v3. "Preparame esta PC" y "actualizate" bajan **el último tag** del repo, y hoy
el último tag es `v2.4.3`, que no trae `preparar-pc.cjs` ni el actualizador. Andan en una PC recién **cuando exista el tag del kit v3**
(o un `v3.0.0-rc`). Hasta ahí, lo de abajo está construido y probado con PCs y repos de prueba, no en tus PCs.

---

## 1. "Preparame esta PC" (o "preparame esta máquina")

Deja la PC entera lista con **una sola pregunta**. Lo hace un script, `preparar-pc.cjs`; la sesión no lo repite a mano.

1. Clona el repo del kit **completo y con tags** a una carpeta temporal y se para en el último tag anotado (nunca en la punta de `main`).
2. Corre el `preparar-pc.cjs` **de ese clon** con `--plan`: no escribe nada, arma el plan.
3. **La pregunta**: te muestra el plan, lo que encontró editado a mano (con su diff) y la carpeta de proyectos que detectó: *"¿Lo aplico,
   con los proyectos en `<carpeta>`?"*.
4. Con tu sí lo aplica y te pega **una tabla** (`✓ / ✗ / ⚠ · qué · cómo se arregla`) y la salida del `doctor`. Termina con
   **"reiniciá Claude Code"**.

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
- **`~/.claude/kit-pc.md`**: la ficha de la PC (entorno, `gh`, carpeta de proyectos, capa privada, modo).

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

- Una línea por chequeo (26), siempre en el mismo orden: `✓ / ✗ / ⚠ · qué · cómo se arregla`. Debajo, el **inventario de frenos** del
  repo (las líneas `inventario ·`).
- Mira, entre otras cosas: la versión de Claude Code, `gh`, gitleaks, los hooks de la PC, copias del kit, frenos vencidos, el
  pre-commit y la ficha del repo, y las variables de la capa privada (por nombre).
- Sin red o sin poder correr algo: `⚠ NO VERIFICADO: <por qué>`, nunca ✓. Los `⚠` no traban; cada `✗` dice cómo se arregla.

NO VERIFICADO: que encuentre la ruta de la app de escritorio de Claude Code (con la app abierta tiene que decir `claude-code ✓`).

---

## 5. La flota: poner al día y adoptar

El Arquitecto deriva estos pedidos acá. Los corre `actualizar.cjs`, un script determinista: nadie corre en bypass, y **tu carpeta de
trabajo nunca se toca** (todo pasa en clones temporales del repo remoto).

### "Poné al día la flota" (o "poné al día X")

`actualizar.cjs flota <X>… | todo --canon <repo del kit> [--proyectos <carpeta>]`. Por cada repo, uno detrás del otro:

1. Clona el kit en su último tag y **un clon temporal** del repo.
2. **Saltea con su porqué** el que tiene obra en curso (ramas `modulo/*` vivas), el que ya está al día y el que ya tiene su rama
   `kit/<versión>` esperando.
3. En la rama `kit/<versión>` aplica el kit pieza por pieza según la ficha del proyecto (`.claude/kit.md`), commitea y corre el
   **chequeo** (nueve líneas). El commit y el push los juzgan los frenos del molde nuevo.
4. **Verde** → la rama por defecto avanza con un commit del kit. **Rojo** → nada llega a la rama por defecto: queda la rama `kit/…`
   con un commit `kit: ROTA — <qué falló>` (la próxima vuelta la rehace). **Push rechazado** (rama protegida) → la rama queda
   "te espera".

Te devuelve **una tabla** (mezclado · salteado con su porqué · ROTA · te espera) y la lista "te espera:".

**Lo que adaptaste en un proyecto no se pisa**: si la pieza tiene su porqué, se fusiona sola; si no, queda en `.claude/fusiones/` del
proyecto y la próxima vez que abras ese proyecto `/inicio` te hace **una** pregunta con el diff. (Abierto, para decidir: qué cuenta
como "porqué" hoy; está en Pendientes del tracker. NO VERIFICADO: la fusión con un `claude` real, todas las pruebas usan uno falso.)

Si la pestaña está en `auto` y el clasificador no la deja pushear, **la línea la corrés vos en tu terminal** (nunca en bypass).

### "Adoptá X" (un repo v2, sin ficha)

Un repo que todavía no tiene el kit v3 **se adopta, no se actualiza**. Va en dos tiempos:

1. **Mirar** (`actualizar.cjs adoptar <carpeta> --kit <clon del kit> --mirar --propuesta <archivo>`): no cambia nada. Deja una
   propuesta: la ficha que tendría el repo, qué piezas trae, cuáles son propias del proyecto y no se pisan.
2. **La pantalla, con vos delante**: la sesión arma el `NORTE.md`, el mapa, el plano de `docs/` y las reglas propias del proyecto
   como cambios. Vos das el OK.
3. **Aplicar** (`--aplicar <archivo>`, en un clon): dos commits (las piezas, la ficha), el chequeo de frenos en verde y push. Dentro
   del mismo OK, la **portada** (el README que se ve en GitHub, armado desde `NORTE.md`); si el repo ya tiene un README propio, queda
   como está y te avisa *"portada: README propio, queda apagada"*.

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
  `docs/kit-v3/SPEC-paquete-3.md`, `-6.md` y `-7.md`
