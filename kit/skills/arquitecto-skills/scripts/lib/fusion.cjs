'use strict';
// fusion.cjs — la fusión de una pieza adaptada (SPEC-paquete-6 D6-19, la opción C de Guido; D6-1; crit. 18). La llama aplicar.
//
// Una pieza adaptada NUNCA queda sin actualizarse. Por archivo, contra el molde viejo (v), el nuevo (n) y lo del proyecto (p):
//   - el molde no lo cambió, o el proyecto ya tiene el nuevo → nada;
//   - el proyecto lo tiene intacto (igual al viejo fuera de la zona propia) → el nuevo, con la zona del proyecto (mezclarTexto);
//   - el molde lo retira → queda (las bajas de una adaptada nunca se borran, r1-3); el proyecto lo borró y el molde lo cambió → choque;
//   - si no, TRES VÍAS: git merge-file -p --diff3 <p> <v> <n>, con la zona propia vaciada en los tres (se fusiona solo lo de afuera;
//     después mezclarTexto vuelve a poner la del proyecto, byte a byte).
// Si ningún archivo necesita tres vías, se aplica sin más (el molde no tocó lo adaptado). Si alguno la necesita, EL GATE DEL PORQUÉ:
// SOLO `por:` de la pieza en la ficha (D8b-4: el git log ya no cuenta; cada adaptada pregunta una vez).
//   - sin porqué → "te espera" (no se fusiona aunque salga limpio: lo decide el dueño);
//   - con porqué y merge-file limpio (y validado) → esa es la fusión, sola;
//   - LA MEZCLA CHOCÓ (merge-file con conflictos, un choque, o lo limpio que no pasa validar) → NUNCA se resuelve sola (SPEC-paquete-8r
//     §3, la opción A de Guido): "te espera", y el motivo empieza siempre con "la mezcla chocó" (el /inicio pregunta siempre). Si hay
//     conflictos y claude (no en --plan; también cuando la pieza ya esperaba), un `claude -p` en el clon ARMA LA PROPUESTA sobre una
//     copia en .kit-fusion/<archivo> (acceptEdits, --allowedTools Read y Edit de .kit-fusion/**, las mismas allow en
//     .claude/settings.local.json del clon, deny Bash; nunca el modo que saltea permisos): validada, va al informe como la fusión
//     propuesta ("la mezcla chocó: la propuesta la armó claude, elegí vos") y no se aplica. Sin claude, si falla, si se pasa de 5 min,
//     si toca otra ruta o si lo suyo no valida → "la mezcla chocó (<por qué>)", sin propuesta.
// Lo que sale (limpio o de claude) se valida: sin marcadores de conflicto, la zona propia intacta y los .js/.cjs/.mjs con
// node --check. "Te espera" = .claude/fusiones/<pieza>.md (viaja en el commit del kit): qué pieza es, el motivo, su `por:`, lo que
// dice kit/CHANGELOG.md de las versiones del medio (`nota`), `## Dónde chocan` (los pedazos en conflicto, lo tuyo y lo nuevo), los
// dos diffs por archivo (molde viejo → nuevo; molde viejo → lo del proyecto), la fusión propuesta si la hay, la versión nueva entera
// y las cuatro salidas (paquete 8b: mezclar, quedarse con la propia, tomar la nueva, congelar — esta no en una pieza de FRENOS), con
// la línea de la recomendación con criterio. La pieza queda como estaba. /inicio recomienda, lo decide con el dueño y lo escribe
// `actualizar.cjs resolver` (no el modelo); para no pisar trabajo, el informe guarda la huella de lo tuyo por archivo.
// El informe guarda en una línea fija (`base: <versión>`) la versión del molde del que viene la pieza. Mientras exista, la pieza
// NUNCA se fusiona sola: la flota siguiente lo rehace contra el molde nuevo DESDE ESA BASE (aplicar lo fuerza), así no se pierde
// lo que trajo la versión intermedia. Cuando el dueño contesta y el archivo se borra, la base vuelve a ser `kit:` de la ficha.
// Escribe solo en temporales y, durante el claude, .kit-fusion/ y .claude/settings.local.json del clon (los dos en
// .git/info/exclude, y se borran siempre): nunca se commitean.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const F = require('../../pc/lib/ficha.cjs');
const Z = require('../../pc/lib/zona-propia.cjs');

const RUTA_FUSIONES = '.claude/fusiones';
const CARPETA_FUSION = '.kit-fusion';
const RUTA_LOCAL = '.claude/settings.local.json';
const PLAZO_CLAUDE = 5 * 60 * 1000;
const PERMITIDAS = [`Read(./${CARPETA_FUSION}/**)`, `Edit(./${CARPETA_FUSION}/**)`];
// La línea del claude: acceptEdits y las herramientas estrechas. Nunca bypass (D6-1).
const ARGS_CLAUDE = ['-p', '--permission-mode', 'acceptEdits', '--allowedTools', ...PERMITIDAS];
const RE_MARCADOR = /^(?:<{7}|>{7}|\|{7})(?: .*)?$|^={7}$/m;
const ADAPTADA = 'adaptada (desvío detectado)';

