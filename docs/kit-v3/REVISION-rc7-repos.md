# La revisión de la rc.7: cómo le fue al kit en los siete repos que lo usan

> **Qué es**: el insumo que faltaba antes del plano de la `rc.7`. Lo pidió Guido el 2026-11-12, en la sesión 4 de la revisión
> ("revisemos los repos de mi cuenta que ya tienen el kit… cómo les fue, si hay anotaciones"). Lo escribió la madre; es un acta:
> no se reescribe.
>
> **Cómo se hizo**: los repos con `.claude/kit.md` en la cuenta de Guido y en la organización del trabajo (siete, todos en
> `3.0.0-rc.6`), clonados de solo lectura en una carpeta temporal; seis lectores (cinco en Sonnet y Hermes-desktop en Opus), uno por
> repo, con el mismo brief: línea de tiempo, lo que el proyecto escribió del kit, las piezas tocadas a mano, `frenos.log`,
> `.claude/cambios/`, dónde tuvo que intervenir el dueño y lo que anduvo. **Sin las conversaciones** (no están en esta PC): solo git
> y los papeles. Deptos ya estaba revisado (sus dos noches): acá entra lo que no se miró, más su `docs/metodo/para-el-kit.md`, que
> el proyecto escribió el 2026-11-12 para el kit.
>
> **Privacidad**: vibe-kit es público y cinco de estos repos son del trabajo. Acá va solo el comportamiento del kit, en abstracto.

## En criollo

1. **El kit anda, y cuando se usa entero rinde**: Millennium sacó dos módulos y dos versiones en una jornada (25 encargos), el Hub
   un módulo con seis obreros en un día, Deptos tres módulos. En los siete repos hay **cero `--no-verify`**: nadie esquivó el candado.
2. **Pero se usa entero en tres de siete.** Hermes-desktop, HermesMobile y los dos Arti adoptaron y trabajaron sin director ni
   encargos. **El `/tramo` del kit tiene cero usos en los siete**: el que Guido usó tanto en Hermes es el casero, el de antes del
   kit (junio al 2026-11-03). La decisión de quedárselo (REJ-017) sigue en pie, pero el `/tramo` del kit nunca se probó en un
   proyecto grande.
3. **Lo que más se repite es nuevo para el plano: la adopción.** En cinco de siete repos la adopción dejó algo roto o muerto sin
   avisar (un arranque que no vino, un hook viejo vivo, los rituales propios perdidos, un `pnpm install` que apaga los frenos de
   git) y en cinco la ficha dice algo que el proyecto no es (que no publica, que no gasta plata, que no tiene `/smoke`).
4. **Lo segundo: después de integrar nadie cierra el proyecto.** En Millennium el handoff que se inyecta en cada chat es de julio;
   en Deptos y Hermes quedó viejo. Va con la parte 1 de la `rc.7` (la noche termina sola) y la 3 (`/estado`).
5. **Lo tercero: más falsos positivos de los frenos, con nombre y apellido**, y **dos agujeros** nuevos (una bandera abreviada pasa
   el freno de producción; un merge de mentira deja borrar cualquier rama). Van a la parte 6 y a la 2, con red team.

## Cuánto se usó

| Repo | Adoptó | Commits desde | Director y obreros | Encargos | `/tramo` del kit | Noches | Candado |
|---|---|---|---|---|---|---|---|
| Deptos | 11-09 | 436 | sí (`pulido`, `cola`, `whatsapp`) | 49 | 0 | 2 | prendido |
| Millennium | 11-10 | 228 (una jornada) | sí (`puesta-a-punto`, `escenas`) | 25 | 0 | 1 declarada, con Guido a ratos | apagado desde la adopción |
| dashboard (el Hub) | 11-05 | 60 | sí (`puesta-a-punto`) | 7 | 0 | 0 | apagado ("hasta migrar") |
| Hermes-desktop | 11-04 | 80 | no (`cashflow` quieto en diseño desde el 11-04) | 0 | 0 | 0 | apagado |
| HermesMobile | 11-05 | 44 | no | 0 | 0 | 0 | prendido (11-05) |
| Arti-bot | 11-05 | 28 | no (`director: no` en sus dos módulos) | 0 | 0 | 0 | — |
| Arti-analytics | 11-04 | 3 | no (proyecto de ritmo mensual) | 0 | 0 | 0 | — |

