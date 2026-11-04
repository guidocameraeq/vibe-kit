#!/usr/bin/env node
'use strict';
// actualizar.cjs — el actualizador del kit, el núcleo (SPEC-paquete-6 P7.1, D6.1; E §4-§6; D6-1, D6-5, D6-7, D6-15; r1-2..r1-5).
// Un script de node determinista: nadie lo corre en bypass. El único agente es el de la fusión de una pieza adaptada con
// conflictos (lib/fusion.cjs, D6-19: un `claude -p` en acceptEdits con herramientas estrechas, en el clon, que solo ARMA la
// propuesta: la mezcla que choca nunca se resuelve sola, SPEC-paquete-8r §3). La flota (clon, rama,
// mezcla, push; D6.2) vive en lib/flota.cjs y el adoptador (P7.2, D6-12) en lib/adoptar.cjs: acá solo se despacha
// (`flota`/`adoptar` → su main; uso → este USO).
const USO = [
  'uso: node actualizar.cjs aplicar  <carpeta> --kit <raíz del kit> [--molde-viejo <dir>] [--plan] [--fecha <AAAA-MM-DD>]',
  '                                   [--claude <exe> | --claude no]',
  '     node actualizar.cjs chequear <carpeta> --kit <raíz del kit> --base <sha> [--molde-viejo <dir>] [--plazo <min>]',
  '     node actualizar.cjs flota <repo>… | todo --canon <url o dir del canónico> [--tag <vX.Y.Z[-rc.N]>] [--proyectos <carpeta>]',
  '                               [--plazo <min>] [--fecha <AAAA-MM-DD>] [--molde-viejo <dir>] [--claude <exe> | --claude no]',
  '     node actualizar.cjs adoptar <carpeta> --kit <raíz del kit> --mirar [--nivel liviano|estandar] [--propuesta <archivo>] [--nuevo]',
  '                               [--comando-test "<comando>"] [--principal <carpeta principal>]',
  '     node actualizar.cjs adoptar <carpeta> --kit <raíz del kit> --aplicar <archivo de propuesta> [--fecha <AAAA-MM-DD>]',
  '                               [--principal <carpeta principal>] [--claude-md] [--director kit] [--permisos recomendada] [--arranque kit]',
  '     node actualizar.cjs adoptar <clon> --traer <carpeta principal>',
  '     node actualizar.cjs resolver <carpeta> <pieza> mezclar|quedarse|nueva|congelar --por "<texto>" [--a-mano]',
  '     node actualizar.cjs ultimo-tag <clon del kit>',
  '  aplicar   pone al día <carpeta> pieza por pieza según su ficha (.claude/kit.md), contra el molde del --kit. Escribe solo en',
  '            <carpeta>; no commitea, no pushea, no pone core.hooksPath (eso es de flota). Se niega (1) si <carpeta> no es un repo',
  '            con ficha que se lee, si no está limpia (salvo .kit-rol) o si .kit-rol no dice actualizador.',
  '  chequear  las nueve líneas del chequeo mecánico sobre lo aplicado y ya commiteado (<base>..HEAD); lo hace lib/chequeo.cjs.',
  '  flota     pone al día cada <repo> (una carpeta de --proyectos o la ruta de un checkout; todo = los de --proyectos con ficha u origin),',
  '            uno detrás del otro, en un clon temporal de su origin (tu checkout nunca se toca): saltea los que tienen modulo/*',
  '            vivas sin mezclar, kit/<tag> ya subida (salvo ROTA: se rehace) o la ficha al día (la versión entera, también con -rc); rama kit/<tag>, aplicar, commit,',
  '            chequear; verde → un commit a la rama por defecto; rojo → kit/<tag> ROTA; protegida → kit/<tag> te espera.',
  '            Al final, la tabla y "te espera:". Lo hace lib/flota.cjs.',
  '  adoptar   un proyecto sin ficha pasa al kit (P7.2; lo hace lib/adoptar.cjs). --mirar no cambia nada: imprime la propuesta (una',
  '            ficha con lo que vio arriba, en comentarios) y con --propuesta la escribe ahí, fuera de <carpeta>. --aplicar escribe la',
  '            ficha y trae las piezas en molde; se niega (1) como aplicar (sucia salvo .kit-rol, .kit-rol ≠ actualizador) o si ya',
  '            tiene ficha. No commitea: dice los dos commits que van y, al final, el --traer. --traer (después del push): la',
  '            carpeta principal avanza con merge --ff-only (limpia, en la rama del clon, con su HEAD ya en origin) y prende ahí',
  '            los githooks; si no puede, una línea con qué correr y no toca nada.',
  '  resolver  la salida que eligió el dueño para una pieza que espera (.claude/fusiones/<pieza>.md), en SU checkout (rol humano):',
  '            mezclar (la fusión propuesta) · quedarse (con la tuya: sigue adaptada; la próxima versión se ofrece desde la misma',
  '            base; `propia` es su nombre viejo y hace lo mismo) · nueva (la del kit entera: pasa a molde) · congelar (la ficha',
  '            la pone en propia; no en una pieza de frenos). Escribe lo del informe, la ficha (estado y por:) y borra el informe;',
  '            no commitea: la última línea dice el commit. mezclar y nueva se niegan (1) sin escribir si algo de la pieza cambió',
  '            desde el informe (quedarse y congelar pueden igual). --a-mano (con mezclar):',
  '            lo que cambió lo armaste vos y se valida del disco; lo que sigue igual va con lo del informe.',
  '  ultimo-tag imprime el tag v* anotado que va (el de la flota sin --tag: v3.0.0 después de v3.0.0-rc.N); sin ninguno → 1.',
  '  --nuevo        (con --mirar) un repo recién nacido: las bases van en molde, el candado va (sí) y el director-obrero y el estado también.',
  '  --comando-test (con --mirar) vars.comando-test de la propuesta (el Entorno de prueba del SPEC-0); le gana al de los manifiestos.',
  '  --principal    (con --aplicar) la carpeta principal: ahí se prende core.hooksPath (los githooks del molde).',
  '  --claude-md    (con --aplicar) suma al final del CLAUDE.md la sección "El tamaño del pedido" del molde, en el commit de las piezas',
  '                 (si ya está, no toca nada); sin la bandera, el CLAUDE.md que hay no se toca.',
  '  --director kit (con --aplicar; D1: A) el director, /inicio y /cierre del kit reemplazan los tuyos distintos (director-obrero,',
  '                 estado, inicio, cierre; nada más); lo tuyo queda en la historia. Sin ella, lo distinto queda propia.',
  '  --permisos recomendada (con --aplicar; D2) las allow que la mezcla sacaba se quedan y salen los ask que frenan al director.',
  '  --arranque kit (con --aplicar; D3) el SessionStart propio sale del settings (su archivo queda). D2 y D3 van en un tercer',
  '                 commit, aparte; la línea "después:" dice el camino si da rojo. Sin ellas, el settings sale como siempre.',
  '  --nivel        el nivel de la propuesta (sin él: con código → estandar, sin código → liviano).',
  '  --canon        el repo canónico del kit (URL o carpeta): se clona con sus tags.',
  '  --tag          el tag anotado a repartir (sin él, el último v* anotado); su versión sin la v = kit/VERSION entero, o 1.',
  '  --proyectos    la carpeta de proyectos (para nombrar un repo por su carpeta, y para todo).',
  '  --kit          la raíz de un clon del kit: el molde nuevo es su kit/molde/ y la versión nueva su kit/VERSION.',
  '  --molde-viejo  el molde del que viene el proyecto (sin él: git archive v<kit de la ficha> del --kit; con la misma',
  '                 versión, el mismo molde nuevo). Acepta la raíz de un kit, kit/molde/ o templates/universales/.',
  '  --plan         lo mismo, sin escribir nada (y sin lanzar claude).',
  '  --claude       el claude que arma la propuesta de una adaptada cuya mezcla chocó (sin la bandera: claude del PATH, si está;',
  '                 no = sin él). Con o sin él, la que chocó nunca se aplica sola: va a "te espera" del proyecto',
  '                 (.claude/fusiones/<pieza>.md, "la mezcla chocó…"), con la propuesta de claude si la armó.',
  '  --fecha        la fecha de los docs que nacen ({{YYYY-MM-DD}}); sin ella, hoy (las pruebas la fijan).',
  '  --plazo        minutos para el comando de pruebas del proyecto en chequear (30 por defecto; en flota, el de cada repo).',
  'Salidas: 0 bien · 1 se negó, algo falló o un ❌ (flota: algún repo ROTA o con error propio) · 2 uso.',
  'Error propio: "actualizador roto: corré doctor".',
].join('\n');
//
// aplicar, en orden (SPEC-paquete-6, P7.1): (1) se niega si no corresponde; (2) por pieza, según la ficha, con el GUARDIA (D6-7):
// un archivo de una pieza molde o molde+propio está intacto si, fuera de su zona propia, es igual al del molde viejo (LF), o su
// huella coincide con el hash de la ficha, o ya es el del molde nuevo. Intacto → se reemplaza (o mezclarTexto: la zona queda
// byte a byte). Uno solo no intacto → la pieza entera no se toca y pasa a "adaptada (desvío detectado)". Pieza nueva con la
// ruta ocupada y distinta → desvío (r1-3). adaptada, y la que el guardia acaba de ver en desvío → la FUSIÓN (lib/fusion.cjs,
// D6-19): sola con porqué y sin choque, o "te espera" (.claude/fusiones/<pieza>.md; la que chocó, siempre). propia → no se toca.
// (3) Bajas: lo que el viejo traía y el nuevo no; intacto → se borra, editado → se deja; las de propia/adaptada no se borran.
// (4) settings por mezclarSettings (lo quitado no vuelve; lo retirado que el proyecto tenía igual se va: las deny Write(...)).
// (5) los .snippet renglón por renglón. (6) core.hooksPath NO (r1-5). (7) la ficha: kit y los hashes de lo reemplazado, el
// estado de lo marcado, todo lo demás byte a byte; un renglón al tope de docs/CHANGELOG.md. Nunca CLAUDE.md ni otro de docs/
// (docs solo nace: crea lo que falta; r1-2). (8) todo el plan antes de escribir; cada archivo temporal + renombre.
// (6bis, antes de la ficha; SPEC-paquete-7 P6.8b-1) el cierre del ciclo: cada cambio aplicado del proyecto que kit/cubiertos.md
// del --kit nombra (por id o por cita, nunca por texto) y cuyo verificar da verde pasa a subio-al-kit, y su zona propia se retira
// solo con las cinco condiciones de D7-7 (si no, la línea dice por qué queda). Con opciones.rc (lo pasa flota con un tag -rc):
// solo "subiría al kit". Es parte del plan: --plan lo muestra sin escribir.
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
const FU = require('./lib/fusion.cjs');
const CA = require('../pc/lib/cambios.cjs');
const CU = require('./lib/cubiertos.cjs');

