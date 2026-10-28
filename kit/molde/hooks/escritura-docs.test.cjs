'use strict';
// Pruebas de escritura-docs.cjs (P4.2; criterio 9 de SPEC-paquete-2): el hook entero corrido como lo corre la plataforma
// (node, JSON por stdin, cwd de la entrada) y sus piezas sueltas. Corren con: node --test "kit/**/*.test.cjs".
// Repos temporales en el directorio temporal del sistema; identidad y fechas fijas; sin la configuración de git de la PC.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-ed-'));
const GLOBAL = path.join(TMP, 'gitconfig-vacio');
fs.writeFileSync(GLOBAL, '');
process.env.GIT_CONFIG_GLOBAL = GLOBAL;
process.env.GIT_CONFIG_NOSYSTEM = '1';

const MOLDE_HOOKS = __dirname;
const ed = require('./escritura-docs.cjs');

test.after(() => fs.rmSync(TMP, { recursive: true, force: true }));

// ---------------------------------------------------------------- ayudantes

const FECHA = '2026-10-01T12:00:00-03:00';
let n = 0;
const carpeta = (nombre = 'r') => {
  const d = path.join(TMP, `${nombre}${n++}`);
  fs.mkdirSync(d, { recursive: true });
  return d;
};
function g(cwd, ...args) {
  const r = spawnSync('git', ['-c', 'user.name=Prueba', '-c', 'user.email=prueba@ejemplo.invalid', ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, GIT_AUTHOR_DATE: FECHA, GIT_COMMITTER_DATE: FECHA },
  });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}
function escribir(d, rel, texto) {
  const p = path.join(d, ...rel.split('/'));
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, texto);
}
function repo(archivos) {
  const d = carpeta();
  g(d, 'init', '-q', '-b', 'main');
  for (const [rel, texto] of Object.entries({ '.gitignore': '/.claude/worktrees/\n/.claude/frenos.log\n', ...archivos })) {
    escribir(d, rel, texto);
    g(d, 'add', '--', rel);
  }
  g(d, 'commit', '-q', '-m', 'c');
  return d;
}
// El hook instanciado (sin los *.test.cjs), como queda en .claude/hooks/ de un proyecto. `sin` deja afuera un archivo.
function instanciar(sin = null) {
  const destino = path.join(carpeta('inst'), '.claude', 'hooks');
  const copiar = (de, a) => {
    fs.mkdirSync(a, { recursive: true });
    for (const e of fs.readdirSync(de, { withFileTypes: true })) {
      if (e.isDirectory()) copiar(path.join(de, e.name), path.join(a, e.name));
      else if (e.name.endsWith('.cjs') && !e.name.endsWith('.test.cjs') && e.name !== sin) fs.copyFileSync(path.join(de, e.name), path.join(a, e.name));
    }
  };
  copiar(MOLDE_HOOKS, destino);
  return path.join(destino, 'escritura-docs.cjs');
}
const HOOK = instanciar();

const ficha = (piezas = '  hook-escritura: molde\n', resto = '') =>
  `---\nkit: 2.4.3\nnivel: liviano\nvars:\n  proyecto: px\n${piezas ? `piezas:\n${piezas}` : ''}${resto}---\n`;
const quitado = (hasta, id = 'candado:raiz') => `frenos:\n  quitados:\n    - {id: ${id}, por: "migrando docs", hasta: ${hasta}}\n`;
const FICHA_ROTA = '---\nkit: 2.4.3\nnivel: liviano\nvars:\n  proyecto: x\ncolorcito:\n\ta: b\n---\n';

const entrada = (cwd, filePath, extra = {}) => ({
  session_id: 'prueba',
  hook_event_name: 'PreToolUse',
  tool_name: 'Write',
  tool_input: { file_path: filePath, content: 'contenido que el hook jamás mira' },
  cwd,
  ...extra,
});

