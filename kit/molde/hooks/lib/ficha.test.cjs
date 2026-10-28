'use strict';
// Pruebas del parser de la ficha. Corren con: node --test kit/
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { leer, leerArchivo, hash, compararVersiones, ErrorFicha } = require('./ficha.cjs');

const SCRIPT = path.join(__dirname, 'ficha.cjs');
const EJEMPLO = path.join(__dirname, '..', '..', 'kit.ejemplo.md');

// El objeto entero, a mano: no sale del parser.
const ESPERADO = {
  kit: '2.4.3',
  nivel: 'estandar',
  vars: {
    proyecto: 'ejemplo',
    'comando-test': 'node --test',
    'comando-setup': 'npm install',
    lenguajes: ['js', 'ts'],
  },
  piezas: {
    inicio: { estado: 'molde+propio', hash: '3f9a0c1d2e4b' },
    cierre: { estado: 'molde+propio', hash: 'b71c55d0a9e3' },
    'hook-arranque': { estado: 'molde', hash: '90e2f1aa7c06' },
    settings: { estado: 'molde+propio', hash: '5d04e9b3c218' },
    'check-code': { estado: 'adaptada (desvío detectado)', hash: '7a1b2c3d4e5f' },
    docs: 'molde',
    candado: 'molde',
    smoke: 'propia',
    release: 'propia',
    'director-obrero': 'no',
    'cambios-metodo': 'molde',
    'docs-fyd': 'sí',
  },
  frenos: {
    opcionales: ['rama-nueva-por-mision'],
    quitados: [
      { id: 'hook:git-seguro/push-force', por: 'proyecto personal, el push es libre', hasta: 'siempre' },
      { id: 'pregunta:borrar-datos-reales', por: 'base dummy de la misión 3', hasta: '2026-11-15' },
    ],
  },
  autorizado: {
    'merge-a-main': 'con-gate-verde',
    'escribir-produccion': 'por-comando-con-foto',
  },
  sensible: {
    'datos-reales': ['tabla clientes de la base real'],
    plata: 'no',
    'sale-afuera': ['mails a gerencia'],
    claves: ['cargar-secreto'],
    release: ['npm run release'],
  },
  secretos: ['DB_URL', 'HUB_TOKEN'],
  publicas: ['SUPABASE_ANON_KEY'],
  entornos: {
    'base-real': { clase: 'real', herramientas: ['db'], acceso: 'db (solo lectura)' },
    'base-local': { clase: 'dummy', herramientas: ['db', 'sqlite'], acceso: 'db (todo)' },
  },
  'datos-de-prueba': 'docs/referencia/PRUEBA.md',
  'push-publica': 'no',
  aprueba: 'po-ejemplo',
  mesa: {
    hub: { contacto: 'hub/director', transporte: 'git' },
    deptos: { contacto: 'deptos/sesion', transporte: 'git' },
  },
  'multi-llm': 'no',
};

// ---------------------------------------------------------------- el ejemplo

test('el ejemplo da exactamente el objeto esperado, sin avisos', () => {
  const r = leerArchivo(EJEMPLO);
  assert.deepStrictEqual(r.datos, ESPERADO);
  assert.deepStrictEqual(r.avisos, []);
  assert.ok(r.prosa.startsWith('\n## Cómo se adaptó el kit a este proyecto'));
});

test('BOM + CRLF dan los mismos datos que con LF', () => {
  const lf = fs.readFileSync(EJEMPLO, 'utf8');
  const raro = '\uFEFF' + lf.replace(/\n/g, '\r\n');
  const a = leer(lf);
  const b = leer(raro);
  assert.deepStrictEqual(b.datos, a.datos);
  assert.deepStrictEqual(b.datos, ESPERADO);
  assert.equal(b.prosa, a.prosa);
});

// ---------------------------------------------------------------- malformados e inválidos

// Base válida: líneas 2 a 5. Lo que se agrega arranca en la línea 6.
const BASE = 'kit: 2.4.3\nnivel: liviano\nvars:\n  proyecto: x\n';
const ficha = (extra) => `---\n${BASE}${extra}---\n`;

