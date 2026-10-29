'use strict';
// Pruebas de lib/cambios.cjs (P6.8a, D2.2 F3): el formato, el hash del sello, validar, toca (cada categoría y cada clase de id)
// y verificar (cada regla, con sellos legítimos hechos por el script y sellos falsos hechos a mano). Corren con:
// node --test "kit/**/*.test.cjs". Repos temporales en el directorio temporal del sistema, sin la configuración de git de la PC.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-cambios-'));
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

const C = require('./cambios.cjs');
const ficha = require('./ficha.cjs');
const frenosLog = require('./frenos-log.cjs');
const script = require('../../scripts/cambios.cjs');

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
function commit(d, archivos, mensaje = 'c') {
  for (const [rel, texto] of Object.entries(archivos)) {
    if (texto === null) g(d, 'rm', '-q', '--', rel);
    else {
      escribir(d, rel, texto);
      g(d, 'add', '-f', '--', rel); // -f: el ignore global de la PC (core.excludesFile por defecto) no cuenta acá
    }
  }
  g(d, 'commit', '-q', '-m', mensaje);
  return g(d, 'rev-parse', 'HEAD');
}
function repo(archivos = {}) {
  const d = path.join(TMP, `r${n++}`);
  fs.mkdirSync(d, { recursive: true });
  g(d, 'init', '-q', '-b', 'main');
  commit(d, { '.gitignore': '/.claude/worktrees/\n/.kit-rol\n', 'a.txt': 'a\n', ...archivos }, 'base');
  return d;
}
function cli(d, ...args) {
  let out = '';
  let err = '';
  const cuerpo = typeof args[args.length - 1] === 'object' ? args.pop().cuerpo : CUERPO;
  const codigo = script.main(args, { cwd: d, salida: (s) => (out += s), error: (s) => (err += s), entradaEstandar: () => cuerpo });
  return { codigo, out, err };
}

const CUERPO = '## Caso de origen\nel stash pisó trabajo (2026-10)\n\n## Regla\nquitar el freno del stash\n\n## Dónde vive\n.claude/hooks/x.cjs\n\n## Medición\n| antes | después |\n';
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
    'frenos:',
    `  opcionales: ${o.opcionales || '[]'}`,
    ...(o.quitados ? ['  quitados:', ...o.quitados.map((q) => `    - ${q}`)] : ['  quitados: []']),
    'sensible:',
    `  plata: ${o.plata || 'no'}`,
    'autorizado:',
    `  merge-a-main: ${o.merge || 'con-gate-verde'}`,
    '---',
    '',
  ].join('\n');

// Un 3-barrera propuesto por el script (con su commit). → id
function proponer(d, o = {}) {
  const args = ['nuevo', '--slug', o.slug || 'quitar-stash', '--clase', o.clase || '3-barrera', '--toca', o.toca || 'hooks', '--origen', 'lo pidió Guido'];
  for (const id of o.ids || ['hooks:.claude/hooks/x.cjs']) args.push('--id', id);
  const r = cli(d, ...args);
  assert.equal(r.codigo, 0, r.out + r.err);
  return /propuesto (\S+)/.exec(r.out)[1];
}
function aprobar(d, id) {
  const r = cli(d, 'aprobar', id);
  assert.equal(r.codigo, 0, r.out);
  return g(d, 'rev-parse', 'HEAD');
}
const rel = (id) => `.claude/cambios/${id}.md`;
const verde = (d) => assert.deepEqual(C.verificar(d), []);
function rojo(d, re) {
  const f = C.verificar(d);
  assert.ok(f.some((x) => re.test(x.que)), `esperaba ${re} y vino: ${JSON.stringify(f)}`);
  return f;
}

// El sello hecho A MANO, como lo haría un agente sin el script (Bash: archivo, renglón y commit). `extra`: archivos de más.
function sellarAMano(d, id, o = {}) {
  const r = rel(id);
  const texto = leerArchivo(d, r);
  const ahora = new Date();
  const rama = g(d, 'symbolic-ref', '--short', 'HEAD');
  const datos = { id: C.ID_APROBAR, herramienta: C.HERRAMIENTA_APROBAR, detalle: id, rol: 'humano', rama, ...(o.renglon || {}) };
  const freno = o.freno || frenosLog.renglon(datos, ahora);
  const s = { sesion: 'sin-marca', fecha: frenosLog.fechaConZona(ahora), carpeta: o.carpeta || '.', rol: o.rol || 'humano', hash: C.hashSello(texto), freno };
  escribir(d, r, C.ponerCampos(texto, { estado: 'aprobado', aprobo: C.textoSello(s) }));
  if (!o.sinLog) frenosLog.anotar(d, datos, ahora);
  g(d, 'add', '--', r);
  if (!o.sinLog) g(d, 'add', '--', '.claude/frenos.log');
  for (const [k, v] of Object.entries(o.extra || {})) {
    escribir(d, k, v);
    g(d, 'add', '--', k);
  }
  g(d, 'commit', '-q', '-m', `cambios: aprobado ${id}`);
  return g(d, 'rev-parse', 'HEAD');
}

