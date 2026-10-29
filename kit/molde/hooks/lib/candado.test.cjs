'use strict';
// Pruebas de lib/candado.cjs (B §14; P6.1, D2.2 F4): casos sí/no de los ocho chequeos que no son barreras (esos, en
// barreras.test.cjs) y correr(): prendido/apagado, sin ficha, quitados con hasta:, parcial, ids, frenos.log y lecturas que no frena.
// Repos temporales sin la configuración de git de la PC. Corren con: node --test "kit/**/*.test.cjs".
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-candado-'));
const GLOBAL = path.join(TMP, 'gitconfig-vacio');
fs.writeFileSync(GLOBAL, '');
Object.assign(process.env, {
  GIT_CONFIG_GLOBAL: GLOBAL,
  GIT_CONFIG_NOSYSTEM: '1',
  XDG_CONFIG_HOME: TMP,
  GIT_AUTHOR_NAME: 'Prueba',
  GIT_AUTHOR_EMAIL: 'prueba@ejemplo.invalid',
  GIT_COMMITTER_NAME: 'Prueba',
  GIT_COMMITTER_EMAIL: 'prueba@ejemplo.invalid',
});
test.after(() => fs.rmSync(TMP, { recursive: true, force: true }));

const K = require('./candado.cjs');
const MOLDE = path.join(__dirname, '..', '..');
const HANDOFF = fs.readFileSync(path.join(MOLDE, 'docs', 'SESSION_HANDOFF.md'), 'utf8');

// ---------------------------------------------------------------- ayudantes

let n = 0;
function g(cwd, ...args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', env: process.env });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}
function escribir(d, rel, texto) {
  const p = path.join(d, ...rel.split('/'));
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, texto);
}
const leerArchivo = (d, rel) => fs.readFileSync(path.join(d, ...rel.split('/')), 'utf8');
function commit(d, archivos, mensaje = 'c') {
  for (const [rel, texto] of Object.entries(archivos)) {
    if (texto === null) g(d, 'rm', '-q', '--', rel);
    else {
      escribir(d, rel, texto);
      g(d, 'add', '-f', '--', rel);
    }
  }
  g(d, 'commit', '-q', '--allow-empty', '-m', mensaje);
  return g(d, 'rev-parse', 'HEAD');
}
const FICHA = (o = {}) =>
  [
    '---',
    'kit: 2.4.3',
    'nivel: estandar',
    'vars:',
    '  proyecto: px',
    'piezas:',
    `  candado: ${o.candado || 'molde'}`,
    'frenos:',
    '  opcionales: []',
    ...(o.quitados ? ['  quitados:', ...o.quitados.map((q) => `    - ${q}`)] : ['  quitados: []']),
    '---',
    '',
  ].join('\n');
const DOCS = {
  'docs/README.md': '# Docs\n',
  'docs/TODO.md': '# TODO\n',
  'docs/CHANGELOG.md': '# Changelog\n',
  'docs/NORTE.md': '# Norte\n',
  'docs/SESSION_HANDOFF.md': HANDOFF,
};
// repo(archivos, {ficha}) → carpeta, sin remoto. Con ficha (candado prendido) salvo ficha: false.
function repo(archivos = {}, o = {}) {
  const d = path.join(TMP, `r${n++}`);
  fs.mkdirSync(d, { recursive: true });
  g(d, 'init', '-q', '-b', 'main');
  commit(d, { '.gitignore': '/.claude/worktrees/\n/.kit-rol\n/ignorado/\n', ...DOCS, ...(o.ficha === false ? {} : { '.claude/kit.md': o.ficha || FICHA() }), ...archivos }, 'base');
  return d;
}
const chequeo = (id, d, op = {}) => K.CHEQUEOS[id](d, op);
const ques = (fs_) => fs_.map((f) => f.que);

// ---------------------------------------------------------------- candado:raiz

