'use strict';
// actualizar.test.cjs — aplicar y la CLI (SPEC-paquete-6 P7.1, criterio 10 y lo de 9 que se prueba con moldes chicos).
// Todo en temporales: moldes sintéticos chicos, repos git con la config de quien corre apagada. Nunca ~/.claude ni ../vibe-kit-pruebas.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const A = require('./actualizar.cjs');
const M = require('./lib/molde.cjs');
const C = require('./lib/catalogo.cjs');
const F = require('../pc/lib/ficha.cjs');
const Z = require('../pc/lib/zona-propia.cjs');

const RAIZ_KIT = path.resolve(__dirname, '..', '..', '..', '..'); // la raíz de vibe-kit (o del worktree)
const T = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-actualizar-test-'));
test.after(() => fs.rmSync(T, { recursive: true, force: true }));
fs.writeFileSync(path.join(T, 'gitconfig-vacio'), '');
Object.assign(process.env, {
  GIT_CONFIG_GLOBAL: path.join(T, 'gitconfig-vacio'), GIT_CONFIG_NOSYSTEM: '1',
  GIT_AUTHOR_NAME: 'prueba', GIT_AUTHOR_EMAIL: 'p@kit.invalid', GIT_COMMITTER_NAME: 'prueba', GIT_COMMITTER_EMAIL: 'p@kit.invalid',
});

let n = 0;
const nuevaCarpeta = (nombre) => {
  const d = path.join(T, `${nombre}-${n++}`);
  fs.mkdirSync(d, { recursive: true });
  return d;
};
function git(cwd, ...args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', windowsHide: true });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout;
}
function escribirArbol(dir, mapa) {
  for (const [rel, t] of Object.entries(mapa)) {
    const p = path.join(dir, ...rel.split('/'));
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, t);
  }
}
const leer = (dir, rel) => {
  const p = path.join(dir, ...rel.split('/'));
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
};
// Una foto del árbol (sin .git): para "no escribió nada".
function foto(dir) {
  const out = {};
  (function rec(d, rel) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name === '.git') continue;
      const q = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) rec(path.join(d, e.name), q);
      else out[q] = fs.readFileSync(path.join(d, e.name), 'utf8');
    }
  })(dir, '');
  return out;
}

// ---------------------------------------------------------------- los moldes sintéticos (forma de kit/molde/)

const hookSS = (extra = []) => ({ SessionStart: [{ matcher: '', hooks: [{ type: 'command', command: 'node', args: ['${CLAUDE_PROJECT_DIR}/.claude/hooks/session-start.cjs'] }] }], ...Object.fromEntries(extra) });
const settings = (o) => `${JSON.stringify(o, null, 2)}\n`;
const MOLDE_V = {
  'settings.json': settings({ permissions: { deny: ['Edit(./.claude/cambios/**)', 'Write(./.claude/cambios/**)'] }, hooks: hookSS() }),
  'hooks/session-start.cjs': '// arranque v1\n',
  'hooks/escritura-docs.cjs': '// escritura v1\n',
  'hooks/lib/util.cjs': '// util v1\n',
  'hooks/lib/viejo.cjs': '// lib que se va\n',
  'scripts/estructura.cjs': '// candado v1\n',
  'scripts/viejo.cjs': '// se va con el molde nuevo\n',
  'skills/inicio/SKILL.md': '# inicio de {{PROYECTO}} v1\n<!-- kit:propio -->\n<!-- /kit:propio -->\nfin\n',
  'skills/cierre/SKILL.md': '# cierre v1\n',
  'skills/estado/SKILL.md': '# estado v1\n',
  'docs/CHANGELOG.md': '# CHANGELOG — {{PROYECTO}}\n\n> historia\n\n## {{YYYY-MM-DD}} — nacimiento\n',
  'docs/TODO.md': '# TODO v1\n',
  'gitignore.snippet': '/.kit-noche\n',
  'CLAUDE.md': '# {{PROYECTO}} v1\n',
};
const MOLDE_N = {
  ...MOLDE_V,
  'settings.json': settings({ permissions: { deny: ['Edit(./.claude/cambios/**)'] }, hooks: hookSS([['PreToolUse', [{ matcher: 'Write', hooks: [{ type: 'command', command: 'node', args: ['${CLAUDE_PROJECT_DIR}/.claude/hooks/escritura-docs.cjs'] }] }]]]) }),
  'hooks/session-start.cjs': '// arranque v2\n',
  'hooks/escritura-docs.cjs': '// escritura v2\n',
  'hooks/git-seguro.cjs': '// git-seguro, pieza nueva\n',
  'hooks/lib/util.cjs': '// util v2\n',
  'hooks/lib/nuevo.cjs': '// lib nueva\n',
  'hooks/lib/util.test.cjs': '// la prueba del molde: no viaja al proyecto, sí al molde materializado (chequear 7)\n',
  'skills/inicio/SKILL.md': '# inicio de {{PROYECTO}} v2\n<!-- kit:propio -->\n<!-- /kit:propio -->\nfin v2\n',
  'skills/cierre/SKILL.md': '# cierre v2\n',
  'skills/director/SKILL.md': '# director (opcional nuevo)\n',
  'docs/TODO.md': '# TODO v2\n',
  'docs/MAPA.md': '# MAPA de {{PROYECTO}}: {{APP}}\n',
  'gitignore.snippet': '/.kit-noche\n/.claude/paquetes/\n',
  'CLAUDE.md': '# {{PROYECTO}} v2\n',
};
delete MOLDE_N['scripts/viejo.cjs'];
delete MOLDE_N['hooks/lib/viejo.cjs'];
delete MOLDE_N['skills/estado/SKILL.md'];

function armarKit(molde, version = '3.0.0') {
  const d = nuevaCarpeta('kit');
  escribirArbol(path.join(d, 'kit', 'molde'), molde);
  fs.writeFileSync(path.join(d, 'kit', 'VERSION'), `${version}\n`);
  return d;
}
const KIT = armarKit(MOLDE_N);
const VIEJO = armarKit(MOLDE_V, '2.9.0');

// Un proyecto como lo dejó el molde viejo: cada archivo en su ruta (catálogo), la ficha con sus hashes, commit, .kit-rol.
function armarProyecto(opciones = {}) {
  const molde = opciones.molde || MOLDE_V;
  const d = nuevaCarpeta('proy');
  const src = nuevaCarpeta('src');
  escribirArbol(path.join(src, 'kit', 'molde'), molde);
  fs.writeFileSync(path.join(src, 'kit', 'VERSION'), '2.9.0\n');
  const mat = M.materializarDir(src, { vars: { proyecto: 'demo' }, fecha: '2026-01-01' });
  const rep = C.repartir(mat.forma, C.rutasDeMolde(mat.dir));
  const archivos = M.archivosDe(mat.dir);
  const piezas = [];
  for (const [id, { pieza, archivos: as }] of rep) {
    if (['nunca', 'no-viaja'].includes(pieza.trato)) continue;
    if (pieza.trato === 'snippet') {
      for (const a of as) fs.appendFileSync(path.join(d, a.proyecto), archivos.get(a.molde));
      continue;
    }
    if (!as.length) continue;
    escribirArbol(d, Object.fromEntries(as.map((a) => [a.proyecto, archivos.get(a.molde)])));
    const est = (opciones.estados || {})[id] || (pieza.trato === 'nacimiento' ? 'molde' : pieza.forma === 'settings' || id === 'inicio' ? 'molde+propio' : 'molde');
    const h = as.length === 1 && pieza.trato === 'pieza' ? (pieza.forma === 'texto' ? Z.hashPieza(archivos.get(as[0].molde)) : F.hash(archivos.get(as[0].molde))) : null;
    piezas.push(`  ${id}: ${h && !/\s/.test(est) ? `{estado: ${est}, hash: ${h}}` : /\s/.test(est) ? `"${est}"` : est}`);
  }
  M.borrar(mat.dir);
  escribirArbol(d, { 'CLAUDE.md': '# demo, el CLAUDE.md del proyecto\n' });
  if (opciones.antes) opciones.antes(d);
  const ficha = opciones.ficha || [
    '---', '# ficha de prueba (comentario que queda)', 'kit: 2.9.0', 'nivel: estandar', 'vars:', '  proyecto: demo', 'piezas:', ...piezas,
    ...(opciones.piezasExtra || []), 'frenos:', '  opcionales: []', ...(opciones.quitados ? ['  quitados:', ...opciones.quitados] : ['  quitados: []']), '---', '', '## Cómo se adaptó', '', '- prosa que no se toca.', '',
  ].join('\n');
  escribirArbol(d, { '.claude/kit.md': ficha });
  git(d, 'init', '-q', '-b', 'main');
  git(d, 'config', 'core.autocrlf', 'false');
  git(d, 'add', '-A');
  git(d, 'commit', '-q', '-m', 'nace');
  if (opciones.rol !== null) fs.writeFileSync(path.join(d, '.kit-rol'), `${opciones.rol || 'actualizador'}\n`);
  if (opciones.excluir !== false) fs.appendFileSync(path.join(d, '.git', 'info', 'exclude'), '.kit-rol\n');
  return d;
}

const aplicar = (d, o = {}) => A.aplicar(d, { kit: KIT, moldeViejo: VIEJO, fecha: '2026-11-02', claude: 'no', ...o });
const lineaDe = (r, id) => r.lineas.find((l) => l.startsWith(`${id} · `));

// ---------------------------------------------------------------- el camino feliz y la segunda corrida

