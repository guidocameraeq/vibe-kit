#!/usr/bin/env node
'use strict';
// prueba.cjs — probar una idea nueva de método en este proyecto (SPEC-prueba A1; ADR-043). Uso, desde el repo:
//   node .claude/scripts/prueba.cjs abrir --slug <s> --hasta <AAAA-MM-DD>       (el cuerpo por la entrada: ## Qué es · ## Qué cura ·
//                                                                                  ## Cómo se sabe si sirvió, las tres con texto)
//   node .claude/scripts/prueba.cjs anotar <slug> --tipo uso|traba|arreglo|nota '<texto>'
//   node .claude/scripts/prueba.cjs listar [--vencidas]
//   node .claude/scripts/prueba.cjs volcar
//   node .claude/scripts/prueba.cjs veredicto <slug> al-kit|descartada|seguir --por "<razón>" [--hasta <AAAA-MM-DD>]
// Cada prueba es `.claude/pruebas/<AAAA-MM-DD>-<slug>/` con `prueba.md` (cabecera estado/hasta) y `log.md` (un renglón por hecho).
// "En prueba" es lo COMMITEADO en la rama por defecto local, no el árbol: vale igual desde cualquier worktree.
// `anotar` lo corre cualquier rol desde cualquier worktree: agrega un renglón a `kit-pruebas/<slug>.log` del git común, sin tocar
// el árbol ni commitear (la regla `allow` del settings.json lo deja correr sin pedir permiso: el texto va entre comillas simples).
// `abrir`, `volcar` y `veredicto`: solo rol humano, checkout principal y rama por defecto, con origin; commit por rutas,
// `pull --rebase` y `push` en el mismo paso (un commit sin subir traba la sesión de cierre). Si el push falla, lo dicen y salen 1.
// El texto de un renglón es de una sesión: `listar` lo imprime encerrado, como dato.
// Salidas: 0 anduvo · 1 negado o falló (una línea por qué) · 2 mal llamado.
// Node estándar, cero dependencias. Es .cjs a propósito: corre igual en proyectos con "type": "module".

const fs = require('fs');
const path = require('path');
const P = require('../hooks/lib/pruebas.cjs');
const git = require('../hooks/lib/git.cjs');
const X = require('../hooks/lib/contexto.cjs');

const USO = [
  'uso: node .claude/scripts/prueba.cjs <verbo> …',
  '  abrir --slug <s> --hasta <AAAA-MM-DD>   (cuerpo por la entrada: ## Qué es · ## Qué cura · ## Cómo se sabe si sirvió)',
  "  anotar <slug> --tipo uso|traba|arreglo|nota '<texto>'",
  '  listar [--vencidas]',
  '  volcar',
  '  veredicto <slug> al-kit|descartada|seguir --por "<razón>" [--hasta <AAAA-MM-DD>]',
].join('\n');
const SECCIONES = ['Qué es', 'Qué cura', 'Cómo se sabe si sirvió'];
const SALIDAS = ['al-kit', 'descartada', 'seguir'];
const TIEMPO_RED = 120000;

class Fallo extends Error {
  constructor(m, codigo = 1) {
    super(m);
    this.codigo = codigo;
  }
}
const no = (m) => {
  throw new Fallo(m, 1);
};
const mal = (m) => {
  throw new Fallo(m, 2);
};

// ---------------------------------------------------------------- argumentos

const CON_VALOR = new Set(['--slug', '--hasta', '--tipo', '--por']);
function parsear(argv) {
  const o = { verbo: argv[0], pos: [], op: {} };
  for (let i = 1; i < argv.length; i++) {
    const a = argv[i];
    if (CON_VALOR.has(a)) {
      if (i + 1 >= argv.length) mal(`${a} pide un valor`);
      o.op[a.slice(2)] = argv[++i];
    } else if (a === '--vencidas') o.op.vencidas = true;
    else if (a.startsWith('--') && a.length > 2) mal(`opción desconocida: ${a}`);
    else o.pos.push(a);
  }
  return o;
}

