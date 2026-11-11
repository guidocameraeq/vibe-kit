# Revisión antes de la rc.7 — Mirada 2: el sistema

> Sesión 3 de `docs/kit-v3/REVISION-rc7-PLAN.md`. Escrita el 2026-11-11 (Claude Fable 5.2; ocho lectores e investigadores Sonnet).
> Solo mira y propone: no toca `kit/` ni el tracker. Las citas con **[L]** las trajo un lector o un investigador y no las abrí yo;
> todo lo demás lo vi en el archivo y la línea, o lo corrí. Parte de `REVISION-rc7-mirada1.md` y `REVISION-rc7-pruebas.md`: lo que
> ellos ya dijeron no se repite, se cita.

## Resumen para la madre

- **Terminó**, en menos de media hora de reloj y con 8 subagentes Sonnet a la vez. Las cinco preguntas, contestadas.
- **Cubrió**: el camino entero, del Arquitecto a la flota; el kit contra el Claude Code de hoy (la doc oficial y el binario de la
  extensión de Guido, 2.1.322, corrido de verdad); Anthropic y la comunidad; el tamaño medido; lo ya descartado.
- **No cubrió**: Hermes y los demás repos; `relevamiento` y `docs-fyd`; nada se probó en una pestaña real de VS Code.
- **Veredicto**: es un buen sistema para hoy y **no hay que rehacerlo**: hace lo que recomienda Anthropic. Tiene tres problemas
  de forma: está armado para un modo de uso que Guido no usa, hace a mano cosas que Claude Code ya trae, y sus frenos son más
  grandes que lo que protegen y se cuelgan con varios obreros.
- **Hallazgos: 50** — 14 encajes que fallan entre piezas (8 nuevos), 10 cosas que andan y no se tocan, 7 cambios y 3 bajas para
  la `rc.7`, 1 para decidir con Guido (`/tramo`: 0 usos en 60 encargos), 9 para la `v3.1`, 6 que no propongo.
- **Lo que más importa**: el kit tiene dos diseños adentro (pestañas que se mandan mensajes, y un director que lanza todo de
  fondo). Las noches usaron solo el segundo: la `rc.7` tiene que declararlo el único camino y sacar más de lo que agrega.
- **Tres datos nuevos para el plano**: cada comando prende **cuatro** procesos de freno con 20 s de plazo (por eso se cuelgan);
  la suite corre **al menos dos veces por encargo**, sin turno (por eso fallan pruebas sin causa); y los frenos **sí** pararon
  cuatro cosas que valía parar (`secretos` no se toca).

---

## El veredicto, en criollo

**¿Es un buen sistema para hoy? Sí.** Y no lo digo por cumplir: lo comparé contra lo que Anthropic recomienda este año para dejar
agentes trabajando solos, y las cuatro cosas que ellos ponen primero son las cuatro que el kit ya hace. Primero el plano, y recién
después construir, en una sesión nueva. Lo que se decidió queda en archivos y en el historial, no en la charla. Cada tarea la hace
una sesión aparte, en su carpeta, con permisos justos. Y el que revisa no es el que hizo el trabajo. Las dos noches de Deptos lo
mostraron: 19 y 24 encargos sin que te despertaran, los revisores encontraron errores de verdad antes de que entraran, y un obrero
se frenó solo cuando vio que una prueba iba a escribir en la base real.

**No le hace falta "otra cosa", ni más skills.** Me preguntaste si había que traer recursos. Busqué: lo que hay afuera (los kits
de especificaciones, los orquestadores de muchos agentes) ya lo habías evaluado y descartado con razón, y esas razones siguen
valiendo. Lo que le falta al kit no se compra: es terminar lo que ya tiene.

**Lo que tiene de malo son tres cosas de forma, no de fondo.**

1. **Está armado para una forma de trabajar que no es la tuya.** El kit se diseñó pensando en que vos abrías una pestaña por
   obrero y las pestañas se mandaban mensajes entre ellas. En las dos noches eso no pasó nunca: el director lanzó a todos de
   fondo y se enteró de que terminaban porque el proceso terminaba. Anduvo mejor así. Pero el kit sigue cargando la otra mitad
   (los mensajes, "la apertura la hace el dueño", el despertador, un modo de trabajo que se llama `/tramo` con seis ayudantes) y
   esa mitad es la que falla o la que te manda a hacer cosas. De los 60 encargos de las dos noches, ninguno usó `/tramo`.
2. **Hace a mano cosas que Claude Code hoy ya trae.** Cuando se diseñó, varias no existían. Hoy existen: avisarte al celular,
   saber qué sesiones están vivas, mandarse mensajes entre sesiones, compactar sola una charla quieta, y una forma oficial de
   repartir un kit a otras personas. No hay que correr a cambiar todo: lo que anda, anda. Pero el despertador que no despierta y
   la cuenta del "40 %" se pueden sacar ya, y lo demás conviene probarlo en la versión que sigue.
3. **Los frenos son más grandes que lo que protegen, y se traban.** Un cuarto del kit son frenos. La mayoría están bien pensados
   (los de las claves pararon tres cosas reales en dos noches). El problema es otro: por cada comando que corre una sesión, el
   kit prende cuatro programas de freno, y cuando hay cuatro obreros trabajando a la vez la PC no da abasto y el freno "se
   cuelga" y bloquea algo inocente. Lo mismo pasa con las pruebas: cada encargo corre todas las pruebas del proyecto dos veces,
   y con varios obreros a la vez se pisan y fallan sin motivo. No es que el kit pruebe de más: es que nadie ordena la fila.

**Lo que le sobra**: `/tramo` y sus ayudantes, el despertador, los mensajes de los obreros de fondo, y una parte de los frenos que
está hecha contra un agente tramposo, cuando vos ya decidiste (y está escrito) que el kit se defiende de accidentes, no de trampas.

**Lo que le falta**: que la noche termine sola (eso ya lo dijo la mirada 1 y las pruebas mostraron que se puede); un turno para
lo pesado cuando hay una sola PC; que te avise al celular cuando te necesita, en vez de esperarte ocho horas; y una pregunta
fija en el ciclo de mejora que hoy no está: "¿qué sacamos?". El kit creció a 40 mil líneas sumando; nunca tuvo un paso para restar.

**Una advertencia honesta.** Tu objetivo para la `rc.7` ("la noche termina publicada sola") va un paso más allá de lo que hace
casi todo el mundo: lo normal hoy es que el agente deje todo listo y una persona apruebe la publicación. No digo que no lo hagas
(es tu repo, tiene pruebas y respaldo), digo que se haga con red: que cada repo diga si se publica solo o no, que después de
publicar corra la prueba de humo, y que te llegue un aviso.

