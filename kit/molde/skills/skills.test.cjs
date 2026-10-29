'use strict';
// skills.test.cjs — pruebas de /inicio y /cierre del molde (SPEC-paquete-2 P5.1 / P5.2, F6).
// Son texto para un agente: lo que se puede chequear con un script se chequea acá (frontmatter, zona propia, que cada comando
// exista, el orden del /cierre, que no haya datos de ningún proyecto). Lo que juzga el modelo (el tono, el cruce) no.
// Correr: node --test kit/molde/skills/skills.test.cjs
// KIT_SKILLS_DIR cambia de dónde leer las skills: solo para la prueba de mutación (una copia rota tiene que dar rojo).

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const zona = require('../hooks/lib/zona-propia.cjs');

const DIR_SKILLS = process.env.KIT_SKILLS_DIR ? path.resolve(process.env.KIT_SKILLS_DIR) : __dirname;
const DIR_SCRIPTS = path.join(__dirname, '..', 'scripts');

const NOMBRES = ['inicio', 'cierre'];
const leer = (n) => fs.readFileSync(path.join(DIR_SKILLS, n, 'SKILL.md'), 'utf8').replace(/\r\n/g, '\n');
const TEXTOS = Object.fromEntries(NOMBRES.map((n) => [n, leer(n)]));

// estructura.cjs lo escribe otro encargo (F4): su uso está fijado en el delta, no se lee el archivo.
const USO_FIJO = { estructura: ['todo', 'parcial'] };

const MARCA_ABRE = ['<!-- kit', 'propio -->'].join(':');
const MARCA_CIERRA = ['<!-- /kit', 'propio -->'].join(':');

// ---------------------------------------------------------------- los chequeos, como funciones (para probarlos a ellos mismos)

function frontmatter(texto) {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(texto);
  if (!m) return null;
  const datos = {};
  for (const l of m[1].split('\n')) {
    const k = /^([a-z-]+):\s*(.*)$/.exec(l);
    if (k) datos[k[1]] = k[2].trim();
  }
  return datos;
}

