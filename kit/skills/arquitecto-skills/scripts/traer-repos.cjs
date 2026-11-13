#!/usr/bin/env node
'use strict';
// traer-repos.cjs — "preparame esta PC" trae los repos de la cuenta que el dueño elija (SPEC-paquete-8d C2.1; tracker 60 y 10).
//
//   node traer-repos.cjs listar --proyectos <carpeta> [--gh <ruta>]
//   node traer-repos.cjs clonar <dueño/repo> [<dueño/repo>…] --proyectos <carpeta> [--gh <ruta>]
//
// listar: con gh, los repos de la cuenta y los de sus organizaciones, cada uno marcado "ya está (<carpeta>)" si algún repo de la
//   carpeta de proyectos tiene ese origin (la regla de lib/repos.cjs, la de la flota), o "para traer". No escribe nada.
// clonar: cada uno a <carpeta>/<repo>, con core.longpaths (10). Nunca pisa una carpeta que existe (esa la saltea con su línea). Si
//   el repo trae ficha (.claude/kit.md) y .githooks/, prende los ganchos (core.hooksPath, solo --local). Su comando-setup NO lo
//   corre: es código de ese repo — lo nombra, y la sesión lo muestra y pregunta, repo por repo.
// Nunca clona sin que el dueño elija: la sesión le muestra `listar` y le pregunta cuáles.
// Salidas: 0 anduvo (lo salteado no traba) · 1 gh no anda o un clon falló · 2 mal llamado. --gh: otra ruta de gh (las pruebas pasan
// uno de mentira, un .cjs que se corre con node). Node estándar, cero dependencias.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const R = require('./lib/repos.cjs');
const PU = require('../pc/lib/publicar.cjs'); // el origin normalizado del contrato (git@host:x = https://host/x)

const USO = 'uso: traer-repos.cjs listar --proyectos <carpeta> [--gh <ruta>] · traer-repos.cjs clonar <dueño/repo>… --proyectos <carpeta> [--gh <ruta>]';
const PLAZO_GH = 60000;
const PLAZO_CLON = 20 * 60 * 1000;
const RE_REPO = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

function leerArgs(argv) {
  const o = { accion: argv[0], repos: [], proyectos: null, gh: 'gh' };
  if (!['listar', 'clonar'].includes(o.accion)) return null;
  for (let i = 1; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--proyectos' || a === '--gh') {
      if (!argv[i + 1]) return null;
      o[a.slice(2)] = argv[++i];
    } else if (!a.startsWith('--') && o.accion === 'clonar' && RE_REPO.test(a)) o.repos.push(a);
    else return null;
  }
  if (!o.proyectos || (o.accion === 'clonar' && !o.repos.length)) return null;
  return o;
}

function gh(o, args) {
  const conNode = /\.c?js$/i.test(o.gh);
  const r = spawnSync(conNode ? process.execPath : o.gh, conNode ? [o.gh, ...args] : args, { encoding: 'utf8', timeout: args[1] === 'clone' ? PLAZO_CLON : PLAZO_GH, windowsHide: true });
  if (r.error) return { ok: false, err: r.error.code === 'ENOENT' ? 'gh no está (winget install GitHub.cli y gh auth login)' : r.error.code === 'ETIMEDOUT' ? 'gh no respondió' : r.error.message };
  return { ok: r.status === 0, out: r.stdout || '', err: (r.stderr || '').trim().split(/\r?\n/)[0] || `salió ${r.status}` };
}
const git = (cwd, args) => {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', windowsHide: true, timeout: 20000 });
  return { ok: !r.error && r.status === 0, out: (r.stdout || '').trim() };
};
const barras = (p) => String(p).replace(/\\/g, '/');

// Los repos de la cuenta y de sus organizaciones. → { ok, login, orgs, repos: [{ nombre, url, org }] } | { ok: false, err }
function deLaCuenta(o) {
  const yo = gh(o, ['api', 'user', '--jq', '.login']);
  if (!yo.ok) return { ok: false, err: `no pude leer tu cuenta con gh (${yo.err}): gh auth login` };
  const login = yo.out.trim();
  const orgsR = gh(o, ['api', 'user/orgs', '--jq', '.[].login']);
  const orgs = orgsR.ok ? orgsR.out.split(/\r?\n/).map((s) => s.trim()).filter(Boolean) : [];
  const repos = [];
  for (const dueno of [null, ...orgs]) {
    const r = gh(o, ['repo', 'list', ...(dueno ? [dueno] : []), '--limit', '1000', '--json', 'nameWithOwner,url']);
    if (!r.ok) return { ok: false, err: `gh repo list ${dueno || ''}falló (${r.err})` };
    let xs;
    try {
      xs = JSON.parse(r.out);
    } catch (e) {
      return { ok: false, err: 'gh repo list no devolvió JSON' };
    }
    for (const x of Array.isArray(xs) ? xs : []) {
      if (x && RE_REPO.test(String(x.nameWithOwner)) && !repos.some((y) => y.nombre === x.nameWithOwner)) repos.push({ nombre: x.nameWithOwner, url: String(x.url || ''), org: dueno });
    }
  }
  return { ok: true, login, orgs, repos };
}

