# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo
> inyecta en cada chat nuevo de esta carpeta.

**Última sesión cerrada:** 2026-10-22, misión 4, tramo 4: **racimo E diseñado y revisado**. Solo diseño, sin cambios
al kit (sigue en `v2.4.2`). Guido trabajó por Remote Control; la PC es la que firma con **la segunda cuenta de GitHub**
(FLOTA §8): los commits de hoy salen con esa firma. `kit-sync` LIMPIO.

## Dónde estamos

- **Misión 4**: tramos 0 a 3 hechos ([`PLAN.md`](mision-4/PLAN.md)). **Tramo 4 por racimos**: ✅ A · ✅ C · ✅ **E** ·
  siguen **F → B → D → G → H → I**.
- ✅ **E · Molde y flota** ([`DISENO-E-molde-y-flota.md`](mision-4/DISENO-E-molde-y-flota.md)), en una línea: el
  Arquitecto es **puerta única** (skill que rutea; agentes como manos; scripts como ojos; sin memoria propia); cada
  repo lleva una **ficha del kit** (`.claude/kit.md`: versión, `vars`, estado y hash por pieza, frenos, sensible); el
  **actualizador** regenera el molde sin pisar adaptaciones (4 estados: molde · molde+propio · adaptada · propia), en
  clon temporal, mezcla a `main` si pasa el chequeo mecánico; **adoptar** es una pantalla y un "dale"; `VERSION` con
  notas de migración; **el Hub es el registro de la empresa** pero el actualizador no lo necesita; el Equipador queda
  atrás de la puerta con `doctor`. Revisado por un revisor frío y contra gentle-ai: 17 hallazgos, 15 aplicados enteros
  y 2 recortados (§16).
- 🆕 **Decisiones de Guido de hoy que cambian el mapa**:
  - **El agente de ecosistema NO es parte del Arquitecto**: es propio de la empresa, va al **racimo I (el último)** y
    probablemente viva en el Hub. Lo ya decidido está en `TABLERO.md` §10.
  - **Los 11 criterios de cada racimo** (`PLAN.md` §El foco): menos intervención · pragmático · medible · software
    consistente, seguro y escalable · tokens y modelo justo · script antes que modelo · seguro por defecto ·
    portable · lo chico no paga lo grande · autónomo con rastro · piloto antes de flota. **Cada `DISENO-*` cierra
    con su tabla de criterios** (E ya la tiene, §17). **Al terminar los nueve racimos, revisión integral de todas las
    decisiones con esa vara, antes del spec.** Guido quiere verlos reflejados después en el `CLAUDE.md` del molde y
    el sistema de documentación (racimo B).
  - **Regla para el ciclo** (PLAN §Lecciones): el revisor frío va después de las decisiones de cada racimo, no
    solo al final.

## Próximo paso: racimo F (seguridad por defecto)

**Título de la sesión: `vibe-kit M4 · Tramo 4: racimo F`** (`/inicio` se lo pone al confirmar). Esfuerzo `high`
alcanza; es más chico que E.

- **Lee**: el norte y **los 11 criterios** del `PLAN.md` · `TABLERO.md` §8 (objetivo 7) y §10 (la fila F) ·
  `FLOTA.md` §5 · de `REFERENCIAS-EXTERNAS.md`, las filas F (gentle-ai trae la lista concreta de `deny`) ·
  `DISENO-A-frenos.md` entero (las 4 preguntas y los correctores) · de `DISENO-E`, §6 (los permisos de los agentes de
  fondo como pieza) y §9 (dónde vive una credencial).
- **Lo central**: qué barreras `deny` trae el molde de fábrica (8 de 10 proyectos no tienen ninguna) · qué pasa con
  las 12 alertas abiertas (el detalle está en el archivo privado; las arregla Guido) · secretos: nunca en repo, nunca
  impresos, dónde viven por PC · el guardián de atribuciones de Desktop (radiografía A.4) como corrector del molde ·
  `docs-fyd` con resumen de exposición entra solo como idea (TABLERO §12).
- **Cómo**: ficha de una pantalla → decisiones de a una, en criollo, con "qué cambia para vos" → revisor frío →
  `DISENO-F-*.md` con su tabla de criterios → marcar en el PLAN.

## Cosas que muerden y no están en ningún otro doc

- 📬 **El Hub**: su director (sesión `director-orden-hub`, en esta PC; no aparece en la lista de la app, sí en
  `ListAgents`) recibió el brief con los 4 pedidos (campo `repo`, `tipo`, "se conecta con", credencial de solo lectura)
  y el concepto del agente de ecosistema. Lo guardó como misión aparte en su repo. Ese mismo día ordenó sus carpetas
  (rama `refactor/orden-de-directorios`, sin mergear) y le puso tope al hook (de ~43 KB a 7.400 caracteres). Preguntó
  por `docs/specs/` y la carpeta de referencia: quedó anotado para el racimo B (TABLERO §10). El brief completo está en
  el escritorio de esta PC, `pedidos-al-hub-desde-el-arquitecto.md`, y en el repo del Hub. **Después del cierre**, otra
  sesión del Hub mandó el contrato del registro (API HTTP con llave propia; proyectos y sistemas; notas del Arquitecto,
  ampliación del dueño); se le contestó y quedó anotado en TABLERO §10, racimo I. Si vuelve a preguntar, la respuesta
  está en esa nota.
- 📬 **El buzón multiagente**: se diseña recién en el racimo G; nada de rutas, nombres ni contenido entra acá
  (ADR-021). El cruce real entre PCs no se probó.
- 🧠 La memoria de Claude **no viaja entre PCs**: por eso el norte, la forma de pensar y los 11 criterios están en el
  PLAN. En esta PC quedaron además en la memoria del proyecto.
- ❓ **Pregunta abierta** (FLOTA §8): la segunda cuenta de GitHub. **Dato nuevo: es la identidad de git de esta PC.**
  Si Guido operaba por Remote Control desde acá, los commits "de la segunda cuenta" pueden ser suyos. Falta que lo
  confirme. Su nombre no entra al repo.
- 🔐 **Alertas abiertas de Hermes**, detalle solo en el archivo privado. Las arregla Guido. **NO VERIFICADO.**
- 🔴 **vibe-kit es PÚBLICO**: gitleaks antes de cada push (hoy: limpio sobre `docs/mision-4`). Con varias sesiones
  sobre el repo, mirar `git log` antes de cerrar.
- 🖥️ Los directores de los dos Hermes corren en la PC `clientes`; se los lee por `gh`.

## Bloqueos

Ninguno.