test('aplicar: reemplaza lo intacto, trae lo nuevo, borra la baja intacta; la segunda corrida, todo "sin cambios"', () => {
  const d = armarProyecto();
  const r = aplicar(d);
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  assert.equal(leer(d, '.claude/hooks/session-start.cjs'), '// arranque v2\n');
  assert.match(lineaDe(r, 'hook-arranque'), /reemplazada$/);
  assert.equal(leer(d, '.claude/hooks/git-seguro.cjs'), '// git-seguro, pieza nueva\n');
  assert.match(lineaDe(r, 'hook-git-seguro'), /· nueva$/);
  assert.equal(leer(d, '.claude/hooks/lib/nuevo.cjs'), '// lib nueva\n');
  assert.match(lineaDe(r, 'hooks-lib'), /· reemplazada$/, 'una pieza de varios archivos sin hash: el guardia la ve igual al viejo');
  assert.equal(leer(d, '.claude/hooks/lib/util.cjs'), '// util v2\n');
  assert.equal(leer(d, '.claude/hooks/lib/viejo.cjs'), null, 'la baja de una pieza que sigue, intacta, se borra');
  assert.equal(leer(d, '.claude/scripts/viejo.cjs'), null, 'la baja intacta se borra');
  assert.match(lineaDe(r, 'scripts'), /retirada/);
  assert.match(lineaDe(r, 'director-obrero'), /^director-obrero · no · nueva$/, 'opcional nueva: se anota no, no se trae');
  assert.equal(leer(d, '.claude/skills/director/SKILL.md'), null);
  assert.equal(leer(d, 'CLAUDE.md'), '# demo, el CLAUDE.md del proyecto\n', 'el CLAUDE.md nunca');
  // la ficha: versión, hashes, lo demás byte a byte
  const f = leer(d, '.claude/kit.md');
  const datos = F.leer(f).datos;
  assert.equal(datos.kit, '3.0.0');
  assert.equal(datos.piezas['hook-arranque'].hash, F.hash('// arranque v2\n'));
  assert.equal(datos.piezas['director-obrero'], 'no');
  assert.ok(f.includes('# ficha de prueba (comentario que queda)\n') && f.endsWith('## Cómo se adaptó\n\n- prosa que no se toca.\n'));
  // el CHANGELOG: un renglón al tope (antes del primer ##)
  const ch = leer(d, 'docs/CHANGELOG.md');
  assert.match(ch, /> historia\n\nkit 2\.9\.0 → 3\.0\.0: piezas [^\n]*hook-arranque[^\n]*\n\n## /);
  // .kit-rol nunca se toca; core.hooksPath no (r1-5)
  assert.equal(spawnSync('git', ['config', '--get', 'core.hooksPath'], { cwd: d }).status, 1);
  git(d, 'add', '-A');
  git(d, 'commit', '-q', '-m', 'kit');
  const r2 = A.aplicar(d, { kit: KIT, fecha: '2026-11-02', claude: 'no' }); // la ficha ya dice 3.0.0: el viejo es el nuevo
  assert.equal(r2.codigo, 0, r2.lineas.join('\n'));
  for (const l of r2.lineas) assert.match(l, /sin cambios$/, `segunda corrida: ${l}`);
  assert.equal(git(d, 'status', '--porcelain'), '');
});

test('aplicar --plan: dice lo mismo y no escribe nada', () => {
  const d = armarProyecto();
  const antes = foto(d);
  const r = aplicar(d, { plan: true });
  assert.equal(r.codigo, 0);
  assert.ok(lineaDe(r, 'hook-arranque').endsWith('reemplazada'));
  assert.match(r.lineas[r.lineas.length - 1], /no escribí nada/);
  assert.deepEqual(foto(d), antes);
});

// ---------------------------------------------------------------- la negativa (1)

test('se niega: carpeta sucia → 1 sin tocar; solo .kit-rol sin trackear (sin exclude) → 0', () => {
  const d = armarProyecto();
  fs.writeFileSync(path.join(d, 'suelto.txt'), 'x');
  const antes = foto(d);
  const r = aplicar(d);
  assert.equal(r.codigo, 1);
  assert.match(r.lineas[0], /no está limpia \(suelto\.txt\)/);
  assert.deepEqual(foto(d), antes);
  const d2 = armarProyecto({ excluir: false }); // .kit-rol aparece como ?? en git status: se ignora exactamente ese
  assert.match(git(d2, 'status', '--porcelain'), /\?\? \.kit-rol/);
  assert.equal(aplicar(d2).codigo, 0);
  const d3 = armarProyecto({ excluir: false });
  fs.writeFileSync(path.join(d3, '.kit-rol2'), 'x'); // otro nombre parecido no se ignora
  assert.equal(aplicar(d3).codigo, 1);
  const d4 = armarProyecto();
  fs.appendFileSync(path.join(d4, 'CLAUDE.md'), 'cambio sin commitear\n');
  assert.equal(aplicar(d4).codigo, 1);
});

test('se niega: sin .kit-rol, o .kit-rol que no dice actualizador → 1 (nunca la carpeta de Guido)', () => {
  for (const rol of [null, 'humano', 'actualizador-no', 'director']) {
    const d = armarProyecto({ rol });
    const antes = foto(d);
    const r = aplicar(d);
    assert.equal(r.codigo, 1, `rol ${rol}`);
    assert.match(r.lineas[0], /\.kit-rol no dice "actualizador"/);
    assert.deepEqual(foto(d), antes);
  }
  const d = armarProyecto({ rol: '  actualizador  ' }); // con espacios alrededor: se recorta
  assert.equal(aplicar(d).codigo, 0);
});

test('se niega: ficha rota, sin ficha, o no es la raíz de un repo → 1 sin tocar', () => {
  const rota = armarProyecto({ ficha: '---\nkit: 2.9.0\nnivel: raro\n---\n' });
  const antes = foto(rota);
  const r = aplicar(rota);
  assert.equal(r.codigo, 1);
  assert.match(r.lineas[0], /la ficha no se lee/);
  assert.deepEqual(foto(rota), antes);
  const sin = armarProyecto();
  git(sin, 'rm', '-q', '.claude/kit.md');
  git(sin, 'commit', '-q', '-m', 'sin ficha');
  assert.match(aplicar(sin).lineas[0], /no tiene ficha/);
  const sub = path.join(armarProyecto(), '.claude');
  assert.match(aplicar(sub).lineas[0], /no es la raíz de un repo/);
  assert.equal(aplicar(nuevaCarpeta('nada')).codigo, 1);
});

test('se niega: settings con JSON roto o con una clave repetida → 1 sin escribir nada', () => {
  for (const malo of ['{ "permissions": ', '{ "a": 1, "a": 2 }\n']) {
    const d = armarProyecto({ antes: (x) => fs.writeFileSync(path.join(x, '.claude', 'settings.json'), malo) });
    const antes = foto(d);
    const r = aplicar(d);
    assert.equal(r.codigo, 1, malo);
    assert.match(r.lineas[0], /settings\.json/);
    assert.deepEqual(foto(d), antes);
  }
});

test('D8b-3 (cambia D6-15): el --kit parado en un tag que no dice lo mismo que kit/VERSION → 1; VERSION = el tag entero (con -rc.N), vale', () => {
  const k = armarKit(MOLDE_N, '3.0.0-rc.1');
  git(k, 'init', '-q', '-b', 'main');
  git(k, 'add', '-A');
  git(k, 'commit', '-q', '-m', 'kit');
  git(k, 'tag', '-a', 'v3.0.0-rc.1', '-m', 'rc');
  const pr = armarProyecto();
  const ok = A.aplicar(pr, { kit: k, moldeViejo: VIEJO, fecha: '2026-11-02', claude: 'no' });
  assert.equal(ok.codigo, 0, ok.lineas.join('\n'));
  assert.equal(F.leer(leer(pr, '.claude/kit.md')).datos.kit, '3.0.0-rc.1');
  git(k, 'tag', '-a', 'v3.1.0', '-m', 'otro');
  const r = A.aplicar(armarProyecto(), { kit: k, moldeViejo: VIEJO, fecha: '2026-11-02', claude: 'no' });
  assert.equal(r.codigo, 1);
  assert.match(r.lineas[0], /no coinciden/);
  // VERSION 3.0.0 (sin el -rc) con el tag rc.1: ya no vale
  const k2 = armarKit(MOLDE_N, '3.0.0');
  git(k2, 'init', '-q', '-b', 'main');
  git(k2, 'add', '-A');
  git(k2, 'commit', '-q', '-m', 'kit');
  git(k2, 'tag', '-a', 'v3.0.0-rc.1', '-m', 'rc');
  const r2 = A.aplicar(armarProyecto(), { kit: k2, moldeViejo: VIEJO, fecha: '2026-11-02', claude: 'no' });
  assert.equal(r2.codigo, 1);
  assert.match(r2.lineas[0], /no coinciden/);
  // una VERSION que no es N.N.N ni N.N.N-rc.N
  const k3 = armarKit(MOLDE_N, '3.0.0-beta.1');
  assert.equal(A.aplicar(armarProyecto(), { kit: k3, moldeViejo: VIEJO, fecha: '2026-11-02', claude: 'no' }).codigo, 1);
});

// ---------------------------------------------------------------- el guardia (D6-7) y r1-3

test('guardia: un hook editado → la pieza entera "adaptada (desvío detectado)", sin tocar; la ficha lo anota con su hash', () => {
  const d = armarProyecto({ antes: (x) => fs.appendFileSync(path.join(x, '.claude', 'hooks', 'session-start.cjs'), '// mío\n') });
  const hViejo = F.leer(leer(d, '.claude/kit.md')).datos.piezas['hook-arranque'].hash;
  const r = aplicar(d);
  assert.equal(r.codigo, 0);
  // el commit que creó el archivo no es un porqué (nacer no es adaptar): sin porqué → "te espera" del proyecto (D6-19)
  assert.match(lineaDe(r, 'hook-arranque'), /^hook-arranque · adaptada \(desvío detectado\) · te espera: sin porqué .* · desvío: no se tocó \(\.claude\/hooks\/session-start\.cjs\)$/);
  assert.equal(leer(d, '.claude/hooks/session-start.cjs'), '// arranque v1\n// mío\n');
  assert.match(leer(d, '.claude/fusiones/hook-arranque.md'), /¿la mejoramos con esto\?/);
  const p = F.leer(leer(d, '.claude/kit.md')).datos.piezas['hook-arranque'];
  assert.deepEqual(p, { estado: 'adaptada (desvío detectado)', hash: hViejo });
  // y la segunda corrida (el mismo molde, sin el tag de la base): el dueño no contestó → sigue esperando, el informe como estaba
  git(d, 'add', '-A');
  git(d, 'commit', '-q', '-m', 'kit');
  const inf = leer(d, '.claude/fusiones/hook-arranque.md');
  const r2 = A.aplicar(d, { kit: KIT, fecha: '2026-11-02', claude: 'no' });
  assert.equal(r2.codigo, 0, r2.lineas.join('\n'));
  assert.match(lineaDe(r2, 'hook-arranque'), /· te espera: todavía espera tu respuesta \(desde el kit [^)]+\); el --kit no tiene el tag v[^:]+: el informe queda como estaba$/);
  assert.equal(leer(d, '.claude/hooks/session-start.cjs'), '// arranque v1\n// mío\n');
  assert.equal(leer(d, '.claude/fusiones/hook-arranque.md'), inf);
});

test('guardia: distinto del molde viejo pero con el hash de la ficha → intacto (se reemplaza); sin hash ni igual → desvío', () => {
  // el proyecto tiene un arranque distinto del molde viejo, pero la ficha trae SU hash (lo escribió un molde anterior)
  const propio = '// arranque que escribió otro molde\n';
  const d = armarProyecto({ antes: (x) => fs.writeFileSync(path.join(x, '.claude', 'hooks', 'session-start.cjs'), propio) });
  const f = leer(d, '.claude/kit.md').replace(/hook-arranque: \{estado: molde, hash: [0-9a-f]{12}\}/, `hook-arranque: {estado: molde, hash: ${F.hash(propio)}}`);
  fs.writeFileSync(path.join(d, '.claude', 'kit.md'), f);
  git(d, 'commit', '-q', '-am', 'hash');
  const r = aplicar(d);
  assert.match(lineaDe(r, 'hook-arranque'), /reemplazada$/);
  assert.equal(leer(d, '.claude/hooks/session-start.cjs'), '// arranque v2\n');
  // una pieza de varios archivos (sin hash): uno distinto del viejo → desvío
  const d2 = armarProyecto({ antes: (x) => fs.appendFileSync(path.join(x, '.claude', 'hooks', 'lib', 'util.cjs'), '// tocado\n') });
  const r2 = aplicar(d2);
  assert.match(lineaDe(r2, 'hooks-lib'), /desvío: no se tocó/);
  assert.equal(leer(d2, '.claude/hooks/lib/nuevo.cjs'), null, 'la pieza en desvío no recibe ni lo nuevo');
  // una pieza de varios archivos con un hash en la ficha: el hash no salva a un archivo editado
  const editado = '// util v1\n// tocado\n';
  const d4 = armarProyecto({ antes: (x) => fs.writeFileSync(path.join(x, '.claude', 'hooks', 'lib', 'util.cjs'), editado) });
  fs.writeFileSync(path.join(d4, '.claude', 'kit.md'), leer(d4, '.claude/kit.md').replace('  hooks-lib: molde', `  hooks-lib: {estado: molde, hash: ${F.hash(editado)}}`));
  git(d4, 'commit', '-q', '-am', 'hash');
  assert.match(lineaDe(aplicar(d4), 'hooks-lib'), /desvío: no se tocó/);
  // un archivo que sigue en la pieza y el proyecto borró → desvío; una baja que el proyecto ya borró → nada que borrar
  const d5 = armarProyecto({ antes: (x) => fs.rmSync(path.join(x, '.claude', 'hooks', 'lib', 'util.cjs')) });
  assert.match(lineaDe(aplicar(d5), 'hooks-lib'), /desvío: no se tocó \(\.claude\/hooks\/lib\/util\.cjs \(falta\)\)/);
  const d6 = armarProyecto({ antes: (x) => fs.rmSync(path.join(x, '.claude', 'hooks', 'lib', 'viejo.cjs')) });
  const r6 = aplicar(d6);
  assert.equal(r6.codigo, 0, r6.lineas.join('\n'));
  assert.match(lineaDe(r6, 'hooks-lib'), /reemplazada$/);
  // CRLF en una pieza sin hash: el guardia compara en LF
  const d7 = armarProyecto({ antes: (x) => fs.writeFileSync(path.join(x, '.claude', 'hooks', 'lib', 'util.cjs'), '// util v1\r\n') });
  assert.match(lineaDe(aplicar(d7), 'hooks-lib'), /reemplazada$/);
  // CRLF en el proyecto no es un desvío (el guardia compara en LF)
  const d3 = armarProyecto({ antes: (x) => fs.writeFileSync(path.join(x, '.claude', 'hooks', 'escritura-docs.cjs'), '// escritura v1\r\n') });
  assert.match(lineaDe(aplicar(d3), 'hook-escritura'), /reemplazada$/);
});

test('r1-3: pieza nueva con la ruta ya ocupada y distinta → desvío sin tocar; ocupada e igual → sin cambios en el archivo', () => {
  const d = armarProyecto({ antes: (x) => escribirArbol(x, { '.claude/hooks/git-seguro.cjs': '// el git-seguro del proyecto\n' }) });
  const r = aplicar(d);
  assert.match(lineaDe(r, 'hook-git-seguro'), /desvío: no se tocó \(\.claude\/hooks\/git-seguro\.cjs \(la ruta ya está ocupada\)\)/);
  assert.equal(leer(d, '.claude/hooks/git-seguro.cjs'), '// el git-seguro del proyecto\n');
  const d2 = armarProyecto({ antes: (x) => escribirArbol(x, { '.claude/hooks/git-seguro.cjs': '// git-seguro, pieza nueva\n' }) });
  const r2 = aplicar(d2);
  assert.match(lineaDe(r2, 'hook-git-seguro'), /· sin cambios$/);
  assert.equal(F.leer(leer(d2, '.claude/kit.md')).datos.piezas['hook-git-seguro'].estado, 'molde');
});

