# Cómo usar el Extractor (mini guía)

> El agente que convierte tus TikToks guardados en mejoras curadas del sistema. Su cerebro
> vive en `extractor/CLAUDE.md` (si esta guía y aquel difieren, gana aquel). v2026-07-11.

## Qué es, en una frase

La primera mitad de una curaduría en dos etapas: **el Extractor extrae, verifica y propone**
(escribe un informe); **la sesión madre decide y aplica** (con tu OK). El Extractor jamás
toca el sistema — por diseño.

## Cómo se usa (3 pasos)

1. **VSCode → Archivo → Abrir carpeta** → `Desktop\Proyectos\Guia de vibe coding\extractor`
2. Abrí el chat de Claude Code ahí. **Modelo: Opus o Sonnet van perfecto** — es trabajo
   mecánico de extracción, no hace falta gastar el modelo grande.
3. **Pegá los links y nada más.** El CLAUDE.md de la carpeta ya le dio el rol, el pipeline
   y el contrato. No hay prompt que copiar.

**Punto dulce: 3-6 links por tanda** (más se vuelve largo de revisar después).

## Qué va a pasar (la película)

1. **Dedup**: cruza tus links contra las tandas anteriores — los repetidos no gastan nada.
2. **Extracción**: subtítulos si el video los trae (gratis); si no, Whisper vía tu VPS
   (~centavos por video). **Carruseles de fotos: te va a pedir capturas de pantalla** — es
   lo esperado, no un error (TikTok bloquea la lectura automática de slides).
3. **Veredictos**: cada tip cae en un balde — 🟢 ya-lo-tenemos (te dice dónde) · 🟡 bueno y
   nuevo (verificado contra la fuente oficial) · 🔴 humo/no-aplica (con razón escrita).
4. **El informe**: `tips/tanda-<fecha>.md`, commiteado y pusheado, con la sección
   **"Propuestas para aprobar"** al final.
5. Te da el paso siguiente textual, listo para copiar.

## Después — procesar el informe (la etapa 2)

Chat nuevo en la **raíz** del repo (`Guia de vibe coding`) →
> **"leé tips/tanda-<fecha>.md y procesemos las conclusiones"**

Ahí se discuten las propuestas una por una y, con tu OK, se aplican (playbook, menú, kit).
Los informes quedan como actas — no se reescriben.

## Preguntas rápidas

- **¿Links cortos de la app (`vt.tiktok.com`) sirven?** Sí, los resuelve solo.
- **¿Solo TikTok?** Hoy es su especialidad; YouTube y artículos usan las mismas herramientas
  (está anotado como ampliación futura — pedila cuando la necesites).
- **¿Un link no salió?** Tras 2 intentos razonables lo marca ⚪ pendiente con el motivo y
  sigue con el resto — no se empantana.
- **¿Cuánto cuesta?** Subtítulos: gratis. Whisper: centavos (la API key vive en el VPS,
  nunca en tu PC).
- **¿Puede romper algo?** No: su contrato le permite escribir SOLO informes en `tips/`.
