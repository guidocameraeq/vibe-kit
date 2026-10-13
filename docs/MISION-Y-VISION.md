# Misión y visión — vibe-kit

> **Ojo con la palabra:** acá "misión" = **para qué existe el proyecto**. No confundir con "una
> misión = un chat de trabajo", que es como el método llama a cada tarea. Escrito 2026-10-13
> (ADR-023); se toca solo si cambia el rumbo.

## El problema

Dirigir Claude Code sin ser programador funciona, pero se rompe siempre por los mismos lados: chats
eternos que se compactan y se olvidan, el "estado actual" escrito en seis lugares que se
contradicen, la misma corrección explicada diez veces, proyectos que arrancan sin plano. Todo eso se
midió en proyectos reales (Hermes, Perseo) y en 70 días de uso de este kit.

## La misión — para qué existe

Juntar en un solo lugar **el método para dirigir Claude Code sin escribir código**, y las
herramientas que lo vuelven mecánico: un playbook, un Arquitecto que planea y monta proyectos, un
Equipador que prepara cada PC, un tramo de relevamiento para los pedidos que vienen de otros, y un
observatorio que mira el uso real y propone mejoras. **Cada regla lleva su cicatriz**: nada entra
sin evidencia de dónde dolió.

## La visión — adónde va

Un **pack regalable**: que otra persona, con otra PC y otros proyectos, lo instale y trabaje con el
mismo orden — con el norte de cada proyecto escrito, un manual por módulo y la dirección de modelos
resuelta. Eso se diseña en la misión 4 de la hoja de ruta (`docs/TODO.md`), con Guido adentro.

## Para quién

**Para Guido primero.** Es su taller: el kit tiene cosas propias (sus carpetas, su método de
relevamiento, sus proyectos). **Para otros, después**: el repo es público y cualquiera puede mirarlo
o copiarlo, pero es **personal y en evolución, sin promesa de soporte**.

## Qué NO hace

- **No construye apps.** Las apps se construyen en sus propias carpetas; acá se mantiene el método.
- **No es un producto con soporte** (todavía): cambia cuando la evidencia lo pide.
- **No es un plugin** de Claude Code: son skills que se copian a `~/.claude/` (ADR-001).
- **El observatorio no aplica nada**: mira, extrae y propone; decide la sesión madre con Guido.

## De dónde viene

De dos auditorías de chats largos (Hermes, ~4 meses; Perseo, 6 semanas), que dieron el playbook; de
un v1 que murió sin instalarse (`legacy/vibe-kit-v1/`); y de la investigación de 70 días de uso
(`tips/tanda-2026-10-chats.md`). La historia completa está en `docs/DECISIONS.md`.

## Qué otros sistemas toca

- **`~/.claude/` de cada PC**: el kit se copia ahí desde `kit/` (la fuente es este repo, ADR-003).
- **Los proyectos de Guido**: el Arquitecto les monta CLAUDE.md, docs y skills `/inicio`/`/cierre`.
- **GitHub** (este repo, público): de acá baja el Equipador cuando le dicen `actualizate`.