**En una línea**: buen sistema, bien orientado, con una mitad que sobra. La `rc.7` debería sacar más de lo que agrega.

---

## Cómo encajan las piezas

### El camino, con el archivo que hace de contrato en cada flecha

```
Guido ── charla ──> ARQUITECTO (skill global, sesión de la carpeta principal)
                       │  SPEC.md con sello + ficha del módulo (docs/modulos/<x>/README.md)
                       ▼
                    DIRECTOR (sesión en la carpeta del módulo; entra con EnterWorktree)
                       │  encargo-<ID>.md, commiteado en modulo/<x> ·········· (E1)
                       │  worktree crear + autorizado → la línea `claude -p`
                       ▼
                    OBRERO × N (sesión de fondo, una carpeta por encargo)
                       │  evidencia-<ID>.md + su rama subida (+ mensaje CIERRE ·· E2)
                       ▼
                    GATE: encargo.cjs verificar (seis líneas) ················ (E3, E8)
                       │  merge en modulo/<x>
                       ▼
                    INTEGRAR: worktree.cjs integrar (carpeta temporal, pruebas, sube a main)
                       │  "después: /cierre en tu carpeta principal" ········· (E4)
                       ▼
                    /CIERRE → publicar → limpiar          (nadie vive ahí de noche)

  Al costado:  la FICHA (.claude/kit.md) ················ (E3)   tres lectores, tres ramas
               los FRENOS (cinco porteros) ·············· (E5, E6) cada uno mira otra cosa
               el EQUIPADOR (preparar la PC, adoptar, actualizar, la flota): copia el molde a cada repo
```

### Los encajes que fallan

"Ya dicho" = está en la mirada 1 o en las pruebas, y acá solo se ubica en el mapa. "Nuevo" = no estaba.

| # | El encaje | Qué pasa | Evidencia | |
|---|---|---|---|---|
| E1 | El encargo vive en la rama del módulo; el obrero lee la suya | Una corrección no le llega a un obrero ya lanzado: hubo que cancelar y recrear | Deptos, notas de `pulido` 00:12 y de `cola` 18:50; mirada 1, ítem 20 | ya dicho |
| E2 | Los mensajes entre sesiones | El protocolo (ocho tipos, `NUCLEO.md:14-28`) se pensó para pestañas; un obrero de fondo le manda la PRESENTACION a la sesión de `main` de Guido | notas de `cola` 19:40; mirada 1, ítem 19 | ya dicho |
| E3 | La ficha, leída desde tres ramas | `verificar` lee la de la rama por defecto; `/estado`, la del módulo; el obrero trabaja con la de su rama. Cuando `main` cambió el `comando-test`, todas las ramas abiertas empezaron a fallar | notas de `pulido` 00:40 y de `cola` 18:15; mirada 1, ítems 23 y 24 | ya dicho |
| E4 | El último tramo cae donde no hay nadie | Integrar anda; cerrar, publicar y limpiar piden la carpeta principal | mirada 1, ítems 18 y 36; pruebas, prueba 1 | ya dicho |
| E5 | **Cinco porteros, cinco formas de mirar** | Una misma acción la juzgan los permisos, el clasificador del modo `auto`, los frenos del kit, el aislamiento de la carpeta y el candado del commit. Cada uno se configura en otro lado y mira otra cosa (tabla abajo). Autorizar algo "de antemano" exige saber en cuál de las cinco puertas | pruebas, prueba 1 punto 5 y prueba 2 "Dónde vive la autorización"; ítem 37 | **nuevo** (como mapa) |
| E6 | El rol es una marca en la carpeta, no de la sesión | "Humano" es *no tener* `.kit-rol`. Una sesión abierta en otra carpeta es humana; el director que sale de la suya también, salvo en VS Code, donde la consola vuelve sola y sigue siendo director | pruebas, 3e y 3f; mirada 1, R1 | ya dicho |
| E7 | **Cuatro procesos de freno por cada comando** | Un `Bash` dispara `niega-aprobar`, `git-seguro` y `sensible` (`kit/molde/settings.json:56-85`) más `secretos` de la PC (`instalar-hooks-pc.cjs:82`): cuatro `node`, cada uno con `timeout: 20` y `onFailure: block`. El plazo por defecto de Claude Code es 600 s **[L]**; los 20 los eligió el kit. Con cuatro obreros son 16 procesos por ronda, y el propio kit sabe que "~15 gits de ~250 ms en Windows suman 10-24 s con la PC cargada" (`kit/molde/hooks/lib/git.cjs:12-14`) | 12 frenos colgados en dos noches (mirada 1, N1); notas de `cola` 14:47 y 15:20 | **nuevo** (la causa) |
| E8 | **La suite corre al menos dos veces por encargo, sin turno** | `presentar` corre el `comando-test` entero para la base (`kit/molde/scripts/encargo.cjs:134-138`, plazo 10 min) y `verificar` otra vez (`:510-514`); `integrar`, una más (`worktree.cjs:1021-1078`). Con tres o cuatro obreros a la vez: tres "fallas que no se repiten", un `presentar` cortado a los 10 min y cuatro pruebas caídas por tiempo | notas de `cola` 15:00, 16:55, 18:40, 19:40 y 20:00; tracker, "Lecciones" del 2026-10-28 y del 2026-11-04 ("dos tandas pesadas a la vez se frenan las dos") | **nuevo** |
| E9 | **La ficha del módulo tiene un solo escritor por vez** | Mientras corre un cierre de tramo, "la ficha es suya" y el director guarda lo suyo para después. La noche 2 hubo 7 cierres de tramo (los `tramo-1` a `tramo-7` de la bitácora), cada uno un obrero entero | notas de `cola` 14:18, 14:27 y 15:20; `director/SKILL.md:19` ("Nunca escribís la ficha vos") | **nuevo** |
| E10 | **Dos diseños adentro del mismo kit** | El de pestañas (apertura del dueño por defecto, mensajes, `/tramo`, despertador) y el de fondo (el director lanza, espera el fin del proceso y verifica). Las noches usaron solo el segundo: los 60 archivos de encargo dicen `Skill: obrero` | `git grep "^- Skill:"` sobre las bitácoras de `pulido` y `cola`; `director/SKILL.md:16` ("Por defecto la hace el dueño") | **nuevo** |
| E11 | **"Te espera" sale de cuatro lugares, y cada pantalla lee uno distinto** | Lo que espera a Guido vive en el handoff, en la ficha de cada módulo, en los cambios de freno propuestos (y las fusiones del actualizador) y en el TODO. `/estado` lee solo las fichas y el TODO (`kit/molde/scripts/estado.cjs:248-262`): un cambio de freno esperando su clic no aparece ahí. El arranque muestra el handoff; `/inicio`, las fusiones **[L]** | el cambio de C13 esperó 20 h (mirada 1, paso 8) | **nuevo** |
| E12 | **El estado de un encargo no está escrito: se deduce, de tres formas** | "Cerrado" es: su rama está contenida en la del módulo y tiene sub-pasos (`estado.cjs:210-212`); o su evidencia está en la rama del director y no es una PARADA (`noche.cjs:138-139`); o su rama no figura entre las no mezcladas (`worktree.cjs:1175-1180`). Y cuando `cerrar` borra la rama, `/estado` deja de verlo. Es la raíz de las "vistas que mienten" | mirada 1, ítems 17 y 24 (3 de 5 cifras mal; `me-voy` listó 4 cerrados como sin arrancar) | **nuevo** (la causa) |
| E13 | **Cinco plazos para el mismo `comando-test`, y la ficha gobierna uno** | `sello`: 5 min o el `plazo-test` de la ficha (`kit/skills/arquitecto/scripts/arquitecto.cjs:38,199`); `presentar`: 10 min fijos (`encargo.cjs:38`); `verificar`: 30 (`encargo.cjs:269`); `integrar`: 30 (`worktree.cjs:1021`); el chequeo del actualizador: 30 **[L]**. Un proyecto con pruebas lentas pone `plazo-test`, pasa el sello y después choca con los otros cuatro | notas de `cola` 16:55 (`presentar` cortado a los 10 min) | **nuevo** |
| E14 | **El encargo pide cosas que nadie lee** | `Suscripción:` es obligatorio y ningún script lo usa; `## NO SE TOCA` se lee y no se chequea (`kit/molde/hooks/lib/encargo.cjs:223,238`; `verificar` mide solo contra `## Toca`); `Riesgo:` solo se imprime. Y al revés: `obrero/SKILL.md:15` manda al `revisor` sin nombrar `paquete.cjs`, que es lo único que ese agente puede leer (lo dice solo `NUCLEO.md:50`) | mirada 1, ítem 22 (los chequeos rechazan lo que la plantilla no dice) | **nuevo** |

