'use strict';
// Pruebas de git.cjs. Corren con: node --test "kit/**/*.test.cjs"
// Repos temporales armados acá (mkdtemp + git init), con identidad y fechas fijas; nunca los repos de prueba del kit.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

// Aislado de la configuración de esta PC (init.defaultBranch, autocrlf…): un global vacío y sin el del sistema.
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-git-'));
const GLOBAL = path.join(TMP, 'gitconfig-vacio');
fs.writeFileSync(GLOBAL, '');
process.env.GIT_CONFIG_GLOBAL = GLOBAL;
process.env.GIT_CONFIG_NOSYSTEM = '1';

const git = require('./git.cjs');

test.after(() => fs.rmSync(TMP, { recursive: true, force: true }));

let n = 0;
const carpeta = () => {
  const d = path.join(TMP, `r${n++}`);
  fs.mkdirSync(d);
  return d;
};
function g(cwd, args, env = {}) {
  const r = spawnSync('git', ['-c', 'user.name=Prueba', '-c', 'user.email=prueba@ejemplo.invalid', ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}
function repo() {
  const d = carpeta();
  g(d, ['init', '-q', '-b', 'main']);
  return d;
}
const fechas = (iso, isoCommit) => ({ GIT_AUTHOR_DATE: iso, GIT_COMMITTER_DATE: isoCommit || iso });

// ---------------------------------------------------------------- correr

test('correr: git anda y devuelve la salida', () => {
  const r = git.correr(['--version']);
  assert.equal(r.ok, true);
  assert.equal(r.codigo, 0);
  assert.match(r.stdout, /^git version /);
  assert.ok(Buffer.isBuffer(r.salida));
  assert.equal(r.error, null);
});

test('correr: un git que falla da ok false con su código, sin tirar', () => {
  const d = carpeta();
  const r = git.correr(['rev-parse', '--show-toplevel'], { cwd: d });
  assert.equal(r.ok, false);
  assert.equal(r.codigo, 128);
  assert.equal(r.error, null);
});

test('correr: corta por tiempo límite', () => {
  const r = git.correr(['-c', 'alias.dormir=!node -e "setTimeout(function(){},8000)"', 'dormir'], { tiempo: 400 });
  assert.equal(r.ok, false);
  assert.equal(r.error, 'tiempo');
});

test('correr: el tiempo por defecto es 5 s', () => {
  assert.equal(git.TIEMPO_GIT, 5000);
});

test('correr: no se lo desvía con GIT_DIR ni GIT_WORK_TREE heredados', () => {
  const d = repo();
  const antes = { dir: process.env.GIT_DIR, wt: process.env.GIT_WORK_TREE, idx: process.env.GIT_INDEX_FILE };
  process.env.GIT_DIR = path.join(TMP, 'no-existe', '.git');
  process.env.GIT_WORK_TREE = path.join(TMP, 'no-existe');
  process.env.GIT_INDEX_FILE = path.join(TMP, 'no-existe', 'index');
  try {
    const r = git.correr(['rev-parse', '--show-toplevel'], { cwd: d });
    assert.equal(r.ok, true);
    assert.equal(path.resolve(r.stdout.trim()).toLowerCase(), path.resolve(d).toLowerCase());
  } finally {
    for (const [k, v] of [['GIT_DIR', antes.dir], ['GIT_WORK_TREE', antes.wt], ['GIT_INDEX_FILE', antes.idx]]) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
});

test('correr: sin git en el PATH da error sin-git', () => {
  const antes = process.env.PATH;
  const antesW = process.env.Path;
  process.env.PATH = path.join(TMP, 'vacio');
  if (antesW !== undefined) process.env.Path = path.join(TMP, 'vacio');
  try {
    const r = git.correr(['--version']);
    assert.equal(r.ok, false);
    assert.equal(r.error, 'sin-git');
  } finally {
    process.env.PATH = antes;
    if (antesW !== undefined) process.env.Path = antesW;
  }
});

test('correr: pasa la entrada estándar', () => {
  const d = repo();
  const r = git.correr(['hash-object', '--stdin'], { cwd: d, entrada: 'hola\n' });
  assert.equal(r.ok, true);
  // El blob de git es sha1("blob <largo>\0<contenido>"): si la entrada no llegara, daría el de un archivo vacío.
  const esperado = require('crypto').createHash('sha1').update('blob 5\0hola\n').digest('hex');
  assert.equal(r.stdout.trim(), esperado);
  assert.equal(git.texto(['hash-object', '--stdin'], { cwd: d, entrada: 'hola\n' }), esperado);
});

test('texto: recortado si anduvo, null si no', () => {
  const d = repo();
  assert.equal(git.texto(['symbolic-ref', '--short', 'HEAD'], { cwd: d }), 'main');
  assert.equal(git.texto(['rev-parse', '--verify', '-q', 'no-existe'], { cwd: d }), null);
});

// ---------------------------------------------------------------- edades

test('edades: la fecha de cada renglón, el sin commitear aparte', () => {
  const d = repo();
  fs.writeFileSync(path.join(d, 'a.md'), 'uno\ndos\n');
  g(d, ['add', 'a.md']);
  g(d, ['commit', '-q', '-m', 'primero'], fechas('2026-01-10T12:00:00Z', '2026-01-11T12:00:00Z'));
  fs.writeFileSync(path.join(d, 'a.md'), 'uno\nDOS\n');
  g(d, ['commit', '-q', '-am', 'segundo'], fechas('2026-03-05T08:30:00Z'));
  fs.writeFileSync(path.join(d, 'a.md'), 'uno\nDOS\ntres sin commitear\n');

  const e = git.edades('a.md', { cwd: d });
  assert.equal(e.length, 3);
  assert.deepEqual(e.map((x) => x.linea), [1, 2, 3]);
  assert.deepEqual(e.map((x) => x.texto), ['uno', 'DOS', 'tres sin commitear']);
  assert.equal(e[0].fecha.toISOString(), '2026-01-10T12:00:00.000Z');
  assert.equal(e[0].fechaCommit.toISOString(), '2026-01-11T12:00:00.000Z');
  assert.equal(e[0].sinCommitear, false);
  assert.equal(e[1].fecha.toISOString(), '2026-03-05T08:30:00.000Z');
  assert.notEqual(e[0].sha, e[1].sha);
  assert.equal(e[2].sinCommitear, true);
  assert.equal(e[2].fecha, null);
  assert.equal(e[2].fechaCommit, null);
});

test('edades: con rev, el blame de esa revisión (sin lo del disco)', () => {
  const d = repo();
  fs.writeFileSync(path.join(d, 'a.md'), 'uno\n');
  g(d, ['add', 'a.md']);
  g(d, ['commit', '-q', '-m', 'primero'], fechas('2026-02-01T00:00:00Z'));
  fs.writeFileSync(path.join(d, 'a.md'), 'uno\nnuevo\n');
  const e = git.edades('a.md', { cwd: d, rev: 'HEAD' });
  assert.equal(e.length, 1);
  assert.equal(e[0].fecha.toISOString(), '2026-02-01T00:00:00.000Z');
});

test('edades: renglones con CRLF salen sin el \\r', () => {
  const d = repo();
  fs.writeFileSync(path.join(d, 'a.md'), 'uno\r\ndos\r\n');
  g(d, ['add', 'a.md']);
  g(d, ['commit', '-q', '-m', 'crlf'], fechas('2026-02-01T00:00:00Z'));
  assert.deepEqual(git.edades('a.md', { cwd: d }).map((x) => x.texto), ['uno', 'dos']);
});

test('edades: archivo que git no conoce o sin repo → null', () => {
  const d = repo();
  fs.writeFileSync(path.join(d, 'a.md'), 'x\n');
  g(d, ['add', 'a.md']);
  g(d, ['commit', '-q', '-m', 'x']);
  assert.equal(git.edades('no-existe.md', { cwd: d }), null);
  assert.equal(git.edades('a.md', { cwd: carpeta() }), null);
});

// ---------------------------------------------------------------- el plazo del hook entero (E4b)

// Un reloj de mentira: siempre la misma hora (el plazo no depende de la velocidad de la PC).
const quieto = (ms) => () => ms;
const sinPathDeGit = (fn) => {
  const antes = process.env.PATH;
  const antesW = process.env.Path;
  process.env.PATH = path.join(TMP, 'vacio');
  if (antesW !== undefined) process.env.Path = path.join(TMP, 'vacio');
  try {
    return fn();
  } finally {
    process.env.PATH = antes;
    if (antesW !== undefined) process.env.Path = antesW;
  }
};

test('plazo: sin plazo, todo como antes (lo pedido, Infinity, nada salteado)', () => {
  git.fijarPlazo(null);
  assert.equal(git.plazoRestante(), Infinity);
  assert.equal(git.tiempoPara(5000), 5000);
  assert.equal(git.tiempoPara(123456), 123456);
  assert.equal(git.correr(['--version']).ok, true);
  assert.equal(git.salteadasPorPlazo(), 0);
  assert.equal(git.TIEMPO_MINIMO, 300);
});

test('plazo: el tope es lo pedido o lo que queda, lo menor y entero; debajo del mínimo, null', () => {
  try {
    git.fijarPlazo(10000.5, quieto(5000)); // quedan 5.000,5 ms
    assert.equal(git.plazoRestante(), 5000.5);
    assert.equal(git.tiempoPara(2000), 2000);
    assert.equal(git.tiempoPara(8000), 5000);
    git.fijarPlazo(10300, quieto(10000)); // justo el mínimo: todavía corre
    assert.equal(git.tiempoPara(5000), 300);
    git.fijarPlazo(10299, quieto(10000));
    assert.equal(git.tiempoPara(5000), null);
    git.fijarPlazo(1000, quieto(5000)); // ya vencido
    assert.equal(git.tiempoPara(5000), null);
  } finally {
    git.fijarPlazo(null);
  }
});

test('plazo vencido: correr no lanza git (ni lo busca), da error plazo y lo cuenta', () => {
  try {
    git.fijarPlazo(1000, quieto(5000));
    // Sin git en el PATH: si lo lanzara, sería 'sin-git'.
    const r = sinPathDeGit(() => git.correr(['--version']));
    assert.equal(r.ok, false);
    assert.equal(r.error, 'plazo');
    assert.equal(r.stdout, '');
    assert.ok(Buffer.isBuffer(r.salida));
    assert.equal(git.texto(['--version']), null);
    assert.equal(git.edades('x.md'), null);
    assert.equal(git.salteadasPorPlazo(), 3);
    git.fijarPlazo(null); // un plazo nuevo (o ninguno) arranca la cuenta de cero
    assert.equal(git.salteadasPorPlazo(), 0);
  } finally {
    git.fijarPlazo(null);
  }
});

test('plazo: un git lento se corta con lo que queda (no con sus 5 s) y es error plazo', () => {
  try {
    git.fijarPlazo(1000, quieto(0)); // queda 1 s; el git pide 5 y duerme 8
    const t0 = Date.now();
    const r = git.correr(['-c', 'alias.dormir=!node -e "setTimeout(function(){},8000)"', 'dormir']);
    assert.equal(r.ok, false);
    assert.equal(r.error, 'plazo');
    assert.ok(Date.now() - t0 < 4500, `tardó ${Date.now() - t0} ms`);
    assert.equal(git.salteadasPorPlazo(), 1);
  } finally {
    git.fijarPlazo(null);
  }
});

test('plazo: un git que corta con su propio tope (más chico que lo que queda) sigue siendo error tiempo', () => {
  try {
    git.fijarPlazo(60000, quieto(0));
    const r = git.correr(['-c', 'alias.dormir=!node -e "setTimeout(function(){},8000)"', 'dormir'], { tiempo: 400 });
    assert.equal(r.error, 'tiempo');
    assert.equal(git.salteadasPorPlazo(), 0);
  } finally {
    git.fijarPlazo(null);
  }
});