const ROTO = 'actualizador roto: corré doctor';
const RUTA_FICHA = '.claude/kit.md';
const RUTA_SETTINGS = '.claude/settings.json';
const RUTA_CHANGELOG = 'docs/CHANGELOG.md';
const KIT_ROL = '.kit-rol';
const RE_VERSION = F.RE_VERSION; // N.N.N o N.N.N-rc.N: una sola gramática, la de la ficha (D8b-3)
const SNIPPETS = [['gitignore.snippet', '.gitignore'], ['gitattributes.snippet', '.gitattributes']];
const ADAPTADA = 'adaptada (desvío detectado)';
const RUTA_CUBIERTOS = CU.RUTA; // en la raíz del --kit (D7-2); el lector es lib/cubiertos.cjs, el mismo de flota y cambios-flota
// Lo que cuenta como "la pieza se reemplazó o se mezcló en esta corrida" (P6.8b-1, condición c).
const LLEGARON = ['reemplazada', 'mezclada (zona intacta)'];

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

// fichaDada: la ficha que propone el adoptador (lib/adoptar.cjs), que todavía no está en el disco (y no tiene que estar).
function revisarCarpeta(carpeta, fichaDada) {
  if (!fs.existsSync(carpeta) || !fs.statSync(carpeta).isDirectory()) throw new Negativa(`${carpeta} no es una carpeta`);
  const top = gitEn(carpeta, ['rev-parse', '--show-toplevel']);
  if (!top.ok || !mismaRuta(top.out.trim(), carpeta)) throw new Negativa(`${carpeta} no es la raíz de un repo git — no toco nada`);
  const rf = path.join(carpeta, ...RUTA_FICHA.split('/'));
  if (fichaDada !== undefined && fs.existsSync(rf)) throw new Negativa(`${carpeta} ya tiene ficha — eso es actualizarlo: flota`);
  if (fichaDada === undefined && !fs.existsSync(rf)) throw new Negativa(`${carpeta} no tiene ficha (${RUTA_FICHA}) — eso es del adoptador, no del actualizador`);
  const textoFicha = fichaDada !== undefined ? fichaDada : fs.readFileSync(rf, 'utf8');
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

// D8b-3 (cambia D6-15): la versión nueva = kit/VERSION = el tag sin la v, ENTERO; si el --kit está parado en un tag v*, tiene que decir lo mismo.
function versionDelKit(kit) {
  const rv = path.join(kit, 'kit', 'VERSION');
  if (!fs.existsSync(rv)) throw new Negativa(`${kit} no es la raíz de un kit (falta kit/VERSION)`);
  const v = fs.readFileSync(rv, 'utf8').trim();
  if (!RE_VERSION.test(v)) throw new Negativa(`kit/VERSION dice "${v}": no es N.N.N ni N.N.N-rc.N`);
  const t = gitEn(kit, ['tag', '--points-at', 'HEAD']);
  if (t.ok) {
    for (const tag of t.out.split(/\r?\n/).map((x) => x.trim()).filter((x) => /^v\d/.test(x))) {
      const delTag = tag.slice(1);
      if (delTag !== v) throw new Negativa(`el --kit está en el tag ${tag} pero kit/VERSION dice ${v}: no coinciden (D6-15)`);
    }
  }
  return v;
}

// La nota de migración del kit (paquete 8b, (6)): las secciones "## N.N.N[-rc.N]" de kit/CHANGELOG.md del --kit con versión > viejo
// y ≤ nuevo, la más nueva arriba como están. → el texto o null (sin archivo, sin sección o un viejo que no es versión). La lee la
// fusión para el informe; una sección con un título que no es versión no cuenta.
function notaDelKit(kit, viejo, nuevo) {
  let t;
  try {
    t = lf(fs.readFileSync(path.join(kit, 'kit', 'CHANGELOG.md'), 'utf8'));
  } catch {
    return null;
  }
  if (!RE_VERSION.test(String(viejo)) || !RE_VERSION.test(String(nuevo))) return null;
  const out = [];
  let dentro = false;
  for (const l of t.split('\n')) {
    const m = /^## (\S+)\s*$/.exec(l);
    if (m || /^# /.test(l)) dentro = !!m && RE_VERSION.test(m[1]) && F.compararVersiones(m[1], viejo) > 0 && F.compararVersiones(m[1], nuevo) <= 0;
    if (dentro) out.push(l);
  }
  const s = out.join('\n').trim();
  return s ? `${s}\n` : null;
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

const porDe = (v) => (esMapa(v) && typeof v.por === 'string' ? v.por : undefined);
const desdeDe = (v) => (esMapa(v) && typeof v.desde === 'string' ? v.desde : undefined);

// El valor de una pieza en la ficha. `por` (el porqué de Guido, D6-19) viaja siempre que la pieza lo tenía. `desde` (paquete 8b,
// r1-1) solo lo escribe resolver ("quedarse" con la tuya) y se va cuando la pieza se mezcla o toma la nueva.
function valorPieza(estado, hash, por, desde) {
  const e = /[\s()]/.test(estado) ? `"${estado}"` : estado;
  const extra = [hash ? `hash: ${hash}` : '', por ? `por: "${por}"` : '', desde ? `desde: ${desde}` : ''].filter(Boolean);
  return extra.length ? `{estado: ${e}, ${extra.join(', ')}}` : e;
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

// planear(carpeta, {kit, moldeViejo, fecha, ficha}) → { lineas, ops: Map(ruta → texto | null), adopcion, ... }. No escribe en <carpeta>.
// Materializa los moldes en un temporal: quien llama lo borra (M.borrar(plan.tmp)). ficha: el texto de la ficha que propone el
// adoptador (todavía no está en el disco); sin ella, la de <carpeta>.
function planear(carpeta, opciones) {
  const { textoFicha, ficha } = revisarCarpeta(carpeta, opciones.ficha);
  const datos = ficha.datos;
  const vNuevo = versionDelKit(opciones.kit);
  const vViejo = datos.kit;
  const vars = esMapa(datos.vars) ? datos.vars : {};
  const fecha = opciones.fecha || hoy();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-aplicar-'));
  const plan = { tmp, lineas: [], ops: new Map(), vViejo, vNuevo, vars, fecha };
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
    // una adopción (la ficha la propone el adoptador, con el molde viejo que eligió): la ficha ya dice la versión del kit, así que el
    // informe de una fusión no es "kit <v> → <v>" sino ese molde contra el del kit (SPEC-paquete-8r2 t12 b)
    if (opciones.ficha && opciones.moldeViejo) plan.adopcion = viejo.forma === '2.4' ? 'el molde v2' : 'el molde que ya tenía';
    armar(plan, carpeta, { textoFicha, datos, nuevo, viejo, opciones });
    return plan;
  } catch (e) {
    M.borrar(tmp);
    throw e;
  }
}

function armar(plan, carpeta, { textoFicha, datos, nuevo, viejo, opciones = {} }) {
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
  const llegadas = new Map(); // pieza → rutas del proyecto, de las que se reemplazaron o se mezclaron ahora (para cerrarCiclo)
  const linea = (id, estado, que) => plan.lineas.push(`${id} · ${estado} · ${que}`);
  const claude = opciones.plan ? null : FU.buscarClaude(opciones.claude);
  const noFusionar = opciones.noFusionar || {};

  // La fusión de una pieza adaptada (D6-19; claude nunca aplica, solo propone: 8r §3). Fusionada → estado adaptada, el hash del molde nuevo si es de un archivo (lo que
  // escribió el molde DEBAJO de la adaptación: si alguien la vuelve a molde, el guardia no toma lo fusionado por intacto) y su
  // `por:` si lo tenía (el del git log no se copia: la ficha guarda solo el de Guido). Te espera → la pieza como estaba y su informe.
  // Un .claude/fusiones/<pieza>.md de antes (el dueño todavía no contestó): la pieza NO se fusiona sola y el informe se rehace
  // contra el molde nuevo desde la base que dice el archivo (el molde de ese tag), no desde `kit:` de la ficha (D6-19). Si el
  // --kit no tiene ese tag, el informe queda como estaba (tampoco se fusiona): nunca se rehace contra otra base.
  const bases = new Map();
  const moldeDeBase = (base) => {
    if (!bases.has(base)) {
      try {
        const m = M.materializarViejo(opciones.kit, base, { vars: plan.vars, fecha: plan.fecha }, path.join(plan.tmp, `base-${base}`));
        bases.set(base, { a: M.archivosDe(m.dir), rep: C.repartir(m.forma, C.rutasDeMolde(m.dir)) });
      } catch {
        bases.set(base, null);
      }
    }
    return bases.get(base);
  };
  // `desde:` en la pieza (resolver, "quedarse" con la tuya; r1-1): lo mismo que la base de un informe — desde esa versión y sin
  // fusionarse sola (el dueño ya dijo que no a lo de ahí en adelante; se le vuelve a ofrecer con lo nuevo encima).
  const notas = new Map();
  const notaDe = (vBase) => {
    if (!notas.has(vBase)) notas.set(vBase, notaDelKit(opciones.kit, vBase, plan.vNuevo));
    return notas.get(vBase);
  };
  const fusionarPieza = (id, actual, mapV0, mapN, hFicha, desvio) => {
    const informe = FU.rutaInforme(id);
    const previo = leerP(informe);
    const desde = desdeDe(piezas[id]);
    let mapV = mapV0;
    let vBase = plan.vViejo;
    let forzado = noFusionar[id];
    if (previo !== null || desde) {
      vBase = (previo !== null ? FU.baseDeInforme(previo) : desde) || plan.vViejo;
      if (vBase !== plan.vViejo) {
        const b = moldeDeBase(vBase);
        if (!b) {
          const ya = actual === 'adaptada' || actual === ADAPTADA;
          if (!ya) cambiosFicha.set(id, valorPieza(ADAPTADA, hFicha, porDe(piezas[id])));
          // un informe de un choque sigue diciendo "la mezcla chocó" (rt-6: el /inicio pregunta siempre por él)
          const choco = previo !== null && FU.motivoDeInforme(previo).startsWith(FU.CHOCO);
          linea(id, ya ? actual : ADAPTADA, choco
            ? `te espera: ${FU.CHOCO} (todavía espera tu respuesta desde el kit ${vBase}; el --kit no tiene el tag v${vBase}: el informe queda como estaba)`
            : previo !== null
              ? `te espera: todavía espera tu respuesta (desde el kit ${vBase}); el --kit no tiene el tag v${vBase}: el informe queda como estaba`
              : `te espera: te quedaste con la tuya (desde el kit ${vBase}); el --kit no tiene el tag v${vBase}: no la toqué`);
          return;
        }
        mapV = new Map((b.rep.has(id) ? b.rep.get(id).archivos : []).map((a) => [a.proyecto, b.a.get(a.molde)]));
      }
      // forzado: no se fusiona sola. Si además la mezcla chocó, fusion.cjs usa `corto` entre paréntesis ("la mezcla chocó (…)") y,
      // con claude, lo lanza igual para dejar la propuesta nueva (claude nunca aplica: SPEC-paquete-8r §3).
      forzado = forzado || (previo !== null
        ? { motivo: `todavía espera tu respuesta (desde el kit ${vBase}): no se fusiona sola`, corto: `todavía espera tu respuesta desde el kit ${vBase}` }
        : { motivo: `te quedaste con la tuya en el kit ${vBase}: se te vuelve a ofrecer desde ahí, no se fusiona sola`, corto: `te quedaste con la tuya en el kit ${vBase}, se te vuelve a ofrecer desde ahí` });
    }
    const rels = [...new Set([...mapV.keys(), ...mapN.keys()])];
    const r = FU.fusionar({
      carpeta, id, valorFicha: piezas[id], claude, plan: opciones.plan, forzado, nota: notaDe(vBase),
      versiones: { viejo: vBase, nuevo: plan.vNuevo, ...(plan.adopcion && vBase === plan.vViejo ? { adopcion: plan.adopcion } : {}) },
      archivos: rels.map((rel) => ({ rel, v: mapV.has(rel) ? mapV.get(rel) : null, n: mapN.has(rel) ? mapN.get(rel) : null, p: leerP(rel) })),
    });
    const por = porDe(piezas[id]);
    const yaAdaptada = actual === 'adaptada' || actual === ADAPTADA;
    if (r.resultado === 'sin cambios' || r.resultado === 'espera') {
      const est = yaAdaptada ? actual : ADAPTADA;
      if (!yaAdaptada) cambiosFicha.set(id, valorPieza(est, hFicha, por));
      if (r.resultado === 'espera') escribir(informe, r.informe);
      const visto = desvio && !yaAdaptada ? `desvío: no se tocó (${desvio})` : '';
      linea(id, est, r.resultado === 'espera' ? [FU.que(r), visto].filter(Boolean).join(' · ') : visto || 'sin cambios');
      return;
    }
    let cambia = false;
    for (const [rel, texto] of r.destinos) {
      const antes = leerP(rel);
      if (antes !== null && lf(antes) === texto) continue;
      escribir(rel, texto);
      cambia = true;
    }
    const unico = mapN.size === 1 ? [...mapN.keys()][0] : null;
    const h = unico ? huella(unico, mapN.get(unico)) : undefined;
    if (actual !== 'adaptada' || hashDe(piezas[id]) !== h) cambiosFicha.set(id, valorPieza('adaptada', h, por));
    if (cambia) tocadas.push(id);
    linea(id, 'adaptada', FU.que(r));
  };

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
    // settings: regla por regla (mezclarSettings), sin guardia de archivo — también adaptada: esa mezcla ya es a tres puntas
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
      if (nuevoEstado !== actual || hashDe(piezas[id]) !== h) cambiosFicha.set(id, valorPieza(nuevoEstado, h, porDe(piezas[id])));
      linea(id, nuevoEstado, cambia ? 'mezclada (zona intacta)' : 'sin cambios');
      continue;
    }

    const mapN = new Map(archivosN.map((a) => [a.proyecto, aN.get(a.molde)]));
    const mapV = new Map(archivosV.map((a) => [a.proyecto, aV.get(a.molde)]));
    const hFicha = enFicha ? hashDe(piezas[id]) : undefined;
    if (estado === 'adaptada' || estado === ADAPTADA) {
      fusionarPieza(id, actual, mapV, mapN, hFicha);
      continue;
    }
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
      // el guardia la vio adaptada en esta corrida: no queda vieja, va a la fusión como las declaradas (D6-19)
      fusionarPieza(id, actual, mapV, mapN, hFicha, `${desvios[0]}${desvios.length > 1 ? ` y ${desvios.length - 1} más` : ''}`);
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
    if (LLEGARON.includes(que)) llegadas.set(id, new Set(archivosN.map((a) => a.proyecto)));
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

  // (6bis) el cierre del ciclo (P6.8b-1): después de las piezas, antes de la ficha
  // el texto del molde nuevo de <archivo> si es de <pieza> (para (c): la pieza ya llegó, en esta corrida o en un -rc), si no null
  const moldeNuevoDe = (pieza, archivo) => {
    const p = repN.get(pieza);
    const a = p && p.archivos.find((x) => mismaRel(x.proyecto, archivo));
    return a && aN.has(a.molde) ? aN.get(a.molde) : null;
  };
  // las zonas de fábrica de <archivo> en el molde viejo y en el nuevo de esta corrida (E8: (d) y el retiro las miran)
  const fabricaDe = (archivo) => ({ vieja: zonasDeFabrica(repV, aV, archivo), nueva: zonasDeFabrica(repN, aN, archivo) });
  cerrarCiclo(plan, carpeta, { opciones, llegadas, moldeNuevoDe, fabricaDe, leerP, escribir });

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

// ---------------------------------------------------------------- (6bis) el cierre del ciclo: subio-al-kit (SPEC-paquete-7 P6.8b-1)


// Los contenidos de las zonas propias de <archivo> en un molde (rep: el reparto del catálogo; a: sus archivos), por orden (las
// zonas no tienen nombre, como en mezclarTexto). null si <archivo> no es de ese molde o sus marcas están rotas.
function zonasDeFabrica(rep, a, archivo) {
  for (const p of rep.values()) {
    const x = p.archivos.find((y) => mismaRel(y.proyecto, archivo));
    if (!x || !a.has(x.molde)) continue;
    const z = Z.zonas(a.get(x.molde));
    return z.ok ? z.zonas.map((q) => q.contenido) : null;
  }
  return null;
}

// Una zona para comparar con la de fábrica: LF y sin espacios al final de cada renglón.
const zonaNormal = (t) => lf(t).split('\n').map((l) => l.trimEnd()).join('\n');

// El texto con cada zona propia devuelta a como viene de fábrica en el molde nuevo (fabrica: sus contenidos, por orden; una zona
// que el molde nuevo no trae, o un archivo que no es de un molde, queda vacía). Las marcas quedan; sale con LF. Solo con zonas sanas.
function zonasAFabrica(texto, fabrica) {
  const lineas = lf(texto).split('\n');
  const z = Z.zonas(texto);
  z.zonas.forEach((x, i) => (x.i = i));
  for (const x of [...z.zonas].reverse()) {
    const f = fabrica && typeof fabrica[x.i] === 'string' && fabrica[x.i] !== '' ? fabrica[x.i].split('\n') : [];
    lineas.splice(x.desde, x.hasta - x.desde - 1, ...f); // desde/hasta: los renglones de las marcas
  }
  return lineas.join('\n');
}

// El hash de aplico (el que escribe anotar-sha --aplico): ficha.hash de todas las zonas juntas. null si no hay zonas sanas.
function hashZonas(texto) {
  const z = texto === null ? { ok: false } : Z.zonas(texto);
  return z.ok && z.zonas.length ? F.hash(z.zonas.map((x) => x.contenido).join('\n')) : null;
}

// (d), primera mitad: ¿la zona de <archivo> no tenía nada propio en <sha>^? Cada zona cuenta como sin nada propio si está vacía o
// es igual (zonaNormal) a la zona del mismo número de fábrica, en el molde viejo o en el nuevo (fabricas: listas de contenidos;
// E8: las zonas del molde real traen texto de fábrica, y sin esto (d) no se cumplía nunca en un proyecto nacido del molde). Sin
// padre (el primer commit) o sin el archivo ahí, cuenta como vacía (el cambio lo escribió entero); una marca rota ahí, no (ante la
// duda, queda).
function zonaVaciaAntes(carpeta, sha, archivo, fabricas = []) {
  const padre = gitEn(carpeta, ['rev-parse', '-q', '--verify', `${sha}^1^{commit}`]);
  if (!padre.ok) return true;
  const p = padre.out.trim();
  const ls = gitEn(carpeta, ['ls-tree', '--name-only', p, '--', archivo]);
  if (!ls.ok) return false;
  if (ls.out.trim() === '') return true;
  const antes = gitEn(carpeta, ['show', `${p}:${archivo}`]);
  if (!antes.ok) return false;
  const z = Z.zonas(antes.out);
  const deFabrica = (x, i) => fabricas.some((f) => f && typeof f[i] === 'string' && zonaNormal(f[i]) === zonaNormal(x.contenido));
  return z.ok && z.zonas.every((x, i) => x.contenido === '' || deFabrica(x, i));
}

const mismaRel = (a, b) => String(a).replace(/\\/g, '/') === String(b).replace(/\\/g, '/');

// Por qué la zona propia de un cambio que sube NO se retira (D7-7, las cinco condiciones; ante cualquier duda, queda), o null si
// se retira. c: el cambio cargado; entrada: la suya de cubiertos.md; todos: los cambios del proyecto; llegadas: pieza → rutas de
// lo que se reemplazó o se mezcló en esta corrida; moldeNuevoDe(pieza, archivo): el texto del molde nuevo de ese archivo si es de
// esa pieza (si no, null); fab: las zonas de fábrica del archivo, {vieja, nueva} (fabricaDe); texto: el archivo ya mezclado.
function porQueQueda(carpeta, { c, entrada, todos, llegadas, moldeNuevoDe, fab = {}, texto }) {
  const archivo = c.datos.aplico.archivo;
  // (a) clase 2 y (b) no es un archivo de frenos (la vara del candado, r1-9): un freno nunca se retira solo (D7-3)
  if (c.datos.clase !== '2' || CA.categoriaDe(archivo) !== null) return 'te espera (freno)';
  // (c) la regla llegó por el actualizador (r1-3), y el archivo es de esa pieza: o su pieza se reemplazó o se mezcló en esta
  // corrida, o el archivo, fuera de sus zonas propias, ya es igual al del molde nuevo — la pieza ya llegó, ahora o en un -rc de
  // esta versión (RF-fix rf-4: de un rc al final la pieza viene "sin cambios" porque la trajo el rc; sin esto, "te espera" eterno)
  const llego = llegadas.get(entrada.pieza);
  const ahora = !!llego && [...llego].some((r) => mismaRel(r, archivo));
  const molde = ahora ? null : moldeNuevoDe(entrada.pieza, archivo);
  const yaLlego = molde !== null && texto !== null && iguales(archivo, texto, molde);
  if (!ahora && !yaLlego) return 'te espera (la regla no llegó por el actualizador)';
  // (d) la zona era toda del cambio (vacía o de fábrica en <sha>^) y ningún otro cambio vivo la usa (r1-1)
  const otro = todos.some((o) => o !== c && !o.error && !['rechazado', 'subio-al-kit'].includes(o.datos.estado) && esMapa(o.datos.aplico) && mismaRel(o.datos.aplico.archivo, archivo));
  if (otro || !zonaVaciaAntes(carpeta, c.datos.sha, archivo, [fab.vieja, fab.nueva])) return 'zona compartida, queda';
  // (e) la zona, en el texto ya mezclado, es la que anotó el cambio
  if (hashZonas(texto) !== c.datos.aplico.hash) return 'zona editada, queda';
  return null;
}

// Cierra el ciclo después de llevar las piezas al molde nuevo, como plan.ops (no commitea; --plan no escribe): cada cambio
// `aplicado` del proyecto cuyo id (<vars.proyecto> <id>) o cita: está en kit/cubiertos.md con version ≤ la del kit nuevo y cuyo
// verificar da verde pasa a subio-al-kit con la versión del kit nuevo, y su zona propia se retira (vuelve a como viene de fábrica en el
// molde nuevo) si se cumplen las cinco condiciones. Con un tag -rc, nada: "subiría al kit" (r1-6). Sin aplicados no mira cubiertos.md; sin cubiertos.md, una línea.
// Lo lee lib/cubiertos.cjs: una entrada mala se saltea y se dice en una línea; las demás valen (RF-fix rf-1).
function cerrarCiclo(plan, carpeta, { opciones, llegadas, moldeNuevoDe, fabricaDe = () => ({}), leerP, escribir }) {
  const todos = CA.listarArchivos(carpeta).filter((a) => a.id).map((a) => CA.cargar(a));
  const aplicados = todos.filter((c) => !c.error && c.datos.estado === 'aplicado');
  if (!aplicados.length) return;
  const cub = CU.leer(path.join(opciones.kit, ...RUTA_CUBIERTOS.split('/')));
  if (cub.problema) {
    plan.lineas.push(`${RUTA_CUBIERTOS} · ${cub.problema} · no marqué nada: los cambios siguen aplicado`);
    return;
  }
  for (const m of cub.malas) plan.lineas.push(`${RUTA_CUBIERTOS} · ${CU.lineaMala(m)}`);
  const alias = typeof plan.vars.proyecto === 'string' ? plan.vars.proyecto : null;
  const ctx = CA.contextoVerificar(carpeta);
  for (const c of aplicados) {
    const claves = [alias === null ? null : `${alias} ${c.id}`, typeof c.datos.cita === 'string' ? c.datos.cita : null].filter(Boolean);
    const entrada = CU.cubre(cub.entradas, claves, plan.vNuevo);
    if (!entrada) continue;
    const fallas = CA.verificarCambio(carpeta, c, ctx);
    if (fallas.length) {
      plan.lineas.push(`no subió al kit · ${c.id} · verificar en rojo (${fallas[0].que}): sigue aplicado`);
      continue;
    }
    if (opciones.rc || /-rc\./.test(plan.vNuevo)) { // un aplicar suelto con kit -rc, igual que la flota (cambios.cjs no deja subir a un rc)
      plan.lineas.push(`subiría al kit · ${c.id}`);
      continue;
    }
    escribir(c.rel, CA.aSubioAlKit(c.texto, plan.vNuevo));
    if (!esMapa(c.datos.aplico)) {
      plan.lineas.push(`subió al kit · ${c.id} · sin aplico: no hay zona que retirar`);
      continue;
    }
    const archivo = c.datos.aplico.archivo;
    const texto = leerP(archivo);
    const fab = fabricaDe(archivo);
    const queda = porQueQueda(carpeta, { c, entrada, todos, llegadas, moldeNuevoDe, fab, texto });
    if (queda === null) escribir(archivo, zonasAFabrica(texto, fab.nueva)); // retirar = la zona como viene de fábrica (E8)
    plan.lineas.push(`subió al kit · ${c.id} · ${queda === null ? 'zona retirada' : queda}`);
  }
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

// aplicar(carpeta, {kit, moldeViejo, plan, fecha, io, rc}) → { codigo, lineas }
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
    const crudo = path.join(opciones.kit, 'kit', 'molde'); // las pruebas del molde corren contra el crudo (línea 7)
    const r = await chequeo.chequear(raiz, { moldeNuevo: nuevo.dir, moldeCrudo: fs.existsSync(path.join(crudo, 'settings.json')) ? crudo : null, moldeViejo: viejo.dir, base: opciones.base, plazoMs: opciones.plazoMs, version: vNuevo });
    const lineas = Array.isArray(r.lineas) ? r.lineas.map(String) : String(r.lineas || '').split('\n').filter(Boolean);
    return { codigo: r.ok ? 0 : 1, lineas };
  } finally {
    M.borrar(tmp);
  }
}

// ---------------------------------------------------------------- resolver (paquete 8b, (6)): la salida que eligió el dueño

// La pieza del catálogo v3 de una ruta del PROYECTO, o null (al revés de rutaEnProyecto: se prueba cada entrada `en` de cada pieza y
// la ruta del molde que sale la reparte piezaDeRuta, con su orden). Una ruta con . o .. de segmento, absoluta o con \ → null (r1-2).
function piezaDeRutaProyecto(rel) {
  const r = String(rel);
  if (!r || /\\|^\/|:|(^|\/)\.\.?(\/|$)/.test(r)) return null;
  for (const p of C.piezasDe('3')) {
    for (const en of p.en) {
      const enP = C.rutaEnProyecto(en);
      if (enP === null) continue;
      const molde = en.endsWith('/') ? (r.startsWith(enP) && r.length > enP.length ? en + r.slice(enP.length) : null) : r === enP ? en : null;
      if (molde !== null) {
        const q = C.piezaDeRuta('3', molde);
        return q ? q.id : null;
      }
    }
  }
  return null;
}

// Un porqué que entra entre comillas en la ficha: sin comillas dobles ni saltos de línea.
const porLimpio = (s) => String(s).replace(/"/g, "'").replace(/\s+/g, ' ').trim();

// resolver(carpeta, pieza, salida, {por, aMano}) → { codigo, lineas }. En el checkout del proyecto (rol humano), con un
// .claude/fusiones/<pieza>.md: escribe lo que dice el informe para la salida, pone estado y `por:` en la ficha, borra el informe e
// imprime el commit por rutas. No commitea. Se niega (1) sin escribir nada: congelar en una pieza de FRENOS, mezclar sin propuesta
// (salvo --a-mano), un informe que nombra una ruta que no es de la pieza según el catálogo y, solo en las salidas que escriben
// archivos (mezclar y nueva), un archivo que cambió desde el informe (su huella) o una ruta de la pieza con cambios sin commitear
// (r1-2). quedarse y congelar no escriben archivos: siempre pueden (si no, un commit entre la flota y el /inicio traba el informe hasta
// el próximo rc: la flota dice "al día" o "salteado"). --a-mano: lo que cambió desde el informe se valida del disco (lo armó el
// dueño); lo que sigue igual se escribe con lo del informe (la nueva en un molde, la propuesta en un tres limpio), así la próxima
// flota no revierte el arreglo.
function resolver(carpeta, id, salidaPedida, { por, aMano = false } = {}) {
  const raiz = path.resolve(carpeta);
  const no = (m) => ({ codigo: 1, lineas: [`resolver: ${m}`] });
  // `propia` es el nombre viejo de `quedarse` (8r2 t10): hace lo mismo y desde acá se llama quedarse
  const salida = FU.salidaDe(salidaPedida);
  if (!salida) return no(`"${salidaPedida}" no es una salida (${FU.SALIDAS.join(', ')}) — no toqué nada`);
  const top = gitEn(raiz, ['rev-parse', '--show-toplevel']);
  if (!top.ok || !mismaRuta(top.out.trim(), raiz)) return no(`${carpeta} no es la raíz de un repo git — no toco nada`);
  let rol = 'humano';
  try { rol = fs.readFileSync(path.join(raiz, KIT_ROL), 'utf8').trim(); } catch { /* sin .kit-rol: el dueño */ }
  if (rol !== 'humano') return no(`esta carpeta es de un agente (.kit-rol: ${rol}): resolver lo corre el dueño, en su checkout`);
  const def = C.piezasDe('3').find((p) => p.id === id && p.trato === 'pieza');
  if (!def) return no(`"${id}" no es una pieza del kit que se actualice`);
  if (salida === 'congelar' && FU.esFreno(id)) {
    const f = FU.FRENOS.find((x) => (x.id.endsWith('*') ? id.startsWith(x.id.slice(0, -1)) : x.id === id));
    return no(`congelar no va en ${id}: es una pieza de frenos (${f.por}) — elegí mezclar, quedarte con la tuya o tomar la nueva; no toqué nada`);
  }
  const leerD = (rel) => {
    const p = path.join(raiz, ...rel.split('/'));
    return fs.existsSync(p) && fs.statSync(p).isFile() ? fs.readFileSync(p, 'utf8') : null;
  };
  const textoFicha = leerD(RUTA_FICHA);
  if (textoFicha === null) return no(`no hay ficha (${RUTA_FICHA})`);
  let datos;
  try {
    datos = F.leer(textoFicha).datos;
  } catch (e) {
    return no(`la ficha no se lee (${e.message}) — no toqué nada`);
  }
  const piezas = esMapa(datos.piezas) ? datos.piezas : {};
  if (!Object.prototype.hasOwnProperty.call(piezas, id)) return no(`la ficha no tiene la pieza ${id}`);
  const rInforme = FU.rutaInforme(id);
  const textoInforme = leerD(rInforme);
  if (textoInforme === null) return no(`no hay ${rInforme}: no hay nada que resolver`);
  const inf = FU.leerInforme(textoInforme);
  if (!inf.base || !RE_VERSION.test(inf.base)) return no(`${rInforme} no tiene la línea base: — corré la flota de nuevo`);
  if (!inf.tuyos.length) return no(`${rInforme} no trae la huella de lo tuyo (es de un kit anterior): corré la flota de nuevo`);
  // las rutas: solo las del catálogo de la pieza (nunca lo que diga un título del informe)
  const ajena = inf.tuyos.find((t) => piezaDeRutaProyecto(t.rel) !== id);
  if (ajena) return no(`${rInforme} nombra ${ajena.rel}, que no es de la pieza ${id}: no toqué nada`);
  const CAMBIO = `cambió desde el informe: elegí ${FU.esFreno(id) ? 'quedarse' : 'quedarse o congelar'}, o mezclar --a-mano`;
  const igualQueElInforme = (t) => {
    const d = leerD(t.rel);
    return (d === null ? null : F.hash(d)) === t.hash;
  };
  const escribe = salida === 'mezclar' || salida === 'nueva';
  if (escribe && !aMano) {
    const cambiado = inf.tuyos.find((t) => !igualQueElInforme(t));
    if (cambiado) return no(`${cambiado.rel} ${CAMBIO}; no toqué nada`);
    const st = gitEn(raiz, ['status', '--porcelain=v1', '-z', '--untracked-files=all']);
    if (!st.ok) return no(`git status falló: ${st.err.trim()}`);
    const partes = st.out.split('\0');
    for (let i = 0; i < partes.length; i++) {
      const e = partes[i];
      if (!e) continue;
      const rutas = [e.slice(3)];
      if (e[0] === 'R' || e[0] === 'C') rutas.push(partes[++i]);
      const sucia = rutas.find((r) => r === rInforme || piezaDeRutaProyecto(r) === id); // la ficha no: varias piezas se resuelven antes de un commit
      if (sucia) return no(`${sucia} tiene cambios sin commitear: ${CAMBIO}; no toqué nada`);
    }
  }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-resolver-'));
  const ops = new Map();
  const lineas = [];
  try {
    for (const t of inf.tuyos) {
      const sec = inf.archivos.get(t.rel) || {};
      const disco = leerD(t.rel);
      if (salida === 'mezclar' && t.tipo !== 'igual') {
        if (aMano && igualQueElInforme(t)) {
          // no lo tocó: va lo del informe, como sin --a-mano (si quedara lo viejo, la próxima flota revierte el arreglo sin aviso)
          const texto = t.tipo === 'molde' ? sec.nueva : sec.propuesta;
          if (!texto) return no(`--a-mano: ${t.rel} sigue como en el informe y no tiene fusión propuesta: armala a mano (o elegí quedarse); no toqué nada`);
          const val = FU.validar(t.rel, texto, disco === null ? null : lf(disco), tmp);
          if (!val.ok) return no(`--a-mano: ${val.problema}; no toqué nada`);
          if (disco === null || lf(disco) !== val.texto) ops.set(t.rel, val.texto);
          continue;
        }
        if (aMano) {
          // lo armó el dueño: se valida lo del disco contra lo commiteado (sin marcadores, la zona como estaba, node --check)
          const h = gitEn(raiz, ['show', `HEAD:${t.rel}`]);
          const val = FU.validar(t.rel, disco, h.ok ? lf(h.out) : null, tmp);
          if (!val.ok) return no(`--a-mano: ${val.problema}; no toqué nada`);
          if (disco !== null && val.texto !== lf(disco)) return no(`--a-mano: ${t.rel}: la zona propia no quedó como estaba; no toqué nada`);
          continue;
        }
        const texto = t.tipo === 'molde' ? sec.nueva : sec.propuesta;
        if (!texto) return no(`${t.rel} no tiene fusión propuesta: armala a mano y corré con --a-mano; no toqué nada`);
        const val = FU.validar(t.rel, texto, disco === null ? null : lf(disco), tmp);
        if (!val.ok) return no(`${val.problema}; no toqué nada`);
        if (disco === null || lf(disco) !== val.texto) ops.set(t.rel, val.texto);
      } else if (salida === 'nueva' && sec.nueva) {
        // todo archivo de la pieza distinto del molde nuevo, también los "igual" (r1-4)
        const val = FU.validar(t.rel, sec.nueva, disco === null ? null : lf(disco), tmp);
        if (!val.ok) return no(`${val.problema}; no toqué nada`);
        if (disco === null || lf(disco) !== val.texto) ops.set(t.rel, val.texto);
      }
    }
  } finally {
    M.borrar(tmp);
  }
  // la ficha: estado y por: (y desde: al quedarse con la tuya; r1-1)
  const viejo = piezas[id];
  const p = porLimpio(por);
  const unico = inf.tuyos.length === 1 ? inf.tuyos[0] : null;
  const hNuevo = unico && (inf.archivos.get(unico.rel) || {}).nueva ? huella(unico.rel, inf.archivos.get(unico.rel).nueva) : hashDe(viejo);
  const valor = {
    mezclar: () => valorPieza('adaptada', hNuevo, p),
    quedarse: () => valorPieza('adaptada', hashDe(viejo), p, inf.base),
    nueva: () => valorPieza('molde', hNuevo), // molde no lleva por: (la gramática); el porqué va en el commit
    congelar: () => valorPieza('propia', hashDe(viejo), p),
  }[salida]();
  const fichaNueva = reescribirFicha(textoFicha, null, new Map([[id, valor]]));
  try {
    F.leer(fichaNueva);
  } catch (e) {
    return no(`la ficha reescrita no se lee (${e.message}) — no toqué nada`);
  }
  const escritos = [...ops.keys()];
  ops.set(RUTA_FICHA, fichaNueva);
  ops.set(rInforme, null);
  try {
    ejecutar(raiz, ops);
  } catch (e) {
    return no(`no pude escribir ${e.ruta || '?'} (${e.code || e.message}): mirá \`git status\``);
  }
  for (const r of escritos) lineas.push(`${r} · escrito (${salida})`);
  lineas.push(`${RUTA_FICHA} · ${id}: ${valor}`, `${rInforme} · borrado`);
  if (FU.esFreno(id) && escritos.length) {
    lineas.push(`${id} es de frenos: el candado pide el aprobado del dueño al commitear; si no aprueba, \`git checkout -- ${escritos.join(' ')}\``);
  }
  lineas.push(`commit por rutas: git add -A -- ${[...escritos, RUTA_FICHA, rInforme].join(' ')} && git commit -m "inicio: ${id}, ${salida} (${p.replace(/[`$\\]/g, '')})"`);
  return { codigo: 0, lineas };
}

