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
  // D8r.4 (S): lo que frena es la parte del kit (sin lo de adentro de la zona propia): se rellena hasta que ELLA pese `kit`
  const rellenarKit = (nombre, kit) => (d) => {
    const f = path.join(d, '.claude', 'skills', nombre, 'SKILL.md');
    const t = leer(f);
    fs.writeFileSync(f, t + 'z'.repeat(kit - Q.pesoSkill(Buffer.from(t)).kit));
  };
  // el molde real: verde (el /inicio pesa más de 8.000)
  const r = correr(armar());
  verde(r, 'skills');
  assert.match(linea(r, 'skills'), /el \/inicio, 8600/);
  // sí: /inicio justo en 8.600 → ✅; no: su parte del kit en 8.601 → ❌; /cierre con la suya en 8.001 → ❌ (su tope sigue en 8.000)
  verde(correr(armar({ cambio: rellenar('inicio', 8600) })), 'skills');
  rojo(correr(armar({ cambio: rellenarKit('inicio', 8601) })), 'skills', /inicio\/SKILL\.md pesa \d+ B \(tope 8600\), 8601 sin su zona propia/);
  rojo(correr(armar({ cambio: rellenarKit('cierre', 8001) })), 'skills', /cierre\/SKILL\.md pesa \d+ B \(tope 8000\), 8001 sin su zona propia/);
});

test('8r3, 4 skills: el tope se mide sin el \\r de un checkout con autocrlf (como lo guarda git)', () => {
  // D8r.4 (S): kit = true → se rellena hasta que la parte del kit (sin lo de adentro de la zona propia) pese totalLf
  const crlf = (nombre, totalLf, kit = false) => (d) => {
    const f = path.join(d, '.claude', 'skills', nombre, 'SKILL.md');
    const t = leer(f).replace(/\r\n/g, '\n');
    const lleno = t + 'z'.repeat(totalLf - (kit ? Q.pesoSkill(Buffer.from(t)).kit : Buffer.byteLength(t)));
    fs.writeFileSync(f, lleno.replace(/\n/g, '\r\n'));
  };
  // sí: el /inicio en 8.600 B con LF, en el disco con CRLF (más de 8.600) → ✅
  verde(correr(armar({ cambio: crlf('inicio', 8600) })), 'skills');
  // no: 8.601 con LF sigue rojo aunque venga con CRLF, y dice el peso sin los \r
  rojo(correr(armar({ cambio: crlf('inicio', 8601, true) })), 'skills', /inicio\/SKILL\.md pesa \d+ B \(tope 8600\), 8601 sin su zona propia/);
  // un \r suelto (sin \n) sí cuenta
  const suelto = (d) => {
    const f = path.join(d, '.claude', 'skills', 'cierre', 'SKILL.md');
    const t = leer(f).replace(/\r\n/g, '\n');
    fs.writeFileSync(f, t + '\r'.repeat(8001 - Q.pesoSkill(Buffer.from(t)).kit));
  };
  rojo(correr(armar({ cambio: suelto })), 'skills', /cierre\/SKILL\.md pesa \d+ B \(tope 8000\), 8001 sin su zona propia/);
});

// D8r.4 (S), "que avise, no que frene" (Guido, 2026-11-04): en un clon de Hermes la flota daba ROTA por la zona propia del proyecto
// (cierre 8.975 B, director 13.154, inicio 9.171, tramo 9.179). Lo que pasa el tope por la zona propia es ⚠ en una línea ✅; lo que
// lo pasa por la parte del kit sigue ❌.
const MARCA = '<!-- kit:propio -->';
// Mete relleno ADENTRO de la primera zona propia hasta que la skill pese `total` B (con LF).
const enLaZona = (nombre, total) => (d) => {
  const f = path.join(d, '.claude', 'skills', nombre, 'SKILL.md');
  const t = leer(f).replace(/\r\n/g, '\n');
  const i = t.indexOf(`${MARCA}\n`) + MARCA.length + 1;
  assert.ok(i > MARCA.length, `${nombre} sin zona propia`);
  const falta = total - Buffer.byteLength(t) - 1;
  fs.writeFileSync(f, `${t.slice(0, i)}${'p'.repeat(falta)}\n${t.slice(i)}`);
  assert.equal(Buffer.byteLength(leer(f)), total);
};
// Relleno AFUERA de la zona (al final): es parte del kit.
const afuera = (nombre, extra) => (d) => fs.appendFileSync(path.join(d, '.claude', 'skills', nombre, 'SKILL.md'), 'k'.repeat(extra));

