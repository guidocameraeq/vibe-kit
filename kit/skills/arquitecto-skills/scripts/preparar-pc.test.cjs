'use strict';
// preparar-pc.test.cjs — "Preparame esta PC" (SPEC-paquete-6, P2.2; criterios 1 a 5).
// SIEMPRE con un HOME falso (--home <tmp>), HOME/USERPROFILE del proceso falsos, y un PATH armado a mano: gh, gitleaks y claude
// falsos de esta prueba + el directorio de git + node. El kit es un clon temporal de este árbol con un tag anotado (r1-7): ni el
// ~/.claude/ real ni ../vibe-kit-pruebas/ entran. El cwd de cada corrida es un temporal fuera de vibe-kit (r1-9).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const RAIZ_TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'p22-'));
const HOME_PROCESO = path.join(RAIZ_TMP, 'home-del-proceso');
fs.mkdirSync(HOME_PROCESO, { recursive: true });
process.env.HOME = HOME_PROCESO;
process.env.USERPROFILE = HOME_PROCESO;

const P = require('./preparar-pc.cjs');
const D = require('./doctor.cjs');
const DOCTOR = path.join(__dirname, 'doctor.cjs');
const KIT_ARBOL = path.resolve(__dirname, '..', '..', '..'); // kit/
const WIN = process.platform === 'win32';
const GIT_DIR = path.dirname(D.buscarEnPath('git', process.env));
const CWD = path.join(RAIZ_TMP, 'cwd'); // fuera de vibe-kit y fuera de todo repo
fs.mkdirSync(CWD);

const ENV_GIT = { ...process.env, HOME: HOME_PROCESO, USERPROFILE: HOME_PROCESO, GIT_CONFIG_NOSYSTEM: '1' };
const git = (cwd, ...args) => {
  const r = spawnSync('git', ['-c', 'core.autocrlf=false', '-c', 'user.name=t', '-c', 'user.email=t@t', ...args], { cwd, encoding: 'utf8', env: ENV_GIT });
  assert.equal(r.status, 0, `git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout;
};

let n = 0;
const nueva = (pref) => {
  const d = path.join(RAIZ_TMP, `${pref}${++n}`);
  fs.mkdirSync(d, { recursive: true });
  return d;
};

// ---------------------------------------------------------------- el kit de prueba: este árbol, commiteado y con tag anotado
const KIT_BASE = path.join(RAIZ_TMP, 'kit-base');
fs.mkdirSync(KIT_BASE);
fs.cpSync(KIT_ARBOL, path.join(KIT_BASE, 'kit'), { recursive: true });
git(KIT_BASE, 'init', '-q');
git(KIT_BASE, 'add', '-A');
git(KIT_BASE, 'commit', '-qm', 'kit');
git(KIT_BASE, 'tag', '-a', 'v9.0.0', '-m', 'v9.0.0');
const clonKit = () => {
  const d = nueva('kit');
  fs.rmdirSync(d);
  git(RAIZ_TMP, 'clone', '-q', KIT_BASE, d);
  return d;
};

// ---------------------------------------------------------------- programas falsos
function falso(bin, nombre, salida, auth) {
  if (WIN) {
    const cuerpo = auth ? `if "%1"=="auth" (echo ${auth}) else (echo ${salida})` : `echo ${salida}`;
    fs.writeFileSync(path.join(bin, `${nombre}.cmd`), `@echo off\r\n${cuerpo}\r\n`);
  } else {
    const cuerpo = auth ? `if [ "$1" = auth ]; then echo '${auth}'; else echo '${salida}'; fi` : `echo '${salida}'`;
    fs.writeFileSync(path.join(bin, nombre), `#!/bin/sh\n${cuerpo}\n`, { mode: 0o755 });
  }
}
function binFalso({ sinGh = false } = {}) {
  const bin = nueva('bin');
  if (!sinGh) falso(bin, 'gh', 'gh version 2.60.0', 'Logged in to github.com account guidito');
  falso(bin, 'gitleaks', '8.21.2');
  falso(bin, 'claude', '2.1.309 Claude Code');
  falso(bin, 'bash', 'GNU bash');
  return bin;
}
function entorno(bin) {
  return {
    PATH: [bin, GIT_DIR, path.dirname(process.execPath), ...(WIN ? [path.join(process.env.SystemRoot || 'C:\\Windows', 'System32')] : ['/usr/bin', '/bin'])].join(path.delimiter),
    PATHEXT: '.COM;.EXE;.BAT;.CMD',
    HOME: HOME_PROCESO,
    USERPROFILE: HOME_PROCESO,
    SystemRoot: process.env.SystemRoot || '',
    ComSpec: process.env.ComSpec || '',
    ProgramFiles: path.join(RAIZ_TMP, 'sin-program-files'),
    GIT_CONFIG_NOSYSTEM: '1',
  };
}

// ---------------------------------------------------------------- proyectos con fichas
const FICHA = (proyecto, entornos) =>
  `---\nkit: 3.0.0\nnivel: estandar\nvars:\n  proyecto: ${proyecto}\n${entornos.length ? `entornos:\n${entornos.map(([k, clase, acceso]) => `  ${k}: {clase: ${clase}${acceso ? `, acceso: "${acceso}"` : ''}}`).join('\n')}\n` : ''}---\n`;
function proyectos(mapa) {
  const d = nueva('proy');
  for (const [nombre, ents] of Object.entries(mapa)) {
    fs.mkdirSync(path.join(d, nombre, '.claude'), { recursive: true });
    fs.writeFileSync(path.join(d, nombre, '.claude', 'kit.md'), FICHA(nombre, ents));
    git(path.join(d, nombre), 'init', '-q'); // un proyecto es un repo (SPEC-paquete-8r2 t7: el recorrido mira carpetas con .git)
  }
  return d;
}

