# Pipeline de tips (TikToks → informe) — prompt para la sesión extractora

> **Cómo se usa**: abrí un chat nuevo (sirve cualquier modelo — Opus alcanza y ahorra cuota)
> en la carpeta `Guia de vibe coding`, pegá el prompt de abajo + los links, y esperá el
> informe. Después, en un chat con Fable: *"leé tips/tanda-<fecha>.md y procesemos las
> conclusiones"* — ahí se decide qué entra al sistema.

---

## El prompt (copiá el bloque + tus links)

```
Procesá estos TikToks de tips de vibe coding y escribí el informe en un archivo.
Seguí EXACTAMENTE el pipeline de tips/COMO-EXTRAER.md (leelo): extracción según
el tipo de post, veredicto por tip con los 3 baldes, y el informe a
tips/tanda-<fecha de hoy>.md. NO apliques ningún cambio al sistema — solo
extraé, verificá y escribí el informe. Al final: commit + push del informe.

Links:
<pegá acá los links>
```

## El pipeline (para la sesión que ejecuta)

### 1. Extracción, por tipo de post

- **Video** (URL `/video/`): `~/tools/yt-dlp.exe` ya está instalado (si no: bajar de
  github.com/yt-dlp/yt-dlp/releases → yt-dlp.exe).
  1. Metadata + subs: `yt-dlp --dump-json --no-download <url>` → caption; si `subtitles`
     trae algo, bajarlos con `--write-subs --skip-download` y listo (gratis).
  2. Sin subs → **Whisper vía VPS** (la key vive allá, NUNCA acá): bajar el video con
     formato h264 explícito (`yt-dlp -F <url>` y elegir `h264_540p_*` — los h265 fallan
     en Whisper) → `scp` a `perseo-vps:~/tmp-tiktok/` → correr `tips/transcribe-vps.sh`
     (subirlo también) → borrar `~/tmp-tiktok` del VPS al terminar. Costo: centavos.
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
