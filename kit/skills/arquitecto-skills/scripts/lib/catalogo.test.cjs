'use strict';
// catalogo.test.cjs — el catálogo pieza → archivos (SPEC-paquete-6 P7.1, D6-5; criterio 10: una ruta del molde sin pieza → rojo).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const C = require('./catalogo.cjs');

const MOLDE = path.resolve(__dirname, '..', '..', '..', '..', 'molde'); // kit/molde/ (solo existe en el kit, no instalado)
const hayMolde = fs.existsSync(path.join(MOLDE, 'settings.json'));

test('toda ruta de kit/molde/ (sin *.test.cjs) cae en una pieza: nada se reparte sin dueño', { skip: !hayMolde && 'sin kit/molde/' }, () => {
  const rutas = C.rutasDeMolde(MOLDE);
  assert.ok(rutas.length > 50);
  assert.ok(!rutas.some((r) => r.endsWith('.test.cjs')), 'las pruebas no viajan');
  assert.deepEqual(C.sinDueno('3', rutas), []);
  const rep = C.repartir('3', rutas);
  const total = [...rep.values()].reduce((s, x) => s + x.archivos.length, 0);
  assert.equal(total, rutas.length, 'cada ruta, en una sola pieza');
});

test('una ruta del molde sin pieza → rojo (sinDueno la nombra y repartir tira)', () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-catalogo-'));
  try {
    for (const r of ['settings.json', 'hooks/session-start.cjs', 'hooks/raro.cjs', 'otra/cosa.md', 'hooks/raro.test.cjs']) {
      fs.mkdirSync(path.dirname(path.join(d, r)), { recursive: true });
      fs.writeFileSync(path.join(d, r), 'x');
    }
    const rutas = C.rutasDeMolde(d);
    assert.deepEqual(rutas, ['hooks/raro.cjs', 'hooks/session-start.cjs', 'otra/cosa.md', 'settings.json']);
    assert.deepEqual(C.sinDueno('3', rutas), ['hooks/raro.cjs', 'otra/cosa.md']);
    assert.throws(() => C.repartir('3', rutas), /sin pieza en el catálogo: hooks\/raro\.cjs, otra\/cosa\.md/);
    assert.deepEqual(C.sinDueno('3', ['hooks/session-start.cjs', 'settings.json']), []);
  } finally {
    fs.rmSync(d, { recursive: true, force: true });
  }
});

test('las base del delta están y son base; las opcionales, opcionales; docs solo nace (r1-2)', () => {
  const p3 = new Map(C.piezasDe('3').map((p) => [p.id, p]));
  for (const id of ['hook-arranque', 'hook-escritura', 'candado', 'settings', 'inicio', 'cierre', 'cambios-metodo', 'hook-git-seguro', 'hook-sensible', 'githooks', 'hooks-lib', 'docs']) {
    assert.equal(p3.get(id).clase, C.BASE, id);
  }
  for (const id of ['director-obrero', 'estado', 'smoke', 'release', 'docs-fyd']) assert.equal(p3.get(id).clase, C.OPCIONAL, id);
  assert.equal(p3.get('docs').trato, 'nacimiento');
  assert.equal(p3.get('claude-md').trato, 'nunca');
  assert.equal(p3.get('settings').forma, 'settings');
  assert.equal(p3.get('hook-arranque').forma, 'hook');
  assert.equal(p3.get('inicio').forma, 'texto');
  // las bajas de v2: check-code y session-start.sh están en 2.4 y no en 3
  assert.ok(C.piezaDeRuta('2.4', 'hooks/check-code.js'));
  assert.equal(C.piezaDeRuta('3', 'hooks/check-code.js'), null);
  assert.equal(C.piezaDeRuta('2.4', 'hooks/session-start.sh').id, 'hook-arranque');
  assert.equal(C.piezaDeRuta('3', 'hooks/session-start.sh'), null);
  assert.throws(() => C.piezasDe('2.1'), /no conozco el molde/);
});

test('las rutas del proyecto: la forma de kit/molde/ al derecho (la misma que rutaEnMolde de barreras, al revés)', () => {
  const casos = {
    'hooks/session-start.cjs': '.claude/hooks/session-start.cjs',
    'hooks/lib/fabrica/ficha.estandar.md': '.claude/hooks/lib/fabrica/ficha.estandar.md',
    'scripts/estructura.cjs': '.claude/scripts/estructura.cjs',
    'skills/inicio/SKILL.md': '.claude/skills/inicio/SKILL.md',
    'agents/revisor.md': '.claude/agents/revisor.md',
    'githooks/pre-commit': '.githooks/pre-commit',
    'docs/referencia/trampas.md': 'docs/referencia/trampas.md',
    'settings.json': '.claude/settings.json',
    'CLAUDE.md': 'CLAUDE.md',
    'rituales/smoke.md': '.claude/skills/smoke/SKILL.md',
    'gitignore.snippet': '.gitignore',
    'kit.ejemplo.md': null,
  };
  for (const [m, p] of Object.entries(casos)) assert.equal(C.rutaEnProyecto(m), p, m);
  assert.equal(C.piezaDeRuta('3', 'scripts/estructura.cjs').id, 'candado', 'la regla exacta gana a la de la carpeta');
  assert.equal(C.piezaDeRuta('3', 'scripts/cambios.cjs').id, 'cambios-metodo');
  assert.equal(C.piezaDeRuta('3', 'scripts/todo.cjs').id, 'scripts');
  assert.equal(C.piezaDeRuta('3', 'hooks/lib/barreras.cjs').id, 'hooks-lib');
  assert.equal(C.piezaDeRuta('3', 'agents/revisor.md').id, 'director-obrero');
});
