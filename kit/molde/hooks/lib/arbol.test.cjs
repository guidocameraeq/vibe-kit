'use strict';
// Pruebas de arbol.cjs. Corren con: node --test "kit/**/*.test.cjs"
// juzgarRuta no toca el disco: se prueba con rutas inventadas (POSIX y Windows), sin repos.
const test = require('node:test');
const assert = require('node:assert/strict');
const { SEIS, TRES, ID, juzgarRuta } = require('./arbol.cjs');

const R = '/r/app'; // una raíz POSIX
const W = 'C:\\Users\\x\\app'; // una raíz de Windows

const frena = (raiz, ruta, carpeta) => {
  const f = juzgarRuta(raiz, ruta);
  assert.ok(f, `tendría que frenar: ${ruta}`);
  assert.equal(f.id, 'candado:raiz');
  if (carpeta) assert.match(f.mensaje, /^`docs\/[^`]+\/` no va ahí: a `modulos\/<x>\/` o a `referencia\/`$/i, ruta);
  else assert.match(f.mensaje, /^`docs\/[^`/]+` no va ahí: a `modulos\/<x>\/` o a `referencia\/`$/i, ruta);
  return f;
};
const pasa = (raiz, ruta) => assert.equal(juzgarRuta(raiz, ruta), null, `tendría que pasar: ${ruta}`);

test('los seis y las tres, exactos (B §4)', () => {
  assert.deepEqual(SEIS, ['NORTE.md', 'MAPA.md', 'SESSION_HANDOFF.md', 'TODO.md', 'CHANGELOG.md', 'README.md']);
  assert.deepEqual(TRES, ['modulos', 'referencia', 'archive']);
  assert.equal(ID, 'candado:raiz');
});

test('pasan los seis en la raíz de docs/, absolutos y relativos', () => {
  for (const a of SEIS) {
    pasa(R, `${R}/docs/${a}`);
    pasa(R, `docs/${a}`);
    pasa(W, `${W}\\docs\\${a}`);
  }
});

test('pasa todo lo de adentro de las tres carpetas, a cualquier profundidad y con cualquier extensión', () => {
  for (const r of ['docs/modulos/x/README.md', 'docs/modulos/x/bitacora/2026-10-28-encargo-01.md', 'docs/referencia/DECISIONS.md',
    'docs/archive/banner-viejo.png', 'docs/modulos/x/mockup.html', 'docs/referencia/relevamiento/TABLERO.md']) {
    pasa(R, r);
    pasa(R, `${R}/${r}`);
  }
});

test('lo de afuera de docs/ pasa (y lo de afuera del repo)', () => {
  for (const r of ['src/a.js', 'README.md', 'CLAUDE.md', '.claude/kit.md', 'docs', `${R}/docs`, 'otra/docs/notas.md', 'documentos/x.md',
    'docs.md', '/otro/repo/docs/notas.md', '../vecino/docs/notas.md', 'C:\\otro\\docs\\notas.md']) {
    pasa(R, r);
  }
});

test('frena un archivo suelto en la raíz de docs/ con el mensaje de B §7', () => {
  const f = frena(R, `${R}/docs/notas.md`);
  assert.equal(f.mensaje, '`docs/notas.md` no va ahí: a `modulos/<x>/` o a `referencia/`');
  assert.equal(f.ruta, 'docs/notas.md');
  for (const r of ['docs/DECISIONS.md', 'docs/SPEC-x.md', 'docs/modulos', 'docs/x.html', 'docs/.gitkeep']) frena(R, r);
});

test('frena una carpeta que no es de las tres', () => {
  const f = frena(R, `${R}/docs/specs/x.md`, true);
  assert.equal(f.mensaje, '`docs/specs/` no va ahí: a `modulos/<x>/` o a `referencia/`');
  assert.equal(f.ruta, 'docs/specs/x.md');
  for (const r of ['docs/superpowers/specs/a.md', 'docs/relevamiento/x/TABLERO.md', 'docs/modulo/x/README.md', 'docs/TODO.md/x']) frena(R, r, true);
});

