'use strict';
// adoptar.test.cjs — el adoptador (SPEC-paquete-6 P7.2, D6-12, criterio 19; crit. 20 del kit: barreras verde con la ficha de fábrica).
// Sobre repos temporales armados con el molde v2 del tag v2.4.2 de este repo (como rehacer.sh, con los {{…}} completados) y el
// molde v3 del árbol de trabajo como --kit. Sin la config de git de quien corre. Nunca ~/.claude ni ../vibe-kit-pruebas.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const AD = require('./adoptar.cjs');
const M = require('./molde.cjs');
const C = require('./catalogo.cjs');
const F = require('../../pc/lib/ficha.cjs');

const SCRIPTS = path.resolve(__dirname, '..');
const RAIZ_KIT = path.resolve(__dirname, '..', '..', '..', '..', '..'); // la raíz de vibe-kit (o del worktree)
const T = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-adoptar-test-'));
test.after(() => fs.rmSync(T, { recursive: true, force: true }));
fs.writeFileSync(path.join(T, 'gitconfig-vacio'), '');
Object.assign(process.env, {
  GIT_CONFIG_GLOBAL: path.join(T, 'gitconfig-vacio'), GIT_CONFIG_NOSYSTEM: '1',
  GIT_AUTHOR_NAME: 'prueba', GIT_AUTHOR_EMAIL: 'p@kit.invalid', GIT_COMMITTER_NAME: 'prueba', GIT_COMMITTER_EMAIL: 'p@kit.invalid',
});

// Instalado en ~/.claude no hay molde ni tags: estas pruebas son del kit.
const HAY_KIT = fs.existsSync(path.join(RAIZ_KIT, 'kit', 'molde', 'settings.json'))
  && spawnSync('git', ['-C', RAIZ_KIT, 'rev-parse', '-q', '--verify', 'refs/tags/v2.4.2^{commit}'], { windowsHide: true }).status === 0;
const deKit = HAY_KIT ? {} : { skip: 'sin el kit (kit/molde y el tag v2.4.2)' };
const V2 = HAY_KIT ? M.materializarViejo(RAIZ_KIT, '2.4.2', {}, path.join(T, 'v2')).dir : null;
const VERSION = fs.existsSync(path.join(RAIZ_KIT, 'kit', 'VERSION')) ? fs.readFileSync(path.join(RAIZ_KIT, 'kit', 'VERSION'), 'utf8').trim() : null;
const FECHA = '2026-11-02';

let n = 0;
const nuevaCarpeta = (nombre) => {
  const d = path.join(T, `${n++}`, nombre);
  fs.mkdirSync(d, { recursive: true });
  return d;
};
function git(cwd, ...args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', windowsHide: true });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout;
}
function escribir(dir, mapa) {
  for (const [rel, t] of Object.entries(mapa)) {
    const p = path.join(dir, ...rel.split('/'));
    if (t === null) fs.rmSync(p, { force: true });
    else {
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, t);
    }
  }
}
const leer = (dir, rel) => {
  const p = path.join(dir, ...rel.split('/'));
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
};
// Una foto byte a byte de todo, .git incluido.
function foto(dir) {
  const out = {};
  (function rec(d, rel) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const q = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) rec(path.join(d, e.name), q);
      else out[q] = crypto.createHash('sha256').update(fs.readFileSync(path.join(d, e.name))).digest('hex');
    }
  })(dir, '');
  return out;
}

// Un repo como lo dejaba el molde v2 (2.4.2) armado a mano: cada archivo en su ruta, los {{…}} completados, sin ficha.
function repoV2(nombre = 'gama', o = {}) {
  const d = nuevaCarpeta(nombre);
  for (const rel of C.rutasDeMolde(V2)) {
    // en las skills, los marcadores de contenido quedan vacíos (llenos son contenido propio: lo prueba su test, abajo)
    const t = fs.readFileSync(path.join(V2, rel), 'utf8').split('{{PROYECTO}}').join(nombre).replace(/\{\{[^{}]*\}\}/g, rel.startsWith('skills/') ? '' : 'completado a mano');
    escribir(d, { [C.rutaEnProyecto(rel)]: t });
  }
  escribir(d, o.archivos || {});
  return commitear(d);
}
function repoPelado(nombre, archivos) {
  const d = nuevaCarpeta(nombre);
  escribir(d, archivos);
  return commitear(d);
}
function commitear(d) {
  git(d, 'init', '-q', '-b', 'main');
  git(d, 'config', 'core.autocrlf', 'false');
  git(d, 'add', '-A');
  git(d, 'commit', '-q', '-m', 'molde v2 (2.4.2) instanciado');
  return d;
}
const rol = (d, r = 'actualizador') => {
  fs.writeFileSync(path.join(d, '.kit-rol'), `${r}\n`);
  fs.appendFileSync(path.join(d, '.git', 'info', 'exclude'), '.kit-rol\n');
};

