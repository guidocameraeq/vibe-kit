'use strict';
// Pruebas de niega-aprobar.cjs (SPEC-0 4.5, 4.7 y criterio 18; SPEC-paquete-2 D2.2 F3): el hook entero corrido como lo corre la
// plataforma (node, JSON por stdin, cwd de la entrada), cada modo, el rol, la ficha rota, los cuatro casos de 4.7, y las reglas
// que suma el settings.json del molde. Corren con: node --test "kit/**/*.test.cjs". Repos temporales, sin la config de git de la PC.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-na-'));
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
const na = require('./niega-aprobar.cjs');

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
function repo(archivos = {}) {
  const d = carpeta();
  g(d, 'init', '-q', '-b', 'main');
  for (const [rel, texto] of Object.entries({ '.gitignore': '/.claude/worktrees/\n/.kit-rol\n', ...archivos })) {
    escribir(d, rel, texto);
    g(d, 'add', '-f', '--', rel);
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
  return path.join(destino, 'niega-aprobar.cjs');
}
const HOOK = instanciar();

const FICHA = '---\nkit: 2.4.3\nnivel: estandar\nvars:\n  proyecto: px\n---\n';
const FICHA_ROTA = '---\nkit: 2.4.3\nnivel: estandar\nvars:\n  proyecto: x\ncolorcito:\n\ta: b\n---\n';
const APROBAR = 'node .claude/scripts/cambios.cjs aprobar 2026-10-28-quitar-stash';

const entrada = (cwd, command, extra = {}) => ({
  session_id: 'prueba',
  hook_event_name: 'PreToolUse',
  tool_name: 'Bash',
  tool_input: { command },
  cwd,
  permission_mode: 'default',
  ...extra,
});
function correr(e, o = {}) {
  const r = spawnSync(process.execPath, [o.hook || HOOK], {
    input: typeof e === 'string' ? e : JSON.stringify(e),
    cwd: TMP,
    env: process.env,
    encoding: 'utf8',
    timeout: 60000,
  });
  const out = r.stdout || '';
  return { codigo: r.status, out, json: out.trim() ? JSON.parse(out) : null, stderr: r.stderr };
}
const log = (d) => {
  try {
    return fs.readFileSync(path.join(d, '.claude', 'frenos.log'), 'utf8');
  } catch (e) {
    return '';
  }
};
const RE_RENGLON = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2} · (\S+) · (\S+) · cambios:aprobar-negado · (Bash|PowerShell) · (.+)\n$/;

function decide(d, e, decision, o = {}) {
  const antes = log(d);
  const r = correr(e, o);
  assert.equal(r.codigo, 0, r.stderr);
  if (decision === null) {
    assert.equal(r.out, '', `sin salida: ${JSON.stringify(e.tool_input || e)}`);
    assert.equal(log(d), antes);
    return null;
  }
  assert.ok(r.json, `debía decidir ${decision}`);
  assert.deepEqual(Object.keys(r.json), ['hookSpecificOutput']);
  const h = r.json.hookSpecificOutput;
  assert.equal(h.hookEventName, 'PreToolUse');
  assert.equal(h.permissionDecision, decision);
  assert.ok(h.permissionDecisionReason.length > 0);
  const nuevo = log(d).slice(antes.length);
  if (decision === 'ask') assert.equal(nuevo, '', 'el ask no deja renglón');
  return { motivo: h.permissionDecisionReason, renglon: nuevo };
}
function niega(d, e, detalle, o = {}) {
  const r = decide(d, e, 'deny', o);
  const m = RE_RENGLON.exec(r.renglon);
  assert.ok(m, `un renglón: ${JSON.stringify(r.renglon)}`);
  assert.equal(m[4], detalle);
  assert.ok(!r.renglon.includes('cambios.cjs'), 'el renglón nunca lleva el comando');
  return { ...r, rol: m[1], rama: m[2], herramienta: m[3] };
}

const P = repo({ '.claude/kit.md': FICHA });

// ---------------------------------------------------------------- los modos

