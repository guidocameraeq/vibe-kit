'use strict';
// migrar-cambios.test.cjs — la migración de un CAMBIOS.md de archivo único al registro chico (SPEC-paquete-7 P6.8b-3). Corren con:
//   node --test kit/skills/arquitecto-skills/scripts/migrar-cambios.test.cjs
// Todo en temporales: un repo chico con un CAMBIOS.md armado acá (no depende del clon de Hermes) y git sin la config de la PC.
// Lo escrito lo juzga el `verificar` del registro (molde/hooks/lib/cambios.cjs), el mismo que corre el proyecto.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const MC = require('./migrar-cambios.cjs');
const CM = require(path.resolve(__dirname, '..', '..', '..', 'molde', 'hooks', 'lib', 'cambios.cjs'));
const SCRIPT = path.join(__dirname, 'migrar-cambios.cjs');

const T = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-migrar-cambios-test-'));
test.after(() => fs.rmSync(T, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }));
fs.writeFileSync(path.join(T, 'gitconfig-vacio'), '');
const ENV = {
  ...process.env,
  GIT_CONFIG_GLOBAL: path.join(T, 'gitconfig-vacio'),
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_AUTHOR_NAME: 'prueba',
  GIT_AUTHOR_EMAIL: 'p@kit.invalid',
  GIT_COMMITTER_NAME: 'prueba',
  GIT_COMMITTER_EMAIL: 'p@kit.invalid',
};
Object.assign(process.env, ENV); // el verificar del lib corre git en este proceso

