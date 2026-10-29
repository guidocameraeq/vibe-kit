'use strict';
// Pruebas de scripts/agents.cjs. Corren con: node --test "kit/**/*.test.cjs"
// Repos temporales armados acá (mkdtemp + git init, identidad fija); nunca los repos de prueba del kit.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

// Aislado de la configuración de esta PC: un global vacío y sin el del sistema.
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-agents-'));
const GLOBAL = path.join(TMP, 'gitconfig-vacio');
fs.writeFileSync(GLOBAL, '');
const ENTORNO = { ...process.env, GIT_CONFIG_GLOBAL: GLOBAL, GIT_CONFIG_NOSYSTEM: '1' };
test.after(() => fs.rmSync(TMP, { recursive: true, force: true }));

const SCRIPT = path.join(__dirname, 'agents.cjs');
const MARCA = '<!-- generado desde CLAUDE.md: no editar -->';
const FICHA = '.claude/kit.md';
const BOM = String.fromCharCode(0xFEFF);
const CLAUDE = '# Reglas\n\nHablar en criollo.\n- una\n- dos\n';

let n = 0;
function repo() {
  const d = path.join(TMP, `r${n++}`);
  fs.mkdirSync(d, { recursive: true });
  g(d, ['init', '-q', '-b', 'main']);
  return d;
}
function g(cwd, args) {
  const r = spawnSync('git', ['-c', 'user.name=Prueba', '-c', 'user.email=prueba@ejemplo.invalid', ...args], { cwd, encoding: 'utf8', env: ENTORNO });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}
function escribir(d, rel, texto) {
  const p = path.join(d, ...rel.split('/'));
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, texto);
}
function commit(d, archivos) {
  for (const [rel, txt] of Object.entries(archivos)) escribir(d, rel, txt);
  g(d, ['add', '-A']);
  g(d, ['commit', '-q', '-m', 'c']);
}
const ficha = (extra = '') => `---\nkit: 3.0.0\nnivel: liviano\nvars:\n  proyecto: x\n${extra}---\n`;
// Un repo con la ficha commiteada en main (y el CLAUDE.md, salvo que se pida otra cosa).
function repoCon(extra, claude = CLAUDE) {
  const d = repo();
  const archivos = { [FICHA]: ficha(extra) };
  if (claude !== null) archivos['CLAUDE.md'] = claude;
  commit(d, archivos);
  return d;
}
function correr(cwd, args) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], { cwd, encoding: 'utf8', env: ENTORNO });
  return { codigo: r.status, out: r.stdout, err: r.stderr };
}
const generar = (d) => correr(d, ['generar']);
const agents = (d) => path.join(d, 'AGENTS.md');
const leer = (d) => fs.readFileSync(agents(d), 'utf8');
const unaLinea = (out) => assert.equal(out.split('\n').filter((l) => l !== '').length, 1, `una sola línea, vino: ${JSON.stringify(out)}`);

test('multi-llm: sí crea AGENTS.md = la marca, un renglón vacío y el CLAUDE.md tal cual', () => {
  const d = repoCon('multi-llm: sí\n');
  const r = generar(d);
  assert.equal(r.codigo, 0, r.err);
  assert.equal(leer(d), `${MARCA}\n\n${CLAUDE}`);
  assert.match(r.out, /creado/);
  unaLinea(r.out);
  assert.equal(r.err, '');
});

test('la segunda corrida no cambia nada: ni el archivo (mtime) ni el contenido, y lo dice', () => {
  const d = repoCon('multi-llm: sí\n');
  generar(d);
  const viejo = new Date('2020-01-01T00:00:00Z');
  fs.utimesSync(agents(d), viejo, viejo);
  const r = generar(d);
  assert.equal(r.codigo, 0, r.err);
  assert.match(r.out, /ya estaba al día/);
  unaLinea(r.out);
  assert.equal(fs.statSync(agents(d)).mtimeMs, viejo.getTime());
  assert.equal(leer(d), `${MARCA}\n\n${CLAUDE}`);
});

test('si cambia el CLAUDE.md, se regenera', () => {
  const d = repoCon('multi-llm: sí\n');
  generar(d);
  escribir(d, 'CLAUDE.md', `${CLAUDE}- tres\n`);
  const r = generar(d);
  assert.equal(r.codigo, 0, r.err);
  assert.match(r.out, /regenerado/);
  unaLinea(r.out);
  assert.equal(leer(d), `${MARCA}\n\n${CLAUDE}- tres\n`);
});