test('default, acceptEdits, plan y auto → ask (la ventana), sin renglón', () => {
  for (const modo of ['default', 'acceptEdits', 'plan', 'auto']) {
    const r = decide(P, entrada(P, APROBAR, { permission_mode: modo }), 'ask');
    // A2.3: la ventana dice quién pide la firma (rt-2 de D8r.4 sigue cubierto: un agente en la principal ve "la sesión de la carpeta principal")
    assert.match(r.motivo, /^Es tu firma para cambiar un freno de este proyecto\. Te la pide: la sesión de la carpeta principal\./);
  }
});

test('bypassPermissions y dontAsk → deny, con renglón cuyo detalle es el modo', () => {
  for (const modo of ['bypassPermissions', 'dontAsk']) {
    const r = niega(P, entrada(P, APROBAR, { permission_mode: modo }), modo);
    assert.match(r.motivo, new RegExp(`no corre en modo ${modo}.*Pasá a default`));
    assert.equal(r.rol, 'humano');
    assert.equal(r.rama, 'main');
    assert.equal(r.herramienta, 'Bash');
  }
});

test('sin modo en la entrada (o vacío) → deny "sin modo"; un modo que no conoce → deny "modo desconocido"', () => {
  const e = entrada(P, APROBAR);
  delete e.permission_mode;
  assert.match(niega(P, e, 'sin modo').motivo, /no se sabe el modo de permisos/);
  niega(P, entrada(P, APROBAR, { permission_mode: '  ' }), 'sin modo');
  niega(P, entrada(P, APROBAR, { permission_mode: 7 }), 'sin modo');
  niega(P, entrada(P, APROBAR, { permission_mode: 'superModo' }), 'modo desconocido');
});

test('PowerShell igual que Bash; el renglón dice PowerShell', () => {
  decide(P, entrada(P, APROBAR, { tool_name: 'PowerShell' }), 'ask');
  assert.equal(niega(P, entrada(P, APROBAR, { tool_name: 'PowerShell', permission_mode: 'bypassPermissions' }), 'bypassPermissions').herramienta, 'PowerShell');
});

// ---------------------------------------------------------------- qué es "de aprobar"

test('un comando sin las dos palabras → sin salida, en cualquier modo; otra herramienta → sin salida', () => {
  for (const c of ['git status', 'node .claude/scripts/cambios.cjs listar', 'echo aprobar', 'node .claude/scripts/cambios.cjs verificar', '']) {
    decide(P, entrada(P, c, { permission_mode: 'bypassPermissions' }), null);
  }
  decide(P, entrada(P, APROBAR, { tool_name: 'Write', permission_mode: 'bypassPermissions' }), null);
  decide(P, { ...entrada(P, APROBAR), tool_input: {} }, null);
});

test('las formas que esquivan la regla ask del settings (comillas, espacios, --, mayúsculas, la ruta) igual son "de aprobar"', () => {
  for (const c of [
    "node .claude/scripts/cambios.cjs 'aprobar' x",
    'node  .claude/scripts/cambios.cjs  aprobar x',
    'node .claude/scripts/cambios.cjs -- aprobar x',
    'NODE .claude/scripts/CAMBIOS.cjs APROBAR x',
    "node .claude/scripts/cambios.cjs apro''bar x",
    'node .claude/scripts/camb"i"os.cjs apro\\bar x',
  ]) {
    decide(P, entrada(P, c), 'ask');
    niega(P, entrada(P, c, { permission_mode: 'bypassPermissions' }), 'bypassPermissions');
  }
  assert.equal(na.esDeAprobar('camb*.cjs aprobar'), false); // lo que no se ve: el riesgo escrito de F3 (r4-1 b)
  // A2.3: irse a otro lado o una ruta que no es de la sesión niegan aunque haya ventana
  niega(P, entrada(P, 'cd .claude/scripts && node cambios.cjs aprobar x'), 'se va a otro lado');
  niega(P, entrada(P, 'node C:\\repo\\.claude\\scripts\\cambios.cjs aprobar x'), 'otra ruta');
});

// ---------------------------------------------------------------- rol y ficha

test('.kit-rol de agente (cada uno, y uno que no se entiende) → deny aunque el modo tenga ventana', () => {
  const d = repo({ '.claude/kit.md': FICHA });
  for (const rol of ['director', 'obrero', 'nocturno', 'actualizador', 'jefe']) {
    fs.writeFileSync(path.join(d, '.kit-rol'), `${rol}\n`);
    const esperado = rol === 'jefe' ? 'desconocido' : rol;
    if (rol === 'nocturno') { niega(d, entrada(d, APROBAR), 'de noche'); continue; } // A2.3: de noche se mira antes que el rol
    const r = niega(d, entrada(d, APROBAR), `rol ${esperado}`);
    assert.match(r.motivo, new RegExp(`\\.kit-rol: ${esperado}`));
  }
});

