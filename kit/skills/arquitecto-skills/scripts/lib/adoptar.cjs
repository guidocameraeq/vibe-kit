'use strict';
// adoptar.cjs — `actualizar.cjs adoptar`: el adoptador (SPEC-0 P7.2; SPEC-paquete-6 D6-1, D6-12, criterio 19; crit. 20 del kit).
//
//   node actualizar.cjs adoptar <carpeta> --kit <raíz del kit> --mirar [--nivel liviano|estandar] [--propuesta <archivo>] [--nuevo]
//                               [--comando-test "<comando>"]
//   node actualizar.cjs adoptar <carpeta> --kit <raíz del kit> --aplicar <archivo de propuesta> [--fecha <AAAA-MM-DD>]
//                               [--principal <carpeta principal>] [--claude-md]
//                               [--director kit] [--permisos recomendada] [--arranque kit]   (D1-D3: SPEC-paquete-8r2, t3 y t9)
//
// Un script determinista (D6-1): MIRA y APLICA. La pantalla (NORTE, MAPA, el plano de docs/, las reglas propias como cambios) la
// arma la sesión del Arquitecto con Guido delante, leyendo la propuesta (D6-12): eso necesita leer el código y no es de un script.
//
// La propuesta = UNA FICHA con la gramática de .claude/kit.md (la lee pc/lib/ficha.cjs tal cual) con lo que se vio arriba, en
// comentarios entre MARCA_INI y MARCA_FIN (ese bloque se va al aplicar). kit: la versión del --kit; nivel: --nivel, o con código →
// estandar y sin código → liviano; vars: proyecto (el nombre de la carpeta) y comando-test/comando-setup si salen de package.json
// o de requirements.txt/pyproject.toml; frenos, sensible y autorizado: los de la ficha de fábrica del nivel, línea por línea (así
// el commit de la ficha pasa por la exención (b) de barreras). piezas: TODAS las del catálogo de forma 3 que viajan:
//   - base → molde: la ficha, inicio, cierre, hook-arranque (el hook con tope), las barreras (settings, hook-escritura,
//     hook-git-seguro, hook-sensible, cambios-metodo, githooks), docs (solo el nacimiento: crea lo que falta) y lo que eso necesita
//     para andar (hooks-lib: la usan todos los hooks; scripts: cambios.cjs, todo.cjs y los que llaman /inicio y /cierre);
//   - candado → no (apagado hasta migrar), pero su archivo (scripts/estructura.cjs) viene igual: barreras corre desde ahí;
//   - opcionales (smoke, release, director-obrero, estado, docs-fyd) → no; docs-fyd se ofrece en el comentario;
//   - salvo en estandar (un repo con código; SPEC-paquete-8r T1, D8r-3): director-obrero y estado → sí (el módulo con director
//     necesita /director y /obrero), o propia si alguno de sus archivos ya está y es distinto (si es solo en agents/, los nombra);
//     va después del corte del criterio 19 (sin CLAUDE.md ni --nuevo, igual todo en no);
//   - una base con un archivo del proyecto en su ruta, distinto del molde → propia (no se pisa), y el comentario lo dice;
//   - sin ficha ni CLAUDE.md → todo en no (criterio 19, caso de falla): la propuesta sale igual y la sesión decide.
//   - --nuevo (el Modo A: un repo que acaba de nacer, con o sin CLAUDE.md; SPEC-paquete-8b (15), D8b-8): las bases → molde (no el
//     todo en no del criterio 19), candado → sí, director-obrero y estado → sí (todo proyecto nuevo nace con módulos); docs-fyd y
//     las otras opcionales, como siempre.
// El molde v2: de los tags v2.* del --kit con templates/universales/, el que más casa con el proyecto. Un archivo del proyecto
// que es esa plantilla con sus {{…}} completados y nada más ("el v2 sin editar"; los de contenido, como {{BUGS_HISTORICOS}}, solo
// vacíos o tal cual: llenos son contenido propio → propia, y el comentario lo dice) es el molde viejo intacto: al aplicar se
// reemplaza (inicio, cierre) o se retira (session-start.sh, check-code.js, y sus reglas del settings por la mezcla). A aplicar
// le llega como molde viejo ese v2 con el texto del proyecto en lo que casó; sin tag v2, el molde nuevo hace de viejo.
//
// --aplicar: se niega (1) si ya hay ficha ("eso es actualizarlo: flota"), si la propuesta no se lee o es de otro kit, y como
// aplicar (sucia salvo .kit-rol, .kit-rol ≠ actualizador). Reusa el planificador de aplicar (planear con la ficha propuesta) y de
// su plan se queda con lo de las piezas molde: lo de una no o una propia no se escribe. CLAUDE.md: si no hay, nace el del molde; si
// hay, no se toca, salvo --claude-md (8r, 4): le suma al final la sección "El tamaño del pedido" del molde (si no la trae), en el
// commit de las piezas. Escritura atómica (ejecutar de aplicar). No commitea: van DOS commits, las piezas y después la ficha sola,
// porque la exención (b) compara contra la ficha de fábrica DEL ÁRBOL DEL PADRE (barreras.cjs, exencionB) y la fábrica llega con
// las piezas. La ficha con frenos, sensible o autorizado distintos de fábrica da rojo en barreras: lo aprueba Guido después.
// Después va barreras --rango <antes>..HEAD; chequear no, porque pide la ficha en la base (corre desde la primera puesta al día).
// Una pieza en sí (las opcionales que prendió la sesión, o las de --nuevo) se trae como una molde.
//
// --principal (SPEC-paquete-8b (14), D8b-9): ya escrito el clon (ahí NO se prende: el pre-commit frenaría la ficha; r1-5), en la
// carpeta principal, validada (r1-7: su raíz git, sin .kit-rol, y el origin del clon es ella o el mismo que el de ella),
// core.hooksPath → .githooks con las reglas de ponerHooksPath del hook de arranque, más una (r1-6): vacío y sin .githooks/ en el
// disco, solo si .git/hooks no tiene hooks propios (fuera de *.sample); con otro valor (husky, lefthook), solo si .githooks/ ya está
// en el disco. Si no, "queda para el arranque" (el primer arranque después del pull). Solo --local; una línea "githooks · …".

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const F = require('../../pc/lib/ficha.cjs');
const Z = require('../../pc/lib/zona-propia.cjs');
const C = require('./catalogo.cjs');
const M = require('./molde.cjs');
const A = require('../actualizar.cjs');

const { Negativa } = A;
const RUTA_FICHA = '.claude/kit.md';
const RUTA_SETTINGS = '.claude/settings.json';
const RUTA_CHANGELOG = 'docs/CHANGELOG.md';
const MARCA_INI = '# ==== lo que vio el adoptador (este bloque se va al aplicar) ====';
const MARCA_FIN = '# ==== fin de lo que vio el adoptador ====';
const NIVELES = ['liviano', 'estandar'];
const DE_FABRICA = ['frenos', 'sensible', 'autorizado'];
const TRAE = ['molde', 'molde+propio', 'sí'];
// --nuevo: las opcionales que nacen prendidas (D8b-8: todo proyecto nuevo nace con módulos) y el candado, prendido.
const NUEVO_SI = ['candado', 'director-obrero', 'estado'];
// estandar (un repo con código, sin --nuevo): las del módulo con director, en sí salvo lo propio (SPEC-paquete-8r, T1; D8r-3).
const MODULOS = ['director-obrero', 'estado'];
// La sección del CLAUDE.md que pide doctor (chReglaTamano: la misma regla) y que --claude-md suma del molde (8r, 4).
const RE_TAMANO = /^#{1,6}[ \t]+El tamaño del pedido[ \t]*$/m;
const MIGRAR = 'node "$HOME/.claude/skills/arquitecto-skills/scripts/migrar-cambios.cjs"';
const FUENTE_CAMBIOS = 'docs/metodo/CAMBIOS.md'; // la de fábrica de migrar-cambios.cjs (sin --fuente)
// Las skills del kit que viven en ~/.claude: una copia adentro del repo se queda vieja sola.
const COPIAS_KIT = ['.claude/skills/arquitecto', '.claude/skills/arquitecto-skills', '.claude/skills/docs-fyd', '.claude/skills/relevamiento'];
const V2 = ['.claude/hooks/session-start.sh', '.claude/hooks/check-code.js'];
// El nivel: con código → estandar. Código = un manifiesto en la raíz o un archivo de código fuera de lo del método y lo generado.
const MANIFIESTOS = ['package.json', 'pyproject.toml', 'requirements.txt', 'go.mod', 'Cargo.toml', 'pom.xml', 'build.gradle', 'composer.json', 'Gemfile'];
const RE_CODIGO = /\.(c?js|mjs|jsx|tsx?|py|go|rs|java|kts?|cs|rb|php|swift|c|cc|cpp|h|hpp|sql|vue|svelte|dart|scala|exs?)$/i;
const NO_MIRAR = new Set(['.git', '.claude', '.githooks', 'docs', 'node_modules', 'vendor', 'dist', 'build', '.venv', 'venv', '__pycache__', '.next', 'coverage']);

