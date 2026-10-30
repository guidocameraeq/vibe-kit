'use strict';
// Pruebas de los githooks del molde (P4.6; criterio 8 del delta del paquete 3): el `sh` de tres renglones, el runner kit-githook.cjs
// corrido por git de verdad (git commit, git merge, git push contra un remoto bare local) y, lo que tarda, en proceso.
// Repos temporales armados acá con el molde instanciado (hooks, scripts, githooks, settings), sin la configuración de git de la PC.
// gitleaks: uno FALSO en un PATH armado a mano, salvo la prueba con el de verdad (si está). En Windows es node renombrado a
// gitleaks.exe: su primer argumento ("git") lo toma como el script, y cada repo de prueba trae un git.js (excluido) que carga el falso.
// (Antes iba con NODE_OPTIONS --require, y desde rf3-3 el sh y el runner sacan toda NODE_* del entorno.)
// Ninguna clave literal: la de prueba se arma en tiempo de corrida. Corren con: node --test "kit/**/*.test.cjs".
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-githook-test-'));
const GLOBAL = path.join(TMP, 'gitconfig-vacio');
fs.writeFileSync(GLOBAL, '');
Object.assign(process.env, {
  GIT_CONFIG_GLOBAL: GLOBAL,
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_AUTHOR_NAME: 'Prueba',
  GIT_AUTHOR_EMAIL: 'prueba@ejemplo.invalid',
  GIT_COMMITTER_NAME: 'Prueba',
  GIT_COMMITTER_EMAIL: 'prueba@ejemplo.invalid',
});
test.after(() => fs.rmSync(TMP, { recursive: true, force: true }));

const MOLDE = path.join(__dirname, '..');
const kg = require('./kit-githook.cjs');
const ES_WIN = process.platform === 'win32';

// ---------------------------------------------------------------- el PATH y el gitleaks falso

function buscarEnPath(nombre) {
  const clave = Object.keys(process.env).find((k) => k.toLowerCase() === 'path');
  for (const d of String(process.env[clave] || '').split(path.delimiter)) {
    for (const n of ES_WIN ? [`${nombre}.exe`, nombre] : [nombre]) {
      const p = path.join(d, n);
      try {
        if (fs.statSync(p).isFile()) return p;
      } catch (e) {
        /* sigue */
      }
    }
  }
  return null;
}
const GIT_EXE = buscarEnPath('git');
const GITLEAKS_REAL = buscarEnPath('gitleaks');
// El PATH base: el de la PC sin ninguna carpeta que traiga gitleaks (armado de cero con node y git solos, en Windows spawn no
// encuentra git).
const PATH_BASE = String(process.env[Object.keys(process.env).find((k) => k.toLowerCase() === 'path')] || '')
  .split(path.delimiter)
  .filter((d) => d && !['gitleaks', 'gitleaks.exe'].some((x) => fs.existsSync(path.join(d, x))))
  .join(path.delimiter);

// gitleaks falso: con FAKE_GITLEAKS = verde · rojo · colgado · falla · basura. Anota cada llamada (sus argumentos) en FAKE_GITLEAKS_LOG.
const FAKE_DIR = path.join(TMP, 'fakebin');
const FAKE_JS = path.join(TMP, 'fake-gitleaks.js');
fs.mkdirSync(FAKE_DIR);
fs.writeFileSync(
  FAKE_JS,
  `'use strict';
const path = require('path');
const fs = require('fs');
function fake(args) {
  if (args[0] && path.isAbsolute(args[0])) args[0] = path.basename(args[0]).replace(/\\.js$/, ''); // node renombrado: el "script" es <repo>/git.js
  const modo = process.env.FAKE_GITLEAKS || 'verde';
  if (process.env.FAKE_GITLEAKS_LOG) fs.appendFileSync(process.env.FAKE_GITLEAKS_LOG, JSON.stringify(args) + '\\n');
  // las variables que le llegan y no debería ver (rf3-2, rf3-3)
  if (process.env.FAKE_GITLEAKS_ENV) fs.appendFileSync(process.env.FAKE_GITLEAKS_ENV, JSON.stringify(Object.keys(process.env).filter((k) => /^(node|gitleaks)_/i.test(k))) + '\\n');
  const i = args.indexOf('--report-path');
  const reporte = i >= 0 ? args[i + 1] : null;
  if (modo === 'colgado') Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 600000);
  if (modo === 'falla') process.exit(3);
  if (modo === 'basura') { if (reporte) fs.writeFileSync(reporte, 'no es json'); process.exit(1); }
  if (modo === 'rojo') {
    if (reporte) fs.writeFileSync(reporte, JSON.stringify([{ RuleID: 'clave-de-prueba', File: process.env.FAKE_ARCHIVO || 'x.txt', StartLine: 2, Secret: 'REDACTED', Match: 'REDACTED', Commit: '' }]));
    process.stdout.write('VALOR-QUE-NO-SE-MUESTRA\\n');
    process.exit(1);
  }
  if (reporte) fs.writeFileSync(reporte, '[]');
  process.exit(0);
}
if (/^gitleaks/i.test(path.basename(process.execPath))) fake(process.argv.slice(1));
else if (require.main === module) fake(process.argv.slice(2));
`
);
// En Windows, lo que el gitleaks.exe falso corre como script desde la raíz del repo (git → git.js).
const plantarFalso = (d) => {
  if (!ES_WIN) return;
  fs.writeFileSync(path.join(d, 'git.js'), `require(${JSON.stringify(FAKE_JS)});\n`);
  fs.appendFileSync(path.join(d, '.git', 'info', 'exclude'), '/git.js\n');
};
if (ES_WIN) {
  fs.copyFileSync(process.execPath, path.join(FAKE_DIR, 'gitleaks.exe'));
} else {
  fs.writeFileSync(path.join(FAKE_DIR, 'gitleaks'), `#!/bin/sh\nexec "${process.execPath}" "${FAKE_JS}" "$@"\n`);
  fs.chmodSync(path.join(FAKE_DIR, 'gitleaks'), 0o755);
}
const FAKE_EXE = path.join(FAKE_DIR, ES_WIN ? 'gitleaks.exe' : 'gitleaks');

// El entorno de un git que corre los hooks: modo del gitleaks falso (null = sin gitleaks; 'real' = el de la PC).
function entorno(gitleaks = 'verde', extra = {}) {
  const env = { ...process.env };
  for (const k of Object.keys(env)) if (k.toLowerCase() === 'path' || k === 'NODE_OPTIONS' || k.startsWith('FAKE_GITLEAKS')) delete env[k];
  let p = PATH_BASE;
  if (gitleaks === 'real') p = `${path.dirname(GITLEAKS_REAL)}${path.delimiter}${p}`;
  else if (gitleaks) {
    p = `${FAKE_DIR}${path.delimiter}${p}`;
    env.FAKE_GITLEAKS = gitleaks;
  }
  env.PATH = p;
  return { ...env, ...extra };
}

// ---------------------------------------------------------------- repos

