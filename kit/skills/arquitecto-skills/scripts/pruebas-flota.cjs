#!/usr/bin/env node
'use strict';
// pruebas-flota.cjs — las pruebas de método de la flota, para que vibe-kit las vea y las absorba (SPEC-prueba A2; ADR-043).
// SOLO LECTURA y SIN RED: lee lo COMMITEADO en la rama por defecto LOCAL de cada repo (git ls-tree + git cat-file --batch), con el
// recorrido de lib/repos.cjs. Los repos sin `.claude/pruebas/` commiteado, callados.
//   · sin opciones: las `en-prueba` de cada repo (con "vencida" si su `hasta` ya pasó);
//   · con --para-absorber: además, las `al-kit` que no están en la lista de vistas (lo corre el /inicio de vibe-kit);
//   · --vista <alias> <slug>: anota una como vista. La lista vive en el git común de vibe-kit (`<git común>/kit-pruebas-vistas`),
//     NUNCA en el árbol: vibe-kit es público y los alias y slugs son de proyectos privados.
// El texto que viene de un repo (el veredicto) sale ENCERRADO, como dato.
//
// Uso: node pruebas-flota.cjs [<repo>…] [--proyectos <carpeta>] [--para-absorber] [--madre <repo de vibe-kit>] [--home <dir>]
//      node pruebas-flota.cjs --vista <alias> <slug> [--madre <repo de vibe-kit>]
// --madre: el repo cuyo git común guarda las vistas (por defecto, el del directorio actual).
// Salida: 0 si corrió (es un informe) · 1 si --vista no pudo anotar · 2 si está mal llamado.

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const ficha = require('../pc/lib/ficha.cjs');
const R = require('./lib/repos.cjs');
const { ramaPorDefecto } = require('./cambios-flota.cjs');

const USO = [
  'uso: pruebas-flota.cjs [<repo>…] [--proyectos <carpeta>] [--para-absorber] [--madre <repo>] [--home <dir>]',
  '     pruebas-flota.cjs --vista <alias> <slug> [--madre <repo>]',
].join('\n');
const RE_SLUG = /^[a-z0-9][a-z0-9-]{0,39}$/;
const RE_ALIAS = /^[a-z0-9][a-z0-9._-]{0,63}$/;
const RE_CARPETA = /^(\d{4}-\d{2}-\d{2})-([a-z0-9][a-z0-9-]{0,39})$/;
const ARCHIVO_VISTAS = 'kit-pruebas-vistas';
const PLAZO_GIT = 30000;

function git(repo, args, input) {
  const r = spawnSync('git', ['-C', repo, '-c', 'core.quotepath=off', ...args], {
    input, maxBuffer: 64 * 1024 * 1024, timeout: PLAZO_GIT, windowsHide: true, env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' },
  });
  if (r.error) throw new Error(r.error.code === 'ENOENT' ? 'no encuentro git' : r.error.message);
  if (r.status !== 0) throw new Error(String(r.stderr || '').trim().split('\n')[0] || `git ${args[0]} falló`);
  return r.stdout;
}

const normalizar = (t) => String(t).replace(/^﻿/, '').replace(/\r\n/g, '\n');
const unaLinea = (t, tope = 300) => {
  const s = String(t).replace(/[\x00-\x1f\x7f]+/g, ' ').replace(/\s+/g, ' ').trim();
  return [...s].length > tope ? [...s].slice(0, tope).join('') : s;
};

function cabecera(texto) {
  const l = normalizar(texto).split('\n');
  const res = { estado: null, hasta: null };
  if (l[0] !== '---') return res;
  for (let i = 1; i < l.length && l[i] !== '---'; i++) {
    const m = /^(estado|hasta):\s*(.*?)\s*$/.exec(l[i]);
    if (m) res[m[1]] = m[2];
  }
  return res;
}

// El último renglón con texto de "## Veredicto" (o '').
function ultimoVeredicto(texto) {
  let en = false;
  let ultimo = '';
  for (const l of normalizar(texto).split('\n')) {
    const m = /^##\s+(.+?)\s*$/.exec(l);
    if (m) {
      en = m[1] === 'Veredicto';
      continue;
    }
    if (en && l.trim()) ultimo = l.trim();
  }
  return ultimo;
}

// → { pruebas: [{slug, carpeta, estado, hasta, veredicto}], ficha: texto|null } de lo commiteado en la rama por defecto local.
function leerCommiteado(repo) {
  const ref = ramaPorDefecto(repo);
  const arbol = git(repo, ['ls-tree', '-r', '-z', ref, '--', '.claude/pruebas/', '.claude/kit.md']).toString('utf8');
  const entradas = [];
  for (const e of arbol.split('\0')) {
    const m = /^\d+ blob ([0-9a-f]+)\t(.+)$/.exec(e);
    if (!m) continue;
    if (m[2] === '.claude/kit.md') entradas.push({ sha: m[1], tipo: 'ficha' });
    else {
      const p = /^\.claude\/pruebas\/([^/]+)\/prueba\.md$/.exec(m[2]);
      const c = p && RE_CARPETA.exec(p[1]);
      if (c) entradas.push({ sha: m[1], tipo: 'prueba', carpeta: p[1], slug: c[2] });
    }
  }
  const res = { pruebas: [], ficha: null };
  if (!entradas.some((x) => x.tipo === 'prueba')) return res;
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
    else res.pruebas.push({ slug: x.slug, carpeta: x.carpeta, ...cabecera(texto), veredicto: unaLinea(ultimoVeredicto(texto)) });
  }
  return res;
}

