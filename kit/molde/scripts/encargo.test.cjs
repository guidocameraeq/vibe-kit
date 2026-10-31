'use strict';
// Pruebas de scripts/encargo.cjs (SPEC-paquete-5 P6.3, P5.3bis y el corrector "spec sin sello"; criterios 1, 2 y 3): el USO y las
// salidas, `partida`, `presentar` (la rama, el encargo commiteado y según la plantilla, el sello, READY, la base que no cambia la
// salida, --spec desde el director) y `mensaje` (el lado por la rama, el rol, la ruta que git respalda, local vs origin). Repos
// temporales con un remoto bare y los worktrees del director y del obrero, sin la configuración de git de la PC.
// Corren con: node --test "kit/**/*.test.cjs"
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-encargo-'));
const GLOBAL = path.join(TMP, 'gitconfig-vacio');
fs.writeFileSync(GLOBAL, '[core]\n\tlongpaths = true\n');
Object.assign(process.env, {
  GIT_CONFIG_GLOBAL: GLOBAL,
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_AUTHOR_NAME: 'Prueba',
  GIT_AUTHOR_EMAIL: 'prueba@ejemplo.invalid',
  GIT_COMMITTER_NAME: 'Prueba',
  GIT_COMMITTER_EMAIL: 'prueba@ejemplo.invalid',
});
delete process.env.BASE_MODO;
test.after(() => fs.rmSync(TMP, { recursive: true, force: true, maxRetries: 20, retryDelay: 500 }));

const SCRIPT = path.join(__dirname, 'encargo.cjs');
const C = require('./encargo.cjs');
const S = require('../hooks/lib/sello.cjs');

// ---------------------------------------------------------------- ayudantes

function g(cwd, ...args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', env: process.env });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}
function escribir(d, rel, contenido) {
  const p = path.join(d, ...rel.split('/'));
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, contenido);
}
function commit(d, archivos, mensaje = 'c') {
  for (const [rel, contenido] of Object.entries(archivos)) {
    escribir(d, rel, contenido);
    g(d, 'add', '-f', '--', rel);
  }
  g(d, 'commit', '-q', '-m', mensaje);
  return g(d, 'rev-parse', 'HEAD');
}

// La base de presentar: un script que hace lo que diga BASE_MODO (verde, rojo o se cuelga).
const BASE_JS = "const m = process.env.BASE_MODO; if (m === 'rojo') process.exit(3); if (m === 'cuelga') setTimeout(() => {}, 4000);\n";
const ficha = ({ test: ct = 'node base.js', quitado = false } = {}) =>
  ['---', 'kit: 2.4.3', 'nivel: estandar', 'vars:', '  proyecto: prueba', ...(ct ? [`  comando-test: ${ct}`] : []), 'frenos:',
    ...(quitado ? ['  quitados:', '    - {id: gate:entorno-prueba, por: "sin base", hasta: siempre}'] : ['  quitados: []']), '---', ''].join('\n');

// Un spec: sellado (hash bueno) o no; `despues` lo toca después del sello.
function spec({ estado = 'READY', sellar = true, entorno = '✅', despues = '' } = {}) {
  const texto = ['# SPEC: x', `- Estado: ${estado}`, '- Fecha: 2026-10-30', '', '## Pedido original, textual', 'algo', ''].join('\n');
  if (!sellar) return texto + despues;
  const linea = S.armar({ fecha: '2026-10-30', kit: '2.4.3', tamano: '✅', entorno, tope: '✅', hash: S.hash(texto) });
  return texto.replace('- Fecha: 2026-10-30\n', `- Fecha: 2026-10-30\n${linea}\n`) + despues;
}

const RENGLONES = [
  '# Encargo 01 · x · el primer sub-paso',
  '- Partida: rama modulo/x--01 desde modulo/x@abc1234 · 2026-10-30T10:00-03:00',
  '- Spec: docs/modulos/x/SPEC.md:6-7',
  '- Skill: obrero',
  '- Modelo: sonnet · Esfuerzo: medium · Por qué: es mecánico',
  '- Riesgo: bajo · Por qué: no toca datos',
  '- Apertura: Guido',
  '- Suscripción: —',
  '## Toca',
  '- src/x/**',
  '## Alcance',
  '1. una cosa',
  '## NO SE TOCA',
  '- src/pagos/',
  '## AUTORIZADO',
  '- Bash(npm run build)',
  '## GATE',
  '- `npm run lint`',
];
function encargo(cambios = {}) {
  const l = [];
  for (const r of RENGLONES) {
    const clave = Object.keys(cambios).find((c) => r.startsWith(c));
    if (clave === undefined) l.push(r);
    else if (cambios[clave] !== null) l.push(...[].concat(cambios[clave]));
  }
  return `${l.join('\n')}\n`;
}
const RUTA = 'docs/modulos/x/bitacora/2026-10-30-encargo-01.md';

// Un proyecto: principal con remoto bare, ficha y base.js en main; modulo/x con el spec y (si va) el encargo, pusheado; el worktree
// del director (modulo/x) y el del obrero (modulo/x--01), cada uno con su .kit-rol, como los deja worktree.cjs.
let k = 0;
function proyecto(o = {}) {
  const base = path.join(TMP, `p${k++}`);
  const remoto = path.join(base, 'remoto.git');
  const P = path.join(base, 'alfa');
  fs.mkdirSync(P, { recursive: true });
  g(base, 'init', '-q', '--bare', '-b', 'main', remoto);
  g(P, 'init', '-q', '-b', 'main');
  commit(P, { '.gitignore': '/.claude/worktrees/\n/.kit-rol\n/.claude/settings.local.json\n', '.claude/kit.md': ficha(o.ficha), 'base.js': BASE_JS, ...(o.archivos || {}) }, 'base');
  g(P, 'remote', 'add', 'origin', remoto);
  g(P, 'push', '-q', 'origin', 'main');
  g(P, 'branch', 'modulo/x');
  const dir = path.join(P, '.claude', 'worktrees', 'modulo--x');
  g(P, 'worktree', 'add', '-q', dir, 'modulo/x');
  fs.writeFileSync(path.join(dir, '.kit-rol'), 'director\n');
  const archivos = { 'docs/modulos/x/SPEC.md': o.spec !== undefined ? o.spec : spec() };
  if (o.encargo !== null) archivos[RUTA] = o.encargo !== undefined ? o.encargo : encargo();
  commit(dir, archivos, 'spec y encargo');
  g(dir, 'push', '-q', 'origin', 'modulo/x');
  const obr = path.join(P, '.claude', 'worktrees', 'modulo--x--01');
  g(P, 'worktree', 'add', '-q', '-b', 'modulo/x--01', obr, 'modulo/x');
  fs.writeFileSync(path.join(obr, '.kit-rol'), `${o.rolObrero || 'obrero'}\n`);
  return { base, remoto, P, dir, obr };
}
// Un commit en origin/modulo/x desde otro clon (otra PC), y el fetch acá.
function empujarDesdeOtra(p, archivos) {
  const otra = path.join(p.base, `otra${k++}`);
  g(p.base, 'clone', '-q', '-b', 'modulo/x', p.remoto, otra);
  const sha = commit(otra, archivos, 'desde otra PC');
  g(otra, 'push', '-q', 'origin', 'modulo/x');
  g(p.P, 'fetch', '-q', 'origin');
  return sha;
}

