'use strict';
// Pruebas de chequeo.cjs (SPEC-paquete-6, P7.1 "chequear"; crit. 11). Corren con:
//   node --test kit/skills/arquitecto-skills/scripts/lib/chequeo.test.cjs
// chequear es SÍNCRONO: cada prueba usa su valor de vuelta directo (sin await).
// Cada caso arma un repo git chico en os.tmpdir() (nunca en vibe-kit ni en ../vibe-kit-pruebas/): el proyecto sale de los hooks,
// scripts, skills y settings reales de kit/molde/ (sin pruebas) más una ficha; <base> es ese commit y HEAD, "lo que aplicó el
// actualizador". El molde nuevo es una copia de kit/molde/ sin sus *.test.cjs (las del molde real tardan minutos), con un hook chico
// propio (lib/suma.cjs) que trae un caso nuevo y su prueba, y una regla nueva en el settings.
// La clave falsa para gitleaks se arma por partes: este archivo no contiene ninguna.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const Q = require('./chequeo.cjs');

const MOLDE = path.resolve(__dirname, '..', '..', '..', '..', 'molde');
const RAIZ_TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'chequeo-test-'));
test.after(() => fs.rmSync(RAIZ_TMP, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }));

let n = 0;
const nuevaCarpeta = (nombre) => {
  const d = path.join(RAIZ_TMP, `${nombre}-${++n}`);
  fs.mkdirSync(d, { recursive: true });
  return d;
};
const escribir = (p, t) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, t);
};
const leer = (p) => fs.readFileSync(p, 'utf8');
function git(cwd, ...args) {
  const r = spawnSync('git', ['-c', 'core.autocrlf=false', '-c', 'user.name=prueba', '-c', 'user.email=prueba@ejemplo.invalid', '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', ...args], { cwd, encoding: 'utf8' });
  assert.equal(r.status, 0, `git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}
function copiar(de, a, filtro) {
  for (const e of fs.readdirSync(de, { withFileTypes: true })) {
    const x = path.join(de, e.name);
    const y = path.join(a, e.name);
    if (e.isDirectory()) copiar(x, y, filtro);
    else if (!filtro || filtro(e.name)) {
      fs.mkdirSync(a, { recursive: true });
      fs.writeFileSync(y, fs.readFileSync(x).toString('latin1').replace(/\r\n/g, '\n'), 'latin1');
    }
  }
}
const sinPruebas = (nombre) => !nombre.endsWith('.test.cjs');

// El hook chico: la versión vieja trae un caso; la del molde nuevo, dos. La prueba del molde nuevo exige los dos.
const SUMA_VIEJA = "'use strict';\nfunction clasificar(x) {\n  if (x === 'a') return 'uno';\n  return 'nada';\n}\nmodule.exports = { clasificar };\n";
const SUMA_NUEVA = "'use strict';\nfunction clasificar(x) {\n  if (x === 'a') return 'uno';\n  if (x === 'b') return 'dos';\n  return 'nada';\n}\nmodule.exports = { clasificar };\n";
const SUMA_PRUEBA = "'use strict';\nconst test = require('node:test');\nconst assert = require('node:assert/strict');\nconst { clasificar } = require('./suma.cjs');\ntest('el caso a', () => assert.equal(clasificar('a'), 'uno'));\ntest('el caso b del molde nuevo', () => assert.equal(clasificar('b'), 'dos'));\n";
const REGLA_PROPIA = 'Bash(npm run propio:*)';
const REGLA_NUEVA = 'Read(./**/*.p12)';

// El molde nuevo: kit/molde/ sin pruebas + lib/suma.cjs (nueva) con su prueba + una deny nueva en el settings.
let moldeCache = null;
function moldeNuevo() {
  if (moldeCache) return moldeCache;
  const m = nuevaCarpeta('molde-nuevo');
  copiar(MOLDE, m, sinPruebas);
  escribir(path.join(m, 'hooks', 'lib', 'suma.cjs'), SUMA_NUEVA);
  escribir(path.join(m, 'hooks', 'lib', 'suma.test.cjs'), SUMA_PRUEBA);
  const s = JSON.parse(leer(path.join(m, 'settings.json')));
  s.permissions.deny.push(REGLA_NUEVA);
  escribir(path.join(m, 'settings.json'), `${JSON.stringify(s, null, 2)}\n`);
  moldeCache = m;
  return m;
}

function settingsDe(molde, extra) {
  const s = JSON.parse(leer(path.join(molde, 'settings.json')));
  s.permissions.allow.push(...extra);
  return `${JSON.stringify(s, null, 2)}\n`;
}

function fichaCon({ kit = '2.4.3', comando = 'node prueba.cjs', setup = null } = {}) {
  let f = leer(path.join(MOLDE, 'hooks', 'lib', 'fabrica', 'ficha.estandar.md')).replace(/\r\n/g, '\n');
  f = f.replace(/^kit: .*$/m, `kit: ${kit}`);
  if (comando !== null) f = f.replace(/^ {2}proyecto: proyecto$/m, `  proyecto: proyecto\n  comando-test: ${comando}`);
  if (setup !== null) f = f.replace(/^ {2}proyecto: proyecto$/m, `  proyecto: proyecto\n  comando-setup: ${setup}`);
  return f;
}

const PRUEBA_VERDE = "process.exit(0);\n";
const PRUEBA_ROJA = "console.log('falla un caso');\nprocess.exit(1);\n";

// Arma el proyecto: base (molde viejo = kit/molde/ con la suma vieja, settings con una regla propia, ficha 2.4.3) y HEAD = lo que
// "aplicó el actualizador" (suma nueva, settings mezclado, ficha 3.0.0). `antes(dir)` toca la base; `cambio(dir)` toca HEAD.
function armar({ antes, cambio } = {}) {
  const d = nuevaCarpeta('proyecto');
  copiar(path.join(MOLDE, 'hooks'), path.join(d, '.claude', 'hooks'), sinPruebas);
  copiar(path.join(MOLDE, 'scripts'), path.join(d, '.claude', 'scripts'), sinPruebas);
  copiar(path.join(MOLDE, 'skills'), path.join(d, '.claude', 'skills'), sinPruebas);
  escribir(path.join(d, '.claude', 'hooks', 'lib', 'suma.cjs'), SUMA_VIEJA);
  escribir(path.join(d, '.claude', 'settings.json'), settingsDe(MOLDE, [REGLA_PROPIA]));
  escribir(path.join(d, '.claude', 'kit.md'), fichaCon());
  escribir(path.join(d, 'prueba.cjs'), PRUEBA_VERDE);
  escribir(path.join(d, 'src', 'app.js'), "console.log('hola');\n");
  if (antes) antes(d);
  git(d, 'init', '-q', '-b', 'main');
  git(d, 'add', '-A');
  git(d, 'commit', '-q', '-m', 'base');
  const base = git(d, 'rev-parse', 'HEAD');
  const m = moldeNuevo();
  escribir(path.join(d, '.claude', 'hooks', 'lib', 'suma.cjs'), SUMA_NUEVA);
  escribir(path.join(d, '.claude', 'settings.json'), settingsDe(m, [REGLA_PROPIA]));
  escribir(path.join(d, '.claude', 'kit.md'), fichaCon({ kit: '3.0.0' }));
  if (cambio) cambio(d);
  git(d, 'add', '-A');
  git(d, 'commit', '-q', '--allow-empty', '-m', 'kit 2.4.3 → 3.0.0');
  return { d, base, m };
}

function correr(p, extra = {}) {
  return Q.chequear(p.d, { moldeNuevo: p.m, base: p.base, plazoMs: 60000, version: '3.0.0', ...extra });
}
const linea = (r, id) => r.lineas[Q.IDS.indexOf(id)];
function nueveBienFormadas(r) {
  assert.equal(r.lineas.length, 9, r.lineas.join('\n'));
  r.lineas.forEach((l, i) => assert.match(l, new RegExp(`^${i + 1}\\. ${Q.IDS[i]} · (✅|❌) · \\S`), l));
  assert.equal(r.ok, r.lineas.every((l) => l.includes(' · ✅ · ')));
}
const verde = (r, id) => assert.match(linea(r, id), / · ✅ · /, r.lineas.join('\n'));
const rojo = (r, id, re) => {
  assert.match(linea(r, id), / · ❌ · /, r.lineas.join('\n'));
  if (re) assert.match(linea(r, id), re, linea(r, id));
  assert.equal(r.ok, false);
};

// ---------------------------------------------------------------- el caso verde: las nueve en ✅

test('las nueve en ✅: lo aplicado del molde nuevo, con el settings molde+propio mezclado (crit. 20 del kit en barreras)', () => {
  const p = armar();
  const r = correr(p);
  nueveBienFormadas(r);
  for (const id of Q.IDS) verde(r, id);
  assert.equal(r.ok, true);
  assert.equal(r.noVerificado, false);
  assert.deepEqual(r.noVerificados, []);
  assert.match(linea(r, 'arranque'), /inyectado: [\d.]+ de 9\.700/);
  assert.match(linea(r, 'casos'), /1 hook cambiado/);
  // No deja nada en el clon: ni archivos sin trackear ni core.hooksPath.
  assert.equal(git(p.d, 'status', '--porcelain'), '');
  assert.equal(spawnSync('git', ['config', '--local', '--get', 'core.hooksPath'], { cwd: p.d }).status, 1);
});

test('sin la versión en las opciones: la ficha de HEAD mayor que la de base → ✅; igual → ❌', () => {
  const p = armar();
  verde(correr(p, { version: undefined }), 'ficha');
  const q = armar({ cambio: (d) => escribir(path.join(d, '.claude', 'kit.md'), fichaCon()) });
  rojo(correr(q, { version: undefined }), 'ficha', /igual o anterior/);
});

test('D8b-3 ficha (sin la versión en las opciones): rc.1 → rc.2 es mayor ✅; rc.1 → rc.1 ❌; rc.1 → el final ✅; el final → rc.2 ❌', () => {
  const caso = (de, a) => armar({
    antes: (d) => escribir(path.join(d, '.claude', 'kit.md'), fichaCon({ kit: de })),
    cambio: (d) => escribir(path.join(d, '.claude', 'kit.md'), fichaCon({ kit: a })),
  });
  verde(correr(caso('3.0.0-rc.1', '3.0.0-rc.2'), { version: undefined }), 'ficha');
  verde(correr(caso('3.0.0-rc.1', '3.0.0'), { version: undefined }), 'ficha');
  rojo(correr(caso('3.0.0-rc.1', '3.0.0-rc.1'), { version: undefined }), 'ficha', /igual o anterior/);
  rojo(correr(caso('3.0.0', '3.0.0-rc.2'), { version: undefined }), 'ficha', /igual o anterior/);
  // con la versión en las opciones: la ficha de HEAD tiene que decir exactamente esa, también con -rc
  verde(correr(caso('2.4.3', '3.0.0-rc.2'), { version: '3.0.0-rc.2' }), 'ficha');
});

// ---------------------------------------------------------------- un ❌ por línea

test('1 llaves: un {{X}} suelto en lo que trajo → ❌ con archivo:línea; {{LINEAS:N}} y _fuente/ no cuentan', () => {
  const p = armar({
    cambio: (d) => {
      fs.appendFileSync(path.join(d, '.claude', 'skills', 'estado', 'SKILL.md'), '\nUn hueco {{X}} que quedó.\n');
      escribir(path.join(d, 'docs', 'plantillas', '_fuente', 'a.md'), 'aprobada: {{SIN_TOCAR}}\n');
      escribir(path.join(d, 'docs', 'b.md'), 'tabla de {{LINEAS:12}} renglones\n');
      escribir(path.join(d, '.claude', 'scripts', 'portada.cjs'), "const t = '{{PROYECTO}} {{BANNER}}';\n");
    },
  });
  const r = correr(p);
  nueveBienFormadas(r);
  rojo(r, 'llaves', /\.claude\/skills\/estado\/SKILL\.md:\d+/);
  assert.doesNotMatch(linea(r, 'llaves'), /_fuente|docs\/b\.md|portada\.cjs/);
  verde(r, 'skills');
});

test('1 llaves: un .cjs con {{X}} (las plantillas de portada.cjs; el molde no lo instancia) → ✅', () => {
  const p = armar({ cambio: (d) => escribir(path.join(d, '.claude', 'scripts', 'portada.cjs'), "const t = '{{PROYECTO}}';\n") });
  verde(correr(p), 'llaves');
});

test('1 llaves: un informe .claude/fusiones/<pieza>.md con {{ (cita la versión nueva entera) → ✅ (si no, el tag queda ROTA para siempre)', () => {
  const p = armar({
    cambio: (d) => escribir(path.join(d, '.claude', 'fusiones', 'portada.md'), "# portada te espera\n\n```js\nconst t = '{{PROYECTO}}';\n```\n"),
  });
  verde(correr(p), 'llaves');
});

test('2 arranque: un hook de arranque que inyecta 9.800 → ❌; uno que no deja huella → ❌', () => {
  const p = armar({ cambio: (d) => escribir(path.join(d, '.claude', 'hooks', 'session-start.cjs'), "process.stdout.write('hola\\ninyectado: 9.800 de 9.700\\n');\n") });
  const r = correr(p);
  nueveBienFormadas(r);
  rojo(r, 'arranque', /9\.800 de 9\.700 — pasa el tope/);
  const q = armar({ cambio: (d) => escribir(path.join(d, '.claude', 'hooks', 'session-start.cjs'), "process.stdout.write('sin huella\\n');\n") });
  rojo(correr(q), 'arranque', /no dejó la huella/);
});

test('3 settings: una clave repetida → ❌', () => {
  const p = armar({
    cambio: (d) => {
      const t = leer(path.join(d, '.claude', 'settings.json')).replace('"permissions": {', '"permissions": {\n    "allow": [],');
      escribir(path.join(d, '.claude', 'settings.json'), t);
    },
  });
  const r = correr(p);
  nueveBienFormadas(r);
  rojo(r, 'settings', /repetid/);
});

test('3 settings: un hook que apunta a un archivo que no está, o que no compila → ❌ (r1-6)', () => {
  const conHook = (d, ruta) => {
    const s = JSON.parse(leer(path.join(d, '.claude', 'settings.json')));
    s.hooks.PreToolUse.push({ matcher: 'Edit', hooks: [{ type: 'command', command: 'node', args: [`\${CLAUDE_PROJECT_DIR}/${ruta}`], timeout: 20 }] });
    escribir(path.join(d, '.claude', 'settings.json'), `${JSON.stringify(s, null, 2)}\n`);
  };
  const p = armar({ cambio: (d) => conHook(d, '.claude/hooks/no-esta.cjs') });
  const r = correr(p);
  nueveBienFormadas(r);
  rojo(r, 'settings', /\.claude\/hooks\/no-esta\.cjs, que no está/);
  const q = armar({
    cambio: (d) => {
      escribir(path.join(d, '.claude', 'hooks', 'roto.cjs'), "'use strict';\nfunction ( {\n");
      conHook(d, '.claude/hooks/roto.cjs');
    },
  });
  rojo(correr(q), 'settings', /roto\.cjs no compila/);
  // Un command de texto con la ruta adentro también se mira.
  const w = armar({
    cambio: (d) => {
      const s = JSON.parse(leer(path.join(d, '.claude', 'settings.json')));
      s.hooks.PreToolUse.push({ matcher: 'Edit', hooks: [{ type: 'command', command: 'bash "$CLAUDE_PROJECT_DIR/.claude/hooks/falta.sh"' }] });
      escribir(path.join(d, '.claude', 'settings.json'), `${JSON.stringify(s, null, 2)}\n`);
    },
  });
  rojo(correr(w), 'settings', /falta\.sh, que no está/);
});

test('4 skills: una skill del molde sin description → ❌; una propia rota y grande no cuenta (r1-10)', () => {
  const p = armar({
    cambio: (d) => {
      const f = path.join(d, '.claude', 'skills', 'estado', 'SKILL.md');
      escribir(f, leer(f).replace(/^description:.*\n/m, ''));
    },
  });
  const r = correr(p);
  nueveBienFormadas(r);
  rojo(r, 'skills', /estado\/SKILL\.md sin description/);
  const q = armar({ cambio: (d) => escribir(path.join(d, '.claude', 'skills', 'mia', 'SKILL.md'), `sin cabecera\n${'x'.repeat(9000)}\n`) });
  const rq = correr(q);
  verde(rq, 'skills');
  assert.equal(rq.ok, true, rq.lineas.join('\n'));
  const w = armar({ cambio: (d) => fs.appendFileSync(path.join(d, '.claude', 'skills', 'cierre', 'SKILL.md'), `\n${'y'.repeat(9000)}\n`) });
  rojo(correr(w), 'skills', /cierre\/SKILL\.md pesa \d+ B \(tope 8000\)/);
});

test('RF-fix 1, 4 skills: el tope por skill es el de skills.test (inicio 8.600, las demás 8.000), contra el molde REAL', () => {
  // Las skills de kit/molde/ tal cual (no un molde falso) caben: un /inicio de más de 8.000 B no deja ROTA a la flota.
  const reales = fs.readdirSync(path.join(MOLDE, 'skills'), { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(MOLDE, 'skills', e.name, 'SKILL.md')))
    .map((e) => e.name);
  assert.ok(reales.includes('inicio'));
  for (const n of reales) {
    const b = Buffer.byteLength(leer(path.join(MOLDE, 'skills', n, 'SKILL.md')).replace(/\r\n/g, '\n'));
    assert.ok(b <= Q.topeSkill(n), `${n}: ${b} B > ${Q.topeSkill(n)}`);
  }
  assert.equal(Q.topeSkill('inicio'), 8600);
  assert.equal(Q.topeSkill('cierre'), 8000);
  const rellenar = (nombre, total) => (d) => {
    const f = path.join(d, '.claude', 'skills', nombre, 'SKILL.md');
    const t = leer(f);
    fs.writeFileSync(f, t + 'z'.repeat(total - Buffer.byteLength(t)));
  };
  // el molde real: verde (el /inicio pesa más de 8.000)
  const r = correr(armar());
  verde(r, 'skills');
  assert.match(linea(r, 'skills'), /el \/inicio, 8600/);
  // sí: /inicio justo en 8.600 → ✅; no: 8.601 → ❌; /cierre en 8.001 → ❌ (su tope sigue en 8.000)
  verde(correr(armar({ cambio: rellenar('inicio', 8600) })), 'skills');
  rojo(correr(armar({ cambio: rellenar('inicio', 8601) })), 'skills', /inicio\/SKILL\.md pesa 8601 B \(tope 8600\)/);
  rojo(correr(armar({ cambio: rellenar('cierre', 8001) })), 'skills', /cierre\/SKILL\.md pesa 8001 B \(tope 8000\)/);
});

test('8r3, 4 skills: el tope se mide sin el \\r de un checkout con autocrlf (como lo guarda git)', () => {
  const crlf = (nombre, totalLf) => (d) => {
    const f = path.join(d, '.claude', 'skills', nombre, 'SKILL.md');
    const t = leer(f).replace(/\r\n/g, '\n');
    const lleno = t + 'z'.repeat(totalLf - Buffer.byteLength(t));
    fs.writeFileSync(f, lleno.replace(/\n/g, '\r\n'));
  };
  // sí: el /inicio en 8.600 B con LF, en el disco con CRLF (más de 8.600) → ✅
  verde(correr(armar({ cambio: crlf('inicio', 8600) })), 'skills');
  // no: 8.601 con LF sigue rojo aunque venga con CRLF, y dice el peso sin los \r
  rojo(correr(armar({ cambio: crlf('inicio', 8601) })), 'skills', /inicio\/SKILL\.md pesa 8601 B \(tope 8600\)/);
  // un \r suelto (sin \n) sí cuenta
  const suelto = (d) => {
    const f = path.join(d, '.claude', 'skills', 'cierre', 'SKILL.md');
    const t = leer(f).replace(/\r\n/g, '\n');
    fs.writeFileSync(f, t + '\r'.repeat(8001 - Buffer.byteLength(t)));
  };
  rojo(correr(armar({ cambio: suelto })), 'skills', /cierre\/SKILL\.md pesa 8001 B \(tope 8000\)/);
});

test('5 ficha: la ficha con la versión vieja → ❌; una ficha que no se lee → ❌', () => {
  const p = armar({ cambio: (d) => escribir(path.join(d, '.claude', 'kit.md'), fichaCon({ kit: '2.4.3' })) });
  const r = correr(p);
  nueveBienFormadas(r);
  rojo(r, 'ficha', /dice kit 2\.4\.3 y la versión nueva es 3\.0\.0/);
  const q = armar({ cambio: (d) => escribir(path.join(d, '.claude', 'kit.md'), "kit: 3.0.0\nnivel: 'raro'\n") });
  rojo(correr(q), 'ficha', /no se lee/);
});

test('6 barreras: un hook tocado sin aprobado y sin molde → ❌', () => {
  const p = armar({ cambio: (d) => fs.appendFileSync(path.join(d, '.claude', 'hooks', 'sensible.cjs'), '// un cambio que no es del molde\n') });
  const r = correr(p);
  nueveBienFormadas(r);
  rojo(r, 'barreras', /candado:barreras .*sensible\.cjs/);
});

test('7 casos: un hook fusionado que pierde un caso → ❌ con el caso; uno cambiado sin pruebas en el molde nuevo → ❌ (r1-6)', () => {
  // La "fusión" dejó la suma vieja con un comentario: le falta el caso b del molde nuevo.
  const p = armar({ cambio: (d) => escribir(path.join(d, '.claude', 'hooks', 'lib', 'suma.cjs'), `${SUMA_VIEJA}// adaptada\n`) });
  const r = correr(p);
  nueveBienFormadas(r);
  rojo(r, 'casos', /el hook lib\/suma\.cjs pierde un caso: el caso b del molde nuevo/);
  // sello.cjs cambia (igual al molde: barreras no frena) pero el molde nuevo no trae pruebas que lo juzguen.
  const q = armar({
    antes: (d) => fs.appendFileSync(path.join(d, '.claude', 'hooks', 'lib', 'sello.cjs'), '// la versión vieja\n'),
    cambio: (d) => escribir(path.join(d, '.claude', 'hooks', 'lib', 'sello.cjs'), leer(path.join(p.m, 'hooks', 'lib', 'sello.cjs'))),
  });
  const rq = correr(q);
  rojo(rq, 'casos', /el hook lib\/sello\.cjs cambió y el molde nuevo no trae pruebas para él/);
});

