#!/usr/bin/env bash
# banco.sh — el banco de prueba del kit (tramo final de la v3.0, sesión 5a; se vuelve a correr en 5c y en cada vuelta del ciclo).
#
# Hace de dueño, con el kit, sobre COPIAS de los repos de la cuenta, y nunca toca lo real. Genérico: no sabe nombres de repos
# ni de clientes; la lista sale de la cuenta (gh, solo lectura) y queda en $BANCO/cuenta.json, fuera de este repo.
#
# Variables (todas obligatorias salvo TAG):
#   BANCO      la carpeta del banco: tiene que estar adentro de un scratchpad o de una carpeta llamada banco, y fuera de PROYECTOS
#   PROYECTOS  la carpeta de proyectos REAL de la PC (solo se lee: la foto y el origen de los clones)
#   KIT        un clon del kit (vibe-kit) con sus tags; TAG el tag a probar (por defecto, el de $KIT/kit/VERSION)
#
#   banco.sh foto <archivo>             la foto de cada carpeta real: HEAD, rama, git status --porcelain, stash, worktrees
#   banco.sh comparar <antes> <después> sale 1 si algo de lo real cambió (eso va primero en el informe)
#   banco.sh remotos [<dueño/repo>…]    cuenta.json con el gh real (solo lectura) y un `bare` por repo en $BANCO/remotos/:
#                                       de la carpeta real si hay una con ese origin, si no de GitHub. Sin argumentos: todos
#   banco.sh sin-remoto <carpeta real>  un repo local sin origin: su copia va a $BANCO/proyectos/, sin remoto
#   banco.sh armar                      el kit en el tag ($BANCO/kit-tag) y el HOME de mentira ($BANCO/home, $BANCO/gh-vacio)
#   banco.sh preparar                   "preparame esta PC" con el HOME de mentira y trayendo TODOS los repos con el gh falso
#   banco.sh andamio <carpeta>          en una copia: saca los .env versionados (no los .example) y las skills que publican
#                                       (release, deploy, publish…), commit "andamio del banco" y push al bare
#   banco.sh empujar <carpeta> [args]   git push, solo si el origin cae adentro de $BANCO (si no, se niega y sale 3)
#   banco.sh entorno                    imprime los export del HOME de mentira (para las sesiones: eval "$(banco.sh entorno)")
#
# Lo inocuo (no se negocia): nada se clona con escritura hacia lo real; todo push pasa por `empujar`; no se copia ningún .env; las
# sesiones van con KIT_HOME_PC=$BANCO/home, GH_CONFIG_DIR vacío y sin GH_TOKEN. Lo que no se aísla (la red, el login de Claude Code,
# Docker) lo dice el informe.
set -u
AQUI="$(cd "$(dirname "$0")" && pwd)"

falta() { echo "banco: falta $1" >&2; exit 2; }
[ -n "${BANCO:-}" ] || falta "BANCO"
[ -n "${PROYECTOS:-}" ] || falta "PROYECTOS"
BANCO="$(cd "$BANCO" 2>/dev/null && pwd || echo "$BANCO")"
PROYECTOS="$(cd "$PROYECTOS" && pwd)"
case "$BANCO/" in "$PROYECTOS"/*) echo "banco: BANCO no puede estar adentro de PROYECTOS" >&2; exit 2;; esac
case "$BANCO" in *scratchpad*|*/banco|*/banco/*) ;; *) echo "banco: BANCO tiene que estar en un scratchpad o en una carpeta banco" >&2; exit 2;; esac

norm() { # una URL de origin, normalizada: sin usuario, sin .git, https://host/x, en minúsculas
  printf '%s' "$1" | sed -E 's#^git@([^:]+):#https://\1/#; s#^(https?://)[^@/]+@#\1#; s#\.git$##; s#/$##' | tr 'A-Z' 'a-z'
}
absoluta() { # una ruta, absoluta y en una sola forma (en Git Bash, /tmp y C:\… son la misma carpeta: cygpath -m las iguala)
  local r; r="$(cd "$1" 2>/dev/null && pwd -P)" || return 1
  if command -v cygpath >/dev/null 2>&1; then cygpath -m "$r" | tr 'A-Z' 'a-z'; else printf '%s' "$r"; fi
}
adentro() { # $1 una URL o ruta: ¿cae adentro de $BANCO?
  local u="$1" r b
  case "$u" in *://*|*@*:*) return 1;; esac
  r="$(absoluta "$u")" || return 1
  b="$(absoluta "$BANCO")" || return 1
  case "$r/" in "$b"/*) return 0;; *) return 1;; esac
}
carpetas() { # las carpetas de repo de PROYECTOS (nivel 1, y nivel 2 dentro de las que no son repo)
  local d e
  for d in "$PROYECTOS"/*/; do
    d="${d%/}"
    if [ -e "$d/.git" ]; then echo "$d"
    else for e in "$d"/*/; do e="${e%/}"; [ -e "$e/.git" ] && echo "$e"; done
    fi
  done
}

foto() {
  local out="$1" d
  : > "$out"
  for d in "$PROYECTOS"/*/; do d="${d%/}"; [ -e "$d/.git" ] || echo "== ${d#$PROYECTOS/} · sin git · $(ls -A "$d" 2>/dev/null | wc -l) entradas" >> "$out"; done
  carpetas | while read -r d; do
    {
      echo "== ${d#$PROYECTOS/}"
      echo "HEAD $(git -C "$d" rev-parse HEAD 2>/dev/null || echo '(sin commits)')"
      echo "rama $(git -C "$d" branch --show-current 2>/dev/null)"
      echo "origin $(git -C "$d" remote get-url origin 2>/dev/null || echo '(sin origin)')"
      echo "stash $(git -C "$d" stash list 2>/dev/null | wc -l)"
      echo "worktrees $(git -C "$d" worktree list --porcelain 2>/dev/null | grep -c '^worktree ')"
      echo "refs $(git -C "$d" for-each-ref --format='%(refname) %(objectname)' 2>/dev/null | sha1sum | cut -c1-12)"
      git -C "$d" status --porcelain 2>/dev/null | sed 's/^/status /'
    } >> "$out"
  done
  echo "foto: $(grep -c '^== ' "$out") carpetas → $out"
}

