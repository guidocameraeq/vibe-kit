'use strict';
// Pruebas de db-guardia.cjs (SPEC-0 6.6 y criterio 19; SPEC-paquete-3 P6.6, D-4 y criterio 10): cada rama de la guardia con su
// sí y su no — el veredicto (falta, otro hash, solo en el disco, commiteado), borrar de noche y de día, la bandera, el quitado
// vigente y vencido, dummy/prueba, sin ficha y entorno no declarado — y cada forma de borrar. Corren con:
// node --test "kit/**/*.test.cjs". Repos temporales armados acá, sin la config de git de la PC.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-dbg-'));
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

const dbg = require('./db-guardia.cjs');
const ficha = require('./ficha.cjs');

// ---------------------------------------------------------------- ayudantes

let n = 0;
function g(cwd, ...args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', env: process.env });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}
function escribir(d, rel, texto) {
  const p = path.join(d, ...rel.split('/'));
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, texto);
}
function commit(d, rel, texto, msg = 'c') {
  escribir(d, rel, texto);
  g(d, 'add', '--', rel);
  g(d, 'commit', '-q', '-m', msg);
}

const FICHA = (quitados = '') =>
  [
    '---',
    'kit: 2.4.3',
    'nivel: estandar',
    'vars:',
    '  proyecto: x',
    ...(quitados ? ['frenos:', '  quitados:', `    - {id: ${quitados.id}, por: "prueba", hasta: ${quitados.hasta}}`] : []),
    'sensible:',
    '  datos-reales: ["tabla:clientes", "tabla:ventas.pedidos", tabla prosa de la base real]',
    'entornos:',
    '  base-real:',
    '    clase: real',
    '  base-local:',
    '    clase: dummy',
    '  base-prueba:',
    '    clase: prueba',
    '---',
    '',
  ].join('\n');

// Un repo en main con la ficha commiteada (o sin ficha, con fichaTexto null).
function repo(fichaTexto = FICHA()) {
  const d = path.join(TMP, `r${n++}`);
  fs.mkdirSync(d, { recursive: true });
  g(d, 'init', '-q', '-b', 'main');
  if (fichaTexto === null) commit(d, 'LEEME.md', 'x\n');
  else commit(d, '.claude/kit.md', fichaTexto);
  return d;
}

const veredicto = (h, v = 'aprobado') => `# Revisión\n\nveredicto: ${v}\nhash: ${h}\n`;
// Commitea el veredicto del plan (o el texto que se le pase).
function aprobar(d, plan, texto) {
  const h = dbg.hashPlan(plan);
  commit(d, `.claude/revisiones/${h}.md`, texto === undefined ? veredicto(h) : texto);
  return h;
}

const SUAVE = [{ ruta: 'db/migraciones/001.sql', texto: 'CREATE TABLE notas (id int);\n' }];
const BORRA = [{ ruta: 'db/migraciones/002.sql', texto: 'DELETE FROM clientes WHERE id = 3;\n' }];
const pedido = (d, plan, extra = {}) => ({ raiz: d, entorno: 'base-real', plan, rol: 'humano', banderas: [], ...extra });

// ---------------------------------------------------------------- el hash del plan

test('hashPlan: ficha.hash de ruta\\0texto\\0 por ruta; igual sin importar el orden del plan', () => {
  const a = { ruta: 'b/2.sql', texto: 'select 2;' };
  const b = { ruta: 'a/1.sql', texto: 'select 1;' };
  assert.equal(dbg.hashPlan([a, b]), dbg.hashPlan([b, a]));
  assert.equal(dbg.hashPlan([a, b]), ficha.hash('a/1.sql\0select 1;\0b/2.sql\0select 2;\0'));
  assert.match(dbg.hashPlan([a]), /^[0-9a-f]{12}$/);
  assert.notEqual(dbg.hashPlan([a]), dbg.hashPlan([{ ...a, texto: 'select 3;' }]));
  assert.notEqual(dbg.hashPlan([a]), dbg.hashPlan([{ ...a, ruta: 'b/3.sql' }]));
  // la barra de Windows es la misma ruta
  assert.equal(dbg.hashPlan([{ ruta: 'a\\1.sql', texto: 'x' }]), dbg.hashPlan([{ ruta: 'a/1.sql', texto: 'x' }]));
});

