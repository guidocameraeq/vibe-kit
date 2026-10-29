'use strict';
// secretos.test.cjs — el corrector de la PC (SPEC-paquete-3 P4.3; criterios 2, 3, 4, 13).
// NINGUNA clave literal con forma real (r1-4): se arman en tiempo de corrida con fragmentos y cuerpos visiblemente falsos
// (EXAMPLE, 0000, A×N). Una prueba hace grep de los patrones del corrector sobre kit/ entero y espera 0.
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
  'sk-api': 'sk' + '-proj-' + 'C'.repeat(24),
  'supabase-token': 'sb' + 'p_' + '0'.repeat(24),
  twilio: 'A' + 'C' + '0'.repeat(32) + ':' + '0'.repeat(20),
  aws: 'AK' + 'IA' + 'EXAMPLE0000ABCD00', // AKIA + 16 [0-9A-Z]
  'clave-privada': '-----BE' + 'GIN RSA PRIVATE KEY-----',
  slack: 'xo' + 'xb-' + 'EXAMPLE-0000',
  stripe: 's' + 'k' + '_live_' + 'EXAMPLE0000',
};
// La forma eyJ…eyJ… sale sola de un base64url de un JSON que empieza con "{". No hay literal en el archivo (se arma en corrida).
function jwt(payloadObj) {
  const h = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url').replace(/=+$/, '');
  const p = Buffer.from(JSON.stringify(payloadObj)).toString('base64url').replace(/=+$/, '');
  return `${h}.${p}.sig0000`;
}
const JWT_ANON = jwt({ role: 'anon', iss: 'supabase' });
const JWT_SVC = jwt({ role: 'service_role', iss: 'supabase' });

// ---------- helpers ----------
let GIT = null;
(function () {
  const r = spawnSync('git', ['--version'], { encoding: 'utf8' });
  if (r.status === 0) GIT = 'git';
})();
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'g5-'));
function repo(conRol) {
  const d = tmp();
  spawnSync('git', ['init', '-q'], { cwd: d });
  spawnSync('git', ['config', 'user.email', 'x@x'], { cwd: d });
  spawnSync('git', ['config', 'user.name', 'x'], { cwd: d });
  if (conRol) fs.writeFileSync(path.join(d, '.kit-rol'), conRol);
  return d;
}
// cuerpo = las líneas de campos; la ficha va envuelta en --- (cabecera del formato).
function conFicha(d, campos, rota) {
  fs.mkdirSync(path.join(d, '.claude'), { recursive: true });
  const texto = rota ? campos.join('\n') : `---\n${campos.join('\n')}\n---\n`;
  fs.writeFileSync(path.join(d, '.claude', 'kit.md'), texto);
  spawnSync('git', ['add', '-A'], { cwd: d });
  spawnSync('git', ['commit', '-q', '-m', 'ficha'], { cwd: d });
}
function tool(name, inp, modo, cwd) {
  return { hook_event_name: 'PreToolUse', tool_name: name, tool_input: inp, permission_mode: modo || 'default', cwd: cwd || path.join(os.tmpdir(), 'no-repo-g5-xyz') };
}
const bash = (command, modo, cwd) => tool('Bash', { command }, modo, cwd);
const ps = (command, modo, cwd) => tool('PowerShell', { command }, modo, cwd);
function d(entrada) {
  return S.decidir(entrada, { anotar: () => null });
}
const dec = (entrada) => d(entrada).decision || d(entrada).evento;

// ================================================================ patrones de clave
test('cada patrón de clave frena (Bash) y da su id', () => {
  for (const [id, clave] of Object.entries(FALSAS)) {
    const r = d(bash(`echo ${clave} > /dev/null`));
    assert.equal(r.decision, 'deny', `${id} no frenó`);
    assert.equal(r.id, `secretos:${id}`, `${id} dio id ${r.id}`);
    assert.match(r.motivo, /cargar-secreto/, 'el mensaje trae cargar-secreto');
  }
});

