'use strict';
// Pruebas de inyeccion.cjs. Corren con: node --test "kit/**/*.test.cjs"
// Repos temporales armados acá (mkdtemp + git init, remotos bare locales, identidad y fechas fijas); nunca los repos de prueba
// del kit. La configuración de git de esta PC no entra (un global vacío y sin el del sistema).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-iny-'));
const GLOBAL = path.join(TMP, 'gitconfig-vacio');
fs.writeFileSync(GLOBAL, '');
process.env.GIT_CONFIG_GLOBAL = GLOBAL;
process.env.GIT_CONFIG_NOSYSTEM = '1';

const iny = require('./inyeccion.cjs');
const { EMOJI } = require('./todo.cjs');

test.after(() => fs.rmSync(TMP, { recursive: true, force: true }));

// ---------------------------------------------------------------- ayudantes

const T0 = '2026-10-01T12:00:00-03:00';
const T1 = '2026-10-03T12:00:00-03:00';
const AHORA = new Date('2026-10-06T12:00:00-03:00'); // 5 días después de T0
const RE_HUELLA = /^inyectado: \d{1,3}(\.\d{3})* de 9\.700$/;

let n = 0;
const carpeta = (nombre = 'r') => {
  const d = path.join(TMP, `${nombre}${n++}`);
  fs.mkdirSync(d, { recursive: true });
  return d;
};
let fecha = T0;
function g(cwd, ...args) {
  const r = spawnSync('git', ['-c', 'user.name=Prueba', '-c', 'user.email=prueba@ejemplo.invalid', ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, GIT_AUTHOR_DATE: fecha, GIT_COMMITTER_DATE: fecha },
  });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}
function escribir(d, rel, texto) {
  const p = path.join(d, ...rel.split('/'));
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, texto);
}
function commit(d, archivos, msg = 'c', cuando = T0) {
  fecha = cuando;
  for (const [rel, texto] of Object.entries(archivos)) {
    escribir(d, rel, texto);
    g(d, 'add', '--', rel);
  }
  g(d, 'commit', '-q', '-m', msg);
}
function repo(rama = 'main') {
  const d = carpeta();
  g(d, 'init', '-q', '-b', rama);
  return d;
}

const handoff = (marca = 'H', o = {}) =>
  [
    `# Handoff — ${marca}-proyecto`,
    '',
    '## Estado',
    `- Rama · entorno: ${marca}-rama · local`,
    `- Producción: no hay ${marca}`,
    '',
    '## Próximo paso',
    `${marca}-correr el smoke`,
    '',
    '## Bloqueos',
    `- ${marca}-ninguno`,
    '',
    '## Te espera',
    `- ${marca}-nada`,
    '',
    '## En curso',
    `- ${marca}-nada en curso`,
    '',
    '## Contexto',
    `- ${marca}-sin contexto`,
    o.extra || '',
  ].join('\n');
const TODO_CHICO = `# TODO\n\n## ${EMOJI.rojo} Crítico\n- [ ] arreglar ROJO-1\n\n## ${EMOJI.naranja} Importante\n- [ ] NARANJA-1\n\n## ${EMOJI.amarillo} Cuando se pueda\n- [ ] AMARILLO-1\n`;
const fichaKit = (o = {}) => `---\nkit: ${o.kit || '2.4.3'}\nnivel: ${o.nivel || 'liviano'}\nvars:\n  proyecto: ${o.proyecto || 'proyecto-x'}\n---\n`;
const FICHA_ROTA = '---\nkit: 2.4.3\nnivel: liviano\nvars:\n  proyecto: x\ncolorcito:\n\ta: b\n---\n';
const fichaModulo = (x, estado, o = {}) =>
  [`# Módulo ${x}`, '', `Estado: ${estado}`, o.rama ? `rama: ${o.rama}` : null, `Próximo paso: ${o.proximo || `PROX-${x}`}`, '', o.extra || `FICHA-${x}`, '']
    .filter((l) => l !== null)
    .join('\n');

const lineas = (t) => t.split('\n');
const ultima = (t) => lineas(t).pop();
// Con la PC cargada un blame puede pasar los 2 s del hook: las pruebas le dan 60 (el tope tiene su propia prueba).
const armar = (cwd, o = {}) =>
  iny.armar({ cwd, entrada: o.entrada || {}, home: o.home, ahora: o.ahora || AHORA, propio: o.propio, tiempoBlame: o.tiempoBlame || 60000 });

function chequearHuella(r) {
  assert.match(ultima(r.texto), RE_HUELLA);
  assert.ok(r.texto.length <= 9700, `total ${r.texto.length}`);
  assert.equal(r.n, r.texto.length - ultima(r.texto).length);
  assert.equal(ultima(r.texto), `inyectado: ${iny.miles(r.n)} de 9.700`);
}

// Una foto de todo lo que hay en una carpeta (rutas, tamaños y fechas), .git incluido.
function foto(d) {
  const res = [];
  const recorrer = (p) => {
    for (const e of fs.readdirSync(p, { withFileTypes: true })) {
      const q = path.join(p, e.name);
      if (e.isDirectory()) recorrer(q);
      else {
        const s = fs.statSync(q);
        res.push(`${path.relative(d, q)} ${s.size} ${s.mtimeMs}`);
      }
    }
  };
  recorrer(d);
  return res.sort().join('\n');
}

// ---------------------------------------------------------------- piezas sueltas

test('miles: punto de miles', () => {
  assert.equal(iny.miles(9700), '9.700');
  assert.equal(iny.miles(523), '523');
  assert.equal(iny.miles(1000), '1.000');
  assert.equal(iny.miles(1234567), '1.234.567');
  assert.equal(iny.huella(5375), 'inyectado: 5.375 de 9.700');
});

test('cortarRenglones: renglones enteros, la marca cuenta, sin cortar si entra', () => {
  const l = ['aaaa', 'bbbb', 'cccc'];
  assert.deepEqual(iny.cortarRenglones(l, 14, () => 'X'), { lineas: l, cortado: false });
  const c = iny.cortarRenglones(l, 11, (k) => `+${k}`);
  assert.deepEqual(c, { lineas: ['aaaa', '+2'], cortado: true });
  assert.ok(c.lineas.join('\n').length <= 11);
  assert.deepEqual(iny.cortarRenglones(l, 9, null), { lineas: ['aaaa', 'bbbb'], cortado: true });
  assert.deepEqual(iny.cortarRenglones(l, 1, () => 'larga'), { lineas: [], cortado: true });
});

