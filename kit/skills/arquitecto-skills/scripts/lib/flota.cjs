'use strict';
// flota.cjs — `actualizar.cjs flota`: la flota de punta a punta (SPEC-paquete-6 P7.1, D6.2; E §6; D6-1, D6-6, D6-11, D6-15, D6-16).
//
//   node actualizar.cjs flota <repo>… | todo --canon <url o dir> [--tag vX.Y.Z[-rc.N]] [--proyectos <carpeta>] [--plazo <min>]
//                                             [--fecha <AAAA-MM-DD>] [--molde-viejo <dir>]
//
// Un script determinista (D6-1): nadie lo corre en bypass y no lanza agentes. En orden:
//   (0) el canónico: git clone de --canon a un temporal, con tags, parado en --tag (sin él, el último tag v* ANOTADO por versión).
//       Tag no anotado → 1. D6-15: kit/VERSION de ese árbol = el tag sin el -rc.N; si no → 1. Ese árbol es el --kit de aplicar.
//   (1) por repo, UNO DETRÁS DEL OTRO (D6-11), y uno que falla no frena a los demás: del checkout de Guido se lee SOLO el origin
//       (git remote get-url): su árbol de trabajo nunca se toca ni se lee. Sin origin → "sin remoto: no se toca".
//   (2) git clone completo (nunca --depth) del origin a un temporal; sin red o colgado → "sin tocar: <por qué>", con plazo.
//   (3) saltear con su porqué: ramas modulo/* vivas en el remoto (obra en curso) · la ficha ya dice la versión (al día) · kit/v<v>
//       ya en el remoto (está o espera a Guido), SALVO que su último commit diga "kit: ROTA — …" (D6-16): esa se borra del remoto
//       (git push --delete, nunca --force) y se rehace.
//   (4) .kit-rol = actualizador (y esa línea en .git/info/exclude), rama kit/v<v> desde la rama por defecto, aplicar.
//   (5) D6-6: si el clon trae .githooks/, core.hooksPath = .githooks; commit "kit <v> → <v'>" y los push con KIT_MOLDE y
//       KIT_MOLDE_VIEJO en el entorno (los moldes materializados; el runner los lee solo con .kit-rol = actualizador: F2).
//   (6) chequear con --base = la rama por defecto de antes. Un ❌ (o NO VERIFICADO) → nada a la rama por defecto: commit vacío
//       "kit: ROTA — <primera ❌>" con las nueve líneas en el cuerpo y push de kit/v<v> (D6-16).
//   (7) verde → la rama por defecto avanza con el commit del kit (ff, un commit). Push rechazado (protegida, o se movió) → push de
//       kit/v<v>, que queda viva y va a "te espera". En el camino verde kit/v<v> nunca se sube: no queda ninguna kit/* viva salvo
//       las ROTA y las que esperan.
//   (8) piezas adaptadas: la fila suma "adaptadas: <ids>" con lo que aplicar informó (la fusión es de F3, lib/fusion.cjs).
//   (9) los temporales se borran siempre.
// Al final, la tabla (repo · antes → después · resultado · porqué) y "te espera:". Salida 0 si ningún repo quedó ROTA ni con error
// propio; 1 si alguno; 2 uso. Nada de gh: el protegido se detecta por el push rechazado.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const F = require('../../pc/lib/ficha.cjs');
const M = require('./molde.cjs');

const ROTO = 'actualizador roto: corré doctor';
const RUTA_FICHA = '.claude/kit.md';
const KIT_ROL = '.kit-rol';
const PLAZO_RED = 5 * 60 * 1000; // clon y push: nada colgado
const PLAZO_LOCAL = 60 * 1000;
const RE_TAG = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-rc\.(0|[1-9]\d*))?$/;
const RE_ROTA = /^kit: ROTA — /;
// La identidad del commit del kit: va por el entorno, que le gana a la config de la PC y a un GIT_AUTHOR_* heredado.
const IDENTIDAD = {
  GIT_AUTHOR_NAME: 'kit-actualizador', GIT_AUTHOR_EMAIL: 'kit-actualizador@kit.invalid',
  GIT_COMMITTER_NAME: 'kit-actualizador', GIT_COMMITTER_EMAIL: 'kit-actualizador@kit.invalid',
};
// Lo que mueve el repo de git o le mete un molde al githook: nunca se hereda (los KIT_MOLDE* los pone flota, en el commit y el push).
const SACAR = /^(GIT_DIR|GIT_WORK_TREE|GIT_INDEX_FILE|GIT_OBJECT_DIRECTORY|GIT_ALTERNATE_OBJECT_DIRECTORIES|GIT_COMMON_DIR|GIT_PREFIX|GIT_NAMESPACE|KIT_MOLDE|KIT_MOLDE_VIEJO)$/i;

