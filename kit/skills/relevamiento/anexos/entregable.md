# El entregable — PDF, procedencia, aritmética y el caso "no construir"

El PDF es **el cierre oficial de etapa**: es lo que se lleva a una reunión, y es la razón por la que
un `.md` a medio llenar no alcanzaba. Todo lo de acá se lee **cuando ya decidiste emitir**.

## Qué sale y cuándo

| Momento | Sale |
|---|---|
| Cierre de etapa 1, 2, 3 | `pdf/N-*.pdf`, chip **CERRADA** |
| A demanda, con la etapa a medio llenar | el mismo PDF, chip **BORRADOR** + cinta con el motivo |
| Cierre de etapa 4 | `pdf/4-propuesta.pdf` **+** `pdf/dossier-<slug>.pdf` (los 4 juntos) |
| Derivaciones nuevas a campo | `pdf/hoja-de-campo.pdf` |
| Tramo 5 | `pdf/5-sirvio.pdf` |

*(La regla de nombres estables y `PDF VIEJO` está en el motor. La razón de no guardar histórico: los
PDF se rehacen de un `.md` que sí está versionado — REJ-010.)*

## El pipeline

```bash
# 1. ANTES de Chrome — la ÚNICA defensa determinística que existe
[ -s "$HTML" ] || { echo "no hay HTML que imprimir"; exit 1; }

# 2. Chrome, SIN pipes
"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="$PDF" "$HTML" > "$LOG" 2>&1

# 3. DESPUÉS — POLL ACOTADO hasta 45 s. El exit code NO se mira.
#    Se verifica, en este orden: existe · empieza con %PDF- · pesa lo razonable
# 4. LIMPIEZA: borrar $HTML y $LOG del temp (salvo que el paso 3 haya fallado)
```

**Los tres hechos, medidos en esta máquina — no supuestos. Mandan sobre cualquier atajo:**

1. **El exit code de Chrome no vale nada, y el `ls` inmediato tampoco.** Puede devolver éxito y
   escribir el archivo 20-40 s después. Por eso el poll es de **45 s**, no de 10.
2. **Chrome imprime el error como si fuera el documento.** Un HTML inexistente produjo un PDF
   **válido de 23.943 bytes** con la página de error adentro. Por eso el chequeo del paso 1 es la
   única defensa real: verificar el HTML **antes**, no el PDF después.
3. **`--no-pdf-header-footer` es obligatorio.** Sin eso Chrome estampa **la ruta del disco** al pie de
   cada hoja, más la fecha/hora y el `<title>` arriba — y ese documento va a una reunión.

> **⚠️ Cómo se verifica que la ruta no está — y cómo NO.** `grep "file:///"` sobre el `.pdf` **da 0
> aunque la ruta esté impresa**: el texto viaja en streams comprimidos (verificado en el build: el PDF
> *con* la ruta estampada devolvió 0 hits igual que el limpio). **El chequeo válido es que el flag
> `--no-pdf-header-footer` esté en el comando** — eso es determinístico y barato. Para confirmarlo con
> los ojos, hay que abrir el PDF; ningún grep sirve.

## Encontrar Chrome, y qué hacer si no está

**Se detecta, no se hardcodea** (es el único camino que sirve en las dos PCs):

1. `where chrome` — primero, siempre.
2. Si no, las 3 rutas conocidas: `C:/Program Files/Google/Chrome/Application/chrome.exe` ·
   `C:/Program Files (x86)/Google/Chrome/Application/chrome.exe` ·
   `%LOCALAPPDATA%/Google/Chrome/Application/chrome.exe`
3. Si no aparece en ninguna, o si el poll de 45 s vence: **plan B**.

**Plan B — y la etapa CIERRA IGUAL.** No frenar es la regla (precedente: `docs-fyd/SKILL.md:62-64`).
Se copia el `.html` a `pdf/`, **no se borra**, el TABLERO anota `PDF pendiente`, y se dice **esto**:

> *"El PDF no salió. Te dejé el documento en `pdf/1-problema.html`: abrilo con doble clic y
> Ctrl+P → Guardar como PDF. Sale idéntico."*

**Limpieza:** el `.html` y el `.log` viven en el temp del sistema y se borran al terminar.
**Única excepción: si Chrome falló, el `.html` se copia a `pdf/` y no se borra** — es el plan B.

## El CSS — autocontenido, y legible en blanco y negro

Va embebido en el `<head>` del HTML. Sin fuentes de red, sin CDN, sin imágenes externas.

