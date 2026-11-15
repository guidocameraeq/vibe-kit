# El banco de prueba del kit

El kit contra **copias** de todos los repos de la cuenta, haciendo de dueño, sin tocar nada real. Nació en la sesión 5a del tramo
final (2026-11-15, `docs/kit-v3/BANCO-rc7.md`); se vuelve a correr en 5c y en cada vuelta del ciclo. Genérico: no sabe nombres de
repos; la lista sale de la cuenta (gh, solo lectura) y queda en `$BANCO/cuenta.json`, fuera de este repo.

## Lo inocuo (no se negocia)

- **La foto de antes y la de después** de cada carpeta real (`foto`, `comparar`): si algo cambió, va primero en el informe.
- **Todo en `$BANCO`**, un scratchpad: cada repo, un `bare` en `remotos/` y una copia en `proyectos/` con ese `bare` de origin.
  Todo push pasa por `empujar`, que se niega si el origin no cae adentro del banco. `publicar-falso.cjs` sube a una rama
  `produccion` del `bare`.
- **Sin llaves**: no se copia ningún `.env` (`andamio` saca los versionados y las skills que publican o pegan contra lo real); las
  sesiones van con `KIT_HOME_PC` de mentira, `GH_CONFIG_DIR` vacío y sin `GH_TOKEN`; las instalaciones (`pruebas`), con un HOME vacío.
  "Preparame esta PC" trae los repos con `gh-falso.cjs`, que clona de los `bare`.
- **Lo que no se aísla**: la red (las instalaciones), el login de Claude Code (las sesiones usan el `~/.claude` real para entrar) y
  Docker. Las carpetas del banco no son "de confianza" para Claude Code: las sesiones de fondo ignoran los `allow` del proyecto.

## La receta (Git Bash, desde la raíz de vibe-kit)

```bash
export BANCO=<un scratchpad>/banco PROYECTOS=<la carpeta de proyectos> KIT=<este repo>
bash pruebas/banco/banco.sh foto "$BANCO/foto-antes.txt"
bash pruebas/banco/banco.sh remotos            # todos los repos de la cuenta (o los que se nombren)
bash pruebas/banco/banco.sh sin-remoto "<carpeta real sin origin>"   # si hay
bash pruebas/banco/banco.sh armar              # el kit en el tag y el HOME de mentira
bash pruebas/banco/banco.sh preparar           # "preparame esta PC" + traer los repos
for d in "$BANCO"/proyectos/*/; do bash pruebas/banco/banco.sh andamio "$d"; done
bash pruebas/banco/banco.sh flota <los que tienen kit>      # de a uno; PLAZO=<min> para la línea 7
bash pruebas/banco/banco.sh mirar <los que no>              # la propuesta de adopción
bash pruebas/banco/banco.sh adoptar <los que no>            # con lo recomendado; las preguntas del dueño, contestadas a lo seguro
bash pruebas/banco/banco.sh sesion <repo>…                  # /inicio y un pedido chico, en Sonnet
bash pruebas/banco/banco.sh pruebas <repo>…                 # comando-setup y comando-test de la ficha
bash pruebas/banco/banco.sh noche-armar <repo>              # el publicar de mentira firmado, el módulo banco-noche sellado
bash pruebas/banco/banco.sh noche <repo>                    # el director de fondo, sin dueño; al final, /estado y las medidas
bash pruebas/banco/banco.sh foto "$BANCO/foto-despues.txt"
bash pruebas/banco/banco.sh comparar "$BANCO/foto-antes.txt" "$BANCO/foto-despues.txt"
```

## Lo que aprendió la primera corrida (para que no se repita)

- **No edites `banco.sh` mientras corre de fondo**: bash lee el archivo a medida que avanza. Corré una copia (`cp` a `$BANCO/corrida/`).
- **Una cosa pesada por vez**, y mirá la memoria de la PC antes: con 8 GB y otras sesiones vivas, la línea 7 de la flota no
  termina ni en 60 min, y un `npm ci` no termina en 20.
- `TaskStop` de una tanda de fondo no siempre corta su lazo: mirá los procesos después.
- En Git Bash, `claude -p "/inicio"` puede llegar como una ruta: las llamadas a `claude` van con `MSYS_NO_PATHCONV=1`.
