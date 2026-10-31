'use strict';
// Pruebas de lib/proceso.cjs (SPEC-paquete-5; r1-7, r1-9): claudeEnPath respeta lo inyectado y pregunta una sola vez; el vigía da
// verde, rojo, "no corrió" y colgado, y al colgado lo mata con todo lo que lanzó. Corren con: node --test "kit/**/*.test.cjs".
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const P = require('./proceso.cjs');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-proceso-'));
test.after(() => fs.rmSync(TMP, { recursive: true, force: true, maxRetries: 20, retryDelay: 500 }));

test('claudeEnPath: lo inyectado manda; sin inyectar, pregunta una vez y lo deja anotado (un booleano)', () => {
  assert.equal(P.claudeEnPath({ claudeEnPath: true }), true);
  assert.equal(P.claudeEnPath({ claudeEnPath: false }), false);
  const o = {};
  const v = P.claudeEnPath(o);
  assert.equal(typeof v, 'boolean');
  assert.equal(o.claudeEnPath, v);
});

test('correrConPlazo: verde, rojo con su salida, "no corrió" (127) y colgado → muerto con su árbol', () => {
  const nodo = `"${process.execPath}"`;
  assert.deepEqual(P.correrConPlazo(`${nodo} -e "process.exit(0)"`, { cwd: TMP, plazoMs: 20000 }), { estado: 'verde', como: 'salida 0' });
  assert.deepEqual(P.correrConPlazo(`${nodo} -e "process.exit(4)"`, { cwd: TMP, plazoMs: 20000 }), { estado: 'rojo', como: 'salida 4' });
  assert.equal(P.correrConPlazo(`${nodo} -e "process.exit(127)"`, { cwd: TMP, plazoMs: 20000 }).estado, 'no-corrio');
  const pid = path.join(TMP, 'pid');
  fs.writeFileSync(path.join(TMP, 'cuelga.js'), `require('fs').writeFileSync(${JSON.stringify(pid)}, String(process.pid)); setTimeout(() => {}, 30000);\n`);
  const t0 = Date.now();
  const r = P.correrConPlazo(`${nodo} cuelga.js`, { cwd: TMP, plazoMs: 1500 });
  assert.deepEqual(r, { estado: 'colgado', como: 'no terminó en 2 s' });
  assert.ok(Date.now() - t0 < 20000, 'no esperó al colgado');
  assert.throws(() => process.kill(Number(fs.readFileSync(pid, 'utf8')), 0), 'el colgado quedó vivo');
  assert.match(P.VIGIA, /taskkill/);
});
