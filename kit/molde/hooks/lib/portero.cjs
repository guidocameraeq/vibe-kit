'use strict';
// portero.cjs — los tres frenos del proyecto en UN proceso (SPEC-paquete-8d A5, D8d-8, D8d-9, rt-9; tracker 42 y 25). PreToolUse
// sobre Bash y PowerShell: lee la entrada una vez, se pone UN plazo y llama a `decidir` de niega-aprobar, git-seguro y sensible, en
// ese orden; corta en el primer deny; si no, devuelve el primer ask; si no, nada. Antes: tres procesos por comando, con 20 s cada
// uno (12 cuelgues inocentes en dos noches). Los tres hooks SIGUEN ANDANDO SOLOS (su principal() no se toca): es el plan B (P5).
//
// QUÉ CARGA (rt-9): como módulo, solo el hook cuya pieza la ficha (la del disco de esta carpeta: es lo que está en disco lo que se
// carga) dice `molde` — hook-git-seguro, hook-sensible, cambios-metodo. Uno `adaptada`, `propia`, sin entrada, o con la ficha
// ilegible (los tres), corre COMO PROCESO APARTE con la misma entrada, igual que antes: un hook de un proyecto que no exporta
// `decidir` o no trae la guarda de `require.main` no rompe nada.
// EL PLAZO (A5.3): el settings le da TIMEOUT_SETTINGS s; el portero se da 10 menos. Si no le alcanzó (una consulta a git que el
// plazo no dejó correr o cortó, o un hook-proceso que se pasó), NIEGA, pero dice la verdad (A5.4, tracker 25): "repetí el mismo
// comando; no es un no", con el id `freno:sin-tiempo` en el registro. Un deny que ya salió vale igual.
// EL REGISTRO: un solo renglón por comando negado: los renglones de cada hook se juntan y se escribe solo el del que decidió.
// Un error del portero mismo: deny "freno roto: corré doctor" (como cada hook); si ni eso, sale 2 y onFailure "block" frena.
// Vive en hooks/lib/ a propósito: viaja con la pieza hooks-lib, sin tocar el catálogo. Es .cjs: corre igual con "type": "module".

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// A0 (2026-11-12, la suite de carga atrás y 4 lanzadores): el peor percentil 99 fue 4,8 s (git-seguro negando; los tres en un
// proceso, 4,8 s). max(60, 3 × 4,8) = 60, con tope 120.
const TIMEOUT_SETTINGS = 60;
const PLAZO_PROPIO_MS = (TIMEOUT_SETTINGS - 10) * 1000;
const HERRAMIENTAS = ['Bash', 'PowerShell'];
const ROTO = 'freno roto: corré doctor';
const ID_SIN_TIEMPO = 'freno:sin-tiempo';
const SIN_TIEMPO = 'el freno no llegó a mirar a tiempo (la PC está cargada): repetí el mismo comando; no es un no';
// En orden: el primer deny corta.
const HOOKS = [
  { archivo: 'niega-aprobar.cjs', pieza: 'cambios-metodo' },
  { archivo: 'git-seguro.cjs', pieza: 'hook-git-seguro' },
  { archivo: 'sensible.cjs', pieza: 'hook-sensible' },
];

const DIR_HOOKS = path.resolve(__dirname, '..');

function salida(decision, motivo) {
  return { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: decision, permissionDecisionReason: motivo } };
}

// Las piezas de la ficha en disco (<raíz>/.claude/kit.md, la raíz es la de estos hooks). null si no se lee.
function piezasEnDisco(dirHooks = DIR_HOOKS) {
  try {
    const raiz = path.resolve(dirHooks, '..', '..');
    const texto = fs.readFileSync(path.join(raiz, '.claude', 'kit.md'), 'utf8');
    const datos = require('./ficha.cjs').leer(texto).datos;
    return datos && datos.piezas && typeof datos.piezas === 'object' ? datos.piezas : {};
  } catch (e) {
    return null;
  }
}
const estadoDe = (piezas, id) => {
  if (!piezas || !Object.prototype.hasOwnProperty.call(piezas, id)) return null;
  const v = piezas[id];
  return typeof v === 'string' ? v : v && typeof v.estado === 'string' ? v.estado : null;
};
// ¿Cómo se corre cada uno? 'modulo' si la ficha dice molde; 'proceso' si no.
function comoCorre(piezas) {
  return HOOKS.map((h) => ({ ...h, como: estadoDe(piezas, h.pieza) === 'molde' ? 'modulo' : 'proceso' }));
}

// Un hook como proceso aparte, con la entrada cruda y lo que quede del plazo. → { decision, salida, sinTiempo? }
function comoProceso(archivo, crudo, restanteMs) {
  if (restanteMs < 300) return { decision: 'deny', sinTiempo: true };
  const r = spawnSync(process.execPath, [archivo], { input: crudo, encoding: 'utf8', timeout: restanteMs, windowsHide: true });
  if (r.error && r.error.code === 'ETIMEDOUT') return { decision: 'deny', sinTiempo: true };
  // la convención de Claude Code: salida 2 = no, con el motivo en stderr (red team de la tanda A, 2.ª ronda, 5)
  if (r.status === 2) return { decision: 'deny', salida: salida('deny', (r.stderr || '').trim().slice(0, 500) || ROTO) };
  if (r.status !== 0) return { decision: 'deny', salida: salida('deny', ROTO) }; // como onFailure "block"
  const t = (r.stdout || '').trim();
  if (!t) return { decision: 'nada' };
  let j;
  try {
    j = JSON.parse(t);
  } catch (e) {
    try {
      j = JSON.parse(t.split('\n').pop());
    } catch (e2) {
      return { decision: 'deny', salida: salida('deny', ROTO) };
    }
  }
  const d = j && j.hookSpecificOutput && j.hookSpecificOutput.permissionDecision;
  if (d === 'deny' || d === 'ask') return { decision: d, salida: j };
  return { decision: 'nada' };
}

