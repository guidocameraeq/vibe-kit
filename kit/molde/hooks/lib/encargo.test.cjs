'use strict';
// Pruebas de hooks/lib/encargo.cjs (SPEC-paquete-5 P5.4, P3.4, P6.5, P5.3bis; criterios 1, 3, 4 —el validador— y 6): casos sí y no
// de cada regla: el nombre, el vocabulario con la tilde como alias, la plantilla del encargo, el validador de AUTORIZADO, la base,
// el juicio del sello y de un mensaje, y la ubicación por git (local vs origin, con un remoto bare). Repos temporales armados acá,
// sin la configuración de git de la PC. Corren con: node --test "kit/**/*.test.cjs"
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-encargo-lib-'));
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
test.after(() => fs.rmSync(TMP, { recursive: true, force: true }));

const E = require('./encargo.cjs');
const S = require('./sello.cjs');

// ---------------------------------------------------------------- ayudantes

function g(cwd, ...args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', env: process.env });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}
function commit(d, archivos, mensaje = 'c') {
  for (const [rel, contenido] of Object.entries(archivos)) {
    const p = path.join(d, ...rel.split('/'));
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, contenido);
    g(d, 'add', '-f', '--', rel);
  }
  g(d, 'commit', '-q', '-m', mensaje);
  return g(d, 'rev-parse', 'HEAD');
}
let k = 0;
// Un repo con remoto bare: main y modulo/x (con lo que se pida), los dos pusheados; y un clon para empujar a origin "desde otra PC".
function repo(archivosModulo = {}) {
  const base = path.join(TMP, `r${k++}`);
  const remoto = path.join(base, 'remoto.git');
  const P = path.join(base, 'p');
  fs.mkdirSync(P, { recursive: true });
  g(base, 'init', '-q', '--bare', '-b', 'main', remoto);
  g(P, 'init', '-q', '-b', 'main');
  commit(P, { 'a.txt': 'a\n' }, 'base');
  g(P, 'remote', 'add', 'origin', remoto);
  g(P, 'push', '-q', 'origin', 'main');
  g(P, 'switch', '-q', '-c', 'modulo/x');
  commit(P, { 'docs/modulos/x/README.md': '# x\n', ...archivosModulo }, 'modulo');
  g(P, 'push', '-q', 'origin', 'modulo/x');
  g(P, 'switch', '-q', 'main');
  return { base, remoto, P };
}
// Un commit en origin/modulo/x desde otro clon (otra PC), y el fetch acá.
function empujarDesdeOtra(r, archivos) {
  const otra = path.join(r.base, `otra${k++}`);
  g(r.base, 'clone', '-q', '-b', 'modulo/x', r.remoto, otra);
  const sha = commit(otra, archivos, 'desde otra PC');
  g(otra, 'push', '-q', 'origin', 'modulo/x');
  g(r.P, 'fetch', '-q', 'origin');
  return sha;
}
// Un commit en modulo/x local, sin pushear.
function commitLocal(r, archivos) {
  g(r.P, 'switch', '-q', 'modulo/x');
  const sha = commit(r.P, archivos, 'local');
  g(r.P, 'switch', '-q', 'main');
  return sha;
}

const N = E.nombreEncargo('x--01');

// El encargo de la plantilla, lleno; `cambios` reemplaza o borra (null) renglones enteros por su prefijo.
const RENGLONES = [
  '# Encargo 01 · x · el primer sub-paso',
  '- Partida: rama modulo/x--01 desde modulo/x@abc1234 · 2026-10-30T10:00-03:00',
  '- Spec: docs/modulos/x/SPEC.md:12-30',
  '- Skill: obrero',
  '- Modelo: sonnet · Esfuerzo: medium · Por qué: es mecánico',
  '- Riesgo: bajo · Por qué: no toca datos',
  '- Apertura: Guido',
  '- Suscripción: —',
  '## Toca',
  '- src/x/**',
  '- recurso: suite',
  '## Alcance',
  '1. una cosa',
  '## NO SE TOCA',
  '- src/pagos/',
  '## AUTORIZADO',
  '- Bash(npm run build)',
  '- Edit(src/x/**)',
  '## GATE',
  '- `npm run lint`',
];
function encargo(cambios = {}, extra = []) {
  const l = [];
  for (const r of RENGLONES) {
    const clave = Object.keys(cambios).find((c) => r.startsWith(c));
    if (clave === undefined) l.push(r);
    else if (cambios[clave] !== null) l.push(...[].concat(cambios[clave]));
  }
  return [...l, ...extra, ''].join('\n');
}