// Los origin de la carpeta de proyectos (la regla de la flota) → Map(origin normalizado → carpeta relativa)
function locales(carpeta) {
  const m = new Map();
  let rec;
  try {
    rec = R.recorrer(carpeta);
  } catch (e) {
    return m;
  }
  for (const { dir, rel } of rec.repos) {
    const u = git(dir, ['config', '--get', 'remote.origin.url']);
    if (u.ok && u.out) m.set(PU.normalizarOrigin(u.out).toLowerCase(), barras(rel));
  }
  return m;
}
const claveDe = (url, nombre) => PU.normalizarOrigin(url || `https://github.com/${nombre}`).toLowerCase();

function listar(o) {
  const c = deLaCuenta(o);
  if (!c.ok) return { codigo: 1, lineas: [`traer-repos · ${c.err}`] };
  const loc = locales(o.proyectos);
  const lineas = [`traer-repos · cuenta ${c.login} · ${c.repos.length} repos${c.orgs.length ? ` (con los de ${c.orgs.join(', ')})` : ''} · carpeta ${barras(o.proyectos)}`];
  for (const x of c.repos) {
    const ya = loc.get(claveDe(x.url, x.nombre));
    lineas.push(`  ${x.nombre} · ${ya ? `ya está (${ya})` : 'para traer'}`);
  }
  const n = c.repos.filter((x) => !loc.has(claveDe(x.url, x.nombre))).length;
  lineas.push(n ? `${n} para traer — elegí cuáles (nunca traigo sin que elijas)` : 'todos ya están en tu carpeta');
  return { codigo: 0, lineas };
}

function setupDe(dir) {
  try {
    const F = require('../pc/lib/ficha.cjs');
    const v = F.leerArchivo(path.join(dir, '.claude', 'kit.md')).datos.vars;
    return v && typeof v['comando-setup'] === 'string' && v['comando-setup'].trim() ? v['comando-setup'].trim() : null;
  } catch (e) {
    return null;
  }
}

function clonar(o) {
  const lineas = [];
  let falla = false;
  fs.mkdirSync(o.proyectos, { recursive: true });
  for (const nombre of o.repos) {
    const destino = path.join(o.proyectos, nombre.split('/')[1]);
    if (fs.existsSync(destino)) {
      lineas.push(`${nombre} · ya hay una carpeta ${barras(destino)}: no la piso (si es otro repo, traelo a mano con otro nombre)`);
      continue;
    }
    const r = gh(o, ['repo', 'clone', nombre, destino, '--', '-c', 'core.longpaths=true']);
    if (!r.ok || !fs.existsSync(path.join(destino, '.git'))) {
      lineas.push(`${nombre} · no pude traerlo (${r.err || 'sin .git'})`);
      falla = true;
      continue;
    }
    git(destino, ['config', '--local', 'core.longpaths', 'true']);
    const partes = [`traído a ${barras(destino)}`];
    const conFicha = fs.existsSync(path.join(destino, '.claude', 'kit.md'));
    if (conFicha && fs.existsSync(path.join(destino, '.githooks'))) {
      const hp = git(destino, ['config', '--get', 'core.hooksPath']);
      if (!hp.out) {
        git(destino, ['config', '--local', 'core.hooksPath', '.githooks']);
        partes.push('ganchos prendidos');
      } else partes.push(`core.hooksPath ya decía ${hp.out}: no lo toqué`);
    }
    const setup = conFicha ? setupDe(destino) : null;
    if (setup) partes.push(`su comando-setup es «${setup}»: es código de ese repo, no lo corrí — la sesión te lo muestra y te pregunta`);
    else if (!conFicha) partes.push('no tiene el kit (para sumarlo: "adoptá este repo")');
    lineas.push(`${nombre} · ${partes.join(' · ')}`);
  }
  return { codigo: falla ? 1 : 0, lineas };
}

function principal(argv) {
  const o = leerArgs(argv);
  if (!o) return { codigo: 2, lineas: [USO] };
  o.proyectos = path.resolve(o.proyectos);
  return o.accion === 'listar' ? listar(o) : clonar(o);
}

if (require.main === module) {
  const { codigo, lineas } = principal(process.argv.slice(2));
  process.stdout.write(`${lineas.join('\n')}\n`, () => process.exit(codigo));
}

module.exports = { principal, leerArgs, deLaCuenta, locales };
