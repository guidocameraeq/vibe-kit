'use strict';
// doctor.test.cjs — el doctor (SPEC-paquete-3, "Instalar hooks por PC" y el `doctor` mínimo; criterio 12).
// SIEMPRE con un HOME falso: cada corrida pasa --home <tmp> y un entorno armado a mano (HOME/USERPROFILE falsos, un PATH con los
// ejecutables falsos de esta prueba y el directorio de git), así ni el ~/.claude/ real ni los programas reales entran. El HOME falso
// se arma con el instalador de verdad. Ninguna clave literal: se arma en corrida (r1-4).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const RAIZ_TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'g11-'));
const HOME_PROCESO = path.join(RAIZ_TMP, 'home-del-proceso');
fs.mkdirSync(HOME_PROCESO, { recursive: true });
process.env.HOME = HOME_PROCESO;
process.env.USERPROFILE = HOME_PROCESO;

const DOCTOR = path.join(__dirname, 'doctor.cjs');
const INSTALADOR = path.join(__dirname, 'instalar-hooks-pc.cjs');
const D = require('./doctor.cjs');
const MOLDE = path.resolve(__dirname, '..', '..', '..', 'molde');
const WIN = process.platform === 'win32';
const VIEJO_TXT = `// un anti-secretos viejo\nconst re = /${'gh' + 'p_'}[A-Za-z0-9]{36}/;\n`;

const GIT_DIR = path.dirname(D.buscarEnPath('git', process.env));
const git = (cwd, ...args) => spawnSync('git', args, { cwd, encoding: 'utf8', env: { ...process.env, HOME: HOME_PROCESO, USERPROFILE: HOME_PROCESO } });

let n = 0;
const nuevaCarpeta = (pref) => {
  const d = path.join(RAIZ_TMP, `${pref}${++n}`);
  fs.mkdirSync(d, { recursive: true });
  return d;
};

// Un programa falso en `bin`: imprime `salida` (o se cuelga si es null).
function falso(bin, nombre, salida) {
  if (WIN) {
    const cuerpo = salida === null ? '@ping -n 40 127.0.0.1 >nul' : `@echo ${salida}`;
    fs.writeFileSync(path.join(bin, `${nombre}.cmd`), `@echo off\r\n${cuerpo}\r\n`);
  } else {
    const cuerpo = salida === null ? 'sleep 40' : `echo '${salida}'`;
    fs.writeFileSync(path.join(bin, nombre), `#!/bin/sh\n${cuerpo}\n`, { mode: 0o755 });
  }
}
const sacarFalso = (bin, nombre) => fs.rmSync(path.join(bin, WIN ? `${nombre}.cmd` : nombre), { force: true });

const FICHA = fs
  .readFileSync(path.join(MOLDE, 'kit.ejemplo.md'), 'utf8')
  .replace(/^sensible:[\s\S]*?^secretos:/m, 'sensible:\n  datos-reales: ["tabla:clientes", git clean]\n  plata: no\n  sale-afuera: [node scripts/mandar-mails.cjs]\n  claves: [gitleaks detect]\n  release: [git tag]\nsecretos:');

// El escenario "todo verde": HOME falso con el instalador aplicado, un PATH falso y un repo con ficha, .githooks/ y core.hooksPath.
function escenario() {
  const home = nuevaCarpeta('home');
  const bin = nuevaCarpeta('bin');
  const repo = nuevaCarpeta('repo');
  falso(bin, 'gitleaks', '8.21.2');
  falso(bin, 'claude', '2.1.309 (Claude Code)');
  falso(bin, 'bash', 'GNU bash');
  const ins = spawnSync(process.execPath, [INSTALADOR, '--home', home], { encoding: 'utf8', env: { ...process.env, HOME: HOME_PROCESO, USERPROFILE: HOME_PROCESO }, cwd: RAIZ_TMP });
  assert.equal(ins.status, 0, ins.stdout + ins.stderr);
  assert.equal(git(repo, 'init', '-q').status, 0);
  fs.mkdirSync(path.join(repo, '.claude'), { recursive: true });
  fs.writeFileSync(path.join(repo, '.claude', 'kit.md'), FICHA);
  fs.mkdirSync(path.join(repo, 'scripts'), { recursive: true });
  fs.writeFileSync(path.join(repo, 'scripts', 'mandar-mails.cjs'), '// x\n');
  fs.cpSync(path.join(MOLDE, 'githooks'), path.join(repo, '.githooks'), { recursive: true, filter: (s) => !s.endsWith('.test.cjs') });
  assert.equal(git(repo, 'config', 'core.hooksPath', '.githooks').status, 0);
  return { home, bin, repo };
}
const settingsDe = (e) => path.join(e.home, '.claude', 'settings.json');
const leerSettings = (e) => JSON.parse(fs.readFileSync(settingsDe(e), 'utf8'));
const escribirSettings = (e, v) => fs.writeFileSync(settingsDe(e), JSON.stringify(v, null, 2));