test('jwt: service_role frena, anon no (también en PRUEBA.md)', () => {
  assert.equal(d(bash(`echo ${JWT_SVC}`)).decision, 'deny');
  assert.equal(d(bash(`echo ${JWT_ANON}`)).decision, 'nada');
  // En un Write a PRUEBA.md: anon pasa, service_role frena.
  assert.equal(d(tool('Write', { file_path: 'docs/referencia/PRUEBA.md', content: `ANON=${JWT_ANON}` })).decision, 'nada');
  assert.equal(d(tool('Write', { file_path: 'docs/referencia/PRUEBA.md', content: `SR=${JWT_SVC}` })).decision, 'deny');
});

test('clave en Write, Edit, MultiEdit, NotebookEdit frena', () => {
  const k = FALSAS['github-pat'];
  assert.equal(d(tool('Write', { file_path: 'a.txt', content: k })).decision, 'deny');
  assert.equal(d(tool('Edit', { file_path: 'a.txt', new_string: k })).decision, 'deny');
  assert.equal(d(tool('MultiEdit', { file_path: 'a.txt', edits: [{ new_string: 'ok' }, { new_string: k }] })).decision, 'deny');
  assert.equal(d(tool('NotebookEdit', { notebook_path: 'a.ipynb', new_source: k })).decision, 'deny');
});

// ================================================================ archivo-deny
test('archivo-deny: casos sí/no', () => {
  const si = ['cat .env', 'cat .env.local', 'type .env', 'grep X .env', 'cp .env /tmp/x', 'cat server.pem', 'cat id_rsa.key', 'cat secrets/db.txt', 'gci .env | gc', 'cat ~/.ssh/id_rsa', 'cat /proc/self/environ', 'cat .e*'];
  for (const c of si) assert.equal(d(bash(c)).decision, 'deny', `debería frenar: ${c}`);
  assert.equal(d(ps('cat .Env')).decision, 'deny', 'sin mayúsculas en Windows');
  const no = ['ls .env', 'dir .env', 'test -f .env', 'stat .env', 'rm .env', 'git rm --cached .env', 'git status', 'echo .env >> .gitignore', 'node --env-file=.env app.js', 'cat README.md'];
  for (const c of no) assert.equal(d(bash(c)).decision, 'nada', `debería pasar: ${c}`);
});

test('archivo-deny: variable asignada en la misma llamada (F=.env; cat $F)', () => {
  assert.equal(d(bash('F=.env; cat "$F"')).decision, 'deny');
});

test('archivo-deny: settings.json del proyecto (raíz por git)', () => {
  if (!GIT) return;
  const r = repo();
  assert.equal(d(bash('cat .claude/settings.json', 'default', r)).decision, 'deny');
  assert.equal(d(bash('cat .claude/settings.local.json', 'default', r)).decision, 'deny');
});

// ================================================================ imprime-todas (los seis)
test('imprime-todas: los seis frenan; set -e y env X=1 cmd no', () => {
  for (const c of ['printenv', 'env', 'set', 'export -p', 'declare -p']) assert.equal(d(bash(c)).decision, 'deny', c);
  assert.equal(d(ps('Get-ChildItem Env:')).decision, 'deny');
  assert.equal(d(bash('set -e')).decision, 'nada');
  assert.equal(d(bash('env X=1 node a.js')).decision, 'nada');
});

// ================================================================ imprime-variable
test('imprime-variable: echo $X frena; curl $X pasa; curl -v $X frena; node -e frena', () => {
  assert.equal(d(bash('echo $GH_TOKEN')).decision, 'deny');
  assert.equal(d(bash('printf "%s" "$DB_URL"')).decision, 'deny');
  assert.equal(d(bash('cat <<< $API_KEY')).decision, 'deny');
  assert.equal(d(ps('$env:DB_URL')).decision, 'deny');
  assert.equal(d(ps('"$env:DB_URL"')).decision, 'deny');
  assert.equal(d(ps('[Environment]::GetEnvironmentVariable("DB_URL")')).decision, 'deny');
  assert.equal(d(ps('gci env:*URL*')).decision, 'deny');
  assert.equal(d(bash('node -e "console.log(process.env.DB_URL)"')).decision, 'deny');
  assert.equal(d(bash('printenv GH_TOKEN')).decision, 'deny');
  // usar sin ver: pasa
  assert.equal(d(bash('curl -H "Authorization: token $GH_TOKEN" https://x')).decision, 'nada');
  // verboso: frena
  assert.equal(d(bash('curl -v -H "Authorization: token $GH_TOKEN" https://x')).decision, 'deny');
  // variable no sensible: pasa
  assert.equal(d(bash('echo $HOME')).decision, 'nada');
});

