'use strict';
// Pruebas de contexto.cjs (SPEC-0 P6.4; D §11): transcripts falsos en un temporal con CLAUDE_CONFIG_DIR apuntado ahí; nunca el
// ~/.claude de la PC. Corren con: node --test kit/molde/scripts/contexto.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-uso-'));
test.after(() => fs.rmSync(TMP, { recursive: true, force: true }));
const C = require('./contexto.cjs');
const SCRIPT = path.join(__dirname, 'contexto.cjs');

let n = 0;
// Una config falsa y una carpeta de sesión (con espacios y paréntesis, como en la PC de Guido).
function armar() {
  const config = path.join(TMP, `config${n}`);
  const cwd = path.join(TMP, `mi proyecto (${n++})`, 'sub');
  fs.mkdirSync(cwd, { recursive: true });
  const carpeta = path.join(config, 'projects', C.nombreCarpeta(cwd));
  fs.mkdirSync(carpeta, { recursive: true });
  return { config, cwd, carpeta, env: { ...process.env, CLAUDE_CONFIG_DIR: config } };
}
const asis = (model, u, extra = {}) => JSON.stringify({ type: 'assistant', requestedModel: model, message: { model, usage: u }, ...extra });
const usage = (i, r, c) => ({ input_tokens: i, cache_read_input_tokens: r, cache_creation_input_tokens: c, output_tokens: 99 });
function transcript(carpeta, id, renglones, mtime) {
  const p = path.join(carpeta, `${id}.jsonl`);
  fs.writeFileSync(p, `${renglones.join('\n')}\n`);
  if (mtime) fs.utimesSync(p, mtime, mtime);
  return p;
}
function correr(args, a) {
  const out = [];
  const err = [];
  const codigo = C.main(args, { cwd: a.cwd, env: a.env, salida: (s) => out.push(s), error: (s) => err.push(s) });
  return { codigo, out: out.join(''), err: err.join('') };
}

test('nombreCarpeta: todo lo que no es letra o número, "-" (como la carpeta de la PC: "C:\\x\\(1) y" → "C--x--1--y")', () => {
  if (process.platform === 'win32') assert.equal(C.nombreCarpeta('C:\\Users\\g\\Desktop\\(1) Claude\\vibe-kit'), 'C--Users-g-Desktop--1--Claude-vibe-kit');
  else assert.equal(C.nombreCarpeta('/home/g/(1) Claude/vibe-kit'), '-home-g--1--Claude-vibe-kit');
});

test('sí: el último mensaje del asistente con usage, la suma de los tres input, la ventana del modelo y la línea del contrato', () => {
  const a = armar();
  transcript(a.carpeta, 'viejo', [asis('claude-opus-5-5', usage(1, 1, 1))], new Date(2026, 0, 1));
  transcript(a.carpeta, 'sesion-1', [
    JSON.stringify({ type: 'user', message: { content: 'hola' } }),
    asis('claude-opus-5-5', usage(10, 100000, 2000)),
    asis('claude-opus-5-5', usage(2, 398000, 1998)),
    JSON.stringify({ type: 'user', message: { content: 'otra' } }),
    asis('<synthetic>', usage(0, 0, 0)), // un sintético no cuenta
    '{"type":"assistant", roto',
  ]);
  const r = correr([], a);
  assert.equal(r.codigo, 0, r.out);
  assert.equal(r.out, 'contexto: 400k de 1000k (40%) · faltan 600k · claude-opus-5-5\n');
  const j = correr(['--json'], a);
  assert.equal(j.codigo, 0);
  assert.deepEqual(JSON.parse(j.out), { usado: 400000, ventana: 1000000, pct: 40, falta: 600000, modelo: 'claude-opus-5-5', sesion: 'sesion-1' });
  // --sesion elige otra; también por ruta
  assert.match(correr(['--sesion', 'viejo'], a).out, /^contexto: 0k de 1000k \(0%\) · faltan 1000k · claude-opus-5-5\n$/);
  assert.match(correr(['--sesion', path.join(a.carpeta, 'viejo.jsonl')], a).out, /0k de 1000k/);
});