Los cierres de tramo se hicieron siempre como un encargo de obrero (en Millennium, 5 de 25 encargos: el 20 %, puro papel).

## Lo que se repite en varios repos

### A. La adopción deja cosas rotas o muertas sin avisar (5 de 7) — **nuevo para el plano**
- **El Hub**: el arranque apuntaba a un hook que no vino, el test de estructura leía el hook viejo, `comando-test` quedó `npm test`
  en un proyecto `pnpm` y `.githooks` no estaba en lo que ignora el linter. Se descubrió en la sesión siguiente y costó ~1 h a mano
  (`puesta-a-punto/bitacora/2026-11-06-evidencia-05.md`, "Nota para el kit"). **Alta**.
- **Arti-bot**: su `package.json` tiene un `prepare` que pone `core.hooksPath` en su carpeta propia en cada `pnpm install`, y el
  `comando-setup` de la ficha es justo ese; `git-seguro` niega todo git si `hooksPath` no es `.githooks` (dos negaciones
  `hooks-path-ausente`). **Alta** para cualquier fork o repo con un `prepare` así. Y sus `/inicio` y `/cierre` propios (commit
  acotado por una carpeta personal intocable, chequear que el servidor coincida con el commit) **se pisaron con el molde sin pasar a
  la zona propia**: la zona quedó con el texto de relleno.
- **Hermes-desktop**: quedaron vivos los hooks viejos del proyecto: **8 procesos por comando, 3 de ellos PowerShell** (la mirada 2
  contó 4 en Deptos); uno con `exit 0` en la línea 1, otro mudo, otro que repite casi todo `git-seguro`; y en `settings.json` ~100
  reglas `_deny_APAGADO` y las claves de una "puerta" vieja. El D2 de permisos sacó `git merge` y `push --force` de `ask` en
  silencio (lo cazó el TODO del proyecto; probablemente ya lo tomó la `rc.6`, u13).
- **Deptos**: el hook de arranque propio quedó en disco sin registrar, y después se gastó un ciclo entero de `cambios` (obrero negado
  tres veces, propuesta, firma) editándolo como si fuera el vivo.
- **Arti-analytics** (en la `rc.3`): un hook con el mismo nombre que el del kit hizo que `settings` siguiera apuntando al viejo; se
  arregló con un cambio firmado. En la `rc.6` ya no pasa.
- **El patrón**: la adopción reemplaza piezas propias, pero no dice cuáles retiró ni verifica que el repo quede andando (arranque
  presente, `comando-test` que corre con el gestor de paquetes del repo, `hooksPath` que se sostiene después del setup).

### B. La ficha dice algo que el proyecto no es (5 de 7) — **nuevo para el plano**
- **Publica y la ficha dice que no**: Millennium tiene `release.yml` por tag y un actualizador que manda el `.exe` a dos PCs, y la
  ficha dice `release: no`; el director inventó cómo sacar la versión, el push del tag lo frenó el clasificador y se destrabó con una
  regla a mano en el settings de usuario, con "borrarla" colgando en "Te espera". Arti-bot tiene `release: [pm2 restart]` y el
  deploy real es `docker compose` por ssh desde antes de adoptar.
- **Gasta plata o sale afuera y la ficha dice que no**: Arti-bot manda mensajes a clientes reales con costo por mensaje y la ficha
  dice `plata: no`, `sale-afuera: no` "de fábrica"; los frenos de costo los armó el proyecto en un script propio.
- **Piezas propias que la ficha no ve**: `/smoke`, `/release`, `/gate` propios en HermesMobile, el Hub y Millennium (la ficha dice
  `smoke: no`); en Millennium el `/smoke` está vencido (cita un archivo que ya no existe) y tres scripts propios no figuran.
- **`molde+propio` que no es propio** (4 repos): `inicio` y `cierre` marcados así con el archivo idéntico al molde y la zona vacía.
  El estado sale de que la pieza *tiene* zona propia (`kit.ejemplo.md`), no de que se haya tocado: quien cuente "piezas tocadas" las
  infla. Y el hash se calcula distinto con CRLF (Windows) que con LF (git).

