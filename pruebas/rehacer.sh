#!/bin/bash
# pruebas/rehacer.sh — arma desde cero los 3 repos de prueba (alfa, beta, gama) y sus remotos bare.
#   bash pruebas/rehacer.sh                  → desde el molde del tag v2.4.2
#   bash pruebas/rehacer.sh --desde <tag>    → desde el molde de otro tag
# Cada repo nace como lo dejaría un adoptador del kit en esa versión: molde v2 + ficha .claude/kit.md.
# Fechas e identidad fijas, y sin la config de git de quien lo corre (ni global ni de sistema): dos corridas, en cualquier PC,
# dan los mismos SHAs. Sale con 1 si algo falla.
# Solo borra alfa/ beta/ gama/ remotos/ de ESTA carpeta; jamás recibe una ruta para borrar.
set -euo pipefail

# --- guardia (antes de borrar nada)
AQUI=$(cd "$(dirname "$0")" && pwd -P)
if [ -z "$AQUI" ] || [ "$(basename "$AQUI")" != "pruebas" ] || [ ! -f "$AQUI/../kit/VERSION" ]; then
  echo "rehacer.sh: este script solo corre desde la carpeta pruebas/ de vibe-kit (con ../kit/VERSION). No toco nada." >&2
  exit 1
fi
RAIZ=$(cd "$AQUI/.." && pwd -P)

# --- argumentos
TAG=v2.4.2
case "${1:-}" in
  "") ;;
  --desde) [ $# -eq 2 ] && [ -n "$2" ] || { echo "uso: rehacer.sh [--desde <tag>]" >&2; exit 2; }; TAG=$2 ;;
  *) echo "uso: rehacer.sh [--desde <tag>]" >&2; exit 2 ;;
esac
[ "$#" -le 2 ] || { echo "uso: rehacer.sh [--desde <tag>]" >&2; exit 2; }
if ! git -C "$RAIZ" rev-parse -q --verify "refs/tags/$TAG" >/dev/null; then
  echo "rehacer.sh: el tag $TAG no existe en $RAIZ" >&2
  exit 1
fi
VER=${TAG#v}   # la versión que dice la ficha (v2.4.2 → 2.4.2)

FICHA="$RAIZ/kit/molde/hooks/lib/ficha.cjs"
[ -f "$FICHA" ] || { echo "rehacer.sh: falta $FICHA (el parser, encargo E1)" >&2; exit 1; }
FECHA=2026-10-28
FECHA_HORA="2026-10-28 12:00"
FECHA_GIT="2026-10-28T12:00:00-03:00"

# --- limpiar lo de la corrida anterior (solo estas cuatro, armadas desde AQUI)
for d in alfa beta gama remotos; do rm -rf "${AQUI:?}/$d"; done
mkdir -p "$AQUI/remotos"

# --- el molde del tag, a un temporal
TMPD=$(mktemp -d)
trap 'rm -rf "$TMPD"' EXIT
git -C "$RAIZ" archive "$TAG" kit/skills/arquitecto/templates/universales | tar -x -C "$TMPD"
MOLDE="$TMPD/kit/skills/arquitecto/templates/universales"

# --- reemplazo literal de marcadores (node, sin regex sobre el valor)
# Los 13 marcadores con nombre + los huecos de texto libre del molde v2 (los "{{lo que sea — ...}}").
cat > "$TMPD/instanciar.cjs" <<'JS'
const fs = require('fs'), path = require('path');
const [dir, ...pares] = process.argv.slice(2);
const v = {};
for (const p of pares) { const i = p.indexOf('='); v[p.slice(0, i)] = p.slice(i + 1); }
const nombrados = ['PROYECTO','QUE_ES_EN_2_LINEAS','QUE_HACE','QUIENES_LO_USAN','STACK','COMANDO_BUILD_TEST_RUN',
  'COMANDO_SALUD_OPCIONAL','OTROS_COMANDOS_FRECUENTES','COMANDOS_DE_LAS_SKILLS','OTRAS_SKILLS','BUGS_HISTORICOS','FECHA','FECHA_HORA'];
const libres = [
  // el aviso del settings se va entero (ya no hay nada que reemplazar a mano); va primero porque lleva un {{...}}
  ['Reemplazar los {{...}} por los comandos reales de las skills del proyecto (o borrar esas líneas). ', ''],
  ['{{PATHS_O_RECURSOS_INTOCABLES — qué no se toca jamás: paths protegidos, datos de producción, pin de versiones. Borrá el slot si no hay.}}', 'Nada intocable por ahora (repo de prueba).'],
  ['{{REGLAS_OPERATIVAS — las piedras con las que este proyecto ya tropezó. Nacen de la regla de las 3 veces: instrucción repetida 3+ veces → va acá. Arranca vacío o casi.}}', '(sin reglas propias todavía)'],
  ['{{OTROS_DOCS — STATUS, DECISIONS, REJECTED, ARCHITECTURE… agregarlos recién cuando duela no tenerlos}}', '(ninguno todavía)'],
  ['{{YYYY-MM-DD}}', v.FECHA],
  ['{{tema de la sesión}}', 'nacimiento del repo de prueba'],
  ['{{SHA — mensaje}}', 'ninguno todavía'],
  ['{{5-15 bullets}}', 'Repo de prueba armado por pruebas/rehacer.sh'],
  ['{{como quedó cada cosa}}', 'main, sin entorno'],
  ['{{lo que quedó a medias, o "nada"}}', 'nada'],
  ['{{una acción ejecutable — nunca "seguir avanzando"}}', 'Probar el actualizador del kit sobre este repo'],
  ['{{o "ninguno"}}', 'ninguno'],
  ['{{lista corta}}', 'ninguno'],
  ['{{decisiones de sesión, drift anotado, avisos para el próximo chat}}', 'Fixture del paquete 1: no es un proyecto real'],
  ['{{...}}', '(nada)'],
];
const pares2 = libres.concat(nombrados.map((k) => {
  if (!(k in v)) { console.error('falta el valor de ' + k); process.exit(1); }
  return ['{{' + k + '}}', v[k]];
}));
function recorrer(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === '.git') continue;
    const r = path.join(d, e.name);
    if (e.isDirectory()) { recorrer(r); continue; }
    let t = fs.readFileSync(r, 'utf8'), n = t;
    for (const [de, a] of pares2) n = n.split(de).join(a);
    if (n !== t) fs.writeFileSync(r, n);
  }
}
recorrer(dir);
JS

