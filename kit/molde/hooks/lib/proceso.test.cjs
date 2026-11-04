'use strict';
// Pruebas de lib/proceso.cjs (SPEC-paquete-5; r1-7, r1-9): claudeEnPath respeta lo inyectado y pregunta una sola vez; el vigía da
// verde, rojo, "no corrió" y colgado, y al colgado lo mata con todo lo que lanzó. Corren con: node --test "kit/**/*.test.cjs".
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const P = require('./proceso.cjs');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-proceso-'));
test.after(() => fs.rmSync(TMP, { recursive: true, force: true, maxRetries: 20, retryDelay: 500 }));

test('claudeEnPath: lo inyectado manda; sin inyectar, pregunta una vez y lo deja anotado (un booleano)', () => {
  assert.equal(P.claudeEnPath({ claudeEnPath: true }), true);
  assert.equal(P.claudeEnPath({ claudeEnPath: false }), false);
  const o = {};
  const v = P.claudeEnPath(o);
  assert.equal(typeof v, 'boolean');
  assert.equal(o.claudeEnPath, v);
});

test('D-b: sin `claude` en el PATH, el binario de la extensión de VS Code de versión más alta, entre comillas y en forma /c/… en Windows; sin ninguno, null', () => {
  const ext = path.join(TMP, 'extensiones');
  const bin = process.platform === 'win32' ? 'claude.exe' : 'claude';
  const poner = (carpeta) => {
    const d = path.join(ext, carpeta, 'resources', 'native-binary');
    fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, bin), '');
    return path.join(d, bin);
  };
  // No: la carpeta vacía (o sin la extensión) → null, y con claudeEnPath inyectado no se mira el disco de esta PC.
  fs.mkdirSync(ext, { recursive: true });
  fs.mkdirSync(path.join(ext, 'anthropic.claude-code-9.9.9-win32-x64'), { recursive: true }); // sin el binario: no cuenta
  assert.equal(P.comandoClaude({ claudeEnPath: false, dirExtensiones: ext }), null);
  assert.equal(P.comandoClaude({ claudeEnPath: false }), null);
  // Sí: dos versiones → la más alta por número (2.1.312 > 2.1.98), entre comillas y en la forma de Git Bash.
  poner('anthropic.claude-code-2.1.98-win32-x64');
  const alta = poner('anthropic.claude-code-2.1.312-win32-x64');
  poner('otra.extension-9.0.0');
  assert.equal(P.claudeDeVSCode(ext), alta);
  assert.equal(P.comandoClaude({ claudeEnPath: false, dirExtensiones: ext }), `"${P.rutaGitBash(alta)}"`);
  // En el PATH, manda el del PATH.
  assert.equal(P.comandoClaude({ claudeEnPath: true, dirExtensiones: ext }), 'claude');
  assert.equal(P.rutaGitBash('C:\\Users\\Ana\\.vscode\\claude.exe', true), '/c/Users/Ana/.vscode/claude.exe');
  assert.equal(P.rutaGitBash('/home/ana/claude', false), '/home/ana/claude');
});

test('correrConPlazo: verde, rojo con su salida, "no corrió" (127) y colgado → muerto con su árbol', () => {
  const nodo = `"${process.execPath}"`;
  assert.deepEqual(P.correrConPlazo(`${nodo} -e "process.exit(0)"`, { cwd: TMP, plazoMs: 20000 }), { estado: 'verde', como: 'salida 0' });
  assert.deepEqual(P.correrConPlazo(`${nodo} -e "process.exit(4)"`, { cwd: TMP, plazoMs: 20000 }), { estado: 'rojo', como: 'salida 4' });
  assert.equal(P.correrConPlazo(`${nodo} -e "process.exit(127)"`, { cwd: TMP, plazoMs: 20000 }).estado, 'no-corrio');
  const pid = path.join(TMP, 'pid');
  fs.writeFileSync(path.join(TMP, 'cuelga.js'), `require('fs').writeFileSync(${JSON.stringify(pid)}, String(process.pid)); setTimeout(() => {}, 30000);\n`);
  const t0 = Date.now();
  const r = P.correrConPlazo(`${nodo} cuelga.js`, { cwd: TMP, plazoMs: 1500 });
  assert.deepEqual(r, { estado: 'colgado', como: 'no terminó en 2 s' });
  assert.ok(Date.now() - t0 < 20000, 'no esperó al colgado');
  assert.throws(() => process.kill(Number(fs.readFileSync(pid, 'utf8')), 0), 'el colgado quedó vivo');
  assert.match(P.VIGIA, /taskkill/);
});

// ---------------------------------------------------------------- t6 (D8r.2): la consola de los comandos; rt-2: el guardia

