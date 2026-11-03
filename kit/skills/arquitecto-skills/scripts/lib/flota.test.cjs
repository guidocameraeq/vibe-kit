'use strict';
// flota.test.cjs — `actualizar.cjs flota` (SPEC-paquete-6 P7.1, D6.2; crit. 15, 16, 17 y 18). Corren con:
//   node --test kit/skills/arquitecto-skills/scripts/lib/flota.test.cjs
// Todo en temporales: el canónico es un bare que arma la prueba (un árbol chico con kit/VERSION y kit/molde/ y sus tags), cada repo
// es un checkout "de Guido" con su remoto bare, y git corre sin la config de la PC. Nunca el origin real, ~/.claude ni ../vibe-kit-pruebas.
// El molde: kit/molde/ real sin sus *.test.cjs y sin githooks/; las pruebas de los githooks (D6-6) usan el molde CON githooks/ y
// el gitleaks de la PC (sin él, en skip). El molde nuevo cambia una línea de skills/cierre; el roto, además, deja un {{…}} suelto
// (chequear 1 ❌). Nunca el claude real: --claude no (la fusión con claude la prueba fusion.test.cjs con uno falso).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const FL = require('./flota.cjs');
const A = require('../actualizar.cjs');
const M = require('./molde.cjs');
const C = require('./catalogo.cjs');
const FI = require('../../pc/lib/ficha.cjs');
const Z = require('../../pc/lib/zona-propia.cjs');

const MOLDE = path.resolve(__dirname, '..', '..', '..', '..', 'molde');
const SCRIPTS = path.resolve(__dirname, '..');
const T = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-flota-test-'));
test.after(() => fs.rmSync(T, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }));
fs.writeFileSync(path.join(T, 'gitconfig-vacio'), '');
Object.assign(process.env, {
  GIT_CONFIG_GLOBAL: path.join(T, 'gitconfig-vacio'), GIT_CONFIG_NOSYSTEM: '1',
  GIT_AUTHOR_NAME: 'prueba', GIT_AUTHOR_EMAIL: 'p@kit.invalid', GIT_COMMITTER_NAME: 'prueba', GIT_COMMITTER_EMAIL: 'p@kit.invalid',
});
const FECHA = '2026-11-02';

let n = 0;
const nuevaCarpeta = (nombre) => {
  const d = path.join(T, `${nombre}-${n++}`);
  fs.mkdirSync(d, { recursive: true });
  return d;
};
function git(cwd, ...args) {
  const r = spawnSync('git', ['-c', 'core.autocrlf=false', ...args], { cwd, encoding: 'utf8', windowsHide: true });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}
const gitOk = (cwd, ...args) => spawnSync('git', args, { cwd, encoding: 'utf8', windowsHide: true }).status === 0;
function copiar(de, a, filtro) {
  for (const e of fs.readdirSync(de, { withFileTypes: true })) {
    const x = path.join(de, e.name);
    const y = path.join(a, e.name);
    if (e.isDirectory()) {
      if (!filtro || filtro(e.name, true)) copiar(x, y, filtro);
    } else if (!filtro || filtro(e.name, false)) {
      fs.mkdirSync(a, { recursive: true });
      fs.writeFileSync(y, fs.readFileSync(x).toString('latin1').replace(/\r\n/g, '\n'), 'latin1');
    }
  }
}
// Una foto del árbol ENTERO (con .git): el checkout de Guido, byte a byte.
function foto(dir) {
  const out = {};
  (function rec(d, rel) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const q = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) rec(path.join(d, e.name), q);
      else out[q] = crypto.createHash('sha256').update(fs.readFileSync(path.join(d, e.name))).digest('hex');
    }
  })(dir, '');
  return out;
}

// ---------------------------------------------------------------- los moldes y el canónico

const sinPruebasNiGithooks = (nombre, esDir) => (esDir ? nombre !== 'githooks' : !nombre.endsWith('.test.cjs'));
const MOLDE_VIEJO = nuevaCarpeta('molde-viejo');
copiar(MOLDE, MOLDE_VIEJO, sinPruebasNiGithooks);
const conCierre = (extra) => {
  const d = nuevaCarpeta('molde');
  copiar(MOLDE_VIEJO, d);
  const p = path.join(d, 'skills', 'cierre', 'SKILL.md');
  fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace('<!-- kit:propio -->', `${extra}\n\n<!-- kit:propio -->`));
  return d;
};
const MOLDE_NUEVO = conCierre('- Un paso más del molde 3.0.0: mirá que el handoff diga la versión del kit.');
const MOLDE_ROTO = conCierre('- Un paso roto a propósito: {{ROTO_A_PROPOSITO}}.');

// Un kit en disco (sin git): kit/molde + kit/VERSION.
function kitEnDisco(molde, version) {
  const d = nuevaCarpeta('kit');
  copiar(molde, path.join(d, 'kit', 'molde'));
  fs.writeFileSync(path.join(d, 'kit', 'VERSION'), `${version}\n`);
  return d;
}

// El canónico: v2.9.0 (molde viejo) y después `tag` con el molde nuevo y kit/VERSION = `version`. Devuelve la ruta del bare.
// `despues`: más [molde, tag] encima (anotados, kit/VERSION = el tag sin -rc).
function armarCanon({ molde = MOLDE_NUEVO, version = '3.0.0', tag = 'v3.0.0-rc.1', anotado = true, viejo = MOLDE_VIEJO, despues = [] } = {}) {
  const src = nuevaCarpeta('canon-src');
  git(src, 'init', '-q', '-b', 'main');
  copiar(viejo, path.join(src, 'kit', 'molde'));
  fs.writeFileSync(path.join(src, 'kit', 'VERSION'), '2.9.0\n');
  git(src, 'add', '-A');
  git(src, 'commit', '-q', '-m', 'kit 2.9.0');
  git(src, 'tag', '-a', 'v2.9.0', '-m', 'v2.9.0');
  fs.rmSync(path.join(src, 'kit', 'molde'), { recursive: true, force: true });
  copiar(molde, path.join(src, 'kit', 'molde'));
  fs.writeFileSync(path.join(src, 'kit', 'VERSION'), `${version}\n`);
  git(src, 'add', '-A');
  git(src, 'commit', '-q', '-m', `kit ${version}`);
  if (anotado) git(src, 'tag', '-a', tag, '-m', tag);
  else git(src, 'tag', tag);
  for (const [m, t] of despues) {
    fs.rmSync(path.join(src, 'kit', 'molde'), { recursive: true, force: true });
    copiar(m, path.join(src, 'kit', 'molde'));
    fs.writeFileSync(path.join(src, 'kit', 'VERSION'), `${FL.versionDeTag(t)}\n`);
    git(src, 'add', '-A');
    git(src, 'commit', '-q', '--allow-empty', '-m', `kit ${t}`);
    git(src, 'tag', '-a', t, '-m', t);
  }
  const bare = path.join(nuevaCarpeta('canon'), 'canon.git');
  git(T, 'clone', '-q', '--bare', src, bare);
  return bare;
}

// ---------------------------------------------------------------- los repos: el checkout de Guido y su remoto

const FICHA = (nombre) => fs.readFileSync(path.join(MOLDE, 'hooks', 'lib', 'fabrica', 'ficha.estandar.md'), 'utf8').replace(/\r\n/g, '\n')
  .replace(/^kit: .*$/m, 'kit: 2.9.0')
  .replace(/^ {2}proyecto: proyecto$/m, `  proyecto: ${nombre}\n  comando-test: node prueba.cjs`);

