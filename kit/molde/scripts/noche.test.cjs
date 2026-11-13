'use strict';
// Pruebas de noche.cjs (SPEC-0 RF-11 y P6.4; delta 5 crit. 16, D5-16; D §9.3-§9.5, §11): me-voy (la marca y el checklist), volvi y
// el despertador que ya no existe (B4.4). Repos temporales con remoto bare local, sin la config de git de la PC; el transcript del director, falso, con
// CLAUDE_CONFIG_DIR apuntado a un temporal. Corren con: node --test kit/molde/scripts/noche.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-noche-'));
// B5: el turno de la PC, propio de este archivo: la suite corre los archivos en paralelo y uno no espera al otro (lo que se prueba
// del turno, con su carpeta aparte).
process.env.KIT_TURNO_DIR = path.join(TMP, 'turno');
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

test('me-voy desde el director: escribe .kit-noche e imprime el checklist (encargos, apertura, red, vence, el relevo); B4.4: sin despertador ni mudanza', () => {
  const p = proyecto({ pct: 60 });
  const r = correr(p.dir, ['me-voy', '--hasta', '07:30'], p.env, AHORA);
  assert.equal(r.codigo, 0, r.out);
  assert.equal(fs.readFileSync(path.join(p.dir, '.kit-noche'), 'utf8'), `desde 2026-11-02T22:05${r.out.match(/desde 2026-11-02T22:05([+-]\d\d:\d\d)/)[1]}\nhasta 07:30\n`);
  const sha = g(p.obr, 'rev-parse', 'HEAD').slice(0, 7);
  assert.match(r.lineas[0], /^noche: \.kit-noche escrita en el worktree del director de nz \(desde .+, hasta 07:30\): el director y sus obreros quedan nocturnos hasta "volvi"$/);
  assert.equal(r.lineas[1], `encargo 01 · modulo/nz--01@${sha} · ${r.lineas[1].match(/· (hace [^:]+): /)[1]}: sub-paso 1`);
  assert.equal(r.lineas[2], 'encargo 02 · sin rama: el obrero no arrancó · ⚠️ Apertura: dueño — de noche para (no lo abre el director)');
  assert.ok(!r.out.includes('encargo 03'), 'el 03 ya cerró (su evidencia está en modulo/nz)');
  assert.equal(r.lineas[3], 'red: origin responde');
  assert.equal(r.lineas[4], 'vence: VPN, credenciales y dispositivos no los ve el script: miralos vos (los encargos abiertos usan: suite, navegador)');
  assert.match(r.lineas[5], /^permisos: lo que no esté en el AUTORIZADO del encargo, de noche es PARADA \(predecirlo: NO VERIFICADO\)$/);
  assert.equal(r.lineas[6], 'antes de cada espera larga: todo commiteado y subido y el relevo al día (si quedás quieto cerca de una hora la plataforma puede resumir la charla, y con el relevo se retoma)');
  assert.equal(r.lineas.length, 7);
  assert.doesNotMatch(r.out, /despertador|mudate|40 ?%/i);
  // y desde ahora el obrero es nocturno (contexto.deNoche)
  assert.deepEqual(require('../hooks/lib/contexto.cjs').deNoche(p.obr), { noche: true, por: 'kit-noche' });
});

test('me-voy: un obrero en PARADA lo dice; sin red y sin .gitignore, avisa (B7 51: lo arregla "poné al día este repo")', () => {
  const p = proyecto({ pct: 40, gitignore: '' });
  commit(p.obr, { [`${BIT}/2026-11-02-evidencia-01.md`]: 'PARADA: se negó npm install\n' }, 'PARADA');
  g(p.dir, 'remote', 'set-url', 'origin', path.join(TMP, 'no-existe-el-remoto'));
  const r = correr(p.dir, ['me-voy'], p.env, AHORA);
  assert.equal(r.codigo, 0);
  assert.match(r.out, /\nencargo 01 · modulo\/nz--01@\w{7} \(local y origin distintas\) · hace [^\n]*: PARADA · PARADA: se negó npm install\n/);
  assert.match(r.out, /\n⚠️ \.kit-noche no está ignorado en este repo: lo arregla "poné al día este repo"\n/);
  assert.doesNotMatch(r.out, /pegá en el \.gitignore/);
  assert.match(r.out, /\nred: ❌ origin no responde \(.+\) — sin red no trabaja nadie: arreglalo antes de irte\n/);
  assert.equal(fs.readFileSync(path.join(p.dir, '.kit-noche'), 'utf8').split('\n')[1], 'hasta —');
});

