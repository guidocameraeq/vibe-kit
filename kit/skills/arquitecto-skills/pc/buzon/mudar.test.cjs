'use strict';
// mudar.test.cjs — la mudanza de una PC a v1 (SPEC-G1-buzon, `mudar` y `registrar`; criterio 7). Sobre buzones del temporal.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Bz = require('./buzon.cjs');
const P = require('./protocolo.cjs');
const H = require('./armar-buzon.test.cjs');
const { YO, OTRA, TERCERA } = H;

// Un buzón v0 con el agente ana@PC1/Devoluciones (de esta cuenta), su puntero de leídos y mensajes en dos conversaciones
function armarV0() {
  const b = H.buzon();
  const r = H.repo('Devoluciones');
  b.regV0('ana@PC1/Devoluciones', YO);
  b.regV0('juan@PC2/Mobile', OTRA);
  const c1 = b.conv('c1');
  const c2 = b.conv('c2');
  const a1 = b.msg(c1, { de: 'juan@PC2/Mobile', para: ['ana@PC1/Devoluciones'] }, { cuenta: OTRA, v0: true });
  const a2 = b.msg(c1, { de: 'ana@PC1/Devoluciones', para: ['juan@PC2/Mobile'], tipo: 'respuesta', responde_a: a1.id }, { v0: true });
  const a3 = b.msg(c1, { de: 'juan@PC2/Mobile', para: ['ana@PC1/Devoluciones'] }, { cuenta: OTRA, v0: true });
  const b1 = b.msg(c2, { de: 'juan@PC2/Mobile', para: ['*'] }, { cuenta: OTRA, v0: true });
  b.leidosV0('ana@PC1/Devoluciones', { [c1]: a2.archivo, [c2]: [b1.id] });
  return { b, r, c1, c2, a1, a2, a3, b1 };
}
const huellas = (b, rels) => Object.fromEntries(rels.map((rel) => [rel, P.huella(fs.readFileSync(path.join(b.carpeta, ...rel.split('/'))))]));

test('registrar: escribe la config, reserva el id, encuentra el v0 de esta cuenta y muda (puntero → lista)', () => {
  const v = armarV0();
  const quietos = ['agentes/ana_PC1_Devoluciones.json', 'leidos/ana_PC1_Devoluciones.json', `conversaciones/${v.c1}/mensajes/${v.a1.archivo}`, `conversaciones/${v.c1}/mensajes/${v.a2.archivo}`, `conversaciones/${v.c1}/mensajes/${v.a3.archivo}`, `conversaciones/${v.c2}/mensajes/${v.b1.archivo}`, `conversaciones/${v.c1}/conversacion.json`];
  const antes = huellas(v.b, quietos);
  const r = Bz.principal(['registrar', '--carpeta', v.b.carpeta, '--persona', 'ana', '--compartida', 'no', '--agente', `devoluciones=${v.r.ruta}`], v.b.entorno());
  assert.equal(r.codigo, 0, r.texto);
  assert.match(r.texto, /instalá los hooks por PC/);
  const cfg = JSON.parse(fs.readFileSync(path.join(v.b.cfgDir, 'config.json'), 'utf8'));
  assert.deepEqual([cfg.persona, cfg.cuenta, cfg.compartida, cfg.agentes[0].id, cfg.agentes[0].antes], ['ana', YO, false, 'devoluciones/ana', ['ana@PC1/Devoluciones']]);
  const reg = JSON.parse(fs.readFileSync(path.join(v.b.carpeta, 'agentes', 'devoluciones_ana', 'registro.json'), 'utf8'));
  assert.deepEqual([reg.protocolo, reg.id, reg.cuentas, reg.antes], [1, 'devoluciones/ana', [YO], ['ana@PC1/Devoluciones']]);
  // la marca: puntero → todo lo de c1 con nombre ≤ el puntero; la lista de c2 tal cual; con la huella de cada uno
  const l = JSON.parse(fs.readFileSync(path.join(v.b.carpeta, 'leidos', 'devoluciones_ana.json'), 'utf8'));
  assert.deepEqual(Object.keys(l.leidos[v.c1]).sort(), [v.a1.id, v.a2.id].sort());
  assert.deepEqual(Object.keys(l.leidos[v.c2]), [v.b1.id]);
  assert.equal(l.leidos[v.c1][v.a1.id], P.huella(fs.readFileSync(v.a1.ruta)));
  // la nota del LEEME, arriba
  assert.ok(fs.readFileSync(path.join(v.b.carpeta, 'LEEME.md'), 'utf8').startsWith(Bz.NOTA_LEEME));
  // ni un byte de lo v0
  assert.deepEqual(huellas(v.b, quietos), antes);
});

test('mudar: la segunda vez, sin cambios; --plan no escribe', () => {
  const v = armarV0();
  v.b.config({ agentes: [{ id: 'devoluciones/ana', repo: v.r.ruta, antes: ['ana@PC1/Devoluciones'] }] });
  const antesDelPlan = v.b.foto();
  const plan = Bz.principal(['mudar', '--plan'], v.b.entorno());
  assert.equal(plan.codigo, 0);
  assert.match(plan.texto, /escribiría el registro v1/);
  assert.match(plan.texto, /pasaría la marca/);
  assert.match(plan.texto, /agregaría la nota/);
  assert.deepEqual(v.b.foto(), antesDelPlan, '--plan no escribe');
  assert.equal(Bz.principal(['mudar'], v.b.entorno()).codigo, 0);
  const una = v.b.foto();
  const otra = Bz.principal(['mudar'], v.b.entorno());
  assert.equal(otra.codigo, 0);
  assert.match(otra.texto, /ya registrado con esta cuenta/);
  assert.doesNotMatch(otra.texto, /escribo|paso|agrego/);
  assert.deepEqual(v.b.foto(), una);
});