test('raiz sí: un archivo suelto en docs/ o una carpeta que no es de las tres (una falla por carpeta), commiteado o no', () => {
  const d = repo({ 'docs/suelto.md': 'x\n', 'docs/otra/a.md': 'a\n', 'docs/otra/b.md': 'b\n' });
  escribir(d, 'docs/nuevo.md', 'sin commitear\n');
  const f = chequeo('raiz', d);
  assert.deepEqual(f.map((x) => x.detalle).sort(), ['docs/nuevo.md', 'docs/otra/', 'docs/suelto.md']);
  assert.ok(f.every((x) => x.id === 'raiz' && /no va ahí$/.test(x.que) && /^movelo a `modulos\/<x>\/` o a `referencia\/`$/.test(x.hacer)));
});

test('raiz sí: un módulo sin README.md o con README sin Estado:; no: los seis, las tres carpetas, lo ignorado y un módulo con Estado:', () => {
  const d = repo({ 'docs/modulos/caja/SPEC.md': 'x\n', 'docs/modulos/banco/README.md': '# Banco\nalgo\n', 'docs/modulos/ok/README.md': '# Ok\n- Estado: EN OBRA\n' });
  assert.deepEqual(ques(chequeo('raiz', d)).sort(), ['docs/modulos/banco/README.md no tiene el renglón Estado:', 'el módulo docs/modulos/caja/ no tiene su README.md']);
  const e = repo({ 'docs/MAPA.md': 'm\n', 'docs/referencia/x.md': 'x\n', 'docs/archive/viejo.md': 'v\n', 'docs/modulos/ok/README.md': 'Estado: COMPLETO\n' });
  escribir(e, 'ignorado/docs.md', 'x\n');
  assert.deepEqual(chequeo('raiz', e), []);
});

// ---------------------------------------------------------------- candado:rutas

test('rutas sí: una ruta entre comillas invertidas o un enlace relativo que no existe, con su renglón', () => {
  const d = repo({
    'CLAUDE.md': '# Reglas\nver `docs/no-existe.md` y `docs/TODO.md`\n',
    'docs/README.md': '# Docs\n[el norte](NORTE.md) · [roto](referencia/nada.md)\n',
    'docs/modulos/x/README.md': 'Estado: EN OBRA\nspec: [s](SPEC.md)\n',
    'docs/referencia/trampas.md': 'mirá `src/falta.js`\n',
    'src/a.js': 'a\n',
  });
  const f = chequeo('rutas', d);
  assert.deepEqual(ques(f).sort(), [
    'CLAUDE.md:2 cita docs/no-existe.md, que no existe',
    'docs/README.md:2 cita docs/referencia/nada.md, que no existe',
    'docs/modulos/x/README.md:2 cita docs/modulos/x/SPEC.md, que no existe',
    'docs/referencia/trampas.md:1 cita src/falta.js, que no existe',
  ]);
  assert.ok(f.every((x) => x.id === 'rutas' && x.detalle && /Histórico/.test(x.hacer)));
});

test('rutas no: URLs, anclas, <placeholder>, comodines, <alias>:, comandos, primer tramo que no es de la raíz, código, > Histórico y el CHANGELOG', () => {
  const d = repo({
    'CLAUDE.md': [
      '# Reglas',
      ...Array(9).fill('relleno'), // el > Histórico de abajo cae después del renglón 10: no saca el archivo entero
      '[web](https://ejemplo.invalid/docs/x.md) · [ancla](#reglas) · [mail](mailto:a@b.invalid)',
      '`docs/modulos/<x>/README.md` · `docs/*.md` · `hub:docs/falta.md` · `node .claude/scripts/x.cjs` · `otra/cosa.md` · `docs/TODO.md:12`',
      '```',
      '`docs/en-codigo.md`',
      '```',
      '## Viejo',
      '> Histórico',
      '`docs/borrado.md`',
      '## Nuevo',
      '`docs/README.md#arriba`',
    ].join('\n'),
    'docs/CHANGELOG.md': '`docs/cualquiera.md`\n',
    'docs/referencia/viejo.md': '# Viejo\n\n> Histórico: lo de antes\n`docs/no-esta.md`\n## Más abajo\n`docs/tampoco.md`\n',
  });
  assert.deepEqual(chequeo('rutas', d), []);
  // > Histórico más abajo corta solo hasta el próximo título
  commit(d, { 'docs/referencia/viejo2.md': '# A\n1\n2\n3\n4\n5\n6\n7\n8\n9\n> Histórico\n`docs/x.md`\n## B\n`docs/y.md`\n' });
  assert.deepEqual(ques(chequeo('rutas', d)), ['docs/referencia/viejo2.md:14 cita docs/y.md, que no existe']);
});

