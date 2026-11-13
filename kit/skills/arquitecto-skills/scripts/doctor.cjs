#!/usr/bin/env node
'use strict';
// doctor.cjs — el chequeo de salud de esta PC y de este repo (SPEC-paquete-3, "Instalar hooks por PC" y el `doctor` mínimo; criterio 12;
// D-8: Claude Code ≥ 2.1.295; pendiente (a) de D2.2: KIT_PLAZO_ARRANQUE_MS).
//
//   node doctor.cjs [--home <dir>]
//
// SOLO LECTURA: no escribe nada (los programas externos que corre —gitleaks, claude, git, gh, kit-sync— solo preguntan o comparan).
// Sin red o sin poder correr un externo: ⚠ "NO VERIFICADO: <por qué>", nunca ✓. Debajo de los chequeos, el inventario de frenos del repo.
// Una línea por chequeo, en orden fijo:   ✓|✗|⚠ <id> · qué · cómo se arregla
// Igual en dos corridas (ninguna hora ni tiempo en la salida). Sale 0 si no hay ningún ✗ (los ⚠ no traban) y 1 si hay alguno.
// Lo externo corre con plazo (gitleaks 60 s; claude 20 s; git 10 s) y en paralelo; el que se cuelga da su línea con la causa.
// Sin --home mira el ~/.claude/ real (solo lo lee): las pruebas SIEMPRE pasan uno falso.
// Los chequeos del repo (pre-commit, ficha, sensible-prosa) son del repo donde estás parado (el cwd).
//
// Vive en eq/scripts/ y se instala en ~/.claude/skills/arquitecto-skills/scripts/: solo hace require de ../pc/lib/, del instalador y de lib/chequeo.cjs (el tope de las skills), lib/vecinos.cjs y lib/locks.cjs,
// que viajan con él (NO del molde). Los textos de abajo son las líneas de F del arranque dichas con más detalle: tienen que coincidir.
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawn, spawnSync } = require('child_process');
const { leerJsonSinDuplicados } = require('../pc/lib/zona-propia.cjs');
const ficha = require('../pc/lib/ficha.cjs');
const FL = require('../pc/lib/frenos-log.cjs');
const I = require('./instalar-hooks-pc.cjs');
const P = require('./preparar-pc.cjs'); // una sola fuente: el generador del bloque autoMode y el lector de kit-pc.md

