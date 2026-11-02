'use strict';
// Pruebas de hooks/lib/afirmaciones.cjs (SPEC-0 6.10; A §5 paso 5; K5): qué es prosa en cada lenguaje (comentarios, docstrings,
// textos de error, viñetas de CHANGELOG; el Markdown común afuera) y los casos sí/no de las reglas, sacados del corpus de Hermes
// (las líneas que corrigieron los commits de solo prosa y las que pasaron al revisor) más los de la salida de escape.
// Corren con: node --test "kit/**/*.test.cjs"
const test = require('node:test');
const assert = require('node:assert/strict');

const A = require('./afirmaciones.cjs');

// ---------------------------------------------------------------- qué es prosa

const piezas = (ruta, contenido, o) => [...A.prosa(ruta, contenido, o)].map(([n, ps]) => [n, ps.map((p) => `${p.tipo}:${p.texto}`)]);

test('Python: docstring (también después de def …:), comentario, texto de raise; un "#" dentro de un texto no es comentario', () => {
  const py = [
    'def f():',
    '    """Primera.',
    '    segunda"""',
    '    x = "# no es comentario"  # sí es',
    '    raise ValueError("el texto del error")',
    '    y = """no es docstring: va asignado"""',
    "    raise errores.Mio(f'con prefijo')",
  ].join('\n');
  assert.deepEqual(piezas('a.py', py), [
    [2, ['docstring:Primera.']],
    [3, ['docstring:segunda']],
    [4, ['comentario:sí es']],
    [5, ['error:el texto del error']],
    [7, ['error:con prefijo']],
  ]);
});

test('JS/TS: // y /* */ (de varios renglones), throw new Error y throw de un texto; una "//" dentro de un texto no cuenta', () => {
  const ts = ['const u = "http://x";  // el comentario', '/* uno', ' * dos */', 'throw new Error(`falla`);', "throw 'pelado';"].join('\n');
  assert.deepEqual(piezas('a.tsx', ts), [
    [1, ['comentario:el comentario']],
    [2, ['comentario:uno']],
    [3, ['comentario:* dos']],
    [4, ['error:falla']],
    [5, ['error:pelado']],
  ]);
});

test('SQL (-- y RAISE EXCEPTION), PowerShell (# y <# #>), HTML (<!-- -->)', () => {
  assert.deepEqual(piezas('m.sql', "select '--no'; -- sí\nRAISE EXCEPTION 'texto';"), [[1, ['comentario:sí']], [2, ['error:texto']]]);
  assert.deepEqual(piezas('s.ps1', '<# bloque #>\n$a = 1 # línea'), [[1, ['comentario:bloque']], [2, ['comentario:línea']]]);
  assert.deepEqual(piezas('i.html', '<p>no</p><!-- sí -->'), [[1, ['comentario:sí']]]);
});

test('RF-fix 8: el escape es de cada lenguaje — backtick en PowerShell (y su \'…\' crudo), ninguno en el `…` de Go', () => {
  // con la barra como escape, el texto de PowerShell cerraría en `" y el comentario arrancaría en "# no"
  assert.deepEqual(piezas('s.ps1', '$a = "x`"y # no"  # sí'), [[1, ['comentario:sí']]]);
  assert.deepEqual(piezas('s.ps1', "$b = 'a`' # sí"), [[1, ['comentario:sí']]]);
  assert.deepEqual(piezas('s.ps1', 'Write-Host `"a # sí'), [[1, ['comentario:sí']]], 'el backtick escapa también fuera de un texto');
  // con la barra como escape, el `…` de Go seguiría abierto y se comería el comentario
  assert.deepEqual(piezas('m.go', 'x := `C:\\` // sí'), [[1, ['comentario:sí']]]);
  assert.deepEqual(piezas('m.js', 'x = `C:\\` // no`; // sí'), [[1, ['comentario:sí']]], 'en JS el backtick sí escapa');
  assert.equal(A.lenguaje('m.go'), 'go');
});

