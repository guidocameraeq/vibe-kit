# Diseño · Racimo F: seguridad por defecto

> **Misión 4, tramo 4** · 2026-10-22 · **Estado: decisiones aprobadas por Guido en bloque y revisadas** (un revisor
> frío y un lector de gentle-ai: 26 hallazgos, 24 aplicados, 1 fundido, 1 descartado; §22). Tres correcciones de
> Guido antes de la revisión: las barreras son del proyecto, usar sin ver, y "con permiso, igual con red". Es solo
> diseño: se construye en la misión 5. Se mide contra el norte y los 11 criterios del [PLAN](PLAN.md).

## 1. Para qué es este racimo, en una línea

**Que un agente no pueda leer, pegar ni subir un secreto, ni borrar trabajo, aunque corra solo de noche en modo
bypass; que use las credenciales sin verlas; y que Guido se entere si alguien apagó un freno, sin tener que mirar.**

## 2. Lo que decidió Guido (2026-10-22)

1. **Las barreras son del proyecto, no del kit.** El molde trae pocas, de fábrica; cada proyecto las cambia por
   pedido de Guido al Arquitecto, para siempre o con fecha, y queda en la ficha. Nunca se le vuelven a imponer.
   *Evidencia*: en Hermes, una base dummy descartable a la que quería dar lectura y escritura libre, y no pudo sin
   pelear una semana con los permisos; "ya la tenés, no me molestes con eso" 4 veces en una noche (H-33, ~30 frenos
   sobre lo ya autorizado); un obrero trabado 1,5 h de noche por un permiso (radiografía A.4).
2. **Usar sin ver.** Los agentes tienen que poder correr migraciones y consultas con la credencial de la base sin que
   la credencial pase por el chat ni por sus ojos. Hoy las consultas las corre Guido a mano, "y es un bajón".
   *Evidencia*: H-34 (Claude se negaba a tipear una credencial pero la imprimía; ~23 episodios en 3 PCs); lo que
   contó Guido el 2026-10-22 (sin número en la tanda: entra con la fecha de hoy como cicatriz).
3. **Con permiso, igual con red.** Cuando Guido autoriza algo peligroso (escribir en una base real, migrar,
   borrar), el "sí" saca la pregunta, no la red: se hace por el comando del proyecto, con foto antes, en
   transacción cuando se puede, con rastro, y con una revisión antes de aplicar.
4. Lo demás lo propuso Claude a partir de eso y Guido lo aprobó en bloque; los ajustes de la revisión se pasaron por
   el filtro de cuatro preguntas del PLAN antes de aplicarlos (§22).

## 3. Hoy (la ficha de una pantalla)

| Qué | Hoy | De dónde |
|---|---|---|
| Barreras en el molde | 12 reglas `allow`, **0 `deny`, 0 `ask`**. Y el molde se contradice solo: el `/cierre` ofrece `stash`, el `allow` de `git push:*` pre-aprueba `--force`, el `_LEEME` dice que lo destructivo "queda en preguntar" | [FLOTA](FLOTA.md) §5 · `settings.template.json` · `cierre/SKILL.md` l.42 |
| Proyectos con `deny` | 2 de 10, puestos a mano; en uno, las barreras están **apagadas desde septiembre** y un comando ya esquivó la única viva (era "preguntar": el bypass saltea las preguntas) | FLOTA §5 · radiografía §6.6 |
| Alertas abiertas | **12** (detalle en el archivo privado): credenciales por el chat, una skill con un login, datos reales compartidos antes de avisar, rotaciones pendientes, un script que cayó a los valores de producción sin su config (pasó de verdad el 18/10) | [TABLERO](TABLERO.md) §1 · A.4 |
| Frenos que molestan | ~30 sobre lo ya autorizado (H-33) · ~25 cierres con falsas alarmas del escáner (S-M-14) · reglas solo para Bash rodeadas por PowerShell o por Write (P12, H-161) | TABLERO §8 |
| Hook anti-secretos | Existe en la PC `Usuario`, global, 10 patrones, exit 2 con alternativa. **Lo armó Guido a mano; nada del kit lo instala en las otras PCs** (el playbook §2.4 dice "se recrea en cada PC"). Mira solo `Bash` y `PowerShell`: **lo que se escribe con Write o Edit no lo ve** (comprobado el 2026-10-22 en `~/.claude/hooks/anti-secretos.js`). Su alternativa ("escribilo en un archivo local") se muerde la cola en cuanto cubra Write | H-161 · playbook §2.4 |
| Permisos globales de esta PC | `defaultMode: auto`, sin `deny` | `~/.claude/settings.json` |
| Escáner de secretos | gitleaks 8.30 instalado acá; 0 reales en las 3 PCs (ADR-022). vibe-kit lo corre "a mano" antes del push: **no está en ningún `/cierre`** | ADR-022 |
| Reglas en prosa del molde | `CLAUDE.template.md` restricción 2: "secretos nunca en el chat ni en comandos — viajan por archivo local". Sin freno mecánico | kit |
| `.gitignore` | El molde no trae ninguno; el Arquitecto edita el del scaffolding (sin `.env*`) | `arquitecto/SKILL.md` paso 3 |
| Un control cegado | Un implementador dejó ciego un detector de credenciales para cumplir un criterio (H-146); un cambio de método rompió un control propio 2 veces en una semana | radiografía §6.6 · A.4 |

## 4. Lo verificado contra la doc oficial (2026-10-22, agente `claude-code-guide`, ~234 mil tokens)

Lo que sostiene el diseño. Cada línea tiene fuente; lo que la doc no dice está marcado.