// ---------------------------------------------------------------- formato

test('armar → leer → validar: un 3-barrera recién hecho está en orden; ids normalizados y entre comillas', () => {
  const t = C.armar({ clase: '3-barrera', toca: ['settings'], ids: ['hook:PreToolUse/Bash/node "$CLAUDE_PROJECT_DIR\\.claude\\x.cjs"', 'deny:Bash(a, b)'], origen: 'caso', cicatriz: 'no', chico: 'sí', urgente: 'no', cuerpo: CUERPO });
  assert.match(t, /^ids: \["hook:PreToolUse\/Bash\/node \$CLAUDE_PROJECT_DIR\/\.claude\/x\.cjs", "deny:Bash\(a, b\)"\]$/m);
  const { datos, cuerpo } = C.leer(t);
  assert.deepEqual(datos.ids, ['hook:PreToolUse/Bash/node $CLAUDE_PROJECT_DIR/.claude/x.cjs', 'deny:Bash(a, b)']);
  assert.deepEqual(C.validar(datos, cuerpo), []);
  assert.equal(C.reglaEnUnaLinea(cuerpo), 'quitar el freno del stash');
});

test('validar: cada regla del formato da su falla', () => {
  const base = () => C.leer(C.armar({ clase: '3-barrera', toca: ['hooks'], ids: ['hooks:x'], origen: 'o', cicatriz: 'no', chico: 'sí', urgente: 'no', cuerpo: CUERPO }));
  const falla = (cambiar, campo, re) => {
    const { datos, cuerpo } = base();
    const r = cambiar(datos, cuerpo);
    const otro = r && typeof r === 'object' && 'datos' in r;
    const f = C.validar(otro ? r.datos : datos, otro ? r.cuerpo : cuerpo);
    assert.ok(f.some((x) => x.campo === campo && re.test(x.que)), `${campo} ${re}: ${JSON.stringify(f)}`);
  };
  falla((d) => (d.estado = 'aprobadisimo'), 'estado', /no se acepta/);
  falla((d) => delete d.estado, 'estado', /falta/);
  falla((d) => (d.clase = '3'), 'clase', /no se acepta/);
  falla((d) => (d.toca = ['hooks', 'ficha']), 'toca', /no es una barrera/);
  falla((d) => (d.toca = []), 'toca', /lista no vacía/);
  falla((d) => delete d.toca, 'toca', /falta/);
  falla((d) => delete d.ids, 'ids', /sin "ids"/);
  falla((d) => (d.ids = []), 'ids', /sin ids/);
  falla((d) => (d.cita = 'hub 12'), 'origen', /uno solo/);
  falla((d) => delete d.origen, 'origen', /uno solo/);
  falla((d) => {
    delete d.origen;
    d.cita = 'sin-id';
  }, 'cita', /<alias> <id>/);
  falla((d) => (d.cicatriz = 'mucha'), 'cicatriz', /no se acepta/);
  falla((d) => (d.chico = 'quizás'), 'chico', /no se acepta/);
  falla((d) => (d.cicatriz = 'seguridad'), 'chico-por', /va contra la cicatriz/);
  falla((d) => (d.urgente = 'ya'), 'urgente', /no se acepta/);
  falla((d) => (d.colorcito = 'x'), 'colorcito', /desconocido/);
  falla((d) => (d.estado = 'aprobado'), 'aprobo', /sin sello/);
  falla((d) => (d.estado = 'aplicado'), 'sha', /aplicado sin "sha"/);
  falla((d) => (d.sha = 'abc'), 'sha', /en un cambio propuesto/);
  falla((d) => (d.estado = 'rechazado'), 'motivo', /rechazado sin "motivo"/);
  falla((d) => (d.estado = 'subio-al-kit'), 'version', /N\.N\.N/);
  falla((d) => (d.aprobo = { sesion: 'x' }), 'aprobo', /en un cambio propuesto/);
  falla((d) => {
    d.estado = 'aprobado';
    d.aprobo = { sesion: 'x', fecha: 'ayer', carpeta: '.', rol: 'humano', hash: 'abcdefabcdef', freno: 'f' };
  }, 'aprobo', /mal formado/);
  falla((d) => {
    d.estado = 'aplicado';
    d.sha = 'a'.repeat(40);
    d.aprobo = { sesion: 'x', fecha: '2026-10-28T10:00:00-03:00', carpeta: '.', rol: 'humano', hash: 'abcdefabcdef', freno: 'f' };
    d.aplico = { archivo: 'x' };
  }, 'aplico', /archivo, hash/);
  falla((d) => {
    d.clase = '2';
    d.toca = ['inicio'];
    d.estado = 'aprobado';
  }, 'estado', /aprobado en un cambio de clase 2/);
  falla((d) => {
    d.clase = '2';
    d.toca = ['frenos'];
  }, 'toca', /clase 2 nombra una barrera/);
  falla((d) => {
    d.clase = '2';
    d.toca = ['Mal Nombre'];
  }, 'toca', /nombre de pieza/);
  falla((d, c) => ({ datos: d, cuerpo: c.replace('## Medición', '## Otra') }), 'cuerpo', /Medición/);
  falla((d, c) => ({ datos: d, cuerpo: c.replace('quitar el freno del stash', '') }), 'cuerpo', /Regla.*vacía/);
});

