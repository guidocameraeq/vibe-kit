'use strict';
// Pruebas de session-start.cjs (el hook entero, corrido como lo corre la plataforma: node, JSON por stdin).
// Corren con: node --test "kit/**/*.test.cjs". Repos temporales armados acá, con el hook instanciado en .claude/hooks/
// (sin los *.test.cjs, como dice "Cómo se instancia el molde"); identidad y fechas fijas; sin la configuración de git de la PC.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-ss-'));
const GLOBAL = path.join(TMP, 'gitconfig-vacio');
fs.writeFileSync(GLOBAL, '');
process.env.GIT_CONFIG_GLOBAL = GLOBAL;
process.env.GIT_CONFIG_NOSYSTEM = '1';

const MOLDE_HOOKS = __dirname;
const ss = require('./session-start.cjs');

test.after(() => fs.rmSync(TMP, { recursive: true, force: true }));

// ---------------------------------------------------------------- ayudantes

const RE_HUELLA = /^inyectado: \d{1,3}(\.\d{3})* de 9\.700$/;
const FECHA = '2026-10-01T12:00:00-03:00';
let n = 0;
const carpeta = (nombre = 'r') => {
  const d = path.join(TMP, `${nombre}${n++}`);
  fs.mkdirSync(d, { recursive: true });
  return d;
};
function g(cwd, ...args) {
  const r = spawnSync('git', ['-c', 'user.name=Prueba', '-c', 'user.email=prueba@ejemplo.invalid', ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, GIT_AUTHOR_DATE: FECHA, GIT_COMMITTER_DATE: FECHA },
  });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}
function escribir(d, rel, texto) {
  const p = path.join(d, ...rel.split('/'));
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, texto);
}
function commit(d, archivos, msg = 'c') {
  for (const [rel, texto] of Object.entries(archivos)) {
    escribir(d, rel, texto);
    g(d, 'add', '--', rel);
  }
  g(d, 'commit', '-q', '-m', msg);
}
// Copia el hook del molde a <d>/.claude/hooks/ sin las pruebas.
function instanciar(d) {
  const destino = path.join(d, '.claude', 'hooks');
  const copiar = (de, a) => {
    fs.mkdirSync(a, { recursive: true });
    for (const e of fs.readdirSync(de, { withFileTypes: true })) {
      if (e.isDirectory()) copiar(path.join(de, e.name), path.join(a, e.name));
      else if (e.name.endsWith('.cjs') && !e.name.endsWith('.test.cjs')) fs.copyFileSync(path.join(de, e.name), path.join(a, e.name));
    }
  };
  copiar(MOLDE_HOOKS, destino);
  return path.join(destino, 'session-start.cjs');
}
const handoff = (marca = 'H', extra = '') =>
  `# Handoff — ${marca}\n\n## Estado\n- Rama · entorno: main · local\n\n## Próximo paso\n${marca}-paso\n\n## Bloqueos\n- no\n\n## Te espera\n- nada\n\n## En curso\n- nada\n\n## Contexto\n- ${marca}-contexto\n${extra}`;
const fichaKit = (kit = '2.4.3') => `---\nkit: ${kit}\nnivel: liviano\nvars:\n  proyecto: px\n---\n`;
const FICHA_ROTA = '---\nkit: 2.4.3\nnivel: liviano\nvars:\n  proyecto: x\ncolorcito:\n\ta: b\n---\n';

function repoCon(archivos) {
  const d = carpeta();
  g(d, 'init', '-q', '-b', 'main');
  commit(d, { '.gitignore': '/.claude/hooks/\n/.claude/worktrees/\n', ...archivos });
  return { d, hook: instanciar(d) };
}

// correr(hook, entrada, {env, cwd, previo}) → { codigo, out, lineas }
// El plazo del hook (10 s) se estira a 10 min: con la PC cargada estas pruebas no pueden depender de su velocidad. Las del
// plazo lo achican con o.env.
function correr(hook, entrada, o = {}) {
  const home = o.home || carpeta('home');
  const env = { ...process.env, HOME: home, USERPROFILE: home, KIT_PLAZO_ARRANQUE_MS: '600000', ...(o.env || {}) };
  if (o.path !== undefined) {
    for (const k of Object.keys(env)) if (k.toLowerCase() === 'path') delete env[k];
    env.PATH = o.path;
  }
  const args = (o.previo ? ['-r', o.previo] : []).concat([hook]);
  const r = spawnSync(process.execPath, args, {
    input: typeof entrada === 'string' ? entrada : JSON.stringify(entrada),
    cwd: o.cwd || TMP,
    env,
    encoding: 'utf8',
    timeout: 60000,
  });
  const out = r.stdout || '';
  const sinFinal = out.replace(/\n$/, '');
  return { codigo: r.status, out: sinFinal, lineas: sinFinal.split('\n'), stderr: r.stderr };
}
function chequearHuella(res) {
  assert.equal(res.codigo, 0);
  const ult = res.lineas[res.lineas.length - 1];
  assert.match(ult, RE_HUELLA);
  assert.ok(res.out.length <= 9700, `total ${res.out.length}`);
  const nTexto = Number(/^inyectado: ([\d.]+) /.exec(ult)[1].replace(/\./g, ''));
  assert.equal(nTexto, res.out.length - ult.length);
}

