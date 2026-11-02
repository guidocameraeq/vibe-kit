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

test('RF-fix 7: sin --salida, el archivo va a .claude/paquetes/<sha7>.md dentro del checkout (también corrido desde una subcarpeta), no al temporal', () => {
  const { d, base, punta } = proyecto();
  const esperada = path.join(d, '.claude', 'paquetes', `${punta.slice(0, 7)}.md`);
  let r = correr(d, base);
  assert.equal(r.status, 0);
  let ruta = r.stdout.trim().split('\n').pop();
  assert.equal(path.resolve(ruta).toLowerCase(), path.resolve(esperada).toLowerCase());
  assert.ok(!path.resolve(ruta).toLowerCase().startsWith(path.resolve(os.tmpdir(), 'paquete-revisor').toLowerCase()));
  assert.match(fs.readFileSync(esperada, 'utf8'), /\+dos-cambiado/);
  fs.rmSync(esperada);
  fs.mkdirSync(path.join(d, 'sub'));
  r = correr(path.join(d, 'sub'), base);
  assert.equal(r.status, 0);
  ruta = r.stdout.trim().split('\n').pop();
  assert.equal(path.resolve(ruta).toLowerCase(), path.resolve(esperada).toLowerCase(), 'desde una subcarpeta, igual en la raíz');
  // el gitignore.snippet la ignora: con él, el paquete no ensucia el árbol
  const snippet = fs.readFileSync(path.join(__dirname, '..', 'gitignore.snippet'), 'utf8');
  assert.ok(snippet.split('\n').includes('/.claude/paquetes/'));
  fs.writeFileSync(path.join(d, '.gitignore'), snippet);
  assert.equal(g(d, 'status', '--short', '--', '.claude/paquetes'), '');
});

test('RF-fix 10: --pruebas corre las de lo tocado (no la suite); --sin-pruebas no corre ninguna y dice NO VERIFICADO; juntas o sin valor → 2', () => {
  const { d, base } = proyecto();
  commit(d, { 'lo-tocado.js': 'console.log("solo lo tocado");\n' }, 'pruebas de lo tocado');
  const s1 = path.join(TMP, 'sal-pruebas.md');
  let r = correr(d, base, '--salida', s1, '--pruebas', 'node lo-tocado.js');
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /^pruebas: VERDE/);
  let t = fs.readFileSync(s1, 'utf8');
  assert.match(t, /Comando: node lo-tocado\.js · las de lo tocado \(--pruebas\)/);
  assert.match(t, /solo lo tocado/);
  assert.doesNotMatch(t, /corrimos las pruebas/, 'la suite (vars.comando-test) no corrió');
  const s2 = path.join(TMP, 'sal-sin.md');
  r = correr(d, base, '--salida', s2, '--sin-pruebas');
  assert.equal(r.status, 0);
  assert.match(r.stdout, /^pruebas: NO VERIFICADO \(--sin-pruebas/);
  t = fs.readFileSync(s2, 'utf8');
  assert.doesNotMatch(t, /corrimos las pruebas|VERDE/);
  for (const args of [['--pruebas'], ['--pruebas', ''], ['--pruebas', 'node x.js', '--sin-pruebas']]) {
    r = correr(d, base, ...args);
    assert.equal(r.status, 2, args.join(' '));
    assert.match(r.stdout, /--pruebas <cmd> \| --sin-pruebas/);
  }
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
