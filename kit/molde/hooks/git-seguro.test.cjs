'use strict';
// Pruebas de git-seguro.cjs (SPEC-paquete-3 P4.4, P4.7; criterios 2, 3, 5 y 14): cada fila de la tabla con sus sí y sus "no frena",
// en Bash y PowerShell; los casos portados del hook de Hermes (CM-65); los que necesitan git de verdad (¿mergeada?, ¿publicado?,
// core.hooksPath, la sesión de agente y el worktree) en repos temporales con y sin remoto bare; la ficha (quitados y rota); el
// renglón de frenos.log; los cuatro casos de P4.7; y que ningún git de los SKILL.md del molde frene.
// Correr: node --test kit/molde/hooks/git-seguro.test.cjs. KIT_HOOKS_DIR apunta a otra copia de hooks/ (prueba de mutación).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-gs-'));
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

const DIR = process.env.KIT_HOOKS_DIR ? path.resolve(process.env.KIT_HOOKS_DIR) : __dirname;
const gs = require(path.join(DIR, 'git-seguro.cjs'));
const MOLDE = path.join(__dirname, '..');

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
function commitear(d, rel = `a${n++}.txt`, texto = 'x\n') {
  escribir(d, rel, texto);
  g(d, 'add', '-f', '--', rel);
  g(d, 'commit', '-q', '-m', `c ${rel}`);
  return g(d, 'rev-parse', 'HEAD');
}
function repo(archivos = {}) {
  const d = carpeta();
  g(d, 'init', '-q', '-b', 'main');
  for (const [rel, texto] of Object.entries({ '.gitignore': '/.claude/worktrees/\n/.kit-rol\n/.claude/frenos.log\n', ...archivos })) {
    escribir(d, rel, texto);
    g(d, 'add', '-f', '--', rel);
  }
  g(d, 'commit', '-q', '-m', 'c');
  return d;
}
// Un repo con remoto bare (origin), main publicada.
function conRemoto(archivos = {}) {
  const bare = carpeta('bare');
  g(bare, 'init', '-q', '--bare', '-b', 'main');
  const d = repo(archivos);
  g(d, 'remote', 'add', 'origin', bare);
  g(d, 'push', '-q', '-u', 'origin', 'main');
  return { d, bare };
}
// El .git de un worktree es oculto en Windows: writeFileSync da EPERM sobre un archivo oculto; se borra y se escribe.
function pisar(p, texto) {
  fs.rmSync(p, { force: true });
  fs.writeFileSync(p, texto);
}
function worktree(d, rama, rol = null) {
  const w = path.join(d, '.claude', 'worktrees', `w${n++}`);
  g(d, 'worktree', 'add', '-q', '-b', rama, w);
  if (rol) fs.writeFileSync(path.join(w, '.kit-rol'), `${rol}\n`);
  return w;
}

const entrada = (cwd, command, extra = {}) => ({
  session_id: 'prueba',
  hook_event_name: 'PreToolUse',
  tool_name: 'Bash',
  tool_input: { command },
  cwd,
  permission_mode: 'default',
  ...extra,
});
// decidir en el proceso (rápido), con el renglón espiado. MEMO guarda raíz, ficha y rama por carpeta: ninguna prueba cambia la
// ficha de un repo después de armarlo (la rama del renglón solo se mira en la prueba del hook real, que corre sin memo).
const MEMO = new Map();
function decide(cwd, command, o = {}) {
  const renglones = [];
  const e = entrada(cwd, command, { tool_name: o.ps ? 'PowerShell' : 'Bash', ...(o.extra || {}) });
  if ('modo' in o) {
    if (o.modo === undefined) delete e.permission_mode;
    else e.permission_mode = o.modo;
  }
  const r = gs.decidir(e, { anotar: (raiz, datos) => (renglones.push(datos), 'renglón'), memo: MEMO });
  return { ...r, renglonesDatos: renglones };
}
function niega(cwd, command, caso, o = {}) {
  const r = decide(cwd, command, o);
  assert.equal(r.decision, 'deny', `debía negar (${caso}): ${JSON.stringify(command)}${o.ps ? ' [PS]' : ''} → ${r.decision}`);
  if (caso) assert.ok(r.casos.includes(caso), `caso ${caso} en ${JSON.stringify(r.casos)} para ${JSON.stringify(command)}`);
  return r;
}
function pasa(cwd, command, o = {}) {
  const r = decide(cwd, command, o);
  assert.equal(r.decision, 'nada', `FALSO POSITIVO${o.ps ? ' [PS]' : ''}: ${JSON.stringify(command)} → ${r.decision} ${JSON.stringify(r.casos)}`);
  return r;
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
  copiar(DIR, destino);
  return path.join(destino, 'git-seguro.cjs');
}
const HOOK = instanciar();
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

const FICHA = '---\nkit: 2.4.3\nnivel: estandar\nvars:\n  proyecto: px\n---\n';
const FICHA_ROTA = '---\nkit: 2.4.3\nnivel: estandar\nvars:\n  proyecto: x\ncolorcito:\n\ta: b\n---\n';
const fichaQuitando = (id, hasta) => `---\nkit: 2.4.3\nnivel: estandar\nvars:\n  proyecto: px\nfrenos:\n  quitados:\n    - {id: ${id}, por: "prueba", hasta: ${hasta}}\n---\n`;
const MODOS = ['default', 'acceptEdits', 'plan', 'auto', 'bypassPermissions', 'dontAsk', undefined];

// El repo humano de casi todo: con remoto, en una rama de trabajo (así historia-defecto no se mete en los casos de sintaxis).
const H = (() => {
  const { d } = conRemoto();
  g(d, 'switch', '-q', '-c', 'trabajo');
  fs.mkdirSync(path.join(d, 'docs'), { recursive: true });
  escribir(d, 'docs/a.md', 'x\n');
  return d;
})();

// ---------------------------------------------------------------- la tabla de P4.4: sí y no por fila (sintaxis)

