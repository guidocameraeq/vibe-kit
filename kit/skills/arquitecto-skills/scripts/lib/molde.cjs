'use strict';
// molde.cjs — el molde viejo y el nuevo, materializados en temporales con la forma de kit/molde/ (SPEC-paquete-6 P7.1).
//
// Forma "3" = kit/molde/ tal cual. Forma "2.4" = kit/skills/arquitecto/templates/universales/ (2.4.x), pasada a la forma de
// kit/molde/: settings.template.json → settings.json, CLAUDE.template.md → CLAUDE.md, lo demás igual.
// De dónde sale cada uno:
//   - el nuevo: del disco del --kit (kit/molde/; si no hay, templates/universales/);
//   - el viejo: de `git archive v<kit de la ficha>` del --kit (por git cat-file, sin tar), o de una carpeta (--molde-viejo).
// Instanciar: solo los .md y los .json (el código no lleva marcadores, y los *.test.cjs viajan tal cual: chequeo.cjs corre los del
// molde nuevo). {{PROYECTO}} y cada {{NOMBRE_EN_MAYUSCULAS}} salen de vars: de la ficha (nombre-en-minusculas-con-guiones);
// {{YYYY-MM-DD}} de la fecha. En 2.4, además, se va la frase del _LEEME del settings que el template pedía borrar. Con
// `completar` (los docs, que nacen en el proyecto: chequear 1 no acepta un {{ suelto), lo que quede → [completar: …].
// Todo sale en LF (el checkout de Windows puede traer CRLF).

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const RAIZ_3 = 'kit/molde';
const RAIZ_24 = 'kit/skills/arquitecto/templates/universales';
const RENOMBRES_24 = { 'settings.template.json': 'settings.json', 'CLAUDE.template.md': 'CLAUDE.md' };
// La frase que el template v2 del settings pedía borrar a mano (rehacer.sh hace lo mismo): sin ella, el _LEEME casa con el proyecto.
const LIBRES_24 = [['Reemplazar los {{...}} por los comandos reales de las skills del proyecto (o borrar esas líneas). ', '']];

const lf = (s) => String(s).replace(/\r\n/g, '\n');
const conBarras = (p) => String(p).replace(/\\/g, '/');

function git(args, opciones = {}) {
  const r = spawnSync('git', args, { encoding: opciones.encoding === null ? null : 'utf8', input: opciones.input, maxBuffer: 256 * 1024 * 1024, windowsHide: true });
  if (r.error) throw new Error(`git ${args[0]}: ${r.error.message}`);
  if (r.status !== 0) throw new Error(`git ${args.slice(0, 3).join(' ')} salió ${r.status}: ${String(r.stderr || '').trim()}`);
  return r.stdout;
}

// ---------------------------------------------------------------- instanciar

const aClave = (nombre) => nombre.toLowerCase().replace(/_/g, '-');

function instanciar(texto, vars = {}, opciones = {}) {
  let t = lf(texto);
  if (opciones.forma === '2.4') for (const [de, a] of LIBRES_24) t = t.split(de).join(a);
  if (opciones.fecha) t = t.split('{{YYYY-MM-DD}}').join(opciones.fecha);
  t = t.replace(/\{\{([A-Z][A-Z0-9_]*)\}\}/g, (todo, nombre) => {
    const v = vars[aClave(nombre)];
    return typeof v === 'string' && v !== '' ? v : todo;
  });
  if (opciones.completar) {
    t = t.replace(/\{\{([^{}]*)\}\}/g, (todo, adentro) => (/^LINEAS:\d+$/.test(adentro) ? todo : `[completar: ${adentro.trim() || '…'}]`));
  }
  return t;
}

const seInstancia = (rel) => /\.(md|json)$/i.test(rel) && !/\.test\.cjs$/.test(rel);

// ---------------------------------------------------------------- leer un molde (Map rel → texto LF, con la forma de kit/molde/)

function leerDisco(dir) {
  const m = new Map();
  (function rec(d, rel) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const q = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) rec(path.join(d, e.name), q);
      else if (e.isFile()) m.set(q, lf(fs.readFileSync(path.join(d, e.name), 'utf8')));
    }
  })(dir, '');
  return m;
}

const a3 = (m, forma) => {
  if (forma !== '2.4') return m;
  const out = new Map();
  for (const [rel, t] of m) out.set(Object.prototype.hasOwnProperty.call(RENOMBRES_24, rel) ? RENOMBRES_24[rel] : rel, t);
  return out;
};

// La forma de una carpeta: la raíz de un kit, kit/molde/, templates/universales/, o un molde ya con la forma de kit/molde/.
function formaDe(dir) {
  const hay = (r) => fs.existsSync(path.join(dir, r));
  if (hay(path.join(RAIZ_3, 'settings.json'))) return { forma: '3', raiz: path.join(dir, RAIZ_3) };
  if (hay(path.join(RAIZ_24, 'settings.template.json'))) return { forma: '2.4', raiz: path.join(dir, RAIZ_24) };
  if (hay('settings.template.json')) return { forma: '2.4', raiz: dir };
  if (hay('settings.json')) {
    // ya materializado o kit/molde/ suelto: lo dice la marca de molde.cjs, o (sin marca) si trae el arranque v2
    const marca = path.join(dir, '.forma-molde');
    if (fs.existsSync(marca)) return { forma: fs.readFileSync(marca, 'utf8').trim(), raiz: dir };
    return { forma: hay(path.join('hooks', 'session-start.sh')) && !hay(path.join('hooks', 'session-start.cjs')) ? '2.4' : '3', raiz: dir };
  }
  return null;
}

