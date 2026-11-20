'use strict';
// turno.cjs — el turno de lo pesado de esta PC, a la vista (SPEC-PO A1; el turno es `conTurno`, hooks/lib/proceso.cjs). Uso:
//   node .claude/scripts/turno.cjs ver                       quién tiene el turno (etiqueta, carpeta, desde cuándo), quién espera
//                                                            y la memoria libre; sin nadie, "libre"
//   node .claude/scripts/turno.cjs rastro [--desde <fecha>]  los renglones del rastro (uno por corrida), tal cual, y al final dos
//                                                            cuentas: cuántas corridas y la menor memoria libre al entrar
// La carpeta del candado es la de conTurno (KIT_TURNO_DIR solo en las pruebas); el rastro (kit-turno-rastro.log) y las esperas
// (kit-turno-esperas/) viven al lado, en la carpeta que la contiene. `ver` solo lee el turno; de las esperas, ignora y BORRA las de
// un proceso muerto o de más de 60 min (las deja un conTurno que murió esperando). `correr` no existe (ADR-044: solo si la compuerta
// lo pide). Solo información: no toma ni suelta el turno, nada frena por esto.
// Salidas: 0 anduvo · 2 mal llamado. Node estándar, cero dependencias. Es .cjs a propósito: corre igual con "type": "module".

const fs = require('fs');
const os = require('os');
const path = require('path');
const P = require('../hooks/lib/proceso.cjs');

const USO = [
  'Uso: node .claude/scripts/turno.cjs <ver | rastro [--desde AAAA-MM-DD]>',
  '  ver                     quién tiene el turno de lo pesado en esta PC, quién espera y la memoria libre',
  '  rastro [--desde <f>]    las corridas que pasaron por el turno y dos cuentas al final',
].join('\n');

const ESPERA_VIEJA_MS = 60 * 60 * 1000;
const MB = 1024 * 1024;
const dos = (n) => String(n).padStart(2, '0');
const hhmm = (d) => `${dos(d.getHours())}:${dos(d.getMinutes())}`;
const plano = (s, tope = 120) => String(s === undefined || s === null ? '' : s).replace(/[\r\n\t]+/g, ' ').slice(0, tope);

function rutas(opciones = {}) {
  const dir = opciones.dir || P.turnoDir();
  const base = path.dirname(dir);
  return { dir, base, rastro: path.join(base, P.TURNO_RASTRO), esperas: path.join(base, P.TURNO_ESPERAS) };
}

const leerJson = (f) => {
  try {
    return JSON.parse(fs.readFileSync(f, 'utf8'));
  } catch (e) {
    return null;
  }
};

// La foto del turno: { tiene: {quien, etiqueta, carpeta, desde, pid} | null, huerfano, esperan: [...], libre, total }.
function foto(opciones = {}) {
  const r = rutas(opciones);
  const vivo = opciones.vivo || P.procesoVivo;
  const ahora = opciones.ahora ? opciones.ahora.getTime() : Date.now();
  let tiene = null;
  let huerfano = false;
  if (fs.existsSync(r.dir)) {
    const q = leerJson(path.join(r.dir, 'quien.json'));
    if (q && vivo(q.pid)) tiene = q;
    else if (q) huerfano = true;
    else tiene = { quien: 'otra corrida (todavía sin quien.json)', desde: null };
  }
  const esperan = [];
  let nombres = [];
  try {
    nombres = fs.readdirSync(r.esperas).filter((n) => /^espera-\d+\.json$/.test(n));
  } catch (e) {
    nombres = [];
  }
  for (const n of nombres.sort()) {
    const f = path.join(r.esperas, n);
    const e = leerJson(f);
    const desde = e ? Date.parse(e.desde) : NaN;
    if (!e || !vivo(e.pid) || !Number.isFinite(desde) || ahora - desde > ESPERA_VIEJA_MS) {
      try {
        fs.rmSync(f, { force: true });
      } catch (e2) {
        /* la próxima */
      }
      continue;
    }
    esperan.push(e);
  }
  esperan.sort((a, b) => Date.parse(a.desde) - Date.parse(b.desde));
  return { tiene, huerfano, esperan, libre: os.freemem(), total: os.totalmem() };
}