// ---------------------------------------------------------------- criterio 3, por el hook

test('criterio 3 (el hook): handoff de 20 KB → CORTADO primero, ≤ 9.700, huella exacta, salida 0', () => {
  const extra = Array.from({ length: 500 }, (_, i) => `- relleno ${i} con tildes áéíóú`).join('\n');
  const { d, hook } = repoCon({ 'docs/SESSION_HANDOFF.md': handoff('H', extra) });
  const r = correr(hook, { cwd: d, session_id: 'cr3' });
  assert.ok(r.lineas[0].startsWith('CORTADO: el handoff — leé el resto en docs/SESSION_HANDOFF.md'));
  assert.ok(r.out.includes('H-paso'));
  chequearHuella(r);
});

// ---------------------------------------------------------------- criterio 8: la marca de sesión

test('criterio 8: la marca queda en el git-dir propio, con fecha nueva; también en un worktree', () => {
  const { d, hook } = repoCon({ 'docs/SESSION_HANDOFF.md': handoff() });
  let r = correr(hook, { cwd: d, session_id: 'abc-123-DEF' });
  chequearHuella(r);
  const marca = path.join(d, '.git', 'kit-sesiones', 'abc-123-DEF');
  assert.ok(fs.existsSync(marca));
  const vieja = new Date('2020-01-01T00:00:00Z');
  fs.utimesSync(marca, vieja, vieja);
  correr(hook, { cwd: d, session_id: 'abc-123-DEF' });
  assert.ok(fs.statSync(marca).mtimeMs > vieja.getTime() + 1000);

  g(d, 'worktree', 'add', '-q', '-b', 'worktree-w1', '.claude/worktrees/w1', 'main');
  const wt = path.join(d, '.claude', 'worktrees', 'w1');
  r = correr(hook, { cwd: wt, session_id: 'sesion-del-worktree' });
  chequearHuella(r);
  assert.ok(fs.existsSync(path.join(d, '.git', 'worktrees', 'w1', 'kit-sesiones', 'sesion-del-worktree')));
  assert.ok(!fs.existsSync(path.join(d, '.git', 'kit-sesiones', 'sesion-del-worktree')));
  // El cwd puede ser una subcarpeta del worktree.
  fs.mkdirSync(path.join(wt, 'src'), { recursive: true });
  correr(hook, { cwd: path.join(wt, 'src'), session_id: 'desde-sub' });
  assert.ok(fs.existsSync(path.join(d, '.git', 'worktrees', 'w1', 'kit-sesiones', 'desde-sub')));
});

test('criterio 8: un session_id fuera de [A-Za-z0-9-] no deja marca (y el hook sigue)', () => {
  const { d, hook } = repoCon({ 'docs/SESSION_HANDOFF.md': handoff() });
  for (const id of ['../afuera', 'a/b', 'a b', 'a_b', 'x.y', '', 'á', 7, null]) {
    const r = correr(hook, { cwd: d, session_id: id });
    chequearHuella(r);
  }
  correr(hook, { cwd: d });
  assert.ok(!fs.existsSync(path.join(d, '.git', 'kit-sesiones')));
  assert.ok(!fs.existsSync(path.join(d, '.git', 'afuera')));
});

test('dejarMarca: la regla del id, sin git-dir no hace nada', () => {
  const gd = carpeta('gitdir');
  assert.equal(ss.dejarMarca({ session_id: 'a'.repeat(129) }, gd), null);
  assert.equal(ss.dejarMarca({ session_id: 'ok-1' }, null), null);
  assert.equal(ss.dejarMarca({ session_id: 'ok-1' }, gd), path.join(gd, 'kit-sesiones', 'ok-1'));
  assert.ok(ss.RE_SESION.test('A-z-0'));
  assert.ok(!ss.RE_SESION.test('a\nb'));
});

// ---------------------------------------------------------------- criterio 6: las fallas, todas con salida 0

test('criterio 6 (el hook): ficha rota → arriba, y el resto', () => {
  const { d, hook } = repoCon({ '.claude/kit.md': FICHA_ROTA, 'docs/SESSION_HANDOFF.md': handoff() });
  const r = correr(hook, { cwd: d, session_id: 'fr' });
  assert.equal(r.lineas[1], 'ficha rota: .claude/kit.md:7 — corré doctor');
  assert.ok(r.out.includes('H-paso'));
  chequearHuella(r);
});

