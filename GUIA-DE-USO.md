# GUÍA DE USO — cómo se usa todo esto

> La guía práctica del sistema completo, organizada por situación: **"quiero X → hacé Y"**.
> No repite procedimientos (viven en el kit y las skills — si algo difiere, ganan ellos);
> te dice qué decir, dónde, y qué esperar; el detalle está en `manuales/`. Actualizada 2026-11-03 (kit v3: las cinco entradas del
> Arquitecto, el Equipador, director y obrero, `/estado`, la noche).

## El mapa mental en 30 segundos

Tu sistema tiene **3 niveles**, cada uno con su herramienta:

| Nivel | Herramienta | Se usa… |
|---|---|---|
| **La máquina** (esta PC, la del SAAS, cualquiera) | El Equipador (`/arquitecto-skills`) | Al estrenar una PC, actualizar skills, traer lo último (*"actualizate"*) o poner al día la flota |
| **Cada proyecto** (Perseo, el ERP, apps nuevas) | `inicio` / `cierre` + su CLAUDE.md (y `/estado`, director y obrero en el kit v3) | Todos los días |
| **Este repo** (el método mismo) | El Arquitecto, el Extractor, el playbook | Al arrancar proyectos, procesar tips, o mejorar el método |

El Arquitecto es **la puerta**: si no sabés a quién llamar, `/arquitecto` y lo que querés; él te deriva.

Y hay un **paso previo**, que sólo aparece cuando el pedido **vino de otra persona**: `/relevamiento`
(entender el problema con la gente, antes de que exista un plano). En lo tuyo no aparece nunca.

Y la regla que gobierna todo: **el contexto vive en archivos, los chats se descartan.**

---

## Recetas por situación

### 🙋 "Quiero pedir algo" (en un proyecto)
Pedilo en el chat del proyecto. La sesión te dice primero el tamaño: *"chico, lo hago acá"* o *"esto es más que chico: llamo al
Arquitecto"*, y lo llama sola (en un proyecto v2, sin esa regla, lo llamás vos). → [`manuales/COMO-USAR-EL-ARQUITECTO.md`](manuales/COMO-USAR-EL-ARQUITECTO.md) §2

### 💡 "Tengo una idea de app nueva"
Chat nuevo en cualquier lado → **`/arquitecto` + tu idea en una frase**.
Te entrevista (una pregunta por vez, con "Recomendado"), piensa lo que no ves venir, te
muestra el plano, y con tu OK monta TODO. Al final te da el prompt exacto para el chat
constructor. Atajo si tenés apuro: *"dale con los defaults"*.
**Esto NO cambió con `/relevamiento`**: si la idea es tuya, seguís yendo directo al Arquitecto,
y él no se entera de que existe ningún relevamiento. Es así por construcción, no por prolijidad.
→ Detalle completo: [`manuales/COMO-USAR-EL-ARQUITECTO.md`](manuales/COMO-USAR-EL-ARQUITECTO.md) §3 (Modo A)

### 📥 "Me pidieron algo en el laburo"
Otra persona te paró en el pasillo, o te mandó un mail, y hay que averiguar de qué se trata antes
de diseñar nada. Chat nuevo → **`relevamiento`** y contá lo que sepas, **de corrido y como te salga**
— no te sientes a llenar un formulario, dictá y él ordena.
Te lleva por las 4 etapas de tu método, el que aprobó tu jefe (problema → sistema actual → necesidad
→ propuesta de valor), **te saca un PDF cada vez que cerrás una etapa** (eso es lo que llevás a la
reunión) y te arma la **hoja de campo** para cuando salís a hablar con gente — con una regla impresa
arriba que vale el papel entero: *no expliques la solución, preguntá cómo lo hace hoy* (si contás la
idea, te dicen que sí, y después no la usa nadie).
Al final te muestra **seis caminos posibles, y construir software es sólo uno**: seguir igual,
arreglar lo que ya usan, cambiar el proceso, prender algo que ya pagaron y nadie usa, comprar, o
construir. Las que no aplican las descarta **con la razón escrita** — eso es lo que evita que dentro
de un año alguien re-proponga lo mismo. Sólo si elegís construir te da la línea exacta para pegarle
al Arquitecto; si no, te escribe la propuesta igual — un "no construir" bien fundado es una entrega,
no un fracaso.
- **Si ya tenés algo escrito** (una planilla del método llena, un Word, la cadena de mails, las notas
  de una reunión) → **pasásela**: *"te paso lo que ya tenemos"*. La mapea campo por campo y sigue
  desde ahí. Te va a preguntar **una sola cosa: quién la llenó** — porque no es lo mismo que la haya
  llenado alguien hablando con la gente que vos de memoria, y de eso depende cuánto de ese documento
  está realmente verificado. **Ojo: que una etapa venga llena no la da por cerrada** — le pasa el
  revisor igual, que es justo donde va a encontrar las deudas.
