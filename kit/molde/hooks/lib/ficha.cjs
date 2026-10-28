'use strict';
// ficha.cjs — lee y valida la ficha del kit (.claude/kit.md). Node estándar, cero dependencias.
// Es .cjs a propósito: corre igual en proyectos con "type": "module".
// La gramática es CERRADA: lo que no está en la lista da error con número de línea. Nunca "lo mejor que pude".

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

// ---------------------------------------------------------------- errores

class ErrorFicha extends Error {
  constructor(linea, mensaje, archivo) {
    super(armar(linea, mensaje, archivo));
    this.name = 'ErrorFicha';
    this.linea = linea;
    this.mensaje = mensaje;
    this.archivo = archivo || null;
  }
}

function armar(linea, mensaje, archivo) {
  return archivo ? `${archivo}:${linea}: ${mensaje}` : `línea ${linea}: ${mensaje}`;
}

function E(linea, mensaje) {
  throw new ErrorFicha(linea, mensaje);
}

// ---------------------------------------------------------------- utilidades

const RE_CLAVE = /^[a-z0-9][a-z0-9_-]*$/;
const RE_VERSION = /^\d+\.\d+\.\d+$/;
const MAX_PROFUNDIDAD = 3;

const tiene = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const esTexto = (v) => typeof v === 'string';
const esLista = (v) => Array.isArray(v);
const esMapa = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const tipoDe = (v) => (esTexto(v) ? 'un texto' : esLista(v) ? 'una lista' : 'un mapa');
const esItemLista = (t) => /^-(\s|$)/.test(t);

// Corta el comentario: '#' al principio o después de un espacio, fuera de comillas dobles.
function sinComentario(s) {
  let comillas = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '"') comillas = !comillas;
    else if (c === '#' && !comillas && (i === 0 || /\s/.test(s[i - 1]))) return s.slice(0, i);
  }
  return s;
}

// ---------------------------------------------------------------- valores

function parseComillas(s, n) {
  const cierre = s.indexOf('"', 1);
  if (cierre < 0) E(n, 'comilla sin cerrar — cerrala con otra " al final del texto');
  if (cierre !== s.length - 1) E(n, 'hay texto después de la comilla de cierre — dejá solo el texto entre comillas');
  const dentro = s.slice(1, cierre);
  if (dentro.includes('\\')) E(n, 'barra \\ dentro de comillas — no se aceptan escapes, sacala o escribí otra cosa');
  return dentro;
}

// Texto sin comillas (ya recortado).
function parseTextoCrudo(s, n) {
  const c = s[0];
  if (c === "'") E(n, "comillas simples — usá comillas dobles (\") o ninguna");
  if (c === '&' || c === '*') E(n, 'ancla o alias (& o *) — no se aceptan, escribí el valor entero');
  if (c === '!') E(n, 'etiqueta (!) — no se aceptan, sacala');
  if (c === '|' || c === '>') E(n, 'texto en varias líneas (| o >) — ponelo en una sola línea, entre comillas si hace falta');
  if (s.includes('"')) E(n, 'comillas en medio del texto — poné el texto entero entre comillas dobles o sacalas');
  if (/:(\s|$)/.test(s)) E(n, 'dos puntos seguidos de espacio dentro de un texto — ponelo entre comillas dobles');
  return s;
}

// Parte por comas fuera de comillas.
function dividirComas(s, n) {
  const partes = [];
  let ini = 0;
  let q = false;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '"') q = !q;
    else if (s[i] === ',' && !q) {
      partes.push(s.slice(ini, i));
      ini = i + 1;
    }
  }
  if (q) E(n, 'comilla sin cerrar — cerrala con otra " antes de la coma o del cierre');
  partes.push(s.slice(ini));
  return partes;
}

function parseElemento(t, n) {
  if (t[0] === '[') E(n, 'lista dentro de otra lista — no se acepta anidar, dejá una lista plana');
  if (t[0] === '{') E(n, 'mapa dentro de una lista en línea — no se acepta anidar; usá un mapa por renglón con "- {a: x}"');
  if (t[0] === '"') return parseComillas(t, n);
  if (/[\[\]{}]/.test(t)) E(n, 'corchete o llave suelta dentro del texto — poné el texto entre comillas dobles');
  return parseTextoCrudo(t, n);
}

