'use strict';
// locks.cjs — el lock del proyecto atrasado, visto ANTES (SPEC-paquete-8c p1 (a); D8c-9: se lee, nunca se corre el instalador).
// Lo usan `adoptar --mirar` (lib/adoptar.cjs) y el `doctor` parado en un proyecto. SOLO LEE: ni npm, ni pnpm, ni node_modules.
//
//   mirarLocks(raiz, { setup }) → [{ tipo: 'atrasado' | 'sin-lock' | 'no-se', archivo, gestor, carpeta, detalles: [...] }]
//   lineas(hallazgos) → un renglón por hallazgo (vacío si está todo al día). Nada lo arregla solo.
//
// Qué mira: el package.json de la raíz, el de cada subcarpeta de primer nivel (sin node_modules ni las que empiezan con punto) y
// el de las carpetas que nombra el comando-setup (`--prefix x`, `--prefix=x`, `-C x`, `--dir x`, `cd x &&`). Con un workspace
// (pnpm-workspace.yaml, o `workspaces` en el package.json de la raíz), además cada importer del lock de la raíz contra el
// package.json de su ruta, a cualquier profundidad (el bot: extensions/twilio-whatsapp), y cada package.json de los patrones del
// workspace sin importer → "falta en el lock". Las `workspace:*` se comparan como texto (el specifier es el mismo).
//   - sin lock (ni al lado ni el de la raíz con su importer) y con dependencias → sin-lock;
//   - npm (package-lock.json o npm-shrinkwrap.json, lockfileVersion ≥ 2): cada dependencia de dependencies/devDependencies/
//     optionalDependencies tiene que estar en packages["<ruta>"] ("" en la raíz) con el MISMO rango;
//   - pnpm (pnpm-lock.yaml con importers): el importer de la ruta ("." en la raíz), leído por clave exacta (con o sin comillas,
//     renglón por renglón con su sangría; nunca texto suelto: openai no calza con openai-edge); su specifier igual al rango
//     (lockfile 6+: `specifier:` por dependencia; 5.x: el mapa `specifiers:`);
//   - yarn (yarn.lock): una clave anclada al comienzo del renglón, con o sin comillas, partida por ", ", que tenga
//     <nombre>@<rango> (o <nombre>@npm:<rango>); las dependencias entre miembros del workspace no se buscan;
//   - lockfileVersion < 2, pnpm sin importers o un lock que no se puede leer → no-se: "lo prueba la flota" (nunca inventa faltantes).
// Node estándar, cero dependencias. Es .cjs a propósito: corre igual en proyectos con "type": "module".

const fs = require('fs');
const path = require('path');

const NPM = ['package-lock.json', 'npm-shrinkwrap.json'];
const PNPM = 'pnpm-lock.yaml';
const YARN = 'yarn.lock';
const GRUPOS = ['dependencies', 'devDependencies', 'optionalDependencies'];
const NO_BAJAR = new Set(['node_modules', '.git']);
const esMapa = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const barras = (p) => String(p).replace(/\\/g, '/');

function leerTexto(abs) {
  try {
    return fs.readFileSync(abs, 'utf8').replace(/^﻿/, '');
  } catch (e) {
    return null;
  }
}
const existeArchivo = (abs) => {
  try {
    return fs.statSync(abs).isFile();
  } catch (e) {
    return false;
  }
};
// '' o 'a/b' (relativa a la raíz, con /, sin ./ ni barra final) → la ruta absoluta
const abs = (raiz, rel) => (rel ? path.join(raiz, ...rel.split('/')) : raiz);
function leerPaquete(raiz, rel) {
  const t = leerTexto(path.join(abs(raiz, rel), 'package.json'));
  if (t === null) return null;
  try {
    const j = JSON.parse(t);
    return esMapa(j) ? j : { roto: true };
  } catch (e) {
    return { roto: true };
  }
}
// Las dependencias del package.json → [[nombre, rango]] (en orden: dependencies, devDependencies, optionalDependencies).
function deps(pj) {
  const out = [];
  const vistos = new Set();
  for (const g of GRUPOS) {
    if (!esMapa(pj[g])) continue;
    for (const [k, v] of Object.entries(pj[g])) {
      if (vistos.has(k) || typeof v !== 'string') continue;
      vistos.add(k);
      out.push([k, v]);
    }
  }
  return out;
}

// ---------------------------------------------------------------- las carpetas