- **Si lo invocaste por error** o era algo tuyo: la primera pregunta te deja salir en **1 clic**, y
  antes de eso no creó ni un archivo. Con la carpeta ya creada, decí **"cancelá"** y borra todo.
- **Volvés de hablar con alguien** → decile *"volví de hablar con Marcela"* y pegale lo que anotaste.
  Es lo único que hace que una respuesta cuente como **relevada** en vez de "de memoria".
- **Te llena de preguntas** → *"basta de preguntas de más"*. Cada pregunta al pedo **muere en un clic
  y no vuelve nunca**.
- **Lo dejás 3 semanas** → no pasa nada, no te persigue. Volvés, decís `relevamiento`, y retoma en
  3 líneas.
- A las 6 semanas de que la cosa esté en uso te va a preguntar **si sirvió** — con el criterio que
  vos mismo escribiste. Es el único lazo que el método en papel no cerraba.
→ **La hoja de una página, para tener a mano**: `manuales/HOJA-DE-MANO-relevamiento.md`
→ Detalle: `kit/skills/relevamiento/SKILL.md` · el porqué: ADR-016 a 019.

### 🔨 "Quiero trabajar en un proyecto que ya anda"
Chat nuevo **en la carpeta del proyecto** → decís **`inicio`** → te confirma dónde están en
3 líneas → le das la misión → trabajás → **`cierre`** → chat a la basura.
Cambió la misión → cambiá el chat. Compactar es emergencia (*"cierre parcial"*), no rutina.
→ Qué hacen `inicio` y `cierre` en el kit v3: [`manuales/ROLES.md`](manuales/ROLES.md) §1

### 🏗️ "Quiero una feature más que chica en una app existente"
Chat nuevo **en la carpeta de esa app** → **`/arquitecto`** (o lo llama la sesión sola, si midió "más que chico"): explora el código
(Modo B), deja el **spec delta sellado** y el módulo armado, y te da la línea para la sesión que lo construye (con director: una
sesión nueva en tu ventana de siempre, primer mensaje `/director <x>`; entra sola al worktree del módulo).
→ [`manuales/COMO-USAR-EL-ARQUITECTO.md`](manuales/COMO-USAR-EL-ARQUITECTO.md) §4

### 🧭 "Tengo un módulo con director andando"
Quién hace qué y qué te toca a vos: el director → [`manuales/ROLES.md`](manuales/ROLES.md) §3, el obrero → §4, lo que es solo tuyo → §9.
Al cerrar cada tramo, un obrero de cierre deja la ficha al día: el arranque te dice `tramo N cerrado · próximo: …`. A `main` sube solo el director.

### 👋 "Me voy" (y quedó un módulo con director andando)
Decile **"me voy"** al director: sin preguntarte nada te muestra el checklist de la noche y qué queda andando. Cuando volvés, tu
`/inicio` o `/estado` le avisa que ya es de día. → [`manuales/ROLES.md`](manuales/ROLES.md) §7

### 📊 "¿Cómo vamos?"
**`/estado`** en el proyecto (o `/estado <módulo>`): lo que te espera arriba, el avance medido de cada módulo, qué pestañas cerrar.
*"¿Cómo terminamos?"* suma el resumen del día. → [`manuales/ROLES.md`](manuales/ROLES.md) §6