test('datosFichaModulo: Estado, rama y Próximo paso (con y sin guion); activo = EN OBRA o PAUSADO', () => {
  const d = iny.datosFichaModulo('# x\n- Estado: EN OBRA\n- rama: `modulo/x`\nPróximo paso: probar\n');
  assert.deepEqual(d, { estado: 'EN OBRA', iEstado: 1, rama: 'modulo/x', proximo: 'probar', activo: true });
  assert.equal(iny.datosFichaModulo('Estado: PAUSADO desde ayer').activo, true);
  assert.equal(iny.datosFichaModulo('Estado: COMPLETO').activo, false);
  assert.equal(iny.datosFichaModulo('Estado: EN OBRAS').activo, false);
  assert.equal(iny.datosFichaModulo('sin estado').activo, false);
  assert.equal(iny.datosFichaModulo('Estado: EN OBRA').rama, null);
});

// ---------------------------------------------------------------- criterio 3: el handoff de 20 KB

test('criterio 3: handoff de 20 KB → primera línea CORTADO, total ≤ 9.700, huella exacta al final', () => {
  const d = repo();
  const largo = handoff('H', { extra: Array.from({ length: 400 }, (_, i) => `- relleno ${i} con tildes áéíóú y algo más de texto`).join('\n') });
  assert.ok(Buffer.byteLength(largo) > 20000);
  commit(d, { 'docs/SESSION_HANDOFF.md': largo, 'docs/TODO.md': TODO_CHICO });
  const r = armar(d);
  const l = lineas(r.texto);
  assert.equal(l[0], 'CORTADO: el handoff — leé el resto en docs/SESSION_HANDOFF.md antes de confiar en lo de abajo');
  chequearHuella(r);
  assert.deepEqual(r.cortes, [{ que: 'el handoff', ruta: 'docs/SESSION_HANDOFF.md' }]);
  assert.ok(r.texto.includes('… (CORTADO: sigue en docs/SESSION_HANDOFF.md)'));
  // Lo del principio está; lo del final del handoff no; los bloques de abajo, sí.
  assert.ok(r.texto.includes('H-correr el smoke'));
  assert.ok(r.texto.includes('- relleno 0 con'));
  assert.ok(!r.texto.includes('- relleno 399 con'));
  assert.ok(r.texto.includes('NARANJA-1'));
  assert.ok(r.texto.includes(iny.RECORDATORIO));
  // El bloque del handoff no pasa de 5.000.
  const ini = l.indexOf('=== handoff (docs/SESSION_HANDOFF.md) ===');
  const fin = l.indexOf('', ini);
  assert.ok(l.slice(ini + 1, fin).join('\n').length <= 5000 + 100);
});

test('un handoff que entra: sin CORTADO, la cabecera arriba', () => {
  const d = repo();
  commit(d, { 'docs/SESSION_HANDOFF.md': handoff('H'), 'docs/TODO.md': TODO_CHICO });
  const r = armar(d);
  assert.ok(!r.texto.startsWith('CORTADO'));
  assert.deepEqual(r.cortes, []);
  assert.match(lineas(r.texto)[0], new RegExp(`^${path.basename(d)} · main · `));
  chequearHuella(r);
});

test('armar no escribe nada (ni en el árbol ni en .git)', () => {
  const d = repo();
  commit(d, { 'docs/SESSION_HANDOFF.md': handoff('H'), 'docs/TODO.md': TODO_CHICO });
  escribir(d, 'suelto.txt', 'sin commitear');
  const antes = foto(d);
  armar(d, { entrada: { session_id: 'abc-1' } });
  assert.equal(foto(d), antes);
});

// ---------------------------------------------------------------- criterio 4: por pestaña

const pest = (() => {
  let cache = null;
  return () => {
    if (cache) return cache;
    const d = repo();
    commit(d, { '.gitignore': '/.claude/worktrees/\n', 'docs/SESSION_HANDOFF.md': handoff('MAIN'), 'docs/TODO.md': TODO_CHICO });
    g(d, 'switch', '-q', '-c', 'modulo/x');
    commit(d, {
      'docs/SESSION_HANDOFF.md': handoff('DIRWT'),
      'docs/modulos/x/README.md': fichaModulo('x', 'EN OBRA', { rama: 'modulo/x' }),
      'docs/modulos/x/bitacora/2026-10-01-encargo-01.md': '# encargo 01\n',
    });
    g(d, 'switch', '-q', 'main');
    g(d, 'worktree', 'add', '-q', '.claude/worktrees/modulo--x', 'modulo/x');
    g(d, 'worktree', 'add', '-q', '-b', 'modulo/x--01', '.claude/worktrees/modulo--x--01', 'modulo/x');
    g(d, 'worktree', 'add', '-q', '-b', 'modulo/x--02', '.claude/worktrees/modulo--x--02', 'modulo/x');
    g(d, 'worktree', 'add', '-q', '-b', 'modulo/x--03', '.claude/worktrees/modulo--x--03', 'modulo/x');
    // El encargo 03 lo commitea el director después de crear la rama del obrero: está en modulo/x, no en el disco del obrero.
    commit(path.join(d, '.claude/worktrees/modulo--x'), { 'docs/modulos/x/bitacora/2026-10-02-encargo-03.md': '# encargo 03\n' }, 'encargo 03');
    g(d, 'worktree', 'add', '-q', '-b', 'worktree-a', '.claude/worktrees/a', 'main');
    escribir(path.join(d, '.claude/worktrees/a'), 'docs/SESSION_HANDOFF.md', handoff('DISCOA'));
    cache = {
      d,
      dir: path.join(d, '.claude/worktrees/modulo--x'),
      obr: path.join(d, '.claude/worktrees/modulo--x--01'),
      obr2: path.join(d, '.claude/worktrees/modulo--x--02'),
      obr3: path.join(d, '.claude/worktrees/modulo--x--03'),
      a: path.join(d, '.claude/worktrees/a'),
    };
    return cache;
  };
})();
const renglonesHandoff = (m) => handoff(m).split('\n').filter((l) => l.includes(m));

