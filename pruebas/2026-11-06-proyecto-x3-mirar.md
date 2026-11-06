# Prueba 2026-11-06 — proyecto-x3: la adopción, `--mirar` (paso 3)

kit: 3.0.0-rc.6

- **Fecha:** 2026-11-06 · **PC:** `pc-juan` (Windows 11 Pro 10.0.26200, node v24.19.0, git 2.55.0, Python 3.14.7 por `py -3`)
- **Proyecto:** `proyecto-x3` — Markdown + HTML + Google Apps Script, con un `.js` y dos `.py`; sin `package.json`; sin base de datos a la vista;
  repo git en `main` con 9 commits, origin propio de la empresa. La carpeta de Juan tiene **4 archivos modificados sin commitear y 1 carpeta
  sin seguimiento** (se trabaja sobre un clon, así que no se tocan).
- Salida recortada: nombres, rutas y mensajes de commit reemplazados o omitidos (`<proyectos>`, `<temp>`, `proyecto-x3`).

## Cómo se eligió el proyecto

Se propuso `proyecto-x2` y **la carpeta no existe** en `<proyectos>` (solo había otros tres proyectos con otros nombres);
`proyecto-x1` tiene docker, drizzle y cambios sin commitear, o sea que está activo. Juan eligió `proyecto-x3` (con git y sin
skills propias en `.claude/`). **Corrección a la prueba de la rc.6:** ahí anoté que la copia de `arquitecto` de `proyecto-x2` "ya no existe";
lo que pasa es que **toda la carpeta de `proyecto-x2` no existe** (nadie borró una copia).

## Recorrido

| Qué | Resultado |
|---|---|
| La PC al día (`ultimo-tag` contra `~/.claude/VERSION`) | `v3.0.0-rc.6` = `3.0.0-rc.6`: al día |
| Clon completo del kit en `v3.0.0-rc.6` | OK |
| Clon del proyecto desde su origin (solo lectura), con `.kit-rol` = `actualizador` y excluido en `.git/info/exclude` | OK, 9 commits, limpio |
| `actualizar.cjs adoptar <clon> --kit <kit> --mirar --principal <carpeta> --propuesta <archivo>` | exit 0, **no cambió el clon** (`git status` limpio después) |

## La pantalla (`--mirar`), recortada

