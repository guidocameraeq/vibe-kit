'use strict';
// afirmaciones.cjs — el corrector de afirmaciones en prosa por script (SPEC-0 6.10; A §5 y §6; SPEC-paquete-5, K5). Uso, desde el repo:
//   node .claude/scripts/afirmaciones.cjs <sha-base> [--frenar]
// Corre las reglas de hooks/lib/afirmaciones.cjs sobre los renglones AGREGADOS de `git diff <sha-base> HEAD`: lo commiteado, así
// cubre igual lo que se escribió con Bash, PowerShell, Write o Edit (A §5 paso 3). Mira comentarios, docstrings, textos de error y
// viñetas de CHANGELOG; el Markdown común queda afuera (la medición: 4,1% de renglones con hallazgo en los .md de Hermes).
// AVISA, NO FRENA (K5, medido contra Hermes: sobre la mitad nueva cazó 5 de 9 sobre-afirmaciones de la muestra y marcó 38 de 1.386
// renglones buenos; con falsos positivos, la receta dice que no se instala como freno). Sin --frenar: lista los hallazgos como
// "⚠️ a mirar" y sale 0. Con --frenar (para cuando las reglas den 0 falsos positivos): sale 1 y deja un renglón en frenos.log.
// Salidas: 0 limpio o solo avisos · 1 frena (solo con --frenar) o no se pudo leer el diff · 2 mal llamado. Node estándar, cero
// dependencias. Es .cjs a propósito (proyectos con "type": "module").

const USO = [
  'Uso: node .claude/scripts/afirmaciones.cjs <sha-base> [--frenar]   (desde el repo)',
  '  Revisa la prosa agregada desde <sha-base> (comentarios, docstrings, textos de error, viñetas de CHANGELOG).',
  '  Sin --frenar: avisa ("⚠️ a mirar") y sale 0 · con --frenar: sale 1 si hay hallazgos y lo anota en .claude/frenos.log.',
].join('\n');

const ID_FRENO = 'gate:afirmaciones';
const HERRAMIENTA = 'afirmaciones.cjs';

class MalLlamado extends Error {}

function leerArgumentos(argv) {
  const o = { base: null, frenar: false };
  for (const a of argv) {
    if (a === '--frenar') o.frenar = true;
    else if (a.startsWith('--')) throw new MalLlamado(`opción desconocida: ${a}`);
    else if (o.base === null) o.base = a;
    else throw new MalLlamado(`sobra "${a}": un solo <sha-base>`);
  }
  if (!o.base) throw new MalLlamado('falta el <sha-base>');
  return o;
}

// Los renglones agregados de un diff -U0: Map<ruta nueva, Set<número>>. Los archivos borrados no traen nada.
function agregadosDelDiff(diff) {
  const fuera = new Map();
  let ruta = null;
  let n = 0;
  for (const l of String(diff).split('\n')) {
    if (l.startsWith('diff --git')) { ruta = null; continue; }
    if (l.startsWith('+++ ')) { ruta = l === '+++ /dev/null' ? null : l.slice(6); if (ruta) fuera.set(ruta, new Set()); continue; }
    if (l.startsWith('--- ')) continue;
    const m = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(l);
    if (m) { n = Number(m[1]); continue; }
    if (ruta && l.startsWith('+')) fuera.get(ruta).add(n++);
  }
  return fuera;
}

// revisar({ cwd, base }) → { ok: true, hallazgos: [{ ruta, linea, regla, frase, texto, alternativa }], archivos } | { ok: false, por }
function revisar({ cwd, base }) {
  const git = require('../hooks/lib/git.cjs');
  const A = require('../hooks/lib/afirmaciones.cjs');
  const G = (args) => git.correr(['-c', 'core.quotepath=false', ...args], { cwd, tiempo: 60000 });
  const rev = G(['rev-parse', '--verify', '--quiet', `${base}^{commit}`]);
  if (!rev.ok) return { ok: false, por: `la base "${base}" no es un commit de este repo` };
  const diff = G(['diff', '--no-color', '--no-renames', '--no-ext-diff', '-U0', base, 'HEAD']);
  if (!diff.ok) return { ok: false, por: 'git no pudo armar el diff' };
  const hallazgos = [];
  let archivos = 0;
  for (const [ruta, numeros] of agregadosDelDiff(diff.stdout)) {
    if (numeros.size === 0) continue;
    if (!A.lenguaje(ruta) && !A.RE_NOTAS.test(ruta.split('/').pop())) continue;
    const c = G(['show', `HEAD:${ruta}`]);
    if (!c.ok) continue;
    archivos++;
    for (const h of A.revisar(ruta, c.stdout, numeros)) hallazgos.push({ ruta, ...h });
  }
  return { ok: true, hallazgos, archivos };
}

