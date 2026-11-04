'use strict';
// repos.test.cjs — el recorrido de la carpeta de proyectos (SPEC-paquete-8r2 t7, crit. 7; rt-5, rt-6, rt-10). Los cuatro que lo usan
// (arquitecto.cjs registro, preparar-pc.cjs, lib/flota.cjs, cambios-flota.cjs) prueban el caso de Hermes cada uno en lo suyo; acá,
// la regla misma: dos niveles, worktrees afuera, la carpeta ilegible, la papelera, dos clones del mismo origin.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const R = require('./repos.cjs');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-repos-'));
const ENV = { ...process.env, GIT_CONFIG_NOSYSTEM: '1', HOME: TMP, USERPROFILE: TMP };
test.after(() => fs.rmSync(TMP, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }));
let n = 0;
const nueva = (pref) => {
  const d = path.join(TMP, `${pref}${++n}`);
  fs.mkdirSync(d, { recursive: true });
  return d;
};
function git(cwd, ...args) {
  const r = spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'init.defaultBranch=main', ...args], { cwd, encoding: 'utf8', env: ENV });
  assert.equal(r.status, 0, `git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}
// Un repo con un commit (fecha fija, para ordenar HEAD) y, si se pide, un origin.
function repo(d, { origen, fecha = '2026-01-01T00:00:00Z' } = {}) {
  fs.mkdirSync(d, { recursive: true });
  git(d, 'init', '-q');
  fs.writeFileSync(path.join(d, 'a.txt'), 'a\n');
  git(d, 'add', '-A');
  spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '-m', 'nace'], { cwd: d, env: { ...ENV, GIT_COMMITTER_DATE: fecha, GIT_AUTHOR_DATE: fecha } });
  if (origen) git(d, 'remote', 'add', 'origin', origen);
  return d;
}
// La carpeta del crit. 7: Hermes/Hermes.exe (con origin bare), Hermes-x (un worktree suyo) y Otro (un nivel).
function carpetaHermes() {
  const P = nueva('proy');
  const bare = path.join(nueva('remotos'), 'Hermes.exe.git');
  const h = repo(path.join(P, 'Hermes', 'Hermes.exe'));
  git(TMP, 'clone', '-q', '--bare', h, bare);
  git(h, 'remote', 'add', 'origin', bare);
  git(h, 'worktree', 'add', '-q', '-b', 'x', path.join(P, 'Hermes-x'));
  repo(path.join(P, 'Otro'));
  return { P, h };
}

test('crit. 7: dos niveles; una fila para Hermes/Hermes.exe y una para Otro, ninguna para el worktree Hermes-x; rutas absolutas', () => {
  const { P, h } = carpetaHermes();
  const r = R.recorrer(P);
  assert.deepEqual(r.repos, [
    { dir: h, rel: 'Hermes/Hermes.exe', nombre: 'Hermes.exe' },
    { dir: path.join(P, 'Otro'), rel: 'Otro', nombre: 'Otro' },
  ]);
  assert.ok(r.repos.every((x) => path.isAbsolute(x.dir)));
  assert.deepEqual(r.avisos, []);
});

test('no se baja dentro de un repo; más de dos niveles no se mira', () => {
  const P = nueva('proy');
  const a = repo(path.join(P, 'a'));
  repo(path.join(a, 'adentro')); // un repo dentro de otro: no es de la flota
  repo(path.join(P, 'x', 'y', 'hondo')); // tres niveles
  assert.deepEqual(R.recorrer(P).repos.map((x) => x.rel), ['a']);
});

test('rt-6: un grupo con solo worktrees da una línea (el principal está fuera de --proyectos)', () => {
  const afuera = repo(path.join(nueva('afuera'), 'Principal'));
  const P = nueva('proy');
  git(afuera, 'worktree', 'add', '-q', '-b', 'w', path.join(P, 'Principal-w'));
  const r = R.recorrer(P);
  assert.deepEqual(r.repos, []);
  assert.equal(r.avisos.length, 1);
  assert.match(r.avisos[0], /^solo worktrees de .*\.git \(Principal-w\): el principal está fuera de --proyectos$/);
  assert.equal(r.avisos[0].includes(R.comparable(path.join(afuera, '.git'))), true);
});

test('rt-6: una carpeta del segundo nivel que no se lee se saltea; ni $… ni System Volume Information', () => {
  const P = nueva('proy');
  repo(path.join(P, 'Otro'));
  repo(path.join(P, 'cerrada', 'adentro'));
  repo(path.join(P, '$RECYCLE.BIN', 'tirado'));
  repo(path.join(P, 'System Volume Information', 'sys'));
  repo(path.join(P, 'Bien', 'app'));
  const leer = (d, o) => {
    if (path.basename(d) === 'cerrada') throw Object.assign(new Error('EPERM'), { code: 'EPERM' });
    if (path.basename(d).startsWith('$') || path.basename(d) === 'System Volume Information') throw new Error(`bajó a ${d}`);
    return fs.readdirSync(d, o);
  };
  const r = R.recorrer(P, { leer });
  assert.deepEqual(r.repos.map((x) => x.rel), ['Bien/app', 'Otro']);
  // la carpeta de proyectos misma que no se lee: el error sube (cada script lo dice a su manera)
  assert.throws(() => R.recorrer(path.join(P, 'no-esta')), /ENOENT/);
});

test('rt-10: dos clones del mismo origin (normalizado) → el de HEAD más nuevo, y una línea que nombra los dos', () => {
  const P = nueva('proy');
  repo(path.join(P, 'viejo'), { origen: 'https://GitHub.com/guido/app.git', fecha: '2026-01-01T00:00:00Z' });
  repo(path.join(P, 'grupo', 'nuevo'), { origen: 'https://github.com/guido/app/', fecha: '2026-06-01T00:00:00Z' });
  repo(path.join(P, 'distinto'), { origen: 'https://github.com/guido/otra.git' });
  const r = R.recorrer(P);
  assert.deepEqual(r.repos.map((x) => x.rel), ['distinto', 'grupo/nuevo']);
  assert.equal(r.avisos.length, 1);
  assert.match(r.avisos[0], /^dos checkouts del mismo origin \S+: grupo\/nuevo y viejo; queda grupo\/nuevo \(el de HEAD más nuevo\)$/);
});

test('dos repos con el mismo nombre de carpeta: el nombre es la ruta relativa', () => {
  const P = nueva('proy');
  repo(path.join(P, 'a', 'app'));
  repo(path.join(P, 'b', 'app'));
  repo(path.join(P, 'solo'));
  assert.deepEqual(R.recorrer(P).repos.map((x) => x.nombre), ['a/app', 'b/app', 'solo']);
});

test('normalizarOrigen es la de lib/adoptar.cjs (copiada: adoptar no se toca)', () => {
  const adoptar = path.resolve(__dirname, '..', '..', '..', 'arquitecto-skills', 'scripts', 'lib', 'adoptar.cjs');
  const cuerpo = (t) => /function normalizarOrigen\(u\) \{[\s\S]*?\n\}/.exec(t)[0];
  assert.equal(cuerpo(fs.readFileSync(path.join(__dirname, 'repos.cjs'), 'utf8')), cuerpo(fs.readFileSync(adoptar, 'utf8')));
});
