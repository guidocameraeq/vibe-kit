#!/bin/bash
# pruebas/rehacer.sh — arma desde cero los 3 repos de prueba (alfa, beta, gama) y sus remotos bare.
#   bash pruebas/rehacer.sh                  → alfa y beta con el molde v2 del tag v2.4.2 + los pasos "molde v3 orden 2", "2b" y "3"; gama pura
#   bash pruebas/rehacer.sh --desde <tag>    → lo mismo, desde el molde v2 de otro tag
#   bash pruebas/rehacer.sh --solo-tag       → los tres puros, del tag, sin el paso del molde v3 (para probar el actualizador)
# El paso del molde v3 (orden 2 del kit v3): sobre alfa y beta, en UN commit "molde v3 orden 2", pone kit/molde/ (el del árbol de
# trabajo, sin los *.test.cjs) → hooks, scripts, docs, settings.json MEZCLADO con el v2 (el SessionStart viejo pasa al de node y se
# suma el PreToolUse), CLAUDE.md y los dos .snippet; deja la ficha con hook-escritura y los hashes nuevos. gama NO lo recibe.
# Ese paso sale del molde tal como quedó al cerrar D2.1 (git archive 2c8eb7d), no del árbol de trabajo: no cambia con lo que venga después.
# Encima, en OTRO commit "molde v3 orden 2b" (D2.2), alfa y beta reciben lo de kit/molde/ tal como quedó al cerrar D2.2 (git archive
# 37906e8, el último commit que tocó el molde antes del paquete 3; se congela como D21): hooks, scripts y skills, settings por
# mezclarSettings (viejo = el de D2.1), skills inicio/cierre por mezclarTexto (o tal cual si no tienen zona propia), la ficha con
# candado, cambios-metodo y los hashes por hashPieza. Antes del commit corre `estructura.cjs barreras --molde` (0) y sin --molde
# (1, candado:barreras); después del push, `estructura.cjs todo` (0). Todo con --sin-log: nada mete la hora actual.
# Encima, en un TERCER commit "molde v3 orden 3" (D3.3), alfa y beta reciben lo de kit/molde/ del árbol de trabajo (sin los
# *.test.cjs): hooks (git-seguro, sensible, comando, db-guardia, agente…), scripts, skills, settings por mezclarSettings (viejo = el de
# D22, todo en exec), el snippet de .gitattributes (.githooks/* eol=lf) y githooks/** → .githooks/** con +x en el índice
# (update-index --chmod=+x; los tres sh; el runner .cjs queda 100644 como en el kit). NO setea core.hooksPath (lo hace el arranque).
# Mismos candados que el 2b: `barreras --molde` 0, sin --molde 1, `todo` 0 tras el push. gama no recibe ninguno de los tres.
# Los arma AFUERA de vibe-kit, en la carpeta hermana vibe-kit-pruebas/ (junto a la raíz del checkout PRINCIPAL, también si se corre
# desde un worktree; se calcula con git-common-dir, nunca es una ruta fija): así el CLAUDE.md y las skills de los repos de prueba no se cuelan en las sesiones de vibe-kit. El script y pedidos.md
# se quedan acá, en pruebas/. Al terminar imprime en qué carpeta dejó los repos.
# Cada repo nace como lo dejaría un adoptador del kit en esa versión: molde v2 + ficha .claude/kit.md.
# Fechas e identidad fijas, y sin la config de git de quien lo corre (ni global ni de sistema): dos corridas, en cualquier PC,
# dan los mismos SHAs (también si la carpeta de destino cambia de lugar). Sale con 1 si algo falla.
# Solo borra alfa/ beta/ gama/ remotos/ de vibe-kit-pruebas/; jamás recibe una ruta para borrar. Si vibe-kit-pruebas/ ya existe,
# solo la usa si está vacía o tiene la marca .repos-de-prueba-de-vibe-kit; si no, sale con 1 sin tocar nada.
# NO toca las carpetas viejas vibe-kit/pruebas/{alfa,beta,gama,remotos}: esas se borran a mano.
set -euo pipefail

# --- guardia (antes de borrar nada)
AQUI=$(cd "$(dirname "$0")" && pwd -P)
if [ -z "$AQUI" ] || [ "$(basename "$AQUI")" != "pruebas" ] || [ ! -f "$AQUI/../kit/VERSION" ]; then
  echo "rehacer.sh: este script solo corre desde la carpeta pruebas/ de vibe-kit (con ../kit/VERSION). No toco nada." >&2
  exit 1
fi
RAIZ=$(cd "$AQUI/.." && pwd -P)
# La hermana del checkout PRINCIPAL de vibe-kit, en cualquier PC y también corrido desde un worktree (.claude/worktrees/x/):
# el git-common-dir es siempre el .git del principal, y su padre es la raíz del principal.
COMUN=$(git -C "$RAIZ" rev-parse --path-format=absolute --git-common-dir 2>/dev/null) || COMUN=""
if [ -z "$COMUN" ] || [ "$(basename "$COMUN")" != ".git" ] || [ ! -d "$COMUN" ]; then
  echo "rehacer.sh: no pude calcular el checkout principal de vibe-kit (git-common-dir='$COMUN'). No toco nada." >&2
  exit 1
fi
PRINCIPAL=$(cd "$COMUN/.." && pwd -P)
DEST="$(dirname "$PRINCIPAL")/vibe-kit-pruebas"
D21=2c8eb7d   # el commit del cierre de D2.1: de ahí sale el molde del paso "molde v3 orden 2"
D22=37906e8   # el último commit que tocó kit/molde/ antes del paquete 3 (D2.2): de ahí sale el molde del paso "orden 2b", congelado
MARCA=.repos-de-prueba-de-vibe-kit

# --- argumentos
TAG=v2.4.2
SOLO_TAG=no
EVIDENCIA=no
USO="uso: rehacer.sh [--desde <tag>] [--solo-tag] [--evidencia]"
while [ $# -gt 0 ]; do
  case "$1" in
    --desde) [ $# -ge 2 ] && [ -n "$2" ] || { echo "$USO" >&2; exit 2; }; TAG=$2; shift 2 ;;
    --solo-tag) SOLO_TAG=si; shift ;;
    --evidencia) EVIDENCIA=si; shift ;;
    *) echo "$USO" >&2; exit 2 ;;
  esac
done
if ! git -C "$RAIZ" rev-parse -q --verify "refs/tags/$TAG" >/dev/null; then
  echo "rehacer.sh: el tag $TAG no existe en $RAIZ" >&2
  exit 1
