'use strict';
// Pruebas de scripts/worktree.cjs (SPEC-paquete-4 P6.2; criterios 11, 12, 13, 14 y 16): cada subcomando con sus casos sí y no, H §19bis
// reproducida, el filtro de credenciales que falla cerrado (r1-4), las negativas de cerrar (r1-1, r1-2, r1-9, también con
// core.autocrlf=true) y .kit-rol con los mismos bytes desde PowerShell y desde Bash. Y `integrar` (SPEC-paquete-5, crit. 7; r1-1). Repos temporales con un remoto bare, sin la
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
    '.claude/kit.md': o.ficha ? o.ficha(nombre) : ficha(nombre, o.setup),
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
// En proceso (rápido). `claude` no está en el PATH salvo que la prueba diga otra cosa (rf-1: así está en la PC de Guido).
function cli(cwd, args, extra = {}) {
  let out = '';
  let err = '';
  const codigo = W.main(args, { cwd, salida: (s) => (out += s), error: (s) => (err += s), heredar: false, claudeEnPath: false, ...extra });
  return { codigo, out, err };
}
const re = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// La apertura sin `claude` en el PATH: las dos líneas de VS Code, al final de la salida.
const apertura = (wt, modelo, sesion) =>
  `abrilo en VS Code: code "${barras(wt)}"\nen esa ventana, abrí la pestaña de Claude y elegí ${modelo} (nombre sugerido para la sesión: ${sesion})\n`;
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
  assert.ok(r.out.endsWith(apertura(wx, 'Opus', 'director-x')), r.out);
  assert.doesNotMatch(r.out, /claude --name/, 'sin claude en el PATH, ni la línea de terminal');
  if (WIN) assert.equal(g(p.P, 'config', 'core.longpaths'), 'true');
  assert.equal(g(wx, 'status', '--porcelain', '--untracked-files=all'), '', 'el worktree nace limpio (todo lo agregado está ignorado)');
  // El encargo nace de la punta de modulo/x, no de main.
  const punta = commit(wx, { 'modulo.txt': 'm\n' }, 'trabajo del módulo');
  // rf-1, sí: con `claude` en el PATH, VS Code primero y la línea de terminal al final.
  const r1 = cli(p.P, ['crear', 'x--01'], { claudeEnPath: true });
  assert.equal(r1.codigo, 0, r1.out);
  const w1 = p.wt('modulo--x--01');
  assert.equal(g(w1, 'rev-parse', 'HEAD'), punta);
  assert.deepEqual(fs.readFileSync(path.join(w1, '.kit-rol')), Buffer.from('obrero\n'));
  assert.match(r1.out, new RegExp(`${re(apertura(w1, 'Sonnet', 'obrero-x--01'))}o en una terminal: cd "${re(barras(w1))}"; claude --name obrero-x--01 --model sonnet\\n$`));
  // --noche y --model.
  const r2 = cli(p.P, ['crear', 'x--02', '--noche', '--model', 'haiku']);
  assert.equal(r2.codigo, 0, r2.out);
  assert.deepEqual(fs.readFileSync(path.join(p.wt('modulo--x--02'), '.kit-rol')), Buffer.from('nocturno\n'));
  assert.ok(r2.out.endsWith(apertura(p.wt('modulo--x--02'), 'Haiku', 'obrero-x--02')), r2.out);
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
  assert.match(r.out, /config\/\.env\.produccion \(SECRET_KEY\) — sacalo del repo \(git rm --cached\) o vacía ese valor/, 'rf-9, no: no es plantilla');
  const q = proyecto({ archivos: { '.env.example': 'SECRET_KEY=\nPORT=3000\n' } });
  assert.equal(cli(q.P, ['crear', 'x']).codigo, 0);
  // rf-9, sí: una plantilla con el valor puesto → que lo deje vacío, no que la saque del repo.
  const t = proyecto({ archivos: { '.env.example': `SECRET_KEY=${VALOR}\nPORT=3000\n` } });
  const rt = cli(t.P, ['crear', 'x']);
  assert.equal(rt.codigo, 1);
  assert.match(rt.out, /\.env\.example \(SECRET_KEY\) — es una plantilla: dejá SECRET_KEY= vacío en la plantilla/);
  assert.doesNotMatch(rt.out, /git rm --cached/);
  sinValores(rt);
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
  assert.ok(r.out.endsWith(apertura(p.wt('modulo--x'), 'Opus', 'director-x')), r.out);
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
  assert.ok(r.out.endsWith(apertura(wx, 'Opus', 'director-x')), r.out);
  const ya = cli(p.P, ['abrir', 'x']);
  assert.match(ya.out, /ya está abierto en esta PC:\n/);
  assert.ok(ya.out.endsWith(apertura(wx, 'Opus', 'director-x')), 'y repite cómo abrirlo');
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

