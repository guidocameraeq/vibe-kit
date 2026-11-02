'use strict';
// Pruebas de noche.cjs (SPEC-0 RF-11 y P6.4; delta 5 crit. 16, D5-16; D §9.3-§9.5, §11): me-voy (la marca y el checklist), volvi y
// el despertador. Repos temporales con remoto bare local, sin la config de git de la PC; el transcript del director, falso, con
// CLAUDE_CONFIG_DIR apuntado a un temporal. Corren con: node --test kit/molde/scripts/noche.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-noche-'));
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

const N = require('./noche.cjs');
const uso = require('./contexto.cjs');
const SCRIPT = path.join(__dirname, 'noche.cjs');
const SNIPPET = fs.readFileSync(path.join(__dirname, '..', 'gitignore.snippet'), 'utf8');

let n = 0;
const carpeta = (nombre = 'r') => {
  const d = path.join(TMP, `${nombre}${n++}`);
  fs.mkdirSync(d, { recursive: true });
  return d;
};
function g(cwd, ...args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}
function escribir(d, rel, texto) {
  const p = path.join(d, ...rel.split('/'));
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, texto);
}
function commit(d, archivos, msg = 'c') {
  for (const [rel, texto] of Object.entries(archivos)) escribir(d, rel, texto);
  g(d, 'add', '-A');
  g(d, 'commit', '-q', '-m', msg);
  return g(d, 'rev-parse', 'HEAD');
}
const encargo = (id, apertura, recurso = null) =>
  [
    `# Encargo ${id} · nz · prueba`,
    `- Partida: rama modulo/nz--${id} desde modulo/nz@abcdef1 · 2026-11-02T10:00-03:00`,
    '- Spec: docs/modulos/nz/SPEC.md:1',
    '- Skill: obrero',
    '- Modelo: sonnet · Esfuerzo: low · Por qué: prueba',
    '- Riesgo: bajo · Por qué: prueba',
    `- Apertura: ${apertura}`,
    '- Suscripción: —',
    '## Toca',
    '- src/a.js',
    ...(recurso ? [`- recurso: ${recurso}`] : []),
    '## Alcance',
    '1. algo',
    '## NO SE TOCA',
    '- nada',
    '## AUTORIZADO',
    '- (nada)',
    '## GATE',
    '- (nada)',
    '',
  ].join('\n');
const BIT = 'docs/modulos/nz/bitacora';

// Un proyecto con remoto bare: main; el director de nz (worktree, rama modulo/nz) con tres encargos commiteados y pusheados; el
// obrero 01 con un commit; el 03 ya cerrado (su evidencia mergeada en modulo/nz). Y un transcript del director al `pct` pedido.
function proyecto(o = {}) {
  const bare = carpeta('remoto');
  g(bare, 'init', '-q', '--bare', '-b', 'main');
  const P = carpeta('p');
  g(P, 'init', '-q', '-b', 'main');
  commit(P, { '.gitignore': o.gitignore !== undefined ? o.gitignore : SNIPPET, 'a.txt': 'a\n' }, 'inicio');
  g(P, 'remote', 'add', 'origin', bare);
  g(P, 'push', '-q', '-u', 'origin', 'main');
  const dir = path.join(P, '.claude', 'worktrees', 'modulo--nz');
  g(P, 'worktree', 'add', '-q', '-b', 'modulo/nz', dir);
  commit(dir, {
    [`${BIT}/2026-11-02-encargo-01.md`]: encargo('01', 'director', 'suite'),
    [`${BIT}/2026-11-02-encargo-02.md`]: encargo('02', 'Guido', 'navegador'),
    [`${BIT}/2026-11-02-encargo-03.md`]: encargo('03', 'director'),
    [`${BIT}/2026-11-02-evidencia-03.md`]: '# Evidencia 03\nprobado\n',
  }, 'encargos');
  g(dir, 'push', '-q', '-u', 'origin', 'modulo/nz');
  const obr = path.join(P, '.claude', 'worktrees', 'modulo--nz--01');
  g(P, 'worktree', 'add', '-q', '-b', 'modulo/nz--01', obr);
  commit(obr, { 'src/a.js': '1\n' }, 'sub-paso 1');
  g(obr, 'push', '-q', '-u', 'origin', 'modulo/nz--01');
  // el transcript del director
  const config = carpeta('config');
  const tr = path.join(config, 'projects', uso.nombreCarpeta(dir));
  fs.mkdirSync(tr, { recursive: true });
  const usado = Math.round(((o.pct === undefined ? 10 : o.pct) / 100) * 1000000);
  const linea = { type: 'assistant', message: { model: 'claude-opus-5-5', usage: { input_tokens: 0, cache_read_input_tokens: usado, cache_creation_input_tokens: 0 } } };
  fs.writeFileSync(path.join(tr, 's.jsonl'), `${JSON.stringify(linea)}\n`);
  return { bare, P, dir, obr, env: { ...process.env, CLAUDE_CONFIG_DIR: config } };
}
function correr(cwd, args, env, ahora) {
  const out = [];
  const err = [];
  const codigo = N.main(args, { cwd, env, ahora, salida: (s) => out.push(s), error: (s) => err.push(s) });
  return { codigo, out: out.join(''), err: err.join(''), lineas: out.join('').replace(/\n$/, '').split('\n') };
}
const AHORA = new Date(2026, 10, 2, 22, 5);

