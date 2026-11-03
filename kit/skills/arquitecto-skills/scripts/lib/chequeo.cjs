'use strict';
// chequeo.cjs — el chequeo mecánico del actualizador: las nueve líneas (SPEC-paquete-6, P7.1, "chequear"; crit. 11-12; r1-6, r1-10).
//
//   const { chequear } = require('./lib/chequeo.cjs');
//   const r = chequear(carpeta, { moldeNuevo, moldeViejo, base, plazoMs });   // SÍNCRONO: devuelve el objeto, no una Promise
//   // r = { lineas: [9 textos], ok: true|false, noVerificado: true|false, noVerificados: [ids] }
//
// Sobre <carpeta> con lo aplicado ya COMMITEADO (base..HEAD). Exactamente nueve líneas `<n>. <id> · ✅|❌ · <detalle>`, en este orden:
//   1 llaves · 2 arranque · 3 settings · 4 skills · 5 ficha · 6 barreras · 7 casos · 8 pruebas · 9 gitleaks.
// ok = ninguna ❌. Lo que no se pudo ver es ❌ con `NO VERIFICADO: <por qué>` (y noVerificado = true); un error propio de una línea
// da esa línea así y las otras ocho siguen; un error que no deja correr nada (carpeta o base que no sirven) da las nueve así.
//
// Opciones: moldeNuevo (carpeta con la forma de kit/molde/, CON sus *.test.cjs: los usa la línea 7) · moldeViejo (opcional: va a
// barreras como --molde-viejo) · moldeCrudo (opcional: el kit/molde/ del --kit sin instanciar; la línea 7 copia ESE y no moldeNuevo) · base (sha o ref) · plazoMs (de comando-test y de las pruebas de la línea 7; 30 min por defecto) ·
// version (opcional: la versión nueva; sin ella la línea 5 exige que la ficha de HEAD sea mayor que la de <base>) · gitleaks
// (opcional, para las pruebas: la ruta del ejecutable, o null = "no hay"; sin la opción se busca en el PATH y en WinGet\Links).
//
// Lo que corre afuera, siempre con plazo y sin heredar NODE_*, GITLEAKS_*, KIT_* ni las GIT_* que mueven el repo: node, git,
// gitleaks, el hook de arranque, estructura.cjs, comando-setup (si la ficha lo trae) y comando-test. El plazo lo cuida un vigía (un node aparte) que mata el árbol entero
// del colgado (taskkill /T en Windows; el grupo en el resto): un nieto que hereda la salida no deja colgado a este proceso.
// Nunca escribe en <carpeta> salvo lo que hace el propio hook de arranque (la marca de sesión en .git/) y lo que deja comando-setup
// (las dependencias); core.hooksPath, que ese hook pone si hay .githooks/, se deja como estaba. Los temporales van a os.tmpdir() y se borran al final.
// Node estándar, cero dependencias.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { leerJsonSinDuplicados } = require('../../pc/lib/zona-propia.cjs');
const ficha = require('../../pc/lib/ficha.cjs');
const { seInstancia } = require('./molde.cjs');

const IDS = ['llaves', 'arranque', 'settings', 'skills', 'ficha', 'barreras', 'casos', 'pruebas', 'gitleaks'];
const PLAZO_DEFECTO = 30 * 60 * 1000;
const PLAZO_ARRANQUE = 20000;
const PLAZO_CHECK = 20000;
const PLAZO_BARRERAS = 5 * 60 * 1000;
const PLAZO_GITLEAKS = 120000;
const TOPE_ARRANQUE = 9700;
const TOPE_SKILL = 8000;
const RUTA_FICHA = '.claude/kit.md';
const RUTA_SETTINGS = '.claude/settings.json';
const RUTA_HOOKS = '.claude/hooks/';
const SALIDA_FUGA = 7; // --exit-code de gitleaks: distinto del 1 de sus errores

// ---------------------------------------------------------------- utilidades

class NoVerificado extends Error {}
const nv = (m) => {
  throw new NoVerificado(m);
};
const bien = (detalle) => ({ ok: true, detalle });
const mal = (detalle) => ({ ok: false, detalle });
const posix = (p) => String(p).replace(/\\/g, '/');
const minutos = (ms) => (ms % 60000 === 0 ? `${ms / 60000} min` : `${Math.round(ms / 1000)} s`);
const corto = (s, n = 160) => {
  const t = String(s).replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
};

// El entorno de lo que se lanza: sin lo que mete código en node, cambia lo que ve gitleaks o mueve el repo de git.
const SACAR = /^(node_|gitleaks_|kit_)|^git_(dir|work_tree|index_file|object_directory|alternate_object_directories|common_dir|prefix|namespace|ceiling_directories|config.*)$/i;
function entorno(extra) {
  const e = {};
  for (const [k, v] of Object.entries(process.env)) if (!SACAR.test(k)) e[k] = v;
  return { ...e, ...(extra || {}) };
}

function git(args, cwd, opciones = {}) {
  const r = spawnSync('git', ['-c', 'core.quotePath=false', '-c', 'core.fsmonitor=false', ...args], {
    cwd,
    env: entorno(),
    encoding: 'buffer',
    maxBuffer: 512 * 1024 * 1024,
    timeout: opciones.plazo || 60000,
    windowsHide: true,
  });
  return {
    ok: !r.error && r.status === 0,
    status: r.status,
    salida: r.stdout || Buffer.alloc(0),
    error: r.error ? String(r.error.code || r.error.message) : (r.stderr || Buffer.alloc(0)).toString('utf8').trim(),
  };
}
const gitTexto = (args, cwd) => {
  const r = git(args, cwd);
  if (!r.ok) throw new Error(`git ${args[0]}: ${corto(r.error || `salida ${r.status}`, 120)}`);
  return r.salida.toString('utf8');
};

