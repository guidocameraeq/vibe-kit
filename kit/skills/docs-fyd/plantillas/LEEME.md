# docs-fyd/ — documentación técnica para la auditoría FyD

Esta carpeta la genera la skill global `/docs-fyd` DESDE el código de este repositorio. Es el
paquete que la auditora **FyD Sistemas** necesita para poder levantar el proyecto si el autor
desaparece.

## Cómo se usa

- **Regenerar**: corré `/docs-fyd` en la raíz del repo. Reescribe todo lo derivado del código.
- **Auditar antes de entregar**: corré `docs-fyd auditar` (no escribe nada) — te dice qué quedó
  viejo, qué campos de negocio faltan, y el detalle de cualquier secreto hallado.
- **Completar el negocio**: editá `_CAMPOS-NEGOCIO.md` (los 4 campos que el código no sabe).
- **Resolver dudas / aclarar**: cuando `/docs-fyd` te pregunta algo (backups, RLS, base compartida,
  tokens…), elegís la opción — tu respuesta queda en `_ACLARACIONES.md`. Ahí también anotás las
  correcciones a mano. **Eso no se pierde en la regeneración.**

## Qué NO tocar a mano

Lo derivado del código se **regenera**: si editás un artefacto derivado, la próxima corrida lo pisa
(anotá esa corrección en `_ACLARACIONES.md` para no perderla). Lo que el motor **respeta** —lo crea si
falta, lo amplía, pero NUNCA lo pisa— es **todo archivo que empieza con `_`**: `_CAMPOS-NEGOCIO.md` (la
bóveda de negocio) y `_ACLARACIONES.md` (tus respuestas por opciones + las correcciones a mano). El
`ESTADO.md` (semáforo de frescura) lo actualiza quirúrgico, no lo arrasa.

## ⚠️ Nota de desvío del método (ADR-014)

`docs-fyd/` es un **build-artifact regenerable**, EXENTO de la regla del método "lo derivable del
código no se escribe en un doc". Se justifica porque es un **entregable EXTERNO para auditores que no
leen código** — y una vista regenerada no miente: el `/cierre` la marca vieja, `/docs-fyd` la
reconstruye. Es la única excepción a esa regla en todo el método.

## 🔒 Secretos

Ningún artefacto de acá contiene un valor de credencial — solo nombres y DÓNDE están guardados. Git
es permanente: si ves un valor colado, sacalo y reescribí la historia antes de entregar a FyD.