test('criterio 4: director → cabecera de su ficha y el handoff de la rama por defecto (no el de su worktree)', () => {
  const { dir } = pest();
  const r = armar(dir);
  assert.ok(r.texto.includes('=== ficha del módulo x (docs/modulos/x/README.md) ==='));
  assert.ok(r.texto.includes('FICHA-x'));
  assert.ok(r.texto.includes('=== handoff (git show main:docs/SESSION_HANDOFF.md) ==='));
  assert.ok(r.texto.includes('MAIN-correr el smoke'));
  for (const l of renglonesHandoff('DIRWT')) assert.ok(!r.texto.includes(l), `no debería estar: ${l}`);
  // El commit del handoff en la cabecera es el de main, no el de la rama del worktree.
  const { d } = pest();
  const shaMain = g(d, 'log', '-1', '--format=%h', 'main', '--', 'docs/SESSION_HANDOFF.md');
  assert.ok(lineas(r.texto)[0].includes(` · modulo/x · `) && lineas(r.texto)[0].includes(`handoff: ${shaMain} `), lineas(r.texto)[0]);
  chequearHuella(r);
});

test('edades: entre todas no pasan de 100 caracteres', () => {
  const d = repo();
  commit(d, { '.gitignore': '/.claude/worktrees/\n', 'docs/SESSION_HANDOFF.md': handoff('MAIN'), 'docs/TODO.md': TODO_CHICO }, 'base', T0);
  g(d, 'switch', '-q', '-c', 'modulo/w');
  commit(d, { 'docs/modulos/w/README.md': fichaModulo('w', 'EN OBRA', { rama: 'modulo/w' }) }, 'ficha', T0);
  commit(d, { 'src/w.js': 'w\n' }, 'código', T1);
  g(d, 'switch', '-q', 'main');
  commit(d, { 'src/m.js': 'm\n' }, 'código en main', T1);
  g(d, 'worktree', 'add', '-q', '.claude/worktrees/modulo--w', 'modulo/w');
  const wt = path.join(d, '.claude/worktrees/modulo--w');
  // A 5 días entran las tres (ficha, Estado y Próximo paso)…
  let r = armar(wt);
  assert.equal((r.texto.match(/\(hace 5 días · estado viejo\)/g) || []).length, 4); // + el renglón de módulos activos (va en sus 300)
  // …a cientos de miles de días, la tercera ya no entra en los 100.
  r = armar(wt, { ahora: new Date('2800-01-01T00:00:00Z') });
  const fuera = lineas(r.texto).filter((l) => !l.includes(' · próximo: '));
  const pegadas = fuera.join('\n').match(/ \(hace \d+ días · estado viejo\)/g) || [];
  assert.equal(pegadas.length, 2);
  assert.ok(pegadas.join('').length <= 100);
});

test('git: el bloque no pasa de 800 (los renglones de estado que sobran se dicen)', () => {
  const d = repo();
  commit(d, { 'docs/SESSION_HANDOFF.md': handoff('H') });
  for (let i = 0; i < 10; i++) escribir(d, `${String(i).padStart(2, '0')}-${'n'.repeat(90)}.txt`, 'x');
  const r = armar(d);
  const l = lineas(r.texto);
  const ini = l.indexOf('=== git ===');
  const bloque = l.slice(ini + 1, l.indexOf('', ini));
  assert.ok(bloque.join('\n').length <= 800, `${bloque.join('\n').length}`);
  assert.match(bloque[bloque.length - 1], /^… y \d+ más: corré git status$/);
});

test('BOM y fines de línea CRLF: el handoff se lee igual', () => {
  const d = repo();
  commit(d, { 'docs/SESSION_HANDOFF.md': String.fromCharCode(0xfeff) + handoff('H').replace(/\n/g, '\r\n') });
  const r = armar(d);
  assert.ok(lineas(r.texto).includes('# Handoff — H-proyecto'));
  assert.ok(lineas(r.texto).includes('## Estado (hace 5 días)'));
  assert.ok(!r.texto.includes('\r'));
});

test('criterio 4: obrero → ruta del encargo y cabecera de modulo/x, ningún renglón del handoff', () => {
  const { obr } = pest();
  const r = armar(obr);
  assert.ok(r.texto.includes('=== ficha del módulo x (git show modulo/x:docs/modulos/x/README.md) ==='));
  assert.ok(r.texto.includes('FICHA-x'));
  assert.ok(r.texto.includes('encargo 01: docs/modulos/x/bitacora/2026-10-01-encargo-01.md'));
  for (const m of ['MAIN', 'DIRWT']) for (const l of renglonesHandoff(m)) assert.ok(!r.texto.includes(l), `no debería estar: ${l}`);
  assert.ok(!r.texto.includes('=== handoff'));
  assert.ok(!/handoff: [0-9a-f]/.test(r.texto));
  chequearHuella(r);
});

test('criterio 4: obrero cuyo encargo no está → lo dice', () => {
  const { obr2 } = pest();
  const r = armar(obr2);
  assert.ok(r.texto.includes('encargo 02: no está en docs/modulos/x/bitacora/'));
  for (const l of renglonesHandoff('MAIN')) assert.ok(!r.texto.includes(l));
});

test('criterio 4: obrero cuyo encargo llegó a modulo/x después de su rama → lo encuentra en la rama', () => {
  const { obr3 } = pest();
  assert.ok(!fs.existsSync(path.join(obr3, 'docs/modulos/x/bitacora/2026-10-02-encargo-03.md')));
  const r = armar(obr3);
  assert.ok(r.texto.includes('encargo 03: docs/modulos/x/bitacora/2026-10-02-encargo-03.md'));
});

test('criterio 4: el obrero lee la ficha de modulo/x por git, no la del disco de su worktree', () => {
  const { obr } = pest();
  const archivo = path.join(obr, 'docs/modulos/x/README.md');
  const orig = fs.readFileSync(archivo, 'utf8');
  fs.writeFileSync(archivo, fichaModulo('x', 'EN OBRA', { extra: 'DISCO-DEL-OBRERO' }));
  try {
    const r = armar(obr);
    assert.ok(!r.texto.includes('DISCO-DEL-OBRERO'));
    assert.ok(r.texto.includes('FICHA-x'));
  } finally {
    fs.writeFileSync(archivo, orig);
  }
});