let n = 0;
const carpeta = (nombre = 'r') => {
  const d = path.join(TMP, `${nombre}${n++}`);
  fs.mkdirSync(d, { recursive: true });
  return d;
};
function g(cwd, args, o = {}) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', env: o.env || entorno('verde'), input: o.input, timeout: 600000 });
  if (!o.puede && r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}${r.stdout}`);
  return { codigo: r.status, out: (r.stdout || '').trim(), err: r.stderr || '' };
}
const gt = (cwd, ...args) => g(cwd, args).out;
function escribir(d, rel, texto) {
  const p = path.join(d, ...rel.split('/'));
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, texto);
}
// commit sin hooks (armado de las pruebas): --no-verify.
function commitArmado(d, archivos, msg = 'armado') {
  for (const [rel, texto] of Object.entries(archivos)) {
    if (texto === null) g(d, ['rm', '-q', '--', rel]);
    else {
      escribir(d, rel, texto);
      g(d, ['add', '-f', '--', rel]);
    }
  }
  g(d, ['commit', '-q', '--no-verify', '-m', msg]);
  return gt(d, 'rev-parse', 'HEAD');
}
// Un commit de verdad (con los hooks): → { codigo, err }.
function commitHook(d, archivos, o = {}) {
  for (const [rel, texto] of Object.entries(archivos)) {
    escribir(d, rel, texto);
    g(d, ['add', '-f', '--', rel]);
  }
  return g(d, ['commit', '-q', '-m', o.msg || 'c', ...(o.args || [])], { env: o.env || entorno(o.gitleaks === undefined ? 'verde' : o.gitleaks), puede: true });
}

const FICHA = (o = {}) =>
  [
    '---',
    'kit: 2.4.3',
    'nivel: estandar',
    'vars:',
    '  proyecto: px',
    'piezas:',
    '  candado: molde',
    'frenos:',
    '  opcionales: []',
    ...(o.quitados ? ['  quitados:', ...o.quitados.map((q) => `    - ${q}`)] : ['  quitados: []']),
    'sensible:',
    '  plata: no',
    'autorizado:',
    '  merge-a-main: con-gate-verde',
    '---',
    '',
  ].join('\n');
const QUITA_STASH = FICHA({ quitados: ['{id: "hook:git-seguro/stash", por: "lo usa el release", hasta: siempre}'] });

// Lo instanciado del molde: [rel en el repo, contenido].
function archivosDelMolde() {
  const out = {};
  const recorrer = (de, a) => {
    for (const e of fs.readdirSync(de, { withFileTypes: true })) {
      if (e.isDirectory()) recorrer(path.join(de, e.name), `${a}/${e.name}`);
      else if (!e.name.endsWith('.test.cjs')) out[`${a}/${e.name}`] = fs.readFileSync(path.join(de, e.name), 'utf8');
    }
  };
  recorrer(path.join(MOLDE, 'hooks'), '.claude/hooks');
  recorrer(path.join(MOLDE, 'githooks'), '.githooks');
  out['.claude/scripts/estructura.cjs'] = fs.readFileSync(path.join(MOLDE, 'scripts', 'estructura.cjs'), 'utf8');
  out['.claude/scripts/cambios.cjs'] = fs.readFileSync(path.join(MOLDE, 'scripts', 'cambios.cjs'), 'utf8');
  out['.claude/settings.json'] = fs.readFileSync(path.join(MOLDE, 'settings.json'), 'utf8');
  return out;
}
const MOLDE_ARCHIVOS = archivosDelMolde();

// La plantilla: un repo con el molde y la ficha (o sin ficha), pusheado a un bare. Se arma una vez por tipo; cada prueba clona.
const plantillas = new Map();
function plantilla(conFicha) {
  if (plantillas.has(conFicha)) return plantillas.get(conFicha);
  const d = carpeta('plantilla');
  g(d, ['init', '-q', '-b', 'main']);
  const archivos = { '.gitignore': '/.kit-rol\n/.claude/frenos.log\n', 'a.txt': 'a\n', ...MOLDE_ARCHIVOS };
  if (conFicha) archivos['.claude/kit.md'] = FICHA();
  commitArmado(d, archivos, 'adopción del kit');
  if (!ES_WIN) for (const h of ['pre-commit', 'pre-merge-commit', 'pre-push']) g(d, ['update-index', '--chmod=+x', `.githooks/${h}`]);
  if (!ES_WIN) g(d, ['commit', '-q', '--no-verify', '-m', '+x']);
  const bare = carpeta('origen');
  g(bare, ['init', '-q', '--bare', '-b', 'main']);
  g(d, ['push', '-q', '--no-verify', bare, 'main']);
  plantillas.set(conFicha, bare);
  return bare;
}
// repo({ficha, remoto}) → la carpeta: un clon con core.hooksPath=.githooks (o, sin remoto, una copia sin origin).
function repo(o = {}) {
  const bare = plantilla(o.ficha !== false);
  const d = carpeta();
  const propio = carpeta('origen-propio');
  g(TMP, ['clone', '-q', '--bare', bare, propio]); // cada prueba con su remoto: lo que una pushea no lo ve otra
  g(TMP, ['clone', '-q', propio, d]);
  if (o.remoto === false) g(d, ['remote', 'remove', 'origin']);
  g(d, ['config', 'core.hooksPath', '.githooks']);
  if (!ES_WIN) for (const h of ['pre-commit', 'pre-merge-commit', 'pre-push']) fs.chmodSync(path.join(d, '.githooks', h), 0o755);
  plantarFalso(d);
  return d;
}
const log = (d) => {
  try {
    return fs.readFileSync(path.join(d, '.claude', 'frenos.log'), 'utf8');
  } catch (e) {
    return '';
  }
};
const head = (d) => gt(d, 'rev-parse', 'HEAD');
// El log sin versionar (rf3-6): lo que un pase agrega va a <git-common-dir>/kit-frenos.log.
const logLocal = (d) => {
  try {
    return fs.readFileSync(path.join(gt(d, 'rev-parse', '--path-format=absolute', '--git-common-dir'), 'kit-frenos.log'), 'utf8');
  } catch (e) {
    return '';
  }
};

// Un barreras.cjs "editado para dar verde": revisarBarreras no encuentra nada nunca.
const BARRERAS_TRAMPA = MOLDE_ARCHIVOS['.claude/hooks/lib/barreras.cjs'].replace('function revisarBarreras(raiz, opciones = {}) {', 'function revisarBarreras(raiz, opciones = {}) {\n  return [];');
assert.notEqual(BARRERAS_TRAMPA, MOLDE_ARCHIVOS['.claude/hooks/lib/barreras.cjs']);

// La clave de prueba, armada en tiempo de corrida (nunca literal en kit/): el formato de un token de GitHub con cuerpo falso.
const claveDePrueba = () => ['gh', 'p_'].join('') + Array.from({ length: 36 }, (_, i) => 'AbCdEfGhIjKlMnOpQrStUvWxYz0123456789'[(i * 7 + 3) % 36]).join('');

// ---------------------------------------------------------------- el sh de tres renglones

test('los tres sh: tres renglones, llaman al runner con su nombre y "$@"; sin node salen 1 con el motivo', () => {
  const sh = buscarEnPath('sh') || path.join(path.dirname(GIT_EXE), '..', 'usr', 'bin', 'sh.exe');
  for (const h of kg.CUALES) {
    const t = fs.readFileSync(path.join(__dirname, h), 'utf8');
    const l = t.replace(/\n$/, '').split('\n');
    assert.equal(l.length, 3, h);
    assert.equal(l[0], '#!/bin/sh');
    assert.equal(l[2], `for v in $(env | sed -n 's/^\\([Nn][Oo][Dd][Ee]_[A-Za-z0-9_]*\\)=.*/\\1/p'); do unset "$v"; done; exec node .githooks/kit-githook.cjs ${h} "$@"`);
    assert.ok(!t.includes('\r'), `${h}: sin CRLF`);
    // sin node en el PATH (solo la carpeta del sh, que no lo trae)
    const shExe = fs.existsSync(sh) ? sh : 'sh';
    const soloSh = path.dirname(shExe);
    if (fs.existsSync(path.join(soloSh, ES_WIN ? 'node.exe' : 'node'))) continue; // no se puede armar un PATH sin node
    const r = spawnSync(shExe, [path.join(__dirname, h)], { cwd: TMP, encoding: 'utf8', env: { PATH: soloSh } });
    assert.equal(r.status, 1, h);
    assert.match(r.stderr, new RegExp(`kit ${h}: no hay node en esta PC — no pasa`));
  }
});

// ---------------------------------------------------------------- pre-commit

test('pre-commit verde: un archivo común pasa, gitleaks miró lo staged (--staged, --redact, --no-banner) y no deja renglón', () => {
  const d = repo();
  const llamadas = path.join(TMP, `llamadas-${n++}.log`);
  const r = commitHook(d, { 'b.txt': 'b\n' }, { env: entorno('verde', { FAKE_GITLEAKS_LOG: llamadas }) });
  assert.equal(r.codigo, 0, r.err);
  assert.match(r.err, /kit pre-commit: en verde/);
  assert.match(r.err, /candado de origin\/main: candado: en verde \(barreras\)/);
  assert.match(r.err, /candado del disco: candado: en verde \(barreras\)/);
  const args = JSON.parse(fs.readFileSync(llamadas, 'utf8').trim());
  assert.deepEqual(args.slice(0, 2), ['git', '--staged']);
  assert.ok(args.includes('--redact') && args.includes('--no-banner'));
  assert.equal(log(d), '');
});

test('criterio 8: una clave de prueba → 1, con regla y archivo:línea, y ni la salida ni el frenos.log traen el valor (gitleaks falso)', () => {
  const d = repo();
  const r = commitHook(d, { 'x.txt': 'hola\n' }, { gitleaks: 'rojo' });
  assert.equal(r.codigo, 1);
  assert.match(r.err, /gitleaks: clave-de-prueba en x\.txt:2/);
  assert.match(r.err, /kit pre-commit: ROJO/);
  assert.ok(!r.err.includes('VALOR-QUE-NO-SE-MUESTRA'), 'la salida de gitleaks no se muestra');
  assert.match(log(d), / · humano · main · githook:gitleaks · pre-commit · x\.txt\n$/);
  assert.equal(gt(d, 'rev-list', '--count', 'HEAD'), gt(d, 'rev-list', '--count', 'origin/main'), 'no se commiteó');
});

test('criterio 8: una clave de prueba con el gitleaks de verdad → 1 tapada (archivo:línea, nunca el valor)', { skip: GITLEAKS_REAL ? false : 'gitleaks no está en esta PC' }, () => {
  const d = repo();
  const clave = claveDePrueba();
  const r = commitHook(d, { 'k.txt': `token = "${clave}"\n` }, { gitleaks: 'real' });
  assert.equal(r.codigo, 1, r.err);
  assert.match(r.err, /gitleaks: github-pat en k\.txt:1/);
  assert.ok(!r.err.includes(clave) && !r.err.includes(clave.slice(4)), 'el valor no sale');
  assert.ok(!log(d).includes(clave.slice(4)));
});

test('criterio 8: sin gitleaks, humano, director y obrero pasan en rojo con aviso y renglón (sin versionar, rf3-6); nocturno, actualizador y desconocido → 1', () => {
  const d = repo();
  let i = 0;
  for (const rol of [null, 'director', 'obrero', 'nocturno', 'actualizador', 'cualquiera']) {
    if (rol) escribir(d, '.kit-rol', `${rol}\n`);
    const quien = rol === null ? 'humano' : rol === 'cualquiera' ? 'desconocido' : rol;
    const antes = head(d);
    const logAntes = log(d);
    const r = commitHook(d, { [`s${i++}.txt`]: 's\n' }, { gitleaks: null });
    assert.match(r.err, /⚠️ sin escáner en esta PC: corré "preparame esta PC" \(no está\)/, quien);
    const renglon = new RegExp(` · ${quien} · main · githook:sin-escaner · pre-commit · no está$`);
    if (kg.ROLES_PASAN_SIN_ESCANER.includes(quien)) {
      assert.equal(r.codigo, 0, `${quien}: ${r.err}`);
      assert.match(r.err, new RegExp(`pasa por ser ${quien}, en rojo`));
      assert.notEqual(head(d), antes);
      assert.match(logLocal(d).trim().split('\n').pop(), renglon);
      assert.equal(log(d), logAntes, 'un pase no toca el frenos.log versionado');
    } else {
      assert.match(log(d).trim().split('\n').pop(), renglon);
      assert.equal(r.codigo, 1, quien);
      assert.match(r.err, new RegExp(`con rol ${quien} no se commitea sin escáner`));
      assert.equal(head(d), antes);
      g(d, ['reset', '-q']);
    }
  }
});

test('criterio 8: gitleaks colgado — plazo, un reintento y "sin escáner (colgado)": humano pasa en rojo, nocturno/actualizador/desconocido → 1', () => {
  assert.equal(kg.PLAZO_GITLEAKS, 60000);
  assert.equal(kg.REINTENTOS_GITLEAKS, 1);
  const d = repo();
  escribir(d, 'c.txt', 'c\n');
  g(d, ['add', 'c.txt']);
  for (const rol of [null, 'nocturno', 'actualizador', '???']) {
    if (rol) escribir(d, '.kit-rol', rol);
    const llamadas = path.join(TMP, `colgado-${n++}.log`);
    const env = entorno('colgado', { FAKE_GITLEAKS_LOG: llamadas });
    const r = kg.principal(['pre-commit'], { cwd: d, env, plazoGitleaks: 1500 });
    assert.equal(fs.readFileSync(llamadas, 'utf8').trim().split('\n').length, 2, 'dos intentos');
    assert.ok(r.lineas.some((l) => l.includes('sin escáner en esta PC') && l.includes('(colgado)')));
    assert.equal(r.codigo, rol === null ? 0 : 1, String(rol));
  }
  assert.match(log(d), /githook:sin-escaner · pre-commit · colgado/);
});

test('criterio 8: freno quitado sin aprobado → 1 (candado:barreras, las dos versiones); sin git add no traba (rf-10)', () => {
  const d = repo();
  const r = commitHook(d, { '.claude/kit.md': QUITA_STASH });
  assert.equal(r.codigo, 1);
  assert.match(r.err, /candado de origin\/main: candado:barreras · lo que lleva este commit \(el índice\) toca/);
  assert.match(r.err, /candado del disco: candado:barreras/);
  // lo mismo en el disco sin git add: un commit de otra cosa pasa
  g(d, ['reset', '-q']);
  const r2 = commitHook(d, { 'otro.txt': 'o\n' });
  assert.equal(r2.codigo, 0, r2.err);
  assert.equal(fs.readFileSync(path.join(d, '.claude', 'kit.md'), 'utf8'), QUITA_STASH, 'el disco sigue cambiado');
});

test('criterio 8: commit -a o commit <rutas> con una barrera → 1 (índice aparte: el candado no lo vería); con git add, se juzga normal', () => {
  const d = repo();
  escribir(d, '.claude/kit.md', QUITA_STASH);
  let r = g(d, ['commit', '-q', '-a', '-m', 'todo'], { env: entorno('verde'), puede: true });
  assert.equal(r.codigo, 1);
  assert.match(r.err, /lleva \.claude\/kit\.md desde un índice aparte \(commit -a o commit <rutas>\)/);
  r = g(d, ['commit', '-q', '-m', 'rutas', '--', '.claude/kit.md'], { env: entorno('verde'), puede: true });
  assert.equal(r.codigo, 1);
  assert.match(r.err, /índice aparte/);
  // commit -a sin barreras de por medio: pasa
  g(d, ['checkout', '-q', '--', '.claude/kit.md']);
  escribir(d, 'a.txt', 'a2\n');
  r = g(d, ['commit', '-q', '-a', '-m', 'común'], { env: entorno('verde'), puede: true });
  assert.equal(r.codigo, 0, r.err);
});

test('criterio 8: el candado editado en el índice para dar verde → 1 (lo caza la versión de la ref)', () => {
  const d = repo();
  const r = commitHook(d, { '.claude/hooks/lib/barreras.cjs': BARRERAS_TRAMPA, '.claude/kit.md': QUITA_STASH });
  assert.equal(r.codigo, 1);
  assert.match(r.err, /candado de origin\/main: candado:barreras/);
  assert.match(r.err, /candado del disco: candado: en verde \(barreras\)/, 'el del disco, editado, da verde');
});

test('criterio 8: el candado editado en la ref para dar verde → 1 (lo caza la versión del disco)', () => {
  const d = repo();
  const trampa = commitArmado(d, { '.claude/hooks/lib/barreras.cjs': BARRERAS_TRAMPA }, 'ref falsificada');
  g(d, ['reset', '-q', '--hard', 'HEAD~1']);
  g(d, ['update-ref', 'refs/remotes/origin/main', trampa]);
  // el disco: el candado real, ningún cambio al candado en el índice; HEAD queda atrás de la ref
  const r = commitHook(d, { '.claude/kit.md': QUITA_STASH });
  assert.equal(r.codigo, 1);
  assert.match(r.err, /candado de origin\/main: candado: en verde \(barreras\)/);
  assert.match(r.err, /candado del disco: candado:barreras/);
});

test('la ref con ficha y sin candado → rojo; la ref sin ficha → solo el del disco, y lo dice', () => {
  const d = repo();
  const sinCandado = commitArmado(d, { '.claude/scripts/estructura.cjs': null }, 'sin candado');
  g(d, ['reset', '-q', '--hard', 'HEAD~1']);
  g(d, ['update-ref', 'refs/remotes/origin/main', sinCandado]);
  let r = commitHook(d, { 'b.txt': 'b\n' });
  assert.equal(r.codigo, 1);
  assert.match(r.err, /candado de origin\/main: tiene ficha y no tiene \.claude\/scripts\/estructura\.cjs/);
  // sin ficha en la ref
  const e = repo();
  const sinFicha = commitArmado(e, { '.claude/kit.md': null }, 'sin ficha');
  g(e, ['reset', '-q', '--hard', 'HEAD~1']);
  g(e, ['update-ref', 'refs/remotes/origin/main', sinFicha]);
  r = commitHook(e, { 'b.txt': 'b\n' });
  assert.equal(r.codigo, 0, r.err);
  assert.match(r.err, /candado de origin\/main: no tiene ficha \(nunca tuvo kit\) — corrió solo el del disco/);
});

test('la ref con un candado del orden 2 (no conoce --indice): corre sin él y lo dice; si sale 2 por otra cosa → rojo', () => {
  const viejo = "const a = process.argv.slice(2);\nif (a.includes('--indice') || a.includes('--rango')) { process.stderr.write('Argumento desconocido: ' + a.find((x) => x.startsWith('--')) + '\\n'); process.exit(2); }\nconsole.log('candado: en verde (barreras)');\n";
  const roto = "process.stderr.write('otra cosa\\n'); process.exit(2);\n";
  for (const [script, esperado] of [
    [viejo, /candado de origin\/main \(no conoce --indice: es del orden 2; corrió sin él\): candado: en verde \(barreras\)/],
    [roto, /candado de origin\/main: salió con 2 — otra cosa/],
  ]) {
    const d = repo();
    const s = commitArmado(d, { '.claude/scripts/estructura.cjs': script }, 'candado viejo');
    g(d, ['reset', '-q', '--hard', 'HEAD~1']);
    g(d, ['update-ref', 'refs/remotes/origin/main', s]);
    const r = commitHook(d, { 'b.txt': 'b\n' });
    assert.match(r.err, esperado);
    assert.equal(r.codigo, script === viejo ? 0 : 1, r.err);
  }
});

test('sin remoto ni ficha: nada se traba (commit común y uno que toca hooks pasan; el candado dice que no hay kit)', () => {
  const d = repo({ ficha: false, remoto: false });
  let r = commitHook(d, { 'b.txt': 'b\n' });
  assert.equal(r.codigo, 0, r.err);
  assert.match(r.err, /candado de main: no tiene ficha/);
  assert.match(r.err, /candado del disco: sin ficha: candado apagado/);
  r = commitHook(d, { '.claude/hooks/x.cjs': 'x\n' });
  assert.equal(r.codigo, 0, r.err);
  // sin el candado en el disco y sin ficha en ningún lado: tampoco traba
  commitArmado(d, { '.claude/scripts/estructura.cjs': null });
  r = commitHook(d, { 'c.txt': 'c\n' });
  assert.equal(r.codigo, 0, r.err);
  assert.match(r.err, /candado del disco: no hay kit en este repo/);
});

test('con ficha y sin el candado en el disco → rojo', () => {
  const d = repo();
  fs.rmSync(path.join(d, '.claude', 'scripts', 'estructura.cjs'));
  const r = commitHook(d, { 'b.txt': 'b\n' });
  assert.equal(r.codigo, 1);
  assert.match(r.err, /candado del disco: falta \.claude\/scripts\/estructura\.cjs y hay ficha/);
});

test('la ficha vigente rota: el candado lo dice y corre con los frenos de fábrica (rf-9): el arreglo pasa, tocar hooks no', () => {
  const d = repo();
  const rota = commitArmado(d, { '.claude/kit.md': '---\nkit: 2.4.3\nnivel: estandar\ncolorcito:\n\ta: b\n---\n' }, 'ficha rota');
  g(d, ['push', '-q', '--no-verify', 'origin', 'main']);
  assert.equal(head(d), rota);
  let r = commitHook(d, { '.claude/hooks/x.cjs': 'x\n' });
  assert.equal(r.codigo, 1);
  assert.match(r.err, /ficha rota: \.claude\/kit\.md:\d+ — corré doctor/);
  g(d, ['reset', '-q', '--hard']);
  fs.rmSync(path.join(d, '.claude', 'hooks', 'x.cjs'), { force: true });
  const logAntes = log(d);
  r = commitHook(d, { '.claude/kit.md': FICHA() });
  assert.match(r.err, /ficha rota/);
  assert.equal(r.codigo, 0, r.err);
  // rf3-6: los renglones de los dos candados en un pase no quedan en el frenos.log versionado
  assert.equal(log(d), logAntes);
  assert.equal((logLocal(d).match(/candado:ficha/g) || []).length, 2, logLocal(d));
});

// ---------------------------------------------------------------- pre-merge-commit

// rf3-1: git no escribe MERGE_HEAD antes del pre-merge-commit, así que ahí el candado juzgaría el merge solo contra HEAD. No corre:
// gitleaks sí; el merge lo juzga el pre-push (--rango), contra cada padre.
test('criterio 8 + rf3-1: pre-merge-commit sin candado (lo dice) y con gitleaks; el merge que trae un freno quitado sin aprobado lo frena el pre-push', () => {
  const d = repo();
  g(d, ['checkout', '-q', '-b', 'tema']);
  commitArmado(d, { '.claude/kit.md': QUITA_STASH }, 'quita sin aprobado (sin hooks)');
  g(d, ['checkout', '-q', 'main']);
  commitArmado(d, { 'm.txt': 'm\n' }, 'algo en main');
  // gitleaks corre en el pre-merge-commit
  let r = g(d, ['merge', '-q', '--no-edit', 'tema'], { env: entorno('rojo'), puede: true });
  assert.notEqual(r.codigo, 0);
  assert.match(r.err, /gitleaks: clave-de-prueba en x\.txt:2/);
  assert.match(r.err, /kit pre-merge-commit: ROJO/);
  g(d, ['merge', '--abort']);
  r = g(d, ['merge', '-q', '--no-edit', 'tema'], { env: entorno('verde'), puede: true });
  assert.equal(r.codigo, 0, r.err);
  assert.match(r.err, /pre-merge-commit: el candado no corre acá \(git todavía no dice cuál es el otro padre del merge\) — el merge lo juzga el pre-push, contra cada padre/);
  assert.ok(!/candado(:| de| del)/.test(r.err), r.err);
  assert.match(r.err, /kit pre-merge-commit: en verde/);
  r = g(d, ['push', '-q', 'origin', 'main'], { env: entorno('verde'), puede: true });
  assert.notEqual(r.codigo, 0);
  assert.match(r.err, /candado de origin\/main: candado:barreras · el commit [0-9a-f]{12} toca frenos/);
  assert.match(r.err, /kit pre-push: ROJO/);
});

test('rf3-1: el pre-push juzga el merge mismo contra cada padre — un merge "malvado" (el freno lo quita el merge) → rojo con el sha del merge', () => {
  const d = repo();
  g(d, ['checkout', '-q', '-b', 'limpio']);
  commitArmado(d, { 'l.txt': 'l\n' });
  g(d, ['checkout', '-q', 'main']);
  commitArmado(d, { 'm.txt': 'm\n' });
  g(d, ['merge', '-q', '--no-commit', '--no-ff', 'limpio'], { env: entorno('verde') });
  escribir(d, '.claude/kit.md', QUITA_STASH);
  g(d, ['add', '.claude/kit.md']);
  g(d, ['commit', '-q', '--no-verify', '--no-edit']);
  assert.equal(gt(d, 'rev-list', '--parents', '-n', '1', 'HEAD').split(' ').length, 3, 'es un merge');
  const r = g(d, ['push', '-q', 'origin', 'main'], { env: entorno('verde'), puede: true });
  assert.notEqual(r.codigo, 0);
  assert.match(r.err, new RegExp(`candado de origin/main: candado:barreras · el commit ${head(d).slice(0, 12)} toca frenos`));
});

const CUERPO_CAMBIO = '## Caso de origen\nel release usa stash (2026-10)\n\n## Regla\nquitar el freno del stash\n\n## Dónde vive\n.claude/kit.md\n\n## Medición\n| antes | después |\n';
function cambios(d, args) {
  const r = spawnSync(process.execPath, [path.join('.claude', 'scripts', 'cambios.cjs'), ...args], { cwd: d, input: CUERPO_CAMBIO, encoding: 'utf8', env: entorno('verde'), timeout: 600000 });
  assert.equal(r.status, 0, `${r.stdout}${r.stderr}`);
  return r.stdout;
}

test('rf3-1: un git pull con merge que trae un cambio de barrera APROBADO en la otra PC → el merge pasa y el push da verde (antes: ROJO)', () => {
  const d = repo();
  // el sello de aprobar va en frenos.log: versionado, como en el molde
  commitArmado(d, { '.gitignore': '/.kit-rol\n', '.claude/frenos.log': '' }, 'frenos.log versionado');
  g(d, ['push', '-q', '--no-verify', 'origin', 'main']);
  const otra = carpeta('otra-pc');
  g(TMP, ['clone', '-q', gt(d, 'remote', 'get-url', 'origin'), otra]);
  g(otra, ['config', 'core.hooksPath', '.githooks']);
  if (!ES_WIN) for (const h of kg.CUALES) fs.chmodSync(path.join(otra, '.githooks', h), 0o755);
  plantarFalso(otra);
  // en la otra PC: proponer, aprobar (cambios.cjs, con sus commits) y quitar el freno; sube con los hooks
  const id = /propuesto (\S+)/.exec(cambios(otra, ['nuevo', '--slug', 'stash', '--clase', '3-barrera', '--toca', 'frenos', '--id', 'hook:git-seguro/stash', '--origen', 'lo pidió el dueño']))[1];
  cambios(otra, ['aprobar', id]);
  let r = commitHook(otra, { '.claude/kit.md': QUITA_STASH });
  assert.equal(r.codigo, 0, r.err);
  r = g(otra, ['push', '-q', 'origin', 'main'], { env: entorno('verde'), puede: true });
  assert.equal(r.codigo, 0, r.err);
  // acá: un commit propio y el pull que mergea
  commitArmado(d, { 'mio.txt': 'm\n' });
  r = g(d, ['pull', '-q', '--no-rebase', '--no-edit', 'origin', 'main'], { env: entorno('verde'), puede: true });
  assert.equal(r.codigo, 0, r.err);
  assert.match(r.err, /el merge lo juzga el pre-push/);
  assert.ok(!/git restore --staged/.test(r.err), 'no sugiere tirar lo aprobado');
  assert.equal(gt(d, 'rev-list', '--parents', '-n', '1', 'HEAD').split(' ').length, 3, 'es un merge');
  r = g(d, ['push', '-q', 'origin', 'main'], { env: entorno('verde'), puede: true });
  assert.equal(r.codigo, 0, r.err);
  assert.match(r.err, /candado de origin\/main: candado: en verde \(barreras\) · el rango/);
  assert.match(r.err, /candado del disco: candado: en verde \(barreras\) · el rango/);
  assert.equal(gt(d, 'status', '--porcelain'), '');
});

// ---------------------------------------------------------------- pre-push

test('criterio 8: un commit con --no-verify no sube — pre-push lo caza (barreras --rango), con el rango del remoto', () => {
  const d = repo();
  const llamadas = path.join(TMP, `push-${n++}.log`);
  commitArmado(d, { '.claude/kit.md': QUITA_STASH }, 'quita con --no-verify');
  const r = g(d, ['push', '-q', 'origin', 'main'], { env: entorno('verde', { FAKE_GITLEAKS_LOG: llamadas }), puede: true });
  assert.notEqual(r.codigo, 0);
  assert.match(r.err, /kit pre-push: ROJO/);
  assert.match(r.err, /candado de origin\/main: candado:barreras · el commit [0-9a-f]{12} toca/);
  assert.match(r.err, /candado del disco: candado:barreras/);
  const args = JSON.parse(fs.readFileSync(llamadas, 'utf8').trim());
  assert.equal(args[0], 'git');
  assert.equal(args[1], `--log-opts=${gt(d, 'rev-parse', 'origin/main')}..${head(d)}`);
  assert.notEqual(gt(d, 'ls-remote', 'origin', 'main').split(/\s/)[0], head(d), 'no subió');
});

test('pre-push: una clave en lo que sube → 1 con archivo:línea; lo limpio sube; una ref nueva va con <ceros>..<b> y lo que ningún remoto tiene', () => {
  const d = repo();
  commitArmado(d, { 'x.txt': 'x\n' });
  let r = g(d, ['push', '-q', 'origin', 'main'], { env: entorno('rojo'), puede: true });
  assert.notEqual(r.codigo, 0);
  assert.match(r.err, /gitleaks: clave-de-prueba en x\.txt:2 · refs\/heads\/main/);
  assert.ok(!r.err.includes('VALOR-QUE-NO-SE-MUESTRA'));
  r = g(d, ['push', '-q', 'origin', 'main'], { env: entorno('verde'), puede: true });
  assert.equal(r.codigo, 0, r.err);
  assert.match(r.err, /candado de origin\/main: candado: en verde \(barreras\)/);
  // ref nueva: limpia sube; con un freno quitado, no
  const llamadas = path.join(TMP, `nueva-${n++}.log`);
  g(d, ['checkout', '-q', '-b', 'nueva']);
  commitArmado(d, { 'n.txt': 'n\n' });
  r = g(d, ['push', '-q', 'origin', 'nueva'], { env: entorno('verde', { FAKE_GITLEAKS_LOG: llamadas }), puede: true });
  assert.equal(r.codigo, 0, r.err);
  assert.match(r.err, /el rango nuevo \.\.[0-9a-f]{12}/);
  assert.equal(JSON.parse(fs.readFileSync(llamadas, 'utf8').trim())[1], `--log-opts=${head(d)} --not --remotes`);
  g(d, ['checkout', '-q', '-b', 'otra-nueva']);
  commitArmado(d, { '.claude/kit.md': QUITA_STASH });
  r = g(d, ['push', '-q', 'origin', 'otra-nueva'], { env: entorno('verde'), puede: true });
  assert.notEqual(r.codigo, 0);
  assert.match(r.err, /candado:barreras/);
});

test('pre-push (pendiente b de D3.2): el remoto con commits que esta PC no tiene → rojo "hacé git fetch", no un error opaco', () => {
  const d = repo();
  const otro = carpeta('otro');
  g(TMP, ['clone', '-q', gt(d, 'remote', 'get-url', 'origin'), otro]);
  commitArmado(otro, { 'otro.txt': 'o\n' });
  g(otro, ['push', '-q', '--no-verify', 'origin', 'main']);
  commitArmado(d, { 'mio.txt': 'm\n' });
  const r = g(d, ['push', '-q', 'origin', 'main'], { env: entorno('verde'), puede: true });
  assert.notEqual(r.codigo, 0);
  assert.match(r.err, /tiene en refs\/heads\/main commits que esta PC no tiene \(avanzó o lo reescribieron\) — hacé git fetch y git pull --rebase/);
  assert.ok(!/error interno/.test(r.err));
  assert.match(log(d), /githook:remoto-adelantado · pre-push · refs\/heads\/main/);
});

test('pre-push: lo que sube no es HEAD y da rojo → dice que el aprobado puede vivir solo en esa rama (pendiente b de D3.2, aceptado)', () => {
  const d = repo();
  g(d, ['checkout', '-q', '-b', 'tema']);
  commitArmado(d, { '.claude/kit.md': QUITA_STASH });
  g(d, ['checkout', '-q', 'main']);
  const r = g(d, ['push', '-q', 'origin', 'tema'], { env: entorno('verde'), puede: true });
  assert.notEqual(r.codigo, 0);
  assert.match(r.err, /refs\/heads\/tema no es lo que tenés abierto — si su aprobado vive solo en esa rama, pusheala desde ella/);
});

test('pre-push sin gitleaks: humano sube en rojo con aviso; nocturno → 1; borrar una ref remota no escanea nada', () => {
  const d = repo();
  commitArmado(d, { 'b.txt': 'b\n' });
  let r = g(d, ['push', '-q', 'origin', 'main'], { env: entorno(null), puede: true });
  assert.equal(r.codigo, 0, r.err);
  assert.match(r.err, /sin escáner en esta PC.*pasa por ser humano, en rojo/);
  commitArmado(d, { 'c.txt': 'c\n' });
  escribir(d, '.kit-rol', 'nocturno\n');
  r = g(d, ['push', '-q', 'origin', 'main'], { env: entorno(null), puede: true });
  assert.notEqual(r.codigo, 0);
  assert.match(r.err, /con rol nocturno no se pushea sin escáner/);
  assert.deepEqual(kg.refsQueSuben(`(delete) ${'0'.repeat(40)} refs/heads/x ${'a'.repeat(40)}\n`), []);
});

// ---------------------------------------------------------------- el hook previo

test('criterio 8: el hook previo encadenado — kit.hooksPathPrevio (corre y su rojo frena) y el de .git/hooks (no el .sample)', () => {
  const d = repo();
  const marca = path.join(TMP, `previo-${n++}.txt`);
  escribir(d, 'otros/pre-commit', `#!/bin/sh\necho previo-corrio >> "${marca.split(path.sep).join('/')}"\necho "salida del previo"\nexit \${PREVIO_SALE:-0}\n`);
  g(d, ['config', 'kit.hooksPathPrevio', 'otros']);
  let r = commitHook(d, { 'b.txt': 'b\n' });
  assert.equal(r.codigo, 0, r.err);
  assert.equal(fs.readFileSync(marca, 'utf8'), 'previo-corrio\n');
  assert.match(r.err, /\(otros\/pre-commit\) salida del previo/);
  assert.match(r.err, /el hook previo otros\/pre-commit: en verde/);
  r = commitHook(d, { 'c.txt': 'c\n' }, { env: entorno('verde', { PREVIO_SALE: '7' }) });
  assert.equal(r.codigo, 1);
  assert.match(r.err, /el hook previo otros\/pre-commit salió con 7/);
  // el de <git-common-dir>/hooks, sin kit.hooksPathPrevio; el .sample no
  g(d, ['config', '--unset', 'kit.hooksPathPrevio']);
  g(d, ['reset', '-q']);
  const hooks = path.join(d, '.git', 'hooks');
  fs.writeFileSync(path.join(hooks, 'pre-commit.sample'), '#!/bin/sh\nexit 1\n');
  r = commitHook(d, { 'd.txt': 'd\n' });
  assert.equal(r.codigo, 0, r.err);
  assert.ok(!/hook previo/.test(r.err));
  fs.writeFileSync(path.join(hooks, 'pre-commit'), '#!/bin/sh\necho "el de git" >&2\nexit 4\n');
  if (!ES_WIN) fs.chmodSync(path.join(hooks, 'pre-commit'), 0o755);
  r = commitHook(d, { 'e.txt': 'e\n' });
  assert.equal(r.codigo, 1);
  assert.match(r.err, /el hook previo \.git\/hooks\/pre-commit salió con 4/);
  // con rojo propio no se corre el previo
  fs.writeFileSync(path.join(hooks, 'pre-commit'), `#!/bin/sh\necho previo >> "${marca.split(path.sep).join('/')}"\n`);
  const antes = fs.readFileSync(marca, 'utf8');
  r = commitHook(d, { '.claude/kit.md': QUITA_STASH });
  assert.equal(r.codigo, 1);
  assert.equal(fs.readFileSync(marca, 'utf8'), antes);
});