// [caso, comando, ps?]
const FRENA = [
  ['stash', 'git stash'],
  ['stash', 'git stash push -m wip'],
  ['stash', 'git stash pop'],
  ['stash', 'git stash', true],
  ['reset-hard', 'git reset --hard'],
  ['reset-hard', 'git reset HEAD --hard'],
  ['reset-hard', 'git reset --hard', true],
  ['clean-f', 'git clean -fd'],
  ['clean-f', 'git clean --force -d'],
  ['clean-f', 'git clean -fdx', true],
  ['restaurar-arbol', 'git checkout -- .'],
  ['restaurar-arbol', 'git checkout .'],
  ['restaurar-arbol', 'git checkout -f'],
  ['restaurar-arbol', 'git restore .'],
  ['restaurar-arbol', 'git restore :/'],
  ['restaurar-arbol', 'git restore -S -W .'],
  ['restaurar-arbol', 'git restore --staged --worktree .'],
  ['restaurar-arbol', 'git restore -SW .'],
  ['restaurar-arbol', 'git restore --pathspec-from-file=lista.txt'],
  ['restaurar-arbol', 'git switch -f main'],
  ['restaurar-arbol', 'git switch --discard-changes main'],
  ['restaurar-arbol', 'git restore docs'],
  ['restaurar-arbol', 'git checkout -- .', true],
  ['push-force', 'git push -f'],
  ['push-force', 'git push --force origin main'],
  ['push-force', 'git push --force-with-lease origin main'],
  ['push-force', 'git push --force-with-lease=main:abc origin main'],
  ['push-force', 'git push origin +main'],
  ['push-force', 'git push -uf origin trabajo'],
  ['push-force', 'git push --force --all origin'],
  ['push-force', 'git push -f origin main', true],
  ['push-borrar', 'git push --prune origin'],
  ['push-borrar', 'git push --mirror origin'],
  ['push-punto', 'git push . HEAD:main'],
  ['update-ref', 'git update-ref refs/heads/main HEAD'],
  ['update-ref', 'git update-ref -d refs/remotes/origin/main'],
  ['replace', 'git replace abc def'],
  ['symbolic-ref', 'git symbolic-ref HEAD refs/heads/otra'],
  ['symbolic-ref', 'git symbolic-ref -d HEAD'],
  ['branch-f', 'git branch -f main HEAD'],
  ['branch-f', 'git branch --force main HEAD'],
  ['branch-f', 'git branch -M nuevo'],
  ['branch-f', 'git branch -C viejo nuevo'],
  ['branch-f', 'git checkout -B rama origin/rama'],
  ['branch-f', 'git checkout -Bfix'],
  ['branch-f', 'git switch -C nueva'],
  ['branch-f', 'git switch --force-create nueva'],
  ['branch-f', 'git switch -C nueva', true],
  ['fetch-a-remotes', 'git fetch origin main:refs/remotes/origin/main'],
  ['fetch-a-remotes', 'git fetch origin +refs/heads/*:refs/remotes/origin/*'],
  ['fetch-a-remotes', 'git fetch . HEAD:refs/remotes/origin/main'],
  ['remote-set-head', 'git remote set-head origin main'],
  ['remote-set-url', 'git remote set-url origin https://ejemplo.invalid/x.git'],
  ['remote-remove', 'git remote remove origin'],
  ['remote-remove', 'git remote rm origin'],
  ['config-default-branch', 'git config init.defaultBranch otra'],
  ['config-default-branch', 'git config set init.defaultBranch otra'],
  ['config-default-branch', 'git config --global init.defaultBranch otra'],
  ['hooks-path', 'git config core.hooksPath /dev/null'],
  ['hooks-path', 'git config --unset core.hooksPath'],
  ['hooks-path', 'git config core.hookspath .otra'],
  ['hooks-path', 'git config unset core.hooksPath'],
  ['hooks-path', 'git -c core.hooksPath=/dev/null commit -m x'],
  ['hooks-path', 'git --config-env=core.hooksPath=VACIO commit -m x'],
  ['hooks-path', 'git --config-env core.hooksPath=VACIO commit -m x'],
  ['hooks-path', 'git config core.hooksPath x', true],
  ['config-include', 'git config include.path ../otro.cfg'],
  ['config-include', 'git config --add includeIf.gitdir:x/.path y'],
  ['config-include', 'git config --global include.path x'],
  ['config-include', 'git -c include.path=x status'],
  ['config-include', 'git config --rename-section otra include'],
  ['no-verify', 'git commit --no-verify -m x'],
  ['no-verify', 'git commit -n -m x'],
  ['no-verify', 'git commit -an -m x'],
  ['no-verify', 'git commit -anm x'],
  ['no-verify', 'git commit --no-veri -m x'],
  ['no-verify', 'git push --no-verify'],
  ['no-verify', 'git merge --no-verify otra'],
  ['no-verify', 'git rebase --no-verify origin/main'],
  ['no-verify', 'git commit --no-verify -m x', true],
  ['worktree-remove-force', 'git worktree remove -f .claude/worktrees/x'],
  ['worktree-remove-force', 'git worktree remove --force x'],
  ['matar-por-nombre', 'taskkill /IM node.exe /F'],
  ['matar-por-nombre', 'taskkill //IM node.exe //F'],
  ['matar-por-nombre', 'taskkill /f /im node.exe'],
  ['matar-por-nombre', 'taskkill /FI "IMAGENAME eq node.exe"'],
  ['matar-por-nombre', 'pkill node'],
  ['matar-por-nombre', 'pkill -f vite'],
  ['matar-por-nombre', 'killall node'],
  ['matar-por-nombre', 'wmic process where "name=\'node.exe\'" delete'],
  ['matar-por-nombre', 'Stop-Process -Name node', true],
  ['matar-por-nombre', 'Stop-Process -name node -Force', true],
  ['matar-por-nombre', 'Get-Process node | Stop-Process', true],
  ['matar-por-nombre', 'kill -Name node', true],
  ['matar-por-nombre', 'taskkill /IM node.exe /F', true],
  ['update-index', 'git update-index --skip-worktree a.txt'],
  ['update-index', 'git update-index --assume-unchanged a.txt'],
  ['variables-peligrosas', 'GIT_DIR=x git commit -m x'],
  ['variables-peligrosas', 'GIT_WORK_TREE=/x git status'],
  ['variables-peligrosas', 'GIT_INDEX_FILE=/tmp/i git add a'],
  ['variables-peligrosas', 'GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=core.hooksPath GIT_CONFIG_VALUE_0=/dev/null git commit'],
  ['variables-peligrosas', 'GIT_CONFIG_PARAMETERS="\'core.hooksPath\'=\'x\'" git commit'],
  ['variables-peligrosas', 'GIT_CONFIG_GLOBAL=/x git commit'],
  ['variables-peligrosas', 'GIT_CONFIG_NOSYSTEM=1 git commit'],
  ['variables-peligrosas', 'GIT_OBJECT_DIRECTORY=/x git status'],
  ['variables-peligrosas', 'GIT_ALTERNATE_OBJECT_DIRECTORIES=/x git status'],
  ['variables-peligrosas', 'GIT_COMMON_DIR=/x git status'],
  ['variables-peligrosas', 'GIT_NAMESPACE=x git push'],
  ['variables-peligrosas', 'GIT_EXEC_PATH=/x git commit'],
  ['variables-peligrosas', 'GIT_TRACE=1 git push'],
  ['variables-peligrosas', 'GIT_TRACE_PACKET=1 git fetch'],
  ['variables-peligrosas', 'GIT_CURL_VERBOSE=1 git fetch'],
  ['variables-peligrosas', 'PATH=/x:$PATH git commit -m x'],
  ['variables-peligrosas', 'env GIT_DIR=x git status'],
  ['variables-peligrosas', 'export GIT_DIR=x; git status'],
  ['variables-peligrosas', 'export GIT_DIR=x'], // r2-8: la asignación misma, sin git
  ['variables-peligrosas', 'GIT_CONFIG_GLOBAL=/dev/null'],
  ['variables-peligrosas', 'export PATH=/x:$PATH && git status'],
  ['variables-peligrosas', 'git --exec-path=/x commit -m x'],
  ['variables-peligrosas', 'git --namespace=x push'],
  ['variables-peligrosas', '$env:GIT_DIR = "x"; git status', true],
  ['variables-peligrosas', '$env:git_dir = "x"', true],
  ['variables-peligrosas', '$Env:GIT_CONFIG_GLOBAL="x"', true],
  ['variables-peligrosas', '$env:Path += ";C:\\x"; git status', true],
  ['variables-peligrosas', 'Set-Item Env:GIT_DIR x', true],
  ['variables-peligrosas', '[Environment]::SetEnvironmentVariable("GIT_DIR", "x", "User")', true],
  ['variables-peligrosas', 'cmd /c "set GIT_DIR=x && git status"', true],
];
const NO_FRENA = [
  ['git status'],
  ['git status', true],
  ['git log --oneline -5'],
  ['git diff --stat'],
  ['git stash list'],
  ['git stash show -p'],
  ['git stash --help'],
  ['git stash list', true],
  ['git reset'],
  ['git reset HEAD archivo.py'],
  ['git reset -- a.txt'],
  ['git clean -n'],
  ['git clean -nfd'],
  ['git clean --dry-run -fd'],
  ['git restore -- docs/a.md'],
  ['git restore --staged .'], // r1-18
  ['git restore --staged -- .'],
  ['git restore -S .'],
  ['git restore --staged .', true],
  ['git checkout -- docs/a.md'],
  ['git checkout main'],
  ['git checkout -b feature/x'],
  ['git switch -c nueva'],
  ['git switch -cfix'],
  ['git switch main'],
  ['git push'],
  ['git push origin main'],
  ['git push -u origin HEAD'],
  ['git push -n'], // es --dry-run
  ['git push -n --force-with-lease origin kit/x'],
  ['git push --dry-run origin main'],
  ['git push -f origin kit/v3'], // force solo sobre kit/*
  ['git push --force origin kit/v3:kit/v3'],
  ['git push origin +kit/v3'],
  ['git push -f origin kit/v3', true],
  ['git pull --rebase'],
  ['git pull --no-rebase'],
  ['git pull --rebase', true],
  ['GIT_EDITOR=true git rebase --continue'],
  ['GIT_EDITOR=true git commit --amend --no-edit'],
  ['GIT_SEQUENCE_EDITOR=: git rebase -i HEAD~2'],
  ['GIT_PAGER=cat git log'],
  ['GIT_TERMINAL_PROMPT=0 git fetch'],
  ['GIT_AUTHOR_NAME=x GIT_AUTHOR_EMAIL=y GIT_COMMITTER_NAME=x GIT_COMMITTER_EMAIL=y git commit -m x'],
  ['export PATH=/x:$PATH'], // PATH sin git
  ['export PATH=/x:$PATH; npm test'],
  ['$path = "docs"; git add $path', true], // una variable de PowerShell, no el entorno
  ['$env:GIT_EDITOR = "true"; git rebase --continue', true],
  ['$env:Path += ";C:\\x"; npm test', true],
  ['git rebase --abort'],
  ['git rebase --continue'],
  ['git symbolic-ref -q HEAD'],
  ['git symbolic-ref --short HEAD'],
  ['git branch -d rama-vieja'],
  ['git branch -D rama-que-no-existe'],
  ['git branch'],
  ['git branch -a'],
  ['git branch -m viejo nuevo'],
  ['git branch -u origin/trabajo'],
  ['git branch --show-current'],
  ['git fetch'],
  ['git fetch origin'],
  ['git fetch -q origin main'],
  ['git fetch origin main:main'],
  ['git remote -v'],
  ['git remote show origin'],
  ['git remote get-url origin'],
  ['git config --get core.hooksPath'],
  ['git config core.hooksPath'],
  ['git config --get remote.origin.url'],
  ['git config -l'],
  ['git config list'],
  ['git config get user.name'],
  ['git config core.hooksPath .githooks'], // reponerlo (r2-3)
  ['git config --local core.hooksPath .githooks'],
  ['git config core.hooksPath .githooks', true],
  ['git config core.longpaths true'],
  ['git config pull.rebase true'], // humano: config-agente no aplica
  ['git config user.name "Prueba"'],
  ['git commit -m "fix: algo"'],
  ['git commit -m "-n"'],
  ['git commit -m "no usar --no-verify"'],
  ['git commit -F msg.txt -- docs/a.md'],
  ['git commit --amend --no-edit'],
  ['git merge --no-ff otra'],
  ['git worktree remove .claude/worktrees/x'],
  ['git worktree list'],
  ['git worktree add .claude/worktrees/x -b otra'],
  ['git update-index --no-skip-worktree a.txt'],
  ['git update-index --no-assume-unchanged a.txt'],
  ['git update-index --chmod=+x a.sh'],
  ['git update-index --refresh'],
  ['git remote add otro https://ejemplo.invalid/x.git'], // humano: plomería no aplica
  ['git hash-object -w a.txt'],
  ['git hash-object a.txt'],
  ['git read-tree HEAD'],
  ['taskkill /PID 1234 /F'],
  ['taskkill //PID 1234 //F'],
  ['kill 1234'],
  ['kill -9 1234'],
  ['Stop-Process -Id 1234', true],
  ['Stop-Process 1234', true],
  ['Get-Process -Id 1234 | Stop-Process', true],
  ['Get-Process node; Stop-Process -Id 1234', true],
  ['ls'],
  ['ls', true],
  ['echo git stash'],
  ['git commit -m "docs: prohibido git stash y git reset --hard"'],
  ['grep -rn "git push --force" docs'],
  ['Write-Output "git reset --hard"', true],
  ['cd docs && git status'],
  ['cd .. && ls'], // humano: salir-del-worktree no aplica
  [''],
];