// En proceso (rápido); la base con un plazo corto.
function cli(cwd, args, extra = {}) {
  let out = '';
  let err = '';
  const codigo = C.main(args, { cwd, salida: (s) => (out += s), error: (s) => (err += s), plazoBaseMs: 20000, ...extra });
  return { codigo, out, err };
}
function conBase(modo, fn) {
  const antes = process.env.BASE_MODO;
  process.env.BASE_MODO = modo;
  try {
    return fn();
  } finally {
    if (antes === undefined) delete process.env.BASE_MODO;
    else process.env.BASE_MODO = antes;
  }
}

// ---------------------------------------------------------------- USO, mal llamado y lo que llega en E2

test('sin argumentos: el USO de las cinco órdenes, exacto, y salida 2', () => {
  const r = spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8', cwd: TMP });
  assert.equal(r.status, 2);
  for (const l of [
    'partida    <x>--<ID>',
    'presentar  <x>--<ID> [--sin-base] | --spec',
    'mensaje    <TIPO> [<ruta>[@<sha>]]',
    'autorizado <x>--<ID>',
    'verificar  <x>--<ID> [--plazo <min>]',
  ]) assert.ok(r.stderr.includes(l), l);
  assert.equal(r.stdout, '');
});

test('mal llamado → 2 con el uso; fuera de un repo → 1', () => {
  for (const args of [
    ['nada'], ['partida'], ['partida', 'x'], ['partida', 'x--1'], ['partida', 'X--01'], ['partida', 'x--01', 'y--02'], ['partida', 'x--01', '--spec'],
    ['presentar'], ['presentar', 'x--01', '--otra'], ['presentar', '--spec', 'x--01'], ['presentar', '--spec', '--sin-base'],
    ['presentar', 'x--01', '--sin-base', '--sin-base'], ['presentar', '--spec', '--spec'], ['mensaje'], ['mensaje', '  '],
    ['autorizado'], ['autorizado', 'x'], ['verificar', 'x--01', '--plazo'], ['verificar', 'x--01', '--plazo', '0'], ['verificar', 'x--01', '--plazo', 'diez'],
    ['verificar', 'x--01', '--sin-base'],
  ]) {
    const r = cli(TMP, args);
    assert.equal(r.codigo, 2, JSON.stringify(args));
    assert.match(r.err, /Uso: node \.claude\/scripts\/encargo\.cjs/, JSON.stringify(args));
    assert.equal(r.out, '');
  }
  for (const args of [['autorizado', 'x--01'], ['verificar', 'x--01'], ['verificar', 'x--01', '--plazo', '30']]) {
    assert.deepEqual(cli(TMP, args), { codigo: 1, out: 'encargo: no estás dentro de un repo git\n', err: '' }, JSON.stringify(args));
  }
  assert.deepEqual(cli(TMP, ['partida', 'x--01']), { codigo: 1, out: 'encargo: no estás dentro de un repo git\n', err: '' });
  assert.equal(cli(TMP, ['mensaje', 'AVANCE']).codigo, 1);
});

// ---------------------------------------------------------------- partida

test('partida: la línea - Partida: con modulo/<x>@<sha7> local y la fecha con zona; sin modulo/<x> → 1; error propio → roto', () => {
  const p = proyecto();
  const sha = g(p.P, 'rev-parse', 'modulo/x');
  const ahora = new Date(2026, 9, 30, 14, 5);
  const r = cli(p.P, ['partida', 'x--02'], { ahora });
  assert.equal(r.codigo, 0);
  assert.equal(r.out, `- Partida: rama modulo/x--02 desde modulo/x@${sha.slice(0, 7)} · ${C.isoConZona(ahora)}\n`);
  assert.match(C.isoConZona(ahora), /^2026-10-30T14:05[+-]\d{2}:\d{2}$/);
  // La línea que imprime partida es la que la plantilla lee.
  const E = require('../hooks/lib/encargo.cjs');
  const e = E.leerEncargo(encargo({ '# Encargo': '# Encargo 02 · x · otro', '- Partida:': r.out.trim() }), E.nombreEncargo('x--02'));
  assert.deepEqual(e.errores, []);
  assert.equal(e.campos.partida.sha, sha.slice(0, 7));
  const no = cli(p.P, ['partida', 'y--01']);
  assert.equal(no.codigo, 1);
  assert.match(no.out, /^partida: no — no existe modulo\/y en esta PC/);
  assert.deepEqual(cli(p.P, ['partida', 'x--02'], { ahora: 'no es una fecha' }), { codigo: 1, out: 'encargo roto: corré doctor\n', err: '' });
});

// ---------------------------------------------------------------- presentar: el sello (criterio 1)

test('presentar (crit. 1): sin sello → 1 "spec sin Arquitecto: corré Modo B", sin un commit; tocado → "cambió"; BORRADOR → "sin READY"; READY → 0', () => {
  const p = proyecto({ spec: spec({ sellar: false }) });
  const head = g(p.obr, 'rev-parse', 'HEAD');
  let r = cli(p.obr, ['presentar', 'x--01']);
  assert.equal(r.codigo, 1);
  assert.equal(r.out, 'presentar: no — spec sin Arquitecto: corré Modo B\n');
  assert.equal(g(p.obr, 'rev-parse', 'HEAD'), head, 'sin un commit');
  assert.equal(g(p.obr, 'status', '--porcelain'), '', 'sin tocar nada');
  // Sellado y tocado después.
  commit(p.dir, { 'docs/modulos/x/SPEC.md': spec({ despues: 'una línea más\n' }) }, 'tocado');
  r = cli(p.obr, ['presentar', 'x--01']);
  assert.equal(r.codigo, 1);
  assert.equal(r.out, 'presentar: no — el spec cambió después del sello: que el director corra sello de nuevo\n');
  // Sello bueno en BORRADOR.
  commit(p.dir, { 'docs/modulos/x/SPEC.md': spec({ estado: 'BORRADOR' }) }, 'borrador');
  r = cli(p.obr, ['presentar', 'x--01']);
  assert.equal(r.codigo, 1);
  assert.equal(r.out, 'presentar: no — spec sin READY: falta el OK de Guido y `ready`\n');
  // Sellado y READY.
  commit(p.dir, { 'docs/modulos/x/SPEC.md': spec() }, 'ready');
  r = cli(p.obr, ['presentar', 'x--01']);
  assert.equal(r.codigo, 0, r.out);
  assert.equal(r.out, `modulo/x--01 · @${head.slice(0, 7)} · encargo ${RUTA} · sonnet medium · riesgo bajo · apertura Guido\nbase: verde (node base.js)\n`);
  // Por el script de verdad (otro proceso), igual.
  const s = spawnSync(process.execPath, [SCRIPT, 'presentar', 'x--01', '--sin-base'], { cwd: p.obr, encoding: 'utf8', env: process.env });
  assert.equal(s.status, 0, s.stdout + s.stderr);
  assert.equal(s.stdout, `modulo/x--01 · @${head.slice(0, 7)} · encargo ${RUTA} · sonnet medium · riesgo bajo · apertura Guido\n`);
  // Sello inválido (entorno quitado sin el gate quitado en la ficha) y el spec que no está.
  commit(p.dir, { 'docs/modulos/x/SPEC.md': spec({ entorno: '— (quitado: sin base)' }) }, 'quitado');
  r = cli(p.obr, ['presentar', 'x--01']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /^presentar: no — sello inválido: entorno dice quitado, .*: que el director llame al Arquitecto\n$/);
  g(p.dir, 'rm', '-q', 'docs/modulos/x/SPEC.md');
  g(p.dir, 'commit', '-q', '-m', 'sin spec');
  r = cli(p.obr, ['presentar', 'x--01']);
  assert.equal(r.codigo, 1);
  assert.equal(r.out, 'presentar: no — el spec docs/modulos/x/SPEC.md no está en modulo/x: que el director lo commitee\n');
});

