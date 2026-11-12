'use strict';
// Pruebas del settings.json del molde (SPEC-paquete-3 MODIFICA y P4.7; D-6, D-7): todo hook en forma exec, los que niegan con
// timeout 20 y onFailure "block", el deny de F §5 (= DENY_FABRICA) y el de revisiones/, sin
// ninguna regla Write(…). Corren con: node --test "kit/**/*.test.cjs".
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const TEXTO = fs.readFileSync(path.join(__dirname, 'settings.json'), 'utf8');
const S = JSON.parse(TEXTO);
const { DENY_FABRICA } = require('./hooks/lib/fabrica.cjs');
const { CARPETA } = require('./hooks/lib/cambios-ruta.cjs');
const zona = require('./hooks/lib/zona-propia.cjs');

const todos = () => Object.entries(S.hooks).flatMap(([evento, grupos]) => grupos.flatMap((g) => g.hooks.map((h) => ({ evento, matcher: g.matcher, h }))));
const RE_ARG = /^\$\{CLAUDE_PROJECT_DIR\}\/\.claude\/hooks\/((?:lib\/)?[a-z-]+\.cjs)$/;

test('todo hook en forma exec (D-7): command "node", la ruta en args con ${CLAUDE_PROJECT_DIR}, y el archivo existe en el molde', () => {
  const lista = todos();
  assert.equal(lista.length, 3); // 8d A5: el arranque, escritura-docs y el portero
  for (const { h } of lista) {
    assert.equal(h.type, 'command');
    assert.equal(h.command, 'node', JSON.stringify(h));
    assert.ok(Array.isArray(h.args) && h.args.length === 1, JSON.stringify(h));
    const m = RE_ARG.exec(h.args[0]);
    assert.ok(m, h.args[0]);
    assert.ok(fs.existsSync(path.join(__dirname, 'hooks', m[1])), m[1]);
    assert.equal(h.timeout, /portero/.test(h.args[0]) ? 60 : 20); // 8d A5.3: el portero, max(60, 3 × p99 de A0)
    assert.ok(!/\$CLAUDE_PROJECT_DIR|"/.test(h.command), 'nada de la forma de texto');
  }
});

test('8d A5: un solo hook en PreToolUse sobre Bash|PowerShell, el portero, con timeout 60 y onFailure "block"', () => {
  const pre = S.hooks.PreToolUse;
  // Un solo grupo Bash|PowerShell con los tres (corren en paralelo): la mezcla de zona-propia junta en el primer grupo los hooks
  // nuevos de un mismo matcher, así que con grupos separados el molde mezclado consigo mismo no daba el mismo texto.
  const grupos = pre.filter((g) => g.matcher === 'Bash|PowerShell');
  assert.equal(grupos.length, 1);
  assert.deepEqual(
    grupos[0].hooks,
    [{ type: 'command', command: 'node', args: ['${CLAUDE_PROJECT_DIR}/.claude/hooks/lib/portero.cjs'], timeout: 60, onFailure: 'block' }]
  );
  // el número del settings es el del portero (los dos tienen que decir lo mismo)
  assert.equal(grupos[0].hooks[0].timeout, require('./hooks/lib/portero.cjs').TIMEOUT_SETTINGS);
  // el arranque no niega: si falla, no traba (la sesión arranca sin inyección)
  assert.deepEqual(S.hooks.SessionStart, [{ matcher: '', hooks: [{ type: 'command', command: 'node', args: ['${CLAUDE_PROJECT_DIR}/.claude/hooks/session-start.cjs'], timeout: 20 }] }]);
});

test('escritura-docs niega escrituras: registrado con onFailure "block" (crit. 16 del kit); sin node, el proceso ni arranca y eso es lo que block frena', () => {
  const pre = S.hooks.PreToolUse;
  assert.deepEqual(pre[0], { matcher: 'Write', hooks: [{ type: 'command', command: 'node', args: ['${CLAUDE_PROJECT_DIR}/.claude/hooks/escritura-docs.cjs'], timeout: 20, onFailure: 'block' }] });
  // todo hook del molde que niega (todos menos el arranque) va con block
  for (const { evento, h } of todos()) assert.equal(h.onFailure, evento === 'SessionStart' ? undefined : 'block', h.args[0]);
  const { spawnSync } = require('child_process');
  const r = spawnSync(path.join(__dirname, 'no-existe-node.exe'), [path.join(__dirname, 'hooks', 'escritura-docs.cjs')], { input: '{}', encoding: 'utf8' });
  assert.ok(r.error || r.status !== 0);
});

test('deny: las 9 de F §5 (= DENY_FABRICA, D-6), ninguna Bash(...) (apagaría PowerShell), y Edit sobre cambios/ y revisiones/', () => {
  assert.deepEqual([...DENY_FABRICA], [
    'Read(./**/.env)',
    'Read(./**/.env.*)',
    'Read(./**/secrets/**)',
    'Read(./**/*.pem)',
    'Read(./**/*.key)',
    'Read(~/.ssh/**)',
    'Read(~/.aws/**)',
    'Read(~/.config/gh/**)',
    'Read(~/AppData/Roaming/GitHub CLI/**)',
  ]);
  assert.ok(Object.isFrozen(DENY_FABRICA));
  const deny = S.permissions.deny;
  for (const r of DENY_FABRICA) assert.ok(deny.includes(r), r);
  assert.ok(!deny.some((r) => /^(Bash|PowerShell)\(/.test(r)));
  for (const c of [CARPETA, '.claude/revisiones']) assert.ok(deny.includes(`Edit(./${c}/**)`), `Edit ${c}`);
  assert.equal(new Set(deny).size, deny.length, 'sin repetidas');
  assert.deepEqual(S.permissions.ask, ['Bash(node .claude/scripts/cambios.cjs aprobar:*)', 'PowerShell(node .claude/scripts/cambios.cjs aprobar:*)']);
  assert.deepEqual(S.permissions.allow, ['Bash(node .claude/scripts/cambios.cjs:*)']);
});

// El aviso de la plataforma (claude.exe 2.1.312+, visto en D5.2, 2026-11-02): "Write(./.claude/cambios/**) is not matched by file
// permission checks — only Edit(path) rules are. Use Edit(…) instead (Edit rules cover all file-editing tools)". Una deny Write(…)
// no frena nada: parece un freno y no lo es. Ni el molde ni el deny que worktree.cjs suma a cada worktree traen una.
test('ninguna regla Write( en deny: ni el settings.json del molde ni reglasDeny de worktree.cjs (Edit cubre todo lo que escribe)', () => {
  assert.deepEqual(S.permissions.deny.filter((r) => /^Write\(/.test(r)), []);
  const { reglasDeny } = require('./scripts/worktree.cjs');
  const reglas = reglasDeny(process.platform === 'win32' ? 'C:\\p' : '/p');
  assert.deepEqual(reglas.filter((r) => /^Write\(/.test(r)), []);
  assert.deepEqual(reglas.map((r) => r.slice(0, r.indexOf('('))), ['Read', 'Read', 'Edit', 'Edit'], 'lo que sí queda: Read y Edit de .env y .env.*');
});

test('abre sin claves repetidas y con la forma que pide la mezcla', () => {
  const r = zona.leerJsonSinDuplicados(TEXTO);
  assert.equal(r.ok, true, r.problema);
  assert.equal(zona.mezclarSettings({ viejo: null, nuevo: TEXTO, proyecto: null }).ok, true);
});

// En exec todos los hooks dicen command "node": el id de zona-propia suma los args (G7). Si no, los tres de Bash|PowerShell compartían
// id y la mezcla del actualizador (y rehacer.sh) se quedaba con el primero.
test('cada hook del molde tiene un id propio en zona-propia (si no, la mezcla pierde git-seguro y sensible)', () => {
  const ids = zona.reglas(S).filter((r) => r.tipo === 'hook').map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length, ids.join('\n'));
  const viejo = JSON.stringify({ hooks: { PreToolUse: [] } });
  const m = zona.mezclarSettings({ viejo, nuevo: TEXTO, proyecto: viejo });
  const args = m.settings.hooks.PreToolUse.flatMap((g) => g.hooks.flatMap((h) => h.args || []));
  assert.ok(args.some((a) => a.includes('lib/portero.cjs')), 'el portero');
});

// 8d A5: un proyecto que tenía los tres de la rc.6 sin tocar, al mezclar con el molde nuevo, queda con el portero solo.
test('8d A5: la mezcla de un settings con los tres hooks viejos (sin tocar) deja solo el portero en Bash|PowerShell', () => {
  const viejo = JSON.parse(TEXTO);
  viejo.hooks.PreToolUse.find((g) => g.matcher === 'Bash|PowerShell').hooks = ['niega-aprobar', 'git-seguro', 'sensible'].map((x) => ({ type: 'command', command: 'node', args: [`\${CLAUDE_PROJECT_DIR}/.claude/hooks/${x}.cjs`], timeout: 20, onFailure: 'block' }));
  const v = JSON.stringify(viejo, null, 2);
  const m = zona.mezclarSettings({ viejo: v, nuevo: TEXTO, proyecto: v });
  const bp = m.settings.hooks.PreToolUse.filter((g) => g.matcher === 'Bash|PowerShell').flatMap((g) => g.hooks);
  assert.deepEqual(bp.map((h) => h.args[0]), ['${CLAUDE_PROJECT_DIR}/.claude/hooks/lib/portero.cjs']);
});