class Negativa extends Error {}

function entorno(extra) {
  const e = {};
  for (const [k, v] of Object.entries(process.env)) if (!SACAR.test(k)) e[k] = v;
  // sin red no se pregunta nada: ni usuario y clave por la terminal ni la ventana del administrador de credenciales
  return { ...e, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never', ...(extra || {}) };
}

function git(cwd, args, o = {}) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', windowsHide: true, timeout: o.plazo || PLAZO_LOCAL, killSignal: 'SIGKILL', env: entorno(o.env) });
  const colgado = !!(r.error && r.error.code === 'ETIMEDOUT');
  return { ok: !r.error && r.status === 0, out: r.stdout || '', err: String(r.stderr || (r.error && r.error.message) || '').trim(), colgado };
}

const primera = (s) => String(s || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean).filter((l) => !/^hint:/.test(l))[0] || '';
const minutos = (ms) => `${Math.round(ms / 60000)} min`;

const mismaRuta = (a, b) => {
  const n = (p) => {
    try { return fs.realpathSync.native(p); } catch { return path.resolve(p); }
  };
  const x = n(a), y = n(b);
  return process.platform === 'win32' ? x.toLowerCase() === y.toLowerCase() : x === y;
};

// ---------------------------------------------------------------- los tags del canónico

// La clave de orden de un tag v*: -rc.N va antes que la versión sin -rc. → null si no es de la forma.
function claveTag(t) {
  const m = RE_TAG.exec(t);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? Infinity : Number(m[4])];
}
function compararTags(a, b) {
  const x = claveTag(a), y = claveTag(b);
  for (let i = 0; i < 4; i++) if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1;
  return 0;
}
// El tag que toca: el pedido (tiene que estar y ser anotado), o el último v* anotado por versión. tags = [{nombre, tipo}].
function elegirTag(tags, pedido) {
  if (pedido) {
    const t = tags.find((x) => x.nombre === pedido);
    if (!t) throw new Negativa(`el canónico no tiene el tag ${pedido}`);
    if (t.tipo !== 'tag') throw new Negativa(`el tag ${pedido} no es anotado: el kit se reparte solo desde un tag anotado (git tag -a)`);
    return pedido;
  }
  const v = tags.filter((x) => x.tipo === 'tag' && claveTag(x.nombre)).map((x) => x.nombre).sort(compararTags);
  if (!v.length) throw new Negativa('el canónico no tiene ningún tag v* anotado: no hay versión para repartir');
  return v[v.length - 1];
}
// D6-15: la versión = kit/VERSION; el tag sin el -rc.N tiene que decir lo mismo.
const versionDeTag = (tag) => tag.slice(1).replace(/-rc\.\d+$/, '');

function prepararCanon(canon, tagPedido, dir) {
  const c = git(path.dirname(dir), ['clone', '-q', '--no-checkout', canon, dir], { plazo: PLAZO_RED });
  if (!c.ok) throw new Negativa(`no pude clonar el canónico ${canon}: ${c.colgado ? `no respondió en ${minutos(PLAZO_RED)}` : primera(c.err)}`);
  const r = git(dir, ['for-each-ref', '--format=%(refname:short)%09%(objecttype)', 'refs/tags']);
  if (!r.ok) throw new Error(`no leo los tags del canónico: ${primera(r.err)}`);
  const tags = r.out.split(/\r?\n/).filter(Boolean).map((l) => {
    const [nombre, tipo] = l.split('\t');
    return { nombre, tipo };
  });
  const tag = elegirTag(tags, tagPedido);
  const k = git(dir, ['-c', 'advice.detachedHead=false', 'checkout', '-q', '--detach', `refs/tags/${tag}`]);
  if (!k.ok) throw new Error(`no pude pararme en ${tag}: ${primera(k.err)}`);
  const rv = path.join(dir, 'kit', 'VERSION');
  if (!fs.existsSync(rv)) throw new Negativa(`el canónico en ${tag} no tiene kit/VERSION: no es un kit`);
  const version = fs.readFileSync(rv, 'utf8').trim();
  if (versionDeTag(tag) !== version) throw new Negativa(`el tag ${tag} no coincide con kit/VERSION (${version}): no reparto (D6-15)`);
  return { dir, tag, version };
}

