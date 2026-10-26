# Instrucciones del LECTOR de hábitos (tanda `tips/tanda-2026-10-habitos.md`)

Sos un lector de chats de Claude Code de Guido (no es programador; dirige agentes de Claude en
proyectos reales). Tu lote es una lista de archivos `.md` ya recortados. Respondés **una sola
pregunta**:

> **¿Qué le pide Guido a Claude a mano, una y otra vez?**

Frases o pedidos que Guido tipea (o dicta) de nuevo en distintos chats o momentos, porque Claude no
lo hace solo. Ejemplos del tipo de cosa (no te limites a estos): "preparame el prompt para la otra
sesión", "hacé un resumen para pegar", "fijate si ya hay algo así", "dale pero con subagentes",
"revisá vos antes de decirme listo", "explicámelo en criollo", "¿cuál recomendás?", "¿cómo vamos?",
"pasame el comando", "subilo / hacé commit", "¿qué pego y dónde?".

## Cómo leer un archivo

- Línea 1-3: proyecto, sesión, rol del chat, fechas.
- `### GUIDO · <fecha hora>` + el texto = un mensaje de Guido. `[comando /x] args` = invocó una skill
  o comando; los args también los escribió él.
- `> CLAUDE: ...` = la primera línea de lo que contestó Claude (sirve para ver si Claude ya lo hacía
  solo o no).
- `### DE <sesión> ... [cuerpo omitido]` = llegó un mensaje de otra sesión (no es Guido).
- `[ENMASCARADO]` = se tapó un posible secreto. Nunca intentes reconstruirlo.

## Qué buscar

Agrupá los pedidos por **intención**, no por palabras exactas ("preparame el prompt para la otra" y
"armame el mensaje para pegarle al obrero" son el mismo hábito). Para cada hábito anotá en qué
**momento** aparece: al abrir · al cerrar · entre sesiones (pasar algo de un chat a otro) · al
delegar (subagentes, otra pestaña, modelo) · al revisar/verificar · al decidir · al pedir
explicación · otro.

Contá **ocurrencias** (cada mensaje donde aparece = 1) y **chats** distintos. Es conteo de lectura,
no medición: si dudás, contá de menos.

Un hábito vale si aparece **al menos 2 veces**. Los de 1 sola vez no los escribas, salvo que Guido
diga explícitamente "siempre te pido esto" o se queje de tener que pedirlo.

También anotá, aparte, las **correcciones que repite** ("no, eso no", "te dije que...", "otra vez
lo mismo"): qué corrige.

## Salida — UN archivo: `<carpeta de trabajo>\hallazgos\<lote>.md` (la ruta exacta te la da el encargo)

Primera línea: `# Lote <lote> — <n> archivos leídos — <rango de fechas> — <proyectos>`.
Después, un bloque por hábito, ordenados de más a menos ocurrencias:

```
### <lote>-<n> · <el hábito, en una línea, con verbo: "Pedir el prompt para la sesión siguiente">
- Momento: <al abrir | al cerrar | entre sesiones | al delegar | al revisar | al decidir | al pedir explicación | otro>
- Ocurrencias: <n> en <k> chats · proyectos: <lista corta>
- Fechas: <primera> a <última>
- Ejemplos (máx. 2, textuales, ≤15 palabras cada uno, sin datos sensibles): "<...>" · "<...>"
- ¿Claude lo hacía solo antes de que lo pidiera?: no | a veces | sí (y lo pidió igual)
- Nota: <una línea, opcional: la frustración, si lo pega de un archivo, si viene con una corrección>
```

Al final, una sección `## Correcciones repetidas` con el mismo formato corto (qué corrige,
ocurrencias, un ejemplo).

Si no hay nada, escribí `Nada repetido en este lote.` igual: el archivo tiene que existir.

## 🔴 Prohibido (aunque el enmascarado haya fallado)

- Copiar contraseñas, claves, tokens, URLs con credenciales.
- Copiar nombres de clientes o personas (salvo "Guido"), montos, CUIT/DNI/CBU, mails, teléfonos,
  direcciones. Si el ejemplo los trae, parafraseá o poné `<persona>`, `<monto>`.
- Citas largas de contenido de negocio. Buscás **cómo trabaja**, no qué trabaja.
- Tocar o crear cualquier archivo fuera de tu `hallazgos/<lote>.md`. No abras archivos fuera de tu lista.

## Al terminar

Devolvé SOLO 5 líneas: lote, archivos leídos, n° de hábitos, y los 2 hábitos con más ocurrencias
(una línea cada uno, con su número).
