# Método: investigar los chats para mejorar el pack

> Leer el uso real (los transcripts de Claude Code) con agentes, sin quemar el contexto de nadie, y
> convertirlo en un acta con propuestas (`tips/tanda-*.md`). Primo hermano del Extractor de tips:
> el Extractor mira tips de afuera; esto mira cómo se trabajó de verdad.
> **Nació de la misión 2** (oct 2026). Plano original: `docs/SPEC-investigacion-chats.md`; lo que se
> apartó del plano y por qué: ADR-022. Se hizo **una vez**: es receta, no skill (regla de 3+).

## Cuándo se corre

- Antes de rediseñar algo grande del pack (se hizo antes de la misión 4).
- Cuando pasó mucho uso sin volver al kit (la primera vez: 70 días).
- Siempre **desde el corte anterior** (ver "La fecha de corte"), nunca todo de nuevo.

## Las piezas

| Pieza | Qué es |
|---|---|
| `condensar.py` | Etapa 0: deja mensajes del usuario, texto de Claude, mensajes entre sesiones y el nombre de cada herramienta (no su salida); enmascara secretos ANTES de escribir; saca el costo real (`usage` por `message.id`). `--desde` = solo lo posterior al corte. `--excluir` = la sesión de la investigación misma |
| `lotes.py` | Arma los lotes (500 KB) con el muestreo declarado y semilla fija |
| `LECTOR.md` | Las instrucciones de cada lector: 8 preguntas, plantilla de hallazgo, prohibiciones |
| `recortar.py` · `LECTOR-HABITOS.md` | (2026-10-25, tanda de hábitos.) El recorte para preguntas que solo miran a Guido: sus mensajes enteros + la primera línea de Claude, sin subagentes; baja la entrada ~24 veces y arma lotes. **Con lotes recortados, presupuestar ~120 mil tokens por lector** (el × 3 no vale). El lector de esa tanda |
| `LECTOR-contraste.md` · `PLAN-lectura-contraste.md` | (Misión 4; corrida el 2026-10-26 en la PC `clientes`.) La **segunda lectura**: no barre por temas, contrasta los chats con las decisiones de los racimos A-H (lente A), junta los hábitos que Guido pide a mano (lente B, que absorbió la pasada pendiente de la tanda de hábitos) y los huecos que ningún racimo cubre (lente C), más una sección abierta de "otras cosas". Acta: `tips/tanda-2026-11-contraste.md`. El plan dice qué se reusó de octubre, el recorte (`recortar.py --modo contraste`) y lo que costó de verdad: **~250 mil tokens nuevos por lector** con lotes de 200 KB y un `ya-sabido` de 112 KB (el "3× el contenido" se quedó corto por el `ya-sabido`) |
| `costos.py` | La tabla de Q1, solo números, proyectos agrupados en familias |
| `flota.py` · `huella.py` · `repos.py` | (Misión 4, tramo 2.) El inventario de la flota por `gh` (qué trae cada repo del método, hooks, permisos); la huella de su `/inicio` y `/cierre` contra el molde del kit; y la evidencia del historial de git (arreglos, arreglo del arreglo, arreglos con prueba, solo documentos). Gratis; para la medición mensual |
| `D:\vibe-hallazgos\` (PC clientes) | Lo hallado (privado, fuera de todo repo): hallazgos, síntesis, condensados, `ya-sabido.md`, `CORTE.md`, alertas |

## Los pasos

**0. Arranque (sesión madre, acá).** `/inicio` + misión. Leer `CORTE.md`. Pedir a Guido el OK
explícito para usar una **Workflow** (el permiso es por sesión). Crear la carpeta de trabajo fuera de
todo repo (`D:\vibe-research\<pc>\`; en una PC sin D, `C:\`).

**1. Etapa 0 — condensar, PRIMERO con 3 chats.** Uno grande con subagentes, uno mediano, uno chico.
Contar a mano que los mensajes del usuario del condensado = los del crudo. *Lección: un filtro que
falla no avisa* — en la primera prueba los mensajes entre sesiones (la Mesa) se perdían enteros
porque vienen marcados `isMeta`; solo se vio contando. Después, la corrida completa con `--desde` y
`--excluir`.

**2. Segundo detector.** `gitleaks dir` sobre los condensados (independiente del enmascarado: un
detector no se encuentra en falta a sí mismo). Revisar cada hallazgo **sin imprimir el valor** (perfil:
largo, caracteres, ¿parece archivo?). Lo real se tapa agregando la forma al enmascarado y se re-corre.
Control positivo con secretos reales (`--donde-estan --pedir-secretos`): opcional, lo decide Guido.

**3. Presupuesto (decide Guido, con el número en la mano).** El script imprime los tokens
condensados. **El gasto real de los lectores ≈ 3× el contenido** (cada agente relee lo ya leído en
cada paso; la mayoría es caché, a 1/10 del precio). Si hay que ahorrar: lotes más chicos (la
relectura crece con el tamaño del lote) o recortar la entrada (saltear subagentes, acortar textos de
Claude: −40%). Referencia oct 2026: 8,2 M de contenido → 25 M reales (81 lectores).

**4. `ya-sabido.md` al día.** Un agente Sonnet actualiza el índice de lo ya escrito (F/CM de las
bitácoras de Hermes y lo que haya nuevo) con una línea por ítem, sin datos sensibles. Sin él, los
lectores redescubren lo sabido.

**5. Etapa 1 — lectores Sonnet (Workflow).** Uno por lote, con `LECTOR.md` + `ya-sabido.md` + su
lista. Cada uno escribe `hallazgos/<lote>.md` (aunque diga "nada nuevo") y devuelve un objeto chico:
la sesión madre no lee los hallazgos. Verificar: un archivo por lote; gitleaks sobre `hallazgos/`.

**6. Etapa 2 — síntesis Opus.** Si los hallazgos no entran en un agente: 3 Opus juntan por familia
de proyecto y 1 Opus final cruza contra las fuentes completas antes de marcar algo como nuevo, y
escribe el acta (formato tanda: veredictos + propuestas `- [ ]`) y la tabla de costos.

**7. Revisión de la sesión madre, antes del repo.** Leer el acta entera buscando nombres, clientes,
montos, datos personales. **Las alertas de seguridad salen del acta** a un archivo privado (aunque no
tengan valores, son un mapa de puntos débiles). Gitleaks sobre el diff + búsqueda propia de nombres +
**Guido mira el diff**. Recién ahí commit y push.

**8. Guardar y cortar.** Copiar a `D:\vibe-hallazgos\` hallazgos, síntesis, condensados, listas de
lotes y costos; verificar la copia con `diff`. Anotar el **corte nuevo** en el acta (§0) y en
`CORTE.md`. Borrar la carpeta de trabajo. **Lo hallado no se borra** hasta que Guido lo decida (los
chats originales pueden desaparecer: `cleanupPeriodDays`).

## Otras PCs

- Por **Remote Control**: Guido abre allá Claude Code (en `vibe-kit`, después de `git pull`) y prende
  Remote Control; la sesión madre la encuentra con `ListAgents` y le manda el encargo por mensaje.
- **El permiso no viaja con el mensaje.** Cada sesión necesita el OK de su dueño en su pantalla, y
  conviene una regla de permiso para `python` sobre los scripts. Pasos que **siempre** termina
  corriendo el humano: borrar en la raíz de `C:`, copiar material marcado como sensible, a veces el
  push. Darle los comandos de a uno (un comando largo encadenado falló).
- Cada PC corre su Etapa 0 + 1 + una mini-síntesis Opus allá. **Los chats no se mueven**; viaja solo
  la mini-síntesis, por un **repo privado** (o por mensaje en partes numeradas si no hay acceso).
  Antes de borrar allá, confirmar que lo hallado ya está copiado en la PC madre.
- Frenos que se piden a la otra sesión: después de la prueba de 3 chats y después de la Etapa 0
  (con el tamaño, para el presupuesto).

## La PC de otra persona

Solo con su **consentimiento explícito, dado en su pantalla**, con un texto que diga: qué se lee
(sus chats, en su PC), qué se queda (solo lo escrito, sin salidas de comandos, claves tapadas), qué
se busca (un foco acotado, por ejemplo "cómo usás el kit") y qué sale (un resumen en paráfrasis, sin
nombres, montos ni datos de negocio). Preguntarle qué carpetas excluir. **El foco no se agranda
aunque se lea todo.** El resumen lo aprueba esa persona antes de mandarlo; sus hallazgos crudos se
quedan en su PC salvo que diga lo contrario. Ojo al leerlo: el script rotula "GUIDO" a toda voz
humana.

## La fecha de corte

Es el último `timestamp` leído de cada PC (la columna `hasta` del costos.csv, el máximo). Se anota en
el §0 del acta y en `D:\vibe-hallazgos\CORTE.md`. La próxima corrida usa `--desde <corte>` en cada PC.
Un chat que siguió después del corte se lee solo en su parte nueva.

## Lo que NO hace

- **No aplica nada.** Extrae y propone; la sesión madre (y Guido) deciden después.
- No lee contenido de negocio: busca cómo se trabaja, no qué se trabajó.
- No sube nada crudo a vibe-kit (es público).
