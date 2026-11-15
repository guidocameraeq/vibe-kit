'use strict';
// firma-falsa.cjs — andamio del banco de prueba (y de la noche de R2): firma un cambio de barrera de una COPIA "como lo hacen las
// pruebas del kit" (por la lib, sin la ventana del dueño). Solo en una copia del banco o de un scratchpad: la firma de verdad la
// mide P7, no esto. Uso: node firma-falsa.cjs <raíz de la copia> <id del cambio>
const path = require('path');
const raiz = path.resolve(process.argv[2] || '.');
const id = process.argv[3];
if (!id || !/scratchpad|[\\/]banco[\\/]/i.test(raiz)) {
  console.error('firma-falsa: no es una copia del banco');
  process.exit(2);
}
const C = require(path.join(raiz, '.claude', 'scripts', 'cambios.cjs'));
const r = C.aprobar(C.libs(), raiz, id);
console.log(r.codigo, (r.lineas || []).join('\n'));
process.exit(r.codigo);
