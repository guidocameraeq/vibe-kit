# Pipeline de tips (TikToks → informe) — prompt para la sesión extractora

> **Cómo se usa**: abrí un chat nuevo (sirve cualquier modelo — Opus alcanza y ahorra cuota)
> en la carpeta `Guia de vibe coding`, pegá el prompt de abajo + los links, y esperá el
> informe. Después, en un chat con Fable: *"leé tips/tanda-<fecha>.md y procesemos las
> conclusiones"* — ahí se decide qué entra al sistema.

---

## El prompt (copiá el bloque + tus links)

```
Leé primero tips/COMO-EXTRAER.md y seguí ese pipeline EXACTAMENTE para procesar
los TikToks de abajo:

1. Extraé el contenido según el tipo de post (video → yt-dlp con subs, o Whisper
   vía VPS con formato h264 explícito; carrusel de fotos → caption por navegador
   y pedime capturas de los slides — no pelees con el visor).
2. Evaluá cada tip con los 3 baldes del doc (ya-lo-tenemos con su dónde /
   bueno-y-nuevo verificado contra doc oficial / humo-descartado-con-razón),
   usando PLAYBOOK-MAESTRO.md y ~/.claude/skills/arquitecto-skills/menu-skills.md
   como referencia de lo que el sistema ya tiene.
3. Escribí el informe en tips/tanda-<fecha de hoy>.md con el formato del ejemplo
   tips/tanda-2026-07-08.md, terminando con la sección "Propuestas para aprobar"
   (checkboxes).
4. Commit + push del informe. NO apliques NINGÚN cambio al sistema (playbook,
   menú, skills, kit): esta sesión SOLO extrae, verifica y escribe el informe.

Links:
- <link 1>
- <link 2>
- <link 3>
```

## El pipeline (para la sesión que ejecuta)

### 1. Extracción, por tipo de post

- **Paso 0 — dedup ANTES de transcribir** (lección tanda 2: 4 de 15 links eran repetidos =
  25% de ahorro): sacá `--dump-json` de todos los links primero y cruzá **id/título/duración**
  contra los informes previos (`tips/tanda-*.md`) y contra la misma tanda. Duplicado → veredicto
  heredado, sin Whisper.
- **Video** (URL `/video/`): `~/tools/yt-dlp.exe` ya está instalado (si no: bajar de
  github.com/yt-dlp/yt-dlp/releases → yt-dlp.exe).
  1. Metadata + subs: `yt-dlp --dump-json --no-download <url>` → caption; si `subtitles`
     trae algo, bajarlos con `--write-subs --skip-download` y listo (gratis).
  2. Sin subs → **Whisper vía VPS** (la key vive allá, NUNCA acá): bajar el video con
     formato h264 explícito (`yt-dlp -F <url>` y elegir `h264_540p_*` — los h265 fallan
     en Whisper) → `scp` a `perseo-vps:~/tmp-tiktok/` → correr `tips/transcribe-vps.sh`
     (subirlo también) → borrar `~/tmp-tiktok` del VPS al terminar. Costo: centavos.
     Para VARIOS videos: transcribí en paralelo (lección tanda 2: 9 a la vez sin pisarse) —
     cada agente con SU archivo remoto y limpiando SOLO lo suyo, nunca el directorio entero.
- **Foto/carrusel** (URL `/photo/`): yt-dlp NO los soporta y el visor web rota solo.
  El caption sale con el navegador (get_page_text); para los slides, PEDILE AL USUARIO
  capturas de pantalla — no gastes recursos peleando con el visor.

### 2. Veredicto por tip — los 3 baldes (con las reglas de la casa)

1. **Ya lo tenemos** → decir DÓNDE vive (playbook §X / Arquitecto / menú del Equipador /
   CLAUDE.md). Es el balde más común: que no sorprenda.
2. **Bueno y nuevo** → VERIFICAR el claim contra doc oficial ANTES (los influencers
   muestran features viejas o exageran) y proponer dónde sumarlo. **Nada se aplica sin
   el OK de Guido — esta sesión NO toca el sistema.**
3. **Humo / obsoleto / no aplica al perfil** → descartar CON razón escrita (un tip puede
   ser bueno para devs y malo para quien dirige sin leer código).

Contexto del sistema (leer si hace falta): `PLAYBOOK-MAESTRO.md` (el método),
`~/.claude/skills/arquitecto-skills/menu-skills.md` (el menú y sus descartes).

### 3. El informe → `tips/tanda-<YYYY-MM-DD>.md`

Formato: una sección por link (fuente, duración, transcript resumido o completo si es
corto) + veredicto por tip con balde y evidencia + al final "Propuestas para aprobar"
(lista concreta de cambios de 1 línea, si las hay). Commit + push.

### 4. Después (otra sesión, con Fable)

Guido abre chat acá y dice: *"leé tips/tanda-X.md y procesemos las conclusiones"* →
ahí se discuten las propuestas y, con OK, se aplican al playbook/menú/kit.

---

*Regla de 3+: si este ritual se usa 3+ veces y funciona, se convierte en skill
(`/procesar-tips`). Por ahora es un prompt + este doc. Nacido 2026-07-08 (tanda 1).*
