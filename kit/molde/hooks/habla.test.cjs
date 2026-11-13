'use strict';
// habla.test.cjs — lo que los frenos le dicen a quien usa el kit (SPEC-paquete-8d A8, crit. 23; R10, R21, 34): en los textos de
// M/hooks/**, M/githooks/**, S/cambios.cjs y PC/** no aparece "guido" como palabra ni "rojo/roja/verde", salvo los alias viejos de A1
// (que validan para siempre en la v3: D8d-11). Los comentarios se quedan (citan la cicatriz: D8d-13).
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const habla = require('../../habla.cjs');

const KIT = path.resolve(__dirname, '..', '..');
const ALIAS_VIEJOS = ['con-ok-de-guido', 'necesita-guido'];
// Los textos que son esos alias (o los nombran, en un mensaje de la ficha que los acepta).
const esAlias = (t) => ALIAS_VIEJOS.some((a) => t.includes(a)) && !/\bguido\b/i.test(t.split(/con-ok-de-guido|necesita-guido/).join(''));

test('la ayuda: saca los literales sin los comentarios, y encuentra las palabras', () => {
  const lits = habla.literales("// Guido dijo\nconst a = 'hola'; /* rojo */ const b = \"en verde\"; const c = `x ${'y'}`; const r = /'no'/;\n");
  assert.deepEqual(lits, ['hola', 'en verde', 'x ${}']); // lo de adentro de ${…} es código
  assert.deepEqual(habla.palabras('Lo hace Guido · ROJO · verdes · verdura'), ['guido', 'rojo', 'verdes']);
});

test('crit. 23 (A8): los hooks, los githooks, el script de cambios y la PC no dicen "guido" ni "rojo/verde"', () => {
  const lista = [
    ...habla.archivos(path.join(KIT, 'molde', 'hooks')),
    ...habla.archivos(path.join(KIT, 'molde', 'githooks')),
    path.join(KIT, 'molde', 'scripts', 'cambios.cjs'),
    ...habla.archivos(path.join(KIT, 'skills', 'arquitecto-skills', 'pc')),
  ];
  assert.ok(lista.length > 20, `pocos archivos: ${lista.length}`);
  // Las librerías que el spec le da a la tanda B (B4 encargo, B5 proceso, B6 inyeccion y topes) las limpia y las prueba la B;
  // `con-gate-verde` es un valor que lee un script (D8d-12).
  const DE_LA_B = /[\\/]lib[\\/](?:encargo|proceso|inyeccion|topes)\.cjs$/;
  const malos = habla.revisar(lista.filter((a) => !DE_LA_B.test(a))).filter((h) => !esAlias(h.texto) && !/con-gate-verde/.test(h.texto));
  assert.deepEqual(malos.map((h) => `${path.relative(KIT, h.archivo)}: ${h.palabra} — ${h.texto}`), []);
});