test('el previo que es el propio .githooks no se encadena (no se llama a sí mismo)', () => {
  const d = repo();
  g(d, ['config', 'kit.hooksPathPrevio', '.githooks']);
  const r = commitHook(d, { 'b.txt': 'b\n' });
  assert.equal(r.codigo, 0, r.err);
  assert.ok(!/hook previo/.test(r.err));
});

// ---------------------------------------------------------------- error interno → 1 con motivo

test('error interno → 1 con motivo: hook desconocido, fuera de un repo, gitleaks que sale raro o con un reporte ilegible, stdin del pre-push roto', () => {
  const correrCli = (args, cwd, env = entorno('verde'), input = '') => spawnSync(process.execPath, [path.join(__dirname, 'kit-githook.cjs'), ...args], { cwd, env, input, encoding: 'utf8', timeout: 600000 });
  let r = correrCli(['post-commit'], TMP);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /kit githook: error interno — corré doctor \(no sé qué hook es "post-commit"/);
  const suelto = carpeta('suelto');
  r = correrCli(['pre-commit'], suelto);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /kit pre-commit: error interno — corré doctor \(no estoy dentro de un repo git\) — no pasa/);
  const d = repo();
  escribir(d, 'b.txt', 'b\n');
  g(d, ['add', 'b.txt']);
  for (const modo of ['falla', 'basura']) {
    r = correrCli(['pre-commit'], d, entorno(modo));
    assert.equal(r.status, 1, modo);
    assert.match(r.stderr, /error interno — corré doctor \(gitleaks salió con \d+ sin hallazgos que se lean/);
  }
  r = correrCli(['pre-push', 'origin', 'x'], d, entorno('verde'), 'esto no es una línea del pre-push\n');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /el pre-push recibió una línea que no entiendo/);
  // un git que no está
  assert.throws(() => kg.principal(['pre-commit'], { cwd: d, env: { PATH: FAKE_DIR } }), /no hay git en esta PC|no estoy dentro/);
});