# --- los repos
hash_de() { (cd "$1" && node "$FICHA" hash "$2"); }

# Todo git que corre sobre los repos de prueba o sus remotos pasa por acá: sin la config global ni la de sistema de quien lo corre
# (su user.name, un commit.gpgsign, un core.hooksPath, un init.templateDir…), con identidad y fechas fijas. El `git archive` sobre
# vibe-kit no: ese lee un repo de verdad, con la config de verdad.
IDENTIDAD_NOMBRE=kit-pruebas
IDENTIDAD_MAIL=pruebas@kit.invalid
git_pruebas() {
  env GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1 \
    GIT_AUTHOR_NAME="$IDENTIDAD_NOMBRE" GIT_AUTHOR_EMAIL="$IDENTIDAD_MAIL" \
    GIT_COMMITTER_NAME="$IDENTIDAD_NOMBRE" GIT_COMMITTER_EMAIL="$IDENTIDAD_MAIL" \
    GIT_AUTHOR_DATE="$FECHA_GIT" GIT_COMMITTER_DATE="$FECHA_GIT" \
    git "$@"
}

crear_repo() {   # $1 nombre · $2 qué es · $3 con código (si|no) · $4 salud
  local x=$1 d="$AQUI/$1"
  mkdir -p "$d/.claude/skills/inicio" "$d/.claude/skills/cierre" "$d/.claude/hooks" "$d/docs"
  git_pruebas init -q -b main "$d"
  git_pruebas -C "$d" config user.name "$IDENTIDAD_NOMBRE"
  git_pruebas -C "$d" config user.email "$IDENTIDAD_MAIL"
  git_pruebas -C "$d" config core.autocrlf false
  # molde v2 → destinos (templates/LEEME.md)
  cp "$MOLDE/skills/inicio/SKILL.md"       "$d/.claude/skills/inicio/SKILL.md"
  cp "$MOLDE/skills/cierre/SKILL.md"       "$d/.claude/skills/cierre/SKILL.md"
  cp "$MOLDE/hooks/session-start.sh"       "$d/.claude/hooks/session-start.sh"
  cp "$MOLDE/hooks/check-code.js"          "$d/.claude/hooks/check-code.js"
  cp "$MOLDE/settings.template.json"       "$d/.claude/settings.json"
  cp "$MOLDE/CLAUDE.template.md"           "$d/CLAUDE.md"
  cp "$MOLDE/docs/SESSION_HANDOFF.md" "$MOLDE/docs/TODO.md" "$MOLDE/docs/CHANGELOG.md" "$d/docs/"
  local build="git status --short" stack="ninguno (solo docs)"
  if [ "$3" = si ]; then build="node --test"; stack="node (sin package.json)"; fi
  node "$TMPD/instanciar.cjs" "$d" \
    "PROYECTO=$x" "QUE_ES_EN_2_LINEAS=$2" "QUE_HACE=corre lo que haya que correr" \
    "QUIENES_LO_USAN=Lo usa solo el kit de pruebas" "STACK=$stack" "COMANDO_BUILD_TEST_RUN=$build" \
    "COMANDO_SALUD_OPCIONAL=$4" "OTROS_COMANDOS_FRECUENTES=\`git log --oneline\` — historia" \
    "COMANDOS_DE_LAS_SKILLS=git log --oneline" "OTRAS_SKILLS=" "BUGS_HISTORICOS=ninguno todavía" \
    "FECHA=$FECHA" "FECHA_HORA=$FECHA_HORA"
  local rc=0
  grep -rnF --exclude-dir=.git -- '{{' "$d" || rc=$?   # 0 = hay (falla) · 1 = ninguno · 2 = grep mismo falló (también falla)
  case $rc in
    1) ;;
    0) echo "rehacer.sh: quedaron marcadores sin reemplazar en $x (arriba, dónde)" >&2; exit 1 ;;
    *) echo "rehacer.sh: grep falló (código $rc) buscando marcadores en $x" >&2; exit 1 ;;
  esac
  if [ "$3" = si ]; then
    printf 'module.exports = (a, b) => a + b;\n' > "$d/suma.js"
    cat > "$d/suma.test.js" <<'JS'