const git = (cwd, args, env = {}) => {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', env: { ...ENV, ...env } });
  assert.equal(r.status, 0, `git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
};
const correr = (repo, ...extra) => {
  const r = spawnSync(process.execPath, [SCRIPT, '--repo', repo, ...extra], { encoding: 'utf8', env: ENV });
  return { codigo: r.status, salida: r.stdout, lineas: r.stdout.split('\n').filter(Boolean) };
};
const hash = (abs) => crypto.createHash('sha256').update(fs.readFileSync(abs)).digest('hex');
const leerCambio = (repo, id) => fs.readFileSync(path.join(repo, '.claude', 'cambios', `${id}.md`), 'utf8');

const FUENTE = 'docs/metodo/CAMBIOS.md';

// Un repo con dos commits de código (shaA, shaB) y el CAMBIOS.md commiteado con fecha de autor fija (2026-09-01).
let nRepo = 0;
function armarRepo(textoFuente) {
  const d = path.join(T, `repo-${nRepo++}`);
  fs.mkdirSync(d, { recursive: true });
  git(d, ['init', '-q', '-b', 'main']);
  fs.writeFileSync(path.join(d, 'a.txt'), 'a\n');
  git(d, ['add', 'a.txt']);
  git(d, ['commit', '-q', '-m', 'a']);
  const shaA = git(d, ['rev-parse', 'HEAD']);
  fs.writeFileSync(path.join(d, 'b.txt'), 'b\n');
  git(d, ['add', 'b.txt']);
  git(d, ['commit', '-q', '-m', 'b']);
  const shaB = git(d, ['rev-parse', 'HEAD']);
  const texto = textoFuente(shaA.slice(0, 7), shaB.slice(0, 7));
  fs.mkdirSync(path.join(d, 'docs', 'metodo'), { recursive: true });
  fs.writeFileSync(path.join(d, ...FUENTE.split('/')), texto);
  git(d, ['add', FUENTE]);
  const fecha = { GIT_AUTHOR_DATE: '2026-09-01T10:00:00-03:00', GIT_COMMITTER_DATE: '2026-09-01T10:00:00-03:00' };
  git(d, ['commit', '-q', '-m', 'cambios'], fecha);
  return { d, shaA, shaB };
}

// El CAMBIOS.md chico: índice + una sección por caso.
const fuenteChica = (a, b) => `# Cambios de método — registro

## Índice

| # | Cambio | Estado | Aplicado en |
|---|---|---|---|
| **CM-1** | Una regla aplicada | ✅ **aplicado** | \`${a}\` — skill \`obrero\` |
| **CM-2** | Un sha que no está | ✅ **aplicado** | \`abcdef1\` — \`CLAUDE.md\` |
| **CM-3** | Varios commits | ✅ **aplicado** | \`${b}\` y \`${a}\` — dos skills |
| **CM-4** | Una idea descartada | ❌ **rechazado** | — |
| **CM-5** | El "estado" aprobado y su «nombre» | 🟢 **propuesto, aprobado por el PO** el 2026-10-26 | — |
| **CM-6** | Sin fecha en el estado | 🟡 **propuesto** | — |

---

## CM-6 · Sin fecha en el estado

**Estado**: 🟡 **propuesto**, sin fecha.

**Caso de origen**: una idea.

---

## CM-5 · El "estado" aprobado y su «nombre»

**Estado**: 🟢 **propuesto, aprobado por el PO** el 2026-10-26 (pendiente de aplicar).

**Caso de origen**: algo pasó.

| Regla | Freno mecánico o regla blanda — y dónde vive | Cómo se va a saber si funcionó |
|---|---|---|
| \`aprobado\` | **Regla blanda** | Línea base: **31** |

---

## CM-4 · Una idea descartada

**Estado**: ❌ **rechazado** el 2026-10-03: el PO dijo "no hace falta", y C:\\ruta no aplica.

## CM-3 · Varios commits

**Estado**: ✅ **aplicado** en \`${b}\` y \`${a}\` (2026-10-02, \`obrero-3\`); la ficha antes, en \`fedcba9\`.

## CM-2 · Un sha que no está

**Estado**: ✅ **aplicado** en \`abcdef1\` (2026-09-30, \`obrero-2\`).

## CM-1 · Una regla aplicada

**Estado**: ✅ **aplicado** el 2026-09-21 en **\`${a}\`**. Aprobado por el PO,
pegado en la pestaña del obrero.

**Caso de origen**: una regla que no llegaba a las skills.

### Un subtítulo adentro

texto

---

*Nota al pie que es del CM-1.*
`;

test('la corrida entera: un archivo por CM, cada estado como manda el delta, y verificar en verde', () => {
  const { d, shaA, shaB } = armarRepo(fuenteChica);
  const antes = hash(path.join(d, ...FUENTE.split('/')));
  const r = correr(d);
  assert.equal(r.codigo, 0, r.salida);
  const archivos = fs.readdirSync(path.join(d, '.claude', 'cambios')).sort();
  assert.deepEqual(archivos, [
    '2026-09-01-cm-6.md',
    '2026-09-21-cm-1.md',
    '2026-09-30-cm-2.md',
    '2026-10-02-cm-3.md',
    '2026-10-03-cm-4.md',
    '2026-10-26-cm-5.md',
  ]);
  assert.deepEqual(CM.verificar(d), [], 'el verificar del registro da verde');
  assert.equal(hash(path.join(d, ...FUENTE.split('/'))), antes, 'CAMBIOS.md intacto');
  assert.match(r.salida, /Total: 6 CM — aplicado 2 · propuesto 3 · rechazado 1 · escritos 6/);
  assert.match(r.salida, /SHA que no resolvieron: CM-2 \(`abcdef1`\), CM-3 \(`fedcba9`\)/);
  assert.match(r.lineas[r.lineas.length - 1], /no se tocó: retirarlo/);

  // CM-1: aplicado con el SHA completo; la cabecera de D7-5; la nota al pie y el ### quedan en el caso citado.
  const uno = CM.leer(leerCambio(d, '2026-09-21-cm-1'));
  assert.deepEqual(uno.datos, {
    estado: 'aplicado',
    clase: '2',
    toca: ['metodo'],
    origen: 'CAMBIOS.md CM-1 (migrado)',
    cicatriz: 'no',
    chico: 'no',
    urgente: 'no',
    sha: shaA,
  });
  assert.equal(CM.reglaEnUnaLinea(uno.cuerpo), 'Una regla aplicada');
  assert.match(uno.cuerpo, /^> ### Un subtítulo adentro$/m);
  assert.match(uno.cuerpo, /^> \*Nota al pie que es del CM-1\.\*$/m);
  assert.match(uno.cuerpo, /## Dónde vive\n\n`[0-9a-f]{7}` — skill `obrero`\n/);
  assert.match(uno.cuerpo, new RegExp(`## Medición\n\n${MC.SIN_MEDIR.replace(/[()]/g, '\\$&')}`));
});

test('RF-fix rf-5: un SHA colgado (rama borrada, sigue en el reflog) resuelve con rev-parse pero no está en main → propuesto con la nota', () => {
  let colgado = null;
  const { d, shaA } = armarRepo((a) => `# Cambios

## CM-1 · Aplicado en una rama que se borró

**Estado**: ✅ **aplicado** en \`COLGADO\` (2026-09-21).

## CM-2 · Aplicado en main, con otro colgado de yapa

**Estado**: ✅ **aplicado** en \`${a}\` y \`COLGADO\` (2026-09-22).
`);
  // el commit en una rama que después se borra: rev-parse lo sigue encontrando (objeto suelto, reflog), pero no es de main
  git(d, ['checkout', '-q', '-b', 'efimera']);
  fs.writeFileSync(path.join(d, 'c.txt'), 'c\n');
  git(d, ['add', 'c.txt']);
  git(d, ['commit', '-q', '-m', 'c, en una rama que se borra']);
  colgado = git(d, ['rev-parse', 'HEAD']);
  git(d, ['checkout', '-q', 'main']);
  git(d, ['branch', '-q', '-D', 'efimera']);
  assert.equal(git(d, ['rev-parse', '--verify', '-q', `${colgado.slice(0, 7)}^{commit}`]), colgado, 'rev-parse lo resuelve igual');
  const f = path.join(d, ...FUENTE.split('/'));
  fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replace(/COLGADO/g, colgado.slice(0, 7)));
  git(d, ['add', FUENTE]);
  git(d, ['commit', '-q', '-m', 'cita el colgado']);
  const r = correr(d);
  assert.equal(r.codigo, 0, r.salida);
  const uno = CM.leer(leerCambio(d, '2026-09-21-cm-1'));
  assert.equal(uno.datos.estado, 'propuesto');
  assert.equal(uno.datos.sha, undefined);
  assert.match(uno.cuerpo, new RegExp(`lo da por aplicado en \`${colgado.slice(0, 7)}\`, pero ese commit no está en main \\(commit colgado: rama borrada o reflog\\)\\. Nunca un \`aplicado\` falso`));
  const dos = CM.leer(leerCambio(d, '2026-09-22-cm-2'));
  assert.equal(dos.datos.estado, 'aplicado');
  assert.equal(dos.datos.sha, shaA);
  assert.match(dos.cuerpo, new RegExp(`Otros commits de la línea de Estado: \`${colgado.slice(0, 7)}\` \\(no está en main \\(commit colgado: rama borrada o reflog\\)\\)\\.`));
  assert.deepEqual(CM.verificar(d), []);
  assert.match(r.salida, new RegExp(`SHA que no resolvieron: CM-1 \\(\`${colgado.slice(0, 7)}\`\\), CM-2 \\(\`${colgado.slice(0, 7)}\`\\)`));
});

test('un SHA que no resuelve → propuesto y el cuerpo lo dice (nunca un aplicado falso)', () => {
  const { d } = armarRepo(fuenteChica);
  assert.equal(correr(d).codigo, 0);
  const c = CM.leer(leerCambio(d, '2026-09-30-cm-2'));
  assert.equal(c.datos.estado, 'propuesto');
  assert.equal(c.datos.sha, undefined);
  assert.match(c.cuerpo, /lo da por aplicado en `abcdef1`, pero ese commit no está en este repo/);
});

test('varios SHA: el primero completo a la cabecera, los otros al cuerpo (el que no resuelve, dicho)', () => {
  const { d, shaA, shaB } = armarRepo(fuenteChica);
  assert.equal(correr(d).codigo, 0);
  const c = CM.leer(leerCambio(d, '2026-10-02-cm-3'));
  assert.equal(c.datos.estado, 'aplicado');
  assert.equal(c.datos.sha, shaB);
  assert.match(c.cuerpo, new RegExp(`Otros commits de la línea de Estado: \`${shaA}\`, \`fedcba9\` \\(no está en este repo\\)`));
});

test('rechazado → con el motivo de la línea, sin comillas dobles ni barras (la gramática no escapa)', () => {
  const { d } = armarRepo(fuenteChica);
  assert.equal(correr(d).codigo, 0);
  const c = CM.leer(leerCambio(d, '2026-10-03-cm-4'));
  assert.equal(c.datos.estado, 'rechazado');
  assert.equal(c.datos.motivo, '❌ rechazado el 2026-10-03: el PO dijo «no hace falta», y C:/ruta no aplica.');
  assert.ok(CM.textoValido(c.datos.motivo));
});

test('"propuesto, aprobado por el PO" → propuesto, con la línea original y la tabla de medición; el título con comillas va entero a Regla', () => {
  const { d } = armarRepo(fuenteChica);
  assert.equal(correr(d).codigo, 0);
  const c = CM.leer(leerCambio(d, '2026-10-26-cm-5'));
  assert.equal(c.datos.estado, 'propuesto');
  assert.equal(c.datos.origen, 'CAMBIOS.md CM-5 (migrado)');
  assert.match(c.cuerpo, /Estado en CAMBIOS\.md: 🟢 \*\*propuesto, aprobado por el PO\*\* el 2026-10-26/);
  assert.equal(CM.reglaEnUnaLinea(c.cuerpo), 'El "estado" aprobado y su «nombre»');
  assert.match(c.cuerpo, /## Medición\n\n\| Regla \| Freno mecánico o regla blanda — y dónde vive \| Cómo se va a saber si funcionó \|\n\|---\|---\|---\|\n\| `aprobado` \|/);
});

test('sin fecha en el Estado → la del commit que agregó la sección (git log -S)', () => {
  const { d } = armarRepo(fuenteChica);
  assert.equal(correr(d).codigo, 0);
  assert.ok(fs.existsSync(path.join(d, '.claude', 'cambios', '2026-09-01-cm-6.md')));
});

test('idempotente: repetido → "sin cambios" (también con --plan), y --plan no escribe', () => {
  const { d } = armarRepo(fuenteChica);
  const p = correr(d, '--plan');
  assert.equal(p.codigo, 0);
  assert.match(p.salida, /escribiría 6/);
  assert.ok(!fs.existsSync(path.join(d, '.claude', 'cambios')), '--plan no escribe');
  assert.equal(correr(d).codigo, 0);
  const otra = correr(d);
  assert.equal(otra.codigo, 0);
  assert.match(otra.salida, /escritos 0 · sin cambios 6/);
  const plan = correr(d, '--plan');
  assert.equal(plan.codigo, 0);
  assert.ok(plan.lineas.includes('sin cambios'), plan.salida);
});

test('no pisa un archivo distinto ni el mismo CM con otro id: lo informa y sale 1, los demás igual', () => {
  const { d } = armarRepo(fuenteChica);
  assert.equal(correr(d).codigo, 0);
  const dir = path.join(d, '.claude', 'cambios');
  const a1 = path.join(dir, '2026-09-21-cm-1.md');
  fs.appendFileSync(a1, 'editado a mano\n');
  const editado = fs.readFileSync(a1, 'utf8');
  fs.renameSync(path.join(dir, '2026-09-30-cm-2.md'), path.join(dir, '2026-01-01-cm-2.md'));
  fs.rmSync(path.join(dir, '2026-10-03-cm-4.md'));
  const r = correr(d);
  assert.equal(r.codigo, 1, r.salida);
  assert.match(r.salida, /CM-1 · 2026-09-21-cm-1 · aplicado · ya está y es distinto: no lo piso/);
  assert.match(r.salida, /CM-2 · 2026-09-30-cm-2 · propuesto · SHA sin resolver: abcdef1 · ya está como 2026-01-01-cm-2: no lo piso/);
  assert.equal(fs.readFileSync(a1, 'utf8'), editado);
  assert.ok(!fs.existsSync(path.join(dir, '2026-09-30-cm-2.md')));
  assert.ok(fs.existsSync(path.join(dir, '2026-10-03-cm-4.md')), 'el que faltaba se escribe igual');
});

test('--commit: un commit por rutas, solo lo que escribió (lo que había en el índice queda afuera)', () => {
  const { d } = armarRepo(fuenteChica);
  fs.writeFileSync(path.join(d, 'ajeno.txt'), 'de otra sesión\n');
  git(d, ['add', 'ajeno.txt']);
  const r = correr(d, '--commit');
  assert.equal(r.codigo, 0, r.salida);
  assert.match(r.salida, /commit: [0-9a-f]+ "cambios: CAMBIOS\.md migrado a \.claude\/cambios\/ \(6 CM\)" \(por rutas, 6 archivos\)/);
  const tocados = git(d, ['show', '--name-only', '--format=', 'HEAD']).split('\n').sort();
  assert.equal(tocados.length, 6);
  assert.ok(tocados.every((x) => /^\.claude\/cambios\/\d{4}-\d{2}-\d{2}-cm-\d+\.md$/.test(x)), tocados.join(', '));
  assert.equal(git(d, ['diff', '--cached', '--name-only']), 'ajeno.txt', 'lo ajeno sigue en el índice, sin commitear');
  const otra = correr(d, '--commit');
  assert.equal(otra.codigo, 0);
  assert.match(otra.salida, /commit: nada nuevo que commitear/);
});

test('una cabecera de CM que no se lee → sale 1 y los demás se escriben igual', () => {
  const { d } = armarRepo((a, b) => `${fuenteChica(a, b)}\n## CM-7 sin el punto del medio\n\n**Estado**: 🟡 **propuesto**.\n`);
  const r = correr(d);
  assert.equal(r.codigo, 1, r.salida);
  assert.match(r.salida, /## CM-7 sin el punto del medio · no se pudo leer/);
  assert.match(r.salida, /Total: 7 CM .* escritos 6 .* no se pudieron leer 1/);
});

test('mal llamado → 2: sin --repo, argumento desconocido, --plan con --commit, sin la fuente, no es un repo', () => {
  const { d } = armarRepo(fuenteChica);
  const sola = (args) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8', env: ENV }).status;
  assert.equal(sola([]), 2);
  assert.equal(sola(['--repo', d, '--rapido']), 2);
  assert.equal(sola(['--repo', d, '--plan', '--commit']), 2);
  assert.equal(sola(['--repo', d, '--fuente', 'docs/NO-ESTA.md']), 2);
  const vacia = path.join(T, 'no-es-repo');
  fs.mkdirSync(vacia, { recursive: true });
  assert.equal(sola(['--repo', vacia]), 2);
});

test('clasificar: el rótulo en negrita manda, y los SHA y la fecha salen de la línea', () => {
  assert.deepEqual(MC.clasificar('✅ **aplicado** el 2026-09-23 en **`5b50379`** (las skills)'), { tipo: 'aplicado', shas: ['5b50379'], fecha: '2026-09-23' });
  assert.equal(MC.clasificar('🟢 **propuesto, aprobado por el PO** el 2026-10-26').tipo, 'propuesto');
  assert.equal(MC.clasificar('❌ **rechazado**: no').tipo, 'rechazado');
  assert.equal(MC.clasificar(null).tipo, 'propuesto');
  assert.equal(MC.clasificar('**aplicado** el 2026-02-30 en `abc1234`').fecha, null, 'una fecha que no existe no cuenta');
});