// ================================================================ credencial-guardada
test('credencial-guardada', () => {
  for (const c of ['gh auth token', 'gh auth status -t', 'gh auth status --show-token', 'git credential fill', 'git credential-manager get']) {
    assert.equal(d(bash(c)).decision, 'deny', c);
  }
});

// ================================================================ frenos del proyecto / PC (sesión de agente)
test('frenos-del-proyecto: obrero frena los caminos a los hooks; humano y actualizador no', () => {
  if (!GIT) return;
  const rObrero = repo('obrero');
  const rHumano = repo();
  const rAct = repo('actualizador');
  for (const c of ['rm .claude/hooks/x.cjs', 'rm .githooks/pre-commit', 'echo x > .kit-rol', 'mv .claude/hooks/a.cjs b.cjs']) {
    assert.equal(d(bash(c, 'default', rObrero)).decision, 'deny', `obrero debería frenar: ${c}`);
  }
  // escritura directa
  assert.equal(d(tool('Write', { file_path: '.claude/hooks/x.cjs', content: 'x' }, 'default', rObrero)).decision, 'deny');
  assert.equal(d(tool('Edit', { file_path: '.kit-rol', new_string: 'humano' }, 'default', rObrero)).decision, 'deny');
  // humano y actualizador: no (no es sesión de agente)
  assert.equal(d(tool('Write', { file_path: '.claude/hooks/x.cjs', content: 'x' }, 'default', rHumano)).decision, 'nada');
  assert.equal(d(tool('Write', { file_path: '.claude/hooks/x.cjs', content: 'x' }, 'default', rAct)).decision, 'nada');
  // leer un hook no frena (obrero)
  assert.equal(d(bash('cat .claude/hooks/x.cjs', 'default', rObrero)).decision, 'nada');
});

test('frenos-del-proyecto: index.lock libre, un .lock viejo frena con el mensaje del director', () => {
  if (!GIT) return;
  const r = repo('obrero');
  const comun = spawnSync('git', ['rev-parse', '--git-common-dir'], { cwd: r, encoding: 'utf8' }).stdout.trim();
  const abs = path.resolve(r, comun);
  assert.equal(d(tool('Write', { file_path: path.join(abs, 'index.lock'), content: 'x' }, 'default', r)).decision, 'nada');
  const viejo = d(tool('Write', { file_path: path.join(abs, 'refs.lock'), content: 'x' }, 'default', r));
  assert.equal(viejo.decision, 'deny');
  assert.match(viejo.motivo, /director/);
});

test('frenos-de-la-pc: el kit siempre; el settings de la PC ask con ventana, deny en agente/sin-ventana', () => {
  const kit = path.join(S.HOME, '.claude', 'hooks', 'kit', 'secretos.cjs');
  const set = path.join(S.HOME, '.claude', 'settings.json');
  // kit: siempre deny (humano, default)
  assert.equal(d(tool('Write', { file_path: kit, content: 'x' }, 'default')).decision, 'deny');
  // settings de la PC: humano con ventana → ask
  assert.equal(d(tool('Write', { file_path: set, content: 'x' }, 'default')).decision, 'ask');
  // bypass → deny
  assert.equal(d(tool('Write', { file_path: set, content: 'x' }, 'bypassPermissions')).decision, 'deny');
});

