#!/usr/bin/env node
'use strict';
// instalar-hooks-pc.cjs — el corrector de secretos de la PC (SPEC-paquete-3, "Instalar hooks por PC"; P4.3, P4.7, P6.6; criterio 11).
//
//   node instalar-hooks-pc.cjs [--home <dir>] [--plan] [--quitar] [--sacar-viejo]
//
// - Copia pc/** (sin *.test.cjs) a <home>/.claude/hooks/kit/ y escribe ahí INSTALADO (versión del kit y sha256 de cada archivo).
// - Registra en <home>/.claude/settings.json, regla por regla: un grupo PreToolUse propio (exec: node + la ruta absoluta en args,
//   timeout 20, onFailure "block"), el UserPromptSubmit (sin onFailure: falla abierto, D-5) y el deny del almacén
//   (Read(//<home>/.config/kit-secretos/**), la forma absoluta que G0 midió en Windows).
// - SPEC-G1-buzon: cuatro eventos y una tabla PIEZAS (qué hook va en qué evento, cada uno en su grupo): secretos.cjs en PreToolUse
//   y UserPromptSubmit; aviso-buzon.cjs en SessionStart, UserPromptSubmit y PostToolUse (timeout 5, sin onFailure: falla abierto).
//   Y la regla allow del buzón (D2: turnos, leer y responder de hooks/kit/buzon/buzon.cjs; PowerShell sin responder), solo si
//   existe <home>/.config/kit-buzon/config.json y el home no tiene espacios; sin config, reinstalar la saca. INSTALADO anota
//   allow-agregado (un INSTALADO de la 3.0.1 no lo trae: si esta corrida la suma, queda "sí" y --quitar la saca).
// - Lo del kit se reconoce por /.claude/hooks/kit/ en el comando; lo demás no se toca. Igual → "sin cambios": no se reescribe nada.
// - JSON inválido, claves duplicadas o una forma que no se entiende → no toca nada y sale 1.
// - Toda escritura: temporal, renombre, relee y compara (si no da igual, sale 1).
// - El anti-secretos viejo (un PreToolUse fuera de hooks/kit/ cuyo archivo trae el prefijo de un token de GitHub): lo deja y avisa;
//   --sacar-viejo saca solo su registro (el archivo queda).
// - --plan no escribe nada: dice qué haría. --quitar deja todo como estaba antes de la primera instalación: si --sacar-viejo
//   había sacado el viejo y su archivo sigue, lo vuelve a registrar donde estaba (rf3-7: quitar no deja la PC sin anti-secretos).
// Sin --home apunta al ~/.claude/ real: las pruebas SIEMPRE pasan uno falso.
//
// Vive en eq/scripts/ y se instala (kit-sync / el Equipador) en ~/.claude/skills/arquitecto-skills/scripts/: solo hace require de
// ../pc/lib/ (que viaja con él) y lee la versión de ../../../VERSION (kit/VERSION en el repo, ~/.claude/VERSION instalado).
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { leerJsonSinDuplicados } = require('../pc/lib/zona-propia.cjs');

const PC = path.resolve(__dirname, '..', 'pc');
const VERSION = path.resolve(__dirname, '..', '..', '..', 'VERSION');
const MARCA_KIT = '/.claude/hooks/kit/';
const MATCHER = 'Bash|PowerShell|Write|Edit|MultiEdit|NotebookEdit';
const VIEJO = 'gh' + 'p_'; // el prefijo que delata al anti-secretos viejo (armado: ninguna forma de clave literal en kit/)
const RE_DENY_KIT = /^Read\(.*\/\.config\/kit-secretos\/\*\*\)$/;
// SPEC-G1-buzon D2: la regla de permiso del buzón, solo para tres verbos (turnos y leer también por PowerShell; responder, solo Bash)
const RE_ALLOW_KIT = /^(Bash|PowerShell)\(node \S+\/\.claude\/hooks\/kit\/buzon\/buzon\.cjs (turnos|leer|responder):\*\)$/;
const VERBOS_BUZON = [['Bash', 'turnos'], ['Bash', 'leer'], ['Bash', 'responder'], ['PowerShell', 'turnos'], ['PowerShell', 'leer']];
// Los cuatro eventos que toca el instalador.
const EVENTOS = ['PreToolUse', 'UserPromptSubmit', 'SessionStart', 'PostToolUse'];

