'use strict';
// worktree.cjs — los worktrees de los módulos: nacen, se abren y se cierran por script (SPEC-paquete-4 P6.2; H §10; F §9;
// RT1-3, RT1-14, RT2-5, RT2-9, RT2-12; RF-11; red team r1-1, r1-2, r1-4, r1-5, r1-8, r1-9, r1-10). Uso, desde el repo:
//   node .claude/scripts/worktree.cjs crear  <x>[--<ID>] [--noche] [--model <m>]
//   node .claude/scripts/worktree.cjs abrir  <x>[--<ID>] [--noche] [--model <m>]
//   node .claude/scripts/worktree.cjs sync-env
//   node .claude/scripts/worktree.cjs cerrar <x>[--<ID>]
// Rama modulo/<x> → carpeta .claude/worktrees/modulo--<x> (director); modulo/<x>--<ID> → .claude/worktrees/modulo--<x>--<ID> (obrero).
// Las carpetas van SIEMPRE bajo el checkout principal (el padre del git-common-dir), también corrido desde el worktree del director.
// `crear`/`abrir` escriben .kit-rol (ASCII, sin BOM, LF: los mismos bytes desde PowerShell o Bash), copian lo que lista
// .worktreeinclude (sin él: los .env y .env.* ignorados) SACANDO todo renglón cuyo nombre esté en el almacén del proyecto
// (~/.config/kit-secretos/<proyecto>.env: de ahí se leen solo los NOMBRES; ningún valor sale por pantalla), suman al
// .claude/settings.local.json del worktree un deny absoluto al .env del principal, corren vars.comando-setup e imprimen la línea de
// apertura. El filtro falla cerrado: almacén ilegible, o un .env* trackeado con un nombre del almacén → 1 sin crear nada.
// `cerrar`: todos los chequeos primero (desde adentro, sin mergear en su madre local u origin, sucio; frenos.log mudado al
// <git-common-dir>/kit-frenos.log), después `git worktree remove` sin --force, y solo si anduvo, `git branch -D`.
// Salidas: 0 anduvo · 1 negado o con fallas (una línea por qué) · 2 mal llamado. Un error propio: "worktree roto: corré doctor", 1.
// Node estándar, cero dependencias. Es .cjs a propósito: corre igual en proyectos con "type": "module".

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const USO = [
  'Uso: node .claude/scripts/worktree.cjs <comando> …   (desde el repo)',
  '  crear  <x>[--<ID>] [--noche] [--model <m>]   rama y carpeta nuevas (x: módulo; --<ID>: encargo de dos dígitos)',
  '  abrir  <x>[--<ID>] [--noche] [--model <m>]   la rama ya existe (acá o en origin) y la carpeta no está en esta PC',
  '  sync-env                                      saca de los .env de los worktrees vivos lo que está en el almacén',
  '  cerrar <x>[--<ID>]                            borra carpeta y rama, solo si está mergeada y limpia',
].join('\n');

const ROTO = 'worktree roto: corré doctor';
const CARPETAS = '.claude/worktrees';
const RE_X = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const RE_ID = /^[0-9]{2}$/;
const RE_MODELO = /^[A-Za-z0-9][A-Za-z0-9._\-[\]]*$/;
const RE_ENV = /^\.env(\..+)?$/;
const IGNORADOS = ['.claude/worktrees/', '.kit-rol', '.claude/settings.local.json'];
const LOG = '.claude/frenos.log';
const LOG_COMUN = 'kit-frenos.log';
const T_GIT = 60000; // worktree add, fetch, remove y ls-files en un repo grande pasan los 5 s de git.cjs

class MalLlamado extends Error {}
const malLlamado = (m) => {
  throw new MalLlamado(m);
};

// ---------------------------------------------------------------- argumentos y nombres

// "<x>" o "<x>--<ID>" → { x, id, rama, carpeta (el nombre), madre (solo encargos) }. Otro nombre → mal llamado (2).
function nombreDe(token) {
  const m = /^(.*?)(?:--([^-].*))?$/.exec(String(token || ''));
  const x = m ? m[1] : '';
  const id = m && m[2] !== undefined ? m[2] : null;
  if (!RE_X.test(x) || x.length > 20) malLlamado(`Nombre inválido: "${token}" — <x> es minúsculas, números y guiones simples, hasta 20.`);
  if (id !== null && !RE_ID.test(id)) malLlamado(`Encargo inválido: "${token}" — el <ID> son dos dígitos (x--01).`);
  if (id === null) return { x, id, rama: `modulo/${x}`, carpeta: `modulo--${x}`, madre: null };
  return { x, id, rama: `modulo/${x}--${id}`, carpeta: `modulo--${x}--${id}`, madre: `modulo/${x}` };
}

