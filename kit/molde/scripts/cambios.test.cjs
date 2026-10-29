'use strict';
// Pruebas de scripts/cambios.cjs (P6.8a, D2.2 F3; criterio 18 del SPEC-0): cada comando con sus casos sí/no, cada negativa de
// `aprobar` (y que no escribe nada al negarse), por su nombre y por la ruta del script, y los cuatro casos de 4.7 que le tocan a un
// script. Corren con: node --test "kit/**/*.test.cjs". Repos temporales, sin la configuración de git de la PC.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-cambios-cli-'));
const GLOBAL = path.join(TMP, 'gitconfig-vacio');
fs.writeFileSync(GLOBAL, '');
Object.assign(process.env, {
  GIT_CONFIG_GLOBAL: GLOBAL,
  GIT_CONFIG_NOSYSTEM: '1',
  XDG_CONFIG_HOME: TMP, // sin el ignore global de la PC
  GIT_AUTHOR_NAME: 'Prueba',
  GIT_AUTHOR_EMAIL: 'prueba@ejemplo.invalid',
  GIT_COMMITTER_NAME: 'Prueba',
  GIT_COMMITTER_EMAIL: 'prueba@ejemplo.invalid',
});
test.after(() => fs.rmSync(TMP, { recursive: true, force: true }));

const MOLDE = path.join(__dirname, '..');
const script = require('./cambios.cjs');
const C = require('../hooks/lib/cambios.cjs');

// ---------------------------------------------------------------- ayudantes

let n = 0;
function g(cwd, ...args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', env: process.env });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}
const gOk = (cwd, ...args) => spawnSync('git', args, { cwd, encoding: 'utf8', env: process.env }).status === 0;
function escribir(d, rel, texto) {
  const p = path.join(d, ...rel.split('/'));
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, texto);
}
const leer = (d, rel) => {
  try {
    return fs.readFileSync(path.join(d, ...rel.split('/')), 'utf8');
  } catch (e) {
    return null;
  }
};
function commit(d, archivos, mensaje = 'c') {
  for (const [rel, texto] of Object.entries(archivos)) {
    escribir(d, rel, texto);
    g(d, 'add', '-f', '--', rel);
  }
  g(d, 'commit', '-q', '-m', mensaje);
  return g(d, 'rev-parse', 'HEAD');
}
// Copia el molde (hooks sin pruebas y el script) adentro de .claude/ de un repo, como queda instanciado. `sin`: un archivo que falta.
function instanciar(d, sin = null) {
  const copiar = (de, a) => {
    fs.mkdirSync(a, { recursive: true });
    for (const e of fs.readdirSync(de, { withFileTypes: true })) {
      if (e.isDirectory()) copiar(path.join(de, e.name), path.join(a, e.name));
      else if (!e.name.endsWith('.test.cjs') && e.name !== sin) fs.copyFileSync(path.join(de, e.name), path.join(a, e.name));
    }
  };
  copiar(path.join(MOLDE, 'hooks'), path.join(d, '.claude', 'hooks'));
  fs.mkdirSync(path.join(d, '.claude', 'scripts'), { recursive: true });
  fs.copyFileSync(path.join(MOLDE, 'scripts', 'cambios.cjs'), path.join(d, '.claude', 'scripts', 'cambios.cjs'));
}
function repo(archivos = {}) {
  const d = path.join(TMP, `r${n++}`);
  fs.mkdirSync(d, { recursive: true });
  g(d, 'init', '-q', '-b', 'main');
  commit(d, { '.gitignore': '/.claude/worktrees/\n/.kit-rol\n', 'a.txt': 'a\n', ...archivos }, 'base');
  return d;
}
const CUERPO = '## Caso de origen\nel stash pisó trabajo\n\n## Regla\nquitar el freno del stash\n\n## Dónde vive\n.claude/kit.md\n\n## Medición\n| antes | después |\n';
// En proceso (rápido): main con cwd y entrada estándar de mentira.
function cli(d, args, cuerpo = CUERPO) {
  let out = '';
  let err = '';
  const codigo = script.main(args, { cwd: d, salida: (s) => (out += s), error: (s) => (err += s), entradaEstandar: () => cuerpo });
  return { codigo, out, err };
}
// Como lo corre Claude: un proceso node aparte, con su cwd.
function correr(cwd, scriptPath, args, entrada = '') {
  const r = spawnSync(process.execPath, [scriptPath, ...args], { cwd, input: entrada, encoding: 'utf8', env: process.env, timeout: 60000 });
  return { codigo: r.status, out: r.stdout, err: r.stderr };
}
const ARGS = (slug = 'quitar-stash', extra = []) => ['nuevo', '--slug', slug, '--clase', '3-barrera', '--toca', 'frenos', '--id', 'deny:Bash(git stash:*)', '--origen', 'lo pidió Guido', ...extra];
function proponer(d, slug, extra) {
  const r = cli(d, ARGS(slug, extra));
  assert.equal(r.codigo, 0, r.out + r.err);
  return /propuesto (\S+)/.exec(r.out)[1];
}
const rel = (id) => `.claude/cambios/${id}.md`;
// Lo que "no escribe nada" mira: HEAD, el estado del árbol, el cambio y frenos.log.
const foto = (d, id) => ({ head: g(d, 'rev-parse', 'HEAD'), status: g(d, 'status', '--porcelain', '--untracked-files=all'), cambio: leer(d, rel(id)), log: leer(d, '.claude/frenos.log') });
function niega(d, id, re, o = {}) {
  const antes = foto(o.fotoEn || d, id);
  const r = o.ruta ? correr(d, o.ruta, ['aprobar', id]) : cli(d, ['aprobar', id]);
  assert.equal(r.codigo, 1, r.out + r.err);
  assert.match(r.out, /^cambios aprobar: no — /);
  assert.match(r.out, re);
  assert.deepEqual(foto(o.fotoEn || d, id), antes, 'no escribió nada');
  return r.out;
}