test('la tabla de P4.4: cada caso frena (Bash y PowerShell), todo rol y todo modo', () => {
  const vistos = new Set();
  for (const [caso, c, ps] of FRENA) {
    niega(H, c, caso, { ps });
    vistos.add(caso);
  }
  // cada fila de la tabla que es de sintaxis tiene al menos un caso acá (las de contexto van aparte, abajo)
  for (const caso of Object.keys(gs.MENSAJES)) {
    if (['historia-defecto', 'historia-defecto-sin-remoto', 'push-borrar', 'hooks-path-ausente', 'config-agente', 'plomeria', 'salir-del-worktree'].includes(caso)) continue;
    assert.ok(vistos.has(caso), `falta un caso que frene para ${caso}`);
  }
});

test('la tabla de P4.4: los "no frena" pasan sin salida', () => {
  for (const [c, ps] of NO_FRENA) pasa(H, c, { ps });
});

test('--no-verify y los de fábrica frenan en todo modo, también bypassPermissions y sin modo', () => {
  for (const modo of MODOS) {
    niega(H, 'git commit --no-verify -m x', 'no-verify', { modo });
    niega(H, 'git commit -n -m x', 'no-verify', { modo, ps: true });
    niega(H, 'git stash', 'stash', { modo });
    niega(H, 'GIT_DIR=x git commit', 'variables-peligrosas', { modo });
  }
});

test('el mensaje dice el id, por qué y la alternativa', () => {
  const r = niega(H, 'git stash', 'stash');
  const m = r.salida.hookSpecificOutput.permissionDecisionReason;
  assert.match(m, /hook:git-seguro\/stash/);
  assert.match(m, /commit de trabajo en curso por rutas/);
  assert.match(niega(H, 'git commit -n -m x', 'no-verify').salida.hookSpecificOutput.permissionDecisionReason, /push -n.*--dry-run/);
  assert.match(niega(H, 'git config core.hooksPath x', 'hooks-path').salida.hookSpecificOutput.permissionDecisionReason, /git config core\.hooksPath \.githooks/);
  assert.match(niega(H, 'git push -f', 'push-force').salida.hookSpecificOutput.permissionDecisionReason, /kit\/\*/);
  assert.match(niega(H, 'pkill node', 'matar-por-nombre').salida.hookSpecificOutput.permissionDecisionReason, /PID/);
  assert.match(niega(H, 'GIT_DIR=x git commit', 'variables-peligrosas').salida.hookSpecificOutput.permissionDecisionReason, /GIT_DIR/);
  // dos casos en una llamada: los dos en el motivo, un renglón por caso
  const dos = niega(H, 'git stash && git reset --hard', 'stash');
  assert.deepEqual(dos.casos, ['stash', 'reset-hard']);
  assert.equal(dos.renglonesDatos.length, 2);
  for (const caso of Object.keys(gs.MENSAJES)) assert.ok(gs.MENSAJES[caso].length > 40, caso);
});

test('envueltos y escondidos: bash -c, cmd /c, powershell -Command, $( ), env, time, rutas a git.exe, opciones globales', () => {
  for (const [c, ps] of [
    ['bash -c "git stash"'],
    ["sh -c 'git reset --hard'"],
    ['cmd //c "git clean -fd"'],
    ['powershell -NoProfile -Command "git checkout -- ."'],
    ['echo $(git stash)'],
    ['time git stash'],
    ['env GIT_PAGER=cat git reset --hard'],
    ['if true; then git clean -fd; fi'],
    ['git.exe stash'],
    ['/usr/bin/git reset --hard'],
    ['"C:/Program Files/Git/cmd/git.exe" reset --hard'],
    ['git --no-pager stash'],
    ['git -c core.pager=cat stash'],
    ['git -C docs stash'],
    ['git --git-dir=.git --work-tree=. stash'],
    ['GIT  stash'],
    ['& git stash', true],
    ["& 'C:\\Program Files\\Git\\cmd\\git.exe' reset --hard", true],
    ['cmd /c "git stash"', true],
    ['if ($true) { git stash }', true],
  ]) {
    const r = decide(H, c, { ps });
    assert.equal(r.decision, 'deny', `${c}`);
  }
});

