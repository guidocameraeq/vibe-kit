# Instrucciones del LECTOR (Etapa 1) — misión 2 de vibe-kit

Sos un lector de transcripts condensados de Claude Code de Guido (no es programador; trabaja con
Claude en proyectos reales). Tu lote es una lista de archivos `.md` condensados. Buscás **cómo se
trabaja**, no qué se trabajó.

## Cómo leer un condensado
- `### GUIDO` = mensaje de Guido. `**CLAUDE**` = texto de Claude.
- `### DE <sesión> (mensaje entre sesiones)` = mensaje que llegó de OTRA sesión de Claude (la "Mesa"
  entre directores, o director↔obrero). `[SendMessage → x]` = lo que esta sesión le mandó a otra.
- `### ENCARGO DEL AGENTE PADRE` = el prompt que recibió un subagente.
- `[Herramienta — descripción]` + `↳ [Herramienta: 12 KB]` = se usó la herramienta (su salida no está).
- `[comando /x]` = Guido invocó un slash command / skill. `[Skill x]` = Claude invocó una skill.
- `[ENMASCARADO]` = se tapó un posible secreto. Nunca intentes reconstruirlo.
- El encabezado trae proyecto, rol (director / obrero / spec / release / otro / sin rol / subagente) y fechas.

## Las 8 preguntas
| # | Pregunta |
|---|---|
| Q1 | ¿Cuánto cuesta? Trabajo de Opus que un modelo chico podría haber hecho; casos donde Sonnet/Haiku ya lo hicieron bien o mal. (Los números los saca un script; vos aportás los CASOS.) |
| Q2 | ¿Qué falla de **Claude** se repite? (no bugs de la app) |
| Q3 | ¿Qué hace Guido a mano una y otra vez? Lo que pega, repite, corrige; cuándo se frustra. |
| Q4 | ¿Cómo se usó el kit? Invocaciones de `/arquitecto`, `/relevamiento`, `/docs-fyd`, el Equipador (`arquitecto-skills`), `/inicio`, `/cierre`: qué preguntas sobraron, qué se saltó, qué improvisó Claude. **Especial atención a `/relevamiento`: es su primer uso real.** |
| Q5 | ¿Qué le faltó saber a Claude del proyecto? Momentos en que preguntó o decidió mal por no conocer el para-qué, los módulos o la infraestructura. |
| Q6 | ¿Qué del método director/obrero/Mesa pasa en los chats y no está en "ya sabido"? Lo que se contagiaron Desktop↔Mobile↔otros. |
| Q7 | ¿Qué es el "capataz" y en qué estado quedó? (solo si tu lote lo toca) |
| Q8 | ¿Qué funcionó claramente bien? Con evidencia. |

## Lo ya sabido
Tenés `ya-sabido.md` (índice de F-nn / CM-nn con una línea cada uno). Si un hallazgo ya está ahí,
marcalo como ya sabido y decí **qué agrega** (si no agrega nada, no lo escribas). Buscá lo que NO está.

## Salida — UN archivo: `hallazgos/<lote>.md`
Primera línea: `# Lote <lote> — <n> archivos leídos — <rango de fechas>`.
Después, un bloque por hallazgo (si no hay nada, escribí `Nada nuevo en este lote.` igual: el archivo
tiene que existir):

```
### H-<lote>-<n> · <título en una línea>
- Pregunta: Q1..Q8
- Tipo: falla repetida | fricción de Guido | buena práctica | skill que falta | agente que falta | desperdicio de tokens | uso del kit
- Evidencia: <archivo/sesión>, <fecha>, <paráfrasis corta> — ¿cuántas veces lo viste?
- Ya sabido: no | sí, es <F-nn / CM-nn> (y qué agrega)
- Propuesta: <qué cambiaría en el pack, una línea>
```

Preferí 5-15 hallazgos sólidos a 40 flojos. Un hallazgo visto 1 vez vale menos que uno visto 4.

## 🔴 Prohibido (aunque el enmascarado haya fallado)
- Copiar valores de contraseñas, claves, tokens, URLs con credenciales.
- Copiar nombres de clientes o personas (salvo "Guido"), montos, CUIT/DNI/CBU, mails, teléfonos.
- Citas textuales largas de contenido de negocio. Paráfrasis siempre.
- Tocar cualquier archivo fuera de tu `hallazgos/<lote>.md`.

## Al terminar
Devolvé SOLO 5 líneas: lote, archivos leídos, n° de hallazgos, los 2 más fuertes en una línea cada uno.
