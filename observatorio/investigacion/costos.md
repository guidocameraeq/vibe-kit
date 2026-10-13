# Costos de los chats — tabla de Q1

> Parte del acta `tips/tanda-2026-10-chats.md` (pregunta Q1). Solo números del campo `usage` de los
> transcripts; nada estimado. Lo que no se pudo medir va como **NO MEDIDO**.

Fuente: campo `usage` de los transcripts, agrupado por `message.id` (última línea). PCs: Usuario, clientes. Tokens en millones (M).

### Por rol y modelo

| | Transcripts | Respuestas | Input M | Escritura caché M | Lectura caché M | Output M | % lectura caché |
|---|---:|---:|---:|---:|---:|---:|---:|
| subagente · sonnet | 389 | 27,961 | 0.1 | 115.1 | 6,040.8 | 16.8 | 98% |
| obrero · opus | 77 | 14,781 | 0.0 | 48.8 | 4,770.2 | 13.2 | 99% |
| director · opus | 33 | 9,964 | 0.0 | 47.3 | 3,692.1 | 9.1 | 98% |
| otro · opus | 53 | 8,833 | 0.1 | 84.2 | 3,178.0 | 12.6 | 97% |
| otro · sonnet | 25 | 5,091 | 0.0 | 43.4 | 1,931.6 | 5.8 | 98% |
| subagente · opus | 599 | 14,968 | 0.0 | 107.6 | 1,538.9 | 13.6 | 93% |
| sin rol · opus | 26 | 4,381 | 0.0 | 20.5 | 1,511.6 | 5.2 | 98% |
| obrero · sonnet | 17 | 2,727 | 0.0 | 7.2 | 1,000.0 | 2.2 | 99% |
| spec · opus | 24 | 2,779 | 0.0 | 13.2 | 789.0 | 3.6 | 98% |
| spec · sonnet | 5 | 724 | 0.0 | 1.9 | 179.3 | 0.6 | 99% |
| sin rol · sonnet | 12 | 564 | 0.0 | 4.0 | 171.2 | 0.7 | 97% |
| subagente · haiku | 61 | 863 | 0.0 | 4.6 | 44.0 | 0.4 | 90% |
| director · sonnet | 2 | 68 | 0.0 | 0.4 | 11.7 | 0.1 | 96% |
| release · sonnet | 1 | 72 | 0.0 | 0.2 | 9.9 | 0.0 | 98% |

### Por familia de proyecto y modelo

| | Transcripts | Respuestas | Input M | Escritura caché M | Lectura caché M | Output M | % lectura caché |
|---|---:|---:|---:|---:|---:|---:|---:|
| Hermes Desktop · opus | 346 | 24,835 | 0.1 | 129.7 | 6,975.3 | 22.5 | 98% |
| Hermes Mobile · opus | 341 | 20,101 | 0.0 | 98.8 | 5,074.0 | 21.1 | 98% |
| Hermes Desktop · sonnet | 211 | 20,013 | 0.0 | 79.9 | 4,737.0 | 12.6 | 98% |
| otros proyectos · opus | 125 | 10,770 | 0.1 | 93.0 | 3,430.6 | 13.7 | 97% |
| otros proyectos · sonnet | 108 | 7,172 | 0.0 | 58.2 | 2,355.1 | 7.4 | 97% |
| Hermes Mobile · sonnet | 132 | 10,022 | 0.0 | 34.3 | 2,252.3 | 6.1 | 98% |
| Hermes Desktop · haiku | 25 | 401 | 0.0 | 2.0 | 21.4 | 0.2 | 91% |
| Hermes Mobile · haiku | 21 | 309 | 0.0 | 1.4 | 13.5 | 0.1 | 90% |
| otros proyectos · haiku | 15 | 153 | 0.0 | 1.3 | 9.0 | 0.0 | 87% |

### Subagentes por tipo y modelo (top por lectura de caché)

