'use strict';
// Pruebas del parser de la ficha. Corren con: node --test "kit/**/*.test.cjs"
// Regla de estas pruebas: cada regla de la gramática y de la validación tiene su caso, probado en un lugar donde NINGUNA otra
// regla la tape (datos-de-prueba, una clave desconocida de arriba…) y comparando el mensaje con una regex, no solo la línea:
// si alguien borra la regla, la prueba se pone en rojo.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { leer, leerCabecera, leerArchivo, hash, compararVersiones, ErrorFicha } = require('./ficha.cjs');

const SCRIPT = path.join(__dirname, 'ficha.cjs');
const EJEMPLO = path.join(__dirname, '..', '..', 'kit.ejemplo.md');

// El objeto entero, a mano: no sale del parser.
const ESPERADO = {
  kit: '2.4.3',
  nivel: 'estandar',
  vars: {
    proyecto: 'ejemplo',
    'comando-test': 'node --test',
    'comando-setup': 'npm install',
    lenguajes: ['js', 'ts'],
  },
  piezas: {
    inicio: { estado: 'molde+propio', hash: '3f9a0c1d2e4b' },
    cierre: { estado: 'molde+propio', hash: 'b71c55d0a9e3' },
    'hook-arranque': { estado: 'molde', hash: '90e2f1aa7c06' },
    settings: { estado: 'molde+propio', hash: '5d04e9b3c218' },
    'check-code': { estado: 'adaptada (desvío detectado)', hash: '7a1b2c3d4e5f' },
    docs: 'molde',
    'hook-escritura': 'molde',
    candado: 'molde',
    smoke: 'propia',
    release: 'propia',
    'director-obrero': 'no',
    'cambios-metodo': 'molde',
    'docs-fyd': 'sí',
  },
  frenos: {
    opcionales: [],
    quitados: [
      { id: 'hook:git-seguro/push-force', por: 'proyecto personal, el push es libre', hasta: 'siempre' },
      { id: 'pregunta:borrar-datos-reales', por: 'base dummy #3 de la misión 3', hasta: '2026-11-15' },
      { id: 'deny:Bash(git stash:*)', por: 'el flujo de release lo necesita', hasta: 'siempre' },
    ],
  },
  autorizado: {
    'merge-a-main': 'con-gate-verde',
    'escribir-produccion': 'por-comando-con-foto',
  },
  sensible: {
    'datos-reales': ['tabla clientes de la base real'],
    plata: 'no',
    'sale-afuera': ['mails a gerencia'],
    claves: ['cargar-secreto'],
    release: ['npm run release'],
  },
  secretos: ['DB_URL', 'HUB_TOKEN'],
  publicas: ['SUPABASE_ANON_KEY'],
  herramientas: {
    db: { chequeo: 'db ping', 'necesita-guido': 'no' },
    sqlite: { chequeo: 'sqlite3 --version', 'necesita-guido': 'no' },
  },
  entornos: {
    'base-real': { clase: 'real', herramientas: ['db'], acceso: 'db (solo lectura)' },
    'base-local': { clase: 'dummy', herramientas: ['db', 'sqlite'], acceso: 'db (todo)' },
  },
  'datos-de-prueba': 'docs/referencia/PRUEBA.md',
  'push-publica': 'no',
  aprueba: 'po-ejemplo',
  mesa: {
    hub: { contacto: 'hub/director', transporte: 'git' },
    deptos: { contacto: 'deptos/sesion', transporte: 'buzon' },
  },
  'multi-llm': 'no',
};

// ---------------------------------------------------------------- el ejemplo

test('el ejemplo da exactamente el objeto esperado, sin avisos', () => {
  const r = leerArchivo(EJEMPLO);
  assert.deepStrictEqual(r.datos, ESPERADO);
  assert.deepStrictEqual(r.avisos, []);
  assert.ok(r.prosa.startsWith('\n## Cómo se adaptó el kit a este proyecto'));
});