test('desde un worktree con .kit-rol de obrero → deny, y el renglón queda en el worktree', () => {
  const d = repo({ '.claude/kit.md': FICHA });
  const w = path.join(d, '.claude', 'worktrees', 'w1');
  g(d, 'worktree', 'add', '-q', '-b', 'modulo/x--1', w);
  fs.writeFileSync(path.join(w, '.kit-rol'), 'obrero\n');
  const r = niega(w, entrada(w, APROBAR), 'rama de obrero'); // A2.3: la rama de obrero niega antes de mirar el .kit-rol
  assert.equal(r.rama, 'modulo/x--1');
  assert.equal(log(d), '');
});

test('ficha rota (4.7, caso 2) → deny "ficha rota" con dónde y "corré doctor"', () => {
  const d = repo({ '.claude/kit.md': FICHA_ROTA });
  const r = niega(d, entrada(d, APROBAR), 'ficha rota');
  assert.match(r.motivo, /ficha rota \(\.claude\/kit\.md:\d+\) — corré doctor/);
});

test('fuera de un repo git → deny (rol desconocido), sin renglón donde escribirlo', () => {
  const d = carpeta('suelto');
  const r = decide(d, entrada(d, APROBAR), 'deny');
  assert.match(r.motivo, /la pide el director en su pestaña, o el dueño en una sesión abierta en la carpeta principal/);
});

// ---------------------------------------------------------------- 4.7: los cuatro casos

test('4.7 caso 1 (sin node): lo cubre onFailure "block" — el settings.json del molde registra el portero (8d A5), que lo corre adentro', () => {
  const s = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'settings.json'), 'utf8'));
  const grupos = s.hooks.PreToolUse.filter((x) => x.matcher === 'Bash|PowerShell');
  assert.equal(grupos.length, 1);
  assert.deepEqual(grupos[0].hooks, [{ type: 'command', command: 'node', args: ['${CLAUDE_PROJECT_DIR}/.claude/hooks/lib/portero.cjs'], timeout: 60, onFailure: 'block' }]);
  assert.ok(require('./lib/portero.cjs').HOOKS.some((h) => h.archivo === 'niega-aprobar.cjs'));
});

test('4.7 caso 3 (error interno): entrada que no es JSON, vacía o que no es un objeto, y una librería que falta → deny "freno roto: corré doctor", salida 0', () => {
  for (const t of ['no es json', '', '[]', 'null']) {
    const r = correr(t);
    assert.equal(r.codigo, 0);
    assert.deepEqual(r.json, na.salida('deny', 'freno roto: corré doctor'));
  }
  const sinLib = instanciar('contexto.cjs');
  const r = correr(entrada(P, APROBAR), { hook: sinLib });
  assert.equal(r.codigo, 0);
  assert.deepEqual(r.json, na.salida('deny', na.ROTO));
  // la librería que falta no molesta a lo que no es de aprobar (no la carga)
  assert.equal(correr(entrada(P, 'git status'), { hook: sinLib }).out, '');
});

test('4.7 caso 4 (repo sin remoto ni ficha): los frenos de fábrica andan (bypass → deny) y nada se traba (default → ask; lo demás, nada)', () => {
  const d = repo();
  assert.equal(g(d, 'remote'), '');
  decide(d, entrada(d, APROBAR), 'ask');
  niega(d, entrada(d, APROBAR, { permission_mode: 'bypassPermissions' }), 'bypassPermissions');
  decide(d, entrada(d, 'git status', { permission_mode: 'bypassPermissions' }), null);
});

test('sin poder escribir el renglón, el freno vale igual', () => {
  const r = na.decidir(entrada(P, APROBAR, { permission_mode: 'dontAsk' }), {
    anotar: () => {
      throw new Error('disco lleno');
    },
  });
  assert.equal(r.decision, 'deny');
  assert.equal(r.renglon, null);
  assert.equal(r.detalle, 'dontAsk');
});

