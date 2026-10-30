#!/usr/bin/env node
'use strict';
// doctor.cjs — el chequeo de salud de esta PC y de este repo (SPEC-paquete-3, "Instalar hooks por PC" y el `doctor` mínimo; criterio 12;
// D-8: Claude Code ≥ 2.1.295; pendiente (a) de D2.2: KIT_PLAZO_ARRANQUE_MS).
//
//   node doctor.cjs [--home <dir>]
//
// SOLO LECTURA: no escribe nada (los programas externos que corre —gitleaks, claude, git— solo preguntan versión o config).
// Una línea por chequeo, en orden fijo:   ✓|✗|⚠ <id> · qué · cómo se arregla
// Igual en dos corridas (ninguna hora ni tiempo en la salida). Sale 0 si no hay ningún ✗ (los ⚠ no traban) y 1 si hay alguno.
// Lo externo corre con plazo (gitleaks 60 s; claude 20 s; git 10 s) y en paralelo; el que se cuelga da su línea con la causa.
// Sin --home mira el ~/.claude/ real (solo lo lee): las pruebas SIEMPRE pasan uno falso.
// Los chequeos del repo (pre-commit, ficha, sensible-prosa) son del repo donde estás parado (el cwd).
//
// Vive en eq/scripts/ y se instala en ~/.claude/skills/arquitecto-skills/scripts/: solo hace require de ../pc/lib/ y del instalador,
// que viajan con él (NO del molde). Los textos de abajo son las líneas de F del arranque dichas con más detalle: tienen que coincidir.
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawn, spawnSync } = require('child_process');
const { leerJsonSinDuplicados } = require('../pc/lib/zona-propia.cjs');
const ficha = require('../pc/lib/ficha.cjs');
const I = require('./instalar-hooks-pc.cjs');

const MIN_NODE = 20;
const MIN_GITLEAKS = '8.19.0';
const MIN_CLAUDE = '2.1.295'; // D-8
const PLAZO_GITLEAKS = 60000; // r1-6, r2-10: 47 s en frío con Defender
const PLAZO_CLAUDE = 20000;
const PLAZO_GIT = 10000;
const VAR_PLAZO = 'KIT_PLAZO_ARRANQUE_MS';
const HOOKS_GIT = ['pre-commit', 'pre-merge-commit', 'pre-push'];
const IDS = ['node', 'gitleaks', 'claude-code', 'lefthook', 'git-bash', 'settings-pc', 'hooks-pc', 'hooks-pc-iguales', 'deny-almacen', 'anti-secretos-viejo', 'plazo-arranque', 'pre-commit', 'ficha', 'sensible-prosa'];
const VIEJO = 'gh' + 'p_'; // el prefijo que delata al anti-secretos viejo (armado: ninguna forma de clave literal en kit/)
const ARREGLO_INSTALAR = 'pedile al Equipador "instalar hooks por PC" (o corré scripts/instalar-hooks-pc.cjs) y reiniciá Claude Code';

const barras = (p) => String(p).replace(/\\/g, '/');
const esMapa = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const existe = (p) => {
  try {
    return fs.existsSync(p);
  } catch (e) {
    return false;
  }
};
const leerTexto = (p) => {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch (e) {
    return null;
  }
};
const lista = (xs, n = 4) => (xs.length > n ? `${xs.slice(0, n).join(', ')} y ${xs.length - n} más` : xs.join(', '));
const res = (est, qué, arreglo) => ({ est, qué, arreglo: arreglo || null });

// ---------------------------------------------------------------- versiones
function version(texto) {
  const m = /(\d+)\.(\d+)\.(\d+)/.exec(String(texto));
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}
function comparar(a, b) {
  const x = Array.isArray(a) ? a : version(a);
  const y = Array.isArray(b) ? b : version(b);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1;
  return 0;
}

// ---------------------------------------------------------------- PATH y programas externos
function valorPath(env) {
  const k = Object.keys(env || {}).find((x) => x.toLowerCase() === 'path');
  return k ? String(env[k]) : '';
}
// El archivo ejecutable `nombre` en el PATH de `env` (null si no está). En Windows prueba las extensiones de PATHEXT.
function buscarEnPath(nombre, env) {
  const exts = process.platform === 'win32' ? ['', ...String((env && env.PATHEXT) || '.COM;.EXE;.BAT;.CMD').toLowerCase().split(';').filter(Boolean)] : [''];
  for (const d of valorPath(env).split(path.delimiter)) {
    if (!d) continue;
    for (const e of exts) {
      const p = path.join(d.replace(/^"|"$/g, ''), nombre + e);
      try {
        if (fs.statSync(p).isFile()) return p;
      } catch (err) {
        /* acá no está */
      }
    }
  }
  return null;
}

