'use strict';
// Pruebas de scripts/todo.cjs. Corren con: node --test "kit/**/*.test.cjs"
// Repos temporales armados acá (mkdtemp + git init), con identidad y fechas fijas; nunca los repos de prueba del kit.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

// Aislado de la configuración de esta PC: un global vacío y sin el del sistema.
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-todo-'));
const GLOBAL = path.join(TMP, 'gitconfig-vacio');
fs.writeFileSync(GLOBAL, '');
const ENTORNO = { ...process.env, GIT_CONFIG_GLOBAL: GLOBAL, GIT_CONFIG_NOSYSTEM: '1' };
test.after(() => fs.rmSync(TMP, { recursive: true, force: true }));

const SCRIPT = path.join(__dirname, 'todo.cjs');
const R = '\u{1F534}';
const N = '\u{1F7E0}';
const A = '\u{1F7E1}';
const V = '\u{1F7E2}';
const DIA = 24 * 60 * 60 * 1000;
// Fechas relativas a hoy (el script usa la hora real). Con margen de una hora para no jugar en el borde.
const hace = (dias, extraMs = 0) => Math.floor((Date.now() - dias * DIA - extraMs) / 1000);

let n = 0;
function repo() {
  const d = path.join(TMP, `r${n++}`);
  fs.mkdirSync(path.join(d, 'docs'), { recursive: true });
  g(d, ['init', '-q', '-b', 'main']);
  return d;
}
function g(cwd, args, fecha) {
  const env = { ...ENTORNO };
  if (fecha !== undefined) {
    env.GIT_AUTHOR_DATE = `${fecha} +0000`;
    env.GIT_COMMITTER_DATE = `${fecha} +0000`;
  }
  const r = spawnSync('git', ['-c', 'user.name=Prueba', '-c', 'user.email=prueba@ejemplo.invalid', ...args], { cwd, encoding: 'utf8', env });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}
function commit(cwd, archivos, fecha, mensaje = 'c') {
  for (const [rel, txt] of Object.entries(archivos)) fs.writeFileSync(path.join(cwd, rel), txt);
  g(cwd, ['add', '-A']);
  g(cwd, ['commit', '-q', '-m', mensaje], fecha);
  return g(cwd, ['rev-parse', 'HEAD']);
}
function correr(cwd, args) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], { cwd, encoding: 'utf8', env: ENTORNO });
  return { codigo: r.status, out: r.stdout, err: r.stderr };
}
const leer = (cwd) => fs.readFileSync(path.join(cwd, 'docs', 'TODO.md'), 'utf8');

const plantilla = (...items) =>
  [
    '# TODO',
    '',
    `## ${R} Crítico`,
    '',
    `## ${N} Importante`,
    '',
    ...items.filter((i) => i[0] === 'n').map((i) => i[1]),
    '',
    `## ${A} Cuando se pueda`,
    '',
    ...items.filter((i) => i[0] === 'a').map((i) => i[1]),
    '',
    `## ${V} Ideas / algún día`,
    '',
    '## Reportado por el usuario',
    '',
  ].join('\n');

const LINEA = (mas, menos, k, j) => `TODO: +${mas} −${menos} · ${k} ítems · ${j} bajaron a \u{1F7E2}\n`;

// ---------------------------------------------------------------- la línea exacta

