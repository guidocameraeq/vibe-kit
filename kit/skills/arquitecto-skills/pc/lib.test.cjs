'use strict';
// lib.test.cjs — la prueba anti-desvío (SPEC-paquete-3 D-12, criterio 13): cada archivo de pc/lib/ tiene que ser IDÉNTICO
// byte a byte a su par de kit/molde/hooks/lib/, y pc/lib/ tiene que alcanzarse sola (todo require relativo de una copia, y de
// secretos.cjs, cae adentro de pc/lib/). Sin excepciones: agente.cjs también es la del molde (la escribió G3).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const PC_LIB = path.join(__dirname, 'lib');
// pc/ -> arquitecto-skills -> skills -> kit ; de ahí a molde/hooks/lib
const KIT = path.resolve(__dirname, '..', '..', '..');
const MOLDE_LIB = path.join(KIT, 'molde', 'hooks', 'lib');

const copias = () => fs.readdirSync(PC_LIB).filter((f) => f.endsWith('.cjs') && !f.endsWith('.test.cjs'));
const requiresDe = (archivo) =>
  [...fs.readFileSync(archivo, 'utf8').matchAll(/require\(\s*['"]([^'"]+)['"]\s*\)/g)].map((m) => m[1]);

test('pc/lib: cada copia es idéntica byte a byte a su par del molde', () => {
  const lista = copias();
  assert.ok(lista.length >= 7, `pc/lib tiene pocas copias: ${lista.join(', ')}`);
  for (const f of lista) {
    const par = path.join(MOLDE_LIB, f);
    assert.ok(fs.existsSync(par), `pc/lib/${f} no tiene par en molde/hooks/lib — pc/lib solo trae copias`);
    assert.ok(fs.readFileSync(path.join(PC_LIB, f)).equals(fs.readFileSync(par)), `pc/lib/${f} se desvió de molde/hooks/lib/${f} — volvé a copiarla byte a byte`);
  }
});

test('pc/lib: trae las que secretos.cjs necesita (agente, comando, contexto, ficha, frenos-log, git, zona-propia)', () => {
  const lista = copias();
  for (const f of ['agente.cjs', 'comando.cjs', 'contexto.cjs', 'ficha.cjs', 'frenos-log.cjs', 'git.cjs', 'zona-propia.cjs']) {
    assert.ok(lista.includes(f), `falta pc/lib/${f}`);
  }
});

test('pc/lib se alcanza sola: cada require relativo de una copia cae en otra copia', () => {
  const lista = copias();
  for (const f of lista) {
    for (const r of requiresDe(path.join(PC_LIB, f))) {
      if (!r.startsWith('.')) continue;
      const destino = path.resolve(PC_LIB, r);
      assert.equal(path.dirname(destino), PC_LIB, `pc/lib/${f} hace require("${r}") fuera de pc/lib`);
      assert.ok(lista.includes(path.basename(destino)), `pc/lib/${f} necesita ${path.basename(destino)} y no está copiada`);
    }
  }
});

test('secretos.cjs nunca hace require fuera de ./lib/, y cada uno existe', () => {
  for (const r of requiresDe(path.join(__dirname, 'secretos.cjs'))) {
    if (!r.startsWith('.')) continue;
    assert.ok(r.startsWith('./lib/'), `require("${r}") sale de ./lib/ — está prohibido (D-12)`);
    assert.ok(fs.existsSync(path.join(__dirname, r)), `require("${r}") no existe`);
  }
});