const MIN_NODE = 20;
const MIN_GITLEAKS = '8.19.0';
const MIN_CLAUDE = '2.1.295'; // D-8
const PLAZO_GITLEAKS = 60000; // r1-6, r2-10: 47 s en frío con Defender
const PLAZO_CLAUDE = 20000;
const PLAZO_GIT = 10000;
const PLAZO_TAGS = 20000; // git ls-remote --tags del canónico
const PLAZO_GH = 20000;
const PLAZO_SYNC = 60000;
const CANONICO = 'https://github.com/guidocameraeq/vibe-kit.git'; // KIT_REPO_CANONICO lo cambia: solo para las pruebas (sin red)
const VAR_PLAZO = 'KIT_PLAZO_ARRANQUE_MS';
const HOOKS_GIT = ['pre-commit', 'pre-merge-commit', 'pre-push'];
const IDS = ['node', 'gitleaks', 'claude-code', 'lefthook', 'git-bash', 'settings-pc', 'hooks-pc', 'hooks-pc-iguales', 'deny-almacen', 'anti-secretos-viejo', 'plazo-arranque', 'pre-commit', 'ficha', 'sensible-prosa',
  'version-kit', 'kit-sync', 'githooks', 'archivo-pc', 'credencial', 'gh-push', 'mesa-gh', 'cross-session', 'automode', 'copias-kit', 'frenos-vencidos', 'regla-tamano', 'tope-skills',
  'vecinos', 'locks'];
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
// El archivo ejecutable `nombre` en el PATH de `env` (null si no está). En Windows prueba SOLO las extensiones de PATHEXT, como
// cmd y PowerShell (h10 de 8r4, D8c: el `claude` de npm deja en la misma carpeta `claude` —un script de sh, sin extensión—,
// `claude.cmd` y `claude.ps1`; con '' primero salía el de sh, spawn daba ENOENT y el doctor decía "no dio su versión" aunque
// `claude --version` a mano daba 2.1.252: la salida de Juan). Un nombre que ya trae su extensión se prueba tal cual.
function buscarEnPath(nombre, env) {
  const deWin = String((env && env.PATHEXT) || '.COM;.EXE;.BAT;.CMD').toLowerCase().split(';').filter(Boolean);
  const exts = process.platform === 'win32' ? (path.extname(nombre) ? ['', ...deWin] : deWin) : [''];
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

// RF-13: el bash de Git. Primero el de Git for Windows (Program Files, Programs); después el PATH, salteando el de System32 (y el
// de WindowsApps): ese es el de WSL, que no ve el HOME de Windows ni corre kit-sync.sh como corresponde. Fuera de Windows, el PATH.
function bashDeGit(env) {
  if (process.platform !== 'win32') return buscarEnPath('bash', env);
  const dirs = [env.ProgramFiles, env['ProgramFiles(x86)'], env.LOCALAPPDATA && path.join(env.LOCALAPPDATA, 'Programs')].filter(Boolean).map((d) => path.join(d, 'Git'));
  const propio = dirs.map((d) => [path.join(d, 'bin', 'bash.exe'), path.join(d, 'usr', 'bin', 'bash.exe')]).flat().find(existe);
  if (propio) return propio;
  const esWsl = (d) => /[\\/](system32|sysnative|windowsapps)[\\/]?$/i.test(d.replace(/^"|"$/g, ''));
  const sinWsl = valorPath(env).split(path.delimiter).filter((d) => d && !esWsl(d)).join(path.delimiter);
  const k = Object.keys(env).find((x) => x.toUpperCase() === 'PATH') || 'PATH';
  return buscarEnPath('bash', { ...env, [k]: sinWsl });
}

function chGitBash(env) {
  if (process.platform !== 'win32') return res('✓', 'git-bash: no aplica (no es Windows)');
  if (bashDeGit(env)) return res('✓', 'git-bash: está (lo usan solo los .githooks/; los hooks del kit no lo necesitan)');
  return res('⚠', 'git-bash: no lo encontré · informativo: solo lo usan los .githooks/, y el sh de eso lo trae git', 'si los pre-commit fallan con "sh: not found", reinstalá Git for Windows');
}

function chSettings(r, s) {
  if (s.falta) return res('✗', 'no hay ~/.claude/settings.json: ningún hook de la PC está registrado', ARREGLO_INSTALAR);
  if (s.rota) return res('✗', `~/.claude/settings.json no se lee: ${s.rota}`, 'corregilo a mano (el instalador no lo toca roto) y volvé a correr doctor');
  return res('✓', '~/.claude/settings.json se lee bien');
}

const PLAZO_PRE = I.hookPre({ secretos: '' }).timeout;
const PLAZO_PROMPT = I.hookPrompt({ secretos: '' }).timeout;
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
    const plazo = evento === 'PreToolUse' ? PLAZO_PRE : PLAZO_PROMPT; // 8d A5.3: el de instalar-hooks-pc (una sola fuente)
    if (hook.timeout !== plazo) problemas.push(`${evento}: timeout ${hook.timeout === undefined ? 'ausente' : hook.timeout} y no ${plazo}`);
    if (obligaOnFailure) {
      if (hook.onFailure !== 'block') problemas.push(`${evento}: sin onFailure "block" (si el hook se rompe, no frena)`);
      if (grupo.matcher !== I.MATCHER) problemas.push(`${evento}: el matcher no es el del kit`);
    }
  };
  revisar('PreToolUse', true);
  revisar('UserPromptSubmit', false);
  if (problemas.length) return res('✗', `el corrector de la PC está mal registrado · ${lista(problemas, 6)}`, ARREGLO_INSTALAR);
  return res('✓', `PreToolUse (block, timeout ${PLAZO_PRE}, exec) y UserPromptSubmit (timeout ${PLAZO_PROMPT}) registrados`);
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

// ---------------------------------------------------------------- los chequeos completos (SPEC-paquete-6 P2.3)
const nv = (porQue, arreglo) => res('⚠', `NO VERIFICADO: ${porQue}`, arreglo);
const unaLinea = (t) => String(t || '').split(/\r?\n/).map((x) => x.trim()).find(Boolean) || '';
const recorte = (t, n = 80) => (t.length > n ? `${t.slice(0, n - 1)}…` : t);
// Por qué no se pudo correr un externo (o null si corrió)
const noCorrio = (x) => (x === 'sin-git' ? 'no hay git en el PATH' : x && x.plazo ? 'no respondió a tiempo (¿sin red?)' : x && x.error ? `no se pudo ejecutar (${recorte(x.error)})` : null);

// "3.0", "v3.0.1", "2.4.3", "v3.0.0-rc.1" → la versión entera "N.N.N[-rc.N]" (lo que falta es 0: v3.0 = 3.0.0) o null
function verKit(t) {
  const m = /^v?(\d+)\.(\d+)(?:\.(\d+))?(?:-rc\.(\d+))?(?![\w.-])/.exec(String(t).trim());
  if (!m) return null;
  const v = `${m[1]}.${m[2]}.${m[3] || 0}${m[4] === undefined ? '' : `-rc.${m[4]}`}`;
  return ficha.RE_VERSION.test(v) ? v : null;
}
// El último tag v* ANOTADO de un `git ls-remote --tags` (un anotado trae además su línea "^{}"): { tag, v } o null.
function ultimoTagAnotado(salida) {
  const anotados = new Set();
  for (const l of String(salida).split(/\r?\n/)) {
    const m = /\trefs\/tags\/(\S+?)\^\{\}$/.exec(l);
    if (m && /^v\d/.test(m[1])) anotados.add(m[1]);
  }
  let mejor = null;
  for (const tag of anotados) {
    const v = verKit(tag);
    if (v && (!mejor || ficha.compararVersiones(v, mejor.v) > 0)) mejor = { tag, v };
  }
  return mejor;
}
function chVersionKit(r, ls) {
  const t = leerTexto(path.join(r.claude, 'VERSION'));
  const inst = t === null ? null : verKit(unaLinea(t));
  if (!inst) return res('✗', t === null ? 'no hay ~/.claude/VERSION: no sé qué versión del kit está instalada' : '~/.claude/VERSION no trae una versión (x.y.z)', 'corré "preparame esta PC" con el Equipador');
  const por = noCorrio(ls);
  if (por) return nv(`no pude leer los tags del canónico: ${por}`, 'volvé a correr doctor con red');
  if (ls.codigo !== 0) return nv(`git ls-remote falló (${recorte(unaLinea(ls.salida)) || `código ${ls.codigo}`})`, 'revisá la red y que git tenga acceso al repo canónico, y volvé a correr doctor');
  const ult = ultimoTagAnotado(ls.salida);
  if (!ult) return nv('el canónico no trae ningún tag anotado v*', 'volvé a correr doctor cuando el canónico tenga su tag');
  const iv = inst;
  const cmp = ficha.compararVersiones(inst, ult.v);
  if (cmp < 0) return res('⚠', `el kit instalado es ${iv} y el último tag del canónico es ${ult.tag}`, 'atrás: decile al Equipador "actualizate"');
  return res('✓', cmp === 0 ? `el kit instalado (${iv}) es el del último tag (${ult.tag})` : `el kit instalado (${iv}) es más nuevo que el último tag (${ult.tag})`);
}