// La plantilla: un proyecto nacido del molde 2.9.0 — cada archivo en su ruta según el catálogo (como armarProyecto de
// actualizar.test.cjs), la ficha de fábrica con sus piezas y hashes, y un comando-test verde. Una vez; cada prueba la copia.
const plantillas = new Map();
function plantillaProyecto(viejo = MOLDE_VIEJO) {
  if (plantillas.has(viejo)) return plantillas.get(viejo);
  const d = nuevaCarpeta('plantilla');
  const mat = M.materializarDir(kitEnDisco(viejo, '2.9.0'), { vars: { proyecto: 'demo' }, fecha: '2026-01-01' });
  const archivos = M.archivosDe(mat.dir);
  const piezas = [];
  for (const [id, { pieza, archivos: as }] of C.repartir(mat.forma, C.rutasDeMolde(mat.dir))) {
    if (['nunca', 'no-viaja'].includes(pieza.trato) || !as.length) continue;
    if (pieza.trato === 'snippet') {
      for (const a of as) fs.appendFileSync(path.join(d, a.proyecto), archivos.get(a.molde));
      continue;
    }
    for (const a of as) {
      const p = path.join(d, ...a.proyecto.split('/'));
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, archivos.get(a.molde));
    }
    if (pieza.clase === C.OPCIONAL) {
      piezas.push(`  ${id}: sí`);
      continue;
    }
    const zona = pieza.forma === 'settings' || (as.length === 1 && Z.zonas(archivos.get(as[0].molde)).zonas.length > 0);
    const est = pieza.trato === 'nacimiento' ? 'molde' : zona ? 'molde+propio' : 'molde';
    const h = as.length === 1 && pieza.trato === 'pieza' ? (pieza.forma === 'texto' ? Z.hashPieza(archivos.get(as[0].molde)) : FI.hash(archivos.get(as[0].molde))) : null;
    piezas.push(`  ${id}: ${h ? `{estado: ${est}, hash: ${h}}` : est}`);
  }
  M.borrar(mat.dir);
  fs.writeFileSync(path.join(d, 'CLAUDE.md'), '# demo\n');
  fs.writeFileSync(path.join(d, 'prueba.cjs'), 'process.exit(0);\n');
  fs.writeFileSync(path.join(d, '.claude', 'kit.md'), FICHA('demo').replace(/^frenos:$/m, `piezas:\n${piezas.join('\n')}\nfrenos:`));
  git(d, 'init', '-q', '-b', 'main');
  git(d, 'config', 'core.autocrlf', 'false');
  git(d, 'add', '-A');
  git(d, 'commit', '-q', '-m', 'nace con el kit 2.9.0');
  plantillas.set(viejo, d);
  return d;
}

// Un repo de la flota: el checkout "de Guido" en <proyectos>/<nombre> y su remoto bare. `remoto(bare)` lo toca antes.
function armarRepo(proyectos, nombre, { remoto, origen, antes, viejo } = {}) {
  const d = path.join(proyectos, nombre);
  fs.cpSync(plantillaProyecto(viejo), d, { recursive: true });
  if (antes) antes(d);
  const bare = path.join(nuevaCarpeta('remotos'), `${nombre}.git`);
  git(T, 'clone', '-q', '--bare', d, bare);
  if (origen !== null) git(d, 'remote', 'add', 'origin', origen || bare);
  if (remoto) remoto(bare);
  return { d, bare, base: git(bare, 'rev-parse', 'refs/heads/main') };
}
// Una rama más en el remoto: un commit sobre main, empujado desde un clon aparte.
function ramaEnRemoto(bare, rama, mensaje = 'obra', vacio = false) {
  const c = path.join(nuevaCarpeta('clon-aux'), 'c');
  git(T, 'clone', '-q', bare, c);
  git(c, 'checkout', '-q', '-b', rama);
  if (vacio) git(c, 'commit', '-q', '--allow-empty', '-m', mensaje);
  else {
    fs.writeFileSync(path.join(c, 'obra.txt'), `${rama}\n`);
    git(c, 'add', '-A');
    git(c, 'commit', '-q', '-m', mensaje);
  }
  git(c, 'push', '-q', 'origin', rama);
}
const ramasKit = (bare) => git(bare, 'for-each-ref', '--format=%(refname)', 'refs/heads/kit').split('\n').filter(Boolean);
const fichaEn = (bare, ref) => git(bare, 'show', `${ref}:.claude/kit.md`);
const fila = (r, repo) => r.filas.find((f) => f.repo === repo);
const correr = (o) => FL.flota({ fecha: FECHA, plazoMs: 120000, claude: 'no', ...o });

// ---------------------------------------------------------------- crit. 15: la flota de punta a punta

test('crit. 15: alfa y beta se mezclan en un commit a main; gama con modulo/x se saltea; ninguna kit/* viva; el checkout de Guido intacto; la segunda vuelta, al día', async () => {
  const canon = armarCanon();
  const P = nuevaCarpeta('proyectos');
  const alfa = armarRepo(P, 'alfa');
  const beta = armarRepo(P, 'beta');
  const gama = armarRepo(P, 'gama', { remoto: (b) => ramaEnRemoto(b, 'modulo/x') });
  const antes = { alfa: foto(alfa.d), beta: foto(beta.d), gama: foto(gama.d) };
  const r = await correr({ repos: ['alfa', 'beta', 'gama'], canon, tag: 'v3.0.0-rc.1', proyectos: P });
  const texto = r.lineas.join('\n');
  assert.equal(r.codigo, 0, texto);
  assert.equal(r.filas.length, 3, texto);
  for (const x of [alfa, beta]) {
    const nombre = path.basename(x.d);
    assert.equal(fila(r, nombre).resultado, 'mezclado', texto);
    assert.equal(`${fila(r, nombre).antes} → ${fila(r, nombre).despues}`, '2.9.0 → 3.0.0');
    assert.equal(git(x.bare, 'rev-list', '--count', `${x.base}..main`), '1', 'un commit a main');
    assert.equal(git(x.bare, 'rev-parse', 'main^'), x.base, 'ff: el padre es el main de antes');
    assert.match(git(x.bare, 'log', '-1', '--format=%s|%an', 'main'), /^kit 2\.9\.0 → 3\.0\.0\|kit-actualizador$/);
    assert.match(fichaEn(x.bare, 'main'), /^kit: 3\.0\.0$/m);
    assert.match(git(x.bare, 'show', 'main:.claude/skills/cierre/SKILL.md'), /Un paso más del molde 3\.0\.0/);
    assert.deepEqual(ramasKit(x.bare), [], 'ninguna kit/* viva');
  }
  assert.equal(fila(r, 'gama').resultado, 'salteado');
  assert.match(fila(r, 'gama').porque, /modulo\/x/);
  assert.equal(git(gama.bare, 'rev-parse', 'main'), gama.base);
  assert.deepEqual(ramasKit(gama.bare), []);
  // la tabla: una fila por repo, columnas fijas, y "te espera: nada"
  assert.match(texto, /^repo +\| antes → después +\| resultado +\| porqué \/ lo que espera$/m);
  for (const x of ['alfa', 'beta', 'gama']) assert.match(texto, new RegExp(`^${x} +\\| `, 'm'));
  assert.match(texto, /^te espera: nada$/m);
  // el checkout de Guido, byte a byte (con .git)
  assert.deepEqual(foto(alfa.d), antes.alfa);
  assert.deepEqual(foto(beta.d), antes.beta);
  assert.deepEqual(foto(gama.d), antes.gama);
  // la segunda vuelta: alfa ya dice 3.0.0
  const r2 = await correr({ repos: [alfa.d], canon, proyectos: P });
  assert.equal(r2.codigo, 0, r2.lineas.join('\n'));
  assert.equal(fila(r2, 'alfa').resultado, 'al día', r2.lineas.join('\n'));
  assert.match(r2.lineas[0], /tag v3\.0\.0-rc\.1/, 'sin --tag: el último v* anotado');
});

