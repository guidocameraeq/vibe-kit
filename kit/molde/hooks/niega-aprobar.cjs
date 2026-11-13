'use strict';
// niega-aprobar.cjs — el freno de las firmas del dueño (SPEC-0 4.5 y 6.8a, criterio 18; SPEC-paquete-2 P6.8a y D2.2 F3; red team
// RT-p2 3, r4-1; SPEC-paquete-8d A2, rt-4, rt-5, r2-3, D8d-6, D8d-19, D8d-22). PreToolUse sobre Bash y PowerShell. Corre en el
// proyecto (adentro del portero) y en toda la PC: pc/niega-aprobar.cjs es una copia idéntica que secretos.cjs carga en su proceso.
//
// LAS TRES FIRMAS (D8d-22): aprobar un cambio de freno (`cambios.cjs aprobar`), destrabar una publicación (`noche.cjs publicar
// --seguir`) y autorizar la PC a publicar (`preparar-pc.cjs --publica|--no-publica`). Más un comando que nombre KIT_HOME_PC (el home
// de prueba de R2). Con ventana PREGUNTAN; sin ventana NIEGAN.
//
// QUÉ ES "DE APROBAR" (rt-5, D8d-19): ancho a propósito — todo comando que traiga las dos palabras `cambios` y `aprobar` — salvo que
// estén solo en el mensaje de un `git commit` (-m, -F), el cuerpo de un heredoc, o los argumentos de grep, rg, echo y printf. La
// excepción no vale si ese argumento trae una sustitución (`$(`, comilla invertida: lo de adentro se mira aparte), ni si el comando
// le pasa texto a un shell o intérprete (`echo … | bash`), ni si el texto no se puede partir. Lo que no se ve (un alias, una
// variable, un script que llama a cambios.cjs por dentro) es el riesgo escrito de F3.
//
// DESDE DÓNDE (A2.3; Guido, 2026-11-12: "el clik lo quiero hacer siempre en director, las aprobaciones son con el, no con los
// obreros"). aprobar y --seguir PREGUNTAN solo en dos lugares, de día y con ventana:
//   - la pestaña del director: un worktree con `.kit-rol: director` y rama `modulo/<x>` (el script firma en la carpeta principal);
//   - la carpeta principal del repo, rol humano, en la rama por defecto.
// Todo lo demás NIEGA: un obrero, un /tramo, un nocturno o un rol desconocido (por su .kit-rol y por su rama: `modulo/<x>--<ID>`
// niega diga lo que diga el .kit-rol); un comando que se va a otro lado (cd, pushd, Set-Location, git -C) o una ruta al script que no
// es la de la carpeta de la sesión ni la de su principal; de noche (.kit-noche), de fondo (KIT_FONDO=1) o en un modo sin ventana;
// una sesión abierta en otra carpeta. Autorizar la PC es del Equipador: pregunta solo con rol humano (o fuera de un repo).
// El script repite lo suyo por su lado (defensa doble).
//
// Cada negativa deja un renglón (cambios:aprobar-negado · Bash|PowerShell · el motivo corto; nunca el comando). Es un hook que NIEGA:
// regla 4.7, onFailure "block" en el settings.json. Ante un error propio imprime el deny "freno roto: corré doctor"; si ni eso, sale
// distinto de 0 y onFailure frena. NO corre ningún .propio.sh (F2 ⚠️). Es .cjs a propósito: corre igual con "type": "module".

const fs = require('fs');
const path = require('path');

const HERRAMIENTAS = ['Bash', 'PowerShell'];
const SIN_VENTANA = ['bypassPermissions', 'dontAsk'];
const CON_VENTANA = ['default', 'acceptEdits', 'plan', 'auto'];
const ID = 'cambios:aprobar-negado';
const ROTO = 'freno roto: corré doctor';
const WIN = process.platform === 'win32';

// ---------------------------------------------------------------- qué firma es

