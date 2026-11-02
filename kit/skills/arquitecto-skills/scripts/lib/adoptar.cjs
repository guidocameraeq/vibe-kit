'use strict';
// adoptar.cjs — `actualizar.cjs adoptar`: el adoptador (SPEC-0 P7.2; SPEC-paquete-6 D6-1, D6-12, criterio 19; crit. 20 del kit).
//
//   node actualizar.cjs adoptar <carpeta> --kit <raíz del kit> --mirar [--nivel liviano|estandar] [--propuesta <archivo>]
//   node actualizar.cjs adoptar <carpeta> --kit <raíz del kit> --aplicar <archivo de propuesta> [--fecha <AAAA-MM-DD>]
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
//   - una base con un archivo del proyecto en su ruta, distinto del molde → propia (no se pisa), y el comentario lo dice;
//   - sin ficha ni CLAUDE.md → todo en no (criterio 19, caso de falla): la propuesta sale igual y la sesión decide.
// El molde v2: de los tags v2.* del --kit con templates/universales/, el que más casa con el proyecto. Un archivo del proyecto
// que es esa plantilla con sus {{…}} completados y nada más ("el v2 sin editar") es el molde viejo intacto: al aplicar se
// reemplaza (inicio, cierre) o se retira (session-start.sh, check-code.js, y sus reglas del settings por la mezcla). A aplicar
// le llega como molde viejo ese v2 con el texto del proyecto en lo que casó; sin tag v2, el molde nuevo hace de viejo.
//
// --aplicar: se niega (1) si ya hay ficha ("eso es actualizarlo: flota"), si la propuesta no se lee o es de otro kit, y como
// aplicar (sucia salvo .kit-rol, .kit-rol ≠ actualizador). Reusa el planificador de aplicar (planear con la ficha propuesta) y de
// su plan se queda con lo de las piezas molde: lo de una no o una propia no se escribe. CLAUDE.md: si no hay, nace el del molde; si
// hay, no se toca. Escritura atómica (ejecutar de aplicar). No commitea: van DOS commits, las piezas y después la ficha sola,
// porque la exención (b) compara contra la ficha de fábrica DEL ÁRBOL DEL PADRE (barreras.cjs, exencionB) y la fábrica llega con
// las piezas. La ficha con frenos, sensible o autorizado distintos de fábrica da rojo en barreras: lo aprueba Guido después.
// Después va barreras --rango <antes>..HEAD; chequear no, porque pide la ficha en la base (corre desde la primera puesta al día).

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
const TRAE = ['molde', 'molde+propio'];
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
function casaPlantilla(plantilla, texto) {
  const partes = lf(plantilla).split(/\{\{[^{}]*\}\}/);
  const t = lf(texto);
  if (partes.length === 1) return t === partes[0];
  const ultima = partes[partes.length - 1];
  if (!t.startsWith(partes[0]) || t.length < partes[0].length + ultima.length) return false;
  let i = partes[0].length;
  const tope = t.length - ultima.length;
  for (const p of partes.slice(1, -1)) {
    const j = t.indexOf(p, i);
    if (j < 0 || j + p.length > tope) return false;
    i = j + p.length;
  }
  return t.endsWith(ultima);
}

const versionDeTag = (t) => t.slice(1).split('.').map(Number);
function compararTags(a, b) {
  const x = versionDeTag(a);
  const y = versionDeTag(b);
  for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (y[i] || 0) - (x[i] || 0);
  return 0;
}

