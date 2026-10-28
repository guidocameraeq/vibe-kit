'use strict';
// Pruebas de contexto.cjs. Corren con: node --test "kit/**/*.test.cjs"
// Repos temporales armados acá (mkdtemp + git init, remotos bare locales, identidad fija); nunca los repos de prueba del kit.
// La configuración de git de esta PC no entra (un global vacío y sin el del sistema): init.defaultBranch lo pone cada prueba.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-ctx-'));
const GLOBAL = path.join(TMP, 'gitconfig-vacio');
fs.writeFileSync(GLOBAL, '');
process.env.GIT_CONFIG_GLOBAL = GLOBAL;
process.env.GIT_CONFIG_NOSYSTEM = '1';

const ctx = require('./contexto.cjs');

test.after(() => fs.rmSync(TMP, { recursive: true, force: true }));

// ---------------------------------------------------------------- ayudantes

let n = 0;
const carpeta = (nombre = 'r') => {
  const d = path.join(TMP, `${nombre}${n++}`);
  fs.mkdirSync(d, { recursive: true });
  return d;
};
function g(cwd, ...args) {
  const r = spawnSync('git', ['-c', 'user.name=Prueba', '-c', 'user.email=prueba@ejemplo.invalid', ...args], { cwd, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}
function repo(rama = 'main') {
  const d = carpeta();
  g(d, 'init', '-q', '-b', rama);
  return d;
}
function escribir(d, rel, texto) {
  const p = path.join(d, ...rel.split('/'));
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, texto);
}
function commit(d, rel, texto, msg = 'c') {
  escribir(d, rel, texto);
  g(d, 'add', '--', rel);
  g(d, 'commit', '-q', '-m', msg);
}
const mismo = (a, b) => assert.equal(path.resolve(a).toLowerCase(), path.resolve(b).toLowerCase());

const fichaCon = (hookEscritura, proyecto = 'x') =>
  `---\nkit: 2.4.3\nnivel: liviano\nvars:\n  proyecto: ${proyecto}\npiezas:\n  hook-escritura: ${hookEscritura}\n---\n`;
const FICHA = '.claude/kit.md';
// Tabulador en la sangría: rota en la línea 7.
const FICHA_ROTA = '---\nkit: 2.4.3\nnivel: liviano\nvars:\n  proyecto: x\ncolorcito:\n\ta: b\n---\n';

// Un repo con remoto bare: main (ficha molde) y modulo/x--01 (ficha no), las dos subidas.
function conRemoto() {
  const bare = carpeta('remoto');
  g(bare, 'init', '-q', '--bare', '-b', 'main');
  const d = repo('main');
  commit(d, FICHA, fichaCon('molde', 'principal'));
  g(d, 'remote', 'add', 'origin', bare);
  g(d, 'push', '-q', 'origin', 'main');
  g(d, 'switch', '-q', '-c', 'modulo/x--01');
  commit(d, FICHA, fichaCon('no', 'obrero'));
  g(d, 'push', '-q', 'origin', 'modulo/x--01');
  g(d, 'switch', '-q', 'main');
  g(d, 'fetch', '-q', 'origin');
  return { d, bare };
}

// ---------------------------------------------------------------- de dónde se parte

test('cwdDe: el cwd de la entrada (objeto o texto JSON); si no, el del proceso', () => {
  assert.equal(ctx.cwdDe({ cwd: 'C:/x' }), 'C:/x');
  assert.equal(ctx.cwdDe(JSON.stringify({ cwd: '/y', session_id: 'a' })), '/y');
  assert.equal(ctx.cwdDe('{no es json'), process.cwd());
  assert.equal(ctx.cwdDe({}), process.cwd());
  assert.equal(ctx.cwdDe({ cwd: '  ' }), process.cwd());
  assert.equal(ctx.cwdDe({ cwd: 3 }), process.cwd());
  assert.equal(ctx.cwdDe(undefined), process.cwd());
});

test('raiz: la del checkout del cwd, desde una subcarpeta, y nunca CLAUDE_PROJECT_DIR', () => {
  const d = repo();
  commit(d, 'src/a/b.txt', 'x');
  const otro = repo();
  const antes = process.env.CLAUDE_PROJECT_DIR;
  process.env.CLAUDE_PROJECT_DIR = otro;
  try {
    mismo(ctx.raiz(path.join(d, 'src', 'a')), d);
  } finally {
    if (antes === undefined) delete process.env.CLAUDE_PROJECT_DIR;
    else process.env.CLAUDE_PROJECT_DIR = antes;
  }
  assert.equal(ctx.raiz(carpeta('suelta')), null);
});

// ---------------------------------------------------------------- pestaña

test('pestana: director, obrero, misión y plana', () => {
  const casos = [
    ['modulo/x', { tipo: 'director', modulo: 'x', rama: 'modulo/x' }],
    ['modulo/cuenta-corriente', { tipo: 'director', modulo: 'cuenta-corriente', rama: 'modulo/cuenta-corriente' }],
    ['modulo/x--01', { tipo: 'obrero', modulo: 'x', id: '01', rama: 'modulo/x--01' }],
    ['modulo/cuenta-corriente--E3', { tipo: 'obrero', modulo: 'cuenta-corriente', id: 'E3', rama: 'modulo/cuenta-corriente--E3' }],
    ['worktree-a', { tipo: 'mision', rama: 'worktree-a' }],
    ['worktree-agent-123', { tipo: 'mision', rama: 'worktree-agent-123' }],
    ['main', { tipo: 'plana', rama: 'main' }],
    ['feature/modulo/x', { tipo: 'plana', rama: 'feature/modulo/x' }],
    ['modulo/x/y', { tipo: 'plana', rama: 'modulo/x/y' }],
    ['modulo/', { tipo: 'plana', rama: 'modulo/' }],
    ['Modulo/x', { tipo: 'plana', rama: 'Modulo/x' }],
    ['mi-worktree-a', { tipo: 'plana', rama: 'mi-worktree-a' }],
    [null, { tipo: 'plana', rama: null }],
  ];
  for (const [r, esperado] of casos) assert.deepEqual(ctx.pestana(r), esperado, String(r));
});

test('rama: la del checkout; HEAD suelto → null (pestaña plana)', () => {
  const d = repo();
  commit(d, 'a.txt', '1');
  assert.equal(ctx.rama(d), 'main');
  g(d, 'switch', '-q', '-c', 'modulo/x--07');
  assert.equal(ctx.rama(d), 'modulo/x--07');
  g(d, 'switch', '-q', '--detach', 'main');
  assert.equal(ctx.rama(d), null);
  assert.equal(ctx.pestana(ctx.rama(d)).tipo, 'plana');
});

// ---------------------------------------------------------------- rol

test('rol: sin .kit-rol humano; los cuatro tal cual; otra cosa desconocido', () => {
  const d = repo();
  assert.equal(ctx.rol(d), 'humano');
  for (const r of ['director', 'obrero', 'nocturno', 'actualizador']) {
    fs.writeFileSync(path.join(d, '.kit-rol'), `${r}\n`);
    assert.equal(ctx.rol(d), r);
  }
  const otros = [
    ['\uFEFFobrero\r\n', 'obrero'],
    ['  director  ', 'director'],
    ['Director\n', 'desconocido'],
    ['humano\n', 'desconocido'],
    ['jefe', 'desconocido'],
    ['', 'desconocido'],
    ['director\nobrero\n', 'desconocido'],
  ];
  for (const [contenido, esperado] of otros) {
    fs.writeFileSync(path.join(d, '.kit-rol'), contenido);
    assert.equal(ctx.rol(d), esperado, JSON.stringify(contenido));
  }
  fs.rmSync(path.join(d, '.kit-rol'));
  fs.mkdirSync(path.join(d, '.kit-rol'));
  assert.equal(ctx.rol(d), 'desconocido', 'una carpeta .kit-rol no es humano');
  assert.equal(ctx.rol(null), 'desconocido');
});

// ---------------------------------------------------------------- principal y carpetaRelativa

test('principal y carpetaRelativa: "." en el checkout (y en su subcarpeta), .claude/worktrees/w1 en un worktree', () => {
  const d = repo();
  commit(d, 'src/a.txt', '1');
  assert.equal(ctx.principal(d), true);
  assert.equal(ctx.carpetaRelativa(d), '.');
  assert.equal(ctx.carpetaRelativa(path.join(d, 'src')), '.');

  const w1 = path.join(d, '.claude', 'worktrees', 'w1');
  g(d, 'worktree', 'add', '-q', '-b', 'worktree-w1', w1);
  assert.equal(ctx.principal(w1), false);
  assert.equal(ctx.carpetaRelativa(w1), '.claude/worktrees/w1');
  assert.equal(ctx.carpetaRelativa(path.join(w1, 'src')), '.claude/worktrees/w1');
  mismo(ctx.raiz(w1), w1);
  mismo(ctx.gitComun(w1), path.join(d, '.git'));
  assert.notEqual(ctx.gitDir(w1).toLowerCase(), ctx.gitComun(w1).toLowerCase());

  // Un worktree fuera del principal: nunca una ruta absoluta ni con ..
  const afuera = path.join(carpeta('afuera'), 'w2');
  g(d, 'worktree', 'add', '-q', '-b', 'worktree-w2', afuera);
  assert.equal(ctx.principal(afuera), false);
  assert.equal(ctx.carpetaRelativa(afuera), ctx.FUERA_DEL_PRINCIPAL);
  // Fuera de git
  assert.equal(ctx.principal(carpeta('suelta')), false);
  assert.equal(ctx.carpetaRelativa(carpeta('suelta')), ctx.FUERA_DEL_PRINCIPAL);
});

// ---------------------------------------------------------------- rama por defecto y ficha vigente

test('fichaVigente sin remoto: la de la rama local por defecto (main)', () => {
  const d = repo('main');
  commit(d, FICHA, fichaCon('molde'));
  g(d, 'switch', '-q', '-c', 'otra');
  commit(d, FICHA, fichaCon('no'));
  const f = ctx.fichaVigente(d);
  assert.equal(f.estado, 'ok');
  assert.equal(f.datos.piezas['hook-escritura'], 'molde');
  assert.equal(f.ref, 'refs/heads/main');
  assert.equal(ctx.ramaPorDefecto(d), 'main');
  assert.equal(ctx.refVigente(d).origen, 'local');
});

test('fichaVigente sin remoto: sin main, master', () => {
  const d = repo('master');
  commit(d, FICHA, fichaCon('molde'));
  g(d, 'switch', '-q', '-c', 'otra');
  commit(d, FICHA, fichaCon('no'));
  const f = ctx.fichaVigente(d);
  assert.equal(f.estado, 'ok');
  assert.equal(f.ref, 'refs/heads/master');
});

test('fichaVigente sin remoto: con main y master, main gana', () => {
  const d = repo('master');
  commit(d, FICHA, fichaCon('no'));
  g(d, 'switch', '-q', '-c', 'main');
  commit(d, FICHA, fichaCon('molde'));
  g(d, 'switch', '-q', 'master');
  assert.equal(ctx.fichaVigente(d).datos.piezas['hook-escritura'], 'molde');
});

test('fichaVigente sin remoto: init.defaultBranch manda sobre main', () => {
  const d = repo('main');
  commit(d, FICHA, fichaCon('no'));
  g(d, 'switch', '-q', '-c', 'trunk');
  commit(d, FICHA, fichaCon('molde'));
  g(d, 'switch', '-q', 'main');
  g(d, 'config', 'init.defaultBranch', 'trunk');
  const f = ctx.fichaVigente(d);
  assert.equal(f.ref, 'refs/heads/trunk');
  assert.equal(f.datos.piezas['hook-escritura'], 'molde');
  assert.equal(ctx.ramaPorDefecto(d), 'trunk');
});

test('fichaVigente: init.defaultBranch = modulo/x o worktree-* se ignora (r2-5), también con mayúsculas', () => {
  for (const mala of ['modulo/x', 'worktree-a', 'Modulo/y', 'WORKTREE-b']) {
    const d = repo('main');
    commit(d, FICHA, fichaCon('molde'));
    g(d, 'switch', '-q', '-c', mala);
    commit(d, FICHA, fichaCon('no'));
    g(d, 'config', 'init.defaultBranch', mala);
    const f = ctx.fichaVigente(d);
    assert.equal(f.ref, 'refs/heads/main', mala);
    assert.equal(f.datos.piezas['hook-escritura'], 'molde', mala);
    assert.ok(!ctx.candidatas(d).includes(mala), mala);
  }
});

test('fichaVigente: solo una rama modulo/x (aunque init.defaultBranch la nombre) → sin-ficha', () => {
  const d = repo('modulo/x');
  commit(d, FICHA, fichaCon('molde'));
  g(d, 'config', 'init.defaultBranch', 'modulo/x');
  const f = ctx.fichaVigente(d);
  assert.equal(f.estado, 'sin-ficha');
  assert.equal(f.ref, null);
  assert.equal(ctx.ramaPorDefecto(d), null);
});

test('fichaVigente: origin/HEAD apuntado a modulo/x--01 (con hook-escritura: no) se ignora y lee la de main (crit. 14)', () => {
  const { d } = conRemoto();
  g(d, 'remote', 'set-head', 'origin', 'modulo/x--01');
  assert.equal(g(d, 'symbolic-ref', 'refs/remotes/origin/HEAD'), 'refs/remotes/origin/modulo/x--01');
  const f = ctx.fichaVigente(d);
  assert.equal(f.estado, 'ok');
  assert.equal(f.datos.piezas['hook-escritura'], 'molde');
  assert.equal(f.datos.vars.proyecto, 'principal');
  assert.equal(f.ref, 'refs/remotes/origin/main');
  assert.equal(ctx.ramaPorDefecto(d), 'main');
  // Y desde la pestaña del obrero, igual.
  g(d, 'switch', '-q', 'modulo/x--01');
  assert.equal(ctx.fichaVigente(d).datos.piezas['hook-escritura'], 'molde');
});

test('fichaVigente: origin/HEAD a otra rama que no es candidata (develop) también se ignora', () => {
  const { d } = conRemoto();
  g(d, 'switch', '-q', '-c', 'develop');
  commit(d, FICHA, fichaCon('no'));
  g(d, 'push', '-q', 'origin', 'develop');
  g(d, 'remote', 'set-head', 'origin', 'develop');
  assert.equal(ctx.fichaVigente(d).ref, 'refs/remotes/origin/main');
});

test('fichaVigente: origin/HEAD vale si apunta a master aunque origin tenga main', () => {
  const { d } = conRemoto();
  g(d, 'switch', '-q', '-c', 'master', 'main');
  commit(d, FICHA, fichaCon('no', 'de-master'));
  g(d, 'push', '-q', 'origin', 'master');
  g(d, 'remote', 'set-head', 'origin', 'master');
  const f = ctx.fichaVigente(d);
  assert.equal(f.ref, 'refs/remotes/origin/master');
  assert.equal(f.datos.vars.proyecto, 'de-master');
  assert.equal(ctx.refVigente(d).origen, 'origin/HEAD');
});

test('fichaVigente: origin/HEAD vale si apunta a init.defaultBranch', () => {
  const { d } = conRemoto();
  g(d, 'switch', '-q', '-c', 'trunk', 'main');
  commit(d, FICHA, fichaCon('no', 'de-trunk'));
  g(d, 'push', '-q', 'origin', 'trunk');
  g(d, 'remote', 'set-head', 'origin', 'trunk');
  assert.equal(ctx.fichaVigente(d).ref, 'refs/remotes/origin/main', 'sin init.defaultBranch, trunk no es candidata');
  g(d, 'config', 'init.defaultBranch', 'trunk');
  const f = ctx.fichaVigente(d);
  assert.equal(f.ref, 'refs/remotes/origin/trunk');
  assert.equal(f.datos.vars.proyecto, 'de-trunk');
});

test('fichaVigente: con origin y sin origin/HEAD, origin/<rama por defecto>; lee la subida, no la local', () => {
  const { d } = conRemoto();
  spawnSync('git', ['symbolic-ref', '--delete', 'refs/remotes/origin/HEAD'], { cwd: d });
  assert.equal(ctx.refVigente(d).origen, 'origin');
  // Un commit local en main que no se subió no cuenta: manda origin.
  commit(d, FICHA, fichaCon('no', 'sin-subir'));
  const f = ctx.fichaVigente(d);
  assert.equal(f.ref, 'refs/remotes/origin/main');
  assert.equal(f.datos.vars.proyecto, 'principal');
});

test('fichaVigente: origin que no tiene ninguna rama por defecto → la rama local', () => {
  const bare = carpeta('remoto');
  g(bare, 'init', '-q', '--bare', '-b', 'main');
  const d = repo('main');
  commit(d, FICHA, fichaCon('molde'));
  g(d, 'remote', 'add', 'origin', bare);
  const f = ctx.fichaVigente(d);
  assert.equal(f.estado, 'ok');
  assert.equal(f.ref, 'refs/heads/main');
});

test('fichaVigente: un origin que no se llama origin no cuenta como remoto', () => {
  const bare = carpeta('remoto');
  g(bare, 'init', '-q', '--bare', '-b', 'main');
  const d = repo('main');
  commit(d, FICHA, fichaCon('molde'));
  g(d, 'remote', 'add', 'otro', bare);
  g(d, 'push', '-q', 'otro', 'main');
  assert.equal(ctx.fichaVigente(d).ref, 'refs/heads/main');
});

test('fichaVigente: sin ficha commiteada → sin-ficha, aunque esté en el disco', () => {
  const d = repo('main');
  commit(d, 'a.txt', '1');
  assert.equal(ctx.fichaVigente(d).estado, 'sin-ficha');
  escribir(d, FICHA, fichaCon('molde'));
  assert.equal(ctx.fichaVigente(d).estado, 'sin-ficha');
  g(d, 'add', '--', FICHA);
  assert.equal(ctx.fichaVigente(d).estado, 'sin-ficha', 'en el índice tampoco cuenta');
  g(d, 'commit', '-q', '-m', 'ficha');
  assert.equal(ctx.fichaVigente(d).estado, 'ok');
});

test('fichaVigente: repo sin commits → sin-ficha', () => {
  const d = repo('main');
  escribir(d, FICHA, fichaCon('molde'));
  const f = ctx.fichaVigente(d);
  assert.equal(f.estado, 'sin-ficha');
});

test('fichaVigente: ficha rota → rota con archivo:línea, sin repetir valores', () => {
  const d = repo('main');
  commit(d, FICHA, FICHA_ROTA);
  const f = ctx.fichaVigente(d);
  assert.equal(f.estado, 'rota');
  assert.equal(f.archivo, '.claude/kit.md');
  assert.equal(f.linea, 7);
  assert.equal(f.donde, '.claude/kit.md:7');
  assert.match(f.mensaje, /tabulador en la sangría/);
  assert.equal(f.ref, 'refs/heads/main');
});

test('fichaVigente: ficha en UTF-16 → rota en la línea 1', () => {
  const d = repo('main');
  const p = path.join(d, '.claude');
  fs.mkdirSync(p);
  fs.writeFileSync(path.join(p, 'kit.md'), Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(fichaCon('molde'), 'utf16le')]));
  g(d, 'add', '--', FICHA);
  g(d, 'commit', '-q', '-m', 'utf16');
  const f = ctx.fichaVigente(d);
  assert.equal(f.estado, 'rota');
  assert.equal(f.linea, 1);
  assert.match(f.mensaje, /UTF-16/);
});

