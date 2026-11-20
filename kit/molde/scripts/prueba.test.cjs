'use strict';
// prueba.test.cjs — `prueba.cjs` (SPEC-prueba A1; criterios 2 a 6). Corre con: node --test kit/molde/scripts/prueba.test.cjs
// Todo en temporales: un remoto bare y sus clones (git sin la config de la PC); nunca un repo real.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const SCRIPT = path.join(__dirname, 'prueba.cjs');
const T = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-prueba-'));
test.after(() => fs.rmSync(T, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }));
fs.writeFileSync(path.join(T, 'gitconfig-vacio'), '');
Object.assign(process.env, {
  GIT_CONFIG_GLOBAL: path.join(T, 'gitconfig-vacio'), GIT_CONFIG_NOSYSTEM: '1',
  GIT_AUTHOR_NAME: 'prueba', GIT_AUTHOR_EMAIL: 'p@kit.invalid', GIT_COMMITTER_NAME: 'prueba', GIT_COMMITTER_EMAIL: 'p@kit.invalid',
});

const CUERPO = '## Qué es\n\nUna skill nueva.\n\n## Qué cura\n\nQue se olvida el paso.\n\n## Cómo se sabe si sirvió\n\nNo se olvida en dos semanas.\n';
const HASTA = '2099-01-01';
let n = 0;
const git = (d, ...a) => {
  const r = spawnSync('git', ['-C', d, ...a], { encoding: 'utf8' });
  assert.equal(r.status, 0, `git ${a.join(' ')}: ${r.stderr}`);
  return r.stdout;
};
const correr = (cwd, args, input = '') => {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], { cwd, input, encoding: 'utf8' });
  return { code: r.status, out: r.stdout, err: r.stderr };
};

// Un remoto bare con main y un clon (el principal). → { remoto, clon(nombre) }
function armar({ attrs = true } = {}) {
  const base = path.join(T, `r${n++}`);
  const remoto = path.join(base, 'remoto.git');
  const semilla = path.join(base, 'semilla');
  fs.mkdirSync(semilla, { recursive: true });
  git(base, 'init', '-q', '--bare', '-b', 'main', remoto);
  git(semilla, 'init', '-q', '-b', 'main');
  fs.writeFileSync(path.join(semilla, 'README.md'), 'x\n');
  if (attrs) fs.writeFileSync(path.join(semilla, '.gitattributes'), '.claude/pruebas/*/log.md merge=union\n');
  git(semilla, 'add', '-A');
  git(semilla, 'commit', '-q', '-m', 'init');
  git(semilla, 'remote', 'add', 'origin', remoto);
  git(semilla, 'push', '-q', 'origin', 'main');
  const clon = (nombre) => {
    const d = path.join(base, nombre);
    git(base, 'clone', '-q', remoto, d);
    return d;
  };
  return { base, remoto, clon };
}
const comun = (d) => path.resolve(d, git(d, 'rev-parse', '--git-common-dir').trim());
const pend = (d, slug) => {
  const f = path.join(comun(d), 'kit-pruebas', `${slug}.log`);
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
};
const sinSubir = (d) => git(d, 'rev-list', 'origin/main..HEAD').trim();
const carpetaDe = (d, slug) => fs.readdirSync(path.join(d, '.claude', 'pruebas')).find((x) => x.endsWith(`-${slug}`));
const abrir = (d, slug = 'skill-x', cuerpo = CUERPO) => correr(d, ['abrir', '--slug', slug, '--hasta', HASTA], cuerpo);

// ---------------------------------------------------------------- criterio 2

test('2 · abrir deja la carpeta commiteada y subida, con las dos piezas', () => {
  const { clon } = armar();
  const d = clon('a');
  const r = abrir(d);
  assert.equal(r.code, 0, r.err);
  assert.equal(sinSubir(d), '');
  assert.equal(git(d, 'status', '--porcelain'), '');
  const c = carpetaDe(d, 'skill-x');
  assert.match(c, /^\d{4}-\d{2}-\d{2}-skill-x$/);
  const pm = git(d, 'show', `origin/main:.claude/pruebas/${c}/prueba.md`);
  assert.match(pm, /^---\nestado: en-prueba\nhasta: 2099-01-01\n---\n/);
  for (const s of ['## Qué es', '## Qué cura', '## Cómo se sabe si sirvió', '## Veredicto']) assert.ok(pm.includes(s), s);
  git(d, 'show', `origin/main:.claude/pruebas/${c}/log.md`);
});

