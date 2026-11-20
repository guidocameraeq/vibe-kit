'use strict';
// Pruebas de scripts/turno.cjs (SPEC-PO A1, criterio 2): `ver` muestra al que tiene el turno y al que espera; el que espera y muere
// deja de salir (y su archivo se borra), lo mismo una espera de más de 60 min; sin nadie, "libre"; `rastro` da los renglones tal
// cual y las dos cuentas, con --desde. Todo con KIT_TURNO_DIR en un temporal propio: nunca el turno real de la PC.
// Corren con: node --test kit/molde/scripts/turno.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { once } = require('events');

const T = require('./turno.cjs');
const PROCESO = path.join(__dirname, '..', 'hooks', 'lib', 'proceso.cjs');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-turno-ver-'));
test.after(() => fs.rmSync(TMP, { recursive: true, force: true, maxRetries: 20, retryDelay: 500 }));

let n = 0;
const nuevo = () => {
  const base = path.join(TMP, `c${++n}`);
  fs.mkdirSync(base);
  return { base, dir: path.join(base, 'turno') };
};
function correr(argv, opciones) {
  let out = '';
  let err = '';
  const codigo = T.main(argv, { salida: (s) => (out += s), error: (s) => (err += s), ...opciones });
  return { codigo, out, err };
}
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
async function hasta(cond, ms = 15000) {
  const t0 = Date.now();
  while (!cond() && Date.now() - t0 < ms) await dormir(50);
  return cond();
}
const hijo = (dir, codigo) => spawn(process.execPath, ['-e', `const P=require(${JSON.stringify(PROCESO)});${codigo}`], { stdio: 'ignore', env: { ...process.env, KIT_TURNO_DIR: dir } });

test('A1 ver: sin nadie, "libre" y la memoria libre; solo lee (no crea nada)', () => {
  const { base, dir } = nuevo();
  const r = correr(['ver'], { dir });
  assert.equal(r.codigo, 0, r.err);
  assert.match(r.out, /^turno: libre$/m);
  assert.match(r.out, /^memoria libre: \d+ MB de \d+ MB$/m);
  assert.deepEqual(fs.readdirSync(base), []);
});

test('A1 ver (crit. 2): uno tiene el turno y otro espera → salen los dos; el que espera muere → deja de salir', async () => {
  const { base, dir } = nuevo();
  const marca = path.join(base, 'entro');
  const tiene = hijo(dir, `P.conTurno('el que tiene',()=>{require('fs').writeFileSync(${JSON.stringify(marca)},'1');Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,30000);},{etiqueta:'gate de m1'});`);
  try {
    assert.ok(await hasta(() => fs.existsSync(marca)), 'el que tiene no entró');
    const espera = hijo(dir, `P.conTurno('el que espera',()=>{},{cadaMs:50});`);
    const esperas = path.join(base, 'kit-turno-esperas');
    assert.ok(await hasta(() => fs.existsSync(esperas) && fs.readdirSync(esperas).length === 1), 'el que espera no se anotó');
    let r = correr(['ver'], { dir });
    assert.equal(r.codigo, 0, r.err);
    assert.match(r.out, /^turno: lo tiene gate de m1 \(el que tiene\) · carpeta .+ · desde \d{2}:\d{2} \(hace \d+ min\)$/m);
    assert.match(r.out, /^espera: el que espera · carpeta .+ · desde \d{2}:\d{2} \(hace \d+ min\)$/m);
    espera.kill();
    await once(espera, 'exit');
    r = correr(['ver'], { dir });
    assert.doesNotMatch(r.out, /el que espera/);
    assert.match(r.out, /lo tiene gate de m1/);
    assert.deepEqual(fs.readdirSync(esperas), [], 'la espera del muerto se borró');
  } finally {
    tiene.kill();
    await once(tiene, 'exit');
  }
  // el dueño murió sin soltar: "libre" (el próximo conTurno lo toma)
  const r = correr(['ver'], { dir });
  assert.match(r.out, /^turno: libre \(quedó el candado de un proceso que ya no existe: el próximo lo toma\)$/m);
});

