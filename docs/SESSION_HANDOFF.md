# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo
> inyecta en cada chat nuevo de esta carpeta.

**Última sesión cerrada:** 2026-10-21, en la **notebook** (una tercera PC: ni `clientes` ni `Usuario`).
Fue la misión 4, tramo 4: **racimos A y C diseñados**. Solo diseño, sin cambios al kit (sigue en `v2.4.2`).
Todo quedó pusheado (la cuenta de GitHub de la notebook recibió permiso de escritura el 21/10).

## Dónde estamos

- **Misión 4**: los tramos 0 a 3 están hechos ([`PLAN.md`](mision-4/PLAN.md)). **El tramo 4 va por
  racimos**, en este orden: A → C → E → F → B → D → G → H.
  - ✅ **A · Frenos** ([`DISENO-A-frenos.md`](mision-4/DISENO-A-frenos.md)). Un agente le pregunta a
    Guido **solo 4 cosas**: borrar datos reales, tocar plata, manejar claves y mandar algo hacia afuera a
    su nombre. Lo demás son correctores que no lo molestan.
  - ✅ **C · Salida hacia Guido** ([`DISENO-C-...`](mision-4/DISENO-C-salida-hacia-Guido.md)).
    - Silencio por defecto.
    - `/estado <proyecto>` y `/estado <subproyecto>`, que sin nombre sale del contexto.
    - Una tabla de tiempos con tokens. **Estima el director, no un script.**
- 🧭 **El norte de todo el diseño** (PLAN, §El foco): un workflow ágil en el que Guido casi no
  interviene. Decide el diseño y el negocio; los agentes ejecutan. Ningún freno de adorno.
  **Presentarle cada decisión en criollo y corta, diciendo qué cambia para él.** Un primer intento con
  siglas y opciones técnicas no se entendió.
- 🆕 Se sumó al mapa:
  - **subproyectos dentro de un proyecto**, cada uno con sus documentos, reporte, estimación y consumo
    (racimo H);
  - **la mensajería multiagente**, el buzón (racimo G);
  - [`REFERENCIAS-EXTERNAS.md`](mision-4/REFERENCIAS-EXTERNAS.md): gentle-ai, agency-agents y MetaGPT,
    con 8 ideas nuevas, cada una con su racimo.

## Próximo paso: racimo E (el molde y la flota)

**Título de la sesión: `vibe-kit M4 · Tramo 4: racimo E`** (`/inicio` se lo pone al confirmar).
**Esfuerzo `xhigh`, o Fable**: trae la decisión grande.

- **Lee**:
  - el norte del `PLAN.md`;
  - `TABLERO.md` §5, §10 (la fila E) y §12;
  - de `FLOTA.md`, §1, §6, §7 y §9;
  - de `REFERENCIAS-EXTERNAS.md`, las filas E.
- **La decisión grande: el Arquitecto como agente único**, que prepara la PC, arranca proyectos y mantiene
  la flota. **Choca con ADR-004 y REJ-003.** El camino propuesto: una sola puerta, varios módulos.
- **Lo demás del racimo**:
  - las skills canónicas más una ficha por proyecto (P31);
  - la versión visible en cada proyecto (0 de 10 la marcan);
  - `/smoke` y `/release` al molde;
  - `AGENTS.md` y "una fuente → cada herramienta", para el multi-LLM;
  - `doctor` y `--dry-run` en el Equipador.
- **Cómo**: una ficha de una pantalla, después decisiones de a una (en criollo), después
  `DISENO-E-*.md`, y al final se marca en el PLAN.

## Cosas que muerden y no están en ningún otro doc

- 📬 **El buzón multiagente**:
  - lo diseña otra sesión, el proyecto `buzon-agentes` de esta PC, con un SPEC-0 en borrador;
  - el v0 corre como piloto en una carpeta compartida de la organización;
  - vibe-kit está registrado ahí como director y ya contestó;
  - **se diseña recién en el racimo G**;
  - **ninguna ruta, ningún nombre de PC ni ningún contenido del buzón entra a este repo** (ADR-021);
  - la primera prueba fue en la misma PC y con la misma cuenta, así que **el cruce real no se probó**.
- 🧠 La memoria de Claude **no viaja entre PCs**: el norte está escrito en el PLAN por eso.
- 🖥️ En la notebook hay Node 24 y gitleaks, y `kit-sync` quedó en LIMPIO. En la PC `Usuario` no está
  `D:\vibe-hallazgos\`: lo privado está en `guidocameraeq/vibe-research`.
- 🖥️ **Los directores de los dos Hermes corren en la PC `clientes`**: se los lee por `gh`. No hace falta
  preguntarles si anotan los tiempos por tarea: se oficializa en sus skills, en la misión 5.
- ❓ **Pregunta abierta** (FLOTA §8): la segunda cuenta de GitHub. Frena el racimo G. **Su nombre no
  entra al repo.**
- 🔐 **Alertas abiertas de Hermes**, con el detalle solo en el archivo privado. Las arregla Guido.
  **NO VERIFICADO.**
- 🔴 **vibe-kit es PÚBLICO**: antes de cada push, gitleaks. Con varias sesiones sobre el repo, mirar
  `git log` antes de cerrar.

## Bloqueos

Ninguno.