function parseListaLinea(s, n) {
  if (!s.endsWith(']')) E(n, 'corchete sin cerrar (o texto después del ]) — cerrá la lista con ] al final del renglón');
  const dentro = s.slice(1, -1);
  if (dentro.trim() === '') return [];
  return dividirComas(dentro, n).map((p) => {
    const t = p.trim();
    if (t === '') E(n, 'elemento vacío en la lista — sacá la coma de más');
    return parseElemento(t, n);
  });
}

function parseMapaLinea(s, n, prof, st, ruta) {
  if (!s.endsWith('}')) E(n, 'llave sin cerrar (o texto después de la }) — cerrá el mapa con } al final del renglón');
  if (prof + 1 > MAX_PROFUNDIDAD) E(n, 'más de tres niveles — aplaná la ficha, no se acepta tanta profundidad');
  const dentro = s.slice(1, -1);
  if (dentro.trim() === '') E(n, 'mapa vacío {} — poné al menos una clave o sacá el campo');
  const mapa = {};
  for (const p of dividirComas(dentro, n)) {
    const t = p.trim();
    if (t === '') E(n, 'elemento vacío en el mapa — sacá la coma de más');
    const idx = t.indexOf(':');
    if (idx < 0) E(n, 'un elemento del mapa en línea no es "clave: valor" — escribilo así dentro de las llaves (no lo repito porque puede ser un valor)');
    const clave = t.slice(0, idx);
    if (!RE_CLAVE.test(clave)) E(n, `clave inválida "${clave}" — usá minúsculas, números, - y _`);
    const resto = t.slice(idx + 1);
    if (resto !== '' && resto[0] !== ' ') E(n, `falta un espacio después de los dos puntos de "${clave}" — escribí "${clave}: valor"`);
    const v = resto.trim();
    if (v === '') E(n, `"${clave}" sin valor — escribí el valor o sacá la clave`);
    if (tiene(mapa, clave)) E(n, `clave repetida "${clave}" — dejá una sola`);
    if (v[0] === '[' || v[0] === '{') E(n, 'lista o mapa dentro de un mapa en línea — no se acepta anidar');
    mapa[clave] = v[0] === '"' ? parseComillas(v, n) : parseElemento(v, n);
    st.lineas.set(`${ruta}.${clave}`, n);
  }
  return mapa;
}

function parseValor(s, n, prof, st, ruta) {
  if (s[0] === '"') return parseComillas(s, n);
  if (s[0] === '[') return parseListaLinea(s, n);
  if (s[0] === '{') return parseMapaLinea(s, n, prof, st, ruta);
  return parseTextoCrudo(s, n);
}

// ---------------------------------------------------------------- estructura

function partirClave(it) {
  const t = it.texto;
  const idx = t.indexOf(':');
  if (idx < 0) E(it.n, 'no entiendo este renglón — tiene que ser "clave: valor"');
  const clave = t.slice(0, idx);
  if (!RE_CLAVE.test(clave)) E(it.n, `clave inválida "${clave}" — usá minúsculas, números, - y _ (y dos puntos con espacio después)`);
  const despues = t.slice(idx + 1);
  if (despues !== '' && despues[0] !== ' ') E(it.n, `falta un espacio después de los dos puntos — escribí "${clave}: valor"`);
  return { clave, resto: despues.trim() };
}

