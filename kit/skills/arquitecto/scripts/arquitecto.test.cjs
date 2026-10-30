'use strict';
// Pruebas de arquitecto.cjs y lib/sello.cjs (SPEC-paquete-4 P1.4 y P1.8; criterios 8, 9 y 10): casos sí y no de cada regla de
// `sello`, `ready`, `ready --pendientes`, `tope`, `entorno` y `registro`, sobre repos temporales con y sin .claude/kit.md.
// Corren con: node --test kit/skills/arquitecto/scripts/. Sin la configuración de git de la PC.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-arquitecto-'));
const GLOBAL = path.join(TMP, 'gitconfig-vacio');
fs.writeFileSync(GLOBAL, '');
Object.assign(process.env, {
  GIT_CONFIG_GLOBAL: GLOBAL,
  GIT_CONFIG_NOSYSTEM: '1',
  XDG_CONFIG_HOME: TMP,
  GIT_AUTHOR_NAME: 'Prueba',
  GIT_AUTHOR_EMAIL: 'prueba@ejemplo.invalid',
  GIT_COMMITTER_NAME: 'Prueba',
  GIT_COMMITTER_EMAIL: 'prueba@ejemplo.invalid',
});
test.after(() => fs.rmSync(TMP, { recursive: true, force: true }));

const SCRIPT = path.join(__dirname, 'arquitecto.cjs');
const A = require('./arquitecto.cjs');
const S = require('./lib/sello.cjs');
const KIT_VERSION = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'VERSION'), 'utf8').trim();

// ---------------------------------------------------------------- ayudantes

let n = 0;
function escribir(d, rel, texto) {
  const p = path.join(d, ...rel.split('/'));
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, texto);
  return p;
}
const leer = (p) => fs.readFileSync(p, 'utf8');

