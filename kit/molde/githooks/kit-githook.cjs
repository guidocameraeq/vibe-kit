'use strict';
// kit-githook.cjs — el runner de .githooks/pre-commit, pre-merge-commit y pre-push (SPEC-paquete-3 P4.6; F §10; RT1-7, RT2-4,
// RT2-9; r4-3, rf-7, rf-10; r1-2, r1-6, r1-19). Lo llama el `sh` de tres renglones de cada hook: node .githooks/kit-githook.cjs <cuál> "$@".
//
// pre-commit: gitleaks sobre lo staged; candado:barreras SOLO del índice (lo del disco sin `git add` no traba, rf-10); el hook previo.
// pre-merge-commit (un merge automático no corre pre-commit): gitleaks y el previo, SIN candado (rf3-1): git no escribe MERGE_HEAD
// antes de este hook, así que el candado juzgaría el merge solo contra HEAD y frenaría lo aprobado en la otra rama; el merge lo
// juzga el pre-push, contra cada padre. (Un merge con conflictos se cierra con git commit: ahí corre el pre-commit, con MERGE_HEAD.)
// pre-push: por cada ref que sube, lo que el remoto no tiene
// (`<remoto>..<local>`, o para una ref nueva `<ceros>..<local>`: lo que ningún remoto tiene): gitleaks y `barreras --rango` (rf-7).
// El candado corre DOS veces (r4-3, r1-2 a): la versión de la ref vigente (con remoto origin/<rama por defecto>; sin remoto la rama
// local), sacada con UN `git cat-file --batch` a un temporal fuera del repo y corrida con el cwd en el repo, y la del disco. Rojo si
// cualquiera da rojo. La ref sin ficha (nunca tuvo kit): solo la del disco, y lo dice. La ref con ficha y sin candado, o el de la ref
// que sale 2 por otra cosa que "no conoce --indice/--rango", rojo. Si no conoce la bandera (es del orden 2): sin ella, y lo dice.
// gitleaks: plazo de 60 s y un reintento (47 s en frío con Defender, r1-6, r2-10); dos veces colgado = "sin escáner (colgado)". Sin
// escáner: humano, director y obrero pasan EN ROJO (con aviso y renglón); nocturno, actualizador y desconocido → 1.
// gitleaks lee su configuración del disco (.gitleaks.toml, .gitleaksignore) y de GITLEAKS_*: el entorno sale sin GITLEAKS_* y,
// si el del disco no es el que se juzga (el del índice; en el pre-push, el de lo que sube), rojo (rf3-2).
// Entorno (rf3-3): el sh borra toda NODE_* antes de llamar a node (NODE_OPTIONS="--require x" corre antes que el runner), y el runner
// saca NODE_* y GITLEAKS_* del entorno de todo lo que lanza (git, los dos candados, gitleaks y el previo).
// frenos.log (rf3-6): lo que el hook agrega en un pase (aunque pase en rojo) se muda a <git-common-dir>/kit-frenos.log, sin
// versionar: un pase no ensucia el árbol. Solo un 1 deja su renglón en .claude/frenos.log.
// Todo error del runner → 1 con motivo (r1-19). Lo que imprime: `archivo:línea` y la regla; NUNCA un valor ni la salida de gitleaks.
// El runner corre del disco (D-12): solo necesita node y git; las librerías del kit las usa la versión del candado que corre.
// Node estándar, cero dependencias. Es .cjs a propósito: corre igual en proyectos con "type": "module".

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const CUALES = Object.freeze(['pre-commit', 'pre-merge-commit', 'pre-push']);
const PLAZO_GITLEAKS = 60000;
const REINTENTOS_GITLEAKS = 1;
const ROLES_PASAN_SIN_ESCANER = Object.freeze(['humano', 'director', 'obrero']);
const ROLES = ['director', 'obrero', 'nocturno', 'actualizador'];
const RUTA_FICHA = '.claude/kit.md';
const RUTA_ESTRUCTURA = '.claude/scripts/estructura.cjs';
// Lo que hace falta para correr la versión de la ref: el script y sus librerías (las fichas de fábrica incluidas).
const RUTAS_CANDADO = Object.freeze([RUTA_ESTRUCTURA, '.claude/hooks/lib']);
const RUTA_FRENOS_LOG = '.claude/frenos.log';
// Las rutas de barrera (las categorías de cambios.categoriaDe), para ver si un índice aparte (commit -a, commit <rutas>) las cambia.
const RUTAS_BARRERA = Object.freeze([
  RUTA_FICHA,
  '.claude/settings*.json',
  '.claude/hooks',
  '.claude/scripts/estructura.cjs',
  '.claude/scripts/cambios.cjs',
  '.githooks',
  '.gitleaksignore',
  '.gitleaks.toml',
]);
const SIN_ESCANER = '⚠️ sin escáner en esta PC: corré "preparame esta PC"';
const ROTO = 'error interno — corré doctor';
const CEROS = /^0+$/;
const RE_SHA = /^[0-9a-f]{40}([0-9a-f]{24})?$/;
// Variables que, heredadas del hook, hacen que git mire otro repo que el del cwd (las de lib/git.cjs). El índice no: es el del commit.
const DESVIAN = ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_COMMON_DIR', 'GIT_PREFIX', 'GIT_OBJECT_DIRECTORY', 'GIT_ALTERNATE_OBJECT_DIRECTORIES', 'GIT_NAMESPACE', 'GIT_CEILING_DIRECTORIES'];
// rf3-3 y rf3-2: las que meten código en un node (NODE_OPTIONS --require, NODE_PATH…) o cambian lo que gitleaks busca
// (GITLEAKS_CONFIG, GITLEAKS_CONFIG_TOML…). Sin distinguir mayúsculas: en Windows node_options vale como NODE_OPTIONS.
const INYECTAN = /^(node|gitleaks)_/i;
// La configuración de gitleaks que lee del disco, del cwd (rf3-2): tiene que ser la que se juzga.
const CONFIG_GITLEAKS = Object.freeze(['.gitleaks.toml', '.gitleaksignore']);
const LOG_SIN_VERSIONAR = 'kit-frenos.log';

