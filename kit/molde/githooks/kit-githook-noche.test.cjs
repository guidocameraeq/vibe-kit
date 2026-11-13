'use strict';
// Pruebas de la noche en el runner de los githooks (crit. 16 del delta del paquete 5; SPEC-0 línea 26): un rol de día con la marca
// .kit-noche (la propia o, en un obrero, la del worktree de su director) se juzga como nocturno — sin escáner, no pasa. Aparte de
// kit-githook.test.cjs (lo toca otro encargo). Repos temporales con el molde instanciado y git de verdad, sin la config de la PC y
// sin gitleaks en el PATH. Corren con: node --test kit/molde/githooks/kit-githook-noche.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-githook-noche-'));
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

const MOLDE = path.join(__dirname, '..');
const kg = require('./kit-githook.cjs');
const ES_WIN = process.platform === 'win32';

// El PATH sin ninguna carpeta que traiga gitleaks: así el runner ve "sin escáner".
const CLAVE_PATH = Object.keys(process.env).find((k) => k.toLowerCase() === 'path');
const PATH_SIN_GITLEAKS = String(process.env[CLAVE_PATH] || '')
  .split(path.delimiter)
  .filter((d) => d && !['gitleaks', 'gitleaks.exe'].some((x) => fs.existsSync(path.join(d, x))))
  .join(path.delimiter);
function entorno() {
  const env = { ...process.env };
  for (const k of Object.keys(env)) if (k.toLowerCase() === 'path' || k === 'NODE_OPTIONS') delete env[k];
  env.PATH = PATH_SIN_GITLEAKS;
  return env;
}

