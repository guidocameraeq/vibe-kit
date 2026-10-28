'use strict';
// Pruebas de topes.cjs. Corren con: node --test "kit/**/*.test.cjs"
const test = require('node:test');
const assert = require('node:assert/strict');
const T = require('./topes.cjs');
const { revisarHandoff } = T;

// Un handoff que cumple, con las siete secciones en orden. `extra` va al final de Contexto.
const handoff = (o = {}) => {
  const s = {
    titulo: '# Handoff — ejemplo',
    estado: '## Estado (hace 2 días)\n- Rama · entorno: main · local\n- Producción: andando · 2026-10-27 · smoke verde',
    proximo: '## Próximo paso concreto\nCorrer el smoke.',
    bloqueos: '## Bloqueos\n- ninguno',
    espera: '## Te espera\n- nada',
    curso: '## En curso\n- nada',
    contexto: '## Contexto que no está en otro doc\n- nada',
    ...o,
  };
  return [s.titulo, '', s.estado, '', s.proximo, '', s.bloqueos, '', s.espera, '', s.curso, '', s.contexto, ''].filter((x) => x !== null).join('\n') + (o.extra || '');
};
const tipos = (f) => f.map((x) => x.tipo);

// ---------------------------------------------------------------- los números

test('los números del delta, una sola vez', () => {
  assert.equal(T.PRESUPUESTO, 9700);
  assert.equal(T.CORTE, 10000);
  assert.deepEqual({ ...T.BLOQUES }, {
    cabecera: 250,
    lineasF: 500,
    edades: 100,
    handoff: 5000,
    modulos: 300,
    cabeceraFichaModulo: 1000,
    cabeceraTodo: 1500,
    git: 800,
    titulosYHuella: 250,
  });
  assert.equal(Object.values(T.BLOQUES).reduce((a, b) => a + b, 0), T.PRESUPUESTO, 'los bloques suman el presupuesto');
  assert.equal(T.HANDOFF_BYTES, 5000);
  assert.equal(T.FICHA_ACTIVA_BYTES, 5000);
  assert.equal(T.MAPA_BYTES, 5000);
  assert.equal(T.MESA_BYTES, 2000);
  assert.ok(Object.isFrozen(T.BLOQUES));
  assert.equal(T.revisarTopes, undefined, 'revisarTopes es de E4');
});

test('las secciones del handoff, en orden', () => {
  assert.deepEqual([...T.SECCIONES_HANDOFF], ['# Handoff', '## Estado', '## Próximo paso', '## Bloqueos', '## Te espera', '## En curso', '## Contexto']);
});

// ---------------------------------------------------------------- revisarHandoff: pasa

test('un handoff que cumple pasa en los dos niveles', () => {
  assert.deepEqual(revisarHandoff(handoff(), 'estandar'), []);
  assert.deepEqual(revisarHandoff(handoff(), 'liviano'), []);
});

test('en liviano (o sin nivel) Producción no hace falta', () => {
  const h = handoff({ estado: '## Estado\n- Rama · entorno: main · local' });
  assert.deepEqual(revisarHandoff(h, 'liviano'), []);
  assert.deepEqual(revisarHandoff(h, undefined), []);
});

test('Producción acepta REPORTADO POR EL USUARIO y no hay', () => {
  for (const p of ['REPORTADO POR EL USUARIO', 'no hay']) {
    assert.deepEqual(revisarHandoff(handoff({ estado: `## Estado\n- Producción: ${p}` }), 'estandar'), []);
  }
});

test('BOM, CRLF y tildes descompuestas (NFD) dan lo mismo', () => {
  const h = '\uFEFF' + handoff().replace(/\n/g, '\r\n');
  assert.deepEqual(revisarHandoff(h, 'estandar'), []);
  assert.deepEqual(revisarHandoff(handoff().normalize('NFD'), 'estandar'), []);
});

test('acepta un Buffer', () => {
  assert.deepEqual(revisarHandoff(Buffer.from(handoff(), 'utf8'), 'estandar'), []);
});

// ---------------------------------------------------------------- tamaño

test('más de 5.000 bytes falla; justo 5.000 pasa', () => {
  const base = handoff();
  const relleno = (n) => handoff({ extra: 'x'.repeat(n - Buffer.byteLength(base)) });
  assert.equal(Buffer.byteLength(relleno(5000)), 5000);
  assert.deepEqual(revisarHandoff(relleno(5000), 'estandar'), []);
  const f = revisarHandoff(relleno(5001), 'estandar');
  assert.deepEqual(tipos(f), ['tamano']);
  assert.match(f[0].mensaje, /5001 bytes y el tope es 5000/);
});

test('el tope es en bytes, no en caracteres (las tildes pesan dos)', () => {
  const h = handoff({ extra: 'ñ'.repeat(2450) });
  assert.ok(h.length < 5000);
  assert.ok(Buffer.byteLength(h) > 5000);
  assert.deepEqual(tipos(revisarHandoff(h, 'liviano')), ['tamano']);
});

// ---------------------------------------------------------------- secciones

test('cada sección que falta, falla con su nombre', () => {
  const claves = ['titulo', 'estado', 'proximo', 'bloqueos', 'espera', 'curso', 'contexto'];
  claves.forEach((k, i) => {
    const f = revisarHandoff(handoff({ [k]: null }), 'liviano');
    assert.deepEqual(tipos(f), ['falta'], k);
    assert.ok(f[0].mensaje.includes(`"${T.SECCIONES_HANDOFF[i]}"`), k);
  });
});

