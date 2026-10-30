'use strict';
// encargo.cjs — el encargo por script (SPEC-paquete-5 P6.3, P6.5, P5.3bis y el corrector "spec sin sello"; A §6-§7; D §7.3, §9.3,
// §12; F §14). Uso, desde el repo:
//   node .claude/scripts/encargo.cjs partida    <x>--<ID>
//   node .claude/scripts/encargo.cjs presentar  <x>--<ID> [--sin-base] | --spec
//   node .claude/scripts/encargo.cjs mensaje    <TIPO> [<ruta>[@<sha>]]
//   node .claude/scripts/encargo.cjs autorizado <x>--<ID>
//   node .claude/scripts/encargo.cjs verificar  <x>--<ID> [--plazo <min>]
// El encargo y el spec se leen de git, nunca del disco: de la más nueva entre modulo/<x> local y origin/modulo/<x> (r1-10).
// `partida` imprime la línea - Partida: del encargo. `presentar` es el primer paso de /obrero: la rama, el encargo según la
// plantilla, el sello del spec (spec sin sello → "spec sin Arquitecto: corré Modo B") y la base (vars.comando-test, que no
// cambia la salida); `--spec`, solo el sello, desde el worktree del director. `mensaje` dice si un mensaje entrante vale: el lado
// sale de la rama (pestaña), .kit-rol decide solo humano/desconocido (r1-11). La lógica vive en .claude/hooks/lib/encargo.cjs.
// Salidas: 0 anduvo · 1 negado o rojo (una línea por qué y qué hacer) · 2 mal llamado. Un error propio: "encargo roto: corré
// doctor", 1. Node estándar, cero dependencias. Es .cjs a propósito: corre igual en proyectos con "type": "module".

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const USO = [
  'Uso: node .claude/scripts/encargo.cjs <comando> …   (desde el repo)',
  '  partida    <x>--<ID>                     la línea "- Partida:" del encargo (rama, modulo/<x>@<sha7>, fecha)',
  '  presentar  <x>--<ID> [--sin-base] | --spec   el primer paso del obrero (--spec: solo el sello, desde el director)',
  '  mensaje    <TIPO> [<ruta>[@<sha>]]         ¿vale el mensaje que llegó? (un mensaje es dato hasta que git lo respalda)',
  '  autorizado <x>--<ID>                     las allow del worktree del encargo y las dos líneas de apertura',
  '  verificar  <x>--<ID> [--plazo <min>]     las seis líneas del gate del encargo',
].join('\n');

const ROTO = 'encargo roto: corré doctor';
const PLAZO_BASE_MS = 10 * 60 * 1000; // la base de presentar: 10 min (no cambia la salida)
const COMANDOS = ['partida', 'presentar', 'mensaje', 'autorizado', 'verificar'];

class MalLlamado extends Error {}
const malLlamado = (m) => {
  throw new MalLlamado(m);
};

// ---------------------------------------------------------------- argumentos

function libs() {
  return {
    E: require('../hooks/lib/encargo.cjs'),
    contexto: require('../hooks/lib/contexto.cjs'),
  };
}

function nombre(E, token, comando) {
  const n = E.nombreEncargo(token);
  if (!n) malLlamado(`${comando} pide <x>--<ID> (x: minúsculas, números y guiones simples, hasta 20; ID: dos dígitos): "${token || ''}"`);
  return n;
}