const CASOS = [
  // [nombre, texto, línea esperada]
  ['sin apertura', 'kit: 2.4.3\n---\n', 1],
  ['sin cierre', `---\n${BASE}`, 1],
  ['archivo vacío', '', 1],
  ['tabulador', ficha('piezas:\n\tinicio: molde\n'), 7],
  ['sangría impar', ficha('piezas:\n   inicio: molde\n'), 7],
  ['salto de nivel', ficha('piezas:\n    inicio: molde\n'), 7],
  ['sangría bajo una clave con valor', ficha('aprueba: po\n  x: y\n'), 7],
  ['cuarto nivel', ficha('entornos:\n  a:\n    b:\n      c: x\n'), 9],
  ['cuarto nivel con mapa en línea', ficha('entornos:\n  a:\n    herramientas: {x: y}\n'), 8],
  ['clave repetida', ficha('kit: 2.4.4\n'), 6],
  ['clave repetida en un submapa', ficha('piezas:\n  inicio: molde\n  inicio: propia\n'), 8],
  ['comillas simples', ficha("aprueba: 'po'\n"), 6],
  ['barra invertida en comillas', ficha('aprueba: "po\\x"\n'), 6],
  ['comilla sin cerrar', ficha('aprueba: "po\n'), 6],
  ['texto después de la comilla', ficha('aprueba: "po" x\n'), 6],
  ['ancla', ficha('aprueba: &a po\n'), 6],
  ['alias', ficha('aprueba: *a\n'), 6],
  ['etiqueta', ficha('aprueba: !!str po\n'), 6],
  ['texto en varias líneas con |', ficha('datos-de-prueba: |\n  texto\n'), 6],
  ['texto en varias líneas con >', ficha('datos-de-prueba: >\n  texto\n'), 6],
  ['lista de escalares en bloque', ficha('secretos:\n  - DB_URL\n'), 7],
  ['lista anidada en línea', ficha('secretos: [A, [B]]\n'), 6],
  ['lista anidada en bloque', ficha('secretos:\n  - [A]\n'), 7],
  ['mapa dentro de lista en línea', ficha('secretos: [A, {b: c}]\n'), 6],
  ['lista dentro de mapa en línea', ficha('autorizado: {a: [b]}\n'), 6],
  ['corchete sin cerrar', ficha('secretos: [A, B\n'), 6],
  ['llave sin cerrar', ficha('autorizado: {a: b\n'), 6],
  ['campo vacío sin hijos', ficha('secretos:\npublicas: [A]\n'), 6],
  ['campo vacío al final', ficha('secretos:\n'), 6],
  ['dos puntos sin espacio (kit:2.4.3)', '---\nkit:2.4.3\nnivel: liviano\nvars:\n  proyecto: x\n---\n', 2],
  ['renglón que no es clave: valor', ficha('hola\n'), 6],
  ['dos puntos con espacio dentro de un texto', ficha('aprueba: a: b\n'), 6],
  ['kit con letras (nivel: largo va aparte)', '---\nkit: 2.4\nnivel: liviano\nvars:\n  proyecto: x\n---\n', 2],
  ['nivel: largo', '---\nkit: 2.4.3\nnivel: largo\nvars:\n  proyecto: x\n---\n', 3],
  ['kit: 3', '---\nkit: 3\nnivel: liviano\nvars:\n  proyecto: x\n---\n', 2],
  ['falta kit', '---\nnivel: liviano\nvars:\n  proyecto: x\n---\n', 5],
  ['falta vars', '---\nkit: 2.4.3\nnivel: liviano\n---\n', 4],
  ['falta proyecto en vars', '---\nkit: 2.4.3\nnivel: liviano\nvars:\n  lenguajes: [js]\n---\n', 4],
  ['proyecto como lista', '---\nkit: 2.4.3\nnivel: liviano\nvars:\n  proyecto: [a]\n---\n', 5],
  ['proyecto como mapa en línea', '---\nkit: 2.4.3\nnivel: liviano\nvars:\n  proyecto: {a: b}\n---\n', 5],
  ['lenguajes no es lista', ficha('').replace('  proyecto: x\n', '  proyecto: x\n  lenguajes: js\n'), 6],
  ['quitados sin hasta', ficha('frenos:\n  quitados:\n    - {id: hook:git-seguro/push-force, por: "x"}\n'), 8],
  ['hasta: mañana', ficha('frenos:\n  quitados:\n    - {id: hook:git-seguro/push-force, por: "x", hasta: mañana}\n'), 8],
  ['hasta con fecha que no existe', ficha('frenos:\n  quitados:\n    - {id: hook:git-seguro/push-force, por: "x", hasta: 2026-13-45}\n'), 8],
  ['id de freno mal formado', ficha('frenos:\n  quitados:\n    - {id: pushforce, por: "x", hasta: siempre}\n'), 8],
  ['clave de más en un freno', ficha('frenos:\n  quitados:\n    - {id: hook:a, por: "x", hasta: siempre, otro: y}\n'), 8],
  ['clave desconocida en frenos', ficha('frenos:\n  raros: [a]\n'), 7],
  ['clase: produccion', ficha('entornos:\n  a:\n    clase: produccion\n'), 8],
  ['entorno sin clase', ficha('entornos:\n  a:\n    acceso: db\n'), 7],
  ['clave desconocida en sensible', ficha('sensible:\n  raros: no\n'), 7],
  ['valor de sensible que no es no ni lista', ficha('sensible:\n  plata: tal vez\n'), 7],
  ['estado de pieza inválido', ficha('piezas:\n  inicio: raro\n'), 7],
  ['clave de más en una pieza', ficha('piezas:\n  inicio: {estado: molde, color: rojo}\n'), 7],
  ['hash de 11 hexa', ficha('piezas:\n  inicio: {estado: molde, hash: 3f9a0c1d2e4}\n'), 7],
  ['hash con mayúsculas', ficha('piezas:\n  inicio: {estado: molde, hash: 3F9A0C1D2E4B}\n'), 7],
  ['secreto con nombre inválido', ficha('secretos: [db_url]\n'), 6],
  ['transporte inválido en la mesa', ficha('mesa:\n  hub:\n    contacto: hub/director\n    transporte: paloma\n'), 9],
  ['mesa sin contacto', ficha('mesa:\n  hub:\n    transporte: git\n'), 7],
  ['aprueba con nombre real', ficha('aprueba: Guido Camera\n'), 6],
  ['push-publica: tal vez', ficha('push-publica: tal vez\n'), 6],
  ['multi-llm: sí o no, no "true"', ficha('multi-llm: true\n'), 6],
];