### Los cinco porteros (E5)

| Portero | Dónde se configura | Qué mira | En una sesión de fondo | Cómo se le abre |
|---|---|---|---|---|
| Permisos (`allow` / `ask` / `deny`) | settings del proyecto, del usuario, o `--allowedTools` | la forma del comando | las `allow` del proyecto **no valen** si la carpeta no tiene la confianza aceptada; `deny`, `ask` y `--allowedTools` sí | la línea que arma `autorizado` |
| Clasificador del modo `auto` | solo el settings del usuario o `--settings` (`autoMode`) | la intención: publicar a producción, tocar la propia configuración | sí; no es parejo (4 de 8 sin autorización, 16 de 16 con ella) | una línea de `autoMode` o la `allow` exacta |
| Frenos del kit (hooks) | settings del proyecto; `secretos`, en el del usuario | el comando partido, la carpeta de la sesión, `.kit-rol`, `.kit-noche` | sí (corren aunque la carpeta no tenga confianza **[L]**) | `cambios aprobar`, con el clic |
| Aislamiento de la carpeta (de Claude Code) | lo prende `EnterWorktree` | `git` hacia afuera, y comandos "demasiado complejos" | solo si la sesión entró con `EnterWorktree` | `ExitWorktree` |
| Candado (githooks) | `.githooks` del repo | lo que se commitea y lo que se sube | sí | un cambio aprobado |

Fuentes de la tabla: pruebas, prueba 1 ("Qué quiere decir", 4 y 5), prueba 2 ("Por qué" y "Dónde vive la autorización") y prueba
3 ("Qué chequea hoy la firma"); la doc oficial de permisos y de confianza de la carpeta **[L]**.

---

## Lo que el kit hace a mano y Claude Code ya trae

Qué miré de primera mano: el binario de la extensión de Guido, `claude.exe` **2.1.322**. Su `--help`, y una sesión de fondo
mínima (`-p`, modelo Haiku, US$ 0,004) para leer su lista de herramientas y de comandos. Trae, entre otras: `EnterWorktree`,
`ExitWorktree`, `Monitor`, `SendMessage`, `ListAgents`, `PushNotification`, `CronCreate`, `Workflow`; los comandos `/goal`,
`/batch`, `/insights`, `/loop`, `/schedule`, `/doctor`, `/code-review`, `/security-review`; las opciones `--bg`, `--worktree`,
`--max-budget-usd`, `--permission-prompts none`, `--output-format json`; y los subcomandos `claude agents`, `claude plugin` y
`claude auto-mode`. Lo demás viene de la doc oficial (code.claude.com/docs, leída el 2026-11-11) **[L]**.

