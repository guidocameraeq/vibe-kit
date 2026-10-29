'use strict';
// secretos.cjs — el corrector de secretos de la PC (SPEC-paquete-3 P4.3; diseño F §7, §8, §9, §11; RT1-4, RT2-2; r1-3, r1-9,
// r1-12, r1-14, r1-15, r1-21). Corre en TODO proyecto, con kit o sin. Es un hook que NIEGA (P4.7): onFailure "block",
// timeout 20 y forma exec los pone el instalador de la PC (G10), no este archivo.
//
//   - PreToolUse sobre Bash|PowerShell|Write|Edit|MultiEdit|NotebookEdit: mira tool_input.command, content, new_string,
//     edits[].new_string y new_source.
//   - UserPromptSubmit (D-5): mira el prompt; si trae una clave con forma real, decision "block" con suppressOriginalPrompt
//     (verificado en https://code.claude.com/docs/en/hooks el 2026-10-29: decision y reason al tope, suppressOriginalPrompt
//     dentro de hookSpecificOutput). FALLA ABIERTO: ante cualquier error interno sale 0 sin bloquear.
//
// NUNCA hace require fuera de ./lib/ (D-12). <home> = la carpeta de usuario que contiene .claude, sacada del __dirname del
// hook instalado (<home>/.claude/hooks/kit/secretos.cjs), NUNCA os.homedir() (r1-15): la prueba del criterio 13 corre este
// archivo desde una copia sola con HOME/USERPROFILE apuntando a otro lado y el log tiene que caer bajo <home>.
// Node estándar salvo ./lib/. Es .cjs a propósito: corre igual en proyectos con "type": "module".

const fs = require('fs');
const path = require('path');
const comando = require('./lib/comando.cjs');
const contexto = require('./lib/contexto.cjs');
const agente = require('./lib/agente.cjs');
const frenosLog = require('./lib/frenos-log.cjs');

const HERRAMIENTAS_TOOL = ['Bash', 'PowerShell', 'Write', 'Edit', 'MultiEdit', 'NotebookEdit'];
const COMANDO = ['Bash', 'PowerShell'];
const ESCRITURA = ['Write', 'Edit', 'MultiEdit', 'NotebookEdit'];
const CON_VENTANA = new Set(['default', 'acceptEdits', 'plan', 'auto']);
const SIN_VENTANA_DURO = new Set(['bypassPermissions', 'dontAsk']);
const ROTO = 'freno roto: corré doctor';

// ---------------------------------------------------------------- <home> por __dirname (r1-15)

// El hook instalado vive en <home>/.claude/hooks/kit/secretos.cjs; <home> es la carpeta ANTES de ese `.claude`.
function homeDelHook() {
  const marca = `${path.sep}.claude${path.sep}`;
  const d = __dirname + path.sep;
  const i = d.toLowerCase().lastIndexOf(marca.toLowerCase());
  if (i >= 0) return d.slice(0, i);
  return path.resolve(__dirname, '..', '..', '..'); // kit -> hooks -> .claude -> <home>
}
const HOME = homeDelHook();

// ---------------------------------------------------------------- patrones de clave (sin claves literales en kit/, r1-4)

// Se arman de fragmentos: así el texto del propio archivo NO matchea sus regex (la prueba hace grep de estos mismos patrones
// sobre kit/ y espera 0). El banco se exporta para que la prueba use EXACTAMENTE estos.
function bancoPatrones() {
  return [
    { id: 'github-pat', re: new RegExp('gh' + 'p_[A-Za-z0-9]{30,}') },
    { id: 'github-fino', re: new RegExp('github' + '_pat_[A-Za-z0-9_]{30,}') },
    { id: 'sk-api', re: new RegExp('sk' + '-(?:proj|ant)-[A-Za-z0-9_-]{20,}') },
    { id: 'supabase-token', re: new RegExp('sb' + 'p_[0-9a-f]{20,}') },
    { id: 'twilio', re: new RegExp('A' + 'C[0-9a-f]{32}:[0-9a-f]{16,}') },
    { id: 'aws', re: new RegExp('AK' + 'IA[0-9A-Z]{16}') },
    { id: 'clave-privada', re: new RegExp('-----BE' + 'GIN[A-Z0-9 ]*PRIVATE KEY-----') },
    { id: 'slack', re: new RegExp('xo' + 'x[baprs]-') },
    { id: 'stripe', re: new RegExp('(?:sk|rk)' + '_live_') },
  ];
}
const PATRONES = bancoPatrones();
const RE_JWT = new RegExp('ey' + 'J[A-Za-z0-9_-]+\\.ey' + 'J[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]*');

// ¿el cuerpo (segundo tramo) del jwt dice role anon? base64url → texto. service_role (o cualquier otro) NO es anon.
function jwtEsAnon(token) {
  const tramos = token.split('.');
  if (tramos.length < 2) return false;
  let b = tramos[1].replace(/-/g, '+').replace(/_/g, '/');
  while (b.length % 4) b += '=';
  let txt = '';
  try {
    txt = Buffer.from(b, 'base64').toString('utf8');
  } catch (e) {
    return false;
  }
  const sinEsp = txt.replace(/\s+/g, '');
  return /"role":"anon"/.test(sinEsp);
}

