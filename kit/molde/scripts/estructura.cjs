'use strict';
// estructura.cjs — el candado de estructura (B §14; SPEC-0 6.1; SPEC-paquete-2 P6.1 y F4). Uso, desde el repo:
//   node .claude/scripts/estructura.cjs [todo | parcial | <id>…] [--molde <dir>] [--sin-log]
// Los nueve ids: raiz · rutas · topes · mesa · estados · lecturas · estado-viejo · barreras · datos (con o sin "candado:").
// `todo` (o nada) = los nueve; `parcial` = topes (solo el handoff) y barreras. Entero si piezas.candado de la ficha vigente no es
// `no`; si no, solo barreras, que corre desde que hay ficha. Quitables con hasta: vigente en frenos.quitados, salvo barreras.
// --molde: el molde de afuera para la exención (a) de barreras; lo pasa SOLO rehacer.sh (r3-1). --sin-log: solo para pruebas.
// Salidas: 0 verde · 1 una línea `candado:<id> · qué pasa · qué hacer` por falla (candado:lecturas lista y no cambia la salida),
// o `candado roto: corré doctor` si algo propio falla (nunca 0) · 2 mal llamado. La ficha vigente rota no da 1 sola: imprime
// `ficha rota: <archivo>:<línea> — corré doctor (corro con los frenos de fábrica)` y corre todo, sin frenos quitados (rf-9). Sin node no arranca y no da 0:
// /cierre no commitea sin la salida de este script (lo dice la skill). Cada frenada deja su renglón en .claude/frenos.log.
// La lógica vive en .claude/hooks/lib/ (candado.cjs, barreras.cjs): es barrera, y este script también (r4-3).
// Node estándar, cero dependencias. Es .cjs a propósito: corre igual en proyectos con "type": "module".

const fs = require('fs');
const path = require('path');

const USO = 'Uso: node .claude/scripts/estructura.cjs [todo | parcial | <id>…] [--molde <dir>] [--sin-log]   (desde el repo)';
const ROTO = 'candado roto: corré doctor';
const IDS = ['raiz', 'rutas', 'topes', 'mesa', 'estados', 'lecturas', 'estado-viejo', 'barreras', 'datos'];

class MalLlamado extends Error {}
const malLlamado = (m) => {
  throw new MalLlamado(m);
};

// → { modo: 'todo' | 'parcial' | 'ids', ids, molde, log }
function leerArgumentos(argv) {
  let molde = null;
  let log = true;
  const sueltos = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--molde') {
      if (molde !== null) malLlamado('--molde va una sola vez.');
      if (i + 1 >= argv.length || argv[i + 1] === '' || argv[i + 1].startsWith('-')) malLlamado('--molde pide una carpeta.');
      molde = argv[++i];
    } else if (a === '--sin-log') {
      log = false;
    } else if (a.startsWith('-')) {
      malLlamado(`Argumento desconocido: ${a}`);
    } else sueltos.push(a);
  }
  if (!sueltos.length || (sueltos.length === 1 && sueltos[0] === 'todo')) return { modo: 'todo', ids: IDS.slice(), molde, log };
  if (sueltos.length === 1 && sueltos[0] === 'parcial') return { modo: 'parcial', ids: [], molde, log };
  const ids = [];
  for (const s of sueltos) {
    const id = s.startsWith('candado:') ? s.slice('candado:'.length) : s;
    if (!IDS.includes(id)) malLlamado(`Id desconocido: ${s} (los que hay: ${IDS.join(', ')})`);
    if (!ids.includes(id)) ids.push(id);
  }
  return { modo: 'ids', ids, molde, log };
}

function libs() {
  return {
    contexto: require('../hooks/lib/contexto.cjs'),
    candado: require('../hooks/lib/candado.cjs'),
  };
}

// main(argv, {cwd, salida, error, ahora, home}) → la salida (0 · 1 · 2).
function main(argv, opciones = {}) {
  const salida = opciones.salida || ((s) => process.stdout.write(s));
  const error = opciones.error || ((s) => process.stderr.write(s));
  const cwd = opciones.cwd || process.cwd();
  let a;
  try {
    a = leerArgumentos(argv);
    if (a.molde !== null) {
      const abs = path.resolve(cwd, a.molde);
      let st = null;
      try {
        st = fs.statSync(abs);
      } catch (e) {
        st = null;
      }
      if (!st || !st.isDirectory()) malLlamado('--molde: esa carpeta no existe.');
      a.molde = abs;
    }
  } catch (e) {
    if (e instanceof MalLlamado) {
      error(`${e.message}\n${USO}\n`);
      return 2;
    }
    salida(`${ROTO}\n`);
    return 1;
  }
  let r;
  try {
    const L = libs();
    const raiz = L.contexto.raiz(cwd);
    if (!raiz) r = { codigo: 1, lineas: ['estructura: no estás dentro de un repo git'] };
    else r = L.candado.correr(raiz, { modo: a.modo, ids: a.ids, molde: a.molde || undefined, log: a.log, ahora: opciones.ahora, home: opciones.home });
    if (!r || ![0, 1].includes(r.codigo) || !Array.isArray(r.lineas)) throw new Error('salida inesperada');
  } catch (e) {
    salida(`${ROTO}\n`);
    return 1;
  }
  if (r.lineas.length) salida(`${r.lineas.join('\n')}\n`);
  return r.codigo;
}

if (require.main === module) process.exitCode = main(process.argv.slice(2));

module.exports = { USO, ROTO, IDS, leerArgumentos, libs, main };