test('mudar: un leidos v0 de otra cuenta no se muda (vale solo si es del agente)', () => {
  const v = armarV0();
  v.b.leidosV0('ana@PC1/Devoluciones', { [v.c1]: v.a3.archivo }, OTRA);
  v.b.config({ agentes: [{ id: 'devoluciones/ana', repo: v.r.ruta, antes: ['ana@PC1/Devoluciones'] }] });
  assert.equal(Bz.principal(['mudar'], v.b.entorno()).codigo, 0);
  const l = JSON.parse(fs.readFileSync(path.join(v.b.carpeta, 'leidos', 'devoluciones_ana.json'), 'utf8'));
  assert.deepEqual(l.leidos, {});
});

test('registrar: si el id ya es de otra cuenta y esta PC trae el v0 de ese proyecto, escribe un registro rival (disputa), no un alta', () => {
  const v = armarV0();
  v.b.regV1('devoluciones/ana', TERCERA);
  const r = Bz.principal(['registrar', '--carpeta', v.b.carpeta, '--persona', 'ana', '--compartida', 'no', '--agente', `devoluciones=${v.r.ruta}`], v.b.entorno());
  assert.equal(r.codigo, 0, r.texto);
  assert.match(r.texto, /el id lo tiene OTRA cuenta.*registro rival/);
  const nombres = fs.readdirSync(path.join(v.b.carpeta, 'agentes', 'devoluciones_ana'));
  assert.ok(nombres.some((n) => /^registro-.*.json$/.test(n)), nombres.join(','));
  assert.ok(!nombres.some((n) => n.startsWith('alta-')));
  // la segunda vez no escribe otro
  assert.match(Bz.principal(['mudar'], v.b.entorno()).texto, /tu registro rival .* ya está/);
  assert.equal(fs.readdirSync(path.join(v.b.carpeta, 'agentes', 'devoluciones_ana')).length, 2);
});

test('registrar: si el id ya es de otra cuenta (y esta PC no trae su v0), escribe el alta; la misma cuenta no se aprueba', () => {
  const v = armarV0();
  fs.rmSync(path.join(v.b.carpeta, 'agentes', 'ana_PC1_Devoluciones.json'));
  v.b.regV1('devoluciones/ana', OTRA);
  const r = Bz.principal(['registrar', '--carpeta', v.b.carpeta, '--persona', 'ana', '--compartida', 'no', '--agente', `devoluciones=${v.r.ruta}`], v.b.entorno());
  assert.equal(r.codigo, 0, r.texto);
  const alta = fs.readdirSync(path.join(v.b.carpeta, 'agentes', 'devoluciones_ana')).find((n) => n.startsWith('alta-'));
  assert.ok(alta, r.texto);
  assert.equal(JSON.parse(fs.readFileSync(path.join(v.b.carpeta, 'agentes', 'devoluciones_ana', alta), 'utf8')).cuenta, YO);
  // la misma cuenta no puede aprobarse a sí misma
  assert.equal(Bz.principal(['registrar', '--aprobar', alta], v.b.entorno()).codigo, 3);
});

test('registrar: si el dueño de un archivo nuevo no es la cuenta de la sesión (un NAS), queda compartida', () => {
  const v = armarV0();
  const r = Bz.principal(['registrar', '--carpeta', v.b.carpeta, '--persona', 'ana', '--compartida', 'no', '--agente', `devoluciones=${v.r.ruta}`], v.b.entorno({ cuentaDeSesion: () => 'OTRA\\cuenta' }));
  assert.equal(r.codigo, 0);
  assert.match(r.texto, /compartida/);
  assert.equal(JSON.parse(fs.readFileSync(path.join(v.b.cfgDir, 'config.json'), 'utf8')).compartida, true);
});

test('registrar: valida persona, carpeta y agentes', () => {
  const v = armarV0();
  const e = v.b.entorno();
  const base = ['registrar', '--carpeta', v.b.carpeta, '--compartida', 'no', '--agente', `devoluciones=${v.r.ruta}`];
  assert.equal(Bz.principal([...base, '--persona', 'director'], e).codigo, 3);
  assert.equal(Bz.principal([...base, '--persona', 'Ana'], e).codigo, 3);
  assert.equal(Bz.principal(['registrar', '--carpeta', v.b.base, '--persona', 'ana', '--compartida', 'no', '--agente', `devoluciones=${v.r.ruta}`], e).codigo, 3);
  assert.equal(Bz.principal(['registrar', '--carpeta', v.b.carpeta, '--persona', 'ana', '--compartida', 'no', '--agente', 'Devoluciones=x'], e).codigo, 3);
  assert.equal(Bz.principal(['registrar', '--carpeta', v.b.carpeta, '--persona', 'ana', '--compartida', 'quizas', '--agente', `devoluciones=${v.r.ruta}`], e).codigo, 3);
  assert.equal(fs.existsSync(path.join(v.b.cfgDir, 'config.json')), false);
});
