'use strict';
// Pruebas de todo.cjs (la librería). Corren con: node --test "kit/**/*.test.cjs"
// Funciones puras: las edades se arman a mano, sin git.
const test = require('node:test');
const assert = require('node:assert/strict');
const todo = require('./todo.cjs');

const R = '\u{1F534}';
const N = '\u{1F7E0}';
const A = '\u{1F7E1}';
const V = '\u{1F7E2}';
const DIA = 24 * 60 * 60 * 1000;
const HOY = new Date('2026-10-28T12:00:00Z');
const hace = (dias) => new Date(HOY.getTime() - dias * DIA);

const BASE = [
  '# TODO — proyecto',
  '',
  '> ÚNICA fuente de pendientes.',
  '',
  `## ${R} Crítico`,
  '',
  '- [ ] Rojo viejo',
  '',
  `## ${N} Importante`,
  '',
  '- [ ] Naranja viejo',
  '  detalle del naranja',
  '- [ ] Naranja nuevo',
  '- [ ] Naranja esperando',
  '  espera hasta: 2026-12-01',
  '',
  `## ${A} Cuando se pueda`,
  '',
  '- [ ] Amarillo viejo',
  '',
  `## ${V} Ideas / algún día`,
  '',
  '- [ ] Idea vieja',
  '',
  '## Reportado por el usuario',
  '',
  '- [ ] Reporte viejo',
  '',
].join('\n');

// edades para cada renglón: `fn(texto del renglón, índice)` → días de antigüedad (o 'nuevo' = sin commitear, o null = sin dato).
function edades(texto, fn) {
  return texto.split('\n').map((t, i) => {
    const d = fn(t, i);
    if (d === 'nuevo') return { linea: i + 1, sha: '0'.repeat(40), fecha: null, fechaCommit: null, sinCommitear: true, texto: t };
    return { linea: i + 1, sha: 'a'.repeat(40), fecha: d === null ? null : hace(d), fechaCommit: d === null ? null : hace(d), sinCommitear: false, texto: t };
  });
}
const todosHace = (dias) => edades(BASE, () => dias);

// ---------------------------------------------------------------- items

test('items: ítem = checkbox en la columna 0 más sus renglones con sangría; sección por emoji', () => {
  const it = todo.items(BASE);
  assert.deepEqual(
    it.map((x) => [x.seccion, x.primero, x.lineas.length]),
    [
      ['rojo', 'Rojo viejo', 1],
      ['naranja', 'Naranja viejo', 2],
      ['naranja', 'Naranja nuevo', 1],
      ['naranja', 'Naranja esperando', 2],
      ['amarillo', 'Amarillo viejo', 1],
      ['verde', 'Idea vieja', 1],
      ['reportado', 'Reporte viejo', 1],
    ],
  );
});

test('items: tildado, espera y posiciones', () => {
  const it = todo.items(BASE);
  assert.equal(it[3].tieneEspera, true);
  assert.equal(it[3].espera, '2026-12-01');
  assert.equal(it[0].tieneEspera, false);
  assert.equal(it[0].espera, null);
  assert.equal(it[1].inicio, 10);
  assert.equal(it[1].fin, 12);
  const x = todo.items(`## ${N} T\n- [x] Hecho\n- [X] Otro hecho\n- [ ] Abierto\n`);
  assert.deepEqual(x.map((i) => i.hecho), [true, true, false]);
});

test('items: lo que no es ítem no lo es', () => {
  const t = [
    `## ${N} T`,
    '  - [ ] con sangría no es ítem',
    '- sin checkbox',
    '-[ ] sin espacio',
    '* [ ] otro bullet',
    '- [ ]sin espacio después',
    '- [ ] sí',
  ].join('\n');
  assert.deepEqual(todo.items(t).map((i) => i.primero), ['sí']);
});