function parseMapa(st, indent, prof, ruta) {
  const mapa = {};
  while (st.i < st.items.length) {
    const it = st.items[st.i];
    if (it.indent < indent) break;
    if (it.indent > indent) E(it.n, 'sangría de más — alineá el renglón con el anterior (o poné arriba una clave sin valor)');
    if (esItemLista(it.texto)) E(it.n, 'ítem de lista "-" sin clave arriba — poné la clave y los ítems debajo, o usá [a, b]');
    const { clave, resto } = partirClave(it);
    if (tiene(mapa, clave)) E(it.n, `clave repetida "${clave}" — dejá una sola`);
    if (prof > MAX_PROFUNDIDAD) E(it.n, 'más de tres niveles — aplaná la ficha, no se acepta tanta profundidad');
    const rutaClave = ruta ? `${ruta}.${clave}` : clave;
    st.lineas.set(rutaClave, it.n);
    st.i++;
    if (resto === '') {
      const sig = st.items[st.i];
      if (!sig || sig.indent <= indent) E(it.n, `campo vacío "${clave}" — poné [] o un valor`);
      if (sig.indent > indent + 2) E(sig.n, 'salto de más de un nivel de sangría — usá exactamente 2 espacios más que la clave de arriba');
      mapa[clave] = esItemLista(sig.texto)
        ? parseListaBloque(st, indent + 2, prof, rutaClave)
        : parseMapa(st, indent + 2, prof + 1, rutaClave);
    } else {
      mapa[clave] = parseValor(resto, it.n, prof, st, rutaClave);
    }
  }
  return mapa;
}

// Lista en bloque: solo de mapas en línea, un ítem por renglón.
function parseListaBloque(st, indent, prof, ruta) {
  const lista = [];
  while (st.i < st.items.length) {
    const it = st.items[st.i];
    if (it.indent < indent) break;
    if (it.indent > indent) E(it.n, 'sangría de más — los ítems de la lista van todos alineados');
    if (!esItemLista(it.texto)) E(it.n, 'en una lista todos los renglones empiezan con "- {…}" — alineá o sacá este renglón');
    const cuerpo = it.texto.slice(1).trim();
    if (cuerpo[0] === '{') {
      const rutaItem = `${ruta}.${lista.length}`;
      st.lineas.set(rutaItem, it.n);
      lista.push(parseMapaLinea(cuerpo, it.n, prof, st, rutaItem));
    } else if (cuerpo[0] === '[') {
      E(it.n, 'lista dentro de una lista — no se acepta anidar');
    } else {
      E(it.n, 'lista de texto en bloque ("- texto") — no se acepta; escribila en una línea: [a, b]');
    }
    st.i++;
  }
  return lista;
}

function prepararItems(cabecera, primeraLinea) {
  const items = [];
  for (let k = 0; k < cabecera.length; k++) {
    const n = primeraLinea + k;
    const limpio = sinComentario(cabecera[k]).replace(/\s+$/, '');
    if (limpio.trim() === '') continue;
    const sangria = /^[ \t]*/.exec(limpio)[0];
    if (sangria.includes('\t')) E(n, 'tabulador en la sangría — usá espacios (2 por nivel)');
    if (sangria.length % 2 !== 0) E(n, 'sangría impar — usá múltiplos de 2 espacios');
    items.push({ n, indent: sangria.length, texto: limpio.slice(sangria.length) });
  }
  return items;
}

// ---------------------------------------------------------------- validación

const ESTADOS = ['molde', 'molde+propio', 'adaptada', 'adaptada (desvío detectado)', 'propia', 'sí', 'no'];
const CLASES = ['real', 'prueba', 'dummy'];
const SENSIBLES = ['datos-reales', 'plata', 'sale-afuera', 'claves', 'release'];
const CONOCIDOS = ['kit', 'nivel', 'vars', 'piezas', 'frenos', 'autorizado', 'sensible', 'secretos', 'publicas',
  'entornos', 'datos-de-prueba', 'push-publica', 'aprueba', 'mesa', 'multi-llm'];