test('molde+propio: la zona propia queda byte a byte y la línea dice "mezclada (zona intacta)"', () => {
  const zona = '  lo mío, con  espacios raros\ty un tab\n\nsegundo párrafo';
  const d = armarProyecto({
    antes: (x) => {
      const p = path.join(x, '.claude', 'skills', 'inicio', 'SKILL.md');
      fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace('<!-- kit:propio -->\n', `<!-- kit:propio -->\n${zona}\n`));
    },
  });
  const r = aplicar(d);
  assert.match(lineaDe(r, 'inicio'), /^inicio · molde\+propio · mezclada \(zona intacta\)$/);
  assert.equal(leer(d, '.claude/skills/inicio/SKILL.md'), `# inicio de demo v2\n<!-- kit:propio -->\n${zona}\n<!-- /kit:propio -->\nfin v2\n`);
  assert.equal(F.leer(leer(d, '.claude/kit.md')).datos.piezas.inicio.hash, Z.hashPieza(leer(d, '.claude/skills/inicio/SKILL.md')));
  // editado FUERA de la zona → desvío
  const d2 = armarProyecto({ antes: (x) => fs.appendFileSync(path.join(x, '.claude', 'skills', 'inicio', 'SKILL.md'), 'agregado afuera\n') });
  assert.match(lineaDe(aplicar(d2), 'inicio'), /desvío: no se tocó/);
});

test('propia y adaptada: no se tocan, y sus bajas no se borran (r1-3)', () => {
  // estado es una pieza que el molde nuevo ya no trae: su archivo es una baja
  for (const est of ['propia', 'adaptada', 'adaptada (desvío detectado)']) {
    const d = armarProyecto({ estados: { estado: est, cierre: est } });
    const r = aplicar(d);
    assert.equal(r.codigo, 0);
    assert.equal(leer(d, '.claude/skills/estado/SKILL.md'), '# estado v1\n', `${est}: la baja no se borra`);
    if (est === 'propia') {
      assert.equal(leer(d, '.claude/skills/cierre/SKILL.md'), '# cierre v1\n', `${est}: no se toca`);
      assert.match(lineaDe(r, 'cierre'), /· propia \(el molde cambió su contrato/);
    } else {
      // D6-19: una adaptada nunca queda vieja; acá lo suyo está igual al molde viejo → el nuevo, sin pedir porqué
      assert.equal(leer(d, '.claude/skills/cierre/SKILL.md'), '# cierre v2\n', `${est}: se pone al día`);
      assert.equal(lineaDe(r, 'cierre'), 'cierre · adaptada · fusionada (sola, el molde no tocó lo adaptado)');
      assert.match(lineaDe(r, 'estado'), / · sin cambios$/, `${est}: la baja de una adaptada no se toca`);
    }
  }
  // la misma baja, de una pieza molde: intacta se borra; editada se deja y se informa
  const d = armarProyecto();
  assert.match(lineaDe(aplicar(d), 'estado'), /^estado · no · retirada$/);
  assert.equal(leer(d, '.claude/skills/estado/SKILL.md'), null);
  const d2 = armarProyecto({ antes: (x) => fs.appendFileSync(path.join(x, '.claude', 'skills', 'estado', 'SKILL.md'), 'mío\n') });
  assert.match(lineaDe(aplicar(d2), 'estado'), /dejada \(editada\): \.claude\/skills\/estado\/SKILL\.md$/);
  assert.equal(leer(d2, '.claude/skills/estado/SKILL.md'), '# estado v1\nmío\n');
});

test('docs: solo el nacimiento — lo que falta nace instanciado; lo existente (editado o no) nunca se toca (r1-2)', () => {
  const d = armarProyecto({ antes: (x) => fs.appendFileSync(path.join(x, 'docs', 'TODO.md'), '- [ ] algo mío\n') });
  const r = aplicar(d);
  assert.equal(leer(d, 'docs/TODO.md'), '# TODO v1\n- [ ] algo mío\n', 'editado: no se toca');
  assert.equal(leer(d, 'docs/MAPA.md'), '# MAPA de demo: [completar: APP]\n', 'nace sin {{ sueltos');
  assert.match(lineaDe(r, 'docs'), /· nueva$/);
  const d2 = armarProyecto();
  aplicar(d2);
  assert.equal(leer(d2, 'docs/TODO.md'), '# TODO v1\n', 'intacto pero distinto del nuevo: tampoco se reemplaza');
  // un docs que el proyecto borró, vuelve a nacer; docs nunca es desvío ni baja
  const d3 = armarProyecto({ antes: (x) => fs.rmSync(path.join(x, 'docs', 'TODO.md')) });
  aplicar(d3);
  assert.equal(leer(d3, 'docs/TODO.md'), '# TODO v2\n');
});

test('settings: las deny con Write(...) del molde viejo se van; lo propio y lo quitado quedan como estaban', () => {
  const propio = settings({
    permissions: { allow: ['Bash(npm test)'], deny: ['Edit(./.claude/cambios/**)', 'Write(./.claude/cambios/**)'] },
    hooks: hookSS(),
  });
  const d = armarProyecto({ antes: (x) => fs.writeFileSync(path.join(x, '.claude', 'settings.json'), propio) });
  const r = aplicar(d);
  assert.match(lineaDe(r, 'settings'), /^settings · molde\+propio · mezclada \(zona intacta\)$/);
  const s = JSON.parse(leer(d, '.claude/settings.json'));
  assert.deepEqual(s.permissions.deny, ['Edit(./.claude/cambios/**)']);
  assert.deepEqual(s.permissions.allow, ['Bash(npm test)']);
  assert.ok(s.hooks.PreToolUse, 'lo nuevo del molde entra');
  // un freno quitado no vuelve: ni el PreToolUse nuevo (quitado de antemano) ni la deny que el proyecto sacó
  const d2 = armarProyecto({
    quitados: [
      '    - {id: "hook:PreToolUse/Write/node ${CLAUDE_PROJECT_DIR}/.claude/hooks/escritura-docs.cjs", por: prueba, hasta: siempre}',
      '    - {id: "deny:Edit(./.claude/cambios/**)", por: prueba, hasta: siempre}',
    ],
    antes: (x) => fs.writeFileSync(path.join(x, '.claude', 'settings.json'), settings({ permissions: { deny: ['Write(./.claude/cambios/**)'] }, hooks: hookSS() })),
  });
  const r2 = aplicar(d2);
  assert.equal(r2.codigo, 0, r2.lineas.join('\n'));
  const s2 = JSON.parse(leer(d2, '.claude/settings.json'));
  assert.equal(s2.hooks.PreToolUse, undefined);
  assert.deepEqual(s2.permissions.deny || [], []);
});

test('snippets: suma lo que falta renglón por renglón, sin duplicar', () => {
  const d = armarProyecto({ antes: (x) => fs.appendFileSync(path.join(x, '.gitignore'), 'node_modules\n') });
  aplicar(d);
  assert.equal(leer(d, '.gitignore'), '/.kit-noche\nnode_modules\n/.claude/paquetes/\n');
});

// ---------------------------------------------------------------- la escritura atómica (E §6.4)

test('un error inyectado a mitad del plan → ningún archivo a medias (cada uno, el viejo o el nuevo entero); la otra corrida termina', () => {
  const d = armarProyecto();
  const antes = foto(d);
  const plan = A.planear(d, { kit: KIT, moldeViejo: VIEJO, fecha: '2026-11-02' });
  const ops = new Map(plan.ops);
  M.borrar(plan.tmp);
  assert.ok(ops.size > 6);
  let renombres = 0;
  const io = {
    ...fs,
    writeFileSync: (p, t) => {
      if (renombres === 3) {
        fs.writeFileSync(p, String(t).slice(0, 3)); // el temporal queda a medias…
        throw Object.assign(new Error('disco lleno'), { code: 'ENOSPC' });
      }
      return fs.writeFileSync(p, t);
    },
    renameSync: (a, b) => {
      renombres++;
      return fs.renameSync(a, b);
    },
  };
  const r = aplicar(d, { io });
  assert.equal(r.codigo, 1);
  assert.match(r.lineas[r.lineas.length - 1], /cada archivo quedó entero/);
  const despues = foto(d);
  for (const [rel, texto] of ops) {
    const ahora = despues[rel];
    const ok = texto === null ? ahora === undefined || ahora === antes[rel] : ahora === texto || ahora === antes[rel];
    assert.ok(ok, `${rel} quedó a medias`);
  }
  assert.deepEqual(Object.keys(despues).filter((k) => /kit-tmp/.test(k)), [], '…pero se borra: no queda ningún temporal');
  assert.equal(despues['.claude/kit.md'], antes['.claude/kit.md'], 'la ficha, la última: no cambió');
  // la siguiente corrida (sin el error) completa, y la de después no tiene nada
  git(d, 'add', '-A');
  git(d, 'commit', '-q', '-m', 'a medias');
  const r2 = aplicar(d);
  assert.equal(r2.codigo, 0);
  assert.deepEqual(r2.lineas.filter((l) => /desvío/.test(l)), [], 'lo que ya quedó como el nuevo no es desvío');
  assert.equal(foto(d)['.claude/hooks/lib/nuevo.cjs'], '// lib nueva\n');
  assert.equal(foto(d)['.claude/hooks/lib/util.cjs'], '// util v2\n');
});

test('RF-6: tras un corte a mitad, el mensaje dice cómo limpiar el clon; con eso (sin commitear) la otra corrida termina y .kit-rol queda', () => {
  const d = armarProyecto();
  let renombres = 0;
  const io = {
    ...fs,
    renameSync: (a, b) => {
      if (++renombres === 3) throw Object.assign(new Error('disco lleno'), { code: 'ENOSPC' });
      return fs.renameSync(a, b);
    },
  };
  const r = aplicar(d, { io });
  assert.equal(r.codigo, 1);
  const ultima = r.lineas[r.lineas.length - 1];
  assert.match(ultima, /Es el clon del actualizador: `git checkout -- \. && git clean -fd` \(deja \.kit-rol, que está en \.git\/info\/exclude\) y corré de nuevo$/);
  // no: así como quedó, se niega (sucia)
  const sucia = aplicar(d);
  assert.equal(sucia.codigo, 1);
  assert.match(sucia.lineas[0], /no está limpia/);
  // sí: el camino del mensaje, sin commitear
  git(d, 'checkout', '--', '.');
  git(d, 'clean', '-fd');
  assert.equal(leer(d, '.kit-rol'), 'actualizador\n');
  const r2 = aplicar(d);
  assert.equal(r2.codigo, 0, r2.lineas.join('\n'));
  assert.equal(leer(d, '.claude/hooks/lib/util.cjs'), '// util v2\n');
});

// RF-1: sin --molde-viejo el molde viejo sale del tag v<ficha>. Un kit con historia: v2.9.0 (el viejo) y encima 3.0.0 (el nuevo).
function kitConHistoria() {
  const k = nuevaCarpeta('kit-hist');
  escribirArbol(path.join(k, 'kit', 'molde'), MOLDE_V);
  fs.writeFileSync(path.join(k, 'kit', 'VERSION'), '2.9.0\n');
  git(k, 'init', '-q', '-b', 'main');
  git(k, 'config', 'core.autocrlf', 'false');
  git(k, 'add', '-A');
  git(k, 'commit', '-q', '-m', 'v2.9.0');
  git(k, 'tag', '-a', 'v2.9.0', '-m', 'v2.9.0');
  fs.rmSync(path.join(k, 'kit', 'molde'), { recursive: true });
  escribirArbol(path.join(k, 'kit', 'molde'), MOLDE_N);
  fs.writeFileSync(path.join(k, 'kit', 'VERSION'), '3.0.0\n');
  git(k, 'add', '-A');
  git(k, 'commit', '-q', '-m', '3.0.0');
  return k;
}
const clonar = (origen, ...extra) => {
  const d = path.join(T, `clon-${n++}`);
  git(T, 'clone', '-q', ...extra, `file://${process.platform === 'win32' ? '/' : ''}${origen.replace(/\\/g, '/')}`, d);
  return d;
};

test('RF-1: sin --molde-viejo, un --kit shallow o sin el tag de la ficha → 1 con la línea del fetch (no "actualizador roto"); completo, anda', async () => {
  const origen = kitConHistoria();
  const raso = clonar(origen, '--depth', '1');
  const d = armarProyecto();
  const antes = foto(d);
  const r = A.aplicar(d, { kit: raso, fecha: '2026-11-02', claude: 'no' });
  assert.equal(r.codigo, 1);
  assert.match(r.lineas[0], /^aplicar: el --kit es un clon sin historia \(shallow\) y no tiene el tag v2\.9\.0 .*`git -C .* fetch --unshallow --tags`/);
  assert.doesNotMatch(r.lineas.join('\n'), /actualizador roto/);
  assert.deepEqual(foto(d), antes);
  // chequear, igual: NO VERIFICADO con la línea, no "actualizador roto"
  const c = await A.chequear(d, { kit: raso, base: 'HEAD', fecha: '2026-11-02' });
  assert.equal(c.codigo, 1);
  assert.match(c.lineas[0], /^chequear: el --kit es un clon sin historia.*fetch --unshallow --tags/);
  assert.equal(c.lineas[1], 'NO VERIFICADO');
  // un clon completo sin tags → la línea de traer los tags
  const sinTags = clonar(origen, '--no-tags');
  const s = A.aplicar(d, { kit: sinTags, fecha: '2026-11-02', claude: 'no' });
  assert.equal(s.codigo, 1);
  assert.match(s.lineas[0], /^aplicar: el --kit no tiene el tag v2\.9\.0 \(el de la ficha\): completalo con `git -C .* fetch --tags`/);
  // sí: completo (con historia y tags) → aplica
  git(raso, 'fetch', '-q', '--unshallow', '--tags');
  const ok = A.aplicar(d, { kit: raso, fecha: '2026-11-02', claude: 'no' });
  assert.equal(ok.codigo, 0, ok.lineas.join('\n'));
  assert.equal(leer(d, '.claude/hooks/session-start.cjs'), '// arranque v2\n');
});

test('el renombre reintenta ante EBUSY/EPERM (3 veces) y después se rinde', () => {
  const d = armarProyecto();
  let fallas = 0;
  const io = { ...fs, renameSync: (a, b) => (fallas++ < 2 ? (() => { throw Object.assign(new Error('ocupado'), { code: 'EBUSY' }); })() : fs.renameSync(a, b)) };
  assert.equal(aplicar(d, { io }).codigo, 0);
  const d2 = armarProyecto();
  const siempre = { ...fs, renameSync: () => { throw Object.assign(new Error('ocupado'), { code: 'EPERM' }); } };
  assert.equal(aplicar(d2, { io: siempre }).codigo, 1);
});

// ---------------------------------------------------------------- el catálogo desde aplicar

test('una ruta del molde nuevo sin pieza en el catálogo → 1 sin escribir (nada se reparte sin dueño)', () => {
  const k = armarKit({ ...MOLDE_N, 'hooks/raro.cjs': '// sin dueño\n' });
  const d = armarProyecto();
  const antes = foto(d);
  const r = A.aplicar(d, { kit: k, moldeViejo: VIEJO, fecha: '2026-11-02', claude: 'no' });
  assert.equal(r.codigo, 1);
  assert.match(r.lineas[0], /sin pieza en el catálogo: hooks\/raro\.cjs/);
  assert.deepEqual(foto(d), antes);
});

// ---------------------------------------------------------------- reescribirFicha

test('reescribirFicha: cambia solo el renglón kit: y las piezas dichas; comentarios, CRLF y prosa quedan', () => {
  const t = '---\r\nkit: 1.0.0   # la versión\r\nnivel: liviano\r\npiezas:\r\n  inicio: {estado: molde, hash: aaaaaaaaaaaa}  # nota\r\n  smoke:\r\n    estado: propia\r\n  # un comentario adentro\r\nfrenos:\r\n  quitados: []\r\n---\r\n\r\nprosa\r\n';
  const out = A.reescribirFicha(t, '2.0.0', new Map([['inicio', '{estado: molde+propio, hash: bbbbbbbbbbbb}'], ['smoke', 'no'], ['nueva', 'molde']]));
  assert.equal(out, '---\r\nkit: 2.0.0   # la versión\r\nnivel: liviano\r\npiezas:\r\n  inicio: {estado: molde+propio, hash: bbbbbbbbbbbb}  # nota\r\n  smoke: no\r\n  nueva: molde\r\n  # un comentario adentro\r\nfrenos:\r\n  quitados: []\r\n---\r\n\r\nprosa\r\n');
  const sinPiezas = A.reescribirFicha('---\nkit: 1.0.0\nnivel: liviano\n---\n', null, new Map([['docs', 'molde']]));
  assert.equal(sinPiezas, '---\nkit: 1.0.0\nnivel: liviano\npiezas:\n  docs: molde\n---\n');
});

// ---------------------------------------------------------------- crit. 10: el molde de D2.2 y barreras --molde --molde-viejo

test('un proyecto con el molde de D2.2 (deny Write(...)): con --molde-viejo las Write se van y barreras --molde --molde-viejo da verde', { timeout: 120000 }, () => {
  const real = path.join(RAIZ_KIT, 'kit', 'molde');
  if (!fs.existsSync(path.join(real, 'settings.json'))) return; // instalado en ~/.claude no hay molde: esta prueba es del kit
  // el molde viejo = el real con las deny Write(...) que traía el de D2.2 (pendiente de W0)
  const viejo = nuevaCarpeta('d22');
  fs.cpSync(real, path.join(viejo, 'kit', 'molde'), { recursive: true });
  const sp = path.join(viejo, 'kit', 'molde', 'settings.json');
  const s = JSON.parse(fs.readFileSync(sp, 'utf8'));
  s.permissions.deny.push('Write(./.claude/cambios/**)', 'Write(./.claude/revisiones/**)');
  fs.writeFileSync(sp, `${JSON.stringify(s, null, 2)}\n`);
  const molde = M.archivosDe(M.materializarDir(viejo, { vars: { proyecto: 'demo' } }).dir);
  const d = armarProyecto({ molde: Object.fromEntries(molde) });
  const base = git(d, 'rev-parse', 'HEAD').trim();
  const r = A.aplicar(d, { kit: RAIZ_KIT, moldeViejo: viejo, fecha: '2026-11-02', claude: 'no' });
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  const deny = JSON.parse(leer(d, '.claude/settings.json')).permissions.deny;
  assert.ok(!deny.some((x) => x.startsWith('Write(')), deny.join(', '));
  assert.ok(deny.includes('Edit(./.claude/cambios/**)'));
  git(d, 'add', '-A');
  git(d, 'commit', '-q', '-m', 'kit al día');
  const mN = M.materializarNuevo(RAIZ_KIT, { vars: { proyecto: 'demo' }, fecha: '2026-11-02' });
  const mV = M.materializarDir(viejo, { vars: { proyecto: 'demo' }, fecha: '2026-11-02' });
  const corre = (extra) => spawnSync(process.execPath, [path.join(d, '.claude', 'scripts', 'estructura.cjs'), 'barreras', '--rango', `${base}..HEAD`, '--molde', mN.dir, ...extra, '--sin-log'], { cwd: d, encoding: 'utf8' });
  const b = corre(['--molde-viejo', mV.dir]);
  assert.equal(b.status, 0, b.stdout + b.stderr);
  const sinViejo = corre([]); // sin el molde viejo, la Write que se fue no se distingue de una propia borrada: rojo
  assert.equal(sinViejo.status, 1, sinViejo.stdout);
  M.borrar(mN.dir);
  M.borrar(mV.dir);
});

// ---------------------------------------------------------------- chequear: la CLI llama a lib/chequeo.cjs (de E4)

// Una copia de los scripts en un temporal, con o sin un chequeo.cjs de mentira (nunca se crea el de verdad).
function copiaScripts(chequeo) {
  const d = nuevaCarpeta('eq');
  fs.cpSync(path.join(__dirname, '..', 'pc', 'lib'), path.join(d, 'pc', 'lib'), { recursive: true });
  fs.mkdirSync(path.join(d, 'scripts', 'lib'), { recursive: true });
  fs.copyFileSync(path.join(__dirname, 'actualizar.cjs'), path.join(d, 'scripts', 'actualizar.cjs'));
  for (const f of ['catalogo.cjs', 'molde.cjs', 'fusion.cjs', 'cubiertos.cjs']) fs.copyFileSync(path.join(__dirname, 'lib', f), path.join(d, 'scripts', 'lib', f));
  if (chequeo) fs.writeFileSync(path.join(d, 'scripts', 'lib', 'chequeo.cjs'), chequeo);
  return path.join(d, 'scripts', 'actualizar.cjs');
}
const correr = (script, args) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', cwd: T });

test('chequear sin lib/chequeo.cjs → 1, "actualizador roto: corré doctor" y NO VERIFICADO', () => {
  const d = armarProyecto();
  const r = correr(copiaScripts(null), ['chequear', d, '--kit', KIT, '--base', 'HEAD', '--molde-viejo', VIEJO]);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /^actualizador roto: corré doctor/);
  assert.match(r.stdout, /NO VERIFICADO/);
});