test('RF-fix 5: la salida de escape se mira en el bloque — comentarios seguidos y el docstring entero; un bloque aparte no presta', () => {
  const py = [
    '# nunca devuelve None:',
    '# lo fija test_f_no_devuelve_none',
    'x = 1',
    '',
    '# siempre en UTC',
    'def f():',
    '    """Garantiza el orden.',
    '',
    '    medido el 2026-10-20"""',
  ].join('\n');
  assert.deepEqual(A.revisar('a.py', py).map((h) => [h.linea, h.frase]), [[5, 'siempre']]);
  const js = '/* jamás toca la red\n * (red.test.js) */\n// nunca escribe en disco\n\n// sin verificar\n';
  assert.deepEqual(A.revisar('a.js', js).map((h) => [h.linea, h.frase]), [[3, 'nunca']], 'el // de la línea 5 está separado por un renglón vacío');
  assert.deepEqual(A.revisarTexto('nunca falla', 'comentario', 'nunca falla\n(a.test.js)'), [], 'revisarTexto con su bloque');
  // la ventana: en un docstring largo (el de módulo de una prueba nombra su test_…), la evidencia lejana no presta
  assert.equal(A.VENTANA_ESCAPE, 3);
  const largo = ['"""Pruebas de test_modulo_x.', 'uno', 'dos', 'tres', 'nunca cae a la llave', 'cuatro', 'cinco', 'seis', 'siete', 'con 3 casos"""'].join('\n');
  assert.deepEqual(A.revisar('t.py', largo).map((h) => [h.linea, h.frase]), [[5, 'nunca']], 'la evidencia a 4 y 5 renglones no cuenta');
  const cerca = ['"""Pruebas.', 'uno', 'nunca cae a la llave', 'dos', 'lo fija test_llave"""'].join('\n');
  assert.deepEqual(A.revisar('t.py', cerca), [], 'a 2 renglones sí cuenta');
  const borde = ['"""Pruebas.', 'nunca cae a la llave', 'uno', 'dos', 'lo fija test_llave"""'].join('\n');
  assert.deepEqual(A.revisar('t.py', borde), [], 'a 3 renglones justos, también');
  // un /* */ o un docstring es su propio bloque: no hereda la evidencia del comentario de al lado
  assert.deepEqual(A.revisar('a.js', '// lo fija red.test.js\n/* nunca toca la red */\n').map((h) => h.linea), [2]);
  // en Markdown común (con { markdown: true }) el bloque es el párrafo: un renglón vacío lo corta
  assert.deepEqual(A.revisar('N.md', 'nunca falla\n\nmedido el 2026-10-20\n', null, { markdown: true }).map((h) => h.linea), [1]);
  assert.deepEqual(A.revisar('N.md', 'nunca falla\nmedido el 2026-10-20\n', null, { markdown: true }), []);
});

test('Markdown: las viñetas de CHANGELOG sí (fuera de los bloques de código); un README no, salvo con { markdown: true }', () => {
  const md = '# 1.0\n- la viñeta\n```\n- en código\n```\n1. numerada\n';
  assert.deepEqual(piezas('docs/CHANGELOG.md', md), [[2, ['viñeta:la viñeta']], [6, ['viñeta:numerada']]]);
  assert.deepEqual(piezas('README.md', md), []);
  assert.deepEqual(piezas('README.md', 'texto suelto\n', { markdown: true }), [[1, ['markdown:texto suelto']]]);
  assert.deepEqual(piezas('datos.json', '{"a": "// no"}'), [], 'extensión sin prosa');
  assert.equal(A.lenguaje('X.PY'), 'py');
});

test('revisar mira solo los renglones pedidos (los agregados) y CRLF no corre los números', () => {
  const c = '# nunca falla\r\nx = 1\r\n# siempre anda\r\n';
  assert.deepEqual(A.revisar('a.py', c, [3]).map((h) => [h.linea, h.regla, h.frase]), [[3, 'absoluto', 'siempre']]);
  assert.equal(A.revisar('a.py', c).length, 2, 'sin números, todos');
  assert.equal(A.revisar('a.py', c, new Set()).length, 0);
});

// ---------------------------------------------------------------- las reglas: casos sí (del corpus y su forma en inglés)