function leerArgumentos(argv) {
  const [comando, ...resto] = argv;
  if (!comando) malLlamado('Falta el comando.');
  if (!['crear', 'abrir', 'sync-env', 'cerrar'].includes(comando)) malLlamado(`Comando desconocido: ${comando}`);
  const conOpciones = comando === 'crear' || comando === 'abrir';
  const a = { comando, nombre: null, noche: false, modelo: null };
  const pos = [];
  for (let i = 0; i < resto.length; i++) {
    const v = resto[i];
    if (conOpciones && v === '--noche') {
      if (a.noche) malLlamado('--noche va una sola vez.');
      a.noche = true;
    } else if (conOpciones && v === '--model') {
      if (i + 1 >= resto.length) malLlamado('--model pide un valor.');
      if (a.modelo !== null) malLlamado('--model va una sola vez.');
      a.modelo = resto[++i];
      if (!RE_MODELO.test(a.modelo)) malLlamado(`Modelo inválido: "${a.modelo}".`);
    } else if (v.startsWith('--')) {
      malLlamado(`Argumento desconocido: ${v}`);
    } else {
      pos.push(v);
    }
  }
  const cuantos = comando === 'sync-env' ? 0 : 1;
  if (pos.length !== cuantos) malLlamado(`${comando} lleva ${cuantos} argumento(s) además de las banderas.`);
  if (cuantos) a.nombre = nombreDe(pos[0]);
  return a;
}

// ---------------------------------------------------------------- utilidades

function libs() {
  return {
    git: require('../hooks/lib/git.cjs'),
    contexto: require('../hooks/lib/contexto.cjs'),
    ficha: require('../hooks/lib/ficha.cjs'),
    frenosLog: require('../hooks/lib/frenos-log.cjs'),
  };
}

const WIN = process.platform === 'win32';
const norm = (p) => {
  const r = path.resolve(p);
  return WIN ? r.toLowerCase() : r;
};
const mismaRuta = (a, b) => norm(a) === norm(b);
function dentroDe(hijo, padre) {
  const rel = path.relative(norm(padre), norm(hijo));
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}
// Con '/' (Windows acepta las dos), para que la línea se pegue igual en PowerShell y en Bash.
const barras = (p) => path.resolve(p).split(path.sep).join('/');

