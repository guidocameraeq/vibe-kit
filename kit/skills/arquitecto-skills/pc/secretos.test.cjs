'use strict';
// secretos.test.cjs — el corrector de la PC (SPEC-paquete-3 P4.3; criterios 2, 3, 4, 13).
// NINGUNA clave literal con forma real (r1-4): se arman en tiempo de corrida con fragmentos y cuerpos visiblemente falsos
// (EXAMPLE, 0000, A×N). Una prueba hace grep de los patrones del corrector sobre kit/ entero y espera 0.
// Las pruebas en proceso inyectan `anotar` (nada se escribe); las que miran el renglón de verdad corren una COPIA instalada en
// un HOME falso (criterio 13), así nada cae adentro del repo.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const S = require('./secretos.cjs');
const AQUI = __dirname;
const KIT = path.resolve(AQUI, '..', '..', '..');

// ---------- claves de mentira, armadas en corrida ----------
const FALSAS = {
  'github-pat': 'gh' + 'p_' + 'A'.repeat(36),
  'github-fino': 'github' + '_pat_' + 'B'.repeat(40),
  'sk-api': 'sk' + '-proj-' + 'C0'.repeat(12),
  'supabase-token': 'sb' + 'p_' + '0'.repeat(24),
  twilio: 'A' + 'C' + '0'.repeat(32) + ':' + '0'.repeat(20),
  aws: 'AK' + 'IA' + 'EXAMPLE0000ABCD00',
  'clave-privada': '-----BE' + 'GIN RSA PRIVATE KEY-----',
  slack: 'xo' + 'xb-' + 'EXAMPLE-0000',
  stripe: 's' + 'k' + '_live_' + 'EXAMPLE0000',
};
// Parecidas que NO son clave (cuerpo corto o prefijo de prueba).
const PARECIDAS = ['gh' + 'p_' + 'corto', 'sk' + '-proj-' + 'corto', 's' + 'k' + '_test_' + 'EXAMPLE', 'AK' + 'IA' + 'corta', 'xo' + 'xz-EXAMPLE', 'sk' + '-proj-PONE-ACA-TU-CLAVE-DE-OPENAI', 'sk' + '-ant-' + '0'.repeat(24)];
function jwt(payloadObj) {
  const b = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  return `${b({ alg: 'HS256', typ: 'JWT' })}.${b(payloadObj)}.sig0000`;
}
const JWT_ANON = jwt({ role: 'anon', iss: 'supabase' });
const JWT_SVC = jwt({ role: 'service_role', iss: 'supabase' });

// ---------- helpers ----------
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'g5-'));
const g = (args, cwd) => spawnSync('git', args, { cwd, encoding: 'utf8' });
function repo(conRol) {
  const d = tmp();
  g(['init', '-q', '-b', 'main'], d);
  g(['config', 'user.email', 'x@x'], d);
  g(['config', 'user.name', 'x'], d);
  g(['config', 'commit.gpgsign', 'false'], d);
  if (conRol) fs.writeFileSync(path.join(d, '.kit-rol'), conRol);
  return d;
}
const FICHA_BASE = ['kit: 2.4.3', 'nivel: estandar', 'vars:', '  proyecto: p'];
function conFicha(d, campos, rota) {
  fs.mkdirSync(path.join(d, '.claude'), { recursive: true });
  fs.writeFileSync(path.join(d, '.claude', 'kit.md'), rota ? campos.join('\n') : `---\n${campos.join('\n')}\n---\n`);
  g(['add', '-A'], d);
  g(['commit', '-q', '--no-verify', '-m', 'ficha'], d);
}
const NO_REPO = () => path.join(os.tmpdir(), 'no-repo-g5-xyz');
function tool(name, inp, modo, cwd) {
  return { hook_event_name: 'PreToolUse', tool_name: name, tool_input: inp, permission_mode: modo === undefined ? 'default' : modo, cwd: cwd || NO_REPO() };
}
const bash = (command, modo, cwd) => tool('Bash', { command }, modo, cwd);
const ps = (command, modo, cwd) => tool('PowerShell', { command }, modo, cwd);
const W = (file_path, content, modo, cwd) => tool('Write', { file_path, content }, modo, cwd);
const d = (entrada) => S.decidir(entrada, { anotar: () => null });
function siNo(si, no, arma, id) {
  for (const c of si) {
    const r = d(arma(c));
    assert.equal(r.decision, 'deny', `debería frenar: ${c}`);
    if (id) assert.equal(r.id, `secretos:${id}`, `${c} dio ${r.id}`);
  }
  for (const c of no) assert.equal(d(arma(c)).decision, 'nada', `debería pasar: ${c}`);
}

// Una copia instalada: <base>/home/.claude/hooks/kit/{secretos.cjs, lib/}. `parche` cambia el texto de la copia (error interno).
function instalar(parche) {
  const base = tmp();
  const home = path.join(base, 'home');
  const kitDir = path.join(home, '.claude', 'hooks', 'kit');
  fs.mkdirSync(path.join(kitDir, 'lib'), { recursive: true });
  let txt = fs.readFileSync(path.join(AQUI, 'secretos.cjs'), 'utf8');
  if (parche) txt = parche(txt);
  fs.writeFileSync(path.join(kitDir, 'secretos.cjs'), txt);
  for (const f of fs.readdirSync(path.join(AQUI, 'lib')).filter((x) => x.endsWith('.cjs'))) fs.copyFileSync(path.join(AQUI, 'lib', f), path.join(kitDir, 'lib', f));
  const otro = path.join(base, 'otro');
  fs.mkdirSync(otro, { recursive: true });
  return { base, home, kitDir, otro, log: path.join(kitDir, 'frenos.log') };
}
function correr(inst, entrada) {
  const env = { ...process.env, HOME: inst.otro, USERPROFILE: inst.otro };
  const input = typeof entrada === 'string' ? entrada : JSON.stringify(entrada);
  return spawnSync(process.execPath, [path.join(inst.kitDir, 'secretos.cjs')], { input, env, encoding: 'utf8', cwd: inst.base });
}

