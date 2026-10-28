'use strict';
// session-start.cjs — el hook de arranque del molde v3 (SPEC-paquete-2 P4.1; B §9; H §10.3, §11). Node directo, sin .sh.
// Lee la entrada JSON por stdin, imprime lo que arma lib/inyeccion.cjs, deja la marca de sesión en el git-dir propio del
// checkout y corre el hermano session-start.propio.sh con bash si existe. SALE SIEMPRE CON 0: no niega nada.
// Fallas (P4.1): ficha rota → arriba, y sigue · error interno → una línea de error, el handoff crudo (hasta 5.000 bytes) y la
// huella · sin remoto ni ficha → entero · sin git → lo dice. Es .cjs a propósito: corre igual con "type": "module".

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const ERROR_INTERNO = 'hook de arranque: error interno — corré doctor';
const RE_SESION = /^[A-Za-z0-9-]{1,128}$/;
const CARPETA_MARCAS = 'kit-sesiones';
const PROPIO = path.join(__dirname, 'session-start.propio.sh');
const TIEMPO_PROPIO = 5000;
const HANDOFF_CRUDO_BYTES = 5000;

const miles = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

function leerEntrada() {
  try {
    const t = fs.readFileSync(0, 'utf8');
    const e = t.trim() ? JSON.parse(t) : {};
    return e && typeof e === 'object' && !Array.isArray(e) ? e : {};
  } catch (err) {
    return {};
  }
}

const cwdDe = (entrada) => (entrada && typeof entrada.cwd === 'string' && entrada.cwd.trim() !== '' ? entrada.cwd : process.cwd());

// ---------------------------------------------------------------- lo propio (E §5: el hermano, al final)

// En Windows, el `bash` del PATH puede ser el de WSL (C:\Windows\System32 o WindowsApps): se prefiere el de Git for Windows.
function buscarBash() {
  if (process.platform !== 'win32') return 'bash';
  try {
    const r = spawnSync('git', ['--exec-path'], { encoding: 'utf8', timeout: 5000, windowsHide: true });
    if (r.status === 0 && r.stdout.trim()) {
      const raizGit = path.resolve(r.stdout.trim(), '..', '..', '..');
      for (const c of [path.join(raizGit, 'bin', 'bash.exe'), path.join(raizGit, 'usr', 'bin', 'bash.exe')]) {
        if (fs.existsSync(c)) return c;
      }
    }
  } catch (e) {
    /* sin git: el bash del PATH */
  }
  return 'bash';
}

// correrPropio(raiz, bash) → null (no hay) · { salida, falla } (falla: null · 'sin-bash' · 'tiempo' · 'salió con N').
function correrPropio(raiz, bash, archivo = PROPIO) {
  if (!fs.existsSync(archivo)) return null;
  const r = spawnSync(bash || buscarBash(), [archivo.split(path.sep).join('/')], {
    cwd: raiz,
    encoding: 'utf8',
    timeout: TIEMPO_PROPIO,
    windowsHide: true,
    maxBuffer: 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (r.error && r.error.code === 'ENOENT') return { salida: '', falla: 'sin-bash' };
  if ((r.error && r.error.code === 'ETIMEDOUT') || r.signal) return { salida: r.stdout || '', falla: 'tiempo' };
  if (r.error) return { salida: '', falla: String(r.error.code || 'no corrió') };
  return { salida: r.stdout || '', falla: r.status === 0 ? null : `salió con ${r.status}` };
}

// ---------------------------------------------------------------- la marca de sesión (H §11)

// <git-dir>/kit-sesiones/<session_id>, con fecha nueva. Solo [A-Za-z0-9-]: otra cosa, no se deja. → la ruta o null.
function dejarMarca(entrada, gitDir) {
  const id = entrada && entrada.session_id;
  if (typeof id !== 'string' || !RE_SESION.test(id) || !gitDir) return null;
  const dir = path.join(gitDir, CARPETA_MARCAS);
  fs.mkdirSync(dir, { recursive: true });
  const archivo = path.join(dir, id);
  fs.writeFileSync(archivo, '');
  const ahora = new Date();
  fs.utimesSync(archivo, ahora, ahora);
  return archivo;
}

// ---------------------------------------------------------------- de emergencia (error interno)

// Sin las librerías: la línea de error, el handoff crudo hasta 5.000 bytes (cortado en renglón) y la huella.
function deEmergencia(entrada) {
  const lineas = [ERROR_INTERNO];
  try {
    const cwd = cwdDe(entrada);
    let raiz = cwd;
    const env = { ...process.env };
    for (const v of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_COMMON_DIR', 'GIT_INDEX_FILE']) delete env[v];
    const r = spawnSync('git', ['rev-parse', '--show-toplevel'], { cwd, encoding: 'utf8', timeout: 5000, windowsHide: true, env });
    if (r.status === 0 && r.stdout && r.stdout.trim()) raiz = r.stdout.trim();
    let b = fs.readFileSync(path.join(raiz, 'docs', 'SESSION_HANDOFF.md'));
    let cortado = false;
    if (b.length > HANDOFF_CRUDO_BYTES) {
      b = b.subarray(0, HANDOFF_CRUDO_BYTES);
      const fin = b.lastIndexOf(0x0a);
      b = b.subarray(0, fin < 0 ? 0 : fin);
      cortado = true;
    }
    lineas.push('', b.toString('utf8').replace(/\r\n?/g, '\n').replace(/\s+$/, ''));
    if (cortado) lineas.push('… (CORTADO: sigue en docs/SESSION_HANDOFF.md)');
  } catch (e) {
    lineas.push('(no se pudo leer docs/SESSION_HANDOFF.md)');
  }
  const pre = lineas.join('\n') + '\n';
  return pre + `inyectado: ${miles(pre.length)} de 9.700`;
}

// ---------------------------------------------------------------- el hook

function principal() {
  const entrada = leerEntrada();
  let texto;
  let gitDir = null;
  try {
    const contexto = require('./lib/contexto.cjs');
    const inyeccion = require('./lib/inyeccion.cjs');
    const cwd = contexto.cwdDe(entrada);
    const g = contexto.datosGit(cwd);
    gitDir = g ? g.gitDir : null;
    const propio = correrPropio(g ? g.raiz : cwd);
    texto = inyeccion.armar({ cwd, entrada, home: os.homedir(), ahora: new Date(), propio }).texto;
  } catch (e) {
    texto = deEmergencia(entrada);
  }
  try {
    process.stdout.write(texto + '\n');
  } catch (e) {
    /* nada que hacer */
  }
  try {
    dejarMarca(entrada, gitDir);
  } catch (e) {
    /* la marca es rastro, no candado */
  }
}

if (require.main === module) {
  try {
    principal();
  } catch (e) {
    /* jamás tira */
  }
  process.exitCode = 0;
} else {
  module.exports = { ERROR_INTERNO, RE_SESION, CARPETA_MARCAS, PROPIO, buscarBash, correrPropio, dejarMarca, deEmergencia };
}