function escribirAtomico(abs, contenido) {
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  const tmp = `${abs}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, contenido);
  fs.renameSync(tmp, abs);
}

// git con su tiempo; nunca tira: { ok, codigo, stdout, salida, stderr, error }.
const G = (L, args, cwd, extra = {}) => L.git.correr(args, { cwd, tiempo: T_GIT, ...extra });
const existeRef = (L, cwd, ref) => G(L, ['rev-parse', '--verify', '-q', `${ref}^{commit}`], cwd).ok;
const sha = (L, cwd, ref) => {
  const r = G(L, ['rev-parse', '--verify', '-q', `${ref}^{commit}`], cwd);
  return r.ok ? r.stdout.trim() : null;
};
const primeraLinea = (s) => (String(s || '').trim().split('\n')[0] || '').trim();

// Dónde estamos: la raíz del checkout del cwd y el principal (el padre del git-common-dir). null fuera de un repo.
function ubicar(L, cwd) {
  const g = L.contexto.datosGit(cwd);
  if (!g) return null;
  return { ...g, cwd, principal: path.dirname(g.gitComun) };
}

// `git worktree list --porcelain` → [{ ruta, rama ('refs/heads/…' o null) }].
function worktrees(L, principal) {
  const r = G(L, ['worktree', 'list', '--porcelain'], principal);
  if (!r.ok) return [];
  const lista = [];
  let actual = null;
  for (const l of r.stdout.split('\n')) {
    const s = l.replace(/\r$/, '');
    if (s.startsWith('worktree ')) {
      actual = { ruta: path.resolve(s.slice('worktree '.length)), rama: null };
      lista.push(actual);
    } else if (actual && s.startsWith('branch ')) {
      actual.rama = s.slice('branch '.length);
    }
  }
  return lista;
}

// ---------------------------------------------------------------- lo ignorado (r1-5, D4-13)

function noIgnorados(L, principal) {
  return IGNORADOS.filter((p) => G(L, ['check-ignore', '-q', '--', p], principal).codigo !== 0);
}
const lineaIgnorados = (faltan) =>
  `${faltan.join(', ')} no ${faltan.length === 1 ? 'está ignorado' : 'están ignorados'} — pegá en el .gitignore del principal el ` +
  'gitignore.snippet del kit ENTERO (trae /.claude/worktrees/, /.kit-rol y /.claude/settings.local.json) y commitealo';

// ---------------------------------------------------------------- el almacén y el filtro de credenciales (RT1-3, RT2-5, D4-5, r1-4)

// <proyecto>: la regla de cargar-secreto.sh aplicada al checkout PRINCIPAL (si no, desde el worktree del director saldría
// "modulo--x" y no encontraría el almacén): vars.proyecto de .claude/kit.md del disco, si no el nombre de la carpeta; en
// minúsculas ASCII y todo byte que no sea a-z0-9 → "-".
function proyectoDe(principal) {
  let p = '';
  let texto = null;
  try {
    texto = fs.readFileSync(path.join(principal, '.claude', 'kit.md'), 'utf8');
  } catch (e) {
    texto = null;
  }
  if (texto !== null) {
    let enVars = false;
    for (const crudo of texto.split('\n')) {
      const l = crudo.replace(/\r$/, '');
      if (/^vars:[ \t]*(#.*)?$/.test(l)) {
        enVars = true;
        continue;
      }
      if (!enVars) continue;
      if (/^[^ \t#]/.test(l)) {
        enVars = false;
        continue;
      }
      const m = /^[ \t]+proyecto:[ \t]*(.*)$/.exec(l);
      if (m) {
        let v = m[1];
        const c = /[ \t]#/.exec(v);
        if (c) v = v.slice(0, c.index);
        v = v.replace(/^[ \t]+|[ \t]+$/g, '');
        v = v.replace(/^["']/, '').replace(/["']$/, '');
        p = v;
        break;
      }
    }
  }
  if (p === '') p = path.basename(principal);
  const bytes = Buffer.from(p, 'utf8');
  let s = '';
  for (const b of bytes) {
    const c = b >= 0x41 && b <= 0x5a ? b + 32 : b;
    s += (c >= 0x61 && c <= 0x7a) || (c >= 0x30 && c <= 0x39) ? String.fromCharCode(c) : '-';
  }
  return s === '' ? 'proyecto' : s;
}

function casa() {
  return process.env.HOME && process.env.HOME.trim() !== '' ? process.env.HOME : os.homedir();
}
const rutaAlmacen = (proyecto) => path.join(casa(), '.config', 'kit-secretos', `${proyecto}.env`);

// UTF-16 (BOM o bytes nulos): no se puede leer como texto. Se niega, nunca se adivina.
function ilegible(buf) {
  if (buf.length >= 2 && ((buf[0] === 0xff && buf[1] === 0xfe) || (buf[0] === 0xfe && buf[1] === 0xff))) return true;
  return buf.includes(0);
}

// → { estado: 'sin' | 'ok' | 'ilegible', nombres: Set (en mayúsculas), ruta, proyecto }. Del almacén SOLO se guardan los nombres.
function leerAlmacen(principal) {
  const proyecto = proyectoDe(principal);
  const ruta = rutaAlmacen(proyecto);
  const nombres = new Set();
  let buf;
  try {
    buf = fs.readFileSync(ruta);
  } catch (e) {
    if (e && e.code === 'ENOENT') return { estado: 'sin', nombres, ruta, proyecto };
    return { estado: 'ilegible', nombres, ruta, proyecto, motivo: 'no se puede leer' };
  }
  if (ilegible(buf)) return { estado: 'ilegible', nombres, ruta, proyecto, motivo: 'está en UTF-16' };
  const lineas = buf.toString('utf8').replace(/^\uFEFF/, '').split('\n');
  for (let i = 0; i < lineas.length; i++) {
    const l = lineas[i].replace(/\r$/, '');
    if (l.trim() === '' || l.trim().startsWith('#')) continue;
    const m = /^([A-Za-z_][A-Za-z0-9_]*)=/.exec(l);
    if (!m) return { estado: 'ilegible', nombres: new Set(), ruta, proyecto, motivo: `el renglón ${i + 1} no es NOMBRE=…` };
    nombres.add(m[1].toUpperCase());
  }
  return { estado: 'ok', nombres, ruta, proyecto };
}

// ¿Dónde cierra la comilla q en s? (la doble admite \" escapada).
function cierra(s, q) {
  for (let i = 0; i < s.length; i++) {
    if (q === '"' && s[i] === '\\') {
      i++;
      continue;
    }
    if (s[i] === q) return true;
  }
  return false;
}

// Un .env en bloques: cada asignación con sus renglones de continuación (valor entre comillas que sigue abajo), y el resto
// (comentarios, vacíos, basura) de a uno. Acepta `export `, espacios alrededor del `=` y CRLF.
function bloquesEnv(texto) {
  const lineas = texto.split('\n');
  const bloques = [];
  for (let i = 0; i < lineas.length; i++) {
    const l = lineas[i].replace(/\r$/, '');
    const m = /^[ \t]*(?:export[ \t]+)?([A-Za-z_][A-Za-z0-9_.-]*)[ \t]*=[ \t]*(.*)$/.exec(l);
    if (!m) {
      bloques.push({ nombre: null, desde: i, hasta: i, vacio: true });
      continue;
    }
    const valor = m[2];
    let hasta = i;
    const q = valor[0];
    if (q === '"' || q === "'" || q === '`') {
      let cerrada = cierra(valor.slice(1), q);
      while (!cerrada && hasta + 1 < lineas.length) {
        hasta++;
        cerrada = cierra(lineas[hasta].replace(/\r$/, ''), q);
      }
    }
    const vacio = hasta === i && /^(""|''|``)?[ \t]*(#.*)?$/.test(valor.trim());
    bloques.push({ nombre: m[1], desde: i, hasta, vacio });
    i = hasta; // los renglones de continuación son de este bloque, no asignaciones nuevas
  }
  return { lineas, bloques };
}

