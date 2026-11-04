'use strict';
// fusion.test.cjs — la fusión de una pieza adaptada (SPEC-paquete-6 D6-19, D6-1; crit. 18). Corren con:
//   node --test kit/skills/arquitecto-skills/scripts/lib/fusion.test.cjs
// Todo en temporales: moldes chicos sintéticos, repos git sin la config de la PC y un claude FALSO (un script de node que edita
// .kit-fusion/ o falla según KIT_FAKE_CLAUDE). Nunca el claude real, ~/.claude ni ../vibe-kit-pruebas.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const A = require('../actualizar.cjs');
const FU = require('./fusion.cjs');
const F = require('../../pc/lib/ficha.cjs');
const Z = require('../../pc/lib/zona-propia.cjs');

const T = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-fusion-test-'));
test.after(() => fs.rmSync(T, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }));
fs.writeFileSync(path.join(T, 'gitconfig-vacio'), '');
Object.assign(process.env, {
  GIT_CONFIG_GLOBAL: path.join(T, 'gitconfig-vacio'), GIT_CONFIG_NOSYSTEM: '1',
  GIT_AUTHOR_NAME: 'prueba', GIT_AUTHOR_EMAIL: 'p@kit.invalid', GIT_COMMITTER_NAME: 'prueba', GIT_COMMITTER_EMAIL: 'p@kit.invalid',
});

let n = 0;
const nuevaCarpeta = (nombre) => {
  const d = path.join(T, `${nombre}-${n++}`);
  fs.mkdirSync(d, { recursive: true });
  return d;
};
function git(cwd, ...args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', windowsHide: true });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout;
}
function escribirArbol(dir, mapa) {
  for (const [rel, t] of Object.entries(mapa)) {
    const p = path.join(dir, ...rel.split('/'));
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, t);
  }
}
const leer = (dir, rel) => {
  const p = path.join(dir, ...rel.split('/'));
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
};

// ---------------------------------------------------------------- los moldes chicos

const CIERRE_V = '# cierre\n\nuno\ndos\ntres\ncuatro\ncinco\nseis\n';
const INICIO_V = '# inicio\nlinea a\nlinea b\nlinea c\nlinea d\nlinea e\n<!-- kit:propio -->\n<!-- /kit:propio -->\nfin\n';
const HOOK_V = "'use strict';\n// arranque\nconst a = 1;\nconst b = 2;\nconst c = 3;\nconst d = 4;\nconst e = 5;\nconsole.log(a + b + c + d + e);\n";
const MOLDE_V = {
  'settings.json': '{\n  "permissions": {\n    "deny": []\n  }\n}\n',
  'skills/cierre/SKILL.md': CIERRE_V,
  'skills/inicio/SKILL.md': INICIO_V,
  'hooks/session-start.cjs': HOOK_V,
};
const MOLDE_N = {
  ...MOLDE_V,
  'skills/cierre/SKILL.md': CIERRE_V.replace('uno\n', 'uno v2\n'),
  'skills/inicio/SKILL.md': INICIO_V.replace('linea a\n', 'linea a v2\n'),
  'hooks/session-start.cjs': HOOK_V.replace('const a = 1;', 'const a = 10;'),
};
const RUTAS = { 'skills/cierre/SKILL.md': '.claude/skills/cierre/SKILL.md', 'skills/inicio/SKILL.md': '.claude/skills/inicio/SKILL.md', 'hooks/session-start.cjs': '.claude/hooks/session-start.cjs', 'settings.json': '.claude/settings.json' };

function armarKit(molde, version) {
  const d = nuevaCarpeta('kit');
  escribirArbol(path.join(d, 'kit', 'molde'), molde);
  fs.writeFileSync(path.join(d, 'kit', 'VERSION'), `${version}\n`);
  return d;
}
const KIT = armarKit(MOLDE_N, '3.0.0');
const VIEJO = armarKit(MOLDE_V, '2.9.0');

// Un proyecto nacido del molde viejo (commit "nace"); `piezas` = las entradas de la ficha; `cambio` = {rel: texto} commiteado
// después (con `mensaje` y `autor`), o escrito ANTES de "nace" con `enNace`.
function armarProyecto({ piezas = {}, cambio = {}, mensaje = 'cierre: el paso seis es nuestro', autor = 'Guido', enNace = false } = {}) {
  const d = nuevaCarpeta('proy');
  for (const [m, p] of Object.entries(RUTAS)) escribirArbol(d, { [p]: MOLDE_V[m] });
  const lineas = {
    settings: 'molde+propio',
    inicio: `{estado: molde+propio, hash: ${Z.hashPieza(INICIO_V)}}`,
    cierre: `{estado: molde, hash: ${Z.hashPieza(CIERRE_V)}}`,
    'hook-arranque': `{estado: molde, hash: ${F.hash(HOOK_V)}}`,
    ...piezas,
  };
  escribirArbol(d, {
    '.claude/kit.md': ['---', 'kit: 2.9.0', 'nivel: estandar', 'vars:', '  proyecto: demo', 'piezas:', ...Object.entries(lineas).map(([k, v]) => `  ${k}: ${v}`), '---', ''].join('\n'),
  });
  if (enNace) escribirArbol(d, cambio);
  git(d, 'init', '-q', '-b', 'main');
  git(d, 'config', 'core.autocrlf', 'false');
  git(d, 'add', '-A');
  git(d, 'commit', '-q', '-m', 'nace');
  if (!enNace && Object.keys(cambio).length) {
    escribirArbol(d, cambio);
    git(d, 'add', '-A');
    git(d, '-c', `user.name=${autor}`, 'commit', '-q', '-m', mensaje, '--author', `${autor} <a@kit.invalid>`);
  }
  fs.writeFileSync(path.join(d, '.kit-rol'), 'actualizador\n');
  fs.appendFileSync(path.join(d, '.git', 'info', 'exclude'), '.kit-rol\n');
  return d;
}

// El claude falso: anota argv, el pedido y el settings.local.json; según KIT_FAKE_CLAUDE resuelve (la línea del molde con la
// del proyecto como comentario), deja los marcadores, rompe el .cjs, toca otra ruta, borra las marcas de la zona o falla.
const FALSO = path.join(T, 'claude-falso.cjs');
fs.writeFileSync(FALSO, `'use strict';
const fs = require('fs');
const path = require('path');
const modo = process.env.KIT_FAKE_CLAUDE || 'resuelve';
let pedido = '';
process.stdin.on('data', (d) => (pedido += d)).on('end', () => {
  let local = null;
  try { local = fs.readFileSync('.claude/settings.local.json', 'utf8'); } catch {}
  if (process.env.KIT_FAKE_LOG) fs.writeFileSync(process.env.KIT_FAKE_LOG, JSON.stringify({ argv: process.argv.slice(2), pedido, local }));
  if (modo === 'falla') process.exit(3);
  const archivos = [];
  (function rec(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) rec(p); else archivos.push(p);
    }
  })('.kit-fusion');
  for (const f of archivos) {
    let t = fs.readFileSync(f, 'utf8');
    if (modo !== 'marcadores') {
      t = t.replace(/^<<<<<<< proyecto\\n([\\s\\S]*?)^\\|\\|\\|\\|\\|\\|\\| molde viejo\\n[\\s\\S]*?^=======\\n([\\s\\S]*?)^>>>>>>> molde nuevo\\n/gm,
        (m, a, b) => b.replace(/\\n$/, '') + ' // ' + a.replace(/\\n$/, '') + '\\n');
    }
    if (modo === 'rompe') t += 'const = ;\\n';
    if (modo === 'zona') t = t.split('\\n').filter((l) => !/kit:propio/.test(l)).join('\\n');
    fs.writeFileSync(f, t);
  }
  if (modo === 'otra') fs.writeFileSync('.claude/hooks/intruso.cjs', '// metido por el agente\\n');
});
`);