// correr(entrada, {hook, cwd}) → { codigo, out, json }
function correr(e, o = {}) {
  const r = spawnSync(process.execPath, [o.hook || HOOK], {
    input: typeof e === 'string' ? e : JSON.stringify(e),
    cwd: o.cwd || TMP,
    env: process.env,
    encoding: 'utf8',
    timeout: 60000,
  });
  const out = r.stdout || '';
  let json = null;
  if (out.trim()) json = JSON.parse(out);
  return { codigo: r.status, out, json, stderr: r.stderr };
}
const log = (d) => {
  try {
    return fs.readFileSync(path.join(d, '.claude', 'frenos.log'), 'utf8');
  } catch (e) {
    return '';
  }
};
const RE_RENGLON = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2} · (\S+) · (\S+) · candado:raiz · Write · (.+)$/;

function pasa(d, filePath, o = {}) {
  const antes = log(d);
  const r = correr(entrada(o.cwd || d, filePath, o.extra), o);
  assert.equal(r.codigo, 0, `salida de ${filePath}`);
  assert.equal(r.out, '', `no debía frenar: ${filePath}`);
  assert.equal(log(d), antes, `sin renglón: ${filePath}`);
}
function frena(d, filePath, mensaje, o = {}) {
  const antes = log(d);
  const r = correr(entrada(o.cwd || d, filePath), o);
  assert.equal(r.codigo, 0, `salida de ${filePath}`);
  assert.ok(r.json, `debía frenar: ${filePath}`);
  assert.deepEqual(Object.keys(r.json), ['hookSpecificOutput']);
  const h = r.json.hookSpecificOutput;
  assert.equal(h.hookEventName, 'PreToolUse');
  assert.equal(h.permissionDecision, 'deny');
  if (mensaje instanceof RegExp) assert.match(h.permissionDecisionReason, mensaje);
  else if (mensaje) assert.equal(h.permissionDecisionReason, mensaje);
  const nuevo = log(o.logEn || d).slice(antes.length);
  assert.match(nuevo, /^[^\n]+\n$/, `un renglón nuevo: ${filePath}`);
  return { motivo: h.permissionDecisionReason, renglon: nuevo.replace(/\n$/, '') };
}
const msj = (x) => `\`${x}\` no va ahí: a \`modulos/<x>/\` o a \`referencia/\``;

// El repo prendido, compartido por los casos que solo leen (cada frenada suma un renglón; se compara contra el anterior).
const P = repo({ '.claude/kit.md': ficha(), 'docs/TODO.md': '# TODO\n' });
const en = (...partes) => path.join(P, ...partes);

// ---------------------------------------------------------------- pasa: los seis, las tres, lo de afuera

test('pasan los seis archivos de la raíz de docs/', () => {
  for (const f of ['NORTE.md', 'MAPA.md', 'SESSION_HANDOFF.md', 'TODO.md', 'CHANGELOG.md', 'README.md']) pasa(P, en('docs', f));
});

test('pasa lo de adentro de las tres carpetas, a cualquier profundidad y con cualquier extensión', () => {
  for (const f of [
    ['docs', 'modulos', 'x', 'README.md'],
    ['docs', 'modulos', 'x', 'bitacora', '2026-10-28-encargo-01.md'],
    ['docs', 'referencia', 'DECISIONS.md'],
    ['docs', 'archive', 'banner-viejo.png'],
  ]) pasa(P, en(...f));
});

test('pasa lo de afuera de docs/: código, la raíz del repo, un docs/ anidado y otro repo', () => {
  pasa(P, en('src', 'a.js'));
  pasa(P, en('README.md'));
  pasa(P, en('notas.md'));
  pasa(P, en('src', 'docs', 'x.md'));
  pasa(P, en('.claude', 'docs.md'));
  pasa(P, path.join(TMP, 'otro-repo', 'docs', 'notas.md'));
});

// ---------------------------------------------------------------- frena: suelto en la raíz, otra carpeta

