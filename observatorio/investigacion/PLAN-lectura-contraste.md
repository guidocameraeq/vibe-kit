# Plan · la lectura de contraste (PC clientes) — BORRADOR

> Segunda lectura de los chats, distinta de la de octubre: no barre por temas, **contrasta** los chats con
> las decisiones de los racimos A-H (`LECTOR-contraste.md`, tres lentes: contraste, hábitos, huecos).
> Receta base: `observatorio/investigacion/METODO.md`. Corre en la PC `clientes`, sesión madre en vibe-kit.

## Qué se reusa y qué es nuevo
- **Se reusa**: los condensados de la primera pasada en `D:\vibe-hallazgos\` (hasta el corte
  **2026-10-12 21:59 UTC**), `ya-sabido.md`, `lotes.py`, gitleaks. Se trabaja sobre una **copia** en la
  carpeta de trabajo; lo de `D:\vibe-hallazgos\` no se toca.
- **Se condensa solo lo nuevo**: `condensar.py --pc clientes --desde <corte> --excluir <esta sesión>`,
  con la prueba de 3 chats contando a mano los mensajes de Guido (METODO paso 1).
- **Es nuevo, y falta construirlo**: el **recorte**. `condensar.py` hoy no lo tiene: un `recortar.py` chico
  sobre los condensados (o `--recorte`). Se prueba igual, con 3 chats: los mensajes de Guido y los
  entre sesiones del recorte = los del condensado.

## La entrada, recortada por default
- Queda: el encabezado · `### GUIDO` entero · `### DE <sesión>` entero · la primera línea de cada
  `**CLAUDE**` y de cada `[SendMessage → x]` · `[comando /x]`, `[Skill x]`, `[Agent …]`. Se van las
  demás líneas de herramienta y los chats de subagentes.
- Alcanza para las lentes A y B (casi todo se cuenta en lo que dice Guido y en lo que viaja entre
  sesiones). **La lente C puede necesitar más**: el lector marca `Necesita texto completo: sí (<archivo>)`
  y la síntesis relee **solo esos** chats desde el condensado completo, con techo (ej.: 15 chats).

## El costo (lo decide Guido con el número en la mano)
- Fórmula de METODO: **gasto real ≈ 3× el contenido** (relectura en cada paso, casi toda en caché).
  Referencia de octubre: 8,2 M de contenido → 25 M reales, 81 lectores.
- Estimación a ojo, **NO VERIFICADO**: el recorte deja 15-30% → 1,2-2,5 M + lo nuevo desde el corte →
  **~4-8 M reales** de lectores, más ~1-1,5 M de síntesis Opus. Con 500 KB por lote entran más chats por
  lote: menos lectores.
- **El número de verdad lo imprime el script después del recorte**, y se le muestra a Guido antes de
  lanzar nada. Si hay que ahorrar: lotes más chicos, solo las familias con director (Hermes, Deptos), o
  muestreo declarado con semilla fija.

## Los pasos
1. `/inicio` + misión · leer `CORTE.md` · OK explícito de Guido para la **Workflow** · carpeta de trabajo
   fuera de todo repo.
2. Condensar lo nuevo (`--desde`) · escribir y probar el recorte · gitleaks sobre lo recortado.
3. **Presupuesto**: el número a Guido; decide él.
4. `ya-sabido.md` **al día** (un Sonnet: suma lo de la tanda de octubre y lo de los racimos).
5. **Lectores Sonnet por lote** (Workflow), cada uno con `LECTOR-contraste.md` + `ya-sabido.md` + su
   lista. Un archivo por lote; devuelven solo el objeto de conteos. Verificar: un archivo por lote,
   las tres secciones, gitleaks sobre `hallazgos/`.
6. **Síntesis Opus, una por lente**: A suma por decisión y revisa los ejemplos · B junta con la pasada
   de hábitos que corre en la PC `Usuario` (viaja solo su mini-síntesis, por el canal privado) · C
   cruza contra `ya-sabido.md` y los `DISENO-*.md` completos antes de llamarlo hueco.
7. **Acta `tips/tanda-2026-11-contraste.md`**: §0 (corte, costo, límites) + **tres tablas**:
   contraste (decisión · veredicto · ✔ · ✘ · lotes · ejemplo · qué tocaría en el diseño) · hábitos
   (hábito · conteo · proyectos · lo cubre) · huecos (con propuestas `- [ ]`).
8. Revisión de la sesión madre antes del repo (nombres, montos, gitleaks, **Guido mira el diff**) ·
   guardar en `D:\vibe-hallazgos\contraste-2026-11\` · corte nuevo en el acta y en `CORTE.md`.

## Para qué se usa
Entra a la **revisión integral de todos los racimos**, al final del tramo 4, **decisión por decisión**:
confirmada → sigue · contradicha → se reabre con la evidencia en la mano · no vista → queda "sin
evidencia en chats" y se mide en el piloto. Los hábitos son candidatos a skill (regla de 3+); los
huecos, a racimo I, a G.1 o a nota en un diseño.

## Lo que no hace
No aplica nada (propone; decide la sesión madre con Guido) · no lee contenido de negocio · no lee la PC
del compañero (eso pide su consentimiento en su pantalla, METODO) · si I o G.1 cierran antes de correr,
sus decisiones se suman a la lista con el mismo formato y se vuelve a medir el LECTOR (tope ~12 KB).
