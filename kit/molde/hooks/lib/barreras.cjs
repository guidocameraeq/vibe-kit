'use strict';
// barreras.cjs — candado:barreras (SPEC-0 P4.6 y P6.1; SPEC-paquete-2 "D2.2 — AGREGA" P6.1 y el bloque F4; red team rondas 1 a 5):
// ningún commit toca un freno sin el `aprobado` sellado del dueño que lo nombre. Lo corre scripts/estructura.cjs (vía candado.cjs).
// Vive bajo .claude/hooks/** a propósito: su lógica es barrera (r4-3).
//
// Qué mira: el rango de la sesión (rango()) commit por commit, y lo pendiente (índice y disco) como un commit más.
// Por commit: las barreras que toca, POR ARCHIVO (las categorías y los ids de cambios.cjs: categoriaDe, idsFicha, idsSettings),
// menos lo que cubre una exención; lo que queda lo tiene que cubrir la unión de los cambios válidos (toca ⊇ categorías, ids ⊇ ids).
// Cambio válido para un commit X: 3-barrera con el sello en orden (cambios.validar + cambios.validarSello, las reglas de verificar),
// sello anterior a X, y X es el PRIMER commit después del sello que toca su `toca` (un aprobado = un commit); con `aplicado`, además,
// su `sha` es X (r5-1: reapuntar el sha no tapa otro commit).
// Exenciones, solo dos: (a) con --molde, el archivo sin su zona propia es igual al del molde (el settings, regla por regla); (b) el
// commit que crea la ficha por primera vez, con frenos, sensible y autorizado iguales a la fábrica del nivel EN EL ÁRBOL DEL PADRE.
// Node estándar, cero dependencias. Es .cjs a propósito: corre igual en proyectos con "type": "module".

const fs = require('fs');
const path = require('path');
const git = require('./git.cjs');
const contexto = require('./contexto.cjs');
const ficha = require('./ficha.cjs');
const C = require('./cambios.cjs');
const zona = require('./zona-propia.cjs');
const { NIVELES } = require('./fabrica.cjs');

const ID = 'candado:barreras';
const PENDIENTE = 'pendiente';
// La base de scripts/todo.cjs: el último commit que tocó el handoff (el cierre anterior). todo.cjs no la exporta: es este git log.
const RUTA_HANDOFF = 'docs/SESSION_HANDOFF.md';
// Las fichas de fábrica, como quedan instanciadas (kit/molde/hooks/lib/fabrica/ → .claude/hooks/lib/fabrica/; F1).
const CARPETA_FABRICA = '.claude/hooks/lib/fabrica';
// La ficha del padre rota: se compara contra la última que se lee, hasta tantos commits atrás.
const ATRAS = 20;

const esMapa = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const aTexto = (b) => (b == null ? null : Buffer.isBuffer(b) ? b.toString('utf8') : String(b));
const partirZ = (t) => (t ? t.split('\0').filter((x) => x !== '') : []);
const corto = (sha) => String(sha).slice(0, 12);

// Igualdad de valores JSON: el orden de las claves no importa; el de las listas, sí (la misma de cambios.cjs y zona-propia.cjs).
function canon(v) {
  if (Array.isArray(v)) return `[${v.map(canon).join(',')}]`;
  if (esMapa(v)) return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canon(v[k])}`).join(',')}}`;
  return JSON.stringify(v);
}

// ---------------------------------------------------------------- git

function shaDe(raiz, rev) {
  return git.texto(['rev-parse', '--verify', '-q', `${rev}^{commit}`], { cwd: raiz });
}
function padres(raiz, sha) {
  const t = git.texto(['rev-list', '--parents', '-n', '1', sha], { cwd: raiz });
  return t ? t.split(/\s+/).slice(1) : [];
}
// <rev>:<ruta> como Buffer, o null si no está. rev '' = el índice.
function blob(raiz, rev, rel) {
  const r = git.correr(['cat-file', 'blob', `${rev}:${rel}`], { cwd: raiz });
  return r.ok ? r.salida : null;
}
function esAncestro(raiz, a, b) {
  return git.correr(['merge-base', '--is-ancestor', a, b], { cwd: raiz }).ok;
}
function leerDisco(abs) {
  try {
    const st = fs.lstatSync(abs);
    if (st.isSymbolicLink()) return Buffer.from(fs.readlinkSync(abs), 'utf8');
    if (!st.isFile()) return null;
    return fs.readFileSync(abs);
  } catch (e) {
    return null;
  }
}
function lista(raiz, args) {
  const r = git.correr(args, { cwd: raiz, tiempo: 20000 });
  if (!r.ok) throw new Error(`git ${args[0]} no anduvo`);
  return r;
}