test('rutas: lo que el árbol crea a demanda no se exige (las tres carpetas, el MAPA, frenos.log, cambios/); lo de adentro, sí', () => {
  const d = repo({
    'CLAUDE.md': '# R\n`docs/modulos/` `docs/referencia` `docs/archive/` `docs/MAPA.md` `.claude/frenos.log` `.claude/cambios/` `.claude/cambios`\n[a](docs/archive/)\n',
  });
  assert.deepEqual(chequeo('rutas', d), []);
  commit(d, { 'CLAUDE.md': '# R\n`docs/referencia/x.md` `docs/modulos/caja/README.md` `.claude/cambios/2026-01-01-x.md` `docs/otra/`\n' });
  assert.deepEqual(ques(chequeo('rutas', d)).sort(), [
    'CLAUDE.md:2 cita .claude/cambios/2026-01-01-x.md, que no existe',
    'CLAUDE.md:2 cita docs/modulos/caja/README.md, que no existe',
    'CLAUDE.md:2 cita docs/otra, que no existe',
    'CLAUDE.md:2 cita docs/referencia/x.md, que no existe',
  ]);
});

// ---------------------------------------------------------------- candado:topes

test('topes sí: el handoff pasado de 5.000 bytes (todo y parcial); parcial mira solo el handoff (no el MAPA); no: el handoff del molde', () => {
  const d = repo();
  assert.deepEqual(chequeo('topes', d), []);
  escribir(d, 'docs/MAPA.md', 'm'.repeat(6000));
  assert.ok(ques(chequeo('topes', d)).some((q) => /MAPA/.test(q)));
  assert.deepEqual(chequeo('topes', d, { parcial: true }), [], 'parcial: solo el handoff');
  escribir(d, 'docs/SESSION_HANDOFF.md', HANDOFF + 'x'.repeat(5000));
  const f = chequeo('topes', d, { parcial: true });
  assert.equal(f.length, 1);
  assert.match(f[0].que, /pesa \d+ bytes y el tope es 5000$/);
  assert.match(f[0].hacer, /CHANGELOG/);
  assert.equal(f[0].detalle, 'docs/SESSION_HANDOFF.md');
  assert.ok(ques(chequeo('topes', d)).some((q) => /el tope es 5000$/.test(q)));
  // nivel estandar de la ficha vigente: sin "- Producción:" en ## Estado → falla, también en parcial
  escribir(d, 'docs/SESSION_HANDOFF.md', HANDOFF.replace('- Producción: no hay\n', ''));
  const fv = require('./contexto.cjs').fichaVigente(d);
  assert.ok(ques(chequeo('topes', d, { parcial: true, fichaVigente: fv })).some((q) => /Producción/.test(q)));
});

test('mesa: verde hasta el orden 5', () => {
  assert.deepEqual(chequeo('mesa', repo()), []);
});

// ---------------------------------------------------------------- candado:estados

test('estados sí: el spec más nuevo COMPLETO con el módulo EN OBRA, el módulo COMPLETO con su spec abierto, COMPLETO con - [ ]', () => {
  const d = repo({
    'docs/modulos/a/README.md': 'Estado: EN OBRA\n',
    'docs/modulos/a/SPEC.md': 'Estado: READY\n',
    'docs/modulos/a/SPEC-2.md': '**Estado**: COMPLETO 2026-10-01\n',
    'docs/modulos/b/README.md': '- Estado: COMPLETO 2026-10-02\n',
    'docs/modulos/b/SPEC.md': '> Estado: EN CURSO\n',
    'docs/modulos/c/README.md': 'Estado: COMPLETO\n- [x] hecha\n- [ ] sin tildar\n',
  });
  const f = chequeo('estados', d);
  assert.deepEqual(f.map((x) => x.detalle).sort(), ['docs/modulos/a/README.md', 'docs/modulos/b/README.md', 'docs/modulos/c/README.md']);
  assert.match(f.find((x) => x.detalle.includes('/a/')).que, /SPEC-2\.md está COMPLETO y el módulo sigue EN OBRA/);
});