const lf = (s) => (s == null ? null : String(s).replace(/\r\n/g, '\n'));
const esMd = (rel) => /\.md$/i.test(rel);
const esJs = (rel) => /\.(c|m)?js$/i.test(rel);
const huella = (rel, t) => (esMd(rel) ? Z.hashPieza(t) : F.hash(t));
const iguales = (rel, a, b) => a !== null && b !== null && huella(rel, a) === huella(rel, b);
const corto = (s, n = 60) => {
  const t = String(s).replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
};

function git(cwd, args, o = {}) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', windowsHide: true, input: o.input, env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } });
  return { ok: !r.error && r.status === 0, status: r.error ? -1 : r.status, out: r.stdout || '', err: String(r.stderr || (r.error && r.error.message) || '') };
}

// ---------------------------------------------------------------- la zona propia

const zonasDe = (t) => {
  const z = Z.zonas(t);
  return z.ok ? z.zonas : null;
};
// El texto con lo de ADENTRO de cada zona vaciado (las marcas quedan). Solo los .md tienen zona; una marca rota → tal cual.
function vaciarZonas(rel, t) {
  if (t === null || !esMd(rel)) return t;
  const zs = zonasDe(t);
  if (!zs || !zs.length) return t;
  const ls = t.split('\n');
  return ls.filter((_, i) => !zs.some((z) => i > z.desde - 1 && i < z.hasta - 1)).join('\n');
}
// El texto fusionado con la zona del proyecto de vuelta, byte a byte. → {ok, texto} o {ok: false, problema}.
function conZona(rel, texto, p) {
  if (!esMd(rel) || p === null) return { ok: true, texto };
  const zp = zonasDe(p);
  if (!zp || !zp.length) return { ok: true, texto };
  const m = Z.mezclarTexto(texto, p);
  if (!m.ok) return { ok: false, problema: `la zona propia no quedó (${m.problema})` };
  return m;
}

// ---------------------------------------------------------------- tres vías

// git merge-file -p --diff3 en un temporal. → {limpio, texto, conflictos} (texto con marcadores si no es limpio).
function mergeFile(p, v, n, tmp) {
  const d = fs.mkdtempSync(path.join(tmp, 'mf-'));
  const [fp, fv, fn] = ['proyecto', 'viejo', 'nuevo'].map((x) => path.join(d, x));
  fs.writeFileSync(fp, p);
  fs.writeFileSync(fv, v);
  fs.writeFileSync(fn, n);
  const r = git(d, ['merge-file', '-p', '--diff3', '-L', 'proyecto', '-L', 'molde viejo', '-L', 'molde nuevo', fp, fv, fn]);
  if (r.status < 0 || r.status > 127) throw new Error(`git merge-file no anduvo: ${r.err.trim()}`);
  return { limpio: r.status === 0, texto: r.out, conflictos: r.status };
}

// Un archivo de la pieza: {rel, v, n, p} → {tipo: igual | molde (destino) | tres (limpio, texto) | choque (problema)}.
function clasificar({ rel, v, n, p }, tmp) {
  if (n === null) return { tipo: 'igual' }; // el molde lo retira (o nunca lo trajo): lo del proyecto queda (r1-3)
  if (v !== null && iguales(rel, v, n)) return { tipo: 'igual' }; // el molde no cambió este archivo
  if (p === null) {
    if (v === null) return { tipo: 'molde', destino: n }; // nuevo en el molde, el proyecto no lo tiene
    return { tipo: 'choque', problema: `${rel}: lo borraste y el molde lo cambió` };
  }
  if (iguales(rel, p, n)) return { tipo: 'igual' };
  if (v !== null && iguales(rel, p, v)) {
    const z = conZona(rel, n, p);
    return z.ok ? { tipo: 'molde', destino: z.texto } : { tipo: 'choque', problema: `${rel}: ${z.problema}` };
  }
  const r = mergeFile(vaciarZonas(rel, p), v === null ? '' : vaciarZonas(rel, v), vaciarZonas(rel, n), tmp);
  return { tipo: 'tres', limpio: r.limpio, texto: r.texto, conflictos: r.conflictos };
}

// ---------------------------------------------------------------- el porqué

// → {de: 'ficha', texto} o null. valorFicha = el valor de la pieza en la ficha. Solo `por:` (D8b-4, renglón 3 del repaso): sin
// él, la adaptada llega a "te espera" la primera vez aunque la mezcla salga limpia.
function porqueDe(valorFicha) {
  if (valorFicha && typeof valorFicha === 'object' && typeof valorFicha.por === 'string' && valorFicha.por.trim()) {
    return { de: 'ficha', texto: valorFicha.por.trim() };
  }
  return null;
}

// ---------------------------------------------------------------- las piezas de frenos (congelar no va: r1-5)