const esVibeKit = (raiz) => !!raiz && existe(path.join(raiz, '.claude', 'scripts', 'kit-sync.sh')) && existe(path.join(raiz, 'kit', 'VERSION'));
function chKitSync(raiz, x) {
  if (!esVibeKit(raiz)) return res('✓', 'no aplica (no estás parado en vibe-kit)');
  if (x === 'sin-bash') return nv('no encuentro bash para correr kit-sync.sh', 'instalá Git for Windows (trae bash) y volvé a correr doctor');
  const por = noCorrio(x);
  if (por) return nv(`kit-sync.sh ${por}`, 'corré "bash .claude/scripts/kit-sync.sh" a mano');
  if (x.codigo === 0 && /LIMPIO/.test(x.salida)) return res('✓', 'kit ↔ ~/.claude: LIMPIO');
  const ls = String(x.salida).split(/\r?\n/);
  const sucia = ls.find((l) => /^✗ /.test(l)) || ls.find((l) => /^⚠/.test(l)) || unaLinea(x.salida);
  return res('✗', `kit ↔ ~/.claude no está limpio · ${recorte(sucia.trim(), 100)}`, 'mirá el diff con "bash .claude/scripts/kit-sync.sh"; si lo bueno es kit/, sincronizá con "bash .claude/scripts/kit-sync.sh sync"');
}

function chGithooks(raiz, gitCfg) {
  if (!raiz || !existe(path.join(raiz, '.githooks'))) return res('✓', 'el repo no tiene .githooks/ (nada que activar)');
  if (gitCfg === 'sin-git') return nv('no encuentro git para leer core.hooksPath', 'instalá git y volvé a correr doctor');
  if (gitCfg.plazo) return nv('git no respondió a tiempo al leer core.hooksPath', 'volvé a correr doctor');
  if (gitCfg.valor === '.githooks') return res('✓', 'el repo trae .githooks/ y core.hooksPath=.githooks');
  return res('⚠', `el repo trae .githooks/ y core.hooksPath ${gitCfg.valor ? `es "${gitCfg.valor.slice(0, 40)}"` : 'no está puesto'}: los githooks no corren`, 'git config core.hooksPath .githooks');
}