// ---------------------------------------------------------------- el rango

// rango(raiz) → { commits: [sha] (del más viejo al más nuevo), desde, como }. Lo pendiente va siempre aparte.
//  · con remoto: origin/<rama por defecto>..HEAD (los commits anteriores de la sesión no se escapan);
//  · sin remoto, fuera de la rama por defecto: <rama por defecto>..HEAD;
//  · sin remoto, en la rama por defecto: desde la base de todo.cjs (el último commit que tocó el handoff) INCLUIDA (rf-4: si no, un
//    commit que toca el handoff y vacía los deny se lava solo), salvo que la base sea el primer commit del repo o el que creó la
//    ficha (la adopción): ahí, <base>..HEAD (r4-5: si no, el repo recién montado nace trabado);
//  · sin base (o sin rama por defecto, o sin commits): solo lo pendiente (r4-5: si no, el commit que creó el settings da rojo siempre).
function rango(raiz) {
  const head = shaDe(raiz, 'HEAD');
  if (!head) return { commits: [], desde: null, como: 'sin commits: solo lo pendiente' };
  const rv = contexto.refVigente(raiz);
  let desde = null;
  let como;
  if (rv && rv.origen !== 'local') {
    desde = rv.ref;
    como = `origin/${rv.nombre}..HEAD`;
  } else if (rv) {
    if (contexto.rama(raiz) !== rv.nombre) {
      desde = rv.ref;
      como = `${rv.nombre}..HEAD (sin remoto)`;
    } else {
      const base = git.texto(['log', '-1', '--format=%H', '--', RUTA_HANDOFF], { cwd: raiz });
      if (base) {
        const ps = padres(raiz, base);
        if (!ps.length || esAdopcion(raiz, base, ps)) {
          desde = base;
          como = `desde el último cierre, sin él (${ps.length ? 'es el que creó la ficha' : 'es el primer commit'}; sin remoto)`;
        } else {
          desde = ps[0];
          como = 'desde el último cierre, con él (sin remoto)';
        }
      } else como = 'sin remoto y sin base: solo lo pendiente';
    }
  } else como = 'sin rama por defecto: solo lo pendiente';
  if (!desde) return { commits: [], desde: null, como };
  const r = lista(raiz, ['rev-list', '--reverse', '--topo-order', `${desde}..HEAD`]);
  return { commits: r.stdout.split('\n').map((s) => s.trim()).filter(Boolean), desde, como };
}

// ¿<sha> es el commit que creó la ficha (la adopción)? La tiene, ninguno de sus padres la tiene y ningún commit anterior la tocó
// (borrada y vuelta a crear no es la adopción: ese commit sí se juzga).
function esAdopcion(raiz, sha, ps) {
  const R = contexto.RUTA_FICHA;
  if (blob(raiz, sha, R) === null || ps.some((p) => blob(raiz, p, R) !== null)) return false;
  const t = git.texto(['rev-list', '--full-history', '-n', '2', sha, '--', R], { cwd: raiz });
  return t !== null && t.split('\n').filter(Boolean).every((x) => x === sha);
}

// ¿La ficha está en algún lado? En el disco, el índice, HEAD, la ficha vigente o el padre de algún commit del rango (r4-2:
// borrarla no apaga el candado). Sin ninguna, el candado entero está apagado.
function fichaEnAlgunLado(raiz) {
  const R = contexto.RUTA_FICHA;
  if (fs.existsSync(path.join(raiz, ...R.split('/')))) return true;
  if (blob(raiz, '', R) !== null) return true;
  if (shaDe(raiz, 'HEAD') && blob(raiz, 'HEAD', R) !== null) return true;
  const rv = contexto.refVigente(raiz);
  if (rv && blob(raiz, rv.ref, R) !== null) return true;
  for (const c of rango(raiz).commits) for (const p of padres(raiz, c)) if (blob(raiz, p, R) !== null) return true;
  return false;
}

