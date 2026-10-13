# SPEC: Profesionalizar vibe-kit — vibe-kit

Que el repo se explique solo: el norte escrito, una estructura de carpetas que se entienda sin
guía, la documentación ordenada y un README de GitHub para alguien que llega de afuera.

- Estado: **✅ IMPLEMENTADO 2026-10-13** (aprobado por Guido en Plan Mode el mismo día) — ADR-023, que también registra la ampliación posterior (D7 y D8 cambiaron).
- Fecha: 2026-10-13
- Misión 3 de 5 de la hoja de ruta (`docs/SPEC-investigacion-chats.md` § Hoja de ruta). Se prueba
  acá, en el proyecto madre, el sistema de documentación que la misión 4 le va a recomendar a otros.

## Por qué (el dolor)

El repo creció de a capas (v1 → v2.4.2 → la investigación) y hoy solo lo entiende quien lo vivió.
El README es a la vez portada, historial de versiones y lista de pendientes (119 líneas, la mitad
son pendientes); no dice para quién es ni qué NO hace. `investigacion/` quedó en la raíz al lado
de `extractor/` sin que nada explique que son primos. Y el repo es **público**: un visitante no
tiene por dónde entrar.

## Contexto del código (exploración 2026-10-13)

- **Raíz**: `README.md` (portada + estructura + pendientes, única fuente de pendientes — REJ-005),
  `GUIA-DE-USO.md` (recetas), `PLAYBOOK-MAESTRO.md` (el método, 412 líneas), `CLAUDE.md` (reglas).
  Sin `LICENSE`.
- **`kit/`** — fuente canónica de las 4 skills + el agente red-team + `INSTALAR.md`. Se sincroniza
  a `~/.claude/` (ADR-003).
- **`guias/`** — 3 guías (Arquitecto, Extractor, hoja de mano de /relevamiento). Conviven con
  `GUIA-DE-USO.md` en la raíz.
- **`extractor/`** — agente-carpeta (ADR-011): links de tips → `tips/tanda-<fecha>.md`. Su CLAUDE.md
  todavía nombra la carpeta vieja ("Guia de vibe coding").
- **`investigacion/`** — receta (`METODO.md`, no skill: regla de 3+) + 3 scripts + `LECTOR.md` +
  `costos.md`. Mismo contrato que el Extractor: extrae y propone, no aplica. Su salida también es
  una tanda en `tips/`.
- **`tips/`** — 3 actas (2 de TikToks, 1 de los chats). Actas: no se reescriben.
- **`docs/`** — mezcla tres cosas: estado (`SESSION_HANDOFF`, `DECISIONS` 22 ADRs, `REJECTED`),
  specs vivos (`SPEC-*`, ADR-020), y material de referencia (`referencia-prompts-fyd`,
  `EVALUACION-docs-fyd-v2`, `PRESUPUESTO-relevamiento`).
- **`legacy/`** — v1, snapshots pre-git, propuestas cumplidas. Se archiva, no se borra.
- **`.claude/`** — skills `/inicio` y `/cierre` del repo madre + hook SessionStart (inyecta el
  handoff + la sección "Pendientes" del README).
- Datos que ya están mal: el README dice "20 ADRs / 15 REJ" (hay 22 ADRs).

## Decisiones tomadas (con Guido, de a una)

- **D1 · Para quién: Guido primero, otros después.** El repo sigue siendo su taller; la portada le
  explica a un visitante qué es en un minuto y le avisa que es personal y en evolución (sin
  promesa de soporte). Descartado: "solo para mí" (desaprovecha lo público) y "producto para
  otros ya" (prematuro: el pack se diseña en la misión 4 y el kit tiene cosas propias de Guido).
- **D2 · El norte se llama "misión y visión"** (pedido de Guido: el nombre le gusta más que
  "norte") y vive aparte en `docs/MISION-Y-VISION.md`, ~1 pantalla, con el contenido de P7 (para
  qué, para quién, qué NO hace, de dónde viene). El README lo resume y linkea. Es la **prueba en
  casa de P7** para la misión 4 — no toca el Arquitecto ni /inicio. ⚠️ Choque de palabra: en el
  método "misión" = un chat de trabajo; el archivo lo aclara en su primera línea.