test('rutas de Windows: barras invertidas, unidad, mezcla', () => {
  frena(W, `${W}\\docs\\notas.md`);
  frena(W, 'C:/Users/x/app/docs/notas.md');
  frena(W, 'docs\\notas.md');
  frena(W, `${W}\\docs\\specs\\a.md`, true);
  pasa(W, `${W}\\docs\\modulos\\x\\README.md`);
  pasa(W, `${W}\\src\\docs\\notas.md`);
  pasa(W, 'D:\\Users\\x\\app\\docs\\notas.md');
  frena('C:/Users/x/app', `${W}\\docs\\notas.md`);
});

test('sin distinguir mayúsculas (Docs/x.md, DOCS\\x.md, la unidad, la raíz)', () => {
  frena(R, 'Docs/x.md');
  frena(R, 'DOCS\\x.md');
  frena(R, `${R}/DoCs/x.md`);
  frena(R, '/R/APP/docs/x.md');
  frena(W, 'c:\\users\\X\\APP\\Docs\\x.md');
  frena(R, 'docs/Specs/x.md', true);
  pasa(R, 'docs/MODULOS/x/README.md');
  pasa(R, 'Docs/Referencia/a.md');
  pasa(R, 'docs/todo.md');
  pasa(R, 'DOCS/session_handoff.MD');
});

test('con .. y . resueltos antes de juzgar', () => {
  frena(R, 'docs/modulos/../notas.md');
  frena(R, 'docs/modulos/x/../../notas.md');
  frena(R, 'src/../docs/notas.md');
  frena(R, `${R}/src/../docs/x/../notas.md`);
  frena(R, 'docs/./notas.md');
  frena(R, './docs/notas.md');
  frena(W, `${W}\\docs\\modulos\\..\\notas.md`);
  frena(R, 'docs/referencia/../specs/a.md', true);
  pasa(R, 'docs/../src/x.md');
  pasa(R, 'docs/notas/../TODO.md');
  pasa(R, 'docs/../../afuera/docs/x.md');
});

test('Windows ignora puntos y espacios al final de un nombre: docs./x.md es docs/x.md', () => {
  frena(R, 'docs./notas.md');
  frena(R, 'docs /notas.md');
  frena(R, 'docs.. /notas.md');
  pasa(R, 'docs/TODO.md.');
  pasa(R, 'docs/modulos./x/README.md');
});

test('rutas de worktree: la raíz del worktree manda', () => {
  const P = '/r/app';
  const WT = '/r/app/.claude/worktrees/w1';
  // Sesión en el worktree
  frena(WT, `${WT}/docs/notas.md`);
  pasa(WT, `${WT}/docs/TODO.md`);
  pasa(WT, `${WT}/src/a.js`);
  // ...que escribe en el principal
  frena(WT, `${P}/docs/notas.md`);
  pasa(WT, `${P}/docs/modulos/x/README.md`);
  // Sesión en el principal que escribe adentro de un worktree
  frena(P, `${WT}/docs/notas.md`);
  frena(P, '.claude/worktrees/w1/docs/specs/a.md', true);
  frena(P, '.CLAUDE\\Worktrees\\w1\\Docs\\notas.md');
  pasa(P, `${WT}/docs/CHANGELOG.md`);
  pasa(P, '.claude/worktrees/w1/README.md');
  pasa(P, '.claude/otra/w1/docs/notas.md');
  pasa(P, '.claude/worktrees/docs/notas.md');
  // Windows
  frena('C:\\a\\.claude\\worktrees\\x--01', 'C:\\a\\.claude\\worktrees\\x--01\\docs\\notas.md');
  frena('C:\\a\\.claude\\worktrees\\x--01', 'C:\\a\\docs\\notas.md');
});

test('entradas raras: nada que juzgar', () => {
  assert.equal(juzgarRuta('', 'docs/x.md'), null);
  assert.equal(juzgarRuta(null, 'docs/x.md'), null);
  assert.equal(juzgarRuta(R, ''), null);
  assert.equal(juzgarRuta(R, '   '), null);
  assert.equal(juzgarRuta(R, undefined), null);
  assert.equal(juzgarRuta(R, 42), null);
});