test('imprime exactamente la línea del balance, byte a byte, y baja lo que lleva 90 días', () => {
  const d = repo();
  // Cierre anterior: hace 200 días, con a, b y c.
  const t0 = plantilla(['n', '- [ ] Viejo de 100 días'], ['n', '- [ ] Tocado hace poco'], ['a', '- [ ] Amarillo de 100 días'], ['a', '- [ ] Se va']);
  commit(d, { 'docs/TODO.md': t0, 'docs/SESSION_HANDOFF.md': 'h1\n' }, hace(200));
  // Dos ítems "viejos" se escribieron hace 200 días; el "tocado" lo modifica un commit de hace 10.
  const t1 = t0.replace('- [ ] Tocado hace poco', '- [ ] Tocado hace poco\n  detalle nuevo');
  commit(d, { 'docs/TODO.md': t1 }, hace(10));
  // En la sesión actual: se saca "Se va" y se suma "Nuevo".
  const t2 = t1.replace('- [ ] Se va\n', '').replace('- [ ] Amarillo de 100 días', '- [ ] Amarillo de 100 días\n- [ ] Nuevo');
  fs.writeFileSync(path.join(d, 'docs', 'TODO.md'), t2);
  const r = correr(d, ['cierre']);
  assert.equal(r.codigo, 0, r.err);
  // Bajan "Viejo de 100 días" y "Amarillo de 100 días" (200 días). Total ahora: 4. Nuevo +1, Se va −1.
  assert.equal(r.out, LINEA(1, 1, 4, 2));
  assert.equal(
    Buffer.from(r.out).toString('hex'),
    Buffer.from(`TODO: +1 −1 · 4 ítems · 2 bajaron a \u{1F7E2}\n`).toString('hex'),
  );
  assert.ok(r.out.includes(Buffer.from([0xe2, 0x88, 0x92]).toString('utf8')), 'el menos es U+2212');
  assert.ok(!r.out.includes('-1') && !r.out.includes('–'), 'ni guion ni medio guion');
  const ya = require('../hooks/lib/todo.cjs').items(leer(d));
  const sec = (p) => ya.find((i) => i.primero === p).seccion;
  assert.equal(sec('Viejo de 100 días'), 'verde');
  assert.equal(sec('Amarillo de 100 días'), 'verde');
  assert.equal(sec('Tocado hace poco'), 'naranja');
  assert.equal(sec('Nuevo'), 'amarillo');
  assert.equal(ya.find((i) => i.primero === 'Tocado hace poco').lineas.length, 2);
});

test('89 días y 23 h no baja, 90 días y 1 h sí', () => {
  const d = repo();
  const t = plantilla(['n', '- [ ] Casi'], ['a', '- [ ] Justo']);
  commit(d, { 'docs/TODO.md': t, 'docs/SESSION_HANDOFF.md': 'h\n' }, hace(90, -60 * 60 * 1000)); // 89 días y 23 h: todavía no
  let r = correr(d, ['cierre']);
  assert.equal(r.out, LINEA(0, 0, 2, 0));
  assert.equal(leer(d), t);

  const d2 = repo();
  commit(d2, { 'docs/TODO.md': t, 'docs/SESSION_HANDOFF.md': 'h\n' }, hace(90, 60 * 60 * 1000)); // 90 días y 1 h
  r = correr(d2, ['cierre']);
  assert.equal(r.out, LINEA(0, 0, 2, 2));
  assert.notEqual(leer(d2), t);
});

test('una segunda corrida no cambia nada: ni el archivo ni la línea', () => {
  const d = repo();
  const t0 = plantilla(['n', '- [ ] Viejo'], ['a', '- [ ] Otro viejo\n  con detalle'], ['a', '- [ ] Reciente']);
  commit(d, { 'docs/TODO.md': t0, 'docs/SESSION_HANDOFF.md': 'h\n' }, hace(300));
  commit(d, { 'docs/TODO.md': t0.replace('- [ ] Reciente', '- [ ] Reciente\n  tocado') }, hace(1));
  const r1 = correr(d, ['cierre']);
  const t1 = leer(d);
  assert.equal(r1.codigo, 0, r1.err);
  assert.equal(r1.out, LINEA(0, 0, 3, 2));
  assert.notEqual(t1, t0);
  const r2 = correr(d, ['cierre']);
  assert.equal(r2.out, r1.out);
  assert.equal(leer(d), t1);
  // y una tercera, ya con el resultado commiteado
  commit(d, { 'docs/TODO.md': t1 }, hace(0));
  const r3 = correr(d, ['cierre']);
  assert.equal(leer(d), t1);
  assert.equal(r3.codigo, 0);
});