test('presentar: entorno "— (quitado: …)" vale con el gate quitado en la ficha vigente; sin ficha en el checkout, "—" vale igual', () => {
  const p = proyecto({ spec: spec({ entorno: '— (quitado: sin base)' }), ficha: { quitado: true } });
  assert.equal(cli(p.obr, ['presentar', 'x--01', '--sin-base']).codigo, 0);
  const q = proyecto({ spec: spec({ entorno: '— (quitado: sin base)' }) });
  assert.match(cli(q.obr, ['presentar', 'x--01', '--sin-base']).out, /sello inválido: entorno dice quitado/);
  fs.rmSync(path.join(q.obr, '.claude', 'kit.md'));
  assert.equal(cli(q.obr, ['presentar', 'x--01', '--sin-base']).codigo, 0, 'hayFicha mira .claude/kit.md del checkout');
});

// ---------------------------------------------------------------- presentar: el resto (criterio 2)

test('presentar (crit. 2): rama distinta → 1; la base ROJA o colgada no cambia la salida; --sin-base no la corre', () => {
  const p = proyecto();
  for (const [cwd, rama] of [[p.dir, 'modulo/x'], [p.P, 'main']]) {
    const r = cli(cwd, ['presentar', 'x--01']);
    assert.equal(r.codigo, 1);
    assert.equal(r.out, `presentar: no — esta pestaña está en ${rama}, el encargo es de modulo/x--01: abrí la del worktree\n`);
  }
  assert.match(cli(p.obr, ['presentar', 'x--02']).out, /esta pestaña está en modulo\/x--01, el encargo es de modulo\/x--02/);
  const roja = conBase('rojo', () => cli(p.obr, ['presentar', 'x--01']));
  assert.equal(roja.codigo, 0);
  assert.match(roja.out, /\nbase: ROJA \(ya estaba roto: node base\.js salió 3\)\n$/);
  const colgada = conBase('cuelga', () => cli(p.obr, ['presentar', 'x--01'], { plazoBaseMs: 1500 }));
  assert.equal(colgada.codigo, 0);
  assert.match(colgada.out, /\nbase: NO VERIFICADO \(node base\.js pasó los 2 s\)\n$/);
  const sin = conBase('rojo', () => cli(p.obr, ['presentar', 'x--01', '--sin-base']));
  assert.equal(sin.codigo, 0);
  assert.doesNotMatch(sin.out, /base:/);
  assert.equal(C.PLAZO_BASE_MS, 10 * 60 * 1000);
});

test('presentar: sin vars.comando-test en la ficha vigente → base NO VERIFICADO, salida 0', () => {
  const p = proyecto({ ficha: { test: '' } });
  const r = cli(p.obr, ['presentar', 'x--01']);
  assert.equal(r.codigo, 0);
  assert.match(r.out, /\nbase: NO VERIFICADO \(la ficha vigente no tiene vars\.comando-test\)\n$/);
});

test('presentar (crit. 2): encargo solo en el disco → 1; dos con el mismo ID → 1; faltan campos → 1 con cuáles', () => {
  const p = proyecto({ encargo: null });
  escribir(p.dir, RUTA, encargo());
  escribir(p.obr, RUTA, encargo());
  let r = cli(p.obr, ['presentar', 'x--01']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /^presentar: no — no hay encargo 01 commiteado en modulo\/x/);
  // Commiteado con campos de menos.
  commit(p.dir, { [RUTA]: encargo({ '- Riesgo:': null, '- Apertura:': null, '## GATE': null, '- `npm': null }) }, 'encargo a medias');
  r = cli(p.obr, ['presentar', 'x--01']);
  assert.equal(r.codigo, 1);
  assert.equal(r.out, `presentar: no — el encargo ${RUTA} no sigue la plantilla: faltan - Riesgo:, - Apertura:, ## GATE: que el director lo corrija y lo commitee\n`);
  // Uno bueno y otro con el mismo ID.
  commit(p.dir, { [RUTA]: encargo(), 'docs/modulos/x/bitacora/2026-10-31-encargo-01.md': encargo() }, 'dos 01');
  r = cli(p.obr, ['presentar', 'x--01']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /^presentar: no — hay 2 encargos 01 en modulo\/x/);
});

test('presentar: el encargo en origin más nuevo que el local → se usa; divergido → 1 "divergió de origin"', () => {
  const p = proyecto({ encargo: null });
  assert.equal(cli(p.obr, ['presentar', 'x--01']).codigo, 1);
  empujarDesdeOtra(p, { [RUTA]: encargo() });
  const r = cli(p.obr, ['presentar', 'x--01', '--sin-base']);
  assert.equal(r.codigo, 0, r.out);
  assert.match(r.out, new RegExp(`encargo ${RUTA}`));
  commit(p.dir, { 'otro.txt': 'local\n' }, 'local'); // modulo/x local: atrás de origin y con uno propio
  const d = cli(p.obr, ['presentar', 'x--01']);
  assert.equal(d.codigo, 1);
  assert.match(d.out, /^presentar: no — modulo\/x divergió de origin/);
});

test('presentar --spec: desde el worktree del director, solo el sello; desde otra pestaña → 1', () => {
  const p = proyecto({ spec: spec({ sellar: false }) });
  let r = cli(p.dir, ['presentar', '--spec']);
  assert.equal(r.codigo, 1);
  assert.equal(r.out, 'presentar --spec: no — spec sin Arquitecto: corré Modo B\n');
  const sha = commit(p.dir, { 'docs/modulos/x/SPEC.md': spec() }, 'sellado');
  r = cli(p.dir, ['presentar', '--spec']);
  assert.equal(r.codigo, 0, r.out);
  assert.equal(r.out, `presentar --spec: docs/modulos/x/SPEC.md en modulo/x @${sha.slice(0, 7)} · sellado y READY: se puede repartir\n`);
  for (const [cwd, rama] of [[p.obr, 'modulo/x--01'], [p.P, 'main']]) {
    r = cli(cwd, ['presentar', '--spec']);
    assert.equal(r.codigo, 1);
    assert.equal(r.out, `presentar --spec: no — esta pestaña está en ${rama}: --spec corre desde el worktree del director (modulo/<x>)\n`);
  }
});

// ---------------------------------------------------------------- mensaje (criterio 3)

