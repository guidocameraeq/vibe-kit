'use strict';
// salida.cjs — el juicio del texto que sale solo (SPEC-G1-buzon, `responder`, paso 5; red team 5). Es lo que un agente puede
// mandar sin el OK: estado, fechas y citas. Todo lo demás se niega con su motivo.
//   - hasta 700 caracteres, sin bloques de código, sin URLs (y sin adjuntos: responder no tiene la opción);
//   - cada cita ruta:línea@sha existe en la copia (git cat-file y la línea dentro del archivo);
//   - sin datos con forma: mails, IPs, rutas \\ o de disco, tiras de 8 dígitos o más, dominios;
//   - nada de 25 caracteres o más (sin las citas) aparece tal cual en un archivo de la copia: versionado (git grep -F sobre HEAD),
//     sin versionar y no ignorado, o ignorado y sensible (.env, llaves).
// Todo se mira sobre el texto NORMALIZADO (NFKC, sin invisibles, los espacios juntados) y, para "pegar", por VENTANAS de 25
// caracteres sobre el texto unido, no por renglón entero (red team de la construcción, 7: un prefijo, un espacio duro, un
// carácter invisible o partir el renglón esquivaban la comparación renglón a renglón).
// Lo que esto no ataja, y se acepta (§4.3.3): una paráfrasis corta en palabras propias.
const fs = require('fs');
const os = require('os');
const path = require('path');