// ---------------------------------------------------------------- correr
function escenario(opts = {}) {
  return { home: nueva('home'), bin: binFalso(opts), kit: opts.kit || clonKit(), proy: opts.proy || proyectos({ alfa: [['base', 'dummy', 'postgres://localhost:5433/alfa'], ['prod', 'real']] }) };
}
// El preparar-pc del clon (RF-3: el que corre tiene que ser el del --kit).
const scriptDe = (kit) => path.join(kit, 'kit', 'skills', 'arquitecto-skills', 'scripts', 'preparar-pc.cjs');
// En proceso (rápido; deja inyectar el renombre). → { codigo, texto, lineas }
function correr(e, extra = [], { renombrar, conProyectos = true, script } = {}) {
  const args = ['--kit', e.kit, '--home', e.home, ...(conProyectos ? ['--proyectos', e.proy] : []), ...extra];
  const r = P.principal(args, { env: entorno(e.bin), cwd: CWD, script: script || scriptDe(e.kit), ...(renombrar ? { renombrar } : {}) });
  return { ...r, lineas: r.texto.split('\n') };
}
// Como proceso aparte (como lo corre la skill).
function correrProceso(e, extra = []) {
  const r = spawnSync(process.execPath, [scriptDe(e.kit), '--kit', e.kit, '--home', e.home, '--proyectos', e.proy, ...extra], { encoding: 'utf8', env: entorno(e.bin), cwd: CWD, timeout: 240000 });
  return { codigo: r.status, texto: r.stdout + r.stderr };
}
const linea = (r, paso) => r.lineas.find((l) => new RegExp(`^[✓✗⚠] ${paso} · `).test(l));
const settingsDe = (e) => path.join(e.home, '.claude', 'settings.json');
const leerSettings = (e) => JSON.parse(fs.readFileSync(settingsDe(e), 'utf8'));

// La foto de un árbol: ruta → bytes + mtime. Para "no escribió nada".
function foto(dir) {
  const out = {};
  (function rec(d) {
    if (!fs.existsSync(d)) return;
    for (const x of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, x.name);
      if (x.isDirectory()) {
        out[`${p}/`] = 'dir';
        rec(p);
      } else out[p] = `${fs.readFileSync(p).toString('hex')}@${fs.statSync(p).mtimeMs}`;
    }
  })(dir);
  return out;
}

// ================================================================ criterio 1
test('crit 1: --plan no escribe nada (el HOME byte a byte igual) y dice qué haría', () => {
  const e = escenario();
  fs.mkdirSync(path.join(e.home, '.claude'));
  const antes = foto(e.home);
  const r = correr(e, ['--plan']);
  assert.equal(r.codigo, 0, r.texto);
  assert.deepEqual(foto(e.home), antes);
  assert.match(r.texto, /· haría: copio ~\/\.claude\/skills\/arquitecto\/SKILL\.md/);
  assert.match(r.texto, /· haría: creo .*settings\.json/);
  assert.match(r.texto, /plan: no escribí nada/);
  assert.doesNotMatch(r.texto, /^doctor/m, 'con --plan no corre doctor');
});