test('el ejemplo dice en la cabecera que es de muestra', () => {
  assert.match(fs.readFileSync(EJEMPLO, 'utf8'), /^# Es un ejemplo de la forma, no una ficha para copiar: sus frenos quitados y autorizaciones son de muestra\.$/m);
});

test('BOM + CRLF dan los mismos datos que con LF', () => {
  const lf = fs.readFileSync(EJEMPLO, 'utf8');
  const raro = '\uFEFF' + lf.replace(/\n/g, '\r\n');
  const a = leer(lf);
  const b = leer(raro);
  assert.deepStrictEqual(b.datos, a.datos);
  assert.deepStrictEqual(b.datos, ESPERADO);
  assert.equal(b.prosa, a.prosa);
});

// ---------------------------------------------------------------- malformados e inválidos

// Base válida: líneas 2 a 5. Lo que se agrega arranca en la línea 6.
const BASE = 'kit: 2.4.3\nnivel: liviano\nvars:\n  proyecto: x\n';
const ficha = (extra) => `---\n${BASE}${extra}---\n`;
const fichaSolo = (kit, nivel, proyecto) => `---\nkit: ${kit}\nnivel: ${nivel}\nvars:\n  proyecto: ${proyecto}\n---\n`;
const HERR = 'herramientas:\n  db: {chequeo: x, necesita-guido: no}\n'; // declara "db": ocupa las líneas 6 y 7
const quitado = (cuerpo) => ficha(`frenos:\n  quitados:\n    - ${cuerpo}\n`); // el ítem cae en la línea 8

// [nombre, texto, línea esperada, regex del mensaje]
// Las reglas de FORMA se prueban sobre datos-de-prueba / colorcito (campos sin validación propia): así solo las tapa la regla misma.
const CASOS = [
  // --- el archivo
  ['sin apertura', 'kit: 2.4.3\n---\n', 1, /tiene que empezar con ---/],
  ['sin cierre', `---\n${BASE}`, 1, /la cabecera no se cierra/],
  ['archivo vacío', '', 1, /tiene que empezar con ---/],
  // --- sangría y niveles
  ['tabulador', ficha('colorcito:\n\ta: b\n'), 7, /tabulador en la sangría/],
  ['sangría impar', ficha('colorcito:\n   a: b\n'), 7, /sangría impar/],
  ['salto de nivel', ficha('colorcito:\n    a: b\n'), 7, /salto de más de un nivel/],
  ['sangría bajo una clave con valor', ficha('colorcito: po\n  x: y\n'), 7, /sangría de más/],
  ['espacio raro (NBSP) en la sangría', ficha('colorcito:\n\u00a0\u00a0a: b\n'), 7, /espacio raro en la sangría/],
  ['espacio raro (NBSP) después de espacios comunes', ficha('colorcito:\n  \u00a0a: b\n'), 7, /espacio raro en la sangría/],
  ['espacio raro (em space) en la sangría', ficha('colorcito:\n\u2003\u2003a: b\n'), 7, /espacio raro en la sangría/],
  ['cuarto nivel', ficha('colorcito:\n  a:\n    b:\n      c: x\n'), 9, /más de tres niveles/],
  ['cuarto nivel con mapa en línea', ficha('colorcito:\n  a:\n    b: {x: y}\n'), 8, /más de tres niveles/],
  ['ítems de lista con sangría de más', ficha('frenos:\n  quitados:\n    - {id: hook:a, por: x, hasta: siempre}\n      - {id: hook:b, por: x, hasta: siempre}\n'), 9, /sangría de más/],
  ['renglón que no es ítem dentro de una lista', ficha('frenos:\n  quitados:\n    - {id: hook:a, por: x, hasta: siempre}\n    otro: x\n'), 9, /todos los renglones empiezan con "- /],
  // --- claves
  ['ítem de lista "-" a nivel de clave', ficha('colorcito: x\n- a\n'), 7, /ítem de lista "-" sin clave arriba/],
  ['ítem de lista "- a: b" a nivel de clave', ficha('colorcito: x\n- a: b\n'), 7, /ítem de lista "-" sin clave arriba/],
  ['clave repetida', ficha('kit: 2.4.4\n'), 6, /clave repetida en el mismo mapa/],
  ['clave repetida en un submapa', ficha('colorcito:\n  a: x\n  a: y\n'), 8, /clave repetida en el mismo mapa/],
  ['clave repetida en mapa en línea', ficha('autorizado: {a: x, a: y}\n'), 6, /clave repetida en el mapa en línea/],
  ['clave inválida (mayúsculas)', ficha('Colorcito: x\n'), 6, /clave inválida/],
  ['clave inválida en mapa en línea', ficha('autorizado: {A: x}\n'), 6, /clave inválida en el mapa en línea/],
  ['dos puntos sin espacio (kit:2.4.3)', '---\nkit:2.4.3\nnivel: liviano\nvars:\n  proyecto: x\n---\n', 2, /falta un espacio después de los dos puntos/],
  ['dos puntos sin espacio en mapa en línea', ficha('autorizado: {a:x}\n'), 6, /falta un espacio después de los dos puntos de una clave/],
  ['clave sin valor en mapa en línea', ficha('autorizado: {a: }\n'), 6, /no tiene valor/],
  ['elemento sin clave: valor en mapa en línea', ficha('autorizado: {a}\n'), 6, /no es "clave: valor"/],
  ['renglón que no es clave: valor', ficha('hola\n'), 6, /no entiendo este renglón/],
  // --- texto
  ['comillas simples', ficha("datos-de-prueba: 'po'\n"), 6, /comillas simples/],
  ['barra invertida en comillas', ficha('datos-de-prueba: "po\\x"\n'), 6, /barra \\ dentro de comillas/],
  ['comilla sin cerrar', ficha('datos-de-prueba: "po\n'), 6, /comilla sin cerrar — cerrala con otra " al final/],
  ['comilla sola', ficha('datos-de-prueba: "\n'), 6, /comilla sin cerrar/],
  ['comilla sin cerrar dentro de una lista', ficha('colorcito: [a, "b]\n'), 6, /comilla sin cerrar — cerrala con otra " antes de la coma/],
  ['texto después de la comilla', ficha('datos-de-prueba: "po" x\n'), 6, /texto después de la comilla de cierre/],
  ['comillas en medio del texto', ficha('datos-de-prueba: a "b" c\n'), 6, /comillas en medio del texto/],
  ['dos puntos con espacio dentro de un texto', ficha('datos-de-prueba: a: b\n'), 6, /dos puntos seguidos de espacio/],
  ['dos puntos al final de un texto', ficha('datos-de-prueba: a:\n'), 6, /dos puntos seguidos de espacio/],
  ['ancla', ficha('datos-de-prueba: &a po\n'), 6, /ancla o alias/],
  ['alias', ficha('datos-de-prueba: *a\n'), 6, /ancla o alias/],
  ['etiqueta', ficha('datos-de-prueba: !!str po\n'), 6, /etiqueta \(!\)/],
  ['texto en varias líneas con |', ficha('datos-de-prueba: |\n  texto\n'), 6, /varias líneas/],
  ['texto en varias líneas con >', ficha('datos-de-prueba: >\n  texto\n'), 6, /varias líneas/],
  ['corchete suelto en un texto sin comillas', ficha('datos-de-prueba: db [todo\n'), 6, /corchete o llave suelta/],
  ['corchete de cierre suelto en un texto', ficha('datos-de-prueba: db todo]\n'), 6, /corchete o llave suelta/],
  ['llave suelta en un texto sin comillas', ficha('datos-de-prueba: db {x\n'), 6, /corchete o llave suelta/],
  ['llave de cierre suelta en un texto', ficha('datos-de-prueba: db x}\n'), 6, /corchete o llave suelta/],
  ['llave suelta en acceso', ficha('entornos:\n  a:\n    clase: real\n    acceso: db {x\n'), 9, /corchete o llave suelta/],
  ['llave de cierre de más tras un mapa en línea', ficha('autorizado: {a: x}}\n'), 6, /corchete o llave suelta/],
  ['corchete suelto en un elemento de lista', ficha('colorcito: [a, b{]\n'), 6, /corchete o llave suelta/],
  ['corchete suelto en un valor de mapa en línea', ficha('autorizado: {a: x]}\n'), 6, /corchete o llave suelta/],
  // --- listas y mapas en línea
  ['lista de escalares en bloque', ficha('colorcito:\n  - DB_URL\n'), 7, /lista de texto en bloque/],
  ['lista anidada en línea', ficha('colorcito: [A, [B]]\n'), 6, /lista dentro de otra lista/],
  ['lista anidada en bloque', ficha('colorcito:\n  - [A]\n'), 7, /lista dentro de una lista/],
  ['mapa dentro de lista en línea', ficha('colorcito: [A, {b: c}]\n'), 6, /mapa dentro de una lista en línea/],
  ['lista dentro de mapa en línea', ficha('autorizado: {a: [b]}\n'), 6, /lista o mapa dentro de un mapa en línea/],
  ['mapa dentro de mapa en línea', ficha('autorizado: {a: {b: c}}\n'), 6, /lista o mapa dentro de un mapa en línea/],
  ['corchete sin cerrar', ficha('colorcito: [A, B\n'), 6, /corchete sin cerrar/],
  ['texto después de ]', ficha('colorcito: [A] x\n'), 6, /corchete sin cerrar \(o texto después del \]\)/],
  ['llave sin cerrar', ficha('autorizado: {a: b\n'), 6, /llave sin cerrar/],
  ['texto después de }', ficha('autorizado: {a: b} x\n'), 6, /llave sin cerrar \(o texto después de la \}\)/],
  ['mapa vacío {}', ficha('autorizado: {}\n'), 6, /mapa vacío/],
  ['elemento vacío en una lista', ficha('colorcito: [a,, b]\n'), 6, /elemento vacío en la lista/],
  ['elemento vacío en un mapa en línea', ficha('autorizado: {a: b,, c: d}\n'), 6, /elemento vacío en el mapa/],
  ['campo vacío sin hijos', ficha('secretos:\npublicas: [A]\n'), 6, /campo vacío/],
  ['campo vacío al final', ficha('secretos:\n'), 6, /campo vacío/],
  // --- kit, nivel, vars
  ['kit con letras', fichaSolo('2.4', 'liviano', 'x'), 2, /"kit" tiene un valor que no se acepta/],
  ['kit: 3', fichaSolo('3', 'liviano', 'x'), 2, /"kit" tiene un valor que no se acepta/],
  ['kit con cero a la izquierda en el mayor', fichaSolo('02.4.3', 'liviano', 'x'), 2, /"kit" tiene un valor que no se acepta/],
  ['kit con cero a la izquierda en el menor', fichaSolo('2.04.3', 'liviano', 'x'), 2, /"kit" tiene un valor que no se acepta/],
  ['kit con cero a la izquierda en el parche', fichaSolo('2.4.03', 'liviano', 'x'), 2, /"kit" tiene un valor que no se acepta/],
  ['kit con valor largo', fichaSolo('2.4.3.1', 'liviano', 'x'), 2, /"kit" tiene un valor que no se acepta/],
  ['nivel como lista de un elemento válido', fichaSolo('2.4.3', '[liviano]', 'x'), 3, /"nivel" tiene que ser un texto/],
  ['kit como lista de un elemento válido', fichaSolo('[2.4.3]', 'liviano', 'x'), 2, /"kit" tiene que ser un texto/],
  ['nivel: largo', fichaSolo('2.4.3', 'largo', 'x'), 3, /"nivel" tiene un valor que no se acepta — tiene que ser uno de: liviano, estandar/],
  ['falta kit', '---\nnivel: liviano\nvars:\n  proyecto: x\n---\n', 5, /falta "kit"/],
  ['falta nivel', '---\nkit: 2.4.3\nvars:\n  proyecto: x\n---\n', 5, /falta "nivel"/],
  ['falta vars', '---\nkit: 2.4.3\nnivel: liviano\n---\n', 4, /falta "vars"/],
  ['vars no es un mapa', '---\nkit: 2.4.3\nnivel: liviano\nvars: x\n---\n', 4, /"vars" tiene que ser un mapa/],
  ['falta proyecto en vars', '---\nkit: 2.4.3\nnivel: liviano\nvars:\n  lenguajes: [js]\n---\n', 4, /falta "proyecto" en "vars"/],
  ['proyecto como lista', fichaSolo('2.4.3', 'liviano', '[a]'), 5, /"vars.proyecto" tiene que ser un texto/],
  ['proyecto como mapa en línea', fichaSolo('2.4.3', 'liviano', '{a: b}'), 5, /"vars.proyecto" tiene que ser un texto/],
  ['proyecto vacío entre comillas', fichaSolo('2.4.3', 'liviano', '""'), 5, /"vars.proyecto" está vacío/],
  ['proyecto solo espacios entre comillas', fichaSolo('2.4.3', 'liviano', '"   "'), 5, /"vars.proyecto" está vacío/],
  ['lenguajes no es lista', ficha('').replace('  proyecto: x\n', '  proyecto: x\n  lenguajes: js\n'), 6, /"vars.lenguajes" tiene que ser una lista/],
  ['una var que es un mapa', ficha('').replace('  proyecto: x\n', '  proyecto: x\n  otra: {a: b}\n'), 6, /"vars.<clave>" no puede ser un mapa/],
  // --- piezas
  ['piezas no es un mapa', ficha('piezas: molde\n'), 6, /"piezas" tiene que ser un mapa/],
  ['estado de pieza inválido', ficha('piezas:\n  inicio: raro\n'), 7, /"piezas.<nombre>" tiene un valor que no se acepta/],
  ['estado de pieza inválido dentro del mapa', ficha('piezas:\n  inicio: {estado: raro}\n'), 7, /"piezas.<nombre>.estado" tiene un valor que no se acepta/],
  ['pieza como lista', ficha('piezas:\n  inicio: [a]\n'), 7, /tiene que ser un estado o \{estado/],
  ['pieza sin estado', ficha('piezas:\n  inicio: {hash: 3f9a0c1d2e4b}\n'), 7, /falta "estado" en "piezas.<nombre>"/],
  ['hash de 11 hexa', ficha('piezas:\n  inicio: {estado: molde, hash: 3f9a0c1d2e4}\n'), 7, /"piezas.<nombre>.hash" tiene un valor que no se acepta — tiene que tener 12/],
  ['hash de 13 hexa', ficha('piezas:\n  inicio: {estado: molde, hash: 3f9a0c1d2e4b5}\n'), 7, /"piezas.<nombre>.hash"/],
  ['hash con mayúsculas', ficha('piezas:\n  inicio: {estado: molde, hash: 3F9A0C1D2E4B}\n'), 7, /"piezas.<nombre>.hash"/],
  // --- frenos
  ['frenos no es un mapa', ficha('frenos: x\n'), 6, /"frenos" tiene que ser un mapa/],
  ['opcionales no es lista', ficha('frenos:\n  opcionales: x\n'), 7, /"frenos.opcionales" tiene que ser una lista/],
  ['quitados no es lista', ficha('frenos:\n  quitados: x\n'), 7, /"frenos.quitados" tiene que ser una lista/],
  ['quitados con un ítem que no es mapa', ficha('frenos:\n  quitados: [a]\n'), 7, /cada freno quitado es/],
  ['quitado sin hasta', quitado('{id: hook:git-seguro/push-force, por: "x"}'), 8, /falta "hasta" en "frenos.quitados\[0\]"/],
  ['quitado sin por', quitado('{id: hook:a, hasta: siempre}'), 8, /falta "por" en "frenos.quitados\[0\]"/],
  ['quitado sin id', quitado('{por: x, hasta: siempre}'), 8, /falta "id" en "frenos.quitados\[0\]"/],
  ['hasta: mañana', quitado('{id: hook:a, por: "x", hasta: mañana}'), 8, /"frenos.quitados\[0\].hasta" tiene un valor que no se acepta/],
  ['hasta con fecha que no existe', quitado('{id: hook:a, por: "x", hasta: 2026-13-45}'), 8, /"frenos.quitados\[0\].hasta" no es una fecha real/],
  ['hasta con 30 de febrero', quitado('{id: hook:a, por: "x", hasta: 2026-02-30}'), 8, /no es una fecha real/],
  ['hasta vacío', quitado('{id: hook:a, por: "x", hasta: " "}'), 8, /"frenos.quitados\[0\].hasta" está vacío/],
  ['por vacío', quitado('{id: hook:a, por: "", hasta: siempre}'), 8, /"frenos.quitados\[0\].por" está vacío/],
  ['por solo espacios', quitado('{id: hook:a, por: "   ", hasta: siempre}'), 8, /"frenos.quitados\[0\].por" está vacío/],
  ['id vacío', quitado('{id: "", por: x, hasta: siempre}'), 8, /"frenos.quitados\[0\].id" está vacío/],
  ['id solo espacios', quitado('{id: "  ", por: x, hasta: siempre}'), 8, /"frenos.quitados\[0\].id" está vacío/],
  ['id sin clase (pushforce)', quitado('{id: pushforce, por: "x", hasta: siempre}'), 8, /"frenos.quitados\[0\].id" tiene un valor que no se acepta — tiene que ser <clase>:<resto>/],
  ['id con clase en mayúsculas', quitado('{id: Hook:a, por: x, hasta: siempre}'), 8, /"frenos.quitados\[0\].id"/],
  ['id con clase con números', quitado('{id: hook2:a, por: x, hasta: siempre}'), 8, /"frenos.quitados\[0\].id"/],
  ['id con clase vacía', quitado('{id: ":a", por: x, hasta: siempre}'), 8, /"frenos.quitados\[0\].id"/],
  ['id con resto vacío', quitado('{id: "hook:", por: x, hasta: siempre}'), 8, /"frenos.quitados\[0\].id"/],
  ['id con espacio al principio del resto', quitado('{id: "hook: x", por: x, hasta: siempre}'), 8, /"frenos.quitados\[0\].id"/],
  ['id con espacio al final', quitado('{id: "hook:x ", por: x, hasta: siempre}'), 8, /"frenos.quitados\[0\].id"/],
  ['id con espacio al principio', quitado('{id: " hook:x", por: x, hasta: siempre}'), 8, /"frenos.quitados\[0\].id"/],
  [
    'ids repetidos: el error cae en el segundo',
    ficha('frenos:\n  quitados:\n    - {id: hook:a, por: x, hasta: siempre}\n    - {id: hook:a, por: y, hasta: 2026-11-15}\n'),
    9,
    /"frenos.quitados\[1\].id" está repetido/,
  ],
  [
    'ids repetidos no consecutivos',
    ficha('frenos:\n  quitados:\n    - {id: hook:a, por: x, hasta: siempre}\n    - {id: hook:b, por: x, hasta: siempre}\n    - {id: hook:a, por: x, hasta: siempre}\n'),
    10,
    /está repetido/,
  ],
  // --- sensible, secretos, entornos, mesa
  ['clave desconocida en sensible (es estricto)', ficha('sensible:\n  raros: no\n'), 7, /clave desconocida en "sensible" — las que valen son: datos-reales, plata, sale-afuera, claves, release/],
  ['sensible no es un mapa', ficha('sensible: x\n'), 6, /"sensible" tiene que ser un mapa/],
  ['valor de sensible que no es no ni lista', ficha('sensible:\n  plata: tal vez\n'), 7, /"sensible.plata" tiene que ser "no" o una lista/],
  ['valor de sensible: "sí"', ficha('sensible:\n  plata: sí\n'), 7, /"sensible.plata" tiene que ser "no" o una lista/],
  ['secretos no es lista', ficha('secretos: DB_URL\n'), 6, /"secretos" tiene que ser una lista/],
  ['publicas no es lista', ficha('publicas: DB_URL\n'), 6, /"publicas" tiene que ser una lista/],
  ['secreto con nombre inválido', ficha('secretos: [DB_URL, db_url]\n'), 6, /el elemento 2 de "secretos" no es un nombre de variable/],
  ['pública con nombre inválido', ficha('publicas: [1ABC]\n'), 6, /el elemento 1 de "publicas" no es un nombre de variable/],
  ['entornos no es un mapa', ficha('entornos: x\n'), 6, /"entornos" tiene que ser un mapa/],
  ['entorno que no es un mapa', ficha('entornos:\n  a: x\n'), 7, /"entornos.<nombre>" tiene que ser un mapa/],
  ['entorno sin clase', ficha('entornos:\n  a:\n    acceso: db\n'), 7, /falta "clase" en "entornos.<nombre>"/],
  ['clase: produccion', ficha('entornos:\n  a:\n    clase: produccion\n'), 8, /"entornos.<nombre>.clase" tiene un valor que no se acepta — tiene que ser uno de: real, prueba, dummy/],
  ['herramientas no es lista', ficha('entornos:\n  a:\n    clase: real\n    herramientas: db\n'), 9, /"entornos.<nombre>.herramientas" tiene que ser una lista/],
  ['acceso no es texto', ficha('entornos:\n  a:\n    clase: real\n    acceso: [db]\n'), 9, /"entornos.<nombre>.acceso" tiene que ser un texto/],
  // --- herramientas (campo de arriba) y las que nombra cada entorno
  ['herramientas no es un mapa', ficha('herramientas: x\n'), 6, /"herramientas" tiene que ser un mapa/],
  ['herramienta que no es un mapa', ficha('herramientas:\n  db: x\n'), 7, /"herramientas.<nombre>" tiene que ser un mapa/],
  ['herramienta sin chequeo (en línea)', ficha('herramientas:\n  db: {necesita-guido: no}\n'), 7, /falta "chequeo" en "herramientas.<nombre>"/],
  ['herramienta sin chequeo (en bloque)', ficha('herramientas:\n  db:\n    necesita-guido: no\n'), 7, /falta "chequeo" en "herramientas.<nombre>"/],
  ['herramienta sin necesita-guido', ficha('herramientas:\n  db: {chequeo: x}\n'), 7, /falta "necesita-guido" en "herramientas.<nombre>"/],
  ['chequeo vacío', ficha('herramientas:\n  db: {chequeo: " ", necesita-guido: no}\n'), 7, /"herramientas.<nombre>.chequeo" está vacío/],
  ['chequeo como lista', ficha('herramientas:\n  db:\n    chequeo: [a]\n    necesita-guido: no\n'), 8, /"herramientas.<nombre>.chequeo" tiene que ser un texto/],
  ['necesita-guido: tal vez', ficha('herramientas:\n  db: {chequeo: x, necesita-guido: tal vez}\n'), 7, /"herramientas.<nombre>.necesita-guido" tiene un valor que no se acepta — tiene que ser uno de: sí, no/],
  ['necesita-guido: true', ficha('herramientas:\n  db: {chequeo: x, necesita-guido: true}\n'), 7, /"herramientas.<nombre>.necesita-guido" tiene un valor que no se acepta/],
  ['necesita-guido como lista', ficha('herramientas:\n  db:\n    chequeo: x\n    necesita-guido: [no]\n'), 9, /"herramientas.<nombre>.necesita-guido" tiene que ser un texto/],
  ['herramienta con nombre inválido', ficha('herramientas:\n  DB: {chequeo: x, necesita-guido: no}\n'), 7, /clave inválida/],
  ['entorno nombra una herramienta que no está declarada (no hay herramientas)', ficha('entornos:\n  a:\n    clase: real\n    herramientas: [db]\n'), 9, /el elemento 1 de "entornos.<nombre>.herramientas" no está declarado en "herramientas" — agregalo arriba/],
  ['entorno nombra una herramienta que no está declarada (el segundo elemento)', ficha(HERR + 'entornos:\n  a:\n    clase: real\n    herramientas: [db, sqlite]\n'), 11, /el elemento 2 de "entornos.<nombre>.herramientas" no está declarado/],
  ['entorno nombra una herramienta con nombre de Object.prototype', ficha(HERR + 'entornos:\n  a:\n    clase: real\n    herramientas: [constructor]\n'), 11, /el elemento 1 de "entornos.<nombre>.herramientas" no está declarado/],
  ['mesa no es un mapa', ficha('mesa: x\n'), 6, /"mesa" tiene que ser un mapa/],
  ['mesa: entrada que no es un mapa', ficha('mesa:\n  hub: x\n'), 7, /"mesa.<alias>" tiene que ser un mapa/],
  ['mesa sin contacto', ficha('mesa:\n  hub:\n    transporte: git\n'), 7, /falta "contacto" en "mesa.<alias>"/],
  ['mesa con contacto solo espacios', ficha('mesa:\n  hub:\n    contacto: "  "\n'), 8, /"mesa.<alias>.contacto" está vacío/],
  ['mesa con contacto lista', ficha('mesa:\n  hub:\n    contacto: [a]\n'), 8, /"mesa.<alias>.contacto" tiene que ser un texto/],
  ['transporte inválido en la mesa', ficha('mesa:\n  hub:\n    contacto: hub/director\n    transporte: paloma\n'), 9, /"mesa.<alias>.transporte" tiene un valor que no se acepta — tiene que ser uno de: git, buzon/],
  ['transporte inválido en la mesa (mapa en línea)', ficha('mesa:\n  hub: {contacto: x, transporte: paloma}\n'), 7, /"mesa.<alias>.transporte" tiene un valor que no se acepta/],
  // --- el resto de los campos
  ['aprueba como lista de un alias válido', ficha('aprueba: [po]\n'), 6, /"aprueba" tiene que ser un texto/],
  ['aprueba con nombre real', ficha('aprueba: Guido Camera\n'), 6, /"aprueba" tiene un valor que no se acepta — tiene que ser un alias en minúsculas/],
  ['push-publica: tal vez', ficha('push-publica: tal vez\n'), 6, /"push-publica" tiene un valor que no se acepta — tiene que ser uno de: sí, no/],
  ['multi-llm: sí o no, no "true"', ficha('multi-llm: true\n'), 6, /"multi-llm" tiene un valor que no se acepta/],
  ['autorizado no es un mapa', ficha('autorizado: x\n'), 6, /"autorizado" tiene que ser un mapa/],
  ['autorizado con un valor lista', ficha('autorizado:\n  a: [x]\n'), 7, /"autorizado.<clave>" tiene que ser un texto/],
  ['datos-de-prueba no es texto', ficha('datos-de-prueba: [a]\n'), 6, /"datos-de-prueba" tiene que ser un texto/],
  ['datos-de-prueba como mapa', ficha('datos-de-prueba: {a: b}\n'), 6, /"datos-de-prueba" tiene que ser un texto/],
];

for (const [nombre, texto, linea, re] of CASOS) {
  test(`malformada: ${nombre} -> error en la línea ${linea}`, () => {
    assert.throws(
      () => leer(texto),
      (e) => {
        assert.ok(e instanceof ErrorFicha, `esperaba ErrorFicha, vino ${e && e.name}: ${e && e.message}`);
        assert.equal(e.linea, linea, `línea distinta: ${e.message}`);
        assert.match(e.mensaje, re);
        return true;
      }
    );
  });
}

test('hay muchos casos malformados', () => {
  assert.ok(CASOS.length >= 100, `hay ${CASOS.length}`);
});

// ---------------------------------------------------------------- UTF-16

test('UTF-16 (little y big endian): error en la línea 1 que lo dice', () => {
  const dir = tmp('ficha-u16');
  const utf8 = fs.readFileSync(EJEMPLO, 'utf8');
  const le = Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(utf8, 'utf16le')]);
  const be = Buffer.from(le);
  be.subarray(2).swap16();
  be[0] = 0xfe;
  be[1] = 0xff;
  for (const [nombre, buf] of [['le', le], ['be', be]]) {
    const f = path.join(dir, `kit-${nombre}.md`);
    fs.writeFileSync(f, buf);
    assert.throws(
      () => leerArchivo(f),
      (e) => e instanceof ErrorFicha && e.linea === 1 && /UTF-16 — guardala en UTF-8/.test(e.mensaje) && e.message.startsWith(`${f}:1: `)
    );
    const r = correr(['leer', f]);
    assert.equal(r.status, 1, nombre);
    assert.match(r.stderr, /:1: la ficha está guardada en UTF-16 — guardala en UTF-8/);
    assert.equal(r.stdout, '');
  }
});

test('un archivo con BOM de UTF-8 se lee igual que sin BOM', () => {
  const dir = tmp('ficha-bom8');
  const f = path.join(dir, 'kit.md');
  fs.writeFileSync(f, Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), fs.readFileSync(EJEMPLO)]));
  assert.deepStrictEqual(leerArchivo(f).datos, ESPERADO);
  assert.equal(correr(['leer', f]).status, 0);
});