test('7 casos (RF-9): dos dueños que comparten un archivo de pruebas → un solo node --test, el compartido corre una vez; el rojo nombra a su dueño', () => {
  const cuenta = path.join(nuevaCarpeta('cuenta'), 'corridas.txt');
  const m = nuevaCarpeta('molde-rf9');
  fs.cpSync(moldeNuevo(), m, { recursive: true });
  const L = (...r) => path.join(m, 'hooks', 'lib', ...r);
  escribir(L('uno.cjs'), "module.exports = () => 1;\n");
  escribir(L('dos.cjs'), "module.exports = () => 2;\n");
  const cab = "'use strict';\nconst test = require('node:test');\nconst assert = require('node:assert/strict');\n";
  escribir(L('comun.test.cjs'), `${cab}require('fs').appendFileSync(${JSON.stringify(cuenta)}, 'x\\n');\nconst uno = require('./uno.cjs');\nrequire('./dos.cjs');\ntest('uno da 1', () => assert.equal(uno(), 1));\n`);
  escribir(L('dos.test.cjs'), `${cab}const dos = require('./dos.cjs');\ntest('dos da 2', () => assert.equal(dos(), 2));\n`);
  const hl = (d, ...r) => path.join(d, '.claude', 'hooks', 'lib', ...r);
  const p = armar({
    antes: (d) => {
      escribir(hl(d, 'uno.cjs'), 'module.exports = () => 0;\n');
      escribir(hl(d, 'dos.cjs'), 'module.exports = () => 0;\n');
    },
    cambio: (d) => {
      escribir(hl(d, 'uno.cjs'), 'module.exports = () => 1; // adaptada\n');
      escribir(hl(d, 'dos.cjs'), 'module.exports = () => 3; // adaptada mal\n');
    },
  });
  const r = correr(p, { moldeNuevo: m });
  nueveBienFormadas(r);
  rojo(r, 'casos', /el hook lib\/dos\.cjs pierde un caso: dos da 2/);
  assert.doesNotMatch(linea(r, 'casos'), /lib\/uno\.cjs/, 'uno está verde: no se lo nombra');
  assert.equal(leer(cuenta), 'x\n', 'el archivo compartido corrió UNA vez');
  // y verde cuando los dos están bien
  fs.rmSync(cuenta);
  const q = armar({
    antes: (d) => escribir(hl(d, 'uno.cjs'), 'module.exports = () => 0;\n'),
    cambio: (d) => {
      escribir(hl(d, 'uno.cjs'), 'module.exports = () => 1;\n');
      escribir(hl(d, 'dos.cjs'), 'module.exports = () => 2;\n');
    },
  });
  const rq = correr(q, { moldeNuevo: m });
  verde(rq, 'casos');
  assert.equal(leer(cuenta), 'x\n');
});

