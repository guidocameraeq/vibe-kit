# TABLERO — {{titulo}}

<!-- El save game. Lo leen CUATRO consumidores: la propia skill al retomar, el Arquitecto,
     el /cierre del proyecto y el tramo 5. El esquema de abajo es CERRADO: no inventes claves. -->

```yaml
titulo:      {{titulo}}                # texto libre, se puede cambiar cuando quiera
slug:        {{slug}}                  # AAAA-MM-... — NUNCA se renombra
ruta_base:   {{ruta_base}}             # ruta absoluta de la carpeta de proyectos
caracter:    laboral                   # laboral | personal — "personal" apaga el asimétrico
carril:      greenfield                # greenfield | brownfield
proyecto:    -                         # ruta del repo | -   (lo escribe la mudanza)
etapa:       E1                        # E1 | E2 | E3 | E3.5 | E4
e3_cerrada:  no                        # fecha | no
apto:        SI                        # SI | NO — <razón>  (NO = el supuesto riesgoso se cayó sin resolver)
chequeo:     -                         # - | PENDIENTE | <fecha>   (el tramo 5)
```

## Roles
<!-- La lista estructurada extraída de 02:24. N = largo de esta lista. Una línea por rol.
     Estado: `pendiente` | `relevado por <notas/persona.md>`. Si queda vacía o genérica
     ("varios", "el equipo"), el asimétrico NO se apaga: la mitad de 02:24 va SIN RESPONDER. -->
- (sin roles todavía)

## Casillas
<!-- Las 7 de la clasificación, tildadas o no, con la cita que la pre-tildó. -->
- [ ] Toca plata · [ ] Datos sensibles · [ ] Terceros · [ ] Reemplaza proceso manual
- [ ] Muchos usuarios · [ ] Corre solo · [ ] Maneja archivos

## Lentes
<!-- Estado por lente: `no disparada` (se re-evalúa) | `en banco` | `preguntada` |
     `bajada <fecha>` (NO vuelve nunca) | `silenciada`. Con su cita del dossier. -->
| Lente | Estado | Cita que la disparó |
|---|---|---|

## Hoja de campo
<!-- Lo derivado a caminar: pregunta reformulada · a quién · para qué campo · estado. -->

## Tareas de Guido
<!-- Lo que quedó pendiente de él (sacar un listado, llamar al proveedor, probar el supuesto). -->

## Descartados
<!-- Lo evaluado y descartado CON su razón y su número. El Arquitecto no lo re-propone. -->

## Etapas y PDF
<!-- DERIVADO: es una foto con fecha, NUNCA gana sobre los sellos de los .md ni sobre el disco.
     El contador se re-deriva en cada apertura y antes de cada emisión. -->
| Etapa | Estado | PDF | Foto del contador (fecha) |
|---|---|---|---|
| E1 | abierta | — | — |
| E2 | — | — | — |
| E3 | — | — | — |
| E4 | — | — | — |

## Bitácora
<!-- Una línea por sesión: fecha · qué pasó · qué quedó abierto. -->