// ---------------------------------------------------------------- crit. 16: los casos de falla

test('crit. 16: main protegido (pre-receive) → kit/v3.0.0-rc.1 queda viva y va a "te espera"; las adaptadas, en la fila y en "te espera"', async () => {
  const canon = armarCanon();
  const P = nuevaCarpeta('proyectos');
  const x = armarRepo(P, 'alfa', {
    remoto: (b) => {
      const h = path.join(b, 'hooks', 'pre-receive');
      fs.writeFileSync(h, '#!/bin/sh\nwhile read viejo nuevo ref; do\n  if [ "$ref" = refs/heads/main ]; then echo "main está protegida" >&2; exit 1; fi\ndone\nexit 0\n');
      fs.chmodSync(h, 0o755);
    },
  });
  // aplicar de verdad, más una pieza adaptada que espera (la fusión de verdad, en las pruebas de abajo y en fusion.test.cjs)
  const aplicar = (c, o) => {
    const a = A.aplicar(c, o);
    return { ...a, lineas: [...a.lineas, 'hook-x · adaptada · te espera: sin porqué (ni `por:` en la ficha ni un commit tuyo que la haya cambiado)'] };
  };
  const r = await correr({ repos: ['alfa'], canon, tag: 'v3.0.0-rc.1', proyectos: P, aplicar });
  const texto = r.lineas.join('\n');
  assert.equal(r.codigo, 0, texto);
  const f = fila(r, 'alfa');
  assert.equal(f.resultado, 'te espera', texto);
  assert.match(f.porque, /protegida; mezclá kit\/v3\.0\.0-rc\.1 vos/);
  assert.match(f.porque, /te espera: hook-x/);
  assert.equal(git(x.bare, 'rev-parse', 'main'), x.base, 'main no se movió');
  assert.deepEqual(ramasKit(x.bare), ['refs/heads/kit/v3.0.0-rc.1']);
  assert.equal(git(x.bare, 'rev-parse', 'kit/v3.0.0-rc.1^'), x.base);
  assert.match(texto, /^te espera:$/m);
  assert.match(texto, /^ {2}- alfa: la rama por defecto está protegida; mezclá kit\/v3\.0\.0-rc\.1 en main vos$/m);
  assert.match(texto, /^ {2}- en alfa, la próxima sesión te pregunta por hook-x$/m);
});

test('crit. 16: sin red, sin remoto o el remoto que no existe → sin tocar, y la tabla dice por qué; el resto sigue', async () => {
  const canon = armarCanon();
  const P = nuevaCarpeta('proyectos');
  armarRepo(P, 'nored', { origen: 'https://127.0.0.1:9/nadie/nada.git' });
  armarRepo(P, 'noexiste', { origen: path.join(T, 'no-hay-tal-remoto.git') });
  armarRepo(P, 'sinorigen', { origen: null });
  const bien = armarRepo(P, 'zeta');
  const r = await correr({ repos: ['todo'], canon, proyectos: P });
  const texto = r.lineas.join('\n');
  assert.equal(r.codigo, 0, texto);
  assert.deepEqual(r.filas.map((f) => f.repo), ['noexiste', 'nored', 'sinorigen', 'zeta'], 'todo: los de --proyectos con ficha, en orden');
  for (const nombre of ['nored', 'noexiste']) {
    assert.equal(fila(r, nombre).resultado, 'sin tocar', texto);
    assert.match(fila(r, nombre).porque, /no pude clonar el remoto: \S/);
  }
  assert.match(fila(r, 'sinorigen').porque, /sin remoto/);
  assert.equal(fila(r, 'zeta').resultado, 'mezclado', 'uno que falla no frena a los demás');
  assert.equal(git(bien.bare, 'rev-list', '--count', `${bien.base}..main`), '1');
  assert.match(texto, /^nored +\| — +\| sin tocar +\| no pude clonar/m);
});

test('crit. 16: kit/v3.0.0-rc.1 ya en el remoto → salteado; marcada ROTA → se borra y se rehace sin --force', async () => {
  const canon = armarCanon();
  const P = nuevaCarpeta('proyectos');
  const espera = armarRepo(P, 'espera', { remoto: (b) => ramaEnRemoto(b, 'kit/v3.0.0-rc.1', 'kit 2.9.0 → 3.0.0') });
  const rota = armarRepo(P, 'rota', {
    remoto: (b) => {
      ramaEnRemoto(b, 'kit/v3.0.0-rc.1', 'kit: ROTA — 1. llaves · ❌ · un {{X}} suelto', true);
      git(b, 'config', 'receive.denyNonFastForwards', 'true'); // un --force no pasaría
    },
  });
  const tipEspera = git(espera.bare, 'rev-parse', 'kit/v3.0.0-rc.1');
  const r = await correr({ repos: ['espera', 'rota'], canon, tag: 'v3.0.0-rc.1', proyectos: P });
  const texto = r.lineas.join('\n');
  assert.equal(r.codigo, 0, texto);
  assert.equal(fila(r, 'espera').resultado, 'salteado', texto);
  assert.match(fila(r, 'espera').porque, /kit\/v3\.0\.0-rc\.1 ya está en el remoto: mezclala, o si no la querés, borrala y la próxima corrida la rehace$/);
  assert.equal(git(espera.bare, 'rev-parse', 'kit/v3.0.0-rc.1'), tipEspera);
  assert.equal(git(espera.bare, 'rev-parse', 'main'), espera.base);
  assert.equal(fila(r, 'rota').resultado, 'mezclado', texto);
  assert.match(fila(r, 'rota').porque, /ROTA de antes se borró y se rehizo/);
  assert.deepEqual(ramasKit(rota.bare), [], 'la ROTA se borró y lo nuevo fue a main');
  assert.equal(git(rota.bare, 'rev-list', '--count', `${rota.base}..main`), '1');
});

test('crit. 16: chequear rojo (un molde roto a propósito) → nada a main; kit/v3.0.0-rc.1 queda ROTA con las nueve líneas; sale 1', async () => {
  const canon = armarCanon({ molde: MOLDE_ROTO });
  const P = nuevaCarpeta('proyectos');
  const x = armarRepo(P, 'alfa');
  const r = await correr({ repos: ['alfa'], canon, tag: 'v3.0.0-rc.1', proyectos: P });
  const texto = r.lineas.join('\n');
  assert.equal(r.codigo, 1, texto);
  const f = fila(r, 'alfa');
  assert.equal(f.resultado, 'ROTA', texto);
  assert.match(f.porque, /^1\. llaves · ❌ · /);
  assert.equal(git(x.bare, 'rev-parse', 'main'), x.base, 'nada a main');
  assert.deepEqual(ramasKit(x.bare), ['refs/heads/kit/v3.0.0-rc.1']);
  assert.match(git(x.bare, 'log', '-1', '--format=%s', 'kit/v3.0.0-rc.1'), /^kit: ROTA — 1\. llaves · ❌ · /);
  const cuerpo = git(x.bare, 'log', '-1', '--format=%b', 'kit/v3.0.0-rc.1').split('\n').filter(Boolean);
  assert.equal(cuerpo.length, 9, cuerpo.join('\n'));
  cuerpo.forEach((l, i) => assert.match(l, new RegExp(`^${i + 1}\\. \\S+ · (✅|❌) · `)));
  assert.equal(git(x.bare, 'rev-list', '--count', `${x.base}..kit/v3.0.0-rc.1`), '2', 'el commit del kit y la marca vacía');
  assert.match(texto, /^ {2}- alfa: kit\/v3\.0\.0-rc\.1 quedó ROTA — 1\. llaves/m);
});