const normal = (t) => String(t).toLowerCase().replace(/["'`^\\]/g, '');
const dosPalabras = (t) => {
  const n = normal(t);
  return n.includes('cambios') && n.includes('aprobar');
};
const SUSTITUCION = '$()';
const EXENTOS = new Set(['grep', 'rg', 'echo', 'printf']);
// Los que ejecutan el texto que reciben (por argumento o por la entrada): con uno en el comando, no hay excepción.
const EJECUTAN = new Set(['bash', 'sh', 'zsh', 'dash', 'ksh', 'ash', 'pwsh', 'powershell', 'cmd', 'node', 'python', 'python3', 'py',
  'perl', 'ruby', 'deno', 'bun', 'xargs', 'eval', 'source', '.', 'iex', 'invoke-expression', 'invoke-command', 'icm', 'start-process']);
const MENSAJE_COMMIT = /^(?:-[a-z]*[mF]|--message|--file)$/;
const MENSAJE_PEGADO = /^(?:-[a-z]*[mF].|--message=|--file=)/;
const OPCIONES_GIT_CON_VALOR = new Set(['-c', '-C', '--git-dir', '--work-tree', '--namespace', '--config-env', '--exec-path']);

let comandoLib = null;
const partir = (texto, ps) => {
  if (!comandoLib) comandoLib = require('./lib/comando.cjs');
  return comandoLib.partir(texto, { ps });
};
const prog = (argv) => (argv && argv.length ? comandoLib.programa(argv[0]) : '');

// Lo que cuenta de un comando simple para buscar las dos palabras: todo, salvo el texto exento (A2.1).
function loQueCuenta(c) {
  const a = c.argv || [];
  // los valores de las variables que se asignan cuentan (`A=aprobar; node … $A`: rt A, a propósito)
  const asignados = (c.asignaciones || []).map((x) => `${x.nombre || ''}=${x.valor || ''}`);
  const destinos = [...(c.redirecciones || []).filter((r) => r.op !== '<<' && r.op !== '<<-').map((r) => r.destino), ...asignados];
  if (!a.length) return destinos;
  const p = prog(a);
  // rg --pre corre un programa: sin excepción
  const exento = EXENTOS.has(p) && !(p === 'rg' && a.some((x) => /^--pre(?:-glob)?(?:=|$)/.test(x)));
  if (exento) return [a[0], ...a.slice(1).filter((x) => x.includes(SUSTITUCION)), ...destinos];
  if (p === 'git') {
    let i = 1;
    while (i < a.length && a[i].startsWith('-')) i += OPCIONES_GIT_CON_VALOR.has(a[i]) ? 2 : 1;
    if (a[i] === 'commit') {
      const quedan = a.slice(0, i + 1);
      for (let k = i + 1; k < a.length; k++) {
        if (MENSAJE_COMMIT.test(a[k])) {
          if (a[k + 1] !== undefined && a[k + 1].includes(SUSTITUCION)) quedan.push(a[k + 1]);
          k++;
        } else if (MENSAJE_PEGADO.test(a[k]) && !a[k].includes(SUSTITUCION)) {
          /* el mensaje pegado a su bandera: exento */
        } else quedan.push(a[k]);
      }
      return [...quedan, ...destinos];
    }
  }
  return [...a, ...destinos];
}

// esDeAprobar(comando, {ps}) → ¿es un `cambios aprobar`? (rt-5: sigue ancho, con tres excepciones)
function esDeAprobar(comando, opciones = {}) {
  if (typeof comando !== 'string' || !dosPalabras(comando)) return false;
  return !textoExento(comando, !!opciones.ps, dosPalabras);
}

const ESCRIBE_ARCHIVO = new Set(['>', '>>', '>|', '&>', '&>>', '<>', '*>', '*>>']);
const LEE_ENTRADA_RUTA = /^(?:\/dev\/stdin|\/proc\/self\/fd\/0|-)$/;
// textoExento(comando, ps, hay) → true si lo que `hay` encuentra en el texto está SOLO en lo exento (A2.1). Cualquier duda, false.
function textoExento(comando, ps, hay) {
  let r;
  try {
    r = partir(comando, ps);
  } catch (e) {
    return false;
  }
  if (!r || r.incompleto || !Array.isArray(r.comandos)) return false;
  // Un shell o intérprete que lee lo que le llega por la entrada (sin un archivo ni un -c: `echo … | bash`, `bash <<EOF`), o uno de
  // los que ejecutan texto ajeno (xargs, source, .): puede estar corriendo el texto exento de los otros. Ahí, la regla ancha.
  // (`bash -c "…"`, `eval`, `iex` y `$(…)` no hace falta: comando.cjs ya saca lo de adentro como comandos propios.)
  const leeEntrada = (c) => {
    const p = prog(c.argv);
    if (!EJECUTAN.has(p)) return false;
    if (['xargs', 'source', '.', 'start-process'].includes(p)) return true;
    const args = c.argv.slice(1).filter((x) => !x.startsWith('-') || LEE_ENTRADA_RUTA.test(x));
    return args.length === 0 || LEE_ENTRADA_RUTA.test(args[0]);
  };
  if (r.comandos.some(leeEntrada)) return false;
  // rt A, 1 (ALTO): escribir un archivo (una redirección, tee, un heredoc a un archivo) y en la misma línea correr cualquier
  // intérprete o shell: puede estar corriendo lo que acaba de escribir con el texto exento. Ahí, la regla ancha.
  const escribe = r.comandos.some((c) => (c.redirecciones || []).some((x) => ESCRIBE_ARCHIVO.has(x.op)) || prog(c.argv) === 'tee' || prog(c.argv) === 'tee-object' || prog(c.argv) === 'set-content' || prog(c.argv) === 'out-file' || prog(c.argv) === 'add-content');
  if (escribe && r.comandos.some((c) => EJECUTAN.has(prog(c.argv)))) return false;
  return !hay(r.comandos.flatMap(loQueCuenta).join(' '));
}

const RE_PREPARAR = /(?:^|[\\/])preparar-pc\.cjs$/i;
const RE_NOCHE = /(?:^|[\\/])noche\.cjs$/i;
const RE_CAMBIOS = /(?:^|[\\/])cambios\.cjs$/i;
const RE_PUBLICA = /^--(?:no-)?publica(?:=.*)?$/i;

// queFirma(comando, ps) → 'aprobar' | 'seguir' | 'pc' | 'home-pc' | null
function queFirma(comando, ps) {
  if (typeof comando !== 'string' || comando.trim() === '') return null;
  if (esDeAprobar(comando, { ps })) return 'aprobar';
  const n = normal(comando);
  const mira = n.includes('preparar-pc') || n.includes('noche') || n.includes('kit_home_pc');
  if (!mira) return null;
  let cmds = null;
  try {
    const r = partir(comando, ps);
    if (r && !r.incompleto) cmds = r.comandos;
  } catch (e) {
    cmds = null;
  }
  if (cmds) {
    for (const c of cmds) {
      const a = (c.argv || []).map(String);
      if (a.some((x) => RE_PREPARAR.test(x)) && a.some((x) => RE_PUBLICA.test(x))) return 'pc';
      if (a.some((x) => RE_NOCHE.test(x)) && a.includes('publicar') && a.includes('--seguir')) return 'seguir';
    }
  } else {
    // no se pudo partir: por el texto, del lado seguro
    if (n.includes('preparar-pc') && /--(?:no-)?publica/.test(n)) return 'pc';
    if (n.includes('noche') && n.includes('publicar') && n.includes('--seguir')) return 'seguir';
  }
  // KIT_HOME_PC con las mismas excepciones que aprobar (rt A, 12: un grep que lo busca no es una firma)
  const nombraHome = (t) => normal(t).includes('kit_home_pc');
  if (nombraHome(comando) && !textoExento(comando, ps, nombraHome)) return 'home-pc';
  return null;
}

// ¿Cuántas firmas trae la línea? (rt A, 4: una por clic)
function cuantasFirmas(comandos) {
  let n = 0;
  for (const c of comandos) {
    const a = (c.argv || []).map(String);
    if (a.some((x) => RE_CAMBIOS.test(x)) && a.some((x) => x.toLowerCase() === 'aprobar')) n++;
    else if (a.some((x) => RE_NOCHE.test(x)) && a.includes('--seguir')) n++;
  }
  return n;
}

// ---------------------------------------------------------------- la salida y los textos

function salida(decision, motivo) {
  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: decision,
      permissionDecisionReason: motivo,
    },
  };
}

