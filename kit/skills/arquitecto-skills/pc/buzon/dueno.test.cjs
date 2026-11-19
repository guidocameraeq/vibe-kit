'use strict';
// dueno.test.cjs — la cuenta dueña con dir /q, leída por columna (SPEC-G1-buzon, `verificar`; red team 12). Las de Windows corren
// sobre un archivo propio en el temporal; fuera de Windows se saltean diciendo por qué.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const D = require('./dueno.cjs');

const WIN = process.platform === 'win32';
const B = String.fromCharCode(92);
const renglon = (cuenta, nombre, tam = '2') => `19/11/2026  13:35 ${tam.padStart(17)} ${cuenta.padEnd(23)}${nombre}`;

test('dir /q por columna: el dueño entero; uno de 22 o más → pendiente; un nombre de archivo con una cuenta adentro no la toma', () => {
  const salida = [
    ' Directorio de X:\\buzon',
    '',
    renglon(`PC1${B}ana`, 'a.json'),
    renglon(`DOMINIO${B}cuentalarguisima1234`, 'b.json'), // 22 caracteres: dir /q pudo cortarla
    renglon(`PC1${B}ana`, `PC2${B}juan c.json`),
    renglon(`PC2${B}juan`, 'con espacio final .json'),
    'basura sin columnas d.json',
  ].join('\r\n');
  const m = D.leerDirQ(salida, ['a.json', 'b.json', `PC2${B}juan c.json`, 'c.json', 'con espacio final .json', 'd.json', 'falta.json']);
  assert.equal(m.get('a.json'), `PC1${B}ana`);
  assert.equal(m.get('b.json'), null);
  assert.equal(m.get(`PC2${B}juan c.json`), `PC1${B}ana`);
  // "c.json" no es el archivo que termina en "juan c.json" con la columna de otro
  assert.equal(m.get('c.json'), null);
  assert.equal(m.get('con espacio final .json'), `PC2${B}juan`);
  assert.equal(m.get('d.json'), null);
  assert.equal(m.get('falta.json'), null);
});

test('dir /q: una cuenta con caracteres fuera del ASCII → pendiente (la consola los cambia)', () => {
  const m = D.leerDirQ(renglon(`PC1${B}nuñez`, 'a.json'), ['a.json']);
  assert.equal(m.get('a.json'), null);
});

test('una carpeta con caracteres que cmd interpreta no se pasa a dir /q', () => {
  for (const malo of ['C:/x"&calc', 'C:/x%PATH%', 'C:/a|b', 'C:/a^b', '']) assert.equal(D.rutaSegura(malo), false, malo);
  assert.equal(D.rutaSegura('P:/8_IMPL/_buzon'), true);
});

test('un archivo propio: el dueño de dir /q es el mismo que el de Get-Acl', { skip: !WIN && 'dir /q y Get-Acl son de Windows' }, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dueno-'));
  fs.writeFileSync(path.join(dir, 'propio.json'), '{}');
  const porDir = D.dirQ(dir, ['propio.json']).get('propio.json');
  const ps = spawnSync('powershell.exe', ['-NoProfile', '-Command', '(Get-Acl -LiteralPath $env:X).Owner'], { encoding: 'utf8', env: { ...process.env, X: path.join(dir, 'propio.json') } });
  const porAcl = ps.stdout.trim();
  if (porAcl.length >= 22) {
    assert.equal(porDir, null, 'una cuenta larga queda pendiente en dir /q');
  } else {
    assert.equal(porDir, porAcl);
  }
  assert.equal(D.powershell(dir, ['propio.json']).get('propio.json'), porAcl);
  assert.ok(D.mismaCuenta(D.duenos(dir, ['propio.json']).get('propio.json'), porAcl));
  assert.ok(D.mismaCuenta(D.cuentaDeSesion(), porAcl), 'whoami de Windows, no el de Git');
});