test('D8r.4 S, 4 skills: la zona propia que pasa el tope → ✅ con ⚠ y cuánto se pasa; la flota lo ve como aviso, no como ROTA', () => {
  const r = correr(armar({ cambio: enLaZona('cierre', 8975) }));
  nueveBienFormadas(r);
  verde(r, 'skills');
  assert.equal(r.ok, true, r.lineas.join('\n'));
  const l = linea(r, 'skills');
  assert.match(l, / · ✅ · ⚠ /);
  assert.match(l, /cierre\/SKILL\.md pesa 8975 B, 975 de más por su zona propia \(tope 8000\)/);
  assert.match(l, /mové a un anexo lo propio que no hace falta siempre \(nunca lo de producción\)/);
  // lo que usa la flota: ok (codigo 0) y el aviso, para su fila
  const av = Q.avisosDe(r.lineas);
  assert.equal(av.length, 1);
  assert.match(av[0], /^skills ⚠ .*975 de más por su zona propia/);
  // varias: cada una con lo suyo
  const v = correr(armar({ cambio: (d) => { enLaZona('cierre', 8975)(d); enLaZona('tramo', 9179)(d); } }));
  verde(v, 'skills');
  assert.match(linea(v, 'skills'), /cierre\/SKILL\.md pesa 8975 B, 975 de más.*tramo\/SKILL\.md pesa 9179 B, 1179 de más/);
});

test('D8r.4 S, 4 skills: el /inicio con su tope de 8.600 — 8.601 por la zona propia es ⚠ de 1; la parte del kit en 8.601 es ❌', () => {
  const r = correr(armar({ cambio: enLaZona('inicio', 8601) }));
  verde(r, 'skills');
  assert.match(linea(r, 'skills'), /inicio\/SKILL\.md pesa 8601 B, 1 de más por su zona propia \(tope 8600\)/);
  verde(correr(armar({ cambio: enLaZona('inicio', 8600) })), 'skills');
  assert.doesNotMatch(linea(correr(armar({ cambio: enLaZona('inicio', 8600) })), 'skills'), /⚠/);
});

test('D8r.4 S, 4 skills: la parte del kit pasa el tope → ❌ como hoy, aunque también haya zona propia; dentro del tope → sin ⚠', () => {
  // parte del kit: el molde de cierre (7.785 B, con su zona) + 300 afuera; la zona, con 2.000 más → la parte del kit sola no cabe
  const p = (d) => {
    const f = path.join(d, '.claude', 'skills', 'cierre', 'SKILL.md');
    const t = leer(f).replace(/\r\n/g, '\n');
    const sinZona = Q.pesoSkill(Buffer.from(t)).kit;
    afuera('cierre', 8001 - sinZona)(d);
    const u = leer(f);
    const i = u.indexOf(`${MARCA}\n`) + MARCA.length + 1;
    fs.writeFileSync(f, `${u.slice(0, i)}${'p'.repeat(1999)}\n${u.slice(i)}`);
  };
  const r = correr(armar({ cambio: p }));
  rojo(r, 'skills', /cierre\/SKILL\.md pesa \d+ B \(tope 8000\), 8001 sin su zona propia/);
  assert.equal(Q.avisosDe(r.lineas).length, 0);
  // el molde real, dentro de su tope: verde y sin ⚠
  const q = correr(armar());
  verde(q, 'skills');
  assert.doesNotMatch(linea(q, 'skills'), /⚠/);
  assert.deepEqual(Q.avisosDe(q.lineas), []);
});

