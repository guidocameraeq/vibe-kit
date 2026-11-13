'use strict';
// estado.cjs — la vista de /estado (SPEC-0 5.3; C §2.5, §3bis; SPEC-paquete-8d B2). Uso, desde el checkout principal:
//   node .claude/scripts/estado.cjs                       la del dueño: TE NECESITO · EL PLAN · LO QUE SE HIZO · LO QUE FALTA
//   node .claude/scripts/estado.cjs <x>                   la del dueño, de un módulo
//   node .claude/scripts/estado.cjs --director [<x>]      la vista del director (la de abajo; la de antes de la rc.7)
// La del dueño: siempre las cuatro secciones, en ese orden ("- nada" si no hay); TE NECESITO sale de lib/espera.cjs (la lista
// única); lo cerrado, de lib/encargo.cjs estadoEncargo (la cuenta única); lo que falta, con la mediana de los encargos cerrados
// del módulo (con menos de tres: "no sé todavía"; nunca un número inventado). La del director:
// Arriba, TE ESPERA (con `.kit-noche` en este checkout, antes una línea: "es de noche: el director trabaja solo"; de las fichas docs/modulos/*/README.md, con "desde <fecha>" que da git: el commit en que entró el renglón).
// Después una línea por módulo activo (Estado: EN OBRA o PAUSADO): avance MEDIDO (tareas tildadas / tareas de la ficha; sin tareas,
// "avance —": nunca inventado), encargos en obra y sub-pasos (de git, vía tiempos.cjs), "podés cerrar: …" (las pestañas de obrero
// de "## Sesiones vivas" cuya rama ya está mergeada en modulo/<x>: el director ya verificó su CIERRE), las esperas (lo parado de la
// ficha, con "desde", y los `espera hasta:` vencidos de docs/TODO.md) y el uso: la primera línea de contexto.cjs, tal cual
// (`uso: NO VERIFICADO (falta contexto.cjs)` si no está). docs/ es la carpeta de papeles: la `carpeta-docs:` de la ficha vigente si
// la hay (SPEC-paquete-8r3 i1; lib/docs-ruta.cjs). Las líneas propias del proyecto van en .claude/estado-lineas.md (una por
// renglón; vacíos y # no cuentan) y se suman tal cual al final, en cualquier pestaña y PC. Si son las 18 h o más y falta el
// resumen del día, la última línea dice cuál comando correr (resumen.cjs): /estado lo corre y lo muestra una sola vez.
// Solo información: nada frena y nadie decide por esto. Salidas: 0 anduvo · 1 el módulo no existe · 2 mal llamado.
// Node estándar, cero dependencias. Es .cjs a propósito: corre igual en proyectos con "type": "module".

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const git = require('../hooks/lib/git.cjs');
const E = require('../hooks/lib/encargo.cjs');
const iny = require('../hooks/lib/inyeccion.cjs');
const docsRuta = require('../hooks/lib/docs-ruta.cjs');
const T = require('./tiempos.cjs');

// Una ruta dentro de la carpeta de papeles del checkout (8r3 i1): papeles(raiz, 'TODO.md') → docs/TODO.md sin la clave.
const papeles = (raiz, sub) => docsRuta.rel(docsRuta.deRaiz(raiz), sub);

const USO = [
  'Uso: node .claude/scripts/estado.cjs [--director] [<x>]   (desde el checkout principal)',
  '  (sin nombre)          la vista del dueño: te necesito, el plan, lo que se hizo y lo que falta',
  '  <x>                   la vista del dueño, del módulo <x>',
  '  --director [<x>]      la del director: te espera, una línea por módulo activo (o el módulo <x>), uso y líneas propias',
  '  --ayuda               este texto',
].join('\n');

const LINEAS_PROPIAS = '.claude/estado-lineas.md';
// La marca de la noche (la escribe `noche.cjs me-voy` en la raíz del worktree del director; t12c de D8r.2): con ella en este
// checkout, la primera línea lo dice, arriba de TE ESPERA.
const ARCHIVO_NOCHE = '.kit-noche';
const LINEA_NOCHE = 'es de noche: el director trabaja solo';
const deNoche = (raiz) => (fs.existsSync(path.join(raiz, ARCHIVO_NOCHE)) ? [LINEA_NOCHE, ''] : []);
const HORA_RESUMEN = 18;
const T_GIT = 60000;
const G = (cwd, args) => git.correr(args, { cwd, tiempo: T_GIT });