test('chequear llama a chequear(carpeta, {moldeNuevo, moldeViejo, base, plazoMs}) y sale 0/1 según ok', () => {
  const stub = (ok) => `'use strict';
const fs = require('fs'), path = require('path');
exports.chequear = async (carpeta, o) => {
  const visto = [fs.existsSync(path.join(o.moldeNuevo, 'settings.json')), fs.existsSync(path.join(o.moldeViejo, 'settings.json')), o.base, o.plazoMs, fs.existsSync(path.join(carpeta, '.claude', 'kit.md')), o.version, fs.existsSync(path.join(o.moldeNuevo, 'hooks', 'lib', 'util.test.cjs'))];
  return { lineas: ['1. llaves · ${ok ? '✅' : '❌'} · ' + JSON.stringify(visto)], ok: ${ok}, noVerificado: false };
};`;
  const d = armarProyecto();
  const base = git(d, 'rev-parse', 'HEAD').trim();
  const r = correr(copiaScripts(stub(true)), ['chequear', d, '--kit', KIT, '--base', base, '--molde-viejo', VIEJO, '--plazo', '2']);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(r.stdout, `1. llaves · ✅ · ${JSON.stringify([true, true, base, 120000, true, '3.0.0', true])}\n`);
  const r2 = correr(copiaScripts(stub(false)), ['chequear', d, '--kit', KIT, '--base', base, '--molde-viejo', VIEJO]);
  assert.equal(r2.status, 1);
  assert.match(r2.stdout, /❌/);
  assert.match(r2.stdout, /1800000/, 'el plazo por defecto: 30 min');
  const tira = correr(copiaScripts("exports.chequear = () => { throw new Error('se rompió'); };"), ['chequear', d, '--kit', KIT, '--base', base, '--molde-viejo', VIEJO]);
  assert.equal(tira.status, 1);
  assert.match(tira.stdout, /^actualizador roto: corré doctor \(se rompió\)\nNO VERIFICADO\n$/);
});

test('la CLI: sin subcomando, sin --kit, banderas desconocidas o --base en aplicar → 2 con el USO; aplicar por la CLI anda', () => {
  const s = copiaScripts(null);
  for (const args of [[], ['aplicar'], ['aplicar', 'x'], ['otra', 'x', '--kit', 'k'], ['aplicar', 'x', '--kit', 'k', '--raro'], ['aplicar', 'x', '--kit', 'k', '--base', 'h'], ['chequear', 'x', '--kit', 'k'], ['chequear', 'x', '--kit', 'k', '--base', 'h', '--plazo', 'cero'], ['aplicar', 'x', '--kit']]) {
    const r = correr(s, args);
    assert.equal(r.status, 2, args.join(' '));
    assert.match(r.stderr, /^uso: node actualizar\.cjs aplicar/);
  }
  const d = armarProyecto();
  const r = correr(s, ['aplicar', d, '--kit', KIT, '--molde-viejo', VIEJO, '--plan', '--fecha', '2026-11-02']);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^settings · molde\+propio · mezclada/m);
  const neg = correr(s, ['aplicar', armarProyecto({ rol: null }), '--kit', KIT, '--molde-viejo', VIEJO]);
  assert.equal(neg.status, 1);
  assert.match(neg.stdout, /^aplicar: \.kit-rol no dice/);
});

test('sin bypass: el actualizador no nombra bypassPermissions', () => {
  for (const f of ['actualizar.cjs', 'lib/catalogo.cjs', 'lib/molde.cjs']) assert.ok(!fs.readFileSync(path.join(__dirname, f), 'utf8').includes('bypassPermissions'), f);
});

// ---------------------------------------------------------------- el cierre del ciclo: subio-al-kit (SPEC-paquete-7 P6.8b-1, crit. 2)

const CA = require('../pc/lib/cambios.cjs');
const CLI_CAMBIOS = require(path.join(RAIZ_KIT, 'kit', 'molde', 'scripts', 'cambios.cjs'));
const INICIO = '.claude/skills/inicio/SKILL.md';
const INICIO_V2_VACIO = '# inicio de demo v2\n<!-- kit:propio -->\n<!-- /kit:propio -->\nfin v2\n';
const CUERPO_CAMBIO = '## Caso de origen\nel cierre se olvidaba del handoff (2026-10)\n\n## Regla\nel inicio relee el handoff\n\n## Dónde vive\n.claude/skills/inicio/SKILL.md\n\n## Medición\n| antes | después |\n';
const STASH = '{id: deny:Bash(git stash:*), por: "el release lo usa", hasta: siempre}';

