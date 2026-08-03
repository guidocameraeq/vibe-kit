# Recorrido de uso — `/relevamiento`

> **📦 ARCHIVADO 2026-08-03.** Su trabajo era transmitirle el TONO y el ritmo al chat que construyó
> la skill. Ya se construyó (`kit/skills/relevamiento/`, v2.4.2). **Nunca fue normativo**: si algo de
> acá contradice al SPEC, manda el SPEC. Se conserva porque es el único relato de uso de punta a punta.


> **Qué es esto y qué no.** Es el relato de cómo se siente usar la skill, de punta a punta, con un caso
> real. Sirve para que quien la construya entienda el TONO y el ritmo que el SPEC describe en seco, y para
> que Guido verifique que se ajusta a cómo trabaja.
>
> **No es normativo.** Si algo acá contradice a `docs/SPEC-relevamiento.md`, **manda el SPEC**. Los números
> de este recorrido son ilustrativos; los que cuentan son los criterios de aceptación del SPEC y la tabla
> de `docs/PRESUPUESTO-relevamiento.md`.

**El caso:** Marcela, de Compras, para a Guido en el pasillo. Cinco semanas, nueve sesiones de chat,
~2 h 50 min de chat en total, cuatro salidas a hablar con gente, un hueco muerto de dieciséis días, y un
supuesto que se cae y da vuelta el proyecto.

---

## Martes 4 de agosto · sesión 1 · 22 min · 5 preguntas

Guido vuelve del pasillo y dicta:

> `relevamiento. me acaba de parar marcela de compras y me dice que necesita un excel donde ver que ordenes de compra estan pendientes de recibir. arranquemos antes de que me olvide porque despues me olvido`

La skill responde **antes de preguntar nada**:

```
Ya está en disco. Antes de preguntarte nada:

  _relevamientos\2026-08-ordenes-pendientes-recibir\
    TABLERO.md          <- creado
    1-problema.md       <- con el pedido de Marcela, tal cual
    notas/2026-08-04.md <- el crudo de lo que dijiste
    pdf/                <- vacía por ahora

Le puse ese nombre porque salió de tu propia frase. No se cambia nunca más,
pero el TÍTULO sí lo podés cambiar cuando quieras.
```

**Cero preguntas todavía. Cero clics.** La carpeta existe antes de que él haya decidido nada. *(La pregunta cero —"¿te lo pidió alguien, o es algo tuyo?"— no se hace: ya la contestó al invocarla.)*

Después el volcado. Guido dicta cuatro minutos, desordenado, mezclando lo que dijo Marcela con lo que él supone. La skill lo ordena, muestra el mapeo campo por campo con su balde, y anota literal algo que después salva el proyecto:

```
⚠ CONTRADICCIÓN SIN RESOLVER:
  Marcela dice "el Tango eso no lo muestra"
  Guido dice  "yo sé que Tango lo muestra"
  Las dos versiones quedan escritas.
```

La clasificación va **después del volcado y pre-tildada**, mostrando su cita: *"tildé 'toca plata' porque dijiste «las facturas quedan sin cruzar»"*. Él destilda lo que no va.

El revisor cobra dos deudas, dos lentes traen dos preguntas más, y al final sale la hoja de campo con tres personas. En la de Jorge, la máquina escribe esta línea **el día uno**:

```
Cambia el proyecto si: te dice que los carga por lote, un día fijo de la semana.
```

---

## Jueves 6 · sesión 2 · 11 min · 1 pregunta

Volvió de hablar con Marcela. Trae notas del celular y una foto de una planilla.

> `volvi de hablar con marcela. te paso lo que anote asi como esta. "excel rodrigo = era una planilla compartida, ella cargaba las OC y jorge ponia una X cuando llegaba. se dejo de usar porque jorge dejo de poner la X". tambien me dijo que ella igual tiene su propia planilla. te mando la foto`

```
Miré la foto. Columnas: OC | Proveedor | Fecha pedido | Prometido | Llegó | Obs
31 filas, la última del 05/08. "Llegó" está lleno a mano en 12.

Tres cosas que cambian el relevamiento:

1. EL PEDIDO ERA FALSO. Marcela pidió "un Excel para ver qué está pendiente"
   y YA TIENE ese Excel. El pedido no era el problema.
2. El Excel de Rodrigo murió porque Jorge dejó de poner la X. No murió por
   técnica: murió porque el que tenía que alimentarlo no ganaba nada.
3. El dato vive en DOS lugares. Eso me va a disparar una pregunta en la
   Etapa 2, no ahora.
```

