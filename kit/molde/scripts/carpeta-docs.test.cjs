'use strict';
// Pruebas de la carpeta de papeles en los scripts del molde (SPEC-paquete-8r3 i1, crit. 1, la mitad de los scripts): con
// `carpeta-docs: arti-docs` en la ficha COMMITEADA y subida (la vigente) y un docs/ ajeno con archivos sueltos y señuelos (un TODO, un
// handoff, una ficha de módulo y una bitácora que no son del método), worktree (crear, cerrar --cancelado, integrados), todo, estado,
// mesa nuevo, noche me-voy, resumen, tiempos y portada armar usan arti-docs/ y no escriben nada en docs/. Sin la clave, todo como
// antes: lo cuidan los *.test.cjs de cada script, sin cambios. Repos temporales con remoto bare, sin la config de git de la PC y con
// un HOME falso. Corren con: node --test kit/molde/scripts/carpeta-docs.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-carpeta-docs-'));
const GLOBAL = path.join(TMP, 'gitconfig-vacio');
fs.writeFileSync(GLOBAL, '[core]\n\tlongpaths = true\n');
const HOME = path.join(TMP, 'home');
fs.mkdirSync(HOME);
Object.assign(process.env, {
  GIT_CONFIG_GLOBAL: GLOBAL,
  GIT_CONFIG_NOSYSTEM: '1',
  XDG_CONFIG_HOME: TMP,
  HOME,
  USERPROFILE: HOME,
  CLAUDE_CONFIG_DIR: path.join(TMP, 'config-vacia'),
  GIT_AUTHOR_NAME: 'Prueba',
  GIT_AUTHOR_EMAIL: 'prueba@ejemplo.invalid',
  GIT_COMMITTER_NAME: 'Prueba',
  GIT_COMMITTER_EMAIL: 'prueba@ejemplo.invalid',
});
test.after(() => fs.rmSync(TMP, { recursive: true, force: true, maxRetries: 20, retryDelay: 500 }));

const D = require('../hooks/lib/docs-ruta.cjs');
const W = require('./worktree.cjs');
const S = require('./estado.cjs');
const M = require('./mesa.cjs');
const N = require('./noche.cjs');
const R = require('./resumen.cjs');
const T = require('./tiempos.cjs');
const P = require('./portada.cjs');
const SNIPPET = fs.readFileSync(path.join(__dirname, '..', 'gitignore.snippet'), 'utf8');
const TODO_SCRIPT = path.join(__dirname, 'todo.cjs');

test.beforeEach(() => D.olvidar()); // deRaiz guarda por proceso

// ---------------------------------------------------------------- ayudantes

function g(cwd, ...args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', env: process.env });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}
function escribir(d, rel, contenido) {
  const p = path.join(d, ...rel.split('/'));
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, contenido);
}
const hay = (d, rel) => fs.existsSync(path.join(d, ...rel.split('/')));
const leer = (d, rel) => fs.readFileSync(path.join(d, ...rel.split('/')), 'utf8');
function commit(d, archivos, mensaje = 'c') {
  for (const [rel, contenido] of Object.entries(archivos)) {
    escribir(d, rel, contenido);
    g(d, 'add', '-f', '--', rel);
  }
  g(d, 'commit', '-q', '-m', mensaje);
  return g(d, 'rev-parse', 'HEAD');
}
// La foto de docs/: cada archivo con el hash de su contenido (lo ajeno no se toca: ni se crea, ni se cambia, ni se borra).
function fotoDocs(d) {
  const out = [];
  const recorrer = (abs, rel) => {
    for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) recorrer(path.join(abs, e.name), r);
      else out.push(`${r}:${crypto.createHash('sha1').update(fs.readFileSync(path.join(abs, e.name))).digest('hex')}`);
    }
  };
  recorrer(path.join(d, 'docs'), '');
  return out.sort().join('\n');
}
function docsIntacto(d, antes) {
  assert.equal(fotoDocs(d), antes, 'docs/ (ajeno) cambió');
  assert.equal(g(d, 'status', '--porcelain', '--untracked-files=all', '--', 'docs'), '', 'git status de docs/ no está vacío');
}