test('validar: un clase 2 sin ids y aplicado con sha está en orden; chico-por salva chico: sí con cicatriz', () => {
  const { datos, cuerpo } = C.leer(C.armar({ clase: '2', toca: ['inicio'], ids: [], cita: 'hub 12', cicatriz: 'seguridad', chico: 'sí', chicoPor: 'es una línea', urgente: 'no', cuerpo: CUERPO }));
  assert.deepEqual(C.validar(datos, cuerpo), []);
  datos.estado = 'aplicado';
  datos.sha = 'b'.repeat(40);
  assert.deepEqual(C.validar(datos, cuerpo), []);
});

test('hashSello: no lo mueven estado, aprobo, sha ni aplico (ni en bloque); sí cualquier otra cosa, cuerpo incluido; CRLF = LF', () => {
  const t = C.armar({ clase: '3-barrera', toca: ['hooks'], ids: ['hooks:x'], origen: 'o', cicatriz: 'no', chico: 'sí', urgente: 'no', cuerpo: CUERPO });
  const h = C.hashSello(t);
  assert.match(h, /^[0-9a-f]{12}$/);
  const despues = C.ponerCampos(t, { estado: 'aplicado', sha: 'c'.repeat(40), aplico: '{archivo: "x", hash: abcdefabcdef}', aprobo: '{sesion: s, fecha: "f", carpeta: ., rol: humano, hash: h, freno: "r"}' });
  assert.equal(C.hashSello(despues), h);
  assert.equal(C.hashSello(despues.replace('aplico: {archivo: "x", hash: abcdefabcdef}', 'aplico:\n  archivo: x\n  hash: abcdefabcdef')), h);
  assert.equal(C.hashSello(t.replace(/\n/g, '\r\n')), h);
  assert.notEqual(C.hashSello(t.replace('quitar el freno', 'quitar los frenos')), h);
  assert.notEqual(C.hashSello(t.replace('ids: ["hooks:x"]', 'ids: ["hooks:x", "hooks:y"]')), h);
  assert.notEqual(C.hashSello(t.replace('chico: sí', 'chico: no')), h);
});

test('ponerCampos: reemplaza en su renglón, saca con null, agrega al final de la cabecera; lo demás, igual', () => {
  const t = C.armar({ clase: '2', toca: ['inicio'], origen: 'o', cicatriz: 'no', chico: 'sí', urgente: 'no', cuerpo: CUERPO });
  const u = C.ponerCampos(t, { estado: 'rechazado', motivo: '"no va"' });
  assert.match(u, /^---\nestado: rechazado\nclase: 2\n[\s\S]*urgente: no\nmotivo: "no va"\n---\n/);
  assert.equal(C.ponerCampos(u, { motivo: null, estado: 'propuesto' }), t.replace(/\n$/, '\n'));
});

// ---------------------------------------------------------------- toca

test('categoriaDe: cada barrera por ruta, sin mayúsculas; los dos scripts del candado son hooks; lo demás, nada', () => {
  const casos = {
    '.claude/kit.md': 'ficha',
    '.claude/settings.json': 'settings',
    '.claude/settings.local.json': 'settings',
    '.Claude/Settings.JSON': 'settings',
    '.claude/hooks/lib/contexto.cjs': 'hooks',
    '.claude/HOOKS/x.cjs': 'hooks',
    '.claude/hooks': 'hooks',
    '.claude/scripts/estructura.cjs': 'hooks',
    '.claude/scripts/cambios.cjs': 'hooks',
    '.githooks/pre-commit': 'githooks',
    '.gitleaksignore': 'gitleaks',
    '.gitleaks.toml': 'gitleaks',
    '.claude/scripts/todo.cjs': null,
    '.claude/cambios/x.md': null,
    '.claude/frenos.log': null,
    '.claude/settings/x.json': null,
    'docs/settings.json': null,
    'hooks/x.cjs': null,
  };
  for (const [r, cat] of Object.entries(casos)) assert.equal(C.categoriaDe(r), cat, r);
});