### 🔏 "La sesión me pide aprobar un cambio de freno"
Leé la regla en "Te espera" del handoff y, si estás de acuerdo, pedíselo a la sesión en la pestaña principal: `cambios aprobar` lo corre la sesión cuando el dueño lo pide, y su clic en la ventana es la firma; nunca por su cuenta.
Desde otra pestaña, de noche o en bypass se niega solo. → [`manuales/ROLES.md`](manuales/ROLES.md) §9

### 📋 "Necesito documentar un repo para la auditoría FyD"
Chat nuevo **en la carpeta de esa app** → **`/docs-fyd`**. Deriva del código los 10 documentos que
pide FyD (en `docs-fyd/`, aislado), y **cuando duda te pregunta por opciones** (backups, RLS, base
compartida, tokens — según lo que el repo tenga) — vos elegís, no escribís. Completás lo que falte en `_CAMPOS-NEGOCIO.md` /
`_ACLARACIONES.md`, y antes de entregar corrés **`docs-fyd auditar`** (te dice qué quedó viejo, qué
dudas faltan, y si hay secretos). Un repo por vez.
→ Detalle: `kit/skills/docs-fyd/SKILL.md` · el inventario central (Excel) es Fase 2 (a mano desde tu Kanban).

### 🗣️ "Vengo charlando algo en un chat y tomó forma de feature"
Quedate en ese chat y llamá a **`/arquitecto`**: con el plan ya charlado entra en **Modo B corto** (sin entrevista), lo sella y te da
la línea para el chat que lo construye. Un spec sin sello no lo ejecuta nadie. → [`manuales/COMO-USAR-EL-ARQUITECTO.md`](manuales/COMO-USAR-EL-ARQUITECTO.md) §4

### 🤔 "No sé cómo pedirle esto a Claude / quiero armar un prompt o una skill"
**`/arquitecto`** y contale: el consultorio te devuelve el prompt listo para pegar, un veredicto con su regla, o el brief para
armar la skill. → [`manuales/COMO-USAR-EL-ARQUITECTO.md`](manuales/COMO-USAR-EL-ARQUITECTO.md) §5

### 📱 "Guardé TikToks con tips de vibe coding"
Abrí Claude Code en **`observatorio/extractor/`** (VSCode → Abrir carpeta) → **pegá los links** — nada más.
El agente extrae, verifica y deja el informe en `tips/`. Después, chat en la raíz de este
repo: *"leé tips/tanda-<fecha> y procesemos las conclusiones"* — ahí decidís qué entra.
→ Detalle completo: `observatorio/extractor/COMO-USAR-EL-EXTRACTOR.md`

### 💻 "Preparame esta PC" (PC nueva, o actualizar la del SAAS)
Decile al Equipador (o al Arquitecto) **"preparame esta PC"**: te hace **una sola pregunta**, deja el kit, los frenos y los ajustes
de Claude Code, y cierra con "reiniciá Claude Code". Anda desde la beta del kit v3 (baja el último tag anotado).
→ [`manuales/EQUIPADOR.md`](manuales/EQUIPADOR.md) §1

### 🔄 "Actualizate" (traer lo último del kit a esta PC)
**`actualizate`**: el mismo camino que "preparame esta PC", y reiniciás Claude Code. → [`manuales/EQUIPADOR.md`](manuales/EQUIPADOR.md) §2

### 🧰 "Quiero instalar una skill nueva / ver qué skills tengo"
**`/arquitecto-skills`**: *"instalame skills"*, *"qué skills tengo"*, *"actualizá las skills"*, *"agregá tal skill al menú"* (nada
entra sin curaduría). Los frenos de la PC: *"instalar hooks por PC"* y *"corré el doctor"* (solo mira). → [`manuales/EQUIPADOR.md`](manuales/EQUIPADOR.md) §3, §4 y §6

