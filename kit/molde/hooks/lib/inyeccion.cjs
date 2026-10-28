'use strict';
// inyeccion.cjs — lo que el hook de arranque le muestra a la sesión (B §9; SPEC-paquete-2 P4.1), con un tope por bloque,
// cortado en renglón o ítem entero y dicho, y la huella al final. Node estándar, cero dependencias.
// Es .cjs a propósito: corre igual en proyectos con "type": "module".
//
// armar({cwd, entrada, home, ahora, propio}) → { texto, n, cortes }. NO escribe nada: lee el disco y git y arma el texto.
// Lo propio del proyecto (session-start.propio.sh) lo corre el hook: entra acá ya corrido, o como función que se llama al
// final (así se come lo que sobre del plazo, no lo de git).
//
// Los bloques, en este orden (P4.1):
//  1 CORTADO (si algo se cortó) · 2 cabecera · 3 líneas de F (nada: 500 reservados, orden 3) · 4 por pestaña ·
//  5 edades (al lado de Estado y Próximo paso) · 6 módulos activos · 7 cabecera del TODO · 8 git · 9 recordatorio de /inicio ·
//  10 lo propio, con lo que sobre · (E4b) "arranque lento", si el plazo de git.cjs salteó algo · 11 la huella `inyectado: N de 9.700`.
//
// Con el plazo del hook (git.fijarPlazo), lo que se saltea degrada y no miente: edades "sin datos", el handoff del disco si la
// ref no se pudo resolver, y nunca "sin git", "sin ficha" ni "sin commits" por un git que no se llegó a correr.

const fs = require('fs');
const path = require('path');
const git = require('./git.cjs');
const contexto = require('./contexto.cjs');
const topes = require('./topes.cjs');
const todo = require('./todo.cjs');
const ficha = require('./ficha.cjs');

const B = topes.BLOQUES;
const PRESUPUESTO = topes.PRESUPUESTO;

const RUTA_HANDOFF = 'docs/SESSION_HANDOFF.md';
const RUTA_TODO = 'docs/TODO.md';
const CARPETA_MODULOS = 'docs/modulos';
const RUTA_PROPIO = '.claude/hooks/session-start.propio.sh';

const MS_DIA = 24 * 60 * 60 * 1000;
// Un blame en un repo de historia larga no se puede comer el arranque: pasado esto, "edad: sin datos" (Supuestos del delta).
const TIEMPO_BLAME = 2000;
let tiempoBlame = TIEMPO_BLAME; // el de esta corrida (armar lo fija; las pruebas, con la PC cargada, piden más)
const BOM = String.fromCharCode(0xfeff);

const RECORDATORIO = 'Recordatorio: decí /inicio para el ritual de arranque (cruza esto con git); no toco nada sin tu OK.';
const SIN_FICHA = 'sin ficha: valen los frenos de fábrica';
const SIN_GIT = 'sin git: esta carpeta no es un repo (o git no está en esta PC) — sin edades, módulos por rama ni git';
const GIT_SIN_TIEMPO = 'git no respondió a tiempo: sin ficha, edades, módulos por rama ni git';
const FICHA_SIN_TIEMPO = 'ficha sin leer: git no respondió a tiempo';
const BLOQUE_SIN_TIEMPO = '(git no respondió a tiempo: este bloque está incompleto)';

// El renglón de "arranque lento" (E4b): va antes de la huella y cuenta para el presupuesto. Su lugar se reserva con la cuenta
// más larga que se puede dar en la práctica (4 cifras).
const lineaLento = (n) => `arranque lento: ${n} ${n === 1 ? 'consulta' : 'consultas'} a git ${n === 1 ? 'salteada' : 'salteadas'} por tiempo (corré doctor si se repite)`;
const LENTO_MAX = lineaLento(9999).length + 1;
// ¿El plazo ya salteó alguna consulta? Desde ahí, todo git que siga también se saltea: lo que falte no es "no hay".
const sinTiempo = () => git.salteadasPorPlazo() > 0;

// ---------------------------------------------------------------- números y textos

const miles = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const huella = (n) => `inyectado: ${miles(n)} de ${miles(PRESUPUESTO)}`;
const HUELLA_MAX = huella(PRESUPUESTO).length;

const limpiar = (t) => {
  let s = String(t);
  if (s.startsWith(BOM)) s = s.slice(1);
  return s.replace(/\r\n?/g, '\n');
};
// Renglones de un texto, sin los blancos del final.
function renglones(t) {
  const l = limpiar(t).split('\n').map((x) => x.replace(/\s+$/, ''));
  while (l.length && l[l.length - 1] === '') l.pop();
  return l;
}
const acortar = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