class Falla extends Error {}
const falla = (m) => {
  throw new Falla(m);
};

// ---------------------------------------------------------------- git

// El entorno sin lo que inyecta (INYECTAN): el de todo lo que el runner lanza.
function sinInyectadas(env) {
  const e = {};
  for (const [k, v] of Object.entries(env)) if (!INYECTAN.test(k)) e[k] = v;
  return e;
}
function entornoGit(env, conIndice) {
  const e = { ...env };
  for (const v of DESVIAN) delete e[v];
  if (!conIndice) delete e.GIT_INDEX_FILE;
  e.GIT_TERMINAL_PROMPT = '0';
  return e;
}
// git(args, {cwd, env, entrada, indice}) → { ok, codigo, stdout (texto), salida (Buffer), stderr }. Tira (Falla) si git no corre.
function git(args, o) {
  const r = spawnSync('git', args, {
    cwd: o.cwd,
    env: entornoGit(o.env, o.indice),
    input: o.entrada,
    windowsHide: true,
    maxBuffer: 256 * 1024 * 1024,
    timeout: 120000,
  });
  if (r.error) falla(r.error.code === 'ENOENT' ? 'no hay git en esta PC' : `git ${args[0]} no corrió (${r.error.code || r.error.message})`);
  const salida = r.stdout || Buffer.alloc(0);
  return { ok: r.status === 0, codigo: r.status, salida, stdout: salida.toString('utf8'), stderr: r.stderr ? r.stderr.toString('utf8') : '' };
}
const gitTexto = (args, o) => {
  const r = git(args, o);
  return r.ok ? r.stdout.replace(/\s+$/, '') : null;
};
const existeCommit = (sha, o) => git(['cat-file', '-e', `${sha}^{commit}`], o).ok;
const existeBlob = (ref, rel, o) => git(['cat-file', '-e', `${ref}:${rel}`], o).ok;

// ---------------------------------------------------------------- dónde estamos (sin las librerías del kit: el runner es autónomo)

function datosRepo(cwd, env) {
  const t = gitTexto(['rev-parse', '--path-format=absolute', '--show-toplevel', '--git-dir', '--git-common-dir'], { cwd, env });
  if (!t) falla('no estoy dentro de un repo git');
  const [raiz, gitDir, gitComun] = t.split('\n').map((s) => path.resolve(s.trim()));
  return { raiz, gitDir, gitComun };
}

// El rol, como contexto.rol: sin .kit-rol, humano; uno de los cuatro, tal cual; otra cosa (o ilegible), desconocido.
function rolDe(raiz) {
  let t;
  try {
    t = fs.readFileSync(path.join(raiz, '.kit-rol'), 'utf8');
  } catch (e) {
    return e && e.code === 'ENOENT' ? 'humano' : 'desconocido';
  }
  t = t.replace(/^﻿/, '').trim();
  return ROLES.includes(t) ? t : 'desconocido';
}

