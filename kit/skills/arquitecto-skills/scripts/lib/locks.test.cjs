'use strict';
// locks.test.cjs — el lock del proyecto atrasado, leído (SPEC-paquete-8c p1 (a), crit. p1; D8c-9). Carpetas temporales con
// package.json y locks escritos a mano (las formas de npm 7+, pnpm 9 y 5.4, yarn 1 y berry); nada corre npm ni pnpm.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const L = require('./locks.cjs');

const T = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-locks-'));
test.after(() => fs.rmSync(T, { recursive: true, force: true }));
let n = 0;
function repo(archivos) {
  const d = path.join(T, `r${n++}`);
  for (const [rel, t] of Object.entries(archivos)) {
    const p = path.join(d, ...rel.split('/'));
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, typeof t === 'string' ? t : `${JSON.stringify(t, null, 2)}\n`);
  }
  fs.mkdirSync(d, { recursive: true });
  return d;
}
const pj = (deps, extra = {}) => ({ name: extra.name || 'x', version: '1.0.0', ...(deps ? { dependencies: deps } : {}), ...extra });
const npmLock = (paquetes, version = 3) => ({ name: 'x', lockfileVersion: version, requires: true, packages: paquetes });
const mirar = (d, setup) => L.mirarLocks(d, { setup });
const lineas = (d, setup) => L.lineas(mirar(d, setup));

// ---------------------------------------------------------------- npm

test('npm: el analytics — chat-syncer con openai que falta en su lock (por el --prefix del setup) → la línea con el arreglo', () => {
  const d = repo({
    'package.json': pj({ express: '^4.18.0' }),
    'package-lock.json': npmLock({ '': { name: 'x', dependencies: { express: '^4.18.0' } }, 'node_modules/express': { version: '4.18.2' } }),
    'chat-syncer/package.json': pj({ openai: '^4.104.0', dotenv: '^16.0.0' }),
    'chat-syncer/package-lock.json': npmLock({ '': { dependencies: { dotenv: '^16.0.0' } }, 'node_modules/dotenv': { version: '16.4.5' } }),
  });
  assert.deepEqual(lineas(d, 'npm ci && npm --prefix chat-syncer ci'), [
    'lock atrasado: chat-syncer/package-lock.json — falta openai: regeneralo en el proyecto (`npm install --prefix chat-syncer`) y commitealo; sin eso, el comando-setup falla y la flota no puede probar tus tests',
  ]);
});

test('npm: rango distinto (y N más); sin lock con dependencias; sin lock y sin dependencias → nada; lockfileVersion 1 → no sé leer', () => {
  let d = repo({
    'package.json': pj({ a: '^2.0.0', b: '^1.0.0' }, { devDependencies: { c: '^3.0.0' } }),
    'package-lock.json': npmLock({ '': { dependencies: { a: '^1.0.0', b: '^1.0.0' } } }),
  });
  assert.deepEqual(lineas(d, 'npm ci'), ['lock atrasado: package-lock.json — a: ^2.0.0 en el package.json y ^1.0.0 en el lock (y 1 más): regeneralo en el proyecto (`npm install`) y commitealo; sin eso, el comando-setup falla y la flota no puede probar tus tests']);
  assert.deepEqual(mirar(d, 'npm ci')[0].detalles, ['a: ^2.0.0 en el package.json y ^1.0.0 en el lock', 'falta c']);
  d = repo({ 'package.json': pj({ a: '^1.0.0' }), 'web/package.json': pj(null) });
  assert.deepEqual(lineas(d, 'npm install'), ['sin lock: package.json tiene dependencias y ningún lock — generalo en el proyecto (`npm install`) y commitealo; sin eso, el comando-setup falla y la flota no puede probar tus tests']);
  d = repo({ 'package.json': pj({ a: '^1.0.0' }), 'package-lock.json': { name: 'x', lockfileVersion: 1, dependencies: { a: { version: '1.0.0' } } } });
  assert.deepEqual(lineas(d, 'npm ci'), ['lock: package-lock.json — no sé leer este lock (lockfileVersion 1): lo prueba la flota']);
  d = repo({ 'package.json': pj({ a: '^1.0.0' }), 'package-lock.json': '{ esto no es json' });
  assert.match(lineas(d)[0], /^lock: package-lock\.json — no sé leer este lock \(no es un JSON\): lo prueba la flota$/);
});

test('npm: un workspace con el lock en la raíz — un miembro con una dependencia que falta, otro sin entrada en packages → "falta en el lock"', () => {
  const d = repo({
    'package.json': pj({ a: '^1.0.0' }, { workspaces: ['packages/*'] }),
    'package-lock.json': npmLock({
      '': { workspaces: ['packages/*'], dependencies: { a: '^1.0.0' } },
      'packages/uno': { name: 'uno', dependencies: { b: '^1.0.0' } },
      'node_modules/uno': { resolved: 'packages/uno', link: true },
    }),
    'packages/uno/package.json': pj({ b: '^1.0.0', c: '^2.0.0' }, { name: 'uno' }),
    'packages/dos/package.json': pj({ d: '^1.0.0' }, { name: 'dos' }),
  });
  const h = mirar(d, 'npm ci');
  assert.equal(h.length, 1, JSON.stringify(h));
  assert.deepEqual([h[0].archivo, h[0].detalles], ['package-lock.json', ['packages/dos: falta en el lock', 'packages/uno: falta c']]);
  assert.match(L.lineas(h)[0], /^lock atrasado: package-lock\.json — packages\/dos: falta en el lock \(y 1 más\): regeneralo en el proyecto \(`npm install`\)/);
});