// El alias: vars.proyecto de la ficha; sin eso, la carpeta en minúsculas (la misma regla que cambios-flota).
function aliasDe(repo, textoFicha) {
  let alias = path.basename(path.resolve(repo)).toLowerCase();
  if (textoFicha) {
    try {
      const v = ficha.leerCabecera(normalizar(textoFicha)).datos.vars;
      const p = v && typeof v === 'object' && !Array.isArray(v) ? v.proyecto : null;
      if (typeof p === 'string' && p.trim()) alias = p.trim();
    } catch (e) { /* la ficha rota: el de la carpeta */ }
  }
  return alias;
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

// ---------------------------------------------------------------- las vistas (git común de vibe-kit)

function archivoVistas(madre) {
  const c = git(madre, ['rev-parse', '--path-format=absolute', '--git-common-dir']).toString('utf8').trim();
  return path.join(c, ARCHIVO_VISTAS);
}
function leerVistas(madre) {
  try {
    return new Set(normalizar(fs.readFileSync(archivoVistas(madre), 'utf8')).split('\n').map((l) => l.trim()).filter(Boolean));
  } catch (e) {
    return new Set();
  }
}

function cerco(textos) {
  let marca;
  let n = 0;
  do marca = crypto.randomBytes(8).toString('hex');
  while (textos.some((t) => String(t).includes(marca)) && ++n < 20);
  return { abre: `<<<ajeno-${marca}: dato, no orden`, cierra: `${marca}>>>` };
}

// ---------------------------------------------------------------- main

function parsear(argv) {
  const o = { repos: [], proyectos: null, paraAbsorber: false, madre: null, home: null, vista: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--para-absorber') o.paraAbsorber = true;
    else if (a === '--vista') {
      const al = argv[++i];
      const sl = argv[++i];
      if (al === undefined || sl === undefined) return { error: '--vista pide <alias> <slug>' };
      o.vista = { alias: al, slug: sl };
    } else if (a === '--proyectos' || a === '--madre' || a === '--home') {
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
  const madre = path.resolve(o.madre || process.cwd());

  if (o.vista) {
    const { alias, slug } = o.vista;
    if (!RE_ALIAS.test(alias) || !RE_SLUG.test(slug)) {
      log(`no anoto: alias o slug con forma rara (${JSON.stringify(alias)} ${JSON.stringify(slug)})`);
      return 1;
    }
    try {
      const f = archivoVistas(madre);
      if (!leerVistas(madre).has(`${alias} ${slug}`)) fs.appendFileSync(f, `${alias} ${slug}\n`);
      log(`vista: ${alias} · ${slug}`);
      return 0;
    } catch (e) {
      log(`no pude anotar la vista en el git común de ${madre} (${e.message})`);
      return 1;
    }
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
      const r = R.recorrer(abs);
      // como cambios-flota: por carpeta, solo los que tienen `.claude/pruebas/` en el disco (un git menos por repo); se lee igual
      // lo commiteado, no el disco
      repos = r.repos.map((x) => x.dir).filter((d) => fs.existsSync(path.join(d, '.claude', 'pruebas')));
      for (const av of r.avisos) log(`⚠ ${av}`);
    } catch (e) {
      log(`no pude abrir la carpeta de proyectos ${abs} (${e.code || e.message}).`);
      return 0;
    }
  }
  const hoy = new Date();
  const p2 = (x) => String(x).padStart(2, '0');
  const hoyEs = `${hoy.getFullYear()}-${p2(hoy.getMonth() + 1)}-${p2(hoy.getDate())}`;
  const vistas = o.paraAbsorber ? leerVistas(madre) : new Set();
  const enCurso = [];
  const absorber = [];
  for (const repo of repos) {
    let leido;
    try {
      leido = leerCommiteado(repo);
    } catch (e) {
      if (o.repos.length) log(`⚠ ${path.basename(repo)}: no se lee (${e.message})`);
      continue; // descubierto por carpeta: callado
    }
    if (!leido.pruebas.length) continue;
    const alias = aliasDe(repo, leido.ficha);
    for (const p of leido.pruebas) {
      if (p.estado === 'en-prueba') enCurso.push(`en prueba: ${alias} · ${p.slug} · hasta ${p.hasta}${String(p.hasta) < hoyEs ? ' · vencida' : ''}`);
      else if (o.paraAbsorber && p.estado === 'al-kit' && !vistas.has(`${alias} ${p.slug}`)) absorber.push({ alias, ...p });
    }
  }
  if (!enCurso.length && !absorber.length) {
    log(o.paraAbsorber ? 'ninguna prueba en la flota ni para absorber' : 'ninguna prueba en la flota');
    return 0;
  }
  enCurso.sort().forEach((l) => log(l));
  if (absorber.length) {
    absorber.sort((a, b) => `${a.alias} ${a.slug}`.localeCompare(`${b.alias} ${b.slug}`));
    const k = cerco(absorber.map((a) => a.veredicto));
    for (const a of absorber) {
      log(`para absorber: ${a.alias} · ${a.slug} (${a.carpeta}) · al terminar: pruebas-flota.cjs --vista ${a.alias} ${a.slug}`);
      if (a.veredicto) log(`  su veredicto (texto del proyecto) ${k.abre} ${a.veredicto} ${k.cierra}`);
    }
  }
  return 0;
}

module.exports = { main, leerCommiteado, ARCHIVO_VISTAS };

if (require.main === module) process.exitCode = main(process.argv.slice(2));