function entorno(e, extra = {}) {
  const base = {
    PATH: [e.bin, GIT_DIR, path.dirname(process.execPath), ...(WIN ? [path.join(process.env.SystemRoot || 'C:\Windows', 'System32')] : ['/usr/bin', '/bin'])].join(path.delimiter),
    PATHEXT: '.COM;.EXE;.BAT;.CMD',
    HOME: HOME_PROCESO,
    USERPROFILE: HOME_PROCESO,
    SystemRoot: process.env.SystemRoot || '',
    ComSpec: process.env.ComSpec || '',
    ProgramFiles: path.join(RAIZ_TMP, 'sin-program-files'),
  };
  return { ...base, ...extra };
}
function correr(e, { cwd, extraEnv, args = [], plazo } = {}) {
  const env = entorno(e, extraEnv);
  if (plazo) env.KIT_DOCTOR_PLAZO_MS = String(plazo);
  const r = spawnSync(process.execPath, [DOCTOR, '--home', e.home, ...args], { encoding: 'utf8', env, cwd: cwd || e.repo, timeout: 60000 });
  return { codigo: r.status, out: r.stdout, err: r.stderr, lineas: r.stdout.split('\n').filter(Boolean) };
}
// La línea de un chequeo (por id).
const linea = (r, id) => r.lineas.find((l) => new RegExp(`^[✓✗⚠] ${id} · `).test(l));
// Fuerza el fallo: la línea de `id` empieza con `marca` y trae `texto`; todas las demás siguen igual que en verde.
function rojo(e, id, marca, texto, opts) {
  const r = correr(e, opts);
  const l = linea(r, id);
  assert.ok(l, `${id}: sin línea\n${r.out}`);
  assert.ok(l.startsWith(`${marca} ${id} · `), `${id}: esperaba ${marca}\n${l}`);
  if (texto) assert.match(l, texto, l);
  if (marca === '✗') assert.ok(l.split(' · ').length >= 3, `${id}: el ✗ lleva "qué · cómo se arregla"\n${l}`);
  return r;
}

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

// ================================================================ criterio 12: verde, igual, sin escribir
test('verde con todo instalado: los 14 chequeos en ✓, en el orden fijo, sale 0', () => {
  const e = escenario();
  const r = correr(e);
  assert.equal(r.codigo, 0, r.out + r.err);
  const ids = D.IDS;
  assert.equal(ids.length, 14);
  const chequeos = r.lineas.slice(0, 14);
  chequeos.forEach((l, i) => assert.ok(l.startsWith(`✓ ${ids[i]} · `), `${i}: ${l}`));
  assert.match(r.lineas[14], /^doctor · 14 chequeos · 0 ✗ · 0 ⚠$/);
  assert.equal(r.lineas.length, 15);
  // la salida de verde (sin rutas): se la muestra el informe
  assert.ok(!r.out.includes(RAIZ_TMP.replace(/\\/g, '/')) && !r.out.includes(RAIZ_TMP), 'ninguna ruta de la prueba en la salida');
  if (process.env.G11_MOSTRAR) process.stderr.write(`\n${r.out}\n`);
});

