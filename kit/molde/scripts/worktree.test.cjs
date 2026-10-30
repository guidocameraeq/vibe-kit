'use strict';
// Pruebas de scripts/worktree.cjs (SPEC-paquete-4 P6.2; criterios 11, 12, 13, 14 y 16): cada subcomando con sus casos sí y no, H §19bis
// reproducida, el filtro de credenciales que falla cerrado (r1-4), las negativas de cerrar (r1-1, r1-2, r1-9, también con
// core.autocrlf=true) y .kit-rol con los mismos bytes desde PowerShell y desde Bash. Repos temporales con un remoto bare, sin la
// configuración de git de la PC y con un HOME falso (el almacén de verdad no se toca). Corren con: node --test "kit/**/*.test.cjs".
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-worktree-'));
const GLOBAL = path.join(TMP, 'gitconfig-vacio');
fs.writeFileSync(GLOBAL, '[core]\n\tlongpaths = true\n'); // el remoto bare en un temporal hondo pasa los 260 de Windows
const HOME = path.join(TMP, 'home');
fs.mkdirSync(HOME);
Object.assign(process.env, {
  GIT_CONFIG_GLOBAL: GLOBAL,
  GIT_CONFIG_NOSYSTEM: '1',
  XDG_CONFIG_HOME: TMP,
  HOME,
  USERPROFILE: HOME,
  GIT_AUTHOR_NAME: 'Prueba',
  GIT_AUTHOR_EMAIL: 'prueba@ejemplo.invalid',
  GIT_COMMITTER_NAME: 'Prueba',
  GIT_COMMITTER_EMAIL: 'prueba@ejemplo.invalid',
});
test.after(() => fs.rmSync(TMP, { recursive: true, force: true }));

const MOLDE = path.join(__dirname, '..');
const SCRIPT = path.join(__dirname, 'worktree.cjs');
const W = require('./worktree.cjs');
const contexto = require('../hooks/lib/contexto.cjs');
const frenosLog = require('../hooks/lib/frenos-log.cjs');
const SNIPPET = fs.readFileSync(path.join(MOLDE, 'gitignore.snippet'), 'utf8');
const BOM = String.fromCharCode(0xfeff);
const VALOR = 'valor-secreto-123';
const WIN = process.platform === 'win32';

// ---------------------------------------------------------------- ayudantes

function g(cwd, ...args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', env: process.env });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}
const gOk = (cwd, ...args) => spawnSync('git', args, { cwd, encoding: 'utf8', env: process.env }).status === 0;
function escribir(d, rel, contenido) {
  const p = path.join(d, ...rel.split('/'));
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, contenido);
}
const leer = (d, rel) => {
  try {
    return fs.readFileSync(path.join(d, ...rel.split('/')), 'utf8');
  } catch (e) {
    return null;
  }
};
function commit(d, archivos, mensaje = 'c') {
  for (const [rel, contenido] of Object.entries(archivos)) {
    escribir(d, rel, contenido);
    g(d, 'add', '-f', '--', rel);
  }
  g(d, 'commit', '-q', '-m', mensaje);
  return g(d, 'rev-parse', 'HEAD');
}
const ficha = (proyecto, setup) =>
  `---\nkit: 2.4.3\nnivel: estandar\nvars:\n  proyecto: ${proyecto}\n${setup ? `  comando-setup: ${setup}\n` : ''}frenos:\n  opcionales: []\n  quitados: []\n---\n`;
const RENGLON = '2026-10-30T10:00:00-03:00 · humano · main · deny:x · Bash · base\n';
const almacenDe = (nombre) => path.join(HOME, '.config', 'kit-secretos', `${nombre}.env`);