const FICHA = '---\nkit: 2.4.3\nnivel: estandar\nvars:\n  proyecto: px\nfrenos:\n  opcionales: []\n  quitados: []\n---\n';
const FICHA_ROTA = '---\nkit: 2.4.3\nnivel: estandar\nvars:\n  proyecto: px\ncolorcito:\n\ta: b\n---\n';

// ---------------------------------------------------------------- mal llamado

test('mal llamado → 2 con el uso: sin comando, comando o bandera desconocida, faltan argumentos, banderas repetidas', () => {
  const d = repo();
  for (const args of [[], ['hola'], ['listar', '--nada'], ['aprobar'], ['aprobar', 'a', 'b'], ['rechazar', 'x'], ['anotar-sha', 'x'], ['listar', '--te-espera', '--aprobados-nuevos'], ['nuevo', '--slug', 'a', '--slug', 'b']]) {
    const r = cli(d, args);
    assert.equal(r.codigo, 2, JSON.stringify(args));
    assert.match(r.err, /Uso: node \.claude\/scripts\/cambios\.cjs/);
    assert.equal(r.out, '');
  }
});

test('nuevo mal llamado → 2: slug, clase, toca, 3-barrera sin --id, origen y cita juntos o ninguno, textos con " o \\, cicatriz, chico', () => {
  const d = repo();
  const casos = [
    ['nuevo', '--slug', 'Mal', '--clase', '2', '--toca', 'inicio', '--origen', 'o'],
    ['nuevo', '--slug', 'a', '--clase', '3', '--toca', 'inicio', '--origen', 'o'],
    ['nuevo', '--slug', 'a', '--clase', '2', '--origen', 'o'],
    ['nuevo', '--slug', 'a', '--clase', '3-barrera', '--toca', 'frenos', '--origen', 'o'],
    ['nuevo', '--slug', 'a', '--clase', '2', '--toca', 'inicio', '--origen', 'o', '--cita', 'hub 3'],
    ['nuevo', '--slug', 'a', '--clase', '2', '--toca', 'inicio'],
    ['nuevo', '--slug', 'a', '--clase', '2', '--toca', 'inicio', '--origen', 'dijo "no"'],
    ['nuevo', '--slug', 'a', '--clase', '2', '--toca', 'inicio', '--origen', 'C:\\x'],
    ['nuevo', '--slug', 'a', '--clase', '2', '--toca', 'inicio', '--origen', 'dos\nrenglones'],
    ['nuevo', '--slug', 'a', '--clase', '2', '--toca', 'inicio', '--origen', 'o', '--cicatriz', 'mucha'],
    ['nuevo', '--slug', 'a', '--clase', '2', '--toca', 'inicio', '--origen', 'o', '--chico', 'quizás'],
    ['nuevo', '--slug', 'a', '--clase', '3-barrera', '--toca', 'frenos', '--id', 'a\nb', '--origen', 'o'],
  ];
  for (const args of casos) assert.equal(cli(d, args).codigo, 2, JSON.stringify(args));
  assert.equal(fs.existsSync(path.join(d, '.claude', 'cambios')), false);
});

// ---------------------------------------------------------------- nuevo

