'use strict';
// publicar.cjs — el contrato de la autorización de publicar (SPEC-paquete-8d C2.2, D8d-5; lo LEE noche.cjs publicar en la tanda B
// y lo ESCRIBE preparar-pc.cjs en la C: las dos lo prueban con el mismo ejemplo, el de noche.test). Solo lee: nunca publica.
//   normalizarOrigin(url) → texto: sin `.git` al final, el host en minúsculas, `git@host:dueño/repo` = `https://host/dueño/repo` =
//     `ssh://git@host/dueño/repo` → `host/dueño/repo`. Una carpeta de esta PC → su ruta absoluta con `/` (en Windows, en minúsculas).
//   archivosNombrados(publicar) → [ruta]: el archivo que nombra cada comando (comando, humo, volver; en ese orden, sin repetir):
//     `<intérprete> … <archivo del repo> …` → ese archivo; `<npm|pnpm|yarn> … run <script>` → el package.json de esa carpeta
//     (`--prefix|--dir|--cwd|-C <carpeta>`, o la raíz), ENTERO (cambiar el script `deploy` mueve la huella).
//   textoHuella(publicar, leer) · huella(raiz, publicar, ref): ficha.hash de los renglones `comando=<…>`, `humo=<…>`, `volver=<…>`
//     (vacío si no hay) y un `<ruta>=<hash>` por archivo nombrado (ficha.hash del contenido en `ref`, con LF; `(no está)` si falta).
//   autorizacionesPc(home) → { lista: [{ origin, huella }] } · { falta: true } · { rota: '<por qué>' }: `publica:` de
//     <home>/.claude/kit-pc.md, una lista de mapas en línea `- {origin: "<origin normalizado>", huella: <12 hexa>}`.
// Node estándar, cero dependencias. Es .cjs a propósito: corre igual en proyectos con "type": "module".

const fs = require('fs');
const path = require('path');
const ficha = require('./ficha.cjs');
const git = require('./git.cjs');

const AL_SUBIR = 'al-subir';
const CLAVES = ['comando', 'humo', 'volver'];
const INTERPRETES = ['node', 'py', 'python', 'bash', 'sh', 'pwsh'];
const LANZADORES = ['npm', 'pnpm', 'yarn'];
const OPCIONES_CARPETA = ['--prefix', '--dir', '--cwd', '-c', '-C'];
const WIN = process.platform === 'win32';

function normalizarOrigin(url, win = WIN) {
  let s = String(url || '').trim();
  if (!s) return '';
  const quitarGit = (x) => x.replace(/\/+$/, '').replace(/\.git$/i, '').replace(/\/+$/, '');
  // git@host:dueño/repo (scp) — no una ruta de Windows (C:\…, C:/…)
  let m = /^(?:[^@/\\\s]+@)?([^:/\\\s]+):(?!\/\/)(.+)$/.exec(s);
  if (m && !/^[A-Za-z]$/.test(m[1])) return `${m[1].toLowerCase()}/${quitarGit(m[2].replace(/^\/+/, ''))}`;
  // https://, ssh://, git:// (con usuario y puerto opcionales)
  m = /^[a-z][a-z0-9+.-]*:\/\/(?:[^@/]+@)?([^/:]+)(?::\d+)?\/(.+)$/i.exec(s);
  if (m && !/^file:/i.test(s)) return `${m[1].toLowerCase()}/${quitarGit(m[2])}`;
  // una carpeta de esta PC (file://, una ruta)
  s = s.replace(/^file:\/\/\/?/i, '');
  let abs = path.resolve(s).split('\\').join('/');
  abs = quitarGit(abs);
  return win ? abs.toLowerCase() : abs;
}

// ¿El origin es una carpeta de esta PC? (para KIT_HOME_PC, el home de prueba de R2: solo con un remoto local)
function esOriginLocal(url) {
  const s = String(url || '').trim();
  if (!s) return false;
  if (/^file:/i.test(s)) return true;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) return false;
  if (/^(?:[^@/\\\s]+@)?[^:/\\\s]{2,}:/.test(s)) return false; // scp
  try {
    return fs.statSync(path.resolve(s)).isDirectory();
  } catch (e) {
    return false;
  }
}

