'use strict';
// proceso.cjs — lo que comparten worktree.cjs y encargo.cjs para correr cosas de afuera (SPEC-paquete-5; r1-7, r1-9): cómo se
// llama a `claude` (el del PATH o, si no, el de la extensión de VS Code; la línea de terminal de worktree y la de fondo de
// `encargo autorizado`) y el vigía que corre un comando con
// plazo y, pasado el plazo, mata el ÁRBOL entero (lo hizo E3 para `integrar`; se mudó acá en E2 para no duplicarlo, sin cambiar
// lo que hace). Y la consola en la que corre todo comando de la ficha o del gate (D8r.2 t6: Git Bash en Windows) con el guardia de
// `cmd /c` / `cmd //c` (rt-2). Vive en hooks/lib/ porque lo usa el gate del encargo (`verificar`), que decide un merge; se copia byte
// a byte a arquitecto-skills/pc/lib/ (chequeo.cjs) y a arquitecto/scripts/lib/ (el sello). Node estándar, cero dependencias. Es
// .cjs a propósito: corre igual con "type": "module".

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

// ---------------------------------------------------------------- la consola de los comandos (t6, D8r2-3; rt-2)

// La ruta de bash.exe de Git, si existe (un archivo).
const esArchivo = (p) => {
  try {
    return fs.statSync(p).isFile();
  } catch (e) {
    return false;
  }
};

// `git --exec-path` (C:/Program Files/Git/mingw64/libexec/git-core) → la raíz de Git (C:/Program Files/Git), o null.
function raizDeGit(execPath) {
  const m = /^(.*)[\\/][^\\/]+[\\/]libexec[\\/]git-core[\\/]?$/i.exec(String(execPath || '').trim());
  return m && m[1] ? m[1] : null;
}

let shellCacheada;
// shellDeComandos(opciones) → la shell en la que corre todo comando de la ficha o del gate: el VIGIA (encargo, paquete, integrar),
// el setup de worktree.cjs, chequeo.cjs y el sello. En win32, el bash.exe de Git (la consola del director: un comando de la ficha
// tiene que dar lo mismo en los cuatro): CLAUDE_CODE_GIT_BASH_PATH si apunta a un archivo; si no, `<raíz de Git>/bin/bash.exe`
// sacada de `git --exec-path`. NUNCA el `bash` del PATH: puede ser el de WSL (otra máquina, otro disco). Sin Git Bash, `true`
// (cmd.exe, como antes). En el resto, `true` (la /bin/sh de siempre). Las pruebas inyectan opciones.plataforma, opciones.env y
// opciones.gitExecPath (lo que diría `git --exec-path`; null = git no anda) y opciones.existe; sin inyectar, se pregunta una vez
// por proceso.
function shellDeComandos(opciones = {}) {
  const inyectado = ['plataforma', 'env', 'gitExecPath', 'existe'].some((k) => opciones[k] !== undefined);
  if (!inyectado && shellCacheada !== undefined) return shellCacheada;
  const plataforma = opciones.plataforma || process.platform;
  let sh = true;
  if (plataforma === 'win32') {
    const env = opciones.env || process.env;
    const existe = opciones.existe || esArchivo;
    const deEnv = env.CLAUDE_CODE_GIT_BASH_PATH;
    if (deEnv && existe(deEnv)) sh = deEnv;
    else {
      let exec = opciones.gitExecPath;
      if (exec === undefined) {
        const r = spawnSync('git', ['--exec-path'], { encoding: 'utf8', timeout: 10000, windowsHide: true, env });
        exec = !r.error && r.status === 0 ? r.stdout : null;
      }
      const raiz = raizDeGit(exec);
      const bash = raiz ? path.win32.join(raiz, 'bin', 'bash.exe') : null;
      if (bash && existe(bash)) sh = bash;
    }
  }
  if (!inyectado) shellCacheada = sh;
  return sh;
}

// ¿La shell es cmd.exe? (`true` en win32 es cmd.exe; en el resto, /bin/sh.)
const esCmd = (shell, plataforma = process.platform) =>
  shell === true ? plataforma === 'win32' : typeof shell === 'string' && /(^|[\\/])cmd(\.exe)?$/i.test(shell.trim());
// ¿La shell es un bash? (Git Bash en Windows, o uno que se inyecta.)
const esBash = (shell) => typeof shell === 'string' && /(^|[\\/])(bash|sh)(\.exe)?$/i.test(shell.trim());

