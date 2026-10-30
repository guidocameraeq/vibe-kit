'use strict';
// secretos.cjs — el corrector de secretos de la PC (SPEC-paquete-3 P4.3; diseño F §5, §7, §8, §9, §11; RT1-4, RT2-2; r1-3, r1-9,
// r1-12, r1-14, r1-15, r1-21). Corre en TODO proyecto, con kit o sin. Es un hook que NIEGA (P4.7): onFailure "block", timeout 20
// y forma exec los pone el instalador de la PC (G10), no este archivo.
//
//   - PreToolUse sobre Bash|PowerShell|Write|Edit|MultiEdit|NotebookEdit: mira tool_input.command, content, new_string,
//     edits[].new_string y new_source. Ids secretos:<qué>, uno por fila de la tabla de P4.3, más los tres que frenaba el
//     anti-secretos viejo de la PC (sk-viejo, conexion-con-clave, telegram; G5b) y, en imprime-variable, el heredoc sin comillar.
//   - UserPromptSubmit (D-5): mira el prompt; si trae una clave con forma real, decision "block" con suppressOriginalPrompt
//     (doc de hooks, leída por D3.1 el 2026-10-29: decision y reason al tope, suppressOriginalPrompt dentro de
//     hookSpecificOutput). FALLA ABIERTO: ante cualquier error interno sale 0 sin bloquear (el registro va sin onFailure).
//
// FORMA (P4.7): decidir(entrada, {anotar}) pura salvo el renglón → { decision: 'nada' } · { decision: 'deny'|'ask', salida, id,
//   detalle, motivo, renglon } · { evento: 'prompt', decision: 'block'|'nada', salida, id }. Tira solo si algo interno se rompe:
//   principal() lo traduce al deny "freno roto: corré doctor" (en el prompt, a dejar pasar); si ni eso, sale 2 (el prompt, 0).
// BARATO: sin ficha ni procesos hasta que algo de fábrica frenaría. La sesión sale de lib/agente.cjs (solo fs); el único git
//   es fichaVigente, y corre recién con un candidato.
// LA FICHA del cwd (contexto.fichaVigente): frenos.quitados con hasta: vigente apaga ESE id; secretos: suma nombres a
//   imprime-variable y publicas: los saca. Sin ficha: fábrica. Rota: nada quitado, el motivo suma "ficha rota: <dónde> — corré
//   doctor", y secretos:/publicas: salen de la última versión que se lee (hasta 20 commits, como rf-14).
// EL RENGLÓN (formato de D2.1): con ficha (o rota), <raíz>/.claude/frenos.log; sin ficha, <home>/.claude/hooks/kit/frenos.log.
//   Detalle = el caso, el NOMBRE de la variable o el archivo relativo; un ask, "preguntó: …". Nunca el comando ni un valor.
//
// NUNCA hace require fuera de ./lib/ (D-12). <home> = la carpeta que contiene el .claude donde está instalado
// (<home>/.claude/hooks/kit/secretos.cjs), sacada de __dirname, NUNCA de os.homedir() (r1-15).
// NO ES UNA FRONTERA (Lo que esto no cierra): alias, variables, base64 o un script lo esquivan; la red es el candado.
// Node estándar salvo ./lib/. Es .cjs a propósito: corre igual en proyectos con "type": "module".

const fs = require('fs');
const path = require('path');
const comando = require('./lib/comando.cjs');
const contexto = require('./lib/contexto.cjs');
const agente = require('./lib/agente.cjs');
const ficha = require('./lib/ficha.cjs');
const git = require('./lib/git.cjs');
const frenosLog = require('./lib/frenos-log.cjs');

const HERRAMIENTAS_TOOL = ['Bash', 'PowerShell', 'Write', 'Edit', 'MultiEdit', 'NotebookEdit'];
const COMANDO = ['Bash', 'PowerShell'];
const ESCRITURA = ['Write', 'Edit', 'MultiEdit', 'NotebookEdit'];
const CON_VENTANA = ['default', 'acceptEdits', 'plan', 'auto'];
const SIN_VENTANA_DURO = ['bypassPermissions', 'dontAsk'];
const PREFIJO = 'secretos:';
const ROTO = 'freno roto: corré doctor';
const WIN = process.platform === 'win32';

// ---------------------------------------------------------------- <home> por __dirname (r1-15)

function homeDelHook(dir = __dirname) {
  const marca = `${path.sep}.claude${path.sep}`;
  const d = dir + path.sep;
  const i = d.toLowerCase().lastIndexOf(marca.toLowerCase());
  if (i >= 0) return d.slice(0, i);
  return path.resolve(dir, '..', '..', '..'); // kit -> hooks -> .claude -> <home>
}
const HOME = homeDelHook();
// ¿Corre instalado (<home>/.claude/hooks/kit/)? Si no (desde kit/ en el repo, en las pruebas), el renglón de la PC no se escribe:
// sin esto, una corrida desde el repo crearía kit/.claude/hooks/kit/frenos.log adentro del repo.
const INSTALADO = path.resolve(__dirname) === path.join(HOME, '.claude', 'hooks', 'kit');

// ---------------------------------------------------------------- patrones de clave (sin claves literales en kit/, r1-4)