const FICHA = (extra = 'carpeta-docs: arti-docs\n') =>
  `---\nkit: 3.0.0-rc.4\nnivel: estandar\n${extra}vars:\n  proyecto: arti\nfrenos:\n  opcionales: []\n  quitados: []\n---\n`;
const R_ = '\u{1F534}';
const N_ = '\u{1F7E0}';
const TODO = (...items) => ['# TODO', '', `## ${R_} Crítico`, '', `## ${N_} Importante`, '', ...items, ''].join('\n');
const MODULO = (x, extra = '') => `# ${x}\n- Estado: EN OBRA\n- director: sí\n- rama: modulo/${x}\n${extra}`;
const encargo = (x, id) =>
  [
    `# Encargo ${id} · ${x} · prueba`,
    `- Partida: rama modulo/${x}--${id} desde modulo/${x}@abcdef1 · 2026-11-02T10:00-03:00`,
    `- Spec: arti-docs/modulos/${x}/SPEC.md:1`,
    '- Skill: obrero',
    '- Modelo: sonnet · Esfuerzo: low · Por qué: prueba',
    '- Riesgo: bajo · Por qué: prueba',
    '- Apertura: director',
    '- Suscripción: —',
    '## Toca',
    '- src/a.js',
    '## Alcance',
    '1. algo',
    '## NO SE TOCA',
    '- nada',
    '## AUTORIZADO',
    '- (nada)',
    '## GATE',
    '- (nada)',
    '',
  ].join('\n');

// El bot de Arti en chiquito: docs/ es el sitio de OpenClaw (docs.json, CNAME, páginas) con señuelos que tienen nombres del método;
// los papeles viven en arti-docs/. La ficha con la clave, commiteada y subida a origin (la vigente).
let n = 0;
function proyecto(o = {}) {
  const base = path.join(TMP, `p${n++}`);
  const remoto = path.join(base, 'remoto.git');
  const d = path.join(base, 'arti');
  fs.mkdirSync(d, { recursive: true });
  g(base, 'init', '-q', '--bare', '-b', 'main', remoto);
  g(d, 'init', '-q', '-b', 'main');
  commit(d, {
    '.gitignore': SNIPPET,
    '.claude/kit.md': o.ficha !== undefined ? o.ficha : FICHA(),
    'a.txt': 'a\n',
    // lo ajeno
    'docs/docs.json': '{"name":"openclaw"}\n',
    'docs/CNAME': 'docs.openclaw.invalid\n',
    'docs/index.md': '# OpenClaw\n',
    'docs/TODO.md': TODO('- [ ] señuelo del sitio, espera hasta: 2020-01-01'),
    'docs/SESSION_HANDOFF.md': '# handoff del sitio (señuelo)\n',
    'docs/NORTE.md': '# Norte del sitio\n\n## Qué es\n\nEl sitio de OpenClaw (señuelo).\n',
    'docs/modulos/otro/README.md': MODULO('otro'),
    // los papeles del método
    'arti-docs/SESSION_HANDOFF.md': '# handoff\n',
    'arti-docs/TODO.md': TODO('- [ ] el pendiente de arti, espera hasta: 2026-01-01'),
    'arti-docs/NORTE.md': '# Norte\n\n## Qué es\n\nEl bot de Arti.\n',
    'arti-docs/modulos/x/README.md': MODULO('x'),
    ...(o.archivos || {}),
  }, 'base');
  g(d, 'remote', 'add', 'origin', remoto);
  g(d, 'push', '-q', 'origin', 'main');
  return { d, remoto, wt: (c) => path.join(d, '.claude', 'worktrees', c) };
}
function salidaDe(fn) {
  let out = '';
  let err = '';
  const codigo = fn((s) => (out += s), (s) => (err += s));
  return { codigo, out, err };
}
const wt = (cwd, args) => salidaDe((salida, error) => W.main(args, { cwd, salida, error, heredar: false, claudeEnPath: false }));
const AHORA = new Date(2026, 10, 4, 10, 0); // antes de las 18: sin la línea del resumen del día