// La carpeta que dice la línea del SKILL.md del Arquitecto instalado (null si está el lugar vacío o no hay línea)
function carpetaDelArquitecto(r) {
  const t = leerTexto(path.join(r.claude, 'skills', 'arquitecto', 'SKILL.md'));
  const l = t === null ? null : t.split(/\r?\n/).find((x) => x.startsWith('**Carpeta de proyectos de esta máquina**'));
  const m = l ? /`([^`]*)`/.exec(l) : null;
  return m && m[1] && m[1] !== '{{CARPETA_DE_PROYECTOS}}' ? m[1] : null;
}
const sinBarraFinal = (p) => barras(p).replace(/\/+$/, '');
function chArchivoPc(r, kp) {
  if (kp.falta) return res('⚠', 'no hay ~/.claude/kit-pc.md: esta PC no pasó por "preparame"', 'corré "preparame esta PC" con el Equipador');
  if (kp.rota) return res('⚠', `~/.claude/kit-pc.md no se lee: ${kp.rota}`, 'corré "preparame esta PC" con el Equipador (lo reescribe)');
  const a = kp.datos.proyectos ? sinBarraFinal(kp.datos.proyectos) : null;
  const b = carpetaDelArquitecto(r);
  const bb = b ? sinBarraFinal(b) : null;
  const igual = a === bb || (a && bb && process.platform === 'win32' && a.toLowerCase() === bb.toLowerCase());
  if (!igual) return res('⚠', `la carpeta de proyectos de kit-pc.md (${a || 'ninguna'}) no es la del SKILL.md del Arquitecto (${bb || 'ninguna'})`, 'corré "preparame esta PC" con el Equipador');
  return res('✓', `kit-pc.md se lee y su carpeta de proyectos${a ? '' : ' (ninguna)'} es la del SKILL.md del Arquitecto`);
}

function chCredencial(kp, env, x) {
  if (kp.falta || kp.rota || !kp.datos.privada) return res('✓', 'no aplica (no hay capa privada declarada)');
  if (x === 'sin-instalar') return res('⚠', 'la capa privada no trae instalar.cjs: no sé qué variables pide', 'revisá la carpeta privada de kit-pc.md o corré "preparame esta PC"');
  const por = noCorrio(x);
  if (por) return nv(`instalar.cjs --variables ${por}`, 'corré "node <capa privada>/instalar.cjs --variables" a mano');
  if (x.codigo !== 0) return nv(`instalar.cjs --variables falló (código ${x.codigo})`, 'corré "node <capa privada>/instalar.cjs --variables" a mano');
  const nombres = x.salida.split(/\r?\n/).map((l) => l.trim()).filter((l) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(l));
  const faltan = nombres.filter((n) => !env[n]);
  if (faltan.length) return res('⚠', `falta${faltan.length > 1 ? 'n' : ''} ${faltan.length} variable${faltan.length > 1 ? 's' : ''} de la capa privada · ${lista(faltan)}`, 'cargalas como variables de entorno del sistema (cargar-secreto) y reiniciá la terminal');
  return res('✓', `las ${nombres.length} variables de la capa privada existen (no se imprime su valor)`);
}

function repoGh(url) {
  const m = /github\.com[:/]+([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?\s*$/i.exec(String(url || '').trim());
  return m ? `${m[1]}/${m[2]}` : null;
}
// Una respuesta de `gh` → { ok, valor } | { sinAcceso } | { login } | { nv: 'por qué' }
function juzgarGh(x) {
  if (x === 'sin-gh') return { nv: 'gh no está en el PATH' };
  const por = noCorrio(x);
  if (por) return { nv: `gh ${por}` };
  if (x.codigo === 0) return { ok: true, valor: unaLinea(x.salida) };
  if (/HTTP 40[34]|Not Found|Forbidden|Could not resolve to a Repository/i.test(x.salida)) return { sinAcceso: true };
  if (/gh auth login|not logged|authentication required/i.test(x.salida)) return { login: true };
  return { nv: `gh falló (${recorte(unaLinea(x.salida)) || `código ${x.codigo}`})` };
}
// El remoto → { sinRepo } | { sinOrigin } | { noGithub } | { repo } | { nv }
function juzgarOrigen(raiz, x) {
  if (!raiz) return { sinRepo: true };
  if (x === 'sin-git') return { nv: 'no hay git en el PATH' };
  if (x.plazo || x.error) return { nv: 'git no respondió' };
  if (x.codigo !== 0) return { sinOrigin: true };
  const repo = repoGh(x.salida);
  return repo ? { repo } : { noGithub: true };
}
function chGhPush(o, gh) {
  if (o.sinRepo) return res('⚠', 'no estás dentro de un repo: no pude mirar si podés pushear', 'corré doctor parado en la carpeta del proyecto');
  if (o.nv) return nv(o.nv, 'volvé a correr doctor');
  if (o.sinOrigin) return res('⚠', 'el repo no tiene remoto origin: no hay a dónde pushear', 'git remote add origin <url> (o ignoralo si es un repo local)');
  if (o.noGithub) return res('✓', 'no aplica (origin no es de GitHub)');
  const j = juzgarGh(gh);
  if (j.nv) return nv(j.nv, 'instalá gh y corré "gh auth login"; con red, volvé a correr doctor');
  if (j.login) return res('⚠', 'gh no está logueado', 'gh auth login');
  if (j.sinAcceso) return res('⚠', `gh no ve ${o.repo}: sin acceso al repo de origin`, `pedí acceso a ${o.repo} o corré "gh auth login" con la cuenta que lo tiene`);
  if (j.valor === 'true') return res('✓', `gh está logueado y puede pushear a ${o.repo}`);
  return res('⚠', `gh no te deja pushear a ${o.repo} (permissions.push=${recorte(j.valor || 'vacío', 20)})`, 'pedí permiso de escritura o pusheá por un fork');
}

// Los remotos de la mesa que se leen por git (los de transporte buzón no tienen repo)
const mesaGit = (f) => (f.datos && esMapa(f.datos.mesa) ? Object.entries(f.datos.mesa).filter(([, v]) => !(esMapa(v) && v.transporte === 'buzon')).map(([alias]) => alias).sort() : []);
function chMesaGh(f, filas) {
  if (f.sinRepo || f.sinFicha) return res('✓', 'sin ficha no hay mesa que mirar');
  if (f.rota) return nv('la ficha del repo está rota, no sé qué mesa tiene', 'arreglá primero la ficha');
  if (!filas.length) return res('✓', 'la ficha no tiene mesa con repos que leer por gh');
  const aprueba = typeof f.datos.aprueba === 'string' && f.datos.aprueba.trim() ? f.datos.aprueba : 'quien aprueba';
  const sin = [];
  const noVer = [];
  const ajenos = []; // RF-14: un remoto que no es de GitHub no se puede mirar por gh: no es ✓
  for (const { alias, o, gh } of filas) {
    if (o.nv) noVer.push(`${alias}: ${o.nv}`);
    else if (o.noGithub) ajenos.push(`${alias}: el remoto no es de GitHub, no lo pude mirar`);
    else if (o.sinOrigin || o.sinRepo) sin.push(`${alias}: falta el remoto "${alias}" (git remote add ${alias} <url>)`);
    else if (o.repo) {
      const j = juzgarGh(gh);
      if (j.nv) noVer.push(`${alias}: ${j.nv}`);
      else if (j.login) noVer.push(`${alias}: gh no está logueado`);
      else if (j.sinAcceso) sin.push(`${alias}: gh no lee ${o.repo}`);
    }
  }
  if (sin.length) return res('⚠', `la mesa no se lee por gh · ${lista(sin)}`, `pedile acceso a ${aprueba} (y "git remote add" lo que falte)`);
  if (noVer.length) return nv(lista(noVer), 'instalá gh, corré "gh auth login" y, con red, volvé a correr doctor');
  if (ajenos.length) return res('⚠', lista(ajenos), 'miralo a mano (o pasá ese remoto a GitHub)');
  return res('✓', `gh lee los ${filas.length} repos de la mesa`);
}

function chCross(s) {
  if (s.falta || s.rota) return res('⚠', 'sin settings legible no se puede ver crossSessionInbound (ver settings-pc)', 'corré "preparame esta PC" con el Equipador');
  const v = s.valor.crossSessionInbound;
  if (v === 'accept') return res('✓', 'crossSessionInbound = accept (la mesa entre sesiones entra)');
  return res('⚠', `crossSessionInbound ${v === undefined ? 'no está puesto' : `dice "${String(v).slice(0, 20)}"`} y no "accept": los mensajes entre sesiones no entran`, 'corré "preparame esta PC" (lo pone si falta; si dice otra cosa, lo decidís vos)');
}

const mismaLista = (a, b) => (a === undefined || b === undefined ? a === b : a.length === b.length && a.every((x, i) => x === b[i]));
function chAutomode(s, kp) {
  if (s.falta || s.rota) return nv('no hay settings legible (ver settings-pc)', 'corré "preparame esta PC" con el Equipador');
  if (kp.falta || kp.rota) return nv('sin kit-pc.md no sé qué entradas del autoMode son del kit (ver archivo-pc)', 'corré "preparame esta PC" con el Equipador');
  const am = esMapa(s.valor.autoMode) ? s.valor.autoMode.environment : undefined;
  if (am !== undefined && !(Array.isArray(am) && am.every((x) => typeof x === 'string'))) return res('⚠', 'autoMode.environment no es una lista de textos', 'corregilo a mano; "preparame esta PC" no lo toca roto');
  const gen = P.generarAutoMode(kp.datos.proyectos, kp.datos.publica || []);
  const m = P.mezclarAutoMode(am, kp.datos.autoMode, gen.entradas);
  const n = gen.entradas.length;
  if (!mismaLista(m.lista, am)) return res('⚠', `el bloque autoMode no es el que generan las fichas de hoy (${n} entrada${n === 1 ? '' : 's'} generada${n === 1 ? '' : 's'})`, 'una ficha cambió: corré "preparame esta PC" con el Equipador');
  if (am !== undefined && m.sinDefaults) return res('⚠', 'autoMode.environment no trae "$defaults": reemplaza los defaults de Claude Code (Trusted repo, Source control)', 'corré "preparame esta PC" o ponelo primero a mano');
  if (gen.avisos.length) return res('⚠', `el bloque autoMode coincide, pero ${gen.avisos[0]}`, 'revisá esa ficha o la carpeta de proyectos de kit-pc.md');
  // 8d C2.3: un repo cuya ficha vigente publica y esta PC no lo autorizó, o cambió cómo publica (la huella): la noche no publica
  const pub = P.quePublican(kp.datos.proyectos);
  const sinSi = pub.filter((c) => !(kp.datos.publica || []).some((x) => x.origin === c.origin));
  const cambio = pub.filter((c) => (kp.datos.publica || []).some((x) => x.origin === c.origin && x.huella !== c.huella));
  if (sinSi.length || cambio.length) {
    const que = [...sinSi.map((c) => `${c.proyecto} publica y esta PC no lo autorizó`), ...cambio.map((c) => `${c.proyecto} cambió cómo publica`)];
    return res('⚠', `el bloque autoMode coincide, pero ${lista(que)}: la noche no publica ahí`, 'corré "preparame esta PC": te pregunta repo por repo');
  }
  return res('✓', `el bloque autoMode es el que generan las fichas (${n} entrada${n === 1 ? '' : 's'} del kit)`);
}

function chCopias(kp) {
  if (kp.falta || kp.rota || !kp.datos.proyectos) return nv('sin la carpeta de proyectos en kit-pc.md no sé dónde mirar (ver archivo-pc)', 'corré "preparame esta PC" con el Equipador');
  let dirs;
  try {
    dirs = fs.readdirSync(kp.datos.proyectos, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
  } catch (e) {
    return nv(`no encuentro la carpeta de proyectos ${barras(kp.datos.proyectos)}`, 'revisá kit-pc.md o corré "preparame esta PC"');
  }
  const copias = [];
  for (const d of dirs) for (const sk of ['arquitecto', 'arquitecto-skills']) if (existe(path.join(kp.datos.proyectos, d, '.claude', 'skills', sk))) copias.push(`${d}/.claude/skills/${sk}`);
  if (copias.length) return res('⚠', `${copias.length} copia${copias.length > 1 ? 's' : ''} de las skills globales dentro de proyectos · ${lista(copias)}`, 'borralas del repo: la skill global es una sola');
  return res('✓', `ninguno de los ${dirs.length} repos de la carpeta de proyectos trae copias del Arquitecto ni del Equipador`);
}

const fechaLocal = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function chFrenosVencidos(f, hoy) {
  if (f.sinRepo || f.sinFicha) return res('✓', 'sin ficha no hay frenos quitados que vencer');
  if (f.rota) return nv('la ficha está rota, no sé qué frenos se quitaron (ver ficha)', 'arreglá primero la ficha');
  const q = esMapa(f.datos.frenos) && Array.isArray(f.datos.frenos.quitados) ? f.datos.frenos.quitados : [];
  const malos = [];
  for (const x of q) {
    if (!esMapa(x)) continue;
    if (typeof x.hasta !== 'string' || !x.hasta) malos.push(`${x.id} (sin hasta:)`);
    else if (x.hasta !== 'siempre' && /^\d{4}-\d{2}-\d{2}$/.test(x.hasta) && x.hasta < hoy) malos.push(`${x.id} (venció ${x.hasta})`);
  }
  if (malos.length) return res('⚠', `${malos.length} freno${malos.length > 1 ? 's' : ''} quitado${malos.length > 1 ? 's' : ''} vencido${malos.length > 1 ? 's' : ''} · ${lista(malos)}`, '¿lo restauro o lo hago permanente? (sacalo de frenos.quitados, o poné hasta: siempre con su razón)');
  return res('✓', `${q.length} freno${q.length === 1 ? '' : 's'} quitado${q.length === 1 ? '' : 's'}, ninguno vencido`);
}

// D8r.4 (S), "que avise, no que frene" (Guido, 2026-11-04): el tope de la línea 4 del actualizador, medido acá. Mira las skills del
// repo que traen la zona propia del molde (<!-- kit:propio -->; una skill propia del proyecto, sin marcas, no tiene tope). Nunca ✗:
// un ⚠ por skill que pasa su tope. La medida es la de chequeo.cjs (una sola fuente), que viaja con el doctor en scripts/lib/.
function chTopeSkills(raiz, f) {
  if (!raiz || f.sinRepo || f.sinFicha) return res('✓', 'sin ficha no hay skills del kit que medir');
  const Q = require('./lib/chequeo.cjs');
  const dir = path.join(raiz, '.claude', 'skills');
  let nombres;
  try {
    nombres = fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
  } catch (e) {
    return res('✓', 'el repo no trae .claude/skills/');
  }
  const out = [];
  let medidas = 0;
  for (const n of nombres) {
    let b;
    try {
      b = fs.readFileSync(path.join(dir, n, 'SKILL.md'));
    } catch (e) {
      continue;
    }
    if (!b.toString('utf8').includes('<!-- kit:propio -->')) continue;
    medidas++;
    const p = Q.pesoSkill(b);
    const tope = Q.topeSkill(n);
    if (p.kit > tope) out.push(res('⚠', `${n}: ${p.total} B, pasa su tope (${tope}) sin contar su zona propia (${p.kit} B del kit)`, 'eso es del kit, no tuyo: avisale a Guido (la flota da ROTA)'));
    else if (p.total > tope) out.push(res('⚠', `${n}: ${p.total} B, ${p.total - tope} de más por su zona propia (tope ${tope})`, 'mové a un anexo lo propio que no hace falta siempre, nunca lo de producción'));
  }
  if (out.length) return out;
  return res('✓', medidas ? `las ${medidas} skills del kit del repo caben en su tope (${Q.TOPE_SKILL} B; el /inicio, ${Q.TOPES_SKILL.inicio})` : 'el repo no trae skills del kit');
}

function chReglaTamano(raiz, f) {
  if (!raiz || f.sinRepo || f.sinFicha) return res('✓', 'sin ficha no hay regla del tamaño que pedir');
  const t = leerTexto(path.join(raiz, 'CLAUDE.md'));
  if (t !== null && /^#{1,6}[ \t]+El tamaño del pedido[ \t]*$/m.test(t.replace(/\r\n/g, '\n'))) return res('✓', 'el CLAUDE.md del repo trae la sección "El tamaño del pedido"');
  return res('⚠', t === null ? 'el repo no tiene CLAUDE.md con la sección "El tamaño del pedido"' : 'el CLAUDE.md del repo no trae la sección "El tamaño del pedido"', 'el actualizador no toca el CLAUDE.md: pegala del molde (kit/molde/CLAUDE.md)');
}

// 8c u4 + h6 (8r4, con rt-9): lo que queda fuera del repo, parado en un proyecto. Un ⚠ por vecino, nunca ✗; git worktree remove
// solo para las mezcladas (lo dice vecinos.cjs). Solo lee: ni borra ni hace prune.
function chVecinos(raiz, hayGit) {
  if (!raiz) return res('✓', 'fuera de un repo no hay vecinos que mirar');
  if (!hayGit) return nv('no hay git en el PATH: no miré los worktrees de afuera', 'instalá Git y volvé a correr doctor');
  const V = require('./lib/vecinos.cjs');
  const v = V.vecinos(raiz);
  if (v.error) return nv(`no pude mirar los worktrees (${v.error})`, 'corré "git worktree list" a mano');
  const ls = V.lineas(v);
  if (!ls.length) return res('✓', 'ningún worktree fuera de .claude/worktrees/ ni carpetas gate-* al lado del repo');
  return ls.map((l, i) => res('⚠', l.trim(), i === 0 ? 'lo decide Guido, uno por uno (el doctor no borra nada)' : null));
}

// 8c p1 (a): el lock del proyecto atrasado, leído (D8c-9: nunca corre el instalador). Un ⚠ por lock, nunca ✗; nada lo arregla solo.
function chLocks(raiz, f) {
  if (!raiz) return res('✓', 'fuera de un repo no hay locks que mirar');
  const LK = require('./lib/locks.cjs');
  const setup = f && f.datos && esMapa(f.datos.vars) && typeof f.datos.vars['comando-setup'] === 'string' ? f.datos.vars['comando-setup'] : '';
  const ls = LK.lineas(LK.mirarLocks(raiz, { setup }));
  if (!ls.length) return res('✓', 'los locks de npm, pnpm y yarn coinciden con sus package.json (o el repo no trae package.json)');
  return ls.map((l) => res('⚠', l));
}

// ---------------------------------------------------------------- el inventario de frenos (A §9; D6-9). Nunca cambia la salida.
// La lista de fábrica = las 5 preguntas de A (sus ids); lo demás aparece cuando frenó. Sin fechas ni horas en la salida.
const PREGUNTAS_FABRICA = ['pregunta:borrar-datos-reales', 'pregunta:claves', 'pregunta:plata', 'pregunta:release', 'pregunta:sale-afuera'];
const ASK_DEL_MOLDE = ['Bash(node .claude/scripts/cambios.cjs aprobar:*)', 'PowerShell(node .claude/scripts/cambios.cjs aprobar:*)'];
const REPETIDO_MS = 10 * 60 * 1000;
const claseDe = (id) => (id.startsWith('pregunta:') || id.startsWith('hook:sensible/') ? 'pregunta' : 'corrector');
// frenos.log: "<fecha> · <rol> · <rama> · <id> · <herramienta> · <detalle>" (frenos-log.cjs del molde) → [{ t, rama, id, detalle }]
function leerFrenos(raiz) {
  // 8d A6: los dos lugares, el versionado (la firma) y el común (<git común>/kit-frenos.log: lo de todos los días)
  const t = FL.leerTodo(raiz);
  if (!t) return [];
  const out = [];
  for (const l of t.replace(/^﻿/, '').split(/\r?\n/)) {
    const c = l.split(' · ');
    if (c.length < 6) continue;
    const ms = Date.parse(c[0]);
    if (Number.isNaN(ms) || !c[3]) continue;
    out.push({ t: ms, rama: c[2], id: c[3], detalle: c.slice(5).join(' · ') });
  }
  return out;
}
function inventario(raiz, f) {
  if (!raiz || f.sinRepo || f.sinFicha || f.rota) return [];
  const eventos = leerFrenos(raiz).sort((a, b) => a.t - b.t);
  const lineas = [];
  if (!eventos.length) lineas.push('inventario · sin frenadas');
  else {
    const filas = new Map(PREGUNTAS_FABRICA.map((id) => [id, { frenó: 0, molestó: 0 }]));
    const ultimo = new Map(); // [id, rama, detalle] → la última vez
    for (const e of eventos) {
      if (!filas.has(e.id)) filas.set(e.id, { frenó: 0, molestó: 0 });
      const fila = filas.get(e.id);
      fila.frenó++;
      const clave = JSON.stringify([e.id, e.rama, e.detalle]);
      if (claseDe(e.id) === 'pregunta') fila.molestó++;
      else if (ultimo.has(clave) && e.t - ultimo.get(clave) <= REPETIDO_MS) fila.molestó++;
      ultimo.set(clave, e.t);
    }
    for (const id of [...filas.keys()].sort()) lineas.push(`inventario · ${id} · ${claseDe(id)} · frenó ${filas.get(id).frenó} · molestó ${filas.get(id).molestó}`);
  }
  const s = leerSettings(path.join(raiz, '.claude', 'settings.json'));
  const ask = s.valor && esMapa(s.valor.permissions) && Array.isArray(s.valor.permissions.ask) ? s.valor.permissions.ask : [];
  for (const regla of [...new Set(ask.filter((x) => typeof x === 'string' && !ASK_DEL_MOLDE.includes(x)))].sort()) {
    lineas.push(`inventario · ask propia · ${regla.replace(/\s+/g, ' ')} · no está en las 5 de A: ¿pregunta o corrector?`);
  }
  return lineas;
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

async function principal(argv, { env = process.env, cwd = process.cwd(), plazoMs, hoy = fechaLocal() } = {}) {
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
  const pBash = bashDeGit(env);
  const pGh = buscarEnPath('gh', env);
  const f = leerFicha(raiz);
  const kp = P.leerKitPc(r.home);
  const envGit = { ...env, GIT_TERMINAL_PROMPT: '0' };
  const git = (args, plazo) => (pGitBin ? correrExterno(pGitBin, args, { plazoMs: p(plazo), env: envGit, cwd: raiz || cwd }) : Promise.resolve('sin-git'));
  const gh = (args) => (pGh ? correrExterno(pGh, args, { plazoMs: p(PLAZO_GH), env: envGit, cwd: raiz || cwd }) : Promise.resolve('sin-gh'));
  // el remoto → el repo de GitHub → lo que dice gh (cada cadena por su lado, todas en paralelo)
  const cadena = async (remoto, argsGh) => {
    const o = juzgarOrigen(raiz, raiz ? await git(['remote', 'get-url', remoto], PLAZO_GIT) : null);
    return { o, gh: o.repo ? await gh(argsGh(o.repo)) : null };
  };
  const instalarPrivada = kp.datos && kp.datos.privada ? path.join(kp.datos.privada, 'instalar.cjs') : null;
  const [rGitleaks, rClaude, rCfg, rTags, rSync, rPush, rMesa, rCred] = await Promise.all([
    pGit ? correrExterno(pGit, ['version'], { plazoMs: p(PLAZO_GITLEAKS), env, cwd }) : 'no-esta',
    pClaude ? correrExterno(pClaude, ['--version'], { plazoMs: p(PLAZO_CLAUDE), env, cwd }) : 'no-esta',
    raiz && pGitBin
      ? correrExterno(pGitBin, ['config', '--get', 'core.hooksPath'], { plazoMs: p(PLAZO_GIT), env, cwd: raiz }).then((x) => (x.plazo ? x : { valor: (x.salida || '').trim() }))
      : Promise.resolve(raiz ? 'sin-git' : null),
    git(['ls-remote', '--tags', env.KIT_REPO_CANONICO || CANONICO], PLAZO_TAGS),
    esVibeKit(raiz)
      ? pBash
        ? correrExterno(pBash, [path.join(raiz, '.claude', 'scripts', 'kit-sync.sh')], { plazoMs: p(PLAZO_SYNC), env: { ...env, HOME: r.home, USERPROFILE: r.home, CLAUDE_PROJECT_DIR: raiz }, cwd: raiz })
        : Promise.resolve('sin-bash')
      : Promise.resolve(null),
    raiz ? cadena('origin', (repo) => ['api', `repos/${repo}`, '--jq', '.permissions.push']) : Promise.resolve({ o: { sinRepo: true }, gh: null }),
    Promise.all((f.datos ? mesaGit(f) : []).map(async (alias) => ({ alias, ...(await cadena(alias, (repo) => ['api', `repos/${repo}`, '--jq', '.full_name'])) }))),
    instalarPrivada ? (existe(instalarPrivada) ? correrExterno(process.execPath, [instalarPrivada, '--variables'], { plazoMs: p(PLAZO_GIT * 2), env, cwd: kp.datos.privada }) : Promise.resolve('sin-instalar')) : Promise.resolve(null),
  ]);

  const s = leerSettings(r.settings);
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
    'version-kit': () => chVersionKit(r, rTags),
    'kit-sync': () => chKitSync(raiz, rSync),
    githooks: () => chGithooks(raiz, rCfg),
    'archivo-pc': () => chArchivoPc(r, kp),
    credencial: () => chCredencial(kp, env, rCred),
    'gh-push': () => chGhPush(rPush.o, rPush.gh),
    'mesa-gh': () => chMesaGh(f, rMesa),
    'cross-session': () => chCross(s),
    automode: () => chAutomode(s, kp),
    'copias-kit': () => chCopias(kp),
    'frenos-vencidos': () => chFrenosVencidos(f, hoy),
    'regla-tamano': () => chReglaTamano(raiz, f),
    'tope-skills': () => chTopeSkills(raiz, f),
    vecinos: () => chVecinos(raiz, !!pGitBin),
    locks: () => chLocks(raiz, f),
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
    for (const y of Array.isArray(x) ? x : [x]) { // tope-skills, vecinos y locks: un ⚠ por cosa
      if (y.est === '✗') rojos++;
      if (y.est === '⚠') avisos++;
      lineas.push(`${y.est} ${id} · ${y.qué}${y.arreglo ? ` · ${y.arreglo}` : ''}`);
    }
  }
  lineas.push(`doctor · ${IDS.length} chequeos · ${rojos} ✗ · ${avisos} ⚠${rojos ? ' · hay que arreglar los ✗' : ''}`);
  try {
    lineas.push(...inventario(raiz, f));
  } catch (e) {
    lineas.push('inventario · no se pudo armar (bug del doctor)');
  }
  return { codigo: rojos ? 1 : 0, texto: lineas.join('\n') };
}

if (require.main === module) {
  const plazo = Number(process.env.KIT_DOCTOR_PLAZO_MS); // solo para las pruebas: achica los plazos de lo externo
  principal(process.argv.slice(2), { plazoMs: plazo > 0 ? plazo : undefined }).then(({ codigo, texto }) => {
    process.stdout.write(`${texto}\n`, () => process.exit(codigo));
  });
}

module.exports = { principal, IDS, buscarEnPath, bashDeGit, version, comparar, chNode, ultimoTagAnotado, inventario, leerFrenos };
