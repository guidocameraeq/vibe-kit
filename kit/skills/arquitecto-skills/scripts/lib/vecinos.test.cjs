'use strict';
// vecinos.test.cjs — lo que queda fuera del repo (SPEC-paquete-8r4 u4, crit. 4, con rt-9). Repos temporales, sin la config de git de
// quien corre. Nunca toca ~/.claude ni carpetas reales.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const V = require('./vecinos.cjs');

const T = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-vecinos-'));
test.after(() => fs.rmSync(T, { recursive: true, force: true }));
fs.writeFileSync(path.join(T, 'gitconfig-vacio'), '');
Object.assign(process.env, {
  GIT_CONFIG_GLOBAL: path.join(T, 'gitconfig-vacio'), GIT_CONFIG_NOSYSTEM: '1',
  GIT_AUTHOR_NAME: 'prueba', GIT_AUTHOR_EMAIL: 'p@kit.invalid', GIT_COMMITTER_NAME: 'prueba', GIT_COMMITTER_EMAIL: 'p@kit.invalid',
});

function git(cwd, ...args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', windowsHide: true });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}
const barras = (p) => String(p).replace(/\\/g, '/');
let n = 0;
// El padre (una carpeta propia, para que los gate-* sean solo los de la prueba) con el principal adentro y un commit en main.
function armar() {
  const padre = path.join(T, `p${n++}`);
  const P = path.join(padre, 'proyecto');
  fs.mkdirSync(P, { recursive: true });
  git(P, 'init', '-q', '-b', 'main');
  fs.writeFileSync(path.join(P, 'a.txt'), 'a\n');
  fs.writeFileSync(path.join(P, '.gitignore'), '/.claude/worktrees/\n');
  git(P, 'add', '-A');
  git(P, 'commit', '-q', '-m', 'base');
  return { padre, P };
}
// La foto: qué carpetas hay (para "ninguno borra").
const carpetas = (d) => fs.readdirSync(d).sort();

test('crit. 4: tres worktrees fuera (mezclada, viva, perdida), una suelta y dos gate-* en el padre — los estados bien; el de adentro no cuenta; no borra nada', () => {
  const { padre, P } = armar();
  // mezclada: su punta ya está en main, árbol limpio
  git(P, 'worktree', 'add', '-q', '-b', 'vieja', path.join(padre, 'proyecto-vieja'), 'main');
  // viva: un commit que main no tiene
  const viva = path.join(padre, 'proyecto-viva');
  git(P, 'worktree', 'add', '-q', '-b', 'viva', viva, 'main');
  fs.writeFileSync(path.join(viva, 'b.txt'), 'b\n');
  git(viva, 'add', '-A');
  git(viva, 'commit', '-q', '-m', 'trabajo');
  // perdida: la carpeta se borró a mano (git la marca prunable)
  const perdida = path.join(padre, 'proyecto-perdida');
  git(P, 'worktree', 'add', '-q', '-b', 'perdida', perdida, 'main');
  fs.rmSync(perdida, { recursive: true, force: true });
  // suelta: detached
  git(P, 'worktree', 'add', '-q', '--detach', path.join(padre, 'proyecto-suelta'), 'main');
  // adentro (.claude/worktrees/): el del kit, no cuenta
  git(P, 'worktree', 'add', '-q', '-b', 'modulo/x', path.join(P, '.claude', 'worktrees', 'modulo--x'), 'main');
  // dos gate-* en el padre: uno con .git (un gate de verdad), uno de datos (rt-9: gate-candados de Hermes)
  git(padre, 'init', '-q', 'gate-propio');
  fs.mkdirSync(path.join(padre, 'gate_candados'));
  fs.writeFileSync(path.join(padre, 'gate_candados', 'roles.json'), '{}\n');
  const antes = carpetas(padre);
  const antesWt = git(P, 'worktree', 'list', '--porcelain');

  const v = V.vecinos(P);
  assert.equal(v.def, 'main');
  const estados = Object.fromEntries(v.worktrees.map((w) => [path.basename(w.ruta), w.estado]));
  assert.deepEqual(estados, { 'proyecto-perdida': 'perdida', 'proyecto-suelta': 'suelta', 'proyecto-vieja': 'mezclada', 'proyecto-viva': 'viva' });
  assert.deepEqual(v.gates.map((g) => [g.nombre, g.conGit]), [['gate-propio', true], ['gate_candados', false]]);

  const l = V.lineas(v);
  assert.equal(l[0], `fuera del repo: 4 worktrees (1 ya mezclado) y 2 carpetas gate-* en ${barras(padre)} — el kit arma los worktrees adentro (.claude/worktrees/)`);
  assert.ok(l.some((x) => x.includes('proyecto-vieja · vieja · mezclada (ya está en main): se puede borrar con git worktree remove "') && x.endsWith('borra también lo ignorado (.env, config): miralo antes')), l.join('\n'));
  assert.ok(l.some((x) => /proyecto-viva · viva · viva \(trae lo que main no tiene/.test(x) && x.endsWith('no tocar')));
  assert.ok(l.some((x) => /proyecto-perdida · perdida · perdida \(la carpeta ya no está\): git worktree prune/.test(x)));
  assert.ok(l.some((x) => /proyecto-suelta · sin rama · suelta \(detached/.test(x)));
  assert.ok(l.some((x) => x.endsWith('gate-propio · un gate con .git (se cuenta; no la muevo)')));
  assert.ok(l.some((x) => x.endsWith('gate_candados · datos, no un gate: no tocar')));
  // rt-9: ningún consejo de mudar los gate-*, y git worktree remove solo para la mezclada
  assert.ok(!l.some((x) => /gate/.test(x) && /pasalo|mud|worktree integrar/.test(x)), l.join('\n'));
  assert.equal(l.filter((x) => x.includes('git worktree remove')).length, 1);
  assert.ok(!l.some((x) => x.includes('modulo--x')), 'el de adentro no es vecino');
  // ninguno borra: las carpetas y la lista de worktrees siguen igual (ni prune)
  assert.deepEqual(carpetas(padre), antes);
  assert.equal(git(P, 'worktree', 'list', '--porcelain'), antesWt);
  // parado en un worktree (el de adentro), el mismo principal y los mismos vecinos
  const desdeWt = V.vecinos(path.join(P, '.claude', 'worktrees', 'modulo--x'));
  assert.deepEqual(desdeWt.worktrees.map((w) => w.estado).sort(), ['mezclada', 'perdida', 'suelta', 'viva']);
});

test('u4: una mezclada con cambios sin commitear es viva (no se ofrece borrarla); sin nada afuera → ninguna línea; fuera de git → error', () => {
  const { padre, P } = armar();
  assert.deepEqual(V.lineas(V.vecinos(P)), []);
  const w = path.join(padre, 'proyecto-sucia');
  git(P, 'worktree', 'add', '-q', '-b', 'sucia', w, 'main');
  fs.writeFileSync(path.join(w, 'a.txt'), 'cambiado\n');
  assert.equal(V.vecinos(P).worktrees[0].estado, 'viva');
  const solo = path.join(T, `suelta${n++}`);
  fs.mkdirSync(solo);
  assert.ok(V.vecinos(solo).error);
  assert.deepEqual(V.lineas(V.vecinos(solo)), []);
});