// El CLI de cambios del molde, en proceso, sobre el proyecto d. → la salida (falla si no sale 0).
function cambios(d, ...args) {
  let out = '';
  const codigo = CLI_CAMBIOS.main(args, { cwd: d, salida: (s) => (out += s), error: (s) => (out += s), entradaEstandar: () => CUERPO_CAMBIO });
  assert.equal(codigo, 0, `cambios ${args.join(' ')}: ${out}`);
  return out;
}
function commitear(d, archivos, mensaje = 'c') {
  escribirArbol(d, archivos);
  git(d, 'add', '-A');
  git(d, 'commit', '-q', '-m', mensaje);
  return git(d, 'rev-parse', 'HEAD').trim();
}
const conZona = (texto, propio) => texto.replace(/<!-- kit:propio -->\n[\s\S]*?<!-- \/kit:propio -->/, `<!-- kit:propio -->\n${propio}\n<!-- /kit:propio -->`);
const relCambio = (id) => `.claude/cambios/${id}.md`;

// Un cambio aplicado sobre el proyecto d: lo propone (clase 2, o 3-barrera de frenos con su sello), lo aplica en un commit que
// escribe `propio` en la zona de `archivo` y lo anota con --aplico. → id. o: { slug, cita, barrera, archivo, propio }
function aplicarCambio(d, o = {}) {
  const archivo = o.archivo || INICIO;
  fs.rmSync(path.join(d, '.kit-rol'), { force: true }); // aprobar se niega con el rol del actualizador
  const args = ['nuevo', '--slug', o.slug || 'relee-handoff', '--clase', o.barrera ? '3-barrera' : '2', '--toca', o.barrera ? 'frenos' : 'inicio'];
  if (o.barrera) args.push('--id', 'deny:Bash(git stash:*)');
  args.push(...(o.cita ? ['--cita', o.cita] : ['--origen', 'lo vio el director']));
  const id = /propuesto (\S+)/.exec(cambios(d, ...args))[1];
  if (o.barrera) cambios(d, 'aprobar', id);
  const actual = leer(d, archivo) || '# notas\n<!-- kit:propio -->\n<!-- /kit:propio -->\n';
  const extra = o.barrera ? { '.claude/kit.md': leer(d, '.claude/kit.md').replace('  quitados: []', `  quitados:\n    - ${STASH}`) } : {};
  const sha = commitear(d, { [archivo]: conZona(actual, o.propio || 'releer el handoff antes de tocar nada'), ...extra }, `aplica ${id}`);
  cambios(d, 'anotar-sha', id, sha, '--aplico', archivo);
  commitear(d, {}, `cambios: aplicado ${id}`);
  fs.writeFileSync(path.join(d, '.kit-rol'), 'actualizador\n');
  return id;
}
// Un kit (el molde nuevo de siempre, 3.0.0) con su kit/cubiertos.md: entradas [{cita, version, pieza}], o null = sin el archivo.
function kitConCubiertos(entradas, version = '3.0.0', molde = MOLDE_N) {
  const k = armarKit(molde, version);
  if (entradas !== null) {
    const l = entradas.length ? ['cubiertos:', ...entradas.map((e) => `  - {cita: "${e.cita}", version: ${e.version || '3.0.0'}, pieza: ${e.pieza || 'inicio'}}`)] : ['cubiertos: []'];
    escribirArbol(k, { 'kit/cubiertos.md': ['---', '# lo que el kit cubre', ...l, '---', ''].join('\n') });
  }
  return k;
}
const estadoDe = (d, id) => CA.leer(leer(d, relCambio(id))).datos;
const lineaCiclo = (r, id) => r.lineas.find((l) => l.includes(` · ${id}`));

test('crit. 2: cubiertos.md nombra un cambio clase 2 por su id → subio-al-kit con la versión del kit nuevo y su zona vacía; verificar verde', () => {
  const d = armarProyecto();
  const id = aplicarCambio(d);
  const antes = leer(d, relCambio(id));
  const r = aplicar(d, { kit: kitConCubiertos([{ cita: `demo ${id}`, version: '2.10.0' }]) }); // 2.10.0 ≤ 3.0.0, numérico
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  assert.equal(lineaDe(r, 'inicio'), 'inicio · molde+propio · mezclada (zona intacta)');
  assert.equal(lineaCiclo(r, id), `subió al kit · ${id} · zona retirada`);
  const dd = estadoDe(d, id);
  assert.equal(dd.estado, 'subio-al-kit');
  assert.equal(dd.version, '3.0.0', 'la del kit nuevo, no la de cubiertos.md');
  const da = CA.leer(antes).datos;
  for (const k of ['sha', 'aplico', 'origen', 'clase']) assert.deepEqual(dd[k], da[k], k);
  assert.equal(leer(d, INICIO), INICIO_V2_VACIO, 'la zona vacía, las marcas quedan');
  commitear(d, {}, 'kit');
  assert.deepEqual(CA.verificar(d), []);
  // la segunda corrida: ya es subio-al-kit, nada que decir
  const r2 = aplicar(d, { kit: kitConCubiertos([{ cita: `demo ${id}` }]) });
  assert.equal(lineaCiclo(r2, id), undefined, r2.lineas.join('\n'));
});

test('crit. 2: por la cita del cambio (no por su id) también sube; una versión de cubiertos.md mayor que la del kit (numérica) no', () => {
  const d = armarProyecto();
  const id = aplicarCambio(d, { cita: 'hub 2026-09-01-relee-handoff' });
  const r = aplicar(d, { kit: kitConCubiertos([{ cita: 'hub 2026-09-01-relee-handoff' }]) });
  assert.equal(lineaCiclo(r, id), `subió al kit · ${id} · zona retirada`, r.lineas.join('\n'));
  assert.equal(estadoDe(d, id).estado, 'subio-al-kit');
  assert.equal(leer(d, INICIO), INICIO_V2_VACIO);
  const e = armarProyecto();
  const id2 = aplicarCambio(e);
  const r2 = aplicar(e, { kit: kitConCubiertos([{ cita: `demo ${id2}`, version: '10.0.0' }]) }); // como texto, '10.0.0' < '3.0.0'
  assert.equal(lineaCiclo(r2, id2), undefined);
  assert.equal(estadoDe(e, id2).estado, 'aplicado');
  // el cruce es por id o cita, nunca por texto: otro alias no casa
  const r3 = aplicar(e, { kit: kitConCubiertos([{ cita: `otro ${id2}` }]) });
  assert.equal(lineaCiclo(r3, id2), undefined);
});

// Cada razón para que la zona quede: el cambio sube igual (salvo verificar rojo), la zona no se toca y la línea lo dice.
function queda(d, id, razon, entrada = {}) {
  const r = aplicar(d, { kit: kitConCubiertos([{ cita: `demo ${id}`, ...entrada }]) });
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  assert.equal(lineaCiclo(r, id), `subió al kit · ${id} · ${razon}`, r.lineas.join('\n'));
  assert.equal(estadoDe(d, id).estado, 'subio-al-kit');
  return r;
}

test('crit. 2, queda (e): la zona editada después del cambio → "zona editada, queda"', () => {
  const d = armarProyecto();
  const id = aplicarCambio(d);
  commitear(d, { [INICIO]: conZona(leer(d, INICIO), 'releer el handoff antes de tocar nada\ny algo que agregué después') });
  queda(d, id, 'zona editada, queda');
  assert.match(leer(d, INICIO), /y algo que agregué después/);
});

test('crit. 2, queda (d): la zona ya traía algo propio antes del cambio → "zona compartida, queda"', () => {
  const d = armarProyecto({ antes: (x) => fs.writeFileSync(path.join(x, ...INICIO.split('/')), conZona(fs.readFileSync(path.join(x, ...INICIO.split('/')), 'utf8'), 'lo de antes')) });
  const id = aplicarCambio(d, { propio: 'lo de antes\nreleer el handoff' });
  queda(d, id, 'zona compartida, queda');
  assert.match(leer(d, INICIO), /lo de antes\nreleer el handoff/);
});

test('crit. 2, queda (d): dos cambios vivos en el mismo archivo → "zona compartida, queda"', () => {
  const d = armarProyecto();
  const id = aplicarCambio(d);
  aplicarCambio(d, { slug: 'otra-regla', propio: 'releer el handoff antes de tocar nada\notra regla' });
  queda(d, id, 'zona compartida, queda');
  assert.match(leer(d, INICIO), /otra regla/);
});

test('(d): otro cambio del mismo archivo que ya subió al kit (o rechazado) no la comparte → se retira', () => {
  const d = armarProyecto();
  const viejo = aplicarCambio(d, { slug: 'regla-vieja', propio: 'la regla vieja' });
  const rechazado = aplicarCambio(d, { slug: 'regla-rechazada', propio: 'la regla rechazada' });
  fs.rmSync(path.join(d, '.kit-rol'));
  cambios(d, 'subio-al-kit', viejo, '2.9.0');
  // un rechazado escrito a mano que conserva su aplico (el script lo saca): igual no cuenta
  commitear(d, {
    [relCambio(rechazado)]: CA.ponerCampos(leer(d, relCambio(rechazado)), { estado: 'rechazado', motivo: '"no va"' }),
    [INICIO]: conZona(leer(d, INICIO), '').replace('<!-- kit:propio -->\n\n', '<!-- kit:propio -->\n'), // la zona ya retirada
  }, 'la vieja subió y se retiró; la otra se rechazó');
  const id = aplicarCambio(d);
  const r = queda(d, id, 'zona retirada');
  assert.equal(leer(d, INICIO), INICIO_V2_VACIO);
  assert.equal(lineaCiclo(r, viejo), undefined, 'el que ya subió no se toca');
});

// E8: las zonas del molde real traen texto de fábrica (kit/molde/skills/cierre/SKILL.md: "## Lo propio de este proyecto" y una
// línea). Moldes con la zona del inicio así, distinta en el viejo y en el nuevo.
const FAB_V = '## Lo propio de este proyecto\n\n*Los pasos que agrega este proyecto a su inicio (v1).*';
const FAB_N = '## Lo propio de este proyecto\n\n*Los pasos que agrega este proyecto a su inicio (v2).*';
const MOLDE_V_FAB = { ...MOLDE_V, 'skills/inicio/SKILL.md': conZona(MOLDE_V['skills/inicio/SKILL.md'], FAB_V) };
const MOLDE_N_FAB = { ...MOLDE_N, 'skills/inicio/SKILL.md': conZona(MOLDE_N['skills/inicio/SKILL.md'], FAB_N) };
const VIEJO_FAB = armarKit(MOLDE_V_FAB, '2.9.0');
const INICIO_V2_FAB = conZona(INICIO_V2_VACIO, FAB_N);
// El proyecto nace del molde viejo de fábrica; `zonaAntes` (si viene) es la zona que ya tenía antes del cambio.
function proyectoFab(zonaAntes) {
  const p = (x) => path.join(x, ...INICIO.split('/'));
  return armarProyecto({ molde: MOLDE_V_FAB, antes: zonaAntes === undefined ? undefined : (x) => fs.writeFileSync(p(x), conZona(fs.readFileSync(p(x), 'utf8'), zonaAntes)) });
}
const aplicarFab = (d, id) => aplicar(d, { kit: kitConCubiertos([{ cita: `demo ${id}` }], '3.0.0', MOLDE_N_FAB), moldeViejo: VIEJO_FAB });

test('E8 (d): la zona con su texto de fábrica (molde viejo) en <sha>^ → se retira y queda con el texto de fábrica del molde nuevo', () => {
  const d = proyectoFab();
  assert.match(leer(d, INICIO), /\(v1\)/, 'nació con la zona de fábrica del molde viejo');
  const id = aplicarCambio(d, { propio: `${FAB_V}\nreleer el handoff antes de tocar nada` });
  const r = aplicarFab(d, id);
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  assert.equal(lineaCiclo(r, id), `subió al kit · ${id} · zona retirada`, r.lineas.join('\n'));
  assert.equal(estadoDe(d, id).estado, 'subio-al-kit');
  assert.equal(leer(d, INICIO), INICIO_V2_FAB, 'la zona como viene de fábrica en el molde nuevo, no vacía');
});

test('E8 (d): la zona igual a la de fábrica del molde NUEVO (con espacios al final y CRLF) en <sha>^ también cuenta como sin nada propio', () => {
  const d = proyectoFab(FAB_N.replace('proyecto', 'proyecto  ').split('\n').join('\r\n') + '   ');
  const id = aplicarCambio(d, { propio: `${FAB_N}\nreleer el handoff antes de tocar nada` });
  const r = aplicarFab(d, id);
  assert.equal(lineaCiclo(r, id), `subió al kit · ${id} · zona retirada`, r.lineas.join('\n'));
  assert.equal(leer(d, INICIO), INICIO_V2_FAB);
});