function validar(datos, st, cierre, avisos) {
  const L = (ruta) => (st.lineas.has(ruta) ? st.lineas.get(ruta) : cierre);
  const nom = (ruta) => ruta.replace(/\.(\d+)/g, '[$1]');
  const mapa = (ruta, v) => {
    if (!esMapa(v)) E(L(ruta), `"${nom(ruta)}" tiene que ser un mapa (con sus claves debajo), no ${tipoDe(v)} — corregilo`);
  };
  const lista = (ruta, v) => {
    if (!esLista(v)) E(L(ruta), `"${nom(ruta)}" tiene que ser una lista [a, b], no ${tipoDe(v)} — escribilo entre corchetes`);
  };
  const texto = (ruta, v) => {
    if (!esTexto(v)) E(L(ruta), `"${nom(ruta)}" tiene que ser un texto, no ${tipoDe(v)} — escribí un solo valor`);
  };
  const uno = (ruta, v, opciones) => {
    texto(ruta, v);
    if (!opciones.includes(v)) E(L(ruta), `"${nom(ruta)}" vale "${v}" — tiene que ser uno de: ${opciones.join(', ')}`);
  };
  const patron = (ruta, v, re, ayuda) => {
    texto(ruta, v);
    if (!re.test(v)) E(L(ruta), `"${nom(ruta)}" vale "${v}" — ${ayuda}`);
  };
  const soloClaves = (ruta, obj, permitidas) => {
    for (const k of Object.keys(obj)) {
      if (!permitidas.includes(k)) E(L(`${ruta}.${k}`), `clave desconocida "${k}" en "${nom(ruta)}" — las que valen son: ${permitidas.join(', ')}`);
    }
  };
  const falta = (ruta, clave) => E(L(ruta), `falta "${clave}" en "${nom(ruta)}" — agregala`);
  const requerido = (ruta, obj, clave) => {
    if (!tiene(obj, clave)) falta(ruta, clave);
  };

  // kit, nivel, vars: obligatorios
  if (!tiene(datos, 'kit')) E(cierre, 'falta "kit" — poné la versión del kit, por ejemplo "kit: 2.4.3"');
  patron('kit', datos.kit, RE_VERSION, 'tienen que ser tres números con puntos (N.N.N), por ejemplo 2.4.3');
  if (!tiene(datos, 'nivel')) E(cierre, 'falta "nivel" — poné "nivel: liviano" o "nivel: estandar"');
  uno('nivel', datos.nivel, ['liviano', 'estandar']);
  if (!tiene(datos, 'vars')) E(cierre, 'falta "vars" — poné el mapa con al menos "proyecto"');
  mapa('vars', datos.vars);
  if (!tiene(datos.vars, 'proyecto') || datos.vars.proyecto === '') E(L('vars'), 'falta "proyecto" en "vars" — poné el nombre del proyecto');
  texto('vars.proyecto', datos.vars.proyecto);
  for (const [k, v] of Object.entries(datos.vars)) {
    const r = `vars.${k}`;
    if (k === 'lenguajes') lista(r, v);
    else if (esMapa(v)) E(L(r), `"${r}" no puede ser un mapa — dejalo como texto o lista`);
  }

  if (tiene(datos, 'piezas')) {
    mapa('piezas', datos.piezas);
    for (const [k, v] of Object.entries(datos.piezas)) {
      const r = `piezas.${k}`;
      if (esTexto(v)) uno(r, v, ESTADOS);
      else if (esMapa(v)) {
        soloClaves(r, v, ['estado', 'hash']);
        requerido(r, v, 'estado');
        uno(`${r}.estado`, v.estado, ESTADOS);
        if (tiene(v, 'hash')) patron(`${r}.hash`, v.hash, /^[0-9a-f]{12}$/, 'tiene que tener 12 caracteres hexa en minúscula (0-9, a-f)');
      } else E(L(r), `"${r}" tiene que ser un estado o {estado: …, hash: …}, no una lista — corregilo`);
    }
  }

  if (tiene(datos, 'frenos')) {
    mapa('frenos', datos.frenos);
    soloClaves('frenos', datos.frenos, ['opcionales', 'quitados']);
    if (tiene(datos.frenos, 'opcionales')) lista('frenos.opcionales', datos.frenos.opcionales);
    if (tiene(datos.frenos, 'quitados')) {
      lista('frenos.quitados', datos.frenos.quitados);
      datos.frenos.quitados.forEach((q, i) => {
        const r = `frenos.quitados.${i}`;
        if (!esMapa(q)) E(L('frenos.quitados'), 'cada freno quitado es {id: …, por: "…", hasta: …} — escribilo así, uno por renglón');
        soloClaves(r, q, ['id', 'por', 'hasta']);
        for (const c of ['id', 'por', 'hasta']) {
          requerido(r, q, c);
          if (q[c] === '') E(L(`${r}.${c}`), `"${c}" está vacío en "${nom(r)}" — completalo`);
        }
        patron(`${r}.id`, q.id, /^[a-z]+:[a-z0-9/_.-]+$/, 'tiene que ser <clase>:<nombre>, por ejemplo hook:git-seguro/push-force');
        if (q.hasta !== 'siempre') {
          patron(`${r}.hasta`, q.hasta, /^\d{4}-\d{2}-\d{2}$/, 'tiene que ser "siempre" o una fecha AAAA-MM-DD');
          const [a, m, d] = q.hasta.split('-').map(Number);
          const f = new Date(Date.UTC(a, m - 1, d));
          if (f.getUTCFullYear() !== a || f.getUTCMonth() !== m - 1 || f.getUTCDate() !== d) {
            E(L(`${r}.hasta`), `"hasta" vale "${q.hasta}", que no es una fecha real — corregila (AAAA-MM-DD)`);
          }
        }
      });
    }
  }

  if (tiene(datos, 'sensible')) {
    mapa('sensible', datos.sensible);
    soloClaves('sensible', datos.sensible, SENSIBLES);
    for (const [k, v] of Object.entries(datos.sensible)) {
      const r = `sensible.${k}`;
      if (esTexto(v)) {
        if (v !== 'no') E(L(r), `"${r}" vale "${v}" — tiene que ser "no" o una lista [a, b]`);
      } else lista(r, v);
    }
  }

  for (const k of ['secretos', 'publicas']) {
    if (!tiene(datos, k)) continue;
    lista(k, datos[k]);
    datos[k].forEach((nombre, i) => {
      if (!/^[A-Z][A-Z0-9_]*$/.test(nombre)) {
        E(L(k), `el elemento ${i + 1} de "${k}" no es un nombre de variable — usá MAYUSCULAS_CON_GUION_BAJO; no lo repito porque puede ser un valor`);
      }
    });
  }

  if (tiene(datos, 'entornos')) {
    mapa('entornos', datos.entornos);
    for (const [k, v] of Object.entries(datos.entornos)) {
      const r = `entornos.${k}`;
      mapa(r, v);
      soloClaves(r, v, ['clase', 'herramientas', 'acceso']);
      requerido(r, v, 'clase');
      uno(`${r}.clase`, v.clase, CLASES);
      if (tiene(v, 'herramientas')) lista(`${r}.herramientas`, v.herramientas);
      if (tiene(v, 'acceso')) texto(`${r}.acceso`, v.acceso);
    }
  }

  if (tiene(datos, 'mesa')) {
    mapa('mesa', datos.mesa);
    for (const [k, v] of Object.entries(datos.mesa)) {
      const r = `mesa.${k}`;
      mapa(r, v);
      soloClaves(r, v, ['contacto', 'transporte']);
      requerido(r, v, 'contacto');
      texto(`${r}.contacto`, v.contacto);
      requerido(r, v, 'transporte');
      uno(`${r}.transporte`, v.transporte, ['git', 'buzon']);
    }
  }

  for (const k of ['push-publica', 'multi-llm']) {
    if (tiene(datos, k)) uno(k, datos[k], ['sí', 'no']);
  }
  if (tiene(datos, 'aprueba')) patron('aprueba', datos.aprueba, /^[a-z0-9-]+$/, 'tiene que ser un alias en minúsculas (a-z, 0-9, -), nunca un nombre real');
  if (tiene(datos, 'autorizado')) {
    mapa('autorizado', datos.autorizado);
    for (const [k, v] of Object.entries(datos.autorizado)) texto(`autorizado.${k}`, v);
  }
  if (tiene(datos, 'datos-de-prueba')) texto('datos-de-prueba', datos['datos-de-prueba']);

  // Campos de arriba desconocidos: aviso, no error (una PC atrasada no se tiene que trabar).
  for (const k of Object.keys(datos)) {
    if (!CONOCIDOS.includes(k)) avisos.push(`línea ${L(k)}: campo desconocido \`${k}\` — ¿un error de tipeo?`);
  }
}