const A_UN_OBRERO =
  'la firma la da el dueño con un clic, en la pestaña del director. Pará y dejalo anotado: el director lo propone (`cambios.cjs nuevo … --en-defecto`) y se lo pide.';
const motivoModo = (modo) =>
  modo
    ? `esta firma no corre en modo ${modo}: es el OK del dueño y en ese modo no hay ventana para darlo. Pasá a default (Shift+Tab) y pedilo de nuevo.`
    : 'esta firma no corre si no se sabe el modo de permisos (no hay ventana segura para el OK). Abrí la sesión en modo default y pedilo de nuevo.';
const MOTIVOS = {
  fondo: 'esta firma no corre en una sesión de fondo: nadie ve la ventana. Queda en "Te necesito" y el dueño la da de día, en la pestaña del director.',
  noche: 'esta firma no corre de noche: el director solo, sin el dueño, no firma. Queda en "Te necesito" para la mañana.',
  repo: 'esta firma la pide el director en su pestaña, o el dueño en una sesión abierta en la carpeta principal del proyecto; desde esta carpeta, no. Si sos un agente, dejalo anotado.',
  sesion: (r) => `esta sesión trabajó como ${r}: una firma no se pide desde una sesión de agente, aunque ahora esté en otra carpeta. Dejalo anotado: el director se lo pide al dueño.`,
  dos: 'una firma por clic: este comando trae más de una; pedilas de a una.',
  afuera: 'esta firma se pide desde la carpeta de la sesión, sin irse a otro lado (cd, pushd, Set-Location, git -C): abrí una sesión en ese proyecto.',
  ruta: 'esta firma corre el script de este proyecto (el de la carpeta de la sesión o el de su carpeta principal), no uno de otra carpeta: abrí una sesión en ese proyecto.',
  rama: (d) => `en la carpeta principal la firma va desde la rama por defecto${d ? ` (${d})` : ''}: pasate a ella y pedila de nuevo.`,
  pc: 'autorizar esta PC a publicar es del dueño, con "preparame esta PC": no se corre desde una sesión de agente.',
  homePc: 'KIT_HOME_PC es el home de prueba del kit: no se nombra desde una sesión de agente, de fondo o sin ventana.',
};
const rotaMotivo = (donde) => `esta firma no corre con la ficha rota (${donde}) — corré doctor.`;