// Las carpetas que nombra el comando-setup: --prefix x, --prefix=x, -C x, --dir x (también --dir=x), cd x &&
function carpetasDelSetup(setup) {
  const s = String(setup || '');
  const out = [];
  const limpia = (x) => barras(x.replace(/^["']|["']$/g, '')).replace(/^\.\//, '').replace(/\/+$/, '');
  for (const m of s.matchAll(/(?:^|\s)(?:--prefix|--dir)(?:=|\s+)("[^"]+"|'[^']+'|[^\s;&|]+)/g)) out.push(limpia(m[1]));
  for (const m of s.matchAll(/(?:^|\s)-C\s+("[^"]+"|'[^']+'|[^\s;&|]+)/g)) out.push(limpia(m[1]));
  for (const m of s.matchAll(/(?:^|[\s;&|(])cd\s+("[^"]+"|'[^']+'|[^\s;&|]+)\s*&&/g)) out.push(limpia(m[1]));
  return [...new Set(out.filter((x) => x && x !== '.' && !x.startsWith('/') && !/^[A-Za-z]:/.test(x) && !x.split('/').includes('..')))];
}

// Los patrones del workspace: pnpm-workspace.yaml (packages:) o workspaces del package.json de la raíz (lista o {packages}).
function patronesWorkspace(raiz, pjRaiz) {
  const y = leerTexto(path.join(raiz, 'pnpm-workspace.yaml'));
  if (y !== null) {
    const pats = [];
    let dentro = false;
    for (const crudo of y.split('\n')) {
      const l = crudo.replace(/\r$/, '').replace(/\s+#.*$/, '');
      if (/^packages\s*:\s*$/.test(l)) {
        dentro = true;
        continue;
      }
      if (/^packages\s*:\s*\[(.*)\]\s*$/.test(l)) {
        for (const x of /^packages\s*:\s*\[(.*)\]\s*$/.exec(l)[1].split(',')) if (x.trim()) pats.push(x.trim().replace(/^["']|["']$/g, ''));
        continue;
      }
      if (!dentro) continue;
      if (/^\S/.test(l)) {
        dentro = false;
        continue;
      }
      const m = /^\s+-\s+(.+?)\s*$/.exec(l);
      if (m) pats.push(m[1].replace(/^["']|["']$/g, ''));
    }
    return { hay: true, pats };
  }
  if (pjRaiz && !pjRaiz.roto) {
    const w = pjRaiz.workspaces;
    const lista = Array.isArray(w) ? w : esMapa(w) && Array.isArray(w.packages) ? w.packages : null;
    if (lista) return { hay: true, pats: lista.filter((x) => typeof x === 'string') };
  }
  return { hay: false, pats: [] };
}

// Un patrón de workspace (a/*, a/**, a/b, !a/x) → las carpetas relativas que calzan y tienen package.json.
function expandir(raiz, patron) {
  const segs = barras(patron).replace(/^\.\//, '').replace(/\/+$/, '').split('/').filter(Boolean);
  if (!segs.length || (segs.length === 1 && segs[0] === '.')) return [''];
  const reSeg = (s) => new RegExp(`^${s.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.')}$`);
  const hijos = (rel) => {
    try {
      return fs.readdirSync(abs(raiz, rel), { withFileTypes: true }).filter((e) => e.isDirectory() && !NO_BAJAR.has(e.name) && !e.name.startsWith('.')).map((e) => (rel ? `${rel}/${e.name}` : e.name));
    } catch (e) {
      return [];
    }
  };
  let actuales = [''];
  for (const s of segs) {
    const sig = [];
    if (s === '**') {
      for (const a of actuales) {
        const pila = [a];
        while (pila.length) {
          const x = pila.pop();
          sig.push(x);
          pila.push(...hijos(x));
        }
      }
    } else if (/[*?]/.test(s)) {
      const re = reSeg(s);
      for (const a of actuales) for (const h of hijos(a)) if (re.test(h.split('/').pop())) sig.push(h);
    } else {
      for (const a of actuales) {
        const h = a ? `${a}/${s}` : s;
        try {
          if (fs.statSync(abs(raiz, h)).isDirectory()) sig.push(h);
        } catch (e) {
          /* no está */
        }
      }
    }
    actuales = [...new Set(sig)];
  }
  return actuales.filter((r) => existeArchivo(path.join(abs(raiz, r), 'package.json')));
}
function miembros(raiz, pats) {
  const si = new Set();
  const no = new Set();
  for (const p of pats) {
    if (p.startsWith('!')) for (const r of expandir(raiz, p.slice(1))) no.add(r);
    else for (const r of expandir(raiz, p)) si.add(r);
  }
  return [...si].filter((r) => !no.has(r)).sort();
}

// ---------------------------------------------------------------- los lectores de cada lock

// npm: → { noSe } | { importers: Map(ruta → Map(nombre → rango)) } (rutas "" y "a/b"; los node_modules/… no son importers)
function leerNpm(texto) {
  let j;
  try {
    j = JSON.parse(texto);
  } catch (e) {
    return { noSe: 'no es un JSON' };
  }
  if (!esMapa(j)) return { noSe: 'no es un JSON de objeto' };
  if (!(Number(j.lockfileVersion) >= 2)) return { noSe: `lockfileVersion ${j.lockfileVersion === undefined ? 'sin poner' : j.lockfileVersion}` };
  if (!esMapa(j.packages)) return { noSe: 'sin packages' };
  const importers = new Map();
  for (const [k, v] of Object.entries(j.packages)) {
    if (!esMapa(v) || /(^|\/)node_modules\//.test(k)) continue;
    const m = new Map();
    for (const g of [...GRUPOS, 'peerDependencies']) if (esMapa(v[g])) for (const [n, r] of Object.entries(v[g])) if (!m.has(n) && typeof r === 'string') m.set(n, r);
    importers.set(k, m);
  }
  return { importers };
}

// Una clave de YAML de un renglón: `  'a/b':` → { sangria, clave, resto } (o null si no es "clave:")
const desquotar = (s) => {
  const t = s.trim();
  if (t.length >= 2 && t[0] === "'" && t[t.length - 1] === "'") return t.slice(1, -1).replace(/''/g, "'");
  if (t.length >= 2 && t[0] === '"' && t[t.length - 1] === '"') return t.slice(1, -1).replace(/\\"/g, '"');
  return t;
};
function claveYaml(l) {
  const m = /^( *)('(?:[^']|'')*'|"(?:[^"\\]|\\.)*"|[^'"\s:#][^:#]*?|[^'"\s:#]):(?:\s+(.*?))?\s*$/.exec(l);
  if (!m) return null;
  return { sangria: m[1].length, clave: desquotar(m[2]), resto: m[3] === undefined ? '' : m[3].replace(/\s+#.*$/, '') };
}

// pnpm: → { noSe } | { importers: Map(ruta → Map(nombre → specifier)) } (rutas "" y "a/b": el "." del lock es "")
function leerPnpm(texto) {
  const ls = texto.split('\n').map((l) => l.replace(/\r$/, ''));
  const i0 = ls.findIndex((l) => /^importers:\s*$/.test(l));
  if (i0 < 0) return { noSe: 'sin importers' };
  const importers = new Map();
  let sImp = null; // la sangría de las claves de importer
  let imp = null; // { mapa, sSec, sec, sDep, dep }
  for (let i = i0 + 1; i < ls.length; i++) {
    const l = ls[i];
    if (!l.trim() || /^\s*#/.test(l)) continue;
    if (/^\S/.test(l)) break; // la próxima clave de primer nivel: se terminaron los importers
    const k = claveYaml(l);
    if (!k) continue;
    if (sImp === null) sImp = k.sangria;
    if (k.sangria === sImp) {
      const ruta = k.clave === '.' ? '' : barras(k.clave).replace(/^\.\//, '');
      imp = { mapa: new Map(), sSec: null, sec: null, sDep: null, dep: null };
      importers.set(ruta, imp.mapa);
      continue;
    }
    if (!imp || k.sangria < sImp) continue;
    if (imp.sSec === null) imp.sSec = k.sangria;
    if (k.sangria === imp.sSec) {
      imp.sec = k.clave;
      imp.sDep = null;
      imp.dep = null;
      continue;
    }
    if (k.sangria < imp.sSec) continue;
    if (imp.sDep === null) imp.sDep = k.sangria;
    if (k.sangria === imp.sDep) {
      if (imp.sec === 'specifiers') {
        // 5.x: `specifiers:` con `nombre: rango`
        if (k.resto !== '') imp.mapa.set(k.clave, desquotar(k.resto));
        imp.dep = null;
      } else if (GRUPOS.includes(imp.sec)) {
        // 6+: `nombre:` y abajo `specifier:`; 5.x: `nombre: versión` (el rango sale de specifiers, que ya está en el mapa)
        imp.dep = k.resto === '' ? k.clave : null;
        if (k.resto !== '' && !imp.mapa.has(k.clave)) imp.mapa.set(k.clave, null); // 5.x sin specifiers: se sabe que está, no el rango
      } else imp.dep = null;
      continue;
    }
    if (k.sangria > imp.sDep && imp.dep && GRUPOS.includes(imp.sec) && k.clave === 'specifier') {
      imp.mapa.set(imp.dep, desquotar(k.resto));
    }
  }
  return { importers };
}

// yarn: → { noSe } | { claves: Set('nombre@rango') } (las de npm: también sin el npm:)
function leerYarn(texto) {
  const claves = new Set();
  for (const crudo of texto.split('\n')) {
    const l = crudo.replace(/\r$/, '');
    if (!l || /^[\s#]/.test(l) || !/:\s*$/.test(l)) continue;
    const cuerpo = l.replace(/:\s*$/, '');
    for (const parte of cuerpo.split(', ')) {
      const p = parte.trim().replace(/^"|"$/g, '');
      if (!p || p === '__metadata') continue;
      claves.add(p);
    }
  }
  if (!claves.size) return { noSe: 'no encontré ninguna clave' };
  return { claves };
}

// ---------------------------------------------------------------- comparar

function compararImporter(pj, mapa) {
  const out = [];
  for (const [n, r] of deps(pj)) {
    if (!mapa.has(n)) out.push(`falta ${n}`);
    else if (mapa.get(n) !== null && mapa.get(n) !== r) out.push(`${n}: ${r} en el package.json y ${mapa.get(n)} en el lock`);
  }
  return out;
}
function compararYarn(pj, claves, hermanos) {
  const out = [];
  for (const [n, r] of deps(pj)) {
    if (hermanos.has(n) || r.startsWith('workspace:')) continue;
    if (!claves.has(`${n}@${r}`) && !claves.has(`${n}@npm:${r}`)) out.push(`falta ${n}@${r}`);
  }
  return out;
}

const COMANDO = { npm: (c) => (c ? `npm install --prefix ${c}` : 'npm install'), pnpm: (c) => (c ? `pnpm --dir ${c} install` : 'pnpm install'), yarn: (c) => (c ? `yarn --cwd ${c} install` : 'yarn install') };

// Los locks de una carpeta → [{ gestor, archivo }] (el del gestor del proyecto primero; si se sabe cuál, solo ese).
function locksDe(raiz, rel, gestor) {
  const hay = [];
  if (existeArchivo(path.join(abs(raiz, rel), PNPM))) hay.push({ gestor: 'pnpm', archivo: PNPM });
  if (existeArchivo(path.join(abs(raiz, rel), YARN))) hay.push({ gestor: 'yarn', archivo: YARN });
  for (const n of NPM) if (existeArchivo(path.join(abs(raiz, rel), n))) {
    hay.push({ gestor: 'npm', archivo: n });
    break;
  }
  if (hay.length > 1 && gestor && hay.some((x) => x.gestor === gestor)) return hay.filter((x) => x.gestor === gestor);
  return hay;
}
function gestorDe(pjRaiz, setup) {
  const pm = pjRaiz && !pjRaiz.roto && typeof pjRaiz.packageManager === 'string' ? /^(npm|pnpm|yarn)@/.exec(pjRaiz.packageManager) : null;
  if (pm) return pm[1];
  const m = /\b(pnpm|yarn|npm)\b/.exec(String(setup || ''));
  return m ? m[1] : null;
}
function leerLock(raiz, rel, l) {
  const t = leerTexto(path.join(abs(raiz, rel), l.archivo));
  if (t === null) return { noSe: 'no se pudo leer' };
  return l.gestor === 'npm' ? leerNpm(t) : l.gestor === 'pnpm' ? leerPnpm(t) : leerYarn(t);
}
const enCarpeta = (rel, archivo) => (rel ? `${rel}/${archivo}` : archivo);

function mirarLocks(raiz, opciones = {}) {
  const setup = opciones.setup || '';
  const pjRaiz = leerPaquete(raiz, '');
  const gestor = gestorDe(pjRaiz, setup);
  const ws = patronesWorkspace(raiz, pjRaiz);
  const hallazgos = [];
  const cubiertas = new Set(); // las carpetas que ya juzgó el lock de la raíz (workspace)

  // 1. El workspace: el lock de la raíz con todos sus importers, y los miembros sin importer.
  if (ws.hay) {
    const ms = miembros(raiz, ws.pats);
    const hermanos = new Set(ms.map((r) => leerPaquete(raiz, r)).filter((p) => p && !p.roto && typeof p.name === 'string').map((p) => p.name));
    for (const l of locksDe(raiz, '', gestor)) {
      const lk = leerLock(raiz, '', l);
      const base = { archivo: l.archivo, gestor: l.gestor, carpeta: '' };
      cubiertas.add('');
      for (const r of ms) cubiertas.add(r);
      if (lk.noSe) {
        hallazgos.push({ ...base, tipo: 'no-se', detalles: [lk.noSe] });
        continue;
      }
      const detalles = [];
      const pref = (r) => (r ? `${r}: ` : '');
      if (l.gestor === 'yarn') {
        for (const r of ['', ...ms]) {
          const pj = leerPaquete(raiz, r);
          if (pj && !pj.roto) for (const d of compararYarn(pj, lk.claves, hermanos)) detalles.push(pref(r) + d);
        }
      } else {
        const rutas = new Set(['', ...ms, ...lk.importers.keys()]);
        for (const r of [...rutas].sort()) {
          const pj = leerPaquete(raiz, r);
          if (!pj || pj.roto) continue; // un importer sin package.json: lo dice el instalador, no inventamos
          if (!lk.importers.has(r)) {
            if (deps(pj).length || ms.includes(r)) detalles.push(`${r || '.'}: falta en el lock`);
            continue;
          }
          for (const d of compararImporter(pj, lk.importers.get(r))) detalles.push(pref(r) + d);
        }
      }
      if (detalles.length) hallazgos.push({ ...base, tipo: 'atrasado', detalles });
    }
  }

  // 2. Las carpetas sueltas: la raíz, las de primer nivel con package.json y las del setup.
  let primer = [];
  try {
    primer = fs.readdirSync(raiz, { withFileTypes: true }).filter((e) => e.isDirectory() && !NO_BAJAR.has(e.name) && !e.name.startsWith('.')).map((e) => e.name);
  } catch (e) {
    primer = [];
  }
  const carpetas = [...new Set(['', ...primer, ...carpetasDelSetup(setup)])].filter((r) => existeArchivo(path.join(abs(raiz, r), 'package.json'))).sort();
  for (const r of carpetas) {
    const propios = locksDe(raiz, r, gestor);
    if (cubiertas.has(r) && !(r && propios.length)) continue;
    const pj = leerPaquete(raiz, r);
    if (!pj || pj.roto) continue;
    if (!propios.length) {
      if (deps(pj).length) hallazgos.push({ tipo: 'sin-lock', archivo: enCarpeta(r, 'package.json'), gestor: gestor || 'npm', carpeta: r, detalles: [] });
      continue;
    }
    for (const l of propios) {
      const lk = leerLock(raiz, r, l);
      const base = { archivo: enCarpeta(r, l.archivo), gestor: l.gestor, carpeta: r };
      if (lk.noSe) {
        hallazgos.push({ ...base, tipo: 'no-se', detalles: [lk.noSe] });
        continue;
      }
      let detalles;
      if (l.gestor === 'yarn') detalles = compararYarn(pj, lk.claves, new Set());
      else if (!lk.importers.has('')) detalles = ['.: falta en el lock'];
      else detalles = compararImporter(pj, lk.importers.get(''));
      if (detalles.length) hallazgos.push({ ...base, tipo: 'atrasado', detalles });
    }
  }
  return hallazgos;
}

const COLA = 'y commitealo; sin eso, el comando-setup falla y la flota no puede probar tus tests';
function linea(h) {
  const cmd = `\`${COMANDO[h.gestor](h.carpeta)}\``;
  if (h.tipo === 'no-se') return `lock: ${h.archivo} — no sé leer este lock (${h.detalles[0]}): lo prueba la flota`;
  if (h.tipo === 'sin-lock') return `sin lock: ${h.archivo} tiene dependencias y ningún lock — generalo en el proyecto (${cmd}) ${COLA}`;
  const mas = h.detalles.length > 1 ? ` (y ${h.detalles.length - 1} más)` : '';
  return `lock atrasado: ${h.archivo} — ${h.detalles[0]}${mas}: regeneralo en el proyecto (${cmd}) ${COLA}`;
}
const lineas = (hs) => (hs || []).map(linea);

module.exports = { mirarLocks, lineas, carpetasDelSetup, leerNpm, leerPnpm, leerYarn, patronesWorkspace };
