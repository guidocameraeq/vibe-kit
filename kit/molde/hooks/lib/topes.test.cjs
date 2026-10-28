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
  assert.equal(typeof T.revisarTopes, 'function', 'revisarTopes llegó con E4');
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

// ---------------------------------------------------------------- revisarTopes (criterio 11; candado:topes)
// Repos temporales (mkdtemp + git init, identidad fija, sin la configuración de git de la PC); nunca los repos de prueba del kit.

const fsT = require('fs');
const osT = require('os');
const pathT = require('path');
const { spawnSync: spawnT } = require('child_process');

const TMP_T = fsT.mkdtempSync(pathT.join(osT.tmpdir(), 'kit-topes-'));
const GLOBAL_T = pathT.join(TMP_T, 'gitconfig-vacio');
fsT.writeFileSync(GLOBAL_T, '');
process.env.GIT_CONFIG_GLOBAL = GLOBAL_T;
process.env.GIT_CONFIG_NOSYSTEM = '1';
test.after(() => fsT.rmSync(TMP_T, { recursive: true, force: true }));

const MOLDE_DOCS = pathT.join(__dirname, '..', '..', 'docs');
const AHORA_T = new Date('2026-10-06T12:00:00-03:00');
let nT = 0;
function gT(cwd, ...args) {
  const r = spawnT('git', ['-c', 'user.name=Prueba', '-c', 'user.email=prueba@ejemplo.invalid', ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, GIT_AUTHOR_DATE: '2026-10-01T12:00:00-03:00', GIT_COMMITTER_DATE: '2026-10-01T12:00:00-03:00' },
  });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}
function escribirT(d, rel, texto) {
  const p = pathT.join(d, ...rel.split('/'));
  fsT.mkdirSync(pathT.dirname(p), { recursive: true });
  fsT.writeFileSync(p, texto);
}
// Un repo con docs/ del molde recién instanciado (copia de kit/molde/docs), commiteado; `cambios` encima, en el disco.
function molde(cambios = {}, ficha = null) {
  const d = pathT.join(TMP_T, `r${nT++}`);
  fsT.cpSync(MOLDE_DOCS, pathT.join(d, 'docs'), { recursive: true });
  gT(d, 'init', '-q', '-b', 'main');
  if (ficha) escribirT(d, '.claude/kit.md', ficha);
  gT(d, 'add', '-A');
  gT(d, 'commit', '-q', '-m', 'molde');
  for (const [rel, texto] of Object.entries(cambios)) {
    if (texto === null) fsT.rmSync(pathT.join(d, ...rel.split('/')));
    else escribirT(d, rel, texto);
  }
  return d;
}
const revisar = (d) => T.revisarTopes(d, { ahora: AHORA_T });
const tiposT = (f) => f.map((x) => `${x.tipo}${x.detalle ? ':' + x.detalle : ''}`);
const fichaModuloT = (estado, bytes) => `# m\nEstado: ${estado}\nPróximo paso: algo\n\n${'x'.repeat(bytes)}\n`;
const FICHA_ESTANDAR = '---\nkit: 2.4.3\nnivel: estandar\nvars:\n  proyecto: p\n---\n';

test('revisarTopes: verde con el molde recién instanciado (sin ficha y con ficha estandar)', () => {
  assert.deepEqual(revisar(molde()), []);
  assert.deepEqual(revisar(molde({}, FICHA_ESTANDAR)), []);
});

test('revisarTopes: handoff de más de 5.000 bytes', () => {
  const h = fsT.readFileSync(pathT.join(MOLDE_DOCS, 'SESSION_HANDOFF.md'), 'utf8') + '\n' + '- relleno\n'.repeat(600);
  const f = revisar(molde({ 'docs/SESSION_HANDOFF.md': h }));
  assert.ok(tiposT(f).includes('handoff:tamano'));
  assert.ok(f.every((x) => x.id === 'candado:topes'));
  assert.equal(f.find((x) => x.detalle === 'tamano').archivo, 'docs/SESSION_HANDOFF.md');
  // El corte del handoff no se cuenta dos veces.
  assert.ok(!f.some((x) => x.tipo === 'inyeccion' && x.mensaje.includes('el handoff')));
});

test('revisarTopes: el tope del handoff es en bytes (con tildes falla aunque el hook, que cuenta caracteres, no lo corte)', () => {
  const base = fsT.readFileSync(pathT.join(MOLDE_DOCS, 'SESSION_HANDOFF.md'), 'utf8');
  const f = revisar(molde({ 'docs/SESSION_HANDOFF.md': base + 'á'.repeat(2600) }));
  assert.deepEqual(tiposT(f), ['handoff:tamano']);
});

