# Auditoría de uso de Claude Code — Proyecto Perseo

> Auditoría del 2026-07-02 sobre la sesión completa de Perseo (20-may → 2-jul). Analizada con 6 agentes en paralelo + verificación cruzada contra los datos crudos. Todo número citado fue verificado contra el transcript real.

---

## 1. Cómo trabajaste (los datos duros)

| Métrica | Valor |
|---|---|
| Sesión | **UNA sola**, del 20-may al 2-jul (44 días, 27 activos, 151 MB) |
| Tus mensajes | 414 → generaron 8.277 respuestas/acciones de Claude (**ratio 20:1**, delegación altísima) |
| Tool calls | 3.803 (31% shell manual: Bash 979 + PowerShell 189) |
| Compactaciones | **~10-11 reales** (una cada ~40 mensajes tuyos / ~4 días activos) |
| Subagentes | 52 del loop principal + 12 workflows (~388 agentes, ~12,2M tokens registrados) |
| Modelos | 95% Opus (incluso para operación rutinaria del VPS) |
| Mix de trabajo | **2/3 mantenimiento** (datos 78, debugging 75, ops VPS 57) vs 1/3 construcción (features 46) |

**Tus fortalezas (no las toques):**
- **Verificación E2E real**: 26% de tus mensajes piden verificar/probar, y 14 veces pegaste la conversación real de WhatsApp como evidencia. Testing de aceptación de primera calidad.
- **Pedís planes antes de ejecutar** (54 menciones) y respondés AskUserQuestion (37 usos). El diálogo de diseño previo funciona.
- **Disciplina documental**: el protocolo de compactación se cumplió sesión tras sesión durante 8 semanas. Eso es raro y valioso.
- **Verificación adversarial de agentes**: cuando la usaste, corrigió el **46% de los veredictos** de una sola pasada (25/54 en estado_obra) y filtró 23 hallazgos crudos a 10 reales (kit-de-estudio). Los agentes de una pasada mienten con confianza: 0 de 179 se autodeclararon "baja confianza".

---

## 2. Los clusters de fricción (rankeados por costo real)

### 🔴 1. Fixes fantasma — "me dijiste que estaba resuelto y volvió a pasar"
El cluster más caro de toda la sesión. El bug de la API key lo reportaste **7 veces** entre el 26 y 28-may antes del fix real. El timezone se dio por resuelto el 3-jun y el 11-jun seguía roto. El flujo "listo" se corrigió 3 veces. Tu propia frase: *"a veces pasa que me dice que hace algo cuando en realidad no lo hace, y eso es lo que me preocupa, no es confiable"* (26-may).
**Causa raíz:** declarar éxito tras aplicar el parche, sin reproducir el caso que lo disparó.

### 🔴 2. Ritual manual de cierre/compactación/retome (~10 ciclos idénticos)
Dictaste casi las mismas frases ~10 veces: *"hace el session handoff, crea el prompt, actualiza lo que haya que actualizar…"* + copiar/pegar el prompt de retome a mano. 15-30 min por ciclo. Ya existe como doc (COMPACTION-PROTOCOL.md) — falta empaquetarlo como comando.

### 🔴 3. Babysitting — 45 mensajes de "continua / dale / retry / y?"
El 11% de tus mensajes son empujones de una palabra (rachas de 6 "continua" en 40 min el 20-may; *"¿qué pasó? lleva más de una hora corriendo"* x2 el 29-jun). Pagás atención continua para mantener la rueda girando — lo contrario del modo "hacé todo y volvé con un reporte" que siempre pedís.

### 🔴 4. Decisiones tuyas pisadas sin consultar
5 episodios, 2 caros: la skill dates entera rehecha (21-may) y el **"error gravísimo"** del 29-jun (Claude colapsó tus 7 estados de Notion sin preguntar). La lección ya está en memoria ("la data de Guido es la autoridad") pero no como regla operativa en CLAUDE.md.

### 🔴 5. Credenciales que vencen, descubiertas cuando ya está roto
7 incidentes de "Perseo no responde": OAuth Codex (x2 el mismo día), QR de WhatsApp, cookies Letterboxd (x2 en 24h), gateway de Mika, cookies IG. Los watchdogs se fueron construyendo **de forma reactiva**, incidente a incidente. Falta el pre-aviso (avisar N días ANTES, no al fallar).