test('la ficha vigente dice arti-docs (la base de las demás pruebas)', () => {
  const p = proyecto();
  assert.equal(D.deRaiz(p.d), 'arti-docs');
});

// ---------------------------------------------------------------- worktree

test('worktree crear: la ficha del módulo se busca en arti-docs/modulos/<x>/README.md; un módulo que solo está en docs/ no nace', () => {
  const p = proyecto();
  const antes = fotoDocs(p.d);
  const no = wt(p.d, ['crear', 'otro']);
  assert.equal(no.codigo, 1, no.out);
  assert.match(no.out, /worktree crear: no — arti-docs\/modulos\/otro\/README\.md no está commiteado en main/);
  const si = wt(p.d, ['crear', 'x']);
  assert.equal(si.codigo, 0, si.out);
  assert.ok(fs.existsSync(p.wt('modulo--x')));
  docsIntacto(p.d, antes);
  docsIntacto(p.wt('modulo--x'), antes);
});

test('worktree cerrar --cancelado: el renglón se pide en arti-docs/modulos/<x>/README.md (el de docs/ no cuenta)', () => {
  const p = proyecto();
  assert.equal(wt(p.d, ['crear', 'x']).codigo, 0);
  assert.equal(wt(p.d, ['crear', 'x--02']).codigo, 0);
  const wx = p.wt('modulo--x');
  const punta = g(p.wt('modulo--x--02'), 'rev-parse', 'HEAD');
  // el renglón en la ficha de docs/ (ajena) no vale
  commit(wx, { 'docs/modulos/x/README.md': `# x\n- cancelado 02 @${punta.slice(0, 7)}: señuelo\n` }, 'señuelo');
  const no = wt(p.d, ['cerrar', 'x--02', '--cancelado']);
  assert.equal(no.codigo, 1, no.out);
  assert.match(no.out, /anotá el cancelado en la ficha y commitealo primero: .* en arti-docs\/modulos\/x\/README\.md de modulo\/x/);
  commit(wx, { 'arti-docs/modulos/x/README.md': MODULO('x', `- cancelado 02 @${punta.slice(0, 7)}: ya no va\n`) }, 'cancelado 02');
  const si = wt(p.d, ['cerrar', 'x--02', '--cancelado']);
  assert.equal(si.codigo, 0, si.out);
  assert.match(si.out, /anotado en arti-docs\/modulos\/x\/README\.md\)\n$/);
});

test('worktree integrados: cuenta desde el último commit de arti-docs/SESSION_HANDOFF.md (un commit al handoff de docs/ no lo corre)', () => {
  const p = proyecto();
  g(p.d, 'checkout', '-q', '-b', 'modulo/x');
  commit(p.d, { 'src/a.js': '1\n' }, 'trabajo');
  g(p.d, 'checkout', '-q', 'main');
  g(p.d, 'merge', '-q', '--no-ff', '-m', 'integrar: módulo x', 'modulo/x');
  const merge = g(p.d, 'rev-parse', 'HEAD');
  commit(p.d, { 'docs/SESSION_HANDOFF.md': '# handoff del sitio, otra versión\n' }, 'el sitio');
  const r = wt(p.d, ['integrados']);
  assert.equal(r.codigo, 0);
  assert.equal(r.out, `módulo x integrado después del último handoff (@${merge.slice(0, 7)}): corré /cierre para poner los papeles al día\n`);
  commit(p.d, { 'arti-docs/SESSION_HANDOFF.md': '# handoff\nal día\n' }, 'cierre');
  assert.equal(wt(p.d, ['integrados']).out, '');
});

// ---------------------------------------------------------------- todo