test('desordenada falla', () => {
  const h = handoff({ proximo: '## Bloqueos\n- ninguno', bloqueos: '## Próximo paso\nalgo' });
  const f = revisarHandoff(h, 'liviano');
  assert.deepEqual(tipos(f), ['desordenada']);
  assert.match(f[0].mensaje, /"## Próximo paso" está después de "## Bloqueos"/);
  // El título del handoff al final también es desorden.
  const h2 = handoff({ titulo: null, extra: '# Handoff — tarde\n' });
  assert.deepEqual(tipos(revisarHandoff(h2, 'liviano')), ['desordenada']);
});

test('repetida falla', () => {
  const f = revisarHandoff(handoff({ extra: '## En curso\n- otra vez\n' }), 'liviano');
  assert.deepEqual(tipos(f), ['repetida']);
});

test('prohibidas: Qué se hizo, Archivos tocados y la línea Cierre:', () => {
  const casos = [
    '## Qué se hizo\n- cosas\n',
    '## Archivos tocados\n- a.js\n',
    '### Qué se hizo hoy\n',
    '**Cierre**: 2026-10-28 · abc123\n',
    'Cierre: 2026-10-28\n',
    '__Cierre__ : 2026-10-28\n',
  ];
  for (const c of casos) {
    const f = revisarHandoff(handoff({ extra: c }), 'liviano');
    assert.deepEqual(tipos(f), ['prohibida'], c);
  }
  // Arriba de todo, como en la plantilla v2: igual de prohibida.
  const v2 = handoff({ titulo: '# Handoff — x\n\n**Cierre**: hoy · abc' });
  assert.deepEqual(tipos(revisarHandoff(v2, 'liviano')), ['prohibida']);
});

test('los títulos se reconocen por el principio, sin confundirse con otra palabra ni otro nivel', () => {
  // "Próximo paso CONCRETO" y "Contexto que no está…" valen
  assert.deepEqual(revisarHandoff(handoff({ proximo: '## Próximo paso CONCRETO\nx' }), 'liviano'), []);
  assert.deepEqual(revisarHandoff(handoff({ estado: '## Estado: al 28/10\n- Producción: no hay' }), 'estandar'), []);
  // "## Estados" no es "## Estado"; "### Estado" tampoco; "# Handoffs" no es el título
  assert.deepEqual(tipos(revisarHandoff(handoff({ estado: '## Estados\n- x' }), 'liviano')), ['falta']);
  assert.deepEqual(tipos(revisarHandoff(handoff({ estado: '### Estado\n- x' }), 'liviano')), ['falta']);
  assert.deepEqual(tipos(revisarHandoff(handoff({ titulo: '# Handoffs — x' }), 'liviano')), ['falta']);
  assert.deepEqual(tipos(revisarHandoff(handoff({ titulo: '## Handoff — x' }), 'liviano')), ['falta']);
  // "Cierre" en medio de un renglón no es la línea prohibida; "Qué se hizo" como texto tampoco
  assert.deepEqual(revisarHandoff(handoff({ extra: '- el Cierre: lo hace /cierre\n- Qué se hizo: nada\n' }), 'liviano'), []);
});

test('lo de adentro de un bloque de código no cuenta', () => {
  const h = handoff({ extra: '```\n## Qué se hizo\nCierre: x\n## Estado\n```\n' });
  assert.deepEqual(revisarHandoff(h, 'estandar'), []);
});

// ---------------------------------------------------------------- Producción (estandar)

test('estandar sin "- Producción:" falla', () => {
  const f = revisarHandoff(handoff({ estado: '## Estado\n- Rama · entorno: main · local' }), 'estandar');
  assert.deepEqual(tipos(f), ['produccion']);
});

test('estandar: Producción fuera de ## Estado, vacía o mal escrita no cuenta', () => {
  const sinEnEstado = handoff({ estado: '## Estado\n- Rama · entorno: main', contexto: '## Contexto\n- Producción: andando · hoy · smoke' });
  assert.deepEqual(tipos(revisarHandoff(sinEnEstado, 'estandar')), ['produccion']);
  assert.deepEqual(tipos(revisarHandoff(handoff({ estado: '## Estado\n- Producción:   ' }), 'estandar')), ['produccion']);
  assert.deepEqual(tipos(revisarHandoff(handoff({ estado: '## Estado\nProducción: andando' }), 'estandar')), ['produccion']);
  assert.deepEqual(tipos(revisarHandoff(handoff({ estado: '## Estado\n  - Producción: andando' }), 'estandar')), ['produccion']);
});

test('estandar sin ## Estado: falta y producción, las dos', () => {
  assert.deepEqual(tipos(revisarHandoff(handoff({ estado: null }), 'estandar')).sort(), ['falta', 'produccion']);
});

test('varias fallas juntas se informan todas', () => {
  const h = '## Qué se hizo\n' + 'x'.repeat(5100);
  const t = tipos(revisarHandoff(h, 'estandar'));
  assert.ok(t.includes('tamano'));
  assert.ok(t.includes('prohibida'));
  assert.equal(t.filter((x) => x === 'falta').length, 7);
  assert.ok(t.includes('produccion'));
});

test('los mensajes no repiten el contenido del handoff', () => {
  const secreto = 'CLAVE-SUPER-SECRETA-123';
  const h = `## Qué se hizo ${secreto}\n**Cierre**: ${secreto}\n${secreto.repeat(300)}`;
  for (const f of revisarHandoff(h, 'estandar')) assert.ok(!f.mensaje.includes(secreto), f.mensaje);
});
