'use strict';
// Pruebas de scripts/resumen.cjs (SPEC-0 5.3ter; criterio 18 del kit): el archivo del día con las secciones fijas, los números de
// frenos.log por tipo, la mesa (con y sin script), "se muestra una vez", y la lista de los `aprobado` nuevos: uno de hoy aparece
// con quién lo corrió, uno de ayer no. Repos temporales con identidad y fechas fijas.
// Corren con: node --test kit/molde/scripts/resumen.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-resumen-'));
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

const R = require('./resumen.cjs');
const SCRIPT = path.join(__dirname, 'resumen.cjs');

// "Hoy" para los casos: el 2 de noviembre de 2026, a las 19:00 locales. Los commits se fechan con la hora local de esa PC.
const AHORA = new Date(2026, 10, 2, 19, 0, 0);
const HOY = '2026-11-02';
const iso = (d, h) => {
  const f = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, 0, 0);
  const off = -f.getTimezoneOffset();
  const dos = (k) => String(Math.abs(k)).padStart(2, '0');
  return `${f.getFullYear()}-${dos(f.getMonth() + 1)}-${dos(f.getDate())}T${dos(f.getHours())}:00:00${off >= 0 ? '+' : '-'}${dos(Math.floor(Math.abs(off) / 60))}:${dos(Math.abs(off) % 60)}`;
};
const ayer = new Date(2026, 10, 1);

let n = 0;
const git = (cwd, ...args) => {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  assert.equal(r.status, 0, `git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
};
function commit(cwd, archivos, mensaje, fecha) {
  for (const [ruta, txt] of Object.entries(archivos)) {
    fs.mkdirSync(path.dirname(path.join(cwd, ruta)), { recursive: true });
    fs.writeFileSync(path.join(cwd, ruta), txt);
  }
  git(cwd, 'add', '-A');
  const r = spawnSync('git', ['commit', '-q', '-m', mensaje], { cwd, encoding: 'utf8', env: { ...process.env, GIT_AUTHOR_DATE: fecha, GIT_COMMITTER_DATE: fecha } });
  assert.equal(r.status, 0, r.stderr);
}
function resumen(cwd, argv, opciones = {}) {
  let out = '';
  let err = '';
  const codigo = R.main(argv, { cwd, ahora: AHORA, salida: (s) => (out += s), error: (s) => (err += s), mesa: path.join(TMP, 'sin-mesa.cjs'), cambios: path.join(TMP, 'sin-cambios.cjs'), ...opciones });
  return { codigo, out, err };
}

const FICHA = (director) => `# Uno
- Estado: EN OBRA
- director: ${director}
${director === 'sí' ? '- rama: modulo/m1\n' : ''}
## Fase y próximo paso
Probando el resumen.

## Tareas
- [x] Primera
- [ ] Segunda
- [ ] Tercera

## Pendientes y "te espera"
- Decidir el color del botón

## Parado
- (nada)
`;

// Un repo con el módulo m1 (con director) y m2 (sin), commits de hoy y de ayer, frenos.log de hoy y de ayer y dos `aprobado`:
// cambios-hoy (hoy) y cambios-ayer (ayer).
function mundo() {
  const dir = path.join(TMP, `r${++n}`);
  fs.mkdirSync(dir);
  git(dir, 'init', '-q', '-b', 'main');
  commit(dir, { 'README.md': 'x\n', 'docs/modulos/m1/README.md': FICHA('sí'), 'docs/modulos/m2/README.md': FICHA('no'), 'docs/TODO.md': '# TODO\n- [ ] Cosa pendiente uno\n- [ ] Cosa pendiente dos\n' }, 'inicio', iso(ayer, 9));
  commit(dir, { '.claude/cambios/cambios-ayer.md': 'a\n', '.claude/frenos.log': `${iso(ayer, 10)} · humano · main · cambios:aprobar · cambios.cjs · cambios-ayer\n` }, 'cambios: aprobado cambios-ayer', iso(ayer, 10));
  const frenosHoy = [
    `${iso(AHORA, 8)} · obrero · modulo/m1--07 · candado:estados · Write · docs/x.md`,
    `${iso(AHORA, 9)} · obrero · modulo/m1--07 · candado:estados · Write · docs/y.md`,
    `${iso(AHORA, 9)} · director · modulo/m1 · hook:barreras · Bash · git push`,
    `${iso(AHORA, 10)} · humano · main · cambios:aprobar · cambios.cjs · cambios-hoy`,
  ].join('\n');
  const previo = fs.readFileSync(path.join(dir, '.claude', 'frenos.log'), 'utf8');
  commit(dir, { 'trabajo.txt': 'hoy\n' }, 'trabajé en algo hoy', iso(AHORA, 8));
  commit(dir, { '.claude/cambios/cambios-hoy.md': 'b\n', '.claude/frenos.log': `${previo}${frenosHoy}\n` }, 'cambios: aprobado cambios-hoy', iso(AHORA, 10));
  return dir;
}

test('resumen: sin director imprime el bloque con las secciones fijas, sin escribir ningún resumen en la bitácora', () => {
  const dir = mundo();
  const r = resumen(dir, []);
  assert.equal(r.codigo, 0, r.err);
  for (const h of ['Qué se hizo', 'Qué sigue', 'Qué te espera', 'Qué está trabado', '`aprobado` nuevos de hoy (quién los corrió)', 'Hablado con otros directores', 'Lo que medimos y aprendimos', 'Lo que el método atajó hoy, en números']) {
    assert.ok(r.out.includes(`\n## ${h}\n`), `falta la sección ${h}`);
  }
  assert.ok(r.out.startsWith(`# Resumen del día · ${HOY}\n`));
  assert.match(r.out, /trabajé en algo hoy/);
  assert.match(r.out, /- Cosa pendiente uno/);
  assert.match(r.out, /\[m1\] Decidir el color del botón/);
  assert.equal(fs.existsSync(path.join(dir, 'docs', 'modulos', 'm1', 'bitacora')), false);
});