// filtrarEnv(texto, nombres) → { texto, sacados: [NOMBRE…] }. Saca entero cada bloque cuyo nombre esté en el almacén.
function filtrarEnv(texto, nombres) {
  const bom = texto.startsWith('\uFEFF');
  const { lineas, bloques } = bloquesEnv(bom ? texto.slice(1) : texto);
  const quedan = [];
  const sacados = [];
  for (const b of bloques) {
    if (b.nombre !== null && nombres.has(b.nombre.toUpperCase())) {
      sacados.push(b.nombre);
      continue;
    }
    for (let i = b.desde; i <= b.hasta; i++) quedan.push(lineas[i]);
  }
  return { texto: (bom ? '\uFEFF' : '') + quedan.join('\n'), sacados };
}

const esEnv = (rel) => RE_ENV.test(rel.split('/').pop());

// Un .env* trackeado llega por el checkout, no por la copia: si trae un valor para un nombre del almacén → 1 (r1-4).
// Un nombre con el valor vacío (NOMBRE= en un .env.example) no lleva credencial y pasa.
function trackeadosConNombre(L, principal, base, alm) {
  const r = G(L, ['ls-tree', '-r', '-z', '--name-only', base], principal);
  if (!r.ok) return { error: `no pude listar los archivos de ${base}` };
  const malos = [];
  if (alm.nombres.size === 0) return { malos };
  for (const rel of r.stdout.split('\0').filter(Boolean)) {
    if (!esEnv(rel)) continue;
    const s = G(L, ['show', `${base}:${rel}`], principal);
    if (!s.ok) return { error: `no pude leer ${rel} de ${base}` };
    if (ilegible(s.salida)) {
      malos.push(`${rel} (UTF-16: no lo puedo revisar)`);
      continue;
    }
    const t = s.salida.toString('utf8').replace(/^\uFEFF/, '');
    const con = bloquesEnv(t).bloques.filter((b) => b.nombre !== null && !b.vacio && alm.nombres.has(b.nombre.toUpperCase()));
    if (con.length) malos.push(`${rel} (${[...new Set(con.map((b) => b.nombre))].join(', ')})`);
  }
  return { malos };
}

// Lo que se copia del principal: lo que lista .worktreeinclude Y está ignorado por git (como el -w nativo); sin el archivo, los
// .env y .env.* ignorados. Nunca lo que está adentro de .claude/worktrees/.
function listaACopiar(L, principal) {
  const wti = path.join(principal, '.worktreeinclude');
  const tiene = fs.existsSync(wti);
  const args = tiene ? ['ls-files', '-z', '-o', '-i', `--exclude-from=${wti}`] : ['ls-files', '-z', '-o', '-i', '--exclude=.env', '--exclude=.env.*'];
  const r = G(L, args, principal);
  if (!r.ok) return { error: 'no pude listar lo que se copia' };
  const cand = r.stdout.split('\0').filter((s) => s && !s.startsWith(`${CARPETAS}/`));
  let lista = [];
  if (cand.length) {
    const ci = G(L, ['check-ignore', '-z', '--stdin'], principal, { entrada: `${cand.join('\0')}\0` });
    if (ci.codigo !== 0 && ci.codigo !== 1) return { error: 'no pude ver qué está ignorado' };
    const ign = new Set(ci.stdout.split('\0').filter(Boolean));
    lista = cand.filter((s) => ign.has(s));
  }
  return { lista, tiene };
}

// Arma en memoria lo que se va a escribir, ANTES de crear nada: un .env* que no se puede filtrar → error (falla cerrado).
function prepararCopia(L, principal, alm) {
  const l = listaACopiar(L, principal);
  if (l.error) return l;
  const lineas = [];
  if (!l.tiene) lineas.push('sin .worktreeinclude: copio los .env y .env.* ignorados del principal');
  if (alm.estado === 'sin') lineas.push(`sin almacén para ${alm.proyecto}: no saqué nada`);
  const archivos = [];
  for (const rel of l.lista) {
    let buf;
    try {
      buf = fs.readFileSync(path.join(principal, ...rel.split('/')));
    } catch (e) {
      if (esEnv(rel)) return { error: `no pude leer ${rel}: no copié nada` };
      lineas.push(`no pude leer ${rel}: no lo copié`);
      continue;
    }
    if (esEnv(rel)) {
      if (ilegible(buf)) return { error: `${rel} está en UTF-16: no lo puedo filtrar y no copié nada — guardalo en UTF-8` };
      const f = filtrarEnv(buf.toString('utf8'), alm.nombres);
      for (const n of f.sacados) lineas.push(`no copié ${n} de ${rel}: vive en el almacén`);
      buf = Buffer.from(f.texto, 'utf8');
    }
    archivos.push({ rel, buf });
  }
  return { archivos, lineas };
}

// "//c/Users/…" (Windows) o "//home/…": la ruta absoluta de las reglas de permisos de Claude Code.
function rutaPermiso(abs) {
  const p = barras(abs);
  const m = /^([A-Za-z]):\/(.*)$/.exec(p);
  if (m) return `//${m[1].toLowerCase()}/${m[2]}`.replace(/\/$/, '');
  return `/${p}`.replace(/\/$/, '');
}
function reglasDeny(principal) {
  const base = rutaPermiso(principal);
  const reglas = [];
  for (const h of ['Read', 'Edit', 'Write']) for (const f of ['.env', '.env.*']) reglas.push(`${h}(${base}/${f})`);
  return reglas;
}