test('D8r.4 S, 4 skills: una zona propia rota (marca sin cierre) se mide entera, como hoy → ❌', () => {
  const roto = (d) => {
    const f = path.join(d, '.claude', 'skills', 'cierre', 'SKILL.md');
    const t = leer(f).replace(/\r\n/g, '\n').replace('<!-- /kit:propio -->\n', '');
    fs.writeFileSync(f, `${t}${'p'.repeat(8975 - Buffer.byteLength(t))}`);
  };
  rojo(correr(armar({ cambio: roto })), 'skills', /cierre\/SKILL\.md pesa 8975 B \(tope 8000\)/);
});

test('D8r.4 S, pesoSkill: total sin el \\r de autocrlf; la parte del kit sin lo de adentro de la zona (las marcas cuentan)', () => {
  const t = 'a\n<!-- kit:propio -->\nxyz\nw\n<!-- /kit:propio -->\nb\n';
  assert.deepEqual(Q.pesoSkill(Buffer.from(t)), { total: t.length, kit: t.length - 6, propio: 6 });
  assert.deepEqual(Q.pesoSkill(Buffer.from(t.replace(/\n/g, '\r\n'))), { total: t.length, kit: t.length - 6, propio: 6 });
  const vacia = 'a\n<!-- kit:propio -->\n<!-- /kit:propio -->\n';
  assert.deepEqual(Q.pesoSkill(Buffer.from(vacia)), { total: vacia.length, kit: vacia.length, propio: 0 });
  const rota = 'a\n<!-- kit:propio -->\nxyz\n';
  const pr = Q.pesoSkill(Buffer.from(rota));
  assert.equal(pr.kit, rota.length);
  assert.ok(pr.problema);
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

test('8r3, 7 casos: los hooks del proyecto van a la copia como los guarda git, sin el \\r de un checkout con autocrlf', () => {
  // Como fabrica.test.cjs: una prueba del molde lee un archivo de datos de hooks/lib/ y busca su cabecera con \n.
  const m = nuevaCarpeta('molde-crlf');
  fs.cpSync(moldeNuevo(), m, { recursive: true });
  const L = (...r) => path.join(m, 'hooks', 'lib', ...r);
  escribir(L('tabla.cjs'), "module.exports = require('fs').readFileSync(require('path').join(__dirname, 'tabla', 'datos.md'), 'utf8');\n");
  escribir(L('tabla', 'datos.md'), '# cabecera de una línea\nresto\n');
  escribir(L('tabla.test.cjs'), "'use strict';\nconst test = require('node:test');\nconst assert = require('node:assert/strict');\nconst t = require('./tabla.cjs');\ntest('la cabecera trae su \\\\n', () => assert.ok(t.includes('# cabecera de una línea\\n')));\ntest('el \\\\r suelto queda', () => assert.ok(t.includes('a\\rb')));\n");
  const hl = (d, ...r) => path.join(d, '.claude', 'hooks', 'lib', ...r);
  const p = armar({
    antes: (d) => escribir(hl(d, 'tabla.cjs'), 'module.exports = "";\n'),
    cambio: (d) => {
      // el checkout de Windows: \r\n en cada renglón (y un \r suelto, que no es de git y se respeta)
      escribir(hl(d, 'tabla.cjs'), leer(L('tabla.cjs')).replace(/\n/g, '\r\n'));
      escribir(hl(d, 'tabla', 'datos.md'), '# cabecera de una línea\r\nresto a\rb\r\n');
    },
  });
  const r = correr(p, { moldeNuevo: m });
  nueveBienFormadas(r);
  verde(r, 'casos');
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

// ---------------------------------------------------------------- h12: hooks-lib que espera (SPEC-paquete-8c)

const INFORME_LIB = '# Te espera: la pieza `hooks-lib` (kit 2.4.3 → 3.0.0)\n\nbase: 2.4.3\n\n## Qué hacer\n';
test('h12, 7 casos: hooks-lib esperando (su informe) y un caso perdido → ❌ con la línea de resolver; sin esperar → el detalle de hoy', () => {
  const pierde = (d) => escribir(path.join(d, '.claude', 'hooks', 'lib', 'suma.cjs'), `${SUMA_VIEJA}// adaptada\n`);
  const p = armar({
    cambio: (d) => {
      pierde(d);
      escribir(path.join(d, '.claude', 'fusiones', 'hooks-lib.md'), INFORME_LIB);
    },
  });
  const r = correr(p);
  nueveBienFormadas(r);
  rojo(r, 'casos', /^7\. casos · ❌ · hooks-lib te espera desde 2\.4\.3: los hooks nuevos necesitan su lib nueva\. Resolvela primero \(`resolver \. hooks-lib …`\) y volvé a poner al día · el hook lib\/suma\.cjs pierde un caso: el caso b del molde nuevo$/);
  // sin hooks-lib esperando: el detalle de hoy, sin la línea de resolver
  const q = armar({ cambio: pierde });
  rojo(correr(q), 'casos', /^7\. casos · ❌ · el hook lib\/suma\.cjs pierde un caso: el caso b del molde nuevo$/);
});

test('h12, 7 casos: hooks-lib fuera de su versión (`desde:` en la ficha) también cuenta; esperando y ningún hook cambiado → como hoy', () => {
  const p = armar({
    cambio: (d) => {
      escribir(path.join(d, '.claude', 'hooks', 'lib', 'suma.cjs'), `${SUMA_VIEJA}// adaptada\n`);
      escribir(path.join(d, '.claude', 'kit.md'), fichaCon({ kit: '3.0.0' }).replace(/^frenos:$/m, 'piezas:\n  hooks-lib: {estado: adaptada, hash: 0123456789ab, desde: 2.4.1}\nfrenos:'));
    },
  });
  rojo(correr(p), 'casos', /^7\. casos · ❌ · hooks-lib te espera desde 2\.4\.1: .* · el hook lib\/suma\.cjs pierde un caso/);
  // con el informe pero sin ningún hook cambiado (la suma nueva ya en base): "ningún hook cambió", ✅
  const q = armar({
    antes: (d) => escribir(path.join(d, '.claude', 'hooks', 'lib', 'suma.cjs'), SUMA_NUEVA),
    cambio: (d) => escribir(path.join(d, '.claude', 'fusiones', 'hooks-lib.md'), INFORME_LIB),
  });
  const rq = correr(q);
  verde(rq, 'casos');
  assert.match(linea(rq, 'casos'), /^7\. casos · ✅ · ningún hook cambió en base\.\.HEAD$/);
  assert.equal(Q.hooksLibEspera(q.d).base, '2.4.3');
  assert.equal(Q.hooksLibEspera(armar().d), null);
});

// ---------------------------------------------------------------- p1 (b): el lock del proyecto atrasado (SPEC-paquete-8c)

// Las salidas reales del chequeo frío de la rc.5 (D8r.4: el analytics con npm, el bot con pnpm), y la de yarn del manual.
const SALIDA_NPM = [
  'npm error code EUSAGE',
  'npm error',
  'npm error `npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync. Please update your lock file with `npm install` before continuing.',
  'npm error',
  'npm error Missing: openai@4.104.0 from lock file',
  'npm error',
  'npm error Clean install a project',
  '',
].join('\n');
const SALIDA_PNPM = 'Scope: all 36 workspace projects\n ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date with extensions\\twilio-whatsapp\\package.json\n\nNote that in CI environments this setting is true by default.\n';
const SALIDA_YARN = '➤ YN0000: ┌ Resolution step\n➤ YN0028: │ The lockfile would have been modified by this install, which is explicitly forbidden.\n➤ YN0000: └ Completed\n';
const SALIDA_RED = 'npm error code ECONNREFUSED\nnpm error network request to https://registry.npmjs.org/openai failed\n';
// Un setup que escribe <salida> y sale con <codigo>; con `cuelga`, después de escribirla se queda colgado; con `marca`, deja ese
// archivo (ruta absoluta, fuera del repo) para saber que corrió.
const setupQue = (salida, { codigo = 1, cuelga = false, marca = null } = {}) =>
  `${marca ? `require('fs').writeFileSync(${JSON.stringify(marca)}, 'x');\n` : ''}process.stderr.write(${JSON.stringify(salida)});\n${cuelga ? 'setInterval(() => {}, 1000);\n' : `process.exit(${codigo});\n`}`;
const PRUEBA_MARCA = "require('fs').writeFileSync('test-corrio.txt', 'x');\n";
const S_PREFIX = 'node setup.cjs --prefix chat-syncer';
// El proyecto: el mismo comando-setup en la ficha de base y de HEAD (salvo `setupBase`), su setup.cjs en base y en HEAD.
function armarLock({ base, head, setup = S_PREFIX, setupBase = setup, cambio } = {}) {
  return armar({
    antes: (d) => {
      escribir(path.join(d, 'setup.cjs'), base);
      escribir(path.join(d, 'prueba.cjs'), PRUEBA_MARCA);
      escribir(path.join(d, '.claude', 'kit.md'), fichaCon({ setup: setupBase }));
    },
    cambio: (d) => {
      if (head !== base) escribir(path.join(d, 'setup.cjs'), head);
      escribir(path.join(d, '.claude', 'kit.md'), fichaCon({ kit: '3.0.0', setup }));
      if (cambio) cambio(d);
    },
  });
}

test('p1 (b) firmaLock: npm (EUSAGE con la frase), pnpm y yarn de las salidas reales; en la salida entera, no en el detalle recortado', () => {
  assert.deepEqual(Q.firmaLock(SALIDA_NPM), { firma: 'npm EUSAGE', lock: 'package-lock.json' });
  assert.deepEqual(Q.firmaLock(SALIDA_PNPM), { firma: 'ERR_PNPM_OUTDATED_LOCKFILE', lock: 'pnpm-lock.yaml' });
  assert.deepEqual(Q.firmaLock(SALIDA_YARN), { firma: 'yarn YN0028', lock: 'yarn.lock' });
  assert.deepEqual(Q.firmaLock('error The lockfile would have been modified by this install\n'), { firma: 'yarn YN0028', lock: 'yarn.lock' });
  assert.equal(Q.firmaLock('npm error code EUSAGE\nnpm error Usage: npm ci\n'), null, 'EUSAGE solo, sin la frase de in sync, no');
  assert.equal(Q.firmaLock(SALIDA_RED), null);
  assert.equal(Q.firmaLock('bash: copy: command not found\n'), null);
  // el detalle de 80 caracteres no trae la frase: por eso se busca en la salida entera
  const recortado = `${SALIDA_NPM.replace(/\s+/g, ' ').trim().slice(0, 79)}…`;
  assert.equal(Q.firmaLock(recortado), null, recortado);
  assert.equal(Q.carpetaDelSetup('npm --prefix chat-syncer ci'), 'chat-syncer');
  assert.equal(Q.carpetaDelSetup('npm ci --prefix=chat-syncer/'), 'chat-syncer');
  assert.equal(Q.carpetaDelSetup('cd web && pnpm install --frozen-lockfile'), 'web');
  assert.equal(Q.carpetaDelSetup('pnpm -C apps/bot install'), 'apps/bot');
  assert.equal(Q.carpetaDelSetup('pnpm install --frozen-lockfile'), '');
});

test('p1 (b): la firma de npm en HEAD y en base, sin tocar nada del instalador → ✅ ⚠ (el test no corre); la flota lee el lock', () => {
  const p = armarLock({ base: setupQue(SALIDA_NPM), head: setupQue(SALIDA_NPM) });
  const r = correr(p);
  nueveBienFormadas(r);
  assert.equal(linea(r, 'pruebas'), '8. pruebas · ✅ · ⚠ comando-setup ya fallaba antes de la actualización (lock atrasado: npm EUSAGE en chat-syncer/package-lock.json): es del proyecto, no del kit — regenerá el lock y commitealo; tus tests no se corrieron (NO VERIFICADO)', r.lineas.join('\n'));
  assert.equal(r.noVerificado, false);
  assert.ok(!fs.existsSync(path.join(p.d, 'test-corrio.txt')), 'sin dependencias, el test no se corre');
  assert.equal(Q.avisosDe(r.lineas).filter((a) => a.startsWith('pruebas ')).length, 1, 'la flota lo ve como aviso');
  assert.equal(Q.lockAtrasadoDe(r.lineas), 'chat-syncer/package-lock.json');
  // pnpm (el bot), sin carpeta: el lock de la raíz
  const q = armarLock({ base: setupQue(SALIDA_PNPM), head: setupQue(SALIDA_PNPM), setup: 'node setup.cjs' });
  const rq = correr(q);
  assert.match(linea(rq, 'pruebas'), /^8\. pruebas · ✅ · ⚠ comando-setup ya fallaba antes de la actualización \(lock atrasado: ERR_PNPM_OUTDATED_LOCKFILE en pnpm-lock\.yaml\): es del proyecto/);
  assert.equal(Q.lockAtrasadoDe(rq.lineas), 'pnpm-lock.yaml');
});

test('p1 (b): firma en HEAD y en base anda → ❌; firma en HEAD y en base otra falla (red) → ❌', () => {
  const p = armarLock({ base: setupQue('', { codigo: 0 }), head: setupQue(SALIDA_NPM) });
  const r = correr(p);
  nueveBienFormadas(r);
  rojo(r, 'pruebas', /NO VERIFICADO: comando-setup \(node setup\.cjs --prefix chat-syncer\) salió con 1: .*\(lock atrasado: npm EUSAGE en chat-syncer\/package-lock\.json; en base el comando-setup anduvo: lo rompió la actualización\)$/);
  const q = armarLock({ base: setupQue(SALIDA_RED), head: setupQue(SALIDA_NPM) });
  rojo(correr(q), 'pruebas', /NO VERIFICADO: comando-setup .* salió con 1: .*en base falló de otra forma: npm error code ECONNREFUSED/);
});

test('p1 (b): HEAD colgado → ❌ sin correr la base; base colgada → ❌ "en base no se sabe"', () => {
  const marca = path.join(nuevaCarpeta('marca'), 'base-corrio.txt');
  const p = armarLock({ base: setupQue(SALIDA_NPM, { marca }), head: setupQue(SALIDA_NPM, { cuelga: true }) });
  const r = correr(p, { plazoMs: 4000 });
  nueveBienFormadas(r);
  rojo(r, 'pruebas', /^8\. pruebas · ❌ · NO VERIFICADO: comando-setup colgado: no terminó en 4 s$/);
  assert.ok(!fs.existsSync(marca), 'con HEAD colgado la base no se corre');
  const q = armarLock({ base: setupQue(SALIDA_NPM, { cuelga: true }), head: setupQue(SALIDA_NPM) });
  rojo(correr(q, { plazoMs: 4000 }), 'pruebas', /\(lock atrasado: npm EUSAGE en chat-syncer\/package-lock\.json; en base no se sabe: comando-setup colgado: no terminó en 4 s\)$/);
});

test('p1 (b): falla sin firma en las dos (un `copy` en Bash) → ❌ como hoy', () => {
  const p = armarLock({ base: setupQue(''), head: setupQue(''), setup: 'copy setup.cjs otro.cjs' });
  const r = correr(p);
  nueveBienFormadas(r);
  rojo(r, 'pruebas', /^8\. pruebas · ❌ · NO VERIFICADO: comando-setup \(copy setup\.cjs otro\.cjs\) salió con \d+: /);
  assert.ok(!/lock atrasado/.test(linea(r, 'pruebas')), linea(r, 'pruebas'));
});

test('p1 (b): firma en las dos con un .npmrc en el diff → ❌; comando-setup distinto en la ficha de base → ❌', () => {
  const p = armarLock({ base: setupQue(SALIDA_NPM), head: setupQue(SALIDA_NPM), cambio: (d) => escribir(path.join(d, 'chat-syncer', '.npmrc'), 'legacy-peer-deps=true\n') });
  rojo(correr(p), 'pruebas', /\(lock atrasado: npm EUSAGE en chat-syncer\/package-lock\.json, pero la actualización toca chat-syncer\/\.npmrc: puede ser de la actualización\)$/);
  const q = armarLock({ base: setupQue(SALIDA_NPM), head: setupQue(SALIDA_NPM), setupBase: 'node setup.cjs' });
  rojo(correr(q), 'pruebas', /pero vars\.comando-setup cambió en la actualización: puede ser de la actualización\)$/);
});