test('crit 1: en un HOME vacío deja skills, agente, VERSION, hooks/kit, settings (PreToolUse, crossSessionInbound, autoMode con $defaults primero) y kit-pc.md; doctor --home sale 0', () => {
  const e = escenario();
  const r = correrProceso(e);
  assert.equal(r.codigo, 0, r.texto);
  const c = path.join(e.home, '.claude');
  for (const s of ['arquitecto', 'arquitecto-skills', 'docs-fyd', 'relevamiento']) assert.ok(fs.existsSync(path.join(c, 'skills', s, 'SKILL.md')), s);
  assert.ok(fs.existsSync(path.join(c, 'agents', 'redteam-spec.md')));
  assert.equal(fs.readFileSync(path.join(c, 'VERSION'), 'utf8'), fs.readFileSync(path.join(e.kit, 'kit', 'VERSION'), 'utf8'));
  assert.ok(fs.existsSync(path.join(c, 'hooks', 'kit', 'secretos.cjs')));
  assert.ok(fs.existsSync(path.join(c, 'hooks', 'kit', 'INSTALADO')));
  const s = leerSettings(e);
  assert.ok(s.hooks.PreToolUse.some((g) => g.hooks.some((h) => /\/\.claude\/hooks\/kit\//.test(h.args.join(' ')) && h.onFailure === 'block')));
  assert.equal(s.crossSessionInbound, 'accept');
  assert.deepEqual(s.autoMode, { environment: ['$defaults', 'alfa: base (dummy): postgres://localhost:5433/alfa'] });
  // la carpeta de proyectos, en los dos lugares
  const kp = P.leerKitPc(e.home);
  assert.ok(kp.datos, JSON.stringify(kp));
  assert.equal(kp.datos.proyectos, e.proy.replace(/\\/g, '/'));
  assert.deepEqual(kp.datos.autoMode, ['alfa: base (dummy): postgres://localhost:5433/alfa']);
  assert.equal(kp.datos.gh, 'guidito');
  assert.equal(kp.datos.entorno, 'nativo');
  const arq = fs.readFileSync(path.join(c, 'skills', 'arquitecto', 'SKILL.md'), 'utf8');
  assert.ok(arq.includes(`**Carpeta de proyectos de esta máquina**: \`${e.proy.replace(/\\/g, '/')}\``));
  // la tabla y doctor pegado
  assert.match(r.texto, /^✓ capa-privada · no hay — instalé solo lo público$/m);
  assert.match(r.texto, /^doctor:$/m);
  assert.match(r.texto, /listo: reiniciá Claude Code\.\s*$/);
  // y doctor, aparte, con el cwd fuera de vibe-kit (r1-9)
  const d = spawnSync(process.execPath, [DOCTOR, '--home', e.home], { encoding: 'utf8', env: entorno(e.bin), cwd: CWD, timeout: 120000 });
  assert.equal(d.status, 0, d.stdout + d.stderr);
});

// ================================================================ criterio 2
test('crit 2: la segunda corrida dice "sin cambios" y no reescribe nada', () => {
  const e = escenario();
  assert.equal(correr(e).codigo, 0);
  const antes = foto(e.home);
  const r = correr(e);
  assert.equal(r.codigo, 0, r.texto);
  assert.match(r.texto, /^sin cambios: no hay nada que escribir\.$/m);
  assert.match(linea(r, 'kit'), /sin cambios/);
  assert.deepEqual(foto(e.home), antes);
});

test('crit 2: allow propias, una entrada autoMode de Guido y crossSessionInbound "hold" quedan; la tercera con ⚠', () => {
  const e = escenario();
  fs.mkdirSync(path.join(e.home, '.claude'), { recursive: true });
  const propio = { permissions: { allow: ['Bash(npm test)', 'Read(//c/x/**)'] }, crossSessionInbound: 'hold', autoMode: { environment: ['$defaults', 'Source control: github.com/guido'], soft_deny: ['$defaults', 'nunca X'] } };
  fs.writeFileSync(settingsDe(e), JSON.stringify(propio, null, 2));
  const r = correr(e);
  assert.equal(r.codigo, 0, r.texto);
  const s = leerSettings(e);
  assert.deepEqual(s.permissions.allow, propio.permissions.allow);
  assert.equal(s.crossSessionInbound, 'hold');
  assert.deepEqual(s.autoMode.environment, ['$defaults', 'Source control: github.com/guido', 'alfa: base (dummy): postgres://localhost:5433/alfa']);
  assert.deepEqual(s.autoMode.soft_deny, ['$defaults', 'nunca X']);
  assert.match(linea(r, 'cross-session'), /^⚠ cross-session · crossSessionInbound dice "hold": no lo toco · .*accept/);
  // y "sin cambios" después
  assert.match(correr(e).texto, /^sin cambios/m);
});

for (const [caso, texto] of [
  ['JSON roto', '{ "permissions": { "allow": [ }'],
  ['claves repetidas', '{ "crossSessionInbound": "accept", "crossSessionInbound": "hold" }'],
  ['autoMode que no es objeto', '{ "autoMode": [] }'],
  ['autoMode.environment que no es lista de textos', '{ "autoMode": { "environment": "x" } }'],
]) {
  test(`crit 2: ${caso} → 1 sin tocar nada (ni el kit)`, () => {
    const e = escenario();
    fs.mkdirSync(path.join(e.home, '.claude'), { recursive: true });
    fs.writeFileSync(settingsDe(e), texto);
    const antes = foto(e.home);
    const r = correr(e);
    assert.equal(r.codigo, 1, r.texto);
    assert.match(r.texto, /no toqué nada\./);
    assert.deepEqual(foto(e.home), antes);
  });
}

test('crit 2: un EBUSY en el renombre del settings → reintenta y queda bien', () => {
  const e = escenario();
  let fallos = 0;
  const renombrar = (a, b) => {
    if (b.endsWith('settings.json') && fallos < 2) {
      fallos++;
      throw Object.assign(new Error('ocupado'), { code: 'EBUSY' });
    }
    return fs.renameSync(a, b);
  };
  const r = correr(e, [], { renombrar });
  assert.equal(r.codigo, 0, r.texto);
  assert.equal(fallos, 2);
  assert.equal(leerSettings(e).crossSessionInbound, 'accept');
  assert.deepEqual(fs.readdirSync(path.join(e.home, '.claude')).filter((f) => f.includes('.tmp-')), []);
});

test('crit 2: EPERM que no se va → ✗ y 1, sin temporales sueltos ni settings a medias', () => {
  const e = escenario();
  let intentos = 0;
  const renombrar = (a, b) => {
    if (b.endsWith('settings.json')) {
      intentos++;
      throw Object.assign(new Error('negado'), { code: 'EPERM' });
    }
    return fs.renameSync(a, b);
  };
  const r = correr(e, [], { renombrar });
  assert.equal(r.codigo, 1, r.texto);
  assert.equal(intentos, 4, '1 intento + 3 reintentos');
  assert.match(linea(r, 'escritura'), /^✗ escritura · no pude renombrar .*EPERM, después de 3 reintentos/);
  assert.ok(!fs.existsSync(settingsDe(e)));
  assert.deepEqual(fs.readdirSync(path.join(e.home, '.claude')).filter((f) => f.includes('.tmp-')), []);
});

// ================================================================ criterio 3: el bloque autoMode por regla
test('crit 3: dos fichas con entornos dummy → dos entradas; se saca uno → sale la suya y la de Guido queda', () => {
  const proy = proyectos({ alfa: [['base', 'dummy', 'pg://a']], beta: [['sandbox', 'prueba'], ['vivo', 'real']] });
  const e = escenario({ proy });
  fs.mkdirSync(path.join(e.home, '.claude'), { recursive: true });
  fs.writeFileSync(settingsDe(e), JSON.stringify({ autoMode: { environment: ['Trusted internal domains: *.guido.lan', '$defaults'] } }));
  assert.equal(correr(e).codigo, 0);
  assert.deepEqual(leerSettings(e).autoMode.environment, ['Trusted internal domains: *.guido.lan', '$defaults', 'alfa: base (dummy): pg://a', 'beta: sandbox (prueba)']);
  // beta pierde su entorno de prueba
  fs.writeFileSync(path.join(proy, 'beta', '.claude', 'kit.md'), FICHA('beta', [['vivo', 'real']]));
  const r = correr(e);
  assert.equal(r.codigo, 0, r.texto);
  assert.deepEqual(leerSettings(e).autoMode.environment, ['Trusted internal domains: *.guido.lan', '$defaults', 'alfa: base (dummy): pg://a']);
  assert.deepEqual(P.leerKitPc(e.home).datos.autoMode, ['alfa: base (dummy): pg://a']);
});

test('crit 3: una entrada del kit editada por Guido queda como suya y la nueva se suma; "$defaults" nunca sale', () => {
  const e = escenario();
  assert.equal(correr(e).codigo, 0);
  const s = leerSettings(e);
  s.autoMode.environment[1] = 'alfa: base (dummy): postgres://localhost:5433/alfa — y la réplica';
  fs.writeFileSync(settingsDe(e), JSON.stringify(s, null, 2));
  // aunque kit-pc.md diga (a mano) que "$defaults" es del kit, no sale
  const kp = path.join(e.home, '.claude', 'kit-pc.md');
  fs.writeFileSync(kp, fs.readFileSync(kp, 'utf8').replace('auto-mode: [', 'auto-mode: ["$defaults", '));
  assert.equal(correr(e).codigo, 0);
  assert.deepEqual(leerSettings(e).autoMode.environment, ['$defaults', 'alfa: base (dummy): postgres://localhost:5433/alfa — y la réplica', 'alfa: base (dummy): postgres://localhost:5433/alfa']);
  assert.deepEqual(P.leerKitPc(e.home).datos.autoMode, ['alfa: base (dummy): postgres://localhost:5433/alfa']);
});

// RF-2 (decisión del director D6.1): una entrada idéntica a la que genera el kit se reclama como del kit; si no, nunca saldría.
test('crit 3 (RF-2): kit-pc.md con auto-mode: [] y la entrada ya en el settings → la 1.ª corrida la reclama; proyecto borrado → sale', () => {
  const e = escenario();
  fs.mkdirSync(path.join(e.home, '.claude'), { recursive: true });
  const ent = 'alfa: base (dummy): postgres://localhost:5433/alfa';
  fs.writeFileSync(settingsDe(e), JSON.stringify({ autoMode: { environment: ['$defaults', 'Source control: mía', ent] } }));
  fs.writeFileSync(P.rutaKitPc(e.home), '---\nauto-mode: []\n---\n');
  assert.equal(correr(e).codigo, 0);
  assert.deepEqual(leerSettings(e).autoMode.environment, ['$defaults', 'Source control: mía', ent], 'no se duplica');
  assert.deepEqual(P.leerKitPc(e.home).datos.autoMode, [ent], 'sí: la reclama');
  assert.match(correr(e).texto, /^sin cambios/m);
  fs.rmSync(path.join(e.proy, 'alfa'), { recursive: true });
  assert.equal(correr(e).codigo, 0);
  assert.deepEqual(leerSettings(e).autoMode.environment, ['$defaults', 'Source control: mía'], 'el proyecto se fue: la entrada sale, la de Guido queda');
  assert.deepEqual(P.leerKitPc(e.home).datos.autoMode, []);
});

test('crit 3: una lista environment sin "$defaults" de Guido no se completa: ⚠ y queda sin él', () => {
  const e = escenario();
  fs.mkdirSync(path.join(e.home, '.claude'), { recursive: true });
  fs.writeFileSync(settingsDe(e), JSON.stringify({ autoMode: { environment: ['Source control: solo esto'] } }));
  const r = correr(e);
  assert.equal(r.codigo, 0, r.texto);
  assert.deepEqual(leerSettings(e).autoMode.environment, ['Source control: solo esto', 'alfa: base (dummy): postgres://localhost:5433/alfa']);
  assert.ok(r.lineas.some((l) => /^⚠ automode · tu autoMode\.environment no trae "\$defaults"/.test(l)), r.texto);
});

test('crit 3: sin entornos dummy ni prueba no se crea el bloque; una ficha rota da ⚠ y sigue', () => {
  const proy = proyectos({ alfa: [['vivo', 'real']] });
  fs.mkdirSync(path.join(proy, 'roto', '.claude'), { recursive: true });
  fs.writeFileSync(path.join(proy, 'roto', '.claude', 'kit.md'), '---\nkit: x\n---\n');
  git(path.join(proy, 'roto'), 'init', '-q'); // un proyecto es un repo (SPEC-paquete-8r2 t7)
  const e = escenario({ proy });
  const r = correr(e);
  assert.equal(r.codigo, 0, r.texto);
  assert.ok(!('autoMode' in leerSettings(e)));
  assert.match(r.texto, /^⚠ automode · roto\/\.claude\/kit\.md no se lee \(línea \d+\)/m);
});

// La mezcla, sola (lo que muerde la mutación)
test('crit 3: mezclarAutoMode — los casos', () => {
  const M = P.mezclarAutoMode;
  assert.deepEqual(M(undefined, [], ['a', 'b']), { lista: ['$defaults', 'a', 'b'], delKit: ['a', 'b'], sinDefaults: false });
  assert.deepEqual(M(undefined, ['x'], []), { lista: undefined, delKit: [], sinDefaults: false });
  assert.deepEqual(M(undefined, [], ['a', 'a', '$defaults']), { lista: ['$defaults', 'a'], delKit: ['a'], sinDefaults: false });
  // las de Guido quedan en su lugar; las del kit que siguen, en el suyo; las que no, salen; las nuevas, al final
  assert.deepEqual(M(['g1', '$defaults', 'a', 'g2', 'b'], ['a', 'b'], ['b', 'c']), { lista: ['g1', '$defaults', 'g2', 'b', 'c'], delKit: ['b', 'c'], sinDefaults: false });
  // "$defaults" nunca es del kit ni sale, aunque kit-pc.md lo liste
  assert.deepEqual(M(['$defaults', 'a'], ['$defaults', 'a'], []), { lista: ['$defaults'], delKit: [], sinDefaults: false });
  // RF-2: una igual a la generada que no estaba anotada: no se duplica y se reclama como del kit (en el orden de la lista)
  assert.deepEqual(M(['$defaults', 'a'], [], ['a']), { lista: ['$defaults', 'a'], delKit: ['a'], sinDefaults: false });
  assert.deepEqual(M(['$defaults', 'b', 'g', 'a'], ['a'], ['a', 'b']), { lista: ['$defaults', 'b', 'g', 'a'], delKit: ['b', 'a'], sinDefaults: false });
  // no: una que el kit ya no genera y no estaba anotada no se reclama ni sale
  assert.deepEqual(M(['$defaults', 'z'], [], ['a']), { lista: ['$defaults', 'z', 'a'], delKit: ['a'], sinDefaults: false });
  // del kit repetida: queda una
  assert.deepEqual(M(['$defaults', 'a', 'a'], ['a'], ['a']), { lista: ['$defaults', 'a'], delKit: ['a'], sinDefaults: false });
  // lista existente sin "$defaults": no se agrega, se avisa
  assert.deepEqual(M(['g'], [], ['a']), { lista: ['g', 'a'], delKit: ['a'], sinDefaults: true });
  assert.deepEqual(M([], [], []), { lista: [], delKit: [], sinDefaults: true });
  // idempotente
  const una = M(['$defaults', 'g'], [], ['a', 'b']);
  assert.deepEqual(M(una.lista, una.delKit, ['a', 'b']), una);
});

test('crit 3: mezclarCrossSession — accept/hold/refuse y lo raro', () => {
  assert.deepEqual(P.mezclarCrossSession(undefined), { valor: 'accept', estado: 'puesto' });
  assert.deepEqual(P.mezclarCrossSession('accept'), { valor: 'accept', estado: 'igual' });
  assert.deepEqual(P.mezclarCrossSession('hold'), { valor: 'hold', estado: 'ajeno' });
  assert.deepEqual(P.mezclarCrossSession('refuse'), { valor: 'refuse', estado: 'ajeno' });
  assert.deepEqual(P.mezclarCrossSession('Accept'), { valor: 'Accept', estado: 'raro' });
  assert.deepEqual(P.mezclarCrossSession(null), { valor: null, estado: 'raro' });
});

test('crit 3: crossSessionInbound "refuse" y uno raro quedan con ⚠', () => {
  for (const [valor, raro] of [['refuse', false], [true, true]]) {
    const e = escenario();
    fs.mkdirSync(path.join(e.home, '.claude'), { recursive: true });
    fs.writeFileSync(settingsDe(e), JSON.stringify({ crossSessionInbound: valor }));
    const r = correr(e);
    assert.equal(r.codigo, 0, r.texto);
    assert.equal(leerSettings(e).crossSessionInbound, valor);
    assert.match(linea(r, 'cross-session'), raro ? /^⚠ .*no es accept, hold ni refuse/ : /^⚠ .*dice "refuse": no lo toco/);
  }
});

// ================================================================ criterio 4: lo editado a mano y el modo flota
const ARCH = ['skills', 'docs-fyd', 'SKILL.md'];
test('crit 4: un archivo editado a mano → sin --pisar-editados no se pisa y el plan lo muestra con su diff; con él, se pisa', () => {
  const e = escenario();
  assert.equal(correr(e).codigo, 0);
  const f = path.join(e.home, '.claude', ...ARCH);
  const original = fs.readFileSync(f, 'utf8');
  fs.writeFileSync(f, `${original}renglón mío\n`);
  const plan = correr(e, ['--plan']);
  assert.equal(plan.codigo, 0, plan.texto);
  assert.match(plan.texto, /· haría: NO piso ~\/\.claude\/skills\/docs-fyd\/SKILL\.md: editado a mano/);
  assert.match(linea(plan, 'editados'), /^⚠ editados · no los piso: skills\/docs-fyd\/SKILL\.md · .*--pisar-editados/);
  assert.match(plan.texto, /^ {4}\+ renglón mío$/m);
  const r = correr(e);
  assert.equal(r.codigo, 0);
  assert.equal(fs.readFileSync(f, 'utf8'), `${original}renglón mío\n`);
  const p = correr(e, ['--pisar-editados']);
  assert.equal(p.codigo, 0, p.texto);
  assert.equal(fs.readFileSync(f, 'utf8'), original);
});

test('crit 4: con --flota lo editado se saltea con ⚠ y no pregunta nada', () => {
  const e = escenario();
  assert.equal(correr(e).codigo, 0);
  const f = path.join(e.home, '.claude', ...ARCH);
  fs.appendFileSync(f, 'mío\n');
  const r = correr(e, ['--flota']);
  assert.equal(r.codigo, 0, r.texto);
  assert.match(fs.readFileSync(f, 'utf8'), /mío\n$/);
  assert.match(linea(r, 'editados'), /^⚠ editados · salteados \(modo flota\): skills\/docs-fyd\/SKILL\.md/);
  assert.doesNotMatch(r.texto, /¿|\?\s*$/m);
  assert.doesNotMatch(r.texto, /diff ~/);
  assert.equal(P.principal(['--kit', e.kit, '--home', e.home, '--flota', '--pisar-editados'], { env: entorno(e.bin), cwd: CWD }).codigo, 2);
});

test('crit 4: un archivo igual a una versión vieja del kit (o en CRLF, o con otra carpeta) no es editado: se actualiza', () => {
  const e = escenario();
  git(e.kit, 'checkout', '-q', 'v9.0.0');
  assert.equal(correr(e).codigo, 0);
  // el kit sigue: v9.0.1 cambia docs-fyd/SKILL.md
  git(e.kit, 'checkout', '-q', '-');
  const fk = path.join(e.kit, 'kit', ...ARCH);
  fs.appendFileSync(fk, 'nuevo en 9.0.1\n');
  git(e.kit, 'commit', '-qam', '9.0.1');
  git(e.kit, 'tag', '-a', 'v9.0.1', '-m', 'v9.0.1');
  // y en la PC, otro archivo quedó en CRLF
  const otro = path.join(e.home, '.claude', 'skills', 'relevamiento', 'SKILL.md');
  fs.writeFileSync(otro, fs.readFileSync(otro, 'utf8').replace(/\n/g, '\r\n'));
  const r = correr(e);
  assert.equal(r.codigo, 0, r.texto);
  assert.equal(linea(r, 'editados'), undefined, r.texto);
  assert.match(r.texto, /^· actualizo ~\/\.claude\/skills\/docs-fyd\/SKILL\.md$/m);
  assert.match(r.texto, /^· actualizo ~\/\.claude\/skills\/relevamiento\/SKILL\.md$/m);
  assert.equal(fs.readFileSync(path.join(e.home, '.claude', ...ARCH), 'utf8'), fs.readFileSync(fk, 'utf8'));
});

test('crit 4: --kit fuera de un tag anotado v* → 1 sin tocar nada; tag liviano → 1; --kit-sin-tag sin --home → 2', () => {
  const e = escenario();
  fs.appendFileSync(path.join(e.kit, 'kit', 'VERSION'), '');
  fs.writeFileSync(path.join(e.kit, 'x.txt'), 'x');
  git(e.kit, 'add', 'x.txt');
  git(e.kit, 'commit', '-qm', 'después del tag');
  let r = correr(e);
  assert.equal(r.codigo, 1, r.texto);
  assert.match(r.texto, /^✗ kit · .*no está parado en un tag anotado v\*/m);
  assert.ok(!fs.existsSync(path.join(e.home, '.claude')));
  git(e.kit, 'tag', 'v9.9.9'); // liviano
  r = correr(e);
  assert.equal(r.codigo, 1, r.texto);
  // las pruebas pueden pasar --kit-sin-tag, solo con --home
  assert.equal(correr(e, ['--kit-sin-tag']).codigo, 0);
  assert.equal(P.principal(['--kit', e.kit, '--kit-sin-tag'], { env: entorno(e.bin), cwd: CWD }).codigo, 2);
  // y una carpeta que no es un kit
  assert.equal(P.principal(['--kit', CWD, '--home', e.home, '--kit-sin-tag'], { env: entorno(e.bin), cwd: CWD }).codigo, 1);
});

// ================================================================ criterio 5: la capa privada y los programas
function privada(dir, { falla = false } = {}) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'instalar.cjs'),
    `const fs = require('fs');\nconst a = process.argv.slice(2);\nif (a[0] === '--variables') { console.log('HUB_TOKEN'); process.exit(0); }\nfs.appendFileSync(require('path').join(__dirname, 'llamadas.txt'), a.join(' ') + '\\n');\nconsole.log('privada: instalé el conector del Hub' + (a.includes('--plan') ? ' (plan)' : ''));\nprocess.exit(${falla ? 3 : 0});\n`,
  );
  return dir;
}
function conPrivada(e, dir) {
  fs.mkdirSync(path.join(e.home, '.claude'), { recursive: true });
  fs.writeFileSync(path.join(e.home, '.claude', 'kit-pc.md'), `---\nprivada: "${dir.replace(/\\/g, '/')}"\n---\n`);
}