const barras = (p) => String(p).replace(/\\/g, '/');
const esMapa = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const igualJson = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---------------------------------------------------------------- argumentos
function leerArgs(argv) {
  const o = { home: null, plan: false, quitar: false, sacarViejo: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--home') {
      if (!argv[i + 1]) throw new Error('--home sin carpeta');
      o.home = argv[++i];
    } else if (a === '--plan') o.plan = true;
    else if (a === '--quitar') o.quitar = true;
    else if (a === '--sacar-viejo') o.sacarViejo = true;
    else throw new Error(`no conozco "${a}"`);
  }
  if (o.quitar && o.sacarViejo) throw new Error('--quitar y --sacar-viejo no van juntos');
  return o;
}

// ---------------------------------------------------------------- rutas
function rutas(home) {
  const claude = path.join(home, '.claude');
  const kit = path.join(claude, 'hooks', 'kit');
  return {
    home,
    claude,
    kit,
    settings: path.join(claude, 'settings.json'),
    instalado: path.join(kit, 'INSTALADO'),
    antes: path.join(kit, 'settings.antes.json'),
    secretos: barras(path.join(kit, 'secretos.cjs')),
    aviso: barras(path.join(kit, 'aviso-buzon.cjs')),
    configBuzon: path.join(home, '.config', 'kit-buzon', 'config.json'),
  };
}

// Las reglas allow del buzón para este home: node <home>/.claude/hooks/kit/buzon/buzon.cjs <verbo>:* con barras "/" y la unidad como
// la da path.resolve (C:/Users/x). La regla compara el texto literal: buzon.cjs imprime el comando con esta misma ruta, sin comillas.
function reglasBuzon(home) {
  const base = `node ${barras(path.resolve(home)).replace(/\/+$/, '')}/.claude/hooks/kit/buzon/buzon.cjs`;
  return VERBOS_BUZON.map(([h, v]) => `${h}(${base} ${v}:*)`);
}
// ¿La ruta del home se puede escribir sin comillas en un comando? Lista blanca (Windows deja $ ( ) ' & ! en un nombre de usuario).
const homeSinRaros = (home) => /^([A-Za-z]:)?[A-Za-z0-9._/-]+$/.test(barras(path.resolve(home)));

// Read(//c/Users/x/.config/kit-secretos/**) en Windows; Read(//home/x/...) en Unix: "//" = absoluta desde la raíz (G0 midió que anda,
// también sin confianza). No se usa "~" porque con --home la regla tiene que apuntar al home que se instala, no al del proceso.
function denyAlmacen(home) {
  let h = barras(path.resolve(home));
  const m = /^([A-Za-z]):\/?(.*)$/.exec(h);
  if (m) h = `/${m[1].toLowerCase()}/${m[2]}`;
  h = h.replace(/\/+$/, '');
  return `Read(/${h}/.config/kit-secretos/**)`;
}

const hookPre = (r) => ({ type: 'command', command: 'node', args: [r.secretos], timeout: 60, onFailure: 'block' }); // 8d A5.3: secretos.cjs se da 10 s menos
const hookPrompt = (r) => ({ type: 'command', command: 'node', args: [r.secretos], timeout: 20 }); // sin onFailure (D-5)
const hookAviso = (r) => ({ type: 'command', command: 'node', args: [r.aviso], timeout: 5 }); // falla abierto: sin onFailure
const grupoPre = (r) => ({ matcher: MATCHER, hooks: [hookPre(r)] });
const grupoPrompt = (r) => ({ hooks: [hookPrompt(r)] });

// PIEZAS (SPEC-G1-buzon): qué hook del kit va en qué evento, cada uno en su grupo y en este orden. Un hook bajo hooks/kit/ que no
// está acá sobra y se saca.
const PIEZAS = [
  { archivo: 'secretos.cjs', etiqueta: 'el corrector', eventos: { PreToolUse: grupoPre, UserPromptSubmit: grupoPrompt } },
  {
    archivo: 'aviso-buzon.cjs',
    etiqueta: 'el aviso del buzón',
    eventos: {
      SessionStart: (r) => ({ hooks: [hookAviso(r)] }),
      UserPromptSubmit: (r) => ({ hooks: [hookAviso(r)] }),
      PostToolUse: (r) => ({ matcher: MATCHER, hooks: [hookAviso(r)] }),
    },
  },
];
const piezasDe = (evento) => PIEZAS.filter((p) => p.eventos[evento]);