// ---------------------------------------------------------------- los casos de Hermes (CM-65), portados

const HERMES_BLOQUEA = [
  ['Bash', 'git stash'], ['Bash', 'git stash push -m wip'], ['Bash', 'git stash push -u -m "x" -- docs/a.md'], ['Bash', 'git stash -u'],
  ['Bash', 'git stash pop'], ['Bash', 'git stash apply stash@{0}'], ['Bash', 'git stash drop'], ['Bash', 'git stash clear'],
  ['Bash', 'git -C D:/Hermes-4.14 stash'], ['Bash', 'cd D:/Hermes-4.14 && git stash && git status'], ['PowerShell', 'git stash'],
  ['PowerShell', 'git stash push -m wip'], ['Bash', 'git reset --hard'], ['Bash', 'git reset --hard HEAD~1'], ['Bash', 'git reset HEAD --hard'],
  ['Bash', 'git -C D:/Hermes-4.14 reset --hard origin/main'], ['PowerShell', 'git reset --hard'],
  ['PowerShell', 'git -C D:\\Hermes-4.14 reset --hard origin/main'], ['Bash', 'git clean -f'], ['Bash', 'git clean -fd'], ['Bash', 'git clean -xfd'],
  ['Bash', 'git clean -ffd'], ['Bash', 'git clean -d -f'], ['Bash', 'git clean --force -d'], ['PowerShell', 'git clean -fdx'],
  ['Bash', 'git checkout -- .'], ['Bash', 'git checkout -q -- .'], ['Bash', 'git -C D:/Hermes-4.14 checkout -q -- .'],
  ['Bash', 'git -C D:/Hermes-4.14 checkout -q -- . 2>/dev/null; echo hecho'], ['Bash', 'git checkout .'], ['Bash', 'git checkout HEAD -- .'],
  ['Bash', 'git checkout origin/main -- docs/'], ['Bash', 'git checkout -- *'], ['Bash', "git checkout -- '*.py'"], ['Bash', 'git checkout -f'],
  ['Bash', 'git checkout --force main'], ['Bash', 'git checkout -qf main'], ['Bash', 'git checkout HEAD ./'], ['Bash', 'git checkout HEAD docs/'],
  ['Bash', 'git checkout origin/main -q web/'], ['Bash', 'git checkout HEAD .'], ['Bash', 'git restore :/'], ['Bash', 'git restore -- :/docs/'],
  ['Bash', 'GIT  stash'], ['PowerShell', 'cd D:/x; git checkout -- .'], ['PowerShell', 'git checkout -- .'],
  ['PowerShell', 'git -C D:\\Hermes-4.14 checkout -q -- .'], ['Bash', 'git restore .'], ['Bash', 'git restore -- .'],
  ['Bash', 'git restore -S -W .'], ['Bash', 'git restore --source=HEAD~1 .'], ['Bash', 'git restore --source HEAD~1 .'], ['Bash', 'git restore docs/'],
  ['PowerShell', 'git restore .'], ['Bash', 'git switch -f main'], ['Bash', 'git switch --discard-changes main'], ['Bash', 'git stash && echo listo'],
  ['Bash', 'ls; git reset --hard'], ['Bash', 'time git stash'], ['Bash', 'env GIT_PAGER=cat git reset --hard'], ['Bash', 'if true; then git clean -fd; fi'],
  ['Bash', 'echo $(git stash)'], ['Bash', 'bash -c "git stash"'], ['Bash', "sh -c 'git reset --hard'"], ['Bash', 'cmd //c "git clean -fd"'],
  ['Bash', 'powershell -NoProfile -Command "git checkout -- ."'], ['Bash', 'git.exe stash'], ['Bash', '/usr/bin/git reset --hard'],
  ['Bash', '"C:/Program Files/Git/cmd/git.exe" reset --hard'], ['Bash', 'git --no-pager stash'], ['Bash', 'git -c core.pager=cat stash'],
  ['PowerShell', '& git stash'], ['PowerShell', "& 'C:\\Program Files\\Git\\cmd\\git.exe' reset --hard"], ['PowerShell', 'cd D:\\Hermes-4.14; git clean -fd'],
  ['PowerShell', 'cmd /c "git stash"'],
];
// De Hermes, con las diferencias de la tabla de P4.4 (cada una con su porqué) sacadas a HERMES_CAMBIA.
const HERMES_PASA = [
  ['Bash', 'git status'], ['Bash', 'git status --short'], ['Bash', 'git log --oneline -5'], ['Bash', 'git diff --stat'], ['Bash', 'git diff -- .'],
  ['Bash', 'git add -- docs/x.md'], ['Bash', 'git commit -m "fix: algo" -- docs/x.md'], ['Bash', 'git push origin main'], ['Bash', 'git fetch -q origin'],
  ['Bash', 'git worktree list'], ['Bash', 'git branch -D rama-vieja'], ['Bash', 'git cherry-pick abc1234'], ['Bash', 'git -C D:/Hermes-4.14 status --short'],
  ['Bash', 'git -C D:/Hermes-4.14 log -1'], ['Bash', 'git commit -m "docs: prohibido git stash y git reset --hard (CM-8)"'],
  ['Bash', "git commit -m 'no usar git clean -fd ni git checkout -- .'"],
  ['Bash', "git commit -F - <<'EOF'\nfix(hook): frena git stash, git reset --hard y git checkout -- .\nEOF"],
  ['Bash', "git commit -m \"$(cat <<'EOF'\nhook: git restore . y git clean -f, a) y b)\nEOF\n)\""], ['Bash', 'grep "reset --hard" CLAUDE.md'],
  ['Bash', "grep -rn 'git stash' docs"], ['Bash', "rg 'git checkout -- \\.' .claude"], ['Bash', 'echo git stash'], ['Bash', "echo 'git reset --hard' >> notas.txt"],
  ['Bash', "printf 'git clean -fd\\n'"], ['Bash', "cat >> notas.md <<'EOF'\nregla: nunca git stash\nEOF"], ['Bash', 'git log --oneline | grep stash'],
  ['Bash', 'ls .git/refs/stash'], ['Bash', "cat docs/metodo/CAMBIOS.md | grep -n 'git clean'"], ['Bash', 'bash -c "echo git stash"'], ['Bash', '# git stash\nls'],
  ['Bash', 'ls # git reset --hard'], ['Bash', 'git checkout main'], ['Bash', 'git checkout -b feature/x'], ['Bash', 'git checkout -b fix-foo'],
  ['Bash', 'git checkout -q develop'], ['Bash', 'git checkout origin/main'], ['Bash', 'git checkout --track origin/otra'], ['Bash', 'git switch main'],
  ['Bash', 'git switch -c nueva'], ['Bash', 'git reset'], ['Bash', 'git reset HEAD archivo.py'], ['Bash', 'git reset --soft HEAD~1'],
  ['Bash', 'git reset --mixed HEAD~1'], ['Bash', 'git clean -n'], ['Bash', 'git clean -nfd'], ['Bash', 'git clean --dry-run -fd'], ['Bash', 'git stash list'],
  ['Bash', "git stash list --format='%H %gs'"], ['Bash', 'git stash show -p'],
  ['Bash', 'git restore -- core/sql_catalog.json web/src/shell/embeds.generated.ts'], ['Bash', 'git restore core/sql_catalog.json web/src/shell/embeds.generated.ts'],
  ['Bash', 'cd docs && git restore -- core/sql_catalog.json && git status --short'],
  ['Bash', 'git checkout -- core/sql_catalog.json web/src/shell/embeds.generated.ts'], ['Bash', 'git checkout -- .gitignore'],
  ['Bash', 'git checkout -q -- supabase/functions/cuentas/archivo_lf.txt'], ['Bash', 'git restore --source=HEAD -- docs/una-sola-identidad/TRACKER.md'],
  ['Bash', 'git restore --staged archivo.py'], ['Bash', 'git restore -S archivo.py'], ['Bash', 'git -C D:/Hermes-lote-c restore -- core/sql_catalog.json'],
  ['Bash', 'git checkout HEAD -- docs/x.md'], ['Bash', 'git restore -- :/core/sql_catalog.json'], ['Bash', 'git checkout -- :/web/src/shell/embeds.generated.ts'],
  ['Bash', 'git checkout HEAD docs/x.md'], ['Bash', 'git checkout -bfix'], ['Bash', 'git checkout -b fix origin/main'], ['Bash', 'git switch -cfix'],
  ['PowerShell', 'git switch -cfix'], ['Bash', 'git stash --help'], ['Bash', 'git stash -h'], ['Bash', "gh pr create --title 'x' --body 'git stash'"],
  ['Bash', 'pytest -q'], ['Bash', 'mygit stash'], ['Bash', 'git'], ['Bash', 'git --version'], ['Bash', ''], ['Bash', 'echo "sin cerrar git stash'],
  ['PowerShell', 'git status'], ['PowerShell', "git commit -m 'no usar git stash'"], ['PowerShell', "git commit -m @'\nfix: frena git reset --hard y git clean -fd\n'@"],
  ['PowerShell', "Write-Output 'git stash'"], ['PowerShell', 'Write-Host "git reset --hard"'], ['PowerShell', "Select-String -Path CLAUDE.md -Pattern 'git stash'"],
  ['PowerShell', "Get-Content notas.md | Select-String 'git clean -fd'"], ['PowerShell', "@'\nnunca git stash\n'@ | Set-Content notas.txt"],
  ['PowerShell', 'git checkout main'], ['PowerShell', 'git checkout -b nueva'], ['PowerShell', 'git restore -- core/sql_catalog.json'],
  ['PowerShell', 'git restore --staged archivo.py'], ['PowerShell', 'git reset --soft HEAD~1'], ['PowerShell', 'git clean -n'], ['PowerShell', 'git stash list'],
  ['PowerShell', 'if ($true) { git status }'], ['PowerShell', 'git -C D:\\Hermes-4.14 status'],
];
// Donde P4.4 se aparta de Hermes a propósito.
const HERMES_CAMBIA = [
  // r1-18: sacar del índice no toca el árbol → pasa (Hermes frenaba)
  ['Bash', 'git restore --staged .', 'nada'],
  ['PowerShell', 'git restore --staged .', 'nada'],
  // branch-f: checkout -B y switch -C pisan una rama existente → frenan (Hermes los dejaba)
  ['Bash', 'git checkout -B rama origin/rama', 'deny'],
  ['Bash', 'git checkout -Bfix origin/fix', 'deny'],
  ['Bash', 'git switch -C nueva', 'deny'],
  ['Bash', 'git switch -Cfeature-x', 'deny'],
];

