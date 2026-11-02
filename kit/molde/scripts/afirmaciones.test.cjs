'use strict';
// Pruebas de scripts/afirmaciones.cjs (SPEC-0 6.10; K5): el USO y las salidas 0/1/2, que mira solo los renglones AGREGADOS desde la
// base (lo commiteado, venga de la herramienta que venga), que avisa sin frenar por defecto, y que con --frenar sale 1 y deja UN
// renglón en .claude/frenos.log. Repos temporales sin la configuración de git de la PC. Corren con: node --test "kit/**/*.test.cjs"
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-afirmaciones-'));
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

const SCRIPT = path.join(__dirname, 'afirmaciones.cjs');
const S = require('./afirmaciones.cjs');

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
let n = 0;
// Un repo con un archivo que YA prometía de más en la base (no se mira: no es agregado). → { d, base }
function proyecto() {
  const d = path.join(TMP, `p${++n}`);
  fs.mkdirSync(d);
  g(d, 'init', '-q', '-b', 'main');
  const base = commit(d, { 'viejo.py': '# esto nunca falla (viejo: no se mira)\nx = 1\n' }, 'base');
  return { d, base };
}
const correr = (cwd, ...args) => spawnSync(process.execPath, [SCRIPT, ...args], { cwd, encoding: 'utf8', env: process.env });
const log = (d) => path.join(d, '.claude', 'frenos.log');

test('USO y mal llamado: sin base, opción rara o de más → salida 2', () => {
  const { d } = proyecto();
  for (const args of [[], ['--zzz'], ['a', 'b']]) {
    const r = correr(d, ...args);
    assert.equal(r.status, 2, args.join(' '));
    assert.match(r.stdout, /Uso: node \.claude\/scripts\/afirmaciones\.cjs <sha-base>/);
  }
});

test('base que no existe → salida 1 con NO VERIFICADO y el porqué', () => {
  const { d } = proyecto();
  const r = correr(d, 'deadbeefdeadbeef');
  assert.equal(r.status, 1);
  assert.match(r.stdout, /NO VERIFICADO \(la base "deadbeefdeadbeef" no es un commit de este repo\)/);
});

test('limpio: prosa agregada sin promesas (y la vieja con "nunca" no cuenta) → 0, sin tocar frenos.log', () => {
  const { d, base } = proyecto();
  commit(d, {
    'viejo.py': '# esto nunca falla (viejo: no se mira)\nx = 2  # sube a 2 para el caso B\n',
    'b.ts': '// lee la config del disco\nexport const b = 1;\n',
  });
  const r = correr(d, base, '--frenar');
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /^afirmaciones: limpio \(2 archivo\(s\) con prosa revisados\)/);
  assert.equal(fs.existsSync(log(d)), false);
});

test('por defecto avisa: hallazgos con "¿promete de más? … — si sí: …; si vale, dejalo", salida 0 y sin renglón en frenos.log', () => {
  const { d, base } = proyecto();
  commit(d, { 'a.py': 'def f():\n    """Siempre devuelve la lista entera."""\n    raise ValueError("imposible llegar")\n' });
  const r = correr(d, base);
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /2 hallazgo\(s\) a mirar \(avisa, no frena/);
  assert.match(r.stdout, /⚠️ a mirar · a\.py:2 · absoluto · ¿promete de más\? "Siempre" en «Siempre devuelve la lista entera\.» — si sí: .*; si vale, dejalo/);
  assert.match(r.stdout, /a\.py:3 · absoluto · ¿promete de más\? "imposible"/);
  assert.doesNotMatch(r.stdout, /eso no|hacé:/);
  assert.equal(fs.existsSync(log(d)), false);
});

test('RF-fix 1: una ruta con espacio (git le pone un TAB al final) y diff.noprefix=true se revisan igual, no dan "limpio"', () => {
  const { d, base } = proyecto();
  commit(d, { 'con espacio/mi archivo.py': '# nunca falla\nx = 1\n' });
  const r = correr(d, base);
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /con espacio\/mi archivo\.py:1 · absoluto/);
  g(d, 'config', 'diff.noprefix', 'true');
  g(d, 'config', 'diff.mnemonicPrefix', 'true');
  const r2 = correr(d, base);
  assert.match(r2.stdout, /con espacio\/mi archivo\.py:1 · absoluto/, r2.stdout);
  assert.equal(S.rutaDelDiff('"b/con \\"comillas\\" y \\303\\261.py"'), 'con "comillas" y ñ.py');
  assert.equal(S.rutaDelDiff('b/a b.py\t'), 'a b.py');
});