test('frena otro archivo suelto en la raíz de docs/, con el mensaje de B §7', () => {
  frena(P, en('docs', 'notas.md'), msj('docs/notas.md'));
  frena(P, en('docs', 'SPEC-login.md'), msj('docs/SPEC-login.md'));
  frena(P, en('docs', 'DECISIONS.md'), msj('docs/DECISIONS.md'));
});

test('frena lo de adentro de una carpeta que no es de las tres', () => {
  frena(P, en('docs', 'specs', 'login.md'), msj('docs/specs/'));
  frena(P, en('docs', 'superpowers', 'specs', 'x.md'), msj('docs/superpowers/'));
  frena(P, en('docs', 'modulo', 'x', 'README.md'), msj('docs/modulo/'));
});

// ---------------------------------------------------------------- rutas: Windows, mayúsculas, .., worktree

test('rutas de Windows: barras invertidas, barras normales y mezcladas', () => {
  const win = P.split('/').join('\\');
  const nix = P.split('\\').join('/');
  frena(P, `${win}\\docs\\notas.md`, msj('docs/notas.md'));
  frena(P, `${nix}/docs/notas.md`, msj('docs/notas.md'));
  frena(P, `${nix}\\docs/notas.md`, msj('docs/notas.md'));
  pasa(P, `${win}\\docs\\TODO.md`);
  pasa(P, `${nix}/docs/referencia/x.md`);
});

test('sin distinguir mayúsculas: Docs/x.md y DOCS\\x.md frenan; DOCS\\TODO.md y Docs/Modulos/ pasan', () => {
  frena(P, en('Docs', 'x.md'), /^`Docs\/x\.md` no va ahí/);
  frena(P, `${P}\\DOCS\\x.md`, /^`DOCS\/x\.md` no va ahí/);
  frena(P, en('docs', 'Specs', 'a.md'), /^`docs\/Specs\/` no va ahí/);
  pasa(P, `${P}\\DOCS\\TODO.md`);
  pasa(P, en('docs', 'readme.md'));
  pasa(P, en('Docs', 'Modulos', 'x', 'README.md'));
  pasa(P, en('DOCS', 'REFERENCIA', 'x.md'));
});

test('el .. se resuelve antes de juzgar', () => {
  frena(P, `${P}/src/../docs/notas.md`, msj('docs/notas.md'));
  frena(P, `${P}/docs/modulos/../notas.md`, msj('docs/notas.md'));
  frena(P, `${P}\\docs\\referencia\\..\\..\\docs\\specs\\a.md`, msj('docs/specs/'));
  pasa(P, `${P}/docs/notas/../TODO.md`);
  pasa(P, `${P}/docs/../src/docs/x.md`);
  pasa(P, `${P}/docs/../notas.md`);
});

test('worktree: cwd en el worktree (o en una subcarpeta), lo escrito ahí y en el principal; el renglón en su checkout', () => {
  const d = repo({ '.claude/kit.md': ficha() });
  g(d, 'worktree', 'add', '-q', '-b', 'worktree-w1', '.claude/worktrees/w1', 'main');
  const wt = path.join(d, '.claude', 'worktrees', 'w1');
  fs.mkdirSync(path.join(wt, 'src'), { recursive: true });
  const r = frena(wt, path.join(wt, 'docs', 'notas.md'), msj('docs/notas.md'));
  assert.match(r.renglon, RE_RENGLON);
  assert.equal(RE_RENGLON.exec(r.renglon)[2], 'worktree-w1');
  assert.equal(log(d), '', 'el principal no recibe el renglón del worktree');
  frena(wt, path.join(wt, 'docs', 'specs', 'a.md'), msj('docs/specs/'), { cwd: path.join(wt, 'src') });
  pasa(wt, path.join(wt, 'docs', 'TODO.md'));
  pasa(wt, path.join(wt, 'docs', 'modulos', 'x', 'README.md'));
  // Desde el worktree, lo que se escribe en el principal también se juzga.
  frena(wt, path.join(d, 'docs', 'notas.md'), msj('docs/notas.md'));
  // Desde el principal, lo escrito adentro de un worktree se juzga contra la raíz de ese worktree.
  frena(d, path.join(d, '.claude', 'worktrees', 'w1', 'docs', 'notas.md'), msj('docs/notas.md'));
  pasa(d, path.join(d, '.claude', 'worktrees', 'w1', 'docs', 'NORTE.md'));
});

