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

// Revisor frío de B (11), en la C: lo que estas skills le hacen decir al dueño (lo de *"…"*) no trae comandos ("corré `…`",
// `node`/`git`) ni SHAs, y el reporte del /cierre no le muestra el SHA (D8d-B36).
const HEX = /\b(?=[0-9a-f]*\d)(?=[0-9a-f]*[a-f])[0-9a-f]{7,40}\b/;
test('revisor de B (11): lo que se le dice al dueño no trae SHAs ni comandos para correr', () => {
  const malos = [];
  for (const r of DEL_DUENO) {
    const t = require('fs').readFileSync(path.join(DIR, ...r.split('/')), 'utf8');
    for (const m of t.matchAll(/\*"([^"]+)"\*/g)) {
      if (/corr[eé]\b|`(?:node|git) |\bnode \.claude/i.test(m[1]) || HEX.test(m[1])) malos.push(`${r}: ${m[1]}`);
    }
    for (const l of t.split('\n')) if (/\bSHA\b/.test(l) || HEX.test(l)) malos.push(`${r}: ${l.slice(0, 120)}`);
  }
  assert.deepEqual(malos, []);
});