test('todo cierre: poda arti-docs/TODO.md con la base en el último arti-docs/SESSION_HANDOFF.md; sin arti-docs/TODO.md → 3 (el de docs/ no sirve)', () => {
  const p = proyecto();
  // un ítem nuevo en el TODO de arti y, después, un commit al handoff del sitio: la base sigue siendo el de arti
  commit(p.d, { 'arti-docs/TODO.md': TODO('- [ ] el pendiente de arti, espera hasta: 2026-01-01', '- [ ] otro de arti') }, 'todo');
  commit(p.d, { 'docs/SESSION_HANDOFF.md': '# handoff del sitio, otra\n' }, 'el sitio');
  const antes = fotoDocs(p.d);
  const r = spawnSync(process.execPath, [TODO_SCRIPT, 'cierre'], { cwd: p.d, encoding: 'utf8', env: process.env });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout, 'TODO: +1 −0 · 2 ítems · 0 bajaron a \u{1F7E2}\n');
  docsIntacto(p.d, antes);
  const sin = proyecto();
  fs.rmSync(path.join(sin.d, 'arti-docs', 'TODO.md'));
  const r3 = spawnSync(process.execPath, [TODO_SCRIPT, 'cierre'], { cwd: sin.d, encoding: 'utf8', env: process.env });
  assert.equal(r3.status, 3);
  assert.match(r3.stderr, /No encuentro arti-docs\/TODO\.md/);
});

// ---------------------------------------------------------------- estado

test('estado: los módulos de arti-docs/modulos/ y las esperas de arti-docs/TODO.md; lo de docs/ no aparece', () => {
  const p = proyecto();
  const antes = fotoDocs(p.d);
  const r = salidaDe((salida, error) => S.main([], { cwd: p.d, salida, error, ahora: AHORA }));
  assert.equal(r.codigo, 0, r.err);
  assert.match(r.out, /\nMÓDULOS\n- x · /);
  assert.doesNotMatch(r.out, /- otro · |señuelo/);
  assert.match(r.out, /- TODO: el pendiente de arti, · espera vencida \(hasta 2026-01-01\)/);
  const no = salidaDe((salida, error) => S.main(['otro'], { cwd: p.d, salida, error, ahora: AHORA }));
  assert.equal(no.codigo, 1);
  assert.equal(no.out, 'estado: no hay ficha de "otro" (arti-docs/modulos/otro/README.md). Módulos con ficha: x\n');
  docsIntacto(p.d, antes);
  // sin módulos en arti-docs/, la línea nombra la carpeta de la ficha
  const vacio = proyecto({ archivos: { 'arti-docs/modulos/x/README.md': '' } });
  fs.rmSync(path.join(vacio.d, 'arti-docs', 'modulos'), { recursive: true });
  assert.match(salidaDe((salida, error) => S.main([], { cwd: vacio.d, salida, error, ahora: AHORA })).out, /- \(ningún módulo activo: no hay fichas en arti-docs\/modulos\/\)/);
});

// ---------------------------------------------------------------- mesa

test('mesa nuevo: el módulo dueño en arti-docs/modulos/<x>/ y el mensaje en arti-docs/modulos/<x>/mesa/<alias>/; nada en docs/', () => {
  const p = proyecto();
  const antes = fotoDocs(p.d);
  const entrada = 'tema: la tabla de usuarios\n\nUn pedido.\n';
  const no = salidaDe((salida, error) => M.main(['nuevo', 'PEDIDO', 'beta/director', 'otro', '--de', 'arti'], { cwd: p.d, salida, error, ahora: AHORA, entrada }));
  assert.equal(no.codigo, 1);
  assert.equal(no.out, 'mesa: no está arti-docs/modulos/otro/README.md — el mensaje va en el módulo dueño de la conexión\n');
  const r = salidaDe((salida, error) => M.main(['nuevo', 'PEDIDO', 'beta/director', 'x', '--de', 'arti'], { cwd: p.d, salida, error, ahora: AHORA, entrada }));
  const ruta = 'arti-docs/modulos/x/mesa/beta/2026-11-04-1-PEDIDO.md';
  // hooks/lib/mesa.cjs valida el nombre en la carpeta de la ficha (el encargo H de D8r.3): escrito, commiteado y subido
  assert.equal(r.codigo, 0, r.out);
  assert.ok(hay(p.d, ruta), r.out);
  assert.match(r.out, new RegExp(`PEDIDO · arti → beta · la tabla de usuarios · arti:${ruta.replace(/\./g, '\\.')}@[0-9a-f]{12}\\n$`));
  // y candado:mesa lo acepta ahí (lib/mesa.cjs revisar, con la carpeta de la ficha vigente)
  const Mlib = require('../hooks/lib/mesa.cjs');
  assert.deepEqual(Mlib.revisar(p.d, { archivos: g(p.d, 'ls-files').split('\n') }), []);
  docsIntacto(p.d, antes);
});

