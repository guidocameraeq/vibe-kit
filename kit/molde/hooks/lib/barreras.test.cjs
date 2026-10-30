'use strict';
// Pruebas de lib/barreras.cjs (candado:barreras; P4.6, P6.1, D2.2 F4): el rango, la cobertura por cambios sellados (un aprobado =
// un commit, aplicado = el primer commit tras el sello), los sellos falsos, las dos exenciones, la ficha del padre rota y los
// criterios 17 y 20. Repos temporales con remoto bare cuando el caso lo pide, sin la configuración de git de la PC.
// Corren con: node --test "kit/**/*.test.cjs".
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-barreras-'));
const GLOBAL = path.join(TMP, 'gitconfig-vacio');
fs.writeFileSync(GLOBAL, '');
Object.assign(process.env, {
  GIT_CONFIG_GLOBAL: GLOBAL,
  GIT_CONFIG_NOSYSTEM: '1',
  XDG_CONFIG_HOME: TMP, // sin el ignore global de la PC (~/.config/git/ignore)
  GIT_AUTHOR_NAME: 'Prueba',
  GIT_AUTHOR_EMAIL: 'prueba@ejemplo.invalid',
  GIT_COMMITTER_NAME: 'Prueba',
  GIT_COMMITTER_EMAIL: 'prueba@ejemplo.invalid',
});
test.after(() => fs.rmSync(TMP, { recursive: true, force: true }));

const B = require('./barreras.cjs');
const C = require('./cambios.cjs');
const zona = require('./zona-propia.cjs');
const frenosLog = require('./frenos-log.cjs');
const script = require('../../scripts/cambios.cjs');

const MOLDE = path.join(__dirname, '..', '..');

// ---------------------------------------------------------------- ayudantes

let n = 0;
function g(cwd, ...args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', env: process.env });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}
function escribir(d, rel, texto) {
  const p = path.join(d, ...rel.split('/'));
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, texto);
}
const leerArchivo = (d, rel) => fs.readFileSync(path.join(d, ...rel.split('/')), 'utf8');
function poner(d, archivos) {
  for (const [rel, texto] of Object.entries(archivos)) {
    if (texto === null) g(d, 'rm', '-q', '--', rel);
    else {
      escribir(d, rel, texto);
      g(d, 'add', '-f', '--', rel);
    }
  }
}
function commit(d, archivos, mensaje = 'c') {
  poner(d, archivos);
  g(d, 'commit', '-q', '--allow-empty', '-m', mensaje);
  return g(d, 'rev-parse', 'HEAD');
}
const FICHA = (o = {}) =>
  [
    '---',
    'kit: 2.4.3',
    `nivel: ${o.nivel || 'estandar'}`,
    'vars:',
    '  proyecto: px',
    'piezas:',
    `  candado: ${o.candado || 'molde'}`,
    `  hook-escritura: ${o.escritura || 'molde'}`,
    `  settings: {estado: molde+propio, hash: ${o.hash || '5d04e9b3c218'}}`,
    'frenos:',
    '  opcionales: []',
    ...(o.quitados ? ['  quitados:', ...o.quitados.map((q) => `    - ${q}`)] : ['  quitados: []']),
    'sensible:',
    `  plata: ${o.plata || 'no'}`,
    'autorizado:',
    `  merge-a-main: ${o.merge || 'con-gate-verde'}`,
    '---',
    '',
  ].join('\n');
const STASH = '{id: deny:Bash(git stash:*), por: "el release lo usa", hasta: siempre}';
const OTRO = '{id: deny:Bash(git clean:*), por: "lo pidió", hasta: siempre}';

// repo({remoto, archivos, ficha}) → la carpeta. Base con .gitignore, a.txt y la ficha (si no se pide sin); con remoto, pusheada.
function repo(o = {}) {
  const d = path.join(TMP, `r${n++}`);
  fs.mkdirSync(d, { recursive: true });
  g(d, 'init', '-q', '-b', 'main');
  const base = { '.gitignore': '/.claude/worktrees/\n/.kit-rol\n', 'a.txt': 'a\n', ...(o.ficha === false ? {} : { '.claude/kit.md': o.ficha || FICHA() }), ...(o.archivos || {}) };
  commit(d, base, 'base');
  if (o.remoto !== false) {
    const bare = `${d}.git`;
    g(TMP, 'init', '-q', '--bare', bare);
    g(d, 'remote', 'add', 'origin', bare);
    g(d, 'push', '-q', '-u', 'origin', 'main');
  }
  return d;
}
const push = (d) => g(d, 'push', '-q', 'origin', 'HEAD');

const CUERPO = '## Caso de origen\nel release usa stash (2026-10)\n\n## Regla\nquitar el freno del stash\n\n## Dónde vive\n.claude/kit.md\n\n## Medición\n| antes | después |\n';
function cli(d, ...args) {
  let out = '';
  const codigo = script.main(args, { cwd: d, salida: (s) => (out += s), error: (s) => (out += s), entradaEstandar: () => CUERPO });
  return { codigo, out };
}
// Un 3-barrera propuesto (con su commit) → id.
function proponer(d, o = {}) {
  const args = ['nuevo', '--slug', o.slug || `c${n++}`, '--clase', '3-barrera', '--toca', o.toca || 'frenos', '--origen', 'lo pidió el dueño'];
  for (const id of o.ids || ['deny:Bash(git stash:*)']) args.push('--id', id);
  const r = cli(d, ...args);
  assert.equal(r.codigo, 0, r.out);
  return /propuesto (\S+)/.exec(r.out)[1];
}
function aprobar(d, id) {
  const r = cli(d, 'aprobar', id);
  assert.equal(r.codigo, 0, r.out);
  return g(d, 'rev-parse', 'HEAD');
}
const aprobado = (d, o) => {
  const id = proponer(d, o);
  return { id, sello: aprobar(d, id) };
};
const rel = (id) => `.claude/cambios/${id}.md`;

// El sello hecho A MANO (lo que haría un agente con Bash, sin el script).
function sellarAMano(d, id, o = {}) {
  const r = rel(id);
  const texto = leerArchivo(d, r);
  const ahora = new Date();
  const rama = g(d, 'symbolic-ref', '--short', 'HEAD');
  const datos = { id: C.ID_APROBAR, herramienta: C.HERRAMIENTA_APROBAR, detalle: id, rol: 'humano', rama };
  const freno = frenosLog.renglon(datos, ahora);
  const s = { sesion: 'sin-marca', fecha: frenosLog.fechaConZona(ahora), carpeta: o.carpeta || '.', rol: 'humano', hash: C.hashSello(texto), freno };
  escribir(d, r, C.ponerCampos(texto, { estado: 'aprobado', aprobo: C.textoSello(s) }));
  frenosLog.anotar(d, datos, ahora);
  g(d, 'add', '--', r, '.claude/frenos.log');
  g(d, 'commit', '-q', '-m', `cambios: aprobado ${id}`);
  return g(d, 'rev-parse', 'HEAD');
}

const revisar = (d, o) => B.revisarBarreras(d, o);
function verde(d, o) {
  const f = revisar(d, o);
  assert.deepEqual(f, [], JSON.stringify(f, null, 1));
}
function rojo(d, re, o) {
  const f = revisar(d, o);
  assert.ok(f.length && f.every((x) => x.id === 'candado:barreras'), `esperaba rojo y vino: ${JSON.stringify(f)}`);
  if (re) assert.ok(f.some((x) => re.test(x.que)), `esperaba ${re} y vino: ${JSON.stringify(f.map((x) => x.que))}`);
  return f;
}
const quitarStash = (d) => commit(d, { '.claude/kit.md': FICHA({ quitados: [STASH] }) }, 'quita el freno del stash');

// ---------------------------------------------------------------- el rango

test('rango: con remoto, origin/main..HEAD; sin remoto fuera de main, main..HEAD; en main, desde el último cierre; sin base, nada', () => {
  const d = repo();
  const c1 = commit(d, { 'b.txt': 'b\n' });
  assert.deepEqual(B.rango(d).commits, [c1]);
  push(d);
  assert.deepEqual(B.rango(d).commits, []);

  const s = repo({ remoto: false });
  const s1 = commit(s, { 'b.txt': 'b\n' });
  assert.deepEqual(B.rango(s).commits, [], 'en main sin base: solo lo pendiente');
  assert.match(B.rango(s).como, /sin base/);
  const h = commit(s, { 'docs/SESSION_HANDOFF.md': '# Handoff\n' });
  const s2 = commit(s, { 'c.txt': 'c\n' });
  assert.deepEqual(B.rango(s).commits, [h, s2], 'desde la base de todo.cjs, con ella (rf-4)');
  assert.ok(!B.rango(s).commits.includes(s1));
  g(s, 'checkout', '-q', '-b', 'otra');
  const s3 = commit(s, { 'd.txt': 'd\n' });
  assert.deepEqual(B.rango(s).commits, [s3], 'fuera de main: main..HEAD');
});

test('un commit que quita un freno sin aprobado → rojo; también si es un commit anterior de la sesión y lo pendiente está limpio', () => {
  const d = repo();
  const x = quitarStash(d);
  const f = rojo(d, /sin un aprobado sellado/);
  assert.equal(f[0].commit, x);
  assert.match(f[0].que, /deny:Bash\(git stash:\*\)/);
  assert.equal(f[0].detalle, '.claude/kit.md');
  commit(d, { 'b.txt': 'otra cosa\n' });
  assert.equal(g(d, 'status', '--porcelain'), '');
  assert.equal(rojo(d)[0].commit, x, 'el commit viejo de la sesión no se escapa');
  push(d);
  verde(d); // ya en el remoto: fuera del rango
});

test('lo pendiente cuenta como un commit más: el índice y el disco, cada uno', () => {
  const d = repo();
  escribir(d, '.claude/kit.md', FICHA({ quitados: [STASH] }));
  assert.equal(rojo(d)[0].commit, B.PENDIENTE);
  g(d, 'add', '.claude/kit.md');
  escribir(d, '.claude/kit.md', FICHA()); // el disco vuelve atrás, el índice no
  assert.equal(rojo(d)[0].commit, B.PENDIENTE);
  g(d, 'reset', '-q', '--', '.claude/kit.md');
  verde(d);
  escribir(d, '.claude/settings.local.json', '{"permissions": {"allow": ["Bash(rm:*)"]}}\n'); // nuevo, sin commitear
  assert.match(rojo(d)[0].que, /settings/);
});

// ---------------------------------------------------------------- la cobertura

test('con un aprobado sellado que lo nombra → verde (pendiente y commiteado); el aplicado bien anotado sigue verde', () => {
  const d = repo();
  const { id, sello } = aprobado(d);
  escribir(d, '.claude/kit.md', FICHA({ quitados: [STASH] }));
  verde(d);
  const x = commit(d, { '.claude/kit.md': FICHA({ quitados: [STASH] }) });
  verde(d);
  const r = cli(d, 'anotar-sha', id, x);
  assert.equal(r.codigo, 0, r.out);
  commit(d, { [rel(id)]: leerArchivo(d, rel(id)) }, 'anota');
  verde(d);
  assert.ok(sello);
});

test('aprobado que no nombra la categoría → rojo; ids que no cubren un id cambiado → rojo', () => {
  const d = repo();
  aprobado(d, { toca: 'settings', ids: ['deny:Bash(git stash:*)'] });
  quitarStash(d);
  rojo(d, /sin un aprobado sellado/); // no lo cubre: el commit no toca lo de su toca
  const d2 = repo();
  aprobado(d2, { toca: 'settings,frenos', ids: ['deny:Bash(git stash:*)'] });
  commit(d2, { '.claude/kit.md': FICHA({ quitados: [STASH] }), '.githooks/pre-commit': 'x\n' });
  rojo(d2, /no nombran githooks/);

  const e = repo();
  aprobado(e, { ids: ['deny:Bash(git clean:*)'] });
  quitarStash(e);
  rojo(e, /no nombran deny:Bash\(git stash:\*\)/);

  const f = repo(); // r2-4: "quitar el freno X" no deja pasar un commit que quite también Y
  aprobado(f);
  commit(f, { '.claude/kit.md': FICHA({ quitados: [STASH, OTRO] }) });
  rojo(f, /git clean/);
});