// ---------------------------------------------------------------- me-voy

test('me-voy: fuera del director → 1 con qué hacer y sin marca; mal llamado → 2', () => {
  const p = proyecto();
  for (const cwd of [p.P, p.obr]) {
    const r = correr(cwd, ['me-voy'], p.env);
    assert.equal(r.codigo, 1);
    assert.match(r.out, /^me-voy corre desde el worktree del director \(rama modulo\/<x>\) y acá la rama es (main|modulo\/nz--01): abrí la pestaña del director/);
    assert.equal(fs.existsSync(path.join(cwd, '.kit-noche')), false);
  }
  for (const args of [['me-voy', '--hasta', '25:00'], ['me-voy', '--hasta'], ['me-voy', '--cada', '30'], ['otra'], []]) {
    const r = correr(p.dir, args, p.env);
    assert.equal(r.codigo, 2, args.join(' '));
    assert.ok(r.err.includes(N.USO));
  }
  assert.equal(fs.existsSync(path.join(p.dir, '.kit-noche')), false);
});

test('me-voy desde el director: escribe .kit-noche e imprime el checklist (encargos, apertura, red, vence, contexto, despertador)', () => {
  const p = proyecto({ pct: 12 });
  const r = correr(p.dir, ['me-voy', '--hasta', '07:30'], p.env, AHORA);
  assert.equal(r.codigo, 0, r.out);
  assert.equal(fs.readFileSync(path.join(p.dir, '.kit-noche'), 'utf8'), `desde 2026-11-02T22:05${r.out.match(/desde 2026-11-02T22:05([+-]\d\d:\d\d)/)[1]}\nhasta 07:30\n`);
  const sha = g(p.obr, 'rev-parse', 'HEAD').slice(0, 7);
  assert.match(r.lineas[0], /^noche: \.kit-noche escrita en el worktree del director de nz \(desde .+, hasta 07:30\): el director y sus obreros quedan nocturnos hasta "volvi"$/);
  assert.equal(r.lineas[1], `encargo 01 · modulo/nz--01@${sha} · ${r.lineas[1].match(/· (hace [^:]+): /)[1]}: sub-paso 1`);
  assert.equal(r.lineas[2], 'encargo 02 · sin rama: el obrero no arrancó · ⚠️ Apertura: Guido — de noche para (no lo abre el director)');
  assert.ok(!r.out.includes('encargo 03'), 'el 03 ya cerró (su evidencia está en modulo/nz)');
  assert.equal(r.lineas[3], 'red: origin responde');
  assert.equal(r.lineas[4], 'vence: VPN, credenciales y dispositivos no los ve el script: miralos vos (los encargos abiertos usan: suite, navegador)');
  assert.match(r.lineas[5], /^permisos: lo que no esté en el AUTORIZADO del encargo, de noche es PARADA \(predecirlo: NO VERIFICADO\)$/);
  assert.equal(r.lineas[6], 'contexto: 120k de 1000k (12%) · faltan 880k · claude-opus-5-5');
  assert.equal(r.lineas[7], 'despertador: node .claude/scripts/noche.cjs despertador --modulo nz --cada 300 (en un Monitor o una tarea fuera del director: con --modulo corre desde cualquier checkout)');
  assert.equal(r.lineas.length, 8);
  // y desde ahora el obrero es nocturno (contexto.deNoche)
  assert.deepEqual(require('../hooks/lib/contexto.cjs').deNoche(p.obr), { noche: true, por: 'kit-noche' });
});

