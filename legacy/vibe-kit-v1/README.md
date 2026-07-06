# vibe-kit

> Tu kit de arranque para vibe coding con Claude Code. Pensado para alguien que **NO programa** y dirige Claude en lenguaje natural desde VSCode.

## ¿Qué es esto, en criollo?

`vibe-kit` es un **plugin de Claude Code**: lo instalás una vez y, en todos tus proyectos, Claude pasa a tener un equipo de ayudantes y una serie de comandos listos para usar. No tenés que copiar y pegar prompts ni acordarte de nada técnico: escribís `/arquitecto` (o `/nueva-app`) y arranca a entrevistarte como lo haría un buen analista.

El corazón es el **Arquitecto**: un experto que **habla como vos** (español rioplatense, cero jerga), te hace preguntas de opción múltiple con una opción ya marcada como **Recomendada**, y al final **escribe el plan a un archivo** para que después Claude lo ejecute. El Arquitecto **nunca toca código** mientras planea: primero diseñan juntos, recién después se construye.

Lo importante: el kit **se acuerda por vos** de las cosas que siempre se olvidan y obligan a refactorizar tarde — roles y permisos, listas que querés editar desde un panel (sin pedirle ayuda a nadie), manejo de errores y registro de actividad (logging). Esos *dolores transversales* vienen activados por defecto.

Vive **donde ya trabajás** (VSCode + Claude Code). No hay servidores ni webs externas que mantener.

## Los comandos

Los escribís en el chat de Claude Code. Quedan agrupados bajo el nombre del plugin (por ejemplo `/vibe-kit:arquitecto`); en este README los nombro cortos.

| Comando | Para qué sirve |
|---|---|
| `/arquitecto` | El experto principal: te entrevista, propone alternativas y escribe el plan (SPEC) a disco. Nunca codea. |
| `/nueva-app` | Arranca un proyecto de cero: cuestionario corto + checklist de concerns → deja todo listo para construir. |
| `/feature` | Diseñá una funcionalidad nueva sobre una app que ya anda (entrevista + spec). |
| `/fix` | Arreglá un problema o bug con un mini-plan antes de tocar nada. |
| `/release` | Cierre prolijo: commits, versión, CHANGELOG y un PR en GitHub para revisar en castellano. |
| `/docs-check` | Revisa que la documentación no quedó vieja respecto del código real y te lo reporta. |
| `/crear-rol` | Le enseña al Arquitecto a fabricarte un comando o ayudante nuevo a medida (capacidad meta). |

## Cómo se instala

Lo hacés una sola vez, desde adentro de una sesión de Claude Code. Reemplazá `tu-usuario/vibe-kit` por **el repo de GitHub** donde tengas el kit (el primer dato es el repo; lo que va después del `@` es el **nombre del marketplace**, que sale del `marketplace.json` y es `vibe-kit-marketplace`).

1. **Agregá el marketplace** (el catálogo donde vive el plugin):
   ```
   /plugin marketplace add tu-usuario/vibe-kit
   ```
2. **Instalá el plugin:**
   ```
   /plugin install vibe-kit@vibe-kit-marketplace
   ```
3. **Activalo sin reiniciar:**
   ```
   /reload-plugins
   ```
4. **Confirmá que quedó:** escribí `/` y fijate que aparezcan los comandos `vibe-kit:` (como `/vibe-kit:arquitecto`).

¿Querés probarlo en frío, sin publicar nada todavía? Cargalo por sesión apuntando a la carpeta del kit:
```
claude --plugin-dir ./vibe-kit
```

## Quickstart (3 líneas)

1. Instalá el kit con los pasos de arriba (una sola vez).
2. En la carpeta de tu proyecto, escribí `/nueva-app` (proyecto nuevo) o `/feature` (app que ya anda) y respondé las preguntas; el Arquitecto te deja un **SPEC** escrito en disco.
3. Abrí una **sesión nueva y limpia**, decile *"ejecutá el spec"* y revisá el resultado en castellano — no el código.

## Para seguir

- **Tutoriales paso a paso** (empezá por el de instalación): [`tutoriales/`](tutoriales/)
  - [`00-instalacion.md`](tutoriales/00-instalacion.md) — instalar el kit de cero
  - [`01-primer-uso-arquitecto.md`](tutoriales/01-primer-uso-arquitecto.md) — tu primera entrevista con el Arquitecto
  - [`02-app-existente-erp.md`](tutoriales/02-app-existente-erp.md) — caso real: facturación del ERP
  - [`03-convertir-chats-en-comandos.md`](tutoriales/03-convertir-chats-en-comandos.md) — fabricar tus propios comandos
  - [`04-compactacion-y-roles.md`](tutoriales/04-compactacion-y-roles.md) — que el rol no se diluya con `/compact`
  - [`05-cuando-usar-que-orquestacion.md`](tutoriales/05-cuando-usar-que-orquestacion.md) — cuándo subagente, cuándo plan, cuándo directo
- **El plan completo del kit** (matriz de stacks, módulos transversales, riesgos): [`BLUEPRINT.md`](../BLUEPRINT.md)