test('leerReporte: solo archivo, línea, regla y commit; nunca el valor', () => {
  const f = path.join(TMP, `rep-${n++}.json`);
  fs.writeFileSync(f, JSON.stringify([{ RuleID: 'x<y>', File: 'a\\b.txt', StartLine: 3, Secret: 'S3CRETO', Match: 'S3CRETO', Commit: 'f'.repeat(40) }]));
  const h = kg.leerReporte(f);
  assert.deepEqual(h, [{ archivo: 'a/b.txt', linea: 3, regla: 'xy', commit: 'f'.repeat(40) }]);
  assert.ok(!JSON.stringify(h).includes('S3CRETO'));
  fs.writeFileSync(f, '{}');
  assert.equal(kg.leerReporte(f), null);
  assert.equal(kg.leerReporte(path.join(TMP, 'no-existe.json')), null);
});

test('buscarGitleaks: lo busca en el PATH sin correrlo; sin él, null', () => {
  assert.equal(kg.buscarGitleaks({ PATH: FAKE_DIR }), FAKE_EXE);
  assert.equal(kg.buscarGitleaks({ PATH: PATH_BASE }), null);
  assert.equal(kg.buscarGitleaks({}), null);
});

test('rolDe y refVigente del runner: los mismos que contexto.cjs (sin depender de las librerías del disco)', () => {
  const contexto = require('../hooks/lib/contexto.cjs');
  const d = repo();
  for (const contenido of [null, 'director', 'obrero\n', 'nocturno', 'actualizador', 'otro', '\uFEFFobrero']) {
    if (contenido === null) fs.rmSync(path.join(d, '.kit-rol'), { force: true });
    else escribir(d, '.kit-rol', contenido);
    assert.equal(kg.rolDe(d), contexto.rol(d), String(contenido));
  }
  const o = { cwd: d, env: entorno('verde') };
  assert.equal(kg.refVigente(o).ref, contexto.refVigente(d).ref);
  const sin = repo({ remoto: false });
  assert.equal(kg.refVigente({ cwd: sin, env: entorno('verde') }).ref, contexto.refVigente(sin).ref);
  assert.equal(kg.refVigente({ cwd: sin, env: entorno('verde') }).ref, 'refs/heads/main');
});