test('fichaVigente desde un worktree de obrero: la de la rama por defecto, no la del worktree', () => {
  const d = repo('main');
  commit(d, FICHA, fichaCon('molde'));
  const w = path.join(d, '.claude', 'worktrees', 'x--01');
  g(d, 'worktree', 'add', '-q', '-b', 'modulo/x--01', w);
  commit(w, FICHA, fichaCon('no'));
  assert.equal(ctx.fichaVigente(w).datos.piezas['hook-escritura'], 'molde');
});

test('fichaVigente fuera de git → sin-ficha', () => {
  assert.equal(ctx.fichaVigente(carpeta('suelta')).estado, 'sin-ficha');
});

// ---------------------------------------------------------------- todo junto

test('armar: desde la entrada del hook, en un worktree de obrero', () => {
  const d = repo('main');
  commit(d, FICHA, fichaCon('molde'));
  const w = path.join(d, '.claude', 'worktrees', 'x--01');
  g(d, 'worktree', 'add', '-q', '-b', 'modulo/x--01', w);
  fs.writeFileSync(path.join(w, '.kit-rol'), 'obrero\n');
  const c = ctx.armar(JSON.stringify({ cwd: w, session_id: 's1' }));
  mismo(c.raiz, w);
  assert.equal(c.rama, 'modulo/x--01');
  assert.equal(c.ramaPorDefecto, 'main');
  assert.deepEqual(c.pestana, { tipo: 'obrero', modulo: 'x', id: '01', rama: 'modulo/x--01' });
  assert.equal(c.rol, 'obrero');
  assert.equal(c.principal, false);
  assert.equal(c.carpetaRelativa, '.claude/worktrees/x--01');
  assert.ok(c.gitDir.toLowerCase().includes(`${path.sep}worktrees${path.sep}`.toLowerCase()));

  const p = ctx.armar({ cwd: d });
  assert.equal(p.rol, 'humano');
  assert.equal(p.principal, true);
  assert.equal(p.carpetaRelativa, '.');
  assert.equal(p.pestana.tipo, 'plana');
});

test('armar: fuera de git no explota', () => {
  const c = ctx.armar({ cwd: carpeta('suelta') });
  assert.equal(c.raiz, null);
  assert.equal(c.rol, 'desconocido');
  assert.equal(c.principal, false);
  assert.equal(c.pestana.tipo, 'plana');
});