// La ref vigente, como contexto.refVigente (regla de 4.7): origin/HEAD si apunta a una candidata; si no origin/<candidata>; sin
// remoto (o sin ninguna en origin), la rama local. Candidatas: init.defaultBranch (si no es modulo/* ni worktree-*), main, master.
function refVigente(o) {
  const cands = [];
  const conf = gitTexto(['config', '--get', 'init.defaultBranch'], o);
  if (conf && conf.trim() && !/^(modulo\/|worktree-)/i.test(conf.trim())) cands.push(conf.trim());
  for (const n of ['main', 'master']) if (!cands.includes(n)) cands.push(n);
  const remotos = (gitTexto(['remote'], o) || '').split('\n').map((s) => s.trim());
  if (remotos.includes('origin')) {
    const head = gitTexto(['symbolic-ref', '-q', 'refs/remotes/origin/HEAD'], o);
    if (head && head.startsWith('refs/remotes/origin/')) {
      const apunta = head.slice('refs/remotes/origin/'.length);
      if (cands.includes(apunta) && existeCommit(`refs/remotes/origin/${apunta}`, o)) return { nombre: `origin/${apunta}`, ref: `refs/remotes/origin/${apunta}` };
    }
    for (const n of cands) if (existeCommit(`refs/remotes/origin/${n}`, o)) return { nombre: `origin/${n}`, ref: `refs/remotes/origin/${n}` };
  }
  for (const n of cands) if (existeCommit(`refs/heads/${n}`, o)) return { nombre: n, ref: `refs/heads/${n}` };
  return null;
}

// ---------------------------------------------------------------- el renglón de frenos.log (formato de D2.1; la librería del disco)

function anotar(raiz, rol, cual, id, detalle, o) {
  try {
    const lib = path.join(raiz, '.claude', 'hooks', 'lib', 'frenos-log.cjs');
    if (!fs.existsSync(lib)) return;
    const rama = gitTexto(['symbolic-ref', '--short', '-q', 'HEAD'], o);
    require(lib).anotar(raiz, { id, herramienta: cual, detalle, rol, rama }, o.ahora || new Date());
  } catch (e) {
    /* el renglón es rastro, no freno: sin él, la salida igual dice lo que pasó */
  }
}

// rf3-6: frenos.log está versionado; si un pase le agrega renglones (el sin-escaner del runner, la ficha rota de los candados), el
// árbol queda sucio (pull --rebase falla, worktree remove también). Se saca una foto al empezar y, si el hook pasa, lo agregado se
// muda a <git-common-dir>/kit-frenos.log (sin versionar; el común, para que sobreviva a un worktree remove) y frenos.log vuelve a
// como estaba. Solo lo agregado al final: si alguien lo reescribió en el medio, no se toca.
function fotoLog(raiz) {
  const archivo = path.join(raiz, ...RUTA_FRENOS_LOG.split('/'));
  try {
    return { archivo, antes: fs.readFileSync(archivo) };
  } catch (e) {
    return { archivo, antes: null };
  }
}
function mudarLoDelPase(foto, gitComun) {
  try {
    let ahora;
    try {
      ahora = fs.readFileSync(foto.archivo);
    } catch (e) {
      return;
    }
    const antes = foto.antes || Buffer.alloc(0);
    if (ahora.length <= antes.length || !ahora.subarray(0, antes.length).equals(antes)) return;
    const nuevo = ahora.subarray(antes.length).toString('utf8').replace(/^\n/, '');
    fs.appendFileSync(path.join(gitComun, LOG_SIN_VERSIONAR), nuevo);
    if (foto.antes === null) fs.rmSync(foto.archivo);
    else fs.writeFileSync(foto.archivo, foto.antes);
  } catch (e) {
    /* rastro, no freno */
  }
}

// rf3-2: gitleaks lee .gitleaks.toml y .gitleaksignore del disco (del cwd, aunque se le pase otra ruta). Si el del disco no es el
// que se juzga (ref = '' para el índice del commit; si no, el commit que sube), un toml sin reglas sin `git add` lo apaga. → la
// primera ruta distinta, o null.
function configDistinta(ref, o) {
  for (const rel of CONFIG_GITLEAKS) {
    const enDisco = fs.existsSync(path.join(o.raiz, rel)) ? gitTexto(['hash-object', '--', rel], o) : null;
    const juzgado = gitTexto(['rev-parse', '-q', '--verify', `${ref}:${rel}`], { ...o, indice: ref === '' });
    if (enDisco !== juzgado) return rel;
  }
  return null;
}

