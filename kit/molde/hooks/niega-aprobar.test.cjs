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
    assert.equal(r.motivo, na.MOTIVO_ASK);
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
    'node C:\\repo\\.claude\\scripts\\cambios.cjs aprobar x',
    'NODE .claude/scripts/CAMBIOS.cjs APROBAR x',
    "node .claude/scripts/cambios.cjs apro''bar x",
    'node .claude/scripts/camb"i"os.cjs apro\\bar x',
    'cd .claude/scripts && node cambios.cjs aprobar x',
  ]) {
    decide(P, entrada(P, c), 'ask');
    niega(P, entrada(P, c, { permission_mode: 'bypassPermissions' }), 'bypassPermissions');
  }
  assert.equal(na.esDeAprobar('camb*.cjs aprobar'), false); // lo que no se ve: el riesgo escrito de F3 (r4-1 b)
});

// ---------------------------------------------------------------- rol y ficha

test('.kit-rol de agente (cada uno, y uno que no se entiende) → deny aunque el modo tenga ventana', () => {
  const d = repo({ '.claude/kit.md': FICHA });
  for (const rol of ['director', 'obrero', 'nocturno', 'actualizador', 'jefe']) {
    fs.writeFileSync(path.join(d, '.kit-rol'), `${rol}\n`);
    const esperado = rol === 'jefe' ? 'desconocido' : rol;
    const r = niega(d, entrada(d, APROBAR), `rol ${esperado}`);
    assert.match(r.motivo, new RegExp(`\\.kit-rol: ${esperado}`));
  }
});

test('desde un worktree con .kit-rol de obrero → deny, y el renglón queda en el worktree', () => {
  const d = repo({ '.claude/kit.md': FICHA });
  const w = path.join(d, '.claude', 'worktrees', 'w1');
  g(d, 'worktree', 'add', '-q', '-b', 'modulo/x--1', w);
  fs.writeFileSync(path.join(w, '.kit-rol'), 'obrero\n');
  const r = niega(w, entrada(w, APROBAR), 'rol obrero');
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
  assert.match(r.motivo, /desconocido/);
});

// ---------------------------------------------------------------- 4.7: los cuatro casos

test('4.7 caso 1 (sin node): lo cubre onFailure "block" — el settings.json del molde lo registra así, con timeout 20', () => {
  const s = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'settings.json'), 'utf8'));
  const grupos = s.hooks.PreToolUse.filter((x) => x.hooks.some((h) => /niega-aprobar\.cjs/.test(h.command)));
  assert.equal(grupos.length, 1);
  assert.equal(grupos[0].matcher, 'Bash|PowerShell');
  assert.deepEqual(grupos[0].hooks, [{ type: 'command', command: 'node "$CLAUDE_PROJECT_DIR/.claude/hooks/niega-aprobar.cjs"', timeout: 20, onFailure: 'block' }]);
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

test('settings.json: la ask de aprobar en Bash y PowerShell, el allow del resto, el deny de Write/Edit sobre la carpeta de la constante; lo de antes igual', () => {
  const s = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'settings.json'), 'utf8'));
  const { CARPETA } = require('./lib/cambios-ruta.cjs');
  assert.deepEqual(s.permissions.ask, ['Bash(node .claude/scripts/cambios.cjs aprobar:*)', 'PowerShell(node .claude/scripts/cambios.cjs aprobar:*)']);
  assert.deepEqual(s.permissions.allow, ['Bash(node .claude/scripts/cambios.cjs:*)']);
  assert.deepEqual(s.permissions.deny, [`Write(./${CARPETA}/**)`, `Edit(./${CARPETA}/**)`]);
  assert.deepEqual(s.hooks.SessionStart, [{ matcher: '', hooks: [{ type: 'command', command: 'node "$CLAUDE_PROJECT_DIR/.claude/hooks/session-start.cjs"', timeout: 20 }] }]);
  assert.deepEqual(s.hooks.PreToolUse[0], { matcher: 'Write', hooks: [{ type: 'command', command: 'node "$CLAUDE_PROJECT_DIR/.claude/hooks/escritura-docs.cjs"', timeout: 20 }] });
  // las rutas de los comandos existen en el molde (hooks/ y scripts/)
  assert.ok(fs.existsSync(path.join(__dirname, 'niega-aprobar.cjs')));
  assert.ok(fs.existsSync(path.join(__dirname, '..', 'scripts', 'cambios.cjs')));
});