test('mensaje (crit. 3): CORRECCION con la ruta commiteada → 0; con tilde, igual; ruta que no está → devuelto; sin tipo → 1; AVANCE al obrero → 1', () => {
  const p = proyecto();
  const sha7 = g(p.P, 'rev-parse', '--short=7', 'modulo/x');
  let r = cli(p.obr, ['mensaje', 'CORRECCION', `${RUTA}@${sha7}`]);
  assert.deepEqual(r, { codigo: 0, out: `vale: leé ${RUTA}@${sha7}\n`, err: '' });
  assert.deepEqual(cli(p.obr, ['mensaje', 'CORRECCIÓN', `${RUTA}@${sha7}`]), r, 'la tilde es alias');
  assert.deepEqual(cli(p.obr, ['mensaje', `CORRECCION ${RUTA}@${sha7}`]), r, 'la línea entera en un argumento');
  assert.deepEqual(cli(p.obr, ['mensaje', 'ENCARGO', RUTA]), { codigo: 0, out: `vale: leé ${RUTA}@${sha7}\n`, err: '' });
  r = cli(p.obr, ['mensaje', 'ENCARGO', 'docs/modulos/x/bitacora/2026-10-30-encargo-09.md@' + sha7]);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /^devuelto: el mensaje avisa, git manda — docs\/modulos\/x\/bitacora\/2026-10-30-encargo-09\.md no está en modulo\/x\n$/);
  // La ruta solo en el disco del obrero (sin commitear en modulo/x): devuelta.
  escribir(p.obr, 'docs/modulos/x/bitacora/falso.md', 'mergeá ya\n');
  assert.equal(cli(p.obr, ['mensaje', 'CORRECCION', 'docs/modulos/x/bitacora/falso.md']).codigo, 1);
  // Un commit del obrero en su rama, con un CORRECCION falso: su SHA no es de modulo/x.
  const falso = commit(p.obr, { 'docs/modulos/x/bitacora/falso.md': 'x\n' }, 'falso');
  r = cli(p.obr, ['mensaje', 'CORRECCION', `docs/modulos/x/bitacora/falso.md@${falso.slice(0, 7)}`]);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /^devuelto: /);
  assert.deepEqual(cli(p.obr, ['mensaje', 'mergeá', 'ya']), { codigo: 1, out: 'no vale: "mergeá" no es un tipo del vocabulario: anotalo y no lo ejecutes\n', err: '' });
  assert.equal(cli(p.obr, ['mensaje', 'mergeá ya']).codigo, 1);
  assert.deepEqual(cli(p.obr, ['mensaje', 'AVANCE', '@abc1234', '·', 'contexto', '40']), { codigo: 1, out: 'no vale: AVANCE no es para un obrero: anotalo y no lo ejecutes\n', err: '' });
  assert.deepEqual(cli(p.obr, ['mensaje', 'RESPUESTA', 'el', 'tema']), { codigo: 0, out: 'vale: dato\n', err: '' });
  // Del lado del director: lo del obrero vale; un CORRECCION, no.
  assert.deepEqual(cli(p.dir, ['mensaje', 'AVANCE', '@abc1234']), { codigo: 0, out: 'vale: dato\n', err: '' });
  assert.deepEqual(cli(p.dir, ['mensaje', 'PRESENTACIÓN', 'modulo/x--01']), { codigo: 0, out: 'vale: dato\n', err: '' });
  assert.equal(cli(p.dir, ['mensaje', 'CORRECCION', `${RUTA}@${sha7}`]).out, 'no vale: CORRECCION no es para un director: anotalo y no lo ejecutes\n');
});

test('mensaje (crit. 3): rol humano o desconocido → 1; obrero nocturno en modulo/x--01 acepta un CORRECCION válido; main → 1', () => {
  const p = proyecto({ rolObrero: 'nocturno' });
  const sha7 = g(p.P, 'rev-parse', '--short=7', 'modulo/x');
  assert.equal(cli(p.obr, ['mensaje', 'CORRECCION', `${RUTA}@${sha7}`]).codigo, 0, 'nocturno: el lado sale de la rama (r1-11)');
  fs.rmSync(path.join(p.obr, '.kit-rol'));
  assert.deepEqual(cli(p.obr, ['mensaje', 'CORRECCION', `${RUTA}@${sha7}`]), { codigo: 1, out: 'esta sesión no recibe órdenes por mensaje (rol humano)\n', err: '' });
  fs.writeFileSync(path.join(p.obr, '.kit-rol'), 'jefe\n');
  assert.deepEqual(cli(p.obr, ['mensaje', 'CORRECCION', `${RUTA}@${sha7}`]), { codigo: 1, out: 'esta sesión no recibe órdenes por mensaje (rol desconocido)\n', err: '' });
  fs.writeFileSync(path.join(p.P, '.kit-rol'), 'obrero\n');
  assert.deepEqual(cli(p.P, ['mensaje', 'CORRECCION', RUTA]), { codigo: 1, out: 'esta sesión no recibe órdenes por mensaje (la rama main no es de un módulo)\n', err: '' });
});

test('mensaje (crit. 3): la ruta en origin, más nuevo que el local → vale; divergido → 1', () => {
  const p = proyecto();
  const nueva = 'docs/modulos/x/bitacora/2026-10-30-correccion-01.md';
  assert.equal(cli(p.obr, ['mensaje', 'CORRECCION', nueva]).codigo, 1, 'todavía no está en ningún lado');
  const sha = empujarDesdeOtra(p, { [nueva]: 'cancelado\n' });
  assert.deepEqual(cli(p.obr, ['mensaje', 'CORRECCION', `${nueva}@${sha.slice(0, 7)}`]), { codigo: 0, out: `vale: leé ${nueva}@${sha.slice(0, 7)}\n`, err: '' });
  commit(p.dir, { 'otro.txt': 'local\n' }, 'local');
  const r = cli(p.obr, ['mensaje', 'CORRECCION', `${nueva}@${sha.slice(0, 7)}`]);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /^modulo\/x divergió de origin/);
});

// ---------------------------------------------------------------- autorizado y verificar (criterios 4 y 5): ayudantes

const W = require('./worktree.cjs');
const E = require('../hooks/lib/encargo.cjs');
const X = require('../hooks/lib/contexto.cjs');
const CF = require('../hooks/lib/cambios.cjs');
const cambiosScript = require('./cambios.cjs');

// gate.js: el comando de ## GATE (rojo con GATE_MODO=rojo); cuelga.js: un test colgado que anota su pid.
const GATE_JS = "process.exit(process.env.GATE_MODO === 'rojo' ? 5 : 0);\n";
const CUELGA_JS = "require('fs').writeFileSync(process.env.KIT_PRUEBA_PID, String(process.pid));\nsetTimeout(() => {}, 30000);\n";
const FRENOS = '2026-10-29T10:00-03:00 · uno\n2026-10-29T11:00-03:00 · dos\n';
const CUERPO = '## Caso de origen\nel obrero quiere borrar datos (2026-10)\n\n## Regla\nquitar la pregunta\n\n## Dónde vive\n.claude/kit.md\n\n## Medición\n| antes | después |\n';
const CON_QUITADO = ficha().replace('  quitados: []', '  quitados:\n    - {id: pregunta:borrar-datos-reales, por: "lo pidió el obrero", hasta: siempre}');

// La partida un minuto adelante: lo que se commitea en main al armar el proyecto no cuenta como "después de la partida".
const partidaAhora = () => `- Partida: rama modulo/x--01 desde modulo/x@abc1234 · ${C.isoConZona(new Date(Date.now() + 60000))}`;