test('me-voy: sin remoto lo dice (y la marca se escribe igual)', () => {
  const p = proyecto();
  g(p.dir, 'remote', 'remove', 'origin');
  const r = correr(p.dir, ['me-voy'], { ...p.env, CLAUDE_CONFIG_DIR: carpeta('vacia') }, AHORA);
  assert.equal(r.codigo, 0);
  assert.match(r.out, /\nred: sin remoto origin — nadie ve los commits de la noche desde otra PC\n/);
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

// ---------------------------------------------------------------- despertador (B4.4: ya no existe)

test('B4.4 (28): despertador ya no existe — una línea y salida 0, con o sin las banderas de antes, sin foto', () => {
  const p = proyecto();
  for (const args of [['despertador'], ['despertador', '--una-vez'], ['despertador', '--modulo', 'nz', '--cada', '300']]) {
    const r = correr(p.dir, args, p.env);
    assert.deepEqual([r.codigo, r.out, r.err], [0, `${N.SIN_DESPERTADOR}\n`, ''], args.join(' '));
  }
  assert.match(N.SIN_DESPERTADOR, /^despertador: ya no existe — /);
  assert.deepEqual(fs.readdirSync(path.join(p.P, '.git')).filter((f) => /despertador/.test(f)), [], 'no saca foto');
  assert.doesNotMatch(N.USO, /--cada|--una-vez|Monitor/);
});

// ---------------------------------------------------------------- RF-fix 1 y 11

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

test('RF-fix 11: el USO dice que --hasta es informativo y que la noche termina con volvi', () => {
  assert.match(N.USO, /--hasta es informativo: la noche termina con volvi/);
});

// ================================================================ B3 (SPEC-paquete-8d): la noche termina sola

const PUB = require('../hooks/lib/publicar.cjs');
const ESP = require('../hooks/lib/espera.cjs');
const RE_NADA_PARA_EL_DUENO = [/@[0-9a-f]{7}/, /\b[0-9a-f]{40}\b/, /node \.claude/, /\b(rojo|roja|verde)\b/i, /`[^`]+`/];

// Los tres scripts de mentira: publicar deja una marca y cuenta; humo pasa o falla según un archivo; volver deja otra marca.
// Publicar imprime un "secreto" para probar que la salida del comando no se ve.
const SCRIPTS_PUB = {
  'scripts/publicar.cjs': "const fs=require('fs');const f=process.argv[2];if(fs.existsSync(f+'-falla'))process.exit(1);const n=fs.existsSync(f)?Number(fs.readFileSync(f,'utf8')):0;fs.writeFileSync(f,String(n+1));console.log('CLAVE-SECRETA-DE-PRUEBA');\n",
  'scripts/humo.cjs': "process.exit(require('fs').existsSync(process.argv[2])?1:0);\n",
  'scripts/volver.cjs': "require('fs').writeFileSync(process.argv[2],'volvi');\n",
  'scripts/test.cjs': "process.exit(require('fs').existsSync(process.argv[2])?1:0);\n",
};
const FICHA_PUB = (o) => {
  let t = '---\nkit: 3.0.0-rc.6\nnivel: estandar\nvars:\n  proyecto: px\n';
  if (o.test) t += `  comando-test: ${JSON.stringify(o.test)}\n`;
  if (o.setup) t += `  comando-setup: ${JSON.stringify(o.setup)}\n`;
  if (o.publicar) t += `autorizado:\n  publicar: ${o.publicar}\n`;
  return `${t}---\n`;
};
// Un proyecto en main con remoto bare, el módulo x integrado (el merge `integrar: módulo x`), la ficha con autorizado.publicar y
// la PC autorizada (un home de mentira con su kit-pc.md). `m` es la carpeta de las marcas, fuera del repo.
function conPublicar(o = {}) {
  const bare = carpeta('remoto');
  g(bare, 'init', '-q', '--bare', '-b', 'main');
  const P = carpeta('p');
  const m = carpeta('marcas');
  const mk = (n) => path.join(m, n).split('\\').join('/');
  g(P, 'init', '-q', '-b', 'main');
  g(P, 'config', 'core.autocrlf', 'false');
  const publicar = o.publicar !== undefined ? o.publicar : `{comando: "node scripts/publicar.cjs ${mk('publicado')}", humo: "node scripts/humo.cjs ${mk('humo-falla')}", volver: "node scripts/volver.cjs ${mk('volvio')}"}`;
  const base = { '.gitignore': SNIPPET, 'a.txt': 'a\n', ...SCRIPTS_PUB, 'docs/SESSION_HANDOFF.md': '# Handoff\n\n## Te espera\n\n- nada\n' };
  base['.claude/kit.md'] = FICHA_PUB({ publicar, test: `node scripts/test.cjs ${mk('test-falla')}`, setup: o.setup });
  if (o.archivos) Object.assign(base, o.archivos);
  commit(P, base, 'inicio');
  g(P, 'remote', 'add', 'origin', bare);
  g(P, 'push', '-q', '-u', 'origin', 'main');
  g(P, 'switch', '-q', '-c', 'modulo/x');
  const mod = { 'src/x.js': '1\n' };
  mod['docs/modulos/x/bitacora/2026-11-02-encargo-01.md'] = '# Encargo 01 · x · el primero\n';
  mod['docs/modulos/x/bitacora/2026-11-02-evidencia-01.md'] = 'listo\n';
  commit(P, mod, 'el módulo');
  g(P, 'push', '-q', '-u', 'origin', 'modulo/x');
  g(P, 'switch', '-q', 'main');
  g(P, 'merge', '-q', '--no-ff', '-m', 'integrar: módulo x', 'modulo/x');
  g(P, 'push', '-q', 'origin', 'main');
  const home = carpeta('home');
  const F = require('../hooks/lib/ficha.cjs');
  const datos = F.leerCabecera(FICHA_PUB({ publicar, setup: o.setup })).datos.autorizado.publicar;
  const huella = o.huella || (typeof datos === 'object' ? PUB.huella(P, datos, 'refs/remotes/origin/main') : '000000000000');
  const origin = o.origin !== undefined ? o.origin : PUB.normalizarOrigin(bare);
  if (origin !== null) escribir(home, '.claude/kit-pc.md', `---\nentorno: nativo\npublica:\n  - {origin: "${origin}", huella: ${huella}}\n---\n`);
  return { bare, P, m, home, mk, huella };
}
const pub = (p, args = [], o = {}) => {
  const out = [];
  const codigo = N.main(['publicar', 'x', ...args], { cwd: o.cwd || p.P, home: p.home, env: o.env || {}, salida: (s) => out.push(s), error: (s) => out.push(s) });
  return { codigo, out: out.join('') };
};
const resultado = (p) => JSON.parse(fs.readFileSync(path.join(p.P, '.git', N.PUBLICACION), 'utf8'));
const veces = (p) => (fs.existsSync(path.join(p.m, 'publicado')) ? Number(fs.readFileSync(path.join(p.m, 'publicado'), 'utf8')) : 0);

test('B3 el contrato (C2.2): el origin normalizado y la huella; el mismo ejemplo lo copia la C', () => {
  for (const u of ['git@github.com:Duenio/Repo.git', 'https://github.com/Duenio/Repo', 'https://GitHub.com/Duenio/Repo.git/', 'ssh://git@github.com/Duenio/Repo.git']) {
    assert.equal(PUB.normalizarOrigin(u), 'github.com/Duenio/Repo', u);
  }
  const p = { comando: 'npm --prefix app run deploy', humo: 'node scripts/humo.cjs --rapido', volver: 'node scripts/humo.cjs' };
  assert.deepEqual(PUB.archivosNombrados(p), ['app/package.json', 'scripts/humo.cjs']);
  const archivos = { 'app/package.json': '{"scripts":{"deploy":"x"}}\r\n', 'scripts/humo.cjs': 'h\n' };
  const t = PUB.textoHuella(p, (r) => archivos[r]);
  const F = require('../hooks/lib/ficha.cjs');
  const esperado = ['comando=npm --prefix app run deploy', 'humo=node scripts/humo.cjs --rapido', 'volver=node scripts/humo.cjs', `app/package.json=${F.hash('{"scripts":{"deploy":"x"}}\n')}`, `scripts/humo.cjs=${F.hash('h\n')}`];
  assert.equal(t, esperado.join('\n'));
  assert.equal(PUB.textoHuella({ comando: 'al-subir', humo: 'node h.cjs' }, () => null), 'comando=al-subir\nhumo=node h.cjs\nvolver=\nh.cjs=(no está)');
});

test('B3 publicar: todo bien → 0, publica una vez, el humo pasa y queda el resultado; la salida del comando no se ve; el mismo commit dos veces no repite', () => {
  const p = conPublicar();
  const r = pub(p);
  assert.equal(r.codigo, 0, r.out);
  assert.match(r.out, /publiqué y la prueba de humo pasó/);
  assert.doesNotMatch(r.out, /CLAVE-SECRETA|kit-pub-/);
  assert.equal(veces(p), 1);
  const j = resultado(p);
  assert.deepEqual(j.pasos, { pruebas: 'pasó', comando: 'pasó', humo: 'pasó', volver: 'no hay' });
  assert.equal(j.commit, g(p.P, 'rev-parse', 'HEAD'));
  assert.equal(pub(p).codigo, 0);
  assert.equal(veces(p), 1, 'el mismo commit no se publica dos veces');
});

test('B3 publicar: sin la clave → 3 · sin el repo en publica → 3 y en "te necesito" · el script cambiado después de autorizar → 3 · sin kit-pc → 3', () => {
  const sin = conPublicar({ publicar: 'no' });
  const rs = pub(sin);
  assert.equal(rs.codigo, 3, rs.out);
  assert.match(rs.out, /este proyecto no publica solo/);
  const otro = conPublicar({ origin: 'github.com/otro/repo', huella: '111111111111' });
  const r = pub(otro);
  assert.equal(r.codigo, 3, r.out);
  assert.match(r.out, /falta tu autorización para publicar desde esta PC/);
  assert.ok(ESP.teEspera(otro.P).some((i) => /falta tu autorización/.test(i.texto) && i.tipo === 'clic'));
  assert.equal(veces(otro), 0);
  // el script de publicar cambia después de autorizar (lo cambia un módulo integrado)
  const c = conPublicar();
  g(c.P, 'switch', '-q', 'modulo/x');
  commit(c.P, { 'scripts/publicar.cjs': `${SCRIPTS_PUB['scripts/publicar.cjs']}// y ahora migra la base\n` }, 'otro paso');
  g(c.P, 'switch', '-q', 'main');
  g(c.P, 'merge', '-q', '--no-ff', '-m', 'integrar: módulo x', 'modulo/x');
  g(c.P, 'push', '-q', 'origin', 'main');
  const rc = pub(c);
  assert.equal(rc.codigo, 3, rc.out);
  assert.match(rc.out, /cambió cómo se publica este proyecto: falta tu OK de nuevo/);
  assert.equal(veces(c), 0);
  const mudado = conPublicar({ origin: 'github.com/otro/repo' }); // la misma huella con otro origin: se mudó el remoto
  assert.match(pub(mudado).out, /cambió el origin de este proyecto/);
  const nada = conPublicar({ origin: null });
  assert.equal(pub(nada).codigo, 3);
});