const TOPE = 700;
const RENGLON_MIN = 25;
const BARRA = String.fromCharCode(92);
const RE_CITA_G = /(?:^|[\s(\[,;])([A-Za-z0-9._\/-]+):(\d+)@([0-9a-f]{7,40})(?=$|[\s)\],;.])/g;
const RE_URL = /\b[a-z][a-z0-9+.-]*:\/\/|\bwww\.|\bmailto:/i;
const RE_MAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const RE_IP4 = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;
const RE_IP6 = /\b(?:[0-9a-f]{1,4}:){3,7}[0-9a-f]{1,4}\b/i;
const RE_DISCO = /\b[A-Za-z]:[\\/]/;
const RE_UNC = new RegExp(`${BARRA}${BARRA}${BARRA}${BARRA}[^${BARRA}${BARRA}\\s]+`);
// una ruta absoluta de Unix, una del home o una de red con barras: /x/y, ~/x, //srv/x
const RE_UNIX = /(?:^|[\s("'])(?:~\/|\/\/|\/)[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]*)+/;
// 8 dígitos o más, también con separadores (una tarjeta, una cuenta, un CBU); las fechas y horas se sacan antes
const RE_DIGITOS = /(?:\p{Nd}[\s.\-\/]?){8,}/u;
const RE_FECHAS = /\b\d{1,4}[-\/.]\d{1,2}[-\/.]\d{1,4}\b|\b\d{1,2}[-\/]\d{1,2}\b|\b\d{1,2}:\d{2}(?::\d{2})?\b/g;
// los dominios de primer nivel más comunes; los que también son extensiones de archivo (.sh, .so, .md…) no van, para que nombrar un
// archivo no cuente como dominio
const TLD = 'com|net|org|io|ar|dev|app|ai|co|info|biz|edu|gov|mil|us|uk|es|mx|cl|uy|br|pe|bo|ec|ve|xyz|cloud|online|site|tech|local|lan|internal|corp|intranet';
const RE_DOMINIO = new RegExp(`\\b[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?(?:\\.[a-z0-9-]{1,63})*\\.(?:${TLD})\\b`, 'i');
// un nombre de máquina de tres partes o más (srv-prod.acme.sistemas), con cualquier final de letras
const RE_HOST = /\b[a-z0-9-]+\.[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}\b/i;
const RE_ASIGNACION = /\b[A-Za-z_][A-Za-z0-9_]{2,}\s*=\s*\S/;
const RE_CODIGO = /```|~~~|^(?: {4}|\t)\S/m;
// los ignorados que sí se miran (los demás pesan, como node_modules): los que suelen guardar secretos
const RE_SENSIBLE = /(^|[\\/])(\.env[^\\/]*|[^\\/]*\.(pem|key|p12|pfx)|[^\\/]*\.local\.[^\\/]*|[^\\/]*(secret|credential|password)[^\\/]*)$/i;

// NFKC (el ancho completo y los parecidos a su forma común), sin los invisibles (\p{Cf}: de ancho cero, de formato) y con todo
// espacio (el duro incluido) como un espacio común
function normalizar(t) {
  return String(t)
    .normalize('NFKC')
    .replace(/\p{Cf}+/gu, '')
    .replace(/[\p{Zs}\t]+/gu, ' ')
    .replace(/\r\n?/g, '\n');
}

// Las citas del texto: [{ texto, ruta, linea, sha }]
function citas(texto) {
  const out = [];
  let m;
  RE_CITA_G.lastIndex = 0;
  while ((m = RE_CITA_G.exec(texto))) out.push({ texto: `${m[1]}:${m[2]}@${m[3]}`, ruta: m[1], linea: Number(m[2]), sha: m[3] });
  return out;
}
const sinCitas = (texto) => citas(texto).reduce((t, c) => t.split(c.texto).join(' '), texto);

// Los datos con forma (sobre el texto sin las citas) → el motivo, o null. Se mira también sin los espacios alrededor de los
// separadores ("10 . 0 . 0 . 12", "ana @ x . com")
function datoConForma(t0) {
  const t = normalizar(t0);
  const junto = t.replace(/\s*([.:@\/\\])\s*/g, '$1');
  for (const x of [t, junto]) {
    if (RE_URL.test(x)) return 'trae una URL';
    if (RE_MAIL.test(x)) return 'trae un mail';
    if (RE_IP4.test(x) || RE_IP6.test(x)) return 'trae una IP';
    if (RE_UNC.test(x) || RE_DISCO.test(x) || RE_UNIX.test(x)) return 'trae una ruta de red o de disco';
  }
  if (RE_DIGITOS.test(t.replace(RE_FECHAS, ' '))) return 'trae una tira de 8 dígitos o más';
  for (const x of [t, junto]) if (RE_DOMINIO.test(x) || RE_HOST.test(x)) return 'trae un dominio o un nombre de máquina';
  if (RE_ASIGNACION.test(t)) return 'trae una asignación (CLAVE=valor)';
  return null;
}

// Las ventanas de 25 caracteres del texto (unido con un espacio y sin nada entre renglones), sin repetir
function ventanas(t) {
  const out = new Set();
  const renglones = t.split('\n').map((r) => r.trim()).filter(Boolean);
  for (const unido of [renglones.join(' '), renglones.join('')]) {
    const cs = [...unido.replace(/ +/g, ' ')];
    for (let i = 0; i + RENGLON_MIN <= cs.length; i++) {
      const v = cs.slice(i, i + RENGLON_MIN).join('');
      if (v.trim().length === RENGLON_MIN && !v.startsWith(' ') && !v.endsWith(' ')) out.add(v);
    }
  }
  return [...out];
}

// ¿Algún archivo sin versionar (no ignorado) o ignorado y sensible trae una ventana? → la ruta, o null
function enSinVersionar(git, repo, vs) {
  const rutas = [];
  const o = git.correr(['ls-files', '-o', '--exclude-standard', '-z'], { cwd: repo, tiempo: 8000 });
  if (!o.ok) return { error: true };
  rutas.push(...o.stdout.split('\0').filter(Boolean));
  const ig = git.correr(['ls-files', '-o', '-i', '--exclude-standard', '--directory', '-z'], { cwd: repo, tiempo: 8000 });
  if (ig.ok) rutas.push(...ig.stdout.split('\0').filter((r) => r && !r.endsWith('/') && RE_SENSIBLE.test(r)));
  for (const rel of rutas) {
    let cont;
    try {
      const p = path.join(repo, rel);
      const st = fs.statSync(p);
      if (!st.isFile() || st.size > 4 * 1024 * 1024) continue;
      cont = normalizar(fs.readFileSync(p, 'utf8')).replace(/ +/g, ' ');
    } catch (e) {
      continue;
    }
    if (vs.some((v) => cont.includes(v))) return { ruta: rel };
  }
  return {};
}

// juzgarTexto(texto, { repo, git }) → { ok: true, texto } | { ok: false, motivo }
// `git` (las pruebas): la API de ../lib/git.cjs
function juzgarTexto(texto, { repo, git = require('../lib/git.cjs') } = {}) {
  const t = String(texto == null ? '' : texto).replace(/\r\n?/g, '\n').trim();
  if (!t) return { ok: false, motivo: 'el texto está vacío' };
  if ([...t].length > TOPE) return { ok: false, motivo: `el texto pasa de ${TOPE} caracteres` };
  const n = normalizar(t);
  if (RE_CODIGO.test(t) || RE_CODIGO.test(n)) return { ok: false, motivo: 'trae un bloque de código' };
  // las citas, primero: si no existen, el resto no importa
  for (const c of citas(n)) {
    if (c.ruta.startsWith('-') || c.ruta.split('/').includes('..')) return { ok: false, motivo: `la cita ${c.texto} no es una ruta del repo` };
    const r = git.correr(['cat-file', '-p', `${c.sha}:${c.ruta}`], { cwd: repo, tiempo: 4000 });
    if (!r.ok) return { ok: false, motivo: `la cita ${c.texto} no existe en esta copia` };
    const lineas = r.stdout.split('\n').length - (r.stdout.endsWith('\n') ? 1 : 0);
    if (c.linea < 1 || c.linea > lineas) return { ok: false, motivo: `la cita ${c.texto} apunta a una línea que el archivo no tiene` };
  }
  const resto = sinCitas(n);
  const dato = datoConForma(resto);
  if (dato) return { ok: false, motivo: `${dato}: eso se manda con escribir, con el OK de la persona` };
  // pegar contenido: una ventana de 25 que está tal cual en la copia (una sola llamada a git grep, con las ventanas en un archivo)
  const vs = ventanas(resto);
  if (vs.length) {
    const lista = path.join(os.tmpdir(), `buzon-ventanas-${process.pid}-${Date.now()}.txt`);
    let g;
    try {
      fs.writeFileSync(lista, `${vs.join('\n')}\n`);
      g = git.correr(['grep', '-F', '-I', '-q', '-f', lista, 'HEAD', '--'], { cwd: repo, tiempo: 15000 });
    } finally {
      fs.rmSync(lista, { force: true });
    }
    if (g.ok) return { ok: false, motivo: 'pega un pedazo de un archivo versionado: eso se manda con escribir, con el OK de la persona' };
    if (g.codigo !== 1) return { ok: false, motivo: 'no pude revisar si el texto pega contenido del repo (git grep falló)' };
    const s = enSinVersionar(git, repo, vs);
    if (s.error) return { ok: false, motivo: 'no pude listar los archivos sin versionar' };
    if (s.ruta) return { ok: false, motivo: `pega un pedazo de un archivo sin versionar o sensible (${s.ruta}): eso se manda con escribir, con el OK de la persona` };
  }
  return { ok: true, texto: t };
}

module.exports = { juzgarTexto, citas, sinCitas, datoConForma, normalizar, ventanas, TOPE, RENGLON_MIN };
