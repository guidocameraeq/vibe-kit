'use strict';
// Pruebas de cargar-secreto.sh y cargar-secreto.ps1 (SPEC-0 6.6, criterio 9 del paquete 3).
// Corren los DOS scripts de verdad (child_process) con HOME/USERPROFILE FALSOS y un repo de git temporal
// como cwd; el valor entra por stdin. Nunca tocan el HOME real. Los valores son de mentira, nada con forma de clave.
// Si falta bash (Git Bash) o PowerShell, esas pruebas se saltean CON un mensaje (no fallan en silencio).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const AQUI = __dirname;
const VALOR = 'valor-de-prueba-123';
const REAL_ALMACEN = path.join(os.homedir(), '.config', 'kit-secretos');

// ---------- qué intérpretes hay ----------
function buscarBash() {
  const cand = [];
  if (process.env.KIT_BASH) cand.push(process.env.KIT_BASH);
  if (process.platform === 'win32') {
    for (const base of [process.env.ProgramFiles, process.env['ProgramFiles(x86)'], process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Programs')]) {
      if (base) { cand.push(path.join(base, 'Git', 'bin', 'bash.exe'), path.join(base, 'Git', 'usr', 'bin', 'bash.exe')); }
    }
  } else {
    cand.push('/bin/bash', '/usr/bin/bash');
  }
  for (const c of cand) { try { if (fs.existsSync(c)) return c; } catch { /* sigue */ } }
  return null;
}
function buscarPowerShell() {
  const r = spawnSync('powershell', ['-NoProfile', '-Command', 'exit 0'], { encoding: 'utf8' });
  return r.status === 0 ? 'powershell' : null;
}
const BASH = buscarBash();
const PWSH = buscarPowerShell();

const IMPLS = [
  {
    id: 'sh',
    ok: !!BASH,
    falta: 'no hay bash (Git Bash); se saltean las pruebas del .sh',
    cmd: (nombre, extra) => [BASH, [path.join(AQUI, 'cargar-secreto.sh'), nombre, ...extra]],
    alEnv: '--al-env',
  },
  {
    id: 'ps1',
    ok: !!PWSH,
    falta: 'no hay PowerShell; se saltean las pruebas del .ps1',
    cmd: (nombre, extra) => [PWSH, ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(AQUI, 'cargar-secreto.ps1'), nombre, ...extra]],
    alEnv: '-AlEnv',
  },
];

// ---------- el entorno de prueba ----------
function sandbox() {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-secreto-'));
  const home = path.join(raiz, 'home');
  fs.mkdirSync(home);
  return { raiz, home };
}
function repo(sb, nombreCarpeta, ficha) {
  const dir = path.join(sb.raiz, nombreCarpeta);
  fs.mkdirSync(dir, { recursive: true });
  const r = spawnSync('git', ['init', '-q'], { cwd: dir, encoding: 'utf8' });
  assert.equal(r.status, 0, 'git init: ' + r.stderr);
  if (ficha !== undefined) {
    fs.mkdirSync(path.join(dir, '.claude'));
    fs.writeFileSync(path.join(dir, '.claude', 'kit.md'), ficha, 'utf8');
  }
  return dir;
}
function correr(impl, sb, cwd, nombre, extra, input) {
  const [exe, args] = impl.cmd(nombre, extra);
  const env = { ...process.env, HOME: sb.home, USERPROFILE: sb.home, HOMEDRIVE: path.parse(sb.home).root.replace(/[\\/]$/, ''), HOMEPATH: sb.home.slice(path.parse(sb.home).root.length - 1) };
  delete env.KIT_PLAZO_ARRANQUE_MS;
  const r = spawnSync(exe, args, { cwd, env, input, encoding: 'utf8', timeout: 60000 });
  return { code: r.status, stdout: r.stdout || '', stderr: r.stderr || '' };
}
function almacen(sb, slug) { return path.join(sb.home, '.config', 'kit-secretos', slug + '.env'); }
function leer(f) { return fs.readFileSync(f, 'utf8'); }
function sinValor(r, valor = VALOR) {
  assert.ok(!r.stdout.includes(valor), 'el valor aparece en stdout');
  assert.ok(!r.stderr.includes(valor), 'el valor aparece en stderr');
}
function listar(dir) { return fs.readdirSync(dir).sort(); }
// lo del HOME falso sin el AppData que crea PowerShell por su cuenta
function propios(dir) { return listar(dir).filter((h) => h !== 'AppData'); }
// nada fuera del HOME falso y del repo temporal: la raíz del sandbox tiene solo lo que armó la prueba
function nadaAfuera(sb, esperadas) {
  assert.deepEqual(listar(sb.raiz), ['home', ...esperadas].sort());
  // PowerShell mismo (no el script) crea %USERPROFILE%\AppData con su caché de módulos: se tolera esa carpeta
  const hijos = listar(sb.home).filter((h) => h !== 'AppData');
  assert.ok(hijos.every((h) => h === '.config'), 'HOME falso con algo ajeno: ' + hijos);
  const ks = path.join(sb.home, '.config', 'kit-secretos');
  if (fs.existsSync(ks)) assert.ok(listar(ks).every((f) => f.endsWith('.env')), 'queda un temporal en el almacén: ' + listar(ks));
  assert.deepEqual(listar(path.join(sb.home, '.config')), fs.existsSync(ks) ? ['kit-secretos'] : []);
}
function limpiar(sb) { fs.rmSync(sb.raiz, { recursive: true, force: true }); }