function quienPide(lugar, modulo) {
  return lugar === 'director' ? `director-${modulo}` : 'la sesión de la carpeta principal';
}

// El cambio tal cual está en una ref (rt A, 3: lo que se firma es lo commiteado, no el disco). → { texto, ids, control } o null.
function cambioEnRef(principal, ref, id) {
  try {
    const ruta = require('./lib/cambios-ruta.cjs');
    if (!id || !ruta.esId(id)) return null;
    const r = require('./lib/git.cjs').correr(['show', `${ref}:${ruta.rutaRelativa(id)}`], { cwd: principal });
    if (!r.ok) return null;
    const C = require('./lib/cambios.cjs');
    const texto = r.salida.toString('utf8');
    const { datos } = C.leer(texto);
    return { texto, ids: Array.isArray(datos.ids) ? datos.ids.join(', ') : '-', control: C.hashSello(texto).slice(0, 8) };
  } catch (e) {
    return null;
  }
}
// La ventana de aprobar (rt-2: nada que escriba el agente; el id, los ids de la cabecera y el control salen del archivo commiteado).
function ventanaAprobar(cambio, id, pide) {
  const detalle = cambio ? `Cambio ${id} · toca: ${cambio.ids || '-'} · control: ${cambio.control}` : `Cambio ${id || '(sin id)'} · no lo pude leer: no aceptes y corré verificar`;
  return `Es tu firma para cambiar un freno de este proyecto. Te la pide: ${pide}. ${detalle}. Aceptá solo si es lo que viste en "Te necesito".`;
}