// ---------------------------------------------------------------- 8r3 i1: la carpeta de papeles (carpeta-docs:)

test('8r3 i1: juzgarRuta con la carpeta configurada — el docs/ ajeno pasa y lo suelto en la carpeta frena; dos tramos; mayúsculas', () => {
  const c = 'arti-docs';
  for (const r of ['docs/notas.md', 'docs/specs/x.md', `${R}/docs/x.md`, 'arti-docs', 'arti-docs/TODO.md', 'arti-docs/modulos/x/README.md', 'otra/arti-docs/x.md', 'arti-docsx/a.md']) {
    assert.equal(juzgarRuta(R, r, c), null, r);
  }
  const f = juzgarRuta(R, `${R}/arti-docs/suelto.md`, c);
  assert.deepEqual(f, { id: ID, mensaje: '`arti-docs/suelto.md` no va ahí: a `modulos/<x>/` o a `referencia/`', ruta: 'arti-docs/suelto.md' });
  assert.equal(juzgarRuta(R, 'arti-docs/specs/x.md', c).mensaje, '`arti-docs/specs/` no va ahí: a `modulos/<x>/` o a `referencia/`');
  assert.equal(juzgarRuta(W, `${W}\\ARTI-DOCS.\\Suelto.md`, c).ruta, 'ARTI-DOCS/Suelto.md');
  // dos tramos: la raíz de los papeles es a/b
  assert.equal(juzgarRuta(R, 'a/suelto.md', 'a/b'), null);
  assert.equal(juzgarRuta(R, 'a/b/TODO.md', 'a/b'), null);
  assert.equal(juzgarRuta(R, 'a/b/modulos/x/y.md', 'a/b'), null);
  assert.equal(juzgarRuta(R, 'a/b/suelto.md', 'a/b').mensaje, '`a/b/suelto.md` no va ahí: a `modulos/<x>/` o a `referencia/`');
  assert.equal(juzgarRuta(R, 'a/b/otra/x.md', 'a/b').mensaje, '`a/b/otra/` no va ahí: a `modulos/<x>/` o a `referencia/`');
  // sin carpeta (o vacía), docs: como siempre
  assert.ok(juzgarRuta(R, 'docs/x.md', undefined));
  assert.ok(juzgarRuta(R, 'docs/x.md', ''));
});

test('8r3 i1: carpetaDelDisco — la clave de arriba del .claude/kit.md del disco; lo que no se acepta, null', () => {
  const fs = require('fs');
  const os = require('os');
  const path = require('path');
  const { carpetaDelDisco } = require('./arbol.cjs');
  const T = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-arbol-'));
  try {
    const con = (t) => {
      const d = fs.mkdtempSync(path.join(T, 'r'));
      if (t !== null) {
        fs.mkdirSync(path.join(d, '.claude'));
        fs.writeFileSync(path.join(d, '.claude', 'kit.md'), t);
      }
      return carpetaDelDisco(d);
    };
    const F = (l) => `---\nkit: 3.0.0-rc.4\nnivel: estandar\n${l}\n---\n`;
    assert.equal(con(F('carpeta-docs: arti-docs')), 'arti-docs');
    assert.equal(con(F('carpeta-docs: "a/b-c"   # los papeles')), 'a/b-c');
    assert.equal(con(F('carpeta-docs: arti-docs\r')), 'arti-docs');
    for (const malo of ['carpeta-docs: ../x', 'carpeta-docs: Docs', 'carpeta-docs: nul', '  carpeta-docs: arti-docs', 'carpeta-docs:', 'otra: arti-docs']) assert.equal(con(F(malo)), null, malo);
    assert.equal(con(null), null);
    assert.equal(carpetaDelDisco(''), null);
  } finally {
    fs.rmSync(T, { recursive: true, force: true });
  }
});