test('criterio 4: main y worktree-a → el handoff del disco', () => {
  const { d, a } = pest();
  const rm = armar(d);
  assert.ok(rm.texto.includes('=== handoff (docs/SESSION_HANDOFF.md) ==='));
  assert.ok(rm.texto.includes('MAIN-correr el smoke'));
  assert.ok(!rm.texto.includes('=== ficha del módulo'));
  const ra = armar(a);
  assert.ok(ra.texto.includes('DISCOA-correr el smoke'));
  assert.ok(!ra.texto.includes('MAIN-correr el smoke'));
  assert.ok(ra.texto.includes('(sin commitear)'));
  chequearHuella(ra);
});

// ---------------------------------------------------------------- criterio 5: edad y "estado viejo"

test('criterio 5: edad al lado de Estado y Próximo paso; commit de código después → estado viejo', () => {
  const d = repo();
  commit(d, { 'docs/SESSION_HANDOFF.md': handoff('H'), 'docs/TODO.md': TODO_CHICO }, 'handoff', T0);
  let r = armar(d);
  assert.ok(lineas(r.texto).includes('## Estado (hace 5 días)'));
  assert.ok(lineas(r.texto).includes('## Próximo paso (hace 5 días)'));
  assert.ok(!r.texto.includes('estado viejo'));
  commit(d, { 'src/app.js': 'x\n' }, 'código', T1);
  r = armar(d);
  assert.ok(lineas(r.texto).includes('## Estado (hace 5 días · estado viejo)'));
  assert.ok(lineas(r.texto).includes('## Próximo paso (hace 5 días · estado viejo)'));
});

test('edad: un blame que pasa su tope de tiempo → "(edad: sin datos)", y el resto sigue', () => {
  const d = repo();
  commit(d, { 'docs/SESSION_HANDOFF.md': handoff('H'), 'docs/TODO.md': TODO_CHICO });
  assert.equal(iny.TIEMPO_BLAME, 2000);
  const r = armar(d, { tiempoBlame: 1 });
  assert.ok(lineas(r.texto).includes('## Estado (edad: sin datos)'));
  assert.ok(r.texto.includes('H-correr el smoke'));
  chequearHuella(r);
});

test('criterio 5: un commit en docs/ después no marca estado viejo', () => {
  const d = repo();
  commit(d, { 'docs/SESSION_HANDOFF.md': handoff('H'), 'docs/TODO.md': TODO_CHICO }, 'handoff', T0);
  commit(d, { 'docs/TODO.md': TODO_CHICO + '- [ ] otro\n', 'docs/referencia/trampas.md': 'x\n' }, 'docs', T1);
  const r = armar(d);
  assert.ok(lineas(r.texto).includes('## Estado (hace 5 días)'));
  assert.ok(!r.texto.includes('estado viejo'));
});

test('criterio 5: la edad es la del renglón más nuevo de la sección; sin commitear lo dice; 1 día en singular', () => {
  const d = repo();
  commit(d, { 'docs/SESSION_HANDOFF.md': handoff('H'), 'docs/TODO.md': TODO_CHICO }, 'handoff', T0);
  commit(d, { 'docs/SESSION_HANDOFF.md': handoff('H').replace('H-correr el smoke', 'H-otro paso') }, 'próximo', T1);
  let r = armar(d);
  assert.ok(lineas(r.texto).includes('## Estado (hace 5 días)'));
  assert.ok(lineas(r.texto).includes('## Próximo paso (hace 3 días)'));
  r = armar(d, { ahora: new Date('2026-10-04T13:00:00-03:00') });
  assert.ok(lineas(r.texto).includes('## Próximo paso (hace 1 día)'), r.texto.split('\n').filter((l) => l.startsWith('## ')).join(' | '));
  escribir(d, 'docs/SESSION_HANDOFF.md', handoff('H').replace('- Producción: no hay H', '- Producción: andando').replace('H-correr el smoke', 'H-otro paso'));
  r = armar(d);
  assert.ok(lineas(r.texto).includes('## Estado (sin commitear)'));
  assert.ok(lineas(r.texto).includes('## Próximo paso (hace 3 días)'));
});

test('criterio 5: "estado viejo" en la ficha del director y en los módulos activos, por la rama del módulo', () => {
  const d = repo();
  commit(d, { '.gitignore': '/.claude/worktrees/\n', 'docs/SESSION_HANDOFF.md': handoff('MAIN'), 'docs/TODO.md': TODO_CHICO }, 'base', T0);
  g(d, 'switch', '-q', '-c', 'modulo/y');
  commit(d, { 'docs/modulos/y/README.md': fichaModulo('y', 'EN OBRA', { rama: 'modulo/y' }) }, 'ficha', T0);
  let r = armar(d);
  assert.ok(lineas(r.texto).includes('Estado: EN OBRA (hace 5 días)'));
  assert.ok(r.texto.includes('y · EN OBRA (hace 5 días) · próximo: PROX-y'));
  commit(d, { 'src/y.js': 'y\n' }, 'código del módulo', T1);
  r = armar(d);
  assert.ok(lineas(r.texto).includes('Estado: EN OBRA (hace 5 días · estado viejo)'));
  assert.ok(r.texto.includes('y · EN OBRA (hace 5 días · estado viejo) · próximo: PROX-y'));
  // Un módulo sin rama: no hay "estado viejo" (Cruces 12).
  commit(d, { 'docs/modulos/z/README.md': fichaModulo('z', 'PAUSADO') }, 'z', T0);
  commit(d, { 'src/z.js': 'z\n' }, 'código', T1);
  r = armar(d);
  assert.ok(r.texto.includes('z · PAUSADO (hace 5 días) · próximo: PROX-z'));
});

// ---------------------------------------------------------------- 6: módulos activos