test('criterio 6: error interno forzado → la línea de error, el handoff crudo y la huella', () => {
  const extra = Array.from({ length: 500 }, (_, i) => `- relleno ${i} con tildes áéíóú`).join('\n');
  const { d, hook } = repoCon({ 'docs/SESSION_HANDOFF.md': handoff('H', extra) });
  const previo = path.join(carpeta('previo'), 'forzar.cjs');
  fs.writeFileSync(previo, `require(${JSON.stringify(path.join(path.dirname(hook), 'lib', 'inyeccion.cjs'))}).armar = () => { throw new Error('forzado'); };\n`);
  const r = correr(hook, { cwd: d, session_id: 'err-1' }, { previo });
  assert.equal(r.lineas[0], 'hook de arranque: error interno — corré doctor');
  assert.ok(r.out.includes('H-paso'));
  assert.ok(r.out.includes('… (CORTADO: sigue en docs/SESSION_HANDOFF.md)'));
  assert.ok(!r.out.includes('relleno 499'));
  const crudo = r.lineas.slice(2, -2).join('\n');
  assert.ok(Buffer.byteLength(crudo) <= 5000, `${Buffer.byteLength(crudo)}`);
  assert.ok(Buffer.byteLength(crudo) > 4900, `aprovecha los 5.000: ${Buffer.byteLength(crudo)}`);
  // Cortado en renglón entero: cada renglón es uno del handoff, sin uno a medias ni una letra partida.
  const originales = new Set(handoff('H', extra).split('\n'));
  for (const l of r.lineas.slice(2, -2)) assert.ok(originales.has(l), `renglón a medias: ${JSON.stringify(l)}`);
  chequearHuella(r);
  // La marca se deja igual.
  assert.ok(fs.existsSync(path.join(d, '.git', 'kit-sesiones', 'err-1')));
});

test('criterio 6: error interno sin handoff → lo dice, huella y salida 0', () => {
  const d = carpeta('vacio');
  const r = ss.deEmergencia({ cwd: d });
  const l = r.split('\n');
  assert.equal(l[0], 'hook de arranque: error interno — corré doctor');
  assert.equal(l[1], '(no se pudo leer docs/SESSION_HANDOFF.md)');
  assert.match(l[2], RE_HUELLA);
});

test('criterio 6 (el hook): sin remoto ni ficha → entero', () => {
  const { d, hook } = repoCon({ 'docs/SESSION_HANDOFF.md': handoff(), 'docs/TODO.md': '# TODO\n' });
  const r = correr(hook, { cwd: d, session_id: 's1' });
  assert.equal(r.lineas[1], 'sin ficha: valen los frenos de fábrica');
  for (const t of ['H-paso', '=== TODO', '=== git ===', 'Recordatorio: decí /inicio']) assert.ok(r.out.includes(t), t);
  chequearHuella(r);
});

test('criterio 6 (el hook): sin git — carpeta que no es repo, y PC sin git', () => {
  const d = carpeta('nogit');
  escribir(d, 'docs/SESSION_HANDOFF.md', handoff());
  const hook = instanciar(d);
  let r = correr(hook, { cwd: d, session_id: 'ng' });
  assert.ok(r.out.includes('sin git: esta carpeta no es un repo'));
  chequearHuella(r);
  const { d: d2, hook: h2 } = repoCon({ 'docs/SESSION_HANDOFF.md': handoff() });
  r = correr(h2, { cwd: d2, session_id: 'ng2' }, { path: path.dirname(process.execPath) });
  assert.ok(r.out.includes('sin git: '));
  assert.ok(r.out.includes('H-paso'));
  chequearHuella(r);
});

test('entrada rota o vacía: usa el cwd del proceso y sale con 0', () => {
  const { d, hook } = repoCon({ 'docs/SESSION_HANDOFF.md': handoff() });
  for (const entrada of ['no es json', '', '[1,2]', '42']) {
    const r = correr(hook, entrada, { cwd: d });
    assert.ok(r.out.includes('H-paso'), JSON.stringify(entrada));
    chequearHuella(r);
  }
});

// ---------------------------------------------------------------- criterio 7, por el hook (HOME)

test('criterio 7 (el hook): ~/.claude/VERSION mayor, menor o ausente', () => {
  const { d, hook } = repoCon({ '.claude/kit.md': fichaKit('2.4.3'), 'docs/SESSION_HANDOFF.md': handoff() });
  const conVersion = (v) => {
    const home = carpeta('home');
    if (v) escribir(home, '.claude/VERSION', v + '\n');
    return correr(hook, { cwd: d, session_id: 'v' }, { home }).lineas[0];
  };
  assert.ok(conVersion('2.5.0').includes('kit 2.4.3 · hay kit nuevo: 2.5.0'));
  assert.ok(conVersion('2.4.2').includes('kit 2.4.3 · esta PC está atrás: actualizate'));
  const nada = conVersion(null);
  assert.ok(nada.includes('kit 2.4.3 · nivel liviano'));
  assert.ok(!nada.includes('hay kit nuevo') && !nada.includes('atrás'));
});