test('crit 5: con capa privada corre instalar.cjs --home (y --plan con --plan); su salida va a la tabla; privada queda en kit-pc.md', () => {
  const e = escenario();
  const dir = privada(nueva('priv'));
  conPrivada(e, dir);
  const p = correr(e, ['--plan']);
  assert.equal(p.codigo, 0, p.texto);
  assert.match(p.texto, /^ {2}privada │ privada: instalé el conector del Hub \(plan\)$/m);
  const r = correr(e);
  assert.equal(r.codigo, 0, r.texto);
  assert.match(linea(r, 'capa-privada'), /^✓ capa-privada · .*instalar\.cjs anduvo/);
  assert.match(r.texto, /^ {2}privada │ privada: instalé el conector del Hub$/m);
  assert.deepEqual(fs.readFileSync(path.join(dir, 'llamadas.txt'), 'utf8').trim().split(/\r?\n/), [`--home ${e.home} --plan`, `--home ${e.home}`]);
  assert.equal(P.leerKitPc(e.home).datos.privada, dir.replace(/\\/g, '/'));
});

test('crit 5: si la capa privada falla → 1 con su línea, y lo público quedó instalado', () => {
  const e = escenario();
  conPrivada(e, privada(nueva('priv'), { falla: true }));
  const r = correr(e);
  assert.equal(r.codigo, 1, r.texto);
  assert.match(linea(r, 'capa-privada'), /^✗ capa-privada · .*falló \(salió 3\); lo público quedó instalado · /);
  assert.equal(leerSettings(e).crossSessionInbound, 'accept');
  assert.ok(fs.existsSync(path.join(e.home, '.claude', 'skills', 'arquitecto', 'SKILL.md')));
});