function fechaValida(f) {
  if (typeof f !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(f)) return false;
  const d = new Date(`${f}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === f;
}
const hoy = (d = new Date()) => P.fechaHora(d).slice(0, 10);

// El slug, chequeado ANTES de armar cualquier ruta.
function slugDe(s) {
  if (!P.slugValido(s)) no(`slug inválido: ${JSON.stringify(String(s))} (va en minúsculas, números y guiones, hasta 40: ^[a-z0-9][a-z0-9-]{0,39}$)`);
  return s;
}

// ---------------------------------------------------------------- git

const G = (u, args, tiempo) => git.correr(args, { cwd: u.raiz, tiempo: tiempo || 15000 });
const primera = (r) => String(r.stderr || r.stdout || r.error || '').trim().split('\n')[0];

function donde(cwd) {
  const u = P.ubicacion(cwd);
  if (!u) no('esto no es un repo de git');
  return u;
}

// Las condiciones de los verbos que escriben: rol humano, checkout principal, rama por defecto, con origin. Nada escrito todavía.
function soloHumano(u, verbo) {
  const rol = X.rol(u.raiz);
  if (rol !== 'humano') no(`${verbo} lo corre solo una persona (esta carpeta es de ${rol}): desde el checkout principal`);
  if (!X.principal(u.raiz)) no(`${verbo} se corre desde el checkout principal, no desde un worktree`);
  if (!u.nombre) no('no encuentro la rama por defecto');
  const rama = X.rama(u.raiz);
  if (rama !== u.nombre) no(`${verbo} se corre en la rama por defecto (${u.nombre}); estás en ${rama || 'un HEAD suelto'}`);
  const rem = G(u, ['remote']);
  if (!rem.ok || !rem.stdout.split('\n').map((s) => s.trim()).includes('origin')) no(`${verbo} sube lo que escribe y este repo no tiene origin`);
  const mid = ['MERGE_HEAD', 'rebase-merge', 'rebase-apply'].some((f) => fs.existsSync(path.join(u.comun, f)));
  if (mid) no('hay un merge o un rebase a medio hacer: terminalo primero');
  // La carpeta principal la comparten otras sesiones (la de cierre, tras integrar): con cambios sin guardar de otro o con commits
  // sin subir, este verbo no corre: su pull --rebase les movería el piso (revisor frío de la 3.2, hallazgo 1).
  const st = G(u, ['status', '--porcelain', '--untracked-files=no']);
  const ajenos = st.ok ? st.stdout.split('\n').map((l) => l.slice(3).trim()).filter((r) => r && !r.replace(/^"/, '').startsWith(`${P.CARPETA}/`)) : [];
  if (!st.ok || ajenos.length) no(`${verbo} no corre con cambios sin guardar en la carpeta principal (${ajenos[0] || 'no pude mirar'}): guardalos o esperá a que termine la otra sesión`);
  const ad = G(u, ['rev-list', '--count', `refs/remotes/origin/${u.nombre}..HEAD`]);
  if (ad.ok && Number(ad.stdout.trim()) > 0) no(`${verbo} no corre con commits sin subir en ${u.nombre} (${ad.stdout.trim()}): subilos primero (git push)`);
}

// Commit por rutas, pull --rebase y push. → { ok, commit, linea }. `commit` dice si el commit anduvo.
function subir(u, rutas, mensaje) {
  const add = G(u, ['add', '--', ...rutas]);
  if (!add.ok) return { ok: false, commit: false, linea: `git add falló: ${primera(add)}` };
  const c = G(u, ['commit', '-q', '-m', mensaje, '--only', '--', ...rutas], 60000);
  if (!c.ok) {
    G(u, ['reset', '-q', '--', ...rutas]);
    return { ok: false, commit: false, linea: `el commit falló: ${primera(c)}` };
  }
  const pull = G(u, ['pull', '-q', '--rebase', 'origin', u.nombre], TIEMPO_RED);
  if (!pull.ok) {
    G(u, ['rebase', '--abort']);
    return { ok: false, commit: true, linea: `quedó commiteado pero no subido: el pull --rebase falló (${primera(pull)}); traé la rama al día y corré git push` };
  }
  const push = G(u, ['push', '-q', 'origin', `HEAD:refs/heads/${u.nombre}`], TIEMPO_RED);
  if (!push.ok) return { ok: false, commit: true, linea: `quedó commiteado pero no subido: el push falló (${primera(push)}); corré git push` };
  return { ok: true, commit: true, linea: '' };
}

// Lo commiteado (rama por defecto local) de un slug, o null.
function buscar(u, slug) {
  return P.commiteadas(u.raiz, u).find((p) => p.slug === slug) || null;
}

// ---------------------------------------------------------------- abrir

function secciones(cuerpo) {
  const res = {};
  let actual = null;
  for (const l of cuerpo.split('\n')) {
    const m = /^##\s+(.+?)\s*$/.exec(l);
    if (m) {
      actual = m[1];
      res[actual] = res[actual] || [];
      continue;
    }
    if (actual) res[actual].push(l);
  }
  return res;
}

function abrir(o, cwd, entrada) {
  const slug = slugDe(o.op.slug);
  if (!fechaValida(o.op.hasta)) no(`--hasta pide una fecha AAAA-MM-DD (vino ${JSON.stringify(o.op.hasta || '')})`);
  if (o.op.hasta < hoy()) no(`--hasta ${o.op.hasta} ya pasó`);
  const u = donde(cwd);
  soloHumano(u, 'abrir');
  const cuerpo = String(entrada()).replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const s = secciones(cuerpo);
  for (const n of SECCIONES) if (!s[n] || !s[n].join('\n').trim()) no(`falta la sección "## ${n}" con texto (van las tres: ${SECCIONES.join(' · ')})`);
  if (P.commiteadas(u.raiz, u).some((p) => p.slug === slug)) no(`el slug ${slug} ya se usó en esta rama: elegí otro`);
  const enDisco = fs.existsSync(path.join(u.raiz, ...P.CARPETA.split('/'))) && fs.readdirSync(path.join(u.raiz, ...P.CARPETA.split('/'))).some((n) => (P.RE_CARPETA.exec(n) || [])[2] === slug);
  if (enDisco) no(`ya hay una carpeta de ${slug} en ${P.CARPETA} (sin commitear): sacala o elegí otro slug`);

  const carpeta = `${hoy()}-${slug}`;
  const rel = `${P.CARPETA}/${carpeta}`;
  const dir = path.join(u.raiz, ...rel.split('/'));
  const texto = [
    '---',
    'estado: en-prueba',
    `hasta: ${o.op.hasta}`,
    '---',
    '',
    `# Prueba: ${slug}`,
    '',
    ...SECCIONES.flatMap((n) => [`## ${n}`, '', s[n].join('\n').trim(), '']),
    '## Veredicto',
    '',
    '',
  ].join('\n');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'prueba.md'), texto);
  fs.writeFileSync(path.join(dir, 'log.md'), `# Log de la prueba ${slug} (un renglón por hecho: fecha · rol · rama · tipo · texto)\n\n`);
  const r = subir(u, [`${rel}/prueba.md`, `${rel}/log.md`], `prueba: abrir ${slug} (hasta ${o.op.hasta})`);
  if (!r.commit) fs.rmSync(dir, { recursive: true, force: true });
  if (!r.ok) no(r.linea);
  return [`abierta: ${rel} (hasta ${o.op.hasta}), commiteada y subida`];
}