// ---------------------------------------------------------------- lo propio

// El bash de Git for Windows (o el del sistema): sin bash, las pruebas que lo necesitan se saltean.
const BASH = ss.buscarBash();
const hayBash = spawnSync(BASH, ['-c', 'echo ok'], { encoding: 'utf8', timeout: 20000 }).stdout === 'ok\n';

test('lo propio: el hermano session-start.propio.sh corre con bash, desde la raíz, y sale antes de la huella', { skip: !hayBash && 'no hay bash' }, () => {
  const { d, hook } = repoCon({ 'docs/SESSION_HANDOFF.md': handoff() });
  fs.writeFileSync(path.join(path.dirname(hook), 'session-start.propio.sh'), 'echo "PROPIO-OK en $(basename "$PWD")"\n');
  const r = correr(hook, { cwd: path.join(d, 'docs'), session_id: 'p' });
  assert.equal(r.lineas[r.lineas.length - 2], `PROPIO-OK en ${path.basename(d)}`);
  chequearHuella(r);
});

test('correrPropio: no hay → null; sin bash; código de salida; tiempo', { skip: !hayBash && 'no hay bash' }, () => {
  const d = carpeta('propio');
  const sh = path.join(d, 'p.sh');
  assert.equal(ss.correrPropio(d, BASH, sh), null);
  fs.writeFileSync(sh, 'echo hola\nexit 3\n');
  assert.deepEqual(ss.correrPropio(d, 'bash-que-no-existe-en-ningun-lado', sh), { salida: '', falla: 'sin-bash' });
  assert.deepEqual(ss.correrPropio(d, BASH, sh), { salida: 'hola\n', falla: 'salió con 3' });
  fs.writeFileSync(sh, 'echo bien\n');
  assert.deepEqual(ss.correrPropio(d, BASH, sh), { salida: 'bien\n', falla: null });
});

// ---------------------------------------------------------------- el plazo (E4b)

const git = require('./lib/git.cjs'); // la misma instancia que usa session-start.cjs (libGit)
const quieto = (ms) => () => ms;
function conPlazo(fin, reloj, fn) {
  git.fijarPlazo(fin, reloj);
  try {
    return fn();
  } finally {
    git.fijarPlazo(null);
  }
}

test('plazoDelArranque: 10 s desde el inicio del proceso; la variable de prueba lo cambia si es un entero', () => {
  assert.equal(ss.PLAZO_ARRANQUE, 10000);
  assert.equal(ss.VAR_PLAZO, 'KIT_PLAZO_ARRANQUE_MS');
  assert.equal(ss.plazoDelArranque({}, 1000), 11000);
  assert.equal(ss.plazoDelArranque({ KIT_PLAZO_ARRANQUE_MS: '2500' }, 1000), 3500);
  assert.equal(ss.plazoDelArranque({ KIT_PLAZO_ARRANQUE_MS: '0' }, 1000), 1000);
  assert.equal(ss.plazoDelArranque({ KIT_PLAZO_ARRANQUE_MS: '600000' }, 1000), 601000);
  for (const v of ['abc', '-5', '', '1e3']) assert.equal(ss.plazoDelArranque({ KIT_PLAZO_ARRANQUE_MS: v }, 1000), 11000, v);
  // Sin argumentos: desde el arranque de este proceso (antes de ahora, no después).
  const p = ss.plazoDelArranque({});
  assert.ok(p <= Date.now() + 10000 && p > Date.now() - process.uptime() * 1000 + 9000, String(p));
});

test('el hook con el plazo vencido: ningún git (sin git en el PATH no dice "sin git"), handoff, renglón lento, marca y salida 0', () => {
  const { d, hook } = repoCon({ 'docs/SESSION_HANDOFF.md': handoff(), 'docs/TODO.md': '# TODO\n' });
  const r = correr(hook, { cwd: path.join(d, 'docs'), session_id: 'plazo-vencido' }, { env: { KIT_PLAZO_ARRANQUE_MS: '0' }, path: path.dirname(process.execPath) });
  assert.ok(r.out.includes('git no respondió a tiempo: sin ficha, edades, módulos por rama ni git'), r.out);
  assert.ok(!r.out.includes('sin git:'));
  assert.ok(r.out.includes('H-paso'));
  assert.match(r.lineas[r.lineas.length - 2], /^arranque lento: \d+ consultas? a git salteadas? por tiempo \(corré doctor si se repite\)$/);
  chequearHuella(r);
  // La marca se deja igual, con el git-dir leído del disco.
  assert.ok(fs.existsSync(path.join(d, '.git', 'kit-sesiones', 'plazo-vencido')));
});