// textos → [{id}] de patrones que matchean. El jwt pasa solo si es anon.
function clavesEn(textos) {
  const hits = [];
  const t = textos.filter((x) => typeof x === 'string').join('\n');
  if (t === '') return hits;
  for (const p of PATRONES) if (p.re.test(t)) hits.push({ id: `secretos:${p.id}` });
  let m;
  const re = new RegExp(RE_JWT.source, 'g');
  while ((m = re.exec(t)) !== null) {
    if (!jwtEsAnon(m[0])) {
      hits.push({ id: 'secretos:jwt' });
      break;
    }
  }
  return hits;
}

// ---------------------------------------------------------------- nombres de variable sensibles

// Los de fábrica (D-14, r2-6): se prueban como subcadena salvo las anclas _KEY$ / _DSN$ / ..._DSN.
const FABRICA_VARS = [
  /TOKEN/, /SECRET/, /PASSWORD/, /PASS/, /PWD/, /API_KEY/, /PRIVATE_KEY/, /SERVICE_ROLE/,
  /_KEY$/, /CREDENTIAL/, /DATABASE_URL/, /DB_URL/, /_DSN/, /CONNECTION_STRING/,
];
function varSensible(nombre, extra, publicas) {
  const n = String(nombre || '').toUpperCase();
  if (n === '') return false;
  if (publicas && publicas.has(n)) return false;
  if (extra && extra.has(n)) return true;
  return FABRICA_VARS.some((re) => re.test(n));
}

// ---------------------------------------------------------------- rutas del deny (archivo-deny)

// Resuelve ~ contra <home>. Todo en minúscula y con / (Windows: sin mayúsculas).
function norm(p) {
  return String(p).replace(/\\/g, '/').toLowerCase();
}
const HOME_N = norm(HOME);
function expandeTilde(p) {
  const s = String(p);
  if (s === '~') return HOME;
  if (s.startsWith('~/') || s.startsWith('~\\')) return path.join(HOME, s.slice(2));
  return s;
}