test('7 casos (D6.2, F0): con moldeCrudo la copia sale del molde SIN instanciar ({{…}}); sin él, del moldeNuevo (instanciado: [completar: …])', () => {
  // crudo = como kit/molde/; m = lo que hace molde.cjs con los docs ({{marcador}} → [completar: marcador]). Ambos con el hook marca y su prueba.
  const MARCADOR = 'una acción ejecutable, nunca "seguir avanzando"';
  const crudo = nuevaCarpeta('molde-crudo');
  fs.cpSync(moldeNuevo(), crudo, { recursive: true });
  const L = (...r) => path.join(crudo, 'hooks', 'lib', ...r);
  escribir(path.join(crudo, 'docs', 'SESSION_HANDOFF.md'), ['## Próximo paso', `{{${MARCADOR}}}`, ''].join('\n'));
  escribir(L('marca.cjs'), 'module.exports = () => 1;\n');
  escribir(
    L('marca.test.cjs'),
    [
      "'use strict';",
      "const test = require('node:test');",
      "const assert = require('node:assert/strict');",
      "const fs = require('fs');",
      "const path = require('path');",
      "const marca = require('./marca.cjs');",
      "test('el handoff trae el marcador como en kit/molde/', () => {",
      '  assert.equal(marca(), 1);',
      "  const t = fs.readFileSync(path.join(__dirname, '..', '..', 'docs', 'SESSION_HANDOFF.md'), 'utf8');",
      `  assert.ok(t.includes(${JSON.stringify(`{{${MARCADOR}}}`)}));`,
      '});',
      '',
    ].join('\n'),
  );
  const m = nuevaCarpeta('molde-instanciado');
  fs.cpSync(crudo, m, { recursive: true });
  escribir(path.join(m, 'docs', 'SESSION_HANDOFF.md'), ['## Próximo paso', `[completar: ${MARCADOR}]`, ''].join('\n'));
  const hl = (d, ...r) => path.join(d, '.claude', 'hooks', 'lib', ...r);
  const armo = () =>
    armar({
      antes: (d) => escribir(hl(d, 'marca.cjs'), 'module.exports = () => 0;\n'),
      cambio: (d) => escribir(hl(d, 'marca.cjs'), 'module.exports = () => 1;\n'),
    });
  const r = correr(armo(), { moldeNuevo: m, moldeCrudo: crudo });
  nueveBienFormadas(r);
  verde(r, 'casos');
  // no: sin moldeCrudo se copia el instanciado y la prueba ve [completar: …] (el comportamiento de antes, el que daba rojo)
  rojo(correr(armo(), { moldeNuevo: m }), 'casos', /el hook lib\/marca\.cjs pierde un caso: el handoff trae el marcador/);
  // un moldeCrudo que no existe se ignora (se usa moldeNuevo)
  verde(correr(armar(), { moldeCrudo: path.join(RAIZ_TMP, 'no-existe') }), 'casos');
});