// ---------------------------------------------------------------- avisos y casos válidos

test('campo de arriba desconocido: no lanza, avisa con su línea', () => {
  const r = leer(ficha('colorcito: azul\n'));
  assert.equal(r.avisos.length, 1);
  assert.match(r.avisos[0], /^línea 6: campo desconocido `colorcito`/);
  assert.equal(r.datos.colorcito, 'azul');
});

// Una clave desconocida dentro de un mapa conocido avisa igual que arriba (una PC atrasada no se traba); no lanza.
const AVISOS = [
  ['piezas.<x> (mapa en línea)', ficha('piezas:\n  inicio: {estado: molde, color: rojo}\n'), 7, /^línea 7: clave desconocida `color` en `piezas\.<nombre>`/],
  ['piezas.<x> (mapa en bloque)', ficha('piezas:\n  inicio:\n    estado: molde\n    color: rojo\n'), 9, /^línea 9: clave desconocida `color` en `piezas\.<nombre>`/],
  ['frenos', ficha('frenos:\n  raros: [a]\n'), 7, /^línea 7: clave desconocida `raros` en `frenos`/],
  ['ítem de frenos.quitados', quitado('{id: hook:a, por: x, hasta: siempre, otro: y}'), 8, /^línea 8: clave desconocida `otro` en `frenos\.quitados\[0\]`/],
  ['entornos.<n>', ficha('entornos:\n  a:\n    clase: real\n    necesita-guido: no\n'), 9, /^línea 9: clave desconocida `necesita-guido` en `entornos\.<nombre>`/],
  ['herramientas.<x> (mapa en línea)', ficha('herramientas:\n  db: {chequeo: x, necesita-guido: no, extra: y}\n'), 7, /^línea 7: clave desconocida `extra` en `herramientas\.<nombre>`/],
  ['herramientas.<x> (mapa en bloque)', ficha('herramientas:\n  db:\n    chequeo: x\n    necesita-guido: no\n    extra: y\n'), 10, /^línea 10: clave desconocida `extra` en `herramientas\.<nombre>`/],
  ['mesa.<a> (bloque)', ficha('mesa:\n  hub:\n    contacto: x\n    canal: y\n'), 9, /^línea 9: clave desconocida `canal` en `mesa\.<alias>`/],
  ['mesa.<a> (mapa en línea)', ficha('mesa:\n  hub: {contacto: x, canal: y}\n'), 7, /^línea 7: clave desconocida `canal` en `mesa\.<alias>`/],
];