test('nuevo: escribe el archivo y hace SU commit por rutas (lo demás que estaba en el índice queda en el índice)', () => {
  const d = repo();
  escribir(d, 'staged.txt', 's');
  g(d, 'add', 'staged.txt');
  const r = cli(d, ARGS('quitar-stash', ['--id', 'hook:PreToolUse/Bash/node "$X\\a.cjs"', '--id', 'deny:Bash(a, b)']));
  assert.equal(r.codigo, 0, r.out);
  const id = /propuesto (\S+)/.exec(r.out)[1];
  assert.match(id, /^\d{4}-\d{2}-\d{2}-quitar-stash$/);
  assert.match(r.out, /^te espera: \S+ · quitar el freno del stash · toca: frenos · ids: deny:Bash\(git stash:\*\), hook:PreToolUse\/Bash\/node \$X\/a\.cjs, deny:Bash\(a, b\) · hash [0-9a-f]{8}$/m);
  assert.equal(g(d, 'log', '-1', '--format=%s'), `cambios: propuesto ${id}`);
  assert.equal(g(d, 'show', '--name-only', '--format=', 'HEAD'), rel(id));
  assert.equal(g(d, 'diff', '--cached', '--name-only'), 'staged.txt');
  const t = leer(d, rel(id));
  assert.match(t, /^---\nestado: propuesto\nclase: 3-barrera\ntoca: \[frenos\]\nids: \["deny:Bash\(git stash:\*\)", "hook:PreToolUse\/Bash\/node \$X\/a\.cjs", "deny:Bash\(a, b\)"\]\norigen: "lo pidió Guido"\ncicatriz: no\nchico: sí\nurgente: no\n---\n\n## Caso de origen\n/);
  assert.deepEqual(C.verificar(d), []);
});

test('nuevo: --cuerpo desde un archivo; chico por defecto (sí sin cicatriz, no con cicatriz); chico: sí con cicatriz pide chico-por', () => {
  const d = repo();
  const archivo = path.join(TMP, `cuerpo${n++}.md`);
  fs.writeFileSync(archivo, CUERPO.replace(/\n/g, '\r\n'));
  let r = cli(d, ['nuevo', '--slug', 'uno', '--clase', '2', '--toca', 'inicio,cierre', '--cita', 'hub 12', '--cuerpo', archivo], '');
  assert.equal(r.codigo, 0, r.out);
  let t = leer(d, rel(/propuesto (\S+)/.exec(r.out)[1]));
  assert.match(t, /^toca: \[inicio, cierre\]\ncita: "hub 12"\ncicatriz: no\nchico: sí\n/m);
  assert.doesNotMatch(t, /\r/);
  r = cli(d, ['nuevo', '--slug', 'dos', '--clase', '2', '--toca', 'inicio', '--origen', 'o', '--cicatriz', 'plata']);
  t = leer(d, rel(/propuesto (\S+)/.exec(r.out)[1]));
  assert.match(t, /^cicatriz: plata\nchico: no\n/m);
  r = cli(d, ['nuevo', '--slug', 'tres', '--clase', '2', '--toca', 'inicio', '--origen', 'o', '--cicatriz', 'plata', '--chico', 'si']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /va contra la cicatriz/);
  r = cli(d, ['nuevo', '--slug', 'tres', '--clase', '2', '--toca', 'inicio', '--origen', 'o', '--cicatriz', 'plata', '--chico', 'sí', '--chico-por', 'es una línea']);
  assert.equal(r.codigo, 0, r.out);
});

test('nuevo se niega (1, nada escrito ni commiteado): sin las cuatro secciones, clase 2 con una barrera, id repetido, merge a medias', () => {
  const d = repo();
  const antes = g(d, 'rev-parse', 'HEAD');
  let r = cli(d, ARGS('a'), '## Caso de origen\nx\n## Regla\ny\n');
  assert.equal(r.codigo, 1);
  assert.match(r.out, /falta la sección "## Dónde vive"/);
  assert.match(r.out, /falta la sección "## Medición"/);
  r = cli(d, ARGS('a'), '');
  assert.equal(r.codigo, 1);
  r = cli(d, ['nuevo', '--slug', 'a', '--clase', '2', '--toca', 'frenos', '--origen', 'o']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /clase 2 nombra una barrera/);
  assert.equal(g(d, 'rev-parse', 'HEAD'), antes);
  assert.equal(fs.existsSync(path.join(d, '.claude', 'cambios')), false);
  proponer(d, 'a');
  r = cli(d, ARGS('a'));
  assert.equal(r.codigo, 1);
  assert.match(r.out, /ya existe .*elegí otro --slug/);
  // merge a medias
  const m = conMergeAMedias();
  const antesM = foto(m, 'x');
  r = cli(m, ARGS('b'));
  assert.equal(r.codigo, 1);
  assert.match(r.out, /terminá el merge primero/);
  assert.deepEqual(foto(m, 'x'), antesM);
});

function conMergeAMedias() {
  const d = repo({ 'c.txt': 'base\n' });
  g(d, 'checkout', '-q', '-b', 'otra');
  commit(d, { 'c.txt': 'otra\n' });
  g(d, 'checkout', '-q', 'main');
  commit(d, { 'c.txt': 'main\n' });
  assert.equal(gOk(d, 'merge', 'otra'), false);
  return d;
}

test('nuevo: si git no puede commitear, no queda nada (ni el archivo ni en el índice)', () => {
  const d = repo();
  const hooks = path.join(TMP, `githooks${n++}`);
  fs.mkdirSync(hooks);
  fs.writeFileSync(path.join(hooks, 'pre-commit'), '#!/bin/sh\nexit 1\n', { mode: 0o755 });
  g(d, 'config', 'core.hooksPath', hooks);
  const r = cli(d, ARGS('a'));
  assert.equal(r.codigo, 1);
  assert.match(r.out, /git no pudo commitear .*no quedó nada escrito/);
  assert.equal(g(d, 'status', '--porcelain', '--untracked-files=all'), '');
});

// ---------------------------------------------------------------- listar y verificar

test('listar: una línea por cambio; --te-espera la línea lista de los propuestos 3-barrera; vacío lo dice', () => {
  const d = repo();
  assert.deepEqual(cli(d, ['listar']), { codigo: 0, out: 'cambios: no hay ninguno\n', err: '' });
  assert.deepEqual(cli(d, ['listar', '--te-espera']), { codigo: 0, out: '', err: '' });
  const id = proponer(d, 'a');
  const id2 = proponer(d, 'b', []);
  const r2 = cli(d, ['nuevo', '--slug', 'c', '--clase', '2', '--toca', 'inicio', '--origen', 'o']);
  const id3 = /propuesto (\S+)/.exec(r2.out)[1];
  assert.equal(cli(d, ['aprobar', id2]).codigo, 0);
  const h = C.hashSello(leer(d, rel(id))).slice(0, 8);
  assert.equal(cli(d, ['listar', '--te-espera']).out, `${id} · quitar el freno del stash · toca: frenos · ids: deny:Bash(git stash:*) · hash ${h}\n`);
  assert.equal(
    cli(d, ['listar']).out,
    `${id} · propuesto · clase 3-barrera · toca: frenos\n${id2} · aprobado · clase 3-barrera · toca: frenos\n${id3} · propuesto · clase 2 · toca: inicio\n`,
  );
  escribir(d, '.claude/cambios/2026-01-01-roto.md', '---\nestado: [\n---\n');
  const r = cli(d, ['listar']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /^2026-01-01-roto · no se lee — corré verificar$/m);
});

test('listar --aprobados-nuevos: los sellados después de la marca de la sesión anterior a la más nueva', () => {
  const d = repo();
  const aprobarEn = (id, cuando) => assert.equal(script.main(['aprobar', id], { cwd: d, salida: () => {}, error: () => {}, ahora: new Date(cuando) }), 0);
  const marcas = path.join(d, '.git', 'kit-sesiones');
  const marca = (nombre, cuando) => {
    fs.mkdirSync(marcas, { recursive: true });
    fs.writeFileSync(path.join(marcas, nombre), '');
    fs.utimesSync(path.join(marcas, nombre), new Date(cuando), new Date(cuando));
  };
  const viejo = proponer(d, 'viejo');
  aprobarEn(viejo, '2026-01-01T10:00:00Z');
  // sin marcas (o con una sola): todos los sellados
  assert.match(cli(d, ['listar', '--aprobados-nuevos']).out, new RegExp(`^${viejo} · aprobado · sellado \\S+ · carpeta \\. · rol humano · sesión sin-marca$`, 'm'));
  marca('sesion-vieja', '2026-01-01T09:00:00Z'); // una más vieja: no es "la anterior"
  marca('sesion-anterior', '2026-01-01T11:00:00Z');
  marca('sesion-de-hoy', '2026-01-01T13:00:00Z');
  assert.equal(cli(d, ['listar', '--aprobados-nuevos']).out, '');
  const nuevo = proponer(d, 'nuevo');
  aprobarEn(nuevo, '2026-01-01T12:00:00Z');
  assert.equal(cli(d, ['listar', '--aprobados-nuevos']).out.trim().split('\n').length, 1);
  assert.match(cli(d, ['listar', '--aprobados-nuevos']).out, new RegExp(`^${nuevo} · aprobado · sellado \\S+ · carpeta \\. · rol humano · sesión sesion-de-hoy$`, 'm'));
});

test('verificar: 0 con "N en orden"; 1 con id · qué pasa · qué hacer por falla', () => {
  const d = repo();
  assert.deepEqual(cli(d, ['verificar']), { codigo: 0, out: 'cambios: 0 en orden\n', err: '' });
  const id = proponer(d, 'a');
  assert.equal(cli(d, ['verificar']).out, 'cambios: 1 en orden\n');
  commit(d, { [rel(id)]: leer(d, rel(id)).replace('estado: propuesto', 'estado: aprobado') });
  const r = cli(d, ['verificar']);
  assert.equal(r.codigo, 1);
  assert.equal(r.out, `${id} · 3-barrera aprobado sin sello · el único camino a aprobado es cambios aprobar <id>, desde tu checkout principal\n`);
});

// ---------------------------------------------------------------- anotar-sha y rechazar

test('anotar-sha: clase 2 propuesto → aplicado con el sha completo y --aplico con el hash de la zona propia', () => {
  const d = repo();
  const r = cli(d, ['nuevo', '--slug', 'c', '--clase', '2', '--toca', 'inicio', '--origen', 'o']);
  const id = /propuesto (\S+)/.exec(r.out)[1];
  const sha = commit(d, { 'docs/x.md': 'arriba\n<!-- kit:propio -->\nlo mío\n<!-- /kit:propio -->\nabajo\n', 'docs/sin.md': 'nada\n' });
  assert.match(cli(d, ['anotar-sha', id, sha.slice(0, 8), '--aplico', 'docs/sin.md']).out, /no tiene zona propia/);
  assert.match(cli(d, ['anotar-sha', id, sha, '--aplico', 'docs/nada.md']).out, /no está en ese commit/);
  const ok = cli(d, ['anotar-sha', id, sha.slice(0, 8), '--aplico', 'docs/x.md']);
  assert.equal(ok.codigo, 0, ok.out);
  const t = leer(d, rel(id));
  assert.match(t, new RegExp(`^estado: aplicado$[\\s\\S]*^sha: ${sha}\naplico: \\{archivo: "docs/x.md", hash: ${require('../hooks/lib/ficha.cjs').hash('lo mío')}\\}\n---`, 'm'));
  assert.deepEqual(C.verificar(d), []);
  assert.match(cli(d, ['anotar-sha', id, sha]).out, /es aplicado: anotar-sha va sobre un clase 2 propuesto/);
});

test('anotar-sha de un 3-barrera: solo aprobado, solo un commit que existe, y solo el primero que toca lo de "toca" tras el sello', () => {
  const d = repo({ '.claude/kit.md': FICHA });
  const id = proponer(d, 'a');
  assert.match(cli(d, ['anotar-sha', id, 'HEAD']).out, /es propuesto: anotar-sha va sobre un 3-barrera aprobado/);
  assert.equal(cli(d, ['aprobar', id]).codigo, 0);
  const sello = g(d, 'rev-parse', 'HEAD');
  assert.match(cli(d, ['anotar-sha', id, 'f'.repeat(40)]).out, /ese commit no existe/);
  assert.match(cli(d, ['anotar-sha', id, '-q']).out, /eso no es un commit/);
  assert.match(cli(d, ['anotar-sha', id, 'HEAD;rm']).out, /eso no es un commit/);
  assert.match(cli(d, ['anotar-sha', id, sello]).out, /no viene después del sello/);
  const nada = commit(d, { 'z.txt': 'z' });
  assert.match(cli(d, ['anotar-sha', id, nada]).out, /no toca nada de lo de "toca"/);
  const primero = commit(d, { '.claude/kit.md': FICHA.replace('quitados: []', 'quitados:\n    - {id: deny:Bash(git stash:*), por: "x", hasta: siempre}') });
  const segundo = commit(d, { '.claude/kit.md': FICHA });
  assert.match(cli(d, ['anotar-sha', id, segundo]).out, new RegExp(`el primer commit después del sello que toca lo de "toca" es ${primero.slice(0, 12)}`));
  assert.equal(cli(d, ['anotar-sha', id, primero]).codigo, 0);
});

test('rechazar: desde propuesto o aprobado, con motivo; no desde aplicado; motivo con " o vacío no', () => {
  const d = repo();
  const id = proponer(d, 'a');
  assert.equal(cli(d, ['rechazar', id, 'dijo "no"']).codigo, 1);
  assert.equal(cli(d, ['rechazar', id, ' ']).codigo, 1);
  assert.deepEqual(cli(d, ['rechazar', id, 'Guido dijo que no']), { codigo: 0, out: `cambios: rechazado ${id}\n`, err: '' });
  assert.match(leer(d, rel(id)), /^estado: rechazado$[\s\S]*^motivo: "Guido dijo que no"$/m);
  assert.match(cli(d, ['rechazar', id, 'otra vez']).out, /es rechazado/);
  const id2 = proponer(d, 'b');
  assert.equal(cli(d, ['aprobar', id2]).codigo, 0);
  assert.equal(cli(d, ['rechazar', id2, 'me arrepentí']).codigo, 0);
  assert.deepEqual(C.verificar(d).filter((f) => f.id === id2), []);
  assert.match(cli(d, ['rechazar', '2026-01-01-no-existe', 'x']).out, /no existe/);
});

// ---------------------------------------------------------------- aprobar: el sí

test('aprobar: estado aprobado, el sello entero, el renglón en frenos.log y SU commit con esos dos archivos solos', () => {
  const d = repo();
  const id = proponer(d, 'a');
  const hash = C.hashSello(leer(d, rel(id)));
  fs.mkdirSync(path.join(d, '.git', 'kit-sesiones'));
  fs.writeFileSync(path.join(d, '.git', 'kit-sesiones', 'mi-sesion-1'), '');
  escribir(d, 'otro.txt', 'sin commitear');
  g(d, 'add', 'otro.txt');
  const r = cli(d, ['aprobar', id]);
  assert.equal(r.codigo, 0, r.out);
  assert.match(r.out, new RegExp(`^cambios: aprobado ${id} · hash ${hash.slice(0, 8)} · commit [0-9a-f]+\n$`));
  assert.equal(g(d, 'log', '-1', '--format=%s'), `cambios: aprobado ${id}`);
  assert.deepEqual(g(d, 'show', '--name-only', '--format=', 'HEAD').split('\n').sort(), ['.claude/cambios/' + id + '.md', '.claude/frenos.log'].sort());
  assert.equal(g(d, 'diff', '--cached', '--name-only'), 'otro.txt');
  const s = C.leer(leer(d, rel(id))).datos;
  assert.equal(s.estado, 'aprobado');
  assert.deepEqual(Object.keys(s.aprobo), ['sesion', 'fecha', 'carpeta', 'rol', 'hash', 'freno']);
  assert.equal(s.aprobo.sesion, 'mi-sesion-1');
  assert.equal(s.aprobo.carpeta, '.');
  assert.equal(s.aprobo.rol, 'humano');
  assert.equal(s.aprobo.hash, hash);
  assert.match(s.aprobo.freno, new RegExp(`^${s.aprobo.fecha.replace(/[+]/g, '\\+')} · humano · main · cambios:aprobar · cambios\\.cjs · ${id}$`));
  assert.equal(leer(d, '.claude/frenos.log'), `${s.aprobo.freno}\n`);
  assert.deepEqual(C.verificar(d), []);
});

test('aprobar: frenos.log sucio no lo traba; su commit lo lleva como esté', () => {
  const d = repo({ '.claude/frenos.log': 'renglón viejo\n' });
  const id = proponer(d, 'a');
  fs.appendFileSync(path.join(d, '.claude', 'frenos.log'), 'renglón del hook, sin commitear\n');
  assert.equal(cli(d, ['aprobar', id]).codigo, 0);
  assert.equal(g(d, 'status', '--porcelain'), '');
  assert.match(g(d, 'show', 'HEAD:.claude/frenos.log'), /^renglón viejo\nrenglón del hook, sin commitear\n.* · cambios:aprobar · /);
  assert.deepEqual(C.verificar(d), []);
});

test('aprobar en un repo sin remoto ni ficha (4.7, caso 4): anda y nada se traba', () => {
  const d = repo();
  assert.equal(g(d, 'remote'), '');
  const id = proponer(d, 'a');
  assert.equal(cli(d, ['aprobar', id]).codigo, 0);
  assert.deepEqual(cli(d, ['verificar']).codigo, 0);
});

// ---------------------------------------------------------------- aprobar: cada negativa, sin escribir nada

test('aprobar se niega con .kit-rol de cada rol de agente (y con uno que no se entiende): por su nombre', () => {
  const d = repo();
  const id = proponer(d, 'a');
  for (const rol of ['director', 'obrero', 'nocturno', 'actualizador', 'jefe']) {
    fs.writeFileSync(path.join(d, '.kit-rol'), `${rol}\n`);
    niega(d, id, new RegExp(`\\.kit-rol: ${rol === 'jefe' ? 'desconocido' : rol}`));
  }
  fs.unlinkSync(path.join(d, '.kit-rol'));
  fs.mkdirSync(path.join(d, '.kit-rol')); // existe y no se lee: nunca humano
  niega(d, id, /\.kit-rol: desconocido/);
});

test('aprobar se niega desde un worktree (con rol humano y con .kit-rol de obrero), por su nombre y por la ruta absoluta del script', () => {
  const d = repo();
  instanciar(d);
  commit(d, { '.claude/settings.json': '{}\n' }, 'molde');
  g(d, 'add', '-f', '.claude');
  g(d, 'commit', '-q', '-m', 'molde instanciado');
  const id = proponer(d, 'a');
  const w = path.join(d, '.claude', 'worktrees', 'w1');
  g(d, 'worktree', 'add', '-q', '-b', 'worktree-w1', w);
  niega(w, id, /no es el checkout principal/);
  const rutaPrincipal = path.join(d, '.claude', 'scripts', 'cambios.cjs');
  const rutaWorktree = path.join(w, '.claude', 'scripts', 'cambios.cjs');
  niega(w, id, /no es el checkout principal/, { ruta: rutaPrincipal });
  fs.writeFileSync(path.join(w, '.kit-rol'), 'obrero\n');
  niega(w, id, /\.kit-rol: obrero/);
  niega(w, id, /\.kit-rol: obrero/, { ruta: rutaPrincipal, fotoEn: d });
  niega(w, id, /\.kit-rol: obrero/, { ruta: rutaWorktree, fotoEn: d });
  // por la ruta, desde el principal con .kit-rol de agente
  fs.writeFileSync(path.join(d, '.kit-rol'), 'director\n');
  niega(d, id, /\.kit-rol: director/, { ruta: rutaPrincipal });
  niega(d, id, /\.kit-rol: director/, { ruta: rutaWorktree });
  fs.unlinkSync(path.join(d, '.kit-rol'));
  // y el sí, por la ruta, desde el principal
  const r = correr(d, rutaPrincipal, ['aprobar', id]);
  assert.equal(r.codigo, 0, r.out + r.err);
});

test('aprobar se niega fuera de la rama por defecto (y con HEAD suelto)', () => {
  const d = repo();
  const id = proponer(d, 'a');
  g(d, 'checkout', '-q', '-b', 'modulo/x');
  niega(d, id, /no está en la rama por defecto \(main\)/);
  g(d, 'checkout', '-q', '--detach', 'main');
  niega(d, id, /no está en la rama por defecto/);
});

test('aprobar se niega con el archivo del cambio con cambios sin commitear, o sin commitear nunca', () => {
  const d = repo();
  const id = proponer(d, 'a');
  fs.appendFileSync(path.join(d, ...rel(id).split('/')), 'una línea más\n');
  niega(d, id, /tiene cambios sin commitear/);
  g(d, 'checkout', '-q', '--', rel(id));
  const otro = C.armar({ clase: '3-barrera', toca: ['frenos'], ids: ['x'], origen: 'o', cicatriz: 'no', chico: 'sí', urgente: 'no', cuerpo: CUERPO });
  escribir(d, rel('2026-01-01-a-mano'), otro);
  niega(d, '2026-01-01-a-mano', /no está commiteado/);
  g(d, 'add', '--', rel('2026-01-01-a-mano'));
  niega(d, '2026-01-01-a-mano', /no está commiteado/);
});

test('aprobar se niega con un cambio que no es propuesto 3-barrera, con uno que no valida, y con un id que no existe', () => {
  const d = repo();
  const id = proponer(d, 'a');
  assert.equal(cli(d, ['aprobar', id]).codigo, 0);
  niega(d, id, /es aprobado, clase 3-barrera: se aprueba solo un propuesto 3-barrera/);
  const r = cli(d, ['nuevo', '--slug', 'c', '--clase', '2', '--toca', 'inicio', '--origen', 'o']);
  const id2 = /propuesto (\S+)/.exec(r.out)[1];
  niega(d, id2, /es propuesto, clase 2/);
  const id3 = proponer(d, 'b');
  commit(d, { [rel(id3)]: leer(d, rel(id3)).replace('## Medición', '## Otra cosa') });
  niega(d, id3, /falta la sección "## Medición" — corré verificar/);
  niega(d, '2026-01-01-no-existe', /no existe \.claude\/cambios\/2026-01-01-no-existe\.md/);
  niega(d, '../../a', /no es un id de cambio/);
});

test('aprobar se niega con la ficha rota (4.7, caso 2), con el comando de la última que se lee', () => {
  const d = repo({ '.claude/kit.md': FICHA });
  const buena = g(d, 'rev-parse', 'HEAD');
  commit(d, { '.claude/kit.md': FICHA_ROTA });
  const id = proponer(d, 'a');
  const out = niega(d, id, /ficha rota: \.claude\/kit\.md:\d+ — corré doctor; la última que se lee: git show [0-9a-f]{12}:\.claude\/kit\.md/);
  assert.ok(out.includes(`git show ${buena.slice(0, 12)}:.claude/kit.md`), out);
  // rota desde siempre
  const d2 = repo({ '.claude/kit.md': FICHA_ROTA });
  const id2 = proponer(d2, 'a');
  niega(d2, id2, /no hay ninguna anterior que se lea/);
});

test('aprobar se niega con un merge a medias: "terminá el merge primero"', () => {
  const d = conMergeAMedias();
  g(d, 'merge', '--abort');
  const id = proponer(d, 'a');
  assert.equal(gOk(d, 'merge', 'otra'), false);
  niega(d, id, /terminá el merge primero/);
});

test('aprobar se niega si frenos.log está ignorado, y si el renglón no se puede sellar (una " en la rama)', () => {
  const d = repo();
  const id = proponer(d, 'a');
  commit(d, { '.gitignore': '/.claude/worktrees/\n/.kit-rol\n/.claude/frenos.log\n' });
  niega(d, id, /frenos\.log está ignorado/);
  // Una rama con " no se puede crear en Windows (el archivo del ref): el nombre entra por las librerías.
  const d2 = repo();
  const id2 = proponer(d2, 'a');
  const L = script.libs();
  const conComilla = { ...L, contexto: { ...L.contexto, rama: () => 'ma"in', ramaPorDefecto: () => 'ma"in' } };
  const antes = foto(d2, id2);
  const r = script.aprobar(conComilla, d2, id2);
  assert.equal(r.codigo, 1);
  assert.match(r.lineas[0], /^cambios aprobar: no — .*no se puede sellar/);
  assert.deepEqual(foto(d2, id2), antes);
  // segunda red: si la carpeta del sello no diera "." (hoy lo impide el chequeo del principal), tampoco se escribe
  const otraCarpeta = { ...L, contexto: { ...L.contexto, carpetaRelativa: () => '.claude/worktrees/w1' } };
  const r2 = script.aprobar(otraCarpeta, d2, id2);
  assert.equal(r2.codigo, 1);
  assert.match(r2.lineas[0], /no es el checkout principal/);
  assert.deepEqual(foto(d2, id2), antes);
});

test('aprobar: si el commit falla (un pre-commit que frena), vuelve todo atrás', () => {
  const d = repo({ '.claude/frenos.log': 'viejo\n' });
  const id = proponer(d, 'a');
  fs.appendFileSync(path.join(d, '.claude', 'frenos.log'), 'sucio\n');
  const hooks = path.join(TMP, `githooks${n++}`);
  fs.mkdirSync(hooks);
  fs.writeFileSync(path.join(hooks, 'pre-commit'), '#!/bin/sh\nexit 1\n', { mode: 0o755 });
  g(d, 'config', 'core.hooksPath', hooks);
  const antes = foto(d, id);
  const r = cli(d, ['aprobar', id]);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /git no pudo commitear .*quedó como estaba/);
  assert.deepEqual(foto(d, id), antes);
});

