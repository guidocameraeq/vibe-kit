'use strict';
// Pruebas de frenos-log.cjs. Corren con: node --test "kit/**/*.test.cjs"
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const F = require('./frenos-log.cjs');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-frenos-'));
test.after(() => fs.rmSync(TMP, { recursive: true, force: true }));
let n = 0;
const raiz = () => {
  const d = path.join(TMP, `r${n++}`);
  fs.mkdirSync(d);
  return d;
};
const RE_FECHA = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;
const AHORA = new Date(Date.UTC(2026, 9, 28, 17, 3, 9));
const leer = (d) => fs.readFileSync(path.join(d, '.claude', 'frenos.log'), 'utf8');
const BASE = { id: 'candado:raiz', herramienta: 'Write', detalle: 'docs/notas.md', rol: 'director', rama: 'modulo/x' };

test('la ruta es .claude/frenos.log (E0) y el separador " · "', () => {
  assert.equal(F.RUTA, '.claude/frenos.log');
  assert.equal(F.SEP, ' · ');
  assert.equal(F.rutaAbsoluta('/r'), path.join('/r', '.claude', 'frenos.log'));
});

test('fecha local con su desfasaje, y se vuelve a leer como el mismo instante', () => {
  const f = F.fechaConZona(AHORA);
  assert.match(f, RE_FECHA);
  assert.equal(new Date(f).getTime(), AHORA.getTime());
});

test('fecha con zonas fijas: -03:00 y +05:30', () => {
  const antes = process.env.TZ;
  try {
    process.env.TZ = 'America/Argentina/Buenos_Aires';
    assert.equal(F.fechaConZona(AHORA), '2026-10-28T14:03:09-03:00');
    process.env.TZ = 'Asia/Kolkata';
    assert.equal(F.fechaConZona(AHORA), '2026-10-28T22:33:09+05:30');
    process.env.TZ = 'UTC';
    assert.equal(F.fechaConZona(AHORA), '2026-10-28T17:03:09+00:00');
  } finally {
    if (antes === undefined) delete process.env.TZ;
    else process.env.TZ = antes;
  }
});

test('anotar: crea .claude/ y escribe el renglón con el formato exacto, UTF-8 y LF', () => {
  const d = raiz();
  const linea = F.anotar(d, BASE, AHORA);
  const esperado = `${F.fechaConZona(AHORA)} · director · modulo/x · candado:raiz · Write · docs/notas.md`;
  assert.equal(linea, esperado);
  assert.equal(leer(d), `${esperado}\n`);
  assert.ok(!fs.readFileSync(path.join(d, '.claude', 'frenos.log')).includes(0x0d), 'sin CR');
});

test('anotar: solo agrega, lo anterior queda intacto', () => {
  const d = raiz();
  fs.mkdirSync(path.join(d, '.claude'));
  fs.writeFileSync(path.join(d, '.claude', 'frenos.log'), 'renglón viejo · a mano\n');
  const a = F.anotar(d, BASE, AHORA);
  const b = F.anotar(d, { ...BASE, id: 'candado:topes', detalle: 'docs/SESSION_HANDOFF.md' }, AHORA);
  assert.equal(leer(d), `renglón viejo · a mano\n${a}\n${b}\n`);
});

test('anotar: si el archivo no termina en LF, no se pega al renglón anterior', () => {
  const d = raiz();
  fs.mkdirSync(path.join(d, '.claude'));
  fs.writeFileSync(path.join(d, '.claude', 'frenos.log'), 'sin fin de línea');
  const a = F.anotar(d, BASE, AHORA);
  assert.equal(leer(d), `sin fin de línea\n${a}\n`);
});

test('anotar: UTF-8 con tildes', () => {
  const d = raiz();
  F.anotar(d, { ...BASE, detalle: 'docs/canción.md' }, AHORA);
  const bytes = fs.readFileSync(path.join(d, '.claude', 'frenos.log'));
  assert.ok(bytes.includes(Buffer.from('canción', 'utf8')));
});

test('neutraliza saltos de línea, controles y el separador: siempre UN renglón de seis campos', () => {
  const d = raiz();
  const malos = ['a\nb', 'a\r\nb', 'a\rb', 'a\u2028b', 'a\u0085b', 'a · b', 'a·b', 'a\n · \nb', 'x\u0000y\u001bz'];
  for (const m of malos) {
    const linea = F.anotar(d, { id: m, herramienta: m, detalle: m, rol: m, rama: m }, AHORA);
    assert.ok(!/[\r\n\u2028\u0085\u0000\u001b]/.test(linea), JSON.stringify(m));
    assert.equal(linea.split(' · ').length, 6, JSON.stringify(m));
  }
  const renglones = leer(d).split('\n');
  assert.equal(renglones.length, malos.length + 1);
  assert.equal(renglones[renglones.length - 1], '');
  assert.equal(F.renglon({ ...BASE, detalle: 'a\nb' }, AHORA).split(' · ')[5], 'a b');
  assert.equal(F.renglon({ ...BASE, detalle: 'a · b' }, AHORA).split(' · ')[5], 'a - b');
});

test('campos vacíos o ausentes tienen su valor fijo', () => {
  const partes = F.renglon({}, AHORA).split(' · ');
  assert.deepEqual(partes.slice(1), ['desconocido', '(sin rama)', '(sin id)', '-', '-']);
  assert.deepEqual(F.renglon(null, AHORA).split(' · ').slice(1), ['desconocido', '(sin rama)', '(sin id)', '-', '-']);
  assert.deepEqual(F.renglon({ ...BASE, detalle: '  \n ' }, AHORA).split(' · ')[5], '-');
});

test('un campo larguísimo se corta', () => {
  const partes = F.renglon({ ...BASE, detalle: 'x'.repeat(5000) }, AHORA).split(' · ');
  assert.equal(partes[5].length, F.LARGO_MAX);
  assert.ok(partes[5].endsWith('…'));
});

test('sin raíz no escribe: tira', () => {
  assert.throws(() => F.anotar('', BASE, AHORA), /falta la raíz/);
  assert.throws(() => F.anotar(undefined, BASE, AHORA), /falta la raíz/);
});

test('sin "ahora" usa la hora de ahora', () => {
  const d = raiz();
  const antes = Date.now();
  const linea = F.anotar(d, BASE);
  const f = linea.split(' · ')[0];
  assert.match(f, RE_FECHA);
  assert.ok(Math.abs(new Date(f).getTime() - antes) < 5000);
});