test('plan roto (no lista, sin texto, ruta repetida) → db:plan-roto, aun en dummy', () => {
  const d = repo();
  for (const plan of [null, 'x', [{ ruta: 'a.sql' }], [{ ruta: '', texto: '' }], [{ ruta: 'a', texto: '1' }, { ruta: 'a', texto: '2' }]]) {
    const r = dbg.juzgar(pedido(d, plan, { entorno: 'base-local' }));
    assert.equal(r.ok, false);
    assert.equal(r.id, 'db:plan-roto');
  }
});

// ---------------------------------------------------------------- 1. el veredicto

test('real sin veredicto → db:sin-veredicto (con el hash en el motivo)', () => {
  const d = repo();
  const r = dbg.juzgar(pedido(d, SUAVE));
  assert.deepEqual([r.ok, r.niega, r.id], [false, true, 'db:sin-veredicto']);
  assert.ok(r.motivo.includes(dbg.hashPlan(SUAVE)));
  assert.match(r.motivo, /no hay \.claude\/revisiones\/[0-9a-f]{12}\.md commiteado/);
});

test('veredicto commiteado OK → ok', () => {
  const d = repo();
  aprobar(d, SUAVE);
  assert.deepEqual(dbg.juzgar(pedido(d, SUAVE)), { ok: true });
});

test('veredicto con otro hash adentro → db:sin-veredicto', () => {
  const d = repo();
  aprobar(d, SUAVE, veredicto('0123456789ab'));
  const r = dbg.juzgar(pedido(d, SUAVE));
  assert.equal(r.id, 'db:sin-veredicto');
  assert.match(r.motivo, /otro plan/);
});

test('veredicto de otro plan (el archivo se llama como el hash viejo) → db:sin-veredicto', () => {
  const d = repo();
  aprobar(d, SUAVE);
  const cambiado = [{ ...SUAVE[0], texto: SUAVE[0].texto + 'DROP TABLE notas;\n' }];
  assert.equal(dbg.juzgar(pedido(d, cambiado)).id, 'db:sin-veredicto');
});

test('veredicto distinto de aprobado, o dos renglones que no coinciden → db:sin-veredicto', () => {
  for (const texto of [
    (h) => veredicto(h, 'rechazado'),
    (h) => veredicto(h, 'Aprobado'),
    (h) => `hash: ${h}\n`,
    (h) => `veredicto: aprobado\n`,
    (h) => `${veredicto(h)}veredicto: rechazado\n`,
    (h) => `${veredicto(h)}hash: 0123456789ab\n`,
  ]) {
    const d = repo();
    aprobar(d, SUAVE, texto(dbg.hashPlan(SUAVE)));
    assert.equal(dbg.juzgar(pedido(d, SUAVE)).id, 'db:sin-veredicto');
  }
});

test('veredicto solo en el disco (no commiteado) → db:sin-veredicto, y lo dice', () => {
  const d = repo();
  const h = dbg.hashPlan(SUAVE);
  escribir(d, `.claude/revisiones/${h}.md`, veredicto(h));
  const r = dbg.juzgar(pedido(d, SUAVE));
  assert.equal(r.id, 'db:sin-veredicto');
  assert.match(r.motivo, /en el disco pero no commiteado/);
  g(d, 'add', '--', `.claude/revisiones/${h}.md`); // en el índice tampoco alcanza
  assert.equal(dbg.juzgar(pedido(d, SUAVE)).id, 'db:sin-veredicto');
});

test('veredicto commiteado y después cambiado en el disco: manda HEAD', () => {
  const d = repo();
  const h = aprobar(d, SUAVE);
  escribir(d, `.claude/revisiones/${h}.md`, veredicto(h, 'rechazado'));
  assert.deepEqual(dbg.juzgar(pedido(d, SUAVE)), { ok: true });
});

test('veredicto con CRLF y BOM → vale igual', () => {
  const d = repo();
  const h = dbg.hashPlan(SUAVE);
  aprobar(d, SUAVE, `﻿veredicto: aprobado\r\nhash: ${h}\r\n`);
  assert.deepEqual(dbg.juzgar(pedido(d, SUAVE)), { ok: true });
});

// ---------------------------------------------------------------- la clase del entorno

