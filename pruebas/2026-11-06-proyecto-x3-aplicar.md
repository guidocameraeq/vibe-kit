# Prueba 2026-11-06 — proyecto-x3: la adopción, `--aplicar` en el clon (paso 3)

kit: 3.0.0-rc.6

- **Fecha:** 2026-11-06 · **PC:** `pc-juan` (Windows 11 Pro 10.0.26200, node v24.19.0, git 2.55.0)
- Continúa `2026-11-06-proyecto-x3-mirar.md`. Todo pasó **en el clon temporal**; no se tocó la carpeta de Juan ni se subió nada.
- Salida recortada: se omitió la última línea (`traer …`, con rutas reales) y se reemplazaron nombres y rutas.

## `adoptar --aplicar` (exit 0)

```
settings · molde+propio · mezclada (zona intacta)
hook-arranque · molde · reemplazada
hook-escritura · molde · reemplazada
hook-git-seguro · molde · reemplazada
hook-sensible · molde · reemplazada
cambios-metodo · molde · reemplazada
hooks-lib · molde · reemplazada
candado · no · apagado hasta migrar (estructura.cjs vino: barreras corre)
scripts · molde · reemplazada
inicio · molde+propio · reemplazada
cierre · molde+propio · reemplazada
githooks · molde · reemplazada
docs · molde · nueva
estado · sí · reemplazada
director-obrero · sí · reemplazada
smoke · no · no se trae
release · no · no se trae
docs-fyd · no · no se trae
check-code · molde · sin cambios (del molde v2)
.gitignore · snippet · 13 renglón(es) sumado(s)
.gitattributes · snippet · 3 renglón(es) sumado(s)
CLAUDE.md · ya hay: no se toca (la regla del tamaño la marca doctor)
docs/CHANGELOG.md · un renglón · kit 3.0.0-rc.6: adopción — piezas settings, hook-arranque, hook-escritura, hook-git-seguro, hook-sensible, cambios-metodo, hooks-lib, scripts, inicio, cierre, githooks, docs, estado, director-obrero
ficha · .claude/kit.md · kit 3.0.0-rc.6, nivel estandar · frenos, sensible y autorizado de fábrica
van dos commits, en este orden (la exención b compara la ficha con la de fábrica del árbol del padre: la ficha va sola, después):
  git add -A -- . ":(exclude).claude/kit.md" && git update-index --chmod=+x -- .githooks/pre-commit .githooks/pre-merge-commit .githooks/pre-push && git commit -m "kit: adopción 3.0.0-rc.6 (piezas)"
  git add -- .claude/kit.md && git commit -m "kit: adopción 3.0.0-rc.6 (ficha)"
después: node .claude/scripts/estructura.cjs barreras --rango 802ce4c623785cb6ec2c82b7a050fe4411422174..HEAD → verde
docs/NORTE.md tiene 5 [completar]: llenalo con Guido (lo usa el Arquitecto en B1)
```

## Los commits (hechos tal cual los dictó el adoptador, en el clon)

| Commit | Mensaje |
|---|---|
| `4f18ada` | `kit: adopción 3.0.0-rc.6 (piezas)` |
| `d90a7e6` | `kit: adopción 3.0.0-rc.6 (ficha)` |

Sobre la base `802ce4c`: **77 archivos, 19.056 renglones agregados**, todos nuevos (nada existente se modificó salvo `.gitignore`).
El clon queda `ahead 2` de origin. Git avisó "LF will be replaced by CRLF" en todos los archivos nuevos (el `.gitattributes` que trae el kit
y el `autocrlf` de Windows); no se investigó si eso genera diferencias.

## `barreras` (`node .claude/scripts/estructura.cjs barreras --rango 802ce4c…..HEAD`)

```
candado: en verde (barreras) · el rango 802ce4c62378..d90a7e674af4 · candado apagado en la ficha (piezas.candado): solo barreras
```

Exit **0, verde**: la ficha de fábrica y el commit de la adopción pasaron sin rojo. No hubo nada que aprobar.

## No hecho todavía (esperan a Juan)

- **El push a origin.** El origin es el repo de la empresa y la rama es `main`: se subirían 2 commits con 77 archivos nuevos a un repo que usa más
  gente. No se hizo; es decisión de Juan.
- **El `--traer`** a la carpeta de Juan: se va a negar mientras la carpeta tenga cambios sin commitear (4 modificados + 1 carpeta nueva).
- `docs/NORTE.md` tiene 5 `[completar]` (lo usa el Arquitecto en B1).
- La portada, `portada.cjs armar`, y la migración de cambios (`migrar-cambios.cjs`) no se corrieron: no hay registro de cambios propio, y la portada
  se deja para después del push.

## NO VERIFICADO

- Si el push funciona (credenciales y permisos de Juan en el repo de la empresa).
- Si `githooks` y el `director/obrero` andan en el proyecto: eso es el paso 4 (usarlo de verdad).
