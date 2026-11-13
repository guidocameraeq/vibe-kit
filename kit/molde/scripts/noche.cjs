'use strict';
// noche.cjs — "me voy", el checklist de la noche y la noche que termina sola (SPEC-0 RF-11 y P6.4; delta 5 crit. 16, D5-12, D5-16;
// D §9.3-§9.5; SPEC-paquete-8d B3 y B4.4). Uso, desde el repo:
//   node .claude/scripts/noche.cjs me-voy [--hasta HH:MM]
//   node .claude/scripts/noche.cjs volvi
//   node .claude/scripts/noche.cjs cierre|cierre-empieza|publicar|subir|parte <x>   (ver el USO)
// `me-voy` corre en el worktree del director (rama modulo/<x>): escribe la marca .kit-noche en su raíz (desde ese momento los hooks,
// el pre-commit, `db migrar` y `verificar` tratan como nocturno al director y a sus obreros: contexto.deNoche) e imprime el checklist
// armado por script, sin preguntar nada: encargos abiertos y su obrero, cuáles no abre el director (esos paran de noche), la red, lo
// que vence y el relevo antes de cada espera larga. `volvi` borra la marca de este checkout y de todos los worktrees del repo (lo
// llaman /inicio y /estado del dueño SIEMPRE, en el principal: la marca vive en el worktree del director; sin marca dice "ya era de
// día" y sale 0). `--hasta` es informativo (queda en la marca y en el checklist; no lo lee nadie): la noche termina con `volvi`.
// B4.4 (28, 31): el despertador y la mudanza al 40 % ya no existen — un obrero de fondo es un proceso que el director lanzó: se
// entera porque terminó y mira git. `despertador` dice una línea y sale 0 (una línea vieja que lo llame no se rompe).
// Salidas: 0 anduvo · 1 negado (una línea con qué hacer) · 2 mal llamado. Node estándar, cero dependencias. Es .cjs a propósito.

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const USO = [
  'Uso: node .claude/scripts/noche.cjs <comando> …   (desde el repo)',
  '  me-voy [--hasta HH:MM]                    desde el worktree del director: escribe .kit-noche e imprime el checklist',
  '                                            (--hasta es informativo: la noche termina con volvi)',
  '  volvi                                     borra .kit-noche (de este checkout y de los worktrees del repo)',
  '  despertador                               ya no existe (el director se entera cuando el obrero de fondo termina)',
  '  cierre <x>                                la línea de la sesión de cierre (de fondo, en la carpeta principal); el director la lanza después de integrar',
  '  cierre-empieza <x>                        (la sesión de cierre) toma el candado del cierre y mira la carpeta principal',
  '  publicar <x> [--seguir]                   el único camino por el que el kit publica sin persona (salidas: 0 publicó · 1 falló · 3 no publica)',
  '  subir <x>                                 el único push del cierre: solo papeles',
  '  parte <x> [--no-pude "<texto>"]…          escribe e imprime el parte de la noche y suelta el candado',
].join('\n');

const ARCHIVO_NOCHE = '.kit-noche';
const RELEVO = 'antes de cada espera larga: todo commiteado y subido y el relevo al día (si quedás quieto cerca de una hora la plataforma puede resumir la charla, y con el relevo se retoma)';
const SIN_DESPERTADOR = 'despertador: ya no existe — el director lanza los obreros de fondo y se entera cuando terminan, mirando git';
const RE_X = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const T_RED = 15000; // ls-remote y fetch: un plazo corto, sin red no se cuelga

// Los comandos de la noche que termina sola (SPEC-paquete-8d B3): todos con <x>.
const CON_MODULO = ['cierre', 'cierre-empieza', 'publicar', 'subir', 'parte'];

class MalLlamado extends Error {}
const malLlamado = (m) => {
  throw new MalLlamado(m);
};

function libs() {
  return {
    contexto: require('../hooks/lib/contexto.cjs'),
    git: require('../hooks/lib/git.cjs'),
    E: require('../hooks/lib/encargo.cjs'),
    docs: require('../hooks/lib/docs-ruta.cjs'), // 8r3 i1: la carpeta de papeles (docs sin la clave)
    proceso: require('../hooks/lib/proceso.cjs'),
    pub: require('../hooks/lib/publicar.cjs'),
  };
}

// ---------------------------------------------------------------- argumentos