test('t6: shellDeComandos — fuera de win32 la de siempre; en win32 CLAUDE_CODE_GIT_BASH_PATH, si no la de `git --exec-path`', () => {
  const todo = () => true;
  assert.equal(P.shellDeComandos({ plataforma: 'linux', env: {}, gitExecPath: null }), true);
  assert.equal(P.shellDeComandos({ plataforma: 'win32', env: { CLAUDE_CODE_GIT_BASH_PATH: 'D:/Git/bin/bash.exe' }, gitExecPath: null, existe: todo }), 'D:/Git/bin/bash.exe');
  // la variable apunta a nada → se sigue con git
  const deGit = P.shellDeComandos({ plataforma: 'win32', env: { CLAUDE_CODE_GIT_BASH_PATH: 'Z:/no/esta.exe' }, gitExecPath: 'C:/Program Files/Git/mingw64/libexec/git-core\n', existe: (p) => p !== 'Z:/no/esta.exe' });
  assert.equal(deGit, path.win32.join('C:/Program Files/Git', 'bin', 'bash.exe'));
  assert.equal(P.raizDeGit('C:\\Git\\clangarm64\\libexec\\git-core'), 'C:\\Git');
  assert.equal(P.raizDeGit('/usr/lib/git-core'), null);
  // sin Git Bash → cmd.exe (true), como antes
  assert.equal(P.shellDeComandos({ plataforma: 'win32', env: {}, gitExecPath: null, existe: todo }), true);
  assert.equal(P.shellDeComandos({ plataforma: 'win32', env: {}, gitExecPath: 'C:/Git/mingw64/libexec/git-core', existe: () => false }), true);
});

test('t6: shellDeComandos con un PATH cuyo `bash` es otro (el de WSL) no lo elige', () => {
  const dir = path.join(TMP, 'wsl');
  fs.mkdirSync(dir, { recursive: true });
  for (const n of ['bash.exe', 'bash']) fs.writeFileSync(path.join(dir, n), '');
  const env = { PATH: dir, Path: dir };
  const sh = P.shellDeComandos({ plataforma: 'win32', env, gitExecPath: null });
  assert.equal(sh, true, 'sin Git no hay bash: cmd.exe, nunca el del PATH');
  const conGit = P.shellDeComandos({ plataforma: 'win32', env, gitExecPath: 'C:/Program Files/Git/mingw64/libexec/git-core', existe: (p) => p.startsWith(dir) || /Git[\\/]bin[\\/]bash\.exe$/.test(p) });
  assert.ok(!String(conGit).startsWith(dir), `eligió el del PATH: ${conGit}`);
  assert.match(String(conGit), /Git[\\/]bin[\\/]bash\.exe$/);
});

test('rt-2: comandoQueNoCorre — en Git Bash `cmd /c` no corre; en cmd.exe `cmd //c` tampoco; lo demás sí', () => {
  const bash = 'C:\\Program Files\\Git\\bin\\bash.exe';
  const cmd = 'C:\\Windows\\System32\\cmd.exe';
  assert.match(P.comandoQueNoCorre('cmd /c exit 0', bash), /en Git Bash es `cmd \/\/c`/);
  assert.match(P.comandoQueNoCorre('npm ci && CMD.EXE /C npm test', bash), /Git Bash/);
  assert.equal(P.comandoQueNoCorre('cmd //c exit 0', bash), null);
  assert.equal(P.comandoQueNoCorre('npm test', bash), null);
  assert.equal(P.comandoQueNoCorre('node scripts/cmd /x', bash), null, 'cmd en el medio de otra palabra no cuenta');
  assert.match(P.comandoQueNoCorre('cmd //c exit 0', cmd), /`cmd \/\/c` es de Git Bash: en cmd\.exe no corre nada y saldría verde/);
  assert.match(P.comandoQueNoCorre('cmd.exe //c npm test', true, 'win32'), /es de Git Bash/);
  assert.equal(P.comandoQueNoCorre('cmd /c exit 0', cmd), null);
  assert.equal(P.comandoQueNoCorre('cmd //c exit 0', true, 'linux'), null, 'en /bin/sh no hay cmd: sale 127 solo');
  // correrConPlazo no lo corre: no-corrio con el motivo
  assert.deepEqual(P.correrConPlazo('cmd //c exit 0', { cwd: TMP, plazoMs: 20000, shell: cmd }), { estado: 'no-corrio', como: '`cmd //c` es de Git Bash: en cmd.exe no corre nada y saldría verde' });
  assert.equal(P.correrConPlazo('cmd /c exit 0', { cwd: TMP, plazoMs: 20000, shell: bash }).estado, 'no-corrio');
});

test('crit. 6: en win32 con Git, el gate corre en Git Bash: `cmd //c exit 3` sale rojo (corrió de verdad), `exit 0` verde', { skip: process.platform !== 'win32' || P.shellDeComandos() === true ? 'solo en win32 con Git' : false }, () => {
  const sh = P.shellDeComandos();
  assert.match(String(sh), /bash\.exe$/i);
  assert.ok(fs.existsSync(sh));
  assert.deepEqual(P.correrConPlazo('cmd //c exit 3', { cwd: TMP, plazoMs: 30000 }), { estado: 'rojo', como: 'salida 3' });
  assert.deepEqual(P.correrConPlazo('exit 0', { cwd: TMP, plazoMs: 30000 }), { estado: 'verde', como: 'salida 0' });
  assert.equal(P.correrConPlazo('cmd /c exit 0', { cwd: TMP, plazoMs: 30000 }).estado, 'no-corrio', 'nunca verde');
  // con && y comillas, como lo escribe la consola del director
  assert.equal(P.correrConPlazo('true && echo "a b" > salio.txt', { cwd: TMP, plazoMs: 30000 }).estado, 'verde');
  assert.equal(fs.readFileSync(path.join(TMP, 'salio.txt'), 'utf8').trim(), 'a b');
});