// ---------------------------------------------------------------- qué toca cada archivo

// Los archivos de barrera que cambian en un commit o en lo pendiente (índice y disco contra HEAD, sin lo ignorado salvo lo de
// barrera, rf-6 b): [{ rel, cat, antes: Buffer|null, despues: [Buffer|null], padre: sha|null, padres? }]. Es la misma enumeración
// que hace cambios.toca por dentro (rutasPendientes, rutasContra), con categoriaDe de cambios.cjs; acá, archivo por archivo.
// Un merge (rf-3): solo las rutas que difieren de TODOS sus padres (la semántica de git diff-tree --cc), con `padres` = el antes
// de cada uno; `padre` y `antes` son los del primero (las exenciones). Lo que trae la rama lo juzgan sus commits, uno por uno.
function archivosDe(raiz, cual) {
  let rutas;
  let padre;
  let ps = [];
  let despuesDe;
  if (cual === PENDIENTE) {
    padre = shaDe(raiz, 'HEAD');
    rutas = C.rutasPendientes(raiz, padre);
    despuesDe = (rel) => [blob(raiz, '', rel), leerDisco(path.join(raiz, ...rel.split('/')))];
  } else {
    ps = padres(raiz, cual);
    padre = ps.length ? ps[0] : null;
    rutas = C.rutasContra(raiz, cual, padre);
    for (const otro of ps.slice(1)) {
      const s = new Set(C.rutasContra(raiz, cual, otro));
      rutas = rutas.filter((r) => s.has(r));
    }
    despuesDe = (rel) => [blob(raiz, cual, rel)];
  }
  return rutas
    .sort()
    .map((rel) => ({ rel, cat: C.categoriaDe(rel) }))
    .filter((f) => f.cat)
    .map((f) => {
      const e = { ...f, padre, antes: padre ? blob(raiz, padre, f.rel) : null, despues: despuesDe(f.rel) };
      if (ps.length > 1) e.padres = ps.map((p, i) => ({ sha: p, antes: i === 0 ? e.antes : blob(raiz, p, f.rel) }));
      return e;
    });
}

// Las versiones de después que cambian algo: una igual a la del padre (en lo pendiente, el índice sin tocar es HEAD, o el archivo
// nuevo que está solo en el disco no está en el índice) no cambió nada y no se juzga.
const igual = (a, b) => (a === null || b === null ? a === b : Buffer.compare(Buffer.from(a), Buffer.from(b)) === 0);
const nuevas = (f) => f.despues.filter((d) => !igual(d, f.antes));

function leerFicha(b) {
  const t = aTexto(b);
  if (t === null) return null;
  try {
    return { datos: ficha.leer(t).datos };
  } catch (e) {
    return { rota: true };
  }
}

// La última ficha que se lee yendo para atrás desde <rev> (hasta ATRAS commits que la tocaron): { sha, texto } o null.
function ultimaFichaQueSeLee(raiz, rev) {
  const t = git.texto(['rev-list', '-n', String(ATRAS), rev, '--', contexto.RUTA_FICHA], { cwd: raiz });
  for (const sha of (t || '').split('\n').filter(Boolean)) {
    const b = blob(raiz, sha, contexto.RUTA_FICHA);
    const l = leerFicha(b);
    if (l && !l.rota) return { sha, texto: b };
  }
  return null;
}