// Los archivos de un molde v2 que son "el v2 sin editar" en el proyecto: [{ rel, proyecto, texto }]. El settings no cuenta (la mezcla
// es regla por regla), CLAUDE.md y docs/ tampoco (nunca y nacimiento).
function casadosCon(carpeta, dir) {
  const out = [];
  for (const rel of C.rutasDeMolde(dir)) {
    if (rel === 'settings.json' || rel === 'CLAUDE.md' || rel.startsWith('docs/')) continue;
    const rp = C.rutaEnProyecto(rel);
    const t = rp === null ? null : leerP(carpeta, rp);
    if (t !== null && casaPlantilla(fs.readFileSync(path.join(dir, ...rel.split('/')), 'utf8'), t)) out.push({ rel, proyecto: rp, texto: lf(t) });
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
    const casados = casadosCon(carpeta, dir);
    if (!mejor || casados.length > mejor.casados.length) {
      if (mejor) M.borrar(mejor.dir);
      mejor = { ...m, version: t.slice(1), casados };
    } else M.borrar(dir);
  }
  if (!mejor) return null;
  fs.renameSync(mejor.dir, destino);
  for (const c of mejor.casados) fs.writeFileSync(path.join(destino, ...c.rel.split('/')), c.texto);
  return { dir: destino, forma: mejor.forma, version: mejor.version, casados: mejor.casados.map((c) => c.proyecto) };
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
      const setup = hay(carpeta, 'pnpm-lock.yaml') ? 'pnpm install' : hay(carpeta, 'yarn.lock') ? 'yarn install' : hay(carpeta, 'package-lock.json') ? 'npm ci' : 'npm install';
      vars['comando-setup'] = setup;
      notas.push(`comando-setup = ${setup} (package.json${setup === 'npm install' ? '' : ' y su lock'})`);
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

// mirar(carpeta, {kit, nivel, fecha}) → { texto: la propuesta, datos } — no escribe nada en <carpeta> ni en su .git.
function mirar(carpeta, opciones) {
  revisarRaiz(carpeta);
  const version = A.versionDelKit(opciones.kit);
  const fecha = opciones.fecha || hoy();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-adoptar-'));
  try {
    const inf = inferirNivel(carpeta);
    const nivel = opciones.nivel || inf.nivel;
    const { vars, notas } = inferirVars(carpeta);
    const nuevo = M.materializarNuevo(opciones.kit, { vars, fecha }, path.join(tmp, 'nuevo'));
    if (nuevo.forma !== '3') throw new Negativa('el --kit no trae kit/molde/ (el molde v3): con ese no se adopta');
    const viejo = moldeV2(opciones.kit, carpeta, path.join(tmp, 'viejo'));
    const aN = M.archivosDe(nuevo.dir);
    const aV = viejo ? M.archivosDe(viejo.dir) : new Map();
    const repN = C.repartir(nuevo.forma, C.rutasDeMolde(nuevo.dir));
    const repV = viejo ? C.repartir(viejo.forma, C.rutasDeMolde(viejo.dir)) : new Map();
    const conClaude = hay(carpeta, 'CLAUDE.md');

    const piezas = []; // { id, estado, que }
    for (const [id, { pieza, archivos }] of repN) {
      if (['nunca', 'no-viaja', 'snippet'].includes(pieza.trato)) continue;
      const pone = (estado, que) => piezas.push({ id, estado, que });
      if (!conClaude) {
        pone('no', 'sin ficha ni CLAUDE.md: todo en no (criterio 19); la sesión decide qué se prende');
        continue;
      }
      if (pieza.clase === C.OPCIONAL) {
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
      const mapN = new Map(archivos.map((a) => [a.proyecto, aN.get(a.molde)]));
      const mapV = new Map((repV.has(id) ? repV.get(id).archivos : []).map((a) => [a.proyecto, aV.get(a.molde)]));
      const distintos = [];
      const delV2 = [];
      for (const rel of new Set([...mapN.keys(), ...mapV.keys()])) {
        const t = leerP(carpeta, rel);
        if (t === null || (mapN.has(rel) && iguales(rel, t, mapN.get(rel)))) continue;
        if (mapV.has(rel) && iguales(rel, t, mapV.get(rel))) delV2.push(rel);
        else distintos.push(rel);
      }
      const ocupada = distintos.length ? `${listaCorta(distintos)} ya está y es distinto del molde` : '';
      if (id === 'candado') {
        pone('no', `apagado hasta migrar; .claude/scripts/estructura.cjs viene igual: barreras corre desde ahí${ocupada ? ` — ⚠ ${ocupada}: barreras no anda hasta resolverlo` : ''}`);
      } else if (distintos.length) pone('propia', `${ocupada}: no se pisa`);
      else pone('molde', delV2.length ? `${listaCorta(delV2)}: el molde v2 sin editar → se reemplaza o se retira` : 'nueva');
    }

    // La ficha propuesta
    const fabTexto = textoDeFabrica(nuevo.dir, nivel);
    const nombre = vars.proyecto;
    const obs = [];
    const o = (s) => obs.push(`# ${s}`);
    o(`adoptar · kit ${version} · ${nombre} · ${fecha}`);
    o(`nivel: ${nivel} (${opciones.nivel ? 'pedido con --nivel' : `inferido: ${inf.porque}`}; la regla: con código → estandar, sin código → liviano)`);
    o(`vars: ${notas.join(' · ')}`);
    o('piezas (id · estado · qué pasa al aplicar):');
    for (const p of piezas) o(`  ${p.id} · ${p.estado} · ${p.que}`);
    if (conClaude) {
      o('trae (molde) lo base del catálogo: la ficha, inicio, cierre, el hook con tope, las barreras (settings, los hooks de escritura,');
      o('  git-seguro y sensible, cambios-metodo, githooks), docs (solo lo que falta) y lo que eso necesita para andar (hooks-lib: la');
      o('  usan todos los hooks; scripts: estructura, cambios, todo). No trae smoke, release, director-obrero, estado ni docs-fyd.');
      o(`frenos, sensible y autorizado: los de fábrica del nivel ${nivel} (así el commit de la ficha pasa barreras: exención b)`);
    }
    o(`CLAUDE.md: ${conClaude ? 'hay — no se toca (la regla del tamaño la marca doctor)' : 'no hay — si la sesión prende alguna pieza, nace el del molde'}`);
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
    o(reg.length ? `registro de cambios de método: ${listaCorta(reg)} → migración: P6.8b, orden 7, queda en te espera` : 'registro de cambios de método: no hay');
    o('docs-fyd: se ofrece — la documentación de auditoría FyD (si va, piezas.docs-fyd: sí)');
    o(`al aplicar: dos commits (las piezas, después la ficha sola: la exención b mira la fábrica en el árbol del padre)`);

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
      `- Adoptado con el kit ${version} (${fecha}): frenos, sensible y autorizado de fábrica; el candado apagado hasta migrar (corre barreras).`,
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

// aplicarPropuesta(carpeta, {kit, propuesta, fecha, io}) → { codigo, lineas }
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
  const estado = (id) => (Object.prototype.hasOwnProperty.call(propuestas, id) ? estadoDe(propuestas[id]) : undefined);
  const trae = (id) => TRAE.includes(estado(id));
  const fecha = opciones.fecha || hoy();
  const antes = gitEn(carpeta, ['rev-parse', 'HEAD']).out.trim();

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-adoptar-'));
  let plan;
  try {
    const viejo = moldeV2(opciones.kit, carpeta, path.join(tmp, 'viejo'));
    // el planificador de aplicar: se niega como aplicar (sucia salvo .kit-rol, .kit-rol ≠ actualizador)
    plan = A.planear(carpeta, { kit: opciones.kit, moldeViejo: viejo ? viejo.dir : opciones.kit, fecha, ficha: fichaTexto });
  } finally {
    M.borrar(tmp);
  }
  try {
    const repN = C.repartir('3', C.rutasDeMolde(plan.moldeNuevo));
    const formaV = M.formaDe(plan.moldeViejo).forma;
    const repV = C.repartir(formaV, C.rutasDeMolde(plan.moldeViejo));
    const duenoDe = new Map();
    for (const rep of [repV, repN]) for (const [id, { archivos }] of rep) for (const a of archivos) if (a.proyecto) duenoDe.set(a.proyecto, id);
    const traidas = [...repN].filter(([id, { pieza }]) => !['nunca', 'no-viaja', 'snippet'].includes(pieza.trato) && trae(id)).map(([id]) => id);
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
    if (forzar.size) ficha = A.reescribirFicha(ficha, null, forzar);
    const final = F.leer(ficha).datos;

    // CLAUDE.md: si no hay, nace el del molde (si viene algo); si hay, no se toca
    const naceClaude = algo && !hay(carpeta, 'CLAUDE.md');
    if (naceClaude) ops.set('CLAUDE.md', fs.readFileSync(path.join(plan.moldeNuevo, 'CLAUDE.md'), 'utf8'));

    // el renglón del CHANGELOG: "kit v → v" de aplicar dice adopción
    const lc = plan.lineas.find((l) => l.startsWith(`${RUTA_CHANGELOG} · un renglón · `));
    let renglon = null;
    if (lc && ops.has(RUTA_CHANGELOG)) {
      const viejoR = lc.slice(`${RUTA_CHANGELOG} · un renglón · `.length);
      renglon = `kit ${version}: adopción — piezas ${traidas.join(', ')}`;
      ops.set(RUTA_CHANGELOG, ops.get(RUTA_CHANGELOG).split('\n').map((l) => (l === viejoR ? renglon : l)).join('\n'));
    }
    ops.set(RUTA_FICHA, ficha); // la ficha, la última

    // los renglones: por pieza de la propuesta, lo que pasó
    const dePlan = new Map(plan.lineas.map((l) => [l.split(' · ')[0], l]));
    const lineas = [];
    for (const id of Object.keys(propuestas)) {
      const e = estadoDe(final.piezas[id]);
      if (trae(id)) lineas.push(dePlan.has(id) ? `${id} · ${e} · ${dePlan.get(id).split(' · ').slice(2).join(' · ')}` : `${id} · ${e} · sin cambios`);
      else if (id === 'candado' && candadoCorre) lineas.push(`${id} · ${e} · apagado hasta migrar (estructura.cjs vino: barreras corre)`);
      else lineas.push(`${id} · ${e} · ${e === 'propia' ? 'propia: no se toca' : 'no se trae'}`);
    }
    for (const [id, l] of dePlan) {
      if (Object.prototype.hasOwnProperty.call(propuestas, id) || id === 'ficha' || id === RUTA_CHANGELOG) continue;
      if (/^\.git(ignore|attributes)$/.test(id)) {
        if (algo) lineas.push(l);
      } else lineas.push(trae('settings') ? `${l} (del molde v2)` : `${id} · no se toca`);
    }
    lineas.push(`CLAUDE.md · ${naceClaude ? 'nace del molde' : hay(carpeta, 'CLAUDE.md') ? 'ya hay: no se toca (la regla del tamaño la marca doctor)' : 'no hay y no nace (no viene ninguna pieza)'}`);
    if (renglon) lineas.push(`${RUTA_CHANGELOG} · un renglón · ${renglon}`);
    const fab = F.leer(fs.readFileSync(path.join(plan.moldeNuevo, 'hooks', 'lib', 'fabrica', `ficha.${final.nivel}.md`), 'utf8')).datos;
    const distintas = distintasDeFabrica(final, fab);
    lineas.push(`ficha · ${RUTA_FICHA} · kit ${version}, nivel ${final.nivel} · ${distintas.length ? `${distintas.join(', ')} distinto de fábrica` : 'frenos, sensible y autorizado de fábrica'}`);

    try {
      A.ejecutar(carpeta, ops, opciones.io);
    } catch (e) {
      return { codigo: 1, lineas: [...lineas, `adoptar: no pude escribir ${e.ruta || '?'} (${e.code || e.message}) — cada archivo quedó entero, el viejo o el nuevo. Es el clon: \`git checkout -- . && git clean -fd\` (deja .kit-rol) y corré de nuevo`] };
    }
    const msg = `kit: adopción ${version}`;
    if (algo) {
      // los githooks sh con +x en el índice (en Windows el disco no lo lleva; en la flota lo pone flota, acá el commit)
      const sh = [...ops.keys()].filter((rel) => /^\.githooks\/[^/.]+$/.test(rel) && ops.get(rel) !== null);
      const x = sh.length ? ` && git update-index --chmod=+x -- ${sh.join(' ')}` : '';
      lineas.push('van dos commits, en este orden (la exención b compara la ficha con la de fábrica del árbol del padre: la ficha va sola, después):');
      lineas.push(`  git add -A -- . ":(exclude)${RUTA_FICHA}"${x} && git commit -m "${msg} (piezas)"`);
      lineas.push(`  git add -- ${RUTA_FICHA} && git commit -m "${msg} (ficha)"`);
    } else {
      lineas.push('va un commit, solo la ficha (no vino ninguna pieza):');
      lineas.push(`  git add -- ${RUTA_FICHA} && git commit -m "${msg} (ficha)"`);
    }
    // chequear no va: pide la ficha en la base, y antes de la adopción no hay (corre desde la primera puesta al día de la flota)
    const rango = `node .claude/scripts/estructura.cjs barreras --rango ${antes || '<el HEAD de antes>'}..HEAD`;
    if (!algo) lineas.push(`después: barreras da ROJO en el commit de la ficha (sin la fábrica en el árbol del padre no hay exención b): lo aprueba Guido`);
    else if (distintas.length) lineas.push(`después: ${rango} da ROJO en el commit de la ficha (${distintas.join(', ')} no es de fábrica): eso lo aprueba Guido después del merge, desde su checkout (cambios nuevo + cambios aprobar)`);
    else lineas.push(`después: ${rango} → verde`);
    return { codigo: 0, lineas };
  } finally {
    M.borrar(plan.tmp);
  }
}

// ---------------------------------------------------------------- línea de comandos

function leerArgs(argv) {
  const o = { mirar: false };
  const conValor = { '--kit': 'kit', '--nivel': 'nivel', '--propuesta': 'propuesta', '--aplicar': 'aplicar', '--fecha': 'fecha' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--mirar') o.mirar = true;
    else if (Object.prototype.hasOwnProperty.call(conValor, a)) {
      if (i + 1 >= argv.length || !argv[i + 1] || o[conValor[a]] !== undefined) return null;
      o[conValor[a]] = argv[++i];
    } else if (!a.startsWith('--') && o.carpeta === undefined) o.carpeta = a;
    else return null;
  }
  if (!o.carpeta || !o.kit || o.mirar === (o.aplicar !== undefined)) return null;
  if (!o.mirar && (o.nivel !== undefined || o.propuesta !== undefined)) return null;
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
      const r = mirar(carpeta, { kit, nivel: o.nivel, fecha: o.fecha });
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
    return aplicarPropuesta(carpeta, { kit, propuesta: path.resolve(o.aplicar), fecha: o.fecha });
  } catch (e) {
    if (e instanceof Negativa) return { codigo: 1, lineas: [`adoptar: ${e.message}`] };
    throw e;
  }
}

module.exports = { mirar, aplicarPropuesta, main, casaPlantilla, sinObservaciones, MARCA_INI, MARCA_FIN };