// ---------------------------------------------------------------- de dónde sale cada repo

// La ruta de un origin local relativo se resuelve contra el checkout; una URL o un host:ruta, tal cual.
function resolverOrigen(url, dir) {
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(url) || /^[^/\\@]+@[^/\\:]+:/.test(url) || /^[a-z0-9.-]{2,}:(?![\\/])/i.test(url)) return url;
  return path.resolve(dir, url);
}

// Del checkout de Guido, SOLO el origin. → {url} o {sinRemoto: por qué}. No lee el árbol de trabajo ni escribe nada.
function origenDe(dir) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return { sinRemoto: `no encuentro la carpeta ${dir}` };
  const top = git(dir, ['rev-parse', '--show-toplevel'], { env: { GIT_OPTIONAL_LOCKS: '0' } });
  if (!top.ok || !mismaRuta(top.out.trim(), dir)) return { sinRemoto: 'no es la raíz de un repo de git' };
  const r = git(dir, ['remote', 'get-url', 'origin'], { env: { GIT_OPTIONAL_LOCKS: '0' } });
  const url = r.ok ? r.out.trim() : '';
  if (!url) return { sinRemoto: 'sin remoto (no tiene origin): no se toca' };
  return { url: resolverOrigen(url, dir) };
}

// `todo`: los de --proyectos con ficha (la idea del adaptador registro de arquitecto.cjs, sin depender de esa skill).
function todosLosRepos(proyectos) {
  let dirs;
  try {
    dirs = fs.readdirSync(proyectos, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
  } catch {
    throw new Negativa(`no encuentro la carpeta de proyectos ${proyectos}`);
  }
  return dirs.filter((n) => fs.existsSync(path.join(proyectos, n, ...RUTA_FICHA.split('/'))));
}

function rutaDeRepo(nombre, proyectos) {
  const esRuta = path.isAbsolute(nombre) || /[\\/]/.test(nombre) || nombre === '.' || nombre === '..';
  if (!esRuta && proyectos) return path.join(proyectos, nombre);
  return path.resolve(nombre);
}

// ---------------------------------------------------------------- lo que dijo aplicar y chequear

// Las piezas adaptadas que aplicar informó: "<id> · adaptada… · …" o "… · adaptada: no fusiona …".
function adaptadasDe(lineas) {
  const ids = [];
  for (const l of lineas || []) {
    const p = String(l).split(' · ');
    if (p.length >= 3 && (/^"?adaptada/.test(p[1]) || /^adaptada:/.test(p[2])) && !ids.includes(p[0])) ids.push(p[0]);
  }
  return ids;
}
const primeraRoja = (lineas) => (lineas || []).find((l) => / · ❌ · /.test(l)) || (lineas || []).find(Boolean) || 'chequear no dijo nada';

// Por qué no entró el push a la rama por defecto (sin gh: lo dice el rechazo).
function porqueRechazo(err) {
  if (/non-fast-forward|fetch first|\(stale info\)/i.test(err)) return 'la rama por defecto se movió mientras actualizaba';
  return 'la rama por defecto está protegida';
}

// ---------------------------------------------------------------- un repo

// actualizarRepo(nombre, url, ctx) → fila {repo, antes, despues, resultado, porque, espera: [], falla}. Escribe solo en su clon temporal
// y en el remoto. ctx = {kit, version, tmp, n, moldeViejo, fecha, plazoMs, aplicar, chequear}.
async function actualizarRepo(nombre, url, ctx) {
  const fila = { repo: nombre, antes: '?', despues: '?', resultado: '', porque: '', espera: [], falla: false };
  const fin = (resultado, porque, extra = {}) => Object.assign(fila, { resultado, porque }, extra);
  const clon = path.join(ctx.tmp, `repo-${ctx.n}`);
  const c = git(ctx.tmp, ['clone', '-q', url, clon], { plazo: PLAZO_RED }); // completo: nunca --depth
  if (!c.ok) return fin('sin tocar', c.colgado ? `el remoto no respondió en ${minutos(PLAZO_RED)}` : `no pude clonar el remoto: ${primera(c.err)}`);
  const head = git(clon, ['rev-parse', '--verify', '-q', 'HEAD']);
  if (!head.ok) return fin('sin tocar', 'el remoto está vacío');
  const base = head.out.trim();
  const sym = git(clon, ['symbolic-ref', '--short', 'refs/remotes/origin/HEAD']);
  const def = sym.ok ? sym.out.trim().replace(/^origin\//, '') : git(clon, ['rev-parse', '--abbrev-ref', 'HEAD']).out.trim();
  const rr = git(clon, ['for-each-ref', '--format=%(refname)', 'refs/remotes/origin']);
  if (!rr.ok) throw new Error(`no leo las ramas del clon: ${primera(rr.err)}`);
  const ramas = rr.out.split(/\r?\n/).filter(Boolean).map((r) => r.replace(/^refs\/remotes\/origin\//, '')).filter((r) => r !== 'HEAD');

  // (3) saltear, con su porqué
  const modulos = ramas.filter((r) => r.startsWith('modulo/'));
  if (modulos.length) return fin('salteado', `obra en curso: ${modulos.join(', ')} viva${modulos.length > 1 ? 's' : ''} en el remoto — no me meto en el medio`);
  const rf = path.join(clon, ...RUTA_FICHA.split('/'));
  if (!fs.existsSync(rf)) return fin('sin tocar', `sin ficha (${RUTA_FICHA}): eso es adoptarlo, no actualizarlo`);
  let datos;
  try {
    datos = F.leer(fs.readFileSync(rf, 'utf8')).datos;
  } catch (e) {
    return fin('sin tocar', `la ficha no se lee (${e.message})`);
  }
  fila.antes = String(datos.kit || '?');
  fila.despues = fila.antes;
  if (datos.kit === ctx.version) return fin('al día', `la ficha ya dice ${ctx.version}`);
  const rama = `kit/v${ctx.version}`;
  let rehecha = false;
  if (ramas.includes(rama)) {
    const s = git(clon, ['log', '-1', '--format=%s', `refs/remotes/origin/${rama}`]);
    if (!s.ok || !RE_ROTA.test(s.out.trim())) return fin('salteado', `${rama} ya está en el remoto: espera que la mezcles (o ya pasó)`);
    // D6-16: la ROTA se borra y se rehace — un delete y un push nuevo, nunca --force
    const d = git(clon, ['push', '-q', 'origin', '--delete', rama], { plazo: PLAZO_RED });
    if (!d.ok) return fin('sin tocar', `${rama} está ROTA y no pude borrarla del remoto: ${d.colgado ? 'no respondió' : primera(d.err)}`);
    rehecha = true;
  }

  // (4) el rol, la rama y aplicar
  fs.writeFileSync(path.join(clon, KIT_ROL), 'actualizador\n');
  fs.appendFileSync(path.join(clon, '.git', 'info', 'exclude'), `\n${KIT_ROL}\n`);
  const b = git(clon, ['checkout', '-q', '-b', rama]);
  if (!b.ok) throw new Error(`no pude crear ${rama}: ${primera(b.err)}`);
  const a = ctx.aplicar(clon, { kit: ctx.kit, moldeViejo: ctx.moldeViejo, fecha: ctx.fecha });
  const adaptadas = adaptadasDe(a.lineas);
  const notas = [];
  if (rehecha) notas.push(`la ${rama} ROTA de antes se borró y se rehizo`);
  if (adaptadas.length) {
    notas.push(`adaptadas: ${adaptadas.join(', ')}`);
    fila.espera.push(`${nombre}: piezas adaptadas sin fusionar (${adaptadas.join(', ')}): mirá el diff del molde contra lo tuyo`);
  }
  const conNotas = (porque) => [porque, ...notas].filter(Boolean).join(' · ');
  if (a.codigo !== 0) {
    const msg = String([...a.lineas].reverse().find((l) => /^aplicar: /.test(l)) || a.lineas[a.lineas.length - 1] || '').replace(/^aplicar: /, '');
    return fin('sin tocar', conNotas(`aplicar se negó: ${msg}`));
  }

  // (5) los githooks en el clon (D6-6), el commit y el entorno de los push
  if (fs.existsSync(path.join(clon, '.githooks')) && fs.statSync(path.join(clon, '.githooks')).isDirectory()) {
    const h = git(clon, ['config', 'core.hooksPath', '.githooks']);
    if (!h.ok) throw new Error(`no pude poner core.hooksPath: ${primera(h.err)}`);
  }
  const vars = datos.vars && typeof datos.vars === 'object' && !Array.isArray(datos.vars) ? datos.vars : {};
  const opM = { vars, fecha: ctx.fecha };
  const nuevo = M.materializarNuevo(ctx.kit, opM, path.join(ctx.tmp, `molde-nuevo-${ctx.n}`));
  const viejo = ctx.moldeViejo
    ? M.materializarDir(ctx.moldeViejo, opM, path.join(ctx.tmp, `molde-viejo-${ctx.n}`))
    : M.materializarViejo(ctx.kit, datos.kit, opM, path.join(ctx.tmp, `molde-viejo-${ctx.n}`));
  const env = { ...IDENTIDAD, KIT_MOLDE: nuevo.dir, KIT_MOLDE_VIEJO: viejo.dir };
  const ad = git(clon, ['add', '-A']);
  if (!ad.ok) throw new Error(`git add: ${primera(ad.err)}`);
  const cm = git(clon, ['commit', '-q', '-m', `kit ${fila.antes} → ${ctx.version}`], { env, plazo: PLAZO_RED });
  if (!cm.ok) {
    fila.espera.push(`${nombre}: el commit del kit no pasó (${primera(cm.err || cm.out) || 'sin salida'}): no subí nada`);
    return fin('sin tocar', conNotas(`el commit del kit no pasó: ${primera(cm.err || cm.out) || 'sin salida'}`), { falla: true });
  }

  // (6) chequear contra la rama por defecto de antes
  const ch = await ctx.chequear(clon, { kit: ctx.kit, moldeViejo: ctx.moldeViejo, base, fecha: ctx.fecha, plazoMs: ctx.plazoMs });
  if (ch.codigo !== 0) {
    const roja = primeraRoja(ch.lineas);
    const rc = git(clon, ['commit', '-q', '--allow-empty', '-m', `kit: ROTA — ${roja}`, '-m', ch.lineas.join('\n')], { env, plazo: PLAZO_RED });
    if (!rc.ok) throw new Error(`no pude commitear la marca ROTA: ${primera(rc.err)}`);
    const p = git(clon, ['push', '-q', 'origin', `${rama}:refs/heads/${rama}`], { env, plazo: PLAZO_RED });
    const subida = p.ok ? '' : ` (no pude subir ${rama}: ${p.colgado ? 'el remoto no respondió' : primera(p.err)})`;
    fila.espera.push(`${nombre}: ${rama} quedó ROTA — ${roja}${subida}${p.ok ? '; las nueve líneas, en su último commit' : ''}`);
    return fin('ROTA', conNotas(`${roja}${subida}`), { falla: true });
  }

  // (7) verde: la rama por defecto avanza con el commit del kit (ff); rechazado → kit/v<v> queda viva y espera
  const p = git(clon, ['push', '-q', 'origin', `HEAD:refs/heads/${def}`], { env, plazo: PLAZO_RED });
  if (p.ok) return fin('mezclado', conNotas(`un commit a ${def}`), { despues: ctx.version });
  const porque = p.colgado ? 'el remoto no respondió' : porqueRechazo(p.err);
  const q = git(clon, ['push', '-q', 'origin', `${rama}:refs/heads/${rama}`], { env, plazo: PLAZO_RED });
  if (!q.ok) return fin('sin tocar', conNotas(`${porque} (${primera(p.err)}) y no pude subir ${rama}: ${q.colgado ? 'no respondió' : primera(q.err)}`));
  fila.espera.push(`${nombre}: ${porque}; mezclá ${rama} en ${def} vos`);
  return fin('te espera', conNotas(`${porque}; mezclá ${rama} vos`));
}

// ---------------------------------------------------------------- la tabla

function tabla(filas) {
  const cols = [['repo', 'antes → después', 'resultado', 'porqué / lo que espera']];
  for (const f of filas) cols.push([f.repo, f.antes === '?' && f.despues === '?' ? '—' : `${f.antes} → ${f.despues}`, f.resultado, f.porque]);
  const ancho = [0, 1, 2].map((i) => Math.max(...cols.map((c) => c[i].length)));
  const lineas = cols.map((c) => [0, 1, 2].map((i) => c[i].padEnd(ancho[i])).concat(c[3]).join(' | ').trimEnd());
  lineas.splice(1, 0, ancho.map((w) => '-'.repeat(w)).concat('-'.repeat(22)).join('-|-'));
  const espera = filas.flatMap((f) => f.espera);
  lineas.push('', espera.length ? 'te espera:' : 'te espera: nada');
  for (const e of espera) lineas.push(`  - ${e}`);
  return lineas;
}

// ---------------------------------------------------------------- flota

// flota({repos, canon, tag, proyectos, plazoMs, fecha, moldeViejo, aplicar?, chequear?}) → {codigo, lineas, filas}
async function flota(o) {
  const A = require('../actualizar.cjs');
  const aplicar = o.aplicar || A.aplicar;
  const chequear = o.chequear || A.chequear;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-flota-'));
  try {
    let canon;
    let repos;
    try {
      repos = o.repos.length === 1 && o.repos[0] === 'todo' ? todosLosRepos(o.proyectos) : o.repos;
      canon = prepararCanon(o.canon, o.tag, path.join(tmp, 'canon'));
    } catch (e) {
      if (e instanceof Negativa) return { codigo: 1, lineas: [`flota: ${e.message}`], filas: [] };
      throw e;
    }
    const lineas = [`flota · kit ${canon.version} (tag ${canon.tag})`];
    if (!repos.length) lineas.push('ningún repo con ficha en la carpeta de proyectos');
    const filas = [];
    let n = 0;
    for (const nombre of repos) {
      const dir = rutaDeRepo(nombre, o.proyectos);
      const etiqueta = path.basename(dir);
      const og = origenDe(dir);
      if (!og.url) {
        filas.push({ repo: etiqueta, antes: '?', despues: '?', resultado: 'sin tocar', porque: og.sinRemoto, espera: [], falla: false });
        continue;
      }
      try {
        filas.push(await actualizarRepo(etiqueta, og.url, { ...o, aplicar, chequear, kit: canon.dir, version: canon.version, tmp, n: n++ }));
      } catch (e) {
        filas.push({ repo: etiqueta, antes: '?', despues: '?', resultado: 'error', porque: `${ROTO} (${e && e.message ? e.message : e})`, espera: [], falla: true });
      }
    }
    lineas.push('', ...tabla(filas));
    return { codigo: filas.some((f) => f.falla) ? 1 : 0, lineas, filas };
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* un temporal que Windows no suelta */ }
  }
}

// ---------------------------------------------------------------- la línea de comandos (la despacha actualizar.cjs)

function leerArgs(argv) {
  const o = { repos: [] };
  const conValor = { '--canon': 'canon', '--tag': 'tag', '--proyectos': 'proyectos', '--plazo': 'plazo', '--fecha': 'fecha', '--molde-viejo': 'moldeViejo' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (Object.prototype.hasOwnProperty.call(conValor, a)) {
      if (i + 1 >= argv.length || !argv[i + 1]) return null;
      o[conValor[a]] = argv[++i];
    } else if (!a.startsWith('--') && a) o.repos.push(a);
    else return null;
  }
  if (!o.repos.length || !o.canon) return null;
  if (o.repos.includes('todo') && (o.repos.length > 1 || !o.proyectos)) return null;
  if (o.tag !== undefined && !RE_TAG.test(o.tag)) return null;
  if (o.plazo !== undefined && !(Number(o.plazo) > 0)) return null;
  if (o.fecha !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(o.fecha)) return null;
  return o;
}

// main(argv sin "flota") → {codigo, lineas} o null (uso: lo imprime actualizar.cjs)
async function main(argv) {
  const o = leerArgs(argv);
  if (!o) return null;
  return flota({
    repos: o.repos,
    canon: fs.existsSync(o.canon) ? path.resolve(o.canon) : o.canon, // un dir relativo, contra el cwd (el clon corre en el temporal)
    tag: o.tag,
    proyectos: o.proyectos ? path.resolve(o.proyectos) : undefined,
    plazoMs: Math.round(Number(o.plazo || 30) * 60000),
    fecha: o.fecha,
    moldeViejo: o.moldeViejo ? path.resolve(o.moldeViejo) : undefined,
  });
}

module.exports = { flota, main, leerArgs, actualizarRepo, prepararCanon, elegirTag, compararTags, versionDeTag, origenDe, resolverOrigen, todosLosRepos, adaptadasDe, primeraRoja, porqueRechazo, tabla, Negativa, RE_ROTA };