test('dummy y prueba → ok sin mirar el veredicto, aunque borre y sea de noche', () => {
  const d = repo();
  for (const entorno of ['base-local', 'base-prueba']) {
    assert.deepEqual(dbg.juzgar(pedido(d, BORRA, { entorno, rol: 'nocturno' })), { ok: true });
  }
});

test('sin ficha → real: sin veredicto niega', () => {
  const d = repo(null);
  const r = dbg.juzgar(pedido(d, SUAVE, { entorno: 'base-local' }));
  assert.equal(r.id, 'db:sin-veredicto');
  assert.match(r.motivo, /no hay ficha vigente/);
});

test('sin ficha → real, y toda tabla cuenta como datos reales', () => {
  const d = repo(null);
  const plan = [{ ruta: 'm.sql', texto: 'DELETE FROM cualquiera;' }];
  aprobar(d, plan);
  assert.equal(dbg.juzgar(pedido(d, plan, { entorno: 'base-local' })).id, 'db:borra-datos-reales');
});

test('ficha rota → real', () => {
  const d = repo('---\nkit: 2.4.3\nnivel: liviano\nvars:\n  proyecto: x\ncolorcito:\n\ta: b\n---\n');
  const r = dbg.juzgar(pedido(d, SUAVE, { entorno: 'base-local' }));
  assert.equal(r.id, 'db:sin-veredicto');
  assert.match(r.motivo, /ficha está rota/);
});

test('entorno no declarado (o sin nombre, o un nombre de Object) → real', () => {
  const d = repo();
  for (const entorno of ['otra-base', '', undefined, 'constructor', '__proto__']) {
    const r = dbg.juzgar(pedido(d, SUAVE, { entorno }));
    assert.equal(r.id, 'db:sin-veredicto', String(entorno));
    assert.match(r.motivo, /no está en entornos/, String(entorno));
  }
});

test('la ficha vigente es la de main: en otra rama, cambiar base-real a dummy no cambia nada', () => {
  const d = repo();
  g(d, 'switch', '-q', '-c', 'modulo/x--01');
  commit(d, '.claude/kit.md', FICHA().replace('    clase: real', '    clase: dummy'));
  assert.equal(dbg.juzgar(pedido(d, SUAVE)).id, 'db:sin-veredicto');
});

// ---------------------------------------------------------------- 2. borra datos reales

test('humano + borra sin bandera → db:borra-datos-reales con la línea lista', () => {
  const d = repo();
  aprobar(d, BORRA);
  const r = dbg.juzgar(pedido(d, BORRA));
  assert.deepEqual([r.ok, r.id], [false, 'db:borra-datos-reales']);
  assert.ok(r.motivo.includes('`db migrar --borra-datos-reales`'));
  assert.match(r.motivo, /te va a aparecer la ventana/);
  assert.match(r.motivo, /DELETE FROM clientes/);
});

test('humano (y director, obrero) + borra con la bandera → ok', () => {
  const d = repo();
  aprobar(d, BORRA);
  for (const rol of ['humano', 'director', 'obrero']) {
    assert.deepEqual(dbg.juzgar(pedido(d, BORRA, { rol, banderas: ['--otra', '--borra-datos-reales'] })), { ok: true });
  }
  // una bandera parecida no alcanza
  for (const banderas of [['--borra-datos'], ['--borra-datos-reales=si'], '--borra-datos-reales']) {
    assert.equal(dbg.juzgar(pedido(d, BORRA, { banderas })).id, 'db:borra-datos-reales');
  }
});

test('nocturno + borra → db:borra-de-noche con PARADA, aun con la bandera; y lo mismo actualizador y desconocido', () => {
  const d = repo();
  aprobar(d, BORRA);
  for (const rol of ['nocturno', 'actualizador', 'desconocido', 'cualquiera']) {
    const r = dbg.juzgar(pedido(d, BORRA, { rol, banderas: ['--borra-datos-reales'] }));
    assert.equal(r.id, 'db:borra-de-noche', rol);
    assert.match(r.motivo, /PARADA/);
  }
});

test('nocturno + no borra → ok (con veredicto)', () => {
  const d = repo();
  aprobar(d, SUAVE);
  assert.deepEqual(dbg.juzgar(pedido(d, SUAVE, { rol: 'nocturno' })), { ok: true });
});