test('módulos activos: EN OBRA y PAUSADO sí, COMPLETO no; por git show de su rama si la tiene', () => {
  const d = repo();
  commit(d, {
    'docs/SESSION_HANDOFF.md': handoff('H'),
    'docs/TODO.md': TODO_CHICO,
    'docs/modulos/a/README.md': fichaModulo('a', 'EN OBRA'),
    'docs/modulos/b/README.md': fichaModulo('b', 'PAUSADO'),
    'docs/modulos/c/README.md': fichaModulo('c', 'COMPLETO'),
    'docs/modulos/sin-ficha/nota.md': 'x',
  });
  // d: en el disco dice COMPLETO, pero su rama dice EN OBRA → manda la rama.
  g(d, 'switch', '-q', '-c', 'modulo/d');
  commit(d, { 'docs/modulos/d/README.md': fichaModulo('d', 'EN OBRA', { rama: 'modulo/d', proximo: 'DE-LA-RAMA' }) });
  g(d, 'switch', '-q', 'main');
  escribir(d, 'docs/modulos/d/README.md', fichaModulo('d', 'COMPLETO', { rama: 'modulo/d' }));
  const r = armar(d);
  assert.ok(r.texto.includes('=== módulos activos ==='));
  assert.ok(r.texto.includes('a · EN OBRA (hace 5 días) · próximo: PROX-a'));
  assert.ok(r.texto.includes('b · PAUSADO (hace 5 días) · próximo: PROX-b'));
  assert.ok(!r.texto.includes('c · COMPLETO'));
  assert.ok(r.texto.includes('d · EN OBRA (hace 5 días) · próximo: DE-LA-RAMA'));
});

test('módulos activos: más de 300 → cortado en renglón, dicho y CORTADO arriba', () => {
  const d = repo();
  const archivos = { 'docs/SESSION_HANDOFF.md': handoff('H'), 'docs/TODO.md': TODO_CHICO };
  for (let i = 0; i < 9; i++) archivos[`docs/modulos/m${i}/README.md`] = fichaModulo(`m${i}`, 'EN OBRA', { proximo: 'un paso bastante largo para llenar' });
  commit(d, archivos);
  const r = armar(d);
  const l = lineas(r.texto);
  const ini = l.indexOf('=== módulos activos ===');
  const fin = l.indexOf('', ini);
  const bloque = l.slice(ini + 1, fin);
  assert.ok(bloque.join('\n').length <= 300);
  assert.match(bloque[bloque.length - 1], /^… \(\d+ más en docs\/modulos\/\)$/);
  assert.ok(r.cortes.some((c) => c.que === 'los módulos activos'));
  assert.ok(l[0].startsWith('CORTADO: los módulos activos'));
});

test('sin módulos activos: el bloque no aparece', () => {
  const d = repo();
  commit(d, { 'docs/SESSION_HANDOFF.md': handoff('H'), 'docs/TODO.md': TODO_CHICO, 'docs/modulos/c/README.md': fichaModulo('c', 'COMPLETO') });
  assert.ok(!armar(d).texto.includes('=== módulos activos'));
});

// ---------------------------------------------------------------- 7: el TODO

test('TODO: solo 🔴 y 🟠; si no entra en 1.500, cortado en ítem entero y CORTADO arriba', () => {
  const d = repo();
  commit(d, { 'docs/SESSION_HANDOFF.md': handoff('H'), 'docs/TODO.md': TODO_CHICO });
  let r = armar(d);
  assert.ok(r.texto.includes('ROJO-1') && r.texto.includes('NARANJA-1'));
  assert.ok(!r.texto.includes('AMARILLO-1'));
  const muchos = `# TODO\n\n## ${EMOJI.rojo} Crítico\n` + Array.from({ length: 60 }, (_, i) => `- [ ] rojo número ${i} con bastante texto para pesar`).join('\n') + '\n';
  commit(d, { 'docs/TODO.md': muchos });
  r = armar(d);
  assert.ok(lineas(r.texto)[0].startsWith('CORTADO: el TODO — leé el resto en docs/TODO.md'));
  assert.ok(r.texto.includes('rojo número 0 con'));
  assert.ok(!r.texto.includes('rojo número 59 con'));
  assert.match(r.texto, /… \(\d+ más en docs\/TODO\.md\)/);
  chequearHuella(r);
});

test('TODO vacío o ausente: lo dice', () => {
  const d = repo();
  commit(d, { 'docs/SESSION_HANDOFF.md': handoff('H'), 'docs/TODO.md': '# TODO\n' });
  assert.ok(armar(d).texto.includes(`nada abierto en ${EMOJI.rojo} ni ${EMOJI.naranja}`));
  fs.rmSync(path.join(d, 'docs/TODO.md'));
  assert.ok(armar(d).texto.includes('no hay docs/TODO.md'));
});

// ---------------------------------------------------------------- 8: git

test('git: 5 commits, estado hasta 10 renglones con "y N más"', () => {
  const d = repo();
  commit(d, { 'docs/SESSION_HANDOFF.md': handoff('H') }, 'commit-0');
  for (let i = 1; i <= 6; i++) commit(d, { [`src/${i}.js`]: `${i}\n` }, `commit-${i}`);
  for (let i = 0; i < 13; i++) escribir(d, `suelto-${String(i).padStart(2, '0')}.txt`, 'x');
  const r = armar(d);
  for (let i = 2; i <= 6; i++) assert.ok(r.texto.includes(` commit-${i}`), `commit-${i}`);
  assert.ok(!r.texto.includes(' commit-1\n'));
  assert.ok(r.texto.includes('?? suelto-09.txt'));
  assert.ok(!r.texto.includes('?? suelto-10.txt'));
  assert.ok(r.texto.includes('… y 3 más: corré git status'));
  // git status no es un documento: no es CORTADO.
  assert.ok(!r.texto.startsWith('CORTADO'));
});