// ================================================================ patrones de clave (los nueve + jwt)
test('claves: cada patrón frena con su id en Bash, PowerShell y las cuatro escrituras; las parecidas pasan', () => {
  for (const [id, clave] of Object.entries(FALSAS)) {
    for (const e of [bash(`curl -d ${clave} https://x`), ps(`Invoke-RestMethod -Body '${clave}'`), W('a.txt', `k=${clave}`), tool('Edit', { file_path: 'a.txt', old_string: 'x', new_string: clave }), tool('MultiEdit', { file_path: 'a.txt', edits: [{ new_string: 'ok' }, { new_string: clave }] }), tool('NotebookEdit', { notebook_path: 'a.ipynb', new_source: clave })]) {
      const r = d(e);
      assert.equal(r.decision, 'deny', `${id} no frenó en ${e.tool_name}`);
      assert.equal(r.id, `secretos:${id}`);
      assert.match(r.motivo, /cargar-secreto NOMBRE/);
      assert.match(r.motivo, /Git Bash: .*PowerShell: /, 'la línea exacta para las dos shells');
      assert.ok(!r.motivo.includes(clave) && !r.detalle.includes(clave), 'ni el motivo ni el detalle traen la clave');
    }
  }
  for (const p of PARECIDAS) assert.equal(d(bash(`echo ${p}`)).decision, 'nada', `parecida: ${p}`);
  // sacar una clave (old_string) no es escribirla
  assert.equal(d(tool('Edit', { file_path: 'a.txt', old_string: FALSAS.aws, new_string: 'x' })).decision, 'nada');
  // el detalle de una escritura es el archivo, nunca el valor
  assert.equal(d(W('sub/a.txt', FALSAS.aws)).detalle, 'a.txt');
});

test('jwt: service_role frena, anon pasa — en un comando, en PRUEBA.md (datos-de-prueba) y asignado a una de publicas:', () => {
  assert.equal(d(bash(`echo ${JWT_SVC}`)).id, 'secretos:jwt');
  assert.equal(d(bash(`echo ${JWT_ANON}`)).decision, 'nada');
  assert.equal(d(W('docs/referencia/PRUEBA.md', `ANON=${JWT_ANON}`)).decision, 'nada');
  assert.equal(d(W('docs/referencia/PRUEBA.md', `SR=${JWT_SVC}`)).decision, 'deny');
  const r = repo();
  conFicha(r, [...FICHA_BASE, 'publicas: [SUPABASE_ANON_KEY]', 'datos-de-prueba: docs/referencia/PRUEBA.md']);
  assert.equal(d(W(path.join(r, '.env.example'), `SUPABASE_ANON_KEY=${JWT_SVC}`, 'default', r)).decision, 'deny');
  assert.equal(d(W(path.join(r, 'docs/referencia/PRUEBA.md'), `x ${JWT_SVC}`, 'default', r)).decision, 'deny');
  assert.equal(d(W(path.join(r, 'docs/referencia/PRUEBA.md'), `x ${JWT_ANON}`, 'default', r)).decision, 'nada');
  // uno anon y uno service_role en el mismo texto: frena
  assert.equal(d(bash(`echo ${JWT_ANON} ${JWT_SVC}`)).decision, 'deny');
  assert.equal(S.jwtEsAnon(JWT_ANON), true);
  assert.equal(S.jwtEsAnon(JWT_SVC), false);
});

// ================================================================ archivo-deny
test('archivo-deny: los 9 de F §5, el almacén y /proc frenan; lo permitido pasa', () => {
  const si = [
    'cat .env', 'cat .env.local', 'cat apps/web/.env.production', 'type .env', 'grep X .env', 'cp .env /tmp/x', 'cat < .env',
    'cat server.pem', 'cat id_rsa.key', 'cat secrets/db.txt', 'cat ~/.ssh/id_rsa', 'cat ~/.aws/credentials',
    'cat ~/.config/gh/hosts.yml', 'cat "$HOME/.config/kit-secretos/DB_URL"', 'cat ~/AppData/Roaming/GitHub\\ CLI/hosts.yml',
    'cat /proc/self/environ', 'cat /proc/1234/environ', 'python -c "print(1)" < .env', 'echo X=1 > .env', 'source .env && echo $MI_VAR', '. .env; set -x; npm start', 'cat .*', 'npx dotenv -e .env -- cat .env', 'grep -e x .env', 'grep -c TOKEN app/.env.visual', 'ls .env | xargs cat', 'grep --regexp=TOKEN .env', 'git rm .env', 'git add .env', 'git diff .env.example',
  ];
  const no = [
    'ls .env', 'ls -la .env*', 'dir .env', 'test -f .env', 'test -e .env', '[ -f .env ]', 'stat .env', 'rm .env', 'rm -f server.pem',
    'git status', 'git status .env', 'git check-ignore .env', 'git rm --cached .env', 'git -C sub rm --cached .env',
    'node --env-file=.env app.js', 'docker run --env-file .env img', 'source .env', '. .env && npm start',
    'echo .env >> .gitignore', 'printf ".env\\n" >> .dockerignore', 'cat README.md', 'cat .claude/settings.json',
    'grep -r process.env src', 'curl https://x.com/secrets/a', 'cat .envrc.md',
    'npx dotenv -e .env.visual -- npx playwright test', 'dotenv -e .env -- node a.js', 'set -a; . ./.env; set +a; npm run deploy; echo "exit $?"',
    'ssh srv "test -f /srv/app/.env && echo ok"', 'docker exec c sh -c "ls -la /run/secrets && echo ok"', 'grep -n "^/.env" .gitignore', 'grep -E "a|.env" notas.md',
    'grep -c x <<< ".env"', 'ssh srv "ls x; cat /srv/.env"', 'node --env-file=config/.env.production app.js', 'grep -e "^/.env" .gitignore',
    'ls docs/*', 'wc -l *', 'cp -r dist/* public/', 'mkdir -p "$S/secrets"', 'npx --prefix app dotenv -e .env -- node a.cjs',
    'grep -n "secrets" docker-compose.yml', 'grep -A 3 secrets notas.md', 'ls app/.env* 2>/dev/null | head', 'ls -la .env | wc -l', 'powershell -NoProfile -Command "Test-Path app/.env"', 'bash -c "ls .env"', '(cd app && ls .env)', 'powershell -Command "New-Item -ItemType Directory x | Out-Null; Test-Path .env"',
  ];
  siNo(si, no, (c) => bash(c), 'archivo-deny');
});