// Congelar (`propia`) una de estas deja el proyecto sin los arreglos de seguridad del kit para siempre. Cada una, con su porqué.
const FRENOS = [
  { id: 'hook-*', por: 'los porteros de cada herramienta (git-seguro, sensible, escritura, arranque)' },
  { id: 'settings', por: 'las deny y los hooks que se enchufan' },
  { id: 'candado', por: 'estructura.cjs: el candado del commit' },
  { id: 'githooks', por: 'el pre-commit y el pre-push (gitleaks, el rol)' },
  { id: 'hooks-lib', por: 'lo que leen todos los porteros (la ficha, el contexto, los frenos)' },
  { id: 'cambios-metodo', por: 'niega-aprobar: un agente no aprueba sus propios cambios' },
  { id: 'scripts', por: 'encargo.cjs: la línea de permisos del obrero' },
];
const esFreno = (id) => FRENOS.some((f) => (f.id.endsWith('*') ? String(id).startsWith(f.id.slice(0, -1)) : id === f.id));
const SALIDAS = ['mezclar', 'propia', 'nueva', 'congelar'];

// ---------------------------------------------------------------- validar lo que sale

// → {ok, texto} (con la zona del proyecto puesta) o {ok: false, problema}.
function validar(rel, texto, p, tmp) {
  if (texto === null || texto === undefined) return { ok: false, problema: `${rel}: no volvió` };
  const t = lf(texto);
  if (RE_MARCADOR.test(t)) return { ok: false, problema: `${rel}: quedaron marcadores de conflicto` };
  const z = conZona(rel, t, p);
  if (!z.ok) return { ok: false, problema: `${rel}: ${z.problema}` };
  // la zona, byte a byte (la mezcla la puso; si algo la movió, no pasa)
  if (esMd(rel) && p !== null) {
    const a = zonasDe(p), b = zonasDe(z.texto);
    if (a && a.length && (!b || JSON.stringify(a.map((x) => x.contenido)) !== JSON.stringify(b.map((x) => x.contenido)))) {
      return { ok: false, problema: `${rel}: la zona propia no quedó` };
    }
  }
  if (esJs(rel)) {
    const d = fs.mkdtempSync(path.join(tmp, 'chk-'));
    const f = path.join(d, path.basename(rel));
    fs.writeFileSync(f, z.texto);
    const r = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8', windowsHide: true });
    if (r.error || r.status !== 0) return { ok: false, problema: `${rel}: no pasa node --check` };
  }
  return { ok: true, texto: z.texto };
}

// ---------------------------------------------------------------- el claude

// El ejecutable: --claude <exe>; sin él, claude del PATH si está; 'no' lo apaga. → ruta o null.
function buscarClaude(opcion, env = process.env) {
  if (opcion === 'no' || opcion === false) return null;
  if (opcion) return opcion;
  const exts = process.platform === 'win32' ? ['.exe', '.cmd', '.bat', ''] : [''];
  for (const dir of String(env.PATH || env.Path || '').split(path.delimiter).filter(Boolean)) {
    for (const e of exts) {
      const f = path.join(dir, `claude${e}`);
      try {
        if (fs.statSync(f).isFile()) return f;
      } catch { /* no está acá */ }
    }
  }
  return null;
}

// Cómo se lanza: un script de node (las pruebas) con este node; un .cmd de Windows por cmd.exe; lo demás, directo.
function lanzador(exe, args) {
  if (/\.(c|m)?js$/i.test(exe)) return { cmd: process.execPath, args: [exe, ...args], extra: {} };
  if (process.platform === 'win32' && /\.(cmd|bat)$/i.test(exe)) {
    const linea = [exe, ...args].map((a) => `"${a}"`).join(' ');
    return { cmd: process.env.ComSpec || 'cmd.exe', args: ['/d', '/s', '/c', `"${linea}"`], extra: { windowsVerbatimArguments: true } };
  }
  return { cmd: exe, args, extra: {} };
}

function excluir(carpeta, rutas) {
  const f = path.join(carpeta, '.git', 'info', 'exclude');
  let t = '';
  try { t = fs.readFileSync(f, 'utf8'); } catch { /* sin exclude todavía */ }
  const faltan = rutas.filter((r) => !t.split(/\r?\n/).includes(r));
  if (faltan.length) {
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.appendFileSync(f, `${t && !t.endsWith('\n') ? '\n' : ''}${faltan.join('\n')}\n`);
  }
}

// Lo que cambió en el clon fuera de lo nuestro (.kit-rol, .kit-fusion/, settings.local.json).
function tocadas(carpeta) {
  const st = git(carpeta, ['status', '--porcelain=v1', '-z', '--untracked-files=all']);
  if (!st.ok) return ['(git status falló)'];
  return st.out.split('\0').filter(Boolean).map((e) => e.slice(3))
    .filter((r) => r && r !== '.kit-rol' && r !== RUTA_LOCAL && !r.startsWith(`${CARPETA_FUSION}/`));
}