test('B3 publicar: el origin escrito de otra forma se reconoce; en un worktree, con rol de agente o con KIT_FONDO y --seguir → negado', () => {
  const p = conPublicar();
  const deFile = PUB.normalizarOrigin(`file:///${p.bare.split('\\').join('/')}`);
  assert.equal(deFile, PUB.normalizarOrigin(p.bare));
  escribir(p.home, '.claude/kit-pc.md', `---\npublica:\n  - {origin: "${deFile}", huella: ${p.huella}}\n---\n`);
  assert.equal(pub(p).codigo, 0);
  const q = conPublicar();
  const wt = path.join(q.P, '.claude', 'worktrees', 'otro');
  g(q.P, 'worktree', 'add', '-q', '-b', 'modulo/y', wt);
  const w = pub(q, [], { cwd: wt });
  assert.equal(w.codigo, 1);
  assert.match(w.out, /no — esto corre en la carpeta principal/);
  fs.writeFileSync(path.join(q.P, '.kit-rol'), 'obrero\n');
  assert.match(pub(q).out, /no — esto no lo corre una sesión con rol obrero/);
  fs.rmSync(path.join(q.P, '.kit-rol'));
  const s = pub(q, ['--seguir'], { env: { KIT_FONDO: '1' } });
  assert.equal(s.codigo, 1);
  assert.match(s.out, /firma del dueño/);
  assert.equal(veces(q), 0);
});