// ---------------------------------------------------------------- gitleaks

// El ejecutable, buscado en el PATH (no se corre para buscarlo). null si no está.
function buscarGitleaks(env) {
  const clave = Object.keys(env).find((k) => k.toLowerCase() === 'path');
  const dirs = clave ? String(env[clave]).split(path.delimiter).filter(Boolean) : [];
  const nombres = process.platform === 'win32' ? ['gitleaks.exe'] : ['gitleaks'];
  for (const d of dirs) {
    for (const n of nombres) {
      const p = path.join(d.replace(/^"|"$/g, ''), n);
      try {
        if (fs.statSync(p).isFile()) return p;
      } catch (e) {
        /* acá no está */
      }
    }
  }
  return null;
}

// Los hallazgos del reporte JSON: [{archivo, linea, regla, commit}] (nunca el valor). null si el reporte no se lee.
function leerReporte(archivo) {
  let j;
  try {
    j = JSON.parse(fs.readFileSync(archivo, 'utf8').replace(/^﻿/, ''));
  } catch (e) {
    return null;
  }
  if (!Array.isArray(j)) return null;
  return j.map((h) => ({
    archivo: typeof h.File === 'string' ? h.File.replace(/\\/g, '/') : '?',
    linea: Number.isInteger(h.StartLine) ? h.StartLine : '?',
    regla: typeof h.RuleID === 'string' ? h.RuleID.replace(/[^\w.:-]/g, '') : '?',
    commit: typeof h.Commit === 'string' && RE_SHA.test(h.Commit) ? h.Commit : null,
  }));
}

// correrGitleaks(args, {raiz, env, tmp, plazo, reintentos, gitleaks}) → { estado: 'verde' } · { estado: 'rojo', hallazgos } ·
// { estado: 'sin-escaner', por: 'no está' | 'colgado' }. Tira (Falla) si corre y no sale ni 0 ni 1 con reporte.
function correrGitleaks(args, o) {
  const exe = o.gitleaks === undefined ? buscarGitleaks(o.env) : o.gitleaks;
  if (!exe) return { estado: 'sin-escaner', por: 'no está' };
  const intentos = 1 + (Number.isInteger(o.reintentos) ? o.reintentos : REINTENTOS_GITLEAKS);
  for (let i = 0; i < intentos; i++) {
    const reporte = path.join(o.tmp, `gitleaks-${i}-${process.pid}.json`);
    const r = spawnSync(exe, [...args, '--redact', '--no-banner', '--report-format', 'json', '--report-path', reporte], {
      cwd: o.raiz,
      env: o.env, // con GIT_INDEX_FILE: --staged mira el índice del commit (también el de commit -a)
      windowsHide: true,
      timeout: o.plazo || PLAZO_GITLEAKS,
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'], // su salida no se muestra: el runner dice archivo:línea y la regla
    });
    if ((r.error && r.error.code === 'ETIMEDOUT') || (r.signal && !r.error)) continue;
    if (r.error && r.error.code === 'ENOENT') return { estado: 'sin-escaner', por: 'no está' };
    if (r.error) falla(`gitleaks no corrió (${r.error.code || r.error.message})`);
    if (r.status === 0) return { estado: 'verde' };
    const hallazgos = r.status === 1 ? leerReporte(reporte) : null;
    if (hallazgos && hallazgos.length) return { estado: 'rojo', hallazgos };
    falla(`gitleaks salió con ${r.status} sin hallazgos que se lean (¿versión vieja? hace falta ≥ 8.19)`);
  }
  return { estado: 'sin-escaner', por: 'colgado' };
}

// ---------------------------------------------------------------- el candado (dos versiones)