test('crit 5: una carpeta privada sin instalar.cjs → ⚠ y sigue', () => {
  const e = escenario();
  conPrivada(e, nueva('priv-vacia'));
  const r = correr(e);
  assert.equal(r.codigo, 0, r.texto);
  assert.match(linea(r, 'capa-privada'), /^⚠ capa-privada · .*no trae instalar\.cjs/);
});

test('crit 5: un programa que falta (sin gh en el PATH) → su línea con cómo instalarlo, y sigue', () => {
  const e = escenario({ sinGh: true });
  const r = correr(e);
  assert.equal(r.codigo, 0, r.texto);
  assert.match(linea(r, 'gh'), /^⚠ gh · no está en el PATH · .*gh auth login/);
  assert.match(linea(r, 'gitleaks'), /^✓ gitleaks · 8\.21\.2/);
  assert.match(linea(r, 'claude-code'), /^✓ claude-code · 2\.1\.309/);
  assert.equal(P.leerKitPc(e.home).datos.gh, null);
  assert.equal(leerSettings(e).crossSessionInbound, 'accept');
});

test('crit 5: un programa viejo (Claude Code < MIN_CLAUDE) → ⚠ con cómo actualizarlo', () => {
  const e = escenario();
  falso(e.bin, 'claude', '2.1.200 Claude Code');
  const r = correr(e, ['--plan']);
  assert.match(linea(r, 'claude-code'), new RegExp(`^⚠ claude-code · 2\\.1\\.200 es menor que ${P.MIN_CLAUDE.replace(/\./g, '\\.')}`));
});