function leerDisco(abs) {
  try {
    return fs.readFileSync(abs, 'utf8');
  } catch (e) {
    return null;
  }
}

const existeRef = (cwd, ref) => git.correr(['rev-parse', '--verify', '-q', `${ref}^{commit}`], { cwd }).ok;

// git show <ref>:<ruta> → texto o null.
function mostrar(cwd, ref, ruta) {
  const r = git.correr(['show', `${ref}:${ruta}`], { cwd });
  return r.ok ? limpiar(r.stdout) : null;
}

// El prefijo más largo de renglones enteros que entra en `tope` caracteres (unidos con \n). Si no entran todos, el último
// renglón es `marca(cuántos quedaron afuera)`, que cuenta para el tope. → { lineas, cortado }
function cortarRenglones(lineas, tope, marca) {
  const pre = [0]; // pre[k] = largo de lineas[0..k) unidas
  for (let i = 0; i < lineas.length; i++) pre.push(pre[i] + (i ? 1 : 0) + lineas[i].length);
  if (pre[lineas.length] <= tope) return { lineas: lineas.slice(), cortado: false };
  for (let k = lineas.length - 1; k >= 0; k--) {
    const m = marca ? marca(lineas.length - k) : null;
    const largo = pre[k] + (m === null ? 0 : (k ? 1 : 0) + m.length);
    if (largo <= tope) return { lineas: lineas.slice(0, k).concat(m === null ? [] : [m]), cortado: true };
  }
  return { lineas: [], cortado: true };
}

// ---------------------------------------------------------------- edades (punto 5)

// El renglón más nuevo de [desde, hasta) (base 0) según git.edades → { sinCommitear } · { fecha, sha } · null si no hay dato.
function masNuevo(edades, desde, hasta) {
  if (!Array.isArray(edades)) return null;
  let mejor = null;
  for (const e of edades) {
    const i = e.linea - 1;
    if (i < desde || i >= hasta) continue;
    if (e.sinCommitear) return { sinCommitear: true };
    if (!e.fecha) continue;
    if (!mejor || e.fecha.getTime() > mejor.fecha.getTime()) mejor = { fecha: e.fecha, sha: e.sha };
  }
  return mejor;
}

// Las edades de un archivo, del disco (sin rev) o de una revisión. null si git no pudo o tardó demasiado.
function edadesDe(cwd, ruta, rev) {
  return git.edades(ruta, { cwd, rev: rev || undefined, tiempo: tiempoBlame });
}

// ¿Hubo commits fuera de docs/ entre `sha` y `punta`? (el "estado viejo" de B §9)
const yaVistos = new Map(); // cwd|sha|punta → bool, dentro de una misma corrida (Estado y Próximo paso suelen ser el mismo commit)
function huboCodigoDespues(cwd, sha, punta) {
  if (!sha || !punta) return false;
  const clave = `${cwd}|${sha}|${punta}`;
  if (!yaVistos.has(clave)) {
    const n = git.texto(['rev-list', '--count', `${sha}..${punta}`, '--', '.', ':(exclude)docs'], { cwd });
    yaVistos.set(clave, !!n && Number(n) > 0);
  }
  return yaVistos.get(clave);
}

function textoEdad(info, ahora, viejo) {
  if (!info) return '(edad: sin datos)';
  if (info.sinCommitear) return '(sin commitear)';
  const d = Math.max(0, Math.floor((ahora - info.fecha.getTime()) / MS_DIA));
  const base = `hace ${d} ${d === 1 ? 'día' : 'días'}`;
  return viejo ? `(${base} · estado viejo)` : `(${base})`;
}

// Le pega la edad a un renglón si entra en lo que queda del tope de edades (100, compartido por todo el texto).
function pegarEdad(linea, edad, cupo) {
  const extra = ' ' + edad;
  if (extra.length > cupo.queda) return linea;
  cupo.queda -= extra.length;
  return linea + extra;
}

// ---------------------------------------------------------------- la ficha de un módulo (contrato mínimo, Cruces 11)

