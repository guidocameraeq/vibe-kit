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
| `flota.py` | (Misión 4, tramo 2; v3 en la misión 5, paquete 8.) El inventario de la flota por `gh` (sin clonar): qué trae cada repo del método y, de la ficha `.claude/kit.md` (la parsea `ficha.cjs` por node), `kit`, `nivel`, `piezas` y `frenos_quitados`; ramas `kit/*`, copias del kit, "aparece en N proyectos" (3+ marcado), handoff y TODO, specs con sello, portada, `frases_viejas` (de `frases-viejas.txt`) y `rutas_absolutas` (archivo y renglón, nunca el texto). `--carpeta <dir>` mide solo esas dos sobre una carpeta local (el molde); `--hook <alias>=<clon>` corre el `SessionStart` de un clon temporal y cuenta `hook_chars`. Pruebas: `test_flota.py`. Gratis |
| `huella.py` · `repos.py` | (Misión 4, tramo 2.) La huella del `/inicio` y `/cierre` de cada proyecto contra las dos historias del molde (v2 y v3; dice con cuál se parece más; `test_huella.py`); y la evidencia del historial de git (arreglos, arreglo del arreglo, arreglos con prueba, solo documentos). Gratis; para la medición mensual |
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

## La corrida mensual

Repite las líneas base de `TABLERO.md` §1 con los scripts (sin lectores, que cuestan tokens: esos van al piloto). Primera vez: 2026-11-03,
resultado en `mediciones/2026-11-03.md`. Costo: casi cero tokens; ~25 minutos en total. Siempre `py -3` (no `python3`, que es el atajo
de la Store); los scripts que leen datos ajenos, con `-I`. Estas carpetas están **fuera de todo repo**: `<M>` = `scratchpad/medicion/`
(o `C:\vibe-medicion\` si no hay scratchpad), con `clones/`, `privado/` y `condensados/`.

**Qué es público y qué privado.** Público (va a vibe-kit): `mediciones/<fecha>.md`, con cifras agregadas ("N de 10", rangos, medianas),
alias solo si ya están en `FLOTA.md`/`REPOS.md`, y **sin** nombres de repo nuevos, dueños, rutas de PC ni texto de chats. Privado (va a
`vibe-research`, `mediciones/<fecha>/`): `mapeo.md`, los JSON por repo, los costos por chat y los condensados no se suben a ningún lado.

0. **Antes de correr**: `gh auth status` y `node -v` (sin `gh` logueado o sin node, `flota.py` corta o mide a medias).
1. **Mapeo alias → repo** (privado). `gh repo list <dueño> --limit 100 --json name,description,createdAt` por cada dueño (`gh api
   user/orgs` los lista), cruzado con las descripciones y fechas de `FLOTA.md`. Se escribe en `<M>/privado/mapeo.md`. Lo ambiguo se marca
   "ambiguo, para Guido": se mide con el más probable y se dice.
2. **Clones** (D8-7, nunca el checkout de nadie): `git clone --filter=blob:none https://github.com/<dueño>/<repo>.git <M>/clones/<alias>`,
   uno por proyecto. Después, en cada clon: `git -C <M>/clones/<alias> config diff.renames false`. Sin esto, `git log --name-only` baja
   blobs de a uno para detectar renombres y `repos.py` no termina.
3. **Flota** (privado): `py -3 -I flota.py <dueño1> <dueño2> --kit <raíz de vibe-kit> --hook <alias>=<M>/clones/<alias> … > <M>/privado/flota.json`.
   Lee GitHub por `gh`; con `--hook` corre el `SessionStart` del clon (plazo 20 s; expande `$CLAUDE_PROJECT_DIR` por la ruta del clon). Lee
   todos los repos de los dueños: al agregar, filtrar a los de la flota. Los resultados del hook quedan en `hooks_sin_fila`, por alias.
4. **Huella** (privado): `py -3 -I huella.py <M>/privado/flota.json <raíz de vibe-kit> > <M>/privado/huella.json`. ~2 minutos.
5. **Historial** (privado): `py -3 -I repos.py <alias>=<M>/clones/<alias> … > <M>/privado/repos-total.json`, y otra con `@desde=<fecha de la
   última corrida>` pegado a cada ruta, a `repos-desde.json`. ~1 minuto. Un repo con una base ajena (un fork) mezcla sus commits: sacarlo de
   la mediana del total.
6. **Costos** (privado, solo de esta PC): `py -3 -I condensar.py --pc <nombre de la PC> --desde <corte de CORTE.md> --salida <M>/condensados`
   (lee `~/.claude/projects`; ~900 MB crudos tardaron 3 minutos; si pasan de 30 min, cortar y anotar "no re-medido: corrida en curso"), y
   `py -3 -I costos.py <M>/condensados/costos.csv > <M>/privado/costos-tabla.md`. Cache leída por respuesta = lectura de caché ÷ respuestas
   de cada rol. Los condensados **no se suben**. Las otras PCs corren lo mismo allá (Remote Control).
7. **Lo que no es script.** Alertas de seguridad: contar las entradas de `ALERTAS-SEGURIDAD.md` de la biblioteca (solo el número). Tamaño
   de skills: `director` y `obrero` por repo, de `huella.json` (`propias.<skill>.kb`, que sale de `huella.py`: solo el `SKILL.md`, sin anexos).
8. **gitleaks, sin tubería**, sobre lo público y sobre lo privado, mirando el código de salida: `gitleaks dir <carpeta> --no-banner`. Si
   da distinto de 0, no se escribe al repo hasta revisarlo sin imprimir el valor (paso 2 de "Los pasos").
9. **El documento** (público): `mediciones/<fecha>.md` con la tabla de TABLERO §1 en tres columnas, **octubre · hoy · cómo se midió**, y
   las filas con script del SPEC-0 "Medición". Cada fila que no se re-midió dice por qué: "no re-medido: lector, al piloto", "otra PC" o
   "corrida en curso". Arriba, 3-5 renglones de lectura. Abajo, un renglón que apunta al detalle privado.
10. **Subir lo privado** (lo hace el director): `mapeo.md`, `flota.json`, `huella.json`, `repos-*.json` y `costos-tabla.md` a
    `vibe-research`, `mediciones/<fecha>/`, con gitleaks antes de cada push. Los condensados, no.

No corren acá: `lotes.py` y los lectores (filas "Lector (muestra)"), que se repiten en el piloto con el número de octubre como antes.

## La fecha de corte

Es el último `timestamp` leído de cada PC (la columna `hasta` del costos.csv, el máximo). Se anota en
el §0 del acta y en `D:\vibe-hallazgos\CORTE.md`. La próxima corrida usa `--desde <corte>` en cada PC.
Un chat que siguió después del corte se lee solo en su parte nueva.

## Lo que NO hace

- **No aplica nada.** Extrae y propone; la sesión madre (y Guido) deciden después.
- No lee contenido de negocio: busca cómo se trabaja, no qué se trabajó.
- No sube nada crudo a vibe-kit (es público).
