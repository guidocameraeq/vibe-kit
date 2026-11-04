'use strict';
// docs-ruta.cjs — la carpeta de papeles del método (SPEC-paquete-8r3, i1): `carpeta-docs:` de la ficha, `docs` sin ella. UNA lectura:
// todo lo del molde que arma una ruta del árbol del método (el handoff, el TODO, docs/modulos/<x>/…) la pide acá.
// Se lee de la ficha VIGENTE (contexto.fichaVigente: la rama por defecto, origin si hay), nunca del disco, como el resto de lo que
// leen los hooks: una sesión no puede mover lo que miran el candado y las barreras editando el disco (D8r3-2). Sin ficha vigente, o
// rota: `docs`. Cambiar la clave es barrera (cambios.cjs idsFicha: frenos:carpeta-docs).
// Está bajo .claude/hooks/**: tocarla es barrera. Node estándar, cero dependencias. Es .cjs a propósito: corre igual con "type": "module".

const path = require('path');
const ficha = require('./ficha.cjs');

const POR_DEFECTO = ficha.CARPETA_DOCS;

// deDatos(datos) → la carpeta de una ficha ya leída ({ datos } de ficha.leer o de fichaVigente).
const deDatos = (datos) => ficha.carpetaDocs(datos);

// deVigente(fv) → la carpeta de un resultado de contexto.fichaVigente (ok → la clave o docs; sin ficha o rota → docs).
const deVigente = (fv) => (fv && fv.estado === 'ok' ? deDatos(fv.datos) : POR_DEFECTO);

// deRaiz(raiz) → la carpeta del checkout, leída de la ficha vigente una vez por proceso y por raíz.
const guardadas = new Map();
function deRaiz(raiz) {
  const clave = path.resolve(raiz || process.cwd());
  if (guardadas.has(clave)) return guardadas.get(clave);
  let c = POR_DEFECTO;
  try {
    // require tardío: contexto.cjs requiere git.cjs y ficha.cjs; así docs-ruta se puede cargar sin git a mano (pruebas, arbol.cjs)
    c = deVigente(require('./contexto.cjs').fichaVigente(clave));
  } catch (e) {
    c = POR_DEFECTO;
  }
  guardadas.set(clave, c);
  return c;
}

// olvidar() → borra lo guardado (las pruebas cambian la ficha dentro del mismo proceso).
function olvidar() {
  guardadas.clear();
}

// rel(carpeta, sub) → `<carpeta>/<sub>` con '/' (sub sin '/' al principio; '' → la carpeta sola).
function rel(carpeta, sub) {
  const s = String(sub || '').replace(/\\/g, '/').replace(/^\/+/, '');
  return s ? `${carpeta}/${s}` : carpeta;
}

module.exports = { POR_DEFECTO, deDatos, deVigente, deRaiz, olvidar, rel };