test('estados no: SPEC.md COMPLETO con SPEC-2.md EN CURSO y el módulo EN OBRA (B §13), COMPLETO con todo tildado, sin spec', () => {
  const d = repo({
    'docs/modulos/a/README.md': 'Estado: EN OBRA\n',
    'docs/modulos/a/SPEC.md': 'Estado: COMPLETO 2026-09-01\n',
    'docs/modulos/a/SPEC-2.md': 'Estado: EN CURSO\n',
    'docs/modulos/b/README.md': 'Estado: COMPLETO\n',
    'docs/modulos/b/SPEC-10.md': 'Estado: COMPLETO\n',
    'docs/modulos/b/SPEC-9.md': 'Estado: EN CURSO\n',
    'docs/modulos/c/README.md': 'Estado: PAUSADO\n',
  });
  assert.deepEqual(chequeo('estados', d), []);
});

// ---------------------------------------------------------------- candado:lecturas

test('lecturas: lista lo de más de 100 KB que cita una skill (sin frenar); lo chico o lo que no existe, no', () => {
  const d = repo({
    'docs/referencia/grande.md': 'x'.repeat(120 * 1024),
    'docs/referencia/chico.md': 'x\n',
    '.claude/skills/s/SKILL.md': 'leé `docs/referencia/grande.md` y `docs/referencia/chico.md` y [a](../../../docs/referencia/grande.md) y `docs/falta.md`\n',
  });
  const f = chequeo('lecturas', d);
  assert.equal(f.length, 1);
  assert.equal(f[0].soloLista, true);
  assert.equal(f[0].que, 'docs/referencia/grande.md pesa 120 KB y lo cita .claude/skills/s/SKILL.md');
  assert.deepEqual(chequeo('lecturas', repo({ '.claude/skills/s/SKILL.md': '`docs/TODO.md`\n' })), []);
});

// ---------------------------------------------------------------- candado:estado-viejo

test('estado-viejo: sin base, verde; con código desde el último cierre y el próximo paso igual → rojo; reescrito → verde', () => {
  const d = repo({}, { ficha: false });
  assert.deepEqual(chequeo('estado-viejo', d), []); // la base: el commit que tocó el handoff es el mismo base... con código ninguno
  escribir(d, 'src/a.js', 'nuevo\n');
  const f = chequeo('estado-viejo', d);
  assert.deepEqual(ques(f), ['hubo cambios de código desde el último cierre y "## Próximo paso" del handoff sigue igual']);
  assert.equal(f[0].detalle, 'docs/SESSION_HANDOFF.md');
  commit(d, { 'src/a.js': 'nuevo\n' }); // commiteado cuenta igual
  assert.equal(chequeo('estado-viejo', d).length, 1);
  escribir(d, 'docs/SESSION_HANDOFF.md', HANDOFF.replace('{{una acción ejecutable, nunca "seguir avanzando"}}', 'probar la caja'));
  assert.deepEqual(chequeo('estado-viejo', d), []);
  // lo de docs/ y .claude/ no es código
  const e = repo({}, { ficha: false });
  escribir(e, 'docs/TODO.md', '# TODO\n- [ ] x\n');
  escribir(e, '.claude/x.json', '{}\n');
  assert.deepEqual(chequeo('estado-viejo', e), []);
  // sin ningún commit del handoff: sin base, verde aunque haya código
  const s = path.join(TMP, `s${n++}`);
  fs.mkdirSync(s);
  g(s, 'init', '-q', '-b', 'main');
  commit(s, { 'src/a.js': 'a\n' });
  escribir(s, 'src/a.js', 'b\n');
  assert.deepEqual(chequeo('estado-viejo', s), []);
});