// ---------------------------------------------------------------- pnpm

const PNPM_BOT = `lockfileVersion: '9.0'

settings:
  autoInstallPeers: true

importers:

  .:
    dependencies:
      '@scope/cosa':
        specifier: ^2.1.0
        version: 2.1.3
      openai-edge:
        specifier: ^1.2.0
        version: 1.2.2
    devDependencies:
      typescript:
        specifier: ^5.4.0
        version: 5.4.5

  extensions/twilio-whatsapp:
    dependencies:
      twilio:
        specifier: ^5.0.0
        version: 5.0.1

  ui:
    dependencies:
      react:
        specifier: ^18.2.0
        version: 18.3.1

packages:

  openai@4.104.0:
    resolution: {integrity: sha512-x}

  twilio@5.0.1:
    resolution: {integrity: sha512-y}
`;
const WS = "packages:\n  - 'ui'\n  - extensions/*\n  - tools/*\n";

test('pnpm: el bot — un miembro dos niveles abajo con un openclaw@workspace:* nuevo, otro sin importer; la raíz y ui al día; openai no calza con openai-edge; @scope entre comillas', () => {
  const d = repo({
    'package.json': pj({ '@scope/cosa': '^2.1.0', 'openai-edge': '^1.2.0' }, { name: 'openclaw', devDependencies: { typescript: '^5.4.0' } }),
    'pnpm-workspace.yaml': WS,
    'pnpm-lock.yaml': PNPM_BOT,
    'ui/package.json': pj({ react: '^18.2.0' }, { name: 'ui' }),
    'extensions/twilio-whatsapp/package.json': pj({ twilio: '^5.0.0', openclaw: 'workspace:*' }, { name: 'tw' }),
    'tools/nuevo/package.json': pj({ chalk: '^5.0.0' }, { name: 'nuevo' }),
  });
  const h = mirar(d, 'pnpm install --frozen-lockfile');
  assert.equal(h.length, 1, JSON.stringify(h));
  assert.deepEqual(h[0].detalles, ['extensions/twilio-whatsapp: falta openclaw', 'tools/nuevo: falta en el lock']);
  assert.deepEqual(L.lineas(h), ['lock atrasado: pnpm-lock.yaml — extensions/twilio-whatsapp: falta openclaw (y 1 más): regeneralo en el proyecto (`pnpm install`) y commitealo; sin eso, el comando-setup falla y la flota no puede probar tus tests']);
  // openai (nuevo en la raíz): "openai-edge" y "openai@4.104.0" de packages: no lo tapan (clave exacta, solo dentro del importer)
  fs.writeFileSync(path.join(d, 'package.json'), JSON.stringify(pj({ '@scope/cosa': '^2.1.0', 'openai-edge': '^1.2.0', openai: '^4.104.0' }, { devDependencies: { typescript: '^5.4.0' } })));
  assert.equal(mirar(d)[0].detalles[0], 'falta openai');
  // el @scope con otro rango
  fs.writeFileSync(path.join(d, 'package.json'), JSON.stringify(pj({ '@scope/cosa': '^3.0.0', 'openai-edge': '^1.2.0' }, { devDependencies: { typescript: '^5.4.0' } })));
  assert.equal(mirar(d)[0].detalles[0], '@scope/cosa: ^3.0.0 en el package.json y ^2.1.0 en el lock');
});

