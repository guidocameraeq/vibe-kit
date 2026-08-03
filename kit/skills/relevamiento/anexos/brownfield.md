# Brownfield — el pedido cae sobre una app que ya existe

Cambia **poco, y a propósito**. La Etapa 1 no se toca: el problema es del negocio, no del código, y
tratarlo distinto porque hay un repo es exactamente el error que el método viene a evitar.

- **E1: intacta, cero cambios.**
- **Las 7 casillas se re-tildan PARA ESTE PEDIDO.** No se heredan de la app. Que la app toque plata
  no significa que este pedido la toque.
- **E2: se achica en lo técnico y se agranda en lo humano** (abajo).
- **E3 y E4: iguales.**

## La señal dura — una ruta absoluta o `null`, nunca el texto del pedido

1. **Dónde se abrió el chat.** Si el cwd tiene `.git/`, o lo tiene algún ancestro **hasta la carpeta de
   proyectos** (no más arriba), → **brownfield sobre ese repo**.
2. **Se confirma en UNA LÍNEA, no en una pregunta**: *"Veo que estás parado en `remitos`: lo tomo como
   un pedido sobre esa app. Si no es así, decímelo."* Cuesta 0 clics y es corregible.
3. **⚠️ La carpeta del dossier igual nace en `_relevamientos/`, NUNCA adentro del repo.** El
   relevamiento no es del proyecto todavía: se muda recién al cerrar E4 con veredicto software, y
   se muda **filtrado** (§ La mudanza).
4. Si no hay `.git/` en ningún lado → greenfield, y `02:18` se hace como abajo.

**Cambio de carril a mitad:** sólo cambia `carril:` en el TABLERO. **La carpeta no se mueve** — nunca
vivió adentro del repo, que es justamente para lo que se decidió así. 1 clic.

## `02:18` como lista cerrada

La pregunta ya existe en la planilla (*"¿Qué herramientas o sistemas se usan hoy?"*). En vez de texto
libre, se ofrece con opciones construidas **del disco**:

- `Glob` de `<carpeta de proyectos>/*/.git` → **las 3 apps tocadas más recientemente + "Otra cosa"**.
- **Si no hay repos, la lista queda vacía y vuelve a ser texto libre.** No se inventa una opción.
- Esto es una comodidad, no un gate: lo que Guido escriba a mano vale igual.

## La E2 en brownfield

**Se achica lo técnico:** las preguntas de "¿qué sistema?" y "¿dónde vive el dato?" ya tienen media
respuesta a la vista, así que se **proponen pre-llenadas** y él confirma o corrige (1 clic, no 1
pregunta abierta). El balde de esas respuestas depende de la fuente, no de que sea brownfield.

**Se agranda lo humano, y acá está el valor de esta rama.** La pregunta que la planilla no tiene:

> **"¿Qué hacen hoy POR AFUERA del sistema para tapar esto?"**

El Excel paralelo, el grupo de WhatsApp, la libreta, el mail que alguien se manda a sí mismo. Eso es
lo que el código no puede contar y es donde vive el problema real. Va como campo normal en `02:18`
y `02:21`, con su sello.

## El atajo `docs-fyd/`

Si la app tiene `docs-fyd/` y su `ESTADO.md` **no** está `PENDIENTE REGENERAR` ni vencido, se lee y
se cita. Respetando **su** jerarquía de evidencia (`docs-fyd/deteccion.md:39-47`):

> **sistema vivo (testimonio humano datado) > código > scripts del repo > `docs/`**

- Lo que salga de ahí lleva balde **`DEL CÓDIGO` con la fecha del artefacto**, nunca `RELEVADA`.
- **`docs/` no es fuente de verdad**, y un dato del código puede estar viejo respecto de la base viva:
  si es de seguridad o continuidad, **se pregunta, no se afirma**.
- Si `ESTADO.md` dice `PENDIENTE REGENERAR`: **no se lee**. Se anota *"hay docs-fyd pero está marcada
  vieja"* y se sigue con lo que dicte Guido.

## Lo que la v1 NO hace — y no es un olvido

**No hay censo automático del código.** Ningún agente lee el repo para pre-llenar la E2. Las preguntas
técnicas las contesta Guido, como en greenfield. Está **diferido a propósito** (Fase 2 del SPEC): es la
pieza más cara y su consumidor —el Modo B del Arquitecto— nunca se estrenó (ADR-012).
**Se reabre si:** el Modo B tuvo su primera misión real **y** Guido contestó a mano esas preguntas en
2 relevamientos. Si estás por "completarlo" porque parece que falta: no falta.

## La mudanza en brownfield

Lo único que cambia respecto del motor: **el repo destino ya se conoce, así que la mudanza se hace
EN EL MOMENTO** al cerrar E4 con veredicto software (en greenfield queda pendiente en el TABLERO).
Qué se muda y qué no, igual que siempre — está en el motor, sección "La mudanza".

**Si el proyecto es viejo y su `/cierre` no tiene el paso 6-bis** (los montados antes de esta versión
tienen una copia instanciada y no lo reciben nunca), avisar una vez y **dar la línea para pegar**:

> *"Este proyecto no tiene el aviso del tramo 5 en su `/cierre`. Si querés que te avise solo a las 6
> semanas, pegá este paso en `.claude/skills/cierre/SKILL.md` — o dejalo así: `/relevamiento` te
> avisa igual la próxima vez que lo abras."*