test('rojosPorArchivo: el rojo va al archivo de su location; un archivo que no carga cuenta; lo de afuera no', () => {
  const h = path.join(RAIZ_TMP, 'hooks');
  const loc = (rel) => `  location: '${path.join(h, ...rel.split('/')).replace(/\\/g, '\\\\')}:3:1'`;
  const tap = ['TAP version 13', 'not ok 1 - el caso b', '  ---', loc('lib/a.test.cjs'), '  ...', 'ok 2 - bien', '  ---', loc('lib/b.test.cjs'), '  ...', 'not ok 3 - hooks/lib/c.test.cjs', '  ---', '  ...', 'not ok 4 - ajeno', '  ---', "  location: '/otro/lado/x.test.cjs:1:1'", '  ...'].join('\n');
  assert.deepEqual([...Q.rojosPorArchivo(tap, h)], [['lib/a.test.cjs', 'el caso b'], ['lib/c.test.cjs', 'hooks/lib/c.test.cjs no corre']]);
  assert.equal(Q.rojosPorArchivo('ok 1 - todo\n', h).size, 0);
});

test('8 pruebas: comando-test rojo (verde en base) → ❌ "lo rompió"; rojo ya en base → ❌ "ya estaba rojo antes" (r1-10)', () => {
  const p = armar({ cambio: (d) => escribir(path.join(d, 'prueba.cjs'), PRUEBA_ROJA) });
  const r = correr(p);
  nueveBienFormadas(r);
  rojo(r, 'pruebas', /node prueba\.cjs en rojo \(salida 1\) — en base estaba verde/);
  assert.equal(r.noVerificado, false);
  const q = armar({ antes: (d) => escribir(path.join(d, 'prueba.cjs'), PRUEBA_ROJA) });
  const rq = correr(q);
  rojo(rq, 'pruebas', /en rojo \(salida 1\) — ya estaba rojo antes/);
});

