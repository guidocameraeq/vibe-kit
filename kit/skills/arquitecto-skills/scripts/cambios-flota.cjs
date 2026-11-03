#!/usr/bin/env node
'use strict';
// cambios-flota.cjs — lo que la flota aprendió, contado por un script (SPEC-paquete-7 P6.8b-2; D §22ter.4-5).
// Lee el registro de cambios (.claude/cambios/*.md) y la ficha (.claude/kit.md) de cada repo de la flota y arma:
//   · sin --urgentes: la tabla del ciclo (qué regla se repite, cuál entra al kit);
//   · con --urgentes: una línea por cambio urgente que sigue vivo (es lo que corre el /inicio de vibe-kit).
// SOLO LECTURA y SIN RED (D7-4): lee lo COMMITEADO en la rama por defecto LOCAL de cada repo (git ls-tree + git cat-file --batch),
// no el disco ni origin. Un repo que no se lee da una línea y se sigue. Node estándar, cero dependencias; .cjs a propósito.
//
// Uso: node cambios-flota.cjs [<repo>…] [--proyectos <carpeta>] [--urgentes] [--kit <raíz del kit>] [--home <dir>]
// Salida: 0 si corrió (es un informe), 2 si está mal llamado.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const ficha = require('../pc/lib/ficha.cjs');
const CU = require('./lib/cubiertos.cjs');

const USO = 'uso: cambios-flota.cjs [<repo>…] [--proyectos <carpeta>] [--urgentes] [--kit <raíz del kit>] [--home <dir>]';
const RE_CAMBIO = /^\d{4}-\d{2}-\d{2}-.+\.md$/;
const GRAVES = ['seguridad', 'produccion', 'plata']; // de la peor a la menos mala
const PLAZO_GIT = 30000;

// ---------------------------------------------------------------- git (un par de procesos por repo)

function git(repo, args, input) {
  const r = spawnSync('git', ['-C', repo, '-c', 'core.quotepath=off', ...args], {
    input, maxBuffer: 256 * 1024 * 1024, timeout: PLAZO_GIT, windowsHide: true,
  });
  if (r.error) throw new Error(r.error.code === 'ENOENT' ? 'no encuentro git' : r.error.message);
  if (r.status !== 0) throw new Error(String(r.stderr || '').trim().split('\n')[0] || `git ${args[0]} falló`);
  return r.stdout;
}