test('un AGENTS.md ajeno (sin la línea) no se pisa: salida 1 y el aviso', () => {
  const d = repoCon('multi-llm: sí\n');
  escribir(d, 'AGENTS.md', '# Mío\n\nLo uso para otra cosa.\n');
  const r = generar(d);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /AGENTS\.md ya existe y no lo generó el kit: no lo toco; si querés que lo genere, borralo o movelo/);
  unaLinea(r.out);
  assert.equal(leer(d), '# Mío\n\nLo uso para otra cosa.\n');
});

test('un AGENTS.md con la marca en otra línea que la primera tampoco es del kit', () => {
  const d = repoCon('multi-llm: sí\n');
  escribir(d, 'AGENTS.md', `# Mío\n${MARCA}\n`);
  assert.equal(generar(d).codigo, 1);
  assert.equal(leer(d), `# Mío\n${MARCA}\n`);
});

test('un AGENTS.md vacío es ajeno: no se pisa', () => {
  const d = repoCon('multi-llm: sí\n');
  escribir(d, 'AGENTS.md', '');
  assert.equal(generar(d).codigo, 1);
  assert.equal(leer(d), '');
});

test('un AGENTS.md que es una carpeta no se pisa: salida 1', () => {
  const d = repoCon('multi-llm: sí\n');
  fs.mkdirSync(agents(d));
  const r = generar(d);
  assert.equal(r.codigo, 1);
  assert.ok(fs.statSync(agents(d)).isDirectory());
});

test('uno del kit guardado con CRLF se reconoce y se regenera con LF', () => {
  const d = repoCon('multi-llm: sí\n');
  escribir(d, 'AGENTS.md', `${MARCA}\r\n\r\n${CLAUDE.replace(/\n/g, '\r\n')}`);
  const r = generar(d);
  assert.equal(r.codigo, 0, r.err);
  assert.equal(leer(d), `${MARCA}\n\n${CLAUDE}`);
});

test('un CLAUDE.md con CRLF y BOM sale con LF y sin BOM', () => {
  const d = repoCon('multi-llm: sí\n', `${BOM}${CLAUDE.replace(/\n/g, '\r\n')}`);
  assert.equal(generar(d).codigo, 0);
  assert.equal(leer(d), `${MARCA}\n\n${CLAUDE}`);
});

test('multi-llm: no no escribe nada, aunque exista un AGENTS.md ajeno', () => {
  const d = repoCon('multi-llm: no\n');
  const r = generar(d);
  assert.equal(r.codigo, 0, r.err);
  assert.equal(fs.existsSync(agents(d)), false);
  unaLinea(r.out);
  escribir(d, 'AGENTS.md', '# Ajeno\n');
  const r2 = generar(d);
  assert.equal(r2.codigo, 0);
  assert.equal(leer(d), '# Ajeno\n');
});

test('multi-llm: no tampoco toca uno que sí es del kit (queda como estaba)', () => {
  const d = repoCon('multi-llm: no\n');
  escribir(d, 'AGENTS.md', `${MARCA}\n\nviejo\n`);
  assert.equal(generar(d).codigo, 0);
  assert.equal(leer(d), `${MARCA}\n\nviejo\n`);
});

test('sin el campo multi-llm: nada', () => {
  const d = repoCon('');
  const r = generar(d);
  assert.equal(r.codigo, 0, r.err);
  assert.equal(fs.existsSync(agents(d)), false);
  unaLinea(r.out);
});

test('sin ficha: nada, salida 0 y una línea', () => {
  const d = repoCon('multi-llm: sí\n');
  fs.rmSync(path.join(d, '.claude'), { recursive: true });
  g(d, ['add', '-A']);
  g(d, ['commit', '-q', '-m', 'sin ficha']);
  const r = generar(d);
  assert.equal(r.codigo, 0, r.err);
  assert.equal(fs.existsSync(agents(d)), false);
  assert.match(r.out, /sin ficha/);
  unaLinea(r.out);
});

test('ficha rota: nada, salida 0 y "ficha rota: <archivo>:<línea> — corré doctor"', () => {
  const d = repoCon('multi-llm: sí\ncolorcito:\n\ta: b\n');
  const r = generar(d);
  assert.equal(r.codigo, 0, r.err);
  assert.equal(fs.existsSync(agents(d)), false);
  assert.match(r.out, /^ficha rota: \.claude\/kit\.md:\d+ — corré doctor\n$/);
  unaLinea(r.out);
});

test('la ficha vigente es la de la rama por defecto: una ficha sin commitear con multi-llm: sí no cuenta', () => {
  const d = repoCon('multi-llm: no\n');
  escribir(d, FICHA, ficha('multi-llm: sí\n'));
  const r = generar(d);
  assert.equal(r.codigo, 0, r.err);
  assert.equal(fs.existsSync(agents(d)), false);
});