// Lo que toca UN archivo contra UN padre (f.padre, f.antes): { pares: Set de categoría·id, imposible: texto | null }.
function tocaContraUno(raiz, f) {
  let imposible = null;
  if (f.cat === 'ficha') {
    let antes = f.antes;
    const a = leerFicha(antes);
    if (a && a.rota) {
      // La ficha del padre rota: se compara contra la última que se lee (F4); si no hay ninguna, rojo.
      const u = f.padre ? ultimaFichaQueSeLee(raiz, f.padre) : null;
      if (u) antes = u.texto;
      else imposible = `la ficha del padre está rota y no hay una anterior que se lea (${ATRAS} commits atrás)`;
    }
    return { pares: C.paresArchivo('ficha', f.rel, antes, nuevas(f)), imposible };
  }
  if (f.cat === 'settings') return { pares: C.paresArchivo('settings', f.rel, f.antes, f.despues), imposible };
  return { pares: C.paresArchivo(f.cat, f.rel, null, []), imposible };
}

// Lo que toca UN archivo: { cats: Set, ids: Set, imposible: texto | null }. imposible = rojo que ningún cambio cubre.
// En un merge (rf-3): los pares que cambian contra cada padre, intersecados (lo que el merge mismo introduce). Un padre cuya
// ficha no se lee no achica nada (vale como "todo"); si no se lee la de ninguno, imposible.
function tocaArchivo(raiz, f) {
  const lados = (f.padres || [{ sha: f.padre, antes: f.antes }]).map((p) => tocaContraUno(raiz, { ...f, padre: p.sha, antes: p.antes }));
  const sanos = lados.filter((l) => !l.imposible);
  const r = C.desdePares(C.interseccion((sanos.length ? sanos : lados).map((l) => l.pares)));
  return { cats: new Set(r.categorias), ids: new Set(r.ids), imposible: sanos.length ? null : lados[0].imposible };
}

// ---------------------------------------------------------------- exención (b): la ficha nace con los valores de fábrica

// Los commits que tocaron la ficha en la historia de la rama por defecto (la vigente y la local) y de HEAD. Una vez por corrida.
function tocaronLaFicha(raiz, memo) {
  if (!memo.tocaron) {
    const refs = ['HEAD'];
    const rv = contexto.refVigente(raiz);
    if (rv) refs.push(rv.ref);
    const rl = C.ramaLocal(raiz);
    if (rl && !refs.includes(rl.ref)) refs.push(rl.ref);
    const t = shaDe(raiz, 'HEAD') ? lista(raiz, ['log', '--full-history', '--format=%H', ...refs, '--', contexto.RUTA_FICHA]).stdout : '';
    memo.tocaron = [...new Set(t.split('\n').map((s) => s.trim()).filter(Boolean))];
  }
  return memo.tocaron;
}

// ¿La ficha existió antes de <cual>? Algún commit que la tocó y no es <cual> ni posterior a él (r4-2: (b) solo la primera vez).
function fichaExistioAntes(raiz, cual, memo) {
  const t = tocaronLaFicha(raiz, memo);
  if (cual === PENDIENTE) return t.length > 0;
  return t.some((y) => y !== cual && !esAncestro(raiz, cual, y));
}

// (b): el archivo es la ficha, el padre no la tenía, nunca existió antes, y cada versión nueva trae frenos, sensible y autorizado
// iguales a los de ficha.<nivel>.md DEL ÁRBOL DEL PADRE (si el padre no la tiene, no hay exención: la del commit se certificaría sola).
function exencionB(raiz, f, cual, memo) {
  if (f.cat !== 'ficha' || f.antes !== null || !f.padre) return false;
  if (fichaExistioAntes(raiz, cual, memo)) return false;
  for (const d of nuevas(f)) {
    const l = leerFicha(d);
    if (!l || l.rota || !NIVELES.includes(l.datos.nivel)) return false;
    const fab = leerFicha(blob(raiz, f.padre, `${CARPETA_FABRICA}/ficha.${l.datos.nivel}.md`));
    if (!fab || fab.rota) return false;
    for (const k of ['frenos', 'sensible', 'autorizado']) if (canon(l.datos[k]) !== canon(fab.datos[k])) return false;
  }
  return true;
}

// ---------------------------------------------------------------- exención (a): el commit del actualizador, contra un molde de afuera

