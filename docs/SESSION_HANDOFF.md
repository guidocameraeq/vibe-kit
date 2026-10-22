# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope**: con el TODO y git, lo inyectado tiene que quedar bajo 10.000 caracteres.

**Última sesión cerrada:** 2026-10-22, misión 4, tramo 4: **racimo F diseñado, corregido por Guido y revisado**. Solo
diseño, sin cambios al kit (`v2.4.2`). PC `Usuario`. `kit-sync` LIMPIO (el kit instalado acá estaba del 3 de agosto;
se sincronizó al arrancar).

## Dónde estamos

- **Misión 4**: tramos 0 a 3 hechos ([`PLAN.md`](mision-4/PLAN.md)). **Tramo 4**: ✅ A · ✅ C · ✅ E · ✅ **F** ·
  siguen **B → D → G → H → I**.
- ✅ **F · Seguridad** ([`DISENO-F-seguridad.md`](mision-4/DISENO-F-seguridad.md)): Claude con los ojos tapados y las
  manos libres. 9 barreras de archivos (frenan también en bypass, verificado en la doc) · un corrector de secretos por
  PC · "usar sin ver" (`db consulta/migrar/foto`, `cargar-secreto`) · niveles de base dummy/prueba/real · las barreras
  son del proyecto (`frenos.quitados` con `hasta:`) · "con permiso, igual con red" · gitleaks en el pre-commit. Revisión:
  26 hallazgos, 24 aplicados (§22).
- 🆕 **Reglas de Guido de hoy** (en PLAN §Lecciones): los hallazgos de un revisor **se pasan por el criterio de diseño
  antes de aplicarse**; y **ninguna barrera se impone para siempre**: se quita por proyecto con rastro.
- F dejó a **A** la ubicación del registro de frenos (propuesta `docs/frenos.log`, nota en DISENO-A §4) y a **B** el
  nombre del archivo público de datos de prueba y las 3 líneas que suma al hook de arranque. **E quedó corregido**:
  un solo campo `frenos.quitados`; el actualizador rehace una rama rota sin `push --force`.

## Próximo paso: racimo B (documentos con tope)

**Título de la sesión: `vibe-kit M4 · Tramo 4: racimo B`** (`/inicio` se lo pone al confirmar). Esfuerzo `high`.

- **Lee**: el norte, la forma de pensar y los 11 criterios del `PLAN.md` · `TABLERO.md` §4, §2 (filas del hook y los
  documentos), §10 (la fila B, **la nota "Para el racimo B"** con cómo resolvió el Hub sus carpetas, y la de
  subproyectos) · `FLOTA.md` §3 y §4 · `DISENO-E` §4 y §5 (la ficha y la zona propia) · `DISENO-C` (qué muestra la
  salida y qué inyecta el hook) · `DISENO-F` §9, §15 y §21 · el ítem "Tope al hook" del TODO · el molde actual en
  `kit/skills/arquitecto/templates/`.
- **Lo central**: qué carpetas tiene `docs/` (specs, referencia, archivo) · documentos con tope: el hook inyecta solo
  estado, próxima acción y bloqueos (hoy: handoff de 503 KB, CHANGELOG de 260-440 KB) · el TODO que no miente (S-U-8)
  · `/cierre` cruza lo anunciado con lo anotado (S-U-7) · `docs/NORTE.md` · estados del entregable · `AGENTS.md` opt-in
  · un test que falla ante archivo suelto o ruta citada inexistente (lo tiene el Hub) · subproyectos con docs propios ·
  **los 11 criterios reflejados en el `CLAUDE.md` del molde** (pedido de Guido).
- **Cómo**: ficha de una pantalla → decisiones de a una, en criollo → revisor frío + lector de gentle-ai → pasar los
  hallazgos por el criterio → `DISENO-B-*.md` con su tabla → marcar en el PLAN.

## Cosas que muerden y no están en ningún otro doc

- 🔑 **Esta PC no tiene identidad de git** (ni global ni del repo). El cierre commitea con el `-c` de respaldo del
  `/cierre`. Los commits de E y los del director del Hub de hoy salieron con **la segunda cuenta** (FLOTA §8); cómo,
  **NO VERIFICADO**. Guido todavía no dijo con qué cuenta firma esta PC.
- 📬 **El Hub**: su director (sesión `director-orden-hub`, esta PC) tiene el brief de los 4 pedidos; después del
  cierre de E mandó **el contrato del registro** (API HTTP con dos llaves, lectura y notas; el actualizador usa solo la
  de lectura; el Arquitecto lee cada ficha y agrega notas firmadas). Anotado en TABLERO §10, racimo I. **Pushea a este
  repo desde otra sesión**: antes de cerrar, `git fetch` y mirar `origin/main`.
- 🧪 **Lo que F manda al piloto** (misión 5): el hook en bypass en vivo · `Get-Content .env` contra el `deny` ·
  falsos positivos de Write/Edit contra el historial (el JWT de Supabase dispara) · `push --force` medido · el
  pre-commit en las 3 PCs · el 3+ del contrato `db`. Esta PC no tiene el comando `claude` suelto: no se prueba acá.
- 📬 **El buzón multiagente** se diseña en G (ADR-021); la firma por agente y el arnés del OK humano van a G.
- 🧠 La memoria de Claude no viaja entre PCs: el norte y los criterios viven en el PLAN.
- 🔐 **12 alertas abiertas** (archivo privado), las arregla Guido; F le deja el runbook a escribir en la misión 5.
- 🔴 **vibe-kit es PÚBLICO**: gitleaks antes de cada push (hoy: limpio).
- 🖥️ Los directores de los dos Hermes corren en la PC `clientes`; se los lee por `gh`.

## Bloqueos

Ninguno.