test('toca ⊇ categorías aparte de los ids: un aprobado de frenos que declara sensible:plata no cubre un cambio de sensible', () => {
  const d = repo();
  aprobado(d, { toca: 'frenos', ids: ['deny:Bash(git stash:*)', 'sensible:plata'] });
  commit(d, { '.claude/kit.md': FICHA({ quitados: [STASH], plata: '[la caja]' }) });
  rojo(d, /no nombran sensible$/);
});

test('dos aprobados cubren juntos (la unión): uno de frenos y otro de settings en el mismo commit', () => {
  const d = repo();
  aprobado(d);
  aprobado(d, { toca: 'settings', ids: ['allow:Bash(npm test:*)'] });
  commit(d, { '.claude/kit.md': FICHA({ quitados: [STASH] }), '.claude/settings.json': '{"permissions": {"allow": ["Bash(npm test:*)"]}}\n' });
  verde(d);
});

test('un aprobado = un commit: el segundo commit con el mismo aprobado → rojo (y lo pendiente después del primero, también)', () => {
  const d = repo();
  aprobado(d);
  const x1 = quitarStash(d);
  verde(d);
  escribir(d, '.claude/kit.md', FICHA());
  assert.equal(rojo(d)[0].commit, B.PENDIENTE, 'ya lo consumió x1');
  const x2 = commit(d, { '.claude/kit.md': FICHA() });
  const f = rojo(d);
  assert.deepEqual(f.map((x) => x.commit), [x2]);
  assert.ok(x1);
});

test('aplicado reapuntado a un commit posterior → rojo los dos (r5-1); un aplicado no cubre lo pendiente', () => {
  const d = repo();
  const { id } = aprobado(d);
  const x1 = quitarStash(d);
  const x2 = commit(d, { '.claude/kit.md': FICHA() });
  const texto = leerArchivo(d, rel(id));
  escribir(d, rel(id), C.ponerCampos(texto, { estado: 'aplicado', sha: x2 }));
  const f = rojo(d);
  assert.deepEqual(f.map((x) => x.commit).sort(), [x1, x2].sort());

  const e = repo();
  const a = aprobado(e);
  const y1 = quitarStash(e);
  escribir(e, rel(a.id), C.ponerCampos(leerArchivo(e, rel(a.id)), { estado: 'aplicado', sha: y1 }));
  verde(e);
  escribir(e, '.claude/kit.md', FICHA());
  assert.equal(rojo(e)[0].commit, B.PENDIENTE);
});

test('sellos que no valen → rojo: de otra carpeta, traído por merge --no-ff, estado aprobado a mano, editado después del clic', () => {
  const otra = repo();
  sellarAMano(otra, proponer(otra), { carpeta: '.claude/worktrees/w1' });
  quitarStash(otra);
  rojo(otra, /sin un aprobado/);

  const merge = repo();
  const id = proponer(merge);
  g(merge, 'checkout', '-q', '-b', 'modulo/x--1');
  sellarAMano(merge, id);
  g(merge, 'checkout', '-q', 'main');
  g(merge, 'merge', '-q', '--no-ff', '-m', 'merge', 'modulo/x--1');
  quitarStash(merge);
  rojo(merge, /sin un aprobado/);

  const mano = repo();
  const id2 = proponer(mano);
  commit(mano, { [rel(id2)]: C.ponerCampos(leerArchivo(mano, rel(id2)), { estado: 'aprobado' }) });
  quitarStash(mano);
  rojo(mano, /sin un aprobado/);

  const editado = repo();
  const a = aprobado(editado);
  escribir(editado, rel(a.id), leerArchivo(editado, rel(a.id)).replace('quitar el freno del stash', 'quitar todos los frenos'));
  quitarStash(editado);
  rojo(editado, /sin un aprobado/);
});

test('un aprobado rechazado después ya no cubre nada, aunque el sello siga en orden', () => {
  const d = repo();
  const { id } = aprobado(d);
  const r = cli(d, 'rechazar', id, 'al final no');
  assert.equal(r.codigo, 0, r.out);
  quitarStash(d);
  rojo(d, /sin un aprobado/);
});

test('el sello tiene que ser anterior al commit: un aprobado sellado después no lo cubre', () => {
  const d = repo();
  quitarStash(d);
  aprobado(d);
  rojo(d);
});

test('los scripts del candado son barrera (r4-3): editar estructura.cjs o cambios.cjs → rojo; un hooks aprobado con su id → verde', () => {
  for (const r of ['.claude/scripts/estructura.cjs', '.claude/scripts/cambios.cjs', '.claude/hooks/lib/barreras.cjs', '.githooks/pre-commit', '.gitleaks.toml']) {
    const d = repo();
    commit(d, { [r]: 'process.exitCode = 0;\n' });
    rojo(d, new RegExp(r.replace(/\./g, '\\.')));
  }
  const d = repo();
  aprobado(d, { toca: 'hooks', ids: ['hooks:.claude/scripts/estructura.cjs'] });
  commit(d, { '.claude/scripts/estructura.cjs': 'x\n' });
  verde(d);
});

test('borrar la ficha cambia todos sus ids, y tocar settings después sigue en rojo (r4-2: borrarla no apaga el candado)', () => {
  const d = repo();
  const x1 = commit(d, { '.claude/kit.md': null });
  const x2 = commit(d, { '.claude/settings.json': '{"permissions": {"allow": ["Bash(*)"]}}\n' });
  const f = rojo(d);
  assert.deepEqual(f.map((x) => x.commit), [x1, x2]);
  assert.match(f[0].que, /toca autorizado, frenos, sensible/);
  push(d); // aunque ya no esté en ningún lado de la rama, la historia la tuvo
  commit(d, { '.claude/settings.json': '{}\n' });
  rojo(d, /settings/);
});

test('apagar piezas.candado o bajar de nivel → rojo; prender el candado o cambiar un hash → verde (r5-3)', () => {
  const a = repo();
  commit(a, { '.claude/kit.md': FICHA({ candado: 'no' }) });
  rojo(a, /pieza:candado/);
  const b = repo();
  commit(b, { '.claude/kit.md': FICHA({ escritura: 'no' }) });
  rojo(b, /pieza:hook-escritura/);
  const c = repo();
  commit(c, { '.claude/kit.md': FICHA({ nivel: 'liviano' }) });
  rojo(c, /nivel/);
  const d = repo({ ficha: FICHA({ candado: 'no' }) });
  commit(d, { '.claude/kit.md': FICHA({ candado: 'molde' }) });
  verde(d);
  const e = repo();
  commit(e, { '.claude/kit.md': FICHA({ hash: 'aaaaaaaaaaaa' }) });
  verde(e);
});

// ---------------------------------------------------------------- exención (a)

function moldeDe(archivos) {
  const m = path.join(TMP, `molde${n++}`);
  for (const [r, t] of Object.entries(archivos)) escribir(m, r, t);
  return m;
}

test('exención (a): con --molde y el hook igual al molde → verde; distinto → rojo; sin --molde → no hay exención', () => {
  const molde = moldeDe({ 'hooks/x.cjs': 'nuevo\n', 'scripts/estructura.cjs': 'candado nuevo\n' });
  const d = repo({ archivos: { '.claude/hooks/x.cjs': 'viejo\n' } });
  commit(d, { '.claude/hooks/x.cjs': 'nuevo\n', '.claude/scripts/estructura.cjs': 'candado nuevo\n' });
  verde(d, { molde });
  rojo(d, /hooks/);
  const e = repo({ archivos: { '.claude/hooks/x.cjs': 'viejo\n' } });
  commit(e, { '.claude/hooks/x.cjs': 'otro\n' });
  rojo(e, /hooks:\.claude\/hooks\/x\.cjs/, { molde });
  // lo pendiente: un hook nuevo, solo en el disco (no está en el índice), igual al molde → verde
  const p = repo();
  escribir(p, '.claude/hooks/x.cjs', 'nuevo\n');
  verde(p, { molde });
  escribir(p, '.claude/hooks/x.cjs', 'nuevo distinto\n');
  rojo(p, null, { molde });
});

test('exención (a): un hook viejo borrado vale si el molde tampoco lo trae; el .propio.sh nunca; la zona propia no se mueve', () => {
  const molde = moldeDe({ 'hooks/x.cjs': 'nuevo\n', 'hooks/t.md': 'a\n<!-- kit:propio -->\n<!-- /kit:propio -->\nb2\n' });
  const d = repo({ archivos: { '.claude/hooks/viejo.cjs': 'v\n', '.claude/hooks/x.cjs': 'nuevo\n' } });
  commit(d, { '.claude/hooks/viejo.cjs': null });
  verde(d, { molde });
  const e = repo({ archivos: { '.claude/hooks/x.cjs': 'nuevo\n' } });
  commit(e, { '.claude/hooks/x.cjs': null });
  rojo(e, null, { molde }); // el molde todavía lo trae
  const p = repo({ archivos: { '.claude/hooks/session-start.propio.sh': 'echo hola\n' } });
  commit(p, { '.claude/hooks/session-start.propio.sh': null });
  rojo(p, /propio/, { molde });
  // un texto con zona propia: lo de afuera como el molde nuevo y la zona igual que antes → verde; la zona cambiada → rojo
  const t = repo({ archivos: { '.claude/hooks/t.md': 'a\n<!-- kit:propio -->\nmío\n<!-- /kit:propio -->\nb\n' } });
  commit(t, { '.claude/hooks/t.md': 'a\n<!-- kit:propio -->\nmío\n<!-- /kit:propio -->\nb2\n' });
  verde(t, { molde });
  const u = repo({ archivos: { '.claude/hooks/t.md': 'a\n<!-- kit:propio -->\nmío\n<!-- /kit:propio -->\nb\n' } });
  commit(u, { '.claude/hooks/t.md': 'a\n<!-- kit:propio -->\notro mío\n<!-- /kit:propio -->\nb2\n' });
  rojo(u, null, { molde });
});

// El settings del molde viejo: el de hoy sin el hook de niega-aprobar ni las ask (lo que trajo D2.1).
function settingsViejo() {
  const v = JSON.parse(fs.readFileSync(path.join(MOLDE, 'settings.json'), 'utf8'));
  delete v.permissions.ask;
  v.hooks.PreToolUse = v.hooks.PreToolUse.filter((x) => x.matcher !== 'Bash|PowerShell');
  return v;
}
const PROPIA = 'Bash(npm test:*)';