// La ruta de un archivo de barrera en el molde (Cómo se instancia el molde, al revés). githooks y gitleaks todavía no están en el
// molde (orden 3): se buscan en githooks/** y en la raíz del molde; si no están, no hay exención para ellos.
function rutaEnMolde(rel) {
  const r = String(rel).replace(/\\/g, '/');
  const m = r.toLowerCase();
  if (m.startsWith('.claude/hooks/')) return `hooks/${r.slice('.claude/hooks/'.length)}`;
  if (m.startsWith('.claude/scripts/')) return `scripts/${r.slice('.claude/scripts/'.length)}`;
  if (/^\.claude\/settings[^/]*\.json$/.test(m)) return r.slice('.claude/'.length);
  if (m.startsWith('.githooks/')) return `githooks/${r.slice('.githooks/'.length)}`;
  if (m === '.gitleaksignore' || m === '.gitleaks.toml') return r;
  return null;
}

// Lo de adentro de las zonas propias de un texto, o null si una marca está rota.
function contenidoZonas(b) {
  const z = zona.zonas(aTexto(b));
  return z.ok ? z.zonas.map((x) => x.contenido) : null;
}

// Un texto (hook, script, githook, gitleaks): sin su zona propia igual al del molde, y la zona propia igual a la de antes
// (si el archivo es nuevo, a la del molde). Un hermano .propio.sh es lo propio del hook: tocarlo nunca es el molde.
function textoComoElMolde(f, d, m) {
  if (/\.propio\.sh$/i.test(f.rel)) return false;
  if (d === null) return m === null; // un hook viejo borrado vale si el molde nuevo tampoco lo trae
  if (m === null) return false;
  if (zona.hashPieza(d) !== zona.hashPieza(m)) return false;
  const zd = contenidoZonas(d);
  const zr = contenidoZonas(f.antes !== null ? f.antes : m);
  return zd !== null && zr !== null && canon(zd) === canon(zr);
}

// Las reglas de un settings por id: Map(id → canon de lo que dice).
function reglasPorId(valor) {
  const m = new Map();
  for (const r of zona.reglas(valor)) {
    const c = r.tipo === 'hook' ? canon(r.entrada) : r.texto;
    m.set(r.id, m.has(r.id) ? `${m.get(r.id)}\n${c}` : c);
  }
  for (const [k, v] of m) m.set(k, v.split('\n').sort().join('\n'));
  return m;
}
const leerJson = (b) => {
  const t = aTexto(b);
  if (t === null) return { valor: null };
  const r = zona.leerJsonSinDuplicados(t);
  return r.ok && esMapa(r.valor) ? { valor: r.valor } : { roto: true };
};

// Un settings molde+propio (criterio 20): regla por regla, lo del molde está igual (salvo lo quitado, que queda como estaba o como
// el molde), lo propio (lo que el molde nuevo no trae) quedó igual que antes, y cada otra clave es la de antes o la del molde.
// Elegido lo que frena: una regla del molde viejo que el nuevo retira cuenta como "lo propio cambió" (sin el molde viejo no se
// distingue de una regla del proyecto): ese commit no pasa por (a).
function settingsComoElMolde(f, d, m, quitados) {
  if (d === null) return m === null;
  if (m === null) return false;
  const D = leerJson(d);
  const M = leerJson(m);
  const A = f.antes === null ? { valor: {} } : leerJson(f.antes);
  if (D.roto || M.roto || A.roto || !D.valor || !M.valor) return false;
  const rd = reglasPorId(D.valor);
  const rm = reglasPorId(M.valor);
  const ra = reglasPorId(A.valor);
  for (const id of new Set([...rd.keys(), ...rm.keys(), ...ra.keys()])) {
    const vd = rd.get(id);
    if (rm.has(id)) {
      if (quitados.has(id) ? vd !== ra.get(id) && vd !== rm.get(id) : vd !== rm.get(id)) return false;
    } else if (vd !== ra.get(id)) return false;
  }
  // Las demás claves (y las de permissions que no son allow, ask ni deny): la de antes o la del molde.
  const claves = (o, sub) => (esMapa(o) ? Object.keys(o).filter((k) => (sub ? !['allow', 'ask', 'deny'].includes(k) : k !== 'hooks')) : []);
  const otra = (vd, va, vm) => canon(vd) === canon(va) || canon(vd) === canon(vm);
  for (const k of new Set([...claves(D.valor), ...claves(M.valor), ...claves(A.valor)])) {
    if (k === 'permissions' && [D, M, A].every((x) => x.valor[k] === undefined || esMapa(x.valor[k]))) {
      const pd = D.valor[k] || {};
      const pm = M.valor[k] || {};
      const pa = A.valor[k] || {};
      for (const j of new Set([...claves(pd, true), ...claves(pm, true), ...claves(pa, true)])) if (!otra(pd[j], pa[j], pm[j])) return false;
      continue;
    }
    if (!otra(D.valor[k], A.valor[k], M.valor[k])) return false;
  }
  return true;
}

