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
const P = require('./preparar-pc.cjs');
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
  .replace('hasta: 2026-11-15', 'hasta: 2099-01-01')
  .replace(/^sensible:[\s\S]*?^secretos:/m, 'sensible:\n  datos-reales: ["tabla:clientes", git clean]\n  plata: no\n  sale-afuera: [node scripts/mandar-mails.cjs]\n  claves: [gitleaks detect]\n  release: [git tag]\nsecretos:');

// El repo canónico de prueba (un bare local con un tag anotado v2.4.3 y uno liviano v9.0.0 que no cuenta): así nada toca la red.
let CANON = null;
function canonico() {
  if (CANON) return CANON;
  const bare = path.join(RAIZ_TMP, 'canonico.git');
  const trab = path.join(RAIZ_TMP, 'canonico-trab');
  fs.mkdirSync(trab, { recursive: true });
  for (const a of [['init', '-q', '--bare', bare], ['init', '-q', trab]]) assert.equal(git(RAIZ_TMP, ...a).status, 0);
  fs.writeFileSync(path.join(trab, 'x'), 'x');
  const c = ['-c', 'user.name=t', '-c', 'user.email=t@t'];
  for (const a of [['add', '.'], [...c, 'commit', '-q', '-m', 'x'], [...c, 'tag', '-a', 'v2.4.3', '-m', 'v2.4.3'], ['tag', 'v9.0.0'], ['push', '-q', bare, 'HEAD:refs/heads/main', '--tags']]) {
    const r = git(trab, ...a);
    assert.equal(r.status, 0, `${a.join(' ')}: ${r.stderr}`);
  }
  CANON = bare;
  return CANON;
}
// La línea de la carpeta de proyectos del SKILL.md del Arquitecto instalado.
function lineaArquitecto(e, carpeta) {
  const d = path.join(e.home, '.claude', 'skills', 'arquitecto');
  fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(d, 'SKILL.md'), `---\nname: arquitecto\n---\n**Carpeta de proyectos de esta máquina**: \`${carpeta}\` (la de esta PC)\n`);
}

