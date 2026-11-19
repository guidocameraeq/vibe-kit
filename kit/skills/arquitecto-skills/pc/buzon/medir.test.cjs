'use strict';
// medir.test.cjs — las nueve medidas del piloto sobre una carpeta armada a mano con resultados conocidos (SPEC-G1-buzon, `medir`;
// criterio 8; red team 6), la lista entera de las auto: true y el corte solo.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Bz = require('./buzon.cjs');
const M = require('./medir.cjs');
const C = require('./carpeta.cjs');
const H = require('./armar-buzon.test.cjs');
const { YO, OTRA, TERCERA, AHORA, MIN, HORA } = H;
const DIA = 864e5;

function armar() {
  const b = H.buzon();
  const r = H.repo('devoluciones');
  b.config({ agentes: [{ id: 'devoluciones/ana', repo: r.ruta, antes: [] }] });
  b.regV1('mobile/juan', OTRA);
  b.regV1('devoluciones/ana', YO);
  const c = b.conv('c1');
  const ped = (creado, cuenta = OTRA, extra = {}) => b.msg(c, { de: 'mobile/juan', para: ['devoluciones/ana'], ...extra }, { cuenta, creado });
  const resp = (a, creado, extra = {}) => b.msg(c, { de: 'devoluciones/ana', para: ['mobile/juan'], tipo: 'RESPUESTA', responde_a: [a.id], ...extra }, { creado });
  // tres turnos contestados en 10 min, 30 min y 2 h
  const t1 = ped(AHORA - 10 * DIA);
  resp(t1, AHORA - 10 * DIA + 10 * MIN);
  const t2 = ped(AHORA - 9 * DIA);
  resp(t2, AHORA - 9 * DIA + 30 * MIN);
  const t3 = ped(AHORA - 8 * DIA - HORA);
  resp(t3, AHORA - 8 * DIA + HORA);
  // uno parado hace 8 días (y sin ninguna corrida del aviso en ese lapso)
  const t4 = ped(AHORA - 8 * DIA);
  // uno no verificado, abierto hace 1 h (pide el OK)
  ped(AHORA - HORA, TERCERA);
  // una respuesta automática a un no verificado, contestada en 5 min
  const x = ped(AHORA - 2 * DIA, TERCERA);
  resp(x, AHORA - 2 * DIA + 5 * MIN, { auto: true, cuerpo: 'Va el viernes 21, sin cambios.' });
  // uno alterado en la primera vista (el id no coincide con el nombre)
  b.msg(c, { de: 'mobile/juan', para: ['devoluciones/ana'], tipo: 'HECHO', id: 'trucho' }, { cuenta: OTRA, creado: AHORA - 3 * DIA });
  // tiempos.log: tres SessionStart y un portón, de antes de todo
  fs.mkdirSync(b.cfgDir, { recursive: true });
  const t0 = new Date(AHORA - 12 * DIA).toISOString();
  fs.writeFileSync(path.join(b.cfgDir, 'tiempos.log'), [`${t0} SessionStart 100`, `${t0} SessionStart 200`, `${t0} SessionStart 300`, `${t0} PostToolUse 50 porton`].join('\n') + '\n');
  return { b, r, c, t4 };
}

test('medir: las nueve medidas dan los números esperados', () => {
  const a = armar();
  const ctx = C.contexto({ home: a.b.home, duenos: a.b.duenos, ahora: AHORA });
  const m = M.medidas(ctx, {});
  // 1 y 2: [5, 10, 30, 120] min → mediana 20, p75 52,5
  assert.equal(m.n12, 4);
  assert.equal(m.m1, 20 * MIN);
  assert.equal(m.m2, 52.5 * MIN);
  assert.deepEqual(m.m3.map((t) => t.x.k), [a.t4.k]);
  assert.equal(m.m4.length, 1);
  assert.equal(m.m5.length, 1);
  assert.equal(m.m6.length, 2);
  assert.equal(m.m7.SessionStart.n, 3);
  assert.equal(m.m7.SessionStart.p95, 290);
  assert.equal(m.m7['PostToolUse (portón)'].p95, 50);
  assert.equal(m.m8.length, 1);
  assert.deepEqual(m.m9.map((t) => t.x.k), [a.t4.k]);
  assert.equal(m.autos.length, 1);
});

