'use strict';
// proceso.cjs — lo que comparten worktree.cjs y encargo.cjs para correr cosas de afuera (SPEC-paquete-5; r1-7, r1-9): cómo se
// llama a `claude` (el del PATH o, si no, el de la extensión de VS Code; la línea de terminal de worktree y la de fondo de
// `encargo autorizado`) y el vigía que corre un comando con
// plazo y, pasado el plazo, mata el ÁRBOL entero (lo hizo E3 para `integrar`; se mudó acá en E2 para no duplicarlo, sin cambiar
// lo que hace). Vive en hooks/lib/ porque lo usa el gate del encargo (`verificar`), que decide un merge. Node estándar, cero
// dependencias. Es .cjs a propósito: corre igual con "type": "module".

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const WIN = process.platform === 'win32';

// ¿`claude` está en el PATH? (rf-1: en la PC de Guido solo está el de la extensión de VS Code). Las pruebas lo inyectan con
// opciones.claudeEnPath; si no, `where`/`which` con su tiempo, sin colgarse. Se pregunta una vez por corrida (queda en opciones).
function claudeEnPath(opciones) {
  if (typeof opciones.claudeEnPath === 'boolean') return opciones.claudeEnPath;
  const r = spawnSync(WIN ? 'where' : 'which', ['claude'], { stdio: 'ignore', timeout: 5000, windowsHide: true });
  opciones.claudeEnPath = !r.error && r.status === 0;
  return opciones.claudeEnPath;
}

// C:\Users\x → /c/Users/x (la forma de Git Bash, la shell del director en Windows); en el resto, la ruta tal cual.
function rutaGitBash(p, win = WIN) {
  if (!win) return p;
  const s = String(p).split('\\').join('/');
  const m = /^([A-Za-z]):(\/.*)?$/.exec(s);
  return m ? `/${m[1].toLowerCase()}${m[2] || '/'}` : s;
}

// 2.1.312 contra 2.1.98, número por número.
function compararVersion(a, b) {
  const x = a.split('.').map(Number);
  const y = b.split('.').map(Number);
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const d = (x[i] || 0) - (y[i] || 0);
    if (d) return d;
  }
  return 0;
}

// El binario de la extensión de VS Code (D-b de D5.1: en la PC de Guido `claude` no está en el PATH):
// <dir>/anthropic.claude-code-<versión>[-<plataforma>]/resources/native-binary/claude(.exe), el de versión más alta que exista.
// → la ruta absoluta, o null.
function claudeDeVSCode(dir = path.join(os.homedir(), '.vscode', 'extensions'), win = WIN) {
  let nombres;
  try {
    nombres = fs.readdirSync(dir);
  } catch (e) {
    return null;
  }
  const binario = win ? 'claude.exe' : 'claude';
  const hallados = [];
  for (const n of nombres) {
    const m = /^anthropic\.claude-code-(\d+(?:\.\d+)*)(?:-.+)?$/.exec(n);
    if (!m) continue;
    const ruta = path.join(dir, n, 'resources', 'native-binary', binario);
    if (fs.existsSync(ruta)) hallados.push({ version: m[1], ruta });
  }
  hallados.sort((a, b) => compararVersion(b.version, a.version));
  return hallados.length ? hallados[0].ruta : null;
}

// comandoClaude(opciones) → cómo se llama a claude en una línea: 'claude' si está en el PATH; si no, el binario de la extensión de
// VS Code entre comillas ("/c/…/claude.exe" en Windows, para Git Bash); si no hay ninguno, null ("la apertura es de Guido").
// Las pruebas inyectan opciones.claudeEnPath (y, para buscar la extensión, opciones.dirExtensiones): con claudeEnPath inyectado y
// sin dirExtensiones, no se mira el disco de la PC. Se pregunta una vez por corrida (queda en opciones.comandoClaude).
function comandoClaude(opciones) {
  if (opciones.comandoClaude !== undefined) return opciones.comandoClaude;
  const inyectado = typeof opciones.claudeEnPath === 'boolean';
  let c = null;
  if (claudeEnPath(opciones)) c = 'claude';
  else if (typeof opciones.dirExtensiones === 'string' || !inyectado) {
    const bin = typeof opciones.dirExtensiones === 'string' ? claudeDeVSCode(opciones.dirExtensiones) : claudeDeVSCode();
    if (bin) c = `"${rutaGitBash(bin)}"`;
  }
  opciones.comandoClaude = c;
  return c;
}

// El vigía (otro node): corre argv[1] en una shell y, pasado el plazo (argv[2], ms), mata el ÁRBOL entero, no solo la shell. Si
// no, en Windows un test colgado (un vitest en modo watch) queda vivo y deja tomada la carpeta. Pasado el plazo sale con 124. En
// Windows, que el vigía sea un node ya alcanza (libuv mete a sus hijos en un job que muere con él); el taskkill es por las dudas de
// ese detalle, y en el resto el grupo de procesos es lo que mata el árbol.
const VIGIA = [
  "const { spawn, spawnSync } = require('child_process');",
  "const win = process.platform === 'win32';",
  "const h = spawn(process.argv[1], { shell: true, stdio: 'inherit', windowsHide: true, detached: !win });",
  'const t = setTimeout(() => {',
  "  if (win) spawnSync('taskkill', ['/pid', String(h.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });",
  "  else { try { process.kill(-h.pid, 'SIGKILL'); } catch (e) { h.kill('SIGKILL'); } }",
  '  process.exit(124);',
  '}, Number(process.argv[2]));',
  "h.on('error', () => { clearTimeout(t); process.exit(127); });",
  "h.on('exit', (c) => { clearTimeout(t); process.exit(c === null ? 1 : c); });",
].join('\n');

// correrConPlazo(cmd, { cwd, plazoMs, stdio }) → { estado: 'verde' | 'rojo' | 'colgado' | 'no-corrio', como }: el comando en una
// shell, adentro del vigía, sin tuberías (la salida va a `stdio`, 'ignore' por defecto: el código de salida es lo que cuenta).
function correrConPlazo(cmd, { cwd, plazoMs, stdio = 'ignore' }) {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, ['-e', VIGIA, cmd, String(plazoMs)], { cwd, stdio, windowsHide: true, timeout: plazoMs + 60000 });
  if ((r.error && r.error.code === 'ETIMEDOUT') || (r.status === 124 && Date.now() - t0 >= plazoMs)) return { estado: 'colgado', como: `no terminó en ${plazoMs >= 60000 ? `${Math.round(plazoMs / 60000)} min` : `${Math.round(plazoMs / 1000)} s`}` };
  if (r.error) return { estado: 'no-corrio', como: r.error.code || r.error.message };
  if (r.status === 127) return { estado: 'no-corrio', como: 'salida 127 (no se encontró el comando)' };
  if (r.status !== 0) return { estado: 'rojo', como: r.signal ? `señal ${r.signal}` : `salida ${r.status}` };
  return { estado: 'verde', como: 'salida 0' };
}

module.exports = { claudeEnPath, rutaGitBash, claudeDeVSCode, comandoClaude, VIGIA, correrConPlazo };
