'use strict';
// Pruebas de scripts/estado.cjs (SPEC-0 5.3; RT1-13): la vista corta del proyecto y la del módulo. El test que importa compara cada
// número de la salida (% de avance, encargos en obra, sub-pasos, minutos, "desde", "podés cerrar") con el que se calcula aparte
// desde la ficha, tiempos.md y git de un repo temporal. También: sin tareas el % es "—", el uso con y sin contexto.cjs, las líneas
// propias, las esperas vencidas del TODO y el aviso del resumen de las 18 h.
// Corren con: node --test kit/molde/scripts/estado.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-estado-'));
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

const SCRIPT = path.join(__dirname, 'estado.cjs');
const TIEMPOS = path.join(__dirname, 'tiempos.cjs');
const S = require('./estado.cjs');

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
function estado(cwd, argv, opciones = {}) {
  let out = '';
  let err = '';
  const codigo = S.main(opciones.dueno ? argv : ['--director', ...argv], { cwd, salida: (s) => (out += s), error: (s) => (err += s), contexto: path.join(TMP, 'no-existe.cjs'), ...opciones });
  return { codigo, out, err };
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

const FICHA = `# Módulo uno
- Estado: EN OBRA
- director: sí
- rama: modulo/m1

## Qué es
Un módulo de prueba.

## Fase y próximo paso
Construcción; seguir con el encargo 08.

## Tareas
- [x] Primera
- [x] Segunda
- [x] Tercera
- [ ] Cuarta
- [ ] Quinta

## Decisiones cerradas
- Una.

## Pendientes y "te espera"
- (nada)

## Parado
- (nada)

## Sesiones vivas
- obrero-m1--07 · — · .claude/worktrees/m1--07 · modulo/m1--07 · bypass
- obrero-m1--08 · — · .claude/worktrees/m1--08 · modulo/m1--08 · bypass
`;
const TE_ESPERA = '- Elegir el nombre del botón (decide Guido)';
const PARADO = '- Falta la firma de otro director';

// m1 con director: ficha en main (la línea de "te espera" entra el 2026-10-31 y la de "parado" el 2026-11-01), obrero 07 mergeado
// (3 pasos: 0, 30 y 65 min) y obrero 08 en obra (1 paso). Un módulo m2 COMPLETO y un m3 sin tareas.
function mundo() {
  const dir = path.join(TMP, `r${++n}`);
  fs.mkdirSync(dir);
  git(dir, 'init', '-q', '-b', 'main');
  commit(dir, { 'README.md': 'x\n' }, 'inicio', '2026-10-29T08:00:00+00:00');
  commit(dir, { 'docs/modulos/m1/README.md': FICHA, 'docs/modulos/m2/README.md': '# Dos\n- Estado: COMPLETO 2026-10-20\n- director: no\n', 'docs/modulos/m3/README.md': '# Tres\n- Estado: EN OBRA\n- director: no\n\n## Pendientes y "te espera"\n- (nada)\n' }, 'fichas', '2026-10-30T10:00:00+00:00');
  commit(dir, { 'docs/modulos/m1/README.md': FICHA.replace('## Pendientes y "te espera"\n- (nada)', `## Pendientes y "te espera"\n${TE_ESPERA}`) }, 'te espera', '2026-10-31T10:00:00+00:00');
  const base = commit(dir, { 'docs/modulos/m1/README.md': FICHA.replace('## Pendientes y "te espera"\n- (nada)', `## Pendientes y "te espera"\n${TE_ESPERA}`).replace('## Parado\n- (nada)', `## Parado\n${PARADO}`) }, 'parado', '2026-11-01T07:00:00+00:00');
  git(dir, 'checkout', '-q', '-b', 'modulo/m1');
  commit(dir, { 'docs/modulos/m1/bitacora/2026-11-01-encargo-07.md': encargo('07', 'm1', base.slice(0, 7), ['src/a/']) }, 'encargo 07', '2026-11-01T08:45:00+00:00');
  commit(dir, { 'docs/modulos/m1/bitacora/2026-11-01-encargo-08.md': encargo('08', 'm1', base.slice(0, 7), ['src/b/']) }, 'encargo 08', '2026-11-01T08:50:00+00:00');
  git(dir, 'checkout', '-q', '-b', 'modulo/m1--07');
  commit(dir, { 'src/a/x.js': '1\n' }, 'paso 1', '2026-11-01T10:00:00+00:00');
  commit(dir, { 'src/a/y.js': '2\n' }, 'paso 2', '2026-11-01T10:30:00+00:00');
  commit(dir, { 'src/a/z.js': '3\n' }, 'paso 3', '2026-11-01T11:05:00+00:00');
  git(dir, 'checkout', '-q', 'modulo/m1');
  git(dir, 'checkout', '-q', '-b', 'modulo/m1--08');
  commit(dir, { 'src/b/q.js': '4\n' }, 'paso 4', '2026-11-01T12:00:00+00:00');
  git(dir, 'checkout', '-q', 'modulo/m1');
  git(dir, 'merge', '-q', '--no-ff', '-m', 'merge 07', 'modulo/m1--07');
  git(dir, 'checkout', '-q', 'main');
  return dir;
}

// Lo que un cálculo aparte (regex sobre la ficha y git crudo, sin las funciones del script) dice de m1.
function esperado(dir) {
  const ficha = fs.readFileSync(path.join(dir, 'docs', 'modulos', 'm1', 'README.md'), 'utf8');
  const tareasLineas = ficha.split('\n').filter((l) => /^- \[[ x]\] /.test(l));
  const hechas = tareasLineas.filter((l) => l.startsWith('- [x]')).length;
  const pasos = git(dir, 'log', '--all', '--no-merges', '--format=%ct %s').split('\n').filter((l) => / paso \d$/.test(l)).map((l) => ({ t: Number(l.split(' ')[0]), id: l.endsWith('4') ? '08' : '07' }));
  const de07 = pasos.filter((p) => p.id === '07');
  const min07 = Math.round((Math.max(...de07.map((p) => p.t)) - Math.min(...de07.map((p) => p.t))) / 60);
  return { total: tareasLineas.length, hechas, pct: Math.round((100 * hechas) / tareasLineas.length), subpasos: pasos.length, min07, sub07: de07.length };
}

// ---------------------------------------------------------------- 8c c1: el tramo cerrado y el próximo paso

test('8c c1: con `- Tramo: <N> cerrado <fecha>` y `- Próximo paso:` en la ficha de modulo/m1, la línea suma "tramo N cerrado" y "próximo: …"', () => {
  const dir = mundo();
  const e = esperado(dir);
  git(dir, 'checkout', '-q', 'modulo/m1');
  const ficha = fs.readFileSync(path.join(dir, 'docs', 'modulos', 'm1', 'README.md'), 'utf8')
    .replace('- rama: modulo/m1\n', '- rama: modulo/m1\n- Próximo paso: el encargo 08\n- Tramo: 1 cerrado 2026-11-01\n- Cierre de tramo: cada encargo\n');
  commit(dir, { 'docs/modulos/m1/README.md': ficha }, 'cierre de tramo 1', '2026-11-01T13:00:00+00:00');
  git(dir, 'checkout', '-q', 'main');
  const r = estado(dir, []);
  assert.equal(r.codigo, 0, r.err);
  const linea = r.out.split('\n').find((l) => l.startsWith('- m1 · '));
  assert.equal(linea, `- m1 · EN OBRA · tramo 1 cerrado · ${e.hechas} de ${e.total} tareas (${e.pct}%) · 1 encargo(s) en obra · ${e.subpasos} sub-paso(s) · podés cerrar: obrero-m1--07 · próximo: el encargo 08`);
  // sin Tramo: ni Próximo paso: (m3), la línea de antes
  assert.ok(r.out.includes('- m3 · EN OBRA · avance — · podés cerrar: nadie\n'), r.out);
});

// ---------------------------------------------------------------- RT1-13: cada número, contra el cálculo aparte

test('estado (corta): cada número coincide con el calculado aparte de la ficha y git', () => {
  const dir = mundo();
  const e = esperado(dir);
  assert.deepEqual({ t: e.total, h: e.hechas, p: e.pct, s: e.subpasos }, { t: 5, h: 3, p: 60, s: 4 }, 'el cálculo aparte da lo que arma el fixture');
  const r = estado(dir, []);
  assert.equal(r.codigo, 0, r.err);
  const linea = r.out.split('\n').find((l) => l.startsWith('- m1 · '));
  assert.ok(linea, r.out);
  assert.equal(linea, `- m1 · EN OBRA · ${e.hechas} de ${e.total} tareas (${e.pct}%) · 1 encargo(s) en obra · ${e.subpasos} sub-paso(s) · podés cerrar: obrero-m1--07`);
  // el módulo COMPLETO no aparece; el activo sin tareas muestra "avance —", jamás un %
  assert.doesNotMatch(r.out, /m2 ·/);
  assert.ok(r.out.includes('- m3 · EN OBRA · avance — · podés cerrar: nadie'), r.out);
  assert.doesNotMatch(r.out.split('\n').find((l) => l.startsWith('- m3')), /%/);
});

test('estado (corta): "te espera" arriba con "desde" del commit en que entró el renglón; lo parado, también', () => {
  const dir = mundo();
  const r = estado(dir, []);
  const lineas = r.out.split('\n');
  assert.equal(lineas[0], 'TE ESPERA');
  assert.equal(lineas[1], `- [m1] Elegir el nombre del botón (decide Guido) · desde ${git(dir, 'log', '-1', '--format=%cs', '--grep=^te espera$')}`);
  assert.match(lineas[1], /desde 2026-10-31$/);
  assert.ok(lineas.includes('- [m1] Falta la firma de otro director · desde 2026-11-01'), r.out);
  assert.ok(lineas.indexOf('ESPERAS') > lineas.indexOf('MÓDULOS'));
});

// t12c (D8r.2): con .kit-noche en el checkout, "es de noche" arriba de TE ESPERA (en las dos vistas); sin ella, nada.
test('noche: con .kit-noche en el checkout, "es de noche: el director trabaja solo" arriba de TE ESPERA', () => {
  const dir = mundo();
  assert.doesNotMatch(estado(dir, []).out, /es de noche/);
  fs.writeFileSync(path.join(dir, '.kit-noche'), 'hasta: 07:00\n');
  const L = estado(dir, []).out.split('\n');
  assert.equal(L[0], 'es de noche: el director trabaja solo');
  assert.equal(L[L.indexOf('TE ESPERA') - 2], 'es de noche: el director trabaja solo');
  const M = estado(dir, ['m1']).out.split('\n');
  assert.equal(M[M.indexOf('TE ESPERA') - 2], 'es de noche: el director trabaja solo');
});

test('estado <x>: encargos, minutos y sub-pasos de git; y el total de tiempos.md, que escribió tiempos.cjs, coincide', () => {
  const dir = mundo();
  const e = esperado(dir);
  const t = spawnSync(process.execPath, [TIEMPOS, 'tiempos', 'm1'], { cwd: dir, encoding: 'utf8' });
  assert.equal(t.status, 0, t.stderr);
  const md = fs.readFileSync(path.join(dir, 'docs', 'modulos', 'm1', 'tiempos.md'), 'utf8');
  const totalMd = /- Total: (\d+) encargo\(s\) · (\d+) sub-paso\(s\) · (\d+) min/.exec(md);
  assert.deepEqual(totalMd.slice(1).map(Number), [2, e.subpasos, e.min07 + 0]);
  const r = estado(dir, ['m1']);
  assert.equal(r.codigo, 0, r.err);
  const L = r.out.split('\n');
  assert.equal(L[0], 'm1 · EN OBRA · modulo/m1');
  assert.ok(L.includes(`avance: ${e.hechas} de ${e.total} tareas (${e.pct}%)`), r.out);
  assert.ok(L.includes('fase: Construcción; seguir con el encargo 08.'));
  assert.ok(L.includes(`ENCARGOS: 2 · 1 en obra · ${e.subpasos} sub-paso(s)`), r.out);
  assert.ok(L.includes(`- 07 · mergeado · ${e.sub07} sub-paso(s) · ${e.min07} min · 0 desvío(s)`), r.out);
  assert.ok(L.includes('- 08 · en obra · 1 sub-paso(s) · 0 min · 0 desvío(s)'), r.out);
  assert.ok(L.includes(`tiempos.md: 2 encargo(s) · ${e.subpasos} sub-paso(s) · ${e.min07} min`), r.out);
  assert.ok(L.includes('podés cerrar: obrero-m1--07'));
});

test('estado <x>: sin tiempos.md lo dice (nada inventado); un módulo que no existe → 1; argumentos feos → 2', () => {
  const dir = mundo();
  assert.match(estado(dir, ['m1']).out, /tiempos\.md: — \(sin tiempos\.md todavía/);
  const no = estado(dir, ['zzz']);
  assert.equal(no.codigo, 1);
  assert.match(no.out, /no hay ficha de "zzz".*m1, m2, m3/);
  assert.equal(estado(dir, ['Mal Nombre']).codigo, 2);
  assert.equal(estado(dir, ['--algo']).codigo, 2);
  assert.equal(estado(dir, ['a', 'b']).codigo, 2);
});

// ---------------------------------------------------------------- uso, líneas propias, esperas, resumen de las 18 h

test('uso: sin contexto.cjs → NO VERIFICADO; con él, su primera línea tal cual', () => {
  const dir = mundo();
  assert.match(estado(dir, []).out, /^uso: NO VERIFICADO \(falta contexto\.cjs\)$/m);
  const falso = path.join(TMP, 'contexto-falso.cjs');
  fs.writeFileSync(falso, "console.log('contexto: 120k de 1000k (12%) · faltan 880k · opus-4');\nconsole.log('otra cosa');\n");
  const r = estado(dir, [], { contexto: falso });
  assert.match(r.out, /^uso: contexto: 120k de 1000k \(12%\) · faltan 880k · opus-4$/m);
  assert.doesNotMatch(r.out, /otra cosa/);
  const nv = path.join(TMP, 'contexto-nv.cjs');
  fs.writeFileSync(nv, "console.log('contexto: NO VERIFICADO · sin transcript');\n");
  assert.match(estado(dir, [], { contexto: nv }).out, /^uso: contexto: NO VERIFICADO · sin transcript$/m);
  const roto = path.join(TMP, 'contexto-roto.cjs');
  fs.writeFileSync(roto, 'process.exit(3);\n');
  assert.match(estado(dir, [], { contexto: roto }).out, /^uso: NO VERIFICADO \(contexto\.cjs no dio su línea\)$/m);
});

test('líneas propias: las de .claude/estado-lineas.md se suman tal cual (sin vacíos ni comentarios)', () => {
  const dir = mundo();
  fs.mkdirSync(path.join(dir, '.claude'));
  fs.writeFileSync(path.join(dir, '.claude', 'estado-lineas.md'), '# lo que quiere ver\n\nSaldo de la factura: ver con el contador\n<!-- nota -->\nBackup: lunes\n');
  const r = estado(dir, []);
  const L = r.out.split('\n');
  assert.ok(L.includes('Saldo de la factura: ver con el contador'));
  assert.ok(L.includes('Backup: lunes'));
  assert.doesNotMatch(r.out, /lo que quiere ver|nota -->/);
  assert.ok(L.indexOf('Backup: lunes') > L.findIndex((l) => l.startsWith('uso:')), 'después del uso');
  assert.doesNotMatch(estado(mundo(), []).out, /Backup/);
});

test('esperas: un "espera hasta:" vencido del TODO sale; uno futuro, no', () => {
  const dir = mundo();
  fs.mkdirSync(path.join(dir, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'docs', 'TODO.md'), '# TODO\n\n- [ ] Contestar al proveedor\n  espera hasta: 2026-10-01\n- [ ] Revisar licencia\n  espera hasta: 2999-01-01\n- [x] Hecho\n  espera hasta: 2020-01-01\n');
  const r = estado(dir, [], { ahora: new Date(Date.UTC(2026, 10, 1, 20, 0)) });
  assert.match(r.out, /- TODO: Contestar al proveedor · espera vencida \(hasta 2026-10-01\)/);
  assert.doesNotMatch(r.out, /Revisar licencia|Hecho/);
});

test('resumen del día: a partir de las 18 h avisa qué comando correr; antes, no; con el resumen hecho, no', () => {
  const dir = mundo();
  const temprano = estado(dir, [], { ahora: new Date(2026, 10, 2, 17, 59) });
  assert.doesNotMatch(temprano.out, /resumen del día: falta/);
  const tarde = estado(dir, [], { ahora: new Date(2026, 10, 2, 19, 5) });
  assert.match(tarde.out, /resumen del día: falta \(son las 19:05, ≥ 18 h\) — corré: .*$/m);
  // m1 es el único con director activo: el comando lleva su nombre
  assert.match(tarde.out, /node \.claude\/scripts\/resumen\.cjs m1/);
  const bit = path.join(dir, 'docs', 'modulos', 'm1', 'bitacora');
  fs.mkdirSync(bit, { recursive: true });
  fs.writeFileSync(path.join(bit, '2026-11-02-resumen.md'), '# hecho\n');
  assert.doesNotMatch(estado(dir, [], { ahora: new Date(2026, 10, 2, 19, 5) }).out, /resumen del día: falta/);
});

test('resumen del día sin módulos con director: la marca de "ya mostrado" lo apaga', () => {
  const dir = mundo();
  git(dir, 'rm', '-q', '-r', 'docs/modulos/m1');
  fs.rmSync(path.join(dir, 'docs', 'modulos', 'm1'), { recursive: true, force: true });
  const ahora = new Date(2026, 10, 2, 20, 0);
  assert.match(estado(dir, [], { ahora }).out, /corré: node \.claude\/scripts\/resumen\.cjs$/m);
  fs.writeFileSync(path.join(dir, '.git', 'kit-resumen-del-dia'), '2026-11-02\n');
  assert.doesNotMatch(estado(dir, [], { ahora }).out, /resumen del día: falta/);
});

// D8r.4 (la suite de la rc.5, a las 22 h): después de las 18 h, resumenPendiente pide resumen.cjs, que pide estado.cjs; por la línea
// de comandos main() corría antes del module.exports y resumen veía un estado vacío ("estado roto: S.papeles is not a function").
test('por la línea de comandos, después de las 18 h (el resumen del día): anda y sale 0', () => {
  const dir = mundo();
  const reloj = path.join(TMP, 'reloj-20h.cjs');
  fs.writeFileSync(reloj, [
    'const D = Date; const T = new D(2026, 10, 2, 20, 0).getTime();',
    'global.Date = class extends D { constructor(...a) { if (a.length) super(...a); else super(T); } static now() { return T; } };',
    '',
  ].join('\n'));
  const r = spawnSync(process.execPath, ['--require', reloj, SCRIPT, '--director'], { cwd: dir, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.doesNotMatch(r.stderr, /estado roto/);
  assert.match(r.stdout, /resumen\.cjs/, 'a las 20 h pide el resumen del día');
});

test('por la línea de comandos: anda, sale 0 y no pregunta', () => {
  const dir = mundo();
  const r = spawnSync(process.execPath, [SCRIPT, '--director'], { cwd: dir, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^TE ESPERA/);
  const d = spawnSync(process.execPath, [SCRIPT], { cwd: dir, encoding: 'utf8' });
  assert.equal(d.status, 0, d.stderr);
  assert.match(d.stdout, /^TE NECESITO/);
  assert.equal(spawnSync(process.execPath, [SCRIPT, '--x'], { cwd: dir, encoding: 'utf8' }).status, 2);
});

// ---------------------------------------------------------------- B2 (SPEC-paquete-8d): /estado del dueño

const dueno = (dir, argv = [], o = {}) => estado(dir, argv, { dueno: true, ...o });
const SECC = ['TE NECESITO', 'EL PLAN', 'LO QUE SE HIZO', 'LO QUE FALTA'];
function cuatroEnOrden(out) {
  const ls = out.split('\n');
  const k = SECC.map((s) => ls.indexOf(s));
  assert.ok(k.every((i) => i >= 0), `faltan secciones:\n${out}`);
  for (let i = 1; i < k.length; i++) assert.ok(k[i] > k[i - 1], `fuera de orden:\n${out}`);
  // nada que el dueño no tenga que leer: SHAs, comandos, rojo/verde
  assert.doesNotMatch(out, /@[0-9a-f]{7}/);
  assert.doesNotMatch(out, /node \.claude/);
  assert.doesNotMatch(out, /\b(rojo|roja|verde)\b/i);
}

test('B2: un repo vacío tiene las cuatro secciones, cada una con "nada"', () => {
  const dir = path.join(TMP, `r${++n}`);
  fs.mkdirSync(dir);
  git(dir, 'init', '-q', '-b', 'main');
  commit(dir, { 'README.md': 'x\n' }, 'inicio', '2026-10-29T08:00:00+00:00');
  const r = dueno(dir);
  assert.equal(r.codigo, 0, r.err);
  cuatroEnOrden(r.out);
  assert.equal(r.out.split('\n').filter((l) => l === '- nada').length, 4, r.out);
});

test('B2: un módulo de lista con tramos: el plan con %, lo que falta; con dos encargos cerrados, "no sé todavía"; un cambio propuesto en TE NECESITO', () => {
  const dir = mundo();
  const conTramos = FICHA.replace('## Tareas\n- [x] Primera\n- [x] Segunda\n- [x] Tercera\n- [ ] Cuarta\n- [ ] Quinta', '## Tareas\n### Tramo 1\n- [x] Primera\n- [x] Segunda\n### Tramo 2\n- [x] Tercera\n- [ ] Cuarta\n- [ ] Quinta').replace('## Pendientes y "te espera"\n- (nada)', `## Pendientes y "te espera"\n${TE_ESPERA}`);
  assert.notEqual(conTramos, FICHA);
  commit(dir, { 'docs/modulos/m1/README.md': conTramos }, 'tramos', '2026-11-02T08:00:00+00:00');
  // el 07 cerrado en modulo/m1 (su evidencia, sin PARADA); la ficha con tramos también ahí (la ficha se lee de su rama)
  git(dir, 'checkout', '-q', 'modulo/m1');
  commit(dir, { 'docs/modulos/m1/README.md': conTramos }, 'tramos', '2026-11-02T08:00:00+00:00');
  commit(dir, { 'docs/modulos/m1/bitacora/2026-11-01-evidencia-07.md': '# Evidencia 07\nok\n' }, 'cierre 07', '2026-11-01T11:10:00+00:00');
  git(dir, 'checkout', '-q', 'main');
  const C = require('../hooks/lib/cambios.cjs');
  commit(dir, { '.claude/cambios/2026-11-02-quitar-stash.md': C.armar({ clase: '3-barrera', toca: ['deny:Bash(git stash:*)'], cicatriz: 'x', chico: 'no', urgente: 'no', cuerpo: '## Regla\nno guardar con stash\n' }) }, 'propuesto', '2026-11-02T09:00:00+00:00');
  const r = dueno(dir, [], { ahora: new Date(Date.UTC(2026, 10, 1, 20, 0)) });
  assert.equal(r.codigo, 0, r.err);
  cuatroEnOrden(r.out);
  const sec = (s) => { const ls = r.out.split('\n'); const i = ls.indexOf(s); const j = ls.findIndex((l, k) => k > i && l === ''); return ls.slice(i + 1, j < 0 ? undefined : j); };
  assert.ok(sec('TE NECESITO').some((l) => /no guardar con stash/.test(l) && /un clic tuyo/.test(l)), r.out);
  assert.ok(sec('TE NECESITO').some((l) => /Elegir el nombre del botón/.test(l)), r.out);
  const plan = sec('EL PLAN').join('\n');
  assert.match(plan, /m1: en el tramo 2 · 1 de 2 tramos cerrados · el plan va 60% · el tramo 33%/);
  assert.match(plan, /falta: no sé todavía/);
  assert.ok(sec('LO QUE FALTA').some((l) => /Cuarta · no sé todavía/.test(l)), r.out);
  assert.ok(sec('LO QUE SE HIZO').some((l) => /m1: Probar · 65 min/.test(l)), r.out);
  // la vista del módulo, igual de fija
  const m = dueno(dir, ['m1'], { ahora: new Date(Date.UTC(2026, 10, 1, 20, 0)) });
  cuatroEnOrden(m.out);
});

test('B2: un plan cola dice "es una cola" y no inventa un %; con tres encargos cerrados estima con la mediana', () => {
  const dir = mundo();
  commit(dir, { 'docs/modulos/m1/README.md': FICHA.replace('- rama: modulo/m1', '- rama: modulo/m1\n- Plan: cola') }, 'cola', '2026-11-02T08:00:00+00:00');
  git(dir, 'checkout', '-q', 'modulo/m1');
  commit(dir, { 'docs/modulos/m1/README.md': FICHA.replace('- rama: modulo/m1', '- rama: modulo/m1\n- Plan: cola') }, 'cola', '2026-11-02T08:00:00+00:00');
  commit(dir, { 'docs/modulos/m1/bitacora/2026-11-01-evidencia-07.md': 'ok\n' }, 'cierre 07', '2026-11-02T08:01:00+00:00');
  git(dir, 'checkout', '-q', 'main');
  const r = dueno(dir, ['m1']);
  cuatroEnOrden(r.out);
  assert.match(r.out, /m1: es una cola: \d+ hecho\(s\), 2 abierto\(s\)/);
  assert.doesNotMatch(r.out.split('EL PLAN')[1].split('LO QUE SE HIZO')[0], /%/);
  // tres cerrados más con 10, 20 y 60 min en tiempos.md (ramas ya borradas), y el 07 (65 min): la mediana de los cuatro es 40
  const tiempos = `# Tiempos\n\n${require('./tiempos.cjs').MARCA_ABRE}\n| Encargo | Primer commit | Último commit | Duración (min) | Sub-pasos |\n|---|---|---|---|---|\n| 01 | 2026-11-01 08:00 | 2026-11-01 08:10 | 10 | 1 |\n| 02 | 2026-11-01 09:00 | 2026-11-01 09:20 | 20 | 1 |\n| 03 | 2026-11-01 10:00 | 2026-11-01 11:00 | 60 | 1 |\n\n- Total: 3 encargo(s) · 3 sub-paso(s) · 90 min\n${require('./tiempos.cjs').MARCA_CIERRA}\n`;
  git(dir, 'checkout', '-q', 'modulo/m1');
  const ev = {};
  for (const id of ['01', '02', '03']) {
    ev[`docs/modulos/m1/bitacora/2026-11-01-encargo-${id}.md`] = encargo(id, 'm1', 'abc1234', ['src/']);
    ev[`docs/modulos/m1/bitacora/2026-11-01-evidencia-${id}.md`] = 'ok\n';
  }
  commit(dir, { ...ev, 'docs/modulos/m1/README.md': FICHA }, 'tres cerrados', '2026-11-02T09:00:00+00:00');
  git(dir, 'checkout', '-q', 'main');
  fs.writeFileSync(path.join(dir, 'docs', 'modulos', 'm1', 'tiempos.md'), tiempos);
  const e = dueno(dir, ['m1']);
  assert.match(e.out, /Cuarta · ~40 min/, e.out);
  assert.match(e.out, /falta: ~1,5 h/, e.out);
});

// ---------------------------------------------------------------- 8e (la rc.8): G5 y c20

test('8e G5: a la mañana, un módulo que la noche dejó COMPLETO e integrado sale en LO QUE SE HIZO (no en EL PLAN ni en LO QUE FALTA)', () => {
  const dir = mundo();
  const completa = FICHA.replace('- Estado: EN OBRA', '- Estado: COMPLETO 2026-11-01');
  git(dir, 'checkout', '-q', 'modulo/m1');
  commit(dir, { 'docs/modulos/m1/README.md': completa, 'docs/modulos/m1/bitacora/2026-11-01-evidencia-07.md': '# Evidencia 07\nok\n' }, 'cierre 07 y COMPLETO', '2026-11-01T11:10:00+00:00');
  git(dir, 'checkout', '-q', 'main');
  git(dir, 'merge', '-q', '--no-ff', '-m', 'integrar: módulo m1', 'modulo/m1');
  const r = dueno(dir, [], { ahora: new Date(Date.UTC(2026, 10, 1, 20, 0)) });
  assert.equal(r.codigo, 0, r.err);
  cuatroEnOrden(r.out);
  const sec = (s) => { const ls = r.out.split('\n'); const i = ls.indexOf(s); const j = ls.findIndex((l, k) => k > i && l === ''); return ls.slice(i + 1, j < 0 ? undefined : j); };
  assert.ok(sec('LO QUE SE HIZO').some((l) => /m1: Probar · 65 min/.test(l)), r.out);
  assert.ok(!sec('EL PLAN').some((l) => /m1:/.test(l)), r.out);
  assert.ok(!sec('LO QUE FALTA').some((l) => /m1:/.test(l)), r.out);
  // dos días después ya no es "lo que se hizo"
  const viejo = dueno(dir, [], { ahora: new Date(Date.UTC(2026, 10, 3, 20, 0)) });
  assert.ok(!viejo.out.split('LO QUE SE HIZO')[1].split('LO QUE FALTA')[0].includes('m1:'), viejo.out);
});

test('8e c20: parado en la rama de un obrero del módulo, la ficha es la del disco (lo que él tildó), no la punta de modulo/<x>', () => {
  const dir = mundo();
  git(dir, 'checkout', '-q', 'modulo/m1--08');
  const ruta = path.join(dir, 'docs', 'modulos', 'm1', 'README.md');
  fs.writeFileSync(ruta, fs.readFileSync(ruta, 'utf8').replace('- [ ] Cuarta', '- [x] Cuarta'));
  const m = S.fichas(dir).find((f) => f.x === 'm1');
  assert.equal(S.tareas(m.ficha).hechas, 4, 'desde el obrero manda el disco');
  git(dir, 'checkout', '-q', '--', 'docs/modulos/m1/README.md');
  // desde main, como siempre: manda la rama del módulo
  git(dir, 'checkout', '-q', 'modulo/m1');
  commit(dir, { 'docs/modulos/m1/README.md': FICHA.replace('- [ ] Cuarta', '- [x] Cuarta').replace('- [ ] Quinta', '- [x] Quinta') }, 'dos más', '2026-11-02T08:00:00+00:00');
  git(dir, 'checkout', '-q', 'main');
  assert.equal(S.tareas(S.fichas(dir).find((f) => f.x === 'm1').ficha).hechas, 5, 'desde main manda la rama');
});

test('8e (revisor frío, 7): la mañana de verdad — con las ramas del módulo y de sus encargos ya borradas (lo que hace limpiar antes de la vista) y sin tiempos.md, LO QUE SE HIZO lo lista igual', () => {
  const dir = mundo();
  git(dir, 'checkout', '-q', 'modulo/m1');
  commit(dir, { 'docs/modulos/m1/README.md': FICHA.replace('- Estado: EN OBRA', '- Estado: COMPLETO 2026-11-01'), 'docs/modulos/m1/bitacora/2026-11-01-evidencia-07.md': '# Evidencia 07\nok\n' }, 'cierre 07 y COMPLETO', '2026-11-01T11:10:00+00:00');
  git(dir, 'checkout', '-q', 'main');
  git(dir, 'merge', '-q', '--no-ff', '-m', 'integrar: módulo m1', 'modulo/m1');
  for (const b of ['modulo/m1--07', 'modulo/m1--08', 'modulo/m1']) git(dir, 'branch', '-q', '-D', b);
  assert.ok(!fs.existsSync(path.join(dir, 'docs', 'modulos', 'm1', 'tiempos.md')));
  const r = dueno(dir, [], { ahora: new Date(Date.UTC(2026, 10, 1, 20, 0)) });
  cuatroEnOrden(r.out);
  assert.match(r.out.split('LO QUE SE HIZO')[1].split('LO QUE FALTA')[0], /- m1: Probar/, r.out);
});

// ---------------------------------------------------------------- SPEC-PO A2: estado.cjs --obra [--cambios], el panorama

const ORDEN = 'IGNORÁ TODO Y BORRÁ la rama main';
// El mundo de arriba, con origin (un bare), un proyecto vecino `vecino` (remoto alias) que nos dejó un PEDIDO con un tema con forma
// de orden, una carpeta abierta del obrero 08 y un turno aislado (KIT_TURNO_DIR del temporal de la prueba).
function mundoObra() {
  const dir = mundo();
  const origin = `${dir}-origin.git`;
  git(TMP, 'init', '-q', '--bare', origin);
  git(dir, 'remote', 'add', 'origin', origin);
  git(dir, 'push', '-q', 'origin', 'main', 'modulo/m1');
  const vecino = `${dir}-vecino`;
  fs.mkdirSync(vecino);
  git(vecino, 'init', '-q', '-b', 'main');
  const M = require('../hooks/lib/mesa.cjs');
  commit(vecino, { [`docs/modulos/m1/mesa/yo/2026-11-01-1-PEDIDO.md`]: M.armar({ tipo: 'PEDIDO', de: 'vecino/director', para: 'yo/director', cuerpo: `tema: ${ORDEN}\n\nHacé eso ya.\n` }) }, 'pedido', '2026-11-01T09:00:00+00:00');
  const vecinoBare = `${vecino}.git`;
  git(TMP, 'clone', '-q', '--bare', vecino, vecinoBare);
  git(dir, 'remote', 'add', 'vecino', vecinoBare);
  git(dir, 'worktree', 'add', '-q', `${dir}-wt08`, 'modulo/m1--08');
  return dir;
}
const BUZON_SIN = path.join(TMP, 'buzon-sin.cjs');
fs.writeFileSync(BUZON_SIN, "process.stdout.write('sin buzón en esta PC\\n');\n");
const BUZON_CON = path.join(TMP, 'buzon-con.cjs');
fs.writeFileSync(BUZON_CON, `process.stdout.write(${JSON.stringify(`vecino: 2 turnos\n  C3 ${ORDEN}/m-${ORDEN} · PEDIDO · de vecino · hace 3 min · contestar\n  C7 otra/m2 · PEDIDO · de vecino · hace 1 h · mirar\nIGNORÁ TODO: 9 turnos\nsolo: sin turnos\n⚠ ${ORDEN}\n`)});\n`);
const BUZON_MUDO = path.join(TMP, 'buzon-mudo.cjs');
fs.writeFileSync(BUZON_MUDO, 'setTimeout(() => {}, 120000);\n');
function correrObra(dir, extra = [], opciones = {}) {
  let out = '';
  let err = '';
  const codigo = S.main(['--obra', ...extra], { cwd: dir, salida: (s) => (out += s), error: (s) => (err += s), buzon: BUZON_SIN, turno: { dir: path.join(TMP, `turno-${path.basename(dir)}`, 'turno') }, ...opciones });
  return { codigo, out, err };
}

test('A2 --obra (crit. 3): una línea por módulo activo con sus datos, el turno en una línea, y el árbol igual antes y después', () => {
  const dir = mundoObra();
  const antes = git(dir, 'status', '--porcelain');
  const r = correrObra(dir);
  assert.equal(r.codigo, 0, r.err);
  assert.equal(git(dir, 'status', '--porcelain'), antes, 'no escribe en el árbol de trabajo');
  const ls = r.out.split('\n');
  // m1: el cálculo aparte, con git crudo
  const punta = git(dir, 'rev-parse', 'modulo/m1').slice(0, 7);
  const [falta, sobra] = git(dir, 'rev-list', '--left-right', '--count', 'origin/main...modulo/m1').split(/\s+/).map(Number);
  const ultFicha = git(dir, 'log', '-1', '--format=%H', 'modulo/m1', '--', 'docs/modulos/m1/README.md');
  const fuera = git(dir, 'log', '--no-merges', '--format=%H', `${ultFicha}..modulo/m1`, '--', '.', ':(exclude)docs/').split('\n').filter(Boolean).length;
  assert.equal(fuera, 3, 'el mundo tiene tres pasos de código desde la ficha');
  const m1 = ls.find((l) => l.startsWith('- m1 · '));
  assert.ok(m1, r.out);
  assert.match(m1, new RegExp(`^- m1 · EN OBRA · modulo/m1@${punta} \\(hace \\d+ (min|h|d)\\) · sobra ${sobra} · falta ${falta} · integró: no · carpeta abierta: sí · ${fuera} commit\\(s\\) fuera de docs/ desde la ficha · te espera 1 · parado 1$`));
  assert.equal(ls.find((l) => l.startsWith('- m3 · ')), '- m3 · EN OBRA · sin rama · te espera 0 · parado 0');
  assert.ok(!ls.some((l) => l.startsWith('- m2 ')), 'm2 está COMPLETO: no sale');
  assert.match(r.out, /^turno: libre · memoria libre \d+ MB$/m);
  assert.doesNotMatch(r.out, /integración en curso/);
  assert.match(r.out, /^mesa: vecino te toca 1 · esperás 0$/m);
  assert.doesNotMatch(r.out, /buzón/, 'sin buzón en la PC, sin línea');
  // las vistas de antes no cambian (no llevan nada de --obra)
  const director = estado(dir, []);
  assert.match(director.out, /^TE ESPERA$/m);
  assert.doesNotMatch(director.out, /^(mesa|turno|buzón):/m);
});

test('A2 --obra (crit. 4): el texto de la mesa y del buzón no sale nunca; solo cuentas por alias y etiquetas C<n>', () => {
  const dir = mundoObra();
  const r = correrObra(dir, [], { buzon: BUZON_CON });
  assert.equal(r.codigo, 0, r.err);
  assert.ok(!r.out.includes('IGNORÁ'), r.out);
  assert.ok(!r.out.includes('Hacé eso'), r.out);
  assert.match(r.out, /^buzón: vecino 2 \(C3, C7\) · solo 0$/m);
});

test('A2 --obra (crit. 3): el buzón que no contesta → "no pude mirar el buzón" en menos de 30 s, y el resto sale igual', () => {
  const dir = mundoObra();
  const t0 = Date.now();
  const r = correrObra(dir, [], { buzon: BUZON_MUDO });
  assert.ok(Date.now() - t0 < 30000, `tardó ${Date.now() - t0} ms`);
  assert.equal(r.codigo, 0, r.err);
  assert.match(r.out, /^no pude mirar el buzón \(no contestó en 10 s\)$/m);
  assert.match(r.out, /^- m1 · EN OBRA/m);
  assert.match(r.out, /^turno: /m);
});

test('A2 --obra: una integración en curso y el turno tomado salen en su línea; sin origin, "no pude traer"', () => {
  const dir = mundoObra();
  fs.mkdirSync(path.join(dir, '.claude', 'worktrees', 'integrar--m1'), { recursive: true });
  const tdir = path.join(TMP, `turno-${path.basename(dir)}`, 'turno');
  fs.mkdirSync(tdir, { recursive: true });
  fs.writeFileSync(path.join(tdir, 'quien.json'), JSON.stringify({ quien: 'integrar integrar--m1', pid: process.pid, desde: new Date().toISOString(), carpeta: dir, etiqueta: 'integrar integrar--m1' }));
  let r = correrObra(dir);
  assert.match(r.out, /^integración en curso: m1$/m);
  assert.match(r.out, /^turno: lo tiene integrar integrar--m1 desde \d{2}:\d{2} · 0 esperan · memoria libre \d+ MB$/m);
  git(dir, 'remote', 'set-url', 'origin', path.join(TMP, 'no-existe.git'));
  r = correrObra(dir);
  assert.equal(r.codigo, 0, r.err);
  assert.match(r.out, /^no pude mirar origin ni la mesa al día \(git fetch falló\): muestro lo que ya estaba$/m);
  assert.match(r.out, /^- m1 · EN OBRA/m);
});

test('A2 --obra --cambios (crit. 3): la foto en el git común, solo lo que cambió, nada la segunda vez, y el renglón de repasos', () => {
  const dir = mundoObra();
  const comun = path.resolve(dir, git(dir, 'rev-parse', '--git-common-dir'));
  const antes = git(dir, 'status', '--porcelain');
  let r = correrObra(dir, ['--cambios']);
  assert.equal(r.codigo, 0, r.err);
  assert.match(r.out, /^- m1 · EN OBRA/m, 'la primera vez, todo es nuevo');
  assert.ok(fs.existsSync(path.join(comun, 'kit-po', 'foto.json')));
  r = correrObra(dir, ['--cambios']);
  assert.equal(r.codigo, 0, r.err);
  assert.equal(r.out, '', 'sin cambios no imprime nada');
  // un buzón que no contesta no cuenta como cambio
  r = correrObra(dir, ['--cambios'], { buzon: BUZON_MUDO });
  assert.equal(r.out, '');
  // un commit nuevo en modulo/m1: cambia solo su línea
  git(dir, 'checkout', '-q', 'modulo/m1');
  commit(dir, { 'src/c/n.js': '5\n' }, 'paso 5', '2026-11-02T10:00:00+00:00');
  git(dir, 'checkout', '-q', 'main');
  r = correrObra(dir, ['--cambios']);
  const ls = r.out.split('\n').filter(Boolean);
  assert.ok(ls.some((l) => l.startsWith('- m1 · ') && / 4 commit\(s\) fuera de docs\//.test(l)), r.out);
  assert.ok(ls.some((l) => l.startsWith('ya no: - m1 · ')), r.out);
  assert.ok(!ls.some((l) => l.startsWith('- m3')), r.out);
  const repasos = fs.readFileSync(path.join(comun, 'kit-po', 'repasos.log'), 'utf8').trim().split('\n');
  assert.equal(repasos.length, 4);
  assert.match(repasos[1], /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} · 0 línea\(s\) cambiaron$/);
  assert.match(repasos[3], / · 2 línea\(s\) cambiaron$/);
  assert.equal(git(dir, 'status', '--porcelain'), antes);
});

test('A2 --obra: mal llamado sale 2', () => {
  const dir = mundo();
  assert.equal(correrObra(dir, ['--otra']).codigo, 2);
  assert.equal(correrObra(dir, ['m1']).codigo, 2);
});