test('las excepciones de la poda también valen en el script: 🔴, espera hasta: y Reportado no bajan', () => {
  const d = repo();
  const t = [
    '# TODO',
    '',
    `## ${R} Crítico`,
    '',
    '- [ ] Rojo viejo',
    '',
    `## ${N} Importante`,
    '',
    '- [ ] Esperando',
    '  espera hasta: 2030-01-01',
    '- [ ] Se va a verde',
    '',
    `## ${V} Ideas`,
    '',
    '## Reportado por el usuario',
    '',
    '- [ ] Reporte viejo',
    '',
  ].join('\n');
  commit(d, { 'docs/TODO.md': t, 'docs/SESSION_HANDOFF.md': 'h\n' }, hace(400));
  const r = correr(d, ['cierre']);
  assert.equal(r.out, LINEA(0, 0, 4, 1));
  const it = require('../hooks/lib/todo.cjs').items(leer(d));
  assert.deepEqual(it.map((i) => [i.primero, i.seccion]), [
    ['Rojo viejo', 'rojo'],
    ['Esperando', 'naranja'],
    ['Se va a verde', 'verde'],
    ['Reporte viejo', 'reportado'],
  ]);
});

test('un ítem con un renglón de detalle nuevo en esta sesión (sin commitear) no baja', () => {
  const d = repo();
  const t = plantilla(['n', '- [ ] Viejo'], ['n', '- [ ] Viejo con novedad']);
  commit(d, { 'docs/TODO.md': t, 'docs/SESSION_HANDOFF.md': 'h\n' }, hace(400));
  fs.writeFileSync(path.join(d, 'docs', 'TODO.md'), t.replace('- [ ] Viejo con novedad', '- [ ] Viejo con novedad\n  detalle de hoy'));
  const r = correr(d, ['cierre']);
  assert.equal(r.out, LINEA(0, 0, 2, 1));
  const it = require('../hooks/lib/todo.cjs').items(leer(d));
  assert.equal(it.find((i) => i.primero === 'Viejo con novedad').seccion, 'naranja');
  assert.equal(it.find((i) => i.primero === 'Viejo').seccion, 'verde');
});

// ---------------------------------------------------------------- la base

test('base por defecto: el último commit que tocó el handoff; --base la cambia', () => {
  const d = repo();
  const t0 = plantilla(['n', '- [ ] Uno']);
  const sha0 = commit(d, { 'docs/TODO.md': t0, 'docs/SESSION_HANDOFF.md': 'h1\n' }, hace(5));
  const t1 = plantilla(['n', '- [ ] Uno'], ['n', '- [ ] Dos']);
  commit(d, { 'docs/TODO.md': t1, 'docs/SESSION_HANDOFF.md': 'h2\n' }, hace(4)); // cierre anterior
  const t2 = plantilla(['n', '- [ ] Uno'], ['n', '- [ ] Dos'], ['n', '- [ ] Tres']);
  commit(d, { 'docs/TODO.md': t2 }, hace(3)); // no toca el handoff
  assert.equal(correr(d, ['cierre']).out, LINEA(1, 0, 3, 0)); // contra t1
  assert.equal(correr(d, ['cierre', '--base', sha0]).out, LINEA(2, 0, 3, 0)); // contra t0
  assert.equal(correr(d, ['cierre', '--base', 'HEAD']).out, LINEA(0, 0, 3, 0));
  assert.equal(correr(d, ['cierre', '--base', 'HEAD~1']).out, LINEA(1, 0, 3, 0));
});