// Los archivos de un molde dentro de un commit/tag de un repo git, por cat-file --batch (sin tar: anda igual en Windows).
function leerGit(repo, ref, prefijo) {
  const ls = git(['-C', repo, 'ls-tree', '-r', '-z', ref, '--', `${prefijo}/`]);
  const entradas = ls.split('\0').filter(Boolean).map((l) => {
    const tab = l.indexOf('\t');
    const [, tipo, sha] = l.slice(0, tab).split(' ');
    return { tipo, sha, ruta: l.slice(tab + 1) };
  }).filter((e) => e.tipo === 'blob');
  const m = new Map();
  if (!entradas.length) return m;
  const buf = git(['-C', repo, 'cat-file', '--batch'], { input: entradas.map((e) => e.sha).join('\n') + '\n', encoding: null });
  let i = 0;
  for (const e of entradas) {
    const fin = buf.indexOf(10, i);
    const cab = buf.subarray(i, fin).toString('utf8').split(' ');
    const largo = Number(cab[2]);
    if (cab[0] !== e.sha || !Number.isFinite(largo)) throw new Error(`git cat-file devolvió algo inesperado para ${e.ruta}`);
    m.set(e.ruta.slice(prefijo.length + 1), lf(buf.subarray(fin + 1, fin + 1 + largo).toString('utf8')));
    i = fin + 1 + largo + 1;
  }
  return m;
}

function formaDeTag(repo, ref) {
  const hay = (r) => spawnSync('git', ['-C', repo, 'cat-file', '-e', `${ref}:${r}`], { windowsHide: true }).status === 0;
  if (hay(`${RAIZ_3}/settings.json`)) return { forma: '3', prefijo: RAIZ_3 };
  if (hay(`${RAIZ_24}/settings.template.json`)) return { forma: '2.4', prefijo: RAIZ_24 };
  return null;
}

// ---------------------------------------------------------------- materializar

function escribirMolde(archivos, forma, destino, opciones) {
  fs.mkdirSync(destino, { recursive: true });
  for (const [rel, t] of archivos) {
    const p = path.join(destino, ...rel.split('/'));
    fs.mkdirSync(path.dirname(p), { recursive: true });
    const esDoc = rel.startsWith('docs/');
    const texto = seInstancia(rel) ? instanciar(t, opciones.vars, { forma, fecha: opciones.fecha, completar: esDoc }) : t;
    fs.writeFileSync(p, texto);
  }
  fs.writeFileSync(path.join(destino, '.forma-molde'), `${forma}\n`);
  return { dir: destino, forma };
}

const destinoDe = (destino, nombre) => destino || fs.mkdtempSync(path.join(os.tmpdir(), `kit-molde-${nombre}-`));

// materializarDir(dir, {vars, fecha}, destino?) → {dir, forma}: un molde que está en disco (la raíz de un kit, kit/molde/,
// templates/universales/ o uno ya materializado). Sin destino, un temporal (lo borra quien llama: borrar(dir)).
function materializarDir(dir, opciones = {}, destino) {
  const f = formaDe(dir);
  if (!f) throw new Error(`en ${dir} no hay un molde que conozca (kit/molde/ ni templates/universales/)`);
  const archivos = a3(leerDisco(f.raiz), f.forma);
  archivos.delete('.forma-molde');
  return escribirMolde(archivos, f.forma, destinoDe(destino, 'dir'), opciones);
}

// materializarNuevo(kit, {vars, fecha}, destino?): el molde del disco del --kit.
function materializarNuevo(kit, opciones = {}, destino) {
  return materializarDir(kit, opciones, destinoDe(destino, 'nuevo'));
}

// materializarViejo(kit, version, {vars, fecha}, destino?): el molde del tag v<version> del --kit. Tira si el tag no está.
function materializarViejo(kit, version, opciones = {}, destino) {
  const ref = `refs/tags/v${version}`;
  if (spawnSync('git', ['-C', kit, 'rev-parse', '-q', '--verify', `${ref}^{commit}`], { windowsHide: true }).status !== 0) {
    throw new Error(`el kit no tiene el tag v${version} (el de la ficha): pasá --molde-viejo <carpeta>`);
  }
  const f = formaDeTag(kit, ref);
  if (!f) throw new Error(`el tag v${version} no trae un molde que conozca`);
  return escribirMolde(a3(leerGit(kit, ref, f.prefijo), f.forma), f.forma, destinoDe(destino, 'viejo'), opciones);
}

function borrar(dir) {
  if (dir) fs.rmSync(dir, { recursive: true, force: true });
}

// Los archivos de un molde materializado: Map(rel → texto), sin la marca de forma.
function archivosDe(dir) {
  const m = leerDisco(dir);
  m.delete('.forma-molde');
  return m;
}

module.exports = { instanciar, formaDe, materializarDir, materializarNuevo, materializarViejo, archivosDe, borrar, lf, conBarras };