test('aprobado: el de hoy aparece listado con quién lo corrió; el de ayer, no', () => {
  const dir = mundo();
  const r = resumen(dir, []);
  const secc = r.out.split('\n## ').find((s) => s.startsWith('`aprobado` nuevos'));
  assert.match(secc, /- cambios-hoy · commit [0-9a-f]{7} · \d\d:\d\d · autor Prueba · rol humano · rama main/);
  assert.doesNotMatch(secc, /cambios-ayer/);
  assert.doesNotMatch(r.out, /cambios-ayer/);
  // sin ninguno hoy: lo dice
  const otro = resumen(dir, [], { ahora: new Date(2026, 10, 3, 19, 0, 0) });
  assert.match(otro.out, /- ningún `aprobado` nuevo hoy/);
});

test('frenos: los números salen de frenos.log del día, por tipo (el renglón de aprobar no es un freno; ayer no cuenta)', () => {
  const dir = mundo();
  const log = fs.readFileSync(path.join(dir, '.claude', 'frenos.log'), 'utf8').split('\n');
  const deHoy = log.filter((l) => l.startsWith(`${HOY}T`) && !l.includes('cambios:aprobar'));
  const porTipo = {};
  for (const l of deHoy) porTipo[l.split(' · ')[3]] = (porTipo[l.split(' · ')[3]] || 0) + 1;
  assert.deepEqual(porTipo, { 'candado:estados': 2, 'hook:barreras': 1 });
  const secc = resumen(dir, []).out.split('\n## ').find((s) => s.startsWith('Lo que el método atajó'));
  assert.match(secc, /- total: 3 freno\(s\)/);
  assert.match(secc, /- candado:estados: 2/);
  assert.match(secc, /- hook:barreras: 1/);
  assert.doesNotMatch(secc, /cambios:aprobar/);
  // sin frenos hoy y sin archivo
  assert.match(resumen(dir, [], { ahora: new Date(2026, 10, 5, 19, 0, 0) }).out, /- 0 frenos hoy/);
  fs.rmSync(path.join(dir, '.claude', 'frenos.log'));
  assert.match(resumen(dir, ['--forzar'], {}).out, /— \(sin frenos\.log\)/);
});

