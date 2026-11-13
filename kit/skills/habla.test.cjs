'use strict';
// habla.test.cjs — lo que el Equipador y el Arquitecto le dicen al dueño (SPEC-paquete-8d C4, R21, 51; crit. 23). Dos reglas:
//   1. cero "guido" en todo lo que se instala de las dos skills (.md y los textos de los .cjs/.sh/.ps1), salvo los alias viejos de
//      la ficha (`con-ok-de-guido`, `necesita-guido`, `--ok-de-guido`: validan para siempre en la v3) — la URL del repo canónico
//      (`guidocameraeq`) no es la palabra;
//   2. cero rojo/verde en lo que ve el dueño: la tabla de la flota (flota.cjs, y chequeo.cjs, cuyas líneas van a esa tabla), la
//      pantalla de la adopción (adoptar.cjs) y el doctor. Entre sesiones (los anexos, "la prueba en rojo primero") se queda.
// La tercera de las habla.test (A8 en molde/hooks, B6 en molde/scripts y molde/skills).
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const habla = require('../habla.cjs');

const DIR = __dirname;
const EQ = path.join(DIR, 'arquitecto-skills');
const AR = path.join(DIR, 'arquitecto');
const ALIAS = /(?:--)?con-ok-de-guido|--ok-de-guido|necesita-guido/gi;
const rel = (a) => path.relative(DIR, a).split(path.sep).join('/');

test('C4 (R21): el Equipador y el Arquitecto no dicen "guido" (salvo los alias viejos de la ficha)', () => {
  const malos = [];
  for (const a of [...habla.archivos(EQ), ...habla.archivos(AR)]) {
    for (const t of habla.textos(a)) {
      if (/\bguido\b/i.test(t.replace(ALIAS, ''))) malos.push(`${rel(a)}: ${t.length > 140 ? `${t.slice(0, 137)}…` : t}`);
    }
  }
  assert.deepEqual(malos, []);
});

test('C4 (51): la tabla de la flota, la pantalla de la adopción y el doctor no dicen rojo ni verde', () => {
  const lista = ['scripts/lib/flota.cjs', 'scripts/lib/chequeo.cjs', 'scripts/lib/adoptar.cjs', 'scripts/doctor.cjs'].map((r) => path.join(EQ, ...r.split('/')));
  const malos = habla.revisar(lista).filter((h) => h.palabra !== 'guido');
  assert.deepEqual(malos.map((h) => `${rel(h.archivo)}: ${h.palabra} — ${h.texto}`), []);
});