test('Hermes: lo que bloqueaba, frena', () => {
  for (const [h, c] of HERMES_BLOQUEA) assert.equal(decide(H, c, { ps: h === 'PowerShell' }).decision, 'deny', `${h}: ${c}`);
  assert.ok(HERMES_BLOQUEA.length >= 70);
});

test('Hermes: lo que dejaba pasar, pasa (en una rama de trabajo, sin .githooks)', () => {
  for (const [h, c] of HERMES_PASA) pasa(H, c, { ps: h === 'PowerShell' });
  assert.ok(HERMES_PASA.length >= 90);
});

test('Hermes: donde P4.4 se aparta (restore --staged pasa; checkout -B y switch -C frenan)', () => {
  for (const [h, c, esperado] of HERMES_CAMBIA) assert.equal(decide(H, c, { ps: h === 'PowerShell' }).decision, esperado, `${h}: ${c}`);
});

test('Hermes: una carpeta existente se cuenta como carpeta, relativa al cwd, a cada -C y a los cd de antes', () => {
  const d = carpeta('carp');
  fs.mkdirSync(path.join(d, 'docs'));
  fs.writeFileSync(path.join(d, 'docs', 'a.md'), 'x');
  const fw = d.replace(/\\/g, '/');
  assert.equal(decide(d, 'git checkout -- docs').decision, 'deny');
  assert.equal(decide(d, 'git restore docs').decision, 'deny');
  assert.equal(decide(d, 'git -C docs restore .').decision, 'deny');
  assert.equal(decide(TMP, `git -C ${fw} restore docs`).decision, 'deny');
  pasa(d, 'git checkout -- docs/a.md');
  pasa(d, 'git restore docs/a.md');
  // -C relativo y encadenado
  const repo2 = path.join(d, 'repo');
  fs.mkdirSync(path.join(repo2, 'sub', 'docs'), { recursive: true });
  assert.equal(decide(d, 'git -C repo -C sub restore docs').decision, 'deny');
  pasa(d, 'git -C otro restore docs'); // otro/docs no existe
  // los cd de antes, en secuencia
  assert.equal(decide(d, 'cd repo/sub && git restore docs').decision, 'deny');
  pasa(d, 'cd repo && git restore docs'); // repo/docs no existe
  assert.equal(decide(d, 'cd repo; cd sub; git checkout -- docs', { ps: true }).decision, 'deny');
  // sin `--`: el 2º posicional
  assert.equal(decide(d, 'git checkout origin/main docs').decision, 'deny');
  pasa(d, 'git checkout origin/main docs/a.md');
  pasa(d, 'git checkout docs'); // 1º posicional: puede ser la rama
  pasa(d, 'git checkout -b nueva docs');
  // una ruta de Git Bash (/d/…) apunta a su unidad
  if (process.platform === 'win32') {
    const gb = `/${d[0].toLowerCase()}${fw.slice(2)}`;
    assert.equal(decide(TMP, `git -C ${gb} restore docs`).decision, 'deny');
  }
});

// ---------------------------------------------------------------- historia-defecto (D-15, r1-5, r2-4)

test('historia-defecto con remoto: reset/rebase de lo propio sin pushear pasa; si tira algo publicado, frena', () => {
  const { d } = conRemoto();
  commitear(d);
  g(d, 'push', '-q');
  // HEAD~1 está publicado
  niega(d, 'git reset --soft HEAD~1', 'historia-defecto');
  niega(d, 'git reset HEAD~1', 'historia-defecto', { ps: true });
  niega(d, 'git reset --mixed HEAD~1', 'historia-defecto', { modo: 'bypassPermissions' });
  niega(d, 'git rebase -i HEAD~1', 'historia-defecto');
  pasa(d, 'git reset'); // no tira nada
  pasa(d, 'git reset HEAD a.txt');
  pasa(d, 'git reset HEAD~1 -- a.txt'); // de rutas: no mueve HEAD
  pasa(d, 'git reset no-es-un-commit');
  // un commit propio sin pushear
  commitear(d);
  pasa(d, 'git reset --soft HEAD~1');
  niega(d, 'git reset --soft HEAD~2', 'historia-defecto'); // el segundo ya está en origin
  pasa(d, 'git fetch && git rebase origin/main');
  pasa(d, 'git rebase origin/main');
  pasa(d, 'git rebase'); // contra el upstream (origin/main)
  pasa(d, 'git pull --rebase');
  pasa(d, 'git rebase --continue');
  pasa(d, 'git rebase --abort');
  niega(d, 'git rebase --root', 'historia-defecto');
  const m = niega(d, 'git reset --soft HEAD~2', 'historia-defecto').salida.hookSpecificOutput.permissionDecisionReason;
  assert.match(m, /1 de 2 ya están en origin\/main/);
  assert.match(m, /git revert/);
  // en otra rama, nada
  g(d, 'switch', '-q', '-c', 'otra');
  pasa(d, 'git reset --soft HEAD~2');
  pasa(d, 'git rebase -i HEAD~2');
  // rebase <upstream> <rama por defecto> desde otra rama: reescribe main
  niega(d, 'git rebase HEAD~2 main', 'historia-defecto');
  // rebase sin argumentos: contra el upstream; si el upstream quedó atrás de lo publicado, reescribe lo publicado
  g(d, 'switch', '-q', 'main');
  g(d, 'branch', 'vieja', 'HEAD~2');
  g(d, 'branch', '-q', '-u', 'vieja');
  niega(d, 'git rebase', 'historia-defecto');
  pasa(d, 'git rebase --continue');
  pasa(d, 'git rebase --skip');
  g(d, 'branch', '-q', '-u', 'origin/main');
});