test('estado-viejo: un módulo con rama: igual a la rama actual y su Estado: sin tocar → rojo; tocado → verde; de otra rama, nada', () => {
  const d = repo({ 'docs/modulos/caja/README.md': 'Estado: EN OBRA\nrama: modulo/caja\n', 'docs/modulos/banco/README.md': 'Estado: EN OBRA\nrama: modulo/banco\n' });
  g(d, 'checkout', '-q', '-b', 'modulo/caja');
  escribir(d, 'docs/SESSION_HANDOFF.md', HANDOFF.replace('{{una acción ejecutable, nunca "seguir avanzando"}}', 'seguir con la caja'));
  commit(d, { 'src/caja.js': 'x\n' });
  assert.deepEqual(ques(chequeo('estado-viejo', d)), ['hubo cambios de código en la rama modulo/caja y el Estado: de docs/modulos/caja/README.md sigue igual']);
  escribir(d, 'docs/modulos/caja/README.md', 'Estado: EN OBRA — la caja suma\nrama: modulo/caja\n');
  assert.deepEqual(chequeo('estado-viejo', d), []);
});

// ---------------------------------------------------------------- candado:datos

test('datos sí: rutas absolutas, ids de sesión, ramas concretas y SHAs en .claude/skills/** (zonas propias incluidas)', () => {
  const casos = {
    'C:\\Users\\guido\\x': 'una ruta absoluta',
    'en /c/Users/guido/x': 'una ruta absoluta',
    'en /home/guido': 'una ruta absoluta',
    'en /Users/guido': 'una ruta absoluta',
    'sesión local_0a1b2c3d': 'un id de sesión',
    'id 123e4567-e89b-12d3-a456-426614174000': 'un id de sesión',
    'la rama modulo/caja': 'una rama concreta',
    'el commit a1b2c3d': 'un SHA',
    'file:///C:/Users/x': 'una ruta absoluta',
  };
  const lineas = Object.keys(casos);
  const d = repo({ '.claude/skills/s/SKILL.md': `# S\n<!-- kit:propio -->\n${lineas.join('\n')}\n<!-- /kit:propio -->\n` });
  const f = chequeo('datos', d);
  for (const [i, l] of lineas.entries()) {
    assert.ok(f.some((x) => x.que === `.claude/skills/s/SKILL.md:${i + 3} trae ${casos[l]}`), `${l}: ${JSON.stringify(ques(f))}`);
  }
  assert.ok(f.every((x) => x.id === 'datos' && x.detalle === '.claude/skills/s/SKILL.md' && !/guido/.test(x.que)));
  assert.equal(f.filter((x) => x.que.startsWith('.claude/skills/s/SKILL.md:8 ')).length, 1, 'un UUID es un id de sesión, no además un SHA');
});

test('datos no: placeholders, URLs con SHA, fechas, palabras hexa sin número, números sin letra', () => {
  const d = repo({
    '.claude/skills/s/SKILL.md': [
      'la rama modulo/<nombre> o modulo/*',
      'ver https://github.com/x/y/commit/a1b2c3d4e5f6 y https://ejemplo.invalid/home/x',
      'el 2026-10-28, 1234567, deadbeef, facade',
      'node .claude/scripts/estructura.cjs',
      'el commit <sha>',
    ].join('\n'),
  });
  assert.deepEqual(chequeo('datos', d), []);
});

// ---------------------------------------------------------------- correr

const correr = (d, o = {}) => K.correr(d, { log: false, ...o });

test('correr: sin ficha en ningún lado → 0 y "sin ficha: candado apagado" (repo sin remoto ni ficha: nada se traba)', () => {
  const d = repo({ 'docs/suelto.md': 'x\n' }, { ficha: false });
  const r = correr(d);
  assert.equal(r.codigo, 0);
  assert.deepEqual(r.lineas, ['sin ficha: candado apagado']);
});