// Un spec: sellado o no; el sello con hash bueno salvo que se toque después.
function spec({ estado = 'READY', sellar = true, entorno = '✅', despues = null } = {}) {
  const texto = ['# SPEC: x', `- Estado: ${estado}`, '- Fecha: 2026-10-30', '', '## Pedido original, textual', 'algo', ''].join('\n');
  if (!sellar) return Buffer.from(texto);
  const linea = S.armar({ fecha: '2026-10-30', kit: '2.4.3', tamano: '✅', entorno, tope: '✅', hash: S.hash(texto) });
  let t = texto.replace('- Fecha: 2026-10-30\n', `- Fecha: 2026-10-30\n${linea}\n`);
  if (despues) t += despues;
  return Buffer.from(t);
}
const QUITADO = (hasta) => ({ frenos: { quitados: [{ id: 'gate:entorno-prueba', por: 'sin base', hasta }] } });

// ---------------------------------------------------------------- el nombre

test('nombreEncargo: <x>--<ID> sí; sin ID, ID de un dígito, mayúsculas, x de 21 → null', () => {
  assert.deepEqual(E.nombreEncargo('pagos-web--07'), { x: 'pagos-web', id: '07', rama: 'modulo/pagos-web--07', madre: 'modulo/pagos-web', carpeta: 'modulo--pagos-web--07' });
  for (const t of ['x', 'x--1', 'X--01', `${'a'.repeat(21)}--01`, 'x--01--02', '--01', 'x---01', '', undefined]) assert.equal(E.nombreEncargo(t), null, String(t));
  assert.ok(E.nombreEncargo(`${'a'.repeat(20)}--99`));
});

// ---------------------------------------------------------------- el vocabulario

test('vocabulario: los ocho tipos con su lado; la tilde es alias (CORRECCIÓN = CORRECCION); minúsculas y otros no', () => {
  const lado = Object.fromEntries(E.VOCABULARIO.map((v) => [v.tipo, v.a]));
  assert.deepEqual(lado, {
    PRESENTACION: 'director', AVANCE: 'director', CONSULTA: 'director', PARADA: 'director', CIERRE: 'director',
    ENCARGO: 'obrero', RESPUESTA: 'obrero', CORRECCION: 'obrero',
  });
  assert.deepEqual(E.VOCABULARIO.filter((v) => v.conRuta).map((v) => v.tipo), ['ENCARGO', 'CORRECCION']);
  assert.equal(E.tipoDe('CORRECCIÓN'), E.tipoDe('CORRECCION'));
  assert.equal(E.tipoDe('PRESENTACIÓN').tipo, 'PRESENTACION');
  assert.equal(E.tipoDe('CORRECCIO\u0301N').tipo, 'CORRECCION', 'la tilde descompuesta (NFD) también');
  for (const t of ['correccion', 'Correccion', 'mergeá', 'MERGEA', 'ENCARGOS', '', 'CORRECCIÒN']) assert.equal(E.tipoDe(t), null, t);
  assert.equal(E.sinTilde('AÑO'), 'AÑO', 'la Ñ no es una tilde');
});

// ---------------------------------------------------------------- la plantilla

test('leerEncargo: la plantilla llena se lee entera (campos, Toca, AUTORIZADO, GATE)', () => {
  const e = E.leerEncargo(encargo(), N);
  assert.deepEqual(e.errores, []);
  assert.deepEqual(e.titulo, { id: '01', x: 'x', titulo: 'el primer sub-paso' });
  assert.deepEqual(e.campos.partida, { rama: 'modulo/x--01', madre: 'modulo/x', sha: 'abc1234', fecha: '2026-10-30T10:00-03:00' });
  assert.deepEqual(e.campos.spec, { ruta: 'docs/modulos/x/SPEC.md', desde: 12, hasta: 30 });
  assert.deepEqual(e.campos.modelo, { modelo: 'sonnet', esfuerzo: 'medium', porque: 'es mecánico' });
  assert.deepEqual(e.campos.riesgo, { riesgo: 'bajo', porque: 'no toca datos' });
  assert.equal(e.campos.apertura, 'Guido');
  assert.equal(e.campos.suscripcion, '—');
  assert.deepEqual(e.secciones.toca, { rutas: ['src/x/**'], recursos: ['suite'] });
  assert.deepEqual(e.secciones.autorizado, ['Bash(npm run build)', 'Edit(src/x/**)']);
  assert.deepEqual(e.secciones.gate, ['npm run lint']);
});

test('leerEncargo: CRLF, BOM, comentarios HTML, SPEC-2 con una línea, opus/high/alto/director, (nada) en AUTORIZADO y GATE', () => {
  const t = encargo(
    {
      '- Spec:': '- Spec: docs/modulos/x/SPEC-2.md:7',
      '- Modelo:': '- Modelo: opus · Esfuerzo: high · Por qué: decide un freno · y algo más',
      '- Riesgo:': '- Riesgo: alto · Por qué: datos reales',
      '- Apertura:': '- Apertura: director',
      '- Bash(npm': ['<!-- una regla por renglón,', 'con la sintaxis de settings -->', '- (nada)'],
      '- Edit(': null,
      '- `npm': '- (nada)',
    },
  );
  const e = E.leerEncargo(`\uFEFF${t.replace(/\n/g, '\r\n')}`, N);
  assert.deepEqual(e.errores, []);
  assert.deepEqual(e.campos.spec, { ruta: 'docs/modulos/x/SPEC-2.md', desde: 7, hasta: 7 });
  assert.equal(e.campos.modelo.porque, 'decide un freno · y algo más');
  assert.equal(e.campos.riesgo.riesgo, 'alto');
  assert.equal(e.campos.apertura, 'director');
  assert.deepEqual(e.secciones.autorizado, []);
  assert.deepEqual(e.secciones.gate, []);
  assert.deepEqual(E.leerEncargo(encargo({ '- `npm': null }), N).secciones.gate, [], 'GATE vacía vale: comando-test corre siempre');
});

