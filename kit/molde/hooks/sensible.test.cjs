'use strict';
// Pruebas de sensible.cjs (SPEC-0 4.5, 4.7 y 6.7, criterios 6 y 7; SPEC-paquete-3 «P4.5 y P6.7», D-1, D-4, D-9, r1-10, r1-11, r1-17):
// cómo matchea, los modos y el rol, los quitados, la bandera, la ficha vigente (worktree sin mergear, sin subir, sin remoto), el
// caché, y los cuatro casos de 4.7. Repos temporales con remoto `bare`, sin la config de git de la PC.
// Corren con: node --test kit/molde/hooks/sensible.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-se-'));
const GLOBAL = path.join(TMP, 'gitconfig-vacio');
fs.writeFileSync(GLOBAL, '');
Object.assign(process.env, {
  GIT_CONFIG_GLOBAL: GLOBAL,
  GIT_CONFIG_NOSYSTEM: '1',
  XDG_CONFIG_HOME: TMP,
  GIT_AUTHOR_NAME: 'Prueba',
  GIT_AUTHOR_EMAIL: 'prueba@ejemplo.invalid',
  GIT_COMMITTER_NAME: 'Prueba',
  GIT_COMMITTER_EMAIL: 'prueba@ejemplo.invalid',
});
test.after(() => fs.rmSync(TMP, { recursive: true, force: true }));

const MOLDE_HOOKS = __dirname;
const se = require('./sensible.cjs');
const comando = require('./lib/comando.cjs');
const gitLib = require('./lib/git.cjs');

// ---------------------------------------------------------------- ayudantes

let n = 0;
const carpeta = (nombre = 'r') => {
  const d = path.join(TMP, `${nombre}${n++}`);
  fs.mkdirSync(d, { recursive: true });
  return d;
};
function g(cwd, ...args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', env: process.env });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}
function escribir(d, rel, texto) {
  const p = path.join(d, ...rel.split('/'));
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, texto);
}
function commitear(d, archivos, msj = 'c') {
  for (const [rel, texto] of Object.entries(archivos)) {
    escribir(d, rel, texto);
    g(d, 'add', '-f', '--', rel);
  }
  g(d, 'commit', '-q', '--allow-empty', '-m', msj);
}
const GITIGNORE = '/.claude/worktrees/\n/.kit-rol\n/.claude/frenos.log\n';
// Sin remoto: un repo con main.
function repo(archivos = {}) {
  const d = carpeta();
  g(d, 'init', '-q', '-b', 'main');
  commitear(d, { '.gitignore': GITIGNORE, ...archivos });
  return d;
}
// Con remoto: un bare, la semilla empujada, y un clon (con origin/HEAD, como en la PC).
function conRemoto(archivos = {}) {
  const bare = carpeta('bare');
  g(bare, 'init', '-q', '--bare', '-b', 'main');
  const semilla = repo(archivos);
  g(semilla, 'remote', 'add', 'origin', bare);
  g(semilla, 'push', '-q', 'origin', 'main');
  const d = carpeta('clon');
  g(TMP, 'clone', '-q', bare, d);
  return d;
}
function worktree(d, rama, rol = null) {
  const w = path.join(d, '.claude', 'worktrees', `w${n++}`);
  g(d, 'worktree', 'add', '-q', '-b', rama, w);
  if (rol) fs.writeFileSync(path.join(w, '.kit-rol'), `${rol}\n`);
  return w;
}

// Una ficha válida con `sensible:` y `frenos.quitados` a gusto.
function ficha({ sensible = null, quitados = [] } = {}) {
  let t = '---\nkit: 2.4.3\nnivel: estandar\nvars:\n  proyecto: px\n';
  if (quitados.length) {
    t += 'frenos:\n  quitados:\n';
    for (const [id, hasta] of quitados) t += `    - {id: ${id}, por: "prueba", hasta: ${hasta}}\n`;
  }
  if (sensible) {
    t += 'sensible:\n';
    for (const [k, v] of Object.entries(sensible)) t += `  ${k}: ${v}\n`;
  }
  return `${t}---\n`;
}
const FICHA_ROTA = '---\nkit: 2.4.3\nnivel: estandar\nvars:\n  proyecto: x\ncolorcito:\n\ta: b\n---\n';
const EJEMPLO = fs.readFileSync(path.join(__dirname, '..', 'kit.ejemplo.md'), 'utf8');
const BASICA = ficha({
  sensible: {
    'datos-reales': '["tabla:clientes", db borrar, tabla clientes de la base real]',
    plata: '[stripe]',
    'sale-afuera': '[node scripts/mandar-mails.cjs, mails a gerencia]',
    claves: '[supabase secrets set]',
    release: '[npm run release]',
  },
});

