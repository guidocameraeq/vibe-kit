#!/usr/bin/env node
'use strict';
// migrar-cambios.cjs — pasa un CAMBIOS.md de archivo único (el de Hermes: índice + una sección `## CM-N · <título>` por cambio) al
// registro chico del kit, un archivo por CM en .claude/cambios/<fecha>-cm-<n>.md (SPEC-paquete-7 P6.8b-3; E §7; D7-5).
//
//   node migrar-cambios.cjs --repo <dir> [--fuente docs/metodo/CAMBIOS.md] [--plan] [--commit]
//
// Lee la fuente DEL DISCO del repo. Por cada CM:
//   - id <fecha>-cm-<n>: la fecha de la línea **Estado** si trae una; si no, la del commit que agregó la sección (git log -S);
//     si no, la del primer commit del archivo.
//   - cabecera (D7-5): clase 2 · toca [metodo] · origen "CAMBIOS.md CM-<n> (migrado)" · cicatriz no · chico no · urgente no, sin
//     cita (Hermes no guarda las citas en forma de id: inventarlas sería un dato falso).
//   - estado: `✅ **aplicado** en `<sha>`` → aplicado con el SHA COMPLETO (git rev-parse <corto>^{commit}; si hay varios, el primero,
//     los otros al cuerpo). Un SHA que no resuelve → propuesto, y el cuerpo lo dice (nunca un aplicado falso). `**rechazado**` →
//     rechazado con el motivo de la línea. Cualquier otro (propuesto, "propuesto, aprobado por el PO") → propuesto, la línea al cuerpo.
//   - cuerpo, las cuatro secciones: Caso de origen (la sección original entera, citada) · Regla (el título del CM) · Dónde vive (la
//     columna "Aplicado en" del índice) · Medición (la tabla de medición si la sección la trae; si no, "no está medido").
// Cada archivo se arma con armar/ponerCampos del registro y se valida con su `validar` antes de escribirlo (pc/lib/cambios.cjs,
// copia byte a byte de molde/hooks/lib/cambios.cjs).
// Idempotente: un archivo ya escrito e igual → "sin cambios"; uno distinto (o el mismo CM con otro id) → no lo pisa y lo dice.
// --plan: lista qué escribiría, sin escribir. --commit: un commit por rutas con lo que escribió esta corrida.
// NO toca la fuente ni su test: retirarla (lápida, test) lo decide el proyecto al adoptar; lo dice la última línea.
// Salida: una línea por CM con su id y estado, y el total. 0 anduvo · 1 algún CM no se pudo leer o escribir, uno distinto quedó
// sin pisar, o el commit falló (los demás se escriben igual) · 2 mal llamado (sin --repo, no es un repo git, no está la fuente).
// Node estándar, cero dependencias.

const fs = require('fs');
const path = require('path');
const C = require('../pc/lib/cambios.cjs');
const R = require('../pc/lib/cambios-ruta.cjs');
const G = require('../pc/lib/git.cjs');

const USO = 'Uso: node migrar-cambios.cjs --repo <dir> [--fuente docs/metodo/CAMBIOS.md] [--plan] [--commit]';
const FUENTE = 'docs/metodo/CAMBIOS.md';
const SIN_MEDIR = 'no está medido (migrado de CAMBIOS.md)';
const TIEMPO = 60000; // un git log -S sobre miles de commits pasa los 5 s del hook

// ---------------------------------------------------------------- argumentos

function leerArgs(argv) {
  const a = { fuente: FUENTE, plan: false, commit: false, repo: null };
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i];
    if (x === '--plan') a.plan = true;
    else if (x === '--commit') a.commit = true;
    else if (x === '--repo' || x === '--fuente') {
      if (i + 1 >= argv.length) return { error: `${x} pide un valor.` };
      a[x.slice(2)] = argv[++i];
    } else return { error: `Argumento desconocido: ${x}` };
  }
  if (!a.repo) return { error: 'falta --repo <dir>.' };
  if (a.plan && a.commit) return { error: '--plan y --commit no van juntos (el plan no escribe nada que commitear).' };
  return a;
}

// ---------------------------------------------------------------- leer la fuente