const mirar = (d, o = {}) => AD.mirar(d, { kit: RAIZ_KIT, fecha: FECHA, ...o });
const propuestaDe = (d, o) => {
  const p = path.join(nuevaCarpeta('prop'), 'propuesta.md');
  fs.writeFileSync(p, mirar(d, o).texto);
  return p;
};
const aplicar = (d, propuesta) => AD.main([d, '--kit', RAIZ_KIT, '--aplicar', propuesta, '--fecha', FECHA]);
const barreras = (d, desde) => spawnSync(process.execPath, [path.join(d, '.claude', 'scripts', 'estructura.cjs'), 'barreras', '--rango', `${desde}..HEAD`, '--sin-log'], { cwd: d, encoding: 'utf8' });
// Los commits que dice la línea final de --aplicar, tal cual.
function commitsDeLaLinea(d, lineas) {
  const cmds = lineas.filter((l) => /^ {2}git add /.test(l));
  for (const c of cmds) {
    const r = spawnSync(c.trim(), { cwd: d, shell: true, encoding: 'utf8' });
    assert.equal(r.status, 0, `${c}: ${r.stdout}${r.stderr}`);
  }
  return cmds.length;
}
const piezas = (texto) => Object.fromEntries(Object.entries(F.leer(texto).datos.piezas).map(([k, v]) => [k, typeof v === 'string' ? v : v.estado]));
const fabrica = (nivel) => F.leer(fs.readFileSync(path.join(RAIZ_KIT, 'kit', 'molde', 'hooks', 'lib', 'fabrica', `ficha.${nivel}.md`), 'utf8')).datos;
const deFabrica = (datos, nivel) => ['frenos', 'sensible', 'autorizado'].every((k) => JSON.stringify(datos[k]) === JSON.stringify(fabrica(nivel)[k]));
const BASE = ['settings', 'hook-arranque', 'hook-escritura', 'hook-git-seguro', 'hook-sensible', 'cambios-metodo', 'hooks-lib', 'scripts', 'inicio', 'cierre', 'githooks', 'docs'];
const OPCIONALES = ['estado', 'director-obrero', 'smoke', 'release', 'docs-fyd'];

// ---------------------------------------------------------------- mirar

