#!/bin/bash
# kit/ ↔ ~/.claude/ — compara (default) o sincroniza las 7 rutas canónicas y VERSION.
#   bash .claude/scripts/kit-sync.sh          → diff (lo usa /inicio)
#   bash .claude/scripts/kit-sync.sh sync     → copia kit/ → ~/.claude/ y después diff (lo usa /cierre)
# La línea "Carpeta de proyectos de esta máquina" del Arquitecto es de cada PC (ADR-023):
# el diff la ignora y el sync la conserva. Sale con 1 si algo no da limpio.
set -u
P="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
H="$HOME/.claude"
SKILLS="skills/arquitecto skills/arquitecto-skills skills/docs-fyd skills/relevamiento skills/reflexion skills/buzon"
LINEA='^\*\*Carpeta de proyectos de esta máquina\*\*'
ARQ="$H/skills/arquitecto/SKILL.md"

if [ "${1:-diff}" = sync ]; then
  # la ruta de esta PC = lo que está entre los primeros `...` de la línea instalada (si no es el lugar vacío)
  ruta=$(grep -m1 "$LINEA" "$ARQ" 2>/dev/null | cut -d'`' -f2)
  [ "$ruta" = "{{CARPETA_DE_PROYECTOS}}" ] && ruta=""
  for r in $SKILLS; do mkdir -p "$H/$r"; cp -r "$P/kit/$r/." "$H/$r/"; done
  # Lo que el kit retiró (un git mv a legacy/, D8r.1 2026-11-03): se borra de ~/.claude SOLO si alguna vez fue un archivo del kit
  # en el historial de git; lo que no viene del kit (algo de esta PC) no se toca.
  for r in $SKILLS; do
    (cd "$H/$r" && find . -type f) | sed 's|^\./||' | while IFS= read -r f; do
      [ -e "$P/kit/$r/$f" ] && continue
      if [ -n "$(git -C "$P" log -1 --format=%h -- "kit/$r/$f" 2>/dev/null)" ]; then rm -f "$H/$r/$f" && echo "retirado de ~/.claude: $r/$f"; fi
    done
    find "$H/$r" -mindepth 1 -type d -empty -delete 2>/dev/null
  done
  mkdir -p "$H/agents"; cp "$P/kit/agents/redteam-spec.md" "$H/agents/"
  cp "$P/kit/VERSION" "$H/VERSION"
  if [ -n "$ruta" ]; then
    # mete la ruta en el primer {{CARPETA_DE_PROYECTOS}} de esa línea (sin regex: la ruta puede traer barras o &)
    R="$ruta" awk 'BEGIN { r = ENVIRON["R"] } index($0, "**Carpeta de proyectos de esta máquina**") == 1 {
        t = "{{CARPETA_DE_PROYECTOS}}"; i = index($0, t)
        if (i) $0 = substr($0, 1, i - 1) r substr($0, i + length(t)) }
      {print}' "$ARQ" > "$ARQ.tmp" && mv "$ARQ.tmp" "$ARQ"
    echo "sync hecho — carpeta de proyectos de esta PC conservada: $ruta"
  else
    echo "sync hecho — ⚠️ esta PC no tenía carpeta de proyectos: completá la línea en $ARQ"
  fi
fi

sucio=0
for r in $SKILLS agents/redteam-spec.md VERSION; do
  if out=$(diff -r -I "$LINEA" "$P/kit/$r" "$H/$r" 2>&1); then
    echo "✓ $r"
  else
    echo "✗ $r"; echo "$out"; sucio=1
  fi
done
[ "$(grep -m1 "$LINEA" "$ARQ" 2>/dev/null | cut -d'`' -f2)" = "{{CARPETA_DE_PROYECTOS}}" ] && { echo "⚠️ la carpeta de proyectos de esta PC está sin completar ($ARQ)"; sucio=1; }
# Los hooks de la PC (~/.claude/hooks/kit/) no los copia este script: los instala "instalar hooks por PC", que escribe el
# settings.json de la PC y por eso lo corre el dueño. Pero si quedaron en otra versión que el kit, acá se dice (el banco de la
# rc.7, B2: el kit en rc.7, los hooks de la PC en rc.6 y este script decía LIMPIO sin una palabra). Es un aviso: no cambia la
# salida, porque arreglarlo no es de esta sesión.
INST="$H/hooks/kit/INSTALADO"
vk=$(tr -d '\r\n' < "$P/kit/VERSION")
aviso=""
if [ -f "$INST" ]; then
  vh=$(grep -m1 '^kit:' "$INST" | sed 's/^kit:[[:space:]]*//' | tr -d '\r')
  [ "$vh" != "$vk" ] && aviso="los hooks de la PC son del kit ${vh:-?} y el kit es $vk"
else
  aviso="esta PC no tiene instalados los hooks del kit"
fi
[ -n "$aviso" ] && echo "⚠️ $aviso — falta: instalar hooks por PC (lo corre el dueño)"
if [ $sucio = 0 ]; then
  [ -n "$aviso" ] && echo "kit ↔ ~/.claude: LIMPIO (con un aviso: los hooks de la PC)" || echo "kit ↔ ~/.claude: LIMPIO"
else
  echo "kit ↔ ~/.claude: SUCIO — frenar y mirar antes de pisar nada"
fi
exit $sucio
