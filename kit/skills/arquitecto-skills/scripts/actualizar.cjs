#!/usr/bin/env node
'use strict';
// actualizar.cjs — el actualizador del kit, el núcleo (SPEC-paquete-6 P7.1, D6.1; E §4-§6; D6-1, D6-5, D6-7, D6-15; r1-2..r1-5).
// Un script de node determinista: nadie lo corre en bypass y no lanza agentes. La flota (clon, rama, mezcla, push) es de D6.2.
const USO = [
  'uso: node actualizar.cjs aplicar  <carpeta> --kit <raíz del kit> [--molde-viejo <dir>] [--plan] [--fecha <AAAA-MM-DD>]',
  '     node actualizar.cjs chequear <carpeta> --kit <raíz del kit> --base <sha> [--molde-viejo <dir>] [--plazo <min>]',
  '  aplicar   pone al día <carpeta> pieza por pieza según su ficha (.claude/kit.md), contra el molde del --kit. Escribe solo en',
  '            <carpeta>; no commitea, no pushea, no pone core.hooksPath (eso es de flota). Se niega (1) si <carpeta> no es un repo',
  '            con ficha que se lee, si no está limpia (salvo .kit-rol) o si .kit-rol no dice actualizador.',
  '  chequear  las nueve líneas del chequeo mecánico sobre lo aplicado y ya commiteado (<base>..HEAD); lo hace lib/chequeo.cjs.',
  '  --kit          la raíz de un clon del kit: el molde nuevo es su kit/molde/ y la versión nueva su kit/VERSION.',
  '  --molde-viejo  el molde del que viene el proyecto (sin él: git archive v<kit de la ficha> del --kit; con la misma',
  '                 versión, el mismo molde nuevo). Acepta la raíz de un kit, kit/molde/ o templates/universales/.',
  '  --plan         lo mismo, sin escribir nada.',
  '  --fecha        la fecha de los docs que nacen ({{YYYY-MM-DD}}); sin ella, hoy (las pruebas la fijan).',
  '  --plazo        minutos para el comando de pruebas del proyecto en chequear (30 por defecto).',
  'Salidas: 0 bien · 1 se negó, algo falló o un ❌ · 2 uso. Error propio: "actualizador roto: corré doctor".',
].join('\n');
//
// aplicar, en orden (SPEC-paquete-6, P7.1): (1) se niega si no corresponde; (2) por pieza, según la ficha, con el GUARDIA (D6-7):
// un archivo de una pieza molde o molde+propio está intacto si, fuera de su zona propia, es igual al del molde viejo (LF), o su
// huella coincide con el hash de la ficha, o ya es el del molde nuevo. Intacto → se reemplaza (o mezclarTexto: la zona queda
// byte a byte). Uno solo no intacto → la pieza entera no se toca y pasa a "adaptada (desvío detectado)". Pieza nueva con la
// ruta ocupada y distinta → desvío (r1-3). adaptada → no fusiona y avisa (la fusión es de D6.2). propia → no se toca.
// (3) Bajas: lo que el viejo traía y el nuevo no; intacto → se borra, editado → se deja; las de propia/adaptada no se borran.
// (4) settings por mezclarSettings (lo quitado no vuelve; lo retirado que el proyecto tenía igual se va: las deny Write(...)).
// (5) los .snippet renglón por renglón. (6) core.hooksPath NO (r1-5). (7) la ficha: kit y los hashes de lo reemplazado, el
// estado de lo marcado, todo lo demás byte a byte; un renglón al tope de docs/CHANGELOG.md. Nunca CLAUDE.md ni otro de docs/
// (docs solo nace: crea lo que falta; r1-2). (8) todo el plan antes de escribir; cada archivo temporal + renombre.
//
// Vive en eq/scripts/ y se instala en ~/.claude/skills/arquitecto-skills/scripts/: hace require de ../pc/lib/ (copia del molde).

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const F = require('../pc/lib/ficha.cjs');
const Z = require('../pc/lib/zona-propia.cjs');
const C = require('./lib/catalogo.cjs');
const M = require('./lib/molde.cjs');

const ROTO = 'actualizador roto: corré doctor';
const RUTA_FICHA = '.claude/kit.md';
const RUTA_SETTINGS = '.claude/settings.json';
const RUTA_CHANGELOG = 'docs/CHANGELOG.md';
const KIT_ROL = '.kit-rol';
const RE_VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const SNIPPETS = [['gitignore.snippet', '.gitignore'], ['gitattributes.snippet', '.gitattributes']];
const ADAPTADA = 'adaptada (desvío detectado)';