// Un proyecto: el principal (alfa), con su remoto bare, la ficha, el módulo x commiteado, frenos.log versionado, un .env ignorado
// con una credencial que TAMBIÉN está en el almacén falso (por error), y el almacén.
let n = 0;
function proyecto(o = {}) {
  const nombre = `px${n++}`;
  const base = path.join(TMP, nombre);
  const remoto = path.join(base, 'remoto.git');
  const P = path.join(base, o.carpeta || 'alfa');
  fs.mkdirSync(P, { recursive: true });
  g(base, 'init', '-q', '--bare', '-b', 'main', remoto);
  g(P, 'init', '-q', '-b', 'main');
  if (o.autocrlf) g(P, 'config', 'core.autocrlf', 'true');
  const archivos = {
    '.gitignore': o.gitignore !== undefined ? o.gitignore : `${SNIPPET}/setup-hecho\n`,
    '.claude/kit.md': ficha(nombre, o.setup),
    'docs/modulos/x/README.md': '# x\nEstado: en curso\n',
    'docs/modulos/y/README.md': '# y\nEstado: en curso\n',
    'a.txt': 'a\n',
    ...(o.sinLog ? {} : { '.claude/frenos.log': RENGLON }),
    ...(o.archivos || {}),
  };
  commit(P, archivos, 'base');
  fs.writeFileSync(path.join(P, '.env'), o.env !== undefined ? o.env : `PORT=3000\nSECRET_KEY=${VALOR}\nDB_URL=postgres://local\n`);
  g(P, 'remote', 'add', 'origin', remoto);
  g(P, 'push', '-q', 'origin', 'main');
  if (o.almacen !== null) {
    fs.mkdirSync(path.dirname(almacenDe(nombre)), { recursive: true });
    fs.writeFileSync(almacenDe(nombre), o.almacen !== undefined ? o.almacen : `SECRET_KEY=${VALOR}\n`);
  }
  return { nombre, base, remoto, P, wt: (c) => path.join(P, '.claude', 'worktrees', c) };
}
// En proceso (rápido).
function cli(cwd, args) {
  let out = '';
  let err = '';
  const codigo = W.main(args, { cwd, salida: (s) => (out += s), error: (s) => (err += s), heredar: false });
  return { codigo, out, err };
}
const existeRama = (P, r) => gOk(P, 'rev-parse', '--verify', '-q', `refs/heads/${r}`);
const barras = (p) => path.resolve(p).split(path.sep).join('/');
const sinValores = (r, ...valores) => {
  for (const v of [VALOR, ...valores]) assert.ok(!(r.out + r.err).includes(v), `un valor del almacén salió por pantalla: ${v}`);
};

// ---------------------------------------------------------------- mal llamado y piezas sueltas

test('mal llamado → 2 con el uso: comando, nombre (mayúsculas, ID de un dígito, dos encargos, > 20), banderas', () => {
  const p = proyecto();
  for (const args of [
    [], ['nada'], ['crear'], ['crear', 'X'], ['crear', 'x--1'], ['crear', 'x--01--02'], ['crear', 'a'.repeat(21)], ['crear', 'x-'],
    ['crear', 'x', '--model'], ['crear', 'x', '--model', 'op;us'], ['crear', 'x', '--otra'], ['sync-env', 'x'], ['cerrar', 'x', '--noche'], ['cerrar'],
  ]) {
    const r = cli(p.P, args);
    assert.equal(r.codigo, 2, JSON.stringify(args));
    assert.match(r.err, /Uso: node \.claude\/scripts\/worktree\.cjs/);
    assert.equal(r.out, '');
  }
  assert.deepEqual(W.nombreDe('identidad--07'), { x: 'identidad', id: '07', rama: 'modulo/identidad--07', carpeta: 'modulo--identidad--07', madre: 'modulo/identidad' });
  assert.equal(W.nombreDe('a'.repeat(20)).rama, `modulo/${'a'.repeat(20)}`);
  assert.equal(cli(TMP, ['sync-env']).codigo, 1, 'fuera de un repo');
});

test('filtrarEnv: export, espacios alrededor del =, CRLF, BOM, valor multilínea entre comillas, mayúsculas; el resto intacto', () => {
  const nombres = new Set(['SECRET_KEY', 'TOKEN']);
  const t = `${BOM}# comentario\r\nPORT=3000\r\nexport SECRET_KEY = "uno\r\ndos\r\ntres"\r\nOTRA='a'\r\n  token=x\r\nMULTI="SECRET_KEY=no\nsigue"\r\nTOKEN='sin cerrar\nFIN=1\n`;
  const f = W.filtrarEnv(t, nombres);
  assert.deepEqual(f.sacados, ['SECRET_KEY', 'token', 'TOKEN']);
  assert.equal(f.texto, `${BOM}# comentario\r\nPORT=3000\r\nOTRA='a'\r\nMULTI="SECRET_KEY=no\nsigue"\r`);
  assert.equal(W.filtrarEnv('A=1\nB=2\n', nombres).texto, 'A=1\nB=2\n', 'sin nombres del almacén: los mismos bytes');
});

test('leerAlmacen: sin archivo, BOM + CRLF + comentarios, UTF-16 e inválido → ilegible; del almacén salen solo los nombres', () => {
  const d = path.join(TMP, 'alm');
  fs.mkdirSync(path.join(d, '.claude'), { recursive: true });
  fs.writeFileSync(path.join(d, '.claude', 'kit.md'), ficha('almprueba'));
  const ruta = almacenDe('almprueba');
  assert.equal(W.leerAlmacen(d).estado, 'sin');
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  fs.writeFileSync(ruta, `${BOM}# nota\r\n\r\nSECRET_KEY=${VALOR}\r\notro=1\r\n`);
  const a = W.leerAlmacen(d);
  assert.equal(a.estado, 'ok');
  assert.deepEqual([...a.nombres], ['SECRET_KEY', 'OTRO']);
  assert.ok(!JSON.stringify({ ...a, nombres: [...a.nombres] }).includes(VALOR));
  fs.writeFileSync(ruta, Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(`SECRET_KEY=${VALOR}\n`, 'utf16le')]));
  assert.equal(W.leerAlmacen(d).estado, 'ilegible');
  fs.writeFileSync(ruta, `SECRET_KEY=${VALOR}\nesto no es un renglón\n`);
  const b = W.leerAlmacen(d);
  assert.equal(b.estado, 'ilegible');
  assert.equal(b.nombres.size, 0);
  assert.ok(!JSON.stringify(b).includes(VALOR));
});