// resolver <carpeta> <pieza> <salida> --por "<texto>" [--a-mano] → {carpeta, pieza, salida, por, aMano} o null (uso).
function leerResolver(resto) {
  const pos = [];
  const o = { aMano: false };
  for (let i = 0; i < resto.length; i++) {
    const a = resto[i];
    if (a === '--por') {
      if (i + 1 >= resto.length) return null;
      o.por = resto[++i];
    } else if (a === '--a-mano') o.aMano = true;
    else if (a.startsWith('--')) return null;
    else pos.push(a);
  }
  if (pos.length !== 3 || !FU.salidaDe(pos[2]) || typeof o.por !== 'string' || !o.por.trim()) return null;
  if (o.aMano && pos[2] !== 'mezclar') return null;
  return { carpeta: pos[0], pieza: pos[1], salida: pos[2], por: o.por, aMano: o.aMano };
}

// ---------------------------------------------------------------- línea de comandos

function leerArgs(argv) {
  const [sub, ...resto] = argv;
  if (sub !== 'aplicar' && sub !== 'chequear') return null;
  const o = { sub, plan: false };
  const conValor = { '--kit': 'kit', '--molde-viejo': 'moldeViejo', '--base': 'base', '--plazo': 'plazo', '--fecha': 'fecha', '--claude': 'claude' };
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
    if (o.claude !== undefined) return null;
  } else if (o.base !== undefined || o.plazo !== undefined) return null;
  if (o.fecha !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(o.fecha)) return null;
  return o;
}