const dos = (n) => String(n).padStart(2, '0');
const hoyDe = (d) => `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;

// ---------------------------------------------------------------- la ficha

// Los renglones de cada `## sección`: { nombre → [renglones] }; y los campos `- Clave: valor` de las primeras 20 líneas.
function leerFicha(texto) {
  const lineas = String(texto).replace(/\r\n/g, '\n').split('\n');
  const campos = {};
  lineas.slice(0, 20).forEach((l) => {
    const m = /^- ([A-Za-zñÑáéíóú-]+): (.*)$/.exec(l);
    if (m && !(m[1].toLowerCase() in campos)) campos[m[1].toLowerCase()] = m[2].trim();
  });
  const secciones = [];
  let actual = null;
  for (const l of lineas) {
    const s = /^## (.+)$/.exec(l);
    if (s) {
      actual = { nombre: s[1].trim(), lineas: [] };
      secciones.push(actual);
    } else if (actual) actual.lineas.push(l);
  }
  return { titulo: (lineas.find((l) => /^# /.test(l)) || '').replace(/^# /, ''), campos, secciones };
}

const seccion = (f, re) => f.secciones.filter((s) => re.test(s.nombre)).flatMap((s) => s.lineas);
const esNada = (t) => /^\(?\s*(nada|ninguno|ninguna|—|-)\s*\)?\.?$/i.test(t.trim());
// Los renglones `- algo` de primer nivel de una sección (sin los vacíos ni "(nada)").
function bullets(lineas) {
  return lineas
    .filter((l) => /^- /.test(l) && !/^- \[[ xX]\]/.test(l))
    .map((l) => l.replace(/^- /, '').trim())
    .filter((t) => t && !esNada(t));
}

// Las tareas de la ficha: { hechas, total }. El % sale de acá y de ningún otro lado.
function tareas(f) {
  const ts = seccion(f, /^Tareas/i).filter((l) => /^- \[[ xX]\]/.test(l));
  return { hechas: ts.filter((l) => /^- \[[xX]\]/.test(l)).length, total: ts.length };
}
const porcentaje = (t) => (t.total > 0 ? Math.round((100 * t.hechas) / t.total) : null);

// Las sesiones vivas: [{ nombre, rama }].
function sesionesVivas(f) {
  return seccion(f, /^Sesiones vivas/i)
    .filter((l) => /^- /.test(l))
    .map((l) => l.replace(/^- /, '').split(' · ').map((s) => s.trim()))
    .filter((p) => p.length >= 4 && p[0] && !esNada(p[0]))
    .map((p) => ({ nombre: p[0], rama: p[3] }));
}

const activo = (f) => /^(EN OBRA|PAUSADO)/.test(f.campos.estado || '');

// Las fichas del checkout: [{ x, ruta, texto, ficha }]. Con `rama:` se lee la más nueva de esa rama (git manda); si no, el disco.
function fichas(raiz) {
  const dir = path.join(raiz, ...papeles(raiz, 'modulos').split('/'));
  let nombres;
  try {
    nombres = fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
  } catch (e) {
    return [];
  }
  const out = [];
  for (const x of nombres) {
    const rel = papeles(raiz, `modulos/${x}/README.md`);
    let texto = null;
    try {
      texto = fs.readFileSync(path.join(raiz, rel), 'utf8');
    } catch (e) {
      /* sin ficha del kit */
    }
    if (texto === null) continue;
    let f = leerFicha(texto);
    if (f.campos.rama) {
      try {
        const ref = E.refMasNueva(raiz, f.campos.rama);
        const b = ref.ok ? E.leerEn(raiz, ref.sha, rel) : null;
        if (b) {
          texto = b.toString('utf8');
          f = leerFicha(texto);
        }
      } catch (e) {
        /* queda la del disco */
      }
    }
    out.push({ x, rel, texto, ficha: f, conDirector: /^s[ií]/i.test(f.campos.director || '') });
  }
  return out;
}

// "desde <fecha>": el commit más viejo en que entró ese renglón a la ficha. null si git no lo sabe (sin commitear).
function desdeCuando(raiz, rel, renglon) {
  const r = G(raiz, ['log', '--format=%cs', '--reverse', '--all', `-S${renglon}`, '--', rel]);
  if (!r.ok) return null;
  const f = r.stdout.split('\n').map((s) => s.trim()).filter(Boolean)[0];
  return f || null;
}
const conDesde = (raiz, rel, t) => {
  const d = desdeCuando(raiz, rel, `- ${t}`);
  return `${t} · desde ${d || '— (sin commitear)'}`;
};

// ---------------------------------------------------------------- las esperas del TODO

// Los ítems de docs/TODO.md con `espera hasta: AAAA-MM-DD` ya vencida: [{ texto, fecha }].
function esperasVencidas(raiz, hoy) {
  let t;
  try {
    t = fs.readFileSync(path.join(raiz, ...papeles(raiz, 'TODO.md').split('/')), 'utf8').replace(/\r\n/g, '\n');
  } catch (e) {
    return [];
  }
  const items = [];
  let actual = null;
  for (const l of t.split('\n')) {
    if (/^- \[[ xX]\] /.test(l)) {
      actual = { primera: l.replace(/^- \[[ xX]\] /, '').trim(), todo: l };
      items.push(actual);
    } else if (actual && /^\s+\S/.test(l)) actual.todo += `\n${l}`;
    else if (!/^\s*$/.test(l)) actual = null;
  }
  const out = [];
  for (const it of items) {
    if (/^- \[[xX]\]/.test(it.todo)) continue;
    const m = /espera hasta:\s*(\d{4}-\d{2}-\d{2})/i.exec(it.todo);
    if (m && m[1] < hoy) out.push({ texto: it.primera.replace(/espera hasta:.*$/i, '').trim() || it.primera, fecha: m[1] });
  }
  return out;
}

// ---------------------------------------------------------------- uso y líneas propias

function lineaUso(raiz, opciones) {
  const script = opciones.contexto || path.join(__dirname, 'contexto.cjs');
  if (!fs.existsSync(script)) return 'uso: NO VERIFICADO (falta contexto.cjs)';
  const r = spawnSync(process.execPath, [script], { cwd: raiz, encoding: 'utf8', timeout: 20000, windowsHide: true });
  const primera = (r.stdout || '').split('\n').map((s) => s.trim()).find((s) => /^contexto:/.test(s));
  return primera ? `uso: ${primera}` : 'uso: NO VERIFICADO (contexto.cjs no dio su línea)';
}

function lineasPropias(raiz) {
  let t;
  try {
    t = fs.readFileSync(path.join(raiz, ...LINEAS_PROPIAS.split('/')), 'utf8');
  } catch (e) {
    return [];
  }
  return t.replace(/\r\n/g, '\n').split('\n').map((l) => l.replace(/\s+$/, '')).filter((l) => l.trim() && !/^\s*#/.test(l) && !/^\s*<!--/.test(l));
}

// ---------------------------------------------------------------- la vista

// Los encargos de un módulo con director: { datos, enObra, subpasos } (de git).
function encargosDe(raiz, x) {
  const datos = T.datosModulo(raiz, x);
  const madre = (() => {
    try {
      const r = E.refMasNueva(raiz, `modulo/${x}`);
      return r.ok ? r.sha : null;
    } catch (e) {
      return null;
    }
  })();
  const filas = datos.map((d) => {
    let mergeado = false;
    try {
      mergeado = !!madre && d.subpasos > 0 && E.esAncestro(raiz, d.punta, madre); // una rama recién creada, sin commits, no es una mergeada
    } catch (e) {
      /* se cuenta en obra: lo que no se pudo mirar no se da por cerrado */
    }
    return { ...d, mergeado };
  });
  return { filas, enObra: filas.filter((f) => !f.mergeado).length, subpasos: filas.reduce((a, f) => a + f.subpasos, 0) };
}

// "podés cerrar: obrero-m--07, …": las sesiones vivas cuya rama es de un encargo ya mergeado.
function podesCerrar(f, enc) {
  const mergeadas = new Set(enc.filas.filter((e) => e.mergeado).map((e) => e.rama));
  return sesionesVivas(f).filter((s) => mergeadas.has(s.rama)).map((s) => s.nombre);
}

// La línea del módulo. Con `- Tramo: <N> cerrado <fecha>` y `Próximo paso:` en la ficha (los escribe el obrero de cierre de tramo,
// SPEC-paquete-8c c1), suma `tramo <N> cerrado` y `próximo: …`, leídos como los lee el arranque (datosFichaModulo).
function lineaModulo(raiz, m) {
  const f = m.ficha;
  const t = tareas(f);
  const p = porcentaje(t);
  const df = iny.datosFichaModulo(m.texto);
  const partes = [m.x, f.campos.estado || 'sin Estado'];
  if (df.tramo !== null) partes.push(`tramo ${df.tramo} cerrado`);
  partes.push(p === null ? 'avance —' : `${t.hechas} de ${t.total} tareas (${p}%)`);
  let cerrar = [];
  if (m.conDirector) {
    const enc = encargosDe(raiz, m.x);
    partes.push(`${enc.enObra} encargo(s) en obra`, `${enc.subpasos} sub-paso(s)`);
    cerrar = podesCerrar(f, enc);
  }
  partes.push(`podés cerrar: ${cerrar.length ? cerrar.join(', ') : 'nadie'}`);
  if (df.proximo) partes.push(`próximo: ${df.proximo}`);
  return partes.join(' · ');
}

function teEspera(raiz, ms) {
  const out = [];
  for (const m of ms) {
    for (const t of bullets(seccion(m.ficha, /te espera/i))) out.push(`- [${m.x}] ${conDesde(raiz, m.rel, t)}`);
  }
  return out;
}

function esperas(raiz, ms, hoy) {
  const out = [];
  for (const m of ms) {
    for (const t of bullets(seccion(m.ficha, /^(Parado|Trabado)/i))) out.push(`- [${m.x}] ${conDesde(raiz, m.rel, t)}`);
  }
  for (const v of esperasVencidas(raiz, hoy)) out.push(`- TODO: ${v.texto} · espera vencida (hasta ${v.fecha})`);
  return out;
}

// ¿Falta el resumen del día? → los comandos que lo arman (vacío si no son las 18 h o ya está).
function resumenPendiente(raiz, ms, ahora) {
  if (ahora.getHours() < HORA_RESUMEN) return [];
  const R = require('./resumen.cjs');
  const fecha = hoyDe(ahora);
  const conDir = ms.filter((m) => m.conDirector && activo(m.ficha));
  if (conDir.length) return conDir.filter((m) => !fs.existsSync(R.rutaResumen(raiz, m.x, fecha))).map((m) => `node .claude/scripts/resumen.cjs ${m.x}`);
  return R.yaMostrado(raiz, fecha) ? [] : ['node .claude/scripts/resumen.cjs'];
}

function vistaProyecto(raiz, opciones, ahora) {
  const ms = fichas(raiz);
  const act = ms.filter((m) => activo(m.ficha));
  const hoy = hoyDe(ahora);
  const L = [...deNoche(raiz), 'TE ESPERA'];
  const te = teEspera(raiz, act);
  L.push(...(te.length ? te : ['- nada']));
  L.push('', 'MÓDULOS');
  if (!act.length) L.push(`- (ningún módulo activo${ms.length ? '' : `: no hay fichas en ${papeles(raiz, 'modulos/')}`})`);
  for (const m of act) L.push(`- ${lineaModulo(raiz, m)}`);
  const es = esperas(raiz, act, hoy);
  if (es.length) L.push('', 'ESPERAS', ...es);
  L.push('', lineaUso(raiz, opciones));
  const propias = lineasPropias(raiz);
  if (propias.length) L.push('', ...propias);
  const falta = resumenPendiente(raiz, ms, ahora);
  if (falta.length) L.push('', `resumen del día: falta (son las ${dos(ahora.getHours())}:${dos(ahora.getMinutes())}, ≥ ${HORA_RESUMEN} h) — corré: ${falta.join(' · ')}`);
  return L;
}

function vistaModulo(raiz, m, opciones, ahora) {
  const f = m.ficha;
  const hoy = hoyDe(ahora);
  const t = tareas(f);
  const p = porcentaje(t);
  const L = [`${m.x} · ${f.campos.estado || 'sin Estado'}${f.campos.rama ? ` · ${f.campos.rama}` : ''}`];
  const fase = seccion(f, /^Fase/i).map((l) => l.trim()).filter(Boolean);
  if (fase.length) L.push(`fase: ${fase.slice(0, 3).join(' ')}`);
  L.push(p === null ? 'avance: —' : `avance: ${t.hechas} de ${t.total} tareas (${p}%)`);
  L.push('', ...deNoche(raiz), 'TE ESPERA');
  const te = teEspera(raiz, [m]);
  L.push(...(te.length ? te : ['- nada']));
  const es = esperas(raiz, [m], hoy);
  if (es.length) L.push('', 'ESPERAS', ...es);
  if (m.conDirector) {
    const enc = encargosDe(raiz, m.x);
    L.push('', `ENCARGOS: ${enc.filas.length} · ${enc.enObra} en obra · ${enc.subpasos} sub-paso(s)`);
    for (const e of enc.filas) {
      const dv = e.desvios === null ? 'desvíos NO VERIFICADO' : `${e.desvios.length} desvío(s)`;
      L.push(`- ${e.id} · ${e.mergeado ? 'mergeado' : 'en obra'} · ${e.subpasos} sub-paso(s) · ${e.minutos} min · ${dv}`);
    }
    const g = T.totalGuardado(raiz, m.x);
    L.push(g ? `tiempos.md: ${g.encargos} encargo(s) · ${g.subpasos} sub-paso(s) · ${g.minutos} min` : 'tiempos.md: — (sin tiempos.md todavía: corré tiempos.cjs tiempos ' + m.x + ')');
    const cerrar = podesCerrar(f, enc);
    L.push(`podés cerrar: ${cerrar.length ? cerrar.join(', ') : 'nadie'}`);
  }
  L.push('', lineaUso(raiz, opciones));
  const propias = lineasPropias(raiz);
  if (propias.length) L.push('', ...propias);
  return L;
}

// ---------------------------------------------------------------- la vista del dueño (SPEC-paquete-8d B2, tracker 32, 54, 24)
// Siempre las mismas cuatro secciones, en este orden; una sección sin nada dice "- nada". Sin SHAs, ids sueltos, comandos ni
// "rojo/verde": es lo que lee el dueño. El formato de la ficha que lee (rt-14): `- Plan: lista | cola` en la cabecera (sin el
// renglón, lista) y, en `## Tareas`, un `### Tramo <N>` por tramo (sin esas marcas, un solo tramo).

const SECCIONES_DUENO = ['TE NECESITO', 'EL PLAN', 'LO QUE SE HIZO', 'LO QUE FALTA'];
const MIN_PARA_ESTIMAR = 3;

// Las tareas de la ficha por tramo: [{ n, tareas: [{ texto, hecha }] }]. Sin `### Tramo`, un solo tramo (n = null).
function tramosDe(f) {
  const tramos = [];
  let actual = null;
  for (const l of seccion(f, /^Tareas/i)) {
    const t = /^###\s+Tramo\s+(\d+)/i.exec(l);
    if (t) {
      actual = { n: Number(t[1]), tareas: [] };
      tramos.push(actual);
      continue;
    }
    const m = /^- \[([ xX])\]\s+(.*)$/.exec(l);
    if (!m) continue;
    if (!actual) {
      actual = { n: null, tareas: [] };
      tramos.push(actual);
    }
    actual.tareas.push({ texto: m[2].trim(), hecha: m[1] !== ' ' });
  }
  return tramos.filter((t) => t.tareas.length);
}
const esCola = (f) => /^cola\b/i.test(f.campos.plan || '');

// Los encargos de un módulo, con su estado (la cuenta única de B1) y sus minutos: [{ id, titulo, estado, minutos, fin }].
// Los ids salen de los encargos commiteados (en modulo/<x> o, ya integrado, en la rama por defecto); los minutos, de las ramas que
// quedan y, si la rama ya no está, del renglón que dejó tiempos.md (nunca de la memoria de nadie).
function encargosDelModulo(raiz, x) {
  const dir = papeles(raiz, `modulos/${x}/bitacora`);
  let defecto = null;
  try {
    defecto = require('../hooks/lib/contexto.cjs').ramaPorDefecto(raiz);
  } catch (e) {
    defecto = null;
  }
  const fuentes = [E.puntaDe(raiz, `modulo/${x}`), defecto ? E.puntaDe(raiz, defecto) : null].filter(Boolean);
  const ids = new Map();
  for (const sha of fuentes) {
    const r = G(raiz, ['ls-tree', '-z', '--name-only', sha, '--', `${dir}/`]);
    if (!r.ok) continue;
    for (const p of r.stdout.split('\0').filter(Boolean)) {
      const m = /^.+-encargo-([0-9]{2})\.md$/.exec(path.posix.basename(p));
      if (!m || path.posix.dirname(p) !== dir || ids.has(m[1])) continue;
      const t = G(raiz, ['show', `${sha}:${p}`]);
      const tt = t.ok ? /^# Encargo \S+ · \S+ · (.+)$/m.exec(t.stdout) : null;
      ids.set(m[1], tt ? tt[1].trim() : '');
    }
  }
  const vivos = new Map();
  try {
    for (const d of T.datosModulo(raiz, x)) vivos.set(d.id, d);
  } catch (e) {
    /* sin ramas que mirar */
  }
  let previas = [];
  try {
    previas = T.filasPrevias(fs.readFileSync(path.join(raiz, ...papeles(raiz, `modulos/${x}/tiempos.md`).split('/')), 'utf8'));
  } catch (e) {
    previas = [];
  }
  const out = [];
  for (const [id, titulo] of [...ids.entries()].sort()) {
    const v = vivos.get(id);
    const p = previas.find((f) => f.id === id);
    let minutos = null;
    let fin = null;
    if (v && v.commits && v.commits.length) {
      minutos = v.minutos;
      fin = v.ultimo * 1000;
    } else if (p && /^\d+$/.test(p.celdas[3] || '')) {
      minutos = Number(p.celdas[3]);
      const f = Date.parse(String(p.celdas[2] || '').replace(' ', 'T'));
      fin = Number.isFinite(f) ? f : null;
    }
    let estado = 'en obra';
    try {
      estado = E.estadoEncargo(raiz, x, id, { defecto });
    } catch (e) {
      /* lo que no se pudo mirar no se da por cerrado */
    }
    out.push({ id, titulo, estado, minutos, fin });
  }
  return out;
}

const mediana = (ns) => {
  const s = [...ns].sort((a, b) => a - b);
  if (!s.length) return null;
  const k = Math.floor(s.length / 2);
  return s.length % 2 ? s[k] : Math.round((s[k - 1] + s[k]) / 2);
};
const enHoras = (min) => (min < 60 ? `${min} min` : `${Math.round((min / 60) * 2) / 2} h`.replace('.', ','));

function vistaDueno(raiz, ms, ahora, soloUno) {
  const L = [...deNoche(raiz)];
  // 1. TE NECESITO: la lista única (B1), cada ítem en una línea.
  const espera = require('../hooks/lib/espera.cjs');
  let te = [];
  try {
    te = espera.teEspera(raiz, { ahora });
  } catch (e) {
    te = [];
  }
  L.push('TE NECESITO');
  L.push(...(te.length ? te.map((i) => `- ${i.texto} · ${i.tipo === 'clic' ? 'un clic tuyo' : 'una decisión tuya'}${i.desde ? ` · desde ${i.desde}` : ''} (${i.fuente})`) : ['- nada']));
  // 2-4: por módulo
  const plan = [];
  const hecho = [];
  const falta = [];
  const desde24 = ahora.getTime() - 24 * 3600 * 1000;
  for (const m of ms) {
    const f = m.ficha;
    const tramos = tramosDe(f);
    const todas = tramos.flatMap((t) => t.tareas);
    const enc = m.conDirector ? encargosDelModulo(raiz, m.x) : [];
    const cerrados = enc.filter((e) => e.estado === 'cerrado');
    const minutos = cerrados.map((e) => e.minutos).filter((n) => Number.isFinite(n));
    const med = minutos.length >= MIN_PARA_ESTIMAR ? mediana(minutos) : null;
    const pendientes = todas.filter((t) => !t.hecha);
    if (esCola(f)) {
      const hechos = cerrados.length + todas.filter((t) => t.hecha).length;
      plan.push(`- ${m.x}: es una cola: ${hechos} hecho(s), ${pendientes.length} abierto(s)`);
    } else if (!todas.length) {
      plan.push(`- ${m.x}: sin tareas en la ficha (no hay de dónde medir el avance)`);
    } else {
      const actual = tramos.find((t) => t.tareas.some((x) => !x.hecha)) || tramos[tramos.length - 1];
      const cerradosT = tramos.filter((t) => t.tareas.every((x) => x.hecha)).length;
      const pctPlan = Math.round((100 * todas.filter((t) => t.hecha).length) / todas.length);
      const pctTramo = Math.round((100 * actual.tareas.filter((t) => t.hecha).length) / actual.tareas.length);
      const partes = [`- ${m.x}:`];
      if (tramos.length > 1) partes.push(`en el tramo ${actual.n} · ${cerradosT} de ${tramos.length} tramos cerrados ·`);
      partes.push(`el plan va ${pctPlan}%`);
      if (tramos.length > 1) partes.push(`· el tramo ${pctTramo}%`);
      partes.push(`· falta: ${!pendientes.length ? 'nada' : med === null ? 'no sé todavía' : `~${enHoras(med * pendientes.length)}`}`);
      plan.push(partes.join(' '));
    }
    for (const e of cerrados) {
      if (!soloUno && !(e.fin && e.fin >= desde24)) continue;
      hecho.push(`- ${m.x}: ${e.titulo || 'un encargo'}${Number.isFinite(e.minutos) ? ` · ${e.minutos} min` : ''}`);
    }
    for (const t of pendientes) falta.push(`- ${m.x}: ${t.texto} · ${med === null ? 'no sé todavía' : `~${enHoras(med)}`}`);
  }
  L.push('', 'EL PLAN', ...(plan.length ? plan : ['- nada']));
  L.push('', 'LO QUE SE HIZO', ...(hecho.length ? hecho : ['- nada']));
  L.push('', 'LO QUE FALTA', ...(falta.length ? falta : ['- nada']));
  return L;
}

// ---------------------------------------------------------------- principal

function main(argv, opciones = {}) {
  const salida = opciones.salida || ((s) => process.stdout.write(s));
  const error = opciones.error || ((s) => process.stderr.write(s));
  const cwd = opciones.cwd || process.cwd();
  const ahora = opciones.ahora || new Date();
  if (argv[0] === '--ayuda' || argv[0] === '-h') {
    salida(`${USO}
`);
    return 0;
  }
  if (argv[0] !== '--director') {
    if (argv.length > 1 || (argv[0] && (argv[0].startsWith('-') || !E.RE_X.test(argv[0])))) {
      error(`${argv.length > 1 ? 'Sobran argumentos.' : `"${argv[0]}" no es un nombre de módulo.`}\n${USO}\n`);
      return 2;
    }
    const raiz = T.raizDe(cwd);
    if (!raiz) {
      error(`No estoy dentro de un repo git.\n${USO}\n`);
      return 2;
    }
    const todas = fichas(raiz);
    if (argv[0]) {
      const m = todas.find((f) => f.x === argv[0]);
      if (!m) {
        salida(`No encuentro el módulo "${argv[0]}". Los que hay: ${todas.map((f) => f.x).join(', ') || 'ninguno'}\n`);
        return 1;
      }
      salida(`${vistaDueno(raiz, [m], ahora, true).join('\n')}\n`);
      return 0;
    }
    salida(`${vistaDueno(raiz, todas.filter((m) => activo(m.ficha)), ahora, false).join('\n')}\n`);
    return 0;
  }
  argv = argv.slice(1);
  if (argv.length > 1 || (argv[0] && (argv[0].startsWith('-') || !E.RE_X.test(argv[0])))) {
    error(`${argv.length > 1 ? 'Sobran argumentos.' : `"${argv[0]}" no es un nombre de módulo.`}\n${USO}\n`);
    return 2;
  }
  const raiz = T.raizDe(cwd);
  if (!raiz) {
    error(`No estoy dentro de un repo git.\n${USO}\n`);
    return 2;
  }
  if (argv[0]) {
    const m = fichas(raiz).find((f) => f.x === argv[0]);
    if (!m) {
      salida(`estado: no hay ficha de "${argv[0]}" (${papeles(raiz, `modulos/${argv[0]}/README.md`)}). Módulos con ficha: ${fichas(raiz).map((f) => f.x).join(', ') || 'ninguno'}\n`);
      return 1;
    }
    salida(`${vistaModulo(raiz, m, opciones, ahora).join('\n')}\n`);
    return 0;
  }
  salida(`${vistaProyecto(raiz, opciones, ahora).join('\n')}\n`);
  return 0;
}

// Antes de main(): resumen.cjs pide este módulo (después de las 18 h) y con los exports al final lo veía vacío (D8r.4).
module.exports = { SECCIONES_DUENO, tramosDe, encargosDelModulo, vistaDueno, USO, LINEAS_PROPIAS, LINEA_NOCHE, HORA_RESUMEN, papeles, leerFicha, seccion, bullets, tareas, porcentaje, sesionesVivas, activo, fichas, desdeCuando, esperasVencidas, encargosDe, hoyDe, main };

if (require.main === module) {
  let codigo = 2;
  try {
    codigo = main(process.argv.slice(2));
  } catch (e) {
    process.stderr.write(`estado roto: ${e && e.message}\n`);
  }
  process.exitCode = codigo;
}
