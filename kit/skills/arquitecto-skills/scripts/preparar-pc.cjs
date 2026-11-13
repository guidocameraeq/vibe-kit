#!/usr/bin/env node
'use strict';
// preparar-pc.cjs — "Preparame esta PC" (SPEC-paquete-6, P2.2; E §8, §10; F §14; G §10, §15; D6-2, D6-3, D6-4, D6-8, D6-10, D6-17).
//
//   node preparar-pc.cjs --kit <raíz del kit> [--home <dir>] [--proyectos <carpeta>] [--plan] [--flota] [--pisar-editados]
//   node preparar-pc.cjs --kit <raíz> --kit-sin-tag --home <dir> …     (solo pruebas: --kit sin tag, y nunca sin --home)
//
// Salidas: 0 anduvo (los ⚠ no traban) · 1 algo quedó mal (✗ en la tabla, o no toqué nada) · 2 mal llamado.
// En orden, y TODO EL PLAN ANTES DE ESCRIBIR NADA:
//   1. chequea node, git, gh (y su cuenta), gitleaks y Claude Code; no instala programas: lo que falta da su línea y sigue (D6-17).
//   2. el kit: las 4 skills, agents/redteam-spec.md y VERSION a <home>/.claude/, como `kit-sync sync` (conserva la carpeta de
//      proyectos). Un archivo EDITADO A MANO (distinto de toda versión de ese archivo en la historia del kit, en LF y sin la línea de
//      la carpeta; r1-7) no se pisa: va al plan; --pisar-editados lo pisa; --flota lo saltea con ⚠ y no pregunta (D6-10).
//      --kit tiene que estar parado en un tag anotado v* (si no → 1), con historia (un clon --depth 1 → 1: RF-1), y este script
//      tiene que ser el de ese clon (el instalado con --kit <clon nuevo> → 1: RF-3). Lo que el kit ya no trae, dentro de sus
//      carpetas: intacto (igual a una versión de la historia) se borra; si no, se deja con ⚠ (RF-8).
//   3. los hooks por PC: el plan de instalar-hooks-pc.cjs (su lógica, exportada; no se duplica).
//   4. el settings.json de la PC, regla por regla: crossSessionInbound y el bloque autoMode. Los planes de 3 y 4 van JUNTOS en UNA
//      escritura atómica (temporal + renombre con 3 reintentos ante EPERM/EBUSY + relectura; r1-12).
//   5. la capa privada (D6-8): si kit-pc.md dice `privada: <carpeta>` y trae instalar.cjs, corre
//      `node <carpeta>/instalar.cjs --home <home> [--plan]` (plazo 2 min) y su salida va a la tabla. Contrato (r1-11): sale 0 si
//      anduvo; con --plan no escribe nada; `instalar.cjs --variables` imprime los nombres de sus variables de entorno, uno por renglón
//      (los mira doctor, sin imprimir valores). La credencial del Hub NUNCA pasa por el kit.
//   6. <home>/.claude/kit-pc.md (D6-3), con la gramática de la ficha: entorno · gh · proyectos · privada · auto-mode. Fuera de kit-sync.
//   7. la tabla (✓|✗|⚠ <paso> · qué · cómo se arregla) y, sin --plan, corre doctor y pega su salida. Termina con "reiniciá Claude Code".
// Sin --home apunta al ~/.claude/ real: las pruebas SIEMPRE pasan uno falso.
//
// LA FORMA DE autoMode Y crossSessionInbound (verificada contra la doc oficial el 2026-11-02):
//   https://code.claude.com/docs/en/auto-mode-config — `"autoMode": { "environment": [...], "allow": [...], "soft_deny": [...],
//   "hard_deny": [...] }`, listas de textos en prosa. "To keep the built-in rules while adding your own, include the literal string
//   "$defaults" in the array"; "Setting any of environment, allow, soft_deny, or hard_deny without "$defaults" replaces the entire
//   default list for that section" (entre ellos "Trusted repo" y "Source control"). Se lee de ~/.claude/settings.json (y managed,
//   --settings); "The classifier doesn't read autoMode from project settings". El kit solo toca `autoMode.environment`.
//   https://code.claude.com/docs/en/cross-session-messaging ("Control inbound messages") y
//   https://code.claude.com/docs/en/settings-reference#crosssessioninbound — clave de primer nivel, en cualquier archivo de
//   settings; valores `accept` (entrega), `hold` (avisa y no entrega), `refuse` (descarta). Sin valor, decide por los modos.
//
// Vive en eq/scripts/ y se instala en ~/.claude/skills/arquitecto-skills/scripts/. doctor.cjs importa de acá (una sola fuente):
// generarAutoMode, mezclarAutoMode, leerKitPc, rutaKitPc, DEFAULTS. Por eso este archivo NO importa doctor arriba (sería un ciclo):
// lo pide adentro de la función que lo usa.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { leerJsonSinDuplicados } = require('../pc/lib/zona-propia.cjs');
const ficha = require('../pc/lib/ficha.cjs');
const R = require('./lib/repos.cjs');
const PU = require('../pc/lib/publicar.cjs'); // 8d C2.2: el contrato de la autorización de publicar (el mismo que lee noche.cjs)
const CX = require('../pc/lib/contexto.cjs'); // la ficha vigente (la de origin/<defecto>, no la del disco)
const I = require('./instalar-hooks-pc.cjs');

const SKILLS = ['arquitecto', 'arquitecto-skills', 'docs-fyd', 'relevamiento'];
const FUENTES = [...SKILLS.map((s) => `skills/${s}`), 'agents/redteam-spec.md', 'VERSION']; // las de kit-sync.sh
const LINEA_CARPETA = '**Carpeta de proyectos de esta máquina**';
const LUGAR_CARPETA = '{{CARPETA_DE_PROYECTOS}}';
const SKILL_ARQ = 'skills/arquitecto/SKILL.md';
const DEFAULTS = '$defaults';
const CROSS = ['accept', 'hold', 'refuse'];
const MIN_NODE = 20;
const MIN_GITLEAKS = '8.19.0';
const MIN_CLAUDE = '2.1.295'; // el MIN_CLAUDE de doctor.cjs (D-8): cubre onFailure "block" y el 2.1.234 de Windows
const PLAZO_PROGRAMA = 20000;
const PLAZO_PRIVADA = 120000;
const PLAZO_DOCTOR = 180000;
const WIN = process.platform === 'win32';

const USO = 'uso: preparar-pc.cjs --kit <raíz del kit> [--home <dir>] [--proyectos <carpeta>] [--plan] [--flota] [--pisar-editados] [--publica <origin>]… [--no-publica <origin>]… [--kit-sin-tag (solo con --home)]';

