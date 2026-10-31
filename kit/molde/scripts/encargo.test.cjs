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
  commit(P, { '.gitignore': '/.claude/worktrees/\n/.kit-rol\n', '.claude/kit.md': ficha(o.ficha), 'base.js': BASE_JS }, 'base');
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

test('mal llamado → 2 con el uso; autorizado y verificar → 2 "llega en E2"; fuera de un repo → 1', () => {
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
    const r = cli(TMP, args);
    assert.equal(r.codigo, 2);
    assert.match(r.err, new RegExp(`^encargo ${args[0]}: llega en E2`));
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
