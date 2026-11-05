'use strict';
// vecinos.cjs — lo que queda FUERA del repo (SPEC-paquete-8r4 u4 + h6, con rt-9; SPEC-paquete-8c "La vuelta 2"). Lo usan
// `adoptar --mirar` (lib/adoptar.cjs) y el `doctor` parado en un proyecto.
//
//   vecinos(desde) → { principal, padre, def, worktrees: [{ ruta, rama, estado }], gates: [{ ruta, nombre, conGit }] } | { error }
//     (a) los worktrees de `git worktree list --porcelain` FUERA de <principal>/.claude/worktrees/ (el principal no cuenta), cada uno
//         con su estado: `mezclada` (su punta es ancestro de la rama por defecto —local o de origin— y el árbol limpio), `viva`
//         (commits que la rama por defecto no tiene, o cambios sin commitear), `suelta` (detached), `perdida` (prunable: la
//         carpeta no existe);
//     (b) las carpetas gate-* y gate_* del PADRE del principal. rt-9: se cuentan, sin consejo de mudarlas (la de Hermes,
//         gate-candados, es una foto de datos compartida a propósito); una sin .git es "datos, no un gate: no tocar".
//   lineas(v) → los renglones del aviso (vacío si no hay nada): el resumen y uno por vecino.
//
// SOLO LEE: nunca borra, nunca hace prune (D8r4-6: borrar un worktree vivo pierde trabajo; Guido decide uno por uno). Los git
// corren con GIT_OPTIONAL_LOCKS=0 (pc/lib/git.cjs): el status no reescribe el índice.
// Node estándar, cero dependencias. Es .cjs a propósito: corre igual en proyectos con "type": "module".

const fs = require('fs');
const path = require('path');
const git = require('../../pc/lib/git.cjs');
const contexto = require('../../pc/lib/contexto.cjs');

const CARPETAS = path.join('.claude', 'worktrees');
const RE_GATE = /^gate[-_]/i;
const barras = (p) => String(p).replace(/\\/g, '/');
const comparable = (p) => {
  let r = path.resolve(p);
  try {
    r = fs.realpathSync.native(r);
  } catch (e) {
    /* no existe: la ruta tal cual */
  }
  r = barras(r).replace(/\/+$/, '');
  return process.platform === 'win32' ? r.toLowerCase() : r;
};
const dentroDe = (base, p) => {
  const b = comparable(base);
  const x = comparable(p);
  return x === b || x.startsWith(`${b}/`);
};
const existe = (p) => {
  try {
    fs.statSync(p);
    return true;
  } catch (e) {
    return false;
  }
};

// `git worktree list --porcelain` → [{ ruta, head, rama ('refs/heads/x' o null), suelta, perdida }]
function listar(principal) {
  const r = git.correr(['worktree', 'list', '--porcelain'], { cwd: principal });
  if (!r.ok) return null;
  const lista = [];
  let actual = null;
  for (const crudo of r.stdout.split('\n')) {
    const l = crudo.replace(/\r$/, '');
    if (l.startsWith('worktree ')) {
      actual = { ruta: path.resolve(l.slice('worktree '.length)), head: null, rama: null, suelta: false, perdida: false, bare: false };
      lista.push(actual);
    } else if (!actual) continue;
    else if (l.startsWith('HEAD ')) actual.head = l.slice(5).trim();
    else if (l.startsWith('branch ')) actual.rama = l.slice(7).trim();
    else if (l === 'detached') actual.suelta = true;
    else if (l === 'bare') actual.bare = true;
    else if (l === 'prunable' || l.startsWith('prunable ')) actual.perdida = true;
  }
  return lista;
}