test('archivo-deny: el pipeline entero, comodines, variable asignada y Windows sin mayúsculas', () => {
  // pipeline: el que lista está permitido, el que lee no
  siNo(['gci .env | gc', 'Get-ChildItem .env | Get-Content', 'gci .env; gc .env', 'gci .env | sls x', 'gci .env | Select-Object -First 1'], ['gci .env | Remove-Item', 'gci .env; gc README.md'], (c) => ps(c), 'archivo-deny');
  siNo(['ls .env | xargs cat', 'test -f .env && cat .env', 'ls .env | cat', '(cat .env)', 'bash -c "cat .env"', 'cat <<EOF > x\n.env\nEOF\nls .env && cat README.md'],
    ['ls .env && cat README.md', 'npx dotenv -e .env.visual -- npx playwright test 2>&1 | tail -30', 'node --env-file=.env a.js | grep listo', 'test -f .env || echo falta', 'echo .env >> .gitignore && git add .gitignore', 'source .env && npm run dev', 'ls .env 2>&1 && npm test', 'ls .env\nnpm test'], (c) => bash(c), 'archivo-deny');
  // comodines que pueden calzar con una ruta del deny
  siNo(['cat .e*', 'cat .en?', 'cat *.pem', 'cat .env.*', 'Get-Content .E*'], ['cat *.md', 'cat src/*.js', 'ls .e*'], (c) => bash(c), 'archivo-deny');
  // variable asignada en la misma llamada
  siNo(['F=.env; cat "$F"', 'export F=.env && cat $F', 'F=~/.ssh/id_rsa; cp "$F" /tmp'], ['F=.env; ls "$F"', 'F=README.md; cat "$F"'], (c) => bash(c), 'archivo-deny');
  siNo(["$f = '.env'; Get-Content $f", 'Get-Content .ENV', 'gc .Env.Local', 'type SECRETS\\db.txt', 'Get-Content C:\\x\\Server.PEM'], ['Test-Path .ENV', 'Remove-Item .Env'], (c) => ps(c), 'archivo-deny');
  // el detalle es la ruta relativa o <home>/…, nunca el comando
  assert.equal(d(bash('cat ~/.ssh/id_rsa | base64')).detalle, '<home>/.ssh/id_rsa');
});

test('archivo-deny: los Read(...) del deny de los settings*.json del proyecto (raíz por git desde el cwd)', () => {
  const r = repo();
  fs.mkdirSync(path.join(r, '.claude'), { recursive: true });
  fs.mkdirSync(path.join(r, 'sub'), { recursive: true });
  fs.writeFileSync(path.join(r, '.claude', 'settings.json'), JSON.stringify({ permissions: { deny: ['Read(./config/prod.json)', 'Write(./x)', 'Read(./privado/**)'] } }));
  fs.writeFileSync(path.join(r, '.claude', 'settings.local.json'), JSON.stringify({ permissions: { deny: ['Read(credenciales.txt)'] } }));
  const sub = path.join(r, 'sub');
  siNo(['cat config/prod.json', 'cat privado/a/b.txt', 'cat sub/x/credenciales.txt', 'grep -r x privado'], ['cat config/dev.json', 'cat x', 'ls privado'], (c) => bash(c, 'default', r), 'archivo-deny');
  // desde una subcarpeta: la raíz sale de git, la ruta del cwd
  assert.equal(d(bash('cat ../config/prod.json', 'default', sub)).decision, 'deny');
  assert.equal(d(bash('cat config/prod.json', 'default', sub)).decision, 'nada');
  // un settings roto no frena nada por sí solo
  fs.writeFileSync(path.join(r, '.claude', 'settings.local.json'), '{roto');
  assert.equal(d(bash('cat config/dev.json', 'default', r)).decision, 'nada');
  // la conversión de reglas
  const res = S.denyDeSettings(r);
  assert.ok(res.some((re) => re.test(`${r.replace(/\\/g, '/').toLowerCase()}/config/prod.json`)));
  assert.equal(S.globARegex('a/**/b').test('a/b'), true);
  assert.equal(S.globARegex('a/*/b').test('a/x/y/b'), false);
});

// ================================================================ imprime-todas (los seis)
test('imprime-todas: los seis frenan; set -e, set -o pipefail, env X=1 cmd, export X=1 no', () => {
  siNo(['printenv', 'env', 'set', 'export -p', 'declare -p', 'env | grep TOKEN', 'sudo env'], ['set -e', 'set -euo pipefail', 'set -o pipefail', 'env X=1 node a.js', 'export X=1', 'declare -p X', 'printenv HOME'], (c) => bash(c), 'imprime-todas');
  siNo(['Get-ChildItem Env:', 'gci env:', 'ls Env:\\', 'dir env:', 'Get-ChildItem -Path Env:'], ['Get-ChildItem .', 'gci env:PATH'], (c) => ps(c), 'imprime-todas');
});