test('toca de un commit: archivos por categoría con id <categoría>:<ruta>; agregar, cambiar y borrar cuentan', () => {
  const d = repo({ '.claude/hooks/a.cjs': 'a', '.githooks/pre-commit': 'x' });
  let sha = commit(d, { '.claude/hooks/a.cjs': 'a2', '.claude/hooks/lib/b.cjs': 'b', 'otro.txt': 'o' });
  assert.deepEqual(C.toca(d, sha), { categorias: ['hooks'], ids: ['hooks:.claude/hooks/a.cjs', 'hooks:.claude/hooks/lib/b.cjs'] });
  sha = commit(d, { '.githooks/pre-commit': null, '.gitleaksignore': 'x', '.gitleaks.toml': 'y', '.claude/scripts/cambios.cjs': 'c', '.claude/scripts/estructura.cjs': 'e' });
  assert.deepEqual(C.toca(d, sha), {
    categorias: ['githooks', 'gitleaks', 'hooks'],
    ids: ['githooks:.githooks/pre-commit', 'gitleaks:.gitleaks.toml', 'gitleaks:.gitleaksignore', 'hooks:.claude/scripts/cambios.cjs', 'hooks:.claude/scripts/estructura.cjs'],
  });
  sha = commit(d, { 'otro.txt': 'o2', '.claude/scripts/todo.cjs': 't' });
  assert.deepEqual(C.toca(d, sha), { categorias: [], ids: [] });
  // el primer commit del repo (sin padre) también: todo lo que trae
  assert.deepEqual(C.toca(d, g(d, 'rev-list', '--max-parents=0', 'HEAD')), { categorias: ['githooks', 'hooks'], ids: ['githooks:.githooks/pre-commit', 'hooks:.claude/hooks/a.cjs'] });
});

test('toca de la ficha: frenos por id (agregar, cambiar el hasta, opcional), sensible y autorizado por clave', () => {
  const d = repo({ '.claude/kit.md': FICHA() });
  let sha = commit(d, { '.claude/kit.md': FICHA({ quitados: ['{id: deny:Bash(git stash:*), por: "x", hasta: siempre}'] }) });
  assert.deepEqual(C.toca(d, sha), { categorias: ['frenos'], ids: ['deny:Bash(git stash:*)'] });
  sha = commit(d, { '.claude/kit.md': FICHA({ quitados: ['{id: deny:Bash(git stash:*), por: "x", hasta: 2027-01-01}'] }) });
  assert.deepEqual(C.toca(d, sha).ids, ['deny:Bash(git stash:*)']);
  sha = commit(d, { '.claude/kit.md': FICHA({ quitados: ['{id: deny:Bash(git stash:*), por: "x", hasta: 2027-01-01}'], opcionales: '[candado:mesa]' }) });
  assert.deepEqual(C.toca(d, sha), { categorias: ['frenos'], ids: ['candado:mesa'] });
  sha = commit(d, { '.claude/kit.md': FICHA({ quitados: ['{id: deny:Bash(git stash:*), por: "x", hasta: 2027-01-01}'], opcionales: '[candado:mesa]', plata: '[cobros]', merge: 'libre' }) });
  assert.deepEqual(C.toca(d, sha), { categorias: ['autorizado', 'sensible'], ids: ['autorizado:merge-a-main', 'sensible:plata'] });
});

test('toca de la ficha: nivel y las dos piezas cuentan SOLO cuando aflojan; el hash de una pieza no cuenta', () => {
  const d = repo({ '.claude/kit.md': FICHA() });
  let sha = commit(d, { '.claude/kit.md': FICHA({ nivel: 'liviano' }) });
  assert.deepEqual(C.toca(d, sha), { categorias: ['frenos'], ids: ['nivel'] });
  sha = commit(d, { '.claude/kit.md': FICHA() }); // liviano → estandar: aprieta
  assert.deepEqual(C.toca(d, sha), { categorias: [], ids: [] });
  sha = commit(d, { '.claude/kit.md': FICHA({ candado: 'no' }) });
  assert.deepEqual(C.toca(d, sha), { categorias: ['frenos'], ids: ['pieza:candado'] });
  sha = commit(d, { '.claude/kit.md': FICHA({ candado: '{estado: molde, hash: abcdefabcdef}' }) }); // prender
  assert.deepEqual(C.toca(d, sha), { categorias: [], ids: [] });
  sha = commit(d, { '.claude/kit.md': FICHA({ candado: '{estado: adaptada, hash: 123456123456}' }) }); // otro hash
  assert.deepEqual(C.toca(d, sha), { categorias: [], ids: [] });
  sha = commit(d, { '.claude/kit.md': FICHA({ candado: '{estado: no, hash: 123456123456}', escritura: 'no' }) });
  assert.deepEqual(C.toca(d, sha), { categorias: ['frenos'], ids: ['pieza:candado', 'pieza:hook-escritura'] });
  // la pieza que desaparece también afloja
  const sin = FICHA().replace('  hook-escritura: molde\n', '');
  sha = commit(d, { '.claude/kit.md': FICHA() });
  sha = commit(d, { '.claude/kit.md': sin });
  assert.deepEqual(C.toca(d, sha), { categorias: ['frenos'], ids: ['pieza:hook-escritura'] });
});