test('git: "origin tiene un handoff más nuevo (N commits): hacé pull", sin fetch', () => {
  const bare = carpeta('remoto');
  g(bare, 'init', '-q', '--bare', '-b', 'main');
  const a = repo();
  commit(a, { 'docs/SESSION_HANDOFF.md': handoff('H'), 'docs/TODO.md': TODO_CHICO });
  g(a, 'remote', 'add', 'origin', bare);
  g(a, 'push', '-q', '-u', 'origin', 'main');
  const b = carpeta('clon');
  g(b, 'clone', '-q', bare, '.');
  commit(b, { 'docs/SESSION_HANDOFF.md': handoff('NUEVO') }, 'handoff nuevo');
  commit(b, { 'src/x.js': 'x' }, 'código');
  g(b, 'push', '-q', 'origin', 'main');
  assert.ok(!armar(a).texto.includes('origin tiene un handoff más nuevo'));
  g(a, 'fetch', '-q', 'origin');
  const r = armar(a);
  assert.ok(r.texto.includes('origin tiene un handoff más nuevo (2 commits): hacé pull'));
  // Solo código nuevo en origin: no avisa.
  const c = carpeta('clon');
  g(c, 'clone', '-q', bare, '.');
  commit(c, { 'src/y.js': 'y' }, 'más código');
  g(c, 'push', '-q', 'origin', 'main');
  g(a, 'pull', '-q', 'origin', 'main');
  g(a, 'fetch', '-q', 'origin');
  assert.ok(!armar(a).texto.includes('origin tiene un handoff más nuevo'));
});

// ---------------------------------------------------------------- 2: la cabecera

test('cabecera: proyecto de la ficha, rama, kit, nivel, modo y handoff con commit y fecha', () => {
  const d = repo();
  commit(d, { '.claude/kit.md': fichaKit({ proyecto: 'mi-app', nivel: 'estandar' }), 'docs/SESSION_HANDOFF.md': handoff('H') });
  const sha = g(d, 'log', '-1', '--format=%h');
  const r = armar(d, { entrada: { permission_mode: 'auto' } });
  assert.equal(lineas(r.texto)[0], `mi-app · main · kit 2.4.3 · nivel estandar · modo auto · handoff: ${sha} 2026-10-01 12:00`);
  assert.ok(lineas(r.texto)[0].length <= 250);
});

test('cabecera: el modo sin permission_mode sale del defaultMode "(configurado)"; sin nada, default', () => {
  const d = repo();
  commit(d, { 'docs/SESSION_HANDOFF.md': handoff('H') });
  assert.ok(lineas(armar(d).texto)[0].includes(' · modo default (configurado) · '));
  escribir(d, '.claude/settings.json', JSON.stringify({ permissions: { defaultMode: 'acceptEdits' } }));
  assert.ok(lineas(armar(d).texto)[0].includes(' · modo acceptEdits (configurado) · '));
  escribir(d, '.claude/settings.local.json', JSON.stringify({ permissions: { defaultMode: 'plan' } }));
  assert.ok(lineas(armar(d).texto)[0].includes(' · modo plan (configurado) · '));
  const home = carpeta('home');
  escribir(home, '.claude/settings.json', JSON.stringify({ permissions: { defaultMode: 'dontAsk' } }));
  const d2 = repo();
  commit(d2, { 'docs/SESSION_HANDOFF.md': handoff('H') });
  assert.ok(lineas(armar(d2, { home }).texto)[0].includes(' · modo dontAsk (configurado) · '));
  escribir(d2, '.claude/settings.json', '{ roto');
  assert.ok(lineas(armar(d2, { home }).texto)[0].includes(' · modo dontAsk (configurado) · '));
});

test('cabecera: nombres larguísimos no pasan de 250', () => {
  const d = repo('rama-' + 'x'.repeat(120));
  commit(d, { '.claude/kit.md': fichaKit({ proyecto: 'p'.repeat(200) }), 'docs/SESSION_HANDOFF.md': handoff('H') });
  const c = lineas(armar(d, { entrada: { permission_mode: 'm'.repeat(200) } }).texto)[0];
  assert.ok(c.length <= 250, `${c.length}`);
});

// ---------------------------------------------------------------- criterio 6: las fallas

test('criterio 6: ficha rota → "ficha rota: <archivo>:<línea> — corré doctor" y el resto', () => {
  const d = repo();
  commit(d, { '.claude/kit.md': FICHA_ROTA, 'docs/SESSION_HANDOFF.md': handoff('H'), 'docs/TODO.md': TODO_CHICO });
  const r = armar(d);
  assert.equal(lineas(r.texto)[1], 'ficha rota: .claude/kit.md:7 — corré doctor');
  assert.ok(r.texto.includes('H-correr el smoke'));
  assert.ok(r.texto.includes('ROJO-1'));
  assert.ok(r.texto.includes('=== git ==='));
  chequearHuella(r);
});

test('criterio 6: sin remoto ni ficha → entero y "valen los frenos de fábrica"', () => {
  const d = repo();
  commit(d, { 'docs/SESSION_HANDOFF.md': handoff('H'), 'docs/TODO.md': TODO_CHICO });
  const r = armar(d);
  assert.equal(lineas(r.texto)[1], 'sin ficha: valen los frenos de fábrica');
  for (const t of ['H-correr el smoke', 'ROJO-1', '=== git ===', iny.RECORDATORIO]) assert.ok(r.texto.includes(t), t);
  chequearHuella(r);
});

test('criterio 6: una ficha sin commitear no existe todavía (regla de 4.7)', () => {
  const d = repo();
  commit(d, { 'docs/SESSION_HANDOFF.md': handoff('H') });
  escribir(d, '.claude/kit.md', fichaKit({ proyecto: 'del-disco' }));
  const r = armar(d);
  assert.ok(!r.texto.includes('del-disco'));
  assert.ok(r.texto.includes('sin ficha: valen los frenos de fábrica'));
});

test('criterio 6: sin git → lo dice, el handoff del disco y la huella', () => {
  const d = carpeta('sin-git');
  escribir(d, 'docs/SESSION_HANDOFF.md', handoff('H'));
  const r = armar(d);
  assert.ok(r.texto.includes('sin git: esta carpeta no es un repo'));
  assert.ok(r.texto.includes('H-correr el smoke'));
  assert.ok(!r.texto.includes('(hace '));
  assert.ok(!r.texto.includes('=== git ==='));
  chequearHuella(r);
});

test('un repo sin commits: no explota', () => {
  const d = repo();
  escribir(d, 'docs/SESSION_HANDOFF.md', handoff('H'));
  const r = armar(d);
  assert.ok(r.texto.includes('sin commits todavía'));
  assert.ok(r.texto.includes('handoff: sin commit'));
  chequearHuella(r);
});