// ================================================================ imprime-variable (D-14)
test('imprime-variable (1): un impresor con la variable; (4) lo verboso en la misma llamada; usar sin ver pasa', () => {
  siNo(
    ['echo $GH_TOKEN', 'echo "${GH_TOKEN}"', 'echo ${GH_TOKEN:0:6}', 'printf "%s" "$DB_URL"', 'cat <<< $API_KEY', 'echo x | tee $DB_PASSWORD', 'echo %DB_URL%',
      'curl -v -H "Authorization: token $GH_TOKEN" https://x', 'curl -sv -H "x: $GH_TOKEN" https://x', 'set -x; curl -H "x: $GH_TOKEN" https://x',
      'bash -x deploy.sh "$DB_URL"', 'curl --trace-ascii - -H "x: $GH_TOKEN" https://x', 'npm run x --verbose -- "$API_KEY"'],
    ['curl -H "Authorization: token $GH_TOKEN" https://x', 'psql "$DATABASE_URL" -c "select 1"', 'echo $HOME', 'echo $PATH', 'echo "listo"', 'grep -v x a.txt && curl -H "$X" y', 'node -v', 'python -V && echo $GH_TOKEN_LEN'.replace('$GH_TOKEN_LEN', '$HOME')],
    (c) => bash(c),
    'imprime-variable',
  );
  siNo(['Write-Host $env:DB_URL', 'Write-Output "x: $env:API_KEY"', 'echo $env:GH_TOKEN', 'Invoke-RestMethod -Verbose -Headers @{a=$env:GH_TOKEN} x'], ['Invoke-RestMethod -Headers @{a=$env:GH_TOKEN} https://x', 'Write-Host $env:USERNAME'], (c) => ps(c), 'imprime-variable');
  // el detalle es el NOMBRE
  assert.equal(d(bash('echo $GH_TOKEN')).detalle, 'GH_TOKEN');
});

test('imprime-variable (2): en PowerShell, la sentencia que es solo la variable, un string que la interpola o GetEnvironmentVariable', () => {
  siNo(
    ['$env:DB_URL', '"$env:DB_URL"', '${env:DB_URL}', '"la url: $env:DB_URL"', '$token', "[Environment]::GetEnvironmentVariable('DB_URL')", '[System.Environment]::GetEnvironmentVariable("GH_TOKEN", "User")', "Write-Host ([Environment]::GetEnvironmentVariable('DB_URL'))", 'cd x; $env:API_KEY'],
    ["$t = [Environment]::GetEnvironmentVariable('DB_URL')", '$env:DB_URL = "x"', '$env:PATH', '"hola"', 'git push'],
    (c) => ps(c),
    'imprime-variable',
  );
});

test('imprime-variable (3): printenv X, gci env:X (y con comodín), node -e/-p y python -c que imprimen', () => {
  siNo(['printenv GH_TOKEN', 'node -e "console.log(process.env.DB_URL)"', 'node -p process.env.GH_TOKEN', `node -e "process.stdout.write(String(process.env.DB_URL))"`, `python -c "print('x', os.environ.get('GH_TOKEN'))"`, `node -e "console.log(process.env['API_KEY'])"`, `python -c "import os; print(os.environ['DB_URL'])"`, `python3 -c "import os;print(os.getenv('GH_TOKEN'))"`],
    ['printenv HOME', 'node -e "fetch(u,{headers:{a:process.env.GH_TOKEN}})"', 'node app.js', `python -c "import os; requests.get(u, headers={'a': os.environ['GH_TOKEN']})"`, `py -c "import os; os.environ['SUPABASE_SERVICE_KEY']=e['k']; print('listo')"`, 'node -e "console.log(1); fetch(u,{headers:{a:process.env.GH_TOKEN}})"'], (c) => bash(c), 'imprime-variable');
  siNo(['gci env:GH_TOKEN', 'Get-Item env:DB_URL', 'Get-ChildItem Env:\\API_KEY', 'gci env:*URL*', 'ls env:GH*'], ['gci env:PATH', 'Get-Item env:USERNAME'], (c) => ps(c), 'imprime-variable');
});

test('imprime-variable: cada nombre de fábrica cuenta; uno común no', () => {
  for (const n of ['GH_TOKEN', 'MY_SECRET', 'DB_PASSWORD', 'SMTP_PASS', 'DB_PWD', 'OPENAI_API_KEY', 'GPG_PRIVATE_KEY', 'SUPABASE_SERVICE_ROLE', 'STRIPE_KEY', 'AZURE_CREDENTIALS', 'DATABASE_URL', 'DB_URL', 'SENTRY_DSN', 'MONGO_CONNECTION_STRING', 'X_API_KEY_ID', 'GPG_PRIVATE_KEY_FILE']) {
    assert.equal(d(bash(`echo $${n}`)).decision, 'deny', n);
    assert.equal(S.varSensible(n), true, n);
  }
  for (const n of ['HOME', 'PATH', 'USER', 'NODE_ENV', 'KEYBOARD', 'PORT']) assert.equal(S.varSensible(n), false, n);
});

// ================================================================ credencial-guardada
test('credencial-guardada: las cuatro formas frenan; el uso común de gh y git no', () => {
  siNo(['gh auth token', 'gh auth token --hostname github.com', 'gh auth status -t', 'gh auth status --show-token', 'git credential fill', 'printf "host=github.com\\n" | git credential fill', 'git credential-manager get', 'git -c x=y credential fill'],
    ['gh auth status', 'gh auth login', 'gh pr list', 'git credential-manager configure', 'git credential approve'], (c) => bash(c), 'credencial-guardada');
});

