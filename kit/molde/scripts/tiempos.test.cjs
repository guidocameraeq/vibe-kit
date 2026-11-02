'use strict';
// Pruebas de scripts/tiempos.cjs (SPEC-0 6.9): `tiempos` (primer y último commit, duración y sub-pasos desde git, el bloque entre
// marcas que no pisa el resto), `alarma` (solo los mensajes reales de Guido; más de 3 → la línea obligatoria) y `contador`
// (desvíos fuera de ## Toca y sub-pasos; nunca frena). Repos temporales con identidad y fechas fijas.
// Corren con: node --test kit/molde/scripts/tiempos.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-tiempos-'));
const GLOBAL = path.join(TMP, 'gitconfig-vacio');
fs.writeFileSync(GLOBAL, '[core]\n\tlongpaths = true\n');
Object.assign(process.env, {
  GIT_CONFIG_GLOBAL: GLOBAL,
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_AUTHOR_NAME: 'Prueba',
  GIT_AUTHOR_EMAIL: 'prueba@ejemplo.invalid',
  GIT_COMMITTER_NAME: 'Prueba',
  GIT_COMMITTER_EMAIL: 'prueba@ejemplo.invalid',
});
test.after(() => fs.rmSync(TMP, { recursive: true, force: true, maxRetries: 20, retryDelay: 500 }));

const SCRIPT = path.join(__dirname, 'tiempos.cjs');
const T = require('./tiempos.cjs');

