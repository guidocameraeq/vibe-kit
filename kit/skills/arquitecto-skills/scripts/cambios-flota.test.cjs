'use strict';
// cambios-flota.test.cjs — `cambios-flota.cjs` (SPEC-paquete-7 P6.8b-2; crit. 4 y 5). Corre con:
//   node --test kit/skills/arquitecto-skills/scripts/cambios-flota.test.cjs
// Todo en temporales: cada repo lo arma la prueba (git sin la config de la PC); nunca ~/.claude ni ../vibe-kit-pruebas.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const CF = require('./cambios-flota.cjs');
const SCRIPT = path.join(__dirname, 'cambios-flota.cjs');

const T = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-cambios-flota-'));
test.after(() => fs.rmSync(T, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }));
fs.writeFileSync(path.join(T, 'gitconfig-vacio'), '');
Object.assign(process.env, {
  GIT_CONFIG_GLOBAL: path.join(T, 'gitconfig-vacio'), GIT_CONFIG_NOSYSTEM: '1',
  GIT_AUTHOR_NAME: 'prueba', GIT_AUTHOR_EMAIL: 'p@kit.invalid', GIT_COMMITTER_NAME: 'prueba', GIT_COMMITTER_EMAIL: 'p@kit.invalid',
});

let n = 0;
const carpeta = (nombre) => {
  const d = path.join(T, `${nombre}-${n++}`);
  fs.mkdirSync(d, { recursive: true });
  return d;
};
const git = (d, ...a) => {
  const r = spawnSync('git', ['-C', d, ...a], { encoding: 'utf8' });
  assert.equal(r.status, 0, `git ${a.join(' ')}: ${r.stderr}`);
  return r.stdout;
};

// Un cambio con el formato real (el de `armar` de molde/hooks/lib/cambios.cjs).
function cambio({ estado = 'aplicado', cita, cicatriz = 'no', urgente = 'no', regla = 'Una regla.', origen = 'caso real', extra = [] }) {
  const r = ['---', `estado: ${estado}`, 'clase: 2', 'toca: [metodo]'];
  if (cita) r.push(`cita: "${cita}"`); else r.push(`origen: "${origen}"`);
  r.push(`cicatriz: ${cicatriz}`, 'chico: no', `urgente: ${urgente}`, ...extra, '---', '');
  return `${r.join('\n')}\n## Caso de origen\n\nPasó algo.\n\n## Regla\n\n${regla}\nSegunda línea.\n\n## Dónde vive\n\nen el molde\n\n## Medición\n\nnada\n`;
}

// Un repo en <dir>/<carpeta> con su ficha (alias) y los cambios { 'AAAA-MM-DD-slug': texto } commiteados.
function repo(dir, nombre, alias, cambios, { rama = 'main', sinFicha = false } = {}) {
  const d = path.join(dir, nombre);
  fs.mkdirSync(path.join(d, '.claude', 'cambios'), { recursive: true });
  if (!sinFicha) fs.writeFileSync(path.join(d, '.claude', 'kit.md'), `---\nvars:\n  proyecto: ${alias}\n---\n`);
  for (const [id, txt] of Object.entries(cambios)) fs.writeFileSync(path.join(d, '.claude', 'cambios', `${id}.md`), txt);
  fs.writeFileSync(path.join(d, 'README.md'), 'x\n');
  git(d, 'init', '-q', '-b', rama);
  git(d, 'add', '-A');
  git(d, 'commit', '-q', '-m', 'init');
  return d;
}

function correr(args, env) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8', env: { ...process.env, ...env } });
  return { code: r.status, out: r.stdout, err: r.stderr };
}

const ID = '2026-10-30-guardia-de-saldos';