| Lo que hace el kit | Lo que trae Claude Code hoy | ¿Se delega? |
|---|---|---|
| `worktree.cjs crear / abrir / cerrar` (1.533 líneas) | `--worktree`, `EnterWorktree`, `.worktreeinclude`, hooks `WorktreeCreate` y `WorktreeRemove` **[L]** | **No entero.** Un cuarto es mecánica de git **[L, estimado]**; el resto son reglas propias (el filtro de credenciales, `.kit-rol`, que esté mezclada antes de borrar). Sí conviene no depender de `EnterWorktree` para el director (propuesta V8) |
| Lanzar obreros: `printf … \| claude -p`, de fondo (`encargo.cjs:361-363`) | Subagentes con `isolation: worktree`, que hoy pueden lanzar otros, hasta 3 niveles **[L]** · `claude --bg` + `claude agents` (vista previa; no se combina con `-p` **[L]**) · equipos de agentes (experimental, no existen en `-p` **[L]**) · `/batch` | **No por ahora** (N1). Sí tomar tres cosas baratas: `--output-format json` (devuelve el costo y el resultado), `--name`, y `claude agents --json` para saber quién está vivo (lo corrí: lista cada sesión con su carpeta, su estado y qué espera) |
| El despertador (`noche.cjs despertador`) | El aviso de fin de un proceso de fondo: es lo que de verdad movió al director las dos noches (38 y 43 avisos; mirada 1, ítem 19) | **Sacar el despertador** (C2). `Monitor` no sirve para esto: su plazo máximo es 30 min **[L]** |
| Los mensajes PRESENTACION / AVANCE / CIERRE | `SendMessage` y `ListAgents`, en Windows desde la 2.1.234 **[L]** | Para obreros de fondo, **sacarlos** (B1): alcanza con git. Para el buzón de la v3.1, partir de lo nativo |
| `contexto.cjs` y la regla del 40 % | `/context`; la compactación por inactividad (`idleCompaction`: ~1 h quieta, sesión interactiva, 200 mil tokens o más **[L]**) | Dejar de decidir por porcentaje (C4) |
| `.kit-noche`: de noche, `sensible` niega en vez de preguntar | `permissions.denyInsteadOfPrompting` (2.1.319 **[L]**) y `--permission-prompts none` (lo vi en el binario) | Probar en la v3.1: puede reemplazar la marca de noche |
| `git-seguro` (1.260 líneas, 34 casos **[L]**) | El clasificador de `auto` frena push forzado, `reset --hard`, `clean -fd` **[L]**; reglas `deny` | **En parte.** La doc dice que los patrones de Bash "no son una frontera" y que los "nunca" van en un hook **[L]**. Se queda lo de accidentes; se poda lo hecho contra trampas (V4) |
| `secretos` (1.422 líneas) | `deny Read(.env)`: cubre `cat` y `sed`, no `grep -r` ni un script **[L]**; el clasificador *permite* leer el `.env` | **No.** Se queda (A7) |
| `sensible` (las cinco preguntas) | El clasificador ya frena publicar a producción | Se pisan: dos porteros para "publicar". El plano tiene que decir cuál manda (pruebas, prueba 2, punto 4) |
| `session-start` (inyecta el handoff) | Es el mecanismo nativo (`SessionStart`, tope de 10.000 caracteres **[L]**) | Ya está delegado |
| `kit-sync`, "actualizate", `instalar-hooks-pc` (la parte global) | Plugins: llevan skills, agentes y hooks; se instalan desde un repo de git; se actualizan solos si se activa **[L]** | Probar en la v3.1 (V3) |
| El actualizador del molde, la zona propia y la fusión | Nada parecido: un plugin no se adapta por proyecto | **No.** Se queda (A8) |
| El observatorio | `/insights` (está en el binario), OpenTelemetry, `ccusage` **[L]** | Complemento, no reemplazo (V7) |
| El revisor frío | `/code-review`, `/security-review`, `ultrareview` | **No.** El propio revisa contra el encargo; los nativos no lo conocen |
| El director lleva la cola en prosa (`director/SKILL.md`, 7.983 bytes de un tope de 8.000) | `Workflow`: un script que reparte subagentes de forma fija; está en el `-p` del binario de Guido | Probar en la v3.1 (V1) |

---

## Lo que le falta comparado con cómo se trabaja hoy

Contra lo que recomienda Anthropic (16 notas de su blog de ingeniería y la guía de buenas prácticas de Claude Code, 2024-12 a
2026-11 **[L]**) y lo que hace la comunidad **[L]**. Antes leí lo que el observatorio ya juntó: Spec Kit, BMAD, GSD, Paperclip,
los equipos de agentes y las 10-15 sesiones en paralelo ya se evaluaron y se descartaron con razón (`menu-skills.md:51-52`;
`tips/tanda-2026-07-08.md` y `tanda-2026-07-11.md` **[L]**). No encontré evidencia nueva para reabrir ninguno.

**En lo que el kit ya está al día**, y por eso no hay que rehacerlo: plano en una sesión y construcción en otra; el estado en
archivos y en git; un chequeo que dice "pasó o falló" corrido por un script; un revisor aparte, sin shell y de una sola vuelta
(la guía oficial hasta trae la misma advertencia que el ADR-029: un revisor que busca problemas siempre encuentra algo **[L]**);
los "nunca" en frenos y no en texto (el clasificador de `auto` deja pasar el 17 % de lo que debería frenar, según la propia
Anthropic **[L]**); y el modo `auto` con frenos en vez de una caja de arena, que es lo correcto en Windows: la caja de arena de
Claude Code no existe en Windows nativo **[L]**.

**Lo que le falta**:

1. **Que la noche termine sola** (mirada 1, propuesta 1; pruebas 1 y 2). Con una salvedad que no estaba dicha: publicar sin una
   persona **no** es práctica común. La guía oficial lo dice así: la tarea larga la hace el agente, y la persona define qué es
   "hecho" y aprueba el merge **[L]**; ningún producto de agentes en la nube publica solo por defecto **[L]**. Se puede hacer,
   con red: que la ficha de cada repo lo diga, prueba de humo después de publicar, y un aviso.
2. **Un turno para lo pesado en una sola PC** (E8). Los que corren muchos agentes en paralelo les dan una máquina o un
   contenedor a cada uno **[L]**; el kit pone cuatro en la misma PC, con la misma base de pruebas, y sin fila.
3. **Algo que frene a un obrero que se pasa de largo.** De las cinco preguntas que la guía oficial pide contestar antes de una
   corrida sin nadie, el kit contesta cuatro; le falta "¿qué la frena?" **[L]**. La línea del obrero no lleva tope de vueltas,
   de costo ni de tiempo (`encargo.cjs:361-363`). No vi que haya dolido: queda anotado y no lo propongo (N6).
4. **Avisarle a Guido donde esté.** La noche 2 fueron 481 minutos con todo listo, esperándolo. `PushNotification` está en el
   binario; el control remoto anda desde VS Code **[L]**. Si de verdad le llega al celular desde la extensión: NO VERIFICADO.
5. **Un director corto.** El director llegó a 384 mil y 801 mil tokens de contexto en una noche, y el relevo que el kit prevé
   nunca se usó (mirada 1, ítem 27). Lo que recomienda Anthropic para corridas largas es lo contrario: sesiones cortas que
   arrancan de cero leyendo los archivos de estado **[L]**.
6. **Una forma de regalar el kit.** La visión dice "un pack regalable" (`docs/MISION-Y-VISION.md`); a una persona nueva le
   llevó ~6 h de explicación y ~35 min de tropiezos instalarlo (`tips/tanda-2026-10-chats.md:941-947` **[L]**). Hoy la forma
   estándar de repartir un método es un plugin **[L]**.
