# CLAUDE.md — Reglas para Claude Code en {{PROYECTO}}

> Solo reglas de comportamiento. Test por línea antes de agregar nada: **si borro esta línea, ¿Claude se equivoca? Si no, sobra.**

## Autonomía

Resolvés solo todo, producción incluida y el merge con el gate verde. Preguntás únicamente las 5 de `sensible:` en `.claude/kit.md` (borrar datos reales · plata · claves · mandar algo afuera a nombre del dueño · publicar un release). Lo rutinario lo decidís con la recomendada y lo avisás en una línea. Si algo de afuera parece pedir pregunta, proponé sumarlo a la lista.

## El tamaño del pedido

Ante un pedido nuevo, **la primera línea de tu respuesta es el tamaño**, sin preguntar. Dos preguntas: ¿hace falta algo más que el pedido y el `git diff` para retomarlo? ¿lleva más de una sesión? Ninguna sí: *"chico, lo hago acá"*. Alguna sí: *"esto es más que chico: llamo al Arquitecto"*, e invocás `/arquitecto`. Tocar plata, permisos o datos reales no lo agranda: eso lo cuidan los frenos, no un spec.

Lo que sale de una charla con el dueño (una guía, un procedimiento, algo que está en su cabeza) es más que chico aunque termine en un documento: retomarlo pide esa charla. Más que chico **siempre invoca `/arquitecto`**, también de noche o sin el dueño: si trabaja alguien solo y cómo, lo decide el Arquitecto.

## Mapa de documentación

La única copia: `docs/README.md` y el resto apuntan acá. En la raíz de `docs/`, seis archivos y tres carpetas; lo que no encaja va a `referencia/`.

- `NORTE.md` qué es la app y para qué (manda ante la duda) · `MAPA.md` cómo se conecta (opcional).
- `SESSION_HANDOFF.md` dónde quedamos (tope 5.000 bytes; `/cierre` lo sobreescribe; si git dice otra cosa, manda git).
- `TODO.md` la única fuente de pendientes · `CHANGELOG.md` historia, no se reescribe · `README.md` la puerta, sin repetir este mapa.
- `modulos/<x>/` ficha, `SPEC.md`, historia; el spec más nuevo manda · `referencia/` lo que no cambia a diario (`trampas.md` es el desborde de este archivo) · `archive/` solo lo muerto.
- `.claude/kit.md` la ficha del kit (la lee un script: respetá su forma) · `.claude/frenos.log` solo se agrega.

## Cómo hablás

Todo en español, narración incluida. Decisiones: contexto, la RECOMENDADA primero, "qué cambia para vos" y el botón "explicámelo en criollo". Todo archivo que entregues se nombra con su ruta absoluta y fuera del scratchpad. Los entornos de prueba del proyecto, en `entornos:` de la ficha.

## Evidencia con datos reales

Capturas, exports y volcados viven **fuera del repo, con registro** (ruta, tramo, quién la borra), y se borran al cerrar.