for (const [nombre, texto, linea] of CASOS) {
  test(`malformada: ${nombre} -> error en la línea ${linea}`, () => {
    assert.throws(
      () => leer(texto),
      (e) => {
        assert.ok(e instanceof ErrorFicha, `esperaba ErrorFicha, vino ${e && e.name}: ${e && e.message}`);
        assert.equal(e.linea, linea, `línea distinta: ${e.message}`);
        assert.ok(e.mensaje.length > 0);
        return true;
      }
    );
  });
}

test('hay al menos 22 casos malformados', () => {
  assert.ok(CASOS.length >= 22);
});

// ---------------------------------------------------------------- avisos y casos válidos

test('campo de arriba desconocido: no lanza, avisa con su línea', () => {
  const r = leer(ficha('colorcito: azul\n'));
  assert.equal(r.avisos.length, 1);
  assert.match(r.avisos[0], /^línea 6: campo desconocido `colorcito`/);
  assert.equal(r.datos.colorcito, 'azul');
});

test('ficha mínima, comentarios y renglones vacíos', () => {
  const r = leer('---\n# nada\n\nkit: 2.4.3 # la versión\nnivel: liviano\n\nvars:\n  proyecto: "x # no es comentario"\n---\nprosa\n');
  assert.deepStrictEqual(r.datos, { kit: '2.4.3', nivel: 'liviano', vars: { proyecto: 'x # no es comentario' } });
  assert.equal(r.prosa, 'prosa\n');
  assert.deepStrictEqual(r.avisos, []);
});

test('todo valor es texto: no, fecha y versión no se convierten', () => {
  const r = leer(ficha('push-publica: no\nautorizado:\n  a: 2026-11-15\n  b: 2.4.3\n'));
  assert.equal(r.datos['push-publica'], 'no');
  assert.deepStrictEqual(r.datos.autorizado, { a: '2026-11-15', b: '2.4.3' });
});

test('listas vacías y claves con nombres de Object.prototype', () => {
  const r = leer(ficha('secretos: []\nsensible:\n  claves: []\nautorizado:\n  constructor: x\n'));
  assert.deepStrictEqual(r.datos.secretos, []);
  assert.deepStrictEqual(r.datos.sensible.claves, []);
  assert.equal(r.datos.autorizado.constructor, 'x');
});