// Los frenos quitados (ids normalizados) de la ficha que deja el commit (lo pendiente: la del disco, o la del índice).
function quitadosDe(raiz, cual) {
  const R = contexto.RUTA_FICHA;
  const b = cual === PENDIENTE ? leerDisco(path.join(raiz, ...R.split('/'))) || blob(raiz, '', R) : blob(raiz, cual, R);
  const l = leerFicha(b);
  const q = l && !l.rota && esMapa(l.datos.frenos) && Array.isArray(l.datos.frenos.quitados) ? l.datos.frenos.quitados : [];
  return new Set(q.map((x) => (esMapa(x) ? x.id : x)).filter((x) => typeof x === 'string').map(zona.normalizarId));
}

// (a): solo con --molde. La ficha no se compara contra el molde: lo que se le exige (frenos, sensible y autorizado iguales, y
// nivel y las dos piezas sin aflojar) ya es lo que miden sus ids; si cambia algo de eso, cuenta y lo tiene que cubrir un cambio.
function exencionA(raiz, f, cual, molde, memo) {
  if (!molde || f.cat === 'ficha') return false;
  const enMolde = rutaEnMolde(f.rel);
  if (!enMolde) return false;
  const m = leerDisco(path.join(molde, ...enMolde.split('/')));
  if (f.cat === 'settings') {
    if (!memo.quitados) memo.quitados = new Map();
    if (!memo.quitados.has(cual)) memo.quitados.set(cual, quitadosDe(raiz, cual));
    return nuevas(f).every((d) => settingsComoElMolde(f, d, m, memo.quitados.get(cual)));
  }
  return nuevas(f).every((d) => textoComoElMolde(f, d, m));
}

// ---------------------------------------------------------------- los cambios válidos y a qué commit cubren

// Los 3-barrera aprobados o aplicados con el sello en orden (las reglas de verificar: validar y validarSello). Una vez por corrida.
function cambiosValidos(raiz, memo) {
  if (!memo.validos) {
    const rama = C.ramaLocal(raiz);
    memo.validos = [];
    for (const a of C.listarArchivos(raiz)) {
      if (!a.id) continue;
      const c = C.cargar(a);
      if (c.error) continue;
      const d = c.datos;
      if (d.clase !== '3-barrera' || (d.estado !== 'aprobado' && d.estado !== 'aplicado')) continue;
      if (C.validar(d, c.cuerpo).length) continue;
      const v = C.validarSello(raiz, c, rama);
      if (v.fallas.length || !v.sello) continue;
      memo.validos.push({
        id: c.id,
        estado: d.estado,
        sha: d.sha || null,
        sello: v.sello,
        toca: d.toca.slice(),
        ids: new Set((Array.isArray(d.ids) ? d.ids : []).map(zona.normalizarId)),
      });
    }
  }
  return memo.validos;
}

function primero(raiz, desde, hasta, toca, memo) {
  if (!memo.primeros) memo.primeros = new Map();
  const k = `${desde}|${hasta}|${toca.join(',')}`;
  if (!memo.primeros.has(k)) memo.primeros.set(k, C.primerQueToca(raiz, desde, hasta, toca));
  return memo.primeros.get(k);
}