// ---------------------------------------------------------------- la sesión y el pase (rt A, 1 y 2)

// Las sesiones que alguna vez trabajaron en una carpeta de agente (que no es la del director) quedan anotadas en
// <git-dir común>/kit-sesiones-rol/<session_id>: un `cd` en una llamada aparte no las vuelve "humano" para las firmas.
const CARPETA_SESIONES = 'kit-sesiones-rol';
const RE_SESION = /^[A-Za-z0-9-]{1,100}$/;
function recordarSesion(e) {
  try {
    const sid = typeof e.session_id === 'string' ? e.session_id : '';
    if (!RE_SESION.test(sid)) return;
    const s = require('./lib/agente.cjs').sesionDeAgente(require('./lib/contexto.cjs').cwdDe(e));
    if (!s || !s.agente || !s.comun || s.rol === 'director') return;
    const dir = path.join(s.comun, CARPETA_SESIONES);
    const archivo = path.join(dir, sid);
    if (fs.existsSync(archivo)) return;
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(archivo, `${s.rol === 'humano' ? 'obrero' : s.rol}\n`);
  } catch (err) {
    /* es una red de más: si no se puede escribir, las demás negativas siguen */
  }
}
function rolDeSesion(e, comun) {
  const sid = typeof e.session_id === 'string' ? e.session_id : '';
  if (!RE_SESION.test(sid) || !comun) return null;
  try {
    return fs.readFileSync(path.join(comun, CARPETA_SESIONES, sid), 'utf8').trim() || 'agente';
  } catch (err) {
    return null;
  }
}
// El pase de un solo uso: la ventana de aprobar en la pestaña del director lo deja; el script lo exige (mismo id, mismo control,
// de hace menos de PASE_MS) y lo borra. Un script que el freno no ve no tiene pase: no firma.
const ARCHIVO_PASE = 'kit-firma-pedida.json';
const PASE_MS = 15 * 60 * 1000;
function dejarPase(pase) {
  if (!pase) return;
  const { comun, id, control } = pase;
  try {
    fs.writeFileSync(path.join(comun, ARCHIVO_PASE), `${JSON.stringify({ id, control, ms: Date.now() })}\n`);
  } catch (err) {
    /* sin pase, el script no firma: falla para el lado seguro */
  }
}
const ventanaSeguir = (pide) =>
  `Es tu firma para destrabar la publicación de este proyecto (la última prueba de humo falló). Te la pide: ${pide}. Aceptá solo si ya miraste lo publicado y es lo que viste en "Te necesito".`;
const VENTANA_PC = 'Es tu firma para que esta PC publique sola (o deje de hacerlo) en un proyecto. Aceptá solo si lo pediste vos en "preparame esta PC".';
const VENTANA_HOME_PC = 'Este comando nombra KIT_HOME_PC, el home de prueba del kit. Aceptá solo si estás armando una prueba.';

// ---------------------------------------------------------------- de dónde