test('sin handoff commiteado: compara contra vacío y lo dice en una línea antes', () => {
  const d = repo();
  commit(d, { 'docs/TODO.md': plantilla(['n', '- [ ] Uno'], ['n', '- [ ] Dos']) }, hace(1));
  const r = correr(d, ['cierre']);
  assert.equal(r.codigo, 0, r.err);
  const lineas = r.out.split('\n');
  assert.equal(lineas.length, 3); // aviso, balance, y el final vacío
  assert.match(lineas[0], /^Sin cierre anterior .*vacío\.$/);
  assert.equal(lineas[1] + '\n', LINEA(2, 0, 2, 0));
});

test('si en la base no había TODO, se compara contra vacío (sin aviso)', () => {
  const d = repo();
  const sha = commit(d, { 'docs/SESSION_HANDOFF.md': 'h\n' }, hace(2));
  commit(d, { 'docs/TODO.md': plantilla(['n', '- [ ] Uno']) }, hace(1));
  const r = correr(d, ['cierre', '--base', sha]);
  assert.equal(r.codigo, 0, r.err);
  assert.equal(r.out, LINEA(1, 0, 1, 0));
});

test('--base con una referencia que no existe: salida 2 y no toca el TODO', () => {
  const d = repo();
  const t = plantilla(['n', '- [ ] Viejo']);
  commit(d, { 'docs/TODO.md': t, 'docs/SESSION_HANDOFF.md': 'h\n' }, hace(400));
  const r = correr(d, ['cierre', '--base', 'no-existe']);
  assert.equal(r.codigo, 2);
  assert.equal(r.out, '');
  assert.match(r.err, /no-existe/);
  assert.equal(leer(d), t);
});

// ---------------------------------------------------------------- salidas

test('mal llamado: salida 2, uso por stderr, nada por stdout', () => {
  const d = repo();
  commit(d, { 'docs/TODO.md': plantilla(), 'docs/SESSION_HANDOFF.md': 'h\n' }, hace(1));
  for (const args of [[], ['otra'], ['cierre', '--base'], ['cierre', '--base', '--otro'], ['cierre', '--xyz'], ['cierre', 'suelto']]) {
    const r = correr(d, args);
    assert.equal(r.codigo, 2, JSON.stringify(args));
    assert.equal(r.out, '', JSON.stringify(args));
    assert.match(r.err, /Uso: node todo\.cjs cierre/);
    if (args[1] === '--base') assert.match(r.err, /--base pide una referencia/);
  }
});

test('sin docs/TODO.md: salida 3', () => {
  const d = repo();
  commit(d, { 'docs/SESSION_HANDOFF.md': 'h\n' }, hace(1));
  const r = correr(d, ['cierre']);
  assert.equal(r.codigo, 3);
  assert.equal(r.out, '');
  assert.match(r.err, /docs\/TODO\.md/);
});

test('TODO sin commitear (git blame no puede): avisa por stderr, no poda y sale 0 con la línea', () => {
  const d = repo();
  commit(d, { 'docs/SESSION_HANDOFF.md': 'h\n' }, hace(400));
  const t = plantilla(['n', '- [ ] Uno']);
  fs.writeFileSync(path.join(d, 'docs', 'TODO.md'), t);
  const r = correr(d, ['cierre']);
  assert.equal(r.codigo, 0);
  assert.equal(r.out, LINEA(1, 0, 1, 0));
  assert.match(r.err, /no podo nada/);
  assert.equal(leer(d), t);
});

test('el TODO en CRLF se poda y se escribe en CRLF', () => {
  const d = repo();
  const t = plantilla(['n', '- [ ] Viejo']).replace(/\n/g, '\r\n');
  commit(d, { 'docs/TODO.md': t, 'docs/SESSION_HANDOFF.md': 'h\n' }, hace(400));
  const r = correr(d, ['cierre']);
  assert.equal(r.out, LINEA(0, 0, 1, 1));
  assert.ok(!/[^\r]\n/.test(leer(d)), 'solo CRLF');
});