test('leerEncargo: cada campo y cada sección que falta se nombra', () => {
  for (const c of E.CAMPOS) {
    const e = E.leerEncargo(encargo({ [`- ${c}:`]: null }), N);
    assert.equal(e.errores.length, 1, c);
    assert.match(e.errores[0], new RegExp(`faltan - ${c}:`), c);
  }
  for (const s of E.SECCIONES) {
    const e = E.leerEncargo(encargo({ [`## ${s}`]: null }), N);
    assert.ok(e.errores.some((x) => x.includes(`## ${s}`)), s);
  }
  const dos = E.leerEncargo(encargo({ '- Riesgo:': null, '- Apertura:': null }), N);
  assert.match(dos.errores[0], /faltan - Riesgo:, - Apertura:/);
});

test('leerEncargo: cada campo mal escrito → error con el campo', () => {
  const casos = {
    '- Partida:': ['- Partida: rama modulo/x--01 desde modulo/x@abc1234', '- Partida: rama modulo/x--02 desde modulo/x@abc1234 · 2026-10-30T10:00-03:00', '- Partida: rama modulo/x--01 desde modulo/y@abc1234 · 2026-10-30T10:00-03:00', '- Partida: rama modulo/x--01 desde modulo/x@abc · 2026-10-30T10:00-03:00'],
    '- Spec:': ['- Spec: docs/modulos/y/SPEC.md:1', '- Spec: docs/modulos/x/SPEC.md', '- Spec: docs/modulos/x/spec.md:1', '- Spec: docs/modulos/x/SPEC-a.md:1', '- Spec: ../docs/modulos/x/SPEC.md:1'],
    '- Skill:': ['- Skill: director'],
    '- Modelo:': ['- Modelo: haiku · Esfuerzo: low · Por qué: x', '- Modelo: sonnet · Esfuerzo: max · Por qué: x', '- Modelo: sonnet · Esfuerzo: low', '- Modelo: sonnet', '- Modelo: sonnet · Esfuerzo: low · Por qué: '],
    '- Riesgo:': ['- Riesgo: medio · Por qué: x', '- Riesgo: bajo', '- Riesgo: bajo · Por que: x'],
    '- Apertura:': ['- Apertura: guido', '- Apertura: obrero'],
    '- Suscripción:': ['- Suscripción: '],
  };
  for (const [campo, malos] of Object.entries(casos)) {
    for (const m of malos) {
      const e = E.leerEncargo(encargo({ [campo]: m }), N);
      assert.ok(e.errores.some((x) => x.startsWith(campo)), `${m} → ${JSON.stringify(e.errores)}`);
    }
  }
});