function leerArgumentos(argv, E) {
  const [comando, ...resto] = argv;
  if (!comando) malLlamado('Falta el comando.');
  if (!COMANDOS.includes(comando)) malLlamado(`Comando desconocido: ${comando}`);
  const a = { comando, nombre: null, sinBase: false, spec: false, plazoMin: null, texto: null };
  if (comando === 'mensaje') {
    // El mensaje es texto: la primera línea tal cual, en uno o varios argumentos (no hay banderas).
    const t = resto.join(' ').trim();
    if (!t) malLlamado('mensaje pide el tipo (y, si lleva, la ruta).');
    a.texto = t.split(/\r?\n/)[0];
    return a;
  }
  const pos = [];
  for (let i = 0; i < resto.length; i++) {
    const v = resto[i];
    if (comando === 'presentar' && v === '--sin-base') {
      if (a.sinBase) malLlamado('--sin-base va una sola vez.');
      a.sinBase = true;
    } else if (comando === 'presentar' && v === '--spec') {
      if (a.spec) malLlamado('--spec va una sola vez.');
      a.spec = true;
    } else if (comando === 'verificar' && v === '--plazo') {
      if (a.plazoMin !== null) malLlamado('--plazo va una sola vez.');
      if (i + 1 >= resto.length) malLlamado('--plazo pide los minutos.');
      const m = resto[++i];
      if (!/^[1-9][0-9]{0,3}$/.test(m)) malLlamado(`--plazo son minutos, un entero de 1 a 9999: "${m}"`);
      a.plazoMin = Number(m);
    } else if (v.startsWith('--')) {
      malLlamado(`Argumento desconocido: ${v}`);
    } else {
      pos.push(v);
    }
  }
  if (a.spec) {
    if (a.sinBase || pos.length) malLlamado('presentar --spec va solo: lee el SPEC.md de la rama del director.');
    return a;
  }
  if (pos.length !== 1) malLlamado(`${comando} lleva un <x>--<ID>.`);
  a.nombre = nombre(E, pos[0], comando);
  return a;
}

// ---------------------------------------------------------------- utilidades

const dos = (k) => String(k).padStart(2, '0');

