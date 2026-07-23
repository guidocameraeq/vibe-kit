# Referencia — Prompts de documentación técnica de FyD (encargo 2026-07)

> **Qué es esto:** el contenido tal cual del `.docx` que mandó FyD Sistemas (`Prompts_Documentacion_Tecnica.docx`),
> extraído verbatim. Es el **contrato de contenido** de la skill `/docs-fyd`: define qué secciones y campos
> lleva cada uno de los 10 artefactos por-repo, para que la sesión de construcción NO invente el formato.
>
> La sesión que construya `/docs-fyd` debe **copiar estos prompts** a `kit/skills/docs-fyd/prompts-fyd.md`
> y basar cada plantilla en ellos. Ver [SPEC-docs-fyd.md](SPEC-docs-fyd.md) (criterio de aceptación #14).
>
> **Nota de alcance:** los prompts 1-10 son por-repo (los hace `/docs-fyd`, v1). El prompt 11 (Mapa de
> servicios) y el Excel de Inventario son **Fase 2** (cross-proyecto) — ver la sección "Fase 2" del SPEC.

---

## Prompts (verbatim del .docx de FyD)

Prompts para Documentación Técnica
Para ejecutar dentro de cada repositorio, con Claude Code o herramienta equivalente
Uso
Ejecutar un repositorio por vez, con la IA operando directamente sobre el código de ese repositorio.
Cada prompt indica el archivo donde debe guardarse el resultado, dentro de la carpeta docs/ del repositorio (o en la raíz, cuando corresponde). Si la carpeta docs/ no existe, pedirle a la IA que la cree.
Revisar el resultado antes de darlo por bueno: la IA puede interpretar mal alguna parte del código.
Los diagramas se generan en formato Mermaid (texto), que GitHub renderiza automáticamente al abrir el archivo .md.
Repetir esta guía para cada aplicación del Inventario.
El Prompt 1 genera docs/ficha-producto.md con los datos funcionales de la aplicación (función, usuarios, criticidad, proceso manual alternativo). Ese archivo reemplaza a cualquier ficha en Word: se completa y se actualiza directamente en el repositorio.
1. Ficha de producto (funcional) → docs/ficha-producto.md
Generá el archivo docs/ficha-producto.md con esta estructura exacta:

# [Nombre de la aplicación]

**Función:** [completar]
**Quiénes lo utilizan:** [completar]
**Criticidad (Alta/Media/Baja):** [completar]
**Proceso manual alternativo:** [completar]
**Tecnologías:** [completar a partir del código]
**Servicios / Proveedores:** [completar a partir del código]
**Repositorio:** [nombre del repositorio y rama principal]

Completá los campos "Tecnologías", "Servicios / Proveedores" y "Repositorio" analizando el código. Dejá los demás campos tal como están, marcados [completar]: no los inventes, los tiene que completar una persona.

Guardalo en docs/ficha-producto.md.

2. README del proyecto → README.md
Actuá como ingeniero de software documentando este proyecto para alguien que no lo conoce.

Generá un archivo README.md con:
1. Qué hace la aplicación, en 2-3 oraciones.
2. Stack tecnológico.
3. Instrucciones para instalar y correr el proyecto localmente.
4. Variables de entorno necesarias (solo el nombre y para qué sirve cada una, sin valores).
5. Cómo se despliega a producción.
6. Estructura de carpetas principal.

Guardalo en la raíz del repositorio, como README.md. Escribilo en español.

3. Diagrama de Contexto (C1) → docs/c1-contexto.md
Analizá este repositorio y generá un diagrama de contexto (nivel C1 del modelo C4) en formato Mermaid.

Mostrá: el sistema como una caja central, los tipos de usuarios que interactúan con él, y los sistemas externos con los que se integra.

Agregá una breve descripción de cada relación. Guardalo en docs/c1-contexto.md.

4. Diagrama de Contenedores (C2) → docs/c2-contenedores.md
A partir del mismo repositorio, generá un diagrama de contenedores (nivel C2 del modelo C4) en formato Mermaid.

Mostrá cada contenedor desplegable por separado (frontend, backend/API, base de datos, jobs, etc.), su tecnología, y el protocolo de comunicación entre ellos.

Guardalo en docs/c2-contenedores.md.

5. Diagrama de Componentes (C3) — solo si la aplicación lo justifica → docs/c3-componentes.md
Este proyecto tiene suficiente complejidad interna como para justificar un nivel de detalle mayor.

Generá un diagrama de componentes (nivel C3 del modelo C4) del contenedor [nombre del contenedor], con sus módulos internos y cómo se relacionan.

Guardalo en docs/c3-componentes.md. Si la aplicación es simple, omitir este paso.

6. Diagramas de secuencia → docs/diagramas-secuencia.md
Identificá los procesos de negocio más relevantes de esta aplicación (2 a 3, por ejemplo: alta de un registro, una aprobación, una notificación automática).

Para cada uno, generá un diagrama de secuencia en formato Mermaid, mostrando la interacción entre usuario, frontend, backend, base de datos y otros servicios externos involucrados.

Guardalo en docs/diagramas-secuencia.md.

7. Diagrama Entidad-Relación → docs/modelo-datos-er.md
Analizá el esquema de la base de datos de este proyecto (migraciones, modelos, o el schema correspondiente) y generá un diagrama entidad-relación en formato Mermaid.

Incluí las tablas principales, sus columnas clave (primaria, foráneas y campos relevantes) y el tipo de relación entre ellas.

Guardalo en docs/modelo-datos-er.md.

8. Variables de entorno y servicios externos → docs/variables-entorno.md
Recorré el código de este repositorio y generá un listado con:

1. Todas las variables de entorno que usa la aplicación (solo el nombre, nunca el valor), indicando en qué archivo se usa cada una y para qué sirve.
2. Todos los servicios o APIs externos con los que se conecta (Supabase, OpenAI, Anthropic, Stripe, Resend, Google Maps, etc.), indicando en qué parte del código se llama a cada uno.

Guardalo en docs/variables-entorno.md.

9. Instrucciones de IA utilizadas → docs/instrucciones-ia.md
Mostrame el contenido completo de los archivos de instrucciones persistentes usados para trabajar en este proyecto (por ejemplo SOUL.md, CLAUDE.md, .cursorrules, o configuración/memoria equivalente).

Para cada uno, indicá en qué carpeta está guardado y si está versionado en este repositorio o si es un archivo solamente local.

Guardá un resumen en docs/instrucciones-ia.md. Si el archivo original no está versionado en el repositorio, agregarlo también (por ejemplo committeando una copia de SOUL.md o CLAUDE.md junto al código).

10. Revisión de variables y claves en el código → docs/revision-seguridad.md
Revisá este repositorio y detectá:

1. Credenciales, tokens o claves de API escritas directamente en el código (hardcodeadas).
2. Dependencias desactualizadas con vulnerabilidades conocidas.
3. Ausencia de un archivo .env.example que documente las variables necesarias.

Guardá el listado en docs/revision-seguridad.md, indicando archivo y línea aproximada de cada hallazgo. Esto es un relevamiento informativo: no implica que haya que corregir nada de inmediato.

11. Mapa de Aplicaciones y Servicios → Mapa_de_Servicios.md (no corresponde a un repositorio puntual)
No se ejecuta dentro de un repositorio: se le pasa a la IA el contenido completo de la hoja "Servicios y Accesos" del Excel "Inventario_Aplicaciones.xlsx" ya completa, junto con este prompt:
A partir de esta tabla de aplicaciones y servicios, generá un diagrama en formato Mermaid (tipo grafo) que muestre cada aplicación conectada a los servicios que utiliza. Agrupá visualmente los servicios que comparten la misma cuenta titular, de manera que se note claramente qué aplicaciones dependen de una misma cuenta o servicio.
Guardalo como Mapa_de_Servicios.md, junto al Excel de Inventario (no corresponde a ningún repositorio en particular, ya que cruza todas las aplicaciones).


---

## Columnas del Excel `Inventario_Aplicaciones.xlsx` (Fase 2 — referencia para el DIY desde el Kanban)

**Hoja "Inventario"** — 1 fila por aplicación:
`Aplicación | Función | Quiénes lo utilizan | Criticidad (Alta/Media/Baja) | Proceso manual alternativo | Tecnologías | Servicios/Proveedores | Repositorio (URL y rama principal) | Documentación técnica (ver docs-fyd/ del repositorio)`

**Hoja "Servicios y Accesos"** — 1 fila por combinación App + Servicio:
`Servicio/Proveedor | Aplicación | Proyecto/Instancia en el servicio | Tipo (Hosting/Base de Datos/IA-API/Repositorio/Dominio/Email) | Cuenta titular | Credenciales (solo DÓNDE está guardado el acceso, NUNCA el valor) | Observaciones`

**Definición de Criticidad (de FyD):** Alta = si falla, la operación se detiene o hay problema en menos de un día · Media = hay demoras pero se puede seguir con el proceso manual alternativo · Baja = impacto menor.

**Nota de credenciales (de FyD):** no cargar usuarios ni contraseñas; anotar solamente dónde está guardado el acceso (gestor de contraseñas, carpeta o entrada correspondiente).