comparar() {
  if diff -u "$1" "$2" > "$BANCO/foto-diff.txt"; then echo "comparar: nada de lo real cambió"; return 0; fi
  echo "comparar: ALGO DE LO REAL CAMBIÓ (ver $BANCO/foto-diff.txt):"; sed -n '1,60p' "$BANCO/foto-diff.txt"; return 1
}

remotos() {
  mkdir -p "$BANCO/remotos"
  local login orgs
  login="$(gh api user --jq .login)" || { echo "remotos: gh no anda" >&2; return 1; }
  orgs="$(gh api user/orgs --jq '.[].login')"
  {
    echo "{\"login\":\"$login\",\"orgs\":[$(printf '%s\n' $orgs | sed '/^$/d; s/.*/"&"/' | paste -sd,)],\"repos\":["
    for o in "$login" $orgs; do gh repo list "$o" --limit 1000 --json nameWithOwner,url,isPrivate,isArchived,isFork,diskUsage,pushedAt,isEmpty --jq '.[] | tojson'; done | paste -sd,
    echo "]}"
  } > "$BANCO/cuenta.json"
  local lista
  if [ $# -gt 0 ]; then lista="$*"; else lista="$(node -e "for(const r of require(process.argv[1]).repos)console.log(r.nameWithOwner)" "$BANCO/cuenta.json")"; fi
  local mapa; mapa="$(carpetas | while read -r d; do u="$(git -C "$d" remote get-url origin 2>/dev/null)" && echo "$(norm "$u")	$d"; done)"
  for n in $lista; do
    local bare="$BANCO/remotos/${n/\//__}.git" src
    if [ -d "$bare" ]; then echo "$n · ya está"; continue; fi
    src="$(printf '%s\n' "$mapa" | awk -F'\t' -v k="$(norm "https://github.com/$n")" '$1==k{print $2; exit}')"
    if [ -n "$src" ]; then
      git clone --quiet --bare -c core.longpaths=true "$src" "$bare" && echo "$n · de la carpeta real (${src#$PROYECTOS/})"
      # el HEAD del bare sale de la rama en que está la carpeta: que sea la rama por defecto de la cuenta, si la carpeta la tiene
      local def; def="$(gh repo view "$n" --json defaultBranchRef --jq .defaultBranchRef.name 2>/dev/null)"
      [ -n "$def" ] && git -C "$bare" rev-parse --verify --quiet "refs/heads/$def" >/dev/null && git -C "$bare" symbolic-ref HEAD "refs/heads/$def"
    else
      gh repo clone "$n" "$bare" -- --quiet --bare -c core.longpaths=true && echo "$n · de GitHub"
    fi
    [ -d "$bare" ] && git -C "$bare" remote remove origin 2>/dev/null
  done
}

sin_remoto() {
  local src; src="$(cd "$1" && pwd)"
  local dst="$BANCO/proyectos/local__$(basename "$src" | tr ' ' '-')"
  [ -e "$dst" ] && { echo "sin-remoto: ya está $dst"; return 0; }
  git clone --quiet -c core.longpaths=true "$src" "$dst" && git -C "$dst" remote remove origin && echo "sin-remoto · ${src#$PROYECTOS/} → $dst (sin origin)"
}

armar() {
  local kit="${KIT:?falta KIT}" tag="${TAG:-v$(cat "${KIT}/kit/VERSION")}"
  if [ ! -d "$BANCO/kit-tag" ]; then
    git clone --quiet "$kit" "$BANCO/kit-tag" && git -C "$BANCO/kit-tag" -c advice.detachedHead=false checkout --quiet "$tag" || return 1
  fi
  mkdir -p "$BANCO/home" "$BANCO/gh-vacio" "$BANCO/proyectos"
  echo "armar · kit en $tag ($(git -C "$BANCO/kit-tag" describe --tags)) · home de mentira $BANCO/home"
}

entorno() {
  echo "export KIT_HOME_PC='$BANCO/home' GH_CONFIG_DIR='$BANCO/gh-vacio' BANCO='$BANCO'; unset GH_TOKEN GITHUB_TOKEN GH_ENTERPRISE_TOKEN"
}

preparar() {
  eval "$(entorno)"
  local s="$BANCO/kit-tag/kit/skills/arquitecto-skills/scripts"
  echo "== preparar-pc --plan"; node "$s/preparar-pc.cjs" --kit "$BANCO/kit-tag" --home "$BANCO/home" --proyectos "$BANCO/proyectos" --plan; echo "salida $?"
  echo "== preparar-pc"; node "$s/preparar-pc.cjs" --kit "$BANCO/kit-tag" --home "$BANCO/home" --proyectos "$BANCO/proyectos"; echo "salida $?"
  echo "== traer-repos listar"; node "$s/traer-repos.cjs" listar --proyectos "$BANCO/proyectos" --gh "$AQUI/gh-falso.cjs" | tee "$BANCO/traer-listar.txt"; echo "salida ${PIPESTATUS[0]}"
  local para n; para="$(grep ' · para traer$' "$BANCO/traer-listar.txt" | sed -E 's/^ +//; s/ · para traer$//' | while read -r n; do [ -d "$BANCO/remotos/${n/\//__}.git" ] && echo "$n"; done)"
  echo "== traer-repos clonar ($(echo "$para" | wc -w) repos)"; node "$s/traer-repos.cjs" clonar $para --proyectos "$BANCO/proyectos" --gh "$AQUI/gh-falso.cjs"; echo "salida $?"
  for d in "$BANCO"/proyectos/*/; do d="${d%/}"; o="$(git -C "$d" remote get-url origin 2>/dev/null)" || continue
    adentro "$o" || { echo "preparar: $d tiene un origin FUERA del banco ($o): lo saco"; git -C "$d" remote remove origin; }
  done
}

andamio() {
  local d; d="$(cd "$1" && pwd)"
  case "$d/" in "$BANCO"/*) ;; *) echo "andamio: $d no está en el banco" >&2; return 2;; esac
  local fuera
  fuera="$(git -C "$d" ls-files | grep -E '(^|/)\.env(\.[^/]*)?$' | grep -vE '\.(example|sample|template)$|\.env\.(example|sample|template)')"
  fuera="$fuera
$(git -C "$d" ls-files | grep -E '^\.claude/(skills|commands)/[^/]*(release|deploy|publish|publicar|desplegar|smoke|humo)[^/]*(/|$)' | sed -E 's#^(\.claude/(skills|commands)/[^/]+).*#\1#' | sort -u)"
  fuera="$(printf '%s\n' "$fuera" | sed '/^$/d' | sort -u)"
  if [ -z "$fuera" ]; then echo "andamio · ${d#$BANCO/} · nada que sacar"; return 0; fi
  printf '%s\n' "$fuera" | while read -r f; do git -C "$d" rm -r --quiet -- "$f"; done
  git -C "$d" -c user.name=banco -c user.email=banco@localhost commit --quiet --no-verify -m "andamio del banco: fuera los .env versionados y las skills que publican o pegan contra lo real" \
    && echo "andamio · ${d#$BANCO/} · saqué: $(printf '%s ' $fuera)"
  empujar "$d" --quiet origin HEAD
}

empujar() {
  local d="$1"; shift
  local o; o="$(git -C "$d" remote get-url origin 2>/dev/null)" || { echo "empujar: ${d#$BANCO/} sin origin, no subo nada"; return 0; }
  adentro "$o" || { echo "empujar: el origin de $d ($o) NO está en el banco: me niego" >&2; return 3; }
  git -C "$d" push "$@"
}

eq() { echo "$BANCO/home/.claude/skills/arquitecto-skills/scripts"; } # el Equipador que instaló "preparame esta PC" en el HOME de mentira

flota() { # banco.sh flota <carpeta de $BANCO/proyectos>… — de a uno, cada uno con su log en $BANCO/salidas/
  eval "$(entorno)"; mkdir -p "$BANCO/salidas"
  local n d o
  for n in "$@"; do
    d="$BANCO/proyectos/$n"; o="$(git -C "$d" remote get-url origin 2>/dev/null)"
    adentro "$o" || { echo "flota · $n · el origin no está en el banco: no lo corro"; continue; }
    echo "flota · $n · empieza $(date '+%T')"
    ( cd "$d" && time node "$(eq)/actualizar.cjs" flota "$d" --canon "$BANCO/kit-tag" --tag "${TAG:-v$(cat "$BANCO/kit-tag/kit/VERSION")}" --proyectos "$BANCO/proyectos" ${PLAZO:+--plazo "$PLAZO"} ) > "$BANCO/salidas/flota-$n.log" 2>&1
    echo "flota · $n · salió $? · $(date '+%T') · $(grep -m1 -E "^\| *$n|$n +\|" "$BANCO/salidas/flota-$n.log" | cut -c1-200)"
    git -C "$d" pull --quiet --ff-only 2>/dev/null
  done
}

mirar() { # banco.sh mirar <carpeta>… — la propuesta de adopción (no cambia nada), como el paso 1 del anexo de la flota
  eval "$(entorno)"; mkdir -p "$BANCO/salidas" "$BANCO/propuestas"
  local n
  for n in "$@"; do
    node "$(eq)/actualizar.cjs" adoptar "$BANCO/proyectos/$n" --kit "$BANCO/kit-tag" --mirar --principal "$BANCO/proyectos/$n" \
      --propuesta "$BANCO/propuestas/$n.md" > "$BANCO/salidas/mirar-$n.log" 2>&1
    echo "mirar · $n · salió $?"
  done
}

adoptar() { # banco.sh adoptar <carpeta>… — la adopción con lo recomendado en cada pregunta (D1 A, D2 y D3 recomendadas, la sección
  # del tamaño en el CLAUDE.md), como el paso 3 y 4 del anexo de la flota: un clon aparte, --aplicar, los commits que imprime tal
  # cual, barreras, push al bare, --traer a la copia y --verificar. La propuesta es la de `mirar`, sin tocar (el dueño no contestó
  # entornos ni sensible: eso queda contado como "preguntó").
  eval "$(entorno)"; mkdir -p "$BANCO/salidas" "$BANCO/tmp"
  local n d t o log
  for n in "$@"; do
    d="$BANCO/proyectos/$n"; t="$BANCO/tmp/$n"; log="$BANCO/salidas/adoptar-$n.log"
    o="$(git -C "$d" remote get-url origin 2>/dev/null)"
    rm -rf "$t"
    # el clon, de su origin; sin remoto, de la carpeta misma (su origin es la copia, adentro del banco). Con core.longpaths: el
    # anexo de la flota clona sin él, y en Windows un repo con rutas largas no llega a sacarse (el banco lo vio)
    if [ -n "$o" ]; then adentro "$o" || { echo "adoptar · $n · origin fuera del banco: no"; continue; }; git clone --quiet -c core.longpaths=true "$o" "$t"
    else git clone --quiet -c core.longpaths=true "$d" "$t"; fi
    echo actualizador > "$t/.kit-rol"; echo .kit-rol >> "$t/.git/info/exclude"
    git -C "$t" config user.name banco; git -C "$t" config user.email banco@localhost
    local antes; antes="$(git -C "$t" rev-parse HEAD 2>/dev/null)"
    # Las preguntas de la ficha (¿?) son del dueño: el banco contesta lo más seguro (publicar: no; lo demás, lo de fábrica que
    # ya está abajo) y lo cuenta como "preguntó".
    # Y si docs/ es de otra cosa, la carpeta de papeles: el banco elige `metodo` (como lo haría el dueño con la sesión).
    local prop="$BANCO/propuestas/$n.md" resp="$BANCO/propuestas/$n.contestada.md"
    cp "$prop" "$resp"
    if grep -q '^ *# ¿? ' "$resp"; then
      echo "adoptar · $n · preguntó: $(grep -oE '^ *# ¿\? [a-z-]+' "$resp" | sed -E 's/.*¿\? //' | paste -sd, -)"
      sed -i -E 's/^( *)# ¿\? publicar .*/\1publicar: no/; /^ *# ¿\? /d' "$resp"
    fi
    if grep -q '^# papeles: docs/ ya .*escribí carpeta-docs' "$resp" && ! grep -q '^carpeta-docs:' "$resp"; then
      echo "adoptar · $n · preguntó: carpeta-docs (docs/ es del proyecto)"; sed -i -E 's/^vars:$/carpeta-docs: metodo\nvars:/' "$resp"
    fi
    prop="$resp"
    {
      echo "== aplicar"; ( cd "$t" && node "$(eq)/actualizar.cjs" adoptar "$t" --kit "$BANCO/kit-tag" --aplicar "$prop" \
        --principal "$d" --director kit --permisos recomendada --arranque kit --claude-md ); echo "salida $?"
    } > "$log" 2>&1
    if ! grep -q '^salida 0$' "$log"; then echo "adoptar · $n · --aplicar no salió 0 ($(grep -m1 -iE 'no |niego|✗|falta' "$log" | cut -c1-160))"; continue; fi
    {
      echo "== commits"
      sed -n -E '/^van? .*commits?/,/^después:/p' "$log" | grep -E '^  git ' | while read -r linea; do echo "\$ $linea"; ( cd "$t" && eval "$linea" ) || echo "FALLÓ: $linea"; done
      echo "== barreras"; ( cd "$t" && node .claude/scripts/estructura.cjs barreras --rango "${antes:-HEAD~3}..HEAD" ); echo "salida $?"
      echo "== push"; if [ -n "$o" ]; then empujar "$t" --quiet origin HEAD; echo "salida $?"; else echo "sin remoto: no hay push"; fi
      echo "== traer"; ( cd "$d" && node "$(eq)/actualizar.cjs" adoptar "$t" --traer "$d" ); echo "salida $?"
    } >> "$log" 2>&1
    echo "adoptar · $n · $(grep -c '^FALLÓ' "$log") commits fallados · barreras $(sed -n '/^== barreras/,/^salida/p' "$log" | tail -1) · traer $(sed -n '/^== traer/,$p' "$log" | grep '^salida' | tail -1)"
  done
}

var_ficha() { # $1 carpeta, $2 la var: lo que dice vars.<var> de su ficha (con la lib del kit que trae el repo)
  node -e "try{const F=require(process.argv[1]+'/.claude/hooks/lib/ficha.cjs');const v=F.leerArchivo(process.argv[1]+'/.claude/kit.md').datos.vars||{};process.stdout.write(String(v[process.argv[2]]||''))}catch(e){}" "$1" "$2"
}

pruebas() { # banco.sh pruebas <carpeta>… — el comando-setup y el comando-test de su ficha, de a uno, con un HOME vacío y sin llaves
  eval "$(entorno)"; mkdir -p "$BANCO/salidas" "$BANCO/home-vacio"
  local n d s t
  for n in "$@"; do
    d="$BANCO/proyectos/$n"; s="$(var_ficha "$d" comando-setup)"; t="$(var_ficha "$d" comando-test)"
    [ -n "$t" ] || { echo "pruebas · $n · la ficha no trae comando-test"; continue; }
    {
      echo "== setup: ${s:-(ninguno)}"
      [ -n "$s" ] && ( cd "$d" && HOME="$BANCO/home-vacio" USERPROFILE="$BANCO/home-vacio" npm_config_userconfig="$BANCO/home-vacio/.npmrc" timeout 1200 bash -c "$s" ); echo "salida $?"
      echo "== test: $t"
      ( cd "$d" && HOME="$BANCO/home-vacio" USERPROFILE="$BANCO/home-vacio" npm_config_userconfig="$BANCO/home-vacio/.npmrc" timeout 1200 bash -c "$t" ); echo "salida $?"
    } > "$BANCO/salidas/pruebas-$n.log" 2>&1
    echo "pruebas · $n · setup $(sed -n '/^== setup/,/^salida/p' "$BANCO/salidas/pruebas-$n.log" | tail -1) · test $(tail -1 "$BANCO/salidas/pruebas-$n.log")"
  done
}

sesion() { # banco.sh sesion <carpeta> — el dueño de mentira: /inicio y un pedido chico, en Sonnet, de fondo, con el HOME de mentira
  eval "$(entorno)"; mkdir -p "$BANCO/salidas"
  local n="$1" d="$BANCO/proyectos/$1"
  local pedido="${PEDIDO:-Sumá en docs/TODO.md un pendiente que diga: revisar los nombres de las carpetas de assets. Nada más.}"
  ( cd "$d" && MSYS_NO_PATHCONV=1 timeout 900 claude -p --model sonnet --permission-mode auto --output-format stream-json --verbose "/inicio" ) > "$BANCO/salidas/sesion-$n-inicio.jsonl" 2> "$BANCO/salidas/sesion-$n-inicio.err"
  echo "sesion · $n · /inicio salió $?"
  ( cd "$d" && MSYS_NO_PATHCONV=1 timeout 900 claude -p --model sonnet --permission-mode auto --continue --output-format stream-json --verbose "$pedido" ) > "$BANCO/salidas/sesion-$n-pedido.jsonl" 2> "$BANCO/salidas/sesion-$n-pedido.err"
  echo "sesion · $n · pedido salió $? · HEAD $(git -C "$d" log -1 --format='%h %s' | cut -c1-80) · sucio $(git -C "$d" status --porcelain | wc -l)"
}

noche_armar() { # banco.sh noche-armar <carpeta> — el andamio de la noche, como el de R2: el publicar de mentira firmado por la
  # lib (un cambio de barrera: propuesto, aprobado, el commit y aplicado), la PC autorizada a publicar a ese origin, y el módulo
  # banco-noche (pruebas/banco/modulo-noche/) con sello y ready del Arquitecto, y su worktree. La copia tiene que estar limpia,
  # con su comando-setup ya corrido (banco.sh pruebas), porque el sello corre comando-test.
  eval "$(entorno)"
  local n="$1" d="$BANCO/proyectos/$1" o hoy; hoy="$(date +%F)"
  o="$(git -C "$d" remote get-url origin)"; adentro "$o" || { echo "noche-armar: el origin de $n no está en el banco"; return 3; }
  rm -rf "$d/docs/modulos/banco-noche"   # lo de una vuelta anterior que no llegó al commit
  [ -z "$(git -C "$d" status --porcelain)" ] || { echo "noche-armar: $n no está limpia"; return 1; }
  git -C "$d" config user.name banco; git -C "$d" config user.email banco@localhost
  local id="$hoy-banco-publicar" t
  [ -f "$d/.claude/cambios/$id.md" ] && echo "noche-armar · $n · el publicar de mentira ya estaba firmado" || ( cd "$d" && printf '## Caso de origen\nEl banco de prueba del kit: la noche publica de mentira.\n## Regla\nLa noche publica sola con banco/publicar.cjs (publicar, humo, volver).\n## Dónde vive\n.claude/kit.md, autorizado.publicar.\n## Medición\nLa noche del banco: produccion del remoto de prueba es el main con el módulo.\n' \
    | node .claude/scripts/cambios.cjs nuevo --slug banco-publicar --clase 3-barrera --toca autorizado --id autorizado:publicar --origen "andamio del banco" --chico sí \
    && node "$AQUI/firma-falsa.cjs" "$d" "$id" \
    && mkdir -p banco && cp "$AQUI/publicar-falso.cjs" banco/publicar.cjs \
    && sed -i -E '/^  publicar:/d; s#^(  escribir-produccion: .*)#\1\n  publicar: {comando: "node banco/publicar.cjs publicar", humo: "node banco/publicar.cjs humo", volver: "node banco/publicar.cjs volver"}#' .claude/kit.md \
    && git add banco .claude/kit.md && git commit -q -m "andamio del banco: la noche publica de mentira (autorizado.publicar)" \
    && node .claude/scripts/cambios.cjs anotar-sha "$id" "$(git rev-parse HEAD)" && git add .claude/cambios && git commit -q -m "cambios: aplicado $id" ) || { echo "noche-armar: falló la firma del publicar"; return 1; }
  # el módulo: T3 es una prueba de una función pura si hay comando-test; si no, un glosario (solo papeles)
  t="$(var_ficha "$d" comando-test)"
  # Sin comando-test, el sello pide quitar gate:entorno-prueba en frenos.quitados: otro cambio de barrera, firmado igual (el banco
  # lo cuenta como "preguntó": de verdad es una firma del dueño antes del primer módulo).
  local id2="$hoy-banco-sin-gate"
  if [ -z "$t" ] && ! grep -q 'gate:entorno-prueba' "$d/.claude/kit.md"; then
    echo "noche-armar · $n · preguntó: sin comando-test, el sello pide quitar gate:entorno-prueba (una firma)"
    ( cd "$d" && printf '## Caso de origen\nEl banco de prueba del kit: una copia sin pruebas automáticas.\n## Regla\nSin comando-test, el gate del entorno de prueba no aplica: los encargos de este repo son papeles.\n## Dónde vive\n.claude/kit.md, frenos.quitados.\n## Medición\nEl sello del módulo pasa sin comando-test.\n' \
      | node .claude/scripts/cambios.cjs nuevo --slug banco-sin-gate --clase 3-barrera --toca frenos --id gate:entorno-prueba --origen "andamio del banco" --chico sí \
      && node "$AQUI/firma-falsa.cjs" "$d" "$id2" \
      && sed -i -E 's#^  quitados: \[\]$#  quitados:\n    - {id: gate:entorno-prueba, por: "copia del banco sin pruebas automáticas", hasta: siempre}#' .claude/kit.md \
      && grep -q 'gate:entorno-prueba' .claude/kit.md \
      && git add .claude/kit.md && git commit -q -m "frenos: sin gate:entorno-prueba (no hay comando-test; andamio del banco)" \
      && node .claude/scripts/cambios.cjs anotar-sha "$id2" "$(git rev-parse HEAD)" && git add .claude/cambios && git commit -q -m "cambios: aplicado $id2" ) || { echo "noche-armar: falló la firma del gate"; return 1; }
  fi
  local m="$d/docs/modulos/banco-noche"
  mkdir -p "$m"
  local sedargs
  if [ -n "$t" ]; then
    sedargs="s#{{TEST_TEXTO}}#\`$t\`#g; s#{{TEST_ENTORNO}}#el \`comando-test\` de la ficha corre sin base.#g; s#{{T3_CORTO}}#una prueba nueva para una función pura que ya existe#g; s#{{T3_DOLOR}}#Hay funciones puras sin una prueba que las cubra.#g; s#{{T3_TITULO}}#una prueba para una función pura#g; s#{{T3_DETALLE}}#Elegí una función pura que ya exista (sin base, sin red, sin la fecha del sistema) y que no tenga prueba; sumá un archivo de prueba nuevo, en el framework y la carpeta de pruebas del proyecto, con dos o tres casos. **No se toca el código de la función** ni ningún otro archivo de la aplicación.#g; s#{{T3_CRITERIO}}#Hay un archivo de prueba nuevo con dos o tres casos de una función pura que ya existía; el \`comando-test\` lo corre y pasa; el diff de T3 no toca nada que no sea de prueba.#g"
  else
    sedargs="s#{{TEST_TEXTO}}#el proyecto no tiene pruebas automáticas: decilo así, en una línea#g; s#{{TEST_ENTORNO}}#la ficha no trae \`comando-test\`.#g; s#{{T3_CORTO}}#un glosario#g; s#{{T3_DOLOR}}#Los términos propios del proyecto no están explicados en ningún lado.#g; s#{{T3_TITULO}}#un glosario#g; s#{{T3_DETALLE}}#Un archivo nuevo \`docs/referencia/glosario.md\` con cinco a diez términos propios del proyecto que aparecen en el README o en los papeles, cada uno con una línea. Solo texto.#g; s#{{T3_CRITERIO}}#\`docs/referencia/glosario.md\` existe con cinco a diez términos, una línea cada uno.#g"
  fi
  sed -e "s#{{PROYECTO}}#$n#g; s#{{FECHA}}#$hoy#g; $sedargs" "$AQUI/modulo-noche/SPEC.md" > "$m/SPEC.md"
  sed -e "s#{{PROYECTO}}#$n#g; s#{{FECHA}}#$hoy#g; $sedargs" "$AQUI/modulo-noche/README.md" > "$m/README.md"
  local A="$BANCO/home/.claude/skills/arquitecto/scripts/arquitecto.cjs"
  # sin comando-test el sello pide uno: el banco no lo inventa (lo contaría como "preguntó") y sella con la excepción y su razón
  local sinTest=()
  ( cd "$d" && node "$A" sello docs/modulos/banco-noche/SPEC.md "${sinTest[@]}" && node "$A" ready docs/modulos/banco-noche/SPEC.md \
    && git add docs/modulos/banco-noche && git commit -q -m "arquitecto: módulo banco-noche (spec READY, el andamio de la noche del banco)" ) || { echo "noche-armar: el sello o el ready no pasaron"; return 1; }
  empujar "$d" --quiet origin HEAD || return 1
  node "$BANCO/kit-tag/kit/skills/arquitecto-skills/scripts/preparar-pc.cjs" --kit "$BANCO/kit-tag" --home "$BANCO/home" --proyectos "$BANCO/proyectos" --publica "$o" > "$BANCO/salidas/noche-$n-preparar.log" 2>&1
  echo "noche-armar · $n · preparar-pc --publica salió $?"
  ( cd "$d" && node .claude/scripts/worktree.cjs crear banco-noche ) || { echo "noche-armar: worktree crear falló"; return 1; }
  echo "noche-armar · $n · listo: $(git -C "$d" worktree list | tail -1)"
}

noche() { # banco.sh noche <carpeta> — el director de fondo en el worktree del módulo, sin dueño, tope 3 h; un vigía saca /estado
  # con obreros vivos (parado en la copia, no acá: el error de R2); al final, /estado de la mañana y las medidas de los criterios
  eval "$(entorno)"
  local n="$1" d="$BANCO/proyectos/$1" M="$BANCO/noches/$1"
  local w="$d/.claude/worktrees/modulo--banco-noche"
  mkdir -p "$M"; adentro "$(git -C "$d" remote get-url origin)" || { echo "noche: origin fuera del banco"; return 3; }
  [ -d "$w" ] || { echo "noche: falta el worktree (noche-armar)"; return 1; }
  ( local k=0; while [ ! -f "$M/director-termino" ]; do
      if [ "$k" -eq 0 ] && git -C "$d" worktree list | grep -q -- 'modulo--banco-noche--'; then k=1
        ( cd "$d" && { date '+%F %T'; git worktree list; echo; node .claude/scripts/estado.cjs; echo '== banco-noche'; node .claude/scripts/estado.cjs banco-noche; } ) > "$M/estado-con-obreros.txt" 2>&1
      fi
      { date '+%F %T'; git -C "$d" worktree list; } >> "$M/worktrees.log" 2>&1; sleep 60
    done ) &
  local prompt='/director banco-noche — Arrancá sin esperar mi OK: el plan y el spec ya están aprobados. Me voy: es de noche y no vuelvo hasta mañana, así que no te puedo contestar nada. Terminá el módulo entero (los obreros en Sonnet, de a dos) y cerrá la noche como dice tu paso 9.'
  date '+%F %T' > "$M/director-empezo"
  ( cd "$w" && MSYS_NO_PATHCONV=1 timeout 10800 claude -p --model opus --permission-mode auto --name "director-banco-$n" --output-format stream-json --verbose "$prompt" ) > "$M/director.jsonl" 2> "$M/director.err"
  echo "salida $?" > "$M/director-termino"; date '+%F %T' >> "$M/director-termino"
  wait
  manana "$n"
}

manana() { # banco.sh manana <carpeta> — lo que ve el dueño a la mañana y las medidas de los cuatro criterios de éxito
  local n="$1" d="$BANCO/proyectos/$1" M="$BANCO/noches/$1" bare
  bare="$(git -C "$d" remote get-url origin)"
  git -C "$d" pull --quiet --ff-only 2>/dev/null
  ( cd "$d" && { date '+%F %T'; node .claude/scripts/estado.cjs; echo '== banco-noche'; node .claude/scripts/estado.cjs banco-noche; } ) > "$M/estado-manana.txt" 2>&1
  {
    echo "director: $(cat "$M/director-termino" | tr '\n' ' ')"
    echo "produccion: $(git -C "$bare" rev-parse --verify --quiet refs/heads/produccion || echo '(no publicó)') · main: $(git -C "$bare" rev-parse HEAD)"
    echo "publicado.txt: $(cat "$bare/publicado.txt" 2>/dev/null || echo '(no hay)')"
    echo "worktrees: $(git -C "$d" worktree list | wc -l) · ramas modulo/: $(git -C "$d" branch -a --list '*modulo/*' | wc -l)"
    echo "secciones de /estado: $(grep -cE '^(TE NECESITO|LO QUE SE HIZO|EL PLAN|LO QUE FALTA)' "$M/estado-manana.txt")"
    echo "'rojo/roja/verde' en lo que ve el dueño: $(cat "$M/estado-manana.txt" "$d"/docs/SESSION_HANDOFF.md 2>/dev/null | grep -ciwE 'rojo|roja|verde')"
  } > "$M/medidas.txt"
  cat "$M/medidas.txt"
}

c="${1:-}"; shift || true
case "$c" in
  foto) foto "${1:?archivo}" ;;
  comparar) comparar "${1:?antes}" "${2:?después}" ;;
  remotos) remotos "$@" ;;
  sin-remoto) sin_remoto "${1:?carpeta}" ;;
  armar) armar ;;
  entorno) entorno ;;
  preparar) preparar ;;
  andamio) andamio "${1:?carpeta}" ;;
  empujar) empujar "$@" ;;
  flota) flota "$@" ;;
  mirar) mirar "$@" ;;
  adoptar) adoptar "$@" ;;
  pruebas) pruebas "$@" ;;
  sesion) for x in "$@"; do sesion "$x"; done ;;
  noche-armar) noche_armar "${1:?carpeta}" ;;
  noche) noche "${1:?carpeta}" ;;
  manana) manana "${1:?carpeta}" ;;
  *) sed -n '2,30p' "$0" | sed 's/^# \{0,1\}//'; exit 2 ;;
esac