// Suma los deny al settings.local.json del worktree sin pisar lo que tenía (ahí van las allow de AUTORIZADO, P6.5).
function sumarDeny(wt, principal) {
  const archivo = path.join(wt, '.claude', 'settings.local.json');
  let datos = {};
  if (fs.existsSync(archivo)) {
    try {
      datos = JSON.parse(fs.readFileSync(archivo, 'utf8').replace(/^\uFEFF/, ''));
    } catch (e) {
      return false;
    }
  }
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) return false;
  if (datos.permissions === undefined) datos.permissions = {};
  if (!datos.permissions || typeof datos.permissions !== 'object' || Array.isArray(datos.permissions)) return false;
  if (datos.permissions.deny === undefined) datos.permissions.deny = [];
  if (!Array.isArray(datos.permissions.deny)) return false;
  for (const r of reglasDeny(principal)) if (!datos.permissions.deny.includes(r)) datos.permissions.deny.push(r);
  escribirAtomico(archivo, `${JSON.stringify(datos, null, 2)}\n`);
  return true;
}

// ---------------------------------------------------------------- crear y abrir

const rolDe = (n, noche) => (noche ? 'nocturno' : n.id === null ? 'director' : 'obrero');
const lineaApertura = (wt, n, modelo) =>
  `cd "${barras(wt)}"; claude --name ${n.id === null ? `director-${n.x}` : `obrero-${n.x}--${n.id}`} --model ${modelo || (n.id === null ? 'opus' : 'sonnet')}`;

// La rama por defecto LOCAL (la base de un módulo): el nombre de la regla de 4.7, como rama de esta PC.
function porDefectoLocal(L, cwd) {
  const nombre = L.contexto.ramaPorDefecto(cwd);
  if (!nombre || !existeRef(L, cwd, `refs/heads/${nombre}`)) return null;
  return nombre;
}

// Las negativas que comparten crear y abrir sobre una base ya resuelta: almacén, .env trackeado y la copia en memoria.
function chequeosDeCredenciales(L, principal, base, cmd) {
  const alm = leerAlmacen(principal);
  const no = (m) => ({ codigo: 1, lineas: [`worktree ${cmd}: no — ${m}`] });
  if (alm.estado === 'ilegible') return no(`el almacén de ${alm.proyecto} ${alm.motivo}: no copié ningún .env — rehacelo con cargar-secreto (UTF-8, NOMBRE=…)`);
  const t = trackeadosConNombre(L, principal, base, alm);
  if (t.error) return no(t.error);
  if (t.malos.length) return no(`hay un .env trackeado con un nombre del almacén: ${t.malos.join('; ')} — sacalo del repo (git rm --cached) o vacía ese valor`);
  const c = prepararCopia(L, principal, alm);
  if (c.error) return no(c.error);
  return { codigo: 0, copia: c };
}

// Lo que sigue a `git worktree add`, igual en crear y abrir: .kit-rol, copia, deny, comando-setup, la línea.
function equipar(L, wt, principal, n, a, copia, opciones) {
  const lineas = [];
  let codigo = 0;
  const rol = rolDe(n, a.noche);
  fs.writeFileSync(path.join(wt, '.kit-rol'), Buffer.from(`${rol}\n`, 'ascii'));
  lineas.push(...copia.lineas);
  for (const { rel, buf } of copia.archivos) {
    const destino = path.join(wt, ...rel.split('/'));
    if (fs.existsSync(destino)) {
      lineas.push(`${rel} ya vino con el checkout: no lo pisé`);
      continue;
    }
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.writeFileSync(destino, buf);
  }
  if (copia.archivos.length) lineas.push(`copié ${copia.archivos.length} archivo(s) del principal`);
  if (!sumarDeny(wt, principal)) {
    lineas.push('no pude sumar el deny al .env del principal: .claude/settings.local.json del worktree no es un JSON de objeto — arreglalo y corré abrir de nuevo');
    codigo = 1;
  }
  const s = correrSetup(L, wt, opciones);
  lineas.push(s.linea);
  if (s.falla) codigo = 1;
  lineas.push(`worktree ${a.comando}: ${n.rama} en ${CARPETAS}/${n.carpeta} (rol ${rol})`);
  lineas.push(lineaApertura(wt, n, a.modelo));
  return { codigo, lineas };
}

function correrSetup(L, wt, opciones) {
  const archivo = path.join(wt, '.claude', 'kit.md');
  if (!fs.existsSync(archivo)) return { linea: 'sin ficha: no corrí comando-setup' };
  let datos;
  try {
    datos = L.ficha.leerArchivo(archivo).datos;
  } catch (e) {
    return { linea: `la ficha está rota (${e.message || e}): no corrí comando-setup; no borré nada`, falla: true };
  }
  const cmd = datos && datos.vars ? datos.vars['comando-setup'] : undefined;
  if (typeof cmd !== 'string' || cmd.trim() === '') return { linea: 'la ficha no tiene vars.comando-setup: no corrí nada' };
  const r = spawnSync(cmd, { cwd: wt, shell: true, stdio: opciones.heredar === false ? 'pipe' : 'inherit', windowsHide: true });
  if (r.error || r.status !== 0) {
    const como = r.error ? r.error.code || r.error.message : `salida ${r.status}`;
    return { linea: `comando-setup falló (${como}): corrélo a mano adentro del worktree; no borré nada`, falla: true };
  }
  return { linea: `comando-setup anduvo: ${cmd}` };
}