// La rama por defecto LOCAL: a lo que apunta refs/remotes/origin/HEAD si existe (su rama local), si no main o master.
function ramaPorDefecto(repo) {
  const sal = git(repo, ['for-each-ref', '--format=%(refname) %(symref)', 'refs/heads/', 'refs/remotes/origin/HEAD']).toString('utf8');
  const locales = new Set();
  let origen = null;
  for (const l of sal.split('\n')) {
    const [ref, sym] = l.trim().split(' ');
    if (!ref) continue;
    if (ref.startsWith('refs/heads/')) locales.add(ref.slice('refs/heads/'.length));
    else if (ref === 'refs/remotes/origin/HEAD' && sym) origen = sym.replace(/^refs\/remotes\/origin\//, '');
  }
  if (origen && locales.has(origen)) return `refs/heads/${origen}`;
  for (const c of ['main', 'master']) if (locales.has(c)) return `refs/heads/${c}`;
  if (origen) return `refs/remotes/origin/${origen}`; // clon sin la rama local todavía
  throw new Error('no encuentro la rama por defecto (ni origin/HEAD, ni main ni master)');
}

// → { cambios: [{nombre, texto}], ficha: texto|null } de lo commiteado en la rama.
function leerCommiteado(repo) {
  const ref = ramaPorDefecto(repo);
  const arbol = git(repo, ['ls-tree', '-r', '-z', ref, '--', '.claude/cambios/', '.claude/kit.md']).toString('utf8');
  const entradas = [];
  for (const e of arbol.split('\0')) {
    const m = /^\d+ blob ([0-9a-f]+)\t(.+)$/.exec(e);
    if (!m) continue;
    const rel = m[2];
    if (rel === '.claude/kit.md') entradas.push({ sha: m[1], tipo: 'ficha' });
    else if (path.posix.dirname(rel) === '.claude/cambios' && RE_CAMBIO.test(path.posix.basename(rel))) {
      entradas.push({ sha: m[1], tipo: 'cambio', nombre: path.posix.basename(rel) });
    }
  }
  const res = { cambios: [], ficha: null };
  if (!entradas.length) return res;
  const out = git(repo, ['cat-file', '--batch'], entradas.map((x) => x.sha).join('\n') + '\n');
  let pos = 0;
  for (const x of entradas) {
    const fin = out.indexOf(10, pos);
    const cab = out.slice(pos, fin).toString('utf8').split(' ');
    const tam = Number(cab[2]);
    if (cab[1] !== 'blob' || !Number.isFinite(tam)) throw new Error(`git cat-file devolvió algo raro para ${x.sha}`);
    const texto = out.slice(fin + 1, fin + 1 + tam).toString('utf8');
    pos = fin + 1 + tam + 1;
    if (x.tipo === 'ficha') res.ficha = texto;
    else res.cambios.push({ nombre: x.nombre, texto });
  }
  return res;
}

// ---------------------------------------------------------------- leer un cambio

const normalizar = (t) => String(t).replace(/^﻿/, '').replace(/\r\n/g, '\n');

// La primera línea no vacía de "## Regla" (o '').
function reglaDe(cuerpo) {
  let en = false;
  for (const l of cuerpo.split('\n')) {
    const m = /^##\s+(.+?)\s*$/.exec(l);
    if (m && !/^#/.test(m[1])) {
      en = m[1] === 'Regla';
      continue;
    }
    if (en && l.trim()) return l.trim();
  }
  return '';
}

function leerCambio(nombre, texto) {
  const t = normalizar(texto);
  const { datos } = ficha.leerCabecera(t);
  const lineas = t.split('\n');
  const cierre = lineas[0] === '---' ? lineas.indexOf('---', 1) : -1;
  const txt = (k) => (typeof datos[k] === 'string' ? datos[k] : '');
  return {
    id: nombre.replace(/\.md$/, ''),
    estado: txt('estado'),
    cita: txt('cita') || null,
    cicatriz: txt('cicatriz') || 'no',
    urgente: txt('urgente') === 'sí',
    regla: reglaDe(lineas.slice(cierre + 1).join('\n')),
  };
}

// El alias del repo: vars.proyecto de su ficha; sin eso, el nombre de la carpeta EN MINÚSCULAS (la cita es "<alias> <id>" con el
// alias en [a-z0-9-]+, RF-fix rf-1). → { alias, malo }: malo si igual no tiene esa forma (la fila lo marca y no va a "para pegar").
function aliasDe(repo, textoFicha) {
  const carpeta = path.basename(path.resolve(repo)).toLowerCase();
  let alias = carpeta;
  if (textoFicha) {
    try {
      const v = ficha.leerCabecera(normalizar(textoFicha)).datos.vars;
      const p = v && typeof v === 'object' && !Array.isArray(v) ? v.proyecto : null;
      if (typeof p === 'string' && p.trim()) alias = p.trim();
    } catch (e) { /* la ficha rota: el de la carpeta */ }
  }
  return { alias, malo: !CU.RE_ALIAS.test(alias) };
}

// ---------------------------------------------------------------- cubiertos.md y kit-pc.md

// Las citas que el kit ya cubre, con el lector de siempre (lib/cubiertos.cjs, el mismo de aplicar): una entrada mala se saltea y
// se dice; las demás valen. --kit puede ser la raíz del repo (<x>/kit/cubiertos.md) o la carpeta kit/ (<x>/cubiertos.md).
function leerCubiertos(kit, log) {
  const f = CU.buscar(kit);
  if (!f) {
    log(`⚠ no encuentro cubiertos.md en ${kit} (ni kit/cubiertos.md ni cubiertos.md): sigo sin saber qué cubre el kit`);
    return new Set();
  }
  const r = CU.leer(f);
  if (r.problema) {
    log(`⚠ ${f} ${r.problema}: sigo sin saber qué cubre el kit`);
    return new Set();
  }
  for (const m of r.malas) log(`⚠ ${f}: ${CU.lineaMala(m)}`);
  return new Set(r.entradas.map((x) => x.cita));
}

function proyectosDeKitPc(home) {
  const f = path.join(home, '.claude', 'kit-pc.md');
  if (!fs.existsSync(f)) return null;
  try {
    const p = ficha.leerCabecera(normalizar(fs.readFileSync(f, 'utf8'))).datos.proyectos;
    return typeof p === 'string' && p.trim() && p !== 'no' ? p.trim() : null;
  } catch (e) {
    return null;
  }
}

// Lo descubierto por carpeta: solo los repos que tienen registro de cambios en el disco (.claude/cambios/); los demás, en silencio
// (RF-fix rf-3: un repo sin rama por defecto daba "⚠ no se lee" en cada /inicio). Los nombrados a mano siguen avisando.
const reposDe = (carpeta) =>
  fs.readdirSync(carpeta, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(carpeta, d.name, '.git')) && esCarpeta(path.join(carpeta, d.name, '.claude', 'cambios')))
    .map((d) => path.join(carpeta, d.name))
    .sort();