// ================================================================ cambios-sin-ventana
test('cambios-sin-ventana: en bypass frena salvo el script', () => {
  assert.equal(d(bash('cat .claude/cambios/x.md', 'bypassPermissions')).decision, 'deny');
  assert.equal(d(bash('node .claude/scripts/cambios.cjs aprobar', 'bypassPermissions')).decision, 'nada');
  // con ventana (default) no es cambios-sin-ventana
  assert.equal(d(bash('cat .claude/cambios/x.md', 'default')).decision, 'nada');
});

// ================================================================ UserPromptSubmit
test('UserPromptSubmit: clave frena con suppressOriginalPrompt y la salida NO trae la clave', () => {
  const k = FALSAS['github-pat'];
  const r = d({ hook_event_name: 'UserPromptSubmit', prompt: `usá ${k} para entrar` });
  assert.equal(r.decision, 'block');
  assert.equal(r.salida.decision, 'block');
  assert.equal(r.salida.hookSpecificOutput.suppressOriginalPrompt, true);
  assert.match(r.salida.reason, /rotala|historial/);
  assert.ok(!JSON.stringify(r.salida).includes(k), 'la salida no puede traer la clave');
  // un prompt limpio pasa
  assert.equal(d({ hook_event_name: 'UserPromptSubmit', prompt: 'hola, arreglá el login' }).evento, 'prompt');
  assert.equal(d({ hook_event_name: 'UserPromptSubmit', prompt: 'hola' }).decision, 'nada');
});

// ================================================================ la ficha (regla 4.7)
test('ficha: frenos.quitados apaga ese id; publicas exime imprime-variable', () => {
  if (!GIT) return;
  const r = repo();
  conFicha(r, ['kit: 2.4.3', 'nivel: estandar', 'vars:', '  proyecto: p', 'publicas: [SUPABASE_ANON_KEY]', 'frenos:', '  quitados:', '    - {id: "secretos:github-pat", por: "prueba", hasta: siempre}']);
  // quitado: github-pat ya no frena en ESTE repo
  assert.equal(d(bash(`echo ${FALSAS['github-pat']}`, 'default', r)).decision, 'nada');
  // pero otro patrón sí
  assert.equal(d(bash(`echo ${FALSAS.aws}`, 'default', r)).decision, 'deny');
  // publicas: imprimir SUPABASE_ANON_KEY (termina en _KEY → de fábrica) no frena
  assert.equal(d(bash('echo $SUPABASE_ANON_KEY', 'default', r)).decision, 'nada');
  // y una que no es publica sí
  assert.equal(d(bash('echo $DB_URL', 'default', r)).decision, 'deny');
});

test('ficha rota: igual frena y el motivo lo dice', () => {
  if (!GIT) return;
  const r = repo();
  conFicha(r, ['kit: no-es-version', 'nivel: estandar'], true); // sin --- de cabecera: rompe el parser
  const res = d(bash(`echo ${FALSAS['github-pat']}`, 'default', r));
  assert.equal(res.decision, 'deny');
  assert.match(res.motivo, /ficha rota/);
});

test('secretos: agrega un nombre no de fábrica a imprime-variable', () => {
  if (!GIT) return;
  const r = repo();
  conFicha(r, ['kit: 2.4.3', 'nivel: estandar', 'vars:', '  proyecto: p', 'secretos: [MIVALOR]']);
  assert.equal(d(bash('echo $MIVALOR', 'default', r)).decision, 'deny');
});

// ================================================================ P4.7 (los cuatro casos) + aislamiento
test('P4.7: sin repo ni ficha, un Write común y un ls pasan; error interno y entrada rota → deny roto', () => {
  assert.equal(d(tool('Write', { file_path: 'README.md', content: 'hola' })).decision, 'nada');
  assert.equal(d(bash('ls -la')).decision, 'nada');
  // entrada que no es objeto → tira; principal lo vuelve deny
  assert.throws(() => S.decidir(42, { anotar: () => null }));
});

