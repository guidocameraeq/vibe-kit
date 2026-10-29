'use strict';
// Pruebas de lib/agente.cjs (SPEC-paquete-3, P4.7 "Sesión de agente"): quién es agente (rama de obrero o .kit-rol), la raíz, el
// principal, y el enlace del `.git` de un worktree (ok · principal · roto). Repos temporales, sin la config de git de la PC.
// Correr: node --test kit/molde/hooks/lib/agente.test.cjs. KIT_HOOKS_DIR apunta a otra copia de hooks/ (prueba de mutación).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-ag-'));
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

const DIR = process.env.KIT_HOOKS_DIR ? path.resolve(process.env.KIT_HOOKS_DIR) : path.join(__dirname, '..');
const ag = require(path.join(DIR, 'lib', 'agente.cjs'));

let n = 0;
const carpeta = (nombre = 'r') => {
  const d = path.join(TMP, `${nombre}${n++}`);
  fs.mkdirSync(d, { recursive: true });
  return d;
};
function g(cwd, ...args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', env: process.env });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}
function repo() {
  const d = carpeta();
  g(d, 'init', '-q', '-b', 'main');
  fs.writeFileSync(path.join(d, '.gitignore'), '/.claude/worktrees/\n/.kit-rol\n');
  g(d, 'add', '.gitignore');
  g(d, 'commit', '-q', '-m', 'c');
  return d;
}
// El .git de un worktree es oculto en Windows: writeFileSync da EPERM sobre un archivo oculto; se borra y se escribe.
function pisar(p, texto) {
  fs.rmSync(p, { force: true });
  fs.writeFileSync(p, texto);
}
function worktree(d, rama, donde = path.join(d, '.claude', 'worktrees', `w${n++}`)) {
  g(d, 'worktree', 'add', '-q', '-b', rama, donde);
  return donde;
}

test('sin repo de git → agente false, sin error', () => {
  const d = carpeta('suelto');
  const s = ag.sesionDeAgente(d);
  assert.equal(s.agente, false);
  assert.equal(s.raiz, null);
  assert.equal(s.principal, null);
  assert.equal(ag.sesionDeAgente(path.join(d, 'no-existe')).agente, false);
});

test('el principal de un humano: no es agente, enlace principal, principal = raíz, la rama', () => {
  const d = repo();
  const s = ag.sesionDeAgente(d);
  assert.equal(s.agente, false);
  assert.equal(s.rol, 'humano');
  assert.equal(s.rama, 'main');
  assert.ok(ag.mismaRuta(s.raiz, d));
  assert.ok(ag.mismaRuta(s.principal, d));
  assert.equal(s.enlace, 'principal');
  // desde una subcarpeta, la misma raíz
  fs.mkdirSync(path.join(d, 'src', 'a'), { recursive: true });
  assert.ok(ag.mismaRuta(ag.sesionDeAgente(path.join(d, 'src', 'a')).raiz, d));
  assert.ok(ag.mismaRuta(ag.raizDe(path.join(d, 'src', 'a')), d));
});

test('.kit-rol: obrero, nocturno y uno que no se entiende son agente; actualizador, director y humano no', () => {
  const d = repo();
  for (const [rol, esperado, agente] of [
    ['obrero', 'obrero', true],
    ['nocturno', 'nocturno', true],
    ['jefe', 'desconocido', true],
    ['actualizador', 'actualizador', false],
    ['director', 'director', false],
  ]) {
    fs.writeFileSync(path.join(d, '.kit-rol'), `${rol}\n`);
    const s = ag.sesionDeAgente(d);
    assert.equal(s.rol, esperado, rol);
    assert.equal(s.agente, agente, rol);
  }
  fs.rmSync(path.join(d, '.kit-rol'));
  assert.equal(ag.sesionDeAgente(d).agente, false);
  assert.deepEqual(ag.ROLES_AGENTE, ['obrero', 'nocturno', 'desconocido']);
});

test('un worktree en .claude/worktrees/: enlace ok, principal = el de afuera; la rama de obrero lo hace agente aunque no haya .kit-rol', () => {
  const d = repo();
  const w = worktree(d, 'modulo/pagos--7');
  const s = ag.sesionDeAgente(w);
  assert.equal(s.agente, true);
  assert.equal(s.rol, 'humano');
  assert.equal(s.rama, 'modulo/pagos--7');
  assert.equal(s.enlace, 'ok');
  assert.ok(ag.mismaRuta(s.raiz, w));
  assert.ok(ag.mismaRuta(s.principal, d));
  assert.ok(ag.mismaRuta(s.comun, path.join(d, '.git')));
  // la rama de director no es agente; con .kit-rol obrero, sí
  const wd = worktree(d, 'modulo/pagos');
  assert.equal(ag.sesionDeAgente(wd).agente, false);
  fs.writeFileSync(path.join(wd, '.kit-rol'), 'obrero\n');
  assert.equal(ag.sesionDeAgente(wd).agente, true);
});

test('un worktree fuera de .claude/worktrees/ (carpeta hermana): enlace ok, principal por el git-dir común', () => {
  const d = repo();
  const w = worktree(d, 'otra', path.join(carpeta('hermana'), 'wt'));
  const s = ag.sesionDeAgente(w);
  assert.equal(s.enlace, 'ok');
  assert.ok(ag.mismaRuta(s.principal, d));
  assert.equal(s.agente, false);
});

test('enlace roto: .git que apunta a otro repo, .git ilegible, y un clon adentro de .claude/worktrees/', () => {
  const d = repo();
  const otro = repo();
  const wOtro = worktree(otro, 'modulo/x--1');
  // un worktree de `d` cuyo .git se reescribe para apuntar al worktree del otro repo
  const w = worktree(d, 'modulo/y--2');
  const gitOtro = fs.readFileSync(path.join(wOtro, '.git'), 'utf8');
  pisar(path.join(w, '.git'), gitOtro);
  assert.equal(ag.sesionDeAgente(w).enlace, 'roto');
  // apuntando directo al .git del principal
  const w2 = worktree(d, 'modulo/z--3');
  pisar(path.join(w2, '.git'), `gitdir: ${path.join(d, '.git')}\n`);
  assert.equal(ag.sesionDeAgente(w2).enlace, 'roto');
  // basura
  const w3 = worktree(d, 'modulo/q--4');
  pisar(path.join(w3, '.git'), 'esto no es un gitdir\n');
  const s3 = ag.sesionDeAgente(w3);
  assert.equal(s3.enlace, 'roto');
  assert.equal(s3.agente, false); // sin rama legible ni .kit-rol: la rama no se sabe
  fs.writeFileSync(path.join(w3, '.kit-rol'), 'obrero\n');
  assert.equal(ag.sesionDeAgente(w3).agente, true);
  // un clon (con .git carpeta) adentro de .claude/worktrees/
  const clon = path.join(d, '.claude', 'worktrees', 'clon');
  fs.mkdirSync(clon, { recursive: true });
  g(clon, 'init', '-q', '-b', 'main');
  const sc = ag.sesionDeAgente(clon);
  assert.equal(sc.enlace, 'roto');
  assert.ok(ag.mismaRuta(sc.raiz, clon));
});

test('enlace roto: el commondir del worktree reescrito para apuntar al .git de otro repo', () => {
  const d = repo();
  const otro = repo();
  const w = worktree(d, 'modulo/c--5');
  assert.equal(ag.sesionDeAgente(w).enlace, 'ok');
  const gitDir = fs.readFileSync(path.join(w, '.git'), 'utf8').replace(/^gitdir:\s*/, '').trim();
  pisar(path.join(path.resolve(w, gitDir), 'commondir'), `${path.join(otro, '.git')}\n`);
  const s = ag.sesionDeAgente(w);
  assert.equal(s.enlace, 'roto');
  assert.ok(ag.mismaRuta(s.comun, path.join(otro, '.git')));
});

test('nunca tira: un cwd que no es una ruta da la sesión vacía, no de agente', () => {
  for (const x of [{}, 5]) {
    const s = ag.sesionDeAgente(x);
    assert.equal(s.agente, false);
    assert.equal(s.raiz, null);
  }
});

test('HEAD suelto: rama null, no es obrero por la rama', () => {
  const d = repo();
  const w = worktree(d, 'modulo/a--1');
  g(w, 'checkout', '-q', '--detach');
  const s = ag.sesionDeAgente(w);
  assert.equal(s.rama, null);
  assert.equal(s.agente, false);
});

test('dentroDe y mismaRuta: resuelven y, en Windows, sin mayúsculas', () => {
  const d = carpeta('rutas');
  assert.ok(ag.dentroDe(path.join(d, 'a', 'b'), d));
  assert.ok(ag.dentroDe(d, d));
  assert.ok(!ag.dentroDe(path.dirname(d), d));
  assert.ok(!ag.dentroDe(`${d}-hermana`, d));
  assert.ok(!ag.dentroDe(null, d));
  assert.ok(ag.mismaRuta(path.join(d, 'a', '..'), d));
  if (process.platform === 'win32') {
    assert.ok(ag.mismaRuta(d.toUpperCase(), d));
    assert.ok(ag.dentroDe(path.join(d.toUpperCase(), 'x'), d));
  }
});