// El texto que identifica a un hook: el comando y sus args.
const textoHook = (h) => barras(`${typeof h.command === 'string' ? h.command : ''} ${Array.isArray(h.args) ? h.args.join(' ') : ''}`);
const esDelKit = (h) => esMapa(h) && textoHook(h).includes(MARCA_KIT);
// El archivo del kit de un hook (lo que viene después de /.claude/hooks/kit/), o null.
function archivoKit(h) {
  if (!esDelKit(h)) return null;
  const m = /\/\.claude\/hooks\/kit\/([^\s"']+)/.exec(textoHook(h));
  return m ? m[1] : null;
}

// ---------------------------------------------------------------- los archivos de pc/
function archivosPc() {
  const out = [];
  (function recorrer(dir, rel) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) recorrer(path.join(dir, e.name), r);
      else if (e.isFile() && !e.name.endsWith('.test.cjs')) out.push(r);
    }
  })(PC, '');
  return out;
}

function leerVersion() {
  try {
    const v = fs.readFileSync(VERSION, 'utf8').trim();
    return v || 'desconocida';
  } catch (e) {
    return 'desconocida';
  }
}

// INSTALADO: cabecera "clave: valor", un renglón en blanco, y "sha256  ruta" por archivo (rutas con /, en orden).
function textoInstalado(version, previo, hashes) {
  const cab = [`kit: ${version}`, `settings-previo: ${previo.existia ? 'existía' : 'no existía'}`, `deny-agregado: ${previo.denyAgregado ? 'sí' : 'no'}`, `allow-agregado: ${previo.allowAgregado ? 'sí' : 'no'}`, `carpetas-creadas: ${previo.creadas.length ? previo.creadas.join(' ') : '-'}`];
  return `${cab.join('\n')}\n\n${hashes.map(([rel, h]) => `${h}  ${rel}`).join('\n')}\n`;
}
function leerInstalado(r) {
  let t;
  try {
    t = fs.readFileSync(r.instalado, 'utf8');
  } catch (e) {
    return null;
  }
  const cab = {};
  const archivos = [];
  for (const l of t.split('\n')) {
    let m;
    if ((m = /^([a-z-]+): (.*)$/.exec(l))) cab[m[1]] = m[2];
    else if ((m = /^([0-9a-f]{64}) {2}(.+)$/.exec(l))) archivos.push(m[2]);
  }
  const creadas = (cab['carpetas-creadas'] || '-').split(' ').filter((x) => x === '.claude' || x === '.claude/hooks');
  // allow-agregado falta en un INSTALADO de la v3.0.1: vale "no" y, si esta corrida suma la regla, queda "sí" (red team 13)
  return { existia: cab['settings-previo'] !== 'no existía', denyAgregado: cab['deny-agregado'] === 'sí', allowAgregado: cab['allow-agregado'] === 'sí', creadas, archivos };
}