function esCarpeta(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch (e) {
    return false;
  }
}

// ---------------------------------------------------------------- el informe

function tabla(proyectos, cubiertos) {
  const reglas = new Map(); // clave → { proyectos:Set, cicatriz, estados:Set, kit:bool }
  for (const p of proyectos) {
    for (const c of p.cambios) {
      if (c.estado === 'rechazado') continue;
      const clave = c.cita || `${p.alias} ${c.id}`;
      let r = reglas.get(clave);
      if (!r) reglas.set(clave, (r = { clave, proyectos: new Set(), cicatriz: 'no', estados: new Set(), kit: cubiertos.has(clave), aliasMalo: null }));
      r.proyectos.add(p.alias);
      if (p.aliasMalo && !c.cita) r.aliasMalo = p.alias;
      r.estados.add(c.estado);
      if (c.estado === 'subio-al-kit') r.kit = true;
      const g = GRAVES.indexOf(c.cicatriz);
      if (g >= 0 && (r.cicatriz === 'no' || g < GRAVES.indexOf(r.cicatriz))) r.cicatriz = c.cicatriz;
    }
  }
  const filas = [...reglas.values()].map((r) => {
    r.entra = r.proyectos.size >= 3 ? 'sí (3+)' : GRAVES.includes(r.cicatriz) ? 'sí (cicatriz)' : 'no';
    return r;
  });
  const orden = (a, b) => (a.entra === 'no') - (b.entra === 'no') || b.proyectos.size - a.proyectos.size || (a.clave < b.clave ? -1 : a.clave > b.clave ? 1 : 0);
  return { vivas: filas.filter((r) => !r.kit).sort(orden), enKit: filas.filter((r) => r.kit).sort(orden) };
}

