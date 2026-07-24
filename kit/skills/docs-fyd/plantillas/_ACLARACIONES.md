<!-- CAPA HUMANA — read-only para /docs-fyd: el motor la crea si falta y ANEXA, pero NUNCA pisa ni borra lo que puso una persona. Acá vive lo que el código no sabe. -->

> ## ⚠️ NUNCA escribas una contraseña, token o clave acá
> Solo DÓNDE está guardado el acceso (gestor de contraseñas, entrada, carpeta). **Este archivo se
> commitea y se entrega a la auditora FyD.** Si respondés por texto libre, el motor te frena si detecta
> un valor de credencial — pero no dependas de eso: no lo escribas.

# Aclaraciones — [Nombre de la aplicación]

Lo que el código no puede saber y una persona resolvió: respuestas a las dudas (elegidas por opciones)
y correcciones a mano. El motor lee esto, lo funde en los artefactos, y **jamás lo pisa**.

## Respuestas a dudas

Una entrada por duda. Clave estable = `tema/artefacto + pregunta`. El motor anexa la **opción elegida**
(un hecho, sin valores de credencial), la fecha, y la evidencia de código que respondía (para caducar la
respuesta si el código cambia).

| Clave (tema · artefacto · pregunta) | Hecho (opción elegida) | Fecha | Evidencia de código |
|---|---|---|---|
| _ej.: backups · ficha-producto · ¿hay backups y dónde viven?_ | _Sí — PITR en el servicio; credencial en el gestor de contraseñas_ | _AAAA-MM-DD_ | _ninguna (no está en el repo)_ |
| _ej.: RLS · diagrama-er · ¿la base tiene RLS?_ | _Control de acceso por fila: SÍ (confirmado por operador)_ | _AAAA-MM-DD_ | _supabase/migrations/_ |

<!-- Dudas PENDIENTES de responder (parqueadas por una corrida no-interactiva, ej. la siembra del Arquitecto): -->
<!-- - [ ] tema · artefacto — pregunta -->

## Correcciones a mano

Para lo que edites directo sobre un artefacto derivado (fuera de las dudas). Cada fila es una
instrucción de re-aplicación; la columna "cómo se verificó" es la que le sube el precio al entregable.

| Fecha | Archivos | Qué se corrigió | Cómo se verificó |
|---|---|---|---|
| _AAAA-MM-DD_ | _artefacto.md_ | _qué_ | _cómo (consulta en vivo, grep, etc.)_ |