// Una negativa: sale 1 con su mensaje, sin escribir nada.
class Negativa extends Error {}

const lf = M.lf;

function gitEn(cwd, args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', windowsHide: true, env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } });
  return { ok: !r.error && r.status === 0, out: r.stdout || '', err: String(r.stderr || (r.error && r.error.message) || '') };
}

const mismaRuta = (a, b) => {
  const n = (p) => {
    try { return fs.realpathSync.native(p); } catch { return path.resolve(p); }
  };
  const x = n(a), y = n(b);
  return process.platform === 'win32' ? x.toLowerCase() === y.toLowerCase() : x === y;
};

// ---------------------------------------------------------------- (1) la negativa

function revisarCarpeta(carpeta) {
  if (!fs.existsSync(carpeta) || !fs.statSync(carpeta).isDirectory()) throw new Negativa(`${carpeta} no es una carpeta`);
  const top = gitEn(carpeta, ['rev-parse', '--show-toplevel']);
  if (!top.ok || !mismaRuta(top.out.trim(), carpeta)) throw new Negativa(`${carpeta} no es la raíz de un repo git — no toco nada`);
  const rf = path.join(carpeta, ...RUTA_FICHA.split('/'));
  if (!fs.existsSync(rf)) throw new Negativa(`${carpeta} no tiene ficha (${RUTA_FICHA}) — eso es del adoptador, no del actualizador`);
  const textoFicha = fs.readFileSync(rf, 'utf8');
  let ficha;
  try {
    ficha = F.leer(textoFicha);
  } catch (e) {
    throw new Negativa(`la ficha no se lee (${e.message}) — arreglala antes de actualizar; no toqué nada`);
  }
  const st = gitEn(carpeta, ['status', '--porcelain=v1', '-z', '--untracked-files=all']);
  if (!st.ok) throw new Negativa(`git status falló en ${carpeta}: ${st.err.trim()}`);
  const sucias = [];
  const partes = st.out.split('\0');
  for (let i = 0; i < partes.length; i++) {
    const e = partes[i];
    if (!e) continue;
    const ruta = e.slice(3);
    if (e[0] === 'R' || e[0] === 'C') i++; // el renombre trae la ruta vieja en la entrada siguiente
    if (ruta !== KIT_ROL) sucias.push(ruta); // se ignora EXACTAMENTE .kit-rol (r1-4)
  }
  if (sucias.length) throw new Negativa(`${carpeta} no está limpia (${sucias[0]}${sucias.length > 1 ? ` y ${sucias.length - 1} más` : ''}) — commiteá o descartá antes`);
  let rol = '';
  try { rol = fs.readFileSync(path.join(carpeta, KIT_ROL), 'utf8').trim(); } catch { rol = ''; }
  if (rol !== 'actualizador') {
    throw new Negativa(`${KIT_ROL} no dice "actualizador" — aplicar corre solo en el clon del actualizador, nunca en tu carpeta (RT1-5)`);
  }
  return { textoFicha, ficha };
}

// D6-15: la versión nueva = kit/VERSION; si el --kit está parado en un tag v*, tiene que decir lo mismo (sin el -rc.N).
function versionDelKit(kit) {
  const rv = path.join(kit, 'kit', 'VERSION');
  if (!fs.existsSync(rv)) throw new Negativa(`${kit} no es la raíz de un kit (falta kit/VERSION)`);
  const v = fs.readFileSync(rv, 'utf8').trim();
  if (!RE_VERSION.test(v)) throw new Negativa(`kit/VERSION dice "${v}": no es N.N.N`);
  const t = gitEn(kit, ['tag', '--points-at', 'HEAD']);
  if (t.ok) {
    for (const tag of t.out.split(/\r?\n/).map((x) => x.trim()).filter((x) => /^v\d/.test(x))) {
      const delTag = tag.slice(1).replace(/-rc\.\d+$/, '');
      if (delTag !== v) throw new Negativa(`el --kit está en el tag ${tag} pero kit/VERSION dice ${v}: no coinciden (D6-15)`);
    }
  }
  return v;
}

