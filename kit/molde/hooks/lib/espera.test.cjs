'use strict';
// Pruebas de hooks/lib/espera.cjs (B1, SPEC-paquete-8d): la lista única de lo que espera al dueño. Corren con: node --test "kit/**/*.test.cjs"
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-espera-'));
const GLOBAL = path.join(TMP, 'gitconfig-vacio');
fs.writeFileSync(GLOBAL, '[core]\n\tlongpaths = true\n');
Object.assign(process.env, { GIT_CONFIG_GLOBAL: GLOBAL, GIT_CONFIG_NOSYSTEM: '1', GIT_AUTHOR_NAME: 'P', GIT_AUTHOR_EMAIL: 'p@p.invalid', GIT_COMMITTER_NAME: 'P', GIT_COMMITTER_EMAIL: 'p@p.invalid' });
test.after(() => fs.rmSync(TMP, { recursive: true, force: true }));
const ES = require('./espera.cjs');

function g(cwd, ...a) {
  const r = spawnSync('git', a, { cwd, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ${a.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}
let k = 0;
function repo(archivos) {
  const d = path.join(TMP, `r${k++}`);
  fs.mkdirSync(d);
  g(d, 'init', '-q', '-b', 'main');
  for (const [rel, t] of Object.entries({ 'a.txt': 'a\n', ...archivos })) {
    fs.mkdirSync(path.dirname(path.join(d, rel)), { recursive: true });
    fs.writeFileSync(path.join(d, rel), t);
  }
  g(d, 'add', '-A');
  g(d, 'commit', '-q', '-m', 'base');
  return d;
}
const FICHA = (te) => `# Módulo x\n\n- Estado: EN OBRA\n\n## Te espera\n\n${te}\n\n## Tareas\n\n- [ ] una\n`;
const HANDOFF = (te) => `# Handoff\n\n## Te espera\n\n${te}\n\n## Otra\n\n- nada\n`;
const C = require('./cambios.cjs');
const CAMBIO = (clase) => C.armar({ clase, toca: ['deny:Bash(git stash:*)'], cicatriz: 'una noche', chico: 'no', urgente: 'no', cuerpo: '## Regla\nno guardar con stash\n' });

test('nada → lista vacía', () => {
  const d = repo({});
  assert.deepEqual(ES.teEspera(d), []);
});

test('la ficha activa y el handoff: el mismo ítem en las dos sale una vez; cada ítem dice de dónde y su tipo', () => {
  const d = repo({
    'docs/modulos/x/README.md': FICHA('- decidir si el banco 2 entra\n- mirar el diseño del parte'),
    'docs/SESSION_HANDOFF.md': HANDOFF('- Decidir si el banco 2 entra.\n- otra cosa del handoff'),
  });
  const l = ES.teEspera(d);
  const textos = l.map((i) => i.texto);
  assert.equal(textos.filter((t) => /banco 2/i.test(t)).length, 1, JSON.stringify(textos));
  assert.ok(textos.some((t) => /otra cosa del handoff/.test(t)));
  assert.ok(textos.some((t) => /diseño del parte/.test(t)));
  for (const i of l) {
    assert.ok(['clic', 'decisión'].includes(i.tipo), JSON.stringify(i));
    assert.ok(i.fuente, JSON.stringify(i));
  }
  // una ficha que no está activa no cuenta
  const d2 = repo({ 'docs/modulos/x/README.md': FICHA('- algo').replace('EN OBRA', 'COMPLETO') });
  assert.deepEqual(ES.teEspera(d2), []);
});

test('un cambio propuesto aparece, tipo clic; uno aprobado no', () => {
  const d = repo({ '.claude/cambios/2026-11-12-quitar-stash.md': CAMBIO('3-barrera'), '.claude/cambios/2026-11-01-viejo.md': CAMBIO('3-barrera').replace('estado: propuesto', 'estado: aplicado') });
  const l = ES.teEspera(d);
  const cl = l.filter((i) => i.tipo === 'clic');
  assert.equal(cl.length, 1, JSON.stringify(l));
  assert.match(cl[0].texto, /no guardar con stash/);
  assert.ok(!l.some((i) => /viejo/.test(i.texto)));
});

test('las esperas vencidas del TODO y el último parte', () => {
  const d = repo({
    'docs/TODO.md': '# TODO\n\n- [ ] llamar al banco · espera hasta: 2020-01-01\n- [ ] otra · espera hasta: 2999-01-01\n',
    'docs/modulos/x/bitacora/2026-11-11-parte.md': '# Parte\n\n## Qué quedó\n\n- integrado: sí\n\n## Te necesito\n\n- decidir el nombre del botón\n\n## Qué se hizo\n\n- nada\n',
  });
  const l = ES.teEspera(d, { ahora: new Date(2026, 10, 12, 9) });
  const t = l.map((i) => i.texto).join('\n');
  assert.match(t, /llamar al banco/);
  assert.ok(!/otra/.test(t), t);
  assert.match(t, /nombre del botón/);
});

test('revisor frío de B (5): con sinParte (lo usa el parte nuevo) no copia el "te necesito" del parte anterior: lo resuelto no vuelve cada noche', () => {
  const d = repo({ 'docs/modulos/x/bitacora/2026-11-11-parte.md': '# Parte\n\n## Te necesito\n\n- falta tu autorización para publicar desde esta PC\n\n## Qué se hizo\n\n- nada\n' });
  assert.match(ES.teEspera(d).map((i) => i.texto).join('\n'), /falta tu autorización/);
  assert.deepEqual(ES.teEspera(d, { sinParte: true }), []);
});

test('revisor frío de B (6), en la C: el cambio que el handoff nombra con su id y su hash sale una vez, el del kit; lo del handoff, sin SHAs ni comandos', () => {
  const d = repo({
    '.claude/cambios/2026-11-12-quitar-stash.md': CAMBIO('3-barrera'),
    'docs/SESSION_HANDOFF.md': HANDOFF('- aprobar 2026-11-12-quitar-stash (@3f2a1bc9): `node .claude/scripts/cambios.cjs aprobar 2026-11-12-quitar-stash`\n- mirar si el deploy quedó en verde (commit 3f2a1bc9)'),
  });
  const te = ES.teEspera(d);
  const textos = te.map((i) => i.texto);
  assert.equal(textos.filter((x) => /quitar-stash|cambio de freno/.test(x)).length, 1, JSON.stringify(textos));
  assert.equal(te[0].fuente, 'cambio propuesto');
  assert.ok(textos.includes('mirar si el deploy quedó en pasó (commit )'), JSON.stringify(textos));
  assert.equal(ES.paraElDueno('quedó en verde: `git push` @abc1234'), 'quedó en pasó: un paso del kit');
});

test('revisor frío de C (3, 4): los números y los colores de la app quedan; un slug de una palabra no se come pedidos del handoff', () => {
  for (const t of ['cobrar 1500000 al cliente antes del 20261120', 'cambiar el botón verde por azul', 'la tabla defaced quedó', 'el lote 12345678 de facturas']) assert.equal(ES.paraElDueno(t), t);
  const d = repo({
    '.claude/cambios/2026-11-13-deploy.md': CAMBIO('3-barrera'),
    'docs/SESSION_HANDOFF.md': HANDOFF('- decidir si el deploy va el viernes\n- aprobar 2026-11-13-deploy'),
  });
  const textos = ES.teEspera(d).map((i) => i.texto);
  assert.ok(textos.includes('decidir si el deploy va el viernes'), JSON.stringify(textos));
  assert.ok(!textos.includes('aprobar 2026-11-13-deploy'), 'el id entero sí es el mismo pedido');
});

// ---------------------------------------------------------------- 8e (la rc.8) G3: el cambio que vive solo en la rama por defecto de origin

test('8e G3: un cambio de freno propuesto en origin/main (con --en-defecto) sale desde la pestaña del director y desde una carpeta principal sin pull; firmado allá, ya no', () => {
  const d = repo({});
  const bare = path.join(TMP, `o${k++}.git`);
  g(TMP, 'clone', '-q', '--bare', d, bare);
  g(d, 'remote', 'add', 'origin', bare);
  g(d, 'fetch', '-q', 'origin');
  // el worktree del director, en la rama del módulo
  const wt = path.join(d, '.claude', 'worktrees', 'modulo--x');
  g(d, 'worktree', 'add', '-q', '-b', 'modulo/x', wt, 'main');
  // el cambio entra SOLO a origin/main (lo que hace `cambios nuevo --en-defecto`): ni el disco de la principal ni el del worktree lo tienen
  const otro = path.join(TMP, `c${k++}`);
  g(TMP, 'clone', '-q', bare, otro);
  fs.mkdirSync(path.join(otro, '.claude', 'cambios'), { recursive: true });
  fs.writeFileSync(path.join(otro, '.claude', 'cambios', '2026-11-15-quitar-stash.md'), CAMBIO('3-barrera'));
  g(otro, 'add', '-A');
  g(otro, 'commit', '-q', '-m', 'cambios: propuesto 2026-11-15-quitar-stash');
  g(otro, 'push', '-q', 'origin', 'HEAD:main');
  g(d, 'fetch', '-q', 'origin');
  for (const [donde, carpeta] of [['la pestaña del director', wt], ['la carpeta principal sin pull', d]]) {
    const l = ES.teEspera(carpeta).filter((i) => i.fuente === 'cambio propuesto');
    assert.equal(l.length, 1, `${donde}: ${JSON.stringify(ES.teEspera(carpeta))}`);
    assert.equal(l[0].tipo, 'clic');
    assert.match(l[0].texto, /no guardar con stash/);
    assert.equal(l[0].desde, '2026-11-15');
  }
  // con pull, el disco y origin dicen lo mismo: sale una sola vez
  g(d, 'pull', '-q', '--ff-only', 'origin', 'main');
  assert.equal(ES.teEspera(d).filter((i) => i.fuente === 'cambio propuesto').length, 1);
  // ya firmado en origin (manda origin sobre un disco atrasado): no sale
  const ruta = path.join(otro, '.claude', 'cambios', '2026-11-15-quitar-stash.md');
  fs.writeFileSync(ruta, fs.readFileSync(ruta, 'utf8').replace(/^estado: propuesto$/m, 'estado: rechazado'));
  g(otro, 'commit', '-q', '-am', 'cambios: rechazado');
  g(otro, 'push', '-q', 'origin', 'HEAD:main');
  g(d, 'fetch', '-q', 'origin');
  assert.equal(ES.teEspera(wt).filter((i) => i.fuente === 'cambio propuesto').length, 0);
  assert.equal(ES.teEspera(d).filter((i) => i.fuente === 'cambio propuesto').length, 0, 'el disco de la principal quedó atrás: manda origin');
});