// El proyecto de verificar: AUTORIZADO con dos reglas, GATE con node gate.js, frenos.log commiteado en main y el settings.local.json
// del worktree del obrero con el deny que suma worktree (como lo deja `worktree crear`).
function proyectoV(o = {}) {
  const p = proyecto({
    archivos: { 'gate.js': GATE_JS, 'cuelga.js': CUELGA_JS, '.claude/frenos.log': FRENOS },
    ficha: o.ficha,
    rolObrero: o.rolObrero,
    encargo: encargo({ '- Partida:': partidaAhora(), '- Bash(npm run build)': ['- Bash(npm run build)', '- Edit(src/x/**)'], '- `npm run lint`': '- `node gate.js`' }),
  });
  p.principal = path.dirname(X.datosGit(p.obr).gitComun);
  p.deny = W.reglasDeny(p.principal);
  p.settings = path.join(p.obr, '.claude', 'settings.local.json');
  escribir(p.obr, '.claude/settings.local.json', `${JSON.stringify({ permissions: { deny: p.deny } }, null, 2)}\n`);
  return p;
}
const leerSettings = (p) => JSON.parse(fs.readFileSync(p.settings, 'utf8'));
const escribirSettings = (p, s) => fs.writeFileSync(p.settings, `${JSON.stringify(s, null, 2)}\n`);
const textoEncargo = (p) => fs.readFileSync(path.join(p.dir, ...RUTA.split('/')), 'utf8');
const aut = (p, extra = {}) => cli(p.obr, ['autorizado', 'x--01'], { claudeEnPath: true, ...extra });
// El sub-paso hecho: su commit en el worktree del obrero, autorizado y la rama pusheada.
function listo(p, archivos = { 'src/x/a.js': 'a\n' }) {
  const sha = commit(p.obr, archivos, 'sub-paso');
  const r = aut(p);
  assert.equal(r.codigo, 0, r.out);
  g(p.obr, 'push', '-q', 'origin', 'modulo/x--01');
  return sha;
}
function ver(cwd, extra = {}, args = []) {
  const r = cli(cwd, ['verificar', 'x--01', ...args], extra);
  const lineas = r.out.split('\n').filter(Boolean);
  return { ...r, lineas, linea: (i) => lineas[i - 1] };
}
const IDS = ['remoto', 'limpio', 'pruebas', 'alcance', 'main', 'barreras'];
// Las seis marcas en orden, y que sean seis, con sus ids, en orden (criterio 5: siempre seis líneas).
function marcas(r) {
  assert.equal(r.lineas.length, 6, r.out);
  r.lineas.forEach((l, i) => assert.ok(l.startsWith(`${i + 1}. ${IDS[i]} · `), l));
  return r.lineas.map((l) => /^\d\. \S+ · (✅|❌|⚠️) · /.exec(l)[1]).join('');
}
// La marca de la línea i (1 a 6): ⚠️ son dos caracteres, así que no se indexa el texto de marcas().
const marca = (r, i) => /^\d\. \S+ · (✅|❌|⚠️) · /.exec(r.lineas[i - 1])[1];
function conEntorno(vars, fn) {
  const antes = {};
  for (const [k, v] of Object.entries(vars)) {
    antes[k] = process.env[k];
    process.env[k] = v;
  }
  try {
    return fn();
  } finally {
    for (const k of Object.keys(vars)) {
      if (antes[k] === undefined) delete process.env[k];
      else process.env[k] = antes[k];
    }
  }
}

// ---------------------------------------------------------------- autorizado (criterio 4)

test('autorizado (crit. 4): allow = la base (con sus formas PowerShell) + las dos del encargo; el deny y las otras claves intactos; ninguna clave del kit', () => {
  const p = proyectoV();
  escribirSettings(p, { permissions: { deny: p.deny, ask: ['Bash(git push --force:*)'], allow: ['Bash(curl:*)'] }, env: { A: '1' } });
  const r = aut(p);
  assert.equal(r.codigo, 0, r.out);
  const base = E.base('node base.js');
  for (const regla of ['PowerShell(git status:*)', 'PowerShell(git commit:*)', 'PowerShell(node .claude/scripts/encargo.cjs:*)', 'PowerShell(node base.js)', 'PowerShell(node base.js *)', 'Bash(node base.js *)', 'Agent', 'Skill']) {
    assert.ok(base.includes(regla), regla);
  }
  const s = leerSettings(p);
  assert.deepEqual(s, { permissions: { deny: p.deny, ask: ['Bash(git push --force:*)'], allow: [...base, 'Bash(npm run build)', 'Edit(src/x/**)'] }, env: { A: '1' } });
  const sha7 = g(p.P, 'rev-parse', '--short=7', 'modulo/x');
  assert.match(r.out, new RegExp(`^autorizado: ${base.length + 2} reglas en \\.claude/settings\\.local\\.json de \\.claude/worktrees/modulo--x--01 \\(la base, ${base.length}, \\+ 2 de ${RUTA}@${sha7}\\)\n`));
  assert.match(r.out, /\nsaqué 1 que no venían de la base ni del encargo \(lo sumado con "no preguntar más" se pierde cada vez que corre autorizado\): Bash\(curl:\*\)\n/);
  assert.doesNotMatch(r.out, /ojo:/);
});

test('autorizado (crit. 4, r1-5): de nuevo tras una CORRECCION que saca una regla → la regla ya no está (sin estado); sin sacar nada, lo avisa igual', () => {
  const p = proyectoV();
  assert.equal(aut(p).codigo, 0);
  commit(p.dir, { [RUTA]: textoEncargo(p).replace('- Edit(src/x/**)\n', '') }, 'CORRECCION: sin Edit');
  const r = aut(p);
  assert.equal(r.codigo, 0, r.out);
  assert.deepEqual(leerSettings(p).permissions.allow, [...E.base('node base.js'), 'Bash(npm run build)']);
  assert.match(r.out, /\nsaqué 1 .*: Edit\(src\/x\/\*\*\)\n/);
  const otra = aut(p);
  assert.match(otra.out, /\nlo que se sume con "no preguntar más" se pierde la próxima vez que corra autorizado \(allow se reescribe entero\)\n/);
  // Sin vars.comando-test, la base va sin el test, y lo dice; sin deny, lo dice.
  const q = proyectoV({ ficha: { test: '' } });
  fs.rmSync(q.settings);
  const sin = aut(q);
  assert.equal(sin.codigo, 0, sin.out);
  assert.deepEqual(leerSettings(q), { permissions: { allow: [...E.base(''), 'Bash(npm run build)', 'Edit(src/x/**)'] } });
  assert.match(sin.out, /\nla ficha vigente no tiene vars\.comando-test: la base va sin las reglas del test\n/);
  assert.match(sin.out, /\nojo: \.claude\/settings\.local\.json no tiene el deny de worktree: corré worktree abrir/);
});