test('dos corridas dan exactamente lo mismo, en verde y con fallas', () => {
  const e = escenario();
  assert.equal(correr(e).out, correr(e).out);
  falso(e.bin, 'claude', '2.1.100');
  fs.rmSync(path.join(e.repo, '.githooks'), { recursive: true });
  const a = correr(e);
  const b = correr(e);
  assert.equal(a.codigo, 1);
  assert.equal(a.out, b.out);
});

test('no escribe nada: el HOME falso y el repo (con su .git) quedan byte a byte y con el mismo mtime, en verde y en rojo', () => {
  for (const romper of [() => {}, (e) => falso(e.bin, 'gitleaks', null), (e) => fs.rmSync(path.join(e.repo, '.githooks'), { recursive: true })]) {
    const e = escenario();
    romper(e);
    const antes = [foto(e.home), foto(e.repo)];
    correr(e, { plazo: 1500 });
    assert.deepEqual([foto(e.home), foto(e.repo)], antes);
  }
});

test('salida 0 con ⚠ y sin ✗; 1 con algún ✗; 2 con una opción que no conoce', () => {
  const e = escenario();
  falso(e.bin, 'lefthook', 'x');
  const w = correr(e);
  assert.equal(w.codigo, 0, w.out);
  assert.match(w.lineas[14], /1 ⚠$/);
  falso(e.bin, 'gitleaks', '8.1.0');
  assert.equal(correr(e).codigo, 1);
  const r = spawnSync(process.execPath, [DOCTOR, '--foo'], { encoding: 'utf8', env: entorno(e) });
  assert.equal(r.status, 2);
  assert.match(r.stdout, /uso: doctor\.cjs/);
});

// ================================================================ un caso rojo por chequeo
test('node: menor que 20 → ✗ con su arreglo; 20 o más ✓', () => {
  assert.match(D.chNode('18.19.0').qué, /v18\.19\.0: el kit pide 20/);
  assert.equal(D.chNode('18.19.0').est, '✗');
  assert.ok(D.chNode('18.19.0').arreglo);
  assert.equal(D.chNode('20.0.0').est, '✓');
  assert.equal(D.chNode('26.1.0').est, '✓');
});