test('toca de la ficha: borrarla cambia todos sus ids; crearla, los de su contenido (sin nivel ni piezas)', () => {
  const contenido = FICHA({ quitados: ['{id: hook:git-seguro/push-force, por: "x", hasta: siempre}'] });
  const d = repo({ '.claude/kit.md': contenido });
  const borrar = commit(d, { '.claude/kit.md': null });
  assert.deepEqual(C.toca(d, borrar), {
    categorias: ['autorizado', 'frenos', 'sensible'],
    ids: ['autorizado:merge-a-main', 'hook:git-seguro/push-force', 'nivel', 'pieza:candado', 'pieza:hook-escritura', 'sensible:plata'],
  });
  const crear = commit(d, { '.claude/kit.md': contenido });
  assert.deepEqual(C.toca(d, crear), { categorias: ['autorizado', 'frenos', 'sensible'], ids: ['autorizado:merge-a-main', 'hook:git-seguro/push-force', 'sensible:plata'] });
});

test('toca de la ficha rota: el lado que se lee cuenta entero; rota de los dos lados, ficha:rota', () => {
  const rota = '---\nkit: 2.4.3\nnivel: medio\nvars:\n  proyecto: x\n---\n';
  const d = repo({ '.claude/kit.md': FICHA() });
  const romper = commit(d, { '.claude/kit.md': rota });
  assert.deepEqual(C.toca(d, romper).categorias, ['autorizado', 'frenos', 'sensible']);
  assert.ok(C.toca(d, romper).ids.includes('nivel'));
  const otraRota = commit(d, { '.claude/kit.md': rota.replace('medio', 'alto') });
  assert.deepEqual(C.toca(d, otraRota), { categorias: ['autorizado', 'frenos', 'sensible'], ids: ['ficha:rota'] });
});

const SETTINGS = (o = {}) =>
  `${JSON.stringify(
    {
      permissions: { deny: o.deny || ['Bash(git stash:*)', 'Read(./.env)'], ...(o.perm || {}) },
      hooks: {
        PreToolUse: [
          {
            matcher: 'Bash|PowerShell',
            hooks: [{ type: 'command', command: o.comando || 'node "$CLAUDE_PROJECT_DIR\\.claude\\hooks\\niega-aprobar.cjs"', timeout: 20, ...(o.sinBlock ? {} : { onFailure: 'block' }) }],
          },
        ],
      },
      ...(o.extra || {}),
    },
    null,
    2,
  )}\n`;

test('toca de settings: una regla deny quitada, un hook con comillas y \\ (normalizado), otra clave, defaultMode', () => {
  const d = repo({ '.claude/settings.json': SETTINGS() });
  let sha = commit(d, { '.claude/settings.json': SETTINGS({ deny: ['Read(./.env)'] }) });
  assert.deepEqual(C.toca(d, sha), { categorias: ['settings'], ids: ['deny:Bash(git stash:*)'] });
  sha = commit(d, { '.claude/settings.json': SETTINGS({ deny: ['Read(./.env)'], sinBlock: true }) });
  assert.deepEqual(C.toca(d, sha).ids, ['hook:PreToolUse/Bash|PowerShell/node $CLAUDE_PROJECT_DIR/.claude/hooks/niega-aprobar.cjs']);
  sha = commit(d, { '.claude/settings.json': SETTINGS({ deny: ['Read(./.env)'], sinBlock: true, extra: { disableAllHooks: true }, perm: { defaultMode: 'bypassPermissions' } }) });
  assert.deepEqual(C.toca(d, sha), { categorias: ['settings'], ids: ['settings:disableAllHooks', 'settings:permissions.defaultMode'] });
  sha = commit(d, { '.claude/settings.local.json': '{ roto' });
  assert.deepEqual(C.toca(d, sha), { categorias: ['settings'], ids: ['settings:.claude/settings.local.json'] });
  sha = commit(d, { '.claude/settings.json': null });
  const t = C.toca(d, sha);
  assert.ok(t.ids.includes('deny:Read(./.env)') && t.ids.includes('settings:disableAllHooks'), JSON.stringify(t));
});

test('toca pendiente: índice y disco contra HEAD, más lo no seguido; lo ignorado no cuenta, salvo bajo hooks, scripts y .githooks (rf-6 b)', () => {
  const d = repo({ '.claude/kit.md': FICHA(), '.claude/hooks/a.cjs': 'a' });
  escribir(d, '.gitignore', '/.claude/worktrees/\n/.kit-rol\n/.claude/hooks/ignorado.cjs\n/notas/\n');
  g(d, 'add', '.gitignore');
  g(d, 'commit', '-q', '-m', 'ignorar');
  assert.deepEqual(C.toca(d, 'pendiente'), { categorias: [], ids: [] });
  escribir(d, 'notas/x.cjs', 'x');
  assert.deepEqual(C.toca(d, 'pendiente'), { categorias: [], ids: [] });
  escribir(d, '.claude/hooks/ignorado.cjs', 'x');
  assert.deepEqual(C.toca(d, 'pendiente'), { categorias: ['hooks'], ids: ['hooks:.claude/hooks/ignorado.cjs'] });
  fs.unlinkSync(path.join(d, '.claude', 'hooks', 'ignorado.cjs'));
  escribir(d, '.claude/hooks/nuevo.cjs', 'x'); // sin seguir
  assert.deepEqual(C.toca(d, 'pendiente').ids, ['hooks:.claude/hooks/nuevo.cjs']);
  fs.unlinkSync(path.join(d, '.claude', 'hooks', 'nuevo.cjs'));
  // solo en el índice: la ficha aflojada en el índice y vuelta atrás en el disco
  escribir(d, '.claude/kit.md', FICHA({ candado: 'no' }));
  g(d, 'add', '.claude/kit.md');
  escribir(d, '.claude/kit.md', FICHA());
  assert.deepEqual(C.toca(d, 'pendiente'), { categorias: ['frenos'], ids: ['pieza:candado'] });
  // solo en el disco
  g(d, 'reset', '-q', '--', '.claude/kit.md');
  escribir(d, '.claude/kit.md', FICHA({ nivel: 'liviano' }));
  assert.deepEqual(C.toca(d, 'pendiente').ids, ['nivel']);
});