7. **Un paso para restar.** Anthropic lo dice así: cada pieza de un sistema como este es una suposición sobre lo que el modelo
   no puede hacer; esas suposiciones vencen, y hay que sacar de a una pieza y medir **[L]** (nota del 2026-03-24). El ciclo de
   mejora del kit solo suma; el propio observatorio ya lo había anotado ("el método crece más rápido de lo que se usa",
   `tips/tanda-2026-10-chats.md:582` **[L]**).

**Lo que no le falta**, aunque parezca: más skills (N5), un sistema de especificaciones ajeno (ya descartado), un orquestador de
muchos agentes (N1), una caja de arena (no existe en Windows nativo), ni trabajar en la nube (N2).

---

## ¿Está sobredimensionado?

Lo medí con `wc -l` sobre `kit/` en la `rc.6` (`.cjs`, `.md`, `.sh`, `.py`): **40.004 líneas sin pruebas** y unas 39 mil de
pruebas. Por para qué sirven:

| Bloque | Líneas (aprox.) | Qué es |
|---|---|---|
| Los frenos y su registro de cambios | ~8.100, más ~3.000 de apoyo **[L]** | `git-seguro`, `sensible`, `secretos`, el candado, `barreras`, `cambios`, el lector de comandos (893) |
| Llevar el kit a la PC y a los repos | ~7.500 | `adoptar` 1.665, `actualizar` 1.378, `chequeo` 973, `doctor` 941, `preparar-pc` 747, `flota` 660, `fusion` 606, `instalar-hooks-pc` 518 |
| La orquestación (`kit/molde/scripts/`) | 5.912 | `worktree`, `encargo`, `noche`, `estado`, `tiempos`, `mesa`, `resumen`… |
| Copias | ~5.500 | 12 archivos idénticos en dos o tres lugares (`ficha.cjs` y `proceso.cjs`, tres veces), porque cada zona se instala sola; se copian a mano y dos pruebas cuidan que no se desvíen (`kit/skills/arquitecto-skills/pc/lib.test.cjs:1-4`; `kit/skills/arquitecto/scripts/lib/copias.test.cjs` **[L]**) |
| El Arquitecto | 2.909 | la skill, sus anexos y su script |
| `relevamiento` y `docs-fyd` | ~2.500 | no los miré |
| **Lo que lee el modelo para trabajar** (las skills del molde) | **341** | `inicio`, `cierre`, `director`, `obrero`, `tramo`, `estado`, el núcleo |

**Lo que dicen los números.** La mitad del kit no es para programar: es para frenar y para repartirse. Lo que de verdad le dice
al modelo cómo trabajar son 341 líneas, y son las que más rindieron.

**Mi juicio, por bloque:**

- **La orquestación no sobra.** Son ~5.900 líneas que cargan reglas que solo este kit sabe (el encargo como contrato, las seis
  líneas del gate, el filtro de credenciales). Lo que hace Claude Code nativo cubre cerca de un quinto **[L, estimado]**.
- **Las copias pesan pero no dañan**: están cuidadas por una prueba. No tocar.
- **Llevar el kit a los repos es mucho, y es lo que hace que la flota ande.** Solo la parte global (las skills y el freno de la
  PC) se podría delegar a un plugin (V3); el actualizador del molde no tiene reemplazo.
- **Los frenos sí están pasados, en un lugar preciso.** El ADR-029 dice "contra accidentes, no contra trampas"
  (`docs/DECISIONS.md:644-646`). El código anterior a ese ADR sigue defendiéndose de un agente que esquiva: descifra
  `$'sta\x73h'`, trata como casos propios la plomería de git (`update-ref`, `replace`, `symbolic-ref`), quita comillas para
  que `apro''bar` no pase, borra variables del entorno en los githooks **[L]**. Nadie lo volvió a mirar después de decidir que
  eso no se defendía.
- **Lo que no usa nadie**: `/tramo` y seis de los siete agentes del molde (C1), el despertador (C2), `mesa` en Deptos (cero
  archivos, y su ficha no la tiene; V6).

**Lo que hicieron los frenos en las dos noches** (el `frenos.log` de Deptos en `origin/main`, 42 renglones): 10 lecturas de un
`.env` negadas, 8 por tocar los frenos del proyecto, 6 `cambios aprobar` negados a un agente, 5 intentos de salir de la carpeta,
y **cuatro que valen el freno**: una variable con un token que se iba a imprimir (`secretos:imprime-variable`, 15:05 de la
noche 2), una conexión con clave que se iba a escribir en un archivo de pruebas (`secretos:conexion-con-clave`, 16:44), un token
(`secretos:jwt`, 06:51 de la noche 1) y un "matar procesos por nombre" con otros obreros vivos (`git-seguro/matar-por-nombre`,
17:29). La mirada 1 dijo "ninguno paró algo dañino": **lo matizo**. No abrí esas cuatro charlas para confirmar el daño (NO
VERIFICADO), pero son justo los casos para los que el freno existe.

**Cuánto se puede sacar sin perder lo que protege.** En líneas, poco: lo que sobra seguro son unos cientos (C1, C2). La ganancia
está en otra parte: menos conceptos que explicar (un camino en vez de dos), menos procesos por comando (uno en vez de cuatro), y
menos corridas de la suite. No propongo una poda grande de frenos en la `rc.7`: es código de seguridad, y se saca de a una
pieza, midiendo (V4).

---

## Lo que anda y no hay que tocar

| # | Qué | Por qué se queda |
|---|---|---|
| A1 | **El plano sellado antes de construir, y construir en otra sesión** | Es la primera recomendación de la guía oficial **[L]**. Los dos módulos de Deptos salieron de un spec sellado |
| A2 | **"Manda git, no la charla"**: el estado en archivos y commits | Es lo que deja que un obrero se caiga y otro siga. Anthropic lo pone como base de toda corrida larga **[L]** |
| A3 | **Un obrero por encargo, como sesión `claude -p` propia, en su carpeta, con `--allowedTools` justo** | 43 encargos cerrados en dos noches sin intervención. Permisos por encargo, modelo por encargo, y el obrero puede usar su propio revisor |
| A4 | **El gate por script** (`verificar`, seis líneas) y la prueba que falla antes y pasa después | Un chequeo fijo es lo que Anthropic llama "el oráculo"; cuanto más exacto, mejor trabaja el agente **[L]** |
| A5 | **El revisor frío, de una vuelta, sin shell** | Encontró errores reales (una prueba que no veía la falta de un filtro, notas de `pulido`, encargo 09). Coincide con la guía oficial **[L]** |
| A6 | **El red team del encargo que toca plata** | En la noche 2 encontró tres problemas graves en cada uno de cuatro encargos, antes de lanzarlos (notas de `cola` 14:47, 17:40, 19:35 y 21:40) |
| A7 | **`secretos` y el candado con gitleaks** | Cuatro frenos útiles en dos noches (arriba). vibe-kit y los repos son públicos o tienen claves reales |
| A8 | **El actualizador por script, la zona propia y la fusión** (ADR-032) | No existe nada nativo que adapte una pieza por proyecto y la siga actualizando |
| A9 | **El presupuesto y la vara** (ADR-029, ADR-030, ADR-034) | Bajaron un paquete de 18 h y 21 M de tokens a ~3 h y 2 M (tracker, "Lecciones", D4.1) |
| A10 | **El observatorio y el "NO VERIFICADO"** | Casi nadie mide su propio uso para decidir qué cambiar; `/insights` hace una versión chica de lo mismo |

