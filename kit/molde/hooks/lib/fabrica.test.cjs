'use strict';
// Pruebas de fabrica.cjs y de las fichas de fábrica. Corren con: node --test "kit/**/*.test.cjs"
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { NIVELES, fabrica } = require('./fabrica.cjs');
const { leerArchivo } = require('./ficha.cjs');

const CARPETA = path.join(__dirname, 'fabrica');
const SENSIBLE_NO = { 'datos-reales': 'no', plata: 'no', 'sale-afuera': 'no', claves: 'no', release: 'no' };

test('NIVELES: liviano y estandar, y no se puede cambiar', () => {
  assert.deepStrictEqual([...NIVELES], ['liviano', 'estandar']);
  assert.ok(Object.isFrozen(NIVELES));
});

test('las dos fichas de fábrica las acepta ficha.leer, sin avisos, y cada una dice su nivel y la versión del kit', () => {
  for (const n of NIVELES) {
    const r = leerArchivo(path.join(CARPETA, `ficha.${n}.md`));
    assert.deepStrictEqual(r.avisos, [], n);
    assert.equal(r.datos.nivel, n);
    assert.equal(r.datos.kit, '2.4.3');
  }
});

test('las fichas de fábrica traen su cabecera de una línea', () => {
  for (const n of NIVELES) {
    const t = fs.readFileSync(path.join(CARPETA, `ficha.${n}.md`), 'utf8');
    assert.ok(t.includes(`# Ficha de fábrica del nivel ${n}: lo que trae un proyecto recién montado. La compara candado:barreras (exención b)\n`), n);
  }
});

test('liviano: merge y producción libres, sin frenos tocados, sensible en no', () => {
  assert.deepStrictEqual(fabrica('liviano'), {
    frenos: { opcionales: [], quitados: [] },
    sensible: SENSIBLE_NO,
    autorizado: { 'merge-a-main': 'libre', 'escribir-produccion': 'libre' },
  });
});

test('estandar: merge con el gate verde, producción por comando con foto, sin frenos tocados, sensible en no', () => {
  assert.deepStrictEqual(fabrica('estandar'), {
    frenos: { opcionales: [], quitados: [] },
    sensible: SENSIBLE_NO,
    autorizado: { 'merge-a-main': 'con-gate-verde', 'escribir-produccion': 'por-comando-con-foto' },
  });
});

test('fabrica devuelve solo los tres campos', () => {
  for (const n of NIVELES) assert.deepStrictEqual(Object.keys(fabrica(n)), ['frenos', 'sensible', 'autorizado']);
});

test('fabrica lee de nuevo cada vez: lo que un llamador cambie no se filtra a la siguiente lectura', () => {
  const a = fabrica('estandar');
  a.autorizado['merge-a-main'] = 'libre';
  a.frenos.quitados.push({ id: 'x' });
  assert.equal(fabrica('estandar').autorizado['merge-a-main'], 'con-gate-verde');
  assert.deepStrictEqual(fabrica('estandar').frenos.quitados, []);
});

test('nivel desconocido: error claro que lista los que hay y no repite lo que se pidió', () => {
  for (const malo of ['grande', '', undefined, null, 3, '../liviano', 'Liviano', 'liviano ']) {
    assert.throws(() => fabrica(malo), (e) => e instanceof Error && /nivel desconocido — los que hay son: liviano, estandar/.test(e.message) && !/grande/.test(e.message), String(malo));
  }
});

test('un nivel desconocido falla aunque exista un archivo con ese nombre en la carpeta', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fabrica-'));
  fs.copyFileSync(path.join(CARPETA, 'ficha.liviano.md'), path.join(dir, 'ficha.grande.md'));
  assert.throws(() => fabrica('grande', dir), /nivel desconocido/);
});

test('con carpeta, lee las fichas de otro árbol', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fabrica-'));
  const otra = fs.readFileSync(path.join(CARPETA, 'ficha.liviano.md'), 'utf8').replace('merge-a-main: libre', 'merge-a-main: con-gate-verde');
  fs.writeFileSync(path.join(dir, 'ficha.liviano.md'), otra);
  assert.equal(fabrica('liviano', dir).autorizado['merge-a-main'], 'con-gate-verde');
  assert.equal(fabrica('liviano').autorizado['merge-a-main'], 'libre');
});

test('con carpeta sin la ficha: el error es el del archivo que falta (no se inventa una de fábrica)', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fabrica-'));
  assert.throws(() => fabrica('estandar', dir), (e) => e.code === 'ENOENT');
});

test('con carpeta y una ficha rota: ErrorFicha con su línea', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fabrica-'));
  fs.writeFileSync(path.join(dir, 'ficha.estandar.md'), "---\nkit: 2.4.3\nnivel: estandar\nvars:\n  proyecto: x\nautorizado: 'x'\n---\n");
  assert.throws(() => fabrica('estandar', dir), (e) => e.name === 'ErrorFicha' && e.linea === 6);
});

test('con carpeta y una ficha que la gramática acepta pero la ficha no (sin kit:): falla, porque se lee con ficha.leer', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fabrica-'));
  fs.writeFileSync(path.join(dir, 'ficha.liviano.md'), '---\nnivel: liviano\nautorizado:\n  merge-a-main: libre\n---\n');
  assert.throws(() => fabrica('liviano', dir), (e) => e.name === 'ErrorFicha' && /falta "kit"/.test(e.mensaje));
});