### C. Después de integrar, nadie cierra el proyecto (3 de 7) — **refuerza la parte 1 y la 3**
- **Millennium**: después de la adopción **nunca se corrió el `/cierre` del proyecto**. El handoff que se inyecta en cada chat nuevo
  es del 2026-07-29 ("último release v1.5.2"; ya salieron v1.5.3 y v1.6.0); el CHANGELOG no tiene los dos módulos; los pendientes que
  el módulo dejó "para el `/cierre` de la rama por defecto" no están en el TODO. `integrar` no toca los papeles de `main`: el estado
  vive solo en el README de cada módulo.
- **Deptos**: el handoff dice "Guido lee el reporte final… después `cerrar cola`", y después hubo cuatro commits y un módulo nuevo.
- **Hermes-desktop y el Hub**: el "Te espera" del handoff pide decidir cosas ya decididas; el mismo pendiente en tres lugares.

### D. Frenos que niegan lo inocente: la lista con nombre y apellido (6 de 7) — **refuerza la parte 6**
- **El `.env` de la base de prueba**: en Deptos, 10 de 11 negaciones `archivo-deny` son el `.env` de una base local en Docker con
  datos ficticios, que la ficha declara `clase: prueba`; el obrero no pudo saber a qué banco apuntaba. El freno no lee la ficha.