test('<proyecto>: la misma regla que cargar-secreto.sh (ficha con comillas y comentario; sin ficha, la carpeta)', { skip: !buscarBash() && 'no hay Git Bash' }, () => {
  const BASH = buscarBash();
  const SH = path.join(MOLDE, '..', 'skills', 'arquitecto-skills', 'pc', 'cargar-secreto.sh');
  const casos = [
    ['Mi Proyecto', null],
    ['otra', '---\nkit: 2.4.3\nvars:\n  lenguajes: [js]\n  proyecto: "Ñandú App" # comentario\nfrenos:\n  quitados: []\n---\n'],
  ];
  for (const [carpeta, f] of casos) {
    const home = path.join(TMP, `home-sh-${carpeta.replace(/\W/g, '')}`);
    const d = path.join(TMP, 'sh', carpeta);
    fs.mkdirSync(d, { recursive: true });
    g(d, 'init', '-q');
    if (f) escribir(d, '.claude/kit.md', f);
    const r = spawnSync(BASH, [SH, 'NOMBRE_X'], { cwd: d, input: 'v\n', encoding: 'utf8', env: { ...process.env, HOME: home, USERPROFILE: home } });
    assert.equal(r.status, 0, r.stderr);
    const creado = fs.readdirSync(path.join(home, '.config', 'kit-secretos')).filter((s) => s.endsWith('.env'));
    assert.deepEqual(creado, [`${W.proyectoDe(d)}.env`]);
  }
});

test('rutaPermiso: //c/… en Windows (unidad en minúscula, barras /), //… en el resto', () => {
  if (WIN) {
    assert.equal(W.rutaPermiso('C:\\Users\\U\\alfa'), '//c/Users/U/alfa');
    assert.deepEqual(W.reglasDeny('D:\\p'), ['Read(//d/p/.env)', 'Read(//d/p/.env.*)', 'Edit(//d/p/.env)', 'Edit(//d/p/.env.*)', 'Write(//d/p/.env)', 'Write(//d/p/.env.*)']);
  } else {
    assert.equal(W.rutaPermiso('/home/u/alfa'), '//home/u/alfa');
  }
});

// ---------------------------------------------------------------- crear (crit. 11, 12)

test('H §19bis: crear x y x--01 — nombres, base del encargo en la punta del módulo, .env filtrado, setup, deny, la línea', () => {
  const p = proyecto({ setup: 'node setup.cjs', archivos: { 'setup.cjs': "require('fs').writeFileSync('setup-hecho', 'si')\n" } });
  const r = cli(p.P, ['crear', 'x']);
  assert.equal(r.codigo, 0, r.out + r.err);
  sinValores(r);
  const wx = p.wt('modulo--x');
  assert.equal(g(wx, 'symbolic-ref', '--short', 'HEAD'), 'modulo/x');
  assert.equal(g(p.P, 'rev-parse', 'modulo/x'), g(p.P, 'rev-parse', 'main'));
  assert.deepEqual(fs.readFileSync(path.join(wx, '.kit-rol')), Buffer.from('director\n'));
  assert.equal(contexto.rol(wx), 'director');
  assert.equal(leer(wx, '.env'), 'PORT=3000\nDB_URL=postgres://local\n');
  assert.match(r.out, /^no copié SECRET_KEY de \.env: vive en el almacén$/m);
  assert.match(r.out, /sin \.worktreeinclude/);
  assert.equal(leer(wx, 'setup-hecho'), 'si', 'comando-setup corrido en el worktree');
  const s = JSON.parse(leer(wx, '.claude/settings.local.json'));
  assert.deepEqual(s.permissions.deny, W.reglasDeny(p.P));
  if (WIN) assert.match(s.permissions.deny[0], /^Read\(\/\/[a-z]\/.+\/alfa\/\.env\)$/);
  const lineas = r.out.trim().split('\n');
  assert.equal(lineas[lineas.length - 1], `cd "${barras(wx)}"; claude --name director-x --model opus`);
  if (WIN) assert.equal(g(p.P, 'config', 'core.longpaths'), 'true');
  assert.equal(g(wx, 'status', '--porcelain', '--untracked-files=all'), '', 'el worktree nace limpio (todo lo agregado está ignorado)');
  // El encargo nace de la punta de modulo/x, no de main.
  const punta = commit(wx, { 'modulo.txt': 'm\n' }, 'trabajo del módulo');
  const r1 = cli(p.P, ['crear', 'x--01']);
  assert.equal(r1.codigo, 0, r1.out);
  const w1 = p.wt('modulo--x--01');
  assert.equal(g(w1, 'rev-parse', 'HEAD'), punta);
  assert.deepEqual(fs.readFileSync(path.join(w1, '.kit-rol')), Buffer.from('obrero\n'));
  assert.match(r1.out, new RegExp(`cd "${barras(w1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"; claude --name obrero-x--01 --model sonnet\\n$`));
  // --noche y --model.
  const r2 = cli(p.P, ['crear', 'x--02', '--noche', '--model', 'haiku']);
  assert.equal(r2.codigo, 0, r2.out);
  assert.deepEqual(fs.readFileSync(path.join(p.wt('modulo--x--02'), '.kit-rol')), Buffer.from('nocturno\n'));
  assert.match(r2.out, /claude --name obrero-x--02 --model haiku\n$/);
});