const entrada = (cwd, command, extra = {}) => ({
  session_id: 'prueba',
  hook_event_name: 'PreToolUse',
  tool_name: 'Bash',
  tool_input: { command },
  cwd,
  permission_mode: 'default',
  ...extra,
});
const log = (d) => {
  try {
    return fs.readFileSync(path.join(d, '.claude', 'frenos.log'), 'utf8');
  } catch (e) {
    return '';
  }
};
const RE_RENGLON = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2} · (\S+) · (\S+) · (pregunta:[a-z-]+) · (Bash|PowerShell) · (.+)\n$/;

// decide en el proceso (rápido): la decisión, el id y el renglón nuevo del log.
function decide(d, e, decision, id = null, opciones = {}) {
  const antes = log(d);
  const r = se.decidir(e, opciones);
  assert.equal(r.decision, decision, `${JSON.stringify(e.tool_input)} en ${e.permission_mode}`);
  const nuevo = log(d).slice(antes.length);
  if (decision === 'nada') {
    assert.equal(nuevo, '', 'nada no deja renglón');
    return r;
  }
  assert.equal(r.id, id);
  const h = r.salida.hookSpecificOutput;
  assert.equal(h.hookEventName, 'PreToolUse');
  assert.equal(h.permissionDecision, decision);
  const m = RE_RENGLON.exec(nuevo);
  assert.ok(m, `un renglón: ${JSON.stringify(nuevo)}`);
  assert.equal(m[3], id);
  assert.ok(!nuevo.includes(e.tool_input.command), 'el renglón nunca lleva el comando');
  return { ...r, motivo: h.permissionDecisionReason, rol: m[1], rama: m[2], herramienta: m[4], detalleLog: m[5] };
}

// El hook instanciado (sin los *.test.cjs), como queda en .claude/hooks/ de un proyecto. `sin` deja afuera un archivo.
function instanciar(sin = null) {
  const destino = path.join(carpeta('inst'), '.claude', 'hooks');
  const copiar = (de, a) => {
    fs.mkdirSync(a, { recursive: true });
    for (const x of fs.readdirSync(de, { withFileTypes: true })) {
      if (x.isDirectory()) copiar(path.join(de, x.name), path.join(a, x.name));
      else if (x.name.endsWith('.cjs') && !x.name.endsWith('.test.cjs') && x.name !== sin) fs.copyFileSync(path.join(de, x.name), path.join(a, x.name));
    }
  };
  copiar(MOLDE_HOOKS, destino);
  return path.join(destino, 'sensible.cjs');
}
const HOOK = instanciar();
function correr(e, hook = HOOK) {
  const r = spawnSync(process.execPath, [hook], { input: typeof e === 'string' ? e : JSON.stringify(e), cwd: TMP, env: process.env, encoding: 'utf8', timeout: 60000 });
  const out = r.stdout || '';
  return { codigo: r.status, out, json: out.trim() ? JSON.parse(out) : null, stderr: r.stderr };
}

// Cuenta los git que se lanzan durante fn (git.correr es el único camino de las librerías).
function contarGits(fn) {
  const orig = gitLib.correr;
  let k = 0;
  gitLib.correr = (...a) => {
    k++;
    return orig(...a);
  };
  try {
    return { r: fn(), gits: k };
  } finally {
    gitLib.correr = orig;
  }
}

const P = conRemoto({ '.claude/kit.md': BASICA });

// ---------------------------------------------------------------- qué es una entrada

test('clasificar: comandos, "tabla:", prosa e inválidas (la regla de prosa)', () => {
  const casos = [
    ['npm run release', 'comando'],
    ['db borrar', 'comando'],
    ['stripe', 'comando'],
    ['node scripts/mandar-mails.cjs', 'comando'],
    ['supabase secrets set', 'comando'],
    ['gh release create --notes de-la', 'comando'], // tiene una opción: no es prosa aunque diga "de"
    ['scripts/a la base.cjs', 'comando'], // tiene una ruta
    ['tabla:clientes', 'tabla'],
    ['TABLA:public.clientes', 'tabla'],
    ['  tabla:x  ', 'tabla'],
    ['tabla clientes de la base real', 'prosa'],
    ['mails a gerencia', 'prosa'],
    ['pagos con tarjeta', 'prosa'],
    ['transferencias y cobros', 'prosa'],
    ['Depósitos', 'prosa'], // la tilde: no es un nombre de programa
    ['¿subir?', 'prosa'],
    ['', 'invalida'],
    ['   ', 'invalida'],
    ['npm test && npm run release', 'invalida'],
    ['npm run release | tee x', 'invalida'],
    ['npm "run', 'invalida'],
    ['> archivo', 'invalida'],
  ];
  for (const [t, tipo] of casos) assert.equal(se.clasificar(t, comando).tipo, tipo, t);
  assert.deepEqual(se.clasificar('npm run release', comando).argv, ['npm', 'run', 'release']);
  assert.equal(se.clasificar(7, comando).tipo, 'invalida');
});

