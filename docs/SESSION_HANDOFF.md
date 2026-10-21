# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo
> inyecta en cada chat nuevo de esta carpeta.

**Última sesión cerrada:** 2026-10-21, PC `clientes` (`D:\vibe-kit`). **Checkpoint para mudarse a la PC
`Usuario`.** La misión 4 tiene hechos los tramos 0 a 3, y la radiografía suma el estado del piloto al 21/10
(Anexo A.5). Fue solo diseño: kit sin bump (`v2.4.2`). Todo quedó pusheado: este repo y el privado.

## Dónde estamos

- **Misión 4, solo diseño** ([`PLAN.md`](mision-4/PLAN.md)):
  - ✅ tramo 0, la biblioteca;
  - ✅ tramo 1, la radiografía;
  - ✅ tramo 2, flota, repos y plataforma;
  - ✅ tramo 3, el tablero.

  **Faltan el 4 (diseño por pilar) y el 5 (el spec).** Construir es la misión 5.
- **El piloto ya corre solo en los dos Hermes**, sin que el pack exista:
  - **Desktop**:
    - 2 frenos mecánicos: Python por la entrada y los comandos de git que borran trabajo;
    - un trinquete, el de atribuciones;
    - cada freno se midió contra el historial antes de instalarlo (37.842 comandos, 0 falsos positivos);
    - cada regla nueva dice si es freno o regla blanda, y cómo se mide.
  - **Mobile**: D-192 (C-87 a C-90), más 8 hallazgos con reglas blandas propuestas. En H-161, un
    subagente rodeó un freno cambiando de herramienta.
  - El detalle y los SHA están en la radiografía, Anexos A.1 a A.5.

## Próximo paso: misión 4, tramo 4 (diseño por pilar), en la PC `Usuario`

**Título de la sesión: `vibe-kit M4 · Tramo 4: diseño por pilar`** (`/inicio` se lo pone al confirmar).

**Antes, una sola vez, en la PC `Usuario`:**
1. `git pull` en `C:\Users\Usuario\Desktop\Proyectos\vibe-kit`.
2. `bash .claude/scripts/kit-sync.sh`. Ahí **va a dar sucio, y es lo esperado**: esa PC no tiene la misión
   3. Corré `bash .claude/scripts/kit-sync.sh sync` hasta que dé `LIMPIO`, y fijate que el Arquitecto
   conserve su "Carpeta de proyectos".
3. Si no está gitleaks, `winget install gitleaks`: hace falta antes de cada push.

**Después**: chat nuevo → `/inicio` → **"misión 4, tramo 4"**. El esfuerzo: `high` como mínimo; `xhigh` o
Fable para las decisiones grandes.
- **Lee**: `PLAN.md`, `TABLERO.md` y, de la radiografía, §10 y los Anexos A.4 y A.5 (el piloto).
- **Primera decisión con Guido: el orden de los pilares.** El tablero recomienda arrancar por:
  - **A · Frenos y verificación**;
  - **C · Una salida hacia Guido**;
  - **E · Un molde y la flota**. Este trae la decisión grande: el Arquitecto como agente único, contra
    ADR-004 y REJ-003.

  **F · Seguridad** es el mejor primer paso del piloto.
- **El racimo A ya trae recetas medidas en el piloto**:
  - medir el freno contra el historial antes de instalarlo;
  - cubrir todas las herramientas que logran lo mismo (H-161);
  - chequear que los permisos no desmientan la regla.
- **Cómo**: de a una decisión, con opciones, pros y contras y UNA recomendación. Cada parte del plano va a
  `docs/mision-4/`. Probablemente lleve más de una sesión.

## Cosas que muerden y no están en ningún otro doc

- 🖥️ **En la PC `Usuario` no está `D:\vibe-hallazgos\`** (no tiene disco D). Lo privado está en el repo
  privado `guidocameraeq/vibe-research`, en `biblioteca/`, con las alertas al día al 21/10. Clonarlo con
  `gh` solo si hace falta un detalle.
- 🖥️ **Los directores de los dos Hermes corren en la PC `clientes`.** Desde la otra PC, lo mejor es leer su
  git con `gh`: los dos repos están en GitHub y pusheados, y Mobile tiene la bitácora en la rama
  `v4/bitacora`. Remote Control anda si está prendido en las dos puntas. Para pedirles novedades, un mensaje
  con formato fijo (la lección del 21/10 en el PLAN).
- ❓ **Pregunta abierta para Guido** (FLOTA §8): una segunda cuenta de GitHub firma casi todo lo reciente en
  Portal, Devoluciones y Hub. ¿Es el compañero o es otra PC de Guido? Frena el racimo G. **El nombre de esa
  cuenta no entra al repo.**
- 🔐 **Alertas abiertas de Hermes**, con el detalle solo en el archivo privado:
  - credenciales que pasaron por chats;
  - el `/smoke` de Desktop con un login de producción;
  - rotaciones pendientes;
  - las barreras de permisos de Desktop;
  - un login desde el código fuente que todavía va a producción.

  Las arregla Guido en el chat de cada Hermes. **NO VERIFICADO.**
- 🖥️ **Mesa entre PCs**: que el permiso no viaje es por diseño. Hipótesis **NO VERIFICADA**: si solo una de
  las dos sesiones está en bypass, la app tira el mensaje.
- 📦 **`D:\vibe-hallazgos\` NO SE BORRA** hasta el final de la hoja de ruta (ADR-022).
- 🔴 **vibe-kit es PÚBLICO**: los proyectos van con alias (los de `FLOTA.md`). Antes de cada push, gitleaks.
- 👥 Con varias sesiones sobre el repo, mirar `git log` antes de cerrar.

## Bloqueos

Ninguno.