test('A1 ver: una espera de más de 60 min se ignora y se borra; un quien.json viejo (sin carpeta) sale igual', () => {
  const { base, dir } = nuevo();
  const esperas = path.join(base, 'kit-turno-esperas');
  fs.mkdirSync(esperas);
  const vieja = path.join(esperas, 'espera-1.json');
  fs.writeFileSync(vieja, JSON.stringify({ quien: 'vieja', pid: process.pid, desde: new Date(Date.now() - 61 * 60000).toISOString() }));
  fs.writeFileSync(path.join(esperas, 'espera-2.json'), JSON.stringify({ quien: 'nueva', pid: process.pid, desde: new Date().toISOString(), carpeta: 'C:/x', etiqueta: 'la nueva' }));
  fs.writeFileSync(path.join(esperas, 'basura.json'), 'no es json');
  fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, 'quien.json'), JSON.stringify({ quien: 'de la versión vieja', pid: process.pid, desde: new Date().toISOString() }));
  const r = correr(['ver'], { dir });
  assert.match(r.out, /^turno: lo tiene de la versión vieja · carpeta — · desde/m);
  assert.match(r.out, /^espera: la nueva · carpeta C:\/x/m);
  assert.doesNotMatch(r.out, /^espera: vieja/m);
  assert.ok(!fs.existsSync(vieja), 'la de más de 60 min se borró');
});

test('A1 rastro: los renglones tal cual, --desde, y las dos cuentas al final', () => {
  const { base, dir } = nuevo();
  let r = correr(['rastro'], { dir });
  assert.equal(r.codigo, 0);
  assert.match(r.out, /^corridas: 0 · menor memoria libre al entrar: —$/m);
  const ls = [
    '2026-11-18 10:00:00 · integrar m1 · C:/a · espera 0 s · corrió 30 s · libre 4000 MB',
    '2026-11-19 11:00:00 · verificar m1--02 · C:/b · espera 12 s · corrió 60 s · libre 2500 MB',
    '2026-11-20 09:00:00 · sello en x · C:/c · espera 0 s · corrió 5 s · libre 3100 MB',
  ];
  fs.writeFileSync(path.join(base, 'kit-turno-rastro.log'), `${ls.join('\n')}\n`);
  r = correr(['rastro'], { dir });
  assert.equal(r.out, `${ls.join('\n')}\ncorridas: 3 · menor memoria libre al entrar: 2500 MB\n`);
  r = correr(['rastro', '--desde', '2026-11-20'], { dir });
  assert.equal(r.out, `${ls[2]}\ncorridas: 1 · menor memoria libre al entrar: 3100 MB\n`);
  assert.equal(correr(['rastro', '--desde', 'ayer'], { dir }).codigo, 2);
  assert.equal(correr(['rastro', '--desde'], { dir }).codigo, 2);
  assert.equal(correr(['otro'], { dir }).codigo, 2);
  assert.equal(correr([], { dir }).codigo, 2);
  assert.equal(correr(['correr', 'suite'], { dir }).codigo, 2, '`correr` no se construye (ADR-044)');
});

test('A1 rastro: lo que deja conTurno de verdad se lee con rastro (sin KIT_TURNO_DIR del temporal real)', () => {
  const { dir } = nuevo();
  require(PROCESO).conTurno('de verdad', () => 1, { dir });
  const r = correr(['rastro'], { dir });
  assert.match(r.out, /· de verdad · .* · libre \d+ MB\ncorridas: 1 · menor memoria libre al entrar: \d+ MB\n$/);
});

test('A1 lineaCorta: el turno en una línea (la usa estado.cjs --obra)', () => {
  const { dir } = nuevo();
  assert.match(T.lineaCorta({ dir }), /^turno: libre · memoria libre \d+ MB$/);
  fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, 'quien.json'), JSON.stringify({ quien: 'q', pid: process.pid, desde: new Date().toISOString(), carpeta: 'C:/p', etiqueta: 'gate' }));
  assert.match(T.lineaCorta({ dir }), /^turno: lo tiene gate \(q\) desde \d{2}:\d{2} · 0 esperan · memoria libre \d+ MB$/);
});
