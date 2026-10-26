# Diseño · Racimo A: frenos y verificación

> **Misión 4, tramo 4** · 2026-10-21 · **Estado: aprobado por Guido en lo central** (la lista de lo que se le
> pregunta). El resto lo armó Claude a partir de eso y queda para que Guido lo revise. Es solo diseño: se
> construye en la misión 5. Se mide contra el norte del [PLAN](PLAN.md): **¿le baja la intervención a
> Guido o se la sube?**

## 1. Para qué es este racimo, en una línea

**Que los agentes no repitan errores, sin que Guido tenga que vigilarlos ni dar "dale" a cada rato.**

## 2. Lo que decidió Guido (2026-10-21)

**Un agente le pregunta a Guido solo cuatro cosas:**
1. borrar datos reales;
2. tocar plata;
3. manejar claves;
4. mandar algo hacia afuera a su nombre (por ejemplo, mails a clientes);
5. 🆕 **publicar un release** (decisión de Guido, 2026-10-23, en el racimo D: un OK por release, agrupado; lo pedían ya los tres `/release` y él lo prefirió. [DISENO-D](DISENO-D-director-obrero.md) §8).

**Todo lo demás lo resuelven los agentes solos, producción incluida.** Ninguna pieza del pack puede
sumarle a Guido una pregunta que esté fuera de esta lista. Si algo de afuera de la lista parece necesitar
una pregunta, se propone sumarlo a la lista, y lo decide Guido.

## 3. Dos clases de freno

| Clase | Qué hace | A quién molesta | Cuándo se usa |
|---|---|---|---|
| **Corrector** | Le niega la acción al agente **y le dice qué hacer en su lugar**. El agente sigue solo | A nadie | Para un error que se repitió y costó |
| **Pregunta** | Frena y le pregunta a Guido | A Guido | **Solo** para las 4 cosas de §2 |

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
| **Las 4 preguntas de §2**, con la ficha del proyecto diciendo qué es "dato real", qué toca plata y qué sale afuera (es la misma ficha del kit, `.claude/kit.md`, campo `sensible:`; definida en [DISENO-E](DISENO-E-molde-y-flota.md) §4 el 2026-10-22) | Pregunta | Es la lista de Guido. Lo concreto (qué base, qué servicio) cambia por proyecto, así que el molde trae el mecanismo y la ficha lo completa |
| Git que borra trabajo sin guardar (`reset --hard`, `clean -f`, `stash`, restaurar todo el árbol) | Corrector | Pasó en los dos proyectos largos, y un subagente tiró todos los cambios de su worktree. Alternativa: commit de trabajo en curso |
| El registro de frenos (§4) | — | Sin él, la regla 3 no se puede aplicar |

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
| Preguntas a Guido fuera de la lista de 4 | ~30 frenos sobre lo ya autorizado (H-33), más trabas nocturnas | **0** |
| Errores con corrector que vuelven a pasar | 5 familias reincidieron con la regla escrita | 0 |
| Falsos positivos por corrector | 0 en los dos de Desktop | 0; si aparece uno, se arregla o se saca |
| Encargos con un dato falso | 8 de 11 | 0 |
| Chequeos a mano del director | 41 en 3 días | Que bajen (se mide en el piloto) |
| Frenos que molestan más de lo que salvan | Sin medir | Se sacan en la revisión mensual |

Se repite cada mes con el registro de frenos y con los scripts de `observatorio/investigacion/`.

## 9. Hermes y los proyectos que ya andan

- **Hermes no se migra a mitad de un tramo** (ADR-021). Cuando adopte el pack, el primer paso es **pasar
  sus frenos por este filtro**: cuáles son preguntas que deberían ser correctores, cuáles no salvaron
  nada y cuáles contradicen la lista de 4.
- Para eso, a cada director se le pide un **inventario con formato fijo**: freno · clase · cuántas veces
  frenó · cuántas molestó. Es lo que funcionó el 21/10 (PLAN, §Lecciones).

## 10. Lo que queda afuera o en espera

| Qué | Por qué | Cuándo vuelve |
|---|---|---|
| Un banco de pruebas del método | Vale la pena, pero es una pieza grande | En la medición y en la misión 6 |
| El gate de texto sobre las líneas agregadas (P18) | Ya lo cubren el trinquete y el corrector de secretos | Si aparece un caso que no cubran |
| Los cortes de red contra los errores de código (S-U-5) y los backups de 0 bytes (S-U-4) | Son propios de cada tipo de proyecto | Como opcionales, si se repiten en otro proyecto |