test('E8 (d): la zona con texto de fábrica + algo propio en <sha>^ → "zona compartida, queda"', () => {
  const d = proyectoFab(`${FAB_V}\nlo de antes`);
  const id = aplicarCambio(d, { propio: `${FAB_V}\nlo de antes\nreleer el handoff` });
  const r = aplicarFab(d, id);
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  assert.equal(lineaCiclo(r, id), `subió al kit · ${id} · zona compartida, queda`, r.lineas.join('\n'));
  assert.equal(estadoDe(d, id).estado, 'subio-al-kit');
  assert.match(leer(d, INICIO), /lo de antes\nreleer el handoff/);
});

test('crit. 2, queda (c): la pieza de cubiertos.md no se reemplazó ni se mezcló en la corrida → "te espera (la regla no llegó por el actualizador)"', () => {
  const d = armarProyecto();
  const id = aplicarCambio(d);
  queda(d, id, 'te espera (la regla no llegó por el actualizador)', { pieza: 'cierre' }); // cierre se reemplazó, pero el archivo no es suyo
  assert.match(leer(d, INICIO), /releer el handoff/);
  const e = armarProyecto();
  const id2 = aplicarCambio(e);
  queda(e, id2, 'te espera (la regla no llegó por el actualizador)', { pieza: 'no-existe' });
  // inicio editado fuera de su zona (el guardia lo ve en desvío: la pieza no se toca) → el archivo no es el del molde nuevo: no llegó
  const f = armarProyecto();
  commitear(f, { [INICIO]: leer(f, INICIO).replace('fin\n', 'fin\nuna línea mía, fuera de la zona\n') }, 'adapto el inicio');
  const id3 = aplicarCambio(f);
  const r = aplicar(f, { kit: kitConCubiertos([{ cita: `demo ${id3}` }]) });
  assert.doesNotMatch(lineaDe(r, 'inicio'), /reemplazada|mezclada/, r.lineas.join('\n'));
  assert.equal(lineaCiclo(r, id3), `subió al kit · ${id3} · te espera (la regla no llegó por el actualizador)`);
  assert.match(leer(f, INICIO), /releer el handoff/);
});

test('RF-fix rf-4, (c) ampliada: la pieza vino "sin cambios" pero el archivo, fuera de su zona, ya es el del molde nuevo → la zona se retira', () => {
  // el molde nuevo trae inicio igual al viejo (la pieza ya estaba): sin cambios en la corrida, pero llegó
  const f = armarProyecto();
  const id = aplicarCambio(f);
  const k = kitConCubiertos([{ cita: `demo ${id}` }]);
  escribirArbol(k, { 'kit/molde/skills/inicio/SKILL.md': MOLDE_V['skills/inicio/SKILL.md'] });
  const r = aplicar(f, { kit: k });
  assert.match(lineaDe(r, 'inicio'), /sin cambios$/);
  assert.equal(lineaCiclo(r, id), `subió al kit · ${id} · zona retirada`, r.lineas.join('\n'));
  assert.equal(leer(f, INICIO), MOLDE_V['skills/inicio/SKILL.md'].replace('{{PROYECTO}}', 'demo'));
  // rc → final: el rc trae la pieza (subiría), se commitea; el final la ve "sin cambios" y igual sube y retira la zona
  const g = armarProyecto();
  const id2 = aplicarCambio(g);
  const kf = kitConCubiertos([{ cita: `demo ${id2}` }]);
  const rc = aplicar(g, { kit: kf, rc: true });
  assert.equal(lineaDe(rc, 'inicio'), 'inicio · molde+propio · mezclada (zona intacta)');
  assert.equal(lineaCiclo(rc, id2), `subiría al kit · ${id2}`);
  commitear(g, {}, 'kit 2.9.0 → 3.0.0 (rc)');
  assert.match(leer(g, '.claude/kit.md'), /^kit: 3\.0\.0$/m);
  const fin = A.aplicar(g, { kit: kf, fecha: '2026-11-02', claude: 'no' }); // la ficha ya dice 3.0.0: el viejo es el nuevo
  assert.equal(fin.codigo, 0, fin.lineas.join('\n'));
  assert.match(lineaDe(fin, 'inicio'), /sin cambios$/);
  assert.equal(lineaCiclo(fin, id2), `subió al kit · ${id2} · zona retirada`, fin.lineas.join('\n'));
  assert.equal(estadoDe(g, id2).estado, 'subio-al-kit');
  assert.equal(leer(g, INICIO), INICIO_V2_VACIO);
});

test('crit. 2, queda (a): un 3-barrera, aunque todo lo demás cumpla → "te espera (freno)" (D7-3)', () => {
  const d = armarProyecto();
  const id = aplicarCambio(d, { barrera: true });
  assert.deepEqual(CA.verificar(d), [], 'el 3-barrera está sellado y en orden');
  queda(d, id, 'te espera (freno)');
  assert.match(leer(d, INICIO), /releer el handoff/);
  assert.ok(estadoDe(d, id).aprobo, 'el sello queda');
  commitear(d, {}, 'kit');
  assert.deepEqual(CA.verificar(d), [], 'subido, sigue verde (r1-2)');
});

test('crit. 2, queda (b): un clase 2 cuyo aplico es un archivo de frenos (la vara del candado) → "te espera (freno)"', () => {
  const d = armarProyecto();
  const id = aplicarCambio(d, { archivo: '.claude/hooks/notas.md' });
  queda(d, id, 'te espera (freno)', { pieza: 'hooks-lib' });
  assert.match(leer(d, '.claude/hooks/notas.md'), /releer el handoff/);
});

test('crit. 2: verificar en rojo → sigue aplicado, la zona queda y la línea lo dice', () => {
  const d = armarProyecto();
  const id = aplicarCambio(d);
  commitear(d, { [relCambio(id)]: CA.ponerCampos(leer(d, relCambio(id)), { sha: 'e'.repeat(40) }) }, 'sha roto');
  const r = aplicar(d, { kit: kitConCubiertos([{ cita: `demo ${id}` }]) });
  assert.equal(r.codigo, 0);
  assert.match(lineaCiclo(r, id), new RegExp(`^no subió al kit · ${id} · verificar en rojo \\(el sha de aplicado no existe en este repo\\): sigue aplicado$`));
  assert.equal(estadoDe(d, id).estado, 'aplicado');
  assert.match(leer(d, INICIO), /releer el handoff/);
});

test('crit. 2: con un tag -rc (opciones.rc), nada: solo "subiría al kit"; --plan muestra el cierre sin escribir', () => {
  const d = armarProyecto();
  const id = aplicarCambio(d);
  const antes = leer(d, relCambio(id));
  const k = kitConCubiertos([{ cita: `demo ${id}` }]);
  const r = aplicar(d, { kit: k, rc: true });
  assert.equal(lineaCiclo(r, id), `subiría al kit · ${id}`);
  assert.equal(leer(d, relCambio(id)), antes);
  assert.match(leer(d, INICIO), /releer el handoff/, 'la zona mezclada, no retirada');
  const e = armarProyecto();
  const id2 = aplicarCambio(e);
  const foto0 = foto(e);
  const r2 = aplicar(e, { kit: kitConCubiertos([{ cita: `demo ${id2}` }]), plan: true });
  assert.equal(lineaCiclo(r2, id2), `subió al kit · ${id2} · zona retirada`);
  assert.deepEqual(foto(e), foto0, '--plan no escribe');
});

test('RF-fix (6) ultimo-tag: el v* anotado mayor (v3.0.0 le gana a v3.0.0-rc.2, el liviano no cuenta); sin ninguno → 1; mal llamado → 2', async () => {
  const k = nuevaCarpeta('tags');
  git(k, 'init', '-q');
  escribirArbol(k, { 'a.txt': 'a\n' });
  commitTodo(k, 'uno');
  const r0 = await A.main(['ultimo-tag', k]);
  assert.equal(r0.codigo, 1);
  assert.match(r0.lineas[0], /^ultimo-tag: el canónico no tiene ningún tag v\* anotado/);
  for (const t of ['v3.0.0-rc.1', 'v3.0.0', 'v3.0.0-rc.2']) git(k, 'tag', '-a', t, '-m', t);
  git(k, 'tag', 'v3.0.1'); // liviano: no se reparte
  const r = await A.main(['ultimo-tag', k]);
  assert.deepEqual(r, { codigo: 0, lineas: ['v3.0.0'] });
  for (const args of [['ultimo-tag'], ['ultimo-tag', k, 'otro'], ['ultimo-tag', '--raro']]) assert.equal((await A.main(args)).codigo, 2, args.join(' '));
});

test('RF-fix (7): un aplicar suelto (sin --rc) con un kit -rc y un cubiertos.md que lo cubre → "subiría al kit", sin tocar el cambio', () => {
  const d = armarProyecto();
  const id = aplicarCambio(d);
  const antes = leer(d, relCambio(id));
  const r = aplicar(d, { kit: kitConCubiertos([{ cita: `demo ${id}`, version: '2.9.0' }], '3.0.0-rc.2') });
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  assert.equal(lineaCiclo(r, id), `subiría al kit · ${id}`);
  assert.equal(leer(d, relCambio(id)), antes);
});

test('RF-fix rf-1: una entrada mala de cubiertos.md (sin pieza:, versión rara) se saltea y se dice; las demás valen', () => {
  const d = armarProyecto();
  const id = aplicarCambio(d);
  const k = kitConCubiertos([]);
  escribirArbol(k, { 'kit/cubiertos.md': [
    '---', 'cubiertos:',
    '  - {cita: "otro 2026-01-01-x", version: 3.0.0}', // la línea vieja de cambios-flota: sin pieza
    '  - {cita: "demo y", version: 3.0, pieza: inicio}',
    `  - {cita: "demo ${id}", version: 3.0.0, pieza: inicio}`,
    '---', '',
  ].join('\n') });
  const r = aplicar(d, { kit: k });
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  const malas = r.lineas.filter((x) => x.startsWith('kit/cubiertos.md · '));
  assert.deepEqual(malas, [
    'kit/cubiertos.md · la entrada 1 no es {cita: "<alias> <id>", version: N.N.N, pieza: <id>} (le falta pieza:): la salteo, las demás valen',
    'kit/cubiertos.md · la entrada 2 no es {cita: "<alias> <id>", version: N.N.N, pieza: <id>} (version: no es N.N.N): la salteo, las demás valen',
  ]);
  assert.equal(lineaCiclo(r, id), `subió al kit · ${id} · zona retirada`, 'la buena vale aunque haya malas');
  assert.equal(estadoDe(d, id).estado, 'subio-al-kit');
});

test('crit. 2: sin cubiertos.md (o uno que no se lee) → nada cambia y una línea; sin aplicados, ni la mira', () => {
  for (const [k, re] of [[kitConCubiertos(null), /no está/], [(() => {
    const x = kitConCubiertos([]);
    escribirArbol(x, { 'kit/cubiertos.md': '---\ncubiertos: no-es-una-lista\n---\n' });
    return x;
  })(), /no tiene la lista cubiertos:/]]) {
    const d = armarProyecto();
    const id = aplicarCambio(d);
    const antes = leer(d, relCambio(id));
    const r = aplicar(d, { kit: k });
    assert.equal(r.codigo, 0, r.lineas.join('\n'));
    const l = r.lineas.find((x) => x.startsWith('kit/cubiertos.md · '));
    assert.match(l, re);
    assert.match(l, /no marqué nada: los cambios siguen aplicado$/);
    assert.equal(leer(d, relCambio(id)), antes);
    assert.match(leer(d, INICIO), /releer el handoff/);
  }
  const r = aplicar(armarProyecto(), { kit: kitConCubiertos(null) });
  assert.ok(!r.lineas.some((x) => x.startsWith('kit/cubiertos.md')), 'un proyecto sin cambios aplicados no la menciona');
});

test('kit/cubiertos.md del kit real: se lee con la gramática de la ficha y trae la lista (la valida entera lib/cubiertos.test.cjs)', () => {
  const t = fs.readFileSync(path.join(RAIZ_KIT, 'kit', 'cubiertos.md'), 'utf8');
  assert.ok(Array.isArray(F.leerCabecera(t).datos.cubiertos));
  assert.match(t, /- \{cita: "<alias> <id>", version: N\.N\.N, pieza: <id>\}/);
});

test('(d): un archivo que no estaba en <sha>^ (el cambio lo escribió entero) cuenta como zona vacía → se retira', () => {
  const d = armarProyecto();
  const v1 = leer(d, INICIO);
  fs.rmSync(path.join(d, '.kit-rol')); // aprobar no corre acá, pero el CLI de cambios se arma sin el rol del actualizador
  git(d, 'rm', '-q', '--', INICIO);
  git(d, 'commit', '-q', '-m', 'se fue el inicio');
  const id = /propuesto (\S+)/.exec(cambios(d, 'nuevo', '--slug', 'vuelve-inicio', '--clase', '2', '--toca', 'inicio', '--origen', 'o'))[1];
  const sha = commitear(d, { [INICIO]: conZona(v1, 'releer el handoff') }, 'vuelve, con la regla en su zona');
  assert.equal(git(d, 'ls-tree', '--name-only', `${sha}^`, '--', INICIO).trim(), '', 'no estaba en sha^');
  cambios(d, 'anotar-sha', id, sha, '--aplico', INICIO);
  commitear(d, {}, 'anota');
  fs.writeFileSync(path.join(d, '.kit-rol'), 'actualizador\n');
  queda(d, id, 'zona retirada');
  assert.equal(leer(d, INICIO), INICIO_V2_VACIO);
});