const nombre = (q) => (q.etiqueta && q.etiqueta !== q.quien ? `${plano(q.etiqueta)} (${plano(q.quien)})` : plano(q.etiqueta || q.quien));
function cuando(iso, ahora) {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return 'desde —';
  return `desde ${hhmm(new Date(t))} (hace ${Math.max(0, Math.round((ahora - t) / 60000))} min)`;
}

function lineasVer(opciones = {}) {
  const f = foto(opciones);
  const ahora = opciones.ahora ? opciones.ahora.getTime() : Date.now();
  const L = [];
  if (f.tiene) L.push(`turno: lo tiene ${nombre(f.tiene)} · carpeta ${plano(f.tiene.carpeta, 300) || '—'} · ${cuando(f.tiene.desde, ahora)}`);
  else L.push(f.huerfano ? 'turno: libre (quedó el candado de un proceso que ya no existe: el próximo lo toma)' : 'turno: libre');
  for (const e of f.esperan) L.push(`espera: ${plano(e.etiqueta || e.quien)} · carpeta ${plano(e.carpeta, 300) || '—'} · ${cuando(e.desde, ahora)}`);
  L.push(`memoria libre: ${Math.round(f.libre / MB)} MB de ${Math.round(f.total / MB)} MB`);
  return L;
}

// El turno en una línea (estado.cjs --obra).
function lineaCorta(opciones = {}) {
  const f = foto(opciones);
  const libre = `memoria libre ${Math.round(f.libre / MB)} MB`;
  if (!f.tiene) return `turno: libre · ${libre}`;
  const d = Date.parse(f.tiene.desde);
  return `turno: lo tiene ${nombre(f.tiene)} desde ${Number.isFinite(d) ? hhmm(new Date(d)) : '—'} · ${f.esperan.length} esperan · ${libre}`;
}

function lineasRastro(opciones = {}, desde = null) {
  let t = '';
  try {
    t = fs.readFileSync(rutas(opciones).rastro, 'utf8');
  } catch (e) {
    t = '';
  }
  const ls = t.replace(/\r\n/g, '\n').split('\n').filter((l) => l.trim() && (!desde || l.slice(0, 10) >= desde));
  const libres = ls.map((l) => /· libre (\d+) MB$/.exec(l)).filter(Boolean).map((m) => Number(m[1]));
  return [...ls, `corridas: ${ls.length} · menor memoria libre al entrar: ${libres.length ? `${Math.min(...libres)} MB` : '—'}`];
}

function main(argv, opciones = {}) {
  const salida = opciones.salida || ((s) => process.stdout.write(s));
  const error = opciones.error || ((s) => process.stderr.write(s));
  const mal = (m) => {
    error(`${m}\n${USO}\n`);
    return 2;
  };
  const [verbo, ...resto] = argv;
  if (verbo === '--ayuda' || verbo === '-h') {
    salida(`${USO}\n`);
    return 0;
  }
  if (verbo === 'ver') {
    if (resto.length) return mal('`ver` no lleva argumentos.');
    salida(`${lineasVer(opciones).join('\n')}\n`);
    return 0;
  }
  if (verbo === 'rastro') {
    let desde = null;
    if (resto.length) {
      if (resto[0] !== '--desde' || resto.length !== 2 || !/^\d{4}-\d{2}-\d{2}$/.test(resto[1])) return mal('`rastro` lleva, a lo sumo, --desde AAAA-MM-DD.');
      desde = resto[1];
    }
    salida(`${lineasRastro(opciones, desde).join('\n')}\n`);
    return 0;
  }
  return mal(verbo ? `Verbo desconocido: ${plano(verbo, 30)}` : 'Falta el verbo.');
}

module.exports = { USO, rutas, foto, lineasVer, lineaCorta, lineasRastro, main };

if (require.main === module) {
  let codigo = 2;
  try {
    codigo = main(process.argv.slice(2));
  } catch (e) {
    process.stderr.write(`turno roto: ${e && e.message}\n`);
  }
  process.exitCode = codigo;
}
