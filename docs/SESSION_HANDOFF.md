# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo
> inyecta en cada chat nuevo de esta carpeta.

**Última sesión cerrada:** 2026-10-14, PC `clientes` (`D:\vibe-kit`). **Misión 4, tramo 3 hecho: el mapa
por objetivos.** Fue solo diseño: no se tocó `kit/` ni ningún proyecto. El kit sigue sin bump (`v2.4.2`).

## Qué salió

- **[`docs/mision-4/TABLERO.md`](mision-4/TABLERO.md)**: ~140 cosas repartidas por los 7 objetivos, cada
  una en uno solo y con su línea base. Trae además:
  - las líneas base que se repiten cada mes (§1);
  - las 10 mejoras: 4 adoptar, 4 construir, 2 mixtas (§9);
  - 8 racimos para el diseño (§10);
  - lo que no se rompe y lo que queda afuera.
- **El barrido**: 3 lectores Sonnet, **~405 mil tokens** (1,6× lo estimado). Encontraron 50 cosas que no
  habían llegado a ninguna conclusión (código `S-`), sobre todo de seguridad y calidad.
- **Un anexo que entró en paralelo**: otra sesión agregó a la radiografía los 11 cambios que aprobó Mobile
  (commit `e82538f`). Ya está en el tablero: 2 hallazgos nuevos y 3 mejoras que Mobile ya está probando.
- `PLAN.md`: el tramo 3 quedó ✅, con 2 lecciones nuevas para el ciclo.

## Próximo paso concreto: misión 4, tramo 4 (diseño por pilar)

**Título de la sesión: `vibe-kit M4 · Tramo 4: diseño por pilar`** (`/inicio` se lo pone al confirmar).

Chat nuevo acá → `/inicio` → Guido dice **"misión 4, tramo 4"**. El esfuerzo: `high` como mínimo; `xhigh`
o Fable para las decisiones grandes.
- **Lee**: `PLAN.md` y `TABLERO.md`. La radiografía y los documentos del tramo 2, solo por la sección
  que haga falta.
- **Primera decisión con Guido: el orden de los pilares.** La recomendación del tablero es arrancar por
  tres racimos:
  - **A · Frenos y verificación**;
  - **C · Una salida hacia Guido**;
  - **E · Un molde y la flota**. Este trae la decisión grande: el Arquitecto como agente único ("una
    puerta, varios módulos", contra ADR-004 y REJ-003; y el plugin contra el Equipador).

  **F · Seguridad** es el mejor primer paso del piloto.
- **Cómo**: de a una decisión, con opciones, pros y contras y UNA recomendación. Cada parte del plano se
  escribe en `docs/mision-4/`. Probablemente lleve más de una sesión.

**Orden fijo: diseño → spec → construcción** (la construcción es la misión 5).

## Cosas que muerden y no están en ningún otro doc

- ❓ **Pregunta abierta para Guido** (FLOTA §8): una segunda cuenta de GitHub firma casi todo lo reciente
  en Portal, Devoluciones y Hub. ¿Es el compañero o es otra PC de Guido? Frena el racimo G (mesa y PCs).
  **El nombre de esa cuenta no entra al repo.**
- 🔐 **Alertas de seguridad abiertas** de Hermes. El detalle está solo en
  `D:\vibe-hallazgos\ALERTAS-SEGURIDAD.md`. Las arregla Guido en el chat de cada Hermes. **NO VERIFICADO**.
- 🧪 **Mobile ya está probando**:
  - la mejora #4;
  - parte de la #3: el script de mutaciones y la regla contra esquivar controles, metida en la definición
    del implementador;
  - el gate con su skill;
  - **P1 + P2**: cada regla nueva dice si es freno o regla blanda, y cómo se va a saber si funcionó.

  Es su decisión D-192 (cambios C-87 a C-90), aplicada en un bloque desde el 2026-10-14; los SHA, por
  `git log` con esos números (está escrito: verificado). Antes de diseñar esos racimos, medir ahí el antes
  y el después. Los datos del piloto están en su bitácora de hallazgos desde H-145. Los primeros, en la
  radiografía, Anexo A.2: H-152 (el cambio de método rompió otro control en un día) y H-151 (una regla
  quedó con dos definiciones).
- 🧪 **Desktop adoptó parte del mismo cambio el 2026-10-15** (CM-63, verificado en git), **sin P1 + P2**.
  Eso deja un contraste para medir: el mismo cambio, con medida en un proyecto y sin medida en el otro. Su
  dato: la regla avisada en cada encargo falló ~5 veces en un día, y por eso la pasaron a la definición del
  agente. Detalle en la radiografía, Anexo A.3.
- 🖥️ **Mesa entre PCs**: el permiso no viaja (es así por diseño); Remote Control tiene que estar prendido en
  las dos sesiones. Hipótesis **NO VERIFICADA**: si solo una está en bypass, la app tira el mensaje.
- 📏 **Hermes Mobile**: el método vigente vive en `main`; la bitácora y los documentos grandes, en su rama.
- 🖥️ **PC `Usuario` desfasada** hasta que le diga `actualizate` al Equipador (**NO VERIFICADO**).
- 📦 **`D:\vibe-hallazgos\` NO SE BORRA** hasta el final de la hoja de ruta (ADR-022). Respaldo: el repo
  privado `guidocameraeq/vibe-research`.
- 🔴 **vibe-kit es PÚBLICO**: los proyectos van con alias (los de `FLOTA.md`). Antes de cada push, gitleaks.
- 👥 **Dos sesiones commitearon hoy sobre este repo.** Antes de cerrar, mirar `git log`.

## Bloqueos

Ninguno.