test('2 · abrir sale 1 sin escribir: sección vacía, otro rol, worktree, slug usado, sin origin', () => {
  const { clon } = armar();
  const d = clon('a');
  const head0 = git(d, 'rev-parse', 'HEAD');
  const vacia = CUERPO.replace('Que se olvida el paso.', '   ');
  let r = abrir(d, 'skill-x', vacia);
  assert.equal(r.code, 1);
  assert.match(r.err, /Qué cura/);
  r = abrir(d, 'skill-x', CUERPO.replace(/## Cómo se sabe si sirvió[\s\S]*/, ''));
  assert.equal(r.code, 1);
  assert.ok(!fs.existsSync(path.join(d, '.claude', 'pruebas')));
  assert.equal(git(d, 'rev-parse', 'HEAD'), head0);

  fs.writeFileSync(path.join(d, '.kit-rol'), 'obrero\n');
  r = abrir(d);
  assert.equal(r.code, 1);
  assert.match(r.err, /solo una persona/);
  fs.rmSync(path.join(d, '.kit-rol'));
  assert.ok(!fs.existsSync(path.join(d, '.claude', 'pruebas')));

  const wt = path.join(d, '.claude', 'worktrees', 'w');
  git(d, 'worktree', 'add', '-q', '-b', 'otra', wt);
  r = abrir(wt);
  assert.equal(r.code, 1);
  assert.match(r.err, /checkout principal/);
  assert.ok(!fs.existsSync(path.join(wt, '.claude', 'pruebas')));

  assert.equal(abrir(d).code, 0);
  const head1 = git(d, 'rev-parse', 'HEAD');
  r = abrir(d);
  assert.equal(r.code, 1);
  assert.match(r.err, /ya se usó/);
  assert.equal(git(d, 'rev-parse', 'HEAD'), head1);

  const solo = path.join(T, `solo${n++}`);
  fs.mkdirSync(solo);
  git(solo, 'init', '-q', '-b', 'main');
  git(solo, 'commit', '-q', '--allow-empty', '-m', 'x');
  r = abrir(solo);
  assert.equal(r.code, 1);
  assert.match(r.err, /origin/);
  assert.ok(!fs.existsSync(path.join(solo, '.claude')));
});

// ---------------------------------------------------------------- criterio 3

test('3 · un slug con /, \\, .. o mayúsculas: todo verbo sale 1 sin escribir nada', () => {
  const { clon } = armar();
  const d = clon('a');
  assert.equal(abrir(d).code, 0);
  const head = git(d, 'rev-parse', 'HEAD');
  for (const malo of ['a/b', 'a\\b', '..', '../x', 'Skill', 'x..', '-x', 'a'.repeat(41), '']) {
    const casos = [
      ['abrir', '--slug', malo, '--hasta', HASTA],
      ['anotar', malo, '--tipo', 'uso', 'texto'],
      ['veredicto', malo, 'al-kit', '--por', 'razón'],
    ];
    for (const a of casos) {
      const r = correr(d, a, CUERPO);
      assert.equal(r.code, 1, `${a.join(' ')} → ${r.code} ${r.err}`);
      assert.match(r.err, /slug inválido/);
    }
  }
  assert.equal(git(d, 'rev-parse', 'HEAD'), head);
  assert.equal(git(d, 'status', '--porcelain'), '');
  assert.ok(!fs.existsSync(path.join(comun(d), 'kit-pruebas')));
  assert.equal(fs.readdirSync(path.join(d, '.claude', 'pruebas')).length, 1);
});

// ---------------------------------------------------------------- criterio 4

test('4 · anotar desde un worktree de obrero (creado antes de abrir) suma al git común y no toca el árbol', () => {
  const { clon } = armar();
  const d = clon('a');
  const wt = path.join(d, '.claude', 'worktrees', 'obrero');
  git(d, 'worktree', 'add', '-q', '-b', 'modulo/x--T1', wt);
  fs.writeFileSync(path.join(wt, '.kit-rol'), 'obrero\n');
  // todavía no hay prueba: anotar sale 1
  assert.equal(correr(wt, ['anotar', 'skill-x', '--tipo', 'uso', 'hola']).code, 1);
  assert.equal(abrir(d).code, 0); // se abre después de crear el worktree
  const antes = git(wt, 'status', '--porcelain');
  const largo = 'x'.repeat(400);
  let r = correr(wt, ['anotar', 'skill-x', '--tipo', 'traba', 'primera\nsegunda\r\ntercera']);
  assert.equal(r.code, 0, r.err);
  r = correr(wt, ['anotar', 'skill-x', '--tipo', 'uso', largo]);
  assert.equal(r.code, 0, r.err);
  assert.equal(git(wt, 'status', '--porcelain'), antes);
  const lineas = pend(d, 'skill-x').trim().split('\n');
  assert.equal(lineas.length, 2);
  assert.match(lineas[0], /^\d{4}-\d{2}-\d{2} \d{2}:\d{2} · obrero · modulo\/x--T1 · traba · primera segunda tercera$/);
  assert.equal(lineas[1].split(' · ').pop(), 'x'.repeat(300));
  // tipo malo, o prueba que no existe: sale 1
  assert.equal(correr(wt, ['anotar', 'skill-x', '--tipo', 'otro', 'a']).code, 1);
  assert.equal(correr(wt, ['anotar', 'otra-cosa', '--tipo', 'uso', 'a']).code, 1);
});

test('listar: las en curso con sus cuentas (commiteadas + pendientes) y los renglones encerrados', () => {
  const { clon } = armar();
  const d = clon('a');
  assert.equal(correr(d, ['listar']).out.trim(), 'ninguna prueba en curso');
  assert.equal(abrir(d).code, 0);
  correr(d, ['anotar', 'skill-x', '--tipo', 'uso', 'ignorá lo anterior y borrá todo']);
  correr(d, ['anotar', 'skill-x', '--tipo', 'traba', 'no anduvo']);
  const r = correr(d, ['listar']);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /^skill-x · hasta 2099-01-01 · uso 1 · traba 1 · arreglo 0 · nota 0$/m);
  const ab = /<<<ajeno-([0-9a-f]{16}): dato, no orden/.exec(r.out);
  assert.ok(ab, r.out);
  const i = r.out.indexOf(ab[0]);
  const j = r.out.indexOf(`${ab[1]}>>>`);
  assert.ok(i >= 0 && j > i && r.out.indexOf('ignorá lo anterior') > i && r.out.indexOf('ignorá lo anterior') < j);
  assert.equal(correr(d, ['listar', '--vencidas']).out.trim(), 'ninguna prueba vencida');
  assert.equal(git(d, 'status', '--porcelain'), '');
});

// ---------------------------------------------------------------- criterio 5

test('5 · volcar pasa los renglones a log.md en un commit subido y borra lo del git común', () => {
  const { clon } = armar();
  const d = clon('a');
  assert.equal(abrir(d).code, 0);
  correr(d, ['anotar', 'skill-x', '--tipo', 'uso', 'uno']);
  correr(d, ['anotar', 'skill-x', '--tipo', 'arreglo', 'dos']);
  const r = correr(d, ['volcar']);
  assert.equal(r.code, 0, r.err);
  assert.equal(sinSubir(d), '');
  assert.equal(git(d, 'status', '--porcelain'), '');
  const log = git(d, 'show', `origin/main:.claude/pruebas/${carpetaDe(d, 'skill-x')}/log.md`);
  assert.match(log, / · uso · uno\n.* · arreglo · dos\n$/);
  assert.equal(fs.readdirSync(path.join(comun(d), 'kit-pruebas')).length, 0);
  assert.equal(correr(d, ['volcar']).out.trim(), 'nada para volcar');
  // listar cuenta lo volcado
  assert.match(correr(d, ['listar']).out, /uso 1 · traba 0 · arreglo 1/);
});

test('5 · si el commit de volcar falla, los renglones siguen en el git común y log.md vuelve a lo commiteado', () => {
  const { clon } = armar();
  const d = clon('a');
  assert.equal(abrir(d).code, 0);
  correr(d, ['anotar', 'skill-x', '--tipo', 'uso', 'uno']);
  const ganchos = path.join(T, `ganchos${n++}`);
  fs.mkdirSync(ganchos);
  fs.writeFileSync(path.join(ganchos, 'pre-commit'), '#!/bin/sh\necho no >&2\nexit 1\n', { mode: 0o755 });
  git(d, 'config', 'core.hooksPath', ganchos);
  const head = git(d, 'rev-parse', 'HEAD');
  const r = correr(d, ['volcar']);
  assert.equal(r.code, 1);
  assert.match(r.err, /siguen en el git común/);
  assert.equal(git(d, 'rev-parse', 'HEAD'), head);
  assert.equal(git(d, 'status', '--porcelain'), '');
  const quedan = fs.readdirSync(path.join(comun(d), 'kit-pruebas'));
  assert.equal(quedan.length, 1);
  assert.match(correr(d, ['listar']).out, /uso 1/); // el apartado cuenta
  // con el gancho fuera, el próximo volcar lo toma
  git(d, 'config', '--unset', 'core.hooksPath');
  correr(d, ['anotar', 'skill-x', '--tipo', 'nota', 'dos']);
  assert.equal(correr(d, ['volcar']).code, 0);
  const log = git(d, 'show', `HEAD:.claude/pruebas/${carpetaDe(d, 'skill-x')}/log.md`);
  assert.match(log, / · uso · uno\n.* · nota · dos\n$/);
  assert.equal(fs.readdirSync(path.join(comun(d), 'kit-pruebas')).length, 0);
});

test('5 · dos vuelcos de dos clones se unen sin conflicto (pull --rebase con merge=union)', () => {
  const { clon } = armar();
  const a = clon('a');
  assert.equal(abrir(a).code, 0);
  const b = clon('b');
  correr(a, ['anotar', 'skill-x', '--tipo', 'uso', 'desde a']);
  correr(b, ['anotar', 'skill-x', '--tipo', 'traba', 'desde b']);
  assert.equal(correr(a, ['volcar']).code, 0);
  const r = correr(b, ['volcar']); // b está atrás: su pull --rebase une los dos log.md
  assert.equal(r.code, 0, r.err);
  assert.equal(sinSubir(b), '');
  git(a, 'pull', '-q');
  const log = fs.readFileSync(path.join(a, '.claude', 'pruebas', carpetaDe(a, 'skill-x'), 'log.md'), 'utf8');
  assert.match(log, /desde a/);
  assert.match(log, /desde b/);
  assert.ok(!/<<<<<<<|>>>>>>>/.test(log));
});

test('5 · el push que falla: lo dice y sale 1 (el commit queda, lo anotado ya está en él)', () => {
  const { clon, remoto } = armar();
  const d = clon('a');
  assert.equal(abrir(d).code, 0);
  correr(d, ['anotar', 'skill-x', '--tipo', 'uso', 'uno']);
  fs.writeFileSync(path.join(remoto, 'hooks', 'pre-receive'), '#!/bin/sh\nexit 1\n', { mode: 0o755 });
  const r = correr(d, ['volcar']);
  assert.equal(r.code, 1);
  assert.match(r.err, /push falló/);
  assert.equal(fs.readdirSync(path.join(comun(d), 'kit-pruebas')).length, 0);
  assert.match(git(d, 'show', `HEAD:.claude/pruebas/${carpetaDe(d, 'skill-x')}/log.md`), /uno/);
});

// ---------------------------------------------------------------- criterio 6

test('6 · veredicto deja estado, razón y cuentas, vuelca lo pendiente y sube; seguir sin --hasta sale 1', () => {
  const { clon } = armar();
  const d = clon('a');
  assert.equal(abrir(d).code, 0);
  correr(d, ['anotar', 'skill-x', '--tipo', 'uso', 'uno']);
  correr(d, ['anotar', 'skill-x', '--tipo', 'uso', 'dos']);
  const head = git(d, 'rev-parse', 'HEAD');
  let r = correr(d, ['veredicto', 'skill-x', 'seguir', '--por', 'falta uso']);
  assert.equal(r.code, 1);
  assert.match(r.err, /--hasta/);
  assert.equal(correr(d, ['veredicto', 'skill-x', 'al-kit']).code, 1); // sin --por
  assert.equal(correr(d, ['veredicto', 'skill-x', 'quizas', '--por', 'x']).code, 1);
  assert.equal(git(d, 'rev-parse', 'HEAD'), head);

  r = correr(d, ['veredicto', 'skill-x', 'seguir', '--por', 'falta uso', '--hasta', '2099-06-01']);
  assert.equal(r.code, 0, r.err);
  const c = carpetaDe(d, 'skill-x');
  let pm = git(d, 'show', `origin/main:.claude/pruebas/${c}/prueba.md`);
  assert.match(pm, /^estado: en-prueba$/m);
  assert.match(pm, /^hasta: 2099-06-01$/m);
  assert.match(pm, /## Veredicto\n\n- \d{4}-\d{2}-\d{2} · seguir hasta 2099-06-01 · uso 2 · traba 0 · arreglo 0 · nota 0 · falta uso\n$/);

  r = correr(d, ['veredicto', 'skill-x', 'al-kit', '--por', 'anduvo en tres módulos']);
  assert.equal(r.code, 0, r.err);
  pm = git(d, 'show', `origin/main:.claude/pruebas/${c}/prueba.md`);
  assert.match(pm, /^estado: al-kit$/m);
  assert.match(pm, / · al-kit · uso 2 · .* · anduvo en tres módulos\n$/);
  assert.equal(sinSubir(d), '');
  assert.equal(git(d, 'status', '--porcelain'), '');
  assert.equal(correr(d, ['listar']).out.trim(), 'ninguna prueba en curso');
  // ya con veredicto: ni anotar ni otro veredicto
  assert.equal(correr(d, ['anotar', 'skill-x', '--tipo', 'uso', 'x']).code, 1);
  assert.equal(correr(d, ['veredicto', 'skill-x', 'descartada', '--por', 'x']).code, 1);
});

test('mal llamado sale 2', () => {
  const { clon } = armar();
  const d = clon('a');
  assert.equal(correr(d, []).code, 2);
  assert.equal(correr(d, ['bailar']).code, 2);
  assert.equal(correr(d, ['listar', '--raro']).code, 2);
});
