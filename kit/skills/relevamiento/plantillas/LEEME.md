# LEEME — las plantillas de `/relevamiento`

**Dos capas, y la de abajo no se toca:**

- **`_fuente/01..04-*.md`** — los 4 originales del jefe de Guido (método "Cómo Arrancar un Proyecto",
  2026-07-22). **Prístinos: no se editan NUNCA**, ni para arreglar un typo. Son la referencia contra la
  que `git diff` detecta un cambio de él, limpio y sin mezclar. Ver `SYNC.md`.
- **`1..4-*.md`** — los de trabajo. Son los mismos, más la cabecera de procedencia y las 7 celdas
  `[+fork]`. **El dossier se instancia SIEMPRE de estos, nunca de `_fuente/`.** Ver `FORK.md`.

## ⚠️ Los `{{LINEAS:N}}` NO son placeholders del kit

Los 61 `{{LINEAS:1}}` / `{{LINEAS:3}}` / `{{LINEAS:4}}` son del método del jefe: en la versión impresa
marcan **cuántos renglones dejar para escribir a mano**. Chocan de frente con la convención `{{SLOT}}`
del Arquitecto y con su regla "cero `{{` en los archivos instanciados", pero **acá se quedan igual**.

- En `_fuente/` y en estas plantillas: **quedan tal cual. No los "arregles".**
- En el dossier instanciado: la skill los reemplaza por el marcador de estado del campo
  (`[pendiente]`, el contenido, o el sello del balde). Ahí sí, cero `{{` — eso es el criterio 21.

## Los otros archivos de esta carpeta

| Archivo | Qué es |
|---|---|
| `TABLERO.md` | El save game del relevamiento — esquema YAML cerrado + 7 secciones |
| `HANDOFF.md` | El molde del handoff al Arquitecto. Se instancia al cerrar E3.5 con veredicto software |
| `INDICE.md` | Una línea por relevamiento, en la raíz de `_relevamientos/` |
| `hoja-de-campo.md` | Con quién hablar, qué preguntar, qué escuchar. Se imprime y se camina |
| `5-sirvio.md` | El documento del tramo 5, a las 4-6 semanas del primer uso |
| `FORK.md` · `SYNC.md` | Qué agrega el kit · qué hacer cuando el jefe cambie algo |
