# Prompt para construir la skill `/relevamiento`

> Copiá el bloque de abajo en un **chat nuevo** dentro del repo `Guia de vibe coding` (vibe-kit), **después de correr `/inicio`**.
> El diseño ya está hecho, red-teameado y presupuestado: esta sesión **construye**, no rediseña.

---

Misión: construir la skill **`/relevamiento`** en el kit, según el SPEC ya aprobado. Es un **delta sobre el kit** — una pieza nueva más sus enganches sobre algo que ya anda. **No rehagas el diseño: el SPEC está READY, ejecutalo.**

**Leé primero, completos:**
- `docs/SPEC-relevamiento.md` — el SPEC READY (endurecido tras 1 ronda de red-team: 6 lentes, 93 hallazgos crudos, 79 verificados, los 4 críticos y los 24 graves foldeados). Es tu plano. Respetalo al pie: **AGREGA / MODIFICA / NO SE TOCA**, los **21 criterios de aceptación**, los **riesgos ⚠️** y las **8 decisiones de Guido**.
- `docs/PRESUPUESTO-relevamiento.md` — **el contrato de tamaño.** La tabla de 26 bloques del motor con sus líneas es contra lo que escribís, no contra tu criterio. Trae además el reparto a los 4 anexos, la escalera de poda cuantificada y las **99 líneas que NO se pueden sacar del motor**.

**Paso 0, antes de escribir una sola línea de la skill:**
Extraer las 4 plantillas originales del método desde `proceso-arranque-proyectos.rar` (raíz del repo, sin trackear) a `kit/skills/relevamiento/plantillas/_fuente/` y **commitearlas**. Son **277 líneas / 8.097 bytes / 61 placeholders `{{LINEAS:N}}`**, medidas. Herramienta: `"C:/Program Files/WinRAR/UnRAR.exe"`. **El `.rar` se borra recién cuando `_fuente/` esté en git** — y verificá antes que las referencias de celda del SPEC (`01:28`, `01:36`, `03:15`, `03:21`, `03:24`) apunten a lo que dicen.

**Qué construir (todo en `kit/`, la fuente canónica):**

1. **La skill `kit/skills/relevamiento/`:**
   - `SKILL.md` — el motor. **≤260 líneas**, escrito contra la tabla del presupuesto, en ese orden.
   - `anexos/revision.md` (58) · `anexos/lentes.md` (82) · `anexos/entregable.md` (130) · `anexos/brownfield.md` (52).
   - `plantillas/` — `_fuente/` (prístinas, nunca se editan) + las 4 de trabajo con las 7 celdas `[+fork]` + `FORK.md` + `SYNC.md` + `TABLERO.md` + `HANDOFF.md` + `5-sirvio.md` + `hoja-de-campo.md` + `INDICE.md` + `LEEME.md`.

2. **Los enganches (MODIFICA — cada uno con su efecto colateral, están en el SPEC):**
   - **Arquitecto (`arquitecto/SKILL.md`): 3 toques.** El más importante va **al final del Paso 4, ANTES de `:81`** — *"si venís de un relevamiento, NO montes todavía"* — más la guarda al inicio del Paso 5. **Poner ese toque en el Paso 6 fue uno de los 4 críticos del red-team: montaba el repo antes de que la propuesta llegara a la reunión.** No hay toque en `:50` (el handoff es por token explícito, no por glob) ni mudanza en el Paso 5 (la hace la skill).
   - `arquitecto/anexos/formato-spec.md:51-56` — las alternativas evaluadas al SPEC-0. **Aplica siempre**, con o sin relevamiento.
   - `templates/universales/skills/cierre/SKILL.md` — el paso **6-bis**, gateado igual que el 6.
   - `arquitecto-skills/SKILL.md` — la lista kit-owned está hardcodeada en **6 lugares**: `:3`, `:20`, `:43-44`, `:55`, `:63`, `:73`. Si falta uno, la skill no viaja a la otra PC.
   - `menu-skills.md` (fila kit-owned + la nota de `docx`/`pdf` no disponibles) · `INSTALAR.md` (copiar-si-está) · `.claude/skills/cierre` y `.claude/skills/inicio` (**el diff canónico pasa de 4 a 5 rutas**).

**Reglas duras (del SPEC + del `CLAUDE.md` del repo):**
- Editás en `kit/`, **NUNCA** en `~/.claude/` directo.
- **El techo no se negocia sobre la marcha.** Medí con `wc -l` cada 5 bloques. **Si al llegar al bloque 15 (el ritual de cierre) el archivo pasó de 200 líneas, tomá el corte 1 de la escalera de poda en ese momento** — no al final, porque podar lo último que escribiste es podar lo que no sobra. Si después de mover a anexo y podar sigue sin entrar, **subís el techo con la razón escrita en el ADR**; lo que no se hace es correrlo antes de intentar las dos primeras.
- **La prueba de fuego manda sobre todo:** en un proyecto personal que no invoca la skill, Guido no ve **nada**. La única línea incondicional que toca el Arquitecto es la cláusula de deslinde del `description`.
- **El handoff es por token explícito.** El Arquitecto lee un dossier **si y sólo si la invocación le nombra la ruta**. Cero glob, cero juicio semántico — eso es la cicatriz v2.2.1 y el red-team ya lo mató una vez.
- **`notas/` y `pdf/` NO se mudan nunca** al repo del proyecto. Los nombres propios sí van (decisión de Guido); los **datos sensibles de personas** (sueldos, legajos, salud, sanciones) se frenan antes de persistir, y los **juicios sobre conducta se escriben por ROL**, nunca por nombre.
- No tocar **nada** de lo listado en **NO SE TOCA** — y en particular **el Modo B del Arquitecto (`:121-157`) no se toca en v1**.
- Andá **bloque por bloque**, verificando cada criterio de aceptación con evidencia real (o marcá **NO VERIFICADO**).
- Lo de **Fase 2 no se construye**: el censo automático del código, los 3 ganchos del Modo B, Word, el circuito adaptativo de fatiga, el modo listar, el aprendizaje entre relevamientos, `pdf/historico/`, y la mención condicionada en el ruteo del Arquitecto.

**Al terminar:** `/cierre` del repo madre → sync `kit/` → `~/.claude/`, `diff -r` de las **5 rutas** limpio, escribí los **ADR** (el PDF como cierre oficial de etapa · la skill con sus dos techos y por qué el de KB se corrigió) y los **REJ** con su condición de reapertura, actualizá `GUIA-DE-USO.md` y el `README.md`, bump de versión con tag, commit + push.

**Antes de escribir:** mostrame un plan corto (qué archivos vas a crear/tocar y en qué orden) y esperá mi OK.