// El vigía: un node aparte lanza el comando con la salida a un archivo y, si pasa el plazo, mata el árbol entero. spawnSync espera
// al vigía (no a los nietos), así que un colgado nunca deja colgado a chequear.
const VIGIA = `
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const o = JSON.parse(fs.readFileSync(process.argv[1], 'utf8'));
const out = fs.openSync(o.out, 'w');
const fin = (r) => { try { fs.writeFileSync(o.res, JSON.stringify(r)); } catch (e) {} process.exit(0); };
let c;
try {
  c = spawn(o.cmd, o.args, { cwd: o.cwd, shell: o.shell, windowsHide: true, detached: process.platform !== 'win32',
    stdio: [o.entrada === null ? 'ignore' : 'pipe', out, out] });
} catch (e) { fin({ error: String(e.code || e.message) }); }
if (o.entrada !== null) { c.stdin.on('error', () => {}); c.stdin.end(o.entrada); }
let listo = false;
const t = setTimeout(() => {
  listo = true;
  if (process.platform === 'win32') spawnSync('taskkill', ['/T', '/F', '/PID', String(c.pid)], { stdio: 'ignore', windowsHide: true });
  else { try { process.kill(-c.pid, 'SIGKILL'); } catch (e) { try { c.kill('SIGKILL'); } catch (e2) {} } }
  fin({ colgado: true });
}, o.plazo);
c.on('error', (e) => { if (listo) return; listo = true; clearTimeout(t); fin({ error: String(e.code || e.message) }); });
c.on('exit', (code, sig) => { if (listo) return; listo = true; clearTimeout(t); fin({ status: code, signal: sig }); });
`;
let contador = 0;
// correr(cmd, args, {cwd, plazo, shell, entrada, env, tmp}) → { status, colgado, error, salida }
function correr(cmd, args, o) {
  const id = `c${++contador}`;
  const archivos = { out: path.join(o.tmp, `${id}.out`), res: path.join(o.tmp, `${id}.res`), cfg: path.join(o.tmp, `${id}.json`) };
  const cfg = { cmd, args, cwd: o.cwd, shell: !!o.shell, entrada: o.entrada === undefined ? null : o.entrada, plazo: o.plazo, out: archivos.out, res: archivos.res };
  fs.writeFileSync(archivos.cfg, JSON.stringify(cfg));
  const r = spawnSync(process.execPath, ['-e', VIGIA, archivos.cfg], { env: o.env || entorno(), stdio: 'ignore', timeout: o.plazo + 30000, windowsHide: true });
  let res = null;
  try {
    res = JSON.parse(fs.readFileSync(archivos.res, 'utf8'));
  } catch (e) {
    res = { error: r.error ? `vigía: ${r.error.code || r.error.message}` : 'vigía: sin resultado' };
  }
  let salida = '';
  try {
    salida = fs.readFileSync(archivos.out).toString('utf8');
  } catch (e) {
    salida = '';
  }
  return { status: res.status === undefined ? null : res.status, colgado: !!res.colgado, error: res.error || null, salida };
}

function archivosDe(dir, rel = '') {
  const out = [];
  let entradas;
  try {
    entradas = fs.readdirSync(path.join(dir, rel), { withFileTypes: true });
  } catch (e) {
    return out;
  }
  for (const e of entradas.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
    const q = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...archivosDe(dir, q));
    else if (e.isFile()) out.push(q);
  }
  return out;
}

// ---------------------------------------------------------------- el diff de base..HEAD (líneas 1 y 9)

// "+++ b/ruta", "+++ /dev/null" o entre comillas a lo C. → la ruta (utf8) o null.
function rutaDelDiff(s) {
  s = s.replace(/\t$/, '');
  if (s === '/dev/null') return null;
  if (s.startsWith('"')) {
    if (!s.endsWith('"') || s.length < 2) throw new Error('no entendí el diff de git (una ruta entre comillas rota)');
    const ESC = { a: '\x07', b: '\b', t: '\t', n: '\n', v: '\v', f: '\f', r: '\r', '"': '"', '\\': '\\' };
    s = s.slice(1, -1).replace(/\\([0-7]{3}|.)/g, (_, c) => (c.length === 3 ? String.fromCharCode(parseInt(c, 8)) : ESC[c] !== undefined ? ESC[c] : c));
  }
  if (!s.startsWith('b/')) throw new Error('no entendí el diff de git (una ruta sin b/)');
  return Buffer.from(s.slice(2), 'latin1').toString('utf8');
}

// Las líneas agregadas de un diff -U0 entre dos árboles (texto en latin1: un char = un byte). → [{ archivo, linea, texto }]
function agregadas(texto) {
  const out = [];
  let archivo = null;
  let quedan = 0;
  let nueva = 0;
  for (const l of texto.split('\n')) {
    // Dentro de un bloque (-U0) solo hay +, - y "\ No newline": "diff ", "+++ " y "@@ " son cabeceras.
    if (l.startsWith('diff ')) {
      archivo = null;
      quedan = 0;
    } else if (quedan === 0 && l.startsWith('+++ ')) archivo = rutaDelDiff(l.slice(4));
    else if (l.startsWith('@@ ')) {
      const m = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/.exec(l);
      if (!m) throw new Error('no entendí el diff de git (un encabezado de bloque raro)');
      nueva = Number(m[1]);
      quedan = m[2] === undefined ? 1 : Number(m[2]);
    } else if (quedan > 0 && l.startsWith('+')) {
      if (archivo !== null) out.push({ archivo, linea: nueva, texto: l.slice(1).replace(/\r$/, '') });
      nueva++;
      quedan--;
    }
  }
  return out;
}

function diffDe(ctx) {
  if (!ctx.diff) {
    const r = git(['-c', 'diff.noprefix=false', 'diff', '--text', '--no-textconv', '--no-ext-diff', '--no-color', '--no-renames', '-U0', '--src-prefix=a/', '--dst-prefix=b/', ctx.base, 'HEAD', '--'], ctx.carpeta);
    if (!r.ok) throw new Error(`git diff: ${corto(r.error || `salida ${r.status}`, 120)}`);
    ctx.diff = agregadas(r.salida.toString('latin1'));
  }
  return ctx.diff;
}

