# CLAUDE.md — Reglas para Claude Code en {{PROYECTO}}

> Solo reglas de comportamiento. Test por línea antes de agregar nada: **si borro esta línea, ¿Claude se equivoca? Si no, sobra.**

## Mapa de documentación

La única copia del mapa: `docs/README.md` y el resto apuntan acá. En la raíz de `docs/` van **seis archivos y tres carpetas**; lo que no encaja en ninguna fila va a `referencia/`, sin preguntar.

| Dónde | Qué va | Qué manda sobre qué |
|---|---|---|
| `docs/NORTE.md` | Qué es la app, para qué, para quién, qué NO hace, lo que solo sabe el dueño. Una pantalla | Lo escribe el dueño o el Arquitecto; ante la duda del "para qué", manda esto |
| `docs/MAPA.md` | Cómo se conecta por dentro y con otras apps. Una pantalla; puede no existir | La arquitectura a fondo va a `referencia/ARCHITECTURE.md` |
| `docs/SESSION_HANDOFF.md` | Dónde quedamos. Tope 5.000 bytes; `/cierre` lo sobreescribe entero | Es una foto con edad: si el código o git dicen otra cosa, mandan ellos |
| `docs/TODO.md` | La única fuente de pendientes; sin fechas a mano | Los pendientes de un módulo van en su ficha |
| `docs/CHANGELOG.md` | La historia, una entrada por sesión, la más nueva arriba | Es registro: no se reescribe |
| `docs/README.md` | La puerta para quien llega por GitHub: tres líneas y la tabla de mudanza de rutas | No repite este mapa |
| `docs/modulos/<x>/` | Una carpeta por módulo: su ficha (`README.md`, el estado con tope), su `SPEC.md` y su historia | La ficha es del dueño del módulo; manda el spec más nuevo del módulo |
| `docs/referencia/` | Lo que no cambia con el trabajo diario: `ARCHITECTURE.md`, `DECISIONS.md`, `REJECTED.md`, `trampas.md`, `PRUEBA.md` | `trampas.md` es el desborde de este archivo |
| `docs/archive/` | Solo lo que murió de verdad. Los módulos no vienen acá | — |
| `.claude/kit.md` | La ficha del kit: versión, nivel, piezas y frenos quitados. Es del método, no de la app | La lee un script: respetá su forma |
| `.claude/frenos.log` | Lo que frenaron los hooks. Solo se agrega; lo escriben los hooks | No se edita |

## El tamaño del pedido

Ante un pedido nuevo, **la primera línea de tu respuesta es el tamaño**, sin preguntar. Dos preguntas: ¿hace falta algo más que el pedido y el `git diff` para retomarlo? ¿lleva más de una sesión? Ninguna sí: *"chico, lo hago acá"*. Alguna sí: *"esto es más que chico: llamo al Arquitecto"*, e invocás `/arquitecto`. Tocar plata, permisos o datos reales no lo agranda: eso lo cuidan los frenos, no un spec.

## Evidencia con datos reales

La evidencia con datos reales (capturas, exports, volcados) vive **fuera del repo, con registro** (ruta, tramo, quién la borra), y se borra al cerrar.
