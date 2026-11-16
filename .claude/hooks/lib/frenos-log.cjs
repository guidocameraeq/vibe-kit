'use strict';
// frenos-log.cjs — el registro de frenos: un renglón por frenada, solo agregar (A §4; SPEC-paquete-2, Cruces 9).
// Partido en dos (A6, SPEC-paquete-8d, tracker 44: el versionado se ensuciaba solo y trababa merges y el pull del cierre):
//   - la FIRMA (el id exacto `cambios:aprobar`) va a .claude/frenos.log, versionado: validarSello la busca ahí;
//   - todo lo demás (cada freno que negó o preguntó, `cambios:aprobar-negado` incluido) va a <carpeta común de git>/kit-frenos.log,
//     sin versionar, compartido por la principal y sus worktrees. Sin repo de git, todo al versionado, como antes.
//   <AAAA-MM-DDTHH:MM:SS±hh:mm> · <rol> · <rama> · <id> · <herramienta> · <detalle>
// UTF-8, LF. El detalle es una ruta relativa o un texto fijo, NUNCA un valor que escribió el usuario: igual se neutraliza
// todo lo que rompería el renglón (saltos de línea, controles y el separador " · ").
// Node estándar, cero dependencias. Es .cjs a propósito: corre igual en proyectos con "type": "module".

const fs = require('fs');
const path = require('path');

// La ruta, relativa a la raíz del checkout. E0 confirmó que queda en .claude/ (si cambiara a .kit/, se cambia acá y nada más).
const RUTA = '.claude/frenos.log';
const SEP = ' · ';
const LARGO_MAX = 500; // por campo: un renglón del registro no es un lugar para textos largos
const RUTA_COMUN = 'kit-frenos.log'; // adentro de la carpeta común de git (donde `cerrar` y el githook ya mudaban lo de un worktree)
const ID_FIRMA = 'cambios:aprobar';

// La ruta del versionado (la de la firma).
function rutaAbsoluta(raiz) {
  return path.join(raiz, ...RUTA.split('/'));
}

const leerTxt = (p) => {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch (e) {
    return null;
  }
};

// La carpeta común de git del checkout que contiene `raiz`, solo con fs (corre en los frenos: no lanza git). → ruta o null.
function gitComun(raiz) {
  let d = path.resolve(raiz);
  for (;;) {
    const p = path.join(d, '.git');
    let st = null;
    try {
      st = fs.statSync(p);
    } catch (e) {
      st = null;
    }
    if (st) {
      if (st.isDirectory()) return p;
      const m = /^gitdir:\s*(.+?)\s*$/m.exec(leerTxt(p) || '');
      if (!m) return null;
      const gitDir = path.resolve(d, m[1]);
      const cd = leerTxt(path.join(gitDir, 'commondir'));
      return cd === null ? gitDir : path.resolve(gitDir, cd.trim());
    }
    const arriba = path.dirname(d);
    if (arriba === d) return null;
    d = arriba;
  }
}

// <común>/kit-frenos.log, o null sin repo de git.
function rutaComun(raiz) {
  const c = gitComun(raiz);
  return c ? path.join(c, RUTA_COMUN) : null;
}

// Dónde va un renglón con ese id: la firma al versionado; lo demás al común (sin repo, al versionado).
function rutaDe(raiz, id) {
  if (campo(id, '') === ID_FIRMA) return rutaAbsoluta(raiz);
  return rutaComun(raiz) || rutaAbsoluta(raiz);
}

// Los dos lugares juntos (el versionado primero), para los que LEEN el registro (resumen, verificar, doctor). Cada parte termina en LF.
function leerTodo(raiz) {
  const partes = [];
  const v = rutaAbsoluta(raiz);
  const c = rutaComun(raiz);
  for (const p of c && c !== v ? [v, c] : [v]) {
    const t = leerTxt(p);
    if (t) partes.push(t.endsWith('\n') ? t : `${t}\n`);
  }
  return partes.join('');
}

const dos = (n) => String(n).padStart(2, '0');

// Hora local con su desfasaje: 2026-10-28T14:03:09-03:00.
function fechaConZona(d) {
  const off = -d.getTimezoneOffset();
  const signo = off >= 0 ? '+' : '-';
  const abs = Math.abs(off);
  return (
    `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}` +
    `T${dos(d.getHours())}:${dos(d.getMinutes())}:${dos(d.getSeconds())}` +
    `${signo}${dos(Math.floor(abs / 60))}:${dos(abs % 60)}`
  );
}

// Un campo seguro para el renglón: sin controles ni separadores de línea Unicode, sin "·", sin espacios de más, con tope.
function campo(valor, siVacio) {
  let s = valor == null ? '' : String(valor);
  s = s.replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/g, ' ');
  s = s.replace(/·/g, '-');
  s = s.replace(/\s+/g, ' ').trim();
  if (s.length > LARGO_MAX) s = `${s.slice(0, LARGO_MAX - 1)}…`;
  return s === '' ? siVacio : s;
}

// renglon({id, herramienta, detalle, rol, rama}, ahora) → el texto del renglón, sin el fin de línea.
function renglon(datos, ahora = new Date()) {
  const d = datos || {};
  return [
    fechaConZona(ahora),
    campo(d.rol, 'desconocido'),
    campo(d.rama, '(sin rama)'),
    campo(d.id, '(sin id)'),
    campo(d.herramienta, '-'),
    campo(d.detalle, '-'),
  ].join(SEP);
}

// anotar(raiz, {id, herramienta, detalle, rol, rama}, ahora) → el renglón escrito (sin el LF).
// Solo agrega. Si el archivo no termina en LF (lo tocó alguien a mano), primero cierra ese renglón para no pegarse.
function anotar(raiz, datos, ahora = new Date()) {
  if (typeof raiz !== 'string' || raiz === '') throw new Error('frenos-log: falta la raíz del checkout');
  const archivo = rutaDe(raiz, datos && datos.id);
  fs.mkdirSync(path.dirname(archivo), { recursive: true });
  const linea = renglon(datos, ahora);
  let previo = '';
  try {
    const st = fs.statSync(archivo);
    if (st.size > 0) {
      const fd = fs.openSync(archivo, 'r');
      try {
        const b = Buffer.alloc(1);
        fs.readSync(fd, b, 0, 1, st.size - 1);
        if (b[0] !== 0x0a) previo = '\n';
      } finally {
        fs.closeSync(fd);
      }
    }
  } catch (e) {
    if (!e || e.code !== 'ENOENT') throw e;
  }
  fs.appendFileSync(archivo, `${previo}${linea}\n`, { encoding: 'utf8', flag: 'a' });
  return linea;
}

module.exports = { RUTA, RUTA_COMUN, ID_FIRMA, SEP, LARGO_MAX, rutaAbsoluta, gitComun, rutaComun, rutaDe, leerTodo, fechaConZona, renglon, anotar };