// ---------------------------------------------------------------- anotar

function anotar(o, cwd, ahora) {
  const slug = slugDe(o.pos[0]);
  if (!P.TIPOS.includes(o.op.tipo)) no(`--tipo es uno de ${P.TIPOS.join('|')}`);
  const texto = P.unaLinea(o.pos.slice(1).join(' '));
  if (!texto) no('falta el texto: qué pasó, en una línea');
  const u = donde(cwd);
  const p = buscar(u, slug);
  if (!p || p.estado !== 'en-prueba') no(`no hay una prueba ${slug} en curso en la rama por defecto (${u.nombre || '?'})`);
  const dir = path.join(u.comun, P.CARPETA_COMUN);
  fs.mkdirSync(dir, { recursive: true });
  const linea = P.renglon({ fecha: ahora, rol: X.rol(u.raiz), rama: X.rama(u.raiz), tipo: o.op.tipo, texto });
  fs.appendFileSync(path.join(dir, `${slug}.log`), `${linea}\n`); // un solo agregado
  return [`anotado en ${slug} (${o.op.tipo})`];
}

// ---------------------------------------------------------------- listar

function listar(o, cwd) {
  const u = donde(cwd);
  const hoyEs = hoy();
  let ps = P.enCurso(u.raiz);
  if (o.op.vencidas) ps = ps.filter((p) => String(p.hasta) < hoyEs);
  if (!ps.length) return [o.op.vencidas ? 'ninguna prueba vencida' : 'ninguna prueba en curso'];
  const out = [];
  for (const p of ps) {
    const todos = [...P.renglonesDe(p.log), ...P.pendientes(u.comun, p.slug)];
    const c = P.cuentas(todos);
    const venc = String(p.hasta) < hoyEs ? ' · vencida' : '';
    out.push(`${p.slug} · hasta ${p.hasta}${venc} · ${P.textoCuentas(c)}`);
    const ultimos = todos.filter((l) => Object.values(P.cuentas([l])).some(Boolean)).slice(-3);
    if (ultimos.length) {
      const k = P.cerco(ultimos);
      out.push(`  los últimos renglones (texto de una sesión) ${k.abre}`, ...ultimos.map((l) => `  ${l}`), `  ${k.cierra}`);
    }
  }
  return out;
}