const RE_CABEZA = /^## CM-(\d+)\s*·\s*(.+?)\s*$/;
const RE_FILA = /^\|\s*\*\*CM-(\d+)\*\*\s*\|/;
const RE_FECHA = /\b(\d{4})-(\d{2})-(\d{2})\b/g;

const fechaValida = (a, m, d) => {
  const f = new Date(Date.UTC(+a, +m - 1, +d));
  return f.getUTCFullYear() === +a && f.getUTCMonth() === +m - 1 && f.getUTCDate() === +d;
};

// partirFuente(texto) → { cms: [{ n, titulo, lineas }], indice: Map(n → "Aplicado en"), problemas: [{ cabeza, que }] }.
// Una sección va de su `## CM-N · …` al próximo `## ` (o al final), sin los `---` y renglones vacíos del final.
function partirFuente(texto) {
  let t = String(texto);
  if (t.charCodeAt(0) === 0xfeff) t = t.slice(1);
  const lineas = t.replace(/\r\n/g, '\n').split('\n');
  const cms = [];
  const problemas = [];
  const indice = new Map();
  let actual = null;
  const cerrar = () => {
    if (!actual) return;
    const ls = actual.lineas;
    while (ls.length && (ls[ls.length - 1].trim() === '' || ls[ls.length - 1].trim() === '---')) ls.pop();
    cms.push(actual);
    actual = null;
  };
  for (const l of lineas) {
    if (/^## /.test(l)) {
      cerrar();
      const m = RE_CABEZA.exec(l);
      if (m) actual = { n: Number(m[1]), titulo: m[2], lineas: [l] };
      else if (/^## CM-/.test(l)) problemas.push({ cabeza: l, que: 'la cabecera no tiene la forma "## CM-N · <título>"' });
      continue;
    }
    if (actual) {
      actual.lineas.push(l);
      continue;
    }
    const f = RE_FILA.exec(l);
    if (f) {
      // | **CM-N** | título | estado | aplicado en |  — la última columna (sin el | del final) es "Aplicado en".
      const celdas = l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|');
      if (celdas.length >= 4) indice.set(Number(f[1]), celdas.slice(3).join('|').trim());
    }
  }
  cerrar();
  return { cms, indice, problemas };
}

// La línea de Estado (el párrafo que empieza con **Estado**:, unido en una línea) sin el rótulo, o null.
function lineaEstado(lineas) {
  const i = lineas.findIndex((l) => /^\*\*Estado\*\*\s*:/.test(l));
  if (i < 0) return null;
  const partes = [];
  for (let k = i; k < lineas.length && lineas[k].trim() !== ''; k++) partes.push(lineas[k].trim());
  return partes.join(' ').replace(/^\*\*Estado\*\*\s*:\s*/, '');
}

// clasificar(línea) → { tipo: aplicado|rechazado|propuesto, shas: [cortos], fecha: AAAA-MM-DD | null }. El tipo lo da el primer
// rótulo en negrita (`✅ **aplicado**`, `**rechazado**`; "**propuesto, aprobado por el PO**" es propuesto).
function clasificar(linea) {
  const res = { tipo: 'propuesto', shas: [], fecha: null };
  if (linea == null) return res;
  const marca = /\*\*([^*]+)\*\*/.exec(linea);
  const rotulo = marca ? marca[1].trim().toLowerCase() : '';
  if (/^aplicad[oa]\b/.test(rotulo)) res.tipo = 'aplicado';
  else if (/^rechazad[oa]\b/.test(rotulo)) res.tipo = 'rechazado';
  for (const m of linea.matchAll(/`([0-9a-f]{7,40})`/g)) if (!res.shas.includes(m[1])) res.shas.push(m[1]);
  for (const m of linea.matchAll(RE_FECHA)) {
    if (fechaValida(m[1], m[2], m[3])) {
      res.fecha = `${m[1]}-${m[2]}-${m[3]}`;
      break;
    }
  }
  return res;
}

// Un texto para la cabecera: la gramática no escapa nada (cambios.textoValido / comillas), así que sin ", \ ni saltos; las comillas
// dobles pasan a « », los ** de negrita se van, y se corta a 300.
function paraCabecera(s) {
  let abre = true;
  let t = String(s)
    .replace(/\*\*/g, '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\\/g, '/')
    .replace(/"/g, () => {
      const c = abre ? '«' : '»';
      abre = !abre;
      return c;
    })
    .replace(/\s+/g, ' ')
    .trim();
  if (t.length > 300) t = `${t.slice(0, 299)}…`;
  return t;
}

// La tabla de medición de la sección (la que tiene la columna "Cómo se va a saber…"), o null.
function tablaMedicion(lineas) {
  const i = lineas.findIndex((l) => /^\|/.test(l.trim()) && /cómo se va a saber/i.test(l));
  if (i < 0) return null;
  const t = [];
  for (let k = i; k < lineas.length && /^\|/.test(lineas[k].trim()); k++) t.push(lineas[k].trim());
  return t.join('\n');
}

const citar = (lineas) => lineas.map((l) => (l.trim() === '' ? '>' : `> ${l}`)).join('\n');

// ---------------------------------------------------------------- git

function enGit(raiz, args) {
  return G.texto(args, { cwd: raiz, tiempo: TIEMPO });
}

function crearResolvedor(raiz) {
  const cache = new Map();
  return (corto) => {
    if (!cache.has(corto)) {
      const s = enGit(raiz, ['rev-parse', '--verify', '-q', `${corto}^{commit}`]);
      cache.set(corto, s && C.RE_SHA.test(s) ? s : null);
    }
    return cache.get(corto);
  };
}

// La fecha (AAAA-MM-DD) del commit más viejo de una lista de `git log`, o null.
const masVieja = (salida) => {
  if (!salida) return null;
  const ls = salida.split('\n').map((x) => x.trim()).filter((x) => /^\d{4}-\d{2}-\d{2}$/.test(x));
  return ls.length ? ls[ls.length - 1] : null;
};

// ---------------------------------------------------------------- armar un CM

// armarCm(cm, ctx) → { id, tipo, texto, notas: [..], sinResolver: [cortos] } o { problema }.
function armarCm(cm, ctx) {
  const est = lineaEstado(cm.lineas);
  const c = clasificar(est);
  let fecha = c.fecha;
  if (!fecha) fecha = masVieja(enGit(ctx.raiz, ['log', '--format=%as', '-S', `## CM-${cm.n} · `, '--', ctx.fuente]));
  if (!fecha) fecha = ctx.fechaArchivo();
  if (!fecha) return { problema: 'no se le encontró fecha (ni en su Estado ni en git)' };
  const id = `${fecha}-cm-${cm.n}`;
  if (!R.esId(id)) return { problema: `el id ${id} no tiene la forma <AAAA-MM-DD>-<slug>` };

  const notas = [];
  const sinResolver = [];
  let tipo = c.tipo;
  let sha = null;
  let motivo = null;
  if (tipo === 'aplicado') {
    const completos = c.shas.map((s) => ({ corto: s, completo: ctx.resolver(s) }));
    completos.filter((x) => !x.completo).forEach((x) => sinResolver.push(x.corto));
    if (!completos.length) {
      tipo = 'propuesto';
      notas.push(`Migrado como \`propuesto\`: ${ctx.nombre} lo da por aplicado, pero su línea de Estado no nombra ningún commit.`);
    } else if (!completos[0].completo) {
      tipo = 'propuesto';
      notas.push(
        `Migrado como \`propuesto\`: ${ctx.nombre} lo da por aplicado en \`${completos[0].corto}\`, pero ese commit no está en este repo ` +
          '(`git rev-parse` no lo encontró). Nunca un `aplicado` falso: si el commit aparece, `cambios anotar-sha` lo anota.',
      );
    } else sha = completos[0].completo;
    const otros = completos.slice(1);
    if (otros.length) {
      notas.push(
        `Otros commits de la línea de Estado: ${otros.map((x) => (x.completo ? `\`${x.completo}\`` : `\`${x.corto}\` (no está en este repo)`)).join(', ')}.`,
      );
    }
  } else if (tipo === 'rechazado') {
    motivo = paraCabecera(est || '');
    if (motivo === '') motivo = `rechazado en ${ctx.nombre} (sin motivo en la línea)`;
  }
  if (tipo === 'propuesto') notas.push(est == null ? `La sección no trae línea de Estado en ${ctx.nombre}.` : `Estado en ${ctx.nombre}: ${est}`);

  const medicion = tablaMedicion(cm.lineas);
  const donde = ctx.indice.has(cm.n) ? ctx.indice.get(cm.n) : '';
  const cuerpo = [
    '## Caso de origen',
    '',
    `Migrado de \`${ctx.fuente}\` (CM-${cm.n}): la sección original entera, citada tal cual.`,
    ...notas.flatMap((x) => ['', x]),
    '',
    citar(cm.lineas),
    '',
    '## Regla',
    '',
    cm.titulo,
    '',
    '## Dónde vive',
    '',
    donde !== '' ? donde : `no figura en el índice de ${ctx.nombre}`,
    '',
    '## Medición',
    '',
    medicion || SIN_MEDIR,
  ].join('\n');

  let texto;
  try {
    texto = C.armar({ clase: '2', toca: ['metodo'], origen: `${ctx.nombre} CM-${cm.n} (migrado)`, cicatriz: 'no', chico: 'no', urgente: 'no', cuerpo });
    if (tipo === 'aplicado') texto = C.ponerCampos(texto, { estado: 'aplicado', sha });
    else if (tipo === 'rechazado') texto = C.ponerCampos(texto, { estado: 'rechazado', motivo: C.comillas(motivo) });
    texto = texto.replace(/\n*$/, '\n');
    const { datos, cuerpo: leido } = C.leer(texto);
    const fallas = C.validar(datos, leido);
    if (fallas.length) return { problema: `el archivo armado no pasa validar: ${fallas.map((f) => f.que).join('; ')}` };
  } catch (e) {
    return { problema: `no se pudo armar: ${e.message}` };
  }
  return { id, tipo, texto, sinResolver };
}

