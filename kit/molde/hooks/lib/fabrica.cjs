'use strict';
// fabrica.cjs — las fichas de fábrica: lo que trae un proyecto recién montado, por nivel (E §4, F §14, H §4; SPEC-paquete-2 F1).
// Contra ellas compara candado:barreras la exención (b). Las fichas son completas y las lee ficha.leer: acá no hay otro parser.
// Node estándar, cero dependencias. Es .cjs a propósito: corre igual en proyectos con "type": "module".

const fs = require('fs');
const path = require('path');
const { leer } = require('./ficha.cjs');

const NIVELES = Object.freeze(['liviano', 'estandar']);

// nivel: 'liviano' | 'estandar'. carpeta (opcional): dónde buscar ficha.<nivel>.md; por defecto, la carpeta fabrica/ al lado de este
// archivo. Con otra carpeta se leen las de otro árbol (por ejemplo las del padre de un commit). Devuelve {frenos, sensible, autorizado}.
function fabrica(nivel, carpeta) {
  if (typeof nivel !== 'string' || !NIVELES.includes(nivel)) {
    throw new Error(`nivel desconocido — los que hay son: ${NIVELES.join(', ')}`);
  }
  const dir = carpeta === undefined ? path.join(__dirname, 'fabrica') : carpeta;
  const { datos } = leer(fs.readFileSync(path.join(dir, `ficha.${nivel}.md`), 'utf8'));
  return { frenos: datos.frenos, sensible: datos.sensible, autorizado: datos.autorizado };
}

module.exports = { NIVELES, fabrica };