function pedido({ id, versiones, porque, rels }) {
  return [
    `Sos la fusión del actualizador del kit, en un clon temporal de un proyecto. La pieza "${id}" está adaptada en este proyecto y el`,
    `molde del kit la cambió (${versiones.viejo} → ${versiones.nuevo}). Por qué la adaptaron: ${porque}`,
    '',
    `En ${CARPETA_FUSION}/ hay ${rels.length} archivo(s) con marcadores de conflicto de git, en formato diff3`,
    '(<<<<<<< proyecto · ||||||| molde viejo · ======= · >>>>>>> molde nuevo):',
    ...rels.map((r) => `- ${CARPETA_FUSION}/${r}`),
    '',
    'Resolvé cada conflicto con Edit: lo nuevo del molde Y la adaptación del proyecto encima, respetando el porqué. Al terminar no',
    'queda ningún marcador. Las líneas <!-- kit:propio --> y <!-- /kit:propio --> quedan como están. Tocá SOLO esos archivos:',
    `nada de Bash, nada fuera de ${CARPETA_FUSION}/. Si no se puede fusionar con criterio, no edites nada.`,
    '',
  ].join('\n');
}

// Corre el claude sobre los conflictos. → {ok, textos: Map(rel → texto)} o {ok: false, problema}. Siempre deja el clon como estaba.
function conClaude({ carpeta, exe, id, versiones, porque, conflictos, plazo = PLAZO_CLAUDE }) {
  excluir(carpeta, [`${CARPETA_FUSION}/`, RUTA_LOCAL]);
  const dirF = path.join(carpeta, CARPETA_FUSION);
  const local = path.join(carpeta, ...RUTA_LOCAL.split('/'));
  const previo = fs.existsSync(local) ? fs.readFileSync(local) : null;
  try {
    for (const c of conflictos) {
      const f = path.join(dirF, ...c.rel.split('/'));
      fs.mkdirSync(path.dirname(f), { recursive: true });
      fs.writeFileSync(f, c.texto);
    }
    // en un clon sin confianza el settings.json commiteado se ignora: las allow van en el local (D2.2)
    fs.mkdirSync(path.dirname(local), { recursive: true });
    fs.writeFileSync(local, `${JSON.stringify({ permissions: { allow: PERMITIDAS, deny: ['Bash'] } }, null, 2)}\n`);
    const env = { ...process.env };
    for (const k of Object.keys(env)) if (/^(CLAUDECODE|GIT_DIR|GIT_WORK_TREE|GIT_INDEX_FILE|KIT_MOLDE|KIT_MOLDE_VIEJO)$/i.test(k)) delete env[k];
    const l = lanzador(exe, ARGS_CLAUDE);
    const r = spawnSync(l.cmd, l.args, {
      cwd: carpeta, input: pedido({ id, versiones, porque, rels: conflictos.map((c) => c.rel) }), encoding: 'utf8', windowsHide: true,
      timeout: plazo, killSignal: 'SIGKILL', env, maxBuffer: 16 * 1024 * 1024, ...l.extra,
    });
    let problema = null;
    if (r.error && r.error.code === 'ETIMEDOUT') problema = `no terminó en ${Math.round(plazo / 60000)} min`;
    else if (r.error) problema = `no arrancó (${r.error.code || r.error.message})`;
    else if (r.status !== 0) problema = `salió con ${r.status}`;
    const otras = tocadas(carpeta);
    if (otras.length) {
      // tocó otra ruta: el clon vuelve a como estaba (es el clon del actualizador; .kit-rol queda)
      git(carpeta, ['checkout', '-q', '--', '.']);
      git(carpeta, ['clean', '-fdq', '-e', '.kit-rol']);
      return { ok: false, problema: `tocó otra ruta (${otras[0]})` };
    }
    if (problema) return { ok: false, problema };
    const textos = new Map();
    for (const c of conflictos) {
      const f = path.join(dirF, ...c.rel.split('/'));
      textos.set(c.rel, fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null);
    }
    return { ok: true, textos };
  } finally {
    try { fs.rmSync(dirF, { recursive: true, force: true }); } catch { /* se intenta siempre */ }
    try {
      if (previo !== null) fs.writeFileSync(local, previo);
      else fs.rmSync(local, { force: true });
    } catch { /* idem */ }
  }
}

// ---------------------------------------------------------------- "te espera"