function aplicar(d, o = {}) {
  const log = path.join(nuevaCarpeta('log'), 'claude.json');
  process.env.KIT_FAKE_LOG = log;
  process.env.KIT_FAKE_CLAUDE = o.modo || 'resuelve';
  const r = A.aplicar(d, { kit: KIT, moldeViejo: VIEJO, fecha: '2026-11-02', claude: FALSO, ...o });
  r.claude = fs.existsSync(log) ? JSON.parse(fs.readFileSync(log, 'utf8')) : null;
  return r;
}
const lineaDe = (r, id) => r.lineas.find((l) => l.startsWith(`${id} · `));
const piezaDe = (d, id) => F.leer(leer(d, '.claude/kit.md')).datos.piezas[id];
const limpioSalvo = (d) => git(d, 'status', '--porcelain', '--untracked-files=all').split('\n').filter(Boolean).map((l) => l.slice(3));

const POR = 'el paso seis lo hacemos distinto';
const SEIS = CIERRE_V.replace('seis\n', 'seis (a nuestra manera)\n'); // no pisa lo que cambia el molde (uno)
const UNO = CIERRE_V.replace('uno\n', 'uno (nuestro)\n'); // pisa lo que cambia el molde: conflicto

// ---------------------------------------------------------------- el gate del porqué

test('con por: en la ficha y cambios que no se pisan → fusionada sola, la adaptación encima del molde nuevo; la segunda corrida, sin cambios', () => {
  const d = armarProyecto({ piezas: { cierre: `{estado: adaptada, por: "${POR}"}` }, cambio: { '.claude/skills/cierre/SKILL.md': SEIS }, mensaje: 'kit 2.9.0 a mano' });
  const r = aplicar(d);
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  assert.equal(lineaDe(r, 'cierre'), `cierre · adaptada · fusionada (sola, ${POR})`);
  assert.equal(leer(d, '.claude/skills/cierre/SKILL.md'), CIERRE_V.replace('uno\n', 'uno v2\n').replace('seis\n', 'seis (a nuestra manera)\n'));
  assert.equal(r.claude, null, 'limpio: no hace falta claude');
  assert.deepEqual(piezaDe(d, 'cierre'), { estado: 'adaptada', hash: Z.hashPieza(MOLDE_N['skills/cierre/SKILL.md']), por: POR });
  assert.equal(leer(d, '.claude/fusiones/cierre.md'), null);
  git(d, 'add', '-A');
  git(d, 'commit', '-q', '-m', 'kit 2.9.0 → 3.0.0', '--author', 'kit-actualizador <k@kit.invalid>');
  const r2 = A.aplicar(d, { kit: KIT, fecha: '2026-11-02', claude: 'no' });
  assert.equal(r2.codigo, 0);
  for (const l of r2.lineas) assert.match(l, /sin cambios$/, l);
  assert.deepEqual(limpioSalvo(d), []);
});

