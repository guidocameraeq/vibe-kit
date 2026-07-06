# PROPUESTA — Nuevo sistema de trabajo para Perseo

> Fusión del **playbook de Hermes** (`Desktop\PLAYBOOK_CLAUDE.md`) con la **auditoría de Perseo** (`AUDITORIA-USO-CLAUDE-PERSEO.md`). El playbook pone el esqueleto del sistema; la auditoría pone las especificidades de Perseo (VPS, WhatsApp, quoting, cuota Codex, docs inflados). Fecha: 2026-07-03.

---

## 0. Estado actual (verificado hoy)

- **Nada del plan de la auditoría se aplicó aún**: sin skills en `.claude/`, la clave SSH sigue en `.ssh-tmp/` dentro del proyecto, sin `vps.sh`/`health.sh`/`.gitattributes`, CLAUDE.md sin tocar desde el 24-jun, backup de Supabase sin verificar. El trabajo siguió en features (kit-de-estudio v2, ADR-057) — lógico, pero los pendientes críticos siguen abiertos y este plan los absorbe.
- **El hook anti-secretos "global" del playbook NO existe en esta máquina**: el `~/.claude/settings.json` de esta PC está vacío. El sistema de Hermes vive en `d:\SAAS` (otra raíz). Acá hay que crearlo.
- **El `.gitignore` de Perseo ignora `.claude/` entero** (verificado, línea 45): si montamos skills y hooks sin tocarlo, `git add` los ignora en silencio y el sistema NO se versiona — no viaja a GitHub ni sobrevive a un cambio de PC. La Sesión B lo corrige ANTES de crear nada.
- Ojo con la palabra "skill" en Perseo: el repo ya tiene `skills/` en la raíz — esas son **skills del BOT** (OpenClaw). Las skills de Claude Code van en **`.claude/skills/`**. Son dos mundos; la guía va a fijar el vocabulario: *"skill de Perseo"* vs *"comando de Claude"*.

---

## 1. Qué tomo del playbook, qué adapto, qué descarto