// Corre `ruta args…` con plazo. Nunca rechaza: { plazo } | { error } | { codigo, salida }. Si se cuelga mata el árbol de procesos (un
// .cmd cuelga a su hijo) y no espera a que cierren los pipes. No escribe nada; el stdin no existe.
function correrExterno(ruta, args, { plazoMs, env, cwd }) {
  return new Promise((resolver) => {
    let hecho = false;
    const fin = (v) => {
      if (hecho) return;
      hecho = true;
      clearTimeout(timer);
      resolver(v);
    };
    const bat = process.platform === 'win32' && /\.(cmd|bat)$/i.test(ruta);
    const cmd = bat ? env.ComSpec || env.COMSPEC || 'cmd.exe' : ruta;
    const argv = bat ? ['/d', '/s', '/c', `""${ruta}" ${args.join(' ')}"`] : args;
    let hijo;
    try {
      hijo = spawn(cmd, argv, { env, cwd, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true, windowsVerbatimArguments: bat, detached: process.platform !== 'win32' });
    } catch (e) {
      return fin({ error: e.message });
    }
    let salida = '';
    hijo.stdout.on('data', (d) => (salida += d));
    hijo.stderr.on('data', (d) => (salida += d));
    hijo.on('error', (e) => fin({ error: e.message }));
    hijo.on('close', (codigo) => fin({ codigo, salida }));
    const timer = setTimeout(() => {
      try {
        if (process.platform === 'win32') spawnSync(path.join(env.SystemRoot || env.SYSTEMROOT || 'C:\\Windows', 'System32', 'taskkill.exe'), ['/pid', String(hijo.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
        else process.kill(-hijo.pid, 'SIGKILL');
      } catch (e) {
        try {
          hijo.kill('SIGKILL');
        } catch (e2) {
          /* ya murió */
        }
      }
      try {
        hijo.stdout.destroy();
        hijo.stderr.destroy();
        hijo.unref();
      } catch (e) {
        /* nada */
      }
      fin({ plazo: true });
    }, plazoMs);
  });
}

// ---------------------------------------------------------------- el repo del cwd
function raizGit(desde) {
  let d = path.resolve(desde);
  for (;;) {
    if (existe(path.join(d, '.git'))) return d;
    const padre = path.dirname(d);
    if (padre === d) return null;
    d = padre;
  }
}

// ---------------------------------------------------------------- settings
function leerSettings(ruta) {
  const t = leerTexto(ruta);
  if (t === null) return { falta: true };
  const l = leerJsonSinDuplicados(t);
  if (!l.ok) return { rota: l.problema };
  if (!esMapa(l.valor)) return { rota: 'no es un objeto { … }' };
  return { valor: l.valor };
}
const textoHook = (h) => barras(`${typeof h.command === 'string' ? h.command : ''} ${Array.isArray(h.args) ? h.args.join(' ') : ''}`);
// Los hooks (de un evento) registrados bajo hooks/kit/, con su grupo.
function hooksDelKit(s, evento) {
  const out = [];
  const grupos = esMapa(s.hooks) && Array.isArray(s.hooks[evento]) ? s.hooks[evento] : [];
  for (const g of grupos) {
    if (!esMapa(g) || !Array.isArray(g.hooks)) continue;
    for (const h of g.hooks) if (esMapa(h) && I.esDelKit(h)) out.push({ grupo: g, hook: h });
  }
  return out;
}

// ---------------------------------------------------------------- los chequeos de la PC
function chNode(v = process.versions.node) {
  if (Number(v.split('.')[0]) < MIN_NODE) return res('✗', `v${v}: el kit pide ${MIN_NODE} o más`, `instalá Node ${MIN_NODE}+ (nodejs.org) y reiniciá la terminal y Claude Code`);
  return res('✓', `v${v} (pide ≥ ${MIN_NODE})`);
}

function chGitleaks(r, plazoMs) {
  if (r === 'no-esta') return res('✗', 'no está en el PATH: sin escáner, el pre-commit pasa en rojo', 'corré "preparame esta PC" con el Equipador (o instalá gitleaks ≥ 8.19 desde github.com/gitleaks/gitleaks) y reiniciá la terminal');
  if (r.plazo) return res('✗', `no respondió en ${Math.round(plazoMs / 1000)} s · causa probable: lento en frío (Defender escanea el programa la primera vez)`, 'volvé a correr doctor: la segunda vez anda en segundos; si sigue, agregá gitleaks a las exclusiones de Defender');
  if (r.error) return res('✗', `no se pudo ejecutar (${r.error})`, 'reinstalá gitleaks ≥ 8.19');
  const v = version(r.salida);
  if (r.codigo !== 0 || !v) return res('✗', 'no pude leer su versión (gitleaks version no dio un número)', 'reinstalá gitleaks ≥ 8.19');
  if (comparar(v, MIN_GITLEAKS) < 0) return res('✗', `${v.join('.')} es menor que ${MIN_GITLEAKS.replace(/\.0$/, '')} (el kit usa banderas que esa no tiene)`, 'actualizá gitleaks a 8.19 o más');
  return res('✓', `gitleaks ${v.join('.')} (pide ≥ ${MIN_GITLEAKS.replace(/\.0$/, '')})`);
}

// Dónde buscar Claude Code sin gastar: el de la terminal (`claude --version`) y los nombres de carpeta de las extensiones y de la app
// (cuestan un readdir). VS Code deja versiones viejas hasta limpiar: lo que su .obsolete marca como borrado no cuenta.
function versionesPorCarpeta(home) {
  const out = [];
  const exts = [['.vscode', 'extensión de VS Code'], ['.vscode-insiders', 'extensión de VS Code Insiders'], ['.cursor', 'extensión de Cursor'], ['.windsurf', 'extensión de Windsurf']];
  for (const [carpeta, etiqueta] of exts) {
    const dir = path.join(home, carpeta, 'extensions');
    let obsoletas = {};
    try {
      obsoletas = JSON.parse(fs.readFileSync(path.join(dir, '.obsolete'), 'utf8')) || {};
    } catch (e) {
      /* sin .obsolete */
    }
    let nombres = [];
    try {
      nombres = fs.readdirSync(dir);
    } catch (e) {
      continue;
    }
    for (const n of nombres) {
      const m = /^anthropic\.claude-code-(\d+\.\d+\.\d+)(?:-[a-z0-9_-]+)?$/i.exec(n);
      if (m && !obsoletas[n]) out.push({ v: m[1], donde: etiqueta });
    }
  }
  for (const dir of [path.join(home, 'AppData', 'Roaming', 'Claude', 'claude-code'), path.join(home, 'Library', 'Application Support', 'Claude', 'claude-code')]) {
    try {
      for (const n of fs.readdirSync(dir)) if (/^\d+\.\d+\.\d+$/.test(n)) out.push({ v: n, donde: 'app de escritorio' });
    } catch (e) {
      /* no está */
    }
  }
  return out;
}
function chClaude(home, rPath, plazoMs) {
  const hallados = versionesPorCarpeta(home);
  let nota = '';
  if (rPath !== 'no-esta') {
    const v = rPath && !rPath.plazo && !rPath.error && rPath.codigo === 0 ? version(rPath.salida) : null;
    if (v) hallados.push({ v: v.join('.'), donde: 'terminal' });
    else nota = rPath.plazo ? ` · el "claude --version" de la terminal no respondió en ${Math.round(plazoMs / 1000)} s` : ' · el "claude" de la terminal no dio su versión';
  }
  const unicos = [...new Map(hallados.map((h) => [`${h.v}|${h.donde}`, h])).values()].sort((a, b) => (a.donde < b.donde ? -1 : a.donde > b.donde ? 1 : comparar(a.v, b.v)));
  if (!unicos.length) return res('⚠', `no encontré Claude Code (terminal, extensiones de VS Code, app)${nota}`, `si lo tenés en otro lado, corré "claude --version" a mano: tiene que ser ≥ ${MIN_CLAUDE}`);
  const texto = unicos.map((h) => `${h.v} (${h.donde})`).join(', ');
  const viejas = unicos.filter((h) => comparar(h.v, MIN_CLAUDE) < 0);
  if (viejas.length) {
    return res('✗', `${lista(viejas.map((h) => `${h.v} (${h.donde})`))} < ${MIN_CLAUDE}: sin el formato de hooks que usa el kit${unicos.length > viejas.length ? ` · encontradas: ${texto}` : ''}`, 'actualizá Claude Code (terminal: claude update; VS Code: Extensiones → Claude Code → Actualizar) y reiniciá');
  }
  return res(nota ? '⚠' : '✓', `${texto} (pide ≥ ${MIN_CLAUDE})${nota}`, nota ? 'corré "claude --version" a mano para confirmar' : null);
}

function chLefthook(env, raiz) {
  const enPath = buscarEnPath('lefthook', env);
  const config = raiz ? ['lefthook.yml', 'lefthook.yaml', '.lefthook.yml', '.lefthook.yaml', 'lefthook-local.yml'].filter((f) => existe(path.join(raiz, f))) : [];
  if (!enPath && !config.length) return res('✓', 'lefthook: no está');
  const donde = [enPath ? 'está en el PATH' : null, config.length ? `el repo trae ${config[0]}` : null].filter(Boolean).join(' y ');
  return res('⚠', `lefthook ${donde}: escribe en .githooks/ y pisa el pre-commit del kit`, 'no corras "lefthook install" en repos con el kit (o desinstalalo: lefthook uninstall); si ya corrió, el chequeo pre-commit te lo dice');
}

function chGitBash(env) {
  if (process.platform !== 'win32') return res('✓', 'git-bash: no aplica (no es Windows)');
  const dirs = [env.ProgramFiles, env['ProgramFiles(x86)'], env.LOCALAPPDATA && path.join(env.LOCALAPPDATA, 'Programs')].filter(Boolean).map((d) => path.join(d, 'Git'));
  const propio = dirs.map((d) => [path.join(d, 'bin', 'bash.exe'), path.join(d, 'usr', 'bin', 'bash.exe')]).flat().find(existe);
  const enPath = buscarEnPath('bash', env);
  if (propio || enPath) return res('✓', 'git-bash: está (lo usan solo los .githooks/; los hooks del kit no lo necesitan)');
  return res('⚠', 'git-bash: no lo encontré · informativo: solo lo usan los .githooks/, y el sh de eso lo trae git', 'si los pre-commit fallan con "sh: not found", reinstalá Git for Windows');
}

function chSettings(r, s) {
  if (s.falta) return res('✗', 'no hay ~/.claude/settings.json: ningún hook de la PC está registrado', ARREGLO_INSTALAR);
  if (s.rota) return res('✗', `~/.claude/settings.json no se lee: ${s.rota}`, 'corregilo a mano (el instalador no lo toca roto) y volvé a correr doctor');
  return res('✓', '~/.claude/settings.json se lee bien');
}

function chHooks(r, s) {
  if (s.falta || s.rota) return res('✗', 'sin settings legible no se puede ver qué hooks hay (ver settings-pc)', ARREGLO_INSTALAR);
  const esperado = barras(r.secretos).toLowerCase();
  const problemas = [];
  const revisar = (evento, obligaOnFailure) => {
    const hs = hooksDelKit(s.valor, evento);
    if (!hs.length) return problemas.push(`${evento}: no está registrado`);
    if (hs.length > 1) problemas.push(`${evento}: registrado ${hs.length} veces`);
    const { grupo, hook } = hs[0];
    if (hook.command !== 'node' || !Array.isArray(hook.args) || hook.args.length !== 1) problemas.push(`${evento}: no está en forma exec (command "node" + args con la ruta)`);
    else if (barras(hook.args[0]).toLowerCase() !== esperado) problemas.push(`${evento}: apunta a otra ruta que la de esta PC`);
    if (hook.timeout !== 20) problemas.push(`${evento}: timeout ${hook.timeout === undefined ? 'ausente' : hook.timeout} y no 20`);
    if (obligaOnFailure) {
      if (hook.onFailure !== 'block') problemas.push(`${evento}: sin onFailure "block" (si el hook se rompe, no frena)`);
      if (grupo.matcher !== I.MATCHER) problemas.push(`${evento}: el matcher no es el del kit`);
    }
  };
  revisar('PreToolUse', true);
  revisar('UserPromptSubmit', false);
  if (problemas.length) return res('✗', `el corrector de la PC está mal registrado · ${lista(problemas, 6)}`, ARREGLO_INSTALAR);
  return res('✓', 'PreToolUse (block, timeout 20, exec) y UserPromptSubmit (timeout 20) registrados');
}

// INSTALADO → { kit, archivos: [[rel, sha]] } o null.
function leerInstalado(r) {
  const t = leerTexto(r.instalado);
  if (t === null) return null;
  const archivos = [];
  let kit = null;
  for (const l of t.split('\n')) {
    let m;
    if ((m = /^kit: (.*)$/.exec(l))) kit = m[1];
    else if ((m = /^([0-9a-f]{64}) {2}(.+)$/.exec(l))) archivos.push([m[2], m[1]]);
  }
  return { kit, archivos };
}
function chIguales(r) {
  const inst = leerInstalado(r);
  if (!inst) return res('✗', 'no hay hooks/kit/INSTALADO: no sé qué se instaló', ARREGLO_INSTALAR);
  const editados = [];
  const faltan = [];
  for (const [rel, h] of inst.archivos) {
    let buf = null;
    try {
      buf = fs.readFileSync(path.join(r.kit, rel));
    } catch (e) {
      /* falta */
    }
    if (!buf) faltan.push(rel);
    else if (sha(buf) !== h) editados.push(rel);
  }
  // ¿hay versión nueva? lo que viaja al lado (pc/) contra lo que dice INSTALADO
  const nuevos = [];
  const enPc = [];
  (function rec(dir, rel) {
    let es = [];
    try {
      es = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
      return;
    }
    for (const e of es) {
      const x = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) rec(path.join(dir, e.name), x);
      else if (e.isFile() && !e.name.endsWith('.test.cjs')) enPc.push(x);
    }
  })(I.PC, '');
  const instMap = new Map(inst.archivos);
  for (const rel of enPc) {
    let h = null;
    try {
      h = sha(fs.readFileSync(path.join(I.PC, rel)));
    } catch (e) {
      /* nada */
    }
    if (h && instMap.get(rel) !== h) nuevos.push(rel);
  }
  for (const rel of instMap.keys()) if (!enPc.includes(rel)) nuevos.push(rel);
  const malos = [];
  if (editados.length) malos.push(`editado a mano: ${lista(editados)} (no lo piso)`);
  if (faltan.length) malos.push(`falta: ${lista(faltan)}`);
  if (malos.length) {
    return res('✗', `los archivos instalados no son los de INSTALADO · ${malos.join(' · ')}${nuevos.length ? ' · además hay versión nueva' : ''}`, 'si la edición fue a propósito, llevala al kit (kit/skills/arquitecto-skills/pc/) en el repo madre; si no, corré el instalador (restaura lo del kit)');
  }
  if (nuevos.length) return res('⚠', `hay versión nueva del corrector (${lista(nuevos)} cambió${nuevos.length > 1 ? 'on' : ''} en el kit)`, 'corré el instalador: scripts/instalar-hooks-pc.cjs (pedile al Equipador "instalar hooks por PC")');
  return res('✓', `los ${inst.archivos.length} archivos instalados son los de INSTALADO (kit ${inst.kit || '?'}) y los de esta versión del kit`);
}

function chDeny(r, s) {
  if (s.falta || s.rota) return res('✗', 'sin settings legible no se puede ver el deny del almacén (ver settings-pc)', ARREGLO_INSTALAR);
  const deny = esMapa(s.valor.permissions) && Array.isArray(s.valor.permissions.deny) ? s.valor.permissions.deny : [];
  const esperado = I.denyAlmacen(r.home);
  if (deny.includes(esperado)) return res('✓', 'el deny de Read sobre el almacén de secretos (~/.config/kit-secretos/) está');
  const otro = deny.some((x) => typeof x === 'string' && /kit-secretos/.test(x));
  return res('✗', otro ? 'hay un deny del almacén pero apunta a otra carpeta que la de esta PC' : 'falta el deny de Read sobre ~/.config/kit-secretos/**: Claude podría leer los secretos guardados', ARREGLO_INSTALAR);
}

function archivoDeHook(h, home) {
  const piezas = [...(typeof h.command === 'string' ? h.command.match(/"[^"]*"|'[^']*'|\S+/g) || [] : []), ...(Array.isArray(h.args) ? h.args : [])];
  for (let p of piezas) {
    p = String(p).replace(/^["']|["']$/g, '');
    p = p.replace(/^~(?=[\/\\]|$)/, home).replace(/^(\$HOME|\$\{HOME\}|%USERPROFILE%|\$env:USERPROFILE)(?=[\/\\]|$)/i, home);
    if (!/[\/\\]/.test(p)) continue;
    try {
      const st = fs.statSync(p);
      if (!st.isFile() || st.size > 5 * 1024 * 1024) continue;
      if (fs.readFileSync(p, 'latin1').includes(VIEJO)) return p;
    } catch (e) {
      /* no es un archivo */
    }
  }
  return null;
}
function chViejo(r, s) {
  if (s.falta || s.rota) return res('✓', 'sin settings legible no hay anti-secretos viejo registrado (ver settings-pc)');
  const grupos = esMapa(s.valor.hooks) && Array.isArray(s.valor.hooks.PreToolUse) ? s.valor.hooks.PreToolUse : [];
  const hallados = [];
  for (const g of grupos) {
    if (!esMapa(g) || !Array.isArray(g.hooks)) continue;
    for (const h of g.hooks) {
      if (!esMapa(h) || I.esDelKit(h)) continue;
      const a = archivoDeHook(h, r.home);
      if (a) hallados.push(path.basename(a));
    }
  }
  if (!hallados.length) return res('✓', 'no hay un anti-secretos viejo registrado');
  return res('⚠', `el anti-secretos viejo sigue registrado (${lista(hallados)}) y demora cada Bash`, 'sacalo cuando confirmes que el del kit anda: node scripts/instalar-hooks-pc.cjs --sacar-viejo (el archivo queda)');
}

function chPlazo(r, env, raiz) {
  const donde = [];
  if (env[VAR_PLAZO] !== undefined) donde.push('el entorno de esta terminal');
  const archivos = [['~/.claude/settings.json', r.settings], ['~/.claude/settings.local.json', path.join(r.claude, 'settings.local.json')]];
  if (raiz) archivos.push(['.claude/settings.json del repo', path.join(raiz, '.claude', 'settings.json')], ['.claude/settings.local.json del repo', path.join(raiz, '.claude', 'settings.local.json')]);
  for (const [etiqueta, ruta] of archivos) {
    const s = leerSettings(ruta);
    if (s.valor && esMapa(s.valor.env) && Object.prototype.hasOwnProperty.call(s.valor.env, VAR_PLAZO)) donde.push(`el "env" de ${etiqueta}`);
  }
  if (donde.length) return res('✗', `${VAR_PLAZO} está puesta en ${lista(donde)}: es una palanca de pruebas, cambia el plazo del arranque y puede dejarlo sin inyección`, `sacala (unset ${VAR_PLAZO}, o borrá la clave del env) y reiniciá Claude Code`);
  return res('✓', `${VAR_PLAZO} no está puesta (el arranque usa su plazo de fábrica)`);
}

// ---------------------------------------------------------------- los chequeos del repo
function chPreCommit(raiz, gitCfg, gitleaks) {
  if (!raiz) return res('⚠', 'no estás dentro de un repo: no pude mirar el pre-commit', 'corré doctor parado en la carpeta del proyecto');
  const conFicha = existe(path.join(raiz, '.claude', 'kit.md'));
  const dir = path.join(raiz, '.githooks');
  if (!existe(dir)) {
    return conFicha
      ? res('✗', 'el repo tiene ficha pero no hay .githooks/: los commits no pasan por gitleaks', 'actualizá el proyecto al kit v3 (el Arquitecto, modo actualizar)')
      : res('⚠', 'este repo no tiene .githooks/ ni ficha: no usa el pre-commit del kit', 'si es un proyecto con el kit, actualizalo con el Arquitecto');
  }
  const falta = [];
  for (const f of [...HOOKS_GIT, 'kit-githook.cjs']) if (!existe(path.join(dir, f))) falta.push(`falta .githooks/${f}`);
  for (const f of HOOKS_GIT) {
    const t = leerTexto(path.join(dir, f));
    if (t !== null && !t.includes(`kit-githook.cjs ${f}`)) falta.push(`.githooks/${f} no es el del kit (¿lo pisó lefthook u otro?)`);
  }
  if (gitCfg === 'sin-git') falta.push('no encuentro git para leer core.hooksPath');
  else if (gitCfg.plazo) falta.push('git no respondió a tiempo al leer core.hooksPath');
  else if (gitCfg.valor !== '.githooks') falta.push(gitCfg.valor ? `core.hooksPath es "${gitCfg.valor.slice(0, 40)}" y no .githooks` : 'core.hooksPath vacío');
  if (gitleaks === 'no-esta') falta.push('sin gitleaks en esta PC');
  if (falta.length) {
    return res('✗', `pre-commit del kit incompleto · ${falta.join(' · ')}`, 'abrí Claude Code en el repo (el arranque pone core.hooksPath), restaurá .githooks/ del molde (git checkout -- .githooks) y, sin gitleaks, corré "preparame esta PC"');
  }
  return res('✓', '.githooks/ completo y es del kit, core.hooksPath=.githooks, gitleaks en el PATH');
}

// La ficha del repo, leída una vez: { sinRepo } | { sinFicha } | { rota: 'archivo:línea: motivo' } | { datos, avisos }
function leerFicha(raiz) {
  if (!raiz) return { sinRepo: true };
  const ruta = path.join(raiz, '.claude', 'kit.md');
  if (!existe(ruta)) return { sinFicha: true };
  try {
    const f = ficha.leerArchivo(ruta);
    return { datos: f.datos, avisos: f.avisos };
  } catch (e) {
    if (e && e.name === 'ErrorFicha') return { rota: `.claude/kit.md:${e.linea}: ${e.mensaje}` };
    return { rota: `.claude/kit.md: no se pudo leer (${e && e.code ? e.code : e.message})` };
  }
}
function chFicha(f) {
  if (f.sinRepo) return res('⚠', 'no estás dentro de un repo: no pude mirar la ficha', 'corré doctor parado en la carpeta del proyecto');
  if (f.sinFicha) return res('⚠', 'este repo no tiene .claude/kit.md: no es un proyecto del kit', 'si debería serlo, el Arquitecto lo adopta (modo adoptar)');
  if (f.rota) return res('✗', `la ficha está rota · ${f.rota}`, 'corregí ese renglón (la gramática es cerrada); mientras tanto el arranque y los frenos usan la ficha de fábrica');
  if (f.avisos.length) return res('⚠', `la ficha se lee, con ${f.avisos.length} aviso${f.avisos.length > 1 ? 's' : ''} · .claude/kit.md ${f.avisos[0]}`, 'revisalo: suele ser un error de tipeo');
  return res('✓', `la ficha (.claude/kit.md, kit ${f.datos.kit}) se lee bien`);
}

function existeEnRepo(token, raiz) {
  const base = token.replace(/^\.[\/\\]/, '');
  const dirs = ['', '.claude/scripts', 'scripts', 'bin', 'node_modules/.bin'];
  const exts = ['', '.cjs', '.js', '.mjs', '.sh', '.ps1', '.cmd', '.exe', '.py'];
  for (const d of dirs) for (const e of exts) if (existe(path.join(raiz, d, base + e))) return true;
  return false;
}
function chSensible(f, env, raiz) {
  if (f.sinRepo || f.sinFicha) return res('✓', 'sin ficha no hay entradas de sensible: que mirar');
  if (f.rota) return res('⚠', 'sin ficha legible no puedo mirar las entradas de sensible: (ver ficha)', 'arreglá primero la ficha');
  const sensible = esMapa(f.datos.sensible) ? f.datos.sensible : {};
  const raros = [];
  let total = 0;
  for (const [clave, v] of Object.entries(sensible)) {
    if (!Array.isArray(v)) continue;
    for (const e of v) {
      if (typeof e !== 'string' || e.startsWith('tabla:') || !e.trim()) continue;
      total++;
      const token = e.trim().split(/\s+/)[0];
      if (!buscarEnPath(token, env) && !existeEnRepo(token, raiz)) raros.push(`sensible.${clave}: "${token}"`);
    }
  }
  if (raros.length) {
    return res('⚠', `${raros.length} entrada${raros.length > 1 ? 's' : ''} de sensible: cuyo primer término no está en el PATH ni en el repo · ${lista(raros)} (¿prosa o un programa que no existe? no va a preguntar nada)`, 'escribí la entrada como el comando real (ej. "npm run release") o sacala; "tabla:<x>" no cuenta');
  }
  return res('✓', `las ${total} entradas de sensible: empiezan con un programa que existe`);
}

// ---------------------------------------------------------------- principal
function leerArgs(argv) {
  const o = { home: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--home') {
      if (!argv[i + 1]) throw new Error('--home sin carpeta');
      o.home = argv[++i];
    } else throw new Error(`no conozco "${argv[i]}"`);
  }
  return o;
}

async function principal(argv, { env = process.env, cwd = process.cwd(), plazoMs } = {}) {
  let o;
  try {
    o = leerArgs(argv);
  } catch (e) {
    return { codigo: 2, texto: `uso: doctor.cjs [--home <dir>] — ${e.message}` };
  }
  const p = (n) => (plazoMs ? Math.min(n, plazoMs) : n);
  const r = I.rutas(path.resolve(o.home || os.homedir()));
  const raiz = raizGit(cwd);

  // lo externo, en paralelo y con plazo; el orden de las líneas no depende de cuál termina primero
  const pGit = buscarEnPath('gitleaks', env);
  const pClaude = buscarEnPath('claude', env);
  const pGitBin = buscarEnPath('git', env);
  const [rGitleaks, rClaude, rCfg] = await Promise.all([
    pGit ? correrExterno(pGit, ['version'], { plazoMs: p(PLAZO_GITLEAKS), env, cwd }) : 'no-esta',
    pClaude ? correrExterno(pClaude, ['--version'], { plazoMs: p(PLAZO_CLAUDE), env, cwd }) : 'no-esta',
    raiz && pGitBin
      ? correrExterno(pGitBin, ['config', '--get', 'core.hooksPath'], { plazoMs: p(PLAZO_GIT), env, cwd: raiz }).then((x) => (x.plazo ? x : { valor: (x.salida || '').trim() }))
      : Promise.resolve(raiz ? 'sin-git' : null),
  ]);

  const s = leerSettings(r.settings);
  const f = leerFicha(raiz);
  const gl = rGitleaks === 'no-esta' ? 'no-esta' : 'hay';
  const chequeos = {
    node: () => chNode(),
    gitleaks: () => chGitleaks(rGitleaks, p(PLAZO_GITLEAKS)),
    'claude-code': () => chClaude(r.home, rClaude, p(PLAZO_CLAUDE)),
    lefthook: () => chLefthook(env, raiz),
    'git-bash': () => chGitBash(env),
    'settings-pc': () => chSettings(r, s),
    'hooks-pc': () => chHooks(r, s),
    'hooks-pc-iguales': () => chIguales(r),
    'deny-almacen': () => chDeny(r, s),
    'anti-secretos-viejo': () => chViejo(r, s),
    'plazo-arranque': () => chPlazo(r, env, raiz),
    'pre-commit': () => chPreCommit(raiz, rCfg, gl),
    ficha: () => chFicha(f),
    'sensible-prosa': () => chSensible(f, env, raiz),
  };
  const lineas = [];
  let rojos = 0;
  let avisos = 0;
  for (const id of IDS) {
    let x;
    try {
      x = chequeos[id]();
    } catch (e) {
      x = res('✗', `el chequeo falló por dentro (${e && e.message ? e.message : e})`, 'avisale a Guido: es un bug del doctor');
    }
    if (x.est === '✗') rojos++;
    if (x.est === '⚠') avisos++;
    lineas.push(`${x.est} ${id} · ${x.qué}${x.arreglo ? ` · ${x.arreglo}` : ''}`);
  }
  lineas.push(`doctor · ${IDS.length} chequeos · ${rojos} ✗ · ${avisos} ⚠${rojos ? ' · hay que arreglar los ✗' : ''}`);
  return { codigo: rojos ? 1 : 0, texto: lineas.join('\n') };
}

if (require.main === module) {
  const plazo = Number(process.env.KIT_DOCTOR_PLAZO_MS); // solo para las pruebas: achica los plazos de lo externo
  principal(process.argv.slice(2), { plazoMs: plazo > 0 ? plazo : undefined }).then(({ codigo, texto }) => {
    process.stdout.write(`${texto}\n`, () => process.exit(codigo));
  });
}

module.exports = { principal, IDS, buscarEnPath, version, comparar, chNode };