test('B3 publicar: un commit de código posterior a lo publicado → negado; las pruebas que fallan → 1 y el comando no corrió', () => {
  const p = conPublicar();
  assert.equal(pub(p).codigo, 0);
  commit(p.P, { 'src/suelto.js': 'x\n' }, 'código directo en main');
  g(p.P, 'push', '-q', 'origin', 'main');
  const r = pub(p);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /entró algo que no es un módulo integrado ni papeles/);
  assert.equal(veces(p), 1);
  const t = conPublicar();
  fs.writeFileSync(path.join(t.m, 'test-falla'), '1');
  const rt = pub(t);
  assert.equal(rt.codigo, 1, rt.out);
  assert.match(rt.out, /las pruebas fallaron en la carpeta principal: no publiqué/);
  assert.equal(veces(t), 0);
});

test('B3 publicar: el humo falla con volver → corre volver, sale 1 y la siguiente da 3 (trabada) hasta --seguir', () => {
  const p = conPublicar();
  fs.writeFileSync(path.join(p.m, 'humo-falla'), '1');
  const r = pub(p);
  assert.equal(r.codigo, 1, r.out);
  assert.match(r.out, /la prueba de humo falló después de publicar \(se volvió atrás\)/);
  assert.ok(fs.existsSync(path.join(p.m, 'volvio')));
  assert.equal(resultado(p).trabado, true);
  commit(p.P, { 'docs/SESSION_HANDOFF.md': '# Handoff\n\nal día\n' }, 'papeles');
  g(p.P, 'push', '-q', 'origin', 'main');
  const t = pub(p);
  assert.equal(t.codigo, 3, t.out);
  assert.match(t.out, /trabada/);
  assert.ok(ESP.teEspera(p.P).some((i) => /decidí si sigue/.test(i.texto)));
  fs.rmSync(path.join(p.m, 'humo-falla'));
  const s = pub(p, ['--seguir']);
  assert.equal(s.codigo, 0, s.out);
  assert.equal(veces(p), 2);
});

test('B3 publicar: con al-subir corre solo el humo (ni pruebas ni comando, ni autorización de la PC)', () => {
  const p = conPublicar({ publicar: '{comando: al-subir, humo: "node scripts/humo.cjs x"}', origin: null });
  const r = pub(p);
  assert.equal(r.codigo, 0, r.out);
  assert.match(r.out, /publica al subir/);
  assert.deepEqual(resultado(p).pasos, { pruebas: 'no hay', comando: 'no hay', humo: 'pasó', volver: 'no hay' });
});

test('B3 subir: con código por subir no sube; con solo papeles sube; con origin adelantado trae y sube', () => {
  const p = conPublicar();
  const sub = () => {
    const out = [];
    return { codigo: N.main(['subir', 'x'], { cwd: p.P, salida: (s) => out.push(s), error: (s) => out.push(s) }), out: out.join('') };
  };
  assert.match(sub().out, /nada que subir/);
  commit(p.P, { 'src/y.js': '1\n' }, 'código');
  const r = sub();
  assert.equal(r.codigo, 1);
  assert.match(r.out, /no son solo papeles/);
  g(p.P, 'reset', '-q', '--hard', 'HEAD~1');
  commit(p.P, { 'docs/CHANGELOG.md': '# c\n' }, 'papeles');
  const otra = carpeta('otra');
  g(otra, 'clone', '-q', p.bare, '.');
  commit(otra, { 'docs/TODO.md': '# t\n' }, 'otra PC');
  g(otra, 'push', '-q', 'origin', 'main');
  const s = sub();
  assert.equal(s.codigo, 0, s.out);
  assert.match(s.out, /subí 1 commit\(s\) de papeles/);
  assert.equal(g(p.bare, 'rev-parse', 'main'), g(p.P, 'rev-parse', 'HEAD'));
});

test('B3 cierre-empieza: con el candado tomado espera (y sale 4); con la carpeta en otra rama sale distinto de 0 sin tocar nada', () => {
  const p = conPublicar();
  const ce = () => {
    const out = [];
    return { codigo: N.main(['cierre-empieza', 'x'], { cwd: p.P, esperaCandadoMs: 300, salida: (s) => out.push(s), error: (s) => out.push(s) }), out: out.join('') };
  };
  const dir = path.join(p.P, '.git', N.CANDADO_CIERRE);
  fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, 'quien.json'), JSON.stringify({ modulo: 'otro', desde: new Date().toISOString() }));
  const t0 = Date.now();
  const r = ce();
  assert.equal(r.codigo, 4, r.out);
  assert.ok(Date.now() - t0 >= 250);
  assert.match(r.out, /espero que termine el cierre del módulo otro/);
  fs.rmSync(dir, { recursive: true });
  assert.equal(ce().codigo, 0);
  fs.rmSync(dir, { recursive: true });
  g(p.P, 'switch', '-q', 'modulo/x');
  const antes = g(p.P, 'status', '--porcelain');
  const o = ce();
  assert.notEqual(o.codigo, 0);
  assert.match(o.out, /no toco nada/);
  assert.equal(g(p.P, 'status', '--porcelain'), antes);
});

