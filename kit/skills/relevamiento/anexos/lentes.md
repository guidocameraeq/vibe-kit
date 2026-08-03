# Las lentes — los ángulos que la planilla no contempla

> **REGLA MADRE: si no podés citar la línea del dossier que la dispara, la lente NO dispara.**
> Nada de "me parece que puede haber un tema de X". Y **toda lente muestra su cita al preguntar** —
> Guido tiene que poder ver de dónde salió y bajarla en un clic si es al pedo.
>
> **REGLA DE REPARTO: si la planilla lo pide, es del revisor. Si la planilla no lo pide, es de la
> lente.** Por eso tres lentes tienen condición negativa contra un bloque de la planilla: cuando esa
> casilla está tildada, el bloque ya hace la pregunta y la lente sería un duplicado.
>
> **El revisor corre SIEMPRE antes**, porque apaga lentes: si R2 logra que "muchos" sea "34 por
> semana con fuente", L4 deja de disparar.

## Las 9 (10 filas, porque L5 se parte en dos)

| # | Lente | Header | Gatillo | **NO dispara si…** | Cierra en |
|---|---|---|---|---|---|
| L1 | Reloj | `+ Reloj` | mención de mes/fecha/temporada; o `02:24` responde con un ciclo; o apetito ≥5 días | — | E3 |
| L2 | Intentos previos | `+ Intentos` | marca de antigüedad; o `02:18` nombra un Excel con nombre propio | — | E1 |
| L3 | Política | `+ Politica` | `01:40` o la lista de roles tienen 2+; o el sistema hace **visible** algo que hoy no se ve | **`03:46` tiene contenido** | E1 |
| L4 | Números | `+ Numeros` | adjetivo de cantidad sin número | **el revisor ya cobró el número con fuente** (un supuesto no alcanza) | E2 |
| L5a | Comprar — adentro | `+ Comprar` | `02:18` o `02:30` nombran un sistema comprado | — | E2 |
| L5b | Comprar — afuera | `+ Comprar` | el problema se enuncia sin nada propio de la empresa **Y** apetito ≥5 días | — | E3 |
| L6 | Choque | `+ Choque` | nombra un sistema; o apetito ≥5 días; **o hay otro `_relevamientos/<slug>/` abierto** | **`caracter: personal`** | E3 |
| L7 | El día después | `+ Mantiene` | casilla "corre solo" o "terceros"; o `02:21` responde "la cabeza de alguien" | **`03:54` o `04:73` tienen contenido** | E3 |
| L8 | Dos verdades | `+ Cual manda` | 2+ lugares del mismo dato; o "lo pasamos", "lo copiamos" | — | E2 |
| L9 | El caso raro | `+ Caso raro` | proceso de 3+ pasos **sin una palabra de excepción** | **la casilla "reemplaza proceso manual" tildada** (`02:39` lo cubre) | E2 |

## Qué pregunta cada una, y sus dos respuestas probables

No improvises el texto: **la pregunta improvisada trae el sesgo puesto.** Adaptá los `<...>` al caso.

**L1 · Reloj** — *"¿Hay alguna fecha del negocio que mande acá: un cierre, una temporada alta, otra migración?"*
→ `Sí, manda <la fecha citada>` · `No, da igual cuándo esté listo`

**L2 · Intentos previos** — *"Esto ya se intentó antes. ¿Qué pasó con <lo que nombró>, por qué se dejó de usar?"*
→ `Se murió porque <razón>` · `No, es la primera vez que se encara`

**L3 · Política** — *"Si esto anda, algún rol queda más expuesto de lo que está hoy. ¿Cuál, y le sirve o le molesta?"*
→ `El rol <X> pasa a tener visible <qué>` · `No cambia quién ve qué`
⚠️ **Por ROL, nunca por nombre** — acá es donde más fácil se cuela un juicio sobre una persona.

**L4 · Números** — *"Dijiste «<el adjetivo>». ¿Cuánto es eso, con algo atrás que lo respalde?"*
→ `Son <número>, sale de <fuente>` · `No lo sé, y hoy no lo puedo saber`

**L5a · Comprar (adentro)** — *"El <sistema> que ya pagan, ¿no tiene un módulo que haga esto? ¿Alguien preguntó?"*
→ `Puede que sí — hay que averiguarlo` (es **un llamado al proveedor**, no una búsqueda) · `Ya preguntamos: no lo tiene`

