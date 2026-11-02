'use strict';
// Pruebas de scripts/paquete.cjs (SPEC-0 6.10, el paquete del revisor): el USO y las salidas, el diff contra la base, el status,
// las pruebas en verde, en rojo, colgadas y sin comando-test (NO VERIFICADO), y que la ruta sea lo último que se imprime.
// Repos temporales sin la configuración de git de la PC. Corren con: node --test kit/molde/scripts/paquete.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-paquete-'));
const GLOBAL = path.join(TMP, 'gitconfig-vacio');
fs.writeFileSync(GLOBAL, '[core]\n\tlongpaths = true\n');
Object.assign(process.env, {
  GIT_CONFIG_GLOBAL: GLOBAL,
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_AUTHOR_NAME: 'Prueba',
  GIT_AUTHOR_EMAIL: 'prueba@ejemplo.invalid',
  GIT_COMMITTER_NAME: 'Prueba',
  GIT_COMMITTER_EMAIL: 'prueba@ejemplo.invalid',
});
test.after(() => fs.rmSync(TMP, { recursive: true, force: true, maxRetries: 20, retryDelay: 500 }));

const SCRIPT = path.join(__dirname, 'paquete.cjs');
const P = require('./paquete.cjs');

function g(cwd, ...args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', env: process.env });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}
function commit(d, archivos, mensaje = 'c') {
  for (const [rel, contenido] of Object.entries(archivos)) {
    fs.mkdirSync(path.dirname(path.join(d, rel)), { recursive: true });
    fs.writeFileSync(path.join(d, rel), contenido);
    g(d, 'add', '-f', '--', rel);
  }
  g(d, 'commit', '-q', '-m', mensaje);
  return g(d, 'rev-parse', 'HEAD');
}
const ficha = (ct) =>
  ['---', 'kit: 2.4.3', 'nivel: estandar', 'vars:', '  proyecto: prueba', ...(ct ? [`  comando-test: ${ct}`] : []), 'frenos:', '  quitados: []', '---', ''].join('\n');

let n = 0;
// Un repo con ficha en main y un segundo commit (el "sub-paso"): { d, base, punta }.
function proyecto({ test: ct = 'node t.js', tJs = 'console.log("corrimos las pruebas");\n' } = {}) {
  const d = path.join(TMP, `p${++n}`);
  fs.mkdirSync(d);
  g(d, 'init', '-q', '-b', 'main');
  const base = commit(d, { '.claude/kit.md': ficha(ct), 't.js': tJs, 'a.txt': 'uno\n' }, 'base');
  const punta = commit(d, { 'a.txt': 'uno\ndos-cambiado\n', 'nuevo.js': 'x\n' }, 'subpaso');
  return { d, base, punta };
}
const correr = (cwd, ...args) => spawnSync(process.execPath, [SCRIPT, ...args], { cwd, encoding: 'utf8', env: process.env });

test('USO y mal llamado: sin base, opción rara o de más → salida 2', () => {
  const { d } = proyecto();
  for (const args of [[], ['--zzz'], ['a', 'b'], ['x', '--salida'], ['x', '--plazo', 'cero']]) {
    const r = correr(d, ...args);
    assert.equal(r.status, 2, args.join(' '));
    assert.match(r.stdout, /Uso: node \.claude\/scripts\/paquete\.cjs <sha-base>/);
  }
});

test('base que no existe → salida 1 con el porqué, y no deja archivo', () => {
  const { d } = proyecto();
  const salida = path.join(TMP, 'no-debe.md');
  const r = correr(d, 'deadbeefdeadbeef', '--salida', salida);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /no es un commit de este repo/);
  assert.equal(fs.existsSync(salida), false);
});

test('armado feliz: diff contra la base, status y pruebas en verde; la ruta es la última línea', () => {
  const { d, base } = proyecto();
  fs.writeFileSync(path.join(d, 'suelto.txt'), 'sin commitear\n');
  const salida = path.join(TMP, 'sal1', 'paquete.md');
  const r = correr(d, base, '--salida', salida);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const lineas = r.stdout.trim().split('\n');
  assert.equal(lineas[lineas.length - 1], path.resolve(salida));
  assert.match(lineas[0], /^pruebas: VERDE/);
  const t = fs.readFileSync(salida, 'utf8');
  assert.match(t, /\+dos-cambiado/); // el diff del sub-paso
  assert.match(t, /nuevo\.js/); // y su stat
  assert.match(t, /\?\? suelto\.txt/); // el status
  assert.match(t, /corrimos las pruebas/); // la salida de las pruebas
  assert.match(t, /Resultado: VERDE/);
});

test('sin --salida, el archivo va al temporal', () => {
  const { d, base } = proyecto();
  const r = correr(d, base);
  assert.equal(r.status, 0);
  const ruta = r.stdout.trim().split('\n').pop();
  assert.ok(path.resolve(ruta).startsWith(path.resolve(os.tmpdir())), ruta);
  assert.ok(fs.existsSync(ruta));
  fs.rmSync(ruta);
});

test('pruebas en rojo: el paquete se arma igual (salida 0) y dice ROJO con la salida del fallo', () => {
  const { d, base } = proyecto({ tJs: 'console.log("fallo esto"); process.exit(3);\n' });
  const salida = path.join(TMP, 'sal2.md');
  const r = correr(d, base, '--salida', salida);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /^pruebas: ROJO \(salida 3\)/);
  const t = fs.readFileSync(salida, 'utf8');
  assert.match(t, /fallo esto/);
  assert.match(t, /Resultado: ROJO/);
});

test('sin vars.comando-test: NO VERIFICADO, nunca verde', () => {
  const { d, base } = proyecto({ test: '' });
  const salida = path.join(TMP, 'sal3.md');
  const r = correr(d, base, '--salida', salida);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /^pruebas: NO VERIFICADO/);
  assert.doesNotMatch(fs.readFileSync(salida, 'utf8'), /VERDE/);
});

test('pruebas colgadas pasado el plazo: NO VERIFICADO (colgado)', () => {
  const { d, base } = proyecto({ test: 'node cuelga.js' });
  commit(d, { 'cuelga.js': 'setTimeout(() => {}, 30000);\n' }, 'cuelga');
  const r = P.armar({ cwd: d, base, salida: path.join(TMP, 'sal4.md'), plazoMin: 0.05 });
  assert.equal(r.ok, true);
  assert.match(r.pruebas, /^NO VERIFICADO \(colgado/);
});

test('el diff es contra la base pedida: una base más nueva deja afuera el cambio anterior', () => {
  const { d, punta } = proyecto();
  commit(d, { 'b.txt': 'otro\n' }, 'tercero');
  const salida = path.join(TMP, 'sal5.md');
  assert.equal(P.armar({ cwd: d, base: punta, salida }).ok, true);
  const t = fs.readFileSync(salida, 'utf8');
  assert.match(t, /b\.txt/);
  assert.doesNotMatch(t, /dos-cambiado/);
});