test('el hook con el plazo vencido: lo propio no se corre y se dice', () => {
  const { d, hook } = repoCon({ 'docs/SESSION_HANDOFF.md': handoff() });
  const rastro = path.join(d, 'corrio.txt');
  fs.writeFileSync(path.join(path.dirname(hook), 'session-start.propio.sh'), `echo si > "${rastro.split(path.sep).join('/')}"\necho PROPIO\n`);
  const r = correr(hook, { cwd: d, session_id: 'p' }, { env: { KIT_PLAZO_ARRANQUE_MS: '0' } });
  assert.ok(r.out.includes('.claude/hooks/session-start.propio.sh: no terminó a tiempo'));
  assert.ok(!fs.existsSync(rastro));
  chequearHuella(r);
});

test('gitDirPorDisco: la carpeta .git, o el gitdir del archivo .git de un worktree; desde una subcarpeta; fuera de un repo, null', () => {
  const { d } = repoCon({ 'docs/SESSION_HANDOFF.md': handoff() });
  assert.equal(ss.gitDirPorDisco(path.join(d, 'docs')), path.join(d, '.git'));
  g(d, 'worktree', 'add', '-q', '-b', 'worktree-w9', '.claude/worktrees/w9', 'main');
  const wt = path.join(d, '.claude', 'worktrees', 'w9');
  assert.equal(path.resolve(ss.gitDirPorDisco(wt)).toLowerCase(), path.join(d, '.git', 'worktrees', 'w9').toLowerCase());
  assert.equal(ss.gitDirPorDisco(carpeta('fuera')), null);
});

test('correrPropio con plazo: vencido no lo corre ("tiempo"); con poco, lo corta con lo que queda y no con sus 5 s', { skip: !hayBash && 'no hay bash' }, () => {
  const d = carpeta('propio-plazo');
  const sh = path.join(d, 'p.sh');
  const rastro = path.join(d, 'corrio.txt');
  fs.writeFileSync(sh, `echo si > "${rastro.split(path.sep).join('/')}"\necho hola\n`);
  assert.deepEqual(conPlazo(1000, quieto(5000), () => ss.correrPropio(d, BASH, sh)), { salida: '', falla: 'tiempo' });
  assert.ok(!fs.existsSync(rastro));
  // Queda 1 s y duerme 4: sin el plazo terminaría bien (sus 5 s le alcanzan).
  fs.writeFileSync(sh, 'sleep 4\necho tarde\n');
  const r = conPlazo(1000, quieto(0), () => ss.correrPropio(d, BASH, sh));
  assert.equal(r.falla, 'tiempo');
});

test('buscarBash con el plazo vencido: no consulta a git, usa el bash del PATH', () => {
  const b = conPlazo(1000, quieto(5000), () => ss.buscarBash());
  assert.equal(b, 'bash');
});

test('buscarBash: en Windows no elige el bash de WSL', () => {
  const b = ss.buscarBash();
  if (process.platform === 'win32') {
    assert.ok(!/system32|windowsapps/i.test(b), b);
    assert.match(b, /bash\.exe$/i);
    assert.ok(fs.existsSync(b), b);
  } else assert.equal(b, 'bash');
});

// ---------------------------------------------------------------- core.hooksPath y las líneas de F (SPEC-paquete-3 P4.6; crit. 8 y 16)

// El PATH de la PC sin gitleaks, y con un gitleaks "de mentira" (solo se busca el archivo: nunca se corre).
const CLAVE_PATH = Object.keys(process.env).find((k) => k.toLowerCase() === 'path');
const PATH_SIN_GITLEAKS = String(process.env[CLAVE_PATH] || '')
  .split(path.delimiter)
  .filter((d) => d && !['gitleaks', 'gitleaks.exe'].some((x) => fs.existsSync(path.join(d, x))))
  .join(path.delimiter);
const DIR_GITLEAKS = path.join(TMP, 'con-gitleaks');
fs.mkdirSync(DIR_GITLEAKS);
fs.writeFileSync(path.join(DIR_GITLEAKS, process.platform === 'win32' ? 'gitleaks.exe' : 'gitleaks'), '');
const PATH_CON_GITLEAKS = `${DIR_GITLEAKS}${path.delimiter}${PATH_SIN_GITLEAKS}`;
const SETTINGS_MOLDE = fs.readFileSync(path.join(MOLDE_HOOKS, '..', 'settings.json'), 'utf8');
const GITHOOKS = { '.githooks/pre-commit': '#!/bin/sh\n', '.githooks/pre-merge-commit': '#!/bin/sh\n', '.githooks/pre-push': '#!/bin/sh\n', '.githooks/kit-githook.cjs': '\n' };
const lineaDe = (r, prefijo) => r.lineas.find((l) => l.startsWith(prefijo));
const configGit = (d, k) => {
  const x = spawnSync('git', ['config', '--get', k], { cwd: d, encoding: 'utf8' });
  return x.status === 0 ? x.stdout.trim() : null;
};

