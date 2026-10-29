'use strict';
// Pruebas de scripts/estructura.cjs (P6.1, D2.2 F4): los argumentos, las salidas 0 · 1 · 2, el formato de cada línea, --molde y
// --sin-log, y los cuatro casos de 4.7 (son scripts, no hooks): sin node, ficha malformada, error interno, sin remoto ni ficha.
// Repos temporales sin la configuración de git de la PC. Corren con: node --test "kit/**/*.test.cjs".
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-estructura-'));
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

const MOLDE = path.join(__dirname, '..');
const script = require('./estructura.cjs');
const candado = require('../hooks/lib/candado.cjs');

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
function commit(d, archivos, mensaje = 'c') {
  for (const [rel, texto] of Object.entries(archivos)) {
    escribir(d, rel, texto);
    g(d, 'add', '-f', '--', rel);
  }
  g(d, 'commit', '-q', '-m', mensaje);
}
const FICHA = (candadoPieza = 'molde') => `---\nkit: 2.4.3\nnivel: liviano\nvars:\n  proyecto: px\npiezas:\n  candado: ${candadoPieza}\n---\n`;
function repo(archivos = {}, o = {}) {
  const d = path.join(TMP, `r${n++}`);
  fs.mkdirSync(d, { recursive: true });
  g(d, 'init', '-q', '-b', 'main');
  commit(d, { '.gitignore': '/.kit-rol\n', 'a.txt': 'a\n', ...(o.ficha === false ? {} : { '.claude/kit.md': o.ficha || FICHA() }), ...archivos }, 'base');
  return d;
}
// En proceso (rápido).
function cli(d, args) {
  let out = '';
  let err = '';
  const codigo = script.main(args, { cwd: d, salida: (s) => (out += s), error: (s) => (err += s) });
  return { codigo, out, err };
}
// Como lo corre /cierre: un proceso node con el script instanciado en .claude/scripts/.
function instanciar(d, sin = null) {
  const copiar = (de, a) => {
    fs.mkdirSync(a, { recursive: true });
    for (const e of fs.readdirSync(de, { withFileTypes: true })) {
      if (e.isDirectory()) copiar(path.join(de, e.name), path.join(a, e.name));
      else if (!e.name.endsWith('.test.cjs') && e.name !== sin) fs.copyFileSync(path.join(de, e.name), path.join(a, e.name));
    }
  };
  copiar(path.join(MOLDE, 'hooks'), path.join(d, '.claude', 'hooks'));
  fs.mkdirSync(path.join(d, '.claude', 'scripts'), { recursive: true });
  fs.copyFileSync(path.join(MOLDE, 'scripts', 'estructura.cjs'), path.join(d, '.claude', 'scripts', 'estructura.cjs'));
}
function correr(cwd, archivo, args, ejecutable = process.execPath) {
  const r = spawnSync(ejecutable, [archivo, ...args], { cwd, encoding: 'utf8', env: process.env, timeout: 120000 });
  return { codigo: r.status, out: r.stdout, err: r.stderr, error: r.error };
}
const ESTRUCTURA = path.join('.claude', 'scripts', 'estructura.cjs');

// ---------------------------------------------------------------- argumentos

test('argumentos: nada o todo = los nueve; parcial; ids con o sin candado:, sin repetir; --molde y --sin-log', () => {
  assert.deepEqual(script.leerArgumentos([]), { modo: 'todo', ids: script.IDS, molde: null, log: true });
  assert.equal(script.leerArgumentos(['todo']).modo, 'todo');
  assert.equal(script.leerArgumentos(['parcial', '--sin-log']).log, false);
  assert.deepEqual(script.leerArgumentos(['barreras', 'candado:raiz', 'raiz', '--molde', 'kit/molde']), { modo: 'ids', ids: ['barreras', 'raiz'], molde: 'kit/molde', log: true });
  assert.deepEqual(script.IDS, candado.IDS, 'los mismos nueve que la librería');
});