fi
VER=${TAG#v}   # la versión que dice la ficha (v2.4.2 → 2.4.2)

FICHA="$RAIZ/kit/molde/hooks/lib/ficha.cjs"
[ -f "$FICHA" ] || { echo "rehacer.sh: falta $FICHA (el parser, encargo E1)" >&2; exit 1; }
MOLDE3C="$RAIZ/kit/molde"   # el molde v3 del árbol de trabajo (lo de D3.3: lo usa el paso "orden 3")
ZONA="$MOLDE3C/hooks/lib/zona-propia.cjs"
TMPD=$(mktemp -d)
trap 'rm -rf "$TMPD"' EXIT
MOLDE3="$TMPD/d21/kit/molde"    # el molde tal como quedó al cerrar D2.1 (lo usa el paso "orden 2", que no cambia)
MOLDE3B="$TMPD/d22/kit/molde"   # el molde tal como quedó al cerrar D2.2 (lo usa el paso "orden 2b", congelado)
ZONA22="$MOLDE3B/hooks/lib/zona-propia.cjs"
if [ "$SOLO_TAG" = no ]; then
  git -C "$RAIZ" cat-file -e "$D21^{commit}" 2>/dev/null || { echo "rehacer.sh: no existe el commit $D21 (el cierre de D2.1)" >&2; exit 1; }
  git -C "$RAIZ" cat-file -e "$D22^{commit}" 2>/dev/null || { echo "rehacer.sh: no existe el commit $D22 (el cierre de D2.2)" >&2; exit 1; }
  mkdir -p "$TMPD/d21" "$TMPD/d22"
  git -C "$RAIZ" archive "$D21" kit/molde | tar -x -C "$TMPD/d21"
  git -C "$RAIZ" archive "$D22" kit/molde | tar -x -C "$TMPD/d22"
  for f in hooks/session-start.cjs hooks/escritura-docs.cjs hooks/lib/ficha.cjs settings.json CLAUDE.md gitignore.snippet \
           gitattributes.snippet docs/NORTE.md docs/SESSION_HANDOFF.md docs/TODO.md scripts/todo.cjs; do
    [ -f "$MOLDE3/$f" ] || { echo "rehacer.sh: falta kit/molde/$f en $D21 (el molde de D2.1)" >&2; exit 1; }
  done
  for f in hooks/lib/zona-propia.cjs hooks/lib/fabrica/ficha.estandar.md hooks/lib/fabrica/ficha.liviano.md hooks/niega-aprobar.cjs \
           hooks/lib/candado.cjs hooks/lib/barreras.cjs scripts/estructura.cjs scripts/cambios.cjs scripts/agents.cjs settings.json \
           skills/inicio/SKILL.md skills/cierre/SKILL.md; do
    [ -f "$MOLDE3B/$f" ] || { echo "rehacer.sh: falta kit/molde/$f en $D22 (el molde de D2.2)" >&2; exit 1; }
  done
  for f in githooks/pre-commit githooks/pre-merge-commit githooks/pre-push githooks/kit-githook.cjs hooks/git-seguro.cjs hooks/sensible.cjs            hooks/lib/comando.cjs hooks/lib/db-guardia.cjs hooks/lib/agente.cjs settings.json gitattributes.snippet; do
    [ -f "$MOLDE3C/$f" ] || { echo "rehacer.sh: falta kit/molde/$f (el molde de D3.3, árbol de trabajo)" >&2; exit 1; }
  done
fi
FECHA=2026-10-28
FECHA_HORA="2026-10-28 12:00"
FECHA_GIT="2026-10-28T12:00:00-03:00"

# --- guardia del destino (antes de borrar nada)
if [ -e "$DEST" ] || [ -L "$DEST" ]; then
  if [ -L "$DEST" ] || [ ! -d "$DEST" ]; then
    echo "rehacer.sh: $DEST existe y no es una carpeta común. No toco nada." >&2
    exit 1
  fi
  if [ ! -f "$DEST/$MARCA" ] && [ -n "$(ls -A "$DEST")" ]; then
    echo "rehacer.sh: $DEST ya existe, tiene contenido y no tiene la marca $MARCA (no la armó este script). No toco nada." >&2
    exit 1
  fi
else
  mkdir -p "$DEST"
fi
printf 'Repos de prueba de vibe-kit (alfa, beta, gama y remotos/). Los regenera vibe-kit/pruebas/rehacer.sh; no se editan a mano.\n' > "$DEST/$MARCA"

# --- limpiar lo de la corrida anterior (solo estas cuatro, adentro de DEST)
for d in alfa beta gama remotos; do rm -rf "${DEST:?}/$d"; done
mkdir -p "$DEST/remotos"

# --- el molde del tag, a un temporal
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
# Lo mismo para lo que corre adentro de un repo de prueba y llama a git por su cuenta (estructura.cjs): sin config global ni de sistema
sin_config() { env GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1 "$@"; }
declare -A T_ESTRUC T_ESTRUC_MAL

crear_repo() {   # $1 nombre · $2 qué es · $3 con código (si|no) · $4 salud
  local x=$1 d="$DEST/$1"
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
  local d="$DEST/$1"
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
  local x=$1 d="$DEST/$1" r="$DEST/remotos/$1.git"
  git_pruebas init -q --bare -b main "$r"
  git_pruebas -C "$d" remote add origin "$r"
  git_pruebas -C "$d" push -q -u origin main
  git_pruebas -C "$d" remote set-head origin main
}

# --- el paso del molde v3 (orden 2 del kit v3): solo alfa y beta, un commit; gama queda en la versión pura del tag
cat > "$TMPD/molde-v3.cjs" <<'JS'
// Instancia kit/molde/ (v3) sobre un repo de prueba que ya tiene el molde v2 + su ficha. Sin regex sobre los valores.
// Uso: node molde-v3.cjs <kit/molde> <repo> <ficha.cjs> clave=valor…   (no toca git: el commit lo hace rehacer.sh)
const fs = require('fs'), path = require('path');
const [molde, repo, fichaCjs, ...pares] = process.argv.slice(2);
const v = {};
for (const p of pares) { const i = p.indexOf('='); v[p.slice(0, i)] = p.slice(i + 1); }
const { hash } = require(fichaCjs);
const lf = (s) => s.replace(/\r\n/g, '\n');           // el checkout de Windows puede traer CRLF: los repos de prueba, siempre LF
const leer = (p) => lf(fs.readFileSync(p, 'utf8'));
const escribir = (p, t) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, t); };