test('items: un ítem termina en el blanco, en el próximo ítem o en el próximo título', () => {
  const t = `## ${N} T\n- [ ] a\n  d1\n\n  suelto tras blanco\n- [ ] b\n  d2\n## ${A} U\n  detalle huérfano\n- [ ] c\n`;
  const it = todo.items(t);
  assert.deepEqual(it.map((i) => [i.primero, i.lineas.length, i.seccion]), [['a', 2, 'naranja'], ['b', 2, 'naranja'], ['c', 1, 'amarillo']]);
});

test('items: el título es libre, el emoji manda; los de nivel 3 no cambian de sección; el nivel 1 y los títulos sin emoji sí', () => {
  const t = [`## Lo urgente de verdad ${R}`, '- [ ] a', '### Sub', '- [ ] b', '## Sin emoji', '- [ ] c', `# Otro ${R}`, '- [ ] d'].join('\n');
  assert.deepEqual(todo.items(t).map((i) => i.seccion), ['rojo', 'rojo', null, null]);
});

test('items: dentro de un bloque de código no hay ítems ni títulos', () => {
  const t = `## ${N} T\n\`\`\`\n- [ ] ejemplo\n## ${R} falso\n\`\`\`\n- [ ] real\n`;
  const it = todo.items(t);
  assert.deepEqual(it.map((i) => [i.primero, i.seccion]), [['real', 'naranja']]);
});

test('items: texto vacío, CRLF y primer renglón normalizado', () => {
  assert.deepEqual(todo.items(''), []);
  assert.deepEqual(todo.items(undefined), []);
  const it = todo.items(`## ${N} T\r\n- [ ]   mucho    espacio\r\n  detalle\r\n`);
  assert.equal(it.length, 1);
  assert.equal(it[0].primero, 'mucho espacio');
  assert.equal(it[0].lineas.length, 2);
  assert.equal(todo.normalizar('- [x]  A   b '), 'A b');
});

// ---------------------------------------------------------------- cabecera

test('cabecera: solo 🔴 y 🟠, con sus títulos; 🟡, 🟢 y Reportado no', () => {
  const c = todo.cabecera(BASE, 5000);
  assert.ok(c.includes('Rojo viejo') && c.includes('Naranja viejo') && c.includes('detalle del naranja'));
  assert.ok(!c.includes('Amarillo') && !c.includes('Idea vieja') && !c.includes('Reporte'));
  assert.ok(c.startsWith(`## ${R} Crítico\n- [ ] Rojo viejo\n\n## ${N} Importante\n- [ ] Naranja viejo\n  detalle del naranja`));
  assert.ok(!c.includes('más en docs/TODO.md'));
});

test('cabecera: los tildados no van', () => {
  const t = `## ${R} C\n- [x] ya está\n- [ ] falta\n`;
  assert.equal(todo.cabecera(t, 500), `## ${R} C\n- [ ] falta`);
  assert.equal(todo.cabecera(`## ${R} C\n- [x] ya está\n`, 500), '');
});

test('cabecera: sin ítems abiertos en 🔴/🟠, vacía', () => {
  assert.equal(todo.cabecera(`## ${A} T\n- [ ] a\n`, 500), '');
  assert.equal(todo.cabecera('', 500), '');
});