---

## Las propuestas

Cada una dice: **qué** (cambiar · sacar · sumar) · la evidencia · el costo (**chico**: textos y una prueba · **mediano**: un
script y sus pruebas · **grande**: diseño con red team) · cuál de las cuatro cosas de Guido mueve (flujo · mejor código ·
consistencia · acordarse de menos) · y adónde va. Todas pasan por la vara del ADR-030; las que no la pasan están en "Lo que no
propongo". Lo que la mirada 1 ya propuso no se repite: acá va lo que agrega mirar el sistema entero.

### Para la `rc.7`

| # | Qué | Evidencia | Costo | Mueve |
|---|---|---|---|---|
| **B1** | **Cambiar: un solo camino, el de fondo.** El kit declara que el director lanza a los obreros de fondo y que eso es lo normal; "la apertura del dueño" pasa a ser la excepción. Un obrero de fondo no manda mensajes: su resultado es que el proceso terminó, más lo que dejó en git. Una corrección es relanzar, y `presentar` trae lo corregido. Es el paraguas de las propuestas 7 y 10 de la mirada 1 | E10 (60 de 60 encargos de fondo), E1, E2; `director/SKILL.md:16`; `NUCLEO.md:14-28` | chico a mediano | flujo · consistencia · acordarse de menos |
| **B2** | **Cambiar: el turno de la suite.** Una sola corrida pesada del `comando-test` por PC a la vez (una fila en `verificar` y en `presentar`), y `presentar` no vuelve a correr la base si ese mismo commit ya pasó. De paso, los cuatro plazos fijos leen el `plazo-test` de la ficha (E13). Sin esto, "la noche termina sola" va a seguir tropezando con fallas que no son del código | E8, E13; ya estaba pedido como "script `turno`" y sin hacer (`tips/tanda-2026-11-contraste.md`, P70 **[L]**) | mediano | mejor código · flujo |
| **B3** | **Cambiar: un proceso de freno por comando, no cuatro, y un plazo acorde.** Un solo programa que carga los tres frenos del proyecto; el plazo deja de ser 20 s. Completa la propuesta 8 de la mirada 1 (que pide medir primero): acá está la causa y el número a medir | E7 | mediano, con red team | flujo · mejor código |
| **B4** | **Cambiar: cada autorización dice en cuál de las cinco puertas se abre.** Una tabla en el plano de la `rc.7` y en `manuales/MOLDE.md`. Para publicar: `autoMode` en el settings del usuario (lo escribe `preparar-pc`, con un clic) y la `allow` exacta en la línea de fondo. Para aprobar: `niega-aprobar` sube a los frenos de la PC (pruebas, 3g). Y decidir quién manda entre `sensible` y el clasificador cuando el repo dice `release` | E5; pruebas 2 y 3 | chico (la tabla); lo demás ya lo traen las pruebas | consistencia · acordarse de menos |
| **B5** | **Cambiar: el cierre de noche es una sesión de fondo en la carpeta principal**, no un `ExitWorktree` del director. Las dos vías andan de fondo (pruebas, 1a y 1e), pero solo esta está probada en la extensión de verdad (noche 1, 12:36), y la otra tiene la trampa de la consola que vuelve sola (mirada 1, R1). Es la propuesta 1 de la mirada 1: acá solo va el voto, con su razón | mirada 1, ítem 36 y R1; pruebas, prueba 1 | grande (ya contado en la mirada 1) | flujo |
| **B6** | **Cambiar: publicar sola, con red.** La ficha del repo dice si la noche publica; después de publicar corre la prueba de humo; y queda un aviso. No es un freno más: es el paso que falta para que el objetivo de la `rc.7` no dependa de la suerte | "Lo que le falta", 1; la guía oficial **[L]** | chico a mediano | mejor código |
| **B7** | **Cambiar: una sola lista de "te espera" y una sola definición de "encargo cerrado".** El `/estado` del dueño que pide la mirada 1 (propuesta 3) tiene que leer las cuatro fuentes, no dos: si no, el cambio que espera un clic sigue sin verse. Y `estado`, `noche` e `integrar` usan la misma función para decir si un encargo cerró. Sin esto, el `/estado` nuevo va a mostrar bien un dato que sigue saliendo de tres cuentas distintas | E11, E12 | mediano (va adentro de la propuesta 3 de la mirada 1) | consistencia · flujo |
| **C2** | **Sacar: el despertador.** No despierta (mirada 1, ítem 28 y R13) y lo nativo ya hace su trabajo | tabla de arriba; `noche.cjs:20` ("NO VERIFICADO, piloto") | chico | acordarse de menos |
| **C3** | **Sacar de las skills y del encargo lo que el camino de fondo no usa**: la tabla de mensajes para obreros de fondo, "dale las líneas al dueño" (`director/SKILL.md:16`) y el campo `Suscripción:` del encargo, que nadie lee (E14). `/director` está a 17 bytes del tope: sacar es además la forma de que entre lo nuevo | E10, E14; tracker, "Lo abierto" ("al borde del tope de 8.000") | chico | consistencia |
| **C4** | **Sacar: la regla del 40 % y "mudate antes de irte".** Lo que compactó fue la inactividad (mirada 1, ítem 31), y con contexto de un millón la cuenta ya no mide lo que importa. `contexto.cjs` queda solo como dato de `/estado`. Mientras no exista el director corto (V1), el remedio es el de la mirada 1 (propuesta 9) | mirada 1, ítem 31 y R5; `idleCompaction` **[L]** | chico | acordarse de menos |