test('toca pendiente en un repo sin commits: todo lo del índice y lo no seguido', () => {
  const d = path.join(TMP, `vacio${n++}`);
  fs.mkdirSync(d);
  g(d, 'init', '-q', '-b', 'main');
  escribir(d, '.claude/hooks/a.cjs', 'a');
  escribir(d, '.claude/settings.json', SETTINGS());
  g(d, 'add', '.claude/settings.json');
  const t = C.toca(d, 'pendiente');
  assert.deepEqual(t.categorias, ['hooks', 'settings']);
  assert.ok(t.ids.includes('hooks:.claude/hooks/a.cjs') && t.ids.includes('deny:Bash(git stash:*)'));
});

test('toca: un commit que no existe tira', () => {
  const d = repo();
  assert.throws(() => C.toca(d, 'f'.repeat(40)), /no existe/);
});

// ---------------------------------------------------------------- verificar

test('el recorrido: propuesto → aprobado (sello) → commit que aplica → consumido sin anotar → anotar-sha → aplicado, verde', () => {
  const d = repo();
  const id = proponer(d);
  verde(d);
  aprobar(d, id);
  verde(d);
  const aplica = commit(d, { '.claude/hooks/x.cjs': '// x' }, 'aplica');
  const f = rojo(d, /consumido sin anotar/);
  assert.equal(f[0].hacer, `node .claude/scripts/cambios.cjs anotar-sha ${id} ${aplica}`);
  assert.equal(cli(d, 'anotar-sha', id, aplica).codigo, 0);
  verde(d);
  assert.match(leerArchivo(d, rel(id)), new RegExp(`^estado: aplicado$[\\s\\S]*^sha: ${aplica}$`, 'm'));
  // un commit que no toca lo de "toca" no consume
  const d2 = repo();
  const id2 = proponer(d2);
  aprobar(d2, id2);
  commit(d2, { 'otro.txt': 'x', '.claude/settings.json': '{}\n' });
  verde(d2);
});

test('verificar: estado aprobado escrito a mano (sin sello) → rojo', () => {
  const d = repo();
  const id = proponer(d);
  commit(d, { [rel(id)]: C.ponerCampos(leerArchivo(d, rel(id)), { estado: 'aprobado' }) });
  rojo(d, /3-barrera aprobado sin sello/);
});

test('verificar: estado fuera de los cinco y aprobado en clase 2 → rojo', () => {
  const d = repo();
  const id = proponer(d);
  escribir(d, rel(id), C.ponerCampos(leerArchivo(d, rel(id)), { estado: 'listo' }));
  rojo(d, /"estado" tiene un valor que no se acepta/);
  const id2 = proponer(d, { slug: 'clase-dos', clase: '2', toca: 'inicio', ids: [] });
  escribir(d, rel(id2), C.ponerCampos(leerArchivo(d, rel(id2)), { estado: 'aprobado' }));
  rojo(d, /aprobado en un cambio de clase 2/);
});

test('verificar: sello con carpeta distinta de "." → rojo (y con rol que no es humano)', () => {
  const d = repo();
  const id = proponer(d);
  sellarAMano(d, id, { carpeta: '.claude/worktrees/w1' });
  rojo(d, /otra carpeta que el checkout principal/);
  const d2 = repo();
  const id2 = proponer(d2);
  sellarAMano(d2, id2, { rol: 'obrero' });
  rojo(d2, /rol que no es humano/);
});

test('verificar: el renglón del sello que no está en frenos.log → rojo', () => {
  const d = repo();
  const id = proponer(d);
  const ahora = new Date();
  const freno = frenosLog.renglon({ id: C.ID_APROBAR, herramienta: C.HERRAMIENTA_APROBAR, detalle: id, rol: 'humano', rama: 'main' }, ahora);
  sellarAMano(d, id, { freno, sinLog: true });
  rojo(d, /no lo agregó a frenos.log/);
});

test('verificar: un renglón en frenos.log que no es el de cambios aprobar para ESTE cambio → rojo', () => {
  for (const otro of [{ detalle: '2026-01-01-otro' }, { herramienta: 'Bash' }, { id: 'cambios:aprobar-negado' }]) {
    const d = repo();
    const id = proponer(d);
    sellarAMano(d, id, { renglon: otro });
    rojo(d, /no es el que escribe cambios aprobar para este cambio/);
  }
});

