'use strict';
// Pruebas de hooks/lib/mesa.cjs (SPEC-0 5.9; G §5-§9): el vocabulario (la columna de la mesa de la tabla de encargo.cjs), la
// cabecera, validar, el estado calculado (abierto, acordado, la firma que vale), el hilo, "trabado por mesa" y la huella. Sin git:
// lo de git (los dos repos, nuevo, abiertos, acordados, candado:mesa) lo prueban scripts/mesa.test.cjs y candado.test.cjs.
// Corren con: node --test "kit/**/*.test.cjs"
const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('./mesa.cjs');

const RUTA = 'docs/modulos/identidad/mesa/desktop/2026-10-24-1-PEDIDO.md';
const MSG = (o = {}) =>
  [`tipo: ${o.tipo || 'PEDIDO'}`, `de: ${o.de || 'mobile/director'}`, `para: ${o.para || 'desktop/director'}`, 'tema: endpoint X', ...(o.extra || []), '', 'prosa', ''].join('\n');
const ques = (f) => f.map((x) => x.que).join('\n');

test('vocabulario: los seis de la mesa salen de la tabla de encargo.cjs; la tilde es alias; los de obreros no', () => {
  assert.deepEqual(M.TIPOS, ['HECHO', 'PEDIDO', 'RESPUESTA', 'PROPUESTA', 'ALERTA', 'PRESENTACION']);
  assert.equal(M.tipoMesa('PRESENTACIÓN'), 'PRESENTACION');
  for (const t of ['ENCARGO', 'AVANCE', 'CORRECCION', 'pedido', 'ACUERDO', '', undefined]) assert.equal(M.tipoMesa(t), null, String(t));
  assert.equal(M.TOPE, 2000);
});

test('leerCabecera: hasta el primer renglón que no es clave; hechos repetibles; repetidas y desconocidas aparte', () => {
  const c = M.leerCabecera('﻿tipo: PEDIDO\r\nde: a/director\nhechos: a:x@abc1234\nhechos: a:y@abc1234\ntema: t\ntema: otra\nestado: abierto\n\nde: b/director\n');
  assert.deepEqual(c.campos, { tipo: 'PEDIDO', de: 'a/director', tema: 't' });
  assert.deepEqual(c.hechos, ['a:x@abc1234', 'a:y@abc1234']);
  assert.deepEqual(c.repetidas, ['tema']);
  assert.deepEqual(c.desconocidas, ['estado']);
});

test('validar no: un PEDIDO, una RESPUESTA con sus cuatro resultados, justo 2000 B', () => {
  assert.deepEqual(M.validar(MSG(), { ruta: RUTA }), []);
  for (const res of ['aceptado', 'rechazado no entra', 'devuelto falta la cita', 'hecho desktop:9f8e7d6c5b4a']) {
    const t = MSG({ tipo: 'RESPUESTA', extra: [`responde-a: desktop:${RUTA}@a1b2c3d4e5f6`, `resultado: ${res}`] });
    assert.deepEqual(M.validar(t, { ruta: RUTA.replace('PEDIDO', 'RESPUESTA') }), [], res);
  }
  const base = MSG();
  const justo = base.replace('prosa', 'p'.repeat(2000 - Buffer.byteLength(base) + 5));
  assert.equal(Buffer.byteLength(justo), 2000);
  assert.deepEqual(M.validar(justo), []);
  assert.match(ques(M.validar(`${justo}x`)), /pesa 2001 B/);
});

