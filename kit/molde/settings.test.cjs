'use strict';
// Pruebas del settings.json del molde (SPEC-paquete-3 MODIFICA y P4.7; D-6, D-7): todo hook en forma exec, los que niegan con
// timeout 20 y onFailure "block", el deny de F §5 (= DENY_FABRICA) y el de revisiones/. Corren con: node --test "kit/**/*.test.cjs".
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
const RE_ARG = /^\$\{CLAUDE_PROJECT_DIR\}\/\.claude\/hooks\/([a-z-]+\.cjs)$/;

test('todo hook en forma exec (D-7): command "node", la ruta en args con ${CLAUDE_PROJECT_DIR}, y el archivo existe en el molde', () => {
  const lista = todos();
  assert.equal(lista.length, 5);
  for (const { h } of lista) {
    assert.equal(h.type, 'command');
    assert.equal(h.command, 'node', JSON.stringify(h));
    assert.ok(Array.isArray(h.args) && h.args.length === 1, JSON.stringify(h));
    const m = RE_ARG.exec(h.args[0]);
    assert.ok(m, h.args[0]);
    assert.ok(fs.existsSync(path.join(__dirname, 'hooks', m[1])), m[1]);
    assert.equal(h.timeout, 20);
    assert.ok(!/\$CLAUDE_PROJECT_DIR|"/.test(h.command), 'nada de la forma de texto');
  }
});

test('P4.7: niega-aprobar, git-seguro y sensible en PreToolUse sobre Bash|PowerShell con timeout 20 y onFailure "block", uno por grupo', () => {
  const pre = S.hooks.PreToolUse;
  // Un solo grupo Bash|PowerShell con los tres (corren en paralelo): la mezcla de zona-propia junta en el primer grupo los hooks
  // nuevos de un mismo matcher, así que con grupos separados el molde mezclado consigo mismo no daba el mismo texto.
  const grupos = pre.filter((g) => g.matcher === 'Bash|PowerShell');
  assert.equal(grupos.length, 1);
  assert.deepEqual(
    grupos[0].hooks,
    ['niega-aprobar.cjs', 'git-seguro.cjs', 'sensible.cjs'].map((nombre) => ({ type: 'command', command: 'node', args: [`\${CLAUDE_PROJECT_DIR}/.claude/hooks/${nombre}`], timeout: 20, onFailure: 'block' }))
  );
  // los que no niegan por P4.7 no frenan si fallan: el arranque nunca traba; escritura-docs, como estaba
  assert.deepEqual(S.hooks.SessionStart, [{ matcher: '', hooks: [{ type: 'command', command: 'node', args: ['${CLAUDE_PROJECT_DIR}/.claude/hooks/session-start.cjs'], timeout: 20 }] }]);
  assert.deepEqual(pre[0], { matcher: 'Write', hooks: [{ type: 'command', command: 'node', args: ['${CLAUDE_PROJECT_DIR}/.claude/hooks/escritura-docs.cjs'], timeout: 20 }] });
});

test('deny: las 9 de F §5 (= DENY_FABRICA, D-6), ninguna Bash(...) (apagaría PowerShell), y Write/Edit sobre cambios/ y revisiones/', () => {
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
  for (const c of [CARPETA, '.claude/revisiones']) for (const h of ['Write', 'Edit']) assert.ok(deny.includes(`${h}(./${c}/**)`), `${h} ${c}`);
  assert.equal(new Set(deny).size, deny.length, 'sin repetidas');
  assert.deepEqual(S.permissions.ask, ['Bash(node .claude/scripts/cambios.cjs aprobar:*)', 'PowerShell(node .claude/scripts/cambios.cjs aprobar:*)']);
  assert.deepEqual(S.permissions.allow, ['Bash(node .claude/scripts/cambios.cjs:*)']);
});

test('abre sin claves repetidas y con la forma que pide la mezcla', () => {
  const r = zona.leerJsonSinDuplicados(TEXTO);
  assert.equal(r.ok, true, r.problema);
  assert.equal(zona.mezclarSettings({ viejo: null, nuevo: TEXTO, proyecto: null }).ok, true);
});

// ⚠️ De otro encargo: zona-propia.comandoDe arma el id de un hook con `command` solo; en exec todos dicen "node", así que los tres de
// Bash|PowerShell comparten id y la mezcla del actualizador (y rehacer.sh) se queda con el primero. Arreglo propuesto (una línea en
// zona-propia.cjs): sumar los args al comando. Queda como todo hasta que lo aplique el director.
test('cada hook del molde tiene un id propio en zona-propia (si no, la mezcla pierde git-seguro y sensible)', { todo: 'zona-propia.comandoDe no mira args (de otro encargo; lo arregla el director)' }, () => {
  const ids = zona.reglas(S).filter((r) => r.tipo === 'hook').map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length, ids.join('\n'));
  const viejo = JSON.stringify({ hooks: { PreToolUse: [] } });
  const m = zona.mezclarSettings({ viejo, nuevo: TEXTO, proyecto: viejo });
  const args = m.settings.hooks.PreToolUse.flatMap((g) => g.hooks.flatMap((h) => h.args || []));
  for (const n of ['niega-aprobar', 'git-seguro', 'sensible']) assert.ok(args.some((a) => a.includes(n)), n);
});
