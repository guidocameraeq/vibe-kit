# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo
> inyecta en cada chat nuevo de esta carpeta.

**Última sesión cerrada:** 2026-10-14, PC `clientes` (`D:\vibe-kit`). **Misión 4, tramo 2 hecho: la
evidencia de afuera.** Fue solo diseño: no se tocó `kit/` ni ningún proyecto. El kit sigue sin bump (`v2.4.2`).

## Qué salió

- **Tres documentos en `docs/mision-4/`**:
  - [`FLOTA.md`](mision-4/FLOTA.md): los 10 proyectos con código, qué traen del método, sus skills propias,
    el hook y las barreras;
  - [`REPOS.md`](mision-4/REPOS.md): lo que cuenta git, con líneas base;
  - [`PLATAFORMA.md`](mision-4/PLATAFORMA.md): qué de lo armado a mano ya es nativo.

  Los scripts (`flota.py`, `huella.py`, `repos.py`) quedaron en `observatorio/investigacion/`, para la
  medición mensual.
- **Costo**: el agente de la plataforma gastó **~312 mil tokens, 3× lo estimado**. Los scripts, casi nada.
  La lección quedó en el PLAN.
- **Lo fuerte**:
  - **El hook de arranque del molde no tiene tope**, y la plataforma corta a 10.000 caracteres: dos
    proyectos arrancan sin ver su estado. Entró al TODO 🔴 y hay una tarjeta de sesión propuesta.
  - Hay **3 dialectos** de director/obrero: Deptos tiene la versión corta.
  - **Ningún proyecto marca su versión** del método.
  - El molde **no trae `deny`**.
  - **1 de cada 4 arreglos arregla otro arreglo**, y casi ninguno trae su prueba.
  - **Abrir sesiones, los avisos, el estado y los mensajes entre PCs ya son nativos**, con huecos.
- `PLAN.md`: el tramo 2 quedó ✅, el brief del tramo 3 dice qué entra del 2, y hay 2 lecciones nuevas
  para el ciclo.

## Próximo paso concreto: misión 4, tramo 3 (el mapa por objetivos)

**Título de la sesión: `vibe-kit M4 · Tramo 3: mapa por objetivos`** (`/inicio` se lo pone al confirmar).

Chat nuevo acá → `/inicio` → Guido dice **"misión 4, tramo 3"**. El esfuerzo se elige antes de arrancar:
`high` como mínimo, y `xhigh` o Fable si Guido quiere (cruzar es de lo más pesado).
- **Lee**: `PLAN.md`, la radiografía (§10) y los tres documentos del tramo 2 (~60 KB en total).
- **Brief**: la fila del tramo 3 del PLAN:
  - P1-P57 del acta, consultada por partes;
  - un barrido de lo que quedó afuera (Sonnet sobre las síntesis, **~250 mil tokens: confirmar antes**);
  - lo de los tramos 1 y 2.

  Todo eso se reparte por los 7 objetivos, cada cosa con su línea base. Las 10 mejoras se marcan
  "construir" o "adoptar" según `PLATAFORMA.md` §6.
- **Sale con**: `docs/mision-4/TABLERO.md`.

**Orden fijo: diseño → spec → construcción** (la construcción es la misión 5).

## Cosas que muerden y no están en ningún otro doc

- ❓ **Pregunta abierta para Guido** (FLOTA §8): una segunda cuenta de GitHub firma casi todo lo reciente
  en Portal, Devoluciones y Hub. ¿Es el compañero o es otra PC de Guido? Cambia a quién le toca cada
  proyecto. **El nombre de esa cuenta no entra al repo.**
- 🔐 **Alertas de seguridad abiertas** de Hermes: credenciales en chats, `/smoke` de Desktop con un login
  de producción, rotaciones, barreras de permisos. El detalle está solo en
  `D:\vibe-hallazgos\ALERTAS-SEGURIDAD.md`. Las arregla Guido en el chat de cada Hermes. **NO VERIFICADO**.
- 🖥️ **Mesa entre PCs**:
  - que el permiso no viaje es **por diseño** (PLATAFORMA §4);
  - hace falta **Remote Control prendido en las dos sesiones**;
  - **hipótesis sin verificar**: si una sola de las dos está en bypass, la app retiene el mensaje 5 min y lo tira.
- 📏 **Hermes Mobile**: el método vigente vive en `main`; la bitácora y los documentos grandes, en su
  rama. Antes de medir, mirar la rama.
- 🖥️ **PC `Usuario` desfasada** hasta que le diga `actualizate` al Equipador. Ahí, mirar que la línea
  "Carpeta de proyectos" del Arquitecto tenga su ruta (**NO VERIFICADO**).
- 📦 **`D:\vibe-hallazgos\` NO SE BORRA** hasta el final de la hoja de ruta (ADR-022). Tiene lo privado,
  incluidas las alertas. El repo privado `guidocameraeq/vibe-research` sirve de respaldo.
- 🔴 **vibe-kit es PÚBLICO**: los proyectos van con alias (los de `FLOTA.md`), sin nombres reales.
  Antes de cada push: gitleaks (instalado vía WinGet en esta PC).
- La otra PC se llama `Usuario` (`C:\Users\Usuario\Desktop\Proyectos\vibe-kit`, sin disco D). El capataz
  (P41) no es parte del workflow.

## Bloqueos

Ninguno.