const palabras = (v) => String(v || '').trim().split(/\s+/).filter(Boolean);
const limpia = (r) => path.posix.normalize(String(r).split('\\').join('/').replace(/^\.\//, ''));

// El archivo que nombra UN comando (ya validado por la ficha, A1.1), o null (al-subir, o una forma que no se reconoce).
function archivoDe(cmd) {
  if (typeof cmd !== 'string' || cmd === AL_SUBIR) return null;
  const w = palabras(cmd);
  if (!w.length) return null;
  if (INTERPRETES.includes(w[0])) {
    for (const x of w.slice(1)) {
      if (x.startsWith('-')) continue;
      return limpia(x);
    }
    return null;
  }
  if (LANZADORES.includes(w[0])) {
    let carpeta = '';
    for (let k = 1; k < w.length && w[k] !== 'run'; k++) {
      const eq = /^(--prefix|--dir|--cwd)=(.+)$/.exec(w[k]);
      if (eq) carpeta = eq[2];
      else if (OPCIONES_CARPETA.includes(w[k]) && w[k + 1]) carpeta = w[++k];
    }
    return limpia(carpeta ? `${carpeta}/package.json` : 'package.json');
  }
  return null;
}

function archivosNombrados(publicar) {
  const out = [];
  if (!publicar || typeof publicar !== 'object') return out;
  for (const c of CLAVES) {
    const a = archivoDe(publicar[c]);
    if (a && !out.includes(a)) out.push(a);
  }
  return out;
}

// El texto de la huella. `leer(ruta)` → el contenido (Buffer o texto) o null.
function textoHuella(publicar, leer) {
  const p = publicar || {};
  const r = CLAVES.map((c) => `${c}=${typeof p[c] === 'string' ? p[c] : ''}`);
  for (const a of archivosNombrados(p)) {
    const b = leer(a);
    r.push(`${a}=${b === null || b === undefined ? '(no está)' : ficha.hash(b)}`);
  }
  return r.join('\n');
}

// La huella de hoy, con los archivos de `ref` (la rama por defecto de origin: lo que se va a publicar).
function huella(raiz, publicar, ref) {
  const leer = (rel) => {
    const r = git.correr(['show', `${ref}:${rel}`], { cwd: raiz, tiempo: 60000 });
    return r.ok ? r.salida || Buffer.from(r.stdout || '', 'utf8') : null;
  };
  return ficha.hash(textoHuella(publicar, leer));
}

const rutaKitPc = (home) => path.join(home, '.claude', 'kit-pc.md');

function autorizacionesPc(home) {
  let t;
  try {
    t = fs.readFileSync(rutaKitPc(home), 'utf8');
  } catch (e) {
    return { falta: true };
  }
  let d;
  try {
    d = ficha.leerCabecera(t).datos;
  } catch (e) {
    return { rota: e && e.name === 'ErrorFicha' ? `línea ${e.linea}: ${e.mensaje}` : 'no se lee' };
  }
  const p = d.publica;
  if (p === undefined) return { lista: [] };
  if (!Array.isArray(p)) return { rota: '"publica" tiene que ser una lista' };
  const lista = [];
  for (const x of p) {
    if (!x || typeof x !== 'object' || typeof x.origin !== 'string' || !/^[0-9a-f]{12}$/.test(String(x.huella || ''))) return { rota: 'cada renglón de "publica" es {origin: "…", huella: <12 hexa>}' };
    lista.push({ origin: x.origin, huella: String(x.huella) });
  }
  return { lista };
}

module.exports = { AL_SUBIR, CLAVES, normalizarOrigin, esOriginLocal, archivoDe, archivosNombrados, textoHuella, huella, rutaKitPc, autorizacionesPc };