test('crear se niega (1, sin crear nada) si .claude/worktrees/, .kit-rol o settings.local.json no están ignorados, o .kit-rol está commiteado', () => {
  const casos = [
    ['/.claude/worktrees/\n', /\.claude\/worktrees\/ no está ignorado/],
    ['/.kit-rol\n', /\.kit-rol no está ignorado/],
    ['/.claude/settings.local.json\n', /\.claude\/settings\.local\.json no está ignorado/],
  ];
  for (const [quitar, re] of casos) {
    const p = proyecto({ gitignore: SNIPPET.replace(quitar, '') });
    const r = cli(p.P, ['crear', 'x']);
    assert.equal(r.codigo, 1, quitar);
    assert.match(r.out, re);
    assert.match(r.out, /gitignore\.snippet del kit ENTERO/);
    assert.ok(!existeRama(p.P, 'modulo/x') && !fs.existsSync(p.wt('modulo--x')), 'no creó nada');
  }
  const p = proyecto({ archivos: { '.kit-rol': 'director\n' } });
  const r = cli(p.P, ['crear', 'x']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /\.kit-rol no está ignorado/);
  assert.ok(!existeRama(p.P, 'modulo/x'));
  // abrir: las mismas negativas (el .gitignore del disco del principal).
  fs.writeFileSync(path.join(p.P, '.gitignore'), SNIPPET.replace('/.kit-rol\n', ''));
  assert.equal(cli(p.P, ['abrir', 'x']).codigo, 1);
});

test('crear se niega: módulo sin commitear en main, rama o carpeta que ya existen (eso es abrir), encargo sin el módulo', () => {
  const p = proyecto();
  const sinModulo = cli(p.P, ['crear', 'z']);
  assert.equal(sinModulo.codigo, 1);
  assert.match(sinModulo.out, /docs\/modulos\/z\/README\.md no está commiteado en main/);
  const encargo = cli(p.P, ['crear', 'x--01']);
  assert.equal(encargo.codigo, 1);
  assert.match(encargo.out, /no existe modulo\/x/);
  assert.ok(!existeRama(p.P, 'modulo/x--01'));
  g(p.P, 'branch', 'modulo/x');
  assert.match(cli(p.P, ['crear', 'x']).out, /la rama modulo\/x ya existe — eso es abrir/);
  g(p.P, 'push', '-q', 'origin', 'modulo/x');
  g(p.P, 'branch', '-D', 'modulo/x');
  assert.match(cli(p.P, ['crear', 'x']).out, /ya existe — eso es abrir/, 'solo en origin');
  fs.mkdirSync(p.wt('modulo--y'), { recursive: true });
  const c = cli(p.P, ['crear', 'y']);
  assert.equal(c.codigo, 1);
  assert.match(c.out, /la carpeta \.claude\/worktrees\/modulo--y ya existe/);
  assert.ok(!existeRama(p.P, 'modulo/y'));
});

// ---------------------------------------------------------------- credenciales (crit. 12, r1-4)

test('credenciales: desde el worktree del director saca lo mismo y el deny apunta al principal; sin almacén lo dice y copia', () => {
  const p = proyecto();
  assert.equal(cli(p.P, ['crear', 'x']).codigo, 0);
  const wx = p.wt('modulo--x');
  const r = cli(wx, ['crear', 'x--01']);
  assert.equal(r.codigo, 0, r.out);
  sinValores(r);
  const w1 = p.wt('modulo--x--01');
  assert.ok(fs.existsSync(w1), 'la carpeta va bajo el principal, no adentro del director');
  assert.equal(leer(w1, '.env'), 'PORT=3000\nDB_URL=postgres://local\n');
  assert.deepEqual(JSON.parse(leer(w1, '.claude/settings.local.json')).permissions.deny, W.reglasDeny(p.P));
  const q = proyecto({ almacen: null });
  const s = cli(q.P, ['crear', 'x']);
  assert.equal(s.codigo, 0);
  assert.match(s.out, new RegExp(`sin almacén para ${q.nombre}: no saqué nada`));
  assert.match(leer(q.wt('modulo--x'), '.env'), /SECRET_KEY=/);
});