test('8 pruebas: comando-test colgado (con un nieto que hereda la salida) → NO VERIFICADO, ok=false, nueve líneas, sin esperar al nieto', () => {
  const CUELGA = "const { spawn } = require('child_process');\nspawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'inherit' });\nsetInterval(() => {}, 1000);\n";
  const p = armar({ cambio: (d) => escribir(path.join(d, 'prueba.cjs'), CUELGA) });
  const t0 = Date.now();
  const r = correr(p, { plazoMs: 4000 });
  const ms = Date.now() - t0;
  nueveBienFormadas(r);
  rojo(r, 'pruebas', /NO VERIFICADO: comando-test colgado: no terminó en 4 s/);
  assert.equal(r.noVerificado, true);
  assert.deepEqual(r.noVerificados, ['pruebas']);
  assert.ok(ms < 40000, `tardó ${ms} ms`);
});

test('8 pruebas: comando-test con tubería → NO VERIFICADO; nivel liviano sin comando-test → ✅', () => {
  const p = armar({ cambio: (d) => escribir(path.join(d, '.claude', 'kit.md'), fichaCon({ kit: '3.0.0', comando: 'node prueba.cjs | cat' })) });
  rojo(correr(p), 'pruebas', /NO VERIFICADO: comando-test con tuberías/);
  const q = armar({
    cambio: (d) => escribir(path.join(d, '.claude', 'kit.md'), fichaCon({ kit: '3.0.0', comando: null }).replace(/^nivel: estandar$/m, 'nivel: liviano')),
  });
  const rq = correr(q);
  verde(rq, 'pruebas');
});

