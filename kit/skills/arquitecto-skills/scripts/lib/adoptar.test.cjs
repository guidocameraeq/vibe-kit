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
  assert.match(r.texto, /^# CLAUDE\.md: (hay — no se toca \(ya trae "El tamaño del pedido"\)|le falta "El tamaño del pedido" — con tu OK, --aplicar <propuesta> --claude-md la suma al final \(la del molde\))$/m);
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
  assert.match(r.texto, /^# registro de cambios de método: docs\/cambios-de-metodo\.md → migración, dentro del OK de la adopción: node "\$HOME\/\.claude\/skills\/arquitecto-skills\/scripts\/migrar-cambios\.cjs" --repo <clon> --fuente docs\/cambios-de-metodo\.md --plan, después lo mismo con --commit$/m);
  assert.doesNotMatch(r.texto, /P6\.8b|orden 7/);
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
  assert.match(r.lineas[r.lineas.length - 1], /^traer · sin --principal · .* adoptar ".*" --traer "<tu carpeta>"/, 'la última: el --traer (8r2, t2)');
  assert.equal(commitsDeLaLinea(d, r.lineas), 2);
  assert.equal(git(d, 'status', '--porcelain'), '');
  const b = barreras(d, antes);
  assert.equal(b.status, 0, b.stdout + b.stderr);
});

// ---------------------------------------------------------------- SPEC-paquete-8r: T1 (crit. 1), 4 (crit. 8), t2

// Un repo con código, sin ficha (rt-8: los repos de prueba nacen con ficha; este no): package.json con scripts.test y un CLAUDE.md.
const PKG = '{"name":"app","scripts":{"test":"node --test"}}\n';
const conCodigo = (nombre, extra = {}) => repoPelado(nombre, { 'package.json': PKG, 'CLAUDE.md': `# ${nombre}\n`, ...extra });
const lineaPieza = (texto, id) => (texto.split('\n').find((l) => l.startsWith(`#   ${id} · `)) || '');