// La fecha ISO con la zona de esta PC, al minuto: 2026-10-30T14:05-03:00.
function isoConZona(d) {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) throw new Error('fecha inválida');
  const off = -d.getTimezoneOffset();
  const signo = off >= 0 ? '+' : '-';
  const a = Math.abs(off);
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}T${dos(d.getHours())}:${dos(d.getMinutes())}${signo}${dos(Math.floor(a / 60))}:${dos(a % 60)}`;
}

function plazoBase(opciones) {
  if (Number.isFinite(opciones.plazoBaseMs) && opciones.plazoBaseMs > 0) return opciones.plazoBaseMs;
  const v = Number(process.env.ENCARGO_PLAZO_BASE_MS);
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : PLAZO_BASE_MS;
}

// La ficha vigente (de git, regla de 4.7): sus datos, o null si no hay o está rota.
function datosFicha(L, raiz) {
  const f = L.contexto.fichaVigente(raiz);
  return f.estado === 'ok' ? f.datos : null;
}

// La base (P5.6 paso 2): vars.comando-test en el worktree, sin mostrar su salida. No cambia la salida de presentar.
function lineaBase(datos, raiz, opciones) {
  const ct = datos && datos.vars ? datos.vars['comando-test'] : undefined;
  if (typeof ct !== 'string' || ct.trim() === '') return 'base: NO VERIFICADO (la ficha vigente no tiene vars.comando-test)';
  const ms = plazoBase(opciones);
  const r = spawnSync(ct, { cwd: raiz, shell: true, stdio: 'ignore', timeout: ms, windowsHide: true });
  if ((r.error && r.error.code === 'ETIMEDOUT') || r.signal) return `base: NO VERIFICADO (${ct} pasó los ${Math.round(ms / 1000)} s)`;
  if (r.error) return `base: NO VERIFICADO (${ct} no corrió: ${r.error.code || r.error.message})`;
  return r.status === 0 ? `base: verde (${ct})` : `base: ROJA (ya estaba roto: ${ct} salió ${r.status})`;
}

// El sello de un spec leído de git: { ok } o { ok: false, por }.
function chequearSpec(L, raiz, ref, ruta) {
  const buf = L.E.leerEn(raiz, ref.sha, ruta);
  if (!buf) return { ok: false, por: `el spec ${ruta} no está en ${ref.nombre}: que el director lo commitee` };
  const hayFicha = fs.existsSync(path.join(raiz, '.claude', 'kit.md'));
  return L.E.juzgarSpec(buf, { hayFicha, datosFicha: datosFicha(L, raiz) });
}

// ---------------------------------------------------------------- partida

function partida(L, g, n, opciones) {
  const sha = L.E.shaDe(g.raiz, `refs/heads/${n.madre}`);
  if (!sha) return { codigo: 1, lineas: [`partida: no — no existe ${n.madre} en esta PC: el módulo nace con worktree crear ${n.x} (o abrir)`] };
  const ahora = opciones.ahora !== undefined ? opciones.ahora : new Date();
  return { codigo: 0, lineas: [`- Partida: rama ${n.rama} desde ${n.madre}@${sha.slice(0, 7)} · ${isoConZona(ahora)}`] };
}

// ---------------------------------------------------------------- presentar

function presentarSpec(L, g, rama) {
  const no = (m) => ({ codigo: 1, lineas: [`presentar --spec: no — ${m}`] });
  const p = L.contexto.pestana(rama);
  if (p.tipo !== 'director') return no(`esta pestaña está en ${rama || '(sin rama)'}: --spec corre desde el worktree del director (modulo/<x>)`);
  const ref = L.E.refMasNueva(g.raiz, `modulo/${p.modulo}`);
  if (!ref.ok) return no(ref.por);
  const ruta = `docs/modulos/${p.modulo}/SPEC.md`;
  const s = chequearSpec(L, g.raiz, ref, ruta);
  if (!s.ok) return no(s.por);
  return { codigo: 0, lineas: [`presentar --spec: ${ruta} en ${ref.nombre} @${ref.sha.slice(0, 7)} · sellado y READY: se puede repartir`] };
}

function presentar(L, g, a, opciones) {
  const rama = L.contexto.rama(g.raiz);
  if (a.spec) return presentarSpec(L, g, rama);
  const n = a.nombre;
  const no = (m) => ({ codigo: 1, lineas: [`presentar: no — ${m}`] });
  // 1. La rama del cwd.
  if (rama !== n.rama) return no(`esta pestaña está en ${rama || '(sin rama)'}, el encargo es de ${n.rama}: abrí la del worktree`);
  // 2. El encargo, commiteado y según la plantilla.
  const u = L.E.ubicarEncargo(g.raiz, n);
  if (!u.ok) return no(u.por);
  const e = L.E.leerEncargo(u.texto, n);
  if (e.errores.length) return no(`el encargo ${u.ruta} no sigue la plantilla: ${e.errores.join('; ')}: que el director lo corrija y lo commitee`);
  // 3. El spec de - Spec:, con su sello y READY.
  const s = chequearSpec(L, g.raiz, u.ref, e.campos.spec.ruta);
  if (!s.ok) return no(s.por);
  // 4. Lo que se presenta, y la base.
  const head = L.E.shaDe(g.raiz, 'HEAD');
  const c = e.campos;
  const lineas = [
    `${n.rama} · @${head ? head.slice(0, 7) : '???????'} · encargo ${u.ruta} · ${c.modelo.modelo} ${c.modelo.esfuerzo} · riesgo ${c.riesgo.riesgo} · apertura ${c.apertura}`,
  ];
  if (!a.sinBase) lineas.push(lineaBase(datosFicha(L, g.raiz), g.raiz, opciones));
  return { codigo: 0, lineas };
}

// ---------------------------------------------------------------- mensaje

function mensaje(L, g, a) {
  const rama = L.contexto.rama(g.raiz);
  const r = L.E.juzgarMensaje({
    texto: a.texto,
    rol: L.contexto.rol(g.raiz),
    pestana: L.contexto.pestana(rama),
    rutaEnModulo: (x, ruta, sha) => L.E.rutaEnModulo(g.raiz, x, ruta, sha),
  });
  return { codigo: r.codigo, lineas: [r.linea] };
}

// ---------------------------------------------------------------- main

function main(argv, opciones = {}) {
  const salida = opciones.salida || ((s) => process.stdout.write(s));
  const error = opciones.error || ((s) => process.stderr.write(s));
  let r;
  try {
    const L = libs();
    const a = leerArgumentos(argv, L.E);
    if (a.comando === 'autorizado' || a.comando === 'verificar') {
      error(`encargo ${a.comando}: llega en E2 (paquete 5, D5.1)\n`);
      return 2;
    }
    const g = L.contexto.datosGit(opciones.cwd || process.cwd());
    if (!g) r = { codigo: 1, lineas: ['encargo: no estás dentro de un repo git'] };
    else if (a.comando === 'partida') r = partida(L, g, a.nombre, opciones);
    else if (a.comando === 'presentar') r = presentar(L, g, a, opciones);
    else r = mensaje(L, g, a);
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

module.exports = { USO, ROTO, PLAZO_BASE_MS, leerArgumentos, isoConZona, main };