function estadoDe(w, refsDef) {
  if (w.perdida || !existe(w.ruta)) return 'perdida';
  if (w.suelta) return 'suelta';
  if (!w.head || !refsDef.length) return 'viva';
  const ancestro = refsDef.some((ref) => git.correr(['merge-base', '--is-ancestor', w.head, ref], { cwd: w.ruta }).ok);
  if (!ancestro) return 'viva';
  const st = git.correr(['status', '--porcelain', '--untracked-files=normal'], { cwd: w.ruta });
  return st.ok && st.stdout.trim() === '' ? 'mezclada' : 'viva';
}

function vecinos(desde) {
  const g = contexto.datosGit(desde); // parado en un worktree también: el principal es el padre del git-common-dir
  if (!g) return { error: 'no es un repo de git' };
  const principal = path.dirname(g.gitComun);
  const lista = listar(principal);
  if (!lista) return { error: 'git worktree list falló' };
  const rv = contexto.refVigente(principal);
  const def = rv ? rv.nombre : null;
  const refsDef = def ? [`refs/heads/${def}`, `refs/remotes/origin/${def}`].filter((ref) => git.correr(['rev-parse', '--verify', '-q', `${ref}^{commit}`], { cwd: principal }).ok) : [];
  const adentro = path.join(principal, CARPETAS);
  const worktrees = lista
    .filter((w) => !w.bare && comparable(w.ruta) !== comparable(principal) && !dentroDe(adentro, w.ruta))
    .map((w) => ({ ruta: w.ruta, rama: w.rama ? w.rama.replace(/^refs\/heads\//, '') : null, estado: estadoDe(w, refsDef) }))
    .sort((a, b) => (comparable(a.ruta) < comparable(b.ruta) ? -1 : 1));
  const padre = path.dirname(principal);
  let gates = [];
  try {
    gates = fs
      .readdirSync(padre, { withFileTypes: true })
      .filter((e) => e.isDirectory() && RE_GATE.test(e.name))
      .map((e) => ({ ruta: path.join(padre, e.name), nombre: e.name, conGit: existe(path.join(padre, e.name, '.git')) }))
      .sort((a, b) => (a.nombre < b.nombre ? -1 : 1));
  } catch (e) {
    gates = [];
  }
  return { principal, padre, def, worktrees, gates };
}

const QUE = {
  mezclada: (w, def) => `mezclada (ya está en ${def}): se puede borrar con git worktree remove "${barras(w.ruta)}" — lo decide Guido, una por una; borra también lo ignorado (.env, config): miralo antes`,
  viva: (w, def) => `viva (${def ? `trae lo que ${def} no tiene` : 'no encontré la rama por defecto'}, o cambios sin commitear): no tocar`,
  suelta: () => 'suelta (detached, sin rama): miralo antes de tocarla',
  perdida: () => 'perdida (la carpeta ya no está): git worktree prune la saca de la lista',
};

function lineas(v) {
  if (!v || v.error) return [];
  const { worktrees: ws, gates } = v;
  if (!ws.length && !gates.length) return [];
  const mezcladas = ws.filter((w) => w.estado === 'mezclada').length;
  const partes = [];
  if (ws.length) partes.push(`${ws.length} worktree${ws.length === 1 ? '' : 's'} (${mezcladas} ya mezclad${mezcladas === 1 ? 'o' : 'os'})`);
  if (gates.length) partes.push(`${gates.length} carpeta${gates.length === 1 ? '' : 's'} gate-* en ${barras(v.padre)}`);
  const out = [`fuera del repo: ${partes.join(' y ')}${ws.length ? ' — el kit arma los worktrees adentro (.claude/worktrees/)' : ''}`];
  for (const w of ws) out.push(`  ${barras(w.ruta)} · ${w.rama || 'sin rama'} · ${QUE[w.estado](w, v.def)}`);
  for (const g of gates) out.push(`  ${barras(g.ruta)} · ${g.conGit ? 'un gate con .git (se cuenta; no la muevo)' : 'datos, no un gate: no tocar'}`);
  return out;
}

module.exports = { vecinos, lineas, listar };