### 🟡 6. Errores técnicos repetidos (177 en total, 2 patrones = 50%)
- **30% (54 errores): Edit sin Read** — amnesia post-compactación. Claude edita docs de memoria y falla en ráfagas de 2-3 intentos idénticos.
- **~35 errores: quoting multicapa** bash→ssh→docker→psql. El mismo banner `echo === STEP (x) ===` falló **15+ veces** en 5 semanas. SQL inline llega con las comillas destruidas al VPS.
- Menores pero repetidos: `python` no existe en tu Windows (6x en un mes), warnings CRLF (6x), permisos de `secrets/` en el VPS redescubiertos 3+ veces.

### 🟡 7. Cuota Codex agotada por crons batch (3 incidentes)
Sin visibilidad previa del presupuesto (*"no sabía que había un límite"*). El uso batch de Perseo va a crecer: esta fricción es nueva y va a volver.

### 🟡 8. Estilo re-pedido 12 veces
*"Explicame en criollo, corto y conciso, sin lenguaje técnico"* — pedido ~12 veces, nunca consolidado como regla.

---

## 3. Auditoría del sistema de documentación

**Veredicto: FUNCIONA — el problema no es abandono, es INFLACIÓN.** El handoff estaba actualizado hoy a la mañana. Lo que falla:

1. **La narrativa de sesión se escribe 4 veces por cierre**: SESSION_HANDOFF + header de STATUS + header de TODO + entrada de CHANGELOG. ~40 reescrituras en la sesión. Es la causa raíz de los desfasajes.
2. **Cada número duplicado ya divergió**: README dice 11 crons, CRONS.md ("fuente única") dice 15, STATUS dice 17. El progreso del backlog difiere DENTRO del mismo HANDOFF (34/65 vs 48/65).
3. **DECISIONS.md (232 KB, 57 ADRs) y CHANGELOG.md (150 KB) ya no son consultables**: sin índice, Claude no puede releerlos sin quemar el contexto — justo el recurso escaso.
4. **STATUS.md (34 KB)**: celdas-párrafo que recuentan la historia (eso es CHANGELOG), métricas congeladas desde el 12-may ("4 recetas" cuando hay 401 pelis), "recientes" con 18 items hasta mayo.
5. **RESUME-PROMPT.md acumuló estado volátil que caduca** y hoy contradice al HANDOFF sobre cuál es el próximo paso. Dos "save games" parciales.
6. **Docs zombis**: SPECs ya implementadas que ordenan "implementar con contexto fresco" (riesgo de re-implementación post-compact), SISTEMA-DOCUMENTACION-VIVA.md (58 KB, es material del kit de vibe coding, no de Perseo).
7. **CLAUDE.md: núcleo excelente** — pero repite el ritual de inicio 3 veces dentro del mismo archivo, y duplica el checklist de compactación que ya vive en COMPACTION-PROTOCOL.md (ya hay micro-drift).

**Principio de todas las correcciones: RESTAR, no agregar.** El checklist ya se ejecuta cada 1-2 días; cada paso nuevo se paga siempre. Menos lugares donde escribir lo mismo, archivos más cortos, índices para no releer todo.

---

## 4. Subagentes y workflows: qué funcionó y qué no

| Patrón | Veredicto |
|---|---|
| Research web en paralelo por ángulos distintos (Letterboxd 5 ángulos, kit-estudio 5 ángulos) | ⭐ El mejor uso de la sesión. Seguir igual. |
| Verificación adversarial (revisar → verificar cada hallazgo) | ⭐ Corrigió 46% de veredictos. Convertir en regla para todo lo que toque prod. |
| Subagentes para proteger el contexto del loop principal (docs sync, auditorías) | ✅ Correcto, mantener. |
| **Fan-out 1-agente-por-ítem** (179+179 del estado-obra-army) | ❌ Reventó el límite de sesión (~260 agentes). Chunks de 15-20 ítems por agente cuestan **4x menos** (patrón audit-parser, mismo repo). |
| Workflows one-shot reescritos desde cero | ⚠️ Son siempre los mismos 4 patrones. Los 2 que se repiten (review-verify, sync-docs) merecen guardarse parametrizados. |

---

## 5. Riesgos que nadie estaba mirando (hallazgos del crítico)