test('crit. 4: citado por otro proyecto son 2 y "no"; con un tercero, "sí (3+)"', () => {
  const dir = carpeta('flota');
  const alfa = repo(dir, 'alfa', 'alfa', { [ID]: cambio({}) });
  const beta = repo(dir, 'beta', 'beta', { '2026-10-31-copia': cambio({ cita: `alfa ${ID}` }) });
  let r = correr([alfa, beta]);
  assert.equal(r.code, 0);
  assert.match(r.out, new RegExp(`alfa ${ID} \\| alfa, beta \\(2\\) \\| no \\| aplicado \\| no`));
  assert.equal(r.out.split('\n').filter((l) => l.startsWith(`alfa ${ID}`)).length, 1, 'una sola fila por regla');
  const gama = repo(dir, 'gama', 'gama', { '2026-11-01-copia': cambio({ cita: `alfa ${ID}` }) });
  r = correr([alfa, beta, gama]);
  assert.match(r.out, new RegExp(`alfa ${ID} \\| alfa, beta, gama \\(3\\) \\| no \\| aplicado \\| sí \\(3\\+\\)`));
  assert.match(r.out, new RegExp(`  - \\{cita: "alfa ${ID}", version: N\\.N\\.N\\}`));
});

test('un proyecto cuenta una vez, aunque tenga dos cambios de la misma regla', () => {
  const dir = carpeta('flota');
  const alfa = repo(dir, 'alfa', 'alfa', { [ID]: cambio({}) });
  const beta = repo(dir, 'beta', 'beta', { '2026-10-31-a': cambio({ cita: `alfa ${ID}` }), '2026-10-31-b': cambio({ cita: `alfa ${ID}` }) });
  assert.match(correr([alfa, beta]).out, /alfa, beta \(2\)/);
});

test('crit. 4: uno solo con cicatriz produccion es "sí (cicatriz)"; la peor gana', () => {
  const dir = carpeta('flota');
  const alfa = repo(dir, 'alfa', 'alfa', { [ID]: cambio({ cicatriz: 'produccion' }) });
  const beta = repo(dir, 'beta', 'beta', { '2026-10-31-copia': cambio({ cita: `alfa ${ID}`, cicatriz: 'seguridad' }) });
  assert.match(correr([alfa]).out, /\| alfa \(1\) \| produccion \| aplicado \| sí \(cicatriz\)/);
  assert.match(correr([alfa, beta]).out, /\| seguridad \| aplicado \| sí \(cicatriz\)/);
});

test('crit. 4: un rechazado no cuenta', () => {
  const dir = carpeta('flota');
  const alfa = repo(dir, 'alfa', 'alfa', { [ID]: cambio({}) });
  const beta = repo(dir, 'beta', 'beta', { '2026-10-31-copia': cambio({ cita: `alfa ${ID}`, estado: 'rechazado' }) });
  const solo = repo(dir, 'solo', 'solo', { '2026-10-31-x': cambio({ estado: 'rechazado', cicatriz: 'plata' }) });
  const r = correr([alfa, beta, solo]);
  assert.match(r.out, /\| alfa \(1\) \|/);
  assert.doesNotMatch(r.out, /solo 2026/);
  assert.doesNotMatch(r.out, /sí/);
});

test('crit. 4: subio-al-kit y lo de cubiertos.md van a "ya en el kit"', () => {
  const dir = carpeta('flota');
  const alfa = repo(dir, 'alfa', 'alfa', { [ID]: cambio({ estado: 'subio-al-kit', extra: ['version: 3.1.0'] }), '2026-10-29-otra': cambio({ cicatriz: 'plata' }) });
  const beta = repo(dir, 'beta', 'beta', { '2026-10-31-x': cambio({ cicatriz: 'plata' }) });
  const kit = carpeta('kit');
  fs.writeFileSync(path.join(kit, 'cubiertos.md'), '---\ncubiertos:\n  - {cita: "beta 2026-10-31-x", version: 3.1.0}\n---\n');
  let r = correr([alfa, beta], {});
  assert.match(r.out, /ya en el kit:\n {2}alfa 2026-10-30-guardia-de-saldos \| alfa/);
  r = correr([alfa, beta, '--kit', kit]);
  const [vivas, enKit] = r.out.split('ya en el kit:');
  assert.match(enKit, /beta 2026-10-31-x \| beta/);
  assert.doesNotMatch(vivas, /beta 2026-10-31-x/);
  assert.match(vivas, /alfa 2026-10-29-otra/);
  assert.doesNotMatch(vivas.split('para pegar')[1] || '', /beta 2026-10-31-x|guardia/);
  // sin cubiertos.md en --kit: no rompe
  assert.equal(correr([beta, '--kit', carpeta('vacio')]).code, 0);
});