test('(d): un cambio aplicado en el primer commit del repo (sin <sha>^) cuenta como zona vacía → se retira', () => {
  const regla = 'releer el handoff';
  const d = armarProyecto({ antes: (x) => fs.writeFileSync(path.join(x, ...INICIO.split('/')), conZona(fs.readFileSync(path.join(x, ...INICIO.split('/')), 'utf8'), regla)) });
  const raiz = git(d, 'rev-list', '--max-parents=0', 'HEAD').trim();
  const texto = CA.ponerCampos(CA.armar({ clase: '2', toca: ['inicio'], origen: 'nació con el repo', cicatriz: 'no', chico: 'sí', urgente: 'no', cuerpo: CUERPO_CAMBIO }), {
    estado: 'aplicado',
    sha: raiz,
    aplico: `{archivo: "${INICIO}", hash: ${F.hash(regla)}}`,
  });
  const id = '2026-01-01-nacio-con-el-repo';
  commitear(d, { [relCambio(id)]: texto }, 'el cambio, anotado a mano');
  assert.deepEqual(CA.verificar(d), []);
  queda(d, id, 'zona retirada');
  assert.equal(leer(d, INICIO), INICIO_V2_VACIO);
});

// ---------------------------------------------------------------- resolver: la salida que eligió el dueño (paquete 8b, (6))

const FU = require('./lib/fusion.cjs');
const RS_CIERRE = '# cierre\n\nuno\ndos\ntres\ncuatro\ncinco\nseis\n';
const RS_A = "'use strict';\n// a\nconst uno = 1;\nconst dos = 2;\nconst tres = 3;\nconst cuatro = 4;\nmodule.exports = { uno, dos, tres, cuatro };\n";
const RS_B = "'use strict';\n// b\nmodule.exports = 1;\n";
const RS_V = { ...MOLDE_V, 'skills/cierre/SKILL.md': RS_CIERRE, 'scripts/a.cjs': RS_A, 'scripts/b.cjs': RS_B };
const RS_N = { ...MOLDE_N, 'skills/cierre/SKILL.md': RS_CIERRE.replace('uno\n', 'uno v2\n'), 'scripts/a.cjs': RS_A.replace('const uno = 1;', 'const uno = 10;'), 'scripts/b.cjs': RS_B };
// rc.2: el molde vuelve a tocar el cierre (para "propia en rc.1 + tag rc.2")
const RS_N2 = { ...RS_N, 'skills/cierre/SKILL.md': RS_N['skills/cierre/SKILL.md'].replace('tres\n', 'tres rc2\n') };
const RS_KIT_V = armarKit(RS_V, '2.9.0');
const RS_KIT_N = armarKit(RS_N, '3.0.0');
const CIERRE = '.claude/skills/cierre/SKILL.md';
const SCR_A = '.claude/scripts/a.cjs';
const SCR_B = '.claude/scripts/b.cjs';
const CIERRE_NUESTRO = RS_CIERRE.replace('seis\n', 'seis (a nuestra manera)\n'); // no pisa lo del molde: hay propuesta
const CIERRE_CHOCA = RS_CIERRE.replace('uno\n', 'uno (nuestro)\n'); // pisa lo del molde: sin propuesta
const A_NUESTRO = RS_A.replace('const cuatro = 4;', 'const cuatro = 44;');
const B_NUESTRO = "'use strict';\n// b\nmodule.exports = 2;\n";

const fichaDe = (d) => F.leer(leer(d, '.claude/kit.md')).datos;
const commitTodo = (d, m, autor = 'kit-actualizador <k@kit.invalid>') => {
  git(d, 'add', '-A');
  git(d, 'commit', '-q', '-m', m, '--author', autor);
};
// Un proyecto con cierre y scripts adaptadas sin por:, después de la flota (el informe ya commiteado) y en el checkout del dueño (sin .kit-rol).
function esperando({ cierre = CIERRE_NUESTRO, kit = RS_KIT_N, moldeViejo = RS_KIT_V } = {}) {
  const d = armarProyecto({
    molde: RS_V, estados: { cierre: 'adaptada', scripts: 'adaptada' },
    antes: (x) => escribirArbol(x, { [CIERRE]: cierre, [SCR_A]: A_NUESTRO, [SCR_B]: B_NUESTRO }),
  });
  const r = A.aplicar(d, { kit, moldeViejo, fecha: '2026-11-02', claude: 'no' });
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  assert.match(lineaDe(r, 'cierre'), /te espera: sin porqué/);
  assert.match(lineaDe(r, 'scripts'), /te espera: sin porqué/);
  commitTodo(d, 'kit 2.9.0 → 3.0.0');
  fs.rmSync(path.join(d, '.kit-rol'));
  return d;
}
const resolver = (d, pieza, salida, o = {}) => A.resolver(d, pieza, salida, { por: 'lo decidió el dueño', ...o });