// ================================================================ kit-pc.md y la escritura, sueltos
test('kit-pc.md: se lee lo que se escribe (con barras de Windows y comillas saneadas); uno roto → 1 sin tocar', () => {
  const home = nueva('home');
  fs.mkdirSync(path.join(home, '.claude'));
  const t = P.textoKitPc({ entorno: 'wsl', gh: 'g', proyectos: 'C:\\Users\\x\\(1) Claude', privada: null, autoMode: ['p: e (dummy): "q" \\ #1', 'otra, con coma'] });
  fs.writeFileSync(P.rutaKitPc(home), t);
  assert.deepEqual(P.leerKitPc(home).datos, { entorno: 'wsl', gh: 'g', proyectos: 'C:/Users/x/(1) Claude', privada: null, autoMode: ["p: e (dummy): 'q' / #1", 'otra, con coma'] });
  fs.writeFileSync(P.rutaKitPc(home), '---\nauto-mode: x\n---\n');
  assert.ok(P.leerKitPc(home).rota);
  const e = escenario();
  fs.mkdirSync(path.join(e.home, '.claude'));
  fs.writeFileSync(P.rutaKitPc(e.home), '---\nauto-mode: [sin cerrar\n---\n');
  const antes = foto(e.home);
  const r = correr(e);
  assert.equal(r.codigo, 1);
  assert.match(r.texto, /^✗ archivo-pc · .*no se lee/m);
  assert.deepEqual(foto(e.home), antes);
});

