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
  assert.deepEqual(B.rango(s).commits, [s2], 'desde la base de todo.cjs, sin ella');
  assert.ok(![s1, h].some((x) => B.rango(s).commits.includes(x)));
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
    rojo(h, /settings:(permissions\.defaultMode|env)/, { molde: MOLDE });
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