// Los huecos del molde v3, con valores de fixture. Los más largos primero; "{{...}}" al final (el CHANGELOG lo trae cuatro veces).
const huecos = [
  ['{{LO_QUE_NO_HACE — lo que alguien podría suponer y no es}}', 'No es un proyecto real: no tiene usuarios ni datos de verdad.'],
  ['{{ninguno, o cuál y la fecha en que se borra}}', 'ninguno'],
  ['{{una acción ejecutable, nunca "seguir avanzando"}}', 'Probar el actualizador del kit sobre este repo'],
  ['{{ninguno, o qué traba y quién lo destraba}}', 'ninguno'],
  ['{{lo que tiene que decidir o hacer el dueño; o "nada"}}', 'nada'],
  ['{{lo que quedó a medias; o "nada"}}', 'nada'],
  ['{{lo que no está en otro doc: decisiones de la sesión, avisos para el próximo chat}}', 'Fixture del orden 2 del kit v3: no es un proyecto real'],
  ['{{tema de la sesión}}', 'molde v3 orden 2 (fixture de prueba)'],
  ['### Added\n- {{...}}', '### Added\n- Árbol de cuatro capas, handoff con tope, TODO sin fechas, hook de arranque en node y hook de escritura (molde v3, orden 2)'],
  ['{{...}}', '(nada)'],
  ['{{QUE_ES_EN_2_LINEAS}}', v.DESC],
  ['{{PARA_QUE}}', 'Probar el kit (hooks, ficha, actualizador) sobre un repo que se comporta como el de un adoptador.'],
  ['{{QUIENES_LO_USAN}}', 'Lo usa solo el kit de pruebas'],
  ['{{HECHO}}', 'Nada todavía: repo de prueba armado por pruebas/rehacer.sh.'],
  ['{{MODULO_A}}', v.MODULO_A], ['{{MODULO_B}}', v.MODULO_B], ['{{BASE_O_SERVICIO}}', v.BASE],
  ['{{APP}}', v.APP], ['{{QUE_COMPARTE}}', v.COMPARTE], ['{{QUIEN_ESCRIBE}}', v.ESCRIBE],
  ['{{RAMA}}', 'main'], ['{{ENTORNO}}', 'sin entorno'],
  ['{{YYYY-MM-DD}}', v.FECHA], ['{{PROYECTO}}', v.PROYECTO],
];
for (const [de, a] of huecos) if (typeof a !== 'string') { console.error('molde-v3: falta un valor para ' + de); process.exit(1); }
const rellenar = (t) => huecos.reduce((acc, [de, a]) => acc.split(de).join(a), t);

function archivos(dir) {   // relativos, ordenados; los *.test.cjs NO se instancian
  const r = [];
  (function rec(d, rel) {
    for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
      const q = rel ? rel + '/' + e.name : e.name;
      if (e.isDirectory()) rec(path.join(d, e.name), q);
      else if (!e.name.endsWith('.test.cjs')) r.push(q);
    }
  })(dir, '');
  return r;
}
const escritos = [];
for (const [de, a, llena] of [['hooks', '.claude/hooks', false], ['scripts', '.claude/scripts', false], ['docs', 'docs', true]]) {
  for (const rel of archivos(path.join(molde, de))) {
    const t = leer(path.join(molde, de, rel));
    escribir(path.join(repo, a, rel), llena ? rellenar(t) : t);
    escritos.push(a + '/' + rel);
  }
}
escribir(path.join(repo, 'CLAUDE.md'), rellenar(leer(path.join(molde, 'CLAUDE.md'))));
escritos.push('CLAUDE.md');
for (const rel of escritos) if (fs.readFileSync(path.join(repo, rel), 'utf8').includes('{{') && /^(docs|CLAUDE)/.test(rel)) {
  console.error('molde-v3: quedó un {{ sin reemplazar en ' + rel); process.exit(1);
}

// El arranque v2 (bash) ya no corre: el settings apunta al de node. Se va con su hash viejo.
fs.rmSync(path.join(repo, '.claude/hooks/session-start.sh'), { force: true });

// settings.json MEZCLADO: el SessionStart viejo (session-start.sh) pasa al de node; el PreToolUse se suma; lo demás del viejo queda.
const nuevo = JSON.parse(leer(path.join(molde, 'settings.json')));
const sp = path.join(repo, '.claude/settings.json');
const viejo = JSON.parse(fs.readFileSync(sp, 'utf8'));
const comandos = (e) => (e.hooks || []).map((h) => h.command || '');
viejo.hooks = viejo.hooks || {};
for (const [ev, entradas] of Object.entries(nuevo.hooks || {})) {
  let actuales = viejo.hooks[ev] || [];
  if (ev === 'SessionStart') actuales = actuales.filter((e) => !comandos(e).some((c) => /session-start\.(sh|cjs)/.test(c)));
  const ya = new Set(actuales.flatMap(comandos));
  viejo.hooks[ev] = actuales.concat(entradas.filter((e) => !comandos(e).some((c) => ya.has(c))));
}
for (const [k, val] of Object.entries(nuevo)) {   // lo que el molde sume fuera de hooks: se agrega, las listas se unen
  if (k === 'hooks') continue;
  if (!(k in viejo)) viejo[k] = val;
  else if (val && typeof val === 'object' && !Array.isArray(val)) {
    for (const [k2, v2] of Object.entries(val)) {
      if (Array.isArray(v2) && Array.isArray(viejo[k][k2])) viejo[k][k2] = viejo[k][k2].concat(v2.filter((x) => !viejo[k][k2].includes(x)));
      else if (!(k2 in viejo[k])) viejo[k][k2] = v2;
    }
  }
}
escribir(sp, JSON.stringify(viejo, null, 2) + '\n');

// Los dos .snippet, al final de .gitignore y .gitattributes: línea por línea, sin duplicar lo que ya está.
function agregar(archivo, snippet) {
  let actual = fs.existsSync(archivo) ? lf(fs.readFileSync(archivo, 'utf8')) : '';
  const ya = new Set(actual.split('\n').map((l) => l.trim()));
  const faltan = leer(snippet).split('\n').filter((l) => l.trim() !== '' && !ya.has(l.trim()));
  if (!faltan.length) return;
  if (actual && !actual.endsWith('\n')) actual += '\n';
  escribir(archivo, actual + faltan.join('\n') + '\n');
}
agregar(path.join(repo, '.gitignore'), path.join(molde, 'gitignore.snippet'));
agregar(path.join(repo, '.gitattributes'), path.join(molde, 'gitattributes.snippet'));