```
---
# ==== lo que vio el adoptador (este bloque se va al aplicar) ====
# adoptar · kit 3.0.0-rc.6 · proyecto-x3 · 2026-11-06
# nivel: estandar (inferido: hay código (un .js y dos .py; rutas omitidas); la regla: con código → estandar, sin código → liviano)
# vars: proyecto = proyecto-x3 (el nombre de tu carpeta) · sin comando-test ni comando-setup: no salen de ningún manifiesto (la sesión los suma si hay)
# comandos: setup ninguno · test ninguno
# entornos: ninguno declarado — preguntale a Guido cada base y su clase (real · prueba · dummy); sin declararla, la base de prueba cuenta como real
#   así se declaran (la gramática de kit.ejemplo.md; van en la ficha, al nivel de vars:):
#     entornos:
#       base-real:
#         clase: real
#       base-prueba:
#         clase: prueba
# herramientas: ninguna — el ejemplo de kit.ejemplo.md ("db ping") no es un comando de este proyecto: si se copia, entorno da rojo
# gitleaks: miré la historia entera — nada
# piezas (id · estado · qué pasa al aplicar):
#   settings · molde · nace
#   hook-arranque · molde · nueva
#   hook-escritura · molde · nueva
#   hook-git-seguro · molde · nueva
#   hook-sensible · molde · nueva
#   cambios-metodo · molde · nueva
#   hooks-lib · molde · nueva
#   candado · no · apagado hasta migrar; .claude/scripts/estructura.cjs viene igual: barreras corre desde ahí
#   scripts · molde · nueva
#   inicio · molde · nueva
#   cierre · molde · nueva
#   githooks · molde · nueva
#   docs · molde · nacen 8 (docs/CHANGELOG.md, docs/MAPA.md, docs/NORTE.md y 5 más); lo que ya hay en docs/ no se toca
#   estado · sí · repo con código: el módulo con director necesita /director y /obrero
#   director-obrero · sí · repo con código: el módulo con director necesita /director y /obrero
#   smoke · no · opcional: no se trae
#   release · no · opcional: no se trae
#   docs-fyd · no · opcional: se ofrece (si va, docs-fyd: sí; la skill es global y corre en la carpeta)
# trae (molde) lo base del catálogo: la ficha, inicio, cierre, el hook con tope, las barreras (settings, los hooks de escritura,
#   git-seguro y sensible, cambios-metodo, githooks), docs (solo lo que falta) y lo que eso necesita para andar (hooks-lib: la
#   usan todos los hooks; scripts: estructura, cambios, todo). No trae smoke, release ni docs-fyd.
# repo con código (estandar): trae director-obrero y estado (sí: el módulo con director necesita /director y /obrero)
# frenos, sensible y autorizado: los de fábrica del nivel estandar (así el commit de la ficha pasa barreras: exención b)
# CLAUDE.md: le falta "El tamaño del pedido" — con tu OK, --aplicar <propuesta> --claude-md la suma al final (la del molde)
# copias del kit adentro: ninguna
# v2: ni check-code.js ni session-start.sh
# reglas propias candidatas: ninguna
# registro de cambios de método: no hay
# docs-fyd: se ofrece — la documentación de auditoría FyD (si va, piezas.docs-fyd: sí)
# D4 · sensible: las cinco de sensible: quedan en no; recomendada: datos-reales con los comandos que tocan la base real — se cambia en la propuesta, como lista (p. ej. datos-reales: [sqlcmd]; "sí" no se lee: va no o los comandos, como en kit.ejemplo.md); el commit de la ficha da ROJO en barreras: ese rojo es solo en este clon, antes del push: barreras mira origin/main..HEAD y, pusheado, ningún /cierre lo vuelve a mirar; un aprobado de después no lo cubre (el sello va antes del primer commit que toca) — lo que se decidió queda en el commit y en el renglón del CHANGELOG de la adopción
# al aplicar: dos commits (las piezas, después la ficha sola: la exención b mira la fábrica en el árbol del padre; con --permisos o --arranque, un tercero: los permisos)
# ==== fin de lo que vio el adoptador ====
# Ficha del kit de proyecto-x3: la escribió el adoptador (kit 3.0.0-rc.6). frenos, sensible y autorizado: los de fábrica del nivel.
kit: 3.0.0-rc.6
nivel: estandar
vars:
  proyecto: proyecto-x3
piezas:
  settings: molde
  hook-arranque: molde
  hook-escritura: molde
  hook-git-seguro: molde
  hook-sensible: molde
  cambios-metodo: molde
  hooks-lib: molde
  candado: no
  scripts: molde
  inicio: molde
  cierre: molde
  githooks: molde
  docs: molde
  estado: sí
  director-obrero: sí
  smoke: no
  release: no
  docs-fyd: no
frenos:
  opcionales: []
  quitados: []
autorizado:
  merge-a-main: con-gate-verde
  escribir-produccion: por-comando-con-foto
sensible:
  datos-reales: no
  plata: no
  sale-afuera: no
  claves: no
  release: no
---

## Cómo se adaptó el kit a este proyecto

- Adoptado con el kit 3.0.0-rc.6 (2026-11-06): frenos, sensible y autorizado de fábrica; el candado apagado hasta migrar (corre barreras).
propuesta escrita en <temp>/propuesta-x3.md — la sesión la muestra, la ajusta con Guido y corre --aplicar
```

## Las decisiones que mostró (D1 a D4 y lo demás) y qué eligió Juan

| Punto | Lo que mostró | Eligió Juan |
|---|---|---|
| ¿Seguir? | nivel `estandar`; trae hooks, inicio/cierre, director/obrero, githooks y 8 documentos nuevos en `docs/` (no existe) | **Sí, aplicar solo en el clon**, sin subir nada |
| D1 (director, `/inicio` o `/cierre` propios) | no aparece: el proyecto no tenía | no aplica |
| D2 (permisos del `settings.json`) y D3 (arranque propio) | no aparecen: no había `.claude/` | no aplica (sin `--permisos` ni `--arranque`) |
| `entornos:` ninguno declarado | pregunta cada base y su clase | **No tiene ninguna base de datos** → sin entornos |
| D4 (las cinco de `sensible:`) | de fábrica en no; `datos-reales` recomendada solo si hay base | las cinco quedan en **no** |
| `papeles:` (`carpeta-docs:`) | `docs/` no existe, así que nace; los muchos `.md` sueltos de la raíz no se tocan | sin cambios |
| `--claude-md` ("El tamaño del pedido") | el `CLAUDE.md` no la tiene | **No por ahora**: el `CLAUDE.md` local de Juan tiene cambios sin commitear que no están en el clon |
| `comandos:` | setup ninguno · test ninguno | sin comandos de test |
| `docs-fyd` | se ofrece | no (queda `no`) |

## NO VERIFICADO

- Si de verdad el proyecto no usa ninguna base de datos: es lo que dijo Juan, no se miró dentro de los scripts de Apps Script.
- El `sale-afuera` de `sensible:` queda en no porque el proyecto no trae comandos que manden algo afuera; el proyecto sí manda
  mensajes, pero los manda una herramienta externa, no un comando del repo (esto último es lo que se vio en los nombres de
  archivos, no se verificó en el contenido).
