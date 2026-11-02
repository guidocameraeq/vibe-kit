'use strict';
// afirmaciones.cjs — el corrector de afirmaciones en prosa (SPEC-0 6.10; A §5 y §6, fila "Afirmaciones en prosa"; acta
// tips/tanda-2026-11-contraste.md, hueco 4): comentarios, docstrings, textos de error y viñetas de CHANGELOG que prometen más de
// lo medido. Dos piezas puras: `prosa(ruta, contenido)` dice qué parte de cada renglón es prosa (por extensión, con un lexer chico
// que no confunde un "#" dentro de un texto con un comentario) y `revisar(ruta, contenido, numeros)` corre las reglas sobre los
// renglones agregados. Medido contra el historial de Hermes antes de instalarlo (A §5 paso 2; K5, 2026-11-02, reglas afinadas con
// la mitad vieja y congeladas antes de mirar la nueva): sobre la mitad nueva caza 42 de 504 renglones que los commits de solo prosa
// corrigieron (5 de 9 sobre-afirmaciones de una muestra etiquetada a mano; 2 de 41 obsoletas, que un chequeo estático no puede ver)
// y marca 38 de 1.386 renglones vivos buenos y 26 de 1.552 de los que aprobó el revisor. Con falsos positivos la receta no lo deja
// frenar: el script avisa. La usa scripts/afirmaciones.cjs. Node estándar, cero dependencias; .cjs a propósito.

const path = require('path');

// ---------------------------------------------------------------- qué es prosa (por extensión)

// Cada lenguaje: comentarios de línea, de bloque y los delimitadores de texto (para saltearlos sin leer un "#" adentro).
const LENGUAJES = {
  py: { linea: ['#'], bloque: [], textos: ['"""', "'''", '"', "'"], prefijos: /[rRbBuUfF]{0,2}$/, docstrings: true },
  js: { linea: ['//'], bloque: [['/*', '*/']], textos: ['`', '"', "'"] },
  sql: { linea: ['--'], bloque: [['/*', '*/']], textos: ["'", '"'] },
  sh: { linea: ['#'], bloque: [], textos: ['"', "'"] },
  ps1: { linea: ['#'], bloque: [['<#', '#>']], textos: ['"', "'"] },
  html: { linea: [], bloque: [['<!--', '-->']], textos: [] },
};
const EXTENSIONES = {
  py: 'py', pyi: 'py',
  js: 'js', cjs: 'js', mjs: 'js', jsx: 'js', ts: 'js', tsx: 'js', mts: 'js', cts: 'js', java: 'js', c: 'js', h: 'js',
  cs: 'js', go: 'js', rs: 'js', kt: 'js', swift: 'js', scss: 'js',
  sql: 'sql',
  sh: 'sh', bash: 'sh', yml: 'sh', yaml: 'sh', toml: 'sh', rb: 'sh', ps1: 'ps1', psm1: 'ps1',
  html: 'html', htm: 'html', xml: 'html', vue: 'html', svg: 'html',
};

