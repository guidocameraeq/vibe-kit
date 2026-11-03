'use strict';
// cubiertos.test.cjs — el lector único de kit/cubiertos.md (SPEC-paquete-7 P6.8b-1, D7-2; RF-fix rf-1). Corre con:
//   node --test kit/skills/arquitecto-skills/scripts/lib/cubiertos.test.cjs
// La primera prueba valida el kit/cubiertos.md REAL del repo: si alguien le pega una entrada mala, da rojo antes del tag.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const CU = require('./cubiertos.cjs');
const C = require('./catalogo.cjs');

const REAL = path.resolve(__dirname, '..', '..', '..', '..', 'cubiertos.md'); // kit/cubiertos.md (solo existe en el kit, no instalado)
const hayReal = fs.existsSync(REAL);
const T = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-cubiertos-test-'));
test.after(() => fs.rmSync(T, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }));

const doc = (...renglones) => ['---', 'cubiertos:', ...renglones.map((r) => `  - ${r}`), '---', ''].join('\n');

test('el kit/cubiertos.md real: se lee entero, sin ninguna entrada mala, y cada pieza existe en el catálogo', { skip: !hayReal && 'sin kit/cubiertos.md' }, () => {
  const r = CU.leer(REAL);
  assert.equal(r.problema, undefined, `kit/cubiertos.md: ${r.problema}`);
  assert.deepEqual(r.malas.map(CU.lineaMala), [], 'una entrada mala: arreglala antes del tag');
  const piezas = new Set(C.CATALOGOS['3'].map((p) => p.id));
  for (const e of r.entradas) assert.ok(piezas.has(e.pieza), `pieza: ${e.pieza} no está en el catálogo 3`);
  const citas = r.entradas.map((e) => e.cita);
  assert.equal(new Set(citas).size, citas.length, 'una cita, una sola vez');
});

test('validar: la forma {cita, version, pieza}; cada mala se saltea con su motivo y las demás valen', () => {
  const r = CU.validar(doc(
    '{cita: "alfa 2026-10-30-x", version: 3.0.0, pieza: cierre}',
    '{cita: "alfa 2026-10-30-y", version: 3.0.0}',
    '{cita: "alfa 2026-10-30-z", version: N.N.N, pieza: <id de la pieza>}',
    '{cita: "Alfa x", version: 3.0.0, pieza: cierre}',
    '{cita: "alfa x", version: 3.0.0, pieza: <id>}',
    '{cita: "alfa x", version: 3.0.0, pieza: cierre, por: "y"}',
    '{cita: "beta 2026-10-01-w", version: 2.10.0, pieza: inicio}',
  ));
  assert.deepEqual(r.entradas, [
    { cita: 'alfa 2026-10-30-x', version: '3.0.0', pieza: 'cierre' },
    { cita: 'beta 2026-10-01-w', version: '2.10.0', pieza: 'inicio' },
  ]);
  assert.deepEqual(r.malas, [
    { n: 2, motivo: 'le falta pieza:' },
    { n: 3, motivo: 'version: no es N.N.N' },
    { n: 4, motivo: 'cita: no tiene la forma "<alias> <id>"' },
    { n: 5, motivo: 'pieza: no es un id del catálogo' },
    { n: 6, motivo: 'le sobra por:' },
  ]);
  assert.equal(CU.lineaMala(r.malas[0]), 'la entrada 2 no es {cita: "<alias> <id>", version: N.N.N, pieza: <id>} (le falta pieza:): la salteo, las demás valen');
});

test('validar/leer: el archivo entero solo no vale si no se lee, no trae la lista o no está', () => {
  assert.deepEqual(CU.validar('---\ncubiertos: []\n---\n'), { entradas: [], malas: [] });
  assert.equal(CU.validar('---\notra: cosa\n---\n').problema, 'no tiene la lista cubiertos:');
  assert.match(CU.validar(doc('suelto')).problema, /^no se lee \(/, 'un renglón que la gramática no acepta: el archivo entero no se lee');
  assert.equal(CU.leer(path.join(T, 'no-esta.md')).problema, 'no está');
  // CRLF y BOM: igual
  assert.equal(CU.validar(`﻿${doc('{cita: "a b", version: 1.0.0, pieza: x}').replace(/\n/g, '\r\n')}`).entradas.length, 1);
});

test('buscar: <dir>/kit/cubiertos.md primero, si no <dir>/cubiertos.md; ninguno → null', () => {
  const raiz = fs.mkdtempSync(path.join(T, 'raiz-'));
  assert.equal(CU.buscar(raiz), null);
  fs.writeFileSync(path.join(raiz, 'cubiertos.md'), 'b');
  assert.equal(CU.buscar(raiz), path.join(raiz, 'cubiertos.md'));
  fs.mkdirSync(path.join(raiz, 'kit'));
  fs.writeFileSync(path.join(raiz, 'kit', 'cubiertos.md'), 'a');
  assert.equal(CU.buscar(raiz), path.join(raiz, 'kit', 'cubiertos.md'));
});

test('cubre: por cualquiera de las claves, con version ≤ la dada (numérica)', () => {
  const es = [{ cita: 'a 1', version: '2.10.0', pieza: 'p' }, { cita: 'b 2', version: '10.0.0', pieza: 'p' }];
  assert.equal(CU.cubre(es, [null, 'a 1'], '3.0.0'), es[0]);
  assert.equal(CU.cubre(es, ['b 2'], '3.0.0'), undefined);
  assert.equal(CU.cubre(es, ['b 2'], '10.0.0'), es[1]);
  assert.equal(CU.cubre(es, ['c 3'], '99.0.0'), undefined);
});