test('historia-defecto con la rama divergida de origin (dos PCs): reset --soft HEAD~1 de lo propio pasa', () => {
  const { d, bare } = conRemoto();
  // la otra PC publica un commit
  const otra = carpeta('otraPC');
  g(otra, 'clone', '-q', bare, '.');
  commitear(otra, 'de-la-otra.txt');
  g(otra, 'push', '-q');
  // esta PC commitea sin pushear y hace fetch: divergida
  commitear(d, 'mio.txt');
  g(d, 'fetch', '-q');
  assert.equal(g(d, 'rev-list', '--left-right', '--count', 'main...origin/main'), '1\t1');
  pasa(d, 'git reset --soft HEAD~1');
  pasa(d, 'git rebase origin/main');
  pasa(d, 'git fetch && git rebase origin/main', { ps: true });
});

test('historia-defecto sin remoto: ask en los cuatro modos con ventana (con renglón "preguntó"), deny sin ventana o sin modo', () => {
  const d = repo();
  commitear(d);
  for (const modo of ['default', 'acceptEdits', 'plan', 'auto']) {
    const r = decide(d, 'git reset --soft HEAD~1', { modo });
    assert.equal(r.decision, 'ask', modo);
    assert.deepEqual(r.casos, ['historia-defecto']);
    assert.equal(r.renglonesDatos[0].detalle, 'preguntó: historia-defecto');
    assert.match(r.salida.hookSpecificOutput.permissionDecisionReason, /sin remoto/);
  }
  for (const modo of ['bypassPermissions', 'dontAsk', undefined, 'superModo']) niega(d, 'git reset --soft HEAD~1', 'historia-defecto', { modo });
  pasa(d, 'git reset');
  // un ask y un deny juntos: gana el deny, y solo el deny deja renglón
  const r = niega(d, 'git reset --soft HEAD~1; git stash', 'stash');
  assert.deepEqual(r.casos, ['stash']);
  assert.equal(r.renglonesDatos.length, 1);
});

// ---------------------------------------------------------------- push-borrar y branch -D (r1-7, r2-7)

test('push --delete / :rama de una mergeada pasa; de una no mergeada, o de la rama por defecto, frena; kit/* pasa', () => {
  const { d } = conRemoto();
  g(d, 'switch', '-q', '-c', 'mergeada');
  commitear(d);
  g(d, 'push', '-q', '-u', 'origin', 'mergeada');
  g(d, 'switch', '-q', 'main');
  g(d, 'merge', '-q', '--ff-only', 'mergeada');
  g(d, 'push', '-q');
  g(d, 'switch', '-q', '-c', 'suelta');
  commitear(d);
  g(d, 'push', '-q', '-u', 'origin', 'suelta');
  g(d, 'switch', '-q', '-c', 'kit/v9');
  commitear(d);
  g(d, 'push', '-q', '-u', 'origin', 'kit/v9');
  g(d, 'switch', '-q', 'main');
  pasa(d, 'git push origin --delete mergeada');
  pasa(d, 'git push origin :mergeada');
  pasa(d, 'git push -d origin mergeada', { ps: true });
  const m = niega(d, 'git push origin --delete suelta', 'push-borrar').salida.hookSpecificOutput.permissionDecisionReason;
  assert.match(m, /si ya está mergeada pasa; si no, `worktree cerrar`/);
  niega(d, 'git push origin :suelta', 'push-borrar');
  niega(d, 'git push origin --delete main', 'push-borrar');
  niega(d, 'git push origin :main', 'push-borrar', { modo: 'bypassPermissions' });
  niega(d, 'git push origin --delete no-existe', 'push-borrar');
  pasa(d, 'git push origin --delete kit/v9');
  pasa(d, 'git push -f origin kit/v9');
  // force con la rama actual kit/*
  g(d, 'switch', '-q', 'kit/v9');
  pasa(d, 'git push --force');
  pasa(d, 'git push -f origin HEAD');
  g(d, 'switch', '-q', 'suelta');
  niega(d, 'git push --force', 'push-force');
});

test('branch -D: de una mergeada (en origin/main o en su upstream) pasa; de una sin mergear, frena; branch -d pasa', () => {
  const { d } = conRemoto();
  g(d, 'switch', '-q', '-c', 'en-main');
  commitear(d);
  g(d, 'switch', '-q', 'main');
  g(d, 'merge', '-q', '--ff-only', 'en-main');
  g(d, 'push', '-q');
  g(d, 'switch', '-q', '-c', 'en-su-upstream');
  commitear(d);
  g(d, 'push', '-q', '-u', 'origin', 'en-su-upstream');
  g(d, 'switch', '-q', '-c', 'sin-mergear');
  commitear(d);
  g(d, 'switch', '-q', 'main');
  pasa(d, 'git branch -D en-main');
  pasa(d, 'git branch -D en-su-upstream');
  pasa(d, 'git branch -d -f en-main');
  niega(d, 'git branch -D sin-mergear', 'branch-f');
  niega(d, 'git branch --delete --force sin-mergear', 'branch-f');
  niega(d, 'git branch -D sin-mergear', 'branch-f', { ps: true });
  pasa(d, 'git branch -d sin-mergear'); // git mismo se niega
});

// ---------------------------------------------------------------- hooks-path-ausente (r1-8)

test('hooks-path-ausente: con .githooks/ y core.hooksPath distinto, commit/push/merge frenan; reponerlo pasa y después pasan', () => {
  const { d } = conRemoto({ '.githooks/pre-commit': '#!/bin/sh\nexit 0\n' });
  for (const c of ['git commit -m x', 'git push', 'git merge otra', 'git -C . commit -m x']) niega(d, c, 'hooks-path-ausente');
  niega(d, 'git commit -m x', 'hooks-path-ausente', { ps: true });
  const m = niega(d, 'git commit -m x', 'hooks-path-ausente').salida.hookSpecificOutput.permissionDecisionReason;
  assert.match(m, /reponelo: `git config core\.hooksPath \.githooks`/);
  pasa(d, 'git status');
  pasa(d, 'git add a.txt');
  pasa(d, 'git config core.hooksPath .githooks', { modo: 'bypassPermissions' });
  g(d, 'config', 'core.hooksPath', 'otra');
  niega(d, 'git commit -m x', 'hooks-path-ausente');
  g(d, 'config', 'core.hooksPath', '.githooks');
  pasa(d, 'git commit -m x');
  pasa(d, 'git push');
  pasa(d, 'git merge otra');
  // sin .githooks/ no se mira
  pasa(H, 'git commit -m x');
});

// ---------------------------------------------------------------- sesión de agente: config-agente, plomeria, salir-del-worktree