test('leerEncargo: título, duplicados, AUTORIZADO y GATE mal escritos, recurso raro → error', () => {
  const malos = [
    [{ '# Encargo': '# Encargo 02 · x · otro' }, /el título dice x--02/],
    [{ '# Encargo': '# Encargo 01 · y · otro' }, /el título dice y--01/],
    [{ '# Encargo': '# Encargo 01 x' }, /primer renglón/],
    [{ '- Skill:': ['- Skill: obrero', '- Skill: obrero'] }, /- Skill: está dos veces/],
    [{ '## GATE': ['## GATE', '- `a`', '## AUTORIZADO'] }, /## AUTORIZADO está dos veces/],
    [{ '- Bash(npm': 'Bash(npm run build)' }, /## AUTORIZADO, renglón \d+: va una regla por renglón/],
    [{ '- Bash(npm': null, '- Edit(': null }, /## AUTORIZADO está vacía/],
    [{ '- Edit(': '- (nada)' }, /## AUTORIZADO: - \(nada\) va sola/],
    [{ '- `npm': '- npm run lint' }, /## GATE, renglón \d+: el comando va entre comillas invertidas/],
    [{ '- `npm': 'npm run lint' }, /## GATE, renglón \d+: va un comando por renglón/],
    [{ '- `npm': ['- `a`', '- (nada)'] }, /## GATE: - \(nada\) va sola/],
    [{ '- recurso:': '- recurso: la base' }, /## Toca, renglón \d+: el recurso/],
  ];
  for (const [cambio, re] of malos) {
    const e = E.leerEncargo(encargo(cambio), N);
    assert.ok(e.errores.some((x) => re.test(x)), `${JSON.stringify(cambio)} → ${JSON.stringify(e.errores)}`);
  }
  // Sin nombre no se cruza el título; una sección de más y texto suelto en Alcance no molestan.
  assert.deepEqual(E.leerEncargo(encargo({ '# Encargo': '# Encargo 07 · z · otro', '- Partida:': null }, ['## Notas', 'texto libre']), null).errores, ['faltan - Partida:']);
  assert.deepEqual(E.leerEncargo(encargo({}, ['## Notas', '- Bash(*)']), N).secciones.autorizado, ['Bash(npm run build)', 'Edit(src/x/**)'], 'una lista en otra sección no es AUTORIZADO');
  assert.deepEqual(E.leerEncargo(encargo({ '- Bash(npm': '- `Bash(npm run build)`' }), N).secciones.autorizado[0], 'Bash(npm run build)', 'entre comillas invertidas, igual');
});

// ---------------------------------------------------------------- el validador de AUTORIZADO

test('validarRegla: las estrechas valen', () => {
  for (const r of [
    'Bash(npm run build)', 'Bash(npm run lint:*)', 'PowerShell(npm test)', 'Bash(node .claude/scripts/encargo.cjs:*)', 'Bash(node scripts/x.js *)',
    'Bash(python -m pytest:*)', 'Bash(npx prisma generate)', 'Bash(git fetch:*)', 'Edit(src/pagos/**)', 'Edit(/src/x.ts)', 'Read(./docs/**)',
    'Write(src/x/nuevo.ts)', 'Edit(src/*.ts)', 'WebFetch(domain:docs.ejemplo.com)', 'Edit(.env.example)',
  ]) assert.equal(E.validarRegla(r), null, r);
});

test('validarRegla: cada negativa, con su por qué', () => {
  const casos = [
    ['Task(x)', /Task no está entre las que se autorizan/],
    ['mcp__x__y', /no está entre las que se autorizan/],
    ['bash(npm test)', /bash no está/],
    ['Glob(src/**)', /Glob no está/],
    ['Bash', /Bash sin paréntesis autoriza todo/],
    ['PowerShell', /PowerShell sin paréntesis/],
    ['Edit', /Edit sin paréntesis/],
    ['WebFetch', /WebFetch sin paréntesis/],
    ['Bash()', /vacío/],
    ['Bash(*)', /Bash con \* solo/],
    ['Bash( * )', /con \* solo/],
    ['Bash(:*)', /con \* solo/],
    ['PowerShell(*)', /PowerShell con \* solo/],
    ['Bash(node:*)', /node seguido de \*/],
    ['Bash(node *)', /node seguido de \*/],
    ['Bash(node*)', /node seguido de \*/],
    ['Bash(Node.exe:*)', /node seguido de \*/],
    ['Bash(python3.12 *)', /python seguido de \*/],
    ['Bash(python -c *)', /python seguido de \*/],
    ['PowerShell(pwsh -Command *)', /pwsh seguido/],
    ['Bash(cmd /c *)', /cmd seguido/],
    ['Bash(npx:*)', /npx seguido/],
    ...['py', 'bash', 'sh', 'powershell'].map((i) => [`Bash(${i}:*)`, new RegExp(`${i} seguido`)]),
    ['Edit(//c/Users/x/**)', /ruta absoluta/],
    ['Edit(~/.claude/**)', /ruta absoluta/],
    ['Read(~)', /ruta absoluta/],
    ['Edit(C:/x/y)', /ruta absoluta/],
    ['Edit(../x)', /con \.\./],
    ['Edit(src/../../x)', /con \.\./],
    ['Write(src\\..\\x)', /con \.\./],
    ['Edit(**)', /toda la carpeta/],
    ['Edit(/**)', /toda la carpeta/],
    ['Edit(./**)', /toda la carpeta/],
    ['Edit(**/*)', /toda la carpeta/],
    ['Write(*)', /toda la carpeta/],
    ['Read(.)', /toda la carpeta/],
    ['Edit(/)', /toda la carpeta/],
    ['WebFetch(ejemplo.com)', /WebFetch va con un dominio/],
    ['WebFetch(domain:*)', /todos los dominios/],
    ['Bash(npm test', /no es Herramienta\(regla\)/],
    ['Bash npm test', /no es Herramienta\(regla\)/],
  ];
  for (const [r, re] of casos) {
    const por = E.validarRegla(r);
    assert.ok(por && re.test(por), `${r} → ${por}`);
  }
  assert.deepEqual(E.validarAutorizado(['Bash(npm run build)', 'Bash(*)', 'Edit(src/x/**)', 'Task(x)']).map((m) => m.regla), ['Bash(*)', 'Task(x)']);
  assert.deepEqual(E.validarAutorizado([]), []);
  assert.equal(E.interpreteAbierto('node .claude/x.cjs:*'), null, 'lo que corre está nombrado');
  assert.equal(E.interpreteAbierto('npm run:*'), null, 'npm no es un intérprete de la lista (las 5 de A las niega el hook)');
  assert.equal(E.interpreteAbierto('node -e "x"'), null, 'sin comodín al final');
});

// ---------------------------------------------------------------- la base

test('base: herramientas, lectura de D4.2, git/encargo/test en Bash y en PowerShell, el test exacto y con " *"', () => {
  const b = E.base('npm test');
  for (const r of ['Read', 'Edit', 'Write', 'Glob', 'Grep', 'TodoWrite', 'Agent', 'Skill']) assert.ok(b.includes(r), r);
  for (const c of ['ls', 'cat', 'head', 'wc', 'grep', 'find', 'mkdir']) assert.ok(b.includes(`Bash(${c}:*)`), c);
  for (const sh of ['Bash', 'PowerShell']) {
    for (const c of ['status', 'diff', 'log', 'show', 'add', 'commit', 'push']) assert.ok(b.includes(`${sh}(git ${c}:*)`), `${sh} git ${c}`);
    assert.ok(b.includes(`${sh}(node .claude/scripts/encargo.cjs:*)`), sh);
    assert.ok(b.includes(`${sh}(npm test)`) && b.includes(`${sh}(npm test *)`), `${sh} test`);
  }
  assert.equal(new Set(b).size, b.length, 'sin repetidos');
  assert.ok(!b.some((r) => /bypass|^Bash$|^PowerShell$|\(\*\)/.test(r)), 'nada abierto');
  assert.ok(!b.some((r) => /(?:Bash|PowerShell)\(git (?:reset|checkout|branch|merge|rebase|push --force)/.test(r)));
  const sin = E.base('');
  assert.ok(!sin.some((r) => /npm test/.test(r)) && sin.length === b.length - 4);
  assert.deepEqual(E.base(undefined), sin);
  assert.deepEqual(E.base('  npm test  '), b, 'el comando sin espacios de más');
});

// ---------------------------------------------------------------- el sello

test('juzgarSpec: sin sello → "spec sin Arquitecto: corré Modo B"; cambio; inválido; BORRADOR; READY', () => {
  assert.deepEqual(E.juzgarSpec(spec({ sellar: false }), { hayFicha: true }), { ok: false, por: 'spec sin Arquitecto: corré Modo B' });
  assert.deepEqual(E.juzgarSpec(spec({ sellar: false, estado: 'READY' }), { hayFicha: false }), { ok: false, por: 'spec sin Arquitecto: corré Modo B' });
  assert.match(E.juzgarSpec(spec({ despues: 'una línea más\n' }), { hayFicha: true }).por, /^el spec cambió después del sello: que el director corra sello de nuevo$/);
  assert.match(E.juzgarSpec(spec({ estado: 'BORRADOR' }), { hayFicha: true }).por, /^spec sin READY: falta el OK de Guido y `ready`$/);
  assert.match(E.juzgarSpec(spec({ estado: '**BORRADOR**' }), { hayFicha: true }).por, /spec sin READY/);
  assert.deepEqual(E.juzgarSpec(spec(), { hayFicha: true }), { ok: true });
  assert.deepEqual(E.juzgarSpec(spec({ estado: '**READY — sellado**' }), { hayFicha: true }), { ok: true });
  // Sin renglón de Estado: no es READY.
  const sinEstado = Buffer.from(spec().toString('utf8').replace('- Estado: READY\n', ''));
  assert.match(E.juzgarSpec(sinEstado, { hayFicha: true }).por, /spec sin READY/);
  // Sello que no parsea → inválido.
  const roto = Buffer.from(spec().toString('utf8').replace('kit 2.4.3', 'kit dos'));
  assert.match(E.juzgarSpec(roto, { hayFicha: true }).por, /^sello inválido: la versión no es "kit X.Y.Z": que el director llame al Arquitecto$/);
});

test('juzgarSpec: entorno "— (quitado: …)" vale solo con gate:entorno-prueba quitado el día del sello en la ficha vigente', () => {
  const q = spec({ entorno: '— (quitado: sin base)' });
  assert.match(E.juzgarSpec(q, { hayFicha: true, datosFicha: null }).por, /^sello inválido: entorno dice quitado/);
  assert.match(E.juzgarSpec(q, { hayFicha: true, datosFicha: { frenos: { quitados: [] } } }).por, /sello inválido/);
  assert.match(E.juzgarSpec(q, { hayFicha: true, datosFicha: QUITADO('2026-10-29') }).por, /sello inválido/, 'vencido el día antes del sello');
  assert.deepEqual(E.juzgarSpec(q, { hayFicha: true, datosFicha: QUITADO('2026-10-30') }), { ok: true }, 'el día de hasta, incluido');
  assert.deepEqual(E.juzgarSpec(q, { hayFicha: true, datosFicha: QUITADO('siempre') }), { ok: true });
  assert.deepEqual(E.juzgarSpec(q, { hayFicha: false, datosFicha: null }), { ok: true }, 'sin ficha, "—" vale');
  assert.equal(E.gateQuitadoEl({ frenos: { quitados: [{ id: 'gate:otro', hasta: 'siempre' }] } }, '2026-10-30'), false);
  assert.equal(E.gateQuitadoEl({ frenos: { quitados: [{ id: 'gate:entorno-prueba', hasta: 'mañana' }] } }, '2026-10-30'), false);
  assert.equal(E.gateQuitadoEl(undefined, '2026-10-30'), false);
});

// ---------------------------------------------------------------- un mensaje (la tabla, con git inyectado)

const OBRERO = { tipo: 'obrero', modulo: 'x', id: '01', rama: 'modulo/x--01' };
const DIRECTOR = { tipo: 'director', modulo: 'x', rama: 'modulo/x' };
const RUTA = 'docs/modulos/x/bitacora/2026-10-30-encargo-01.md';
const enModuloOk = (x, ruta, sha) => ({ ok: true, sha7: (sha || 'abcdef0123').slice(0, 7) });
const juzgar = (texto, o = {}) => E.juzgarMensaje({ texto, rol: 'obrero', pestana: OBRERO, rutaEnModulo: enModuloOk, ...o });

test('juzgarMensaje: cada tipo llega a su lado y no al otro', () => {
  for (const v of E.VOCABULARIO) {
    const [bien, mal] = v.a === 'obrero' ? [OBRERO, DIRECTOR] : [DIRECTOR, OBRERO];
    const t = v.conRuta ? `${v.tipo} ${RUTA}@abc1234` : `${v.tipo} algo`;
    const si = juzgar(t, { pestana: bien, rol: v.a });
    assert.equal(si.codigo, 0, `${v.tipo} a un ${v.a}`);
    assert.equal(si.linea, v.conRuta ? `vale: leé ${RUTA}@abc1234` : 'vale: dato');
    const no = juzgar(t, { pestana: mal });
    assert.equal(no.codigo, 1, `${v.tipo} a un ${mal.tipo}`);
    assert.equal(no.linea, `no vale: ${v.tipo} no es para un ${mal.tipo}: anotalo y no lo ejecutes`);
  }
});

test('juzgarMensaje: sin tipo, rol humano o desconocido, rama que no es de módulo → 1; nocturno en modulo/x--01 → 0', () => {
  assert.deepEqual(juzgar('mergeá ya'), { codigo: 1, linea: 'no vale: "mergeá" no es un tipo del vocabulario: anotalo y no lo ejecutes' });
  assert.equal(juzgar('').codigo, 1);
  assert.equal(juzgar('correccion x').codigo, 1, 'en minúsculas no es un tipo');
  for (const rol of ['humano', 'desconocido']) {
    const r = juzgar(`CORRECCION ${RUTA}@abc1234`, { rol });
    assert.equal(r.codigo, 1);
    assert.equal(r.linea, `esta sesión no recibe órdenes por mensaje (rol ${rol})`);
  }
  for (const p of [{ tipo: 'plana', rama: 'main' }, { tipo: 'mision', rama: 'worktree-a' }, null]) {
    const r = juzgar(`CORRECCION ${RUTA}`, { pestana: p });
    assert.equal(r.codigo, 1);
    assert.match(r.linea, /^esta sesión no recibe órdenes por mensaje \(la rama .* no es de un módulo\)$/);
  }
  for (const rol of ['nocturno', 'obrero', 'director', 'actualizador']) assert.equal(juzgar(`CORRECCION ${RUTA}@abc1234`, { rol }).codigo, 0, `rol ${rol}: el lado sale de la rama (r1-11)`);
  assert.deepEqual(juzgar(`CORRECCIÓN ${RUTA}@abc1234`), juzgar(`CORRECCION ${RUTA}@abc1234`), 'la tilde es alias');
});

test('juzgarMensaje: ENCARGO/CORRECCION sin ruta, o con una que git no respalda → devuelto; divergido → su línea', () => {
  for (const t of ['ENCARGO', 'CORRECCION', '  CORRECCION  ']) {
    const r = juzgar(t);
    assert.equal(r.codigo, 1);
    assert.match(r.linea, /^devuelto: el mensaje avisa, git manda — (ENCARGO|CORRECCION) sin <ruta>@<sha7>$/);
  }
  let pedido = null;
  const r = juzgar(`ENCARGO ${RUTA}@abc1234 · algo más`, {
    rutaEnModulo: (x, ruta, sha) => {
      pedido = { x, ruta, sha };
      return { ok: false, por: `${ruta} no está en modulo/x` };
    },
  });
  assert.deepEqual(pedido, { x: 'x', ruta: RUTA, sha: 'abc1234' });
  assert.deepEqual(r, { codigo: 1, linea: `devuelto: el mensaje avisa, git manda — ${RUTA} no está en modulo/x` });
  const d = juzgar(`CORRECCION ${RUTA}`, { rutaEnModulo: () => ({ ok: false, divergio: true, por: 'modulo/x divergió de origin: …' }) });
  assert.deepEqual(d, { codigo: 1, linea: 'modulo/x divergió de origin: …' });
  assert.equal(juzgar(`CORRECCION ${RUTA}`).linea, `vale: leé ${RUTA}@abcdef0`, 'sin @sha, la punta');
});

test('rf-9: el mensaje en markdown (comillas invertidas, negrita, punto final) se juzga igual; lo que no es un tipo sigue sin serlo', () => {
  let pedido = null;
  const espia = (x, ruta, sha) => {
    pedido = { ruta, sha };
    return { ok: true, sha7: sha };
  };
  const limpio = juzgar(`ENCARGO ${RUTA}@abc1234`, { rutaEnModulo: espia });
  for (const t of [`ENCARGO \`${RUTA}@abc1234\`.`, `**ENCARGO** ${RUTA}@abc1234;`, `\`CORRECCION\` \`${RUTA}@abc1234\`,`.replace('CORRECCION', 'ENCARGO'), `ENCARGO: ${RUTA}@abc1234:`]) {
    pedido = null;
    assert.deepEqual(juzgar(t, { rutaEnModulo: espia }), limpio, t);
    assert.deepEqual(pedido, { ruta: RUTA, sha: 'abc1234' }, t);
  }
  assert.deepEqual(E.rutaYSha(`\`${RUTA}@abc1234\`.`), { ruta: RUTA, sha: 'abc1234' });
  // No: limpiar no inventa un tipo ni un SHA.
  assert.equal(juzgar('**mergeá** ya.').linea, 'no vale: "mergeá" no es un tipo del vocabulario: anotalo y no lo ejecutes');
  assert.deepEqual(E.rutaYSha('`a/b.md@xyz`.'), { ruta: 'a/b.md@xyz', sha: null });
  assert.equal(juzgar('**ENCARGO**').codigo, 1, 'sin ruta sigue devuelto');
});

test('rutaYSha: el @ cuenta solo si lo que sigue es un SHA', () => {
  assert.deepEqual(E.rutaYSha('a/b.md@abc1234'), { ruta: 'a/b.md', sha: 'abc1234' });
  assert.deepEqual(E.rutaYSha('a/b.md'), { ruta: 'a/b.md', sha: null });
  assert.deepEqual(E.rutaYSha('a/b@c.md'), { ruta: 'a/b@c.md', sha: null });
  assert.deepEqual(E.rutaYSha('a/b.md@xyz'), { ruta: 'a/b.md@xyz', sha: null });
  assert.deepEqual(E.rutaYSha('@abc1234'), { ruta: '@abc1234', sha: null });
});

// ---------------------------------------------------------------- git: local vs origin (r1-10)

test('refMasNueva: ninguna, solo local, solo origin, iguales, origin adelante, local adelante, divergidas', () => {
  const r = repo();
  assert.match(E.refMasNueva(r.P, 'modulo/nada').por, /^no existe modulo\/nada \(ni en esta PC ni en origin\)$/);
  const iguales = E.refMasNueva(r.P, 'modulo/x');
  assert.equal(iguales.nombre, 'modulo/x');
  assert.equal(iguales.sha, g(r.P, 'rev-parse', 'modulo/x'));
  // Solo local.
  g(r.P, 'branch', 'modulo/solo-local', 'main');
  assert.equal(E.refMasNueva(r.P, 'modulo/solo-local').nombre, 'modulo/solo-local');
  // Origin adelante.
  const shaO = empujarDesdeOtra(r, { 'o.txt': 'o\n' });
  assert.deepEqual(E.refMasNueva(r.P, 'modulo/x'), { ok: true, sha: shaO, nombre: 'origin/modulo/x' });
  // Solo origin.
  g(r.P, 'branch', '-q', '-D', 'modulo/x');
  assert.deepEqual(E.refMasNueva(r.P, 'modulo/x'), { ok: true, sha: shaO, nombre: 'origin/modulo/x' });
  // Local adelante.
  g(r.P, 'branch', 'modulo/x', 'origin/modulo/x');
  const shaL = commitLocal(r, { 'l.txt': 'l\n' });
  assert.deepEqual(E.refMasNueva(r.P, 'modulo/x'), { ok: true, sha: shaL, nombre: 'modulo/x' });
  // Divergidas.
  empujarDesdeOtra(r, { 'o2.txt': 'o2\n' });
  const d = E.refMasNueva(r.P, 'modulo/x');
  assert.equal(d.ok, false);
  assert.match(d.por, /^modulo\/x divergió de origin/);
});

test('ubicarEncargo: uno → su texto; ninguno, solo en el disco, dos con el mismo ID, uno en una subcarpeta → no; origin más nuevo → se usa', () => {
  const r = repo({ 'docs/modulos/x/bitacora/2026-10-29-encargo-02.md': 'otro\n', 'docs/modulos/x/bitacora/viejo/2026-10-01-encargo-01.md': 'viejo\n' });
  let u = E.ubicarEncargo(r.P, N);
  assert.equal(u.ok, false);
  assert.match(u.por, /^no hay encargo 01 commiteado en modulo\/x \(docs\/modulos\/x\/bitacora\/<fecha>-encargo-01\.md\)/);
  // Solo en el disco (sin commitear): no existe.
  fs.mkdirSync(path.join(r.P, 'docs', 'modulos', 'x', 'bitacora'), { recursive: true });
  fs.writeFileSync(path.join(r.P, 'docs', 'modulos', 'x', 'bitacora', '2026-10-30-encargo-01.md'), 'en el disco\n');
  assert.equal(E.ubicarEncargo(r.P, N).ok, false);
  // En origin (más nuevo que el local): se usa.
  empujarDesdeOtra(r, { 'docs/modulos/x/bitacora/2026-10-30-encargo-01.md': 'el encargo\n' });
  u = E.ubicarEncargo(r.P, N);
  assert.equal(u.ok, true);
  assert.equal(u.ruta, 'docs/modulos/x/bitacora/2026-10-30-encargo-01.md');
  assert.equal(u.texto, 'el encargo\n');
  assert.equal(u.ref.nombre, 'origin/modulo/x');
  // Dos con el mismo ID.
  empujarDesdeOtra(r, { 'docs/modulos/x/bitacora/2026-10-31-encargo-01.md': 'otro 01\n' });
  u = E.ubicarEncargo(r.P, N);
  assert.equal(u.ok, false);
  assert.match(u.por, /^hay 2 encargos 01 en origin\/modulo\/x \(.*2026-10-30-encargo-01\.md, .*2026-10-31-encargo-01\.md\): que el director deje uno$/);
  // Divergido.
  const r2 = repo({ 'docs/modulos/x/bitacora/2026-10-30-encargo-01.md': 'e\n' });
  commitLocal(r2, { 'l.txt': 'l\n' });
  empujarDesdeOtra(r2, { 'o.txt': 'o\n' });
  assert.match(E.ubicarEncargo(r2.P, N).por, /divergió de origin/);
});

test('rutaEnModulo: archivo en modulo/x sí; que no está, carpeta, ruta que sale, @sha ajeno, @sha que no la contiene → no', () => {
  const r = repo({ [RUTA]: 'e\n' });
  const punta = g(r.P, 'rev-parse', 'modulo/x');
  assert.deepEqual(E.rutaEnModulo(r.P, 'x', RUTA, null), { ok: true, sha7: punta.slice(0, 7) });
  assert.deepEqual(E.rutaEnModulo(r.P, 'x', RUTA, punta.slice(0, 7)), { ok: true, sha7: punta.slice(0, 7) });
  assert.match(E.rutaEnModulo(r.P, 'x', 'docs/modulos/x/nada.md', null).por, /^docs\/modulos\/x\/nada\.md no está en modulo\/x$/);
  assert.equal(E.rutaEnModulo(r.P, 'x', 'docs/modulos/x', null).ok, false, 'una carpeta no es un archivo');
  for (const malo of ['../x.md', '/etc/passwd', 'C:/x.md', 'docs/../a.txt', '']) assert.equal(E.rutaEnModulo(r.P, 'x', malo, null).ok, false, malo);
  // git resuelve `<sha>:../x` relativo al cwd: llamada desde una subcarpeta, `../a.txt` sería a.txt de la raíz (que está en
  // modulo/x). La guarda de `..` es la que lo frena (mutante #44 de E1).
  const sub = path.join(r.P, 'sub');
  fs.mkdirSync(sub);
  assert.equal(E.rutaEnModulo(sub, 'x', 'a.txt', null).ok, true);
  const desdeSub = E.rutaEnModulo(sub, 'x', '../a.txt', null);
  assert.equal(desdeSub.ok, false);
  assert.match(desdeSub.por, /^\.\.\/a\.txt no es una ruta del repo$/);
  assert.match(E.rutaEnModulo(r.P, 'x', RUTA, 'abcdef1').por, /no es un commit de este repo/);
  // Un commit en otra rama (el obrero) con la misma ruta: no es de modulo/x.
  g(r.P, 'switch', '-q', '-c', 'modulo/x--01', 'modulo/x');
  const ajeno = commit(r.P, { [RUTA]: 'falso\n' }, 'obrero');
  g(r.P, 'switch', '-q', 'main');
  assert.match(E.rutaEnModulo(r.P, 'x', RUTA, ajeno.slice(0, 7)).por, /no es de modulo\/x/);
  // Un commit de modulo/x anterior a la ruta: no la contiene.
  const anterior = g(r.P, 'rev-parse', 'main');
  assert.match(E.rutaEnModulo(r.P, 'x', RUTA, anterior.slice(0, 7)).por, /no contiene/);
  assert.match(E.rutaEnModulo(r.P, 'nada', RUTA, null).por, /no existe modulo\/nada/);
});
