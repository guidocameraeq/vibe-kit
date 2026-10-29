'use strict';
// lib.test.cjs — la prueba anti-desvío (SPEC-paquete-3 D-12, criterio 13): cada archivo de pc/lib/ tiene que ser IDÉNTICO
// byte a byte a su par de kit/molde/hooks/lib/. agente.cjs es la excepción documentada: su par lo escribe G3 y todavía no está
// en main; mientras no esté, esta prueba lo reporta como `todo` (no falla). El director, al integrar la versión de G3, pisa
// pc/lib/agente.cjs con ella y esta prueba pasa a exigir la igualdad también ahí.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const PC_LIB = __dirname + path.sep + 'lib';
// pc/ -> arquitecto-skills -> skills -> kit ; de ahí a molde/hooks/lib
const KIT = path.resolve(__dirname, '..', '..', '..');
const MOLDE_LIB = path.join(KIT, 'molde', 'hooks', 'lib');

test('pc/lib: cada copia es idéntica byte a byte a su par del molde', () => {
  const copias = fs.readdirSync(PC_LIB).filter((f) => f.endsWith('.cjs') && !f.endsWith('.test.cjs'));
  assert.ok(copias.length >= 6, `pc/lib tiene pocas copias: ${copias.join(', ')}`);
  const pendientes = [];
  for (const f of copias) {
    const par = path.join(MOLDE_LIB, f);
    if (!fs.existsSync(par)) {
      // agente.cjs aún no tiene par en el molde (lo escribe G3): se reporta, no se falla.
      assert.equal(f, 'agente.cjs', `${f} no tiene par en el molde y no es la excepción conocida (agente.cjs)`);
      pendientes.push(f);
      continue;
    }
    const a = fs.readFileSync(path.join(PC_LIB, f));
    const b = fs.readFileSync(par);
    assert.ok(a.equals(b), `pc/lib/${f} se desvió de molde/hooks/lib/${f} — volvé a copiarla byte a byte`);
  }
  if (pendientes.length) {
    // eslint-disable-next-line no-console
    console.log(`  [todo] sin par en el molde todavía (los escribe otro encargo): ${pendientes.join(', ')}`);
  }
});

test('secretos.cjs nunca hace require fuera de ./lib/', () => {
  const txt = fs.readFileSync(path.join(__dirname, 'secretos.cjs'), 'utf8');
  const reqs = [...txt.matchAll(/require\(\s*['"]([^'"]+)['"]\s*\)/g)].map((m) => m[1]);
  for (const r of reqs) {
    const ok = !r.startsWith('.') || r.startsWith('./lib/');
    assert.ok(ok, `require("${r}") sale de ./lib/ — está prohibido (D-12)`);
  }
});