test('el candado de la ref se saca a un temporal FUERA del repo y se borra; el árbol y el índice no cambian', () => {
  const d = repo();
  escribir(d, 'b.txt', 'b\n');
  g(d, ['add', 'b.txt']);
  const antes = gt(d, 'status', '--porcelain');
  const tmps = () => fs.readdirSync(os.tmpdir()).filter((x) => x.startsWith('kit-githook-') && !x.startsWith('kit-githook-test-')).length;
  const t0 = tmps();
  const r = kg.principal(['pre-commit'], { cwd: d, env: entorno('verde') });
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  assert.equal(gt(d, 'status', '--porcelain'), antes);
  assert.equal(tmps(), t0, 'el temporal se borró');
});

test('gitattributes.snippet: con core.autocrlf=true, los .githooks/ salen con LF (el #!/bin/sh no se rompe); sin la línea, salen con CRLF', () => {
  const snippet = fs.readFileSync(path.join(MOLDE, 'gitattributes.snippet'), 'utf8');
  assert.ok(snippet.split('\n').includes('.githooks/* text eol=lf'));
  for (const [attrs, conCR] of [[snippet, false], ['.claude/frenos.log merge=union\n', true]]) {
    const d = carpeta('attr');
    g(d, ['init', '-q', '-b', 'main']);
    commitArmado(d, { '.gitattributes': attrs, '.githooks/pre-commit': MOLDE_ARCHIVOS['.githooks/pre-commit'], '.githooks/kit-githook.cjs': MOLDE_ARCHIVOS['.githooks/kit-githook.cjs'] });
    const c = carpeta('attr-clon');
    g(TMP, ['-c', 'core.autocrlf=true', 'clone', '-q', d, c]);
    for (const f of ['pre-commit', 'kit-githook.cjs']) assert.equal(fs.readFileSync(path.join(c, '.githooks', f), 'utf8').includes('\r'), conCR, `${f} con ${JSON.stringify(attrs)}`);
  }
});

