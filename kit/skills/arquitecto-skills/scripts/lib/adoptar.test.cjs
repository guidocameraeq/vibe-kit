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
  assert.match(t, /da ROJO en el commit de la ficha \(sensible no es de fábrica\): sin remoto, ese rojo no queda en el clon: /); // 8r3 i4
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
  assert.equal(r.lineas[r.lineas.length - 1], `traer · ${p} · el último paso, después de los commits (dos; tres con --permisos o --arranque), barreras y el push: node "$HOME/.claude/skills/arquitecto-skills/scripts/actualizar.cjs" adoptar "${c.replace(/\\/g, '/')}" --traer "${p.replace(/\\/g, '/')}" (trae lo adoptado y prende ahí los githooks)`);
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
    // 8r2 (t2): los commits que imprime (dos, o tres con D2/D3), barreras --rango, y el último paso es --traer (los githooks ahí)
    const l = t.split('\n').find((x) => /--aplicar <archivo>/.test(x));
    assert.match(l, /--aplicar <archivo> --principal <(la carpeta de Guido|su carpeta)>`/, rel.join('/'));
    const a = t.slice(t.indexOf(l));
    assert.match(a, /los commits que imprime/i, rel.join('/'));
    assert.match(a, /barreras --rango <antes>\.\.HEAD`/, rel.join('/'));
    assert.match(a, /adoptar <clon> --traer <(la carpeta de Guido|su carpeta)>`/, rel.join('/'));
    assert.ok(a.indexOf('barreras --rango') < a.lastIndexOf('--traer'), `${rel.join('/')}: --traer va al final`);
    assert.doesNotMatch(l, /los \*\*dos\*\* commits que imprime \(piezas, ficha\)/, rel.join('/'));
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

test('CF-1 y CF-2 (8r2, el chequeo frío): con --principal la config local se mira en la carpeta de Guido; un package.json en una subcarpeta que el setup no instala se avisa', deKit, () => {
  // CF-1: el clon no tiene los ignorados; la carpeta de Guido sí
  const p = repoPelado('guido-conf', { '.gitignore': 'config.ini\n', 'CLAUDE.md': '# conf\n' });
  escribir(p, { 'config.ini': '[db]\n' });
  const c = repoPelado('clon-conf', { '.gitignore': 'config.ini\n', 'CLAUDE.md': '# conf\n' });
  assert.doesNotMatch(mirar(c).texto, /config local/, 'sin --principal: el clon no tiene nada');
  assert.match(mirar(c, { principal: p }).texto, /^# config local ignorada en la raíz: config\.ini — worktree crear no la copia/m);
  // CF-2: web/package.json y un setup de Python → la línea; con el setup que lo nombra, nada
  const w = repoPelado('web-py', { 'requirements.txt': 'pytest\n', 'CLAUDE.md': '# w\n', 'web/package.json': '{}\n', 'node_modules/x/package.json': '{}\n' });
  const t = mirar(w).texto;
  assert.match(t, /^# otro manifiesto: web\/package\.json — el comando-setup no lo instala/m);
  assert.doesNotMatch(t, /node_modules\/package\.json/);
  assert.doesNotMatch(mirar(conCodigo('sin-web')).texto, /otro manifiesto/);
});

// ---------------------------------------------------------------- SPEC-paquete-8r2: t3 (crit. 3, rt-4) y t9 (crit. 9, rt-9) — A1

// Sin claude en el PATH mientras corre fn: una pieza que va a la fusión no lanza un `claude -p` de verdad.
async function sinClaude(fn) {
  const antes = process.env.PATH;
  const exts = process.platform === 'win32' ? ['.exe', '.cmd', '.bat', ''] : [''];
  process.env.PATH = String(antes || '').split(path.delimiter).filter((d) => !exts.some((e) => fs.existsSync(path.join(d, `claude${e}`)))).join(path.delimiter);
  try {
    return await fn();
  } finally {
    process.env.PATH = antes;
  }
}
const aplicarCon = (d, propuesta, ...extra) => AD.main([d, '--kit', RAIZ_KIT, '--aplicar', propuesta, '--fecha', FECHA, ...extra]);
const DIR_PROPIO = '# el director de hermes (646 renglones)\n';
const INICIO_PROPIO = '# el inicio de hermes\n';
const CIERRE_PROPIO = '# el cierre de hermes\n';
const conDirectorPropio = (nombre, extra = {}) => conCodigo(nombre, {
  '.claude/skills/director/SKILL.md': DIR_PROPIO, '.claude/skills/inicio/SKILL.md': INICIO_PROPIO, '.claude/skills/cierre/SKILL.md': CIERRE_PROPIO, ...extra,
});
// El molde nuevo con las vars de la ficha que quedó (las mismas que usó --aplicar).
function delMolde(d, rel) {
  const vars = F.leer(leer(d, '.claude/kit.md')).datos.vars;
  const m = M.materializarNuevo(RAIZ_KIT, { vars, fecha: FECHA });
  try {
    return fs.readFileSync(path.join(m.dir, ...rel.split('/')), 'utf8');
  } finally {
    M.borrar(m.dir);
  }
}

test('crit. 3 (8r2, t3): director, /inicio y /cierre propios → --mirar trae el bloque D1 con (A) y (B), y el D4', deKit, () => {
  const r = mirar(conDirectorPropio('hermes'));
  const p = piezas(r.texto);
  for (const id of ['director-obrero', 'inicio', 'cierre']) assert.equal(p[id], 'propia', id);
  assert.match(r.texto, /^# D1 · el director, \/inicio y \/cierre: ya hay unos tuyos distintos de los del kit — .*\.claude\/skills\/director\/SKILL\.md \(director-obrero\)/m);
  assert.match(r.texto, /^# D1 · .*\.claude\/skills\/inicio\/SKILL\.md \(inicio\).*\.claude\/skills\/cierre\/SKILL\.md \(cierre\)/m);
  const lineas = r.texto.split('\n');
  const i = lineas.findIndex((l) => l.startsWith('# D1 · '));
  assert.equal(lineas[i + 1], '#   (A, recomendada) los del kit: --aplicar <propuesta> --director kit — las reglas tuyas que valgan pasan a la zona propia del CLAUDE.md o a cambios (los cambios de método ya migran)');
  assert.equal(lineas[i + 2], '#   (B) los tuyos: sin la opción — el módulo arranca solo, sin el director del kit');
  assert.match(r.texto, /^# D4 · sensible: las cinco de sensible: quedan en no; recomendada: datos-reales con los comandos que tocan la base real — se cambia en la propuesta, como lista \(p\. ej\. datos-reales: \[sqlcmd\]; "sí" no se lee: va no o los comandos, como en kit\.ejemplo\.md\); el commit de la ficha da ROJO en barreras: sin remoto, ese rojo no queda en el clon: .*$/m); // 8r3 i4: el camino verdadero (sin remoto)
  // sin nada propio, no hay D1
  assert.doesNotMatch(mirar(conCodigo('limpio')).texto, /^# D1 · /m);
});

test('crit. 3 (8r2, t3; rt-4): --aplicar --director kit escribe los del kit, la ficha en sí/molde con su hash, el renglón dice D1: A, y barreras verde', { ...deKit, timeout: 240000 }, async () => {
  const d = conDirectorPropio('hermes');
  const prop = propuestaDe(d); // sin editar: la opción alcanza (un paso)
  rol(d);
  const antes = git(d, 'rev-parse', 'HEAD').trim();
  const r = await sinClaude(() => aplicarCon(d, prop, '--director', 'kit'));
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  const t = r.lineas.join('\n');
  for (const rel of ['.claude/skills/director/SKILL.md', '.claude/skills/inicio/SKILL.md', '.claude/skills/cierre/SKILL.md', '.claude/skills/obrero/SKILL.md']) {
    assert.equal(leer(d, rel), delMolde(d, rel.slice('.claude/'.length)), rel);
  }
  const f = F.leer(leer(d, '.claude/kit.md')).datos;
  assert.equal(f.piezas['director-obrero'], 'sí');
  for (const id of ['inicio', 'cierre']) {
    assert.match(String(f.piezas[id].estado), /^molde/, id);
    assert.match(String(f.piezas[id].hash), /^[0-9a-f]{8,}$/, `${id} con su hash`);
  }
  assert.match(t, new RegExp(`^director-obrero · sí · reemplacé los tuyos \\(D1: A\\) — lo tuyo queda en la historia: git show ${antes}:\\.claude/skills/director/SKILL\\.md$`, 'm'));
  assert.match(t, new RegExp(`^cierre · molde[^ ]* · reemplacé los tuyos \\(D1: A\\) — lo tuyo queda en la historia: git show ${antes}:\\.claude/skills/cierre/SKILL\\.md$`, 'm'));
  assert.match(leer(d, 'docs/CHANGELOG.md'), /^kit .*: adopción — piezas .* — D1: A, los del kit reemplazan los propios$/m);
  assert.equal(leer(d, '.claude/fusiones/director-obrero.md'), null, 'no va a la fusión');
  assert.equal(commitsDeLaLinea(d, r.lineas), 2);
  assert.equal(git(d, 'status', '--porcelain'), '');
  const b = barreras(d, antes);
  assert.equal(b.status, 0, b.stdout + b.stderr);
  assert.equal(git(d, 'show', `${antes}:.claude/skills/director/SKILL.md`), DIR_PROPIO, 'lo tuyo queda en la historia');
});

test('crit. 3 (8r2, t3; rt-4): sin --director kit no se tocan; ni un --nuevo con director propio, ni un githooks propio en molde (ni con --director kit)', { ...deKit, timeout: 300000 }, async () => {
  // la propuesta sin editar, sin la opción: quedan propia
  const d = conDirectorPropio('hermes');
  const prop = propuestaDe(d);
  rol(d);
  const r = await sinClaude(() => aplicar(d, prop));
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  assert.equal(leer(d, '.claude/skills/director/SKILL.md'), DIR_PROPIO);
  assert.equal(leer(d, '.claude/skills/inicio/SKILL.md'), INICIO_PROPIO);
  assert.equal(leer(d, '.claude/skills/cierre/SKILL.md'), CIERRE_PROPIO);
  for (const id of ['director-obrero', 'inicio', 'cierre']) assert.equal(F.leer(leer(d, '.claude/kit.md')).datos.piezas[id], 'propia', id);
  assert.doesNotMatch(r.lineas.join('\n'), /D1: A/);
  // --nuevo con un director propio (sí de mirar, no a mano): sin la opción, no se toca
  const n = repoPelado('nuevo', { 'notas.txt': 'recién nacido\n', '.claude/skills/director/SKILL.md': DIR_PROPIO });
  const pn = path.join(nuevaCarpeta('prop'), 'propuesta.md');
  fs.writeFileSync(pn, mirar(n, { nuevo: true }).texto);
  assert.equal(piezas(fs.readFileSync(pn, 'utf8'))['director-obrero'], 'sí');
  rol(n);
  const rn = await sinClaude(() => aplicar(n, pn));
  assert.equal(rn.codigo, 0, rn.lineas.join('\n'));
  assert.equal(leer(n, '.claude/skills/director/SKILL.md'), DIR_PROPIO, '--nuevo sin --director kit: el tuyo queda');
  assert.doesNotMatch(rn.lineas.join('\n'), /reemplacé los tuyos/);
  // un githooks propio, puesto en molde a mano: ni con --director kit (no es de las cuatro)
  const HOOK = '#!/bin/sh\necho el pre-commit de hermes\n';
  const g = conCodigo('ganchos', { '.githooks/pre-commit': HOOK });
  const pg = propuestaDe(g);
  assert.equal(piezas(fs.readFileSync(pg, 'utf8')).githooks, 'propia');
  fs.writeFileSync(pg, fs.readFileSync(pg, 'utf8').replace('\n  githooks: propia\n', '\n  githooks: molde\n'));
  rol(g);
  const rg = await sinClaude(() => aplicarCon(g, pg, '--director', 'kit'));
  assert.equal(rg.codigo, 0, rg.lineas.join('\n'));
  assert.equal(leer(g, '.githooks/pre-commit'), HOOK, 'githooks no es de D1');
  assert.doesNotMatch(rg.lineas.join('\n'), /^githooks · .*reemplacé los tuyos/m);
  // la opción es de --aplicar, con su único valor
  for (const args of [[d, '--kit', RAIZ_KIT, '--mirar', '--director', 'kit'], [d, '--kit', RAIZ_KIT, '--aplicar', prop, '--director', 'propio'], [d, '--kit', RAIZ_KIT, '--aplicar', prop, '--permisos', 'todas'], [d, '--kit', RAIZ_KIT, '--aplicar', prop, '--arranque', 'mio']]) {
    assert.equal(await AD.main(args), null, args.join(' '));
  }
});

test('8r2 t3 (modo-b.md B4): resolver … nueva sobre una pieza propia ya adoptada (8r3 i5: ahora anda sin informe); en la adopción, sí a mano + --aplicar + resolver … nueva sí', { ...deKit, timeout: 300000 }, async () => {
  const ACT = path.join(SCRIPTS, 'actualizar.cjs');
  const d = conDirectorPropio('hermes');
  const prop = propuestaDe(d);
  rol(d);
  const r = await sinClaude(() => aplicar(d, prop));
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  commitsDeLaLinea(d, r.lineas);
  fs.rmSync(path.join(d, '.kit-rol')); // el dueño: rol humano
  // 8r3 i5: antes se negaba ("no hay … no hay nada que resolver"); sobre una propia, nueva trae la del molde sin informe
  const res = spawnSync(process.execPath, [ACT, 'resolver', '.', 'director-obrero', 'nueva', '--por', 'x'], { cwd: d, encoding: 'utf8' });
  assert.equal(res.status, 0, res.stdout + res.stderr);
  assert.equal(leer(d, '.claude/skills/director/SKILL.md'), delMolde(d, 'skills/director/SKILL.md'));
  // las otras salidas sin informe siguen negándose
  git(d, 'checkout', '-q', '--', '.');
  git(d, 'clean', '-fdq');
  const q = spawnSync(process.execPath, [ACT, 'resolver', '.', 'director-obrero', 'quedarse', '--por', 'x'], { cwd: d, encoding: 'utf8' });
  assert.equal(q.status, 1, q.stdout + q.stderr);
  assert.match(q.stdout, /^resolver: no hay \.claude\/fusiones\/director-obrero\.md: no hay nada que resolver$/m);
  // el camino viejo, en la adopción: la propuesta a sí a mano → --aplicar la manda a la fusión (te espera) → resolver … nueva
  const e = conDirectorPropio('hermes2');
  const pe = propuestaDe(e);
  fs.writeFileSync(pe, fs.readFileSync(pe, 'utf8').replace('\n  director-obrero: propia\n', '\n  director-obrero: sí\n'));
  rol(e);
  const ae = await sinClaude(() => aplicar(e, pe));
  assert.equal(ae.codigo, 0, ae.lineas.join('\n'));
  assert.ok(leer(e, '.claude/fusiones/director-obrero.md'), `el informe: ${ae.lineas.join('\n')}`);
  assert.equal(leer(e, '.claude/skills/director/SKILL.md'), DIR_PROPIO);
  commitsDeLaLinea(e, ae.lineas);
  assert.equal(git(e, 'status', '--porcelain'), '');
  fs.rmSync(path.join(e, '.kit-rol'));
  const nueva = spawnSync(process.execPath, [ACT, 'resolver', '.', 'director-obrero', 'nueva', '--por', 'x'], { cwd: e, encoding: 'utf8' });
  assert.equal(nueva.status, 0, nueva.stdout + nueva.stderr);
  assert.equal(leer(e, '.claude/skills/director/SKILL.md'), delMolde(e, 'skills/director/SKILL.md'));
  assert.equal(leer(e, '.claude/fusiones/director-obrero.md'), null);
});

// Un repo con código y un settings como el de Hermes: una allow del v2, un ask de git merge, un SessionStart propio y un handoff gordo.
function conSettingsPropio(nombre) {
  const settings = {
    hooks: { SessionStart: [{ matcher: '', hooks: [{ type: 'command', command: 'bash .claude/hooks/arranque-hermes.sh' }] }] },
    permissions: { allow: ['Bash(git add:*)', 'Bash(npm test:*)'], ask: ['Bash(git merge:*)', 'Bash(git push --force:*)'] },
  };
  return conCodigo(nombre, {
    '.claude/settings.json': `${JSON.stringify(settings, null, 2)}\n`,
    '.claude/hooks/arranque-hermes.sh': 'cat docs/SESSION_HANDOFF.md\n',
    'docs/SESSION_HANDOFF.md': `# handoff\n${'x'.repeat(6 * 1024)}\n`,
  });
}
const settingsDe = (d) => JSON.parse(leer(d, '.claude/settings.json'));
const hooksDe = (s, ev) => ((s.hooks || {})[ev] || []).flatMap((g) => g.hooks.map((h) => [h.command, ...(h.args || [])].join(' ')));