const barras = (p) => String(p).replace(/\\/g, '/');
const esMapa = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const igualJson = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const leerBuf = (p) => {
  try {
    return fs.readFileSync(p);
  } catch (e) {
    return null;
  }
};
const dormir = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const lin = (est, paso, que, arreglo) => `${est} ${paso} · ${que}${arreglo ? ` · ${arreglo}` : ''}`;

// ---------------------------------------------------------------- argumentos
function leerArgs(argv) {
  const o = { kit: null, home: null, proyectos: null, plan: false, flota: false, pisarEditados: false, kitSinTag: false, publica: [], noPublica: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--kit' || a === '--home' || a === '--proyectos') {
      if (!argv[i + 1]) throw new Error(`${a} sin carpeta`);
      o[a.slice(2)] = argv[++i];
    } else if (a === '--publica' || a === '--no-publica') {
      // 8d C2.2: la firma del dueño (el freno de la PC la pregunta: A2.4) — sí o no por repo, por su origin
      if (!argv[i + 1]) throw new Error(`${a} sin origin`);
      o[a === '--publica' ? 'publica' : 'noPublica'].push(argv[++i]);
    } else if (a === '--plan') o.plan = true;
    else if (a === '--flota') o.flota = true;
    else if (a === '--pisar-editados') o.pisarEditados = true;
    else if (a === '--kit-sin-tag') o.kitSinTag = true;
    else throw new Error(`no conozco "${a}"`);
  }
  if (!o.kit) throw new Error('falta --kit <raíz del kit>');
  if (o.kitSinTag && !o.home) throw new Error('--kit-sin-tag es solo para pruebas: va siempre con --home');
  if (o.flota && o.pisarEditados) throw new Error('--flota no pisa lo editado a mano: no va con --pisar-editados');
  if (o.flota && (o.publica.length || o.noPublica.length)) throw new Error('--flota no autoriza a publicar: eso es una firma del dueño, aparte');
  return o;
}