// ---------------------------------------------------------------- volcar

// Aparta (renombra) los archivos del git común de esos slugs, pasa sus renglones a log.md y commitea. Los apartados se borran solo
// si el commit anduvo; si no, quedan en el git común (el próximo volcar los toma) y log.md vuelve a lo commiteado.
// → { volcados: {slug: n}, rutas, apartados, problema }
function apartarYEscribir(u, ps) {
  const volcados = {};
  const rutas = [];
  const apartados = [];
  for (const p of ps) {
    const archivos = P.archivosPendientes(u.comun, p.slug);
    const mios = [];
    for (const f of archivos) {
      if (path.basename(f) === `${p.slug}.log`) {
        const destino = `${f}.volcando-${Date.now()}-${process.pid}`;
        try {
          fs.renameSync(f, destino);
          mios.push(destino);
        } catch (e) {
          /* otro volcar se lo llevó */
        }
      } else mios.push(f);
    }
    const renglones = [];
    for (const f of mios) renglones.push(...P.renglonesDe(fs.readFileSync(f, 'utf8')));
    apartados.push(...mios);
    if (!renglones.length) continue;
    const rel = `${P.CARPETA}/${p.carpeta}/log.md`;
    const abs = path.join(u.raiz, ...rel.split('/'));
    let previo = p.log;
    if (previo && !previo.endsWith('\n')) previo += '\n';
    fs.writeFileSync(abs, `${previo}${renglones.join('\n')}\n`);
    rutas.push(rel);
    volcados[p.slug] = renglones.length;
  }
  return { volcados, rutas, apartados };
}

function deshacerLog(u, rutas) {
  if (rutas.length) G(u, ['checkout', '-q', 'HEAD', '--', ...rutas]);
}

function volcar(o, cwd) {
  const u = donde(cwd);
  soloHumano(u, 'volcar');
  const ps = P.commiteadas(u.raiz, u);
  const sucias = ps.map((p) => `${P.CARPETA}/${p.carpeta}/log.md`);
  if (sucias.length) {
    const st = G(u, ['status', '--porcelain', '--', ...sucias]);
    if (!st.ok || st.stdout.trim()) no(`hay un log.md con cambios sin commitear: ${st.stdout.trim().split('\n')[0] || primera(st)}`);
  }
  const { volcados, rutas, apartados } = apartarYEscribir(u, ps);
  const total = Object.values(volcados).reduce((a, b) => a + b, 0);
  if (!rutas.length) {
    for (const f of apartados) fs.rmSync(f, { force: true }); // apartados vacíos
    return ['nada para volcar'];
  }
  const r = subir(u, rutas, `prueba: volcar ${total} renglón(es) (${Object.keys(volcados).join(', ')})`);
  if (!r.commit) {
    deshacerLog(u, rutas);
    no(`${r.linea}; los renglones siguen en el git común (el próximo volcar los toma)`);
  }
  for (const f of apartados) fs.rmSync(f, { force: true });
  if (!r.ok) no(r.linea);
  return [`volcados ${total} renglón(es): ${Object.entries(volcados).map(([s, n]) => `${s} ${n}`).join(' · ')}; commiteado y subido`];
}

// ---------------------------------------------------------------- veredicto