const mismaRuta = (a, b) => (WIN ? path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase() : path.resolve(a) === path.resolve(b));
const CD = new Set(['cd', 'chdir', 'pushd', 'popd', 'set-location', 'sl', 'push-location', 'pop-location']);

// ¿Algún comando de la línea se va a otro lado? (cd, pushd, Set-Location, git -C, git --git-dir/--work-tree)
function seVaAOtroLado(comandos) {
  for (const c of comandos) {
    const a = c.argv || [];
    const p = prog(a);
    if (CD.has(p)) return true;
    if (p === 'git' && a.slice(1).some((x) => x === '-C' || /^--(?:git-dir|work-tree)(?:=|$)/.test(x))) return true;
  }
  return false;
}

// ¿Cada ruta al script que se nombra es la de la carpeta de la sesión o la de su principal?
function rutasPropias(comandos, re, cwd, raices) {
  for (const c of comandos) {
    for (const x of c.argv || []) {
      if (!re.test(x)) continue;
      if (/[$%]/.test(x) || x.includes(SUSTITUCION)) return false;
      const abs = path.resolve(cwd, x);
      if (!raices.some((r) => mismaRuta(abs, path.join(r, '.claude', 'scripts', path.basename(abs))))) return false;
    }
  }
  return true;
}

function idDeAprobar(comandos) {
  for (const c of comandos) {
    const a = c.argv || [];
    if (!a.some((x) => RE_CAMBIOS.test(x))) continue;
    const i = a.findIndex((x) => x.toLowerCase() === 'aprobar');
    if (i >= 0) return a.slice(i + 1).find((x) => x !== '--') || null;
  }
  return null;
}

// ---------------------------------------------------------------- la decisión

