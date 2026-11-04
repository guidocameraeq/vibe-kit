'use strict';
// repos.cjs — el recorrido de la carpeta de proyectos: una fila por repo (SPEC-paquete-8r2 t7, D8r2-5; red team rt-5, rt-6, rt-10).
// Lo usan los cuatro que miran la flota, con la MISMA regla: `arquitecto.cjs registro` (de acá), y del Equipador
// `preparar-pc.cjs` (generarAutoMode), `lib/flota.cjs` (todosLosRepos, rutaDeRepo) y `cambios-flota.cjs`.
// Se cambia ACÁ, en el Arquitecto, y se copia byte a byte a kit/skills/arquitecto-skills/scripts/lib/repos.cjs (copias.test lo
// cuida): las dos skills se instalan por separado y ninguna alcanza la carpeta de la otra.
//
// La regla:
//   · se mira hasta DOS niveles (D:/Hermes/Hermes.exe): un repo es una carpeta con `.git` (carpeta o archivo); dentro de un repo no
//     se baja (un repo adentro de otro no es de la flota). Ni `$…` (la papelera) ni `System Volume Information`; una carpeta del
//     segundo nivel que no se lee se saltea (rt-6).
//   · se agrupan por `git rev-parse --path-format=absolute --git-common-dir` (de una carpeta `.git`, ella misma), comparable (real;
//     minúsculas en win32): de cada grupo queda el checkout principal (`.git` carpeta), nunca un worktree (`.git` archivo). Un grupo
//     con solo worktrees da una línea (rt-6).
//   · dos principales con el mismo origin (el de .git/config, normalizado como `normalizarOrigen` de lib/adoptar.cjs): queda el de
//     HEAD más nuevo, y una línea que los nombra (rt-10).
//   · rutas ABSOLUTAS de punta a punta (rt-5).
// Node estándar, cero dependencias. Es .cjs a propósito: corre igual en proyectos con "type": "module".

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const PLAZO_GIT = 20000;
const NO_SE_BAJA = (nombre) => nombre.startsWith('$') || nombre === 'System Volume Information' || nombre === '.git';

// Una ruta para comparar: real (sigue junctions y symlinks), barras /, sin barra final; en win32, en minúsculas.
function comparable(p) {
  let r = path.resolve(p);
  try {
    r = fs.realpathSync.native(r);
  } catch {
    /* no existe: la resuelta */
  }
  r = r.replace(/\\/g, '/').replace(/\/+$/, '');
  return process.platform === 'win32' ? r.toLowerCase() : r;
}

// La misma que normalizarOrigen de lib/adoptar.cjs (copiada: adoptar no se toca). Una ruta local, además, real y comparable.
function normalizarOrigen(u) {
  let s = String(u).trim().replace(/\/+$/, '').replace(/\.git$/i, '').replace(/\/+$/, '');
  s = s.replace(/^([a-z][a-z0-9+.-]*:\/\/)([^@/]*@)?([^/:]+)/i, (_, esq, usr, host) => `${esq.toLowerCase()}${usr || ''}${host.toLowerCase()}`);
  s = s.replace(/^([^@/:]+@)([^/:]+):/, (_, usr, host) => `${usr}${host.toLowerCase()}:`);
  return s;
}
const esUrl = (u) => /^[a-z][a-z0-9+.-]*:\/\//i.test(u) || /^[^/\\@]+@[^/\\:]+:/.test(u) || /^[a-z0-9.-]{2,}:(?![\\/])/i.test(u);

function git(dir, args) {
  const r = spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8', windowsHide: true, timeout: PLAZO_GIT, env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } });
  return r.status === 0 && !r.error ? r.stdout.trim() : null;
}

function tipoDeGit(dir) {
  try {
    const s = fs.statSync(path.join(dir, '.git'));
    return s.isDirectory() ? 'carpeta' : s.isFile() ? 'archivo' : null;
  } catch {
    return null;
  }
}

// El git-common-dir, absoluto y comparable. De una carpeta `.git`, ella misma (es lo que da git, y así el recorrido no lanza un
// proceso por repo: con la PC cargada, 150 ms cada uno). De un `.git` archivo (un worktree): `git rev-parse --path-format=absolute
// --git-common-dir`; sin git (o si falla), lo que dice su `gitdir:` y el `commondir` de ahí (así lo arma git para un worktree).
function directorioComun(dir, tipo) {
  if (tipo === 'carpeta') return comparable(path.join(dir, '.git'));
  const abs = git(dir, ['rev-parse', '--path-format=absolute', '--git-common-dir']) || (() => {
    const viejo = git(dir, ['rev-parse', '--git-common-dir']); // git < 2.31 no conoce --path-format: relativo al dir
    return viejo ? path.resolve(dir, viejo) : null;
  })();
  if (abs) return comparable(abs);
  try {
    const m = /^gitdir:\s*(.+?)\s*$/m.exec(fs.readFileSync(path.join(dir, '.git'), 'utf8'));
    if (!m) return null;
    const gd = path.resolve(dir, m[1]);
    const cd = path.join(gd, 'commondir');
    return comparable(fs.existsSync(cd) ? path.resolve(gd, fs.readFileSync(cd, 'utf8').trim()) : gd);
  } catch {
    return null;
  }
}

