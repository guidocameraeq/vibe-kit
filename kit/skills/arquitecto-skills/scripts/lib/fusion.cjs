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
// `por:` de la pieza en la ficha, o los asuntos de los commits que MODIFICARON sus archivos y no son del actualizador (autor
// kit-actualizador o asunto "kit …"); el commit que los creó no cuenta (--diff-filter=M: nacer del molde no es adaptar).
//   - sin porqué → "te espera" (no se fusiona aunque salga limpio: lo decide el dueño);
//   - con porqué y merge-file limpio → esa es la fusión; con conflictos → un `claude -p` en el clon, que resuelve sobre una copia en
//     .kit-fusion/<archivo> (acceptEdits, --allowedTools Read y Edit de .kit-fusion/**, las mismas allow en .claude/settings.local.json
//     del clon, deny Bash; nunca el modo que saltea permisos). Sin claude, si falla, si se pasa de 5 min o si toca otra ruta → "te espera".
// Todo lo que sale (limpio o de claude) se valida: sin marcadores de conflicto, la zona propia intacta y los .js/.cjs/.mjs con
// node --check; si no → "te espera". "Te espera" = .claude/fusiones/<pieza>.md (viaja en el commit del kit): el motivo, los dos
// diffs por archivo (molde viejo → nuevo; molde viejo → lo del proyecto), la fusión propuesta si merge-file dio una, y la pregunta.
// La pieza queda como estaba. /inicio la ofrece en una sola pregunta; con la respuesta, `por:` queda en la ficha.
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

// → {de: 'ficha' | 'git', texto} o null. valorFicha = el valor de la pieza en la ficha; rutas = las del proyecto.
function porqueDe(carpeta, valorFicha, rutas) {
  if (valorFicha && typeof valorFicha === 'object' && typeof valorFicha.por === 'string' && valorFicha.por.trim()) {
    return { de: 'ficha', texto: valorFicha.por.trim() };
  }
  if (!rutas.length) return null;
  const r = git(carpeta, ['log', '--no-renames', '--diff-filter=M', '--format=%an%x1f%s%x1e', '--', ...rutas]);
  if (!r.ok) return null;
  const asuntos = r.out.split('\x1e').map((x) => x.trim()).filter(Boolean).map((x) => x.split('\x1f'))
    .filter(([autor, asunto]) => autor !== 'kit-actualizador' && !/^kit /.test(asunto || '')).map(([, asunto]) => (asunto || '').trim()).filter(Boolean);
  return asuntos.length ? { de: 'git', texto: [...new Set(asuntos)].join('; ') } : null;
}

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

// La pregunta, textual (D6-19): la lee /inicio.
const pregunta = (id) => `Actualicé ${id}; acá la tenías distinta así; ¿la mejoramos con esto?`;

function informe({ id, versiones, motivo, porque, archivos, tmp }) {
  const out = [
    `# Te espera: la pieza \`${id}\` (kit ${versiones.viejo} → ${versiones.nuevo})`,
    '',
    '> La dejó el actualizador del kit. La próxima sesión (`/inicio`) te lo pregunta una vez, junto con las otras; con tu respuesta',
    '> se aplica (o la pieza pasa a `propia`), el porqué queda en `por:` de la ficha y este archivo se borra.',
    '',
    `- **Por qué no se fusionó sola:** ${motivo}`,
    `- **El porqué que encontré:** ${porque ? `${porque.texto} (${porque.de === 'ficha' ? 'la ficha' : 'el git log'})` : 'ninguno (ni `por:` en la ficha ni un commit que la haya cambiado)'}`,
    '',
    '## La pregunta',
    '',
    pregunta(id),
  ];
  for (const a of archivos) {
    if (a.tipo === 'igual') continue;
    out.push('', `## \`${a.rel}\``, '', '### Qué cambió el molde (molde viejo → molde nuevo)', '');
    const dm = diff(a.v, a.n, 'molde viejo', 'molde nuevo', tmp);
    out.push(dm ? bloque('diff', dm) : '(el archivo es nuevo en el molde)');
    out.push('', '### Qué tiene distinto este proyecto (molde viejo → lo tuyo)', '');
    const dp = diff(a.v, a.p, 'molde viejo', 'lo tuyo', tmp);
    out.push(a.p === null ? '(no lo tenés: lo borraste)' : dp ? bloque('diff', dp) : '(igual al molde viejo)');
    out.push('', '### La fusión propuesta', '');
    if (a.tipo === 'molde') out.push('Lo tuyo está igual al molde viejo: va el molde nuevo tal cual (con tu zona propia).');
    else if (a.tipo === 'tres' && a.propuesta) out.push(bloque(path.extname(a.rel).slice(1), a.propuesta));
    else if (a.tipo === 'tres') out.push(`git merge-file no dio una fusión limpia (${a.conflictos} conflicto(s)): armala con los dos diffs de arriba.`);
    else out.push(`No hay: ${a.problema}.`);
  }
  return `${out.join('\n')}\n`;
}