- **D3 · El Extractor y la investigación van juntos bajo `observatorio/`** (D4: nombre elegido
  por Guido viendo el contenido — "miran y anotan, no tocan"), con un
  README corto del patrón común: miran → extraen → acta en `tips/` → la sesión madre decide.
  `tips/` se queda en la raíz (las actas se citan por ruta en todos lados). Las actas y ADRs que
  nombran las rutas viejas NO se reescriben: el ADR nuevo explica el movimiento. Descartado:
  dejarlos sueltos en la raíz (no se ve el parentesco) y mover también `tips/` (rompe citas).
- **D5 · `docs/`: los SPEC se quedan arriba; lo de consulta va a `docs/consulta/`; índice en
  `docs/README.md`.** A `consulta/`: `referencia-prompts-fyd.md` y `EVALUACION-docs-fyd-v2.md`.
  `PRESUPUESTO-relevamiento.md` (contrato de un build ya hecho) va a `legacy/` con lápida
  (ADR-020). Guido quería también `docs/specs/`; se descartó **por ahora** porque el Arquitecto
  busca borradores en `docs/SPEC-*.md` en todos los proyectos — si la carpeta de specs gusta, se
  decide en la misión 4 y se cambia en el kit para todos a la vez (anotado como insumo).
- **D6 · Guías: `GUIA-DE-USO.md` sigue en la raíz (la puerta); `guias/` queda para el kit
  (Arquitecto, relevamiento); `COMO-USAR-EL-EXTRACTOR.md` se muda a `observatorio/extractor/`**,
  al lado de su herramienta.