**Un aviso para el plano de la `rc.7`**: el actualizador **nunca toca el `CLAUDE.md`** de un proyecto ya adoptado
(`kit/skills/arquitecto-skills/scripts/lib/catalogo.cjs:63`, trato `nunca`). La regla de cómo se le habla al dueño (mirada 1,
propuesta 5) y cualquier otra regla nueva tienen que ir en el núcleo o en las skills, que sí se actualizan: si van solo en el
`CLAUDE.md` del molde, a Deptos no le llegan.

### Para decidir con Guido (y después va a la `rc.7` o a la `v3.1`)

| # | Qué | Evidencia | Costo | Mueve |
|---|---|---|---|---|
| **C1** | **Sacar: `/tramo` y seis agentes del molde** (`implementador`, `verificador`, `explorador`, `lector`, `investigador`, `capturas`; se queda `revisor`). **Ojo: Guido ya frenó una vez "unificar obrero y tramo"** con un "¿es capricho?" (`docs/CICLO-DE-MEJORA.md:216-217`). Vuelve con evidencia nueva: cero usos en 60 encargos; `autorizado` lo rechaza ("tiene que decir obrero", mirada 1, R7); el director de `pulido` pasó a `obrero` los tres encargos que el spec pedía como `/tramo`, y anduvieron (notas de `pulido` 23:45); `investigador` y `capturas` no los lanza ningún paso **[L]**. Si Guido dice que sí: en la `rc.7` el kit deja de ofrecerlo (con eso se arregla R7), y los archivos se borran en la `v3.1`, cuando el actualizador sepa borrar en la flota. Si dice que no: `autorizado` tiene que aceptarlo | arriba | chico | consistencia · acordarse de menos |

### Para la `v3.1`

| # | Qué | Evidencia | Costo | Mueve |
|---|---|---|---|---|
| **V1** | **Cambiar: el director corto.** Un director por tramo, que nace leyendo el relevo y muere al cerrar el tramo; lo que hoy es prosa (`verificar` → merge → `tiempos` → subir → `cerrar`, seis comandos en `director/SKILL.md:18`) pasa a ser un comando. Candidato a "probar una idea nueva": la herramienta `Workflow`, que ya está en el binario de Guido | "Lo que le falta", 5; 12 y 7 negaciones por comandos compuestos (mirada 1, paso 9); dos directores leyeron distinto la misma skill (mirada 1, R3) | grande | flujo · consistencia |
| **V2** | **Sumar: el aviso al celular**, cuando la noche termina o cuando algo espera un clic. Va con el buzón, que es el mismo tema: cómo llega el kit a Guido. Antes, una prueba de 15 minutos: si `PushNotification` llega desde una sesión de la extensión | "Lo que le falta", 4; `tips/tanda-2026-11-contraste.md:562` lo tenía como NO VERIFICADO **[L]** | chico, si la prueba da bien | flujo |
| **V3** | **Sumar: el kit global como plugin. Vuelve algo descartado (REJ-001, ADR-001), y lo digo.** La condición escrita para reabrirlo era "si se publica para terceros". Evidencia nueva: la visión es un "pack regalable"; ya hay un segundo usuario, el compañero de Guido; instalarlo le costó (arriba); y los plugins de hoy llevan skills, agentes y frenos, y se actualizan desde un repo de git **[L]**. Solo la parte global: el Arquitecto, el Equipador, `relevamiento`, `docs-fyd`, `redteam-spec` y el freno `secretos`. El molde por proyecto, no: un plugin no se adapta. Tampoco lleva `CLAUDE.md` ni permisos **[L]**. Primero una prueba chica en un repo de prueba | arriba; `docs/REJECTED.md:7-8` | mediano | acordarse de menos · consistencia |
| **V4** | **Cambiar: los frenos, por evidencia.** Dos pasos. (1) El observatorio cuenta, sobre los `frenos.log` de toda la flota, qué regla frenó qué y cuántas veces fue inocente. (2) Lo hecho contra trampas (arriba) se saca de a una pieza, midiendo, con red team. Mientras tanto, una regla barata para la `rc.7`: no entra ningún patrón de freno nuevo que no sea un arreglo | "¿Está sobredimensionado?"; ADR-029; el método de Anthropic **[L]** | mediano | mejor código · acordarse de menos |
| **V5** | **Sumar: el costo de cada encargo en `tiempos.md`.** Lanzando al obrero con `--output-format json`, la sesión devuelve su costo y sus tokens al terminar (lo vi en la sesión de prueba). Hoy se mide a mano, y fue medir a mano lo que dio el ADR-029 | `observatorio/investigacion/costos.md` **[L]** | chico | flujo |
| **V6** | **Cambiar: `mesa` no crece hasta el diseño del buzón.** Nadie la usa en Deptos, ninguna skill de director u obrero la llama **[L]**, y el candado la revisa en cada `integrar` (`worktree.cjs:1045` **[L]**). El buzón se diseña mirando primero los mensajes nativos entre sesiones | tabla de arriba | — (es no invertir) | acordarse de menos |
| **V7** | **Sumar al ciclo de mejora la pregunta "¿qué sacamos?"**: una pieza por vuelta, medida. Y dos detalles: probar `/insights` una vez en la próxima vuelta, al lado del observatorio; y poner al día la línea "Integradas" del menú (`menu-skills.md:66`), que no nombra `/goal`, `/batch`, `/insights` ni `/doctor`. La pregunta entra justo en M6b, que escribe §3.5 y §8 de `CICLO-DE-MEJORA.md` | "Lo que le falta", 7 | chico | acordarse de menos · mejor código |
| **V8** | **Cambiar: que el director nazca adentro de su carpeta, sin `EnterWorktree`** (como los obreros). Desaparecen las negaciones "demasiado complejo" sobre su propio trabajo. Se pierde una red (que no toque la carpeta principal por error); los frenos del kit siguen. Es una decisión de diseño que la prueba 1 dejó planteada (punto 4): pide una prueba en la extensión antes | pruebas, prueba 1; E5 | mediano | flujo |
| **V9** | **Cambiar: medir el cierre de tramo.** Siete obreros enteros por noche para escribir papeles, y mientras tanto el director no puede anotar (E9). Antes de tocarlo, medir cuánto tardan y cuánto esperó el director; si es mucho, lo mecánico de la ficha (las casillas, los tiempos) lo escribe un script. Lo diseñó Guido en el repaso (`SPEC-paquete-8c.md:310`): no se cambia sin esa medición | E9 | chico (medir) | flujo |

### Lo que no propongo, y por qué