test('pnpm: completo (con workspace:* que ya está) → nada; el lockfile 5.4 (specifiers:) se lee; sin importers → no sé leer', () => {
  const lock = PNPM_BOT.replace("      twilio:\n        specifier: ^5.0.0", "      openclaw:\n        specifier: workspace:*\n        version: link:../..\n      twilio:\n        specifier: ^5.0.0");
  const d = repo({
    'package.json': pj({ '@scope/cosa': '^2.1.0', 'openai-edge': '^1.2.0' }, { devDependencies: { typescript: '^5.4.0' } }),
    'pnpm-workspace.yaml': "packages:\n  - 'ui'\n  - extensions/*\n",
    'pnpm-lock.yaml': lock,
    'ui/package.json': pj({ react: '^18.2.0' }),
    'extensions/twilio-whatsapp/package.json': pj({ twilio: '^5.0.0', openclaw: 'workspace:*' }),
  });
  assert.deepEqual(mirar(d, 'pnpm install --frozen-lockfile'), []);
  const v5 = repo({
    'package.json': pj({ a: '^1.0.0', b: '^2.0.0' }),
    'pnpm-workspace.yaml': 'packages:\n  - web\n',
    'pnpm-lock.yaml': "lockfileVersion: 5.4\n\nimporters:\n\n  .:\n    specifiers:\n      a: ^1.0.0\n      b: ^1.0.0\n    dependencies:\n      a: 1.0.0\n      b: 1.2.0\n\n  web:\n    specifiers:\n      c: ^1.0.0\n    dependencies:\n      c: 1.0.0\n",
    'web/package.json': pj({ c: '^1.0.0' }),
  });
  assert.deepEqual(mirar(v5)[0].detalles, ['b: ^2.0.0 en el package.json y ^1.0.0 en el lock']);
  const sin = repo({ 'package.json': pj({ a: '^1.0.0' }), 'pnpm-lock.yaml': "lockfileVersion: '6.0'\n\ndependencies:\n  a:\n    specifier: ^1.0.0\n    version: 1.0.0\n" });
  assert.deepEqual(lineas(sin), ['lock: pnpm-lock.yaml — no sé leer este lock (sin importers): lo prueba la flota']);
});

test('pnpm: un importer de subcarpeta sin workspace (su propio lock, con cd web &&) — su "." contra su package.json', () => {
  const d = repo({
    'web/package.json': pj({ vite: '^5.0.0', react: '^18.0.0' }),
    'web/pnpm-lock.yaml': "lockfileVersion: '9.0'\n\nimporters:\n\n  .:\n    dependencies:\n      react:\n        specifier: ^18.0.0\n        version: 18.3.1\n",
  });
  assert.deepEqual(lineas(d, 'cd web && pnpm install --frozen-lockfile'), ['lock atrasado: web/pnpm-lock.yaml — falta vite: regeneralo en el proyecto (`pnpm --dir web install`) y commitealo; sin eso, el comando-setup falla y la flota no puede probar tus tests']);
});

// ---------------------------------------------------------------- yarn

test('yarn: claves juntadas por ", " (v1, cada una entre comillas; berry, todas en una) y el npm: de berry; la que falta', () => {
  const v1 = repo({
    'package.json': pj({ '@babel/core': '^7.10.0', lodash: '^4.17.0', chalk: '^5.0.0' }),
    'yarn.lock': '# yarn lockfile v1\n\n\n"@babel/core@^7.0.0", "@babel/core@^7.10.0":\n  version "7.24.0"\n\nlodash@^4.17.0, lodash@^4.17.21:\n  version "4.17.21"\n\nchalk-template@^5.0.0:\n  version "1.0.0"\n',
  });
  assert.deepEqual(lineas(v1, 'yarn install --frozen-lockfile'), ['lock atrasado: yarn.lock — falta chalk@^5.0.0: regeneralo en el proyecto (`yarn install`) y commitealo; sin eso, el comando-setup falla y la flota no puede probar tus tests']);
  const berry = repo({
    'package.json': pj({ lodash: '^4.17.0', react: '^18.0.0' }),
    'yarn.lock': '__metadata:\n  version: 8\n  cacheKey: 10c0\n\n"lodash@npm:^4.17.0, lodash@npm:^4.17.21":\n  version: 4.17.21\n\n"react@npm:^18.0.0":\n  version: 18.3.1\n',
  });
  assert.deepEqual(mirar(berry), []);
});

// ---------------------------------------------------------------- las carpetas del setup

test('las carpetas del setup: --prefix x, --prefix=x, -C x, --dir x, cd x && (con comillas); las de afuera del repo no', () => {
  assert.deepEqual(L.carpetasDelSetup('npm ci && npm --prefix chat-syncer ci && npm --prefix=web ci && pnpm -C apps/a install && pnpm --dir "b c" i && cd tools/x && npm ci'), ['chat-syncer', 'web', 'b c', 'apps/a', 'tools/x']);
  assert.deepEqual(L.carpetasDelSetup('cd ../otro && npm ci && npm --prefix /abs ci && cd . && x'), []);
  // una carpeta de dos niveles que solo nombra el setup
  const d = repo({ 'apps/a/package.json': pj({ a: '^1.0.0' }), 'apps/a/package-lock.json': npmLock({ '': { dependencies: {} } }) });
  assert.deepEqual(mirar(d, ''), [], 'sin el setup no se baja a apps/a');
  assert.deepEqual(mirar(d, 'npm --prefix apps/a ci')[0].detalles, ['falta a']);
});

test('nada que decir: sin package.json, o todo al día → ninguna línea; los node_modules no se miran', () => {
  assert.deepEqual(mirar(repo({ 'README.md': '# x\n' })), []);
  const d = repo({
    'package.json': pj({ a: '^1.0.0' }),
    'package-lock.json': npmLock({ '': { dependencies: { a: '^1.0.0' } }, 'node_modules/a': { version: '1.0.0' } }),
    'node_modules/a/package.json': pj({ zz: '^9.0.0' }),
  });
  assert.deepEqual(mirar(d, 'npm ci'), []);
});