test('mal llamado → 2 con el uso: id desconocido, bandera desconocida, todo con ids, --molde sin carpeta o inexistente', () => {
  const d = repo();
  for (const args of [['nada'], ['--rapido'], ['todo', 'raiz'], ['raiz', 'parcial'], ['--molde'], ['--molde', 'x', '--molde', 'y'], ['--molde', 'no-existe']]) {
    const r = cli(d, args);
    assert.equal(r.codigo, 2, JSON.stringify(args));
    assert.match(r.err, /Uso: node \.claude\/scripts\/estructura\.cjs/);
    assert.equal(r.out, '');
  }
});

// ---------------------------------------------------------------- salidas

test('0 en verde con una línea; 1 con una línea "candado:<id> · qué pasa · qué hacer" por falla y su renglón en frenos.log', () => {
  const d = repo();
  const v = cli(d, ['--sin-log']);
  assert.equal(v.codigo, 0);
  assert.match(v.out, /^candado: en verde \(raiz, rutas, topes, mesa, estados, lecturas, estado-viejo, barreras, datos\)\n$/);
  escribir(d, 'docs/suelto.md', 'x\n');
  escribir(d, '.claude/settings.json', '{"permissions": {"allow": ["Bash(*)"]}}\n');
  const r = cli(d, []);
  assert.equal(r.codigo, 1);
  const lineas = r.out.trim().split('\n');
  assert.equal(lineas.length, 2);
  assert.ok(lineas.every((l) => /^candado:[a-z-]+ · .+ · .+$/.test(l)));
  assert.match(lineas[0], /^candado:raiz · `docs\/suelto\.md` no va ahí · /);
  assert.match(lineas[1], /^candado:barreras · lo que está por commitearse toca settings \(allow:Bash\(\*\)\) sin un aprobado sellado/);
  const log = fs.readFileSync(path.join(d, '.claude', 'frenos.log'), 'utf8').trim().split('\n');
  assert.deepEqual(log.map((l) => l.split(' · ').slice(3)), [['candado:raiz', 'estructura', 'docs/suelto.md'], ['candado:barreras', 'estructura', '.claude/settings.json']]);
  // ids sueltos: solo esos
  const s = cli(d, ['candado:barreras', '--sin-log']);
  assert.equal(s.codigo, 1);
  assert.equal(s.out.trim().split('\n').length, 1);
});

test('--molde llega a barreras (exención a), relativo al cwd', () => {
  const d = repo();
  escribir(d, 'molde-afuera/hooks/x.cjs', 'del molde\n');
  escribir(d, '.claude/hooks/x.cjs', 'del molde\n');
  fs.appendFileSync(path.join(d, '.git', 'info', 'exclude'), '/molde-afuera/\n');
  assert.equal(cli(d, ['barreras', '--sin-log']).codigo, 1);
  const r = cli(d, ['barreras', '--molde', 'molde-afuera', '--sin-log']);
  assert.equal(r.codigo, 0, r.out);
});

test('fuera de un repo git: 1 con una línea', () => {
  const d = path.join(TMP, `suelto${n++}`);
  fs.mkdirSync(d);
  const r = cli(d, []);
  assert.equal(r.codigo, 1);
  assert.equal(r.out, 'estructura: no estás dentro de un repo git\n');
});

// ---------------------------------------------------------------- los cuatro casos de 4.7

test('4.7 · sin node: un estructura.cjs que no arranca no da 0 (y /cierre, sin salida o con salida distinta de 0, no commitea)', () => {
  const d = repo();
  // node apuntando a un archivo que no existe: el caso de un script que no llegó o un node roto
  const r = correr(d, path.join(d, '.claude', 'scripts', 'no-existe.cjs'), ['todo']);
  assert.notEqual(r.codigo, 0);
  // y un "node" que no está: el proceso ni arranca, no hay salida 0
  const sinNode = correr(d, ESTRUCTURA, ['todo'], path.join(TMP, 'no-hay-node.exe'));
  assert.notEqual(sinNode.codigo, 0);
  assert.ok(sinNode.error || sinNode.codigo === null);
});