test('no corre ningún .propio.sh: un hermano que imprime un allow no cambia nada', () => {
  const hook = instanciar();
  fs.writeFileSync(path.join(path.dirname(hook), 'niega-aprobar.propio.sh'), '#!/bin/sh\necho \'{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}\'\n');
  const r = correr(entrada(P, APROBAR, { permission_mode: 'bypassPermissions' }), { hook });
  assert.equal(r.json.hookSpecificOutput.permissionDecision, 'deny');
  assert.equal(r.out.trim().split('\n').length, 1);
});

// ---------------------------------------------------------------- el settings.json del molde

test('settings.json: la ask de aprobar en Bash y PowerShell, el allow del resto, el deny de Edit sobre la carpeta de la constante; lo de antes igual', () => {
  const s = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'settings.json'), 'utf8'));
  const { CARPETA } = require('./lib/cambios-ruta.cjs');
  assert.deepEqual(s.permissions.ask, ['Bash(node .claude/scripts/cambios.cjs aprobar:*)', 'PowerShell(node .claude/scripts/cambios.cjs aprobar:*)']);
  assert.deepEqual(s.permissions.allow, ['Bash(node .claude/scripts/cambios.cjs:*)']);
  assert.deepEqual(s.permissions.deny.slice(0, 1), [`Edit(./${CARPETA}/**)`]); // solo Edit (Write no lo mira el chequeo de archivos); el resto: settings.test.cjs
  assert.deepEqual(s.hooks.SessionStart, [{ matcher: '', hooks: [{ type: 'command', command: 'node', args: ['${CLAUDE_PROJECT_DIR}/.claude/hooks/session-start.cjs'], timeout: 20 }] }]);
  assert.deepEqual(s.hooks.PreToolUse[0], { matcher: 'Write', hooks: [{ type: 'command', command: 'node', args: ['${CLAUDE_PROJECT_DIR}/.claude/hooks/escritura-docs.cjs'], timeout: 20, onFailure: 'block' }] });
  // las rutas de los comandos existen en el molde (hooks/ y scripts/)
  assert.ok(fs.existsSync(path.join(__dirname, 'niega-aprobar.cjs')));
  assert.ok(fs.existsSync(path.join(__dirname, '..', 'scripts', 'cambios.cjs')));
});

// ---------------------------------------------------------------- A2 (SPEC-paquete-8d): qué es "de aprobar", desde dónde, las tres firmas

const CUERPO_CAMBIO = '## Caso de origen\nel stash pisó trabajo (2026-10)\n\n## Regla\nquitar el freno del stash\n\n## Dónde vive\n.claude/hooks/x.cjs\n\n## Medición\n| antes | después |\n';
const ID_CAMBIO = '2026-10-28-quitar-stash';
// Un repo con su cambio propuesto commiteado, la pestaña de un director (modulo/x) y la de un obrero (modulo/x--01).
function conModulo() {
  const C = require('./lib/cambios.cjs');
  const texto = C.armar({ clase: '3-barrera', toca: ['frenos'], ids: ['hook:git-seguro/stash'], origen: 'una prueba', cicatriz: 'no', chico: 'sí', urgente: 'no', cuerpo: CUERPO_CAMBIO });
  const d = repo({ '.claude/kit.md': FICHA, [`.claude/cambios/${ID_CAMBIO}.md`]: texto });
  const dir = path.join(d, '.claude', 'worktrees', 'modulo--x');
  g(d, 'worktree', 'add', '-q', '-b', 'modulo/x', dir);
  fs.writeFileSync(path.join(dir, '.kit-rol'), 'director\n');
  const obr = path.join(d, '.claude', 'worktrees', 'modulo--x--01');
  g(d, 'worktree', 'add', '-q', '-b', 'modulo/x--01', obr);
  fs.writeFileSync(path.join(obr, '.kit-rol'), 'obrero\n');
  return { d, dir, obr, hash8: C.hashSello(texto).slice(0, 8) };
}
const DESDE_DIR = `node ../../../.claude/scripts/cambios.cjs aprobar ${ID_CAMBIO}`;
// recordar:false: en estas pruebas varias "sesiones" comparten el session_id de entrada(); las marcas tienen su prueba (rt A 2)
const decideNA = (e, o = {}) => na.decidir(e, { anotar: () => 'renglón', entorno: {}, recordar: false, ...o });