test('matchea: palabras enteras desde el principio de un comando simple; el programa sin ruta ni .exe ni mayúsculas', () => {
  const m = (cmd, ent, ps = false) => se.matchea(comando.partir(cmd, { ps }).comandos[0].argv, se.clasificar(ent, comando).argv, ps, comando);
  assert.equal(m('npm run release', 'npm run release'), true);
  assert.equal(m('npm run release -- --tag beta', 'npm run release'), true);
  assert.equal(m('npm run release-notes', 'npm run release'), false);
  assert.equal(m('npm run', 'npm run release'), false);
  assert.equal(m('npm test release', 'npm run release'), false);
  assert.equal(m('/usr/bin/npm run release', 'npm run release'), true);
  assert.equal(m('"C:\\Program Files\\nodejs\\NPM.CMD" run release', 'npm run release'), true);
  assert.equal(m('npm RUN release', 'npm run release'), false); // Bash: tal cual
  assert.equal(m('npm RUN Release', 'npm run release', true), true); // PowerShell: sin mayúsculas
  assert.equal(m('dbx borrar', 'db borrar'), false);
  // el intérprete: con o sin él, y la ruta por el final
  assert.equal(m('node scripts/mandar-mails.cjs --a', 'node scripts/mandar-mails.cjs'), true);
  assert.equal(m('./scripts/mandar-mails.cjs', 'node scripts/mandar-mails.cjs'), true);
  assert.equal(m('node --env-file=.env D:/repo/scripts/mandar-mails.cjs', 'node scripts/mandar-mails.cjs'), true);
  assert.equal(m('node scripts\\mandar-mails.cjs', 'node scripts/mandar-mails.cjs', true), true);
  assert.equal(m('node scripts/otro.cjs', 'node scripts/mandar-mails.cjs'), false);
  assert.equal(m('node otra/mandar-mails.cjs', 'node scripts/mandar-mails.cjs'), false);
  assert.equal(m('bash scripts/mandar-mails.cjs', 'node scripts/mandar-mails.cjs'), true); // otro intérprete, el mismo script
  assert.equal(se.mismoPrograma('', 'npm'), false);
});

// ---------------------------------------------------------------- los modos y el rol

test('criterio 6: ask en default, acceptEdits, plan y auto, con humano y con obrero; renglón "preguntó <clave>"', () => {
  const w = worktree(P, 'modulo/x--1', 'obrero');
  const casos = [
    ['npm run release', 'pregunta:release', 'release'],
    ['db borrar --todo', 'pregunta:borrar-datos-reales', 'datos-reales'],
    ['stripe payments create', 'pregunta:plata', 'plata'],
    ['node scripts/mandar-mails.cjs', 'pregunta:sale-afuera', 'sale-afuera'],
    ['supabase secrets set X', 'pregunta:claves', 'claves'],
  ];
  for (const [d, rol, rama] of [[P, 'humano', 'main'], [w, 'obrero', 'modulo/x--1']]) {
    for (const modo of ['default', 'acceptEdits', 'plan', 'auto']) {
      for (const [c, id, clave] of casos) {
        const r = decide(d, entrada(d, c, { permission_mode: modo }), 'ask', id);
        assert.equal(r.rol, rol);
        assert.equal(r.rama, rama);
        assert.equal(r.detalleLog, `preguntó ${clave}`);
        assert.ok(r.motivo.includes(`«${se.PREGUNTAS[clave]}»`), r.motivo);
        assert.ok(r.motivo.includes(`sensible.${clave}`), r.motivo);
      }
    }
  }
  assert.equal(log(P).includes('modulo/x--1'), false, 'el renglón del worktree queda en el worktree');
});

