'use strict';
// protocolo.cjs — el protocolo del buzón v1 y la lectura del v0 (SPEC-G1-buzon, "El protocolo v1", puntos 1, 3, 4, 5, 8 y 9).
// Ids, tipos, nombres, codificación, huella, escritura atómica y el turno. No mira dueños ni la red: recibe lo ya leído.
// Node estándar, cero dependencias.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ---------------------------------------------------------------- ids (punto 1)
const RE_PARTE = /^[a-z0-9][a-z0-9-]{1,39}$/;
const ROLES = new Set(['director', 'obrero', 'sesion', 'po', 'humano']);
// los nombres de carpeta y de archivo que entran a un renglón o a un comando (punto 8; red team 9)
const RE_NOMBRE = /^[A-Za-z0-9._-]{1,120}$/;
// un id v0: <persona>@<PC>/<proyecto> (el LEEME del v0)
const RE_V0 = /^[A-Za-z0-9._-]{1,60}@[A-Za-z0-9._-]{1,60}\/[A-Za-z0-9._-]{1,80}$/;

const parteOk = (p) => typeof p === 'string' && RE_PARTE.test(p);
const personaOk = (p) => parteOk(p) && !ROLES.has(p);
function esIdV1(id) {
  if (typeof id !== 'string' || id.includes('@')) return false;
  const p = id.split('/');
  return p.length === 2 && parteOk(p[0]) && personaOk(p[1]);
}
const esIdV0 = (id) => typeof id === 'string' && RE_V0.test(id);
const esId = (id) => esIdV1(id) || esIdV0(id);
// en nombres de archivo, "/" (y en el v0 también "@") → "_"
const aArchivo = (id) => String(id).replace(/[@/]/g, '_');
// la vuelta, solo para el v1: el proyecto no lleva "_", así que el primero separa
function deArchivo(f) {
  const i = String(f).indexOf('_');
  if (i < 0) return null;
  const id = `${f.slice(0, i)}/${f.slice(i + 1)}`;
  return esIdV1(id) ? id : null;
}
// tampoco los que son claves de Object.prototype (__proto__, constructor…): se usan como claves del índice (red team, 12)
const nombreOk = (n) => typeof n === 'string' && RE_NOMBRE.test(n) && n !== '.' && n !== '..' && !(n in Object.prototype);

// ---------------------------------------------------------------- tipos (punto 4)
const TIPOS = ['HECHO', 'PEDIDO', 'RESPUESTA', 'PROPUESTA', 'ALERTA', 'PRESENTACION', 'CORRECCION', 'CIERRE'];
const DE_V0 = {
  pregunta: 'PEDIDO',
  encargo: 'PEDIDO',
  respuesta: 'RESPUESTA',
  propuesta: 'PROPUESTA',
  aviso: 'HECHO',
  informacion: 'HECHO',
  hecho: 'HECHO',
  decision: 'HECHO',
  correccion: 'CORRECCION',
  cierre: 'CIERRE',
};
const A_V0 = { HECHO: 'hecho', PEDIDO: 'pregunta', RESPUESTA: 'respuesta', PROPUESTA: 'propuesta', ALERTA: 'aviso', PRESENTACION: 'hecho', CORRECCION: 'correccion', CIERRE: 'cierre' };
const sinTildes = (s) => String(s).normalize('NFD').replace(/\p{M}+/gu, '').toLowerCase().trim();

// → { tipo, tema, raro, sinRespaldo }: el tipo del kit de un mensaje ya normalizado en lo demás
function tipoKit(crudo, v1) {
  const t = crudo && typeof crudo.tipo === 'string' ? crudo.tipo : '';
  const tema0 = crudo && typeof crudo.tema === 'string' ? crudo.tema : null;
  if (v1) {
    const tipo = TIPOS.includes(t) ? t : 'HECHO';
    const tema = tema0 === 'decision' || tema0 === 'suma' ? tema0 : null;
    const sinRespaldo = tema === 'decision' && !(typeof crudo.cita === 'string' && crudo.cita.trim());
    return { tipo, tema, raro: !TIPOS.includes(t), sinRespaldo };
  }
  const k = sinTildes(t);
  if (k === 'decision') {
    const citas = Array.isArray(crudo.citas) ? crudo.citas.filter((c) => typeof c === 'string' && c.trim()) : [];
    return { tipo: 'HECHO', tema: 'decision', raro: false, sinRespaldo: citas.length === 0 };
  }
  if (DE_V0[k]) return { tipo: DE_V0[k], tema: null, raro: false, sinRespaldo: false };
  if (TIPOS.includes(t)) return { tipo: t, tema: null, raro: false, sinRespaldo: false };
  return { tipo: 'HECHO', tema: null, raro: true, sinRespaldo: false };
}