test('A2.1 sigue siendo de aprobar: la ruta absoluta, comillas, bash -c, pwsh -c, $( ), comillas invertidas, echo $(…), | bash', () => {
  for (const c of [
    'node .claude/scripts/cambios.cjs aprobar x',
    'node /repo/.claude/scripts/cambios.cjs aprobar x',
    'node ".claude/scripts/cambios.cjs" "aprobar" x',
    'bash -c "node .claude/scripts/cambios.cjs aprobar x"',
    'pwsh -c "node .claude/scripts/cambios.cjs aprobar x"',
    'x=$(node .claude/scripts/cambios.cjs aprobar x)',
    'x=`node .claude/scripts/cambios.cjs aprobar x`',
    'echo $(node .claude/scripts/cambios.cjs aprobar x)',
    'echo "node .claude/scripts/cambios.cjs aprobar x" | bash',
    'bash <<EOF\nnode .claude/scripts/cambios.cjs aprobar x\nEOF',
    'grep x "$(node .claude/scripts/cambios.cjs aprobar x)"',
    'git commit -m "$(node .claude/scripts/cambios.cjs aprobar x)"',
  ]) assert.equal(na.esDeAprobar(c), true, c);
  assert.equal(na.esDeAprobar('node .claude/scripts/cambios.cjs aprobar x', { ps: true }), true);
});

test('A2.1 no es de aprobar: el mensaje de un commit, un heredoc, grep, rg, echo y printf', () => {
  for (const c of [
    'git commit -m "cambios: aprobar el freno con cambios.cjs aprobar"',
    'git commit -am "cambios aprobar" && git push',
    'git -C . commit -F .claude/cambios-aprobar.txt',
    'git commit --message="cambios aprobar"',
    'grep -n aprobar .claude/scripts/cambios.cjs',
    'rg "cambios.cjs aprobar" kit/',
    'echo "para aprobar: node .claude/scripts/cambios.cjs aprobar x"',
    'printf "%s\\n" "cambios aprobar"',
    "cat > notas.md <<'EOF'\nnode .claude/scripts/cambios.cjs aprobar x\nEOF",
    'cat > notas.md <<EOF\ncambios aprobar\nEOF',
  ]) assert.equal(na.esDeAprobar(c), false, c);
});

test('A2.3 desde la pestaña del director, de día y con ventana (también auto) → ask, con la ventana que dice quién pide y qué toca', () => {
  const m = conModulo();
  for (const modo of ['default', 'auto']) {
    const r = decideNA(entrada(m.dir, DESDE_DIR, { permission_mode: modo }));
    assert.equal(r.decision, 'ask', modo);
    const t = r.salida.hookSpecificOutput.permissionDecisionReason;
    assert.match(t, /^Es tu firma para cambiar un freno de este proyecto\. Te la pide: director-x\. /);
    assert.ok(t.includes(`Cambio ${ID_CAMBIO} · toca: hook:git-seguro/stash · control: ${m.hash8}`), t);
    assert.match(t, /Aceptá solo si es lo que viste en "Te necesito"\.$/);
  }
  // rt A: en la pestaña del director vale solo el script de la carpeta principal, no la copia de la rama del módulo
  assert.equal(decideNA(entrada(m.dir, `node .claude/scripts/cambios.cjs aprobar ${ID_CAMBIO}`)).detalle, 'otra ruta');
  // y la ventana deja el pase de un solo uso para el script (rt A, 1), con el control de lo que mostró
  const rp = decideNA(entrada(m.dir, DESDE_DIR));
  assert.equal(rp.pase.id, ID_CAMBIO);
  assert.equal(rp.pase.control, m.hash8);
  assert.ok(!fs.existsSync(path.join(m.d, '.git', na.ARCHIVO_PASE)), 'decidir no escribe el pase: lo deja quien decide al final');
  // el hook solo, como proceso, sí lo deja cuando sale la pregunta
  correr(entrada(m.dir, DESDE_DIR));
  assert.equal(JSON.parse(fs.readFileSync(path.join(m.d, '.git', na.ARCHIVO_PASE), 'utf8')).control, m.hash8);
});