let n = 0;
const git = (cwd, ...args) => {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  assert.equal(r.status, 0, `git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
};
function commit(cwd, archivos, mensaje, iso) {
  for (const [ruta, txt] of Object.entries(archivos)) {
    fs.mkdirSync(path.dirname(path.join(cwd, ruta)), { recursive: true });
    fs.writeFileSync(path.join(cwd, ruta), txt);
  }
  git(cwd, 'add', '-A');
  const r = spawnSync('git', ['commit', '-q', '-m', mensaje], { cwd, encoding: 'utf8', env: { ...process.env, GIT_AUTHOR_DATE: iso, GIT_COMMITTER_DATE: iso } });
  assert.equal(r.status, 0, r.stderr);
  return git(cwd, 'rev-parse', 'HEAD');
}
function correr(cwd, ...args) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], { cwd, encoding: 'utf8' });
  return { codigo: r.status, out: r.stdout, err: r.stderr };
}

const encargo = (id, x, partida, toca) => `# Encargo ${id} · ${x} · Probar
- Partida: rama modulo/${x}--${id} desde modulo/${x}@${partida} · 2026-11-01T09:00-03:00
- Spec: docs/modulos/${x}/SPEC.md:1-5
- Skill: obrero
- Modelo: sonnet · Esfuerzo: low · Por qué: prueba
- Riesgo: bajo · Por qué: prueba
- Apertura: director
- Suscripción: —
## Toca
${toca.map((t) => `- \`${t}\``).join('\n')}
## Alcance
- Hacer lo de la prueba.
## NO SE TOCA
- (nada)
## AUTORIZADO
- (nada)
## GATE
- \`node --test\`
`;

// Un repo con el módulo m1, su rama modulo/m1 y el obrero 07: tres commits (0, 30 y 65 min); el último se sale de ## Toca.
function repo() {
  const dir = path.join(TMP, `r${++n}`);
  fs.mkdirSync(dir);
  git(dir, 'init', '-q', '-b', 'main');
  commit(dir, { 'README.md': 'x\n' }, 'inicio', '2026-11-01T08:00:00+00:00');
  const base = commit(dir, { 'docs/modulos/m1/README.md': '# M1\n- Estado: EN OBRA\n' }, 'ficha', '2026-11-01T08:30:00+00:00');
  git(dir, 'checkout', '-q', '-b', 'modulo/m1');
  commit(dir, { 'docs/modulos/m1/bitacora/2026-11-01-encargo-07.md': encargo('07', 'm1', base.slice(0, 7), ['src/a/']) }, 'encargo 07', '2026-11-01T08:45:00+00:00');
  git(dir, 'checkout', '-q', '-b', 'modulo/m1--07');
  commit(dir, { 'src/a/x.js': '1\n' }, 'paso 1', '2026-11-01T10:00:00+00:00');
  commit(dir, { 'src/a/y.js': '2\n' }, 'paso 2', '2026-11-01T10:30:00+00:00');
  commit(dir, { 'src/zz/fuera.js': '3\n' }, 'paso 3', '2026-11-01T11:05:00+00:00');
  git(dir, 'checkout', '-q', 'main');
  return dir;
}

// ---------------------------------------------------------------- tiempos

test('tiempos: primer y último commit, duración y sub-pasos de cada encargo, desde git', () => {
  const dir = repo();
  const r = correr(dir, 'tiempos', 'm1');
  assert.equal(r.codigo, 0, r.err);
  assert.match(r.out, /^tiempos m1: 1 encargo\(s\) · 3 sub-paso\(s\) · 65 min · escrito docs\/modulos\/m1\/tiempos\.md/);
  const md = fs.readFileSync(path.join(dir, 'docs', 'modulos', 'm1', 'tiempos.md'), 'utf8');
  const primero = Number(git(dir, 'log', '--format=%ct', '--reverse', 'modulo/m1..modulo/m1--07').split('\n')[0]);
  assert.match(md, new RegExp(`\\| 07 \\| ${T.fechaHora(primero).replace(/[-:]/g, (c) => `\\${c}`)} \\| .* \\| 65 \\| 3 \\|`));
  assert.match(md, /^- Total: 1 encargo\(s\) · 3 sub-paso\(s\) · 65 min$/m);
  assert.deepEqual(T.totalGuardado(dir, 'm1'), { encargos: 1, subpasos: 3, minutos: 65 });
});

test('tiempos: lo que el director escribió fuera del bloque no se pisa, y correrlo dos veces da lo mismo', () => {
  const dir = repo();
  const f = path.join(dir, 'docs', 'modulos', 'm1', 'tiempos.md');
  fs.writeFileSync(f, '# Tiempos m1\n\nEstimé 2 h; salió más complejo por la base.\n');
  correr(dir, 'tiempos', 'm1');
  const una = fs.readFileSync(f, 'utf8');
  assert.match(una, /Estimé 2 h; salió más complejo por la base\./);
  correr(dir, 'tiempos', 'm1');
  assert.equal(fs.readFileSync(f, 'utf8'), una);
  // el director sigue escribiendo debajo del bloque
  fs.writeFileSync(f, `${una}\n## Lección\nPartir antes.\n`);
  correr(dir, 'tiempos', 'm1');
  assert.match(fs.readFileSync(f, 'utf8'), /## Lección\nPartir antes\./);
  assert.equal(fs.readFileSync(f, 'utf8').split('tiempos:inicio').length, 2, 'un solo bloque');
});

test('tiempos: una rama que ya no está conserva su renglón de la vez anterior', () => {
  const dir = repo();
  correr(dir, 'tiempos', 'm1');
  git(dir, 'branch', '-D', 'modulo/m1--07');
  const r = correr(dir, 'tiempos', 'm1');
  assert.equal(r.codigo, 0);
  assert.deepEqual(T.totalGuardado(dir, 'm1'), { encargos: 1, subpasos: 3, minutos: 65 });
});

test('tiempos: un encargo ya mergeado cuenta sus mismos sub-pasos (sin el commit del encargo del director)', () => {
  const dir = repo();
  git(dir, 'checkout', '-q', 'modulo/m1');
  git(dir, 'merge', '-q', '--no-ff', '-m', 'merge 07', 'modulo/m1--07');
  git(dir, 'checkout', '-q', 'main');
  const r = correr(dir, 'tiempos', 'm1', '--ver');
  assert.match(r.out, /^tiempos m1: 1 encargo\(s\) · 3 sub-paso\(s\) · 65 min/);
});

test('tiempos: --ver no escribe; un módulo sin carpeta, 1; sin nombre o con nombre feo, 2', () => {
  const dir = repo();
  const v = correr(dir, 'tiempos', 'm1', '--ver');
  assert.equal(v.codigo, 0);
  assert.equal(fs.existsSync(path.join(dir, 'docs', 'modulos', 'm1', 'tiempos.md')), false);
  const sin = correr(dir, 'tiempos', 'otro');
  assert.equal(sin.codigo, 1);
  assert.match(sin.out, /no hay docs\/modulos\/otro\//);
  assert.equal(correr(dir, 'tiempos').codigo, 2);
  assert.equal(correr(dir, 'tiempos', 'Mal Nombre').codigo, 2);
  assert.equal(correr(dir).codigo, 2);
  assert.match(correr(dir).err, /tiempos <x>/);
});

// ---------------------------------------------------------------- contador

test('contador: sub-pasos y el desvío (el commit que toca fuera de ## Toca); nunca frena', () => {
  const dir = repo();
  const r = correr(dir, 'contador', 'm1');
  assert.equal(r.codigo, 0);
  assert.match(r.out, /^contador m1: 1 encargo\(s\) · 3 sub-paso\(s\) · 1 desvío\(s\)/);
  assert.match(r.out, /07 · 3 sub-paso\(s\) · 1 desvío\(s\)/);
  assert.match(r.out, /fuera de ## Toca: src\/zz\/fuera\.js/);
});

test('contador: sin desvíos da 0 desvíos; sin encargo commiteado, NO VERIFICADO y salida 0', () => {
  const dir = repo();
  git(dir, 'checkout', '-q', 'modulo/m1--07');
  git(dir, 'reset', '-q', '--hard', 'HEAD~1'); // saca el commit de afuera
  git(dir, 'checkout', '-q', 'main');
  assert.match(correr(dir, 'contador', 'm1').out, /2 sub-paso\(s\) · 0 desvío\(s\)/);
  // otra rama de obrero sin encargo
  git(dir, 'branch', 'modulo/m1--09', 'modulo/m1');
  git(dir, 'checkout', '-q', 'modulo/m1--09');
  commit(dir, { 'cualquier.txt': 'a\n' }, 'suelto', '2026-11-01T12:00:00+00:00');
  git(dir, 'checkout', '-q', 'main');
  const r = correr(dir, 'contador', 'm1');
  assert.equal(r.codigo, 0);
  assert.match(r.out, /09 · 1 sub-paso\(s\) · desvíos NO VERIFICADO/);
  assert.match(r.out, /1 encargo\(s\) sin juzgar/);
});

test('contador: módulo sin encargos → ceros y salida 0; mal llamado → 2', () => {
  const dir = repo();
  const r = correr(dir, 'contador', 'nada');
  assert.equal(r.codigo, 0);
  assert.match(r.out, /contador nada: 0 encargo\(s\) · 0 sub-paso\(s\) · 0 desvío\(s\)/);
  assert.equal(correr(dir, 'contador').codigo, 2);
});

// ---------------------------------------------------------------- alarma

const usuario = (content, extra = {}) => JSON.stringify({ type: 'user', message: { role: 'user', content }, ...extra });
function transcript(nombre, lineas) {
  const f = path.join(TMP, nombre);
  fs.writeFileSync(f, `${lineas.join('\n')}\n`);
  return f;
}

test('alarma: cuenta solo los mensajes reales de Guido (sin tool_result, hooks, comandos ni subagentes)', () => {
  const lineas = [
    usuario('hacé esto'),
    usuario([{ type: 'text', text: 'y también esto' }]),
    usuario([{ type: 'tool_result', tool_use_id: 'a', content: 'ok' }]),
    usuario('<system-reminder>del hook</system-reminder>'),
    usuario('<command-name>/estado</command-name>'),
    usuario('texto de skill', { isMeta: true }),
    usuario('de un subagente', { isSidechain: true }),
    usuario('[Request interrupted by user]'),
    usuario('<local-command-stdout>algo</local-command-stdout>'),
    JSON.stringify({ type: 'assistant', message: { role: 'assistant', content: 'hola' } }),
    'esto no es json',
    usuario(''),
  ];
  assert.equal(T.contarIntervenciones(lineas.join('\n')), 2);
});

test('alarma: 3 o menos → salida 0; más de 3 → la línea obligatoria y salida 1', () => {
  const tres = transcript('tres.jsonl', ['a', 'b', 'c'].map((t) => usuario(t)));
  const ok = correr(TMP, 'alarma', '--transcript', tres);
  assert.equal(ok.codigo, 0);
  assert.match(ok.out, /3 intervención\(es\)/);
  assert.doesNotMatch(ok.out, /ALARMA/);
  const cuatro = transcript('cuatro.jsonl', ['a', 'b', 'c', 'd'].map((t) => usuario(t)));
  const mal = correr(TMP, 'alarma', '--transcript', cuatro);
  assert.equal(mal.codigo, 1);
  assert.equal(mal.out.trim(), 'ALARMA · 4 intervenciones de Guido en esta pestaña: anotalo en las notas del CIERRE');
});

test('alarma: sin --transcript toma el .jsonl más nuevo de la carpeta de transcripts; sin ninguno, NO VERIFICADO (0)', () => {
  const home = path.join(TMP, 'home');
  const cwd = path.join(TMP, 'una carpeta (1)');
  fs.mkdirSync(cwd, { recursive: true });
  const dir = T.carpetaTranscripts(cwd, home);
  const r0 = spawnSync(process.execPath, [SCRIPT, 'alarma'], { cwd, encoding: 'utf8', env: { ...process.env, HOME: home, USERPROFILE: home, CLAUDE_CONFIG_DIR: path.join(home, '.claude') } });
  assert.equal(r0.status, 0);
  assert.match(r0.stdout, /alarma: NO VERIFICADO/);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'vieja.jsonl'), `${usuario('a')}\n`);
  const nueva = path.join(dir, 'nueva.jsonl');
  fs.writeFileSync(nueva, ['a', 'b', 'c', 'd', 'e'].map((t) => usuario(t)).join('\n'));
  fs.utimesSync(path.join(dir, 'vieja.jsonl'), new Date(Date.now() - 60000), new Date(Date.now() - 60000));
  assert.equal(T.transcriptMasNuevo(cwd, home), nueva);
  const r = spawnSync(process.execPath, [SCRIPT, 'alarma'], { cwd, encoding: 'utf8', env: { ...process.env, HOME: home, USERPROFILE: home, CLAUDE_CONFIG_DIR: path.join(home, '.claude') } });
  assert.equal(r.status, 1);
  assert.match(r.stdout, /ALARMA · 5 intervenciones/);
});

test('alarma: --transcript sin ruta es mal llamado (2)', () => {
  assert.equal(correr(TMP, 'alarma', '--transcript').codigo, 2);
  assert.equal(correr(TMP, 'alarma', 'x').codigo, 2);
});
