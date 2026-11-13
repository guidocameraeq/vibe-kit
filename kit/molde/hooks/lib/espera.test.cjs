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