// ---------------------------------------------------------------- biblioteca

function leer(texto) {
  let t = String(texto);
  if (t.charCodeAt(0) === 0xfeff) t = t.slice(1);
  t = t.replace(/\r\n/g, '\n');
  const lineas = t.split('\n');

  if (lineas[0] !== '---') E(1, 'la ficha tiene que empezar con --- en la primera línea — agregala');
  let cierre = -1;
  for (let i = 1; i < lineas.length; i++) {
    if (lineas[i] === '---') {
      cierre = i;
      break;
    }
  }
  if (cierre < 0) E(1, 'la cabecera no se cierra — agregá una línea con solo --- después de los campos');

  const items = prepararItems(lineas.slice(1, cierre), 2);
  const st = { items, i: 0, lineas: new Map() };
  const datos = parseMapa(st, 0, 1, '');
  const avisos = [];
  validar(datos, st, cierre + 1, avisos);
  return { datos, prosa: lineas.slice(cierre + 1).join('\n'), avisos };
}

function leerArchivo(ruta) {
  const texto = fs.readFileSync(ruta, 'utf8');
  try {
    return leer(texto);
  } catch (e) {
    if (e instanceof ErrorFicha) throw new ErrorFicha(e.linea, e.mensaje, ruta);
    throw e;
  }
}