function veredicto(o, cwd) {
  const slug = slugDe(o.pos[0]);
  const salida = o.pos[1];
  if (!SALIDAS.includes(salida)) no(`el veredicto es uno de ${SALIDAS.join('|')}`);
  const por = P.unaLinea(o.op.por || '');
  if (!por) no('--por "<razón>" es obligatorio');
  if (salida === 'seguir' && !fechaValida(o.op.hasta)) no('seguir pide --hasta <AAAA-MM-DD> nueva');
  if (salida !== 'seguir' && o.op.hasta !== undefined) no('--hasta va solo con seguir');
  if (salida === 'seguir' && o.op.hasta < hoy()) no(`--hasta ${o.op.hasta} ya pasó`);
  const u = donde(cwd);
  soloHumano(u, 'veredicto');
  const p = buscar(u, slug);
  if (!p) no(`no hay una prueba ${slug} commiteada en ${u.nombre}`);
  if (p.estado !== 'en-prueba') no(`${slug} ya tiene veredicto (${p.estado})`);
  const relP = `${P.CARPETA}/${p.carpeta}/prueba.md`;
  const relL = `${P.CARPETA}/${p.carpeta}/log.md`;
  const st = G(u, ['status', '--porcelain', '--', relP, relL]);
  if (!st.ok || st.stdout.trim()) no(`${p.carpeta} tiene cambios sin commitear: commitealos o descartalos primero`);

  const { volcados, rutas, apartados } = apartarYEscribir(u, [p]);
  const logAhora = rutas.length ? fs.readFileSync(path.join(u.raiz, ...relL.split('/')), 'utf8') : p.log;
  const c = P.cuentas(P.renglonesDe(logAhora));
  const estado = salida === 'seguir' ? 'en-prueba' : salida;
  const hasta = salida === 'seguir' ? o.op.hasta : p.hasta;
  let texto = p.prueba
    .replace(/^estado:.*$/m, `estado: ${estado}`)
    .replace(/^hasta:.*$/m, `hasta: ${hasta}`);
  const renglonV = `- ${hoy()} · ${salida}${salida === 'seguir' ? ` hasta ${hasta}` : ''} · ${P.textoCuentas(c)} · ${por}`;
  if (/^## Veredicto\s*$/m.test(texto)) texto = `${texto.replace(/\s*$/, '')}\n${/## Veredicto\s*$/.test(texto.replace(/\s*$/, '')) ? '\n' : ''}${renglonV}\n`;
  else texto = `${texto.replace(/\s*$/, '')}\n\n## Veredicto\n\n${renglonV}\n`;
  fs.writeFileSync(path.join(u.raiz, ...relP.split('/')), texto);
  const r = subir(u, [relP, ...rutas], `prueba: veredicto ${slug} ${salida}`);
  if (!r.commit) {
    deshacerLog(u, [relP, ...rutas]);
    no(`${r.linea}; nada cambió (los renglones siguen en el git común)`);
  }
  for (const f of apartados) fs.rmSync(f, { force: true });
  if (!r.ok) no(r.linea);
  const n = volcados[slug] || 0;
  return [`veredicto de ${slug}: ${salida}${salida === 'seguir' ? ` hasta ${hasta}` : ''} (${P.textoCuentas(c)}${n ? `; volcados ${n}` : ''}); commiteado y subido`];
}

// ---------------------------------------------------------------- main

function main(argv, { cwd = process.cwd(), entrada = () => fs.readFileSync(0, 'utf8'), ahora = new Date() } = {}) {
  try {
    if (!argv.length || argv[0] === '--help' || argv[0] === '-h') mal('falta el verbo');
    const o = parsear(argv);
    switch (o.verbo) {
      case 'abrir':
        return { codigo: 0, lineas: abrir(o, cwd, entrada) };
      case 'anotar':
        return { codigo: 0, lineas: anotar(o, cwd, ahora) };
      case 'listar':
        return { codigo: 0, lineas: listar(o, cwd) };
      case 'volcar':
        return { codigo: 0, lineas: volcar(o, cwd) };
      case 'veredicto':
        return { codigo: 0, lineas: veredicto(o, cwd) };
      default:
        return mal(`verbo desconocido: ${o.verbo}`);
    }
  } catch (e) {
    if (e instanceof Fallo) return { codigo: e.codigo, lineas: [e.codigo === 2 ? `${e.message}\n${USO}` : `prueba ${argv[0] || ''}: no — ${e.message}`] };
    return { codigo: 1, lineas: [`prueba roto: ${e.message}`] };
  }
}

module.exports = { main, parsear, fechaValida, secciones };

if (require.main === module) {
  const r = main(process.argv.slice(2));
  (r.codigo === 0 ? process.stdout : process.stderr).write(`${r.lineas.join('\n')}\n`);
  process.exitCode = r.codigo;
}
