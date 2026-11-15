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
  // 8e G3 (R2, y la noche 2 del banco): un cambio propuesto con `--en-defecto` vive solo en la rama por defecto de origin hasta el
  // próximo pull; desde la pestaña del director, o desde una carpeta principal atrasada, el disco no lo tiene y "Te necesito"
  // decía nada. Primero los de esa rama (lo que dejó el último fetch: no sale a la red); el disco suma los que ella no tiene.
  const cargados = [];
  const ids = new Set();
  try {
    const X = require('./contexto.cjs');
    const R = require('./cambios-ruta.cjs');
    const dg = X.datosGit(raiz);
    const principal = dg && dg.gitDir !== dg.gitComun ? path.dirname(dg.gitComun) : raiz;
    const rv = X.refVigente(principal);
    if (rv && rv.origen !== 'local') {
      const ls = git.correr(['ls-tree', '-z', '--name-only', rv.ref, '--', `${R.CARPETA}/`], { cwd: raiz, tiempo: T_GIT });
      for (const rel of ls.ok ? ls.stdout.split('\0').filter(Boolean) : []) {
        const id = R.idDeRuta(rel);
        if (!id) continue;
        const t = git.correr(['show', `${rv.ref}:${rel}`], { cwd: raiz, tiempo: T_GIT });
        if (!t.ok) continue;
        ids.add(id);
        try {
          cargados.push({ id, ...C.leer(t.stdout.replace(/\r\n/g, '\n')) });
        } catch (e) {
          /* uno que no se lee no está */
        }
      }
    }
  } catch (e) {
    /* sin git que conteste, queda el disco */
  }
  let lista = [];
  try {
    lista = C.listarArchivos(raiz);
  } catch (e) {
    lista = [];
  }
  for (const a of lista) {
    if (!a.id || ids.has(a.id)) continue;
    try {
      const c = C.cargar(a);
      if (c && !c.error) cargados.push({ id: a.id, datos: c.datos, cuerpo: c.cuerpo });
    } catch (e) {
      /* idem */
    }
  }
  cargados.sort((x, y) => (x.id < y.id ? -1 : x.id > y.id ? 1 : 0));
  for (const c of cargados) {
    const a = { id: c.id };
    if (!c.datos || c.datos.estado !== 'propuesto' || c.datos.clase !== '3-barrera') continue;
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

// ¿Esta PC ya está autorizada a publicar este proyecto como publica hoy? (el mismo cálculo de `noche.cjs publicar`; si algo no se
// puede leer, no)
function pcAutorizada(raiz) {
  try {
    const X = require('./contexto.cjs');
    const P = require('./publicar.cjs');
    const fv = X.fichaVigente(raiz);
    const pub = fv.estado === 'ok' && fv.datos.autorizado && typeof fv.datos.autorizado === 'object' ? fv.datos.autorizado.publicar : null;
    if (!pub || typeof pub !== 'object') return false;
    const url = (git.texto(['remote', 'get-url', 'origin'], { cwd: raiz }) || '').trim();
    const defecto = X.ramaPorDefecto(raiz);
    if (!url || !defecto) return false;
    const home = process.env.KIT_HOME_PC && P.esOriginLocal(url) ? process.env.KIT_HOME_PC : require('os').homedir();
    const mia = (P.autorizacionesPc(home).lista || []).find((e) => e.origin === P.normalizarOrigin(url));
    return !!mia && mia.huella === P.huella(raiz, pub, `refs/remotes/origin/${defecto}`);
  } catch (e) {
    return false;
  }
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
  // 8e c2 (R2): "falta tu autorización" quedaba para siempre después de darla (preparar-pc no toca este archivo): si esta PC ya
  // está autorizada con la huella de hoy, no se pide más.
  if (j.falta === 'autorizacion' && pcAutorizada(raiz)) return [];
  return [{ texto: j.teEspera.trim(), fuente: 'publicar', desde: typeof j.cuando === 'string' ? j.cuando.slice(0, 10) : null, tipo: j.tipoEspera === 'decisión' ? 'decisión' : 'clic' }];
}

// ---------------------------------------------------------------- la lista

// Lo que viene de un modelo (el --no-pude, los renglones de "te espera" que escribió una sesión) pasa por acá antes de llegarle al
// dueño (rt B 10): sin SHAs, sin comandos del kit, sin rojo ni verde. Vivía en noche.cjs (el parte); desde la C (revisor frío de B,
// 6) lo usa también la lista, así /estado no muestra el id y el hash que dejó el handoff.
function paraElDueno(t) {
  let s = String(t)
    .replace(/`[^`]*`/g, (m) => (/node |git |\.cjs/.test(m) ? 'un paso del kit' : m.slice(1, -1)))
    .replace(/\bnode \.claude\/\S+(?: [a-z-]+)?/g, 'un paso del kit')
    // 8e c21 (R2: "el cambio del `git pull` ancho" salía "del un paso del kit ancho"): la contracción se deshace
    .replace(/\bdel (un paso del kit)/g, 'de $1')
    .replace(/\bal (un paso del kit)/g, 'a $1');
  // revisor frío de C (3): un SHA tiene letras Y números (un monto o una fecha no); rojo/verde solo como estado de una prueba
  const sinCodigos = s.replace(/@?\b(?=[0-9a-f]*\d)(?=[0-9a-f]*[a-f])[0-9a-f]{7,40}\b/gi, '');
  if (sinCodigos !== s) {
    // 8e c15 (R2: "Las 4 alertas de negocio , , y ."): sacar los códigos de una lista dejaba los huecos; se cierran
    s = sinCodigos
      .replace(/\s+,/g, ',')
      .replace(/,(?:\s*,)+/g, ',')
      .replace(/,?\s+y\s*(?=[.;:]|$)/g, '')
      .replace(/,\s*(?=[.;:]|$)/g, '')
      .replace(/\s+([.;:])/g, '$1');
  }
  return s
    .replace(/\b(en|da|dio|dan|daba|quedó|queda|está|estaba|sale|salió) (rojo|roja|rojos|rojas)\b/gi, '$1 falló')
    .replace(/\b(en|da|dio|dan|daba|quedó|queda|está|estaba|sale|salió) (verde|verdes)\b/gi, '$1 pasó')
    .replace(/\s+/g, ' ')
    .trim();
}

// Las fuentes que escribe el kit (sus textos ya son para el dueño); las otras las escribió una sesión.
const DEL_KIT = new Set(['cambio propuesto', 'publicar', 'puesta al día del kit']);

function teEspera(raiz, opciones = {}) {
  const ahora = opciones.ahora instanceof Date ? opciones.ahora : new Date();
  // Revisor frío de B (5): el parte nuevo no lee el anterior (sinParte): si no, cada parte copiaba el "te necesito" del otro y lo
  // resuelto volvía para siempre. /estado sí lo lee (lo de la última noche, hasta el parte siguiente).
  const fuentes = [deCambios, dePublicacion, deFusiones, deFichas, deHandoff, (r) => deTodo(r, diaDe(ahora)), ...(opciones.sinParte ? [] : [deParte])];
  const out = [];
  const vistas = new Set();
  // los ids de los cambios ya listados: un renglón DEL HANDOFF que nombra uno (el id entero, o su slug compuesto como palabra) es el
  // mismo pedido (revisor de B, 6). Un slug de una palabra ("deploy") no alcanza: se comería pedidos distintos (revisor de C, 4).
  const refs = [];
  const nombra = (texto) => refs.some((r) => new RegExp(`(^|[^\\w-])${r.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\w-]|$)`).test(texto));
  for (const f of fuentes) {
    let items = [];
    try {
      items = f(raiz);
    } catch (e) {
      items = [];
    }
    for (const it0 of items) {
      if (it0.ref) {
        const slug = it0.ref.replace(/^\d{4}-\d{2}-\d{2}-/, '');
        refs.push(it0.ref, ...(slug.includes('-') ? [slug] : []));
      }
      if (it0.fuente === 'el handoff' && nombra(it0.texto)) continue;
      const it = DEL_KIT.has(it0.fuente) ? it0 : { ...it0, texto: paraElDueno(it0.texto) };
      const k = clave(it.texto);
      if (!k || vistas.has(k)) continue;
      vistas.add(k);
      out.push(it);
    }
  }
  return out;
}

module.exports = { teEspera, clave, seccion, bullets, paraElDueno };