// Saca la versión de la ref del candado a <tmp>/ref/ con UN `git cat-file --batch`. → la ruta del estructura.cjs, o null si la ref no lo trae.
function extraerCandado(ref, o) {
  const ls = git(['ls-tree', '-r', '-z', ref, '--', ...RUTAS_CANDADO], o);
  if (!ls.ok) falla(`no pude listar el candado de ${ref}`);
  const blobs = [];
  for (const e of ls.stdout.split('\0')) {
    const m = /^\d+ blob ([0-9a-f]+)\t(.+)$/s.exec(e);
    if (m) blobs.push({ sha: m[1], rel: m[2] });
  }
  if (!blobs.some((b) => b.rel === RUTA_ESTRUCTURA)) return null;
  const r = git(['cat-file', '--batch'], { ...o, entrada: blobs.map((b) => b.sha).join('\n') + '\n' });
  if (!r.ok) falla(`no pude sacar el candado de ${ref}`);
  const b = r.salida;
  let p = 0;
  const base = path.join(o.tmp, 'ref');
  for (const x of blobs) {
    const fin = b.indexOf(0x0a, p);
    const cab = b.subarray(p, fin).toString('utf8').split(' ');
    if (fin < 0 || cab[0] !== x.sha || cab[1] !== 'blob') falla(`el candado de ${ref} no salió entero de git cat-file`);
    const largo = Number(cab[2]);
    const destino = path.join(base, ...x.rel.split('/'));
    if (!destino.startsWith(base + path.sep)) falla(`una ruta rara en el candado de ${ref}`);
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.writeFileSync(destino, b.subarray(fin + 1, fin + 1 + largo));
    p = fin + 1 + largo + 1;
  }
  return path.join(base, ...RUTA_ESTRUCTURA.split('/'));
}

// Corre un estructura.cjs con el cwd en el repo. → { codigo, lineas (stdout), err (stderr) }.
function correrEstructura(script, args, o) {
  const r = spawnSync(process.execPath, [script, 'barreras', ...args], {
    cwd: o.raiz,
    env: entornoGit(o.env, false),
    windowsHide: true,
    encoding: 'utf8',
    timeout: 600000,
    maxBuffer: 16 * 1024 * 1024,
  });
  if (r.error) falla(`el candado no corrió (${r.error.code || r.error.message})`);
  const lineas = (r.stdout || '').split('\n').map((l) => l.replace(/\s+$/, '')).filter(Boolean);
  return { codigo: r.status, lineas, err: (r.stderr || '').trim() };
}

const noConoce = (err, bandera) => new RegExp(`Argumento desconocido: ${bandera}\\b`).test(err);

// candado(bandera, valor, o) → { rojo, lineas }. bandera: '--indice' (valor null) o '--rango' (valor 'a..b').
function candado(bandera, valor, o) {
  const lineas = [];
  let rojo = false;
  const args = valor === null ? [bandera] : [bandera, valor];
  const rv = refVigente(o);
  const fichaRef = !!rv && existeBlob(rv.ref, RUTA_FICHA, o);
  const disco = path.join(o.raiz, ...RUTA_ESTRUCTURA.split('/'));
  const hayDisco = fs.existsSync(disco);

  // 1 · la versión de la ref vigente
  if (!rv) lineas.push('candado de la rama por defecto: no hay rama por defecto todavía — corrió solo el del disco');
  else if (!fichaRef) lineas.push(`candado de ${rv.nombre}: no tiene ficha (nunca tuvo kit) — corrió solo el del disco`);
  else {
    const script = extraerCandado(rv.ref, o);
    if (!script) {
      rojo = true;
      lineas.push(`candado de ${rv.nombre}: tiene ficha y no tiene ${RUTA_ESTRUCTURA} — así no se juzga lo que sube · corré doctor`);
    } else {
      let r = correrEstructura(script, args, o);
      let quien = `candado de ${rv.nombre}`;
      if (r.codigo === 2 && noConoce(r.err, bandera)) {
        r = correrEstructura(script, [], o);
        quien += ` (no conoce ${bandera}: es del orden 2; corrió sin él)`;
      }
      if (juzgar(quien, r, lineas)) rojo = true;
    }
  }

  // 2 · la del disco
  if (!hayDisco) {
    const fichaAca = fs.existsSync(path.join(o.raiz, ...RUTA_FICHA.split('/'))) || existeBlob('', RUTA_FICHA, o) || existeBlob('HEAD', RUTA_FICHA, o);
    if (fichaRef || fichaAca) {
      rojo = true;
      lineas.push(`candado del disco: falta ${RUTA_ESTRUCTURA} y hay ficha — reponelo (corré doctor)`);
    } else if (!fichaRef) lineas.push('candado del disco: no hay kit en este repo (sin ficha ni candado)');
  } else {
    if (juzgar('candado del disco', correrEstructura(disco, args, o), lineas)) rojo = true;
  }
  return { rojo, lineas };
}