El viernes tiene reunión con el jefe y pide el PDF. **Sale en BORRADOR**, con cinta arriba y el motivo, porque un documento con un hueco no puede parecer terminado. En la reunión el jefe le dice dos cosas: *"ojo con Depósito"* y *"esto lo tenemos que ver con Silvia también"*. Las dos ya estaban en el documento. **Eso es lo que compró el PDF de borrador.**

---

## Lunes 10 · sesión 3 · 18 min · 4 preguntas · **tropiezo 1: vuelve con el número equivocado**

> `hable con jorge. me dijo que los carga cuando puede y que le entran un monton de remitos. tambien hable con silvia y me dijo que si, que a veces paga y despues aparece el remito, no me supo decir cuantas veces`

```
Con esto la Etapa 1 queda completa: ya hablaste con los tres roles.

Pero ojo con dos cosas que trajiste, porque no son datos:
  "un montón de remitos"  -> no es un número
  "a veces paga"          -> no es un número

Si entro a la Etapa 3 con "un montón", el criterio de éxito no se va a poder
medir a las 6 semanas. Lo derivo a la hoja de campo con la pregunta
REFORMULADA:

  ANTES:  "¿cuántos remitos te entran?"
  AHORA:  "¿me dejás contar los remitos de esta semana?
           No hace falta que sepas: contamos."

Y "él sabe todo de memoria" me lo llevo a la Etapa 2: es la respuesta a dónde
vive el dato. Vive en la cabeza de Jorge. Eso es durísimo y lo dijo sin querer.
```

Cierra la Etapa 1 y sale el PDF de verdad, con la caja de procedencia y las tres personas con sus fechas.

---

## Del 11 al 25 · **tropiezo 2: la vida**

Se cae el server de facturación. Marcela se va de licencia. El jefe pide un informe de licencias. Cambia tres impresoras.

**Dieciséis días. Nadie toca la carpeta. La skill no manda un solo recordatorio, no aparece en ningún chat, no hace absolutamente nada.**

---

## Miércoles 26 · sesión 4 · 15 min · 1 pregunta

> `relevamiento`

```
Tenés uno solo abierto: "Órdenes pendientes de recibir", quedaste en la Etapa 2.
Sin tocar hace 16 días. Lo retomo.

Antes de seguir, tres cosas que te dejé y no viste:

1. LA INVESTIGACIÓN VOLVIÓ (10/08). Tango tiene un módulo de "Recepción de
   mercadería" con app móvil.
   [VERIFICADO 2026-08-10 · docs.axoft.com/...] — existe.
   [NO VERIFICADO] — si está incluido en la licencia de ustedes.
   Eso es un llamado al proveedor, no una búsqueda.
2. QUEDÓ UNA TAREA TUYA: el listado de remitos del último mes.
3. Hay 3 lentes en banco que no llegué a preguntarte por cupo.
```

> `ah mira, el listado lo saque el viernes y me lo olvide. son 34 remitos en la semana del 10 al 14. y de los 34, 22 estan cargados en tango con fecha viernes. o sea todos juntos`

```
Pará.

Ese segundo dato no es un detalle: es el corazón del proyecto y lo dijiste
de paso.

  34 remitos por semana (fuente: listado de Tango)
  22 de 34 (65%) cargados el viernes, en lote.
```

Cierra la Etapa 2 y le cambia el título a *"Los remitos que llegan y nadie ve"*. **El nombre de la carpeta no cambia** — los PDF ya emitidos y el mail que le mandó al jefe siguen apuntando ahí.

---

## Jueves 27 · sesión 5 · 20 min · 4 preguntas · la Etapa 3, donde el método muerde

> `el criterio de exito seria que compras entre todos los dias al tablero nuevo y vea lo que llego`

```
Ese criterio no me sirve, y te digo por qué en una línea: nombra la solución.

"Que entren al tablero" mide que la pantalla exista, no que el problema se
haya ido. Si dentro de dos meses Compras entra todos los días al tablero y
IGUAL baja al depósito a preguntar, ese criterio dice "éxito" y el proyecto
fracasó.

Armé tres con lo que ya tenemos:
  1. "A las 6 semanas, Marcela dejó de hacer la vuelta matinal"
  2. "A las 6 semanas, el 90% de los remitos está cargado el mismo día que
      llega la mercadería" — se mide solo, sale de Tango
  3. "A las 6 semanas, Administración no pagó ninguna factura sin remito"
```