// candado:datos (SPEC-paquete-2 F4): cero rutas absolutas, ids de sesión, ramas concretas y SHAs. Más lo que el brief de F6 suma
// para el molde: el nombre del repo madre y de personas. Devuelve las faltas encontradas.
function datosDeProyecto(texto) {
  const faltas = [];
  const probar = (que, re) => {
    for (const m of texto.matchAll(re)) faltas.push(`${que}: ${m[0]}`);
  };
  probar('ruta absoluta', /(^|[^A-Za-z])[A-Za-z]:[\\/]/g);
  probar('ruta absoluta', /\/c\/Users\//gi);
  probar('ruta absoluta', /\/home\//g);
  probar('ruta absoluta', /\/Users\//g);
  probar('id de sesión', /local_[0-9a-f]+/gi);
  probar('id de sesión', /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi);
  probar('rama concreta', /\bmodulo\/(?!<)[A-Za-z0-9][\w-]*/g);
  for (const m of texto.matchAll(/\b[0-9a-f]{7,40}\b/gi)) {
    if (!/[a-f]/i.test(m[0]) || !/[0-9]/.test(m[0])) continue;
    const antes = texto.slice(Math.max(0, m.index - 80), m.index);
    if (/https?:\/\/\S*$/.test(antes)) continue; // dentro de una URL
    faltas.push(`SHA: ${m[0]}`);
  }
  probar('nombre del repo madre', /vibe-kit/gi);
  probar('nombre de persona', /\bguido\b/gi);
  return faltas;
}

// Cada `node .claude/scripts/<x>.cjs <sub> [--flags]` del texto: { script, sub, flags, linea }.
function comandos(texto) {
  const out = [];
  const re = /node \.claude\/scripts\/([a-z][\w-]*)\.cjs(?: ([a-z][\w-]*))?([^`\n]*)/g;
  for (const m of texto.matchAll(re)) {
    out.push({ script: m[1], sub: m[2] || null, flags: [...(m[3] || '').matchAll(/--[a-z][\w-]*/g)].map((f) => f[0]), linea: m[0] });
  }
  return out;
}

// El USO de un script que existe: lo que imprime sin argumentos (los cuatro lo hacen, salida 2).
const usoCache = {};
function usoDe(script) {
  if (!usoCache[script]) {
    const r = spawnSync(process.execPath, [path.join(DIR_SCRIPTS, `${script}.cjs`)], { encoding: 'utf8', cwd: DIR_SCRIPTS, timeout: 20000 });
    usoCache[script] = `${r.stdout || ''}\n${r.stderr || ''}`;
  }
  return usoCache[script];
}
const palabra = (texto, w) => new RegExp(`(?<![\\w-])${w.replace(/[-]/g, '\\-')}(?![\\w-])`).test(texto);

// Los comandos que no existen: script ausente, subcomando que su USO no nombra, o flag que su USO no nombra.
function comandosRotos(texto) {
  const rotos = [];
  for (const c of comandos(texto)) {
    if (USO_FIJO[c.script]) {
      if (!USO_FIJO[c.script].includes(c.sub)) rotos.push(`${c.linea}: subcomando fuera de ${USO_FIJO[c.script].join(' | ')}`);
      continue;
    }
    if (!fs.existsSync(path.join(DIR_SCRIPTS, `${c.script}.cjs`))) {
      rotos.push(`${c.linea}: no existe kit/molde/scripts/${c.script}.cjs`);
      continue;
    }
    const uso = usoDe(c.script);
    if (!c.sub || !palabra(uso, c.sub)) rotos.push(`${c.linea}: el USO de ${c.script}.cjs no nombra el subcomando "${c.sub}"`);
    for (const f of c.flags) if (!uso.includes(f)) rotos.push(`${c.linea}: el USO de ${c.script}.cjs no nombra ${f}`);
  }
  return rotos;
}

// Que cada marca de zona aparezca una sola vez, y nunca dentro de un bloque de código.
function marcasFueraDeLugar(texto) {
  const problemas = [];
  if (texto.split(MARCA_ABRE).length !== 2) problemas.push('la marca de apertura no aparece exactamente una vez');
  if (texto.split(MARCA_CIERRA).length !== 2) problemas.push('la marca de cierre no aparece exactamente una vez');
  let dentro = false;
  for (const l of texto.split('\n')) {
    if (/^\s*(```|~~~)/.test(l)) dentro = !dentro;
    else if (dentro && /kit:propio/.test(l)) problemas.push('una marca dentro de un bloque de código');
  }
  return problemas;
}

// ---------------------------------------------------------------- las skills

for (const nombre of NOMBRES) {
  const texto = TEXTOS[nombre];

  test(`${nombre}: frontmatter con name y description`, () => {
    const f = frontmatter(texto);
    assert.ok(f, 'tiene que abrir con un frontmatter ---');
    assert.equal(f.name, nombre);
    assert.ok(f.description && f.description.length >= 60, 'description: cuándo usarla');
    assert.match(f.description, /Usar cuando/);
    assert.match(f.description, /No usar/);
  });

  test(`${nombre}: exactamente una zona propia válida, vacía y al final`, () => {
    const z = zona.zonas(texto);
    assert.equal(z.ok, true, z.problema);
    assert.equal(z.zonas.length, 1);
    assert.deepEqual(marcasFueraDeLugar(texto), []);
    const c = z.zonas[0].contenido;
    assert.match(c, /^## Lo propio de este proyecto$/m);
    assert.match(c, /^\*[^*].*kit no pisa.*\*$/m, 'una línea en cursiva que dice qué va ahí');
    assert.equal(c.split('\n').filter((l) => l.trim()).length, 2, 'la zona viene vacía: el título y la línea en cursiva');
    assert.equal(texto.slice(texto.indexOf(MARCA_CIERRA) + MARCA_CIERRA.length).trim(), '', 'nada después de la zona');
  });

  test(`${nombre}: cada comando existe tal cual`, () => {
    const cs = comandos(texto);
    assert.ok(cs.length > 0, 'llama a algún script');
    assert.deepEqual(comandosRotos(texto), []);
  });

  test(`${nombre}: cero datos de ningún proyecto (candado:datos)`, () => {
    assert.deepEqual(datosDeProyecto(texto), []);
  });

  test(`${nombre}: sin stash y sin agregar el árbol entero`, () => {
    assert.doesNotMatch(texto, /stash/i);
    assert.doesNotMatch(texto, /git add\s+(-A\b|--all\b|\.(\s|$|`|"))/);
    assert.doesNotMatch(texto, /reset --hard|clean -f/);
  });

  test(`${nombre}: cabe en una pantalla y media`, () => {
    assert.ok(Buffer.byteLength(texto) <= 8000, `${Buffer.byteLength(texto)} bytes: recortá prosa, no pasos`);
    assert.ok(texto.split('\n').length <= 70);
  });
}

// ---------------------------------------------------------------- /inicio

test('inicio: CORTADO, la huella y el hook que no corrió', () => {
  const t = TEXTOS.inicio;
  assert.match(t, /CORTADO/);
  assert.match(t, /inyectado: N de 9\.700/);
  assert.match(t, /el hook de arranque no corrió: corré doctor/);
  assert.match(t, /docs\/SESSION_HANDOFF\.md/);
});

test('inicio: fetch, cruce con git, aprobados nuevos y confirmación, en ese orden', () => {
  const t = TEXTOS.inicio;
  const pos = [
    t.indexOf('git fetch'),
    t.indexOf('origin/<rama por defecto>'),
    t.indexOf('node .claude/scripts/cambios.cjs listar --aprobados-nuevos'),
    t.indexOf('aprobados nuevos desde tu última sesión: <ids>'),
    t.indexOf('Confirmar en tres líneas'),
    t.indexOf('chico, lo hago acá'),
    t.indexOf('kit-sesiones'),
    t.indexOf('Seguir o preguntar'),
  ];
  assert.ok(pos.every((p) => p >= 0), `falta alguno: ${JSON.stringify(pos)}`);
  assert.deepEqual([...pos].sort((a, b) => a - b), pos, 'orden de los pasos');
});

test('inicio: Estado · Próximo paso · Bloqueos y las dos preguntas del tamaño', () => {
  const t = TEXTOS.inicio;
  const e = t.indexOf('**Estado**');
  assert.ok(e >= 0 && e < t.indexOf('**Próximo paso**') && t.indexOf('**Próximo paso**') < t.indexOf('**Bloqueos**'));
  assert.match(t, /¿se retoma solo con el pedido más el `git diff`\? ¿lleva más de una sesión\?/);
  assert.match(t, /\*"chico, lo hago acá"\*/);
  assert.match(t, /\*"esto es más que chico: llamo al Arquitecto"\*/);
  assert.match(t, /sin preguntar/);
});

test('inicio: el worktree solo con otra marca de sesión de menos de 12 h, sin contar la propia', () => {
  const t = TEXTOS.inicio;
  assert.match(t, /<rama por defecto>/);
  assert.match(t, /menos de 12 h/);
  assert.match(t, /-mmin -720/);
  assert.match(t, /Restale la tuya/);
});

test('inicio: no espera un OK antes de un pedido chico (SPEC-0 criterio 2)', () => {
  const t = TEXTOS.inicio;
  assert.doesNotMatch(t, /hasta el OK/i);
  assert.doesNotMatch(t, /OK explícito/i);
  assert.match(t, /Si el pedido ya vino con el mensaje, decí el tamaño/);
  assert.match(t, /no esperes otro OK/);
  assert.match(t, /Si no vino, preguntá cuál es la misión y no toques nada hasta tenerla/);
});

test('inicio: lo que se completa más adelante, dicho sin inventarlo', () => {
  assert.match(TEXTOS.inicio, /mesa/);
  assert.match(TEXTOS.inicio, /sello del Arquitecto/);
  assert.match(TEXTOS.inicio, /no los improvises/);
});

// ---------------------------------------------------------------- /cierre

test('cierre: el orden del bloque F6', () => {
  const t = TEXTOS.cierre;
  const pasos = [
    ['cruce', t.indexOf('Cruce anunciado contra anotado')],
    ['todo.cjs cierre', t.indexOf('node .claude/scripts/todo.cjs cierre')],
    ['agents.cjs generar', t.indexOf('node .claude/scripts/agents.cjs generar')],
    ['cambios.cjs verificar', t.indexOf('node .claude/scripts/cambios.cjs verificar')],
    ['estructura.cjs todo', t.indexOf('node .claude/scripts/estructura.cjs todo')],
    ['git fetch', t.indexOf('git fetch')],
    ['git add por rutas', t.indexOf('git add -- ')],
    ['git commit por rutas', t.indexOf('git commit -m')],
    ['anotar-sha', t.indexOf('node .claude/scripts/cambios.cjs anotar-sha')],
    ['cambios.cjs verificar (otra vez)', t.lastIndexOf('node .claude/scripts/cambios.cjs verificar')],
    ['push-publica', t.indexOf('push-publica: sí')],
    ['git push', t.indexOf('`git push`')],
  ];
  for (const [que, p] of pasos) assert.ok(p >= 0, `falta: ${que}`);
  for (let i = 1; i < pasos.length; i++) {
    assert.ok(pasos[i][1] > pasos[i - 1][1], `"${pasos[i][0]}" tiene que ir después de "${pasos[i - 1][0]}"`);
  }
  const verificar = t.split('node .claude/scripts/cambios.cjs verificar').length - 1;
  assert.equal(verificar, 2, 'cambios verificar corre dos veces: antes y después del commit');
});

test('cierre: rojo se arregla y nunca se commitea encima; sin node o sin salida, no se commitea', () => {
  const t = TEXTOS.cierre;
  assert.match(t, /nunca commitees encima de un rojo/);
  assert.match(t, /Sin `node`, o si un script no imprime nada o sale con un código que no es el esperado: no se commitea/);
  assert.match(t, /candado:<id> · qué pasa · qué hacer/);
});

test('cierre: el commit es por rutas e incluye frenos.log', () => {
  const t = TEXTOS.cierre;
  const adds = [...t.matchAll(/git add -- [^\n]*/g)].map((m) => m[0]);
  assert.ok(adds.length >= 1);
  assert.ok(adds.every((l) => l.includes('.claude/frenos.log')), 'el add lleva frenos.log');
  assert.match(t, /git commit -m "[^"]*" -- <las mismas rutas>/);
  assert.match(t, /otro commit por rutas con el archivo del cambio y `\.claude\/frenos\.log`/);
});

test('cierre: las reglas de B §11', () => {
  const t = TEXTOS.cierre;
  assert.match(t, /primeras 20 líneas/);
  assert.match(t, /cuando pasa una de tres/);
  assert.match(t, /No cierres sola: proponé/);
  assert.match(t, /Nada que cerrar/);
  assert.match(t, /Proponelo vos, en una línea/);
});

test('cierre: el handoff, con las secciones de P3.5 en su orden y su tope', () => {
  const t = TEXTOS.cierre;
  const orden = ['# Handoff — <proyecto>', '## Estado', '## Próximo paso', '## Bloqueos', '## Te espera', '## En curso', '## Contexto'].map((s) => t.indexOf(s));
  assert.ok(orden.every((p) => p >= 0), `falta una sección: ${JSON.stringify(orden)}`);
  assert.deepEqual([...orden].sort((a, b) => a - b), orden, 'orden de las secciones');
  assert.match(t, /Tope 5\.000 bytes/);
  assert.match(t, /- Producción: <estado> · <fecha> · <cómo se verificó>/);
  assert.match(t, /REPORTADO POR EL USUARIO/);
  assert.match(t, /Sin "Qué se hizo", "Archivos tocados" ni "Cierre:"/);
});

test('cierre: cierre parcial corre estructura parcial y no empuja', () => {
  const t = TEXTOS.cierre;
  const h = t.indexOf('## Cierre parcial');
  assert.ok(h > t.indexOf('node .claude/scripts/estructura.cjs todo'), 'el parcial va después del modo completo');
  const parcial = t.slice(h, t.indexOf('## Reglas'));
  assert.match(parcial, /node \.claude\/scripts\/estructura\.cjs parcial/);
  assert.match(parcial, /commit por rutas/);
  assert.match(parcial, /Sin push/);
  assert.doesNotMatch(parcial, /estructura\.cjs todo/);
});

test('cierre: el aviso de push-publica no pregunta, y aprobar es del dueño', () => {
  const t = TEXTOS.cierre;
  assert.match(t, /push-publica: sí/);
  assert.match(t, /No preguntes/);
  assert.doesNotMatch(t, /node \.claude\/scripts\/cambios\.cjs aprobar/);
  assert.match(t, /el `aprobar` es suyo, jamás lo corras/);
});

// ---------------------------------------------------------------- los chequeos se prueban a sí mismos

test('los chequeos: datosDeProyecto detecta cada clase de dato y deja pasar lo permitido', () => {
  const malos = [
    ['ruta de Windows', 'mirá D:\\mis cosas\\x'],
    ['ruta con barra', 'mirá C:/Users/yo'],
    ['ruta de Git Bash', 'en /c/Users/yo/proyecto'],
    ['ruta de Linux', 'en /home/yo'],
    ['ruta de Mac', 'en /Users/yo'],
    ['id de sesión', 'la sesión local_3fa9c1d2e4b5'],
    ['UUID', 'la 123e4567-e89b-12d3-a456-426614174000'],
    ['rama concreta', 'la rama modulo/facturas'],
    ['SHA', 'el commit 3f9a0c1'],
    ['repo madre', 'viene de vibe-kit'],
    ['persona', 'se lo pregunta a Guido'],
  ];
  for (const [que, texto] of malos) assert.ok(datosDeProyecto(texto).length > 0, `no detectó: ${que}`);
  const buenos = [
    'la rama modulo/<x> y modulo/<x>--<ID>',
    'https://ejemplo.com/commit/3f9a0c1d2e',
    'el tope es 5.000 bytes y 9.700 caracteres, 2026-10-28, defaced y 1234567',
    'node .claude/scripts/todo.cjs cierre y docs/referencia/trampas.md',
  ];
  for (const texto of buenos) assert.deepEqual(datosDeProyecto(texto), [], texto);
});

test('los chequeos: comandosRotos detecta script, subcomando y flag que no existen', () => {
  assert.deepEqual(comandosRotos('`node .claude/scripts/todo.cjs cierre`'), []);
  assert.deepEqual(comandosRotos('`node .claude/scripts/cambios.cjs listar --aprobados-nuevos`'), []);
  assert.deepEqual(comandosRotos('`node .claude/scripts/estructura.cjs parcial` y `node .claude/scripts/estructura.cjs todo`'), []);
  assert.equal(comandosRotos('`node .claude/scripts/inventado.cjs cierre`').length, 1);
  assert.equal(comandosRotos('`node .claude/scripts/todo.cjs cerrar`').length, 1);
  assert.equal(comandosRotos('`node .claude/scripts/cambios.cjs listar --inventada`').length, 1);
  assert.equal(comandosRotos('`node .claude/scripts/estructura.cjs borrar`').length, 1);
  assert.equal(comandosRotos('`node .claude/scripts/agents.cjs`').length, 1);
});

test('los chequeos: marcasFueraDeLugar detecta una marca repetida, rota o dentro de un bloque de código', () => {
  const ok = `texto\n${MARCA_ABRE}\n## x\n${MARCA_CIERRA}\n`;
  assert.deepEqual(marcasFueraDeLugar(ok), []);
  assert.ok(marcasFueraDeLugar(`${ok}${ok}`).length > 0);
  assert.ok(marcasFueraDeLugar(`${MARCA_ABRE}\n`).length > 0);
  assert.ok(marcasFueraDeLugar(`\`\`\`\n${MARCA_ABRE}\n\`\`\`\n${ok}`).length > 0);
});