// ---------------------------------------------------------------- rf3-2: la configuración de gitleaks

test('rf3-2 y rf3-3: ni GITLEAKS_* ni NODE_* (tampoco en minúsculas) le llegan a gitleaks ni al previo, por git (commit y push) ni directo al runner', () => {
  const d = repo();
  const vio = path.join(TMP, `vio-${n++}.log`);
  const previoVio = path.join(TMP, `previo-vio-${n++}.log`);
  fs.writeFileSync(previoVio, '');
  escribir(d, 'otros/pre-commit', `#!/bin/sh\nenv | grep -i -E '^(node|gitleaks)_' | sed 's/=.*//' >> "${previoVio.split(path.sep).join('/')}"\nexit 0\n`);
  g(d, ['config', 'kit.hooksPathPrevio', 'otros']);
  const extra = { FAKE_GITLEAKS_ENV: vio, GITLEAKS_CONFIG: 'x.toml', gitleaks_config_toml: '[x]', NODE_OPTIONS: '--no-warnings', Node_Path: 'z' };
  let r = commitHook(d, { 'b.txt': 'b\n' }, { env: entorno('verde', extra) });
  assert.equal(r.codigo, 0, r.err);
  assert.match(r.err, /el hook previo otros\/pre-commit: en verde/);
  r = g(d, ['push', '-q', 'origin', 'main'], { env: entorno('verde', extra), puede: true });
  assert.equal(r.codigo, 0, r.err);
  escribir(d, 'c.txt', 'c\n');
  g(d, ['add', 'c.txt']);
  const directo = kg.principal(['pre-commit'], { cwd: d, env: entorno('verde', extra) });
  assert.equal(directo.codigo, 0, directo.lineas.join('\n'));
  const vistas = fs.readFileSync(vio, 'utf8').trim().split('\n');
  assert.equal(vistas.length, 3);
  for (const v of vistas) assert.deepEqual(JSON.parse(v), []);
  assert.equal(fs.readFileSync(previoVio, 'utf8'), '', 'el previo no vio ninguna');
  assert.deepEqual(Object.keys(kg.sinInyectadas({ PATH: 'p', NODE_OPTIONS: 'x', node_path: 'y', GITLEAKS_CONFIG: 'z', Gitleaks_Config_Toml: 'w', NODEX: 'v', MI_NODE_X: 'u' })), ['PATH', 'NODEX', 'MI_NODE_X']);
});

