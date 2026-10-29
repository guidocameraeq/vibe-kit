'use strict';
// contexto.cjs — dónde está parada la sesión: raíz del checkout, git-dir, rama, rama por defecto, pestaña, rol,
// si es el checkout principal, y la ficha vigente con la regla de 4.7 (SPEC-paquete-2, "Las librerías compartidas").
// Node estándar, cero dependencias. Es .cjs a propósito: corre igual en proyectos con "type": "module".
//
// La raíz sale SIEMPRE de `git rev-parse --show-toplevel` desde el cwd de la entrada del hook: nunca de CLAUDE_PROJECT_DIR
// (en un worktree apunta al principal; H §10.3).

const fs = require('fs');
const path = require('path');
const git = require('./git.cjs');
const ficha = require('./ficha.cjs');

const RUTA_FICHA = '.claude/kit.md';
const ARCHIVO_ROL = '.kit-rol';
const ROLES = ['director', 'obrero', 'nocturno', 'actualizador'];

// ---------------------------------------------------------------- de dónde se parte

// La entrada del hook (objeto ya parseado o texto JSON) o nada: el cwd de la entrada, si no el del proceso.
function cwdDe(entrada) {
  let e = entrada;
  if (typeof e === 'string') {
    try {
      e = JSON.parse(e);
    } catch (err) {
      e = null;
    }
  }
  if (e && typeof e === 'object' && typeof e.cwd === 'string' && e.cwd.trim() !== '') return e.cwd;
  return process.cwd();
}

// Raíz, git-dir y git-dir común en UNA llamada (cada git cuesta ~150 ms en Windows). null fuera de un checkout.
function datosGit(cwd = process.cwd()) {
  const t = git.texto(['rev-parse', '--path-format=absolute', '--show-toplevel', '--git-dir', '--git-common-dir'], { cwd });
  if (!t) return null;
  const [r, d, c] = t.split('\n').map((s) => s.trim());
  if (!r || !d || !c) return null;
  return { raiz: path.resolve(r), gitDir: path.resolve(d), gitComun: path.resolve(c) };
}

const campoGit = (cwd, k) => {
  const g = datosGit(cwd);
  return g ? g[k] : null;
};
const raiz = (cwd = process.cwd()) => campoGit(cwd, 'raiz');
const gitDir = (cwd = process.cwd()) => campoGit(cwd, 'gitDir');
const gitComun = (cwd = process.cwd()) => campoGit(cwd, 'gitComun');

// El checkout es el principal si su git-dir es el común (en un worktree, git-dir = <común>/worktrees/<x>). RT-p2 2.
// Las dos rutas salen de la misma llamada a git: se comparan tal cual.
const esPrincipal = (g) => !!g && g.gitDir === g.gitComun;
function principal(cwd = process.cwd()) {
  return esPrincipal(datosGit(cwd));
}

// '.' en el principal; '.claude/worktrees/<x>' en un worktree (siempre con '/', jamás una ruta absoluta: va al sello de
// `cambios aprobar` y una absoluta da rojo en la otra PC y deja el usuario de la PC en el repo).
const FUERA_DEL_PRINCIPAL = '(fuera del principal)';
function relativaDe(g) {
  if (!g) return FUERA_DEL_PRINCIPAL;
  if (esPrincipal(g)) return '.';
  // La raíz del principal es la carpeta que contiene el git-dir común (<principal>/.git).
  const rel = path.relative(path.dirname(g.gitComun), g.raiz);
  if (rel === '' || path.isAbsolute(rel) || rel.split(path.sep)[0] === '..') return FUERA_DEL_PRINCIPAL;
  return rel.split(path.sep).join('/');
}
function carpetaRelativa(cwd = process.cwd()) {
  return relativaDe(datosGit(cwd));
}

// ---------------------------------------------------------------- rama y pestaña

function rama(cwd = process.cwd()) {
  return git.texto(['symbolic-ref', '--short', '-q', 'HEAD'], { cwd }) || null;
}

// modulo/<x> director · modulo/<x>--<ID> obrero · worktree-* misión (plana) · otra, plana. Sin rama (HEAD suelto), plana.
function pestana(nombreRama) {
  const r = typeof nombreRama === 'string' ? nombreRama : '';
  let m = /^modulo\/([^/]+?)--([^/]+)$/.exec(r);
  if (m) return { tipo: 'obrero', modulo: m[1], id: m[2], rama: r };
  m = /^modulo\/([^/]+)$/.exec(r);
  if (m) return { tipo: 'director', modulo: m[1], rama: r };
  if (/^worktree-/.test(r)) return { tipo: 'mision', rama: r };
  return { tipo: 'plana', rama: r || null };
}

// ---------------------------------------------------------------- rol

// De .kit-rol en la raíz del checkout: sin archivo, humano; uno de los cuatro, tal cual; cualquier otra cosa, desconocido.
function rol(raizCheckout) {
  if (!raizCheckout) return 'desconocido';
  const archivo = path.join(raizCheckout, ARCHIVO_ROL);
  let t;
  try {
    t = fs.readFileSync(archivo, 'utf8');
  } catch (e) {
    if (e && e.code === 'ENOENT') return 'humano';
    return 'desconocido'; // existe pero no se lee (una carpeta, permisos): nunca humano
  }
  t = t.replace(/^\uFEFF/, '').trim();
  return ROLES.includes(t) ? t : 'desconocido';
}

// ---------------------------------------------------------------- rama por defecto y ficha vigente (regla de 4.7)

// modulo/* y worktree-* nunca son rama por defecto, ni aunque init.defaultBranch lo diga (un agente lo cambia con git config; r2-5).
function prohibidaComoDefecto(nombre) {
  return /^(modulo\/|worktree-)/i.test(nombre);
}