1. **🚨 Backup de la DB descansa en un supuesto NO verificado.** RECOVERY.md (22-jun) decidió no hacer backups off-VPS porque "Supabase tiene backups diarios + PITR". **PITR es un add-on pago y los backups automáticos empiezan en el plan Pro.** Si tu proyecto está en Free tier, tus 401 pelis, 243 series, dates, tareas y segundo cerebro tienen **CERO red de seguridad** — y Notion (la fuente original) ya fue abandonada el 29-jun. Probabilidad baja × impacto catastrófico × fix de 1 hora.
2. **La clave SSH del VPS vive dentro de la carpeta del proyecto** (`.ssh-tmp/perseo_vps_ed25519`, desde el 9-may, permisos laxos). Cubierta por .gitignore ✅, pero legible por los ~388 subagentes y cualquier proceso del proyecto. Debe vivir en `~/.ssh/`.
3. **Falsa alarma descartada**: el repo git local existe, está sano, privado y pusheado. Nada sensible trackeado. El modelo de secretos general está bien.

---

# PROPUESTAS (solo las de alto valor)

## A. Tres skills nuevas en el repo Perseo (`.claude/skills/`)

Las tres empaquetan rituales que YA existen y ya dictaste 8-10 veces cada uno. Cero diseño nuevo.

### `/cerrar-sesion`
Ejecuta COMPACTION-PROTOCOL.md completo: verificar consistencia → actualizar HANDOFF/CHANGELOG/TODO/STATUS (con las reglas nuevas de "una sola narrativa") → ADRs/REJ si aplica → commit + push + pull en VPS → checklist de regresión de los 4 bugs históricos → resumen final "listo para /compact".

### `/retomar`
Lee SESSION_HANDOFF → STATUS → TODO → PROTECTED_PATHS y confirma en 3 líneas (estado / próxima acción / bloqueos). **Reemplaza el copy-paste de RESUME-PROMPT.md**: tu prompt de inicio de sesión pasa a ser una palabra.

### `/test-e2e`
El ritual de prueba que dictaste ~8 veces completo: conectar Chrome MCP a WhatsApp → probar como humano real → verificar filas en Supabase → reporte en tu formato (estado inicial / test 1 / fixes / test 2) → **borrar datos de prueba y resetear secuencias automáticamente** (el "¿borraste las pruebas?" desaparece).

## B. Paquete de reglas para CLAUDE.md (una sola edición, ~15 líneas)

Reglas de 1 línea, cada una mata una fricción medida:

1. **Definition-of-done dura**: un bug se declara resuelto SOLO tras reproducir E2E el caso que lo disparó. "Apliqué el parche" ≠ "está resuelto".
2. **Datos de Guido = fuente de verdad**: estados, tags, ratings y títulos que creó él NUNCA se transforman/colapsan/renombran sin mostrar antes una tabla "esto cambio / esto preservo" y esperar OK.
3. **En tareas aprobadas: no frenar.** Trabajos >2 min van con `run_in_background` y reporte al terminar. Nunca dejar al usuario esperando sin ETA.
4. **Comunicación**: criollo rioplatense, corto, sin jerga; decisiones = opciones con tradeoffs + una recomendación. *(ya casi está — reforzar que aplica a TODO, no solo a decisiones)*
5. **No hay python en este Windows** — todo Python corre en el container del VPS (`docker exec perseo-openclaw python3`).
6. **SQL siempre por archivo** (Write local → scp → ejecutar), nunca inline por ssh. Banners de echo entre comillas simples y sin paréntesis. Máx 2 capas de comillas por comando.
7. **Tras compactación asumo que NO leí ningún archivo**: Read antes de todo Edit sobre docs.
8. **Fan-out de agentes: máx 20-30 por workflow**; censos grandes van en chunks de 15-20 ítems por agente; todo workflow >30 agentes escribe resultados parciales a disco.
9. **Batch/censos corren en el modelo más barato**; Opus se reserva para diseño, debugging difícil y decisiones.
10. **Antes de lanzar crons/batch que consuman cuota Codex**: declarar costo estimado y pedir OK.
11. **Secretos nunca se pegan en el chat** — viajan por archivo local → scp.
12. **Servidores/túneles siempre `run_in_background`**, nunca foreground.

Y una **de-duplicación**: dejar UNA sección canónica del ritual de inicio (las otras 2 la referencian) y que compactación diga solo "ejecutar docs/COMPACTION-PROTOCOL.md" sin resumen paralelo.

