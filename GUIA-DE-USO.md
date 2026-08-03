# GUÍA DE USO — cómo se usa todo esto

> La guía práctica del sistema completo, organizada por situación: **"quiero X → hacé Y"**.
> No repite procedimientos (viven en el kit y las skills — si algo difiere, ganan ellos);
> te dice qué decir, dónde, y qué esperar. Actualizada 2026-08-03 (`/relevamiento`: el tramo de ANTES del Arquitecto).

## El mapa mental en 30 segundos

Tu sistema tiene **3 niveles**, cada uno con su herramienta:

| Nivel | Herramienta | Se usa… |
|---|---|---|
| **La máquina** (esta PC, la del SAAS, cualquiera) | El Equipador (`/arquitecto-skills`) | Al estrenar una PC, actualizar skills, o traer lo último (*"actualizate"*) |
| **Cada proyecto** (Perseo, el ERP, apps nuevas) | `inicio` / `cierre` + su CLAUDE.md | Todos los días |
| **Este repo** (el método mismo) | El Arquitecto, el Extractor, el playbook | Al arrancar proyectos, procesar tips, o mejorar el método |

Y hay un **paso previo**, que sólo aparece cuando el pedido **vino de otra persona**: `/relevamiento`
(entender el problema con la gente, antes de que exista un plano). En lo tuyo no aparece nunca.

Y la regla que gobierna todo: **el contexto vive en archivos, los chats se descartan.**

---

## Recetas por situación

### 💡 "Tengo una idea de app nueva"
Chat nuevo en cualquier lado → **`/arquitecto` + tu idea en una frase**.
Te entrevista (una pregunta por vez, con "Recomendado"), piensa lo que no ves venir, te
muestra el plano, y con tu OK monta TODO. Al final te da el prompt exacto para el chat
constructor. Atajo si tenés apuro: *"dale con los defaults"*.
**Esto NO cambió con `/relevamiento`**: si la idea es tuya, seguís yendo directo al Arquitecto,
y él no se entera de que existe ningún relevamiento. Es así por construcción, no por prolijidad.
→ Detalle completo: `guias/COMO-USAR-EL-ARQUITECTO.md` (caso A)