// ¿el HOME real quedó como estaba? (solo se mira, jamás se escribe)
function huellaReal() {
  try { const s = fs.statSync(REAL_ALMACEN); return `${s.mtimeMs}:${listar(REAL_ALMACEN).join(',')}`; } catch { return 'no existe'; }
}
const HUELLA_ANTES = huellaReal();

for (const impl of IMPLS) {
  const nombreSuite = `cargar-secreto.${impl.id}`;
  if (!impl.ok) {
    test(nombreSuite, { skip: impl.falta }, () => {});
    console.log(`# AVISO: ${impl.falta}`);
    continue;
  }

  test(`${nombreSuite}: guarda en el almacén con el proyecto de la ficha`, () => {
    const sb = sandbox();
    try {
      const cwd = repo(sb, 'carpeta-que-no-cuenta', 'kit: 2.4.3\nnivel: estandar\nvars:                # con qué se instanció\n  comando-test: node --test\n  proyecto: "Mi App_2"   # el nombre\nfrenos:\n  quitados: []\n');
      const r = correr(impl, sb, cwd, 'API_TOKEN', [], VALOR + '\n');
      assert.equal(r.code, 0, r.stderr);
      const f = almacen(sb, 'mi-app-2');
      assert.equal(leer(f), `API_TOKEN=${VALOR}\n`);
      assert.match(r.stdout, /guardado API_TOKEN en /);
      assert.match(r.stdout, /mi-app-2\.env/);
      assert.match(r.stdout, /Claude no lo puede leer/);
      sinValor(r);
      nadaAfuera(sb, ['carpeta-que-no-cuenta']);
    } finally { limpiar(sb); }
  });

  test(`${nombreSuite}: sin ficha usa el nombre de la carpeta raíz del repo (aunque corra en una subcarpeta)`, () => {
    const sb = sandbox();
    try {
      const cwd = repo(sb, 'Mi Proyecto_X');
      const sub = path.join(cwd, 'src', 'dentro'); fs.mkdirSync(sub, { recursive: true });
      const r = correr(impl, sb, sub, 'DB_PASS', [], VALOR + '\n');
      assert.equal(r.code, 0, r.stderr);
      assert.equal(leer(almacen(sb, 'mi-proyecto-x')), `DB_PASS=${VALOR}\n`);
      sinValor(r);
      nadaAfuera(sb, ['Mi Proyecto_X']);
    } finally { limpiar(sb); }
  });

  test(`${nombreSuite}: sin repo ni ficha usa la carpeta del cwd`, () => {
    const sb = sandbox();
    try {
      const cwd = path.join(sb.raiz, 'Suelta Sin Git'); fs.mkdirSync(cwd);
      const r = correr(impl, sb, cwd, 'UNA_CLAVE', [], VALOR + '\n');
      assert.equal(r.code, 0, r.stderr);
      assert.equal(leer(almacen(sb, 'suelta-sin-git')), `UNA_CLAVE=${VALOR}\n`);
      sinValor(r);
      nadaAfuera(sb, ['Suelta Sin Git']);
    } finally { limpiar(sb); }
  });

  test(`${nombreSuite}: un "proyecto:" fuera de vars: o vacío no cuenta; cae a la carpeta`, () => {
    const sb = sandbox();
    try {
      const cwd = repo(sb, 'Carpeta-Real', 'kit: 2.4.3\notro:\n  proyecto: ajeno\nvars:\n  comando-test: x\n');
      const r = correr(impl, sb, cwd, 'CLAVE_UNO', [], VALOR + '\n');
      assert.equal(r.code, 0, r.stderr);
      assert.equal(leer(almacen(sb, 'carpeta-real')), `CLAVE_UNO=${VALOR}\n`);
      sinValor(r);
    } finally { limpiar(sb); }
  });

  test(`${nombreSuite}: el nombre con tildes o raros pasa a [a-z0-9-] (mismo resultado en sh y ps1)`, () => {
    const sb = sandbox();
    try {
      const cwd = repo(sb, 'x', 'vars:\n  proyecto: Ñandú-App\n');
      const r = correr(impl, sb, cwd, 'CLAVE_UNO', [], VALOR + '\n');
      assert.equal(r.code, 0, r.stderr);
      assert.equal(leer(almacen(sb, '--and---app')), `CLAVE_UNO=${VALOR}\n`);
      sinValor(r);
    } finally { limpiar(sb); }
  });

  test(`${nombreSuite}: reemplaza sin duplicar y conserva los otros renglones`, () => {
    const sb = sandbox();
    try {
      const cwd = repo(sb, 'app', 'vars:\n  proyecto: app\n');
      const f = almacen(sb, 'app');
      fs.mkdirSync(path.dirname(f), { recursive: true });
      fs.writeFileSync(f, '# comentario mío\nOTRA=uno=dos # y más\nTOKEN_X=viejo-1\n\nTOKEN_XY=no-me-toques\nTOKEN_X=viejo-repetido\nULTIMA=fin', 'utf8');
      const r = correr(impl, sb, cwd, 'TOKEN_X', [], VALOR + '\n');
      assert.equal(r.code, 0, r.stderr);
      assert.equal(leer(f), `# comentario mío\nOTRA=uno=dos # y más\nTOKEN_X=${VALOR}\n\nTOKEN_XY=no-me-toques\nULTIMA=fin\n`);
      assert.ok(!leer(f).includes('viejo'));
      sinValor(r);
      nadaAfuera(sb, ['app']);
      // y una segunda corrida con otro valor sigue sin duplicar
      const r2 = correr(impl, sb, cwd, 'TOKEN_X', [], 'otro-valor-456\n');
      assert.equal(r2.code, 0, r2.stderr);
      assert.equal(leer(f).split('\n').filter((l) => l.startsWith('TOKEN_X=')).length, 1);
      assert.ok(leer(f).includes('TOKEN_X=otro-valor-456\n'));
      sinValor(r2, 'otro-valor-456');
    } finally { limpiar(sb); }
  });

  test(`${nombreSuite}: agrega un nombre nuevo al final sin pisar los demás`, () => {
    const sb = sandbox();
    try {
      const cwd = repo(sb, 'app', 'vars:\n  proyecto: app\n');
      assert.equal(correr(impl, sb, cwd, 'PRIMERA', [], 'uno-111\n').code, 0);
      assert.equal(correr(impl, sb, cwd, 'SEGUNDA', [], 'dos-222\n').code, 0);
      assert.equal(leer(almacen(sb, 'app')), 'PRIMERA=uno-111\nSEGUNDA=dos-222\n');
    } finally { limpiar(sb); }
  });

  test(`${nombreSuite}: un valor con =, espacios y # se guarda tal cual`, () => {
    const sb = sandbox();
    try {
      const cwd = repo(sb, 'app', 'vars:\n  proyecto: app\n');
      const raro = 'a=b c # d  e=';
      const r = correr(impl, sb, cwd, 'CLAVE_RARA', [], raro + '\n');
      assert.equal(r.code, 0, r.stderr);
      assert.equal(leer(almacen(sb, 'app')), `CLAVE_RARA=${raro}\n`);
      sinValor(r, raro);
    } finally { limpiar(sb); }
  });

  test(`${nombreSuite}: acepta stdin sin salto de línea final y con CRLF`, () => {
    const sb = sandbox();
    try {
      const cwd = repo(sb, 'app', 'vars:\n  proyecto: app\n');
      assert.equal(correr(impl, sb, cwd, 'SIN_SALTO', [], VALOR).code, 0);
      assert.equal(correr(impl, sb, cwd, 'CON_CRLF', [], VALOR + '\r\n').code, 0);
      assert.equal(leer(almacen(sb, 'app')), `SIN_SALTO=${VALOR}\nCON_CRLF=${VALOR}\n`);
    } finally { limpiar(sb); }
  });

  test(`${nombreSuite}: ${impl.alEnv} escribe en el .env de la raíz, avisa, y no toca el almacén`, () => {
    const sb = sandbox();
    try {
      const cwd = repo(sb, 'app', 'vars:\n  proyecto: app\n');
      fs.writeFileSync(path.join(cwd, '.env'), 'EXISTE=1\nDUMMY_KEY=viejo\n', 'utf8');
      const sub = path.join(cwd, 'sub'); fs.mkdirSync(sub);
      const r = correr(impl, sb, sub, 'DUMMY_KEY', [impl.alEnv], VALOR + '\n');
      assert.equal(r.code, 0, r.stderr);
      assert.equal(leer(path.join(cwd, '.env')), `EXISTE=1\nDUMMY_KEY=${VALOR}\n`);
      assert.match(r.stdout + r.stderr, /dummy.*prueba.*solo lectura/);
      assert.match(r.stdout, /guardado DUMMY_KEY en /);
      assert.ok(!fs.existsSync(path.join(sb.home, '.config')), 'con la bandera no se crea el almacén');
      sinValor(r);
      assert.ok(!listar(cwd).some((f) => f.startsWith('.cargar-secreto.')));
    } finally { limpiar(sb); }
  });

  test(`${nombreSuite}: ${impl.alEnv} crea el .env si no existe`, () => {
    const sb = sandbox();
    try {
      const cwd = repo(sb, 'app');
      const r = correr(impl, sb, cwd, 'DUMMY_KEY', [impl.alEnv], VALOR + '\n');
      assert.equal(r.code, 0, r.stderr);
      assert.equal(leer(path.join(cwd, '.env')), `DUMMY_KEY=${VALOR}\n`);
    } finally { limpiar(sb); }
  });

  test(`${nombreSuite}: nombre inválido → 2, no escribe nada y no muestra el valor`, () => {
    const sb = sandbox();
    try {
      const cwd = repo(sb, 'app', 'vars:\n  proyecto: app\n');
      for (const malo of ['minuscula', 'Mixto', '1EMPIEZA', 'CON-GUION', 'CON ESPACIO', 'CON.PUNTO', 'CLAVE=X', '_ARRANCA']) {
        const r = correr(impl, sb, cwd, malo, [], VALOR + '\n');
        assert.equal(r.code, 2, `"${malo}" debía dar 2 y dio ${r.code}: ${r.stderr}`);
        assert.ok(r.stderr.length > 0, 'sin mensaje claro');
        sinValor(r);
      }
      assert.deepEqual(propios(sb.home), []);
      assert.deepEqual(listar(cwd).filter((f) => f === '.env'), []);
    } finally { limpiar(sb); }
  });

  test(`${nombreSuite}: sin nombre → 2`, () => {
    const sb = sandbox();
    try {
      const cwd = repo(sb, 'app');
      const r = correr(impl, sb, cwd, '', [], VALOR + '\n');
      assert.equal(r.code, 2);
      sinValor(r);
      assert.deepEqual(propios(sb.home), []);
    } finally { limpiar(sb); }
  });

  test(`${nombreSuite}: valor vacío → 2 y no escribe (tampoco con un renglón existente)`, () => {
    const sb = sandbox();
    try {
      const cwd = repo(sb, 'app', 'vars:\n  proyecto: app\n');
      for (const vacio of ['', '\n', '\r\n']) {
        const r = correr(impl, sb, cwd, 'CLAVE_UNO', [], vacio);
        assert.equal(r.code, 2, `vacío ${JSON.stringify(vacio)}: ${r.stderr}`);
        assert.ok(r.stderr.length > 0);
      }
      assert.deepEqual(propios(sb.home), [], 'no debió crear ni el almacén');
      // con archivo previo: queda intacto
      const f = almacen(sb, 'app');
      fs.mkdirSync(path.dirname(f), { recursive: true });
      fs.writeFileSync(f, 'CLAVE_UNO=intacto\n', 'utf8');
      assert.equal(correr(impl, sb, cwd, 'CLAVE_UNO', [], '\n').code, 2);
      assert.equal(leer(f), 'CLAVE_UNO=intacto\n');
    } finally { limpiar(sb); }
  });

  test(`${nombreSuite}: un valor con salto de línea (varios renglones) → 2, no escribe, no muestra nada`, () => {
    const sb = sandbox();
    try {
      const cwd = repo(sb, 'app', 'vars:\n  proyecto: app\n');
      const r = correr(impl, sb, cwd, 'CLAVE_UNO', [], `${VALOR}\nsegundo-renglon-999\n`);
      assert.equal(r.code, 2, r.stderr);
      sinValor(r); sinValor(r, 'segundo-renglon-999');
      assert.ok(!fs.existsSync(almacen(sb, 'app')));
    } finally { limpiar(sb); }
  });

  test(`${nombreSuite}: si el renombre no deja el renglón, falla con 1 y sin el valor`, () => {
    // el destino es una carpeta: ni el renombre ni la relectura pueden dar verde
    const sb = sandbox();
    try {
      const cwd = repo(sb, 'app', 'vars:\n  proyecto: app\n');
      fs.mkdirSync(almacen(sb, 'app'), { recursive: true });
      const r = correr(impl, sb, cwd, 'CLAVE_UNO', [], VALOR + '\n');
      assert.equal(r.code, 1, r.stdout + r.stderr);
      assert.ok(r.stderr.length > 0);
      assert.ok(!/guardado/.test(r.stdout), 'no puede decir "guardado"');
      sinValor(r);
      assert.deepEqual(listar(path.dirname(almacen(sb, 'app'))), ['app.env'], 'sin temporales sueltos');
    } finally { limpiar(sb); }
  });

  test(`${nombreSuite}: el valor no aparece en la salida en ningún caso (éxito, error, bandera)`, () => {
    const sb = sandbox();
    try {
      const cwd = repo(sb, 'app', 'vars:\n  proyecto: app\n');
      const largo = VALOR.length;
      const casos = [
        correr(impl, sb, cwd, 'OK_UNO', [], VALOR + '\n'),
        correr(impl, sb, cwd, 'OK_UNO', [], VALOR + '\n'),
        correr(impl, sb, cwd, 'mal-nombre', [], VALOR + '\n'),
        correr(impl, sb, cwd, 'OK_DOS', [], VALOR + '\nextra\n'),
        correr(impl, sb, cwd, 'OK_TRES', [impl.alEnv], VALOR + '\n'),
      ];
      for (const r of casos) {
        sinValor(r);
        assert.ok(!new RegExp(`\\b${largo}\\b`).test(r.stdout + r.stderr), 'se ve el largo del valor');
      }
    } finally { limpiar(sb); }
  });
}