// RF-5: en un clon fresco no hay dependencias; vars.comando-setup las pone antes de comando-test, en HEAD y en el clon de base.
const PRUEBA_CON_DEP = "process.exit(require('fs').existsSync('dep.txt') ? 0 : 1);\n";
const SETUP = "require('fs').writeFileSync('dep.txt', 'x');\n";
test('8 pruebas (RF-5): con comando-setup corre antes, en HEAD y en base ("en base estaba verde", no "ya estaba rojo"); sin él, rojo', () => {
  const conDep = (d) => {
    escribir(path.join(d, 'prueba.cjs'), PRUEBA_CON_DEP);
    escribir(path.join(d, 'setup.cjs'), SETUP);
  };
  const ficha = (setup) => (d) => escribir(path.join(d, '.claude', 'kit.md'), fichaCon({ kit: '3.0.0', setup }));
  // sí: verde en HEAD gracias al setup
  const p = armar({ antes: conDep, cambio: ficha('node setup.cjs') });
  verde(correr(p), 'pruebas');
  // sí: HEAD rojo de verdad; en base (clon fresco, sin dep.txt) el setup corre y estaba verde
  const q = armar({
    antes: conDep,
    cambio: (d) => {
      ficha('node setup.cjs')(d);
      escribir(path.join(d, 'prueba.cjs'), PRUEBA_ROJA);
    },
  });
  rojo(correr(q), 'pruebas', /en rojo \(salida 1\) — en base estaba verde: lo rompió/);
  // no: sin comando-setup, el mismo proyecto da rojo (no hay dep.txt)
  const s = armar({ antes: conDep, cambio: ficha(null) });
  rojo(correr(s), 'pruebas', /node prueba\.cjs en rojo \(salida 1\) — ya estaba rojo antes/);
});