function crear(L, u, n, a, opciones) {
  const no = (m) => ({ codigo: 1, lineas: [`worktree crear: no — ${m}`] });
  const P = u.principal;
  const faltan = noIgnorados(L, P);
  if (faltan.length) return no(lineaIgnorados(faltan));
  const def = porDefectoLocal(L, P);
  if (!def) return no('no encuentro la rama por defecto en esta PC (main o master)');
  if (!G(L, ['cat-file', '-e', `refs/heads/${def}:docs/modulos/${n.x}/README.md`], P).ok) {
    return no(`docs/modulos/${n.x}/README.md no está commiteado en ${def} — primero el commit del módulo (H §8.2)`);
  }
  const wt = path.join(P, ...CARPETAS.split('/'), n.carpeta);
  if (existeRef(L, P, `refs/heads/${n.rama}`) || existeRef(L, P, `refs/remotes/origin/${n.rama}`)) return no(`la rama ${n.rama} ya existe — eso es abrir`);
  if (fs.existsSync(wt) || worktrees(L, P).some((w) => mismaRuta(w.ruta, wt))) return no(`la carpeta ${CARPETAS}/${n.carpeta} ya existe — eso es abrir`);
  const base = n.madre ? `refs/heads/${n.madre}` : `refs/heads/${def}`;
  if (n.madre && !existeRef(L, P, base)) return no(`no existe ${n.madre} en esta PC — el encargo nace de la punta del módulo (worktree abrir ${n.x})`);
  const ch = chequeosDeCredenciales(L, P, base, 'crear');
  if (ch.codigo) return ch;
  // Pasó todo: recién ahora se toca algo.
  if (WIN) G(L, ['config', 'core.longpaths', 'true'], P);
  const add = G(L, ['worktree', 'add', '-b', n.rama, wt, base], P);
  if (!add.ok) return no(`git worktree add falló: ${primeraLinea(add.stderr) || add.error}`);
  return equipar(L, wt, P, n, a, ch.copia, opciones);
}

function abrir(L, u, n, a, opciones) {
  const lineas = [];
  const no = (m) => ({ codigo: 1, lineas: [...lineas, `worktree abrir: no — ${m}`] });
  const P = u.principal;
  const faltan = noIgnorados(L, P);
  if (faltan.length) return no(lineaIgnorados(faltan));
  const remotos = (G(L, ['remote'], P).stdout || '').split('\n').map((s) => s.trim());
  if (remotos.includes('origin')) {
    const f = G(L, ['fetch', '-q', 'origin'], P);
    if (!f.ok) lineas.push(`no pude hacer fetch de origin (${primeraLinea(f.stderr) || f.error}): sigo con lo que hay en esta PC`);
  }
  G(L, ['worktree', 'prune'], P);
  const wt = path.join(P, ...CARPETAS.split('/'), n.carpeta);
  const lista = worktrees(L, P);
  if (lista.some((w) => mismaRuta(w.ruta, wt))) return no(`${CARPETAS}/${n.carpeta} ya está abierto en esta PC: ${lineaApertura(wt, n, a.modelo)}`);
  if (fs.existsSync(wt)) return no(`${CARPETAS}/${n.carpeta} existe pero no es un worktree: movela o borrala a mano`);
  const ocupada = lista.find((w) => w.rama === `refs/heads/${n.rama}`);
  if (ocupada) return no(`${n.rama} está abierta en ${barras(ocupada.ruta)}`);
  const local = sha(L, P, `refs/heads/${n.rama}`);
  const remota = sha(L, P, `refs/remotes/origin/${n.rama}`);
  if (!local && !remota) return no(`no existe ${n.rama} ni acá ni en origin — eso es crear`);
  let destino = local;
  let adelantar = false;
  if (local && remota && local !== remota) {
    if (G(L, ['merge-base', '--is-ancestor', local, remota], P).ok) {
      destino = remota;
      adelantar = true;
    } else if (!G(L, ['merge-base', '--is-ancestor', remota, local], P).ok) {
      return no(`${n.rama} divergió de origin/${n.rama}: integralas a mano antes de abrir`);
    }
  } else if (!local) {
    destino = remota;
  }
  const ch = chequeosDeCredenciales(L, P, destino, 'abrir');
  if (ch.codigo) return { codigo: 1, lineas: [...lineas, ...ch.lineas] };
  if (WIN) G(L, ['config', 'core.longpaths', 'true'], P);
  if (!local) {
    const b = G(L, ['branch', '--track', n.rama, `refs/remotes/origin/${n.rama}`], P);
    if (!b.ok) return no(`no pude crear ${n.rama} desde origin: ${primeraLinea(b.stderr) || b.error}`);
  } else if (adelantar) {
    const b = G(L, ['update-ref', `refs/heads/${n.rama}`, destino, local], P);
    if (!b.ok) return no(`no pude adelantar ${n.rama}: ${primeraLinea(b.stderr) || b.error}`);
    lineas.push(`adelanté ${n.rama} hasta origin/${n.rama}`);
  }
  const add = G(L, ['worktree', 'add', wt, n.rama], P);
  if (!add.ok) return no(`git worktree add falló: ${primeraLinea(add.stderr) || add.error}`);
  const r = equipar(L, wt, P, n, a, ch.copia, opciones);
  return { codigo: r.codigo, lineas: [...lineas, ...r.lineas] };
}