test('autorizado (crit. 4): cada negativa → 1 sin tocar el archivo; una - Partida: repetida → 1 (el error sale en el director); settings roto o sin worktree → 1', () => {
  const p = proyectoV();
  const antes = fs.readFileSync(p.settings);
  const bueno = textoEncargo(p);
  for (const mala of ['Bash(*)', 'Bash(node:*)', 'Edit(//c/Users/x/**)', 'Edit(~/.claude/**)', 'Edit(../x)', 'Edit(**)', 'Task(x)']) {
    commit(p.dir, { [RUTA]: bueno.replace('- Edit(src/x/**)\n', `- Edit(src/x/**)\n- ${mala}\n`) }, `mala ${mala}`);
    const r = aut(p);
    assert.equal(r.codigo, 1, mala);
    assert.ok(r.out.startsWith(`autorizado: no — ## AUTORIZADO de ${RUTA} tiene una regla que no vale; no escribí nada:\n  ${mala}: `), r.out);
    assert.deepEqual(fs.readFileSync(p.settings), antes, mala);
  }
  commit(p.dir, { [RUTA]: bueno.replace(/^(- Partida: .*)$/m, '$1\n$1') }, 'partida doble');
  let r = aut(p);
  assert.equal(r.codigo, 1);
  assert.match(r.out, new RegExp(`^autorizado: no — el encargo ${RUTA} no sigue la plantilla: - Partida: está dos veces: que el director lo corrija y lo commitee\n$`));
  assert.deepEqual(fs.readFileSync(p.settings), antes);
  commit(p.dir, { [RUTA]: bueno }, 'bueno');
  fs.writeFileSync(p.settings, '{ "permissions": { "allow": "Read" } }\n');
  r = aut(p);
  assert.equal(r.codigo, 1);
  assert.equal(r.out, 'autorizado: no — permissions.allow de .claude/settings.local.json no es una lista: arreglalo y corré autorizado de nuevo (no escribí nada)\n');
  fs.writeFileSync(p.settings, '{ roto');
  assert.match(aut(p).out, /no es un JSON válido/);
  assert.equal(fs.readFileSync(p.settings, 'utf8'), '{ roto');
  assert.match(cli(p.dir, ['autorizado', 'x--02']).out, /^autorizado: no — no hay encargo 02 commiteado en modulo\/x/);
  g(p.P, 'worktree', 'remove', '--force', p.obr);
  r = cli(p.dir, ['autorizado', 'x--01'], { claudeEnPath: true });
  assert.deepEqual(r, { codigo: 1, out: 'autorizado: no — el worktree de modulo/x--01 no está en esta PC: worktree crear x--01 (o abrir) y después autorizado\n', err: '' });
});

test('autorizado (crit. 4, D5-2, D5-19): la de fondo con acceptEdits, la base y las reglas, una por argumento, y nunca el bypass; la de Guido no fuerza el modo; sin claude → la apertura es de Guido', () => {
  const p = proyectoV();
  const r = aut(p);
  const lineas = r.out.trim().split('\n');
  const reglas = [...E.base('node base.js'), 'Bash(npm run build)', 'Edit(src/x/**)'];
  const fondo = lineas[lineas.length - 1];
  assert.match(fondo, /^apertura de fondo: cd "[^"]+\/modulo--x--01"; claude -p "\/obrero x--01" --model sonnet --permission-mode acceptEdits --allowedTools "Read" /);
  assert.ok(fondo.endsWith(`--allowedTools ${reglas.map((x) => `"${x}"`).join(' ')}`), fondo);
  const guido = lineas[lineas.length - 2];
  assert.match(guido, /^apertura de Guido: code "[^"]+\/modulo--x--01" → en esa ventana, la pestaña de Claude con Sonnet, en tu modo \(nombre sugerido: obrero-x--01\)$/);
  assert.doesNotMatch(r.out, /bypass|dangerously|--permission-mode (?!acceptEdits)/i);
  const sin = aut(p, { claudeEnPath: false });
  assert.equal(sin.out.trim().split('\n').pop(), 'apertura de fondo: sin `claude` en el PATH: la apertura es de Guido');
  // El modelo sale del encargo.
  commit(p.dir, { [RUTA]: textoEncargo(p).replace('- Modelo: sonnet', '- Modelo: opus') }, 'opus');
  assert.match(aut(p).out, /con Opus, en tu modo[\s\S]*--model opus --permission-mode acceptEdits/);
  // Las comillas: dobles si se puede; simples si la regla trae comillas dobles o $; con una simple adentro, ninguna sirve.
  assert.equal(C.citar('Read'), '"Read"');
  assert.equal(C.citar('Bash(node --test "kit/**/*.test.cjs")'), `'Bash(node --test "kit/**/*.test.cjs")'`);
  assert.equal(C.citar("Bash(echo 'a' \"b\")"), null);
  const q = proyectoV({ ficha: { test: "node t.js '$x'" } });
  assert.match(aut(q).out, /\napertura de fondo: la regla Bash\(node t\.js '\$x'\) no se puede citar igual en PowerShell y en Bash: la apertura es de Guido\n$/);
  const h = proyectoV({ ficha: { test: 'echo $HOME' } });
  assert.match(aut(h).out, / 'Bash\(echo \$HOME\)' 'Bash\(echo \$HOME \*\)' "PowerShell\(git status:\*\)"/);
  // Criterio 11: el script no nombra el modo que saltea los permisos.
  assert.doesNotMatch(fs.readFileSync(SCRIPT, 'utf8'), /bypassPermissions/);
});

// ---------------------------------------------------------------- verificar (criterio 5)