test('me-voy: el director ≥ 40 % → "mudate antes de irte"; un obrero en PARADA lo dice; sin red y sin .gitignore, avisa', () => {
  const p = proyecto({ pct: 40, gitignore: '' });
  commit(p.obr, { [`${BIT}/2026-11-02-evidencia-01.md`]: 'PARADA: se negó npm install\n' }, 'PARADA');
  g(p.dir, 'remote', 'set-url', 'origin', path.join(TMP, 'no-existe-el-remoto'));
  const r = correr(p.dir, ['me-voy'], p.env, AHORA);
  assert.equal(r.codigo, 0);
  assert.match(r.out, /\nencargo 01 · modulo\/nz--01@\w{7} \(local y origin distintas\) · hace [^\n]*: PARADA · PARADA: se negó npm install\n/);
  assert.match(r.out, /\n⚠️ \.kit-noche no está ignorado: pegá en el \.gitignore del principal el gitignore\.snippet del kit ENTERO/);
  assert.match(r.out, /\nred: ❌ origin no responde \(.+\) — sin red no trabaja nadie y el despertador no ve nada: arreglalo antes de irte\n/);
  assert.match(r.out, /\ncontexto: 400k de 1000k \(40%\) · faltan 600k · claude-opus-5-5 — pasa del 40%: mudate antes de irte\n/);
  assert.equal(fs.readFileSync(path.join(p.dir, '.kit-noche'), 'utf8').split('\n')[1], 'hasta —');
});

test('me-voy: sin remoto lo dice; sin transcript, el contexto es NO VERIFICADO (y la marca se escribe igual)', () => {
  const p = proyecto();
  g(p.dir, 'remote', 'remove', 'origin');
  const r = correr(p.dir, ['me-voy'], { ...p.env, CLAUDE_CONFIG_DIR: carpeta('vacia') }, AHORA);
  assert.equal(r.codigo, 0);
  assert.match(r.out, /\nred: sin remoto origin — nadie ve los commits de la noche desde otra PC\n/);
  assert.match(r.out, /\ncontexto: NO VERIFICADO · no encuentro la carpeta de esta sesión en .+ — medilo antes de irte\n/);
  assert.ok(fs.existsSync(path.join(p.dir, '.kit-noche')));
});

// ---------------------------------------------------------------- volvi

test('volvi: borra .kit-noche de todos los worktrees (corrido desde el principal, como /inicio de Guido); sin marca, lo dice', () => {
  const p = proyecto();
  fs.writeFileSync(path.join(p.dir, '.kit-noche'), 'x');
  fs.writeFileSync(path.join(p.obr, '.kit-noche'), 'x');
  let r = correr(p.P, ['volvi'], p.env);
  assert.equal(r.codigo, 0);
  assert.equal(r.out, 'volví: borré .kit-noche de modulo/nz, modulo/nz--01 — de día otra vez\n');
  assert.equal(fs.existsSync(path.join(p.dir, '.kit-noche')), false);
  assert.equal(fs.existsSync(path.join(p.obr, '.kit-noche')), false);
  r = correr(p.dir, ['volvi'], p.env);
  assert.equal(r.out, 'volví: no había ninguna .kit-noche (ya era de día)\n');
  assert.equal(correr(p.P, ['volvi', '--ya'], p.env).codigo, 2);
});

// ---------------------------------------------------------------- despertador