// ---------------------------------------------------------------- escritura atómica (r1-12)
// Temporal en la misma carpeta + renombre (3 reintentos ante EPERM/EBUSY: un antivirus o el editor tienen el archivo) + relee y compara.
function escribirAtomico(ruta, contenido, renombrar = fs.renameSync) {
  const buf = Buffer.isBuffer(contenido) ? contenido : Buffer.from(contenido, 'utf8');
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  const tmp = `${ruta}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, buf);
  for (let intento = 0; ; intento++) {
    try {
      renombrar(tmp, ruta);
      break;
    } catch (e) {
      if ((e.code === 'EPERM' || e.code === 'EBUSY') && intento < 3) {
        dormir(100 * (intento + 1));
        continue;
      }
      fs.rmSync(tmp, { force: true });
      throw new Error(`no pude renombrar ${barras(tmp)} → ${barras(ruta)} (${e.code || e.message}${intento ? `, después de ${intento} reintentos` : ''})`);
    }
  }
  if (!fs.readFileSync(ruta).equals(buf)) throw new Error(`releí ${barras(ruta)} y no es lo que escribí`);
}

// ---------------------------------------------------------------- programas (paso 1)
function correr(ruta, args, { env, cwd, plazoMs = PLAZO_PROGRAMA }) {
  const bat = WIN && /\.(cmd|bat)$/i.test(ruta);
  const cmd = bat ? env.ComSpec || env.COMSPEC || 'cmd.exe' : ruta;
  const argv = bat ? ['/d', '/s', '/c', `""${ruta}" ${args.join(' ')}"`] : args;
  const r = spawnSync(cmd, argv, { env, cwd, encoding: 'utf8', timeout: plazoMs, windowsHide: true, windowsVerbatimArguments: bat, stdio: ['ignore', 'pipe', 'pipe'] });
  if (r.error && r.error.code === 'ETIMEDOUT') return { plazo: true };
  if (r.error) return { error: r.error.message };
  return { codigo: r.status, salida: `${r.stdout || ''}${r.stderr || ''}` };
}

const INSTALAR = {
  node: WIN ? 'winget install OpenJS.NodeJS.LTS' : 'instalá Node 20+ desde nodejs.org',
  git: WIN ? 'winget install Git.Git' : 'instalá git con el gestor de paquetes',
  gh: WIN ? 'winget install GitHub.cli y después gh auth login' : 'instalá gh (cli.github.com) y después gh auth login',
  gitleaks: WIN ? 'winget install Gitleaks.Gitleaks' : 'instalá gitleaks ≥ 8.19 (github.com/gitleaks/gitleaks)',
  claude: WIN ? 'irm https://claude.ai/install.ps1 | iex (o claude update si ya está)' : 'curl -fsSL https://claude.ai/install.sh | bash (o claude update si ya está)',
};

// → { lineas: [...], gh: <cuenta>|null, rutaGit: <ruta>|null }
function chequearProgramas(env, cwd, nodeVersion = process.versions.node) {
  const D = require('./doctor.cjs'); // adentro: doctor importa este archivo (sin ciclo al cargar)
  const lineas = [];
  if (Number(nodeVersion.split('.')[0]) < MIN_NODE) lineas.push(lin('⚠', 'node', `v${nodeVersion}: el kit pide ${MIN_NODE} o más`, INSTALAR.node));
  else lineas.push(lin('✓', 'node', `v${nodeVersion} (pide ≥ ${MIN_NODE})`));

  const versionDe = (nombre, args, minimo) => {
    const ruta = D.buscarEnPath(nombre, env);
    if (!ruta) return { linea: lin('⚠', nombre, 'no está en el PATH', INSTALAR[nombre]) };
    const r = correr(ruta, args, { env, cwd });
    const v = r.salida ? D.version(r.salida) : null;
    if (r.plazo) return { ruta, linea: lin('⚠', nombre, `no respondió en ${PLAZO_PROGRAMA / 1000} s`, 'volvé a correr: en frío puede tardar') };
    if (!v || r.codigo !== 0) return { ruta, linea: lin('⚠', nombre, 'no pude leer su versión', INSTALAR[nombre]) };
    if (minimo && D.comparar(v, minimo) < 0) return { ruta, linea: lin('⚠', nombre, `${v.join('.')} es menor que ${minimo}`, INSTALAR[nombre]) };
    return { ruta, linea: lin('✓', nombre, `${v.join('.')}${minimo ? ` (pide ≥ ${minimo})` : ''}`) };
  };
  const g = versionDe('git', ['--version'], null);
  lineas.push(g.linea);
  const h = versionDe('gh', ['--version'], null);
  let cuenta = null;
  if (h.ruta && h.linea.startsWith('✓')) {
    const a = correr(h.ruta, ['auth', 'status'], { env, cwd });
    // RF-7: ✓ solo si gh auth status sale 0 (con otro código la cuenta que nombre no sirve: token vencido o sin red)
    const m = a.codigo === 0 && a.salida ? /account (\S+)|Logged in to \S+ as (\S+)/.exec(a.salida) : null;
    cuenta = m ? (m[1] || m[2]).replace(/[^A-Za-z0-9_.-]/g, '') || null : null;
    if (cuenta) lineas.push(h.linea.replace(/^✓ gh · (.*)$/, `✓ gh · $1, cuenta ${cuenta}`));
    else if (a.codigo === 0) lineas.push(lin('⚠', 'gh', 'está, pero sin cuenta logueada', 'gh auth login'));
    else lineas.push(lin('⚠', 'gh', `gh no está logueado o no hay red (gh auth status ${a.plazo ? 'no respondió' : `salió ${a.codigo === undefined ? 'con error' : a.codigo}`})`, 'gh auth login'));
  } else lineas.push(h.linea);
  lineas.push(versionDe('gitleaks', ['version'], MIN_GITLEAKS).linea);
  lineas.push(versionDe('claude', ['--version'], MIN_CLAUDE).linea.replace(/^(.) claude · /, '$1 claude-code · '));
  return { lineas, gh: cuenta, rutaGit: g.ruta || null };
}

// ---------------------------------------------------------------- el kit (paso 2)
function gitKit(rutaGit, raiz, args, input) {
  const r = spawnSync(rutaGit, ['-C', raiz, ...args], { input, maxBuffer: 256 * 1024 * 1024, windowsHide: true, timeout: 60000 });
  if (r.error || r.status !== 0) return null;
  return r.stdout;
}

// r1-7: --kit parado en un tag anotado v*. → nombre del tag o null.
function tagAnotado(rutaGit, raiz) {
  const out = gitKit(rutaGit, raiz, ['tag', '--points-at', 'HEAD', '--list', 'v*', '--format=%(objecttype) %(refname:short)']);
  if (!out) return null;
  const t = out.toString('utf8').split('\n').map((l) => /^tag (v\S+)$/.exec(l.trim())).find(Boolean);
  return t ? t[1] : null;
}

function archivosKit(raizKit) {
  const out = [];
  for (const f of FUENTES) {
    const abs = path.join(raizKit, 'kit', f);
    let st;
    try {
      st = fs.statSync(abs);
    } catch (e) {
      throw new Error(`el kit no trae kit/${f}`);
    }
    if (st.isFile()) out.push(f);
    else
      (function rec(dir, rel) {
        for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
          const r = `${rel}/${e.name}`;
          if (e.isDirectory()) rec(path.join(dir, e.name), r);
          else if (e.isFile()) out.push(r);
        }
      })(abs, f);
  }
  return out;
}

// Para comparar contra la historia: en LF (latin1: sin perder bytes) y sin la línea de la carpeta de proyectos.
const MARCA_LATIN1 = Buffer.from(LINEA_CARPETA, 'utf8').toString('latin1');
function normalizar(buf) {
  return buf
    .toString('latin1')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((l) => !l.startsWith(MARCA_LATIN1))
    .join('\n');
}

// Todas las versiones de kit/<rel> en la historia de HEAD del kit (con --follow: sobrevive a las mudanzas), normalizadas.
function historia(rutaGit, raizKit, rel) {
  if (!rutaGit) return [];
  const log = gitKit(rutaGit, raizKit, ['log', '--follow', '--format=%H', '--name-only', 'HEAD', '--', `kit/${rel}`]);
  if (!log) return [];
  const pedidos = [];
  let sha = null;
  for (const l of log.toString('utf8').split('\n')) {
    const t = l.trim();
    if (!t) continue;
    if (/^[0-9a-f]{40}$/.test(t)) sha = t;
    else if (sha) {
      pedidos.push(`${sha}:${t}`);
      sha = null;
    }
  }
  if (!pedidos.length) return [];
  const out = gitKit(rutaGit, raizKit, ['cat-file', '--batch'], `${pedidos.join('\n')}\n`);
  if (!out) return [];
  const versiones = [];
  let i = 0;
  while (i < out.length) {
    const fin = out.indexOf(0x0a, i);
    if (fin < 0) break;
    const cab = out.slice(i, fin).toString('utf8');
    const m = /^[0-9a-f]+ blob (\d+)$/.exec(cab);
    if (!m) {
      i = fin + 1; // "<pedido> missing"
      continue;
    }
    const n = Number(m[1]);
    versiones.push(normalizar(out.slice(fin + 1, fin + 1 + n)));
    i = fin + 1 + n + 1;
  }
  return versiones;
}

// La carpeta en la línea del SKILL.md del Arquitecto: el primer {{CARPETA_DE_PROYECTOS}} de esa línea (como kit-sync).
function conCarpeta(buf, carpeta) {
  if (!carpeta) return buf;
  const t = buf.toString('utf8');
  const lineas = t.split('\n');
  const i = lineas.findIndex((l) => l.startsWith(LINEA_CARPETA));
  if (i < 0 || !lineas[i].includes(LUGAR_CARPETA)) return buf;
  const k = lineas[i].indexOf(LUGAR_CARPETA);
  lineas[i] = lineas[i].slice(0, k) + carpeta + lineas[i].slice(k + LUGAR_CARPETA.length);
  return Buffer.from(lineas.join('\n'), 'utf8');
}
// La carpeta que dice la línea instalada (lo de adentro de los primeros `…`), o null si está el lugar vacío o no está.
function carpetaDelSkill(home) {
  const b = leerBuf(path.join(home, '.claude', ...SKILL_ARQ.split('/')));
  if (!b) return null;
  const l = b.toString('utf8').split(/\r?\n/).find((x) => x.startsWith(LINEA_CARPETA));
  const m = l ? /`([^`]*)`/.exec(l) : null;
  return m && m[1] && m[1] !== LUGAR_CARPETA ? m[1] : null;
}

// Diff corto para que la skill muestre lo editado (renglones que están en uno y no en el otro, hasta 20).
function diffCorto(kitBuf, casaBuf) {
  const a = kitBuf.toString('utf8').replace(/\r\n/g, '\n').split('\n');
  const b = casaBuf.toString('utf8').replace(/\r\n/g, '\n').split('\n');
  const sa = new Set(a);
  const sb = new Set(b);
  const out = [...a.filter((l) => !sb.has(l)).map((l) => `- ${l}`), ...b.filter((l) => !sa.has(l)).map((l) => `+ ${l}`)];
  return out.length > 20 ? [...out.slice(0, 20), `… y ${out.length - 20} renglones más`] : out;
}

function planKit(raizKit, home, carpeta, rutaGit, o) {
  const copiar = [];
  const editados = [];
  const borrar = [];
  const ajenos = [];
  let iguales = 0;
  const delKit = archivosKit(raizKit);
  // RF-8: lo que el kit ya no trae, dentro de sus carpetas en <home>/.claude/ (las 4 skills y el agente). Igual a alguna versión
  // de la historia del kit (intacto) → se borra; si no → se deja con ⚠ (no es del kit o lo editaste). kit-pc.md vive fuera.
  const enKit = new Set(delKit);
  const candidatos = [];
  for (const f of FUENTES) {
    if (f === 'VERSION') continue;
    const abs = path.join(home, '.claude', ...f.split('/'));
    let st;
    try {
      st = fs.statSync(abs);
    } catch (e) {
      continue;
    }
    if (st.isFile()) candidatos.push(f);
    else
      (function rec(dir, rel) {
        for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
          const r = `${rel}/${e.name}`;
          if (e.isDirectory()) rec(path.join(dir, e.name), r);
          else if (e.isFile()) candidatos.push(r);
        }
      })(abs, f);
  }
  for (const rel of candidatos) {
    if (enKit.has(rel) || rel === SKILL_ARQ) continue;
    const destino = path.join(home, '.claude', ...rel.split('/'));
    if (historia(rutaGit, raizKit, rel).includes(normalizar(fs.readFileSync(destino)))) borrar.push({ rel, destino });
    else ajenos.push(rel);
  }
  for (const rel of delKit) {
    let buf = fs.readFileSync(path.join(raizKit, 'kit', ...rel.split('/')));
    if (rel === SKILL_ARQ) buf = conCarpeta(buf, carpeta);
    const destino = path.join(home, '.claude', ...rel.split('/'));
    const actual = leerBuf(destino);
    if (actual && actual.equals(buf)) {
      iguales++;
      continue;
    }
    if (!actual) {
      copiar.push({ rel, destino, buf, como: 'copio' });
      continue;
    }
    const n = normalizar(actual);
    if (n === normalizar(buf) || historia(rutaGit, raizKit, rel).includes(n)) {
      copiar.push({ rel, destino, buf, como: 'actualizo' });
      continue;
    }
    const e = { rel, destino, buf, diff: diffCorto(buf, actual) };
    editados.push(e);
    if (o.pisarEditados) copiar.push({ ...e, como: 'piso (editado a mano, con --pisar-editados)' });
  }
  return { copiar, editados, iguales, borrar, ajenos };
}

// ---------------------------------------------------------------- kit-pc.md (pasos 5 y 6; D6-3)
const rutaKitPc = (home) => path.join(home, '.claude', 'kit-pc.md');

// → { falta: true } | { rota: '<por qué>' } | { datos: { entorno, gh, proyectos, privada, autoMode: [] }, texto }
function leerKitPc(home) {
  const b = leerBuf(rutaKitPc(home));
  if (!b) return { falta: true };
  let d;
  try {
    d = ficha.leerCabecera(b.toString('utf8')).datos;
  } catch (e) {
    return { rota: e && e.name === 'ErrorFicha' ? `línea ${e.linea}: ${e.mensaje}` : `no se lee (${e.message})` };
  }
  const txt = (k) => (typeof d[k] === 'string' && d[k].trim() && d[k] !== 'no' ? d[k] : null);
  const am = d['auto-mode'];
  if (am !== undefined && !(Array.isArray(am) && am.every((x) => typeof x === 'string'))) return { rota: '"auto-mode" tiene que ser una lista [..] de textos' };
  const pa = PU.autorizacionesPc(home);
  if (pa.rota) return { rota: pa.rota };
  return { datos: { entorno: txt('entorno'), gh: txt('gh'), proyectos: txt('proyectos'), privada: txt('privada'), autoMode: (am || []).filter((x) => x !== DEFAULTS), publica: pa.lista || [] }, texto: b.toString('utf8') };
}

// Un valor para la cabecera: siempre entre comillas, sin \ ni " adentro (la gramática no los acepta).
const comillas = (s) => `"${String(s).replace(/\\/g, '/').replace(/"/g, "'")}"`;
function textoKitPc({ entorno, gh, proyectos, privada, autoMode, publica = [] }) {
  return [
    '---',
    '# El archivo de esta PC (SPEC-paquete-6, D6-3). Lo escribe "preparame esta PC" (preparar-pc.cjs) y lo lee doctor. NO es del kit:',
    '# kit-sync no lo toca. auto-mode = las entradas de autoMode.environment que escribió el kit; las demás son tuyas y no se tocan,',
    '# y si editás una del kit, pasa a ser tuya. privada: la carpeta de la capa privada (con su instalar.cjs), o no.',
    `entorno: ${entorno}`,
    `gh: ${gh ? comillas(gh) : 'no'}`,
    `proyectos: ${proyectos ? comillas(proyectos) : 'no'}`,
    `privada: ${privada ? comillas(privada) : 'no'}`,
    `auto-mode: [${autoMode.map(comillas).join(', ')}]`,
    // 8d C2.2: el sí del dueño por repo, con la huella de cómo publica (lo lee noche.cjs publicar; el contrato: pc/lib/publicar.cjs)
    ...(publica.length ? ['publica:', ...publica.map((x) => `  - {origin: ${comillas(x.origin)}, huella: ${x.huella}}`)] : []),
    '---',
    '',
  ].join('\n');
}

const entornoPc = (env = process.env) => (process.platform === 'linux' && (env.WSL_DISTRO_NAME || /microsoft/i.test(os.release())) ? 'wsl' : 'nativo');

// ---------------------------------------------------------------- autoMode (paso 4; F §14 pieza 3; E §10)
// Una entrada en prosa, como pide la doc (environment = "trusted infrastructure"). Sin \ ni " (así cabe tal cual en kit-pc.md).
const limpiar = (s) => String(s).replace(/[\r\n]+/g, ' ').replace(/\\/g, '/').replace(/"/g, "'").trim();
function entradaAutoMode(proyecto, entorno, clase, acceso) {
  return limpiar(`${proyecto}: ${entorno} (${clase})${acceso ? `: ${acceso}` : ''}`);
}

// ---------------------------------------------------------------- publicar (8d C2.2; D8d-5, rt-2, rt-3, r2-4, r2-7)
// El origin normalizado de un repo (el del contrato), o null.
function originDe(dir) {
  const r = spawnSync('git', ['config', '--get', 'remote.origin.url'], { cwd: dir, encoding: 'utf8', windowsHide: true, timeout: 10000 });
  const u = !r.error && r.status === 0 ? r.stdout.trim() : '';
  return u ? PU.normalizarOrigin(u) : null;
}
// Los repos de la carpeta cuya ficha VIGENTE (la de origin/<defecto>) publica por comando (no al-subir: lo gobierna merge-a-main).
// → [{ proyecto, origin, publicar, huella }] (la huella de hoy, con los archivos de esa ref)
function quePublican(carpeta) {
  const out = [];
  if (!carpeta) return out;
  let rec;
  try {
    rec = R.recorrer(carpeta);
  } catch (e) {
    return out;
  }
  for (const { dir, nombre } of rec.repos) {
    const origin = originDe(dir);
    if (!origin) continue;
    const fv = CX.fichaVigente(dir);
    if (fv.estado !== 'ok' || !fv.ref || !fv.ref.startsWith('refs/remotes/origin/')) continue;
    const pub = esMapa(fv.datos.autorizado) ? fv.datos.autorizado.publicar : undefined;
    if (!esMapa(pub) || typeof pub.comando !== 'string' || pub.comando === PU.AL_SUBIR) continue;
    const proyecto = fv.datos.vars && typeof fv.datos.vars.proyecto === 'string' && fv.datos.vars.proyecto.trim() ? fv.datos.vars.proyecto : nombre;
    out.push({ proyecto, origin, publicar: pub, huella: PU.huella(dir, pub, fv.ref) });
  }
  return out;
}

// Las fichas de los repos de <carpeta> (lib/repos.cjs, SPEC-paquete-8r2 t7: hasta dos niveles, uno por git-common-dir y por origin,
// nunca un worktree; la misma regla que `arquitecto.cjs registro`, lib/flota.cjs y cambios-flota.cjs; el JSON de registro no trae
// los entornos, por eso se recorre acá igual que él) → por cada entorno clase dummy o prueba, una entrada. Orden: repo, entorno.
// → { entradas: [...], avisos: [...] }
function generarAutoMode(carpeta, publica = []) {
  const autorizados = new Set(publica.map((x) => x.origin));
  const entradas = [];
  const avisos = [];
  if (!carpeta) return { entradas, avisos };
  let rec;
  try {
    rec = R.recorrer(carpeta);
  } catch (e) {
    avisos.push(`no encuentro la carpeta de proyectos ${barras(carpeta)}`);
    return { entradas, avisos };
  }
  avisos.push(...rec.avisos);
  for (const { dir, rel, nombre } of rec.repos) {
    const k = path.join(dir, '.claude', 'kit.md');
    if (!fs.existsSync(k)) continue;
    let datos;
    try {
      datos = ficha.leerArchivo(k).datos;
    } catch (e) {
      avisos.push(`${rel}/.claude/kit.md no se lee${e && e.name === 'ErrorFicha' ? ` (línea ${e.linea})` : ''}: sus entornos no entran`);
      continue;
    }
    const alias = datos.vars && typeof datos.vars.proyecto === 'string' && datos.vars.proyecto.trim() ? datos.vars.proyecto : nombre;
    // 8d C2.3: para las sesiones de día, el repo que el dueño autorizó a publicar desde esta PC (la sesión de cierre no lo necesita)
    if (autorizados.size) {
      const og = originDe(dir);
      if (og && autorizados.has(og)) {
        const e = limpiar(`${alias} (${og}): publicar con «node .claude/scripts/noche.cjs publicar» está autorizado por el dueño en esta PC`);
        if (!entradas.includes(e)) entradas.push(e);
      }
    }
    for (const [ent, v] of Object.entries(esMapa(datos.entornos) ? datos.entornos : {})) {
      if (!esMapa(v) || (v.clase !== 'dummy' && v.clase !== 'prueba')) continue;
      const e = entradaAutoMode(alias, ent, v.clase, typeof v.acceso === 'string' ? v.acceso : '');
      if (!entradas.includes(e)) entradas.push(e);
    }
  }
  return { entradas, avisos };
}

// La mezcla por regla. `actual` = autoMode.environment de hoy (undefined si no existe); `delKit` = las que escribió el kit (kit-pc.md);
// `generadas` = las de hoy. El kit es dueño SOLO de las suyas: saca las que ya no se generan, deja en su lugar las que siguen, suma
// las nuevas al final; una generada que ya estaba idéntica en la lista se reclama como del kit (RF-2). Las demás no se tocan; una del
// kit que Guido editó ya no está igual → es de él. "$defaults" nunca es del kit ni
// se saca (r1-1). Si la lista no existe y hay algo que poner, se crea con "$defaults" primero.
// → { lista (undefined = no hay lista), delKit, sinDefaults }
function mezclarAutoMode(actual, delKit, generadas) {
  const gen = [];
  for (const e of generadas) if (e !== DEFAULTS && !gen.includes(e)) gen.push(e);
  if (actual === undefined) return gen.length ? { lista: [DEFAULTS, ...gen], delKit: gen, sinDefaults: false } : { lista: undefined, delKit: [], sinDefaults: false };
  const previo = new Set(delKit.filter((e) => e !== DEFAULTS));
  const lista = [];
  const nuevoDelKit = [];
  for (const e of actual) {
    if (e === DEFAULTS || !previo.has(e)) {
      lista.push(e);
      continue;
    }
    if (gen.includes(e) && !nuevoDelKit.includes(e)) {
      lista.push(e);
      nuevoDelKit.push(e);
    }
  }
  for (const e of gen) {
    if (lista.includes(e)) {
      // RF-2: una que el kit genera y ya está idéntica en la lista se reclama como del kit (si no, nunca saldría al borrar el proyecto)
      if (!nuevoDelKit.includes(e)) nuevoDelKit.push(e);
      continue;
    }
    lista.push(e);
    nuevoDelKit.push(e);
  }
  nuevoDelKit.sort((a, b) => lista.indexOf(a) - lista.indexOf(b)); // en el orden de la lista: la 2.ª corrida escribe lo mismo
  return { lista, delKit: nuevoDelKit, sinDefaults: !lista.includes(DEFAULTS) };
}

// crossSessionInbound (G §10.3; D6-4): si falta lo pone en accept; si dice otra cosa, no lo toca.
// → { valor, estado: 'puesto' | 'igual' | 'ajeno' | 'raro' }
function mezclarCrossSession(actual) {
  if (actual === undefined) return { valor: 'accept', estado: 'puesto' };
  if (actual === 'accept') return { valor: actual, estado: 'igual' };
  if (CROSS.includes(actual)) return { valor: actual, estado: 'ajeno' };
  return { valor: actual, estado: 'raro' };
}

// ---------------------------------------------------------------- principal
// La ruta real, con barras y (en Windows) en minúsculas: para comparar carpetas.
function rutaReal(p) {
  let r;
  try {
    r = fs.realpathSync.native(p);
  } catch (e) {
    r = path.resolve(p);
  }
  r = barras(r).replace(/\/+$/, '');
  return WIN ? r.toLowerCase() : r;
}

function principal(argv, { env = process.env, cwd = process.cwd(), renombrar = fs.renameSync, nodeVersion, script = __filename } = {}) {
  const salida = [];
  const log = (t) => salida.push(t);
  const fin = (codigo) => ({ codigo, texto: salida.join('\n') });
  let o;
  try {
    o = leerArgs(argv);
  } catch (e) {
    log(`${USO} — ${e.message}`);
    return fin(2);
  }
  const home = path.resolve(o.home || os.homedir());
  const raizKit = path.resolve(o.kit);
  const r = I.rutas(home);
  log(`preparar-pc${o.plan ? ' (plan: no escribo nada)' : ''}${o.flota ? ' · modo flota' : ''} · ${barras(r.claude)} · kit ${barras(raizKit)}`);
  const tabla = [];
  const acciones = [];

  // 1. programas
  const prog = chequearProgramas(env, cwd, nodeVersion);
  tabla.push(...prog.lineas);

  // 2. el kit: ¿es un kit, parado en un tag anotado?
  const version = (leerBuf(path.join(raizKit, 'kit', 'VERSION')) || '').toString().trim();
  if (!version) {
    log(lin('✗', 'kit', `${barras(raizKit)} no es la raíz de un kit (no hay kit/VERSION)`, 'pasá con --kit la raíz de un clon del kit'));
    log('no toqué nada.');
    return fin(1);
  }
  // RF-3: este script (y el instalar-hooks-pc que importa de su carpeta) tiene que ser el del clon; si es el instalado en
  // ~/.claude/ con --kit <clon nuevo>, mezclaría la lógica vieja con el kit nuevo.
  const scriptDir = rutaReal(path.dirname(script));
  const kitReal = rutaReal(raizKit);
  if (scriptDir !== kitReal && !scriptDir.startsWith(`${kitReal}/`)) {
    const propio = barras(path.join(raizKit, 'kit', 'skills', 'arquitecto-skills', 'scripts', 'preparar-pc.cjs'));
    log(lin('✗', 'kit', `este preparar-pc (${barras(script)}) no es el del kit que pasaste`, `corré el preparar-pc del clon: node ${propio} --kit ${barras(raizKit)}`));
    log('no toqué nada.');
    return fin(1);
  }
  // RF-1: en un clon sin historia (--depth 1) toda versión vieja instalada parecería "editada a mano".
  if (prog.rutaGit) {
    const sh = gitKit(prog.rutaGit, raizKit, ['rev-parse', '--is-shallow-repository']);
    if (sh && sh.toString('utf8').trim() === 'true') {
      log(lin('✗', 'kit', `${barras(raizKit)} es un clon sin historia (shallow): no puedo saber qué es del kit y qué editaste`, `git -C ${barras(raizKit)} fetch --unshallow --tags, y volvé a correr`));
      log('no toqué nada.');
      return fin(1);
    }
  }
  let tag = null;
  if (!o.kitSinTag) {
    tag = prog.rutaGit ? tagAnotado(prog.rutaGit, raizKit) : null;
    if (!tag) {
      log(lin('✗', 'kit', `${barras(raizKit)} no está parado en un tag anotado v* (r1-7: nunca la punta de main)`, 'git clone del kit y git checkout del último tag v*, y volvé a correr'));
      log('no toqué nada.');
      return fin(1);
    }
  }

  // kit-pc.md de hoy (lo necesitan la carpeta, la capa privada y autoMode)
  const kp = leerKitPc(home);
  if (kp.rota) {
    log(lin('✗', 'archivo-pc', `${barras(rutaKitPc(home))} no se lee: ${kp.rota}`, 'corregilo a mano (o borralo) y volvé a correr'));
    log('no toqué nada.');
    return fin(1);
  }
  const prev = kp.datos || { autoMode: [] };
  let carpeta = null;
  if (o.proyectos) {
    const c = path.resolve(cwd, o.proyectos);
    if (!fs.existsSync(c) || !fs.statSync(c).isDirectory()) {
      log(lin('✗', 'proyectos', `${barras(c)} no es una carpeta`, 'pasá con --proyectos la carpeta donde viven tus proyectos'));
      log('no toqué nada.');
      return fin(1);
    }
    carpeta = barras(c);
  } else carpeta = prev.proyectos || carpetaDelSkill(home);
  if (carpeta) carpeta = barras(carpeta); // una sola forma en los dos lugares (kit-pc.md y el SKILL.md): si no, la 2.ª corrida reescribe

  let pk;
  try {
    pk = planKit(raizKit, home, carpeta, prog.rutaGit, o);
  } catch (e) {
    log(lin('✗', 'kit', `no pude armar el plan del kit: ${e.message}`, 'revisá el clon del kit'));
    log('no toqué nada.');
    return fin(1);
  }

  // 3. los hooks por PC (la lógica de instalar-hooks-pc) y 4. el settings, sobre el mismo valor: una sola escritura
  const s = I.leerSettings(r);
  if (s.problema) {
    log(lin('✗', 'settings', s.problema, 'corregilo a mano (no lo toco roto) y volvé a correr'));
    log('no toqué nada.');
    return fin(1);
  }
  let ph;
  try {
    ph = I.planInstalar(r, s, { sacarViejo: false });
  } catch (e) {
    log(lin('✗', 'hooks-pc', `no pude armar el plan: ${e.message}`, 'avisale a Guido: es un bug'));
    log('no toqué nada.');
    return fin(1);
  }
  const v = leerJsonSinDuplicados(ph.nuevoTexto || '{}').valor;
  // crossSessionInbound
  const cs = mezclarCrossSession(v.crossSessionInbound);
  v.crossSessionInbound = cs.valor;
  // autoMode.environment
  if ('autoMode' in v && !esMapa(v.autoMode)) {
    log(lin('✗', 'automode', `${barras(r.settings)}: "autoMode" no es un objeto — así no se toca`, 'corregilo a mano y volvé a correr'));
    log('no toqué nada.');
    return fin(1);
  }
  const envActual = esMapa(v.autoMode) ? v.autoMode.environment : undefined;
  if (envActual !== undefined && !(Array.isArray(envActual) && envActual.every((x) => typeof x === 'string'))) {
    log(lin('✗', 'automode', `${barras(r.settings)}: "autoMode.environment" no es una lista de textos — así no se toca`, 'corregilo a mano y volvé a correr'));
    log('no toqué nada.');
    return fin(1);
  }
  // 8d C2.2: el sí por repo. Sin --publica ni --no-publica, publica: queda tal cual (r2-7)
  const candidatos = quePublican(carpeta);
  let publica = [...(prev.publica || [])];
  const lineasPub = [];
  for (const u of o.noPublica) {
    const og = PU.normalizarOrigin(u);
    const antes = publica.length;
    publica = publica.filter((x) => x.origin !== og);
    lineasPub.push(lin('✓', 'publicar', antes !== publica.length ? `${og}: saqué tu autorización (la noche ya no publica desde esta PC)` : `${og}: no estaba autorizado`));
  }
  for (const u of o.publica) {
    const og = PU.normalizarOrigin(u);
    const c = candidatos.find((x) => x.origin === og);
    if (!c) {
      log(lin('✗', 'publicar', `${og}: no encuentro en tu carpeta de proyectos un repo con ese origin cuya ficha vigente publique (autorizado.publicar con un comando, en origin)`, 'subí la ficha con autorizado.publicar y volvé a correr'));
      log('no toqué nada.');
      return fin(1);
    }
    publica = [...publica.filter((x) => x.origin !== og), { origin: og, huella: c.huella }];
    lineasPub.push(lin('✓', 'publicar', `${c.proyecto} (${og}): autorizado a publicar solo desde esta PC, con la huella de hoy`));
  }
  const pedidos = new Set([...o.publica, ...o.noPublica].map((u) => PU.normalizarOrigin(u)));
  for (const c of candidatos) {
    if (pedidos.has(c.origin)) continue;
    const ya = publica.find((x) => x.origin === c.origin);
    if (ya && ya.huella === c.huella) continue;
    const como = `publica con: ${c.publicar.comando} · lo prueba con: ${c.publicar.humo || '(sin humo)'} · vuelve atrás con: ${c.publicar.volver || 'no declara'}`;
    if (ya) lineasPub.push(lin('⚠', 'publicar', `${c.proyecto} (${c.origin}) cambió cómo publica: la noche no publica hasta que lo vuelvas a autorizar · ${como}`, `la sesión te pregunta; con tu sí: --publica ${c.origin}`));
    else lineasPub.push(lin('⚠', 'publicar', `${c.proyecto} (${c.origin}) publica sola si lo autorizás desde esta PC · ${como}`, `la sesión te pregunta; con tu sí: --publica ${c.origin} (con el no, nada)`));
  }
  const gen = generarAutoMode(carpeta, publica);
  const am = mezclarAutoMode(envActual, prev.autoMode, gen.entradas);
  if (am.lista !== undefined) {
    if (!esMapa(v.autoMode)) v.autoMode = {};
    v.autoMode.environment = am.lista;
  }
  const settingsCambia = !s.existe || !igualJson(v, s.valor);
  const textoSettings = settingsCambia ? I.serializar(v, I.formato(s.texto)) : s.texto;

  // 6. kit-pc.md nuevo
  const privada = prev.privada;
  const nuevoKitPc = textoKitPc({ entorno: entornoPc(env), gh: prog.gh || prev.gh || null, proyectos: carpeta, privada, autoMode: am.delKit, publica });
  const kitPcCambia = kp.texto !== nuevoKitPc;

  // ---- el plan, entero
  // RF-12: con editados sin pisar (o salteados con --flota) el kit instalado no es el nuevo entero: VERSION no sube (así doctor
  // version-kit sigue diciendo "atrás"). Con --pisar-editados o sin editados, se escribe como siempre.
  const editadosSinPisar = o.pisarEditados ? 0 : pk.editados.length;
  const versionRetenida = editadosSinPisar > 0 && pk.copiar.some((c) => c.rel === 'VERSION');
  if (versionRetenida) pk.copiar = pk.copiar.filter((c) => c.rel !== 'VERSION');
  for (const c of pk.copiar) acciones.push(`${c.como} ~/.claude/${c.rel}`);
  for (const b of pk.borrar) acciones.push(`borro ~/.claude/${b.rel}: el kit ya no lo trae (está intacto)`);
  const saltear = o.pisarEditados ? [] : pk.editados;
  for (const e of saltear) acciones.push(`${o.flota ? 'salteo' : 'NO piso'} ~/.claude/${e.rel}: editado a mano (no es ninguna versión del kit)`);
  const accionesHooks = ph.acciones.filter((a) => !a.endsWith(barras(r.settings)));
  acciones.push(...accionesHooks);
  if (settingsCambia) acciones.push(`${s.existe ? 'actualizo' : 'creo'} ${barras(r.settings)} (hooks por PC, crossSessionInbound y autoMode, en una sola escritura)`);
  if (kitPcCambia) acciones.push(`${kp.falta ? 'creo' : 'actualizo'} ${barras(rutaKitPc(home))}`);

  // ---- la tabla (antes de escribir: lo que pasa con cada paso)
  const nKit = pk.copiar.length;
  tabla.push(lin('✓', 'kit', `kit ${version}${tag ? ` (tag ${tag})` : ' (sin tag: prueba)'} · ${nKit ? `${nKit} archivo${nKit > 1 ? 's' : ''} para copiar` : 'sin cambios'}${pk.borrar.length ? ` · ${pk.borrar.length} para borrar (el kit ya no los trae)` : ''} · ${pk.iguales} iguales`));
  if (versionRetenida) tabla.push(lin('⚠', 'version', `VERSION no subió: quedaron ${editadosSinPisar} archivo${editadosSinPisar === 1 ? '' : 's'} editado${editadosSinPisar === 1 ? '' : 's'} sin pisar`, 'llevá la edición al kit o volvé a correr con --pisar-editados'));
  if (pk.ajenos.length) tabla.push(lin('⚠', 'sobrantes', `lo dejo: no es del kit o lo editaste: ${pk.ajenos.join(', ')}`, 'si es tuyo a propósito, dejalo; si no, borralo a mano'));
  if (saltear.length) {
    const nombres = saltear.map((e) => e.rel).join(', ');
    tabla.push(
      o.flota
        ? lin('⚠', 'editados', `salteados (modo flota): ${nombres}`, 'si la edición es a propósito, llevala al kit; si no, "preparame esta PC" con --pisar-editados')
        : lin('⚠', 'editados', `no los piso: ${nombres}`, 'mirá el diff; si querés el del kit, volvé a correr con --pisar-editados'),
    );
    if (!o.flota) for (const e of saltear) tabla.push(`  diff ~/.claude/${e.rel} (- kit, + el tuyo):`, ...e.diff.map((l) => `    ${l}`));
  }
  for (const a of ph.avisos) tabla.push(lin('⚠', 'hooks-pc', a.replace(/^⚠️\s*/, '')));
  tabla.push(lin('✓', 'hooks-pc', accionesHooks.length ? `${accionesHooks.length} paso${accionesHooks.length > 1 ? 's' : ''} (corrector de secretos, deny del almacén)` : 'sin cambios'));
  if (cs.estado === 'puesto') tabla.push(lin('✓', 'cross-session', 'crossSessionInbound no estaba: lo pongo en "accept"'));
  else if (cs.estado === 'igual') tabla.push(lin('✓', 'cross-session', 'crossSessionInbound = "accept"'));
  else tabla.push(lin('⚠', 'cross-session', `crossSessionInbound dice ${JSON.stringify(cs.valor)}${cs.estado === 'raro' ? ' (no es accept, hold ni refuse)' : ''}: no lo toco`, 'para recibir los mensajes de tus otras sesiones, ponelo en "accept" (en /config o en ~/.claude/settings.json)'));
  for (const a of gen.avisos) tabla.push(lin('⚠', 'automode', a, 'arreglá esa ficha (doctor te dice el renglón)'));
  if (am.lista === undefined) tabla.push(lin('✓', 'automode', carpeta ? 'ningún entorno dummy o prueba en las fichas: no hay nada que poner' : 'sin carpeta de proyectos: no hay fichas que leer'));
  else {
    tabla.push(lin('✓', 'automode', `${am.delKit.length} entrada${am.delKit.length === 1 ? '' : 's'} del kit en autoMode.environment${envActual === undefined ? ' (lista nueva, con "$defaults" primero)' : ''}`));
    if (am.sinDefaults) tabla.push(lin('⚠', 'automode', 'tu autoMode.environment no trae "$defaults": reemplaza los de fábrica (Trusted repo, Source control) — lo dejo así', 'si no fue a propósito, agregá "$defaults" al principio de la lista'));
  }
  if (!carpeta) tabla.push(lin('⚠', 'proyectos', 'no sé dónde viven tus proyectos', 'volvé a correr con --proyectos <carpeta>'));
  tabla.push(...lineasPub);

  log('');
  for (const a of acciones) log(`${o.plan ? '· haría: ' : '· '}${a}`);
  if (!acciones.length) log('sin cambios: no hay nada que escribir.');

  // ---- escribir (todo el plan ya está armado)
  let rojo = false;
  if (!o.plan && acciones.length) {
    try {
      for (const c of pk.copiar) escribirAtomico(c.destino, c.buf, renombrar);
      for (const b of pk.borrar) {
        fs.rmSync(b.destino, { force: true });
        // 8d C2.5 (35a): y las carpetas que quedan vacías, hasta la de la skill (esa no)
        const tope = path.join(home, '.claude', ...b.rel.split('/').slice(0, b.rel.startsWith('skills/') ? 2 : 1));
        for (let dir = path.dirname(b.destino); dir.length > tope.length && dir.startsWith(tope); dir = path.dirname(dir)) {
          try {
            if (fs.readdirSync(dir).length) break;
            fs.rmdirSync(dir);
          } catch (e) {
            break;
          }
        }
      }
      I.aplicarInstalar(r, s, { ...ph, settingsCambia: false });
      if (settingsCambia) escribirAtomico(r.settings, textoSettings, renombrar);
      if (kitPcCambia) escribirAtomico(rutaKitPc(home), nuevoKitPc, renombrar);
    } catch (e) {
      tabla.push(lin('✗', 'escritura', e.message, 'volvé a correr: lo que quedó escrito está entero (cada archivo, el viejo o el nuevo)'));
      rojo = true;
    }
  }

  // 5. la capa privada (después de lo público: si falla, lo público queda)
  if (!rojo) {
    if (!privada) tabla.push(lin('✓', 'capa-privada', 'no hay — instalé solo lo público'));
    else {
      const ins = path.join(privada, 'instalar.cjs');
      if (!fs.existsSync(ins)) tabla.push(lin('⚠', 'capa-privada', `${barras(privada)} no trae instalar.cjs: no corrí nada`, 'revisá la línea privada: de kit-pc.md'));
      else {
        const p = spawnSync(process.execPath, [ins, '--home', home, ...(o.plan ? ['--plan'] : [])], { cwd: privada, env, encoding: 'utf8', timeout: PLAZO_PRIVADA, windowsHide: true });
        const salidaP = `${p.stdout || ''}${p.stderr || ''}`.split(/\r?\n/).filter((l) => l.trim());
        if (p.error || p.status !== 0) {
          const por = p.error && p.error.code === 'ETIMEDOUT' ? `no terminó en ${PLAZO_PRIVADA / 1000} s` : p.error ? p.error.message : `salió ${p.status}`;
          tabla.push(lin('✗', 'capa-privada', `${barras(ins)} falló (${por}); lo público quedó instalado`, 'mirá su salida abajo y volvé a correr'));
          rojo = true;
        } else tabla.push(lin('✓', 'capa-privada', `${barras(ins)}${o.plan ? ' --plan' : ''} anduvo`));
        for (const l of salidaP) tabla.push(`  privada │ ${l}`);
      }
    }
  }
  tabla.push(lin('✓', 'archivo-pc', `${kitPcCambia ? (o.plan ? 'escribiría' : 'escribí') : 'sin cambios'} ${barras(rutaKitPc(home))} · proyectos: ${carpeta || 'no'} · privada: ${privada ? barras(privada) : 'no'}`));

  log('');
  for (const l of tabla) log(l);

  // 7. doctor (sin --plan)
  if (!o.plan) {
    const doc = path.join(home, '.claude', 'skills', 'arquitecto-skills', 'scripts', 'doctor.cjs');
    if (fs.existsSync(doc)) {
      const d = spawnSync(process.execPath, [doc, '--home', home], { cwd, env, encoding: 'utf8', timeout: PLAZO_DOCTOR, windowsHide: true });
      log('');
      log(`doctor${d.status === 0 ? '' : ` (salió ${d.status === null ? 'por plazo' : d.status})`}:`);
      for (const l of `${d.stdout || ''}`.split(/\r?\n/).filter(Boolean)) log(`  ${l}`);
    }
  }
  log('');
  if (o.plan) log('plan: no escribí nada. Sin --plan, lo aplico.');
  else log(rojo ? 'quedó algo en ✗: arreglalo y volvé a correr. Después, reiniciá Claude Code.' : 'listo: reiniciá Claude Code.');
  return fin(rojo ? 1 : 0);
}

if (require.main === module) {
  const { codigo, texto } = principal(process.argv.slice(2));
  process.stdout.write(`${texto}\n`, () => process.exit(codigo));
}

module.exports = {
  principal,
  // para doctor (una sola fuente)
  generarAutoMode,
  quePublican,
  mezclarAutoMode,
  entradaAutoMode,
  leerKitPc,
  rutaKitPc,
  textoKitPc,
  DEFAULTS,
  // para las pruebas
  mezclarCrossSession,
  escribirAtomico,
  normalizar,
  leerArgs,
  MIN_CLAUDE,
};