// ---------------------------------------------------------------- correr

const lf = (s) => String(s).replace(/\r\n/g, '\n');

function correr(argv, out = (l) => process.stdout.write(`${l}\n`)) {
  const a = leerArgs(argv);
  if (a.error) {
    out(`migrar-cambios: ${a.error}`);
    out(USO);
    return 2;
  }
  const raiz = path.resolve(a.repo);
  const top = fs.existsSync(raiz) ? enGit(raiz, ['rev-parse', '--show-toplevel']) : null;
  if (!top) {
    out(`migrar-cambios: ${a.repo} no es un repo git.`);
    return 2;
  }
  const fuente = a.fuente.replace(/\\/g, '/');
  const absFuente = path.resolve(raiz, fuente);
  let textoFuente;
  try {
    textoFuente = fs.readFileSync(absFuente, 'utf8');
  } catch (e) {
    out(`migrar-cambios: no está la fuente ${fuente} en ${a.repo}.`);
    return 2;
  }

  const { cms, indice, problemas } = partirFuente(textoFuente);
  let fechaArchivo;
  const ctx = {
    raiz,
    fuente,
    nombre: path.basename(fuente),
    indice,
    resolver: crearResolvedor(raiz),
    fechaArchivo: () => {
      if (fechaArchivo === undefined) fechaArchivo = masVieja(enGit(raiz, ['log', '--format=%as', '--', fuente]));
      return fechaArchivo;
    },
  };

  // Lo que ya hay en .claude/cambios/: por número de CM, para no escribir el mismo CM con otro id.
  const yaPorCm = new Map();
  for (const f of C.listarArchivos(raiz)) {
    const m = /-cm-(\d+)$/.exec(f.nombre);
    if (m) (yaPorCm.get(Number(m[1])) || yaPorCm.set(Number(m[1]), []).get(Number(m[1]))).push(f);
  }

  const cuenta = { aplicado: 0, propuesto: 0, rechazado: 0, escritos: 0, iguales: 0, distintos: 0, problemas: problemas.length };
  const sinResolver = [];
  const escritos = [];
  const vistos = new Set();
  for (const p of problemas) out(`${p.cabeza.slice(0, 80)} · no se pudo leer: ${p.que}`);
  for (const cm of [...cms].sort((x, y) => x.n - y.n)) {
    const nombre = `CM-${cm.n}`;
    if (vistos.has(cm.n)) {
      cuenta.problemas++;
      out(`${nombre} · no se pudo leer: está dos veces en ${ctx.nombre}`);
      continue;
    }
    vistos.add(cm.n);
    const r = armarCm(cm, ctx);
    if (r.problema) {
      cuenta.problemas++;
      out(`${nombre} · no se pudo leer: ${r.problema}`);
      continue;
    }
    cuenta[r.tipo]++;
    r.sinResolver.forEach((s) => sinResolver.push(`${nombre} (\`${s}\`)`));
    const rel = R.rutaRelativa(r.id);
    const abs = R.rutaAbsoluta(raiz, r.id);
    const previos = yaPorCm.get(cm.n) || [];
    const otroId = previos.find((f) => f.nombre !== r.id);
    let accion;
    if (otroId) {
      cuenta.distintos++;
      accion = `ya está como ${otroId.nombre}: no lo piso`;
    } else if (fs.existsSync(abs)) {
      if (lf(fs.readFileSync(abs, 'utf8')) === r.texto) {
        cuenta.iguales++;
        accion = 'sin cambios';
      } else {
        cuenta.distintos++;
        accion = 'ya está y es distinto: no lo piso';
      }
    } else if (a.plan) {
      cuenta.escritos++;
      accion = 'escribiría';
    } else {
      try {
        fs.mkdirSync(path.dirname(abs), { recursive: true });
        const tmp = `${abs}.tmp-${process.pid}`;
        fs.writeFileSync(tmp, r.texto, 'utf8');
        fs.renameSync(tmp, abs);
        cuenta.escritos++;
        escritos.push(rel);
        accion = 'escrito';
      } catch (e) {
        cuenta.problemas++;
        accion = `no se pudo escribir (${e.code || e.message})`;
      }
    }
    const extra = r.sinResolver.length ? ` · SHA sin resolver: ${r.sinResolver.join(', ')}` : '';
    out(`${nombre} · ${r.id} · ${r.tipo}${extra} · ${accion}`);
  }

  const total = cms.length + problemas.length;
  out(
    `Total: ${total} CM — aplicado ${cuenta.aplicado} · propuesto ${cuenta.propuesto} · rechazado ${cuenta.rechazado} · ` +
      `${a.plan ? 'escribiría' : 'escritos'} ${cuenta.escritos} · sin cambios ${cuenta.iguales} · distintos sin pisar ${cuenta.distintos} · ` +
      `no se pudieron leer ${cuenta.problemas}`,
  );
  out(`SHA que no resolvieron: ${sinResolver.length ? sinResolver.join(', ') : 'ninguno'}`);
  if (a.plan && cuenta.escritos === 0 && cuenta.distintos === 0 && cuenta.problemas === 0) out('sin cambios');

  let codigo = cuenta.problemas || cuenta.distintos ? 1 : 0;
  if (a.commit) {
    if (!escritos.length) out('commit: nada nuevo que commitear.');
    else {
      const add = G.correr(['add', '--', ...escritos], { cwd: raiz, tiempo: TIEMPO });
      const msg = `cambios: ${ctx.nombre} migrado a ${R.CARPETA}/ (${escritos.length} CM)`;
      const com = add.ok ? G.correr(['commit', '-q', '-m', msg, '--', ...escritos], { cwd: raiz, tiempo: TIEMPO }) : add;
      if (com.ok) out(`commit: ${enGit(raiz, ['rev-parse', '--short', 'HEAD'])} "${msg}" (por rutas, ${escritos.length} archivos).`);
      else {
        codigo = 1;
        const det = String(com.stderr || com.error || '').split('\n').map((x) => x.trim()).find(Boolean) || 'sin detalle';
        out(`commit: no se pudo (${det}). Los archivos quedaron escritos, sin commitear.`);
      }
    }
  }
  out(`${fuente} no se tocó: retirarlo (lápida, y su test si tiene) lo decide el proyecto al adoptar.`);
  return codigo;
}

module.exports = { partirFuente, lineaEstado, clasificar, paraCabecera, tablaMedicion, armarCm, correr, SIN_MEDIR };

if (require.main === module) process.exitCode = correr(process.argv.slice(2));
