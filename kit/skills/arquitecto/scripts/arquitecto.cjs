'use strict';
// arquitecto.cjs — los scripts del Arquitecto (SPEC-paquete-4 P1.4 y P1.8; H §8.1, §9, §12; E §9). Uso:
//   node <skill>/scripts/arquitecto.cjs sello <spec> [--no-partir "<quién>"] [--no-aplica tamaño|entorno "<razón>"]
//   node <skill>/scripts/arquitecto.cjs ready <spec>
//   node <skill>/scripts/arquitecto.cjs ready --pendientes          (parado en la raíz del repo)
//   node <skill>/scripts/arquitecto.cjs tope <spec>
//   node <skill>/scripts/arquitecto.cjs entorno
//   node <skill>/scripts/arquitecto.cjs registro <carpeta de proyectos>
// El sello lo escribe este script, nunca el modelo: `sello` corre los chequeos (tamaño, entorno, tope) y escribe la línea con el
// hash del spec; `ready` se niega sin sello válido o con el spec tocado después, y cambia BORRADOR por READY y nada más.
// "¿Hay ficha?" = .claude/kit.md en el disco de la raíz del checkout del spec, igual en `sello` y en `ready` (r1-7).
// La versión del kit sale de <skill>/../../VERSION por __dirname, nunca de os.homedir() (r1-15).
// Salidas: 0 anduvo · 1 negado o con fallas (una línea por qué, con qué hacer) · 2 mal llamado. Error propio: "arquitecto roto: …", 1.
// Plazos (para las pruebas): ARQUITECTO_PLAZO_TEST_MS (comando-test, 5 min) y ARQUITECTO_PLAZO_CHEQUEO_MS (cada chequeo, 30 s).
// Node estándar, cero dependencias. Es .cjs a propósito: corre igual en proyectos con "type": "module".

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const S = require('./lib/sello.cjs');
const ficha = require('./lib/ficha.cjs');

const USO = [
  'Uso: node <skill>/scripts/arquitecto.cjs <comando> …',
  '  sello <spec> [--no-partir "<quién>"] [--no-aplica tamaño|entorno "<razón>"]',
  '  ready <spec>',
  '  ready --pendientes          (parado en la raíz del repo)',
  '  tope <spec>',
  '  entorno',
  '  registro <carpeta de proyectos>',
].join('\n');

const PLAZO_TEST_MS = 5 * 60 * 1000;
const PLAZO_CHEQUEO_MS = 30 * 1000;
const GATE = 'gate:entorno-prueba';

class MalLlamado extends Error {}
class Roto extends Error {}
const malLlamado = (m) => {
  throw new MalLlamado(m);
};

// ---------------------------------------------------------------- argumentos

function leerArgumentos(argv) {
  const [comando, ...resto] = argv;
  if (!comando) malLlamado('Falta el comando.');
  const a = { comando, pos: [], noPartir: null, noAplica: {}, pendientes: false };
  const POS = { sello: 1, ready: 1, tope: 1, entorno: 0, registro: 1 };
  if (!Object.prototype.hasOwnProperty.call(POS, comando)) malLlamado(`Comando desconocido: ${comando}`);
  for (let i = 0; i < resto.length; i++) {
    const x = resto[i];
    if (comando === 'sello' && x === '--no-partir') {
      if (a.noPartir !== null) malLlamado('--no-partir va una sola vez.');
      if (i + 1 >= resto.length) malLlamado('--no-partir pide quién decidió no partir.');
      a.noPartir = textoLibre(resto[++i], '--no-partir');
    } else if (comando === 'sello' && x === '--no-aplica') {
      if (i + 2 >= resto.length) malLlamado('--no-aplica pide tamaño o entorno, y la razón.');
      let que = resto[++i];
      if (que === 'tamano') que = 'tamaño';
      if (que !== 'tamaño' && que !== 'entorno') malLlamado('--no-aplica va con tamaño o entorno.');
      if (Object.prototype.hasOwnProperty.call(a.noAplica, que)) malLlamado(`--no-aplica ${que} va una sola vez.`);
      a.noAplica[que] = textoLibre(resto[++i], `--no-aplica ${que}`);
    } else if (comando === 'ready' && x === '--pendientes') {
      a.pendientes = true;
    } else if (x.startsWith('--')) {
      malLlamado(`Argumento desconocido: ${x}`);
    } else {
      a.pos.push(x);
    }
  }
  const pedidos = comando === 'ready' && a.pendientes ? 0 : POS[comando];
  if (a.pos.length !== pedidos) {
    if (comando === 'ready') malLlamado('ready lleva un spec, o --pendientes solo.');
    malLlamado(`${comando} lleva ${pedidos} argumento(s) además de las banderas.`);
  }
  return a;
}