- **Claves ficticias**: `conexion-con-clave` (la clave de fábrica de una base local) y `jwt` (uno inventado para probar "un token
  que no es de nadie"): dos de los "cuatro frenos que valieron" de la mirada 2 parecen falsos positivos según la evidencia del
  propio obrero. Quedan como protección real `imprime-variable` y `matar-por-nombre`.
- **Leer `.claude/`**: el freno de "frenos del proyecto" niega también lecturas (`sed` de lectura, correr un hook para probarlo):
  Deptos 4 veces, el Hub 3.
- **Borrar ramas** (4 repos): en Hermes-desktop un módulo que entró aplastado o por cherry-pick **no se puede borrar nunca** (el freno
  mira la ancestría; 5 negaciones); en el Hub el pre-push negó `push --delete` aunque el `## AUTORIZADO` del encargo lo listaba
  (borró 18 de 19 locales y el resto fue a mano del dueño); en Millennium una rama de prueba para ver el CI en rojo; en Deptos una rama
  temporal del propio obrero; en Arti-bot "el hook no deja borrarlas desde acá".
- **`restaurar-arbol`** sobre un gate que reescribe archivos (Millennium ×3) y con rutas con `()` o `[]` (Deptos ×2).
- **Un freno de proyecto que busca texto**: el de WhatsApp de Deptos niega a toda sesión que nombre el dominio, incluso para escribir
  docs (y suma otro hook al `Bash|PowerShell`).

### E. Dos agujeros de los frenos — **nuevo, va con la parte 2 y red team**
- **Una bandera abreviada pasa el freno de producción** (HermesMobile): la ficha pregunta por `migraciones.py --produccion`, pero el
  script usa `argparse`, que acepta `--prod`; el contrato de `sensible` es "cada bandera tal cual". Lo cazó el Arquitecto leyendo,
  no un freno. Vale para todo CLI que acepte prefijos (argparse, click, getopt_long). **Media-alta**.
- **`git merge -s ours` vence a `push-borrar`** (Hermes-desktop): hace "mergeada" cualquier rama sin traer su contenido, y el freno
  la deja borrar. Allá fue a pedido del dueño; cualquier sesión puede hacerlo. **Media**.

### F. Pruebas y recursos compartidos entre obreros (4 de 7) — **refuerza la parte 6**
- `presentar` pasó sus 600 s con tres obreros en paralelo y la base quedó NO VERIFICADO (el Hub: 02, 03, 06; Deptos: 15, 82).
- **Una base de datos local para todos los worktrees** (HermesMobile: las pruebas de base corren "de a un worktree").
- **El gate es el CI de GitHub** (Millennium, sin Rust en la PC): `presentar` y `verificar` corren el `comando-test` de la carpeta
  principal, no el de la rama; `integrar` con un merge local sin pushear le da 422 a la API y rojo siempre; se parchó un script propio
  con `--merge` y cada vuelta del obrero tarda 6-10 min de espera.
- **Los worktrees adentro del repo** duplican lo que recorre el árbol (un test de Hermes contaba todo doble; `flutter analyze` miraba
  las copias).
- Un `comando-test` que cambia en `main` pone en rojo seco las ramas abiertas (Deptos).

### G. El reparto de encargos y las barreras que el módulo necesita (3 de 7)
- **Un módulo que necesita un cambio de barrera lo descubre a mitad de obra**: en Deptos (`whatsapp`) el obrero paró por un hook que
  el módulo necesitaba; 74 min y dos encargos cancelados, aunque el spec ya lo anticipaba. En el Hub un encargo le dio a un obrero un
  paso que era del dueño (correr un resolver), paró y se canceló.
- Un cambio de barrera se propuso en la rama del módulo y se revirtió (Deptos; = ítem 41).
- **`tiempos.cjs contador`** da 0 desvíos con evidencias que listan varios, cuenta un commit del director como desvío de tres obreros,
  y deja de ver los encargos cuyas ramas se borraron (Millennium, el Hub): el director lo corrige a mano.
- `encargo.cjs cerrar` falla en Windows con "Directory not empty" y el director borra la carpeta a mano (el Hub).

### H. El candado no se prende en repos con historia (3 de 7) — **para la v3.1**
- Hermes-desktop: la regla de `docs/` choca con 261 citas internas y 216 de Mobile a un contrato; `candado: no` desde la adopción.
- HermesMobile lo prendió, pero costó un día de mudanza de documentos a mano, una regla nueva en el `CLAUDE.md` de los dos repos
  para tocar ADR viejos, y un clic del dueño por cada archivo de andamiaje (`andamiaje: con-ok-de-guido`).
- Millennium y el Hub quedaron con el `candado: no` de fábrica de la adopción ("apagado hasta migrar") y nadie lo prendió.

## Lo nuevo de un solo repo (bajo)

- **Arti-bot**: `CLAUDE.md` guardado en git como symlink con el texto adentro (de una edición en Windows); la adopción le sumó una
  sección sin detectarlo. Dos sesiones paralelas tomaron el mismo número de ADR. Un módulo solo de datos no se puede sellar sin
  entorno de prueba (el cambio para quitar el freno quedó `rechazado`; se declaró el entorno "en obra"); en el Hub se quitó con un
  cambio firmado. En el chat de VS Code un `!comando` no se ejecuta. `comando-test` corre la suite entera del proyecto de terceros.
- **Hermes-desktop**: falta una "prueba de vida" de los frenos (que el arranque mande un pedido que tiene que rebotar); la migración
  de los cambios viejos dejó en `propuesto` uno que estaba aprobado (la migración no puede fabricar una firma).
- **HermesMobile**: borrar dos archivos muertos con el ciclo de `cambios` fueron 4 commits; la mesa re-firmó 14 acuerdos en 14
  mensajes y 14 commits (falta firmar en lote) y solo ve lo commiteado.
- **El Hub**: la ayuda de `--kit` del resolver lleva a error; los commits directos a `main` de otras sesiones obligan al módulo a
  traer `main` una y otra vez; los moldes de `/cierre` y `/estado` citan rutas que el proyecto no tiene.
- **Arti-analytics**: `NORTE` y `MAPA` con los `[completar: …]` de la adopción sin llenar: el arranque inyecta un plano vacío.
- **Deptos**: `frenos.log` versionado se duplica y se desordena al mezclar ramas (la misma firma dos veces), e infla el conteo de
  `resumen.cjs`; dos directores vivos el mismo día se coordinaron por `main` y por Guido, sin la mesa.
- **Palabras que chocan**: "candado" ya era una pieza de HermesMobile; "kit" ya era una carpeta del Hub.

## Ya conocidos que se repiten (cuántos repos los sufren)

| Lo conocido | Repos |
|---|---|
| Publicar o deployar necesita al dueño | 5 (Deptos, Millennium, el Hub, Hermes-desktop, Arti-bot) |
| "Te espera" repartido y desactualizado | 5 |
| `frenos.log` versionado | 7 |
| `/inicio`, `/cierre` o `/director` sobre el tope de 8.000 (con la zona propia y CRLF: `/director` de Hermes 13,6 KB) | 5 |
| Aprobar solo desde la carpeta principal | 4 |
| Permisos del proyecto que no valen de fondo | 3 |
| La CORRECCION que no le llega al obrero; el obrero que no sabe a quién mandarle mensajes | 2 (Deptos, el Hub) |
| `/tramo` del kit sin usar | 7 |
| El ítem 14 (el `comando-test` del analytics contra la base real) | **ya resuelto por el proyecto** el 2026-11-05: salió de la ficha |

## Lo que anduvo bien (con evidencia en cada informe)

- **La zona propia funciona**: en Hermes-desktop (5 skills), HermesMobile y Arti-analytics lo propio se mudó con su origen y
  sobrevivió la actualización `rc.3` → `rc.6`; las skills difieren del molde solo en esa zona.
- **El ciclo de `cambios` deja rastro limpio**: propuesto → aprobado → aplicado con `sha`, en todos los repos que lo usaron; uno se
  probó con un señuelo que rebotó; otro quedó `rechazado` con su motivo.
- **Los obreros paran bien**: PARADAS limpias en lo irreversible (ramas, la tabla del TODO, la base real), sin insistir con lo negado.
- **Cero `--no-verify`** en los siete repos desde la adopción.
- **El Arquitecto Modo B saca un módulo en un día**: Hermes-desktop (`lector`: sellado, ensayo, producción con el clic del dueño), Arti-bot
  (`entorno-pruebas`), Deptos (`regla-periodo`), con sello, supuestos marcados y decisiones con fecha.
- **Otros lenguajes, sin trabas**: Flutter/Dart (HermesMobile: 601 tests, pgTAP, APK) y Rust con CI remoto (Millennium). Los hooks en
  `.cjs` solo piden `node`.
- **La mesa entre dos repos**: 14 acuerdos re-firmados con el mismo hash en Hermes-desktop y Mobile, y una mudanza coordinada en un día.
- **La vuelta con la madre**: el merge trabado de Hermes del 11-04 se reportó, se confirmó y se arregló en la `rc.5`.

## Lo que esto le cambia al plano de la `rc.7`

- **Una parte nueva, si Guido la quiere: "adoptar sin romper"** (A y B). Que la adopción liste las piezas propias que reemplaza y
  ofrezca pasarlas a la zona propia o retirarlas; que al final verifique que el repo queda andando (el arranque presente, el
  `comando-test` con el gestor del repo, `hooksPath` firme después del `comando-setup`); que detecte que el proyecto publica
  (`release.yml`, scripts de deploy) o gasta plata y lo pregunte en vez de poner "no" de fábrica; que declare las skills propias y que
  `molde+propio` diga solo lo tocado.
- **Refuerzos a partes ya decididas**: la 1 (la noche que termina sola corre el `/cierre` del proyecto en `main`, C); la 3 (`/estado`
  lee los papeles vivos, C); la 6 (la lista D y F: `clase: prueba` libera el `.env` de prueba, leer `.claude/` no es tocarlo, borrar
  ramas del propio obrero o autorizadas, `restaurar-arbol` con rutas raras, el gate remoto, el recurso compartido); la 2 y su red team
  (los dos agujeros de E); la 7 (`tiempos.cjs`, `cerrar` en Windows, el Arquitecto que marca "este módulo necesita un cambio de barrera
  o un paso del dueño" antes de lanzar obreros).
- **Para la v3.1**: prender el candado en repos con historia (H); la mesa en lote; probar el `/tramo` del kit en un proyecto grande.

## NO VERIFICADO

- Todo lo que pasó en sesiones sin commit: no hay conversaciones en esta PC.
- Si la noche de Millennium corrió sin Guido (el spec dice "modo noche" y hay decisiones suyas esa tarde).
- La causa de las negaciones `hooks-path-ausente` de Arti-bot (el `prepare` o la adopción).
- Si el hash de la ficha tolera CRLF; si el tope de 8.000 mide bytes o caracteres.
- Si en la `rc.6` el pre-push todavía frena un merge que trae un `.gitleaksignore` de `main` (visto con la `rc.3`).
- Si el compañero de Guido corrió los rituales del kit en el Hub (tres commits suyos, automáticos).