test('verificar: un sello que reemplaza a otro (resellado a mano tras editar la regla) → rojo', () => {
  const d = repo();
  const id = proponer(d);
  aprobar(d, id);
  commit(d, { [rel(id)]: leerArchivo(d, rel(id)).replace('quitar el freno del stash', 'quitar todos los frenos') });
  rojo(d, /el hash del sello no coincide/);
  sellarAMano(d, id);
  const f = rojo(d, /el sello reemplazó a otro sello/);
  assert.ok(!f.some((x) => /hash/.test(x.que)), 'el hash del resello coincide: lo frena solo el reemplazo');
});

test('toca: los otros campos de frenos cuentan como frenos:<clave>', () => {
  const d = repo({ '.claude/kit.md': FICHA() });
  const sha = commit(d, { '.claude/kit.md': FICHA().replace('  quitados: []\n', '  quitados: []\n  extra: algo\n') });
  assert.deepEqual(C.toca(d, sha), { categorias: ['frenos'], ids: ['frenos:extra'] });
});

test('toca: una ruta con comillas en git (que Windows no deja crear en el disco) sale normalizada', () => {
  const d = repo();
  const blobSha = spawnSync('git', ['hash-object', '-w', '--stdin'], { cwd: d, input: 'x', encoding: 'utf8', env: process.env }).stdout.trim();
  g(d, '-c', 'core.protectNTFS=false', 'update-index', '--add', '--cacheinfo', `100644,${blobSha},.claude/hooks/a"b.cjs`);
  g(d, 'commit', '-q', '-m', 'con comillas');
  assert.deepEqual(C.toca(d, g(d, 'rev-parse', 'HEAD')), { categorias: ['hooks'], ids: ['hooks:.claude/hooks/ab.cjs'] });
});

test('verificar: un sello hecho a mano con la forma exacta del script, en la rama por defecto, NO se distingue (r4-1 b, riesgo escrito)', () => {
  const d = repo();
  const id = proponer(d);
  sellarAMano(d, id);
  verde(d);
});

test('verificar: hash que no coincide (alguien editó la regla después del clic) → rojo', () => {
  const d = repo();
  const id = proponer(d);
  aprobar(d, id);
  commit(d, { [rel(id)]: leerArchivo(d, rel(id)).replace('quitar el freno del stash', 'quitar todos los frenos') });
  rojo(d, /el hash del sello no coincide/);
});

test('verificar: sello traído por merge --no-ff desde otra rama → rojo', () => {
  const d = repo();
  const id = proponer(d);
  g(d, 'checkout', '-q', '-b', 'worktree-w1');
  sellarAMano(d, id);
  g(d, 'checkout', '-q', 'main');
  commit(d, { 'b.txt': 'b' });
  g(d, 'merge', '-q', '--no-ff', '-m', 'merge', 'worktree-w1');
  rojo(d, /llegó por un merge/);
});

test('verificar: sello que solo está en otra rama (no en la por defecto) → rojo', () => {
  const d = repo();
  const id = proponer(d);
  g(d, 'checkout', '-q', '-b', 'modulo/x');
  sellarAMano(d, id);
  rojo(d, /no está en la historia --first-parent/);
});

test('verificar: el commit del sello que toca otro archivo → rojo', () => {
  const d = repo();
  const id = proponer(d);
  sellarAMano(d, id, { extra: { '.claude/hooks/x.cjs': '// de contrabando' } });
  rojo(d, /toca algo más que el cambio y frenos.log/);
});

test('verificar: aplicado sin sha, con un sha inexistente, o reapuntado a un commit posterior al primero → rojo', () => {
  const d = repo();
  const id = proponer(d);
  aprobar(d, id);
  const primero = commit(d, { '.claude/hooks/x.cjs': '1' });
  const segundo = commit(d, { '.claude/hooks/y.cjs': '2' });
  assert.equal(cli(d, 'anotar-sha', id, primero).codigo, 0);
  verde(d);
  const texto = leerArchivo(d, rel(id));
  escribir(d, rel(id), C.ponerCampos(texto, { sha: segundo }));
  const f = rojo(d, /no es el primer commit/);
  assert.match(f.find((x) => /primer commit/.test(x.que)).hacer, new RegExp(`anotar-sha ${id} ${primero}`));
  escribir(d, rel(id), C.ponerCampos(texto, { sha: 'e'.repeat(40) }));
  rojo(d, /no existe en este repo/);
  escribir(d, rel(id), C.ponerCampos(texto, { sha: null }));
  rojo(d, /aplicado sin "sha"/);
  // un sha anterior al sello
  escribir(d, rel(id), C.ponerCampos(texto, { sha: g(d, 'rev-list', '--max-parents=0', 'HEAD') }));
  rojo(d, /no viene después del sello/);
});