// ---------------------------------------------------------------- el encargo del obrero (lib/encargo.cjs con arti-docs)

test('tiempos: el encargo de arti-docs/modulos/<x>/bitacora/ se ubica y se lee (Spec en arti-docs/); los desvíos se juzgan con su ## Toca', () => {
  const p = proyecto();
  g(p.d, 'checkout', '-q', '-b', 'modulo/x');
  commit(p.d, { 'arti-docs/modulos/x/SPEC.md': '# SPEC\n', 'arti-docs/modulos/x/bitacora/2026-11-02-encargo-01.md': encargo('x', '01') }, 'el encargo');
  g(p.d, 'checkout', '-q', '-b', 'modulo/x--01');
  const sha = commit(p.d, { 'src/a.js': '1\n', 'arti-docs/modulos/x/bitacora/2026-11-02-evidencia-01.md': '# Evidencia\n', 'src/fuera.js': 'x\n' }, 'sub-paso');
  g(p.d, 'checkout', '-q', 'main');
  const d = T.datosEncargo(p.d, 'x', { id: '01', rama: 'modulo/x--01', sha });
  assert.equal(d.porQue, null, JSON.stringify(d));
  assert.equal(d.subpasos, 1);
  // src/a.js está en ## Toca y la evidencia en arti-docs/…/bitacora/: lo único fuera es src/fuera.js
  assert.deepEqual(d.desvios.map((x) => x.fuera), [['src/fuera.js']]);
});

// ---------------------------------------------------------------- noche

test('noche me-voy: los encargos abiertos de arti-docs/modulos/<x>/bitacora/ (cerrados por su evidencia ahí); los de docs/ no cuentan', () => {
  const p = proyecto();
  const dir = p.wt('modulo--x');
  g(p.d, 'worktree', 'add', '-q', '-b', 'modulo/x', dir);
  commit(dir, {
    'arti-docs/modulos/x/bitacora/2026-11-02-encargo-01.md': encargo('x', '01'),
    'arti-docs/modulos/x/bitacora/2026-11-02-encargo-02.md': encargo('x', '02'),
    'arti-docs/modulos/x/bitacora/2026-11-02-evidencia-02.md': '# Evidencia 02\nprobado\n',
    // señuelos en docs/: un encargo que no es del método y una "evidencia" que no cierra al 01
    'docs/modulos/x/bitacora/2026-11-02-encargo-07.md': encargo('x', '07'),
    'docs/modulos/x/bitacora/2026-11-02-evidencia-01.md': '# Evidencia 01 (señuelo)\n',
  }, 'encargos');
  const antes = fotoDocs(dir);
  const r = salidaDe((salida, error) => N.main(['me-voy'], { cwd: dir, salida, error, env: process.env, ahora: AHORA }));
  assert.equal(r.codigo, 0, r.out + r.err);
  assert.match(r.out, /\nencargo 01 · sin rama: el obrero no arrancó\n/);
  assert.doesNotMatch(r.out, /encargo 0[27]/);
  docsIntacto(dir, antes);
});

// ---------------------------------------------------------------- resumen