let n = 0;
const carpeta = (nombre = 'r') => {
  const d = path.join(TMP, `${nombre}${n++}`);
  fs.mkdirSync(d, { recursive: true });
  return d;
};
function g(cwd, args, o = {}) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', env: entorno(), timeout: 600000 });
  if (!o.puede && r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}${r.stdout}`);
  return { codigo: r.status, out: (r.stdout || '').trim(), err: r.stderr || '' };
}
function escribir(d, rel, texto) {
  const p = path.join(d, ...rel.split('/'));
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, texto);
}

// Lo instanciado del molde (hooks, githooks, estructura, cambios, settings) y una ficha con candado.
function archivosDelMolde() {
  const out = {};
  const recorrer = (de, a) => {
    for (const e of fs.readdirSync(de, { withFileTypes: true })) {
      if (e.isDirectory()) recorrer(path.join(de, e.name), `${a}/${e.name}`);
      else if (!e.name.endsWith('.test.cjs')) out[`${a}/${e.name}`] = fs.readFileSync(path.join(de, e.name), 'utf8');
    }
  };
  recorrer(path.join(MOLDE, 'hooks'), '.claude/hooks');
  recorrer(path.join(MOLDE, 'githooks'), '.githooks');
  for (const s of ['estructura.cjs', 'cambios.cjs']) out[`.claude/scripts/${s}`] = fs.readFileSync(path.join(MOLDE, 'scripts', s), 'utf8');
  out['.claude/settings.json'] = fs.readFileSync(path.join(MOLDE, 'settings.json'), 'utf8');
  return out;
}
const FICHA = [
  '---',
  'kit: 2.4.3',
  'nivel: estandar',
  'vars:',
  '  proyecto: px',
  'piezas:',
  '  candado: molde',
  'frenos:',
  '  opcionales: []',
  '  quitados: []',
  'sensible:',
  '  plata: no',
  'autorizado:',
  '  merge-a-main: con-gate-verde',
  '---',
  '',
].join('\n');

// Un repo con el molde (sin remoto), el director de "nz" y dos obreros (uno de nz y otro de "ot"), cada uno con su .kit-rol.
function proyecto() {
  const d = carpeta('p');
  g(d, ['init', '-q', '-b', 'main']);
  const archivos = { '.gitignore': fs.readFileSync(path.join(MOLDE, 'gitignore.snippet'), 'utf8'), 'a.txt': 'a\n', '.claude/kit.md': FICHA, ...archivosDelMolde() };
  for (const [rel, texto] of Object.entries(archivos)) escribir(d, rel, texto);
  g(d, ['add', '-f', '--', ...Object.keys(archivos)]);
  g(d, ['commit', '-q', '--no-verify', '-m', 'adopción del kit']);
  if (!ES_WIN) {
    for (const h of ['pre-commit', 'pre-merge-commit', 'pre-push']) g(d, ['update-index', '--chmod=+x', `.githooks/${h}`]);
    g(d, ['commit', '-q', '--no-verify', '-m', '+x']);
  }
  g(d, ['config', 'core.hooksPath', '.githooks']);
  const wt = (rama, rol) => {
    const w = path.join(carpeta('wt'), rama.replace(/\//g, '--'));
    g(d, ['worktree', 'add', '-q', '-b', rama, w]);
    if (!ES_WIN) for (const h of ['pre-commit', 'pre-merge-commit', 'pre-push']) fs.chmodSync(path.join(w, '.githooks', h), 0o755);
    fs.writeFileSync(path.join(w, '.kit-rol'), `${rol}\n`);
    return w;
  };
  return { d, dir: wt('modulo/nz', 'director'), obr: wt('modulo/nz--01', 'obrero'), ajeno: wt('modulo/ot--01', 'obrero') };
}
// Un commit de verdad (con los hooks) de un archivo nuevo: → { codigo, err }. Si no pasó, deja el índice como estaba.
function commitear(w, nombre) {
  escribir(w, nombre, 'x\n');
  g(w, ['add', '--', nombre]);
  const r = g(w, ['commit', '-q', '-m', 'c'], { puede: true });
  if (r.codigo !== 0) g(w, ['reset', '-q']);
  return r;
}

const P = proyecto();

test('rolEfectivo: de día, el de .kit-rol; con .kit-noche (propia o del director de su obrero) uno de día pasa a nocturno', () => {
  const o = (cwd) => ({ cwd, env: entorno() });
  for (const [w, rol] of [[P.d, 'humano'], [P.dir, 'director'], [P.obr, 'obrero'], [P.ajeno, 'obrero']]) {
    assert.equal(kg.rolEfectivo(w, o(w)), rol, w);
    assert.equal(kg.marcaDeNoche(w, o(w)), false);
  }
  fs.writeFileSync(path.join(P.dir, '.kit-noche'), 'desde 2026-11-02T22:00-03:00\n');
  try {
    assert.equal(kg.rolEfectivo(P.dir, o(P.dir)), 'nocturno');
    assert.equal(kg.rolEfectivo(P.obr, o(P.obr)), 'nocturno', 'el obrero de nz sigue al director');
    assert.equal(kg.rolEfectivo(P.ajeno, o(P.ajeno)), 'obrero', 'el de otro módulo, no');
    assert.equal(kg.rolEfectivo(P.d, o(P.d)), 'humano', 'el principal no es el director');
  } finally {
    fs.rmSync(path.join(P.dir, '.kit-noche'));
  }
  // un rol que ya no pasa queda como está; fuera de git, sin noche y sin tirar
  const suelta = carpeta('suelta');
  fs.writeFileSync(path.join(suelta, '.kit-rol'), 'actualizador\n');
  assert.equal(kg.rolEfectivo(suelta, o(suelta)), 'actualizador');
  assert.equal(kg.marcaDeNoche(suelta, o(suelta)), false);
});

test('pre-commit sin escáner: el obrero de día pasa en rojo; tras el "me voy" del director, no se commitea (rol nocturno); al volver, pasa', () => {
  let r = commitear(P.obr, 'dia.txt');
  assert.equal(r.codigo, 0, r.err);
  assert.match(r.err, /pasa por ser obrero\)/);
  fs.writeFileSync(path.join(P.dir, '.kit-noche'), '');
  try {
    r = commitear(P.obr, 'noche.txt');
    assert.equal(r.codigo, 1, r.err);
    assert.match(r.err, /con rol nocturno no se commitea sin escáner/);
    r = commitear(P.ajeno, 'otro.txt');
    assert.equal(r.codigo, 0, `el obrero de otro módulo sigue de día: ${r.err}`);
  } finally {
    fs.rmSync(path.join(P.dir, '.kit-noche'));
  }
  r = commitear(P.obr, 'volvi.txt');
  assert.equal(r.codigo, 0, r.err);
});