// ---------------------------------------------------------------- codificación y huella (punto 8)
const huella = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
// lee con o sin BOM
function textoDe(bytes) {
  let t = Buffer.isBuffer(bytes) ? bytes.toString('utf8') : String(bytes);
  if (t.charCodeAt(0) === 0xfeff) t = t.slice(1);
  return t;
}
function parsear(bytes) {
  try {
    const v = JSON.parse(textoDe(bytes));
    return v && typeof v === 'object' && !Array.isArray(v) ? v : null;
  } catch (e) {
    return null;
  }
}
// → { bytes, valor } o null si no se lee
function leerJson(ruta) {
  let bytes;
  try {
    bytes = fs.readFileSync(ruta);
  } catch (e) {
    return null;
  }
  return { bytes, valor: parsear(bytes) };
}
// UTF-8 sin BOM
const serializar = (obj) => Buffer.from(`${JSON.stringify(obj, null, 2)}\n`, 'utf8');

const hex4 = () => crypto.randomBytes(2).toString('hex');
// AAAAMMDDTHHMMSSZ en UTC
const sello = (ms) => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

// Escribe en <carpeta>/tmp/ y mueve (mismo disco: el movimiento es atómico). `reemplazar` false: si el destino existe, no pisa.
// `mover` (las pruebas): reemplaza a fs.renameSync. Si algo falla entre escribir y mover, borra el temporal y tira: en el destino
// nunca queda un archivo a medias.
function escribirAtomico(carpeta, destino, bytes, { reemplazar = false, mover = fs.renameSync } = {}) {
  const tmpDir = path.join(carpeta, 'tmp');
  fs.mkdirSync(tmpDir, { recursive: true });
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  // el destino y tmp/ tienen que quedar adentro de la carpeta de verdad (una unión de directorio los desviaba: red team, 12)
  const raiz = fs.realpathSync.native(carpeta);
  const adentro = (d) => {
    const real = fs.realpathSync.native(d);
    return real === raiz || real.startsWith(raiz + path.sep);
  };
  if (!adentro(tmpDir) || !adentro(path.dirname(destino))) throw new Error(`${path.basename(destino)}: la carpeta de destino sale del buzón (¿una unión de directorio?); no escribo`);
  if (!reemplazar && fs.existsSync(destino)) throw new Error(`ya existe ${path.basename(destino)}`);
  const tmp = path.join(tmpDir, `${path.basename(destino)}.${process.pid}-${hex4()}.tmp`);
  fs.writeFileSync(tmp, bytes, { flag: 'wx' });
  try {
    mover(tmp, destino);
  } catch (e) {
    try {
      fs.rmSync(tmp, { force: true });
    } catch (e2) {
      /* queda en tmp/, que nadie lee */
    }
    throw e;
  }
}