// La ficha: el arranque ahora es el .cjs, el settings cambió, hay hook de escritura. Hash = ficha.hash del archivo tal como queda.
const fp = path.join(repo, '.claude/kit.md');
let ficha = lf(fs.readFileSync(fp, 'utf8'));
const h = (rel) => hash(fs.readFileSync(path.join(repo, rel)));
function linea(re, nueva) {
  if (!re.test(ficha)) { console.error('molde-v3: la ficha no tiene ' + re); process.exit(1); }
  ficha = ficha.replace(re, () => nueva);
}
linea(/^  hook-arranque: .*$/m, `  hook-arranque: {estado: molde, hash: ${h('.claude/hooks/session-start.cjs')}}`);
linea(/^  settings: .*$/m, `  settings: {estado: molde, hash: ${h('.claude/settings.json')}}\n  hook-escritura: molde`);
ficha += '- Commit "molde v3 orden 2" (pruebas/rehacer.sh): arranque en node, hook de escritura, docs en cuatro capas y snippets; el campo kit no cambia hasta el tag.\n';
escribir(fp, ficha);
JS

molde_v3() {   # $1 nombre · $2 qué es · $3 módulo A · $4 módulo B · $5 base o servicio · $6 app vecina · $7 qué comparte · $8 quién escribe
  local x=$1 d="$DEST/$1"
  node "$TMPD/molde-v3.cjs" "$MOLDE3" "$d" "$FICHA" "PROYECTO=$x" "DESC=$2" "MODULO_A=$3" "MODULO_B=$4" "BASE=$5" \
    "APP=$6" "COMPARTE=$7" "ESCRIBE=$8" "FECHA=$FECHA"
  git_pruebas -C "$d" add -A
  git_pruebas -C "$d" commit -q -m "molde v3 orden 2"
  git_pruebas -C "$d" push -q origin main   # el remoto sigue a main: fichaVigente lee la ficha de origin/HEAD
}

# --- los pasos "orden 2b" (D2.2, molde congelado en D22) y "orden 3" (D3.3, molde del árbol de trabajo): encima del de D2.1, uno tras otro
#     (hooks, scripts, skills; sin *.test.cjs; el 3 suma githooks/ y el snippet de .gitattributes)
cat > "$TMPD/molde-v3b.cjs" <<'JS'
// Instancia el paso "2b" (D2.2) o el "3" (D3.3) sobre un repo de prueba que ya tiene el commit anterior. No toca git.
// Uso: node molde-v3b.cjs <molde viejo> <molde nuevo> <repo> <ficha.cjs> <zona-propia.cjs> <2b|3>
//   2b: viejo = molde D2.1, nuevo = molde D2.2 · 3: viejo = molde D2.2, nuevo = el del árbol de trabajo (suma githooks y el snippet)
const fs = require('fs'), path = require('path');
const [molde21, molde22, repo, fichaCjs, zonaCjs, paso] = process.argv.slice(2);
const { leer } = require(fichaCjs);
const Z = require(zonaCjs);
const lf = (s) => s.replace(/\r\n/g, '\n');
const leerT = (p) => lf(fs.readFileSync(p, 'utf8'));
const escribir = (p, t) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, t); };
const falla = (m) => { console.error('molde-v3b: ' + m); process.exit(1); };
if (paso !== '2b' && paso !== '3') falla('el paso es 2b o 3');

function archivos(dir) {   // relativos, ordenados; los *.test.cjs NO se instancian
  const r = [];
  (function rec(d, rel) {
    for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
      const q = rel ? rel + '/' + e.name : e.name;
      if (e.isDirectory()) rec(path.join(d, e.name), q);
      else if (!e.name.endsWith('.test.cjs')) r.push(q);
    }
  })(dir, '');
  return r;
}

const fp = path.join(repo, '.claude/kit.md');
let ficha = leerT(fp);
let quitados = [];
try { quitados = ((leer(ficha).datos.frenos || {}).quitados) || []; } catch (e) { falla('la ficha del repo no se lee: ' + e.message); }

// hooks/** y scripts/** (las skills van aparte: pueden tener zona propia)
for (const [de, a] of [['hooks', '.claude/hooks'], ['scripts', '.claude/scripts']]) {
  for (const rel of archivos(path.join(molde22, de))) escribir(path.join(repo, a, rel), leerT(path.join(molde22, de, rel)));
}

// orden 3: githooks/** → .githooks/** (sin los *.test.cjs; el +x lo pone rehacer.sh en el índice) y el snippet de .gitattributes
if (paso === '3') {
  for (const rel of archivos(path.join(molde22, 'githooks'))) escribir(path.join(repo, '.githooks', rel), leerT(path.join(molde22, 'githooks', rel)));
  const ga = path.join(repo, '.gitattributes');
  let actual = fs.existsSync(ga) ? leerT(ga) : '';
  const ya = new Set(actual.split('\n').map((l) => l.trim()));
  const faltan = leerT(path.join(molde22, 'gitattributes.snippet')).split('\n').filter((l) => l.trim() !== '' && !ya.has(l.trim()));
  if (faltan.length) { if (actual && !actual.endsWith('\n')) actual += '\n'; escribir(ga, actual + faltan.join('\n') + '\n'); }
  // .githooks/ cuenta como código para candado:estado-viejo: el "## Próximo paso" del handoff se reescribe (lo que haría el dueño)
  const hp = path.join(repo, 'docs/SESSION_HANDOFF.md');
  const viejoPaso = 'Probar el actualizador del kit sobre este repo';
  const th = leerT(hp);
  if (!th.includes(viejoPaso)) falla('el handoff no tiene el próximo paso del orden 2');
  escribir(hp, th.split(viejoPaso).join('Probar los githooks (.githooks/) y el hooksPath sobre este repo'));
}

// settings.json: mezcla a tres puntas (molde viejo, molde nuevo, el del repo)
const textoMolde = leerT(path.join(molde22, 'settings.json'));
const mez = Z.mezclarSettings({
  viejo: leerT(path.join(molde21, 'settings.json')), nuevo: textoMolde,
  proyecto: leerT(path.join(repo, '.claude/settings.json')), quitados,
});
if (!mez.ok) falla('mezclarSettings no pudo: ' + mez.problema);
escribir(path.join(repo, '.claude/settings.json'), mez.texto);
const hashSettings = Z.hashPieza(Z.textoSettings(JSON.parse(textoMolde)));