test('A2.3 en la carpeta principal, rol humano y rama por defecto → ask, y lo pide la sesión de la carpeta principal', () => {
  const m = conModulo();
  const r = decideNA(entrada(m.d, `node .claude/scripts/cambios.cjs aprobar ${ID_CAMBIO}`));
  assert.equal(r.decision, 'ask');
  assert.match(r.salida.hookSpecificOutput.permissionDecisionReason, /Te la pide: la sesión de la carpeta principal\./);
  // un id que no se lee: la ventana lo dice
  assert.match(decideNA(entrada(m.d, 'node .claude/scripts/cambios.cjs aprobar 2026-01-01-no-existe')).salida.hookSpecificOutput.permissionDecisionReason, /no lo pude leer: no aceptes/);
});

test('A2.3 las negativas: obrero (por rol y por rama), noche, fondo, sin ventana, se va a otro lado, otra ruta, otra carpeta, otra rama', () => {
  const m = conModulo();
  const negada = (e, detalle, o) => {
    const r = decideNA(e, o);
    assert.equal(r.decision, 'deny', `${detalle}: ${JSON.stringify(r)}`);
    assert.equal(r.detalle, detalle);
    return r.salida.hookSpecificOutput.permissionDecisionReason;
  };
  // obrero: por su .kit-rol y su rama
  assert.match(negada(entrada(m.obr, `node ../../../.claude/scripts/cambios.cjs aprobar ${ID_CAMBIO}`), 'rama de obrero'), /la firma la da el dueño con un clic, en la pestaña del director/);
  // un .kit-rol de director con rama de obrero niega igual
  const falso = path.join(m.d, '.claude', 'worktrees', 'falso');
  g(m.d, 'worktree', 'add', '-q', '-b', 'modulo/x--02', falso);
  fs.writeFileSync(path.join(falso, '.kit-rol'), 'director\n');
  negada(entrada(falso, DESDE_DIR), 'rama de obrero');
  // un obrero que se va con cd a la carpeta del director
  negada(entrada(m.obr, `cd ../modulo--x && ${DESDE_DIR}`), 'rama de obrero');
  // el director: con .kit-noche, de fondo, sin ventana
  fs.writeFileSync(path.join(m.dir, '.kit-noche'), '');
  negada(entrada(m.dir, DESDE_DIR), 'de noche');
  fs.unlinkSync(path.join(m.dir, '.kit-noche'));
  assert.match(negada(entrada(m.dir, DESDE_DIR), 'de fondo', { entorno: { KIT_FONDO: '1' } }), /sesión de fondo/);
  negada(entrada(m.dir, DESDE_DIR, { permission_mode: 'dontAsk' }), 'dontAsk');
  // se va a otro lado / otra ruta
  negada(entrada(m.dir, `cd .. && ${DESDE_DIR}`), 'se va a otro lado');
  negada(entrada(m.d, `git -C ${m.dir} status && node .claude/scripts/cambios.cjs aprobar x`), 'se va a otro lado');
  negada(entrada(m.d, 'Set-Location .. ; node .claude/scripts/cambios.cjs aprobar x', { tool_name: 'PowerShell' }), 'se va a otro lado');
  const otro = repo({ '.claude/kit.md': FICHA });
  negada(entrada(otro, `node ${m.d}/.claude/scripts/cambios.cjs aprobar x`), 'otra ruta');
  negada(entrada(m.dir, `node ${m.obr}/.claude/scripts/cambios.cjs aprobar x`), 'otra ruta');
  negada(entrada(m.d, 'node $RAIZ/.claude/scripts/cambios.cjs aprobar x'), 'otra ruta');
  // fuera de un repo; un worktree que no es de director; la principal en otra rama
  negada(entrada(carpeta('suelto'), 'node .claude/scripts/cambios.cjs aprobar x'), 'fuera de un repo');
  const mision = path.join(m.d, '.claude', 'worktrees', 'mision');
  g(m.d, 'worktree', 'add', '-q', '-b', 'worktree-mision', mision);
  negada(entrada(mision, 'node ../../../.claude/scripts/cambios.cjs aprobar x'), 'worktree');
  g(m.d, 'checkout', '-q', '-b', 'otra');
  assert.match(negada(entrada(m.d, 'node .claude/scripts/cambios.cjs aprobar x'), 'fuera de la rama por defecto'), /desde la rama por defecto \(main\)/);
  g(m.d, 'checkout', '-q', 'main');
});