// ---------------------------------------------------------------- escritura: temporal, renombre, relee y compara
function escribir(ruta, contenido) {
  const buf = Buffer.isBuffer(contenido) ? contenido : Buffer.from(contenido, 'utf8');
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  const tmp = `${ruta}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, buf);
  fs.renameSync(tmp, ruta);
  if (!fs.readFileSync(ruta).equals(buf)) throw new Error(`releí ${ruta} y no es lo que escribí`);
}

// ---------------------------------------------------------------- settings
// { existe, texto, valor } o { problema } (no toca).
function leerSettings(r) {
  let texto;
  try {
    texto = fs.readFileSync(r.settings, 'utf8');
  } catch (e) {
    if (e.code === 'ENOENT') return { existe: false, texto: null, valor: {} };
    return { problema: `no pude leer ${r.settings} (${e.code || e.message})` };
  }
  const l = leerJsonSinDuplicados(texto);
  if (!l.ok) return { problema: `${r.settings}: ${l.problema}` };
  const v = l.valor;
  if (!esMapa(v)) return { problema: `${r.settings}: no es un objeto { … } — así no se toca` };
  if ('hooks' in v) {
    if (!esMapa(v.hooks)) return { problema: `${r.settings}: "hooks" no es un objeto — así no se toca` };
    for (const ev of EVENTOS) {
      if (ev in v.hooks && !Array.isArray(v.hooks[ev])) return { problema: `${r.settings}: "hooks.${ev}" no es una lista — así no se toca` };
    }
  }
  if ('permissions' in v) {
    if (!esMapa(v.permissions)) return { problema: `${r.settings}: "permissions" no es un objeto — así no se toca` };
    for (const k of ['deny', 'allow']) {
      if (k in v.permissions && !(Array.isArray(v.permissions[k]) && v.permissions[k].every((x) => typeof x === 'string'))) {
        return { problema: `${r.settings}: "permissions.${k}" no es una lista de textos — así no se toca` };
      }
    }
  }
  return { existe: true, texto, valor: v };
}

// El formato del archivo para reescribirlo parecido: sangría, fin de renglón, BOM, salto final.
function formato(texto) {
  if (texto == null) return { sangria: 2, eol: '\n', bom: '', final: true };
  const m = /\n([ \t]+)\S/.exec(texto);
  return { sangria: m ? m[1] : 2, eol: texto.includes('\r\n') ? '\r\n' : '\n', bom: texto.startsWith('﻿') ? '﻿' : '', final: /\n$/.test(texto) };
}
function serializar(valor, f) {
  let t = JSON.stringify(valor, null, f.sangria);
  if (f.eol !== '\n') t = t.replace(/\n/g, f.eol);
  return f.bom + t + (f.final ? f.eol : '');
}

// Saca de un evento los hooks que cumplen `cual`; un grupo que queda sin hooks por eso se va. Devuelve cuántos sacó y dónde estaba
// el primer grupo tocado (para volver a poner el del kit en el mismo lugar).
function sacarHooks(lista, cual) {
  let sacados = 0;
  let lugar = -1;
  for (let i = 0; i < lista.length; i++) {
    const g = lista[i];
    if (!esMapa(g) || !Array.isArray(g.hooks)) continue;
    const quedan = g.hooks.filter((h) => !cual(h));
    if (quedan.length === g.hooks.length) continue;
    sacados += g.hooks.length - quedan.length;
    if (lugar < 0) lugar = i;
    if (quedan.length) g.hooks = quedan;
    else {
      lista.splice(i, 1);
      i--;
    }
  }
  return { sacados, lugar };
}

// Deja en el evento exactamente los grupos del kit de `grupos` (uno por pieza, en ese orden), juntos en el lugar del primer hook del
// kit que había (o al final). Lo del kit se reconoce por la ruta (/.claude/hooks/kit/<archivo>): un hook de una pieza que no va en
// este evento, o de un archivo que no está en PIEZAS, se saca. 'sin cambios' | 'agregado' | 'actualizado'.
function ponerEvento(v, evento, grupos) {
  const lista = v.hooks[evento];
  const delKit = lista.filter((g) => esMapa(g) && Array.isArray(g.hooks) && g.hooks.some(esDelKit));
  if (delKit.length === grupos.length && delKit.every((g, i) => igualJson(g, grupos[i]))) return 'sin cambios';
  const { sacados, lugar } = sacarHooks(lista, esDelKit);
  lista.splice(lugar < 0 || lugar > lista.length ? lista.length : lugar, 0, ...grupos);
  return sacados ? 'actualizado' : 'agregado';
}

// La regla allow del buzón: exactamente `esperadas` (puede ser []), juntas en el lugar de la primera del kit (o al final).
// 'sin cambios' | 'agregado' | 'actualizado' | 'sacado'.
function ponerAllow(v, esperadas) {
  const actual = Array.isArray(v.permissions.allow) ? v.permissions.allow : [];
  const delKit = actual.filter((x) => RE_ALLOW_KIT.test(x));
  if (igualJson(delKit, esperadas)) return 'sin cambios';
  const i = actual.findIndex((x) => RE_ALLOW_KIT.test(x));
  const resto = actual.filter((x) => !RE_ALLOW_KIT.test(x));
  resto.splice(i < 0 ? resto.length : i, 0, ...esperadas);
  v.permissions.allow = resto;
  if (!esperadas.length) return 'sacado';
  return delKit.length ? 'actualizado' : 'agregado';
}

// Los PreToolUse ajenos cuyo archivo trae el prefijo del token: el anti-secretos viejo. [{ hook, archivo }]
function viejos(v, r) {
  const out = [];
  const lista = esMapa(v.hooks) && Array.isArray(v.hooks.PreToolUse) ? v.hooks.PreToolUse : [];
  for (const g of lista) {
    if (!esMapa(g) || !Array.isArray(g.hooks)) continue;
    for (const h of g.hooks) {
      if (!esMapa(h) || esDelKit(h)) continue;
      const archivo = archivoDe(h, r);
      if (archivo) out.push({ hook: h, archivo });
    }
  }
  return out;
}
function archivoDe(h, r) {
  const piezas = [...(typeof h.command === 'string' ? h.command.match(/"[^"]*"|'[^']*'|\S+/g) || [] : []), ...(Array.isArray(h.args) ? h.args : [])];
  for (let p of piezas) {
    p = String(p).replace(/^["']|["']$/g, '');
    p = p.replace(/^~(?=[\/\\]|$)/, r.home).replace(/^(\$HOME|\$\{HOME\}|%USERPROFILE%|\$env:USERPROFILE)(?=[\/\\]|$)/i, r.home);
    if (!/[\/\\]/.test(p)) continue;
    try {
      const st = fs.statSync(p);
      if (!st.isFile() || st.size > 5 * 1024 * 1024) continue;
      if (fs.readFileSync(p, 'latin1').includes(VIEJO)) return p;
    } catch (e) {
      /* no es un archivo: sigue */
    }
  }
  return null;
}

// Saca lo del kit del valor (los cuatro eventos, el deny y la regla del buzón); los contenedores que quedan vacíos por eso se van.
function sinElKit(v, previo) {
  const c = JSON.parse(JSON.stringify(v));
  if (esMapa(c.hooks)) {
    for (const ev of EVENTOS) {
      if (!Array.isArray(c.hooks[ev])) continue;
      const { sacados } = sacarHooks(c.hooks[ev], esDelKit);
      if (sacados && !c.hooks[ev].length) delete c.hooks[ev];
    }
  }
  // la regla del buzón se saca siempre: autoriza un archivo de hooks/kit/, que --quitar borra (red team de la construcción, 5)
  for (const [k, re, agregado] of [['deny', RE_DENY_KIT, previo.denyAgregado], ['allow', RE_ALLOW_KIT, true]]) {
    if (!agregado || !esMapa(c.permissions) || !Array.isArray(c.permissions[k])) continue;
    const antes = c.permissions[k].length;
    c.permissions[k] = c.permissions[k].filter((x) => !re.test(x));
    if (antes !== c.permissions[k].length && !c.permissions[k].length) {
      delete c.permissions[k];
      if (!Object.keys(c.permissions).length) delete c.permissions;
    }
  }
  if (esMapa(c.hooks) && !Object.keys(c.hooks).length && esMapa(v.hooks) && Object.keys(v.hooks).length) delete c.hooks;
  return c;
}

// Para comparar "¿quedó como antes?" sin que un contenedor vacío (hooks: {}, deny: []) haga diferencia.
function podar(v) {
  const c = JSON.parse(JSON.stringify(v));
  if (esMapa(c.hooks)) {
    for (const ev of Object.keys(c.hooks)) if (Array.isArray(c.hooks[ev]) && !c.hooks[ev].length) delete c.hooks[ev];
    if (!Object.keys(c.hooks).length) delete c.hooks;
  }
  if (esMapa(c.permissions)) {
    for (const k of ['deny', 'allow']) if (Array.isArray(c.permissions[k]) && !c.permissions[k].length) delete c.permissions[k];
    if (!Object.keys(c.permissions).length) delete c.permissions;
  }
  return c;
}

// ---------------------------------------------------------------- instalar
function planInstalar(r, s, o) {
  const acciones = [];
  const avisos = [];
  const anterior = leerInstalado(r);
  // la primera instalación anota cómo estaba el settings (y guarda su texto para que --quitar lo deje byte a byte)
  const previo = anterior || { existia: s.existe, denyAgregado: false, allowAgregado: false, creadas: ['.claude', '.claude/hooks'].filter((c) => !fs.existsSync(path.join(r.home, c))), archivos: [] };

  // 1. archivos
  const lista = archivosPc();
  const archivos = [];
  for (const rel of lista) {
    const buf = fs.readFileSync(path.join(PC, rel));
    const destino = path.join(r.kit, rel);
    let actual = null;
    try {
      actual = fs.readFileSync(destino);
    } catch (e) {
      /* no está */
    }
    archivos.push({ rel, buf, destino, cambia: !(actual && actual.equals(buf)), nuevo: !actual });
  }
  const sobran = previo.archivos.filter((rel) => !lista.includes(rel) && fs.existsSync(path.join(r.kit, rel)));

  // 2. settings, regla por regla
  const v = JSON.parse(JSON.stringify(s.valor));
  if (!esMapa(v.hooks)) v.hooks = {};
  for (const ev of EVENTOS) if (!Array.isArray(v.hooks[ev])) v.hooks[ev] = [];
  const reglas = {};
  for (const ev of EVENTOS) reglas[ev] = ponerEvento(v, ev, piezasDe(ev).map((p) => p.eventos[ev](r)));
  if (!esMapa(v.permissions)) v.permissions = {};
  // la regla del buzón (D2): solo con config.json, con buzon.cjs en lo que se instala (red team de la construcción, 11: una regla
  // hacia un archivo que no está no se pone) y con un home que la shell no interpreta (solo letras, números y . _ / -; red team, 8).
  // Si falta algo, se saca: así se apaga el buzón de una PC.
  const hayBuzon = fs.existsSync(r.configBuzon);
  const traeBuzon = lista.includes('buzon/buzon.cjs');
  const homeLimpio = homeSinRaros(r.home);
  let porQue = 'no hay ~/.config/kit-buzon/config.json en esta PC';
  if (hayBuzon && !traeBuzon) {
    porQue = 'este kit todavía no trae buzon.cjs';
    avisos.push(`ℹ️ hay config del buzón pero ${porQue}: no pongo la regla (vuelve a ponerse al instalar un kit que lo traiga)`);
  } else if (hayBuzon && !homeLimpio) {
    porQue = 'la ruta del home tiene espacios u otros caracteres que la shell interpreta';
    avisos.push(`⚠️ ${porQue}: no pongo la regla del buzón (Claude Code compara el texto literal del comando). Contestar solo va a pedir permiso en esta PC`);
  }
  const reglaBuzon = ponerAllow(v, hayBuzon && traeBuzon && homeLimpio ? reglasBuzon(r.home) : []);
  if (reglaBuzon === 'agregado' || reglaBuzon === 'actualizado') previo.allowAgregado = true;
  if (Array.isArray(v.permissions.allow) && !v.permissions.allow.length && !(esMapa(s.valor.permissions) && 'allow' in s.valor.permissions)) delete v.permissions.allow;
  if (!Array.isArray(v.permissions.deny)) v.permissions.deny = [];
  const deny = denyAlmacen(r.home);
  const denyKit = v.permissions.deny.filter((x) => RE_DENY_KIT.test(x));
  if (denyKit.length === 1 && denyKit[0] === deny) reglas.deny = 'sin cambios';
  else if (!denyKit.length) {
    v.permissions.deny.push(deny);
    reglas.deny = 'agregado';
    if (!anterior) previo.denyAgregado = true;
  } else {
    const i = v.permissions.deny.findIndex((x) => RE_DENY_KIT.test(x));
    v.permissions.deny = v.permissions.deny.filter((x) => !RE_DENY_KIT.test(x));
    v.permissions.deny.splice(i, 0, deny);
    reglas.deny = 'actualizado';
  }
  if (anterior && reglas.deny === 'agregado') previo.denyAgregado = true;

  // 3. el viejo
  const vs = viejos(v, r);
  let sacadosViejo = 0;
  if (o.sacarViejo && vs.length) {
    const quitar = new Set(vs.map((x) => x.hook));
    const res = sacarHooks(v.hooks.PreToolUse, (h) => quitar.has(h));
    sacadosViejo = res.sacados;
  }
  for (const x of vs) {
    if (o.sacarViejo) acciones.push(`saco el registro del anti-secretos viejo (${barras(x.archivo)}; el archivo queda)`);
    else avisos.push(`⚠️ anti-secretos viejo registrado (${barras(x.archivo)}): lo dejo. Demora cada Bash; cuando confirmes que el del kit anda, corré con --sacar-viejo`);
  }
  // no dejar contenedores vacíos que no estaban
  for (const ev of EVENTOS) if (!v.hooks[ev].length && !(esMapa(s.valor.hooks) && ev in s.valor.hooks)) delete v.hooks[ev];

  const f = formato(s.texto);
  const nuevoTexto = igualJson(v, s.valor) && s.existe ? s.texto : serializar(v, f);
  const settingsCambia = !s.existe || nuevoTexto !== s.texto;

  for (const a of archivos) if (a.cambia) acciones.push(`${a.nuevo ? 'copio' : 'actualizo'} hooks/kit/${a.rel}`);
  for (const rel of sobran) acciones.push(`borro hooks/kit/${rel} (ya no viene en el kit)`);
  for (const [k, e] of Object.entries(reglas)) {
    if (e === 'sin cambios') continue;
    const que = k === 'deny' ? `el deny ${deny}` : `el ${k} (${piezasDe(k).map((p) => p.etiqueta).join(' y ')})`;
    acciones.push(`${e === 'agregado' ? 'registro' : 'actualizo'} ${que}`);
  }
  if (reglaBuzon === 'sacado') acciones.push(`saco la regla del buzón (${porQue})`);
  else if (reglaBuzon !== 'sin cambios') acciones.push(`${reglaBuzon === 'agregado' ? 'registro' : 'actualizo'} la regla del buzón (allow para turnos, leer y responder de hooks/kit/buzon/buzon.cjs)`);

  const hashes = archivos.map((a) => [a.rel, sha(a.buf)]);
  const instalado = textoInstalado(leerVersion(), previo, hashes);
  let instActual = null;
  try {
    instActual = fs.readFileSync(r.instalado, 'utf8');
  } catch (e) {
    /* no está */
  }
  const instCambia = instActual !== instalado;
  if (instCambia) acciones.push(`escribo hooks/kit/INSTALADO (kit ${leerVersion()}, ${hashes.length} archivos)`);
  const guardarAntes = !anterior && s.existe && !fs.existsSync(r.antes);
  if (settingsCambia) acciones.push(`${s.existe ? 'actualizo' : 'creo'} ${barras(r.settings)}`);
  return { acciones, avisos, archivos, sobran, instalado, instCambia, nuevoTexto, settingsCambia, guardarAntes, sacadosViejo, reglas };
}

function aplicarInstalar(r, s, p) {
  if (p.guardarAntes) escribir(r.antes, s.texto); // primero: si algo falla después, --quitar igual sabe cómo estaba
  for (const a of p.archivos) if (a.cambia) escribir(a.destino, a.buf);
  for (const rel of p.sobran) fs.rmSync(path.join(r.kit, rel), { force: true });
  if (p.instCambia) escribir(r.instalado, p.instalado);
  if (p.settingsCambia) escribir(r.settings, p.nuevoTexto);
}

// ---------------------------------------------------------------- quitar
function planQuitar(r, s) {
  const acciones = [];
  const anterior = leerInstalado(r);
  const previo = anterior || { existia: true, denyAgregado: true, allowAgregado: true, creadas: [], archivos: [] }; // sin INSTALADO: igual saca lo del kit
  const limpio = sinElKit(s.valor, previo);
  let antesTexto = null;
  try {
    antesTexto = fs.readFileSync(r.antes, 'utf8');
  } catch (e) {
    /* no hay copia */
  }
  let accionSettings = null;
  let nuevoTexto = null;
  if (s.existe) {
    const antes = antesTexto != null ? leerJsonSinDuplicados(antesTexto) : null;
    // rf3-7: si antes de instalar estaba registrado el anti-secretos viejo y ya no (--sacar-viejo), se repone: quitar el
    // corrector no puede dejar la PC sin ninguno. Solo si su archivo sigue ahí (viejos() lo lee).
    if (antes && antes.ok) for (const x of reponerViejos(limpio, antes.valor, r)) acciones.push(`repongo el registro del anti-secretos viejo (${barras(x)}): estaba antes de instalar`);
    if (antes && antes.ok && igualJson(podar(limpio), podar(antes.valor))) {
      nuevoTexto = antesTexto; // nada ajeno cambió desde que se instaló: vuelve byte a byte
    } else if (!previo.existia && igualJson(podar(limpio), {})) {
      accionSettings = 'borrar';
    } else if (!igualJson(limpio, s.valor)) {
      nuevoTexto = serializar(limpio, formato(s.texto));
    }
    if (nuevoTexto === s.texto) nuevoTexto = null;
    if (accionSettings === 'borrar') acciones.push(`borro ${barras(r.settings)} (no existía antes de instalar y no quedó nada más)`);
    else if (nuevoTexto != null) acciones.push(`saco del ${barras(r.settings)} los registros del kit`);
  }
  const hayCarpeta = fs.existsSync(r.kit);
  if (hayCarpeta) acciones.push(`borro ${barras(r.kit)}/`);
  // las carpetas que creó la instalación, si quedan vacías, se van (de la más honda a la más alta)
  const creadas = previo.creadas.slice().sort().reverse().map((c) => path.join(r.home, c));
  return { acciones, avisos: [], accionSettings, nuevoTexto, hayCarpeta, creadas };
}
// Los hooks del anti-secretos viejo que están en `antes` y faltan en `limpio` vuelven a su lugar (cambia `limpio`): adentro de su
// grupo si lo que quedó de él sigue (mismo matcher y sus otros hooks), si no, su grupo entero en la posición que tenía. → [archivo]
function reponerViejos(limpio, antes, r) {
  const repuestos = [];
  const listaAntes = esMapa(antes.hooks) && Array.isArray(antes.hooks.PreToolUse) ? antes.hooks.PreToolUse : [];
  const presente = (h) => {
    const l = esMapa(limpio.hooks) && Array.isArray(limpio.hooks.PreToolUse) ? limpio.hooks.PreToolUse : [];
    return l.some((g) => esMapa(g) && Array.isArray(g.hooks) && g.hooks.some((x) => igualJson(x, h)));
  };
  for (const { hook, archivo } of viejos(antes, r)) {
    if (presente(hook)) continue;
    const gi = listaAntes.findIndex((g) => esMapa(g) && Array.isArray(g.hooks) && g.hooks.includes(hook));
    if (gi < 0) continue;
    const gAntes = listaAntes[gi];
    if (!esMapa(limpio.hooks)) limpio.hooks = {};
    if (!Array.isArray(limpio.hooks.PreToolUse)) limpio.hooks.PreToolUse = [];
    const lista = limpio.hooks.PreToolUse;
    const otros = gAntes.hooks.filter((x) => x !== hook);
    const resto = otros.length
      ? lista.find((g) => esMapa(g) && Array.isArray(g.hooks) && g.matcher === gAntes.matcher && g.hooks.length && g.hooks.every((x) => otros.some((o) => igualJson(o, x))))
      : null;
    if (resto) {
      const hi = gAntes.hooks.indexOf(hook);
      resto.hooks.splice(Math.min(hi, resto.hooks.length), 0, JSON.parse(JSON.stringify(hook)));
    } else {
      const g = JSON.parse(JSON.stringify(gAntes));
      g.hooks = [JSON.parse(JSON.stringify(hook))];
      lista.splice(Math.min(gi, lista.length), 0, g);
    }
    repuestos.push(archivo);
  }
  return repuestos;
}

function aplicarQuitar(r, s, p) {
  if (p.accionSettings === 'borrar') fs.rmSync(r.settings);
  else if (p.nuevoTexto != null) escribir(r.settings, p.nuevoTexto);
  if (p.hayCarpeta) fs.rmSync(r.kit, { recursive: true, force: true });
  for (const c of p.creadas) {
    try {
      if (!fs.readdirSync(c).length) fs.rmdirSync(c);
    } catch (e) {
      /* ya no está o no se puede: queda */
    }
  }
}

// ---------------------------------------------------------------- principal
function principal(argv, salida) {
  const log = (t) => salida.push(t);
  let o;
  try {
    o = leerArgs(argv);
  } catch (e) {
    log(`uso: instalar-hooks-pc.cjs [--home <dir>] [--plan] [--quitar] [--sacar-viejo] — ${e.message}`);
    return 2;
  }
  const r = rutas(path.resolve(o.home || os.homedir()));
  log(`instalar-hooks-pc · ${o.quitar ? 'quitar' : 'instalar'}${o.plan ? ' (plan: no escribo nada)' : ''} · ${barras(r.claude)}`);
  const s = leerSettings(r);
  if (s.problema) {
    log(`✗ ${s.problema}`);
    log('no toqué nada.');
    return 1;
  }
  let p;
  try {
    p = o.quitar ? planQuitar(r, s) : planInstalar(r, s, o);
  } catch (e) {
    log(`✗ no pude armar el plan: ${e.message} — no toqué nada.`);
    return 1;
  }
  for (const a of p.avisos) log(a);
  if (!p.acciones.length) {
    log('sin cambios.');
    return 0;
  }
  for (const a of p.acciones) log(`${o.plan ? '· haría: ' : '· '}${a}`);
  if (o.plan) {
    log('plan: no escribí nada. Sin --plan, lo aplico.');
    return 0;
  }
  try {
    if (o.quitar) aplicarQuitar(r, s, p);
    else aplicarInstalar(r, s, p);
  } catch (e) {
    log(`✗ ${e.message}`);
    return 1;
  }
  log(o.quitar ? 'listo: quité el corrector de la PC. Reiniciá Claude Code.' : 'listo. Reiniciá Claude Code y corré doctor.');
  return 0;
}

if (require.main === module) {
  const salida = [];
  const codigo = principal(process.argv.slice(2), salida);
  process.stdout.write(`${salida.join('\n')}\n`);
  process.exitCode = codigo;
}

// leerSettings, planInstalar, aplicarInstalar, formato y serializar: los usa preparar-pc.cjs (SPEC-paquete-6, P2.2 paso 3) para armar
// el plan de los hooks por PC sin duplicar la lógica y escribir el settings.json una sola vez (r1-12). Exportarlos no cambia nada acá.
module.exports = { principal, denyAlmacen, esDelKit, archivoKit, rutas, MATCHER, VERSION, PC, leerSettings, planInstalar, aplicarInstalar, formato, serializar, hookPre, hookPrompt, hookAviso, PIEZAS, EVENTOS, reglasBuzon, homeSinRaros, RE_ALLOW_KIT };