test('P4.6: core.hooksPath vacío → .githooks una sola vez (la segunda corrida no toca nada); la línea pre-commit lo dice', () => {
  const { d, hook } = repoCon({ 'docs/SESSION_HANDOFF.md': handoff(), '.claude/settings.json': SETTINGS_MOLDE, ...GITHOOKS });
  assert.equal(configGit(d, 'core.hooksPath'), null);
  let r = correr(hook, { cwd: d, session_id: 'hp1' }, { path: PATH_CON_GITLEAKS });
  assert.equal(configGit(d, 'core.hooksPath'), '.githooks');
  assert.equal(configGit(d, 'kit.hooksPathPrevio'), null);
  assert.equal(lineaDe(r, 'pre-commit:'), 'pre-commit: ✅ · core.hooksPath puesto ahora');
  const config = fs.readFileSync(path.join(d, '.git', 'config'), 'utf8');
  r = correr(hook, { cwd: d, session_id: 'hp2' }, { path: PATH_CON_GITLEAKS });
  assert.equal(lineaDe(r, 'pre-commit:'), 'pre-commit: ✅');
  assert.equal(fs.readFileSync(path.join(d, '.git', 'config'), 'utf8'), config, 'la segunda vez no escribe');
  chequearHuella(r);
  // desde un worktree: el mismo valor relativo (vale en cada worktree) y no se vuelve a escribir
  g(d, 'worktree', 'add', '-q', '-b', 'worktree-hp', '.claude/worktrees/hp', 'main');
  const wt = path.join(d, '.claude', 'worktrees', 'hp');
  r = correr(instanciar(wt), { cwd: wt, session_id: 'hp3' }, { path: PATH_CON_GITLEAKS });
  assert.equal(lineaDe(r, 'pre-commit:'), 'pre-commit: ✅');
  assert.equal(fs.readFileSync(path.join(d, '.git', 'config'), 'utf8'), config);
});

test('P4.6: core.hooksPath de otro (husky) no se pierde: va a kit.hooksPathPrevio y apunta a .githooks; la segunda vez, nada', () => {
  const { d, hook } = repoCon({ 'docs/SESSION_HANDOFF.md': handoff(), ...GITHOOKS });
  g(d, 'config', 'core.hooksPath', '.husky/_');
  let r = correr(hook, { cwd: d, session_id: 'hu1' }, { path: PATH_CON_GITLEAKS });
  assert.equal(configGit(d, 'core.hooksPath'), '.githooks');
  assert.equal(configGit(d, 'kit.hooksPathPrevio'), '.husky/_');
  assert.equal(lineaDe(r, 'pre-commit:'), 'pre-commit: ✅ · core.hooksPath puesto ahora; el anterior (".husky/_") queda encadenado');
  r = correr(hook, { cwd: d, session_id: 'hu2' }, { path: PATH_CON_GITLEAKS });
  assert.equal(lineaDe(r, 'pre-commit:'), 'pre-commit: ✅');
  assert.equal(configGit(d, 'kit.hooksPathPrevio'), '.husky/_');
  // husky lo vuelve a pisar en un npm install: el arranque siguiente lo repone y guarda el nuevo previo
  g(d, 'config', 'core.hooksPath', '.husky/otro');
  correr(hook, { cwd: d, session_id: 'hu3' }, { path: PATH_CON_GITLEAKS });
  assert.equal(configGit(d, 'core.hooksPath'), '.githooks');
  assert.equal(configGit(d, 'kit.hooksPathPrevio'), '.husky/otro');
});

test('P4.6: sin .githooks/ no se toca core.hooksPath, y la línea lo dice', () => {
  const { d, hook } = repoCon({ 'docs/SESSION_HANDOFF.md': handoff() });
  const r = correr(hook, { cwd: d, session_id: 'sg' }, { path: PATH_CON_GITLEAKS });
  assert.equal(configGit(d, 'core.hooksPath'), null);
  assert.equal(lineaDe(r, 'pre-commit:'), 'pre-commit: ⚠️ no hay .githooks/ en este repo · corré doctor');
  assert.deepEqual(ss.ponerHooksPath(d), { estado: 'sin-githooks' });
});