test('lo NO commiteado no se ve; una rama no por defecto tampoco', () => {
  const dir = carpeta('flota');
  const alfa = repo(dir, 'alfa', 'alfa', { [ID]: cambio({}) });
  fs.writeFileSync(path.join(alfa, '.claude', 'cambios', '2026-11-01-sin-commit.md'), cambio({ urgente: 'sí', regla: 'No me ves.' }));
  git(alfa, 'checkout', '-q', '-b', 'modulo');
  fs.writeFileSync(path.join(alfa, '.claude', 'cambios', '2026-11-01-en-rama.md'), cambio({ urgente: 'sí', regla: 'Tampoco.' }));
  git(alfa, 'add', '-A');
  git(alfa, 'commit', '-q', '-m', 'en rama');
  git(alfa, 'checkout', '-q', 'main');
  const r = correr([alfa]);
  assert.match(r.out, /alfa 2026-10-30/);
  assert.doesNotMatch(r.out, /sin-commit|en-rama/);
  assert.match(correr([alfa, '--urgentes']).out, /ninguna urgencia en la flota/);
});

test('crit. 5: --urgentes lista el urgente de beta y no el rechazado ni el subio-al-kit', () => {
  const dir = carpeta('flota');
  const alfa = repo(dir, 'alfa', 'alfa', { [ID]: cambio({}) });
  const beta = repo(dir, 'beta', 'beta', {
    '2026-10-31-quema': cambio({ urgente: 'sí', regla: '\nNunca subas sin correr la prueba.', estado: 'propuesto' }),
    '2026-10-31-descartado': cambio({ urgente: 'sí', estado: 'rechazado', regla: 'No va.' }),
    '2026-10-31-ya': cambio({ urgente: 'sí', estado: 'subio-al-kit', regla: 'Ya está.', extra: ['version: 3.1.0'] }),
  });
  const r = correr([alfa, beta, '--urgentes']);
  assert.equal(r.code, 0);
  assert.equal(r.out.trim(), '⚠ beta · 2026-10-31-quema · Nunca subas sin correr la prueba. · propuesto');
});

test('master sin main, y origin/HEAD manda sobre el nombre', () => {
  const dir = carpeta('flota');
  const vieja = repo(dir, 'vieja', 'vieja', { [ID]: cambio({ urgente: 'sí', regla: 'En master.' }) }, { rama: 'master' });
  assert.match(correr([vieja, '--urgentes']).out, /⚠ vieja · .* · En master\. · aplicado/);
  // trunk como rama por defecto de origin; main existe pero con otro contenido
  const d = repo(dir, 'trunk', 'trunk', {}, { rama: 'trunk' });
  git(d, 'branch', 'main');
  git(d, 'checkout', '-q', 'trunk');
  fs.writeFileSync(path.join(d, '.claude', 'cambios', '2026-11-01-en-trunk.md'), cambio({ urgente: 'sí', regla: 'Rama trunk.' }));
  git(d, 'add', '-A');
  git(d, 'commit', '-q', '-m', 'en trunk');
  git(d, 'update-ref', 'refs/remotes/origin/trunk', 'HEAD');
  git(d, 'symbolic-ref', 'refs/remotes/origin/HEAD', 'refs/remotes/origin/trunk');
  assert.match(correr([d, '--urgentes']).out, /Rama trunk\./);
});

test('alias: vars.proyecto de la ficha; sin ficha, el nombre de la carpeta', () => {
  const dir = carpeta('flota');
  const a = repo(dir, 'carpeta-a', 'el-alias', { [ID]: cambio({ urgente: 'sí' }) });
  const b = repo(dir, 'carpeta-b', 'x', { [ID]: cambio({ urgente: 'sí' }) }, { sinFicha: true });
  const out = correr([a, b, '--urgentes']).out;
  assert.match(out, /⚠ el-alias · /);
  assert.match(out, /⚠ carpeta-b · /);
});

test('sin repos: --proyectos toma las carpetas con .git; las demás se ignoran', () => {
  const dir = carpeta('flota');
  repo(dir, 'alfa', 'alfa', { [ID]: cambio({ urgente: 'sí', regla: 'Una.' }) });
  fs.mkdirSync(path.join(dir, 'no-es-repo'));
  const r = correr(['--proyectos', dir, '--urgentes']);
  assert.equal(r.code, 0);
  assert.equal(r.out.trim().split('\n').length, 1);
  assert.match(r.out, /⚠ alfa/);
});