function textoLibre(v, donde) {
  const t = String(v).trim();
  if (!S.textoLibreValido(t)) malLlamado(`${donde}: el texto no puede estar vacío ni llevar " · ", comillas invertidas o saltos de línea.`);
  return t;
}

// ---------------------------------------------------------------- utilidades

const dos = (n) => String(n).padStart(2, '0');
const hoy = (d) => `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
const RE_DIA = /^\d{4}-\d{2}-\d{2}$/;

// La versión del kit: <skill>/../../VERSION (en el repo, kit/VERSION; instalado, ~/.claude/VERSION).
function versionKit() {
  const ruta = path.join(__dirname, '..', '..', '..', 'VERSION');
  let t;
  try {
    t = fs.readFileSync(ruta, 'utf8').replace(/^﻿/, '').trim();
  } catch (e) {
    throw new Roto(`no encuentro la versión del kit (${ruta})`);
  }
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(t)) throw new Roto(`la versión del kit no es X.Y.Z (${ruta})`);
  return t;
}

// La raíz del checkout que contiene `dir` (git), o null si no está en un repo.
function raizDe(dir) {
  const r = spawnSync('git', ['rev-parse', '--show-toplevel'], { cwd: dir, encoding: 'utf8', windowsHide: true, timeout: 20000 });
  if (r.status !== 0 || !r.stdout.trim()) return null;
  return path.resolve(r.stdout.trim());
}

const rutaFicha = (raiz) => (raiz ? path.join(raiz, '.claude', 'kit.md') : null);
const hayFichaEn = (raiz) => !!raiz && fs.existsSync(rutaFicha(raiz));

// Los datos de la ficha, o { error } con el mensaje de ficha.cjs (que nunca repite un valor).
function leerFicha(raiz) {
  try {
    return { datos: ficha.leerArchivo(rutaFicha(raiz)).datos };
  } catch (e) {
    if (e instanceof ficha.ErrorFicha) return { error: e.mensaje, linea: e.linea };
    return { error: 'no se pudo leer el archivo', linea: 0 };
  }
}

// gate:entorno-prueba en frenos.quitados, vigente (siempre, o una fecha que no pasó; el día de hasta incluido). → el quitado o null.
function gateQuitado(datos, ahora) {
  const q = datos && datos.frenos && Array.isArray(datos.frenos.quitados) ? datos.frenos.quitados : [];
  const h = hoy(ahora);
  return q.find((x) => x && x.id === GATE && (x.hasta === 'siempre' || (RE_DIA.test(x.hasta) && x.hasta >= h))) || null;
}

// El spec en bytes; UTF-16 se frena con un mensaje claro.
function leerSpec(abs) {
  let buf;
  try {
    buf = fs.readFileSync(abs);
  } catch (e) {
    return { error: `no encuentro el spec ${abs}: revisá la ruta` };
  }
  if (buf.length >= 2 && ((buf[0] === 0xff && buf[1] === 0xfe) || (buf[0] === 0xfe && buf[1] === 0xff))) {
    return { error: 'el spec está guardado en UTF-16: guardalo en UTF-8' };
  }
  return { buf };
}

// Escritura atómica: a un temporal al lado y rename.
function escribirAtomico(abs, buf) {
  const tmp = `${abs}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, buf);
  fs.renameSync(tmp, abs);
}

// Si el spec vive en docs/modulos/<x>/: <x>; si no, null.
function moduloDe(raiz, specAbs) {
  const dir = path.dirname(specAbs);
  const seg = raiz ? path.relative(raiz, dir).split(path.sep) : dir.split(path.sep).slice(-3);
  if (seg.length === 3 && seg[0] === 'docs' && seg[1] === 'modulos' && seg[2] && seg[2] !== '..') return seg[2];
  return null;
}

