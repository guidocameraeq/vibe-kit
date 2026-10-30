'use strict';
// copias.test.cjs — la prueba anti-desvío (SPEC-paquete-3 D-12; SPEC-paquete-4 P1.4): lib/ficha.cjs es IDÉNTICA byte a byte a
// kit/molde/hooks/lib/ficha.cjs, y lib/ se alcanza sola (ningún require relativo sale de lib/; sello.cjs, solo node estándar,
// para que el orden 5 la copie al molde).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const LIB = __dirname;
// lib -> scripts -> arquitecto -> skills -> kit ; de ahí a molde/hooks/lib
const KIT = path.resolve(__dirname, '..', '..', '..', '..');
const MOLDE_LIB = path.join(KIT, 'molde', 'hooks', 'lib');
const requiresDe = (archivo) =>
  [...fs.readFileSync(archivo, 'utf8').matchAll(/require\(\s*['"]([^'"]+)['"]\s*\)/g)].map((m) => m[1]);

test('lib/ficha.cjs es idéntica byte a byte a la del molde', () => {
  const par = path.join(MOLDE_LIB, 'ficha.cjs');
  assert.ok(fs.existsSync(par), 'no encuentro kit/molde/hooks/lib/ficha.cjs');
  assert.ok(fs.readFileSync(path.join(LIB, 'ficha.cjs')).equals(fs.readFileSync(par)), 'lib/ficha.cjs se desvió del molde — volvé a copiarla byte a byte');
});

// SPEC-paquete-5 "sello.cjs al molde" (D4-9, D5-7; criterio 8): la copia del molde (la usa `encargo.cjs presentar`) es idéntica
// byte a byte. Se cambia acá, en el Arquitecto, y se copia: nunca al revés.
const identicas = (a, b) => Buffer.isBuffer(a) && Buffer.isBuffer(b) && a.equals(b);

test('molde/hooks/lib/sello.cjs es idéntica byte a byte a lib/sello.cjs, y se alcanza sola', () => {
  const par = path.join(MOLDE_LIB, 'sello.cjs');
  assert.ok(fs.existsSync(par), 'no encuentro kit/molde/hooks/lib/sello.cjs');
  const nuestra = fs.readFileSync(path.join(LIB, 'sello.cjs'));
  assert.ok(identicas(nuestra, fs.readFileSync(par)), 'kit/molde/hooks/lib/sello.cjs se desvió de la del Arquitecto — volvé a copiarla byte a byte desde lib/sello.cjs');
  const deMolde = requiresDe(par);
  assert.deepEqual(deMolde.filter((r) => !/^(node:)?[a-z_]+$/.test(r)), [], 'la copia del molde tiene que usar solo módulos de node');
  // Un byte cambiado en cualquiera de las dos → distintas (lo que haría rojo la prueba de arriba).
  for (const i of [0, Math.floor(nuestra.length / 2), nuestra.length - 1]) {
    const otra = Buffer.from(nuestra);
    otra[i] ^= 0x01;
    assert.ok(!identicas(nuestra, otra), `el byte ${i}`);
  }
  assert.ok(!identicas(nuestra, nuestra.subarray(0, nuestra.length - 1)), 'un byte de menos');
});

test('lib/ se alcanza sola, y sello.cjs usa solo node estándar', () => {
  for (const f of fs.readdirSync(LIB).filter((x) => x.endsWith('.cjs') && !x.endsWith('.test.cjs'))) {
    for (const r of requiresDe(path.join(LIB, f))) {
      if (!r.startsWith('.')) continue;
      const destino = path.resolve(LIB, r);
      assert.equal(path.dirname(destino), LIB, `lib/${f} pide ${r}, que sale de lib/`);
      assert.ok(fs.existsSync(destino), `lib/${f} pide ${r}, que no está`);
    }
  }
  const deSello = requiresDe(path.join(LIB, 'sello.cjs'));
  assert.deepEqual(deSello.filter((r) => !/^(node:)?[a-z_]+$/.test(r)), [], 'sello.cjs tiene que usar solo módulos de node');
});
