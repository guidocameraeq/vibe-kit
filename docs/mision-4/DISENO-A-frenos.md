# Diseño · Racimo A: frenos y verificación

> **Misión 4, tramo 4** · 2026-10-21 · **Estado: aprobado por Guido en lo central** (la lista de lo que se le
> pregunta). El resto lo armó Claude a partir de eso y queda para que Guido lo revise. Es solo diseño: se
> construye en la misión 5. Se mide contra el norte del [PLAN](PLAN.md): **¿le baja la intervención a
> Guido o se la sube?**

## 1. Para qué es este racimo, en una línea

**Que los agentes no repitan errores, sin que Guido tenga que vigilarlos ni dar "dale" a cada rato.**

## 2. Lo que decidió Guido (2026-10-21)

**Un agente le pregunta a Guido solo cinco cosas** (eran cuatro; la quinta entró el 2026-10-23, y el texto decía "cuatro" hasta la revisión integral del 2026-10-26):
1. borrar datos reales;
2. tocar plata;
3. manejar claves;
4. mandar algo hacia afuera a su nombre (por ejemplo, mails a clientes);
5. 🆕 **publicar un release** (decisión de Guido, 2026-10-23, en el racimo D: un OK por release, agrupado; lo pedían ya los tres `/release` y él lo prefirió. [DISENO-D](DISENO-D-director-obrero.md) §8).

**Todo lo demás lo resuelven los agentes solos, producción incluida.** Ninguna pieza del pack puede
sumarle a Guido una pregunta que esté fuera de esta lista. Si algo de afuera de la lista parece necesitar
una pregunta, se propone sumarlo a la lista, y lo decide Guido. *Las decisiones de diseño y negocio, y los cambios a una barrera, que Guido definió como suyos (D §13), no son preguntas de esta lista: son la cola "te espera", que no interrumpe a nadie.*