// ---------------------------------------------------------------- prendido y apagado

test('apagado sin ficha (ni commiteada: la del disco sin commit no existe todavía)', () => {
  const d = repo({ 'docs/TODO.md': '# TODO\n' });
  pasa(d, path.join(d, 'docs', 'notas.md'));
  escribir(d, '.claude/kit.md', ficha());
  pasa(d, path.join(d, 'docs', 'notas.md'));
});

test('apagado con hook-escritura: no, sin la pieza, sin piezas y con {estado: no}', () => {
  for (const f of [
    ficha('  hook-escritura: no\n'),
    ficha('  candado: molde\n'),
    ficha(''),
    ficha('  hook-escritura: {estado: no, hash: 0123456789ab}\n'),
  ]) {
    const d = repo({ '.claude/kit.md': f });
    pasa(d, path.join(d, 'docs', 'notas.md'));
  }
});

test('prendido con cualquier estado distinto de no, también como {estado, hash}', () => {
  for (const f of [
    ficha('  hook-escritura: molde+propio\n'),
    ficha('  hook-escritura: sí\n'),
    ficha('  hook-escritura: {estado: adaptada, hash: 0123456789ab}\n'),
  ]) {
    const d = repo({ '.claude/kit.md': f });
    frena(d, path.join(d, 'docs', 'notas.md'), msj('docs/notas.md'));
  }
});

test('candado:raiz quitado: hasta siempre o vigente → pasa; vencido → frena; otro id quitado → frena', () => {
  const siempre = repo({ '.claude/kit.md': ficha(undefined, quitado('siempre')) });
  pasa(siempre, path.join(siempre, 'docs', 'notas.md'));
  const vigente = repo({ '.claude/kit.md': ficha(undefined, quitado('2999-12-31')) });
  pasa(vigente, path.join(vigente, 'docs', 'notas.md'));
  const vencido = repo({ '.claude/kit.md': ficha(undefined, quitado('2001-01-01')) });
  frena(vencido, path.join(vencido, 'docs', 'notas.md'), msj('docs/notas.md'));
  const otro = repo({ '.claude/kit.md': ficha(undefined, quitado('siempre', 'candado:topes')) });
  frena(otro, path.join(otro, 'docs', 'notas.md'), msj('docs/notas.md'));
});

test('ficha rota → frena igual y suma "corré doctor"; lo que está en orden pasa igual', () => {
  const d = repo({ '.claude/kit.md': FICHA_ROTA });
  const r = frena(d, path.join(d, 'docs', 'notas.md'));
  assert.match(r.motivo, /^`docs\/notas\.md` no va ahí: a `modulos\/<x>\/` o a `referencia\/` — ficha rota: \.claude\/kit\.md:\d+ — corré doctor$/);
  assert.ok(!r.motivo.includes('colorcito'), 'el mensaje no repite nada de la ficha');
  pasa(d, path.join(d, 'docs', 'TODO.md'));
});

test('la ficha vigente es la de la rama por defecto (regla de 4.7), no la de la rama de la sesión', () => {
  const d = repo({ '.claude/kit.md': ficha('  hook-escritura: no\n') });
  g(d, 'checkout', '-q', '-b', 'otra');
  escribir(d, '.claude/kit.md', ficha());
  g(d, 'add', '--', '.claude/kit.md');
  g(d, 'commit', '-q', '-m', 'prende en otra');
  pasa(d, path.join(d, 'docs', 'notas.md'));
});

// ---------------------------------------------------------------- el JSON y el renglón