- **`deny` frena en todos los modos, incluido bypass**: "Deny rules block in every mode, including `bypassPermissions`"
  ([permission-modes](https://code.claude.com/docs/en/permission-modes)). Las reglas `allow` no tienen efecto en bypass.
- **Ningún nivel anula un `deny`**: "If a tool is denied at any level, no other level can allow it"; las listas de los
  distintos niveles se suman; los `deny` del proyecto valen antes de aceptar el diálogo de confianza
  ([permissions](https://code.claude.com/docs/en/permissions)).
- **Un `deny` de lectura hace cuatro cosas**: niega leer, niega editar y escribir ese archivo (incluso crearlo), lo saca
  de las búsquedas y del descubrimiento de archivos, y cubre `cat`, `head`, `tail`, `sed`, `tee` y las redirecciones
  por Bash. **No cubre** `grep -r`, ni un programa que lea el archivo por adentro (Python, Node): esto es lo que
  permite "usar sin ver" (§8) ([settings-reference](https://code.claude.com/docs/en/settings-reference),
  [permissions](https://code.claude.com/docs/en/permissions)). Una regla `Write(...)` por ruta se acepta pero **no se
  consulta**: para bloquear edición sin bloquear lectura se usa `Edit(...)`. Las reglas usan la sintaxis de
  `.gitignore`: `./**/.env` cubre cualquier profundidad.
- **Los hooks también frenan en bypass**: "a hook that returns `permissionDecision: deny` blocks the tool even in
  `bypassPermissions` mode or with `--dangerously-skip-permissions`. PreToolUse hooks fire before any permission-mode
  check, in every permission mode" ([hooks-guide](https://code.claude.com/docs/en/hooks-guide)). Un hook niega con
  exit 2 y el mensaje por stderr, o con JSON (`permissionDecision: deny` + `permissionDecisionReason`): **ese mensaje es
  lo que Claude lee**, ahí va la alternativa. Un hook que calla no aprueba; un hook que aprueba no salta un `deny`.
- **Un hook ve lo que se va a escribir**: `Write` trae `tool_input.content`, `Edit` trae `new_string`, `Bash` trae
  `command`; `file_path` siempre absoluto ([hooks](https://code.claude.com/docs/en/hooks)).
- **El modo de permisos llega al hook** en `permission_mode` (`default`, `plan`, `acceptEdits`, `auto`, `dontAsk`,
  `bypassPermissions`). Está documentado para los hooks de herramienta; **para SessionStart la doc no lo lista**: el
  script lo trata como opcional (§15).
- **PowerShell no está en la lista de comandos que el `deny` de lectura reconoce** (la doc nombra solo los de Bash);
  PowerShell tiene sus propias reglas (`PowerShell(Get-Content *)`), que son patrones de texto, no una barrera
  ([permissions](https://code.claude.com/docs/en/permissions)). **NO LO DICE LA DOC** si `Get-Content .env` queda
  cubierto. En Windows con Git Bash, **un `deny` de `Bash(...)` apaga la herramienta PowerShell entera** para la
  sesión ([tools-reference](https://code.claude.com/docs/en/tools-reference)): el molde no trae reglas `Bash(...)`
  en `deny` (§6), así que no pasa.
- **`.claudeignore` no existe** ("it has no effect"). **En Windows nativo no hay sandbox** ni enmascarado de
  variables: la protección real es `deny` más hooks ([sandboxing](https://code.claude.com/docs/en/sandboxing)).
- `permissions.disableBypassPermissionsMode: "disable"` existe y se puede poner en cualquier nivel. **No se usa** (§16).

**No se pudo probar en esta PC** (no tiene el comando `claude` suelto; va al piloto): el hook anti-secretos corriendo
de verdad en bypass, y `Get-Content .env` contra el `deny`.

## 5. Barreras de archivos de fábrica (decisión 1)

En el `settings.json` del molde, que viaja por git. **Solo archivos**; sin ninguna regla `ask` (preguntar es solo
para las 5 cosas del [racimo A](DISENO-A-frenos.md) §2) y sin reglas `Bash(...)` (lo de git es un hook, §6).

*Nota de la misión 5, paquete 2 (2026-10-28, [SPEC-paquete-2](../kit-v3/SPEC-paquete-2.md), Cruces 19): hay **una** `ask` en el molde, sobre `cambios aprobar` (SPEC-0 6.8a, RF-3; decisión de Guido del 2026-10-27). Es la única excepción a "sin ninguna `ask`".*

```json
"permissions": {
  "deny": [
    "Read(./**/.env)", "Read(./**/.env.*)",
    "Read(./**/secrets/**)",
    "Read(./**/*.pem)", "Read(./**/*.key)",
    "Read(~/.ssh/**)", "Read(~/.aws/**)",
    "Read(~/.config/gh/**)", "Read(~/AppData/Roaming/GitHub CLI/**)"
  ]
}
```

- Un `Read` denegado también niega escribir, crear y buscar: con una regla por ruta alcanza. `./**/` cubre un
  monorepo (`apps/web/.env`); si hay monorepos en la flota hoy es **NO VERIFICADO**, el patrón no cuesta nada.
- **Me aparto de S-C-2** ("el `deny` de `.env*` deja legible el `.env.example`"): el `deny` no admite excepciones, y
  además Claude no podría crear ni mantener ese archivo. Lo público y lo de prueba vive en **un archivo con nombre
  no secreto** (`docs/referencia/PRUEBA.md`; nombre fijado por B §4 el 2026-10-22), que es lo que pedía S-D-2 ("4 'ya la tenés' en una
  noche"); los **nombres** de las variables viven en la ficha (`secretos:`, §9). Un `.env.example` o un
  `.env.development` con valores públicos (Vite, Next) puede seguir existiendo para los humanos y las herramientas;
  Claude no lo lee ni lo mantiene.
- **De la lista de gentle-ai** (REFERENCIAS §1; `internal/components/permissions/inject.go`, leído el 2026-10-22)
  se toma la idea y se recorta: fuera `Library/Keychains` (Mac), `rm -rf /` (la plataforma ya lo frena sola y
  ningún hook ni `allow` lo aprueba) y sus `Edit(...)` duplicados (el `Read` ya los cubre); `*.p12`, `*.pfx` y
  `.credentials/` quedan afuera hasta que haya cicatriz (regla 1 de A). Se agrega la config de `gh` en Windows.
- Lo que el proyecto quita de esta lista queda en `frenos.quitados` de la ficha (§14) y el actualizador **lo
  respeta por regla** (merge a tres puntas de [E](DISENO-E-molde-y-flota.md) §5). No es el "sembrar solo si falta"
  de gentle-ai, que no distingue una regla quitada a propósito de una lista que nunca existió.
- La lista es corta a propósito y crece solo con cicatriz (regla 1 del racimo A).

*Qué cambia para Guido*: Claude no puede leer ni pegar un `.env` ni una clave aunque esté en bypass, y el "ya la
tenés" se contesta leyendo el archivo público.

## 6. Git que borra trabajo: el hook de Desktop (decisión 2)

Ya es corrector de fábrica por el racimo A (§6). F elige la forma: **el hook de Desktop (CM-65: stash, `reset
--hard`, `clean -f`, restaurar el árbol; restaurar un archivo nombrado pasa; Bash y PowerShell; 200 casos; medido
contra ~36.000 comandos)**, con `push --force` sumado a su lista. Entra como pieza del molde (`hooks/git-seguro.js`).

- **Sumar `push --force` no es "tal cual"**: por la receta de A §5.2 se vuelve a medir contra el historial antes de
  instalar, y la prueba de casos incluye el caso nuevo.
- No se duplica con reglas `deny`: un freno en dos lugares es la contradicción que A §5.6 prohíbe (Desktop tuvo
  `git stash` prohibido y pre-aprobado a la vez). Que el hook frena en bypass está verificado en la doc (§4).
- **El molde se corrige para no contradecirlo** (misión 5, parte de esta pieza): el `/cierre` deja de ofrecer
  `stash` (edge case de la línea 42: queda "commit selectivo o dejar sin commitear y anotarlo"), el `_LEEME` del
  `settings` dice que el hook manda sobre el `allow`, y `Bash(git push:*)` se deja porque el hook frena el `--force`.
- **El actualizador de E §6.2** rehacía una rama `kit/*` rota "desde `main`", y eso pedía `push --force`: ahora
  **borra la rama y la sube de nuevo**, sin force.
- **El hook lee `frenos.quitados` de la ficha** del proyecto (§14): un proyecto personal donde el push es libre no
  tiene que editar el hook ni marcarlo como adaptado.
- *Revisión integral (2026-10-26)*: **cortar procesos por nombre** (`taskkill /IM <nombre>`, `pkill <nombre>`) entra al mismo hook como caso
  nuevo, con la alternativa "por PID": siguió en `allow` y mató procesos de otras sesiones en cuatro lotes del acta de contraste (L30, L40,
  L52, L63). Era prosa en G §22 y TABLERO §6; se repitió, así que se vuelve mecánica. Se mide contra el historial antes de instalar (A §5.2).

*Qué cambia*: nada visible; lo que vivía en un solo proyecto viaja con el molde.

## 7. Un solo corrector de secretos por PC (decisión 3)

El hook anti-secretos que ya existe en la PC `Usuario`, con cinco cambios:
1. **Cubre `Write` y `Edit`** además de `Bash` y `PowerShell`: mira `content` y `new_string` con los mismos patrones.
   Cierra el agujero de H-161 (un subagente bloqueado en Bash escribió lo mismo con Write) y el que se comprobó hoy
   en esta PC. **Antes de instalarlo se mide contra los Write y Edit reales de los chats** (receta de A §5.2): el
   patrón de JWT dispara con la llave pública de Supabase, que es justo lo que va a `docs/referencia/PRUEBA.md`. Lo que la
   ficha declare como llave pública (`datos-de-prueba:` y `publicas:`) no frena.
2. **El mensaje cambia**: hoy dice "escribilo en un archivo local fuera del repo", y con Write cubierto esa salida
   la bloquea el mismo hook (loop, y termina en pregunta). Nuevo: *"no lo escribas ni lo pegues: pedile al humano
   `cargar-secreto NOMBRE` y usá el comando del proyecto o la variable"*. La restricción 2 del `CLAUDE.template.md`
   ("viajan por archivo local") se reescribe igual.
3. **Lo instala el Equipador** en cada PC ("preparame esta PC", E §10), y `doctor` chequea que esté registrado y
   **que coincida con el del kit**: si el usuario lo editó, se respeta y se reporta, nunca se pisa (criterio de
   gentle-ai para sus hooks viejos). Un implementador cegó un detector una vez (H-146) y un cambio de método rompió
   un control propio dos veces en una semana (A.4). Deja de ser "se recrea a mano": era el hueco de portabilidad
   (criterio 8).
4. **Aplica la lista de archivos del `deny` a los comandos** que el `deny` no reconoce: `Get-Content`, `type` y
   `cat` por PowerShell, `grep -r` y `python -c` con la ruta por Bash. Lee las 9 rutas de fábrica más el
   `settings.json` y `settings.local.json` del proyecto (`CLAUDE_PROJECT_DIR`). **Es un patrón de texto, no una
   barrera** (§21): cubre los casos conocidos, y el piloto mide si alcanza. Si el piloto muestra que el `deny` ya
   frena PowerShell, esta parte se saca.
5. **Lee `frenos.quitados` de la ficha** (§14): un proyecto puede exceptuar un patrón (por ejemplo, el de JWT en un
   proyecto con Supabase), con razón y rastro. Lo que no puede un proyecto es apagar el hook entero sin que
   `doctor` lo liste cada vez.

Sigue global (`~/.claude/`): un secreto es un secreto en cualquier proyecto. Cada frenada escribe una línea en el
registro de frenos (A §4). Su prueba de casos incluye, por regla, que el mensaje de la frenada trae la alternativa
(idea de gentle-ai: un rechazo que no dice la salida lleva al agente a rodearlo).

*Qué cambia*: las 3 PCs con el mismo freno sin que Guido lo arme.

## 8. Usar sin ver (decisión 4, corrección de Guido)

El `deny` le tapa los ojos a Claude, no las manos: un programa que Claude corre sí lee el `.env` (§4). Entonces
**cada proyecto trae comandos propios que cargan la credencial por adentro**, y Claude usa el comando:

| Comando (contrato) | Qué hace | Con qué credencial |
|---|---|---|
| `db consulta "<sql>"` | Consulta de solo lectura, salida tabulada | Un usuario de **solo lectura** de la base real; cualquiera en una dummy |
| `db migrar` | Aplica las migraciones pendientes, con red (§13) | La de escritura, cargada solo mientras corre |
| `db foto` | Copia verificada de la base (bytes y filas, no "exit 0") | — |
| `deploy`, `smoke` | Los contratos que ya tiene el molde | Lo que cada uno necesite |

- Es un **contrato adaptable** (`templates/adaptables/db.contrato.md`), como `smoke` y `deploy`: el Arquitecto lo
  instancia por stack (psql, sqlite3, supabase, prisma). **Nace cuando el proyecto tiene base**, no el día cero
  (como `/smoke` y `/release`, E §11); adoptar lo ofrece si encuentra una. En la ficha es `piezas: db: propia`.
  **La regla de 3+ se cuenta con `flota.py`** en el piloto: hoy es evidente que casi todos tienen base, pero
  **NO VERIFICADO** cuántos.
- El comando lee la credencial de la variable de entorno o del `.env`; **nunca la imprime**, ni en un error (si la
  conexión falla, dice "no pude conectar con `DB_URL`", no el valor). Para probar la conexión sin ver nada:
  `db consulta "select 1"`.
- "Solo lectura" en la base real es **por convención del comando y por el usuario de la base**, no "por
  construcción": la credencial de escritura vive en el mismo `.env` y cualquier programa la lee. La defensa de
  fondo es que Claude no tiene el valor y que lo que escribe pasa por §13.
- Es la regla vieja del playbook §2.5 ("comandos legibles reducen más frenos que las allowlists"), llevada al molde.
- *Revisión integral (2026-10-26; P60 y P65 del acta de hábitos, aprobadas por Guido)*: **antes de pedirle a Guido un paso a mano** (una
  consulta, abrir el `.exe`, tocar el teléfono, copiar un valor) **el agente dice en una línea por qué no lo puede hacer él** (herramienta,
  permiso, credencial) y, si puede, lo hace (en 3 de 13 casos terminó haciéndolo: binario, adb, portapapeles). Cuando la prueba sí es de
  Guido, va **con guion numerado** (qué hacer, qué tiene que ver en cada paso, "listo" alcanza) y **al "listo" el agente lee el resultado
  solo** (logs, base por `db consulta`, respuestas del bot), con esa lectura autorizada en la ficha del proyecto, sin pedir permiso cada vez
  ("te doy permiso para que leas las respuestas" se repitió en ~35 pedidos de 12 chats). Lo que hoy Guido corre y pega a mano contra
  producción (~15 mensajes y ~35 min por lectura, L67) lo corre el obrero por este contrato.

*Qué cambia*: las migraciones y las consultas las corren los obreros solos. Guido deja de ser el que tipea el SQL.

## 9. Dónde vive cada credencial, y la ficha (decisión 5)

| Credencial | Dónde vive | Quién la carga | Claude |
|---|---|---|---|
| Del proyecto (base, APIs del proyecto) | `.env` del proyecto: ignorado por git, con `deny` de lectura | El humano, con `cargar-secreto` | Conoce el **nombre** de la variable; la usa por los comandos de §8 |
| De la persona o la PC (`gh`, la del Hub) | Variable de entorno del sistema, como ya se decidió para la del Hub (E §9) | El humano, con `cargar-secreto` | Ídem |
| Claves SSH | `~/.ssh/`, jamás en el proyecto (playbook §2.6) | El humano | `deny` de lectura |

- **`cargar-secreto`** (script del kit, Bash y PowerShell): pide el nombre, pide el valor **con entrada oculta** (lo
  que funcionó en la PC `Usuario`, H-34), lo escribe en el `.env` del proyecto o en la variable del sistema, y no lo
  imprime nunca. Corre el humano. Claude le dice "corré `cargar-secreto DB_URL`" y espera. En Windows, una variable
  del sistema nueva se ve recién en la próxima sesión: el script lo dice.
- **Nunca en el chat**: la regla de prosa del molde queda (reescrita, §7.2), pero ya no es la única defensa: Claude
  no tiene el valor.
- **El molde trae su pedazo de `.gitignore`** (`gitignore.snippet`): `.env`, `.env.*`, `*.pem`, `*.key`, `secrets/`,
  `settings.local.json`, `launch.json`. Sin excepción para `.env.example` (§5). El Arquitecto lo agrega al del
  scaffolding (paso 3 de Modo A, que hoy no lo trae).
- **La ficha del kit** (`.claude/kit.md`, E §4) suma al bloque `sensible:` de A:

```yaml
secretos: [DB_URL, HUB_TOKEN]        # nombres, nunca valores; dónde vive cada uno lo dice el comando
publicas: [SUPABASE_ANON_KEY]        # lo que parece secreto y no lo es: el corrector no lo frena
entornos:                            # cada base o servicio, con su nivel (§12)
  - {nombre: supabase-prod, clase: real,  acceso: "db (solo lectura)"}
  - {nombre: dummy-local,   clase: dummy, acceso: "db (todo)"}
datos-de-prueba: docs/referencia/PRUEBA.md   # cuentas de prueba, llaves públicas: nombre no secreto (S-D-2); ruta fijada por B §4
push-publica: no                     # si es sí, /cierre lo dice antes de pushear (P49); nunca pregunta
```

*Nota de la misión 5, paquete 1 (2026-10-28, [SPEC-paquete-1](../kit-v3/SPEC-paquete-1.md)): `entornos:` no es la lista de mapas de
arriba sino **un mapa por nombre** (`entornos.<nombre>.clase`, `.herramientas`, `.acceso`), como fijó el SPEC-0 (RT2); la forma de arriba hoy
da error en el parser. Las herramientas se declaran una vez en `herramientas.<nombre>: {chequeo, necesita-guido}` y cada entorno las nombra
(decisión de Guido). Y el `id` de un freno quitado acepta una regla `deny` por su texto: `"deny:Bash(git stash:*)"` (§14).*

- **Después de escribir** `settings.json` o la ficha, el script relee y compara (en Windows un renombre puede "tener
  éxito" sin efecto; cicatriz de gentle-ai, y nuestras 3 PCs son Windows). Un `settings.json` con claves duplicadas
  no se toca: se avisa, porque una regla quedaría tapada.

*Qué cambia*: nunca más "pegame la clave". La carga una vez por proyecto y por PC en una pantalla que no muestra lo
que escribe.

*Nota de H (2026-10-25): tres cosas para esta ficha. (1) El `nivel:` de cada entorno pasa a **`clase:`** (`real · prueba · dummy`), para que `.claude/kit.md` no tenga dos campos `nivel:` con sentidos distintos (el del proyecto es `liviano | estandar`). (2) El `gitignore.snippet` suma **`.claude/worktrees/`**. (3) Lo que PLAYBOOK §1.5 exigía a lo grande o en producción (`RECOVERY.md` probado, `PROTECTED_PATHS.md`, `CRONS.md`) **no se pierde**: un entorno `clase: real` obliga a declararlos (la línea base "backups vacíos en verde" del criterio 4); dónde viven (`referencia/` de B §4) lo cierra la revisión integral. Y `cargar-secreto` que llega después de crear un worktree no lo alcanza: `worktree sync-env` vuelve a copiar `.worktreeinclude` ([DISENO-H](DISENO-H-niveles-y-puertas.md) §4, §10).*

## 10. El escáner antes del commit (decisión 6)

- **gitleaks sobre lo que se va a commitear** (`gitleaks git --staged --redact --no-banner`): mira solo lo agregado,
  tapa los valores, da `archivo:línea`. Es lo que pedían P20, P36 y S-M-14.
- Corre **en un solo lugar**: como hook de git versionado en el repo (`.githooks/pre-commit`), para que frene también
  un commit hecho fuera del cierre. El `/cierre` no lo corre dos veces: muestra su resultado. (Dos corridas sobre el
  mismo commit era el freno duplicado que §6 prohíbe.)
- **`core.hooksPath` no viaja por git**: lo setea **el hook de arranque del molde**, una sola vez y solo si está
  vacío; si el proyecto ya tiene uno (husky, lefthook; cuántos hay es **NO VERIFICADO**), encadena el pre-commit
  existente en vez de pisarlo. Así llega a cada clon y cada PC, no solo al clon temporal del actualizador.
- **Una falsa alarma se anota, el escáner no se apaga**: una línea en `.gitleaksignore` con la huella y la razón.
  Hoy: ~25 cierres con falsas alarmas y la respuesta era apagar o ignorar. **Y el ignore se vigila**: un agente
  podría callar un secreto real con una línea ahí (el cegado de H-146); el `/cierre` lista por script las líneas
  nuevas de `.gitleaksignore` y `.gitleaks.toml` con su razón, en la salida hacia Guido.
- **Datos personales (nombres, arrobas) quedan afuera**: es ruido puro. Un proyecto que lo necesite (la "lista de
  nombres que el PO da por fuera", P20) agrega su regla propia en `.gitleaks.toml`.
- **Un control que no pudo correr nunca sale en verde**: si gitleaks no está en la PC, el pre-commit deja pasar el
  commit pero el cierre lo dice en su línea de salida ("⚠️ sin escáner en esta PC: corré 'preparame esta PC'") y
  queda en el registro. `doctor` lo lista.
- Cubre también P14 (una skill nunca guarda credenciales): las skills viven en el repo y pasan por el mismo escáner.

*Qué cambia*: el cierre deja de gritar por nada; lo que grita es un secreto real, con archivo y línea.

## 11. Dos lenguas (decisión 7)

Todo freno de comando cubre **Bash y PowerShell** (P12): los dos hooks ya lo hacen. Para archivos, el `deny` es por
herramienta y no por shell, pero la doc no cubre `Get-Content` (§4): el hook anti-secretos aplica la misma lista
(§7.4), como patrón de texto, y el piloto mide si alcanza o si sobra.

## 12. Qué base es qué (decisión 8, ampliada por Guido)

Cada base o servicio se declara **una vez** en la ficha (`entornos:`, §9) con su `clase:` (antes "nivel"; nota de H):

| `clase:` | Qué es | Los agentes | Escribir | Borrar |
|---|---|---|---|---|
| **dummy** | Descartable; se puede perder | Leen y escriben libre, sin preguntar | Libre | Libre |
| **prueba** | De ensayo, con datos que importan algo (fixtures, cuentas de prueba) | Leen y escriben; `db foto` antes de migrar | Con foto | Con foto |
| **real** | Producción o datos reales | Leen por `db consulta` con usuario de solo lectura | **Sin preguntar, por §13** (con red) | Una de las 5 preguntas de A, salvo que la ficha diga otra cosa (§14) |

- **Escribir o migrar en una base real no es pregunta**: la lista de A §2 pregunta solo *borrar* datos reales, y
  dice "todo lo demás lo resuelven los agentes solos, producción incluida". La primera versión de este diseño lo
  convertía en pregunta sin decirlo; lo cazó el revisor.
- Si un proyecto **no tiene ensayo separado**, la ficha lo dice (`entornos: [{nombre: unica, clase: real}]`) y
  Claude lo sabe desde el arranque: es la pregunta que "nunca se hizo" (H-50: una suite mandó mails reales 5 veces en
  un día; un repo casi corre el seed en producción; "ensayo" nombraba dos bases distintas).
- **Dos reglas al molde** (prosa, con su cicatriz; se vuelven mecánicas si se repiten): *sin config, la app no
  arranca* (jamás cae a los valores de producción: S-D-5, pasó el 18/10), con su caso en el contrato de `smoke`
  ("arranca sin `.env` → falla"); y *acceso temporal a producción con fecha de borrado en el handoff* (S-D-12).
  *Revisión integral (2026-10-26)*: **la primera ya se repitió** (L16, L20, L28, L33 del acta de contraste; dos pedidos llegaron a
  producción sin escribir, y el 2026-10-20 copiar la config del ensayo mandó la app a producción, 1ba50ee4). **Pasa a mecánica**: el caso
  "arranca sin config → falla" es obligatorio en el contrato de `smoke` (el gate lo lee, D §12.2) y el chequeo de arranque de §15 marca
  rojo si la config de ensayo apunta a un entorno `clase: real`. Y F-4 se amplía como pedía el acta: `entornos:` cubre también
  **configuraciones y servicios de terceros** (un "ensayo" de un tercero resultó real), no solo bases.
- Las guardas de los scripts de `smoke` y `deploy` se escriben como **lista de lo permitido** ("ruidoso antes que
  mudo", S-M-8: 3 de 3 guardas desarmadas en la otra forma).

*Qué cambia*: una línea en la ficha en vez de pelear con los permisos una semana. Se le pregunta una vez por
proyecto, al montar o adoptar (E §7), no por sesión.

## 13. Con permiso, igual con red (decisión 9, corrección de Guido)

Una operación peligrosa en una base **real** (escribir, migrar, o borrar cuando Guido ya lo autorizó para ese
proyecto) no se hace a mano ni con un comando suelto. Pasa por el comando del proyecto, que:
1. **saca una foto verificada antes** (`db foto`: bytes y filas, no un backup de 20 bytes en verde, S-U-4);
2. **aplica en transacción o en seco** cuando el stack lo permite, y si falla, deja todo como estaba;
3. **deja rastro**: qué tocó, cuántas filas, con qué comando, una línea en el registro de frenos (A §4) y en el
   handoff;
4. **alguien revisa el plan antes de aplicarlo** (el archivo de migración, el SQL): **el director si el proyecto lo
   tiene; si no (nivel liviano, §14), un subagente fresco** que solo lee el plan y la foto. Nunca se traba ni sube a
   Guido. Dummy pasa directo; prueba, con foto; real, con revisión. El mecanismo de la revisión por riesgo lo fija el
   racimo D; F fija que para `real` es obligatoria y quién la hace cuando no hace falta director. *D (2026-10-23): es un sub-paso de **riesgo alto** y lo revisa el **revisor Opus** congelado en el SHA, no el director a mano ([DISENO-D](DISENO-D-director-obrero.md) §10).*

El "sí" de Guido saca la pregunta, no la red. Y si una de las 5 preguntas de A se contesta "sí" para un proyecto de
forma permanente ("en Hub, borrar datos reales no se pregunta"), queda en la ficha (§14) y entra por acá.

*Qué cambia*: Guido da el permiso una vez y duerme igual.

## 14. Las barreras son del proyecto (decisión 10, corrección de Guido)

- **Quién las cambia**: el Arquitecto, por pedido de Guido en criollo ("en este proyecto el push es libre", "la
  base dummy se escribe sin preguntar", "sacá el freno de stash acá"). Nunca un agente solo.
- **Un solo lugar**: `frenos.quitados` en la ficha (`.claude/kit.md`). E §4 tenía además un `quitado:` dentro de
  `piezas.settings`; se unifica acá (E queda corregido con una nota). Cada freno tiene un **id** fijo: una regla
  `deny` por su texto, un caso de hook por `hook:<nombre>/<caso>`, una pregunta de A por `pregunta:<cuál>`.
- **Los hooks y el actualizador leen ese campo**: el hook de git no frena un caso quitado; el corrector de secretos
  no frena un patrón exceptuado; el actualizador no repone una regla quitada (regla 3 de A). Sin esto, "quitar" era
  editar el hook y marcarlo adaptado.
- **`hasta:` es obligatorio y solo admite dos valores**: `siempre`, o una fecha (`2026-11-15`). Nada de "misión 3":
  ningún script lo evalúa. Si falta, `doctor` lo marca y el freno sigue puesto.
- **Cuando vence**, no lo grita el hook de cada sesión (sería una pregunta repetida, también a los obreros de
  noche): va a la salida única hacia Guido del [racimo C](DISENO-C-salida-hacia-Guido.md) como una línea de "te
  espera" ("el freno X venció el 15/11: ¿lo restauro o lo hago permanente?"). `doctor` también lo lista. El
  Arquitecto lo revierte en un pedido.
- **Los defaults por nivel** (racimo H): un proyecto *liviano* (sin código; el personal con código es `estandar`, H §4) arranca con push y merge libres y sin
  director; el molde solo escribe la ficha distinta. F deja el mecanismo; H pone los nombres.
- **Lo que no se puede quitar ni con pedido**: nada. Pero quitar el corrector de secretos entero o el escáner queda
  escrito en la ficha con fecha y razón, y `doctor` lo lista cada vez. Guido decide; el rastro queda.

```yaml
frenos:
  quitados:
    - {id: "hook:git-seguro/push-force",  por: "proyecto personal, el push es libre", hasta: siempre}
    - {id: "pregunta:borrar-datos-reales", por: "base dummy de la misión 3",          hasta: "2026-11-15"}
    - {id: "secretos:jwt",                 por: "la anon key de Supabase es pública",  hasta: siempre}
```

*Qué cambia*: lo que Guido cambió no se le vuelve a imponer, y lo temporal no se le olvida prendido.

*Revisión integral (2026-10-26; decisiones F-1 y A-1 reabiertas con el acta de contraste y cerradas con Guido).* El acta contradijo esta
decisión 172 a 27: **gran parte de los frenos que Guido sufrió no eran del proyecto sino del clasificador del modo `auto` de la plataforma**,
que negó lecturas y escrituras ya autorizadas por clic ("es la cuenta dummy, es para eso"; 5 frenos pese al clic el 2026-10-19; un obrero
parado ~2 h). Este diseño decía solo "el clasificador decide sobre lo demás" (§16). Lo verificado el 2026-10-26 contra la doc oficial
(`permission-modes` "How auto mode evaluates actions" y "When auto mode falls back", `auto-mode-config`, `hooks`; citas por WebFetch, se
copian de la página al construir): (a) **una regla `allow` estrecha de `settings` se resuelve antes de que el clasificador mire**; las amplias
(`Bash(*)`, `Bash(python*)`) la plataforma las tira al entrar en `auto`; (b) **el clasificador ignora el bloque `autoMode` del proyecto**: solo
lo lee de `~/.claude/settings.json`, de los managed settings o de `--settings`; sí lee el `CLAUDE.md`; (c) **si frena 3 veces seguidas o 20 en
total, `auto` se apaga solo y la sesión vuelve a preguntar**; (d) que un hook `PreToolUse` con `allow` evite al clasificador: **NO DOCUMENTADO**.
Lo decidido, en cuatro piezas:

1. **Dos capas con nombre**: las **barreras del proyecto** (`deny`, hooks, `frenos.quitados`: todo lo de arriba) y **los frenos del clasificador**.
   El diseño las distingue y cada una tiene su mecanismo.
2. **AUTORIZADO deja de ser un hook `allow` y pasa a reglas `allow` estrechas.** Un script del molde lee la sección AUTORIZADO del encargo
   (commiteada en la rama del módulo, que el obrero no escribe) y escribe las reglas en el `settings.local.json` del worktree del obrero,
   una por comando o ruta, nunca amplias. Es el camino verificado (a) y vale igual en `default` y en `auto`. **El hook queda solo para
   negar** (las 5 de A), que sí está verificado en todos los modos. Corrige D §7.3. *Riesgo residual*: el obrero puede editar su
   `settings.local.json`; el gate del cierre lo cruza contra el encargo commiteado y marca rojo si difieren.
3. **Lo que el clasificador necesita saber vive donde él lo lee**: el Equipador escribe en el `settings.json` de la PC el bloque
   `autoMode.environment` / `autoMode.allow` generado desde las fichas de los proyectos de esa PC (bases y servicios de `clase: dummy` y
   `prueba`), y el `CLAUDE.md` del molde declara los entornos de prueba del proyecto. Cómo se escribe ese bloque sin pisar lo de Guido: con
   la zona propia de E §5.
4. **De noche, nunca `auto`**: `bypass` con el hook de `deny` debajo (D §7.4). Por (c), tres negaciones del clasificador dejan un obrero
   colgado hasta la mañana.

**Y las dos pre-autorizaciones de A-1**: "mergear a `main`" y "escribir o migrar producción" no son pregunta (A §2). La ficha las lleva en un
campo `autorizado:` con default por nivel, **definido una sola vez en E §4**: liviano, libres; estandar (con o sin director), **merge solo con gate verde** (D §12) y **producción solo por
el comando con foto** (§13). *Cicatriz*: 13 clics de merge en una noche por una `ask` propia de Hermes con Guido al lado de la PC a las 00:26
(chat ★ 23f8dd9f, 2026-10-22). **Cómo se mide**: la pestaña "Recently denied" de `/permissions` es el registro del clasificador; meta, 0
frenos sobre lo autorizado. *Qué cambia para Guido*: lo que ya autorizó una vez no se le vuelve a preguntar, ni de día por el clasificador ni
de noche por una `ask`.

*Nota de H (2026-10-25): `sensible:` pasa a reglas concretas **por script**: cada entrada nombra el comando del proyecto que la toca (§13) y `doctor` o el actualizador regenera en la zona propia de `settings` la regla `ask` sobre ese comando contra los entornos `clase: real` (y `deny` fuera del comando donde se pueda), así el guardia de E no lo marca como desvío. **NO VERIFICADO** qué patrones distingue `settings` dentro de un mismo comando (`--env real` vs `dummy`): para la revisión integral. También nace `gate:entorno-prueba`, quitable acá con rastro como toda barrera ([DISENO-H](DISENO-H-niveles-y-puertas.md) §9, §15).*

## 15. El arranque verifica y declara (decisión 11)

En el hook de arranque del molde, **por script en node** (ya es dependencia por `check-code.js`; parsear JSON y YAML
en bash sin `jq` en Windows es frágil), tres líneas más, dentro del tope de 10.000 caracteres del racimo B:
- `modo de permisos: auto` (de `permission_mode` si viene; si no, el `defaultMode` de los settings con la etiqueta
  "(configurado)", nunca "desconocido"). Cierra S-C-2 y P51: una sesión no sabía que estaba en modo automático.
- `barreras de fábrica: 9 de 9 ✅` o `⚠️ falta Read(./**/.env) · corré doctor`: **se compara la lista de reglas por
  nombre contra el `settings.json` menos `frenos.quitados`**, no un hash (el `settings` es `molde+propio` y cualquier
  `allow` legítimo lo cambiaría: sería la falsa alarma de siempre). Es la línea base "por nombre y no por posición"
  de los trinquetes de gentle-ai. El proyecto con las barreras apagadas desde septiembre se habría visto solo.
- `hook anti-secretos: ✅` o `⚠️ no está en esta PC · corré "preparame esta PC"`.
- Y, una sola vez por clon, deja seteado `core.hooksPath` para el escáner (§10).
- *Revisión integral (2026-10-26; P73 del acta de contraste)*: **el remoto entra al arranque**, dos líneas más dentro del presupuesto de B §9:
  la última corrida de CI de la rama (`gh run list`, solo lectura: "CI rojo desde el 21/10", "en cola sin máquina") y un chequeo `gh` de la
  seguridad del repo (escaneo de secretos prendido, protección de `main`, visibilidad). **NO VERIFICADO** (revisor frío 26/10, hallazgo 27): cuánto suma `gh` al arranque y qué pasa sin red o sin login; la regla: tope de 3 segundos y, si no responde, una línea "sin datos del remoto"; nunca frena el arranque. Cicatrices: CI rojo 5 días sin que nadie lo viera
  (L25); escaneo de secretos apagado mientras el repo fue público (L62); verde local por una carpeta ignorada y CI rojo 3 corridas (L81).
  Regla escrita al núcleo de D: **"CI sin máquina dos veces: correr local, declararlo y seguir"**; y cuando el sub-paso toca config o el
  script del ambiente, el verde se mide desde un clon limpio.

No pregunta nada: una línea que dice cómo se arregla. Lo mismo lo lista `doctor` (E §10) para toda la PC. Los
vencimientos **no** van acá (§14).

*Qué cambia*: Guido se entera solo si alguien apagó un freno.

## 16. El bypass no se traba (decisión 12)

Las barreras de fábrica valen igual en bypass (§4, verificado), así que no hace falta trabarlo.
`disableBypassPermissionsMode` se descarta: los obreros nocturnos corren en bypass y cerraría de más. *D (2026-10-23): el obrero nocturno corre en el modo que fija su encargo, con el hook debajo, y para las 5 preguntas de A el hook devuelve `deny` + PARADA, porque el bypass saltea las `ask` ([DISENO-D](DISENO-D-director-obrero.md) §7).* La barrera que
el bypass esquivó en un proyecto (radiografía §6.6) era "preguntar": pasa a `deny` o a corrector. El modo `auto`
(el de esta PC) sigue: con `deny` y hooks debajo, el clasificador decide sobre lo demás. *Revisión integral (2026-10-26)*: "lo demás" era
el agujero; §14 dice ahora qué se hace con el clasificador, y **de noche el obrero nunca corre en `auto`** (tres negaciones seguidas lo apagan
y la sesión vuelve a preguntar a alguien que no está).

## 17. Las alertas y el runbook (decisión 13)

- **Las 12 alertas las arregla Guido**; están en su archivo privado y no entran al repo (ADR-022). No se construye
  un tablero: el conteo se lee a mano en la medición mensual.
- **Una sola página nueva de prosa**, en los manuales del kit: **"se filtró una credencial"**: qué rotar, en qué
  orden, cómo limpiar el historial de git, cómo verificar que ya no sirve, y la línea que queda en el registro. Es
  el runbook de incidente de agency-agents (REFERENCIAS §2) recortado al único escenario con cicatriz.
- P39 (docs-fyd con "resumen de exposición") queda como idea hasta una segunda corrida real (TABLERO §12).
- *Revisión integral (2026-10-26; P74 del acta de contraste)*: el runbook suma **cinco fugas laterales** que hoy no nombra: la selección del
  IDE que se adjunta sola al mensaje, el historial del portapapeles de Windows, la ventana de clave sin foco (se tipea en el chat), la salida
  verbosa de builds y herramientas, y el enmascarado improvisado a mano; y a la pregunta "¿escribe?" se suma **"¿qué trae esta lectura?"**
  (9 lotes de credenciales: un valor de producción llegó adjunto sin pegarlo, L22). Para imágenes, una regla de fábrica: **la evidencia con
  datos reales vive fuera del repo con registro** (ruta, tramo, quién la borra) y se borra al cerrar; notificaciones apagadas antes de
  capturar un teléfono (24 capturas sin dueño, L69).

## 18. Cómo se sabe si funcionó (decisión 14; se mide con los scripts, cada mes)

| Medida | Hoy | Meta |
|---|---|---|
| Proyectos con las barreras de fábrica | 2 de 10; el molde trae 0 | 10 de 10 (tras el piloto y la adopción; `flota.py`) |
| Credenciales que pasan por el chat | ~23 episodios | 0 (lector mensual sobre los chats nuevos) |
| Cierres con falsa alarma del escáner | ~25 | 0 (registro de frenos) |
| Frenadas del corrector de secretos: salvó / molestó; falsos positivos en Write y Edit | Sin medir | Se cuenta; falsos positivos 0, medidos contra el historial antes de instalar |
| Controles cegados o rotos por un cambio de método (hook editado, línea nueva en el ignore sin razón) | 2 en una semana | 0 (`doctor` y el cierre lo listan) |
| Proyectos con barreras apagadas sin que nadie lo sepa | 1 | 0 (el arranque lo dice) |
| Consultas y migraciones corridas por agentes (no por Guido) | 0 | Las corren los obreros (lector mensual) |
| Alertas de seguridad abiertas | 12 | 0 (Guido, archivo privado) |
| Frenos temporales vencidos y todavía prendidos | Sin medir | 0 (`doctor` y la salida de C) |
| El pre-commit corriendo en las 3 PCs | 0 de 3 | 3 de 3 (piloto) |

## 19. Preguntas nuevas a Guido, contadas (recuento después de la revisión)

- **Por sesión: 0.** Ninguna pieza de F pregunta; todas corrigen o declaran. (La primera versión escondía una:
  escribir en una base real. Ya no.)
- **Por proyecto, una vez**: 5 campos más (`secretos`, `publicas`, `entornos`, `datos-de-prueba`, `push-publica`) en
  la misma pantalla de adopción o montaje que ya existe por E (no es una pregunta nueva); y crear el usuario de solo
  lectura de cada base real (una acción, en la receta del contrato `db`).
- **Por proyecto y por PC**: cargar las credenciales con `cargar-secreto` (es una acción suya, no una pregunta;
  ~10 proyectos × 3 PCs la primera vez, y de nuevo en cada rotación). Las variables del sistema (como la del Hub)
  son una vez por PC.
- **Por vencimiento**: "¿restauro o lo hago permanente?", una vez por freno vencido, en la salida de C.

## 20. Lo que queda afuera o en espera

| Qué | Por qué | Cuándo vuelve |
|---|---|---|
| Datos personales en el escáner (nombres, arrobas) | Ruido puro; cada repo tiene mails | Regla propia por proyecto en `.gitleaks.toml` |
| Bloquear el bypass (`disableBypassPermissionsMode`) | Las barreras valen igual en bypass; cerraría de más | Si aparece un incidente que el bypass causó y el `deny` no frenó |
| Sandbox y enmascarado de variables | No existen en Windows nativo | Si alguna PC pasa a WSL |
| docs-fyd con "resumen de exposición" (P39) | Una sola corrida real | Segunda corrida |
| Scripts de teléfono (S-M-6) | Propio de Mobile | — |
| Plantilla de autorización con "después" (S-D-6) | Lo cubre la fecha de borrado en el handoff | Si se repite |
| `Library/Keychains`, `rm -rf /`, `*.p12`, `.credentials/` de gentle-ai | Mac; la plataforma ya lo frena; sin cicatriz | Con cicatriz |
| Un tablero de alertas | El conteo vive en el archivo privado | Racimo I, si la salud de la flota lo pide |
| Bloques para pegar con `<...>` (S-M-7 = P33), en la fila F del TABLERO | Lo diseñó el racimo C | — |
| La firma por agente y el arnés de lo que pide OK humano (PLAN §Pilares, mensajería) | Es del buzón multiagente | Racimo G |
| El `ask` para SQL destructivo (`DROP`, `TRUNCATE`) de gentle-ai | Patrón de texto y "preguntar": el bypass lo saltea (nuestra cicatriz); `db` con foto es más fuerte | — |

## 21. Límites de este diseño

- Las reglas de comando (`Bash(...)`, `PowerShell(...)`) y la parte del hook que mira rutas en el texto del comando
  son patrones de texto, no una barrera: lo dice la doc y lo confiesa gentle-ai de las suyas. Por eso lo de archivos
  va por `Read` (que la plataforma hace cumplir) y lo de comandos por hooks con pruebas.
- El `deny` no ve lo que hace un programa por adentro: es lo que permite "usar sin ver", y también lo que un agente
  podría usar para leer o imprimir un secreto (`python -c`, un `console.log(process.env.DB_URL)` en un script de
  debug). El hook cubre los casos conocidos; el registro de frenos y el lector mensual muestran si aparece uno nuevo.
- El corrector de secretos solo frena patrones de alta confianza (falso negativo antes que falso positivo): una
  contraseña "cualquiera" no lo dispara. La defensa contra eso es "usar sin ver": Claude no tiene el valor.
- Nada de esto protege contra un humano que pega un secreto en el chat. La regla de prosa queda y `cargar-secreto`
  le da la alternativa.
- **El registro de frenos** (A §4) lo usa F en seis lugares y A no le fijó ubicación. **Propuesta para A** (no
  decisión de F): `docs/frenos.log`, versionado, de solo agregar, commiteado en el cierre; así es rastro visible en
  las 3 PCs (criterio 10) y no ensucia el árbol entre cierres más que lo que el cierre ya commitea.
- No se probó en vivo en esta PC: el hook en bypass y PowerShell contra el `deny` (§4). Van al piloto.
- Lo que gentle-ai **no tiene** y nosotros sí (hooks de comandos, escáner antes del commit, "usar sin ver", niveles
  de base, `doctor` por integridad, vencimientos): es terreno propio, sin validación externa. Va al piloto como
  hipótesis, no como práctica probada.

## 22. La revisión (2026-10-22)

Dos lectores, como en E §16: **un revisor frío** (Opus sin contexto de las charlas, leyendo este diseño contra el
PLAN, A, C, E, el TABLERO, FLOTA, el molde actual y el hook real de esta PC; ~136 mil tokens) y **un lector de
gentle-ai** (Sonnet, ~150 KB del repo vía `gh api`, sin instalar nada; ~128 mil tokens). Trajeron 26 hallazgos. Guido
pidió pasarlos por el criterio de diseño ya establecido (el norte y el filtro de cuatro preguntas del PLAN) y aplicar
los que coinciden: **24 aplicados, 1 fundido, 1 descartado.**

**Lo que rompía y se arregló** (9): el mensaje del corrector se mordía la cola al cubrir Write (§7.2) · escribir en una
base real era una pregunta escondida, contra A §2 (§12, §19) · "la revisa el director" en proyectos sin director (§13) ·
lo quitado tenía dos campos y un ejemplo con una regla inexistente (§14, y E §4 corregido) · ningún hook leía la ficha
(§6, §7.5, §14) · "9 de 9" por hash daba falsa alarma en cada sesión (§15) · `core.hooksPath` no viaja por git (§10,
§15) · `hasta: "misión 3"` no lo evaluaba nadie (§14) · el molde contradecía al hook de git (§3, §6).

**Lo flojo que se ajustó** (10, uno recortado): el actualizador necesitaba `push --force` y el hook se suma sin volver
a medir (§6) · el `deny` cubría solo la raíz y el `.gitignore` versionaba un example que Claude no puede mantener (§5,
§9) · "solo lectura por construcción" era de más (§8) · Write/Edit sin medir y el JWT de Supabase (§7.1, `publicas:`) ·
la cuenta de preguntas (§19) y el vencimiento repetido en cada sesión (§14) · el hook leyendo "el deny" es patrón de
texto, **recortado** a declararlo y medirlo (§7.4) · `permission_mode` ausente en SessionStart y bash frágil (§15) · el
ignore del escáner como cegado (§10) · dos omisiones sin razón (§20) · `db` sin evidencia de 3+ ni lugar en la ficha (§8).

**Lo que sobraba** (1): gitleaks dos veces sobre el mismo commit (§10).

**De gentle-ai** (6: 4 adoptados, 1 fundido, 1 descartado): relectura después de escribir en Windows (§9) · lo tocado
por el usuario se respeta y se reporta; JSON con claves duplicadas no se toca (§7.3, §9) · un control que no pudo
correr nunca sale en verde (§10) · la prueba de que cada frenada trae alternativa (§7) · la línea base por nombre se
**fundió** con el chequeo por lista de §15 · **descartado**: "el hook de arranque no actúa fuera de un proyecto", porque
nuestro hook vive en el `settings.json` del proyecto y nunca corre fuera de él (es "por las dudas", no pasa el filtro).

**La tabla de criterios** se autoelogiaba en 4 de 11 (dijo el revisor: intervención, pragmático, portable, lo chico).
Se reescribió (§23).

## 23. Los 11 criterios, aplicados a este racimo

| # | Criterio | Cómo lo cumple F, o por qué no aplica |
|---|---|---|
| 1 | Menos intervención | 0 preguntas por sesión (verificado tras sacar la escondida). Lo que sí le toca a Guido: ~30 cargas de `cargar-secreto` la primera vez (10 proyectos × 3 PCs), una acción por freno vencido, y los 5 campos de adopción. A cambio: las consultas y migraciones dejan de pasar por él, y los frenos que molestan se sacan en un pedido y no vuelven |
| 2 | Pragmático | Lo que se construye, contado: 9 reglas `deny`, 2 hooks (uno existe acá, otro existe en Desktop; los dos se miden antes), 1 script (`cargar-secreto`), 1 contrato (`db`, 3 subcomandos por stack), 1 `.gitignore.snippet`, 1 pre-commit, 3 líneas en el arranque, 3 chequeos en `doctor`, 5 campos de ficha, 1 archivo público por proyecto, 2 reglas de prosa, 1 página de manual. De gentle-ai se descartó más de lo que se tomó; datos personales afuera; nada "por las dudas" (1 hallazgo descartado por eso) |
| 3 | Medible | Tabla de §18, con `flota.py`, el registro de frenos y el lector mensual; dos medidas nuevas de la revisión (falsos positivos en Write/Edit, pre-commit en las 3 PCs) |
| 4 | Software consistente, seguro, escalable | Sin config no arranca; foto verificada antes de escribir en real; guardas como lista de lo permitido; usuario de solo lectura para lo real; revisión obligatoria del plan antes de tocar una base real, con o sin director |
| 5 | Tokens y modelo justo | Todo es script o hook: no gasta modelo. La revisión del plan antes de aplicar en una base real es el único paso con criterio; su modelo lo fija D (un subagente fresco en los livianos) |
| 6 | Script antes que modelo | El escáner, el chequeo del arranque, la comparación de reglas, los vencimientos, `cargar-secreto`, `db foto`, la relectura tras escribir: todo script, en node donde hay JSON o YAML |
| 7 | Seguro por defecto | Es el racimo. Verificado en la doc que `deny` y hooks frenan en bypass; el kit público no lleva nada de la empresa; un control que no corre avisa, nunca verde |
| 8 | Portable | El hook global lo instala el Equipador en cada PC (hoy era a mano); `cargar-secreto` en Bash y PowerShell; `core.hooksPath` lo setea el arranque en cada clon. **Lo que sigue siendo por PC y hay que repetir**: gitleaks instalado (`doctor` avisa), las credenciales cargadas (por diseño: nunca viajan), y en Windows una variable del sistema nueva se ve recién en la próxima sesión |
| 9 | Lo chico no paga lo grande | Un proyecto liviano se ahorra: el director (la revisión de §13 la hace un subagente), `db` (nace solo si hay base), las preguntas de A que la ficha quite, y el push libre. **No se ahorra**: las 9 reglas, el corrector de secretos, el pre-commit y el hook de git: cuestan cero intervención y frenan errores que también pasan en lo chico |
| 10 | Autónomo con rastro | Cada frenada, cada foto, cada freno quitado, cada línea nueva en el ignore y cada vencimiento deja una línea; el "sí" de Guido deja rastro en la ficha. **Depende de que A le fije ubicación al registro de frenos** (propuesta en §21) |
| 11 | Piloto antes de flota | Al piloto (Hub y Portal, E §14) van: el hook en bypass en vivo, PowerShell contra el `deny`, los falsos positivos de Write/Edit contra el historial, el `push --force` medido, el pre-commit en las 3 PCs, el conteo de 3+ del contrato `db`, y si la parte de texto del hook (§7.4) sobra |

## 24. Revisión integral con el acta de contraste (2026-10-26)

Con [`tips/tanda-2026-11-contraste.md`](../../tips/tanda-2026-11-contraste.md) abierta y sin volver a los chats salvo el ★ 23f8dd9f. Lo que
cambió en F:

| Qué | Veredicto del acta | Qué se hizo | Dónde |
|---|---|---|---|
| F-1 · las barreras son del proyecto | contradicha (✘172 / ✔27, 60 lotes): los frenos eran del clasificador | Reabierta y cerrada con Guido: dos capas con nombre; AUTORIZADO como `allow` estrechas; hook solo `deny`; `autoMode` por el Equipador en la PC; noche nunca `auto`. Verificado contra la doc oficial | §14, §16 |
| A-1 · merge y producción | contradicha en A | Campo `autorizado:` en la ficha, default por nivel; merge con gate verde, producción por comando con foto | §14 |
| F-2 · usar sin ver | mixta (✔219 / ✘176) | P60 + P65: "¿lo puede hacer el agente?", guion numerado, lectura del resultado sin permiso | §8 |
| F-3 · con permiso, igual con red | confirmada (✔224 / ✘11) | Nada | — |
| F-4 · qué base es qué | mixta (✔133 / ✘131): un "ensayo" de un tercero resultó real | `entornos:` cubre configuraciones y servicios de terceros; "sin config no arranca" pasa de prosa a mecánica | §12 |
| F-5 · el escáner no da falsas alarmas | mixta (✔39 / ✘21): ~20 falsas alarmas a clasificar a mano | Queda para el piloto: afinar patrones (handoff, TODO, ignorados por git) con el registro de frenos; sin cambio de diseño | §10 |
| P73 · el remoto en el arranque | 6 lotes | Dos líneas más en el chequeo de arranque | §15 |
| P74 · fugas laterales | 9 + 5 lotes | Cinco vías nuevas en el runbook; regla de imágenes | §17 |
| `taskkill` por nombre | 4 lotes | Caso nuevo del hook de §6 | §6 |
| H-5 · entorno = base + herramientas | contradicha en H | Lo resuelve H §9; acá solo la nota de que `smoke` y el chequeo de arranque leen la lista de herramientas | H |

Lo que esto le hace a los 11 criterios de §23: el criterio 7 (seguro por defecto) gana la capa que le faltaba (el clasificador), y el
criterio 1 baja dos preguntas más (merge y producción). Ningún veredicto empeora. **NO VERIFICADO nuevo para el piloto**: que el
`settings.local.json` generado por script se respete en VS Code igual que en la terminal; qué patrón de `allow` distingue `--env real` de
`--env dummy` dentro de un mismo comando (ya estaba en la nota de H).

