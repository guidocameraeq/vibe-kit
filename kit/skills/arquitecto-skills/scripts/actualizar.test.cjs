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

test('D6-15: el --kit parado en un tag que no dice lo mismo que kit/VERSION → 1; con -rc.N, vale', () => {
  const k = armarKit(MOLDE_N, '3.0.0');
  git(k, 'init', '-q', '-b', 'main');
  git(k, 'add', '-A');
  git(k, 'commit', '-q', '-m', 'kit');
  git(k, 'tag', '-a', 'v3.0.0-rc.1', '-m', 'rc');
  assert.equal(A.aplicar(armarProyecto(), { kit: k, moldeViejo: VIEJO, fecha: '2026-11-02', claude: 'no' }).codigo, 0);
  git(k, 'tag', '-a', 'v3.1.0', '-m', 'otro');
  const r = A.aplicar(armarProyecto(), { kit: k, moldeViejo: VIEJO, fecha: '2026-11-02', claude: 'no' });
  assert.equal(r.codigo, 1);
  assert.match(r.lineas[0], /no coinciden/);
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
  // y la segunda corrida (el mismo molde): nada que fusionar, sin tocar
  git(d, 'add', '-A');
  git(d, 'commit', '-q', '-m', 'kit');
  const r2 = A.aplicar(d, { kit: KIT, fecha: '2026-11-02', claude: 'no' });
  assert.match(lineaDe(r2, 'hook-arranque'), /· sin cambios$/);
  assert.equal(leer(d, '.claude/hooks/session-start.cjs'), '// arranque v1\n// mío\n');
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
  for (const f of ['catalogo.cjs', 'molde.cjs', 'fusion.cjs']) fs.copyFileSync(path.join(__dirname, 'lib', f), path.join(d, 'scripts', 'lib', f));
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
