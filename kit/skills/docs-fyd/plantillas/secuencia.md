> generado por /docs-fyd [FECHA] — se regenera, no editar a mano.

# Diagramas de secuencia — [Nombre de la aplicación]

Los 2-3 procesos de negocio más relevantes (ej.: alta de un registro, una aprobación, una notificación automática), mostrando la interacción entre usuario, frontend, backend, base de datos y servicios externos.

## [Proceso 1 — ej.: alta de un registro]

```mermaid
sequenceDiagram
    actor U as Usuario
    participant FE as Frontend
    participant API as Backend
    participant DB as Base de datos
    U->>FE: [acción]
    FE->>API: [request]
    API->>DB: [operación]
    DB-->>API: [resultado]
    API-->>FE: [respuesta]
    FE-->>U: [confirmación]
```

## [Proceso 2 — ...]

```mermaid
sequenceDiagram
    actor U as Usuario
    participant FE as Frontend
    participant API as Backend
    participant EXT as Servicio externo
    U->>FE: [acción]
    FE->>API: [request]
    API->>EXT: [llamada]
    EXT-->>API: [respuesta]
    API-->>FE: [resultado]
```