// Lo que dijo una corrida del candado, con quién lo dijo adelante. → true si es rojo: 1, o cualquier otra salida que no sea 0.
function juzgar(quien, r, lineas) {
  if (r.codigo === 0 || r.codigo === 1) {
    lineas.push(...(r.lineas.length ? r.lineas : ['(no dijo nada)']).map((l) => `${quien}: ${l}`));
    return r.codigo === 1;
  }
  lineas.push(`${quien}: salió con ${r.codigo === null ? 'nada (lo cortaron)' : r.codigo} — ${(r.err.split('\n')[0] || 'sin motivo').slice(0, 200)}`);
  return true;
}

// commit -a y commit <rutas> commitean desde un índice aparte (GIT_INDEX_FILE = index.lock o next-index-*.lock), y el candado lee el
// índice de siempre: si los dos difieren en una ruta de barrera, el candado no vería lo que de verdad se commitea. → la ruta o null.
function indiceAparte(o) {
  const idx = o.env.GIT_INDEX_FILE;
  if (!idx) return null;
  if (path.resolve(o.raiz, idx) === path.resolve(o.gitDir, 'index')) return null;
  const ls = (conIndice) => git(['--icase-pathspecs', 'ls-files', '-s', '-z', '--', ...RUTAS_BARRERA], { ...o, indice: conIndice });
  const a = ls(true);
  const b = ls(false);
  if (!a.ok || !b.ok) falla('no pude comparar el índice del commit con el de siempre');
  if (a.stdout === b.stdout) return null;
  const partir = (t) => new Set(t.split('\0').filter(Boolean));
  const A = partir(a.stdout);
  const B = partir(b.stdout);
  const distinta = [...A].find((x) => !B.has(x)) || [...B].find((x) => !A.has(x));
  return distinta ? distinta.replace(/^\d+ [0-9a-f]+ \d+\t/, '') : '?';
}

// ---------------------------------------------------------------- el hook previo (husky, lefthook o el de .git/hooks)

function correrPrevio(cual, args, stdin, o) {
  const conf = gitTexto(['config', '--get', 'kit.hooksPathPrevio'], o);
  const dir = conf ? path.resolve(o.raiz, conf) : path.join(o.gitComun, 'hooks');
  const archivo = path.join(dir, cual);
  if (path.resolve(archivo) === path.resolve(o.raiz, '.githooks', cual)) return null; // no encadenarse a sí mismo
  let st;
  try {
    st = fs.statSync(archivo);
  } catch (e) {
    return null;
  }
  if (!st.isFile()) return null;
  let cabeza = '';
  try {
    const fd = fs.openSync(archivo, 'r');
    const b = Buffer.alloc(2);
    fs.readSync(fd, b, 0, 2, 0);
    fs.closeSync(fd);
    cabeza = b.toString('latin1');
  } catch (e) {
    falla(`no pude leer el hook previo ${archivo}`);
  }
  const [exe, argv] = cabeza === '#!' ? ['sh', [archivo.split(path.sep).join('/'), ...args]] : [archivo, args];
  const r = spawnSync(exe, argv, { cwd: o.raiz, env: o.env, input: stdin, windowsHide: true, encoding: 'utf8', timeout: 600000, maxBuffer: 16 * 1024 * 1024 });
  if (r.error) falla(r.error.code === 'ENOENT' ? `no hay ${exe === 'sh' ? 'sh' : 'cómo correr'} el hook previo ${archivo}` : `el hook previo ${archivo} no corrió (${r.error.code})`);
  const rel = path.relative(o.raiz, archivo).split(path.sep).join('/');
  return { codigo: r.status, ruta: rel && !rel.startsWith('..') ? rel : archivo, salida: `${r.stdout || ''}${r.stderr || ''}` };
}

// ---------------------------------------------------------------- pre-push: lo que sube

// Las líneas que git le da al pre-push por stdin: <ref local> <sha local> <ref remota> <sha remoto>. → [{...}] (sin los borrados).
function refsQueSuben(stdin) {
  const out = [];
  for (const l of String(stdin || '').split(/\r?\n/)) {
    if (!l.trim()) continue;
    const p = l.trim().split(/\s+/);
    if (p.length !== 4 || !RE_SHA.test(p[1]) || !RE_SHA.test(p[3])) falla('el pre-push recibió una línea que no entiendo');
    if (CEROS.test(p[1])) continue; // borrar una ref remota no sube nada (git-seguro decide si se puede)
    out.push({ refLocal: p[0], local: p[1], refRemota: p[2], remoto: p[3], nueva: CEROS.test(p[3]) });
  }
  return out;
}

// ---------------------------------------------------------------- el hook entero