// [{ estado, ruta }] de base..HEAD (sin renombres), con rutas utf8.
function cambiados(ctx, ...rutas) {
  const r = git(['diff', '--name-status', '--no-renames', '-z', ctx.base, 'HEAD', '--', ...rutas], ctx.carpeta);
  if (!r.ok) throw new Error(`git diff --name-status: ${corto(r.error || `salida ${r.status}`, 120)}`);
  const p = r.salida.toString('utf8').split('\0');
  const out = [];
  for (let i = 0; i + 1 < p.length; i += 2) if (p[i]) out.push({ estado: p[i][0], ruta: p[i + 1] });
  return out;
}

// ---------------------------------------------------------------- 1. llaves

const RE_LLAVE = /\{\{(?!LINEAS:\d+\}\})/;
function llaves(ctx) {
  const sueltas = [];
  for (const a of diffDe(ctx)) {
    if (a.archivo.split('/').includes('_fuente')) continue;
    // solo lo que el molde instancia (.md/.json): un {{ en un .cjs (p. ej. las plantillas de portada.cjs) es suyo a propósito
    if (!seInstancia(a.archivo)) continue;
    if (RE_LLAVE.test(Buffer.from(a.texto, 'latin1').toString('utf8'))) sueltas.push(`${a.archivo}:${a.linea}`);
  }
  if (!sueltas.length) return bien('ningún {{ suelto en lo que trajo el molde');
  return mal(`{{ suelto en ${sueltas.slice(0, 5).join(', ')}${sueltas.length > 5 ? ` y ${sueltas.length - 5} más` : ''}`);
}

// ---------------------------------------------------------------- 2. arranque

function arranque(ctx) {
  const hook = path.join(ctx.carpeta, '.claude', 'hooks', 'session-start.cjs');
  if (!fs.existsSync(hook)) return mal('no está .claude/hooks/session-start.cjs');
  const antes = git(['config', '--local', '--get', 'core.hooksPath'], ctx.carpeta);
  let r;
  try {
    r = correr(process.execPath, [hook], {
      cwd: ctx.carpeta,
      plazo: PLAZO_ARRANQUE,
      entrada: JSON.stringify({ cwd: ctx.carpeta, hook_event_name: 'SessionStart' }),
      env: entorno({ CLAUDE_PROJECT_DIR: ctx.carpeta }),
      tmp: ctx.tmp,
    });
  } finally {
    // El hook pone core.hooksPath si hay .githooks/: chequear no cambia la configuración del clon.
    const despues = git(['config', '--local', '--get', 'core.hooksPath'], ctx.carpeta);
    const v0 = antes.ok ? antes.salida.toString('utf8').trim() : null;
    const v1 = despues.ok ? despues.salida.toString('utf8').trim() : null;
    if (v0 !== v1) {
      if (v0 === null) git(['config', '--local', '--unset-all', 'core.hooksPath'], ctx.carpeta);
      else git(['config', '--local', 'core.hooksPath', v0], ctx.carpeta);
    }
  }
  if (r.colgado) nv(`el hook de arranque no terminó en ${minutos(PLAZO_ARRANQUE)}`);
  if (r.error) nv(`el hook de arranque no arrancó (${r.error})`);
  if (r.status !== 0) return mal(`el hook de arranque salió con ${r.status}`);
  const huellas = [...r.salida.matchAll(/inyectado: (\d{1,3}(?:\.\d{3})*|\d+) de 9\.700/g)];
  if (!huellas.length) return mal('el hook de arranque corrió pero no dejó la huella "inyectado: N de 9.700"');
  const n = Number(huellas[huellas.length - 1][1].replace(/\./g, ''));
  if (n > TOPE_ARRANQUE) return mal(`inyectado: ${huellas[huellas.length - 1][1]} de 9.700 — pasa el tope`);
  return bien(`inyectado: ${huellas[huellas.length - 1][1]} de 9.700`);
}

// ---------------------------------------------------------------- 3. settings

// Parte un command de hook en palabras, como la shell: una palabra son partes pegadas (entre comillas dobles, simples o sin
// comillas), así "$CLAUDE_PROJECT_DIR"/.claude/hooks/x.sh es UNA; después se sacan las comillas. Sin expandir nada.
function palabras(s) {
  const out = [];
  const re = /(?:"[^"]*"|'[^']*'|[^\s"']+)+/g;
  let m;
  while ((m = re.exec(String(s)))) out.push(m[0].replace(/"([^"]*)"|'([^']*)'/g, (x, a, b) => (a !== undefined ? a : b)));
  return out;
}
const RE_PROYECTO = /\$\{CLAUDE_PROJECT_DIR\}|\$CLAUDE_PROJECT_DIR\b|%CLAUDE_PROJECT_DIR%/g;
const RE_SCRIPT = /\.(c?js|mjs|sh|ps1|py)$/i;
const RE_NODE = /\.(c?js|mjs)$/i;