// Se arman de fragmentos: así el texto de este archivo NO calza con sus regex (la prueba hace grep de estos mismos patrones
// sobre kit/ y espera 0). El banco se exporta para que la prueba use EXACTAMENTE estos.
function bancoPatrones() {
  return [
    { id: 'github-pat', re: new RegExp('gh' + 'p_[A-Za-z0-9]{30,}') },
    { id: 'github-fino', re: new RegExp('github' + '_pat_[A-Za-z0-9_]{30,}') },
    // el cuerpo tiene que traer letras Y dígitos: `sk-proj-PONE-ACA-TU-CLAVE` es un ejemplo de .env.example, no una clave (medido)
    { id: 'sk-api', re: new RegExp('sk' + '-(?:proj|ant)-[A-Za-z0-9_-]{20,}'), valida: (m) => { const c = m.replace(/^[a-z]+-[a-z]+-/, ''); return /[0-9]/.test(c) && /[A-Za-z]/.test(c); } },
    { id: 'supabase-token', re: new RegExp('sb' + 'p_[0-9a-f]{20,}') },
    { id: 'twilio', re: new RegExp('A' + 'C[0-9a-f]{32}:[0-9a-f]{16,}') },
    { id: 'aws', re: new RegExp('AK' + 'IA[0-9A-Z]{16}') },
    { id: 'clave-privada', re: new RegExp('-----BE' + 'GIN[A-Z0-9 ]*PRIVATE KEY-----') },
    { id: 'slack', re: new RegExp('xo' + 'x[baprs]-') },
    { id: 'stripe', re: new RegExp('(?:sk|rk)' + '_live_') },
    // Los tres que frenaba el anti-secretos viejo de la PC (`~/.claude/hooks/anti-secretos.js`) y `--sacar-viejo` se llevaba.
    // La clave vieja de OpenAI (y las `sk-svcacct-`/`sk-admin-`, y las de otros proveedores con la misma forma): un tramo seguido de
    // 20+ letras y dígitos, con los dos. Un nombre en kebab-case (`sk-learn-…`, `task-…`) no tiene ese tramo; proj/ant son sk-api.
    { id: 'sk-viejo', re: new RegExp('(?<![A-Za-z0-9_-])s' + 'k-(?!proj-|ant-)[A-Za-z0-9_-]{28,}'), valida: (m) => m.slice(3).split(/[-_]/).some((t) => t.length >= 20 && /[0-9]/.test(t) && /[A-Za-z]/.test(t)) },
    // Una cadena de conexión con la clave adentro (esquema://usuario:clave@host): postgres, mysql/mariadb, mongodb(+srv), redis(s).
    // No frena un placeholder (`usuario:clave@`, `user:password@`, `${VAR}`, `$X`, `%X%`, `<pass>`, `[…]`, `***`) ni un host local
    // (localhost, 127.0.0.1, ::1, host.docker.internal: la base de la máquina, con la clave de desarrollo, no es un secreto).
    { id: 'conexion-con-clave', re: new RegExp('(?:postgres(?:ql)?|mysql|mariadb|mongodb(?:\\+srv)?|rediss?)' + ':\\/\\/[^\\s:/@\'"`]*:[^\\s/@\'"`]+@[^\\s/\'"`?#]*', 'i'), valida: conexionReal },
    // El token de bot de Telegram (<id>:AA<35>), también pegado a `api.telegram.org/bot`. Un id de ejemplo (123456789…, 987654321…,
    // un dígito repetido) es de un test o un manual, no de un bot (medido: un fixture de pruebas con los dos primeros).
    { id: 'telegram', re: new RegExp('(?<![0-9])[0-9]{8,10}' + ':AA[A-Za-z0-9_-]{30,}'), valida: (m) => { const id = m.split(':')[0]; return !'1234567890'.startsWith(id) && !'9876543210'.startsWith(id) && !/^(\d)\1+$/.test(id); } },
  ];
}
// Lo de conexion-con-clave: ¿la clave es de verdad y el host no es la máquina?
const CLAVE_DE_EJEMPLO = /^(?:your|tu|mi|my|the|la|el|db|database|user|usuario|super|admin|root|app)*(?:password|passwd|pass|pwd|secret|clave|contrasena|contraseña|changeme|placeholder|example|ejemplo|redacted|token)s?$/;
function conexionReal(m) {
  const x = /:\/\/([^:]*):([^@]*)@(.*)$/.exec(m);
  if (!x) return false;
  const clave = x[2];
  const host = x[3].replace(/:\d*$/, '').toLowerCase();
  if (/^[$%<[{(]/.test(clave) || /^(?:\*+|x+|\.+)$/i.test(clave)) return false;
  if (CLAVE_DE_EJEMPLO.test(clave.toLowerCase().replace(/[^a-zñ]/g, ''))) return false;
  if (/^(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]|::1|host\.docker\.internal)$/.test(host)) return false;
  return true;
}
const PATRONES = bancoPatrones();
const RE_JWT = new RegExp('ey' + 'J[A-Za-z0-9_-]+\\.ey' + 'J[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]*');

// ¿el cuerpo (segundo tramo) del jwt dice "role":"anon"? service_role, o cualquier otro, NO es anon (r1-12).
function jwtEsAnon(token) {
  const tramos = String(token).split('.');
  if (tramos.length < 2) return false;
  const txt = Buffer.from(tramos[1], 'base64url').toString('utf8');
  return /"role":"anon"/.test(txt.replace(/\s+/g, ''));
}

// textos → ids de los patrones que calzan. El jwt cuenta salvo que sea anon (también en datos-de-prueba: y en lo asignado a
// publicas:: el texto no dice dónde va a parar, así que la regla es la misma en todos lados).
function clavesEn(textos) {
  const t = textos.filter((x) => typeof x === 'string').join('\n');
  const ids = [];
  if (t === '') return ids;
  for (const p of PATRONES) {
    const ms = p.valida ? t.match(new RegExp(p.re.source, `${p.re.flags}g`)) || [] : null;
    if (ms ? ms.some(p.valida) : p.re.test(t)) ids.push(p.id);
  }
  const re = new RegExp(RE_JWT.source, 'g');
  let m;
  while ((m = re.exec(t)) !== null) {
    if (!jwtEsAnon(m[0])) {
      ids.push('jwt');
      break;
    }
  }
  return ids;
}

// ---------------------------------------------------------------- nombres de variable sensibles (D-14, r2-6)

const FABRICA_VARS = [
  /TOKEN/, /SECRET/, /PASSWORD/, /PASS/, /PWD/, /API_KEY/, /PRIVATE_KEY/, /SERVICE_ROLE/,
  /_KEY$/, /CREDENTIAL/, /DATABASE_URL/, /DB_URL/, /_DSN/, /CONNECTION_STRING/,
];
// Los de la shell que caen en /PWD/ y no son secreto (rf3-12): la carpeta actual y la anterior (Bash y PowerShell). Solo
// exactos: DB_PWD, MYSQL_PWD siguen frenando. La ficha (secretos:) los puede volver a sumar.
const SHELL_NO_SECRETO = new Set(['PWD', 'OLDPWD']);
// publicas: gana (la ficha dice que no es secreto); secretos: suma; si no, la lista de fábrica.
function varSensible(nombre, extra, publicas) {
  const n = String(nombre || '').toUpperCase();
  if (n === '') return false;
  if (publicas && publicas.has(n)) return false;
  if (extra && extra.has(n)) return true;
  if (SHELL_NO_SECRETO.has(n)) return false;
  return FABRICA_VARS.some((re) => re.test(n));
}

// ---------------------------------------------------------------- rutas

// Todo con / y en minúscula (Windows: sin mayúsculas).
const norm = (p) => String(p).replace(/\\/g, '/').toLowerCase();

// ~, $HOME, $env:USERPROFILE, %USERPROFILE% → <home>; en Windows, /c/… (Git Bash) → c:/….
function expandir(tok) {
  let s = String(tok);
  s = s.replace(/^(?:\$\{?HOME\}?|\$\{?env:(?:USERPROFILE|HOME)\}?|%(?:USERPROFILE|HOME)%)(?=$|[\\/])/i, () => HOME);
  if (s === '~') s = HOME;
  else if (/^~[\\/]/.test(s)) s = HOME + s.slice(1);
  if (WIN) {
    const m = /^\/([a-zA-Z])(\/|$)/.exec(s);
    if (m) s = `${m[1]}:/${s.slice(3)}`;
  }
  return s;
}
const absoluta = (tok, base) => norm(path.resolve(base || process.cwd(), expandir(tok)));
const HOME_N = norm(HOME);

// Un glob de ruta → RegExp anclada (** cruza carpetas; * y ? no).
function globARegex(glob) {
  let r = '';
  for (let i = 0; i < glob.length; i++) {
    const ch = glob[i];
    if (ch === '*' && glob[i + 1] === '*') {
      if (glob[i + 2] === '/') {
        r += '(?:.*/)?';
        i += 2;
      } else {
        r += '.*';
        i += 1;
      }
    } else if (ch === '*') r += '[^/]*';
    else if (ch === '?') r += '[^/]';
    else r += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${r}$`);
}

// Los nombres de F §5 (`.env`, `.env.*`, `*.pem`, `*.key`): el nombre tal cual o un comodín que pueda calzar con uno.
const EJEMPLOS_DENY = ['.env', '.env.x', 'x.pem', 'x.key'];
function nombreDeny(base) {
  if (base === '.env' || base.startsWith('.env.') || base.endsWith('.pem') || base.endsWith('.key')) return true;
  // Un comodín cuenta si puede calzar Y dice algo: empieza con punto (.e*, .*) o trae una letra (*.pe?). `*` o `dir/*` solos no
  // (medido: frenaban `ls docs/*`, `wc -l *`); en Bash `*` ni siquiera calza con los archivos con punto.
  if (/[*?]/.test(base) && (base.startsWith('.') || /[a-z]/.test(base))) {
    const re = globARegex(base);
    return EJEMPLOS_DENY.some((x) => re.test(x));
  }
  return false;
}

// Carpetas de la casa (F §5 + el almacén de cargar-secreto).
const CASA = ['.ssh', '.aws', '.config/gh', '.config/kit-secretos', 'appdata/roaming/github cli'];

// Las reglas Read(...) del deny de los settings*.json del proyecto (raíz por git desde el cwd) → [RegExp] sobre rutas absolutas.
function denyDeSettings(raiz) {
  const res = [];
  if (!raiz) return res;
  const r = norm(raiz);
  for (const f of ['settings.json', 'settings.local.json']) {
    let j;
    try {
      j = JSON.parse(fs.readFileSync(path.join(raiz, '.claude', f), 'utf8').replace(/^\uFEFF/, ''));
    } catch (e) {
      continue; // sin archivo o roto: lo cuenta el doctor, no este freno
    }
    const deny = j && j.permissions && Array.isArray(j.permissions.deny) ? j.permissions.deny : [];
    for (const regla of deny) {
      const m = typeof regla === 'string' ? /^Read\((.+)\)$/.exec(regla.trim()) : null;
      if (!m) continue;
      let p = m[1].trim().replace(/\\/g, '/');
      if (p.startsWith('//')) p = expandir(p.slice(1));
      else if (p.startsWith('~/')) p = HOME + p.slice(1);
      else if (p.startsWith('./')) p = `${r}/${p.slice(2)}`;
      else if (p.startsWith('/')) p = `${r}${p}`;
      else p = `${r}/**/${p}`;
      p = norm(p);
      res.push(globARegex(p));
      if (p.endsWith('/**')) res.push(globARegex(p.slice(0, -3))); // la carpeta misma
    }
  }
  return res;
}

// ¿el token NOMBRA una ruta del deny de archivo? (los 9 de F §5, el almacén, /proc/*/environ y los Read(...) del proyecto)
function esRutaDenyArchivo(tok, ctx = {}) {
  if (typeof tok !== 'string' || tok === '') return false;
  // No es una ruta: un patrón de grep (`^/.env`, `a|.env`), un renglón de código, o un comando entero que va como texto a otro
  // programa (`ssh host "cat .env"`, `docker exec x sh -c '…'`: lo de adentro corre en OTRA máquina; medido).
  if (/[|^\n]/.test(tok) || (/\s/.test(tok) && /[&;'"<>()]/.test(tok))) return false;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(tok)) return false; // una URL no es un archivo
  const e = norm(expandir(tok));
  if (/^\/proc\/[^/]+\/environ$/.test(e)) return true;
  const segs = e.split('/').filter((x) => x !== '');
  const base = segs.length ? segs[segs.length - 1] : '';
  if (nombreDeny(base)) return true;
  if (segs.includes('secrets')) return true;
  const abs = absoluta(tok, ctx.cwd);
  for (const c of CASA) {
    const bajo = `${HOME_N}/${c}`;
    if (abs === bajo || abs.startsWith(`${bajo}/`)) return true;
  }
  return (ctx.denySettings || []).some((re) => re.test(abs));
}

// ---------------------------------------------------------------- lo que se invoca

const IMPRESORES = new Set(['echo', 'printf', 'print', 'write-output', 'write-host', 'write-information', 'out-host', 'out-string', 'tee']);
const ESCRIBE = new Set(['>', '>>', '>|', '&>', '&>>', '2>', '2>>', '<>', '*>', '*>>']);
const NO_ES_ARCHIVO = new Set(['<<', '<<-', '<<<']); // la marca de un heredoc y el texto de un here-string

// Los tokens de ruta de un comando simple: argv[1..] (con las variables asignadas en la misma llamada ya resueltas) y los
// destinos de redirección que son archivos. → [{tok, escribe}]
function tokensDeRuta(c, resolver) {
  const out = [];
  const argv = (c.argv || []).map(String);
  const patron = indicePatron(argv);
  // El texto de `bash -c '…'` / `powershell -Command …` no es una ruta: comando.partir ya sacó lo de adentro como comandos propios.
  const corte = SHELLS.has(comando.programa(c)) ? argv.findIndex((a, i) => i > 0 && /^(-c|\/c|-command|-encodedcommand)$/i.test(a)) : -1;
  argv.forEach((a, i) => {
    if (i > 0 && i !== patron && (corte < 0 || i < corte)) out.push({ tok: resolver(a), escribe: false });
  });
  for (const r of c.redirecciones || []) {
    if (NO_ES_ARCHIVO.has(r.op)) continue;
    out.push({ tok: resolver(r.destino), escribe: ESCRIBE.has(r.op) });
  }
  return out;
}

// En grep y compañía el primer argumento suelto es el PATRÓN, no una ruta (medido: `grep -n "secrets" docker-compose.yml`).
// → su índice, o -1 (con -e/-f/--regexp/-Pattern el patrón va como valor de la opción y todo lo suelto es ruta).
const BUSCADORES = new Set(['grep', 'egrep', 'fgrep', 'rg', 'findstr', 'select-string', 'sls']);
const CON_VALOR = new Set(['-A', '-B', '-C', '-m', '--max-count', '-g', '--glob', '-t', '--type', '--include', '--exclude', '-Path', '-path']);
function indicePatron(argv) {
  if (!BUSCADORES.has(comando.programa(argv[0] || ''))) return -1;
  if (argv.some((a) => /^(-e|-f|--regexp|--file|-pattern)$/i.test(a) || /^--regexp=/.test(a))) return -1;
  for (let i = 1; i < argv.length; i++) {
    if (CON_VALOR.has(argv[i])) i++;
    else if (!argv[i].startsWith('-') && !(argv[i].startsWith('/') && comando.programa(argv[0]) === 'findstr')) return i;
  }
  return -1;
}

// El subcomando de git, salteando las opciones globales con valor (-C x, -c k=v, --git-dir x…).
function subGit(argv) {
  for (let i = 1; i < argv.length; i++) {
    const a = String(argv[i]);
    if (a === '-C' || a === '-c' || a === '--git-dir' || a === '--work-tree' || a === '--namespace') {
      i++;
      continue;
    }
    if (a.startsWith('-')) continue;
    return { sub: a.toLowerCase(), resto: argv.slice(i + 1).map(String) };
  }
  return { sub: '', resto: [] };
}

const RE_VERBOSO = /^(?:-v+|--verbose|--trace(?:-.*|=.*)?|-verbose)$/;
function esVerboso(c) {
  const argv = (c.argv || []).map(String);
  const p = comando.programa(c);
  if (argv.slice(1).some((a) => RE_VERBOSO.test(a) || /^-verbose$/i.test(a))) return true;
  if (p === 'curl' && argv.slice(1).some((a) => /^-[a-zA-Z]*v[a-zA-Z]*$/.test(a))) return true;
  if ((p === 'bash' || p === 'sh' || p === 'zsh') && argv.slice(1).some((a) => /^-[a-zA-Z]*x[a-zA-Z]*$/.test(a))) return true;
  if (p === 'set' && (argv.slice(1).some((a) => /^-[a-zA-Z]*x[a-zA-Z]*$/.test(a)) || (argv[1] === '-o' && argv[2] === 'xtrace'))) return true;
  return false;
}

// Nombres de variable mencionados en un texto ($X, ${X}, $env:X, ${env:X}, %X%).
function varsEn(texto) {
  const out = [];
  const s = String(texto || '');
  let m;
  const rEnv = /\$\{?env:([A-Za-z_][A-Za-z0-9_]*)\}?/gi;
  while ((m = rEnv.exec(s))) out.push(m[1]);
  const rSh = /\$\{?([A-Za-z_][A-Za-z0-9_]*)/g;
  while ((m = rSh.exec(s))) if (!/^env$/i.test(m[1])) out.push(m[1]);
  const rCmd = /%([A-Za-z_][A-Za-z0-9_]*)%/g;
  while ((m = rCmd.exec(s))) out.push(m[1]);
  return out;
}

// ---------------------------------------------------------------- los mensajes

const LINEA_SH = 'bash ~/.claude/hooks/kit/cargar-secreto.sh NOMBRE';
const LINEA_PS = 'powershell -File $env:USERPROFILE\\.claude\\hooks\\kit\\cargar-secreto.ps1 NOMBRE';
const MSG_CLAVE =
  'no lo escribas ni lo pegues: pedile al humano `cargar-secreto NOMBRE` y usá el comando o la variable. ' +
  `Git Bash: \`${LINEA_SH}\` · PowerShell: \`${LINEA_PS}\``;
const MSG_PROMPT =
  'frené el mensaje: trae una clave con forma real. Ya quedó en tu historial local: rotala (runbook `se-filtro-una-credencial`) ' +
  'y guardá la nueva con `cargar-secreto NOMBRE`, sin pegarla acá.';
const QUE = {
  clave: (id) => `una clave con forma real (${id}) en lo que vas a ejecutar o escribir — `,
  'archivo-deny': (d) => `${d} es un archivo de secretos: no se lee, no se copia ni se imprime (sí \`ls\`, \`test -f\`, \`rm\`, \`git status\`, \`--env-file\`, y \`source\` sin imprimir nada) — `,
  'imprime-todas': () => 'eso imprime TODO el entorno, con las claves adentro — ',
  'imprime-variable': (d) => `${d} es secreta: su valor no sale a la pantalla. Como argumento de otro programa, sin -v ni set -x, pasa ("usar sin ver") — `,
  'credencial-guardada': () => 'eso imprime una credencial guardada (gh y git la usan solos, sin mostrarla) — ',
};
const MSG_FRENO_PROYECTO = 'no toques los frenos del proyecto (hooks, settings, .githooks, .kit-rol, el git-dir) desde una sesión de agente: son la red del método. Si hace falta, pedíselo al director.';
const MSG_LOCK = 'un .lock viejo del git-dir: pedíselo al director (no lo borres desde una sesión de agente). `index.lock` sí se puede.';
const MSG_PC_KIT = 'no toques el corrector de la PC (<home>/.claude/hooks/kit): lo pone y lo cura el instalador (`instalar-hooks-pc`). Leerlo pasa.';
const MSG_PC_SETTINGS = 'no toques el settings de la PC (<home>/.claude/settings.json) desde una sesión de agente o sin ventana: el camino es el instalador.';
const MSG_PC_SETTINGS_ASK = 'vas a tocar el settings de la PC (<home>/.claude/settings.json); el camino es el instalador — confirmá que es a propósito.';
const MSG_CAMBIOS = 'sin ventana (bypass/dontAsk) no se toca .claude/cambios/ salvo con `node .claude/scripts/cambios.cjs` sin otra mención.';

function salidaTool(decision, motivo) {
  return { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: decision, permissionDecisionReason: motivo } };
}
function salidaPrompt(motivo) {
  return { decision: 'block', reason: motivo, hookSpecificOutput: { hookEventName: 'UserPromptSubmit', suppressOriginalPrompt: true } };
}

// ---------------------------------------------------------------- la decisión

function decidir(entrada, opciones = {}) {
  if (!entrada || typeof entrada !== 'object' || Array.isArray(entrada)) throw new Error('la entrada no es un objeto');
  if (entrada.hook_event_name === 'UserPromptSubmit') return decidirPrompt(entrada, opciones);

  const tool = entrada.tool_name;
  if (!HERRAMIENTAS_TOOL.includes(tool)) return { decision: 'nada' };
  const i = entrada.tool_input && typeof entrada.tool_input === 'object' ? entrada.tool_input : {};
  const modo = typeof entrada.permission_mode === 'string' ? entrada.permission_mode.trim() : '';
  const cwd = contexto.cwdDe(entrada);

  // La sesión por fs (agente.cjs): sin .git subiendo, ni siquiera se le pregunta a git.
  const ses = agente.raizDe(cwd) ? agente.sesionDeAgente(cwd) : { agente: false, rol: 'desconocido', rama: null, raiz: null, comun: null };
  const ctx = { tool, modo, cwd, ses, conVentana: CON_VENTANA.includes(modo), duro: SIN_VENTANA_DURO.includes(modo) };

  const candidatos = []; // {id, decision, detalle, motivo, varNombre?}
  const textos = [i.command, i.content, i.new_string, i.new_source];
  if (Array.isArray(i.edits)) for (const ed of i.edits) if (ed) textos.push(ed.new_string);
  for (const id of clavesEn(textos)) {
    candidatos.push({ id, decision: 'deny', detalle: archivoRel(i.file_path || i.notebook_path, ctx), motivo: QUE.clave(id) + MSG_CLAVE });
  }

  if (COMANDO.includes(tool) && typeof i.command === 'string') analizarComando(i.command, tool === 'PowerShell', ctx, candidatos);
  if (ESCRITURA.includes(tool)) analizarEscritura(i.file_path || i.notebook_path, ctx, candidatos);

  if (candidatos.length === 0) return { decision: 'nada' };

  // Algo frenaría: recién ahora la ficha (regla 4.7).
  const f = leerFicha(ses.raiz);
  const vivos = candidatos.filter((c) => {
    if (f.quitados.has(PREFIJO + c.id)) return false;
    if (c.varNombre !== undefined) return varSensible(c.varNombre, f.secretos, f.publicas);
    return true;
  });
  if (vivos.length === 0) return { decision: 'nada' };

  const elegido = vivos.find((c) => c.decision === 'deny') || vivos[0];
  let motivo = elegido.motivo;
  if (f.rota) motivo += ` · ficha rota: ${f.rota} — corré doctor`;
  const id = PREFIJO + elegido.id;
  const detalle = elegido.decision === 'ask' ? `preguntó: ${elegido.detalle}` : elegido.detalle;
  const renglon = anotar(opciones, f.conFicha ? ses.raiz : null, { id, herramienta: tool, detalle, rol: ses.rol, rama: ses.rama });
  return { decision: elegido.decision, salida: salidaTool(elegido.decision, motivo), id, detalle, motivo, renglon };
}

// La ficha del cwd → { conFicha, rota, quitados, secretos, publicas }. Nunca tira: una ficha que no se lee es fábrica.
function leerFicha(raiz) {
  const r = { conFicha: false, rota: null, quitados: new Set(), secretos: new Set(), publicas: new Set() };
  if (!raiz) return r;
  let fv;
  try {
    fv = contexto.fichaVigente(raiz);
  } catch (e) {
    return r;
  }
  let datos = null;
  if (fv.estado === 'ok') {
    r.conFicha = true;
    datos = fv.datos;
    r.quitados = quitadosVigentes(datos);
  } else if (fv.estado === 'rota') {
    r.conFicha = true;
    r.rota = fv.donde;
    datos = ultimaLegible(raiz, fv.ref);
  }
  if (datos) {
    if (Array.isArray(datos.secretos)) for (const n of datos.secretos) r.secretos.add(String(n).toUpperCase());
    if (Array.isArray(datos.publicas)) for (const n of datos.publicas) r.publicas.add(String(n).toUpperCase());
  }
  return r;
}

// Con la ficha rota, los datos de la última versión que se lee (hasta 20 commits de la ref vigente; rf-14).
function ultimaLegible(raiz, ref) {
  if (!ref) return null;
  const shas = git.texto(['log', '-n', '20', '--format=%H', ref, '--', contexto.RUTA_FICHA], { cwd: raiz });
  for (const sha of (shas || '').split('\n').map((s) => s.trim()).filter(Boolean)) {
    const s = git.correr(['show', `${sha}:${contexto.RUTA_FICHA}`], { cwd: raiz });
    if (!s.ok) continue;
    try {
      return ficha.leer(s.salida.toString('utf8')).datos;
    } catch (e) {
      /* esa también está rota: la anterior */
    }
  }
  return null;
}

function quitadosVigentes(datos, ahora = new Date()) {
  const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
  const q = datos && datos.frenos && Array.isArray(datos.frenos.quitados) ? datos.frenos.quitados : [];
  return new Set(
    q.filter((x) => x && typeof x.id === 'string' && (x.hasta === 'siempre' || (/^\d{4}-\d{2}-\d{2}$/.test(x.hasta) && x.hasta >= hoy))).map((x) => x.id),
  );
}

// El archivo de una escritura, relativo a la raíz (para el detalle; nunca el valor).
function archivoRel(f, ctx) {
  if (typeof f !== 'string' || f === '') return '-';
  const abs = path.resolve(ctx.cwd, expandir(f));
  if (ctx.ses.raiz) {
    const rel = path.relative(ctx.ses.raiz, abs);
    if (rel && !rel.startsWith('..') && !path.isAbsolute(rel)) return rel.split(path.sep).join('/');
  }
  return path.basename(abs);
}

// ---------------------------------------------------------------- Bash / PowerShell

function analizarComando(texto, ps, ctx, candidatos) {
  const comandos = comando.partir(texto, { ps }).comandos || [];
  const add = (id, decision, detalle, motivo, extra) => candidatos.push({ id, decision, detalle, motivo, ...extra });

  // Las variables asignadas en la misma llamada (F=.env; cat "$F").
  const asign = new Map();
  for (const c of comandos) for (const a of c.asignaciones || []) if (a && typeof a.nombre === 'string') asign.set(a.nombre.toLowerCase(), a.valor);
  const resolver = (tok) => {
    const s = String(tok);
    const m = /^\$\{?(?:env:)?([A-Za-z_][A-Za-z0-9_]*)\}?$/i.exec(s) || /^%([A-Za-z_][A-Za-z0-9_]*)%$/.exec(s);
    return m && asign.has(m[1].toLowerCase()) ? String(asign.get(m[1].toLowerCase())) : s;
  };

  const verboso = comandos.some(esVerboso);
  // Un impresor que imprime una variable ($X): `echo "exit $?"` o `echo listo` no muestran nada del .env (medido).
  const hayImpresor = verboso || comandos.some((c) => IMPRESORES.has(comando.programa(c)) && (c.argv || []).slice(1).some((a) => varsEn(a).length > 0));
  ctx.denySettings = denyDeSettings(ctx.ses.raiz);

  // --- archivo-deny: un comando que nombra la ruta tiene que estar en lo permitido; si es de los que LISTAN (ls, gci, test, git
  // status…), todos los de su pipeline también (`gci .env | gc` frena). Los de "usar sin ver" (--env-file, dotenv -e, source) se
  // juzgan solos: lo que sale por el caño es la salida del programa, no el archivo (medido: `npx dotenv -e .env -- npx playwright
  // test | tail`). El pipeline = el tramo entre ; && || y saltos de renglón; si el texto no se deja cortar (heredoc, comillas sin
  // cerrar), la llamada entera.
  const tramos = tramosDeNivelCero(texto, ps);
  const grupos = tramos ? tramos.map((t) => comando.partir(t, { ps }).comandos || []) : [comandos];
  for (const grupo of grupos) {
    const nombra = [];
    const veredictos = [];
    for (const c of grupo) {
      const toks = tokensDeRuta(c, resolver).filter((t) => esRutaDenyArchivo(t.tok, ctx));
      if (toks.length) nombra.push(toks[0].tok);
      let v = permitidoConDeny(c, hayImpresor, ctx, resolver);
      if (v === 'no' && !toks.length && (FILTROS_DE_TEXTO.has(comando.programa(c)) || esNeutro(c))) v = 'texto';
      veredictos.push({ nombra: toks.length > 0, v });
    }
    const leeSuelto = veredictos.some((x) => x.nombra && x.v === 'no');
    const listaYLee = veredictos.some((x) => x.nombra && x.v === 'lista') && veredictos.some((x) => x.v === 'no');
    if (leeSuelto || listaYLee) {
      const d = rutaParaDetalle(nombra[0], ctx);
      add('archivo-deny', 'deny', d, QUE['archivo-deny'](d) + MSG_CLAVE);
      break;
    }
  }

  for (const c of comandos) {
    const prog = comando.programa(c);
    const argv = (c.argv || []).map(String);

    if (esImprimeTodas(prog, argv)) add('imprime-todas', 'deny', prog, QUE['imprime-todas']() + MSG_CLAVE);
    if (esCredencialGuardada(prog, argv)) add('credencial-guardada', 'deny', prog, QUE['credencial-guardada']() + MSG_CLAVE);

    // imprime-variable: el listado del entorno con comodín frena siempre (puede traer cualquiera); un nombre, si es sensible.
    const envArg = LISTA_ENV.has(prog) ? argv.slice(1).find((a) => /^env:/i.test(a)) : undefined;
    if (envArg && /[*?]/.test(envArg)) add('imprime-variable', 'deny', envArg, QUE['imprime-variable'](envArg) + MSG_CLAVE);
    else {
      for (const n of variablesImpresas(c, prog, argv, verboso)) {
        add('imprime-variable', 'deny', n, QUE['imprime-variable'](n) + MSG_CLAVE, { varNombre: n });
      }
    }

    for (const t of tokensDeRuta(c, resolver)) {
      // frenos del proyecto: solo en sesión de agente; leer pasa, escribir por redirección nunca.
      if (ctx.ses.agente) {
        const fr = rutaFrenoProyecto(t.tok, ctx);
        if (fr && (t.escribe || !esLectorDeRuta(prog, argv, t.tok))) {
          add('frenos-del-proyecto', 'deny', fr.detalle, fr.lock ? MSG_LOCK : MSG_FRENO_PROYECTO);
        }
      }
      // frenos de la PC
      const fp = rutaFrenoPC(t.tok, ctx);
      if (fp && (t.escribe || !esLectorDeRuta(prog, argv, t.tok))) frenoPC(fp, ctx, add);
      // cambios-sin-ventana
      if (ctx.duro && /(^|\/)\.claude\/cambios(\/|$)/.test(norm(expandir(t.tok)))) add('cambios-sin-ventana', 'deny', '.claude/cambios', MSG_CAMBIOS);
    }
  }

  // PowerShell (2): una sentencia que es solo la variable, un string que la interpola o GetEnvironmentVariable('X').
  if (ps) for (const n of sentenciasQueImprimen(texto)) add('imprime-variable', 'deny', n, QUE['imprime-variable'](n) + MSG_CLAVE, { varNombre: n });
  // Bash (5): el cuerpo de un heredoc sin comillar la marca que un impresor saca a la pantalla.
  else for (const n of heredocsQueImprimen(texto, comandos)) add('imprime-variable', 'deny', n, QUE['imprime-variable'](n) + MSG_CLAVE, { varNombre: n });
}

// (5) Un heredoc con la marca SIN comillar (`<<EOF`, `<<-EOF`) expande `$X` en el cuerpo; si lo recibe `cat` o `tee` y su salida
// va a la pantalla (sin `>` a un archivo, sin caño, o con caño a un filtro de texto que imprime), el valor sale. Con la marca
// comillada (`<<'EOF'`, `<<"EOF"`, `<<\EOF`) no se expande; adentro de `$( … )` o de comillas invertidas, el texto va a parar a
// un argumento, no a la pantalla; con caño a otro programa (`| kubectl apply -f -`, `| ssh h`) es "usar sin ver".
// comando.cjs no expone el cuerpo ni si la marca iba comillada (y no se toca): se relee del texto, y solo cuentan las marcas que
// partir() reconoció como heredoc (un `<<` adentro de comillas no es uno). Un `\$X` del cuerpo no se expande.
const LEEN_E_IMPRIMEN = new Set(['cat', 'tee']);
const DESPUES_DEL_CANO = new Set(['head', 'tail', 'grep', 'egrep', 'wc', 'sort', 'uniq', 'cut', 'tr', 'cat', 'less', 'more', 'tee', 'column', 'nl', 'fold']);
function heredocsQueImprimen(texto, comandos) {
  const nombres = new Set();
  const s = String(texto);
  if (!/<</.test(s)) return nombres;
  const marcas = new Set();
  for (const c of comandos) for (const r of c.redirecciones || []) if (r.op === '<<' || r.op === '<<-') marcas.add(r.destino);
  if (!marcas.size) return nombres;
  const lineas = s.split('\n');
  for (let i = 0; i < lineas.length; i++) {
    const cab = lineas[i];
    const re = /(?<!<)<<(-?)[ \t]*(\\?)(['"]?)([A-Za-z_][A-Za-z0-9_]*)\3/g;
    const hs = [];
    let m;
    while ((m = re.exec(cab))) if (marcas.has(m[4])) hs.push({ m, guion: m[1] === '-', expande: !m[2] && !m[3], delim: m[4] });
    let j = i + 1;
    for (const h of hs) {
      const cuerpo = [];
      for (; j < lineas.length; j++) {
        const l = lineas[j].replace(/\r$/, '');
        if ((h.guion ? l.replace(/^\t+/, '') : l) === h.delim) {
          j++;
          break;
        }
        cuerpo.push(l);
      }
      if (h.expande && heredocImprime(cab, h.m)) for (const n of varsEn(cuerpo.join('\n').replace(/\\\$/g, ''))) nombres.add(n);
    }
    if (hs.length) i = j - 1;
  }
  return nombres;
}
// ¿lo que recibe el heredoc que arranca en m (sobre el renglón cab) sale a la pantalla?
function heredocImprime(cab, m) {
  const antes = cab.slice(0, m.index);
  // adentro de una sustitución que no se cerró antes de la marca: va a un argumento
  for (const ab of ['$(', '<(', '>(']) {
    const k = antes.lastIndexOf(ab);
    if (k >= 0 && !antes.slice(k).includes(')')) return false;
  }
  if ((antes.match(/`/g) || []).length % 2 === 1) return false;
  // el comando que recibe el heredoc: desde el último separador hasta el próximo
  const ini = Math.max(...['|', ';', '&', '(', '{', '`', '\n'].map((x) => antes.lastIndexOf(x))) + 1;
  const despues = cab.slice(m.index + m[0].length);
  const fin = despues.search(/\|\||&&|[|;)]|&(?![>\d])/);
  const propio = `${antes.slice(ini)} ${fin < 0 ? despues : despues.slice(0, fin)}`.replace(/(?<!<)<<-?\s*\S+/g, ' ');
  const c = (comando.partir(propio).comandos || [])[0];
  if (!c || !LEEN_E_IMPRIMEN.has(comando.programa(c))) return false;
  if ((c.redirecciones || []).some((r) => ESCRIBE.has(r.op) && !/^2>/.test(r.op))) return false;
  // con caño: imprime solo si lo que sigue es un filtro de texto o un impresor
  if (fin >= 0 && despues[fin] === '|' && despues[fin + 1] !== '|') {
    const sig = (comando.partir(despues.slice(fin + 1)).comandos || [])[0];
    return !!sig && DESPUES_DEL_CANO.has(comando.programa(sig)) && !(sig.redirecciones || []).some((r) => ESCRIBE.has(r.op) && !/^2>/.test(r.op));
  }
  return true;
}

// Corta el texto en sus pipelines: los tramos de nivel cero separados por ; && || & y saltos de renglón (no por |), respetando
// comillas, escapes y paréntesis. null si no se deja cortar con certeza (un heredoc, algo sin cerrar): ahí manda la llamada entera.
function tramosDeNivelCero(texto, ps) {
  const s = String(texto);
  if (/<</.test(s) || (ps && /@['"]/.test(s))) return null;
  const tramos = [];
  let desde = 0;
  let prof = 0;
  let q = null;
  const esc = ps ? '`' : '\\';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (q) {
      if (ch === esc && q !== "'") i++;
      else if (ch === q) q = null;
      continue;
    }
    if (ch === esc) {
      i++;
      continue;
    }
    if (ch === "'" || ch === '"' || (!ps && ch === '`')) q = ch;
    else if (ch === '(' || ch === '{') prof++;
    else if (ch === ')' || ch === '}') prof--;
    else if (prof === 0) {
      let largo = 0;
      if ((ch === '&' && s[i + 1] === '&') || (ch === '|' && s[i + 1] === '|')) largo = 2;
      else if (ch === ';' || ch === '\n' || (ch === '&' && s[i + 1] !== '>' && s[i - 1] !== '>' && s[i - 1] !== '<')) largo = 1;
      if (largo) {
        tramos.push(s.slice(desde, i));
        i += largo - 1;
        desde = i + 1;
      }
    }
  }
  if (q || prof !== 0) return null;
  tramos.push(s.slice(desde));
  return tramos.filter((t) => t.trim() !== '');
}

// Lo permitido con una ruta del deny → 'lista' (no revela contenido, pero su salida nombra el archivo: el resto del pipeline
// también tiene que estar permitido) · 'usa' ("usar sin ver": se juzga solo) · 'no'.
const PERMITIDOS_DENY = new Set(['ls', 'dir', 'get-childitem', 'gci', 'stat', 'test', '[', 'test-path', 'rm', 'remove-item', 'del', 'ri', 'erase']);
// Crear la carpeta no muestra nada (medido: `mkdir -p "$S/secrets"` en un banco de pruebas).
const CREAN = new Set(['mkdir', 'md', 'new-item']);
// Los que lanzan un paquete: `npx [--prefix app] dotenv -e .env -- cmd` (medido).
const LANZADORES = new Set(['npx', 'pnpx', 'bunx', 'pnpm', 'yarn']);
// Lo que viene por el caño de un `ls` es TEXTO (nombres): estos filtros de texto no abren el archivo (medido: `ls app/.env* | head`).
// En PowerShell por el caño van objetos de archivo, y los que leen su contenido (`gc`, `sls`, `type`) no están en esta lista.
const FILTROS_DE_TEXTO = new Set(['head', 'tail', 'grep', 'egrep', 'wc', 'sort', 'uniq', 'cut', 'tr']);
// Ni el shell que envuelve (`powershell -Command "…"`, `bash -c '…'`: lo de adentro sale como comandos propios y se juzga ahí) ni
// un `cd` o un `Out-Null` leen nada (medido: `powershell -Command "New-Item …; Test-Path $W\app\.env.visual"`).
const SHELLS = new Set(['bash', 'sh', 'zsh', 'dash', 'powershell', 'pwsh', 'cmd']);
function esNeutro(c) {
  const p = comando.programa(c);
  const a = (c.argv || []).slice(1).map((x) => String(x).toLowerCase());
  if (SHELLS.has(p)) return a.some((x) => x === '-c' || x === '/c' || x === '-command' || x === '-encodedcommand');
  return ['cd', 'pushd', 'popd', 'set-location', 'sl', 'out-null'].includes(p);
}
function permitidoConDeny(c, hayImpresor, ctx, resolver) {
  const prog = comando.programa(c);
  const argv = (c.argv || []).map(String);
  if (argv.length === 0) return 'usa'; // una asignación sola (F=.env) no lee nada
  if (PERMITIDOS_DENY.has(prog)) return 'lista';
  if (CREAN.has(prog)) return 'usa';
  if (prog === 'git') {
    const { sub, resto } = subGit(argv);
    return sub === 'status' || sub === 'check-ignore' || (sub === 'rm' && resto.includes('--cached')) ? 'lista' : 'no';
  }
  // "Usar sin ver": --env-file[= ]<ruta> en cualquier programa, y dotenv-cli (`dotenv -e <ruta> -- cmd`, también por npx; medido).
  // La ruta del deny tiene que ir SOLO como ese valor: `npx dotenv -e .env -- cat .env` lee el archivo igual.
  const valor = new Set();
  let usa = false;
  const iDot = LANZADORES.has(prog) ? argv.findIndex((a, i) => i > 0 && /^dotenv(-cli)?$/i.test(a)) : prog === 'dotenv' ? 0 : -1;
  const finDot = argv.indexOf('--') > iDot ? argv.indexOf('--') : argv.length;
  argv.forEach((a, i) => {
    if (a === '--env-file') (usa = true), valor.add(i + 1);
    else if (a.startsWith('--env-file=')) (usa = true), valor.add(i);
    else if (iDot >= 0 && i > iDot && i < finDot && a === '-e') (usa = true), valor.add(i + 1);
  });
  if (usa) {
    const otra = argv.some((a, i) => i > 0 && !valor.has(i) && esRutaDenyArchivo(resolver(a), ctx)) ||
      (c.redirecciones || []).some((r) => !NO_ES_ARCHIVO.has(r.op) && esRutaDenyArchivo(resolver(r.destino), ctx));
    if (!otra) return 'usa';
  }
  if ((prog === 'source' || prog === '.') && !hayImpresor) return 'usa';
  if ((prog === 'echo' || prog === 'printf') && (c.redirecciones || []).some((r) => (r.op === '>' || r.op === '>>') && /(^|\/)\.(git|docker)ignore$/.test(norm(r.destino)))) {
    return 'usa';
  }
  return 'no';
}

const LISTA_ENV = new Set(['get-childitem', 'gci', 'ls', 'dir', 'get-item', 'gi']);
function esImprimeTodas(prog, argv) {
  const args = argv.slice(1);
  if ((prog === 'printenv' || prog === 'env' || prog === 'set') && args.length === 0) return true;
  if ((prog === 'export' || prog === 'declare') && args.length === 1 && args[0] === '-p') return true;
  if (LISTA_ENV.has(prog)) {
    const pos = args.filter((a) => !/^-/.test(a));
    if (pos.length === 1 && /^env:[\\/]?$/i.test(pos[0])) return true;
  }
  return false;
}

function esCredencialGuardada(prog, argv) {
  const a = argv.map((x) => x.toLowerCase());
  if (prog === 'gh' && a[1] === 'auth' && a[2] === 'token') return true;
  if (prog === 'gh' && a[1] === 'auth' && a[2] === 'status' && a.some((x) => x === '-t' || x === '--show-token')) return true;
  if (prog === 'git') {
    const { sub, resto } = subGit(argv);
    if (sub === 'credential' && (resto[0] || '').toLowerCase() === 'fill') return true;
    if (sub === 'credential-manager' && (resto[0] || '').toLowerCase() === 'get') return true;
  }
  if (prog === 'git-credential-manager' && a[1] === 'get') return true;
  return false;
}

// Los nombres de variable cuyo VALOR sale a la pantalla en este comando simple (D-14: (1), (3) y (4); la (2) va por sentencia).
// Lo que imprime en node/python: el texto ENTRE los paréntesis de console.*( / process.stdout.write( / print( / sys.stdout.write(.
// Asignar la variable (`os.environ['X'] = …`, `headers: {a: process.env.X}`) no la imprime (medido).
const RE_LLAMADA_IMPRIME = /(?:console\.[a-z]+|process\.stdout\.write|sys\.stdout\.write|print)\s*\(/g;
function loQueImprime(codigo) {
  const tramos = [];
  let m;
  RE_LLAMADA_IMPRIME.lastIndex = 0;
  while ((m = RE_LLAMADA_IMPRIME.exec(codigo))) {
    let prof = 1;
    let j = m.index + m[0].length;
    for (; j < codigo.length && prof > 0; j++) {
      if (codigo[j] === '(') prof++;
      else if (codigo[j] === ')') prof--;
    }
    tramos.push(codigo.slice(m.index + m[0].length, j));
  }
  return tramos.join('\n');
}
function variablesImpresas(c, prog, argv, verboso) {
  const nombres = new Set();
  // (1) un impresor con la variable; cat <<< $X
  if (IMPRESORES.has(prog)) for (const a of argv.slice(1)) for (const n of varsEn(a)) nombres.add(n);
  if (prog === 'cat') for (const r of c.redirecciones || []) if (r.op === '<<<') for (const n of varsEn(r.destino)) nombres.add(n);
  // (3) printenv X · gci/ls/dir/Get-Item env:X · node -e/-p, python -c que imprimen la variable
  if (prog === 'printenv') for (const a of argv.slice(1)) if (!a.startsWith('-')) nombres.add(a);
  if (LISTA_ENV.has(prog)) for (const a of argv.slice(1)) {
    const m = /^env:[\\/]?([A-Za-z_][A-Za-z0-9_]*)$/i.exec(a);
    if (m) nombres.add(m[1]);
  }
  if (prog === 'node' || prog === 'python' || prog === 'python3' || prog === 'py') {
    const i = argv.findIndex((a) => a === '-e' || a === '-p' || a === '-c' || a === '--eval' || a === '--print');
    if (i > 0) {
      const codigo = argv.slice(i + 1).join(' ');
      const impreso = argv[i] === '-p' || argv[i] === '--print' ? codigo : loQueImprime(codigo);
      const r = /process\.env\.([A-Za-z_][A-Za-z0-9_]*)|process\.env\[\s*['"]([^'"]+)['"]\s*\]|os\.environ\[\s*['"]([^'"]+)['"]\s*\]|(?:os\.environ\.get|os\.getenv|getenv)\(\s*['"]([^'"]+)['"]/g;
      let m;
      while ((m = r.exec(impreso))) nombres.add(m[1] || m[2] || m[3] || m[4]);
    }
  }
  // (4) la variable en la misma llamada que algo verboso (-v, --verbose, --trace*, set -x, bash -x)
  if (verboso) for (const a of argv) for (const n of varsEn(a)) nombres.add(n);
  return [...nombres];
}

// PowerShell (2): cada sentencia (por renglón y por ;) que es solo `$env:X`, `${env:X}`, `$X`, un "string" con variables, o
// [Environment]::GetEnvironmentVariable('X') (también como argumento de un impresor). Asignarla (`$t = …`) no imprime.
function sentenciasQueImprimen(texto) {
  const nombres = new Set();
  for (let s of String(texto).split(/\r?\n|;/)) {
    s = s.trim().replace(/^\(\s*(.*?)\s*\)$/, '$1');
    if (s === '') continue;
    if (/^\$\{?(?:env:)?[A-Za-z_][A-Za-z0-9_]*\}?$/i.test(s) || /^"[^"]*"$/.test(s)) for (const n of varsEn(s)) nombres.add(n);
    const g = /^(?:(?:write-host|write-output|write-information|echo|out-host|out-string)\b.*?)?\(?\s*\[(?:system\.)?environment\]::getenvironmentvariable\(\s*['"]([^'"]+)['"]/i.exec(s);
    if (g) nombres.add(g[1]);
  }
  return nombres;
}

// ---------------------------------------------------------------- Write / Edit / MultiEdit / NotebookEdit

function analizarEscritura(f, ctx, candidatos) {
  if (typeof f !== 'string' || f === '') return;
  const add = (id, decision, detalle, motivo) => candidatos.push({ id, decision, detalle, motivo });
  if (ctx.ses.agente) {
    const fr = rutaFrenoProyecto(f, ctx);
    if (fr) add('frenos-del-proyecto', 'deny', fr.detalle, fr.lock ? MSG_LOCK : MSG_FRENO_PROYECTO);
  }
  const fp = rutaFrenoPC(f, ctx);
  if (fp) frenoPC(fp, ctx, add);
}

// ---------------------------------------------------------------- frenos del proyecto y de la PC

// ¿la ruta es un freno del proyecto? → { detalle, lock } o null. Relativa al cwd.
const COMUN_FRENO = (rel) =>
  rel === 'config' || rel === 'packed-refs' || rel === 'fetch_head' ||
  /^(hooks|refs|logs|worktrees)(\/|$)/.test(rel);
function rutaFrenoProyecto(tok, ctx) {
  const { raiz, comun } = ctx.ses;
  if (typeof tok !== 'string' || tok === '' || !raiz) return null;
  const abs = absoluta(tok, ctx.cwd);
  const debajo = (carpeta) => {
    const c = norm(carpeta);
    return abs === c ? '' : abs.startsWith(`${c}/`) ? abs.slice(c.length + 1) : null;
  };
  if (comun) {
    const rel = debajo(comun);
    if (rel !== null && rel !== '') {
      if (/(^|\/)index\.lock$/.test(rel)) return null; // libre (r2-11)
      if (rel.endsWith('.lock')) return COMUN_FRENO(rel.slice(0, -5)) ? { detalle: `<git-común>/${rel}`, lock: true } : null;
      return COMUN_FRENO(rel) ? { detalle: `<git-común>/${rel}`, lock: false } : null;
    }
  }
  // rf3-5: las raíces protegidas son la propia y TODAS las del git común (el principal y los otros worktrees): un obrero que
  // escribe `../../../.claude/hooks/…` le apaga los frenos a la pestaña de Guido y el pre-commit al merge del director.
  for (const r of raicesProtegidas(ctx)) {
    const rel = debajo(r.dir);
    if (rel === null || !RAIZ_FRENO(rel)) continue;
    return { detalle: r.prefijo + rel, lock: false };
  }
  return null;
}
const RAIZ_FRENO = (rel) =>
  /^\.claude\/hooks(\/|$)/.test(rel) ||
  /^\.claude\/settings(\.local)?\.json$/.test(rel) ||
  /^\.githooks(\/|$)/.test(rel) ||
  rel === '.kit-rol' ||
  rel === '.git'; // el .git de la raíz del worktree (r2-2 b); lo de adentro del común va arriba

// Las raíces cuyos frenos se cuidan → [{ dir, prefijo }]: la propia (prefijo ''), el principal (`dirname(común)` cuando el común se
// llama `.git`) y los otros worktrees (`<común>/worktrees/*/gitdir` → `<wt>/.git`). Solo fs; una vez por llamada (en ctx).
function raicesProtegidas(ctx) {
  if (ctx.raices) return ctx.raices;
  const { raiz, comun } = ctx.ses;
  const lista = [{ dir: raiz, prefijo: '' }];
  const ya = new Set([norm(path.resolve(raiz))]);
  const sumar = (dir, prefijo) => {
    const n = norm(path.resolve(dir));
    if (ya.has(n)) return;
    ya.add(n);
    lista.push({ dir, prefijo });
  };
  if (comun) {
    if (path.basename(comun).toLowerCase() === '.git') sumar(path.dirname(comun), '<principal>/');
    let nombres = [];
    try {
      nombres = fs.readdirSync(path.join(comun, 'worktrees'));
    } catch (e) {
      nombres = [];
    }
    for (const n of nombres) {
      const base = path.join(comun, 'worktrees', n);
      let t = null;
      try {
        t = fs.readFileSync(path.join(base, 'gitdir'), 'utf8').replace(/^﻿/, '').trim();
      } catch (e) {
        t = null;
      }
      if (!t) continue;
      const g = path.resolve(base, t);
      if (path.basename(g).toLowerCase() === '.git') sumar(path.dirname(g), `<worktree ${n}>/`);
    }
  }
  ctx.raices = lista;
  return lista;
}

// ¿la ruta es un freno de la PC? → 'kit' (siempre) · 'settings' (agente o sin ventana: deny; si no, ask) · null.
function rutaFrenoPC(tok, ctx) {
  if (typeof tok !== 'string' || tok === '') return null;
  const abs = absoluta(tok, ctx.cwd);
  const kit = `${HOME_N}/.claude/hooks/kit`;
  if (abs === kit || abs.startsWith(`${kit}/`)) return 'kit';
  if (abs === `${HOME_N}/.claude/settings.json`) return 'settings';
  return null;
}
function frenoPC(fp, ctx, add) {
  if (fp === 'kit') add('frenos-de-la-pc', 'deny', '<home>/.claude/hooks/kit', MSG_PC_KIT);
  else if (ctx.ses.agente || !ctx.conVentana) add('frenos-de-la-pc', 'deny', '<home>/.claude/settings.json', MSG_PC_SETTINGS);
  else add('frenos-de-la-pc', 'ask', '<home>/.claude/settings.json', MSG_PC_SETTINGS_ASK);
}

// La lista de lectura (F §7): lectores de contenido, ls, git diff/log/show/status, `node <la ruta>` como programa, hashes.
const LECTORES = new Set([
  'cat', 'less', 'more', 'head', 'tail', 'get-content', 'gc', 'type', 'ls', 'dir', 'get-childitem', 'gci', 'stat', 'test', '[',
  'test-path', 'wc', 'grep', 'rg', 'findstr', 'select-string', 'sls', 'diff', 'cmp', 'file',
  'sha1sum', 'sha256sum', 'sha512sum', 'md5sum', 'certutil', 'get-filehash',
]);
function esLectorDeRuta(prog, argv, tok) {
  if (LECTORES.has(prog)) return true;
  if (prog === 'git') {
    const { sub } = subGit(argv);
    return ['diff', 'log', 'show', 'status', 'hash-object'].includes(sub);
  }
  if (prog === 'node') return argv[1] === tok; // node <la ruta>: la ruta es el programa
  return false;
}

function rutaParaDetalle(tok, ctx) {
  const abs = absoluta(tok, ctx.cwd);
  if (ctx.ses.raiz) {
    const r = norm(ctx.ses.raiz);
    if (abs.startsWith(`${r}/`)) return abs.slice(r.length + 1);
  }
  if (abs.startsWith(`${HOME_N}/`)) return `<home>/${abs.slice(HOME_N.length + 1)}`;
  return path.basename(String(tok)) || '-';
}

// ---------------------------------------------------------------- UserPromptSubmit (D-5, r1-9)

function decidirPrompt(e, opciones) {
  const ids = clavesEn([e.prompt]);
  if (ids.length === 0) return { evento: 'prompt', decision: 'nada' };
  const id = PREFIJO + ids[0];
  let renglon = null;
  try {
    renglon = anotar(opciones, null, { id, herramienta: 'UserPromptSubmit', detalle: '(prompt)', rol: 'pc', rama: '(sin rama)' });
  } catch (err) {
    /* el renglón no traba el freno */
  }
  return { evento: 'prompt', decision: 'block', salida: salidaPrompt(MSG_PROMPT), id, detalle: '(prompt)', renglon };
}

// ---------------------------------------------------------------- el renglón

// Con raíz (hay ficha, sana o rota): el frenos.log del proyecto. Sin: el de la PC.
function anotar(opciones, raiz, datos) {
  if (typeof opciones.anotar === 'function') return opciones.anotar(raiz, datos);
  if (raiz) return frenosLog.anotar(raiz, datos);
  return anotarPC(datos);
}
const rutaLogPC = () => path.join(HOME, '.claude', 'hooks', 'kit', 'frenos.log');
function anotarPC(datos) {
  if (!INSTALADO) return null;
  const archivo = rutaLogPC();
  fs.mkdirSync(path.dirname(archivo), { recursive: true });
  const linea = frenosLog.renglon(datos);
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

let esPrompt = false;
function principal() {
  let entrada = null;
  try {
    entrada = JSON.parse(fs.readFileSync(0, 'utf8'));
  } catch (e) {
    entrada = null;
  }
  esPrompt = !!entrada && entrada.hook_event_name === 'UserPromptSubmit';
  let r;
  try {
    if (entrada === null) throw new Error('entrada ilegible');
    r = decidir(entrada);
  } catch (e) {
    if (esPrompt) return; // falla abierto (D-5)
    process.stdout.write(`${JSON.stringify(salidaTool('deny', ROTO))}\n`);
    return;
  }
  if (r.decision !== 'nada') process.stdout.write(`${JSON.stringify(r.salida)}\n`);
}

if (require.main === module) {
  try {
    principal();
    process.exitCode = 0;
  } catch (e) {
    process.exitCode = esPrompt ? 0 : 2;
  }
} else {
  module.exports = {
    HERRAMIENTAS_TOOL,
    PREFIJO,
    HOME,
    INSTALADO,
    ROTO,
    MSG_PROMPT,
    bancoPatrones,
    PATRONES,
    RE_JWT,
    jwtEsAnon,
    clavesEn,
    FABRICA_VARS,
    varSensible,
    globARegex,
    denyDeSettings,
    esRutaDenyArchivo,
    rutaFrenoProyecto,
    rutaFrenoPC,
    quitadosVigentes,
    decidir,
    salidaTool,
    salidaPrompt,
    homeDelHook,
  };
}