test('4.7 · ficha malformada → 1 con "ficha rota: <archivo>:<línea> — corré doctor"', () => {
  const d = repo({}, { ficha: '---\nkit: 2.4.3\nnivel: liviano\nvars: [\n---\n' });
  instanciar(d);
  const r = correr(d, ESTRUCTURA, ['todo', '--sin-log']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /^ficha rota: \.claude\/kit\.md:\d+ — corré doctor; no hay ninguna anterior que se lea\n$/);
});

test('4.7 · error interno → 1 con "candado roto: corré doctor", nunca 0 (una librería que falta, y una que tira)', () => {
  const d = repo();
  instanciar(d, 'barreras.cjs');
  for (const args of [['todo'], ['parcial'], ['barreras']]) {
    const r = correr(d, ESTRUCTURA, [...args, '--sin-log']);
    assert.equal(r.codigo, 1, JSON.stringify(args));
    assert.equal(r.out, 'candado roto: corré doctor\n');
  }
  assert.equal(correr(d, ESTRUCTURA, ['nada']).codigo, 2, 'mal llamado sigue siendo 2');
  // en proceso: una salida que no es 0 ni 1 (la librería cambiada) tampoco pasa
  const correrOriginal = candado.correr;
  candado.correr = () => ({ codigo: 0 });
  try {
    assert.deepEqual(cli(repo(), []), { codigo: 1, out: 'candado roto: corré doctor\n', err: '' });
  } finally {
    candado.correr = correrOriginal;
  }
  // en proceso: un chequeo que tira
  const original = candado.CHEQUEOS.datos;
  candado.CHEQUEOS.datos = () => {
    throw new Error('forzado');
  };
  try {
    const r = cli(repo(), ['--sin-log']);
    assert.equal(r.codigo, 1);
    assert.equal(r.out, 'candado roto: corré doctor\n');
  } finally {
    candado.CHEQUEOS.datos = original;
  }
});

test('4.7 · sin remoto ni ficha → 0 sin trabar ("sin ficha: candado apagado"), aunque docs/ esté desordenado', () => {
  const d = repo({ 'docs/suelto.md': 'x\n' }, { ficha: false });
  instanciar(d);
  const r = correr(d, ESTRUCTURA, []);
  assert.equal(r.codigo, 0, r.out + r.err);
  assert.equal(r.out, 'sin ficha: candado apagado\n');
  assert.equal(fs.existsSync(path.join(d, '.claude', 'frenos.log')), false);
});

test('el script instanciado corre igual que en el molde: barreras en rojo da 1 y la línea, y se registra (herramienta estructura)', () => {
  const d = repo();
  instanciar(d);
  g(d, 'add', '-A');
  g(d, 'commit', '-q', '-m', 'molde');
  // el commit que instaló el molde ya está commiteado; sin remoto y en main sin base: solo lo pendiente
  const v = correr(d, ESTRUCTURA, ['parcial']);
  assert.equal(v.codigo, 0, v.out);
  escribir(d, '.claude/settings.json', '{"permissions": {"deny": []}, "x": 1}\n');
  const r = correr(d, ESTRUCTURA, ['barreras']);
  assert.equal(r.codigo, 1, r.out);
  assert.match(r.out, /^candado:barreras · lo que está por commitearse toca settings/);
  assert.match(fs.readFileSync(path.join(d, '.claude', 'frenos.log'), 'utf8'), / · candado:barreras · estructura · \.claude\/settings\.json\n$/);
  // editar el propio script del candado también es barrera (r4-3)
  fs.unlinkSync(path.join(d, '.claude', 'settings.json'));
  escribir(d, '.claude/scripts/estructura.cjs', '// editado\n');
  const o = cli(d, ['barreras', '--sin-log']);
  assert.equal(o.codigo, 1);
  assert.match(o.out, /^candado:barreras · lo que está por commitearse toca hooks \(hooks:\.claude\/scripts\/estructura\.cjs\)/);
});
