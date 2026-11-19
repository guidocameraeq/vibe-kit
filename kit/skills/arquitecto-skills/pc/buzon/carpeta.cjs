'use strict';
// carpeta.cjs — el estado del buzón visto desde esta PC (SPEC-G1-buzon: `buzon.cjs`, "La configuración de la PC", `verificar`,
// el protocolo 2, 7 y 8, y D1-D3). Lee la carpeta (nunca escribe ahí: eso lo hacen los verbos), arma el índice local y verifica.
//
// ctx = contexto(...) trae todo lo que hace falta y lo que las pruebas inyectan: home, la config, `duenos` (dir, nombres, {enHook})
// → Map nombre → cuenta|null, `ahora`, `hastaMs` (el plazo del hook) y `enHook` (en el hook: dir /q y caché de dueños; fuera,
// siempre sobre el original, con PowerShell para lo que dir /q no resolvió).
const fs = require('fs');
const os = require('os');
const path = require('path');
const P = require('./protocolo.cjs');
const D = require('./dueno.cjs');

const dirConfig = (home) => path.join(home, '.config', 'kit-buzon');
const ENTRADAS_PERSONA = new Set(['cli', 'claude-desktop', 'claude-vscode']);
const TOPE_AUTO = 3;
const QUIETA_DIAS = 14;
const MARGEN_MS = 60;

// ---------------------------------------------------------------- la configuración
const esMapa = (x) => x && typeof x === 'object' && !Array.isArray(x);
// → { config } | { sinConfig: true } | { error }
function cargarConfig(home) {
  const ruta = path.join(dirConfig(home), 'config.json');
  if (!fs.existsSync(ruta)) return { sinConfig: true };
  const j = P.leerJson(ruta);
  const c = j && j.valor;
  if (!esMapa(c) || c.protocolo !== 1) return { error: 'config.json no se lee (volvé a registrarte en el buzón)' };
  if (typeof c.carpeta !== 'string' || !path.isAbsolute(c.carpeta)) return { error: 'config.json: la carpeta no es una ruta absoluta' };
  if (!P.personaOk(c.persona)) return { error: 'config.json: la persona no cumple el patrón' };
  const agentes = (Array.isArray(c.agentes) ? c.agentes : [])
    .filter((a) => esMapa(a) && P.esIdV1(a.id) && typeof a.repo === 'string' && a.repo)
    .map((a) => ({ id: a.id, repo: a.repo, antes: (Array.isArray(a.antes) ? a.antes : []).filter(P.esIdV0) }));
  return {
    config: {
      protocolo: 1,
      carpeta: c.carpeta,
      persona: c.persona,
      cuenta: typeof c.cuenta === 'string' ? c.cuenta : null,
      compartida: c.compartida !== false,
      agentes,
      contestar_solo: c.contestar_solo === true,
    },
  };
}

function contexto({ home = os.homedir(), duenos = D.duenos, ahora = Date.now(), hastaMs = Infinity, enHook = false, git, env = process.env } = {}) {
  const c = cargarConfig(home);
  if (!c.config) return c;
  return { home, cfgDir: dirConfig(home), config: c.config, carpeta: c.config.carpeta, duenos, ahora, hastaMs, enHook, git, env };
}
const queda = (ctx) => ctx.hastaMs - Date.now();
const apagado = (ctx) => fs.existsSync(path.join(ctx.cfgDir, 'apagado'));