const SI = [
  ['nunca pasa un dato de la consulta, ni el token, a', 'absoluto'],
  ['garantizadas por otros tests de esta misma seccion (10b) y del', 'absoluto'],
  ['(verificado por AST en', 'evidencia'],
  ['con TODOS los lotes apagados, y NUNCA al revés por el resultado de la', 'absoluto'],
  ['nunca una consulta a las tablas, ni una salida a la red, ni la', 'absoluto'],
  ['caer nunca al camino viejo (Trampa 2).', 'absoluto'],
  ['`[]` -- NUNCA el catálogo legado', 'absoluto'],
  ['nunca `[]` callado y nunca cae a la llave (`L2`, `D5-4 (a)`).', 'absoluto'],
  ['(P3+P16). Se devuelven los dos siempre; el front elige cuál mostrar', 'absoluto'],
  ['del revisor, confirmado contra el código): TanStack cachea en memoria', 'evidencia'],
  ['medido contra la base: que PostgREST acepte la llamada como `anon` lo', 'evidencia'],
  ['solo lectura, aditivo, nunca expuesto al front por ningún método', 'absoluto'],
  ['Integración probada contra la base real', 'evidencia'],
  ['Cubre todas las ramas de escritura', 'cobertura'],
  ['cobertura completa del módulo', 'cobertura'],
  ['esto es imposible con el lock tomado', 'absoluto'],
  ['Garantiza que el orden se mantiene', 'absoluto'],
  ['sin excepción, las filas pasan por la puerta', 'absoluto'],
  ['This always returns a list', 'absoluto'],
  ['verified against production', 'evidencia'],
  ['tested on Windows and Linux', 'evidencia'],
  ['covers all the edge cases', 'cobertura'],
  ['jamás toca la red', 'absoluto'],
  ['comprobado en la base de producción', 'evidencia'],
  ['impossible to reach without the lock', 'absoluto'],
  ['el arreglo quedó testeado a mano', 'evidencia'],
  ['en ningún caso escribe en disco', 'absoluto'],
  ['guarantees idempotency', 'absoluto'],
  ['proven correct by the reviewer', 'evidencia'],
  ['los cambios de todos los caminos quedan adentro', 'cobertura'],
  ['dice que siempre devuelve la lista', 'absoluto'],
  ['siempre, que es lo que pide el front', 'absoluto'],
  ['se calcula siempre de nuevo', 'absoluto'],
];

// ---------------------------------------------------------------- casos no: prosa buena (del corpus) y la salida de escape