| Pieza del playbook | Veredicto para Perseo |
|---|---|
| **Principio madre: el contexto vive en ARCHIVOS, no en la conversación** | ✅ Adoptar tal cual. Es la sentencia de muerte de la sesión eterna de 151 MB. Tu sistema de docs ya lo cumple a medias; faltaba que el chat sea descartable. |
| CLAUDE.md = el rol, se carga solo | ✅ Ya lo tenés y es de lo mejor del sistema. Se poda (ritual repetido 3×adentro) y se le suman las reglas de la auditoría. |
| Docs de estado (HANDOFF / TODO / CHANGELOG / DECISIONS / REJECTED) | ✅ Ya existen todos. Se les aplica la cura de la INFLACIÓN (una narrativa, un número un lugar, índice de ADRs, poda de STATUS). |
| Skills = rituales en una palabra | ✅ Mismos nombres que Hermes para memoria muscular: `/inicio`, `/cierre`, `/smoke`, y `/deploy` (la versión bot de `/release` — el propio playbook lo predijo para Tobybot). |
| Hooks (SessionStart, post-edición, anti-secretos) | ✅ Los tres aplican, adaptados: SessionStart inyecta handoff, post-edición valida `.sh` (tu fricción técnica #2 fue el quoting), anti-secretos se crea global en esta PC. |
| Memoria: cierre actualiza memoria si cambió un hecho estructural | ✅ Adoptar tal cual como paso de `/cierre`. |
| Sufijos por raíz compartida (paso 7) | ➖ No aplica: Perseo tiene raíz propia. Nombres pelados. |
| `/release` con tags y versiones publicadas | ❌ No aplica: Perseo no publica releases; el versionado v0.9.x del CHANGELOG se alimenta en `/cierre`. |

**Lo que Perseo aporta que el playbook no tenía** (candidatos a volver al playbook después):
- Checklist de regresión de bugs históricos dentro de `/cierre` (los "fixes fantasma" fueron tu fricción #1).
- Reglas de orquestación de agentes (fan-out máx, chunks, verificación adversarial de lo que toca prod).
- Regla de cuota (Codex): declarar costo estimado antes de lanzar batch/crons.
- La tabla "esto cambio / esto preservo" antes de tocar datos tuyos.

---

## 2. La nueva metodología — el ciclo de vida de una misión

```
1. Chat NUEVO en la carpeta de Perseo
   → el hook SessionStart ya inyectó el handoff + TODO
   → decís "inicio" (+ la misión si ya la sabés)
   → Claude confirma en 3 líneas y espera tu OK

2. TRABAJAR. Las reglas operan solas:
   - datos tuyos = intocables sin tabla "cambio/preservo" aprobada
   - nunca "listo" sin /smoke (evidencia real, no promesa)
   - tareas >2 min → background con reporte al terminar
   - cambios que tocan prod/DB → auditor adversarial antes de aplicar
   - SQL por archivo, comandos VPS por vps.sh

3. CERRAR: "cierre" (o "cerrá la sesión")
   → docs al día (UNA narrativa) + checklist de regresión
   → commit + push (+ pull en VPS si aplica) + memoria si cambió algo estructural
   → reporta SHA. EL CHAT SE DESCARTA.
```

**Reglas del ciclo:**
- **Cambió la misión → cambiá el chat.** La compactación pasa a ser emergencia, no forma de vida — y la emergencia tiene procedimiento propio: `cierre parcial` (ver `/cierre`). La sesión eterna de 151 MB se cierra con honores con un último "cerrá sesión" dictado ADENTRO de ella (paso 0 del plan) — no se abandona con trabajo sin persistir.
- **Specs grandes**: diseñar/investigar en una sesión → guardar el SPEC como archivo en `docs/` → cerrar → ejecutarlo en sesión fresca (*"inicio — ejecutá el SPEC X"*). Al implementarse, el SPEC se marca en línea 1 y se archiva en el próximo cierre (regla anti-zombi: un SPEC vivo que dice "implementá esto" cuando ya está hecho es una trampa post-compact).
- **Chats paralelos**: solo para trabajo genuinamente paralelo (ej: un frente en el VPS mientras corre un workflow largo). No "roles" fijos.
- **Tu prompt de inicio de sesión deja de existir**: RESUME-PROMPT.md muere. El hook + `/inicio` lo reemplazan.

---

## 3. El set de comandos de Claude (4 skills en `.claude/skills/`)

Los 4 nacen de rituales que ya repetiste 3+ veces (regla madre del playbook — documentado en la auditoría: cierre ~10 veces, test E2E ~8 dictados completos; el deploy es el "workflow de cambios" que tu CLAUDE.md ya formaliza y que aparece de facto en los 57 mensajes de operación del VPS).

### `/inicio`
1. **Usa el handoff + TODO que el hook SessionStart ya inyectó** — no los relee (releer es costo puro de contexto). Solo relee el archivo si detecta señal de drift: fecha vieja, contradicción con git.
2. Mira la realidad: `git log/status` + `PROTECTED_PATHS.md`.
3. Detecta desfases: SPECs implementadas sin archivar, TODO que contradice al handoff, drift VPS↔repo.
4. Estado en 3 líneas (estado / próxima acción / bloqueos) + pregunta la misión. **No toca nada hasta tu OK.**
5. Con la misión confirmada, y solo si toca el bot: corre `scripts/health.sh` — **no-bloqueante** (si el SSH falla, lo reporta y sigue; el ritual de inicio nunca se traba por el VPS).

### `/cierre`
1. Verifica consistencia (handoff previo vs chat vs `git status` vs VPS si se tocó).
2. Actualiza: `SESSION_HANDOFF.md` (sobreescrito entero, la ÚNICA narrativa), `CHANGELOG.md` (entrada nueva), `TODO.md` (completadas → afuera; nuevas con criticidad), `STATUS.md` (solo si cambió el estado de un bloque — solo filas, sin párrafos).
3. ADR/REJ si hubo decisión/descarte. SPEC implementada → `docs/archive/`.
4. **Checklist de regresión** de los bugs históricos (API key, foto adjunta, timezone, cierre "listo"): ¿algo de lo tocado hoy puede haberlos revivido? Verificación rápida, no suite.
5. Commit + push + (si aplica) pull en VPS. Grep de consistencia de los números que suelen divergir (crons, skills).
6. Si cambió un hecho estructural → actualizar la memoria de Claude.
7. Reporte final: SHA + próximo paso concreto + "chat listo para descartar".

**Modo `cierre parcial`** (la emergencia que hereda del viejo protocolo de compactación): contexto lleno a mitad de misión → actualiza SOLO el handoff (estado + trabajo a medias + próximo paso concreto), sin exigir push ni descartar el chat, y avisa que está listo para `/compact`. La fase POST del viejo protocolo la cubren el hook SessionStart (que también dispara tras compactar) + la regla "post-compact asumí que no leíste nada".

### `/smoke`
El equivalente Perseo del smoke de Hermes (el playbook lo predijo: *"en un bot sería mandale mensajes de prueba y leé los logs"*):
1. Vía determinista primero: `docker logs` + query a Supabase para verificar el efecto.
2. Vía humana cuando el cambio es de conversación: Chrome MCP → WhatsApp Web real (browser seleccionado una vez al inicio, waits ≤10s, re-snapshot tras Enter).
3. Reporte en tu formato: estado inicial / test 1 / fixes / test 2, con evidencia real (filas, logs, capturas).
4. **Limpieza automática al final**: borra filas de prueba + resetea secuencias. El "¿borraste las pruebas?" desaparece.

### `/deploy`
El ritual de aplicar cambios al VPS (tu `/release`):
1. Commit + push local (si falta).
2. `ssh perseo-vps "bash -lc 'cd Perseo && git pull'"`.
3. Si el cambio afecta runtime → `docker compose restart/recreate` del servicio; si toca SKILL/SOUL/TOOLS → recordar la decisión `/new` (resetea el contexto del bot: pedir OK y sugerir momento tranquilo).
4. Verificación post-deploy: `health.sh` + smoke mínimo del flujo tocado.
5. Si el cambio consume cuota Codex (crons/batch): declarar costo estimado ANTES.

**Anti-overkill — lo que NO se crea**: `/release` con versionado (no hay releases), skill de research-angles (te sale bien ad-hoc), suite de tests automatizada (la checklist de regresión en `/cierre` da el 80%).

---

## 4. Hooks (en `.claude/settings.json` de Perseo + uno global)

| Hook | Qué hace | Por qué |
|---|---|---|
| **SessionStart** (Perseo) | Inyecta `SESSION_HANDOFF.md` + cabecera de `TODO.md` en cada chat nuevo — y también tras `/compact` | Es el motivo por el que no hace falta prompt de inicio. Chat nuevo (o recién compactado) arranca sabiendo dónde está parado aunque no digas "inicio". |
| **PostToolUse** sobre `*.sh` (Perseo) | `bash -n` al instante tras cada edición de script | Atrapa la parte de la fricción #2 que pasa por archivos `.sh` antes de que viajen al VPS. (El quoting inline — la parte grande de esos 35 errores — lo matan `vps.sh` + SQL-por-archivo, no este hook.) |
| **PreToolUse anti-secretos** (GLOBAL, esta PC) | Bloquea comandos con tokens/passwords literales | Existe en Hermes por una razón que acá ya pasó también (cookies/credenciales viajando en comandos). Se crea una vez, protege todos los proyectos de esta máquina. |

Anti-overkill: no hay hook para SQL (el SQL va por archivo y se valida al aplicar) ni linters de markdown.

---

## 5. Cura del sistema de docs (una sesión de poda, todo de RESTA)

1. **Una narrativa por cierre**: headers de `STATUS.md` y `TODO.md` pasan a `YYYY-MM-DD — ver SESSION_HANDOFF.md`. La historia vive en HANDOFF (foto) + CHANGELOG (permanente). Recorta ~40% del trabajo de cada cierre.
2. **Un número vive en UN archivo**: crons solo en CRONS.md, skills del bot solo en STATUS, progreso solo en una sección del HANDOFF. Los demás referencian sin número.
3. **Índice de 1 línea por ADR** al tope de DECISIONS.md (232 KB hoy ilegible para Claude) + reordenar las 4 entradas descolocadas del CHANGELOG.
4. **Poda de STATUS.md** (34 KB → ~8 KB): borrar métricas congeladas de mayo (derivables de la DB), cap de 5 en "resueltos recientes", celdas de máx 2 líneas (estado + fecha + ref).
5. **RESUME-PROMPT.md se elimina** (más agresivo que la auditoría, habilitado por el hook SessionStart + `/inicio`). Todo lo volátil vive SOLO en el HANDOFF.
6. **`docs/archive/`**: SPECs implementadas + REMEDIATION-PLAN + MIGRACION-SERIES-NOTION. `SISTEMA-DOCUMENTACION-VIVA.md` (58 KB, genérico) se muda al proyecto del kit de vibe coding con un stub de 5 líneas acá.
7. **COMPACTION-PROTOCOL.md → absorbido por `/cierre`** (incluido el caso emergencia como `cierre parcial`): el doc queda como stub de 3 líneas que apunta a `.claude/skills/cierre/`. Un procedimiento no puede vivir en dos lugares.
8. **CLAUDE.md**: dedup (una sección canónica del ritual, las otras la referencian) + integrar las 12 reglas de la auditoría (definition-of-done dura, datos tuyos intocables, no frenar + background, no hay python local, SQL por archivo, Read post-compact, fan-out máx 20-30/chunks 15-20, batch en modelo barato, costo Codex antes de lanzar, secretos nunca en chat, túneles en background, criollo siempre). Estructura según el template del playbook: qué es + stack + comandos / rol y evidencia / restricciones duras / mapa de docs / convenciones.

---

## 6. Scripts, permisos y seguridad

- **`scripts/vps.sh`**: un comando → ssh con `bash -lc` y la clave correcta. Mata el infierno de quoting y hace legible lo que aprobás.
- **`scripts/health.sh`** (en el VPS): Baileys + gateway + crons + últimos errores de logs en un output. Primer paso obligatorio ante cualquier "no responde".
- **Matriz de vencimientos en CRONS.md** (tabla de ~10 líneas): qué vence (OAuth Codex, QR WhatsApp, cookies IG/LBXD, proxy), cada cuánto, cómo se detecta y el comando de renovación de cada una. `health.sh` detecta lo YA roto; la matriz es lo que permite avisar ANTES — 7 incidentes de "Perseo no responde" salieron de acá. (El pre-aviso automático en el watchdog queda para "si el dolor vuelve".)
- **`.gitattributes`** con `* text=auto eol=lf` (fix de 1 minuto, mata los warnings CRLF).
- **Clave SSH**: de `.ssh-tmp/` (dentro del proyecto, legible por todo agente) → `~/.ssh/` + `Host perseo-vps` en `~/.ssh/config`. Actualizar referencias y borrar `.ssh-tmp/`.
- **Permisos** (paso 6 del playbook, adaptado): allowlist para `git add/commit/push`, lecturas del VPS (`docker logs/ps`, `psql` SELECT vía vps.sh) y los comandos de las 4 skills; `ask` para lo destructivo (reset, force-push, DROP/DELETE, restart de containers). Nunca "always allow" a comandos con secretos adentro (el hook lo bloquea igual).
- **⚠️ Backup de Supabase — sigue abierto y es lo más urgente de todo**: verificar el plan (Free tier = cero backups) y si hace falta, cron semanal de `pg_dump` + copia off-VPS. Es anterior a todo lo demás: el sistema de trabajo no importa si la data puede desaparecer.

---

## 7. Plan de aplicación

> **Todos los chats de este plan se abren en `C:\Users\Usuario\Desktop\Proyectos\Asistente Personal`** (la raíz de Perseo). Los prompts usan paths completos para que no haya ambigüedad.

### Paso 0 — Te toca a vos, sin Claude (10 min)
1. **Dashboard de Supabase** → Settings → Billing: ¿qué plan tiene el proyecto de Perseo? → Database → Backups: ¿existen backups? Anotá el resultado — el prompt A arranca con eso. (Esto lo mirás VOS: Claude no puede entrar al dashboard, y si se lo pedís va a "verificar" infiriendo de los docs — el patrón fix-fantasma aplicado justo al ítem más crítico.)
2. **Último cierre de la sesión eterna**: abrí la sesión vieja de 151 MB una última vez y dictale "cerrá sesión" (su protocolo actual todavía funciona). Todo lo no persistido desde el último handoff muere con ella — que muera vacía. Recién después se abandona.

### Sesión A — Fundaciones (chat nuevo, ~1 h)
> **Prompt:** Estoy en plan [X] de Supabase y [hay / no hay] backups. Leé la sección 6 de `C:\Users\Usuario\Desktop\Proyectos\Guia de vibe coding\PROPUESTA-SISTEMA-PERSEO.md` y aplicá las fundaciones: (1) si no hay backups, armá el cron semanal de pg_dump con copia off-VPS y registralo en docs/CRONS.md y docs/RECOVERY.md; (2) mové la clave SSH de .ssh-tmp/ a ~/.ssh con Host perseo-vps en ~/.ssh/config y actualizá TODAS las referencias (CLAUDE.md, docs, scripts) antes de borrar .ssh-tmp/, verificando que la conexión sigue andando; (3) agregá .gitattributes con eol=lf; (4) creá el hook global anti-secretos en ~/.claude/settings.json de esta PC. Mostrame el plan antes de tocar nada y verificá cada paso con evidencia real al terminarlo.

### Sesión B — El sistema (chat nuevo, esta semana, ~2 h)
> **Prompt:** Leé `C:\Users\Usuario\Desktop\Proyectos\Guia de vibe coding\PROPUESTA-SISTEMA-PERSEO.md` (secciones 3, 4 y 6), la sección A de `C:\Users\Usuario\Desktop\Proyectos\Guia de vibe coding\AUDITORIA-USO-CLAUDE-PERSEO.md` (ahí está destilado mi ritual de test E2E) y `C:\Users\Usuario\Desktop\PLAYBOOK_CLAUDE.md`, y montá el sistema en Perseo. PRIMERO corregí el .gitignore: des-ignorá .claude/skills/, .claude/settings.json y .claude/hooks/ (mantené ignorados settings.local.json y launch.json). Después: las 4 skills (/inicio, /cierre con su modo parcial, /smoke, /deploy) en .claude/skills/, los hooks SessionStart y bash -n en .claude/settings.json, scripts/vps.sh y scripts/health.sh, la allowlist de permisos, y el CLAUDE.md nuevo (sección 5 punto 8 de la propuesta). Mostrame el CLAUDE.md y cada SKILL.md antes de commitear, y al final verificá con git status que las skills y el settings.json quedaron TRACKEADOS.

**Al terminar la sesión B: primer `/cierre` real → chat descartado. De acá en más, chat nuevo por misión.**

### Sesión C — La poda de docs + la guía (chat nuevo, ~1 h, con el sistema ya andando)
> **Prompt:** inicio — misión: aplicar la cura del sistema de docs (sección 5 de `C:\Users\Usuario\Desktop\Proyectos\Guia de vibe coding\PROPUESTA-SISTEMA-PERSEO.md`, puntos 1 a 7), crear la matriz de vencimientos de credenciales en docs/CRONS.md (sección 6 de la propuesta), actualizar el mapa de docs del CLAUDE.md para que refleje el resultado (RESUME-PROMPT eliminado, COMPACTION-PROTOCOL como stub), y crear `docs/COMO_TRABAJAR_CON_CLAUDE.md` con la guía de uso diario (sección 8 de la propuesta: solo frases, recetas y punteros — NO duplicar procedimientos que ya viven en CLAUDE.md y las skills). Al final, actualizá `C:\Users\Usuario\Desktop\PLAYBOOK_CLAUDE.md` con lo que Perseo le aporta al sistema madre. Mostrame qué vas a mover/borrar antes de hacerlo.

### Hábitos desde entonces (costo $0)
- Chat nuevo por misión; `inicio` y `cierre` como palabras de entrada/salida (con la barra `/` es determinístico; sin barra suele funcionar por auto-trigger, pero la barra garantiza).
- Una prioridad por dictado (*"primero X, lo demás después"*).
- Si le repetiste la misma instrucción 3 veces → va a CLAUDE.md o a una skill (regla del playbook, es LA señal).
- Al renovar cualquier credencial: que Claude la registre en la matriz de CRONS.md con su comando de renovación.
- Cada ~2 semanas: *"audit del sistema de docs: verificá consistencia entre docs y código, corregí desfases"*.

---

## 8. La guía que crearemos (`docs/COMO_TRABAJAR_CON_CLAUDE.md` en Perseo)

Guía de uso diario, específica de Perseo (el playbook es el documento madre multi-proyecto; esta es la hija). Contenido:

1. **El ciclo en 10 líneas** (inicio → misión → cierre → chat nuevo).
2. **Cuándo usar cada comando**, con ejemplos de frases reales tuyas — punteros a las SKILL.md, la guía NO repite los pasos (nada de espejos manuales: regla §6 del playbook, el drift es inevitable).
3. **Vocabulario**: skill de Perseo (bot) vs comando de Claude; deploy vs /new; compactar (emergencia) vs cerrar (normal).
4. **Qué hace Claude solo** (hooks, reglas de CLAUDE.md) para que no lo pidas de nuevo.
5. **Recetas de una línea**: "no responde el bot" → health.sh; "quiero feature nueva grande" → SPEC en sesión propia; "tocar datos míos" → tabla cambio/preservo primero.
6. **Mapa de docs actualizado** (post-poda) — qué se lee, qué se escribe y cuándo.
7. **Checklist de PC nueva**: qué viaja con el repo (skills, hooks de proyecto, settings.json) y qué se recrea a mano en cada máquina (hook global anti-secretos, clave SSH en `~/.ssh`, settings.local.json).
8. **El contrato**: qué te toca a vos (misión clara, una prioridad, OK explícitos) y qué le toca a Claude (evidencia, no frenar, cierre completo).

Y al final de la sesión C: actualizar el **playbook madre** con lo que Perseo le aporta (regresión en /cierre, reglas de agentes, cuota, tabla cambio/preservo) — así Hermes también lo hereda.