// El token puede traer comodines (.e*, .en?) o ser una variable ya resuelta. Devuelve true si NOMBRA una ruta de F §5 u
// otra del deny de archivo (no las de la PC, que van por su propia regla).
function esRutaDenyArchivo(tokenCrudo, settingsDelProyecto) {
  if (typeof tokenCrudo !== 'string' || tokenCrudo === '') return false;
  const token = expandeTilde(tokenCrudo);
  const n = norm(token);
  const segs = n.split('/').filter((x) => x !== '');
  const base = segs.length ? segs[segs.length - 1] : n;

  // Un comodín del token que pueda matchear .env / .env.* / *.pem / *.key.
  const tieneComodin = /[*?[]/.test(base);
  const comodinMatchea = (objetivo) => {
    if (!tieneComodin) return false;
    const re = new RegExp('^' + base.replace(/[.+^${}()|\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.').replace(/\[/g, '[') + '$');
    return re.test(objetivo);
  };

  if (base === '.env' || base.startsWith('.env.') || comodinMatchea('.env') || comodinMatchea('.env.x')) return true;
  if (base.endsWith('.pem') || base.endsWith('.key') || comodinMatchea('x.pem') || comodinMatchea('x.key')) return true;
  if (segs.includes('secrets')) return true;

  // Carpetas de la casa (F §5 + kit-secretos).
  const casa = [['.ssh'], ['.aws'], ['.config', 'gh'], ['.config', 'kit-secretos'], ['appdata', 'roaming', 'github cli']];
  for (const c of casa) {
    const bajo = `${HOME_N}/${c.join('/')}`;
    if (n === bajo || n.startsWith(`${bajo}/`)) return true;
  }
  // El token puede nombrarlas relativas a la casa aun sin resolver (~/.ssh/… ya se expandió arriba).

  // /proc/self/environ y /proc/*/environ.
  if (/^\/proc\/(self|[^/]+)\/environ$/.test(n)) return true;

  // settings.json / settings.local.json del proyecto (.claude/…).
  if ((base === 'settings.json' || base === 'settings.local.json') && segs.includes('.claude')) return true;

  return !!settingsDelProyecto && settingsDelProyecto.has(n);
}

// ---------------------------------------------------------------- lectores permitidos (archivo-deny)

const LECTORES_OK = new Set(['ls', 'dir', 'get-childitem', 'gci', 'stat', 'rm', 'remove-item', 'del', 'ri', 'test', '[', 'test-path']);
function gitDeLectura(argv) {
  const sub = (argv[1] || '').toLowerCase();
  if (sub === 'status' || sub === 'check-ignore') return true;
  if (sub === 'rm' && argv.slice(2).some((a) => a === '--cached')) return true;
  return false;
}
// ¿este comando simple, que nombra una ruta del deny, es "seguro" (no revela contenido)?
function comandoSeguroParaDeny(c, prog, hayPrinterOsetx) {
  if (LECTORES_OK.has(prog)) {
    if (prog === 'git') return gitDeLectura(c.argv);
    return true;
  }
  if (prog === 'git') return gitDeLectura(c.argv);
  // --env-file[= ]<ruta>: "usar sin ver" (§8).
  if (c.argv.some((a) => a === '--env-file' || /^--env-file=/.test(a))) return true;
  // source / . de la ruta: seguro si en la MISMA llamada no hay impresor ni set -x.
  if ((prog === 'source' || prog === '.') && !hayPrinterOsetx) return true;
  // echo/printf redirigido a .gitignore/.dockerignore: la ruta es texto.
  if ((prog === 'echo' || prog === 'printf' || prog === 'write-output') && (c.redirecciones || []).some((r) => /^(>|>>)$/.test(r.op) && /(^|\/)\.(git|docker)ignore$/.test(norm(r.destino)))) {
    return true;
  }
  return false;
}

// ---------------------------------------------------------------- impresores y verbosos

const IMPRESORES = new Set(['echo', 'printf', 'print', 'write-output', 'write-host', 'write-information', 'out-host', 'out-string', 'tee']);
const RE_VERBOSO = /^(-v|--verbose|--trace.*|-x)$/i;
function hayVerboso(c) {
  if ((c.argv || []).some((a) => RE_VERBOSO.test(a))) return true;
  const p = comando.programa(c.argv && c.argv[0]);
  if ((p === 'bash' || p === 'sh') && (c.argv || []).some((a) => /^-[a-z]*x/i.test(a))) return true;
  if (p === 'set' && (c.argv || []).some((a) => /^-[a-z]*x/i.test(a))) return true;
  return false;
}
// nombres de variable mencionados en un texto ($X, ${X}, $env:X, %X%, ${env:X}).
function varsEn(texto) {
  const out = [];
  const s = String(texto || '');
  let m;
  const r1 = /\$\{?env:([A-Za-z_][A-Za-z0-9_]*)\}?/g;
  while ((m = r1.exec(s))) out.push(m[1]);
  const r2 = /\$\{?([A-Za-z_][A-Za-z0-9_]*)\}?/g;
  while ((m = r2.exec(s))) if (!/^env$/i.test(m[1])) out.push(m[1]);
  const r3 = /%([A-Za-z_][A-Za-z0-9_]*)%/g;
  while ((m = r3.exec(s))) out.push(m[1]);
  return out;
}

// ---------------------------------------------------------------- credencial-guardada

function esCredencialGuardada(c) {
  const p = comando.programa(c.argv && c.argv[0]);
  const a = (c.argv || []).map((x) => String(x).toLowerCase());
  if (p === 'gh' && a[1] === 'auth' && a[2] === 'token') return true;
  if (p === 'gh' && a[1] === 'auth' && a[2] === 'status' && a.some((x) => x === '-t' || x === '--show-token')) return true;
  if (p === 'git' && a[1] === 'credential' && a[2] === 'fill') return true;
  if (p === 'git' && a[1] === 'credential-manager' && (a[2] === 'get')) return true;
  if (p === 'git-credential-manager' && a[1] === 'get') return true;
  return false;
}

// ---------------------------------------------------------------- frenos del proyecto / de la PC (rutas)

// ¿la ruta (relativa al cwd o absoluta) es un freno del proyecto? g = datosGit del cwd.
function rutaFrenoProyecto(tokenCrudo, g) {
  if (typeof tokenCrudo !== 'string' || tokenCrudo === '' || !g) return null;
  const abs = norm(path.resolve(g.raiz, expandeTilde(tokenCrudo)));
  const raiz = norm(g.raiz);
  const comun = norm(g.gitComun);
  // 1) dentro del git-dir común (va primero: en el checkout principal raiz/.git === el común)
  const bajoComun = abs === comun ? '' : abs.startsWith(`${comun}/`) ? abs.slice(comun.length + 1) : null;
  if (bajoComun !== null && bajoComun !== '') {
    if (bajoComun === 'index.lock') return null; // libre
    if (bajoComun === 'config') return '<común>/config';
    if (bajoComun === 'hooks' || bajoComun.startsWith('hooks/')) return `<común>/${bajoComun}`;
    if (bajoComun === 'packed-refs' || bajoComun === 'fetch_head' || bajoComun.startsWith('refs/')) return `<común>/${bajoComun}`;
    if (bajoComun.startsWith('logs/') || bajoComun.startsWith('worktrees/')) return `<común>/${bajoComun}`;
    if (bajoComun.endsWith('.lock')) return `<común>/${bajoComun}`; // un .lock viejo: "pedíselo al director"
    return null; // otras cosas del .git común (ORIG_HEAD, COMMIT_EDITMSG…) no están en la lista
  }
  // 2) relativas a la raíz del worktree
  const rel = abs === raiz ? '' : abs.startsWith(`${raiz}/`) ? abs.slice(raiz.length + 1) : null;
  if (rel !== null) {
    if (rel === '.claude/hooks' || rel.startsWith('.claude/hooks/')) return rel;
    if (rel === '.claude/settings.json' || rel === '.claude/settings.local.json') return rel;
    if (rel === '.githooks' || rel.startsWith('.githooks/')) return rel;
    if (rel === '.kit-rol') return rel;
    if (rel === '.git') return rel; // el .git de la raíz del worktree, como entrada (r2-2 b)
  }
  return null;
}
function esLockViejo(detalle) {
  return typeof detalle === 'string' && detalle.endsWith('.lock');
}

// ¿la ruta es un freno de la PC? → 'kit' (siempre) | 'settings' (agente/sin-ventana deny, sino ask) | null.
function rutaFrenoPC(tokenCrudo) {
  if (typeof tokenCrudo !== 'string' || tokenCrudo === '') return null;
  const abs = norm(path.resolve(expandeTilde(tokenCrudo)));
  const kit = `${HOME_N}/.claude/hooks/kit`;
  if (abs === kit || abs.startsWith(`${kit}/`)) return 'kit';
  if (abs === `${HOME_N}/.claude/settings.json`) return 'settings';
  return null;
}

// Lectores de un freno: SOLO miran, no escriben ni borran (rm/Remove-Item NO entran). Lista de F §7: lectores de contenido,
// ls, git diff/log/show/status, node <ruta> como programa, hashes.
const RE_HASH = /^(sha\d+sum|md5sum|git-hash-object|certutil)$/i;
const LECTORES_FRENO = new Set(['cat', 'less', 'more', 'head', 'tail', 'get-content', 'gc', 'type', 'ls', 'dir', 'get-childitem', 'gci', 'stat', 'test', '[', 'test-path']);
function comandoLectorDeRuta(c, prog) {
  if (LECTORES_FRENO.has(prog)) return true;
  if (prog === 'git') {
    const sub = (c.argv[1] || '').toLowerCase();
    return ['diff', 'log', 'show', 'status', 'cat-file', 'check-ignore'].includes(sub);
  }
  if (prog === 'node' || prog === 'python' || prog === 'python3') {
    // `node <la ruta>` como programa (la ruta es argv[1], sin -e/-p/-c)
    return !(c.argv || []).some((a) => /^-[epc]$/.test(a));
  }
  if (RE_HASH.test(prog)) return true;
  return false;
}

// ---------------------------------------------------------------- el mensaje de las claves

const LINEA_SH = 'bash ~/.claude/hooks/kit/cargar-secreto.sh NOMBRE';
const LINEA_PS = 'powershell -File $env:USERPROFILE\\.claude\\hooks\\kit\\cargar-secreto.ps1 NOMBRE';
const MSG_CLAVE =
  'no lo escribas ni lo pegues: pedile al humano `cargar-secreto NOMBRE` y usá el comando o la variable. ' +
  `Git Bash: ${LINEA_SH} · PowerShell: ${LINEA_PS}`;
const MSG_PROMPT =
  'no pegues claves en el chat: una clave acá queda en tu historial local y arranca a Claude con ella a la vista. ' +
  'Si ya pegaste una, ya quedó en tu historial local: rotala (runbook `se-filtro-una-credencial`).';

function salidaTool(decision, motivo) {
  return { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: decision, permissionDecisionReason: motivo } };
}
function salidaPrompt(motivo) {
  return { decision: 'block', reason: motivo, hookSpecificOutput: { hookEventName: 'UserPromptSubmit', suppressOriginalPrompt: true } };
}

// ---------------------------------------------------------------- la decisión

// decidir(entrada, opciones) →
//   { decision: 'nada' } ·
//   { decision: 'deny'|'ask', salida, id, detalle, motivo } (PreToolUse) ·
//   { evento: 'prompt', decision: 'block'|'nada', salida, id, detalle } (UserPromptSubmit)
// Tira solo si algo interno se rompe: principal() lo traduce.
function decidir(entrada, opciones = {}) {
  const e = entrada && typeof entrada === 'object' && !Array.isArray(entrada) ? entrada : null;
  if (!e) throw new Error('la entrada no es un objeto');

  if (e.hook_event_name === 'UserPromptSubmit') return decidirPrompt(e);

  const tool = e.tool_name;
  if (typeof tool === 'string' && !HERRAMIENTAS_TOOL.includes(tool)) return { decision: 'nada' };
  const i = e.tool_input && typeof e.tool_input === 'object' ? e.tool_input : {};
  const esComando = COMANDO.includes(tool);
  const ps = tool === 'PowerShell';

  // Textos para los patrones de clave (barato, sin ficha ni git).
  const textos = [];
  if (typeof i.command === 'string') textos.push(i.command);
  if (typeof i.content === 'string') textos.push(i.content);
  if (typeof i.new_string === 'string') textos.push(i.new_string);
  if (typeof i.new_source === 'string') textos.push(i.new_source);
  if (Array.isArray(i.edits)) for (const ed of i.edits) if (ed && typeof ed.new_string === 'string') textos.push(ed.new_string);

  const modo = typeof e.permission_mode === 'string' ? e.permission_mode.trim() : '';
  const cwd = contexto.cwdDe(e);

  // --- candidatos de fábrica (sin leer la ficha) ---
  const candidatos = []; // {id, detalle, decision:'deny'|'ask', motivo, varNombre?}
  const pushDeny = (id, detalle, motivo) => candidatos.push({ id, detalle, decision: 'deny', motivo: motivo || MSG_CLAVE });

  for (const h of clavesEn(textos)) pushDeny(h.id, archivoRel(i, cwd), MSG_CLAVE);

  // Comandos: se parten una sola vez.
  let partido = { comandos: [] };
  let g = null;
  let ses = { agente: false };
  if (esComando && typeof i.command === 'string') {
    partido = comando.partir(i.command, { ps });
    g = contexto.datosGit(cwd);
    ses = agente.sesionDeAgente(cwd);
    analizarComandos(partido, ps, i.command, { modo, g, ses, cwd }, candidatos, pushDeny);
  }
  if (ESCRITURA.includes(tool)) {
    g = g || contexto.datosGit(cwd);
    ses = ses.agente ? ses : agente.sesionDeAgente(cwd);
    analizarEscritura(i, tool, { g, ses, modo }, candidatos, pushDeny);
  }

  if (candidatos.length === 0) return { decision: 'nada' };

  // --- algo frenaría: recién ahora la ficha (regla 4.7), barata ---
  const raiz = g ? g.raiz : null;
  let quitados = new Set();
  let secretosExtra = new Set();
  let publicas = new Set();
  let fichaRota = null;
  if (raiz) {
    try {
      const fv = contexto.fichaVigente(raiz);
      if (fv.estado === 'rota') fichaRota = fv.donde;
      else if (fv.estado === 'ok' && fv.datos) {
        const d = fv.datos;
        if (Array.isArray(d.secretos)) for (const n of d.secretos) secretosExtra.add(String(n).toUpperCase());
        if (Array.isArray(d.publicas)) for (const n of d.publicas) publicas.add(String(n).toUpperCase());
        if (d.frenos && Array.isArray(d.frenos.quitados)) {
          for (const q of d.frenos.quitados) {
            if (q && typeof q.id === 'string' && q.id.startsWith('secretos:') && vigente(q.hasta)) quitados.add(q.id);
          }
        }
      }
    } catch (err) {
      /* la ficha no frena sola: se trata como fábrica */
    }
  }

  // imprime-variable: refinar contra publicas/secretos de la ficha.
  const vivos = [];
  for (const cand of candidatos) {
    if (quitados.has(cand.id)) continue;
    // imprime-variable con un nombre concreto: la ficha dice si es sensible. Los forzados (listado con comodín) no traen
    // varNombre y pasan derecho.
    if (cand.id === 'secretos:imprime-variable' && cand.varNombre !== undefined) {
      if (!varSensible(cand.varNombre, secretosExtra, publicas)) continue;
    }
    vivos.push(cand);
  }
  if (vivos.length === 0) return { decision: 'nada' };

  // El más fuerte: un solo deny gana sobre un ask.
  vivos.sort((a, b) => (a.decision === b.decision ? 0 : a.decision === 'deny' ? -1 : 1));
  const elegido = vivos[0];
  let motivo = elegido.motivo;
  if (fichaRota) motivo += ` (ficha rota: ${fichaRota} — corré doctor)`;

  const renglon = anotar(opciones, raiz, { id: elegido.id, herramienta: tool || 'Bash', detalle: elegido.detalle, cwd, g });
  return { decision: elegido.decision, salida: salidaTool(elegido.decision, motivo), id: elegido.id, detalle: elegido.detalle, motivo, renglon };
}

// ruta relativa de una escritura, para el detalle (nunca el valor).
function archivoRel(i, cwd) {
  const f = i.file_path || i.notebook_path;
  if (typeof f !== 'string' || f === '') return '-';
  try {
    const g = contexto.datosGit(cwd);
    if (g) {
      const rel = path.relative(g.raiz, path.resolve(cwd, f));
      if (rel && !rel.startsWith('..') && !path.isAbsolute(rel)) return rel.split(path.sep).join('/');
    }
  } catch (e) {
    /* da igual: el detalle es rastro */
  }
  return path.basename(f);
}

function vigente(hasta) {
  if (hasta === 'siempre') return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(hasta)) return false;
  const d = new Date();
  const hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return hasta >= hoy;
}

// ---------------------------------------------------------------- análisis de comandos

function analizarComandos(partido, ps, textoCrudo, ctx, candidatos, pushDeny) {
  const comandos = partido.comandos || [];
  const sinVentana = !CON_VENTANA.has(ctx.modo);
  const duro = SIN_VENTANA_DURO.has(ctx.modo);

  // mapa de asignaciones de la MISMA llamada (F=.env; cat $F)
  const asign = new Map();
  for (const c of comandos) for (const a of c.asignaciones || []) if (a && typeof a.nombre === 'string') asign.set(a.nombre, a.valor);
  const resolver = (tok) => {
    const m = /^\$\{?([A-Za-z_][A-Za-z0-9_]*)\}?$/.exec(String(tok)) || /^%([A-Za-z_][A-Za-z0-9_]*)%$/.exec(String(tok)) || /^\$\{?env:([A-Za-z_][A-Za-z0-9_]*)\}?$/.exec(String(tok));
    if (m && asign.has(m[1])) return asign.get(m[1]);
    return tok;
  };

  // settings del proyecto (raíz por git) para el deny de archivo
  const settingsProy = new Set();
  if (ctx.g) {
    const r = norm(ctx.g.raiz);
    settingsProy.add(`${r}/.claude/settings.json`);
    settingsProy.add(`${r}/.claude/settings.local.json`);
  }

  // ¿algún comando de la llamada es impresor o set -x? (para source/.)
  const hayPrinterOsetx = comandos.some((c) => {
    const p = comando.programa(c.argv && c.argv[0]);
    return IMPRESORES.has(p) || hayVerboso(c);
  });

  // --- archivo-deny: pipeline entero ---
  const nombraDeny = comandos.some((c) => {
    const toks = [...(c.argv || []).map(resolver), ...(c.redirecciones || []).map((r) => r.destino)];
    return toks.some((t) => esRutaDenyArchivo(t, settingsProy));
  });
  if (nombraDeny) {
    const todoSeguro = comandos.every((c) => {
      const prog = comando.programa(c.argv && c.argv[0]);
      return comandoSeguroParaDeny(c, prog, hayPrinterOsetx);
    });
    if (!todoSeguro) {
      const quien = comandos.find((c) => {
        const toks = [...(c.argv || []).map(resolver), ...(c.redirecciones || []).map((r) => r.destino)];
        return toks.some((t) => esRutaDenyArchivo(t, settingsProy));
      });
      const tok = quien ? [...(quien.argv || []).map(resolver), ...(quien.redirecciones || []).map((r) => r.destino)].find((t) => esRutaDenyArchivo(t, settingsProy)) : '';
      pushDeny('secretos:archivo-deny', relOrBase(tok, ctx), MSG_CLAVE);
    }
  }

  for (const c of comandos) {
    const prog = comando.programa(c.argv && c.argv[0]);
    const argv = c.argv || [];

    // imprime-todas
    if (esImprimeTodas(prog, argv, ps)) pushDeny('secretos:imprime-todas', prog, MSG_CLAVE);

    // credencial-guardada
    if (esCredencialGuardada(c)) pushDeny('secretos:credencial-guardada', prog, MSG_CLAVE);

    // gci/ls/dir/Get-Item env:<comodín> lista un subconjunto del entorno (podría traer DATABASE_URL…): frena siempre (r2-6).
    if (['get-childitem', 'gci', 'ls', 'dir', 'get-item', 'gi'].includes(prog) && typeof argv[1] === 'string' && /^env:.*[*?]/i.test(argv[1])) {
      pushDeny('secretos:imprime-variable', argv[1], MSG_CLAVE);
    } else {
      // imprime-variable (candidato; la ficha refina si el nombre es sensible)
      for (const nombre of impresoraDeVariable(c, prog, ps, textoCrudo)) {
        candidatos.push({ id: 'secretos:imprime-variable', detalle: nombre, decision: 'deny', motivo: MSG_CLAVE, varNombre: nombre });
      }
    }

    // frenos del proyecto (solo en sesión de agente)
    if (ctx.ses && ctx.ses.agente && ctx.g) {
      const toks = [...argv.map(resolver), ...(c.redirecciones || []).map((r) => r.destino)];
      for (const t of toks) {
        const fr = rutaFrenoProyecto(t, ctx.g);
        if (fr && !comandoLectorDeRuta(c, prog)) {
          const msg = esLockViejo(fr) ? 'un .lock viejo del repo: pedíselo al director (no lo toques).' : 'no toques los frenos del proyecto (hooks, settings, .githooks, .kit-rol, el git-dir): son la red del método.';
          pushDeny('secretos:frenos-del-proyecto', relOrBase(fr, ctx), msg);
          break;
        }
      }
    }

    // frenos de la PC
    {
      const toks = [...argv.map(resolver), ...(c.redirecciones || []).map((r) => r.destino)];
      for (const t of toks) {
        const fp = rutaFrenoPC(t);
        if (!fp || comandoLectorDeRuta(c, prog)) continue;
        if (fp === 'kit') {
          pushDeny('secretos:frenos-de-la-pc', '<home>/.claude/hooks/kit', 'no toques el corrector de la PC (<home>/.claude/hooks/kit): lo pone y lo cura el instalador.');
        } else if (ctx.ses.agente || !CON_VENTANA.has(ctx.modo)) {
          pushDeny('secretos:frenos-de-la-pc', '<home>/.claude/settings.json', 'no toques el settings de la PC desde una sesión de agente o sin ventana: lo pone el instalador.');
        } else {
          candidatos.push({ id: 'secretos:frenos-de-la-pc', detalle: '<home>/.claude/settings.json', decision: 'ask', motivo: 'vas a tocar el settings de la PC (<home>/.claude/settings.json) — confirmá que es a propósito.' });
        }
        break;
      }
    }

    // cambios-sin-ventana (solo bypass/dontAsk)
    if (duro) {
      const toks = [...argv.map(resolver), ...(c.redirecciones || []).map((r) => r.destino)];
      const nombraCambios = toks.some((t) => /(^|\/)\.claude\/cambios(\/|$)/.test(norm(expandeTilde(t))));
      if (nombraCambios) {
        const esElScript = prog === 'node' && argv.some((a) => /(^|\/)\.claude\/scripts\/cambios\.cjs$/.test(norm(a))) && !toks.some((t) => /(^|\/)\.claude\/cambios(\/|$)/.test(norm(expandeTilde(t))) && !/scripts\/cambios\.cjs$/.test(norm(t)));
        if (!esElScript) pushDeny('secretos:cambios-sin-ventana', '.claude/cambios', 'en bypass no se toca .claude/cambios salvo `node .claude/scripts/cambios.cjs`.');
      }
    }
  }
}

function esImprimeTodas(prog, argv, ps) {
  const soloArgs = argv.slice(1);
  if ((prog === 'printenv' || prog === 'env' || prog === 'set') && soloArgs.length === 0) return true;
  if (prog === 'export' && soloArgs.length === 1 && soloArgs[0] === '-p') return true;
  if (prog === 'declare' && soloArgs.length === 1 && soloArgs[0] === '-p') return true;
  if ((prog === 'get-childitem' || prog === 'gci' || prog === 'ls' || prog === 'dir' || prog === 'get-item' || prog === 'gi') && soloArgs.length === 1 && /^env:\\?$/i.test(soloArgs[0])) return true;
  return false;
}

// nombres de variable que un comando IMPRIME (D-14). Devuelve lista de nombres (la ficha decide si son sensibles).
function impresoraDeVariable(c, prog, ps, textoCrudo) {
  const nombres = new Set();
  const argv = c.argv || [];

  // (1) impresor con $X/${X}/$env:X/%X%
  if (IMPRESORES.has(prog)) {
    for (const a of argv.slice(1)) for (const n of varsEn(a)) nombres.add(n);
  }
  // cat <<< $X
  if (prog === 'cat') for (const r of c.redirecciones || []) if (r.op === '<<<') for (const n of varsEn(r.destino)) nombres.add(n);

  // (3) printenv X
  if (prog === 'printenv' && argv[1]) nombres.add(argv[1]);
  // gci/ls/dir/Get-Item env:X (también comodín)
  if ((prog === 'get-childitem' || prog === 'gci' || prog === 'ls' || prog === 'dir' || prog === 'get-item' || prog === 'gi') && argv[1]) {
    const m = /^env:(.+)$/i.exec(argv[1]);
    if (m) nombres.add(m[1].replace(/\*/g, '').replace(/\\$/, '') || m[1]);
  }
  // node -e/-p / python -c que imprime process.env.X / os.environ['X']
  if ((prog === 'node' || prog === 'python' || prog === 'python3') && argv.some((a) => /^-[epc]$/.test(a))) {
    const todo = argv.join(' ');
    let m;
    const r = /process\.env\.([A-Za-z_][A-Za-z0-9_]*)|process\.env\[['"]([^'"]+)['"]\]|os\.environ\[['"]([^'"]+)['"]\]|os\.environ\.get\(['"]([^'"]+)['"]\)|getenv\(['"]([^'"]+)['"]\)/g;
    while ((m = r.exec(todo))) nombres.add(m[1] || m[2] || m[3] || m[4] || m[5]);
  }

  // (2) PowerShell: una sentencia que ES la variable o un string que la interpola; GetEnvironmentVariable('X')
  if (ps) {
    const soloVar = argv.length === 1 && /^("?)\$\{?(env:)?[A-Za-z_][A-Za-z0-9_]*\}?\1$/.test(argv[0]);
    if (soloVar) for (const n of varsEn(argv[0])) nombres.add(n);
    const joined = argv.join(' ');
    let m;
    const r = /getenvironmentvariable\(\s*['"]([^'"]+)['"]/gi;
    while ((m = r.exec(textoCrudo || joined))) nombres.add(m[1]);
  }

  // (4) la variable en la misma llamada que algo verboso
  if (hayVerboso(c)) for (const a of argv) for (const n of varsEn(a)) nombres.add(n);

  return [...nombres];
}

// ---------------------------------------------------------------- escritura (Write/Edit/…)

function analizarEscritura(i, tool, ctx, candidatos, pushDeny) {
  const f = i.file_path || i.notebook_path;
  if (typeof f !== 'string' || f === '') return;
  // frenos del proyecto
  if (ctx.ses && ctx.ses.agente && ctx.g) {
    const fr = rutaFrenoProyecto(f, ctx.g);
    if (fr) {
      const msg = esLockViejo(fr) ? 'un .lock viejo del repo: pedíselo al director (no lo toques).' : 'no escribas sobre los frenos del proyecto (hooks, settings, .githooks, .kit-rol, el git-dir).';
      pushDeny('secretos:frenos-del-proyecto', fr.startsWith('<común>') ? fr : relOrBaseFijo(ctx.g, f), msg);
    }
  }
  // frenos de la PC
  const fp = rutaFrenoPC(f);
  if (fp === 'kit') {
    pushDeny('secretos:frenos-de-la-pc', '<home>/.claude/hooks/kit', 'no escribas sobre el corrector de la PC (<home>/.claude/hooks/kit).');
  } else if (fp === 'settings') {
    if ((ctx.ses && ctx.ses.agente) || !CON_VENTANA.has(ctx.modo)) {
      pushDeny('secretos:frenos-de-la-pc', '<home>/.claude/settings.json', 'no escribas sobre el settings de la PC desde una sesión de agente o sin ventana.');
    } else {
      candidatos.push({ id: 'secretos:frenos-de-la-pc', detalle: '<home>/.claude/settings.json', decision: 'ask', motivo: 'vas a escribir el settings de la PC — confirmá.' });
    }
  }
}

function relOrBaseFijo(g, f) {
  try {
    const rel = path.relative(g.raiz, path.resolve(g.raiz, expandeTilde(f)));
    if (rel && !rel.startsWith('..') && !path.isAbsolute(rel)) return rel.split(path.sep).join('/');
  } catch (e) {
    /* */
  }
  return path.basename(f);
}
function relOrBase(tok, ctx) {
  if (typeof tok !== 'string') return '-';
  if (tok.startsWith('<común>') || tok.startsWith('<home>')) return tok;
  if (ctx.g) return relOrBaseFijo(ctx.g, tok);
  return path.basename(expandeTilde(tok)) || tok;
}

// ---------------------------------------------------------------- UserPromptSubmit (D-5, r1-9)

function decidirPrompt(e) {
  const textos = [];
  if (typeof e.prompt === 'string') textos.push(e.prompt);
  const hits = clavesEn(textos);
  if (hits.length === 0) return { evento: 'prompt', decision: 'nada' };
  return { evento: 'prompt', decision: 'block', salida: salidaPrompt(MSG_PROMPT), id: hits[0].id, detalle: '(prompt)' };
}

// ---------------------------------------------------------------- el renglón

function anotar(opciones, raiz, datos) {
  try {
    if (typeof opciones.anotar === 'function') {
      return opciones.anotar(raiz, { id: datos.id, herramienta: datos.herramienta, detalle: datos.detalle });
    }
    if (raiz) {
      return frenosLog.anotar(raiz, {
        id: datos.id,
        herramienta: datos.herramienta,
        detalle: datos.detalle,
        rol: contexto.rol(raiz),
        rama: contexto.rama(raiz),
      });
    }
    // sin repo/ficha: el log de la PC
    return anotarPC({ id: datos.id, herramienta: datos.herramienta, detalle: datos.detalle });
  } catch (err) {
    return null;
  }
}
function rutaLogPC() {
  return path.join(HOME, '.claude', 'hooks', 'kit', 'frenos.log');
}
function anotarPC(datos) {
  const archivo = rutaLogPC();
  fs.mkdirSync(path.dirname(archivo), { recursive: true });
  const linea = frenosLog.renglon({ id: datos.id, herramienta: datos.herramienta, detalle: datos.detalle, rol: 'pc', rama: '(sin repo)' });
  let previo = '';
  try {
    const st = fs.statSync(archivo);
    if (st.size > 0) {
      const fd = fs.openSync(archivo, 'r');
      try {
        const b = Buffer.alloc(1);
        fs.readSync(fd, b, 0, 1, st.size - 1);
        if (b[0] !== 0x0a) previo = '\n';
      } finally {
        fs.closeSync(fd);
      }
    }
  } catch (err) {
    if (!err || err.code !== 'ENOENT') throw err;
  }
  fs.appendFileSync(archivo, `${previo}${linea}\n`, { encoding: 'utf8', flag: 'a' });
  return linea;
}

// ---------------------------------------------------------------- principal

function principal() {
  let entrada;
  let texto;
  try {
    texto = fs.readFileSync(0, 'utf8');
    entrada = JSON.parse(texto);
  } catch (e) {
    // No se pudo ni leer la entrada: no sé si es prompt o tool. Como PreToolUse: freno roto.
    process.stdout.write(`${JSON.stringify(salidaTool('deny', ROTO))}\n`);
    return;
  }
  const esPrompt = entrada && entrada.hook_event_name === 'UserPromptSubmit';
  let r;
  try {
    r = decidir(entrada);
  } catch (e) {
    if (esPrompt) {
      // falla abierto (D-5): sale 0 sin bloquear, con un renglón si se puede.
      try {
        anotarPC({ id: 'secretos:prompt-error', herramienta: 'UserPromptSubmit', detalle: '(error interno)' });
      } catch (err) {
        /* ni el renglón: igual pasa */
      }
      return;
    }
    process.stdout.write(`${JSON.stringify(salidaTool('deny', ROTO))}\n`);
    return;
  }
  if (r.evento === 'prompt') {
    if (r.decision === 'block') process.stdout.write(`${JSON.stringify(r.salida)}\n`);
    return;
  }
  if (r.decision !== 'nada') process.stdout.write(`${JSON.stringify(r.salida)}\n`);
}

if (require.main === module) {
  try {
    principal();
    process.exitCode = 0;
  } catch (e) {
    process.exitCode = 2;
  }
} else {
  module.exports = {
    HERRAMIENTAS_TOOL,
    HOME,
    ROTO,
    bancoPatrones,
    PATRONES,
    RE_JWT,
    jwtEsAnon,
    clavesEn,
    FABRICA_VARS,
    varSensible,
    esRutaDenyArchivo,
    rutaFrenoProyecto,
    rutaFrenoPC,
    decidir,
    salidaTool,
    salidaPrompt,
    homeDelHook,
  };
}