// Un campo de la cabecera de la ficha del módulo (`Estado:`, `director:`, `rama:`), como lo lee el hook (inyeccion.cjs).
function campoModulo(texto, clave) {
  const re = new RegExp(`^\\s*(?:-\\s+)?${clave}:\\s*(.*)$`);
  let t = String(texto);
  if (t.charCodeAt(0) === 0xfeff) t = t.slice(1);
  for (const l of t.replace(/\r\n?/g, '\n').split('\n')) {
    const m = re.exec(l);
    if (m) return m[1].replace(/^[`*_"]+|[`*_"]+$/g, '').trim();
  }
  return null;
}

const plazoTexto = (ms) => (ms >= 60000 && ms % 60000 === 0 ? `${ms / 60000} min` : `${Math.round(ms / 1000)} s`);
function plazo(env, nombre, porDefecto) {
  const v = Number(env[nombre]);
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : porDefecto;
}

// Corre un comando de la ficha en la raíz, sin mostrar su salida. → 'verde' | 'rojo' | 'colgado'.
function correr(comando, cwd, ms) {
  const r = spawnSync(comando, { cwd, shell: true, stdio: 'ignore', timeout: ms, windowsHide: true });
  if (r.error && r.error.code === 'ETIMEDOUT') return 'colgado';
  if (r.signal) return 'colgado';
  return r.status === 0 ? 'verde' : 'rojo';
}

// ---------------------------------------------------------------- los chequeos

// tamaño: { c, tamano } o { fallas }.
function chequearTamano(lineas, { raiz, specAbs, hayFicha, noAplica }) {
  if (noAplica !== undefined) {
    if (hayFicha) return { fallas: ['tamaño: con ficha del kit no se saltea — escribí ## Ejecución con "módulo solo" o "módulo con director"'] };
    return { c: S.cNo(noAplica), tamano: null };
  }
  const ej = S.ejecucion(lineas);
  if (!ej.hay) {
    return {
      fallas: [hayFicha
        ? 'tamaño: falta ## Ejecución — escribila con "módulo solo" o "módulo con director" en su primera línea'
        : 'tamaño: falta ## Ejecución — escribila, o (sin ficha del kit) --no-aplica tamaño "<razón>"'],
    };
  }
  if (!ej.tamano) return { fallas: ['tamaño: la primera línea de ## Ejecución no dice "módulo solo" ni "módulo con director" — decilo ahí'] };
  const x = moduloDe(raiz, specAbs);
  if (x !== null) {
    const readme = path.join(path.dirname(specAbs), 'README.md');
    if (fs.existsSync(readme)) {
      const texto = fs.readFileSync(readme, 'utf8');
      let dir = campoModulo(texto, 'director');
      if (dir === 'si') dir = 'sí';
      const quiere = ej.tamano === 'director' ? 'sí' : 'no';
      if (dir === null) return { fallas: [`tamaño: la ficha del módulo (docs/modulos/${x}/README.md) no dice director: — agregá "director: ${quiere}"`] };
      if (dir !== quiere) return { fallas: [`tamaño: la Ejecución dice ${S.TOPES[ej.tamano].nombre} y la ficha del módulo dice director: ${dir} — que digan lo mismo`] };
      if (ej.tamano === 'director' && campoModulo(texto, 'rama') !== `modulo/${x}`) {
        return { fallas: [`tamaño: con director, la ficha del módulo tiene que decir rama: modulo/${x}`] };
      }
    }
  }
  return { c: S.cOk(), tamano: ej.tamano };
}

// entorno (gate:entorno-prueba, H §9.2) con la ficha ya leída: { c } o { fallas }.
function chequearEntornoFicha(raiz, datos, { ahora, env }) {
  const q = gateQuitado(datos, ahora);
  if (q) {
    const por = String(q.por).trim();
    if (!S.textoLibreValido(por)) return { fallas: [`entorno: el "por" de ${GATE} en frenos.quitados lleva " · " o comillas invertidas — cambialo en la ficha`] };
    return { c: S.cNo(`quitado: ${por}`) };
  }
  const fallas = [];
  const entornos = datos.entornos && typeof datos.entornos === 'object' ? datos.entornos : {};
  const lista = Object.entries(entornos);
  const reales = lista.filter(([, v]) => v.clase === 'real');
  const dePrueba = lista.filter(([, v]) => v.clase === 'dummy' || v.clase === 'prueba');
  if (reales.length && !dePrueba.length) {
    fallas.push('entorno: hay un entorno clase: real y ningún dummy ni prueba — declaralo en entornos: de la ficha (montarlo es la tarea 0 del spec)');
  }
  if (!reales.length) {
    const ct = datos.vars ? datos.vars['comando-test'] : undefined;
    if (ct === undefined) fallas.push('entorno: sin entorno real hace falta vars.comando-test en la ficha — agregalo');
    else if (typeof ct !== 'string' || ct.trim() === '') fallas.push('entorno: vars.comando-test tiene que ser un comando (un texto) — corregilo en la ficha');
    else {
      const ms = plazo(env, 'ARQUITECTO_PLAZO_TEST_MS', PLAZO_TEST_MS);
      const r = correr(ct, raiz, ms);
      if (r === 'rojo') fallas.push('entorno: comando-test dio rojo — arreglalo antes de sellar (o quitá gate:entorno-prueba con su razón)');
      if (r === 'colgado') fallas.push(`entorno: comando-test se colgó (pasó los ${plazoTexto(ms)}) — revisalo antes de sellar`);
    }
  }
  const herramientas = datos.herramientas && typeof datos.herramientas === 'object' ? datos.herramientas : {};
  const nombradas = [...new Set(lista.flatMap(([, v]) => (Array.isArray(v.herramientas) ? v.herramientas : [])))];
  const ms = plazo(env, 'ARQUITECTO_PLAZO_CHEQUEO_MS', PLAZO_CHEQUEO_MS);
  for (const h of nombradas) {
    const def = herramientas[h];
    if (!def || typeof def.chequeo !== 'string') {
      fallas.push(`entorno: la herramienta ${h} no tiene chequeo en la ficha — agregalo`);
      continue;
    }
    const r = correr(def.chequeo, raiz, ms);
    if (r === 'rojo') fallas.push(`entorno: el chequeo de la herramienta ${h} dio rojo — que ande antes de sellar`);
    if (r === 'colgado') fallas.push(`entorno: el chequeo de la herramienta ${h} se colgó (pasó los ${plazoTexto(ms)})`);
  }
  return fallas.length ? { fallas } : { c: S.cOk() };
}

function chequearEntorno({ raiz, hayFicha, datos, noAplica, ahora, env }) {
  if (noAplica !== undefined) {
    if (hayFicha) return { fallas: [`entorno: con ficha del kit no se saltea — quitá ${GATE} en frenos.quitados con su razón, si de verdad no aplica`] };
    return { c: S.cNo(noAplica) };
  }
  if (!hayFicha) return { c: S.cNo('sin ficha del kit') };
  return chequearEntornoFicha(raiz, datos, { ahora, env });
}

// tope (H §12, avisa y no corta): { c, lineas } o { fallas }.
function chequearTope(buf, tamano, noPartir) {
  const m = S.medirTope(buf, tamano);
  if (!m.pasado) return { c: S.cOk(), medida: m };
  if (noPartir === null) return { fallas: S.lineasTope(m) };
  return { c: S.cAviso(m.kb, m.criterios, noPartir), medida: m };
}

// ---------------------------------------------------------------- los comandos

function sello(a, { cwd, ahora, env }) {
  const specAbs = path.resolve(cwd, a.pos[0]);
  const s = leerSpec(specAbs);
  if (s.error) return { codigo: 1, lineas: [`sello: ${s.error}`] };
  const kit = versionKit();
  const raiz = raizDe(path.dirname(specAbs));
  const hayFicha = hayFichaEn(raiz);
  let datos = null;
  if (hayFicha) {
    const f = leerFicha(raiz);
    if (f.error) return { codigo: 1, lineas: [`sello: la ficha (.claude/kit.md) no se lee, línea ${f.linea}: ${f.error} — arreglala y corré sello de nuevo`] };
    datos = f.datos;
  }
  const lineas = S.renglones(s.buf);
  const fallas = [];
  const tam = chequearTamano(lineas, { raiz, specAbs, hayFicha, noAplica: a.noAplica['tamaño'] });
  if (tam.fallas) fallas.push(...tam.fallas);
  const ent = chequearEntorno({ raiz, hayFicha, datos, noAplica: a.noAplica.entorno, ahora, env });
  if (ent.fallas) fallas.push(...ent.fallas);
  const top = chequearTope(s.buf, tam.fallas ? null : tam.tamano, a.noPartir);
  if (top.fallas) fallas.push(...top.fallas);
  // Dónde va la línea (con un renglón de prueba: el hash no la mira).
  const campos = { fecha: hoy(ahora), kit, tamano: tam.c, entorno: ent.c, tope: top.c, hash: '000000000000' };
  const prueba = S.ponerLinea(s.buf, S.armar(campos));
  if (prueba.error) fallas.push(`sello: ${prueba.error}`);
  if (fallas.length) return { codigo: 1, lineas: ['sello: no se escribió nada —', ...fallas] };
  campos.hash = S.hash(prueba.nuevo);
  const renglon = S.armar(campos);
  const final = S.ponerLinea(s.buf, renglon).nuevo;
  escribirAtomico(specAbs, final);
  // Relee y compara: lo escrito es lo pensado, y el sello vale.
  const leido = fs.readFileSync(specAbs);
  const r = S.revisarSello(leido, { hayFicha, gateQuitado: () => !!gateQuitado(datos, ahora) });
  if (!leido.equals(final) || r.estado !== 'ok') throw new Roto('lo que quedó escrito no es el sello que se armó');
  return { codigo: 0, lineas: [`sellado: ${renglon}`, `ahora: el OK de Guido y después ready ${a.pos[0]}`] };
}

// ¿El sello del spec vale? Con la ficha leída solo si hace falta (entorno "— (quitado: …)").
function revisar(buf, raiz, ahora) {
  const hayFicha = hayFichaEn(raiz);
  const gate = () => {
    const f = leerFicha(raiz);
    return !f.error && !!gateQuitado(f.datos, ahora);
  };
  return S.revisarSello(buf, { hayFicha, gateQuitado: gate });
}

function ready(a, { cwd, ahora }) {
  if (a.pendientes) return pendientes({ cwd, ahora });
  const specAbs = path.resolve(cwd, a.pos[0]);
  const s = leerSpec(specAbs);
  if (s.error) return { codigo: 1, lineas: [`ready: ${s.error}`] };
  const raiz = raizDe(path.dirname(specAbs));
  const r = revisar(s.buf, raiz, ahora);
  if (r.estado === 'sin') return { codigo: 1, lineas: ['spec sin sello: corré el Arquitecto (Modo B)'] };
  if (r.estado === 'invalido') return { codigo: 1, lineas: [`sello inválido: ${r.error} — corré sello de nuevo`] };
  if (r.estado === 'cambio') return { codigo: 1, lineas: ['el spec cambió después del sello: corré sello de nuevo'] };
  const lineas = S.renglones(s.buf);
  const porRuta = moduloDe(raiz, specAbs) !== null && path.basename(specAbs) === 'SPEC.md';
  const falta = S.faltantes(lineas, S.esDelta(lineas, porRuta));
  if (falta.length) return { codigo: 1, lineas: falta.map((x) => `ready: ${x} — agregalas y corré sello de nuevo`) };
  const p = S.pasarAReady(s.buf);
  if (p.error) return { codigo: 1, lineas: [`ready: ${p.error}`] };
  if (p.ya) return { codigo: 0, lineas: ['ready: ya estaba READY'] };
  escribirAtomico(specAbs, p.nuevo);
  const leido = fs.readFileSync(specAbs);
  const antes = S.renglones(s.buf);
  const despues = S.renglones(leido);
  const iEstado = S.ubicar(antes).estado;
  const soloEsa = antes.length === despues.length && antes.every((l, i) => i === iEstado || l === despues[i]);
  if (!leido.equals(p.nuevo) || !soloEsa || S.hash(leido) !== r.campos.hash) {
    escribirAtomico(specAbs, s.buf);
    throw new Roto('el cambio a READY no quedó como se pensó; el spec quedó como estaba');
  }
  return { codigo: 0, lineas: [`READY: ${a.pos[0]}`] };
}

// Una línea por módulo abierto cuyo SPEC.md no pasaría `ready` por el sello (r1-11). Sale 0 siempre.
function pendientes({ cwd, ahora }) {
  const raiz = raizDe(cwd) || path.resolve(cwd);
  const base = path.join(raiz, 'docs', 'modulos');
  let dirs = [];
  try {
    dirs = fs.readdirSync(base, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
  } catch (e) {
    return { codigo: 0, lineas: [] };
  }
  const lineas = [];
  for (const x of dirs) {
    let estado = null;
    try {
      estado = campoModulo(fs.readFileSync(path.join(base, x, 'README.md'), 'utf8'), 'Estado');
    } catch (e) {
      estado = null;
    }
    if (estado !== null && /^(COMPLETO|ABANDONADO)/.test(estado)) continue;
    const s = leerSpec(path.join(base, x, 'SPEC.md'));
    if (s.error) {
      lineas.push(`${x} · sin sello`);
      continue;
    }
    const r = revisar(s.buf, raiz, ahora);
    if (r.estado === 'cambio') lineas.push(`${x} · cambió después del sello`);
    else if (r.estado !== 'ok') lineas.push(`${x} · sin sello`);
  }
  return { codigo: 0, lineas };
}

function tope(a, { cwd }) {
  const specAbs = path.resolve(cwd, a.pos[0]);
  const s = leerSpec(specAbs);
  if (s.error) return { codigo: 1, lineas: [`tope: ${s.error}`] };
  const ej = S.ejecucion(S.renglones(s.buf));
  return { codigo: 0, lineas: S.lineasTope(S.medirTope(s.buf, ej.tamano)) };
}

function entorno(a, { cwd, ahora, env }) {
  const raiz = raizDe(cwd) || path.resolve(cwd);
  if (!hayFichaEn(raiz)) return { codigo: 0, lineas: [`entorno ${S.cNo('sin ficha del kit')}: no hay .claude/kit.md en ${raiz}`] };
  const f = leerFicha(raiz);
  if (f.error) return { codigo: 1, lineas: [`entorno: la ficha (.claude/kit.md) no se lee, línea ${f.linea}: ${f.error} — arreglala`] };
  const r = chequearEntornoFicha(raiz, f.datos, { ahora, env });
  if (r.fallas) return { codigo: 1, lineas: r.fallas };
  return { codigo: 0, lineas: [`entorno ${r.c}`] };
}

// El adaptador de ejemplo del registro (E §9): una ficha por <carpeta>/*/.claude/kit.md que se lee.
function registro(a, { cwd, error }) {
  const carpeta = path.resolve(cwd, a.pos[0]);
  let dirs;
  try {
    dirs = fs.readdirSync(carpeta, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
  } catch (e) {
    return { codigo: 1, lineas: [`registro: no encuentro la carpeta ${carpeta}`] };
  }
  const fichas = [];
  const conexiones = [];
  for (const nombre of dirs) {
    const d = path.join(carpeta, nombre);
    const k = path.join(d, '.claude', 'kit.md');
    if (!fs.existsSync(k)) continue;
    let datos;
    try {
      datos = ficha.leerArchivo(k).datos;
    } catch (e) {
      const que = e instanceof ficha.ErrorFicha ? `línea ${e.linea}: ${e.mensaje}` : 'no se pudo leer';
      error(`registro: ${nombre}/.claude/kit.md no se lee (${que}): se saltea\n`);
      continue;
    }
    const alias = datos.vars && typeof datos.vars.proyecto === 'string' && datos.vars.proyecto.trim() ? datos.vars.proyecto : nombre;
    const g = spawnSync('git', ['remote', 'get-url', 'origin'], { cwd: d, encoding: 'utf8', windowsHide: true, timeout: 20000 });
    const repo = g.status === 0 && g.stdout.trim() ? g.stdout.trim() : null;
    const tipo = datos.nivel === 'liviano' ? 'sin código' : 'código';
    fichas.push({ alias, repo, tipo, kit: datos.kit });
    if (datos.mesa && typeof datos.mesa === 'object') {
      for (const b of Object.keys(datos.mesa)) conexiones.push({ de: alias, a: b, texto: 'mesa' });
    }
  }
  return { codigo: 0, lineas: [JSON.stringify({ version: 1, fichas, conexiones }, null, 2)] };
}

// ---------------------------------------------------------------- main

function main(argv, opciones = {}) {
  const salida = opciones.salida || ((s) => process.stdout.write(s));
  const error = opciones.error || ((s) => process.stderr.write(s));
  const ctx = { cwd: opciones.cwd || process.cwd(), ahora: opciones.ahora || new Date(), env: opciones.env || process.env, error };
  let r;
  try {
    const a = leerArgumentos(argv);
    const cmd = { sello, ready, tope, entorno, registro }[a.comando];
    r = cmd(a, ctx);
  } catch (e) {
    if (e instanceof MalLlamado) {
      error(`${e.message}\n${USO}\n`);
      return 2;
    }
    salida(`arquitecto roto: ${e instanceof Roto ? e.message : 'error inesperado'}\n`);
    return 1;
  }
  if (r.lineas.length) salida(`${r.lineas.join('\n')}\n`);
  return r.codigo;
}

if (require.main === module) {
  let codigo = 1;
  try {
    codigo = main(process.argv.slice(2));
  } catch (e) {
    try {
      process.stdout.write('arquitecto roto: error inesperado\n');
    } catch (e2) {
      /* nada más que hacer: la salida 1 frena igual */
    }
  }
  process.exitCode = codigo;
}

module.exports = { USO, main, leerArgumentos, versionKit, raizDe, campoModulo, gateQuitado, PLAZO_TEST_MS, PLAZO_CHEQUEO_MS };