test('el canónico: tag no anotado → 1; tag que no coincide con kit/VERSION → 1; tag que no está → 1; sin tocar ningún repo', async () => {
  const P = nuevaCarpeta('proyectos');
  const x = armarRepo(P, 'alfa');
  const liviano = await correr({ repos: ['alfa'], canon: armarCanon({ anotado: false }), tag: 'v3.0.0-rc.1', proyectos: P });
  assert.equal(liviano.codigo, 1);
  assert.match(liviano.lineas.join('\n'), /^flota: el tag v3\.0\.0-rc\.1 no es anotado/);
  const sinTag = await correr({ repos: ['alfa'], canon: armarCanon({ anotado: false }), proyectos: P });
  assert.equal(sinTag.codigo, 0, 'sin --tag, el liviano no cuenta: queda v2.9.0, y alfa ya está en 2.9.0');
  assert.equal(fila(sinTag, 'alfa').resultado, 'al día', sinTag.lineas.join('\n'));
  const distinto = await correr({ repos: ['alfa'], canon: armarCanon({ version: '3.1.0' }), tag: 'v3.0.0-rc.1', proyectos: P });
  assert.equal(distinto.codigo, 1);
  assert.match(distinto.lineas.join('\n'), /no coincide con kit\/VERSION \(3\.1\.0\)/);
  const falta = await correr({ repos: ['alfa'], canon: armarCanon(), tag: 'v9.9.9', proyectos: P });
  assert.equal(falta.codigo, 1);
  assert.match(falta.lineas.join('\n'), /no tiene el tag v9\.9\.9/);
  assert.equal(git(x.bare, 'rev-parse', 'main'), x.base);
  assert.deepEqual(ramasKit(x.bare), []);
});

// ---------------------------------------------------------------- los -rc, la red, el pre-push, ssh y `todo` (RF-fix)

const RC2 = '- Un paso más del molde 3.0.0: mirá que el handoff diga la versión del kit.\n- Y uno del rc.2: mirá también el TODO.';

test('-rc: la rama lleva el tag; el rc.2 entrega aunque la ficha ya diga 3.0.0 y una kit/v3.0.0-rc.1 espere; sin cambios → al día; el final sin -rc saltea por la ficha', async () => {
  const canon = armarCanon({ despues: [[conCierre(RC2), 'v3.0.0-rc.2'], [conCierre(RC2), 'v3.0.0']] });
  const P = nuevaCarpeta('proyectos');
  const x = armarRepo(P, 'alfa', {
    remoto: (b) => {
      const h = path.join(b, 'hooks', 'pre-receive');
      fs.writeFileSync(h, '#!/bin/sh\nwhile read viejo nuevo ref; do\n  if [ "$ref" = refs/heads/main ] && [ -f "$GIT_DIR/protegida" ]; then echo "main está protegida" >&2; exit 1; fi\ndone\nexit 0\n');
      fs.chmodSync(h, 0o755);
      fs.writeFileSync(path.join(b, 'protegida'), '');
    },
  });
  const r1 = await correr({ repos: ['alfa'], canon, tag: 'v3.0.0-rc.1', proyectos: P });
  assert.equal(fila(r1, 'alfa').resultado, 'te espera', r1.lineas.join('\n'));
  assert.deepEqual(ramasKit(x.bare), ['refs/heads/kit/v3.0.0-rc.1']);
  // Guido mezcla el rc.1 a mano y deja la rama; main ya no está protegida
  git(x.bare, 'update-ref', 'refs/heads/main', 'refs/heads/kit/v3.0.0-rc.1');
  fs.rmSync(path.join(x.bare, 'protegida'));
  const r2 = await correr({ repos: ['alfa'], canon, tag: 'v3.0.0-rc.2', proyectos: P });
  const t2 = r2.lineas.join('\n');
  assert.equal(fila(r2, 'alfa').resultado, 'mezclado', t2);
  assert.match(git(x.bare, 'show', 'main:.claude/skills/cierre/SKILL.md'), /Y uno del rc\.2/, 'el rc.2 llegó');
  assert.match(fichaEn(x.bare, 'main'), /^kit: 3\.0\.0$/m);
  const r3 = await correr({ repos: ['alfa'], canon, tag: 'v3.0.0-rc.2', proyectos: P });
  assert.equal(fila(r3, 'alfa').resultado, 'al día', r3.lineas.join('\n'));
  assert.match(fila(r3, 'alfa').porque, /aplicar no cambió nada/);
  const r4 = await correr({ repos: ['alfa'], canon, tag: 'v3.0.0', proyectos: P });
  assert.equal(fila(r4, 'alfa').resultado, 'al día');
  assert.match(fila(r4, 'alfa').porque, /la ficha ya dice 3\.0\.0/, 'sin -rc, la ficha alcanza');
});

// Un aplicar que, además, le cambia algo al clon (la red del push, un pre-push).
const aplicarY = (extra) => (c, o) => {
  const a = A.aplicar(c, o);
  extra(c);
  return a;
};

