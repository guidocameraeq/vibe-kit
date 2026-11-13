'use strict';
// espera.cjs — la lista ÚNICA de lo que espera al dueño (SPEC-paquete-8d B1, tracker 47, 24, 21). La leen `/estado` ("Te necesito")
// y el parte de la noche: antes eran cuatro listas y el dueño veía una.
//   teEspera(raiz[, { ahora }]) → [{ texto, fuente, desde, tipo }], sin repetidos (el mismo texto en dos fuentes sale una vez).
// Las fuentes, en este orden: los cambios de freno `propuesto` (clase 3-barrera: piden el clic del dueño), lo que dejó publicar
// esperando (kit-publicacion.json del git común: la autorización de esta PC, o la publicación trabada) y las fusiones del
// actualizador que esperan (.claude/fusiones/*.md) · la sección "Te espera" de cada ficha activa (Estado: EN OBRA o PAUSADO) · la
// del handoff · los `espera hasta:` vencidos del TODO · la sección "Te necesito" del último parte de la noche.
// tipo: `clic` (aprobar un cambio: lo hace el dueño con un clic) · `decisión` (todo lo demás). desde: AAAA-MM-DD o null.
// Solo lee: nunca escribe ni frena. Lo que no se puede leer no está. Node estándar, cero dependencias. Es .cjs a propósito.

const fs = require('fs');
const path = require('path');
const git = require('./git.cjs');
const docsRuta = require('./docs-ruta.cjs');

const T_GIT = 60000;
const leer = (p) => {
  try {
    return fs.readFileSync(p, 'utf8').replace(/^﻿/, '').replace(/\r\n/g, '\n');
  } catch (e) {
    return null;
  }
};
const dos = (n) => String(n).padStart(2, '0');
const diaDe = (d) => `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
const papeles = (raiz, sub) => path.join(raiz, ...docsRuta.rel(docsRuta.deRaiz(raiz), sub).split('/'));
const papelesRel = (raiz, sub) => docsRuta.rel(docsRuta.deRaiz(raiz), sub);

// Los renglones de una sección `## <nombre>` (el nombre por regex, sin mayúsculas).
function seccion(texto, re) {
  const out = [];
  let dentro = false;
  for (const l of String(texto).split('\n')) {
    const s = /^## (.+)$/.exec(l);
    if (s) dentro = re.test(s[1].trim());
    else if (dentro) out.push(l);
  }
  return out;
}
const esNada = (t) => /^\(?\s*(nada|ninguno|ninguna|—|-)\s*\)?\.?$/i.test(t.trim());
// Los `- algo` de primer nivel (sin tareas `- [ ]`, sin vacíos ni "nada").
const bullets = (lineas) =>
  lineas
    .filter((l) => /^- /.test(l) && !/^- \[[ xX]\]/.test(l))
    .map((l) => l.replace(/^- /, '').trim())
    .filter((t) => t && !esNada(t));
