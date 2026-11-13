'use strict';
// habla.test.cjs — lo que los scripts le dicen al dueño (SPEC-paquete-8d B6, crit. 23; 34, 33; D8d-B13): en los textos de
// M/scripts/** que le llegan a él (estado, noche, tiempos, portada, resumen, worktree, todo…) y de las librerías que la A le dejó a
// la B (lib/encargo, proceso, inyeccion, topes) no aparece "guido" como palabra ni "rojo/roja/verde". Lo que es entre sesiones y
// scripts se queda (`encargo.cjs` presentar y verificar, `paquete.cjs`: los lee el director o el obrero); `cambios.cjs` es de la A.
// Se permiten: el alias viejo `--ok-de-guido` (valida para siempre en la v3: D8d-11), el valor `con-gate-verde` (lo lee un script:
// D8d-12) y la regla misma ("nunca rojo ni verde"). Los comentarios se quedan (citan la cicatriz: D8d-13).
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const habla = require('../../habla.cjs');

const MOLDE = path.resolve(__dirname, '..');
const ENTRE_SESIONES = new Set(['encargo.cjs', 'paquete.cjs', 'cambios.cjs']);
const PERMITIDO = (t) => /--ok-de-guido|con-gate-verde|nunca rojo ni verde/.test(t);

test('B6 (crit. 23): los scripts que le llegan al dueño y las librerías de la B no dicen "guido" ni "rojo/verde"', () => {
  const lista = [
    ...habla.archivos(path.join(MOLDE, 'scripts')).filter((a) => !ENTRE_SESIONES.has(path.basename(a))),
    ...['encargo', 'proceso', 'inyeccion', 'topes'].map((n) => path.join(MOLDE, 'hooks', 'lib', `${n}.cjs`)),
  ];
  assert.ok(lista.length > 15, `pocos archivos: ${lista.length}`);
  for (const n of ['estado.cjs', 'noche.cjs', 'worktree.cjs', 'resumen.cjs', 'tiempos.cjs']) {
    assert.ok(lista.some((a) => path.basename(a) === n), `falta ${n}`);
  }
  const malos = habla.revisar(lista).filter((h) => !PERMITIDO(h.texto));
  assert.deepEqual(malos.map((h) => `${path.relative(MOLDE, h.archivo)}: ${h.palabra} — ${h.texto}`), []);
});