const test = require('node:test');
const assert = require('node:assert');
const suma = require('./suma');

test('suma dos positivos', () => assert.strictEqual(suma(2, 3), 5));
test('suma con cero', () => assert.strictEqual(suma(7, 0), 7));
JS
  fi
  git_pruebas -C "$d" add -A
  git_pruebas -C "$d" commit -q -m "molde v2 ($VER) instanciado"
}

escribir_ficha() {   # $1 nombre · $2 nivel · $3 con código (si|no); el cuerpo de cada ficha va por stdin (tras "vars")
  local d="$AQUI/$1"
  local h_ini h_cie h_arr h_chk h_set
  h_ini=$(hash_de "$d" .claude/skills/inicio/SKILL.md)
  h_cie=$(hash_de "$d" .claude/skills/cierre/SKILL.md)
  h_arr=$(hash_de "$d" .claude/hooks/session-start.sh)
  h_chk=$(hash_de "$d" .claude/hooks/check-code.js)
  h_set=$(hash_de "$d" .claude/settings.json)
  local piezas="piezas:
  inicio: {estado: molde, hash: $h_ini}
  cierre: {estado: molde, hash: $h_cie}
  hook-arranque: {estado: molde, hash: $h_arr}
  check-code: {estado: molde, hash: $h_chk}
  settings: {estado: molde, hash: $h_set}"
  {
    echo '---'
    echo "# Ficha del kit de $1 (repo de prueba). La escribe pruebas/rehacer.sh; la lee ficha.cjs."
    echo "kit: $VER"
    echo "nivel: $2"
    cat   # cuerpo propio de cada repo: vars
    echo "$piezas"
    cat "$TMPD/extra-$1.txt"
    echo '---'
    echo
    echo '## Cómo se adaptó el kit a este proyecto'
    echo
    echo "- Ficha escrita por pruebas/rehacer.sh como si un adoptador lo hubiera adoptado en $VER (fixture del paquete 1)."
  } > "$d/.claude/kit.md"
}

# alfa: estandar, entornos, secretos, mesa hacia gama
cat > "$TMPD/extra-alfa.txt" <<'EOF'
  docs: molde
  smoke: no
  release: no
  director-obrero: no
  docs-fyd: no
frenos:
  opcionales: []
  quitados: []
sensible:
  datos-reales: [tabla ventas de la base de prueba]
  plata: no
  sale-afuera: no
  claves: no
  release: no
secretos: [ALFA_DB_URL]
herramientas:
  db: {chequeo: "git --version", necesita-guido: no}
  sqlite:
    chequeo: node --version
    necesita-guido: no
entornos:
  base-real:
    clase: real
    herramientas: [db]
    acceso: "db (solo lectura)"
  base-local:                        # dummy: no apunta a ninguna base real
    clase: dummy
    herramientas: [sqlite]
push-publica: no
aprueba: po-pruebas
mesa:
  gama: {contacto: gama/sesion, transporte: git}
multi-llm: no
EOF

# beta: liviano, mínima (solo kit, nivel, vars.proyecto, piezas)
: > "$TMPD/extra-beta.txt"

# gama: estandar, un freno quitado, mesa hacia alfa
cat > "$TMPD/extra-gama.txt" <<'EOF'
  docs: molde
  smoke: no
  release: no
  director-obrero: no
  docs-fyd: no
frenos:
  opcionales: []
  quitados:
    - {id: hook:git-seguro/push-force, por: "repo de prueba, el push es libre", hasta: siempre}
aprueba: po-pruebas
mesa:
  alfa:
    contacto: alfa/sesion
    transporte: git
EOF