// RF-1: sin --molde-viejo, el molde viejo sale del tag v<ficha> del --kit. Si falta ese tag o el clon es sin historia (--depth 1),
// es un clon incompleto, no un actualizador roto: se dice cómo completarlo. → null si está, o el mensaje.
function faltaTagViejo(kit, version) {
  const k = String(kit).replace(/\\/g, '/');
  const sh = gitEn(kit, ['rev-parse', '--is-shallow-repository']);
  const raso = sh.ok && sh.out.trim() === 'true';
  const tag = gitEn(kit, ['rev-parse', '-q', '--verify', `refs/tags/v${version}^{commit}`]).ok;
  if (tag && !raso) return null;
  const que = raso ? `el --kit es un clon sin historia (shallow)${tag ? '' : ` y no tiene el tag v${version} (el de la ficha)`}` : `el --kit no tiene el tag v${version} (el de la ficha)`;
  // --unshallow en un clon completo da error: ahí alcanza con traer los tags
  return `${que}: completalo con \`git -C ${k} fetch ${raso ? '--unshallow ' : ''}--tags\` y corré de nuevo, o pasá --molde-viejo <carpeta>`;
}

// ---------------------------------------------------------------- la ficha: leer piezas y reescribir solo lo que cambia

const esMapa = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const estadoDe = (v) => (esMapa(v) ? v.estado : v);
const hashDe = (v) => (esMapa(v) ? v.hash : undefined);

function valorPieza(estado, hash) {
  const e = /[\s()]/.test(estado) ? `"${estado}"` : estado;
  return hash ? `{estado: ${e}, hash: ${hash}}` : e;
}