test('config-agente: en sesión de agente toda escritura de config frena (con la alternativa); longpaths, rerere y reponer hooksPath pasan', () => {
  const { d } = conRemoto();
  const w = worktree(d, 'modulo/pagos--3', 'obrero');
  for (const c of ['git config pull.rebase true', 'git config push.autoSetupRemote true', 'git config --add remote.origin.fetch x', 'git config --unset branch.main.merge', 'git config --edit', 'git config --replace-all user.name x', 'git config set user.name x', 'git config --global safe.directory "*"']) {
    niega(w, c, 'config-agente');
  }
  const m = niega(w, 'git config pull.rebase true', 'config-agente').salida.hookSpecificOutput.permissionDecisionReason;
  assert.match(m, /git pull --rebase/);
  assert.match(m, /git push -u origin HEAD/);
  assert.match(m, /safe\.directory` lo pone Guido/);
  pasa(w, 'git config core.longpaths true');
  pasa(w, 'git config rerere.enabled true');
  pasa(w, 'git config core.hooksPath .githooks', { modo: 'bypassPermissions' }); // r2-3: por encima de config-agente
  pasa(w, 'git config --get pull.rebase');
  pasa(w, 'git config -l');
  // por rol: nocturno y desconocido sí; director, actualizador y humano no
  const d2 = repo();
  for (const [rol, frena] of [['nocturno', true], ['jefe', true], ['director', false], ['actualizador', false], [null, false]]) {
    if (rol) fs.writeFileSync(path.join(d2, '.kit-rol'), `${rol}\n`);
    else fs.rmSync(path.join(d2, '.kit-rol'), { force: true });
    assert.equal(decide(d2, 'git config pull.rebase true').decision, frena ? 'deny' : 'nada', `rol ${rol}`);
  }
  // obrero por la rama sola, sin .kit-rol
  const w2 = worktree(d, 'modulo/otro--4');
  niega(w2, 'git config pull.rebase true', 'config-agente', { ps: true });
});

test('plomeria: en sesión de agente frena; un humano la puede usar', () => {
  const d = repo();
  const w = worktree(d, 'modulo/a--1', 'obrero');
  for (const c of ['git remote add x https://ejemplo.invalid/x.git', 'git remote rename origin x', 'git commit-tree HEAD^{tree} -m x', 'git hash-object -w a.txt', 'git hash-object -t blob -w a.txt', 'git mktree', 'git read-tree HEAD', 'git fast-import', 'git update-index --index-info', 'git update-index --cacheinfo 100644,abc,a.txt']) {
    niega(w, c, 'plomeria');
    pasa(d, c);
  }
  pasa(w, 'git hash-object a.txt');
  pasa(w, 'git update-index --chmod=+x a.sh');
});

test('salir-del-worktree: cd / -C / --git-dir / --work-tree al principal frenan; adentro del propio, pasa; director y humano, nada', () => {
  const d = repo();
  fs.mkdirSync(path.join(d, 'src'));
  const w = worktree(d, 'modulo/a--1', 'obrero');
  fs.mkdirSync(path.join(w, 'src'));
  const P = d.replace(/\\/g, '/');
  for (const c of [`cd ${P} && ls`, 'cd ../.. && ls', 'cd ../../.. && git status', `pushd ${P}`, `git -C ${P} status`, 'git -C ../../.. log', `git --git-dir=${P}/.git log`, `git --work-tree=${P} status`, `cd src && cd ${P}/src && ls`]) {
    niega(w, c, 'salir-del-worktree');
  }
  niega(w, `Set-Location ${P}; git status`, 'salir-del-worktree', { ps: true });
  niega(w, `cd ${d}`, 'salir-del-worktree', { ps: true });
  niega(w, `Push-Location -Path ${P}`, 'salir-del-worktree', { ps: true });
  pasa(w, 'cd src && ls');
  pasa(w, 'cd src && git status && cd .. && git commit -m x');
  pasa(w, 'git -C src status');
  pasa(w, `cd ${w.replace(/\\/g, '/')}/src && git commit -m x`);
  pasa(w, 'cd src; git add a', { ps: true });
  // fuera del principal (no es "el principal"), sin git que escribe: pasa
  pasa(w, `cd ${TMP.replace(/\\/g, '/')} && ls`);
  // el director y el humano no
  const wd = worktree(d, 'modulo/a', 'director');
  pasa(wd, `cd ${P} && git status`);
  pasa(d, 'cd .claude/worktrees && ls');
  const m = niega(w, `cd ${P}`, 'salir-del-worktree').salida.hookSpecificOutput.permissionDecisionReason;
  assert.match(m, /Quedate en tu worktree/);
});

test('salir-del-worktree: commit/push/merge en otro repo (un clon en otra carpeta) o a una carpeta que no se sabe, frenan', () => {
  const { d, bare } = conRemoto();
  const w = worktree(d, 'modulo/a--1', 'obrero');
  const clon = carpeta('clon');
  g(clon, 'clone', '-q', bare, '.');
  const C = clon.replace(/\\/g, '/');
  for (const c of [`cd ${C} && git commit -m x`, `git -C ${C} push`, `cd ${C}; git merge otra`, 'cd "$OTRO" && git commit -m x', `git --git-dir=${C}/.git commit -m x`]) {
    niega(w, c, 'salir-del-worktree');
  }
  niega(w, `Set-Location ${C}; git push`, 'salir-del-worktree', { ps: true });
  // leer en otro lado y un cd que no se sabe sin git que escribe: pasan
  pasa(w, `git -C ${C} log -1`);
  pasa(w, 'cd "$TMP" && ls');
  pasa(w, 'cd "$OTRO" && git status');
  // pushd / popd vuelven
  pasa(w, `pushd ${C} && popd && git commit -m x`);
  // el humano, en su principal, commitea en el clon sin problema
  pasa(d, `cd ${C} && git commit -m x`);
});

test('salir-del-worktree: con el .git del worktree apuntando a otro lado, todo git que escribe frena y leer pasa', () => {
  const d = repo();
  const otro = repo();
  const w = worktree(d, 'modulo/a--1', 'obrero');
  pisar(path.join(w, '.git'), `gitdir: ${path.join(otro, '.git')}\n`);
  for (const c of ['git commit -m x', 'git add a.txt', 'git push', 'git tag v1', 'git branch nueva', 'git rm a.txt']) niega(w, c, 'salir-del-worktree');
  for (const c of ['git status', 'git log -1', 'git diff', 'git branch', 'git branch -a', 'git tag', 'git remote -v', 'git rev-parse HEAD', 'git config --get user.name', 'git stash list']) pasa(w, c);
  // un clon adentro de .claude/worktrees/ con .kit-rol de obrero
  const clon = path.join(d, '.claude', 'worktrees', 'clon');
  fs.mkdirSync(clon, { recursive: true });
  g(clon, 'init', '-q', '-b', 'main');
  fs.writeFileSync(path.join(clon, '.kit-rol'), 'obrero\n');
  niega(clon, 'git commit -m x', 'salir-del-worktree');
  pasa(clon, 'git status');
  // un worktree sano no frena por esto
  const sano = worktree(d, 'modulo/b--2', 'obrero');
  pasa(sano, 'git add a.txt');
  pasa(sano, 'git commit -m x');
});

// ---------------------------------------------------------------- la ficha: quitados y rota (P4.7)

test('frenos.quitados: un id con hasta vigente apaga ese caso y nada más; vencido, frena; la ficha solo se lee si algo frenaría', () => {
  const hoy = new Date();
  const dos = (x) => String(x).padStart(2, '0');
  const fecha = (d) => `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
  const manana = fecha(new Date(hoy.getTime() + 86400000));
  const ayer = fecha(new Date(hoy.getTime() - 86400000));
  for (const [hasta, apaga] of [['siempre', true], [manana, true], [fecha(hoy), true], [ayer, false]]) {
    const { d } = conRemoto({ '.claude/kit.md': fichaQuitando('hook:git-seguro/stash', hasta) });
    if (apaga) pasa(d, 'git stash', { modo: 'bypassPermissions' });
    else niega(d, 'git stash', 'stash');
    niega(d, 'git reset --hard', 'reset-hard'); // los otros siguen
    // stash quitado + reset --hard: frena solo por reset-hard
    if (apaga) assert.deepEqual(niega(d, 'git stash; git reset --hard', 'reset-hard').casos, ['reset-hard']);
  }
  // un id de otra clase o mal escrito no apaga nada
  const { d } = conRemoto({ '.claude/kit.md': fichaQuitando('hook:git-seguro/stashh', 'siempre') });
  niega(d, 'git stash', 'stash');
  assert.deepEqual([...gs.quitadosVigentes({ frenos: { quitados: [{ id: 'hook:git-seguro/stash', hasta: 'mañana' }] } })], []);
});

test('ficha rota (4.7, caso 2): frena lo de fábrica, nada quitado, y el motivo dice dónde y "corré doctor"; lo que no frena pasa', () => {
  const { d } = conRemoto({ '.claude/kit.md': FICHA_ROTA });
  const r = niega(d, 'git stash', 'stash');
  assert.match(r.salida.hookSpecificOutput.permissionDecisionReason, /ficha rota: \.claude\/kit\.md:\d+ — corré doctor/);
  pasa(d, 'git status');
  pasa(d, 'ls');
  pasa(d, 'git log -1');
});

// ---------------------------------------------------------------- el hook corrido como lo corre la plataforma

const RE_RENGLON = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2} · (\S+) · (\S+) · hook:git-seguro\/(\S+) · (Bash|PowerShell) · (.+)$/;