// ---------------------------------------------------------------- 4.7: error interno

test('error interno (una librería que falta) → "cambios roto: corré doctor" y salida 1, nunca 0', () => {
  const d = repo();
  instanciar(d, 'cambios.cjs'); // falta lib/cambios.cjs (el script de .claude/scripts/ sí está: el filtro saltea solo en hooks/)
  assert.equal(fs.existsSync(path.join(d, '.claude', 'hooks', 'lib', 'cambios.cjs')), false);
  for (const args of [['verificar'], ['aprobar', '2026-01-01-x'], ['listar']]) {
    const r = correr(d, path.join(d, '.claude', 'scripts', 'cambios.cjs'), args);
    assert.equal(r.codigo, 1, JSON.stringify(args));
    assert.equal(r.out, 'cambios roto: corré doctor\n');
  }
  // mal llamado sigue siendo 2 aunque falte la librería (no la necesita)
  assert.equal(correr(d, path.join(d, '.claude', 'scripts', 'cambios.cjs'), ['nada']).codigo, 2);
});

test('fuera de un repo git: 1 con una línea', () => {
  const d = path.join(TMP, `suelto${n++}`);
  fs.mkdirSync(d);
  const r = cli(d, ['verificar']);
  assert.equal(r.codigo, 1);
  assert.equal(r.out, 'cambios: no estás dentro de un repo git\n');
});