function informe(proyectos, cubiertos, log) {
  const { vivas, enKit } = tabla(proyectos, cubiertos);
  if (!vivas.length && !enKit.length) return log('ningún cambio en la flota.');
  if (vivas.length) {
    log('regla | proyectos | cicatriz | estados | entra');
    for (const r of vivas) log(`${r.clave} | ${[...r.proyectos].sort().join(', ')} (${r.proyectos.size}) | ${r.cicatriz} | ${[...r.estados].sort().join(', ')} | ${r.entra}${r.aliasMalo ? ` | ⚠ alias "${r.aliasMalo}" sin forma [a-z0-9-]+: poné vars.proyecto en su ficha` : ''}`);
  }
  if (enKit.length) {
    log('');
    log('ya en el kit:');
    for (const r of enKit) log(`  ${r.clave} | ${[...r.proyectos].sort().join(', ')}`);
  }
  // la línea sale con la forma de lib/cubiertos.cjs y DOS huecos explícitos: pegada sin llenar, el lector la saltea y lo dice
  const entran = vivas.filter((r) => r.entra !== 'no' && !r.aliasMalo);
  if (entran.length) {
    log('');
    log('para pegar en kit/cubiertos.md (llená los huecos: N.N.N = la versión del kit en que entra; <id de la pieza> = la pieza del catálogo donde quedó la regla):');
    for (const r of entran) log(`  - {cita: "${r.clave}", version: N.N.N, pieza: <id de la pieza>}`);
  }
}

function urgentes(proyectos, log) {
  const lineas = [];
  for (const p of proyectos) {
    for (const c of p.cambios) {
      if (c.urgente && c.estado !== 'rechazado' && c.estado !== 'subio-al-kit') lineas.push(`⚠ ${p.alias} · ${c.id} · ${c.regla || '(sin regla)'} · ${c.estado}`);
    }
  }
  if (!lineas.length) return log('ninguna urgencia en la flota');
  lineas.sort().forEach((l) => log(l));
}

// ---------------------------------------------------------------- main

function parsear(argv) {
  const o = { repos: [], proyectos: null, urgentes: false, kit: null, home: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--urgentes') o.urgentes = true;
    else if (a === '--proyectos' || a === '--kit' || a === '--home') {
      const v = argv[++i];
      if (v === undefined || v.startsWith('--')) return { error: `${a} pide un valor` };
      o[a.slice(2)] = v;
    } else if (a.startsWith('--')) return { error: `opción desconocida: ${a}` };
    else o.repos.push(a);
  }
  return o;
}

function main(argv, salida) {
  const log = salida || ((s) => process.stdout.write(`${s}\n`));
  const o = parsear(argv);
  if (o.error) {
    process.stderr.write(`${o.error}\n${USO}\n`);
    return 2;
  }
  let repos = o.repos.map((r) => path.resolve(r));
  if (!repos.length) {
    const carpeta = o.proyectos || proyectosDeKitPc(o.home || os.homedir());
    if (!carpeta) {
      log('no sé dónde está la flota: pasame los repos, o --proyectos <carpeta>, o corré "preparame esta PC" (kit-pc.md).');
      return 0;
    }
    const abs = path.resolve(carpeta.replace(/^~(?=$|[\\/])/, os.homedir()));
    try {
      repos = reposDe(abs);
    } catch (e) {
      log(`no pude abrir la carpeta de proyectos ${abs} (${e.code || e.message}).`);
      return 0;
    }
    if (!repos.length) {
      log(`no hay repos con registro de cambios (.claude/cambios/) en ${abs}.`);
      return 0;
    }
  }
  const cubiertos = o.kit ? leerCubiertos(path.resolve(o.kit), log) : new Set();
  const proyectos = [];
  for (const repo of repos) {
    try {
      const { cambios, ficha: f } = leerCommiteado(repo);
      const { alias, malo } = aliasDe(repo, f);
      const lista = [];
      for (const c of cambios) {
        try {
          lista.push(leerCambio(c.nombre, c.texto));
        } catch (e) {
          log(`⚠ ${alias}: no leí ${c.nombre} (${e.message})`);
        }
      }
      proyectos.push({ alias, aliasMalo: malo, cambios: lista });
    } catch (e) {
      log(`⚠ ${path.basename(repo)}: no se lee (${e.message})`);
    }
  }
  if (o.urgentes) urgentes(proyectos, log);
  else informe(proyectos, cubiertos, log);
  return 0;
}

module.exports = { main, leerCommiteado, ramaPorDefecto };

if (require.main === module) process.exitCode = main(process.argv.slice(2));