test('B3 parte: las cuatro secciones, sin comandos, SHAs ni rojo/verde; suelta el candado', () => {
  const p = conPublicar();
  assert.equal(pub(p).codigo, 0);
  fs.mkdirSync(path.join(p.P, '.git', N.CANDADO_CIERRE));
  const out = [];
  const c = N.main(['parte', 'x', '--no-pude', 'algo que no se pudo'], { cwd: p.P, salida: (s) => out.push(s), error: (s) => out.push(s), ahora: new Date() });
  assert.equal(c, 0, out.join(''));
  const t = out.join('');
  const ls = t.split('\n');
  const k = ['## Qué quedó', '## Te necesito', '## Qué se hizo', '## Lo que no pude'].map((s) => ls.indexOf(s));
  assert.ok(k.every((i, j) => i >= 0 && (j === 0 || i > k[j - 1])), t);
  assert.match(t, /- Integrado: sí/);
  assert.match(t, /- Publicado: sí/);
  assert.match(t, /- La prueba de humo: pasó/);
  assert.match(t, /- algo que no se pudo/);
  const cuerpo = t.split('(el parte quedó en')[0];
  for (const re of RE_NADA_PARA_EL_DUENO) assert.doesNotMatch(cuerpo, re);
  assert.ok(!fs.existsSync(path.join(p.P, '.git', N.CANDADO_CIERRE)), 'el candado se suelta');
});

test('B3 cierre: sin integrar se niega; la línea trae dontAsk, KIT_FONDO=1, --name y la carpeta principal; la lista no trae push ni publicar suelto ni Edit fuera de papeles; una allow de más va a --disallowedTools', () => {
  const p = conPublicar();
  const ci = (cwd, x = 'x') => {
    const out = [];
    return { codigo: N.main(['cierre', x], { cwd, home: p.home, claudeEnPath: true, salida: (s) => out.push(s), error: (s) => out.push(s) }), out: out.join('') };
  };
  g(p.P, 'branch', 'modulo/sin', 'main');
  g(p.P, 'switch', '-q', 'modulo/sin');
  commit(p.P, { 'src/z.js': '1\n' }, 'sin integrar');
  g(p.P, 'switch', '-q', 'main');
  const no = ci(p.P, 'sin');
  assert.equal(no.codigo, 1);
  assert.match(no.out, /todavía no está en main: primero integrar/);
  escribir(p.P, '.claude/settings.local.json', JSON.stringify({ permissions: { allow: ['Bash(npm run deploy:*)', 'Bash(git status:*)', 'Bash(node .claude/scripts/cambios.cjs:*)'] } }));
  const r = ci(p.P);
  assert.equal(r.codigo, 0, r.out);
  const linea = r.out.split('\n').find((l) => l.startsWith('cierre de fondo: '));
  assert.ok(linea, r.out);
  assert.match(linea, /--permission-mode dontAsk/);
  assert.match(linea, /KIT_FONDO=1 /);
  assert.match(linea, /--name cierre-x/);
  assert.ok(linea.includes(`cd "${p.P.split('\\').join('/')}"`), linea);
  // rt B 11: lo negado va en un settings aparte (sin comillas que rompan la línea)
  assert.doesNotMatch(linea, /--disallowedTools/);
  assert.match(linea, /--settings "[^"]+kit-cierre-settings\.json"/);
  assert.match(linea, /KIT_CIERRE_ID=[0-9a-f]{12} /);
  const negado = JSON.parse(fs.readFileSync(path.join(p.P, '.git', N.SETTINGS_CIERRE), 'utf8')).permissions.deny.map((r) => `"${r}"`).join(' ');
  const lista = linea.split(' --allowedTools ')[1];
  assert.doesNotMatch(lista, /git fetch/, 'rt B 2: git fetch fuera (el pull trae)');
  assert.doesNotMatch(lista, /git push/);
  assert.doesNotMatch(lista, /scripts\/publicar|npm run deploy/);
  for (const e of lista.match(/(Edit|Write)\([^)]*\)/g)) assert.match(e, /^(Edit|Write)\(\.\/docs\/\*\*\)$/);
  assert.match(negado, /"Bash\(npm run deploy:\*\)"/, 'la allow de más del local');
  assert.doesNotMatch(negado, /"Bash\(git status:\*\)"/, 'la que ya está en la lista, no');
  assert.doesNotMatch(negado, /"Bash\(node \.claude\/scripts\/cambios\.cjs:\*\)"/, 'la ancha que cubre verificar no se niega (apagaría la lista)');
  assert.match(negado, /"Bash\(node \.claude\/scripts\/cambios\.cjs aprobar:\*\)"/, 'pero aprobar sí, siempre');
  assert.match(negado, /"Bash\(git push:\*\)"/);
  for (const c of ['rechazar', 'anotar-sha', 'subio-al-kit']) assert.ok(negado.includes(`"Bash(node .claude/scripts/cambios.cjs ${c}:*)"`), c);
  // rt B 1: una allow ancha que no es del kit (Bash pelado, git entero, Edit sin ruta) frena el cierre; la forma con espacio es la misma
  for (const ancha of ['Bash', 'Bash(git:*)', 'Bash(git *)', 'Edit']) {
    escribir(p.P, '.claude/settings.local.json', JSON.stringify({ permissions: { allow: [ancha] } }));
    const a = ci(p.P);
    assert.equal(a.codigo, 1, ancha);
    assert.match(a.out, /hay un permiso ancho/, ancha);
  }
  // una allow con la forma de espacio que es la misma de la lista no se niega (si no, apagaría el commit de papeles)
  escribir(p.P, '.claude/settings.local.json', JSON.stringify({ permissions: { allow: ['Bash(git commit *)', 'Edit(docs/**)', "Bash(cmd //c 'C:\\x\\y.bat' *)"] } }));
  const e = ci(p.P);
  assert.equal(e.codigo, 0, e.out);
  const deny2 = JSON.parse(fs.readFileSync(path.join(p.P, '.git', N.SETTINGS_CIERRE), 'utf8')).permissions.deny;
  assert.ok(!deny2.includes('Bash(git commit *)') && !deny2.includes('Edit(docs/**)'), JSON.stringify(deny2));
  assert.ok(deny2.includes("Bash(cmd //c 'C:\\x\\y.bat' *)"), 'la de comillas y barras va al settings, sin romper la línea');
  fs.rmSync(path.join(p.P, '.claude', 'settings.local.json'));
  const wt = path.join(p.P, '.claude', 'worktrees', 'modulo--x');
  g(p.P, 'worktree', 'add', '-q', wt, 'modulo/x');
  assert.ok(ci(wt).out.includes(`cd "${p.P.split('\\').join('/')}"`), 'desde el worktree del director, la carpeta principal');
});