// El url del origin de un principal, leído de su .git/config (sin lanzar git: ver directorioComun), o null. Solo sirve para ver
// si dos clones son del mismo remoto; lo que se clona lo sigue leyendo cada script con `git remote get-url origin`.
function origenDeConfig(dir) {
  let t;
  try {
    t = fs.readFileSync(path.join(dir, '.git', 'config'), 'utf8');
  } catch {
    return null;
  }
  let enOrigin = false;
  for (const l of t.split(/\r?\n/)) {
    const sec = /^\s*\[\s*([^\]\s]+)(?:\s+"([^"]*)")?\s*\]/.exec(l);
    if (sec) {
      enOrigin = sec[1].toLowerCase() === 'remote' && sec[2] === 'origin';
      continue;
    }
    const kv = enOrigin && /^\s*url\s*=\s*(.*?)\s*$/i.exec(l);
    if (kv && kv[1]) return kv[1].replace(/^"(.*)"$/, '$1');
  }
  return null;
}

// Las carpetas de un nivel, en orden; las que no se bajan, afuera.
function carpetasDe(dir, leer) {
  return leer(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !NO_SE_BAJA(d.name))
    .map((d) => d.name)
    .sort();
}

// recorrer(carpeta, {leer}) → { repos: [{dir, rel, nombre}], avisos: [...] }. `dir` absoluta; `rel` con / desde la carpeta
// (Hermes/Hermes.exe); `nombre` = la carpeta del repo (Hermes.exe), o `rel` si dos repos comparten nombre. Ordenados por `rel`.
// La carpeta misma que no se lee: tira el error de fs (cada script lo dice a su manera). `leer` es para las pruebas.
function recorrer(carpeta, { leer = fs.readdirSync } = {}) {
  const raiz = path.resolve(carpeta);
  const avisos = [];
  const candidatos = []; // {dir, rel, tipo}
  for (const n1 of carpetasDe(raiz, leer)) {
    const d1 = path.join(raiz, n1);
    const t1 = tipoDeGit(d1);
    if (t1) {
      candidatos.push({ dir: d1, rel: n1, tipo: t1 });
      continue;
    }
    let hijas;
    try {
      hijas = carpetasDe(d1, leer);
    } catch {
      continue; // rt-6: una carpeta que no se lee (permisos, la del sistema) se saltea
    }
    for (const n2 of hijas) {
      const d2 = path.join(d1, n2);
      const t2 = tipoDeGit(d2);
      if (t2) candidatos.push({ dir: d2, rel: `${n1}/${n2}`, tipo: t2 });
    }
  }
  // por git-common-dir: queda el principal
  const grupos = new Map();
  for (const c of candidatos) {
    const comun = directorioComun(c.dir, c.tipo) || `?${c.rel}`;
    if (!grupos.has(comun)) grupos.set(comun, []);
    grupos.get(comun).push(c);
  }
  const principales = [];
  for (const [comun, g] of grupos) {
    const p = g.filter((c) => c.tipo === 'carpeta');
    if (!p.length) {
      avisos.push(`solo worktrees de ${comun} (${g.map((c) => c.rel).join(', ')}): el principal está fuera de --proyectos`);
      continue;
    }
    principales.push(p.length === 1 ? p[0] : p.find((c) => comparable(path.join(c.dir, '.git')) === comun) || p[0]);
  }
  // por origin: dos clones del mismo remoto → el de HEAD más nuevo
  const porOrigen = new Map();
  const repos = [];
  for (const c of principales) {
    const o = origenDeConfig(c.dir);
    if (!o) {
      repos.push(c);
      continue;
    }
    const clave = esUrl(o) ? normalizarOrigen(o) : comparable(path.resolve(c.dir, o.replace(/^file:\/\//, '').replace(/^\/(?=[A-Za-z]:)/, '')));
    if (!porOrigen.has(clave)) porOrigen.set(clave, { url: o, lista: [] });
    porOrigen.get(clave).lista.push(c);
  }
  for (const { url, lista } of porOrigen.values()) {
    if (lista.length === 1) {
      repos.push(lista[0]);
      continue;
    }
    const cuando = (c) => Number(git(c.dir, ['log', '-1', '--format=%ct', 'HEAD'])) || 0;
    for (const c of lista) c.cuando = cuando(c);
    // el de HEAD más nuevo; empate: la carpeta más corta, después la primera en orden
    const orden = [...lista].sort((a, b) => b.cuando - a.cuando || a.rel.length - b.rel.length || (a.rel < b.rel ? -1 : 1));
    repos.push(orden[0]);
    avisos.push(`${lista.length === 2 ? 'dos' : lista.length} checkouts del mismo origin ${url}: ${orden.map((c) => c.rel).join(' y ')}; queda ${orden[0].rel} (el de HEAD más nuevo)`);
  }
  repos.sort((a, b) => (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0));
  const veces = new Map();
  for (const c of repos) veces.set(path.basename(c.dir), (veces.get(path.basename(c.dir)) || 0) + 1);
  return {
    repos: repos.map((c) => ({ dir: c.dir, rel: c.rel, nombre: veces.get(path.basename(c.dir)) > 1 ? c.rel : path.basename(c.dir) })),
    avisos,
  };
}

module.exports = { recorrer, comparable, normalizarOrigen, directorioComun };