// El texto que acompaña al error: raise X("…"), throw new Error("…"), throw "…", RAISE EXCEPTION '…'.
const ANTES_DE_ERROR = /(\braise\s+[\w.]+\(\s*|\bthrow\s+(new\s+[\w.]+\(\s*)?|\bRAISE\s+(EXCEPTION|WARNING|NOTICE)\s+)$/i;

// Las viñetas de las notas de release: CHANGELOG*, CHANGES*, RELEASE*, HISTORY*, notas-de-release/notas-de-version. El resto del
// Markdown queda afuera: en los .md comunes de Hermes las reglas marcan 1.798 de 44.356 renglones (4,1%), casi todos legítimos.
const RE_NOTAS = /^(changelog|changes|releases?|release[-_ ]?notes|notas[-_ ]?de[-_ ]?(release|la[-_ ]?versi[oó]n|versi[oó]n)|history)\b.*\.(md|markdown|txt)$/i;

function lenguaje(ruta) {
  const ext = path.extname(String(ruta || '')).slice(1).toLowerCase();
  return EXTENSIONES[ext] || null;
}

// prosa(ruta, contenido, { markdown }) → Map<número de renglón (1..n), [{ tipo, texto }]>: la prosa de cada renglón.
// tipo: 'comentario' | 'docstring' | 'error' | 'viñeta' | 'markdown'. Un archivo de un lenguaje desconocido no tiene prosa.
function prosa(ruta, contenido, opciones = {}) {
  const texto = String(contenido == null ? '' : contenido).replace(/\r\n?/g, '\n');
  const fuera = new Map();
  const base = path.basename(String(ruta || ''));
  if (/\.(md|markdown)$/i.test(base) || RE_NOTAS.test(base)) {
    const notas = RE_NOTAS.test(base);
    if (!notas && !opciones.markdown) return fuera;
    let enCodigo = false;
    texto.split('\n').forEach((l, i) => {
      if (/^\s*(```|~~~)/.test(l)) { enCodigo = !enCodigo; return; }
      if (enCodigo) return;
      const m = /^\s*(?:[-*+]|\d+[.)])\s+(.*\S)/.exec(l);
      if (m) fuera.set(i + 1, [{ tipo: notas ? 'viñeta' : 'markdown', texto: m[1] }]);
      else if (!notas && l.trim() && !/^\s*(#|\||<|>|---)/.test(l)) fuera.set(i + 1, [{ tipo: 'markdown', texto: l.trim() }]);
    });
    return fuera;
  }
  const L = LENGUAJES[lenguaje(base)];
  if (!L) return fuera;
  const inicios = [0];
  for (let k = texto.indexOf('\n'); k !== -1; k = texto.indexOf('\n', k + 1)) inicios.push(k + 1);
  const poner = (desde, hasta, tipo) => {
    // Reparte el tramo [desde, hasta) del texto en sus renglones.
    let n = renglonDe(inicios, desde);
    let ini = desde;
    while (ini < hasta) {
      let fin = texto.indexOf('\n', ini);
      if (fin === -1 || fin > hasta) fin = hasta;
      const t = texto.slice(ini, fin).trim();
      if (t) {
        if (!fuera.has(n)) fuera.set(n, []);
        fuera.get(n).push({ tipo, texto: t });
      }
      ini = fin + 1;
      n++;
    }
  };
  let i = 0;
  const N = texto.length;
  while (i < N) {
    const c = texto[i];
    const lin = L.linea.find((t) => texto.startsWith(t, i));
    if (lin) {
      let fin = texto.indexOf('\n', i);
      if (fin === -1) fin = N;
      poner(i + lin.length, fin, 'comentario');
      i = fin;
      continue;
    }
    const blo = L.bloque.find(([a]) => texto.startsWith(a, i));
    if (blo) {
      let fin = texto.indexOf(blo[1], i + blo[0].length);
      if (fin === -1) fin = N;
      poner(i + blo[0].length, fin, 'comentario');
      i = fin + blo[1].length;
      continue;
    }
    const del = L.textos.find((t) => texto.startsWith(t, i));
    if (del) {
      const fin = finDeTexto(texto, i + del.length, del, L);
      const antes = texto.slice(Math.max(0, i - 160), i);
      const inicioRenglon = texto.lastIndexOf('\n', i - 1) + 1;
      const previo = texto.slice(inicioRenglon, i);
      const sinPrefijo = L.prefijos ? previo.replace(L.prefijos, '') : previo;
      if (L.docstrings && del.length === 3 && sinPrefijo.trim() === '' && !/[=(,[{+]\s*$/.test(texto.slice(0, inicioRenglon).trimEnd())) {
        poner(i + 3, fin, 'docstring');
      } else if (ANTES_DE_ERROR.test(L.prefijos ? antes.replace(L.prefijos, '') : antes)) {
        poner(i + del.length, fin, 'error');
      }
      i = fin + del.length;
      continue;
    }
    i += c === '\\' ? 2 : 1;
  }
  return fuera;
}

// El número de renglón (1..n) de una posición: búsqueda binaria sobre los inicios de renglón.
function renglonDe(inicios, pos) {
  let lo = 0;
  let hi = inicios.length - 1;
  while (lo < hi) {
    const m = (lo + hi + 1) >> 1;
    if (inicios[m] <= pos) lo = m;
    else hi = m - 1;
  }
  return lo + 1;
}

// Dónde cierra un texto que abrió con `del` (respeta la barra invertida; los de una comilla no cruzan el renglón, salvo `).
function finDeTexto(texto, desde, del, L) {
  let j = desde;
  const multi = del.length === 3 || del === '`';
  while (j < texto.length) {
    if (texto[j] === '\\') { j += 2; continue; }
    if (!multi && texto[j] === '\n') return j;
    if (texto.startsWith(del, j)) return j;
    j++;
  }
  return texto.length;
}

// ---------------------------------------------------------------- las reglas

// Cada regla: el patrón, y el "eso no; hacé" que lleva el mensaje. Elegidas con la mitad vieja del historial de Hermes.
const REGLAS = [
  {
    id: 'absoluto',
    re: /\b(siempre|nunca|jam[aá]s|garantiza\w*|imposible|sin excepci[oó]n|en ning[uú]n caso|en todos los casos|always|never|guarantee[sd]?|impossible)\b/i,
    alternativa: 'decí la condición en la que vale (o citá la prueba que lo fija), no un absoluto',
  },
  {
    id: 'evidencia',
    re: /\b(probad[oa]s?|verificad[oa]s?|medid[oa]s?|testead[oa]s?|comprobad[oa]s?|confirmad[oa]s?|tested|verified|proven|measured)\b/i,
    alternativa: 'citá la evidencia (la prueba, el SHA, archivo:línea o la cifra) o escribí NO VERIFICADO',
  },
  {
    id: 'cobertura',
    re: /\b(cubre (todo|todos|todas)|todos los (casos|caminos)|cobertura (total|completa)|covers? (all|every))\b/i,
    alternativa: 'decí qué casos cubre la prueba, con su nombre; "todos" no se puede mostrar',
  },
];

// La salida de escape: la línea cita su evidencia.
const RE_EVIDENCIA = new RegExp(
  [
    '\\b(no|sin) (medid|medir|verificad|verificar|probad|probar|comprobad)\\w*|\\bsupuesto\\b', // no medido (y NO VERIFICADO)
    '\\b\\d{4}-\\d{2}-\\d{2}\\b', // la fecha de cuándo se midió
    '\\b[0-9a-f]{7,40}\\b', // un SHA
    '\\btest_\\w+|\\w+\\.test\\.\\w+|\\w+_test\\.\\w+', // el nombre de una prueba
    '[\\w./-]+\\.\\w{1,5}:\\d+', // archivo:línea
    '\\b\\d+\\s*(passed|pruebas|tests?|casos|ms|s|seg|min|%|filas|commits?)\\b', // una cifra medida
  ].join('|'),
  'i'
);

// revisar(ruta, contenido, numeros, { markdown }) → [{ linea, tipo, regla, frase, texto, alternativa }]
// `numeros`: los renglones agregados (Set o array, 1..n); sin `numeros`, revisa todos.
function revisar(ruta, contenido, numeros, opciones = {}) {
  const pedidos = numeros == null ? null : new Set(numeros);
  const hallazgos = [];
  for (const [linea, piezas] of prosa(ruta, contenido, opciones)) {
    if (pedidos && !pedidos.has(linea)) continue;
    for (const p of piezas) for (const h of revisarTexto(p.texto, p.tipo)) hallazgos.push({ linea, ...h });
  }
  return hallazgos.sort((a, b) => a.linea - b.linea);
}

// revisarTexto(texto, tipo) → [{ tipo, regla, frase, texto, alternativa }]: las reglas sobre un pedazo de prosa.
function revisarTexto(texto, tipo) {
  if (RE_EVIDENCIA.test(texto)) return [];
  const fuera = [];
  for (const r of REGLAS) {
    const m = r.re.exec(texto);
    if (m) fuera.push({ tipo, regla: r.id, frase: m[0], texto, alternativa: r.alternativa });
  }
  return fuera;
}

// El renglón del mensaje: "eso no: …; hacé: …".
function mensaje(ruta, h) {
  return `${ruta}:${h.linea} · ${h.regla} · eso no: "${h.frase}" en «${recortar(h.texto, 100)}»; hacé: ${h.alternativa}`;
}

function recortar(s, n) {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

module.exports = { LENGUAJES, EXTENSIONES, REGLAS, RE_EVIDENCIA, RE_NOTAS, lenguaje, prosa, revisar, revisarTexto, mensaje };
