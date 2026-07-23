# vibe-kit — mi método de vibe coding con Claude Code

> El método completo para dirigir Claude Code sin ser programador: el playbook (documentación +
> sistema de trabajo), el Arquitecto (piensa y monta proyectos nuevos), el Equipador (equipa
> máquinas con skills curadas). Nacido de auditorías reales sobre meses de trabajo (Hermes,
> Perseo). **Versión estable: `v2.1`** (tag de git, 2026-07-11 — Modo A validado con una semana
> de uso real).

## La regla de la casa (desde que esto es un repo)

**La fuente canónica es ESTE repo.** La copia instalada en `~/.claude/` de cada máquina se
sincroniza DESDE acá. El flujo de cambios:

```
editar en kit/ (este repo) → sincronizar a ~/.claude/ → commit + push
```

Para cambiar algo del Arquitecto/Equipador, en un chat de esta carpeta:
*"actualizá el arquitecto: [el cambio] — editá en kit/, sincronizá a ~/.claude y commiteá"*.
Nunca editar `~/.claude/` directo (queda huérfano del historial).

## Estructura

| Qué | Dónde |
|---|---|
| **La guía de uso** — recetas por situación + frases mágicas (empezá por acá) | `GUIA-DE-USO.md` |
| **El método** (documentación + sistema de trabajo, se lee 1 vez por proyecto) | `PLAYBOOK-MAESTRO.md` |
| **El kit instalable** — FUENTE CANÓNICA del Arquitecto + Equipador + menú + templates + agente red-team + **motor `docs-fyd`** + su instalador | `kit/` |
| **Guías de uso** (casos de uso, cuándo sí/no) | `guias/` |
| **El Extractor** — agente de tips: abrir Claude Code AHÍ + pegar links = extrae, evalúa y deja el informe | `extractor/` |
| Informes de tandas de tips (outputs del Extractor) | `tips/` |
| Estado del proyecto madre: handoff (lo inyecta el hook), DECISIONS (14 ADRs), REJECTED, **SPEC `docs-fyd` (implementado → la skill vive en `kit/skills/docs-fyd/`)** | `docs/` + `CLAUDE.md` raíz + skill `/cierre` |
| Archivo histórico (v1, auditorías, snapshots pre-git, la PROPUESTA-V2 ya cumplida) | `legacy/` |

## Instalar en una PC nueva

1. Clonar este repo (o llevar el zip de `Desktop\Arquitecto en otras PCs\` si no hay git).
2. Abrir Claude Code en `kit/` y pegar el prompt de `kit/INSTALAR.md`. Se instala solo:
   copia skills y agente a `~/.claude/`, pregunta dónde viven tus proyectos, verifica todo.
3. Al final ofrece equipar la máquina (`/arquitecto-skills` — el menú curado de skills).

## El día a día (una vez instalado)

**→ [`GUIA-DE-USO.md`](GUIA-DE-USO.md)** — todas las recetas por situación ("quiero X → hacé Y")
y la chuleta de frases mágicas. Es LA puerta de entrada para usar el sistema.

## Mantenimiento

- Cambio al kit → editar en `kit/` → sincronizar a `~/.claude/` → commit + push (una sola
  fuente, historial completo). Los snapshots de `legacy/snapshots/` quedaron para la era
  pre-git; ahora versiona git.
- El zip de `Desktop\Arquitecto en otras PCs\` se regenera desde `kit/` tras cambios grandes.
- PDFs de las guías: se generan a demanda (los MD de `guias/` son la fuente).
- En la otra PC (d:\SAAS): clonar este repo y correr el instalador — su catálogo viejo
  (`legacy/KIT_SKILLS-maquina-dsaas-2026-07-05.md`) se reconcilia con el menú del Equipador.

## Pendientes (post-v2.1)

- ~~🔥 **Construir el release v2.0 del Arquitecto — sistema `docs-fyd`**~~ ✅ **construido
  (2026-07-23)**: la skill `kit/skills/docs-fyd/` (motor + `deteccion.md` + `prompts-fyd.md` + 13
  plantillas) + los 7 enganches (frescura en el cierre-plantilla, fila kit-owned en el menú,
  copiar-si-está en INSTALAR, caso kit-owned en el Equipador, siembra CON PREGUNTA en el Paso 5 del
  Arquitecto, diff canónico 3→4 rutas). Verificado **16/16** (workflow adversarial sobre los 14
  criterios + anti-secretos + consistencia) y `diff -r` de las 4 rutas limpio. **Próximo real:**
  correr `/docs-fyd` en las 2-3 apps críticas para FyD y completar el negocio en `_CAMPOS-NEGOCIO.md`.
- **Fase 2 de `docs-fyd`**: el inventario central (`/inventario-fyd`, Excel + Mapa + hub privado)
  quedó diferido; mientras tanto el Excel lo arma Guido desde su tablero Kanban (columnas en la
  sección Fase 2 del SPEC).
- 🔥 **Estreno real del Modo B**: primera feature grande sobre el ERP con `/arquitecto` en la
  carpeta del proyecto (el modo está construido y validado adversarialmente; le falta su
  primera misión de verdad).
- **Compuerta del Modo C** (~2 semanas de uso de A+B): si no te trabaste 3+ veces pidiendo
  cosas, C queda como está; si sí, se afina con casos reales.
- Equipador: faltan estrenar "actualizar" y "agregar al menú".
- ~~Llevar el kit a la PC d:\SAAS~~ ✅ instalado (2026-07-11). Colita: confirmar allá la
  reconciliación del catálogo viejo (superpowers/sql-expert) con el menú — `/arquitecto-skills`
  → *"qué skills tengo"*.
- Capturas del carrusel de @sabbb.md para cerrar el tip pendiente de la tanda 2.