// Los nombres que pueden ser rama por defecto, en orden: init.defaultBranch (si está y vale), main, master.
function candidatas(cwd) {
  const lista = [];
  const conf = git.texto(['config', '--get', 'init.defaultBranch'], { cwd });
  if (conf && conf.trim() !== '' && !prohibidaComoDefecto(conf.trim())) lista.push(conf.trim());
  for (const n of ['main', 'master']) if (!lista.includes(n)) lista.push(n);
  return lista;
}

const existeRef = (cwd, ref) => git.correr(['rev-parse', '--verify', '-q', `${ref}^{commit}`], { cwd }).ok;

function hayOrigin(cwd) {
  const r = git.texto(['remote'], { cwd });
  return !!r && r.split('\n').map((s) => s.trim()).includes('origin');
}

// → { nombre, ref, origen } o null. origen: 'origin/HEAD' · 'origin' · 'local'.
//  1. origin/HEAD, solo si apunta a main, master o init.defaultBranch (RT-p2 4: `git remote set-head` se hace sin red).
//  2. si no, origin/<la primera candidata que exista en origin>.
//  3. sin remoto (o con un origin que no tiene ninguna), la primera candidata que exista como rama local.
function refVigente(cwd = process.cwd()) {
  const cands = candidatas(cwd);
  if (hayOrigin(cwd)) {
    const head = git.texto(['symbolic-ref', '-q', 'refs/remotes/origin/HEAD'], { cwd });
    if (head && head.startsWith('refs/remotes/origin/')) {
      const apunta = head.slice('refs/remotes/origin/'.length);
      if (cands.includes(apunta) && existeRef(cwd, `refs/remotes/origin/${apunta}`)) {
        return { nombre: apunta, ref: `refs/remotes/origin/${apunta}`, origen: 'origin/HEAD' };
      }
    }
    for (const n of cands) {
      if (existeRef(cwd, `refs/remotes/origin/${n}`)) return { nombre: n, ref: `refs/remotes/origin/${n}`, origen: 'origin' };
    }
  }
  for (const n of cands) {
    if (existeRef(cwd, `refs/heads/${n}`)) return { nombre: n, ref: `refs/heads/${n}`, origen: 'local' };
  }
  return null;
}

function ramaPorDefecto(cwd = process.cwd()) {
  const r = refVigente(cwd);
  return r ? r.nombre : null;
}

// fichaVigente(raiz) → { estado: 'ok', datos, avisos, ref } · { estado: 'sin-ficha', ref, motivo } ·
// { estado: 'rota', archivo, linea, donde: '<archivo>:<línea>', mensaje, ref }.
// Se lee de git, nunca del disco: una ficha sin commitear (o sin subir, si hay origin) no existe todavía.
function fichaVigente(raizCheckout) {
  const cwd = raizCheckout || process.cwd();
  const rv = refVigente(cwd);
  if (!rv) return { estado: 'sin-ficha', ref: null, motivo: 'no hay rama por defecto' };
  const r = git.correr(['show', `${rv.ref}:${RUTA_FICHA}`], { cwd });
  if (!r.ok) return { estado: 'sin-ficha', ref: rv.ref, motivo: r.error ? `git: ${r.error}` : `no hay ${RUTA_FICHA} en ${rv.nombre}` };
  const bytes = r.salida;
  const rota = (linea, mensaje) => ({
    estado: 'rota',
    archivo: RUTA_FICHA,
    linea,
    donde: `${RUTA_FICHA}:${linea}`,
    mensaje,
    ref: rv.ref,
  });
  if (bytes.length >= 2 && ((bytes[0] === 0xff && bytes[1] === 0xfe) || (bytes[0] === 0xfe && bytes[1] === 0xff))) {
    return rota(1, 'la ficha está guardada en UTF-16 — guardala en UTF-8');
  }
  try {
    const res = ficha.leer(bytes.toString('utf8'));
    return { estado: 'ok', datos: res.datos, avisos: res.avisos, ref: rv.ref };
  } catch (e) {
    if (e instanceof ficha.ErrorFicha) return rota(e.linea, e.mensaje);
    return rota(1, 'no se pudo leer la ficha — corré doctor');
  }
}

// ---------------------------------------------------------------- todo junto

// armar(entrada) → lo que necesita un hook, de una vez. Sin git: raiz null y el resto en su valor de "no sé".
function armar(entrada) {
  const cwd = cwdDe(entrada);
  const g = datosGit(cwd);
  if (!g) {
    return { cwd, raiz: null, gitDir: null, rama: null, ramaPorDefecto: null, pestana: pestana(null), rol: 'desconocido', principal: false, carpetaRelativa: FUERA_DEL_PRINCIPAL };
  }
  const nombreRama = rama(g.raiz);
  return {
    cwd,
    raiz: g.raiz,
    gitDir: g.gitDir,
    rama: nombreRama,
    ramaPorDefecto: ramaPorDefecto(g.raiz),
    pestana: pestana(nombreRama),
    rol: rol(g.raiz),
    principal: esPrincipal(g),
    carpetaRelativa: relativaDe(g),
  };
}

module.exports = {
  RUTA_FICHA,
  ARCHIVO_ROL,
  ROLES,
  FUERA_DEL_PRINCIPAL,
  cwdDe,
  datosGit,
  raiz,
  gitDir,
  gitComun,
  principal,
  carpetaRelativa,
  rama,
  pestana,
  rol,
  prohibidaComoDefecto,
  candidatas,
  refVigente,
  ramaPorDefecto,
  fichaVigente,
  armar,
};