// Los renglones del informe, para la terminal y para la sección del paquete del revisor.
// `tope`: cuántos hallazgos lista como mucho (el paquete corta en TOPE_PAQUETE para no tapar el diff); el resto, contado.
const TOPE_PAQUETE = 30;
function lineas(r, frenar, tope = Infinity) {
  const A = require('../hooks/lib/afirmaciones.cjs');
  if (!r.ok) return [`afirmaciones: NO VERIFICADO (${r.por})`];
  if (r.hallazgos.length === 0) return [`afirmaciones: limpio (${r.archivos} archivo(s) con prosa revisados)`];
  const marca = frenar ? '' : '⚠️ a mirar · ';
  return [
    frenar
      ? `afirmaciones: frena · ${r.hallazgos.length} hallazgo(s): corregí la prosa o citá la evidencia (SHA, prueba, archivo:línea, cifra, NO VERIFICADO)`
      : `afirmaciones: ${r.hallazgos.length} hallazgo(s) a mirar (avisa, no frena: las reglas tienen falsos positivos medidos)`,
    ...r.hallazgos.slice(0, tope).map((h) => `${marca}${A.mensaje(h.ruta, h)}`),
    ...(r.hallazgos.length > tope ? [`(+${r.hallazgos.length - tope} más: corré afirmaciones.cjs para verlos todos)`] : []),
  ];
}

// La sección `## Afirmaciones` del paquete del revisor (la suma paquete.cjs; no cambia sus salidas).
function seccion({ cwd, base }) {
  return ['## Afirmaciones', '', ...lineas(revisar({ cwd, base }), false, TOPE_PAQUETE), ''].join('\n');
}

function main(argv, { cwd = process.cwd(), ahora = new Date() } = {}) {
  let o;
  try {
    o = leerArgumentos(argv);
  } catch (e) {
    if (!(e instanceof MalLlamado)) throw e;
    return { codigo: 2, salida: `${e.message}\n${USO}\n` };
  }
  const r = revisar({ cwd, base: o.base });
  const salida = `${lineas(r, o.frenar).join('\n')}\n`;
  if (!r.ok) return { codigo: 1, salida };
  if (!o.frenar || r.hallazgos.length === 0) return { codigo: 0, salida };
  const contexto = require('../hooks/lib/contexto.cjs');
  const frenosLog = require('../hooks/lib/frenos-log.cjs');
  const raiz = contexto.raiz(cwd);
  if (raiz) {
    const rutas = [...new Set(r.hallazgos.map((h) => h.ruta))];
    frenosLog.anotar(
      raiz,
      { id: ID_FRENO, herramienta: HERRAMIENTA, detalle: `${r.hallazgos.length} hallazgo(s) en ${rutas.join(', ')}`, rol: contexto.rol(raiz), rama: contexto.rama(cwd) },
      ahora,
    );
  }
  return { codigo: 1, salida };
}

if (require.main === module) {
  let codigo = 1;
  try {
    const r = main(process.argv.slice(2));
    process.stdout.write(r.salida);
    codigo = r.codigo;
  } catch (e) {
    process.stdout.write('afirmaciones roto: corré doctor\n');
  }
  process.exitCode = codigo;
}

module.exports = { USO, ID_FRENO, HERRAMIENTA, TOPE_PAQUETE, leerArgumentos, agregadosDelDiff, revisar, lineas, seccion, main };