// ================================================================ frenos del proyecto (sesión de agente)
test('frenos-del-proyecto: en sesión de agente (obrero, nocturno, desconocido, rama de obrero) frena; humano, director y actualizador no', () => {
  const caminos = ['.claude/hooks/x.cjs', '.claude/settings.json', '.claude/settings.local.json', '.githooks/pre-commit', '.kit-rol'];
  for (const rol of ['obrero', 'nocturno', 'raro-que-da-desconocido']) {
    const r = repo(rol);
    for (const c of caminos) {
      const res = d(W(path.join(r, c), 'x', 'default', r));
      assert.equal(res.decision, 'deny', `${rol}: ${c}`);
      assert.equal(res.id, 'secretos:frenos-del-proyecto');
      assert.equal(res.detalle, c);
    }
    assert.equal(d(W(path.join(r, 'src/a.js'), 'x', 'default', r)).decision, 'nada');
  }
  for (const rol of [null, 'director', 'actualizador']) {
    const r = repo(rol);
    for (const c of caminos) assert.equal(d(W(path.join(r, c), 'x', 'bypassPermissions', r)).decision, 'nada', `${rol || 'humano'}: ${c}`);
    assert.equal(d(bash('rm -rf .claude/hooks .githooks', 'default', r)).decision, 'nada');
  }
  // obrero por la rama, sin .kit-rol (borrarlo no lo vuelve humano)
  const r = repo();
  g(['commit', '-q', '--allow-empty', '-m', 'x'], r);
  g(['switch', '-q', '-c', 'modulo/login--A1'], r);
  assert.equal(d(W(path.join(r, '.kit-rol'), 'humano', 'default', r)).decision, 'deny');
});

test('frenos-del-proyecto: por Bash/PowerShell escribe frena, la lista de lectura pasa, escribir por redirección nunca pasa', () => {
  const r = repo('obrero');
  siNo(
    ['rm .claude/hooks/x.cjs', 'mv .claude/hooks/a.cjs b.cjs', 'sed -i s/a/b/ .claude/settings.json', 'echo x > .kit-rol', 'cp a .githooks/pre-commit', 'cat x > .claude/hooks/y.cjs', 'node script.js .claude/hooks/x.cjs', 'git add .claude/hooks/x.cjs', 'chmod -x .githooks/pre-commit'],
    ['cat .claude/hooks/x.cjs', 'ls .claude/hooks', 'head .githooks/pre-commit', 'git diff .claude/settings.json', 'git log -- .kit-rol', 'git show HEAD:.kit-rol', 'node .claude/hooks/x.cjs', 'sha256sum .claude/hooks/x.cjs', 'grep -n x .claude/settings.json'],
    (c) => bash(c, 'default', r),
    'frenos-del-proyecto',
  );
  siNo(['Set-Content .kit-rol humano', 'Remove-Item .claude\\hooks\\x.cjs'], ['Get-Content .claude\\settings.json'], (c) => ps(c, 'default', r), 'frenos-del-proyecto');
});

test('frenos-del-proyecto: el git-dir común (config, hooks, refs, packed-refs, FETCH_HEAD, logs, worktrees), el .git del worktree, los .lock', () => {
  const r = repo('obrero');
  g(['commit', '-q', '--allow-empty', '-m', 'x'], r);
  const comun = path.join(r, '.git');
  for (const c of ['config', 'hooks/pre-commit', 'refs/heads/main', 'packed-refs', 'FETCH_HEAD', 'logs/HEAD', 'worktrees/x/HEAD']) {
    const res = d(W(path.join(comun, c), 'x', 'default', r));
    assert.equal(res.decision, 'deny', c);
    assert.equal(res.detalle, `<git-común>/${c.toLowerCase()}`);
  }
  for (const c of ['COMMIT_EDITMSG', 'ORIG_HEAD', 'description']) assert.equal(d(W(path.join(comun, c), 'x', 'default', r)).decision, 'nada', c);
  assert.equal(d(bash('echo x > .git/config', 'default', r)).decision, 'deny');
  assert.equal(d(bash('cat .git/config', 'default', r)).decision, 'nada');
  assert.equal(d(bash('rm -rf .git', 'default', r)).decision, 'deny');
  // los .lock: index.lock libre; un .lock viejo de lo protegido, "pedíselo al director"
  assert.equal(d(bash('rm -f .git/index.lock', 'default', r)).decision, 'nada');
  for (const c of ['.git/refs/heads/main.lock', '.git/config.lock', '.git/packed-refs.lock']) {
    const res = d(bash(`rm -f ${c}`, 'default', r));
    assert.equal(res.decision, 'deny', c);
    assert.match(res.motivo, /.lock viejo.*director/);
  }
  const wl = d(W(path.join(comun, 'packed-refs.lock'), 'x', 'default', r));
  assert.equal(wl.decision, 'deny');
  assert.match(wl.motivo, /\.lock viejo/);
  assert.equal(d(W(path.join(comun, 'index.lock'), 'x', 'default', r)).decision, 'nada');
  // un worktree: su .git (archivo) y su carpeta en el común
  const wt = path.join(tmp(), 'wt');
  g(['worktree', 'add', '-q', '-b', 'modulo/x--B2', wt], r);
  assert.equal(d(W(path.join(wt, '.git'), 'gitdir: /otro', 'default', wt)).decision, 'deny');
  assert.equal(d(bash('rm .git', 'default', wt)).decision, 'deny');
  assert.equal(d(W(path.join(comun, 'worktrees', 'wt', 'HEAD'), 'x', 'default', wt)).decision, 'deny');
  assert.equal(d(bash(`rm -f "${path.join(comun, 'worktrees', 'wt', 'index.lock').replace(/\\/g, '/')}"`, 'default', wt)).decision, 'nada');
  assert.equal(d(W(path.join(wt, '.claude/hooks/a.cjs'), 'x', 'default', wt)).decision, 'deny');
});