test('8 pruebas (RF-5): comando-setup que falla → NO VERIFICADO con su motivo (no rojo); con tubería → NO VERIFICADO', () => {
  const p = armar({
    cambio: (d) => {
      escribir(path.join(d, 'falla.cjs'), "console.log('sin red');\nprocess.exit(3);\n");
      escribir(path.join(d, '.claude', 'kit.md'), fichaCon({ kit: '3.0.0', setup: 'node falla.cjs' }));
    },
  });
  const r = correr(p);
  nueveBienFormadas(r);
  rojo(r, 'pruebas', /NO VERIFICADO: comando-setup \(node falla\.cjs\) salió con 3: sin red/);
  assert.deepEqual(r.noVerificados, ['pruebas']);
  const q = armar({ cambio: (d) => escribir(path.join(d, '.claude', 'kit.md'), fichaCon({ kit: '3.0.0', setup: 'npm ci ; npm run x' })) });
  rojo(correr(q), 'pruebas', /NO VERIFICADO: comando-setup con tuberías/);
});

// rt-1 (D8r.2): el setup de Python es `<py> -m venv .venv && <venv-py> -m pip install …`: `&&` corre; un `&` solo, no.
test('8 pruebas (rt-1): comando-setup `a && b` se corre (los dos); `a & b` → NO VERIFICADO', () => {
  const conDep = (d) => {
    escribir(path.join(d, 'prueba.cjs'), "process.exit(require('fs').existsSync('dep2.txt') ? 0 : 1);\n");
    escribir(path.join(d, 'setup.cjs'), SETUP);
    escribir(path.join(d, 'setup2.cjs'), "require('fs').writeFileSync('dep2.txt', require('fs').readFileSync('dep.txt'));\n");
  };
  const p = armar({ antes: conDep, cambio: (d) => escribir(path.join(d, '.claude', 'kit.md'), fichaCon({ kit: '3.0.0', setup: 'node setup.cjs && node setup2.cjs' })) });
  verde(correr(p), 'pruebas');
  assert.ok(fs.existsSync(path.join(p.d, 'dep2.txt')), 'corrió el segundo, después del primero');
  const q = armar({ cambio: (d) => escribir(path.join(d, '.claude', 'kit.md'), fichaCon({ kit: '3.0.0', setup: 'node setup.cjs & node setup2.cjs' })) });
  rojo(correr(q), 'pruebas', /NO VERIFICADO: comando-setup con tuberías/);
});

// rt-2 (D8r.2): el guardia de proceso.cjs, con la shell inyectada; no se corre nada (saldría verde sin haber corrido).
test('8 pruebas (rt-2): `cmd //c` en cmd.exe y `cmd /c` en Git Bash → NO VERIFICADO, sin correrlos', () => {
  const p = armar({ cambio: (d) => escribir(path.join(d, '.claude', 'kit.md'), fichaCon({ kit: '3.0.0', comando: 'cmd //c exit 0' })) });
  rojo(correr(p, { shell: 'C:/Windows/System32/cmd.exe' }), 'pruebas', /NO VERIFICADO: comando-test no se corre: `cmd \/\/c` es de Git Bash/);
  const q = armar({ cambio: (d) => escribir(path.join(d, '.claude', 'kit.md'), fichaCon({ kit: '3.0.0', comando: 'node prueba.cjs', setup: 'cmd /c npm ci' })) });
  rojo(correr(q, { shell: 'C:/Program Files/Git/bin/bash.exe' }), 'pruebas', /NO VERIFICADO: comando-setup no se corre: en Git Bash es `cmd \/\/c`/);
});

test('9 gitleaks: una clave falsa armada en el diff → ❌ con archivo:línea y la regla, nunca el valor', () => {
  const clave = ['gh', 'p_', 'Xk9mQ2vL7pR4', 'tZ8wN3bY6cH1', 'jF5dS0aE2uIo'].join('');
  const p = armar({ cambio: (d) => escribir(path.join(d, 'src', 'config.js'), `// config\nconst token = "${clave}";\n`) });
  const r = correr(p);
  nueveBienFormadas(r);
  if (linea(r, 'gitleaks').includes('NO VERIFICADO: no hay gitleaks')) {
    rojo(r, 'gitleaks'); // esta PC no tiene gitleaks: igual es ❌
    return;
  }
  rojo(r, 'gitleaks', /src\/config\.js:2 \(github-pat\)/);
  assert.ok(!r.lineas.join('\n').includes(clave.slice(4)), 'el valor no se imprime');
});

test('9 gitleaks: sin gitleaks → NO VERIFICADO (❌)', () => {
  const p = armar();
  const r = correr(p, { gitleaks: null });
  nueveBienFormadas(r);
  rojo(r, 'gitleaks', /NO VERIFICADO: no hay gitleaks/);
  assert.equal(r.noVerificado, true);
  assert.deepEqual(r.noVerificados, ['gitleaks']);
});

// ---------------------------------------------------------------- errores propios: nueve líneas igual

test('una base que no es un commit, o una carpeta que no es un repo → nueve líneas NO VERIFICADO, ok=false', () => {
  const p = armar();
  for (const r of [
    Q.chequear(p.d, { moldeNuevo: p.m, base: 'no-existe', plazoMs: 60000 }),
    Q.chequear(nuevaCarpeta('vacia'), { moldeNuevo: p.m, base: p.base, plazoMs: 60000 }),
    Q.chequear(p.d, { moldeNuevo: p.m, plazoMs: 60000 }),
  ]) {
    nueveBienFormadas(r);
    assert.equal(r.ok, false);
    assert.equal(r.noVerificado, true);
    assert.deepEqual(r.noVerificados, Q.IDS);
    for (const l of r.lineas) assert.match(l, / · ❌ · NO VERIFICADO: /);
  }
});

