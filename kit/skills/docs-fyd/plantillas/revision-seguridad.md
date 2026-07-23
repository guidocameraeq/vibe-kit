> generado por /docs-fyd [FECHA] — se regenera, no editar a mano.
> Relevamiento informativo (no implica corregir de inmediato). Este entregable NO incluye `archivo:línea`: ese detalle sale solo en `docs-fyd auditar` (en pantalla, transitorio).

# Revisión de variables y claves en el código — [Nombre de la aplicación]

| Categoría | Cantidad | Acción recomendada |
|---|---|---|
| Credenciales / tokens / API keys hardcodeadas | [N] | rotar y sacar del código (mover a variables de entorno) |
| Dependencias con vulnerabilidades conocidas | [N] | actualizar a versión parchada |
| Ausencia de `.env.example` | sí / no | crear un `.env.example` con los nombres de variables (sin valores) |

_El detalle `archivo:línea` de cada hallazgo se ve con `docs-fyd auditar` — nunca queda en un archivo committeado (git es permanente)._