// ¿El cambio cubre a <cual>? Un aprobado, el primer commit después del sello que toca su `toca` (lo pendiente: si todavía ninguno
// lo tocó); un aplicado, solo el commit de su sha, y solo si ese es el primero (r5-1).
function cubre(raiz, c, cual, memo) {
  if (cual === PENDIENTE) {
    if (c.estado !== 'aprobado') return false;
    const head = shaDe(raiz, 'HEAD');
    return !!head && esAncestro(raiz, c.sello, head) && primero(raiz, c.sello, head, c.toca, memo) === null;
  }
  if (cual === c.sello || !esAncestro(raiz, c.sello, cual)) return false;
  if (c.estado === 'aplicado' && c.sha !== cual) return false;
  return primero(raiz, c.sello, cual, c.toca, memo) === cual;
}

// ---------------------------------------------------------------- revisar

const sinPunto = (s) => String(s).replace(/·/g, '-');
function listaCorta(xs, n = 4) {
  const v = xs.map(sinPunto);
  return v.length > n ? `${v.slice(0, n).join(', ')} y ${v.length - n} más` : v.join(', ');
}

// Lo que un commit (o lo pendiente) necesita que lo cubra: { cats, ids, imposibles, primerArchivo } después de las exenciones.
function lo(raiz, cual, opciones, memo) {
  const cats = new Set();
  const ids = new Set();
  const imposibles = [];
  let primerArchivo = null;
  const archivos = archivosDe(raiz, cual);
  if (!archivos.length) return { cats, ids, imposibles, primerArchivo };
  // Fuera del alcance: un commit de antes de adoptar el kit (la ficha nunca existió antes y él no la toca) no tenía candado.
  if (!archivos.some((f) => f.cat === 'ficha') && !fichaExistioAntes(raiz, cual, memo)) return { cats, ids, imposibles, primerArchivo };
  for (const f of archivos) {
    const t = tocaArchivo(raiz, f);
    if (!t.cats.size && !t.ids.size && !t.imposible) continue;
    if (!t.imposible && (exencionB(raiz, f, cual, memo) || exencionA(raiz, f, cual, opciones.molde, memo))) continue;
    if (t.imposible) imposibles.push(t.imposible);
    t.cats.forEach((x) => cats.add(x));
    t.ids.forEach((x) => ids.add(x));
    if (primerArchivo === null) primerArchivo = f.rel;
  }
  return { cats, ids, imposibles, primerArchivo };
}

// ---------------------------------------------------------------- lo de esta PC que el candado no veía (rf-6)

// (a) Un archivo de barrera con la marca skip-worktree (S en `git ls-files -v`) o assume-unchanged (letra minúscula): git deja de
// mirar el disco y lo pendiente no lo ve. Ningún aprobado cubre una marca: se saca.
function marcasOcultas(raiz) {
  const fallas = [];
  for (const e of partirZ(lista(raiz, ['ls-files', '-v', '-z']).stdout)) {
    const tag = e[0];
    const rel = e.slice(2);
    if (!C.categoriaDe(rel)) continue;
    const skip = tag === 'S' || tag === 's';
    const assume = tag !== tag.toUpperCase();
    if (!skip && !assume) continue;
    const marca = [skip && 'skip-worktree', assume && 'assume-unchanged'].filter(Boolean).join(' y ');
    const sacar = [skip && `git update-index --no-skip-worktree ${rel}`, assume && `git update-index --no-assume-unchanged ${rel}`].filter(Boolean).join(' y ');
    fallas.push({ id: ID, commit: PENDIENTE, detalle: rel, que: `${rel} tiene la marca ${marca}: git no mira lo que cambia en el disco y el candado tampoco`, hacer: `sacale la marca: ${sacar}` });
  }
  return fallas;
}