test('B3 cubre: la allow ancha cubre al ítem; la de otra herramienta o más angosta, no', () => {
  assert.equal(N.cubre('Bash(git:*)', 'Bash(git status:*)'), true);
  assert.equal(N.cubre('Bash(git status:*)', 'Bash(git status:*)'), true);
  assert.equal(N.cubre('Read', 'Read(./**)'), true);
  assert.equal(N.cubre('Bash(git push:*)', 'Bash(git status:*)'), false);
  assert.equal(N.cubre('Edit(./src/**)', 'Edit(./docs/**)'), false);
  assert.equal(N.cubre('Bash(npm run deploy)', 'Bash(git log:*)'), false);
  assert.equal(N.cubre('Bash(git *)', 'Bash(git status:*)'), true);
  assert.equal(N.cubre('Edit(docs/**)', 'Edit(./docs/**)'), true);
  assert.equal(N.cubre('Bash(git commit:*)', 'Bash(git commit -m x)'), true);
});

// ---- lo que pidió el red team de B3 (rt B 3 a 12)

const pubsEnTmp = () => fs.readdirSync(os.tmpdir()).filter((n) => n.startsWith('kit-pub-')).length;

test('rt B 3: un archivo que git no sigue fuera de los papeles frena publicar; en los papeles, no', () => {
  const p = conPublicar();
  escribir(p.P, 'app/admin/page.tsx', 'x\n');
  const r = pub(p);
  assert.equal(r.codigo, 1, r.out);
  assert.match(r.out, /archivos que git no sigue fuera de los papeles/);
  assert.equal(veces(p), 0);
  fs.rmSync(path.join(p.P, 'app'), { recursive: true });
  escribir(p.P, 'docs/nota-suelta.md', 'x\n');
  assert.equal(pub(p).codigo, 0);
});

test('rt B 4 y 5: la salida del comando no queda en el temporal; un comando que falla deja trabado; una publicación a medias da 3', () => {
  const antes = pubsEnTmp();
  const p = conPublicar();
  assert.equal(pub(p).codigo, 0);
  assert.equal(pubsEnTmp(), antes, 'el archivo de la salida se borra');
  // el comando falla: queda trabado
  const q = conPublicar();
  fs.writeFileSync(path.join(q.m, 'publicado-falla'), '1');
  const r = pub(q);
  assert.equal(r.codigo, 1, r.out);
  assert.match(r.out, /el comando de publicar falló .*queda trabado/);
  assert.equal(resultado(q).trabado, true);
  // a medias: la marca "en curso" quedó de una corrida cortada
  const m = conPublicar();
  fs.writeFileSync(path.join(m.P, '.git', N.PUBLICACION), JSON.stringify({ enCurso: { commit: 'x' } }));
  const c = pub(m);
  assert.equal(c.codigo, 3, c.out);
  assert.match(c.out, /quedó a medias/);
  assert.ok(ESP.teEspera(m.P).some((i) => /a medias/.test(i.texto)));
  assert.equal(veces(m), 0);
});

test('rt B 8 y 9: el chequeo 4 deja su motivo en "te necesito" y --seguir lo destraba; sin el archivo con que se publica → 3', () => {
  const p = conPublicar();
  assert.equal(pub(p).codigo, 0);
  commit(p.P, { 'src/suelto.js': 'x\n' }, 'código directo en main');
  g(p.P, 'push', '-q', 'origin', 'main');
  assert.equal(pub(p).codigo, 1);
  assert.ok(ESP.teEspera(p.P).some((i) => /por fuera de un módulo/.test(i.texto)));
  assert.equal(pub(p, ['--seguir']).codigo, 0);
  assert.equal(veces(p), 2);
  const sin = conPublicar({ publicar: '{comando: "node scripts/no-esta.cjs", humo: "node scripts/humo.cjs x"}', huella: '000000000000' });
  const r = pub(sin);
  assert.equal(r.codigo, 3, r.out);
  assert.match(r.out, /no encuentro en main el archivo con que se publica \(scripts\/no-esta\.cjs\)/);
});