// Un valor pegado donde van nombres no se repite en el error (el hook lo imprimiría en el chat).
const CULPABLE = 'sk-123abc';
const LEAKS = [
  ['secretos', ficha(`secretos: [DB_URL, ${CULPABLE}]\n`), 6, /elemento 2 de "secretos"/],
  ['publicas', ficha(`publicas: [${CULPABLE}]\n`), 6, /elemento 1 de "publicas"/],
  ['mapa en línea sin clave: valor', ficha(`autorizado: {a: b, ${CULPABLE}}\n`), 6, /elemento del mapa en línea/],
];

for (const [nombre, texto, linea, re] of LEAKS) {
  test(`no repite el valor culpable: ${nombre} (biblioteca y CLI)`, () => {
    assert.throws(
      () => leer(texto),
      (e) => {
        assert.ok(e instanceof ErrorFicha);
        assert.equal(e.linea, linea);
        assert.match(e.mensaje, re);
        assert.ok(!e.message.includes(CULPABLE), e.message);
        assert.ok(!e.mensaje.includes(CULPABLE), e.mensaje);
        return true;
      }
    );
    const dir = tmp('ficha-leak');
    const f = path.join(dir, 'kit.md');
    fs.writeFileSync(f, texto);
    const r = correr(['leer', f]);
    assert.equal(r.status, 1);
    assert.match(r.stderr, new RegExp(`:${linea}: `));
    assert.ok(!r.stderr.includes(CULPABLE), r.stderr);
    assert.ok(!r.stdout.includes(CULPABLE), r.stdout);
  });
}

test('el ErrorFicha de leerArchivo lleva la ruta', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ficha-'));
  try {
    const f = path.join(dir, 'rota.md');
    fs.writeFileSync(f, ficha("aprueba: 'x'\n"));
    assert.throws(
      () => leerArchivo(f),
      (e) => e instanceof ErrorFicha && e.linea === 6 && e.message.startsWith(`${f}:6: `)
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------- hash y versiones

test('hash: igual con LF y con CRLF, 12 hexa', () => {
  const h = hash('a\nb\nc\n');
  assert.equal(h, hash('a\r\nb\r\nc\r\n'));
  assert.match(h, /^[0-9a-f]{12}$/);
  assert.equal(h, crypto.createHash('sha256').update('a\nb\nc\n').digest('hex').slice(0, 12));
  assert.equal(hash(Buffer.from('a\r\nb\r\nc\r\n')), h);
});

test('compararVersiones', () => {
  assert.equal(compararVersiones('2.4.3', '2.10.0'), -1);
  assert.equal(compararVersiones('2.10.0', '2.4.3'), 1);
  assert.equal(compararVersiones('2.4.3', '2.4.3'), 0);
  assert.throws(() => compararVersiones('2.4', '2.4.3'));
  assert.throws(() => compararVersiones('2.4.3', 'v2.4.3'));
});

// ---------------------------------------------------------------- línea de comandos

const tmps = [];
function tmp(prefijo) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), `${prefijo}-`));
  tmps.push(d);
  return d;
}
test.after(() => {
  for (const d of tmps) fs.rmSync(d, { recursive: true, force: true });
});

function correr(args, opciones) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8', ...opciones });
}

test('CLI leer del ejemplo: 0 y JSON igual al esperado', () => {
  const r = correr(['leer', EJEMPLO]);
  assert.equal(r.status, 0, r.stderr);
  assert.deepStrictEqual(JSON.parse(r.stdout), ESPERADO);
  assert.equal(r.stderr, '');
});

test('CLI leer con aviso: 0 y el aviso por stderr', () => {
  const dir = tmp('ficha-aviso');
  const f = path.join(dir, 'kit.md');
  fs.writeFileSync(f, ficha('colorcito: azul\n'));
  const r = correr(['leer', f]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stderr, /línea 6: campo desconocido/);
});

test('CLI leer con ficha rota: 1 y <archivo>:<línea>: en stderr', () => {
  const dir = tmp('ficha-rota');
  const f = path.join(dir, 'kit.md');
  fs.writeFileSync(f, ficha("aprueba: 'x'\n"));
  const r = correr(['leer', f]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /:\d+: /);
  assert.ok(r.stderr.startsWith(`${f}:6: `), r.stderr);
  assert.equal(r.stdout, '');
});

test('CLI leer de un archivo que no existe: 3', () => {
  const r = correr(['leer', path.join(os.tmpdir(), 'no-existe-ficha-xyz', 'kit.md')]);
  assert.equal(r.status, 3);
});