const NO = [
  ['Con una sesión por usuario (o sin sesión) no hay camino, ni siquiera con', 'obsoleta: fuera de alcance'],
  ['Transitorio: la sesión por usuario muere con la 5b.9a (release 5b.R2).', 'obsoleta: fuera de alcance'],
  ['lee la config del disco', 'descriptiva'],
  ['devuelve None si la clave no está', 'descriptiva'],
  ['El backend devuelve orden cronológico ASCENDENTE (docstring de', 'descriptiva'],
  ['pendiente aparte y este guardián NO la cubre.', '"cubre" solo no es cobertura total'],
  ['nunca devuelve None (test_f_no_devuelve_none)', 'escape: nombre de prueba'],
  ['verificado en 3f2a9c1', 'escape: SHA'],
  ['siempre en UTC: NO VERIFICADO', 'escape: NO VERIFICADO'],
  ['nunca cae a la llave (core/puertas_http.py:227)', 'escape: archivo:línea'],
  ['medido: 2529 passed', 'escape: cifra'],
  ['número no acota. Medido el 2026-10-20 en loopback, con una IP por host y sin', 'escape: fecha (corpus)'],
  ['supuesto no medido que declara).', 'escape: lo dice como no medido (corpus)'],
  ['🔴 SUPUESTO NO MEDIDO CONTRA ESTE PROYECTO (declarado 2026-09-23):', 'escape: supuesto (corpus)'],
  ['sin verificar contra producción: siempre devuelve 200', 'escape: sin verificar'],
  ['cubre todos los casos (auth.test.ts)', 'escape: archivo de prueba'],
  ['`?? 0` puramente defensivo: el bridge `cuentacorriente_save_niveles`', 'descriptiva (corpus)'],
  ['Quien entró por usuario no tiene token de mail: la primera puerta', 'obsoleta (corpus)'],
  ['`_bitacora_de_cuenta`) — el mockup pide la más nueva arriba.', 'descriptiva (corpus)'],
  ['Por eso se reintenta una vez', 'descriptiva'],
  ['a lo sumo una conexión por hilo', 'descriptiva'],
  ['returns the list sorted by date', 'descriptiva'],
  ['throws when the key is missing', 'descriptiva'],
  ['se probará en el próximo tramo', 'futuro, no afirma'],
  ['el verificador de permisos', 'borde de palabra: verificador'],
  ['el medidor de latencia', 'borde de palabra: medidor'],
  ['el probador del front', 'borde de palabra: probador'],
  ['Toast con creadas/actualizadas/errores.', 'descriptiva (corpus)'],
  ['confirmar_importacion borradas', 'borde: confirmar'],
  ['precision (el test seguia pasando, pero ya no probaba que la aclaracion', 'pasado narrado (corpus)'],
  ['medido: 42% más rápido', 'escape: cifra con % antes de un espacio (RF-fix 6)'],
  ['medido: 3 segundos en loopback', 'escape: segundos (RF-fix 6)'],
  ['verificado en 7,5% de las filas', 'escape: % antes de fin (RF-fix 6)'],
  ['siempre que haya sesión, lee el token', 'condicional: siempre que (RF-fix 7)'],
  ['corta con `RuntimeError`): el texto de siempre, salvo si ya se avisó', 'lo habitual: de siempre (corpus, RF-fix 7)'],
  ['tal cual (el caller la muestra como siempre).', 'lo habitual: como siempre (corpus, RF-fix 7)'],
  ['(lote A apagado o sin sesión de mail): `void`, igual que siempre. Con el', 'lo habitual: igual que siempre (corpus, RF-fix 7)'],
];

test(`casos sí (${SI.length}): cada promesa de más da su regla, con la frase y un "hacé" no vacío`, () => {
  for (const [texto, regla] of SI) {
    const h = A.revisarTexto(texto, 'comentario');
    assert.deepEqual(h.map((x) => x.regla), [regla], texto);
    assert.ok(texto.toLowerCase().includes(h[0].frase.toLowerCase()) && h[0].alternativa.length > 20, texto);
  }
});

test(`casos no (${NO.length}): prosa buena, obsoleta (fuera de alcance) o con su evidencia citada → sin hallazgo`, () => {
  for (const [texto, por] of NO) assert.deepEqual(A.revisarTexto(texto, 'comentario'), [], `${por}: ${texto}`);
});

test('el mensaje avisando pregunta ("¿promete de más? … — si sí: …; si vale, dejalo"); frenando ordena ("eso no: …; hacé: …"); recortado', () => {
  const [h] = A.revisar('a.py', `# nunca ${'x'.repeat(200)}\n`);
  const m = A.mensaje('a.py', h);
  assert.match(m, /^a\.py:1 · absoluto · ¿promete de más\? "nunca" en «nunca x+…» — si sí: decí la condición.*; si vale, dejalo$/);
  assert.doesNotMatch(m, /eso no|hacé:/);
  assert.ok(m.length < 300);
  const f = A.mensaje('a.py', h, { frenar: true });
  assert.match(f, /^a\.py:1 · absoluto · eso no: "nunca" en «nunca x+…»; hacé: decí la condición/);
  assert.doesNotMatch(f, /promete de más/);
});

test('cada regla tiene id, patrón y alternativa; ninguna regla se pisa con el escape en un caso sí', () => {
  assert.deepEqual(A.REGLAS.map((r) => r.id), ['absoluto', 'evidencia', 'cobertura']);
  for (const r of A.REGLAS) assert.ok(r.re instanceof RegExp && /^(decí|citá)/.test(r.alternativa), r.id);
  for (const [texto] of SI) assert.equal(A.RE_EVIDENCIA.test(texto), false, texto);
});