test('gitleaks: no está / versión vieja / sin número / colgado (con la causa "lento en frío: Defender")', () => {
  let e = escenario();
  sacarFalso(e.bin, 'gitleaks');
  rojo(e, 'gitleaks', '✗', /no está en el PATH.*preparame esta PC/);
  e = escenario();
  falso(e.bin, 'gitleaks', '8.18.4');
  rojo(e, 'gitleaks', '✗', /8\.18\.4 es menor que 8\.19.*actualizá gitleaks/);
  e = escenario();
  falso(e.bin, 'gitleaks', '8.19.0');
  assert.ok(linea(correr(e), 'gitleaks').startsWith('✓'));
  e = escenario();
  falso(e.bin, 'gitleaks', 'no se de versiones');
  rojo(e, 'gitleaks', '✗', /no pude leer su versión/);
  e = escenario();
  falso(e.bin, 'gitleaks', null);
  const t0 = Date.now();
  rojo(e, 'gitleaks', '✗', /no respondió en \d+ s.*lento en frío.*Defender.*Defender|no respondió en \d+ s.*lento en frío \(Defender/, { plazo: 1500 });
  assert.ok(Date.now() - t0 < 30000, 'el plazo inyectado corta el cuelgue');
});

test('claude-code: cada versión contra 2.1.295 — terminal, extensión de VS Code (con su .obsolete) y app', () => {
  let e = escenario();
  falso(e.bin, 'claude', '2.1.294 (Claude Code)');
  rojo(e, 'claude-code', '✗', /2\.1\.294 \(terminal\) < 2\.1\.295.*claude update/);
  falso(e.bin, 'claude', '2.1.295 (Claude Code)');
  assert.ok(linea(correr(e), 'claude-code').startsWith('✓'));
  // una extensión vieja aunque la terminal esté bien
  e = escenario();
  const ext = path.join(e.home, '.vscode', 'extensions');
  fs.mkdirSync(path.join(ext, 'anthropic.claude-code-2.1.280-win32-x64'), { recursive: true });
  fs.mkdirSync(path.join(ext, 'anthropic.claude-code-2.1.308-win32-x64'), { recursive: true });
  rojo(e, 'claude-code', '✗', /2\.1\.280 \(extensión de VS Code\) < 2\.1\.295.*2\.1\.308 \(extensión de VS Code\)/);
  // la vieja marcada como obsoleta por VS Code no cuenta
  fs.writeFileSync(path.join(ext, '.obsolete'), JSON.stringify({ 'anthropic.claude-code-2.1.280-win32-x64': true }));
  const l = linea(correr(e), 'claude-code');
  assert.ok(l.startsWith('✓'), l);
  // la app de escritorio
  e = escenario();
  fs.mkdirSync(path.join(e.home, 'AppData', 'Roaming', 'Claude', 'claude-code', '2.1.200'), { recursive: true });
  rojo(e, 'claude-code', '✗', /2\.1\.200 \(app de escritorio\)/);
  // ninguna: ⚠ (no trabaja a ciegas)
  e = escenario();
  sacarFalso(e.bin, 'claude');
  rojo(e, 'claude-code', '⚠', /no encontré Claude Code/);
});

test('lefthook: en el PATH o su yml en el repo → ⚠ (pisa el pre-commit del kit); sin él ✓', () => {
  let e = escenario();
  falso(e.bin, 'lefthook', 'x');
  rojo(e, 'lefthook', '⚠', /pisa el pre-commit del kit/);
  e = escenario();
  fs.writeFileSync(path.join(e.repo, 'lefthook.yml'), 'pre-commit:\n');
  rojo(e, 'lefthook', '⚠', /el repo trae lefthook\.yml/);
  assert.ok(linea(correr(escenario()), 'lefthook').startsWith('✓'));
});

test('git-bash: informativo, nunca ✗ (en Windows: ⚠ si no está; ✓ si está)', () => {
  const e = escenario();
  assert.ok(linea(correr(e), 'git-bash').startsWith('✓'));
  if (WIN) {
    sacarFalso(e.bin, 'bash');
    const r = rojo(e, 'git-bash', '⚠', /solo lo usan los \.githooks\//);
    assert.equal(r.codigo, 0, 'un ⚠ no traba');
  }
});

test('settings-pc: sin settings.json y con JSON roto → ✗ (y los chequeos que dependen de él no mienten)', () => {
  let e = escenario();
  fs.rmSync(settingsDe(e));
  const r = rojo(e, 'settings-pc', '✗', /no hay ~\/\.claude\/settings\.json.*instalar hooks por PC/);
  assert.match(linea(r, 'hooks-pc'), /^✗ hooks-pc/);
  assert.match(linea(r, 'deny-almacen'), /^✗ deny-almacen/);
  e = escenario();
  fs.writeFileSync(settingsDe(e), '{ "hooks": ');
  rojo(e, 'settings-pc', '✗', /no se lee: el JSON no abre.*corregilo a mano/);
  e = escenario();
  fs.writeFileSync(settingsDe(e), '{"model":"a","model":"b"}');
  rojo(e, 'settings-pc', '✗', /clave "model" repetida/);
});

test('hooks-pc: sin block, otro timeout, no exec, otra ruta, matcher cambiado, sin registrar, UserPromptSubmit ausente → ✗', () => {
  const casos = [
    ['sin onFailure block', (v) => delete v.hooks.PreToolUse.find((g) => g.matcher).hooks[0].onFailure, /PreToolUse: sin onFailure "block"/],
    ['timeout 10', (v) => (v.hooks.PreToolUse.find((g) => g.matcher).hooks[0].timeout = 10), /PreToolUse: timeout 10 y no 20/],
    ['timeout ausente en UserPromptSubmit', (v) => delete v.hooks.UserPromptSubmit[0].hooks[0].timeout, /UserPromptSubmit: timeout ausente/],
    [
      'forma de texto (no exec)',
      (v) => {
        const h = v.hooks.PreToolUse.find((g) => g.matcher).hooks[0];
        h.command = `node "${h.args[0]}"`;
        delete h.args;
      },
      /PreToolUse: no está en forma exec/,
    ],
    ['otra ruta', (v) => (v.hooks.PreToolUse.find((g) => g.matcher).hooks[0].args = ['C:/otro/.claude/hooks/kit/secretos.cjs']), /apunta a otra ruta/],
    ['matcher distinto', (v) => (v.hooks.PreToolUse.find((g) => g.matcher).matcher = 'Bash'), /el matcher no es el del kit/],
    ['PreToolUse sin registrar', (v) => (v.hooks.PreToolUse = v.hooks.PreToolUse.filter((g) => !g.matcher)), /PreToolUse: no está registrado/],
    ['UserPromptSubmit sin registrar', (v) => delete v.hooks.UserPromptSubmit, /UserPromptSubmit: no está registrado/],
  ];
  for (const [nombre, tocar, texto] of casos) {
    const e = escenario();
    const v = leerSettings(e);
    tocar(v);
    escribirSettings(e, v);
    rojo(e, 'hooks-pc', '✗', texto);
    assert.ok(nombre);
  }
});

test('hooks-pc-iguales: editado → ✗ y se reporta el archivo (no se pisa); falta uno; sin INSTALADO; versión nueva → ⚠ aparte', () => {
  let e = escenario();
  const kit = path.join(e.home, '.claude', 'hooks', 'kit');
  const editado = path.join(kit, 'secretos.cjs');
  fs.appendFileSync(editado, '\n// editado a mano\n');
  const antes = fs.readFileSync(editado);
  const r = rojo(e, 'hooks-pc-iguales', '✗', /editado a mano: secretos\.cjs \(no lo piso\).*corré el instalador/);
  assert.ok(fs.readFileSync(editado).equals(antes), 'no lo pisó');
  assert.equal(r.codigo, 1);
  e = escenario();
  fs.rmSync(path.join(e.home, '.claude', 'hooks', 'kit', 'lib', 'git.cjs'));
  rojo(e, 'hooks-pc-iguales', '✗', /falta: lib\/git\.cjs/);
  e = escenario();
  fs.rmSync(path.join(e.home, '.claude', 'hooks', 'kit', 'INSTALADO'));
  rojo(e, 'hooks-pc-iguales', '✗', /no hay hooks\/kit\/INSTALADO/);
  // los archivos que el instalador deja sin listar (frenos.log, settings.antes.json) no cuentan
  e = escenario();
  fs.writeFileSync(path.join(e.home, '.claude', 'hooks', 'kit', 'frenos.log'), 'x\n');
  fs.writeFileSync(path.join(e.home, '.claude', 'hooks', 'kit', 'settings.antes.json'), '{}');
  assert.ok(linea(correr(e), 'hooks-pc-iguales').startsWith('✓'));
  // "hay versión nueva": lo instalado coincide con INSTALADO pero el pc/ que viaja al lado cambió
  e = escenario();
  const inst = path.join(kit.replace(/home\d+/, path.basename(e.home)), 'INSTALADO');
  const t = fs.readFileSync(inst, 'utf8').replace(/^[0-9a-f]{64}( {2}secretos\.cjs)$/m, `${'0'.repeat(64)}$1`);
  fs.writeFileSync(inst, t);
  fs.appendFileSync(path.join(e.home, '.claude', 'hooks', 'kit', 'secretos.cjs'), '\n'); // el instalado ≠ pc/, y ≠ el hash: ahora es "editado"
  const sin = correr(e);
  assert.match(linea(sin, 'hooks-pc-iguales'), /^✗/);
  // un INSTALADO viejo con el hash del archivo instalado (lo instaló una versión anterior del kit)
  e = escenario();
  const instalada = path.join(e.home, '.claude', 'hooks', 'kit', 'lib', 'git.cjs');
  fs.appendFileSync(instalada, '\n// versión anterior\n');
  const crypto = require('node:crypto');
  const h = crypto.createHash('sha256').update(fs.readFileSync(instalada)).digest('hex');
  const ruta = path.join(e.home, '.claude', 'hooks', 'kit', 'INSTALADO');
  fs.writeFileSync(ruta, fs.readFileSync(ruta, 'utf8').replace(/^[0-9a-f]{64}( {2}lib\/git\.cjs)$/m, `${h}$1`));
  const rn = rojo(e, 'hooks-pc-iguales', '⚠', /hay versión nueva del corrector \(lib\/git\.cjs.*corré el instalador/);
  assert.equal(rn.codigo, 0, 'una versión nueva avisa, no traba');
});

test('deny-almacen: sin la regla o apuntando a otro home → ✗', () => {
  let e = escenario();
  let v = leerSettings(e);
  v.permissions.deny = v.permissions.deny.filter((x) => !x.includes('kit-secretos'));
  escribirSettings(e, v);
  rojo(e, 'deny-almacen', '✗', /falta el deny de Read sobre ~\/\.config\/kit-secretos/);
  e = escenario();
  v = leerSettings(e);
  v.permissions.deny = ['Read(//c/otro/.config/kit-secretos/**)'];
  escribirSettings(e, v);
  rojo(e, 'deny-almacen', '✗', /apunta a otra carpeta/);
  e = escenario();
  v = leerSettings(e);
  delete v.permissions;
  escribirSettings(e, v);
  rojo(e, 'deny-almacen', '✗', /falta el deny/);
});

test('anti-secretos-viejo: un PreToolUse ajeno cuyo archivo trae el prefijo de un token → ⚠ con --sacar-viejo; el del kit no cuenta', () => {
  const e = escenario();
  const archivo = path.join(e.home, '.claude', 'hooks', 'anti-secretos.js');
  fs.writeFileSync(archivo, VIEJO_TXT);
  const v = leerSettings(e);
  v.hooks.PreToolUse.push({ matcher: 'Bash', hooks: [{ type: 'command', command: `node "${archivo.replace(/\\/g, '/')}"` }] });
  escribirSettings(e, v);
  const r = rojo(e, 'anti-secretos-viejo', '⚠', /anti-secretos\.js.*demora cada Bash.*sacalo cuando confirmes.*--sacar-viejo/);
  assert.equal(r.codigo, 0);
  // un hook ajeno que no trae el prefijo no es el viejo
  fs.writeFileSync(archivo, '// otro\n');
  assert.ok(linea(correr(e), 'anti-secretos-viejo').startsWith('✓'));
});

test('plazo-arranque: KIT_PLAZO_ARRANQUE_MS en el entorno, en un env de los settings de la PC o del repo → ✗', () => {
  let e = escenario();
  rojo(e, 'plazo-arranque', '✗', /KIT_PLAZO_ARRANQUE_MS está puesta en el entorno de esta terminal.*unset KIT_PLAZO_ARRANQUE_MS/, { extraEnv: { KIT_PLAZO_ARRANQUE_MS: '300' } });
  e = escenario();
  let v = leerSettings(e);
  v.env = { OTRA: '1', KIT_PLAZO_ARRANQUE_MS: '300' };
  escribirSettings(e, v);
  rojo(e, 'plazo-arranque', '✗', /el "env" de ~\/\.claude\/settings\.json/);
  e = escenario();
  fs.writeFileSync(path.join(e.repo, '.claude', 'settings.local.json'), JSON.stringify({ env: { KIT_PLAZO_ARRANQUE_MS: '5' } }));
  rojo(e, 'plazo-arranque', '✗', /el "env" de \.claude\/settings\.local\.json del repo/);
  e = escenario();
  v = leerSettings(e);
  v.env = { OTRA: '1' };
  escribirSettings(e, v);
  assert.ok(linea(correr(e), 'plazo-arranque').startsWith('✓'));
});

test('pre-commit: fuera de un repo ⚠; sin .githooks/ (con ficha ✗, sin ficha ⚠); hook pisado; hooksPath; sin gitleaks → ✗', () => {
  let e = escenario();
  const fuera = nuevaCarpeta('fuera');
  rojo(e, 'pre-commit', '⚠', /no estás dentro de un repo/, { cwd: fuera });
  rojo(e, 'ficha', '⚠', /no estás dentro de un repo/, { cwd: fuera });
  e = escenario();
  fs.rmSync(path.join(e.repo, '.githooks'), { recursive: true });
  rojo(e, 'pre-commit', '✗', /el repo tiene ficha pero no hay \.githooks\//);
  fs.rmSync(path.join(e.repo, '.claude', 'kit.md'));
  rojo(e, 'pre-commit', '⚠', /no tiene \.githooks\/ ni ficha/);
  e = escenario();
  fs.writeFileSync(path.join(e.repo, '.githooks', 'pre-commit'), '#!/bin/sh\n# lefthook\nexec lefthook run pre-commit\n');
  rojo(e, 'pre-commit', '✗', /\.githooks\/pre-commit no es el del kit \(¿lo pisó lefthook/);
  e = escenario();
  fs.rmSync(path.join(e.repo, '.githooks', 'kit-githook.cjs'));
  fs.rmSync(path.join(e.repo, '.githooks', 'pre-push'));
  rojo(e, 'pre-commit', '✗', /falta \.githooks\/pre-push · falta \.githooks\/kit-githook\.cjs/);
  e = escenario();
  git(e.repo, 'config', '--unset', 'core.hooksPath');
  rojo(e, 'pre-commit', '✗', /core\.hooksPath vacío/);
  git(e.repo, 'config', 'core.hooksPath', '.husky');
  rojo(e, 'pre-commit', '✗', /core\.hooksPath es ".husky" y no \.githooks/);
  e = escenario();
  sacarFalso(e.bin, 'gitleaks');
  rojo(e, 'pre-commit', '✗', /sin gitleaks en esta PC/);
});

test('ficha: rota → ✗ con archivo:línea; sin ficha ⚠; con aviso (clave desconocida) ⚠', () => {
  let e = escenario();
  const ruta = path.join(e.repo, '.claude', 'kit.md');
  fs.writeFileSync(ruta, FICHA.replace('nivel: estandar', 'nivel: gigante'));
  const l = linea(rojo(e, 'ficha', '✗', /la ficha está rota · \.claude\/kit\.md:\d+: /), 'ficha');
  assert.match(l, /kit\.md:\d+: "nivel"/);
  // la ficha rota se dice en ficha y sensible-prosa no inventa nada
  assert.match(linea(correr(e), 'sensible-prosa'), /^⚠ sensible-prosa · sin ficha legible/);
  e = escenario();
  fs.rmSync(path.join(e.repo, '.claude', 'kit.md'));
  rojo(e, 'ficha', '⚠', /no tiene \.claude\/kit\.md/);
  e = escenario();
  fs.writeFileSync(path.join(e.repo, '.claude', 'kit.md'), FICHA.replace('push-publica: no', 'push-publika: no\npush-publica: no'));
  rojo(e, 'ficha', '⚠', /1 aviso · \.claude\/kit\.md línea \d+: campo desconocido/);
});

test('sensible-prosa: una entrada cuyo primer término no está en el PATH ni en el repo → ⚠; "tabla:" y los programas que existen no', () => {
  let e = escenario();
  fs.writeFileSync(path.join(e.repo, '.claude', 'kit.md'), FICHA.replace('plata: no', 'plata: ["tabla:ventas", mails a gerencia, "tabla clientes de la base real"]'));
  const r = rojo(e, 'sensible-prosa', '⚠', /2 entradas de sensible: cuyo primer término no está en el PATH ni en el repo · sensible\.plata: "mails", sensible\.plata: "tabla"/);
  assert.equal(r.codigo, 0);
  assert.ok(!/ventas/.test(linea(r, 'sensible-prosa')), 'saltea tabla:');
  // lo que está en el repo cuenta (con extensión o en .claude/scripts/)
  e = escenario();
  fs.mkdirSync(path.join(e.repo, '.claude', 'scripts'), { recursive: true });
  fs.writeFileSync(path.join(e.repo, '.claude', 'scripts', 'db.cjs'), '// x\n');
  fs.writeFileSync(path.join(e.repo, '.claude', 'kit.md'), FICHA.replace('plata: no', 'plata: [db borrar, ./scripts/mandar-mails.cjs]'));
  assert.ok(linea(correr(e), 'sensible-prosa').startsWith('✓'));
  // el verde de fábrica del escenario: las 5 claves, ninguna prosa
  assert.match(linea(correr(escenario()), 'sensible-prosa'), /^✓ sensible-prosa · las 4 entradas/);
});