test('no hay handoff: lo dice', () => {
  const d = repo();
  commit(d, { 'README.md': 'x' });
  assert.ok(armar(d).texto.includes('no hay docs/SESSION_HANDOFF.md'));
});

// ---------------------------------------------------------------- criterio 7: la versión del kit

test('criterio 7: VERSION de la PC mayor, menor, igual o ausente', () => {
  const d = repo();
  commit(d, { '.claude/kit.md': fichaKit({ kit: '2.4.3' }), 'docs/SESSION_HANDOFF.md': handoff('H') });
  const conVersion = (v) => {
    const home = carpeta('home');
    if (v !== null) escribir(home, '.claude/VERSION', v);
    return lineas(armar(d, { home }).texto)[0];
  };
  assert.ok(conVersion('2.5.0\n').includes(' · kit 2.4.3 · hay kit nuevo: 2.5.0 · '));
  assert.ok(conVersion('2.4.10').includes(' · kit 2.4.3 · hay kit nuevo: 2.4.10 · '));
  assert.ok(conVersion('2.4.0').includes(' · kit 2.4.3 · esta PC está atrás: actualizate · '));
  for (const v of ['2.4.3', null, 'basura']) {
    const c = conVersion(v);
    assert.ok(c.includes(' · kit 2.4.3 · nivel '), c);
    assert.ok(!c.includes('hay kit nuevo') && !c.includes('está atrás'));
  }
  // Sin home: no compara.
  assert.ok(lineas(armar(d).texto)[0].includes(' · kit 2.4.3 · nivel '));
});

// ---------------------------------------------------------------- 10: lo propio

test('lo propio: va después del recordatorio, con lo que sobre, antes de la huella', () => {
  const d = repo();
  commit(d, { 'docs/SESSION_HANDOFF.md': handoff('H') });
  const r = armar(d, { propio: { salida: 'PROPIO-1\nPROPIO-2\n', falla: null } });
  const l = lineas(r.texto);
  assert.equal(l[l.length - 2], 'PROPIO-2');
  assert.ok(l.indexOf('PROPIO-1') > l.indexOf(iny.RECORDATORIO));
  assert.ok(!r.texto.startsWith('CORTADO'));
  chequearHuella(r);
});

test('lo propio: es lo primero que se recorta; con el handoff de 20 KB también, todo ≤ 9.700', () => {
  const d = repo();
  const largo = handoff('H', { extra: Array.from({ length: 400 }, (_, i) => `- relleno ${i} con bastante texto de más`).join('\n') });
  commit(d, { 'docs/SESSION_HANDOFF.md': largo, 'docs/TODO.md': TODO_CHICO });
  const propio = { salida: Array.from({ length: 1000 }, (_, i) => `propio ${i} con algo de texto`).join('\n'), falla: null };
  const r = armar(d, { propio });
  const l = lineas(r.texto);
  assert.equal(l[0], 'CORTADO: el handoff, lo propio — leé el resto en docs/SESSION_HANDOFF.md, .claude/hooks/session-start.propio.sh antes de confiar en lo de abajo');
  assert.ok(r.texto.includes('propio 0 con'));
  assert.ok(!r.texto.includes('propio 999 con'));
  assert.equal(l[l.length - 2], '… (CORTADO: lo propio sigue en .claude/hooks/session-start.propio.sh)');
  assert.ok(r.texto.includes('H-correr el smoke') && r.texto.includes('ROJO-1'));
  chequearHuella(r);
  assert.ok(r.texto.length > 9500, `aprovecha lo que sobra: ${r.texto.length}`);
});

test('lo propio: sin bash lo dice; con otra falla también; vacío no aparece', () => {
  const d = repo();
  commit(d, { 'docs/SESSION_HANDOFF.md': handoff('H') });
  assert.ok(armar(d, { propio: { salida: '', falla: 'sin-bash' } }).texto.includes('.claude/hooks/session-start.propio.sh: no hay bash en esta PC para correrlo'));
  assert.ok(armar(d, { propio: { salida: 'algo', falla: 'tiempo' } }).texto.includes('session-start.propio.sh: no terminó a tiempo'));
  assert.ok(armar(d, { propio: { salida: '', falla: 'salió con 3' } }).texto.includes('session-start.propio.sh: salió con 3'));
  assert.ok(!armar(d, { propio: { salida: '\n', falla: null } }).texto.includes('=== lo propio'));
  assert.ok(!armar(d, { propio: null }).texto.includes('=== lo propio'));
});

test('la entrada puede venir como texto JSON, y el cwd sale de ella', () => {
  const d = repo();
  commit(d, { 'docs/SESSION_HANDOFF.md': handoff('H') });
  const r = iny.armar({ entrada: JSON.stringify({ cwd: d, permission_mode: 'plan' }), ahora: AHORA });
  assert.ok(lineas(r.texto)[0].includes(' · modo plan · '));
  assert.ok(r.texto.includes('H-correr el smoke'));
});

// ---------------------------------------------------------------- el plazo del hook (E4b)

const git = require('./git.cjs');
// dejarCorrer(n): un reloj de mentira que avanza 100 s por consulta a git, con el plazo justo para que corran las primeras n
// (con su tope de siempre: les quedan ≥ 50 s) y se saltee el resto. No depende de la velocidad de la PC.
function dejarCorrer(n) {
  let t = 0;
  git.fijarPlazo((n - 1) * 100000 + 50000, () => {
    const v = t;
    t += 100000;
    return v;
  });
}
// Corre fn con el plazo de dejarCorrer(n) y lo saca al final (pase lo que pase).
function conPlazo(n, fn) {
  dejarCorrer(n);
  try {
    return fn();
  } finally {
    git.fijarPlazo(null);
  }
}
const penultima = (t) => lineas(t)[lineas(t).length - 2];

test('lineaLento: singular y plural', () => {
  assert.equal(iny.lineaLento(1), 'arranque lento: 1 consulta a git salteada por tiempo (corré doctor si se repite)');
  assert.equal(iny.lineaLento(7), 'arranque lento: 7 consultas a git salteadas por tiempo (corré doctor si se repite)');
  assert.equal(iny.LENTO_MAX, iny.lineaLento(9999).length + 1);
});