// Un repo git nuevo con los programitas de prueba (verde, rojo, colgado). `ficha`: el texto de .claude/kit.md, o null.
function repo(ficha = null) {
  const d = path.join(TMP, `r${++n}`);
  fs.mkdirSync(d, { recursive: true });
  const r = spawnSync('git', ['init', '-q', '-b', 'main'], { cwd: d, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr);
  escribir(d, 'verde.js', 'process.exit(0);\n');
  escribir(d, 'rojo.js', 'process.exit(3);\n');
  escribir(d, 'colgado.js', 'setTimeout(() => {}, 4000);\n');
  if (ficha !== null) escribir(d, '.claude/kit.md', ficha);
  return d;
}

// La ficha: `extra` va antes del cierre; `test` = comando-test (null: sin él).
function ficha({ test: ct = 'node verde.js', extra = '' } = {}) {
  return ['---', 'kit: 2.4.3', 'nivel: estandar', 'vars:', '  proyecto: prueba', ...(ct ? [`  comando-test: ${ct}`] : []), extra, '---', ''].join('\n');
}
const REAL_Y_DUMMY = ['entornos:', '  base-real:', '    clase: real', '  base-local:', '    clase: dummy'].join('\n');
const SOLO_REAL = ['entornos:', '  base-real:', '    clase: real'].join('\n');
const herramienta = (chequeo) =>
  ['herramientas:', '  db:', `    chequeo: ${chequeo}`, '    necesita-guido: no', 'entornos:', '  base:', '    clase: dummy', '    herramientas: [db]'].join('\n');
const quitado = (hasta = 'siempre') => ['frenos:', '  quitados:', `    - {id: gate:entorno-prueba, por: "proyecto sin base", hasta: ${hasta}}`].join('\n');

// Un spec mínimo que pasa todo (sin sello).
function spec({ h1 = '# SPEC-0: prueba', estado = 'BORRADOR', sello = null, ejecucion = 'Tamaño: módulo solo', entornoSec = true, pedido = false,
  noSeToca = false, criterios = 3, relleno = 0, eol = '\n', cuerpoExtra = [] } = {}) {
  const l = [h1, 'Una app de prueba.', `- Estado: ${estado}`, '- Fecha: 2026-10-30'];
  if (sello) l.push(sello);
  l.push('');
  if (pedido) l.push('## Pedido original, textual', 'Quiero una cosa.', '');
  l.push('## Por qué (el dolor)', 'Duele.', '');
  if (ejecucion !== null) l.push('## Ejecución', ejecucion, '');
  if (entornoSec) l.push('## Entorno de prueba', 'node --test, base dummy.', '');
  if (noSeToca) l.push('## NO SE TOCA', 'El login.', '');
  l.push('## Criterios de aceptación');
  for (let i = 1; i <= criterios; i++) l.push(`${i}. Anda la cosa ${i}.`);
  l.push('');
  if (relleno) l.push('## Relleno', 'x'.repeat(relleno), '');
  l.push(...cuerpoExtra);
  return l.join(eol);
}

const PLAZOS = { ...process.env, ARQUITECTO_PLAZO_TEST_MS: '2000', ARQUITECTO_PLAZO_CHEQUEO_MS: '2000' };
function correr(argv, cwd, opciones = {}) {
  let out = '';
  let err = '';
  const codigo = A.main(argv, { cwd, salida: (s) => (out += s), error: (s) => (err += s), env: PLAZOS, ...opciones });
  return { codigo, out, err };
}
// Escribe el spec en el repo y lo sella. → { p, r }
function sellado(d, rel, texto, extra = []) {
  const p = escribir(d, rel, texto);
  const r = correr(['sello', rel, ...extra], d);
  return { p, r };
}
const lineaSello = (p) => S.renglones(fs.readFileSync(p)).find((l) => l.startsWith('- Sello del Arquitecto:'));
// Reemplaza el renglón del sello por otro (para las pruebas de gramática): el hash no lo mira.
function ponerSello(p, renglon) {
  const t = leer(p).split('\n');
  const i = t.findIndex((l) => l.startsWith('- Sello del Arquitecto:'));
  if (i >= 0) t[i] = renglon;
  else t.splice(4, 0, renglon);
  fs.writeFileSync(p, t.join('\n'));
}
const valido = (c = {}) => S.armar({ fecha: '2026-10-30', kit: '2.4.3', tamano: '✅', entorno: '✅', tope: '✅', hash: 'aaaaaaaaaaaa', ...c });

// ---------------------------------------------------------------- llamada

test('USO nombra ready y --pendientes; mal llamado → 2', () => {
  assert.match(A.USO, /ready <spec>/);
  assert.match(A.USO, /ready --pendientes/);
  const d = repo();
  for (const argv of [[], ['nada'], ['sello'], ['ready'], ['ready', 'a.md', '--pendientes'], ['tope', 'a', 'b'], ['entorno', 'x'], ['registro'],
    ['sello', 'a.md', '--no-aplica', 'tope', 'x'], ['sello', 'a.md', '--no-aplica', 'tamaño'], ['sello', 'a.md', '--no-partir', 'a · b'],
    ['sello', 'a.md', '--no-partir', 'con `tilde`'], ['sello', 'a.md', '--no-partir', '  '], ['sello', 'a.md', '--no-partir', 'x', '--no-partir', 'y'],
    ['sello', 'a.md', '--nota', 'x'], ['ready', '--pendientes', '--otro']]) {
    const r = correr(argv, d);
    assert.equal(r.codigo, 2, `${argv.join(' ')} → ${r.codigo}`);
    assert.match(r.err, /Uso: /);
  }
});

test('el script de verdad: salidas por proceso, y la versión sale de <skill>/../../VERSION', () => {
  const d = repo();
  const u = spawnSync(process.execPath, [SCRIPT], { cwd: d, encoding: 'utf8' });
  assert.equal(u.status, 2);
  assert.match(u.stderr, /--pendientes/);
  escribir(d, 's.md', spec());
  const s = spawnSync(process.execPath, [SCRIPT, 'sello', 's.md'], { cwd: d, encoding: 'utf8', env: PLAZOS });
  assert.equal(s.status, 0, s.stdout);
  assert.match(s.stdout, new RegExp(`kit ${KIT_VERSION.replace(/\./g, '\\.')} `));
  assert.equal(A.versionKit(), KIT_VERSION);
  const sinSpec = spawnSync(process.execPath, [SCRIPT, 'ready', 'no-esta.md'], { cwd: d, encoding: 'utf8' });
  assert.equal(sinSpec.status, 1);
  assert.match(sinSpec.stdout, /no encuentro el spec/);
});

// ---------------------------------------------------------------- el hash (r1-7)

test('hash: BOM, CRLF, espacios finales y saltos finales no lo cambian; el texto sí', () => {
  const base = spec({ sello: valido() });
  const h = S.hash(base);
  assert.match(h, /^[0-9a-f]{12}$/);
  assert.equal(S.hash(Buffer.from(`﻿${base}`, 'utf8')), h, 'BOM');
  assert.equal(S.hash(base.replace(/\n/g, '\r\n')), h, 'CRLF');
  assert.equal(S.hash(base.split('\n').map((l) => `${l}  \t`).join('\n')), h, 'espacios finales');
  assert.equal(S.hash(`${base}\n\n\n`), h, 'saltos finales');
  assert.notEqual(S.hash(base.replace('Duele.', 'Duele mucho.')), h, 'el texto');
  assert.notEqual(S.hash(base.replace('Duele.', ' Duele.')), h, 'un espacio al principio sí cuenta');
  assert.notEqual(S.hash(`${base}\nx`), h, 'un renglón más');
});

test('hash: son los 12 primeros hexa del sha256 del texto normalizado', () => {
  const crudo = '﻿# x  \r\n- Estado: BORRADOR\r\n- Fecha: 1\r\n- Sello del Arquitecto: `y`\r\ncuerpo\t\r\n\r\n';
  const esperado = require('crypto').createHash('sha256').update('# x\n- Fecha: 1\ncuerpo', 'utf8').digest('hex').slice(0, 12);
  assert.equal(S.hash(crudo), esperado);
  assert.equal(S.hash(Buffer.from(crudo, 'utf8')), esperado);
});

test('hash: excluye solo la primera - Estado: y la línea del sello de las primeras 20', () => {
  const base = spec({ sello: valido() });
  const h = S.hash(base);
  assert.equal(S.hash(base.replace('- Estado: BORRADOR', '- Estado: READY y otra cosa')), h, 'el Estado de la cabecera');
  assert.equal(S.hash(base.replace(/- Sello del Arquitecto: .*/, '- Sello del Arquitecto: cualquier cosa')), h, 'la línea del sello');
  assert.equal(S.hash(base.replace(/- Sello del Arquitecto: .*\n/, '')), h, 'sin la línea del sello');
  // Un Estado del cuerpo cuenta (como el esqueleto de la ficha del módulo).
  const conCuerpo = spec({ sello: valido(), cuerpoExtra: ['## Ficha', '- Estado: EN OBRA'] });
  assert.notEqual(S.hash(conCuerpo.replace('- Estado: EN OBRA', '- Estado: COMPLETO')), S.hash(conCuerpo), 'un Estado después de la primera');
  // Un segundo - Estado: dentro de las 20 cuenta.
  const dos = spec({ sello: valido() }).replace('- Fecha: 2026-10-30', '- Fecha: 2026-10-30\n- Estado: otro');
  assert.notEqual(S.hash(dos.replace('- Estado: otro', '- Estado: distinto')), S.hash(dos), 'la segunda - Estado:');
  // Pasando la línea 20, ni Estado ni sello se excluyen.
  const lejos = `${Array.from({ length: 20 }, (_, i) => `r${i}`).join('\n')}\n- Estado: BORRADOR\n- Sello del Arquitecto: x`;
  assert.notEqual(S.hash(lejos.replace('BORRADOR', 'READY')), S.hash(lejos), 'Estado en la línea 21');
  assert.notEqual(S.hash(lejos.replace('del Arquitecto: x', 'del Arquitecto: y')), S.hash(lejos), 'sello en la línea 21');
  // El renglón 20 (índice 19) todavía es cabecera.
  const borde = `${Array.from({ length: 19 }, (_, i) => `r${i}`).join('\n')}\n- Estado: BORRADOR\nfin`;
  assert.equal(S.hash(borde.replace('BORRADOR', 'READY')), S.hash(borde), 'Estado en la línea 20');
});

// ---------------------------------------------------------------- la gramática de la línea

test('parsear: la línea que escribe sello se lee, con nota y sin nota', () => {
  const c = S.parsear(valido());
  assert.ok(c.ok, c.error);
  assert.equal(c.campos.fecha, '2026-10-30');
  assert.equal(c.campos.kit, '2.4.3');
  assert.equal(c.campos.hash, 'aaaaaaaaaaaa');
  assert.equal(c.campos.nota, null);
  assert.equal(S.parsear(valido({ nota: 'sellado sin Guido (provisorio)' })).campos.nota, 'sellado sin Guido (provisorio)');
  const r = S.parsear(valido({ tamano: '— (paquete del método)', entorno: '— (sin ficha del kit)', tope: '⚠️ (41,4 KB y 19 criterios; no partir: D4.1)' }));
  assert.ok(r.ok, r.error);
  assert.deepEqual(r.campos.tamano, { tipo: 'no', razon: 'paquete del método' });
  assert.deepEqual(r.campos.tope, { tipo: 'aviso', kb: '41,4', criterios: 19, quien: 'D4.1' });
});

test('parsear: gramática rota → error', () => {
  const v = valido();
  const malas = {
    'sin comillas': v.replace(/`/g, ''),
    'partida en dos': v.replace(' · tope', '\n  · tope').split('\n')[0],
    'comilla de más': v.replace('kit 2.4.3', 'kit `2.4.3'),
    'sin hash': v.replace(/ · hash [0-9a-f]+/, ''),
    'hash corto': v.replace('aaaaaaaaaaaa', 'aaaaaaaaaaa'),
    'hash largo': v.replace('aaaaaaaaaaaa', 'aaaaaaaaaaaaa'),
    'hash con mayúsculas': v.replace('aaaaaaaaaaaa', 'AAAAAAAAAAAA'),
    'fecha irreal': v.replace('2026-10-30', '2026-02-30'),
    'fecha con otra forma': v.replace('2026-10-30', '30/10/2026'),
    'kit sin parche': v.replace('kit 2.4.3', 'kit 2.4'),
    'kit con cero': v.replace('kit 2.4.3', 'kit 02.4.3'),
    'otro orden': v.replace('entorno ✅ · tope ✅', 'tope ✅ · entorno ✅'),
    'tamaño con otra marca': v.replace('tamaño ✅', 'tamaño ok'),
    'tamaño ⚠️': v.replace('tamaño ✅', 'tamaño ⚠️ (1,0 KB y 1 criterios; no partir: x)'),
    'entorno ⚠️': v.replace('entorno ✅', 'entorno ⚠️ (1,0 KB y 1 criterios; no partir: x)'),
    'raya sin razón': v.replace('tamaño ✅', 'tamaño — ()'),
    'raya sin paréntesis': v.replace('tamaño ✅', 'tamaño — sin ficha'),
    '⚠️ sin no partir': v.replace('tope ✅', 'tope ⚠️ (41,4 KB y 19 criterios)'),
    '⚠️ sin quién': v.replace('tope ✅', 'tope ⚠️ (41,4 KB y 19 criterios; no partir: )'),
    '⚠️ con punto': v.replace('tope ✅', 'tope ⚠️ (41.4 KB y 19 criterios; no partir: x)'),
    'nota vacía': `${v.slice(0, -1)} · \``,
    'parte de más': `${v.slice(0, -1)} · nota · otra\``,
    'otro prefijo': v.replace('- Sello del Arquitecto:', '- Sello:'),
    'sin chequeos:': v.replace('chequeos: tamaño', 'tamaño'),
    'arquitecto mal': v.replace('arquitecto: ', 'arq: '),
  };
  malas['nota sin la comilla del final'] = `${v.slice(0, -1)} · nota`;
  malas['comilla adentro de la nota'] = `${v.slice(0, -1)} · nota con \`x\`\``;
  malas['prefijo del mismo largo'] = v.replace('- Sello del Arquitecto:', '- Sello del Arquitecta:');
  for (const [k, l] of Object.entries(malas)) assert.equal(S.parsear(l).ok, false, k);
  assert.match(S.parsear(malas['⚠️ sin no partir']).error, /no partir/);
});

test('validar: — vale solo sin ficha; con ficha, entorno — (quitado: …) solo con el gate quitado', () => {
  const p = (c) => S.parsear(valido(c)).campos;
  assert.equal(S.validar(p({ tamano: '— (x)', entorno: '— (y)', tope: '— (z)' }), { hayFicha: false }), null);
  assert.equal(S.validar(p({}), { hayFicha: true }), null);
  assert.equal(S.validar(p({ tope: '⚠️ (1,0 KB y 9 criterios; no partir: Guido)' }), { hayFicha: true }), null);
  assert.match(S.validar(p({ tamano: '— (x)' }), { hayFicha: true }), /tamaño/);
  assert.match(S.validar(p({ tope: '— (x)' }), { hayFicha: true }), /tope/);
  assert.match(S.validar(p({ entorno: '— (sin ficha del kit)' }), { hayFicha: true }), /entorno/);
  assert.match(S.validar(p({ entorno: '— (quitado: x)' }), { hayFicha: true, gateQuitado: false }), /gate:entorno-prueba/);
  assert.equal(S.validar(p({ entorno: '— (quitado: x)' }), { hayFicha: true, gateQuitado: true }), null);
  assert.match(S.validar(p({ entorno: '— (sin ficha del kit)' }), { hayFicha: true, gateQuitado: true }), /solo "— \(quitado: <por>\)"/);
});

// ---------------------------------------------------------------- ready (criterio 9)

test('ready: sin línea → 1 "spec sin sello"', () => {
  const d = repo();
  const p = escribir(d, 's.md', spec());
  const r = correr(['ready', 's.md'], d);
  assert.equal(r.codigo, 1);
  assert.equal(r.out, 'spec sin sello: corré el Arquitecto (Modo B)\n');
  assert.equal(leer(p), spec());
  // Un sello más allá de la línea 20 no cuenta.
  escribir(d, 'lejos.md', `${'x\n'.repeat(20)}${valido()}\n- Estado: BORRADOR\n`);
  assert.match(correr(['ready', 'lejos.md'], d).out, /spec sin sello/);
  // Un renglón que solo nombra la línea (o la trae sangrada) no es el sello.
  escribir(d, 'nombra.md', spec().replace('- Fecha: 2026-10-30', `- Fecha: 2026-10-30\n- Nota: abajo va ${valido()}\n  ${valido()}`));
  assert.match(correr(['ready', 'nombra.md'], d).out, /^spec sin sello/);
});

test('ready: gramática rota → 1 "sello inválido", y no toca el spec', () => {
  const d = repo();
  const { p } = sellado(d, 's.md', spec());
  const bueno = lineaSello(p);
  for (const malo of [bueno.replace(/ · hash [0-9a-f]+/, ''), bueno.replace(' · entorno', '\n  · entorno'), bueno.replace('tope ✅', 'tope ⚠️ (1,0 KB y 3 criterios)'),
    bueno.replace(/arquitecto: \S+/, 'arquitecto: 2026-13-01')]) {
    ponerSello(p, malo);
    const antes = leer(p);
    const r = correr(['ready', 's.md'], d);
    assert.equal(r.codigo, 1, malo);
    assert.match(r.out, /^sello inválido: /);
    assert.equal(leer(p), antes);
  }
  // Dos líneas de sello en la cabecera.
  ponerSello(p, bueno);
  fs.writeFileSync(p, leer(p).replace(bueno, `${bueno}\n${bueno}`));
  assert.match(correr(['ready', 's.md'], d).out, /sello inválido: hay más de una línea de sello/);
});

test('ready: — con ficha → 1; sin ficha → 0; "¿hay ficha?" se mira en la raíz del checkout del spec, igual que sello', () => {
  // Sin ficha: sello pone — en entorno, ready pasa.
  const d = repo();
  const { p, r } = sellado(d, 's.md', spec());
  assert.equal(r.codigo, 0, r.out);
  assert.match(lineaSello(p), /entorno — \(sin ficha del kit\)/);
  // Aparece la ficha (en el disco, sin commitear): el mismo sello ya no vale.
  escribir(d, '.claude/kit.md', ficha());
  const r2 = correr(['ready', 's.md'], d);
  assert.equal(r2.codigo, 1);
  assert.match(r2.out, /^sello inválido: entorno/);
  // Corrido desde otra carpeta con ficha, sobre un spec de un repo sin ficha: manda la raíz del spec.
  const sin = repo();
  const conFicha = repo(ficha());
  escribir(sin, 'docs/s.md', spec());
  const r3 = correr(['sello', path.join(sin, 'docs', 's.md')], conFicha);
  assert.equal(r3.codigo, 0, r3.out);
  assert.match(r3.out, /entorno — \(sin ficha del kit\)/);
  assert.equal(correr(['ready', path.join(sin, 'docs', 's.md')], conFicha).codigo, 0);
  // Y al revés: desde un repo sin ficha, sobre un spec de un repo con ficha, sello corre el chequeo de la ficha.
  escribir(conFicha, 's.md', spec());
  const r4 = correr(['sello', path.join(conFicha, 's.md')], sin);
  assert.equal(r4.codigo, 0, r4.out);
  assert.match(r4.out, /entorno ✅/);
});

test('ready: tamaño — o tope — con ficha → 1 (sello tipeado)', () => {
  const d = repo(ficha());
  const { p } = sellado(d, 's.md', spec());
  const bueno = lineaSello(p);
  for (const malo of [bueno.replace('tamaño ✅', 'tamaño — (x)'), bueno.replace('tope ✅', 'tope — (x)'), bueno.replace('entorno ✅', 'entorno — (quitado: x)')]) {
    ponerSello(p, malo);
    const r = correr(['ready', 's.md'], d);
    assert.equal(r.codigo, 1, malo);
    assert.match(r.out, /^sello inválido: /);
  }
});

test('ready: hash distinto → 1 "el spec cambió después del sello"; CRLF, espacios finales y el Estado no lo cambian', () => {
  const d = repo();
  const { p } = sellado(d, 's.md', spec());
  const sellado1 = leer(p);
  fs.writeFileSync(p, sellado1.replace('Duele.', 'Duele más.'));
  const r = correr(['ready', 's.md'], d);
  assert.equal(r.codigo, 1);
  assert.equal(r.out, 'el spec cambió después del sello: corré sello de nuevo\n');
  // Mismo texto con CRLF y espacios finales: mismo hash, ready pasa.
  fs.writeFileSync(p, `${sellado1.split('\n').map((l) => `${l}  `).join('\r\n')}\r\n\r\n`);
  const r2 = correr(['ready', 's.md'], d);
  assert.equal(r2.codigo, 0, r2.out);
});

test('ready: secciones que faltan → 1 con cuáles', () => {
  const casos = [
    [{ ejecucion: null }, ['tamaño', 'Ejecución'], /faltan secciones: ## Ejecución —/],
    [{ entornoSec: false }, [], /faltan secciones: ## Entorno de prueba/],
    [{ h1: '# SPEC: una feature', pedido: false, noSeToca: true }, [], /faltan secciones: ## Pedido original, textual/],
    [{ h1: '# SPEC: una feature', pedido: true, noSeToca: false }, [], /faltan secciones: ## NO SE TOCA/],
  ];
  for (const [o, , re] of casos) {
    const d = repo();
    const extra = o.ejecucion === null ? ['--no-aplica', 'tamaño', 'sin Ejecución'] : [];
    const { p, r } = sellado(d, 's.md', spec(o), extra);
    assert.equal(r.codigo, 0, r.out);
    const antes = leer(p);
    const x = correr(['ready', 's.md'], d);
    assert.equal(x.codigo, 1, JSON.stringify(o));
    assert.match(x.out, re);
    assert.equal(leer(p), antes, 'no toca el spec');
  }
  // El Pedido original tiene que ser la primera sección del delta.
  const d = repo();
  const fuera = spec({ h1: '# SPEC: una feature', noSeToca: true, cuerpoExtra: ['## Pedido original, textual', 'tarde'] });
  sellado(d, 's.md', fuera);
  const x = correr(['ready', 's.md'], d);
  assert.equal(x.codigo, 1);
  assert.match(x.out, /Pedido original, textual tiene que ser la primera sección/);
  // Un delta por la ruta (docs/modulos/<x>/SPEC.md) aunque su H1 no diga # SPEC:.
  const m = repo();
  sellado(m, 'docs/modulos/pagos/SPEC.md', spec());
  assert.match(correr(['ready', 'docs/modulos/pagos/SPEC.md'], m).out, /faltan secciones: ## Pedido original, textual, ## NO SE TOCA/);
  // Un SPEC-0 (no delta) no las pide; un delta con las dos, con "(no quedó registrado)", pasa.
  const ok = repo();
  sellado(ok, 'a.md', spec({ h1: '# SPEC-0: algo' }));
  assert.equal(correr(['ready', 'a.md'], ok).codigo, 0);
  const viejo = spec({ h1: '# SPEC: vieja', pedido: true, noSeToca: true }).replace('Quiero una cosa.', '(no quedó registrado: spec anterior al kit v3)');
  sellado(ok, 'b.md', viejo);
  assert.equal(correr(['ready', 'b.md'], ok).codigo, 0);
  // Un título adentro de un bloque de código no cuenta.
  const enCodigo = repo();
  sellado(enCodigo, 'c.md', spec({ entornoSec: false, cuerpoExtra: ['```', '## Entorno de prueba', '```'] }));
  assert.match(correr(['ready', 'c.md'], enCodigo).out, /faltan secciones: ## Entorno de prueba/);
  // "## Entorno de pruebas" no es "## Entorno de prueba".
  assert.deepEqual(S.faltantes(S.renglones(spec({ entornoSec: false, cuerpoExtra: ['## Entorno de pruebas', 'x'] })), false), ['faltan secciones: ## Entorno de prueba']);
  // Un delta en una subcarpeta de un módulo (docs/modulos/<x>/viejo/SPEC.md) no es delta por la ruta.
  sellado(m, 'docs/modulos/pagos/viejo/SPEC.md', spec());
  assert.equal(correr(['ready', 'docs/modulos/pagos/viejo/SPEC.md'], m).codigo, 0);
  assert.deepEqual(S.faltantes(S.renglones(spec({ ejecucion: null, cuerpoExtra: ['## Ejecución (H §8.1)', 'x'] })), false), []);
});

test('ready: todo bien → BORRADOR pasa a READY y nada más cambia (también con CRLF y BOM); ya READY → 0', () => {
  for (const [eol, bom] of [['\n', ''], ['\r\n', '﻿']]) {
    const d = repo(ficha());
    const p = escribir(d, 's.md', `${bom}${spec({ eol, estado: '**BORRADOR** (antes del OK)' })}`);
    assert.equal(correr(['sello', 's.md'], d).codigo, 0);
    const antes = fs.readFileSync(p);
    const r = correr(['ready', 's.md'], d);
    assert.equal(r.codigo, 0, r.out);
    assert.equal(r.out, 'READY: s.md\n');
    const despues = fs.readFileSync(p);
    const esperado = Buffer.from(antes.toString('utf8').replace('- Estado: **BORRADOR**', '- Estado: **READY**'), 'utf8');
    assert.ok(despues.equals(esperado), 'solo cambió BORRADOR por READY');
    const r2 = correr(['ready', 's.md'], d);
    assert.equal(r2.codigo, 0);
    assert.equal(r2.out, 'ready: ya estaba READY\n');
    assert.ok(fs.readFileSync(p).equals(esperado));
  }
});

test('ready: un Estado que no es BORRADOR ni READY, o que falta → 1', () => {
  const d = repo();
  sellado(d, 'a.md', spec({ estado: 'COMPLETO 2026-10-30' }));
  const r = correr(['ready', 'a.md'], d);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /no dice BORRADOR/);
  sellado(d, 'b.md', spec().replace('- Estado: BORRADOR\n', ''));
  assert.match(correr(['ready', 'b.md'], d).out, /no tiene la línea - Estado:/);
  // Un BORRADOR en la línea pero no al principio del valor: no se toca.
  sellado(d, 'c.md', spec({ estado: 'EN DISCUSIÓN (no BORRADOR)' }));
  assert.equal(correr(['ready', 'c.md'], d).codigo, 1);
  // Un BORRADOR que nombra a READY más adelante sigue siendo BORRADOR: pasa.
  const p = sellado(d, 'e.md', spec({ estado: 'BORRADOR (pasa a READY con el OK)' })).p;
  assert.equal(correr(['ready', 'e.md'], d).out, 'READY: e.md\n');
  assert.match(leer(p), /- Estado: READY \(pasa a READY con el OK\)/);
});

test('pasarAReady: reemplaza solo la primera aparición en la línea del Estado', () => {
  const t = Buffer.from('# x\n- Estado: BORRADOR (era BORRADOR)\n- Fecha: 1\nBORRADOR\n');
  assert.equal(S.pasarAReady(t).nuevo.toString(), '# x\n- Estado: READY (era BORRADOR)\n- Fecha: 1\nBORRADOR\n');
  assert.deepEqual(S.pasarAReady(Buffer.from('# x\n- Estado: READY\n')), { ya: true });
});

// ---------------------------------------------------------------- sello: la línea (criterio 9)

test('sello: pone la línea después de - Fecha:, en un renglón, con el hash bueno; reescribe la que había (también partida)', () => {
  const d = repo();
  const { p, r } = sellado(d, 's.md', spec());
  assert.equal(r.codigo, 0, r.out);
  const l = leer(p).split('\n');
  assert.equal(l[3], '- Fecha: 2026-10-30');
  assert.match(l[4], /^- Sello del Arquitecto: `arquitecto: \d{4}-\d{2}-\d{2} · kit \d+\.\d+\.\d+ · chequeos: tamaño ✅ · entorno — \(sin ficha del kit\) · tope ✅ · hash [0-9a-f]{12}`$/);
  const c = S.parsear(l[4]).campos;
  assert.equal(c.hash, S.hash(fs.readFileSync(p)));
  assert.equal(c.kit, KIT_VERSION);
  // La Fecha con continuación: el sello va después de la continuación.
  const conCont = spec().replace('- Fecha: 2026-10-30', '- Fecha: 2026-10-30 · Misión: 5\n  sigue la fecha');
  const q = escribir(d, 'q.md', conCont);
  assert.equal(correr(['sello', 'q.md'], d).codigo, 0);
  assert.match(leer(q).split('\n')[5], /^- Sello del Arquitecto:/);
  // Un sello viejo partido en tres renglones: queda uno solo.
  const viejo = spec({ sello: '- Sello del Arquitecto: `arquitecto: 2026-10-30 · tope ⚠️ (mucho\n  y más) · sellado a mano` — se reescribe\n  con el script.' });
  const v = escribir(d, 'v.md', viejo);
  assert.equal(correr(['sello', 'v.md'], d).codigo, 0);
  const tv = leer(v);
  assert.equal(tv.match(/Sello del Arquitecto/g).length, 1);
  assert.doesNotMatch(tv, /se reescribe|con el script\./);
  assert.equal(correr(['ready', 'v.md'], d).codigo, 0);
  // Dos líneas de sello en la cabecera → 1 y no escribe.
  const dosSellos = spec({ sello: `${valido()}\n${valido()}` });
  const ds = escribir(d, 'ds.md', dosSellos);
  const rds = correr(['sello', 'ds.md'], d);
  assert.equal(rds.codigo, 1);
  assert.match(rds.out, /hay más de una línea de sello/);
  assert.equal(leer(ds), dosSellos);
  // Sin - Fecha: → 1 y no escribe.
  const sinFecha = spec().replace('- Fecha: 2026-10-30\n', '');
  const f = escribir(d, 'f.md', sinFecha);
  const rf = correr(['sello', 'f.md'], d);
  assert.equal(rf.codigo, 1);
  assert.match(rf.out, /no encuentro - Fecha:/);
  assert.equal(leer(f), sinFecha);
  // CRLF: el renglón nuevo también va con CRLF.
  const crlf = escribir(d, 'crlf.md', spec({ eol: '\r\n' }));
  assert.equal(correr(['sello', 'crlf.md'], d).codigo, 0);
  assert.doesNotMatch(leer(crlf), /[^\r]\n/);
  assert.equal(correr(['ready', 'crlf.md'], d).codigo, 0);
  // Volver a sellar sin cambios: mismo hash.
  const h1 = S.parsear(lineaSello(p)).campos.hash;
  assert.equal(correr(['sello', 's.md'], d).codigo, 0);
  assert.equal(S.parsear(lineaSello(p)).campos.hash, h1);
});

test('sello: la razón de --no-aplica y el no partir van tal cual', () => {
  const d = repo();
  const { p, r } = sellado(d, 's.md', spec({ ejecucion: null, relleno: 31 * 1024 }), ['--no-aplica', 'tamaño', 'paquete del método', '--no-aplica', 'entorno', 'sin base', '--no-partir', 'D4.1']);
  assert.equal(r.codigo, 0, r.out);
  assert.match(lineaSello(p), /tamaño — \(paquete del método\) · entorno — \(sin base\) · tope ⚠️ \(\d+,\d KB y 3 criterios; no partir: D4\.1\)/);
  assert.equal(correr(['ready', 's.md'], d).codigo, 1, 'sin Ejecución, ready la pide igual');
});

// ---------------------------------------------------------------- sello: tamaño

test('sello tamaño: con ficha, falta Ejecución o --no-aplica → 1; sin ficha y sin Ejecución pide --no-aplica', () => {
  const c = repo(ficha());
  const p = escribir(c, 's.md', spec({ ejecucion: null }));
  const r = correr(['sello', 's.md'], c);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /tamaño: falta ## Ejecución/);
  assert.equal(leer(p), spec({ ejecucion: null }), 'no escribe nada');
  const r2 = correr(['sello', 's.md', '--no-aplica', 'tamaño', 'x'], c);
  assert.equal(r2.codigo, 1);
  assert.match(r2.out, /con ficha del kit no se saltea/);
  const s = repo();
  escribir(s, 's.md', spec({ ejecucion: null }));
  assert.match(correr(['sello', 's.md'], s).out, /--no-aplica tamaño/);
  assert.equal(correr(['sello', 's.md', '--no-aplica', 'tamano', 'paquete'], s).codigo, 0, 'tamano sin ñ también');
});

test('sello tamaño: la primera línea con texto de Ejecución dice módulo solo o con director', () => {
  const d = repo();
  for (const [ej, ok] of [['Módulo solo, una sesión.', true], ['módulo con director: dos obreros', true], ['', false], ['Una sesión.\nmódulo solo', false],
    ['módulo solo o módulo con director', false], ['### Tamaño\nmódulo solo', false]]) {
    escribir(d, 's.md', spec({ ejecucion: ej }));
    const r = correr(['sello', 's.md'], d);
    assert.equal(r.codigo === 0, ok, `${JSON.stringify(ej)} → ${r.out}`);
    if (!ok) assert.match(r.out, /tamaño: /);
  }
  // La primera línea con texto, aunque haya renglones vacíos antes.
  escribir(d, 's.md', spec({ ejecucion: '\n\nmódulo solo' }));
  assert.equal(correr(['sello', 's.md'], d).codigo, 0);
});

test('sello tamaño: con la ficha del módulo al lado, director: coincide y con director rama: modulo/<x>', () => {
  const d = repo();
  const rel = 'docs/modulos/pagos/SPEC.md';
  const casos = [
    ['módulo solo', 'Estado: EN OBRA\ndirector: no\n', true],
    ['módulo solo', 'Estado: EN OBRA\ndirector: sí\n', false],
    ['módulo con director', 'Estado: EN OBRA\ndirector: sí\nrama: modulo/pagos\n', true],
    ['módulo con director', '- Estado: EN OBRA\n- director: **si**\n- rama: `modulo/pagos`\n', true],
    ['módulo con director', 'Estado: EN OBRA\ndirector: sí\nrama: modulo/otro\n', false],
    ['módulo con director', 'Estado: EN OBRA\ndirector: sí\n', false],
    ['módulo con director', 'Estado: EN OBRA\ndirector: no\nrama: modulo/pagos\n', false],
    ['módulo solo', 'Estado: EN OBRA\n', false],
  ];
  for (const [ej, readme, ok] of casos) {
    escribir(d, 'docs/modulos/pagos/README.md', readme);
    escribir(d, rel, spec({ ejecucion: ej }));
    const r = correr(['sello', rel], d);
    assert.equal(r.codigo === 0, ok, `${ej} / ${JSON.stringify(readme)} → ${r.out}`);
  }
  // Sin README al lado: solo la Ejecución.
  fs.rmSync(path.join(d, 'docs', 'modulos', 'pagos', 'README.md'));
  escribir(d, rel, spec({ ejecucion: 'módulo con director' }));
  assert.equal(correr(['sello', rel], d).codigo, 0);
});

// ---------------------------------------------------------------- sello: entorno (gate:entorno-prueba)

test('sello entorno: real sin dummy → 1; real con dummy → ✅', () => {
  const malo = repo(ficha({ extra: SOLO_REAL }));
  const p = escribir(malo, 's.md', spec());
  const r = correr(['sello', 's.md'], malo);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /clase: real y ningún dummy ni prueba/);
  assert.equal(leer(p), spec(), 'no escribe nada');
  const bueno = repo(ficha({ test: 'node rojo.js', extra: REAL_Y_DUMMY }));
  const { p: q, r: r2 } = sellado(bueno, 's.md', spec());
  assert.equal(r2.codigo, 0, r2.out);
  assert.match(lineaSello(q), /entorno ✅/);
  assert.equal(correr(['ready', 's.md'], bueno).codigo, 0);
  // clase prueba también vale.
  const prueba = repo(ficha({ extra: ['entornos:', '  base-real:', '    clase: real', '  ensayo:', '    clase: prueba'].join('\n') }));
  assert.equal(sellado(prueba, 's.md', spec()).r.codigo, 0);
});

test('sello entorno: sin real, comando-test tiene que existir y salir 0; rojo o colgado → 1', () => {
  const verde = repo(ficha());
  assert.equal(sellado(verde, 's.md', spec()).r.codigo, 0);
  for (const [ct, re] of [['node rojo.js', /comando-test dio rojo/], ['node colgado.js', /comando-test se colgó \(pasó los 2 s\)/], [null, /hace falta vars.comando-test/]]) {
    const d = repo(ficha({ test: ct }));
    const p = escribir(d, 's.md', spec());
    const r = correr(['sello', 's.md'], d);
    assert.equal(r.codigo, 1, `${ct} → ${r.out}`);
    assert.match(r.out, re);
    assert.equal(leer(p), spec(), 'no escribe nada');
  }
  // comando-test como lista: no es un comando.
  const lista = repo(ficha({ test: '[a, b]' }));
  escribir(lista, 's.md', spec());
  assert.match(correr(['sello', 's.md'], lista).out, /tiene que ser un comando/);
});

test('sello entorno: el chequeo de cada herramienta que nombra un entorno; rojo o colgado → 1', () => {
  const verde = repo(ficha({ extra: herramienta('node verde.js') }));
  assert.equal(sellado(verde, 's.md', spec()).r.codigo, 0);
  for (const [ch, re] of [['node rojo.js', /herramienta db dio rojo/], ['node colgado.js', /herramienta db se colgó/]]) {
    const d = repo(ficha({ extra: herramienta(ch) }));
    escribir(d, 's.md', spec());
    const r2 = correr(['sello', 's.md'], d);
    assert.equal(r2.codigo, 1, `${ch} → ${r2.out}`);
    assert.match(r2.out, re);
  }
  // Una herramienta declarada que ningún entorno nombra no se corre.
  const suelta = repo(ficha({ extra: ['herramientas:', '  vpn:', '    chequeo: node rojo.js', '    necesita-guido: sí'].join('\n') }));
  assert.equal(sellado(suelta, 's.md', spec()).r.codigo, 0);
});

test('sello entorno: gate:entorno-prueba quitado y vigente → — (quitado: <por>), y ready lo acepta; vencido → chequea', () => {
  const d = repo(ficha({ test: 'node rojo.js', extra: quitado('siempre') }));
  const { p, r } = sellado(d, 's.md', spec());
  assert.equal(r.codigo, 0, r.out);
  assert.match(lineaSello(p), /entorno — \(quitado: proyecto sin base\)/);
  assert.equal(correr(['ready', 's.md'], d).codigo, 0);
  // Con fecha que no pasó: vale; el día de hasta incluido.
  const ahora = new Date(2026, 9, 30, 12);
  const hoy = repo(ficha({ test: 'node rojo.js', extra: quitado('2026-10-30') }));
  escribir(hoy, 's.md', spec());
  assert.equal(correr(['sello', 's.md'], hoy, { ahora }).codigo, 0);
  // Vencido: corre el chequeo (rojo → 1).
  const vencido = repo(ficha({ test: 'node rojo.js', extra: quitado('2026-10-29') }));
  escribir(vencido, 's.md', spec());
  const rv = correr(['sello', 's.md'], vencido, { ahora });
  assert.equal(rv.codigo, 1);
  assert.match(rv.out, /comando-test dio rojo/);
  // Sellado con el gate quitado, y después se saca de la ficha: ready → 1.
  fs.writeFileSync(path.join(d, '.claude', 'kit.md'), ficha({ test: 'node rojo.js' }));
  const r3 = correr(['ready', 's.md'], d);
  assert.equal(r3.codigo, 1);
  assert.match(r3.out, /gate:entorno-prueba no está vigente/);
  // --no-aplica entorno con ficha → 1.
  const c = repo(ficha());
  escribir(c, 's.md', spec());
  assert.match(correr(['sello', 's.md', '--no-aplica', 'entorno', 'x'], c).out, /entorno: con ficha del kit no se saltea/);
});

test('sello: una ficha rota → 1 sin escribir nada', () => {
  const d = repo('---\nkit: 2\n---\n');
  const p = escribir(d, 's.md', spec());
  const r = correr(['sello', 's.md'], d);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /la ficha \(\.claude\/kit\.md\) no se lee, línea \d+/);
  assert.equal(leer(p), spec());
});

// ---------------------------------------------------------------- sello: tope (H §12)

test('tope: pasado sin --no-partir → 1 con los números y las secciones; con él → ⚠️ y ready 0', () => {
  const d = repo(ficha());
  const grande = spec({ ejecucion: 'módulo solo', relleno: 11 * 1024 });
  const p = escribir(d, 's.md', grande);
  const r = correr(['sello', 's.md'], d);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /tope pasado: 11,\d KB y 3 criterios \(tope módulo solo: 10 KB y 8 criterios\)/);
  assert.match(r.out, /secciones, de mayor a menor:\n {2}\d+,\d KB · ## Relleno\n/);
  assert.equal(leer(p), grande, 'no escribe nada');
  const r2 = correr(['sello', 's.md', '--no-partir', 'Guido'], d);
  assert.equal(r2.codigo, 0, r2.out);
  assert.match(lineaSello(p), /tope ⚠️ \(11,\d KB y 3 criterios; no partir: Guido\)/);
  assert.equal(correr(['ready', 's.md'], d).codigo, 0);
  // `tope` imprime lo mismo y sale 0.
  const t = correr(['tope', 's.md'], d);
  assert.equal(t.codigo, 0);
  assert.match(t.out, /^tope pasado: /);
});

test('tope: los límites por tamaño y el conteo de criterios', () => {
  const m = (o, tam) => S.medirTope(Buffer.from(spec(o)), tam);
  assert.equal(m({ criterios: 8 }, 'solo').pasado, false);
  assert.equal(m({ criterios: 9 }, 'solo').pasado, true, 'módulo solo: más de 8 criterios');
  assert.equal(m({ criterios: 30 }, 'director').pasado, false, 'con director: sin tope de criterios');
  assert.equal(m({ relleno: 9 * 1024 }, 'solo').pasado, false);
  assert.equal(m({ relleno: 25 * 1024 }, 'director').pasado, false);
  assert.equal(m({ relleno: 31 * 1024 }, 'director').pasado, true);
  assert.equal(m({ relleno: 25 * 1024 }, null).pasado, false, 'sin tamaño: 30 KB');
  assert.equal(m({ relleno: 31 * 1024 }, null).pasado, true);
  // El borde: 10 KB justos no pasan; un byte más, sí.
  const base = Buffer.byteLength(spec({ relleno: 1 }));
  assert.equal(m({ relleno: 1 + 10240 - base }, 'solo').pasado, false);
  assert.equal(m({ relleno: 2 + 10240 - base }, 'solo').pasado, true);
  // Criterios: renglones "- " o "N. " de primer nivel, hasta el ## siguiente; no los anidados ni "6b." ni los de otra sección.
  const t = ['# x', '## Criterios de aceptación', '1. uno', '- dos', '  - anidado', '6b. no', '10. tres', '### sub', '- cuatro', '```', '- en código', '```', '## Otra', '- no'].join('\n');
  assert.equal(S.medirTope(Buffer.from(t), 'solo').criterios, 4);
  assert.equal(S.medirTope(Buffer.from('# x\n- a\n'), 'solo').criterios, 0);
  // KB con un decimal y coma.
  assert.equal(S.kbTexto(42393), '41,4');
  assert.equal(S.kbTexto(1024), '1,0');
});

test('tope <spec> dentro del límite: ✅ y sale 0', () => {
  const d = repo();
  escribir(d, 's.md', spec());
  const r = correr(['tope', 's.md'], d);
  assert.equal(r.codigo, 0);
  assert.match(r.out, /^tope ✅: \d+,\d KB y 3 criterios \(tope módulo solo: 10 KB y 8 criterios\)\n$/);
});

// ---------------------------------------------------------------- entorno (solo)

test('entorno: sin ficha → — y 0; verde → ✅ y 0; rojo → 1; quitado → —', () => {
  assert.match(correr(['entorno'], repo()).out, /^entorno — \(sin ficha del kit\)/);
  const v = correr(['entorno'], repo(ficha()));
  assert.deepEqual([v.codigo, v.out], [0, 'entorno ✅\n']);
  const r = correr(['entorno'], repo(ficha({ test: 'node rojo.js' })));
  assert.equal(r.codigo, 1);
  assert.match(r.out, /comando-test dio rojo/);
  const q = correr(['entorno'], repo(ficha({ test: 'node rojo.js', extra: quitado() })));
  assert.deepEqual([q.codigo, q.out], [0, 'entorno — (quitado: proyecto sin base)\n']);
  // Desde una subcarpeta: la raíz del checkout.
  const d = repo(ficha({ test: 'node rojo.js' }));
  fs.mkdirSync(path.join(d, 'sub'));
  assert.equal(correr(['entorno'], path.join(d, 'sub')).codigo, 1);
});

// ---------------------------------------------------------------- ready --pendientes (criterio 10)

test('ready --pendientes: sin sello y cambiado dan su línea; sellado, COMPLETO y ABANDONADO no; sale 0 siempre', () => {
  const d = repo(ficha());
  const modulo = (x, estado, texto) => {
    escribir(d, `docs/modulos/${x}/README.md`, `# ${x}\n- Estado: ${estado}\n- director: no\n`);
    if (texto !== null) escribir(d, `docs/modulos/${x}/SPEC.md`, texto);
  };
  const delta = spec({ h1: '# SPEC: x', pedido: true, noSeToca: true });
  // Sin módulos: nada.
  assert.deepEqual(correr(['ready', '--pendientes'], d), { codigo: 0, out: '', err: '' });
  modulo('a-sin', 'EN OBRA', delta);
  modulo('b-ok', 'EN OBRA', delta);
  assert.equal(correr(['sello', 'docs/modulos/b-ok/SPEC.md'], d).codigo, 0);
  modulo('c-cambio', 'PAUSADO', delta);
  assert.equal(correr(['sello', 'docs/modulos/c-cambio/SPEC.md'], d).codigo, 0);
  fs.appendFileSync(path.join(d, 'docs', 'modulos', 'c-cambio', 'SPEC.md'), '\nUna línea más.\n');
  modulo('d-completo', 'COMPLETO 2026-10-30', delta);
  modulo('e-abandonado', '**ABANDONADO** (2026-10-29)', delta);
  modulo('f-sin-spec', 'EN OBRA', null);
  // Un sello con "—" en un repo con ficha: no vale → sin sello. (Uno tipeado con buena gramática y hash malo da "cambió".)
  modulo('g-invalido', 'EN OBRA', delta.replace('- Fecha: 2026-10-30', `- Fecha: 2026-10-30\n${valido({ tamano: '— (x)' })}`));
  modulo('h-tipeado', 'EN OBRA', delta.replace('- Fecha: 2026-10-30', `- Fecha: 2026-10-30\n${valido()}`));
  const r = correr(['ready', '--pendientes'], d);
  assert.equal(r.codigo, 0);
  assert.equal(r.out, 'a-sin · sin sello\nc-cambio · cambió después del sello\nf-sin-spec · sin sello\ng-invalido · sin sello\nh-tipeado · cambió después del sello\n');
  // Desde una subcarpeta del repo, lo mismo.
  assert.equal(correr(['ready', '--pendientes'], path.join(d, 'docs')).out, r.out);
  // Un "Estado: COMPLETO" que no está al principio no lo saca.
  modulo('d-completo', 'EN OBRA (antes COMPLETO)', delta);
  assert.match(correr(['ready', '--pendientes'], d).out, /d-completo · sin sello/);
});

// ---------------------------------------------------------------- registro (criterio 8)

test('registro: una ficha por <carpeta>/*/.claude/kit.md, con alias, repo, tipo, kit y conexiones de la mesa', () => {
  const carpeta = path.join(TMP, `flota${++n}`);
  fs.mkdirSync(carpeta);
  const proyecto = (nombre, texto, origen) => {
    const d = path.join(carpeta, nombre);
    fs.mkdirSync(d);
    spawnSync('git', ['init', '-q', '-b', 'main'], { cwd: d });
    if (origen) spawnSync('git', ['remote', 'add', 'origin', origen], { cwd: d });
    if (texto !== null) escribir(d, '.claude/kit.md', texto);
  };
  proyecto('alfa', ['---', 'kit: 2.4.3', 'nivel: estandar', 'vars:', '  proyecto: alfa-app', 'mesa:', '  hub:', '    contacto: hub/director', '---', ''].join('\n'), 'https://ejemplo.invalid/alfa.git');
  proyecto('beta', ['---', 'kit: 2.4.2', 'nivel: liviano', 'vars:', '  proyecto: beta', '---', ''].join('\n'), null);
  proyecto('rota', '---\nkit: x\n---\n', null);
  proyecto('v2', null, null);
  fs.writeFileSync(path.join(carpeta, 'suelto.txt'), 'x');
  const r = correr(['registro', carpeta], TMP);
  assert.equal(r.codigo, 0);
  assert.deepEqual(JSON.parse(r.out), {
    version: 1,
    fichas: [
      { alias: 'alfa-app', repo: 'https://ejemplo.invalid/alfa.git', tipo: 'código', kit: '2.4.3' },
      { alias: 'beta', repo: null, tipo: 'sin código', kit: '2.4.2' },
    ],
    conexiones: [{ de: 'alfa-app', a: 'hub', texto: 'mesa' }],
  });
  assert.match(r.err, /^registro: rota\/\.claude\/kit\.md no se lee \(línea \d+: .*\): se saltea\n$/);
  const no = correr(['registro', path.join(TMP, 'no-esta')], TMP);
  assert.equal(no.codigo, 1);
  assert.match(no.out, /no encuentro la carpeta/);
});