con_remoto() {   # $1 nombre
  local x=$1 d="$AQUI/$1" r="$AQUI/remotos/$1.git"
  git_pruebas init -q --bare -b main "$r"
  git_pruebas -C "$d" remote add origin "$r"
  git_pruebas -C "$d" push -q -u origin main
  git_pruebas -C "$d" remote set-head origin main
}

crear_repo alfa "repo de prueba alfa: estandar, con código de node" si "git status --short"
escribir_ficha alfa estandar si <<'EOF'
vars:
  proyecto: alfa
  comando-test: node --test
  lenguajes: [js]
EOF

crear_repo beta "repo de prueba beta: liviano, sin código" no "git status --short"
escribir_ficha beta liviano no <<'EOF'
vars:
  proyecto: beta
EOF

crear_repo gama "repo de prueba gama: estandar, con código de node" si "git status --short"
escribir_ficha gama estandar si <<'EOF'
vars:
  proyecto: gama
  comando-test: node --test
  lenguajes: [js]
EOF

for x in alfa beta gama; do
  git_pruebas -C "$AQUI/$x" add -A
  git_pruebas -C "$AQUI/$x" commit -q -m "ficha del kit (fixture)"
  con_remoto "$x"
done

# --- validación final (junta todo, sale con 1 si algo falló)
FALLOS=()
IDENTIDAD_ESPERADA="$IDENTIDAD_NOMBRE|$IDENTIDAD_MAIL|$IDENTIDAD_NOMBRE|$IDENTIDAD_MAIL"
declare -A T_NIVEL T_FICHA T_TESTS T_REMOTO
for x in alfa beta gama; do
  d="$AQUI/$x"
  T_NIVEL[$x]="?"; T_FICHA[$x]="MAL"; T_TESTS[$x]="n/a"; T_REMOTO[$x]="MAL"
  T_NIVEL[$x]=$(cd "$d" && node "$FICHA" campo .claude/kit.md nivel 2>/dev/null) || T_NIVEL[$x]="?"
  if (cd "$d" && node "$FICHA" leer .claude/kit.md >"$TMPD/leer-$x.json" 2>"$TMPD/leer-$x.err"); then
    kv=$(cd "$d" && node "$FICHA" campo .claude/kit.md kit 2>/dev/null) || kv=""
    if [ "$kv" = "$VER" ]; then T_FICHA[$x]="ok"; else FALLOS+=("$x: kit=$kv, esperaba $VER"); fi
  else
    FALLOS+=("$x: el parser no lee la ficha ($(head -n1 "$TMPD/leer-$x.err"))")
  fi
  oh=$(git_pruebas -C "$d" rev-parse --abbrev-ref origin/HEAD 2>/dev/null) || oh=""
  if [ "$oh" = "origin/main" ]; then T_REMOTO[$x]="ok"; else FALLOS+=("$x: origin/HEAD='$oh'"); fi
  rc=0
  grep -rqF --exclude-dir=.git -- '{{' "$d" || rc=$?
  case $rc in
    1) ;;
    0) FALLOS+=("$x: quedó un {{") ;;
    *) FALLOS+=("$x: grep falló (código $rc) buscando marcadores") ;;
  esac
  if [ -f "$d/suma.test.js" ]; then
    if (cd "$d" && node --test >"$TMPD/test-$x.log" 2>&1); then T_TESTS[$x]="verde"; else T_TESTS[$x]="ROJO"; FALLOS+=("$x: node --test en rojo"); fi
  fi
  # autor y committer de TODOS los commits (%an|%ae|%cn|%ce): ninguno puede ser otro que kit-pruebas
  ids=$(git_pruebas -C "$d" log --format="%an|%ae|%cn|%ce") || { FALLOS+=("$x: no se pudo leer el log"); ids=""; }
  if [ -z "$ids" ]; then
    FALLOS+=("$x: no hay commits")
  else
    rc=0
    otros=$(printf '%s\n' "$ids" | sort -u | grep -vxF -- "$IDENTIDAD_ESPERADA") || rc=$?   # 0 = hay otros · 1 = ninguno · 2 = error
    case $rc in
      1) ;;
      0) FALLOS+=("$x: commits con otra identidad: $otros") ;;
      *) FALLOS+=("$x: grep falló (código $rc) revisando las identidades") ;;
    esac
  fi
done
printf '%-6s %-9s %-6s %-7s %s\n' repo nivel ficha tests remoto
for x in alfa beta gama; do
  printf '%-6s %-9s %-6s %-7s %s\n' "$x" "${T_NIVEL[$x]}" "${T_FICHA[$x]}" "${T_TESTS[$x]}" "${T_REMOTO[$x]}"
done
if [ "${#FALLOS[@]}" -gt 0 ]; then
  printf '  - %s\n' "${FALLOS[@]}"
  echo "pruebas: FALLÓ — ${FALLOS[0]}"
  exit 1
fi
echo "pruebas: LISTO"