for (const [nombre, texto, linea, re] of AVISOS) {
  test(`aviso, no error: clave desconocida en ${nombre}`, () => {
    const r = leer(texto);
    assert.equal(r.avisos.length, 1, JSON.stringify(r.avisos));
    assert.match(r.avisos[0], re);
    assert.ok(r.avisos[0].startsWith(`línea ${linea}: `));
  });
}

test('aviso de clave desconocida: el CLI sale con 0 y lo imprime por stderr', () => {
  const dir = tmp('ficha-aviso2');
  const f = path.join(dir, 'kit.md');
  fs.writeFileSync(f, quitado('{id: hook:a, por: x, hasta: siempre, otro: y}'));
  const r = correr(['leer', f]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stderr, /línea 8: clave desconocida `otro`/);
});

test('las claves obligatorias siguen siendo obligatorias aunque las desconocidas avisen', () => {
  assert.throws(() => leer(quitado('{id: hook:a, otro: y, hasta: siempre}')), /falta "por"/);
  assert.throws(() => leer(ficha('mesa:\n  hub: {canal: y}\n')), /falta "contacto"/);
  assert.throws(() => leer(ficha('entornos:\n  a:\n    raro: x\n')), /falta "clase"/);
  assert.throws(() => leer(ficha('piezas:\n  inicio: {color: rojo}\n')), /falta "estado"/);
});