test('sin plazo: ningún renglón de arranque lento; lo propio puede venir como función y se llama una vez', () => {
  const d = repo();
  commit(d, { 'docs/SESSION_HANDOFF.md': handoff('H') });
  let llamadas = 0;
  const r = armar(d, {
    propio: () => {
      llamadas++;
      return { salida: 'PROPIO-F\n', falla: null };
    },
  });
  assert.equal(llamadas, 1);
  assert.equal(penultima(r.texto), 'PROPIO-F');
  assert.ok(!r.texto.includes('arranque lento'));
  assert.ok(!r.texto.includes('no respondió a tiempo'));
  chequearHuella(r);
});

test('plazo vencido: ningún git; no dice "sin git", el handoff del disco (desde una subcarpeta), el renglón lento y la huella', () => {
  const d = repo();
  commit(d, { 'docs/SESSION_HANDOFF.md': handoff('H'), 'docs/TODO.md': TODO_CHICO });
  const r = conPlazo(0, () => {
    const res = armar(path.join(d, 'docs'));
    assert.equal(penultima(res.texto), iny.lineaLento(git.salteadasPorPlazo()));
    return res;
  });
  const l = lineas(r.texto);
  assert.ok(l[0].includes(' · (rama sin leer) · '), l[0]);
  assert.equal(l[1], iny.GIT_SIN_TIEMPO);
  assert.ok(!r.texto.includes('sin git:'));
  assert.ok(r.texto.includes('=== handoff (docs/SESSION_HANDOFF.md) ==='));
  assert.ok(r.texto.includes('H-correr el smoke'));
  assert.ok(r.texto.includes('ROJO-1'));
  assert.ok(!r.texto.includes('=== git ==='));
  assert.match(penultima(r.texto), /^arranque lento: 1 consulta a git salteada por tiempo/);
  chequearHuella(r);
});

test('plazo que vence a mitad (plana): edades sin datos, ni "sin ficha" ni "sin commits" ni "handoff: sin commit"', () => {
  const d = repo();
  commit(d, { 'docs/SESSION_HANDOFF.md': handoff('H'), 'docs/TODO.md': TODO_CHICO });
  let n;
  const r = conPlazo(2, () => {
    const res = armar(d); // corren raíz y rama; la ficha, las edades y el bloque git, no
    n = git.salteadasPorPlazo();
    return res;
  });
  const l = lineas(r.texto);
  assert.ok(n >= 3, `salteadas: ${n}`);
  assert.ok(l[0].includes(' · main · '), l[0]);
  assert.ok(!l[0].includes('handoff:'), l[0]);
  assert.equal(l[1], iny.FICHA_SIN_TIEMPO);
  assert.ok(!r.texto.includes(iny.SIN_FICHA));
  assert.ok(l.includes('## Estado (edad: sin datos)'));
  assert.ok(l.includes('## Próximo paso (edad: sin datos)'));
  assert.ok(r.texto.includes('H-correr el smoke'));
  assert.equal(l[l.indexOf('=== git ===') + 1], iny.BLOQUE_SIN_TIEMPO);
  assert.ok(!r.texto.includes('sin commits todavía'));
  assert.equal(penultima(r.texto), iny.lineaLento(n));
  chequearHuella(r);
});

test('plazo con lugar de sobra: igual que sin plazo (ni una consulta salteada)', () => {
  const d = repo();
  commit(d, { 'docs/SESSION_HANDOFF.md': handoff('H'), 'docs/TODO.md': TODO_CHICO });
  const sin = armar(d).texto;
  const con = conPlazo(1000, () => armar(d).texto);
  assert.equal(con, sin);
});

test('plazo: el director sin tiempo para la rama por defecto lee el handoff del disco, y lo dice en el título', () => {
  const { dir } = pest();
  const r = conPlazo(2, () => armar(dir));
  assert.ok(r.texto.includes('=== handoff (docs/SESSION_HANDOFF.md) — el del disco: git no respondió a tiempo ==='));
  assert.ok(r.texto.includes('DIRWT-correr el smoke'));
  assert.ok(!r.texto.includes('no hay docs/SESSION_HANDOFF.md'));
  assert.ok(r.texto.includes('FICHA-x'));
  chequearHuella(r);
});

test('plazo: el obrero sin tiempo para leer modulo/x lo dice (no "no hay"), y el encargo del disco sigue', () => {
  const { obr } = pest();
  const r = conPlazo(2, () => armar(obr));
  assert.ok(r.texto.includes('git no respondió a tiempo: no se pudo leer docs/modulos/x/README.md de modulo/x'));
  assert.ok(!r.texto.includes('no hay docs/modulos/x/README.md'));
  assert.ok(r.texto.includes('encargo 01: docs/modulos/x/bitacora/2026-10-01-encargo-01.md'));
  chequearHuella(r);
});

test('plazo: el obrero cuyo encargo solo está en modulo/x, sin tiempo para buscarlo, no oye "pedíselo al director"', () => {
  const { obr3 } = pest();
  const r = conPlazo(2, () => armar(obr3));
  assert.ok(r.texto.includes('encargo 03: git no respondió a tiempo para buscarlo en modulo/x'));
  assert.ok(!r.texto.includes('pedíselo al director'));
});

test('plazo: el renglón lento tiene su lugar reservado — lo propio se corta antes, nada más ("el final" no se toca)', () => {
  const d = repo();
  const largo = handoff('H', { extra: Array.from({ length: 400 }, (_, i) => `- relleno ${i} con bastante texto de más`).join('\n') });
  commit(d, { 'docs/SESSION_HANDOFF.md': largo, 'docs/TODO.md': TODO_CHICO });
  const propio = { salida: Array.from({ length: 1000 }, (_, i) => `propio ${i} con algo de texto`).join('\n'), falla: null };
  const r = conPlazo(0, () => armar(d, { propio }));
  const l = lineas(r.texto);
  assert.ok(!r.texto.includes('(CORTADO: el final)'));
  assert.equal(l[l.length - 3], '… (CORTADO: lo propio sigue en .claude/hooks/session-start.propio.sh)');
  assert.match(penultima(r.texto), /^arranque lento: /);
  chequearHuella(r);
});