test('verificar (crit. 5): todo en orden → seis ✅ y salida 0, la línea 1 con la punta; desde el director, el principal o el obrero; por el script de verdad, igual', () => {
  const p = proyectoV();
  const sha = listo(p);
  for (const cwd of [p.dir, p.P, p.obr]) {
    const r = ver(cwd);
    assert.equal(r.codigo, 0, r.out);
    assert.equal(marcas(r), '✅✅✅✅✅✅', r.out);
    assert.equal(r.linea(1), `1. remoto · ✅ · punta @${sha.slice(0, 7)} = origin/modulo/x--01`);
    assert.equal(r.linea(2), '2. limpio · ✅ · el worktree está limpio');
    assert.equal(r.linea(3), '3. pruebas · ✅ · en verde: node base.js · node gate.js');
    assert.equal(r.linea(4), '4. alcance · ✅ · 1 archivo(s), todos en ## Toca, la evidencia o .claude/frenos.log');
    assert.match(r.linea(5), /^5\. main · ✅ · 0 commit\(s\) en main después de la partida \(.+\) · principal: ## main$/);
    assert.equal(r.linea(6), '6. barreras · ✅ · candado verde · .claude/frenos.log sin bajas · allow ⊆ base + AUTORIZADO · deny de worktree completo');
  }
  const s = spawnSync(process.execPath, [SCRIPT, 'verificar', 'x--01', '--plazo', '5'], { cwd: p.dir, encoding: 'utf8', env: process.env });
  assert.equal(s.status, 0, s.stdout + s.stderr);
  assert.equal(s.stdout.trim().split('\n').length, 6);
  assert.equal(C.PLAZO_VERIFICAR_MIN, 30);
});

test('verificar línea 1 (remoto): sin pushear → ❌; adelante → ❌; origin que avanzó desde otra PC → ❌ atrás (el fetch lo trae); sin remoto → ✅', () => {
  const p = proyectoV();
  const a = commit(p.obr, { 'src/x/a.js': 'a\n' }, 'sub-paso');
  aut(p);
  let r = ver(p.dir);
  assert.equal(r.codigo, 1);
  assert.equal(marca(r, 1), '❌');
  assert.equal(r.linea(1), `1. remoto · ❌ · punta @${a.slice(0, 7)} · origin no tiene modulo/x--01: pusheá la rama`);
  g(p.obr, 'push', '-q', 'origin', 'modulo/x--01');
  const b = commit(p.obr, { 'src/x/b.js': 'b\n' }, 'otro');
  r = ver(p.dir);
  assert.equal(r.linea(1), `1. remoto · ❌ · punta @${b.slice(0, 7)} · adelante de origin/modulo/x--01 @${a.slice(0, 7)}: pusheá la rama`);
  g(p.obr, 'push', '-q', 'origin', 'modulo/x--01');
  const otra = path.join(p.base, `otra${k++}`);
  g(p.base, 'clone', '-q', '-b', 'modulo/x--01', p.remoto, otra);
  const c = commit(otra, { 'src/x/c.js': 'c\n' }, 'desde otra PC');
  g(otra, 'push', '-q', 'origin', 'modulo/x--01');
  r = ver(p.dir);
  assert.equal(r.linea(1), `1. remoto · ❌ · punta @${b.slice(0, 7)} · atrás de origin/modulo/x--01 @${c.slice(0, 7)}: pusheá la rama`);
  g(p.P, 'remote', 'remove', 'origin');
  r = ver(p.dir);
  assert.equal(r.linea(1), `1. remoto · ✅ · punta @${b.slice(0, 7)} · sin remoto`);
  marcas(r);
});

test('verificar línea 2 (limpio): solo renglones agregados a frenos.log sin commitear → ⚠️ y salida 0; frenos.log cambiado en el medio → ❌; otro archivo → ❌', () => {
  const p = proyectoV();
  listo(p);
  fs.appendFileSync(path.join(p.obr, '.claude', 'frenos.log'), '2026-10-31T10:00-03:00 · tres\n');
  let r = ver(p.dir);
  assert.equal(r.codigo, 0, r.out);
  assert.equal(marcas(r), '✅⚠️✅✅✅✅');
  assert.equal(r.linea(2), '2. limpio · ⚠️ · .claude/frenos.log con 1 renglón(es) agregado(s) sin commitear (los muda worktree cerrar)');
  escribir(p.obr, '.claude/frenos.log', FRENOS.replace('uno', 'UNO'));
  r = ver(p.dir);
  assert.equal(r.codigo, 1);
  assert.equal(r.linea(2), '2. limpio · ❌ · .claude/frenos.log cambió en el medio o se borró (no solo renglones al final): revisalo');
  escribir(p.obr, '.claude/frenos.log', FRENOS);
  escribir(p.obr, 'src/x/sin-commit.js', 'x\n');
  r = ver(p.dir);
  assert.equal(r.codigo, 1);
  assert.equal(marca(r, 2), '❌');
  assert.equal(r.linea(2), '2. limpio · ❌ · sin commitear: src/x/sin-commit.js');
});

test('verificar línea 3 (pruebas): comando-test rojo → ❌; un GATE rojo → ❌ con cuál; un GATE con tubería → NO VERIFICADO; colgado → NO VERIFICADO, 1 y el árbol muerto', () => {
  const p = proyectoV();
  listo(p);
  let r = conBase('rojo', () => ver(p.dir));
  assert.equal(r.codigo, 1);
  assert.equal(marcas(r), '✅✅❌✅✅✅');
  assert.equal(r.linea(3), '3. pruebas · ❌ · commit con la suite en rojo: node base.js (salida 3)');
  r = conEntorno({ GATE_MODO: 'rojo' }, () => ver(p.dir));
  assert.equal(r.codigo, 1);
  assert.equal(r.linea(3), '3. pruebas · ❌ · commit con la suite en rojo: node gate.js (salida 5)');
  commit(p.dir, { [RUTA]: textoEncargo(p).replace('- `node gate.js`', '- `node gate.js | tail -1`') }, 'gate con tubería');
  r = ver(p.dir);
  assert.equal(r.codigo, 1);
  assert.equal(r.linea(3), '3. pruebas · ❌ · NO VERIFICADO — node gate.js | tail -1 tiene una tubería: el gate mira el código de salida (sacala)');
  assert.ok(!C.conTuberia('node -e "a|b"') && C.conTuberia('npm test || true'));
  // Colgado: el vigía lo mata con todo lo que lanzó.
  const q = proyectoV({ ficha: { test: 'node cuelga.js' } });
  listo(q);
  const archivoPid = path.join(TMP, `cuelga-${k++}.pid`);
  r = conEntorno({ KIT_PRUEBA_PID: archivoPid }, () => ver(q.dir, { plazoMs: 1500 }));
  assert.equal(r.codigo, 1);
  assert.equal(marcas(r), '✅✅❌✅✅✅');
  assert.equal(r.linea(3), '3. pruebas · ❌ · NO VERIFICADO — node cuelga.js no terminó en 2 s (lo maté con todo lo que lanzó)');
  assert.throws(() => process.kill(Number(fs.readFileSync(archivoPid, 'utf8')), 0), 'el test colgado quedó vivo');
  // Sin comando-test en la ficha vigente: NO VERIFICADO.
  const s = proyectoV({ ficha: { test: '' } });
  listo(s);
  assert.equal(ver(s.dir).linea(3), '3. pruebas · ❌ · NO VERIFICADO — la ficha vigente no tiene vars.comando-test');
});

test('verificar línea 4 (alcance): la evidencia y frenos.log no cuentan; fuera de ## Toca → ⚠️ con la lista y salida 0', () => {
  const p = proyectoV();
  listo(p, { 'src/x/a.js': 'a\n', 'docs/modulos/x/bitacora/2026-10-31-evidencia-01.md': 'probé\n', '.claude/frenos.log': `${FRENOS}2026-10-31T10:00-03:00 · tres\n` });
  let r = ver(p.dir);
  assert.equal(r.codigo, 0, r.out);
  assert.equal(r.linea(4), '4. alcance · ✅ · 3 archivo(s), todos en ## Toca, la evidencia o .claude/frenos.log');
  commit(p.obr, { 'otro/fuera.js': 'x\n', 'docs/modulos/x/bitacora/2026-10-31-evidencia-02.md': 'de otro\n' }, 'de más');
  g(p.obr, 'push', '-q', 'origin', 'modulo/x--01');
  r = ver(p.dir);
  assert.equal(r.codigo, 0, r.out);
  assert.equal(marcas(r), '✅✅✅⚠️✅✅');
  assert.equal(r.linea(4), '4. alcance · ⚠️ · 2 fuera de ## Toca (el director decide): docs/modulos/x/bitacora/2026-10-31-evidencia-02.md, otro/fuera.js');
  for (const [ruta, patron, si] of [
    ['src/x/a/b.js', 'src/x/**', true], ['src/xy/a.js', 'src/x/**', false], ['src/a.js', 'src/*.js', true], ['src/b/a.js', 'src/*.js', false],
    ['src/pagos/a.js', 'src/pagos/', true], ['src/pagos/a.js', 'src/pagos', true], ['README.md', './README.md', true], ['README.md.bak', 'README.md', false],
    ['a/b/c.ts', '**/*.ts', true], ['c.ts', '**/*.ts', true], ['a.js', 'a?js', true], ['a/js', 'a?js', false],
  ]) assert.equal(C.enToca(ruta, patron), si, `${ruta} ~ ${patron}`);
});

test('verificar línea 5 (main): un commit en main después de la partida → ⚠️ de día (salida 0), ❌ con el worktree nocturno; el principal sucio → ⚠️', () => {
  const p = proyectoV();
  listo(p);
  const futuro = new Date(Date.now() + 10 * 60000).toISOString();
  conEntorno({ GIT_COMMITTER_DATE: futuro, GIT_AUTHOR_DATE: futuro }, () => commit(p.P, { 'guido.txt': 'de Guido\n' }, 'Guido en main'));
  let r = ver(p.dir);
  assert.equal(r.codigo, 0, r.out);
  assert.equal(marcas(r), '✅✅✅✅⚠️✅');
  assert.match(r.linea(5), /^5\. main · ⚠️ · 1 commit\(s\) en main después de la partida \(.+\) · principal: ## main$/);
  fs.writeFileSync(path.join(p.obr, '.kit-rol'), 'nocturno\n');
  r = ver(p.dir);
  assert.equal(r.codigo, 1);
  assert.equal(marcas(r), '✅✅✅✅❌✅');
  assert.match(r.linea(5), /^5\. main · ❌ · 1 commit\(s\) en main después de la partida \(.+\): commit en main de noche: PARADA · principal: /);
  // Sin commits nuevos, de noche, ✅; el principal sucio (de día o de noche) → ⚠️.
  g(p.P, 'reset', '-q', '--hard', 'HEAD~1');
  assert.equal(marcas(ver(p.dir)), '✅✅✅✅✅✅');
  fs.writeFileSync(path.join(p.obr, '.kit-rol'), 'obrero\n');
  escribir(p.P, 'suelto.txt', 'x\n');
  r = ver(p.dir);
  assert.equal(r.codigo, 0);
  assert.match(r.linea(5), /^5\. main · ⚠️ · 0 commit\(s\) .* · principal: ## main · 1 sin commitear$/);
});

test('verificar línea 6 (barreras): pregunta:borrar-datos-reales sumado a frenos.quitados → ❌ (candado rojo)', () => {
  const p = proyectoV();
  listo(p, { '.claude/kit.md': CON_QUITADO });
  const r = ver(p.dir);
  assert.equal(r.codigo, 1);
  assert.equal(marcas(r), '✅✅✅⚠️✅❌');
  assert.match(r.linea(6), /^6\. barreras · ❌ · candado rojo: candado:barreras · el commit \w+ toca frenos \(pregunta:borrar-datos-reales\) sin un aprobado/);
});

test('verificar línea 6 (barreras): un cambio con estado: aprobado a mano no cubre el commit que quita el freno → ❌', () => {
  const p = proyectoV();
  let out = '';
  const c = cambiosScript.main(['nuevo', '--slug', 'datos', '--clase', '3-barrera', '--toca', 'frenos', '--id', 'pregunta:borrar-datos-reales', '--origen', 'lo pidió el obrero'], {
    cwd: p.obr, salida: (s) => (out += s), error: (s) => (out += s), entradaEstandar: () => CUERPO,
  });
  assert.equal(c, 0, out);
  const rel = `.claude/cambios/${/propuesto (\S+)/.exec(out)[1]}.md`;
  commit(p.obr, { [rel]: CF.ponerCampos(fs.readFileSync(path.join(p.obr, ...rel.split('/')), 'utf8'), { estado: 'aprobado' }) }, 'aprobado a mano');
  listo(p, { '.claude/kit.md': CON_QUITADO });
  const r = ver(p.dir);
  assert.equal(r.codigo, 1);
  assert.equal(marca(r, 6), '❌');
  assert.match(r.linea(6), /^6\. barreras · ❌ · candado rojo: candado:barreras · .*sin un aprobado/);
});

test('verificar línea 6 (barreras): la rama que borra un renglón de frenos.log → ❌; un allow de más → ⚠️ y salida 0; el deny sacado → ❌', () => {
  const p = proyectoV();
  listo(p, { 'src/x/a.js': 'a\n', '.claude/frenos.log': FRENOS.replace('2026-10-29T10:00-03:00 · uno\n', '') });
  let r = ver(p.dir);
  assert.equal(r.codigo, 1);
  assert.equal(marcas(r), '✅✅✅✅✅❌');
  assert.equal(r.linea(6), '6. barreras · ❌ · la rama borra 1 renglón(es) de .claude/frenos.log');
  const q = proyectoV();
  listo(q);
  const s = leerSettings(q);
  s.permissions.allow.push('Bash(curl:*)');
  escribirSettings(q, s);
  r = ver(q.dir);
  assert.equal(r.codigo, 0, r.out);
  assert.equal(marcas(r), '✅✅✅✅✅⚠️');
  assert.equal(r.linea(6), '6. barreras · ⚠️ · candado verde · .claude/frenos.log sin bajas · allow de más (ni en la base ni en ## AUTORIZADO): Bash(curl:*)');
  s.permissions.deny = s.permissions.deny.slice(1);
  escribirSettings(q, s);
  r = ver(q.dir);
  assert.equal(r.codigo, 1);
  assert.equal(r.linea(6), `6. barreras · ❌ · falta el deny de worktree (1): ${q.deny[0]} · allow de más (ni en la base ni en ## AUTORIZADO): Bash(curl:*)`);
  fs.rmSync(q.settings);
  r = ver(q.dir);
  assert.equal(r.codigo, 1);
  assert.match(r.linea(6), /^6\. barreras · ❌ · falta el deny de worktree \(6\): /);
});

test('verificar: siempre seis líneas — sin la rama, sin el worktree en esta PC, una línea que se rompe: ❌ NO VERIFICADO con el porqué; error propio → encargo roto + NO VERIFICADO', () => {
  const p = proyectoV();
  listo(p);
  let r = cli(p.dir, ['verificar', 'x--02']);
  const lineas = r.out.trim().split('\n');
  assert.equal(r.codigo, 1);
  assert.equal(lineas.length, 6, r.out);
  assert.equal(lineas[0], '1. remoto · ❌ · NO VERIFICADO — no existe modulo/x--02 en esta PC');
  for (const l of lineas) assert.match(l, /^\d\. \S+ · ❌ · NO VERIFICADO — /);
  // Algo propio que se rompe adentro de una línea: esa línea dice "encargo roto", las otras corren.
  let out = '';
  const opciones = { cwd: p.dir, salida: (s) => (out += s), error: (s) => (out += s) };
  Object.defineProperty(opciones, 'plazoMs', { get() { throw new Error('roto a propósito'); } });
  assert.equal(C.main(['verificar', 'x--01'], opciones), 1);
  r = { out, lineas: out.split('\n').filter(Boolean) };
  assert.equal(marcas(r), '✅✅❌✅✅✅');
  assert.equal(r.lineas[2], '3. pruebas · ❌ · NO VERIFICADO — encargo roto: corré doctor');
  // Un settings que no se lee: la línea 6 lo dice (sin el deny a la vista, ❌).
  fs.rmSync(p.settings);
  fs.mkdirSync(p.settings);
  assert.equal(ver(p.dir).linea(6), '6. barreras · ❌ · .claude/settings.local.json del worktree no es un JSON válido: no se ve el deny de worktree');
  fs.rmSync(p.settings, { recursive: true });
  // El worktree en otra PC: lo que no lo necesita corre igual.
  g(p.P, 'worktree', 'remove', '--force', p.obr);
  r = ver(p.dir);
  assert.equal(r.codigo, 1);
  assert.equal(marcas(r), '✅❌❌✅❌❌');
  assert.equal(r.linea(2), '2. limpio · ❌ · NO VERIFICADO — el worktree del encargo no está en esta PC: corré verificar en la PC del worktree');
  // Un error propio fuera de las líneas: "encargo roto" y NO VERIFICADO (en verificar; en partida, solo roto).
  assert.deepEqual(cli(42, ['verificar', 'x--01']), { codigo: 1, out: 'encargo roto: corré doctor\nNO VERIFICADO\n', err: '' });
  assert.deepEqual(cli(42, ['partida', 'x--01']), { codigo: 1, out: 'encargo roto: corré doctor\n', err: '' });
});
