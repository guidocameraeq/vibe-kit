# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope**: con el TODO y git, lo inyectado tiene que quedar bajo 10.000 caracteres.

**Última sesión cerrada:** 2026-10-22, misión 4, tramo 4: **racimo B (documentos con tope) diseñado, revisado dos veces y
cerrado**. Solo diseño, sin cambios al kit (`v2.4.2`). PC `Usuario`. `kit-sync` LIMPIO.

## Dónde estamos

- **Misión 4**: tramos 0 a 3 hechos ([`PLAN.md`](mision-4/PLAN.md)). **Tramo 4**: ✅ A · ✅ C · ✅ E · ✅ F · ✅ **B** ·
  siguen **D → G → H → I**, después la revisión integral de los nueve con los 11 criterios, y el spec (tramo 5).
- ✅ **B · Documentos** ([`DISENO-B-documentos.md`](mision-4/DISENO-B-documentos.md), 62 KB): `docs/` en cuatro capas (plano
  `NORTE.md` + `MAPA.md` · sesión con tope · `modulos/<x>/` con la ficha y la historia separadas · `referencia/` y `archive/`) ·
  tres tamaños (chico / módulo solo / con director) con una sola estructura · el hook en node con presupuesto de 9.500 y huella ·
  el TODO con edad por `git blame` · el cierre cruza lo anunciado con lo anotado · el candado de estructura por script con ids ·
  el `CLAUDE.md` del molde por los 11 criterios · Engram en espera. Revisor frío: 33 hallazgos, 30 aplicados; revisión de
  coherencia de Fable contra A, C, E y F: 20 correcciones (§22).
- B dejó **notas cruzadas**: en A (el registro de frenos va a `.claude/frenos.log`, y el choque al mezclar desde varias ramas,
  para la revisión integral), C (ficha + `tiempos.md`), E (el adoptador migra `docs/` y trae seis documentos; piezas nuevas en
  la ficha del kit), F (`referencia/PRUEBA.md`) y TABLERO §10 (sin `docs/specs/`; los specs viven con su módulo).
- 🆕 **Reglas de Guido de hoy** (PLAN §Lecciones): **los subagentes van en Sonnet u Opus, nunca en Fable** (está en memoria); y
  antes de diseñar una pieza, un lector barato mide cómo se usa hoy en los repos reales (el de Hermes cambió B de fondo).

## Próximo paso: el tope al hook del molde (`v2.4.3`)

**Título de la sesión: `vibe-kit · Tope al hook del molde (v2.4.3)`**. Esfuerzo `medium`. Es el arreglo chico del TODO, fuera de
la misión 4 (que solo diseña); Guido delegó el cuándo y la recomendación es **ahora**, para que Bot (15.500 caracteres) y el Panel
del bot (~18.000) dejen de arrancar ciegos antes de la misión 5.
- **Guía**: DISENO-B §9 (presupuesto, orden de recorte, "CORTADO", la huella) y el hook del Hub (`.claude/hooks/session-start.sh`
  en su `main`: tope de 5.500 bytes al handoff más aviso). **Solo el tope y la huella**, en bash, en
  `kit/skills/arquitecto/templates/universales/hooks/session-start.sh` y en el `/inicio` del molde ("si dice CORTADO, leé el
  resto"); node y el resto del diseño llegan con la misión 5. Cierra con `kit-sync.sh sync` LIMPIO, CHANGELOG y tag `v2.4.3`.
- **La sesión siguiente**: `vibe-kit M4 · Tramo 4: racimo D` (modelos, ruido y revisión), esfuerzo `high`. Lee PLAN §El foco,
  TABLERO §2, §7 y §9, RADIOGRAFIA §5-§6, DISENO-A §7, DISENO-F §13, REFERENCIAS §1 y §4 (delegar con razón, revisión
  congelada en un SHA, una sola corrección).

## Cosas que muerden y no están en ningún otro doc

- 🔑 **Esta PC no tiene identidad de git**; el cierre commitea con el `-c` de respaldo. Con qué cuenta firma, **NO VERIFICADO**.
- 📬 **El Hub pushea a este repo desde otra sesión**: hoy, 2 commits en TABLERO §10 mientras se diseñaba B (el registro ya responde
  en producción: 77 fichas, 8 conexiones; URL y llave en la capa privada, la llave la tiene Guido). Se mezclaron en este cierre.
  **Antes de cerrar, `git fetch` siempre.**
- 🧪 **Lo que B manda al piloto** (misión 5): cómo cuenta caracteres la plataforma (emoji = 2 en JS), el hook de escritura en
  Windows y con worktrees, la ficha del kit legible en node sin librerías, los falsos positivos del hook de escritura.
- 🔴 **vibe-kit es PÚBLICO**: gitleaks antes de cada push (hoy limpio). En los diseños, alias (Desktop, Mobile, Hub, Devoluciones).
- 🔐 **12 alertas abiertas** (archivo privado), las arregla Guido.
- 🖥️ Los directores de los dos Hermes corren en la PC `clientes`; se los lee por `gh`.

## Bloqueos

Ninguno.
