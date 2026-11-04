'use strict';
// Pruebas de gitignore.snippet (SPEC-paquete-8r4, el frenos.log de Hermes, 2026-11-04): un proyecto con un `*.log` genérico en su
// .gitignore tapaba .claude/frenos.log y `cambios aprobar` fallaba siempre ("está ignorado"). El snippet trae la negación; como el
// actualizador y la adopción suman al FINAL lo que falta del snippet (actualizar.cjs, paso 5), la negación queda después del `*.log`.
// Corren con: node --test "kit/**/*.test.cjs".
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const SNIPPET = fs.readFileSync(path.join(__dirname, 'gitignore.snippet'), 'utf8').replace(/\r\n/g, '\n');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-gitignore-'));
const GLOBAL = path.join(TMP, 'gitconfig-vacio');
fs.writeFileSync(GLOBAL, '');
const ENV = { ...process.env, GIT_CONFIG_GLOBAL: GLOBAL, GIT_CONFIG_NOSYSTEM: '1', XDG_CONFIG_HOME: TMP };
test.after(() => fs.rmSync(TMP, { recursive: true, force: true }));

const ignorado = (d, rel) => spawnSync('git', ['check-ignore', '-q', '--', rel], { cwd: d, env: ENV }).status === 0;
function repoCon(gitignore) {
  const d = fs.mkdtempSync(path.join(TMP, 'r'));
  spawnSync('git', ['init', '-q'], { cwd: d, env: ENV });
  fs.writeFileSync(path.join(d, '.gitignore'), gitignore);
  return d;
}

test('el snippet trae la negación de .claude/frenos.log', () => {
  assert.ok(SNIPPET.split('\n').includes('!/.claude/frenos.log'));
});

test('un proyecto con *.log: sin el snippet, frenos.log queda ignorado; con el snippet sumado al final, no', () => {
  const sin = repoCon('node_modules/\n*.log\n');
  assert.equal(ignorado(sin, '.claude/frenos.log'), true, 'el caso de Hermes: *.log lo tapa');
  const con = repoCon(`node_modules/\n*.log\n${SNIPPET}`);
  assert.equal(ignorado(con, '.claude/frenos.log'), false, 'la negación, después del *.log, lo destapa');
  assert.equal(ignorado(con, 'otro.log'), true, 'los otros .log siguen ignorados');
  assert.equal(ignorado(con, '.claude/sub/frenos.log'), true, 'solo el de .claude/, no cualquiera');
});

test('la negación no destapa nada del kit que tiene que quedar ignorado', () => {
  const d = repoCon(`*.log\n${SNIPPET}`);
  for (const rel of ['.env', '.claude/settings.local.json', '.kit-rol', '.claude/worktrees/x/a.txt']) assert.equal(ignorado(d, rel), true, rel);
});