test('correr: prendido corre los nueve; apagado (no o ausente) solo barreras', () => {
  const d = repo({ 'docs/suelto.md': 'x\n' });
  const r = correr(d);
  assert.equal(r.codigo, 1);
  assert.deepEqual(r.corrieron, K.IDS);
  assert.ok(r.lineas.includes('candado:raiz · `docs/suelto.md` no va ahí · movelo a `modulos/<x>/` o a `referencia/`'));
  for (const ficha of [FICHA({ candado: 'no' }), FICHA().replace('piezas:\n  candado: molde\n', '')]) {
    const e = repo({ 'docs/suelto.md': 'x\n' }, { ficha });
    const s = correr(e);
    assert.equal(s.codigo, 0);
    assert.deepEqual(s.corrieron, ['barreras']);
    assert.match(s.lineas[0], /candado apagado en la ficha/);
  }
  const conMapa = repo({ 'docs/suelto.md': 'x\n' }, { ficha: FICHA({ candado: '{estado: molde, hash: 0123456789ab}' }) });
  assert.equal(correr(conMapa).codigo, 1);
});

test('correr: quitado con hasta vigente no corre; vencido sí; barreras no se quita nunca', () => {
  const ahora = new Date(2026, 9, 29, 12);
  const q = (id, hasta) => `{id: candado:${id}, por: "migrando", hasta: ${hasta}}`;
  const d = repo({ 'docs/suelto.md': 'x\n' }, { ficha: FICHA({ quitados: [q('raiz', 'siempre'), q('barreras', 'siempre')] }) });
  escribir(d, '.claude/settings.json', '{"permissions": {"allow": ["Bash(*)"]}}\n');
  const r = correr(d, { ahora });
  assert.ok(!r.corrieron.includes('raiz'));
  assert.ok(r.corrieron.includes('barreras'));
  assert.ok(r.lineas.some((l) => l.startsWith('candado:barreras · ')));
  const hoy = repo({ 'docs/suelto.md': 'x\n' }, { ficha: FICHA({ quitados: [q('raiz', '2026-10-29')] }) });
  assert.ok(!correr(hoy, { ahora }).corrieron.includes('raiz'), 'el día de hasta: incluido');
  const vencido = repo({ 'docs/suelto.md': 'x\n' }, { ficha: FICHA({ quitados: [q('raiz', '2026-10-28')] }) });
  assert.ok(correr(vencido, { ahora }).corrieron.includes('raiz'));
  assert.deepEqual([...K.quitadosVigentes({ frenos: { quitados: [{ id: 'candado:datos', hasta: 'algún día' }, { id: 'otra:cosa', hasta: 'siempre' }] } }, ahora)], []);
  assert.deepEqual([...K.quitadosVigentes({ frenos: { quitados: [{ id: 'candado:barreras', hasta: 'siempre' }, { id: 'candado:datos', hasta: 'siempre' }] } }, ahora)], ['datos']);
});

test('correr: parcial = topes (el handoff) y barreras; ids sueltos, solo esos', () => {
  const d = repo({ 'docs/suelto.md': 'x\n' });
  const p = correr(d, { modo: 'parcial' });
  assert.deepEqual(p.corrieron, ['topes', 'barreras']);
  assert.equal(p.codigo, 0);
  const i = correr(d, { modo: 'ids', ids: ['datos', 'raiz'] });
  assert.deepEqual(i.corrieron, ['raiz', 'datos']);
  assert.equal(i.codigo, 1);
});

test('correr: lecturas lista y no cambia la salida; cada frenada deja su renglón en frenos.log (herramienta estructura, detalle = ruta)', () => {
  const d = repo({ 'docs/referencia/grande.md': 'x'.repeat(110 * 1024), '.claude/skills/s/SKILL.md': '`docs/referencia/grande.md`\n' });
  const r = correr(d, { log: true });
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  assert.match(r.lineas[0], /^candado:lecturas · docs\/referencia\/grande\.md pesa 110 KB/);
  assert.equal(fs.existsSync(path.join(d, '.claude', 'frenos.log')), false, 'lecturas no es una frenada');
  escribir(d, 'docs/suelto.md', 'x\n');
  escribir(d, 'docs/otro.md', 'x\n');
  const s = correr(d, { log: true });
  assert.equal(s.codigo, 1);
  const log = leerArchivo(d, '.claude/frenos.log').trim().split('\n');
  assert.equal(log.length, 2);
  assert.match(log[0], /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2} · humano · main · candado:raiz · estructura · docs\/otro\.md$/);
  // sin log, nada
  correr(d, { log: false });
  assert.equal(leerArchivo(d, '.claude/frenos.log').trim().split('\n').length, 2);
});

