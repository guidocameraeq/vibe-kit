<!-- Se instancia al cerrar E3.5 con veredicto software Y apto: SI. Es 100% DERIVADO y sus
     fuentes siguen cambiando: por eso lleva los hashes. Si alguno no coincide, se REGENERA
     antes de leerse — no se advierte, se regenera. El Arquitecto lo lee sólo si la invocación
     le nombra esta ruta (token explícito): cero glob, cero adivinanza. -->

# Handoff al Arquitecto — Modo {{A greenfield | B sobre <app>}}
Relevamiento: {{slug}} · E1-E3 cerradas {{fecha}} · apto: SI · Veredicto: software
Derivado de: 1-problema.md {{hash}} · 2-sistema-actual.md {{hash}} · 3-necesidad.md {{hash}}

## 1. El pedido, ya desarmado
Como lo dijeron: {{E1-P1 verbatim}}       Lo que hay que resolver: {{E1-P3, el fondo}}
Quién lo sufre: {{E1-P4}}                 Cada cuánto: {{E2-P4}}
Lo que necesita lograr: {{E1-P5, 01:43}}

Con esto O1-O5 del banco ya están contestadas: **no las re-preguntes.** Todo lo demás
(tipo de app, entidades, login, multi-tenant ⚠️, i18n ⚠️, concerns) lo preguntás igual.

## 2. El techo — es RECORTE, no plazo
Apetito: {{E3-P4}} días. Si el diseño no entra, se recorta el ALCANCE.
Recorte mínimo que ya sirve: {{E4-P6 si ya está escrito | "todavía no definido — se escribe en E4"}}

## 2-bis. Cómo vamos a saber que sirvió
Criterio de éxito: {{E3-P3 textual, 03:21, sin nombrar solución}}
Línea base hoy:    {{E3-P1, el número, 03:15}}
Se mide así:       {{la consulta escrita}}
Traducilo a criterios de aceptación del SPEC-0. El texto NO se re-escribe:
es el que se chequea a las 4-6 semanas.

## 3. Ya decidido — NO lo re-propongas
Alternativas evaluadas y descartadas, con su razón y su número: {{...}}
Supuestos ya probados barato: {{E3-P7: qué se probó y qué dio}}
El supuesto más riesgoso VIVO: {{E3-P6}} — si es falso, el diseño se cae.

## 4. Candidatos a NO SE TOCA (de la etapa HUMANA, no del código)
Lo que la gente usa todos los días y no puede dejar de andar: {{E2-P1, E2-P4}}
Cruzalo con el código y completalo. Es materia prima, no la sección final.

## 5. Lo que el relevamiento NO respondió (tu trabajo)
Efectos colaterales en el código real · ¿toca datos que ya creó el usuario? ·
¿hay migración? · ¿puede romper algo que hoy funciona?
Casillas tildadas PARA ESTE PEDIDO: {{lista}}

## 6. [SOLO BROWNFIELD] Lo que Guido contó del sistema actual
Fuente: lo que dictó Guido / docs-fyd del {{fecha}} si existe.
NO es un censo del código: verificalo vos.

---
**Cómo leer los sellos:** lo marcado `SUPUESTO` no lo dijo nadie — es una hipótesis sin verificar,
no la trates como hecho. `DE MEMORIA` es Guido acordándose, aunque diga "me lo dijo X".
Sólo `RELEVADA` tiene una persona atrás, con su `notas/<persona>.md`.

**Cuando termines de diseñar: NO montes.** Devolvé el plano acá y devolvé el control a
`/relevamiento`, que tiene que escribir la Etapa 4 y llevarla a la reunión. El montaje corre
recién con la propuesta aprobada.