test('líneas de F: pre-commit ⚠️ sin gitleaks (se busca el archivo, no se corre) y sin un hook de .githooks/', () => {
  const sinPush = { ...GITHOOKS };
  delete sinPush['.githooks/pre-push'];
  const { d, hook } = repoCon({ 'docs/SESSION_HANDOFF.md': handoff(), ...sinPush });
  const r = correr(hook, { cwd: d, session_id: 'sl' }, { path: PATH_SIN_GITLEAKS });
  assert.equal(lineaDe(r, 'pre-commit:'), 'pre-commit: ⚠️ falta .githooks/pre-push · sin gitleaks en esta PC: corré "preparame esta PC"');
});

test('líneas de F: core.hooksPath que no es .githooks (leído sin el hook) → ⚠️ con el valor', () => {
  const { d } = repoCon({ ...GITHOOKS });
  g(d, 'config', 'core.hooksPath', 'otra/cosa');
  const iny = require('./lib/inyeccion.cjs');
  assert.equal(iny.lineaPreCommit(d, true, undefined, { PATH: DIR_GITLEAKS }), 'pre-commit: ⚠️ core.hooksPath es "otra/cosa" y no .githooks');
  g(d, 'config', '--unset', 'core.hooksPath');
  assert.equal(iny.lineaPreCommit(d, true, undefined, { PATH: DIR_GITLEAKS }), 'pre-commit: ⚠️ core.hooksPath vacío');
  g(d, 'config', 'core.hooksPath', '.githooks');
  assert.equal(iny.lineaPreCommit(d, true, undefined, { PATH: DIR_GITLEAKS }), 'pre-commit: ✅');
  assert.equal(iny.lineaPreCommit(d, true, { estado: 'no-pudo' }, { PATH: DIR_GITLEAKS }), 'pre-commit: ⚠️ no pude poner core.hooksPath · corré doctor');
  assert.equal(iny.lineaPreCommit(d, true, { estado: 'sin-tiempo' }, { PATH: DIR_GITLEAKS }), 'pre-commit: ⚠️ core.hooksPath sin leer (git no respondió a tiempo)');
  assert.equal(iny.lineaPreCommit(d, false, undefined, {}), 'pre-commit: ⚠️ sin git');
});

test('líneas de F: corrector de la PC ✅ solo con un hook registrado bajo /.claude/hooks/kit/ en <home>/.claude/settings.json', () => {
  const { d, hook } = repoCon({ 'docs/SESSION_HANDOFF.md': handoff() });
  const conHome = (settings) => {
    const home = carpeta('home');
    if (settings !== undefined) escribir(home, '.claude/settings.json', typeof settings === 'string' ? settings : JSON.stringify(settings));
    return lineaDe(correr(hook, { cwd: d, session_id: 'pc' }, { home }), 'corrector de la PC:');
  };
  const NO = 'corrector de la PC: ⚠️ no está · pedile al Equipador "instalar hooks por PC"';
  const registro = (ruta) => ({ hooks: { PreToolUse: [{ matcher: 'Bash', hooks: [{ type: 'command', command: 'node', args: [ruta], timeout: 20, onFailure: 'block' }] }] } });
  const barra = String.fromCharCode(92);
  assert.equal(conHome(registro(['C:', 'Users', 'x', '.claude', 'hooks', 'kit', 'secretos.cjs'].join(barra))), 'corrector de la PC: ✅');
  assert.equal(conHome(registro('/home/x/.claude/hooks/kit/secretos.cjs')), 'corrector de la PC: ✅');
  assert.equal(conHome(registro('/home/x/.claude/hooks/otro/secretos.cjs')), NO);
  assert.equal(conHome(undefined), NO);
  assert.equal(conHome('{ roto'), NO);
  assert.equal(conHome({ permissions: { deny: ['Read(/home/x/.claude/hooks/kit/**)'] } }), NO, 'una regla no es un hook registrado');
});

