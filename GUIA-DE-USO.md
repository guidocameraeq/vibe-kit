# GUÍA DE USO — cómo se usa todo esto

> La guía práctica del sistema completo, organizada por situación: **"quiero X → hacé Y"**.
> No repite procedimientos (viven en el kit y las skills — si algo difiere, ganan ellos);
> te dice qué decir, dónde, y qué esperar. Actualizada 2026-07-24 (docs-fyd v2 + Equipador auto-update).

## El mapa mental en 30 segundos

Tu sistema tiene **3 niveles**, cada uno con su herramienta:

| Nivel | Herramienta | Se usa… |
|---|---|---|
| **La máquina** (esta PC, la del SAAS, cualquiera) | El Equipador (`/arquitecto-skills`) | Al estrenar una PC, actualizar skills, o traer lo último (*"actualizate"*) |
| **Cada proyecto** (Perseo, el ERP, apps nuevas) | `inicio` / `cierre` + su CLAUDE.md | Todos los días |
| **Este repo** (el método mismo) | El Arquitecto, el Extractor, el playbook | Al arrancar proyectos, procesar tips, o mejorar el método |

Y la regla que gobierna todo: **el contexto vive en archivos, los chats se descartan.**

---

## Recetas por situación

### 💡 "Tengo una idea de app nueva"
Chat nuevo en cualquier lado → **`/arquitecto` + tu idea en una frase**.
Te entrevista (una pregunta por vez, con "Recomendado"), piensa lo que no ves venir, te
muestra el plano, y con tu OK monta TODO. Al final te da el prompt exacto para el chat
constructor. Atajo si tenés apuro: *"dale con los defaults"*.
→ Detalle completo: `guias/COMO-USAR-EL-ARQUITECTO.md` (caso A)

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
compartida, tokens) — vos elegís, no escribís. Completás lo que falte en `_CAMPOS-NEGOCIO.md` /
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