const campo = (texto, nombre) => {
  const m = new RegExp(`^- ${nombre}: (.*)$`, 'mi').exec(String(texto).split('\n').slice(0, 20).join('\n'));
  return m ? m[1].trim() : null;
};
// La clave para no repetir: sin mayúsculas, tildes, puntuación ni espacios de más.
const clave = (t) =>
  String(t)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[`*_"'.,;:!?¿¡()[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// "desde": el commit más viejo en que entró ese renglón al archivo (git log -S). null si git no lo sabe.
function desdeGit(raiz, rel, renglon) {
  const r = git.correr(['log', '--format=%cs', '--reverse', `-S${renglon}`, '--', rel], { cwd: raiz, tiempo: T_GIT });
  if (!r.ok) return null;
  return r.stdout.split('\n').map((s) => s.trim()).filter(Boolean)[0] || null;
}

// ---------------------------------------------------------------- las fuentes

function deCambios(raiz) {
  const out = [];
  let C;
  try {
    C = require('./cambios.cjs');
  } catch (e) {
    return out;
  }
  let lista = [];
  try {
    lista = C.listarArchivos(raiz);
  } catch (e) {
    return out;
  }
  for (const a of lista) {
    let c;
    try {
      c = a.id ? C.cargar(a) : null;
    } catch (e) {
      c = null;
    }
    if (!c || c.error || !c.datos || c.datos.estado !== 'propuesto' || c.datos.clase !== '3-barrera') continue;
    const regla = C.reglaEnUnaLinea(c.cuerpo) || 'un cambio en un freno';
    out.push({ texto: `firmar el cambio de freno: ${regla}`, fuente: 'cambio propuesto', desde: (/^(\d{4}-\d{2}-\d{2})-/.exec(a.id) || [])[1] || null, tipo: 'clic', ref: a.id });
  }
  return out;
}

function deFusiones(raiz) {
  const dir = path.join(raiz, '.claude', 'fusiones');
  let nombres = [];
  try {
    nombres = fs.readdirSync(dir).filter((n) => n.endsWith('.md')).sort();
  } catch (e) {
    return [];
  }
  return nombres.map((n) => ({ texto: `elegir qué hacer con la pieza del kit "${n.slice(0, -3)}" que no se pudo poner al día sola`, fuente: 'puesta al día del kit', desde: null, tipo: 'decisión' }));
}

// La ficha de cada módulo activo: la del disco; si dice `- Rama:`, la más nueva de esa rama (git manda, como en estado.cjs).
function deFichas(raiz) {
  const out = [];
  const dir = papeles(raiz, 'modulos');
  let nombres = [];
  try {
    nombres = fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
  } catch (e) {
    return out;
  }
  for (const x of nombres) {
    const rel = papelesRel(raiz, `modulos/${x}/README.md`);
    let texto = leer(path.join(raiz, ...rel.split('/')));
    if (texto === null) continue;
    const rama = campo(texto, 'Rama');
    if (rama) {
      try {
        const E = require('./encargo.cjs');
        const ref = E.refMasNueva(raiz, rama);
        const b = ref.ok ? E.leerEn(raiz, ref.sha, rel) : null;
        if (b) texto = b.toString('utf8').replace(/\r\n/g, '\n');
      } catch (e) {
        /* queda la del disco */
      }
    }
    if (!/^(EN OBRA|PAUSADO)/.test(campo(texto, 'Estado') || '')) continue;
    for (const t of bullets(seccion(texto, /te espera/i))) out.push({ texto: t, fuente: `módulo ${x}`, desde: desdeGit(raiz, rel, `- ${t}`), tipo: 'decisión' });
  }
  return out;
}

function deHandoff(raiz) {
  const rel = papelesRel(raiz, 'SESSION_HANDOFF.md');
  const t = leer(path.join(raiz, ...rel.split('/')));
  if (t === null) return [];
  return bullets(seccion(t, /te espera/i)).map((x) => ({ texto: x, fuente: 'el handoff', desde: desdeGit(raiz, rel, `- ${x}`), tipo: 'decisión' }));
}

function deTodo(raiz, hoy) {
  const t = leer(papeles(raiz, 'TODO.md'));
  if (t === null) return [];
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
    if (m && m[1] < hoy) out.push({ texto: (it.primera.replace(/[\s,;·—-]*espera hasta:.*$/i, '').trim() || it.primera), fuente: 'el TODO (se venció la espera)', desde: m[1], tipo: 'decisión' });
  }
  return out;
}

// El último parte de la noche (<docs>/modulos/*/bitacora/<fecha>-parte.md, el de fecha más nueva): su "Te necesito".
function deParte(raiz) {
  const dir = papeles(raiz, 'modulos');
  let mejor = null;
  let modulos = [];
  try {
    modulos = fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  } catch (e) {
    return [];
  }
  for (const x of modulos) {
    let ns = [];
    try {
      ns = fs.readdirSync(path.join(dir, x, 'bitacora'));
    } catch (e) {
      continue;
    }
    for (const n of ns) {
      const m = /^(\d{4}-\d{2}-\d{2})-parte\.md$/.exec(n);
      if (m && (!mejor || m[1] > mejor.fecha || (m[1] === mejor.fecha && x > mejor.x))) mejor = { fecha: m[1], x, abs: path.join(dir, x, 'bitacora', n) };
    }
  }
  if (!mejor) return [];
  const t = leer(mejor.abs);
  if (t === null) return [];
  return bullets(seccion(t, /^te necesito/i)).map((x) => ({ texto: x, fuente: `el parte de la noche (${mejor.x})`, desde: mejor.fecha, tipo: /firm|clic/i.test(x) ? 'clic' : 'decisión' }));
}

// Lo que dejó `noche.cjs publicar` esperando al dueño (<git común>/kit-publicacion.json, campo teEspera): falta su autorización
// en esta PC, cambió cómo se publica, o la publicación quedó trabada.
function dePublicacion(raiz) {
  const comun = require('./frenos-log.cjs').gitComun(raiz);
  if (!comun) return [];
  let j = null;
  try {
    j = JSON.parse(fs.readFileSync(path.join(comun, 'kit-publicacion.json'), 'utf8'));
  } catch (e) {
    return [];
  }
  if (!j || typeof j.teEspera !== 'string' || !j.teEspera.trim()) return [];
  return [{ texto: j.teEspera.trim(), fuente: 'publicar', desde: typeof j.cuando === 'string' ? j.cuando.slice(0, 10) : null, tipo: 'clic' }];
}

// ---------------------------------------------------------------- la lista

function teEspera(raiz, opciones = {}) {
  const ahora = opciones.ahora instanceof Date ? opciones.ahora : new Date();
  // Revisor frío de B (5): el parte nuevo no lee el anterior (sinParte): si no, cada parte copiaba el "te necesito" del otro y lo
  // resuelto volvía para siempre. /estado sí lo lee (lo de la última noche, hasta el parte siguiente).
  const fuentes = [deCambios, dePublicacion, deFusiones, deFichas, deHandoff, (r) => deTodo(r, diaDe(ahora)), ...(opciones.sinParte ? [] : [deParte])];
  const out = [];
  const vistas = new Set();
  for (const f of fuentes) {
    let items = [];
    try {
      items = f(raiz);
    } catch (e) {
      items = [];
    }
    for (const it of items) {
      const k = clave(it.texto);
      if (!k || vistas.has(k)) continue;
      vistas.add(k);
      out.push(it);
    }
  }
  return out;
}

module.exports = { teEspera, clave, seccion, bullets };