test('--mirar sobre un v2.4.2 sin ficha: el árbol y el .git quedan byte a byte; la propuesta es una ficha de fábrica con lo base en molde', deKit, () => {
  const d = repoV2('gama');
  const antes = foto(d);
  const r = mirar(d);
  assert.deepEqual(foto(d), antes, 'mirar no cambió nada');
  const f = F.leer(r.texto).datos; // la propuesta entera se lee como ficha (lo que vio va en comentarios)
  assert.equal(f.kit, VERSION);
  assert.equal(f.nivel, 'liviano', 'sin código → liviano');
  assert.equal(f.vars.proyecto, 'gama');
  assert.ok(deFabrica(f, 'liviano'));
  const p = piezas(r.texto);
  for (const id of BASE) assert.equal(p[id], 'molde', id);
  assert.equal(p.candado, 'no');
  for (const id of OPCIONALES) assert.equal(p[id], 'no', id);
  assert.ok(!('claude-md' in p) && !('snippets' in p) && !('ficha-ejemplo' in p));
  assert.match(r.texto, /^# {3}inicio · molde · \.claude\/skills\/inicio\/SKILL\.md: el molde v2 sin editar/m);
  assert.match(r.texto, /^# v2: \.claude\/hooks\/check-code\.js — el del molde v2 sin editar: se retira/m);
  assert.match(r.texto, /^# CLAUDE\.md: hay — no se toca/m);
  assert.match(r.texto, /^# docs-fyd: se ofrece/m);
  assert.match(r.texto, /^# nivel: liviano \(inferido: no hay código/m);
  assert.match(r.texto, /^# reglas propias candidatas: ninguna$/m);
  // por la CLI: imprime lo mismo; con --propuesta, la escribe afuera; adentro de la carpeta, se niega
  const fuera = path.join(nuevaCarpeta('afuera'), 'p.md');
  const cli = spawnSync(process.execPath, [path.join(SCRIPTS, 'actualizar.cjs'), 'adoptar', d, '--kit', RAIZ_KIT, '--mirar', '--fecha', FECHA, '--propuesta', fuera], { cwd: T, encoding: 'utf8' });
  assert.equal(cli.status, 0, cli.stdout + cli.stderr);
  assert.equal(fs.readFileSync(fuera, 'utf8'), r.texto);
  assert.ok(cli.stdout.startsWith(r.texto));
  assert.deepEqual(foto(d), antes);
  const adentro = spawnSync(process.execPath, [path.join(SCRIPTS, 'actualizar.cjs'), 'adoptar', d, '--kit', RAIZ_KIT, '--mirar', '--propuesta', path.join(d, 'p.md')], { cwd: T, encoding: 'utf8' });
  assert.equal(adentro.status, 1);
  assert.match(adentro.stdout, /^adoptar: --propuesta .* cae adentro/);
  assert.deepEqual(foto(d), antes);
});

test('--mirar: con código → estandar y las vars de package.json; --nivel manda', deKit, () => {
  const d = repoV2('app', { archivos: { 'package.json': '{"scripts": {"test": "node --test"}}\n', 'package-lock.json': '{}\n', 'src/suma.js': 'module.exports = 1;\n' } });
  const r = mirar(d);
  const f = F.leer(r.texto).datos;
  assert.equal(f.nivel, 'estandar');
  assert.deepEqual(f.vars, { proyecto: 'app', 'comando-test': 'npm test', 'comando-setup': 'npm ci' });
  assert.ok(deFabrica(f, 'estandar'));
  assert.match(r.texto, /inferido: hay código \(package\.json, src\/suma\.js\)/);
  const l = F.leer(mirar(d, { nivel: 'liviano' }).texto).datos;
  assert.equal(l.nivel, 'liviano');
  assert.ok(deFabrica(l, 'liviano'));
});

test('criterio 19, caso de falla: un repo sin ficha ni CLAUDE.md recibe la propuesta igual, con todo en no', deKit, () => {
  const d = repoPelado('suelto', { 'notas.txt': 'nada del kit\n' });
  const r = mirar(d);
  const p = piezas(r.texto);
  assert.ok(Object.keys(p).length >= BASE.length + OPCIONALES.length + 1);
  for (const [id, e] of Object.entries(p)) assert.equal(e, 'no', id);
  assert.match(r.texto, /sin ficha ni CLAUDE\.md: todo en no/);
  assert.ok(deFabrica(F.leer(r.texto).datos, 'liviano'));
});

test('--mirar: copias del kit adentro, reglas propias, AGENTS.md y el registro de cambios van al comentario; una ruta ocupada y distinta → propia', deKit, () => {
  const d = repoV2('hermes', {
    archivos: {
      '.claude/skills/arquitecto/SKILL.md': '# una copia vieja del Arquitecto\n',
      '.claude/hooks/mio.sh': 'echo mio\n',
      'AGENTS.md': '# agentes de hermes\n',
      'docs/cambios-de-metodo.md': '# registro\n',
      '.claude/skills/cierre/SKILL.md': '# el cierre de hermes, reescrito\n',
      '.claude/scripts/todo.cjs': '// un todo.cjs propio\n',
    },
  });
  const s = JSON.parse(leer(d, '.claude/settings.json'));
  s.permissions.deny = ['Bash(rm -rf:*)'];
  s.permissions.ask = ['Bash(git push --force:*)'];
  s.hooks.PreToolUse = [{ matcher: 'Bash', hooks: [{ type: 'command', command: 'bash .claude/hooks/mio.sh' }] }];
  escribir(d, { '.claude/settings.json': `${JSON.stringify(s, null, 2)}\n` });
  git(d, 'commit', '-qam', 'lo propio');
  const r = mirar(d);
  const p = piezas(r.texto);
  assert.equal(p.cierre, 'propia');
  assert.equal(p.scripts, 'propia');
  assert.equal(p.inicio, 'molde');
  assert.match(r.texto, /^# {3}cierre · propia · \.claude\/skills\/cierre\/SKILL\.md ya está y es distinto del molde: no se pisa$/m);
  assert.match(r.texto, /^# copias del kit adentro: \.claude\/skills\/arquitecto — /m);
  assert.match(r.texto, /^# AGENTS\.md: hay — aviso/m);
  assert.match(r.texto, /^# registro de cambios de método: docs\/cambios-de-metodo\.md → migración: P6\.8b, orden 7, queda en te espera$/m);
  assert.match(r.texto, /^# {3}deny Bash\(rm -rf:\*\)$/m);
  assert.match(r.texto, /^# {3}ask Bash\(git push --force:\*\)$/m);
  assert.match(r.texto, /^# {3}hook PreToolUse Bash: bash \.claude\/hooks\/mio\.sh$/m);
  assert.match(r.texto, /^# {3}archivo \.claude\/hooks\/mio\.sh$/m);
  assert.ok(!/archivo \.claude\/hooks\/(session-start\.sh|check-code\.js)/.test(r.texto), 'el v2 sin editar no es una regla propia');
});

// ---------------------------------------------------------------- aplicar

test('--aplicar: la ficha de fábrica, /inicio, /cierre, el hook con tope, las barreras y los docs; candado no; los dos commits → barreras verde (exención b)', { ...deKit, timeout: 180000 }, async () => {
  const d = repoV2('gama');
  const prop = propuestaDe(d);
  rol(d);
  const antes = git(d, 'rev-parse', 'HEAD').trim();
  const claude = leer(d, 'CLAUDE.md');
  const r = await aplicar(d, prop);
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  const ficha = leer(d, '.claude/kit.md');
  const f = F.leer(ficha).datos;
  assert.ok(!ficha.includes(AD.MARCA_INI) && !/lo que vio el adoptador/.test(ficha), 'lo que vio no queda en la ficha');
  assert.ok(deFabrica(f, 'liviano'));
  assert.equal(f.piezas.candado, 'no');
  for (const id of OPCIONALES) assert.equal(f.piezas[id], 'no', id);
  for (const id of BASE) assert.match(String(f.piezas[id].estado || f.piezas[id]), /^molde/, id);
  const mN = M.materializarNuevo(RAIZ_KIT, { vars: { proyecto: 'gama' }, fecha: FECHA });
  try {
    for (const [rel, enProy] of [['skills/inicio/SKILL.md', '.claude/skills/inicio/SKILL.md'], ['skills/cierre/SKILL.md', '.claude/skills/cierre/SKILL.md'], ['hooks/session-start.cjs', '.claude/hooks/session-start.cjs'], ['hooks/lib/topes.cjs', '.claude/hooks/lib/topes.cjs'], ['hooks/lib/barreras.cjs', '.claude/hooks/lib/barreras.cjs'], ['scripts/estructura.cjs', '.claude/scripts/estructura.cjs'], ['githooks/pre-commit', '.githooks/pre-commit'], ['hooks/lib/fabrica/ficha.liviano.md', '.claude/hooks/lib/fabrica/ficha.liviano.md'], ['docs/NORTE.md', 'docs/NORTE.md'], ['docs/MAPA.md', 'docs/MAPA.md']]) {
      assert.equal(leer(d, enProy), fs.readFileSync(path.join(mN.dir, ...rel.split('/')), 'utf8'), enProy);
    }
  } finally {
    M.borrar(mN.dir);
  }
  assert.equal(leer(d, '.claude/hooks/session-start.sh'), null, 'el arranque v2 sin editar se retira');
  assert.equal(leer(d, '.claude/hooks/check-code.js'), null);
  assert.equal(leer(d, '.claude/skills/smoke/SKILL.md'), null, 'smoke no viene');
  assert.equal(leer(d, '.claude/skills/director/SKILL.md'), null, 'director no viene');
  assert.equal(leer(d, 'CLAUDE.md'), claude, 'el CLAUDE.md que hay no se toca');
  const s = leer(d, '.claude/settings.json');
  assert.ok(s.includes('session-start.cjs') && !s.includes('session-start.sh') && !s.includes('check-code.js'), 'la mezcla enchufa el v3 y retira lo del v2');
  assert.match(leer(d, 'docs/CHANGELOG.md'), new RegExp(`^kit ${VERSION.replace(/\./g, '\\.')}: adopción — piezas `, 'm'));
  assert.match(r.lineas.join('\n'), /^ficha · \.claude\/kit\.md · kit .*frenos, sensible y autorizado de fábrica$/m);
  assert.match(r.lineas.join('\n'), /^después: node \.claude\/scripts\/estructura\.cjs barreras --rango [0-9a-f]{40}\.\.HEAD → verde/m);
  assert.equal(git(d, 'rev-parse', 'HEAD').trim(), antes, 'no commitea');
  assert.equal(commitsDeLaLinea(d, r.lineas), 2);
  assert.equal(git(d, 'status', '--porcelain'), '', 'los dos commits se llevan todo');
  assert.deepEqual(git(d, 'show', '--name-only', '--format=', 'HEAD').trim().split('\n'), ['.claude/kit.md'], 'la ficha va sola, después');
  for (const h of ['pre-commit', 'pre-merge-commit', 'pre-push']) assert.match(git(d, 'ls-files', '-s', `.githooks/${h}`), /^100755 /, `${h} con +x`);
  const b = barreras(d, antes);
  assert.equal(b.status, 0, b.stdout + b.stderr);
  // y una corrida más: ya tiene ficha → 1
  const otra = await aplicar(d, prop);
  assert.equal(otra.codigo, 1);
  assert.match(otra.lineas[0], /ya tiene ficha .* eso es actualizarlo: flota/);
});

test('--aplicar con frenos, sensible o autorizado distintos de fábrica: lo dice, y el commit de la ficha da rojo en barreras', { ...deKit, timeout: 180000 }, async () => {
  const d = repoV2('beta');
  const prop = propuestaDe(d);
  fs.writeFileSync(prop, fs.readFileSync(prop, 'utf8').replace('  plata: no', '  plata: [la caja]'));
  rol(d);
  const antes = git(d, 'rev-parse', 'HEAD').trim();
  const r = await aplicar(d, prop);
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  const t = r.lineas.join('\n');
  assert.match(t, /^ficha · .* sensible distinto de fábrica$/m);
  assert.match(t, /da ROJO en el commit de la ficha \(sensible no es de fábrica\): eso lo aprueba Guido después/);
  commitsDeLaLinea(d, r.lineas);
  const b = barreras(d, antes);
  assert.equal(b.status, 1, b.stdout + b.stderr);
  assert.match(b.stdout + b.stderr, /sensible/);
});

test('--aplicar: una pieza propia (la ruta ocupada y distinta) no se toca; el resto viene', { ...deKit, timeout: 180000 }, async () => {
  const propio = '# el cierre de delta, reescrito\n';
  const d = repoV2('delta', { archivos: { '.claude/skills/cierre/SKILL.md': propio } });
  const prop = propuestaDe(d);
  assert.equal(piezas(fs.readFileSync(prop, 'utf8')).cierre, 'propia');
  rol(d);
  const r = await aplicar(d, prop);
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  assert.equal(leer(d, '.claude/skills/cierre/SKILL.md'), propio);
  assert.match(r.lineas.join('\n'), /^cierre · propia · propia: no se toca$/m);
  assert.equal(F.leer(leer(d, '.claude/kit.md')).datos.piezas.cierre, 'propia');
  assert.ok(leer(d, '.claude/hooks/session-start.cjs'));
});

test('sin CLAUDE.md: la propuesta con todo en no escribe solo la ficha; con lo base prendido por la sesión, nace el CLAUDE.md del molde', { ...deKit, timeout: 180000 }, async () => {
  const sinGit = (f) => Object.fromEntries(Object.entries(f).filter(([k]) => !k.startsWith('.git/')));
  const d = repoPelado('suelto', { 'notas.txt': 'nada del kit\n' });
  const prop = propuestaDe(d);
  rol(d);
  const antes = sinGit(foto(d));
  const r = await aplicar(d, prop);
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  const despues = sinGit(foto(d));
  assert.deepEqual(Object.keys(despues).filter((k) => despues[k] !== antes[k]), ['.claude/kit.md'], 'solo la ficha');
  for (const [id, e] of Object.entries(F.leer(leer(d, '.claude/kit.md')).datos.piezas)) assert.equal(e, 'no', id);
  assert.match(r.lineas.join('\n'), /^va un commit, solo la ficha/m);
  // la sesión prende lo base: viene todo, y el CLAUDE.md nace del molde
  const s = repoPelado('suelto2', { 'notas.txt': 'nada del kit\n' });
  const p2 = propuestaDe(s);
  let t = fs.readFileSync(p2, 'utf8');
  for (const id of BASE) t = t.replace(`\n  ${id}: no\n`, `\n  ${id}: molde\n`);
  fs.writeFileSync(p2, t);
  rol(s);
  const r2 = await aplicar(s, p2);
  assert.equal(r2.codigo, 0, r2.lineas.join('\n'));
  const mN = M.materializarNuevo(RAIZ_KIT, { vars: { proyecto: 'suelto2' }, fecha: FECHA });
  try {
    assert.equal(leer(s, 'CLAUDE.md'), fs.readFileSync(path.join(mN.dir, 'CLAUDE.md'), 'utf8'));
  } finally {
    M.borrar(mN.dir);
  }
  assert.ok(leer(s, '.claude/hooks/session-start.cjs') && leer(s, '.claude/scripts/estructura.cjs'));
  assert.equal(F.leer(leer(s, '.claude/kit.md')).datos.piezas.candado, 'no');
  assert.match(r2.lineas.join('\n'), /^CLAUDE\.md · nace del molde$/m);
});

test('--aplicar se niega (1) sin escribir: ya con ficha, sucia, sin .kit-rol actualizador, la propuesta rota o de otro kit', deKit, () => {
  const d = repoV2('epsilon');
  const prop = propuestaDe(d);
  const quieto = (carpeta, args, re) => {
    const antes = foto(carpeta);
    return AD.main(args).then((r) => {
      assert.equal(r.codigo, 1, r.lineas.join('\n'));
      assert.match(r.lineas[0], re);
      assert.deepEqual(foto(carpeta), antes, 'no escribió nada');
    });
  };
  const args = (p) => [d, '--kit', RAIZ_KIT, '--aplicar', p];
  return (async () => {
    await quieto(d, args(prop), /\.kit-rol no dice "actualizador"/);
    rol(d, 'nocturno');
    await quieto(d, args(prop), /\.kit-rol no dice "actualizador"/);
    rol(d);
    escribir(d, { 'suelto.txt': 'sin commitear\n' });
    await quieto(d, args(prop), /no está limpia \(suelto\.txt\)/);
    escribir(d, { 'suelto.txt': null });
    const rota = path.join(path.dirname(prop), 'rota.md');
    fs.writeFileSync(rota, fs.readFileSync(prop, 'utf8').replace('\nnivel: liviano\n', '\nnivel: mediano\n'));
    await quieto(d, args(rota), /^adoptar: la propuesta no se lee \(.*nivel/);
    const otra = path.join(path.dirname(prop), 'otra.md');
    fs.writeFileSync(otra, fs.readFileSync(prop, 'utf8').replace(`kit: ${VERSION}`, 'kit: 9.9.9'));
    await quieto(d, args(otra), /es del kit 9\.9\.9/);
    await quieto(d, args(path.join(path.dirname(prop), 'no-esta.md')), /no leo la propuesta/);
    const conFicha = repoV2('zeta', { archivos: { '.claude/kit.md': '---\nkit: 2.4.2\nnivel: liviano\nvars:\n  proyecto: zeta\n---\n' } });
    rol(conFicha);
    await quieto(conFicha, [conFicha, '--kit', RAIZ_KIT, '--aplicar', prop], /ya tiene ficha .* flota/);
    await quieto(conFicha, [conFicha, '--kit', RAIZ_KIT, '--mirar'], /ya tiene ficha/);
  })();
});

// ---------------------------------------------------------------- --nuevo (SPEC-paquete-8b (15), D8b-8)

test('--mirar --nuevo (8b, 15): sin CLAUDE.md y con él, lo base en molde, el candado, director-obrero y estado en sí; las otras opcionales en no', deKit, () => {
  for (const archivos of [{ 'notas.txt': 'recién nacido\n' }, { 'CLAUDE.md': '# nuevo\n', 'notas.txt': 'recién nacido\n' }]) {
    const d = repoPelado('nuevo', archivos);
    const r = mirar(d, { nuevo: true });
    const p = piezas(r.texto);
    for (const id of BASE) assert.equal(p[id], 'molde', id);
    for (const id of ['candado', 'director-obrero', 'estado']) assert.equal(p[id], 'sí', id);
    for (const id of ['smoke', 'release', 'docs-fyd']) assert.equal(p[id], 'no', id);
    assert.doesNotMatch(r.texto, /todo en no/);
    assert.match(r.texto, /^# proyecto nuevo \(--nuevo\)/m);
    assert.ok(deFabrica(F.leer(r.texto).datos, 'liviano'));
  }
  // sin --nuevo, el mismo repo sin CLAUDE.md sigue en todo no (criterio 19)
  assert.ok(Object.values(piezas(mirar(repoPelado('viejo', { 'notas.txt': 'x\n' })).texto)).every((e) => e === 'no'));
});

test('--mirar --comando-test (RF-fix 4): sin scripts.test el comando del SPEC-0 va a vars.comando-test (y le gana a npm test); con comillas o sin --mirar → uso', deKit, async () => {
  const d = repoPelado('vite', { 'package.json': '{"name":"vite","scripts":{"dev":"vite"}}\n' });
  assert.equal(F.leer(mirar(d, { nuevo: true }).texto).datos.vars['comando-test'], undefined, 'sin scripts.test no sale de ningún lado');
  const r = mirar(d, { nuevo: true, comandoTest: 'npx vitest run' });
  assert.equal(F.leer(r.texto).datos.vars['comando-test'], 'npx vitest run');
  assert.match(r.texto, /comando-test = npx vitest run \(--comando-test: el Entorno de prueba del SPEC-0\)/);
  assert.ok(deFabrica(F.leer(r.texto).datos, 'estandar'), 'frenos de fábrica: barreras pasa por la exención b');
  const conTest = repoPelado('contest', { 'package.json': '{"name":"c","scripts":{"test":"node --test"}}\n' });
  assert.equal(F.leer(mirar(conTest, { comandoTest: 'node --test src' }).texto).datos.vars['comando-test'], 'node --test src');
  // por la CLI
  const p = path.join(nuevaCarpeta('prop'), 'p.md');
  const ok = await AD.main([d, '--kit', RAIZ_KIT, '--mirar', '--nuevo', '--comando-test', 'node --test', '--propuesta', p]);
  assert.equal(ok.codigo, 0, ok.lineas.join('\n'));
  assert.equal(F.leer(fs.readFileSync(p, 'utf8')).datos.vars['comando-test'], 'node --test');
  for (const args of [[d, '--kit', RAIZ_KIT, '--mirar', '--comando-test', 'echo "x"'], [d, '--kit', RAIZ_KIT, '--aplicar', p, '--comando-test', 'npm test'], [d, '--kit', RAIZ_KIT, '--mirar', '--comando-test']]) assert.equal(await AD.main(args), null, args.join(' '));
});

test('--aplicar de una propuesta --nuevo: vienen el candado, el director y el estado; la ficha los dice en sí; los dos commits → barreras verde', { ...deKit, timeout: 180000 }, async () => {
  const d = repoPelado('nuevo', { 'notas.txt': 'recién nacido\n' });
  const prop = path.join(nuevaCarpeta('prop'), 'propuesta.md');
  fs.writeFileSync(prop, mirar(d, { nuevo: true }).texto);
  rol(d);
  const antes = git(d, 'rev-parse', 'HEAD').trim();
  const r = await aplicar(d, prop);
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  const f = F.leer(leer(d, '.claude/kit.md')).datos;
  for (const id of ['candado', 'director-obrero', 'estado']) assert.equal(f.piezas[id].estado || f.piezas[id], 'sí', id);
  for (const rel of ['.claude/scripts/estructura.cjs', '.claude/skills/director/SKILL.md', '.claude/skills/obrero/SKILL.md', '.claude/skills/estado/SKILL.md', 'CLAUDE.md']) assert.ok(leer(d, rel), rel);
  assert.equal(leer(d, '.claude/skills/smoke/SKILL.md'), null);
  // lo del v2 que un repo nuevo nunca tuvo no es un desvío: /inicio y /cierre nacen del molde, sin pasar por la fusión
  for (const id of ['inicio', 'cierre']) {
    assert.match(String(f.piezas[id].estado || f.piezas[id]), /^molde/, id);
    assert.ok(leer(d, `.claude/skills/${id}/SKILL.md`), id);
    assert.equal(leer(d, `.claude/fusiones/${id}.md`), null, `${id} no queda en te espera`);
  }
  assert.doesNotMatch(r.lineas.join('\n'), /te espera|\(falta\)/);
  assert.match(r.lineas.join('\n'), /^githooks · sin --principal · /m);
  assert.equal(commitsDeLaLinea(d, r.lineas), 2);
  assert.equal(git(d, 'status', '--porcelain'), '');
  const b = barreras(d, antes);
  assert.equal(b.status, 0, b.stdout + b.stderr);
});

// ---------------------------------------------------------------- --principal: los githooks (SPEC-paquete-8b (14), D8b-9)

const hooksPath = (d, ...donde) => {
  const r = spawnSync('git', ['config', ...donde, '--get', 'core.hooksPath'], { cwd: d, encoding: 'utf8', windowsHide: true });
  return r.status === 0 ? r.stdout.trim() : null;
};
// Una carpeta principal (un repo con un commit) y su clon (git clone de ella, como el Modo A), con .kit-rol en el clon.
function principalYClon(nombre, o = {}) {
  const p = repoPelado(nombre, { 'notas.txt': 'la carpeta de Guido\n' });
  if (o.origin) git(p, 'remote', 'add', 'origin', o.origin);
  const c = path.join(nuevaCarpeta('clon'), nombre);
  git(path.dirname(c), 'clone', '-q', o.origin || p, c);
  rol(c);
  return { p, c };
}
const ponerHook = (d) => escribir(d, { '.git/hooks/pre-commit': '#!/bin/sh\necho husky v4\n' });

test('--aplicar --principal (8b, 14): vacío → .githooks en la principal y la línea "puesto"; el clon sin core.hooksPath; la global igual', { ...deKit, timeout: 180000 }, async () => {
  const { p, c } = principalYClon('omega');
  const prop = path.join(nuevaCarpeta('prop'), 'propuesta.md');
  fs.writeFileSync(prop, mirar(c, { nuevo: true }).texto);
  const global = fs.readFileSync(process.env.GIT_CONFIG_GLOBAL);
  const gAntes = hooksPath(p, '--global');
  const r = await AD.main([c, '--kit', RAIZ_KIT, '--aplicar', prop, '--fecha', FECHA, '--principal', p]);
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  assert.ok(r.lineas.includes(`githooks · ${p} · puesto`), r.lineas.join('\n'));
  assert.equal(hooksPath(p, '--local'), '.githooks');
  assert.equal(hooksPath(c), null, 'en el clon no se prende (r1-5)');
  assert.equal(hooksPath(p, '--global'), gAntes);
  assert.deepEqual(fs.readFileSync(process.env.GIT_CONFIG_GLOBAL), global, 'la global, byte a byte');
  // los commits del clon pasan (el pre-commit no corre en el clon) y la principal los trae con el pull
  assert.equal(commitsDeLaLinea(c, r.lineas), 2);
  git(p, 'pull', '-q', '--ff-only', c, 'HEAD');
  assert.ok(leer(p, '.githooks/pre-commit') && leer(p, '.claude/kit.md'));
  // la CLI: --principal solo con --aplicar; --nuevo solo con --mirar
  for (const args of [[c, '--kit', RAIZ_KIT, '--mirar', '--principal', p], [c, '--kit', RAIZ_KIT, '--aplicar', prop, '--nuevo'], [c, '--kit', RAIZ_KIT, '--aplicar', prop, '--principal']]) assert.equal(await AD.main(args), null, args.join(' '));
});

test('prenderGithooks (8b, 14; r1-6, r1-7): .git/hooks real sin .githooks/ → intacto; otro repo o subcarpeta → no pude, sin escribir; husky con .githooks/ → previo y .githooks; husky sin .githooks/ → intacto; ya → ya estaba', () => {
  const conf = (d) => fs.readFileSync(path.join(d, '.git', 'config'), 'utf8');
  // vacío con un hook real en .git/hooks y sin .githooks/ en el disco: apagaría el hook hasta el pull
  let { p, c } = principalYClon('h1');
  ponerHook(p);
  let antes = conf(p);
  assert.match(AD.prenderGithooks(c, p), /^githooks · .* · queda para el arranque — \.git\/hooks tiene pre-commit/);
  assert.equal(conf(p), antes);
  // …el mismo con .githooks/ en el disco → puesto
  escribir(p, { '.githooks/pre-commit': '#!/bin/sh\n' });
  assert.equal(AD.prenderGithooks(c, p), `githooks · ${p} · puesto`);
  assert.equal(hooksPath(p), '.githooks');
  assert.equal(AD.prenderGithooks(c, p), `githooks · ${p} · ya estaba`);
  // otro repo, una subcarpeta, una carpeta con .kit-rol, el clon mismo: no pude, sin escribir
  const otro = principalYClon('h2');
  const sub = path.join(otro.p, 'sub');
  fs.mkdirSync(sub);
  for (const [cl, pr] of [[c, otro.p], [otro.c, sub], [otro.c, otro.c], [otro.c, path.join(T, 'no-existe')]]) {
    const a = fs.existsSync(path.join(pr, '.git', 'config')) ? conf(pr) : null;
    assert.match(AD.prenderGithooks(cl, pr), /^githooks · .* · no pude: no es el mismo repo/, `${cl} → ${pr}`);
    if (a !== null) assert.equal(conf(pr), a, pr);
  }
  assert.equal(hooksPath(otro.p), null);
  rol(otro.p);
  assert.match(AD.prenderGithooks(otro.c, otro.p), /no pude: no es el mismo repo/, 'la principal nunca lleva .kit-rol');
  // el mismo origin (la flota clona el remoto): vale
  const remoto = repoPelado('remoto', { 'notas.txt': 'r\n' });
  ({ p, c } = principalYClon('h3', { origin: remoto }));
  fs.mkdirSync(path.join(p, 'sub'));
  assert.match(AD.prenderGithooks(c, path.join(p, 'sub')), /no pude: no es el mismo repo/, 'una subcarpeta del mismo repo tampoco');
  assert.equal(hooksPath(p), null);
  assert.equal(AD.prenderGithooks(c, p), `githooks · ${p} · puesto`);
  // husky con .githooks/ en el disco → el previo a kit.hooksPathPrevio y .githooks
  ({ p, c } = principalYClon('h4'));
  git(p, 'config', 'core.hooksPath', '.husky');
  escribir(p, { '.githooks/pre-commit': '#!/bin/sh\n' });
  assert.equal(AD.prenderGithooks(c, p), `githooks · ${p} · puesto (el anterior, .husky, quedó en kit.hooksPathPrevio: el runner lo encadena)`);
  assert.equal(hooksPath(p, '--local'), '.githooks');
  assert.equal(git(p, 'config', '--local', '--get', 'kit.hooksPathPrevio').trim(), '.husky');
  // husky sin .githooks/ → intacto
  ({ p, c } = principalYClon('h5'));
  git(p, 'config', 'core.hooksPath', '.husky');
  antes = conf(p);
  assert.match(AD.prenderGithooks(c, p), /^githooks · .* · queda para el arranque — hoy apunta a \.husky/);
  assert.equal(conf(p), antes);
  assert.equal(hooksPath(c), null, 'el clon, nunca');
});

test('prenderGithooks (RF-fix 5): el mismo origin escrito distinto (.git final, barra final, host en mayúsculas) es el mismo repo; otro camino, no', () => {
  for (const [a, b] of [
    ['https://github.com/guido/hermes', 'https://github.com/guido/hermes.git'],
    ['https://github.com/guido/hermes/', 'https://GitHub.com/guido/hermes.git'],
    ['git@github.com:guido/hermes.git', 'git@GITHUB.COM:guido/hermes'],
    ['ssh://git@GitHub.com/guido/hermes.git/', 'ssh://git@github.com/guido/hermes'],
  ]) assert.equal(AD.normalizarOrigen(a), AD.normalizarOrigen(b), `${a} = ${b}`);
  assert.notEqual(AD.normalizarOrigen('https://github.com/guido/hermes'), AD.normalizarOrigen('https://github.com/guido/hermes-desktop'));
  assert.notEqual(AD.normalizarOrigen('https://github.com/guido/hermes'), AD.normalizarOrigen('https://github.com/otro/hermes'));
  // de punta a punta: la principal con …/hermes y el clon de la flota con …/hermes.git/ → puesto
  const { p, c } = principalYClon('h6');
  git(p, 'remote', 'add', 'origin', 'https://github.com/guido/hermes');
  git(c, 'remote', 'set-url', 'origin', 'https://GitHub.com/guido/hermes.git/');
  escribir(p, { '.githooks/pre-commit': '#!/bin/sh\n' });
  assert.equal(AD.prenderGithooks(c, p), `githooks · ${p} · puesto`);
  // y otro repo con el mismo host sigue sin valer
  const otro = principalYClon('h7');
  git(otro.p, 'remote', 'add', 'origin', 'https://github.com/guido/otro');
  git(otro.c, 'remote', 'set-url', 'origin', 'https://github.com/guido/hermes.git');
  assert.match(AD.prenderGithooks(otro.c, otro.p), /no pude: no es el mismo repo/);
});

test('la CLI: adoptar mal llamado → 2 con el USO (que nombra adoptar)', () => {
  for (const args of [['adoptar'], ['adoptar', 'x'], ['adoptar', 'x', '--kit', 'k'], ['adoptar', 'x', '--kit', 'k', '--mirar', '--aplicar', 'p'], ['adoptar', 'x', '--kit', 'k', '--mirar', '--nivel', 'mediano'], ['adoptar', 'x', '--kit', 'k', '--aplicar', 'p', '--nivel', 'liviano'], ['adoptar', 'x', '--kit', 'k', '--aplicar', 'p', '--propuesta', 'q'], ['adoptar', 'x', '--kit', 'k', '--mirar', '--raro'], ['adoptar', 'x', '--kit', 'k', '--aplicar']]) {
    const r = spawnSync(process.execPath, [path.join(SCRIPTS, 'actualizar.cjs'), ...args], { cwd: T, encoding: 'utf8' });
    assert.equal(r.status, 2, args.join(' '));
    assert.match(r.stderr, /^uso: node actualizar\.cjs aplicar/);
    assert.match(r.stderr, /node actualizar\.cjs adoptar <carpeta> --kit <raíz del kit> --mirar/);
  }
});

test('casaPlantilla: los {{…}} son comodines y nada más cambia', () => {
  assert.ok(AD.casaPlantilla('a {{X}} b {{Y}} c\n', 'a uno b dos c\n'));
  assert.ok(AD.casaPlantilla('a {{X}} b\n', 'a  b\n'), 'completado con nada');
  assert.ok(AD.casaPlantilla('a {{X}} b\n', 'a b b b\r\n'), 'CRLF y el comodín que se come un pedazo igual al fijo');
  assert.ok(!AD.casaPlantilla('a {{X}} b\n', 'a uno b\nuna línea más\n'));
  assert.ok(!AD.casaPlantilla('a {{X}} b {{Y}} c\n', 'a uno c\n'));
  assert.ok(!AD.casaPlantilla('ab{{X}}ba', 'aba'), 'el prefijo y el sufijo no se pisan');
  assert.ok(AD.casaPlantilla('sin marcas\n', 'sin marcas\n') && !AD.casaPlantilla('sin marcas\n', 'con marcas\n'));
});

test('contenidoPropio: un marcador de contenido lleno es propio; vacío, tal cual o el de valor corto (PROYECTO), no', () => {
  const pl = '# {{PROYECTO}}\n8. Checklist — {{BUGS_HISTORICOS}} — *nota*\n4. correr `{{COMANDO_SALUD_OPCIONAL}}`\n';
  assert.deepEqual(AD.contenidoPropio(pl, '# demo\n8. Checklist —  — *nota*\n4. correr ``\n'), []);
  assert.deepEqual(AD.contenidoPropio(pl, '# demo\n8. Checklist — {{BUGS_HISTORICOS}} — *nota*\n4. correr `{{COMANDO_SALUD_OPCIONAL}}`\n'), [], 'la nota de la plantilla, tal cual');
  assert.deepEqual(AD.contenidoPropio(pl, '# demo\n8. Checklist — el login: probar X\n- el pago: probar Y — *nota*\n4. correr `npm run salud`\n'), ['BUGS_HISTORICOS', 'COMANDO_SALUD_OPCIONAL']);
  assert.equal(AD.contenidoPropio(pl, '# demo\notra cosa\n'), null, 'no casa');
});

test('--mirar: /cierre del v2 con {{BUGS_HISTORICOS}} lleno → propia, "trae contenido propio"; vacío → molde (el v2 sin editar)', deKit, () => {
  const v2 = (rel) => fs.readFileSync(path.join(V2, rel), 'utf8');
  const cierre = (bugs) => v2('skills/cierre/SKILL.md').split('{{PROYECTO}}').join('delta').replace('{{BUGS_HISTORICOS}}', bugs);
  const lleno = repoV2('delta', { archivos: { '.claude/skills/cierre/SKILL.md': cierre('el login se rompe al volver: probar entrar dos veces') } });
  const r = mirar(lleno);
  assert.equal(piezas(r.texto).cierre, 'propia');
  assert.match(r.texto, /^# {3}cierre · propia · \.claude\/skills\/cierre\/SKILL\.md ya está y es distinto del molde: no se pisa — trae contenido propio \(BUGS_HISTORICOS\): llevalo a la zona propia antes de aplicar$/m);
  assert.equal(piezas(r.texto).inicio, 'molde');
  const vacio = repoV2('delta', { archivos: { '.claude/skills/cierre/SKILL.md': cierre('') } });
  const r2 = mirar(vacio);
  assert.equal(piezas(r2.texto).cierre, 'molde');
  assert.doesNotMatch(r2.texto, /contenido propio/);
});

test('los docs dicen lo que hace el script: los dos commits de --aplicar, el --principal (8b, 14), barreras --rango y chequear desde la primera flota', () => {
  const kit = path.resolve(__dirname, '..', '..', '..');
  for (const rel of [['arquitecto', 'anexos', 'flota.md'], ['arquitecto-skills', 'SKILL.md']]) {
    const t = fs.readFileSync(path.join(kit, ...rel), 'utf8');
    const l = t.split('\n').find((x) => /--aplicar <archivo>/.test(x));
    assert.match(l, /los \*\*dos\*\* commits que imprime \(piezas, ficha\)/, rel.join('/'));
    assert.match(l, /barreras --rango <antes>\.\.HEAD`/, rel.join('/'));
    assert.match(l, /estructura/, rel.join('/'));
    assert.match(l, /--aplicar <archivo> --principal <la carpeta de Guido>`/, rel.join('/'));
    assert.match(l, /`chequear`: desde la primera flota/, rel.join('/'));
    assert.doesNotMatch(l, /commit, `chequear`/, rel.join('/'));
  }
});

test('sin bypass: el adoptador no nombra bypassPermissions', () => {
  assert.ok(!fs.readFileSync(path.join(__dirname, 'adoptar.cjs'), 'utf8').includes('bypassPermissions'));
});