// (c) .claude/settings.local.json (ignorado: es de esta PC) con disableAllHooks o hooks apaga o cambia los frenos sin pasar por un
// aprobado. permissions y env no se juzgan (los escribe Claude Code). Si no está ignorado, lo juzga lo pendiente como a cualquier settings.
const RUTA_SETTINGS_LOCAL = '.claude/settings.local.json';
const CLAVES_LOCALES = ['disableAllHooks', 'hooks'];
function settingsLocal(raiz) {
  const b = leerDisco(path.join(raiz, ...RUTA_SETTINGS_LOCAL.split('/')));
  if (b === null) return [];
  if (!git.correr(['check-ignore', '-q', '--', RUTA_SETTINGS_LOCAL], { cwd: raiz }).ok) return [];
  const sale = (que, hacer) => [{ id: ID, commit: PENDIENTE, detalle: RUTA_SETTINGS_LOCAL, que, hacer }];
  const r = zona.leerJsonSinDuplicados(aTexto(b));
  // Lo que no se lee (o trae claves repetidas, que JSON.parse esconde) no se puede juzgar: frena.
  if (!r.ok || !esMapa(r.valor)) return sale(`${RUTA_SETTINGS_LOCAL} no se lee como JSON sin claves repetidas`, 'arreglalo o borralo: así no se sabe si apaga los frenos');
  const malas = CLAVES_LOCALES.filter((k) => Object.prototype.hasOwnProperty.call(r.valor, k));
  if (!malas.length) return [];
  return sale(`${RUTA_SETTINGS_LOCAL} trae la clave ${malas.join(' y ')}`, 'sacá esa clave: apaga o cambia los frenos en esta PC sin pasar por un aprobado');
}

// revisarBarreras(raiz, {molde}) → [{ id: 'candado:barreras', que, hacer, detalle, commit }]. Vacía = en orden.
// molde: carpeta ABSOLUTA del molde de afuera (exención a); sin ella, no hay exención (a). Tira si git no puede.
function revisarBarreras(raiz, opciones = {}) {
  const memo = {};
  const fallas = [...marcasOcultas(raiz), ...settingsLocal(raiz)];
  const r = rango(raiz);
  for (const cual of [...r.commits, PENDIENTE]) {
    const n = lo(raiz, cual, opciones, memo);
    if (!n.cats.size && !n.ids.size && !n.imposibles.length) continue;
    const quien = cual === PENDIENTE ? 'lo que está por commitearse' : `el commit ${corto(cual)}`;
    const detalle = n.primerArchivo || contexto.RUTA_FICHA;
    if (n.imposibles.length) {
      fallas.push({ id: ID, commit: cual, detalle, que: `${quien}: ${n.imposibles[0]}`, hacer: 'arreglá la ficha (corré doctor): ningún aprobado cubre lo que no se puede leer' });
      continue;
    }
    const validos = cambiosValidos(raiz, memo).filter((c) => cubre(raiz, c, cual, memo));
    const toca = new Set(validos.flatMap((c) => c.toca));
    const cubiertos = new Set(validos.flatMap((c) => [...c.ids]));
    const faltanCats = [...n.cats].filter((x) => !toca.has(x)).sort();
    const faltanIds = [...n.ids].filter((x) => !cubiertos.has(x)).sort();
    if (!faltanCats.length && !faltanIds.length) continue;
    const que = validos.length
      ? `${quien} toca ${listaCorta([...n.cats].sort())} y los aprobados que lo cubren no nombran ${listaCorta(faltanCats.length ? faltanCats : faltanIds)}`
      : `${quien} toca ${listaCorta([...n.cats].sort())} (${listaCorta(faltanIds)}) sin un aprobado sellado que lo cubra`;
    const hacer =
      cual === PENDIENTE
        ? 'proponelo con cambios nuevo (3-barrera, un --id por cada uno) y que el dueño lo apruebe con cambios aprobar antes de commitear; o sacalo'
        : 'proponé el cambio (cambios nuevo), que el dueño lo apruebe (cambios aprobar) y rehacé ese commit después del sello; o revertilo';
    fallas.push({ id: ID, commit: cual, detalle, que, hacer });
  }
  return fallas;
}

module.exports = {
  ID,
  PENDIENTE,
  RUTA_HANDOFF,
  CARPETA_FABRICA,
  RUTA_SETTINGS_LOCAL,
  rango,
  esAdopcion,
  marcasOcultas,
  settingsLocal,
  fichaEnAlgunLado,
  archivosDe,
  tocaArchivo,
  ultimaFichaQueSeLee,
  rutaEnMolde,
  revisarBarreras,
};
