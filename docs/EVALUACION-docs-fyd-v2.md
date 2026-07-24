# Evaluación: ¿docs-fyd v2 mejoró de verdad? — protocolo — vibe-kit

> Cómo sabemos, **con evidencia y no con opinión**, si los cambios del SPEC `docs-fyd v2` arreglaron
> lo que el reporte de campo (Hermes Desktop, 2026-07-23) señaló. La idea es simple: **re-correr v2
> sobre el MISMO repo real y puntuar contra las MISMAS fallas concretas de v1.** Cada falla de v1 es
> un caso de prueba. No inventamos un test sintético — usamos la realidad que ya dolió.

## La línea de base (v1, del reporte de Hermes)

| Métrica | v1 |
|---|---|
| Artefactos que necesitaron corrección a mano | 9 de 10 |
| Correcciones que NO se derivan del código | 9 |
| Afirmaciones-negativas-por-ausencia entregables (falsas) | varias — "no hay backups", "falta RLS en la tabla de contraseñas", "base exclusiva de la app" |
| Errores de hecho que se escapaban SIN verificación adversarial manual | 6 (+ 4 omisiones) |
| Correcciones perdidas en una regeneración | todas (en silencio) |
| Fugas de secretos · escrituras fuera del write-set | 0 · 0 (ya estaban bien — se mantienen) |
| Diagramas Mermaid que renderizan | 8 de 8 (validado a mano por el dev, no por la skill) |

## El test: re-correr v2 sobre Hermes y puntuar

Mismo repo, mismo operador (el que hizo el reporte v1), protocolo idéntico. Cada punto es **sí/no**.

### A. Las fallas de v1, una por una — ¿v2 las arregla?

| # | Falla de v1 | Qué debe hacer v2 | Cómo se mide (sí/no) |
|---|---|---|---|
| 1 | Afirmó "no hay backups" (no los encontró) | Preguntarlo como duda, no afirmarlo | grep de negativos-por-ausencia = 0; "backups" aparece en la lista de dudas |
| 2 | "RLS 6 de 15" (real: 22/22) | Marcar duda o "según el código, no verificado en vivo" | el artefacto no afirma el número como hecho sin verificación |
| 3 | "base exclusiva de esta app" (es compartida) | Duda: "¿la base es compartida con otra app?" | aparece en la lista de dudas |
| 4 | "el updater hace backup del .exe" (falso; salió de `docs/`) | No creerle a `docs/`; marcar duda | `docs/` no citada como fuente de verdad de ese artefacto |
| 5 | 6 errores de hecho se escapaban sin verificación manual | La auto-verificación los caza sola | los casos B1–B7 del reporte → marcados por el auto-control de la skill |
| 6 | Correcciones perdidas al regenerar | Sobreviven en `_ACLARACIONES.md` | correr v2, responder dudas / editar, **regenerar**, verificar que siguen intactas |
| 7 | `auditar` no avisaba si se pisó una corrección | Ahora avisa | forzar el pisado, correr `auditar`, ver el aviso |
| 8 | Diagramas sin validar por la skill | Compilan antes de escribirse | los Mermaid compilan; si uno falla, ese artefacto no se escribe |
| 9 | La cabecera nombra la herramienta | Ya no la nombra | leer la primera línea de cualquier artefacto |

### B. Métricas comparables (número v1 → objetivo v2)

- Negativos-falsos entregables: **varios → 0**.
- Errores de hecho escapados a la entrega: **6 → 0** (los caza la auto-verificación).
- Correcciones perdidas al regenerar: **todas → 0**.
- Artefactos que necesitan corrección a mano DESPUÉS de resueltas las dudas: **9/10 → baja fuerte**
  (lo que quede es lo que ni el humano ni el código sabían en el momento — no un error de la skill).

### C. La métrica NUEVA: señal vs ruido de las preguntas (la fatiga)

Es el riesgo #1 del SPEC, así que se mide explícito:
- Cuántas preguntas hizo v2.
- De esas, cuántas el operador marca **"valía preguntarla"** (señal) vs **"esto sobraba"** (ruido).
- **Objetivo: mayoría señal.** Mucho ruido = la disciplina de "solo alto impacto" está floja y hay
  que calibrarla (no es un fracaso del enfoque — es afinar el filtro).

## La regla de veredicto

v2 es **bueno** si, todo junto:
1. Cero negativos-falsos entregables.
2. Cero correcciones perdidas en regeneración.
3. La auto-verificación caza los errores que antes se escapaban.
4. Las preguntas son mayormente señal (fatiga baja).

- Si **1–3 dan bien pero 4 falla** (mucha pregunta de gusto) → v2 funciona, solo hay que **calibrar
  la disciplina**; no se revierte.
- Si **1–3 fallan** → el enfoque no rindió; se vuelve al diseño.

## Quién y cuándo

- **Quién:** el mismo dev que hizo el reporte v1, sobre Hermes (conoce el repo y ya tiene la línea de base en la cabeza).
- **Cuándo:** después de construir v2, **ANTES** de soltar v2 al resto de las apps de FyD.
- **Entregable:** un "reporte v2" con la misma estructura del v1, para comparar lado a lado.

## Y para el futuro

Este protocolo es **reusable**: es el patrón para validar cualquier cambio grande a una skill.
Repo real + antes/después + las fallas concretas como casos de prueba + señal/ruido en lo nuevo.
**Medir, no opinar.** Es la contraparte de la regla del método "evidencia real o NO VERIFICADO",
aplicada a los cambios del propio método.