test('sin rol: lo lee de .kit-rol (nocturno niega; sin archivo, humano)', () => {
  const d = repo();
  aprobar(d, BORRA);
  assert.equal(dbg.juzgar(pedido(d, BORRA, { rol: undefined })).id, 'db:borra-datos-reales');
  fs.writeFileSync(path.join(d, '.kit-rol'), 'nocturno\n');
  assert.equal(dbg.juzgar(pedido(d, BORRA, { rol: undefined, banderas: ['--borra-datos-reales'] })).id, 'db:borra-de-noche');
});

test('quitado pregunta:borrar-datos-reales vigente → sigue, aun de noche y sin bandera', () => {
  for (const hasta of ['siempre', '2026-11-15']) {
    const d = repo(FICHA({ id: 'pregunta:borrar-datos-reales', hasta }));
    aprobar(d, BORRA);
    const ahora = new Date(2026, 10, 15, 23, 0); // el día de hasta, incluido
    assert.deepEqual(dbg.juzgar(pedido(d, BORRA, { ahora })), { ok: true });
    assert.deepEqual(dbg.juzgar(pedido(d, BORRA, { ahora, rol: 'nocturno' })), { ok: true });
  }
});

test('quitado vencido → como si no estuviera', () => {
  const d = repo(FICHA({ id: 'pregunta:borrar-datos-reales', hasta: '2026-11-15' }));
  aprobar(d, BORRA);
  const ahora = new Date(2026, 10, 16, 0, 1);
  assert.equal(dbg.juzgar(pedido(d, BORRA, { ahora })).id, 'db:borra-datos-reales');
  assert.equal(dbg.juzgar(pedido(d, BORRA, { ahora, rol: 'nocturno' })).id, 'db:borra-de-noche');
});

test('los db:* no se quitan: ni db:sin-veredicto ni db:borra-de-noche', () => {
  const d = repo(FICHA({ id: 'db:sin-veredicto', hasta: 'siempre' }));
  assert.equal(dbg.juzgar(pedido(d, SUAVE)).id, 'db:sin-veredicto');
  const d2 = repo(FICHA({ id: 'db:borra-de-noche', hasta: 'siempre' }));
  aprobar(d2, BORRA);
  assert.equal(dbg.juzgar(pedido(d2, BORRA, { rol: 'nocturno' })).id, 'db:borra-de-noche');
  // el quitado de A no saltea el veredicto
  const d3 = repo(FICHA({ id: 'pregunta:borrar-datos-reales', hasta: 'siempre' }));
  assert.equal(dbg.juzgar(pedido(d3, BORRA)).id, 'db:sin-veredicto');
});

test('el plan borra si cualquiera de sus archivos borra', () => {
  const d = repo();
  const plan = [...SUAVE, ...BORRA];
  aprobar(d, plan);
  assert.equal(dbg.juzgar(pedido(d, plan)).id, 'db:borra-datos-reales');
});

// ---------------------------------------------------------------- borra(texto, tablas): cada forma

const T = ['clientes', 'ventas.pedidos'];
const si = (sql) => assert.ok(dbg.borra(sql, T).length > 0, `tendría que borrar: ${sql}`);
const no = (sql) => assert.deepEqual(dbg.borra(sql, T), [], `no tendría que borrar: ${sql}`);

test('borra: DELETE FROM, con o sin esquema, comillas, corchetes y mayúsculas mezcladas', () => {
  si('DELETE FROM clientes;');
  si('delete from public.clientes where id = 1');
  si('DeLeTe   FrOm\n  "Clientes"');
  si('DELETE FROM [dbo].[clientes]');
  si('DELETE FROM `clientes`');
  si('DELETE FROM "public"."clientes"');
  si('DELETE FROM ONLY clientes');
  si('DELETE TOP (10) FROM clientes');
  si('DELETE clientes WHERE 1=1'); // T-SQL sin FROM
  si('DELETE c FROM clientes c JOIN x ON c.id = x.id'); // T-SQL con alias
  si('delete from pedidos'); // ventas.pedidos en la ficha: cuenta el último pedazo
  si("EXECUTE 'DELETE FROM clientes'"); // adentro de un texto, borra igual
});

test('borra: DROP TABLE, con IF EXISTS y en lista', () => {
  si('DROP TABLE clientes;');
  si('drop table if exists public.clientes cascade;');
  si('DROP TABLE notas, clientes;');
});