test('rt B 6 y 10: el parte filtra lo que viene del modelo (SHAs, comandos, rojo/verde) y no suelta un candado ajeno', () => {
  const p = conPublicar();
  const dir = path.join(p.P, '.git', N.CANDADO_CIERRE);
  fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, 'quien.json'), JSON.stringify({ modulo: 'otro', id: 'abc', desde: new Date().toISOString() }));
  const out = [];
  N.main(['parte', 'x', '--no-pude', 'node .claude/scripts/estructura.cjs todo dio rojo en 3f2a1bc9'], { cwd: p.P, env: { KIT_CIERRE_ID: 'def' }, salida: (s) => out.push(s), error: (s) => out.push(s) });
  const cuerpo = out.join('').split('(el parte quedó en')[0];
  for (const re of RE_NADA_PARA_EL_DUENO) assert.doesNotMatch(cuerpo, re);
  assert.match(cuerpo, /un paso del kit dio falló en/);
  assert.ok(fs.existsSync(dir), 'el candado de otro cierre no se suelta');
  assert.equal(N.paraElDueno('quedó en verde: `git push` @abc1234'), 'quedó en pasó: un paso del kit');
});

test('rt B 12: en un proyecto que publica al subir, con la publicación trabada, subir no sube', () => {
  const p = conPublicar({ publicar: '{comando: al-subir, humo: "node scripts/humo.cjs x"}', origin: null });
  fs.writeFileSync(path.join(p.P, '.git', N.PUBLICACION), JSON.stringify({ trabado: true }));
  commit(p.P, { 'docs/CHANGELOG.md': '# c\n' }, 'papeles');
  const out = [];
  const c = N.main(['subir', 'x'], { cwd: p.P, salida: (s) => out.push(s), error: (s) => out.push(s) });
  assert.equal(c, 1);
  assert.match(out.join(''), /publica al subir y la última publicación quedó trabada/);
});

test('mutación de B3: la carpeta sucia y HEAD distinto de origin frenan ANTES de correr nada (ni las pruebas)', () => {
  const p = conPublicar();
  fs.writeFileSync(path.join(p.P, 'a.txt'), 'cambiado\n');
  const r = pub(p);
  assert.equal(r.codigo, 1, r.out);
  assert.match(r.out, /cambios sin guardar/);
  assert.equal(resultado(p).pasos, undefined, 'no corrió nada: ni las pruebas');
  g(p.P, 'checkout', '--', 'a.txt');
  // un commit de papeles que origin no tiene: no está igual a origin
  commit(p.P, { 'docs/CHANGELOG.md': '# c\n' }, 'papeles sin subir');
  const h = pub(p);
  assert.equal(h.codigo, 1, h.out);
  assert.match(h.out, /no está igual a origin\/main/);
  assert.equal(veces(p), 0);
});

test('red team de B3 (6): de fondo, publicar y subir corren solo con el candado del cierre tomado por esa misma sesión', () => {
  const p = conPublicar();
  const F = { KIT_FONDO: '1', KIT_CIERRE_ID: 'c-uno' };
  let r = pub(p, [], { env: F });
  assert.equal(r.codigo, 1, r.out);
  assert.match(r.out, /^publicar: no — de fondo, publicar va dentro de una sesión de cierre con el candado tomado \(cierre-empieza x primero\)\n$/);
  assert.equal(veces(p), 0);
  const s = N.main(['subir', 'x'], { cwd: p.P, env: F, salida: () => {}, error: () => {} });
  assert.equal(s, 1);
  // Con el candado de OTRA sesión de cierre, tampoco.
  assert.equal(N.main(['cierre-empieza', 'x'], { cwd: p.P, env: { KIT_FONDO: '1', KIT_CIERRE_ID: 'c-otro' }, salida: () => {}, error: () => {} }), 0);
  assert.equal(pub(p, [], { env: F }).codigo, 1);
  fs.rmSync(path.join(p.P, '.git', N.CANDADO_CIERRE), { recursive: true, force: true });
  // Con el suyo: publica.
  assert.equal(N.main(['cierre-empieza', 'x'], { cwd: p.P, env: F, salida: () => {}, error: () => {} }), 0);
  r = pub(p, [], { env: F });
  assert.equal(r.codigo, 0, r.out);
  assert.equal(veces(p), 1);
  // Con persona (sin KIT_FONDO), como siempre: no hace falta el candado.
  fs.rmSync(path.join(p.P, '.git', N.CANDADO_CIERRE), { recursive: true, force: true });
  assert.equal(pub(p).codigo, 0);
});

test('red team de B3 (7): un merge con el asunto de integrar cuyo segundo padre no es del módulo no cuenta como módulo integrado', () => {
  const p = conPublicar();
  assert.equal(pub(p).codigo, 0);
  g(p.P, 'switch', '-q', '-c', 'suelta');
  commit(p.P, { 'src/otro.js': 'de otro lado\n' }, 'código suelto');
  g(p.P, 'switch', '-q', 'main');
  g(p.P, 'merge', '-q', '--no-ff', '-m', 'integrar: módulo x', 'suelta');
  g(p.P, 'push', '-q', 'origin', 'main');
  const r = pub(p);
  assert.equal(r.codigo, 1, r.out);
  assert.match(r.out, /entró algo que no es un módulo integrado ni papeles: no publico/);
  assert.equal(veces(p), 1);
});

