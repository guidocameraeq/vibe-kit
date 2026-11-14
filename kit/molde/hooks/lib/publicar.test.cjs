'use strict';
// Pruebas de hooks/lib/publicar.cjs (SPEC-paquete-8d C2.2, el contrato de la autorización de publicar). Viven acá, al lado de la lib,
// porque la línea 7 de chequear (la flota) pide que todo hook que cambia traiga pruebas en hooks/: sin esta, una adopción que trae
// publicar.cjs daba ROTA (la flota de prueba de la rc.7, C6). El mismo ejemplo del contrato está en noche.test "B3 el contrato" y en
// preparar-pc.test "8d C2.2": los tres tienen que dar la misma huella. Corren con: node --test "kit/**/*.test.cjs"
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const PUB = require('./publicar.cjs');
const F = require('./ficha.cjs');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-publicar-'));
const GLOBAL = path.join(TMP, 'gitconfig-vacio');
fs.writeFileSync(GLOBAL, '[core]\n\tautocrlf = false\n');
Object.assign(process.env, { GIT_CONFIG_GLOBAL: GLOBAL, GIT_CONFIG_NOSYSTEM: '1', GIT_AUTHOR_NAME: 'P', GIT_AUTHOR_EMAIL: 'p@p.invalid', GIT_COMMITTER_NAME: 'P', GIT_COMMITTER_EMAIL: 'p@p.invalid' });
test.after(() => fs.rmSync(TMP, { recursive: true, force: true }));
const g = (cwd, ...a) => {
  const r = spawnSync('git', a, { cwd, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ${a.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
};

test('el contrato: el origin normalizado, los archivos nombrados y el texto de la huella (el ejemplo compartido)', () => {
  for (const u of ['git@github.com:Duenio/Repo.git', 'https://github.com/Duenio/Repo', 'https://GitHub.com/Duenio/Repo.git/', 'ssh://git@github.com/Duenio/Repo.git']) {
    assert.equal(PUB.normalizarOrigin(u), 'github.com/Duenio/Repo', u);
  }
  const p = { comando: 'npm --prefix app run deploy', humo: 'node scripts/humo.cjs --rapido', volver: 'node scripts/humo.cjs' };
  assert.deepEqual(PUB.archivosNombrados(p), ['app/package.json', 'scripts/humo.cjs']);
  const archivos = { 'app/package.json': '{"scripts":{"deploy":"x"}}\r\n', 'scripts/humo.cjs': 'h\n' };
  const esperado = ['comando=npm --prefix app run deploy', 'humo=node scripts/humo.cjs --rapido', 'volver=node scripts/humo.cjs', `app/package.json=${F.hash('{"scripts":{"deploy":"x"}}\n')}`, `scripts/humo.cjs=${F.hash('h\n')}`];
  assert.equal(PUB.textoHuella(p, (r) => archivos[r]), esperado.join('\n'));
  assert.equal(PUB.textoHuella({ comando: 'al-subir', humo: 'node h.cjs' }, () => null), 'comando=al-subir\nhumo=node h.cjs\nvolver=\nh.cjs=(no está)');
  assert.equal(PUB.archivoDe('al-subir'), null);
});

test('huella: lee los archivos de la ref (no del disco) y se mueve si cambia el package.json entero', () => {
  const d = path.join(TMP, 'r');
  fs.mkdirSync(path.join(d, 'scripts'), { recursive: true });
  g(d, 'init', '-q', '-b', 'main');
  fs.writeFileSync(path.join(d, 'package.json'), '{"scripts":{"deploy":"a"}}\n');
  fs.writeFileSync(path.join(d, 'scripts', 'humo.cjs'), 'h\n');
  g(d, 'add', '-A');
  g(d, 'commit', '-q', '-m', 'base');
  const p = { comando: 'npm run deploy', humo: 'node scripts/humo.cjs' };
  const h1 = PUB.huella(d, p, 'HEAD');
  assert.match(h1, /^[0-9a-f]{12}$/);
  fs.writeFileSync(path.join(d, 'package.json'), '{"scripts":{"deploy":"b"}}\n'); // en el disco: no cuenta
  assert.equal(PUB.huella(d, p, 'HEAD'), h1);
  g(d, 'commit', '-q', '-am', 'otro deploy');
  assert.notEqual(PUB.huella(d, p, 'HEAD'), h1);
});

test('autorizacionesPc: falta, rota o la lista de kit-pc.md', () => {
  const h = path.join(TMP, 'home');
  assert.deepEqual(PUB.autorizacionesPc(h), { falta: true });
  fs.mkdirSync(path.join(h, '.claude'), { recursive: true });
  fs.writeFileSync(PUB.rutaKitPc(h), '---\nentorno: nativo\npublica:\n  - {origin: "github.com/d/r", huella: 0123456789ab}\n---\n');
  assert.deepEqual(PUB.autorizacionesPc(h), { lista: [{ origin: 'github.com/d/r', huella: '0123456789ab' }] });
  fs.writeFileSync(PUB.rutaKitPc(h), '---\nentorno: nativo\npublica:\n  - {origin: "github.com/d/r", huella: corta}\n---\n');
  assert.ok(PUB.autorizacionesPc(h).rota);
  fs.writeFileSync(PUB.rutaKitPc(h), '---\nentorno: nativo\n---\n');
  assert.deepEqual(PUB.autorizacionesPc(h), { lista: [] });
});