## C. Correcciones al sistema de docs (todas de RESTA)

1. **Una sola narrativa por sesión**: los headers de STATUS.md y TODO.md pasan a ser `YYYY-MM-DD — ver SESSION_HANDOFF.md`. La historia vive en HANDOFF (efímero) + CHANGELOG (permanente). Recorta ~40% del trabajo de cada cierre.
2. **Un número vive en UN archivo**: crons solo en CRONS.md, skills solo en STATUS, progreso solo en una sección del HANDOFF. Los demás docs referencian sin número.
3. **Índice de 1 línea por ADR** al tope de DECISIONS.md (nº — título — fecha — estado). Reordenar las 4 entradas descolocadas del CHANGELOG.
4. **Poda one-shot de STATUS.md**: borrar métricas congeladas (derivables de la DB), cap real de 5 en "resueltos recientes", celdas de máx 2 líneas (estado + fecha + ref). De 34 KB a ~8 KB.
5. **RESUME-PROMPT.md vuelve a ser plantilla estable de ~15 líneas** (o directamente muere cuando exista `/retomar`). Todo lo volátil vive SOLO en SESSION_HANDOFF.
6. **`docs/archive/`**: mover SPECs implementadas + REMEDIATION-PLAN + MIGRACION-SERIES-NOTION. Regla: "SPEC implementada → marcar en línea 1 y archivar en el próximo cierre". SISTEMA-DOCUMENTACION-VIVA.md se muda al proyecto del kit (es material genérico del método).

## D. Automatizaciones chicas (scripts, no infraestructura)

1. **`scripts/vps.sh`**: wrapper local que recibe UN comando y maneja ssh + `bash -lc` + la clave. Mata el infierno de quoting (35 errores) y hace los comandos legibles (tus 9 denegaciones fueron desconfianza al comando ilegible, no a la operación).
2. **`.gitattributes`** con `* text=auto eol=lf`: fix de 1 minuto, elimina los warnings CRLF.
3. **`scripts/health.sh` en el VPS**: estado de Baileys + gateway + crons + últimos errores de logs, en un comando. Regla: es el PRIMER paso ante cualquier "no responde/no funciona" (hoy cada bug arranca la investigación desde cero).
4. **Backup de la DB** (según lo que salga de verificar el plan de Supabase): cron semanal de `pg_dump` en el VPS + copia off-VPS.
5. **Matriz de vencimientos** en CRONS.md (OAuth, QR WA, cookies IG/LBXD, proxy: qué vence, cada cuánto, cómo se renueva en 1 comando) + que el watchdog existente avise ANTES del vencimiento.

## E. El cambio de hábito (el más importante, cuesta $0)

**Sesión nueva por bloque de trabajo, en vez de la sesión eterna.**
Tu sistema de handoff ya hace que la sesión de 151 MB no aporte nada: todo el contexto vive en los docs. Cada compactación de la sesión eterna es una pérdida no controlada (de ahí sale el 30% de los errores técnicos y los 33 mensajes de "¿en qué quedamos?"). Con `/cerrar-sesion` + `/retomar`, abrir sesión fresca por bloque es MÁS barato que compactar — y el contexto arranca limpio, con las reglas frescas.

**Tu prompt de inicio de sesión pasa a ser: `/retomar`. Nada más.**

## F. Explícitamente descartado (overkill para tu caso)

- Suite de smoke-tests automatizada por skill — no la vas a mantener; la checklist de regresión en `/cerrar-sesion` da el 80% del valor.
- Presupuesto paramétrico de tokens por workflow — el cap de fan-out ya lo cubre.
- Rotar CHANGELOG/DECISIONS a archivos -archive — el índice alcanza; la rotación es burocracia.
- Allowlist agresiva de permisos — 9 denegaciones en 6 semanas no lo justifican.
- Skill de "research-angles" — el patrón ya te sale excelente ad-hoc.

---

# PLAN DE APLICACIÓN

Cada paso tiene el prompt listo para dictar/pegar en Claude Code **dentro de la carpeta de Perseo**.

## Hoy (30-45 min total)

**Paso 1 — Verificar el backup de Supabase (5 min, el más urgente)**
> Entrá al dashboard de Supabase y fijate qué plan tiene el proyecto de Perseo (Settings → Billing) y si existen backups (Database → Backups). Si es Free tier o no hay backups: decime y armamos el paso 1b.