> `la 2 me gusta mas porque esa la puedo medir sin preguntarle a nadie`

Después el apetito (cinco días) y el supuesto más riesgoso. La skill le escribe la prueba barata —sacar de Tango la fecha del remito y la de carga, restar, quince minutos— y **deja la Etapa 3 abierta hasta que vuelva con eso**.

Y pasa algo bueno: la lente del **Reloj** pregunta si hay una fecha del negocio que mande, él contesta *"no… pará, sí, en octubre migramos la facturación electrónica"*, y la skill lo cruza sola con la lente de **Choque** que tenía en banco. Los cinco días tienen que caer en septiembre o el proyecto se corre a noviembre.

---

## Viernes 28 · sesión 6 · 8 min · 1 pregunta · **tropiezo 3: el supuesto se cae**

> `saque los datos. la diferencia promedio entre que llega la mercaderia y que jorge carga el remito es de 3,4 dias. la peor fue 9 dias. o sea que el supuesto se fue al carajo`

```
Se cayó. Lo escribo así, sin suavizarlo.

Ahora, qué se cayó y qué NO se cayó, que es lo importante:

SE CAYÓ                        SIGUE EN PIE
─────────────────────────      ─────────────────────────────────
Cualquier tablero que LEA      El problema: Compras no se entera.
Tango para mostrar qué         La línea base: 34 remitos/semana,
llegó. Mostraría datos de      1h15 de vueltas al depósito.
hasta 9 días de atraso. Es     El criterio de éxito (ahora mide
exactamente lo que Compras     justo lo que falla).
ya no cree.                    El apetito. Todo lo de E1 y E2.
                               Nada se tira.

Y esto cambió el problema de lugar. No es un problema de VISUALIZACIÓN.
Es un problema de CAPTURA: que el dato entre cuando entra la mercadería.

Que es, palabra por palabra, lo que decía la hoja de campo de Jorge el día 1.
```

---

## Lunes 31 · sesión 7 · 25 min · 3 preguntas · la frase que vale todo el relevamiento

Volvió a hablar con Jorge, seis minutos, con la pregunta afilada — *¿no puede o no quiere?*:

> `me dijo textual "yo lo cargaria en el momento pero para cargarlo tengo que subir a la oficina y prender la compu, y si estoy descargando un camion no voy a subir por cada remito, los junto y los hago el viernes". o sea NO PUEDE.`

```
Esa frase vale todo el relevamiento. La escribo verbatim y va a la propuesta
como cita. Un sistema que se diseñe sin esa frase adentro va a fallar
exactamente igual que el Excel de Rodrigo.
```

Cierra la Etapa 3 con su PDF, y viene **el abanico de salidas**. De seis familias, la skill descarta tres solas *con la razón escrita* y le ofrece las otras. Él elige prender el módulo de Tango — llama, le dicen que el móvil se paga aparte, 800 dólares por año — así que va la primera: que Depósito cargue desde donde recibe. **La alternativa descartada queda escrita con su número**, que es lo que evita que dentro de un año alguien vuelva a proponer lo mismo.

---

## Martes 1 de septiembre · sesión 8 · 40 min · 7 preguntas · **el momento del Arquitecto**

**Antes, invocándolo en frío:**

```
A: ¿Qué es y para quién?      G: una app para que compras vea que falta recibir
A: ¿Web, escritorio, celular? G: eh... web supongo
A: ¿Tiene login?              G: si, supongo
A: ¿De dónde saca los datos?  G: de tango
A: ¿Tango tiene API?          G: ni idea, lo tengo que averiguar
```

Y el spec salía con este renglón — **el proyecto muerto, que nadie iba a mirar hasta la semana 3**:

```
## Supuestos
- Se asume que los datos de recepción en Tango están actualizados al día.
```

**Ahora**, con la línea exacta que la skill le dio para pegar:

```
Leí el relevamiento entero. Antes de preguntarte nada, te digo lo que NO te
voy a preguntar:

· Qué tiene que pasar -> que el remito entre cuando entra la mercadería
· Quién lo usa -> Jorge. NO es Compras: Compras es el beneficiario, no el usuario
· Cuánto vale -> 5 días, en septiembre (en octubre se cruza con la migración)
· Qué NO hacer -> ningún tablero que lea Tango. REFUTADO con datos: 3,4 días
· Qué se descartó -> el módulo móvil, USD 800/año. No me lo re-propongas
· La restricción que manda -> "para cargarlo tengo que subir a la oficina"

Me quedan 5 preguntas de diseño.
```

Y el spec sale con esto donde antes había una suposición:

```
## Supuestos
- PROBADO FALSO (28/08, 138 remitos de Tango): los remitos NO están cargados
  al día. Atraso promedio 3,4 días, peor caso 9. El 65% se carga los viernes.
  → Por eso este sistema captura en el punto de recepción y NO lee Tango.

## FUERA de alcance
- NO se construye ningún tablero de consulta para Compras.
```

**Y acá el orden importa** (fue uno de los 4 críticos del red-team): el Arquitecto **NO monta el proyecto todavía**. Devuelve el plano, la skill escribe la Etapa 4, y el montaje espera a que la propuesta esté aprobada.

---

## Miércoles 2 · sesión 9 · 12 min · la reunión con los que lo van a usar

> `jorge dijo que en el galpon de atras no hay señal. marcela dijo que le parece bien pero pregunto que pasa si jorge se toma vacaciones. los dos dijeron que si`

```
Las dos objeciones cambian cosas distintas:

Jorge / la señal  -> esto toca el SPEC, no la propuesta. La app tiene que
                     andar sin conexión. AJUSTE ACORDADO. No lo toco yo:
                     el spec es del Arquitecto.
Marcela / las     -> esto es la lente "El día después", que quedó SIN
vacaciones           preguntar por cupo y figuraba en "Lo que no preguntamos".
                     Marcela la hizo sola.

¿Aprobada para pasar a construcción?  SÍ, con ajustes.
```

**Recién ahí** se monta el proyecto.

---

## La cuenta

| Día | Qué pasó | Duración | Preguntas |
|---|---|---:|---:|
| mar 4/8 | Arranque + Etapa 1 · sale la hoja de campo | 22 min | 5 |
| jue 6/8 | Vuelve de Marcela + la foto · PDF borrador | 11 min | 1 |
| lun 10/8 | Vuelve de Jorge y Silvia · **cierra E1** · arranca E2 | 18 min | 4 |
| 11–25/8 | **Nada. 16 días.** La skill no aparece | 0 | 0 |
| mié 26/8 | Retome en 3 líneas · **cierra E2** | 15 min | 1 |
| jue 27/8 | Etapa 3 · criterio rebotado · apetito · el supuesto | 20 min | 4 |
| vie 28/8 | **El supuesto se cae.** El proyecto cambia de forma | 8 min | 1 |
| lun 31/8 | **Cierra E3** · abanico de salidas · ruteo | 25 min | 3 |
| mar 1/9 | **El Arquitecto** · spec · **E4 + dossier** | 40 min | 7 |
| mié 2/9 | Revisión con los usuarios | 12 min | 1 |
| | **Total** | **2 h 51** | **27** |

De las 27: **13 son de la planilla del jefe** (el método que ya usaba), **6 del revisor** cobrando deudas de esa misma planilla, **6 son lentes** (el tope exacto, sin ninguna bajada) y **5 del Arquitecto** — contra las que hubiera hecho en frío.

**Caminando: 45 minutos**, en cuatro salidas, todas con hoja impresa.

---

## Lo que no pasó — que es la mitad del diseño

- **Nunca le preguntó dónde guardar nada.** Ni una ruta, ni un nombre de carpeta.
- **Nunca le pidió que ordenara lo que dictaba.** Habló como habla; la skill ordenó.
- **Nunca inventó un número.** "Un montón" quedó escrito como "un montón" hasta que hubo 34.
- **Nunca afirmó un negativo.** Lo del módulo de Tango quedó `[NO VERIFICADO]` hasta que llamó.
- **Nunca lo hizo empezar de nuevo** después de dieciséis días de silencio.
- **Nunca perdió lo que se cayó.** El supuesto refutado terminó siendo el renglón más valioso del spec.
- **Nunca decidió sola en la zona gris.** El carril, la salida del abanico y quién piensa la propuesta: las tres las eligió él, de una lista que armó la máquina.
- **Y en sus proyectos personales no apareció nunca.** Ni un hook, ni una línea, ni un recordatorio.