test('rf-5: cerrar hace fetch — mergeado en "GitHub" sin traerlo → 0; con squash → 1 con el consejo; fetch que falla → sigue', () => {
  const p = proyecto({ archivos: { 'docs/modulos/z/README.md': '# z\nEstado: en curso\n' } });
  const otra = path.join(p.base, 'github');
  g(p.base, 'clone', '-q', p.remoto, otra);
  const enGithub = (x, squash) => {
    assert.equal(cli(p.P, ['crear', x]).codigo, 0);
    commit(p.wt(`modulo--${x}`), { [`${x}.txt`]: '1\n' });
    g(p.wt(`modulo--${x}`), 'push', '-q', 'origin', `modulo/${x}`);
    g(otra, 'fetch', '-q', 'origin');
    if (squash) {
      g(otra, 'merge', '-q', '--squash', `origin/modulo/${x}`);
      g(otra, 'commit', '-q', '-m', `squash ${x}`);
    } else {
      g(otra, 'merge', '-q', '--no-ff', '-m', `merge ${x}`, `origin/modulo/${x}`);
    }
    g(otra, 'push', '-q', 'origin', 'main');
  };
  enGithub('x', false);
  assert.ok(!gOk(p.P, 'merge-base', '--is-ancestor', 'modulo/x', 'refs/remotes/origin/main'), 'acá todavía no se ve');
  let r = cli(p.P, ['cerrar', 'x']);
  assert.equal(r.codigo, 0, r.out);
  assert.ok(!existeRama(p.P, 'modulo/x') && !fs.existsSync(p.wt('modulo--x')));
  enGithub('y', true);
  r = cli(p.P, ['cerrar', 'y']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /no está mergeada en main .*¿Lo mergeaste en GitHub\? hacé `git pull`; con squash, borrá la rama a mano \(`git branch -D modulo\/y`\)/);
  assert.ok(existeRama(p.P, 'modulo/y'), 'nada borrado');
  // Sin poder llegar a origin: lo dice y sigue con lo de esta PC (modulo/z sin commits propios: ya está en main).
  assert.equal(cli(p.P, ['crear', 'z']).codigo, 0);
  g(p.P, 'remote', 'set-url', 'origin', path.join(p.base, 'no-existe.git'));
  r = cli(p.P, ['cerrar', 'z']);
  assert.equal(r.codigo, 0, r.out);
  assert.match(r.out, /^no pude hacer fetch de origin .*: sigo con lo que hay en esta PC$/m);
});