test('el JSON deny: solo el objeto en stdout, con la forma de la doc oficial, y salida 0', () => {
  const r = correr(entrada(P, en('docs', 'json.md')));
  assert.equal(r.codigo, 0);
  assert.equal(r.stderr, '');
  assert.ok(r.out.endsWith('\n'));
  assert.deepEqual(JSON.parse(r.out), {
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: msj('docs/json.md') },
  });
});

test('el renglón: fecha con zona · rol · rama · candado:raiz · Write · ruta relativa; solo agrega', () => {
  const d = repo({ '.claude/kit.md': ficha() });
  const r1 = frena(d, path.join(d, 'docs', 'notas.md'));
  assert.deepEqual(RE_RENGLON.exec(r1.renglon).slice(1), ['humano', 'main', 'docs/notas.md']);
  fs.writeFileSync(path.join(d, '.kit-rol'), 'obrero\n');
  const r2 = frena(d, `${d}\\DOCS\\specs\\..\\specs\\a.md`);
  assert.deepEqual(RE_RENGLON.exec(r2.renglon).slice(1), ['obrero', 'main', 'DOCS/specs/a.md']);
  assert.equal(log(d), `${r1.renglon}\n${r2.renglon}\n`);
  assert.ok(!log(d).includes('contenido'), 'el contenido del Write no va al registro');
});

test('sin poder escribir el renglón, el freno vale igual', () => {
  const d = repo({ '.claude/kit.md': ficha() });
  fs.mkdirSync(path.join(d, '.claude', 'frenos.log', 'es-una-carpeta'), { recursive: true });
  const r = correr(entrada(d, path.join(d, 'docs', 'notas.md')));
  assert.equal(r.codigo, 0);
  assert.equal(r.json.hookSpecificOutput.permissionDecision, 'deny');
});

// ---------------------------------------------------------------- si falla, deja pasar

test('si el hook falla, deja pasar: entrada que no es JSON, librería faltante, sin git; siempre salida 0 y sin JSON', () => {
  for (const basura of ['no es json', '[1,2]', '']) {
    const r = correr(basura);
    assert.equal(r.codigo, 0);
    assert.equal(r.out, '');
  }
  const sinArbol = instanciar('arbol.cjs');
  let r = correr(entrada(P, en('docs', 'notas.md')), { hook: sinArbol });
  assert.equal(r.codigo, 0);
  assert.equal(r.out, '');
  const sinGit = carpeta('sin-git');
  r = correr(entrada(sinGit, path.join(sinGit, 'docs', 'notas.md')), { cwd: sinGit });
  assert.equal(r.codigo, 0);
  assert.equal(r.out, '');
});

test('solo Write y solo con ruta: otra herramienta o sin file_path, pasa', () => {
  pasa(P, en('docs', 'notas.md'), { extra: { tool_name: 'Edit' } });
  const r = correr({ ...entrada(P, ''), tool_input: { content: 'x' } });
  assert.equal(r.codigo, 0);
  assert.equal(r.out, '');
});

// ---------------------------------------------------------------- decidir, en proceso: cada "pasa" por su motivo
// (corrido como script, toda falla también termina en "pasa": acá se ve que pasó por la regla y no por una excepción)