test('cabecera: corta en ítem entero, nunca a mitad, y avisa cuántos quedaron afuera', () => {
  const items = [];
  for (let i = 1; i <= 8; i++) items.push(`- [ ] Pendiente número ${i} con texto de relleno`, `  detalle ${i} largo largo largo`);
  const t = `## ${R} Crítico\n${items.join('\n')}\n`;
  for (const tope of [100, 150, 200, 300, 400]) {
    const c = todo.cabecera(t, tope);
    assert.ok(c.length <= tope, `tope ${tope}: ${c.length}`);
    const renglones = c.split('\n');
    const ultimo = renglones[renglones.length - 1];
    assert.match(ultimo, /^… \(\d+ más en docs\/TODO\.md\)$/);
    // Cada ítem puesto está entero: tantos "Pendiente" como "detalle".
    assert.equal((c.match(/Pendiente número/g) || []).length, (c.match(/detalle \d/g) || []).length);
    const puestos = (c.match(/Pendiente número/g) || []).length;
    assert.equal(Number(/\((\d+) más/.exec(ultimo)[1]), 8 - puestos);
  }
});

test('cabecera: el tope exacto entra; un carácter menos corta el último', () => {
  const t = `## ${R} C\n- [ ] uno\n- [ ] dos\n`;
  const entero = `## ${R} C\n- [ ] uno\n- [ ] dos`;
  assert.equal(todo.cabecera(t, entero.length), entero);
  // Un carácter menos: ya no entran los dos; con la marca, tampoco entra ninguno (la marca sola pesa 25).
  assert.equal(todo.cabecera(t, entero.length - 1), '… (2 más en docs/TODO.md)');
  // Con tres ítems largos, el tope justo del corte (dos ítems + la marca) entra, y uno menos deja un solo ítem.
  const t3 = `## ${R} C\n- [ ] aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\n- [ ] bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb\n- [ ] cccccccccccccccccccccccccccccccccc\n`;
  const dos = `## ${R} C\n- [ ] aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\n- [ ] bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb\n… (1 más en docs/TODO.md)`;
  assert.equal(todo.cabecera(t3, dos.length), dos);
  assert.equal(todo.cabecera(t3, dos.length - 1), `## ${R} C\n- [ ] aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\n… (2 más en docs/TODO.md)`);
});

test('cabecera: 🔴 primero aunque esté después en el archivo; si no entra ni el primero, solo la marca', () => {
  const t = `## ${N} N\n- [ ] naranja\n\n## ${R} R\n- [ ] rojo\n`;
  assert.equal(todo.cabecera(t, 500), `## ${R} R\n- [ ] rojo\n\n## ${N} N\n- [ ] naranja`);
  const c = todo.cabecera(t, 40);
  assert.ok(c.length <= 40);
  const gigante = `## ${R} R\n- [ ] ${'x'.repeat(100)}\n- [ ] otro\n`;
  assert.equal(todo.cabecera(gigante, 60), '… (2 más en docs/TODO.md)');
  assert.equal(todo.cabecera(gigante, 10), '');
});

test('cabecera: el tope por defecto es el de topes.cjs (1.500) y el resultado lo respeta', () => {
  const muchos = [];
  for (let i = 0; i < 60; i++) muchos.push(`- [ ] pendiente ${i} ${'y'.repeat(40)}`);
  const c = todo.cabecera(`## ${R} R\n${muchos.join('\n')}\n`);
  assert.ok(c.length <= require('./topes.cjs').BLOQUES.cabeceraTodo);
  assert.ok(c.length > 1000);
});

// ---------------------------------------------------------------- podar

test('podar: 89 días no baja, 90 sí', () => {
  const t = `## ${N} Importante\n\n- [ ] Pendiente\n\n## ${V} Ideas\n`;
  const e89 = edades(t, () => 89);
  assert.equal(todo.podar(t, e89, HOY).texto, t);
  const e90 = edades(t, () => 90);
  const r = todo.podar(t, e90, HOY);
  assert.notEqual(r.texto, t);
  assert.deepEqual(r.bajados, ['Pendiente']);
  const ir = todo.items(r.texto);
  assert.equal(ir[0].seccion, 'verde');
  // 90 días menos un segundo todavía no.
  const casi = edades(t, () => null).map((x) => ({ ...x, fecha: new Date(HOY.getTime() - 90 * DIA + 1000), sinCommitear: false }));
  assert.equal(todo.podar(t, casi, HOY).texto, t);
});

test('podar: baja de 🟠 y de 🟡; 🔴 no baja por viejo que sea', () => {
  const r = todo.podar(BASE, todosHace(400), HOY);
  const it = todo.items(r.texto);
  const sec = (p) => it.find((i) => i.primero === p).seccion;
  assert.equal(sec('Rojo viejo'), 'rojo');
  assert.equal(sec('Naranja viejo'), 'verde');
  assert.equal(sec('Naranja nuevo'), 'verde');
  assert.equal(sec('Amarillo viejo'), 'verde');
  assert.deepEqual(r.bajados, ['Naranja viejo', 'Naranja nuevo', 'Amarillo viejo']);
});

test('podar: espera hasta: no baja (en cualquier renglón del ítem)', () => {
  const r = todo.podar(BASE, todosHace(400), HOY);
  assert.equal(todo.items(r.texto).find((i) => i.primero === 'Naranja esperando').seccion, 'naranja');
  const t2 = `## ${A} T\n- [ ] espera hasta: 2020-01-01 en el primer renglón\n- [ ] Espera hasta: que responda\n`;
  assert.equal(todo.podar(t2, edades(t2, () => 400), HOY).texto, t2);
});

test('podar: "Reportado por el usuario" no baja', () => {
  const t = '## Reportado por el usuario\n\n- [ ] reporte\n';
  assert.equal(todo.podar(t, edades(t, () => 400), HOY).texto, t);
});

test('podar: lo que ya está en 🟢 no se mueve, ni lo que está fuera de toda sección', () => {
  const t = `- [ ] suelto\n\n## ${V} Ideas\n\n- [ ] a\n- [ ] b\n`;
  const r = todo.podar(t, edades(t, () => 400), HOY);
  assert.equal(r.texto, t);
  assert.deepEqual(r.bajados, []);
});

test('podar: un ítem con un renglón de detalle nuevo (sin commitear o reciente) no baja: manda el renglón más nuevo', () => {
  const t = `## ${N} I\n\n- [ ] Viejo\n  detalle agregado hoy\n- [ ] Otro viejo\n  detalle de ayer\n- [ ] Totalmente viejo\n`;
  const e = edades(t, (txt) => (txt.includes('agregado hoy') ? 'nuevo' : txt.includes('de ayer') ? 1 : 400));
  const r = todo.podar(t, e, HOY);
  assert.deepEqual(r.bajados, ['Totalmente viejo']);
  assert.ok(todo.items(r.texto).find((i) => i.primero === 'Viejo').seccion === 'naranja');
  assert.ok(todo.items(r.texto).find((i) => i.primero === 'Otro viejo').seccion === 'naranja');
});

test('podar: un renglón sin dato (fecha desconocida) o fuera de la lista frena el ítem; sin edades no se poda nada', () => {
  const t = `## ${N} I\n- [ ] a\n  b\n`;
  assert.equal(todo.podar(t, edades(t, (txt) => (txt.includes('  b') ? null : 400)), HOY).texto, t);
  assert.equal(todo.podar(t, edades(t, () => 400).filter((x) => x.linea !== 3), HOY).texto, t);
  assert.equal(todo.podar(t, null, HOY).texto, t);
  assert.equal(todo.podar(t, [], HOY).texto, t);
  assert.equal(todo.podar(t, edades(t, () => 400), 'no es fecha').texto, t);
});

test('podar: si el texto del blame no coincide con el del renglón, no se confía', () => {
  const t = `## ${N} I\n- [ ] a\n`;
  const e = edades(t, () => 400).map((x) => (x.linea === 2 ? { ...x, texto: 'otra cosa' } : x));
  assert.equal(todo.podar(t, e, HOY).texto, t);
});

test('podar: acepta fechas como ms o texto ISO', () => {
  const t = `## ${N} I\n- [ ] a\n`;
  const e = [{ linea: 1, fecha: hace(400).toISOString() }, { linea: 2, fecha: hace(400).getTime() }];
  assert.deepEqual(todo.podar(t, e, HOY.toISOString()).bajados, ['a']);
});

test('podar: el ítem se agrega al final de 🟢 con todos sus renglones, y se saca de donde estaba sin dejar doble blanco', () => {
  const r = todo.podar(BASE, todosHace(400), HOY);
  assert.equal(
    r.texto,
    [
      '# TODO — proyecto',
      '',
      '> ÚNICA fuente de pendientes.',
      '',
      `## ${R} Crítico`,
      '',
      '- [ ] Rojo viejo',
      '',
      `## ${N} Importante`,
      '',
      '- [ ] Naranja esperando',
      '  espera hasta: 2026-12-01',
      '',
      `## ${A} Cuando se pueda`,
      '',
      `## ${V} Ideas / algún día`,
      '',
      '- [ ] Idea vieja',
      '- [ ] Naranja viejo',
      '  detalle del naranja',
      '- [ ] Naranja nuevo',
      '- [ ] Amarillo viejo',
      '',
      '## Reportado por el usuario',
      '',
      '- [ ] Reporte viejo',
      '',
    ].join('\n'),
  );
});

test('podar: con 🟢 vacía (como la plantilla) el ítem queda con su blanco y antes del título siguiente', () => {
  const t = `## ${N} I\n\n- [ ] a\n\n## ${V} Ideas\n\n## Reportado por el usuario\n`;
  const r = todo.podar(t, edades(t, () => 400), HOY);
  assert.equal(r.texto, `## ${N} I\n\n## ${V} Ideas\n\n- [ ] a\n\n## Reportado por el usuario\n`);
  const pegada = `## ${N} I\n- [ ] a\n## ${V} Ideas\n## Otra\n`;
  assert.equal(todo.podar(pegada, edades(pegada, () => 400), HOY).texto, `## ${N} I\n## ${V} Ideas\n\n- [ ] a\n\n## Otra\n`);
});

test('podar: sin sección 🟢 la crea, antes de "Reportado" o al final', () => {
  const t = `## ${N} I\n\n- [ ] a\n\n## Reportado por el usuario\n\n- [ ] r\n`;
  const r = todo.podar(t, edades(t, () => 400), HOY);
  assert.equal(r.texto, `## ${N} I\n\n## ${V} Ideas / algún día\n\n- [ ] a\n\n## Reportado por el usuario\n\n- [ ] r\n`);
  const t2 = `## ${N} I\n\n- [ ] a\n`;
  const r2 = todo.podar(t2, edades(t2, () => 400), HOY);
  assert.equal(r2.texto, `## ${N} I\n\n## ${V} Ideas / algún día\n\n- [ ] a\n\n`.replace(/\n\n$/, '\n'));
  assert.equal(todo.items(r2.texto)[0].seccion, 'verde');
});

test('podar: respeta CRLF y el resto del archivo intacto', () => {
  const t = BASE.replace(/\n/g, '\r\n');
  const r = todo.podar(t, todosHace(400), HOY);
  assert.ok(!/[^\r]\n/.test(r.texto), 'solo CRLF');
  assert.equal(r.texto.replace(/\r\n/g, '\n'), todo.podar(BASE, todosHace(400), HOY).texto);
});

test('podar: es idempotente (una segunda pasada no cambia nada)', () => {
  const r1 = todo.podar(BASE, todosHace(400), HOY);
  const r2 = todo.podar(r1.texto, edades(r1.texto, () => 400), HOY);
  assert.equal(r2.texto, r1.texto);
  assert.deepEqual(r2.bajados, []);
});

test('podar: la plantilla del molde, sin ítems, queda igual', () => {
  const fs = require('fs');
  const path = require('path');
  const plantilla = fs.readFileSync(path.join(__dirname, '..', '..', 'docs', 'TODO.md'), 'utf8');
  assert.equal(todo.podar(plantilla, edades(plantilla, () => 400), HOY).texto, plantilla);
  assert.equal(todo.cabecera(plantilla), '');
});

// ---------------------------------------------------------------- balance

const tx = (...secs) => secs.map(([titulo, ...its]) => `## ${titulo}\n\n${its.map((i) => `- [ ] ${i}`).join('\n')}\n`).join('\n');

test('balance: +n por los nuevos, −m por los que ya no están, k por los de ahora', () => {
  const antes = tx([`${N} I`, 'a', 'b', 'c']);
  const despues = tx([`${N} I`, 'a', 'x', 'y', 'z']);
  assert.deepEqual(todo.balance(antes, despues), { mas: 3, menos: 2, total: 4, bajaron: 0 });
});

test('balance: lo que bajó a 🟢 no cuenta como + ni −, y se cuenta aparte', () => {
  const antes = tx([`${R} C`, 'r'], [`${N} I`, 'a', 'b'], [`${A} U`, 'c'], [`${V} G`, 'd']);
  const despues = tx([`${R} C`, 'r'], [`${N} I`, 'a'], [`${V} G`, 'd', 'b', 'c']);
  assert.deepEqual(todo.balance(antes, despues), { mas: 0, menos: 0, total: 5, bajaron: 2 });
});

test('balance: de 🔴 a 🟢 también es bajar; de 🟢 a 🟠 o de Reportado a 🟢 no', () => {
  const antes = tx([`${R} C`, 'r'], [`${V} G`, 'v'], ['Reportado por el usuario', 'u']);
  const despues = tx([`${V} G`, 'r', 'u'], [`${N} I`, 'v']);
  assert.deepEqual(todo.balance(antes, despues), { mas: 0, menos: 0, total: 3, bajaron: 1 });
});

test('balance: se compara por el primer renglón normalizado (checkbox y espacios no cuentan; los detalles tampoco)', () => {
  const antes = `## ${N} I\n- [ ] Algo   con  espacios\n  detalle viejo\n`;
  const despues = `## ${N} I\n- [x] Algo con espacios\n  detalle nuevo distinto\n  y otro\n`;
  assert.deepEqual(todo.balance(antes, despues), { mas: 0, menos: 0, total: 1, bajaron: 0 });
  // cambiar el primer renglón es sacar uno y poner otro
  assert.deepEqual(todo.balance(antes, `## ${N} I\n- [ ] Algo distinto\n`), { mas: 1, menos: 1, total: 1, bajaron: 0 });
});

test('balance: con ítems repetidos se empareja de a uno', () => {
  const antes = `## ${N} I\n- [ ] igual\n`;
  const despues = `## ${N} I\n- [ ] igual\n- [ ] igual\n`;
  assert.deepEqual(todo.balance(antes, despues), { mas: 1, menos: 0, total: 2, bajaron: 0 });
  assert.deepEqual(todo.balance(despues, antes), { mas: 0, menos: 1, total: 1, bajaron: 0 });
});

test('balance: con el mismo primer renglón en dos secciones, se empareja con la misma sección antes que con otra', () => {
  const antes = `## ${N} I\n- [ ] x\n\n## ${V} G\n- [ ] x\n`;
  const despues = `## ${V} G\n- [ ] x\n`;
  assert.deepEqual(todo.balance(antes, despues), { mas: 0, menos: 1, total: 1, bajaron: 0 });
});

test('balance: contra vacío, todo es +; vacío contra algo, todo es −', () => {
  const t = tx([`${N} I`, 'a', 'b']);
  assert.deepEqual(todo.balance('', t), { mas: 2, menos: 0, total: 2, bajaron: 0 });
  assert.deepEqual(todo.balance(t, ''), { mas: 0, menos: 2, total: 0, bajaron: 0 });
  assert.deepEqual(todo.balance('', ''), { mas: 0, menos: 0, total: 0, bajaron: 0 });
});

test('linea: el formato exacto, byte a byte', () => {
  const l = todo.linea({ mas: 3, menos: 2, total: 41, bajaron: 5 });
  assert.equal(Buffer.from(l).toString('hex'), Buffer.from('TODO: +3 −' + '2 · 41 ítems · 5 bajaron a \u{1F7E2}').toString('hex'));
  assert.equal(
    Buffer.from(l).toString('hex'),
    '544f444f3a202b3320e288923220c2b720343120c3ad74656d7320c2b720352062616a61726f6e206120f09f9fa2',
  );
});