test('resolver mezclar: escribe la propuesta, adaptada con por: y el hash del molde nuevo, borra el informe e imprime el commit por rutas', () => {
  const d = esperando();
  const r = resolver(d, 'cierre', 'mezclar', { por: 'el paso seis es "nuestro"' });
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  assert.equal(leer(d, CIERRE), RS_CIERRE.replace('uno\n', 'uno v2\n').replace('seis\n', 'seis (a nuestra manera)\n'));
  assert.deepEqual(fichaDe(d).piezas.cierre, { estado: 'adaptada', hash: Z.hashPieza(RS_N['skills/cierre/SKILL.md']), por: "el paso seis es 'nuestro'" });
  assert.equal(leer(d, '.claude/fusiones/cierre.md'), null);
  assert.match(r.lineas.at(-1), /^commit por rutas: git add -A -- \.claude\/skills\/cierre\/SKILL\.md \.claude\/kit\.md \.claude\/fusiones\/cierre\.md && git commit -m "inicio: cierre, mezclar/);
  // no commitea; lo de las otras piezas no se tocó
  assert.deepEqual(git(d, 'status', '--porcelain').split('\n').filter(Boolean).map((l) => l.slice(3)).sort(), ['.claude/fusiones/cierre.md', '.claude/kit.md', CIERRE].sort());
  assert.equal(leer(d, SCR_A), A_NUESTRO);
  // la próxima flota: con por: y sin informe, sin cambios
  commitTodo(d, 'inicio: cierre, mezclar', 'Dueño <d@kit.invalid>');
  fs.writeFileSync(path.join(d, '.kit-rol'), 'actualizador\n');
  const r2 = A.aplicar(d, { kit: RS_KIT_N, fecha: '2026-11-02', claude: 'no' });
  assert.equal(lineaDe(r2, 'cierre'), 'cierre · adaptada · sin cambios');
});

test('resolver nueva: la versión nueva entera en TODO archivo distinto (también los igual), la pieza pasa a molde y la flota siguiente no ve desvío', () => {
  const d = esperando();
  const inf = leer(d, '.claude/fusiones/scripts.md');
  assert.match(inf, /Lo que perdés \(lo tuyo fuera de la zona propia\): \.claude\/scripts\/a\.cjs, \.claude\/scripts\/b\.cjs\./, 'el igual también va en "lo que perdés" (r1-4)');
  const r = resolver(d, 'scripts', 'nueva');
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  assert.equal(leer(d, SCR_A), RS_N['scripts/a.cjs']);
  assert.equal(leer(d, SCR_B), RS_B, 'b: el molde no lo cambió pero lo nuestro era distinto');
  assert.equal(fichaDe(d).piezas.scripts, 'molde');
  assert.match(r.lineas.join('\n'), /scripts es de frenos: el candado pide el aprobado del dueño al commitear; si no aprueba, `git checkout -- \.claude\/scripts\/a\.cjs \.claude\/scripts\/b\.cjs`/);
  // una pieza de un archivo: nueva deja el hash del molde
  const r2 = resolver(d, 'cierre', 'nueva');
  assert.equal(r2.codigo, 0, r2.lineas.join('\n'));
  assert.equal(leer(d, CIERRE), RS_N['skills/cierre/SKILL.md']);
  assert.deepEqual(fichaDe(d).piezas.cierre, { estado: 'molde', hash: Z.hashPieza(RS_N['skills/cierre/SKILL.md']) });
  commitTodo(d, 'inicio: scripts y cierre, la nueva', 'Dueño <d@kit.invalid>');
  fs.writeFileSync(path.join(d, '.kit-rol'), 'actualizador\n');
  const r3 = A.aplicar(d, { kit: RS_KIT_N, fecha: '2026-11-02', claude: 'no' });
  assert.equal(lineaDe(r3, 'scripts'), 'scripts · molde · sin cambios', r3.lineas.join('\n'));
  assert.equal(lineaDe(r3, 'cierre'), 'cierre · molde · sin cambios');
});

test('resolver congelar: propia con por:; en cada pieza de FRENOS → 1 sin escribir nada', () => {
  const d = esperando();
  const antes = foto(d);
  for (const id of ['hook-arranque', 'hook-git-seguro', 'settings', 'candado', 'githooks', 'hooks-lib', 'cambios-metodo', 'scripts']) {
    const r = resolver(d, id, 'congelar');
    assert.equal(r.codigo, 1, id);
    assert.match(r.lineas[0], new RegExp(`^resolver: congelar no va en ${id}: es una pieza de frenos \\(`), id);
  }
  assert.deepEqual(foto(d), antes, 'no escribió nada');
  const r = resolver(d, 'cierre', 'congelar', { por: 'no la toques nunca más' });
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  assert.deepEqual(fichaDe(d).piezas.cierre, { estado: 'propia', hash: Z.hashPieza(RS_CIERRE), por: 'no la toques nunca más' });
  assert.equal(leer(d, CIERRE), CIERRE_NUESTRO);
  assert.equal(leer(d, '.claude/fusiones/cierre.md'), null);
});

test('resolver mezclar sin propuesta → 1 ("armala a mano"); --a-mano con marcadores → 1; --a-mano bien armada → 0 sin tocar el archivo', () => {
  const d = esperando({ cierre: CIERRE_CHOCA });
  const antes = foto(d);
  const r = resolver(d, 'cierre', 'mezclar');
  assert.equal(r.codigo, 1);
  assert.match(r.lineas[0], /^resolver: \.claude\/skills\/cierre\/SKILL\.md no tiene fusión propuesta: armala a mano y corré con --a-mano; no toqué nada$/);
  assert.deepEqual(foto(d), antes);
  fs.writeFileSync(path.join(d, ...CIERRE.split('/')), RS_CIERRE.replace('uno\n', '<<<<<<< proyecto\nuno (nuestro)\n=======\nuno v2\n>>>>>>> molde nuevo\n'));
  const r2 = resolver(d, 'cierre', 'mezclar', { aMano: true });
  assert.equal(r2.codigo, 1);
  assert.match(r2.lineas[0], /^resolver: --a-mano: .*quedaron marcadores de conflicto/);
  assert.deepEqual(fichaDe(d).piezas.cierre, { estado: 'adaptada', hash: Z.hashPieza(RS_CIERRE) }, 'la ficha no cambió');
  const armada = RS_CIERRE.replace('uno\n', 'uno v2 (nuestro)\n');
  fs.writeFileSync(path.join(d, ...CIERRE.split('/')), armada);
  const r3 = resolver(d, 'cierre', 'mezclar', { aMano: true, por: 'uno es nuestro' });
  assert.equal(r3.codigo, 0, r3.lineas.join('\n'));
  assert.equal(leer(d, CIERRE), armada);
  assert.equal(fichaDe(d).piezas.cierre.por, 'uno es nuestro');
  assert.equal(leer(d, '.claude/fusiones/cierre.md'), null);
});

test('resolver no pisa trabajo (r1-2): un archivo tocado después del informe (commiteado o no) → mezclar y nueva 1 sin escribir, propia y congelar 0; un informe que nombra una ruta ajena → 1', () => {
  // commiteado después del informe: la huella no coincide → las que escriben se niegan y dicen la verdad (la flota no lo destraba)
  const despues = CIERRE_NUESTRO.replace('dos\n', 'dos (después)\n');
  const tocado = () => {
    const x = esperando();
    escribirArbol(x, { [CIERRE]: despues });
    commitTodo(x, 'cierre: otro cambio', 'Dueño <d@kit.invalid>');
    return x;
  };
  const d = tocado();
  const antes = foto(d);
  for (const salida of ['mezclar', 'nueva']) {
    const r = resolver(d, 'cierre', salida);
    assert.equal(r.codigo, 1, salida);
    assert.match(r.lineas[0], /^resolver: \.claude\/skills\/cierre\/SKILL\.md cambió desde el informe: elegí propia o congelar, o mezclar --a-mano; no toqué nada$/, salida);
  }
  assert.deepEqual(foto(d), antes);
  // en una pieza de frenos no ofrece congelar
  escribirArbol(d, { [SCR_B]: B_NUESTRO.replace('= 2', '= 22') });
  commitTodo(d, 'scripts: otro cambio', 'Dueño <d@kit.invalid>');
  const rf = resolver(d, 'scripts', 'mezclar');
  assert.equal(rf.codigo, 1);
  assert.match(rf.lineas[0], /^resolver: \.claude\/scripts\/b\.cjs cambió desde el informe: elegí propia, o mezclar --a-mano; no toqué nada$/);
  // propia y congelar no escriben archivos: pueden igual, y lo commiteado después queda
  for (const salida of ['propia', 'congelar']) {
    const x = tocado();
    const r = resolver(x, 'cierre', salida);
    assert.equal(r.codigo, 0, `${salida}: ${r.lineas.join('\n')}`);
    assert.equal(leer(x, CIERRE), despues, salida);
    assert.equal(leer(x, '.claude/fusiones/cierre.md'), null, salida);
    assert.equal(fichaDe(x).piezas.cierre.estado, salida === 'propia' ? 'adaptada' : 'propia', salida);
  }
  // sin commitear, en un archivo de la pieza que el informe no nombra (las rutas salen del catálogo)
  const d2 = esperando();
  escribirArbol(d2, { '.claude/skills/cierre/otro.md': 'algo nuevo\n' });
  const r2 = resolver(d2, 'cierre', 'mezclar');
  assert.equal(r2.codigo, 1);
  assert.match(r2.lineas[0], /^resolver: \.claude\/skills\/cierre\/otro\.md tiene cambios sin commitear: cambió desde el informe/);
  // un informe que nombra una ruta que no es de la pieza (aunque su huella coincida)
  const d3 = esperando();
  const rInf = '.claude/fusiones/cierre.md';
  const hook = '.claude/hooks/session-start.cjs';
  escribirArbol(d3, { [rInf]: leer(d3, rInf).replace(/^(tuyo: .*)$/m, (l) => `${l}\ntuyo: ${F.hash(leer(d3, hook))} tres ${hook}`) });
  commitTodo(d3, 'informe tocado', 'Dueño <d@kit.invalid>');
  const r3 = resolver(d3, 'cierre', 'mezclar');
  assert.equal(r3.codigo, 1);
  assert.match(r3.lineas[0], /nombra \.claude\/hooks\/session-start\.cjs, que no es de la pieza cierre: no toqué nada/);
  assert.equal(A.piezaDeRutaProyecto('.claude/skills/cierre/../../hooks/x.cjs'), null, 'con .. no es de nadie');
  assert.equal(A.piezaDeRutaProyecto('.claude/scripts/cambios.cjs'), 'cambios-metodo');
  assert.equal(A.piezaDeRutaProyecto('.claude/scripts/encargo.cjs'), 'scripts');
  assert.equal(A.piezaDeRutaProyecto('.claude/hooks/lib/ficha.cjs'), 'hooks-lib');
});

test('resolver mezclar --a-mano: lo que el dueño no tocó va con lo del informe (molde → la nueva, tres limpio → la propuesta); lo que armó, del disco', () => {
  // scripts: a.cjs igual al molde viejo (molde), b.cjs choca (lo arma el dueño), c.cjs se fusiona limpio (tres con propuesta)
  const C_V = "'use strict';\n// c\nconst uno = 1;\nconst dos = 2;\nconst tres = 3;\nconst cuatro = 4;\nmodule.exports = { uno, dos, tres, cuatro };\n";
  const V = { ...RS_V, 'scripts/c.cjs': C_V };
  const N = { ...RS_N, 'scripts/b.cjs': RS_B.replace('= 1', '= 3'), 'scripts/c.cjs': C_V.replace('const uno = 1;', 'const uno = 100;') };
  const SCR_C = '.claude/scripts/c.cjs';
  const preparar = (c) => {
    const x = armarProyecto({
      molde: V, estados: { scripts: 'adaptada' },
      antes: (y) => escribirArbol(y, { [SCR_A]: RS_A, [SCR_B]: B_NUESTRO, [SCR_C]: c }),
    });
    const r = A.aplicar(x, { kit: armarKit(N, '3.0.0'), moldeViejo: armarKit(V, '2.9.0'), fecha: '2026-11-02', claude: 'no' });
    assert.equal(r.codigo, 0, r.lineas.join('\n'));
    assert.match(lineaDe(r, 'scripts'), /te espera/);
    commitTodo(x, 'kit 2.9.0 → 3.0.0');
    fs.rmSync(path.join(x, '.kit-rol'));
    return x;
  };
  const d = preparar(C_V.replace('const cuatro = 4;', 'const cuatro = 44;'));
  const armada = "'use strict';\n// b\nmodule.exports = 23;\n";
  fs.writeFileSync(path.join(d, ...SCR_B.split('/')), armada);
  const r = resolver(d, 'scripts', 'mezclar', { aMano: true, por: 'b es nuestro' });
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  assert.equal(leer(d, SCR_A), N['scripts/a.cjs'], 'a: el kit cambió y vos no → la nueva (si quedara la vieja, la flota siguiente revierte el arreglo)');
  assert.equal(leer(d, SCR_C), N['scripts/c.cjs'].replace('const cuatro = 4;', 'const cuatro = 44;'), 'c: la propuesta');
  assert.equal(leer(d, SCR_B), armada, 'b: lo armado, tal cual');
  assert.match(r.lineas.join('\n'), /\.claude\/scripts\/a\.cjs · escrito \(mezclar\)[\s\S]*\.claude\/scripts\/c\.cjs · escrito \(mezclar\)/);
  // sin armar b (choca y sigue como en el informe) → 1, sin escribir nada
  const d2 = preparar(C_V);
  const antes = foto(d2);
  const r2 = resolver(d2, 'scripts', 'mezclar', { aMano: true });
  assert.equal(r2.codigo, 1);
  assert.match(r2.lineas[0], /^resolver: --a-mano: \.claude\/scripts\/b\.cjs sigue como en el informe y no tiene fusión propuesta/);
  assert.deepEqual(foto(d2), antes);
});

test('resolver propia en rc.1 + tag rc.2 → desde: en la ficha y la fusión de rc.2 trae lo de rc.1 y lo de rc.2 (r1-1); mezclar borra desde:', () => {
  const kit = nuevaCarpeta('kit-rc');
  git(kit, 'init', '-q', '-b', 'main');
  git(kit, 'config', 'core.autocrlf', 'false');
  for (const [molde, v] of [[RS_V, '2.9.0'], [RS_N, '3.0.0-rc.1'], [RS_N2, '3.0.0-rc.2']]) {
    fs.rmSync(path.join(kit, 'kit'), { recursive: true, force: true });
    escribirArbol(path.join(kit, 'kit', 'molde'), molde);
    fs.writeFileSync(path.join(kit, 'kit', 'VERSION'), `${v}\n`);
    fs.writeFileSync(path.join(kit, 'kit', 'CHANGELOG.md'), `# Changelog del kit\n\n## ${v}\n\n- lo de ${v}\n`);
    git(kit, 'add', '-A');
    git(kit, 'commit', '-q', '-m', `kit ${v}`);
    git(kit, 'tag', '-a', `v${v}`, '-m', `v${v}`);
  }
  git(kit, 'checkout', '-q', 'v3.0.0-rc.1');
  const d = esperando({ kit, moldeViejo: undefined });
  const r = resolver(d, 'cierre', 'propia', { por: 'el paso seis es nuestro' });
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  assert.deepEqual(fichaDe(d).piezas.cierre, { estado: 'adaptada', hash: Z.hashPieza(RS_CIERRE), por: 'el paso seis es nuestro', desde: '2.9.0' });
  assert.equal(leer(d, CIERRE), CIERRE_NUESTRO, 'sin cambios');
  commitTodo(d, 'inicio: cierre, me quedo con la mía', 'Dueño <d@kit.invalid>');
  fs.writeFileSync(path.join(d, '.kit-rol'), 'actualizador\n');
  git(kit, 'checkout', '-q', 'v3.0.0-rc.2');
  const r2 = A.aplicar(d, { kit, fecha: '2026-11-02', claude: 'no' });
  assert.equal(r2.codigo, 0, r2.lineas.join('\n'));
  assert.equal(lineaDe(r2, 'cierre'), 'cierre · adaptada · te espera: te quedaste con la tuya en el kit 2.9.0: se te vuelve a ofrecer desde ahí, no se fusiona sola');
  assert.equal(leer(d, CIERRE), CIERRE_NUESTRO);
  const inf = leer(d, '.claude/fusiones/cierre.md');
  assert.equal(FU.baseDeInforme(inf), '2.9.0');
  assert.match(inf, /kit 2\.9\.0 → 3\.0\.0-rc\.2/);
  assert.match(inf, /molde viejo → molde nuevo[\s\S]*^-uno$\n^\+uno v2$[\s\S]*^-tres$\n^\+tres rc2$/m, 'lo de rc.1 y lo de rc.2');
  assert.match(inf, /^> - lo de 3\.0\.0-rc\.2$/m, 'la nota del kit');
  assert.equal(fichaDe(d).piezas.cierre.desde, '2.9.0', 'desde: queda mientras espera');
  commitTodo(d, 'kit 3.0.0-rc.1 → 3.0.0-rc.2');
  fs.rmSync(path.join(d, '.kit-rol'));
  const r3 = resolver(d, 'cierre', 'mezclar');
  assert.equal(r3.codigo, 0, r3.lineas.join('\n'));
  assert.equal(leer(d, CIERRE), RS_N2['skills/cierre/SKILL.md'].replace('seis\n', 'seis (a nuestra manera)\n'));
  assert.equal(fichaDe(d).piezas.cierre.desde, undefined, 'mezclar borra desde:');
});

test('resolver por la CLI: sin --por, salida rara, --a-mano sin mezclar o de más argumentos → 2 con el USO; con otro rol → 1', () => {
  const s = copiaScripts(null);
  for (const args of [['resolver', 'x', 'cierre', 'mezclar'], ['resolver', 'x', 'cierre', 'mezclar', '--por'], ['resolver', 'x', 'cierre', 'mezclar', '--por', ' '], ['resolver', 'x', 'cierre', 'tirar', '--por', 'p'], ['resolver', 'x', 'cierre', 'nueva', '--por', 'p', '--a-mano'], ['resolver', 'x', 'cierre', 'mezclar', 'y', '--por', 'p'], ['resolver', 'x', 'cierre', 'mezclar', '--por', 'p', '--raro']]) {
    const r = correr(s, args);
    assert.equal(r.status, 2, args.join(' '));
    assert.match(r.stderr, /^uso: node actualizar\.cjs aplicar/);
    assert.match(r.stderr, /resolver <carpeta> <pieza> mezclar\|propia\|nueva\|congelar --por "<texto>" \[--a-mano\]/);
  }
  const d = esperando();
  fs.writeFileSync(path.join(d, '.kit-rol'), 'obrero\n');
  const r = correr(s, ['resolver', d, 'cierre', 'mezclar', '--por', 'p']);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /^resolver: esta carpeta es de un agente \(\.kit-rol: obrero\)/);
  fs.rmSync(path.join(d, '.kit-rol'));
  const ok = correr(s, ['resolver', d, 'cierre', 'mezclar', '--por', 'p']);
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  assert.match(ok.stdout, /commit por rutas: /);
});

test('notaDelKit: las secciones > vieja y ≤ nueva (rc incluida), sin archivo o sin sección → null', () => {
  const kit = nuevaCarpeta('kit-nota');
  fs.mkdirSync(path.join(kit, 'kit'));
  assert.equal(A.notaDelKit(kit, '2.9.0', '3.0.0'), null, 'sin CHANGELOG.md');
  fs.writeFileSync(path.join(kit, 'kit', 'CHANGELOG.md'), '# Changelog\n\nintro\n\n## 3.1.0\n\n- no\n\n## 3.0.0\n\n- sí final\n\n## 3.0.0-rc.2\n\n- sí rc2\n\n## Notas\n\n- no es versión\n\n## 2.9.0\n\n- no, es la vieja\n');
  assert.equal(A.notaDelKit(kit, '2.9.0', '3.0.0'), '## 3.0.0\n\n- sí final\n\n## 3.0.0-rc.2\n\n- sí rc2\n');
  assert.equal(A.notaDelKit(kit, '3.0.0', '3.0.0'), null, 'sin sección para estas versiones');
  assert.equal(A.notaDelKit(kit, '3.0.0-rc.2', '3.0.0'), '## 3.0.0\n\n- sí final\n');
});