**Paso 1b — Si no hay backups (30 min):**
> Armá un cron semanal de pg_dump en el VPS que guarde un backup comprimido de la DB de Supabase, con rotación de 4 copias, y una copia off-VPS. Registralo en docs/CRONS.md y docs/RECOVERY.md. Mostrame el plan antes de tocar nada.

**Paso 2 — Mover la clave SSH (10 min)**
> La clave .ssh-tmp/perseo_vps_ed25519 tiene que vivir en ~/.ssh/ fuera del proyecto. Movela, creá un Host "perseo-vps" en ~/.ssh/config, actualizá TODAS las referencias (CLAUDE.md, docs, scripts) para usar "ssh perseo-vps", y borrá .ssh-tmp/. Verificá que la conexión sigue andando antes de borrar.

**Paso 3 — Paquete de reglas en CLAUDE.md + .gitattributes (15 min)**
> Leé la sección B de AUDITORIA-USO-CLAUDE-PERSEO.md (está en la carpeta "Guia de vibe coding") y aplicá las 12 reglas nuevas a CLAUDE.md, más la de-duplicación del ritual de inicio. Agregá también un .gitattributes con `* text=auto eol=lf`. Mostrame el diff antes de commitear.

## Esta semana (2-3 horas, en 2 sesiones)

**Paso 4 — Las 3 skills (1 sesión)**
> Creá tres skills de Claude Code en .claude/skills/ de este repo: (1) /cerrar-sesion que ejecute docs/COMPACTION-PROTOCOL.md completo incluyendo la checklist de regresión de los 4 bugs históricos (API key, foto adjunta, timezone, cierre "listo"); (2) /retomar que lea SESSION_HANDOFF → STATUS → TODO → PROTECTED_PATHS y confirme en 3 líneas sin tocar código; (3) /test-e2e que pruebe una skill de Perseo por WhatsApp con Chrome MCP, verifique la DB, reporte en mi formato y limpie los datos de prueba. Basate en los docs existentes, no inventes pasos nuevos.

**Paso 5 — scripts/vps.sh + health.sh (misma sesión que el 4)**
> Creá scripts/vps.sh (wrapper local: un comando → ssh perseo-vps con bash -lc) y scripts/health.sh en el VPS (estado de Baileys, gateway, crons del host, últimos errores de docker logs, en un solo output). Regla nueva en CLAUDE.md: health.sh es el primer paso ante cualquier "no responde". SQL siempre por archivo, nunca inline.

**Paso 6 — Poda de docs (1 sesión, es la sección C de la auditoría)**
> Leé la sección C de AUDITORIA-USO-CLAUDE-PERSEO.md y aplicá las 6 correcciones: una narrativa por sesión, un número por archivo, índice de ADRs, poda de STATUS.md, RESUME-PROMPT a plantilla estable, y docs/archive/ con los zombis. Actualizá COMPACTION-PROTOCOL.md para que refleje el nuevo esquema. Mostrame qué vas a mover/borrar antes de hacerlo.

## Hábitos desde la próxima sesión (costo $0)

7. **Sesión nueva por bloque de trabajo**: cerrás con `/cerrar-sesion`, abrís fresca con `/retomar`. La sesión eterna se retira con honores.
8. **Una prioridad por dictado**: los mensajes largos multi-tema terminan con "primero X, lo demás después". (Claude va a confirmar el orden si no lo hacés — regla nueva.)
9. **Matriz de vencimientos**: la próxima vez que renueves una credencial, pedile a Claude que la registre en la matriz de CRONS.md con su comando de renovación.

## Solo si el dolor vuelve (no antes)

- Workflows guardados parametrizados (review-verify, sync-docs) en `.claude/workflows/`.
- Allowlist de lectura para el VPS (con `/fewer-permission-prompts`).
- Pre-aviso automático de vencimientos en el watchdog.

---

## Nota final para el kit de vibe coding

Tres piezas de esta auditoría son directamente reutilizables en el vibe-kit: (1) el trío `/cerrar-sesion` + `/retomar` + sesiones-por-bloque es la solución general al problema de compactación que el tutorial 04 ya describe; (2) la "definition-of-done dura" y la tabla "cambio/preservo" para datos del usuario merecen entrar al template de CLAUDE.md del kit; (3) la lección de fan-out (chunks de 15-20, verificación adversarial solo del subconjunto dudoso) va al playbook de orquestación.