test('ficha mínima, comentarios y renglones vacíos', () => {
  const r = leer('---\n# nada\n\nkit: 2.4.3 # la versión\nnivel: liviano\n\nvars:\n  proyecto: "x # no es comentario"\n---\nprosa\n');
  assert.deepStrictEqual(r.datos, { kit: '2.4.3', nivel: 'liviano', vars: { proyecto: 'x # no es comentario' } });
  assert.equal(r.prosa, 'prosa\n');
  assert.deepStrictEqual(r.avisos, []);
});

test('todo valor es texto: no, fecha y versión no se convierten', () => {
  const r = leer(ficha('push-publica: no\nautorizado:\n  a: 2026-11-15\n  b: 2.4.3\n'));
  assert.equal(r.datos['push-publica'], 'no');
  assert.deepStrictEqual(r.datos.autorizado, { a: '2026-11-15', b: '2.4.3' });
});

test('listas vacías y claves con nombres de Object.prototype', () => {
  const r = leer(ficha('secretos: []\nsensible:\n  claves: []\nautorizado:\n  constructor: x\n'));
  assert.deepStrictEqual(r.datos.secretos, []);
  assert.deepStrictEqual(r.datos.sensible.claves, []);
  assert.equal(r.datos.autorizado.constructor, 'x');
});

test('id de un freno quitado: <clase>:<cualquier texto no vacío sin espacios en las puntas>', () => {
  for (const id of ['deny:Bash(git stash:*)', 'hook:git-seguro/push-force', 'pregunta:borrar-datos-reales', 'x:y', 'hook:a b c', 'hook::x']) {
    const r = leer(quitado(`{id: "${id}", por: x, hasta: siempre}`));
    assert.equal(r.datos.frenos.quitados[0].id, id);
  }
  // y sin comillas, tal cual está en el ejemplo
  assert.equal(leer(quitado('{id: deny:Bash(git stash:*), por: x, hasta: siempre}')).datos.frenos.quitados[0].id, 'deny:Bash(git stash:*)');
});

test('ids distintos en frenos.quitados no son repetidos', () => {
  const r = leer(ficha('frenos:\n  quitados:\n    - {id: hook:a, por: x, hasta: siempre}\n    - {id: hook:b, por: x, hasta: siempre}\n    - {id: pregunta:a, por: x, hasta: siempre}\n'));
  assert.equal(r.datos.frenos.quitados.length, 3);
});

test('mesa.<a>.transporte es opcional; si está, git o buzon', () => {
  const sin = leer(ficha('mesa:\n  hub:\n    contacto: hub/director\n  deptos: {contacto: deptos/sesion}\n'));
  assert.deepStrictEqual(sin.datos.mesa, { hub: { contacto: 'hub/director' }, deptos: { contacto: 'deptos/sesion' } });
  assert.deepStrictEqual(sin.avisos, []);
  const buzon = leer(ficha('mesa:\n  hub: {contacto: x, transporte: buzon}\n'));
  assert.equal(buzon.datos.mesa.hub.transporte, 'buzon');
  assert.equal(leer(ficha('mesa:\n  hub: {contacto: x, transporte: git}\n')).datos.mesa.hub.transporte, 'git');
});

test('herramientas: forma válida en línea y en bloque; los entornos nombran las declaradas', () => {
  const r = leer(ficha(
    'herramientas:\n  db: {chequeo: "db ping", necesita-guido: no}\n  sqlite:\n    chequeo: sqlite3 --version\n    necesita-guido: sí\n  sin-uso: {chequeo: x, necesita-guido: no}\n' +
      'entornos:\n  a:\n    clase: real\n    herramientas: [db, sqlite]\n  b:\n    clase: dummy\n    herramientas: []\n  c:\n    clase: prueba\n'
  ));
  assert.deepStrictEqual(r.datos.herramientas, {
    db: { chequeo: 'db ping', 'necesita-guido': 'no' },
    sqlite: { chequeo: 'sqlite3 --version', 'necesita-guido': 'sí' },
    'sin-uso': { chequeo: 'x', 'necesita-guido': 'no' },
  });
  assert.deepStrictEqual(r.datos.entornos.a.herramientas, ['db', 'sqlite']);
  assert.deepStrictEqual(r.avisos, []);
});

test('herramientas sin entornos, y entornos que no nombran herramientas, valen', () => {
  assert.deepStrictEqual(leer(ficha(HERR)).avisos, []);
  assert.deepStrictEqual(leer(ficha('entornos:\n  a:\n    clase: real\n')).avisos, []);
});

test('versiones: 0.0.0 vale; con ceros a la izquierda no', () => {
  assert.equal(leer(fichaSolo('0.0.0', 'liviano', 'x')).datos.kit, '0.0.0');
  assert.equal(leer(fichaSolo('10.20.30', 'liviano', 'x')).datos.kit, '10.20.30');
});

test('textos con corchetes entre comillas o dentro de una palabra con comillas valen', () => {
  const r = leer(ficha('datos-de-prueba: "db [todo]"\nautorizado:\n  a: "x {y}"\n'));
  assert.equal(r.datos['datos-de-prueba'], 'db [todo]');
  assert.equal(r.datos.autorizado.a, 'x {y}');
});

// ---------------------------------------------------------------- los mensajes no repiten lo que escribió el usuario