- **D7 · Los pendientes salen del README a `docs/TODO.md`**, con el formato del template del kit
  (`kit/skills/arquitecto/templates/universales/docs/TODO.md`) — como en todos los proyectos que
  monta el Arquitecto (verificado 2026-10-13). Se reabre REJ-005: su condición ("si los
  pendientes crecen 3×") se cumplió (~5 líneas en jul → ~60 en oct). El hook
  `.claude/hooks/session-start.sh` pasa a leer el TODO (es del repo, no del kit). El README queda
  100% portada. La "historia de lo ya hecho" no se pierde: va a la sección de hechos del TODO o
  queda en DECISIONS + git.
- **D8 · El historial de versiones sale del README a `docs/CHANGELOG.md`** (template del kit),
  una entrada por tag existente. El README dice solo la versión estable y linkea.
- **D9 · Licencia MIT.** Corrección de Guido: las 4 plantillas de `_fuente/` son **suyas** (el
  jefe las aprobó, no las escribió) → entran en la licencia. Queda **afuera**, con aviso en el
  LICENSE/README: `referencia-prompts-fyd.md` (texto de FyD Sistemas copiado textual).
- **D10 · La autoría de las plantillas se corrige en todo lo vivo, incluida la skill
  `/relevamiento`** (decisión de Guido: "corregir todo ya"): "de Guido, aprobadas por su jefe".
  Toca `kit/skills/relevamiento/` (LEEME, FORK, SYNC, los 4 encabezados de plantilla, anexos)
  → sync a `~/.claude/` + diff limpio. **`_fuente/` NO se edita** (prístinas). ADRs, SPECs
  implementados, actas y legacy NO se reescriben (historia) — el ADR nuevo deja la corrección.
- **D11 · Quién cambia las plantillas: Guido; su jefe aprueba.** `_fuente/` sigue prístina y pasa
  a significar "la versión aprobada". El ritual `SYNC.md` pasa de "el jefe cambió una pregunta" a
  "cambiaste una versión aprobada": se pisa `_fuente/`, `git diff _fuente/` muestra el cambio, se
  re-aplica el fork. El mecanismo no cambia; cambia quién lo dispara. Descartado: sin aprobación
  (se pierde la marca de "lo aprobado") y "gana el jefe" (contradice la autoría real).

## AGREGA

- `docs/MISION-Y-VISION.md` (D2), ~1 pantalla. Primera línea: *"misión acá = para qué existe el
  proyecto; no confundir con 'una misión = un chat' del método"*. Secciones: el problema · la
  misión (para qué existe) · la visión (adónde va: el pack regalable de la hoja de ruta) · para
  quién (D1) · qué NO hace (no construye apps, eso pasa en cada proyecto; no es un producto con
  soporte; no es un plugin, ADR-001; el observatorio no aplica nada) · de dónde viene (Hermes,
  Perseo, 70 días de uso) · qué otros sistemas toca (`~/.claude/` de cada PC).
- `observatorio/README.md` (D3), 10-15 líneas: el patrón común (mira → extrae → acta en `tips/` →
  la sesión madre decide y aplica), una fila por observador, y dónde iría un tercero.
- `docs/README.md` (D5): índice de una pantalla, con cada archivo de `docs/`, qué es y cuándo leerlo.
- `docs/consulta/` (D5).
- `docs/TODO.md` (D7), del template del kit: recibe la sección "Pendientes" del README **con el
  contenido tal cual** (solo cambia de casa) + "Ya hecho" + los 2 insumos para la misión 4 que
  salieron acá (ver Riesgos).
- `docs/CHANGELOG.md` (D8), del template del kit: una entrada por tag existente (v2.1 → v2.4.2),
  armada con `git tag -n` + el párrafo de versiones del README actual. Fechas que no salgan de
  git: NO VERIFICADO, no se inventan.
- `LICENSE` (D9): MIT, titular `guidocameraeq`, 2026, con aviso de exclusión de
  `docs/consulta/referencia-prompts-fyd.md` (texto de FyD Sistemas).
- **ADR-023 · Profesionalizar el repo madre**: D1-D11 en corto + **tabla de rutas viejas → nuevas**
  (las actas y ADRs viejos citan `extractor/`, `investigacion/`, `docs/<archivo>` y no se
  reescriben: se leen con esta tabla) + REJ-005 reabierto + la corrección de autoría.
- En `docs/REJECTED.md`: REJ-005 marcado **"reabierto 2026-10-13 → ADR-023"** (no se borra).

## MODIFICA

- `git mv extractor/ observatorio/extractor/` y `git mv investigacion/ observatorio/investigacion/`
  (D3). Efecto a cuidar: `extractor/CLAUDE.md` usa `../tips/` y `../PLAYBOOK-MAESTRO.md` → pasan
  a `../../`; y su handoff final nombra la carpeta vieja "Guia de vibe coding" → "vibe-kit". Los
  `.py` no usan rutas relativas al repo (verificado).
- `guias/COMO-USAR-EL-EXTRACTOR.md` → `observatorio/extractor/` (D6), con sus rutas corregidas.
- `docs/referencia-prompts-fyd.md` y `docs/EVALUACION-docs-fyd-v2.md` → `docs/consulta/` (D5).
  Efecto: `kit/skills/docs-fyd/prompts-fyd.md:146` cita la ruta vieja → se corrige en el kit.
- `docs/PRESUPUESTO-relevamiento.md` → `legacy/` con lápida (ADR-020).
- `README.md` → **solo portada** (D1, D7, D8), en castellano: qué es (2 líneas) · para quién +
  aviso "repo personal en evolución" · misión y visión en 3 líneas + link · cómo se usa en 4 pasos
  (instalar → /arquitecto → trabajar con /inicio y /cierre → el observatorio propone mejoras) ·
  tabla de carpetas · instalar · "Versión estable: v2.4.2" + link al CHANGELOG · link al TODO ·
  licencia. Sale: historial de versiones, pendientes, "Ya hecho", el conteo viejo de ADRs.
- `.claude/hooks/session-start.sh`: los pendientes salen de `docs/TODO.md` en vez del README.
- `.claude/skills/cierre/SKILL.md:22` y `.claude/skills/inicio/SKILL.md:8,24`: "pendientes del
  README" → "`docs/TODO.md`". Solo la ruta: el rediseño (P36-P38, P47-P48) es misión 4. El paso de
  versión de `/cierre` suma "+ entrada en `docs/CHANGELOG.md`".
- `CLAUDE.md` raíz: tabla "Mapa de documentación" al día (TODO, CHANGELOG, MISION-Y-VISION,
  `docs/README.md`, `docs/consulta/`, `observatorio/`, LICENSE); la fila de `_fuente/` dice "de
  Guido, aprobadas por su jefe" (D10); la regla dura 4 nombra `observatorio/`; la fila del README
  deja de decir "única fuente de pendientes".
- `GUIA-DE-USO.md`: las rutas del Extractor y la investigación pasan a `observatorio/...`; "Dónde
  profundizar" apunta al TODO y a MISION-Y-VISION.
- **Kit, `/relevamiento`** (D10, D11): `kit/skills/relevamiento/plantillas/` (LEEME, FORK, SYNC, el
  encabezado de las 4 plantillas de trabajo), `anexos/etapas.md`, `anexos/lentes.md` y la fila de
  `kit/skills/arquitecto-skills/menu-skills.md`: autoría "de Guido, aprobadas por su jefe";
  `SYNC.md` reescrito como "cambiaste una versión aprobada"; lo que hoy dice "gana él" pasa a "la
  versión aprobada manda; la cambia Guido con el OK de su jefe". Sync a `~/.claude/` + `diff -r`.
  **Sin bump de versión**: es doc-only (regla del `/cierre`).

## NO SE TOCA

- **`kit/skills/relevamiento/plantillas/_fuente/`**: ni un byte.
- El **flujo** de las skills del kit: solo cambian textos de autoría y una ruta en docs-fyd. El
  Arquitecto, el Equipador y docs-fyd funcionan igual que hoy.
- El **contenido** de las actas de `tips/` (y sus 57 propuestas: misión 4), los ADR-001 a 022, los
  SPEC implementados y `legacy/`. Las rutas viejas que citan se quedan como están.
- `tips/` sigue en la raíz; `kit/`, `legacy/` y `PLAYBOOK-MAESTRO.md` no se mueven.
- Los SPEC siguen en `docs/SPEC-*.md` (convención del Arquitecto).
- `D:\vibe-hallazgos\` y el repo privado `vibe-research`.
- La línea de la carpeta de proyectos de `~/.claude/skills/arquitecto/SKILL.md` en esta PC (`D:/`,
  ADR-021): el sync la preserva.
- `/inicio` y `/cierre` de este repo no se rediseñan (solo cambia una ruta).

## Criterios de aceptación

1. Todo lo de NO SE TOCA sigue igual: `git diff --stat <base> -- kit/skills/relevamiento/plantillas/_fuente/ tips/ legacy/vibe-kit-v1 legacy/snapshots`
   vacío, y los ADR-001 a 022 sin cambios (`git diff <base> -- docs/DECISIONS.md` solo agrega).
2. CUANDO se corre el hook a mano (`bash .claude/hooks/session-start.sh`), DEBE imprimir el
   handoff, los pendientes (ahora de `docs/TODO.md`, no vacíos) y los últimos commits.
3. `diff -r` kit↔`~/.claude/` en las 5 rutas canónicas DEBE dar limpio, salvo la línea conocida de
   la carpeta de proyectos.
4. Ningún link relativo de los `.md` vivos (README, GUIA-DE-USO, CLAUDE.md, `docs/README.md`,
   `docs/TODO.md`, MISION-Y-VISION, `observatorio/**`, `guias/**`, `kit/**`) DEBE apuntar a algo
   que no existe; se verifica con un script que resuelve cada link (actas, ADRs y legacy
   exceptuados a propósito).
5. `grep -rniE "del jefe|jefe de Guido|originales del jefe" kit/ CLAUDE.md README.md GUIA-DE-USO.md guias/`
   NO DEBE devolver afirmaciones de autoría del jefe (puede quedar "aprobadas por su jefe").
6. Desde `observatorio/extractor/`, las rutas `../../tips/` y `../../PLAYBOOK-MAESTRO.md` DEBEN
   existir.
7. El README DEBE entenderse sin contexto: un subagente que no vio esta charla lo lee y contesta
   bien qué es, para quién, qué NO hace y por dónde empezar.
8. Antes del push: escáner de secretos sobre el diff (gitleaks; si no está, grep de formas de
   claves) + búsqueda de nombres reales (el compañero, clientes) + **Guido ve el diff**.

## Supuestos

- [BAJO] Titular de la licencia: `guidocameraeq` (ya público en la URL), no el nombre completo. Si
  Guido prefiere el nombre, es una línea.
- [BAJO] README y docs nuevos en castellano; inglés queda para cuando se piense el pack.
- [BAJO] Sin bump de versión: los cambios del kit son solo texto (regla del `/cierre`).
- [ALTO] Las actas y ADRs que citan rutas viejas no se tocan; el ADR-023 lleva la tabla de
  equivalencias. Arreglarlas chocaría con "las actas no se editan".

## Riesgos y decisiones ⚠️

- ⚠️ **Repo público**: todo lo nuevo pasa por escáner + búsqueda de nombres + diff mirado por
  Guido antes del push. MISION-Y-VISION nombra a Hermes y Perseo como origen, sin datos de negocio.
- ⚠️ **Cambio de costumbre**: el Extractor se abre en `observatorio/extractor/`. Lo dicen la GUIA y
  el README; la tabla de rutas queda en el ADR.
- ⚠️ **Tocar el kit** (solo textos): la otra PC (`Usuario`) queda desfasada hasta su próximo
  `actualizate`. Mitigación: diff limpio antes de cerrar.
- **Insumos para la misión 4** (se anotan en `docs/TODO.md`, no se implementan): `docs/specs/` como
  convención para todos los proyectos (D5) y "misión y visión" como nombre de P7 (D2).