test('la ficha vigente es la de main aunque la rama actual diga otra cosa', () => {
  const d = repoCon('multi-llm: sí\n');
  g(d, ['switch', '-q', '-c', 'otra']);
  commit(d, { [FICHA]: ficha('multi-llm: no\n') });
  assert.equal(generar(d).codigo, 0);
  assert.equal(leer(d), `${MARCA}\n\n${CLAUDE}`);
});

test('con multi-llm: sí y sin CLAUDE.md: salida 3', () => {
  const d = repoCon('multi-llm: sí\n', null);
  const r = generar(d);
  assert.equal(r.codigo, 3);
  assert.match(r.err, /CLAUDE\.md/);
  assert.equal(fs.existsSync(agents(d)), false);
});

test('con multi-llm: no y sin CLAUDE.md: nada que hacer, salida 0', () => {
  const d = repoCon('multi-llm: no\n', null);
  assert.equal(generar(d).codigo, 0);
});

test('--raiz: genera en esa carpeta aunque se corra desde otra', () => {
  const d = repoCon('multi-llm: sí\n');
  const afuera = path.join(TMP, 'afuera');
  fs.mkdirSync(afuera, { recursive: true });
  const r = correr(afuera, ['generar', '--raiz', d]);
  assert.equal(r.codigo, 0, r.err);
  assert.equal(leer(d), `${MARCA}\n\n${CLAUDE}`);
  assert.equal(fs.existsSync(path.join(afuera, 'AGENTS.md')), false);
});

test('sin --raiz, usa la raíz del checkout aunque se corra desde una subcarpeta', () => {
  const d = repoCon('multi-llm: sí\n');
  const sub = path.join(d, 'a', 'b');
  fs.mkdirSync(sub, { recursive: true });
  assert.equal(correr(sub, ['generar']).codigo, 0);
  assert.equal(leer(d), `${MARCA}\n\n${CLAUDE}`);
  assert.equal(fs.existsSync(path.join(sub, 'AGENTS.md')), false);
});

test('no deja archivos temporales al lado', () => {
  const d = repoCon('multi-llm: sí\n');
  generar(d);
  escribir(d, 'CLAUDE.md', `${CLAUDE}- tres\n`);
  generar(d);
  assert.deepEqual(fs.readdirSync(d).filter((x) => x.endsWith('.tmp')), []);
});

test('escritura atómica: si el renombre falla, el AGENTS.md anterior queda intacto y no sobra el temporal', () => {
  const { escribirAtomico } = require('./agents.cjs');
  const d = repo();
  escribir(d, 'AGENTS.md', 'viejo\n');
  const real = fs.renameSync;
  fs.renameSync = () => {
    throw Object.assign(new Error('falla simulada'), { code: 'EPERM' });
  };
  try {
    assert.throws(() => escribirAtomico(agents(d), 'nuevo\n'), /falla simulada/);
  } finally {
    fs.renameSync = real;
  }
  assert.equal(leer(d), 'viejo\n');
  assert.deepEqual(fs.readdirSync(d).filter((x) => x.endsWith('.tmp')), []);
  escribirAtomico(agents(d), 'nuevo\n');
  assert.equal(leer(d), 'nuevo\n');
});

test('mal llamado: salida 2 y el uso', () => {
  const d = repoCon('multi-llm: sí\n');
  const casos = [
    [],
    ['otra'],
    ['generar', '--raiz'],
    ['generar', '--raiz', '--otro'],
    ['generar', '--raiz', d, '--raiz', d],
    ['generar', '--cosa'],
    ['generar', 'sobra'],
    ['generar', '--raiz', path.join(TMP, 'no-existe')],
  ];
  for (const args of casos) {
    const r = correr(d, args);
    assert.equal(r.codigo, 2, args.join(' '));
    assert.match(r.err, /Uso: node agents\.cjs generar/, args.join(' '));
    assert.equal(r.out, '', args.join(' '));
  }
  assert.equal(fs.existsSync(agents(d)), false);
});

test('sin --raiz y fuera de un repo de git: salida 2', () => {
  const afuera = path.join(TMP, 'sin-git');
  fs.mkdirSync(afuera, { recursive: true });
  const r = spawnSync(process.execPath, [SCRIPT, 'generar'], { cwd: afuera, encoding: 'utf8', env: { ...ENTORNO, GIT_CEILING_DIRECTORIES: TMP } });
  assert.equal(r.status, 2);
});