test('RF-fix 1: un archivo con renglones agregados que git no pudo leer → NO VERIFICADO, nunca "limpio"', () => {
  const agregados = new Map([['a.py', new Set([1])], ['b.py', new Set([1])]]);
  const r = S.juntar(agregados, (ruta) => (ruta === 'a.py' ? '# lee la config\n' : null));
  assert.deepEqual(r.sinLeer, ['b.py']);
  const l = S.lineas(r, false).join('\n');
  assert.match(l, /NO VERIFICADO en 1 archivo\(s\) que git no pudo leer: b\.py/);
  assert.doesNotMatch(l, /limpio/);
});

test('RF-fix 2: un git mv y un bloque reindentado no son prosa nueva', () => {
  const { d } = proyecto();
  const base = commit(d, { 'm.py': 'def f():\n    # nunca falla, dicho de antes\n    return 1\n' });
  g(d, 'mv', 'm.py', 'movido.py');
  g(d, 'commit', '-q', '-m', 'mv');
  let r = correr(d, base, '--frenar');
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /limpio/);
  const base2 = g(d, 'rev-parse', 'HEAD');
  commit(d, { 'movido.py': 'class A:\n    def f():\n        # nunca falla, dicho de antes\n        return 1\n' });
  r = correr(d, base2, '--frenar');
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /limpio/);
});

test('--frenar con hallazgos: salida 1, un solo renglón en .claude/frenos.log con el id, la herramienta y las rutas', () => {
  const { d, base } = proyecto();
  commit(d, { 'src/c.js': '// verificado contra producción\nmodule.exports = 1;\n', 'CHANGELOG.md': '# 1.0\n- Cubre todos los casos\n' });
  const r = correr(d, base, '--frenar');
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stdout, /^afirmaciones: frena · 2 hallazgo\(s\)/);
  assert.match(r.stdout, /CHANGELOG\.md:2 · cobertura · eso no: "Cubre todos" en «Cubre todos los casos»; hacé: /);
  const renglones = fs.readFileSync(log(d), 'utf8').trim().split('\n');
  assert.equal(renglones.length, 1);
  assert.match(renglones[0], / · humano · main · gate:afirmaciones · afirmaciones\.cjs · 2 hallazgo\(s\) en CHANGELOG\.md, src\/c\.js$/);
});

test('la salida de escape: la misma promesa con su evidencia (prueba, SHA, NO VERIFICADO) no frena', () => {
  const { d, base } = proyecto();
  commit(d, { 'e.py': '# nunca devuelve None (test_f_no_devuelve_none)\n# verificado en 3f2a9c1\n# siempre en UTC: NO VERIFICADO\nx = 1\n' });
  const r = correr(d, base, '--frenar');
  assert.equal(r.status, 0, r.stdout);
});

test('agregadosDelDiff: números del lado nuevo, archivos borrados sin nada; la sección del paquete corta en el tope', () => {
  const diff = [
    'diff --git a/x.py b/x.py', '--- a/x.py', '+++ b/x.py', '@@ -1,0 +2,2 @@', '+a', '+b', '@@ -9 +11 @@', '-z', '+c',
    'diff --git a/y.py b/y.py', '--- a/y.py', '+++ /dev/null', '@@ -1 +0,0 @@', '-q',
  ].join('\n');
  const m = S.agregadosDelDiff(diff);
  assert.deepEqual([...m.keys()], ['x.py']);
  assert.deepEqual([...m.get('x.py')], [2, 3, 11]);
  const h = (i) => ({ ruta: 'z.py', linea: i + 1, regla: 'absoluto', frase: 'nunca', texto: 'nunca', alternativa: 'x' });
  const muchos = { ok: true, archivos: 1, hallazgos: Array.from({ length: S.TOPE_PAQUETE + 5 }, (_, i) => h(i)) };
  const l = S.lineas(muchos, false, S.TOPE_PAQUETE);
  assert.equal(l.length, 1 + S.TOPE_PAQUETE + 1);
  assert.equal(l[l.length - 1], '(+5 más, no listados)', 'el revisor no tiene shell: no se le pide correr nada');
});