// SPEC-paquete-8r2 t7 (crit. 7): la carpeta de proyectos D:/ con Hermes/Hermes.exe (dos niveles), su worktree Hermes-x y Otro.
test('crit. 7: generarAutoMode mira dos niveles — las entradas de Hermes/Hermes.exe y de Otro; ninguna del worktree Hermes-x', () => {
  const PR = nueva('proy');
  const h = path.join(PR, 'Hermes', 'Hermes.exe');
  fs.mkdirSync(path.join(h, '.claude'), { recursive: true });
  fs.writeFileSync(path.join(h, '.claude', 'kit.md'), FICHA('hermes', [['base', 'dummy']]));
  git(h, 'init', '-q', '-b', 'main');
  git(h, 'add', '-A');
  git(h, 'commit', '-q', '-m', 'nace');
  const bare = path.join(nueva('remotos'), 'Hermes.exe.git');
  git(RAIZ_TMP, 'clone', '-q', '--bare', h, bare);
  git(h, 'remote', 'add', 'origin', bare);
  const wt = path.join(PR, 'Hermes-x');
  git(h, 'worktree', 'add', '-q', '-b', 'x', wt);
  // el worktree trae otra ficha en el disco: si se leyera, saldría su entrada
  fs.writeFileSync(path.join(wt, '.claude', 'kit.md'), FICHA('hermes-x', [['del-worktree', 'prueba']]));
  fs.mkdirSync(path.join(PR, 'Otro', '.claude'), { recursive: true });
  fs.writeFileSync(path.join(PR, 'Otro', '.claude', 'kit.md'), FICHA('otro', [['o', 'prueba']]));
  git(path.join(PR, 'Otro'), 'init', '-q');
  assert.deepEqual(P.generarAutoMode(PR), { entradas: ['hermes: base (dummy)', 'otro: o (prueba)'], avisos: [] });
});

test('generarAutoMode: entradas saneadas (sin \\ ni ") y en orden de carpeta', () => {
  const proy = proyectos({ zeta: [['z', 'prueba']], alfa: [['a', 'dummy', 'C:/datos/x']] });
  assert.deepEqual(P.generarAutoMode(proy), { entradas: ['alfa: a (dummy): C:/datos/x', 'zeta: z (prueba)'], avisos: [] });
  assert.deepEqual(P.generarAutoMode(null), { entradas: [], avisos: [] });
  assert.match(P.generarAutoMode(path.join(RAIZ_TMP, 'no-existe')).avisos[0], /no encuentro la carpeta/);
  assert.equal(P.entradaAutoMode('p', 'e', 'dummy', 'a\\b "c"\nd'), "p: e (dummy): a/b 'c' d");
});

test('sin --proyectos ni carpeta conocida → ⚠ proyectos y sigue; después la toma del SKILL.md', () => {
  const e = escenario();
  const r = correr(e, [], { conProyectos: false });
  assert.equal(r.codigo, 0, r.texto);
  assert.match(linea(r, 'proyectos'), /^⚠ proyectos · no sé dónde viven tus proyectos/);
  // Guido completa la línea a mano (como dice el SKILL.md): la próxima corrida la toma y la escribe en kit-pc.md
  const arq = path.join(e.home, '.claude', 'skills', 'arquitecto', 'SKILL.md');
  fs.writeFileSync(arq, fs.readFileSync(arq, 'utf8').replace('`{{CARPETA_DE_PROYECTOS}}`', `\`${e.proy}\``));
  const r2 = correr(e, [], { conProyectos: false });
  assert.equal(r2.codigo, 0, r2.texto);
  assert.equal(P.leerKitPc(e.home).datos.proyectos, e.proy.replace(/\\/g, '/'));
  assert.equal(linea(r2, 'editados'), undefined, 'la línea de la carpeta no cuenta como edición');
  assert.match(correr(e, [], { conProyectos: false }).texto, /^sin cambios/m);
});

// ================================================================ revisor frío (RF-1, RF-3, RF-7, RF-8)
test('RF-1: un clon --depth 1 → ✗ "clon sin historia" con la línea del fetch y 1, sin tocar nada; con la historia, anda', () => {
  const e = escenario();
  const d = nueva('raso');
  fs.rmdirSync(d);
  git(RAIZ_TMP, 'clone', '-q', '--depth', '1', '--branch', 'v9.0.0', `file://${WIN ? '/' : ''}${KIT_BASE.replace(/\\/g, '/')}`, d);
  e.kit = d;
  const r = correr(e);
  assert.equal(r.codigo, 1, r.texto);
  assert.match(r.texto, /^✗ kit · .*clon sin historia.* · git -C .* fetch --unshallow --tags/m);
  assert.ok(!fs.existsSync(path.join(e.home, '.claude')), 'no tocó nada');
  git(d, 'fetch', '-q', '--unshallow', '--tags');
  const r2 = correr(e);
  assert.equal(r2.codigo, 0, r2.texto);
});

test('RF-3: el preparar-pc que corre no es el del --kit (el instalado con --kit <clon nuevo>) → ✗ con la línea del del clon y 1', () => {
  const e = escenario();
  const otro = clonKit(); // otro kit: su script no está dentro de e.kit
  const r = correr(e, [], { script: scriptDe(otro) });
  assert.equal(r.codigo, 1, r.texto);
  assert.match(r.texto, /^✗ kit · este preparar-pc .* no es el del kit que pasaste · corré el preparar-pc del clon: node .*\/kit\/skills\/arquitecto-skills\/scripts\/preparar-pc\.cjs --kit /m);
  assert.ok(!fs.existsSync(path.join(e.home, '.claude')));
  // el del clon, aunque la ruta venga con otras mayúsculas (Windows) → anda
  const s = scriptDe(e.kit);
  assert.equal(correr(e, [], { script: WIN ? s.toUpperCase() : s }).codigo, 0);
});