// El escenario "todo verde": HOME falso con el instalador aplicado, un PATH falso y un repo con ficha, .githooks/ y core.hooksPath.
function escenario() {
  const home = nuevaCarpeta('home');
  const bin = nuevaCarpeta('bin');
  const repo = nuevaCarpeta('repo');
  falso(bin, 'gitleaks', '8.21.2');
  falso(bin, 'claude', '2.1.309 (Claude Code)');
  falso(bin, 'bash', 'GNU bash');
  falso(bin, 'gh', 'true');
  const ins = spawnSync(process.execPath, [INSTALADOR, '--home', home], { encoding: 'utf8', env: { ...process.env, HOME: HOME_PROCESO, USERPROFILE: HOME_PROCESO }, cwd: RAIZ_TMP });
  assert.equal(ins.status, 0, ins.stdout + ins.stderr);
  assert.equal(git(repo, 'init', '-q').status, 0);
  fs.mkdirSync(path.join(repo, '.claude'), { recursive: true });
  fs.writeFileSync(path.join(repo, '.claude', 'kit.md'), FICHA);
  fs.mkdirSync(path.join(repo, 'scripts'), { recursive: true });
  fs.writeFileSync(path.join(repo, 'scripts', 'mandar-mails.cjs'), '// x\n');
  fs.cpSync(path.join(MOLDE, 'githooks'), path.join(repo, '.githooks'), { recursive: true, filter: (s) => !s.endsWith('.test.cjs') });
  assert.equal(git(repo, 'config', 'core.hooksPath', '.githooks').status, 0);
  fs.writeFileSync(path.join(repo, 'CLAUDE.md'), '# CLAUDE.md\n\n## El tamaño del pedido\n\nlo de siempre\n');
  assert.equal(git(repo, 'remote', 'add', 'origin', 'https://github.com/o-prueba/alfa.git').status, 0);
  assert.equal(git(repo, 'remote', 'add', 'hub', 'https://github.com/o-prueba/hub.git').status, 0);
  // lo que deja "preparame": VERSION, kit-pc.md, la línea del Arquitecto y crossSessionInbound
  const proyectos = nuevaCarpeta('proy');
  fs.writeFileSync(path.join(home, '.claude', 'VERSION'), '2.4.3\n');
  const e = { home, bin, repo, proyectos };
  lineaArquitecto(e, proyectos.replace(/\\/g, '/'));
  fs.writeFileSync(P.rutaKitPc(home), P.textoKitPc({ entorno: 'nativo', gh: 'cuenta', proyectos, privada: null, autoMode: [] }));
  const st = leerSettings(e);
  st.crossSessionInbound = 'accept';
  escribirSettings(e, st);
  return e;
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
    KIT_REPO_CANONICO: canonico(),
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
test('verde con todo instalado: los 29 chequeos en ✓, en el orden fijo (los 14 de siempre primero), sale 0', () => {
  const e = escenario();
  const r = correr(e);
  assert.equal(r.codigo, 0, r.out + r.err);
  const ids = D.IDS;
  assert.equal(ids.length, 29);
  assert.deepEqual(ids.slice(0, 14), ['node', 'gitleaks', 'claude-code', 'lefthook', 'git-bash', 'settings-pc', 'hooks-pc', 'hooks-pc-iguales', 'deny-almacen', 'anti-secretos-viejo', 'plazo-arranque', 'pre-commit', 'ficha', 'sensible-prosa']);
  assert.deepEqual(ids.slice(14), ['version-kit', 'kit-sync', 'githooks', 'archivo-pc', 'credencial', 'gh-push', 'mesa-gh', 'cross-session', 'automode', 'copias-kit', 'frenos-vencidos', 'regla-tamano', 'tope-skills', 'vecinos', 'locks']);
  const chequeos = r.lineas.slice(0, 29);
  chequeos.forEach((l, i) => assert.ok(l.startsWith(`✓ ${ids[i]} · `), `${i}: ${l}`));
  assert.match(r.lineas[29], /^doctor · todo bien · 0 avisos · 0 cosas a arreglar · 29 chequeos$/);
  assert.equal(r.lineas[30], 'inventario · sin frenadas');
  assert.equal(r.lineas.length, 31);
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
  assert.match(w.lineas[29], /^doctor · todo bien · 1 aviso · 0 cosas a arreglar · /);
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

test('RF-13: el bash de System32 (WSL) primero en el PATH se saltea: kit-sync corre con el de Git; si es el único, git-bash ⚠', { skip: !WIN }, () => {
  const e = escenario();
  comoVibeKit(e);
  falsoBashSync(e, true); // el "de Git": dice LIMPIO
  const s32 = path.join(nuevaCarpeta('falso-windows'), 'System32');
  fs.mkdirSync(s32);
  fs.writeFileSync(path.join(s32, 'bash.cmd'), '@echo off\r\necho SOY WSL\r\nexit /b 1\r\n');
  const PATH = [s32, entorno(e).PATH].join(path.delimiter);
  // sí: con el de WSL primero, kit-sync usa el otro y da LIMPIO
  assert.match(linea(correr(e, { extraEnv: { PATH } }), 'kit-sync'), /^✓ kit-sync · kit ↔ ~\/\.claude: LIMPIO$/);
  assert.equal(D.bashDeGit({ PATH, PATHEXT: '.CMD' }), path.join(e.bin, 'bash.cmd'));
  // no: si el de WSL es el único bash, no cuenta
  sacarFalso(e.bin, 'bash');
  assert.equal(D.bashDeGit({ PATH, PATHEXT: '.CMD', ProgramFiles: path.join(RAIZ_TMP, 'sin-program-files') }), null);
  const r = correr(e, { extraEnv: { PATH } });
  assert.match(linea(r, 'git-bash'), /^⚠ git-bash · /);
  assert.match(linea(r, 'kit-sync'), /^⚠ kit-sync · NO VERIFICADO: no encuentro bash/);
});

test('settings-pc: sin settings.json y con JSON roto → ✗ (y los chequeos que dependen de él no mienten)', () => {
  let e = escenario();
  fs.rmSync(settingsDe(e));
  const r = rojo(e, 'settings-pc', '✗', /no hay ~\/\.claude\/settings\.json.*instalar hooks por PC/);
  assert.match(linea(r, 'hooks-pc'), /^✗ hooks-pc/);
  assert.match(linea(r, 'deny-almacen'), /^✗ deny-almacen/);
  e = escenario();
  fs.writeFileSync(settingsDe(e), '{ "hooks": ');
  rojo(e, 'settings-pc', '✗', /no se lee: el JSON no abre.*la sesión lo abre y lo arregla con tu OK/);
  e = escenario();
  fs.writeFileSync(settingsDe(e), '{"model":"a","model":"b"}');
  rojo(e, 'settings-pc', '✗', /clave "model" repetida/);
});

test('hooks-pc: sin block, otro timeout, no exec, otra ruta, matcher cambiado, sin registrar, UserPromptSubmit ausente → ✗', () => {
  const casos = [
    ['sin onFailure block', (v) => delete v.hooks.PreToolUse.find((g) => g.matcher).hooks[0].onFailure, /PreToolUse: sin onFailure "block"/],
    ['timeout 10', (v) => (v.hooks.PreToolUse.find((g) => g.matcher).hooks[0].timeout = 10), /PreToolUse: timeout 10 y no 60/],
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
  const r = rojo(e, 'anti-secretos-viejo', '⚠', /anti-secretos\.js.*demora cada Bash.*sacalo cuando confirmes.*"\$HOME\/\.claude\/skills\/arquitecto-skills\/scripts\/instalar-hooks-pc\.cjs" --sacar-viejo/);
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

// ================================================================ criterio 6: el doctor completo (SPEC-paquete-6 P2.3)
// Un programa falso que imprime `texto` y sale con `codigo` (sin & | < > ^ % en el texto: es cmd.exe).
function falsoCodigo(bin, nombre, texto, codigo) {
  if (WIN) fs.writeFileSync(path.join(bin, `${nombre}.cmd`), `@echo off\r\necho ${texto}\r\nexit /b ${codigo}\r\n`);
  else fs.writeFileSync(path.join(bin, nombre), `#!/bin/sh\necho '${texto}'\nexit ${codigo}\n`, { mode: 0o755 });
}
// El "bash" que corre kit-sync.sh: dice LIMPIO solo si el HOME que recibe es el de la prueba (r1-9); si no, falla.
function falsoBashSync(e, limpio) {
  if (WIN) {
    const cuerpo = limpio ? `if /i "%HOME%"=="${e.home}" (echo LIMPIO) else (echo HOME equivocado & exit /b 1)` : 'echo SUCIO skills/arquitecto\r\nexit /b 1';
    fs.writeFileSync(path.join(e.bin, 'bash.cmd'), `@echo off\r\n${cuerpo}\r\n`);
  } else {
    const cuerpo = limpio ? `[ "$HOME" = "${e.home}" ] && echo LIMPIO || { echo HOME equivocado; exit 1; }` : 'echo SUCIO skills/arquitecto; exit 1';
    fs.writeFileSync(path.join(e.bin, 'bash'), `#!/bin/sh\n${cuerpo}\n`, { mode: 0o755 });
  }
}
const comoVibeKit = (e) => {
  fs.mkdirSync(path.join(e.repo, '.claude', 'scripts'), { recursive: true });
  fs.writeFileSync(path.join(e.repo, '.claude', 'scripts', 'kit-sync.sh'), '# x\n');
  fs.mkdirSync(path.join(e.repo, 'kit'), { recursive: true });
  fs.writeFileSync(path.join(e.repo, 'kit', 'VERSION'), '2.4.3\n');
};
const kitPc = (e, datos) => fs.writeFileSync(P.rutaKitPc(e.home), P.textoKitPc({ entorno: 'nativo', gh: 'cuenta', proyectos: e.proyectos, privada: null, autoMode: [], ...datos }));

test('los tags: solo cuentan los anotados v*, y gana el de mayor número', () => {
  const salida = ['aaa\trefs/tags/v2.4.3', 'bbb\trefs/tags/v2.4.3^{}', 'ccc\trefs/tags/v9.0.0', 'ddd\trefs/tags/v3.0', 'eee\trefs/tags/v3.0^{}', 'fff\trefs/tags/otro', 'ggg\trefs/tags/otro^{}'].join('\n');
  assert.equal(D.ultimoTagAnotado(salida).tag, 'v3.0');
  assert.equal(D.ultimoTagAnotado('ccc\trefs/tags/v9.0.0'), null);
});

test('version-kit: igual al último tag ✓ (el liviano v9.0.0 no cuenta); atrás ⚠ "actualizate"; sin VERSION ✗; más nueva ✓', () => {
  let e = escenario();
  assert.match(linea(correr(e), 'version-kit'), /^✓ version-kit · el kit instalado \(2\.4\.3\) es el del último tag \(v2\.4\.3\)$/);
  fs.writeFileSync(path.join(e.home, '.claude', 'VERSION'), '2.4.0\n');
  rojo(e, 'version-kit', '⚠', /es 2\.4\.0 y el último tag del canónico es v2\.4\.3 · atrás: decile al Equipador "actualizate"/);
  fs.writeFileSync(path.join(e.home, '.claude', 'VERSION'), '3.0.0\n');
  assert.match(linea(correr(e), 'version-kit'), /^✓ .* más nuevo que el último tag/);
  e = escenario();
  fs.rmSync(path.join(e.home, '.claude', 'VERSION'));
  const r = rojo(e, 'version-kit', '✗', /no hay ~\/\.claude\/VERSION.* · corré "preparame esta PC"/);
  assert.equal(r.codigo, 1);
});

test('D8b-3: los tags con -rc: v3.0.0-rc.2 > rc.1 y el final gana; un tag corto v3.0 sigue valiendo 3.0.0; uno raro no cuenta', () => {
  const anot = (...ts) => ts.flatMap((t, i) => [`a${i}\trefs/tags/${t}`, `b${i}\trefs/tags/${t}^{}`]).join('\n');
  assert.equal(D.ultimoTagAnotado(anot('v3.0.0-rc.1', 'v3.0.0-rc.2')).tag, 'v3.0.0-rc.2');
  assert.equal(D.ultimoTagAnotado(anot('v3.0.0-rc.2', 'v3.0.0', 'v2.9.0')).tag, 'v3.0.0');
  assert.equal(D.ultimoTagAnotado(anot('v3.0.0', 'v3.0.1-rc.1')).tag, 'v3.0.1-rc.1');
  assert.equal(D.ultimoTagAnotado(anot('v3.0')).v, '3.0.0');
  assert.equal(D.ultimoTagAnotado(anot('v3.0.0-beta.1', 'v2.4.3')).tag, 'v2.4.3');
});

test('D8b-3 version-kit: instalada 3.0.0-rc.1 con el último tag v3.0.0 → ⚠ atrás; con el tag rc.1 → ✓; rc.2 instalada y tag rc.1 → más nueva', () => {
  const canon = (...tags) => {
    const bare = nuevaCarpeta('canon-rc');
    const trab = nuevaCarpeta('canon-rc-trab');
    const c = ['-c', 'user.name=t', '-c', 'user.email=t@t'];
    for (const a of [['init', '-q', '--bare', bare], ['init', '-q', trab]]) assert.equal(git(RAIZ_TMP, ...a).status, 0);
    fs.writeFileSync(path.join(trab, 'x'), 'x');
    const pasos = [['add', '.'], [...c, 'commit', '-q', '-m', 'x'], ...tags.map((t) => [...c, 'tag', '-a', t, '-m', t]), ['push', '-q', bare, 'HEAD:refs/heads/main', '--tags']];
    for (const a of pasos) assert.equal(git(trab, ...a).status, 0);
    return bare;
  };
  const e = escenario();
  fs.writeFileSync(path.join(e.home, '.claude', 'VERSION'), '3.0.0-rc.1\n');
  let r = correr(e, { extraEnv: { KIT_REPO_CANONICO: canon('v3.0.0') } });
  assert.match(linea(r, 'version-kit'), /^⚠ version-kit · el kit instalado es 3\.0\.0-rc\.1 y el último tag del canónico es v3\.0\.0 · atrás/);
  r = correr(e, { extraEnv: { KIT_REPO_CANONICO: canon('v3.0.0-rc.1') } });
  assert.match(linea(r, 'version-kit'), /^✓ version-kit · el kit instalado \(3\.0\.0-rc\.1\) es el del último tag \(v3\.0\.0-rc\.1\)$/);
  fs.writeFileSync(path.join(e.home, '.claude', 'VERSION'), '3.0.0-rc.2\n');
  r = correr(e, { extraEnv: { KIT_REPO_CANONICO: canon('v3.0.0-rc.1') } });
  assert.match(linea(r, 'version-kit'), /^✓ .* más nuevo que el último tag/);
});

test('sin red (git y gh falsos que fallan): version-kit, gh-push y mesa-gh dan ⚠ NO VERIFICADO, nunca ✓, y la salida sigue en 0', () => {
  const e = escenario();
  const real = D.buscarEnPath('git', process.env);
  if (WIN) fs.writeFileSync(path.join(e.bin, 'git.cmd'), `@echo off\r\nif "%1"=="ls-remote" (echo fatal: unable to access the remote & exit /b 128)\r\n"${real}" %*\r\n`);
  else fs.writeFileSync(path.join(e.bin, 'git'), `#!/bin/sh\n[ "$1" = ls-remote ] && { echo fatal: unable to access the remote; exit 128; }\nexec "${real}" "$@"\n`, { mode: 0o755 });
  falsoCodigo(e.bin, 'gh', 'error connecting to api.github.com', 1);
  const r = correr(e);
  for (const id of ['version-kit', 'gh-push', 'mesa-gh']) {
    const l = linea(r, id);
    assert.ok(l.startsWith(`⚠ ${id} · NO VERIFICADO: `), l);
    assert.ok(l.split(' · ').length >= 3, `${id} dice cómo se arregla\n${l}`);
  }
  assert.match(linea(r, 'version-kit'), /git ls-remote falló \(fatal: unable to access/);
  assert.equal(r.codigo, 0, r.out);
  // sin gh en el PATH: lo mismo, con la causa
  sacarFalso(e.bin, 'gh');
  assert.match(linea(correr(e), 'gh-push'), /^⚠ gh-push · NO VERIFICADO: gh no está en el PATH/);
  // el canónico que no existe (otro modo de "sin red")
  const e2 = escenario();
  const r2 = correr(e2, { extraEnv: { KIT_REPO_CANONICO: path.join(RAIZ_TMP, 'no-existe.git') } });
  assert.match(linea(r2, 'version-kit'), /^⚠ version-kit · NO VERIFICADO: /);
});

test('kit-sync: en otro repo ✓ "no aplica"; en vibe-kit LIMPIO ✓ (corre con HOME = el --home); SUCIO ✗ con la primera ruta; sin bash ⚠ NO VERIFICADO', () => {
  let e = escenario();
  assert.match(linea(correr(e), 'kit-sync'), /^✓ kit-sync · no aplica/);
  comoVibeKit(e);
  falsoBashSync(e, true);
  assert.match(linea(correr(e), 'kit-sync'), /^✓ kit-sync · kit ↔ ~\/\.claude: LIMPIO$/);
  falsoBashSync(e, false);
  const r = rojo(e, 'kit-sync', '✗', /no está limpio · SUCIO skills\/arquitecto · mirá el diff/);
  assert.equal(r.codigo, 1);
  sacarFalso(e.bin, 'bash');
  rojo(e, 'kit-sync', '⚠', /NO VERIFICADO: no encuentro bash/);
  e = escenario();
  comoVibeKit(e);
  falso(e.bin, 'bash', null);
  assert.match(linea(correr(e, { plazo: 1500 }), 'kit-sync'), /^⚠ kit-sync · NO VERIFICADO: kit-sync\.sh no respondió a tiempo/);
});

test('githooks: sin .githooks/ ✓; con .githooks/ y core.hooksPath puesto ✓; sin core.hooksPath ⚠ con la línea', () => {
  const e = escenario();
  rojo(e, 'githooks', '✓', /core\.hooksPath=\.githooks/);
  assert.equal(git(e.repo, 'config', '--unset', 'core.hooksPath').status, 0);
  rojo(e, 'githooks', '⚠', /no está puesto: los githooks no corren · git config core\.hooksPath \.githooks$/);
  assert.equal(git(e.repo, 'config', 'core.hooksPath', 'otro').status, 0);
  rojo(e, 'githooks', '⚠', /es "otro"/);
  fs.rmSync(path.join(e.repo, '.githooks'), { recursive: true });
  rojo(e, 'githooks', '✓', /no tiene \.githooks/);
});

test('archivo-pc: sin kit-pc.md ⚠ "preparame"; carpeta distinta ⚠; las barras no importan; roto ⚠', () => {
  let e = escenario();
  fs.rmSync(P.rutaKitPc(e.home));
  rojo(e, 'archivo-pc', '⚠', /no hay ~\/\.claude\/kit-pc\.md.*corré "preparame esta PC"/);
  e = escenario();
  lineaArquitecto(e, 'C:/otra/carpeta');
  rojo(e, 'archivo-pc', '⚠', /no es la del SKILL\.md del Arquitecto.*corré "preparame esta PC"/);
  lineaArquitecto(e, `${e.proyectos.replace(/\//g, '\\')}\\`);
  assert.ok(linea(correr(e), 'archivo-pc').startsWith('✓'));
  fs.writeFileSync(P.rutaKitPc(e.home), '---\nentorno nativo\n---\n');
  rojo(e, 'archivo-pc', '⚠', /kit-pc\.md no se lee/);
});

test('credencial: sin capa privada ✓ "no aplica"; con ella, cada variable existe (el valor no se imprime) o ⚠ con las que faltan', () => {
  const e = escenario();
  // valores de prueba armados por partes: que no parezcan una clave (gitleaks generic-api-key)
  const VALOR_PRUEBA = ['valor', 'de', 'prueba'].join('-');
  const OTRO_VALOR_PRUEBA = ['otro', 'valor', 'cualquiera'].join('-');
  assert.match(linea(correr(e), 'credencial'), /^✓ credencial · no aplica/);
  const priv = nuevaCarpeta('priv');
  fs.writeFileSync(path.join(priv, 'instalar.cjs'), "console.log(process.argv.includes('--variables') ? 'HUB_TOKEN_PRUEBA\\nOTRA_VAR_PRUEBA' : 'x');\n");
  kitPc(e, { privada: priv });
  const r = rojo(e, 'credencial', '⚠', /falta 1 variable de la capa privada · OTRA_VAR_PRUEBA · cargalas/, { extraEnv: { HUB_TOKEN_PRUEBA: VALOR_PRUEBA } });
  assert.ok(!r.out.includes(VALOR_PRUEBA), 'no imprime el valor');
  const ok = correr(e, { extraEnv: { HUB_TOKEN_PRUEBA: VALOR_PRUEBA, OTRA_VAR_PRUEBA: OTRO_VALOR_PRUEBA } });
  assert.match(linea(ok, 'credencial'), /^✓ credencial · las 2 variables de la capa privada existen \(no se imprime su valor\)$/);
  assert.ok(!ok.out.includes(VALOR_PRUEBA) && !ok.out.includes(OTRO_VALOR_PRUEBA));
  fs.rmSync(path.join(priv, 'instalar.cjs'));
  rojo(e, 'credencial', '⚠', /no trae instalar\.cjs/);
});

test('gh-push: puede ✓; permissions.push=false, sin acceso, sin login → ⚠ con su arreglo; origin que no es de GitHub ✓ no aplica; sin origin ⚠', () => {
  let e = escenario();
  assert.match(linea(correr(e), 'gh-push'), /^✓ gh-push · gh está logueado y puede pushear a o-prueba\/alfa$/);
  falso(e.bin, 'gh', 'false');
  rojo(e, 'gh-push', '⚠', /no te deja pushear a o-prueba\/alfa \(permissions\.push=false\) · pedí permiso de escritura/);
  falsoCodigo(e.bin, 'gh', 'gh: Not Found HTTP 404', 1);
  rojo(e, 'gh-push', '⚠', /gh no ve o-prueba\/alfa.*pedí acceso a o-prueba\/alfa/);
  falsoCodigo(e.bin, 'gh', 'To get started with GitHub CLI please run: gh auth login', 4);
  rojo(e, 'gh-push', '⚠', /gh no está logueado · gh auth login$/);
  e = escenario();
  assert.equal(git(e.repo, 'remote', 'set-url', 'origin', 'https://gitlab.com/x/y.git').status, 0);
  assert.match(linea(correr(e), 'gh-push'), /^✓ gh-push · no aplica/);
  assert.equal(git(e.repo, 'remote', 'remove', 'origin').status, 0);
  rojo(e, 'gh-push', '⚠', /no tiene remoto origin.* · git remote add origin/);
  rojo(e, 'gh-push', '⚠', /no estás dentro de un repo/, { cwd: e.home });
});

test('mesa-gh: gh lee el repo de cada remoto de la mesa ✓; sin acceso ⚠ "pedile acceso a <aprueba>"; sin el remoto ⚠; sin ficha ✓', () => {
  let e = escenario();
  assert.match(linea(correr(e), 'mesa-gh'), /^✓ mesa-gh · gh lee los 1 repos de la mesa$/);
  falsoCodigo(e.bin, 'gh', 'gh: Not Found HTTP 404', 1);
  rojo(e, 'mesa-gh', '⚠', /la mesa no se lee por gh · hub: gh no lee o-prueba\/hub · pedile acceso a po-ejemplo/);
  e = escenario();
  assert.equal(git(e.repo, 'remote', 'remove', 'hub').status, 0);
  rojo(e, 'mesa-gh', '⚠', /hub: falta el remoto "hub" \(git remote add hub <url>\) · pedile acceso a po-ejemplo/);
  fs.rmSync(path.join(e.repo, '.claude', 'kit.md'));
  assert.ok(linea(correr(e), 'mesa-gh').startsWith('✓'));
  // RF-14: un remoto de la mesa que no es de GitHub → ⚠ "no lo pude mirar", nunca ✓
  e = escenario();
  assert.equal(git(e.repo, 'remote', 'set-url', 'hub', 'https://gitlab.com/o-prueba/hub.git').status, 0);
  rojo(e, 'mesa-gh', '⚠', /^⚠ mesa-gh · hub: el remoto no es de GitHub, no lo pude mirar · /);
});

test('cross-session: accept ✓; falta o "hold" ⚠', () => {
  const e = escenario();
  assert.ok(linea(correr(e), 'cross-session').startsWith('✓'));
  const s = leerSettings(e);
  s.crossSessionInbound = 'hold';
  escribirSettings(e, s);
  rojo(e, 'cross-session', '⚠', /dice "hold" y no "accept".*preparame esta PC/);
  delete s.crossSessionInbound;
  escribirSettings(e, s);
  rojo(e, 'cross-session', '⚠', /no está puesto y no "accept"/);
});

test('automode: el bloque escrito = el que generan las fichas ✓ (con lo de Guido); una ficha cambió ⚠; sin "$defaults" ⚠', () => {
  const e = escenario();
  const proy = path.join(e.proyectos, 'alfa-p', '.claude');
  fs.mkdirSync(proy, { recursive: true });
  fs.mkdirSync(path.join(e.proyectos, 'alfa-p', '.git')); // 8r2 (t7): un proyecto es un repo (con .git)
  fs.writeFileSync(path.join(proy, 'kit.md'), FICHA);
  const gen = P.generarAutoMode(e.proyectos).entradas;
  assert.equal(gen.length, 1, gen.join(' | '));
  // la ficha tiene una entrada nueva que el settings no tiene
  rojo(e, 'automode', '⚠', /no es el que generan las fichas de hoy \(1 entrada generada\) · una ficha cambió: corré "preparame esta PC"/);
  // ya aplicado (con una entrada de Guido en el medio)
  kitPc(e, { autoMode: gen });
  const s = leerSettings(e);
  s.autoMode = { environment: [P.DEFAULTS, 'entrada de Guido', ...gen] };
  escribirSettings(e, s);
  assert.match(linea(correr(e), 'automode'), /^✓ automode · el bloque autoMode es el que generan las fichas \(1 entrada del kit\)$/);
  // sin $defaults: reemplaza los defaults de Claude Code
  s.autoMode = { environment: ['entrada de Guido', ...gen] };
  escribirSettings(e, s);
  rojo(e, 'automode', '⚠', /no trae "\$defaults"/);
  // la ficha se fue: la entrada del kit sobra
  s.autoMode = { environment: [P.DEFAULTS, ...gen] };
  escribirSettings(e, s);
  fs.rmSync(path.join(e.proyectos, 'alfa-p'), { recursive: true });
  rojo(e, 'automode', '⚠', /0 entradas generadas/);
  // sin kit-pc.md no se puede saber
  fs.rmSync(P.rutaKitPc(e.home));
  rojo(e, 'automode', '⚠', /NO VERIFICADO: sin kit-pc\.md/);
});

test('copias-kit: un repo de la carpeta de proyectos con .claude/skills/arquitecto adentro → ⚠ con la lista', () => {
  const e = escenario();
  assert.match(linea(correr(e), 'copias-kit'), /^✓ copias-kit · ninguno de los 0 repos/);
  fs.mkdirSync(path.join(e.proyectos, 'beta-p', '.claude', 'skills', 'arquitecto'), { recursive: true });
  fs.mkdirSync(path.join(e.proyectos, 'gama-p', '.claude', 'skills', 'arquitecto-skills'), { recursive: true });
  fs.mkdirSync(path.join(e.proyectos, 'delta-p', '.claude', 'skills', 'inicio'), { recursive: true });
  rojo(e, 'copias-kit', '⚠', /2 copias de las skills globales dentro de proyectos · beta-p\/\.claude\/skills\/arquitecto, gama-p\/\.claude\/skills\/arquitecto-skills · borralas/);
  kitPc(e, { proyectos: null });
  rojo(e, 'copias-kit', '⚠', /NO VERIFICADO: sin la carpeta de proyectos/);
});

test('frenos-vencidos: un frenos.quitados con hasta: pasado ⚠ "¿lo restauro o lo hago permanente?"; siempre y futuro ✓', () => {
  const e = escenario();
  assert.match(linea(correr(e), 'frenos-vencidos'), /^✓ frenos-vencidos · 3 frenos quitados, ninguno vencido$/);
  fs.writeFileSync(path.join(e.repo, '.claude', 'kit.md'), FICHA.replace('hasta: 2099-01-01', 'hasta: 2020-01-01'));
  rojo(e, 'frenos-vencidos', '⚠', /1 freno quitado vencido · pregunta:borrar-datos-reales \(venció 2020-01-01\) · ¿lo restauro o lo hago permanente\?/);
  fs.rmSync(path.join(e.repo, '.claude', 'kit.md'));
  assert.ok(linea(correr(e), 'frenos-vencidos').startsWith('✓'));
});

test('regla-tamano: el CLAUDE.md sin la sección (o sin CLAUDE.md) → ⚠ "el actualizador no toca el CLAUDE.md"', () => {
  const e = escenario();
  assert.ok(linea(correr(e), 'regla-tamano').startsWith('✓'));
  fs.writeFileSync(path.join(e.repo, 'CLAUDE.md'), '# CLAUDE.md\n\n## Autonomía\n');
  rojo(e, 'regla-tamano', '⚠', /no trae la sección "El tamaño del pedido" · el actualizador no toca el CLAUDE\.md: pegala del molde/);
  fs.rmSync(path.join(e.repo, 'CLAUDE.md'));
  rojo(e, 'regla-tamano', '⚠', /no tiene CLAUDE\.md/);
});

test('D8r.4 S, tope-skills: una skill del kit que pasa su tope por la zona propia → un ⚠ por skill con cuánto, nunca ✗', () => {
  const e = escenario();
  const skill = (n) => path.join(e.repo, '.claude', 'skills', n, 'SKILL.md');
  // sin skills: ✓
  assert.match(linea(correr(e), 'tope-skills'), /^✓ tope-skills · el repo no trae/);
  // las del molde tal cual: ✓ (caben)
  for (const n of ['cierre', 'inicio', 'tramo']) fs.cpSync(path.join(MOLDE, 'skills', n), path.dirname(skill(n)), { recursive: true, filter: (s) => !s.endsWith('.test.cjs') });
  assert.match(linea(correr(e), 'tope-skills'), /^✓ tope-skills · las 3 skills del kit del repo caben en su tope/);
  // lo propio adentro de la zona: cierre a 8.975 B y tramo a 9.179 (los de Hermes) → dos ⚠, sale 0
  const enLaZona = (n, total) => {
    const t = fs.readFileSync(skill(n), 'utf8').replace(/\r\n/g, '\n');
    const i = t.indexOf('<!-- kit:propio -->\n') + '<!-- kit:propio -->\n'.length;
    fs.writeFileSync(skill(n), `${t.slice(0, i)}${'p'.repeat(total - Buffer.byteLength(t) - 1)}\n${t.slice(i)}`);
  };
  enLaZona('cierre', 8975);
  enLaZona('tramo', 9179);
  // una skill propia del proyecto (sin marcas), grande: no tiene tope
  fs.mkdirSync(path.join(e.repo, '.claude', 'skills', 'mia'));
  fs.writeFileSync(skill('mia'), 'x'.repeat(20000));
  const r = correr(e);
  assert.equal(r.codigo, 0, r.out);
  const ls = r.lineas.filter((l) => / tope-skills · /.test(l));
  assert.deepEqual(ls, [
    '⚠ tope-skills · cierre: 8975 B, 975 de más por su zona propia (tope 8000) · mové a un anexo lo propio que no hace falta siempre, nunca lo de producción',
    '⚠ tope-skills · tramo: 9179 B, 1179 de más por su zona propia (tope 8000) · mové a un anexo lo propio que no hace falta siempre, nunca lo de producción',
  ]);
  assert.match(r.out, /doctor · todo bien · 2 avisos · 0 cosas a arreglar · 29 chequeos/);
  // la parte del kit pasa el tope (afuera de la zona): ⚠ distinto, tampoco ✗
  fs.appendFileSync(skill('inicio'), 'k'.repeat(8700));
  const k = correr(e);
  assert.equal(k.codigo, 0, k.out);
  assert.ok(k.lineas.some((l) => /^⚠ tope-skills · inicio: \d+ B, pasa su tope \(8600\) sin contar su zona propia/.test(l)), k.out);
  assert.ok(!k.lineas.some((l) => /^✗ tope-skills/.test(l)));
});

// ================================================================ criterio 7: el inventario de frenos
const FL = require(path.join(MOLDE, 'hooks', 'lib', 'frenos-log.cjs'));
const T0 = Date.UTC(2026, 9, 28, 15, 0, 0);
const MIN = 60000;
function anotar(e, filas) {
  const txt = filas.map(([min, id, detalle, rama]) => `${FL.renglon({ id, herramienta: 'Bash', detalle, rol: 'obrero', rama: rama || 'main' }, new Date(T0 + min * MIN))}\n`).join('');
  fs.writeFileSync(path.join(e.repo, '.claude', 'frenos.log'), txt);
}
const inventarioDe = (r) => r.lineas.filter((l) => l.startsWith('inventario · '));

test('inventario: la clase sale del id; una pregunta que frenó 3 veces → molestó 3; las 5 de fábrica salen aunque no hayan frenado', () => {
  const e = escenario();
  anotar(e, [[0, 'pregunta:plata', 'a'], [1, 'pregunta:plata', 'a'], [2, 'pregunta:plata', 'b'], [3, 'hook:sensible/deploy', 'x'], [4, 'candado:raiz', 'docs/a.md']]);
  const r = correr(e);
  const inv = inventarioDe(r);
  assert.ok(inv.includes('inventario · pregunta:plata · pregunta · frenó 3 · molestó 3'), inv.join('\n'));
  assert.ok(inv.includes('inventario · hook:sensible/deploy · pregunta · frenó 1 · molestó 1'));
  assert.ok(inv.includes('inventario · candado:raiz · corrector · frenó 1 · molestó 0'));
  for (const id of ['borrar-datos-reales', 'claves', 'release', 'sale-afuera']) assert.ok(inv.includes(`inventario · pregunta:${id} · pregunta · frenó 0 · molestó 0`), id);
  const ids = inv.map((l) => l.split(' · ')[1]);
  assert.deepEqual(ids, [...ids].sort(), 'ordenadas por id');
  assert.equal(r.codigo, 0, 'el inventario nunca cambia la salida');
  assert.ok(!inv.some((l) => /\d{4}-\d{2}-\d{2}|\d\d:\d\d/.test(l)), 'sin fechas ni horas');
});

test('inventario: un corrector repetido a los 5 min sobre el mismo detalle → molestó 1; a los 20 min → molestó 0; otro detalle o otra rama → 0', () => {
  const e = escenario();
  anotar(e, [
    [0, 'hook:git-seguro/stash', 'git stash'], [5, 'hook:git-seguro/stash', 'git stash'],
    [0, 'hook:git-seguro/reset-hard', 'git reset --hard'], [20, 'hook:git-seguro/reset-hard', 'git reset --hard'],
    [0, 'hook:git-seguro/clean-f', 'uno'], [5, 'hook:git-seguro/clean-f', 'otro'],
    [0, 'candado:raiz', 'docs/a.md', 'main'], [5, 'candado:raiz', 'docs/a.md', 'otra'],
    [0, 'hook:git-seguro/push-force', 'push'], [10, 'hook:git-seguro/push-force', 'push'],
  ]);
  const inv = inventarioDe(correr(e));
  assert.ok(inv.includes('inventario · hook:git-seguro/stash · corrector · frenó 2 · molestó 1'), inv.join('\n'));
  assert.ok(inv.includes('inventario · hook:git-seguro/reset-hard · corrector · frenó 2 · molestó 0'));
  assert.ok(inv.includes('inventario · hook:git-seguro/clean-f · corrector · frenó 2 · molestó 0'));
  assert.ok(inv.includes('inventario · candado:raiz · corrector · frenó 2 · molestó 0'));
  assert.ok(inv.includes('inventario · hook:git-seguro/push-force · corrector · frenó 2 · molestó 1'), 'exactamente 10 min cuenta (≤ 10)');
});

test('inventario: una ask propia del settings del repo → su línea (las del molde no); sin frenos.log → "sin frenadas"; sin ficha → nada', () => {
  const e = escenario();
  fs.writeFileSync(path.join(e.repo, '.claude', 'settings.json'), JSON.stringify({ permissions: { ask: ['Bash(node .claude/scripts/cambios.cjs aprobar:*)', 'PowerShell(node .claude/scripts/cambios.cjs aprobar:*)', 'Bash(npm publish:*)'] } }));
  const inv = inventarioDe(correr(e));
  assert.deepEqual(inv, ['inventario · sin frenadas', 'inventario · ask propia · Bash(npm publish:*) · no está en las 5 de A: ¿pregunta o corrector?']);
  fs.rmSync(path.join(e.repo, '.claude', 'kit.md'));
  assert.deepEqual(inventarioDe(correr(e)), []);
  assert.deepEqual(inventarioDe(correr(e, { cwd: e.home })), []);
});

// ================================================================ criterio 6: dos corridas iguales sobre una copia de alfa con un frenos.log
test('dos corridas seguidas sobre una copia de alfa (con un frenos.log de prueba) dan la misma salida byte a byte', (t) => {
  const comun = git(__dirname, 'rev-parse', '--path-format=absolute', '--git-common-dir');
  const alfa = path.join(path.dirname(path.dirname(comun.stdout.trim())), 'vibe-kit-pruebas', 'remotos', 'alfa.git');
  if (comun.status !== 0 || !fs.existsSync(alfa)) return t.skip(`no está ${alfa} (corré pruebas/rehacer.sh)`);
  const e = escenario();
  const copia = path.join(nuevaCarpeta('copia-alfa'), 'alfa');
  const c = git(RAIZ_TMP, 'clone', '-q', alfa, copia);
  assert.equal(c.status, 0, c.stderr);
  e.repo = copia;
  assert.ok(fs.existsSync(path.join(copia, '.claude', 'kit.md')), 'alfa trae su ficha');
  anotar(e, [[0, 'pregunta:claves', 'gh secret set'], [1, 'pregunta:claves', 'gh secret set'], [0, 'hook:git-seguro/stash', 'git stash'], [3, 'hook:git-seguro/stash', 'git stash']]);
  const a = correr(e);
  const b = correr(e);
  assert.equal(a.out, b.out);
  assert.equal(a.codigo, b.codigo);
  assert.ok(inventarioDe(a).includes('inventario · hook:git-seguro/stash · corrector · frenó 2 · molestó 1'), a.out);
  assert.equal(a.lineas.filter((l) => /^[✓✗⚠] /.test(l)).length, 29);
});

// ================================================================ SPEC-paquete-8c: h10, u4 (vecinos) y p1 (a) (locks)

test('h10 (8c): la salida de Juan — "2.1.252 (Claude Code)" se lee 2.1.252; con el claude de npm (claude de sh + claude.cmd) se corre el .cmd y el ✗ dice que la terminal está atrás', () => {
  assert.deepEqual(D.version('2.1.252 (Claude Code)'), [2, 1, 252]);
  assert.deepEqual(D.version('2.1.252 (Claude Code)\r\n'), [2, 1, 252]);
  const e = escenario();
  sacarFalso(e.bin, 'claude');
  // lo que deja `npm i -g @anthropic-ai/claude-code` en Windows: los tres juntos en la misma carpeta (en otro SO, el de sh solo)
  fs.writeFileSync(path.join(e.bin, 'claude'), '#!/bin/sh\necho "2.1.252 (Claude Code)"\n', { mode: 0o755 });
  if (WIN) {
    fs.writeFileSync(path.join(e.bin, 'claude.cmd'), '@echo off\r\n@echo 2.1.252 (Claude Code)\r\n');
    fs.writeFileSync(path.join(e.bin, 'claude.ps1'), 'Write-Output "2.1.252 (Claude Code)"\r\n');
    assert.equal(path.basename(D.buscarEnPath('claude', entorno(e))), 'claude.cmd', 'el de sh sin extensión no se corre en Windows');
    assert.equal(path.basename(D.buscarEnPath('claude.cmd', entorno(e))), 'claude.cmd', 'un nombre con extensión se busca tal cual');
  }
  fs.mkdirSync(path.join(e.home, '.vscode', 'extensions', 'anthropic.claude-code-2.1.316-win32-x64'), { recursive: true });
  const l = linea(rojo(e, 'claude-code', '✗', /2\.1\.252 \(terminal\) < 2\.1\.295.*encontradas: 2\.1\.316 \(extensión de VS Code\), 2\.1\.252 \(terminal\).*terminal: claude update/), 'claude-code');
  assert.doesNotMatch(l, /no dio su versión/);
});

// Un repo con su padre propio (los gate-* son solo los de la prueba) y un commit en main.
function escenarioConPadre() {
  const e = escenario();
  const padre = nuevaCarpeta('padre');
  const repo = path.join(padre, 'proyecto');
  fs.renameSync(e.repo, repo);
  e.repo = repo;
  // el commit de armado sin los .githooks/ del escenario (sin rama por defecto todavía, el candado lo frena: no es lo que se prueba)
  const c = ['-c', 'user.name=t', '-c', 'user.email=t@t', '-c', `core.hooksPath=${path.join(padre, 'sin-hooks')}`];
  for (const a of [['checkout', '-q', '-b', 'main'], ['add', '-A'], [...c, 'commit', '-q', '-m', 'base']]) {
    const r = git(repo, ...a);
    assert.equal(r.status, 0, `${a.join(' ')}: ${r.stderr}`);
  }
  return { e, padre };
}

test('u4 (8c, crit. 4): vecinos — un worktree mezclado en ../ y un gate de datos → un ⚠ por cosa (git worktree remove solo para el mezclado), nunca ✗, sale 0 y no borra', () => {
  const { e, padre } = escenarioConPadre();
  assert.equal(git(e.repo, 'worktree', 'add', '-q', '-b', 'vieja', path.join(padre, 'proyecto-vieja'), 'main').status, 0);
  fs.mkdirSync(path.join(padre, 'gate-candados'));
  const antes = fs.readdirSync(padre).sort();
  const r = correr(e);
  assert.equal(r.codigo, 0, r.out);
  const ls = r.lineas.filter((l) => / vecinos · /.test(l));
  assert.equal(ls.length, 3, ls.join('\n'));
  assert.ok(ls.every((l) => l.startsWith('⚠ vecinos · ')));
  assert.match(ls[0], /^⚠ vecinos · fuera del repo: 1 worktree \(1 ya mezclado\) y 1 carpeta gate-\* en .* · lo decide el dueño, uno por uno \(el doctor no borra nada\)$/);
  assert.match(ls[1], /proyecto-vieja · vieja · mezclada \(ya está en main\): se puede borrar con git worktree remove "/);
  assert.match(ls[2], /gate-candados · datos, no un gate: no tocar$/);
  assert.deepEqual(fs.readdirSync(padre).sort(), antes);
  assert.match(git(e.repo, 'worktree', 'list').stdout, /proyecto-vieja/);
});

test('p1 (a) (8c): locks — un package-lock.json al que le falta una dependencia → ⚠ locks con el arreglo, nunca ✗, sale 0; al día → ✓', () => {
  const e = escenario();
  fs.writeFileSync(path.join(e.repo, 'package.json'), '{"name":"x","dependencies":{"openai":"^4.104.0","express":"^4.18.0"}}\n');
  fs.writeFileSync(path.join(e.repo, 'package-lock.json'), '{"lockfileVersion":3,"packages":{"":{"dependencies":{"express":"^4.18.0"}}}}\n');
  const r = correr(e);
  assert.equal(r.codigo, 0, r.out);
  assert.equal(linea(r, 'locks'), '⚠ locks · lock atrasado: package-lock.json — falta openai: regeneralo en el proyecto (`npm install`) y commitealo; sin eso, el comando-setup falla y la flota no puede probar tus tests');
  fs.writeFileSync(path.join(e.repo, 'package-lock.json'), '{"lockfileVersion":3,"packages":{"":{"dependencies":{"express":"^4.18.0","openai":"^4.104.0"}}}}\n');
  assert.match(linea(correr(e), 'locks'), /^✓ locks · /);
});

test('8d C2.3 (crit. C2): automode — un repo cuya ficha vigente publica y la PC no lo autorizó → ⚠', () => {
  const e = escenario();
  const bare = path.join(e.proyectos, '..', `tienda-${Date.now()}.git`);
  const d = path.join(e.proyectos, 'tienda');
  const c = (cwd, ...a) => assert.equal(git(cwd, '-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'core.autocrlf=false', ...a).status, 0, a.join(' '));
  c(e.proyectos, 'init', '-q', '--bare', '-b', 'main', bare);
  fs.mkdirSync(path.join(d, '.claude'), { recursive: true });
  fs.writeFileSync(path.join(d, 'pub.cjs'), 'x\n');
  fs.writeFileSync(path.join(d, '.claude', 'kit.md'), '---\nkit: 3.0.0\nnivel: estandar\nvars:\n  proyecto: tienda\nautorizado:\n  publicar: {comando: "node pub.cjs", humo: "node pub.cjs"}\n---\n');
  c(d, 'init', '-q', '-b', 'main');
  c(d, 'add', '-A');
  c(d, 'commit', '-qm', 'i');
  c(d, 'remote', 'add', 'origin', bare);
  c(d, 'push', '-q', 'origin', 'main');
  c(d, 'fetch', '-q', 'origin');
  const gen = P.generarAutoMode(e.proyectos).entradas;
  kitPc(e, { autoMode: gen });
  const s = leerSettings(e);
  s.autoMode = { environment: [P.DEFAULTS, ...gen] };
  escribirSettings(e, s);
  rojo(e, 'automode', '⚠', /tienda publica y esta PC no lo autorizó: la noche no publica ahí/);
  const [c0] = P.quePublican(e.proyectos);
  assert.ok(c0 && c0.proyecto === 'tienda');
});

test('8d C4 (35b, R8, R20): un alias de WindowsApps (py.exe: stat falla, lstat no) cuenta como encontrado; nada dice "corregilo a mano"', () => {
  const dir = WIN ? 'C:\\Users\\x\\AppData\\Local\\Microsoft\\WindowsApps' : '/c/Users/x/AppData/Local/Microsoft/WindowsApps';
  const alias = path.join(dir, WIN ? 'py.exe' : 'py');
  const fsx = { __win: true, statSync: () => { const e = new Error('EACCES'); e.code = 'EACCES'; throw e; }, lstatSync: (p) => { if (p !== alias) throw new Error('ENOENT'); return {}; } };
  assert.equal(D.buscarEnPath('py', { PATH: dir, PATHEXT: '.EXE' }, fsx), alias);
  assert.equal(D.existePrograma(path.join(RAIZ_TMP, 'otro', 'py.exe'), { __win: true, statSync: fsx.statSync, lstatSync: () => ({}) }), false, 'fuera de WindowsApps, un lstat solo no alcanza');
  for (const f of ['doctor.cjs', 'preparar-pc.cjs']) assert.doesNotMatch(fs.readFileSync(path.join(__dirname, f), 'utf8'), /corregilo a mano/, f);
});