function cerco(t) {
  const m = String(t).match(/`+/g);
  const n = Math.max(3, ...(m || []).map((x) => x.length + 1));
  return '`'.repeat(n);
}
// git diff --no-index de a → b, sin la cabecera de rutas temporales. '' si son iguales.
function diff(a, b, de, a2, tmp) {
  const d = fs.mkdtempSync(path.join(tmp, 'df-'));
  const fa = path.join(d, 'a'), fb = path.join(d, 'b');
  fs.writeFileSync(fa, a === null ? '' : a);
  fs.writeFileSync(fb, b === null ? '' : b);
  const r = git(d, ['-c', 'core.autocrlf=false', 'diff', '--no-index', '--no-color', '-U3', fa, fb]);
  const ls = r.out.replace(/\r\n/g, '\n').split('\n');
  const i = ls.findIndex((l) => l.startsWith('@@'));
  if (i < 0) return '';
  return [`--- ${de}`, `+++ ${a2}`, ...ls.slice(i)].join('\n').replace(/\n*$/, '\n');
}
const bloque = (lang, t) => {
  const c = cerco(t);
  return `${c}${lang}\n${String(t).replace(/\n*$/, '')}\n${c}`;
};

// La pregunta, textual (D6-19): la lee /inicio. Abre "## Las salidas".
const pregunta = (id) => `Actualicé ${id}; acá la tenías distinta así; ¿la mejoramos con esto? Elegí una de estas salidas.`;
// La recomendación, debajo de la pregunta (SPEC-paquete-8r §3, la vara del ADR-030).
const RECOMIENDA = 'La sesión te recomienda una con criterio (la vara: si lo nuevo vale la pena frente a tu porqué) y la decide con vos: nada se elige solo.';
// El comando que escribe la salida elegida (lo corre /inicio, en el checkout del proyecto).
const RESOLVER = 'node "$HOME/.claude/skills/arquitecto-skills/scripts/actualizar.cjs" resolver .';
// La huella de lo tuyo por archivo (r1-2): ficha.hash del texto entero (con la zona), o - si no lo tenés.
const huellaTuya = (p) => (p === null ? '-' : F.hash(p));
// La versión nueva entera de un archivo: el molde nuevo con la zona propia del proyecto puesta. null si el molde no lo trae o la
// zona no entra.
function nuevaEntera(a) {
  if (a.n === null) return null;
  const z = conZona(a.rel, a.n, a.p);
  return z.ok ? z.texto : null;
}
// Los archivos que van al informe: los que el molde cambió, y los "igual" que el proyecto tiene distintos del molde nuevo (tomar la
// nueva también los escribe, r1-4).
const alInforme = (a) => a.tipo !== 'igual' || (nuevaEntera(a) !== null && nuevaEntera(a) !== a.p);
// La base de la pieza que espera: la línea fija `base: <versión>` del informe (antes del primer "## "). → la versión o null.
function baseDeInforme(texto) {
  const ls = String(texto || '').replace(/\r\n/g, '\n').split('\n');
  const fin = ls.findIndex((l) => /^## /.test(l));
  const m = (fin < 0 ? ls : ls.slice(0, fin)).map((l) => /^base: (\S+)$/.exec(l)).find(Boolean);
  return m ? m[1] : null;
}

// El motivo de un informe (la línea "**Por qué no se fusionó sola:**"). → el texto o ''.
function motivoDeInforme(texto) {
  const m = /^- \*\*Por qué no se fusionó sola:\*\* (.*)$/m.exec(lf(String(texto || '')));
  return m ? m[1] : '';
}
// Los pedazos en conflicto de la salida de merge-file (diff3): [{renglon (de lo tuyo), tuyo, viejo, nuevo}], cada lado con su \n.
function pedazos(texto) {
  const out = [];
  let renglon = 1;
  let actual = null;
  let lado = null;
  for (const l of lf(String(texto || '')).split('\n')) {
    if (!actual && /^<{7}(?: |$)/.test(l)) {
      actual = { renglon, tuyo: '', viejo: '', nuevo: '' };
      lado = 'tuyo';
    } else if (actual && /^\|{7}(?: |$)/.test(l)) lado = 'viejo';
    else if (actual && l === '=======') lado = 'nuevo';
    else if (actual && /^>{7}(?: |$)/.test(l)) {
      renglon += actual.tuyo.split('\n').length - 1;
      out.push(actual);
      actual = lado = null;
    } else if (actual) actual[lado] += `${l}\n`;
    else renglon++;
  }
  return out;
}
// "## Dónde chocan" (SPEC-paquete-8r §3): por archivo, los pedazos en conflicto con lo tuyo y lo nuevo, uno al lado del otro.
// [] si ningún archivo choca.
function dondeChocan(archivos) {
  const conf = archivos.filter((a) => (a.tipo === 'tres' && (!a.limpio || a.invalida)) || a.tipo === 'choque');
  if (!conf.length) return [];
  const out = ['', '## Dónde chocan', '', 'Lo que el kit cambió en el mismo lugar que vos (fuera de tu zona propia). En cada pedazo: lo tuyo, lo nuevo del kit y cómo estaba antes (el molde viejo).'];
  for (const a of conf) {
    out.push('', `### \`${a.rel}\``, '');
    if (a.tipo === 'choque') {
      out.push(`No se mezcla renglón por renglón: ${String(a.problema).replace(/^[^:]*: /, '')}.`);
      continue;
    }
    if (a.limpio) {
      out.push(`La mezcla salió sin conflictos pero no pasó el chequeo (${String(a.invalida).replace(/^[^:]*: /, '')}): mirá el cambio del molde y lo tuyo, abajo.`);
      continue;
    }
    const ext = path.extname(a.rel).slice(1);
    const ps = pedazos(a.texto);
    ps.forEach((x, i) => {
      if (i) out.push('');
      out.push(`#### Pedazo ${i + 1} de ${ps.length} (cerca del renglón ${x.renglon} de lo tuyo)`, '');
      out.push('**Lo tuyo:**', '', x.tuyo ? bloque(ext, x.tuyo) : '(nada: lo sacaste)', '');
      out.push('**Lo nuevo del kit:**', '', x.nuevo ? bloque(ext, x.nuevo) : '(nada: el kit lo saca)', '');
      out.push('**Antes (el molde viejo):**', '', x.viejo ? bloque(ext, x.viejo) : '(no estaba)');
    });
  }
  return out;
}

// nota: lo que dice kit/CHANGELOG.md del --kit para las versiones > viejo y ≤ nuevo (lo lee actualizar.cjs), o null.
function informe({ id, versiones, motivo, porque, archivos, tmp, nota = null }) {
  const out = [
    `# Te espera: la pieza \`${id}\` (kit ${versiones.viejo} → ${versiones.nuevo})`,
    '',
    `base: ${versiones.viejo}`,
    ...archivos.map((a) => `tuyo: ${huellaTuya(a.p)} ${a.tipo} ${a.rel}`),
    '',
    '> La dejó el actualizador del kit. La próxima sesión (`/inicio`) elige una de las salidas de abajo o te la pregunta, junto con',
    '> las otras; la escribe `resolver` (el porqué queda en `por:` de la ficha) y este archivo se borra. Si la pieza sigue adaptada',
    '> sin mezclar, la próxima versión se te vuelve a ofrecer. Mientras esté, la pieza no se fusiona sola: la próxima versión lo',
    '> rehace desde la misma base.',
    '',
    `- **Qué pieza es:** \`${id}\` (${archivos.filter((a) => a.p !== null || a.n !== null).map((a) => `\`${a.rel}\``).join(', ') || 'sin archivos'})`,
    `- **Por qué no se fusionó sola:** ${motivo}`,
    `- **Por qué la habías adaptado:** ${porque ? `${porque.texto} (su \`por:\` en la ficha)` : 'ninguno (la pieza no tiene `por:` en la ficha)'}`,
    '- **Qué trae la versión nueva:** lo que dice el kit, acá abajo, y el cambio del molde en cada archivo (molde viejo → molde nuevo).',
    '',
    '## Qué dice el kit',
    '',
    ...(nota ? lf(nota).replace(/\n+$/, '').split('\n').map((l) => (l ? `> ${l}` : '>')) : ['el kit no dejó nota para estas versiones']),
    ...dondeChocan(archivos),
  ];
  for (const a of archivos) {
    if (!alInforme(a)) continue;
    const entera = nuevaEntera(a);
    if (a.tipo === 'igual') {
      out.push('', `## \`${a.rel}\``, '', 'El molde no lo cambió, pero lo tuyo es distinto: solo cambia si tomás la nueva (y ahí lo perdés).');
      out.push('', '### La versión nueva, entera', '', bloque(path.extname(a.rel).slice(1), entera));
      continue;
    }
    out.push('', `## \`${a.rel}\``, '', '### Qué cambió el molde (molde viejo → molde nuevo)', '');
    const dm = diff(a.v, a.n, 'molde viejo', 'molde nuevo', tmp);
    out.push(dm ? bloque('diff', dm) : '(el archivo es nuevo en el molde)');
    out.push('', '### Qué tiene distinto este proyecto (molde viejo → lo tuyo)', '');
    const dp = diff(a.v, a.p, 'molde viejo', 'lo tuyo', tmp);
    out.push(a.p === null ? '(no lo tenés: lo borraste)' : dp ? bloque('diff', dp) : '(igual al molde viejo)');
    out.push('', '### La fusión propuesta', '');
    if (a.tipo === 'molde') out.push('Lo tuyo está igual al molde viejo: va el molde nuevo tal cual (con tu zona propia).');
    else if (a.tipo === 'tres' && a.propuesta) {
      if (a.deClaude) out.push('La armó claude sobre los pedazos que chocan y NO se aplicó: mirala antes de elegir mezclar.', '');
      out.push(bloque(path.extname(a.rel).slice(1), a.propuesta));
    } else if (a.tipo === 'tres' && a.invalida) out.push(`La mezcla salió sin conflictos pero no pasó el chequeo (${a.invalida}): armala con los dos diffs de arriba.`);
    else if (a.tipo === 'tres') out.push(`git merge-file no dio una fusión limpia (${a.conflictos} conflicto(s)): armala con los dos diffs de arriba.`);
    else out.push(`No hay: ${a.problema}.`);
    out.push('', '### La versión nueva, entera', '');
    out.push(entera !== null ? bloque(path.extname(a.rel).slice(1), entera) : a.n === null ? '(el molde ya no lo trae)' : '(no entra tu zona propia: mirá el diff del molde)');
  }
  const sinPropuesta = archivos.filter((a) => (a.tipo === 'tres' && !a.propuesta) || a.tipo === 'choque').map((a) => a.rel);
  const perdes = archivos.filter((a) => alInforme(a) && a.p !== null && a.tipo !== 'molde' && nuevaEntera(a) !== null).map((a) => a.rel);
  const deClaude = archivos.filter((a) => a.deClaude).map((a) => a.rel);
  out.push('', '## Las salidas', '', pregunta(id), '', RECOMIENDA, '');
  out.push(`- **mezclar**: lo tuyo encima de lo nuevo (la fusión propuesta de cada archivo${deClaude.length ? `; la de ${deClaude.join(', ')} la armó claude` : ''})${sinPropuesta.length ? `; falta la de ${sinPropuesta.join(', ')}: armala a mano y corré con --a-mano` : ''}.`);
  out.push(`- **quedarse con la propia**: sigue \`adaptada\`, sin cambios; la próxima versión se te vuelve a ofrecer desde el kit ${versiones.viejo}.`);
  out.push(`- **tomar la nueva del kit**: la versión nueva entera; la pieza pasa a \`molde\` y se actualiza sola de ahí en más. Lo que perdés (lo tuyo fuera de la zona propia): ${perdes.length ? perdes.join(', ') : 'nada'}.`);
  if (esFreno(id)) out.push(`- (congelar no va: \`${id}\` es una pieza de frenos)`);
  else out.push('- **congelar**: `propia`, el kit no la toca más.');
  out.push('', `Con la elegida: \`${RESOLVER} ${id} mezclar|propia|nueva|congelar --por "<por qué>"\`.`);
  return `${out.join('\n')}\n`;
}