test('D8b-4: sin por: y con commits propios (el git log ya no cuenta) → te espera, aunque la mezcla salga limpia', () => {
  for (const mensaje of ['cierre: el paso seis es nuestro', 'kitchen: el paso seis es nuestro']) {
    const d = armarProyecto({ piezas: { cierre: 'adaptada' }, cambio: { '.claude/skills/cierre/SKILL.md': SEIS }, mensaje });
    const r = aplicar(d);
    assert.equal(lineaDe(r, 'cierre'), 'cierre · adaptada · te espera: sin porqué (la pieza no tiene `por:` en la ficha)', mensaje);
    assert.equal(leer(d, '.claude/skills/cierre/SKILL.md'), SEIS, `${mensaje}: la pieza queda vieja`);
    const inf = leer(d, '.claude/fusiones/cierre.md');
    assert.match(inf, /\*\*Por qué la habías adaptado:\*\* ninguno \(la pieza no tiene `por:` en la ficha\)/);
    assert.doesNotMatch(inf, /## Dónde chocan/, 'limpia: no hay dónde chocan');
    assert.match(inf, /La fusión propuesta\n\n```md\n# cierre\n\nuno v2\n/, 'la mezcla limpia va como propuesta');
    assert.equal(r.claude, null);
  }
  assert.equal(FU.porqueDe({ estado: 'adaptada' }), null);
  assert.equal(FU.porqueDe('adaptada'), null);
  assert.deepEqual(FU.porqueDe({ estado: 'adaptada', por: `  ${POR} ` }), { de: 'ficha', texto: POR });
});

test('el guardia ve un desvío en esta corrida (estaba molde), sin por: → te espera como "adaptada (desvío detectado)", la pieza vieja', () => {
  const d = armarProyecto({ cambio: { '.claude/skills/cierre/SKILL.md': SEIS } });
  const r = aplicar(d);
  assert.match(lineaDe(r, 'cierre'), /^cierre · adaptada \(desvío detectado\) · te espera: sin porqué/);
  assert.equal(piezaDe(d, 'cierre').estado, 'adaptada (desvío detectado)');
  assert.equal(leer(d, '.claude/skills/cierre/SKILL.md'), SEIS);
});

// ---------------------------------------------------------------- el informe: la nota del kit, la nueva entera, las salidas (paquete 8b)

const CHANGELOG_KIT = [
  '# Changelog del kit', '', 'Una sección por versión.', '',
  '## 3.1.0', '', '- **Qué piezas cambiaron**: lo de después (no va: es mayor que la nueva).', '',
  '## 3.0.0', '', '- **Qué piezas cambiaron**: el cierre, el paso uno.', '- **Qué chequear después**: el cierre.', '',
  '## 3.0.0-rc.1', '', '- **Qué piezas cambiaron**: la beta.', '',
  '## 2.9.0', '', '- lo de la versión vieja (no va: no es mayor que la vieja).', '',
].join('\n');

test('el informe trae lo que dice el kit (las versiones > vieja y ≤ nueva, rc incluida), la nueva entera y las cuatro salidas', () => {
  const kit = armarKit(MOLDE_N, '3.0.0');
  fs.writeFileSync(path.join(kit, 'kit', 'CHANGELOG.md'), CHANGELOG_KIT);
  const d = armarProyecto({ piezas: { cierre: 'adaptada' }, cambio: { '.claude/skills/cierre/SKILL.md': SEIS } });
  const r = aplicar(d, { kit });
  assert.match(lineaDe(r, 'cierre'), /te espera: sin porqué/);
  const inf = leer(d, '.claude/fusiones/cierre.md');
  // en este orden: los motivos, Qué dice el kit, el archivo (diffs, propuesta, la nueva entera), Las salidas
  const pos = ['**Por qué no se fusionó sola:**', '## Qué dice el kit', '## `.claude/skills/cierre/SKILL.md`', '### La fusión propuesta', '### La versión nueva, entera', '## Las salidas'].map((s) => inf.indexOf(s));
  assert.ok(pos.every((p) => p >= 0), JSON.stringify(pos));
  assert.deepEqual([...pos].sort((a, b) => a - b), pos);
  const nota = inf.slice(pos[1], pos[2]);
  assert.match(nota, /^> ## 3\.0\.0$/m);
  assert.match(nota, /^> - \*\*Qué piezas cambiaron\*\*: el cierre, el paso uno\.$/m);
  assert.match(nota, /^> ## 3\.0\.0-rc\.1$/m);
  assert.doesNotMatch(nota, /3\.1\.0|lo de la versión vieja|Una sección por versión/);
  assert.match(inf, /### La versión nueva, entera\n\n```md\n# cierre\n\nuno v2\n[\s\S]*\nseis\n```/, 'la nueva entera: el molde nuevo, sin lo nuestro');
  const salidas = inf.slice(pos[5]);
  assert.match(salidas, /¿la mejoramos con esto\?/);
  for (const s of ['mezclar', 'quedarse con la propia', 'tomar la nueva del kit', 'congelar']) assert.match(salidas, new RegExp(`^- \\*\\*${s}\\*\\*: `, 'm'), s);
  assert.match(salidas, /se te vuelve a ofrecer desde el kit 2\.9\.0/);
  assert.match(salidas, /Lo que perdés \(lo tuyo fuera de la zona propia\): \.claude\/skills\/cierre\/SKILL\.md\./);
  assert.match(salidas, /resolver \. cierre mezclar\|propia\|nueva\|congelar --por "<por qué>"/);
  // la huella de lo tuyo, por archivo, antes del primer ## (r1-2)
  assert.match(inf, new RegExp(`^tuyo: ${F.hash(SEIS)} tres \\.claude/skills/cierre/SKILL\\.md$`, 'm'));
  const li = FU.leerInforme(inf);
  assert.equal(li.base, '2.9.0');
  assert.deepEqual(li.tuyos, [{ rel: '.claude/skills/cierre/SKILL.md', hash: F.hash(SEIS), tipo: 'tres' }]);
  assert.equal(li.archivos.get('.claude/skills/cierre/SKILL.md').nueva, MOLDE_N['skills/cierre/SKILL.md']);
  assert.equal(li.archivos.get('.claude/skills/cierre/SKILL.md').propuesta, CIERRE_V.replace('uno\n', 'uno v2\n').replace('seis\n', 'seis (a nuestra manera)\n'));
  // sin CHANGELOG.md en el kit: la línea fija
  const d2 = armarProyecto({ piezas: { cierre: 'adaptada' }, cambio: { '.claude/skills/cierre/SKILL.md': SEIS } });
  aplicar(d2);
  assert.match(leer(d2, '.claude/fusiones/cierre.md'), /## Qué dice el kit\n\nel kit no dejó nota para estas versiones\n/);
});

test('RF-fix 5: la cabecera del informe — con "la mezcla chocó" el /inicio te la pregunta siempre; sin choque, elige o pregunta', () => {
  const tmp = nuevaCarpeta('inf-cabecera');
  const archivos = [{ rel: '.claude/skills/cierre/SKILL.md', tipo: 'tres', v: 'a\n', n: 'b\n', p: 'c\n', conflictos: 1 }];
  const de = (motivo) => FU.informe({ id: 'cierre', versiones: { viejo: '2.9.0', nuevo: '3.0.0' }, motivo, porque: null, archivos, tmp });
  for (const motivo of ['la mezcla chocó', 'la mezcla chocó: la propuesta la armó claude, elegí vos', 'la mezcla chocó (claude no está)']) {
    const inf = de(motivo);
    assert.match(inf, /^> La dejó el actualizador del kit\. La mezcla chocó: la próxima sesión \(`\/inicio`\) te la pregunta siempre \(nunca la elige sola\), junto con\n> las otras;/m, motivo);
    assert.doesNotMatch(inf, /elige una de las salidas/, motivo);
  }
  const sin = de('adaptada sin porqué');
  assert.match(sin, /^> La dejó el actualizador del kit\. La próxima sesión \(`\/inicio`\) elige una de las salidas de abajo o te la pregunta, junto con$/m);
  assert.doesNotMatch(sin, /te la pregunta siempre/);
});

test('el informe de una pieza de frenos no ofrece congelar (FRENOS, r1-5); de una que no es freno, sí', () => {
  const tmp = nuevaCarpeta('inf');
  const archivos = [{ rel: '.claude/hooks/lib/x.cjs', tipo: 'tres', v: 'a\n', n: 'b\n', p: 'c\n', conflictos: 1 }];
  for (const id of ['hooks-lib', 'hook-git-seguro', 'settings', 'candado', 'githooks', 'cambios-metodo', 'scripts']) {
    const inf = FU.informe({ id, versiones: { viejo: '2.9.0', nuevo: '3.0.0' }, motivo: 'x', porque: null, archivos, tmp });
    assert.doesNotMatch(inf, /\*\*congelar\*\*/, id);
    assert.match(inf, new RegExp(`congelar no va: \`${id}\` es una pieza de frenos`), id);
    assert.ok(FU.esFreno(id), id);
  }
  for (const id of ['cierre', 'inicio', 'estado', 'director-obrero']) {
    assert.ok(!FU.esFreno(id), id);
    assert.match(FU.informe({ id, versiones: { viejo: '2.9.0', nuevo: '3.0.0' }, motivo: 'x', porque: null, archivos, tmp }), /^- \*\*congelar\*\*: `propia`/m, id);
  }
  assert.deepEqual(FU.FRENOS.map((f) => f.id), ['hook-*', 'settings', 'candado', 'githooks', 'hooks-lib', 'cambios-metodo', 'scripts']);
  for (const f of FU.FRENOS) assert.ok(f.por.length > 10, `${f.id}: con su porqué`);
});

test('sin porqué: no fusiona; .claude/fusiones/<pieza>.md con los dos diffs, la propuesta y la pregunta; la pieza vieja', () => {
  for (const [nombre, o] of [
    ['el cambio nació con el archivo', { enNace: true }],
    ['el commit es del actualizador', { autor: 'kit-actualizador' }],
    ['el asunto empieza con "kit "', { mensaje: 'kit 2.8.0 → 2.9.0' }],
    ['el asunto empieza con "kit:" (la adopción)', { mensaje: 'kit: adopción 2.9.0 (piezas)' }],
    ['el asunto empieza con "kit:" (la ROTA)', { mensaje: 'kit: ROTA — 1. llaves · ❌ · x' }],
  ]) {
    const d = armarProyecto({ piezas: { cierre: 'adaptada' }, cambio: { '.claude/skills/cierre/SKILL.md': SEIS }, ...o });
    const r = aplicar(d);
    assert.equal(r.codigo, 0);
    assert.match(lineaDe(r, 'cierre'), /^cierre · adaptada · te espera: sin porqué/, nombre);
    assert.equal(leer(d, '.claude/skills/cierre/SKILL.md'), SEIS, `${nombre}: la pieza queda vieja`);
    assert.equal(piezaDe(d, 'cierre'), 'adaptada', nombre);
    const inf = leer(d, '.claude/fusiones/cierre.md');
    assert.ok(inf, nombre);
    assert.match(inf, /Actualicé cierre; acá la tenías distinta así; ¿la mejoramos con esto\?/);
    assert.match(inf, /kit 2\.9\.0 → 3\.0\.0/);
    assert.match(inf, /\*\*Por qué no se fusionó sola:\*\* sin porqué/);
    assert.match(inf, /molde viejo → molde nuevo[\s\S]*```diff\n--- molde viejo\n\+\+\+ molde nuevo\n@@[^\n]*\n[\s\S]*^-uno$\n^\+uno v2$/m);
    assert.match(inf, /molde viejo → lo tuyo[\s\S]*```diff\n--- molde viejo\n\+\+\+ lo tuyo\n[\s\S]*^-seis$\n^\+seis \(a nuestra manera\)$/m);
    assert.match(inf, /La fusión propuesta\n\n```md\n# cierre\n\nuno v2\n[\s\S]*seis \(a nuestra manera\)\n```/);
    assert.equal(r.claude, null, 'sin porqué no se lanza claude');
  }
});

// ---------------------------------------------------------------- conflictos: el claude

const DE_CLAUDE = CIERRE_V.replace('uno\n', 'uno v2 // uno (nuestro)\n'); // lo que arma el claude falso sobre UNO

test('8r §3: conflicto con porqué y un claude que resuelve → te espera con SU propuesta (nunca se aplica); su línea: acceptEdits, --allowedTools, nunca el bypass; el clon limpio', () => {
  const d = armarProyecto({ piezas: { cierre: `{estado: adaptada, por: "${POR}"}` }, cambio: { '.claude/skills/cierre/SKILL.md': UNO } });
  const r = aplicar(d);
  assert.equal(lineaDe(r, 'cierre'), 'cierre · adaptada · te espera: la mezcla chocó: la propuesta la armó claude, elegí vos', r.lineas.join('\n'));
  assert.equal(leer(d, '.claude/skills/cierre/SKILL.md'), UNO, 'la pieza queda como estaba: claude solo propone');
  assert.equal(piezaDe(d, 'cierre').estado, 'adaptada');
  const inf = leer(d, '.claude/fusiones/cierre.md');
  assert.ok(inf.includes('- **Por qué no se fusionó sola:** la mezcla chocó: la propuesta la armó claude, elegí vos\n'), inf);
  assert.ok(inf.includes('- **Qué pieza es:** `cierre` (`.claude/skills/cierre/SKILL.md`)\n'), inf);
  assert.ok(inf.includes(`- **Por qué la habías adaptado:** ${POR} (su \`por:\` en la ficha)\n`), inf);
  assert.ok(inf.includes('La armó claude sobre los pedazos que chocan y NO se aplicó: mirala antes de elegir mezclar.'), inf);
  assert.ok(inf.includes('(la fusión propuesta de cada archivo; la de .claude/skills/cierre/SKILL.md la armó claude).'), inf);
  assert.ok(inf.includes(FU.RECOMIENDA), 'la línea de la recomendación con criterio');
  assert.equal(FU.leerInforme(inf).archivos.get('.claude/skills/cierre/SKILL.md').propuesta, DE_CLAUDE, 'leerInforme lee la propuesta de claude');
  // ## Dónde chocan: después de Qué dice el kit y antes del archivo; el pedazo con lo tuyo, lo nuevo y lo de antes
  const dc = inf.indexOf('## Dónde chocan');
  const archivo = inf.indexOf('\n## `.claude/skills/cierre/SKILL.md`');
  assert.ok(dc > inf.indexOf('## Qué dice el kit') && dc < archivo, inf);
  const donde = inf.slice(dc, archivo);
  assert.match(donde, /### `\.claude\/skills\/cierre\/SKILL\.md`\n\n#### Pedazo 1 de 1 \(cerca del renglón 3 de lo tuyo\)\n\n\*\*Lo tuyo:\*\*\n\n```md\nuno \(nuestro\)\n```\n\n\*\*Lo nuevo del kit:\*\*\n\n```md\nuno v2\n```\n\n\*\*Antes \(el molde viejo\):\*\*\n\n```md\nuno\n```\n/);
  const { argv, pedido, local } = r.claude;
  assert.deepEqual(argv, ['-p', '--permission-mode', 'acceptEdits', '--allowedTools', 'Read(./.kit-fusion/**)', 'Edit(./.kit-fusion/**)']);
  assert.ok(!argv.join(' ').includes('bypass') && !argv.includes('--dangerously-skip-permissions'));
  assert.match(pedido, new RegExp(POR));
  assert.match(pedido, /\.kit-fusion\/\.claude\/skills\/cierre\/SKILL\.md/);
  assert.deepEqual(JSON.parse(local).permissions, { allow: ['Read(./.kit-fusion/**)', 'Edit(./.kit-fusion/**)'], deny: ['Bash'] });
  // .kit-fusion/ y settings.local.json se borran y están excluidos: nunca se commitean
  assert.ok(!fs.existsSync(path.join(d, '.kit-fusion')));
  assert.ok(!fs.existsSync(path.join(d, '.claude', 'settings.local.json')));
  const ex = fs.readFileSync(path.join(d, '.git', 'info', 'exclude'), 'utf8');
  assert.match(ex, /^\.kit-fusion\/$/m);
  assert.match(ex, /^\.claude\/settings\.local\.json$/m);
});

test('conflicto con porqué: un claude que deja marcadores, rompe el node --check, toca otra ruta, borra la zona o falla → te espera, la pieza vieja', () => {
  const HOOK_P = HOOK_V.replace('const a = 1;', 'const a = 5;');
  const casos = [
    ['marcadores', 'cierre', { '.claude/skills/cierre/SKILL.md': UNO }, /la mezcla chocó \(no pasó chequear lo de claude: .*quedaron marcadores/],
    ['rompe', 'hook-arranque', { '.claude/hooks/session-start.cjs': HOOK_P }, /la mezcla chocó \(no pasó chequear lo de claude: .*node --check/],
    ['otra', 'cierre', { '.claude/skills/cierre/SKILL.md': UNO }, /la mezcla chocó \(claude tocó otra ruta \(\.claude\/hooks\/intruso\.cjs\)\)/],
    ['falla', 'cierre', { '.claude/skills/cierre/SKILL.md': UNO }, /la mezcla chocó \(claude salió con 3\)/],
  ];
  for (const [modo, id, cambio, re] of casos) {
    const d = armarProyecto({ piezas: { [id]: `{estado: adaptada, por: "${POR}"}` }, cambio });
    const antes = Object.values(cambio)[0];
    const r = aplicar(d, { modo });
    assert.equal(r.codigo, 0, modo);
    assert.match(lineaDe(r, id), new RegExp(`^${id} · adaptada · te espera: ${re.source}`), modo);
    assert.equal(leer(d, Object.keys(cambio)[0]), antes, `${modo}: la pieza vieja`);
    assert.ok(leer(d, `.claude/fusiones/${id}.md`), modo);
    assert.doesNotMatch(leer(d, `.claude/fusiones/${id}.md`), /La armó claude/, `${modo}: sin propuesta de claude`);
    assert.match(leer(d, `.claude/fusiones/${id}.md`), /## Dónde chocan/, modo);
    assert.equal(leer(d, '.claude/hooks/intruso.cjs'), null, `${modo}: lo que el agente metió afuera se va`);
    assert.ok(!fs.existsSync(path.join(d, '.kit-fusion')) && !fs.existsSync(path.join(d, '.claude', 'settings.local.json')), modo);
  }
});

test('conflicto con porqué y sin claude (--claude no), o con --plan → te espera, sin lanzar nada', () => {
  const d = armarProyecto({ piezas: { cierre: `{estado: adaptada, por: "${POR}"}` }, cambio: { '.claude/skills/cierre/SKILL.md': UNO } });
  const r = aplicar(d, { claude: 'no' });
  assert.equal(lineaDe(r, 'cierre'), 'cierre · adaptada · te espera: la mezcla chocó (sin claude: --claude no, o no está en el PATH)');
  assert.equal(r.claude, null);
  assert.equal(leer(d, '.claude/skills/cierre/SKILL.md'), UNO);
  assert.match(leer(d, '.claude/fusiones/cierre.md'), /git merge-file no dio una fusión limpia \(1 conflicto\(s\)\)/);
  assert.match(leer(d, '.claude/fusiones/cierre.md'), /## Dónde chocan[\s\S]*\*\*Lo tuyo:\*\*\n\n```md\nuno \(nuestro\)\n```/);
  const d2 = armarProyecto({ piezas: { cierre: `{estado: adaptada, por: "${POR}"}` }, cambio: { '.claude/skills/cierre/SKILL.md': UNO } });
  const r2 = aplicar(d2, { plan: true });
  assert.match(lineaDe(r2, 'cierre'), /te espera: la mezcla chocó \(con --plan no lanzo claude\)$/);
  assert.equal(r2.claude, null);
  assert.deepEqual(limpioSalvo(d2), [], '--plan no escribe');
});

// ---------------------------------------------------------------- la zona propia

test('la zona propia queda byte a byte: fusión limpia, con claude, y un claude que borra las marcas → te espera', () => {
  const zona = '  lo nuestro,  con espacios\ty un tab\n\n<<< no es un marcador >>>';
  const conZona = (t) => t.replace('<!-- kit:propio -->\n', `<!-- kit:propio -->\n${zona}\n`);
  // limpia: lo de afuera no pisa lo del molde (linea e)
  const d = armarProyecto({ piezas: { inicio: `{estado: adaptada, por: "${POR}"}` }, cambio: { '.claude/skills/inicio/SKILL.md': conZona(INICIO_V.replace('linea e\n', 'linea e nuestra\n')) } });
  const r = aplicar(d);
  assert.match(lineaDe(r, 'inicio'), /fusionada \(sola/);
  assert.equal(leer(d, '.claude/skills/inicio/SKILL.md'), conZona(INICIO_V.replace('linea a\n', 'linea a v2\n').replace('linea e\n', 'linea e nuestra\n')));
  // con claude: pisa linea a
  const d2 = armarProyecto({ piezas: { inicio: `{estado: adaptada, por: "${POR}"}` }, cambio: { '.claude/skills/inicio/SKILL.md': conZona(INICIO_V.replace('linea a\n', 'linea a nuestra\n')) } });
  const r2 = aplicar(d2);
  assert.match(lineaDe(r2, 'inicio'), /te espera: la mezcla chocó: la propuesta la armó claude, elegí vos$/, r2.lineas.join('\n'));
  assert.equal(leer(d2, '.claude/skills/inicio/SKILL.md'), conZona(INICIO_V.replace('linea a\n', 'linea a nuestra\n')), 'no se aplica');
  const inf2 = leer(d2, '.claude/fusiones/inicio.md');
  assert.equal(FU.leerInforme(inf2).archivos.get('.claude/skills/inicio/SKILL.md').propuesta, conZona(INICIO_V.replace('linea a\n', 'linea a v2 // linea a nuestra\n')), 'la propuesta, con la zona byte a byte');
  const dc2 = inf2.indexOf('## Dónde chocan');
  assert.ok(dc2 > 0, inf2);
  assert.ok(!inf2.slice(dc2, inf2.indexOf('\n## `')).includes('lo nuestro'), 'dónde chocan: solo lo de afuera de la zona');
  assert.ok(!r2.claude.pedido.includes('lo nuestro'), 'la zona no viaja al agente: se fusiona solo lo de afuera');
  // un claude que borra las marcas de la zona → te espera, sin propuesta
  const d3 = armarProyecto({ piezas: { inicio: `{estado: adaptada, por: "${POR}"}` }, cambio: { '.claude/skills/inicio/SKILL.md': conZona(INICIO_V.replace('linea a\n', 'linea a nuestra\n')) } });
  const r3 = aplicar(d3, { modo: 'zona' });
  assert.match(lineaDe(r3, 'inicio'), /te espera: la mezcla chocó \(no pasó chequear lo de claude: .*la zona propia no quedó/);
});

// ---------------------------------------------------------------- un "te espera" de antes se resuelve

test('un .claude/fusiones/<pieza>.md de antes (el dueño no contestó): no se fusiona sola aunque tenga porqué; el informe se rehace con su base', () => {
  const d = armarProyecto({ piezas: { cierre: `{estado: adaptada, por: "${POR}"}` }, cambio: { '.claude/skills/cierre/SKILL.md': SEIS, '.claude/fusiones/cierre.md': '# viejo, sin línea base\n' } });
  const r = aplicar(d);
  assert.equal(lineaDe(r, 'cierre'), 'cierre · adaptada · te espera: todavía espera tu respuesta (desde el kit 2.9.0): no se fusiona sola');
  assert.equal(leer(d, '.claude/skills/cierre/SKILL.md'), SEIS);
  const inf = leer(d, '.claude/fusiones/cierre.md');
  assert.match(inf, /^base: 2\.9\.0$/m, 'sin línea base, la base es kit: de la ficha');
  assert.equal(FU.baseDeInforme(inf), '2.9.0');
  assert.equal(FU.baseDeInforme('# x\n\n## a\n\nbase: 1.0.0\n'), null, 'la línea va antes del primer ##');
});

// Un kit con historia: v2.9.0 (MOLDE_V), v3.0.0 (MOLDE_N) y v3.1.0 (MOLDE_N con "tres" cambiado), para las bases de verdad.
const MOLDE_C = { ...MOLDE_N, 'skills/cierre/SKILL.md': MOLDE_N['skills/cierre/SKILL.md'].replace('tres\n', 'tres v3\n') };
function kitConTags() {
  const d = nuevaCarpeta('kit-git');
  git(d, 'init', '-q', '-b', 'main');
  git(d, 'config', 'core.autocrlf', 'false');
  for (const [molde, v] of [[MOLDE_V, '2.9.0'], [MOLDE_N, '3.0.0'], [MOLDE_C, '3.1.0']]) {
    fs.rmSync(path.join(d, 'kit'), { recursive: true, force: true });
    escribirArbol(path.join(d, 'kit', 'molde'), molde);
    fs.writeFileSync(path.join(d, 'kit', 'VERSION'), `${v}\n`);
    git(d, 'add', '-A');
    git(d, 'commit', '-q', '-m', `kit ${v}`);
    git(d, 'tag', '-a', `v${v}`, '-m', `v${v}`);
  }
  return d;
}
const commitKit = (d, v) => {
  git(d, 'add', '-A');
  git(d, 'commit', '-q', '-m', v, '--author', 'kit-actualizador <k@kit.invalid>');
};

test('tres versiones: A → B queda en te espera (base A) → C rehace el informe con el diff desde A y nada se fusiona solo', () => {
  const kit = kitConTags();
  const d = armarProyecto({ piezas: { cierre: 'adaptada' }, cambio: { '.claude/skills/cierre/SKILL.md': SEIS }, enNace: true });
  git(kit, 'checkout', '-q', 'v3.0.0');
  const r1 = A.aplicar(d, { kit, fecha: '2026-11-02', claude: 'no' });
  assert.match(lineaDe(r1, 'cierre'), /te espera: sin porqué/, r1.lineas.join('\n'));
  assert.equal(FU.baseDeInforme(leer(d, '.claude/fusiones/cierre.md')), '2.9.0');
  commitKit(d, 'kit 2.9.0 → 3.0.0');
  // el dueño todavía no contestó, pero ya hay un porqué (en la ficha): igual no se fusiona sola
  fs.writeFileSync(path.join(d, '.claude', 'kit.md'), leer(d, '.claude/kit.md').replace(/^ {2}cierre: adaptada$/m, `  cierre: {estado: adaptada, por: "${POR}"}`));
  git(d, 'commit', '-q', '-am', 'ficha: el porqué del cierre');
  git(kit, 'checkout', '-q', 'v3.1.0');
  const r2 = A.aplicar(d, { kit, fecha: '2026-11-02', claude: 'no' });
  assert.equal(r2.codigo, 0, r2.lineas.join('\n'));
  assert.equal(lineaDe(r2, 'cierre'), 'cierre · adaptada · te espera: todavía espera tu respuesta (desde el kit 2.9.0): no se fusiona sola');
  assert.equal(leer(d, '.claude/skills/cierre/SKILL.md'), SEIS, 'nada se fusiona solo');
  assert.match(leer(d, '.claude/kit.md'), /^kit: 3\.1\.0$/m);
  const inf = leer(d, '.claude/fusiones/cierre.md');
  assert.match(inf, /kit 2\.9\.0 → 3\.1\.0/);
  assert.equal(FU.baseDeInforme(inf), '2.9.0', 'la base se conserva');
  assert.match(inf, /molde viejo → molde nuevo[\s\S]*^-uno$\n^\+uno v2$[\s\S]*^-tres$\n^\+tres v3$/m, 'el diff desde A: lo de B y lo de C');
  assert.match(inf, /La fusión propuesta\n\n```md\n# cierre\n\nuno v2\ndos\ntres v3\n[\s\S]*seis \(a nuestra manera\)\n```/);
});

test('tres versiones, el dueño ya contestó (no hay archivo): la base es kit: de la ficha y con porqué se fusiona sola', () => {
  const kit = kitConTags();
  const d = armarProyecto({ piezas: { cierre: 'adaptada' }, cambio: { '.claude/skills/cierre/SKILL.md': SEIS }, enNace: true });
  git(kit, 'checkout', '-q', 'v3.0.0');
  A.aplicar(d, { kit, fecha: '2026-11-02', claude: 'no' });
  commitKit(d, 'kit 2.9.0 → 3.0.0');
  // "No" en /inicio: la pieza sigue adaptada con el porqué del dueño y el archivo se borra
  fs.rmSync(path.join(d, '.claude', 'fusiones'), { recursive: true });
  fs.writeFileSync(path.join(d, '.claude', 'kit.md'), leer(d, '.claude/kit.md').replace(/^ {2}cierre: adaptada$/m, `  cierre: {estado: adaptada, por: "${POR}"}`));
  git(d, 'commit', '-q', '-am', 'inicio: el cierre sigue como lo tenemos');
  git(kit, 'checkout', '-q', 'v3.1.0');
  const r = A.aplicar(d, { kit, fecha: '2026-11-02', claude: 'no' });
  assert.equal(lineaDe(r, 'cierre'), `cierre · adaptada · fusionada (sola, ${POR})`, r.lineas.join('\n'));
  assert.equal(leer(d, '.claude/skills/cierre/SKILL.md'), SEIS.replace('tres\n', 'tres v3\n'), 'solo lo de C: lo de B lo rechazó el dueño');
  assert.equal(leer(d, '.claude/fusiones/cierre.md'), null);
});

test('noFusionar (lo usa flota al rehacer): la pieza va a te espera con el motivo, aunque tenga porqué', () => {
  const d = armarProyecto({ piezas: { cierre: `{estado: adaptada, por: "${POR}"}` }, cambio: { '.claude/skills/cierre/SKILL.md': SEIS } });
  const r = aplicar(d, { noFusionar: { cierre: 'la fusión no pasó chequear: x' } });
  assert.equal(lineaDe(r, 'cierre'), 'cierre · adaptada · te espera: la fusión no pasó chequear: x');
  assert.equal(leer(d, '.claude/skills/cierre/SKILL.md'), SEIS);
  assert.match(leer(d, '.claude/fusiones/cierre.md'), /La fusión propuesta\n\n```md\n# cierre\n\nuno v2/);
});

// ---------------------------------------------------------------- la mezcla que choca te pregunta (SPEC-paquete-8r §3, crit. 7)

test('crit. 7: un choque NUNCA termina en sola ni escribe destinos (con un claude que resuelve bien, sin claude y forzado)', () => {
  const carpeta = armarProyecto();
  process.env.KIT_FAKE_CLAUDE = 'resuelve';
  process.env.KIT_FAKE_LOG = path.join(nuevaCarpeta('log'), 'claude.json');
  const versiones = { viejo: '2.9.0', nuevo: '3.0.0' };
  const valorFicha = { estado: 'adaptada', por: POR };
  const HOOK_ROTO = HOOK_V.replace('const e = 5;', 'const e = (;'); // lo tuyo ya no compila: la mezcla sale limpia pero no valida
  const piezas = {
    conflicto: [{ rel: '.claude/skills/cierre/SKILL.md', v: CIERRE_V, n: MOLDE_N['skills/cierre/SKILL.md'], p: UNO }],
    borrado: [{ rel: '.claude/skills/cierre/SKILL.md', v: CIERRE_V, n: MOLDE_N['skills/cierre/SKILL.md'], p: null }],
    invalida: [{ rel: '.claude/hooks/session-start.cjs', v: HOOK_V, n: MOLDE_N['hooks/session-start.cjs'], p: HOOK_ROTO }],
  };
  for (const [caso, archivos] of Object.entries(piezas)) {
    for (const [como, o] of [['claude', { claude: FALSO }], ['sin claude', { claude: null }], ['forzado', { claude: FALSO, forzado: { motivo: 'x: no se fusiona sola', corto: 'todavía espera tu respuesta desde el kit 2.9.0' } }]]) {
      const r = FU.fusionar({ carpeta, id: 'cierre', archivos, valorFicha, versiones, ...o });
      const nombre = `${caso}, ${como}`;
      assert.equal(r.resultado, 'espera', nombre);
      assert.equal(r.destinos.size, 0, `${nombre}: no escribe destinos`);
      assert.ok(r.motivo.startsWith('la mezcla chocó'), `${nombre}: ${r.motivo}`);
      assert.match(r.informe, /\n## Dónde chocan\n/, nombre);
      assert.ok(r.informe.includes(`- **Por qué la habías adaptado:** ${POR} (su \`por:\` en la ficha)`), nombre);
      if (como === 'forzado') assert.match(r.motivo, /todavía espera tu respuesta desde el kit 2\.9\.0/, nombre);
      assert.equal(FU.que(r), `te espera: ${r.motivo}`);
    }
  }
  // los motivos exactos
  const m = (archivos, o) => FU.fusionar({ carpeta, id: 'cierre', archivos, valorFicha, versiones, ...o }).motivo;
  assert.equal(m(piezas.conflicto, { claude: FALSO }), 'la mezcla chocó: la propuesta la armó claude, elegí vos');
  assert.equal(m(piezas.conflicto, { claude: FALSO, forzado: { motivo: 'x', corto: 'todavía espera tu respuesta desde el kit 2.9.0' } }), 'la mezcla chocó: la propuesta la armó claude, elegí vos (todavía espera tu respuesta desde el kit 2.9.0)');
  assert.equal(m(piezas.conflicto, { claude: null, forzado: 'la fusión no pasó chequear: x' }), 'la mezcla chocó (la fusión no pasó chequear: x; sin claude: --claude no, o no está en el PATH)');
  assert.equal(m(piezas.borrado, { claude: FALSO }), 'la mezcla chocó (.claude/skills/cierre/SKILL.md: lo borraste y el molde lo cambió)');
  assert.match(m(piezas.invalida, { claude: FALSO }), /^la mezcla chocó \(no pasó chequear: \.claude\/hooks\/session-start\.cjs: no pasa node --check\)$/);
  // lo que no es choque sigue como estaba: sin porqué; y el forzado de una limpia
  assert.equal(m(piezas.conflicto, { claude: FALSO, valorFicha: 'adaptada' }), 'sin porqué (la pieza no tiene `por:` en la ficha)');
  const limpia = [{ rel: '.claude/skills/cierre/SKILL.md', v: CIERRE_V, n: MOLDE_N['skills/cierre/SKILL.md'], p: SEIS }];
  assert.equal(m(limpia, { forzado: { motivo: 'todavía espera tu respuesta (desde el kit 2.9.0): no se fusiona sola', corto: 'y' } }), 'todavía espera tu respuesta (desde el kit 2.9.0): no se fusiona sola');
  assert.equal(FU.fusionar({ carpeta, id: 'cierre', archivos: limpia, valorFicha, versiones }).resultado, 'sola');
});

test('crit. 7: resolver … mezclar escribe la propuesta que armó claude (la toma de leerInforme)', () => {
  const d = armarProyecto({ piezas: { cierre: `{estado: adaptada, por: "${POR}"}` }, cambio: { '.claude/skills/cierre/SKILL.md': UNO } });
  const r = aplicar(d);
  assert.match(lineaDe(r, 'cierre'), /te espera: la mezcla chocó: la propuesta la armó claude, elegí vos$/);
  git(d, 'add', '-A');
  git(d, 'commit', '-q', '-m', 'kit 2.9.0 → 3.0.0', '--author', 'kit-actualizador <k@kit.invalid>');
  fs.rmSync(path.join(d, '.kit-rol'));
  const rs = A.resolver(d, 'cierre', 'mezclar', { por: 'lo de claude está bien' });
  assert.equal(rs.codigo, 0, rs.lineas.join('\n'));
  assert.equal(leer(d, '.claude/skills/cierre/SKILL.md'), DE_CLAUDE);
  assert.equal(leer(d, '.claude/fusiones/cierre.md'), null);
  assert.equal(piezaDe(d, 'cierre').por, 'lo de claude está bien');
});

test('crit. 7: la segunda corrida con el informe pendiente sigue "la mezcla chocó", con la propuesta nueva (claude se lanza igual); sin el tag de la base, también', () => {
  const kit = kitConTags();
  const d = armarProyecto({ piezas: { cierre: `{estado: adaptada, por: "${POR}"}` }, cambio: { '.claude/skills/cierre/SKILL.md': UNO } });
  git(kit, 'checkout', '-q', 'v3.0.0');
  const r1 = aplicar(d, { kit, moldeViejo: undefined });
  assert.match(lineaDe(r1, 'cierre'), /te espera: la mezcla chocó: la propuesta la armó claude, elegí vos$/, r1.lineas.join('\n'));
  commitKit(d, 'kit 2.9.0 → 3.0.0');
  git(kit, 'checkout', '-q', 'v3.1.0');
  const r2 = aplicar(d, { kit, moldeViejo: undefined });
  assert.equal(lineaDe(r2, 'cierre'), 'cierre · adaptada · te espera: la mezcla chocó: la propuesta la armó claude, elegí vos (todavía espera tu respuesta desde el kit 2.9.0)', r2.lineas.join('\n'));
  assert.ok(r2.claude, 'forzado: claude se lanza igual');
  assert.equal(leer(d, '.claude/skills/cierre/SKILL.md'), UNO, 'nada se aplica');
  const inf = leer(d, '.claude/fusiones/cierre.md');
  assert.equal(FU.baseDeInforme(inf), '2.9.0');
  assert.equal(FU.leerInforme(inf).archivos.get('.claude/skills/cierre/SKILL.md').propuesta, DE_CLAUDE.replace('tres\n', 'tres v3\n'), 'la propuesta nueva: lo de B, lo de C y lo tuyo');
  assert.match(inf, /## Dónde chocan/);
  // sin claude, la segunda corrida: sigue "la mezcla chocó", sin propuesta
  commitKit(d, 'kit 3.0.0 → 3.1.0');
  const r3 = aplicar(d, { kit, moldeViejo: undefined, claude: 'no' });
  assert.equal(lineaDe(r3, 'cierre'), 'cierre · adaptada · te espera: la mezcla chocó (todavía espera tu respuesta desde el kit 2.9.0; sin claude: --claude no, o no está en el PATH)');
  // el --kit sin el tag de la base: el informe queda como estaba y la línea sigue diciendo que chocó
  const d2 = armarProyecto({ piezas: { cierre: `{estado: adaptada, por: "${POR}"}` }, cambio: { '.claude/skills/cierre/SKILL.md': UNO } });
  aplicar(d2);
  commitKit(d2, 'kit 2.9.0 → 3.0.0');
  const antes = leer(d2, '.claude/fusiones/cierre.md');
  const r4 = aplicar(d2, { moldeViejo: undefined });
  assert.equal(lineaDe(r4, 'cierre'), 'cierre · adaptada · te espera: la mezcla chocó (todavía espera tu respuesta desde el kit 2.9.0; el --kit no tiene el tag v2.9.0: el informe queda como estaba)', r4.lineas.join('\n'));
  assert.equal(leer(d2, '.claude/fusiones/cierre.md'), antes);
});

test('pedazos: los trozos en conflicto de un diff3, con el renglón de lo tuyo', () => {
  const t = 'a\nb\n<<<<<<< proyecto\nmío\nmío 2\n||||||| molde viejo\nviejo\n=======\nnuevo\n>>>>>>> molde nuevo\nc\n<<<<<<< proyecto\n||||||| molde viejo\nx\n=======\ny\n>>>>>>> molde nuevo\n';
  assert.deepEqual(FU.pedazos(t), [
    { renglon: 3, tuyo: 'mío\nmío 2\n', viejo: 'viejo\n', nuevo: 'nuevo\n' },
    { renglon: 6, tuyo: '', viejo: 'x\n', nuevo: 'y\n' },
  ]);
  assert.deepEqual(FU.dondeChocan([{ rel: 'a.md', tipo: 'tres', limpio: true }]), [], 'sin choque, sin sección');
});

// ---------------------------------------------------------------- piezas sueltas

test('/inicio: la lista de frenos ya no vive en el texto (es FRENOS de fusion.cjs); quedarse con la propia sigue adaptada', () => {
  const inicio = fs.readFileSync(path.resolve(__dirname, '..', '..', '..', '..', 'molde', 'skills', 'inicio', 'SKILL.md'), 'utf8');
  const paso = inicio.split('\n').find((l) => /Fusiones del kit/.test(l));
  assert.doesNotMatch(paso, /`hooks-lib`/, 'la lista está en FRENOS');
  assert.doesNotMatch(paso, /No: la pieza pasa a `propia`/);
  const inf = FU.informe({ id: 'cierre', versiones: { viejo: '2.9.0', nuevo: '3.0.0' }, motivo: 'x', porque: null, archivos: [], tmp: nuevaCarpeta('inf') });
  assert.match(inf, /\*\*quedarse con la propia\*\*: sigue `adaptada`, sin cambios/);
  assert.doesNotMatch(inf, /pasa a `propia`/);
});

test('validar: marcadores, zona y node --check', () => {
  const tmp = nuevaCarpeta('val');
  assert.equal(FU.validar('a.md', 'x\n<<<<<<< proyecto\ny\n', null, tmp).ok, false);
  assert.equal(FU.validar('a.md', 'x\n=======\n', null, tmp).ok, false);
  assert.equal(FU.validar('a.md', 'x\n======= no\n', null, tmp).ok, true);
  assert.equal(FU.validar('a.cjs', 'const = ;\n', null, tmp).ok, false);
  assert.equal(FU.validar('a.cjs', 'const a = 1;\n', null, tmp).ok, true);
  assert.equal(FU.validar('a.txt', 'const = ;\n', null, tmp).ok, true, 'node --check solo en los .js/.cjs/.mjs');
  const p = 'a\n<!-- kit:propio -->\nmío\n<!-- /kit:propio -->\n';
  assert.deepEqual(FU.validar('a.md', 'b\n<!-- kit:propio -->\n<!-- /kit:propio -->\n', p, tmp), { ok: true, texto: 'b\n<!-- kit:propio -->\nmío\n<!-- /kit:propio -->\n' });
  assert.equal(FU.validar('a.md', 'b\n', p, tmp).ok, false, 'sin las marcas: la zona no quedó');
});

test('buscarClaude: no → null; una ruta → esa; sin bandera, el del PATH o null', () => {
  assert.equal(FU.buscarClaude('no'), null);
  assert.equal(FU.buscarClaude('/x/claude'), '/x/claude');
  const dir = nuevaCarpeta('path');
  assert.equal(FU.buscarClaude(undefined, { PATH: dir }), null);
  const exe = path.join(dir, process.platform === 'win32' ? 'claude.exe' : 'claude');
  fs.writeFileSync(exe, '');
  assert.equal(FU.buscarClaude(undefined, { PATH: dir }), exe);
});

test('sin bypass: el código de la fusión no nombra el modo que saltea permisos (salvo un "nunca")', () => {
  for (const f of ['fusion.cjs', 'flota.cjs', '../actualizar.cjs']) {
    const t = fs.readFileSync(path.join(__dirname, f), 'utf8');
    const lineas = t.split('\n').filter((l) => /bypassPermissions|dangerously-skip-permissions/.test(l));
    assert.ok(lineas.every((l) => /nunca/i.test(l)), `${f}: ${lineas.join(' | ')}`);
  }
  assert.ok(!FU.ARGS_CLAUDE.join(' ').includes('bypass'));
  assert.deepEqual(FU.ARGS_CLAUDE.slice(0, 3), ['-p', '--permission-mode', 'acceptEdits']);
});
