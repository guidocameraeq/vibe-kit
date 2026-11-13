'use strict';
// habla.cjs — ayuda de PRUEBAS (no se instala): lo que un archivo del kit le dice a quien lo usa (SPEC-paquete-8d A8, R10, R21, 34).
// textos(archivo) → los textos: todo un .md; de un .cjs/.js, los literales de texto (comillas simples, dobles e invertidas), sin
// los comentarios (los comentarios citan la cicatriz y no los lee quien instala: D8d-13). palabras(texto) → las que no van:
// `guido` como palabra y `rojo`/`roja`/`verde` (sin mayúsculas). revisar(archivos, {permitidos}) → [{archivo, palabra, texto}].
// La usan las tres habla.test (A8 en hooks/, B6 en scripts/, C4 en skills/), cada una sobre lo suyo.

const fs = require('fs');
const path = require('path');

const MALAS = /\b(guido|rojo|roja|rojos|rojas|verde|verdes)\b/giu;

// Los literales de texto de un .cjs, sin comentarios. Un lexer chico: alcanza para el código del kit (sin regex con comillas
// raras: una regex se salta entera cuando se la reconoce por el contexto).
function literales(codigo) {
  const out = [];
  let i = 0;
  const n = codigo.length;
  let previo = ''; // el último carácter que no es espacio, para saber si un / abre una regex
  while (i < n) {
    const c = codigo[i];
    const d = codigo[i + 1];
    if (c === '/' && d === '/') {
      while (i < n && codigo[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && d === '*') {
      i = codigo.indexOf('*/', i + 2);
      i = i < 0 ? n : i + 2;
      continue;
    }
    if (c === '/' && (previo === '' || /[(,=:[!&|?{};+\-*%<>~^]/.test(previo))) {
      // una regex: hasta la / que la cierra (saltando escapes y clases)
      i++;
      let clase = false;
      while (i < n) {
        const x = codigo[i];
        if (x === '\\') i += 2;
        else if (x === '[') { clase = true; i++; }
        else if (x === ']') { clase = false; i++; }
        else if (x === '/' && !clase) { i++; break; }
        else if (x === '\n') break;
        else i++;
      }
      while (i < n && /[a-z]/i.test(codigo[i])) i++;
      previo = '/';
      continue;
    }
    if (c === "'" || c === '"' || c === '`') {
      let j = i + 1;
      let s = '';
      while (j < n && codigo[j] !== c) {
        if (codigo[j] === '\\') {
          s += codigo[j + 1] || '';
          j += 2;
          continue;
        }
        if (c !== '`' && codigo[j] === '\n') break;
        s += codigo[j];
        j++;
      }
      out.push(c === '`' ? s.replace(/\$\{[^}]*\}/g, '${}') : s); // lo de adentro de ${…} es código, no texto
      i = j + 1;
      previo = c;
      continue;
    }
    if (!/\s/.test(c)) previo = c;
    i++;
  }
  return out;
}

function textos(archivo) {
  const t = fs.readFileSync(archivo, 'utf8');
  if (/\.md$/i.test(archivo)) return t.split(/\r?\n/); // un .md, renglón por renglón
  if (/\.(c?js|mjs)$/i.test(archivo)) return literales(t);
  return [t];
}

const palabras = (texto) => [...String(texto).matchAll(MALAS)].map((m) => m[1].toLowerCase());

// Los archivos de una carpeta (recursivo), sin pruebas.
function archivos(dir, filtro = (f) => /\.(c?js|md|sh|ps1)$/i.test(f) && !/\.test\.c?js$/i.test(f)) {
  const out = [];
  (function rec(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) rec(p);
      else if (filtro(e.name)) out.push(p);
    }
  })(dir);
  return out.sort();
}

// revisar(lista, {permitidos}) → los textos con una palabra que no va. `permitidos`: textos exactos que se dejan (los alias
// viejos de A1, que validan para siempre en la v3).
function revisar(lista, opciones = {}) {
  const permitidos = new Set(opciones.permitidos || []);
  const hallazgos = [];
  for (const a of lista) {
    for (const t of textos(a)) {
      if (permitidos.has(t)) continue;
      if (MALAS.test(t.trim()) && t.trim().replace(MALAS, '') === '') { MALAS.lastIndex = 0; continue; } // un valor suelto ('rojo'): un estado interno, no un texto
      MALAS.lastIndex = 0;
      for (const palabra of palabras(t)) hallazgos.push({ archivo: a, palabra, texto: t.length > 120 ? `${t.slice(0, 117)}…` : t });
    }
  }
  return hallazgos;
}

module.exports = { MALAS, literales, textos, palabras, archivos, revisar };