test('sin repos ni --proyectos: el proyectos: de kit-pc.md de --home; sin eso, "no sé dónde está la flota"', () => {
  const dir = carpeta('flota');
  repo(dir, 'alfa', 'alfa', { [ID]: cambio({ urgente: 'sí', regla: 'Por kit-pc.' }) });
  const home = carpeta('home');
  let r = correr(['--urgentes', '--home', home]);
  assert.equal(r.code, 0);
  assert.match(r.out, /no sé dónde está la flota/);
  fs.mkdirSync(path.join(home, '.claude'));
  fs.writeFileSync(path.join(home, '.claude', 'kit-pc.md'), `---\nentorno: nativo\nproyectos: "${dir.replace(/\\/g, '/')}"\n---\n`);
  r = correr(['--urgentes', '--home', home]);
  assert.equal(r.code, 0);
  assert.match(r.out, /⚠ alfa · .* · Por kit-pc\./);
  fs.writeFileSync(path.join(home, '.claude', 'kit-pc.md'), '---\nentorno: nativo\nproyectos: no\n---\n');
  assert.match(correr(['--home', home]).out, /no sé dónde está la flota/);
});

test('un repo que no se lee da una línea y se sigue; mal llamado es 2', () => {
  const dir = carpeta('flota');
  const alfa = repo(dir, 'alfa', 'alfa', { [ID]: cambio({ urgente: 'sí', regla: 'Sigo.' }) });
  const vacio = carpeta('sin-git');
  const r = correr([vacio, path.join(dir, 'no-existe'), alfa, '--urgentes']);
  assert.equal(r.code, 0);
  assert.match(r.out, /⚠ sin-git-\d+: no se lee/);
  assert.match(r.out, /⚠ no-existe: no se lee/);
  assert.match(r.out, /⚠ alfa · .* · Sigo\./);
  assert.equal(correr(['--nada']).code, 2);
  assert.equal(correr(['--proyectos']).code, 2);
  assert.match(correr(['--kit']).err, /uso:/);
});

test('un cambio con la cabecera rota se avisa y los demás se leen', () => {
  const dir = carpeta('flota');
  const alfa = repo(dir, 'alfa', 'alfa', { [ID]: cambio({ urgente: 'sí', regla: 'Bien.' }), '2026-10-31-roto': '---\nestado: "sin cerrar\n---\n' });
  const out = correr([alfa, '--urgentes']).out;
  assert.match(out, /no leí 2026-10-31-roto\.md/);
  assert.match(out, /⚠ alfa · .* · Bien\./);
});

test('crit. 5: diez repos con ~10 cambios cada uno, --urgentes en menos de 5 s', () => {
  const dir = carpeta('flota');
  for (let i = 0; i < 10; i++) {
    const cs = {};
    for (let j = 0; j < 10; j++) cs[`2026-10-${String(10 + j)}-cambio-${j}`] = cambio({ urgente: j === 3 ? 'sí' : 'no', regla: `Regla ${i}-${j}.`, cita: j % 2 ? `otro 2026-09-0${j}-x` : undefined });
    repo(dir, `p${i}`, `p${i}`, cs);
  }
  const t0 = Date.now();
  const r = correr(['--proyectos', dir, '--urgentes']);
  const ms = Date.now() - t0;
  console.log(`# --urgentes con 10 repos x 10 cambios: ${ms} ms`);
  assert.equal(r.code, 0);
  assert.equal(r.out.trim().split('\n').length, 10);
  assert.ok(ms < 5000, `tardó ${ms} ms`);
});

test('main exportado: devuelve el código y escribe por la salida que le pasan', () => {
  const dir = carpeta('flota');
  const alfa = repo(dir, 'alfa', 'alfa', { [ID]: cambio({ urgente: 'sí', regla: 'X.' }) });
  const lineas = [];
  assert.equal(CF.main([alfa, '--urgentes'], (l) => lineas.push(l)), 0);
  assert.equal(lineas.length, 1);
});