test('decidir: cada pasada dice por qué, y la frenada trae salida, juicio y renglón', () => {
  const sinFicha = repo({ 'docs/TODO.md': '# TODO\n' });
  const apagada = repo({ '.claude/kit.md': ficha('  hook-escritura: no\n') });
  const conQuitado = repo({ '.claude/kit.md': ficha(undefined, quitado('siempre')) });
  const sinGit = carpeta('sin-git');
  const porque = (e) => {
    const r = ed.decidir(e);
    assert.equal(r.decision, 'pasa');
    return r.porque;
  };
  assert.equal(porque(entrada(P, en('docs', 'notas.md'), { tool_name: 'Edit' })), 'otra herramienta');
  assert.equal(porque({ ...entrada(P, ''), tool_input: {} }), 'sin ruta');
  assert.equal(porque(entrada(P, en('src', 'a.js'))), 'fuera de docs');
  assert.equal(porque(entrada(sinGit, path.join(sinGit, 'docs', 'notas.md'))), 'sin git');
  assert.equal(porque(entrada(P, en('docs', 'TODO.md'))), 'ruta en orden');
  assert.equal(porque(entrada(sinFicha, path.join(sinFicha, 'docs', 'notas.md'))), 'sin ficha');
  assert.equal(porque(entrada(apagada, path.join(apagada, 'docs', 'notas.md'))), 'pieza apagada');
  assert.equal(porque(entrada(conQuitado, path.join(conQuitado, 'docs', 'notas.md'))), 'quitado vigente');
  const anotados = [];
  const r = ed.decidir(entrada(P, en('docs', 'decidir.md')), {
    ahora: new Date(2026, 9, 28, 10, 0, 0),
    anotar: (raiz, datos) => {
      anotados.push([raiz, datos]);
      return 'el renglón';
    },
  });
  assert.equal(r.decision, 'frena');
  assert.equal(r.renglon, 'el renglón');
  assert.equal(r.juicio.ruta, 'docs/decidir.md');
  assert.deepEqual(r.salida, ed.negar(msj('docs/decidir.md')));
  assert.equal(anotados.length, 1);
  assert.equal(fs.realpathSync(anotados[0][0]), fs.realpathSync(P));
  assert.deepEqual(anotados[0][1], { id: 'candado:raiz', herramienta: 'Write', detalle: 'docs/decidir.md', rol: 'humano', rama: 'main' });
});

// ---------------------------------------------------------------- las piezas sueltas

test('nombraDocs: el atajo antes de git ve "docs" como segmento, sin mayúsculas y con puntos o espacios al final', () => {
  for (const s of ['C:\\p\\docs\\x.md', '/p/Docs/x.md', 'D:/p/DOCS.\\x.md', '/p/docs /x', 'docs/x.md']) assert.ok(ed.nombraDocs(s), s);
  for (const s of ['C:\\p\\src\\x.md', '/p/docsx/a.md', '/p/mis-docs/a.md', '/p/docs.md']) assert.ok(!ed.nombraDocs(s), s);
});

test('quitadoVigente: siempre, hoy incluido, mañana sí; ayer no; otro id no; sin frenos no', () => {
  const ahora = new Date(2026, 9, 28, 23, 59, 0);
  const q = (hasta, id = 'candado:raiz') => ({ frenos: { quitados: [{ id, por: 'x', hasta }] } });
  assert.equal(ed.hoyLocal(ahora), '2026-10-28');
  assert.ok(ed.quitadoVigente(q('siempre'), ahora));
  assert.ok(ed.quitadoVigente(q('2026-10-28'), ahora));
  assert.ok(ed.quitadoVigente(q('2026-10-29'), ahora));
  assert.ok(!ed.quitadoVigente(q('2026-10-27'), ahora));
  assert.ok(!ed.quitadoVigente(q('siempre', 'candado:topes'), ahora));
  assert.ok(!ed.quitadoVigente(q('misión 3'), ahora), 'lo que no es fecha ni siempre no vale (F §14)');
  assert.ok(!ed.quitadoVigente(q(undefined), ahora));
  assert.ok(!ed.quitadoVigente({}, ahora));
  assert.ok(!ed.quitadoVigente(null, ahora));
});

test('estadoPieza: texto, {estado, hash}, ausente', () => {
  assert.equal(ed.estadoPieza({ piezas: { 'hook-escritura': 'molde' } }), 'molde');
  assert.equal(ed.estadoPieza({ piezas: { 'hook-escritura': { estado: 'no', hash: 'x' } } }), 'no');
  assert.equal(ed.estadoPieza({ piezas: { candado: 'molde' } }), null);
  assert.equal(ed.estadoPieza({}), null);
});