// ================================================================ frenos de la PC
test('frenos-de-la-pc: <home>/.claude/hooks/kit siempre; el settings de la PC: ask con ventana, deny en agente o sin ventana', () => {
  const kit = path.join(S.HOME, '.claude', 'hooks', 'kit', 'secretos.cjs');
  const set = path.join(S.HOME, '.claude', 'settings.json');
  for (const modo of ['default', 'acceptEdits', 'bypassPermissions', 'dontAsk']) {
    const res = d(W(kit, 'x', modo));
    assert.equal(res.decision, 'deny', modo);
    assert.equal(res.id, 'secretos:frenos-de-la-pc');
  }
  for (const modo of ['default', 'acceptEdits', 'plan', 'auto']) {
    const res = d(W(set, 'x', modo));
    assert.equal(res.decision, 'ask', modo);
    assert.equal(res.detalle, 'preguntó: <home>/.claude/settings.json');
  }
  for (const modo of ['bypassPermissions', 'dontAsk', '']) assert.equal(d(W(set, 'x', modo)).decision, 'deny', modo || 'sin modo');
  const obrero = repo('obrero');
  assert.equal(d(W(set, 'x', 'default', obrero)).decision, 'deny');
  // por Bash: escribir frena, leer pasa
  siNo(['rm ~/.claude/hooks/kit/secretos.cjs', 'echo x > ~/.claude/hooks/kit/lib/git.cjs', 'cp a.cjs "$HOME/.claude/hooks/kit/"'], ['cat ~/.claude/hooks/kit/frenos.log', 'ls ~/.claude/hooks/kit', 'cat ~/.claude/settings.json'], (c) => bash(c), 'frenos-de-la-pc');
  assert.equal(d(bash('echo {} > ~/.claude/settings.json')).decision, 'ask');
  assert.equal(d(bash('echo {} > ~/.claude/settings.json', 'bypassPermissions')).decision, 'deny');
  // un lector que ESCRIBE por redirección no es lectura
  assert.equal(d(bash('cat a.cjs > ~/.claude/hooks/kit/secretos.cjs')).decision, 'deny');
  // un deny gana sobre un ask, aunque venga después
  assert.equal(d(bash('echo {} > ~/.claude/settings.json; echo $GH_TOKEN')).decision, 'deny');
  // otro settings (el del proyecto) no es el de la PC
  assert.equal(d(W(path.join(S.HOME, 'proy', '.claude', 'settings.json'), 'x')).decision, 'nada');
});

// ================================================================ cambios-sin-ventana
test('cambios-sin-ventana: en bypass y dontAsk frena lo que nombra .claude/cambios/, salvo el script sin otra mención', () => {
  for (const modo of ['bypassPermissions', 'dontAsk']) {
    siNo(['cat .claude/cambios/x.md', 'rm -rf .claude/cambios', 'node .claude/scripts/cambios.cjs ver .claude/cambios/x.md', 'echo x > .claude\\cambios\\a.md'], ['node .claude/scripts/cambios.cjs aprobar', 'node .claude/scripts/cambios.cjs', 'cat .claude/cambios.md'], (c) => bash(c, modo), 'cambios-sin-ventana');
  }
  for (const modo of ['default', 'acceptEdits', 'plan', 'auto']) assert.equal(d(bash('cat .claude/cambios/x.md', modo)).decision, 'nada', modo);
});

// ================================================================ UserPromptSubmit (D-5)
test('UserPromptSubmit: una clave frena con decision block y suppressOriginalPrompt, sin la clave; anon y un prompt limpio pasan', () => {
  for (const [id, k] of Object.entries(FALSAS)) {
    const r = d({ hook_event_name: 'UserPromptSubmit', prompt: `usá ${k} para entrar` });
    assert.equal(r.decision, 'block', id);
    assert.equal(r.id, `secretos:${id}`);
    assert.equal(r.salida.decision, 'block');
    assert.equal(r.salida.hookSpecificOutput.hookEventName, 'UserPromptSubmit');
    assert.equal(r.salida.hookSpecificOutput.suppressOriginalPrompt, true);
    assert.match(r.salida.reason, /rotala/);
    assert.match(r.salida.reason, /se-filtro-una-credencial/);
    assert.ok(!JSON.stringify(r).includes(k), 'nada de lo que devuelve trae la clave');
  }
  assert.equal(d({ hook_event_name: 'UserPromptSubmit', prompt: `la service role: ${JWT_SVC}` }).decision, 'block');
  assert.equal(d({ hook_event_name: 'UserPromptSubmit', prompt: `la anon: ${JWT_ANON}` }).decision, 'nada');
  assert.equal(d({ hook_event_name: 'UserPromptSubmit', prompt: 'hola, arreglá el login y mirá el .env' }).decision, 'nada');
  assert.equal(d({ hook_event_name: 'UserPromptSubmit' }).decision, 'nada');
  // el renglón que falla no destraba el freno
  assert.equal(S.decidir({ hook_event_name: 'UserPromptSubmit', prompt: FALSAS.aws }, { anotar: () => { throw new Error('x'); } }).decision, 'block');
});