test('credenciales: almacén con BOM saca; en UTF-16 o con renglones inválidos → 1 sin copiar ningún .env ni crear nada', () => {
  const p = proyecto({ almacen: `${BOM}SECRET_KEY=otro\r\n` });
  assert.equal(cli(p.P, ['crear', 'x']).codigo, 0);
  assert.doesNotMatch(leer(p.wt('modulo--x'), '.env'), /SECRET_KEY/);
  for (const alm of [Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(`SECRET_KEY=${VALOR}\n`, 'utf16le')]), `SECRET_KEY ${VALOR}\n`]) {
    const q = proyecto({ almacen: alm });
    const r = cli(q.P, ['crear', 'x']);
    assert.equal(r.codigo, 1);
    assert.match(r.out, /no copié ningún \.env/);
    sinValores(r);
    assert.ok(!existeRama(q.P, 'modulo/x') && !fs.existsSync(q.wt('modulo--x')));
  }
});

test('credenciales: export NOMBRE = "multilínea" con CRLF → sacado entero; .env en UTF-16 → 1 sin crear', () => {
  const p = proyecto({ env: `export SECRET_KEY = "${VALOR}\r\nsegunda-linea-secreta"\r\nOTRA=1\r\n` });
  const r = cli(p.P, ['crear', 'x']);
  assert.equal(r.codigo, 0, r.out);
  sinValores(r, 'segunda-linea-secreta');
  assert.equal(leer(p.wt('modulo--x'), '.env'), 'OTRA=1\r\n');
  const q = proyecto({ env: Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from('PORT=1\n', 'utf16le')]) });
  const s = cli(q.P, ['crear', 'x']);
  assert.equal(s.codigo, 1);
  assert.match(s.out, /UTF-16/);
  assert.ok(!existeRama(q.P, 'modulo/x'));
});

test('credenciales: un .env* trackeado con un valor para un nombre del almacén → 1; con el valor vacío pasa', () => {
  const p = proyecto({ archivos: { 'config/.env.produccion': `SECRET_KEY=${VALOR}\n` } });
  const r = cli(p.P, ['crear', 'x']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /\.env trackeado con un nombre del almacén: config\/\.env\.produccion \(SECRET_KEY\)/);
  sinValores(r);
  assert.ok(!existeRama(p.P, 'modulo/x'));
  const q = proyecto({ archivos: { '.env.example': 'SECRET_KEY=\nPORT=3000\n' } });
  assert.equal(cli(q.P, ['crear', 'x']).codigo, 0);
});

test('credenciales: .worktreeinclude manda; settings.local.json copiado se MEZCLA con el deny sin pisar lo que tenía', () => {
  const previo = { permissions: { allow: ['Bash(ls)'], deny: ['Bash(rm:*)'] }, otra: 1 };
  const p = proyecto({ archivos: { '.worktreeinclude': '.env\n.claude/settings.local.json\nnotas.txt\n' } });
  escribir(p.P, 'notas.txt', 'sin ignorar: no viaja\n');
  escribir(p.P, '.claude/settings.local.json', JSON.stringify(previo));
  escribir(p.P, '.env.local', 'NO_VIAJA=1\n');
  const r = cli(p.P, ['crear', 'x']);
  assert.equal(r.codigo, 0, r.out);
  assert.doesNotMatch(r.out, /sin \.worktreeinclude/);
  const wx = p.wt('modulo--x');
  assert.equal(leer(wx, '.env.local'), null, '.worktreeinclude no lo lista');
  assert.equal(leer(wx, 'notas.txt'), null, 'listado pero no ignorado: no se copia (como el -w nativo)');
  const s = JSON.parse(leer(wx, '.claude/settings.local.json'));
  assert.deepEqual(s.permissions.allow, ['Bash(ls)']);
  assert.deepEqual(s.permissions.deny, ['Bash(rm:*)', ...W.reglasDeny(p.P)]);
  assert.equal(s.otra, 1);
});

test('comando-setup que falla → 1, lo dice, no borra nada y da la línea igual', () => {
  const p = proyecto({ setup: 'node falla.cjs', archivos: { 'falla.cjs': 'process.exit(3)\n' } });
  const r = cli(p.P, ['crear', 'x']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /comando-setup falló \(salida 3\)/);
  assert.match(r.out, /claude --name director-x --model opus\n$/);
  assert.ok(existeRama(p.P, 'modulo/x') && fs.existsSync(path.join(p.wt('modulo--x'), '.kit-rol')));
});

// ---------------------------------------------------------------- abrir (crit. 11, r1-10)