test('rf-6: carpeta sin registro (remove borró el registro y no la carpeta) — con solo lo ignorado se borra y sigue; con algo más, a mano', () => {
  const p = proyecto({ archivos: { 'docs/modulos/v/README.md': '# v\nEstado: en curso\n' } });
  // Deja la carpeta como la deja un remove a medias: sin su registro en .git/worktrees y sin lo trackeado.
  const aMedias = (x, queda = []) => {
    assert.equal(cli(p.P, ['crear', x]).codigo, 0);
    const w = p.wt(`modulo--${x}`);
    fs.rmSync(path.join(p.P, '.git', 'worktrees', `modulo--${x}`), { recursive: true, force: true });
    const ignorados = ['.env', '.kit-rol', '.git', '.claude'];
    for (const e of fs.readdirSync(w)) if (!ignorados.includes(e) && !queda.includes(e)) fs.rmSync(path.join(w, e), { recursive: true, force: true });
    for (const e of fs.readdirSync(path.join(w, '.claude'))) if (e !== 'settings.local.json') fs.rmSync(path.join(w, '.claude', e), { recursive: true, force: true });
    assert.ok(!g(p.P, 'worktree', 'list').includes(`modulo--${x}`), 'ya no está registrado');
    return w;
  };
  const wx = aMedias('x');
  let r = cli(p.P, ['cerrar', 'x']);
  assert.equal(r.codigo, 0, r.out);
  assert.match(r.out, /ya no era un worktree y tenía solo lo ignorado: la borré/);
  assert.ok(!fs.existsSync(wx) && !existeRama(p.P, 'modulo/x'));
  // Vacía del todo: igual.
  const wv = aMedias('v');
  fs.rmSync(wv, { recursive: true, force: true });
  fs.mkdirSync(wv);
  assert.equal(cli(p.P, ['cerrar', 'v']).codigo, 0);
  assert.ok(!fs.existsSync(wv) && !existeRama(p.P, 'modulo/v'));
  // No: queda un archivo que el principal no ignora (a.txt) → como antes, a mano, y nada borrado.
  const wy = aMedias('y', ['a.txt']);
  r = cli(p.P, ['cerrar', 'y']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /existe pero no es el worktree de modulo\/y: revisala a mano/);
  assert.ok(fs.existsSync(path.join(wy, 'a.txt')) && fs.existsSync(path.join(wy, '.env')) && existeRama(p.P, 'modulo/y'));
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

// ---------------------------------------------------------------- integrar (SPEC-paquete-5, crit. 7; D5-3, D5-11, D5-14, r1-1)

// La ficha de los proyectos de integrar: comando-setup crea setup-hecho; comando-test lo necesita, y además mira que el temporal se
// equipó como `equipar` (r1-1): .kit-rol director y el .env copiado sin lo del almacén. Con KIT_PRUEBA_AVANZA, el test empuja otro
// clon a origin/main antes de terminar: origin avanza entre el fetch y el push.
const fichaI = (nombre, o = {}) =>
  [
    '---',
    'kit: 2.4.3',
    'nivel: estandar',
    'vars:',
    `  proyecto: ${nombre}`,
    ...(o.setup === null ? [] : [`  comando-setup: ${o.setup || 'node setup.cjs'}`]),
    ...(o.test === null ? [] : [`  comando-test: ${o.test || 'node test.cjs'}`]),
    'frenos:',
    '  opcionales: []',
    ...(o.quitados ? ['  quitados:', ...o.quitados.map((q) => `    - ${q}`)] : ['  quitados: []']),
    ...(o.merge ? ['autorizado:', `  merge-a-main: ${o.merge}`] : []),
    '---',
    '',
  ].join('\n');
const SETUP = "require('fs').writeFileSync('setup-hecho', 'si');\n";
const PRUEBA = [
  "const fs = require('fs');",
  "const env = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '';",
  "const ok = fs.existsSync('setup-hecho') && fs.readFileSync('.kit-rol', 'utf8') === 'director\\n' && env.includes('PORT=3000') && !env.includes('SECRET_KEY');",
  "if (ok && process.env.KIT_PRUEBA_AVANZA) require('child_process').execFileSync('git', ['-C', process.env.KIT_PRUEBA_AVANZA, 'push', '-q', 'origin', 'HEAD:main'], { stdio: 'ignore' });",
  'process.exit(ok ? 0 : 1);',
  '',
].join('\n');
function proyectoI(o = {}) {
  return proyecto({ ficha: (nombre) => fichaI(nombre, o), archivos: { 'setup.cjs': SETUP, 'test.cjs': PRUEBA, ...(o.archivos || {}) } });
}
const enOrigin = (p, ref = 'main') => g(p.remoto, 'rev-parse', ref);
const sinTemporal = (p, x = 'x') => {
  assert.ok(!fs.existsSync(p.wt(`integrar--${x}`)), 'el temporal se borró');
  assert.ok(!g(p.P, 'worktree', 'list').includes(`integrar--${x}`), 'y su registro');
};
// Un módulo x con un commit propio, abierto en su worktree del director.
function moduloX(p, archivos = { 'm.txt': 'del módulo\n' }, crea = 0) {
  assert.equal(cli(p.P, ['crear', 'x']).codigo, crea);
  const wx = p.wt('modulo--x');
  commit(wx, archivos, 'trabajo del módulo');
  return wx;
}

test('integrar, mal llamado → 2 (con encargo, sin nombre, bandera repetida o en otro comando); el USO lo nombra; sin origin o sin fetch → 1', () => {
  const p = proyectoI();
  for (const args of [['integrar'], ['integrar', 'x--01'], ['integrar', 'x', '--ok-de-guido', '--ok-de-guido'], ['crear', 'x', '--ok-de-guido'], ['integrar', 'x', '--noche']]) {
    const r = cli(p.P, args);
    assert.equal(r.codigo, 2, JSON.stringify(args));
    assert.match(r.err, /integrar <x> \[--ok-de-guido\]/);
  }
  moduloX(p);
  // La ficha vigente (la de origin/main) rota: no se sabe qué autoriza → 1.
  commit(p.P, { '.claude/kit.md': '---\nkit: 2.4.3\n---\n' }, 'ficha rota');
  g(p.P, 'push', '-q', 'origin', 'main');
  let r = cli(p.P, ['integrar', 'x']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /la ficha vigente está rota \(\.claude\/kit\.md:\d+\): corré doctor/);
  g(p.P, 'remote', 'set-url', 'origin', path.join(p.base, 'no-existe.git'));
  r = cli(p.P, ['integrar', 'x']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /no pude hacer fetch de origin .*sin origin al día no integro/);
  g(p.P, 'remote', 'remove', 'origin');
  r = cli(p.P, ['integrar', 'x']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /integrar necesita origin; sin remoto, mergealo desde el checkout principal/);
  sinTemporal(p);
});

test('integrar verde: frenos.log del director commiteado antes, merge --no-ff en origin/main, setup→test (r1-1), temporal borrado; dos veces → la segunda no rompe nada', () => {
  const p = proyectoI();
  const wx = moduloX(p);
  const renglon = frenosLog.anotar(wx, { id: 'deny:x', herramienta: 'Bash', detalle: 'algo', rol: 'director', rama: 'modulo/x' });
  const base = enOrigin(p);
  const r = cli(p.P, ['integrar', 'x']);
  assert.equal(r.codigo, 0, r.out);
  sinValores(r);
  sinTemporal(p);
  // D5-11: el commit de frenos.log, por ruta, en el worktree del director, y subido con la rama.
  assert.equal(g(wx, 'log', '-1', '--format=%s', 'modulo/x'), 'frenos.log del módulo x');
  assert.equal(g(wx, 'status', '--porcelain'), '', 'el director quedó limpio');
  assert.equal(enOrigin(p, 'modulo/x'), g(p.P, 'rev-parse', 'modulo/x'));
  // El merge: --no-ff, con los dos padres y el mensaje; frenos.log del director presente en main.
  const merge = enOrigin(p);
  assert.equal(g(p.remoto, 'rev-list', '--parents', '-n', '1', merge), `${merge} ${base} ${g(p.P, 'rev-parse', 'modulo/x')}`);
  assert.equal(g(p.remoto, 'log', '-1', '--format=%B', merge), 'integrar: módulo x');
  assert.ok(g(p.remoto, 'show', `${merge}:.claude/frenos.log`).includes(renglon));
  assert.equal(g(p.remoto, 'show', `${merge}:m.txt`), 'del módulo');
  assert.match(r.out, new RegExp(`^worktree integrar: módulo x en origin/main — merge ${merge}$`, 'm'));
  assert.match(r.out, /comando-setup anduvo: node setup\.cjs/);
  assert.match(r.out, /comando-test en verde: node test\.cjs/);
  assert.ok(r.out.endsWith('los docs del proyecto, en el próximo /cierre de main\n'), r.out);
  assert.ok(existeRama(p.P, 'modulo/x') && fs.existsSync(wx), 'integrar no cierra el módulo: eso es cerrar');
  // La segunda: nada que integrar, nada cambia.
  const r2 = cli(p.P, ['integrar', 'x']);
  assert.equal(r2.codigo, 0, r2.out);
  assert.match(r2.out, /modulo\/x ya está en origin\/main — nada que integrar/);
  assert.equal(enOrigin(p), merge);
  sinTemporal(p);
  // Y después cerrar anda (estaba mergeada en origin/main).
  assert.equal(cli(p.P, ['cerrar', 'x']).codigo, 0);
});

test('integrar con un encargo abierto (local o solo en origin) → 1 y nada sube; mergeado en modulo/x → sigue', () => {
  const p = proyectoI();
  const wx = moduloX(p);
  assert.equal(cli(p.P, ['crear', 'x--01']).codigo, 0);
  commit(p.wt('modulo--x--01'), { 'e.txt': 'encargo\n' });
  const base = enOrigin(p);
  let r = cli(p.P, ['integrar', 'x']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /hay un encargo abierto \(modulo\/x--01\) que no está en modulo\/x: cerralo o cancelalo/);
  assert.equal(enOrigin(p), base);
  sinTemporal(p);
  // Solo en origin (lo empujó otra PC): igual.
  g(p.P, 'push', '-q', 'origin', 'modulo/x--01');
  g(p.P, 'worktree', 'remove', p.wt('modulo--x--01'));
  g(p.P, 'branch', '-D', 'modulo/x--01');
  r = cli(p.P, ['integrar', 'x']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /encargo abierto \(modulo\/x--01\)/);
  assert.equal(enOrigin(p), base);
  g(wx, 'merge', '-q', '--no-ff', '-m', 'encargo 01', 'origin/modulo/x--01');
  r = cli(p.P, ['integrar', 'x']);
  assert.equal(r.codigo, 0, r.out);
  assert.equal(g(p.remoto, 'show', 'main:e.txt'), 'encargo');
});

test('integrar con conflicto → 1, merge --abort, temporal borrado y nada sube', () => {
  const p = proyectoI();
  moduloX(p, { 'a.txt': 'del módulo\n' });
  commit(p.P, { 'a.txt': 'de main\n' }, 'main avanza');
  g(p.P, 'push', '-q', 'origin', 'main');
  const base = enOrigin(p);
  const r = cli(p.P, ['integrar', 'x']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /conflicto en a\.txt: es un encargo a un obrero/);
  assert.equal(enOrigin(p), base);
  sinTemporal(p);
  assert.equal(g(p.P, 'status', '--porcelain'), '', 'el principal ni se enteró');
});

test('integrar con el gate en rojo → 1 y nada sube: un commit que toca una barrera sin aprobado', () => {
  const p = proyectoI();
  moduloX(p, { '.claude/kit.md': fichaI(p.nombre, { quitados: ['{id: "hook:git-seguro/stash", por: "lo usa el release", hasta: siempre}'] }) });
  const base = enOrigin(p);
  const r = cli(p.P, ['integrar', 'x']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /^candado:barreras · .*toca/m);
  assert.match(r.out, /no corrí comando-test: el gate ya está rojo/);
  assert.match(r.out, /el gate está en rojo: nada subió/);
  assert.equal(enOrigin(p), base);
  sinTemporal(p);
});

test('integrar con el gate en rojo → 1 y nada sube: comando-test rojo, sin comando-test, colgado (el vigía mata el árbol)', () => {
  let r;
  let base;
  const casos = [
    [{ test: 'node rojo.cjs', archivos: { 'rojo.cjs': 'process.exit(4)\n' } }, {}, /comando-test en rojo \(salida 4\): node rojo\.cjs/],
    [{ test: null }, {}, /NO VERIFICADO: la ficha no tiene vars\.comando-test/],
    [{ test: 'node colgado.cjs', archivos: { 'colgado.cjs': 'setTimeout(() => {}, 20000);\n' } }, { plazoTest: 1500 }, /NO VERIFICADO: comando-test no terminó en \d+ min/],
  ];
  for (const [o, extra, esperado] of casos) {
    const q = proyectoI(o);
    moduloX(q);
    base = enOrigin(q);
    r = cli(q.P, ['integrar', 'x'], extra);
    assert.equal(r.codigo, 1, r.out);
    assert.match(r.out, esperado);
    assert.equal(enOrigin(q), base);
    sinTemporal(q);
  }
});

test('integrar con la ficha que endurece merge-a-main → 1 sin --ok-de-guido, 0 con él (y queda en el commit de merge); libre → sigue', () => {
  const p = proyectoI({ merge: 'con-ok-de-guido' });
  const wx = moduloX(p);
  frenosLog.anotar(wx, { id: 'deny:x', herramienta: 'Bash', detalle: 'algo', rol: 'director', rama: 'modulo/x' });
  const base = enOrigin(p);
  let r = cli(p.P, ['integrar', 'x']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /la ficha pide el OK de Guido para mergear a main \(merge-a-main: con-ok-de-guido\): preguntale \(clase 3\) y corré con --ok-de-guido/);
  assert.equal(enOrigin(p), base);
  assert.equal(g(p.P, 'log', '-1', '--format=%s', 'modulo/x'), 'trabajo del módulo', 'ni el commit de frenos.log: los chequeos van antes');
  sinTemporal(p);
  r = cli(p.P, ['integrar', 'x', '--ok-de-guido']);
  assert.equal(r.codigo, 0, r.out);
  assert.equal(g(p.remoto, 'log', '-1', '--format=%B', 'main'), 'integrar: módulo x\n\ncon --ok-de-guido (la ficha pide merge-a-main: con-ok-de-guido)');
  const q = proyectoI({ merge: 'libre' });
  moduloX(q);
  r = cli(q.P, ['integrar', 'x']);
  assert.equal(r.codigo, 0, r.out);
  assert.equal(g(q.remoto, 'log', '-1', '--format=%B', 'main'), 'integrar: módulo x');
});

test('integrar: origin que avanzó entre el fetch y el push → 1 "corré integrar de nuevo"; de nuevo → 0', () => {
  const p = proyectoI();
  moduloX(p);
  const otra = path.join(p.base, 'otra');
  g(p.base, 'clone', '-q', p.remoto, otra);
  const nuevo = commit(otra, { 'otra.txt': 'de otra PC\n' }, 'otra PC');
  process.env.KIT_PRUEBA_AVANZA = otra;
  let r;
  try {
    r = cli(p.P, ['integrar', 'x']);
  } finally {
    delete process.env.KIT_PRUEBA_AVANZA;
  }
  assert.equal(r.codigo, 1, r.out);
  assert.match(r.out, /origin avanzó: corré integrar de nuevo/);
  assert.equal(enOrigin(p), nuevo, 'quedó lo de la otra PC, sin pisarlo');
  sinTemporal(p);
  r = cli(p.P, ['integrar', 'x']);
  assert.equal(r.codigo, 0, r.out);
  assert.equal(g(p.remoto, 'rev-parse', 'main^1'), nuevo);
});

test('integrar: comando-setup que falla → 1 NO VERIFICADO, temporal borrado y nada sube', () => {
  const p = proyectoI({ setup: 'node falla.cjs', archivos: { 'falla.cjs': 'process.exit(3)\n' } });
  moduloX(p, undefined, 1); // crear ya avisa que el setup falla, y crea igual
  const base = enOrigin(p);
  const r = cli(p.P, ['integrar', 'x']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /NO VERIFICADO — comando-setup falló \(salida 3\) en el temporal: nada subió/);
  assert.doesNotMatch(r.out, /comando-test/);
  assert.equal(enOrigin(p), base);
  sinTemporal(p);
});

test('integrar se niega antes de tocar nada: lo ignorado, director sucio, frenos.log cambiado en el medio o borrado, temporal que ya existe, rama divergida', () => {
  const p = proyectoI();
  const wx = moduloX(p);
  const base = enOrigin(p);
  const nada = () => {
    assert.equal(enOrigin(p), base);
    assert.ok(!gOk(p.P, 'rev-parse', '--verify', '-q', 'refs/remotes/origin/modulo/x'), 'modulo/x no subió');
  };
  fs.writeFileSync(path.join(p.P, '.gitignore'), SNIPPET.replace('/.kit-rol\n', ''));
  let r = cli(p.P, ['integrar', 'x']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /\.kit-rol no está ignorado/);
  g(p.P, 'checkout', '--', '.gitignore');
  fs.writeFileSync(path.join(wx, 'a.txt'), 'sin commitear\n');
  r = cli(p.P, ['integrar', 'x']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /el worktree del director tiene cambios sin commitear: .*a\.txt/);
  nada();
  g(wx, 'checkout', '--', 'a.txt');
  fs.writeFileSync(path.join(wx, '.claude', 'frenos.log'), `editado a mano\n${RENGLON}`);
  r = cli(p.P, ['integrar', 'x']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /frenos\.log del director cambió en el medio/);
  assert.match(leer(wx, '.claude/frenos.log'), /editado a mano/, 'no lo tocó');
  nada();
  fs.rmSync(path.join(wx, '.claude', 'frenos.log'));
  r = cli(p.P, ['integrar', 'x']);
  assert.equal(r.codigo, 1, 'frenos.log borrado');
  assert.match(r.out, /cambió en el medio/);
  nada();
  g(wx, 'checkout', '--', '.claude/frenos.log');
  fs.mkdirSync(p.wt('integrar--x'), { recursive: true });
  r = cli(p.P, ['integrar', 'x']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /el temporal \.claude\/worktrees\/integrar--x ya existe .*git worktree remove "/);
  assert.ok(fs.existsSync(p.wt('integrar--x')), 'no borra lo que no creó');
  nada();
  fs.rmSync(p.wt('integrar--x'), { recursive: true });
  // Divergida: un commit acá y otro en origin/modulo/x.
  const otra = path.join(p.base, 'otra');
  g(p.base, 'clone', '-q', p.remoto, otra);
  g(otra, 'checkout', '-q', '-b', 'modulo/x', 'origin/main');
  commit(otra, { 'alla.txt': '1\n' });
  g(otra, 'push', '-q', 'origin', 'modulo/x');
  r = cli(p.P, ['integrar', 'x']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /modulo\/x divergió de origin\/modulo\/x/);
  assert.equal(enOrigin(p), base);
  sinTemporal(p);
});