// Un `cmd` al principio del comando o después de && || ; | & ( — con su primer argumento.
const RE_CMD_UNA = /(^|&&|\|\||[;|&(])\s*cmd(\.exe)?\s+\/(?!\/)/i;
const RE_CMD_DOS = /(^|&&|\|\||[;|&(])\s*cmd(\.exe)?\s+\/\//i;

// comandoQueNoCorre(cmd, shell) → null, o el motivo por el que ese comando NO se corre en esa shell (rt-2): saldría verde sin
// haber corrido nada. En Git Bash, `cmd /c …` (una barra) abre un cmd interactivo que sale 0 (MSYS no traduce `/c`); ahí es
// `cmd //c`. En cmd.exe, `cmd //c …` tampoco corre nada y sale 0.
function comandoQueNoCorre(cmd, shell, plataforma = process.platform) {
  const c = String(cmd || '');
  if (esBash(shell) && RE_CMD_UNA.test(c)) return 'en Git Bash es `cmd //c` (con `cmd /c` no corre nada y daría que pasó)';
  if (esCmd(shell, plataforma) && RE_CMD_DOS.test(c)) return '`cmd //c` es de Git Bash: en cmd.exe no corre nada y daría que pasó';
  return null;
}

// ---------------------------------------------------------------- el vigía

// El vigía (otro node): corre argv[1] en una shell (argv[3]: la ruta de la shell, o 'true' / nada para la de siempre) y, pasado
// el plazo (argv[2], ms), mata el ÁRBOL entero, no solo la shell. Si no, en Windows un test colgado (un vitest en modo watch) queda
// vivo y deja tomada la carpeta. Pasado el plazo sale con 124. En Windows, que el vigía sea un node ya alcanza (libuv mete a sus
// hijos en un job que muere con él); el taskkill es por las dudas de ese detalle, y en el resto el grupo de procesos es lo que mata
// el árbol. Se llama con argsVigia(cmd, plazo, shell).
const VIGIA = [
  "const { spawn, spawnSync } = require('child_process');",
  "const win = process.platform === 'win32';",
  "const sh = process.argv[3] && process.argv[3] !== 'true' ? process.argv[3] : true;",
  "const h = spawn(process.argv[1], { shell: sh, stdio: 'inherit', windowsHide: true, detached: !win });",
  'const t = setTimeout(() => {',
  "  if (win) spawnSync('taskkill', ['/pid', String(h.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });",
  "  else { try { process.kill(-h.pid, 'SIGKILL'); } catch (e) { h.kill('SIGKILL'); } }",
  '  process.exit(124);',
  '}, Number(process.argv[2]));',
  "h.on('error', () => { clearTimeout(t); process.exit(127); });",
  "h.on('exit', (c) => { clearTimeout(t); process.exit(c === null ? 1 : c); });",
].join('\n');

// Los argumentos de node para correr `cmd` en el vigía, en `shell` (la de shellDeComandos si no se dice).
const argsVigia = (cmd, plazoMs, shell = shellDeComandos()) => ['-e', VIGIA, cmd, String(plazoMs), shell === true ? 'true' : String(shell)];

// correrConPlazo(cmd, { cwd, plazoMs, stdio, shell }) → { estado: 'verde' | 'rojo' | 'colgado' | 'no-corrio', como }: el comando en
// la shell de los comandos (shellDeComandos, o la que se inyecta), adentro del vigía, sin tuberías (la salida va a `stdio`,
// 'ignore' por defecto: el código de salida es lo que cuenta). Si comandoQueNoCorre lo niega, `no-corrio` con su motivo, sin
// correrlo.
function correrConPlazo(cmd, { cwd, plazoMs, stdio = 'ignore', shell = shellDeComandos() }) {
  const niega = comandoQueNoCorre(cmd, shell);
  if (niega) return { estado: 'no-corrio', como: niega };
  const t0 = Date.now();
  const r = spawnSync(process.execPath, argsVigia(cmd, plazoMs, shell), { cwd, stdio, windowsHide: true, timeout: plazoMs + 60000 });
  if ((r.error && r.error.code === 'ETIMEDOUT') || (r.status === 124 && Date.now() - t0 >= plazoMs)) return { estado: 'colgado', como: `no terminó en ${plazoMs >= 60000 ? `${Math.round(plazoMs / 60000)} min` : `${Math.round(plazoMs / 1000)} s`}` };
  if (r.error) return { estado: 'no-corrio', como: r.error.code || r.error.message };
  if (r.status === 127) return { estado: 'no-corrio', como: 'salida 127 (no se encontró el comando)' };
  if (r.status !== 0) return { estado: 'rojo', como: r.signal ? `señal ${r.signal}` : `salida ${r.status}` };
  return { estado: 'verde', como: 'salida 0' };
}

// ---------------------------------------------------------------- el turno de la suite (SPEC-paquete-8d B5, tracker 45, 56)

// conTurno(quien, fn[, opciones]) → lo que devuelve fn(). Un candado POR PC (una carpeta en el temporal del sistema, con quién lo
// tiene y su proceso): una corrida pesada a la vez (las pruebas de presentar, verificar, el gate de integrar, publicar, el sello).
// El que espera lo dice cada tanto; un candado de un proceso que ya no existe se toma; a los 60 min de espera sigue igual, con un
// aviso (nunca se cuelga). La espera NO cuenta en el plazo de lo que corre adentro: el plazo lo pone fn. Si el candado no se
// puede tomar por otra cosa que "está tomado" (permisos), corre igual: el turno ordena, no frena.
// opciones: { dir, esperaMaxMs, cadaMs, salida(texto), vivo(pid) } (las pruebas las inyectan).
const TURNO_DIR = () => path.join(os.tmpdir(), 'kit-turno-suite');
const TURNO_ESPERA_MAX = 60 * 60 * 1000;
const TURNO_CADA = 5000;
const TURNO_AVISO = 5 * 60 * 1000;
function procesoVivo(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return !!(e && e.code === 'EPERM');
  }
}
const dormirMs = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
function conTurno(quien, fn, opciones = {}) {
  const dir = opciones.dir || TURNO_DIR();
  const esperaMax = Number.isFinite(opciones.esperaMaxMs) ? opciones.esperaMaxMs : TURNO_ESPERA_MAX;
  const cada = Number.isFinite(opciones.cadaMs) ? opciones.cadaMs : TURNO_CADA;
  const vivo = opciones.vivo || procesoVivo;
  const decir = typeof opciones.salida === 'function' ? opciones.salida : () => {};
  const archivo = path.join(dir, 'quien.json');
  const t0 = Date.now();
  let ultimoAviso = -Infinity;
  let mio = false;
  for (;;) {
    try {
      fs.mkdirSync(dir);
      fs.writeFileSync(archivo, JSON.stringify({ quien: String(quien), pid: process.pid, desde: new Date().toISOString() }));
      mio = true;
      break;
    } catch (e) {
      if (!e || e.code !== 'EEXIST') break; // no se puede: corre sin turno
      let q = null;
      try {
        q = JSON.parse(fs.readFileSync(archivo, 'utf8'));
      } catch (e2) {
        q = null;
      }
      // Sin quien.json todavía (el otro lo está escribiendo): se espera una vuelta; uno sin dueño vivo, se toma.
      if (q && !vivo(q.pid)) {
        fs.rmSync(dir, { recursive: true, force: true });
        continue;
      }
      if (!q) {
        let viejo = false;
        try {
          viejo = Date.now() - fs.statSync(dir).mtimeMs > 60000;
        } catch (e3) {
          viejo = false;
        }
        if (viejo) {
          fs.rmSync(dir, { recursive: true, force: true });
          continue;
        }
      }
      const esperado = Date.now() - t0;
      if (esperado >= esperaMax) {
        decir(`turno: esperé ${Math.round(esperado / 60000)} min a ${q ? q.quien : 'otra corrida'}; sigo igual (nunca me cuelgo)\n`);
        break;
      }
      if (Date.now() - ultimoAviso >= TURNO_AVISO) {
        decir(`turno: espero que termine ${q ? q.quien : 'otra corrida'} (una corrida pesada a la vez en esta PC)\n`);
        ultimoAviso = Date.now();
      }
      dormirMs(cada);
    }
  }
  try {
    return fn();
  } finally {
    if (mio) {
      try {
        const q = JSON.parse(fs.readFileSync(archivo, 'utf8'));
        if (q && q.pid === process.pid) fs.rmSync(dir, { recursive: true, force: true });
      } catch (e) {
        /* ya no estaba */
      }
    }
  }
}

module.exports = { conTurno, procesoVivo, claudeEnPath, rutaGitBash, claudeDeVSCode, comandoClaude, raizDeGit, shellDeComandos, comandoQueNoCorre, VIGIA, argsVigia, correrConPlazo };