// decidir(entrada, {anotar, entorno}) → { decision: 'nada' } · { decision: 'ask', salida, firma } ·
// { decision: 'deny', salida, detalle, renglon, firma }. Tira solo si algo se rompe adentro: el que llama lo traduce a "freno roto".
function decidir(entrada, opciones = {}) {
  const e = entrada && typeof entrada === 'object' && !Array.isArray(entrada) ? entrada : null;
  if (!e) throw new Error('la entrada no es un objeto');
  if (typeof e.tool_name === 'string' && !HERRAMIENTAS.includes(e.tool_name)) return { decision: 'nada' };
  const comando = e.tool_input && e.tool_input.command;
  const ps = e.tool_name === 'PowerShell';
  if (opciones.recordar !== false) recordarSesion(e);
  const firma = queFirma(comando, ps);
  if (!firma) return { decision: 'nada' };

  const contexto = require('./lib/contexto.cjs');
  const entorno = opciones.entorno || process.env;
  const cwd = contexto.cwdDe(e);
  const g = contexto.datosGit(cwd);
  const raiz = g ? g.raiz : null;
  const rama = raiz ? contexto.rama(raiz) : null;
  const herramienta = HERRAMIENTAS.includes(e.tool_name) ? e.tool_name : 'Bash';

  const negar = (motivo, detalle) => {
    let renglon = null;
    const det = firma === 'aprobar' ? detalle : `${firma}: ${detalle}`;
    if (raiz) {
      try {
        const frenosLog = require('./lib/frenos-log.cjs');
        const anotar = opciones.anotar || frenosLog.anotar;
        renglon = anotar(raiz, { id: ID, herramienta, detalle: det, rol: contexto.rol(raiz), rama });
      } catch (err) {
        /* el renglón es rastro: el freno vale igual */
      }
    }
    return { decision: 'deny', salida: salida('deny', motivo), detalle: det, renglon, firma };
  };
  const preguntar = (motivo) => ({ decision: 'ask', salida: salida('ask', motivo), firma });

  // 1. la ventana: sin modo, un modo sin ventana o uno que no se conoce, niega
  const modo = typeof e.permission_mode === 'string' ? e.permission_mode.trim() : '';
  if (!modo) return negar(motivoModo(null), 'sin modo');
  if (SIN_VENTANA.includes(modo)) return negar(motivoModo(modo), modo);
  if (!CON_VENTANA.includes(modo)) return negar(motivoModo(modo), 'modo desconocido');
  // 2. de fondo y de noche: el dueño no está
  if (contexto.deFondo(entorno)) return negar(MOTIVOS.fondo, 'de fondo');
  if (raiz && contexto.deNoche(raiz, { rama }).noche) return negar(MOTIVOS.noche, 'de noche');
  // 3. un obrero (por su rama, diga lo que diga el .kit-rol) o cualquier rol de agente que no sea el director
  const pest = contexto.pestana(rama);
  const rol = raiz ? contexto.rol(raiz) : null;
  if (pest.tipo === 'obrero') return negar(firma === 'pc' ? MOTIVOS.pc : firma === 'home-pc' ? MOTIVOS.homePc : A_UN_OBRERO, 'rama de obrero');

  // La PC y el home de prueba: del dueño, rol humano (o fuera de un repo, donde no hay sesión de agente)
  if (firma === 'pc' || firma === 'home-pc') {
    if (raiz && rol !== 'humano') return negar(firma === 'pc' ? MOTIVOS.pc : MOTIVOS.homePc, `rol ${rol}`);
    // 3b. una sesión que trabajó como agente en este repo (rt A, 2: un `cd` en una llamada aparte no la vuelve persona)
    const deSesion = g ? rolDeSesion(e, g.gitComun) : null;
    if (deSesion) return negar(MOTIVOS.sesion(deSesion), `sesión de ${deSesion}`);
    return preguntar(firma === 'pc' ? VENTANA_PC : VENTANA_HOME_PC);
  }

  // aprobar y --seguir
  if (!raiz) return negar(MOTIVOS.repo, 'fuera de un repo');
  const esPrincipal = g.gitDir === g.gitComun;
  // revisor de la tanda A (3): en un repo sin el kit, las dos palabras sueltas (`cat src/cambios/aprobar.ts`) no son una firma; si
  // la línea nombra un cambios.cjs/noche.cjs o se va a otro lado, sí (el freno de la PC cuida a los otros repos).
  {
    const principalK = esPrincipal ? raiz : path.dirname(g.gitComun);
    const conKit = fs.existsSync(path.join(principalK, '.claude', 'kit.md')) || fs.existsSync(path.join(principalK, '.claude', 'scripts', 'cambios.cjs'));
    if (!conKit) {
      const rr = partir(comando, ps);
      const cc = rr && Array.isArray(rr.comandos) ? rr.comandos : [];
      const nombraScript = cc.some((c) => (c.argv || []).some((x) => RE_CAMBIOS.test(x) || RE_NOCHE.test(x)));
      if (!nombraScript && !seVaAOtroLado(cc)) return { decision: 'nada' };
    }
  }
  if (rol !== 'humano' && !(rol === 'director' && !esPrincipal)) {
    return negar(
      rol === 'director'
        ? `una carpeta principal con .kit-rol: director no es la pestaña del director: ${MOTIVOS.repo}`
        : `esta carpeta es de un agente (.kit-rol: ${rol}): ${A_UN_OBRERO}`,
      `rol ${rol}`,
    );
  }
  // 3b. una sesión que trabajó como agente en este repo (rt A, 2: un `cd` en una llamada aparte no la vuelve persona)
  const deSesion = g ? rolDeSesion(e, g.gitComun) : null;
  if (deSesion) return negar(MOTIVOS.sesion(deSesion), `sesión de ${deSesion}`);
  const r = partir(comando, ps);
  const comandos = r && Array.isArray(r.comandos) ? r.comandos : [];
  if (seVaAOtroLado(comandos)) return negar(MOTIVOS.afuera, 'se va a otro lado');
  if (cuantasFirmas(comandos) > 1) return negar(MOTIVOS.dos, 'más de una firma');
  const principal = esPrincipal ? raiz : path.dirname(g.gitComun);
  // en la pestaña del director vale solo el script de la carpeta principal (A2.3; rt A: la copia de la rama del módulo, no)
  if (!rutasPropias(comandos, firma === 'aprobar' ? RE_CAMBIOS : RE_NOCHE, cwd, esPrincipal ? [raiz] : [principal])) return negar(MOTIVOS.ruta, 'otra ruta');

  let lugar;
  if (esPrincipal) {
    const defecto = contexto.ramaPorDefecto(raiz);
    if (!defecto || rama !== defecto) return negar(MOTIVOS.rama(defecto), 'fuera de la rama por defecto');
    lugar = 'principal';
  } else if (rol === 'director' && pest.tipo === 'director') {
    lugar = 'director';
  } else {
    // un worktree que no es de director (humano en una misión, un director en una rama que no es la suya)
    return negar(MOTIVOS.repo, rol === 'director' ? 'director fuera de su rama' : 'worktree');
  }

  const ficha = contexto.fichaVigente(principal);
  if (ficha.estado === 'rota') return negar(rotaMotivo(ficha.donde), 'ficha rota');

  const pide = quienPide(lugar, pest.modulo);
  if (firma !== 'aprobar') return preguntar(ventanaSeguir(pide));
  // Lo que se va a firmar: en la principal, su HEAD; desde el director, la rama por defecto vigente (el script la trae antes)
  const id = idDeAprobar(comandos);
  let ref = 'HEAD';
  if (lugar === 'director') {
    const rv = contexto.refVigente(principal);
    ref = rv ? rv.ref : 'HEAD';
  }
  const cambio = cambioEnRef(principal, ref, id);
  // el pase lo escribe quien decide al final (principal, el portero o secretos), solo si sale esta pregunta (revisor, 7)
  const r2 = preguntar(ventanaAprobar(cambio, id, pide));
  if (lugar === 'director' && cambio) r2.pase = { comun: g.gitComun, id, control: cambio.control };
  return r2;
}