// principal(argv, {cwd, env, stdin (el del pre-push), plazoGitleaks, reintentos, gitleaks, ahora}) → { codigo, lineas }. No imprime: lo hace el CLI.
function principal(argv, opciones = {}) {
  const cual = argv[0];
  const args = argv.slice(1);
  if (!CUALES.includes(cual)) falla(`no sé qué hook es "${String(cual).slice(0, 40)}" (los que hay: ${CUALES.join(', ')})`);
  const env = sinInyectadas(opciones.env || process.env);
  const cwd = opciones.cwd || process.cwd();
  const repo = datosRepo(cwd, env);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-githook-'));
  const o = { ...repo, cwd: repo.raiz, env, tmp, ahora: opciones.ahora, plazo: opciones.plazoGitleaks, reintentos: opciones.reintentos };
  o.gitleaks = opciones.gitleaks === undefined ? buscarGitleaks(env) : opciones.gitleaks;
  const foto = fotoLog(repo.raiz);
  try {
    const stdin = cual === 'pre-push' ? (opciones.stdin !== undefined ? opciones.stdin : leerStdin()) : undefined;
    const rol = rolDe(repo.raiz);
    const lineas = [];
    let rojo = false;
    const sinEscaner = (por) => {
      anotar(repo.raiz, rol, cual, 'githook:sin-escaner', por, o);
      if (ROLES_PASAN_SIN_ESCANER.includes(rol)) lineas.push(`${SIN_ESCANER} (${por}) — pasa por ser ${rol}, en rojo`);
      else {
        rojo = true;
        lineas.push(`${SIN_ESCANER} (${por}) — con rol ${rol} no se ${cual === 'pre-push' ? 'pushea' : 'commitea'} sin escáner`);
      }
    };
    const hallazgos = (hs, donde) => {
      rojo = true;
      anotar(repo.raiz, rol, cual, 'githook:gitleaks', hs[0].archivo, o);
      for (const h of hs.slice(0, 20)) lineas.push(`gitleaks: ${h.regla} en ${h.archivo}:${h.linea}${h.commit ? ` (commit ${h.commit.slice(0, 12)})` : ''}${donde}`);
      if (hs.length > 20) lineas.push(`gitleaks: y ${hs.length - 20} más`);
      lineas.push('gitleaks: sacá el valor (pedile al humano cargar-secreto NOMBRE); si ya se commiteó, rotalo. Falsa alarma → .gitleaksignore, con aprobado');
    };

    // gitleaks, si la config del disco es la que se juzga (rf3-2). → false si no hay escáner (no se vuelve a probar). En el pre-push,
    // rango: si no sube ningún commit (una etiqueta vieja), no hay qué escanear y la config no importa.
    const escanear = (argsGitleaks, refConfig, donde, rango) => {
      const hayCommits = () => {
        const r = git(['rev-list', '-n', '1', ...rango], o);
        return !r.ok || r.stdout.trim() !== '';
      };
      if (o.gitleaks && (!rango || hayCommits())) {
        const distinta = configDistinta(refConfig, o);
        if (distinta) {
          rojo = true;
          anotar(repo.raiz, rol, cual, 'githook:config-gitleaks', distinta, o);
          lineas.push(
            refConfig === ''
              ? `gitleaks: el ${distinta} del disco no es el que lleva este commit, y gitleaks lo lee del disco — hacé git add (o git restore) y volvé a commitear`
              : `gitleaks: el ${distinta} del disco no es el de lo que sube, y gitleaks lo lee del disco — commitealo (o git restore), o pusheá desde esa rama${donde}`
          );
          return true;
        }
      }
      const g = correrGitleaks(argsGitleaks, o);
      if (g.estado === 'sin-escaner') {
        sinEscaner(g.por);
        return false;
      }
      if (g.estado === 'rojo') hallazgos(g.hallazgos, donde);
      return true;
    };

    if (cual === 'pre-push') {
      const head = gitTexto(['rev-parse', '-q', '--verify', 'HEAD^{commit}'], o);
      const refs = refsQueSuben(stdin);
      let escaner = true;
      for (const x of refs) {
        const donde = ` · ${x.refLocal}`;
        if (!x.nueva && !existeCommit(x.remoto, o)) {
          rojo = true;
          anotar(repo.raiz, rol, cual, 'githook:remoto-adelantado', x.refRemota, o);
          lineas.push(`pre-push: ${args[0] || 'el remoto'} tiene en ${x.refRemota} commits que esta PC no tiene (avanzó o lo reescribieron) — hacé git fetch y git pull --rebase, y volvé a pushear`);
          continue;
        }
        const rango = x.nueva ? [x.local, '--not', '--remotes'] : [`${x.remoto}..${x.local}`];
        if (escaner) escaner = escanear(['git', `--log-opts=${rango.join(' ')}`], x.local, donde, rango);
        const c = candado('--rango', `${x.nueva ? '0'.repeat(x.local.length) : x.remoto}..${x.local}`, o);
        lineas.push(...c.lineas.map((l) => `${l}${donde}`));
        if (c.rojo) {
          rojo = true;
          // El candado lee los aprobados del disco (lo que tenés abierto): si lo que sube es otra rama, el aprobado puede vivir solo ahí.
          if (head && head !== x.local) lineas.push(`pre-push: ${x.refLocal} no es lo que tenés abierto — si su aprobado vive solo en esa rama, pusheala desde ella (git switch)`);
        }
      }
    } else {
      escanear(['git', '--staged'], '', '');
      if (cual === 'pre-merge-commit') lineas.push('pre-merge-commit: el candado no corre acá (git todavía no dice cuál es el otro padre del merge) — el merge lo juzga el pre-push, contra cada padre');
      else {
        const aparte = indiceAparte(o);
        if (aparte) {
          rojo = true;
          anotar(repo.raiz, rol, cual, 'githook:indice-aparte', aparte, o);
          lineas.push(`pre-commit: este commit lleva ${aparte} desde un índice aparte (commit -a o commit <rutas>) y el candado lee el índice — hacé git add de lo que va (y git restore --staged de lo que no) y volvé a commitear`);
        } else {
          const c = candado('--indice', null, o);
          lineas.push(...c.lineas);
          if (c.rojo) rojo = true;
        }
      }
    }

    if (!rojo) {
      const p = correrPrevio(cual, args, stdin, o);
      if (p) {
        if (p.salida.trim()) lineas.push(...p.salida.replace(/\s+$/, '').split(/\r?\n/).map((l) => `(${p.ruta}) ${l}`));
        if (p.codigo !== 0) {
          rojo = true;
          lineas.push(`el hook previo ${p.ruta} salió con ${p.codigo === null ? 'nada (lo cortaron)' : p.codigo}`);
        } else lineas.push(`el hook previo ${p.ruta}: en verde`);
      }
    }
    if (!rojo) mudarLoDelPase(foto, repo.gitComun);
    lineas.push(rojo ? `kit ${cual}: ROJO — no pasa` : `kit ${cual}: en verde`);
    return { codigo: rojo ? 1 : 0, lineas };
  } finally {
    try {
      fs.rmSync(tmp, { recursive: true, force: true });
    } catch (e) {
      /* el temporal es del sistema */
    }
  }
}