test('rf3-2: con el gitleaks de verdad, GITLEAKS_CONFIG o GITLEAKS_CONFIG_TOML con una regla que no matchea no tapan la clave (commit y push)', { skip: GITLEAKS_REAL ? false : 'gitleaks no está en esta PC' }, () => {
  const d = repo();
  const tomlTxt = '[[rules]]\nid = "nada"\nregex = "zzzzqqqq"\n';
  const toml = path.join(TMP, `nada-${n++}.toml`);
  fs.writeFileSync(toml, tomlTxt);
  const clave = claveDePrueba();
  const variantes = [{ GITLEAKS_CONFIG: toml }, { GITLEAKS_CONFIG_TOML: tomlTxt }];
  for (const extra of variantes) {
    const r = commitHook(d, { 'k.txt': `token = "${clave}"\n` }, { env: entorno('real', extra) });
    assert.equal(r.codigo, 1, `${Object.keys(extra)}: ${r.err}`);
    assert.match(r.err, /gitleaks: github-pat en k\.txt:1/);
  }
  g(d, ['commit', '-q', '--no-verify', '-m', 'k']);
  for (const extra of variantes) {
    const r = g(d, ['push', '-q', 'origin', 'main'], { env: entorno('real', extra), puede: true });
    assert.notEqual(r.codigo, 0, `${Object.keys(extra)}: ${r.err}`);
    assert.match(r.err, /gitleaks: github-pat en k\.txt:1/);
  }
  assert.ok(!log(d).includes(clave.slice(4)));
});