// ---------------------------------------------------------------- la pieza entera

// fusionar(o) → { resultado: 'sin cambios' | 'sola' | 'claude' | 'espera', destinos: Map(rel → texto), motivo, porque, informe }
// o = { carpeta, id, archivos: [{rel, v, n, p}] (textos en LF o null), valorFicha, claude (ruta o null), plan, forzado (motivo),
//       versiones: {viejo, nuevo}, plazo }
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
    const porque = tres.length || choques.length ? porqueDe(o.carpeta, o.valorFicha, archivos.map((a) => a.rel)) : null;
    const espera = (motivo) => ({
      resultado: 'espera', destinos: new Map(), motivo, porque,
      informe: informe({ id: o.id, versiones: o.versiones, motivo, porque, archivos, tmp }),
    });
    if (o.forzado) return espera(o.forzado);
    if (!tres.length && !choques.length) return { resultado: 'sola', destinos, porque: { de: 'molde', texto: 'el molde no tocó lo adaptado' } };
    // EL GATE: sin porqué no se fusiona, ni limpio
    if (!porque) return espera('sin porqué (ni `por:` en la ficha ni un commit tuyo que la haya cambiado)');
    if (choques.length) return espera(`conflicto sin resolver (${choques[0].problema})`);
    const invalida = tres.find((a) => a.invalida);
    if (invalida) return espera(`no pasó chequear (${invalida.invalida})`);
    for (const a of tres.filter((x) => x.limpio)) destinos.set(a.rel, a.propuesta);
    const conflictos = tres.filter((a) => !a.limpio);
    if (!conflictos.length) return { resultado: 'sola', destinos, porque };
    if (o.plan) return espera('conflicto sin resolver (con --plan no lanzo claude)');
    if (!o.claude) return espera('conflicto sin resolver (sin claude: --claude no, o no está en el PATH)');
    const rc = conClaude({ carpeta: o.carpeta, exe: o.claude, id: o.id, versiones: o.versiones, porque: porque.texto, conflictos, plazo: o.plazo });
    if (!rc.ok) return espera(`conflicto sin resolver (claude ${rc.problema})`);
    for (const a of conflictos) {
      const val = validar(a.rel, rc.textos.get(a.rel), a.p, tmp);
      if (!val.ok) return espera(`no pasó chequear (lo de claude: ${val.problema})`);
      destinos.set(a.rel, val.texto);
    }
    return { resultado: 'claude', destinos, porque };
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch { /* el temporal */ }
  }
}

// La línea de aplicar para una adaptada: lo que pasó.
function que(r) {
  if (r.resultado === 'sola') return `fusionada (sola, ${corto(r.porque.texto, 50)})`;
  if (r.resultado === 'claude') return 'fusionada (claude)';
  if (r.resultado === 'espera') return `te espera: ${r.motivo}`;
  return 'sin cambios';
}

const rutaInforme = (id) => `${RUTA_FUSIONES}/${id}.md`;

module.exports = {
  fusionar, que, porqueDe, validar, clasificar, mergeFile, vaciarZonas, buscarClaude, lanzador, conClaude, informe, pregunta,
  rutaInforme, RUTA_FUSIONES, CARPETA_FUSION, ARGS_CLAUDE, PERMITIDAS, PLAZO_CLAUDE, ADAPTADA,
};