test('push a main sin red → "sin red: no se tocó el remoto", sin subir kit/v…; con red y rechazado, kit/v… sube (te espera)', async () => {
  const canon = armarCanon();
  const P = nuevaCarpeta('proyectos');
  const x = armarRepo(P, 'alfa');
  const aplicar = aplicarY((c) => git(c, 'remote', 'set-url', '--push', 'origin', 'https://127.0.0.1:9/nadie/nada.git'));
  const r = await correr({ repos: ['alfa'], canon, tag: 'v3.0.0-rc.1', proyectos: P, aplicar });
  const texto = r.lineas.join('\n');
  assert.equal(r.codigo, 0, texto);
  assert.equal(fila(r, 'alfa').resultado, 'sin tocar', texto);
  assert.match(fila(r, 'alfa').porque, /^sin red: no se tocó el remoto \(/);
  assert.deepEqual(ramasKit(x.bare), []);
  assert.equal(git(x.bare, 'rev-parse', 'main'), x.base);
  assert.equal(FL.porqueNoSubio({ colgado: true, err: '' }), 'red');
  assert.equal(FL.porqueNoSubio({ colgado: false, err: 'fatal: unable to access \'https://x/\': Could not resolve host: x' }), 'red');
  assert.equal(FL.porqueNoSubio({ colgado: false, err: ' ! [remote rejected] main -> main (pre-receive hook declined)' }), 'rechazo');
  assert.equal(FL.porqueNoSubio({ colgado: false, err: 'frenado\nerror: failed to push some refs' }), 'local');
});

test('el pre-push frena el push a main → falla (salida 1) con su línea; nada sube', async () => {
  const canon = armarCanon();
  const P = nuevaCarpeta('proyectos');
  const x = armarRepo(P, 'alfa');
  const aplicar = aplicarY((c) => {
    const h = path.join(c, '.git', 'hooks', 'pre-push');
    fs.writeFileSync(h, '#!/bin/sh\necho "frenado por el pre-push" >&2\nexit 1\n');
    fs.chmodSync(h, 0o755);
  });
  const r = await correr({ repos: ['alfa'], canon, tag: 'v3.0.0-rc.1', proyectos: P, aplicar });
  const texto = r.lineas.join('\n');
  assert.equal(r.codigo, 1, texto);
  assert.equal(fila(r, 'alfa').falla, true);
  assert.match(fila(r, 'alfa').porque, /^el push a main no salió \(el pre-push\): frenado por el pre-push/);
  assert.deepEqual(ramasKit(x.bare), []);
  assert.equal(git(x.bare, 'rev-parse', 'main'), x.base);
});

test('entorno: ssh en BatchMode salvo que GIT_SSH_COMMAND ya venga', () => {
  const antes = process.env.GIT_SSH_COMMAND;
  try {
    delete process.env.GIT_SSH_COMMAND;
    assert.equal(FL.entorno().GIT_SSH_COMMAND, 'ssh -o BatchMode=yes');
    process.env.GIT_SSH_COMMAND = 'ssh -i mi-llave';
    assert.equal(FL.entorno().GIT_SSH_COMMAND, 'ssh -i mi-llave');
  } finally {
    if (antes === undefined) delete process.env.GIT_SSH_COMMAND;
    else process.env.GIT_SSH_COMMAND = antes;
  }
});

test('todo: también las carpetas con origin sin ficha en el checkout (atrasado → se actualiza; sin ficha en el clon → "eso es adoptarlo"); sin git ni ficha, no', async () => {
  const canon = armarCanon();
  const P = nuevaCarpeta('proyectos');
  const atrasado = armarRepo(P, 'delta');
  git(atrasado.d, 'rm', '-q', '.claude/kit.md');
  git(atrasado.d, 'commit', '-q', '-m', 'el checkout sin la ficha (el remoto la tiene)');
  const eps = path.join(P, 'eps');
  fs.mkdirSync(eps);
  fs.writeFileSync(path.join(eps, 'leeme.md'), '# sin kit\n');
  git(eps, 'init', '-q', '-b', 'main');
  git(eps, 'add', '-A');
  git(eps, 'commit', '-q', '-m', 'nace');
  const bareEps = path.join(nuevaCarpeta('remotos'), 'eps.git');
  git(T, 'clone', '-q', '--bare', eps, bareEps);
  git(eps, 'remote', 'add', 'origin', bareEps);
  fs.mkdirSync(path.join(P, 'notas'));
  const r = await correr({ repos: ['todo'], canon, proyectos: P });
  const texto = r.lineas.join('\n');
  assert.deepEqual(r.filas.map((f) => f.repo), ['delta', 'eps'], texto);
  assert.equal(fila(r, 'delta').resultado, 'mezclado', texto);
  assert.equal(fila(r, 'eps').resultado, 'sin tocar');
  assert.match(fila(r, 'eps').porque, /sin ficha .*eso es adoptarlo/);
});

// ---------------------------------------------------------------- crit. 18: la fusión de las adaptadas en la flota (D6-19)

// Adapta una pieza en el commit de nacimiento (amend: el cambio NACE con el archivo, así el git log no da porqué) y la marca
// adaptada en la ficha, con `por` o sin él.
const adaptar = (id, rel, cambiar, por) => (d) => {
  const p = path.join(d, ...rel.split('/'));
  fs.writeFileSync(p, cambiar(fs.readFileSync(p, 'utf8')));
  const f = path.join(d, '.claude', 'kit.md');
  fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replace(new RegExp(`^ {2}${id}: .*$`, 'm'), por ? `  ${id}: {estado: adaptada, por: "${por}"}` : `  ${id}: adaptada`));
  git(d, 'add', '-A');
  git(d, 'commit', '-q', '--amend', '--no-edit');
};
const TITULO = '# /cierre — cerrar la sesión (después el chat se descarta)';
const cierreAdaptado = (por) => adaptar('cierre', '.claude/skills/cierre/SKILL.md', (t) => t.replace(TITULO, '# /cierre — cerrar la sesión de este proyecto'), por);

