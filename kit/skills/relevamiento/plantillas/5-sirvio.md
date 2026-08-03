# ¿Sirvió? — {{titulo}}

<!-- EL FLUJO (se corre con "relevamiento sirvió", o cuando la guardia de entrada ve un
     `chequeo:` vencido y Guido dice que sí):
     1. Leé 3-necesidad.md y sacá la línea base (03:15) y el criterio (03:21) TAL CUAL se
        escribieron. No los re-redactes: el texto es el que se chequea.
     2. Volvé a correr LA MISMA consulta escrita en "se mide así". Si no se puede, decilo.
     3. Tres preguntas, una por vez:
        · ¿Se cumplió el criterio?  (Sí / A medias / No / **Todavía no se usa**)
        · ¿Lo están usando, o volvieron al método de antes?
        · ¿Apareció algo que el relevamiento no vio?
     4. "Todavía no se usa" → NO escribas este archivo. Re-sellá `chequeo: +4 semanas` en el
        TABLERO. A la TERCERA vez se apaga, con la razón escrita. Ni silencio eterno ni
        recordatorio infinito.
     5. Rama "no construir": versión corta — ¿el problema sigue vivo? / ¿se hizo lo que no era
        software? / ¿cambió algo? ("¿lo están usando?" no aplica).
     6. Emitir pdf/5-sirvio.pdf y sellar `chequeo: <fecha>`. -->

**Relevamiento:** {{slug}} · **Primer uso:** {{fecha}} · **Chequeo:** {{fecha}} ({{N}} semanas después)

## Lo que dijimos que íbamos a mirar
> Copiado textual de `3-necesidad.md`, sin re-redactar.

- **Criterio de éxito (03:21):** {{textual}}
- **Línea base de entonces (03:15):** {{el número, con su balde}}
- **Se medía así:** {{la consulta}}

## Lo que dio
- **Hoy:** {{el número de ahora, con la misma consulta}} · **Antes:** {{la línea base}}
- **Veredicto:** {{se cumplió | a medias | no se cumplió}} — {{una línea, sin suavizar}}

## ¿Lo están usando?
{{o volvieron al método de siempre — y por qué. Esto vale más que el número.}}

## Lo que el relevamiento no vio
{{lo que apareció en el uso real y no estaba en ninguno de los 4 documentos}}

## El pago — qué cambia en el método
<!-- Sólo si el fallo fue DEL RELEVAMIENTO (no del diseño ni de la construcción). -->
{{propuesta concreta de cambio a una plantilla o a una lente, con la evidencia de acá}}

> **Esto es una propuesta, no un cambio.** Se lleva al repo madre (vibe-kit): la sesión madre
> decide y aplica (ADR-010). La skill jamás se auto-modifica.