test('ventana: [1m] → 1M; la tabla de la doc; un modelo desconocido → 200k con NO VERIFICADO en la línea (salida 0)', () => {
  assert.deepEqual(C.ventanaDe('claude-sonnet-5-5'), { ventana: 1000000, segura: true });
  assert.deepEqual(C.ventanaDe('claude-haiku-4-5-20251001'), { ventana: 200000, segura: true });
  assert.deepEqual(C.ventanaDe('claude-algo-9', 'claude-algo-9[1m]'), { ventana: 1000000, segura: true });
  assert.deepEqual(C.ventanaDe('claude-opus-4-5'), { ventana: 200000, segura: false }, 'no está en la tabla');
  assert.deepEqual(C.ventanaDe('claude-opus-55'), { ventana: 200000, segura: false }, 'prefijo de palabra entera');
  const a = armar();
  transcript(a.carpeta, 's', [asis('modelo-raro', usage(0, 150000, 0))]);
  const r = correr([], a);
  assert.equal(r.codigo, 0);
  assert.equal(r.out, 'contexto: 150k de 200k (75%) · faltan 50k · modelo-raro · NO VERIFICADO: la ventana de modelo-raro no la sé: supongo 200k\n');
  assert.equal(JSON.parse(correr(['--json'], a).out).nota, 'la ventana de modelo-raro no la sé: supongo 200k');
});

test('el transcript grande: lee la cola y, si ahí no hay usage, el archivo entero', () => {
  const a = armar();
  const relleno = JSON.stringify({ type: 'user', message: { content: 'x'.repeat(1000) } });
  transcript(a.carpeta, 'grande', [asis('claude-opus-5-5', usage(0, 500000, 0)), ...Array(5000).fill(relleno)]);
  assert.match(correr([], a).out, /^contexto: 500k de 1000k \(50%\)/);
});

test('desde una subcarpeta del checkout: prueba la raíz (por fs) y la letra del disco sin mayúsculas', () => {
  const a = armar();
  const raiz = path.dirname(a.cwd);
  fs.mkdirSync(path.join(raiz, '.git'));
  fs.rmSync(a.carpeta, { recursive: true });
  const otra = path.join(a.config, 'projects', C.nombreCarpeta(raiz).toLowerCase());
  fs.mkdirSync(otra, { recursive: true });
  transcript(otra, 's', [asis('claude-opus-5-5', usage(0, 10000, 0))]);
  assert.match(correr([], a).out, /^contexto: 10k de 1000k \(1%\)/);
});

test('no: sin carpeta, sin transcript, sin usage, sesión que no existe → "contexto: NO VERIFICADO · …" y salida 1', () => {
  const a = armar();
  let r = correr([], a);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /^contexto: NO VERIFICADO · no hay ningún transcript en /);
  transcript(a.carpeta, 's', [JSON.stringify({ type: 'user', message: { content: 'hola' } }), asis('claude-opus-5-5', usage(0, 0, 0))]);
  r = correr([], a);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /^contexto: NO VERIFICADO · el transcript s\.jsonl no tiene todavía un mensaje del asistente con tokens\n$/);
  r = correr(['--sesion', 'otra'], a);
  assert.match(r.out, /^contexto: NO VERIFICADO · no hay sesión otra en /);
  r = correr(['--sesion', '../../x'], a);
  assert.match(r.out, /^contexto: NO VERIFICADO · no existe el transcript /);
  r = correr(['--json'], { ...a, env: { ...a.env, CLAUDE_CONFIG_DIR: path.join(TMP, 'no-existe') } });
  assert.equal(r.codigo, 1);
  assert.match(r.out, /^contexto: NO VERIFICADO · no encuentro la carpeta de esta sesión en /, 'con --json, la misma línea');
});

test('mal llamado → 2 con el USO; el CLI de verdad respeta CLAUDE_CONFIG_DIR', () => {
  const a = armar();
  for (const args of [['--sesion'], ['--nada'], ['--ayuda']]) {
    const r = correr(args, a);
    assert.equal(r.codigo, 2, args.join(' '));
    assert.ok(r.err.includes(C.USO));
  }
  transcript(a.carpeta, 's', [asis('claude-sonnet-5-5', usage(1000, 0, 0))]);
  const r = spawnSync(process.execPath, [SCRIPT], { cwd: a.cwd, env: a.env, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout, 'contexto: 1k de 1000k (0%) · faltan 999k · claude-sonnet-5-5\n');
});