test('criterio 20: el actualizador toca un settings molde+propio sin cambiar lo propio ni los frenos, con --molde → verde', () => {
  const viejo = settingsViejo();
  const proyecto = JSON.parse(JSON.stringify(viejo));
  proyecto.permissions.allow.push(PROPIA);
  const d = repo({ archivos: { '.claude/settings.json': zona.textoSettings(proyecto) } });
  const nuevo = JSON.parse(fs.readFileSync(path.join(MOLDE, 'settings.json'), 'utf8'));
  const m = zona.mezclarSettings({ viejo: zona.textoSettings(viejo), nuevo: zona.textoSettings(nuevo), proyecto: zona.textoSettings(proyecto), quitados: [] });
  assert.equal(m.ok, true, m.problema);
  commit(d, { '.claude/settings.json': zona.textoSettings(m.settings), '.claude/kit.md': FICHA({ hash: 'bbbbbbbbbbbb' }) }, 'molde v3 orden 2b');
  verde(d, { molde: MOLDE });
  rojo(d, /settings/); // sin --molde no hay exención
  // si el mismo commit cambia lo propio, ya no es el actualizador
  const e = repo({ archivos: { '.claude/settings.json': zona.textoSettings(proyecto) } });
  const m2 = JSON.parse(JSON.stringify(m.settings));
  m2.permissions.allow = m2.permissions.allow.filter((x) => x !== PROPIA).concat('Bash(rm:*)');
  commit(e, { '.claude/settings.json': zona.textoSettings(m2) });
  rojo(e, /allow:Bash\(rm:\*\)/, { molde: MOLDE });
  // un hook del molde con otro timeout tampoco
  const f = repo({ archivos: { '.claude/settings.json': zona.textoSettings(proyecto) } });
  const m3 = JSON.parse(JSON.stringify(m.settings));
  m3.hooks.PreToolUse.find((x) => x.matcher === 'Bash|PowerShell').hooks[0].timeout = 600;
  commit(f, { '.claude/settings.json': zona.textoSettings(m3) });
  rojo(f, /hook:PreToolUse/, { molde: MOLDE });
  // ni una clave que no es regla (permissions.defaultMode, env) que no es la de antes ni la del molde
  for (const cambiar of [(s) => (s.permissions.defaultMode = 'bypassPermissions'), (s) => (s.env = { X: '1' })]) {
    const h = repo({ archivos: { '.claude/settings.json': zona.textoSettings(proyecto) } });
    const m4 = JSON.parse(JSON.stringify(m.settings));
    cambiar(m4);
    commit(h, { '.claude/settings.json': zona.textoSettings(m4) });
    // El renglón corta la lista de ids a 4 (listaCorta) y con el molde de hoy cambian más ids que esos: la clave se busca en la lista
    // ENTERA de lo que toca el commit (la misma que arma el renglón), y el rojo se le atribuye porque sin ella el mismo commit es verde.
    rojo(h, /^el commit [0-9a-f]{12} toca settings \(/, { molde: MOLDE });
    const ids = C.idsSettings(Buffer.from(zona.textoSettings(proyecto)), Buffer.from(zona.textoSettings(m4)), '.claude/settings.json');
    assert.ok(ids.some((x) => /^settings:(permissions\.defaultMode|env)$/.test(x)), ids.join(', '));
    const sin = repo({ archivos: { '.claude/settings.json': zona.textoSettings(proyecto) } });
    commit(sin, { '.claude/settings.json': zona.textoSettings(m.settings) });
    verde(sin, { molde: MOLDE });
  }
});

test('exención (a), decisión que frena: una regla del molde viejo que el nuevo retira no pasa (sin el molde viejo no se distingue de una propia)', () => {
  const viejo = settingsViejo();
  viejo.permissions.deny.push('Bash(git stash:*)');
  const d = repo({ archivos: { '.claude/settings.json': zona.textoSettings(viejo) } });
  const nuevo = JSON.parse(fs.readFileSync(path.join(MOLDE, 'settings.json'), 'utf8'));
  const m = zona.mezclarSettings({ viejo: zona.textoSettings(viejo), nuevo: zona.textoSettings(nuevo), proyecto: zona.textoSettings(viejo), quitados: [] });
  assert.ok(!m.settings.permissions.deny.includes('Bash(git stash:*)'), 'la mezcla lo retira');
  commit(d, { '.claude/settings.json': zona.textoSettings(m.settings) });
  rojo(d, /deny:Bash\(git stash:\*\)/, { molde: MOLDE });
});

// ---------------------------------------------------------------- exención (a) con el molde viejo (--molde-viejo; G6b)

const MOLDE_ACTUAL = () => JSON.parse(fs.readFileSync(path.join(MOLDE, 'settings.json'), 'utf8'));
// Un repo con <proyecto> como settings y un commit que lo deja en <despues>; el molde viejo es <viejo> (un settings o un mapa de
// archivos). → { d, viejo: la carpeta del molde viejo }.
function conViejo(proyecto, despues, viejo) {
  const d = repo({ archivos: { '.claude/settings.json': zona.textoSettings(proyecto) } });
  commit(d, { '.claude/settings.json': zona.textoSettings(despues) });
  return { d, viejo: moldeDe(viejo && viejo.permissions ? { 'settings.json': zona.textoSettings(viejo) } : viejo || {}) };
}
const mezcla = (viejo, proyecto) => {
  const m = zona.mezclarSettings({ viejo: zona.textoSettings(viejo), nuevo: zona.textoSettings(MOLDE_ACTUAL()), proyecto: zona.textoSettings(proyecto), quitados: [] });
  assert.equal(m.ok, true, m.problema);
  return m.settings;
};

test('--molde-viejo (1): la regla del molde viejo que el nuevo retira, igual en el proyecto, puede irse → verde; sin el viejo, rojo', () => {
  const viejo = settingsViejo();
  viejo.permissions.deny.push('Bash(git stash:*)');
  const proyecto = JSON.parse(JSON.stringify(viejo));
  proyecto.permissions.allow.push(PROPIA);
  const m = mezcla(viejo, proyecto);
  assert.ok(!m.permissions.deny.includes('Bash(git stash:*)') && m.permissions.allow.includes(PROPIA), 'la mezcla retira la del viejo y respeta la propia');
  const { d, viejo: mv } = conViejo(proyecto, m, viejo);
  verde(d, { molde: MOLDE, moldeViejo: mv });
  rojo(d, /deny:Bash\(git stash:\*\)/, { molde: MOLDE });
  rojo(d, /settings/);
  // el molde viejo sin settings no retira nada; uno que no se lee, ni eso: sin exención
  rojo(d, /deny:Bash\(git stash:\*\)/, { molde: MOLDE, moldeViejo: moldeDe({ 'hooks/x.cjs': 'x\n' }) });
  rojo(d, /settings/, { molde: MOLDE, moldeViejo: moldeDe({ 'settings.json': '{"permissions": ' }) });
  // con el molde viejo que no se lee, tampoco pasa el commit del actualizador que no retira nada
  const sin = mezcla(settingsViejo(), settingsViejo());
  const e = conViejo(settingsViejo(), sin, settingsViejo());
  verde(e.d, { molde: MOLDE, moldeViejo: e.viejo });
  verde(e.d, { molde: MOLDE });
  rojo(e.d, /settings/, { molde: MOLDE, moldeViejo: moldeDe({ 'settings.json': '[]' }) });
});

test('--molde-viejo (2): la regla del molde viejo que el proyecto había cambiado y el nuevo retira → rojo si se va o cambia, con y sin el viejo', () => {
  const hook = (timeout) => ({ matcher: 'Edit', hooks: [{ type: 'command', command: 'node', args: ['${CLAUDE_PROJECT_DIR}/.claude/hooks/viejo.cjs'], timeout }] });
  const viejo = settingsViejo();
  viejo.hooks.PreToolUse.push(hook(20));
  const proyecto = JSON.parse(JSON.stringify(viejo));
  proyecto.hooks.PreToolUse[proyecto.hooks.PreToolUse.length - 1] = hook(30); // el proyecto le cambió el timeout
  const m = mezcla(viejo, proyecto);
  assert.ok(m.hooks.PreToolUse.some((g) => g.matcher === 'Edit'), 'la mezcla respeta la que el proyecto cambió');
  // quedarse con la suya es lo propio igual que antes → verde
  const a = conViejo(proyecto, m, viejo);
  verde(a.d, { molde: MOLDE, moldeViejo: a.viejo });
  // sacarla → rojo, con y sin el molde viejo
  const sacada = JSON.parse(JSON.stringify(m));
  sacada.hooks.PreToolUse = sacada.hooks.PreToolUse.filter((g) => g.matcher !== 'Edit');
  const b = conViejo(proyecto, sacada, viejo);
  rojo(b.d, /hook:PreToolUse/, { molde: MOLDE, moldeViejo: b.viejo });
  rojo(b.d, /hook:PreToolUse/, { molde: MOLDE });
  // la que estaba igual al viejo y el commit la CAMBIA (en vez de sacarla) → rojo: retirar es irse entera
  const c0 = mezcla(viejo, viejo);
  const cambiada = JSON.parse(JSON.stringify(c0));
  cambiada.hooks.PreToolUse.push(hook(45));
  const c = conViejo(viejo, cambiada, viejo);
  rojo(c.d, /hook:PreToolUse/, { molde: MOLDE, moldeViejo: c.viejo });
  verde(conViejo(viejo, c0, viejo).d, { molde: MOLDE, moldeViejo: c.viejo });
});

test('--molde-viejo (3): una regla propia (el molde viejo no la traía) sacada → rojo, con y sin el viejo', () => {
  const viejo = settingsViejo();
  const proyecto = JSON.parse(JSON.stringify(viejo));
  proyecto.permissions.allow.push(PROPIA);
  const m = mezcla(viejo, proyecto);
  m.permissions.allow = m.permissions.allow.filter((x) => x !== PROPIA);
  const { d, viejo: mv } = conViejo(proyecto, m, viejo);
  rojo(d, /allow:Bash\(npm test:\*\)/, { molde: MOLDE, moldeViejo: mv });
  rojo(d, /allow:Bash\(npm test:\*\)/, { molde: MOLDE });
  // y el molde viejo va solo con el molde: sin él, la librería tira (el script lo da como mal llamado)
  assert.throws(() => B.revisarBarreras(d, { moldeViejo: mv }), /molde viejo/);
});

// El settings del molde tal como quedó al cerrar D2.2 (git show 37906e8:kit/molde/settings.json): los tres hooks en texto.
const SETTINGS_2B = {
  permissions: {
    allow: ['Bash(node .claude/scripts/cambios.cjs:*)'],
    ask: ['Bash(node .claude/scripts/cambios.cjs aprobar:*)', 'PowerShell(node .claude/scripts/cambios.cjs aprobar:*)'],
    deny: ['Write(./.claude/cambios/**)', 'Edit(./.claude/cambios/**)'],
  },
  hooks: {
    SessionStart: [{ matcher: '', hooks: [{ type: 'command', command: 'node "$CLAUDE_PROJECT_DIR/.claude/hooks/session-start.cjs"', timeout: 20 }] }],
    PreToolUse: [
      { matcher: 'Write', hooks: [{ type: 'command', command: 'node "$CLAUDE_PROJECT_DIR/.claude/hooks/escritura-docs.cjs"', timeout: 20 }] },
      { matcher: 'Bash|PowerShell', hooks: [{ type: 'command', command: 'node "$CLAUDE_PROJECT_DIR/.claude/hooks/niega-aprobar.cjs"', timeout: 20, onFailure: 'block' }] },
    ],
  },
};

test('--molde-viejo (4), el caso real: el settings del 2b mezclado (con lo propio) pasa al molde de hoy (los hooks a exec) → verde', () => {
  const proyecto = JSON.parse(JSON.stringify(SETTINGS_2B));
  proyecto.permissions.allow.push(PROPIA);
  proyecto.hooks.PreToolUse.push({ matcher: 'Edit', hooks: [{ type: 'command', command: 'node .claude/hooks/check-code.js', timeout: 30 }] }); // un hook propio (v2)
  const m = mezcla(SETTINGS_2B, proyecto);
  const cmds = m.hooks.PreToolUse.flatMap((g) => g.hooks).concat(m.hooks.SessionStart.flatMap((g) => g.hooks)).map((h) => h.command);
  assert.ok(!cmds.some((c) => c.includes('$CLAUDE_PROJECT_DIR')), 'la mezcla retira los tres registros en texto');
  assert.ok(cmds.includes('node .claude/hooks/check-code.js'), 'y respeta el propio');
  const { d, viejo } = conViejo(proyecto, m, SETTINGS_2B);
  verde(d, { molde: MOLDE, moldeViejo: viejo });
  rojo(d, /toca settings \(/, { molde: MOLDE }); // lo que mordió a rehacer.sh (G12): sin el molde viejo, los retirados frenan
  rojo(d, /settings/);
  // con el commit en el índice (el pre-commit) y en lo pendiente, igual
  const p = repo({ archivos: { '.claude/settings.json': zona.textoSettings(proyecto) } });
  poner(p, { '.claude/settings.json': zona.textoSettings(m) });
  verde(p, { indice: true, molde: MOLDE, moldeViejo: viejo });
  verde(p, { molde: MOLDE, moldeViejo: viejo });
  rojo(p, /settings/, { indice: true, molde: MOLDE });
  // si el mismo commit además saca el hook propio, ya no es el actualizador
  const m2 = JSON.parse(JSON.stringify(m));
  m2.hooks.PreToolUse = m2.hooks.PreToolUse.filter((g) => g.matcher !== 'Edit');
  const e = conViejo(proyecto, m2, SETTINGS_2B);
  rojo(e.d, /toca settings \(/, { molde: MOLDE, moldeViejo: e.viejo }); // el mismo commit sin sacarlo es verde (arriba)
});

test('--molde-viejo (6): un archivo que el molde nuevo retira, borrado, vale solo si el proyecto lo tenía como el viejo', () => {
  const nuevo = moldeDe({ 'hooks/x.cjs': 'nuevo\n' });
  const viejo = moldeDe({ 'hooks/retirado.cjs': 'v\n', 'hooks/t.md': 'a\n<!-- kit:propio -->\n<!-- /kit:propio -->\nb\n', 'hooks/x.cjs': 'nuevo\n' });
  const borrar = (archivos, rel) => {
    const d = repo({ archivos });
    commit(d, { [rel]: null });
    return d;
  };
  // igual al del viejo → verde (con el viejo y, como siempre, sin él)
  const a = borrar({ '.claude/hooks/retirado.cjs': 'v\n' }, '.claude/hooks/retirado.cjs');
  verde(a, { molde: nuevo, moldeViejo: viejo });
  verde(a, { molde: nuevo });
  rojo(a, /hooks/);
  // cambiado respecto del viejo → rojo con el viejo (sin él no se distingue: pasa, como antes)
  const b = borrar({ '.claude/hooks/retirado.cjs': 'v cambiado\n' }, '.claude/hooks/retirado.cjs');
  rojo(b, /hooks:\.claude\/hooks\/retirado\.cjs/, { molde: nuevo, moldeViejo: viejo });
  verde(b, { molde: nuevo });
  // propio (el viejo no lo traía) → rojo con el viejo
  const c = borrar({ '.claude/hooks/mio.cjs': 'mío\n' }, '.claude/hooks/mio.cjs');
  rojo(c, /hooks:\.claude\/hooks\/mio\.cjs/, { molde: nuevo, moldeViejo: viejo });
  // con zona propia: vacía como la del viejo → verde; con lo del proyecto adentro → rojo (se perdería lo propio)
  const t = borrar({ '.claude/hooks/t.md': 'a\n<!-- kit:propio -->\n<!-- /kit:propio -->\nb\n' }, '.claude/hooks/t.md');
  verde(t, { molde: nuevo, moldeViejo: viejo });
  const u = borrar({ '.claude/hooks/t.md': 'a\n<!-- kit:propio -->\nmío\n<!-- /kit:propio -->\nb\n' }, '.claude/hooks/t.md');
  rojo(u, /hooks/, { molde: nuevo, moldeViejo: viejo });
  // el molde nuevo todavía lo trae → rojo, aunque esté igual al viejo
  const x = borrar({ '.claude/hooks/x.cjs': 'nuevo\n' }, '.claude/hooks/x.cjs');
  rojo(x, /hooks/, { molde: nuevo, moldeViejo: viejo });
});

// ---------------------------------------------------------------- exención (b)

const FABRICA = {
  '.claude/hooks/lib/fabrica/ficha.estandar.md': fs.readFileSync(path.join(MOLDE, 'hooks', 'lib', 'fabrica', 'ficha.estandar.md'), 'utf8'),
  '.claude/hooks/lib/fabrica/ficha.liviano.md': fs.readFileSync(path.join(MOLDE, 'hooks', 'lib', 'fabrica', 'ficha.liviano.md'), 'utf8'),
};
const FICHA_FABRICA = (o = {}) =>
  FABRICA['.claude/hooks/lib/fabrica/ficha.estandar.md']
    .replace(/^# .*\n/m, '')
    .replace('  plata: no', `  plata: ${o.plata || 'no'}`)
    .replace('vars:\n', 'piezas:\n  candado: molde\nvars:\n');

test('exención (b): la ficha que nace con la fábrica del padre → verde; con valores distintos → rojo; sin fábrica en el padre → rojo', () => {
  const d = repo({ ficha: false });
  commit(d, FABRICA, 'el molde, antes de adoptar (sin ficha: fuera del candado)');
  commit(d, { '.claude/kit.md': FICHA_FABRICA() }, 'la ficha');
  verde(d);
  commit(d, { '.claude/kit.md': FICHA_FABRICA().replace('candado: molde', 'candado: {estado: molde, hash: 0123456789ab}') }, 'después, otro commit de la ficha: no le quita la exención');
  verde(d);
  const e = repo({ ficha: false });
  commit(e, FABRICA);
  commit(e, { '.claude/kit.md': FICHA_FABRICA({ plata: '[la caja]' }) });
  rojo(e, /toca autorizado, sensible/);
  const f = repo({ ficha: false });
  commit(f, { ...FABRICA, '.claude/kit.md': FICHA_FABRICA() }, 'la fábrica y la ficha juntas: se certificaría sola');
  rojo(f, /sensible/);
  // lo pendiente también: crear la ficha sin commitear, con la fábrica en HEAD
  const p = repo({ ficha: false });
  commit(p, FABRICA);
  push(p);
  escribir(p, '.claude/kit.md', FICHA_FABRICA());
  verde(p);
  escribir(p, '.claude/kit.md', FICHA_FABRICA({ plata: '[la caja]' }));
  rojo(p);
});

test('exención (b) solo la primera vez: si la ficha ya existió alguna vez (borrada y vuelta a crear), no hay exención', () => {
  const d = repo({ archivos: FABRICA, ficha: FICHA_FABRICA() });
  commit(d, { '.claude/kit.md': null }, 'la borra');
  push(d);
  commit(d, { '.claude/kit.md': FICHA_FABRICA() }, 'la vuelve a crear de fábrica');
  rojo(d, /toca autorizado, sensible/);
  // y sin remoto, con la ficha que existió solo en la historia de la rama local
  const s = repo({ remoto: false, archivos: FABRICA, ficha: FICHA_FABRICA() });
  commit(s, { '.claude/kit.md': null, 'docs/SESSION_HANDOFF.md': '# Handoff\n' }, 'cierre');
  commit(s, { '.claude/kit.md': FICHA_FABRICA() });
  rojo(s);
});

test('los commits de antes de adoptar quedan fuera: la ficha nunca existió antes y ellos no la tocan', () => {
  const d = repo({ ficha: false });
  commit(d, { '.claude/settings.json': '{"permissions": {"allow": ["Bash(*)"]}}\n', '.claude/hooks/x.cjs': 'x\n' });
  verde(d);
  escribir(d, '.claude/hooks/x.cjs', 'y\n');
  verde(d);
});

// ---------------------------------------------------------------- sin remoto, la ficha del padre rota, criterio 17

test('sin remoto y sin base: solo lo pendiente (el commit que creó el settings no da rojo para siempre)', () => {
  const d = repo({ remoto: false });
  commit(d, { '.claude/settings.json': '{"permissions": {"allow": ["Bash(*)"]}}\n' });
  verde(d);
  escribir(d, '.claude/settings.json', '{}\n');
  rojo(d, /lo que está por commitearse/);
  // con base (un cierre anterior), lo de después entra
  g(d, 'checkout', '-q', '--', '.claude/settings.json');
  commit(d, { 'docs/SESSION_HANDOFF.md': '# Handoff\n' });
  const x = commit(d, { '.claude/settings.json': '{}\n' });
  assert.equal(rojo(d)[0].commit, x);
});

test('la ficha del padre rota: se compara contra la última que se lee; sin ninguna que se lea → rojo, con o sin aprobado', () => {
  const d = repo();
  commit(d, { '.claude/kit.md': '---\nkit: [\n---\n' }, 'la rompe');
  push(d);
  escribir(d, '.claude/kit.md', FICHA());
  verde(d); // vuelve a la última que se lee: nada cambió
  escribir(d, '.claude/kit.md', FICHA({ quitados: [STASH] }));
  rojo(d, /deny:Bash\(git stash:\*\)/);

  const e = repo({ ficha: '---\nkit: [\n---\n' });
  escribir(e, '.claude/kit.md', FICHA());
  const f = rojo(e, /rota y no hay una anterior/);
  assert.match(f[0].hacer, /ningún aprobado cubre/);
});

test('criterio 17: un obrero que edita frenos.quitados en su worktree → rojo en candado:barreras', () => {
  const d = repo();
  const w = path.join(d, '.claude', 'worktrees', 'x');
  g(d, 'worktree', 'add', '-q', '-b', 'modulo/x--1', w);
  commit(w, { '.claude/kit.md': FICHA({ quitados: [STASH] }) });
  const f = rojo(w, /deny:Bash\(git stash:\*\)/);
  assert.equal(f.length, 1);
  // con un aprobado de main que el obrero copia a su rama tampoco: el sello no está en el first-parent de main
  const id = proponer(w);
  sellarAMano(w, id);
  rojo(w);
});

// ---------------------------------------------------------------- lo de cambios.cjs, igual

test('tocaArchivo, sumado por archivo, da lo mismo que cambios.toca (la misma cuenta de ids)', () => {
  const d = repo({ archivos: { '.claude/settings.json': '{"permissions": {"deny": ["Bash(x)"]}}\n', '.claude/hooks/a.cjs': 'a\n' } });
  const x = commit(d, {
    '.claude/settings.json': '{"permissions": {"deny": ["Bash(y)"]}, "otra": 1}\n',
    '.claude/hooks/a.cjs': null,
    '.githooks/pre-commit': 'x\n',
    '.claude/kit.md': FICHA({ quitados: [STASH], plata: '[caja]' }),
  });
  for (const cual of [x, B.PENDIENTE]) {
    if (cual === B.PENDIENTE) {
      escribir(d, '.claude/settings.json', '{}\n');
      escribir(d, '.gitleaksignore', 'x\n');
    }
    const cats = new Set();
    const ids = new Set();
    for (const f of B.archivosDe(d, cual)) {
      const t = B.tocaArchivo(d, f);
      t.cats.forEach((c) => cats.add(c));
      t.ids.forEach((i) => ids.add(i));
    }
    const t = C.toca(d, cual);
    assert.deepEqual([...cats].sort(), t.categorias);
    assert.deepEqual([...ids].sort(), t.ids);
  }
});

test('fichaEnAlgunLado: disco, índice, HEAD, la vigente o el padre de un commit del rango; si no, apagado', () => {
  const sin = repo({ ficha: false });
  assert.equal(B.fichaEnAlgunLado(sin), false);
  escribir(sin, '.claude/kit.md', FICHA());
  assert.equal(B.fichaEnAlgunLado(sin), true, 'el disco');
  fs.unlinkSync(path.join(sin, '.claude', 'kit.md'));
  poner(sin, { '.claude/kit.md': FICHA() });
  fs.unlinkSync(path.join(sin, '.claude', 'kit.md'));
  assert.equal(B.fichaEnAlgunLado(sin), true, 'el índice');
  const d = repo();
  commit(d, { '.claude/kit.md': null });
  assert.equal(B.fichaEnAlgunLado(d), true, 'la vigente (origin/main) la tiene');
  push(d);
  assert.equal(B.fichaEnAlgunLado(d), false, 'borrada y subida: ya no está en ningún lado');
  const s = repo({ remoto: false });
  commit(s, { 'docs/SESSION_HANDOFF.md': '# Handoff\n' });
  commit(s, { '.claude/kit.md': null });
  assert.equal(B.fichaEnAlgunLado(s), true, 'el padre de un commit del rango');
  // la vigente sola: una rama huérfana sin ficha (ningún commit del rango la tuvo), con main que sí
  const o = repo({ remoto: false });
  g(o, 'checkout', '-q', '--orphan', 'huerfana');
  g(o, 'rm', '-rq', '--cached', '.');
  for (const e of fs.readdirSync(o)) if (e !== '.git') fs.rmSync(path.join(o, e), { recursive: true, force: true });
  commit(o, { 'b.txt': 'b\n' });
  assert.equal(B.fichaEnAlgunLado(o), true, 'la vigente (main) la tiene');
  // HEAD solo: el remoto nunca la tuvo, el commit que la creó es el último, y está borrada del índice y del disco
  const h = repo({ ficha: false });
  commit(h, { '.claude/kit.md': FICHA() });
  g(h, 'rm', '-q', '--', '.claude/kit.md');
  assert.equal(B.fichaEnAlgunLado(h), true, 'HEAD la tiene');
});

// ---------------------------------------------------------------- el camino legítimo (revisor frío: rf-1, rf-2, rf-3, rf-4, rf-6, rf-12)

// Otra PC: un clon del remoto de d.
function otraPC(d) {
  const p = path.join(TMP, `pc${n++}`);
  g(TMP, 'clone', '-q', '-b', 'main', `${d}.git`, p);
  return p;
}
// El recorrido entero en d: aprobado → el commit que quita el stash → anotar-sha → su commit. → { id, x }
function aplicado(d) {
  const { id } = aprobado(d);
  const x = quitarStash(d);
  const r = cli(d, 'anotar-sha', id, x);
  assert.equal(r.codigo, 0, r.out);
  commit(d, { [rel(id)]: leerArchivo(d, rel(id)) }, 'anota');
  return { id, x };
}

test('rf-1: git pull con merge en la otra PC → verificar rojo (el sello quedó fuera del primer padre); rechazar el aplicado lo destraba', () => {
  const d = repo();
  const pc2 = otraPC(d);
  const { id } = aplicado(d);
  push(d);
  commit(pc2, { 'c.txt': 'c\n' }, 'algo local');
  g(pc2, 'pull', '-q', '--no-rebase', '--no-edit', 'origin', 'main');
  assert.ok(C.verificar(pc2).some((f) => f.id === id && /llegó por un merge/.test(f.que)), JSON.stringify(C.verificar(pc2)));
  verde(pc2); // el merge no introduce nada suyo; lo que trae ya lo juzgó la otra PC
  const r = cli(pc2, 'rechazar', id, 'el merge sacó el sello');
  assert.equal(r.codigo, 0, r.out);
  assert.doesNotMatch(leerArchivo(pc2, rel(id)), /^sha:/m, 'el sha sale con el aplicado');
  assert.deepEqual(C.verificar(pc2), []);
  verde(pc2);
});

test('rf-2: pull --rebase reescribe el commit del aplicado → verificar da el anotar-sha listo; reapuntar lo destraba; uno que sigue en la historia, no', () => {
  const d = repo();
  const pc2 = otraPC(d);
  commit(pc2, { 'c.txt': 'c\n' }, 'la otra PC avanza origin');
  g(pc2, 'push', '-q', 'origin', 'HEAD');
  const { id, x } = aplicado(d);
  g(d, 'pull', '-q', '--rebase', 'origin', 'main');
  const nuevo = g(d, 'rev-parse', 'HEAD~1');
  assert.notEqual(nuevo, x);
  const f = C.verificar(d).find((y) => y.id === id);
  assert.ok(f && /ya no está en la historia de HEAD/.test(f.que), JSON.stringify(C.verificar(d)));
  assert.equal(f.hacer, `${C.COMANDO} anotar-sha ${id} ${nuevo}`);
  // rf3-8: sigue rojo (el sha viejo no cubre el commit reescrito), pero el "qué hacer" es el anotar-sha con el sha nuevo listo
  const f8 = rojo(d, /apunta al sha de antes de un rebase/);
  assert.equal(f8.length, 1, JSON.stringify(f8));
  assert.equal(f8[0].commit, nuevo);
  assert.match(f8[0].que, new RegExp(`${id}: ${x.slice(0, 12)}`));
  assert.equal(f8[0].hacer, `se rebaseó: ${C.COMANDO} anotar-sha ${id} ${nuevo}, y commit por rutas (git commit -m "cambios: aplicado ${id}" -- ${rel(id)})`);
  const enPush = revisar(d, { rango: B.resolverRango(d, { desde: 'origin/main', hasta: 'HEAD' }) });
  assert.deepEqual(enPush.map((y) => y.hacer), [f8[0].hacer], 'el pre-push dice lo mismo');
  const r = cli(d, 'anotar-sha', id, nuevo);
  assert.equal(r.codigo, 0, r.out);
  commit(d, { [rel(id)]: leerArchivo(d, rel(id)) }, 'reapunta');
  assert.deepEqual(C.verificar(d), []);
  verde(d);
  // reapuntar un aplicado cuyo sha sigue en la historia: no (sería r5-1)
  const otro = commit(d, { 'z.txt': 'z\n' });
  assert.match(cli(d, 'anotar-sha', id, otro).out, /sigue en la historia: se reapunta solo si un rebase lo reescribió/);
});

test('rf3-8: sin el mismo patch (el commit reescrito cambió), o con el sha viejo en la historia, el mensaje de siempre', () => {
  const d = repo();
  const pc2 = otraPC(d);
  commit(pc2, { 'c.txt': 'c\n' }, 'la otra PC avanza origin');
  g(pc2, 'push', '-q', 'origin', 'HEAD');
  const { id, x } = aplicado(d);
  g(d, 'pull', '-q', '--rebase', 'origin', 'main');
  const anotado = leerArchivo(d, rel(id));
  assert.match(anotado, new RegExp(`^sha: ${x}`, 'm'));
  // el commit del cambio rehecho con otra cosa más: otro patch-id
  g(d, 'reset', '-q', '--hard', 'HEAD~2');
  const distinto = commit(d, { '.claude/kit.md': FICHA({ quitados: [STASH] }), 'z.txt': 'z\n' }, 'quita el stash y algo más');
  commit(d, { [rel(id)]: anotado }, 'anota');
  const f = rojo(d, /sin un aprobado/);
  assert.ok(f.every((y) => !/rebase/.test(y.que + y.hacer)), JSON.stringify(f));
  assert.ok(f.some((y) => y.commit === distinto));
  // el sha viejo sigue en la historia (no hubo rebase): un commit posterior con el mismo patch no recibe la pista
  const e = repo();
  const a = aplicado(e);
  g(e, 'revert', '--no-edit', 'HEAD~1');
  g(e, 'cherry-pick', a.x);
  const igualPatch = g(e, 'rev-parse', 'HEAD');
  assert.notEqual(igualPatch, a.x);
  const f2 = rojo(e, /sin un aprobado/);
  assert.ok(f2.every((y) => !/rebase/.test(y.que + y.hacer)), JSON.stringify(f2));
});

test('rf3-8: la pista solo si anotar-sha la aceptaría (sha viejo fuera de la historia, el nuevo en HEAD y primero tras el sello)', () => {
  const sinPista = (f) => assert.ok(f.every((y) => !/rebase/.test(y.que + y.hacer)), JSON.stringify(f));
  // (1) el sha anotado sigue en la historia: X quita el stash, Z lo vuelve a poner, Y lo quita igual (mismo patch que X) y el
  // aplicado apunta a Y. X no recibe la pista.
  const d = repo();
  const { id } = aprobado(d);
  const x = quitarStash(d);
  commit(d, { '.claude/kit.md': FICHA() }, 'vuelve el freno');
  const y = quitarStash(d);
  escribir(d, rel(id), C.ponerCampos(leerArchivo(d, rel(id)), { estado: 'aplicado', sha: y }));
  commit(d, { [rel(id)]: leerArchivo(d, rel(id)) }, 'anota a mano');
  const f1 = rojo(d);
  assert.ok(f1.some((z) => z.commit === x));
  sinPista(f1);
  // (2) el sha viejo fuera de la historia y el mismo patch, pero el commit reescrito ya no es el primero tras el sello que toca lo
  // de "toca" (antes entró otro, un hook): anotar-sha no lo aceptaría, así que no hay pista.
  const e = repo();
  const id2 = proponer(e, { toca: 'frenos,hooks' });
  const sello = aprobar(e, id2);
  const x2 = quitarStash(e);
  assert.equal(cli(e, 'anotar-sha', id2, x2).codigo, 0);
  const anotado = leerArchivo(e, rel(id2));
  g(e, 'reset', '-q', '--hard', sello);
  commit(e, { '.claude/hooks/x.cjs': 'x\n' }, 'un hook antes');
  g(e, 'cherry-pick', x2);
  const x3 = g(e, 'rev-parse', 'HEAD');
  commit(e, { [rel(id2)]: anotado }, 'anota');
  const f2 = rojo(e);
  assert.ok(f2.some((z) => z.commit === x3), JSON.stringify(f2));
  sinPista(f2);
  // (3) el commit reescrito no está en HEAD (se pushea otra rama): anotar-sha no lo aceptaría desde acá
  const h = repo();
  const pc2 = otraPC(h);
  commit(pc2, { 'c.txt': 'c\n' }, 'la otra PC avanza origin');
  g(pc2, 'push', '-q', 'origin', 'HEAD');
  const { id: id3 } = aplicado(h);
  g(h, 'pull', '-q', '--rebase', 'origin', 'main');
  const f3a = revisar(h, { rango: B.resolverRango(h, { desde: 'origin/main', hasta: 'main' }) });
  assert.ok(f3a.length && /rebase/.test(f3a[0].hacer), 'desde main, con pista');
  // HEAD en el sello reescrito (sin el commit del cambio), con el aplicado en el disco: el cambio vale, pero el commit no es de HEAD
  const aplicadoTexto = leerArchivo(h, rel(id3));
  g(h, 'checkout', '-q', '-b', 'otra', 'main~2');
  escribir(h, rel(id3), aplicadoTexto);
  const f3 = revisar(h, { rango: B.resolverRango(h, { desde: 'origin/main', hasta: 'main' }) });
  assert.ok(f3.length, 'sigue rojo');
  sinPista(f3);
});

test('rf-2: reapuntar exige lo mismo que un aprobado (el primer commit tras el sello que toca lo de "toca") y un commit de la historia de HEAD', () => {
  const d = repo();
  const { id, x } = aplicado(d);
  const segundo = commit(d, { '.claude/kit.md': FICHA() }); // otro commit que toca frenos, después
  const huerfano = g(d, 'commit-tree', 'HEAD^{tree}', '-m', 'fuera de la historia');
  escribir(d, rel(id), C.ponerCampos(leerArchivo(d, rel(id)), { sha: huerfano }));
  assert.ok(C.verificar(d).some((f) => /ya no está en la historia de HEAD/.test(f.que) && f.hacer.endsWith(` ${x}`)));
  assert.match(cli(d, 'anotar-sha', id, segundo).out, new RegExp(`el primer commit después del sello que toca lo de "toca" es ${x.slice(0, 12)}`));
  assert.match(cli(d, 'anotar-sha', id, huerfano).out, /no está en la historia de HEAD/);
  assert.equal(cli(d, 'anotar-sha', id, x).codigo, 0);
});

test('rf-3: merge --no-ff de una rama con su aprobado → verde (el merge se juzga solo por lo que introduce); sin aprobado, rojo en el commit de la rama', () => {
  const d = repo();
  const { id } = aprobado(d);
  g(d, 'checkout', '-q', '-b', 'modulo/x');
  const x = quitarStash(d);
  g(d, 'checkout', '-q', 'main');
  commit(d, { 'b.txt': 'b\n' }, 'main avanza');
  g(d, 'merge', '-q', '--no-ff', '-m', 'integrar', 'modulo/x');
  verde(d);
  assert.equal(cli(d, 'anotar-sha', id, x).codigo, 0);
  commit(d, { [rel(id)]: leerArchivo(d, rel(id)) }, 'anota');
  assert.deepEqual(C.verificar(d), []);
  verde(d);

  const e = repo();
  g(e, 'checkout', '-q', '-b', 'modulo/x');
  const y = quitarStash(e);
  g(e, 'checkout', '-q', 'main');
  g(e, 'merge', '-q', '--no-ff', '-m', 'integrar', 'modulo/x');
  assert.deepEqual(rojo(e).map((f) => f.commit), [y], 'el rojo es del commit de la rama, no del merge');
});

test('rf-3: lo que el merge mismo introduce (difiere de TODOS los padres) sí se juzga; la validez del sello no cambia', () => {
  const d = repo();
  aprobado(d);
  g(d, 'checkout', '-q', '-b', 'modulo/x');
  quitarStash(d);
  g(d, 'checkout', '-q', 'main');
  commit(d, { 'b.txt': 'b\n' });
  g(d, 'merge', '-q', '--no-ff', '--no-commit', 'modulo/x');
  escribir(d, '.claude/kit.md', FICHA({ quitados: [STASH, OTRO] })); // el merge suma un freno quitado que nadie aprobó
  g(d, 'add', '.claude/kit.md');
  g(d, 'commit', '-q', '-m', 'merge con agregado');
  const m = g(d, 'rev-parse', 'HEAD');
  const f = rojo(d, /git clean/);
  assert.deepEqual(f.map((x) => x.commit), [m]);
  assert.doesNotMatch(f[0].que, /git stash/, 'lo que trae la rama no se le cuenta al merge');
  assert.deepEqual(C.toca(d, m).ids, ['deny:Bash(git clean:*)']);
  // un sello traído por merge sigue sin valer (como antes)
  const s = repo();
  const id = proponer(s);
  g(s, 'checkout', '-q', '-b', 'modulo/y--1');
  sellarAMano(s, id);
  quitarStash(s);
  g(s, 'checkout', '-q', 'main');
  g(s, 'merge', '-q', '--no-ff', '-m', 'merge', 'modulo/y--1');
  rojo(s, /sin un aprobado/);
});

test('rf-3: dos lados que tocan reglas distintas del settings, cada uno con su aprobado, y el merge que los combina → verde', () => {
  const S = (allow, deny) => `{\n  "permissions": {\n    "allow": [\n${allow.map((x) => `      "${x}"`).join(',\n')}\n    ],\n    "ask": [],\n    "otra": 1,\n    "deny": [\n${deny.map((x) => `      "${x}"`).join(',\n')}\n    ]\n  }\n}\n`;
  const d = repo({ archivos: { '.claude/settings.json': S(['Bash(a)'], ['Bash(z)']) } });
  aprobado(d, { toca: 'settings', ids: ['allow:Bash(b)'] });
  aprobado(d, { toca: 'settings', ids: ['deny:Bash(c)'] });
  g(d, 'checkout', '-q', '-b', 'modulo/x');
  commit(d, { '.claude/settings.json': S(['Bash(a)', 'Bash(b)'], ['Bash(z)']) });
  g(d, 'checkout', '-q', 'main');
  commit(d, { '.claude/settings.json': S(['Bash(a)'], ['Bash(z)', 'Bash(c)']) });
  g(d, 'merge', '-q', '--no-ff', '-m', 'integrar', 'modulo/x');
  assert.equal(leerArchivo(d, '.claude/settings.json'), S(['Bash(a)', 'Bash(b)'], ['Bash(z)', 'Bash(c)']), 'git combinó los dos');
  verde(d);
});

test('rf-4: sin remoto, la base entra al rango: un commit que toca el handoff y quita un freno → rojo; el repo recién montado o la adopción → verde', () => {
  const s = repo({ remoto: false });
  commit(s, { 'docs/SESSION_HANDOFF.md': '# Handoff\n' }, 'cierre 1');
  const x = commit(s, { 'docs/SESSION_HANDOFF.md': '# Handoff 2\n', '.claude/kit.md': FICHA({ quitados: [STASH] }) }, 'quita el freno junto con el handoff');
  assert.equal(rojo(s, /deny:Bash\(git stash:\*\)/)[0].commit, x);
  assert.match(B.rango(s).como, /con él/);
  // recién montado: el primer commit trae el handoff, la ficha, el settings y los hooks
  const m = repo({ remoto: false, archivos: { 'docs/SESSION_HANDOFF.md': '# Handoff\n', '.claude/settings.json': '{"permissions": {"allow": ["Bash(*)"]}}\n', '.claude/hooks/x.cjs': 'x\n' } });
  assert.deepEqual(B.rango(m).commits, []);
  assert.match(B.rango(m).como, /primer commit/);
  verde(m);
  // el primer commit con el handoff y sin ficha: también queda afuera (no hay padre que poner)
  const p = repo({ remoto: false, ficha: false, archivos: { 'docs/SESSION_HANDOFF.md': '# Handoff\n' } });
  assert.deepEqual(B.rango(p).commits, []);
  assert.match(B.rango(p).como, /sin él \(es el primer commit/);
  const sin = repo({ remoto: false, ficha: false });
  const h = commit(sin, { 'docs/SESSION_HANDOFF.md': '# H\n' });
  assert.equal(B.esAdopcion(sin, h, [g(sin, 'rev-parse', 'HEAD~1')]), false, 'sin ficha no es la adopción');
  // la adopción sobre un repo con historia: el commit que crea la ficha, con el handoff y el settings
  const a = repo({ remoto: false, ficha: false });
  commit(a, { 'docs/SESSION_HANDOFF.md': '# H\n', '.claude/kit.md': FICHA(), '.claude/settings.json': '{"permissions": {"allow": ["Bash(*)"]}}\n' }, 'adopción');
  assert.match(B.rango(a).como, /creó la ficha/);
  verde(a);
  // borrada y vuelta a crear junto con el handoff no es la adopción: ese commit sí se juzga
  const b = repo({ remoto: false });
  commit(b, { '.claude/kit.md': null, 'docs/SESSION_HANDOFF.md': '# H\n' }, 'cierre que la borra');
  const v = commit(b, { '.claude/kit.md': FICHA({ quitados: [STASH] }), 'docs/SESSION_HANDOFF.md': '# H2\n' }, 'la vuelve a crear aflojada');
  assert.equal(B.esAdopcion(b, v, [g(b, 'rev-parse', 'HEAD~1')]), false);
  assert.ok(rojo(b).some((f) => f.commit === v));
});

test('rf-6 a: un archivo de barrera con skip-worktree o assume-unchanged → rojo con el comando que saca la marca; otro archivo, no', () => {
  const d = repo({ archivos: { '.claude/settings.json': '{}\n' } });
  g(d, 'update-index', '--skip-worktree', '.claude/settings.json');
  escribir(d, '.claude/settings.json', '{"permissions": {"allow": ["Bash(*)"]}}\n');
  let f = rojo(d, /skip-worktree/);
  assert.equal(f.length, 1, 'lo pendiente no lo ve: solo la marca');
  assert.equal(f[0].hacer, 'sacale la marca: git update-index --no-skip-worktree .claude/settings.json');
  assert.equal(f[0].commit, B.PENDIENTE);
  g(d, 'update-index', '--no-skip-worktree', '.claude/settings.json');
  g(d, 'checkout', '-q', '--', '.claude/settings.json');
  verde(d);
  g(d, 'update-index', '--assume-unchanged', '.claude/kit.md');
  f = rojo(d, /assume-unchanged/);
  assert.equal(f[0].hacer, 'sacale la marca: git update-index --no-assume-unchanged .claude/kit.md');
  g(d, 'update-index', '--no-assume-unchanged', '.claude/kit.md');
  g(d, 'update-index', '--skip-worktree', '.claude/kit.md');
  g(d, 'update-index', '--assume-unchanged', '.claude/kit.md'); // de a una: juntas en un llamado, git aplica solo la última
  assert.match(rojo(d)[0].que, /skip-worktree y assume-unchanged/);
  g(d, 'update-index', '--no-skip-worktree', '.claude/kit.md');
  g(d, 'update-index', '--no-assume-unchanged', '.claude/kit.md');
  g(d, 'update-index', '--skip-worktree', 'a.txt');
  g(d, 'update-index', '--assume-unchanged', '.gitignore');
  verde(d);
});

test('rf-6 b: un .propio.sh (o un script del candado, un githook) ignorado → rojo como pendiente; con un aprobado que lo nombra, verde', () => {
  const ign = '/.claude/worktrees/\n/.kit-rol\n*.propio.sh\n/.claude/scripts/estructura.cjs\n/.githooks/\n/notas/\n';
  for (const r of ['.claude/hooks/session-start.propio.sh', '.claude/scripts/estructura.cjs', '.githooks/pre-commit']) {
    const d = repo({ archivos: { '.gitignore': ign } });
    escribir(d, r, 'echo allow\n');
    assert.equal(g(d, 'status', '--porcelain'), '', 'git no lo ve');
    const f = rojo(d, new RegExp(r.replace(/\./g, '\\.')));
    assert.equal(f[0].commit, B.PENDIENTE);
  }
  const d = repo({ archivos: { '.gitignore': ign } });
  escribir(d, 'notas/x.propio.sh', 'x\n'); // ignorado, pero no es barrera
  verde(d);
  aprobado(d, { toca: 'hooks', ids: ['hooks:.claude/hooks/session-start.propio.sh'] });
  escribir(d, '.claude/hooks/session-start.propio.sh', 'echo hola\n');
  verde(d);
});

test('rf-6 c: settings.local.json ignorado con disableAllHooks o hooks → rojo; con solo permissions y env → verde', () => {
  const d = repo({ archivos: { '.gitignore': '/.claude/worktrees/\n/.kit-rol\n/.claude/settings.local.json\n' } });
  const R = '.claude/settings.local.json';
  escribir(d, R, '{"permissions": {"allow": ["Bash(npm test:*)"], "defaultMode": "acceptEdits"}}\n');
  verde(d);
  // rf-15: env mete código en cada hook de node (NODE_OPTIONS) y Claude Code no la escribe solo
  escribir(d, R, '{"permissions": {"allow": []}, "env": {"NODE_OPTIONS": "--require ./x.js"}}\n');
  assert.equal(rojo(d, /trae la clave env/)[0].hacer, 'sacá esa clave: apaga o cambia los frenos en esta PC sin pasar por un aprobado');
  escribir(d, R, '{"permissions": {"allow": []}, "disableAllHooks": true}\n');
  const f = rojo(d, /trae la clave disableAllHooks/);
  assert.equal(f[0].hacer, 'sacá esa clave: apaga o cambia los frenos en esta PC sin pasar por un aprobado');
  assert.equal(f[0].detalle, R);
  escribir(d, R, '{"hooks": {"PreToolUse": []}}\n');
  rojo(d, /trae la clave hooks/);
  escribir(d, R, '{"disableAllHooks": false}\n');
  rojo(d, /disableAllHooks/); // la clave, con cualquier valor
  escribir(d, R, '{"permissions": {}, "permissions": {"x": 1}}\n');
  rojo(d, /no se lee como JSON/);
  fs.unlinkSync(path.join(d, ...R.split('/')));
  verde(d);
  // seguido y sin ignorar (ya en el remoto): no es de esta PC, lo juzga lo pendiente como a cualquier settings
  const t = repo({ archivos: { [R]: '{"hooks": {}}\n' } });
  verde(t);
});

test('rf-3 y rf-18: en un merge, el padre cuya ficha no se lee no achica nada, y contra él no se puede juzgar → imposible', () => {
  const d = repo({ ficha: '---\nkit: [\n---\n' }); // nació rota, en el remoto
  g(d, 'checkout', '-q', '-b', 'modulo/x');
  commit(d, { 'b.txt': 'b\n' });
  g(d, 'checkout', '-q', 'main');
  commit(d, { '.claude/kit.md': FICHA() }, 'la arregla');
  push(d);
  g(d, 'merge', '-q', '--no-ff', '--no-commit', 'modulo/x');
  escribir(d, '.claude/kit.md', FICHA({ hash: 'aaaaaaaaaaaa' })); // contra main, solo un hash; contra la rama, ilegible
  g(d, 'add', '.claude/kit.md');
  g(d, 'commit', '-q', '-m', 'merge');
  const m = g(d, 'rev-parse', 'HEAD');
  const f = rojo(d, /rota y no hay una anterior/);
  assert.deepEqual(f.map((x) => x.commit), [m]);
  // contra main sola (el primer padre), nada: lo que frena es el lado ilegible
  const ficha = B.archivosDe(d, m).find((x) => x.cat === 'ficha');
  assert.equal(B.tocaArchivo(d, { ...ficha, padres: undefined }).ids.size, 0);
});

test('rf-13: un merge que deshace un freno del primer padre (queda igual a un padre que no lo tocó) → rojo en el merge', () => {
  const S = (deny) => `{\n  "permissions": {\n    "deny": [${deny.map((x) => `"${x}"`).join(', ')}]\n  }\n}\n`;
  const d = repo({ archivos: { '.claude/settings.json': S([]) } });
  g(d, 'branch', 'vieja'); // armada antes del deny
  aprobado(d, { toca: 'settings', ids: ['deny:Bash(rm -rf:*)'] });
  commit(d, { '.claude/settings.json': S(['Bash(rm -rf:*)']) }, 'deny x');
  g(d, 'checkout', '-q', 'vieja');
  commit(d, { 'docs/x.md': 'x\n' }, 'docs en rama vieja');
  g(d, 'checkout', '-q', 'main');
  g(d, 'merge', '-q', '--no-ff', '--no-commit', 'vieja');
  g(d, 'checkout', 'vieja', '--', '.claude/settings.json'); // el resultado, igual a la rama que nunca lo tocó
  g(d, 'commit', '-q', '-m', 'merge que deshace el deny');
  const m = g(d, 'rev-parse', 'HEAD');
  const f = rojo(d, /deny:Bash\(rm -rf:\*\)/);
  assert.deepEqual(f.map((x) => x.commit), [m]);
  assert.deepEqual(C.toca(d, m), { categorias: ['settings'], ids: ['deny:Bash(rm -rf:*)'] }, 'cambios.toca cuenta lo mismo');
  // lo mismo en la ficha: el merge vuelve a la base lo que el primer padre (ya en el remoto) había cambiado
  const e = repo();
  g(e, 'branch', 'vieja');
  commit(e, { '.claude/kit.md': FICHA({ quitados: [STASH] }) }, 'algo en main');
  push(e);
  g(e, 'checkout', '-q', 'vieja');
  commit(e, { 'b.txt': 'b\n' });
  g(e, 'checkout', '-q', 'main');
  g(e, 'merge', '-q', '--no-ff', '--no-commit', 'vieja');
  g(e, 'checkout', 'vieja', '--', '.claude/kit.md');
  g(e, 'commit', '-q', '-m', 'merge que vuelve la ficha atrás');
  rojo(e, /git stash/);
});

test('rf-13: la cuenta de tocaArchivo en un merge es la de cambios.toca (los dos lados cambiaron cosas, y uno se revierte)', () => {
  const S = (allow, deny) => `{\n  "permissions": {\n    "allow": [\n${allow.map((x) => `      "${x}"`).join(',\n')}\n    ],\n    "ask": [],\n    "otra": 1,\n    "deny": [\n${deny.map((x) => `      "${x}"`).join(',\n')}\n    ]\n  }\n}\n`;
  const d = repo({ archivos: { '.claude/settings.json': S(['Bash(a)'], ['Bash(z)']) } });
  g(d, 'checkout', '-q', '-b', 'modulo/x');
  commit(d, { '.claude/settings.json': S(['Bash(a)', 'Bash(b)'], ['Bash(z)']) });
  g(d, 'checkout', '-q', 'main');
  commit(d, { '.claude/settings.json': S(['Bash(a)'], ['Bash(z)', 'Bash(c)']) });
  g(d, 'merge', '-q', '--no-ff', '--no-commit', 'modulo/x');
  escribir(d, '.claude/settings.json', S(['Bash(a)', 'Bash(b)'], ['Bash(z)'])); // trae b y deshace c
  g(d, 'add', '.claude/settings.json');
  g(d, 'commit', '-q', '-m', 'merge');
  const m = g(d, 'rev-parse', 'HEAD');
  const ids = new Set();
  for (const f of B.archivosDe(d, m)) B.tocaArchivo(d, f).ids.forEach((x) => ids.add(x));
  assert.deepEqual([...ids].sort(), ['deny:Bash(c)']);
  assert.deepEqual(C.toca(d, m).ids, ['deny:Bash(c)']);
});

test('rf-13: si la ficha de la base no se lee, no se sabe qué cambió el otro padre: el merge se juzga contra el primero', () => {
  const d = repo({ ficha: '---\nkit: [\n---\n' }); // la base: rota y sin ninguna anterior
  g(d, 'branch', 'vieja');
  commit(d, { '.claude/kit.md': FICHA({ plata: '[caja]' }) });
  push(d);
  g(d, 'checkout', '-q', 'vieja');
  commit(d, { '.claude/kit.md': FICHA() });
  g(d, 'checkout', '-q', 'main');
  spawnSync('git', ['merge', '-q', '--no-ff', '--no-commit', 'vieja'], { cwd: d, env: process.env }); // conflicto en la ficha
  escribir(d, '.claude/kit.md', FICHA());
  g(d, 'add', '.claude/kit.md');
  g(d, 'commit', '-q', '-m', 'merge con la ficha de la rama');
  const m = g(d, 'rev-parse', 'HEAD');
  const ids = new Set();
  for (const f of B.archivosDe(d, m)) B.tocaArchivo(d, f).ids.forEach((x) => ids.add(x));
  assert.ok(ids.has('sensible:plata'), JSON.stringify([...ids]));
});

test('rf-13: un merge sin base común (historias sin relación) no descuenta nada: lo que trae la otra historia se juzga en el merge', () => {
  const d = repo({ archivos: { '.claude/settings.json': '{}\n' } });
  g(d, 'checkout', '-q', '--orphan', 'otra');
  g(d, 'rm', '-rq', '--cached', '.');
  for (const e of fs.readdirSync(d)) if (e !== '.git') fs.rmSync(path.join(d, e), { recursive: true, force: true });
  commit(d, { '.claude/settings.json': '{"permissions": {"allow": ["Bash(*)"]}}\n' }, 'otra historia');
  g(d, 'checkout', '-q', '-f', 'main');
  spawnSync('git', ['merge', '-q', '--no-ff', '--no-commit', '--allow-unrelated-histories', 'otra'], { cwd: d, env: process.env });
  g(d, 'checkout', 'otra', '--', '.claude/settings.json');
  g(d, 'commit', '-q', '-m', 'merge de historias sin relación');
  const m = g(d, 'rev-parse', 'HEAD');
  assert.ok(C.toca(d, m).ids.includes('allow:Bash(*)'));
  assert.ok(rojo(d).some((f) => f.commit === m));
});

test('rf-18: la rama vieja como primer padre (merge al revés) y después fast-forward: deshacer el freno de main → rojo', () => {
  const S = (deny) => `{\n  "permissions": {\n    "deny": [${deny.map((x) => `"${x}"`).join(', ')}]\n  }\n}\n`;
  const d = repo({ archivos: { '.claude/settings.json': S([]) } });
  const antes = g(d, 'rev-parse', 'HEAD');
  aprobado(d, { toca: 'settings', ids: ['deny:Bash(rm -rf:*)'] });
  commit(d, { '.claude/settings.json': S(['Bash(rm -rf:*)']) }, 'deny x');
  g(d, 'switch', '-q', '-c', 'vieja', antes);
  commit(d, { 'docs/x.md': 'x\n' }, 'docs vieja');
  g(d, 'merge', '-q', '--no-ff', '--no-commit', 'main');
  g(d, 'checkout', 'vieja', '--', '.claude/settings.json');
  g(d, 'commit', '-q', '-m', 'merge main en vieja, quedándome con su settings');
  const m = g(d, 'rev-parse', 'HEAD');
  g(d, 'switch', '-q', 'main');
  g(d, 'merge', '-q', '--ff-only', 'vieja');
  assert.equal(g(d, 'rev-parse', 'HEAD'), m, 'fast-forward');
  const f = rojo(d, /deny:Bash\(rm -rf:\*\)/);
  assert.ok(f.some((x) => x.commit === m));
  assert.deepEqual(C.toca(d, m), { categorias: ['settings'], ids: ['deny:Bash(rm -rf:*)'] });
});

test('rf-18: el merge legítimo de rf-3 con la rama como primer padre (al revés) y fast-forward → verde', () => {
  const d = repo();
  const { id } = aprobado(d);
  g(d, 'checkout', '-q', '-b', 'modulo/x');
  const x = quitarStash(d);
  g(d, 'checkout', '-q', 'main');
  commit(d, { 'b.txt': 'b\n' }, 'main avanza');
  g(d, 'checkout', '-q', 'modulo/x');
  g(d, 'merge', '-q', '--no-ff', '-m', 'main en la rama', 'main');
  const m = g(d, 'rev-parse', 'HEAD');
  g(d, 'checkout', '-q', 'main');
  g(d, 'merge', '-q', '--ff-only', 'modulo/x');
  verde(d);
  assert.deepEqual(C.toca(d, m), { categorias: [], ids: [] });
  assert.equal(cli(d, 'anotar-sha', id, x).codigo, 0);
});

// ---------------------------------------------------------------- P4.6: --indice (el pre-commit) y --rango (el pre-push)

const IDX = { indice: true };
const RG = (d, desde, hasta) => ({ rango: B.resolverRango(d, { desde, hasta }) });

test('indice (rf-10): un freno quitado en el disco sin git add → verde (a secas, rojo); con git add → rojo, como "este commit"', () => {
  const d = repo();
  escribir(d, '.claude/kit.md', FICHA({ quitados: [STASH] }));
  escribir(d, '.claude/hooks/nuevo.cjs', 'x\n'); // nuevo, sin seguir: tampoco va en el commit
  verde(d, IDX);
  rojo(d); // barreras a secas sigue mirando el disco
  g(d, 'add', '.claude/kit.md');
  const f = rojo(d, /lo que lleva este commit \(el índice\) toca frenos \(deny:Bash\(git stash:\*\)\) sin un aprobado/, IDX);
  assert.deepEqual(f.map((x) => x.commit), [B.INDICE]);
  assert.match(f[0].hacer, /git restore --staged/);
  // el disco vuelve atrás y el índice no: manda el índice
  escribir(d, '.claude/kit.md', FICHA());
  rojo(d, /git stash/, IDX);
  // y al revés: el índice limpio, el disco sucio → verde
  g(d, 'restore', '--staged', '.claude/kit.md');
  escribir(d, '.claude/kit.md', FICHA({ quitados: [STASH] }));
  verde(d, IDX);
});

test('indice: con su aprobado sellado → verde; un commit viejo de la sesión que quitó un freno no cuenta (eso es del pre-push)', () => {
  const d = repo();
  aprobado(d);
  poner(d, { '.claude/kit.md': FICHA({ quitados: [STASH] }) });
  verde(d, IDX);
  const e = repo();
  quitarStash(e);
  rojo(e); // la sesión lo ve
  verde(e, IDX); // el índice está limpio
  poner(e, { '.claude/hooks/x.cjs': 'x\n' });
  rojo(e, /hooks:\.claude\/hooks\/x\.cjs/, IDX);
});

test('indice: en un merge en curso (MERGE_HEAD) se juzga contra cada padre: lo que trajo la rama no cuenta; lo que agrega el merge, sí', () => {
  const d = repo();
  g(d, 'checkout', '-q', '-b', 'modulo/x');
  quitarStash(d); // sin aprobado: lo frena el pre-push de la rama, no el merge
  g(d, 'checkout', '-q', 'main');
  commit(d, { 'b.txt': 'b\n' }, 'main avanza');
  g(d, 'merge', '-q', '--no-ff', '--no-commit', 'modulo/x');
  assert.equal(B.mergeHeads(d).length, 1);
  verde(d, IDX);
  escribir(d, '.claude/kit.md', FICHA({ quitados: [STASH, OTRO] })); // el merge suma uno que nadie trajo
  g(d, 'add', '.claude/kit.md');
  const f = rojo(d, /git clean/, IDX);
  assert.doesNotMatch(f[0].que, /git stash/);
  g(d, 'merge', '--abort');
  assert.deepEqual(B.mergeHeads(d), []);
});

test('indice con --molde: la exención (a) lee los frenos quitados de la ficha del índice', () => {
  const molde = JSON.parse(fs.readFileSync(path.join(MOLDE, 'settings.json'), 'utf8'));
  const [X, Y] = molde.permissions.deny;
  const sin = (...fuera) => {
    const v = JSON.parse(JSON.stringify(molde));
    v.permissions.deny = v.permissions.deny.filter((x) => !fuera.includes(x));
    return zona.textoSettings(v);
  };
  const d = repo({ ficha: FICHA({ quitados: [`{id: deny:${X}, por: "lo pidió", hasta: siempre}`] }), archivos: { '.claude/settings.json': sin(X, Y) } });
  poner(d, { '.claude/settings.json': sin(X) }); // el actualizador trae Y y respeta el quitado X
  verde(d, { indice: true, molde: MOLDE });
  rojo(d, /settings/, { indice: true }); // sin --molde no hay exención
});

test('rango (rf-7): cada commit de a..b; uno malo en el medio → rojo solo ese; vacío → verde; ni lo pendiente ni lo de esta PC', () => {
  const d = repo();
  const base = g(d, 'rev-parse', 'HEAD');
  const c1 = commit(d, { 'b.txt': 'b\n' });
  const malo = quitarStash(d);
  const c3 = commit(d, { 'c.txt': 'c\n' });
  const f = rojo(d, /sin un aprobado sellado/, RG(d, base, c3));
  assert.deepEqual(f.map((x) => x.commit), [malo]);
  assert.match(f[0].que, new RegExp(`el commit ${malo.slice(0, 12)} toca frenos`));
  verde(d, RG(d, malo, c3)); // el malo queda afuera
  verde(d, RG(d, c3, c1)); // vacío: c1 ya está en c3
  verde(d, RG(d, c3, c3));
  rojo(d, null, RG(d, c1, malo));
  // lo pendiente y lo de esta PC no son del push
  escribir(d, '.claude/hooks/y.cjs', 'y\n');
  escribir(d, '.claude/settings.local.json', '{"disableAllHooks": true}\n');
  fs.appendFileSync(path.join(d, '.git', 'info', 'exclude'), '/.claude/settings.local.json\n');
  verde(d, RG(d, malo, c3));
  // el rango de otra rama que HEAD
  g(d, 'checkout', '-q', '-b', 'otra', c1);
  const o = commit(d, { '.claude/hooks/z.cjs': 'z\n' });
  g(d, 'checkout', '-q', 'main');
  assert.deepEqual(rojo(d, /hooks:\.claude\/hooks\/z\.cjs/, RG(d, c1, 'otra')).map((x) => x.commit), [o]);
});

test('rango: el aprobado cubre el primer commit tras su sello, también en el push; un extremo que no existe → error', () => {
  const d = repo();
  const base = g(d, 'rev-parse', 'HEAD');
  aprobado(d);
  quitarStash(d);
  const fin = commit(d, { 'b.txt': 'b\n' });
  verde(d, RG(d, base, fin));
  assert.match(B.resolverRango(d, { desde: 'no-existe', hasta: 'HEAD' }).error, /--rango: no-existe no es un commit de este repo/);
  assert.match(B.resolverRango(d, { desde: 'HEAD', hasta: 'tampoco' }).error, /tampoco no es un commit/);
  assert.throws(() => B.revisarBarreras(d, { indice: true, rango: RG(d, base, fin).rango }), /no van juntos/);
});

test('rango: la ficha solo en los commits del push (no en el disco, el índice, HEAD ni la ref vigente) igual prende el candado', () => {
  const d = repo({ remoto: false, ficha: false });
  const base = g(d, 'rev-parse', 'HEAD');
  g(d, 'checkout', '-q', '-b', 'otra');
  const x = commit(d, { '.claude/kit.md': FICHA() });
  const y = commit(d, { '.claude/kit.md': null });
  g(d, 'checkout', '-q', 'main');
  assert.equal(B.fichaEnAlgunLado(d), false);
  assert.equal(B.fichaEnAlgunLado(d, { rango: { desde: x, hasta: y } }), true, 'el padre del commit del push la tiene');
  assert.equal(B.fichaEnAlgunLado(d, { rango: { desde: base, hasta: x } }), true, 'el commit del push la tiene');
});

test('rango de otra rama cuya ficha vive solo en ella: sus commits posteriores a la ficha se juzgan (no quedan "antes del kit")', () => {
  const d = repo({ remoto: false, ficha: false });
  const base = g(d, 'rev-parse', 'HEAD');
  g(d, 'checkout', '-q', '-b', 'otra');
  commit(d, { '.claude/kit.md': FICHA() });
  const malo = commit(d, { '.claude/hooks/x.cjs': 'x\n' });
  g(d, 'checkout', '-q', 'main');
  assert.ok(rojo(d, null, RG(d, base, 'otra')).some((x) => x.commit === malo));
});

// ---------------------------------------------------------------- D-3: secretos:, publicas:, datos-de-prueba: (en frenos, cuando aflojan)

const FICHA_D3 = (o = {}) =>
  FICHA().replace(
    /---\n$/,
    `${o.secretos === undefined ? 'secretos: [DB_URL, HUB_TOKEN]\n' : o.secretos}${o.publicas === undefined ? 'publicas: [SUPABASE_ANON_KEY]\n' : o.publicas}${
      o.prueba === undefined ? 'datos-de-prueba: docs/referencia/PRUEBA.md\n' : o.prueba
    }---\n`,
  );

test('D-3: sacar un nombre de secretos:, sumar uno a publicas: o cambiar datos-de-prueba: → rojo sin aprobado; al revés → verde', () => {
  const casos = [
    { afloja: { secretos: 'secretos: [HUB_TOKEN]\n' }, aprieta: { secretos: 'secretos: [DB_URL, HUB_TOKEN, OTRO_TOKEN]\n' }, id: 'secretos:DB_URL' },
    { afloja: { publicas: 'publicas: [SUPABASE_ANON_KEY, DB_URL]\n' }, aprieta: { publicas: 'publicas: []\n' }, id: 'publicas:DB_URL' },
    { afloja: { prueba: 'datos-de-prueba: docs/referencia/OTRO.md\n' }, aprieta: { prueba: '' }, id: 'datos-de-prueba' },
  ];
  for (const c of casos) {
    const d = repo({ ficha: FICHA_D3() });
    escribir(d, '.claude/kit.md', FICHA_D3(c.afloja));
    const f = rojo(d, /sin un aprobado sellado/);
    assert.ok(f[0].que.includes(`toca frenos (${c.id})`), `${c.id}: ${f[0].que}`);
    escribir(d, '.claude/kit.md', FICHA_D3(c.aprieta));
    verde(d);
    // con su aprobado (toca frenos, el id en ids:) → verde; con el aprobado de otro id, rojo
    const e = repo({ ficha: FICHA_D3() });
    aprobado(e, { toca: 'frenos', ids: [c.id] });
    commit(e, { '.claude/kit.md': FICHA_D3(c.afloja) });
    verde(e);
    const h = repo({ ficha: FICHA_D3() });
    aprobado(h, { toca: 'frenos', ids: ['secretos:HUB_TOKEN'] });
    commit(h, { '.claude/kit.md': FICHA_D3(c.afloja) });
    rojo(h, /no nombran/);
  }
  // datos-de-prueba: ponerlo donde no estaba también afloja
  const d = repo({ ficha: FICHA_D3({ prueba: '' }) });
  escribir(d, '.claude/kit.md', FICHA_D3());
  rojo(d, /\(datos-de-prueba\)/);
});

// ---------------------------------------------------------------- P4.6: la ref nueva del pre-push y D-3 en los githooks

const CEROS = '0'.repeat(40);

test('rango con ref nueva (el sha de ceros del pre-push): solo lo que ningún remoto tiene; lo ya subido no cuenta', () => {
  const d = repo();
  quitarStash(d); // sin aprobado, pero ya está en origin: no es de este push
  push(d);
  g(d, 'checkout', '-q', '-b', 'nueva');
  const bueno = commit(d, { 'b.txt': 'b\n' });
  const r = B.resolverRango(d, { desde: CEROS, hasta: 'nueva' });
  assert.deepEqual(r, { desde: null, hasta: bueno });
  assert.deepEqual(B.commitsDelRango(d, r), [bueno]);
  verde(d, { rango: r });
  const malo = commit(d, { '.claude/hooks/x.cjs': 'x\n' });
  const f = rojo(d, /hooks:\.claude\/hooks\/x\.cjs/, { rango: B.resolverRango(d, { desde: CEROS, hasta: 'nueva' }) });
  assert.deepEqual(f.map((x) => x.commit), [malo]);
  // sha256: 64 ceros también; 39 ceros no es el de la ref nueva (y no es un commit) → error
  assert.deepEqual(B.resolverRango(d, { desde: '0'.repeat(64), hasta: 'nueva' }), { desde: null, hasta: malo });
  assert.match(B.resolverRango(d, { desde: '0'.repeat(39), hasta: 'nueva' }).error, /no es un commit/);
  // borrar una ref (hasta = ceros) no es un rango que se juzgue: error
  assert.match(B.resolverRango(d, { desde: CEROS, hasta: CEROS }).error, /no es un commit/);
  assert.match(B.resolverRango(d, { desde: 'HEAD', hasta: CEROS }).error, /no es un commit/);
});

test('rango con ref nueva sin ningún remoto (el primer push del repo): todo menos el primer commit, que no tenía un antes', () => {
  const d = repo({ remoto: false, archivos: { '.claude/hooks/x.cjs': 'x\n', '.claude/settings.json': '{}\n' } });
  const raiz = g(d, 'rev-parse', 'HEAD');
  const r = () => B.resolverRango(d, { desde: CEROS, hasta: 'HEAD' });
  assert.deepEqual(B.commitsDelRango(d, r()), [raiz]);
  verde(d, { rango: r() }); // el recién montado no nace trabado (r4-5)
  const malo = quitarStash(d);
  assert.deepEqual(rojo(d, /git stash/, { rango: r() }).map((x) => x.commit), [malo]);
  // una rama huérfana con un freno quitado sube (no hay antes), pero al mergearla se juzga contra main
  g(d, 'checkout', '-q', '--orphan', 'huerfana');
  const h = commit(d, { '.claude/kit.md': FICHA({ quitados: [OTRO] }) });
  verde(d, { rango: B.resolverRango(d, { desde: CEROS, hasta: h }) });
  g(d, 'checkout', '-q', 'main');
  g(d, 'merge', '-q', '--no-ff', '--no-commit', '--allow-unrelated-histories', '-X', 'theirs', 'huerfana');
  rojo(d, /git clean/, IDX);
  g(d, 'merge', '--abort');
});

test('D-3 en los githooks: sacar un nombre de secretos: en el índice → rojo con --indice (en el disco solo, verde); sumarlo → verde; en el push, igual', () => {
  const d = repo({ ficha: FICHA_D3() });
  const base = g(d, 'rev-parse', 'HEAD');
  escribir(d, '.claude/kit.md', FICHA_D3({ secretos: 'secretos: [HUB_TOKEN]\n' }));
  verde(d, IDX);
  g(d, 'add', '.claude/kit.md');
  rojo(d, /toca frenos \(secretos:DB_URL\)/, IDX);
  poner(d, { '.claude/kit.md': FICHA_D3({ secretos: 'secretos: [DB_URL, HUB_TOKEN, OTRO_TOKEN]\n', publicas: 'publicas: []\n' }) });
  verde(d, IDX);
  const aprieta = commit(d, {});
  const afloja = commit(d, { '.claude/kit.md': FICHA_D3({ publicas: 'publicas: [SUPABASE_ANON_KEY, HUB_TOKEN]\n' }) });
  const f = rojo(d, /publicas:HUB_TOKEN/, RG(d, base, afloja));
  assert.deepEqual(f.map((x) => x.commit), [afloja]);
  verde(d, RG(d, base, aprieta));
});

test('antes del primer commit: ni el índice ni lo pendiente se juzgan (no hay antes ni aprobado posible; r4-5); a secas lo dice sin frenar', () => {
  const d = path.join(TMP, `r${n++}`);
  fs.mkdirSync(d, { recursive: true });
  g(d, 'init', '-q', '-b', 'main');
  poner(d, { '.claude/kit.md': FICHA({ quitados: [STASH] }), '.claude/hooks/x.cjs': 'x\n' });
  escribir(d, '.claude/settings.json', '{"permissions": {"deny": []}}\n'); // también lo del disco sin git add
  verde(d, IDX);
  const f = revisar(d);
  assert.equal(f.length, 1, JSON.stringify(f));
  assert.equal(f[0].soloLista, true);
  assert.match(f[0].que, /sin ningún commit todavía: lo pendiente no se juzga/);
  // lo de esta PC se mira igual: un settings.local ignorado con hooks frena sin commits
  escribir(d, '.gitignore', '/.claude/settings.local.json\n');
  escribir(d, '.claude/settings.local.json', '{"hooks": {}}\n');
  assert.ok(revisar(d).some((y) => !y.soloLista && /settings\.local\.json trae la clave hooks/.test(y.que)));
  fs.rmSync(path.join(d, '.claude', 'settings.local.json'));
  g(d, 'commit', '-q', '-m', 'base');
  poner(d, { '.claude/hooks/x.cjs': 'y\n' });
  rojo(d, /hooks:\.claude\/hooks\/x\.cjs/, IDX); // desde el segundo, sí
  const f3 = rojo(d, /hooks:\.claude\/hooks\/x\.cjs/); // y a secas también
  assert.ok(f3.every((y) => !y.soloLista));
});