async function main(argv) {
  if (argv[0] === 'flota' || argv[0] === 'adoptar') {
    const r = await require(argv[0] === 'flota' ? './lib/flota.cjs' : './lib/adoptar.cjs').main(argv.slice(1));
    return r ? { codigo: r.codigo, lineas: r.lineas } : { codigo: 2, lineas: [USO] };
  }
  if (argv[0] === 'ultimo-tag') {
    // el tag v* anotado que reparte la flota (lib/flota.cjs elegirTag): v3.0.0 va después de v3.0.0-rc.N (git tag --sort no)
    if (argv.length !== 2 || argv[1].startsWith('--')) return { codigo: 2, lineas: [USO] };
    const FL = require('./lib/flota.cjs');
    try {
      return { codigo: 0, lineas: [FL.elegirTag(FL.tagsDe(path.resolve(argv[1])))] };
    } catch (e) {
      if (e instanceof FL.Negativa) return { codigo: 1, lineas: [`ultimo-tag: ${e.message}`] };
      throw e;
    }
  }
  if (argv[0] === 'resolver') {
    const r = leerResolver(argv.slice(1));
    return r ? resolver(r.carpeta, r.pieza, r.salida, { por: r.por, aMano: r.aMano }) : { codigo: 2, lineas: [USO] };
  }
  const o = leerArgs(argv);
  if (!o) return { codigo: 2, lineas: [USO] };
  const kit = path.resolve(o.kit);
  const moldeViejo = o.moldeViejo ? path.resolve(o.moldeViejo) : undefined;
  const claude = o.claude && /[\\/]/.test(o.claude) ? path.resolve(o.claude) : o.claude; // un nombre suelto se lanza por el PATH
  if (o.sub === 'aplicar') return aplicar(o.carpeta, { kit, moldeViejo, plan: o.plan, fecha: o.fecha, claude });
  return chequear(o.carpeta, { kit, moldeViejo, base: o.base, fecha: o.fecha, plazoMs: Math.round(Number(o.plazo || 30) * 60000) });
}

// Antes de correr: lib/adoptar.cjs (que se carga desde main) lee estos exports.
module.exports = { aplicar, planear, chequear, resolver, main, reescribirFicha, ejecutar, versionDelKit, notaDelKit, piezaDeRutaProyecto, Negativa, USO };

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