test('P4 (2026-11-13): de fondo, parte suelta el candado y el subir del MISMO cierre sigue; otro cierre, no; una carpeta de trabajo que quedó en el disco no es "limpias: sí"', () => {
  const p = conPublicar();
  const F = { KIT_FONDO: '1', KIT_CIERRE_ID: 'c-uno' };
  const corre = (args, env) => {
    const out = [];
    const codigo = N.main(args, { cwd: p.P, home: p.home, env, salida: (s) => out.push(s), error: (s) => out.push(s) });
    return { codigo, out: out.join('') };
  };
  assert.equal(corre(['cierre-empieza', 'x'], F).codigo, 0);
  // Una carpeta de trabajo que git ya no tiene registrada pero sigue en el disco (una sesión la tenía abierta).
  fs.mkdirSync(path.join(p.P, '.claude', 'worktrees', 'modulo--x--02', 'src'), { recursive: true });
  const pa = corre(['parte', 'x'], F);
  assert.equal(pa.codigo, 0, pa.out);
  assert.match(pa.out, /- Las carpetas limpias: no \(quedan 1\)/);
  assert.equal(fs.existsSync(path.join(p.P, '.git', N.CANDADO_CIERRE)), false, 'parte soltó el candado');
  const otro = corre(['subir', 'x'], { KIT_FONDO: '1', KIT_CIERRE_ID: 'c-otro' });
  assert.equal(otro.codigo, 1);
  assert.match(otro.out, /candado tomado/);
  const s = corre(['subir', 'x'], F);
  assert.doesNotMatch(s.out, /candado/, s.out);
  assert.equal(s.codigo, 0, s.out);
});

test('P4 (2026-11-13): la lista del cierre no trae Write (la línea de comandos solo mira Edit para archivos) y cierre-noche.md pide cada comando solo y tal cual, sin fetch, y esperar a publicar', () => {
  const lista = N.listaCierre('x', 'main', 'docs');
  assert.ok(lista.includes('Edit(./docs/**)'));
  assert.ok(!lista.some((r) => /^Write\(/.test(r)), lista.join(' '));
  const t = fs.readFileSync(path.join(__dirname, '..', 'skills', 'director', 'cierre-noche.md'), 'utf8');
  assert.match(t, /Cada comando, solo y tal cual/);
  assert.match(t, /sin `cd`, sin `;`, `&&` ni `\|`, sin `echo`/);
  assert.match(t, /`git fetch` no está en la lista/);
  assert.match(t, /esperá a que termine \(su aviso de que terminó\)/);
  assert.ok(t.split('\n').length <= 60, 'cierre-noche.md: ≤ 60 renglones');
});

test('revisor frío de B (2): con la rama del módulo ya borrada por limpiar, el parte sigue diciendo "Integrado: sí" (por el merge de integrar)', () => {
  const p = conPublicar();
  g(p.P, 'branch', '-D', 'modulo/x');
  g(p.P, 'push', '-q', 'origin', '--delete', 'modulo/x');
  g(p.P, 'fetch', '-q', '--prune', 'origin');
  const out = [];
  assert.equal(N.main(['parte', 'x'], { cwd: p.P, env: {}, salida: (s) => out.push(s), error: (s) => out.push(s) }), 0);
  assert.match(out.join(''), /- Integrado: sí/);
  assert.doesNotMatch(out.join(''), /no quedó integrado/);
});

test('revisor frío de B (3): publicar corre el comando-setup en la carpeta principal y, si cambió core.hooksPath (husky), lo repone', () => {
  const prepara = "require('child_process').execFileSync('git', ['config', 'core.hooksPath', '.husky']);" + String.fromCharCode(10);
  const p = conPublicar({ setup: 'node scripts/prepara.cjs', archivos: { 'scripts/prepara.cjs': prepara } });
  g(p.P, 'config', 'core.hooksPath', '.githooks');
  const r = pub(p);
  assert.equal(r.codigo, 0, r.out);
  assert.equal(g(p.P, 'config', '--get', 'core.hooksPath'), '.githooks');
});

test('P4 (2026-11-13): después de publicar, si solo entraron papeles (el parte, el handoff), la noche siguiente no vuelve a publicar lo mismo', () => {
  const p = conPublicar();
  assert.equal(pub(p).codigo, 0);
  assert.equal(veces(p), 1);
  commit(p.P, { 'docs/modulos/x/bitacora/2026-11-13-parte.md': '# Parte\n' }, 'docs: parte de la noche · x');
  g(p.P, 'push', '-q', 'origin', 'main');
  const r = pub(p);
  assert.equal(r.codigo, 0, r.out);
  assert.match(r.out, /desde lo último publicado solo entraron papeles: no hay nada nuevo que publicar/);
  assert.equal(veces(p), 1, 'no volvió a publicar');
});

test('P4 (2026-11-13): el worktree del director de este módulo no cuenta en "carpetas limpias" (sigue vivo después de la noche); el de otro módulo, sí', () => {
  const p = conPublicar();
  g(p.P, 'worktree', 'add', '-q', path.join(p.P, '.claude', 'worktrees', 'modulo--x'), 'modulo/x');
  const parteDe = () => {
    const out = [];
    N.main(['parte', 'x'], { cwd: p.P, env: {}, salida: (s) => out.push(s), error: (s) => out.push(s) });
    return out.join('');
  };
  assert.match(parteDe(), /- Las carpetas limpias: sí/);
  g(p.P, 'worktree', 'add', '-q', '-b', 'modulo/y', path.join(p.P, '.claude', 'worktrees', 'modulo--y'));
  assert.match(parteDe(), /- Las carpetas limpias: no \(quedan 1\)/);
});