// Las rutas de archivo que nombra un hook: lo que lleva CLAUDE_PROJECT_DIR, una barra o termina como script (el programa suelto,
// "node" o "bash", no cuenta).
function rutasDeHook(h) {
  const toks = [];
  const cmd = typeof h.command === 'string' ? palabras(h.command) : [];
  cmd.forEach((t, i) => toks.push({ t, programa: i === 0 }));
  if (Array.isArray(h.args)) for (const a of h.args) if (typeof a === 'string') toks.push({ t: a, programa: false });
  const out = [];
  for (const { t, programa } of toks) {
    if (t.startsWith('-')) continue;
    const conProyecto = RE_PROYECTO.test(t);
    RE_PROYECTO.lastIndex = 0;
    const pinta = conProyecto || RE_SCRIPT.test(t) || (!programa && /[\\/]/.test(t) && !/^[a-z]+:\/\//i.test(t));
    if (!pinta) continue;
    out.push(t);
  }
  return out;
}

function settings(ctx) {
  const ruta = path.join(ctx.carpeta, ...RUTA_SETTINGS.split('/'));
  let texto;
  try {
    texto = fs.readFileSync(ruta, 'utf8');
  } catch (e) {
    return mal(`no está ${RUTA_SETTINGS}`);
  }
  const j = leerJsonSinDuplicados(texto);
  if (!j.ok) return mal(`${RUTA_SETTINGS}: ${corto(j.problema, 140)}`);
  const s = j.valor;
  if (!s || typeof s !== 'object' || Array.isArray(s)) return mal(`${RUTA_SETTINGS} no es un objeto`);
  const hooks = s.hooks === undefined ? {} : s.hooks;
  if (!hooks || typeof hooks !== 'object' || Array.isArray(hooks)) return mal(`${RUTA_SETTINGS}: "hooks" no es un objeto`);
  const problemas = [];
  let n = 0;
  for (const [evento, entradas] of Object.entries(hooks)) {
    if (!Array.isArray(entradas)) {
      problemas.push(`hooks.${evento} no es una lista`);
      continue;
    }
    for (const e of entradas) {
      const lista = e && Array.isArray(e.hooks) ? e.hooks : null;
      if (!lista) {
        problemas.push(`hooks.${evento}: una entrada sin "hooks"`);
        continue;
      }
      for (const h of lista) {
        if (!h || h.type !== 'command') continue;
        for (const t of rutasDeHook(h)) {
          const abs = path.resolve(ctx.carpeta, t.replace(RE_PROYECTO, () => ctx.carpeta));
          RE_PROYECTO.lastIndex = 0;
          const rel = posix(path.relative(ctx.carpeta, abs)) || t;
          let st = null;
          try {
            st = fs.statSync(abs);
          } catch (err) {
            st = null;
          }
          n++;
          if (!st || !st.isFile()) {
            problemas.push(`${evento} apunta a ${rel}, que no está`);
            continue;
          }
          if (RE_NODE.test(abs)) {
            const c = spawnSync(process.execPath, ['--check', abs], { env: entorno(), encoding: 'utf8', timeout: PLAZO_CHECK, windowsHide: true });
            if (c.error) problemas.push(`${rel}: node --check no terminó (${c.error.code || c.error.message})`);
            else if (c.status !== 0) problemas.push(`${rel} no compila (node --check)`);
          }
        }
      }
    }
  }
  if (problemas.length) return mal(problemas.slice(0, 4).join('; ') + (problemas.length > 4 ? ` y ${problemas.length - 4} más` : ''));
  return bien(`abre sin claves repetidas; ${n} archivo${n === 1 ? '' : 's'} de hook, todos están y compilan`);
}

// ---------------------------------------------------------------- 4. skills

// La cabecera de un SKILL.md: { name, description } (texto o vacío). Sin cabecera → null.
function cabeceraSkill(texto) {
  const t = texto.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  if (!t.startsWith('---\n')) return null;
  const fin = t.indexOf('\n---', 4);
  if (fin < 0) return null;
  const lineas = t.slice(4, fin).split('\n');
  const out = {};
  for (let i = 0; i < lineas.length; i++) {
    const m = /^([A-Za-z_-]+):(.*)$/.exec(lineas[i]);
    if (!m) continue;
    let v = m[2].trim();
    if (/^[|>][+-]?$/.test(v)) {
      const sigue = [];
      while (i + 1 < lineas.length && /^\s+\S/.test(lineas[i + 1])) sigue.push(lineas[++i].trim());
      v = sigue.join(' ');
    }
    v = v.replace(/^(["'])(.*)\1$/, '$2').trim();
    out[m[1]] = v;
  }
  return out;
}

function skills(ctx) {
  const delMolde = archivosDe(path.join(ctx.moldeNuevo, 'skills'))
    .filter((r) => /^[^/]+\/SKILL\.md$/.test(r))
    .map((r) => r.split('/')[0]);
  const problemas = [];
  let vistas = 0;
  for (const nombre of delMolde) {
    const ruta = path.join(ctx.carpeta, '.claude', 'skills', nombre, 'SKILL.md');
    let b;
    try {
      b = fs.readFileSync(ruta);
    } catch (e) {
      continue; // opcional que el proyecto no trae: no cuenta
    }
    vistas++;
    const rel = `.claude/skills/${nombre}/SKILL.md`;
    const c = cabeceraSkill(b.toString('utf8'));
    if (!c) problemas.push(`${rel} sin cabecera`);
    else {
      if (!c.name) problemas.push(`${rel} sin name`);
      if (!c.description) problemas.push(`${rel} sin description`);
    }
    if (b.length > TOPE_SKILL) problemas.push(`${rel} pesa ${b.length} B (tope ${TOPE_SKILL})`);
  }
  if (problemas.length) return mal(problemas.slice(0, 4).join('; ') + (problemas.length > 4 ? ` y ${problemas.length - 4} más` : ''));
  if (!delMolde.length) return bien('el molde no trae skills');
  return bien(`${vistas} de las ${delMolde.length} skills del molde están en el proyecto, con name, description y ≤ ${TOPE_SKILL} B`);
}

// ---------------------------------------------------------------- 5. ficha

function leerFicha(ctx) {
  if (ctx.ficha === undefined) {
    try {
      ctx.ficha = { r: ficha.leerArchivo(path.join(ctx.carpeta, ...RUTA_FICHA.split('/'))) };
    } catch (e) {
      ctx.ficha = { error: e && e.code === 'ENOENT' ? `no está ${RUTA_FICHA}` : corto(e.message, 140) };
    }
  }
  return ctx.ficha;
}

function fichaLinea(ctx) {
  const f = leerFicha(ctx);
  if (f.error) return mal(`la ficha no se lee: ${f.error}`);
  const v = f.r.datos.kit;
  if (ctx.version) {
    if (v !== ctx.version) return mal(`la ficha dice kit ${v} y la versión nueva es ${ctx.version}`);
    return bien(`se lee y dice kit ${v}`);
  }
  // Sin la versión nueva en las opciones: la de HEAD tiene que ser mayor que la de <base>.
  const r = git(['show', `${ctx.base}:${RUTA_FICHA}`], ctx.carpeta);
  if (!r.ok) nv(`sin la versión nueva y sin ficha en ${ctx.base.slice(0, 12)} para comparar`);
  let vieja;
  try {
    vieja = ficha.leer(r.salida.toString('utf8')).datos.kit;
  } catch (e) {
    nv(`sin la versión nueva y la ficha de ${ctx.base.slice(0, 12)} no se lee`);
  }
  if (ficha.compararVersiones(v, vieja) <= 0) return mal(`la ficha dice kit ${v}, igual o anterior a la de antes (${vieja})`);
  return bien(`se lee y dice kit ${v} (antes ${vieja})`);
}

// ---------------------------------------------------------------- 6. barreras

function barreras(ctx) {
  const script = path.join(ctx.carpeta, '.claude', 'scripts', 'estructura.cjs');
  if (!fs.existsSync(script)) return mal('no está .claude/scripts/estructura.cjs');
  const args = [script, 'barreras', '--rango', `${ctx.base}..HEAD`, '--molde', ctx.moldeNuevo];
  if (ctx.moldeViejo) args.push('--molde-viejo', ctx.moldeViejo);
  args.push('--sin-log');
  const r = correr(process.execPath, args, { cwd: ctx.carpeta, plazo: PLAZO_BARRERAS, tmp: ctx.tmp });
  if (r.colgado) nv(`barreras no terminó en ${minutos(PLAZO_BARRERAS)}`);
  if (r.error) nv(`barreras no arrancó (${r.error})`);
  const lineas = r.salida.split(/\r?\n/).filter((l) => l.trim());
  if (r.status === 0) return bien(corto(lineas[0] || 'verde', 200));
  if (r.status === 2) nv(`barreras mal llamado: ${corto(lineas[0] || '', 160)}`);
  const frenos = lineas.filter((l) => l.startsWith('candado'));
  return mal(corto((frenos.length ? frenos : lineas).slice(0, 2).join(' | ') || `salió con ${r.status}`, 300));
}

// ---------------------------------------------------------------- 7. casos

const RE_REQUIRE = /require\(\s*(['"`])(\.{1,2}\/[^'"`]+)\1\s*\)/g;
function requiresDe(rel, texto) {
  const out = [];
  let m;
  RE_REQUIRE.lastIndex = 0;
  while ((m = RE_REQUIRE.exec(texto))) out.push(path.posix.normalize(path.posix.join(path.posix.dirname(rel), m[2])));
  return out;
}

// Las pruebas del molde nuevo que juzgan a <dueño> (ruta relativa a hooks/): la suya (<x>.test.cjs al lado), las que lo requieren
// directo y las de los módulos que lo requieren directo.
function pruebasDe(dueno, hooksT) {
  const todos = archivosDe(hooksT).filter((r) => r.endsWith('.cjs'));
  const propia = (rel) => rel.replace(/\.cjs$/, '.test.cjs');
  const set = new Set();
  const sumar = (t) => {
    if (fs.existsSync(path.join(hooksT, ...t.split('/')))) set.add(t);
  };
  sumar(propia(dueno));
  for (const rel of todos) {
    if (rel === dueno) continue;
    let texto;
    try {
      texto = fs.readFileSync(path.join(hooksT, ...rel.split('/')), 'utf8');
    } catch (e) {
      continue;
    }
    if (!requiresDe(rel, texto).includes(dueno)) continue;
    if (rel.endsWith('.test.cjs')) set.add(rel);
    else sumar(propia(rel));
  }
  return [...set].sort();
}

// El primer caso rojo de una salida TAP de node --test.
function casoRojo(salida) {
  for (const l of salida.split(/\r?\n/)) {
    const m = /^\s*not ok \d+ - (.+?)(?:\s+#\s.*)?$/.exec(l);
    if (m && !/\.test\.cjs$/.test(m[1].trim())) return m[1].trim();
  }
  return null;
}

// Los rojos de una salida TAP de node --test con varios archivos, por archivo: Map(<ruta relativa a hooksT, con /> → el primer caso
// rojo de ese archivo). El archivo sale de la `location:` del bloque YAML de cada "not ok"; un archivo que no carga cuenta igual.
function rojosPorArchivo(salida, hooksT) {
  const out = new Map();
  const base = posix(path.resolve(hooksT)).toLowerCase();
  const ls = String(salida).split(/\r?\n/);
  for (let i = 0; i < ls.length; i++) {
    const m = /^\s*not ok \d+ - (.+?)(?:\s+#\s.*)?$/.exec(ls[i]);
    if (!m) continue;
    let archivo = null;
    for (let j = i + 1; j < ls.length && !/^\s*\.\.\.\s*$/.test(ls[j]) && !/^\s*(not )?ok \d+ /.test(ls[j]); j++) {
      const l = /^\s*location: '(.*):\d+:\d+'\s*$/.exec(ls[j]);
      if (l) {
        archivo = l[1].replace(/\\\\/g, '\\').replace(/''/g, "'");
        break;
      }
    }
    if (!archivo && /\.test\.cjs$/.test(m[1].trim())) archivo = path.resolve(hooksT, '..', m[1].trim());
    if (!archivo) continue;
    const abs = posix(path.resolve(hooksT, '..', archivo));
    if (!abs.toLowerCase().startsWith(`${base}/`)) continue;
    const rel = abs.slice(base.length + 1);
    const caso = /\.test\.cjs$/.test(m[1].trim()) ? `${m[1].trim()} no corre` : m[1].trim();
    if (!out.has(rel) || /no corre$/.test(out.get(rel))) out.set(rel, caso);
  }
  return out;
}

function casos(ctx) {
  const tocados = cambiados(ctx, '.claude/hooks')
    .filter((c) => c.estado !== 'D' && c.ruta.startsWith(RUTA_HOOKS))
    .map((c) => c.ruta.slice(RUTA_HOOKS.length))
    .filter((r) => !r.endsWith('.test.cjs') && !/\.propio\.[^/]+$/.test(r));
  if (!tocados.length) return bien('ningún hook cambió en base..HEAD');
  // La copia: el molde nuevo CRUDO entero (con sus pruebas) y encima los hooks del proyecto (sin pruebas), fuera del árbol. Crudo = el
  // kit/molde/ del --kit, tal cual: las pruebas del molde se escribieron contra él (el materializado trae los docs instanciados, con
  // [completar: …] donde las pruebas buscan {{…}}, y dos casos de candado daban rojo en toda actualización sana: D6.2, F0). Sin
  // moldeCrudo, el moldeNuevo de siempre.
  const T = path.join(ctx.tmp, 'casos');
  fs.cpSync(ctx.moldeCrudo || ctx.moldeNuevo, T, { recursive: true });
  const hooksP =path.join(ctx.carpeta, '.claude', 'hooks');
  const hooksT = path.join(T, 'hooks');
  for (const rel of archivosDe(hooksP)) {
    if (rel.endsWith('.test.cjs')) continue;
    const d = path.join(hooksT, ...rel.split('/'));
    fs.mkdirSync(path.dirname(d), { recursive: true });
    fs.copyFileSync(path.join(hooksP, ...rel.split('/')), d);
  }
  const duenos = new Map(); // dueño → [archivos tocados]
  for (const r of tocados) {
    const m = /^lib\/([^/]+)\/./.exec(r);
    const dueno = m && fs.existsSync(path.join(hooksT, 'lib', `${m[1]}.cjs`)) ? `lib/${m[1]}.cjs` : r;
    if (!duenos.has(dueno)) duenos.set(dueno, []);
    duenos.get(dueno).push(r);
  }
  const sinPruebas = [];
  const rojos = [];
  // RF-9: UN solo node --test con el conjunto (sin repetir) de las pruebas de todos los dueños — node las paraleliza; correr uno
  // por dueño, en fila, repetía los archivos compartidos y se comía el plazo. Los rojos se atribuyen por archivo a quien lo trajo.
  const pruebasDeDueno = new Map(); // dueño → [archivos de prueba]
  const todas = new Set();
  for (const [dueno] of duenos) {
    const pruebas = dueno.endsWith('.cjs') ? pruebasDe(dueno, hooksT) : [];
    if (!pruebas.length) {
      sinPruebas.push(dueno);
      continue;
    }
    pruebasDeDueno.set(dueno, pruebas);
    for (const p of pruebas) todas.add(p);
  }
  const corridas = todas.size;
  if (corridas) {
    const lista = [...todas].sort();
    const r = correr(process.execPath, ['--test', '--test-reporter=tap', ...lista.map((p) => `hooks/${p}`)], { cwd: T, plazo: ctx.plazoMs, tmp: ctx.tmp });
    if (r.colgado) nv(`las pruebas de los hooks (${corridas} archivo${corridas === 1 ? '' : 's'}) no terminaron en ${minutos(ctx.plazoMs)}`);
    if (r.error) nv(`las pruebas de los hooks no arrancaron (${r.error})`);
    if (r.status !== 0) {
      const porArchivo = rojosPorArchivo(r.salida, hooksT);
      for (const [dueno, pruebas] of pruebasDeDueno) {
        const suyo = pruebas.find((p) => porArchivo.has(p));
        if (suyo) rojos.push(`el hook ${dueno} pierde un caso: ${corto(porArchivo.get(suyo), 120)}`);
        else if (!porArchivo.size) rojos.push(`el hook ${dueno} pierde un caso: ${corto(casoRojo(r.salida) || `node --test salió con ${r.status}`, 120)}`);
      }
    }
  }
  const problemas = [...rojos, ...sinPruebas.map((d) => `el hook ${d} cambió y el molde nuevo no trae pruebas para él`)];
  if (problemas.length) return mal(problemas.slice(0, 3).join('; ') + (problemas.length > 3 ? ` y ${problemas.length - 3} más` : ''));
  return bien(`${duenos.size} hook${duenos.size === 1 ? '' : 's'} cambiado${duenos.size === 1 ? '' : 's'}, ${corridas} archivo${corridas === 1 ? '' : 's'} de pruebas del molde nuevo en verde`);
}

// ---------------------------------------------------------------- 8. pruebas

const RE_TUBERIA = /[|&;<>`\r\n]|\$\(/;
function pruebas(ctx) {
  const f = leerFicha(ctx);
  if (f.error) nv(`sin ficha que se lea no hay comando-test (${f.error})`);
  const vars = f.r.datos.vars && typeof f.r.datos.vars === 'object' ? f.r.datos.vars : {};
  const cmd = typeof vars['comando-test'] === 'string' ? vars['comando-test'].trim() : '';
  if (!cmd) {
    if (f.r.datos.nivel === 'liviano') return bien('nivel liviano: la ficha no trae comando-test');
    nv('la ficha no dice vars.comando-test');
  }
  if (RE_TUBERIA.test(cmd)) nv(`comando-test con tuberías o redirecciones no se corre: ${corto(cmd, 80)}`);
  // comando-setup (opcional; p. ej. `npm ci`): en un clon fresco no hay dependencias, y sin él todo daría "ya estaba rojo antes".
  // Mismo plazo y misma regla de "sin tuberías"; se corre antes de comando-test, en HEAD y en el clon de base.
  const setup = typeof vars['comando-setup'] === 'string' ? vars['comando-setup'].trim() : '';
  if (setup && RE_TUBERIA.test(setup)) nv(`comando-setup con tuberías o redirecciones no se corre: ${corto(setup, 80)}`);
  // → null si anduvo (o no hay), o el motivo por el que no anduvo
  const prepararEn = (cwd) => {
    if (!setup) return null;
    const s = correr(setup, [], { cwd, plazo: ctx.plazoMs, shell: true, tmp: ctx.tmp });
    if (s.colgado) return `comando-setup colgado: no terminó en ${minutos(ctx.plazoMs)}`;
    if (s.error) return `comando-setup no arrancó (${s.error})`;
    if (s.status !== 0) return `comando-setup (${corto(setup, 60)}) salió con ${s.status}: ${corto(s.salida, 80) || 'sin salida'}`;
    return null;
  };
  const fallaSetup = prepararEn(ctx.carpeta);
  if (fallaSetup) nv(fallaSetup);
  const r = correr(cmd, [], { cwd: ctx.carpeta, plazo: ctx.plazoMs, shell: true, tmp: ctx.tmp });
  if (r.colgado) nv(`comando-test colgado: no terminó en ${minutos(ctx.plazoMs)}`);
  if (r.error) nv(`comando-test no arrancó (${r.error})`);
  if (r.status === 0) return bien(`${cmd} en verde`);
  // Rojo: ¿ya lo estaba en <base>? Un clon --shared (lee los objetos del original, no lo toca), parado en <base>.
  const dir = path.join(ctx.tmp, 'base');
  let antes = '';
  const c = git(['clone', '-q', '--shared', '--no-checkout', ctx.carpeta, dir], ctx.tmp);
  const k = c.ok ? git(['-c', 'advice.detachedHead=false', 'checkout', '-q', '--detach', ctx.base], dir) : c;
  if (!k.ok) antes = ' (no pude ver si ya estaba rojo antes)';
  else {
    const fallaBase = prepararEn(dir);
    const rb = fallaBase ? null : correr(cmd, [], { cwd: dir, plazo: ctx.plazoMs, shell: true, tmp: ctx.tmp });
    if (fallaBase) antes = ` (en base ${fallaBase}: no se sabe si ya estaba rojo antes)`;
    else if (rb.colgado) antes = ' (en base se colgó: no se sabe si ya estaba rojo antes)';
    else if (!rb.error && rb.status !== 0) antes = ' — ya estaba rojo antes';
    else if (rb.status === 0) antes = ' — en base estaba verde: lo rompió la actualización';
  }
  return mal(`${cmd} en rojo (salida ${r.status})${antes}`);
}

// ---------------------------------------------------------------- 9. gitleaks

function buscarGitleaks(ctx) {
  if (ctx.gitleaks === null || ctx.gitleaks === false) return null;
  if (typeof ctx.gitleaks === 'string') return fs.existsSync(ctx.gitleaks) ? ctx.gitleaks : null;
  const nombres = process.platform === 'win32' ? ['gitleaks.exe', 'gitleaks'] : ['gitleaks'];
  for (const dir of String(process.env.PATH || process.env.Path || '').split(path.delimiter)) {
    if (!dir) continue;
    for (const n of nombres) {
      const p = path.join(dir.replace(/^"|"$/g, ''), n);
      try {
        if (fs.statSync(p).isFile() || fs.lstatSync(p).isSymbolicLink()) return p;
      } catch (e) {
        // sigue
      }
    }
  }
  const local = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
  const winget = path.join(local, 'Microsoft', 'WinGet', 'Links', 'gitleaks.exe');
  return fs.existsSync(winget) ? winget : null;
}

function segmentoSeguro(s) {
  let t = s.replace(/[<>:"\\|?*\x00-\x1f]/g, '_');
  if (t === '' || t === '.' || t === '..' || /[. ]$/.test(t)) t += '_';
  if (/^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i.test(t)) t = `_${t}`;
  return t;
}

function gitleaks(ctx) {
  const exe = buscarGitleaks(ctx);
  if (!exe) nv('no hay gitleaks en esta PC (ni en el PATH ni en WinGet\\Links)');
  const lineas = diffDe(ctx);
  if (!lineas.length) return bien('base..HEAD no agrega líneas');
  // Las líneas agregadas, cada una en su archivo y su número de línea (lo demás, vacío), en un temporal.
  const scan = path.join(ctx.tmp, 'gitleaks');
  const porArchivo = new Map();
  for (const a of lineas) {
    if (!porArchivo.has(a.archivo)) porArchivo.set(a.archivo, []);
    porArchivo.get(a.archivo).push(a);
  }
  const escrito = new Map(); // ruta escrita (posix) → ruta del repo
  for (const [archivo, ls] of porArchivo) {
    const segs = archivo.split('/').map(segmentoSeguro);
    if (segs.length === 1 && /^\.?gitleaks/i.test(segs[0])) segs[0] += '.kit-chequeo'; // que gitleaks no lo tome por su configuración
    let rel = segs.join('/');
    while (escrito.has(rel.toLowerCase())) rel += '_';
    escrito.set(rel.toLowerCase(), archivo);
    const max = ls.reduce((m, a) => Math.max(m, a.linea), 0);
    const filas = new Array(max).fill('');
    for (const a of ls) filas[a.linea - 1] = a.texto;
    const d = path.join(scan, ...rel.split('/'));
    fs.mkdirSync(path.dirname(d), { recursive: true });
    fs.writeFileSync(d, Buffer.from(`${filas.join('\n')}\n`, 'latin1'));
  }
  const informe = path.join(ctx.tmp, 'gitleaks.json');
  const args = ['dir', '.', '--no-banner', '--redact', '--no-color', '-l', 'error', '--exit-code', String(SALIDA_FUGA), '-f', 'json', '-r', informe];
  const conf = path.join(ctx.carpeta, '.gitleaks.toml');
  if (fs.existsSync(conf)) args.push('-c', conf);
  const ignora = path.join(ctx.carpeta, '.gitleaksignore');
  args.push('-i', fs.existsSync(ignora) ? ignora : path.join(ctx.tmp, 'sin-ignore'));
  const r = correr(exe, args, { cwd: scan, plazo: PLAZO_GITLEAKS, tmp: ctx.tmp });
  if (r.colgado) nv(`gitleaks no terminó en ${minutos(PLAZO_GITLEAKS)}`);
  if (r.error) nv(`gitleaks no arrancó (${r.error})`);
  if (r.status === 0) return bien(`${lineas.length} línea${lineas.length === 1 ? '' : 's'} agregada${lineas.length === 1 ? '' : 's'} sin secretos`);
  if (r.status !== SALIDA_FUGA) nv(`gitleaks falló (salida ${r.status})`);
  let hallazgos = [];
  try {
    hallazgos = JSON.parse(fs.readFileSync(informe, 'utf8'));
  } catch (e) {
    hallazgos = [];
  }
  // Solo archivo:línea y la regla; nunca el valor.
  const donde = hallazgos.map((h) => `${escrito.get(posix(h.File || '').replace(/^\.\//, '').toLowerCase()) || posix(h.File || '?')}:${h.StartLine} (${h.RuleID})`);
  return mal(`posible secreto en ${donde.slice(0, 4).join(', ') || 'lo agregado'}${donde.length > 4 ? ` y ${donde.length - 4} más` : ''}`);
}

// ---------------------------------------------------------------- las nueve

const LINEAS = [llaves, arranque, settings, skills, fichaLinea, barreras, casos, pruebas, gitleaks];

function formatear(i, r) {
  return `${i + 1}. ${IDS[i]} · ${r.ok ? '✅' : '❌'} · ${r.detalle}`;
}

// chequear(carpeta, {moldeNuevo, moldeViejo, base, plazoMs, version, gitleaks}) → {lineas, ok, noVerificado, noVerificados}. SÍNCRONO.
function chequear(carpeta, opciones = {}) {
  const res = new Array(IDS.length).fill(null);
  const noVerif = [];
  const marcarTodo = (motivo) => {
    for (let i = 0; i < IDS.length; i++) if (!res[i]) {
      res[i] = mal(`NO VERIFICADO: ${motivo}`);
      noVerif.push(IDS[i]);
    }
  };
  let tmp = null;
  try {
    const o = opciones || {};
    const ctx = { moldeViejo: o.moldeViejo ? path.resolve(o.moldeViejo) : null, version: o.version || null, gitleaks: o.gitleaks };
    ctx.plazoMs = Number.isFinite(o.plazoMs) && o.plazoMs > 0 ? o.plazoMs : PLAZO_DEFECTO;
    if (typeof carpeta !== 'string' || !carpeta) throw new NoVerificado('no me pasaron la carpeta');
    let raiz;
    try {
      raiz = gitTexto(['rev-parse', '--show-toplevel'], path.resolve(carpeta)).trim();
    } catch (e) {
      throw new NoVerificado(`${carpeta} no es un repo de git`);
    }
    ctx.carpeta = path.resolve(raiz);
    if (typeof o.base !== 'string' || !o.base) throw new NoVerificado('no me pasaron la base');
    const b = git(['rev-parse', '--verify', '--quiet', `${o.base}^{commit}`], ctx.carpeta);
    if (!b.ok) throw new NoVerificado(`la base ${o.base} no es un commit de ${ctx.carpeta}`);
    ctx.base = b.salida.toString('utf8').trim();
    if (typeof o.moldeNuevo !== 'string' || !fs.existsSync(o.moldeNuevo) || !fs.statSync(o.moldeNuevo).isDirectory()) {
      ctx.moldeNuevo = null;
    } else ctx.moldeNuevo = path.resolve(o.moldeNuevo);
    ctx.moldeCrudo = typeof o.moldeCrudo === 'string' && fs.existsSync(o.moldeCrudo) && fs.statSync(o.moldeCrudo).isDirectory() ? path.resolve(o.moldeCrudo) : null;
    if (ctx.moldeViejo && !fs.existsSync(ctx.moldeViejo)) throw new NoVerificado(`el molde viejo ${ctx.moldeViejo} no existe`);
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-chequeo-'));
    ctx.tmp = tmp;
    for (let i = 0; i < LINEAS.length; i++) {
      try {
        if (!ctx.moldeNuevo && ['skills', 'barreras', 'casos'].includes(IDS[i])) throw new NoVerificado('no me pasaron el molde nuevo (o no existe)');
        const r = LINEAS[i](ctx);
        if (!r || typeof r.ok !== 'boolean' || typeof r.detalle !== 'string') throw new Error('salida inesperada');
        res[i] = r;
      } catch (e) {
        res[i] = mal(`NO VERIFICADO: ${e instanceof NoVerificado ? e.message : `error propio (${corto(e && e.message ? e.message : e, 120)})`}`);
        noVerif.push(IDS[i]);
      }
    }
  } catch (e) {
    marcarTodo(e instanceof NoVerificado ? e.message : `error propio (${corto(e && e.message ? e.message : e, 120)})`);
  } finally {
    if (tmp) {
      try {
        fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
      } catch (e) {
        // un temporal que Windows no suelta no cambia el resultado
      }
    }
  }
  for (let i = 0; i < IDS.length; i++) if (!res[i]) res[i] = mal('NO VERIFICADO: error propio (línea sin resultado)');
  const lineas = res.map((r, i) => formatear(i, r));
  return { lineas, ok: res.every((r) => r.ok), noVerificado: noVerif.length > 0, noVerificados: noVerif };
}

module.exports = { chequear, IDS, PLAZO_DEFECTO, agregadas, rutasDeHook, cabeceraSkill, pruebasDe, casoRojo, rojosPorArchivo, correr };