// ---------------------------------------------------------------- el índice local (la "copia local" de §4.1.7)
function leerIndice(ctx) {
  const j = P.leerJson(path.join(ctx.cfgDir, 'indice.json'));
  const v = j && j.valor;
  if (!esMapa(v) || v.protocolo !== 1 || v.carpeta !== ctx.carpeta) return { protocolo: 1, carpeta: ctx.carpeta, sig: 0, convs: {}, msgs: {}, duenos: {}, regs: {} };
  for (const k of ['convs', 'msgs', 'duenos', 'regs']) if (!esMapa(v[k])) v[k] = {};
  if (!Number.isInteger(v.sig)) v.sig = 0;
  return v;
}
function guardarIndice(ctx, idx) {
  try {
    fs.mkdirSync(ctx.cfgDir, { recursive: true });
    const ruta = path.join(ctx.cfgDir, 'indice.json');
    const tmp = `${ruta}.${process.pid}-${P.hex4()}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(idx));
    fs.renameSync(tmp, ruta);
  } catch (e) {
    /* el índice es una comodidad: sin él, la próxima corrida lee de nuevo */
  }
}

// Dueños de archivos que pueden cambiar (registros, altas, leidos). En el hook, con caché por (tamaño, mtime, huella); fuera del
// hook, siempre sobre el original.
function duenosDe(ctx, idx, relDir, archivos) {
  const abs = path.join(ctx.carpeta, ...relDir.split('/'));
  const out = new Map();
  const faltan = [];
  for (const a of archivos) {
    const c = idx.duenos[`${relDir}/${a.nombre}`];
    if (ctx.enHook && c && c.s === a.s && c.t === a.t && c.h === a.h && c.c) out.set(a.nombre, c.c);
    else faltan.push(a.nombre);
  }
  if (faltan.length && (!ctx.enHook || queda(ctx) > 400)) {
    const m = ctx.duenos(abs, faltan, { enHook: ctx.enHook });
    for (const a of archivos) {
      if (!faltan.includes(a.nombre)) continue;
      const cuenta = m.get(a.nombre) || null;
      out.set(a.nombre, cuenta);
      if (cuenta) idx.duenos[`${relDir}/${a.nombre}`] = { s: a.s, t: a.t, h: a.h, c: cuenta };
    }
  }
  return out;
}
// Lee los .json de una carpeta: [{ nombre, s, t, h, valor }]
function jsonsDe(abs, filtro = () => true) {
  let ents;
  try {
    ents = fs.readdirSync(abs, { withFileTypes: true });
  } catch (e) {
    return null;
  }
  const out = [];
  for (const e of ents) {
    if (!e.isFile() || !e.name.endsWith('.json') || !P.nombreOk(e.name) || !filtro(e.name)) continue;
    const p = path.join(abs, e.name);
    try {
      const st = fs.statSync(p);
      const bytes = fs.readFileSync(p);
      out.push({ nombre: e.name, s: st.size, t: Math.round(st.mtimeMs), h: P.huella(bytes), valor: P.parsear(bytes) });
    } catch (e2) {
      /* se fue entre listar y leer */
    }
  }
  return out;
}

// ---------------------------------------------------------------- los registros (protocolo 2; D3)
const lista = (x) => (Array.isArray(x) ? x.filter((y) => typeof y === 'string') : []);
const RE_REGISTRO = /^registro(-[A-Za-z0-9.-]+)?\.json$/;
const RE_ALTA = /^alta-\d{8}T\d{6}Z-[0-9a-f]{4}\.json$/;

// → { v0: Map idV0 → { dueno, datos }, v1: Map idV1 → agente, deV0: Map idV0 → idV1 (los mudados), avisos: [] }
// agente: { id, valido, disputa, cuentas: [], compartida, antes: [], archivo }
//
// La reserva y la disputa (red team de la construcción, 1 y 2): el índice local recuerda, POR ID, la primera cuenta dueña que vio
// (de un registro v1 y de un registro v0). Un registro de otra cuenta que aparece después, el recordado que desaparece y vuelve
// con otra, o dos cuentas a la vez → disputa, que **nunca se resuelve sola** (ni por fecha, que la escribe cualquiera, ni por un
// `antes`, que cualquiera puede armarse con un registro v0 propio). La resuelve la persona de cada PC: `registrar --resolver`
// fija en el índice de esa PC qué cuenta vale para ese id.
function registros(ctx, idx) {
  const avisos = [];
  const base = path.join(ctx.carpeta, 'agentes');
  const v0 = new Map();
  const v1 = new Map();
  const deV0 = new Map();
  if (!esMapa(idx.v0regs)) idx.v0regs = {};
  if (!esMapa(idx.fijos)) idx.fijos = {};
  const sueltos = jsonsDe(base) || [];
  const d0 = duenosDe(ctx, idx, 'agentes', sueltos);
  for (const a of sueltos) {
    const id = a.valor && a.valor.id;
    if (!P.esIdV0(id) || `${P.aArchivo(id)}.json` !== a.nombre) continue;
    let dueno = d0.get(a.nombre) || null;
    const rec = idx.v0regs[id];
    if (dueno && !rec) idx.v0regs[id] = dueno;
    else if (dueno && rec && !D.mismaCuenta(rec, dueno)) {
      avisos.push(`${id}: su registro v0 cambió de cuenta dueña desde la primera vez que lo vi; no lo uso para verificar`);
      dueno = null;
    }
    v0.set(id, { dueno, datos: a.valor });
  }
  let carpetas = [];
  try {
    carpetas = fs.readdirSync(base, { withFileTypes: true }).filter((e) => e.isDirectory());
  } catch (e) {
    carpetas = [];
  }
  for (const c of carpetas) {
    const id = P.nombreOk(c.name) ? P.deArchivo(c.name) : null;
    if (!id) continue;
    const rel = `agentes/${c.name}`;
    const archivos = jsonsDe(path.join(base, c.name)) || [];
    const dd = duenosDe(ctx, idx, rel, archivos);
    const por = new Map(archivos.map((a) => [a.nombre, { ...a, dueno: dd.get(a.nombre) || null }]));
    const ag = evaluarV1(id, por, v0, idx, avisos);
    v1.set(id, ag);
    if (ag.valido && !ag.disputa) for (const a of ag.antes) deV0.set(a, id);
  }
  // un id recordado cuya carpeta desapareció: lo que llegue después con ese id es otra reserva, no la misma
  return { v0, v1, deV0, avisos };
}

const DISPUTA = (id) => ({ id, valido: true, disputa: true, cuentas: [], compartida: false, antes: [] });
function evaluarV1(id, por, v0, idx, avisos) {
  const cands = [];
  for (const [nombre, a] of por) {
    if (!RE_REGISTRO.test(nombre)) continue;
    const d = a.valor;
    if (!esMapa(d) || d.protocolo !== 1 || d.id !== id || !a.dueno) continue;
    if (!lista(d.cuentas).some((x) => D.mismaCuenta(x, a.dueno))) continue; // vale solo si su dueño es la cuenta que dice adentro
    const antes = lista(d.antes).filter((x) => P.esIdV0(x));
    const ok = antes.filter((x) => v0.has(x) && v0.get(x).dueno && D.mismaCuenta(v0.get(x).dueno, a.dueno)); // red team 3
    for (const x of antes) if (!ok.includes(x)) avisos.push(`${id}: el "antes" ${x} no es de la misma cuenta que su registro v0; lo ignoro`);
    cands.push({ nombre, dueno: a.dueno, datos: d, antes: ok });
  }
  if (!cands.length) {
    if (idx.regs[id]) avisos.push(`${id}: su registro desapareció`);
    return { id, valido: false, disputa: false, cuentas: [], compartida: false, antes: [] };
  }
  cands.sort((a, b) => (a.nombre === 'registro.json' ? -1 : b.nombre === 'registro.json' ? 1 : a.nombre < b.nombre ? -1 : 1));
  const cuentasDe = [...new Set(cands.map((c) => c.dueno.toLowerCase()))];
  const fijo = idx.fijos[id];
  const recordado = esMapa(idx.regs[id]) ? idx.regs[id].d : null;
  let gana = null;
  if (fijo) {
    gana = cands.find((c) => D.mismaCuenta(c.dueno, fijo)) || null; // la persona de esta PC eligió esa cuenta
  } else if (cuentasDe.length === 1 && (!recordado || D.mismaCuenta(recordado, cands[0].dueno))) {
    gana = cands[0];
    if (!recordado) idx.regs[id] = { d: cands[0].dueno };
  }
  if (!gana) {
    avisos.push(`${id}: en disputa (registros de cuentas distintas, o uno que cambió de cuenta); nadie lo verifica desde esta PC hasta que la persona lo resuelva (registrar --resolver ${id} --vale <archivo>)`);
    return { ...DISPUTA(id), candidatos: cands.map((c) => ({ nombre: c.nombre, dueno: c.dueno })) };
  }
  // las cuentas: la dueña del registro, más cada alta aprobada por una cuenta que ya estaba
  const cuentas = [gana.dueno];
  let cambio = true;
  while (cambio) {
    cambio = false;
    for (const [nombre, a] of por) {
      if (!RE_ALTA.test(nombre)) continue;
      const d = a.valor;
      if (!esMapa(d) || d.protocolo !== 1 || d.id !== id || typeof d.cuenta !== 'string' || !D.mismaCuenta(d.cuenta, a.dueno)) continue;
      if (cuentas.some((c) => D.mismaCuenta(c, d.cuenta))) continue;
      // la aprobación: de una cuenta que ya está, y que dice adentro qué aprueba y quién (renombrar un archivo ajeno no alcanza)
      const ap = por.get(`aprueba-${nombre}`);
      const apOk = ap && ap.dueno && esMapa(ap.valor) && ap.valor.protocolo === 1 && ap.valor.id === id && ap.valor.aprueba === nombre && D.mismaCuenta(ap.valor.cuenta, ap.dueno);
      if (apOk && cuentas.some((c) => D.mismaCuenta(c, ap.dueno))) {
        cuentas.push(d.cuenta);
        cambio = true;
      }
    }
  }
  return { id, valido: true, disputa: false, cuentas, compartida: gana.datos.compartida === true, antes: gana.antes, archivo: gana.nombre, candidatos: cands.map((c) => ({ nombre: c.nombre, dueno: c.dueno })) };
}

// ---------------------------------------------------------------- los mensajes
// Refresca el índice: lista el original, lee solo lo nuevo (en el hook, de a `maxNuevos`) y le busca el dueño.
// → { llega, raros, convs: Map nombre → { n } }
function refrescar(ctx, idx, { maxNuevos = Infinity } = {}) {
  const base = path.join(ctx.carpeta, 'conversaciones');
  let convs;
  try {
    convs = fs.readdirSync(base, { withFileTypes: true }).filter((e) => e.isDirectory());
  } catch (e) {
    return { llega: false, raros: 0 };
  }
  let raros = 0;
  const nuevos = [];
  const presentes = new Set();
  convs.sort((a, b) => (a.name < b.name ? -1 : 1));
  for (const c of convs) {
    if (!P.nombreOk(c.name)) {
      raros++;
      continue;
    }
    if (!idx.convs[c.name]) idx.convs[c.name] = { n: ++idx.sig };
    let fs2;
    try {
      fs2 = fs.readdirSync(path.join(base, c.name, 'mensajes'));
    } catch (e) {
      continue;
    }
    for (const f of fs2) {
      if (!f.endsWith('.json')) continue;
      if (!P.nombreOk(f)) {
        raros++;
        continue;
      }
      const k = `${c.name}/${f}`;
      presentes.add(k);
      if (!idx.msgs[k]) nuevos.push({ conv: c.name, f, k });
    }
  }
  for (const [k, e] of Object.entries(idx.msgs)) e.fuera = !presentes.has(k);
  nuevos.sort((a, b) => (a.f < b.f ? -1 : a.f > b.f ? 1 : 0));
  const porConv = new Map();
  let leidos = 0;
  for (const n of nuevos) {
    if (leidos >= maxNuevos || (ctx.enHook && queda(ctx) < 300)) break;
    const p = path.join(base, n.conv, 'mensajes', n.f);
    let bytes;
    let st;
    try {
      st = fs.statSync(p);
      bytes = fs.readFileSync(p);
    } catch (e) {
      continue;
    }
    leidos++;
    const m = P.normalizar(P.parsear(bytes), n.conv, n.f);
    // la primera vista también controla (red team 2): id o conversación que no coinciden, o editado después de nacer
    const nacio = st.birthtimeMs;
    const editado = Number.isFinite(nacio) && nacio > 0 && st.mtimeMs - nacio > 60000;
    idx.msgs[n.k] = { h: P.huella(bytes), d: null, alt: !m || !m.coincide || editado, m: m ? compacto(m) : null, visto: ctx.ahora };
    if (!porConv.has(n.conv)) porConv.set(n.conv, []);
    porConv.get(n.conv).push(n.f);
  }
  // el dueño: los nuevos y los que quedaron pendientes, una vez por carpeta
  for (const [k, e] of Object.entries(idx.msgs)) {
    if (e.d || e.fuera) continue;
    const [conv, f] = k.split('/');
    if (!porConv.has(conv)) porConv.set(conv, []);
    if (!porConv.get(conv).includes(f)) porConv.get(conv).push(f);
  }
  for (const [conv, fs3] of porConv) {
    if (ctx.enHook && queda(ctx) < 400) break;
    const m = ctx.duenos(path.join(base, conv, 'mensajes'), fs3, { enHook: ctx.enHook });
    for (const f of fs3) {
      const c = m.get(f);
      if (c) idx.msgs[`${conv}/${f}`].d = c;
    }
  }
  return { llega: true, raros };
}
const corta = (s, n) => (s.length > n ? s.slice(0, n) : s);
function compacto(m) {
  return { ...m, asunto: corta(m.asunto, 300), cita: corta(m.cita, 300) };
}
// Los mensajes del índice, con su clave: [{ k, e, m }]
const mensajes = (idx) =>
  Object.entries(idx.msgs)
    .filter(([, e]) => e.m && !e.fuera)
    .map(([k, e]) => ({ k, e, m: e.m }))
    .sort((a, b) => (a.m.archivo < b.m.archivo ? -1 : a.m.archivo > b.m.archivo ? 1 : 0));

// Vuelve a leer el original de un mensaje y compara la huella; con `dueno`, también el dueño (fuera del hook, sobre el original)
function reverificar(ctx, idx, k, { dueno = false } = {}) {
  const e = idx.msgs[k];
  if (!e) return;
  const [conv, f] = k.split('/');
  const p = path.join(ctx.carpeta, 'conversaciones', conv, 'mensajes', f);
  try {
    if (P.huella(fs.readFileSync(p)) !== e.h) e.alt = true;
  } catch (e2) {
    e.fuera = true;
  }
  if (dueno) {
    const c = ctx.duenos(path.dirname(p), [f], { enHook: ctx.enHook }).get(f) || null;
    e.dActual = c;
    if (c) e.d = e.d || c;
  }
}

// ---------------------------------------------------------------- las marcas de leído (protocolo 7)
// → { v1: Map idV1 → { conv: { id: huella } }, v0: Map idV0 → { conv: puntero|[ids] }, huellas: Map clave → Set }
function marcas(ctx, idx, regs) {
  const base = path.join(ctx.carpeta, 'leidos');
  const archivos = jsonsDe(base) || [];
  const dd = duenosDe(ctx, idx, 'leidos', archivos);
  const v1 = new Map();
  const v0 = new Map();
  const huellas = new Map();
  for (const a of archivos) {
    const dueno = dd.get(a.nombre);
    const idf = a.nombre.replace(/\.json$/, '');
    const id1 = P.deArchivo(idf);
    const ag = id1 && regs.v1.get(id1);
    if (ag && esMapa(a.valor) && a.valor.protocolo === 1) {
      // vale solo si su dueño es una cuenta de ese agente (red team 2)
      if (!ag.valido || ag.disputa || !dueno || !ag.cuentas.some((c) => D.mismaCuenta(c, dueno))) {
        regs.avisos.push(`leidos de ${id1}: no es de una cuenta de ese agente; lo ignoro`);
        continue;
      }
      const l = esMapa(a.valor.leidos) ? a.valor.leidos : {};
      v1.set(id1, l);
      // la huella que delata un cambio sale solo de las marcas de los agentes de esta PC: la de otro agente cualquiera podía marcar
      // como alterado el mensaje que quisiera (red team de la construcción, 8)
      if (!ctx.config.agentes.some((x) => x.id === id1)) continue;
      for (const [conv, ids] of Object.entries(l)) {
        if (!esMapa(ids)) continue;
        for (const [mid, h] of Object.entries(ids)) {
          const k = `${conv}/${mid}.json`;
          if (!huellas.has(k)) huellas.set(k, new Set());
          if (typeof h === 'string') huellas.get(k).add(h);
        }
      }
      continue;
    }
    for (const [id0, r0] of regs.v0) {
      if (`${P.aArchivo(id0)}.json` !== a.nombre) continue;
      if (dueno && D.mismaCuenta(dueno, r0.dueno) && esMapa(a.valor)) v0.set(id0, a.valor);
    }
  }
  return { v1, v0, huellas };
}
const sinJson = (s) => String(s).replace(/\.json$/i, '');
// `propio`: el mensaje es del agente y verifica (uno que solo dice serlo no se da por leído: red team de la construcción, 4)
function leido(agente, m, mk, propio = false) {
  if (propio) return true;
  const l1 = mk.v1.get(agente.id);
  if (l1) return esMapa(l1[m.conv]) && Object.prototype.hasOwnProperty.call(l1[m.conv], m.id);
  for (const a of agente.antes) {
    const l0 = mk.v0.get(a);
    if (!l0) continue;
    const x = l0[m.conv];
    if (typeof x === 'string' && x && sinJson(m.archivo) <= sinJson(x)) return true;
    if (Array.isArray(x) && x.some((y) => sinJson(y) === m.id)) return true;
  }
  return false;
}

// ---------------------------------------------------------------- verificar (§4.3.2 y D3)
// → { estado: verificado | v0 | no | alterado | pendiente, quien } — `dueno`: la cuenta dueña a usar (la del índice si falta)
function verificar(ctx, regs, mk, x, dueno) {
  const { e, m } = x;
  if (!m || e.alt) return { estado: 'alterado', quien: null };
  const otras = mk.huellas.get(x.k);
  if (otras && [...otras].some((h) => h !== e.h)) return { estado: 'alterado', quien: null };
  const d = dueno !== undefined ? dueno : e.d;
  if (!d) return { estado: 'pendiente', quien: null };
  if (ctx.config.compartida) return { estado: 'no', quien: null };
  let id1 = P.esIdV1(m.de) ? m.de : P.esIdV0(m.de) ? regs.deV0.get(m.de) : null;
  if (id1) {
    const ag = regs.v1.get(id1);
    if (!ag || !ag.valido || ag.disputa || ag.compartida) return { estado: 'no', quien: null };
    return ag.cuentas.some((c) => D.mismaCuenta(c, d)) ? { estado: 'verificado', quien: id1 } : { estado: 'no', quien: null };
  }
  if (P.esIdV0(m.de)) {
    const r0 = regs.v0.get(m.de);
    return r0 && r0.dueno && D.mismaCuenta(r0.dueno, d) ? { estado: 'v0', quien: m.de } : { estado: 'no', quien: null };
  }
  return { estado: 'no', quien: null };
}

// ---------------------------------------------------------------- todo junto
// Los agentes de la PC, con lo que dice su registro: [{ id, repo, antes, ids, registro }]
function agentesLocales(ctx, regs) {
  return ctx.config.agentes.map((a) => {
    const r = regs.v1.get(a.id);
    const antes = r && r.valido && !r.disputa ? [...new Set([...r.antes])] : a.antes;
    return { id: a.id, repo: a.repo, antes, ids: P.idsDe({ id: a.id, antes }), registro: r || null };
  });
}

// estado({ maxNuevos }) → la foto: { llega, raros, idx, regs, mk, xs, ver(x), agentes, turnos(agente), ... }
function foto(ctx, { maxNuevos } = {}) {
  const idx = leerIndice(ctx);
  const r = refrescar(ctx, idx, { maxNuevos });
  if (!r.llega) return { llega: false, idx };
  const regs = registros(ctx, idx);
  const mk = marcas(ctx, idx, regs);
  const xs = mensajes(idx);
  const cache = new Map();
  const ver = (x) => {
    // dActual: el dueño leído recién sobre el original (leer, verificar, responder); sin él, el del índice
    if (!cache.has(x.k)) cache.set(x.k, verificar(ctx, regs, mk, x, x.e.dActual));
    return cache.get(x.k);
  };
  const porM = new Map(xs.map((x) => [x.m, x]));
  const estadoDe = (m) => ver(porM.get(m)).estado;
  const agentes = agentesLocales(ctx, regs);
  const ms = xs.map((x) => x.m);
  const turnos = (ag) => P.turnosDe(ag, ms, estadoDe).map((t) => ({ ...t, x: porM.get(t.m) }));
  const guardar = () => {
    for (const e of Object.values(idx.msgs)) delete e.dActual;
    guardarIndice(ctx, idx);
  };
  return { llega: true, raros: r.raros, idx, regs, mk, xs, ver, agentes, turnos, porM, olvidar: (k) => cache.delete(k), guardar };
}

// Las respuestas automáticas de un agente en una conversación en el día UTC de `ahora`, solo las que verifican (red team 14)
function autosDelDia(f, ag, conv, ahora) {
  const dia = new Date(ahora).toISOString().slice(0, 10);
  return f.xs.filter((x) => x.m.auto && x.m.conv === conv && ag.ids.has(x.m.de) && x.m.creado && new Date(x.m.creado).toISOString().slice(0, 10) === dia && f.ver(x).estado === 'verificado').length;
}

// ¿la sesión es de persona? (responder, paso 2): sin .kit-rol o con humano, y una entrada interactiva de la lista cerrada
// (lib/contexto.cjs no sirve acá: su lista de roles no trae "humano", y un .kit-rol "director" ahí es válido; acá no es persona)
function rolDe(raiz) {
  if (!raiz) return 'desconocido';
  let t;
  try {
    t = fs.readFileSync(path.join(raiz, '.kit-rol'), 'utf8');
  } catch (e) {
    return e && e.code === 'ENOENT' ? 'humano' : 'desconocido'; // existe pero no se lee: nunca persona
  }
  if (t.charCodeAt(0) === 0xfeff) t = t.slice(1);
  return t.trim() === 'humano' ? 'humano' : 'otro';
}
function sesionDePersona(raiz, env) {
  return rolDe(raiz) === 'humano' && ENTRADAS_PERSONA.has(String((env || {}).CLAUDE_CODE_ENTRYPOINT || ''));
}
// La raíz git del cwd (o null)
function raizGit(cwd) {
  try {
    const t = require('../lib/git.cjs').texto(['rev-parse', '--show-toplevel'], { cwd, tiempo: 3000 });
    return t ? path.resolve(t) : null;
  } catch (e) {
    return null;
  }
}
const mismaRuta = (a, b) => {
  const n = (x) => path.resolve(x).replace(/[\\/]+$/, '');
  return process.platform === 'win32' ? n(a).toLowerCase() === n(b).toLowerCase() : n(a) === n(b);
};
// El agente de la PC cuya copia es la raíz git del cwd (o null)
function agenteDe(f, raiz) {
  return raiz ? f.agentes.find((a) => mismaRuta(a.repo, raiz)) || null : null;
}

// juzgar (la tabla de §4.4.4): lo que permite un mensaje que llega, para el agente `ag` (el de la copia, o null)
// → { veredicto: 'contestar' | 'ok' | 'dato' | 'sin-respaldo', texto, motivo, propuesta }
function juzgar(ctx, f, x, ag) {
  const { m } = x;
  const v = f.ver(x);
  if (m.tipo === 'HECHO' && m.tema === 'decision' && (m.sinRespaldo || !citaAbre(m.cita, ag))) {
    return { veredicto: 'sin-respaldo', texto: 'sin respaldo: una decisión cuya cita no se puede abrir; dato, nunca permiso', v };
  }
  const deQuien = ag ? [ag] : f.agentes;
  const turno = deQuien.map((a) => ({ a, t: f.turnos(a).find((t) => t.x.k === x.k) })).find((y) => y.t);
  if (!turno || !turno.t.abierto) return { veredicto: 'dato', texto: 'dato', v };
  const motivos = [];
  if (!ag) motivos.push('esta sesión no está en la copia de ese agente');
  if (v.estado !== 'verificado' && v.estado !== 'v0') motivos.push(`el remitente está ${v.estado === 'no' ? 'no verificado' : v.estado}`);
  if (!ctx.config.contestar_solo) motivos.push('contestar solo está apagado en la config');
  if (apagado(ctx)) motivos.push('contestar solo está cortado en esta PC (registrar --prender)');
  if (ag && autosDelDia(f, ag, m.conv, ctx.ahora) >= TOPE_AUTO) motivos.push(`ya van ${TOPE_AUTO} respuestas solas hoy en esta conversación`);
  if (motivos.length) return { veredicto: 'ok', texto: `pide el OK de la persona (${motivos.join('; ')})`, motivo: motivos.join('; '), v };
  if (m.tipo === 'PROPUESTA') {
    return { veredicto: 'contestar', propuesta: true, texto: 'podés contestar solo: solo el estado, con abierto: true (aceptar o rechazar la propuesta es de la persona)', v };
  }
  return { veredicto: 'contestar', texto: 'podés contestar solo: estado, fechas y citas', v };
}
// Una cita de decisión: <alias>:<ruta>@<sha> o <ruta>:<línea>@<sha>, a un repo que esta PC abre y donde existe
function citaAbre(cita, ag) {
  const c = partirCita(cita);
  if (!c || !ag) return false;
  return existeEnRepo(ag.repo, c.sha, c.ruta, c.linea);
}
const RE_CITA = /^([^:\s@]+):([^@\s]+)@([0-9a-f]{7,40})$/;
function partirCita(cita) {
  const m = RE_CITA.exec(String(cita || '').trim());
  if (!m) return null;
  if (/^\d+$/.test(m[2])) return { ruta: m[1], linea: Number(m[2]), sha: m[3], alias: null };
  return { alias: m[1], ruta: m[2], linea: null, sha: m[3] };
}
function existeEnRepo(repo, sha, ruta, linea) {
  try {
    const g = require('../lib/git.cjs');
    if (!/^[0-9a-f]{7,40}$/.test(sha) || ruta.startsWith('-') || ruta.includes('..')) return false;
    const r = g.correr(['cat-file', '-p', `${sha}:${ruta}`], { cwd: repo, tiempo: 4000 });
    if (!r.ok) return false;
    if (linea == null) return true;
    const n = r.stdout.split('\n').length - (r.stdout.endsWith('\n') ? 1 : 0);
    return linea >= 1 && linea <= n;
  } catch (e) {
    return false;
  }
}

module.exports = {
  dirConfig,
  cargarConfig,
  contexto,
  leerIndice,
  guardarIndice,
  registros,
  refrescar,
  marcas,
  leido,
  verificar,
  reverificar,
  foto,
  agentesLocales,
  autosDelDia,
  sesionDePersona,
  raizGit,
  mismaRuta,
  agenteDe,
  juzgar,
  partirCita,
  existeEnRepo,
  apagado,
  queda,
  esMapa,
  ENTRADAS_PERSONA,
  TOPE_AUTO,
  QUIETA_DIAS,
  MARGEN_MS,
};