test('borra: TRUNCATE, con y sin TABLE', () => {
  si('TRUNCATE clientes;');
  si('truncate table clientes');
  si('TRUNCATE ONLY notas, "clientes" RESTART IDENTITY');
});

test('borra: ALTER TABLE … DROP (columna, constraint)', () => {
  si('ALTER TABLE clientes DROP COLUMN email;');
  si('alter table if exists only public.clientes add column x int, drop constraint c1');
  no('ALTER TABLE clientes ADD COLUMN email text;');
  no('ALTER TABLE notas DROP COLUMN cliente;');
  no('ALTER TABLE clientes ADD COLUMN x int; DROP INDEX i1;'); // el DROP es de otra sentencia
});

test('borra: DROP SCHEMA y DROP DATABASE, siempre (sin tablas en la ficha también)', () => {
  assert.deepEqual(dbg.borra('DROP SCHEMA ventas CASCADE;', []), ['DROP SCHEMA']);
  assert.deepEqual(dbg.borra('drop database app', []), ['DROP DATABASE']);
  assert.deepEqual(dbg.borra('DROP SCHEMA IF EXISTS x', undefined), ['DROP SCHEMA']);
});

test('borra: en un comentario NO borra', () => {
  no('-- DELETE FROM clientes\nSELECT 1;');
  no('/* DROP TABLE clientes */ SELECT 1;');
  no('/* uno /* anidado */ TRUNCATE clientes */ SELECT 1;');
  no('SELECT 1; -- truncate clientes');
});

test('borra: un comentario sin cerrar no esconde nada', () => {
  si('/* sin cerrar\nDELETE FROM clientes;');
});

test('borra: un -- adentro de un texto o un nombre no corta lo que sigue', () => {
  si("SELECT 'a--b'; DELETE FROM clientes;");
  si("SELECT 'it\\'s -- x'; DELETE FROM clientes;"); // con \ que escapa (MySQL)
  si('SELECT $$--$$; DELETE FROM clientes;'); // texto con $$ (Postgres)
  si('SELECT "a--b" FROM t; DELETE FROM clientes;');
  si("SELECT 'sin cerrar -- DELETE FROM clientes");
});

test('borra: sobre otra tabla NO borra', () => {
  no('DELETE FROM notas;');
  no('DROP TABLE clientes_viejos;');
  no('TRUNCATE notas;');
  no('DELETE FROM notas WHERE cliente IN (SELECT id FROM clientes);'); // clientes solo se lee
  no('SELECT * FROM clientes;');
  no('INSERT INTO clientes VALUES (1); UPDATE clientes SET x = 1;');
  no('SELECT truncate(1.5, 0) FROM clientes;'); // la función, no la sentencia
  no('SELECT truncate (1.5, 0) FROM clientes;'); // también con espacio
  no('CREATE TABLE clientes2 (id int);');
});

test('borra: tablas null = no hay lista legible y toda tabla cuenta', () => {
  assert.deepEqual(dbg.borra('DELETE FROM notas', null), ['DELETE FROM notas']);
  assert.deepEqual(dbg.borra('DELETE FROM notas', []), []);
});

test('tablasDe: solo las entradas tabla:, sin la prosa ni los comandos', () => {
  assert.deepEqual(dbg.tablasDe({ sensible: { 'datos-reales': ['tabla:clientes', 'npm run x', 'tabla clientes'] } }), ['clientes']);
  assert.deepEqual(dbg.tablasDe({ sensible: { 'datos-reales': 'no' } }), []);
  assert.deepEqual(dbg.tablasDe({}), []);
  assert.equal(dbg.tablasDe(null), null);
});

test('borra con una tabla de la ficha que trae comillas o esquema', () => {
  assert.ok(dbg.borra('DELETE FROM clientes', ['"Clientes"']).length > 0);
  assert.ok(dbg.borra('DELETE FROM otro.clientes', ['ventas.clientes']).length > 0);
});

test('juzgar nunca tira: un error adentro es db:guardia-rota', () => {
  const r = dbg.juzgar({ raiz: path.join(TMP, 'no-existe'), entorno: 'x', plan: SUAVE, rol: 'humano', banderas: [] });
  assert.equal(r.ok, false); // sin git: sin ficha → real → sin veredicto (o guardia rota): niega igual
  assert.ok(['db:sin-veredicto', 'db:guardia-rota'].includes(r.id));
  assert.equal(dbg.juzgar(null).ok, false);
});