// El hook imprime estos mensajes en el chat: un secreto pegado donde no va no puede volver a aparecer.
const Z = 'ZZSECRETOZZ';
const z = 'zzsecretozz'; // para las claves, que van en minúscula
const OCULTOS = [
  ['kit', fichaSolo(Z, 'liviano', 'x'), Z],
  ['nivel', fichaSolo('2.4.3', Z, 'x'), Z],
  ['push-publica', ficha(`push-publica: ${Z}\n`), Z],
  ['multi-llm', ficha(`multi-llm: ${Z}\n`), Z],
  ['aprueba', ficha(`aprueba: ${Z}\n`), Z],
  ['estado de pieza', ficha(`piezas:\n  inicio: ${Z}\n`), Z],
  ['estado de pieza en mapa', ficha(`piezas:\n  inicio: {estado: ${Z}}\n`), Z],
  ['hash de pieza', ficha(`piezas:\n  inicio: {estado: molde, hash: ${Z}}\n`), Z],
  ['sensible con texto', ficha(`sensible:\n  plata: ${Z}\n`), Z],
  ['clave desconocida en sensible', ficha(`sensible:\n  ${z}: no\n`), z],
  ['clase de entorno', ficha(`entornos:\n  a:\n    clase: ${Z}\n`), Z],
  ['entorno nombra una herramienta no declarada', ficha(`entornos:\n  a:\n    clase: real\n    herramientas: [${Z}]\n`), Z],
  ['entorno nombra una herramienta no declarada (en minúscula)', ficha(`${HERR}entornos:\n  a:\n    clase: real\n    herramientas: [db, ${z}]\n`), z],
  ['necesita-guido con valor raro', ficha(`herramientas:\n  db: {chequeo: x, necesita-guido: ${Z}}\n`), Z],
  ['chequeo como lista con centinela', ficha(`herramientas:\n  db:\n    chequeo: [${Z}]\n    necesita-guido: no\n`), Z],
  ['nombre de herramienta que no es un mapa', ficha(`herramientas:\n  ${z}: x\n`), z],
  ['nombre de herramienta sin necesita-guido', ficha(`herramientas:\n  ${z}: {chequeo: x}\n`), z],
  ['herramientas como texto', ficha(`entornos:\n  a:\n    clase: real\n    herramientas: ${Z}\n`), Z],
  ['transporte de la mesa', ficha(`mesa:\n  hub:\n    contacto: x\n    transporte: ${Z}\n`), Z],
  ['hasta de un freno', quitado(`{id: hook:a, por: x, hasta: ${Z}}`), Z],
  ['id de un freno', quitado(`{id: ${Z}, por: x, hasta: siempre}`), Z],
  ['id repetido', ficha(`frenos:\n  quitados:\n    - {id: hook:${Z}, por: x, hasta: siempre}\n    - {id: hook:${Z}, por: y, hasta: siempre}\n`), Z],
  ['secreto con nombre inválido', ficha(`secretos: [${Z}-1]\n`), Z],
  ['pública con nombre inválido', ficha(`publicas: [DB_URL, ${Z}.x]\n`), Z],
  ['dos puntos en un texto', ficha(`datos-de-prueba: ${Z}: x\n`), Z],
  ['barra en comillas', ficha(`datos-de-prueba: "${Z}\\x"\n`), Z],
  ['comillas en medio', ficha(`datos-de-prueba: a ${Z} "b"\n`), Z],
  ['comillas simples', ficha(`datos-de-prueba: '${Z}'\n`), Z],
  ['corchete suelto', ficha(`datos-de-prueba: ${Z} [x\n`), Z],
  ['texto después de la comilla', ficha(`datos-de-prueba: "a" ${Z}\n`), Z],
  ['mapa en línea sin clave: valor', ficha(`autorizado: {a: b, ${Z}}\n`), Z],
  ['mapa en línea con clave inválida', ficha(`autorizado: {${Z}: x}\n`), Z],
  ['mapa en línea con clave repetida', ficha(`autorizado: {${z}: a, ${z}: b}\n`), z],
  ['mapa en línea sin espacio tras los dos puntos', ficha(`autorizado: {${z}:x}\n`), z],
  ['clave inválida arriba', ficha(`${Z}: x\n`), Z],
  ['clave repetida arriba', ficha(`${z}: a\n${z}: b\n`), z],
  ['dos puntos sin espacio arriba', ficha(`${z}:${z}\n`), z],
  ['proyecto como lista', fichaSolo('2.4.3', 'liviano', `[${Z}]`), Z],
  ['lenguajes como texto', ficha('').replace('  proyecto: x\n', `  proyecto: x\n  lenguajes: ${Z}\n`), Z],
  ['var que es un mapa', ficha('').replace('  proyecto: x\n', `  proyecto: x\n  ${z}: {a: b}\n`), z],
  ['nombre de pieza inválida', ficha(`piezas:\n  ${z}: raro\n`), z],
  ['nombre de entorno sin clase', ficha(`entornos:\n  ${z}:\n    acceso: db\n`), z],
  ['nombre de alias de la mesa sin contacto', ficha(`mesa:\n  ${z}:\n    transporte: git\n`), z],
  ['clave de autorizado con una lista', ficha(`autorizado:\n  ${z}: [a]\n`), z],
  ['alias de la mesa con transporte inválido', ficha(`mesa:\n  ${z}: {contacto: x, transporte: paloma}\n`), z],
  ['datos-de-prueba como lista', ficha(`datos-de-prueba: [${Z}]\n`), Z],
];

test('hay al menos 10 fichas inválidas con centinela', () => {
  assert.ok(OCULTOS.length >= 10);
});

for (const [nombre, texto, centinela] of OCULTOS) {
  test(`no repite lo que escribió el usuario: ${nombre} (biblioteca y CLI)`, () => {
    let error = null;
    try {
      leer(texto);
    } catch (e) {
      error = e;
    }
    assert.ok(error instanceof ErrorFicha, 'tenía que ser una ficha inválida');
    assert.ok(!error.message.includes(centinela), error.message);
    assert.ok(!error.mensaje.includes(centinela), error.mensaje);
    const dir = tmp('ficha-leak');
    const f = path.join(dir, 'kit.md');
    fs.writeFileSync(f, texto);
    const r = correr(['leer', f]);
    assert.equal(r.status, 1);
    assert.match(r.stderr, new RegExp(`:${error.linea}: `));
    assert.ok(!r.stderr.includes(centinela), r.stderr);
    assert.ok(!r.stdout.includes(centinela), r.stdout);
  });
}

test('compararVersiones no repite la versión que recibió', () => {
  assert.throws(() => compararVersiones(Z, '2.4.3'), (e) => !e.message.includes(Z));
  assert.throws(() => compararVersiones('2.4.3', Z), (e) => !e.message.includes(Z));
});

test('el ErrorFicha de leerArchivo lleva la ruta', () => {
  const dir = tmp('ficha-ruta');
  const f = path.join(dir, 'rota.md');
  fs.writeFileSync(f, ficha("datos-de-prueba: 'x'\n"));
  assert.throws(
    () => leerArchivo(f),
    (e) => e instanceof ErrorFicha && e.linea === 6 && e.message.startsWith(`${f}:6: `)
  );
});

// ---------------------------------------------------------------- hash y versiones

test('hash: igual con LF y con CRLF, 12 hexa', () => {
  const h = hash('a\nb\nc\n');
  assert.equal(h, hash('a\r\nb\r\nc\r\n'));
  assert.match(h, /^[0-9a-f]{12}$/);
  assert.equal(h, crypto.createHash('sha256').update('a\nb\nc\n').digest('hex').slice(0, 12));
  assert.equal(hash(Buffer.from('a\r\nb\r\nc\r\n')), h);
});

test('hash: con y sin BOM de UTF-8 da lo mismo (texto y bytes)', () => {
  const h = hash('línea uno\nlínea dos\n');
  assert.equal(hash('\uFEFFlínea uno\nlínea dos\n'), h);
  assert.equal(hash('\uFEFFlínea uno\r\nlínea dos\r\n'), h);
  const bytes = Buffer.from('línea uno\nlínea dos\n', 'utf8');
  assert.equal(hash(bytes), h);
  assert.equal(hash(Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), bytes])), h);
  assert.equal(hash(Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from('línea uno\r\nlínea dos\r\n')])), h);
  // un BOM en el medio no se toca
  assert.notEqual(hash('a\uFEFFb'), hash('ab'));
});

test('compararVersiones', () => {
  assert.equal(compararVersiones('2.4.3', '2.10.0'), -1);
  assert.equal(compararVersiones('2.10.0', '2.4.3'), 1);
  assert.equal(compararVersiones('2.4.3', '2.4.3'), 0);
  assert.equal(compararVersiones('0.0.0', '0.0.1'), -1);
  assert.throws(() => compararVersiones('2.4', '2.4.3'));
  assert.throws(() => compararVersiones('2.4.3', 'v2.4.3'));
  assert.throws(() => compararVersiones('02.4.3', '2.4.3'));
  assert.throws(() => compararVersiones('2.4.3', '2.4.03'));
  assert.throws(() => compararVersiones(243, '2.4.3'));
});

// ---------------------------------------------------------------- línea de comandos

const tmps = [];
function tmp(prefijo) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), `${prefijo}-`));
  tmps.push(d);
  return d;
}
test.after(() => {
  for (const d of tmps) fs.rmSync(d, { recursive: true, force: true });
});

function correr(args, opciones) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8', ...opciones });
}