test('despertador --una-vez: la 1.ª vuelta solo saca la foto (en el git-dir común); sin cambios, silencio; commit, PARADA y main despiertan', () => {
  const p = proyecto();
  const una = (cwd = p.dir) => correr(cwd, ['despertador', '--una-vez'], p.env);
  let r = una();
  assert.deepEqual([r.codigo, r.out], [0, '']);
  assert.ok(fs.existsSync(path.join(p.P, '.git', N.fotoDe('nz'))), 'la foto vive en el git-dir común');
  assert.equal(una().out, '', 'nada cambió: nada');
  assert.equal(correr(p.obr, ['despertador', '--una-vez', '--modulo', 'nz'], p.env).out, '', 'desde otro worktree con --modulo, la misma foto');
  // commit local del obrero (sin push): una línea, aunque después se pushee no se repite
  const s1 = commit(p.obr, { 'src/a.js': '2\n' }, 'sub-paso 2');
  assert.equal(una().out, `DESPERTAR · commit · modulo/nz--01@${s1.slice(0, 7)}\n`);
  g(p.obr, 'push', '-q', 'origin', 'modulo/nz--01');
  assert.equal(una().out, '', 'el push del mismo commit no despierta otra vez');
  // PARADA: la evidencia en la punta arranca con "PARADA:"
  const s2 = commit(p.obr, { [`${BIT}/2026-11-02-evidencia-01.md`]: '\nPARADA: se negó npm install\n' }, 'PARADA');
  assert.equal(una().out, `DESPERTAR · PARADA · modulo/nz--01@${s2.slice(0, 7)}\n`);
  // un commit en main del principal (CM-79) y una rama de obrero que llega solo por origin
  const s3 = commit(p.P, { 'b.txt': 'b\n' }, 'en main');
  const otro = carpeta('clon');
  g(TMP, 'clone', '-q', p.bare, otro);
  g(otro, 'switch', '-q', '-c', 'modulo/nz--02', 'origin/modulo/nz');
  const s4 = commit(otro, { 'src/b.js': '1\n' }, 'desde otra PC');
  g(otro, 'push', '-q', 'origin', 'modulo/nz--02');
  r = una();
  assert.deepEqual(r.lineas.sort(), [`DESPERTAR · commit en main · main@${s3.slice(0, 7)}`, `DESPERTAR · commit · modulo/nz--02@${s4.slice(0, 7)}`].sort());
  // modulo/nz (el director) y otras ramas no despiertan; una rama borrada tampoco
  commit(p.dir, { 'notas.md': 'x\n' }, 'el director anota');
  g(p.P, 'branch', '-q', 'cualquiera');
  g(p.P, 'worktree', 'remove', '--force', p.obr);
  g(p.P, 'branch', '-q', '-D', 'modulo/nz--01');
  assert.equal(una().out, '');
});

test('despertador: sin red despierta UNA vez ("sin red"); al volver la red, nada que no sea un commit', () => {
  const p = proyecto();
  const una = () => correr(p.dir, ['despertador', '--una-vez'], p.env).out;
  una();
  g(p.P, 'remote', 'set-url', 'origin', path.join(TMP, 'no-existe-el-remoto'));
  assert.match(una(), /^DESPERTAR · sin red · origin@\w{7}\n$/);
  assert.equal(una(), '', 'sigue sin red: no repite');
  g(p.P, 'remote', 'set-url', 'origin', p.bare);
  assert.equal(una(), '');
  // una foto rota se rehace sin despertar
  fs.writeFileSync(path.join(p.P, '.git', N.fotoDe('nz')), '{roto');
  assert.equal(una(), '');
});

test('despertador en loop: no imprime nada si nada cambió y avisa en la 1.ª vuelta lo que cambió desde la foto (mal llamado → 2)', async () => {
  const p = proyecto();
  correr(p.dir, ['despertador', '--una-vez'], p.env);
  const s = commit(p.obr, { 'src/a.js': '9\n' }, 'antes del loop');
  const hijo = spawn(process.execPath, [SCRIPT, 'despertador', '--cada', '10'], { cwd: p.dir, env: p.env });
  let out = '';
  hijo.stdout.on('data', (b) => (out += b));
  await new Promise((ok) => setTimeout(ok, 4000));
  hijo.kill();
  assert.equal(out, `DESPERTAR · commit · modulo/nz--01@${s.slice(0, 7)}\n`, 'una línea y después silencio');
  for (const args of [['despertador', '--cada', '5'], ['despertador', '--cada', 'x'], ['despertador', '--hasta', '07:00']]) {
    assert.equal(correr(p.dir, args, p.env).codigo, 2, args.join(' '));
  }
});

// ---------------------------------------------------------------- RF-fix 1, 3 y 11

test('RF-fix 1: la marca SOLO en el worktree del director (como la deja me-voy); volvi desde el principal la borra; sin marca, una línea y 0', () => {
  const p = proyecto();
  assert.equal(correr(p.dir, ['me-voy'], p.env, AHORA).codigo, 0);
  assert.ok(fs.existsSync(path.join(p.dir, '.kit-noche')));
  assert.equal(fs.existsSync(path.join(p.P, '.kit-noche')), false, 'en la raíz del principal no hay marca: por eso /inicio corre volvi siempre');
  let r = correr(p.P, ['volvi'], p.env);
  assert.deepEqual([r.codigo, r.out], [0, 'volví: borré .kit-noche de modulo/nz — de día otra vez\n']);
  assert.equal(fs.existsSync(path.join(p.dir, '.kit-noche')), false);
  r = correr(p.P, ['volvi'], p.env);
  assert.deepEqual([r.codigo, r.out], [0, 'volví: no había ninguna .kit-noche (ya era de día)\n'], 'idempotente: una línea, salida 0');
  const s = spawnSync(process.execPath, [SCRIPT, 'volvi'], { cwd: p.P, env: p.env, encoding: 'utf8' });
  assert.deepEqual([s.status, s.stdout, s.stderr], [0, 'volví: no había ninguna .kit-noche (ya era de día)\n', '']);
});