// skills: las v2 no tienen zonas propias → se escribe la del molde tal cual; si las tienen, mezclarTexto
const hashSkill = {};
for (const s of ['inicio', 'cierre']) {
  const rutaRepo = path.join(repo, '.claude/skills', s, 'SKILL.md');
  const delMolde = leerT(path.join(molde22, 'skills', s, 'SKILL.md'));
  const actual = fs.existsSync(rutaRepo) ? leerT(rutaRepo) : '';
  const z = Z.zonas(actual);
  if (!z.ok) falla(`la skill ${s} del repo tiene una zona rota: ${z.problema} (renglón ${z.linea})`);
  let escrita = delMolde;
  if (z.zonas.length > 0) {
    const m = Z.mezclarTexto(delMolde, actual);
    if (!m.ok) falla(`mezclarTexto de la skill ${s}: ${m.problema}`);
    escrita = m.texto;
  }
  escribir(rutaRepo, escrita);
  hashSkill[s] = Z.hashPieza(escrita);
}

// la ficha: frenos, sensible, autorizado y nivel no se tocan
function linea(re, nueva) {
  if (!re.test(ficha)) falla('la ficha no tiene ' + re);
  ficha = ficha.replace(re, () => nueva);
}
linea(/^  inicio: .*$/m, `  inicio: {estado: molde+propio, hash: ${hashSkill.inicio}}`);
linea(/^  cierre: .*$/m, `  cierre: {estado: molde+propio, hash: ${hashSkill.cierre}}`);
linea(/^  hook-arranque: .*$/m, `  hook-arranque: {estado: molde, hash: ${require(fichaCjs).hash(fs.readFileSync(path.join(repo, '.claude/hooks/session-start.cjs')))}}`);
linea(/^  settings: .*$/m, `  settings: {estado: molde+propio, hash: ${hashSettings}}`);
if (!/^  hook-escritura: /m.test(ficha)) falla('la ficha no tiene hook-escritura');
const suma = ['candado', 'cambios-metodo'].filter((k) => !new RegExp('^  ' + k + ':', 'm').test(ficha)).map((k) => `  ${k}: molde\n`).join('');
if (suma) linea(/^  hook-escritura: .*\n/m, '  hook-escritura: molde\n' + suma);
ficha += paso === '3'
  ? '- Commit "molde v3 orden 3" (pruebas/rehacer.sh): git-seguro, sensible, githooks, el settings todo en exec y el /cierre sin --no-verify; el campo kit no cambia hasta el tag.\n'
  : '- Commit "molde v3 orden 2b" (pruebas/rehacer.sh): candado, cambios del método, zona propia, /inicio y /cierre v3 y el settings mezclado; el campo kit no cambia hasta el tag.\n';
escribir(fp, ficha);
JS

# Lo que cobra la validación final del paso 2b que no es un simple archivo: la ficha (lee, piezas nuevas, hashes, lo que no se toca)
# y el settings. Imprime un problema por renglón; sin salida = en orden.
cat > "$TMPD/comprobar-2b.cjs" <<'JS'
// Uso: node comprobar-2b.cjs <ficha.cjs> <zona-propia.cjs> <kit/molde del paso> <repo> <ficha del commit anterior (archivo)> <2b|3>
const fs = require('fs'), path = require('path');
const [fichaCjs, zonaCjs, molde22, repo, previa, paso] = process.argv.slice(2);
const F = require(fichaCjs), Z = require(zonaCjs);
const problemas = [];
const mal = (m) => problemas.push(m);
const lf = (s) => s.replace(/\r\n/g, '\n');
let ahora, antes;
try { ahora = F.leer(lf(fs.readFileSync(path.join(repo, '.claude/kit.md'), 'utf8'))); } catch (e) { mal('la ficha ya no se lee: ' + e.message); }
try { antes = F.leer(lf(fs.readFileSync(previa, 'utf8'))); } catch (e) { mal('la ficha del commit anterior no se lee: ' + e.message); }
if (ahora && antes) {
  if (ahora.avisos.length) mal('la ficha da avisos: ' + ahora.avisos.join(' / '));
  const estado = (k) => { const v = (ahora.datos.piezas || {})[k]; return v && typeof v === 'object' ? v.estado : v; };
  const hashDe = (k) => { const v = (ahora.datos.piezas || {})[k]; return v && typeof v === 'object' ? v.hash : undefined; };
  for (const k of ['candado', 'cambios-metodo', 'hook-escritura']) if (estado(k) !== 'molde') mal(`piezas.${k} debería ser molde (es ${estado(k)})`);
  if (hashDe('hook-escritura') !== undefined) mal('piezas.hook-escritura no lleva hash');
  for (const s of ['inicio', 'cierre']) {
    const h = Z.hashPieza(fs.readFileSync(path.join(repo, '.claude/skills', s, 'SKILL.md'), 'utf8'));
    if (estado(s) !== 'molde+propio') mal(`piezas.${s} debería ser molde+propio (es ${estado(s)})`);
    if (hashDe(s) !== h) mal(`el hash de ${s} en la ficha no es hashPieza de la skill`);
  }
  const molde = JSON.parse(fs.readFileSync(path.join(molde22, 'settings.json'), 'utf8'));
  if (estado('settings') !== 'molde+propio') mal(`piezas.settings debería ser molde+propio (es ${estado('settings')})`);
  if (hashDe('settings') !== Z.hashPieza(Z.textoSettings(molde))) mal('el hash de settings en la ficha no es hashPieza del settings del molde');
  // lo que 2b no toca: todo menos piezas
  for (const k of new Set([...Object.keys(antes.datos), ...Object.keys(ahora.datos)])) {
    if (k === 'piezas') continue;
    if (JSON.stringify(antes.datos[k]) !== JSON.stringify(ahora.datos[k])) mal(`la ficha cambió «${k}» y no debía`);
  }
}
try {
  const s = JSON.parse(fs.readFileSync(path.join(repo, '.claude/settings.json'), 'utf8'));
  const cmds = [];
  for (const [ev, gs] of Object.entries(s.hooks || {})) for (const g of gs) for (const h of g.hooks || []) cmds.push(ev + ' ' + [h.command, ...(Array.isArray(h.args) ? h.args : [])].join(' '));
  for (const c of ['SessionStart node', 'PreToolUse node']) if (!cmds.some((x) => x.startsWith(c.split(' ')[0]) && x.includes('node'))) mal('el settings no tiene ' + c);
  if (paso === '3') {   // todo hook en forma exec (command = node, el .cjs en args), y los dos nuevos registrados
    // los del molde, en exec (los propios del proyecto, como el check-code.js v2, quedan como estaban)
    const delMolde = /(session-start|escritura-docs|niega-aprobar|git-seguro|sensible)\.cjs/;
    for (const [ev, gs] of Object.entries(s.hooks || {})) for (const g of gs) for (const h of g.hooks || [])
      if (delMolde.test([h.command, ...(Array.isArray(h.args) ? h.args : [])].join(' ')) && (h.command !== 'node' || !Array.isArray(h.args))) mal(`el hook ${ev} «${h.command}» no está en forma exec`);
    for (const f of ['git-seguro.cjs', 'sensible.cjs']) if (!cmds.some((x) => x.startsWith('PreToolUse') && x.includes(f))) mal('el settings no tiene el hook ' + f);
    if (!((s.permissions || {}).deny || []).includes('Read(./**/.env)')) mal('el settings no niega Read a .env');
  }
  if (!cmds.some((x) => x.includes('niega-aprobar.cjs'))) mal('el settings no tiene el hook niega-aprobar.cjs');
  if (!cmds.some((x) => x.includes('escritura-docs.cjs'))) mal('el settings no tiene el hook escritura-docs.cjs');
  if (cmds.some((x) => x.includes('session-start.sh'))) mal('el settings sigue con session-start.sh');
  if (!((s.permissions || {}).deny || []).includes('Write(./.claude/cambios/**)')) mal('el settings no niega Write a .claude/cambios');
} catch (e) { mal('el settings no se lee: ' + e.message); }
console.log(problemas.join('\n'));
JS