test('verificar: archivo con nombre inválido o cabecera ilegible → rojo; carpeta vacía o sin carpeta → verde', () => {
  const d = repo();
  verde(d);
  escribir(d, '.claude/cambios/Mal Nombre.md', 'x');
  rojo(d, /el nombre no es/);
  fs.unlinkSync(path.join(d, '.claude', 'cambios', 'Mal Nombre.md'));
  escribir(d, '.claude/cambios/2026-10-28-roto.md', '---\nestado: [\n---\n');
  rojo(d, /la cabecera no se lee/);
});

test('commitDelSello y primerQueToca: exportados para el candado (F4), solos', () => {
  const d = repo();
  const id = proponer(d);
  const s = aprobar(d, id);
  const texto = leerArchivo(d, rel(id));
  const datos = C.leer(texto).datos;
  assert.deepEqual(C.commitDelSello(d, rel(id), C.lineaAprobo(texto), 'refs/heads/main', datos.aprobo.freno), { sha: s });
  const c1 = commit(d, { 'z.txt': 'z' });
  const c2 = commit(d, { '.claude/hooks/x.cjs': 'x' });
  assert.equal(C.primerQueToca(d, s, 'HEAD', ['hooks']), c2);
  assert.equal(C.primerQueToca(d, s, c1, ['hooks']), null);
  assert.equal(C.primerQueToca(d, s, 'HEAD', ['settings']), null);
  assert.deepEqual(C.validarSello(d, { id, rel: rel(id), texto, datos }, C.ramaLocal(d)), { fallas: [], sello: s });
  assert.deepEqual(C.validarSello(d, { id, rel: rel(id), texto, datos }, null).sello, null);
});

test('toca de un merge (rf-3): solo lo que difiere de TODOS los padres; lo que trae la rama no; primerQueToca no lo cuenta como toque', () => {
  const d = repo({ '.claude/kit.md': FICHA(), '.claude/hooks/a.cjs': 'a' });
  g(d, 'checkout', '-q', '-b', 'modulo/x');
  const x = commit(d, { '.claude/hooks/a.cjs': 'a2', '.claude/kit.md': FICHA({ plata: '[caja]' }) });
  g(d, 'checkout', '-q', 'main');
  const y = commit(d, { 'b.txt': 'b' });
  g(d, 'merge', '-q', '--no-ff', '-m', 'integrar', 'modulo/x');
  const m = g(d, 'rev-parse', 'HEAD');
  assert.deepEqual(C.toca(d, m), { categorias: [], ids: [] });
  assert.equal(C.primerQueToca(d, y, m, ['hooks', 'sensible']), x, 'el de la rama, no el merge');
  assert.equal(C.primerQueToca(d, x, m, ['hooks', 'sensible']), null, 'desde la rama, el merge no toca nada');
  // el merge que agrega lo suyo (en un archivo que también trae la rama): solo eso
  g(d, 'checkout', '-q', '-b', 'modulo/z', y);
  commit(d, { '.claude/hooks/a.cjs': 'a3' });
  g(d, 'checkout', '-q', 'main');
  spawnSync('git', ['merge', '-q', '--no-ff', '--no-commit', 'modulo/z'], { cwd: d, env: process.env }); // conflicto en a.cjs
  escribir(d, '.claude/hooks/a.cjs', 'a4');
  escribir(d, '.claude/kit.md', FICHA({ plata: '[caja]', merge: 'libre' }));
  g(d, 'add', '.claude/hooks/a.cjs', '.claude/kit.md');
  g(d, 'commit', '-q', '-m', 'merge resuelto a mano');
  const m2 = g(d, 'rev-parse', 'HEAD');
  assert.deepEqual(C.toca(d, m2), { categorias: ['autorizado', 'hooks'], ids: ['autorizado:merge-a-main', 'hooks:.claude/hooks/a.cjs'] });
});

test('idsFicha: los pares categoría·id (un id de frenos.quitados que se llama como una regla del settings sigue siendo de frenos)', () => {
  const r = C.idsFicha(FICHA(), FICHA({ quitados: ['{id: "deny:Bash(x)", por: "p", hasta: siempre}'], plata: '[caja]' }));
  assert.deepEqual(r.categorias, ['frenos', 'sensible']);
  assert.deepEqual(r.ids, ['deny:Bash(x)', 'sensible:plata']);
  assert.deepEqual([...r.pares].sort(), [C.par('frenos', 'deny:Bash(x)'), C.par('sensible', 'sensible:plata')].sort());
  const s = C.paresArchivo('settings', '.claude/settings.json', '{}', ['{"permissions": {"deny": ["Bash(x)"]}}']);
  assert.deepEqual(C.desdePares(C.interseccion([r.pares, s])), { categorias: [], ids: [] }, 'mismo id, otra categoría: no se cruzan');
  const borrada = C.idsFicha(FICHA(), null);
  assert.ok([...borrada.pares].includes(C.par('autorizado', 'nivel')), 'la borrada cuenta cada id en las tres');
  assert.deepEqual(C.interseccion([]), new Set());
});