// ---------------------------------------------------------------- sync-env (R-33, r1-8): solo saca, nunca vuelve a copiar

function syncEnv(L, u) {
  const P = u.principal;
  const alm = leerAlmacen(P);
  if (alm.estado === 'ilegible') return { codigo: 1, lineas: [`worktree sync-env: no — el almacén de ${alm.proyecto} ${alm.motivo}: no toqué nada`] };
  if (alm.estado === 'sin') return { codigo: 0, lineas: [`sin almacén para ${alm.proyecto}: no saqué nada`] };
  const raizWt = path.join(P, ...CARPETAS.split('/'));
  const vivos = worktrees(L, P).filter((w) => mismaRuta(path.dirname(w.ruta), raizWt) && /^modulo--/.test(path.basename(w.ruta)) && fs.existsSync(w.ruta));
  const lineas = [];
  let codigo = 0;
  for (const w of vivos) {
    const nombre = path.basename(w.ruta);
    const r = G(L, ['ls-files', '-z', '-o', '-i', '--exclude=.env', '--exclude=.env.*'], w.ruta);
    if (!r.ok) {
      lineas.push(`${nombre}: no pude listar sus .env`);
      codigo = 1;
      continue;
    }
    for (const rel of r.stdout.split('\0').filter(Boolean)) {
      const abs = path.join(w.ruta, ...rel.split('/'));
      let buf;
      try {
        buf = fs.readFileSync(abs);
      } catch (e) {
        lineas.push(`${nombre}/${rel}: no lo pude leer`);
        codigo = 1;
        continue;
      }
      if (ilegible(buf)) {
        lineas.push(`${nombre}/${rel} está en UTF-16: no lo pude filtrar — guardalo en UTF-8 y corré sync-env de nuevo`);
        codigo = 1;
        continue;
      }
      const f = filtrarEnv(buf.toString('utf8'), alm.nombres);
      if (!f.sacados.length) continue;
      escribirAtomico(abs, Buffer.from(f.texto, 'utf8'));
      for (const s of f.sacados) lineas.push(`saqué ${s} de ${nombre}/${rel}: vive en el almacén`);
    }
  }
  if (!lineas.length) lineas.push(`worktree sync-env: nada que sacar (${vivos.length} worktree(s) de módulo)`);
  return { codigo, lineas };
}

// ---------------------------------------------------------------- cerrar (R-22, D4-3, r1-1, r1-2, r1-9)

// La mudanza de frenos.log (r1-1): base = HEAD del worktree; los dos lados normalizados a LF (con core.autocrlf=true el
// archivo sale con CRLF y los hooks agregan LF). → 'nada' | 'mudado' | 'cambiado'.
function mudarFrenos(L, wt, gitComun, nombre) {
  const archivo = path.join(wt, ...LOG.split('/'));
  let disco;
  try {
    disco = fs.readFileSync(archivo);
  } catch (e) {
    return 'nada'; // no está en el disco: si estaba en HEAD, el status lo cuenta como sucio
  }
  const aLF = (b) => b.toString('utf8').replace(/\r\n/g, '\n');
  const base = G(L, ['show', `HEAD:${LOG}`], wt);
  const D = aLF(disco);
  let extra;
  if (!base.ok) {
    extra = D; // lo creó un hook: se muda entero y se borra
  } else {
    const B = aLF(base.salida);
    if (D === B) extra = '';
    else if (D.startsWith(B)) extra = D.slice(B.length).replace(/^\n/, '');
    else return 'cambiado';
  }
  if (extra.trim() !== '') {
    const comun = path.join(gitComun, LOG_COMUN);
    let previo = '';
    try {
      const t = fs.readFileSync(comun);
      if (t.length && t[t.length - 1] !== 0x0a) previo = '\n';
    } catch (e) {
      /* todavía no existe */
    }
    const cabeza = `# worktree cerrar ${nombre} · ${L.frenosLog.fechaConZona(new Date())}\n`;
    fs.appendFileSync(comun, `${previo}${cabeza}${extra.endsWith('\n') ? extra : `${extra}\n`}`);
  }
  if (!base.ok) fs.rmSync(archivo);
  else G(L, ['checkout', '--', LOG], wt);
  return 'mudado';
}

const porcelana = (L, wt) => {
  const r = G(L, ['status', '--porcelain', '--untracked-files=all'], wt);
  return r.ok ? r.stdout.split('\n').map((s) => s.replace(/\r$/, '')).filter(Boolean) : null;
};