test('mesa: sin mesa.cjs, "— (sin mesa todavía)"; con él, lo que dice acordados', () => {
  const dir = mundo();
  assert.match(resumen(dir, []).out, /## Hablado con otros directores\n— \(sin mesa todavía\)/);
  const mesa = path.join(TMP, 'mesa-falsa.cjs');
  fs.writeFileSync(mesa, "if (process.argv[2] !== 'acordados') process.exit(2);\nconsole.log('hermes/director ofreció el candado; se adoptó');\n");
  assert.match(resumen(dir, ['--forzar'], { mesa }).out, /## Hablado con otros directores\n- hermes\/director ofreció el candado; se adoptó/);
  const vacia = path.join(TMP, 'mesa-vacia.cjs');
  fs.writeFileSync(vacia, '');
  assert.match(resumen(dir, ['--forzar'], { mesa: vacia }).out, /— \(la mesa no trajo acordados\)/);
});

test('con director: escribe docs/modulos/<x>/bitacora/<fecha>-resumen.md, lo muestra, y la segunda vez no lo pisa (sale 0 y dice dónde está)', () => {
  const dir = mundo();
  const r = resumen(dir, ['m1']);
  assert.equal(r.codigo, 0, r.err);
  const ruta = path.join(dir, 'docs', 'modulos', 'm1', 'bitacora', `${HOY}-resumen.md`);
  assert.ok(fs.existsSync(ruta));
  const texto = fs.readFileSync(ruta, 'utf8');
  assert.ok(texto.startsWith(`# Resumen del día · ${HOY} · m1\n`));
  assert.match(texto, /- Segunda/); // lo que sigue: las tareas sin tildar de la ficha
  assert.match(texto, /- cambios-hoy · commit/);
  assert.match(r.out, /resumen escrito: docs\/modulos\/m1\/bitacora\/2026-11-02-resumen\.md/);
  fs.appendFileSync(ruta, '\nNOTA DEL DIRECTOR\n');
  const otra = resumen(dir, ['m1']);
  assert.equal(otra.codigo, 0);
  assert.match(otra.out, /resumen de hoy ya existe: docs\/modulos\/m1\/bitacora\/2026-11-02-resumen\.md \(se muestra una vez/);
  assert.match(fs.readFileSync(ruta, 'utf8'), /NOTA DEL DIRECTOR/, 'no lo pisó');
  const forzado = resumen(dir, ['m1', '--forzar']);
  assert.match(forzado.out, /resumen escrito:/);
  assert.doesNotMatch(fs.readFileSync(ruta, 'utf8'), /NOTA DEL DIRECTOR/);
});

test('sin director en el módulo: imprime el bloque (no escribe archivo en la bitácora) y la marca de "ya mostrado" evita repetirlo', () => {
  const dir = mundo();
  const r = resumen(dir, ['m2']);
  assert.equal(r.codigo, 0, r.err);
  assert.ok(r.out.startsWith(`# Resumen del día · ${HOY} · m2\n`));
  assert.equal(fs.existsSync(path.join(dir, 'docs', 'modulos', 'm2', 'bitacora')), false);
  assert.equal(fs.readFileSync(path.join(dir, '.git', 'kit-resumen-del-dia'), 'utf8').trim(), HOY);
  assert.equal(git(dir, 'status', '--porcelain'), '', 'el árbol queda limpio');
  const dos = resumen(dir, ['m2']);
  assert.match(dos.out, /^resumen de hoy ya mostrado/);
  assert.equal(dos.out.includes('## Qué se hizo'), false);
  assert.match(resumen(dir, ['m2', '--forzar']).out, /## Qué se hizo/);
});

test('qué se hizo (RF-fix 6): el commit del director en modulo/<x> y el de un obrero que solo está en origin entran; los de otro módulo, no', () => {
  const dir = mundo();
  const bare = path.join(TMP, `remoto${++n}.git`);
  git(TMP, 'init', '-q', '--bare', bare);
  git(dir, 'remote', 'add', 'origin', bare);
  git(dir, 'checkout', '-q', '-b', 'modulo/m1');
  commit(dir, { 'director.txt': 'x\n' }, 'el director anota hoy', iso(AHORA, 11));
  git(dir, 'checkout', '-q', '-b', 'modulo/m1--02');
  commit(dir, { 'obrero.txt': 'x\n' }, 'el obrero 02 desde otra PC', iso(AHORA, 12));
  git(dir, 'push', '-q', 'origin', 'modulo/m1--02');
  git(dir, 'checkout', '-q', 'main');
  git(dir, 'branch', '-q', '-D', 'modulo/m1--02');
  git(dir, 'checkout', '-q', '-b', 'modulo/m2');
  commit(dir, { 'otro.txt': 'x\n' }, 'el director de m2', iso(AHORA, 13));
  git(dir, 'checkout', '-q', 'main');
  const r = resumen(dir, ['m1']);
  assert.equal(r.codigo, 0, r.err);
  const hizo = r.out.split('## Qué se hizo')[1].split('\n## ')[0];
  assert.match(hizo, /- \w+ el director anota hoy/);
  assert.match(hizo, /- \w+ el obrero 02 desde otra PC/);
  assert.doesNotMatch(hizo, /el director de m2/);
});

test('el módulo que no existe → 1; argumentos feos → 2; por la línea de comandos sale 0', () => {
  const dir = mundo();
  const no = resumen(dir, ['zzz']);
  assert.equal(no.codigo, 1);
  assert.match(no.out, /no hay ficha de "zzz"/);
  assert.equal(resumen(dir, ['--nada']).codigo, 2);
  assert.equal(resumen(dir, ['a', 'b']).codigo, 2);
  const r = spawnSync(process.execPath, [SCRIPT], { cwd: dir, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^# Resumen del día · /);
});