const ROTA = '---\nkit: 2.4.3\nnivel: raro\nvars:\n  proyecto: px\n---\n';
// Un repo con remoto cuya ficha vigente (origin/main) está rota; la última que se lee es `vieja`.
function conFichaRota(vieja, archivos = {}) {
  const d = repo(archivos, { ficha: vieja });
  const bare = `${d}.git`;
  g(TMP, 'init', '-q', '--bare', bare);
  g(d, 'remote', 'add', 'origin', bare);
  commit(d, { '.claude/kit.md': ROTA }, 'la rompe');
  g(d, 'push', '-q', '-u', 'origin', 'main');
  return d;
}

test('correr: ficha vigente rota (rf-9) → no da 1 sola: avisa y corre con los frenos de fábrica (sin quitados); el arreglo que la deja legible pasa', () => {
  const q = '{id: candado:raiz, por: "migrando", hasta: siempre}';
  const vieja = FICHA({ quitados: [q] }); // la última que se lee: candado prendido y raiz quitado
  const d = conFichaRota(vieja);
  const r = correr(d, { log: true });
  assert.equal(r.lineas[0], 'ficha rota: .claude/kit.md:3 — corré doctor (corro con los frenos de fábrica)');
  assert.deepEqual(r.corrieron, K.IDS, 'entero: el quitado de raiz no vale con la ficha rota');
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  assert.match(r.lineas[r.lineas.length - 1], /^candado: en verde \(raiz, /);
  assert.match(leerArchivo(d, '.claude/frenos.log'), / · candado:ficha · estructura · \.claude\/kit\.md\n$/);
  escribir(d, 'docs/suelto.md', 'x\n');
  const s = correr(d);
  assert.equal(s.codigo, 1, 'raiz, que la ficha quitaba, frena');
  assert.ok(s.lineas.some((l) => l.startsWith('candado:raiz · ')));
  fs.unlinkSync(path.join(d, 'docs', 'suelto.md'));
  // el commit que la arregla (vuelve a la última que se lee) pasa; uno que además afloja, no
  commit(d, { '.claude/kit.md': vieja }, 'la arregla');
  assert.equal(correr(d).codigo, 0);
  commit(d, { '.claude/kit.md': FICHA({ quitados: [q, '{id: deny:Bash(git stash:*), por: "x", hasta: siempre}'] }) });
  const a = correr(d);
  assert.equal(a.codigo, 1);
  assert.ok(a.lineas.some((l) => /^candado:barreras · .*git stash/.test(l)), a.lineas.join('\n'));
  // rota desde el primer commit (ninguna anterior que se lea): avisa y corre igual
  const e = repo({}, { ficha: '---\nkit: [\n---\n' });
  const re = correr(e);
  assert.equal(re.lineas[0], 'ficha rota: .claude/kit.md:2 — corré doctor (corro con los frenos de fábrica)');
  assert.deepEqual(re.corrieron, K.IDS);
});

test('correr: ficha vigente rota con el candado apagado en la última que se lee (rf-14) → solo barreras; el arreglo pasa con docs/ viejo', () => {
  const vieja = FICHA({ candado: 'no' });
  const d = conFichaRota(vieja, { 'docs/viejo.md': 'de antes del kit\n' });
  const r = correr(d);
  assert.equal(r.lineas[0], 'ficha rota: .claude/kit.md:3 — corré doctor (corro con los frenos de fábrica)');
  assert.deepEqual(r.corrieron, ['barreras']);
  assert.equal(r.codigo, 0, r.lineas.join('\n'));
  commit(d, { '.claude/kit.md': vieja }, 'la arregla');
  const a = correr(d);
  assert.equal(a.codigo, 0, a.lineas.join('\n'));
  // prendida en la última que se lee: corre entero y raiz frena
  const e = conFichaRota(FICHA(), { 'docs/viejo.md': 'x\n' });
  const re = correr(e);
  assert.deepEqual(re.corrieron, K.IDS);
  assert.ok(re.lineas.some((l) => l.startsWith('candado:raiz · ')));
});