test('CLI mal llamado: 2', () => {
  assert.equal(correr(['bailar']).status, 2);
  assert.equal(correr([]).status, 2);
  assert.equal(correr(['leer']).status, 2);
  assert.equal(correr(['campo', EJEMPLO]).status, 2);
  assert.match(correr(['bailar']).stderr, /uso:/);
});

test('CLI campo: texto plano, JSON para listas y ausente da 0 sin stdout', () => {
  const a = correr(['campo', EJEMPLO, 'entornos.base-real.clase']);
  assert.equal(a.status, 0);
  assert.equal(a.stdout.trim(), 'real');
  const b = correr(['campo', EJEMPLO, 'secretos']);
  assert.deepStrictEqual(JSON.parse(b.stdout), ['DB_URL', 'HUB_TOKEN']);
  const c = correr(['campo', EJEMPLO, 'frenos.quitados.1.hasta']);
  assert.equal(c.stdout.trim(), '2026-11-15');
  const d = correr(['campo', EJEMPLO, 'no.existe']);
  assert.equal(d.status, 0);
  assert.equal(d.stdout, '');
  assert.match(d.stderr, /campo ausente: no\.existe/);
});

test('CLI hash coincide con la biblioteca', () => {
  const r = correr(['hash', EJEMPLO]);
  assert.equal(r.status, 0);
  assert.equal(r.stdout.trim(), hash(fs.readFileSync(EJEMPLO)));
  assert.match(r.stdout.trim(), /^[0-9a-f]{12}$/);
  assert.equal(correr(['hash', path.join(os.tmpdir(), 'no-existe-xyz')]).status, 3);
});

test('CLI version con HOME vacío y un repo sin ficha: 0 y "instalada: —"', () => {
  const home = tmp('ficha-home');
  const repo = tmp('ficha-repo');
  fs.mkdirSync(path.join(repo, '.git'));
  const r = correr(['version'], { cwd: repo, env: { ...process.env, HOME: home, USERPROFILE: home } });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /instalada: —/);
  assert.match(r.stdout, /proyecto: —/);
  assert.match(r.stdout, /canónica: —/);
});

test('CLI version: instalada, proyecto y canónica, con sus avisos de atraso', () => {
  const home = tmp('ficha-home');
  const repo = tmp('ficha-repo');
  fs.mkdirSync(path.join(home, '.claude'));
  fs.writeFileSync(path.join(home, '.claude', 'VERSION'), '2.4.3\n');
  fs.mkdirSync(path.join(repo, '.git'));
  fs.mkdirSync(path.join(repo, 'kit'));
  fs.writeFileSync(path.join(repo, 'kit', 'VERSION'), '2.10.0\n');
  fs.mkdirSync(path.join(repo, '.claude'));
  fs.writeFileSync(path.join(repo, '.claude', 'kit.md'), fs.readFileSync(EJEMPLO, 'utf8').replace('kit: 2.4.3', 'kit: 2.4.0'));
  const sub = path.join(repo, 'kit');
  const r = correr(['version'], { cwd: sub, env: { ...process.env, HOME: home, USERPROFILE: home } });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(
    r.stdout.trim(),
    'instalada: 2.4.3 · proyecto: 2.4.0 · canónica: 2.10.0 → esta PC está atrás: actualizate → hay kit nuevo para este proyecto'
  );
});

test('CLI version con la ficha del repo rota: 1', () => {
  const home = tmp('ficha-home');
  const repo = tmp('ficha-repo');
  fs.mkdirSync(path.join(repo, '.git'));
  fs.mkdirSync(path.join(repo, '.claude'));
  fs.writeFileSync(path.join(repo, '.claude', 'kit.md'), ficha("aprueba: 'x'\n"));
  const r = correr(['version'], { cwd: repo, env: { ...process.env, HOME: home, USERPROFILE: home } });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /:6: /);
});

test('proyecto ESM: el .cjs corre igual con "type": "module" al lado', () => {
  const dir = tmp('ficha-esm');
  fs.writeFileSync(path.join(dir, 'package.json'), '{"type":"module"}\n');
  const lib = path.join(dir, '.claude', 'hooks', 'lib');
  fs.mkdirSync(lib, { recursive: true });
  fs.copyFileSync(SCRIPT, path.join(lib, 'ficha.cjs'));
  const r = spawnSync(process.execPath, [path.join(lib, 'ficha.cjs'), 'leer', EJEMPLO], { cwd: dir, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.deepStrictEqual(JSON.parse(r.stdout), ESPERADO);
});
