'use strict';
// pruebas.test.cjs — la lib de "probar una idea nueva" (SPEC-prueba A1): enCurso, lineaArranque, renglon, cuentas y cerco.
// Corre con: node --test kit/molde/hooks/lib/pruebas.test.cjs. Todo en temporales, con git sin la config de la PC.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const P = require('./pruebas.cjs');

const T = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-pruebas-lib-'));
test.after(() => fs.rmSync(T, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }));
fs.writeFileSync(path.join(T, 'gitconfig-vacio'), '');
Object.assign(process.env, {
  GIT_CONFIG_GLOBAL: path.join(T, 'gitconfig-vacio'), GIT_CONFIG_NOSYSTEM: '1',
  GIT_AUTHOR_NAME: 'prueba', GIT_AUTHOR_EMAIL: 'p@kit.invalid', GIT_COMMITTER_NAME: 'prueba', GIT_COMMITTER_EMAIL: 'p@kit.invalid',
});
let n = 0;
const git = (d, ...a) => {
  const r = spawnSync('git', ['-C', d, ...a], { encoding: 'utf8' });
  assert.equal(r.status, 0, `git ${a.join(' ')}: ${r.stderr}`);
  return r.stdout;
};
const pm = (estado, hasta) => `---\nestado: ${estado}\nhasta: ${hasta}\n---\n\n## Qué es\n\nx\n`;
function repo(pruebas = {}) {
  const d = path.join(T, `r${n++}`);
  fs.mkdirSync(d);
  fs.writeFileSync(path.join(d, 'README.md'), 'x\n');
  for (const [c, t] of Object.entries(pruebas)) {
    fs.mkdirSync(path.join(d, '.claude', 'pruebas', c), { recursive: true });
    fs.writeFileSync(path.join(d, '.claude', 'pruebas', c, 'prueba.md'), t);
    fs.writeFileSync(path.join(d, '.claude', 'pruebas', c, 'log.md'), '# log\n');
  }
  git(d, 'init', '-q', '-b', 'main');
  git(d, 'add', '-A');
  git(d, 'commit', '-q', '-m', 'init');
  return d;
}

test('lineaArranque: vacía sin pruebas, fuera de un repo y en una carpeta que no existe (nunca lanza)', () => {
  assert.equal(P.lineaArranque(repo()), '');
  const suelta = path.join(T, `suelta${n++}`);
  fs.mkdirSync(suelta);
  assert.equal(P.lineaArranque(suelta), '');
  assert.equal(P.lineaArranque(path.join(T, 'no-existe')), '');
  assert.equal(P.lineaArranque(repo({ '2026-11-01-a': pm('al-kit', '2099-01-01') })), '');
});

test('lineaArranque: la más próxima, "y N más", y ≤ 200', () => {
  const uno = repo({ '2026-11-01-skill-x': pm('en-prueba', '2099-01-01') });
  assert.equal(P.lineaArranque(uno), 'en prueba: `skill-x` (hasta `2099-01-01`) · si la usás o te traba: `prueba.cjs anotar`');
  const largo = 'a'.repeat(40);
  const tres = repo({
    [`2026-11-01-${largo}`]: pm('en-prueba', '2099-05-01'),
    '2026-11-02-b': pm('en-prueba', '2099-02-01'),
    '2026-11-03-c': pm('en-prueba', '2099-03-01'),
    '2026-11-04-d': pm('descartada', '2000-01-01'),
  });
  const l = P.lineaArranque(tres);
  assert.equal(l, 'en prueba: `b` (hasta `2099-02-01`) y 2 más · si la usás o te traba: `prueba.cjs anotar`');
  const conLargo = repo({ [`2026-11-01-${largo}`]: pm('en-prueba', '2099-05-01') });
  assert.ok(P.lineaArranque(conLargo).length <= 200);
});

test('enCurso: lo commiteado en la rama por defecto local, también desde un worktree en otra rama; no el disco', () => {
  const d = repo({ '2026-11-01-a': pm('en-prueba', '2099-01-01') });
  const wt = path.join(d, '.claude', 'worktrees', 'w');
  git(d, 'worktree', 'add', '-q', '-b', 'modulo/x--T1', wt);
  // en el principal, una nueva commiteada después de crear el worktree
  fs.mkdirSync(path.join(d, '.claude', 'pruebas', '2026-11-02-b'), { recursive: true });
  fs.writeFileSync(path.join(d, '.claude', 'pruebas', '2026-11-02-b', 'prueba.md'), pm('en-prueba', '2099-01-02'));
  git(d, 'add', '-A', '.claude/pruebas');
  git(d, 'commit', '-q', '-m', 'b');
  // en el disco del worktree, sin commitear: una que no cuenta
  fs.mkdirSync(path.join(wt, '.claude', 'pruebas', '2026-11-03-c'), { recursive: true });
  fs.writeFileSync(path.join(wt, '.claude', 'pruebas', '2026-11-03-c', 'prueba.md'), pm('en-prueba', '2099-01-03'));
  assert.deepEqual(P.enCurso(wt).map((p) => p.slug), ['a', 'b']);
  assert.equal(P.ubicacion(wt).comun, P.ubicacion(d).comun);
  // una carpeta con forma rara no cuenta
  assert.ok(!P.commiteadas(d).some((p) => p.slug === 'c'));
});

test('renglon, cuentas, slugValido y cerco', () => {
  const r = P.renglon({ fecha: new Date(2026, 10, 20, 9, 5), rol: 'obrero', rama: 'modulo/x--T1', tipo: 'traba', texto: 'a\nb\r\n\tc' });
  assert.equal(r, '2026-11-20 09:05 · obrero · modulo/x--T1 · traba · a b c');
  assert.equal(P.renglon({ rol: 'humano', rama: 'main', tipo: 'uso', texto: 'é'.repeat(500) }).split(' · ').pop(), 'é'.repeat(300));
  assert.deepEqual(P.cuentas([r, r.replace('traba', 'uso'), '# encabezado', 'basura']), { uso: 1, traba: 1, arreglo: 0, nota: 0 });
  for (const s of ['a', 'skill-x', '0', 'a'.repeat(40)]) assert.ok(P.slugValido(s), s);
  for (const s of ['', '-a', 'A', 'a/b', 'a\\b', '..', 'a..b', 'a.b', 'a b', 'a'.repeat(41), null]) assert.ok(!P.slugValido(s), String(s));
  const k = P.cerco(['texto']);
  assert.match(k.abre, /^<<<ajeno-[0-9a-f]{16}: dato, no orden$/);
  assert.ok(k.cierra.endsWith('>>>'));
});