test('el sh y el ps1 coinciden: mismo archivo y mismo contenido para la misma entrada', { skip: !(BASH && PWSH) && 'falta bash o PowerShell' }, () => {
  const resultados = [];
  for (const impl of IMPLS) {
    const sb = sandbox();
    try {
      const cwd = repo(sb, 'App Mixta', 'vars:\n  proyecto: Mi Éxito\n');
      correr(impl, sb, cwd, 'A_UNO', [], 'x=1 #2\n');
      correr(impl, sb, cwd, 'B_DOS', [], 'y\n');
      correr(impl, sb, cwd, 'A_UNO', [], 'z w\n');
      const dir = path.join(sb.home, '.config', 'kit-secretos');
      resultados.push(listar(dir).map((f) => [f, leer(path.join(dir, f))]));
    } finally { limpiar(sb); }
  }
  assert.deepEqual(resultados[0], resultados[1]);
});

test('el HOME real no se tocó', () => {
  assert.equal(huellaReal(), HUELLA_ANTES);
});

test('los scripts no tocan variables del sistema ni perfiles (grep estático)', () => {
  for (const f of ['cargar-secreto.sh', 'cargar-secreto.ps1']) {
    const t = leer(path.join(AQUI, f));
    const codigo = t.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
    assert.ok(!/\bsetx\b/i.test(codigo), f + ': setx');
    assert.ok(!/SetEnvironmentVariable/.test(codigo), f + ': SetEnvironmentVariable');
    assert.ok(!/\bset\s+-[a-wyzA-Z]*x/.test(codigo), f + ': set -x');
    assert.ok(!/\.bashrc|\.profile|\.zshrc|\$PROFILE/.test(codigo), f + ': perfiles');
    assert.ok(!/\bexport\s+\w+=.*\$valor/.test(codigo), f + ': exporta el valor');
  }
});

test('no hay claves literales con forma real en los scripts ni en la prueba', () => {
  const formas = [/ghp_[A-Za-z0-9]{20,}/, /sk-[A-Za-z0-9]{20,}/, /AKIA[0-9A-Z]{16}/, /xox[bp]-[A-Za-z0-9-]{10,}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/];
  for (const f of ['cargar-secreto.sh', 'cargar-secreto.ps1', 'cargar-secreto.test.cjs']) {
    const t = leer(path.join(AQUI, f));
    for (const re of formas) assert.ok(!re.test(t), `${f}: ${re}`);
  }
});