| | Transcripts | Respuestas | Input M | Escritura caché M | Lectura caché M | Output M | % lectura caché |
|---|---:|---:|---:|---:|---:|---:|---:|
| db-migr-implementador · sonnet | 193 | 18,259 | 0.0 | 75.0 | 4,161.0 | 11.3 | 98% |
| v4-implementador · sonnet | 84 | 7,249 | 0.0 | 24.0 | 1,515.6 | 4.1 | 98% |
| db-migr-revisor · opus | 212 | 5,655 | 0.0 | 50.1 | 542.1 | 5.5 | 91% |
| general-purpose · opus | 114 | 3,514 | 0.0 | 18.5 | 452.4 | 2.7 | 96% |
| general-purpose · sonnet | 76 | 1,703 | 0.0 | 10.2 | 273.6 | 1.0 | 96% |
| redteam-spec · opus | 109 | 2,291 | 0.0 | 13.7 | 229.9 | 2.3 | 93% |
| v4-revisor · opus | 107 | 1,939 | 0.0 | 15.8 | 144.9 | 1.6 | 89% |
| v4-implementador · opus | 20 | 816 | 0.0 | 4.5 | 111.3 | 0.9 | 95% |
| implementador · sonnet | 14 | 409 | 0.0 | 3.9 | 70.3 | 0.2 | 94% |
| Explore · opus | 21 | 485 | 0.0 | 3.7 | 43.5 | 0.5 | 91% |
| db-migr-explorador · haiku | 23 | 376 | 0.0 | 1.9 | 20.4 | 0.2 | 91% |
| Explore · sonnet | 22 | 341 | 0.0 | 2.0 | 20.2 | 0.2 | 90% |
| revisor · opus | 16 | 268 | 0.0 | 1.1 | 14.8 | 0.2 | 92% |
| general-purpose · haiku | 13 | 128 | 0.0 | 1.2 | 8.0 | 0.0 | 86% |
| Explore · haiku | 11 | 183 | 0.0 | 0.6 | 7.0 | 0.1 | 91% |
| v4-explorador · haiku | 7 | 96 | 0.0 | 0.5 | 4.4 | 0.1 | 89% |
| claude-code-guide · haiku | 7 | 80 | 0.0 | 0.4 | 4.1 | 0.0 | 90% |

---

## Lectura corta

1. **Lo que domina es releer el contexto.** De ~25.450 M tokens, 24.868 M (98%) son lectura de caché;
   el output es 84 M y el input sin caché, 0,2 M. Cada respuesta relee en promedio ~265 mil tokens.
2. **Por rol, el más caro por respuesta es el director Opus (~370 mil por respuesta)**, después el
   obrero Opus (~320 mil). El renglón más grande en total es el implementador Sonnet de migraciones
   de Hermes Desktop (4.161 M, 17% de todo): barato por token, pero muchísimas respuestas con
   contexto de ~230 mil.
3. **Opus se lleva el 62% de la lectura y el 68% del output**; Sonnet el 38% y el 31%; Haiku casi
   nada (0,2%).
4. **Dónde un modelo más chico ya rindió** (casos del informe, H-02): un release entero en Sonnet;
   dos tramos de base completos (12 sub-pasos, 324 pruebas) conducidos en Sonnet; documentos,
   orden, smoke de lectura y front acotado en Sonnet sin correcciones; proyectos enteros fuera de
   Hermes (UCEMA, asistente-fichas) en Sonnet con calidad igual.
5. **Dónde podría rendir y hoy no**: registros de un renglón y tareas de solo texto en pestañas Opus
   de 300-700 mil (H-03); la verificación mecánica de cada aviso que hace el director Opus a mano
   (H-04, candidata a script o Haiku); los turnos de "aviso sin novedad", hasta 1 de cada 3 del
   director (H-05); las vueltas 2 y 3 del revisor Opus sobre arreglos de solo texto (H-06).
6. **Dónde NO bajar**: guardas de seguridad, permisos, producción y el revisor de primera vuelta.
   Ahí el primer borrador Sonnet volvió con bloqueantes 3 de 3, y Haiku contó mal y dio un falso
   "alto".
7. **La palanca más grande no es el modelo, es el tamaño del contexto por turno**: menos turnos de
   ruido y mudarse antes de pestaña bajan la lectura de caché en todos los modelos a la vez.

**NO MEDIDO**
- El costo en dólares (la tabla da tokens; pasarlo a plata sería estimar).
- La Etapa 1 de la PC Usuario (corrió allá; su número no viajó). Sí medido: la Etapa 1 en la PC
  clientes, 81 lectores Sonnet, ~25 M tokens con caché incluida (≈0,1% del total de arriba), y la
  Etapa 2, 4 agentes Opus, ~1,2 M tokens.

**Cómo se cuentan los transcripts.** Son **1.309 únicos** (1.175 de la PC clientes + 134 de la PC
Usuario con al menos una respuesta). Las tablas "por modelo" suman 1.324 porque 15 chats cambiaron
de modelo a mitad de camino y cuentan una vez por cada modelo. La sesión de esta investigación quedó
excluida (`--excluir`) en las dos PCs; los 3 transcripts de más contra los 1.172 condensados en la
primera corrida son sesiones que se abrieron mientras corría la investigación.
- La calidad comparada Opus vs Sonnet sobre la misma tarea: los casos de arriba son observaciones de
  los lectores, no un experimento.
- Cuánto se ahorraría con cada propuesta: no se simuló.