# $1 nombre · $2 paso (2b|3) · $3 molde viejo · $4 molde nuevo · $5 zona-propia.cjs de ese molde: instancia, corre el candado antes y
# después del commit y comprueba la ficha y el settings recién escritos (con el molde de ESE paso: al final ya solo queda el último)
molde_paso() {
  local x=$1 paso=$2 viejo=$3 nuevo=$4 zona=$5 d="$DEST/$1" rc=0 sal
  local msg="molde v3 orden $paso"
  git_pruebas -C "$d" show HEAD:.claude/kit.md > "$TMPD/prev-$paso-$x.md"   # la ficha del commit anterior, para ver qué no se tocó
  node "$TMPD/molde-v3b.cjs" "$viejo" "$nuevo" "$d" "$FICHA" "$zona" "$paso"
  git_pruebas -C "$d" add -A
  if [ "$paso" = 3 ]; then   # los sh de .githooks/, ejecutables en el índice (en Windows el modo del disco no cuenta)
    git_pruebas -C "$d" update-index --chmod=+x .githooks/pre-commit .githooks/pre-merge-commit .githooks/pre-push
  fi
  # criterio 20: con --molde, la exención (a) deja pasar el commit del molde (0); sin --molde no hay exención (1, candado:barreras)
  local extra=(); [ "$paso" = 3 ] && extra=(--molde-viejo "$viejo")   # el 2b corre el estructura.cjs de D2.2, que no conoce la bandera
  sal=$(cd "$d" && sin_config node .claude/scripts/estructura.cjs barreras --molde "$nuevo" "${extra[@]}" --sin-log 2>&1) || rc=$?
  if [ "$rc" -ne 0 ]; then
    echo "rehacer.sh: $x: estructura.cjs barreras --molde dio $rc en el paso $paso (esperaba 0):" >&2; printf '%s
' "$sal" >&2; exit 1
  fi
  rc=0
  sal=$(cd "$d" && sin_config node .claude/scripts/estructura.cjs barreras --sin-log 2>&1) || rc=$?
  if [ "$rc" -ne 1 ] || ! printf '%s
' "$sal" | grep -qF 'candado:barreras'; then
    echo "rehacer.sh: $x: estructura.cjs barreras sin --molde dio $rc en el paso $paso (esperaba 1 con candado:barreras):" >&2; printf '%s
' "$sal" >&2; exit 1
  fi
  git_pruebas -C "$d" commit -q -m "$msg"
  git_pruebas -C "$d" push -q origin main
  # el molde recién instanciado cumple su propio candado (se anota el resultado; la validación final lo cobra)
  rc=0
  sal=$(cd "$d" && sin_config node .claude/scripts/estructura.cjs todo --sin-log 2>&1) || rc=$?
  T_ESTRUC[$x]=$rc
  printf '%s
' "$sal" > "$TMPD/estructura-todo-$paso-$x.txt"
  [ "$rc" -eq 0 ] || T_ESTRUC_MAL[$x]="$paso"
  node "$TMPD/comprobar-2b.cjs" "$FICHA" "$zona" "$nuevo" "$d" "$TMPD/prev-$paso-$x.md" "$paso" > "$TMPD/comprobar-$paso-$x.txt" 2>&1 || true
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
  git_pruebas -C "$DEST/$x" add -A
  git_pruebas -C "$DEST/$x" commit -q -m "ficha del kit (fixture)"
  con_remoto "$x"
done

# el paso del molde v3: alfa y beta, nunca gama; --solo-tag lo salta
if [ "$SOLO_TAG" = no ]; then
  molde_v3 alfa "repo de prueba alfa: estandar, con código de node" suma tests "base de prueba (ALFA_DB_URL)" \
    gama "nada todavía (la mesa con gama está declarada en la ficha)" "nadie"
  molde_v3 beta "repo de prueba beta: liviano, sin código" docs kit "ninguna" \
    ninguna "nada" "nadie"
  molde_paso alfa 2b "$MOLDE3" "$MOLDE3B" "$ZONA22"
  molde_paso beta 2b "$MOLDE3" "$MOLDE3B" "$ZONA22"
  molde_paso alfa 3 "$MOLDE3B" "$MOLDE3C" "$ZONA"
  molde_paso beta 3 "$MOLDE3B" "$MOLDE3C" "$ZONA"
fi

# --- validación final (junta todo, sale con 1 si algo falló)
FALLOS=()
IDENTIDAD_ESPERADA="$IDENTIDAD_NOMBRE|$IDENTIDAD_MAIL|$IDENTIDAD_NOMBRE|$IDENTIDAD_MAIL"
declare -A T_NIVEL T_FICHA T_TESTS T_REMOTO T_HUELLA
for x in alfa beta gama; do
  d="$DEST/$x"
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
  # el paso del molde v3 (criterio 12 del paquete 2): alfa y beta lo tienen, gama no; --solo-tag no lo aplica a nadie
  T_HUELLA[$x]="-"
  if [ "$SOLO_TAG" = no ] && [ "$x" != gama ]; then
    for f in docs/NORTE.md docs/MAPA.md docs/SESSION_HANDOFF.md docs/TODO.md docs/CHANGELOG.md docs/README.md \
             docs/referencia/trampas.md docs/referencia/PRUEBA.md CLAUDE.md .gitignore .gitattributes \
             .claude/hooks/session-start.cjs .claude/hooks/escritura-docs.cjs .claude/hooks/lib/arbol.cjs .claude/scripts/todo.cjs; do
      [ -f "$d/$f" ] || FALLOS+=("$x: falta $f (paso del molde v3)")
    done
    [ ! -e "$d/.claude/hooks/session-start.sh" ] || FALLOS+=("$x: sigue el session-start.sh viejo")
    if [ -n "$(find "$d" -name '*.test.cjs' -not -path '*/.git/*' | head -n1)" ]; then FALLOS+=("$x: se coló un *.test.cjs"); fi
    for p in .env .env.local .claude/settings.local.json .kit-rol .claude/worktrees/x/a; do
      git_pruebas -C "$d" check-ignore -q -- "$p" || FALLOS+=("$x: $p debería estar ignorado")
    done
    if git_pruebas -C "$d" check-ignore -q -- .vscode/launch.json; then FALLOS+=("$x: .vscode/launch.json no debería estar ignorado"); fi
    git_pruebas -C "$d" check-attr merge -- .claude/frenos.log | grep -qxF '.claude/frenos.log: merge: union' \
      || FALLOS+=("$x: .claude/frenos.log no tiene merge=union")
    [ "$(cd "$d" && node "$FICHA" campo .claude/kit.md piezas.hook-escritura 2>/dev/null)" = molde ] || FALLOS+=("$x: la ficha no dice hook-escritura: molde")
    # el hash del arranque es el del archivo; el de settings, de skills inicio/cierre y lo demás de la ficha lo cobra comprobar-2b.cjs
    hf=$(cd "$d" && node "$FICHA" campo .claude/kit.md piezas.hook-arranque.hash 2>/dev/null) || hf=""
    [ "$hf" = "$(hash_de "$d" .claude/hooks/session-start.cjs)" ] || FALLOS+=("$x: el hash de hook-arranque en la ficha no es el del archivo")
    [ -z "$(git_pruebas -C "$d" status --porcelain)" ] || FALLOS+=("$x: el árbol quedó sucio tras los commits del molde v3")
    # los tres commits, en orden: el de D2.1, encima el de D2.2 y encima el de D3.3
    [ "$(git_pruebas -C "$d" log -1 --format=%s)" = "molde v3 orden 3" ] || FALLOS+=("$x: el último commit no es 'molde v3 orden 3'")
    [ "$(git_pruebas -C "$d" log -2 --format=%s | tail -n1)" = "molde v3 orden 2b" ] || FALLOS+=("$x: el penúltimo commit no es 'molde v3 orden 2b'")
    [ "$(git_pruebas -C "$d" log -3 --format=%s | tail -n1)" = "molde v3 orden 2" ] || FALLOS+=("$x: el antepenúltimo commit no es 'molde v3 orden 2'")
    # lo de D3.3 (orden 3): .githooks/ con los tres sh en 100755 en el índice, el runner sin su prueba, LF, y core.hooksPath sin setear
    for f in pre-commit pre-merge-commit pre-push; do
      m=$(git_pruebas -C "$d" ls-files -s -- ".githooks/$f" | cut -d' ' -f1)
      [ "$m" = 100755 ] || FALLOS+=("$x: .githooks/$f debería estar 100755 en el índice (es '${m:-ausente}')")
      ! grep -q $'\r' "$d/.githooks/$f" || FALLOS+=("$x: .githooks/$f tiene CRLF")
    done
    [ -f "$d/.githooks/kit-githook.cjs" ] || FALLOS+=("$x: falta .githooks/kit-githook.cjs")
    ! grep -q $'\r' "$d/.githooks/kit-githook.cjs" || FALLOS+=("$x: .githooks/kit-githook.cjs tiene CRLF")
    [ "$(git_pruebas -C "$d" ls-files .githooks | wc -l)" -eq 4 ] || FALLOS+=("$x: .githooks/ debería versionar exactamente 4 archivos (tres sh y el runner)")
    for f in .claude/hooks/git-seguro.cjs .claude/hooks/sensible.cjs .claude/hooks/lib/comando.cjs .claude/hooks/lib/db-guardia.cjs .claude/hooks/lib/agente.cjs; do
      [ -f "$d/$f" ] || FALLOS+=("$x: falta $f (paso orden 3)")
    done
    git_pruebas -C "$d" check-attr eol -- .githooks/pre-commit | grep -qxF '.githooks/pre-commit: eol: lf' || FALLOS+=("$x: .githooks/* no tiene eol=lf")
    [ -z "$(git_pruebas -C "$d" config --local --get core.hooksPath || true)" ] || FALLOS+=("$x: core.hooksPath está seteado antes del arranque (no lo pone rehacer.sh)")
    [ "$(git_pruebas -C "$d" rev-parse HEAD)" = "$(git_pruebas -C "$d" rev-parse origin/main)" ] || FALLOS+=("$x: el remoto no está al día")
    # lo de D2.2 (orden 2b) presente
    for f in .claude/hooks/niega-aprobar.cjs .claude/hooks/lib/zona-propia.cjs .claude/hooks/lib/candado.cjs .claude/hooks/lib/barreras.cjs \
             .claude/hooks/lib/cambios.cjs .claude/hooks/lib/cambios-ruta.cjs .claude/hooks/lib/fabrica.cjs \
             .claude/hooks/lib/fabrica/ficha.liviano.md .claude/hooks/lib/fabrica/ficha.estandar.md \
             .claude/scripts/estructura.cjs .claude/scripts/cambios.cjs .claude/scripts/agents.cjs \
             .claude/skills/inicio/SKILL.md .claude/skills/cierre/SKILL.md; do
      [ -f "$d/$f" ] || FALLOS+=("$x: falta $f (paso orden 2b)")
    done
    # la ficha y el settings de cada paso, comprobados en el momento (con el molde de ese paso): ver molde_paso
    for paso in 2b 3; do
      [ -f "$TMPD/comprobar-$paso-$x.txt" ] || { FALLOS+=("$x: no hay comprobación del paso $paso"); continue; }
      while IFS= read -r p; do [ -z "$p" ] || FALLOS+=("$x: [paso $paso] $p"); done < "$TMPD/comprobar-$paso-$x.txt"
    done
    [ -z "${T_ESTRUC_MAL[$x]:-}" ] || FALLOS+=("$x: estructura.cjs todo no dio 0 tras el paso ${T_ESTRUC_MAL[$x]}")
    # el candado propio del molde recién instanciado (estructura.cjs todo --sin-log, corrido tras el push)
    T_ESTRUC[$x]=${T_ESTRUC[$x]:-?}
    if [ "${T_ESTRUC[$x]}" != 0 ]; then
      FALLOS+=("$x: estructura.cjs todo dio ${T_ESTRUC[$x]} (esperaba 0); su salida:")
      while IFS= read -r p; do FALLOS+=("    $p"); done < "$TMPD/estructura-todo-3-$x.txt"
    fi
    # la huella del hook de arranque: el `!` del session_id evita que deje marca de sesión
    cwdw=$(cd "$d" && { pwd -W 2>/dev/null || pwd; })
    rc=0
    salida=$(cd "$d" && printf '{"cwd":"%s","session_id":"prueba!"}' "$cwdw" | node .claude/hooks/session-start.cjs 2>"$TMPD/arranque-$x.err") || rc=$?
    huella=$(printf '%s\n' "$salida" | tail -n1 | sed -n 's/^inyectado: \([0-9.]*\) de 9\.700$/\1/p')
    if [ "$rc" -eq 0 ] && [ -n "$huella" ]; then T_HUELLA[$x]=$huella; else T_HUELLA[$x]="MAL"; FALLOS+=("$x: el hook de arranque no dio huella (salida $rc)"); fi
    # el arranque (orden 3) setea core.hooksPath en el config LOCAL del repo: se saca, el fixture queda como lo armó el commit
    # (no cambia ningún SHA: el config no se versiona). Quien prueba el arranque lo setea de nuevo en su clon.
    git_pruebas -C "$d" config --local --unset core.hooksPath 2>/dev/null || true
    [ -z "$(git_pruebas -C "$d" config --local --get core.hooksPath || true)" ] || FALLOS+=("$x: no pude sacar core.hooksPath del config local")
  elif [ "$x" = gama ] || [ "$SOLO_TAG" = si ]; then
    if [ -e "$d/.claude/hooks/session-start.cjs" ] || [ -e "$d/.claude/hooks/escritura-docs.cjs" ]; then FALLOS+=("$x: debería estar pura, sin el molde v3"); fi
    [ -f "$d/.claude/hooks/session-start.sh" ] || FALLOS+=("$x: le falta el session-start.sh del molde v2")
    for f in .claude/hooks/niega-aprobar.cjs .claude/hooks/lib/zona-propia.cjs .claude/hooks/lib/candado.cjs .claude/hooks/lib/fabrica \
             .claude/scripts/estructura.cjs .claude/scripts/cambios.cjs .claude/scripts/agents.cjs .claude/cambios; do
      [ ! -e "$d/$f" ] || FALLOS+=("$x: tiene $f y debería estar pura, sin el orden 2b")
    done
    [ ! -e "$d/.githooks" ] || FALLOS+=("$x: tiene .githooks/ y debería estar pura, sin el orden 3")
    ! grep -qF 'kit:propio' "$d/.claude/skills/inicio/SKILL.md" "$d/.claude/skills/cierre/SKILL.md" || FALLOS+=("$x: sus skills traen zona propia: no es la v2 pura")
    [ "$(git_pruebas -C "$d" log -1 --format=%s)" = "ficha del kit (fixture)" ] || FALLOS+=("$x: el último commit no es el de la ficha")
  fi
done
printf '%-6s %-9s %-6s %-7s %-7s %-7s %-7s %s\n' repo nivel ficha tests remoto huella estruc head
for x in alfa beta gama; do
  printf '%-6s %-9s %-6s %-7s %-7s %-7s %-7s %s\n' "$x" "${T_NIVEL[$x]}" "${T_FICHA[$x]}" "${T_TESTS[$x]}" "${T_REMOTO[$x]}" "${T_HUELLA[$x]}" "${T_ESTRUC[$x]:--}" "$(git_pruebas -C "$DEST/$x" rev-parse --short=10 HEAD)"
done
if [ "${#FALLOS[@]}" -gt 0 ]; then
  printf '  - %s\n' "${FALLOS[@]}"
  echo "pruebas: FALLÓ — ${FALLOS[0]}"
  exit 1
fi
if [ "$EVIDENCIA" = si ]; then   # lo que mira quien revisa (criterio 12 del paquete 2): SHAs, archivos, ignorados, atributos
  for x in alfa beta gama; do
    d="$DEST/$x"
    echo "== $x"
    git_pruebas -C "$d" log --format='commit %H %s'
    echo "-- archivos versionados:"; git_pruebas -C "$d" ls-files | sed 's/^/   /'
    if [ "$SOLO_TAG" = no ] && [ "$x" != gama ]; then
      echo "-- git check-ignore -v:"
      for p in .env .env.local .claude/settings.local.json .kit-rol .claude/worktrees/x/a .vscode/launch.json; do
        git_pruebas -C "$d" check-ignore -v -- "$p" | sed 's/^/   ignorado  /' || echo "   NO ignorado  $p"
      done
      echo "-- git check-attr merge .claude/frenos.log:"; git_pruebas -C "$d" check-attr merge -- .claude/frenos.log | sed 's/^/   /'
      echo "-- hooks del settings.json:"; (cd "$d" && node -e 'const h=JSON.parse(require("fs").readFileSync(".claude/settings.json","utf8")).hooks;for(const k of Object.keys(h))for(const e of h[k])for(const c of e.hooks)console.log("   "+k+" ["+(e.matcher||"")+"] "+c.command)')
      echo "-- piezas de la ficha:"; sed -n '/^piezas:/,/^[a-z]/p' "$d/.claude/kit.md" | grep -E '^  (hook-|settings)' | sed 's/^/   /'
      echo "-- git status --short: $(git_pruebas -C "$d" status --short | wc -l) renglones"
    fi
  done
fi
echo "repos de prueba en: $DEST"
echo "pruebas: LISTO"