const lf = M.lf;
const esMapa = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const estadoDe = (v) => (esMapa(v) ? v.estado : v);
const huella = (rel, t) => (/\.md$/i.test(rel) ? Z.hashPieza(t) : F.hash(t));
const iguales = (rel, a, b) => huella(rel, a) === huella(rel, b);
const valorEstado = (e) => (/[\s()]/.test(e) ? `"${e}"` : e);
// Un texto de la ficha: crudo si es simple; si no, entre comillas dobles (adentro no puede ir ni " ni \: eso no se escribe).
const valorTexto = (s) => (/^[A-Za-z0-9][A-Za-z0-9 ._/@+=-]*$/.test(s) && !/\s$/.test(s) ? s : `"${s}"`);
const escribible = (s) => typeof s === 'string' && s.trim() !== '' && !/["\\\r\n]/.test(s);
const listaCorta = (xs, n = 3) => (xs.length > n ? `${xs.slice(0, n).join(', ')} y ${xs.length - n} más` : xs.join(', '));

function hoy() {
  const d = new Date();
  const z = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

// Solo lectura: nada de git status (refresca el índice y escribe en .git).
function gitEn(cwd, args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', windowsHide: true, env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } });
  return { ok: !r.error && r.status === 0, out: r.stdout || '', err: String(r.stderr || (r.error && r.error.message) || '') };
}

const real = (p) => {
  try { return fs.realpathSync.native(p); } catch { return path.resolve(p); }
};
const comparable = (p) => (process.platform === 'win32' ? real(p).toLowerCase() : real(p));

function leerP(carpeta, rel) {
  const p = path.join(carpeta, ...rel.split('/'));
  try {
    return fs.statSync(p).isFile() ? fs.readFileSync(p, 'utf8') : null;
  } catch {
    return null;
  }
}
const hay = (carpeta, rel) => fs.existsSync(path.join(carpeta, ...rel.split('/')));
const trackeado = (carpeta, rel) => gitEn(carpeta, ['ls-files', '--error-unmatch', '--', rel]).ok;

// RF-fix 2: la PC atrás. El --kit es un clon parado en v<~/.claude/VERSION>; si el clon ya tiene un tag más nuevo (el que va, como
// `actualizar.cjs ultimo-tag`), adoptar trae el molde viejo. Una línea de aviso, o null (sin tags que leer, tampoco: no frena).
function avisoKitAtras(kit, version) {
  const FL = require('./flota.cjs');
  let ult;
  try {
    ult = FL.elegirTag(FL.tagsDe(kit));
  } catch {
    return null;
  }
  if (FL.compararTags(ult, `v${version}`) <= 0) return null;
  return `⚠ el --kit tiene el tag ${ult}, más nuevo que su kit/VERSION (${version}): esta PC está atrás — primero "actualizate" y adoptá con un clon parado en ${ult} (con este, el repo nace con el molde de ${version})`;
}

// RF-fix 9: la exención b de barreras pide que la ficha no haya existido NUNCA. Si .claude/kit.md estuvo en alguna rama, el commit de
// la ficha da rojo aunque sea de fábrica. El commit corto donde aparece, o null.
function fichaEnLaHistoria(carpeta) {
  const r = gitEn(carpeta, ['log', '--all', '-1', '--format=%h', '--', RUTA_FICHA]);
  return r.ok && r.out.trim() ? r.out.trim() : null;
}
// El camino de un commit de la adopción que da rojo en barreras (la ficha distinta de fábrica, D4, los permisos de D2/D3).
const APRUEBA = 'eso lo aprueba Guido después del merge, desde su checkout (cambios nuevo + cambios aprobar)';
const lineaFichaVieja = (sha) => `${RUTA_FICHA} ya estuvo en la historia (commit ${sha}) y la exención b pide que no haya existido nunca: el commit de la ficha da ROJO en barreras — ${APRUEBA}`;

// La carpeta: la raíz de un repo git, sin ficha.
function revisarRaiz(carpeta) {
  if (!fs.existsSync(carpeta) || !fs.statSync(carpeta).isDirectory()) throw new Negativa(`${carpeta} no es una carpeta`);
  const top = gitEn(carpeta, ['rev-parse', '--show-toplevel']);
  if (!top.ok || comparable(top.out.trim()) !== comparable(carpeta)) throw new Negativa(`${carpeta} no es la raíz de un repo git — no toco nada`);
  if (hay(carpeta, RUTA_FICHA)) throw new Negativa(`${carpeta} ya tiene ficha (${RUTA_FICHA}) — eso es actualizarlo: flota, no adoptarlo`);
}

// ---------------------------------------------------------------- el molde v2 y "el v2 sin editar"

// ¿texto es la plantilla con sus {{…}} completados (con lo que sea, también nada) y ningún otro cambio? Sin regex: prefijo, sufijo
// y los pedazos fijos del medio en orden, el primero que aparece (con solo comodines, el más a la izquierda nunca pierde un caso).
// → null si no casa, o [[marcador, lo que se comió]] en orden.
function comodinesDe(plantilla, texto) {
  const p0 = lf(plantilla);
  const marcas = p0.match(/\{\{[^{}]*\}\}/g) || [];
  const partes = p0.split(/\{\{[^{}]*\}\}/);
  const t = lf(texto);
  if (partes.length === 1) return t === partes[0] ? [] : null;
  const ultima = partes[partes.length - 1];
  if (!t.startsWith(partes[0]) || t.length < partes[0].length + ultima.length) return null;
  let i = partes[0].length;
  const tope = t.length - ultima.length;
  const comidos = [];
  for (const p of partes.slice(1, -1)) {
    const j = t.indexOf(p, i);
    if (j < 0 || j + p.length > tope) return null;
    comidos.push(t.slice(i, j));
    i = j + p.length;
  }
  if (!t.endsWith(ultima)) return null;
  comidos.push(t.slice(i, tope));
  return marcas.map((m, k) => [m, comidos[k]]);
}
function casaPlantilla(plantilla, texto) {
  return comodinesDe(plantilla, texto) !== null;
}
// Los marcadores de VALOR CORTO (el nombre del proyecto, una fecha): completarlos es instanciar. Los demás son de CONTENIDO
// ({{BUGS_HISTORICOS}}, {{COMANDO_SALUD_OPCIONAL}}, …): lleno con algo que no sea nada o la nota de la plantilla (el {{…}} tal
// cual), es contenido propio que el molde nuevo pisaría — el archivo no es "el v2 sin editar".
const CORTOS = new Set(['PROYECTO', 'YYYY-MM-DD', 'FECHA', 'FECHA_HORA']);
const nombreMarca = (m) => m.slice(2, -2).split(' — ')[0].trim();
function contenidoPropio(plantilla, texto) {
  const c = comodinesDe(plantilla, texto);
  if (!c) return null;
  return c.filter(([m, x]) => !CORTOS.has(nombreMarca(m)) && x.trim() !== '' && x !== m).map(([m]) => nombreMarca(m));
}

const versionDeTag = (t) => t.slice(1).split('.').map(Number);
function compararTags(a, b) {
  const x = versionDeTag(a);
  const y = versionDeTag(b);
  for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (y[i] || 0) - (x[i] || 0);
  return 0;
}

// Los archivos de un molde v2 que son "el v2 sin editar" en el proyecto: [{ rel, proyecto, texto }]. El settings no cuenta (la mezcla
// es regla por regla), CLAUDE.md y docs/ tampoco (nunca y nacimiento). Los que casan pero traen contenido propio en un marcador de
// contenido no cuentan: van a `propios` ({ proyecto, marcadores }), para el comentario de la propuesta.
function casadosCon(carpeta, dir, propios = []) {
  const out = [];
  for (const rel of C.rutasDeMolde(dir)) {
    if (rel === 'settings.json' || rel === 'CLAUDE.md' || rel.startsWith('docs/')) continue;
    const rp = C.rutaEnProyecto(rel);
    const t = rp === null ? null : leerP(carpeta, rp);
    const propio = t === null ? null : contenidoPropio(fs.readFileSync(path.join(dir, ...rel.split('/')), 'utf8'), t);
    if (propio && propio.length) propios.push({ proyecto: rp, marcadores: propio });
    else if (propio) out.push({ rel, proyecto: rp, texto: lf(t) });
  }
  return out;
}

// El molde viejo para aplicar: de los tags v2.* del --kit con templates/universales/ (sin vars: los {{…}} quedan, son los comodines),
// el que más archivos del proyecto casa como "el v2 sin editar" (empate → el más nuevo), con el texto del proyecto en cada uno (así
// el guardia de aplicar los ve intactos y los reemplaza o los retira). null si el kit no tiene ninguno.
// → { dir, forma, version, casados: [rutas del proyecto] }
function moldeV2(kit, carpeta, destino) {
  const r = gitEn(kit, ['tag', '-l', 'v2.*']);
  const tags = r.ok ? r.out.split(/\r?\n/).map((x) => x.trim()).filter((x) => /^v2\.\d+(\.\d+)?$/.test(x)).sort(compararTags) : [];
  let mejor = null;
  for (const t of tags) {
    const dir = `${destino}-${t}`;
    let m = null;
    try {
      m = M.materializarViejo(kit, t.slice(1), {}, dir);
    } catch { /* ese tag no trae un molde que conozca */ }
    if (!m || m.forma !== '2.4') {
      M.borrar(dir);
      continue;
    }
    const propios = [];
    const casados = casadosCon(carpeta, dir, propios);
    if (!mejor || casados.length > mejor.casados.length) {
      if (mejor) M.borrar(mejor.dir);
      mejor = { ...m, version: t.slice(1), casados, propios };
    } else M.borrar(dir);
  }
  if (!mejor) return null;
  fs.renameSync(mejor.dir, destino);
  for (const c of mejor.casados) fs.writeFileSync(path.join(destino, ...c.rel.split('/')), c.texto);
  // Lo del v2 que el proyecto no tiene, fuera del molde viejo: en una adopción, un archivo que falta nunca estuvo (no lo borró el
  // dueño). Sin esto, el guardia de aplicar ve "(falta)" y manda la pieza a la fusión: un repo recién nacido (--nuevo) se quedaba
  // sin /inicio ni /cierre (SPEC-paquete-8b (15), la corrida de punta a punta). El settings y los snippets se quedan: van por su
  // mezcla, y la del settings necesita al viejo para retirar sus reglas.
  for (const rel of C.rutasDeMolde(destino)) {
    if (['settings.json', 'gitignore.snippet', 'gitattributes.snippet'].includes(rel)) continue;
    const rp = C.rutaEnProyecto(rel);
    if (rp !== null && !hay(carpeta, rp)) fs.rmSync(path.join(destino, ...rel.split('/')), { force: true });
  }
  return { dir: destino, forma: mejor.forma, version: mejor.version, casados: mejor.casados.map((c) => c.proyecto), propios: mejor.propios };
}

// ---------------------------------------------------------------- lo que se infiere

function inferirNivel(carpeta) {
  const vistos = MANIFIESTOS.filter((m) => hay(carpeta, m));
  const codigo = [];
  let mirados = 0;
  (function rec(d, rel) {
    if (codigo.length >= 3 || mirados > 20000) return;
    let es;
    try { es = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of es.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
      mirados++;
      const q = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) {
        if (!NO_MIRAR.has(e.name)) rec(path.join(d, e.name), q);
      } else if (e.isFile() && RE_CODIGO.test(e.name) && codigo.length < 3) codigo.push(q);
    }
  })(carpeta, '');
  const pruebas = [...vistos, ...codigo];
  return pruebas.length
    ? { nivel: 'estandar', porque: `hay código (${listaCorta(pruebas)})` }
    : { nivel: 'liviano', porque: 'no hay código (ni un manifiesto en la raíz ni archivos de código fuera de .claude/ y docs/)' };
}

function inferirVars(carpeta) {
  const base = path.basename(real(carpeta));
  const proyecto = escribible(base) ? base : base.replace(/["\\\r\n]/g, '-');
  const vars = { proyecto };
  const notas = [`proyecto = ${proyecto} (el nombre de la carpeta)`];
  const pj = leerP(carpeta, 'package.json');
  if (pj !== null) {
    let p = null;
    try { p = JSON.parse(pj); } catch { notas.push('package.json no se lee como JSON: sin comando-test ni comando-setup'); }
    if (p) {
      const t = p.scripts && typeof p.scripts.test === 'string' ? p.scripts.test : '';
      if (t && !/no test specified/.test(t)) {
        vars['comando-test'] = 'npm test';
        notas.push('comando-test = npm test (package.json tiene scripts.test)');
      }
      // RF-fix 3: con el lock COMMITEADO, el que no lo reescribe (npm ci, --frozen-lockfile); si no, el install a secas (en cada
      // worktree deja el lock sin trackear: worktree.cjs equipar lo saca del medio con info/exclude).
      const lock = [['pnpm-lock.yaml', 'pnpm install --frozen-lockfile', 'pnpm install'], ['yarn.lock', 'yarn install --frozen-lockfile', 'yarn install'], ['package-lock.json', 'npm ci', 'npm install']]
        .find(([f]) => hay(carpeta, f));
      const commiteado = !!lock && trackeado(carpeta, lock[0]);
      const setup = !lock ? 'npm install' : commiteado ? lock[1] : lock[2];
      vars['comando-setup'] = setup;
      notas.push(`comando-setup = ${setup} (package.json${!lock ? ', sin lock' : commiteado ? ` y su ${lock[0]} commiteado` : `; ${lock[0]} no está commiteado`})`);
    }
  } else {
    const req = leerP(carpeta, 'requirements.txt');
    const py = leerP(carpeta, 'pyproject.toml');
    if (req !== null) {
      vars['comando-setup'] = 'pip install -r requirements.txt';
      notas.push('comando-setup = pip install -r requirements.txt (requirements.txt)');
    }
    if (/\bpytest\b/.test(`${req || ''}\n${py || ''}`)) {
      vars['comando-test'] = 'pytest';
      notas.push('comando-test = pytest (lo nombra requirements.txt o pyproject.toml)');
    }
  }
  if (Object.keys(vars).length === 1) notas.push('sin comando-test ni comando-setup: no salen de ningún manifiesto (la sesión los suma si hay)');
  return { vars, notas };
}

// ---------------------------------------------------------------- mirar

// Los renglones frenos/autorizado/sensible de la ficha de fábrica del nivel, tal cual (con sus comentarios).
function bloquesFabrica(texto) {
  const ls = lf(texto).split('\n');
  const fin = ls.indexOf('---', 1);
  const out = [];
  let dentro = false;
  for (const l of ls.slice(1, fin)) {
    if (/^[a-z]/.test(l)) dentro = new RegExp(`^(${DE_FABRICA.join('|')}):`).test(l);
    if (dentro) out.push(l);
  }
  return out;
}

const textoDeFabrica = (moldeDir, nivel) => fs.readFileSync(path.join(moldeDir, 'hooks', 'lib', 'fabrica', `ficha.${nivel}.md`), 'utf8');
const canon = (v) => (Array.isArray(v) ? `[${v.map(canon).join(',')}]` : esMapa(v) ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canon(v[k])}`).join(',')}}` : JSON.stringify(v));
// Las claves de fábrica en que una ficha (datos) se aparta de la de fábrica del nivel.
const distintasDeFabrica = (datos, fab) => DE_FABRICA.filter((k) => canon(datos[k]) !== canon(fab[k]));

// Las reglas y los hooks del settings del proyecto que no son del molde (ni del nuevo ni del v2): candidatas a reglas propias.
function reglasPropias(carpeta, aN, aV) {
  const out = [];
  const t = leerP(carpeta, RUTA_SETTINGS);
  if (t !== null) {
    const leer = (x) => {
      if (x == null) return {};
      const r = Z.leerJsonSinDuplicados(x);
      return r.ok && esMapa(r.valor) ? r.valor : null;
    };
    const P = leer(t);
    const moldes = [leer(aN.get('settings.json')) || {}, leer(aV.get('settings.json')) || {}];
    if (!P) out.push(`${RUTA_SETTINGS} no se lee como JSON sin claves repetidas: la sesión lo mira a mano`);
    else {
      for (const k of ['deny', 'ask']) {
        const delMolde = new Set(moldes.flatMap((m) => (esMapa(m.permissions) && Array.isArray(m.permissions[k]) ? m.permissions[k] : [])));
        const propias = esMapa(P.permissions) && Array.isArray(P.permissions[k]) ? P.permissions[k] : [];
        for (const r of propias) if (!delMolde.has(r)) out.push(`${k} ${r}`);
      }
      const claves = (h) => {
        const s = new Set();
        if (!esMapa(h)) return s;
        for (const [ev, grupos] of Object.entries(h)) {
          if (!Array.isArray(grupos)) continue;
          for (const g of grupos) for (const x of (esMapa(g) && Array.isArray(g.hooks) ? g.hooks : [])) s.add(`${ev} ${g.matcher || '*'}: ${[x.command, ...(Array.isArray(x.args) ? x.args : [])].join(' ')}`);
        }
        return s;
      };
      const delMolde = new Set(moldes.flatMap((m) => [...claves(m.hooks)]));
      for (const h of claves(P.hooks)) if (!delMolde.has(h)) out.push(`hook ${h}`);
    }
  }
  return out;
}

// Los archivos de .claude/hooks/ que no son del molde nuevo ni el v2 sin editar.
function hooksPropios(carpeta, rutasMolde, casados) {
  const out = [];
  (function rec(d, rel) {
    let es;
    try { es = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of es.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
      const q = `${rel}/${e.name}`;
      if (e.isDirectory()) rec(path.join(d, e.name), q);
      else if (e.isFile() && !rutasMolde.has(q) && !casados.includes(q)) out.push(q);
    }
  })(path.join(carpeta, '.claude', 'hooks'), '.claude/hooks');
  return out;
}

// Un registro de cambios de método propio (Hermes): docs/cambios*, hasta dos niveles adentro de docs/.
function registroDeCambios(carpeta) {
  const out = [];
  (function rec(d, rel, prof) {
    let es;
    try { es = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of es.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
      const q = `${rel}/${e.name}`;
      if (/^cambios/i.test(e.name)) out.push(q);
      else if (e.isDirectory() && prof < 2) rec(path.join(d, e.name), q, prof + 1);
    }
  })(path.join(carpeta, 'docs'), 'docs', 1);
  return out;
}

// mirar(carpeta, {kit, nivel, fecha, nuevo, comandoTest}) → { texto: la propuesta, datos } — no escribe nada en <carpeta> ni en su .git.
function mirar(carpeta, opciones) {
  revisarRaiz(carpeta);
  const version = A.versionDelKit(opciones.kit);
  const fecha = opciones.fecha || hoy();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-adoptar-'));
  try {
    const inf = inferirNivel(carpeta);
    const nivel = opciones.nivel || inf.nivel;
    const { vars, notas } = inferirVars(carpeta);
    if (opciones.comandoTest !== undefined) {
      // el de "Entorno de prueba" del SPEC-0 (Modo A): le gana al de los manifiestos; sin él, un repo sin scripts.test traba el sello
      vars['comando-test'] = opciones.comandoTest;
      const i = notas.findIndex((n) => n.startsWith('sin comando-test'));
      if (i >= 0) notas.splice(i, 1);
      notas.push(`comando-test = ${opciones.comandoTest} (--comando-test: el Entorno de prueba del SPEC-0)`);
    }
    const nuevo = M.materializarNuevo(opciones.kit, { vars, fecha }, path.join(tmp, 'nuevo'));
    if (nuevo.forma !== '3') throw new Negativa('el --kit no trae kit/molde/ (el molde v3): con ese no se adopta');
    const viejo = moldeV2(opciones.kit, carpeta, path.join(tmp, 'viejo'));
    const aN = M.archivosDe(nuevo.dir);
    const aV = viejo ? M.archivosDe(viejo.dir) : new Map();
    const repN = C.repartir(nuevo.forma, C.rutasDeMolde(nuevo.dir));
    const repV = viejo ? C.repartir(viejo.forma, C.rutasDeMolde(viejo.dir)) : new Map();
    const conClaude = hay(carpeta, 'CLAUDE.md');
    const nuevoRepo = !!opciones.nuevo;
    const base = conClaude || nuevoRepo; // lo base va en molde; sin CLAUDE.md y sin --nuevo, todo en no (criterio 19)

    const piezas = []; // { id, estado, que }
    const d1 = []; // { id, distintos }: las del director (D1_PIEZAS) que quedan propia por un archivo distinto
    for (const [id, { pieza, archivos }] of repN) {
      if (['nunca', 'no-viaja', 'snippet'].includes(pieza.trato)) continue;
      const pone = (estado, que) => piezas.push({ id, estado, que });
      if (!base) {
        pone('no', 'sin ficha ni CLAUDE.md: todo en no (criterio 19); la sesión decide qué se prende');
        continue;
      }
      if (nuevoRepo && pieza.clase === C.OPCIONAL && NUEVO_SI.includes(id)) {
        pone('sí', 'proyecto nuevo (--nuevo): nace con módulos');
        continue;
      }
      // un repo con código (estandar): el módulo con director necesita /director y /obrero (8r, T1; D8r-3) — salvo lo propio, abajo
      const conModulos = nivel === 'estandar' && MODULOS.includes(id);
      if (pieza.clase === C.OPCIONAL && !conModulos) {
        pone('no', id === 'docs-fyd' ? 'opcional: se ofrece (si va, docs-fyd: sí; la skill es global y corre en la carpeta)' : 'opcional: no se trae');
        continue;
      }
      if (pieza.trato === 'nacimiento') {
        const nacen = archivos.filter((a) => leerP(carpeta, a.proyecto) === null).map((a) => a.proyecto);
        pone('molde', nacen.length ? `nacen ${nacen.length} (${listaCorta(nacen)}); lo que ya hay en docs/ no se toca` : 'ya están todos: no se toca nada');
        continue;
      }
      if (pieza.forma === 'settings') {
        const proyecto = leerP(carpeta, RUTA_SETTINGS);
        const r = Z.mezclarSettings({ viejo: aV.has('settings.json') ? aV.get('settings.json') : null, nuevo: aN.get('settings.json'), proyecto, quitados: [] });
        if (!r.ok) pone('propia', `${RUTA_SETTINGS} no se mezcla (${r.problema}): queda como está y los hooks del kit no quedan enchufados`);
        else pone('molde', proyecto === null ? 'nace' : 'se mezcla regla por regla: lo propio queda, lo del molde v2 sin tocar se va');
        continue;
      }
      const { distintos, delV2 } = distintosDe(carpeta, mapaDe(repN, aN, id), mapaDe(repV, aV, id));
      // D1 (8r2, t3): una de las cuatro del director con un archivo distinto (acá siempre sale propia) → el bloque D1 de abajo
      if (distintos.length && D1_PIEZAS.includes(id)) d1.push({ id, distintos });
      const ocupada = distintos.length ? `${listaCorta(distintos)} ya está y es distinto del molde` : '';
      if (conModulos) {
        if (!distintos.length) pone('sí', 'repo con código: el módulo con director necesita /director y /obrero');
        else {
          const skill = id === 'estado' ? '/estado' : '/director';
          const agentes = distintos.every((r) => r.startsWith('.claude/agents/'))
            ? ` — solo agentes propios (${distintos.map((r) => r.slice('.claude/agents/'.length).replace(/\.md$/i, '')).join(', ')}): la sesión le propone a Guido renombrar los suyos (p. ej. <nombre>-propio.md) y la pieza pasa a sí`
            : '';
          pone('propia', `⚠ ${listaCorta(distintos)} ya está y es distinto: ${skill} del kit no queda hasta resolverlo con Guido${agentes}`);
        }
      } else if (id === 'candado' && nuevoRepo) {
        pone('sí', `proyecto nuevo (--nuevo): prendido desde el primer commit${ocupada ? ` — ⚠ ${ocupada}: barreras no anda hasta resolverlo` : ''}`);
      } else if (id === 'candado') {
        pone('no', `apagado hasta migrar; .claude/scripts/estructura.cjs viene igual: barreras corre desde ahí${ocupada ? ` — ⚠ ${ocupada}: barreras no anda hasta resolverlo` : ''}`);
      } else if (distintos.length) {
        const conPropio = (viejo ? viejo.propios : []).filter((x) => distintos.includes(x.proyecto));
        const marcas = [...new Set(conPropio.flatMap((x) => x.marcadores))];
        pone('propia', `${ocupada}: no se pisa${marcas.length ? ` — trae contenido propio (${marcas.join(', ')}): llevalo a la zona propia antes de aplicar` : ''}`);
      }
      else pone('molde', delV2.length ? `${listaCorta(delV2)}: el molde v2 sin editar → se reemplaza o se retira` : 'nueva');
    }

    // La ficha propuesta
    const fabTexto = textoDeFabrica(nuevo.dir, nivel);
    const nombre = vars.proyecto;
    const obs = [];
    const o = (s) => obs.push(`# ${s}`);
    o(`adoptar · kit ${version} · ${nombre} · ${fecha}`);
    const atras = avisoKitAtras(opciones.kit, version);
    if (atras) o(atras);
    const fichaVieja = fichaEnLaHistoria(carpeta);
    if (fichaVieja) o(`⚠ ${lineaFichaVieja(fichaVieja)}`);
    o(`nivel: ${nivel} (${opciones.nivel ? 'pedido con --nivel' : `inferido: ${inf.porque}`}; la regla: con código → estandar, sin código → liviano)`);
    o(`vars: ${notas.join(' · ')}`);
    o('piezas (id · estado · qué pasa al aplicar):');
    for (const p of piezas) o(`  ${p.id} · ${p.estado} · ${p.que}`);
    if (nuevoRepo) o('proyecto nuevo (--nuevo): lo base en molde, el candado prendido y director-obrero y estado en sí (nace con módulos)');
    if (base) {
      const estadoDeId = (id) => (piezas.find((p) => p.id === id) || {}).estado;
      const modSi = MODULOS.filter((id) => estadoDeId(id) === 'sí');
      const modPropia = MODULOS.filter((id) => estadoDeId(id) === 'propia');
      const noTrae = ['smoke', 'release', ...MODULOS.filter((id) => estadoDeId(id) === 'no')];
      o('trae (molde) lo base del catálogo: la ficha, inicio, cierre, el hook con tope, las barreras (settings, los hooks de escritura,');
      o('  git-seguro y sensible, cambios-metodo, githooks), docs (solo lo que falta) y lo que eso necesita para andar (hooks-lib: la');
      o(`  usan todos los hooks; scripts: estructura, cambios, todo). No trae ${noTrae.join(', ')} ni docs-fyd.`);
      if (!nuevoRepo && (modSi.length || modPropia.length)) {
        o(`repo con código (estandar): ${[modSi.length ? `trae ${modSi.join(' y ')} (sí: el módulo con director necesita /director y /obrero)` : '', modPropia.length ? `${modPropia.join(' y ')} en propia (ya hay uno distinto: lo resuelve la sesión con Guido)` : ''].filter(Boolean).join('; ')}`);
      }
      o(`frenos, sensible y autorizado: los de fábrica del nivel ${nivel} (así el commit de la ficha pasa barreras: exención b)`);
    }
    if (!conClaude) o('CLAUDE.md: no hay — si la sesión prende alguna pieza, nace el del molde');
    else {
      const tc = lf(leerP(carpeta, 'CLAUDE.md') || '');
      o(RE_TAMANO.test(tc)
        ? 'CLAUDE.md: hay — no se toca (ya trae "El tamaño del pedido")'
        : 'CLAUDE.md: le falta "El tamaño del pedido" — con tu OK, --aplicar <propuesta> --claude-md la suma al final (la del molde)');
      // un director u obrero propio: renglones que lo nombran, sin contar los que ya nombran /director o /obrero (8r, 4; D8r-6), ni
      // los iguales a un renglón del CLAUDE.md del molde (RF-fix 4: el del kit no es "propio")
      const delMolde = new Set(lf(aN.get('CLAUDE.md') || '').split('\n').map((l) => l.trim()).filter(Boolean));
      const nros = tc.split('\n').map((l, i) => (/director|obrero/i.test(l) && !/\/(director|obrero)\b/i.test(l) && !delMolde.has(l.trim()) ? i + 1 : 0)).filter(Boolean);
      if (nros.length) o(`CLAUDE.md: tiene su director/obrero propio (renglones ${nros.slice(0, 5).join(', ')}${nros.length > 5 ? ', …' : ''}): choca con /director — la sesión le propone a Guido cambiarlo por un puntero a /director y /obrero (a mano, con su OK)`);
    }
    if (hay(carpeta, 'AGENTS.md')) o('AGENTS.md: hay — aviso: con otro contenido que el del kit no se toca');
    const copias = COPIAS_KIT.filter((c) => hay(carpeta, c));
    o(`copias del kit adentro: ${copias.length ? `${copias.join(', ')} — el kit vive en ~/.claude; la sesión propone sacarlas` : 'ninguna'}`);
    const casados = viejo ? viejo.casados : [];
    const v2s = V2.filter((r) => hay(carpeta, r));
    if (v2s.length) {
      for (const r of v2s) o(`v2: ${r} — ${casados.includes(r) ? 'el del molde v2 sin editar: se retira, y su regla del settings con la mezcla' : 'editado: queda (su regla del settings igual a la del v2 se va con la mezcla; la sesión decide)'}`);
    } else o('v2: ni check-code.js ni session-start.sh');
    const reglas = [...reglasPropias(carpeta, aN, aV), ...hooksPropios(carpeta, new Set([...repN.values()].flatMap((x) => x.archivos.map((a) => a.proyecto))), casados).map((r) => `archivo ${r}`)];
    if (reglas.length) {
      o('reglas propias candidatas (que no trae el molde; la sesión las propone como cambios, cada una con su chico:):');
      for (const r of reglas) o(`  ${r}`);
    } else o('reglas propias candidatas: ninguna');
    const reg = registroDeCambios(carpeta);
    if (!reg.length) o('registro de cambios de método: no hay');
    else {
      // la receta, dentro del OK de la adopción (8r, t2): --plan para ver, después --commit; --fuente si no es la de fábrica
      const md = reg.find((r) => /\.md$/i.test(r));
      const fuente = md && md !== FUENTE_CAMBIOS ? ` --fuente ${md}` : '';
      o(`registro de cambios de método: ${listaCorta(reg)} → migración, dentro del OK de la adopción: ${MIGRAR} --repo <clon>${fuente} --plan, después lo mismo con --commit`);
    }
    o('docs-fyd: se ofrece — la documentación de auditoría FyD (si va, piezas.docs-fyd: sí)');
    if (base) {
      for (const l of bloquesDecision(carpeta, { d1, settings: { viejo: aV.has('settings.json') ? aV.get('settings.json') : null, nuevo: aN.get('settings.json'), proyecto: leerP(carpeta, RUTA_SETTINGS) } })) o(l);
    }
    o(`al aplicar: dos commits (las piezas, después la ficha sola: la exención b mira la fábrica en el árbol del padre; con --permisos o --arranque, un tercero: los permisos)`);

    const lineasVars = Object.entries(vars).map(([k, v]) => `  ${k}: ${valorTexto(v)}`);
    const texto = [
      '---',
      MARCA_INI,
      ...obs,
      MARCA_FIN,
      `# Ficha del kit de ${nombre}: la escribió el adoptador (kit ${version}). frenos, sensible y autorizado: los de fábrica del nivel.`,
      `kit: ${version}`,
      `nivel: ${nivel}`,
      'vars:',
      ...lineasVars,
      'piezas:',
      ...piezas.map((p) => `  ${p.id}: ${valorEstado(p.estado)}`),
      ...bloquesFabrica(fabTexto),
      '---',
      '',
      '## Cómo se adaptó el kit a este proyecto',
      '',
      nuevoRepo
        ? `- Nació con el kit ${version} (${fecha}, Modo A): frenos, sensible y autorizado de fábrica; el candado prendido; con módulos (director-obrero y estado).`
        : `- Adoptado con el kit ${version} (${fecha}): frenos, sensible y autorizado de fábrica; el candado apagado hasta migrar (corre barreras).`,
      '',
    ].join('\n');
    const leida = F.leer(texto).datos;
    const fab = F.leer(fabTexto).datos;
    if (distintasDeFabrica(leida, fab).length) throw new Error('la propuesta no salió con los valores de fábrica');
    return { texto, datos: leida };
  } finally {
    M.borrar(tmp);
  }
}

// ---------------------------------------------------------------- aplicar

// La ficha de una propuesta: sin el bloque de lo que vio el adoptador.
function sinObservaciones(texto) {
  const ls = String(texto).replace(/^﻿/, '').replace(/\r\n/g, '\n').split('\n');
  const i = ls.indexOf(MARCA_INI);
  const j = ls.indexOf(MARCA_FIN);
  if (i < 0 || j < i) return ls.join('\n');
  return [...ls.slice(0, i), ...ls.slice(j + 1)].join('\n');
}

// La sección "## El tamaño del pedido" de un CLAUDE.md (LF): desde su título hasta el próximo "## ", sin los blancos del final; o null.
function seccionTamano(texto) {
  const ls = lf(texto).split('\n');
  const i = ls.findIndex((l) => /^## /.test(l) && RE_TAMANO.test(l));
  if (i < 0) return null;
  let j = ls.findIndex((l, k) => k > i && /^## /.test(l));
  if (j < 0) j = ls.length;
  return ls.slice(i, j).join('\n').replace(/\s+$/, '');
}

// aplicarPropuesta(carpeta, {kit, propuesta, fecha, io, principal, claudeMd}) → { codigo, lineas }
function aplicarPropuesta(carpeta, opciones) {
  revisarRaiz(carpeta);
  let crudo;
  try {
    crudo = fs.readFileSync(opciones.propuesta, 'utf8');
  } catch (e) {
    throw new Negativa(`no leo la propuesta ${opciones.propuesta} (${e.code || e.message})`);
  }
  const fichaTexto = sinObservaciones(crudo);
  let datos;
  try {
    datos = F.leer(fichaTexto).datos;
  } catch (e) {
    throw new Negativa(`la propuesta no se lee (${e.message}) — corregila o corré --mirar de nuevo; no escribí nada`);
  }
  const version = A.versionDelKit(opciones.kit);
  if (datos.kit !== version) throw new Negativa(`la propuesta es del kit ${datos.kit} y el --kit es ${version} — corré --mirar de nuevo; no escribí nada`);
  const propuestas = esMapa(datos.piezas) ? datos.piezas : {};
  const estadoPropuesto = (id) => (Object.prototype.hasOwnProperty.call(propuestas, id) ? estadoDe(propuestas[id]) : undefined);
  // D1 (--director kit, rt-4): las del director que se reemplazan, con el estado que toman (una propia → sí o molde)
  const d1 = []; // { id, estado, distintos }
  const elegidoD1 = new Map();
  const estado = (id) => (elegidoD1.has(id) ? elegidoD1.get(id) : estadoPropuesto(id));
  const trae = (id) => TRAE.includes(estado(id));
  const fecha = opciones.fecha || hoy();
  const antes = gitEn(carpeta, ['rev-parse', 'HEAD']).out.trim();
  const fichaVieja = fichaEnLaHistoria(carpeta);

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-adoptar-'));
  let plan;
  try {
    const viejo = moldeV2(opciones.kit, carpeta, path.join(tmp, 'viejo'));
    let fichaPlan = fichaTexto;
    if (opciones.director === 'kit') {
      // lo distinto con la misma vara de --mirar; solo las cuatro del director, y solo las que vienen (o las propia de --mirar)
      const nuevo = M.materializarNuevo(opciones.kit, { vars: esMapa(datos.vars) ? datos.vars : {}, fecha }, path.join(tmp, 'nuevo'));
      const aN = M.archivosDe(nuevo.dir);
      const repN0 = C.repartir(nuevo.forma, C.rutasDeMolde(nuevo.dir));
      const aV = viejo ? M.archivosDe(viejo.dir) : new Map();
      const repV0 = viejo ? C.repartir(viejo.forma, C.rutasDeMolde(viejo.dir)) : new Map();
      for (const id of D1_PIEZAS) {
        const e = estadoPropuesto(id);
        if (e !== 'propia' && !TRAE.includes(e)) continue;
        const { distintos } = distintosDe(carpeta, mapaDe(repN0, aN, id), mapaDe(repV0, aV, id));
        if (!distintos.length) continue;
        const toma = e === 'propia' ? (MODULOS.includes(id) ? 'sí' : 'molde') : e;
        d1.push({ id, estado: toma, distintos });
        elegidoD1.set(id, toma);
      }
      // al planificador le llegan en propia: así no pasan por el guardia ni por la fusión (nada de claude); se escriben abajo
      if (d1.length) fichaPlan = A.reescribirFicha(fichaTexto, null, new Map(d1.map((x) => [x.id, 'propia'])));
    }
    // el planificador de aplicar: se niega como aplicar (sucia salvo .kit-rol, .kit-rol ≠ actualizador)
    plan = A.planear(carpeta, { kit: opciones.kit, moldeViejo: viejo ? viejo.dir : opciones.kit, fecha, ficha: fichaPlan });
  } finally {
    M.borrar(tmp);
  }
  try {
    const repN = C.repartir('3', C.rutasDeMolde(plan.moldeNuevo));
    const formaV = M.formaDe(plan.moldeViejo).forma;
    const repV = C.repartir(formaV, C.rutasDeMolde(plan.moldeViejo));
    const duenoDe = new Map();
    for (const rep of [repV, repN]) for (const [id, { archivos }] of rep) for (const a of archivos) if (a.proyecto) duenoDe.set(a.proyecto, id);
    // las que traen archivos (docs-fyd: sí no trae ninguno: la skill es global)
    const traidas = [...repN].filter(([id, { pieza, archivos }]) => !['nunca', 'no-viaja', 'snippet'].includes(pieza.trato) && trae(id) && archivos.length).map(([id]) => id);
    const algo = traidas.length > 0;
    // candado en no: su archivo viene igual si viene la lib de los hooks (barreras corre desde estructura.cjs)
    const candadoCorre = estado('candado') === 'no' && trae('hooks-lib');
    const vale = (rel) => {
      if (rel === RUTA_FICHA) return false; // la ficha va al final, la de acá
      const id = duenoDe.get(rel);
      if (id === undefined) return algo; // los .snippet
      if (estado(id) !== undefined) return trae(id) || (id === 'candado' && candadoCorre);
      return trae('settings'); // las bajas del v2 (check-code) van con la mezcla del settings, que retira su regla
    };
    const ops = new Map([...plan.ops].filter(([rel]) => vale(rel)));

    // la ficha: la de aplicar (con los hashes de lo que trajo), y lo que la propuesta no trae queda como lo dijo
    let ficha = plan.fichaNueva || fichaTexto;
    const forzar = new Map();
    for (const [id, v] of Object.entries(propuestas)) if (!trae(id)) forzar.set(id, valorEstado(estadoDe(v)));
    // D1: A — los del kit sobre los tuyos, como una traída normal: el molde nuevo entero, y la ficha en molde (con su hash si es
    // un archivo, y molde+propio si trae zona) o en sí
    if (d1.length) {
      const aN = M.archivosDe(plan.moldeNuevo);
      for (const x of d1) {
        const archivos = repN.has(x.id) ? repN.get(x.id).archivos : [];
        for (const a of archivos) {
          const t = aN.get(a.molde);
          const actual = leerP(carpeta, a.proyecto);
          if (actual === null || lf(actual) !== t) ops.set(a.proyecto, t);
        }
        const unico = archivos.length === 1 ? archivos[0] : null;
        let e = x.estado;
        if (e === 'molde' && unico && /\.md$/i.test(unico.proyecto) && (Z.zonas(aN.get(unico.molde)).zonas || []).length) e = 'molde+propio';
        const h = unico && e !== 'sí' ? huella(unico.proyecto, aN.get(unico.molde)) : undefined;
        forzar.set(x.id, h ? `{estado: ${valorEstado(e)}, hash: ${h}}` : valorEstado(e));
      }
    }
    if (forzar.size) ficha = A.reescribirFicha(ficha, null, forzar);
    const final = F.leer(ficha).datos;

    // CLAUDE.md: si no hay, nace el del molde (si viene algo); si hay, no se toca
    const naceClaude = algo && !hay(carpeta, 'CLAUDE.md');
    if (naceClaude) ops.set('CLAUDE.md', fs.readFileSync(path.join(plan.moldeNuevo, 'CLAUDE.md'), 'utf8'));
    // --claude-md (8r, 4): la sección "El tamaño del pedido" del molde al final del CLAUDE.md que hay, en el commit de las piezas
    let lineaClaude = naceClaude ? 'nace del molde' : hay(carpeta, 'CLAUDE.md') ? 'ya hay: no se toca (la regla del tamaño la marca doctor)' : 'no hay y no nace (no viene ninguna pieza)';
    if (opciones.claudeMd && !naceClaude) {
      const actual = leerP(carpeta, 'CLAUDE.md');
      if (actual === null) lineaClaude = 'no hay y no nace (no viene ninguna pieza): --claude-md no tiene dónde sumar la sección';
      else if (RE_TAMANO.test(lf(actual))) lineaClaude = 'ya trae "El tamaño del pedido": no se toca (--claude-md no suma nada)';
      else if (!algo) lineaClaude = 'ya hay: no se toca — --claude-md va en el commit de las piezas y no viene ninguna';
      else {
        const sec = seccionTamano(fs.readFileSync(path.join(plan.moldeNuevo, 'CLAUDE.md'), 'utf8'));
        if (sec === null) throw new Error('el CLAUDE.md del molde no trae la sección "El tamaño del pedido"');
        const cuerpo = `${lf(actual).replace(/\n*$/, '')}\n\n${sec}\n`;
        ops.set('CLAUDE.md', actual.includes('\r\n') ? cuerpo.replace(/\n/g, '\r\n') : cuerpo);
        lineaClaude = 'le sumé al final "El tamaño del pedido" (la del molde): va en el commit de las piezas';
      }
    }

    // el renglón del CHANGELOG: "kit v → v" de aplicar dice adopción
    const lc = plan.lineas.find((l) => l.startsWith(`${RUTA_CHANGELOG} · un renglón · `));
    let renglon = null;
    if (lc && ops.has(RUTA_CHANGELOG)) {
      const viejoR = lc.slice(`${RUTA_CHANGELOG} · un renglón · `.length);
      renglon = `kit ${version}: adopción — piezas ${traidas.join(', ')}${d1.length ? ' — D1: A, los del kit reemplazan los propios' : ''}`;
      ops.set(RUTA_CHANGELOG, ops.get(RUTA_CHANGELOG).split('\n').map((l) => (l === viejoR ? renglon : l)).join('\n'));
    }
    // D2 (--permisos recomendada) y D3 (--arranque kit), rt-9: en el disco el settings elegido; en el commit de las piezas, la
    // mezcla de siempre (su blob va al índice: git update-index), así ese commit pasa barreras como hoy. El cambio, en un tercero.
    const lineasD = [];
    let permisos = null; // { plano, texto } cuando hay tercer commit
    if (opciones.permisos || opciones.arranque) {
      const nombre = [opciones.permisos ? 'D2 (--permisos recomendada)' : '', opciones.arranque ? 'D3 (--arranque kit)' : ''].filter(Boolean).join(' y ');
      const sV = repV.has('settings') && repV.get('settings').archivos.length ? path.join(plan.moldeViejo, ...repV.get('settings').archivos[0].molde.split('/')) : null;
      const sN = repN.has('settings') && repN.get('settings').archivos.length ? path.join(plan.moldeNuevo, ...repN.get('settings').archivos[0].molde.split('/')) : null;
      const proyecto = leerP(carpeta, RUTA_SETTINGS);
      const plano = ops.has(RUTA_SETTINGS) ? ops.get(RUTA_SETTINGS) : proyecto;
      const quitados = esMapa(final.frenos) && Array.isArray(final.frenos.quitados) ? final.frenos.quitados : [];
      const el = trae('settings') && sN && proyecto !== null
        ? settingsElegido({ viejo: sV && fs.existsSync(sV) ? fs.readFileSync(sV, 'utf8') : null, nuevo: fs.readFileSync(sN, 'utf8'), proyecto, quitados }, { permisos: !!opciones.permisos, arranque: !!opciones.arranque })
        : null;
      if (!el) lineasD.push(`settings · ${nombre}: no hay nada que elegir (${trae('settings') ? 'sin un settings propio que se mezcle' : 'la pieza settings no viene'}) — no toqué nada`);
      else {
        if (opciones.permisos) lineasD.push(`settings · D2 (--permisos recomendada): ${[el.quedan.length ? `quedan ${el.quedan.join(', ')} (la mezcla las sacaba)` : 'ninguna allow que la mezcla sacara', el.salen.length ? `salen ${el.salen.join(', ')} (frenaban al director)` : 'ningún ask que frene al director'].join('; ')}`);
        if (opciones.arranque) lineasD.push(`settings · D3 (--arranque kit): ${el.fuera.length ? `sale del settings ${el.fuera.join(', ')} — su archivo queda` : 'no hay un SessionStart propio: nada que sacar'}`);
        if (plano === null || lf(plano) !== el.texto) {
          permisos = { plano, texto: el.texto };
          ops.set(RUTA_SETTINGS, el.texto);
        } else lineasD.push(`settings · ${nombre}: queda igual a la mezcla — no hay tercer commit`);
      }
    }
    ops.set(RUTA_FICHA, ficha); // la ficha, la última

    // los renglones: por pieza de la propuesta, lo que pasó
    const dePlan = new Map(plan.lineas.map((l) => [l.split(' · ')[0], l]));
    const lineas = [];
    for (const id of Object.keys(propuestas)) {
      const e = estadoDe(final.piezas[id]);
      const x = d1.find((y) => y.id === id);
      if (x) lineas.push(`${id} · ${e} · reemplacé los tuyos (D1: A) — lo tuyo queda en la historia: ${x.distintos.map((r) => `git show ${antes || '<el HEAD de antes>'}:${r}`).join(', ')}`);
      else if (trae(id)) lineas.push(dePlan.has(id) ? `${id} · ${e} · ${dePlan.get(id).split(' · ').slice(2).join(' · ')}` : `${id} · ${e} · sin cambios`);
      else if (id === 'candado' && candadoCorre) lineas.push(`${id} · ${e} · apagado hasta migrar (estructura.cjs vino: barreras corre)`);
      else lineas.push(`${id} · ${e} · ${e === 'propia' ? 'propia: no se toca' : 'no se trae'}`);
    }
    for (const [id, l] of dePlan) {
      if (Object.prototype.hasOwnProperty.call(propuestas, id) || id === 'ficha' || id === RUTA_CHANGELOG) continue;
      if (/^\.git(ignore|attributes)$/.test(id)) {
        if (algo) lineas.push(l);
      } else lineas.push(trae('settings') ? `${l} (del molde v2)` : `${id} · no se toca`);
    }
    lineas.push(`CLAUDE.md · ${lineaClaude}`);
    if (renglon) lineas.push(`${RUTA_CHANGELOG} · un renglón · ${renglon}`);
    const fab = F.leer(fs.readFileSync(path.join(plan.moldeNuevo, 'hooks', 'lib', 'fabrica', `ficha.${final.nivel}.md`), 'utf8')).datos;
    const distintas = distintasDeFabrica(final, fab);
    lineas.push(`ficha · ${RUTA_FICHA} · kit ${version}, nivel ${final.nivel} · ${distintas.length ? `${distintas.join(', ')} distinto de fábrica` : 'frenos, sensible y autorizado de fábrica'}`);
    lineas.push(...lineasD);

    try {
      A.ejecutar(carpeta, ops, opciones.io);
    } catch (e) {
      return { codigo: 1, lineas: [...lineas, `adoptar: no pude escribir ${e.ruta || '?'} (${e.code || e.message}) — cada archivo quedó entero, el viejo o el nuevo. Es el clon: \`git checkout -- . && git clean -fd\` (deja .kit-rol) y corré de nuevo`] };
    }
    // rt-9: el blob de la mezcla de siempre, para el índice del commit de las piezas (un objeto suelto en .git: no es un commit)
    let blobPlano = null;
    if (permisos) {
      const h = spawnSync('git', ['hash-object', '-w', '--path', RUTA_SETTINGS, '--stdin'], { cwd: carpeta, input: permisos.plano, encoding: 'utf8', windowsHide: true });
      if (h.error || h.status !== 0) return { codigo: 1, lineas: [...lineas, `adoptar: no pude guardar la mezcla del settings para el commit de las piezas (${String(h.stderr || (h.error && h.error.message) || '').trim()}) — los archivos quedaron escritos; es el clon: \`git checkout -- . && git clean -fd\` y corré de nuevo`] };
      blobPlano = h.stdout.trim();
    }
    // los githooks, en la carpeta principal (en el clon no: r1-5)
    lineas.push(opciones.principal ? prenderGithooks(carpeta, opciones.principal) : 'githooks · sin --principal · no los prendí (van con --principal <la carpeta de Guido> en el --aplicar): los prende el primer arranque después del pull');
    const msg = `kit: adopción ${version}`;
    if (algo) {
      // los githooks sh con +x en el índice (en Windows el disco no lo lleva; en la flota lo pone flota, acá el commit)
      const sh = [...ops.keys()].filter((rel) => /^\.githooks\/[^/.]+$/.test(rel) && ops.get(rel) !== null);
      const x = sh.length ? ` && git update-index --chmod=+x -- ${sh.join(' ')}` : '';
      if (blobPlano) {
        // rt-9: tres — en las piezas va la mezcla de siempre (el blob, al índice); D2/D3 en el tercero, solo
        lineas.push(`van tres commits, en este orden (la exención b compara la ficha con la de fábrica del árbol del padre: la ficha va sola, después; lo de ${MSG_PERMISOS} va aparte, en el tercero):`);
        lineas.push(`  git add -A -- . ":(exclude)${RUTA_FICHA}" ":(exclude)${RUTA_SETTINGS}" && git update-index --add --cacheinfo 100644,${blobPlano},${RUTA_SETTINGS}${x} && git commit -m "${msg} (piezas)"`);
        lineas.push(`  git add -- ${RUTA_FICHA} && git commit -m "${msg} (ficha)"`);
        lineas.push(`  git add -- ${RUTA_SETTINGS} && git commit -m "${msg} (${MSG_PERMISOS})"`);
      } else {
        lineas.push('van dos commits, en este orden (la exención b compara la ficha con la de fábrica del árbol del padre: la ficha va sola, después):');
        lineas.push(`  git add -A -- . ":(exclude)${RUTA_FICHA}"${x} && git commit -m "${msg} (piezas)"`);
        lineas.push(`  git add -- ${RUTA_FICHA} && git commit -m "${msg} (ficha)"`);
      }
    } else {
      lineas.push('va un commit, solo la ficha (no vino ninguna pieza):');
      lineas.push(`  git add -- ${RUTA_FICHA} && git commit -m "${msg} (ficha)"`);
    }
    // chequear no va: pide la ficha en la base, y antes de la adopción no hay (corre desde la primera puesta al día de la flota)
    const rango = `node .claude/scripts/estructura.cjs barreras --rango ${antes || '<el HEAD de antes>'}..HEAD`;
    if (!algo) lineas.push(`después: barreras da ROJO en el commit de la ficha (sin la fábrica en el árbol del padre no hay exención b): lo aprueba Guido`);
    else if (distintas.length) lineas.push(`después: ${rango} da ROJO en el commit de la ficha (${distintas.join(', ')} no es de fábrica): ${APRUEBA}`);
    else if (fichaVieja) lineas.push(`después: ${rango} da ROJO: ${lineaFichaVieja(fichaVieja)}`);
    else lineas.push(`después: ${rango} → verde${blobPlano ? ' en las piezas y la ficha' : ''}`);
    // rt-9: el tercero toca reglas del settings sin un aprobado sellado (lo dice barreras, regla por regla)
    if (blobPlano) lineas.push(`después: el commit de los permisos (${MSG_PERMISOS}) da ROJO en barreras (toca reglas del settings sin un aprobado sellado): ${APRUEBA}, y ese commit se rehace después del sello (o se revierte: queda la mezcla de siempre)`);
    return { codigo: 0, lineas };
  } finally {
    M.borrar(plan.tmp);
  }
}

// ---------------------------------------------------------------- D1-D4: las decisiones de la adopción (SPEC-paquete-8r2 t3, t9; rt-4, rt-9)
//
// Ninguna se decide acá (D8r2-2): --mirar las muestra con la recomendada del informe primero, y cada camino es UN paso de
// --aplicar. Sin opciones, todo como antes. D1 (--director kit): las cuatro del director con un archivo distinto del molde se
// reemplazan con las del kit. D2 (--permisos recomendada) y D3 (--arranque kit): el settings, en un tercer commit propio (rt-9: el
// de las piezas sigue pasando barreras). D4 (sensible:) no tiene opción: se cambia en la propuesta.

const DECISIONES = { '--director': 'director', '--permisos': 'permisos', '--arranque': 'arranque' };
const VALOR_DECISION = { '--director': 'kit', '--permisos': 'recomendada', '--arranque': 'kit' };
const D1_PIEZAS = ['director-obrero', 'estado', 'inicio', 'cierre'];
const PASOS_DIRECTOR = ['git merge', 'git push', 'git worktree', 'git branch -d']; // los que corre el director (un ask lo frena)
const RUTA_HANDOFF = 'docs/SESSION_HANDOFF.md';
const TOPE_HANDOFF = 5000; // el del hook de arranque (hooks/lib/topes.cjs, HANDOFF_BYTES)
const MSG_PERMISOS = 'permisos: D2/D3';

const mapaDe = (rep, a, id) => new Map((rep.has(id) ? rep.get(id).archivos : []).map((x) => [x.proyecto, a.get(x.molde)]));
// Los archivos de una pieza que ya están en el proyecto y no son ni el molde nuevo ni el v2 sin editar (distintos), y los que son
// el v2 sin editar (delV2). La misma vara en --mirar (propia) y en --aplicar --director kit (qué se reemplaza).
function distintosDe(carpeta, mapN, mapV) {
  const distintos = [];
  const delV2 = [];
  for (const rel of new Set([...mapN.keys(), ...mapV.keys()])) {
    const t = leerP(carpeta, rel);
    if (t === null || (mapN.has(rel) && iguales(rel, t, mapN.get(rel)))) continue;
    if (mapV.has(rel) && iguales(rel, t, mapV.get(rel))) delV2.push(rel);
    else distintos.push(rel);
  }
  return { distintos, delV2 };
}

// ¿Una regla ask frena un paso del director? Bash(…)/PowerShell(…) cuyo prefijo cubre git merge, git push, git worktree o
// git branch -d. `git push --force` o `git branch -D` no frenan nada del director (no los corre).
function frenaAlDirector(regla) {
  const m = /^(?:Bash|PowerShell)\((.*)\)$/.exec(String(regla).trim());
  if (!m) return false;
  const p = m[1].replace(/(:\*|\s*\*)$/, '').trim();
  if (!p) return false;
  return PASOS_DIRECTOR.some((d) => d === p || d.startsWith(`${p} `) || (p.startsWith(`${d} `) && !/\s(--force|-f\b)/.test(p.slice(d.length))));
}

const leerSettings = (t) => {
  if (t == null) return {};
  const r = Z.leerJsonSinDuplicados(t);
  return r.ok && esMapa(r.valor) ? r.valor : null;
};
const textoRegla = (id) => id.replace(/^(allow|ask|deny):/, '$1 ');
const textoHook = (x) => `hook ${x.evento} ${x.matcher || '*'}: ${x.comando}`;

// Lo del settings para D2 y D3, o null (sin settings, o uno que no se lee o no se mezcla: eso ya lo dice la pieza settings).
// → { sevan: ids de permisos que la mezcla saca (los iguales al molde v2), frenan: los ask (texto) que frenan al director,
//     arranque: los hooks SessionStart propios (de Z.reglas), P y V: los valores leídos (para elegir) }
function decisionesSettings({ viejo, nuevo, proyecto, quitados = [] }) {
  if (proyecto == null) return null;
  const P = leerSettings(proyecto);
  const V = leerSettings(viejo);
  const N = leerSettings(nuevo);
  if (!P || !V || !N) return null;
  const r = Z.mezclarSettings({ viejo, nuevo, proyecto, quitados });
  if (!r.ok) return null;
  const sevan = r.informe.retiradas.filter((id) => /^(allow|ask|deny):/.test(id));
  const ask = esMapa(P.permissions) && Array.isArray(P.permissions.ask) ? P.permissions.ask : [];
  const delMolde = new Set([...Z.reglas(N), ...Z.reglas(V)].map((x) => x.id));
  const arranque = Z.reglas(P).filter((x) => x.tipo === 'hook' && x.evento === 'SessionStart' && !delMolde.has(x.id));
  return { sevan, frenan: ask.filter(frenaAlDirector), arranque, P, V };
}

// El settings con D2 y/o D3 elegidas: la misma mezcla, con el v2 sin las allow que se iban (así quedan donde están) y el proyecto
// sin los ask que frenan y sin el SessionStart propio. → { texto, quedan, salen, fuera } o null (no hay nada que elegir).
function settingsElegido(entrada, { permisos, arranque }) {
  const d = decisionesSettings(entrada);
  if (!d) return null;
  const { P, V } = d;
  const quedan = [];
  const salen = [];
  const fuera = [];
  if (permisos) {
    const iban = new Set(d.sevan.filter((id) => id.startsWith('allow:')));
    if (esMapa(V.permissions) && Array.isArray(V.permissions.allow)) {
      V.permissions.allow = V.permissions.allow.filter((t) => !iban.has(Z.normalizarId(`allow:${t}`)));
    }
    for (const id of iban) quedan.push(textoRegla(id));
    if (d.frenan.length) {
      P.permissions.ask = P.permissions.ask.filter((t) => !frenaAlDirector(t));
      salen.push(...d.frenan.map((t) => `ask ${t}`));
    }
  }
  if (arranque && d.arranque.length) {
    const sacar = new Set(d.arranque.map((x) => x.entrada)); // las mismas entradas de P (Z.reglas no copia)
    const grupos = P.hooks.SessionStart.map((g) => ({ ...g, hooks: g.hooks.filter((h) => !sacar.has(h)) })).filter((g) => g.hooks.length);
    if (grupos.length) P.hooks.SessionStart = grupos;
    else delete P.hooks.SessionStart;
    fuera.push(...d.arranque.map(textoHook));
  }
  const r = Z.mezclarSettings({ viejo: JSON.stringify(V), nuevo: entrada.nuevo, proyecto: JSON.stringify(P), quitados: entrada.quitados || [] });
  if (!r.ok) return null;
  return { texto: r.texto, quedan, salen, fuera };
}

// Los bloques de --mirar: lo que se ve (a)-(d) y D1-D4, cada uno con la recomendada del informe primero y cómo se elige.
function bloquesDecision(carpeta, { d1, settings }) {
  const out = [];
  if (d1.length) {
    const rutas = d1.flatMap((x) => x.distintos.map((r) => `${r} (${x.id})`));
    out.push(`D1 · el director, /inicio y /cierre: ya hay unos tuyos distintos de los del kit — ${listaCorta(rutas, 6)}`);
    out.push('  (A, recomendada) los del kit: --aplicar <propuesta> --director kit — las reglas tuyas que valgan pasan a la zona propia del CLAUDE.md o a cambios (los cambios de método ya migran)');
    out.push('  (B) los tuyos: sin la opción — el módulo arranca solo, sin el director del kit');
  }
  const d = decisionesSettings(settings);
  if (d) {
    if (d.sevan.length) {
      out.push('settings: se van con la mezcla (iguales al molde v2):');
      for (const id of d.sevan) out.push(`  se va: ${textoRegla(id)}`);
    }
    if (d.frenan.length) {
      out.push('settings: ask que frenan un paso del director (git merge, git push, git worktree, git branch -d):');
      for (const t of d.frenan) out.push(`  frena: ask ${t}`);
    }
    if (d.sevan.length || d.frenan.length) {
      out.push('D2 · los permisos:');
      out.push('  (recomendada) dejar las allow que se iban y sacar los ask que frenan al director (el del kit ya frena el merge solo): --aplicar <propuesta> --permisos recomendada — va en un tercer commit, aparte');
      out.push('  (otra) sin la opción: la mezcla como siempre — esas allow se van (fuera de auto, cada una pide permiso) y los ask quedan (frenan al director de noche)');
    }
    for (const x of d.arranque) out.push(`arranque: un SessionStart propio (no es del molde): ${textoHook(x)}`);
  }
  let handoff = null;
  try {
    const st = fs.statSync(path.join(carpeta, ...RUTA_HANDOFF.split('/')));
    if (st.isFile() && st.size > TOPE_HANDOFF) handoff = st.size;
  } catch { /* no hay handoff */ }
  if (handoff !== null) out.push(`arranque: ${RUTA_HANDOFF} pesa ${handoff} B y el tope del hook es ${TOPE_HANDOFF} B: cada arranque lo inyecta CORTADO`);
  if ((d && d.arranque.length) || handoff !== null) {
    out.push('D3 · el arranque:');
    out.push('  (recomendada) el del kit: --aplicar <propuesta> --arranque kit — el SessionStart propio sale del settings (su archivo queda); el /cierre del kit mantiene el handoff bajo el tope (va con la A de D1) — va en un tercer commit, aparte');
    out.push('  (otra) sin la opción: quedan los dos hooks de arranque y el handoff entra cortado (dos veces, si el tuyo también lo inyecta)');
  }
  // la gramática de la ficha: no, o la lista de los comandos que duelen (pregunta el que empieza así); un "sí" no se lee
  out.push(`D4 · sensible: las cinco de sensible: quedan en no; recomendada: datos-reales con los comandos que tocan la base real — se cambia en la propuesta, como lista (p. ej. datos-reales: [sqlcmd]; "sí" no se lee: va no o los comandos, como en kit.ejemplo.md); el commit de la ficha da ROJO en barreras y ${APRUEBA}`);
  return out;
}

// ---------------------------------------------------------------- los githooks en la carpeta principal (SPEC-paquete-8b (14))

const HOOKS_PATH = '.githooks';
const CLAVE_PREVIO = 'kit.hooksPathPrevio'; // la misma del hook de arranque (ponerHooksPath): el runner encadena el previo
const esCarpeta = (p) => {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
};
const origenDe = (d) => {
  const r = gitEn(d, ['config', '--get', 'remote.origin.url']);
  return r.ok ? r.out.trim() : '';
};
// Una URL de remoto comparable: sin barras ni .git al final, el host en minúsculas (https://, ssh://, git@host:…). `…/hermes`,
// `…/hermes.git` y `…/Hermes.git/` en GitHub son el mismo repo; el camino no se toca (en otros hosts las mayúsculas cuentan).
function normalizarOrigen(u) {
  let s = String(u).trim().replace(/\/+$/, '').replace(/\.git$/i, '').replace(/\/+$/, '');
  s = s.replace(/^([a-z][a-z0-9+.-]*:\/\/)([^@/]*@)?([^/:]+)/i, (_, esq, usr, host) => `${esq.toLowerCase()}${usr || ''}${host.toLowerCase()}`);
  s = s.replace(/^([^@/:]+@)([^/:]+):/, (_, usr, host) => `${usr}${host.toLowerCase()}:`);
  return s;
}
// r1-7: ¿el origin del clon es la carpeta principal (el Modo A clona la carpeta) o el mismo origin que el de ella (la flota clona
// el remoto)? Una URL se compara normalizada; una ruta local, resuelta; file:// también.
function mismoRepo(clon, principal) {
  const oc = origenDe(clon);
  if (!oc) return false;
  const op = origenDe(principal);
  if (op && normalizarOrigen(oc) === normalizarOrigen(op)) return true;
  const ruta = oc.replace(/^file:\/\//, '').replace(/^\/(?=[A-Za-z]:)/, '');
  return esCarpeta(ruta) && comparable(ruta) === comparable(principal);
}
// r1-6: los hooks de verdad de .git/hooks (husky v4, pre-commit los ponen ahí), fuera de los *.sample de git init.
function hooksPropiosDeGit(principal) {
  const r = gitEn(principal, ['rev-parse', '--git-path', 'hooks']);
  if (!r.ok) return [];
  const dir = path.resolve(principal, r.out.trim());
  try {
    return fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isFile() && !e.name.endsWith('.sample')).map((e) => e.name);
  } catch {
    return [];
  }
}

// prenderGithooks(clon, principal) → la línea "githooks · <carpeta> · <puesto | ya estaba | queda para el arranque | no pude: …>".
// Solo --local, solo core.hooksPath y kit.hooksPathPrevio; nunca --global.
function prenderGithooks(clon, principal) {
  const linea = (que) => `githooks · ${principal} · ${que}`;
  const top = esCarpeta(principal) ? gitEn(principal, ['rev-parse', '--show-toplevel']) : { ok: false };
  if (!top.ok || comparable(top.out.trim()) !== comparable(principal) || hay(principal, '.kit-rol') || comparable(principal) === comparable(clon) || !mismoRepo(clon, principal)) {
    return linea('no pude: no es el mismo repo (tiene que ser la raíz de tu carpeta, sin .kit-rol, y el clon salir de ella o de su mismo origin) — no toqué nada');
  }
  const enDisco = esCarpeta(path.join(principal, HOOKS_PATH));
  const g = gitEn(principal, ['config', '--get', 'core.hooksPath']);
  const actual = g.ok ? g.out.trim() : '';
  if (actual === HOOKS_PATH) return linea('ya estaba');
  if (actual && !enDisco) return linea(`queda para el arranque — hoy apunta a ${actual} y ${HOOKS_PATH}/ todavía no está en el disco: apagaría esos hooks hasta el pull; lo prende el primer arranque después del pull`);
  if (!actual && !enDisco) {
    const propios = hooksPropiosDeGit(principal);
    if (propios.length) return linea(`queda para el arranque — .git/hooks tiene ${listaCorta(propios)} y ${HOOKS_PATH}/ todavía no está en el disco: apagaría esos hooks hasta el pull; lo prende el primer arranque después del pull`);
  }
  if (actual) {
    const p = gitEn(principal, ['config', '--local', CLAVE_PREVIO, actual]);
    if (!p.ok) return linea(`no pude: git config ${CLAVE_PREVIO} (${p.err.trim() || 'sin detalle'}) — no toqué core.hooksPath`);
  }
  const s = gitEn(principal, ['config', '--local', 'core.hooksPath', HOOKS_PATH]);
  if (!s.ok) return linea(`no pude: git config core.hooksPath (${s.err.trim() || 'sin detalle'})`);
  return linea(actual ? `puesto (el anterior, ${actual}, quedó en ${CLAVE_PREVIO}: el runner lo encadena)` : 'puesto');
}

// ---------------------------------------------------------------- línea de comandos

function leerArgs(argv) {
  const o = { mirar: false, nuevo: false, claudeMd: false };
  const conValor = { '--kit': 'kit', '--nivel': 'nivel', '--propuesta': 'propuesta', '--aplicar': 'aplicar', '--fecha': 'fecha', '--principal': 'principal', '--comando-test': 'comandoTest' };
  Object.assign(conValor, DECISIONES); // D1-D3 (8r2): --director kit, --permisos recomendada, --arranque kit
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--mirar') o.mirar = true;
    else if (a === '--nuevo') o.nuevo = true;
    else if (a === '--claude-md') {
      if (o.claudeMd) return null;
      o.claudeMd = true;
    }
    else if (Object.prototype.hasOwnProperty.call(conValor, a)) {
      if (i + 1 >= argv.length || !argv[i + 1] || o[conValor[a]] !== undefined) return null;
      o[conValor[a]] = argv[++i];
    } else if (!a.startsWith('--') && o.carpeta === undefined) o.carpeta = a;
    else return null;
  }
  if (!o.carpeta || !o.kit || o.mirar === (o.aplicar !== undefined)) return null;
  if (!o.mirar && (o.nivel !== undefined || o.propuesta !== undefined || o.nuevo || o.comandoTest !== undefined)) return null;
  if (o.comandoTest !== undefined && !escribible(o.comandoTest)) return null; // va entre comillas en la ficha: sin comillas dobles, barras invertidas ni saltos
  if (o.mirar && (o.principal !== undefined || o.claudeMd)) return null;
  // D1-D3 (8r2): solo con --aplicar, y cada una con su único valor
  for (const [flag, k] of Object.entries(DECISIONES)) if (o[k] !== undefined && (o.mirar || o[k] !== VALOR_DECISION[flag])) return null;
  if (o.nivel !== undefined && !NIVELES.includes(o.nivel)) return null;
  if (o.fecha !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(o.fecha)) return null;
  return o;
}

const dentroDe = (base, p) => {
  const r = path.relative(comparable(base), comparable(path.dirname(path.resolve(p))));
  return r === '' || (!r.startsWith('..') && !path.isAbsolute(r));
};

// main(argv) → { codigo, lineas }, o null si está mal llamado (actualizar.cjs imprime su USO y sale 2).
async function main(argv) {
  const o = leerArgs(argv);
  if (!o) return null;
  const carpeta = path.resolve(o.carpeta);
  const kit = path.resolve(o.kit);
  try {
    if (o.mirar) {
      if (o.propuesta !== undefined && dentroDe(carpeta, o.propuesta)) throw new Negativa(`--propuesta ${o.propuesta} cae adentro de ${carpeta}: --mirar no escribe ahí — elegí otro lugar`);
      const r = mirar(carpeta, { kit, nivel: o.nivel, fecha: o.fecha, nuevo: o.nuevo, comandoTest: o.comandoTest });
      const lineas = r.texto.replace(/\n$/, '').split('\n');
      if (o.propuesta !== undefined) {
        const destino = path.resolve(o.propuesta);
        const t = `${destino}.kit-tmp-${process.pid}`;
        fs.writeFileSync(t, r.texto);
        fs.renameSync(t, destino);
        lineas.push(`propuesta escrita en ${destino} — la sesión la muestra, la ajusta con Guido y corre --aplicar`);
      }
      return { codigo: 0, lineas };
    }
    return aplicarPropuesta(carpeta, { kit, propuesta: path.resolve(o.aplicar), fecha: o.fecha, principal: o.principal === undefined ? undefined : path.resolve(o.principal), claudeMd: o.claudeMd,
      director: o.director, permisos: o.permisos, arranque: o.arranque });
  } catch (e) {
    if (e instanceof Negativa) return { codigo: 1, lineas: [`adoptar: ${e.message}`] };
    throw e;
  }
}

module.exports = { mirar, aplicarPropuesta, main, avisoKitAtras, fichaEnLaHistoria, prenderGithooks, normalizarOrigen, casaPlantilla, contenidoPropio, sinObservaciones, MARCA_INI, MARCA_FIN };