test('medir: lista enteras las auto: true y, si una contestó a un no verificado, corta solo', () => {
  const a = armar();
  const r = Bz.principal(['medir'], a.b.entorno());
  assert.equal(r.codigo, 0, r.texto);
  assert.match(r.texto.split('\n')[0], /CORTE/);
  assert.match(r.texto, /Va el viernes 21, sin cambios\./);
  assert.match(r.texto, /^1\. respuesta a un turno, mediana: 20 min \(n=4/m);
  assert.ok(fs.existsSync(path.join(a.b.cfgDir, 'apagado')));
});

test('medir: una auto: true cuyo renglón se commiteó después → escribe apagado', () => {
  const b = H.buzon();
  const r = H.repo('devoluciones');
  b.config({ agentes: [{ id: 'devoluciones/ana', repo: r.ruta, antes: [] }] });
  b.regV1('mobile/juan', OTRA);
  b.regV1('devoluciones/ana', YO);
  const c = b.conv('c1');
  const p = b.msg(c, { de: 'mobile/juan', para: ['devoluciones/ana'] }, { cuenta: OTRA, creado: AHORA - DIA });
  const linea = 'el reintegro se aprobó el martes pasado a la tarde';
  b.msg(c, { de: 'devoluciones/ana', para: ['mobile/juan'], tipo: 'RESPUESTA', responde_a: [p.id], auto: true, cuerpo: linea }, { creado: AHORA - DIA + MIN });
  const sinCorte = Bz.principal(['medir'], b.entorno());
  assert.doesNotMatch(sinCorte.texto, /CORTE/);
  assert.equal(fs.existsSync(path.join(b.cfgDir, 'apagado')), false);
  fs.writeFileSync(path.join(r.ruta, 'notas.md'), `${linea}\n`);
  H.gitEn(r.ruta, 'add', '-A');
  H.gitEn(r.ruta, 'commit', '-q', '-m', 'dos');
  const conCorte = Bz.principal(['medir'], b.entorno());
  assert.match(conCorte.texto.split('\n')[0], /CORTE.*archivo versionado/);
  assert.ok(fs.existsSync(path.join(b.cfgDir, 'apagado')));
});

test('medir --linea-base: cuenta los agentes de la PC aunque no estén registrados y lista los registros v0 con su dueño', () => {
  const b = H.buzon();
  const r = H.repo('devoluciones');
  b.config({ agentes: [{ id: 'devoluciones/ana', repo: r.ruta, antes: ['ana@PC1/Devoluciones'] }] });
  b.regV0('ana@PC1/Devoluciones', YO);
  b.regV0('juan@PC2/Mobile', OTRA);
  const c = b.conv('c1');
  b.msg(c, { de: 'juan@PC2/Mobile', para: ['*/Devoluciones'], esperando_respuesta_de: ['ana@PC1/Devoluciones'] }, { cuenta: OTRA, v0: true, creado: AHORA - 9 * DIA });
  const sin = M.medidas(C.contexto({ home: b.home, duenos: b.duenos, ahora: AHORA }), {});
  assert.equal(sin.m3.length, 0, 'sin registro v1 no es un agente v1');
  const lb = Bz.principal(['medir', '--linea-base'], b.entorno());
  assert.match(lb.texto, /3\. turnos parados más de 7 días: 1/);
  assert.match(lb.texto, /juan@PC2\/Mobile · dueño PC2/);
  assert.equal(Bz.principal(['medir', '--desde', 'ayer'], b.entorno()).codigo, 3);
});