test('revisarTopes: sección faltante, desordenada o prohibida', () => {
  const base = fsT.readFileSync(pathT.join(MOLDE_DOCS, 'SESSION_HANDOFF.md'), 'utf8');
  assert.ok(tiposT(revisar(molde({ 'docs/SESSION_HANDOFF.md': base.replace('## Bloqueos', '## Trabas') }))).includes('handoff:falta'));
  const desord = base.replace('## Bloqueos', '## TMP').replace('## Te espera', '## Bloqueos').replace('## TMP', '## Te espera');
  assert.ok(tiposT(revisar(molde({ 'docs/SESSION_HANDOFF.md': desord }))).includes('handoff:desordenada'));
  assert.ok(tiposT(revisar(molde({ 'docs/SESSION_HANDOFF.md': base + '\n## Qué se hizo\n- algo\n' }))).includes('handoff:prohibida'));
});

test('revisarTopes: en estandar, la línea de Producción (con la ficha vigente)', () => {
  const base = fsT.readFileSync(pathT.join(MOLDE_DOCS, 'SESSION_HANDOFF.md'), 'utf8').replace('- Producción: no hay\n', '');
  assert.deepEqual(revisar(molde({ 'docs/SESSION_HANDOFF.md': base })), []);
  assert.deepEqual(tiposT(revisar(molde({ 'docs/SESSION_HANDOFF.md': base }, FICHA_ESTANDAR))), ['handoff:produccion']);
});

test('revisarTopes: ficha EN OBRA o PAUSADO de más de 5.000 bytes; COMPLETO no cuenta; 5.000 justos pasan', () => {
  const f = revisar(
    molde({
      'docs/modulos/a/README.md': fichaModuloT('EN OBRA', 5100),
      'docs/modulos/b/README.md': fichaModuloT('PAUSADO', 5100),
      'docs/modulos/c/README.md': fichaModuloT('COMPLETO', 9000),
    })
  );
  assert.deepEqual(f.filter((x) => x.tipo === 'ficha').map((x) => x.archivo), ['docs/modulos/a/README.md', 'docs/modulos/b/README.md']);
  const justa = fichaModuloT('EN OBRA', 0);
  const g5 = revisar(molde({ 'docs/modulos/a/README.md': justa + 'y'.repeat(5000 - Buffer.byteLength(justa)) }));
  assert.ok(!g5.some((x) => x.tipo === 'ficha'));
});

test('revisarTopes: MAPA.md de más de 5.000 bytes; 5.000 justos y sin MAPA, verde', () => {
  assert.deepEqual(tiposT(revisar(molde({ 'docs/MAPA.md': '# MAPA\n' + 'x'.repeat(5000) }))), ['mapa']);
  assert.deepEqual(tiposT(revisar(molde({ 'docs/MAPA.md': '# MAPA\n' + 'x'.repeat(4993) }))), []);
  assert.deepEqual(revisar(molde({ 'docs/MAPA.md': null })), []);
});

test('revisarTopes: lo que inyectaría el hook — un documento que no entra en su bloque', () => {
  const rojo = require('./todo.cjs').EMOJI.rojo;
  const todoLargo = `# TODO\n\n## ${rojo} Crítico\n` + Array.from({ length: 60 }, (_, i) => `- [ ] rojo ${i} con bastante texto para pesar`).join('\n') + '\n';
  const f = revisar(molde({ 'docs/TODO.md': todoLargo }));
  assert.deepEqual(tiposT(f), ['inyeccion']);
  assert.ok(f[0].mensaje.includes('el TODO (docs/TODO.md)'));
});

test('revisarTopes: lo que inyectaría el hook — más de 9.700 (con el mismo inyeccion.armar)', () => {
  const iny = require('./inyeccion.cjs');
  const original = iny.armar;
  let llamado = null;
  iny.armar = (o) => {
    llamado = o;
    return { texto: 'x'.repeat(9701), n: 9701, cortes: [] };
  };
  try {
    const d = molde();
    const f = revisar(d);
    assert.deepEqual(tiposT(f), ['inyeccion']);
    assert.ok(f[0].mensaje.includes('9701'));
    assert.equal(llamado.cwd, d);
    iny.armar = () => ({ texto: 'x'.repeat(9700), n: 9700, cortes: [] });
    assert.deepEqual(revisar(d), []);
  } finally {
    iny.armar = original;
  }
});