test('ni el frenos.log ni la salida traen la clave de prueba', () => {
  if (!GIT) return;
  const r = repo();
  const k = FALSAS['github-pat'];
  const res = S.decidir(bash(`echo ${k}`, 'default', r)); // anotar REAL → escribe en r/.claude/frenos.log
  assert.equal(res.decision, 'deny');
  assert.ok(!JSON.stringify(res.salida).includes(k), 'la salida no trae la clave');
  const log = fs.readFileSync(path.join(r, '.claude', 'frenos.log'), 'utf8');
  assert.ok(!log.includes(k), 'el log no trae la clave');
  assert.match(log, /secretos:github-pat/);
});

// ================================================================ criterio 13: corre desde una copia sola, HOME falso
test('criterio 13: corre desde <tmp>/home/.claude/hooks/kit con HOME/USERPROFILE a otro lado; el log cae bajo <tmp>/home', () => {
  const base = tmp();
  const home = path.join(base, 'home');
  const kitDir = path.join(home, '.claude', 'hooks', 'kit');
  fs.mkdirSync(kitDir, { recursive: true });
  fs.mkdirSync(path.join(kitDir, 'lib'), { recursive: true });
  // copiar SOLO secretos.cjs y lib/ (nada más de pc/)
  fs.copyFileSync(path.join(AQUI, 'secretos.cjs'), path.join(kitDir, 'secretos.cjs'));
  for (const f of fs.readdirSync(path.join(AQUI, 'lib')).filter((x) => x.endsWith('.cjs') && !x.endsWith('.test.cjs'))) {
    fs.copyFileSync(path.join(AQUI, 'lib', f), path.join(kitDir, 'lib', f));
  }
  const otroHome = path.join(base, 'otro');
  fs.mkdirSync(otroHome, { recursive: true });
  const k = FALSAS['github-pat'];
  const entrada = JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: `echo ${k}` }, permission_mode: 'default', cwd: base });
  const env = { ...process.env, HOME: otroHome, USERPROFILE: otroHome };
  const r = spawnSync(process.execPath, [path.join(kitDir, 'secretos.cjs')], { input: entrada, env, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const out = JSON.parse(r.stdout);
  assert.equal(out.hookSpecificOutput.permissionDecision, 'deny');
  assert.ok(!r.stdout.includes(k), 'la salida no trae la clave');
  // el log cayó bajo <tmp>/home, NO bajo el HOME del proceso (otroHome)
  const logPC = path.join(home, '.claude', 'hooks', 'kit', 'frenos.log');
  assert.ok(fs.existsSync(logPC), 'el log de la PC tiene que caer bajo <tmp>/home');
  assert.ok(!fs.existsSync(path.join(otroHome, '.claude', 'hooks', 'kit', 'frenos.log')), 'nada bajo el HOME del proceso');
  const log = fs.readFileSync(logPC, 'utf8');
  assert.ok(!log.includes(k), 'el log no trae la clave');
});

// ================================================================ r1-4: sin claves literales en kit/
test('r1-4: grep de los patrones del corrector sobre kit/ entero → 0', () => {
  const patrones = S.bancoPatrones().map((p) => p.re);
  patrones.push(S.RE_JWT);
  const malos = [];
  (function recorrer(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name === '.git' || e.name === 'node_modules') continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) recorrer(p);
      else if (/\.(cjs|js|mjs|md|json|sh|ps1|txt|yml|yaml)$/.test(e.name)) {
        let txt;
        try {
          txt = fs.readFileSync(p, 'utf8');
        } catch (x) {
          continue;
        }
        for (const re of patrones) {
          const m = txt.match(re);
          // el jwt exige role:anon para no ser secreto; acá solo contamos "forma de clave" → cualquier match es malo salvo un jwt anon
          if (m) {
            if (re === S.RE_JWT && S.jwtEsAnon(m[0])) continue;
            malos.push(`${path.relative(KIT, p)} :: ${S.bancoPatrones().find((x) => x.re === re) ? '' : 'jwt'}${re.source.slice(0, 18)}`);
          }
        }
      }
    }
  })(KIT);
  assert.deepEqual(malos, [], `hay claves con forma real en kit/:\n${malos.join('\n')}`);
});
