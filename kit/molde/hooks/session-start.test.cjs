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
function correr(hook, entrada, o = {}) {
  const home = o.home || carpeta('home');
  const env = { ...process.env, HOME: home, USERPROFILE: home, ...(o.env || {}) };
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

test('buscarBash: en Windows no elige el bash de WSL', () => {
  const b = ss.buscarBash();
  if (process.platform === 'win32') {
    assert.ok(!/system32|windowsapps/i.test(b), b);
    assert.match(b, /bash\.exe$/i);
    assert.ok(fs.existsSync(b), b);
  } else assert.equal(b, 'bash');
});