test('abrir: solo en origin → la crea; local atrás → la adelanta; divergida → 1; borrada a mano y registrada → anda; ya abierta o inexistente → 1', () => {
  const p = proyecto();
  assert.equal(cli(p.P, ['crear', 'x']).codigo, 0);
  const wx = p.wt('modulo--x');
  commit(wx, { 'm.txt': '1\n' });
  g(wx, 'push', '-q', 'origin', 'modulo/x');
  g(p.P, 'worktree', 'remove', wx);
  g(p.P, 'branch', '-D', 'modulo/x');
  // Otra PC: la rama solo está en origin.
  let r = cli(p.P, ['abrir', 'x']);
  assert.equal(r.codigo, 0, r.out);
  sinValores(r);
  assert.deepEqual(fs.readFileSync(path.join(wx, '.kit-rol')), Buffer.from('director\n'));
  assert.equal(leer(wx, '.env'), 'PORT=3000\nDB_URL=postgres://local\n');
  assert.match(r.out, /claude --name director-x --model opus\n$/);
  assert.match(cli(p.P, ['abrir', 'x']).out, /ya está abierto en esta PC/);
  // El compañero empuja; acá la local queda atrás.
  const otra = path.join(p.base, 'otra');
  g(p.base, 'clone', '-q', '-b', 'modulo/x', p.remoto, otra);
  const nueva = commit(otra, { 'm.txt': '2\n' });
  g(otra, 'push', '-q', 'origin', 'modulo/x');
  g(p.P, 'worktree', 'remove', wx);
  r = cli(p.P, ['abrir', 'x']);
  assert.equal(r.codigo, 0, r.out);
  assert.match(r.out, /adelanté modulo\/x/);
  assert.equal(g(wx, 'rev-parse', 'HEAD'), nueva);
  // Divergida: un commit acá y otro allá.
  commit(wx, { 'aca.txt': '1\n' });
  commit(otra, { 'alla.txt': '1\n' });
  g(otra, 'push', '-q', 'origin', 'modulo/x');
  g(p.P, 'worktree', 'remove', wx);
  r = cli(p.P, ['abrir', 'x']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /divergió/);
  assert.ok(!fs.existsSync(wx));
  // Carpeta borrada a mano que seguía registrada.
  assert.equal(cli(p.P, ['crear', 'y']).codigo, 0);
  fs.rmSync(p.wt('modulo--y'), { recursive: true, force: true });
  r = cli(p.P, ['abrir', 'y']);
  assert.equal(r.codigo, 0, r.out);
  assert.equal(contexto.rol(p.wt('modulo--y')), 'director');
  assert.match(cli(p.P, ['abrir', 'nada']).out, /eso es crear/);
});

// ---------------------------------------------------------------- sync-env (crit. 12, 16; r1-8)

test('sync-env: saca lo que llegó al almacén después, no pisa el PORT propio, no toca el -w nativo; almacén ilegible → 1', () => {
  const p = proyecto();
  assert.equal(cli(p.P, ['crear', 'x']).codigo, 0);
  const wx = p.wt('modulo--x');
  fs.writeFileSync(path.join(wx, '.env'), 'PORT=4000\nNUEVO_TOKEN=otro-valor-456\n');
  fs.writeFileSync(path.join(wx, '.env.local'), 'NUEVO_TOKEN=otro-valor-456\nX=1\n');
  const nativo = p.wt('prueba');
  g(p.P, 'worktree', 'add', '-q', '-b', 'worktree-prueba', nativo, 'main');
  fs.writeFileSync(path.join(nativo, '.env'), 'NUEVO_TOKEN=otro-valor-456\n');
  fs.appendFileSync(almacenDe(p.nombre), 'NUEVO_TOKEN=otro-valor-456\n');
  const r = cli(p.P, ['sync-env']);
  assert.equal(r.codigo, 0, r.out);
  sinValores(r, 'otro-valor-456');
  assert.equal(leer(wx, '.env'), 'PORT=4000\n', 'solo saca: ni re-copia ni pisa el PORT');
  assert.equal(leer(wx, '.env.local'), 'X=1\n');
  assert.match(r.out, /saqué NUEVO_TOKEN de modulo--x\/\.env: vive en el almacén/);
  assert.equal(leer(nativo, '.env'), 'NUEVO_TOKEN=otro-valor-456\n', 'el worktree-* nativo no se toca');
  assert.ok(!fs.existsSync(path.join(nativo, '.kit-rol')));
  assert.match(leer(p.P, '.env'), /SECRET_KEY=/, 'el principal no se toca');
  assert.match(cli(p.P, ['sync-env']).out, /nada que sacar/);
  fs.writeFileSync(path.join(wx, '.env'), 'NUEVO_TOKEN=otro-valor-456\n');
  fs.writeFileSync(almacenDe(p.nombre), Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from('NUEVO_TOKEN=1\n', 'utf16le')]));
  const m = cli(p.P, ['sync-env']);
  assert.equal(m.codigo, 1);
  assert.equal(leer(wx, '.env'), 'NUEVO_TOKEN=otro-valor-456\n', 'no tocó nada');
  fs.rmSync(almacenDe(p.nombre));
  assert.match(cli(p.P, ['sync-env']).out, /sin almacén para/);
  // cerrar tampoco toca el -w nativo (crit. 16).
  assert.equal(cli(p.P, ['cerrar', 'prueba']).codigo, 1);
  assert.ok(fs.existsSync(nativo) && existeRama(p.P, 'worktree-prueba'));
});