// El home de las pruebas: HOME (POSIX) y USERPROFILE (Windows) juntos, que es de donde lo saca os.homedir().
const conHome = (home) => ({ ...process.env, HOME: home, USERPROFILE: home });

test('CLI leer del ejemplo: 0 y JSON igual al esperado', () => {
  const r = correr(['leer', EJEMPLO]);
  assert.equal(r.status, 0, r.stderr);
  assert.deepStrictEqual(JSON.parse(r.stdout), ESPERADO);
  assert.equal(r.stderr, '');
});

test('CLI leer con aviso: 0 y el aviso por stderr', () => {
  const dir = tmp('ficha-aviso');
  const f = path.join(dir, 'kit.md');
  fs.writeFileSync(f, ficha('colorcito: azul\n'));
  const r = correr(['leer', f]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stderr, /línea 6: campo desconocido/);
});

test('CLI leer con ficha rota: 1 y <archivo>:<línea>: en stderr', () => {
  const dir = tmp('ficha-rota');
  const f = path.join(dir, 'kit.md');
  fs.writeFileSync(f, ficha("datos-de-prueba: 'x'\n"));
  const r = correr(['leer', f]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /:\d+: /);
  assert.ok(r.stderr.startsWith(`${f}:6: `), r.stderr);
  assert.equal(r.stdout, '');
});

test('CLI leer de un archivo que no existe: 3 y "no hay ficha — valen los frenos de fábrica"', () => {
  const f = path.join(os.tmpdir(), 'no-existe-ficha-xyz', 'kit.md');
  const r = correr(['leer', f]);
  assert.equal(r.status, 3);
  assert.equal(r.stdout, '');
  assert.equal(r.stderr, `${f}: no hay ficha — valen los frenos de fábrica\n`);
  assert.ok(!/ejemplo/.test(r.stderr));
  // y campo / version se comportan igual con la ficha ausente
  assert.equal(correr(['campo', f, 'kit']).status, 3);
});

test('CLI mal llamado: 2', () => {
  assert.equal(correr(['bailar']).status, 2);
  assert.equal(correr([]).status, 2);
  assert.equal(correr(['leer']).status, 2);
  assert.equal(correr(['campo', EJEMPLO]).status, 2);
  assert.equal(correr(['hash']).status, 2);
  assert.equal(correr(['version', 'x']).status, 2);
  const uso = correr(['bailar']).stderr;
  assert.match(uso, /uso:/);
  assert.match(uso, /salidas: 0 bien · 1 .* · 2 mal llamado · 3 no hay ficha · 4 campo ausente/);
});

test('CLI campo: texto plano, JSON para listas y mapas', () => {
  const a = correr(['campo', EJEMPLO, 'entornos.base-real.clase']);
  assert.equal(a.status, 0);
  assert.equal(a.stdout.trim(), 'real');
  const b = correr(['campo', EJEMPLO, 'secretos']);
  assert.deepStrictEqual(JSON.parse(b.stdout), ['DB_URL', 'HUB_TOKEN']);
  const c = correr(['campo', EJEMPLO, 'frenos.quitados.1.hasta']);
  assert.equal(c.stdout.trim(), '2026-11-15');
  const d = correr(['campo', EJEMPLO, 'frenos.quitados.2.id']);
  assert.equal(d.stdout.trim(), 'deny:Bash(git stash:*)');
  const e = correr(['campo', EJEMPLO, 'mesa.deptos']);
  assert.deepStrictEqual(JSON.parse(e.stdout), { contacto: 'deptos/sesion', transporte: 'buzon' });
  const f = correr(['campo', EJEMPLO, 'frenos.opcionales']);
  assert.deepStrictEqual(JSON.parse(f.stdout), []);
});

test('CLI campo ausente: salida 4, "campo ausente: <ruta>" por stderr y stdout vacío', () => {
  for (const ruta of ['no.existe', 'kit.algo', 'frenos.quitados.9', 'secretos.7', 'entornos.base-real.nada', 'frenos.quitados.x']) {
    const r = correr(['campo', EJEMPLO, ruta]);
    assert.equal(r.status, 4, ruta);
    assert.equal(r.stdout, '', ruta);
    assert.equal(r.stderr, `campo ausente: ${ruta}\n`, ruta);
  }
});

test('CLI hash coincide con la biblioteca', () => {
  const r = correr(['hash', EJEMPLO]);
  assert.equal(r.status, 0);
  assert.equal(r.stdout.trim(), hash(fs.readFileSync(EJEMPLO)));
  assert.match(r.stdout.trim(), /^[0-9a-f]{12}$/);
  assert.equal(correr(['hash', path.join(os.tmpdir(), 'no-existe-xyz')]).status, 3);
});

test('CLI hash: con y sin BOM da lo mismo', () => {
  const dir = tmp('ficha-hash-bom');
  const sin = path.join(dir, 'sin.md');
  const con = path.join(dir, 'con.md');
  fs.writeFileSync(sin, 'uno\ndos\n');
  fs.writeFileSync(con, Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from('uno\r\ndos\r\n')]));
  assert.equal(correr(['hash', con]).stdout, correr(['hash', sin]).stdout);
});

test('CLI version con HOME vacío y un repo sin ficha: 0 y "instalada: —"', () => {
  const home = tmp('ficha-home');
  const repo = tmp('ficha-repo');
  fs.mkdirSync(path.join(repo, '.git'));
  const r = correr(['version'], { cwd: repo, env: conHome(home) });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /instalada: —/);
  assert.match(r.stdout, /proyecto: —/);
  assert.match(r.stdout, /canónica: —/);
});

test('CLI version: la carpeta del usuario sale de os.homedir (USERPROFILE en Windows, HOME en POSIX)', () => {
  const home = tmp('ficha-home');
  const repo = tmp('ficha-repo');
  fs.mkdirSync(path.join(home, '.claude'));
  fs.writeFileSync(path.join(home, '.claude', 'VERSION'), '3.1.4\n');
  fs.mkdirSync(path.join(repo, '.git'));
  const r = correr(['version'], { cwd: repo, env: conHome(home) });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^instalada: 3\.1\.4 · /);
});

test('CLI version sin saber cuál es la carpeta del usuario: "—" con el porqué y 0', (t) => {
  const env = { ...process.env, HOME: '', USERPROFILE: '' };
  const sonda = spawnSync(process.execPath, ['-e', "let h='';try{h=require('os').homedir()}catch(e){}process.stdout.write(h)"], { encoding: 'utf8', env });
  if (sonda.stdout !== '') return t.skip('en este sistema os.homedir() siempre encuentra una carpeta');
  const repo = tmp('ficha-repo');
  fs.mkdirSync(path.join(repo, '.git'));
  const r = correr(['version'], { cwd: repo, env });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^instalada: — \(no se sabe cuál es la carpeta del usuario\) · /);
});

test('CLI version: instalada, proyecto y canónica, con sus avisos de atraso', () => {
  const home = tmp('ficha-home');
  const repo = tmp('ficha-repo');
  fs.mkdirSync(path.join(home, '.claude'));
  fs.writeFileSync(path.join(home, '.claude', 'VERSION'), '2.4.3\n');
  fs.mkdirSync(path.join(repo, '.git'));
  fs.mkdirSync(path.join(repo, 'kit'));
  fs.writeFileSync(path.join(repo, 'kit', 'VERSION'), '2.10.0\n');
  fs.mkdirSync(path.join(repo, '.claude'));
  fs.writeFileSync(path.join(repo, '.claude', 'kit.md'), fs.readFileSync(EJEMPLO, 'utf8').replace('kit: 2.4.3', 'kit: 2.4.0'));
  const sub = path.join(repo, 'kit');
  const r = correr(['version'], { cwd: sub, env: conHome(home) });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(
    r.stdout.trim(),
    'instalada: 2.4.3 · proyecto: 2.4.0 · canónica: 2.10.0 → esta PC está atrás: actualizate → hay kit nuevo para este proyecto'
  );
});

test('CLI version: un VERSION con ceros a la izquierda no es una versión', () => {
  const home = tmp('ficha-home');
  const repo = tmp('ficha-repo');
  fs.mkdirSync(path.join(home, '.claude'));
  fs.writeFileSync(path.join(home, '.claude', 'VERSION'), '02.4.3\n');
  fs.mkdirSync(path.join(repo, '.git'));
  const r = correr(['version'], { cwd: repo, env: conHome(home) });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /instalada: — \(.* no tiene el formato N\.N\.N\)/);
});