test('crit. 9 (8r2, t9): --mirar lista lo que se va, los ask que frenan, el SessionStart propio y el handoff gordo, con D2 y D3', deKit, () => {
  const r = mirar(conSettingsPropio('hermes'));
  const t = r.texto;
  assert.match(t, /^# settings: se van con la mezcla \(iguales al molde v2\):$/m);
  assert.match(t, /^# {3}se va: allow Bash\(git add:\*\)$/m);
  assert.doesNotMatch(t, /se va: allow Bash\(npm test:\*\)/, 'una allow que no es del v2 no se va');
  assert.match(t, /^# {3}frena: ask Bash\(git merge:\*\)$/m);
  assert.doesNotMatch(t, /frena: ask Bash\(git push --force/, 'git push --force no lo corre el director');
  assert.match(t, /^# arranque: un SessionStart propio \(no es del molde\): hook SessionStart \*: bash \.claude\/hooks\/arranque-hermes\.sh$/m);
  assert.match(t, /^# arranque: docs\/SESSION_HANDOFF\.md pesa 6155 B y el tope del hook es 5000 B: cada arranque lo inyecta CORTADO$/m);
  const ls = t.split('\n');
  const i2 = ls.indexOf('# D2 · los permisos:');
  assert.ok(i2 > 0, 'el bloque D2');
  assert.match(ls[i2 + 1], /^# {3}\(recomendada\) .*--aplicar <propuesta> --permisos recomendada/);
  assert.match(ls[i2 + 2], /^# {3}\(otra\) sin la opción/);
  const i3 = ls.indexOf('# D3 · el arranque:');
  assert.ok(i3 > 0, 'el bloque D3');
  assert.match(ls[i3 + 1], /^# {3}\(recomendada\) el del kit: --aplicar <propuesta> --arranque kit/);
  assert.match(ls[i3 + 2], /^# {3}\(otra\) sin la opción/);
  // un repo sin nada de eso: ni D2 ni D3 (sí el D4)
  const limpio = mirar(conCodigo('limpio')).texto;
  assert.doesNotMatch(limpio, /^# D[23] · /m);
  assert.match(limpio, /^# D4 · /m);
});

test('crit. 9 (8r2, t9; rt-9): --aplicar --permisos recomendada --arranque kit → tres commits; la allow queda, el ask y el SessionStart propio se van; sin opciones, como hoy', { ...deKit, timeout: 300000 }, async () => {
  // sin las opciones: el settings, la mezcla de siempre (dos commits)
  const h = conSettingsPropio('hermes');
  const ph = propuestaDe(h);
  rol(h);
  const comoHoy = await aplicar(h, ph);
  assert.equal(comoHoy.codigo, 0, comoHoy.lineas.join('\n'));
  const sHoy = settingsDe(h);
  assert.ok(!sHoy.permissions.allow.includes('Bash(git add:*)'), 'sin la opción, la mezcla saca la allow del v2');
  assert.ok(sHoy.permissions.ask.includes('Bash(git merge:*)'));
  assert.ok(hooksDe(sHoy, 'SessionStart').includes('bash .claude/hooks/arranque-hermes.sh'));
  assert.doesNotMatch(comoHoy.lineas.join('\n'), /tres commits|D2|D3/);
  assert.equal(commitsDeLaLinea(h, comoHoy.lineas), 2);

  // con las dos
  const d = conSettingsPropio('hermes');
  const prop = propuestaDe(d);
  rol(d);
  const antes = git(d, 'rev-parse', 'HEAD').trim();
  const r = await aplicarCon(d, prop, '--permisos', 'recomendada', '--arranque', 'kit');
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  const t = r.lineas.join('\n');
  assert.match(t, /^settings · D2 \(--permisos recomendada\): quedan allow Bash\(git add:\*\) \(la mezcla las sacaba\); salen ask Bash\(git merge:\*\) \(frenaban al director\)$/m);
  assert.match(t, /^settings · D3 \(--arranque kit\): sale del settings hook SessionStart \*: bash \.claude\/hooks\/arranque-hermes\.sh — su archivo queda$/m);
  assert.match(t, /^van tres commits, en este orden/m);
  const s = settingsDe(d);
  assert.ok(s.permissions.allow.includes('Bash(git add:*)'), 'la allow queda');
  assert.ok(s.permissions.allow.includes('Bash(npm test:*)'));
  assert.ok(!s.permissions.ask.includes('Bash(git merge:*)'), 'el ask que frena se va');
  assert.ok(s.permissions.ask.includes('Bash(git push --force:*)'), 'el que no frena queda');
  assert.ok(!hooksDe(s, 'SessionStart').includes('bash .claude/hooks/arranque-hermes.sh'), 'el SessionStart propio se va');
  assert.ok(hooksDe(s, 'SessionStart').some((c) => c.includes('session-start.cjs')), 'queda el del kit');
  assert.ok(leer(d, '.claude/hooks/arranque-hermes.sh'), 'su archivo queda');
  assert.equal(commitsDeLaLinea(d, r.lineas), 3);
  assert.equal(git(d, 'status', '--porcelain'), '');
  assert.deepEqual(git(d, 'log', '--format=%s', '-3').trim().split('\n'), [`kit: adopción ${VERSION} (permisos: D2/D3)`, `kit: adopción ${VERSION} (ficha)`, `kit: adopción ${VERSION} (piezas)`]);
  assert.deepEqual(git(d, 'show', '--name-only', '--format=', 'HEAD').trim().split('\n'), ['.claude/settings.json'], 'el tercero, solo el settings');
  assert.deepEqual(JSON.parse(git(d, 'show', 'HEAD~2:.claude/settings.json')), sHoy, 'en el de las piezas, la mezcla de siempre');
  // barreras: las piezas y la ficha, verde; con el tercero, lo que dice la línea después:
  const b2 = spawnSync(process.execPath, [path.join(d, '.claude', 'scripts', 'estructura.cjs'), 'barreras', '--rango', `${antes}..HEAD~1`, '--sin-log'], { cwd: d, encoding: 'utf8' });
  assert.equal(b2.status, 0, b2.stdout + b2.stderr);
  const b3 = barreras(d, antes);
  assert.equal(b3.status, 1, 'el tercero da rojo: toca reglas del settings');
  assert.match(b3.stdout + b3.stderr, /toca settings \(allow:Bash\(git add:\*\), ask:Bash\(git merge:\*\), hook:SessionStart\/\/bash \.claude\/hooks\/arranque-hermes\.sh\) sin un aprobado sellado/);
  assert.match(t, /^después: node \.claude\/scripts\/estructura\.cjs barreras --rango [0-9a-f]{40}\.\.HEAD → verde en las piezas y la ficha$/m);
  assert.match(t, /^después: el commit de los permisos \(permisos: D2\/D3\) da ROJO en barreras \(toca reglas del settings sin un aprobado sellado\): sin remoto, ese rojo no queda en el clon: .*; ya pusheado no se rehace \(sería un push forzado\): si no lo querés, se revierte con un commit nuevo \(git revert\) y queda la mezcla de siempre$/m); // 8r3 i4
});

test('8r2 D4: datos-reales con una lista en la propuesta → --aplicar anda y la línea después: dice el camino; con "sí", la propuesta no se lee', { ...deKit, timeout: 240000 }, async () => {
  const d = conCodigo('hermes');
  const prop = propuestaDe(d);
  const conSi = path.join(path.dirname(prop), 'con-si.md');
  fs.writeFileSync(conSi, fs.readFileSync(prop, 'utf8').replace('  datos-reales: no', '  datos-reales: sí'));
  fs.writeFileSync(prop, fs.readFileSync(prop, 'utf8').replace('  datos-reales: no', '  datos-reales: [sqlcmd]'));
  rol(d);
  const si = await aplicar(d, conSi);
  assert.equal(si.codigo, 1);
  assert.match(si.lineas[0], /^adoptar: la propuesta no se lee \(.*"sensible\.datos-reales" tiene que ser "no" o una lista/);
  const antes = git(d, 'rev-parse', 'HEAD').trim();
  const r = await aplicar(d, prop);
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  assert.deepEqual(F.leer(leer(d, '.claude/kit.md')).datos.sensible['datos-reales'], ['sqlcmd']);
  assert.match(r.lineas.join('\n'), /^después: node \.claude\/scripts\/estructura\.cjs barreras --rango [0-9a-f]{40}\.\.HEAD da ROJO en el commit de la ficha \(sensible no es de fábrica\): sin remoto, ese rojo no queda en el clon: .*$/m); // 8r3 i4
  commitsDeLaLinea(d, r.lineas);
  assert.equal(barreras(d, antes).status, 1);
});

// ---------------------------------------------------------------- SPEC-paquete-8r3 (A): i1b, i2, i4, i5

// Un repo como el bot de Arti: docs/ es un sitio publicado (docs.json, CNAME y 10 páginas), los papeles en arti-docs/ (el handoff,
// el TODO y 8 sueltos que no son de los seis). Con o sin un session-start.cjs propio (o.arranque).
const SUELTOS_ARTI = ['ARCHITECTURE.md', 'DECISIONS.md', 'MODELS.md', 'PROMPTS.md', 'RIESGOS.md', 'ROADMAP.md', 'TOOLS.md', 'USUARIOS.md'];
const ARRANQUE_PROPIO = [
  "'use strict';",
  '// el arranque de arti: inyecta el handoff de arti-docs',
  '// y el TODO, sin el kit',
  "const fs = require('fs');",
  "const path = require('path');",
  "process.stdout.write(fs.readFileSync(path.join(process.cwd(), 'arti-docs', 'SESSION_HANDOFF.md'), 'utf8'));",
  "process.stdout.write(fs.readFileSync('arti-docs/TODO.md', 'utf8'));",
  '',
].join('\n');
function repoBot(nombre, o = {}) {
  const a = { 'docs/docs.json': '{"nav":[]}\n', 'docs/CNAME': 'docs.openclaw.ai\n' };
  for (let i = 0; i < 10; i++) a[`docs/pagina-${i}.md`] = `# página ${i}\n`;
  a['arti-docs/SESSION_HANDOFF.md'] = '# handoff de arti\n';
  a['arti-docs/TODO.md'] = '# TODO de arti\n';
  for (const s of SUELTOS_ARTI) a[`arti-docs/${s}`] = `# ${s}\n`;
  if (o.arranque) {
    a['.claude/hooks/session-start.cjs'] = ARRANQUE_PROPIO;
    // el settings con el comando del molde (el del bot): D3 de la rc.3 no ve nada que sacar
    a['.claude/settings.json'] = `${JSON.stringify({ hooks: { SessionStart: [{ matcher: '', hooks: [{ type: 'command', command: 'node', args: ['${CLAUDE_PROJECT_DIR}/.claude/hooks/session-start.cjs'], timeout: 20 }] }] } }, null, 2)}\n`;
  }
  return conCodigo(nombre, { ...a, ...(o.extra || {}) });
}
const lineasDe = (texto, re) => texto.split('\n').filter((l) => re.test(l));

test('crit. 2 (8r3 i1b; rt-4): --mirar sobre el bot → carpeta-docs: arti-docs, la línea papeles: y los 8 sueltos; dos con handoff → ninguna; docs/ con el handoff → como hoy; un nombre que no sirve → no la propone', deKit, () => {
  const d = repoBot('arti');
  const antes = foto(d);
  const r = mirar(d);
  assert.deepEqual(foto(d), antes, 'mirar no escribe');
  assert.equal(r.datos['carpeta-docs'], 'arti-docs');
  assert.match(r.texto, /^carpeta-docs: arti-docs$/m);
  assert.match(r.texto, /^# papeles: arti-docs\/ \(tiene SESSION_HANDOFF\.md\) — docs\/ tiene 12 archivos y no es del método: queda del proyecto; en la propuesta, carpeta-docs: arti-docs$/m);
  assert.match(r.texto, /^# papeles: arti-docs\/ tiene 8 que no son de los seis ni de las tres carpetas \(ARCHITECTURE\.md, DECISIONS\.md, MODELS\.md, PROMPTS\.md y 4 más\) — con el candado prendido \(candado:raiz\) van a referencia\/ o a modulos\/<x>\/; si no, candado: no, como en Hermes$/m);
  // la pieza docs nace en arti-docs/ (nunca en docs/)
  const docsLinea = lineaPieza(r.texto, 'docs');
  assert.match(docsLinea, /arti-docs\/NORTE\.md/);
  assert.match(docsLinea, /lo que ya hay en arti-docs\/ no se toca/);
  assert.doesNotMatch(docsLinea, /[ (]docs\//);
  // dos carpetas con handoff: ninguna, y la línea las nombra
  const dos = mirar(repoPelado('dos', { 'CLAUDE.md': '# dos\n', 'a/SESSION_HANDOFF.md': '# a\n', 'b/c/SESSION_HANDOFF.md': '# b\n' }));
  assert.equal(dos.datos['carpeta-docs'], undefined);
  assert.doesNotMatch(dos.texto, /^carpeta-docs:/m);
  assert.match(dos.texto, /^# papeles: hay SESSION_HANDOFF\.md seguido en a\/, b\/c\/ — no elegí ninguna: escribí carpeta-docs: <la del método> en la propuesta/m);
  // docs/ con su handoff: sin la clave y sin línea de papeles (como la rc.3)
  const comoHoy = mirar(repoV2('gama'));
  assert.doesNotMatch(comoHoy.texto, /^carpeta-docs:|^# papeles:/m);
  // un nombre que la ficha no acepta (mayúsculas): no se propone, y se dice
  const mal = mirar(repoPelado('mal', { 'CLAUDE.md': '# mal\n', 'Arti-Docs/SESSION_HANDOFF.md': '# x\n' }));
  assert.equal(mal.datos['carpeta-docs'], undefined);
  assert.match(mal.texto, /^# papeles: Arti-Docs\/ tiene SESSION_HANDOFF\.md pero ese nombre no sirve de carpeta-docs:/m);
  // sin ninguna y un docs/ ajeno: la línea que dice cómo elegir
  const sin = mirar(repoPelado('sin', { 'CLAUDE.md': '# sin\n', 'docs/docs.json': '{}\n', 'docs/a.md': '# a\n' }));
  assert.match(sin.texto, /^# papeles: docs\/ ya tiene docs\.json y 2 archivos que no son del método — si es de otra cosa, escribí carpeta-docs: <otra> en la propuesta/m);
});

test('crit. 2 (8r3 i1b; rt-5): --aplicar con carpeta-docs: arti-docs no toca docs/, escribe lo que falta en arti-docs/, la ficha tiene la clave, la mesa del .gitattributes y barreras verde; sin la clave y docs/ ajeno, se niega sin escribir', { ...deKit, timeout: 240000 }, async () => {
  // rt-5: la propuesta sin la clave (la sesión la borró) → no escribe nada
  const n = repoBot('arti-sin');
  const pn = propuestaDe(n);
  fs.writeFileSync(pn, fs.readFileSync(pn, 'utf8').replace('\ncarpeta-docs: arti-docs\n', '\n'));
  rol(n);
  const fn = foto(n);
  const neg = await aplicar(n, pn);
  assert.equal(neg.codigo, 1, neg.lineas.join('\n'));
  assert.match(neg.lineas[0], /^adoptar: docs\/ no es del método \(tiene docs\.json, CNAME y 12 archivos que no son del método, sin SESSION_HANDOFF\.md\) y la propuesta no trae carpeta-docs: — escribí carpeta-docs: <la carpeta de los papeles> en la propuesta \(carpeta-docs: docs si van igual ahí\) y corré --aplicar de nuevo; no escribí nada$/);
  assert.deepEqual(foto(n), fn, 'no escribió nada');

  const d = repoBot('arti');
  const prop = propuestaDe(d);
  rol(d);
  const antes = cabeza(d);
  const r = await sinClaude(() => aplicar(d, prop));
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  assert.equal(git(d, 'status', '--porcelain', '--', 'docs'), '', 'docs/ de OpenClaw sin tocar');
  for (const x of ['NORTE.md', 'MAPA.md', 'CHANGELOG.md', 'README.md']) assert.ok(leer(d, `arti-docs/${x}`), `arti-docs/${x} nace`);
  assert.equal(leer(d, 'arti-docs/SESSION_HANDOFF.md'), '# handoff de arti\n', 'lo que ya había no se toca');
  assert.equal(leer(d, 'arti-docs/TODO.md'), '# TODO de arti\n');
  assert.match(leer(d, 'arti-docs/CHANGELOG.md'), new RegExp(`^kit ${VERSION.replace(/\./g, '\\.')}: adopción — piezas `, 'm'));
  assert.ok(r.lineas.some((l) => l.startsWith('arti-docs/CHANGELOG.md · un renglón · kit ')), r.lineas.join('\n'));
  assert.equal(F.leer(leer(d, '.claude/kit.md')).datos['carpeta-docs'], 'arti-docs');
  const ga = leer(d, '.gitattributes');
  assert.match(ga, /^arti-docs\/modulos\/\*\*\/mesa\/\*\* text eol=lf$/m);
  assert.doesNotMatch(ga, /^docs\/modulos/m);
  assert.equal(commitsDeLaLinea(d, r.lineas), 2);
  assert.equal(git(d, 'status', '--porcelain'), '');
  const b = barreras(d, antes);
  assert.equal(b.status, 0, b.stdout + b.stderr);
});

test('crit. 3 (8r3 i2; rt-9): un session-start.cjs propio con el settings del molde → --mirar trae la línea, lo que hacía, lo que lee y el D3', deKit, () => {
  const r = mirar(repoBot('arti', { arranque: true }));
  const t = r.texto;
  assert.equal(piezas(t)['hook-arranque'], 'propia');
  const ls = t.split('\n');
  const i = ls.indexOf('# arranque: tu .claude/hooks/session-start.cjs tiene el nombre del hook del kit y es otro — el settings del kit lo corre igual y el /inicio no encuentra su huella');
  assert.ok(i > 0, t);
  assert.equal(ls[i + 1], '#   lo que hacía: el arranque de arti: inyecta el handoff de arti-docs · y el TODO, sin el kit');
  assert.equal(ls[i + 2], '#   lo que lee: arti-docs/SESSION_HANDOFF.md, arti-docs/TODO.md');
  assert.equal(ls[i + 3], '#   lo que quieras conservar, a .claude/hooks/session-start.propio.sh (el del kit lo corre al final, con bash)');
  const d3 = ls.indexOf('# D3 · el arranque:');
  assert.ok(d3 > i, 'el bloque D3, aunque no haya otro SessionStart ni un handoff gordo');
  assert.equal(ls[d3 + 1], '#   (recomendada) el del kit: --aplicar <propuesta> --arranque kit — lo reemplaza por el del kit (.claude/hooks/session-start.cjs, en el commit de las piezas; lo tuyo queda en la historia)');
  assert.match(ls[d3 + 2], /^# {3}\(otra\) sin la opción: queda el tuyo/);
  // el del molde en su lugar: ni la línea ni el D3
  const limpio = mirar(repoBot('arti2')).texto;
  assert.doesNotMatch(limpio, /^# arranque: tu |^# D3 · /m);
});

test('crit. 3 (8r3 i2; rt-9): --aplicar --arranque kit deja el session-start.cjs del molde, la ficha en molde con hash y barreras verde (las piezas antes de la ficha); sin la opción, no se toca', { ...deKit, timeout: 300000 }, async () => {
  const d = repoBot('arti', { arranque: true });
  const prop = propuestaDe(d);
  rol(d);
  const antes = cabeza(d);
  const r = await sinClaude(() => aplicarCon(d, prop, '--arranque', 'kit'));
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  const t = r.lineas.join('\n');
  assert.equal(leer(d, '.claude/hooks/session-start.cjs'), delMolde(d, 'hooks/session-start.cjs'));
  const h = F.leer(leer(d, '.claude/kit.md')).datos.piezas['hook-arranque'];
  assert.equal(h.estado, 'molde');
  assert.equal(h.hash, F.hash(delMolde(d, 'hooks/session-start.cjs')));
  assert.match(t, new RegExp(`^hook-arranque · molde · reemplacé el tuyo \\(D3: kit\\) — lo tuyo queda en la historia: git show ${antes}:\\.claude/hooks/session-start\\.cjs$`, 'm'));
  assert.match(leer(d, 'arti-docs/CHANGELOG.md'), / — D3: kit, el arranque del kit reemplaza el tuyo$/m);
  assert.equal(commitsDeLaLinea(d, r.lineas), 2, 'sin cambio en el settings: no hay tercer commit');
  assert.equal(git(d, 'status', '--porcelain'), '');
  assert.ok(git(d, 'show', '--name-only', '--format=', 'HEAD~1').split('\n').includes('.claude/hooks/session-start.cjs'), 'en el commit de las piezas');
  // el verde: el commit de las piezas va antes del de la ficha (fuera del alcance: la ficha no existía), la ficha por la exención b
  const b = barreras(d, antes);
  assert.equal(b.status, 0, b.stdout + b.stderr);
  assert.equal(git(d, 'show', `${antes}:.claude/hooks/session-start.cjs`), ARRANQUE_PROPIO, 'lo tuyo queda en la historia');
  // sin la opción: el archivo no se toca y queda propia
  const s = repoBot('arti2', { arranque: true });
  const ps = propuestaDe(s);
  rol(s);
  const rs = await sinClaude(() => aplicar(s, ps));
  assert.equal(rs.codigo, 0, rs.lineas.join('\n'));
  assert.equal(leer(s, '.claude/hooks/session-start.cjs'), ARRANQUE_PROPIO);
  assert.equal(F.leer(leer(s, '.claude/kit.md')).datos.piezas['hook-arranque'], 'propia');
  assert.doesNotMatch(rs.lineas.join('\n'), /D3: kit/);
});

test('crit. 5 (8r3 i4; rt-3): la línea después: dice la verdad — con remoto, "solo en este clon, antes del push" y verde en la carpeta tras el push y el --traer; sin remoto, el rojo del primer /cierre; con core.hooksPath en el clon, el pre-commit lo frena', { ...deKit, timeout: 400000 }, async () => {
  const conLista = (pr) => fs.writeFileSync(pr, fs.readFileSync(pr, 'utf8').replace('  datos-reales: no', '  datos-reales: [sqlcmd]'));
  const ver = (lineas) => {
    const t = lineas.filter((l) => l.startsWith('después:')).join('\n');
    assert.doesNotMatch(t, /después del merge/);
    assert.doesNotMatch(t, /cambios aprobar/);
    return t;
  };
  // con remoto (un bare): rojo en el clon, verde en la carpeta después del push y del --traer
  const { p, c } = bareYDos('remoto');
  escribir(c, { 'CLAUDE.md': '# remoto\n', 'docs/SESSION_HANDOFF.md': '# handoff\n' });
  git(c, 'add', '-A');
  git(c, 'commit', '-q', '-m', 'base del método');
  git(c, 'push', '-q', 'origin', 'main');
  git(p, 'pull', '-q');
  const prop = propuestaDe(c);
  conLista(prop);
  const antes = cabeza(c);
  const r = await aplicarCon(c, prop, '--principal', p);
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  const t = ver(r.lineas);
  assert.match(t, /^después: .* da ROJO en el commit de la ficha \(sensible no es de fábrica\): ese rojo es solo en este clon, antes del push: barreras mira origin\/main\.\.HEAD y, pusheado, ningún \/cierre lo vuelve a mirar; un aprobado de después no lo cubre \(el sello va antes del primer commit que toca\) — lo que se decidió queda en el commit y en el renglón del CHANGELOG de la adopción$/m);
  commitsDeLaLinea(c, r.lineas);
  assert.equal(barreras(c, antes).status, 1, 'en el clon, rojo');
  git(c, 'push', '-q', 'origin', 'main');
  const tr = await AD.main([c, '--traer', p]);
  assert.equal(tr.codigo, 0, tr.lineas.join('\n'));
  const enP = spawnSync(process.execPath, [path.join(p, '.claude', 'scripts', 'estructura.cjs'), 'barreras'], { cwd: p, encoding: 'utf8' });
  assert.equal(enP.status, 0, `en la carpeta, verde: ${enP.stdout}${enP.stderr}`);

  // sin remoto (el clon sale de la carpeta, como el Modo A): la línea dice el rojo del primer /cierre, y es verdad
  const s = principalYClon('sinremoto');
  escribir(s.p, { 'CLAUDE.md': '# sinremoto\n', 'docs/SESSION_HANDOFF.md': '# handoff\n' });
  git(s.p, 'add', '-A');
  git(s.p, 'commit', '-q', '-m', 'base del método');
  git(s.c, 'pull', '-q');
  const ps = propuestaDe(s.c);
  conLista(ps);
  const rs = await aplicarCon(s.c, ps, '--principal', s.p);
  assert.equal(rs.codigo, 0, rs.lineas.join('\n'));
  assert.match(ver(rs.lineas), /: sin remoto, ese rojo no queda en el clon: --traer lleva estos commits a tu carpeta y ahí estructura\.cjs todo \(tu primer \/cierre\) da ROJO en ese commit — /);
  commitsDeLaLinea(s.c, rs.lineas);
  const ts = await AD.main([s.c, '--traer', s.p]);
  assert.equal(ts.codigo, 0, ts.lineas.join('\n'));
  const todo = spawnSync(process.execPath, [path.join(s.p, '.claude', 'scripts', 'estructura.cjs'), 'todo'], { cwd: s.p, encoding: 'utf8' });
  assert.equal(todo.status, 1, todo.stdout + todo.stderr);
  assert.match(todo.stdout + todo.stderr, /candado:barreras · el commit [0-9a-f]+ toca .*sensible/);

  // core.hooksPath prendido en el clon (una sesión arrancó ahí): la línea lo dice, y el pre-commit frena el commit de la ficha
  const h = bareYDos('ganchos');
  escribir(h.c, { 'CLAUDE.md': '# ganchos\n' });
  git(h.c, 'add', '-A');
  git(h.c, 'commit', '-q', '-m', 'base');
  const ph = propuestaDe(h.c);
  conLista(ph);
  git(h.c, 'config', 'core.hooksPath', '.githooks');
  const rh = await aplicar(h.c, ph);
  assert.equal(rh.codigo, 0, rh.lineas.join('\n'));
  assert.match(ver(rh.lineas), /; ⚠ en este clon core\.hooksPath apunta a \.githooks \(arrancó una sesión acá\): el pre-commit frena ese commit — el clon de la adopción va sin githooks \(r1-5\): git config --unset core\.hooksPath \(en tu carpeta los prende --traer\)$/m);
  const cmds = rh.lineas.filter((l) => /^ {2}git add /.test(l)).map((l) => l.trim());
  assert.equal(spawnSync(cmds[0], { cwd: h.c, shell: true, encoding: 'utf8' }).status, 0, 'las piezas pasan');
  const fx = spawnSync(cmds[1], { cwd: h.c, shell: true, encoding: 'utf8' });
  assert.notEqual(fx.status, 0, 'el commit de la ficha, frenado');
  assert.match(fx.stdout + fx.stderr, /kit pre-commit: ROJO/);
});

// crit. 6 (8r3 i5) vive acá y no en actualizar.test: necesita un repo adoptado de verdad (las piezas del molde y su ficha).
const ACT = path.join(SCRIPTS, 'actualizar.cjs');
const resolverEn = (d, ...args) => spawnSync(process.execPath, [ACT, 'resolver', '.', ...args], { cwd: d, encoding: 'utf8' });
// Un repo adoptado (los dos commits) con lo propio que dejó en propia, ya en rol humano (el dueño).
async function adoptado(d, extra = []) {
  const prop = propuestaDe(d);
  rol(d);
  const r = await sinClaude(() => aplicarCon(d, prop, ...extra));
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  commitsDeLaLinea(d, r.lineas);
  fs.rmSync(path.join(d, '.kit-rol'));
  assert.equal(git(d, 'status', '--porcelain'), '');
  return d;
}

test('crit. 6 (8r3 i5): resolver … nueva sobre una propia sin informe — director-obrero: los del molde, la ficha en molde, el porqué al CHANGELOG; sin --por, uso; sucia, se niega sin escribir', { ...deKit, timeout: 300000 }, async () => {
  const d = await adoptado(conDirectorPropio('hermes'));
  assert.equal(F.leer(leer(d, '.claude/kit.md')).datos.piezas['director-obrero'], 'propia');
  // sin --por: mal llamado (2), nada escrito
  const sinPor = resolverEn(d, 'director-obrero', 'nueva');
  assert.equal(sinPor.status, 2, sinPor.stdout + sinPor.stderr);
  // con un archivo de la pieza sin commitear: se niega y no escribe nada
  escribir(d, { '.claude/skills/director/SKILL.md': `${DIR_PROPIO}una línea más\n` });
  const ficha0 = leer(d, '.claude/kit.md');
  const sucia = resolverEn(d, 'director-obrero', 'nueva', '--por', 'x');
  assert.equal(sucia.status, 1, sucia.stdout);
  assert.match(sucia.stdout, /^resolver: \.claude\/skills\/director\/SKILL\.md tiene cambios sin commitear: commitealo o descartalo antes de tomar la nueva; no toqué nada$/m);
  assert.equal(leer(d, '.claude/kit.md'), ficha0);
  assert.equal(git(d, 'status', '--porcelain'), ' M .claude/skills/director/SKILL.md\n');
  git(d, 'checkout', '-q', '--', '.');
  // de otra versión del kit: poné al día primero
  const otra = path.join(nuevaCarpeta('kit-otro'), 'kit');
  fs.mkdirSync(path.join(otra, 'kit', 'molde'), { recursive: true });
  fs.writeFileSync(path.join(otra, 'kit', 'VERSION'), '9.9.9\n');
  fs.writeFileSync(path.join(otra, 'kit', 'molde', 'settings.json'), '{}\n');
  const vieja = resolverEn(d, 'director-obrero', 'nueva', '--por', 'x', '--kit', otra);
  assert.equal(vieja.status, 1, vieja.stdout);
  assert.match(vieja.stdout, /^resolver: el molde del kit es 9\.9\.9 y la ficha dice kit: .* — poné al día primero/m);
  assert.equal(git(d, 'status', '--porcelain'), '');
  // la de verdad
  const r = resolverEn(d, 'director-obrero', 'nueva', '--por', 'traer el director del kit');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  for (const rel of ['skills/director/SKILL.md', 'skills/obrero/SKILL.md']) assert.equal(leer(d, `.claude/${rel}`), delMolde(d, rel), rel);
  assert.equal(F.leer(leer(d, '.claude/kit.md')).datos.piezas['director-obrero'], 'molde', 'molde (varios archivos: sin hash, como aplicar)');
  assert.match(leer(d, 'docs/CHANGELOG.md'), /^kit .*: director-obrero propia → molde \(resolver nueva, sin informe\): traer el director del kit$/m);
  assert.doesNotMatch(r.stdout, /toca frenos/, 'director-obrero no es de frenos');
  const commit = r.stdout.split('\n').find((l) => l.startsWith('commit por rutas: '));
  assert.ok(commit, r.stdout);
  assert.equal(spawnSync(commit.slice('commit por rutas: '.length), { cwd: d, shell: true, encoding: 'utf8' }).status, 0);
  assert.equal(git(d, 'status', '--porcelain'), '', 'el commit lleva todo lo que escribió');
});

test('crit. 6 (8r3 i5; rt-7): resolver hook-arranque nueva sobre una propia — la línea da cambios nuevo (con --toca y los ids que pide barreras) → cambios aprobar → el commit; corrido en ese orden, barreras verde; al revés, rojo', { ...deKit, timeout: 400000 }, async () => {
  const paso = (d, l) => {
    const r = spawnSync(l.replace(/^ {2}\d\. /, '').replace(/ {3}\(el id .*$/, ''), { cwd: d, shell: true, encoding: 'utf8' });
    assert.equal(r.status, 0, `${l}\n${r.stdout}${r.stderr}`);
    return r.stdout;
  };
  const d = await adoptado(repoBot('arti', { arranque: true }));
  assert.equal(F.leer(leer(d, '.claude/kit.md')).datos.piezas['hook-arranque'], 'propia');
  const antes = cabeza(d);
  const r = resolverEn(d, 'hook-arranque', 'nueva', '--por', 'el arranque del kit');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const ls = r.stdout.trim().split('\n');
  assert.equal(leer(d, '.claude/hooks/session-start.cjs'), delMolde(d, 'hooks/session-start.cjs'), 'la pieza escrita en el disco');
  const h = F.leer(leer(d, '.claude/kit.md')).datos.piezas['hook-arranque'];
  assert.deepEqual([h.estado, h.hash], ['molde', F.hash(delMolde(d, 'hooks/session-start.cjs'))]);
  assert.match(leer(d, 'arti-docs/CHANGELOG.md'), /^kit .*: hook-arranque propia → molde \(resolver nueva, sin informe\): el arranque del kit$/m, 'en la carpeta de papeles');
  const i = ls.findIndex((l) => l.startsWith('hook-arranque toca frenos (hooks): el sello va ANTES del commit de la pieza'));
  assert.ok(i > 0, r.stdout);
  assert.match(ls[i + 1], /^ {2}1\. node \.claude\/scripts\/cambios\.cjs nuevo --slug kit-hook-arranque --clase 3-barrera --toca hooks --id "hooks:\.claude\/hooks\/session-start\.cjs" --origen "resolver hook-arranque nueva: el arranque del kit" --cuerpo ".*kit-resolver\/hook-arranque\.md"$/);
  assert.match(ls[i + 2], /^ {2}2\. node \.claude\/scripts\/cambios\.cjs aprobar \d{4}-\d{2}-\d{2}-kit-hook-arranque {3}\(el id que dijo el paso 1/);
  assert.match(ls[i + 3], /^ {2}3\. git add -A -- \.claude\/hooks\/session-start\.cjs \.claude\/kit\.md arti-docs\/CHANGELOG\.md && git commit -m "inicio: hook-arranque, nueva \(el arranque del kit\)"$/);
  // el orden, de verdad: con la pieza escrita y sin commitear mientras se propone y se aprueba (el dueño corre aprobar: acá, el script directo)
  paso(d, ls[i + 1]);
  assert.match(git(d, 'status', '--porcelain'), /\.claude\/hooks\/session-start\.cjs/, 'la pieza sigue sin commitear');
  paso(d, ls[i + 2]);
  paso(d, ls[i + 3]);
  assert.equal(git(d, 'status', '--porcelain'), '');
  const b = barreras(d, antes);
  assert.equal(b.status, 0, b.stdout + b.stderr);

  // al revés (el commit de la pieza antes del sello): rojo — un aprobado de después no lo cubre
  const e = await adoptado(repoBot('arti2', { arranque: true }));
  const antesE = cabeza(e);
  const re = resolverEn(e, 'hook-arranque', 'nueva', '--por', 'al revés');
  assert.equal(re.status, 0, re.stdout);
  const le = re.stdout.trim().split('\n');
  const j = le.findIndex((l) => l.startsWith('hook-arranque toca frenos'));
  paso(e, le[j + 3]);
  paso(e, le[j + 1]);
  paso(e, le[j + 2]);
  assert.equal(barreras(e, antesE).status, 1, 'el sello después del commit no lo cubre');
});
