'use strict';
// catalogo.cjs — el catálogo pieza → archivos, por versión de molde (SPEC-paquete-6 P7.1, D6-5; E §4-§6).
// Hoy lo sabía solo pruebas/rehacer.sh ("orden 2, 2b, 3"): acá queda una sola vez, para el actualizador y el adoptador.
//
// Un molde se lee SIEMPRE con la forma de kit/molde/ (molde.cjs materializa el de 2.4 a esa forma: settings.template.json →
// settings.json, CLAUDE.template.md → CLAUDE.md). Cada ruta del molde (relativa, con /, sin los *.test.cjs) cae en UNA pieza:
//   - id: el nombre en piezas: de la ficha (o, para lo que no es pieza de la ficha, un nombre propio del catálogo);
//   - clase: base (viene siempre) · opcional (en `no` no se trae; nueva → se anota `no`);
//   - forma de la zona propia: texto (marcas <!-- kit:propio -->) · hook (hermano .propio.sh, que nunca se toca) · settings (regla
//     por regla, mezclarSettings) · ninguna;
//   - trato: pieza (el guardia y las bajas) · nacimiento (docs: crea lo que falta, nunca reemplaza, nunca baja, nunca desvío; r1-2)
//     · nunca (CLAUDE.md: el actualizador no lo toca) · snippet (renglón por renglón en .gitignore/.gitattributes) · no-viaja.
// Una ruta del molde sin pieza → sinDueno() la devuelve y la prueba del catálogo da rojo: nada se reparte sin dueño.
// Funciones puras: no leen ni escriben disco salvo rutasDeMolde (que solo lista).

const fs = require('fs');
const path = require('path');

const BASE = 'base';
const OPCIONAL = 'opcional';

// Dónde cae en el proyecto cada carpeta del molde (la forma de kit/molde/; la misma que rutaEnMolde de barreras.cjs, al derecho).
const PREFIJOS = [
  ['hooks/', '.claude/hooks/'],
  ['scripts/', '.claude/scripts/'],
  ['skills/', '.claude/skills/'],
  ['agents/', '.claude/agents/'],
  ['githooks/', '.githooks/'],
  ['docs/', 'docs/'],
];
const SUELTOS = {
  'settings.json': '.claude/settings.json',
  'CLAUDE.md': 'CLAUDE.md',
  'gitignore.snippet': '.gitignore',
  'gitattributes.snippet': '.gitattributes',
  // los rituales son contratos: el Arquitecto los monta como skill (pieza propia) cuando el proyecto tiene el ritual (P5.8)
  'rituales/smoke.md': '.claude/skills/smoke/SKILL.md',
  'rituales/release.md': '.claude/skills/release/SKILL.md',
  // la portada (P3.8; r1-4): plantillas sin pieza que reparta el actualizador. Solo `portada.cjs armar` hace nacer un README.
  'README.md': 'README.md',
  'assets/banner.svg': 'assets/banner.svg',
};

// La carpeta de papeles por defecto (ficha.cjs CARPETA_DOCS): sin `carpeta-docs:` en la ficha, el docs/ del molde va a docs/.
const CARPETA_DOCS = 'docs';

// La ruta del proyecto de una ruta del molde, o null si no viaja. carpeta (8r3 i1b): la `carpeta-docs:` de la ficha — lo que en el
// molde está en docs/ va a <carpeta>/ (el molde siempre lo trae en docs/).
function rutaEnProyecto(rel, carpeta = CARPETA_DOCS) {
  const r = String(rel).replace(/\\/g, '/');
  if (Object.prototype.hasOwnProperty.call(SUELTOS, r)) return SUELTOS[r];
  for (const [de, a] of PREFIJOS) if (r.startsWith(de)) return (de === 'docs/' ? `${carpeta}/` : a) + r.slice(de.length);
  return null;
}

const esPrueba = (rel) => /\.test\.cjs$/.test(rel);

// Las reglas, en orden: la primera que casa se queda con la ruta. `en` = lista de rutas exactas o prefijos terminados en /.
const casa = (rel, en) => en.some((p) => (p.endsWith('/') ? rel.startsWith(p) : rel === p));