let stdinCache;
function leerStdin() {
  if (stdinCache === undefined) {
    try {
      stdinCache = fs.readFileSync(0, 'utf8');
    } catch (e) {
      stdinCache = '';
    }
  }
  return stdinCache;
}

// El CLI: imprime a stderr (git lo muestra) y sale 0 · 1. Todo error → 1 con motivo.
function cli(argv) {
  const cual = CUALES.includes(argv[0]) ? argv[0] : 'githook';
  try {
    const r = principal(argv);
    process.stderr.write(r.lineas.join('\n') + '\n');
    return r.codigo;
  } catch (e) {
    const motivo = e instanceof Falla ? e.message : `${e && e.message ? String(e.message).split('\n')[0].slice(0, 200) : 'algo falló'}`;
    try {
      process.stderr.write(`kit ${cual}: ${ROTO} (${motivo}) — no pasa\n`);
    } catch (err) {
      /* nada */
    }
    return 1;
  }
}

if (require.main === module) process.exitCode = cli(process.argv.slice(2));

module.exports = {
  CUALES,
  PLAZO_GITLEAKS,
  REINTENTOS_GITLEAKS,
  ROLES_PASAN_SIN_ESCANER,
  RUTAS_CANDADO,
  RUTAS_BARRERA,
  SIN_ESCANER,
  ROTO,
  Falla,
  INYECTAN,
  sinInyectadas,
  configDistinta,
  rolDe,
  refVigente,
  buscarGitleaks,
  leerReporte,
  correrGitleaks,
  extraerCandado,
  candado,
  indiceAparte,
  correrPrevio,
  refsQueSuben,
  principal,
  cli,
};