test('resumen <x>: escribe arti-docs/modulos/<x>/bitacora/<fecha>-resumen.md con lo que sigue de arti-docs/TODO.md; nada en docs/', () => {
  const p = proyecto();
  const antes = fotoDocs(p.d);
  const r = salidaDe((salida, error) => R.main(['x'], { cwd: p.d, salida, error, ahora: AHORA }));
  assert.equal(r.codigo, 0, r.err);
  assert.match(r.out, /\nresumen escrito: arti-docs\/modulos\/x\/bitacora\/2026-11-04-resumen\.md\n$/);
  const texto = leer(p.d, 'arti-docs/modulos/x/bitacora/2026-11-04-resumen.md');
  assert.match(texto, /el pendiente de arti/);
  assert.doesNotMatch(texto, /señuelo/);
  const otra = salidaDe((salida, error) => R.main(['x'], { cwd: p.d, salida, error, ahora: AHORA }));
  assert.equal(otra.out, 'resumen de hoy ya existe: arti-docs/modulos/x/bitacora/2026-11-04-resumen.md (se muestra una vez; --forzar lo rehace)\n');
  const no = salidaDe((salida, error) => R.main(['otro'], { cwd: p.d, salida, error, ahora: AHORA }));
  assert.equal(no.codigo, 1);
  assert.equal(no.out, 'resumen: no hay ficha de "otro" (arti-docs/modulos/otro/README.md)\n');
  docsIntacto(p.d, antes);
});

// ---------------------------------------------------------------- tiempos

test('tiempos <x>: escribe arti-docs/modulos/<x>/tiempos.md; un módulo sin carpeta en arti-docs/ no se escribe (aunque esté en docs/)', () => {
  const p = proyecto();
  const antes = fotoDocs(p.d);
  const r = salidaDe((salida, error) => T.main(['tiempos', 'x'], { cwd: p.d, salida, error }));
  assert.equal(r.codigo, 0, r.out + r.err);
  assert.equal(r.out, 'tiempos x: 0 encargo(s) · 0 sub-paso(s) · 0 min · escrito arti-docs/modulos/x/tiempos.md\n');
  assert.match(leer(p.d, 'arti-docs/modulos/x/tiempos.md'), /^# Tiempos · x\n/);
  const no = salidaDe((salida, error) => T.main(['tiempos', 'otro'], { cwd: p.d, salida, error }));
  assert.equal(no.codigo, 1);
  assert.equal(no.out, 'tiempos otro: no hay arti-docs/modulos/otro/ (el módulo nace con el Arquitecto); no escribí nada\n');
  docsIntacto(p.d, antes);
  // y estado lee el total de ahí
  const e = salidaDe((salida, error) => S.main(['x'], { cwd: p.d, salida, error, ahora: AHORA }));
  assert.match(e.out, /\ntiempos\.md: 0 encargo\(s\) · 0 sub-paso\(s\) · 0 min\n/);
});

// ---------------------------------------------------------------- portada

test('portada armar: el NORTE de arti-docs/NORTE.md y los tres enlaces a arti-docs/; sin arti-docs/NORTE.md no lo saca de docs/', () => {
  const p = proyecto();
  const antes = fotoDocs(p.d);
  const lineas = [];
  const codigo = P.cli(['armar', '--raiz', p.d], (t) => lineas.push(t));
  assert.equal(codigo, 0, lineas.join('\n'));
  const t = leer(p.d, 'README.md');
  assert.match(t, /\n\nEl bot de Arti\.\n\n/);
  for (const e of ['(arti-docs/NORTE.md)', '(arti-docs/MAPA.md)', '(arti-docs/README.md)']) assert.ok(t.includes(e), e);
  assert.doesNotMatch(t, /\]\(docs\/|señuelo|OpenClaw/);
  docsIntacto(p.d, antes);
  const sin = proyecto();
  fs.rmSync(path.join(sin.d, 'arti-docs', 'NORTE.md'));
  const l2 = [];
  assert.equal(P.cli(['armar', '--raiz', sin.d], (x) => l2.push(x)), 1);
  assert.deepEqual(l2, ['falta arti-docs/NORTE.md — la portada resume el NORTE; escribilo primero']);
  assert.ok(!hay(sin.d, 'README.md'));
  // armarReadme sin la clave: la plantilla de fábrica, con docs/
  assert.ok(P.armarReadme({ proyecto: 'x', queEs: ['q'], datos: {}, banner: true }).includes('](docs/NORTE.md)'));
});