test('UserPromptSubmit instalado: bloquea con exit 0; ante un error interno FALLA ABIERTO (exit 0, sin salida)', () => {
  const inst = instalar();
  const k = FALSAS['github-pat'];
  const r = correr(inst, { hook_event_name: 'UserPromptSubmit', prompt: `ahí va ${k}`, cwd: inst.base });
  assert.equal(r.status, 0, r.stderr);
  const out = JSON.parse(r.stdout);
  assert.equal(out.decision, 'block');
  assert.equal(out.hookSpecificOutput.suppressOriginalPrompt, true);
  assert.ok(!r.stdout.includes(k) && !r.stderr.includes(k));
  assert.ok(!fs.readFileSync(inst.log, 'utf8').includes(k));
  assert.match(fs.readFileSync(inst.log, 'utf8'), /secretos:github-pat · UserPromptSubmit · \(prompt\)/);
  const roto = instalar((t) => t.replace('function decidirPrompt(e, opciones) {', 'function decidirPrompt(e, opciones) {\n  throw new Error("roto a propósito");'));
  const r2 = correr(roto, { hook_event_name: 'UserPromptSubmit', prompt: `ahí va ${k}` });
  assert.equal(r2.status, 0);
  assert.equal(r2.stdout, '');
});

// ================================================================ la ficha (regla 4.7)
test('ficha: frenos.quitados con hasta vigente apaga ESE id y nada más; vencido no; publicas exime y secretos suma', () => {
  const r = repo();
  conFicha(r, [...FICHA_BASE, 'secretos: [MIVALOR]', 'publicas: [SUPABASE_ANON_KEY]', 'frenos:', '  quitados:',
    '    - {id: "secretos:github-pat", por: "prueba", hasta: siempre}', '    - {id: "secretos:imprime-todas", por: "prueba", hasta: 2020-01-01}']);
  assert.equal(d(bash(`echo ${FALSAS['github-pat']}`, 'default', r)).decision, 'nada');
  assert.equal(d(bash(`echo ${FALSAS.aws}`, 'default', r)).decision, 'deny');
  assert.equal(d(bash('printenv', 'default', r)).decision, 'deny', 'vencido: no apaga');
  assert.equal(d(bash('echo $SUPABASE_ANON_KEY', 'default', r)).decision, 'nada');
  assert.equal(d(bash('echo $DB_URL', 'default', r)).decision, 'deny');
  assert.equal(d(bash('echo $MIVALOR', 'default', r)).decision, 'deny');
  assert.equal(d(bash('echo $MIVALOR', 'default', NO_REPO())).decision, 'nada', 'sin ficha, MIVALOR no es de fábrica');
  const v = S.quitadosVigentes({ frenos: { quitados: [{ id: 'a', hasta: '2026-10-29' }, { id: 'b', hasta: '2026-10-28' }, { id: 'c', hasta: 'mañana' }] } }, new Date(2026, 9, 29));
  assert.deepEqual([...v], ['a']);
});

test('P4.7 ficha rota: frena igual, nada quitado, el motivo lo dice, y secretos:/publicas: salen de la última que se lee', () => {
  const r = repo();
  conFicha(r, [...FICHA_BASE, 'secretos: [MIVALOR]', 'publicas: [SUPABASE_ANON_KEY]', 'frenos:', '  quitados:', '    - {id: "secretos:github-pat", por: "prueba", hasta: siempre}']);
  conFicha(r, ['kit: no-es-version', 'nivel: estandar'], true);
  const res = d(bash(`echo ${FALSAS['github-pat']}`, 'default', r));
  assert.equal(res.decision, 'deny', 'rota: nada quitado');
  assert.match(res.motivo, /ficha rota: \.claude\/kit\.md:\d+ — corré doctor/);
  assert.equal(d(bash('echo $MIVALOR', 'default', r)).decision, 'deny');
  assert.equal(d(bash('echo $SUPABASE_ANON_KEY', 'default', r)).decision, 'nada');
});

// ================================================================ P4.7: los cuatro casos y el renglón
test('P4.7 sin remoto ni ficha: ls, git status, un Write común y un Bash cualquiera pasan (también en sesión de agente)', () => {
  for (const r of [repo(), repo('obrero')]) {
    for (const c of ['ls', 'ls -la', 'git status', 'npm test', 'git add src/a.js && git commit -m x']) assert.equal(d(bash(c, 'default', r)).decision, 'nada', c);
    assert.equal(d(W(path.join(r, 'README.md'), 'hola', 'default', r)).decision, 'nada');
    assert.equal(d(tool('Edit', { file_path: path.join(r, 'a.js'), old_string: 'a', new_string: 'b' }, 'bypassPermissions', r)).decision, 'nada');
  }
  assert.equal(d(tool('Read', { file_path: '.env' })).decision, 'nada', 'Read no es de este hook (lo frena el deny)');
  assert.equal(d(tool('Bash', {})).decision, 'nada');
});

test('P4.7 error interno y entrada rota: deny "freno roto: corré doctor" (exit 0); el decidir puro tira', () => {
  assert.throws(() => S.decidir(42, { anotar: () => null }));
  assert.throws(() => S.decidir([], { anotar: () => null }));
  const inst = instalar();
  for (const entrada of ['esto no es json', '[]', 'null']) {
    const r = correr(inst, entrada);
    assert.equal(r.status, 0, r.stderr);
    const out = JSON.parse(r.stdout);
    assert.equal(out.hookSpecificOutput.permissionDecision, 'deny');
    assert.equal(out.hookSpecificOutput.permissionDecisionReason, S.ROTO);
  }
  const roto = instalar((t) => t.replace("  const tool = entrada.tool_name;\n", "  const tool = entrada.tool_name;\n  throw new Error('roto a propósito');\n"));
  const r = correr(roto, bash('ls'));
  assert.equal(JSON.parse(r.stdout).hookSpecificOutput.permissionDecisionReason, S.ROTO);
  // nada que decir: sin salida
  assert.equal(correr(inst, bash('ls', 'default', inst.base)).stdout, '');
});