// A5.3 y A5.4 (SPEC-paquete-8d): solo, como plan B del portero, con el mismo plazo propio (el del settings menos 10 s) y el aviso
// honesto si no le alcanzó: niega, pero dice que no es un no (id freno:sin-tiempo).
const PLAZO_PROPIO_MS = 50000;
const SIN_TIEMPO = 'el freno no llegó a mirar a tiempo (la PC está cargada): repetí el mismo comando; no es un no';
function principal() {
  let r;
  const git = require('./lib/git.cjs');
  git.fijarPlazo(Date.now() + PLAZO_PROPIO_MS);
  try {
    const t = fs.readFileSync(0, 'utf8');
    r = decidir(JSON.parse(t));
  } catch (e) {
    r = { decision: 'deny', salida: salida('deny', git.salteadasPorPlazo() > 0 ? SIN_TIEMPO : ROTO) };
  }
  if (r.decision !== 'deny' && git.salteadasPorPlazo() > 0) r = { decision: 'deny', salida: salida('deny', SIN_TIEMPO) };
  if (r.decision === 'ask' && r.pase) dejarPase(r.pase);
  if (r.decision !== 'nada') process.stdout.write(`${JSON.stringify(r.salida)}\n`);
}

if (require.main === module) {
  try {
    principal();
    process.exitCode = 0;
  } catch (e) {
    // Ni el deny se pudo imprimir: la salida distinta de 0 (2 = error que bloquea) y onFailure "block" frenan.
    process.exitCode = 2;
  }
} else {
  module.exports = { HERRAMIENTAS, SIN_VENTANA, CON_VENTANA, ID, ROTO, A_UN_OBRERO, MOTIVOS, CARPETA_SESIONES, ARCHIVO_PASE, PASE_MS, esDeAprobar, queFirma, salida, decidir, dejarPase };
}