// sha256 con CRLF -> LF, 12 primeros caracteres hexa. Acepta string o Buffer.
function hash(contenido) {
  const buf = Buffer.isBuffer(contenido)
    ? Buffer.from(contenido.toString('latin1').replace(/\r\n/g, '\n'), 'latin1')
    : Buffer.from(String(contenido).replace(/\r\n/g, '\n'), 'utf8');
  return crypto.createHash('sha256').update(buf).digest('hex').slice(0, 12);
}

function compararVersiones(a, b) {
  for (const v of [a, b]) {
    if (typeof v !== 'string' || !RE_VERSION.test(v)) throw new Error(`versión inválida "${v}" — tiene que ser N.N.N`);
  }
  const x = a.split('.').map(Number);
  const y = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1;
  }
  return 0;
}

// ---------------------------------------------------------------- línea de comandos

const USO = [
  'uso: node ficha.cjs <subcomando> ...',
  '  leer <archivo>            imprime los datos de la ficha en JSON (avisos por stderr)',
  '  campo <archivo> <a.b.c>   imprime un campo (texto plano, o JSON si es lista o mapa)',
  '  hash <archivo>            12 hexa del sha256 con fines de línea LF',
  '  version                   versión instalada, del proyecto y canónica',
  'salidas: 0 bien · 1 ficha malformada o inválida · 2 mal llamado · 3 no hay ficha',
].join('\n');

function out(s) {
  process.stdout.write(s);
}
function err(s) {
  process.stderr.write(s);
}

function leerParaCli(archivo) {
  try {
    return { r: leerArchivo(archivo) };
  } catch (e) {
    if (e instanceof ErrorFicha) {
      err(`${e.message}\n`);
      return { codigo: 1 };
    }
    if (e && (e.code === 'ENOENT' || e.code === 'ENOTDIR')) {
      err(`${archivo}: no hay ficha — creala o copiá kit.ejemplo.md\n`);
      return { codigo: 3 };
    }
    err(`${archivo}: no se pudo leer la ficha (${e && e.code ? e.code : e}) — revisá la ruta y los permisos\n`);
    return { codigo: 1 };
  }
}

function raizGit(desde) {
  let d = path.resolve(desde);
  for (;;) {
    if (fs.existsSync(path.join(d, '.git'))) return d;
    const padre = path.dirname(d);
    if (padre === d) return null;
    d = padre;
  }
}