### 🚚 "Poné al día la flota" / "Adoptá X"
*"Poné al día la flota"* (o *"poné al día Hub"*): cada repo se actualiza en una copia temporal (tu carpeta no se toca) y te vuelve una
tabla. Un repo que todavía no tiene el kit v3: *"adoptá X"* (primero mira, con tu OK aplica). Antes, la PC al día: si el kit tiene
una versión más nueva que la de esta PC, primero *"actualizate"* (si no, el repo nace con el molde viejo). → [`manuales/EQUIPADOR.md`](manuales/EQUIPADOR.md) §5

### 🔀 "El `/inicio` me pregunta por una skill que adapté"
El kit trajo una versión nueva justo donde vos la habías cambiado: la mezcla chocó y **nunca se resuelve sola**. La sesión te cuenta
qué skill es, por qué la habías adaptado, qué trae la nueva y dónde chocan, te recomienda una salida y lo decidís charlando (mezclar ·
quedarte con la tuya · tomar la nueva · congelar). → [`manuales/EQUIPADOR.md`](manuales/EQUIPADOR.md) §5

### 📈 "¿Qué aprendieron mis proyectos que debería subir al kit?"
*"¿Cómo está la flota?"* (la tabla de proyectos) o *"qué se repite en la flota"* (qué regla está en 3+ proyectos o tiene cicatriz
grave; las urgentes te aparecen en el `/inicio` de este repo). → [`manuales/EQUIPADOR.md`](manuales/EQUIPADOR.md) §5

### 🔧 "Quiero cambiar algo del método / del Arquitecto / del menú"
Chat nuevo **en la raíz de este repo** → pedilo. La regla la sabe Claude: se edita en `kit/`,
se sincroniza a `~/.claude/`, y `cierre` deja todo commiteado y pusheado.
NUNCA editar `~/.claude/` directo.

### 😤 "Claude repitió un error / le expliqué lo mismo 3 veces"
Es LA señal del sistema: *"esto va al CLAUDE.md"* (del proyecto donde pasó) o *"esto merece
una skill"*. Cada corrección repetida que no se escribe es una que vas a repetir.

### 🕰️ "Vuelvo a este repo después de semanas (o sin Fable)"
Abrí un chat acá y listo: el hook te inyecta el handoff, los pendientes y los últimos
commits. Para el "por qué" de cualquier cosa: `docs/DECISIONS.md` (los ADRs) y
`docs/REJECTED.md`; el mapa de `docs/` está en `docs/README.md`. Ningún chat viejo hace falta.

### ✂️ "El arranque dice CORTADO" (o un proyecto viejo arranca sin saber dónde quedó)
La plataforma corta lo que inyecta el hook en 10.000 caracteres. Desde el kit v2.4.3 el hook del molde
lo avisa y termina con la huella `inyectado: N …` (en el kit v3, `inyectado: N de 9.700`, y el `/inicio` lee
solo lo que falta). Si dice CORTADO: *"leé el resto del handoff y en el cierre achicalo"*. Un proyecto armado
antes de la v2.4.3 no tiene el hook nuevo: se arregla adoptándolo al kit v3 (*"adoptá X"*, arriba).