test('A2.4 las otras dos firmas: noche.cjs publicar --seguir como aprobar; preparar-pc --publica solo con rol humano', () => {
  const m = conModulo();
  const SEGUIR = 'node ../../../.claude/scripts/noche.cjs publicar --seguir';
  const PC = 'node ~/.claude/skills/arquitecto-skills/scripts/preparar-pc.cjs --publica C:/repos/x';
  assert.equal(na.queFirma(SEGUIR), 'seguir');
  assert.equal(na.queFirma(PC), 'pc');
  assert.equal(na.queFirma('node x/preparar-pc.cjs --no-publica r'), 'pc');
  assert.equal(na.queFirma('node x/preparar-pc.cjs --home h'), null);
  assert.equal(na.queFirma('node .claude/scripts/noche.cjs publicar'), null);
  assert.equal(na.queFirma('KIT_HOME_PC=/tmp/h node x.cjs'), 'home-pc');
  // --seguir: el director de día → ask; con KIT_FONDO → deny; un obrero → deny; la principal → ask
  assert.match(decideNA(entrada(m.dir, SEGUIR, { permission_mode: 'auto' })).salida.hookSpecificOutput.permissionDecisionReason, /^Es tu firma para destrabar la publicación/);
  assert.equal(decideNA(entrada(m.dir, SEGUIR), { entorno: { KIT_FONDO: '1' } }).decision, 'deny');
  assert.equal(decideNA(entrada(m.obr, SEGUIR)).decision, 'deny');
  assert.equal(decideNA(entrada(m.d, 'node .claude/scripts/noche.cjs publicar --seguir')).decision, 'ask');
  // preparar-pc --publica: desde el director en auto → deny; con KIT_FONDO → deny; en la principal con ventana → ask; sin ventana → deny
  assert.equal(decideNA(entrada(m.dir, PC, { permission_mode: 'auto' })).decision, 'deny');
  assert.equal(decideNA(entrada(m.d, PC), { entorno: { KIT_FONDO: '1' } }).decision, 'deny');
  assert.equal(decideNA(entrada(m.d, PC)).decision, 'ask');
  assert.equal(decideNA(entrada(carpeta('home'), PC)).decision, 'ask');
  assert.equal(decideNA(entrada(m.d, PC, { permission_mode: 'bypassPermissions' })).decision, 'deny');
  assert.equal(decideNA(entrada(m.d, 'node x/preparar-pc.cjs --home h')).decision, 'nada');
  // KIT_HOME_PC: desde un agente o de fondo → deny
  assert.equal(decideNA(entrada(m.dir, 'KIT_HOME_PC=/tmp/h node x.cjs')).decision, 'deny');
  assert.equal(decideNA(entrada(m.d, 'KIT_HOME_PC=/tmp/h node x.cjs'), { entorno: { KIT_FONDO: '1' } }).decision, 'deny');
});

test('A2 pc/niega-aprobar.cjs es una copia idéntica de la del molde', () => {
  const pc = path.join(__dirname, '..', '..', 'skills', 'arquitecto-skills', 'pc', 'niega-aprobar.cjs');
  assert.ok(fs.existsSync(pc), 'falta pc/niega-aprobar.cjs');
  assert.ok(fs.readFileSync(pc).equals(fs.readFileSync(path.join(__dirname, 'niega-aprobar.cjs'))), 'pc/niega-aprobar.cjs se desvió del molde');
});

// ---------------------------------------------------------------- el red team de la tanda A (rt A)

test('rt A 1: escribir un archivo y correr un intérprete en la misma línea, /dev/stdin, una variable, rg --pre → de aprobar', () => {
  for (const c of [
    "cat > f.sh <<'EOF'\nnode .claude/scripts/cambios.cjs aprobar x\nEOF\nbash f.sh",
    'echo "node .claude/scripts/cambios.cjs aprobar x" > f.sh; sh f.sh',
    'printf "node .claude/scripts/cambios.cjs aprobar x" | tee f.sh && bash f.sh',
    "bash /dev/stdin <<'EOF'\nnode .claude/scripts/cambios.cjs aprobar x\nEOF",
    'A=aprobar; node .claude/scripts/cambios.cjs $A x',
    'rg --pre ./x.sh aprobar cambios',
  ]) assert.equal(na.esDeAprobar(c), true, c);
  // escribir sin correr nada sigue exento
  assert.equal(na.esDeAprobar("cat > notas.md <<'EOF'\nnode .claude/scripts/cambios.cjs aprobar x\nEOF"), false);
});

