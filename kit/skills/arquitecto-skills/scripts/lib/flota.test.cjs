'use strict';
// flota.test.cjs — `actualizar.cjs flota` (SPEC-paquete-6 P7.1, D6.2; crit. 15 y 16). Corren con:
//   node --test kit/skills/arquitecto-skills/scripts/lib/flota.test.cjs
// Todo en temporales: el canónico es un bare que arma la prueba (un árbol chico con kit/VERSION y kit/molde/ y sus tags), cada repo
// es un checkout "de Guido" con su remoto bare, y git corre sin la config de la PC. Nunca el origin real, ~/.claude ni ../vibe-kit-pruebas.
// El molde: kit/molde/ real sin sus *.test.cjs y sin githooks/ (el runner lee KIT_MOLDE recién con F2: la prueba de punta a punta
// con los githooks del molde real queda en skip hasta ese merge). El molde nuevo cambia una línea de skills/cierre; el roto, además,
// deja un {{…}} suelto (chequear 1 ❌).
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
function armarCanon({ molde = MOLDE_NUEVO, version = '3.0.0', tag = 'v3.0.0-rc.1', anotado = true } = {}) {
  const src = nuevaCarpeta('canon-src');
  git(src, 'init', '-q', '-b', 'main');
  copiar(MOLDE_VIEJO, path.join(src, 'kit', 'molde'));
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
let plantilla = null;
function plantillaProyecto() {
  if (plantilla) return plantilla;
  const d = nuevaCarpeta('plantilla');
  const mat = M.materializarDir(kitEnDisco(MOLDE_VIEJO, '2.9.0'), { vars: { proyecto: 'demo' }, fecha: '2026-01-01' });
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
  plantilla = d;
  return d;
}

// Un repo de la flota: el checkout "de Guido" en <proyectos>/<nombre> y su remoto bare. `remoto(bare)` lo toca antes.
function armarRepo(proyectos, nombre, { remoto, origen } = {}) {
  const d = path.join(proyectos, nombre);
  fs.cpSync(plantillaProyecto(), d, { recursive: true });
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
const correr = (o) => FL.flota({ fecha: FECHA, plazoMs: 120000, ...o });

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

test('crit. 16: main protegido (pre-receive) → kit/v3.0.0 queda viva y va a "te espera"; las adaptadas, en la fila y en "te espera"', async () => {
  const canon = armarCanon();
  const P = nuevaCarpeta('proyectos');
  const x = armarRepo(P, 'alfa', {
    remoto: (b) => {
      const h = path.join(b, 'hooks', 'pre-receive');
      fs.writeFileSync(h, '#!/bin/sh\nwhile read viejo nuevo ref; do\n  if [ "$ref" = refs/heads/main ]; then echo "main está protegida" >&2; exit 1; fi\ndone\nexit 0\n');
      fs.chmodSync(h, 0o755);
    },
  });
  // aplicar de verdad, más una pieza adaptada informada (la fusión es de F3: acá solo se mira que la fila la diga)
  const aplicar = (c, o) => {
    const a = A.aplicar(c, o);
    return { ...a, lineas: [...a.lineas, 'hook-x · adaptada (desvío detectado) · desvío: no se tocó (.claude/hooks/x.cjs)'] };
  };
  const r = await correr({ repos: ['alfa'], canon, tag: 'v3.0.0-rc.1', proyectos: P, aplicar });
  const texto = r.lineas.join('\n');
  assert.equal(r.codigo, 0, texto);
  const f = fila(r, 'alfa');
  assert.equal(f.resultado, 'te espera', texto);
  assert.match(f.porque, /protegida; mezclá kit\/v3\.0\.0 vos/);
  assert.match(f.porque, /adaptadas: hook-x/);
  assert.equal(git(x.bare, 'rev-parse', 'main'), x.base, 'main no se movió');
  assert.deepEqual(ramasKit(x.bare), ['refs/heads/kit/v3.0.0']);
  assert.equal(git(x.bare, 'rev-parse', 'kit/v3.0.0^'), x.base);
  assert.match(texto, /^te espera:$/m);
  assert.match(texto, /^ {2}- alfa: la rama por defecto está protegida; mezclá kit\/v3\.0\.0 en main vos$/m);
  assert.match(texto, /^ {2}- alfa: piezas adaptadas sin fusionar \(hook-x\)/m);
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

test('crit. 16: kit/v3.0.0 ya en el remoto → salteado; marcada ROTA → se borra y se rehace sin --force', async () => {
  const canon = armarCanon();
  const P = nuevaCarpeta('proyectos');
  const espera = armarRepo(P, 'espera', { remoto: (b) => ramaEnRemoto(b, 'kit/v3.0.0', 'kit 2.9.0 → 3.0.0') });
  const rota = armarRepo(P, 'rota', {
    remoto: (b) => {
      ramaEnRemoto(b, 'kit/v3.0.0', 'kit: ROTA — 1. llaves · ❌ · un {{X}} suelto', true);
      git(b, 'config', 'receive.denyNonFastForwards', 'true'); // un --force no pasaría
    },
  });
  const tipEspera = git(espera.bare, 'rev-parse', 'kit/v3.0.0');
  const r = await correr({ repos: ['espera', 'rota'], canon, tag: 'v3.0.0-rc.1', proyectos: P });
  const texto = r.lineas.join('\n');
  assert.equal(r.codigo, 0, texto);
  assert.equal(fila(r, 'espera').resultado, 'salteado', texto);
  assert.match(fila(r, 'espera').porque, /kit\/v3\.0\.0 ya está en el remoto/);
  assert.equal(git(espera.bare, 'rev-parse', 'kit/v3.0.0'), tipEspera);
  assert.equal(git(espera.bare, 'rev-parse', 'main'), espera.base);
  assert.equal(fila(r, 'rota').resultado, 'mezclado', texto);
  assert.match(fila(r, 'rota').porque, /ROTA de antes se borró y se rehizo/);
  assert.deepEqual(ramasKit(rota.bare), [], 'la ROTA se borró y lo nuevo fue a main');
  assert.equal(git(rota.bare, 'rev-list', '--count', `${rota.base}..main`), '1');
});

test('crit. 16: chequear rojo (un molde roto a propósito) → nada a main; kit/v3.0.0 queda ROTA con las nueve líneas; sale 1', async () => {
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
  assert.deepEqual(ramasKit(x.bare), ['refs/heads/kit/v3.0.0']);
  assert.match(git(x.bare, 'log', '-1', '--format=%s', 'kit/v3.0.0'), /^kit: ROTA — 1\. llaves · ❌ · /);
  const cuerpo = git(x.bare, 'log', '-1', '--format=%b', 'kit/v3.0.0').split('\n').filter(Boolean);
  assert.equal(cuerpo.length, 9, cuerpo.join('\n'));
  cuerpo.forEach((l, i) => assert.match(l, new RegExp(`^${i + 1}\\. \\S+ · (✅|❌) · `)));
  assert.equal(git(x.bare, 'rev-list', '--count', `${x.base}..kit/v3.0.0`), '2', 'el commit del kit y la marca vacía');
  assert.match(texto, /^ {2}- alfa: kit\/v3\.0\.0 quedó ROTA — 1\. llaves/m);
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

test.skip('D6-6, de punta a punta con los githooks del molde real (core.hooksPath en el clon, KIT_MOLDE en el commit y el push) — espera el merge de F2 (kit-githook.cjs lee KIT_MOLDE con .kit-rol = actualizador); lo destraba el director', () => {});

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

test('adaptadasDe, primeraRoja, porqueRechazo, resolverOrigen', () => {
  assert.equal(FL.primeraRoja(['1. llaves · ✅ · bien', '2. arranque · ❌ · 9.800', '3. settings · ❌ · x']), '2. arranque · ❌ · 9.800');
  assert.equal(FL.primeraRoja(['actualizador roto: corré doctor (x)', 'NO VERIFICADO']), 'actualizador roto: corré doctor (x)');
  assert.deepEqual(FL.adaptadasDe(['a · molde · reemplazada', 'b · "adaptada (desvío detectado)" · desvío: no se tocó (x)', 'c · adaptada · adaptada: no fusiona (…)', 'b · adaptada (desvío detectado) · desvío']), ['b', 'c']);
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