### 🔎 "Quiero volver a investigar mis chats (o los de otra PC)"
Chat nuevo acá → *"investigación de chats, desde el último corte, seguí `observatorio/investigacion/METODO.md`"*.
El método paso a paso está en `observatorio/investigacion/METODO.md`; los scripts al lado; la fecha de corte
de la anterior en `tips/tanda-2026-10-chats.md` §0; lo ya hallado en `D:\vibe-hallazgos\` (PC
`clientes`). Otra PC se suma por Remote Control: su dueño da el OK en su pantalla.

---

## Las frases mágicas (chuleta)

| Decís… | Pasa… |
|---|---|
| `/arquitecto` + idea | Entrevista → plano → proyecto montado (o spec delta si hay código, o consultorio) |
| `relevamiento` | **Te pidieron algo**: dictás de corrido y sale el método de 4 etapas con PDF por etapa |
| `cancelá` | (adentro de un relevamiento) borra todo y se apaga. Sin repreguntar |
| `volví de hablar con <fulano>` | Lo que traés pasa a contar como **relevado**, no como "de memoria" |
| `te paso lo que ya tenemos` | Arranca desde una planilla ya llena, un Word o unos mails, en vez de cero |
| `basta de preguntas de más` | Las lentes siguen anotando pero dejan de preguntar (`prendé las lentes` revierte) |
| `relevamiento sirvió` | A las 6 semanas: ¿se cumplió el criterio que escribiste? Con el número, no con la sensación |
| `inicio` | El chat del proyecto arranca sabiendo dónde están |
| `cierre` | Docs al día, commit, push — chat descartable |
| `cierre parcial` | Emergencia pre-compactación: guarda el estado y seguís |
| `dale con los defaults` | El Arquitecto salta a confirmar solo las 2 decisiones irreversibles |
| `/arquitecto` con el plan ya charlado | Modo B corto: sin entrevista, la charla se vuelve un spec sellado que ejecuta otra sesión |
| `/estado` · `¿cómo terminamos?` | Cómo vamos: lo que te espera arriba, el avance de cada módulo · más el resumen del día |
| `me voy` | (al director) El checklist de la noche y qué queda andando; tu `/inicio` al volver dice que ya es de día |
| `cambios aprobar <id>` | Aprobar un cambio de freno, en la pestaña principal: `cambios aprobar` lo corre la sesión cuando el dueño lo pide, y su clic en la ventana es la firma; nunca por su cuenta |
| `preparame esta PC` | El Equipador deja la PC entera lista: kit, frenos y ajustes, con una sola pregunta |
| `instalame skills` | El Equipador instala lo que falte del menú curado |
| `/docs-fyd` | Documenta el repo para la auditoría FyD (te pregunta por opciones lo que el código no sabe) |
| `docs-fyd auditar` | Chequeo antes de entregar a FyD: qué quedó viejo, dudas abiertas, secretos — no escribe |
| `actualizate` | El Equipador baja lo último del repo y se actualiza a sí mismo |
| `instalar hooks por PC` · `corré el doctor` | El Equipador pone los frenos de la PC (con plan y vuelta atrás) · revisa qué anda |
| `poné al día la flota` · `adoptá X` | Cada repo al día en una copia temporal, con una tabla · un repo sin kit v3 pasa a tenerlo, con tu OK |
| *(pegar links en `observatorio/extractor/`)* | Informe de tips con veredictos, listo para procesar |

## Dónde profundizar

- **El método completo** (por qué de todo): `PLAYBOOK-MAESTRO.md`
- **El Arquitecto** (las cinco entradas, el tamaño, Modo A y B, el sello): [`manuales/COMO-USAR-EL-ARQUITECTO.md`](manuales/COMO-USAR-EL-ARQUITECTO.md)
- **El Equipador** (la PC, `doctor`, poner al día la flota, adoptar): [`manuales/EQUIPADOR.md`](manuales/EQUIPADOR.md)
- **Director, obrero, tramo, `/estado`, la noche y la mesa**: [`manuales/ROLES.md`](manuales/ROLES.md)
- **Qué trae un proyecto con el kit v3** (la ficha, `docs/`, los frenos, el registro de cambios): [`manuales/MOLDE.md`](manuales/MOLDE.md)
- **Cada script del kit**, qué hace y cómo se llama: [`manuales/SCRIPTS.md`](manuales/SCRIPTS.md)
- **Si se filtró una credencial**: [`manuales/se-filtro-una-credencial.md`](manuales/se-filtro-una-credencial.md)
- **`/relevamiento` en una hoja** (para tener a mano cuando te piden algo): `manuales/HOJA-DE-MANO-relevamiento.md`
- **Instalar en otra PC**: *"preparame esta PC"* ([`manuales/EQUIPADOR.md`](manuales/EQUIPADOR.md) §1); `kit/INSTALAR.md` es el plan B a mano (copia las skills, sin los frenos de la PC)
- **Por qué el kit es como es**: `docs/DECISIONS.md` · lo que se descartó: `docs/REJECTED.md`
- **Para qué existe todo esto** (y qué NO hace): `docs/MISION-Y-VISION.md`
- **Qué está pendiente**: `docs/TODO.md` (única fuente) · qué trajo cada versión: `docs/CHANGELOG.md`
