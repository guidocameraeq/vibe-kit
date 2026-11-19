'use strict';
// dueno.cjs — la cuenta de Windows dueña de cada archivo (SPEC-G1-buzon, §7.2 y `verificar`; red team 12).
// Node no la da (fs.stat trae uid 0 en Windows). En el hook: `dir /q` de cmd, una vez por carpeta (90-370 ms). Fuera del hook
// (leer, registrar, medir): PowerShell Get-Acl en lote para lo que `dir /q` no resolvió (0,5-2 s).
//
// `dir /q` se lee por COLUMNA: el dueño ocupa los 23 caracteres que van justo antes del nombre del archivo (22 del nombre de la
// cuenta y un espacio). Se toma el renglón que termina en " <nombre>" y se corta por posición, así un archivo cuyo nombre trae una
// cuenta conocida no la hace pasar por dueña. Una cuenta de 22 caracteres o más (dir /q corta ahí), una con caracteres fuera del
// ASCII imprimible (la página de códigos de la consola los cambia) o un renglón que no se entiende → null (pendiente).
const { spawnSync } = require('child_process');

const ANCHO = 23;
const WIN = process.platform === 'win32';
const RE_ASCII = /^[\x21-\x7e]+$/;

// La salida de `dir /q` (texto) y los nombres buscados → Map nombre → cuenta | null
function leerDirQ(salida, nombres) {
  const renglones = String(salida).split(/\r?\n/);
  const out = new Map();
  for (const nombre of nombres) {
    let cuenta = null;
    const fin = ` ${nombre}`;
    const hallados = renglones.filter((r) => r.endsWith(fin) && r.length >= nombre.length + ANCHO + 2);
    if (hallados.length === 1) {
      const r = hallados[0];
      const corte = r.length - nombre.length;
      const campo = r.slice(corte - ANCHO, corte);
      const antes = r.charAt(corte - ANCHO - 1);
      const c = campo.trimEnd();
      // el campo termina en espacio, lo anterior es la columna del tamaño (un espacio o un dígito) y la cuenta entra entera
      if (campo.endsWith(' ') && /[\s\d.,]/.test(antes) && c.length > 0 && c.length < ANCHO - 1 && !c.startsWith(' ') && RE_ASCII.test(c.replace(/ /g, '_')) && cuentaUsable(c)) cuenta = c;
    }
    out.set(nombre, cuenta);
  }
  return out;
}

// La carpeta tiene que poder ir entre comillas sin que cmd interprete nada
const rutaSegura = (d) => typeof d === 'string' && d.length > 0 && !/["%!^&|<>\r\n]/.test(d);

function dirQ(dir, nombres, { tiempo = 3000 } = {}) {
  const vacio = new Map(nombres.map((n) => [n, null]));
  if (!WIN || !rutaSegura(dir) || !nombres.length) return vacio;
  const r = spawnSync('cmd.exe', ['/d', '/s', '/c', `"dir /q /a-d "${dir}""`], {
    encoding: 'latin1',
    timeout: tiempo,
    windowsHide: true,
    windowsVerbatimArguments: true,
  });
  if (r.error || r.status !== 0) return vacio;
  return leerDirQ(r.stdout, nombres);
}

// PowerShell en lote: la carpeta va por variable de entorno (nunca dentro del comando)
const PS = [
  '[Console]::OutputEncoding = [Text.Encoding]::UTF8',
  "Get-ChildItem -LiteralPath $env:KIT_BUZON_DIR -File -Force | ForEach-Object { try { $_.Name + [char]9 + (Get-Acl -LiteralPath $_.FullName).Owner } catch { } }",
].join('; ');
function powershell(dir, nombres, { tiempo = 20000 } = {}) {
  const out = new Map(nombres.map((n) => [n, null]));
  if (!WIN || !nombres.length) return out;
  const r = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', PS], {
    encoding: 'utf8',
    timeout: tiempo,
    windowsHide: true,
    env: { ...process.env, KIT_BUZON_DIR: dir },
  });
  if (r.error || r.status !== 0) return out;
  const buscados = new Set(nombres);
  for (const renglon of String(r.stdout).split(/\r?\n/)) {
    const i = renglon.indexOf('\t');
    if (i < 0) continue;
    const nombre = renglon.slice(0, i);
    const cuenta = renglon.slice(i + 1).trim();
    if (buscados.has(nombre) && cuentaUsable(cuenta)) out.set(nombre, cuenta);
  }
  return out;
}

// La función que usa el buzón (las pruebas la reemplazan): (dir, nombres, { enHook }) → Map nombre → cuenta | null
function duenos(dir, nombres, { enHook = false } = {}) {
  const m = dirQ(dir, nombres);
  if (enHook) return m;
  const faltan = nombres.filter((n) => m.get(n) == null);
  if (faltan.length) for (const [n, c] of powershell(dir, faltan)) if (c) m.set(n, c);
  return m;
}

// La cuenta de esta sesión (el whoami de Windows: DOMINIO\cuenta; el del PATH puede ser el de Git, que da solo el usuario)
function cuentaDeSesion() {
  if (!WIN) return null;
  const sistema = process.env.SystemRoot || process.env.SYSTEMROOT || 'C:\\Windows';
  const r = spawnSync(require('path').join(sistema, 'System32', 'whoami.exe'), [], { encoding: 'utf8', timeout: 5000, windowsHide: true });
  return r.status === 0 ? String(r.stdout).trim() : null;
}

// Una cuenta que se puede usar para verificar: DOMINIO\cuenta, sin los "..." de dir /q cuando no resuelve, sin un SID suelto y sin
// las del sistema (red team de la construcción, 10: con "..." todas las cuentas sin resolver eran la misma)
const B = String.fromCharCode(92);
function cuentaUsable(c) {
  if (typeof c !== 'string') return false;
  const i = c.indexOf(B);
  if (i <= 0 || i === c.length - 1 || c.indexOf(B, i + 1) >= 0) return false;
  const dom = c.slice(0, i).toUpperCase();
  if (c.includes('...') || /^S-1-/i.test(c) || /^O:/i.test(c)) return false;
  return !['NT AUTHORITY', 'BUILTIN', 'NT SERVICE', 'AUTORIDAD NT', 'WINDOW MANAGER', 'FONT DRIVER HOST'].includes(dom);
}
// comparar dos cuentas: el nombre entero, sin distinguir mayúsculas (así las compara Windows)
const mismaCuenta = (a, b) => typeof a === 'string' && typeof b === 'string' && a.length > 0 && a.toLowerCase() === b.toLowerCase();

module.exports = { cuentaUsable, leerDirQ, dirQ, powershell, duenos, cuentaDeSesion, mismaCuenta, rutaSegura, ANCHO };