const RE_ESTADO_MOD = /^\s*(?:-\s+)?Estado:\s*(.*)$/;
const RE_RAMA_MOD = /^\s*(?:-\s+)?rama:\s*(.*)$/;
const RE_PROXIMO_MOD = /^\s*(?:-\s+)?Próximo paso:\s*(.*)$/;
const RE_ACTIVO = /^(EN OBRA|PAUSADO)\b/i;
const sinMarcas = (s) => s.replace(/^[`*_"]+|[`*_"]+$/g, '').trim();

// datosFichaModulo(texto) → { estado, iEstado, rama, proximo, activo }. iEstado: índice del renglón `Estado:` (o -1).
function datosFichaModulo(texto) {
  const l = limpiar(texto == null ? '' : texto).split('\n');
  const d = { estado: null, iEstado: -1, rama: null, proximo: null, activo: false };
  l.forEach((x, i) => {
    let m;
    if (d.estado === null && (m = RE_ESTADO_MOD.exec(x))) {
      d.estado = sinMarcas(m[1]);
      d.iEstado = i;
    } else if (d.rama === null && (m = RE_RAMA_MOD.exec(x))) {
      d.rama = sinMarcas(m[1]) || null;
    } else if (d.proximo === null && (m = RE_PROXIMO_MOD.exec(x))) {
      d.proximo = m[1].trim();
    }
  });
  d.activo = !!d.estado && RE_ACTIVO.test(d.estado);
  return d;
}

// La cabecera de la ficha del módulo (1.000), con la edad al lado de `Estado:`.
// `rev`: de dónde salen las edades (null = el disco). → { lineas, cortado }
function bloqueFichaModulo({ cwd, texto, ruta, origen, rev, ahora, cupo, gitOk }) {
  const lineas = renglones(texto);
  const c = cortarRenglones(lineas, B.cabeceraFichaModulo, () => `… (CORTADO: sigue en ${origen})`);
  const d = datosFichaModulo(texto);
  if (d.iEstado >= 0 && d.iEstado < c.lineas.length && !(c.cortado && d.iEstado === c.lineas.length - 1) && gitOk) {
    const info = masNuevo(edadesDe(cwd, ruta, rev), d.iEstado, d.iEstado + 1);
    const viejo = info && info.sha && d.rama ? huboCodigoDespues(cwd, info.sha, d.rama) : false;
    c.lineas[d.iEstado] = pegarEdad(c.lineas[d.iEstado], textoEdad(info, ahora, viejo), cupo);
  }
  return c;
}

// ---------------------------------------------------------------- el handoff

// El título "empieza con" la sección y después viene el fin o un signo (no otra letra: "## Estados" no es "## Estado").
function esTitulo(linea, titulo) {
  if (!linea.startsWith(titulo)) return false;
  const sig = linea.slice(titulo.length, titulo.length + 1);
  return sig === '' || !/[\p{L}\p{N}_]/u.test(sig);
}

// El handoff (5.000), con la edad al lado de `## Estado` y `## Próximo paso` y "estado viejo" si después hubo commits
// fuera de docs/ en `punta`. `rev` null = el del disco. → { lineas, cortado }
function bloqueHandoff({ cwd, texto, origen, rev, punta, ahora, cupo, gitOk }) {
  const lineas = renglones(texto);
  const c = cortarRenglones(lineas, B.handoff, () => `… (CORTADO: sigue en ${origen})`);
  if (!gitOk) return c;
  const titulos = [];
  lineas.forEach((l, i) => {
    if (/^#{1,6}\s/.test(l)) titulos.push(i);
  });
  let edades; // se calcula una vez, solo si hace falta
  for (const t of ['## Estado', '## Próximo paso']) {
    const i = lineas.findIndex((l) => esTitulo(l, t));
    if (i < 0 || i >= c.lineas.length || (c.cortado && i === c.lineas.length - 1)) continue;
    const fin = titulos.find((k) => k > i);
    if (edades === undefined) edades = edadesDe(cwd, RUTA_HANDOFF, rev);
    const info = masNuevo(edades, i, fin === undefined ? lineas.length : fin);
    const viejo = info && info.sha ? huboCodigoDespues(cwd, info.sha, punta) : false;
    c.lineas[i] = pegarEdad(c.lineas[i], textoEdad(info, ahora, viejo), cupo);
  }
  return c;
}

// ---------------------------------------------------------------- los módulos activos (300)

function bloqueModulos({ raiz, ahora, gitOk }) {
  let nombres = [];
  try {
    nombres = fs
      .readdirSync(path.join(raiz, ...CARPETA_MODULOS.split('/')), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();
  } catch (e) {
    return null;
  }
  // Los activos: por `git show <rama>:` si la ficha tiene `rama:` (y la rama existe), si no del disco.
  const activos = [];
  for (const x of nombres) {
    const ruta = `${CARPETA_MODULOS}/${x}/README.md`;
    const disco = leerDisco(path.join(raiz, CARPETA_MODULOS, x, 'README.md'));
    if (disco === null) continue;
    let d = datosFichaModulo(disco);
    let rev = null;
    if (d.rama && gitOk) {
      const s = mostrar(raiz, d.rama, ruta);
      if (s !== null) {
        rev = d.rama;
        d = datosFichaModulo(s);
      }
    }
    if (d.activo) activos.push({ x, ruta, d, rev });
  }
  if (!activos.length) return null;
  // La edad cuesta un blame: solo para los renglones que todavía pueden entrar en los 300.
  const lineas = [];
  let usado = 0;
  for (const { x, ruta, d, rev } of activos) {
    let edad = '';
    if (gitOk && usado <= B.modulos) {
      const info = masNuevo(edadesDe(raiz, ruta, rev), d.iEstado, d.iEstado + 1);
      const viejo = info && info.sha && d.rama ? huboCodigoDespues(raiz, info.sha, d.rama) : false;
      edad = ' ' + textoEdad(info, ahora, viejo);
    }
    const l = `${acortar(x, 40)} · ${acortar(d.estado, 40)}${edad} · próximo: ${d.proximo ? acortar(d.proximo, 120) : '(sin "Próximo paso:")'}`;
    lineas.push(l);
    usado += l.length + 1;
  }
  return cortarRenglones(lineas, B.modulos, (n) => `… (${n} más en ${CARPETA_MODULOS}/)`);
}

// ---------------------------------------------------------------- git (800)

function bloqueGit({ raiz, pest, rv }) {
  const arriba = [];
  // "origin tiene un handoff más nuevo": con lo ya traído, sin fetch. El obrero no ve el handoff: tampoco este aviso.
  if (rv && rv.origen !== 'local' && pest.tipo !== 'obrero') {
    const base = pest.tipo === 'director' ? (existeRef(raiz, `refs/heads/${rv.nombre}`) ? `refs/heads/${rv.nombre}` : null) : 'HEAD';
    if (base) {
      const nh = git.texto(['rev-list', '--count', `${base}..${rv.ref}`, '--', RUTA_HANDOFF], { cwd: raiz });
      if (nh && Number(nh) > 0) {
        const n = git.texto(['rev-list', '--count', `${base}..${rv.ref}`], { cwd: raiz });
        arriba.push(`origin tiene un handoff más nuevo (${n} commits): hacé pull`);
      }
    }
  }
  const rl = git.correr(['log', '-5', '--format=%h %s'], { cwd: raiz });
  const log = rl.ok ? rl.stdout.replace(/\s+$/, '') : '';
  if (log) for (const l of log.split('\n')) arriba.push(acortar(l.replace(/\s+$/, ''), 100));
  else if (rl.error !== 'plazo') arriba.push('sin commits todavía');
  const st = git.correr(['status', '--porcelain'], { cwd: raiz });
  if (rl.error === 'plazo' || st.error === 'plazo') arriba.push(BLOQUE_SIN_TIEMPO);
  let estado = st.ok ? st.stdout.split('\n').map((l) => l.replace(/\s+$/, '')).filter((l) => l !== '') : [];
  const total = estado.length;
  if (st.ok && total === 0) arriba.push('árbol limpio');
  // Hasta 10 renglones de estado; y los que no entren en 800, también afuera (no es un documento: se dice, no es CORTADO).
  let k = Math.min(10, total);
  const armarCon = (k2) => {
    const l = arriba.concat(estado.slice(0, k2));
    if (k2 < total) l.push(`… y ${total - k2} más: corré git status`);
    return l;
  };
  let lineas = armarCon(k);
  while (k > 0 && lineas.join('\n').length > B.git) lineas = armarCon(--k);
  if (lineas.join('\n').length > B.git) lineas = cortarRenglones(lineas, B.git, null).lineas;
  return lineas;
}

// ---------------------------------------------------------------- la cabecera (250)

function textoKit(version, home) {
  let s = `kit ${acortar(String(version), 20)}`;
  if (!home) return s;
  let instalada = leerDisco(path.join(home, '.claude', 'VERSION'));
  if (instalada === null) return s; // sin VERSION, calla (E §8)
  instalada = limpiar(instalada).trim();
  try {
    const c = ficha.compararVersiones(String(version), instalada);
    if (c < 0) s += ` · hay kit nuevo: ${instalada}`;
    else if (c > 0) s += ' · esta PC está atrás: actualizate';
  } catch (e) {
    /* una versión ilegible no es motivo para frenar el arranque */
  }
  return s;
}

// El modo de permisos: el que viene en la entrada; si no, el defaultMode de los settings "(configurado)", nunca "desconocido".
function textoModo(entrada, raiz, home) {
  const pm = entrada && typeof entrada.permission_mode === 'string' ? entrada.permission_mode.trim() : '';
  if (pm) return `modo ${acortar(pm, 30)}`;
  const archivos = [path.join(raiz, '.claude', 'settings.local.json'), path.join(raiz, '.claude', 'settings.json')];
  if (home) archivos.push(path.join(home, '.claude', 'settings.json'));
  for (const a of archivos) {
    const t = leerDisco(a);
    if (t === null) continue;
    try {
      const j = JSON.parse(limpiar(t));
      const dm = j && j.permissions && j.permissions.defaultMode;
      if (typeof dm === 'string' && dm.trim()) return `modo ${acortar(dm.trim(), 30)} (configurado)`;
    } catch (e) {
      /* un settings roto no frena el arranque */
    }
  }
  return 'modo default (configurado)';
}

function textoHandoffCommit(raiz, ref) {
  const args = ['log', '-1', '--format=%h %cd', '--date=format:%Y-%m-%d %H:%M'];
  if (ref) args.push(ref);
  args.push('--', RUTA_HANDOFF);
  const r = git.correr(args, { cwd: raiz });
  if (r.error === 'plazo') return null; // sin tiempo no es "sin commit": se calla
  const t = r.ok ? r.stdout.replace(/\s+$/, '') : '';
  return t ? `handoff: ${t}` : 'handoff: sin commit';
}

// gitSinTiempo / fichaSinTiempo: el plazo no dejó saber si hay git o ficha (no es lo mismo que no haber).
function bloqueCabecera({ raiz, nombreRama, ramaSinTiempo, fv, entrada, home, gitOk, refHandoff, verHandoff, gitSinTiempo, fichaSinTiempo }) {
  const segundo = [];
  const datos = fv.estado === 'ok' ? fv.datos : null;
  if (!gitOk) segundo.push(gitSinTiempo ? GIT_SIN_TIEMPO : SIN_GIT);
  else if (fv.estado === 'rota') segundo.push(`ficha rota: ${fv.donde} — corré doctor`);
  else if (fv.estado !== 'ok') segundo.push(fichaSinTiempo ? FICHA_SIN_TIEMPO : SIN_FICHA);
  const proyecto = datos && datos.vars && typeof datos.vars.proyecto === 'string' && datos.vars.proyecto ? datos.vars.proyecto : path.basename(raiz);
  const segs = [acortar(proyecto, 50), acortar(nombreRama || (ramaSinTiempo ? '(rama sin leer)' : '(sin rama)'), 50)];
  if (datos && typeof datos.kit === 'string') segs.push(textoKit(datos.kit, home));
  if (datos && typeof datos.nivel === 'string') segs.push(`nivel ${acortar(datos.nivel, 20)}`);
  segs.push(textoModo(entrada, raiz, home));
  if (gitOk && verHandoff) {
    const h = textoHandoffCommit(raiz, refHandoff);
    if (h) segs.push(h);
  }
  const lugar = B.cabecera - segundo.reduce((n, l) => n + l.length + 1, 0);
  while (segs.length > 1 && segs.join(' · ').length > lugar) segs.pop();
  return [acortar(segs.join(' · '), Math.max(lugar, 20))].concat(segundo);
}

// ---------------------------------------------------------------- el encargo del obrero

function bloqueEncargo({ raiz, pest, gitOk }) {
  const dir = `${CARPETA_MODULOS}/${pest.modulo}/bitacora`;
  const sufijo = `-encargo-${pest.id}.md`;
  let hallados = [];
  try {
    hallados = fs.readdirSync(path.join(raiz, ...dir.split('/'))).filter((f) => f.endsWith(sufijo));
  } catch (e) {
    hallados = [];
  }
  if (!hallados.length && gitOk) {
    const t = git.texto(['ls-tree', '--name-only', `refs/heads/modulo/${pest.modulo}`, `${dir}/`], { cwd: raiz });
    if (t) hallados = t.split('\n').map((l) => l.split('/').pop()).filter((f) => f.endsWith(sufijo));
  }
  hallados.sort();
  let lineas;
  if (hallados.length) lineas = hallados.slice(0, 3).map((f) => `encargo ${pest.id}: ${dir}/${f} — leelo entero antes de arrancar`);
  else if (sinTiempo()) lineas = [`encargo ${pest.id}: git no respondió a tiempo para buscarlo en modulo/${pest.modulo} — buscá *${sufijo} en ${dir}/`];
  else lineas = [`encargo ${pest.id}: no está en ${dir}/ (*${sufijo}) — pedíselo al director antes de arrancar`];
  lineas.push(`(sin el handoff del proyecto: sos el obrero del encargo ${pest.id} de ${pest.modulo})`);
  return lineas.map((l) => acortar(l, 300));
}

// ---------------------------------------------------------------- lo propio (con lo que sobre)

function lineasPropio(propio) {
  if (!propio || typeof propio !== 'object') return null;
  if (propio.falla === 'sin-bash') return [`${RUTA_PROPIO}: no hay bash en esta PC para correrlo`];
  const l = renglones(typeof propio.salida === 'string' ? propio.salida : '');
  if (propio.falla === 'tiempo') l.push(`${RUTA_PROPIO}: no terminó a tiempo`);
  else if (propio.falla) l.push(`${RUTA_PROPIO}: ${acortar(String(propio.falla), 60)}`);
  return l.length ? l : null;
}

// ---------------------------------------------------------------- todo junto

function lineaCortado(cortes) {
  const ques = cortes.map((c) => c.que);
  const rutas = [...new Set(cortes.map((c) => c.ruta))];
  return `CORTADO: ${ques.join(', ')} — leé el resto en ${rutas.join(', ')} antes de confiar en lo de abajo`;
}

// El ref que usó fichaVigente → { nombre, ref, origen } (como contexto.refVigente) o null.
function refDe(ref) {
  if (typeof ref !== 'string') return null;
  if (ref.startsWith('refs/heads/')) return { nombre: ref.slice('refs/heads/'.length), ref, origen: 'local' };
  if (ref.startsWith('refs/remotes/origin/')) return { nombre: ref.slice('refs/remotes/origin/'.length), ref, origen: 'origin' };
  return null;
}

// La raíz sin git (cuando el plazo no dejó preguntarle): la primera carpeta hacia arriba con un `.git`; si no hay, el cwd.
function raizPorDisco(cwd) {
  let d = path.resolve(cwd);
  for (;;) {
    if (fs.existsSync(path.join(d, '.git'))) return d;
    const arriba = path.dirname(d);
    if (arriba === d) return path.resolve(cwd);
    d = arriba;
  }
}

function aEntrada(e) {
  if (typeof e === 'string') {
    try {
      e = JSON.parse(e);
    } catch (err) {
      e = null;
    }
  }
  return e && typeof e === 'object' && !Array.isArray(e) ? e : {};
}

// armar({cwd, entrada, home, ahora, propio}) → { texto, n, cortes: [{que, ruta}] }
//  cwd: de dónde parte (si falta, el de la entrada) · entrada: el JSON del hook (objeto o texto) · home: la carpeta donde está
//  .claude/VERSION (sin home, no compara versiones) · ahora: Date o ms (para las edades) · propio: { salida, falla } ya corrido,
//  o una función que lo da (se llama después de todo lo de git) ·
//  tiempoBlame: ms por blame (2.000 si no viene; pasado eso, "edad: sin datos").
function armar(opciones = {}) {
  const entrada = aEntrada(opciones.entrada);
  const cwd = typeof opciones.cwd === 'string' && opciones.cwd ? opciones.cwd : contexto.cwdDe(entrada);
  const ahora = opciones.ahora instanceof Date ? opciones.ahora.getTime() : Number.isFinite(opciones.ahora) ? opciones.ahora : Date.now();
  const home = opciones.home || null;
  yaVistos.clear(); // la memoria de "estado viejo" vale para una sola corrida: HEAD se mueve entre una y otra
  tiempoBlame = Number.isFinite(opciones.tiempoBlame) && opciones.tiempoBlame > 0 ? opciones.tiempoBlame : TIEMPO_BLAME;

  const g = contexto.datosGit(cwd);
  const gitOk = !!g;
  const gitSinTiempo = !gitOk && sinTiempo();
  const raiz = g ? g.raiz : gitSinTiempo ? raizPorDisco(cwd) : path.resolve(cwd);
  const nombreRama = gitOk ? contexto.rama(raiz) : null;
  const ramaSinTiempo = nombreRama === null && sinTiempo(); // sin tiempo es "no sé", no HEAD suelto (y la pestaña queda plana)
  const pest = contexto.pestana(nombreRama);
  const fv = gitOk ? contexto.fichaVigente(raiz) : { estado: 'sin-git' };
  const fichaSinTiempo = fv.estado === 'sin-ficha' && sinTiempo();
  const rv = refDe(fv.ref); // la rama por defecto sale de la misma regla de 4.7 (sin repetir sus ~5 llamadas a git)
  const cupo = { queda: B.edades };
  const cortes = [];
  const bloques = []; // cada uno: lista de renglones

  // El handoff de la rama por defecto, para el director: la rama local si existe (es la que escribe la sesión plana), si no la vigente.
  let refDefecto = null;
  if (rv) refDefecto = rv.origen === 'local' || existeRef(raiz, `refs/heads/${rv.nombre}`) ? rv.nombre : rv.ref;

  // 2 · cabecera
  const refHandoff = pest.tipo === 'director' ? refDefecto : null;
  bloques.push(
    bloqueCabecera({
      raiz,
      nombreRama,
      ramaSinTiempo,
      fv,
      entrada,
      home,
      gitOk,
      refHandoff,
      verHandoff: pest.tipo !== 'obrero',
      gitSinTiempo,
      fichaSinTiempo,
    })
  );

  // 3 · líneas de F: nada todavía (orden 3).

  // 4 · por pestaña (con 5, las edades)
  if (pest.tipo === 'director' || pest.tipo === 'obrero') {
    const x = pest.modulo;
    const ruta = `${CARPETA_MODULOS}/${x}/README.md`;
    let texto;
    let origen;
    let rev = null;
    if (pest.tipo === 'director') {
      texto = leerDisco(path.join(raiz, CARPETA_MODULOS, x, 'README.md'));
      origen = ruta;
    } else {
      rev = existeRef(raiz, `refs/heads/modulo/${x}`) ? `modulo/${x}` : `refs/remotes/origin/modulo/${x}`;
      texto = mostrar(raiz, rev, ruta);
      origen = `git show modulo/${x}:${ruta}`;
    }
    const titulo = `=== ficha del módulo ${x} (${origen}) ===`;
    if (texto === null && pest.tipo === 'obrero' && sinTiempo()) {
      bloques.push([titulo, `git no respondió a tiempo: no se pudo leer ${ruta} de modulo/${x}`]);
    } else if (texto === null) {
      bloques.push([titulo, `no hay ${ruta}${pest.tipo === 'obrero' ? ` en modulo/${x}` : ' en este worktree'}`]);
    } else {
      const c = bloqueFichaModulo({ cwd: raiz, texto, ruta, origen, rev, ahora, cupo, gitOk });
      if (c.cortado) cortes.push({ que: `la ficha de ${x}`, ruta: origen });
      bloques.push([titulo].concat(c.lineas));
    }
  }
  if (pest.tipo === 'obrero') {
    bloques.push([`=== el encargo ${pest.id} ===`].concat(bloqueEncargo({ raiz, pest, gitOk })));
  } else {
    let texto;
    let origen;
    let rev = null;
    let punta = 'HEAD';
    let nota = '';
    if (pest.tipo === 'director') {
      origen = refDefecto ? `git show ${refDefecto}:${RUTA_HANDOFF}` : RUTA_HANDOFF;
      texto = refDefecto ? mostrar(raiz, refDefecto, RUTA_HANDOFF) : null;
      rev = refDefecto;
      punta = refDefecto;
      // Sin tiempo para resolver la ref o leerla: el del disco de este worktree, y dicho en el título (es mejor que nada).
      if (texto === null && sinTiempo()) {
        texto = leerDisco(path.join(raiz, ...RUTA_HANDOFF.split('/')));
        origen = RUTA_HANDOFF;
        nota = ' — el del disco: git no respondió a tiempo';
        rev = null;
        punta = 'HEAD';
      }
    } else {
      origen = RUTA_HANDOFF;
      texto = leerDisco(path.join(raiz, ...RUTA_HANDOFF.split('/')));
    }
    const titulo = `=== handoff (${origen})${nota} ===`;
    if (texto === null) {
      bloques.push([titulo, `no hay ${RUTA_HANDOFF}${pest.tipo === 'director' ? ` en ${refDefecto || 'la rama por defecto'}` : ''}`]);
    } else {
      const c = bloqueHandoff({ cwd: raiz, texto, origen, rev, punta, ahora, cupo, gitOk });
      if (c.cortado) cortes.push({ que: 'el handoff', ruta: origen });
      bloques.push([titulo].concat(c.lineas));
    }
  }

  // 6 · módulos activos
  const mods = bloqueModulos({ raiz, ahora, gitOk });
  if (mods) {
    if (mods.cortado) cortes.push({ que: 'los módulos activos', ruta: `${CARPETA_MODULOS}/` });
    bloques.push(['=== módulos activos ==='].concat(mods.lineas));
  }

  // 7 · cabecera del TODO (🔴 y 🟠)
  const tituloTodo = `=== TODO ${todo.EMOJI.rojo} y ${todo.EMOJI.naranja} (${RUTA_TODO}) ===`;
  const textoTodo = leerDisco(path.join(raiz, ...RUTA_TODO.split('/')));
  if (textoTodo === null) {
    bloques.push([tituloTodo, `no hay ${RUTA_TODO}`]);
  } else {
    const t = limpiar(textoTodo);
    const cab = todo.cabecera(t, B.cabeceraTodo);
    if (cab !== todo.cabecera(t, Infinity)) cortes.push({ que: 'el TODO', ruta: RUTA_TODO });
    bloques.push([tituloTodo].concat(cab ? cab.split('\n') : [`nada abierto en ${todo.EMOJI.rojo} ni ${todo.EMOJI.naranja}`]));
  }

  // 8 · git
  if (gitOk) bloques.push(['=== git ==='].concat(bloqueGit({ raiz, pest, rv })));

  // 9 · el recordatorio de /inicio
  bloques.push([RECORDATORIO]);

  // 10 · lo propio, con lo que sobre: lo primero que se recorta
  const unir = (bs) => bs.map((b) => b.join('\n')).join('\n\n');
  let cuerpo = unir(bloques);
  const lp = lineasPropio(typeof opciones.propio === 'function' ? opciones.propio() : opciones.propio);
  // Con plazo, el renglón de "arranque lento" puede aparecer: su lugar sale de lo que sobra (lo propio), no de un bloque.
  const reservaLento = Number.isFinite(git.plazoRestante()) || sinTiempo() ? LENTO_MAX : 0;
  if (lp) {
    const tituloPropio = `=== lo propio (${RUTA_PROPIO}) ===`;
    const corteProp = { que: 'lo propio', ruta: RUTA_PROPIO };
    // Se reserva la línea CORTADO como si lo propio también se cortara (la más larga posible).
    const reserva = lineaCortado(cortes.concat([corteProp])).length + 1;
    const lugar = PRESUPUESTO - cuerpo.length - 2 - tituloPropio.length - 1 - reserva - 1 - HUELLA_MAX - reservaLento;
    const c = cortarRenglones(lp, lugar, () => `… (CORTADO: lo propio sigue en ${RUTA_PROPIO})`);
    if (c.cortado) cortes.push(corteProp);
    if (c.lineas.length) cuerpo += '\n\n' + [tituloPropio].concat(c.lineas).join('\n');
  }

  // 1 · CORTADO arriba · "arranque lento" · 11 · la huella abajo
  let prefijo = (cortes.length ? lineaCortado(cortes) + '\n' : '') + cuerpo + '\n';
  const nLentas = git.salteadasPorPlazo(); // la cuenta del hook entero, desde que fijó el plazo (lo propio incluido)
  const lento = nLentas > 0 ? lineaLento(nLentas) + '\n' : '';
  // Red de seguridad: nunca más que el presupuesto (no debería pasar: cada bloque tiene su tope). El renglón lento no se corta.
  if (prefijo.length + lento.length + HUELLA_MAX > PRESUPUESTO) {
    const l = prefijo.slice(0, -1).split('\n');
    const c = cortarRenglones(l, PRESUPUESTO - HUELLA_MAX - lento.length - 1, () => '… (CORTADO: el final)');
    prefijo = c.lineas.join('\n') + '\n';
  }
  prefijo += lento;
  const n = prefijo.length;
  return { texto: prefijo + huella(n), n, cortes };
}

module.exports = {
  RUTA_HANDOFF,
  RUTA_TODO,
  RUTA_PROPIO,
  CARPETA_MODULOS,
  TIEMPO_BLAME,
  RECORDATORIO,
  SIN_FICHA,
  GIT_SIN_TIEMPO,
  FICHA_SIN_TIEMPO,
  BLOQUE_SIN_TIEMPO,
  LENTO_MAX,
  lineaLento,
  miles,
  huella,
  cortarRenglones,
  datosFichaModulo,
  armar,
};