// decidir(crudo, {dirHooks, reloj, plazoMs, piezas}) → { decision, salida, renglones, quien }. Puro salvo los renglones (que
// devuelve sin escribir: los escribe `principal`) y los hooks-proceso. Tira solo si algo se rompe adentro.
function decidir(crudo, opciones = {}) {
  const dirHooks = opciones.dirHooks || DIR_HOOKS;
  const reloj = opciones.reloj || Date.now;
  const fin = reloj() + (opciones.plazoMs || PLAZO_PROPIO_MS);
  const entrada = JSON.parse(crudo);
  if (!entrada || typeof entrada !== 'object' || Array.isArray(entrada)) throw new Error('la entrada no es un objeto');
  if (typeof entrada.tool_name === 'string' && !HERRAMIENTAS.includes(entrada.tool_name)) return { decision: 'nada', renglones: [] };
  const git = require('./git.cjs');
  git.fijarPlazo(fin, reloj);
  const piezas = opciones.piezas !== undefined ? opciones.piezas : piezasEnDisco(dirHooks);
  const asks = [];
  let sinTiempo = false;
  for (const h of comoCorre(piezas)) {
    const archivo = path.join(dirHooks, h.archivo);
    let r;
    const pendientes = [];
    if (h.como === 'modulo') {
      const anotar = (raiz, datos) => {
        pendientes.push({ raiz, datos });
        return require('./frenos-log.cjs').renglon(datos);
      };
      try {
        r = require(archivo).decidir(entrada, { anotar });
      } catch (err) {
        // un hook que tira porque el plazo no dejó correr a git es "sin tiempo", no "roto"
        if (git.salteadasPorPlazo() > 0 || reloj() > fin) r = { decision: 'deny', sinTiempo: true };
        else throw err;
      }
    } else {
      r = comoProceso(archivo, crudo, fin - reloj());
    }
    if (r.sinTiempo || git.salteadasPorPlazo() > 0 || reloj() > fin) sinTiempo = true;
    if (r.decision === 'deny' && !r.sinTiempo) return { decision: 'deny', salida: r.salida, renglones: pendientes, quien: h.archivo };
    if (sinTiempo) break; // red team (2.ª ronda, 6): sin plazo, lo que sigue miraría a medias
    if (r.decision === 'ask') asks.push({ salida: r.salida, renglones: pendientes, quien: h.archivo, pase: r.pase });
  }
  if (sinTiempo) {
    const raiz = require('./agente.cjs').raizDe(require('./contexto.cjs').cwdDe(entrada));
    const herramienta = HERRAMIENTAS.includes(entrada.tool_name) ? entrada.tool_name : 'Bash';
    return { decision: 'deny', salida: salida('deny', SIN_TIEMPO), renglones: raiz ? [{ raiz, datos: { id: ID_SIN_TIEMPO, herramienta, detalle: 'portero', rol: 'desconocido', rama: '(sin rama)' } }] : [], quien: 'plazo' };
  }
  if (!asks.length) return { decision: 'nada', renglones: [] };
  // Revisor y red team de la tanda A (ALTO): un solo clic acepta todo el comando; la ventana dice todas las preguntas, en orden (la firma
  // primero) y quedan todos sus renglones.
  const motivos = asks.map((a) => a.salida.hookSpecificOutput.permissionDecisionReason);
  const motivo = motivos.length === 1 ? motivos[0] : `${motivos[0]} Además: ${motivos.slice(1).join(' Además: ')}`;
  return { decision: 'ask', salida: salida('ask', motivo), renglones: asks.flatMap((a) => a.renglones), quien: asks.map((a) => a.quien).join('+'), pase: (asks.find((a) => a.pase) || {}).pase };
}

function principal() {
  let r;
  try {
    const crudo = fs.readFileSync(0, 'utf8');
    r = decidir(crudo);
  } catch (e) {
    r = { decision: 'deny', salida: salida('deny', ROTO), renglones: [] };
  }
  for (const p of r.renglones || []) {
    try {
      require('./frenos-log.cjs').anotar(p.raiz, p.datos);
    } catch (e) {
      /* el renglón es rastro: el freno vale igual */
    }
  }
  if (r.decision === 'ask' && r.pase) {
    try {
      require(path.join(DIR_HOOKS, 'niega-aprobar.cjs')).dejarPase(r.pase);
    } catch (e) {
      /* sin pase, el script no firma: lado seguro */
    }
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
  module.exports = { TIMEOUT_SETTINGS, PLAZO_PROPIO_MS, HOOKS, ROTO, ID_SIN_TIEMPO, SIN_TIEMPO, salida, piezasEnDisco, comoCorre, comoProceso, decidir };
}