### 📥 "Me pidieron algo en el laburo"
Otra persona te paró en el pasillo, o te mandó un mail, y hay que averiguar de qué se trata antes
de diseñar nada. Chat nuevo → **`relevamiento`** y contá lo que sepas, **de corrido y como te salga**
— no te sientes a llenar un formulario, dictá y él ordena.
Te lleva por las 4 etapas del método que armaste con tu jefe (problema → sistema actual → necesidad
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
→ Detalle: `kit/skills/relevamiento/SKILL.md` · el porqué: ADR-016/017.

### 🔨 "Quiero trabajar en un proyecto que ya anda"
Chat nuevo **en la carpeta del proyecto** → decís **`inicio`** → te confirma dónde están en
3 líneas → le das la misión → trabajás → **`cierre`** → chat a la basura.
Cambió la misión → cambiá el chat. Compactar es emergencia (*"cierre parcial"*), no rutina.

### 🏗️ "Quiero una feature grande o riesgosa en una app existente"
Chat nuevo **en la carpeta de esa app** → **`/arquitecto`** → detecta que hay código (Modo B),
lo explora primero, charlan anclados a lo real, y deja el **spec delta** (con su "qué NO se
toca") listo para que una sesión fresca lo construya.
Para features chicas: ni Arquitecto ni spec — pedila directo en el chat del proyecto.
Regla de bolsillo: si sale en una tarde y no toca permisos/datos/plata → directo; si no → spec.

### 📋 "Necesito documentar un repo para la auditoría FyD"
Chat nuevo **en la carpeta de esa app** → **`/docs-fyd`**. Deriva del código los 10 documentos que
pide FyD (en `docs-fyd/`, aislado), y **cuando duda te pregunta por opciones** (backups, RLS, base
compartida, tokens — según lo que el repo tenga) — vos elegís, no escribís. Completás lo que falte en `_CAMPOS-NEGOCIO.md` /
`_ACLARACIONES.md`, y antes de entregar corrés **`docs-fyd auditar`** (te dice qué quedó viejo, qué
dudas faltan, y si hay secretos). Un repo por vez.
→ Detalle: `kit/skills/docs-fyd/SKILL.md` · el inventario central (Excel) es Fase 2 (a mano desde tu Kanban).

### 🗣️ "Vengo charlando algo en un chat y tomó forma de feature"
Quedate en ese chat: **"cristalizá todo esto en un spec"** → lo revisás → chat nuevo:
`inicio — ejecutá el spec docs/SPEC-X.md`. (Y si te olvidás de pedirlo, Claude te lo va a
ofrecer solo — es regla de tus CLAUDE.md.)

### 🤔 "No sé cómo pedirle esto a Claude / quiero armar un prompt o una skill"
**`/arquitecto`** y contale — el Modo C (consultorio) te entrevista sobre la traba y te
entrega el prompt listo para pegar, o la skill armada.

### 📱 "Guardé TikToks con tips de vibe coding"
Abrí Claude Code en **`extractor/`** (VSCode → Abrir carpeta) → **pegá los links** — nada más.
El agente extrae, verifica y deja el informe en `tips/`. Después, chat en la raíz de este
repo: *"leé tips/tanda-<fecha> y procesemos las conclusiones"* — ahí decidís qué entra.
→ Detalle completo: `guias/COMO-USAR-EL-EXTRACTOR.md`

### 💻 "Estoy en una PC nueva (o quiero actualizar la del SAAS)"
**PC nueva:** `git clone` del repo → abrir Claude Code en `kit/` → pegar el prompt de
`kit/INSTALAR.md`. Se instala solo y al final te ofrece equipar la máquina con el menú curado.
Sin git: el zip de `Desktop\Arquitecto en otras PCs\`.
**Actualizar una PC que ya lo tiene:** decile al Equipador **`actualizate`** (o *"actualizá el
kit"*) — baja lo último del repo canónico y se actualiza a sí mismo (con diff antes de pisar).
Reiniciás Claude Code y listo. *(La 1ra vez en una PC con el Equipador viejo va con el prompt
manual de actualización; de ahí en más, "actualizate".)*

### 🧰 "Quiero instalar una skill nueva / ver qué skills tengo"
**`/arquitecto-skills`**: *"preparame esta máquina"* (instala lo que falte del menú),
*"qué skills tengo"* (censo), *"actualizá las skills"* (update del menú con diff),
**`actualizate`** (el propio kit se baja lo último del repo y se auto-actualiza), *"agregá tal
skill al menú"* (la investiga primero — nada entra sin curaduría).

### 🔧 "Quiero cambiar algo del método / del Arquitecto / del menú"
Chat nuevo **en la raíz de este repo** → pedilo. La regla la sabe Claude: se edita en `kit/`,
se sincroniza a `~/.claude/`, y `cierre` deja todo commiteado, pusheado y con el zip al día.
NUNCA editar `~/.claude/` directo.

### 😤 "Claude repitió un error / le expliqué lo mismo 3 veces"
Es LA señal del sistema: *"esto va al CLAUDE.md"* (del proyecto donde pasó) o *"esto merece
una skill"*. Cada corrección repetida que no se escribe es una que vas a repetir.

### 🕰️ "Vuelvo a este repo después de semanas (o sin Fable)"
Abrí un chat acá y listo: el hook te inyecta el handoff, los pendientes y los últimos
commits. Para el "por qué" de cualquier cosa: `docs/DECISIONS.md` (15 ADRs) y
`docs/REJECTED.md`. Ningún chat viejo hace falta.

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
| `cristalizá esto en un spec` | La charla se vuelve un plano ejecutable por otra sesión |
| `preparame esta máquina` | El Equipador instala el menú curado |
| `/docs-fyd` | Documenta el repo para la auditoría FyD (te pregunta por opciones lo que el código no sabe) |
| `docs-fyd auditar` | Chequeo antes de entregar a FyD: qué quedó viejo, dudas abiertas, secretos — no escribe |
| `actualizate` | El Equipador baja lo último del repo y se actualiza a sí mismo |
| *(pegar links en `extractor/`)* | Informe de tips con veredictos, listo para procesar |

## Dónde profundizar

- **El método completo** (por qué de todo): `PLAYBOOK-MAESTRO.md`
- **El Arquitecto y el Equipador a fondo**: `guias/COMO-USAR-EL-ARQUITECTO.md`
- **Instalar en otra PC**: `kit/INSTALAR.md` (o la carpeta del Escritorio con los PDFs)
- **Por qué el kit es como es**: `docs/DECISIONS.md` · lo que se descartó: `docs/REJECTED.md`
- **Qué está pendiente**: sección Pendientes del `README.md` (única fuente)