test('crit. 1 (8r, T1): con código y CLAUDE.md, sin ficha → director-obrero y estado en sí; --aplicar trae /director, /obrero y /estado del molde', { ...deKit, timeout: 180000 }, async () => {
  const d = conCodigo('app');
  const r = mirar(d);
  const p = piezas(r.texto);
  assert.equal(F.leer(r.texto).datos.nivel, 'estandar');
  assert.equal(p['director-obrero'], 'sí');
  assert.equal(p.estado, 'sí');
  assert.equal(p.candado, 'no', 'el candado, como siempre sin --nuevo');
  for (const id of ['smoke', 'release', 'docs-fyd']) assert.equal(p[id], 'no', id);
  assert.equal(lineaPieza(r.texto, 'director-obrero'), '#   director-obrero · sí · repo con código: el módulo con director necesita /director y /obrero');
  assert.match(r.texto, /^# {3}usan todos los hooks; scripts: estructura, cambios, todo\)\. No trae smoke, release ni docs-fyd\.$/m, 'la línea dice la verdad');
  assert.match(r.texto, /^# repo con código \(estandar\): trae director-obrero y estado \(sí: el módulo con director necesita \/director y \/obrero\)$/m);
  const prop = propuestaDe(d);
  rol(d);
  const antes = git(d, 'rev-parse', 'HEAD').trim();
  const a = await aplicar(d, prop);
  assert.equal(a.codigo, 0, a.lineas.join('\n'));
  const mN = M.materializarNuevo(RAIZ_KIT, { vars: { proyecto: 'app', 'comando-test': 'npm test', 'comando-setup': 'npm install' }, fecha: FECHA });
  try {
    for (const [rel, enProy] of [['skills/director/SKILL.md', '.claude/skills/director/SKILL.md'], ['skills/obrero/SKILL.md', '.claude/skills/obrero/SKILL.md'], ['skills/estado/SKILL.md', '.claude/skills/estado/SKILL.md'], ['agents/revisor.md', '.claude/agents/revisor.md']]) {
      assert.equal(leer(d, enProy), fs.readFileSync(path.join(mN.dir, ...rel.split('/')), 'utf8'), enProy);
    }
  } finally {
    M.borrar(mN.dir);
  }
  const f = F.leer(leer(d, '.claude/kit.md')).datos;
  for (const id of ['director-obrero', 'estado']) assert.equal(f.piezas[id].estado || f.piezas[id], 'sí', id);
  assert.equal(leer(d, 'CLAUDE.md'), '# app\n', 'sin --claude-md, el CLAUDE.md intacto');
  assert.equal(commitsDeLaLinea(d, a.lineas), 2);
  assert.equal(git(d, 'status', '--porcelain'), '');
  const b = barreras(d, antes);
  assert.equal(b.status, 0, b.stdout + b.stderr);
});

test('crit. 1 (8r, T1; rt-4): un /director propio distinto → propia con el ⚠; solo un agente propio → propia y lo nombra; sin código (liviano) → no', deKit, () => {
  const conDir = mirar(conCodigo('dir', { '.claude/skills/director/SKILL.md': '# el director de hermes\n' }));
  assert.equal(piezas(conDir.texto)['director-obrero'], 'propia');
  assert.equal(piezas(conDir.texto).estado, 'sí', 'el estado no tiene nada propio');
  assert.equal(lineaPieza(conDir.texto, 'director-obrero'), '#   director-obrero · propia · ⚠ .claude/skills/director/SKILL.md ya está y es distinto: /director del kit no queda hasta resolverlo con Guido');
  assert.match(conDir.texto, /^# repo con código \(estandar\): trae estado \(sí: .*\); director-obrero en propia \(ya hay uno distinto: lo resuelve la sesión con Guido\)$/m);
  assert.match(conDir.texto, /No trae smoke, release ni docs-fyd\./);
  const conAgente = mirar(conCodigo('ag', { '.claude/agents/revisor.md': '---\nname: revisor\n---\nel revisor de hermes\n' }));
  assert.equal(piezas(conAgente.texto)['director-obrero'], 'propia');
  assert.equal(lineaPieza(conAgente.texto, 'director-obrero'), '#   director-obrero · propia · ⚠ .claude/agents/revisor.md ya está y es distinto: /director del kit no queda hasta resolverlo con Guido — solo agentes propios (revisor): la sesión le propone a Guido renombrar los suyos (p. ej. <nombre>-propio.md) y la pieza pasa a sí');
  // un agente propio con OTRO nombre (que el kit no trae) no choca
  assert.equal(piezas(mirar(conCodigo('ag2', { '.claude/agents/mio.md': 'mío\n' })).texto)['director-obrero'], 'sí');
  // sin código: liviano, como antes
  const liv = mirar(repoPelado('notas', { 'CLAUDE.md': '# notas\n', 'docs/apuntes.md': '# apuntes\n' }));
  assert.equal(F.leer(liv.texto).datos.nivel, 'liviano');
  for (const id of ['director-obrero', 'estado']) assert.equal(piezas(liv.texto)[id], 'no', id);
  assert.match(liv.texto, /No trae smoke, release, director-obrero, estado ni docs-fyd\./);
  assert.doesNotMatch(liv.texto, /repo con código/);
  // con código pero sin CLAUDE.md: el corte del criterio 19 va primero
  for (const e of Object.values(piezas(mirar(repoPelado('sinclaude', { 'package.json': PKG })).texto))) assert.equal(e, 'no');
});

test('crit. 8 (8r, 4): CLAUDE.md sin la sección y con un director propio → las dos líneas; --aplicar --claude-md la suma una vez en el commit de las piezas; sin la bandera, intacto', { ...deKit, timeout: 240000 }, async () => {
  const claude = '# hermes\n\nReglas.\n\n## Cómo trabajamos\n\nEl director reparte los encargos.\nCada obrero toca su carpeta.\nPara empezar, /director.\n';
  const d = conCodigo('hermes', { 'CLAUDE.md': claude });
  const r = mirar(d);
  assert.match(r.texto, /^# CLAUDE\.md: le falta "El tamaño del pedido" — con tu OK, --aplicar <propuesta> --claude-md la suma al final \(la del molde\)$/m);
  assert.match(r.texto, /^# CLAUDE\.md: tiene su director\/obrero propio \(renglones 7, 8\): choca con \/director — la sesión le propone a Guido cambiarlo por un puntero a \/director y \/obrero \(a mano, con su OK\)$/m);
  // hasta 5 números y "…"
  const muchos = mirar(conCodigo('muchos', { 'CLAUDE.md': `# m\n${'el director manda\n'.repeat(7)}` }));
  assert.match(muchos.texto, /\(renglones 2, 3, 4, 5, 6, …\)/);
  // con la sección y sin director propio: una línea, sin la segunda
  const molde = fs.readFileSync(path.join(RAIZ_KIT, 'kit', 'molde', 'CLAUDE.md'), 'utf8');
  const bien = mirar(conCodigo('bien', { 'CLAUDE.md': '# bien\n\n## El tamaño del pedido\n\nchico o no.\n' }));
  assert.match(bien.texto, /^# CLAUDE\.md: hay — no se toca \(ya trae "El tamaño del pedido"\)$/m);
  assert.doesNotMatch(bien.texto, /director\/obrero propio/);
  // --aplicar --claude-md
  const prop = propuestaDe(d);
  rol(d);
  const a = await AD.main([d, '--kit', RAIZ_KIT, '--aplicar', prop, '--fecha', FECHA, '--claude-md']);
  assert.equal(a.codigo, 0, a.lineas.join('\n'));
  assert.ok(a.lineas.includes('CLAUDE.md · le sumé al final "El tamaño del pedido" (la del molde): va en el commit de las piezas'), a.lineas.join('\n'));
  commitsDeLaLinea(d, a.lineas);
  const commiteado = git(d, 'show', 'HEAD~1:CLAUDE.md');
  assert.equal(commiteado.match(/^## El tamaño del pedido$/gm).length, 1);
  assert.ok(commiteado.startsWith(claude), 'lo de Hermes queda tal cual, arriba');
  const i = molde.indexOf('## El tamaño del pedido');
  const sec = molde.slice(i, molde.indexOf('\n## ', i)).replace(/\s+$/, '');
  assert.ok(commiteado.endsWith(`\n\n${sec}\n`), 'la del molde, al final');
  assert.deepEqual(git(d, 'show', '--name-only', '--format=', 'HEAD').trim().split('\n'), ['.claude/kit.md'], 'el CLAUDE.md va en el commit de las piezas');
  // si ya está: una línea y nada
  const ya = conCodigo('ya', { 'CLAUDE.md': '# ya\n\n## El tamaño del pedido\n\nlo propio.\n' });
  const pYa = propuestaDe(ya);
  rol(ya);
  const aYa = await AD.main([ya, '--kit', RAIZ_KIT, '--aplicar', pYa, '--fecha', FECHA, '--claude-md']);
  assert.equal(aYa.codigo, 0, aYa.lineas.join('\n'));
  assert.ok(aYa.lineas.includes('CLAUDE.md · ya trae "El tamaño del pedido": no se toca (--claude-md no suma nada)'));
  assert.equal(leer(ya, 'CLAUDE.md'), '# ya\n\n## El tamaño del pedido\n\nlo propio.\n');
  // sin --claude-md: intacto
  const sin = conCodigo('sin', { 'CLAUDE.md': claude });
  const pSin = propuestaDe(sin);
  rol(sin);
  const aSin = await aplicar(sin, pSin);
  assert.equal(aSin.codigo, 0, aSin.lineas.join('\n'));
  assert.equal(leer(sin, 'CLAUDE.md'), claude);
  // la CLI: --claude-md solo con --aplicar, una vez
  for (const args of [[d, '--kit', RAIZ_KIT, '--mirar', '--claude-md'], [d, '--kit', RAIZ_KIT, '--aplicar', prop, '--claude-md', '--claude-md']]) assert.equal(await AD.main(args), null, args.join(' '));
});

test('t2 (8r): el registro de cambios en docs/metodo/CAMBIOS.md → la receta de migrar-cambios sin --fuente', deKit, () => {
  const r = mirar(repoV2('hermes2', { archivos: { 'docs/metodo/CAMBIOS.md': '# CAMBIOS\n' } }));
  assert.match(r.texto, /^# registro de cambios de método: docs\/metodo\/CAMBIOS\.md → migración, dentro del OK de la adopción: node "\$HOME\/\.claude\/skills\/arquitecto-skills\/scripts\/migrar-cambios\.cjs" --repo <clon> --plan, después lo mismo con --commit$/m);
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

test('--aplicar --principal (8b, 14; 8r2 t2): ya no prende los githooks — valida y da el --traer; después de los commits, --traer (sin origin: del clon) los prende en la principal; el clon sin core.hooksPath; la global igual', { ...deKit, timeout: 180000 }, async () => {
  const { p, c } = principalYClon('omega');
  const prop = path.join(nuevaCarpeta('prop'), 'propuesta.md');
  fs.writeFileSync(prop, mirar(c, { nuevo: true }).texto);
  const global = fs.readFileSync(process.env.GIT_CONFIG_GLOBAL);
  const gAntes = hooksPath(p, '--global');
  const conf = fs.readFileSync(path.join(p, '.git', 'config'));
  // una carpeta que no es la de este clon: el ⚠ en la línea (y el clon vuelve a limpio)
  const otra = repoPelado('otra', { 'a.txt': 'a\n' });
  const r2 = await AD.main([c, '--kit', RAIZ_KIT, '--aplicar', prop, '--fecha', FECHA, '--principal', otra]);
  assert.match(r2.lineas[r2.lineas.length - 1], /^traer · .* · ⚠ no es la carpeta de este clon/);
  git(c, 'checkout', '-q', '--', '.');
  git(c, 'clean', '-fdq');
  const r = await AD.main([c, '--kit', RAIZ_KIT, '--aplicar', prop, '--fecha', FECHA, '--principal', p]);
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  assert.equal(r.lineas[r.lineas.length - 1], `traer · ${p} · el último paso, después de los dos commits, barreras y el push: node "$HOME/.claude/skills/arquitecto-skills/scripts/actualizar.cjs" adoptar "${c.replace(/\\/g, '/')}" --traer "${p.replace(/\\/g, '/')}" (trae lo adoptado y prende ahí los githooks)`);
  assert.equal(hooksPath(p, '--local'), null, '--aplicar ya no lo cambia');
  assert.deepEqual(fs.readFileSync(path.join(p, '.git', 'config')), conf, 'la config de la principal, byte a byte');
  // los commits del clon pasan (el pre-commit no corre en el clon) y --traer los lleva a la principal y prende los githooks
  assert.equal(commitsDeLaLinea(c, r.lineas), 2);
  const t = await AD.main([c, '--traer', p]);
  assert.equal(t.codigo, 0, t.lineas.join('\n'));
  assert.equal(git(p, 'rev-parse', 'HEAD'), git(c, 'rev-parse', 'HEAD'));
  assert.ok(leer(p, '.githooks/pre-commit') && leer(p, '.claude/kit.md'));
  assert.ok(t.lineas.includes(`githooks · ${p} · puesto`), t.lineas.join('\n'));
  assert.equal(hooksPath(p, '--local'), '.githooks');
  assert.equal(hooksPath(c), null, 'en el clon no se prende (r1-5)');
  assert.equal(hooksPath(p, '--global'), gAntes);
  assert.deepEqual(fs.readFileSync(process.env.GIT_CONFIG_GLOBAL), global, 'la global, byte a byte');
  // la CLI: --nuevo solo con --mirar; --principal con valor; --traer solo, sin --kit
  for (const args of [[c, '--kit', RAIZ_KIT, '--aplicar', prop, '--nuevo'], [c, '--kit', RAIZ_KIT, '--aplicar', prop, '--principal'], [c, '--traer'], [c, '--traer', p, '--kit', RAIZ_KIT], [c, '--traer', p, '--mirar'], [c, '--traer', p, '--aplicar', prop], ['--traer', p]]) assert.equal(await AD.main(args), null, args.join(' '));
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

// ---------------------------------------------------------------- RF-fix (D8r.1)

test('RF-fix 2: el paso 0 de adoptar (la PC al día) lo dicen igual flota.md, el SKILL.md del Equipador, EQUIPADOR.md §5 y la GUIA', () => {
  const kit = path.resolve(__dirname, '..', '..', '..');
  const raiz = RAIZ_KIT;
  for (const rel of [[kit, 'arquitecto', 'anexos', 'flota.md'], [kit, 'arquitecto-skills', 'SKILL.md'], [raiz, 'manuales', 'EQUIPADOR.md']]) {
    const t = fs.readFileSync(path.join(...rel), 'utf8').replace(/\r\n/g, '\n').replace(/\n\s+/g, ' ');
    assert.match(t, /ultimo-tag <clon[^>]*>` contra `~\/\.claude\/VERSION`/, rel.join('/'));
    assert.match(t, /primero \*?"actualizate"/, rel.join('/'));
    assert.match(t, /`⚠ el --kit tiene el tag …`/, rel.join('/'));
  }
  const guia = fs.readFileSync(path.join(raiz, 'GUIA-DE-USO.md'), 'utf8').replace(/\r\n/g, '\n').replace(/\n/g, ' ');
  assert.match(guia, /"adoptá X".*Antes, la PC al día: .*primero \*"actualizate"\*/);
});

const gitId = (cwd, ...args) => git(cwd, '-c', 'user.name=prueba', '-c', 'user.email=prueba@ejemplo.invalid', '-c', 'commit.gpgsign=false', '-c', 'tag.gpgsign=false', ...args);

test('RF-fix 2: --mirar con un --kit que tiene un tag más nuevo que su kit/VERSION → la línea "esta PC está atrás"; parado en el último, no', deKit, () => {
  // un clon del kit (nunca el repo real) con un tag anotado nuevo en otro commit; HEAD queda donde estaba
  const clon = path.join(nuevaCarpeta('kit-clon'), 'k');
  git(path.dirname(clon), 'clone', '-q', RAIZ_KIT, clon);
  gitId(clon, 'checkout', '-q', '-b', 'mas-nuevo');
  gitId(clon, 'commit', '-q', '--allow-empty', '-m', 'una versión nueva');
  gitId(clon, 'tag', '-a', 'v99.0.0', '-m', 'v99.0.0');
  gitId(clon, 'tag', 'v100.0.0'); // liviano: no cuenta (ultimo-tag mira solo los anotados)
  gitId(clon, 'checkout', '-q', '-');
  const d = conCodigo('atras');
  const r = AD.mirar(d, { kit: clon, fecha: FECHA });
  assert.match(r.texto, new RegExp(`^# ⚠ el --kit tiene el tag v99\\.0\\.0, más nuevo que su kit/VERSION \\(${VERSION.replace(/\./g, '\\.')}\\): esta PC está atrás — primero "actualizate"`, 'm'));
  // la misma cuenta que `actualizar.cjs ultimo-tag <clon>`
  const ut = spawnSync(process.execPath, [path.join(SCRIPTS, 'actualizar.cjs'), 'ultimo-tag', clon], { encoding: 'utf8' });
  assert.equal(ut.stdout.trim(), 'v99.0.0');
  // no: con la versión igual o más nueva que el último tag anotado, ni una línea; sin repo git que leer, tampoco (no frena)
  assert.equal(AD.avisoKitAtras(clon, '99.0.0'), null);
  assert.equal(AD.avisoKitAtras(clon, '99.0.1'), null);
  assert.equal(AD.avisoKitAtras(nuevaCarpeta('sin-git'), '3.0.0'), null);
  // la propuesta sigue siendo una ficha que se lee
  assert.equal(F.leer(r.texto).datos.kit, VERSION);
});

test('RF-fix 3a: comando-setup → npm ci / --frozen-lockfile con el lock commiteado; el install a secas sin lock o con el lock sin commitear', deKit, () => {
  const setupDe = (d) => F.leer(mirar(d).texto).datos.vars['comando-setup'];
  assert.equal(setupDe(conCodigo('npm-ci', { 'package-lock.json': '{}\n' })), 'npm ci');
  assert.equal(setupDe(conCodigo('pnpm-fijo', { 'pnpm-lock.yaml': 'lockfileVersion: 9\n' })), 'pnpm install --frozen-lockfile');
  assert.equal(setupDe(conCodigo('yarn-fijo', { 'yarn.lock': '# yarn\n' })), 'yarn install --frozen-lockfile');
  assert.equal(setupDe(conCodigo('sin-lock')), 'npm install');
  const suelto = conCodigo('lock-suelto');
  escribir(suelto, { 'package-lock.json': '{}\n' }); // en el disco, sin commitear
  const r = mirar(suelto);
  assert.equal(F.leer(r.texto).datos.vars['comando-setup'], 'npm install');
  assert.match(r.texto, /comando-setup = npm install \(package\.json; package-lock\.json no está commiteado\)/);
});

test('RF-fix 4: un renglón del CLAUDE.md igual a uno del CLAUDE.md del molde no cuenta como director/obrero propio', deKit, () => {
  const molde = fs.readFileSync(path.join(RAIZ_KIT, 'kit', 'molde', 'CLAUDE.md'), 'utf8').replace(/\r\n/g, '\n');
  const delKit = molde.split('\n').find((l) => /obrero/i.test(l) && !/\/(director|obrero)\b/i.test(l) && !/\{\{/.test(l));
  assert.ok(delKit, 'el molde tiene un renglón que nombra al obrero');
  // sí cuenta: el propio; no cuenta: el del molde (con o sin espacios de más)
  const r = mirar(conCodigo('mezcla', { 'CLAUDE.md': `# m\n${delKit}\nEl director propio reparte.\n  ${delKit}  \n` }));
  assert.match(r.texto, /director\/obrero propio \(renglones 3\)/);
  const solo = mirar(conCodigo('solo-kit', { 'CLAUDE.md': `# m\n${delKit}\n` }));
  assert.doesNotMatch(solo.texto, /director\/obrero propio/);
});

test('RF-fix 9: un repo cuya historia tuvo .claude/kit.md → --mirar y --aplicar dicen el rojo de barreras (exención b); sin esa historia, verde', { ...deKit, timeout: 240000 }, async () => {
  const d = repoV2('fichavieja');
  escribir(d, { '.claude/kit.md': '---\nkit: 2.4.2\n---\n' });
  gitId(d, 'add', '-A');
  gitId(d, 'commit', '-q', '-m', 'una ficha que hubo');
  gitId(d, 'rm', '-q', '.claude/kit.md');
  gitId(d, 'commit', '-q', '-m', 'y se fue');
  const sha = git(d, 'log', '--all', '-1', '--format=%h', '--', '.claude/kit.md').trim();
  assert.equal(AD.fichaEnLaHistoria(d), sha);
  const prop = propuestaDe(d);
  assert.match(fs.readFileSync(prop, 'utf8'), new RegExp(`^# ⚠ \\.claude/kit\\.md ya estuvo en la historia \\(commit ${sha}\\) y la exención b pide que no haya existido nunca: el commit de la ficha da ROJO en barreras`, 'm'));
  rol(d);
  const antes = git(d, 'rev-parse', 'HEAD').trim();
  const r = await aplicar(d, prop);
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  const t = r.lineas.join('\n');
  assert.match(t, /^después: node \.claude\/scripts\/estructura\.cjs barreras --rango [0-9a-f]{40}\.\.HEAD da ROJO: \.claude\/kit\.md ya estuvo en la historia/m);
  assert.doesNotMatch(t, /→ verde/);
  commitsDeLaLinea(d, r.lineas);
  const b = barreras(d, antes);
  assert.equal(b.status, 1, 'barreras de verdad da rojo: ' + b.stdout + b.stderr);
  // no: un repo sin esa historia no la nombra
  assert.equal(AD.fichaEnLaHistoria(conCodigo('sin-historia')), null);
  assert.doesNotMatch(mirar(conCodigo('sin-historia2')).texto, /ya estuvo en la historia/);
});

test('sin bypass: el adoptador no nombra bypassPermissions', () => {
  assert.ok(!fs.readFileSync(path.join(__dirname, 'adoptar.cjs'), 'utf8').includes('bypassPermissions'));
});

// ---------------------------------------------------------------- SPEC-paquete-8r2 (A2): t2 (--traer), t4, t5, t8, t12 (a)

const cabeza = (d) => git(d, 'rev-parse', 'HEAD').trim();
// Un origin bare, la carpeta de Guido clonada de él y el clon de la adopción clonado de él (como la flota), con .kit-rol.
function bareYDos(nombre) {
  const r = repoPelado(nombre, { 'notas.txt': 'la carpeta de Guido\n' });
  const b = path.join(nuevaCarpeta('bare'), `${nombre}.git`);
  git(path.dirname(b), 'clone', '-q', '--bare', r, b);
  const p = path.join(nuevaCarpeta('guido'), nombre);
  git(path.dirname(p), 'clone', '-q', b, p);
  const c = path.join(nuevaCarpeta('clon'), nombre);
  git(path.dirname(c), 'clone', '-q', b, c);
  rol(c);
  return { b, p, c };
}

test('crit. 2 (8r2 t2; rt-7, rt-8): --traer — sin push "no llegó"; sucia u otra rama, no toca; después del push, la carpeta en el HEAD del clon, core.hooksPath y el setup de una vez', deKit, async () => {
  const { p, c } = bareYDos('traer');
  // en el clon: lo adoptado (una ficha con comando-setup de Python, los githooks), commiteado
  escribir(c, { 'requirements.txt': 'pytest\n' });
  escribir(c, { '.claude/kit.md': mirar(c, { plataforma: 'linux' }).texto, '.githooks/pre-commit': '#!/bin/sh\nexit 0\n' });
  git(c, 'add', '-A');
  git(c, 'commit', '-q', '-m', 'kit: adopción');
  const sha = cabeza(c);
  const antes = cabeza(p);
  const P = p.replace(/\\/g, '/');
  // sin push: no llegó, y nada más
  let t = await AD.main([c, '--traer', p]);
  assert.equal(t.codigo, 0, t.lineas.join('\n'));
  assert.deepEqual(t.lineas, [`traer · ${p} · el HEAD del clon (${sha.slice(0, 7)}) no llegó a origin/main: pusheá primero (git -C "${c.replace(/\\/g, '/')}" push origin main) y corré de nuevo — no toqué tu carpeta`]);
  assert.equal(cabeza(p), antes);
  assert.equal(hooksPath(p), null);
  git(c, 'push', '-q', 'origin', 'main');
  // sucia: no toca
  escribir(p, { 'suelto.txt': 'sin commitear\n' });
  t = await AD.main([c, '--traer', p]);
  assert.deepEqual(t.lineas, [`traer · ${p} · no toqué nada: tu carpeta tiene cambios sin commitear (suelto.txt) — commitealos o guardalos (git -C "${P}" status) y corré de nuevo`]);
  assert.equal(t.codigo, 0);
  assert.equal(cabeza(p), antes);
  assert.equal(hooksPath(p), null);
  assert.equal(leer(p, 'suelto.txt'), 'sin commitear\n');
  escribir(p, { 'suelto.txt': null });
  // en otra rama: no toca
  git(p, 'switch', '-q', '-c', 'otra');
  t = await AD.main([c, '--traer', p]);
  assert.deepEqual(t.lineas, [`traer · ${p} · no toqué nada: tu carpeta está en otra y lo adoptado está en main — git -C "${P}" switch main y corré de nuevo`]);
  assert.equal(cabeza(p), antes);
  assert.equal(hooksPath(p), null);
  git(p, 'switch', '-q', 'main');
  // limpia y en main: el ff, después los githooks, y el setup de una vez (no hay .venv)
  t = await AD.main([c, '--traer', p]);
  assert.equal(t.codigo, 0, t.lineas.join('\n'));
  assert.equal(cabeza(p), sha);
  assert.equal(hooksPath(p, '--local'), '.githooks');
  assert.equal(hooksPath(c), null, 'el clon, nunca (r1-5)');
  assert.deepEqual(t.lineas, [
    `traer · ${p} · traje ${antes.slice(0, 7)}..${sha.slice(0, 7)} (origin/main)`,
    `githooks · ${p} · puesto`,
    'en tu carpeta, una vez: python3 -m venv .venv && .venv/bin/python -m pip install -r requirements.txt (el sello corre comando-test acá)',
  ]);
  // otra vez, con el .venv: nada que traer, ya estaba, sin la línea del setup
  fs.mkdirSync(path.join(p, '.venv'));
  escribir(p, { '.git/info/exclude': '.venv/\n' });
  t = await AD.main([c, '--traer', p]);
  assert.deepEqual(t.lineas, [`traer · ${p} · ya tenía ${sha.slice(0, 7)}: nada que traer`, `githooks · ${p} · ya estaba`]);
  // otro repo, o el clon mismo: salida 1, sin tocar
  const otro = repoPelado('otro', { 'a.txt': 'a\n' });
  for (const pr of [otro, c, path.join(T, 'no-existe')]) {
    const x = await AD.main([c, '--traer', pr]);
    assert.equal(x.codigo, 1, pr);
    assert.match(x.lineas[0], /no pude: no es el mismo repo/);
  }
  assert.equal(hooksPath(otro), null);
});

test('crit. 2 (8r2 t2): --traer sin origin en la carpeta trae del clon (como el Modo A)', deKit, async () => {
  const { p, c } = principalYClon('sinorigin');
  escribir(c, { '.githooks/pre-commit': '#!/bin/sh\nexit 0\n', 'nuevo.txt': 'adoptado\n' });
  git(c, 'add', '-A');
  git(c, 'commit', '-q', '-m', 'kit: adopción');
  const antes = cabeza(p);
  const t = await AD.main([c, '--traer', p]);
  assert.equal(t.codigo, 0, t.lineas.join('\n'));
  assert.equal(cabeza(p), cabeza(c));
  assert.equal(leer(p, 'nuevo.txt'), 'adoptado\n');
  assert.deepEqual(t.lineas, [`traer · ${p} · traje ${antes.slice(0, 7)}..${cabeza(c).slice(0, 7)} (del clon)`, `githooks · ${p} · puesto`], 'sin ficha: sin la línea del setup');
  assert.equal(hooksPath(p, '--local'), '.githooks');
});

test('crit. 8 (8r2 t8): --mirar --principal …/Hermes.exe en un clon clon-x → proyecto: Hermes.exe, "el nombre de tu carpeta"; sin él, el del clon y la nota; la principal no se toca', deKit, async () => {
  const c = repoPelado('clon-x', { 'CLAUDE.md': '# hermes\n' });
  const p = repoPelado('Hermes.exe', { 'notas.txt': 'la de Guido\n' });
  const fp = foto(p);
  const con = mirar(c, { principal: p });
  assert.equal(F.leer(con.texto).datos.vars.proyecto, 'Hermes.exe');
  assert.match(con.texto, /^# vars: proyecto = Hermes\.exe \(el nombre de tu carpeta\)/m);
  const sin = mirar(c);
  assert.equal(F.leer(sin.texto).datos.vars.proyecto, 'clon-x');
  assert.match(sin.texto, /^# vars: proyecto = clon-x \(el nombre del clon: si no es el de tu carpeta, corré con --principal\)/m);
  // la CLI
  const r = await AD.main([c, '--kit', RAIZ_KIT, '--mirar', '--principal', p, '--fecha', FECHA]);
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  assert.ok(r.lineas.includes('  proyecto: Hermes.exe'), r.lineas.join('\n'));
  assert.deepEqual(foto(p), fp, '--mirar no escribe en la principal');
  const no = await AD.main([c, '--kit', RAIZ_KIT, '--mirar', '--principal', path.join(T, 'no-existe')]);
  assert.equal(no.codigo, 1);
  assert.match(no.lineas[0], /--principal .* no es una carpeta/);
});

test('crit. 4 (8r2 t4): --mirar dice "entornos: ninguno declarado" y "herramientas: ninguna"; una propuesta con entornos (un real y un prueba) aplicada los deja en la ficha', { ...deKit, timeout: 180000 }, async () => {
  const d = conCodigo('bases');
  const r = mirar(d);
  assert.match(r.texto, /^# entornos: ninguno declarado — preguntale a Guido cada base y su clase \(real · prueba · dummy\); sin declararla, la base de prueba cuenta como real$/m);
  assert.match(r.texto, /^# herramientas: ninguna — el ejemplo de kit\.ejemplo\.md \("db ping"\) no es un comando de este proyecto: si se copia, entorno da rojo$/m);
  assert.match(r.texto, /^# {5}entornos:\n# {7}base-real:\n# {9}clase: real\n# {7}base-prueba:\n# {9}clase: prueba$/m, 'el ejemplo de la gramática');
  // la sesión declara las dos bases en la propuesta
  const ls = r.texto.split('\n');
  const fin = ls.indexOf('---', 1);
  ls.splice(fin, 0, 'entornos:', '  base-real:', '    clase: real', '  base-prueba:', '    clase: prueba');
  const prop = path.join(nuevaCarpeta('prop'), 'propuesta.md');
  fs.writeFileSync(prop, ls.join('\n'));
  rol(d);
  const a = await aplicar(d, prop);
  assert.equal(a.codigo, 0, a.lineas.join('\n'));
  assert.deepEqual(F.leer(leer(d, '.claude/kit.md')).datos.entornos, { 'base-real': { clase: 'real' }, 'base-prueba': { clase: 'prueba' } });
});

test('crit. 5 (8r2 t5; D8r2-4): Python → el venv .venv, nunca el pip ni el pytest globales; win32 (con y sin py) y linux; pyproject solo → -e .; la línea comandos:; .venv/ en el snippet', deKit, () => {
  const d = repoPelado('py', { 'requirements.txt': 'pytest\nrequests\n', 'CLAUDE.md': '# py\n', 'app.py': 'print(1)\n' });
  const varsDe = (o) => F.leer(mirar(d, o).texto).datos.vars;
  const win = varsDe({ plataforma: 'win32', hayPy: true });
  assert.equal(win['comando-setup'], 'py -3 -m venv .venv && .venv/Scripts/python.exe -m pip install -r requirements.txt');
  assert.equal(win['comando-test'], '.venv/Scripts/python.exe -m pytest');
  assert.equal(varsDe({ plataforma: 'win32', hayPy: false })['comando-setup'], 'python -m venv .venv && .venv/Scripts/python.exe -m pip install -r requirements.txt');
  const lin = varsDe({ plataforma: 'linux' });
  assert.equal(lin['comando-setup'], 'python3 -m venv .venv && .venv/bin/python -m pip install -r requirements.txt');
  assert.equal(lin['comando-test'], '.venv/bin/python -m pytest');
  for (const v of [win, lin]) {
    assert.doesNotMatch(v['comando-setup'], /^pip install/);
    assert.notEqual(v['comando-test'], 'pytest');
  }
  assert.match(mirar(d, { plataforma: 'linux' }).texto, /^# comandos: setup python3 -m venv \.venv && \.venv\/bin\/python -m pip install -r requirements\.txt · test \.venv\/bin\/python -m pytest$/m);
  // solo pyproject.toml, sin pytest
  const pp = repoPelado('pp', { 'pyproject.toml': '[project]\nname = "pp"\n', 'CLAUDE.md': '# pp\n' });
  const vp = F.leer(mirar(pp, { plataforma: 'linux' }).texto).datos.vars;
  assert.equal(vp['comando-setup'], 'python3 -m venv .venv && .venv/bin/python -m pip install -e .');
  assert.equal(vp['comando-test'], undefined);
  assert.match(mirar(pp, { plataforma: 'linux' }).texto, /^# comandos: setup python3 -m venv \.venv && \.venv\/bin\/python -m pip install -e \. · test ninguno$/m);
  // sin manifiesto: ninguno
  assert.match(mirar(conCodigo('js-sin-test', { 'package.json': '{"name":"x"}\n' })).texto, /^# comandos: setup npm install · test ninguno$/m);
  // el snippet del molde ignora el venv
  assert.ok(fs.readFileSync(path.join(RAIZ_KIT, 'kit', 'molde', 'gitignore.snippet'), 'utf8').split(/\r?\n/).includes('.venv/'));
});

test('t12 (a) (8r2): config local ignorada en la raíz (config*.ini, *.local.*) → la línea del .worktreeinclude, sin los .env; con .worktreeinclude, "ya hay"; mirar no toca nada', deKit, () => {
  const d = repoPelado('conf', { '.gitignore': 'config.ini\n*.local.*\n.env\n.env.*\n', 'CLAUDE.md': '# conf\n', 'config.local.md': 'trackeado\n' });
  git(d, 'add', '-f', 'config.local.md');
  git(d, 'commit', '-q', '-m', 'uno trackeado');
  escribir(d, { 'config.ini': '[db]\n', 'app.local.json': '{}\n', '.env': 'SECRETO=x\n', '.env.local': 'SECRETO=y\n', 'otro.ini': 'no\n' });
  const antes = foto(d);
  const r = mirar(d);
  assert.deepEqual(foto(d), antes);
  const l = r.texto.split('\n').filter((x) => x.startsWith('# config local'));
  assert.deepEqual(l, ['# config local ignorada en la raíz: app.local.json, config.ini — worktree crear no la copia (sin .worktreeinclude copia solo los .env): con el OK de Guido, un .worktreeinclude en la raíz con estas líneas (los .env también: con el archivo dejan de ir solos): .env · .env.* · app.local.json · config.ini']);
  // con .worktreeinclude: lo dice y no propone
  escribir(d, { '.worktreeinclude': '.env\n' });
  assert.match(mirar(d).texto, /^# config local ignorada en la raíz: app\.local\.json, config\.ini — ya hay \.worktreeinclude/m);
  // sin config local: ni una línea
  assert.doesNotMatch(mirar(conCodigo('sin-conf')).texto, /config local/);
});