function cerrar(L, u, n) {
  const no = (m) => ({ codigo: 1, lineas: [`worktree cerrar: no — ${m}`] });
  const P = u.principal;
  const wt = path.join(P, ...CARPETAS.split('/'), n.carpeta);
  if (mismaRuta(u.raiz, wt) || dentroDe(u.cwd, wt)) return no(`estás adentro de ${CARPETAS}/${n.carpeta}: corré cerrar desde el principal o desde el director`);
  if (!existeRef(L, P, `refs/heads/${n.rama}`)) return no(`no existe la rama ${n.rama} en esta PC`);
  const madre = n.madre || L.contexto.ramaPorDefecto(P);
  if (!madre) return no('no encuentro la rama por defecto (main o master)');
  const refs = [`refs/heads/${madre}`, `refs/remotes/origin/${madre}`].filter((r) => existeRef(L, P, r));
  if (!refs.length) return no(`no existe ${madre}, ni acá ni en origin`);
  const mergeada = refs.some((r) => G(L, ['merge-base', '--is-ancestor', `refs/heads/${n.rama}`, r], P).ok);
  if (!mergeada) return no(`${n.rama} no está mergeada en ${madre} (ni en la local ni en la de origin) — nada borrado`);
  const lista = worktrees(L, P);
  const entrada = lista.find((w) => w.rama === `refs/heads/${n.rama}`);
  if (entrada && !mismaRuta(entrada.ruta, wt)) return no(`${n.rama} está abierta en ${barras(entrada.ruta)}, no en ${CARPETAS}/${n.carpeta}`);
  const lineas = [];
  if (!fs.existsSync(wt)) {
    // Carpeta borrada a mano: prune (si seguía registrada) y la rama, con las mismas condiciones.
    if (entrada) {
      G(L, ['worktree', 'prune'], P);
      lineas.push(`${CARPETAS}/${n.carpeta} ya no estaba: hice prune`);
    }
  } else {
    if (!entrada) return no(`${CARPETAS}/${n.carpeta} existe pero no es el worktree de ${n.rama}: revisala a mano`);
    const antes = porcelana(L, wt);
    if (antes === null) return no('no pude leer el estado del worktree');
    const otros = antes.filter((l) => l.slice(3).replace(/^"|"$/g, '') !== LOG);
    if (otros.length) return no(`el worktree tiene cambios sin commitear: ${otros.slice(0, 5).join(' | ')}${otros.length > 5 ? ' …' : ''}`);
    const m = mudarFrenos(L, wt, u.gitComun, n.carpeta);
    if (m === 'cambiado') return no(`${LOG} cambió en el medio (no solo renglones al final): no lo toqué — commitealo o revisalo`);
    const despues = porcelana(L, wt);
    if (despues === null || despues.length) return no(`el worktree sigue sucio: ${(despues || []).slice(0, 5).join(' | ')}`);
    if (m === 'mudado') lineas.push(`mudé lo nuevo de ${LOG} a ${LOG_COMUN} del repo`);
    const rm = G(L, ['worktree', 'remove', wt], P, { tiempo: 120000 });
    if (!rm.ok) {
      return {
        codigo: 1,
        lineas: [...lineas, `worktree cerrar: no — git worktree remove falló (${primeraLinea(rm.stderr) || rm.error}): cerrá la pestaña o el claude de ese worktree y corré cerrar de nuevo; la rama ${n.rama} sigue`],
      };
    }
    lineas.push(`borré ${CARPETAS}/${n.carpeta}`);
  }
  const b = G(L, ['branch', '-D', n.rama], P);
  if (!b.ok) return { codigo: 1, lineas: [...lineas, `worktree cerrar: no pude borrar la rama ${n.rama}: ${primeraLinea(b.stderr) || b.error}`] };
  lineas.push(`worktree cerrar: ${n.rama} cerrada (estaba mergeada en ${madre})`);
  return { codigo: 0, lineas };
}

// ---------------------------------------------------------------- principal

function main(argv, opciones = {}) {
  const salida = opciones.salida || ((s) => process.stdout.write(s));
  const error = opciones.error || ((s) => process.stderr.write(s));
  let r;
  try {
    const a = leerArgumentos(argv);
    const L = libs();
    const u = ubicar(L, opciones.cwd || process.cwd());
    if (!u) {
      r = { codigo: 1, lineas: ['worktree: no estás dentro de un repo git'] };
    } else if (a.comando === 'crear') {
      r = crear(L, u, a.nombre, a, opciones);
    } else if (a.comando === 'abrir') {
      r = abrir(L, u, a.nombre, a, opciones);
    } else if (a.comando === 'sync-env') {
      r = syncEnv(L, u);
    } else {
      r = cerrar(L, u, a.nombre);
    }
  } catch (e) {
    if (e instanceof MalLlamado) {
      error(`${e.message}\n${USO}\n`);
      return 2;
    }
    salida(`${ROTO}\n`);
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
      process.stdout.write(`${ROTO}\n`);
    } catch (e2) {
      /* nada más que hacer: la salida 1 frena igual */
    }
  }
  process.exitCode = codigo;
}

module.exports = { USO, ROTO, nombreDe, leerArgumentos, proyectoDe, leerAlmacen, filtrarEnv, bloquesEnv, reglasDeny, rutaPermiso, main };
