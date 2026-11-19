'use strict';
// medir.cjs — las nueve medidas del piloto (SPEC-G1-buzon, "El piloto" y `medir`; criterio 8; red team 6). Solo lee, salvo el
// corte: escribe ~/.config/kit-buzon/apagado cuando una respuesta automática del período falla la regla 5 contra el repo de hoy
// (un renglón que después se commiteó) o la regla 4 contra la carpeta de hoy (lo que contestó ya no verifica). La regla 5 no se mide
// a sí misma: por eso lista enteras todas las auto: true del período, para que las mire la persona.
const fs = require('fs');
const path = require('path');
const P = require('./protocolo.cjs');
const C = require('./carpeta.cjs');
const S = require('./salida.cjs');

const DIA = 864e5;
const HORA = 36e5;

function cuantil(xs, q) {
  if (!xs.length) return null;
  const v = xs.slice().sort((a, b) => a - b);
  const pos = (v.length - 1) * q;
  const i = Math.floor(pos);
  return i + 1 < v.length ? v[i] + (v[i + 1] - v[i]) * (pos - i) : v[i];
}
const min = (ms) => (ms == null ? '—' : ms < HORA ? `${Math.round(ms / 60000)} min` : `${(ms / HORA).toFixed(1).replace('.', ',')} h`);

// Los renglones de tiempos.log: [{ t, evento, ms, nota }]
function tiempos(cfgDir) {
  let t = '';
  try {
    t = fs.readFileSync(path.join(cfgDir, 'tiempos.log'), 'utf8');
  } catch (e) {
    return [];
  }
  return t
    .split('\n')
    .map((l) => l.trim().split(' '))
    .filter((p) => p.length >= 3 && Number.isFinite(Date.parse(p[0])))
    .map((p) => ({ t: Date.parse(p[0]), evento: p[1], ms: Number(p[2]), nota: p[3] || '' }));
}

// medidas(ctx, { desde, lineaBase, git }) → { m1…m9, listas, corte }
function medidas(ctx, { desde = 0, lineaBase = false, git } = {}) {
  const f = C.foto(ctx);
  if (!f.llega) return { llega: false };
  // fuera del hook: todo sobre el original
  for (const x of f.xs) {
    C.reverificar(ctx, f.idx, x.k);
    f.olvidar(x.k);
  }
  const ahora = ctx.ahora;
  const enPeriodo = (ms) => Number.isFinite(ms) && ms >= desde;
  // los agentes v1: los de la PC con un registro v1 válido; en la línea base, todos los de la PC
  const agentes = f.agentes.filter((a) => lineaBase || (a.registro && a.registro.valido && !a.registro.disputa));
  const log = tiempos(ctx.cfgDir);
  const deltas = [];
  const deltasAprox = [];
  const parados = [];
  const esperandoOk = [];
  const sinSesion = [];
  for (const ag of agentes) {
    for (const t of f.turnos(ag)) {
      if (!enPeriodo(t.m.creado)) continue;
      if (!t.abierto && t.cierre && Number.isFinite(t.cierre.creado)) (t.aprox ? deltasAprox : deltas).push(t.cierre.creado - t.m.creado);
      const fin = t.abierto ? ahora : t.cierre && Number.isFinite(t.cierre.creado) ? t.cierre.creado : ahora;
      if (t.abierto && ahora - t.m.creado > 7 * DIA) parados.push(t);
      if (t.abierto && C.juzgar(ctx, f, t.x, ag).veredicto === 'ok') esperandoOk.push(t);
      if (fin - t.m.creado > 8 * HORA && !log.some((l) => l.t >= t.m.creado && l.t <= fin)) sinSesion.push(t);
    }
  }
  const ids = new Set(f.agentes.flatMap((a) => [...a.ids]));
  // las automáticas de la PC: solo las que verifican (una falsa "de" un agente de la PC no apaga nada ni se presenta como propia:
  // red team de la construcción, 9); las falsas van en su lista
  const conAuto = f.xs.filter((x) => x.m.auto && ids.has(x.m.de) && enPeriodo(x.m.creado));
  const autos = conAuto.filter((x) => f.ver(x).estado === 'verificado');
  const autosFalsas = conAuto.filter((x) => f.ver(x).estado !== 'verificado');
  const porId = new Map(f.xs.map((x) => [`${x.m.conv}/${x.m.id}`, x]));
  const autoANoVerificados = autos.filter((x) => x.m.responde_a.some((r) => {
    const y = porId.get(`${x.m.conv}/${r}`);
    return y && ['no', 'alterado'].includes(f.ver(y).estado);
  }));
  const alterados = f.xs.filter((x) => enPeriodo(x.m.creado || x.e.visto) && f.ver(x).estado === 'alterado');
  const noVerificados = f.xs.filter((x) => enPeriodo(x.m.creado || x.e.visto) && f.ver(x).estado === 'no');
  const porEvento = {};
  for (const l of log) {
    if (l.t < desde) continue;
    const k = l.nota === 'porton' ? `${l.evento} (portón)` : l.evento;
    (porEvento[k] = porEvento[k] || []).push(l.ms);
  }
  const p95 = Object.fromEntries(Object.entries(porEvento).map(([k, v]) => [k, { n: v.length, p95: cuantil(v, 0.95) }]));
  // el corte (red team 6)
  const corte = [];
  for (const x of autos) {
    const ag = f.agentes.find((a) => a.ids.has(x.m.de));
    const j = P.leerJson(path.join(ctx.carpeta, 'conversaciones', x.m.conv, 'mensajes', x.m.archivo));
    const cuerpo = j && j.valor && typeof j.valor.cuerpo === 'string' ? j.valor.cuerpo.replace(/\n\nno puedo leer [a-z0-9-]+: ¿me lo pasás en otra forma\?$/, '') : '';
    x.cuerpo = cuerpo;
    const r = S.juzgarTexto(cuerpo, { repo: ag.repo, git });
    if (!r.ok) corte.push(`${x.m.conv}/${x.m.id}: la regla 5 hoy ${r.motivo}`);
    else if (autoANoVerificados.includes(x)) corte.push(`${x.m.conv}/${x.m.id}: contestó a un mensaje que hoy no verifica`);
  }
  f.guardar();
  return {
    llega: true,
    f,
    m1: cuantil(deltas, 0.5),
    m2: cuantil(deltas, 0.75),
    n12: deltas.length,
    aprox: { n: deltasAprox.length, mediana: cuantil(deltasAprox, 0.5) },
    m3: parados,
    m4: autoANoVerificados,
    m5: alterados,
    m6: noVerificados,
    m7: p95,
    m8: esperandoOk,
    m9: sinSesion,
    autos,
    autosFalsas,
    corte,
  };
}

