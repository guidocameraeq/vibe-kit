'use strict';
// docs-ruta.test.cjs — la carpeta de papeles (SPEC-paquete-8r3, i1): de la ficha vigente, `docs` sin ella.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const D = require('./docs-ruta.cjs');

const g = (cwd, ...a) => execFileSync('git', a, { cwd, stdio: ['ignore', 'pipe', 'pipe'] }).toString();
const FICHA = (extra) => `---\nkit: 3.0.0-rc.4\nnivel: estandar\nvars:\n  proyecto: x\n${extra}---\n`;

function repo(fichaTexto) {
  const r = fs.mkdtempSync(path.join(os.tmpdir(), 'docs-ruta-'));
  g(r, 'init', '-q', '-b', 'main');
  g(r, 'config', 'user.email', 'p@e.st');
  g(r, 'config', 'user.name', 'p');
  fs.writeFileSync(path.join(r, 'a.txt'), 'a\n');
  if (fichaTexto !== null) {
    fs.mkdirSync(path.join(r, '.claude'), { recursive: true });
    fs.writeFileSync(path.join(r, '.claude', 'kit.md'), fichaTexto);
  }
  g(r, 'add', '-A');
  g(r, 'commit', '-q', '-m', 'base');
  return r;
}

test('rel arma la ruta con /', () => {
  assert.equal(D.rel('docs', 'SESSION_HANDOFF.md'), 'docs/SESSION_HANDOFF.md');
  assert.equal(D.rel('arti-docs', '/modulos/x'), 'arti-docs/modulos/x');
  assert.equal(D.rel('a/b', 'modulos\\x\\README.md'), 'a/b/modulos/x/README.md');
  assert.equal(D.rel('arti-docs', ''), 'arti-docs');
});

test('deVigente: ok con la clave → la clave; sin la clave, sin ficha o rota → docs', () => {
  assert.equal(D.deVigente({ estado: 'ok', datos: { 'carpeta-docs': 'arti-docs' } }), 'arti-docs');
  assert.equal(D.deVigente({ estado: 'ok', datos: {} }), 'docs');
  assert.equal(D.deVigente({ estado: 'sin-ficha' }), 'docs');
  assert.equal(D.deVigente({ estado: 'rota' }), 'docs');
  assert.equal(D.deVigente(null), 'docs');
});

test('deRaiz lee la ficha vigente (commiteada), no el disco', () => {
  D.olvidar();
  const r = repo(FICHA('carpeta-docs: arti-docs\n'));
  assert.equal(D.deRaiz(r), 'arti-docs');
  // en el disco dice otra cosa y no está commiteada: manda la vigente
  fs.writeFileSync(path.join(r, '.claude', 'kit.md'), FICHA('carpeta-docs: otra\n'));
  D.olvidar();
  assert.equal(D.deRaiz(r), 'arti-docs');
  const sin = repo(null);
  assert.equal(D.deRaiz(sin), 'docs');
  const sinClave = repo(FICHA(''));
  assert.equal(D.deRaiz(sinClave), 'docs');
});

test('deRaiz con la ficha vigente rota: la de la última ficha que se lee (rt-10)', () => {
  D.olvidar();
  const r = repo(FICHA('carpeta-docs: arti-docs\n'));
  fs.writeFileSync(path.join(r, '.claude', 'kit.md'), "---\nkit: 'roto'\n---\n");
  g(r, 'commit', '-q', '-am', 'rompe la ficha');
  assert.equal(D.deRaiz(r), 'arti-docs');
  D.olvidar();
  const s = repo("---\nkit: 'roto'\n---\n");
  assert.equal(D.deRaiz(s), 'docs');
});