test('sin molde nuevo: skills, barreras y casos NO VERIFICADO; las otras seis corren', () => {
  const p = armar();
  const r = correr(p, { moldeNuevo: path.join(RAIZ_TMP, 'no-esta') });
  nueveBienFormadas(r);
  assert.deepEqual(r.noVerificados, ['skills', 'barreras', 'casos']);
  for (const id of r.noVerificados) rojo(r, id, /NO VERIFICADO: no me pasaron el molde nuevo/);
  assert.equal(r.noVerificado, true);
  for (const id of ['llaves', 'arranque', 'settings', 'ficha', 'pruebas', 'gitleaks']) verde(r, id);
});

// ---------------------------------------------------------------- las piezas sueltas

test('agregadas: lee un diff -U0 con rutas con espacios, comillas y bloques de solo borrado', () => {
  const diff = [
    'diff --git a/x b/x',
    '--- a/x',
    '+++ b/x',
    '@@ -1,0 +2,2 @@',
    '+uno',
    '++++ dos',
    '@@ -5 +6,0 @@',
    '-borrada',
    'diff --git "a/con espacio" "b/con espacio"',
    '--- /dev/null',
    '+++ b/con espacio\t',
    '@@ -0,0 +1 @@',
    '+tres',
    'diff --git a/q b/q',
    '+++ "b/\\303\\261and\\303\\272"',
    '@@ -0,0 +1 @@',
    '+cuatro',
  ].join('\n');
  assert.deepEqual(Q.agregadas(diff), [
    { archivo: 'x', linea: 2, texto: 'uno' },
    { archivo: 'x', linea: 3, texto: '+++ dos' },
    { archivo: 'con espacio', linea: 1, texto: 'tres' },
    { archivo: 'ñandú', linea: 1, texto: 'cuatro' },
  ]);
});

test('rutasDeHook: node + args, un command de texto, y el programa suelto no cuenta', () => {
  assert.deepEqual(Q.rutasDeHook({ command: 'node', args: ['${CLAUDE_PROJECT_DIR}/.claude/hooks/a.cjs', '--x'] }), ['${CLAUDE_PROJECT_DIR}/.claude/hooks/a.cjs']);
  assert.deepEqual(Q.rutasDeHook({ command: 'bash "$CLAUDE_PROJECT_DIR/.claude/hooks/b.sh" --rapido' }), ['$CLAUDE_PROJECT_DIR/.claude/hooks/b.sh']);
  assert.deepEqual(Q.rutasDeHook({ command: 'node .claude/hooks/c.cjs' }), ['.claude/hooks/c.cjs']);
  assert.deepEqual(Q.rutasDeHook({ command: 'echo hola' }), []);
  // RF-4: las partes pegadas son UNA palabra ("$CLAUDE_PROJECT_DIR"/… no se parte en dos), y después se sacan las comillas
  assert.deepEqual(Q.rutasDeHook({ command: 'bash "$CLAUDE_PROJECT_DIR"/.claude/hooks/x.sh --rapido' }), ['$CLAUDE_PROJECT_DIR/.claude/hooks/x.sh']);
  assert.deepEqual(Q.rutasDeHook({ command: `bash "\${CLAUDE_PROJECT_DIR}"'/.claude/hooks/y z.sh'` }), ['${CLAUDE_PROJECT_DIR}/.claude/hooks/y z.sh']);
  assert.deepEqual(Q.rutasDeHook({ command: 'node', args: ['${CLAUDE_PROJECT_DIR}/.claude/hooks/z.cjs'] }), ['${CLAUDE_PROJECT_DIR}/.claude/hooks/z.cjs']);
  assert.deepEqual(Q.rutasDeHook({ command: 'echo "hola mundo" otra' }), []);
});

test('cabeceraSkill: name y description, también en bloque >; sin cabecera → null', () => {
  assert.deepEqual(Q.cabeceraSkill('---\nname: x\ndescription: hace y\n---\ncuerpo'), { name: 'x', description: 'hace y' });
  assert.deepEqual(Q.cabeceraSkill('---\r\nname: "x"\r\ndescription: >\r\n  larga\r\n  en dos\r\n---\r\n'), { name: 'x', description: 'larga en dos' });
  assert.equal(Q.cabeceraSkill('sin cabecera'), null);
});

test('pruebasDe: la suya, las que lo requieren y las de quien lo requiere; datos de lib/<d>/ van a lib/<d>.cjs', () => {
  const h = nuevaCarpeta('hooks');
  escribir(path.join(h, 'lib', 'b.cjs'), 'module.exports = 1;\n');
  escribir(path.join(h, 'lib', 'a.cjs'), "require('./b.cjs');\n");
  escribir(path.join(h, 'lib', 'a.test.cjs'), "require('./a.cjs');\n");
  escribir(path.join(h, 'hook.cjs'), "require('./lib/a.cjs');\n");
  escribir(path.join(h, 'otra.test.cjs'), "require('./lib/b.cjs');\n");
  assert.deepEqual(Q.pruebasDe('lib/b.cjs', h), ['lib/a.test.cjs', 'otra.test.cjs']);
  assert.deepEqual(Q.pruebasDe('hook.cjs', h), []);
  assert.deepEqual(Q.pruebasDe('lib/a.cjs', h), ['lib/a.test.cjs']);
});

test('casoRojo: el primer caso rojo del TAP, no el archivo', () => {
  const tap = 'TAP version 13\n# Subtest: hooks/x.test.cjs\n    not ok 2 - el caso b # TODO\nnot ok 1 - hooks/x.test.cjs\n';
  assert.equal(Q.casoRojo(tap), 'el caso b');
  assert.equal(Q.casoRojo('ok 1 - todo bien\n'), null);
});