function leerArgumentos(argv) {
  const comando = argv[0];
  if (!['me-voy', 'volvi', 'despertador', ...CON_MODULO].includes(comando)) malLlamado(comando ? `no conozco "${String(comando).slice(0, 40)}"` : 'falta el comando');
  const a = { comando, hasta: null, modulo: null, seguir: false, noPude: [] };
  if (comando === 'despertador') return a; // B4.4: ya no existe; las banderas de antes no rompen
  if (CON_MODULO.includes(comando)) {
    const v = argv[1];
    if (!RE_X.test(v || '') || v.length > 20) malLlamado(`${comando} pide el módulo (minúsculas, números y guiones simples): "${String(v || '').slice(0, 40)}"`);
    a.modulo = v;
    for (let i = 2; i < argv.length; i++) {
      const x = argv[i];
      if (comando === 'publicar' && x === '--seguir') a.seguir = true;
      else if (comando === 'parte' && x === '--no-pude' && argv[i + 1]) a.noPude.push(String(argv[++i]).replace(/[\s`]+/g, ' ').slice(0, 200));
      else malLlamado(`${comando} no lleva "${String(x).slice(0, 40)}"`);
    }
    return a;
  }
  for (let i = 1; i < argv.length; i++) {
    const x = argv[i];
    if (comando === 'me-voy' && x === '--hasta') {
      const v = argv[++i];
      if (!/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(v || '')) malLlamado(`--hasta pide una hora HH:MM (00:00 a 23:59): "${v || ''}"`);
      a.hasta = v;
    }
    else malLlamado(`${comando} no lleva "${String(x).slice(0, 40)}"`);
  }
  return a;
}

// ---------------------------------------------------------------- ayudantes de git

const G = (L, cwd, args, tiempo) => L.git.correr(args, { cwd, tiempo: tiempo || 60000 });
const sha7 = (s) => (s ? s.slice(0, 7) : '-------');
const dos = (n) => String(n).padStart(2, '0');
function isoLocal(d) {
  const z = -d.getTimezoneOffset();
  const s = z >= 0 ? '+' : '-';
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}T${dos(d.getHours())}:${dos(d.getMinutes())}${s}${dos(Math.floor(Math.abs(z) / 60))}:${dos(Math.abs(z) % 60)}`;
}
function hace(segundos, ahora) {
  const m = Math.max(0, Math.round((ahora.getTime() / 1000 - segundos) / 60));
  if (m < 60) return `hace ${m} min`;
  if (m < 48 * 60) return `hace ${Math.round(m / 60)} h`;
  return `hace ${Math.round(m / 1440)} días`;
}

// La bitácora del módulo, en la carpeta de papeles (8r3 i1): docs/modulos/<x>/bitacora sin la clave.
const bitacoraDe = (L, cwd, x) => L.docs.rel(L.docs.deRaiz(cwd), `modulos/${x}/bitacora`);

// La evidencia del encargo en un commit: el texto de docs/modulos/<x>/bitacora/*-evidencia-<ID>.md, o null.
function evidenciaEn(L, cwd, sha, x, id) {
  const dir = bitacoraDe(L, cwd, x);
  const r = G(L, cwd, ['ls-tree', '-z', '--name-only', sha, '--', `${dir}/`]);
  if (!r.ok) return null;
  const ruta = r.stdout.split('\0').find((p) => path.posix.dirname(p) === dir && new RegExp(`^.+-evidencia-${id}\\.md$`).test(path.posix.basename(p)));
  if (!ruta) return null;
  const t = G(L, cwd, ['show', `${sha}:${ruta}`]);
  return t.ok ? t.stdout : null;
}
// "PARADA: <por qué>" si la evidencia arranca así (NUCLEO §8); null si no.
function paradaDe(texto) {
  if (texto === null) return null;
  const l = texto.replace(/^﻿/, '').split(/\r?\n/).find((s) => s.trim() !== '');
  return l && /^PARADA:/.test(l.trim()) ? l.trim() : null;
}

// ---------------------------------------------------------------- me-voy

function encargosAbiertos(L, raiz, x, ahora) {
  const dir = bitacoraDe(L, raiz, x);
  const r = G(L, raiz, ['ls-tree', '-z', '--name-only', 'HEAD', '--', `${dir}/`]);
  if (!r.ok) return [];
  const ids = [];
  for (const p of r.stdout.split('\0').filter(Boolean)) {
    const m = /^.+-encargo-([0-9]{2})\.md$/.exec(path.posix.basename(p));
    if (m && path.posix.dirname(p) === dir && !ids.some((e) => e.id === m[1])) ids.push({ id: m[1], ruta: p });
  }
  const abiertos = [];
  for (const { id, ruta } of ids) {
    // Cerrado = su evidencia ya está en la rama del director (el CIERRE se mergeó) y no es una PARADA.
    const ev = evidenciaEn(L, raiz, 'HEAD', x, id);
    if (ev !== null && !paradaDe(ev)) continue;
    const rama = `modulo/${x}--${id}`;
    const local = L.E.shaDe(raiz, `refs/heads/${rama}`);
    const remoto = L.E.shaDe(raiz, `refs/remotes/origin/${rama}`);
    const punta = local || remoto;
    const t = G(L, raiz, ['show', `HEAD:${ruta}`]);
    const e = t.ok ? L.E.leerEncargo(t.stdout) : null;
    const apertura = e && e.campos.apertura ? e.campos.apertura : '?';
    const recursos = e && e.secciones && e.secciones.toca ? e.secciones.toca.recursos : [];
    let obrero = 'sin rama: el obrero no arrancó';
    let parada = null;
    if (punta) {
      const lg = G(L, raiz, ['log', '-1', '--format=%ct%x09%s', punta]);
      const [ct, ...asunto] = lg.ok ? lg.stdout.trim().split('\t') : ['', ''];
      obrero = `${rama}@${sha7(punta)}${local && remoto && local !== remoto ? ' (local y origin distintas)' : !remoto ? ' (sin subir)' : ''}` +
        (ct ? ` · ${hace(Number(ct), ahora)}: ${asunto.join('\t').slice(0, 80)}` : '');
      parada = paradaDe(evidenciaEn(L, raiz, punta, x, id));
    }
    abiertos.push({ id, apertura, recursos, obrero, parada });
  }
  return abiertos;
}

function meVoy(L, g, a, o) {
  const rama = L.contexto.rama(g.raiz);
  const p = L.contexto.pestana(rama);
  if (p.tipo !== 'director') {
    return { codigo: 1, lineas: [`me-voy corre desde el worktree del director (rama modulo/<x>) y acá la rama es ${rama || '(ninguna)'}: abrí la pestaña del director y corrélo ahí`] };
  }
  const ahora = o.ahora instanceof Date ? o.ahora : new Date();
  const lineas = [];
  fs.writeFileSync(path.join(g.raiz, ARCHIVO_NOCHE), `desde ${isoLocal(ahora)}\nhasta ${a.hasta || '—'}\n`);
  lineas.push(`noche: ${ARCHIVO_NOCHE} escrita en el worktree del director de ${p.modulo} (desde ${isoLocal(ahora)}${a.hasta ? `, hasta ${a.hasta}` : ''}): el director y sus obreros quedan nocturnos hasta "volvi"`);
  if (G(L, g.raiz, ['check-ignore', '-q', '--', ARCHIVO_NOCHE]).codigo !== 0) {
    lineas.push(`⚠️ ${ARCHIVO_NOCHE} no está ignorado en este repo: lo arregla "poné al día este repo"`);
  }
  // 1. los encargos abiertos y su obrero
  const abiertos = encargosAbiertos(L, g.raiz, p.modulo, ahora);
  if (!abiertos.length) lineas.push('encargos abiertos: ninguno (nada queda andando de noche)');
  for (const e of abiertos) {
    const para = e.apertura === 'director' ? '' : ` · ⚠️ Apertura: ${e.apertura} — de noche para (no lo abre el director)`;
    lineas.push(`encargo ${e.id} · ${e.obrero}${e.parada ? ` · ${e.parada}` : ''}${para}`);
  }
  // 2. la red: sin red no trabaja nadie (D §9.5, CM-86)
  const remotos = (L.git.texto(['remote'], { cwd: g.raiz }) || '').split('\n').map((s) => s.trim());
  if (!remotos.includes('origin')) lineas.push('red: sin remoto origin — nadie ve los commits de la noche desde otra PC');
  else {
    const r = G(L, g.raiz, ['ls-remote', '--heads', 'origin'], T_RED);
    lineas.push(r.ok ? 'red: origin responde' : `red: ❌ origin no responde (${r.error || (r.stderr || '').trim().split('\n')[0].slice(0, 80) || `salió ${r.codigo}`}) — sin red no trabaja nadie: arreglalo antes de irte`);
  }
  // 3. lo que vence: el script no lo sabe; los recursos de los encargos abiertos sí
  const recursos = [...new Set(abiertos.flatMap((e) => e.recursos))];
  lineas.push(`vence: VPN, credenciales y dispositivos no los ve el script: miralos vos${recursos.length ? ` (los encargos abiertos usan: ${recursos.join(', ')})` : ''}`);
  lineas.push('permisos: lo que no esté en el AUTORIZADO del encargo, de noche es PARADA (predecirlo: NO VERIFICADO)');
  // 4. B4.4: sin mudanza ni despertador; el relevo antes de cada espera larga (idleCompaction no se toca: ADR-034).
  lineas.push(RELEVO);
  return { codigo: 0, lineas };
}

// ---------------------------------------------------------------- volvi

function volvi(L, g) {
  const carpetas = [g.raiz];
  const lista = L.contexto.worktrees(g.raiz) || [];
  for (const w of lista) if (!carpetas.some((c) => path.resolve(c).toLowerCase() === w.ruta.toLowerCase())) carpetas.push(w.ruta);
  const borradas = [];
  for (const c of carpetas) {
    const p = path.join(c, ARCHIVO_NOCHE);
    if (!fs.existsSync(p)) continue;
    fs.rmSync(p, { force: true, recursive: true });
    const w = lista.find((x) => x.ruta.toLowerCase() === path.resolve(c).toLowerCase());
    borradas.push(w && w.rama ? w.rama : c);
  }
  if (!borradas.length) return { codigo: 0, lineas: ['volví: no había ninguna .kit-noche (ya era de día)'] };
  return { codigo: 0, lineas: [`volví: borré ${ARCHIVO_NOCHE} de ${borradas.join(', ')} — de día otra vez`] };
}

// ---------------------------------------------------------------- la noche termina sola (SPEC-paquete-8d B3, D8d-1, D8d-18, D8d-20, D8d-21)
// La sesión de cierre es de fondo, en la carpeta principal, en `dontAsk` con una lista cerrada; las autorizaciones, las pruebas y el
// estado de la carpeta los chequea ESTE script, por código, antes de correr nada (no la lectura de un modelo).

const PUBLICACION = 'kit-publicacion.json'; // en el git común, sin versionar: el resultado de la última publicación
const SOLTADO_CIERRE = 'kit-cierre-soltado.json'; // quién soltó el candado (parte), para que su `subir` siga
const CANDADO_CIERRE = 'kit-cierre.lock'; // en el git común: dos módulos que terminan la misma noche cierran de a uno (rt-7)
const CANDADO_VIEJO_MS = 3 * 3600 * 1000;
const ESPERA_CANDADO_MS = 8 * 60 * 1000; // menos que el plazo de una llamada de Bash: si no alcanza, sale 4 y se vuelve a correr
const T_PUBLICAR = 30 * 60 * 1000;
const T_PRUEBAS = 30 * 60 * 1000;
const T_PUSH = 600000;
const SCRIPTS = 'node .claude/scripts';
const RE_INTEGRAR = /^integrar: módulo (\S+)$/;

const barras = (p) => String(p).split('\\').join('/');
const dormir = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const lineasDe = (s) => String(s || '').split('\n').map((x) => x.trim()).filter(Boolean);

function leerJson(archivo) {
  try {
    return JSON.parse(fs.readFileSync(archivo, 'utf8'));
  } catch (e) {
    return null;
  }
}
function escribirJson(archivo, datos) {
  const tmp = `${archivo}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(datos, null, 2)}\n`);
  fs.renameSync(tmp, archivo);
}

// El checkout principal, en la rama por defecto, con rol humano y sin cambios sin guardar en lo que git sigue (opcional).
// → { ok: true, raiz, comun, defecto, docs } · { ok: false, por }
function enPrincipal(L, g, { limpio = false } = {}) {
  if (g.gitDir !== g.gitComun) return { ok: false, por: 'esto corre en la carpeta principal del proyecto, no en un worktree' };
  const rol = L.contexto.rol(g.raiz);
  if (rol !== 'humano') return { ok: false, por: `esto no lo corre una sesión con rol ${rol}` };
  const defecto = L.contexto.ramaPorDefecto(g.raiz);
  if (!defecto) return { ok: false, por: 'no sé cuál es la rama por defecto' };
  const rama = L.contexto.rama(g.raiz);
  if (rama !== defecto) return { ok: false, por: `la carpeta principal está en ${rama || 'ninguna rama'}, no en ${defecto}` };
  if (limpio) {
    const st = G(L, g.raiz, ['status', '--porcelain', '--untracked-files=no']);
    if (!st.ok) return { ok: false, por: 'no pude leer el estado de la carpeta' };
    if (lineasDe(st.stdout).length) return { ok: false, por: 'la carpeta principal tiene cambios sin guardar' };
  }
  return { ok: true, raiz: g.raiz, comun: g.gitComun, defecto, docs: L.docs.deRaiz(g.raiz) };
}

const shaDe = (L, cwd, ref) => {
  const r = G(L, cwd, ['rev-parse', '--verify', '-q', `${ref}^{commit}`]);
  return r.ok ? r.stdout.trim() : null;
};
const esAncestro = (L, cwd, a, b) => G(L, cwd, ['merge-base', '--is-ancestor', a, b]).codigo === 0;
const archivosDe = (L, cwd, sha) => lineasDe(G(L, cwd, ['diff-tree', '--no-commit-id', '--name-only', '-r', '--root', sha]).stdout);
// ¿Toca solo papeles? La carpeta de papeles y el AGENTS.md que genera agents.cjs (el /cierre lo commitea con los papeles).
const soloPapeles = (archivos, docs) => archivos.length > 0 && archivos.every((f) => f.startsWith(`${docs}/`) || f === 'AGENTS.md');

// ---- cierre <x>: la línea de la sesión de cierre

// La lista cerrada (B3.1, r2-5: sale de leer el /cierre paso por paso). Lo que no está acá, en dontAsk, no corre.
function listaCierre(x, defecto, docs) {
  return [
    'Read(./**)',
    'Glob',
    'Grep',
    `Edit(./${docs}/**)`, // P4: Edit cubre todas las herramientas que escriben; la línea de comandos avisa que Write no se mira
    'Bash(git status:*)',
    'Bash(git diff:*)',
    'Bash(git log:*)',
    'Bash(git show:*)',
    'Bash(git add:*)',
    'Bash(git commit:*)',
    'Bash(git pull --ff-only)',
    `Bash(git pull --rebase origin ${defecto})`,
    `Bash(${SCRIPTS}/noche.cjs cierre-empieza ${x})`,
    `Bash(${SCRIPTS}/noche.cjs publicar ${x})`,
    `Bash(${SCRIPTS}/noche.cjs parte ${x}:*)`,
    `Bash(${SCRIPTS}/noche.cjs subir ${x})`,
    `Bash(${SCRIPTS}/worktree.cjs limpiar)`,
    `Bash(${SCRIPTS}/worktree.cjs integrados)`,
    `Bash(${SCRIPTS}/estado.cjs:*)`,
    `Bash(${SCRIPTS}/resumen.cjs:*)`,
    `Bash(${SCRIPTS}/todo.cjs cierre)`,
    `Bash(${SCRIPTS}/tiempos.cjs:*)`,
    `Bash(${SCRIPTS}/estructura.cjs todo)`,
    `Bash(${SCRIPTS}/agents.cjs generar)`,
    `Bash(${SCRIPTS}/cambios.cjs verificar)`,
    `Bash(${SCRIPTS}/cambios.cjs listar:*)`,
    'Skill',
  ];
}

// "Tool(spec)" → { tool, spec, prefijo } (spec null sin paréntesis). La forma `:*` y la de espacio ` *` son lo mismo (un prefijo);
// en las rutas, `./` al principio no cambia nada.
function partirRegla(r) {
  const m = /^([A-Za-z]+)(?:\((.*)\))?$/.exec(String(r).trim());
  if (!m) return null;
  if (m[2] === undefined) return { tool: m[1], spec: null, prefijo: false };
  let spec = m[2].trim();
  let prefijo = false;
  if (/(?::| )\*$/.test(spec)) {
    spec = spec.replace(/(?::| )\*$/, '');
    prefijo = true;
  }
  if (m[1] !== 'Bash' && m[1] !== 'PowerShell') spec = spec.replace(/^\.\//, '');
  return { tool: m[1], spec, prefijo };
}
// ¿La regla `a` cubre todo lo que cubre `b`? (si una allow cubre un ítem de la lista, mandarla a deny apagaría ese ítem: deny gana)
function cubre(a, b) {
  const x = typeof a === 'string' ? partirRegla(a) : a;
  const y = typeof b === 'string' ? partirRegla(b) : b;
  if (!x || !y || x.tool !== y.tool) return false;
  if (x.spec === null) return true;
  if (y.spec === null) return false;
  if (x.prefijo) return y.spec.startsWith(x.spec);
  return !y.prefijo && x.spec === y.spec;
}

// Las anchas que el kit mismo pone (el settings del molde permite cambios.cjs entero): se quedan, y lo peligroso de adentro se niega
// aparte. Cualquier otra allow ancha que cubra un ítem de la lista (un `Bash` pelado, `Bash(git:*)`, `Edit` sin ruta…) frena el
// cierre: con ella, dontAsk correría de todo (rt B 1).
const ANCHAS_DEL_KIT = [`Bash(${SCRIPTS}/cambios.cjs:*)`];

// Lo que sobra (r2-1: en dontAsk también corre todo lo que algún settings tenga en allow) → { deny, anchas }: `deny` = las allow
// que no tienen nada que ver con la lista, más lo que nunca corre de noche; `anchas` = las que cubren un ítem y no son del kit.
// Una allow más angosta que un ítem (`Bash(git commit -m x)`) ya está adentro de la lista: no se niega.
function loQueSobra(lista, principal, home, x) {
  const allows = [];
  for (const a of [path.join(home, '.claude', 'settings.json'), path.join(principal, '.claude', 'settings.json'), path.join(principal, '.claude', 'settings.local.json')]) {
    const j = leerJson(a);
    const al = j && j.permissions && Array.isArray(j.permissions.allow) ? j.permissions.allow : [];
    for (const r of al) if (typeof r === 'string' && !allows.includes(r)) allows.push(r);
  }
  const deny = [];
  const anchas = [];
  for (const r of allows) {
    if (lista.some((i) => cubre(i, r))) continue; // igual o más angosta que un ítem: ya está permitido
    if (lista.some((i) => cubre(r, i))) {
      if (!ANCHAS_DEL_KIT.some((k) => cubre(k, r) && cubre(r, k))) anchas.push(r);
      continue;
    }
    deny.push(r);
  }
  const siempre = [
    'Bash(git push:*)',
    'Bash(git -C:*)',
    ...['aprobar', 'nuevo', 'rechazar', 'anotar-sha', 'subio-al-kit'].map((c) => `Bash(${SCRIPTS}/cambios.cjs ${c}:*)`),
    `Bash(${SCRIPTS}/noche.cjs publicar ${x} --seguir)`,
  ];
  for (const s of siempre) if (!deny.includes(s)) deny.push(s);
  return { deny, anchas };
}

// Una regla entre comillas que se pega igual en PowerShell y en Bash (como `autorizado`); con una comilla simple adentro, null.
function citar(regla) {
  if (!/["$`\\!]/.test(regla)) return `"${regla}"`;
  if (!regla.includes("'")) return `'${regla}'`;
  return null;
}

const SETTINGS_CIERRE = 'kit-cierre-settings.json'; // en el git común: lo que la sesión de cierre tiene negado (rt B 11: sin comillas)

function cierre(L, g, x, o) {
  const no = (m) => ({ codigo: 1, lineas: [`cierre: no — ${m}`] });
  const principal = path.dirname(g.gitComun);
  const defecto = L.contexto.ramaPorDefecto(g.raiz);
  if (!defecto) return no('no sé cuál es la rama por defecto');
  G(L, g.raiz, ['fetch', '-q', 'origin'], 120000);
  const punta = L.E.puntaDe(g.raiz, `modulo/${x}`);
  if (!punta) return no(`no encuentro la rama del módulo ${x}`);
  const od = shaDe(L, g.raiz, `refs/remotes/origin/${defecto}`) || shaDe(L, g.raiz, `refs/heads/${defecto}`);
  if (!od || !esAncestro(L, g.raiz, punta, od)) return no(`el módulo ${x} todavía no está en ${defecto}: primero integrar (que salga 0)`);
  const claude = L.proceso.comandoClaude(o);
  if (!claude) return no('no encuentro `claude` (ni en el PATH ni el de la extensión de VS Code)');
  const docs = L.docs.deRaiz(principal);
  const lista = listaCierre(x, defecto, docs);
  const s = loQueSobra(lista, principal, o.home || os.homedir(), x);
  if (s.anchas.length) return no(`hay un permiso ancho en un settings (${s.anchas.join(', ')}): con él, la sesión de cierre correría de todo sin preguntar. Sacalo (o hacelo más angosto) y volvé a lanzar el cierre`);
  const cl = lista.map(citar);
  if (cl.includes(null)) return no('un permiso de la lista no se puede citar');
  // Lo negado va en un settings aparte (--settings), no en la línea: así no hay comillas que rompan ni un largo que no entre.
  const archivo = path.join(g.gitComun, SETTINGS_CIERRE);
  escribirJson(archivo, { permissions: { deny: s.deny } });
  const id = crypto.randomBytes(6).toString('hex');
  const pedido = `Leé .claude/skills/director/cierre-noche.md y seguilo para el módulo ${x}.`;
  const linea = `cd "${barras(principal)}" && printf '%s\\n' '${pedido}' | KIT_FONDO=1 KIT_CIERRE_ID=${id} ${claude} -p --model opus --permission-mode dontAsk --name cierre-${x} --settings "${barras(archivo)}" --allowedTools ${cl.join(' ')}`;
  return { codigo: 0, lineas: [`cierre de ${x}: lanzala en segundo plano (Bash) y, cuando termine, mostrá el parte tal cual`, `cierre de fondo: ${linea}`] };
}

// ---- cierre-empieza <x>: el candado del repo y la carpeta

function cierreEmpieza(L, g, x, o) {
  if (g.gitDir !== g.gitComun || L.contexto.rol(g.raiz) !== 'humano') return { codigo: 1, lineas: ['cierre-empieza: no — corre en la carpeta principal'] };
  const dir = path.join(g.gitComun, CANDADO_CIERRE);
  const env = o.env || process.env;
  const id = env.KIT_CIERRE_ID ? String(env.KIT_CIERRE_ID) : null;
  const espera = Number.isFinite(o.esperaCandadoMs) ? o.esperaCandadoMs : ESPERA_CANDADO_MS;
  const ahora = () => (o.reloj ? o.reloj() : Date.now());
  const t0 = ahora();
  let avise = false;
  for (;;) {
    try {
      fs.mkdirSync(dir);
      escribirJson(path.join(dir, 'quien.json'), { modulo: x, id, desde: new Date(ahora()).toISOString() });
      break;
    } catch (e) {
      if (!e || e.code !== 'EEXIST') return { codigo: 1, lineas: [`cierre-empieza: no pude tomar el candado del cierre (${e && e.code})`] };
      const q = leerJson(path.join(dir, 'quien.json'));
      if (q && q.modulo === x && (q.id || null) === id) break; // es el mío (el mismo cierre): retomo
      const desde = q ? Date.parse(q.desde) : NaN;
      if (!q || !Number.isFinite(desde) || ahora() - desde > CANDADO_VIEJO_MS) {
        fs.rmSync(dir, { recursive: true, force: true }); // uno roto o de hace horas: lo dejó un cierre que no terminó
        continue;
      }
      if (ahora() - t0 >= espera) return { codigo: 4, lineas: [`cierre-empieza: otro cierre (el del módulo ${q.modulo}) sigue en la carpeta principal: volvé a correr cierre-empieza ${x} en unos minutos`] };
      if (!avise && o.salida) {
        o.salida(`cierre-empieza: espero que termine el cierre del módulo ${q.modulo}…\n`);
        avise = true;
      }
      dormir(Math.min(15000, Math.max(50, espera / 10)));
    }
  }
  const p = enPrincipal(L, g, { limpio: true });
  if (!p.ok) {
    escribirJson(path.join(dir, 'quien.json'), { modulo: x, id, desde: new Date(ahora()).toISOString(), noPude: `no toqué la carpeta principal: ${p.por}` });
    return { codigo: 1, lineas: [`cierre-empieza: no toco nada — ${p.por}. Andá al parte (noche.cjs parte ${x}), sin commit ni subir, y terminá`] };
  }
  return { codigo: 0, lineas: [`cierre-empieza: la carpeta principal está lista (en ${p.defecto}, sin cambios sin guardar); seguí con git pull --ff-only`] };
}

// Red team de B3 (6): de fondo, publicar y subir corren solo dentro de la sesión de cierre que tomó el candado (el suyo: el mismo
// módulo y el mismo KIT_CIERRE_ID). Con persona, no hace falta. → null si puede, o el motivo.
function sinCandadoDeFondo(L, comun, x, env, que) {
  if (!L.contexto.deFondo(env)) return null;
  const q = leerJson(path.join(comun, CANDADO_CIERRE, 'quien.json'));
  const id = env.KIT_CIERRE_ID ? String(env.KIT_CIERRE_ID) : null;
  if (q && q.modulo === x && id && (q.id || null) === id && !q.noPude) return null;
  // P4 (2026-11-13): `parte` suelta el candado y después viene `subir`: sube el mismo cierre que lo soltó, si nadie lo tomó después.
  if (que === 'subir' && !q && id) {
    const s = leerJson(path.join(comun, SOLTADO_CIERRE));
    if (s && s.modulo === x && s.id === id) return null;
  }
  return `de fondo, ${que} va dentro de una sesión de cierre con el candado tomado (cierre-empieza ${x} primero)`;
}

// ---- publicar <x> [--seguir]

const rutaPublicacion = (comun) => path.join(comun, PUBLICACION);

function correrPaso(L, cmd, cwd, plazoMs, archivoSalida) {
  let fd = null;
  try {
    fd = fs.openSync(archivoSalida, 'a');
    return L.proceso.correrConPlazo(cmd, { cwd, plazoMs, stdio: ['ignore', fd, fd] });
  } finally {
    if (fd !== null) fs.closeSync(fd);
  }
}

// ¿La carpeta está como la dejó git? Nada cambiado en lo que git sigue, y nada sin seguir fuera de los papeles (rt B 3: un build
// levanta solo las páginas que encuentra). Respeta el .gitignore. → null si está, o el motivo.
function carpetaSucia(L, raiz, docs) {
  const st = G(L, raiz, ['-c', 'core.quotePath=false', 'status', '--porcelain', '--untracked-files=all']);
  if (!st.ok) return 'no pude leer el estado de la carpeta principal';
  const ls = String(st.stdout || '').split('\n').filter((l) => l.trim());
  if (ls.some((l) => !l.startsWith('?? '))) return 'la carpeta principal tiene cambios sin guardar';
  if (ls.some((l) => !soloPapeles([l.slice(3).replace(/^"|"$/g, '')], docs))) return 'la carpeta principal tiene archivos que git no sigue fuera de los papeles';
  return null;
}

function publicar(L, g, x, a, o) {
  const p = enPrincipal(L, g);
  if (!p.ok) return { codigo: 1, lineas: [`publicar: no — ${p.por}`] };
  if (a.seguir && (L.contexto.deFondo(o.env || process.env) || L.contexto.deNoche(g.raiz).noche)) return { codigo: 1, lineas: ['publicar: no — destrabar la publicación es una firma del dueño: de fondo o de noche, no'] };
  const sc = sinCandadoDeFondo(L, p.comun, x, o.env || process.env, 'publicar');
  if (sc) return { codigo: 1, lineas: [`publicar: no — ${sc}`] };
  const archivo = rutaPublicacion(p.comun);
  const antes = leerJson(archivo) || {};
  const guardar = (d) => escribirJson(archivo, { ...d, cuando: new Date().toISOString() });
  const conEspera = (codigo, m, espera) => {
    guardar({ ...antes, ultimaSalida: codigo, motivo: m, teEspera: espera === undefined ? antes.teEspera || null : espera });
    return { codigo, lineas: [`publicar: ${codigo === 3 ? '' : 'no — '}${m}`] };
  };
  const no = (m, espera) => conEspera(1, m, espera);
  const tres = (m, espera) => conEspera(3, m, espera);
  // 1. la ficha vigente
  const fv = L.contexto.fichaVigente(p.raiz);
  const pub = fv.estado === 'ok' && fv.datos.autorizado && typeof fv.datos.autorizado === 'object' ? fv.datos.autorizado.publicar : undefined;
  if (!pub || pub === 'no' || typeof pub !== 'object') return tres('este proyecto no publica solo', null);
  const alSubir = pub.comando === L.pub.AL_SUBIR;
  G(L, p.raiz, ['fetch', '-q', 'origin'], 120000);
  const urlOrigin = (G(L, p.raiz, ['remote', 'get-url', 'origin']).stdout || '').trim();
  if (!urlOrigin) return no('no hay remoto origin');
  const ref = `refs/remotes/origin/${p.defecto}`;
  // 2. la autorización de esta PC (no la necesita un proyecto que publica al subir: lo gobierna merge-a-main)
  if (!alSubir) {
    for (const f of L.pub.archivosNombrados(pub)) {
      if (!G(L, p.raiz, ['cat-file', '-e', `${ref}:${f}`]).ok) return tres(`no encuentro en ${p.defecto} el archivo con que se publica (${f})`, 'no encuentro el archivo con que se publica este proyecto: decidí qué hacer');
    }
    const env = o.env || process.env;
    const home = env.KIT_HOME_PC && L.pub.esOriginLocal(urlOrigin) ? env.KIT_HOME_PC : o.home || os.homedir();
    const au = L.pub.autorizacionesPc(home);
    const origin = L.pub.normalizarOrigin(urlOrigin);
    const hoy = L.pub.huella(p.raiz, pub, ref);
    const lista = au.lista || [];
    const mia = lista.find((e) => e.origin === origin);
    if (!mia) {
      const otro = lista.find((e) => e.huella === hoy);
      const m = otro ? 'cambió el origin de este proyecto: falta tu autorización de nuevo para publicar desde esta PC' : 'falta tu autorización para publicar desde esta PC';
      return tres(m, m);
    }
    if (mia.huella !== hoy) return tres('cambió cómo se publica este proyecto: falta tu OK de nuevo', 'cambió cómo se publica este proyecto: falta tu OK de nuevo para publicar desde esta PC');
  }
  // 3. no quedó trabado, ni a medias (rt B 5: una publicación que se cortó sin terminar cuenta como trabada)
  if (antes.enCurso && !a.seguir) return tres('una publicación anterior quedó a medias (se cortó antes de terminar): no publico hasta que digas que siga', 'una publicación quedó a medias: decidí si sigue');
  if (antes.trabado && !a.seguir) return tres('la publicación quedó trabada (la última falló): no publico hasta que digas que siga', 'la última publicación falló: decidí si sigue');
  // 4. la carpeta, HEAD = origin, el módulo adentro, y desde lo último publicado solo módulos y papeles
  const sucia = carpetaSucia(L, p.raiz, p.docs);
  if (sucia) return no(sucia);
  const head = shaDe(L, p.raiz, 'HEAD');
  const od = shaDe(L, p.raiz, ref);
  if (!head || head !== od) return no(`la carpeta principal no está igual a origin/${p.defecto} (corré git pull --ff-only antes)`);
  const punta = L.E.puntaDe(p.raiz, `modulo/${x}`);
  if (!punta || !esAncestro(L, p.raiz, punta, head)) return no(`el módulo ${x} no está en ${p.defecto}`);
  if (antes.commit === head && antes.ultimaSalida === 0) return { codigo: 0, lineas: ['publicar: este mismo commit ya estaba publicado y su prueba de humo pasó: no lo repito'] };
  let base = antes.publicado && shaDe(L, p.raiz, antes.publicado) && esAncestro(L, p.raiz, antes.publicado, head) ? antes.publicado : null;
  if (!base) {
    // la primera vez: el anterior al merge que trajo el módulo (el primer padre más viejo que ya lo contiene)
    const fp = G(L, p.raiz, ['rev-list', '--first-parent', head]);
    if (!fp.ok) return no('no pude leer la historia');
    const lista = lineasDe(fp.stdout);
    let k = -1;
    for (let i = 0; i < lista.length; i++) {
      if (esAncestro(L, p.raiz, punta, lista[i])) k = i;
      else break;
    }
    base = k >= 0 && lista[k + 1] ? lista[k + 1] : null;
    if (!base) return no('no encuentro desde dónde mirar lo que entró');
  }
  const rango = G(L, p.raiz, ['rev-list', '--first-parent', `${base}..${head}`]);
  if (!rango.ok) return no('no pude leer lo que entró desde la última publicación'); // rt B 7: si git falla, no se publica
  let hayModulo = false;
  if (!a.seguir) {
    for (const c of lineasDe(rango.stdout)) {
      const pr = G(L, p.raiz, ['rev-list', '--parents', '-n', '1', c]);
      const padres = pr.ok ? lineasDe(pr.stdout)[0].split(' ').length - 1 : 0;
      const asunto = (G(L, p.raiz, ['log', '-1', '--format=%s', c]).stdout || '').trim();
      // rt B 7: el asunto no alcanza — el segundo padre tiene que ser del módulo que nombra (su rama, acá o en origin). Si esa rama
      // ya no está (limpiada después de una noche que no publicó), vale el asunto, como antes.
      const mi = RE_INTEGRAR.exec(asunto);
      if (padres === 2 && mi) {
        const segundo = lineasDe(pr.stdout)[0].split(' ')[2];
        const delModulo = L.E.puntaDe(p.raiz, `modulo/${mi[1]}`);
        if (!delModulo || esAncestro(L, p.raiz, segundo, delModulo)) {
          hayModulo = true;
          continue;
        }
      }
      if (padres === 1 && soloPapeles(archivosDe(L, p.raiz, c), p.docs)) continue;
      return no('desde lo último que se publicó entró algo que no es un módulo integrado ni papeles: no publico', 'desde la última publicación entró algo por fuera de un módulo: decidí si se publica');
    }
    // P4 (2026-11-13): cada cierre commitea papeles; sin un módulo nuevo desde lo último publicado, no hay nada que publicar.
    if (!hayModulo && antes.publicado && base === antes.publicado && antes.ultimaSalida === 0) {
      return { codigo: 0, lineas: ['publicar: desde lo último publicado solo entraron papeles: no hay nada nuevo que publicar'] };
    }
  }
  const salida = path.join(os.tmpdir(), `kit-pub-${crypto.randomBytes(8).toString('hex')}.log`);
  const pasos = { pruebas: 'no hay', comando: 'no hay', humo: 'no hay', volver: 'no hay' };
  const fin = (codigo, m, trabado, espera = null) => {
    guardar({ commit: head, publicado: codigo === 0 ? head : antes.publicado || null, pasos, trabado, enCurso: null, ultimaSalida: codigo, motivo: m, teEspera: espera });
    return { codigo, lineas: [`publicar: ${m}`] };
  };
  // Desde acá, la salida de lo que corre (puede traer claves) va a un archivo con nombre al azar, y se borra siempre al terminar
  // (rt B 4). Y queda la marca "en curso": si esto se corta, la próxima corrida no publica encima (rt B 5).
  guardar({ ...antes, enCurso: { commit: head, desde: new Date().toISOString() }, teEspera: null });
  try {
    // 5. el setup y las pruebas, acá (rt-10), con el turno de la PC (B5)
    const vars = fv.datos.vars || {};
    if (!alSubir) {
      const plazoT = Math.max(T_PRUEBAS, Number(vars['plazo-test']) * 60000 || 0);
      // Revisor frío de B (3), cicatriz 52: un `prepare` (husky) del comando-setup cambia core.hooksPath y apaga los githooks del
      // kit en todo el repo: se anota antes y se repone después (como el setup de worktree.cjs).
      const hooksAntes = (G(L, p.raiz, ['config', '--get', 'core.hooksPath']).stdout || '').trim();
      const r = L.proceso.conTurno('publicar', () => {
        try {
          for (const k of ['comando-setup', 'comando-test']) {
            const cmd = typeof vars[k] === 'string' && vars[k].trim() ? vars[k] : null;
            if (!cmd) continue;
            const q = correrPaso(L, cmd, p.raiz, plazoT, salida);
            if (q.estado !== 'verde') return { falla: k };
          }
          return { ok: true };
        } finally {
          if (hooksAntes && (G(L, p.raiz, ['config', '--get', 'core.hooksPath']).stdout || '').trim() !== hooksAntes) G(L, p.raiz, ['config', 'core.hooksPath', hooksAntes]);
        }
      }, { salida: o.salida });
      pasos.pruebas = r.ok ? 'pasó' : 'falló';
      if (!r.ok) return fin(1, 'las pruebas fallaron en la carpeta principal: no publiqué', false);
      // lo que corrió no tiene que haber dejado la carpeta distinta de lo que se probó (rt B 3)
      const otra = carpetaSucia(L, p.raiz, p.docs) || (shaDe(L, p.raiz, 'HEAD') !== head ? 'la carpeta principal cambió mientras corrían las pruebas' : null);
      if (otra) return fin(1, `${otra}: no publiqué`, false);
      // 6. publicar. Si falla, lo publicado puede haber quedado a medias: queda trabado (rt B 5).
      const c = correrPaso(L, pub.comando, p.raiz, T_PUBLICAR, salida);
      pasos.comando = c.estado === 'verde' ? 'pasó' : 'falló';
      if (c.estado !== 'verde') return fin(1, 'el comando de publicar falló (puede haber quedado a medias): queda trabado hasta que decidas', true, 'el comando de publicar falló: decidí si sigue');
    }
    // 7. el humo; si falla y hay volver, vuelve atrás
    const h = correrPaso(L, pub.humo, p.raiz, T_PUBLICAR, salida);
    pasos.humo = h.estado === 'verde' ? 'pasó' : 'falló';
    if (h.estado !== 'verde') {
      if (!alSubir && typeof pub.volver === 'string' && pub.volver.trim()) {
        const v = correrPaso(L, pub.volver, p.raiz, T_PUBLICAR, salida);
        pasos.volver = v.estado === 'verde' ? 'pasó' : 'falló';
      }
      const vuelta = pasos.volver === 'pasó' ? 'se volvió atrás' : pasos.volver === 'falló' ? 'volver atrás también falló' : 'no hay cómo volver atrás';
      return fin(1, `la prueba de humo falló después de publicar (${vuelta}): la publicación queda trabada hasta que decidas`, true, 'la última publicación falló en la prueba de humo: decidí si sigue');
    }
    return fin(0, alSubir ? 'la prueba de humo pasó (este proyecto publica al subir)' : 'publiqué y la prueba de humo pasó', false);
  } finally {
    fs.rmSync(salida, { force: true });
  }
}

// ---- subir <x>: el único push del cierre, y solo de papeles

function subir(L, g, x, o = {}) {
  const no = (m) => ({ codigo: 1, lineas: [`subir: no — ${m}`] });
  const p = enPrincipal(L, g);
  if (!p.ok) return no(p.por);
  const sc = sinCandadoDeFondo(L, p.comun, x, o.env || process.env, 'subir');
  if (sc) return no(sc);
  // rt B 12: en un proyecto que publica al subir, cada push a la rama por defecto es publicar: con la publicación trabada, no.
  const fv = L.contexto.fichaVigente(p.raiz);
  const pub = fv.estado === 'ok' && fv.datos.autorizado && typeof fv.datos.autorizado === 'object' ? fv.datos.autorizado.publicar : undefined;
  const est = leerJson(rutaPublicacion(p.comun)) || {};
  if (pub && typeof pub === 'object' && pub.comando === L.pub.AL_SUBIR && (est.trabado || est.enCurso)) return no('este proyecto publica al subir y la última publicación quedó trabada: no subo nada hasta que el dueño decida');
  const revisar = () => {
    G(L, p.raiz, ['fetch', '-q', 'origin'], 120000);
    const rl = G(L, p.raiz, ['rev-list', `refs/remotes/origin/${p.defecto}..HEAD`]);
    if (!rl.ok) return { mal: 'no pude leer lo que hay para subir' };
    const cs = lineasDe(rl.stdout);
    for (const c of cs) {
      const pr = G(L, p.raiz, ['rev-list', '--parents', '-n', '1', c]);
      const padres = pr.ok ? lineasDe(pr.stdout)[0].split(' ').length - 1 : 0;
      if (padres !== 1 || !soloPapeles(archivosDe(L, p.raiz, c), p.docs)) return { mal: 'lo que hay para subir no son solo papeles: no subo código desde el cierre' };
    }
    return { cs };
  };
  let r = revisar();
  if (r.mal) return no(r.mal);
  if (!r.cs.length) return { codigo: 0, lineas: ['subir: nada que subir'] };
  for (let vuelta = 0; vuelta < 2; vuelta++) {
    const push = G(L, p.raiz, ['push', '-q', 'origin', `HEAD:refs/heads/${p.defecto}`], T_PUSH);
    if (push.ok) return { codigo: 0, lineas: [`subir: subí ${r.cs.length} commit(s) de papeles`] };
    if (vuelta === 1 || !/rejected|non-fast-forward|fetch first|failed to push/i.test(push.stderr || '')) return no(`el push falló (${lineasDe(push.stderr)[0] || push.error || 'sin motivo'})`);
    const pr = G(L, p.raiz, ['pull', '-q', '--rebase', 'origin', p.defecto], 120000);
    if (!pr.ok) {
      G(L, p.raiz, ['rebase', '--abort']);
      return no('origin avanzó y traerlo chocó: lo dejo para el dueño');
    }
    r = revisar();
    if (r.mal) return no(r.mal);
  }
  return no('no pude subir');
}

// ---- parte <x>: lo escribe el script, no el modelo (B3.6)

// Lo que viene de un modelo (el --no-pude, los renglones de "te espera" que escribió una sesión) pasa por acá antes de llegarle al
// dueño (rt B 10): sin SHAs, sin comandos del kit, sin rojo ni verde.
function paraElDueno(t) {
  return String(t)
    .replace(/`[^`]*`/g, (m) => (/node |git |\.cjs/.test(m) ? 'un paso del kit' : m.slice(1, -1)))
    .replace(/\bnode \.claude\/\S+(?: [a-z-]+)?/g, 'un paso del kit')
    .replace(/@?\b[0-9a-f]{7,40}\b/gi, '')
    .replace(/\b(rojo|roja|rojos|rojas)\b/gi, 'falló')
    .replace(/\b(verde|verdes)\b/gi, 'pasó')
    .replace(/\s+/g, ' ')
    .trim();
}

function parte(L, g, x, a, o) {
  const p = enPrincipal(L, g);
  const raiz = g.gitDir === g.gitComun ? g.raiz : path.dirname(g.gitComun);
  const comun = g.gitComun;
  const defecto = L.contexto.ramaPorDefecto(raiz);
  const ahora = o.ahora instanceof Date ? o.ahora : new Date();
  const env = o.env || process.env;
  const quien = leerJson(path.join(comun, CANDADO_CIERRE, 'quien.json')) || {};
  const noPude = [...(a.noPude || [])];
  if (quien.noPude) noPude.unshift(quien.noPude);
  if (!p.ok && !quien.noPude) noPude.push(`no pude trabajar en la carpeta principal: ${p.por}`);
  // Qué quedó
  const od = defecto ? shaDe(L, raiz, `refs/remotes/origin/${defecto}`) || shaDe(L, raiz, `refs/heads/${defecto}`) : null;
  // Revisor frío de B (2): `limpiar` corre antes y borra la rama ya mezclada del módulo: sin la rama, la punta es el segundo padre
  // del merge `integrar: módulo <x>` más nuevo del primer padre de la rama por defecto.
  let punta = L.E.puntaDe(raiz, `modulo/${x}`);
  if (!punta && od) {
    const lg = G(L, raiz, ['log', '--first-parent', '--merges', '-n', '200', '--format=%P%x09%s', od]);
    for (const l of lineasDe(lg.stdout)) {
      const [padres, asunto] = l.split('\t');
      const m = RE_INTEGRAR.exec(asunto || '');
      if (m && m[1] === x) {
        punta = padres.split(' ')[1] || null;
        break;
      }
    }
  }
  const integrado = !!(punta && od && esAncestro(L, raiz, punta, od));
  if (!integrado) noPude.push(`el módulo ${x} no quedó integrado`);
  const pub = leerJson(rutaPublicacion(comun));
  const fv = L.contexto.fichaVigente(raiz);
  const tocaPublicar = !!(fv.estado === 'ok' && fv.datos.autorizado && fv.datos.autorizado.publicar && fv.datos.autorizado.publicar !== 'no');
  const deHoy = pub && Date.parse(pub.cuando) > ahora.getTime() - 24 * 3600 * 1000;
  let publicado = 'no tocaba';
  let humo = 'no tocaba';
  const primero = [];
  if (tocaPublicar) {
    publicado = deHoy && pub.ultimaSalida === 0 ? 'sí' : 'no';
    humo = deHoy && pub.pasos && pub.pasos.humo !== 'no hay' ? pub.pasos.humo : 'no';
    if (deHoy && pub.pasos && pub.pasos.humo === 'falló') {
      const v = pub.pasos.volver === 'pasó' ? 'y se volvió atrás' : pub.pasos.volver === 'falló' ? 'y volver atrás también falló' : 'y este proyecto no tiene cómo volver atrás';
      primero.push(`- ⚠️ La prueba de humo falló después de publicar, ${v}. No se publica más hasta que decidas.`);
    }
    if (publicado === 'no' && pub && pub.motivo && deHoy) noPude.push(`publicar: ${pub.motivo}`);
  }
  const docs = L.docs.deRaiz(raiz);
  const handoff = `${docs}/SESSION_HANDOFF.md`;
  let papeles = 'no';
  if (integrado) {
    const ult = lineasDe(G(L, raiz, ['log', '-1', '--format=%H', '--', handoff]).stdout)[0];
    if (ult && esAncestro(L, raiz, punta, ult) && ult !== punta) papeles = 'sí';
  }
  if (papeles === 'no') noPude.push('los papeles (handoff, CHANGELOG, TODO) no quedaron al día');
  // P4: también cuenta la carpeta que git ya no registra pero sigue en el disco (una sesión la tenía abierta y no se pudo borrar).
  const registradas = (L.contexto.worktrees(raiz) || []).filter((w) => path.resolve(w.ruta).toLowerCase() !== path.resolve(raiz).toLowerCase()).map((w) => path.resolve(w.ruta).toLowerCase());
  let enDisco = [];
  try {
    enDisco = fs.readdirSync(path.join(raiz, '.claude', 'worktrees'), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => path.resolve(raiz, '.claude', 'worktrees', e.name).toLowerCase());
  } catch (e) {
    enDisco = [];
  }
  // P4: el worktree del director de este módulo sigue vivo después de la noche (muestra el parte y para): no cuenta.
  const delDirector = path.resolve(raiz, '.claude', 'worktrees', `modulo--${x}`).toLowerCase();
  const quedan = new Set([...registradas, ...enDisco].filter((r) => r !== delDirector)).size;
  const limpias = quedan === 0 ? 'sí' : `no (quedan ${quedan})`;
  if (quedan) noPude.push(`quedan ${quedan} carpeta(s) de trabajo abiertas: las cierra la próxima limpieza`);
  // Te necesito y Qué se hizo
  let te = [];
  try {
    te = require('../hooks/lib/espera.cjs').teEspera(raiz, { ahora, sinParte: true });
  } catch (e) {
    te = [];
  }
  let hechos = [];
  try {
    hechos = require('./estado.cjs').encargosDelModulo(raiz, x).filter((e) => e.estado === 'cerrado');
  } catch (e) {
    hechos = [];
  }
  const fecha = `${ahora.getFullYear()}-${dos(ahora.getMonth() + 1)}-${dos(ahora.getDate())}`;
  const items = (xs, f) => {
    const ls = xs.map(f).map(paraElDueno).filter(Boolean);
    return ls.length ? ls.map((t) => `- ${t}`) : ['- nada'];
  };
  const texto = [
    `# Parte de la noche · ${x} · ${fecha}`,
    '',
    '## Qué quedó',
    '',
    ...primero,
    `- Integrado: ${integrado ? 'sí' : 'no'}`,
    `- Publicado: ${publicado}`,
    `- La prueba de humo: ${humo}`,
    `- Los papeles al día: ${papeles}`,
    `- Las carpetas limpias: ${limpias}`,
    '',
    '## Te necesito',
    '',
    ...items(te, (i) => i.texto),
    '',
    '## Qué se hizo',
    '',
    ...items(hechos, (e) => `${e.titulo || 'un encargo'}${Number.isFinite(e.minutos) ? ` · ${e.minutos} min` : ''}`),
    '',
    '## Lo que no pude',
    '',
    ...items(noPude, (t) => t),
    '',
  ].join('\n');
  const rel = `${L.docs.rel(docs, `modulos/${x}/bitacora`)}/${fecha}-parte.md`;
  const abs = path.join(raiz, ...rel.split('/'));
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, texto);
  // El candado lo suelta solo el cierre que lo tomó (rt B 6): otro cierre que se cansó de esperar no suelta el de nadie.
  const id = env.KIT_CIERRE_ID ? String(env.KIT_CIERRE_ID) : null;
  if (!quien.modulo || ((quien.id || null) === id && quien.modulo === x)) {
    fs.rmSync(path.join(comun, CANDADO_CIERRE), { recursive: true, force: true });
    if (quien.modulo && id && !quien.noPude) escribirJson(path.join(comun, SOLTADO_CIERRE), { modulo: x, id, cuando: new Date().toISOString() });
  }
  return { codigo: 0, lineas: [texto.trimEnd(), '', `(el parte quedó en ${rel})`] };
}

// ---------------------------------------------------------------- main

function main(argv, opciones = {}) {
  const salida = opciones.salida || ((s) => process.stdout.write(s));
  const error = opciones.error || ((s) => process.stderr.write(s));
  let r;
  try {
    const a = leerArgumentos(argv);
    const L = libs();
    const g = L.contexto.datosGit(opciones.cwd || process.cwd());
    if (!g) r = { codigo: 1, lineas: ['noche: no estás dentro de un repo git'] };
    else if (a.comando === 'me-voy') r = meVoy(L, g, a, opciones);
    else if (a.comando === 'volvi') r = volvi(L, g);
    else if (a.comando === 'cierre') r = cierre(L, g, a.modulo, opciones);
    else if (a.comando === 'cierre-empieza') r = cierreEmpieza(L, g, a.modulo, { ...opciones, salida });
    else if (a.comando === 'publicar') r = publicar(L, g, a.modulo, a, { ...opciones, salida });
    else if (a.comando === 'subir') r = subir(L, g, a.modulo, opciones);
    else if (a.comando === 'parte') r = parte(L, g, a.modulo, a, opciones);
    else r = { codigo: 0, lineas: [SIN_DESPERTADOR] };
  } catch (e) {
    if (e instanceof MalLlamado) {
      error(`${e.message}\n${USO}\n`);
      return 2;
    }
    salida('noche roto: corré doctor\n');
    return 1;
  }
  if (r.lineas.length) salida(`${r.lineas.join('\n')}\n`);
  return r.codigo;
}

if (require.main === module) {
  let codigo = 1;
  try {
    codigo = main(process.argv.slice(2));
  } catch (e) {
    process.stdout.write('noche roto: corré doctor\n');
  }
  process.exitCode = codigo;
}

module.exports = { SETTINGS_CIERRE, paraElDueno, partirRegla, USO, ARCHIVO_NOCHE, PUBLICACION, CANDADO_CIERRE, SIN_DESPERTADOR, RELEVO, leerArgumentos, paradaDe, listaCierre, cubre, loQueSobra, main };