function versionDeArchivo(ruta) {
  let t;
  try {
    t = fs.readFileSync(ruta, 'utf8');
  } catch (e) {
    return { falta: e && e.code === 'ENOENT' ? `no existe ${ruta}` : `no se pudo leer ${ruta}` };
  }
  const primera = t.replace(/^﻿/, '').split(/\r?\n/)[0].trim();
  if (!RE_VERSION.test(primera)) return { falta: `${ruta} no tiene el formato N.N.N` };
  return { valor: primera };
}

function subVersion() {
  const home = process.env.HOME || process.env.USERPROFILE || os.homedir();
  const instalada = versionDeArchivo(path.join(home, '.claude', 'VERSION'));
  const raiz = raizGit(process.cwd());
  let proyecto;
  let canonica;
  if (!raiz) {
    proyecto = { falta: 'no estás dentro de un repo git' };
    canonica = { falta: 'no estás dentro de un repo git' };
  } else {
    const fichaRuta = path.join(raiz, '.claude', 'kit.md');
    if (fs.existsSync(fichaRuta)) {
      const res = leerParaCli(fichaRuta);
      if (res.codigo) return res.codigo;
      proyecto = { valor: res.r.datos.kit };
    } else {
      proyecto = { falta: `este repo no tiene .claude/kit.md` };
    }
    const kitVersion = path.join(raiz, 'kit', 'VERSION');
    canonica = fs.existsSync(kitVersion) ? versionDeArchivo(kitVersion) : { falta: 'no hay kit/VERSION: no es el repo de vibe-kit' };
  }
  const f = (x) => x.valor || `— (${x.falta})`;
  let linea = `instalada: ${f(instalada)} · proyecto: ${f(proyecto)} · canónica: ${f(canonica)}`;
  if (instalada.valor && canonica.valor && compararVersiones(instalada.valor, canonica.valor) < 0) {
    linea += ' → esta PC está atrás: actualizate';
  }
  if (proyecto.valor && instalada.valor && compararVersiones(proyecto.valor, instalada.valor) < 0) {
    linea += ' → hay kit nuevo para este proyecto';
  }
  out(`${linea}\n`);
  return 0;
}

function cli(argv) {
  const [sub, ...args] = argv;
  const malLlamado = (porque) => {
    err(`${porque}\n${USO}\n`);
    return 2;
  };
  switch (sub) {
    case 'leer': {
      if (args.length !== 1) return malLlamado('leer necesita un archivo');
      const res = leerParaCli(args[0]);
      if (res.codigo) return res.codigo;
      out(`${JSON.stringify(res.r.datos, null, 2)}\n`);
      for (const a of res.r.avisos) err(`${args[0]}: ${a}\n`);
      return 0;
    }
    case 'campo': {
      if (args.length !== 2) return malLlamado('campo necesita un archivo y una ruta a.b.c');
      const res = leerParaCli(args[0]);
      if (res.codigo) return res.codigo;
      let v = res.r.datos;
      for (const p of args[1].split('.')) {
        if (esMapa(v) && tiene(v, p)) v = v[p];
        else if (esLista(v) && /^\d+$/.test(p) && Number(p) < v.length) v = v[Number(p)];
        else {
          err(`campo ausente: ${args[1]}\n`);
          return 0;
        }
      }
      out(typeof v === 'string' ? `${v}\n` : `${JSON.stringify(v)}\n`);
      return 0;
    }
    case 'hash': {
      if (args.length !== 1) return malLlamado('hash necesita un archivo');
      let buf;
      try {
        buf = fs.readFileSync(args[0]);
      } catch (e) {
        err(`${args[0]}: no se pudo leer el archivo\n`);
        return e && e.code === 'ENOENT' ? 3 : 1;
      }
      out(`${hash(buf)}\n`);
      return 0;
    }
    case 'version': {
      if (args.length !== 0) return malLlamado('version no lleva argumentos');
      return subVersion();
    }
    default:
      return malLlamado(sub ? `subcomando desconocido: ${sub}` : 'falta el subcomando');
  }
}

module.exports = { leer, leerArchivo, hash, compararVersiones, ErrorFicha };

if (require.main === module) {
  process.exitCode = cli(process.argv.slice(2));
}
