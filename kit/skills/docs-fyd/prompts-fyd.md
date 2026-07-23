# Contrato de contenido — los 10 prompts de FyD (verbatim)

> **Qué es esto:** el contenido tal cual del `.docx` que mandó FyD Sistemas
> (`Prompts_Documentacion_Tecnica.docx`, encargo 2026-07). Define **qué secciones y campos** lleva
> cada uno de los 10 artefactos por-repo. El motor `/docs-fyd` **sigue estos prompts al pie — no
> inventa el formato** (criterio de aceptación #14 del SPEC).
>
> **Dos ajustes del método sobre estos prompts (no son del `.docx`, son del SPEC):**
> 1. **Ubicación**: FyD dice guardar en `docs/`. Acá TODO va a la carpeta aislada **`docs-fyd/`**
>    (salvo el README, que va a la raíz) — para no ensuciar los `docs/` de trabajo del método.
> 2. **Nombres**: dos artefactos usan el nombre del plano, no el del `.docx`:
>    `diagramas-secuencia.md` → **`secuencia.md`** · `modelo-datos-er.md` → **`diagrama-er.md`**.
>    El resto conserva el nombre del `.docx`. El **contenido** sigue el prompt; la **ubicación y el
>    nombre** son los del SPEC.
>
> **Prompt 11** (Mapa de servicios) y el Excel de Inventario son **Fase 2** (cross-proyecto) — NO los
> hace `/docs-fyd`. Quedan abajo como referencia, tachados de v1.

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

### 1. Ficha de producto (funcional) → docs/ficha-producto.md
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

### 2. README del proyecto → README.md
Actuá como ingeniero de software documentando este proyecto para alguien que no lo conoce.

Generá un archivo README.md con:
1. Qué hace la aplicación, en 2-3 oraciones.
2. Stack tecnológico.
3. Instrucciones para instalar y correr el proyecto localmente.
4. Variables de entorno necesarias (solo el nombre y para qué sirve cada una, sin valores).
5. Cómo se despliega a producción.
6. Estructura de carpetas principal.

Guardalo en la raíz del repositorio, como README.md. Escribilo en español.

### 3. Diagrama de Contexto (C1) → docs/c1-contexto.md
Analizá este repositorio y generá un diagrama de contexto (nivel C1 del modelo C4) en formato Mermaid.

Mostrá: el sistema como una caja central, los tipos de usuarios que interactúan con él, y los sistemas externos con los que se integra.

Agregá una breve descripción de cada relación. Guardalo en docs/c1-contexto.md.

### 4. Diagrama de Contenedores (C2) → docs/c2-contenedores.md
A partir del mismo repositorio, generá un diagrama de contenedores (nivel C2 del modelo C4) en formato Mermaid.

Mostrá cada contenedor desplegable por separado (frontend, backend/API, base de datos, jobs, etc.), su tecnología, y el protocolo de comunicación entre ellos.

Guardalo en docs/c2-contenedores.md.

### 5. Diagrama de Componentes (C3) — solo si la aplicación lo justifica → docs/c3-componentes.md
Este proyecto tiene suficiente complejidad interna como para justificar un nivel de detalle mayor.

Generá un diagrama de componentes (nivel C3 del modelo C4) del contenedor [nombre del contenedor], con sus módulos internos y cómo se relacionan.

Guardalo en docs/c3-componentes.md. Si la aplicación es simple, omitir este paso.

### 6. Diagramas de secuencia → docs/diagramas-secuencia.md
Identificá los procesos de negocio más relevantes de esta aplicación (2 a 3, por ejemplo: alta de un registro, una aprobación, una notificación automática).

Para cada uno, generá un diagrama de secuencia en formato Mermaid, mostrando la interacción entre usuario, frontend, backend, base de datos y otros servicios externos involucrados.

Guardalo en docs/diagramas-secuencia.md.

### 7. Diagrama Entidad-Relación → docs/modelo-datos-er.md
Analizá el esquema de la base de datos de este proyecto (migraciones, modelos, o el schema correspondiente) y generá un diagrama entidad-relación en formato Mermaid.

Incluí las tablas principales, sus columnas clave (primaria, foráneas y campos relevantes) y el tipo de relación entre ellas.

Guardalo en docs/modelo-datos-er.md.

### 8. Variables de entorno y servicios externos → docs/variables-entorno.md
Recorré el código de este repositorio y generá un listado con:

1. Todas las variables de entorno que usa la aplicación (solo el nombre, nunca el valor), indicando en qué archivo se usa cada una y para qué sirve.
2. Todos los servicios o APIs externos con los que se conecta (Supabase, OpenAI, Anthropic, Stripe, Resend, Google Maps, etc.), indicando en qué parte del código se llama a cada uno.

Guardalo en docs/variables-entorno.md.

### 9. Instrucciones de IA utilizadas → docs/instrucciones-ia.md
Mostrame el contenido completo de los archivos de instrucciones persistentes usados para trabajar en este proyecto (por ejemplo SOUL.md, CLAUDE.md, .cursorrules, o configuración/memoria equivalente).

Para cada uno, indicá en qué carpeta está guardado y si está versionado en este repositorio o si es un archivo solamente local.

Guardá un resumen en docs/instrucciones-ia.md. Si el archivo original no está versionado en el repositorio, agregarlo también (por ejemplo committeando una copia de SOUL.md o CLAUDE.md junto al código).

### 10. Revisión de variables y claves en el código → docs/revision-seguridad.md
Revisá este repositorio y detectá:

1. Credenciales, tokens o claves de API escritas directamente en el código (hardcodeadas).
2. Dependencias desactualizadas con vulnerabilidades conocidas.
3. Ausencia de un archivo .env.example que documente las variables necesarias.

Guardá el listado en docs/revision-seguridad.md, indicando archivo y línea aproximada de cada hallazgo. Esto es un relevamiento informativo: no implica que haya que corregir nada de inmediato.

---

## Ajustes del método sobre cada prompt (lo que el motor hace distinto del `.docx`)

Los prompts de arriba son el **contrato de secciones/campos**. Estas son las 4 desviaciones que el
motor aplica encima (nacen del SPEC y su red-team) — **prevalecen sobre la letra del prompt**:

- **Prompt 1 (ficha)**: los 4 campos de negocio (función, quiénes, criticidad, proceso manual) NO
  los completa la ficha directamente — viven en la **bóveda `_CAMPOS-NEGOCIO.md`** (read-only) y
  afloran a la ficha desde ahí. El motor completa solo tecnologías/servicios/repo (del código).
- **Prompt 9 (instrucciones-ia)**: NO se copia el `CLAUDE.md` verbatim (como pide la letra "mostrame
  el contenido completo"). Se embebe **estructura + punteros** y se pasa el **cepillo anti-secretos**
  antes de escribir. Un secreto en un `CLAUDE.md` no puede terminar en un `docs-fyd/` committeado.
- **Prompt 10 (revisión-seguridad)**: el `.md` entregable lista **solo categoría + cantidad + acción
  "rotar y sacar del código"**. El `archivo:línea` (que la letra pide en el `.md`) va **únicamente al
  reporte transitorio de `docs-fyd auditar`** — nunca a un `.md` committeado. Git es permanente.
- **Todos**: se guardan en `docs-fyd/` (no `docs/`), con la cabecera de procedencia, y ninguno
  contiene un valor de credencial (cepillo en toda la superficie de escritura).

---

## ~~11. Mapa de Aplicaciones y Servicios~~ → **Fase 2, NO lo hace `/docs-fyd`**
No se ejecuta dentro de un repositorio: cruza todas las aplicaciones. Lo hará la skill
`/inventario-fyd` (cross-proyecto) cuando se construya la Fase 2. Se conserva el prompt original en
`docs/referencia-prompts-fyd.md` del repo vibe-kit. Acá queda fuera de alcance a propósito.
