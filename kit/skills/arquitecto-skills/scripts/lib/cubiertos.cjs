'use strict';
// cubiertos.cjs — EL lector de kit/cubiertos.md (SPEC-paquete-7 P6.8b-1, D7-2; RF-fix rf-1). Uno solo, para los tres que lo leen:
// actualizar.cjs aplicar (el cierre del ciclo), lib/flota.cjs (el salto "al día") y cambios-flota.cjs (la tabla del ciclo).
// Antes cada uno tenía el suyo y no decían lo mismo: cambios-flota daba para pegar una línea sin pieza: y el de actualizar, con UNA
// entrada mala, anulaba el archivo entero → el ciclo moría en toda la flota.
//
// La regla: una entrada es {cita: "<alias> <id>", version: N.N.N, pieza: <id>} — exactamente esas tres claves, con su forma. Una
// entrada mala se saltea SOLA y se dice (las demás valen). El archivo entero solo no vale si no se lee o no trae la lista cubiertos:.
// Vive en scripts/lib/ (no en pc/lib/, que es copia byte a byte del molde). Node estándar, cero dependencias.

const fs = require('fs');
const path = require('path');
const F = require('../../pc/lib/ficha.cjs');

const RUTA = 'kit/cubiertos.md'; // en la raíz del repo del kit (D7-2)
const FORMA = '{cita: "<alias> <id>", version: N.N.N, pieza: <id>}';
const RE_CITA = /^[a-z0-9-]+ \S+$/; // la de molde/hooks/lib/cambios.cjs
const RE_ALIAS = /^[a-z0-9-]+$/; // la primera mitad de RE_CITA
const RE_VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const RE_PIEZA = /^[a-z0-9][a-z0-9-]*$/;
const CLAVES = ['cita', 'pieza', 'version'];

const esMapa = (x) => !!x && typeof x === 'object' && !Array.isArray(x);

// Por qué una entrada no vale (texto corto), o null si vale.
function problemaDe(x) {
  if (!esMapa(x)) return 'no es un mapa {…}';
  const claves = Object.keys(x);
  const faltan = CLAVES.filter((k) => !claves.includes(k));
  if (faltan.length) return `le falta ${faltan.map((k) => `${k}:`).join(' y ')}`;
  const sobran = claves.filter((k) => !CLAVES.includes(k));
  if (sobran.length) return `le sobra ${sobran.map((k) => `${k}:`).join(' y ')}`;
  if (typeof x.cita !== 'string' || !RE_CITA.test(x.cita)) return 'cita: no tiene la forma "<alias> <id>"';
  if (typeof x.version !== 'string' || !RE_VERSION.test(x.version)) return 'version: no es N.N.N';
  if (typeof x.pieza !== 'string' || !RE_PIEZA.test(x.pieza)) return 'pieza: no es un id del catálogo';
  return null;
}

// validar(texto) → { entradas: [{cita, version, pieza}], malas: [{n, motivo}] } o { problema } si el archivo entero no se lee.
function validar(texto) {
  let datos;
  try {
    datos = F.leerCabecera(String(texto).replace(/^﻿/, '').replace(/\r\n/g, '\n')).datos;
  } catch (e) {
    return { problema: `no se lee (${e.message})` };
  }
  if (!Array.isArray(datos.cubiertos)) return { problema: 'no tiene la lista cubiertos:' };
  const entradas = [];
  const malas = [];
  datos.cubiertos.forEach((x, i) => {
    const motivo = problemaDe(x);
    if (motivo) malas.push({ n: i + 1, motivo });
    else entradas.push(x);
  });
  return { entradas, malas };
}

// leer(archivo) → lo de validar, o { problema: 'no está' } si el archivo no existe.
function leer(archivo) {
  let texto;
  try {
    texto = fs.readFileSync(archivo, 'utf8');
  } catch {
    return { problema: 'no está' };
  }
  return validar(texto);
}

// buscar(dir) → la ruta de cubiertos.md desde la raíz del repo del kit (<dir>/kit/cubiertos.md) o desde kit/ (<dir>/cubiertos.md);
// null si no está en ninguna de las dos.
function buscar(dir) {
  for (const f of [path.join(dir, ...RUTA.split('/')), path.join(dir, 'cubiertos.md')]) {
    try {
      if (fs.statSync(f).isFile()) return f;
    } catch { /* no está ahí */ }
  }
  return null;
}

// La línea que dice que una entrada se salteó (sin prefijo: cada script le pone el suyo).
const lineaMala = (m) => `la entrada ${m.n} no es ${FORMA} (${m.motivo}): la salteo, las demás valen`;

// La entrada que cubre alguna de `claves` (citas "<alias> <id>") con version ≤ `version` (numérica), o undefined.
function cubre(entradas, claves, version) {
  const cs = claves.filter(Boolean);
  return entradas.find((x) => cs.includes(x.cita) && F.compararVersiones(x.version, version) <= 0);
}

module.exports = { RUTA, FORMA, RE_CITA, RE_ALIAS, RE_VERSION, RE_PIEZA, problemaDe, validar, leer, buscar, lineaMala, cubre };