**L5b · Comprar (afuera)** — *"Esto no tiene nada propio de la empresa adentro. ¿Miraste si ya existe comprado?"*
→ `No miré — anotalo como tarea` · `Sí, miré: no sirve / es caro`

**L6 · Choque** — *"¿Hay otra cosa en marcha que se cruce con esto: la misma gente, las mismas fechas, el mismo sistema?"*
→ `Se cruza con <lo otro>` · `No, esto va solo`

**L7 · El día después** — *"Cuando esto ande: ¿qué rol lo mantiene vivo, y cómo se enteran si un día deja de andar?"*
→ `Lo mantiene el rol <X>` · `No lo pensamos todavía`

**L8 · Dos verdades** — *"El mismo dato vive en <A> y en <B>. Cuando no coinciden, ¿cuál manda?"*
→ `Manda <el que eligió>` · `No está definido: se resuelve a ojo cada vez`

**L9 · El caso raro** — *"Contaste el proceso y salió redondo. ¿Cuál es el caso que se sale de eso?"*
→ `Pasa que <la excepción>` · `No hay, siempre es igual`

## El reloj de L5b y L6, y el desempate

**L5b y L6 se gatean por el apetito, que es de la Etapa 3.** Se **anotan en E2** (con su cita, estado
`en banco`) y **se preguntan al cierre de E3**. No se preguntan antes: sin apetito no se sabe si aplican.

**Rango global** (para desempatar cuando entran más de las que el cupo permite):
**L3 › L5 › L2 › L8 › L4 › L1 › L6 › L7 › L9.**

## Los cupos, los 4 slots y el estado

- **≤2 lentes por cierre de etapa** · **≤6 en todo el relevamiento** · **en E4 = 0.**
- **No heredan el cupo del revisor**: si el revisor usó 1 de sus 3, las lentes siguen teniendo 2.
- **Cada pregunta sale con 4 slots, y 2 son fijos en TODA lente:**
  1. la respuesta probable A (Recomendado) · 2. la respuesta probable B
  3. **"No sé — anotala para el campo"** → a la hoja de campo, reformulada para caminar
  4. **"Bajala"** → `bajada <fecha>` en el TABLERO: **no vuelve nunca**, ni al retomar, ni con
     información nueva, ni en otra etapa.
- **Estado por lente en el TABLERO:** `no disparada` (**se re-evalúa** cuando entra información nueva)
  · `en banco` (disparó, no entró por cupo) · `preguntada` · `bajada <fecha>` (muerta) · `silenciada`.
- **Modo silencioso manual:** *"basta de preguntas de más"* / *"apagá las lentes"* → **siguen disparando
  y anotando en el TABLERO, dejan de preguntar.** Se reabre con *"prendé las lentes"*.
- Lo que quedó `en banco` se puede re-ofrecer **una sola vez**, y esa re-oferta **consume cupo**.

## El mensaje de encuadre — uno por cierre de etapa

Va en ASCII, y su trabajo es que Guido sepa que **esto no es el método de su jefe**:

```
Etapa 2 cerrada — la planilla está completa.

FUERA DE PLANILLA (esto no es del método de tu jefe: es la máquina mirando
este proyecto en particular). Me quedaron 2 preguntas:

  · Comprar     — porque escribiste "lo llevamos en Tango" (P2.2)
  · Cual manda  — porque el dato vive en Tango Y en un Excel (P2.3)

Van de a una. Si alguna es al pedo, elegí "bajala" y no vuelve.
```

## Dónde aterriza lo que contestó

- **En `1/2/3-*.md`: un anexo separable al final**, bajo `## Fuera de planilla`, en el marcador que ya
  trae la plantilla. **Se borra entero y lo que queda es la planilla del jefe** (criterio 13).
- **En `4-propuesta.md`: fundido en el texto**, porque es el documento que va a la reunión — pero cada
  párrafo que salió de una lente va marcado **`[fp]`**, para poder rastrearlo.
- **La regla de redacción manda en los dos**: los juicios sobre conducta van **por ROL y como riesgo**
  (ver `entregable.md`). Los hechos y las citas textuales sí llevan nombre.