test('crit. 18: con por: la adaptada se fusiona sola y pasa chequear → main; sin porqué → main con .claude/fusiones/<pieza>.md y la pieza vieja', async () => {
  const canon = armarCanon();
  const P = nuevaCarpeta('proyectos');
  const alfa = armarRepo(P, 'alfa', { antes: cierreAdaptado('el título dice de qué proyecto es') });
  const beta = armarRepo(P, 'beta', { antes: cierreAdaptado(null) });
  const r = await correr({ repos: ['alfa', 'beta'], canon, tag: 'v3.0.0-rc.1', proyectos: P });
  const texto = r.lineas.join('\n');
  assert.equal(r.codigo, 0, texto);
  // alfa: el molde nuevo con la adaptación encima, en main, y la fila lo dice
  assert.equal(fila(r, 'alfa').resultado, 'mezclado', texto);
  assert.match(fila(r, 'alfa').porque, /fusionadas: cierre/);
  const cierreA = git(alfa.bare, 'show', 'main:.claude/skills/cierre/SKILL.md');
  assert.match(cierreA, /^# \/cierre — cerrar la sesión de este proyecto$/m);
  assert.match(cierreA, /Un paso más del molde 3\.0\.0/);
  assert.match(fichaEn(alfa.bare, 'main'), /^ {2}cierre: \{estado: adaptada, hash: [0-9a-f]{12}, por: "el título dice de qué proyecto es"\}$/m);
  // beta: el commit llega a main (chequear verde con .claude/fusiones/), la pieza queda vieja y la próxima sesión pregunta
  assert.equal(fila(r, 'beta').resultado, 'mezclado', texto);
  assert.match(fila(r, 'beta').porque, /te espera: cierre/);
  const cierreB = git(beta.bare, 'show', 'main:.claude/skills/cierre/SKILL.md');
  assert.doesNotMatch(cierreB, /Un paso más del molde 3\.0\.0/);
  assert.match(git(beta.bare, 'show', 'main:.claude/fusiones/cierre.md'), /¿la mejoramos con esto\?/);
  assert.match(texto, /^ {2}- en beta, la próxima sesión te pregunta por cierre$/m);
  assert.doesNotMatch(texto, /en alfa, la próxima sesión/);
});

test('crit. 18: una fusión que no pasa chequear (un hook fusionado: no es el molde) no llega a main; la pieza va a "te espera" y el resto se mezcla', async () => {
  const conHook = conCierre('- Un paso más del molde 3.0.0: mirá que el handoff diga la versión del kit.');
  const ph = path.join(conHook, 'hooks', 'escritura-docs.cjs');
  fs.writeFileSync(ph, fs.readFileSync(ph, 'utf8').replace("'use strict';\n", "'use strict';\n// v3.0.0: una línea nueva del molde\n"));
  const canon = armarCanon({ molde: conHook });
  const P = nuevaCarpeta('proyectos');
  const x = armarRepo(P, 'alfa', {
    antes: adaptar('hook-escritura', '.claude/hooks/escritura-docs.cjs', (t) => `${t}// lo nuestro: un renglón al final\n`, 'avisamos distinto'),
  });
  const r = await correr({ repos: ['alfa'], canon, tag: 'v3.0.0-rc.1', proyectos: P });
  const texto = r.lineas.join('\n');
  assert.equal(r.codigo, 0, texto);
  const f = fila(r, 'alfa');
  assert.equal(f.resultado, 'mezclado', texto);
  assert.doesNotMatch(f.porque, /fusionadas:/);
  assert.match(f.porque, /te espera: hook-escritura/);
  assert.equal(git(x.bare, 'rev-list', '--count', `${x.base}..main`), '1', 'un solo commit, el de la segunda vuelta');
  const hook = git(x.bare, 'show', 'main:.claude/hooks/escritura-docs.cjs');
  assert.doesNotMatch(hook, /una línea nueva del molde/, 'lo fusionado no llegó a main');
  assert.match(hook, /lo nuestro: un renglón al final/);
  assert.match(git(x.bare, 'show', 'main:.claude/skills/cierre/SKILL.md'), /Un paso más del molde 3\.0\.0/, 'lo demás, sí');
  assert.match(git(x.bare, 'show', 'main:.claude/fusiones/hook-escritura.md'), /\*\*Por qué no se fusionó sola:\*\* la fusión no pasó chequear: \d\. /);
  assert.deepEqual(ramasKit(x.bare), []);
  assert.match(texto, /^ {2}- en alfa, la próxima sesión te pregunta por hook-escritura$/m);
});

// ---------------------------------------------------------------- D6-6: los githooks del clon, con el runner del molde nuevo

const GITLEAKS = String(process.env[Object.keys(process.env).find((k) => k.toLowerCase() === 'path')] || '').split(path.delimiter)
  .some((d) => d && ['gitleaks', 'gitleaks.exe'].some((x) => fs.existsSync(path.join(d, x))));
const SIN_GITLEAKS = GITLEAKS ? false : 'gitleaks no está en esta PC (el runner del actualizador no commitea sin escáner)';
const conGithooks = (nombre, esDir) => esDir || !nombre.endsWith('.test.cjs');
const MOLDE_GH_VIEJO = nuevaCarpeta('molde-gh-viejo');
copiar(MOLDE, MOLDE_GH_VIEJO, conGithooks);
const MOLDE_GH_NUEVO = nuevaCarpeta('molde-gh-nuevo');
copiar(conCierre('- Un paso más del molde 3.0.0: mirá que el handoff diga la versión del kit.'), MOLDE_GH_NUEVO);
copiar(path.join(MOLDE, 'githooks'), path.join(MOLDE_GH_NUEVO, 'githooks'), conGithooks);
// El .githooks/ del repo con un runner viejo que siempre frena, y la pieza githooks adaptada (aplicar no la reemplaza).
const githooksViejo = adaptar('githooks', '.githooks/kit-githook.cjs', () => "'use strict';\n// un runner viejo: no conoce KIT_MOLDE y siempre frena\nprocess.exit(1);\n", null);

test('D6-6 de punta a punta: un .githooks/ viejo que siempre frena y la pieza githooks adaptada → el commit y el push del kit los juzga el runner del molde nuevo (KIT_MOLDE) y pasan', { skip: SIN_GITLEAKS }, async () => {
  const canon = armarCanon({ molde: MOLDE_GH_NUEVO, viejo: MOLDE_GH_VIEJO });
  const P = nuevaCarpeta('proyectos');
  const x = armarRepo(P, 'alfa', { viejo: MOLDE_GH_VIEJO, antes: githooksViejo });
  const r = await correr({ repos: ['alfa'], canon, tag: 'v3.0.0-rc.1', proyectos: P });
  const texto = r.lineas.join('\n');
  assert.equal(r.codigo, 0, texto);
  assert.equal(fila(r, 'alfa').resultado, 'mezclado', texto);
  assert.equal(git(x.bare, 'rev-list', '--count', `${x.base}..main`), '1');
  assert.match(git(x.bare, 'show', 'main:.githooks/kit-githook.cjs'), /siempre frena/, 'la pieza adaptada no se tocó');
  assert.match(git(x.bare, 'show', 'main:.claude/skills/cierre/SKILL.md'), /Un paso más del molde 3\.0\.0/);
});

test('D6-6: con el runner del molde nuevo, un commit del kit que NO es igual al molde (un hook tocado) sigue dando rojo: nada sube', { skip: SIN_GITLEAKS }, async () => {
  const canon = armarCanon({ molde: MOLDE_GH_NUEVO, viejo: MOLDE_GH_VIEJO });
  const P = nuevaCarpeta('proyectos');
  const x = armarRepo(P, 'alfa', { viejo: MOLDE_GH_VIEJO, antes: githooksViejo });
  const aplicar = (c, o) => {
    const a = A.aplicar(c, o);
    fs.appendFileSync(path.join(c, '.claude', 'hooks', 'escritura-docs.cjs'), '// metido sin aprobado\n');
    return a;
  };
  const r = await correr({ repos: ['alfa'], canon, tag: 'v3.0.0-rc.1', proyectos: P, aplicar });
  const texto = r.lineas.join('\n');
  assert.equal(r.codigo, 1, texto);
  assert.equal(fila(r, 'alfa').resultado, 'sin tocar', texto);
  assert.match(fila(r, 'alfa').porque, /el commit del kit no pasó/);
  assert.equal(git(x.bare, 'rev-parse', 'main'), x.base);
  assert.deepEqual(ramasKit(x.bare), []);
});

test('D6-6 y crit. 18: un hook fusionado que el pre-commit del molde frena (no es el molde) → la rama se rehace sin fusionarlo; va a "te espera" y lo demás se mezcla', { skip: SIN_GITLEAKS }, async () => {
  const nuevo = nuevaCarpeta('molde-gh-hook');
  copiar(MOLDE_GH_NUEVO, nuevo);
  const ph = path.join(nuevo, 'hooks', 'escritura-docs.cjs');
  fs.writeFileSync(ph, fs.readFileSync(ph, 'utf8').replace("'use strict';\n", "'use strict';\n// v3.0.0: una línea nueva del molde\n"));
  const canon = armarCanon({ molde: nuevo, viejo: MOLDE_GH_VIEJO });
  const P = nuevaCarpeta('proyectos');
  const x = armarRepo(P, 'alfa', {
    viejo: MOLDE_GH_VIEJO,
    antes: adaptar('hook-escritura', '.claude/hooks/escritura-docs.cjs', (t) => `${t}// lo nuestro: un renglón al final\n`, 'avisamos distinto'),
  });
  const r = await correr({ repos: ['alfa'], canon, tag: 'v3.0.0-rc.1', proyectos: P });
  const texto = r.lineas.join('\n');
  assert.equal(r.codigo, 0, texto);
  assert.equal(fila(r, 'alfa').resultado, 'mezclado', texto);
  assert.match(fila(r, 'alfa').porque, /te espera: hook-escritura/);
  assert.doesNotMatch(git(x.bare, 'show', 'main:.claude/hooks/escritura-docs.cjs'), /una línea nueva del molde/);
  assert.match(git(x.bare, 'show', 'main:.claude/fusiones/hook-escritura.md'), /\*\*Por qué no se fusionó sola:\*\* la fusión no pasó el commit: /);
});

test('hooksDelMolde: los tres sh del molde, con su saneo, llamando al runner del molde por su ruta; sin runner → null', () => {
  const d = FL.hooksDelMolde(MOLDE_GH_NUEVO, path.join(nuevaCarpeta('gh'), 'hooks'));
  for (const cual of ['pre-commit', 'pre-merge-commit', 'pre-push']) {
    const t = fs.readFileSync(path.join(d, cual), 'utf8');
    const molde = fs.readFileSync(path.join(MOLDE, 'githooks', cual), 'utf8').replace(/\r\n/g, '\n');
    assert.equal(t, molde.replace('node .githooks/kit-githook.cjs', `node "${path.join(MOLDE_GH_NUEVO, 'githooks', 'kit-githook.cjs').replace(/\\/g, '/')}"`));
    assert.match(t, /unset -f env sed command echo/);
  }
  assert.equal(FL.hooksDelMolde(MOLDE_NUEVO, path.join(nuevaCarpeta('gh'), 'hooks')), null);
});

// ---------------------------------------------------------------- las piezas chicas

test('el orden de los tags: -rc.N antes que la versión; el último anotado; uno liviano no cuenta', () => {
  const t = (nombre, tipo = 'tag') => ({ nombre, tipo });
  assert.equal(FL.elegirTag([t('v2.9.0'), t('v3.0.0-rc.2'), t('v3.0.0-rc.10'), t('v2.10.0')]), 'v3.0.0-rc.10');
  assert.equal(FL.elegirTag([t('v3.0.0-rc.1'), t('v3.0.0'), t('v2.99.9')]), 'v3.0.0');
  assert.equal(FL.elegirTag([t('v2.9.0'), t('v3.0.0', 'commit'), t('otro')]), 'v2.9.0');
  assert.throws(() => FL.elegirTag([t('v3.0.0', 'commit')]), /ningún tag v\* anotado/);
  assert.throws(() => FL.elegirTag([t('v3.0.0', 'commit')], 'v3.0.0'), /no es anotado/);
  assert.equal(FL.versionDeTag('v3.0.0-rc.4'), '3.0.0');
});

test('fusionDe, primeraRoja, porqueRechazo, resolverOrigen', () => {
  assert.equal(FL.primeraRoja(['1. llaves · ✅ · bien', '2. arranque · ❌ · 9.800', '3. settings · ❌ · x']), '2. arranque · ❌ · 9.800');
  assert.equal(FL.primeraRoja(['actualizador roto: corré doctor (x)', 'NO VERIFICADO']), 'actualizador roto: corré doctor (x)');
  assert.deepEqual(FL.fusionDe([
    'a · molde · reemplazada', 'b · adaptada · fusionada (sola, el paso · seis)', 'c · adaptada · fusionada (claude)',
    'd · adaptada (desvío detectado) · te espera: sin porqué · desvío: no se tocó (x)', 'e · adaptada · sin cambios', 'b · adaptada · fusionada (claude)',
  ]), { fusionadas: ['b', 'c'], esperan: ['d'] });
  assert.equal(FL.porqueRechazo('! [remote rejected] main -> main (pre-receive hook declined)'), 'la rama por defecto está protegida');
  assert.equal(FL.porqueRechazo(' ! [rejected] main -> main (fetch first)'), 'la rama por defecto se movió mientras actualizaba');
  const d = path.join(T, 'x');
  assert.equal(FL.resolverOrigen('https://github.com/o/r.git', d), 'https://github.com/o/r.git');
  assert.equal(FL.resolverOrigen('git@github.com:o/r.git', d), 'git@github.com:o/r.git');
  assert.equal(FL.resolverOrigen('../remotos/alfa.git', d), path.resolve(d, '../remotos/alfa.git'));
  assert.equal(FL.resolverOrigen('C:/r/alfa.git', d), path.resolve('C:/r/alfa.git'));
});

test('la CLI: sin repos, sin --canon, todo sin --proyectos, un --tag mal formado o una bandera rara → 2 con el USO', () => {
  for (const args of [['flota'], ['flota', 'alfa'], ['flota', '--canon', 'c'], ['flota', 'todo', '--canon', 'c'], ['flota', 'todo', 'alfa', '--canon', 'c', '--proyectos', 'p'], ['flota', 'alfa', '--canon', 'c', '--tag', '3.0.0'], ['flota', 'alfa', '--canon', 'c', '--raro'], ['flota', 'alfa', '--canon', 'c', '--plazo', 'cero'], ['flota', 'alfa', '--canon']]) {
    const r = spawnSync(process.execPath, [path.join(SCRIPTS, 'actualizar.cjs'), ...args], { cwd: T, encoding: 'utf8' });
    assert.equal(r.status, 2, args.join(' '));
    assert.match(r.stderr, /^uso: node actualizar\.cjs aplicar/);
    assert.match(r.stderr, /node actualizar\.cjs flota <repo>… \| todo --canon/);
  }
});

test('la CLI de punta a punta: un canónico que no existe → 1 con su porqué', () => {
  const r = spawnSync(process.execPath, [path.join(SCRIPTS, 'actualizar.cjs'), 'flota', 'alfa', '--canon', path.join(T, 'no-hay-canon.git')], { cwd: T, encoding: 'utf8' });
  assert.equal(r.status, 1, r.stderr);
  assert.match(r.stdout, /^flota: no pude clonar el canónico /);
});

test('sin bypass: flota no nombra bypassPermissions', () => {
  assert.ok(!fs.readFileSync(path.join(__dirname, 'flota.cjs'), 'utf8').includes('bypassPermissions'));
});

test('SPEC-paquete-7 r1-6: flota le dice a aplicar si el tag es -rc (con -rc, aplicar no sube nada al kit)', async () => {
  for (const [tag, rc] of [['v3.0.0-rc.1', true], ['v3.0.0', false]]) {
    const canon = armarCanon({ tag });
    const P = nuevaCarpeta('proyectos');
    armarRepo(P, 'alfa');
    const vistos = [];
    const aplicar = (c, o) => {
      vistos.push(o.rc);
      return A.aplicar(c, o);
    };
    const r = await correr({ repos: ['alfa'], canon, tag, proyectos: P, aplicar });
    assert.equal(fila(r, 'alfa').resultado, 'mezclado', r.lineas.join('\n'));
    assert.ok(vistos.length >= 1);
    assert.ok(vistos.every((v) => v === rc), `${tag}: ${JSON.stringify(vistos)}`);
  }
});

// ---------------------------------------------------------------- RF-fix rf-4: el salto "al día" no deja un ciclo sin cerrar

const CA = require('../../pc/lib/cambios.cjs');
const CLI_CAMBIOS = require(path.join(MOLDE, 'scripts', 'cambios.cjs'));
const CUERPO = '## Caso de origen\nel cierre se olvidaba del handoff (2026-10)\n\n## Regla\nel cierre relee el handoff\n\n## Dónde vive\n.claude/skills/cierre/SKILL.md\n\n## Medición\n| antes | después |\n';
const ZONA = /<!-- kit:propio -->\n[\s\S]*?<!-- \/kit:propio -->/;

// Un cambio a mano en <dir>/.claude/cambios/<id>.md (solo para leerlo: sin git).
function cambioEn(dir, id, campos = {}, cita) {
  const t = CA.ponerCampos(CA.armar({ clase: '2', toca: ['cierre'], origen: cita ? null : 'lo vio el director', cita, cicatriz: 'no', chico: 'sí', urgente: 'no', cuerpo: CUERPO }), campos);
  fs.mkdirSync(path.join(dir, '.claude', 'cambios'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.claude', 'cambios', `${id}.md`), t);
}
function kitConCubiertos(lineas) {
  const k = nuevaCarpeta('kit-cub');
  fs.mkdirSync(path.join(k, 'kit'), { recursive: true });
  fs.writeFileSync(path.join(k, 'kit', 'cubiertos.md'), ['---', 'cubiertos:', ...lineas.map((l) => `  - ${l}`), '---', ''].join('\n'));
  return k;
}

test('RF-fix rf-4: pendienteDeSubir — un aplicado nombrado por id o cita con versión ≤ la nueva; nada más', () => {
  const ID = '2026-10-01-relee-handoff';
  const fichaDemo = { vars: { proyecto: 'demo' } };
  const aplicado = { estado: 'aplicado', sha: 'a'.repeat(40) };
  const repo = (campos, cita) => {
    const d = nuevaCarpeta('pendiente');
    cambioEn(d, ID, campos, cita);
    return d;
  };
  const k = kitConCubiertos;
  const entrada = (cita, v = '3.0.0') => `{cita: "${cita}", version: ${v}, pieza: cierre}`;
  // por id (<vars.proyecto> <id>)
  assert.equal(FL.pendienteDeSubir(repo(aplicado), k([entrada(`demo ${ID}`)]), '3.0.0', fichaDemo), true);
  // versión menor también; mayor (numérica, no de texto) no
  assert.equal(FL.pendienteDeSubir(repo(aplicado), k([entrada(`demo ${ID}`, '2.10.0')]), '3.0.0', fichaDemo), true);
  assert.equal(FL.pendienteDeSubir(repo(aplicado), k([entrada(`demo ${ID}`, '10.0.0')]), '3.0.0', fichaDemo), false);
  assert.equal(FL.pendienteDeSubir(repo(aplicado), k([entrada(`demo ${ID}`, '3.0.1')]), '3.0.0', fichaDemo), false);
  // por cita
  assert.equal(FL.pendienteDeSubir(repo(aplicado, 'hub 2026-09-01-x'), k([entrada('hub 2026-09-01-x')]), '3.0.0', fichaDemo), true);
  // otro alias, otra cita, o sin alias en la ficha: no
  assert.equal(FL.pendienteDeSubir(repo(aplicado), k([entrada(`otro ${ID}`)]), '3.0.0', fichaDemo), false);
  assert.equal(FL.pendienteDeSubir(repo(aplicado, 'hub 2026-09-01-x'), k([entrada('hub 2026-09-01-y')]), '3.0.0', fichaDemo), false);
  assert.equal(FL.pendienteDeSubir(repo(aplicado), k([entrada(`demo ${ID}`)]), '3.0.0', {}), false);
  // un propuesto, o uno que ya subió: no
  assert.equal(FL.pendienteDeSubir(repo({}), k([entrada(`demo ${ID}`)]), '3.0.0', fichaDemo), false);
  assert.equal(FL.pendienteDeSubir(repo({ estado: 'subio-al-kit', sha: 'a'.repeat(40), version: '3.0.0' }), k([entrada(`demo ${ID}`)]), '3.0.0', fichaDemo), false);
  // sin cubiertos.md, o solo con entradas malas: no; una mala no tapa a la buena
  assert.equal(FL.pendienteDeSubir(repo(aplicado), nuevaCarpeta('sin-cub'), '3.0.0', fichaDemo), false);
  assert.equal(FL.pendienteDeSubir(repo(aplicado), k([`{cita: "demo ${ID}", version: 3.0.0}`]), '3.0.0', fichaDemo), false);
  assert.equal(FL.pendienteDeSubir(repo(aplicado), k([`{cita: "demo ${ID}", version: 3.0.0}`, entrada(`demo ${ID}`)]), '3.0.0', fichaDemo), true);
  // sin cambios: no
  assert.equal(FL.pendienteDeSubir(nuevaCarpeta('sin-cambios'), k([entrada(`demo ${ID}`)]), '3.0.0', fichaDemo), false);
});

test('RF-fix rf-4: rc → final — el rc solo "subiría"; el final no saltea por la ficha, el cambio sube con 3.0.0 y la zona se retira', async () => {
  // moldes con la zona del cierre vacía (la del molde real trae texto: ahí (d) diría "zona compartida")
  const vaciar = (dir) => {
    const p = path.join(dir, 'skills', 'cierre', 'SKILL.md');
    fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace(ZONA, '<!-- kit:propio -->\n<!-- /kit:propio -->'));
    return dir;
  };
  const viejo = vaciar(conCierre(''));
  const nuevo = vaciar(conCierre('- Un paso más del molde 3.0.0: mirá que el handoff diga la versión del kit.'));
  let id;
  const P = nuevaCarpeta('proyectos');
  const REL = '.claude/skills/cierre/SKILL.md';
  const x = armarRepo(P, 'alfa', {
    viejo,
    antes: (d) => {
      let out = '';
      const cli = (...args) => {
        const c = CLI_CAMBIOS.main(args, { cwd: d, salida: (s) => (out += s), error: (s) => (out += s), entradaEstandar: () => CUERPO });
        assert.equal(c, 0, `cambios ${args.join(' ')}: ${out}`);
        return out;
      };
      id = /propuesto (\S+)/.exec(cli('nuevo', '--slug', 'relee-handoff', '--clase', '2', '--toca', 'cierre', '--origen', 'lo vio el director'))[1];
      const p = path.join(d, ...REL.split('/'));
      fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace(ZONA, '<!-- kit:propio -->\nreleer el handoff antes de cerrar\n<!-- /kit:propio -->'));
      git(d, 'add', '-A');
      git(d, 'commit', '-q', '-m', `aplica ${id}`);
      cli('anotar-sha', id, git(d, 'rev-parse', 'HEAD'), '--aplico', REL);
      git(d, 'add', '-A');
      git(d, 'commit', '-q', '-m', `cambios: aplicado ${id}`);
    },
  });
  // el canónico: rc.1 y el final con el mismo molde; cubiertos.md nombra el cambio desde el rc
  const src = nuevaCarpeta('canon-src');
  git(src, 'init', '-q', '-b', 'main');
  copiar(viejo, path.join(src, 'kit', 'molde'));
  fs.writeFileSync(path.join(src, 'kit', 'VERSION'), '2.9.0\n');
  git(src, 'add', '-A');
  git(src, 'commit', '-q', '-m', 'kit 2.9.0');
  git(src, 'tag', '-a', 'v2.9.0', '-m', 'v2.9.0');
  fs.rmSync(path.join(src, 'kit', 'molde'), { recursive: true, force: true });
  copiar(nuevo, path.join(src, 'kit', 'molde'));
  fs.writeFileSync(path.join(src, 'kit', 'VERSION'), '3.0.0\n');
  fs.writeFileSync(path.join(src, 'kit', 'cubiertos.md'), `---\ncubiertos:\n  - {cita: "demo ${id}", version: 3.0.0, pieza: cierre}\n---\n`);
  git(src, 'add', '-A');
  git(src, 'commit', '-q', '-m', 'kit 3.0.0-rc.1');
  git(src, 'tag', '-a', 'v3.0.0-rc.1', '-m', 'v3.0.0-rc.1');
  git(src, 'commit', '-q', '--allow-empty', '-m', 'kit 3.0.0');
  git(src, 'tag', '-a', 'v3.0.0', '-m', 'v3.0.0');
  const canon = path.join(nuevaCarpeta('canon'), 'canon.git');
  git(T, 'clone', '-q', '--bare', src, canon);
  const estado = () => CA.leer(git(x.bare, 'show', `main:.claude/cambios/${id}.md`)).datos;

  const r1 = await correr({ repos: ['alfa'], canon, tag: 'v3.0.0-rc.1', proyectos: P });
  assert.equal(fila(r1, 'alfa').resultado, 'mezclado', r1.lineas.join('\n'));
  assert.equal(estado().estado, 'aplicado', 'con el rc, solo "subiría"');
  assert.match(git(x.bare, 'show', `main:${REL}`), /releer el handoff antes de cerrar/);
  assert.match(fichaEn(x.bare, 'main'), /^kit: 3\.0\.0$/m);

  const r2 = await correr({ repos: ['alfa'], canon, tag: 'v3.0.0', proyectos: P });
  const t2 = r2.lineas.join('\n');
  assert.equal(r2.codigo, 0, t2);
  assert.equal(fila(r2, 'alfa').resultado, 'mezclado', `no "al día": tiene un cambio que subir\n${t2}`);
  const e = estado();
  assert.equal(e.estado, 'subio-al-kit', t2);
  assert.equal(e.version, '3.0.0');
  const final = git(x.bare, 'show', `main:${REL}`);
  assert.doesNotMatch(final, /releer el handoff/, 'la zona se retiró');
  assert.match(final, /<!-- kit:propio -->\n<!-- \/kit:propio -->/);
  // la tercera: ya subió, nada pendiente → al día por la ficha
  const r3 = await correr({ repos: ['alfa'], canon, tag: 'v3.0.0', proyectos: P });
  assert.equal(fila(r3, 'alfa').resultado, 'al día', r3.lineas.join('\n'));
  assert.match(fila(r3, 'alfa').porque, /la ficha ya dice 3\.0\.0/);
});
