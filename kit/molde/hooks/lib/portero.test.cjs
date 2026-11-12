'use strict';
// Pruebas de portero.cjs (SPEC-paquete-8d A5, crit. A5): los tres frenos en un proceso, el orden y la combinación, lo que no es
// molde corre como proceso, el freno roto, el plazo honesto y un solo renglón por comando negado. Y el mismo juego de casos de los
// tres hooks, solos y por el portero, da lo mismo. Repos temporales, sin la config de git de la PC.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-portero-'));
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
delete process.env.KIT_FONDO;
test.after(() => fs.rmSync(TMP, { recursive: true, force: true }));

const MOLDE_HOOKS = path.resolve(__dirname, '..');
let n = 0;
function g(cwd, ...args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', env: process.env });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}
const FICHA = (estados = {}) =>
  `---\nkit: 3.0.0-rc.7\nnivel: estandar\nvars:\n  proyecto: px\npiezas:\n  cambios-metodo: ${estados['cambios-metodo'] || 'molde'}\n  hook-git-seguro: ${estados['hook-git-seguro'] || 'molde'}\n  hook-sensible: ${estados['hook-sensible'] || 'molde'}\n---\n`;
// Un repo con los hooks del molde instanciados en .claude/hooks (sin las pruebas) y su ficha. `cambiar`: {archivo: texto}.
function proyecto(estados, cambiar = {}) {
  const d = path.join(TMP, `p${n++}`);
  const destino = path.join(d, '.claude', 'hooks');
  const copiar = (de, a) => {
    fs.mkdirSync(a, { recursive: true });
    for (const e of fs.readdirSync(de, { withFileTypes: true })) {
      if (e.isDirectory()) copiar(path.join(de, e.name), path.join(a, e.name));
      else if (e.name.endsWith('.cjs') && !e.name.endsWith('.test.cjs')) fs.copyFileSync(path.join(de, e.name), path.join(a, e.name));
      else if (e.name.endsWith('.md')) fs.copyFileSync(path.join(de, e.name), path.join(a, e.name));
    }
  };
  copiar(MOLDE_HOOKS, destino);
  for (const [archivo, texto] of Object.entries(cambiar)) fs.writeFileSync(path.join(destino, archivo), texto);
  fs.writeFileSync(path.join(d, '.claude', 'kit.md'), FICHA(estados));
  fs.writeFileSync(path.join(d, '.gitignore'), '/.claude/worktrees/\n/.kit-rol\n');
  g(d, 'init', '-q', '-b', 'main');
  g(d, 'add', '-A');
  g(d, 'commit', '-q', '-m', 'base');
  return d;
}
const entrada = (cwd, command, modo = 'default', tool = 'Bash') =>
  JSON.stringify({ session_id: 'p', hook_event_name: 'PreToolUse', tool_name: tool, tool_input: { command }, cwd, permission_mode: modo });
function correr(script, crudo, env = {}) {
  const r = spawnSync(process.execPath, [script], { input: crudo, encoding: 'utf8', env: { ...process.env, ...env }, timeout: 120000 });
  const t = (r.stdout || '').trim();
  return { codigo: r.status, decision: t ? JSON.parse(t).hookSpecificOutput.permissionDecision : 'nada', motivo: t ? JSON.parse(t).hookSpecificOutput.permissionDecisionReason : '' };
}
const portero = (d) => path.join(d, '.claude', 'hooks', 'lib', 'portero.cjs');
const hook = (d, h) => path.join(d, '.claude', 'hooks', h);
const log = (d) => {
  try {
    return fs.readFileSync(path.join(d, '.claude', 'frenos.log'), 'utf8');
  } catch (e) {
    return '';
  }
};
// Los renglones de todos los registros del repo (el versionado y, desde A6, el común del git-dir).
const renglones = (d) => {
  let t = log(d);
  try {
    t += fs.readFileSync(path.join(d, '.git', 'kit-frenos.log'), 'utf8');
  } catch (e) {
    /* todavía no hay */
  }
  return t.split('\n').filter(Boolean);
};

test('un deny de cualquiera de los tres gana; un ask solo pregunta; los tres callados, nada', () => {
  const d = proyecto();
  assert.equal(correr(portero(d), entrada(d, 'node .claude/scripts/cambios.cjs aprobar x', 'dontAsk')).decision, 'deny'); // niega-aprobar
  assert.equal(correr(portero(d), entrada(d, 'git reset --hard HEAD~1')).decision, 'deny'); // git-seguro
  assert.equal(correr(portero(d), entrada(d, 'node x.cjs --borra-datos-reales', 'dontAsk')).decision, 'deny'); // sensible
  assert.equal(correr(portero(d), entrada(d, 'node x.cjs --borra-datos-reales')).decision, 'ask'); // sensible pregunta
  assert.equal(correr(portero(d), entrada(d, 'node .claude/scripts/cambios.cjs aprobar x')).decision, 'ask'); // la firma
  assert.equal(correr(portero(d), entrada(d, 'echo hola')).decision, 'nada');
  assert.equal(correr(portero(d), JSON.stringify({ tool_name: 'Write', tool_input: { file_path: 'x' }, cwd: d, permission_mode: 'default' })).decision, 'nada');
});

test('el orden: un deny corta aunque otro antes haya preguntado (y el deny de niega-aprobar sale antes que el de git-seguro)', () => {
  const d = proyecto();
  // la firma pregunta; git-seguro niega el reset: gana el deny
  const r = correr(portero(d), entrada(d, 'node .claude/scripts/cambios.cjs aprobar x ; git reset --hard HEAD~1'));
  assert.equal(r.decision, 'deny');
  assert.match(r.motivo, /git-seguro/);
  // los dos niegan: sale el de niega-aprobar (el primero)
  const r2 = correr(portero(d), entrada(d, 'node .claude/scripts/cambios.cjs aprobar x ; git reset --hard HEAD~1', 'dontAsk'));
  assert.match(r2.motivo, /esta firma no corre en modo dontAsk/);
});

test('un solo renglón en el registro por comando negado, y ninguno por un ask de la firma o por nada', () => {
  const d = proyecto();
  const antes = renglones(d).length;
  correr(portero(d), entrada(d, 'node .claude/scripts/cambios.cjs aprobar x ; git reset --hard HEAD~1', 'dontAsk'));
  assert.equal(renglones(d).length - antes, 1);
  correr(portero(d), entrada(d, 'echo hola'));
  correr(portero(d), entrada(d, 'node .claude/scripts/cambios.cjs aprobar x'));
  assert.equal(renglones(d).length - antes, 1);
});

test('uno que tira → "freno roto: corré doctor"', () => {
  const d = proyecto({}, { 'sensible.cjs': "'use strict';\nmodule.exports = { decidir() { throw new Error('roto'); } };\n" });
  const r = correr(portero(d), entrada(d, 'echo hola'));
  assert.equal(r.codigo, 0);
  assert.equal(r.decision, 'deny');
  assert.equal(r.motivo, 'freno roto: corré doctor');
  // entrada que no es JSON
  assert.equal(correr(portero(d), 'no es json').motivo, 'freno roto: corré doctor');
});

test('con hook-sensible: adaptada en la ficha, ese corre como proceso y su deny vale', () => {
  const propio = "'use strict';\nrequire('fs').readFileSync(0, 'utf8');\nprocess.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: 'el sensible del proyecto dice que no' } }) + '\\n');\n";
  const d = proyecto({ 'hook-sensible': 'adaptada' }, { 'sensible.cjs': propio });
  const r = correr(portero(d), entrada(d, 'echo hola'));
  assert.equal(r.decision, 'deny');
  assert.equal(r.motivo, 'el sensible del proyecto dice que no');
  const P = require('./portero.cjs');
  assert.deepEqual(P.comoCorre({ 'hook-sensible': { estado: 'adaptada' }, 'hook-git-seguro': 'molde', 'cambios-metodo': 'molde' }).map((h) => h.como), ['modulo', 'modulo', 'proceso']);
  assert.deepEqual(P.comoCorre(null).map((h) => h.como), ['proceso', 'proceso', 'proceso']); // ficha ilegible: los tres aparte
});

test('un hook propio sin decidir (ni guarda de require.main) no rompe a los otros dos', () => {
  const propio = "'use strict';\nrequire('fs').readFileSync(0, 'utf8');\n// sin exports ni require.main: si se cargara como módulo, leería la entrada otra vez\n";
  const d = proyecto({ 'hook-git-seguro': 'propia' }, { 'git-seguro.cjs': propio });
  assert.equal(correr(portero(d), entrada(d, 'echo hola')).decision, 'nada');
  assert.equal(correr(portero(d), entrada(d, 'node x.cjs --borra-datos-reales', 'dontAsk')).decision, 'deny'); // sensible sigue
  assert.equal(correr(portero(d), entrada(d, 'node .claude/scripts/cambios.cjs aprobar x', 'dontAsk')).decision, 'deny'); // la firma sigue
  // uno propio que se cae (sale distinto de 0) → como onFailure block: freno roto
  const d2 = proyecto({ 'hook-git-seguro': 'propia' }, { 'git-seguro.cjs': "process.exit(3);\n" });
  assert.equal(correr(portero(d2), entrada(d2, 'echo hola')).motivo, 'freno roto: corré doctor');
});

test('el plazo vencido → deny freno:sin-tiempo, con el aviso honesto; un deny que ya salió vale igual', () => {
  const d = proyecto();
  const P = require(portero(d));
  let llamadas = 0;
  const t0 = Date.now();
  const reloj = () => (llamadas++ < 1 ? t0 : t0 + 10 ** 9); // después de la primera mirada, el plazo ya pasó
  const r = P.decidir(entrada(d, 'echo hola'), { reloj });
  assert.equal(r.decision, 'deny');
  assert.equal(r.salida.hookSpecificOutput.permissionDecisionReason, P.SIN_TIEMPO);
  assert.match(P.SIN_TIEMPO, /repetí el mismo comando; no es un no/);
  assert.equal(r.renglones.length, 1);
  assert.equal(r.renglones[0].datos.id, 'freno:sin-tiempo');
  llamadas = 0;
  const r2 = P.decidir(entrada(d, 'node .claude/scripts/cambios.cjs aprobar x', 'dontAsk'), { reloj });
  assert.match(r2.salida.hookSpecificOutput.permissionDecisionReason, /esta firma no corre en modo dontAsk/);
  // un hook-proceso que se pasa del plazo
  const lento = "'use strict';\nconst t = Date.now(); while (Date.now() - t < 3000) {}\n";
  const d3 = proyecto({ 'hook-sensible': 'propia' }, { 'sensible.cjs': lento });
  const r3 = require(portero(d3)).decidir(entrada(d3, 'echo hola'), { plazoMs: 1500 });
  assert.equal(r3.salida.hookSpecificOutput.permissionDecisionReason, P.SIN_TIEMPO);
});

test('el mismo juego de casos de los tres hooks, solos y por el portero, da la misma decisión', () => {
  const d = proyecto();
  const w = path.join(d, '.claude', 'worktrees', 'modulo--x--01');
  g(d, 'worktree', 'add', '-q', '-b', 'modulo/x--01', w);
  fs.writeFileSync(path.join(w, '.kit-rol'), 'obrero\n');
  const casos = [
    // niega-aprobar
    [d, 'node .claude/scripts/cambios.cjs aprobar x', 'default'],
    [d, 'node .claude/scripts/cambios.cjs aprobar x', 'bypassPermissions'],
    [w, 'node ../../../.claude/scripts/cambios.cjs aprobar x', 'auto'],
    [d, 'git commit -m "cambios aprobar"', 'dontAsk'],
    // git-seguro
    [d, 'git reset --hard HEAD~1', 'default'],
    [d, 'git stash', 'auto'],
    [w, 'git push --force origin modulo/x--01', 'auto'],
    [d, 'git status', 'default'],
    // sensible
    [d, 'node x.cjs --borra-datos-reales', 'default'],
    [d, 'node x.cjs --borra-datos-reales', 'dontAsk'],
    [w, 'node x.cjs --borra-datos-reales', 'auto'],
    [d, 'npm test', 'default'],
  ];
  for (const [cwd, c, modo] of casos) {
    const directo = ['niega-aprobar.cjs', 'git-seguro.cjs', 'sensible.cjs'].map((h) => correr(hook(d, h), entrada(cwd, c, modo)).decision);
    const esperado = directo.includes('deny') ? 'deny' : directo.includes('ask') ? 'ask' : 'nada';
    assert.equal(correr(portero(d), entrada(cwd, c, modo)).decision, esperado, `${c} (${modo}) en ${path.basename(cwd)}: ${directo.join(', ')}`);
  }
});
