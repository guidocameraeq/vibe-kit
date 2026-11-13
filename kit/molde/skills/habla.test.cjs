'use strict';
// habla.test.cjs — lo que las skills que corre el dueño le dicen a él (SPEC-paquete-8d B6, crit. 23; 34, 33; D8d-B13): `/estado`,
// `/inicio`, `/cierre` y las instrucciones de la sesión de cierre de noche (`director/cierre-noche.md`, que escribe el parte) no
// dicen "guido" ni "rojo/roja/verde", salvo la regla misma ("nunca rojo ni verde"). El núcleo, `/director`, `/obrero` y `/tramo`
// son entre sesiones (el gate, "la prueba en rojo primero"): se quedan.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const habla = require('../../habla.cjs');

const DIR = __dirname;
const DEL_DUENO = ['estado/SKILL.md', 'inicio/SKILL.md', 'cierre/SKILL.md', 'director/cierre-noche.md'];
const LA_REGLA = (t) => /nunca rojo ni verde|"rojo" o "verde"/.test(t);

test('B6 (crit. 23): las skills que corre el dueño no le dicen "guido" ni "rojo/verde"', () => {
  const lista = DEL_DUENO.map((r) => path.join(DIR, ...r.split('/')));
  const malos = habla.revisar(lista).filter((h) => !LA_REGLA(h.texto));
  assert.deepEqual(malos.map((h) => `${path.relative(DIR, h.archivo)}: ${h.palabra} — ${h.texto}`), []);
});