test('el hook real: deny en JSON, salida 0, un renglón por caso en .claude/frenos.log, sin el comando', () => {
  const { d } = conRemoto({ '.claude/kit.md': FICHA });
  const r = correr(entrada(d, 'git stash push -m "secreto-de-prueba"'));
  assert.equal(r.codigo, 0, r.stderr);
  assert.deepEqual(Object.keys(r.json), ['hookSpecificOutput']);
  assert.equal(r.json.hookSpecificOutput.permissionDecision, 'deny');
  const l = log(d).trim().split('\n');
  assert.equal(l.length, 1);
  const m = RE_RENGLON.exec(l[0]);
  assert.ok(m, l[0]);
  assert.deepEqual([m[1], m[2], m[3], m[4], m[5]], ['humano', 'main', 'stash', 'Bash', 'stash']);
  assert.ok(!log(d).includes('secreto-de-prueba') && !log(d).includes('git stash'), 'el renglón nunca lleva el comando');
  // PowerShell, y lo que pasa no escribe nada
  correr(entrada(d, 'git reset --hard', { tool_name: 'PowerShell' }));
  assert.match(log(d).trim().split('\n')[1], / · hook:git-seguro\/reset-hard · PowerShell · reset-hard$/);
  const antes = log(d);
  const p = correr(entrada(d, 'git status'));
  assert.equal(p.out, '');
  assert.equal(log(d), antes);
  // otra herramienta, nada
  assert.equal(correr(entrada(d, 'git stash', { tool_name: 'Write' })).out, '');
  // el ask, también con renglón
  const sin = repo();
  commitear(sin);
  const a = correr(entrada(sin, 'git reset --soft HEAD~1'));
  assert.equal(a.json.hookSpecificOutput.permissionDecision, 'ask');
  assert.match(log(sin), / · hook:git-seguro\/historia-defecto · Bash · preguntó: historia-defecto\n$/);
});

test('4.7 caso 3 (error interno): no-JSON, vacía, no-objeto y una librería que falta → deny "freno roto: corré doctor", salida 0', () => {
  for (const t of ['no es json', '', '[]', 'null', '7']) {
    const r = correr(t);
    assert.equal(r.codigo, 0);
    assert.deepEqual(r.json, gs.salida('deny', gs.ROTO));
  }
  for (const falta of ['comando.cjs', 'agente.cjs', 'contexto.cjs']) {
    const hook = instanciar(falta);
    const r = correr(entrada(H, 'git stash'), { hook });
    assert.equal(r.codigo, 0);
    assert.deepEqual(r.json, gs.salida('deny', gs.ROTO), falta);
  }
  assert.throws(() => gs.decidir(null), /no es un objeto/);
});

test('4.7 caso 4 (sin remoto ni ficha): los de fábrica frenan y ls, git status y git log pasan, en todo modo', () => {
  const d = repo();
  assert.equal(g(d, 'remote'), '');
  for (const modo of MODOS) {
    niega(d, 'git stash', 'stash', { modo });
    niega(d, 'git commit --no-verify -m x', 'no-verify', { modo });
    for (const c of ['ls', 'git status', 'git log', 'git log --oneline -3']) {
      pasa(d, c, { modo });
      pasa(d, c, { modo, ps: true });
    }
  }
  // fuera de un repo: lo de fábrica igual frena (sin renglón donde escribirlo)
  const suelto = carpeta('suelto');
  const r = niega(suelto, 'git stash', 'stash');
  assert.equal(r.renglonesDatos.length, 0);
  pasa(suelto, 'ls');
});

test('sin poder escribir el renglón, el freno vale igual', () => {
  const r = gs.decidir(entrada(H, 'git stash'), {
    anotar: () => {
      throw new Error('disco lleno');
    },
  });
  assert.equal(r.decision, 'deny');
  assert.deepEqual(r.renglones, []);
});

test('no corre ningún .propio.sh: un hermano que imprime un allow no cambia nada', () => {
  const hook = instanciar();
  fs.writeFileSync(path.join(path.dirname(hook), 'git-seguro.propio.sh'), '#!/bin/sh\necho \'{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}\'\n');
  const r = correr(entrada(H, 'git stash', { permission_mode: 'bypassPermissions' }), { hook });
  assert.equal(r.json.hookSpecificOutput.permissionDecision, 'deny');
  assert.equal(r.out.trim().split('\n').length, 1);
});

test('texto incompleto (comilla sin cerrar): se juzga lo que salió', () => {
  niega(H, 'git stash; echo "sin cerrar', 'stash');
  pasa(H, 'git status; echo "sin cerrar');
  pasa(H, 'echo "sin cerrar git stash');
});

// ---------------------------------------------------------------- ningún git de los SKILL.md del molde frena

test('ningún git de los SKILL.md del molde frena (repo humano con .githooks y core.hooksPath puesto, en main con remoto)', () => {
  const { d } = conRemoto({ '.githooks/pre-commit': '#!/bin/sh\nexit 0\n', '.claude/kit.md': FICHA });
  g(d, 'config', 'core.hooksPath', '.githooks');
  const dirSkills = path.join(MOLDE, 'skills');
  const comando = require(path.join(DIR, 'lib', 'comando.cjs'));
  const comandos = [];
  for (const s of fs.readdirSync(dirSkills, { withFileTypes: true })) {
    if (!s.isDirectory()) continue;
    const t = fs.readFileSync(path.join(dirSkills, s.name, 'SKILL.md'), 'utf8');
    const trozos = [];
    for (const m of t.matchAll(/```[^\n]*\n([\s\S]*?)```/g)) trozos.push(...m[1].split('\n'));
    for (const m of t.replace(/```[\s\S]*?```/g, '').matchAll(/`([^`\n]+)`/g)) trozos.push(m[1]);
    for (const tr of trozos) {
      // los <marcadores> de la skill son texto para el agente: se cambian por una ruta o la rama por defecto
      const c = tr.replace(/<rama por defecto>/g, 'main').replace(/<[^>]+>/g, 'docs/x.md').trim();
      if (comando.partir(c).comandos.some((x) => comando.programa(x) === 'git')) comandos.push(c);
    }
  }
  assert.ok(comandos.length >= 10, `pocos git en las skills: ${comandos.length}`);
  for (const c of comandos) {
    pasa(d, c);
    pasa(d, c, { modo: 'bypassPermissions' });
  }
});