test('PARADA: nocturno (en cualquier modo), bypassPermissions, dontAsk, sin modo y modo desconocido → deny', () => {
  for (const [modo, det] of [['bypassPermissions', 'bypassPermissions'], ['dontAsk', 'dontAsk'], [undefined, 'sin modo'], ['  ', 'sin modo'], [7, 'sin modo'], ['superModo', 'modo desconocido']]) {
    const e = entrada(P, 'npm run release', { permission_mode: modo });
    if (modo === undefined) delete e.permission_mode;
    const r = decide(P, e, 'deny', 'pregunta:release');
    assert.equal(r.detalleLog, `release (${det})`);
    assert.match(r.motivo, /^esto es «publicar un release» y sin una persona no se hace: dejá PARADA en tu bitácora y pará \(la ficha lo marca en sensible\.release: "npm run release"; /);
    assert.match(r.motivo, /Si sos vos, pasá a default/);
  }
  const w = worktree(P, 'modulo/y--2', 'nocturno');
  for (const modo of ['default', 'acceptEdits', 'plan', 'auto']) {
    const r = decide(w, entrada(w, 'npm run release', { permission_mode: modo }), 'deny', 'pregunta:release');
    assert.equal(r.rol, 'nocturno');
    assert.equal(r.detalleLog, 'release (nocturno)');
    assert.match(r.motivo, /PARADA.*de noche/);
    assert.doesNotMatch(r.motivo, /Si sos vos/);
  }
  // director, actualizador y un rol que no se entiende: con ventana, ask (cualquier rol)
  for (const rol of ['director', 'actualizador', 'jefe']) {
    const x = worktree(P, `modulo/r${n}`, rol);
    decide(x, entrada(x, 'npm run release'), 'ask', 'pregunta:release');
  }
});

test('el hook corrido como lo corre la plataforma: ask y deny por stdout, salida 0; lo que no matchea, sin salida', () => {
  let r = correr(entrada(P, 'npm run release'));
  assert.equal(r.codigo, 0, r.stderr);
  assert.deepEqual(Object.keys(r.json), ['hookSpecificOutput']);
  assert.equal(r.json.hookSpecificOutput.permissionDecision, 'ask');
  r = correr(entrada(P, 'npm run release', { permission_mode: 'bypassPermissions', tool_name: 'PowerShell' }));
  assert.equal(r.json.hookSpecificOutput.permissionDecision, 'deny');
  assert.match(log(P), /pregunta:release · PowerShell · release \(bypassPermissions\)\n$/);
  r = correr(entrada(P, 'git status', { permission_mode: 'bypassPermissions' }));
  assert.equal(r.codigo, 0);
  assert.equal(r.out, '');
});

// ---------------------------------------------------------------- qué matchea y qué no

test('prosa y "tabla:" no matchean nunca, en ningún modo', () => {
  for (const modo of ['default', 'bypassPermissions']) {
    for (const c of ['mails a gerencia', 'tabla clientes de la base real', 'tabla:clientes', 'echo tabla:clientes', 'psql -c "DELETE FROM clientes"', 'tabla', 'mails']) {
      decide(P, entrada(P, c, { permission_mode: modo }), 'nada');
    }
  }
});

test('las palabras enteras: release-notes, otro script, otro programa → nada; adentro de bash -c, $( ), &&, powershell -Command → pregunta', () => {
  for (const c of ['npm run release-notes', 'npm run releases', 'npm run', 'echo npm run release', 'git commit -m "npm run release"', 'node scripts/otro.cjs', 'stripes', 'dbborrar']) {
    decide(P, entrada(P, c), 'nada');
  }
  for (const c of ['bash -c "npm run release"', 'sh -c \'cd x && npm run release\'', 'git pull && npm run release', 'echo $(npm run release)', 'FOO=1 npm run release', 'env X=1 npm run release', 'cmd /c "npm run release"']) {
    decide(P, entrada(P, c), 'ask', 'pregunta:release');
  }
  decide(P, entrada(P, 'powershell -Command "npm run release"', { tool_name: 'PowerShell' }), 'ask', 'pregunta:release');
});

test('PowerShell sin mayúsculas; Bash, tal cual (salvo el programa)', () => {
  decide(P, entrada(P, 'NPM Run RELEASE', { tool_name: 'PowerShell' }), 'ask', 'pregunta:release');
  decide(P, entrada(P, '& npm.cmd run release', { tool_name: 'PowerShell' }), 'ask', 'pregunta:release');
  decide(P, entrada(P, 'npm Run', { tool_name: 'PowerShell' }), 'nada'); // más corto que la entrada
  decide(P, entrada(P, 'npm run release-notes', { tool_name: 'PowerShell' }), 'nada');
  decide(P, entrada(P, 'npm Run RELEASE'), 'nada');
  decide(P, entrada(P, 'NPM run release'), 'ask', 'pregunta:release');
});

test('otra herramienta, sin comando o comando vacío → nada', () => {
  decide(P, { ...entrada(P, 'npm run release'), tool_name: 'Write' }, 'nada');
  decide(P, { ...entrada(P, 'x'), tool_input: {} }, 'nada');
  decide(P, entrada(P, '   '), 'nada');
  decide(P, entrada(P, 7), 'nada');
});

// ---------------------------------------------------------------- la bandera y los quitados

test('D-4: --borra-datos-reales cuenta siempre como datos-reales (sin ficha, con "no", en PowerShell, con =, adentro de bash -c)', () => {
  const sinFicha = repo();
  const conNo = conRemoto({ '.claude/kit.md': ficha({ sensible: { 'datos-reales': 'no' } }) });
  for (const d of [sinFicha, conNo, P]) {
    const r = decide(d, entrada(d, 'node .claude/scripts/db.cjs migrar --borra-datos-reales'), 'ask', 'pregunta:borrar-datos-reales');
    assert.match(r.motivo, /el comando lleva --borra-datos-reales/);
    decide(d, entrada(d, 'db migrar --borra-datos-reales', { permission_mode: 'bypassPermissions' }), 'deny', 'pregunta:borrar-datos-reales');
  }
  decide(P, entrada(P, 'db migrar --BORRA-DATOS-REALES=si', { tool_name: 'PowerShell' }), 'ask', 'pregunta:borrar-datos-reales');
  decide(P, entrada(P, 'bash -c "db migrar --borra-datos-reales"'), 'ask', 'pregunta:borrar-datos-reales');
  decide(P, entrada(P, 'db migrar --borra-datos-realesx'), 'nada');
  decide(P, entrada(P, 'db migrar --no-borra-datos-reales'), 'nada');
});

test('quitados: vigente (siempre, una fecha futura, hoy) → nada; vencido → pregunta; solo esa clave', () => {
  const d = conRemoto({
    '.claude/kit.md': ficha({
      sensible: { release: '[npm run release]', plata: '[stripe]', claves: '[gh secret set]', 'datos-reales': '[db borrar]' },
      quitados: [['pregunta:release', 'siempre'], ['pregunta:plata', '2999-12-31'], ['pregunta:claves', '2020-01-01'], ['pregunta:borrar-datos-reales', '2026-11-15']],
    }),
  });
  decide(d, entrada(d, 'npm run release', { permission_mode: 'bypassPermissions' }), 'nada');
  decide(d, entrada(d, 'stripe x', { permission_mode: 'bypassPermissions' }), 'nada');
  decide(d, entrada(d, 'gh secret set X'), 'ask', 'pregunta:claves');
  // el día de hasta, incluido; el día siguiente, ya no
  const hoy = new Date(2026, 10, 15, 23, 0, 0);
  const manana = new Date(2026, 10, 16, 0, 30, 0);
  decide(d, entrada(d, 'db borrar'), 'nada', null, { ahora: hoy });
  decide(d, entrada(d, 'db migrar --borra-datos-reales'), 'nada', null, { ahora: hoy });
  decide(d, entrada(d, 'db borrar'), 'ask', 'pregunta:borrar-datos-reales', { ahora: manana });
  // un comando que toca dos claves: la quitada no tapa a la otra
  decide(d, entrada(d, 'npm run release && gh secret set X'), 'ask', 'pregunta:claves');
});

// ---------------------------------------------------------------- la ficha vigente (criterio 7)

test('criterio 7: sensible: cambiado y commiteado en un worktree sin mergear no cambia nada; en el disco tampoco; sin subir tampoco', () => {
  const d = conRemoto({ '.claude/kit.md': ficha({ sensible: { release: '[npm run release]' } }) });
  const otra = ficha({ sensible: { release: 'no', plata: '[stripe]' } });
  const w = worktree(d, 'modulo/z--3', 'obrero');
  commitear(w, { '.claude/kit.md': otra }, 'el obrero afloja');
  escribir(w, '.claude/kit.md', ficha({ sensible: { claves: '[gh secret set]' } }));
  for (const x of [w, d]) {
    decide(x, entrada(x, 'npm run release'), 'ask', 'pregunta:release');
    decide(x, entrada(x, 'stripe x'), 'nada');
    decide(x, entrada(x, 'gh secret set X'), 'nada');
  }
  // commit en el main local sin subir (hay remoto): sigue mandando origin/main
  commitear(d, { '.claude/kit.md': otra }, 'main local');
  decide(d, entrada(d, 'npm run release'), 'ask', 'pregunta:release');
  decide(d, entrada(d, 'stripe x'), 'nada');
  // al subirlo, cambia (y el caché se rehace)
  g(d, 'push', '-q', 'origin', 'main');
  decide(d, entrada(d, 'npm run release'), 'nada');
  decide(d, entrada(d, 'stripe x'), 'ask', 'pregunta:plata');
  decide(w, entrada(w, 'stripe x'), 'ask', 'pregunta:plata');
});

test('sin remoto: manda la rama local por defecto (lo commiteado); un worktree sin mergear, no', () => {
  const d = repo({ '.claude/kit.md': ficha({ sensible: { release: '[npm run release]' } }) });
  const w = worktree(d, 'modulo/s--1');
  commitear(w, { '.claude/kit.md': ficha({ sensible: { plata: '[stripe]' } }) });
  decide(w, entrada(w, 'stripe x'), 'nada');
  escribir(d, '.claude/kit.md', ficha({ sensible: { plata: '[stripe]' } }));
  decide(d, entrada(d, 'stripe x'), 'nada');
  g(d, 'add', '.claude/kit.md');
  g(d, 'commit', '-q', '-m', 'main');
  decide(d, entrada(d, 'stripe x'), 'ask', 'pregunta:plata');
  decide(w, entrada(w, 'stripe x'), 'ask', 'pregunta:plata');
  decide(w, entrada(w, 'npm run release'), 'nada');
});

test('kit.ejemplo.md como ficha vigente: sus entradas de comando preguntan, la de tabla no, el quitado de datos-reales vale hasta su fecha', () => {
  const d = conRemoto({ '.claude/kit.md': EJEMPLO });
  decide(d, entrada(d, 'npm run release'), 'ask', 'pregunta:release');
  decide(d, entrada(d, 'node scripts/mandar-mails.cjs --a gerencia'), 'ask', 'pregunta:sale-afuera');
  decide(d, entrada(d, 'gh secret set HUB_TOKEN'), 'ask', 'pregunta:claves');
  decide(d, entrada(d, 'supabase secrets set X'), 'ask', 'pregunta:claves');
  decide(d, entrada(d, 'tabla:clientes'), 'nada');
  decide(d, entrada(d, 'db borrar x'), 'nada', null, { ahora: new Date(2026, 9, 29) });
  decide(d, entrada(d, 'db borrar x'), 'ask', 'pregunta:borrar-datos-reales', { ahora: new Date(2026, 10, 16) });
  decide(d, entrada(d, 'git status'), 'nada');
});

// ---------------------------------------------------------------- el caché (r1-10)

const archivoCache = (d) => path.join(g(d, 'rev-parse', '--path-format=absolute', '--git-common-dir'), se.ARCHIVO_CACHE);

test('caché: la primera vez lee con git; después, ningún git (tampoco cuando pregunta); se comparte con los worktrees', () => {
  const d = conRemoto({ '.claude/kit.md': BASICA });
  let x = contarGits(() => se.decidir(entrada(d, 'git status')));
  assert.equal(x.r.origen, 'git');
  assert.ok(x.gits > 0);
  assert.ok(fs.existsSync(archivoCache(d)));
  for (const c of ['git status', 'ls', 'npm run release']) {
    x = contarGits(() => se.decidir(entrada(d, c)));
    assert.equal(x.r.origen, 'cache');
    assert.equal(x.gits, 0, c);
  }
  assert.equal(x.r.decision, 'ask');
  const w = worktree(d, 'modulo/c--1', 'obrero');
  x = contarGits(() => se.decidir(entrada(w, 'npm run release')));
  assert.equal(x.r.origen, 'cache');
  assert.equal(x.gits, 0);
  assert.equal(x.r.decision, 'ask');
});

test('caché: se rehace cuando cambia la ref vigente (push, fetch, packed-refs, origin/HEAD, config)', () => {
  const d = conRemoto({ '.claude/kit.md': ficha({ sensible: { release: '[npm run release]' } }) });
  const origen = (c = 'git status') => se.decidir(entrada(d, c)).origen;
  assert.equal(origen(), 'git');
  assert.equal(origen(), 'cache');
  // otro clon empuja; acá, fetch
  const otro = carpeta('otro');
  g(TMP, 'clone', '-q', g(d, 'remote', 'get-url', 'origin'), otro);
  commitear(otro, { '.claude/kit.md': ficha({ sensible: { plata: '[stripe]' } }) });
  g(otro, 'push', '-q', 'origin', 'main');
  assert.equal(se.decidir(entrada(d, 'stripe x')).decision, 'nada'); // sin fetch, la ref no cambió
  g(d, 'fetch', '-q');
  const r = se.decidir(entrada(d, 'stripe x'));
  assert.equal(r.origen, 'git');
  assert.equal(r.decision, 'ask');
  assert.equal(origen(), 'cache');
  // pack-refs mueve las refs a packed-refs: mismos shas → misma huella
  g(d, 'pack-refs', '--all');
  assert.equal(origen(), 'cache');
  // la config cambia (otra rama por defecto) → se rehace
  g(d, 'config', 'init.defaultBranch', 'trunk');
  assert.equal(origen(), 'git');
  assert.equal(origen(), 'cache');
  // origin/HEAD cambia → se rehace
  g(d, 'remote', 'set-head', 'origin', '-d');
  assert.equal(origen(), 'git');
  assert.equal(se.decidir(entrada(d, 'stripe x')).decision, 'ask');
});

test('caché: uno roto, de otra forma o con otra clave se ignora y se rehace; uno falso con la clave correcta… es el riesgo escrito', () => {
  const d = conRemoto({ '.claude/kit.md': ficha({ sensible: { release: '[npm run release]' } }) });
  se.decidir(entrada(d, 'git status'));
  const a = archivoCache(d);
  const bueno = JSON.parse(fs.readFileSync(a, 'utf8'));
  for (const roto of ['{no es json', '', 'null', '[]', JSON.stringify({ ...bueno, v: 99 }), JSON.stringify({ ...bueno, listas: { release: 'npm' } }), JSON.stringify({ ...bueno, candidatas: [] }), JSON.stringify({ ...bueno, estado: 'rara' }), JSON.stringify({ ...bueno, quitados: [{ id: 1 }] }), JSON.stringify({ ...bueno, clave: 'otra', listas: { ...bueno.listas, release: [] } })]) {
    fs.writeFileSync(a, roto);
    const r = se.decidir(entrada(d, 'npm run release'));
    assert.equal(r.origen, 'git', roto.slice(0, 40));
    assert.equal(r.decision, 'ask');
    assert.deepEqual(JSON.parse(fs.readFileSync(a, 'utf8')), bueno, 'se reescribió bien');
  }
  // escritura atómica: no quedan temporales
  assert.deepEqual(fs.readdirSync(path.dirname(a)).filter((x) => x.startsWith(se.ARCHIVO_CACHE) && x !== se.ARCHIVO_CACHE), []);
});

test('caché: si la ref cambia mientras se lee la ficha, no se guarda (la próxima vez se lee de nuevo)', () => {
  const d = conRemoto({ '.claude/kit.md': ficha({ sensible: { release: '[npm run release]' } }) });
  commitear(d, { 'x.txt': 'x' });
  const otroSha = g(d, 'rev-parse', 'HEAD');
  const refArchivo = path.join(d, '.git', 'refs', 'remotes', 'origin', 'main');
  fs.writeFileSync(refArchivo, `${g(d, 'rev-parse', 'origin/main')}\n`); // suelta (le gana a packed-refs), el mismo sha
  const orig = gitLib.correr;
  gitLib.correr = (args, o) => {
    if (args[0] === 'show') fs.writeFileSync(refArchivo, `${otroSha}\n`);
    return orig(args, o);
  };
  try {
    assert.equal(se.decidir(entrada(d, 'git status')).origen, 'git');
  } finally {
    gitLib.correr = orig;
  }
  assert.equal(fs.existsSync(archivoCache(d)), false);
  assert.equal(se.decidir(entrada(d, 'git status')).origen, 'git');
  assert.equal(se.decidir(entrada(d, 'git status')).origen, 'cache');
});

test('caché: sin huella por fs (reftable, .git que no se entiende, fuera de un repo) cae a contexto, correcto y sin escribir', () => {
  const d = conRemoto({ '.claude/kit.md': ficha({ sensible: { release: '[npm run release]' } }) });
  const comun = path.dirname(archivoCache(d));
  fs.mkdirSync(path.join(comun, 'reftable'));
  const r = se.decidir(entrada(d, 'npm run release'));
  assert.equal(r.origen, 'contexto');
  assert.equal(r.decision, 'ask');
  assert.equal(fs.existsSync(path.join(comun, se.ARCHIVO_CACHE)), false);
  fs.rmdirSync(path.join(comun, 'reftable'));
  assert.equal(se.decidir(entrada(d, 'npm run release')).origen, 'git');
  // fuera de un repo: nada pregunta (salvo la bandera), sin error
  const suelto = carpeta('suelto');
  assert.equal(se.decidir(entrada(suelto, 'npm run release')).decision, 'nada');
  assert.equal(se.decidir(entrada(suelto, 'npm run release')).origen, 'contexto');
  assert.equal(se.decidir(entrada(suelto, 'db migrar --borra-datos-reales')).decision, 'ask');
  // gitPorFs: un .git archivo sin gitdir → null
  const raro = carpeta('raro');
  fs.writeFileSync(path.join(raro, '.git'), 'cualquier cosa\n');
  assert.equal(se.gitPorFs(raro), null);
  assert.equal(se.huella(null, ['main']), null);
  assert.equal(se.huella(se.gitPorFs(d), []), null);
});

test('un git que falla al leer la ficha no se cachea y es un freno roto', () => {
  const d = conRemoto({ '.claude/kit.md': ficha({ sensible: { release: '[npm run release]' } }) });
  const orig = gitLib.correr;
  gitLib.correr = (args, o) => (args[0] === 'show' ? { ok: false, codigo: null, stdout: '', salida: Buffer.alloc(0), stderr: '', error: 'tiempo' } : orig(args, o));
  try {
    assert.throws(() => se.decidir(entrada(d, 'git status')), /no se pudo leer la ficha/);
  } finally {
    gitLib.correr = orig;
  }
  assert.equal(fs.existsSync(archivoCache(d)), false);
  // git que no anda del todo (safe.directory, un git roto: sale 128 sin error de proceso) y la rama está en el disco: roto, no "sin ficha"
  gitLib.correr = () => ({ ok: false, codigo: 128, stdout: '', salida: Buffer.alloc(0), stderr: 'fatal', error: null });
  try {
    assert.throws(() => se.decidir(entrada(d, 'git status')), /no ve la rama por defecto/);
  } finally {
    gitLib.correr = orig;
  }
  assert.equal(fs.existsSync(archivoCache(d)), false);
  assert.equal(se.decidir(entrada(d, 'npm run release')).decision, 'ask');
  // un repo recién creado, sin ningún commit: "sin rama" de verdad, nada se traba
  const vacio = carpeta('vacio');
  g(vacio, 'init', '-q', '-b', 'main');
  assert.equal(se.decidir(entrada(vacio, 'npm run release')).decision, 'nada');
});

// ---------------------------------------------------------------- 4.7: los cuatro casos

test('4.7 caso 1 (sin node): lo cubre onFailure "block" del registro (lo escribe G7 en el settings.json); acá, el hook solo no imprime nada raro', () => {
  // El registro es de G7 (único dueño del settings.json): esta prueba no lo mira. Que el hook no escriba a stderr en el camino feliz.
  const r = correr(entrada(P, 'npm run release'));
  assert.equal(r.stderr, '');
});

test('4.7 caso 2 (ficha rota): sensible: sale de la última que se lee, sin ningún quitado, y el motivo dice "ficha rota … corré doctor"', () => {
  const d = conRemoto({ '.claude/kit.md': ficha({ sensible: { release: '[npm run release]' }, quitados: [['pregunta:release', 'siempre']] }) });
  decide(d, entrada(d, 'npm run release'), 'nada');
  commitear(d, { '.claude/kit.md': FICHA_ROTA }, 'rota');
  commitear(d, { 'otro.txt': 'x' }, 'algo más');
  g(d, 'push', '-q', 'origin', 'main');
  let r = decide(d, entrada(d, 'npm run release'), 'ask', 'pregunta:release');
  assert.match(r.motivo, /ficha rota: \.claude\/kit\.md:\d+ — corré doctor/);
  r = decide(d, entrada(d, 'npm run release', { permission_mode: 'bypassPermissions' }), 'deny', 'pregunta:release');
  assert.match(r.motivo, /PARADA.*ficha rota: \.claude\/kit\.md:\d+ — corré doctor/);
  decide(d, entrada(d, 'git status'), 'nada');
  // corrida como la plataforma
  assert.match(correr(entrada(d, 'npm run release')).json.hookSpecificOutput.permissionDecisionReason, /ficha rota/);
});

test('4.7 caso 2 bis: ficha rota sin ninguna anterior que se lea → nada de la lista, la bandera igual (con el aviso)', () => {
  const d = conRemoto({ '.claude/kit.md': FICHA_ROTA });
  decide(d, entrada(d, 'npm run release'), 'nada');
  const r = decide(d, entrada(d, 'db migrar --borra-datos-reales'), 'ask', 'pregunta:borrar-datos-reales');
  assert.match(r.motivo, /ficha rota/);
});

test('4.7 caso 3 (error interno): no JSON, vacía, no objeto, una librería que falta → deny "freno roto: corré doctor", salida 0', () => {
  for (const t of ['no es json', '', '[]', 'null', '"texto"']) {
    const r = correr(t);
    assert.equal(r.codigo, 0);
    assert.deepEqual(r.json, se.salida('deny', se.ROTO));
  }
  for (const falta of ['comando.cjs', 'contexto.cjs', 'ficha.cjs']) {
    const r = correr(entrada(conRemoto({ '.claude/kit.md': BASICA }), 'git status'), instanciar(falta));
    assert.equal(r.codigo, 0);
    assert.deepEqual(r.json, se.salida('deny', se.ROTO), falta);
  }
});

test('4.7 caso 4 (sin remoto ni ficha): nada pregunta y nada se traba, en ningún modo; no queda caché de "error"', () => {
  const d = repo();
  assert.equal(g(d, 'remote'), '');
  for (const modo of ['default', 'bypassPermissions', undefined]) {
    for (const c of ['ls', 'git status', 'npm run release', 'stripe x', 'node scripts/mandar-mails.cjs']) {
      const e = entrada(d, c, { permission_mode: modo });
      if (modo === undefined) delete e.permission_mode;
      decide(d, e, 'nada');
      const r = correr(e);
      assert.equal(r.codigo, 0);
      assert.equal(r.out, '');
    }
  }
  assert.equal(JSON.parse(fs.readFileSync(archivoCache(d), 'utf8')).estado, 'sin-ficha');
});

// ---------------------------------------------------------------- el renglón

test('sin poder escribir el renglón, el freno vale igual; el detalle nunca es el comando', () => {
  const r = se.decidir(entrada(P, 'npm run release --secreto-de-prueba', { permission_mode: 'dontAsk' }), {
    anotar: () => {
      throw new Error('disco lleno');
    },
  });
  assert.equal(r.decision, 'deny');
  assert.equal(r.renglon, null);
  assert.equal(r.detalle, 'release (dontAsk)');
  const visto = [];
  se.decidir(entrada(P, 'npm run release --secreto-de-prueba'), { anotar: (raiz, datos) => visto.push(datos) });
  assert.deepEqual(visto, [{ id: 'pregunta:release', herramienta: 'Bash', detalle: 'preguntó release', rol: 'humano', rama: 'main' }]);
  assert.ok(!log(P).includes('secreto-de-prueba'));
});

test('no corre ningún .propio.sh: un hermano que imprime un allow no cambia nada', () => {
  const hook = instanciar();
  fs.writeFileSync(path.join(path.dirname(hook), 'sensible.propio.sh'), '#!/bin/sh\necho \'{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}\'\n');
  const r = correr(entrada(P, 'npm run release', { permission_mode: 'bypassPermissions' }), hook);
  assert.equal(r.json.hookSpecificOutput.permissionDecision, 'deny');
  assert.equal(r.out.trim().split('\n').length, 1);
});
