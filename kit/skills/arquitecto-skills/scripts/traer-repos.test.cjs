'use strict';
// traer-repos.test.cjs — preparar la PC trae los repos de la cuenta (SPEC-paquete-8d C2.1, crit. C2). Con un gh de mentira (un .cjs
// que lee los repos de una carpeta temporal y "clona" de repos bare locales). Nunca la red ni la carpeta de proyectos de verdad.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const TR = require('./traer-repos.cjs');

const T = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-traer-repos-'));
test.after(() => fs.rmSync(T, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }));
fs.writeFileSync(path.join(T, 'gitconfig-vacio'), '');
Object.assign(process.env, {
  GIT_CONFIG_GLOBAL: path.join(T, 'gitconfig-vacio'), GIT_CONFIG_NOSYSTEM: '1',
  GIT_AUTHOR_NAME: 'prueba', GIT_AUTHOR_EMAIL: 'p@kit.invalid', GIT_COMMITTER_NAME: 'prueba', GIT_COMMITTER_EMAIL: 'p@kit.invalid',
});
const git = (cwd, ...args) => {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', windowsHide: true });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
};
const escribir = (dir, mapa) => {
  for (const [rel, t] of Object.entries(mapa)) {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), t);
  }
};

// Los repos "de la cuenta": bare en T/remotos/<dueño>/<repo>.git
const REMOTOS = path.join(T, 'remotos');
function remoto(nombre, archivos) {
  const src = path.join(T, 'src', nombre);
  fs.mkdirSync(src, { recursive: true });
  escribir(src, archivos);
  git(src, 'init', '-q', '-b', 'main');
  git(src, 'add', '-A');
  git(src, 'commit', '-q', '-m', 'inicio');
  const bare = path.join(REMOTOS, `${nombre}.git`);
  fs.mkdirSync(path.dirname(bare), { recursive: true });
  git(T, 'clone', '-q', '--bare', src, bare);
}
const FICHA = '---\nkit: 3.0.0-rc.6\nnivel: estandar\nvars:\n  proyecto: app\n  comando-setup: node setup.cjs\npiezas:\n  githooks: molde\n---\n';
remoto('dueno/app', { '.claude/kit.md': FICHA, '.githooks/pre-commit': '#!/bin/sh\nexit 0\n', 'setup.cjs': "require('fs').writeFileSync('SETUP-CORRIO', 'si');\n" });
remoto('dueno/ya', { 'README.md': '# ya\n' });
remoto('miorg/lib', { 'README.md': '# lib\n' });

// El gh de mentira
const GH = path.join(T, 'gh-mentira.cjs');
fs.writeFileSync(GH, `
const { spawnSync } = require('child_process');
const path = require('path');
const a = process.argv.slice(2);
const R = ${JSON.stringify(REMOTOS)};
const lista = (d) => JSON.stringify((d === 'miorg' ? ['miorg/lib'] : ['dueno/app', 'dueno/ya']).map((n) => ({ nameWithOwner: n, url: 'https://github.com/' + n })));
if (a[0] === 'api' && a[1] === 'user') { console.log('dueno'); process.exit(0); }
if (a[0] === 'api' && a[1] === 'user/orgs') { console.log('miorg'); process.exit(0); }
if (a[0] === 'repo' && a[1] === 'list') { console.log(lista(a[2] && !a[2].startsWith('--') ? a[2] : null)); process.exit(0); }
if (a[0] === 'repo' && a[1] === 'clone') {
  const extra = a.slice(a.indexOf('--') + 1);
  const r = spawnSync('git', ['clone', '-q', ...extra, path.join(R, a[2] + '.git'), a[3]], { stdio: 'inherit' });
  process.exit(r.status);
}
process.exit(9);
`);

function carpetaProyectos() {
  const c = path.join(T, `proyectos-${Math.random().toString(36).slice(2, 8)}`);
  fs.mkdirSync(path.join(c, 'ya'), { recursive: true });
  git(path.join(c, 'ya'), 'init', '-q', '-b', 'main');
  git(path.join(c, 'ya'), 'remote', 'add', 'origin', 'git@github.com:dueno/ya.git');
  return c;
}

test('8d C2.1 (crit. C2): listar trae los de la cuenta y los de la organización, y marca el que ya está por su origin', () => {
  const c = carpetaProyectos();
  const r = TR.principal(['listar', '--proyectos', c, '--gh', GH]);
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  assert.match(r.lineas[0], /^traer-repos · cuenta dueno · 3 repos \(con los de miorg\)/);
  assert.ok(r.lineas.includes('  dueno/app · para traer'), r.lineas.join('\n'));
  assert.ok(r.lineas.includes('  dueno/ya · ya está (ya)'), r.lineas.join('\n'));
  assert.ok(r.lineas.includes('  miorg/lib · para traer'), r.lineas.join('\n'));
  assert.match(r.lineas[r.lineas.length - 1], /^2 para traer — elegí cuáles/);
});

test('8d C2.1 (crit. C2): clonar trae con core.longpaths y los ganchos, NO corre el comando-setup y no pisa una carpeta que existe', () => {
  const c = carpetaProyectos();
  const r = TR.principal(['clonar', 'dueno/app', 'miorg/lib', 'dueno/ya', '--proyectos', c, '--gh', GH]);
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  const app = path.join(c, 'app');
  assert.equal(git(app, 'config', '--get', 'core.longpaths'), 'true');
  assert.equal(git(app, 'config', '--get', 'core.hooksPath'), '.githooks');
  assert.equal(fs.existsSync(path.join(app, 'SETUP-CORRIO')), false, 'el comando-setup no corre solo');
  assert.match(r.lineas.find((l) => l.startsWith('dueno/app · ')), /su comando-setup es «node setup\.cjs»: es código de ese repo, no lo corrí/);
  assert.equal(git(path.join(c, 'lib'), 'config', '--get', 'core.longpaths'), 'true');
  assert.match(r.lineas.find((l) => l.startsWith('miorg/lib · ')), /no tiene el kit/);
  assert.match(r.lineas.find((l) => l.startsWith('dueno/ya · ')), /ya hay una carpeta .*: no la piso/);
  assert.equal(fs.existsSync(path.join(c, 'ya', 'README.md')), false, 'la carpeta que estaba, intacta');
});

test('8d C2.1: mal llamado → 2; sin elegir repos, clonar no clona nada; gh que falla → 1 con su línea', () => {
  assert.equal(TR.principal(['clonar', '--proyectos', T]).codigo, 2);
  assert.equal(TR.principal(['listar']).codigo, 2);
  assert.equal(TR.principal(['clonar', 'no-es-un-repo', '--proyectos', T]).codigo, 2);
  const r = TR.principal(['listar', '--proyectos', T, '--gh', path.join(T, 'no-existe-gh')]);
  assert.equal(r.codigo, 1);
  assert.match(r.lineas[0], /^traer-repos · no pude leer tu cuenta con gh/);
});