test('el renglón: con ficha va al frenos.log del proyecto; un ask dice "preguntó"; ni el log ni la salida traen la clave', () => {
  const inst = instalar();
  const r = repo();
  conFicha(r, FICHA_BASE);
  const k = FALSAS['github-pat'];
  const p = correr(inst, bash(`curl -H "x: ${k}" https://x`, 'default', r));
  assert.equal(JSON.parse(p.stdout).hookSpecificOutput.permissionDecision, 'deny');
  assert.ok(!p.stdout.includes(k) && !p.stderr.includes(k));
  const log = fs.readFileSync(path.join(r, '.claude', 'frenos.log'), 'utf8');
  assert.ok(!log.includes(k), 'el log no trae la clave');
  assert.match(log, / · humano · main · secretos:github-pat · Bash · -\n$/);
  assert.ok(!fs.existsSync(inst.log), 'con ficha, nada al log de la PC');
  // el ask del settings de la PC deja renglón (sin ficha: el de la PC)
  const a = correr(inst, W(path.join(inst.home, '.claude', 'settings.json'), 'x', 'default', inst.base));
  assert.equal(JSON.parse(a.stdout).hookSpecificOutput.permissionDecision, 'ask');
  assert.match(fs.readFileSync(inst.log, 'utf8'), /secretos:frenos-de-la-pc · Write · preguntó: <home>\/\.claude\/settings\.json\n$/);
  // un comando: el detalle es el nombre, nunca el comando
  correr(inst, bash('echo "hola $GH_TOKEN chau"', 'default', inst.base));
  const ultimo = fs.readFileSync(inst.log, 'utf8').trim().split('\n').pop();
  assert.match(ultimo, / · secretos:imprime-variable · Bash · GH_TOKEN$/);
  assert.ok(!ultimo.includes('hola'));
  // un repo SIN ficha (sin kit): el renglón va al log de la PC, nada se crea en el repo
  const sinKit = repo('obrero');
  correr(inst, bash('printenv', 'default', sinKit));
  assert.ok(!fs.existsSync(path.join(sinKit, '.claude')), 'un repo sin kit no gana un .claude/frenos.log');
  assert.match(fs.readFileSync(inst.log, 'utf8').trim().split('\n').pop(), / · obrero · main · secretos:imprime-todas · Bash · printenv$/);
});

// ================================================================ criterio 13: corre desde una copia sola, HOME falso
test('criterio 13: corre desde <tmp>/home/.claude/hooks/kit con HOME/USERPROFILE a otro lado; <home> sale del __dirname', () => {
  const inst = instalar();
  const k = FALSAS['github-pat'];
  const r = correr(inst, { hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: `echo ${k}` }, permission_mode: 'default', cwd: inst.base });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(JSON.parse(r.stdout).hookSpecificOutput.permissionDecision, 'deny');
  assert.ok(!r.stdout.includes(k));
  assert.ok(fs.existsSync(inst.log), 'el log de la PC cae bajo <tmp>/home');
  assert.ok(!fs.existsSync(path.join(inst.otro, '.claude')), 'nada bajo el HOME del proceso');
  assert.ok(!fs.readFileSync(inst.log, 'utf8').includes(k));
  // los frenos de la PC miran <tmp>/home, no el HOME del proceso
  const w = (f) => correr(inst, W(f, 'x', 'default', inst.base)).stdout;
  assert.match(w(path.join(inst.home, '.claude', 'hooks', 'kit', 'secretos.cjs')), /"deny"/);
  assert.equal(w(path.join(inst.otro, '.claude', 'hooks', 'kit', 'secretos.cjs')), '');
  // y ~ también es <tmp>/home
  assert.match(correr(inst, bash('cat ~/.ssh/id_rsa', 'default', inst.base)).stdout, /"deny"/);
  // desde el repo (no instalado) el renglón de la PC no se escribe
  assert.equal(S.INSTALADO, false);
  // instalado en otro lado (la copia de kit-sync en .claude/skills/…): <home> sigue siendo la carpeta antes del .claude
  assert.equal(S.homeDelHook(path.join(inst.base, 'casa', '.claude', 'skills', 'arquitecto-skills', 'pc')), path.join(inst.base, 'casa'));
  const res = S.decidir(bash('printenv', 'default', NO_REPO()));
  assert.equal(res.decision, 'deny');
  assert.equal(res.renglon, null);
  assert.ok(!fs.existsSync(path.join(S.HOME, '.claude')), 'nada escrito adentro del repo');
});

// ================================================================ r1-4: sin claves literales en kit/
test('r1-4: grep de los patrones del corrector sobre kit/ entero → 0', () => {
  const patrones = [...S.bancoPatrones().map((p) => ({ id: p.id, re: p.re })), { id: 'jwt', re: S.RE_JWT }];
  const malos = [];
  let archivos = 0;
  (function recorrer(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name === '.git' || e.name === 'node_modules') continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) recorrer(p);
      else {
        let txt;
        try {
          txt = fs.readFileSync(p, 'utf8');
        } catch (x) {
          continue;
        }
        archivos++;
        for (const { id, re } of patrones) {
          const m = txt.match(new RegExp(re.source, 'g')) || [];
          if (m.some((x) => !(id === 'jwt' && S.jwtEsAnon(x)))) malos.push(`${path.relative(KIT, p)} :: ${id}`);
        }
      }
    }
  })(KIT);
  assert.ok(archivos > 50, `recorrió pocos archivos (${archivos})`);
  assert.deepEqual(malos, [], `hay claves con forma real en kit/:\n${malos.join('\n')}`);
});