```css
@page { size: A4; margin: 18mm 16mm; }
body { font: 11pt/1.45 "Segoe UI", system-ui, sans-serif; color: #111; }
h1 { font-size: 18pt; margin: 0 0 2mm; } h2 { font-size: 13pt; margin: 6mm 0 2mm; }
blockquote { color: #444; font-style: italic; border-left: 2px solid #999; padding-left: 3mm; }

/* SIN esto los badges salen blanco sobre blanco: Chrome no imprime fondos por default */
* { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
h2, .badge, .caja, table, .cinta { page-break-inside: avoid; }
h2 { page-break-after: avoid; }

/* LA PRUEBA DE LA FOTOCOPIADORA: ningún estado se distingue SÓLO por color.
   Cada balde lleva su TEXTO + su GLIFO + su estilo de borde. Fotocopiado en
   blanco y negro los cinco siguen siendo distinguibles. */
.badge { font-size: 8pt; font-weight: 700; padding: 0 1.5mm; white-space: nowrap; }
.b-rel  { border: 1.5px solid #000; }               /* ● RELEVADA      borde sólido  */
.b-mem  { border: 1.5px dotted #000; }              /* ◐ DE MEMORIA    punteado      */
.b-cod  { border: 1.5px dashed #000; }              /* ▣ DEL CÓDIGO    rayado        */
.b-sup  { border: 2px double #000; background: #eee; }  /* ◆ SUPUESTO   doble+trama  */
.b-sin  { border: 1.5px solid #000; background: #000; color: #fff; } /* ○ SIN RESPONDER */

.cinta { border: 2px solid #000; background: #eee; padding: 2mm; font-weight: 700; }
.caja  { border: 2px solid #000; padding: 4mm; margin: 4mm 0; font-size: 13pt; }
.fp::before { content: "[fp] "; font-weight: 700; }  /* fuera de planilla */
```

## La cabecera de procedencia — va en los 4 PDF

```
Relevado por             <nombre> (<rol>)
Hablé con                <nombre> (<área>, <fechas>) · <nombre> (<área>, <fecha>)
Roles que intervienen    depósito ✓ · administración ✓ · compras — sin hablar
Fechas del relevamiento  <desde> al <hasta>
Etapa cerrada el         <fecha>
Plantillas               método "Cómo Arrancar un Proyecto" (_fuente del 2026-07-22)
                         + 7 celdas del kit (ver FORK.md)
──────────────────────────────────────────────────────────────
N relevadas · N de memoria · N del código · N supuestos · N sin responder
Lo marcado como SUPUESTO no fue dicho por nadie: es una hipótesis de quien
relevó y todavía no se verificó. No debe leerse como un hecho.
```

**La fila "Roles que intervienen" imprime la lista con su estado, nunca un número.** Es la que hace
visible el asimétrico: quien lee el documento ve de un vistazo con cuántos de los involucrados se
habló de verdad. Un `3 de 5` esconde justo lo que hay que mostrar.

**Si `caracter: personal`:** la fila "Hablé con" **no se imprime**, y en su lugar va
*"Relevamiento personal: todas las respuestas son del autor, sin verificación externa."*

## La aritmética fina

- **Números derivados: heredan la marca más débil de sus factores** y propagan los rangos.
  `"~30 h/mes ◆ (120 relevados × ~15 min estimados)"`. **Un derivado nunca es `RELEVADA`.**
- **Denominador del contador:** los campos de Parte 1 de la etapa **+** los bloques de las casillas
  **tildadas**. Los no tildados no entran — no son "sin responder": no aplican.
  *E1 sin casillas = 5 (`01:28,32,36,40,43`); con dos tildadas = 7.*
- **Se re-deriva de los sellos** de los `.md` en cada apertura y **antes de cada emisión**. Lo del
  TABLERO es una foto con fecha y **nunca gana**. El `INDICE.md` no lleva contadores.

## La regla de redacción — los juicios van por ROL

**Toda afirmación que prediga o evalúe la conducta de una persona se escribe POR ROL y COMO RIESGO,
nunca por nombre y nunca como atributo.** Aplica al anexo "Fuera de planilla" de 1/2/3, a los
párrafos `[fp]` del 4, y a la hoja de campo.

- ✅ *"El rol que hoy no tiene visibilidad de su tiempo puede resistir el cambio."*
- ❌ *"A Jorge le va a quedar visible cuánto tarda y se va a hacer el vivo."*

**Los hechos y las citas textuales siguen llevando nombre** (*"Jorge dijo textual: «para cargarlo
tengo que subir a la oficina»"*). Lo que cambia de forma es el **juicio**, no el dato.

## Los chips y la cinta

**Chip `CERRADA`** o **chip `BORRADOR`**, arriba a la derecha, mismo peso visual. Si es BORRADOR, va
además **la cinta con el motivo impreso** — nunca una cinta muda:

> **BORRADOR** — falta el criterio de éxito (03:21) · se habló con 1 de 3 roles: falta depósito y compras.

**Las 3 razones que prenden la cinta viven en el motor** (sección "Los 3 gates"). No se repiten acá
a propósito: si estuvieran en los dos lados, tarde o temprano dicen cosas distintas.

## El documento "no construir"

**No puede parecer un documento fracasado.** Mismo chip CERRADA, mismo peso visual, misma cabecera de
procedencia, mismo largo. Es un entregable de primera clase: alguien invirtió semanas en averiguar
que no había que construir, y eso es una entrega, no una rendición.

Abre con **el veredicto en una caja, antes que nada y siempre en positivo**:

> ### No construir un tablero de consulta. Prender el módulo de recepción de Tango.

Y después, en este orden:

1. **El problema, en 3 líneas** — el mismo de siempre, sin suavizar.
2. **Qué se evaluó** — todas las alternativas, **incluida "seguir igual" con su costo**.
3. **Qué hay que hacer que no es software** — con **responsable**, no "habría que".
4. **Qué NO se resuelve con esto** — lo que queda doliendo igual.
5. **El supuesto que daría vuelta la recomendación** — si mañana esto es falso, se reabre.
6. **Cuándo volver a mirarlo** — una fecha, no "más adelante".