// ---------------------------------------------------------------- cerrar (crit. 13; r1-1, r1-2, r1-9)

test('cerrar x--01 desde el principal en main, con core.autocrlf=true: sin mergear, sucio, desde adentro, frenos.log del medio, remove que falla → 1; después 0', () => {
  const p = proyecto({ autocrlf: true });
  assert.equal(cli(p.P, ['crear', 'x']).codigo, 0);
  assert.equal(cli(p.P, ['crear', 'x--01']).codigo, 0);
  const wx = p.wt('modulo--x');
  const w1 = p.wt('modulo--x--01');
  assert.match(fs.readFileSync(path.join(w1, '.claude', 'frenos.log'), 'utf8'), /\r\n$/, 'autocrlf: el log sale con CRLF');
  commit(w1, { 'encargo.txt': 'hecho\n' });
  const intacto = () => assert.ok(fs.existsSync(w1) && existeRama(p.P, 'modulo/x--01'), 'nada borrado');
  let r = cli(p.P, ['cerrar', 'x--01']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /no está mergeada en modulo\/x/);
  intacto();
  g(wx, 'merge', '-q', '--no-ff', '-m', 'encargo 01', 'modulo/x--01');
  assert.equal(g(p.P, 'symbolic-ref', '--short', 'HEAD'), 'main');
  assert.ok(!gOk(p.P, 'merge-base', '--is-ancestor', 'modulo/x--01', 'main'), 'no está en main');
  fs.writeFileSync(path.join(w1, 'a.txt'), 'cambiado\n');
  const suelto = frenosLog.anotar(w1, { id: 'x', herramienta: 'Bash', detalle: 'suelto', rol: 'obrero', rama: 'modulo/x--01' });
  r = cli(p.P, ['cerrar', 'x--01']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /cambios sin commitear/);
  assert.ok(fs.readFileSync(path.join(w1, '.claude', 'frenos.log'), 'utf8').includes(suelto), 'los chequeos van antes de mudar nada');
  assert.ok(!fs.existsSync(path.join(p.P, '.git', 'kit-frenos.log')));
  intacto();
  g(w1, 'checkout', '--', 'a.txt', '.claude/frenos.log');
  fs.rmSync(path.join(w1, '.claude', 'frenos.log'));
  r = cli(p.P, ['cerrar', 'x--01']);
  assert.equal(r.codigo, 1, 'frenos.log borrado: sucio');
  assert.match(r.out, /sigue sucio/);
  intacto();
  g(w1, 'checkout', '--', '.claude/frenos.log');
  r = cli(w1, ['cerrar', 'x--01']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /estás adentro/);
  intacto();
  const log = path.join(w1, '.claude', 'frenos.log');
  fs.writeFileSync(log, `editado a mano\r\n${RENGLON}`);
  r = cli(p.P, ['cerrar', 'x--01']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /cambió en el medio/);
  assert.match(fs.readFileSync(log, 'utf8'), /editado a mano/, 'no lo tocó');
  intacto();
  g(w1, 'checkout', '--', '.claude/frenos.log');
  g(p.P, 'worktree', 'lock', w1);
  r = cli(p.P, ['cerrar', 'x--01']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /git worktree remove falló .*cerrá la pestaña.*la rama modulo\/x--01 sigue/);
  intacto();
  g(p.P, 'worktree', 'unlock', w1);
  // Un hook de sesión agrega dos renglones (LF) sobre el archivo con CRLF: se mudan al común y remove anda sin --force.
  const dato = { id: 'deny:Bash(git stash:*)', herramienta: 'Bash', detalle: 'git stash', rol: 'obrero', rama: 'modulo/x--01' };
  const r1 = frenosLog.anotar(w1, dato);
  const r2 = frenosLog.anotar(w1, { ...dato, detalle: 'git reset --hard' });
  assert.ok(fs.readFileSync(log, 'utf8').includes('\r\n') && fs.readFileSync(log, 'utf8').endsWith(`${r2}\n`), 'CRLF de la base y LF del hook');
  assert.notEqual(g(w1, 'status', '--porcelain'), '', 'el log quedó sucio');
  r = cli(p.P, ['cerrar', 'x--01']);
  assert.equal(r.codigo, 0, r.out);
  assert.ok(!fs.existsSync(w1) && !existeRama(p.P, 'modulo/x--01'), 'carpeta y rama borradas');
  const comun = fs.readFileSync(path.join(p.P, '.git', 'kit-frenos.log'), 'utf8');
  assert.match(comun, /^# worktree cerrar modulo--x--01 · \d{4}-/m);
  assert.ok(comun.includes(`${r1}\n${r2}\n`), 'los renglones, en el mismo formato');
  assert.ok(!comun.includes(RENGLON), 'la base no se muda');
  assert.ok(existeRama(p.P, 'modulo/x') && fs.existsSync(wx), 'el director sigue');
  assert.ok(!/['"]--force['"]/.test(fs.readFileSync(SCRIPT, 'utf8')), 'remove nunca con --force');
});

test('cerrar x: mergeado solo en origin/main → 0; sin mergear → 1; frenos.log creado por un hook → mudado entero; carpeta borrada a mano → prune', () => {
  const p = proyecto({ sinLog: true });
  assert.equal(cli(p.P, ['crear', 'x']).codigo, 0);
  const wx = p.wt('modulo--x');
  commit(wx, { 'm.txt': '1\n' });
  let r = cli(p.P, ['cerrar', 'x']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /no está mergeada en main/);
  g(wx, 'push', '-q', 'origin', 'modulo/x:main');
  assert.ok(!gOk(p.P, 'merge-base', '--is-ancestor', 'modulo/x', 'refs/heads/main'), 'la main local no la tiene');
  const renglon = frenosLog.anotar(wx, { id: 'x', herramienta: 'Edit', detalle: 'a', rol: 'director', rama: 'modulo/x' });
  r = cli(p.P, ['cerrar', 'x']);
  assert.equal(r.codigo, 0, r.out);
  assert.ok(!fs.existsSync(wx) && !existeRama(p.P, 'modulo/x'));
  assert.ok(fs.readFileSync(path.join(p.P, '.git', 'kit-frenos.log'), 'utf8').endsWith(`${renglon}\n`));
  assert.equal(cli(p.P, ['crear', 'y']).codigo, 0);
  fs.rmSync(p.wt('modulo--y'), { recursive: true, force: true });
  r = cli(p.P, ['cerrar', 'y']);
  assert.equal(r.codigo, 0, r.out);
  assert.match(r.out, /hice prune/);
  assert.ok(!existeRama(p.P, 'modulo/y'));
  assert.ok(!g(p.P, 'worktree', 'list').includes('modulo--y'));
});

// ---------------------------------------------------------------- .kit-rol (crit. 14)

function buscarBash() {
  const cand = [];
  if (process.env.KIT_BASH) cand.push(process.env.KIT_BASH);
  if (WIN) {
    for (const base of [process.env.ProgramFiles, process.env['ProgramFiles(x86)'], process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Programs')]) {
      if (base) cand.push(path.join(base, 'Git', 'bin', 'bash.exe'));
    }
  } else {
    cand.push('/bin/bash', '/usr/bin/bash');
  }
  return cand.find((c) => fs.existsSync(c)) || null;
}
const hayPowerShell = () => WIN && spawnSync('powershell', ['-NoProfile', '-Command', 'exit 0']).status === 0;

test('.kit-rol: los mismos bytes creado desde PowerShell y desde Bash; rol() lo lee, también con BOM y CRLF; UTF-16 → desconocido', { skip: !(buscarBash() && hayPowerShell()) && 'falta Git Bash o PowerShell' }, () => {
  const a = proyecto();
  const b = proyecto();
  const ps = spawnSync('powershell', ['-NoProfile', '-Command', `& node '${SCRIPT}' crear x--01; exit $LASTEXITCODE`], { cwd: a.P, encoding: 'utf8', env: process.env });
  g(b.P, 'branch', 'modulo/x');
  g(a.P, 'branch', 'modulo/x');
  const ps2 = spawnSync('powershell', ['-NoProfile', '-Command', `& node '${SCRIPT}' crear x--01; exit $LASTEXITCODE`], { cwd: a.P, encoding: 'utf8', env: process.env });
  const sh = spawnSync(buscarBash(), ['-c', `node '${SCRIPT.split(path.sep).join('/')}' crear x--01`], { cwd: b.P, encoding: 'utf8', env: process.env });
  assert.equal(ps.status, 1, 'sin modulo/x todavía');
  assert.equal(ps2.status, 0, ps2.stdout + ps2.stderr);
  assert.equal(sh.status, 0, sh.stdout + sh.stderr);
  const bytesPs = fs.readFileSync(path.join(a.wt('modulo--x--01'), '.kit-rol'));
  const bytesSh = fs.readFileSync(path.join(b.wt('modulo--x--01'), '.kit-rol'));
  assert.deepEqual(bytesPs, bytesSh);
  assert.deepEqual(bytesPs, Buffer.from('obrero\n', 'ascii'));
  assert.ok(!ps2.stdout.includes(VALOR) && !sh.stdout.includes(VALOR));
  const w = a.wt('modulo--x--01');
  assert.equal(contexto.rol(w), 'obrero');
  fs.writeFileSync(path.join(w, '.kit-rol'), `${BOM}obrero\r\n`);
  assert.equal(contexto.rol(w), 'obrero', 'BOM y CRLF');
  fs.writeFileSync(path.join(w, '.kit-rol'), Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from('obrero\r\n', 'utf16le')]));
  assert.equal(contexto.rol(w), 'desconocido', 'UTF-16: nunca humano');
});