test('validar sí: cada regla con su caso', () => {
  const casos = [
    [MSG({ tipo: 'ORDEN' }), /tipo "ORDEN" no es de la mesa/],
    [MSG({ para: 'desktop/obrero' }), /"para:" no es <alias>\/<rol>/],
    [MSG({ de: 'Mobile/director' }), /"de:" no es/],
    [MSG({ extra: ['tema: dos'] }), /"tema:" dos veces/],
    [MSG({ tipo: 'RESPUESTA', extra: ['resultado: aceptado'] }), /no trae "responde-a/],
    [MSG({ tipo: 'RESPUESTA', extra: [`responde-a: desktop:${RUTA}@a1b2c3d`, 'resultado: hecho'] }), /"resultado:" no vale/],
    [MSG({ tipo: 'RESPUESTA', extra: [`responde-a: desktop:${RUTA}@a1b2c3d`, 'resultado: casi aceptado'] }), /"resultado:" no vale/],
    [MSG({ extra: [`responde-a: ${RUTA}`] }), /"responde-a:" no es <alias>:<ruta>@<sha>/],
    [MSG({ extra: ['hechos: lo dijo el otro'] }), /el hecho "lo dijo el otro" no es <alias>:<archivo>/],
  ];
  for (const [t, re] of casos) assert.match(ques(M.validar(t)), re, String(re));
  assert.match(ques(M.validar(MSG(), { ruta: 'docs/modulos/identidad/mesa/desktop/2026-10-24-pedido-154210.md' })), /no tiene el nombre de la mesa/);
  assert.match(ques(M.validar(MSG(), { ruta: RUTA.replace('PEDIDO', 'HECHO') })), /el nombre dice HECHO y la cabecera PEDIDO/);
  assert.match(ques(M.validar(MSG(), { ruta: RUTA.replace('/desktop/', '/web/') })), /está en mesa\/web\/ y es para desktop/);
});

test('armar: la cabecera del script arriba y el cuerpo abajo, con su salto final', () => {
  assert.equal(M.armar({ tipo: 'HECHO', de: 'a/sesion', para: 'b/director', cuerpo: '\n\ntema: t\r\n\nx' }), 'tipo: HECHO\nde: a/sesion\npara: b/director\ntema: t\n\nx\n');
});

// Mensajes armados a mano (lo que devuelve mensajesDe).
const msg = (lado, alias, ruta, tipo, extra = {}, dias = 0) => ({
  lado, ruta, sha: 'a1b2c3d4e5f6a7b8', fecha: new Date(Date.UTC(2026, 9, 24 + dias, 12)), tipo, de: `${alias}/director`, para: 'otro/director',
  cab: { tipo, tema: 't', ...extra }, clave: `${alias}:${ruta}`,
});

test('estado: abierto hasta que una RESPUESTA lo cita; acordado con aceptado (vale la primera firma); HECHO no espera', () => {
  const ped = msg(null, 'mobile', 'docs/modulos/i/mesa/desktop/2026-10-24-1-PEDIDO.md', 'PEDIDO');
  const pro = msg('desktop', 'desktop', 'docs/modulos/i/mesa/mobile/2026-10-24-1-PROPUESTA.md', 'PROPUESTA');
  const ale = msg(null, 'mobile', 'docs/modulos/i/mesa/desktop/2026-10-24-2-ALERTA.md', 'ALERTA');
  const hec = msg(null, 'mobile', 'docs/modulos/i/mesa/desktop/2026-10-24-3-HECHO.md', 'HECHO');
  let e = M.estado([ped, pro, ale, hec]);
  assert.deepEqual(e.abiertos.map((m) => m.tipo).sort(), ['ALERTA', 'PEDIDO', 'PROPUESTA']);
  assert.deepEqual(e.acordados, []);
  const rech = msg('desktop', 'desktop', 'docs/modulos/i/mesa/mobile/2026-10-25-1-RESPUESTA.md', 'RESPUESTA', { 'responde-a': `${ped.clave}@a1b2c3d`, resultado: 'rechazado no' }, 1);
  const f1 = msg(null, 'mobile', 'docs/modulos/i/mesa/desktop/2026-10-25-1-RESPUESTA.md', 'RESPUESTA', { 'responde-a': `${pro.clave}@a1b2c3d`, resultado: 'aceptado' }, 1);
  const f2 = msg(null, 'mobile', 'docs/modulos/i/mesa/desktop/2026-10-26-1-RESPUESTA.md', 'RESPUESTA', { 'responde-a': `${pro.clave}@a1b2c3d`, resultado: 'aceptado' }, 2);
  const no = { ...rech, clave: 'desktop:otra', cab: { ...rech.cab, 'responde-a': `${pro.clave}@a1b2c3d` } };
  e = M.estado([ped, pro, no]);
  assert.deepEqual(e.acordados, [], 'una PROPUESTA rechazada no es acuerdo');
  assert.deepEqual(e.abiertos.map((m) => m.tipo), ['PEDIDO'], 'pero ya está contestada');
  e = M.estado([ped, pro, ale, hec, rech, f2, f1]);
  assert.deepEqual(e.abiertos.map((m) => m.tipo), ['ALERTA'], 'rechazado también contesta');
  assert.equal(e.acordados.length, 1);
  assert.equal(e.acordados[0].firma, f1, 'vale la primera');
  assert.equal(e.acordados[0].firmas, 2);
  assert.match(M.lineaAcordado(e.acordados[0]), /^- 2026-10-25 · t · desktop\/director ↔ mobile\/director · desktop:docs\/modulos\/i\/mesa\/mobile\/2026-10-24-1-PROPUESTA\.md@a1b2c3d4e5f6 · aceptado en mobile:.*@a1b2c3d4e5f6 · ⚠️ firmado 2 veces \(vale la primera\)$/);
  const h = M.hilo([ped, pro, rech, f1], '2026-10-24-1-PEDIDO');
  assert.deepEqual(h, [ped, rech]);
  assert.equal(M.hilo([ped], 'no-esta'), null);
});

test('lineaAbierto: esperás / te toca; "trabado por mesa" desde las 48 h, no antes', () => {
  const m = msg(null, 'mobile', 'docs/modulos/i/mesa/desktop/2026-10-24-1-PEDIDO.md', 'PEDIDO');
  const h = (horas) => new Date(m.fecha.getTime() + horas * 3600 * 1000);
  assert.match(M.lineaAbierto(m, h(1)), /^esperás · PEDIDO · mobile\/director → otro\/director · t · mobile:.*@a1b2c3d4e5f6 · esperando desde 2026-10-24 \(0 días\)$/);
  assert.doesNotMatch(M.lineaAbierto(m, h(47.9)), /trabado/);
  assert.match(M.lineaAbierto(m, h(48)), /\(2 días\) · trabado por mesa$/);
  assert.match(M.lineaAbierto({ ...m, lado: 'desktop' }, h(24)), /^te toca · .*\(1 día\)$/);
});

test('hashConjunto: no depende del orden ni del fin de línea; sí del contenido y del nombre', () => {
  const a = M.hashConjunto([['a.sql', Buffer.from('x\r\ny\n')], ['b/c.sql', Buffer.from('z')]]);
  assert.match(a, /^[0-9a-f]{16}$/);
  assert.equal(M.hashConjunto([['b/c.sql', Buffer.from('z')], ['a.sql', Buffer.from('x\ny\n')]]), a);
  assert.notEqual(M.hashConjunto([['a.sql', Buffer.from('x\ny')], ['b/c.sql', Buffer.from('z')]]), a);
  assert.notEqual(M.hashConjunto([['a2.sql', Buffer.from('x\ny\n')], ['b/c.sql', Buffer.from('z')]]), a);
});