*Revisión integral (2026-10-26, con el acta de contraste; decisión A-1 reabierta y cerrada con Guido): **"mergear a `main`" y
"escribir o migrar producción" NO entran a la lista.** Eran el clic más repetido de Guido (392 lotes en contra, 240 a favor): ~9
clics de merge y 7 autorizaciones de ensayo en una sola noche (85e17f12, 2026-10-19); y en la noche del 2026-10-21/22, **13 clics de
merge con Guido sentado al lado de la PC a las 00:26** ("estoy acá al lado de la computadora dándole constantemente el permiso al
obrero 71 para que merge… ¿cuándo me puedo ir?", chat 23f8dd9f). Ese freno no era de la plataforma: era una regla `ask` **del propio
proyecto** ("ese comando está configurado para preguntar siempre, a propósito"). Lo decidido: las dos se **pre-autorizan por proyecto**
en la ficha del kit, con default por nivel, **definido una sola vez en E §4**: proyecto liviano, libres; estandar, con o sin director, **merge solo si el gate por script dio verde**
([DISENO-D](DISENO-D-director-obrero.md) §12) y **producción solo por el comando del proyecto con foto y revisión Opus** ("con permiso,
igual con red", [DISENO-F](DISENO-F-seguridad.md) §13); leer producción es libre ("usar sin ver", F §8). Una regla `ask` propia del
proyecto sobre algo fuera de esta lista es una pregunta fuera de la lista: el inventario de §9 la tiene que cazar, **salvo la que Guido mismo endureció en `autorizado:` de la ficha con su razón** ("en Desktop, el merge a `main` me lo preguntás", D §8.4): esa el inventario la lista como suya y no la cuenta (revisor frío 26/10, hallazgo 16). Alternativa
descartada: sumarlas a la lista (7 preguntas): sube la intervención (criterio 1) y cuelga la noche (D-9, 2026-10-19 02:35, "otro git
merge pide el clic del PO, que ya no está").*

## 3. Dos clases de freno

| Clase | Qué hace | A quién molesta | Cuándo se usa |
|---|---|---|---|
| **Corrector** | Le niega la acción al agente **y le dice qué hacer en su lugar**. El agente sigue solo | A nadie | Para un error que se repitió y costó |
| **Pregunta** | Frena y le pregunta a Guido | A Guido | **Solo** para las 5 cosas de §2 |

En Hermes se mezclaron las dos clases. Los ~30 frenos sobre cosas ya autorizadas (H-33) y el obrero
trabado 1,5 h de noche por un permiso (A.4) son preguntas que debieron ser correctores, o directamente no
existir.

## 4. Las tres reglas

1. **Un corrector nuevo se pone recién cuando el error se repite y costó caro.** La primera vez no se
   agrega nada, ni siquiera una regla escrita: se anota el caso. La segunda vez, corrector.
2. **Cada freno se mide: cuántas veces salvó y cuántas molestó.** Cada vez que frena, deja una línea en
   un registro (fecha, qué frenó, por qué herramienta). *Ubicación propuesta por F (§21, 2026-10-22):
   `docs/frenos.log`, versionado, de solo agregar, commiteado en el cierre. **B lo corrige (§4, 2026-10-22): `.claude/frenos.log`**, porque
   `docs/` es del proyecto y su raíz tiene seis archivos fijos; el registro es del método, como la ficha del kit. **Y un choque que destapó B** (B §20): un archivo de solo agregar escrito desde varias
   ramas y worktrees a la vez choca al mezclar, y el actualizador de E mezcla sin preguntar; salidas: un archivo por mes, uno por rama, o
   `merge=union` en `.gitattributes`. Se decide en la revisión integral.*
3. **El que molesta más de lo que salva, se saca.** Lo mismo con el que lleva 3 meses sin frenar nada:
   o era de adorno, o el problema ya no existe.

## 5. Cómo se construye un corrector (la receta, para el obrero)

Sale del piloto de Desktop (A.4 y A.5 de la radiografía) y de lo que se vio en Mobile (H-161).

1. **Nace de un caso repetido** (regla 1), con la evidencia de las dos veces.
2. **Se mide contra el historial antes de instalarlo**: se corre sobre los comandos reales de los chats,
   contando cuántos habría frenado y cuántos de esos eran legítimos.
   - Con falsos positivos, **no se instala** hasta corregirlo.
   - El molde de esto ya existe: Desktop midió 37.842 comandos con 0 falsos positivos.
3. **Cubre todas las herramientas que logran lo mismo**: Bash, PowerShell, Write y Edit. Si cubre una
   sola, el agente lo rodea (H-161: bloqueado en Bash, lo escribió con Write).
4. **El mensaje dice la alternativa**: no "prohibido", sino "eso no; hacé X". Sin alternativa, el agente
   se traba o pregunta, y eso sube la intervención.
5. **Trae su prueba de casos** (sí frena / no frena). Desktop usa entre 160 y 200 casos.
6. **Se revisa que los permisos no lo contradigan.** En Desktop, `git stash` estaba prohibido por la
   regla y pre-aprobado en la configuración al mismo tiempo.
7. **Escribe en el registro** cada vez que frena (regla 2).

**El trinquete** es un corrector de otro tipo: un número que solo puede bajar, como "atribuciones en el
código: 12". Si un cambio lo sube, la prueba falla y el agente lo arregla solo. Sirve para lo que se
cuenta. Se construye con la misma receta.

## 6. Qué trae el molde de fábrica y qué es opcional

**De fábrica**, en todo proyecto nuevo:

| Pieza | Clase | Por qué |
|---|---|---|
| **Las 5 preguntas de §2**, con la ficha del proyecto diciendo qué es "dato real", qué toca plata y qué sale afuera (es la misma ficha del kit, `.claude/kit.md`, campo `sensible:`; definida en [DISENO-E](DISENO-E-molde-y-flota.md) §4 el 2026-10-22) | Pregunta | Es la lista de Guido. Lo concreto (qué base, qué servicio) cambia por proyecto, así que el molde trae el mecanismo y la ficha lo completa |
| Git que borra trabajo sin guardar (`reset --hard`, `clean -f`, `stash`, restaurar todo el árbol) | Corrector | Pasó en los dos proyectos largos, y un subagente tiró todos los cambios de su worktree. Alternativa: commit de trabajo en curso |
| El registro de frenos (§4) | — | Sin él, la regla 3 no se puede aplicar |
| **Afirmaciones en prosa que prometen más de lo medido** (docstrings, comentarios, textos de error, viñetas de release): un chequeo sobre las líneas agregadas del commit, con la receta de §5 (P18, reabierto el 2026-10-26) | Corrector | Es **la primera causa de vueltas del revisor** en Hermes (11 lotes del acta de contraste; "cuatro revisiones, cero hallazgos en el código y nueve en la prosa"). Sacarlo de la revisión y ponerlo en un corrector es lo que hace cumplible el tope de 2 vueltas de D §10 |
| **Spec sin sello del Arquitecto**: un obrero o una sesión de módulo cuyo encargo apunta a un spec READY sin la línea de sello que escriben los scripts del Arquitecto no arranca; dice "spec sin Arquitecto: corré Modo B" y para | Corrector | El Arquitecto aparecía en 11 de 41 lotes (Mobile: 0 de 18); es el candado de la decisión E-1 del 2026-10-26 ([DISENO-E](DISENO-E-molde-y-flota.md) §2, [DISENO-H](DISENO-H-niveles-y-puertas.md) §8). Le dice al agente qué hacer; no le pregunta nada a Guido |

**Opcional**: cada proyecto lo prende si le pasó el problema.

| Pieza | Clase | Cuándo |
|---|---|---|
| Python o scripts por la entrada para editar archivos → usar las herramientas de edición | Corrector | Si el proyecto tiene ese hábito (~290 casos en Hermes; ~6,6% de los comandos en Desktop) |
| Trinquete de atribuciones o de cualquier cosa que se cuente | Corrector | Si hay un número que se quiere bajar |
| Mutaciones de pruebas (romper el código a propósito y ver que la prueba se ponga roja) | Corrector | Proyectos con suite de pruebas grande |

**Los secretos en lo que se commitea** son un corrector de fábrica, pero se diseñan en el racimo F
(seguridad), junto con el `deny`.

*Nota de H (2026-10-25): dos cosas para el registro de A. (1) **El arreglo del arreglo** (26% de los arreglos de la flota) sigue siendo chico, pero el mismo chequeo `gate:fix-sin-prueba` de D §10.5 agrega: si el arreglo toca un archivo de un fix de los últimos N días, revisor Opus congelado en el commit antes del push (por archivo, no por función). (2) `git worktree remove --force` entra al corrector "git que borra trabajo" de esta tabla: el script `worktree cerrar` de H se niega si hay cambios sin commitear ([DISENO-H](DISENO-H-niveles-y-puertas.md) §5.6, §10.2).*

## 7. La verificación: que el director no revise todo a mano

Hoy el director gasta en verificar a mano: 41 chequeos y 4 corridas de pruebas en 3 días, y 8 de cada 11
encargos traían un dato falso. Esto no le pregunta nada a Guido, pero le ahorra tokens y tiempo a todo el
sistema.

- **Estado de partida por script.** Cada encargo arranca con los datos reales (rama, último commit, fecha
  con zona horaria) generados por un script, no escritos de memoria. Corta de raíz el dato falso.
- **El encargo va por referencia, nunca resumido.** Apunta al spec y a `archivo:línea`, no los parafrasea.
  Es la idea de gentle-ai ([REFERENCIAS-EXTERNAS](REFERENCIAS-EXTERNAS.md) §1).
- **El aviso del obrero se verifica con un script**: commit en el remoto, árbol limpio, pruebas en verde.
  El director lee 6 líneas en lugar de chequear todo.
- **"Listo" dice qué cruzó y qué no miró** (P5).
- **Una prueba en rojo por cada regla pedida**, sin relleno.

El paso siguiente, que el **estado general** ("espero / te necesito / nada") también lo calcule un script,
es del racimo C.

## 8. Cómo se sabe si funcionó

| Medida | Hoy | Meta |
|---|---|---|
| Preguntas a Guido fuera de la lista de 5 | ~30 frenos sobre lo ya autorizado (H-33), más trabas nocturnas | **0** |
| Errores con corrector que vuelven a pasar | 5 familias reincidieron con la regla escrita | 0 |
| Falsos positivos por corrector | 0 en los dos de Desktop | 0; si aparece uno, se arregla o se saca |
| Encargos con un dato falso | 8 de 11 | 0 |
| Chequeos a mano del director | 41 en 3 días | Que bajen (se mide en el piloto) |
| Frenos que molestan más de lo que salvan | Sin medir | Se sacan en la revisión mensual |

Se repite cada mes con el registro de frenos y con los scripts de `observatorio/investigacion/`.

## 9. Hermes y los proyectos que ya andan

- **Hermes no se migra a mitad de un tramo** (ADR-021). Cuando adopte el pack, el primer paso es **pasar
  sus frenos por este filtro**: cuáles son preguntas que deberían ser correctores, cuáles no salvaron
  nada y cuáles contradicen la lista de 5.
- Para eso, a cada director se le pide un **inventario con formato fijo**: freno · clase · cuántas veces
  frenó · cuántas molestó. Es lo que funcionó el 21/10 (PLAN, §Lecciones).

## 10. Lo que queda afuera o en espera

| Qué | Por qué | Cuándo vuelve |
|---|---|---|
| Un banco de pruebas del método | Vale la pena, pero es una pieza grande | En la medición y en la misión 6 |
| ~~El gate de texto sobre las líneas agregadas (P18)~~ | **Salió de espera el 2026-10-26**: ni el trinquete ni el corrector de secretos miran afirmaciones, y el acta de contraste lo midió como la primera causa de vueltas del revisor | Es el corrector "afirmaciones en prosa" de §6 |
| Los cortes de red contra los errores de código (S-U-5) y los backups de 0 bytes (S-U-4) | Son propios de cada tipo de proyecto | Como opcionales, si se repiten en otro proyecto |

## 11. Revisión integral con el acta de contraste (2026-10-26)

Con [`tips/tanda-2026-11-contraste.md`](../../tips/tanda-2026-11-contraste.md) abierta (336 chats, 49 decisiones con veredicto) y sin
volver a los chats salvo los marcados ★. Lo que cambió en A:

| Qué | Veredicto del acta | Qué se hizo | Dónde |
|---|---|---|---|
| A-1 · las 5 preguntas | contradicha (✘392 / ✔240, 81 lotes): el clic de merge y de producción es el más repetido y no está en la lista | Reabierta y cerrada con Guido: **no entran a la lista; se pre-autorizan por proyecto** con gate verde (merge) y comando con foto (producción) | §2 |
| A-2 · solo frenos mecánicos | confirmada (✔375 / ✘68) | Se aplicó a las decisiones del propio pack que eran prosa: E-4 (formato fijo), H-6 (contador por script), C-1 | E, H, C |
| A-3 · el director no revisa a mano | confirmada (✔747 / ✘14) | Nada; el ✔ mide el problema. El paquete del revisor por script (D §10) es el remedio | D |
| P18 · afirmaciones en prosa | hueco 4 del acta, 11 lotes | Sale de espera: **corrector de fábrica** | §6, §10 |
| E-1 · el candado del Arquitecto | contradicha (✘84 / ✔11) | Corrector nuevo de fábrica: "spec sin sello" | §6 |
| Regla `ask` propia del proyecto | chat ★ 23f8dd9f: 13 clics de merge por una `ask` de Hermes | Es una pregunta fuera de la lista; el inventario de §9 la caza | §2, §9 |
| El registro de frenos desde varias ramas (§4.2) | sigue abierto | Se resuelve en el spec con `merge=union` en `.gitattributes` (la salida más barata de las tres de B §20); si falla en el piloto, un archivo por rama | §4 |

Los 11 criterios no cambian de veredicto para A: las dos piezas nuevas son correctores (criterio 6, script antes que modelo; criterio 1, no
le preguntan nada a Guido) y nacen de caso repetido con número (regla 1 de §4).