// Reescribe la cabecera: el renglón kit: y las entradas de piezas: de `cambios` (Map id → valor en texto). Lo demás, byte a byte.
function reescribirFicha(texto, version, cambios) {
  const bom = texto.charCodeAt(0) === 0xfeff ? '﻿' : '';
  const crlf = /\r\n/.test(texto);
  const lineas = (bom ? texto.slice(1) : texto).replace(/\r\n/g, '\n').split('\n');
  let cierre = lineas.indexOf('---', 1);
  if (lineas[0] !== '---' || cierre < 0) throw new Error('la ficha perdió su cabecera');
  const conComentario = (linea, nuevo) => {
    const m = /\s+#.*$/.exec(linea.replace(/"[^"]*"/g, (s) => ' '.repeat(s.length)));
    return m ? nuevo + linea.slice(m.index) : nuevo;
  };
  if (version !== null) {
    const i = lineas.findIndex((l, j) => j > 0 && j < cierre && /^kit:/.test(l));
    if (i < 0) throw new Error('la ficha no tiene el renglón kit:');
    lineas[i] = conComentario(lineas[i], `kit: ${version}`);
  }
  if (cambios.size) {
    let p = lineas.findIndex((l, j) => j > 0 && j < cierre && /^piezas:/.test(l));
    if (p < 0) {
      lineas.splice(cierre, 0, 'piezas:');
      p = cierre;
      cierre++;
    }
    // las entradas: renglones "  <id>:" hasta el primer renglón en la columna 0 que no es comentario
    let fin = p + 1;
    let ultima = p;
    const entradas = new Map();
    while (fin < cierre) {
      const l = lineas[fin];
      if (l.trim() !== '' && !/^\s/.test(l) && !/^#/.test(l)) break;
      const m = /^ {2}([^\s:#][^:]*):/.exec(l);
      if (m) {
        let h = fin + 1;
        while (h < cierre && /^ {3,}\S/.test(lineas[h])) h++;
        entradas.set(m[1], { desde: fin, hasta: h });
        ultima = h - 1;
        fin = h;
        continue;
      }
      fin++;
    }
    const nuevas = [];
    const reemplazos = [];
    for (const [id, valor] of cambios) {
      const e = entradas.get(id);
      if (e) reemplazos.push({ ...e, texto: conComentario(lineas[e.desde], `  ${id}: ${valor}`) });
      else nuevas.push(`  ${id}: ${valor}`);
    }
    if (nuevas.length) reemplazos.push({ desde: ultima + 1, hasta: ultima + 1, texto: nuevas.join('\n') });
    reemplazos.sort((a, b) => b.desde - a.desde);
    for (const r of reemplazos) lineas.splice(r.desde, r.hasta - r.desde, ...r.texto.split('\n'));
  }
  const t = lineas.join('\n');
  return bom + (crlf ? t.replace(/\n/g, '\r\n') : t);
}

// ---------------------------------------------------------------- (2)-(5) el plan

const esTextoConZona = (rel) => /\.md$/i.test(rel);
// La huella de un archivo: para los textos, sin lo de adentro de su zona propia (hashPieza); para lo demás, ficha.hash (LF).
const huella = (rel, t) => (esTextoConZona(rel) ? Z.hashPieza(t) : F.hash(t));
const iguales = (rel, a, b) => huella(rel, a) === huella(rel, b);

function hoy() {
  const d = new Date();
  const z = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

// planear(carpeta, {kit, moldeViejo, fecha}) → { lineas, ops: Map(ruta → texto | null), ... }. No escribe en <carpeta>.
// Materializa los moldes en un temporal: quien llama lo borra (M.borrar(plan.tmp)).
function planear(carpeta, opciones) {
  const { textoFicha, ficha } = revisarCarpeta(carpeta);
  const datos = ficha.datos;
  const vNuevo = versionDelKit(opciones.kit);
  const vViejo = datos.kit;
  const vars = esMapa(datos.vars) ? datos.vars : {};
  const fecha = opciones.fecha || hoy();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-aplicar-'));
  const plan = { tmp, lineas: [], ops: new Map(), vViejo, vNuevo };
  try {
    const nuevo = M.materializarNuevo(opciones.kit, { vars, fecha }, path.join(tmp, 'nuevo'));
    let viejo;
    if (opciones.moldeViejo) viejo = M.materializarDir(opciones.moldeViejo, { vars, fecha }, path.join(tmp, 'viejo'));
    else if (vViejo === vNuevo) viejo = nuevo;
    else {
      const falta = faltaTagViejo(opciones.kit, vViejo);
      if (falta) throw new Negativa(falta);
      try {
        viejo = M.materializarViejo(opciones.kit, vViejo, { vars, fecha }, path.join(tmp, 'viejo'));
      } catch (e) {
        throw new Negativa(e.message);
      }
    }
    plan.moldeNuevo = nuevo.dir;
    plan.moldeViejo = viejo.dir;
    armar(plan, carpeta, { textoFicha, datos, nuevo, viejo });
    return plan;
  } catch (e) {
    M.borrar(tmp);
    throw e;
  }
}

function armar(plan, carpeta, { textoFicha, datos, nuevo, viejo }) {
  const aN = M.archivosDe(nuevo.dir);
  const aV = viejo === nuevo ? aN : M.archivosDe(viejo.dir);
  let repN, repV;
  try {
    repN = C.repartir(nuevo.forma, C.rutasDeMolde(nuevo.dir));
    repV = C.repartir(viejo.forma, C.rutasDeMolde(viejo.dir));
  } catch (e) {
    throw new Negativa(`el catálogo no cubre el molde: ${e.message}`);
  }
  const piezas = esMapa(datos.piezas) ? datos.piezas : {};
  const leerP = (rel) => {
    if (plan.ops.has(rel)) return plan.ops.get(rel);
    const p = path.join(carpeta, ...rel.split('/'));
    return fs.existsSync(p) && fs.statSync(p).isFile() ? fs.readFileSync(p, 'utf8') : null;
  };
  const escribir = (rel, texto) => plan.ops.set(rel, texto);
  const borrar = (rel) => plan.ops.set(rel, null);
  const cambiosFicha = new Map();
  const tocadas = [];
  const linea = (id, estado, que) => plan.lineas.push(`${id} · ${estado} · ${que}`);

  const ids = [...repN.keys(), ...[...repV.keys()].filter((k) => !repN.has(k)), ...Object.keys(piezas).filter((k) => !repN.has(k) && !repV.has(k))];
  for (const id of ids) {
    const pN = repN.get(id);
    const pV = repV.get(id);
    const def = (pN || pV || {}).pieza;
    const enFicha = Object.prototype.hasOwnProperty.call(piezas, id);
    const actual = enFicha ? estadoDe(piezas[id]) : undefined;
    if (!def) {
      linea(id, actual, 'sin cambios'); // una pieza de la ficha que ningún catálogo conoce: es del proyecto
      continue;
    }
    if (['nunca', 'no-viaja', 'snippet'].includes(def.trato)) continue;
    const archivosN = pN ? pN.archivos : [];
    const archivosV = pV ? pV.archivos : [];

    // docs: solo el nacimiento (r1-2) — crea lo que falta; nunca reemplaza, nunca baja, nunca desvío
    if (def.trato === 'nacimiento') {
      let nacidos = 0;
      for (const a of archivosN) {
        if (leerP(a.proyecto) === null) {
          escribir(a.proyecto, aN.get(a.molde));
          nacidos++;
        }
      }
      if (!enFicha) cambiosFicha.set(id, 'molde');
      if (nacidos) tocadas.push(id);
      linea(id, enFicha ? actual : 'molde', nacidos ? 'nueva' : 'sin cambios');
      continue;
    }

    // pieza nueva del catálogo: base → la trae como molde; opcional → la anota no
    if (!enFicha && pN && def.clase === C.OPCIONAL) {
      cambiosFicha.set(id, 'no');
      linea(id, 'no', 'nueva');
      continue;
    }
    const estado = enFicha ? actual : def.clase === C.BASE ? 'molde' : 'no';
    if (estado === 'no' && def.clase === C.OPCIONAL) {
      linea(id, estado, 'sin cambios');
      continue;
    }
    if (estado === 'propia') {
      const cambio = [...new Set([...archivosN, ...archivosV].map((a) => a.molde))].some((m) => aN.get(m) !== aV.get(m));
      linea(id, estado, cambio ? 'propia (el molde cambió su contrato: mirá el diff del molde)' : 'propia');
      continue;
    }
    if (estado === 'adaptada' || estado === ADAPTADA) {
      linea(id, estado, 'adaptada: no fusiona (la fusión de una adaptada llega con D6.2)');
      continue;
    }

    // settings: regla por regla (mezclarSettings), sin guardia de archivo
    if (def.forma === 'settings') {
      const rel = archivosN.length ? archivosN[0].proyecto : RUTA_SETTINGS;
      const textoN = archivosN.length ? aN.get(archivosN[0].molde) : null;
      if (textoN == null) {
        linea(id, estado, 'sin cambios');
        continue;
      }
      const textoV = archivosV.length ? aV.get(archivosV[0].molde) : null;
      const proyecto = leerP(rel);
      const quitados = esMapa(datos.frenos) && Array.isArray(datos.frenos.quitados) ? datos.frenos.quitados : [];
      const r = Z.mezclarSettings({ viejo: textoV, nuevo: textoN, proyecto, quitados });
      if (!r.ok) throw new Negativa(`${rel}: ${r.problema} — no escribí nada`);
      const cambia = proyecto === null || lf(proyecto) !== r.texto;
      if (cambia) {
        escribir(rel, r.texto);
        tocadas.push(id);
      }
      const nuevoEstado = estado === 'molde' ? 'molde+propio' : estado;
      const h = Z.hashPieza(Z.textoSettings(JSON.parse(textoN)));
      if (nuevoEstado !== actual || hashDe(piezas[id]) !== h) cambiosFicha.set(id, valorPieza(nuevoEstado, h));
      linea(id, nuevoEstado, cambia ? 'mezclada (zona intacta)' : 'sin cambios');
      continue;
    }

    const mapN = new Map(archivosN.map((a) => [a.proyecto, aN.get(a.molde)]));
    const mapV = new Map(archivosV.map((a) => [a.proyecto, aV.get(a.molde)]));
    const hFicha = enFicha ? hashDe(piezas[id]) : undefined;
    // el guardia (D6-7): igual al viejo fuera de la zona, o el hash de la ficha (solo si la pieza vieja es un archivo), o ya el nuevo
    const intacto = (rel, t) => {
      if (mapN.has(rel) && iguales(rel, t, mapN.get(rel))) return true;
      if (mapV.has(rel) && iguales(rel, t, mapV.get(rel))) return true;
      return !!hFicha && archivosV.length === 1 && archivosV[0].proyecto === rel && huella(rel, t) === hFicha;
    };

    // una pieza que el molde nuevo ya no trae: sus archivos son bajas sueltas
    if (!pN || !archivosN.length) {
      const retiradas = [];
      const dejadas = [];
      for (const a of archivosV) {
        const t = leerP(a.proyecto);
        if (t === null) continue;
        if (intacto(a.proyecto, t)) {
          borrar(a.proyecto);
          retiradas.push(a.proyecto);
        } else dejadas.push(a.proyecto);
      }
      let que = 'sin cambios';
      if (retiradas.length && dejadas.length) que = `retirada · dejada (editada): ${dejadas.join(', ')}`;
      else if (retiradas.length) que = 'retirada';
      else if (dejadas.length) que = `dejada (editada): ${dejadas.join(', ')}`;
      let nuevoEstado = estado;
      if (retiradas.length && !dejadas.length && enFicha && estado !== 'no') {
        nuevoEstado = 'no';
        cambiosFicha.set(id, 'no');
      }
      if (retiradas.length) tocadas.push(id);
      linea(id, nuevoEstado, que);
      continue;
    }

    // el guardia sobre la pieza entera: uno solo que no está intacto y no se toca nada
    const desvios = [];
    for (const a of archivosV) {
      const t = leerP(a.proyecto);
      if (t === null) {
        if (mapN.has(a.proyecto)) desvios.push(`${a.proyecto} (falta)`);
        continue;
      }
      if (!intacto(a.proyecto, t)) desvios.push(a.proyecto);
    }
    for (const a of archivosN) {
      if (mapV.has(a.proyecto)) continue;
      const t = leerP(a.proyecto);
      if (t !== null && !iguales(a.proyecto, t, mapN.get(a.proyecto))) desvios.push(`${a.proyecto} (la ruta ya está ocupada)`); // r1-3
    }
    const destinos = new Map();
    let mezclo = false;
    if (!desvios.length) {
      for (const a of archivosN) {
        const t = leerP(a.proyecto);
        let destino = mapN.get(a.proyecto);
        if (t !== null && esTextoConZona(a.proyecto)) {
          const zp = Z.zonas(t);
          if (zp.ok && zp.zonas.length) {
            const m = Z.mezclarTexto(destino, t);
            if (!m.ok) {
              desvios.push(`${a.proyecto} (${m.problema})`);
              continue;
            }
            destino = m.texto;
            if (zp.zonas.some((z) => z.contenido !== '')) mezclo = true;
          }
        }
        destinos.set(a.proyecto, { antes: t, destino });
      }
    }
    if (desvios.length) {
      cambiosFicha.set(id, valorPieza(ADAPTADA, hFicha));
      linea(id, ADAPTADA, `desvío: no se tocó (${desvios[0]}${desvios.length > 1 ? ` y ${desvios.length - 1} más` : ''})`);
      continue;
    }
    let escritos = 0;
    let nacidos = 0;
    for (const [rel, { antes, destino }] of destinos) {
      if (antes !== null && lf(antes) === destino) continue;
      escribir(rel, destino);
      if (antes === null) nacidos++;
      else escritos++;
    }
    const bajas = archivosV.filter((a) => !mapN.has(a.proyecto) && leerP(a.proyecto) !== null);
    for (const a of bajas) borrar(a.proyecto); // intactas: el guardia ya las miró arriba
    // el estado y el hash nuevos
    let nuevoEstado = estado;
    const unico = archivosN.length === 1 ? archivosN[0] : null;
    if (estado === 'molde' && unico && esTextoConZona(unico.proyecto) && (Z.zonas(mapN.get(unico.proyecto)).zonas || []).length) nuevoEstado = 'molde+propio';
    const h = unico && estado !== 'sí' && estado !== 'no' ? huella(unico.proyecto, mapN.get(unico.proyecto)) : undefined;
    if (!enFicha || nuevoEstado !== actual || hFicha !== h) {
      if (enFicha || nuevoEstado !== 'no') cambiosFicha.set(id, valorPieza(nuevoEstado, h));
    }
    let que = 'sin cambios';
    if (escritos || nacidos || bajas.length) {
      tocadas.push(id);
      if (!enFicha) que = 'nueva';
      else if (mezclo) que = 'mezclada (zona intacta)';
      else if (escritos || nacidos) que = 'reemplazada';
      else que = 'retirada';
    }
    linea(id, nuevoEstado, que);
  }

  // (5) los .snippet: lo que falta, renglón por renglón, sin duplicar
  for (const [snip, destino] of SNIPPETS) {
    if (!aN.has(snip)) continue;
    let actual = leerP(destino);
    actual = actual === null ? '' : lf(actual);
    const ya = new Set(actual.split('\n').map((l) => l.trim()));
    const faltan = aN.get(snip).split('\n').filter((l) => l.trim() !== '' && !ya.has(l.trim()));
    if (faltan.length) {
      escribir(destino, (actual && !actual.endsWith('\n') ? `${actual}\n` : actual) + faltan.join('\n') + '\n');
      plan.lineas.push(`${destino} · snippet · ${faltan.length} renglón(es) sumado(s)`);
    } else plan.lineas.push(`${destino} · snippet · sin cambios`);
  }

  // (7) la ficha y el CHANGELOG
  const cambiaVersion = plan.vViejo !== plan.vNuevo;
  if (cambiaVersion || cambiosFicha.size) {
    const nueva = reescribirFicha(textoFicha, cambiaVersion ? plan.vNuevo : null, cambiosFicha);
    try {
      F.leer(nueva);
    } catch (e) {
      throw new Error(`la ficha reescrita no se lee: ${e.message}`);
    }
    plan.fichaNueva = nueva;
    plan.lineas.push(`ficha · kit ${plan.vViejo}${cambiaVersion ? ` → ${plan.vNuevo}` : ''} · ${cambiosFicha.size} pieza(s) anotada(s)`);
  } else plan.lineas.push(`ficha · kit ${plan.vViejo} · sin cambios`);
  if (cambiaVersion || tocadas.length) {
    const renglon = `kit ${plan.vViejo} → ${plan.vNuevo}: piezas ${tocadas.length ? tocadas.join(', ') : '(ninguna)'}`;
    let t = leerP(RUTA_CHANGELOG);
    t = t === null ? '' : lf(t);
    const ls = t.split('\n');
    const i = ls.findIndex((l) => /^## /.test(l));
    if (i < 0) t = t ? `${t.replace(/\n*$/, '')}\n\n${renglon}\n` : `${renglon}\n`;
    else t = [...ls.slice(0, i), renglon, '', ...ls.slice(i)].join('\n');
    escribir(RUTA_CHANGELOG, t);
    plan.lineas.push(`${RUTA_CHANGELOG} · un renglón · ${renglon}`);
  }
  if (plan.fichaNueva) plan.ops.set(RUTA_FICHA, plan.fichaNueva); // la ficha, la última
}

// ---------------------------------------------------------------- (8) la escritura atómica

const FS_REAL = { writeFileSync: fs.writeFileSync, renameSync: fs.renameSync, unlinkSync: fs.unlinkSync, mkdirSync: fs.mkdirSync, chmodSync: fs.chmodSync };

function renombrar(io, de, a) {
  for (let i = 0; ; i++) {
    try {
      return io.renameSync(de, a);
    } catch (e) {
      if (i >= 3 || !['EPERM', 'EBUSY', 'EACCES'].includes(e.code)) throw e; // 3 reintentos (Windows: el antivirus o un editor)
      const hasta = Date.now() + 50 * (i + 1);
      while (Date.now() < hasta) { /* espera corta y sin dormir el proceso con una dependencia */ }
    }
  }
}

function ejecutar(carpeta, ops, io = FS_REAL) {
  let n = 0;
  for (const [rel, texto] of ops) {
    const destino = path.join(carpeta, ...rel.split('/'));
    if (texto === null) {
      io.unlinkSync(destino);
      continue;
    }
    io.mkdirSync(path.dirname(destino), { recursive: true });
    const tmp = path.join(path.dirname(destino), `.${path.basename(destino)}.kit-tmp-${process.pid}-${n++}`);
    try {
      io.writeFileSync(tmp, texto);
      renombrar(io, tmp, destino);
    } catch (e) {
      try { fs.rmSync(tmp, { force: true }); } catch { /* el temporal, si quedó */ }
      e.ruta = rel;
      throw e;
    }
    if (/^\.githooks\/[^/.]+$/.test(rel)) {
      try { io.chmodSync(destino, 0o755); } catch { /* en Windows el modo no cuenta: el +x del índice lo pone flota */ }
    }
  }
}

// aplicar(carpeta, {kit, moldeViejo, plan, fecha, io}) → { codigo, lineas }
function aplicar(carpeta, opciones) {
  let plan;
  try {
    plan = planear(path.resolve(carpeta), opciones);
  } catch (e) {
    if (e instanceof Negativa) return { codigo: 1, lineas: [`aplicar: ${e.message}`] };
    throw e;
  }
  try {
    const lineas = [...plan.lineas];
    if (opciones.plan) {
      lineas.push(`plan: ${plan.ops.size} archivo(s) para escribir o borrar — no escribí nada (--plan)`);
      return { codigo: 0, lineas };
    }
    try {
      ejecutar(path.resolve(carpeta), plan.ops, opciones.io);
    } catch (e) {
      return { codigo: 1, lineas: [...lineas, `aplicar: no pude escribir ${e.ruta || '?'} (${e.code || e.message}) — cada archivo quedó entero, el viejo o el nuevo; la ficha no cambió. Es el clon del actualizador: \`git checkout -- . && git clean -fd\` (deja .kit-rol, que está en .git/info/exclude) y corré de nuevo`] };
    }
    return { codigo: 0, lineas };
  } finally {
    M.borrar(plan.tmp);
  }
}

// ---------------------------------------------------------------- chequear (lo hace lib/chequeo.cjs, de E4)

async function chequear(carpeta, opciones) {
  const raiz = path.resolve(carpeta);
  let chequeo;
  try {
    chequeo = require(path.join(__dirname, 'lib', 'chequeo.cjs'));
  } catch (e) {
    return { codigo: 1, lineas: [`${ROTO} (no está lib/chequeo.cjs: ${e.code || e.message})`, 'NO VERIFICADO'] };
  }
  if (!chequeo || typeof chequeo.chequear !== 'function') return { codigo: 1, lineas: [`${ROTO} (lib/chequeo.cjs no exporta chequear)`, 'NO VERIFICADO'] };
  const rf = path.join(raiz, ...RUTA_FICHA.split('/'));
  let datos;
  try {
    datos = F.leer(fs.readFileSync(rf, 'utf8')).datos;
  } catch (e) {
    return { codigo: 1, lineas: [`chequear: la ficha no se lee (${e.message})`, 'NO VERIFICADO'] };
  }
  const enBase = gitEn(raiz, ['show', `${opciones.base}:${RUTA_FICHA}`]);
  if (!enBase.ok) return { codigo: 1, lineas: [`chequear: no leo la ficha en ${opciones.base} (${enBase.err.trim()})`, 'NO VERIFICADO'] };
  let vBase;
  try {
    vBase = F.leer(enBase.out).datos.kit;
  } catch (e) {
    return { codigo: 1, lineas: [`chequear: la ficha de ${opciones.base} no se lee (${e.message})`, 'NO VERIFICADO'] };
  }
  const vars = esMapa(datos.vars) ? datos.vars : {};
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-chequear-'));
  try {
    let vNuevo;
    try {
      vNuevo = versionDelKit(opciones.kit);
    } catch (e) {
      return { codigo: 1, lineas: [`chequear: ${e.message}`, 'NO VERIFICADO'] };
    }
    if (!opciones.moldeViejo && vBase !== vNuevo) {
      const falta = faltaTagViejo(opciones.kit, vBase);
      if (falta) return { codigo: 1, lineas: [`chequear: ${falta}`, 'NO VERIFICADO'] };
    }
    const fecha = opciones.fecha || hoy();
    const nuevo = M.materializarNuevo(opciones.kit, { vars, fecha }, path.join(tmp, 'nuevo'));
    const viejo = opciones.moldeViejo
      ? M.materializarDir(opciones.moldeViejo, { vars, fecha }, path.join(tmp, 'viejo'))
      : vBase === vNuevo ? nuevo : M.materializarViejo(opciones.kit, vBase, { vars, fecha }, path.join(tmp, 'viejo'));
    const r = await chequeo.chequear(raiz, { moldeNuevo: nuevo.dir, moldeViejo: viejo.dir, base: opciones.base, plazoMs: opciones.plazoMs, version: vNuevo });
    const lineas = Array.isArray(r.lineas) ? r.lineas.map(String) : String(r.lineas || '').split('\n').filter(Boolean);
    return { codigo: r.ok ? 0 : 1, lineas };
  } finally {
    M.borrar(tmp);
  }
}

// ---------------------------------------------------------------- línea de comandos

function leerArgs(argv) {
  const [sub, ...resto] = argv;
  if (sub !== 'aplicar' && sub !== 'chequear') return null;
  const o = { sub, plan: false };
  const conValor = { '--kit': 'kit', '--molde-viejo': 'moldeViejo', '--base': 'base', '--plazo': 'plazo', '--fecha': 'fecha' };
  for (let i = 0; i < resto.length; i++) {
    const a = resto[i];
    if (a === '--plan' && sub === 'aplicar') o.plan = true;
    else if (Object.prototype.hasOwnProperty.call(conValor, a)) {
      if (i + 1 >= resto.length || !resto[i + 1]) return null;
      o[conValor[a]] = resto[++i];
    } else if (!a.startsWith('--') && o.carpeta === undefined) o.carpeta = a;
    else return null;
  }
  if (!o.carpeta || !o.kit) return null;
  if (sub === 'chequear') {
    if (!o.base) return null;
    if (o.plazo !== undefined && !(Number(o.plazo) > 0)) return null;
  } else if (o.base !== undefined || o.plazo !== undefined) return null;
  if (o.fecha !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(o.fecha)) return null;
  return o;
}

async function main(argv) {
  const o = leerArgs(argv);
  if (!o) return { codigo: 2, lineas: [USO] };
  const kit = path.resolve(o.kit);
  const moldeViejo = o.moldeViejo ? path.resolve(o.moldeViejo) : undefined;
  if (o.sub === 'aplicar') return aplicar(o.carpeta, { kit, moldeViejo, plan: o.plan, fecha: o.fecha });
  return chequear(o.carpeta, { kit, moldeViejo, base: o.base, fecha: o.fecha, plazoMs: Math.round(Number(o.plazo || 30) * 60000) });
}

if (require.main === module) {
  main(process.argv.slice(2))
    .then(({ codigo, lineas }) => {
      const t = lineas.join('\n') + '\n';
      if (codigo === 2) process.stderr.write(t);
      else process.stdout.write(t);
      process.exitCode = codigo;
    })
    .catch((e) => {
      const sub = process.argv[2];
      process.stdout.write(`${ROTO} (${e && e.message ? e.message : e})\n${sub === 'chequear' ? 'NO VERIFICADO\n' : ''}`);
      process.exitCode = 1;
    });
}

module.exports = { aplicar, planear, chequear, main, reescribirFicha, ejecutar, Negativa, USO };