// Lo que resolver lee del informe → { base, tuyos: [{rel, hash (null = no lo tenías), tipo}], archivos: Map(rel → {propuesta, nueva}) }.
// Los textos salen de los bloques de "### La fusión propuesta" y "### La versión nueva, entera" (con un fin de línea al final). Las
// RUTAS que valen no salen de acá: resolver las cruza con el catálogo de la pieza (r1-2).
function leerInforme(texto) {
  const ls = lf(String(texto || '')).split('\n');
  const fin = ls.findIndex((l) => /^## /.test(l));
  const tuyos = (fin < 0 ? ls : ls.slice(0, fin)).map((l) => /^tuyo: ([0-9a-f]{12}|-) (igual|molde|tres|choque) (\S+)$/.exec(l)).filter(Boolean)
    .map((m) => ({ rel: m[3], hash: m[1] === '-' ? null : m[1], tipo: m[2] }));
  const archivos = new Map();
  let actual = null;
  let sub = null;
  for (let i = 0; i < ls.length; i++) {
    const l = ls[i];
    const f = /^(`{3,})[^`]*$/.exec(l);
    if (f) {
      // un bloque: hasta su cerco exacto (cerco() lo hace más largo que cualquier tira de ` de adentro)
      let j = i + 1;
      while (j < ls.length && ls[j] !== f[1]) j++;
      if (actual && sub && !(sub in actual)) actual[sub] = `${ls.slice(i + 1, j).join('\n')}\n`;
      i = j;
      continue;
    }
    const m = /^## `([^`]+)`$/.exec(l);
    if (m) {
      actual = {};
      archivos.set(m[1], actual);
      sub = null;
    } else if (/^## /.test(l)) actual = sub = null;
    else if (l === '### La fusión propuesta') sub = 'propuesta';
    else if (l === '### La versión nueva, entera') sub = 'nueva';
    else if (/^### /.test(l)) sub = null;
  }
  return { base: baseDeInforme(texto), tuyos, archivos };
}

// ---------------------------------------------------------------- la pieza entera

// Todo motivo de una mezcla con conflicto empieza así (SPEC-paquete-8r §3, rt-6): el /inicio pregunta siempre por él.
const CHOCO = 'la mezcla chocó';
const PROPUESTA_CLAUDE = `${CHOCO}: la propuesta la armó claude, elegí vos`;

// fusionar(o) → { resultado: 'sin cambios' | 'sola' | 'espera', destinos: Map(rel → texto), motivo, porque, informe }
// o = { carpeta, id, archivos: [{rel, v, n, p}] (textos en LF o null), valorFicha, claude (ruta o null), plan,
//       forzado (un motivo, o {motivo, corto}: corto es el que va entre paréntesis si además la mezcla chocó),
//       versiones: {viejo, nuevo}, plazo, nota (lo que dice kit/CHANGELOG.md de las versiones del medio, o null) }
// Un choque (merge-file con conflictos, un `choque`, lo limpio que no pasa validar) NUNCA se resuelve solo: 'espera', sin destinos.
// Con claude (no en --plan) se lanza igual, también forzado, pero solo para ARMAR la propuesta: su texto validado va al informe.
function fusionar(o) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-fusion-'));
  try {
    const archivos = o.archivos.map((a) => {
      const x = { rel: a.rel, v: lf(a.v), n: lf(a.n), p: lf(a.p) };
      return { ...x, ...clasificar(x, tmp) };
    });
    const destinos = new Map(archivos.filter((a) => a.tipo === 'molde').map((a) => [a.rel, a.destino]));
    if (!archivos.some((a) => a.tipo !== 'igual')) return { resultado: 'sin cambios', destinos: new Map() };
    const tres = archivos.filter((a) => a.tipo === 'tres');
    const choques = archivos.filter((a) => a.tipo === 'choque');
    // la propuesta de merge-file, validada (va al informe y, si todo sale, es la fusión)
    for (const a of tres.filter((x) => x.limpio)) {
      const val = validar(a.rel, a.texto, a.p, tmp);
      if (val.ok) a.propuesta = val.texto;
      else a.invalida = val.problema;
    }
    const fz = !o.forzado ? null : typeof o.forzado === 'string' ? { motivo: o.forzado, corto: o.forzado } : o.forzado;
    const porque = tres.length || choques.length ? porqueDe(o.valorFicha) : null;
    const espera = (motivo) => ({
      resultado: 'espera', destinos: new Map(), motivo, porque,
      informe: informe({ id: o.id, versiones: o.versiones, motivo, porque, archivos, tmp, nota: o.nota }),
    });
    if (!tres.length && !choques.length) {
      if (fz) return espera(fz.motivo);
      return { resultado: 'sola', destinos, porque: { de: 'molde', texto: 'el molde no tocó lo adaptado' } };
    }
    // EL GATE: sin porqué no se fusiona, ni limpio (y no es un choque: falta el porqué antes de mezclar)
    if (!porque) return espera(fz ? fz.motivo : 'sin porqué (la pieza no tiene `por:` en la ficha)');
    const conflictos = tres.filter((a) => !a.limpio);
    const invalida = tres.find((a) => a.invalida);
    if (!choques.length && !invalida && !conflictos.length) {
      if (fz) return espera(fz.motivo);
      for (const a of tres) destinos.set(a.rel, a.propuesta);
      return { resultado: 'sola', destinos, porque };
    }
    // CHOCÓ: nunca se resuelve sola. Lo que se pueda, se deja armado en el informe.
    const por = [];
    if (fz) por.push(fz.corto);
    if (choques.length) por.push(choques[0].problema);
    if (invalida) por.push(`no pasó chequear: ${invalida.invalida}`);
    let deClaude = false;
    if (conflictos.length) {
      if (o.plan) por.push('con --plan no lanzo claude');
      else if (!o.claude) por.push('sin claude: --claude no, o no está en el PATH');
      else {
        const rc = conClaude({ carpeta: o.carpeta, exe: o.claude, id: o.id, versiones: o.versiones, porque: porque.texto, conflictos, plazo: o.plazo });
        if (!rc.ok) por.push(`claude ${rc.problema}`);
        else {
          const vals = conflictos.map((a) => ({ a, val: validar(a.rel, rc.textos.get(a.rel), a.p, tmp) }));
          const mala = vals.find((x) => !x.val.ok);
          if (mala) por.push(`no pasó chequear lo de claude: ${mala.val.problema}`);
          else {
            for (const { a, val } of vals) {
              a.propuesta = val.texto;
              a.deClaude = true;
            }
            deClaude = true;
          }
        }
      }
    }
    const resto = por.length ? ` (${por.join('; ')})` : '';
    return espera(deClaude ? `${PROPUESTA_CLAUDE}${resto}` : `${CHOCO}${resto}`);
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch { /* el temporal */ }
  }
}

// La línea de aplicar para una adaptada: lo que pasó.
function que(r) {
  if (r.resultado === 'sola') return `fusionada (sola, ${corto(r.porque.texto, 50)})`;
  if (r.resultado === 'espera') return `te espera: ${r.motivo}`;
  return 'sin cambios';
}

const rutaInforme = (id) => `${RUTA_FUSIONES}/${id}.md`;

module.exports = {
  fusionar, que, porqueDe, validar, clasificar, mergeFile, vaciarZonas, buscarClaude, lanzador, conClaude, informe, pregunta, baseDeInforme, motivoDeInforme,
  leerInforme, esFreno, huellaTuya, rutaInforme, RUTA_FUSIONES, CARPETA_FUSION, ARGS_CLAUDE, PERMITIDAS, PLAZO_CLAUDE, ADAPTADA, FRENOS,
  SALIDAS, RESOLVER, RECOMIENDA, CHOCO, PROPUESTA_CLAUDE, dondeChocan, pedazos,
};