test('RF-7: gh auth status con salida ≠ 0 → ⚠ "no está logueado o no hay red" y la cuenta de kit-pc.md queda la anterior', () => {
  const e = escenario();
  assert.equal(correr(e).codigo, 0);
  assert.equal(P.leerKitPc(e.home).datos.gh, 'guidito');
  // gh que nombra una cuenta pero sale 1 (token vencido, sin red)
  if (WIN) fs.writeFileSync(path.join(e.bin, 'gh.cmd'), '@echo off\r\nif "%1"=="auth" (echo Logged in to github.com account otro & exit /b 1) else (echo gh version 2.60.0)\r\n');
  else fs.writeFileSync(path.join(e.bin, 'gh'), "#!/bin/sh\nif [ \"$1\" = auth ]; then echo 'Logged in to github.com account otro'; exit 1; else echo 'gh version 2.60.0'; fi\n", { mode: 0o755 });
  const r = correr(e);
  assert.equal(r.codigo, 0, r.texto);
  assert.match(linea(r, 'gh'), /^⚠ gh · gh no está logueado o no hay red .*· gh auth login$/);
  assert.equal(P.leerKitPc(e.home).datos.gh, 'guidito', 'no escribe "otro": queda la anterior');
  // en un HOME nuevo, queda vacío
  const e2 = { ...e, home: nueva('home') };
  assert.equal(correr(e2).codigo, 0);
  assert.equal(P.leerKitPc(e2.home).datos.gh, null);
});

test('RF-8: lo que el kit ya no trae — intacto se borra (el plan lo muestra sin borrar); editado o ajeno se deja con ⚠', () => {
  const e = escenario();
  git(e.kit, 'checkout', '-q', 'v9.0.0');
  assert.equal(correr(e).codigo, 0);
  // el kit sigue: v9.0.1 ya no trae dos archivos de docs-fyd
  git(e.kit, 'checkout', '-q', '-');
  const [a, b] = ['skills/docs-fyd/deteccion.md', 'skills/docs-fyd/plantillas/LEEME.md'];
  git(e.kit, 'rm', '-q', `kit/${a}`, `kit/${b}`);
  git(e.kit, 'commit', '-qm', '9.0.1');
  git(e.kit, 'tag', '-a', 'v9.0.1', '-m', 'v9.0.1');
  const casa = (rel) => path.join(e.home, '.claude', ...rel.split('/'));
  fs.appendFileSync(casa(b), 'lo edité\n');
  fs.writeFileSync(casa('skills/docs-fyd/mio.txt'), 'mío\n');
  const arq = fs.readFileSync(casa('skills/arquitecto/SKILL.md'));
  const plan = correr(e, ['--plan']);
  assert.equal(plan.codigo, 0, plan.texto);
  assert.match(plan.texto, /^· haría: borro ~\/\.claude\/skills\/docs-fyd\/deteccion\.md: el kit ya no lo trae/m);
  assert.ok(fs.existsSync(casa(a)), '--plan no borra');
  const r = correr(e);
  assert.equal(r.codigo, 0, r.texto);
  assert.ok(!fs.existsSync(casa(a)), 'sí: el intacto se borra');
  assert.ok(fs.existsSync(casa(b)) && fs.existsSync(casa('skills/docs-fyd/mio.txt')), 'no: el editado y el ajeno quedan');
  assert.match(linea(r, 'sobrantes'), /^⚠ sobrantes · lo dejo: no es del kit o lo editaste: skills\/docs-fyd\/mio\.txt, skills\/docs-fyd\/plantillas\/LEEME\.md/);
  assert.ok(fs.readFileSync(casa('skills/arquitecto/SKILL.md')).equals(arq), 'la línea de la carpeta no se toca');
  assert.ok(fs.existsSync(P.rutaKitPc(e.home)), 'kit-pc.md nunca');
  assert.doesNotMatch(correr(e).texto, /borro/, 'la 2.ª corrida no tiene nada que borrar');
});

test('RF-12: con editados sin pisar (o --flota) VERSION no sube y la tabla lo dice; con --pisar-editados o sin editados, sube', () => {
  const nuevaVersion = (e) => {
    git(e.kit, 'checkout', '-q', '-');
    fs.writeFileSync(path.join(e.kit, 'kit', 'VERSION'), '9.0.1\n');
    git(e.kit, 'commit', '-qam', '9.0.1');
    git(e.kit, 'tag', '-a', 'v9.0.1', '-m', 'v9.0.1');
  };
  const V = (e) => fs.readFileSync(path.join(e.home, '.claude', 'VERSION'), 'utf8');
  const e = escenario();
  git(e.kit, 'checkout', '-q', 'v9.0.0');
  assert.equal(correr(e).codigo, 0);
  const vieja = V(e);
  nuevaVersion(e);
  fs.appendFileSync(path.join(e.home, '.claude', ...ARCH), 'mío\n');
  for (const extra of [[], ['--flota']]) {
    const r = correr(e, extra);
    assert.equal(r.codigo, 0, r.texto);
    assert.equal(V(e), vieja, `no: VERSION queda la vieja (${extra.join(' ') || 'sin banderas'})`);
    assert.match(linea(r, 'version'), /^⚠ version · VERSION no subió: quedaron 1 archivo editado sin pisar · /);
    assert.doesNotMatch(r.texto, /actualizo ~\/\.claude\/VERSION/);
  }
  const p = correr(e, ['--pisar-editados']);
  assert.equal(p.codigo, 0, p.texto);
  assert.equal(V(e), '9.0.1\n', 'sí: con --pisar-editados sube');
  assert.equal(linea(p, 'version'), undefined);
  // sin editados, sube como siempre
  const e2 = escenario();
  git(e2.kit, 'checkout', '-q', 'v9.0.0');
  assert.equal(correr(e2).codigo, 0);
  nuevaVersion(e2);
  const r2 = correr(e2);
  assert.equal(V(e2), '9.0.1\n');
  assert.equal(linea(r2, 'version'), undefined);
});

test.after(() => {
  try {
    fs.rmSync(RAIZ_TMP, { recursive: true, force: true });
  } catch (e) {
    /* Windows a veces retiene un archivo: queda en el temporal */
  }
});