function verboMedir(ctx, { o }, entorno) {
  let desde = 0;
  if (o['--desde'] !== undefined) {
    desde = Date.parse(o['--desde']);
    if (!Number.isFinite(desde)) return { codigo: 3, texto: 'se niega: --desde lleva una fecha (AAAA-MM-DD)' };
  }
  const lineaBase = !!o['--linea-base'];
  const r = medidas(ctx, { desde, lineaBase, git: entorno.git });
  if (!r.llega) return { codigo: 1, texto: '📬 buzón: no llego a la carpeta' };
  const et = (x) => `C${r.f.idx.convs[x.m.conv] ? r.f.idx.convs[x.m.conv].n : '?'} ${x.m.conv}/${x.m.id}`;
  const out = [];
  if (r.corte.length && !lineaBase) {
    fs.mkdirSync(ctx.cfgDir, { recursive: true });
    fs.writeFileSync(path.join(ctx.cfgDir, 'apagado'), `${new Date(ctx.ahora).toISOString()} medir: ${r.corte.join(' | ')}\n`);
    out.push(`⚠ CORTE: contestar solo quedó apagado en esta PC (${r.corte.length}): ${r.corte.join(' · ')}. Revisá el juicio y prendelo con registrar --prender`);
  }
  out.push(`📏 buzón · medir${lineaBase ? ' --linea-base' : ''}${desde ? ` desde ${new Date(desde).toISOString().slice(0, 10)}` : ''}`);
  out.push(`1. respuesta a un turno, mediana: ${min(r.m1)} (n=${r.n12}; con la aproximación ≈: n=${r.aprox.n}, mediana ${min(r.aprox.mediana)}) · pasa si ≤ 18 min`);
  out.push(`2. respuesta a un turno, p75: ${min(r.m2)} · pasa si ≤ 1 h`);
  out.push(`3. turnos parados más de 7 días: ${r.m3.length} · pasa si 0${r.m3.length ? ` (${r.m3.map((t) => et(t.x)).join(', ')})` : ''}`);
  out.push(`4. respuestas automáticas a no verificados o alterados: ${r.m4.length} · pasa si 0`);
  out.push(`5. mensajes alterados: ${r.m5.length}${r.m5.length ? ` (${r.m5.map(et).join(', ')})` : ''} · cada uno se mira`);
  out.push(`6. no verificados: ${r.m6.length} (los falsos, de un remitente legítimo, se cuentan a mano: pasa si ≤ 2 en el mes)`);
  const ev = Object.entries(r.m7).map(([k, v]) => `${k} ${Math.round(v.p95)} ms (n=${v.n})`);
  out.push(`7. lo que tarda el aviso, p95: ${ev.length ? ev.join(' · ') : 'sin corridas en tiempos.log'} · pasa si < 1 s`);
  out.push(`8. turnos que piden el OK y siguen abiertos: ${r.m8.length} · si son encargos reales → se reabre C (§4.3)`);
  out.push(`9. turnos de más de 8 h sin ninguna corrida del aviso: ${r.m9.length} · si aparecen → se reabre B (§4.1)`);
  if (r.m6.length) {
    out.push('', 'no verificados (mirá si alguno es de un remitente legítimo):');
    for (const x of r.m6) out.push(`  ${et(x)} · dice ser de ${P.esId(x.m.de) ? `"${x.m.de}"` : 'un de con forma rara'}`);
  }
  out.push('', `respuestas automáticas del período (${r.autos.length}), enteras: mirá que ninguna pegue contenido; si una pega, registrar --apagar`);
  // los cuerpos, encerrados: es texto que salió del modelo, y lo lee el modelo (red team de la construcción, 9)
  const c = require('./buzon.cjs').cerco(r.autos.map((x) => String(x.cuerpo)));
  for (const x of r.autos) out.push(`  ── ${et(x)} · de ${x.m.de} · ${x.m.creado ? new Date(x.m.creado).toISOString() : 'sin fecha'}`, c.abre, String(x.cuerpo), c.cierra);
  if (r.autosFalsas.length) {
    out.push('', `⚠ respuestas automáticas que dicen ser de un agente de esta PC y no verifican (${r.autosFalsas.length}): alguien escribe en su nombre`);
    for (const x of r.autosFalsas) out.push(`  ${et(x)}`);
  }
  if (lineaBase) {
    out.push('', 'registros v0 y sus dueños (para mirar D3):');
    for (const [id0, r0] of r.f.regs.v0) out.push(`  ${id0} · dueño ${r0.dueno || 'sin leer'}`);
  }
  return { codigo: 0, texto: out.join('\n') };
}

module.exports = { medidas, verboMedir, cuantil, tiempos };
