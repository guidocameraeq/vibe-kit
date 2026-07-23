# docs-fyd/ — documentación técnica para la auditoría FyD

Esta carpeta la genera la skill global `/docs-fyd` DESDE el código de este repositorio. Es el
paquete que la auditora **FyD Sistemas** necesita para poder levantar el proyecto si el autor
desaparece.

## Cómo se usa

- **Regenerar**: corré `/docs-fyd` en la raíz del repo. Reescribe todo lo derivado del código.
- **Auditar antes de entregar**: corré `docs-fyd auditar` (no escribe nada) — te dice qué quedó
  viejo, qué campos de negocio faltan, y el detalle de cualquier secreto hallado.
- **Completar el negocio**: editá `_CAMPOS-NEGOCIO.md` (los 4 campos que el código no sabe).

## Qué NO tocar a mano

Todo lo demás se **regenera**: si lo editás, la próxima corrida lo pisa. Los dos únicos archivos que
el motor respeta: `_CAMPOS-NEGOCIO.md` (la bóveda de negocio) y `ESTADO.md` (el semáforo de frescura).

## ⚠️ Nota de desvío del método (ADR-014)

`docs-fyd/` es un **build-artifact regenerable**, EXENTO de la regla del método "lo derivable del
código no se escribe en un doc". Se justifica porque es un **entregable EXTERNO para auditores que no
leen código** — y una vista regenerada no miente: el `/cierre` la marca vieja, `/docs-fyd` la
reconstruye. Es la única excepción a esa regla en todo el método.

## 🔒 Secretos

Ningún artefacto de acá contiene un valor de credencial — solo nombres y DÓNDE están guardados. Git
es permanente: si ves un valor colado, sacalo y reescribí la historia antes de entregar a FyD.
