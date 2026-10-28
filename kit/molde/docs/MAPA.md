# MAPA — {{PROYECTO}}

> Cómo se conecta, en una pantalla (tope 5.000 bytes). Opcional: si el proyecto no tiene módulos ni conexiones, borrá este archivo. La arquitectura a fondo va a `referencia/ARCHITECTURE.md`; acá se apunta.

## Por dentro
Módulos, base y servicios, a nivel módulos (no clases):

```mermaid
flowchart LR
  A[{{MODULO_A}}] --> B[{{MODULO_B}}]
  B --> C[({{BASE_O_SERVICIO}})]
```

## Con otras apps
Los acuerdos vigentes, cortos: qué comparte, quién escribe qué. La historia de mensajes no va acá.

| App | Qué comparte | Quién escribe |
|---|---|---|
| {{APP}} | {{QUE_COMPARTE}} | {{QUIEN_ESCRIBE}} |