// ---------------------------------------------------------------- el mensaje (punto 3), v1 o v0, a una forma común
const lista = (x) => (Array.isArray(x) ? x.filter((y) => typeof y === 'string') : typeof x === 'string' && x ? [x] : []);
const str = (x) => (typeof x === 'string' ? x : '');
function msDe(x) {
  if (typeof x !== 'string') return null;
  const t = Date.parse(x);
  return Number.isFinite(t) ? t : null;
}
// `conv` y `archivo`: dónde está (la carpeta y el nombre). → la forma común, o null si no es un mensaje
function normalizar(crudo, conv, archivo) {
  if (!crudo) return null;
  const v1 = crudo.protocolo === 1;
  const tk = tipoKit(crudo, v1);
  const id = archivo.replace(/\.json$/i, '');
  const responde = v1 ? lista(crudo.responde_a) : [...new Set([...lista(crudo.responde_a), ...lista(crudo.responde_a_todos)])];
  return {
    id,
    conv,
    archivo,
    v1,
    de: str(crudo.de),
    para: lista(crudo.para),
    tipoOriginal: str(crudo.tipo),
    tipo: tk.tipo,
    tema: tk.tema,
    raro: tk.raro,
    sinRespaldo: tk.sinRespaldo,
    responde_a: responde,
    esperando: v1 ? [] : lista(crudo.esperando_respuesta_de),
    asunto: str(crudo.asunto),
    cita: str(crudo.cita) || (lista(crudo.citas)[0] || ''),
    citas: lista(crudo.citas).slice(0, 20),
    auto: crudo.auto === true,
    abierto: crudo.abierto === true,
    creado: msDe(crudo.creado),
    // punto 8: id y conversación tienen que coincidir con el nombre y la carpeta
    coincide: crudo.id === id && crudo.conversacion === conv,
  };
}

// ---------------------------------------------------------------- direcciones y turno (punto 5; D1)
// agente: { id (v1), antes: [ids v0] }
function idsDe(agente) {
  return new Set([agente.id, ...(agente.antes || [])].filter(Boolean));
}
const exacto = (m, ids) => m.para.some((p) => ids.has(p)) || (!m.v1 && m.esperando.some((p) => ids.has(p)));
// un comodín que alcanza al agente: en un mensaje v1, <proyecto>/*, */<persona> y *; en uno v0, */<proyecto>, <persona>@* y *
function comodin(m, agente) {
  const [proy, pers] = String(agente.id).split('/');
  const v0 = (agente.antes || []).map((a) => ({ persona: a.split('@')[0], proyecto: a.split('/').pop() }));
  return m.para.some((p) => {
    if (p === '*') return true;
    if (m.v1) return p === `${proy}/*` || p === `*/${pers}`;
    return v0.some((x) => p === `*/${x.proyecto}` || p === `${x.persona}@*`) || p === `*/${proy}`;
  });
}
const ABRE = new Set(['PEDIDO', 'PROPUESTA']);
// cierra solo un mensaje suyo que verifica: uno pendiente (dueño sin leer) tampoco, o cualquiera escondería un turno ajeno
// mandando muchos mensajes nuevos para que el hook no llegue a leerles el dueño (red team de la construcción, 4)
const CIERRA = new Set(['verificado', 'v0']);

// Los turnos de un agente: [{ m, abierto, aprox, cierre }]. `estadoDe(m)`: la verificación de cada mensaje (un mensaje del agente
// que no verifica, pendiente o alterado, no cierra nada). Cierra un turno un mensaje de ese agente cuyo responde_a lo incluye y no trae
// abierto: true; en el v0, uno suyo sin responde_a, posterior y en la misma conversación (la aproximación de §2, marcada ≈).
function turnosDe(agente, mensajes, estadoDe = () => 'verificado') {
  const ids = idsDe(agente);
  const suyos = mensajes.filter((n) => ids.has(n.de) && CIERRA.has(estadoDe(n)));
  const out = [];
  for (const m of mensajes) {
    if (!ABRE.has(m.tipo) || ids.has(m.de) || !exacto(m, ids)) continue;
    let cierre = null;
    let aprox = false;
    for (const n of suyos) {
      if (n === m || n.conv !== m.conv) continue;
      if (n.responde_a.includes(m.id) && !n.abierto) {
        cierre = n;
        aprox = false;
        break;
      }
      if (!cierre && !n.v1 && n.responde_a.length === 0 && n.archivo > m.archivo) {
        cierre = n;
        aprox = true;
      }
    }
    out.push({ m, abierto: !cierre, aprox, cierre });
  }
  return out;
}

module.exports = {
  RE_NOMBRE,
  ROLES,
  TIPOS,
  DE_V0,
  A_V0,
  esIdV1,
  esIdV0,
  esId,
  personaOk,
  parteOk,
  aArchivo,
  deArchivo,
  nombreOk,
  tipoKit,
  huella,
  textoDe,
  parsear,
  leerJson,
  serializar,
  hex4,
  sello,
  escribirAtomico,
  normalizar,
  idsDe,
  exacto,
  comodin,
  turnosDe,
  msDe,
};