test('líneas de F: barreras de fábrica N de N contra el settings menos frenos.quitados vigentes', () => {
  const { DENY_FABRICA } = require('./lib/fabrica.cjs');
  assert.equal(DENY_FABRICA.length, 9);
  const conSettings = (settings, ficha) => {
    const archivos = { 'docs/SESSION_HANDOFF.md': handoff() };
    if (settings !== null) archivos['.claude/settings.json'] = settings;
    if (ficha) archivos['.claude/kit.md'] = ficha;
    const { d, hook } = repoCon(archivos);
    return lineaDe(correr(hook, { cwd: d, session_id: 'bf' }), 'barreras de fábrica:');
  };
  assert.equal(conSettings(SETTINGS_MOLDE), 'barreras de fábrica: 9 de 9 ✅');
  const s = JSON.parse(SETTINGS_MOLDE);
  s.permissions.deny = s.permissions.deny.filter((x) => x !== 'Read(./**/.env)' && x !== 'Read(~/.ssh/**)');
  assert.equal(conSettings(JSON.stringify(s)), 'barreras de fábrica: 7 de 9 ⚠️ falta Read(./**/.env), Read(~/.ssh/**) · corré doctor');
  const ficha = (hasta) => `---\nkit: 2.4.3\nnivel: liviano\nvars:\n  proyecto: px\nfrenos:\n  quitados:\n    - {id: "deny:Read(./**/.env)", por: "prueba", hasta: ${hasta}}\n---\n`;
  assert.equal(conSettings(JSON.stringify(s), ficha('siempre')), 'barreras de fábrica: 7 de 8 ⚠️ falta Read(~/.ssh/**) · corré doctor');
  s.permissions.deny.push('Read(~/.ssh/**)');
  assert.equal(conSettings(JSON.stringify(s), ficha('siempre')), 'barreras de fábrica: 8 de 8 ✅ (1 quitada en la ficha)');
  assert.equal(conSettings(JSON.stringify(s), ficha('2099-01-01')), 'barreras de fábrica: 8 de 8 ✅ (1 quitada en la ficha)');
  assert.equal(conSettings(JSON.stringify(s), ficha('2020-01-01')), 'barreras de fábrica: 8 de 9 ⚠️ falta Read(./**/.env) · corré doctor', 'vencido: vuelve a contar');
  assert.equal(conSettings(null), 'barreras de fábrica: ⚠️ no hay .claude/settings.json · corré doctor');
  assert.equal(conSettings('{ roto'), 'barreras de fábrica: ⚠️ .claude/settings.json no se lee · corré doctor');
});

test('criterio 16: el arranque imprime las tres líneas de F, después de la cabecera y antes del handoff, y la huella sigue ≤ 9.700', () => {
  const extra = Array.from({ length: 500 }, (_, i) => `- relleno ${i} con tildes áéíóú`).join('\n');
  const { d, hook } = repoCon({ 'docs/SESSION_HANDOFF.md': handoff('H', extra), '.claude/settings.json': SETTINGS_MOLDE, '.claude/kit.md': fichaKit(), ...GITHOOKS });
  const r = correr(hook, { cwd: d, session_id: 'c16' }, { path: PATH_CON_GITLEAKS });
  const i = r.lineas.findIndex((l) => l.startsWith('barreras de fábrica:'));
  assert.deepEqual(r.lineas.slice(i, i + 3), ['barreras de fábrica: 9 de 9 ✅', 'corrector de la PC: ⚠️ no está · pedile al Equipador "instalar hooks por PC"', 'pre-commit: ✅ · core.hooksPath puesto ahora']);
  assert.ok(i > 0 && r.lineas[i + 3] === '' && r.lineas[i + 4].startsWith('=== handoff'), r.lineas.slice(0, i + 5).join('\n'));
  assert.ok(r.lineas[0].startsWith('CORTADO: el handoff'));
  chequearHuella(r);
});

test('P4.6 con el plazo vencido: core.hooksPath no se toca y el arranque sale 0 con su huella', () => {
  const { d, hook } = repoCon({ 'docs/SESSION_HANDOFF.md': handoff(), ...GITHOOKS });
  const r = correr(hook, { cwd: d, session_id: 'hpz' }, { env: { KIT_PLAZO_ARRANQUE_MS: '0' }, path: PATH_CON_GITLEAKS });
  assert.equal(configGit(d, 'core.hooksPath'), null);
  assert.equal(r.codigo, 0);
  chequearHuella(r);
});

test('ponerHooksPath: sin-tiempo con el plazo vencido (y no escribe); no-pudo con el config trabado; puesto; ya', () => {
  const { d } = repoCon({ ...GITHOOKS });
  const git = require('./lib/git.cjs');
  git.fijarPlazo(Date.now() - 1);
  try {
    assert.deepEqual(ss.ponerHooksPath(d), { estado: 'sin-tiempo' });
  } finally {
    git.fijarPlazo(null);
  }
  assert.equal(configGit(d, 'core.hooksPath'), null);
  fs.writeFileSync(path.join(d, '.git', 'config.lock'), '');
  assert.deepEqual(ss.ponerHooksPath(d), { estado: 'no-pudo' });
  fs.rmSync(path.join(d, '.git', 'config.lock'));
  assert.deepEqual(ss.ponerHooksPath(d), { estado: 'puesto', valor: '.githooks', previo: null });
  assert.deepEqual(ss.ponerHooksPath(d), { estado: 'ya', valor: '.githooks' });
});

test('settings.json del molde: session-start en exec, timeout 20 y sin onFailure (el arranque nunca traba: sin node, la sesión arranca sin inyección)', () => {
  const s = JSON.parse(SETTINGS_MOLDE);
  assert.deepEqual(s.hooks.SessionStart, [{ matcher: '', hooks: [{ type: 'command', command: 'node', args: ['${CLAUDE_PROJECT_DIR}/.claude/hooks/session-start.cjs'], timeout: 20 }] }]);
});