test('CLI version con la ficha del repo rota: 1', () => {
  const home = tmp('ficha-home');
  const repo = tmp('ficha-repo');
  fs.mkdirSync(path.join(repo, '.git'));
  fs.mkdirSync(path.join(repo, '.claude'));
  fs.writeFileSync(path.join(repo, '.claude', 'kit.md'), ficha("datos-de-prueba: 'x'\n"));
  const r = correr(['version'], { cwd: repo, env: conHome(home) });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /:6: /);
});

test('proyecto ESM: el .cjs corre igual con "type": "module" al lado', () => {
  const dir = tmp('ficha-esm');
  fs.writeFileSync(path.join(dir, 'package.json'), '{"type":"module"}\n');
  const lib = path.join(dir, '.claude', 'hooks', 'lib');
  fs.mkdirSync(lib, { recursive: true });
  fs.copyFileSync(SCRIPT, path.join(lib, 'ficha.cjs'));
  const r = spawnSync(process.execPath, [path.join(lib, 'ficha.cjs'), 'leer', EJEMPLO], { cwd: dir, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.deepStrictEqual(JSON.parse(r.stdout), ESPERADO);
});

// ---------------------------------------------------------------- leerCabecera: la gramática sin las reglas de la ficha

// La cabecera de un archivo de cambio de método (.claude/cambios/): sin kit/nivel/vars, con el sello en un mapa en línea.
const FRENO = '2026-10-28T23:10:00-03:00 · humano · main · cambios:aprobar · cambios.cjs · 2026-10-28-quitar-push, con coma';
const CAMBIO = [
  '---',
  '# Cambio de método: lo lee cambios.cjs con la gramática de la ficha.',
  'estado: propuesto',
  'clase: 3-barrera',
  'toca: [frenos]',
  'ids: [hook:git-seguro/push-force]',
  'origen: "bitácora 2026-10-28"',
  'cicatriz: no',
  'chico: sí',
  'urgente: no',
  `aprobo: {sesion: abc-123, fecha: 2026-10-28T23:10:00-03:00, carpeta: ., rol: humano, hash: 0123456789ab, freno: "${FRENO}"}`,
  '---',
  '',
  '## Caso de origen',
  'Texto: con dos puntos: y --- adentro no importa.',
  '',
].join('\n');

test('leerCabecera: la cabecera de un cambio de método se lee entera, con su mapa en línea', () => {
  const r = leerCabecera(CAMBIO);
  assert.deepStrictEqual(r.datos, {
    estado: 'propuesto',
    clase: '3-barrera',
    toca: ['frenos'],
    ids: ['hook:git-seguro/push-force'],
    origen: 'bitácora 2026-10-28',
    cicatriz: 'no',
    chico: 'sí',
    urgente: 'no',
    aprobo: {
      sesion: 'abc-123',
      fecha: '2026-10-28T23:10:00-03:00', // los dos puntos de adentro no cortan el valor
      carpeta: '.',
      rol: 'humano',
      hash: '0123456789ab',
      freno: FRENO, // entre comillas: las comas y el " · " quedan enteros
    },
  });
  assert.deepStrictEqual(r.avisos, []);
});

test('leerCabecera acepta lo que leer rechaza: al cambio le falta kit:', () => {
  assert.doesNotThrow(() => leerCabecera(CAMBIO));
  assert.throws(() => leer(CAMBIO), (e) => e instanceof ErrorFicha && e.linea === 12 && /falta "kit"/.test(e.mensaje));
});

test('leerCabecera no valida los campos: un campo desconocido, un kit raro o una clase inventada pasan sin aviso', () => {
  const r = leerCabecera('---\nkit: no-es-version\nnivel: raro\ncolorcito: x\nclase: 9\n---\n');
  assert.deepStrictEqual(r.datos, { kit: 'no-es-version', nivel: 'raro', colorcito: 'x', clase: '9' });
  assert.deepStrictEqual(r.avisos, []);
});

test('leerCabecera corta en el primer --- de la columna 0; el cuerpo no se lee', () => {
  const r = leerCabecera('---\nestado: propuesto\n---\ncosa rara: {sin cerrar\n---\nmás: {\n');
  assert.deepStrictEqual(r.datos, { estado: 'propuesto' });
});

test('leerCabecera: un --- con sangría no cierra la cabecera', () => {
  assert.throws(() => leerCabecera('---\nestado: propuesto\n ---\n'), (e) => e instanceof ErrorFicha && /la cabecera no se cierra/.test(e.mensaje));
});

test('leerCabecera: BOM y CRLF dan lo mismo que LF', () => {
  const raro = '\uFEFF' + CAMBIO.replace(/\n/g, '\r\n');
  assert.deepStrictEqual(leerCabecera(raro).datos, leerCabecera(CAMBIO).datos);
});

test('leerCabecera: la lista de mapas en línea y el mapa en bloque valen (la misma gramática)', () => {
  const r = leerCabecera('---\nfrenos:\n  quitados:\n    - {id: hook:a, por: x, hasta: siempre}\n    - {id: hook:b, por: y, hasta: siempre}\nmapa:\n  a:\n    b: c\n---\n');
  assert.deepStrictEqual(r.datos, {
    frenos: { quitados: [{ id: 'hook:a', por: 'x', hasta: 'siempre' }, { id: 'hook:b', por: 'y', hasta: 'siempre' }] },
    mapa: { a: { b: 'c' } },
  });
});

// [nombre, texto, línea, regex]: errores de gramática, con su línea y sin que ninguna regla de la ficha los tape.
const CASOS_CABECERA = [
  ['sin apertura', 'estado: propuesto\n---\n', 1, /tiene que empezar con ---/],
  ['archivo vacío', '', 1, /tiene que empezar con ---/],
  ['sin cierre', '---\nestado: propuesto\n', 1, /la cabecera no se cierra/],
  ['comillas simples', "---\nestado: propuesto\norigen: 'x'\n---\n", 3, /comillas simples/],
  ['comilla sin cerrar en el sello', '---\nestado: aprobado\naprobo: {sesion: a, freno: "sin cierre}\n---\n', 3, /comilla sin cerrar/],
  ['llave sin cerrar en el sello', '---\nestado: aprobado\naprobo: {sesion: a, rol: humano\n---\n', 3, /llave sin cerrar/],
  ['freno sin comillas con coma: el pedazo no es clave: valor', '---\nestado: aprobado\naprobo: {sesion: a, freno: 2026 · humano, con coma}\n---\n', 3, /no es "clave: valor"/],
  ['freno sin comillas con dos puntos y espacio', '---\nestado: aprobado\naprobo: {sesion: a, freno: cambios: aprobar}\n---\n', 3, /dos puntos seguidos de espacio/],
  ['clave repetida', '---\nestado: propuesto\nestado: aprobado\n---\n', 3, /clave repetida en el mismo mapa/],
  ['tabulador', '---\naprobo:\n\tsesion: a\n---\n', 3, /tabulador en la sangría/],
  ['cuarto nivel', '---\nm:\n  a:\n    b:\n      c: x\n---\n', 5, /más de tres niveles/],
  ['lista dentro de lista', '---\ntoca: [[a]]\n---\n', 2, /lista dentro de otra lista/],
  ['ítem "-" suelto', '---\nestado: propuesto\n- a\n---\n', 3, /ítem de lista "-" sin clave arriba/],
  ['lista de texto en bloque', '---\ntoca:\n  - frenos\n---\n', 3, /lista de texto en bloque/],
  ['barra dentro de comillas', '---\norigen: "a\\b"\n---\n', 2, /barra \\ dentro de comillas/],
];

for (const [nombre, texto, linea, re] of CASOS_CABECERA) {
  test(`leerCabecera, error de gramática con su línea: ${nombre}`, () => {
    assert.throws(
      () => leerCabecera(texto),
      (e) => e instanceof ErrorFicha && e.linea === linea && re.test(e.mensaje) && e.message === `línea ${linea}: ${e.mensaje}`,
    );
  });
}

test('leerCabecera: el mensaje de un error de gramática no repite lo que escribió el usuario', () => {
  assert.throws(
    () => leerCabecera("---\norigen: 'SECRETO-123'\n---\n"),
    (e) => e instanceof ErrorFicha && !e.message.includes('SECRETO-123'),
  );
});

test('leerCabecera: el mismo error de gramática que leer, con la misma línea y el mismo mensaje', () => {
  const malo = ficha("datos-de-prueba: 'x'\n");
  let a;
  let b;
  try { leer(malo); } catch (e) { a = e; }
  try { leerCabecera(malo); } catch (e) { b = e; }
  assert.ok(a instanceof ErrorFicha && b instanceof ErrorFicha);
  assert.equal(b.linea, a.linea);
  assert.equal(b.message, a.message);
});