test('rf3-2: un .gitleaks.toml o .gitleaksignore del disco que no es el que se juzga → rojo (commit y push); igual, o sin gitleaks en la PC, pasa', () => {
  const d = repo();
  // sin git add (lo del disco no lo juzga el candado, rf-10): gitleaks igual lo lee
  escribir(d, '.gitleaks.toml', '[[rules]]\nid = "nada"\nregex = "zzzzqqqq"\n');
  let r = commitHook(d, { 'b.txt': 'b\n' });
  assert.equal(r.codigo, 1, r.err);
  assert.match(r.err, /gitleaks: el \.gitleaks\.toml del disco no es el que lleva este commit, y gitleaks lo lee del disco — hacé git add \(o git restore\)/);
  assert.match(log(d), /githook:config-gitleaks · pre-commit · \.gitleaks\.toml/);
  // sin gitleaks en la PC no lo lee nadie: no traba
  r = commitHook(d, { 'b.txt': 'b\n' }, { gitleaks: null });
  assert.equal(r.codigo, 0, r.err);
  assert.ok(!/del disco no es/.test(r.err));
  fs.rmSync(path.join(d, '.gitleaks.toml'));
  // uno commiteado y cambiado en el disco
  commitArmado(d, { '.gitleaksignore': 'a.txt:regla:1\n' });
  escribir(d, '.gitleaksignore', 'a.txt:regla:1\nc.txt:github-pat:1\n');
  r = commitHook(d, { 'c.txt': 'c\n' });
  assert.equal(r.codigo, 1, r.err);
  assert.match(r.err, /el \.gitleaksignore del disco no es el que lleva este commit/);
  g(d, ['checkout', '-q', '--', '.gitleaksignore']);
  r = g(d, ['commit', '-q', '-m', 'c'], { env: entorno('verde'), puede: true });
  assert.equal(r.codigo, 0, r.err);
  // con core.autocrlf=true el disco tiene CRLF y el blob LF: es el mismo
  g(d, ['config', 'core.autocrlf', 'true']);
  escribir(d, '.gitleaksignore', 'a.txt:regla:1\r\n');
  r = commitHook(d, { 'e.txt': 'e\n' });
  assert.equal(r.codigo, 0, r.err);
  g(d, ['config', '--unset', 'core.autocrlf']);
  g(d, ['checkout', '-q', '--', '.gitleaksignore']);
  // push: lo que sube trae un .gitleaksignore y el disco tiene otro
  escribir(d, '.gitleaksignore', 'otra cosa\n');
  r = g(d, ['push', '-q', 'origin', 'main'], { env: entorno('verde'), puede: true });
  assert.notEqual(r.codigo, 0);
  assert.match(r.err, /gitleaks: el \.gitleaksignore del disco no es el de lo que sube, y gitleaks lo lee del disco — commitealo \(o git restore\), o pusheá desde esa rama · refs\/heads\/main/);
  assert.equal(kg.configDistinta('HEAD', { raiz: d, cwd: d, env: entorno('verde') }), '.gitleaksignore');
  g(d, ['checkout', '-q', '--', '.gitleaksignore']);
  assert.equal(kg.configDistinta('HEAD', { raiz: d, cwd: d, env: entorno('verde') }), null);
  // otra rama, con el disco limpio: se compara con lo que sube, no con el índice
  g(d, ['checkout', '-q', '-b', 'otra-rama']);
  commitArmado(d, { '.gitleaksignore': 'de la otra rama\n' });
  g(d, ['checkout', '-q', 'main']);
  assert.equal(gt(d, 'status', '--porcelain'), '');
  r = g(d, ['push', '-q', 'origin', 'otra-rama'], { env: entorno('verde'), puede: true });
  assert.notEqual(r.codigo, 0);
  assert.match(r.err, /gitleaks: el \.gitleaksignore del disco no es el de lo que sube, .* · refs\/heads\/otra-rama/);
  // una etiqueta en un commit que el remoto ya tiene (sin .gitleaksignore): no sube ningún commit, la config no importa
  g(d, ['tag', 'viejo', 'origin/main']);
  r = g(d, ['push', '-q', 'origin', 'viejo'], { env: entorno('verde'), puede: true });
  assert.equal(r.codigo, 0, r.err);
});

// ---------------------------------------------------------------- rf3-3: NODE_OPTIONS

test('rf3-3: NODE_OPTIONS="--require x.cjs" con un process.exit(0) no apaga el hook (commit y push; en Windows también node_options)', () => {
  const d = repo();
  const x = path.join(TMP, `sale0-${n++}.cjs`);
  fs.writeFileSync(x, 'process.exit(0);\n');
  const req = `--require ${JSON.stringify(x)}`;
  const variantes = [{ NODE_OPTIONS: req }, ...(ES_WIN ? [{ node_options: req }] : [])];
  for (const extra of variantes) {
    const r = commitHook(d, { '.claude/kit.md': QUITA_STASH }, { env: entorno('verde', extra) });
    assert.equal(r.codigo, 1, `${Object.keys(extra)}: ${r.err}`);
    assert.match(r.err, /candado de origin\/main: candado:barreras/);
    assert.match(r.err, /kit pre-commit: ROJO/);
  }
  g(d, ['commit', '-q', '--no-verify', '-m', 'quita']);
  for (const extra of variantes) {
    const r = g(d, ['push', '-q', 'origin', 'main'], { env: entorno('verde', extra), puede: true });
    assert.notEqual(r.codigo, 0);
    assert.match(r.err, /kit pre-push: ROJO/);
  }
  // directo al runner (sin el sh): los dos candados corren sin el --require (si no, salen 0 sin decir nada: "en verde")
  g(d, ['reset', '-q', '--soft', 'origin/main']);
  const res = kg.principal(['pre-commit'], { cwd: d, env: entorno('verde', { NODE_OPTIONS: req }) });
  assert.equal(res.codigo, 1, res.lineas.join('\n'));
  assert.ok(res.lineas.some((l) => /^candado de origin\/main: candado:barreras/.test(l)));
  assert.ok(res.lineas.some((l) => /^candado del disco: candado:barreras/.test(l)));
});

// ---------------------------------------------------------------- rf3-6: un pase no ensucia el árbol

test('rf3-6: sin gitleaks y con frenos.log versionado — commit, pull --rebase y push pasan y el árbol queda limpio; un rojo sí deja su renglón', () => {
  const d = repo();
  commitArmado(d, { '.gitignore': '/.kit-rol\n', '.claude/frenos.log': '' }, 'frenos.log versionado, como en el molde');
  g(d, ['push', '-q', '--no-verify', 'origin', 'main']);
  const otra = carpeta('otra-pc');
  g(TMP, ['clone', '-q', gt(d, 'remote', 'get-url', 'origin'), otra]);
  commitArmado(otra, { 'o.txt': 'o\n' });
  g(otra, ['push', '-q', '--no-verify', 'origin', 'main']);
  let r = commitHook(d, { 'y.txt': 'y\n' }, { gitleaks: null });
  assert.equal(r.codigo, 0, r.err);
  assert.match(r.err, /pasa por ser humano, en rojo/);
  assert.equal(gt(d, 'status', '--porcelain'), '');
  r = g(d, ['pull', '-q', '--rebase', 'origin', 'main'], { env: entorno(null), puede: true });
  assert.equal(r.codigo, 0, r.err);
  r = g(d, ['push', '-q', 'origin', 'main'], { env: entorno(null), puede: true });
  assert.equal(r.codigo, 0, r.err);
  assert.equal(gt(d, 'status', '--porcelain'), '');
  assert.equal(log(d), '');
  const local = logLocal(d).trim().split('\n');
  assert.equal(local.length, 2, logLocal(d));
  assert.match(local[0], / · humano · main · githook:sin-escaner · pre-commit · no está$/);
  assert.match(local[1], / · humano · main · githook:sin-escaner · pre-push · no está$/);
  // un worktree de obrero: pasa, queda limpio y worktree remove anda; su renglón queda en el log común
  const wt = path.join(TMP, `wt-${n++}`);
  g(d, ['worktree', 'add', '-q', '-b', 'obrero', wt]);
  escribir(wt, '.kit-rol', 'obrero\n');
  r = commitHook(wt, { 'w.txt': 'w\n' }, { gitleaks: null });
  assert.equal(r.codigo, 0, r.err);
  assert.equal(gt(wt, 'status', '--porcelain'), '');
  g(d, ['worktree', 'remove', wt]);
  assert.match(logLocal(d), / · obrero · obrero · githook:sin-escaner · pre-commit · no está\n$/);
  // un rojo (nocturno sin escáner) sí escribe en el versionado
  escribir(d, '.kit-rol', 'nocturno\n');
  r = commitHook(d, { 'z.txt': 'z\n' }, { gitleaks: null });
  assert.equal(r.codigo, 1);
  assert.match(log(d), / · nocturno · main · githook:sin-escaner · pre-commit · no está\n$/);
  // un frenos.log que no termina en LF (lo tocaron a mano): queda como estaba y el log local no gana un renglón vacío
  fs.rmSync(path.join(d, '.kit-rol'));
  commitArmado(d, { '.claude/frenos.log': 'a mano, sin fin de línea' });
  escribir(d, 'u.txt', 'u\n');
  g(d, ['add', 'u.txt']);
  const res = kg.principal(['pre-commit'], { cwd: d, env: entorno(null) });
  assert.equal(res.codigo, 0, res.lineas.join('\n'));
  assert.equal(log(d), 'a mano, sin fin de línea');
  assert.ok(!logLocal(d).includes('\n\n'), JSON.stringify(logLocal(d)));
  assert.equal(logLocal(d).trim().split('\n').length, 4);
});