| # | Qué | Por qué no |
|---|---|---|
| N1 | Reemplazar los obreros `claude -p` por subagentes nativos, equipos de agentes, `claude --bg` o `/batch` | Lo de hoy anda y está medido. Los equipos son experimentales y no existen en `-p` **[L]**; `--bg` es vista previa y no se combina con `-p` **[L]**; un subagente comparte el aislamiento y el contexto del director. Un dato para el día que se reabra: el ADR-028 dice "un subagente no lanza otros" y hoy la doc dice que sí, hasta tres niveles **[L]** |
| N2 | Las noches en la nube (sesiones o rutinas programadas) | Trabajan sobre un clon de GitHub, sin `.env` ni archivos locales **[L]**; Deptos prueba contra bancos locales. Y "la noche termina sola" no las necesita |
| N3 | Un sistema de especificaciones de afuera (Spec Kit, OpenSpec, BMAD) o Superpowers entero | Ya descartados (`menu-skills.md:51-52`). No hay evidencia nueva, y la crítica que hoy se les hace es la misma por la que se descartaron: demasiado proceso para un arreglo chico **[L]** |
| N4 | Settings administrados para que un agente no pueda tocar los frenos | Es defensa contra trampas (ADR-029), y en una PC donde el dueño es administrador la propia doc dice que no es una garantía **[L]** |
| N5 | Más skills | El menú está bien curado y lo que falla no es de skills. Ninguna de las fricciones medidas se arregla instalando algo |
| N6 | Un tope de vueltas, de costo o de tiempo por obrero | Lo pide la guía oficial **[L]**, pero no encontré una noche donde haya dolido: sin cicatriz no entra (regla de Guido). Queda anotado acá por si aparece |

---

## Lo que no miré

- Hermes y los demás repos de la flota: si usan `/tramo` o `mesa`, NO VERIFICADO. Lo dicho sobre "nadie lo usa" vale para Deptos.
- `relevamiento` y `docs-fyd` por dentro; el Modo A del Arquitecto; las ~39 mil líneas de pruebas (solo las conté).
- **Del mapa de dónde vive cada dato** solo subí a la tabla lo que comprobé en el código (E11 a E14). Quedó afuera, sin
  verificar: que la clave `escribir-produccion` de la ficha no tiene lector; que ni el director ni el obrero leen `NORTE.md`;
  que el sello lo escribe la versión del kit de la PC y lo juzga la del proyecto; y que `verificar` no deja nada escrito (su
  veredicto vive en la charla hasta el merge). Los cuatro son de un lector **[L]** y valen una mirada al armar el plano.
- **Nada de esto se probó en una pestaña real de VS Code.** Lo de primera mano es el binario de la extensión, de fondo. Que
  `Workflow`, `PushNotification`, `claude agents` o `/insights` se comporten igual en el panel de la extensión: NO VERIFICADO.
- La doc oficial no trae fecha por página: va con la versión que nombra y con el día en que se leyó (2026-11-11).
- No verificado y dicho arriba: si un proceso de fondo adentro de un obrero `-p` se corta a los 30 minutos (la doc dice que en
  `-p` hay un tope de 30 min, máximo 2 h **[L]**, y la red visual de Deptos tarda 25 a 37); si los hooks de un mismo comando
  corren en paralelo o en fila; si los cuatro frenos "útiles" de las noches evitaron un daño real; cuánto pesa de verdad el
  cierre de tramo.
- Los porcentajes de "mecánica genérica" de cada script son la estimación de un lector, no una medida.
- De la comunidad: las cifras de adopción (estrellas, instalaciones) son de un investigador y varias vienen de blogs; sirven
  para decir "es extendido", no para citarlas.

## Fuentes

- **El kit** en `0ee101f` (la base de esta sesión). `docs/DECISIONS.md` (ADR-001, 027, 028, 029, 030, 032, 034),
  `docs/REJECTED.md`, `kit/skills/arquitecto-skills/menu-skills.md`, `docs/MISION-Y-VISION.md`, `docs/CICLO-DE-MEJORA.md`,
  el tracker (`docs/kit-v3/PLAN-construccion.md:1307-1363` y `:2068-2177`), las skills del molde y `kit/molde/settings.json`.
- **Los dos informes anteriores**: `docs/kit-v3/REVISION-rc7-mirada1.md` y `docs/kit-v3/REVISION-rc7-pruebas.md`.
- **Deptos**, `origin/main`, solo lectura: `docs/modulos/{pulido,cola}/bitacora/` (reportes finales, `notas-del-metodo.md`, los
  60 encargos), `docs/modulos/cola/tiempos.md`, `.claude/frenos.log` y `.claude/kit.md`.
- **Claude Code 2.1.322** (el binario de la extensión de VS Code): `--help`, `agents --help`, `plugin --help`,
  `auto-mode --help`, `agents --json`, y una sesión `-p` mínima con `--output-format stream-json`.
- **La doc oficial** (code.claude.com/docs/en/, leída el 2026-11-11 por dos investigadores): `worktrees`, `tools-reference`,
  `sub-agents`, `agent-teams`, `agent-view`, `workflows`, `scheduled-tasks`, `routines`, `cross-session-messaging`,
  `remote-control`, `headless`, `claude-code-on-the-web`, `permission-modes`, `auto-mode-config`, `permissions`, `sandboxing`,
  `hooks`, `context-window`, `skills`, `plugins`, `memory`, `managed-settings`, `best-practices`, `goal`.
- **Anthropic** (anthropic.com/engineering y claude.com/blog, leído por un investigador): "Building effective agents"
  (2024-12-19), "Effective context engineering" (2025-09-29), "Effective harnesses for long-running agents" (2025-11-26),
  "Demystifying evals" (2026-01-09), "Building a C compiler with a team of parallel Claudes" (2026-02-05), "Harness design for
  long-running application development" (2026-03-24), "Claude Code auto mode" (2026-03-25), "Scaling Managed Agents"
  (2026-04-08), "Multi-agent coordination patterns" (2026-04-10), "How we contain Claude" (2026-05-25), "Components of agent
  memory" (2026-11-06).
- **La comunidad** (un investigador, con fecha; lo marcado como opinión suelta no se usó para decidir): el Radar de Thoughtworks
  de noviembre de 2026 sobre OpenSpec, el análisis de Birgitta Böckeler sobre las herramientas de especificación (octubre de
  2025), los repos de Spec Kit, Superpowers y `ccusage`, y la ficha del plugin `ralph-loop`.
- **El observatorio**: las cinco tandas de `tips/` y `observatorio/investigacion/` (`costos.md`, `mediciones/2026-11-03.md`),
  resumidas por un lector.