test('rt A 2: una sesión que trabajó en una carpeta de obrero no firma aunque después se vaya a la principal', () => {
  const m = conModulo();
  const SID = 'sesion-del-obrero-1';
  // una llamada cualquiera en su worktree la anota
  assert.equal(na.decidir({ ...entrada(m.obr, 'git status'), session_id: SID }, { anotar: () => null, entorno: {} }).decision, 'nada');
  assert.equal(fs.readFileSync(path.join(m.d, '.git', na.CARPETA_SESIONES, SID), 'utf8').trim(), 'obrero');
  // después, parada en la principal (un cd en otra llamada): la firma se niega
  const r = na.decidir({ ...entrada(m.d, `node .claude/scripts/cambios.cjs aprobar ${ID_CAMBIO}`), session_id: SID }, { anotar: () => null, entorno: {} });
  assert.equal(r.decision, 'deny');
  assert.equal(r.detalle, 'sesión de obrero');
  // la del director no queda anotada, y otra sesión en la principal pregunta
  na.decidir({ ...entrada(m.dir, 'git status'), session_id: 'sesion-del-director' }, { anotar: () => null, entorno: {} });
  assert.ok(!fs.existsSync(path.join(m.d, '.git', na.CARPETA_SESIONES, 'sesion-del-director')));
  assert.equal(na.decidir({ ...entrada(m.d, `node .claude/scripts/cambios.cjs aprobar ${ID_CAMBIO}`), session_id: 'sesion-del-duenio' }, { anotar: () => null, entorno: {} }).decision, 'ask');
});

test('rt A 3: la ventana muestra lo commiteado, no lo que hay en el disco', () => {
  const m = conModulo();
  const archivo = path.join(m.d, '.claude', 'cambios', `${ID_CAMBIO}.md`);
  fs.appendFileSync(archivo, '\nalgo escrito a mano, sin commitear\n');
  const t = decideNA(entrada(m.dir, DESDE_DIR)).salida.hookSpecificOutput.permissionDecisionReason;
  assert.ok(t.includes(`control: ${m.hash8}`), t);
});

test('rt A 4: una firma por clic', () => {
  const m = conModulo();
  const r = decideNA(entrada(m.dir, `${DESDE_DIR} && node ../../../.claude/scripts/cambios.cjs aprobar 2026-10-29-otro`));
  assert.equal(r.decision, 'deny');
  assert.equal(r.detalle, 'más de una firma');
});

test('rt A 11 y 12: KIT_FONDO con cualquier valor que no sea 0; un grep de KIT_HOME_PC no es una firma', () => {
  const m = conModulo();
  assert.equal(decideNA(entrada(m.dir, DESDE_DIR), { entorno: { KIT_FONDO: 'true' } }).decision, 'deny');
  assert.equal(decideNA(entrada(m.dir, DESDE_DIR), { entorno: { KIT_FONDO: '0' } }).decision, 'ask');
  assert.equal(na.queFirma('grep -rn KIT_HOME_PC kit/'), null);
  assert.equal(na.queFirma('KIT_HOME_PC=/x node a.cjs'), 'home-pc');
});

test('revisor A (3): en un repo sin el kit, dos palabras sueltas no son una firma; nombrar el script o irse a otro lado, sí', () => {
  const d = repo();
  g(d, 'checkout', '-q', '-b', 'feature');
  for (const c of ['cat src/cambios/aprobar.ts', 'curl https://x/api/cambios/aprobar']) assert.equal(decideNA(entrada(d, c)).decision, 'nada', c);
  assert.equal(decideNA(entrada(d, 'cat src/cambios/aprobar.ts', { permission_mode: 'bypassPermissions' })).decision, 'deny'); // sin ventana, el modo manda primero
  assert.equal(decideNA(entrada(d, 'node .claude/scripts/cambios.cjs aprobar x')).decision, 'deny');
  assert.equal(decideNA(entrada(d, 'cd ../otro && cat cambios aprobar')).decision, 'deny');
});