test('RF-fix 3: una foto por módulo — la vuelta de un director no se come lo del otro; sin módulo → 1; --modulo feo → 2', () => {
  const p = proyecto();
  const dirOt = path.join(p.P, '.claude', 'worktrees', 'modulo--ot');
  g(p.P, 'worktree', 'add', '-q', '-b', 'modulo/ot', dirOt);
  const obrOt = path.join(p.P, '.claude', 'worktrees', 'modulo--ot--01');
  g(p.P, 'worktree', 'add', '-q', '-b', 'modulo/ot--01', obrOt);
  const una = (cwd, ...extra) => correr(cwd, ['despertador', '--una-vez', ...extra], p.env);
  assert.equal(una(p.dir).out, '');
  assert.equal(una(dirOt).out, '');
  assert.ok(fs.existsSync(path.join(p.P, '.git', N.fotoDe('nz'))) && fs.existsSync(path.join(p.P, '.git', N.fotoDe('ot'))), 'dos fotos');
  // un commit del obrero de nz: la vuelta de ot no lo ve (ni lo consume); la de nz, sí
  const s = commit(p.obr, { 'src/a.js': '3\n' }, 'de nz');
  assert.equal(una(dirOt).out, '', 'ot no despierta por nz');
  assert.equal(una(p.dir).out, `DESPERTAR · commit · modulo/nz--01@${s.slice(0, 7)}\n`, 'nz lo ve aunque ot dio su vuelta antes');
  // y uno de ot, al revés; desde el principal con --modulo, la foto de ese módulo
  const t = commit(obrOt, { 'src/b.js': '1\n' }, 'de ot');
  assert.equal(una(p.dir).out, '');
  assert.equal(una(p.P, '--modulo', 'ot').out, `DESPERTAR · commit · modulo/ot--01@${t.slice(0, 7)}\n`);
  // main despierta a los dos (cada uno en su foto)
  const m = commit(p.P, { 'c.txt': 'c\n' }, 'en main');
  assert.equal(una(p.dir).out, `DESPERTAR · commit en main · main@${m.slice(0, 7)}\n`);
  assert.equal(una(dirOt).out, `DESPERTAR · commit en main · main@${m.slice(0, 7)}\n`);
  // sin módulo (el principal, un obrero) → 1 con qué hacer; --modulo feo → 2
  for (const cwd of [p.P, p.obr]) {
    const r = una(cwd);
    assert.equal(r.codigo, 1);
    assert.equal(r.out, 'despertador: no sé de qué módulo — corrélo desde el worktree del director (rama modulo/<x>) o pasale --modulo <x>\n');
  }
  for (const v of [['--modulo'], ['--modulo', 'NZ'], ['--modulo', 'a--b']]) assert.equal(una(p.P, ...v).codigo, 2, v.join(' '));
});

test('RF-fix 3: me-voy saca la foto de nuevo — lo que pasó de día no despierta en la primera vuelta de la noche; sin me-voy, sí', () => {
  for (const conMeVoy of [true, false]) {
    const p = proyecto();
    const una = () => correr(p.dir, ['despertador', '--una-vez'], p.env).out;
    assert.equal(una(), '', 'la foto de la mañana');
    const s = commit(p.obr, { 'src/a.js': 'de día\n' }, 'de día');
    if (conMeVoy) assert.equal(correr(p.dir, ['me-voy'], p.env, AHORA).codigo, 0);
    assert.equal(una(), conMeVoy ? '' : `DESPERTAR · commit · modulo/nz--01@${s.slice(0, 7)}\n`, conMeVoy ? 'con me-voy' : 'sin me-voy');
  }
});

test('RF-fix 11: el USO dice que --hasta es informativo y que la noche termina con volvi; el despertador nombra --modulo', () => {
  assert.match(N.USO, /--hasta es informativo: la noche termina con volvi/);
  assert.match(N.USO, /despertador \[--modulo <x>\] \[--cada <seg>\] \[--una-vez\]/);
});