const PIEZAS_3 = [
  { id: 'settings', clase: BASE, forma: 'settings', trato: 'pieza', en: ['settings.json'] },
  { id: 'claude-md', clase: BASE, forma: 'texto', trato: 'nunca', en: ['CLAUDE.md'] },
  { id: 'snippets', clase: BASE, forma: 'ninguna', trato: 'snippet', en: ['gitignore.snippet', 'gitattributes.snippet'] },
  { id: 'portada-plantillas', clase: BASE, forma: 'ninguna', trato: 'no-viaja', en: ['README.md', 'assets/banner.svg'] }, // las lleva portada.cjs adentro
  { id: 'ficha-ejemplo', clase: BASE, forma: 'ninguna', trato: 'no-viaja', en: ['kit.ejemplo.md'] },
  { id: 'hook-arranque', clase: BASE, forma: 'hook', trato: 'pieza', en: ['hooks/session-start.cjs'] },
  { id: 'hook-escritura', clase: BASE, forma: 'hook', trato: 'pieza', en: ['hooks/escritura-docs.cjs'] },
  { id: 'hook-git-seguro', clase: BASE, forma: 'hook', trato: 'pieza', en: ['hooks/git-seguro.cjs'] },
  { id: 'hook-sensible', clase: BASE, forma: 'hook', trato: 'pieza', en: ['hooks/sensible.cjs'] },
  { id: 'cambios-metodo', clase: BASE, forma: 'hook', trato: 'pieza', en: ['hooks/niega-aprobar.cjs', 'scripts/cambios.cjs'] },
  { id: 'hooks-lib', clase: BASE, forma: 'ninguna', trato: 'pieza', en: ['hooks/lib/'] },
  { id: 'candado', clase: BASE, forma: 'ninguna', trato: 'pieza', en: ['scripts/estructura.cjs'] },
  { id: 'scripts', clase: BASE, forma: 'ninguna', trato: 'pieza', en: ['scripts/'] },
  { id: 'inicio', clase: BASE, forma: 'texto', trato: 'pieza', en: ['skills/inicio/'] },
  { id: 'cierre', clase: BASE, forma: 'texto', trato: 'pieza', en: ['skills/cierre/'] },
  { id: 'githooks', clase: BASE, forma: 'ninguna', trato: 'pieza', en: ['githooks/'] },
  { id: 'docs', clase: BASE, forma: 'texto', trato: 'nacimiento', en: ['docs/'] },
  { id: 'estado', clase: OPCIONAL, forma: 'texto', trato: 'pieza', en: ['skills/estado/'] },
  { id: 'director-obrero', clase: OPCIONAL, forma: 'texto', trato: 'pieza',
    en: ['skills/director/', 'skills/obrero/', 'skills/tramo/', 'skills/nucleo/', 'agents/'] },
  { id: 'smoke', clase: OPCIONAL, forma: 'texto', trato: 'pieza', en: ['rituales/smoke.md'] },
  { id: 'release', clase: OPCIONAL, forma: 'texto', trato: 'pieza', en: ['rituales/release.md'] },
  { id: 'docs-fyd', clase: OPCIONAL, forma: 'ninguna', trato: 'pieza', en: [] }, // la skill es global: en el molde no trae archivos
];

// El molde v2 (templates/universales/ de 2.4.x), ya con la forma de kit/molde/. check-code y session-start.sh son las bajas de v3.
const PIEZAS_24 = [
  { id: 'settings', clase: BASE, forma: 'settings', trato: 'pieza', en: ['settings.json'] },
  { id: 'claude-md', clase: BASE, forma: 'texto', trato: 'nunca', en: ['CLAUDE.md'] },
  { id: 'hook-arranque', clase: BASE, forma: 'hook', trato: 'pieza', en: ['hooks/session-start.sh'] },
  { id: 'check-code', clase: BASE, forma: 'hook', trato: 'pieza', en: ['hooks/check-code.js'] },
  { id: 'inicio', clase: BASE, forma: 'texto', trato: 'pieza', en: ['skills/inicio/'] },
  { id: 'cierre', clase: BASE, forma: 'texto', trato: 'pieza', en: ['skills/cierre/'] },
  { id: 'docs', clase: BASE, forma: 'texto', trato: 'nacimiento', en: ['docs/'] },
];

const CATALOGOS = { '3': PIEZAS_3, '2.4': PIEZAS_24 };

function piezasDe(forma) {
  const c = CATALOGOS[forma];
  if (!c) throw new Error(`no conozco el molde de forma "${forma}" (conozco: ${Object.keys(CATALOGOS).join(', ')})`);
  return c;
}

// La pieza (el objeto del catálogo) de una ruta del molde, o null si no tiene dueño.
function piezaDeRuta(forma, rel) {
  const r = String(rel).replace(/\\/g, '/');
  for (const p of piezasDe(forma)) if (casa(r, p.en)) return p;
  return null;
}

// Todas las rutas de un molde materializado (relativas, con /, ordenadas), sin los *.test.cjs: esos no viajan al proyecto
// (chequeo.cjs los corre desde el molde nuevo, no del proyecto).
function rutasDeMolde(dir) {
  const out = [];
  (function rec(d, rel) {
    for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
      const q = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) rec(path.join(d, e.name), q);
      else if (e.isFile() && !esPrueba(q) && q !== '.forma-molde') out.push(q); // la marca de molde.cjs no es del molde
    }
  })(dir, '');
  return out;
}

// Las rutas de un molde que no caen en ninguna pieza (o que caen en una pieza que viaja y no tienen ruta en el proyecto).
function sinDueno(forma, rutas) {
  return rutas.filter((rel) => {
    const p = piezaDeRuta(forma, rel);
    if (!p) return true;
    if (p.trato === 'no-viaja' || p.trato === 'snippet') return false;
    return rutaEnProyecto(rel) === null;
  });
}

// El reparto de un molde: Map(id → { pieza, archivos: [{ molde, proyecto }] }), con TODAS las piezas del catálogo (también las
// que no traen archivos). Tira si una ruta no tiene dueño. carpeta: la `carpeta-docs:` de la ficha (8r3 i1b; sin ella, docs).
function repartir(forma, rutas, carpeta = CARPETA_DOCS) {
  const m = new Map();
  for (const p of piezasDe(forma)) m.set(p.id, { pieza: p, archivos: [] });
  const huerfanas = sinDueno(forma, rutas);
  if (huerfanas.length) throw new Error(`rutas del molde sin pieza en el catálogo: ${huerfanas.join(', ')}`);
  for (const rel of rutas) {
    const p = piezaDeRuta(forma, rel);
    m.get(p.id).archivos.push({ molde: rel, proyecto: p.trato === 'no-viaja' ? null : rutaEnProyecto(rel, carpeta) });
  }
  return m;
}

module.exports = { BASE, OPCIONAL, CATALOGOS, CARPETA_DOCS, piezasDe, piezaDeRuta, rutaEnProyecto, rutasDeMolde, sinDueno, repartir, esPrueba };
