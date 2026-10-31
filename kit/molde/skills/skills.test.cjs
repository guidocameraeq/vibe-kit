'use strict';
// skills.test.cjs — pruebas de /inicio, /cierre, /director y /obrero del molde, del núcleo y del revisor (SPEC-paquete-2 P5.1 / P5.2, F6; SPEC-paquete-5 P5.4-P5.6).
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
const DIR_MOLDE = path.join(__dirname, '..');
// kit/skills del repo: contra donde se resuelve ~/.claude/skills/ (nunca el ~/.claude/ real).
const DIR_KIT_SKILLS = path.join(__dirname, '..', '..', 'skills');

const NOMBRES = ['inicio', 'cierre', 'director', 'obrero'];
const leer = (n) => fs.readFileSync(path.join(DIR_SKILLS, n, 'SKILL.md'), 'utf8').replace(/\r\n/g, '\n');
const TEXTOS = Object.fromEntries(NOMBRES.map((n) => [n, leer(n)]));
// El núcleo (no es una skill: sin SKILL.md), la plantilla del encargo y el revisor (un agente).
const NUCLEO = fs.readFileSync(path.join(DIR_SKILLS, 'nucleo', 'NUCLEO.md'), 'utf8').replace(/\r\n/g, '\n');
const PLANTILLA = fs.readFileSync(path.join(DIR_SKILLS, 'director', 'plantilla-encargo.md'), 'utf8').replace(/\r\n/g, '\n');
const REVISOR = fs.readFileSync(path.join(DIR_MOLDE, 'agents', 'revisor.md'), 'utf8').replace(/\r\n/g, '\n');

// estructura.cjs lo escribe otro encargo (F4): su uso está fijado en el delta, no se lee el archivo.
const USO_FIJO = {
  estructura: ['todo', 'parcial'],
};

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
  // `--ok-de-guido` es el flag de `worktree integrar` (SPEC-paquete-5): la única mención permitida.
  for (const m of texto.replace(/--ok-de-guido/g, ' ').matchAll(/\bguido\b/gi)) faltas.push(`nombre de persona: ${m[0]}`);
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

// Cada `node "$HOME/.claude/skills/<skill>/<ruta>.cjs" <sub> [--flags]` del texto (los scripts de las skills globales, como el del
// Arquitecto). También lee la forma vieja `node ~/.claude/…`, para que la prueba de abajo la encuentre y la rechace (rf-2).
function comandosDeSkill(texto) {
  const out = [];
  const re = /node (?:~\/|"\$HOME\/)\.claude\/skills\/([a-z][\w-]*)\/([\w\/.-]+\.cjs)"?(?: ([a-z][\w-]*))?([^`\n]*)/g;
  for (const m of texto.matchAll(re)) {
    out.push({ skill: m[1], ruta: m[2], sub: m[3] || null, flags: [...(m[4] || '').matchAll(/--[a-z][\w-]*/g)].map((f) => f[0]), linea: m[0] });
  }
  return out;
}

// ~/.claude/skills/<skill>/<ruta> se resuelve contra kit/skills/<skill>/<ruta> del repo, no contra el ~/.claude/ real.
const rutaEnKit = (c) => path.join(DIR_KIT_SKILLS, c.skill, c.ruta);

// Los comandos de skill que no existen en el kit: archivo ausente, subcomando o flag que su USO (salida sin argumentos) no nombra.
function comandosDeSkillRotos(texto) {
  const rotos = [];
  for (const c of comandosDeSkill(texto)) {
    const ruta = rutaEnKit(c);
    if (!fs.existsSync(ruta)) {
      rotos.push(`${c.linea}: no existe kit/skills/${c.skill}/${c.ruta}`);
      continue;
    }
    const r = spawnSync(process.execPath, [ruta], { encoding: 'utf8', cwd: path.dirname(ruta), timeout: 20000 });
    const uso = `${r.stdout || ''}\n${r.stderr || ''}`;
    if (!c.sub || !palabra(uso, c.sub)) rotos.push(`${c.linea}: el USO de ${c.ruta} no nombra el subcomando "${c.sub}"`);
    for (const f of c.flags) if (!uso.includes(f)) rotos.push(`${c.linea}: el USO de ${c.ruta} no nombra ${f}`);
  }
  return rotos;
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
  assert.match(t, /¿hace falta algo más que el pedido y el `git diff` para retomarlo\? ¿lleva más de una sesión\?/);
  // B §6 estaba al revés: "¿se retoma solo?" con "ninguna sí = chico" daría "más que chico" para un pedido chico.
  assert.doesNotMatch(t, /¿se retoma solo/);
  assert.match(t, /Ninguna sí: \*"chico, lo hago acá"\*\. Alguna sí: \*"esto es más que chico/);
  assert.match(t, /\*"chico, lo hago acá"\*/);
  assert.match(t, /\*"esto es más que chico: llamo al Arquitecto"\*/);
  assert.match(t, /sin preguntar/);
});

test('inicio: la línea del tamaño va antes de cualquier herramienta o skill (F6b: p4 y p5 invocaban al Arquitecto sin decirla)', () => {
  const t = TEXTOS.inicio;
  assert.match(t, /en una línea y sin preguntar, antes de cualquier herramienta o skill\*\* \(antes de invocar `\/arquitecto`\)/);
});

test('inicio: criterio con ejemplos (F6b: una funcionalidad nueva con decisiones abiertas no es chica)', () => {
  const t = TEXTOS.inicio;
  assert.match(t, /Un arreglo o ajuste puntual de algo que ya existe es chico/);
  assert.match(t, /algo nuevo con decisiones de diseño abiertas \(dónde se guarda, qué formato, qué pasa si…\) es más que chico/);
});

test('inicio: lo que el pedido nombra y no existe no frena la medida (F6b)', () => {
  const t = TEXTOS.inicio;
  assert.match(t, /Si el pedido nombra algo que no encontrás, igual medí por lo que pide; la duda va después de la línea/);
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

test('inicio: lo que se completa más adelante (la mesa), dicho sin inventarlo; el sello ya no está en esa lista', () => {
  const t = TEXTOS.inicio;
  assert.match(t, /todavía no mira la mesa de proyectos: llega con un kit posterior/);
  assert.match(t, /no la improvises/);
  assert.doesNotMatch(t, /todavía no mira[^\n]*sello/);
});

test('inicio: con el pedido en el mensaje, la línea del tamaño va primera, antes de las tres de confirmación (P1.7, D4-10)', () => {
  const t = TEXTOS.inicio;
  const paso = /^\d+\. \*\*El tamaño del pedido[^\n]*$/m.exec(t);
  assert.ok(paso, 'el paso del tamaño existe');
  assert.match(paso[0], /\*\*Con el pedido en el mensaje, esa línea va primera en la respuesta, antes de las tres de confirmación\*\*/);
  assert.ok(paso[0].includes('los pasos 1 a 4 son lecturas'), 'las lecturas de los pasos previos no cuentan como texto');
});

test('inicio: el paso `ready --pendientes`, después de aprobados nuevos y antes de confirmar, con sus ramas (P5.1, D4-11)', () => {
  const t = TEXTOS.inicio;
  const cmd = t.indexOf('node "$HOME/.claude/skills/arquitecto/scripts/arquitecto.cjs" ready --pendientes');
  const aprobados = t.indexOf('node .claude/scripts/cambios.cjs listar --aprobados-nuevos');
  const confirmar = t.indexOf('Confirmar en tres líneas');
  assert.ok(cmd >= 0 && aprobados >= 0 && confirmar >= 0);
  assert.ok(aprobados < cmd && cmd < confirmar, 'orden: aprobados nuevos, ready --pendientes, confirmar');
  const paso = /^\d+\. \*\*Módulos sin sello\.\*\*[^\n]*$/m.exec(t);
  assert.ok(paso, 'el paso existe');
  assert.match(paso[0], /Si no imprime nada, no digas nada/);
  assert.match(paso[0], /sin pedido en el mensaje, decí \*"el módulo <x> nació sin sello: llamo al Arquitecto \(Modo B corto\)"\* e invocá `\/arquitecto`/);
  assert.match(paso[0], /con pedido, escribí esa línea después de la del tamaño[^.]*y seguí con el pedido/);
  assert.match(paso[0], /Si el script falla, una línea que lo dice y seguí/);
});

test('inicio: `cambió después del sello` no invoca a nadie: una línea y sigue (r1-11)', () => {
  const paso = /^\d+\. \*\*Módulos sin sello\.\*\*[^\n]*$/m.exec(TEXTOS.inicio);
  assert.ok(paso, 'el paso existe');
  assert.match(paso[0], /Si lista `<x> · sin sello`: sin pedido/);
  assert.match(paso[0], /Si lista `<x> · cambió después del sello`, \*\*no invoques a nadie\*\*: una línea \*"el spec de <x> cambió después del sello; si fue a propósito, corré `sello` de nuevo"\* y seguí/);
  const rama = paso[0].slice(paso[0].indexOf('Si lista `<x> · cambió')).split('Si el script falla')[0];
  assert.doesNotMatch(rama, /invocá `\/arquitecto`/, 'esa rama no invoca al Arquitecto');
});

test('inicio: `borrador a medias` ofrece el retome (pregunta, no Modo B corto); `sello inválido` no invoca a nadie (rf-3, rf-4)', () => {
  const paso = /^\d+\. \*\*Módulos sin sello\.\*\*[^\n]*$/m.exec(TEXTOS.inicio)[0];
  const borrador = paso.slice(paso.indexOf('Si lista `<x> · borrador a medias`')).split('Si lista `<x> · cambió')[0];
  assert.ok(borrador.length > 40, 'la rama existe');
  assert.match(borrador, /\*"¿lo retomamos\?"\*/);
  assert.match(borrador, /invocá `\/arquitecto` para retomarlo \(su retome, no el Modo B corto\)/);
  assert.doesNotMatch(borrador, /llamo al Arquitecto \(Modo B corto\)/);
  const invalido = paso.slice(paso.indexOf('`<x> · sello inválido: <qué>`')).split('Si el script falla')[0];
  assert.match(invalido, /una línea \*"el sello de <x> no vale \(<qué>\): corré `sello` de nuevo"\* y seguí/);
  assert.doesNotMatch(invalido, /invocá/);
});

test('inicio: el comando del Arquitecto existe, resuelto contra kit/skills/ del repo (no contra el ~/.claude/ real), y con "$HOME", no ~ (rf-2)', () => {
  const cs = comandosDeSkill(TEXTOS.inicio);
  assert.equal(cs.length, 1);
  assert.equal(cs[0].skill, 'arquitecto');
  assert.deepEqual(comandosDeSkillRotos(TEXTOS.inicio), []);
  assert.ok(cs[0].linea.startsWith('node "$HOME/.claude/'), 'PowerShell 5.1 no expande ~ en los argumentos de node');
  assert.doesNotMatch(TEXTOS.inicio, /node ~\//);
});

// ---------------------------------------------------------------- el CLAUDE.md del molde

test('molde/CLAUDE.md: la sección "El tamaño del pedido" (P1.7), corta y sin agrandar por plata, permisos o datos', () => {
  const claude = fs.readFileSync(path.join(DIR_MOLDE, 'CLAUDE.md'), 'utf8').replace(/\r\n/g, '\n');
  const h = claude.indexOf('## El tamaño del pedido');
  assert.ok(h >= 0, 'falta la sección');
  const resto = claude.slice(h + 3);
  const fin = resto.search(/^## /m);
  const seccion = fin < 0 ? resto : resto.slice(0, fin);
  assert.match(seccion, /la primera línea de tu respuesta es el tamaño\*\*, sin preguntar/);
  assert.match(seccion, /\*"chico, lo hago acá"\*/);
  assert.match(seccion, /\*"esto es más que chico: llamo al Arquitecto"\*, e invocás `\/arquitecto`/);
  assert.match(seccion, /Tocar plata, permisos o datos reales no lo agranda/);
  assert.ok(Buffer.byteLength(seccion) <= 900, `${Buffer.byteLength(seccion)} bytes: la sección tiene que ser corta`);
  assert.ok(Buffer.byteLength(claude) <= 3500, `${Buffer.byteLength(claude)} bytes: el CLAUDE.md del molde tiene que seguir chico`);
});

test('molde/CLAUDE.md y /inicio paso 6: lo que sale de una charla con el dueño es más que chico, y más que chico siempre invoca /arquitecto, también de noche (D4.2 · pedidos 8 y 10)', () => {
  const claude = fs.readFileSync(path.join(DIR_MOLDE, 'CLAUDE.md'), 'utf8').replace(/\r\n/g, '\n');
  const paso6 = /^\d+\. \*\*El tamaño del pedido[^\n]*$/m.exec(TEXTOS.inicio);
  assert.ok(paso6, 'el paso del tamaño existe');
  for (const [donde, t] of [['molde/CLAUDE.md', claude], ['/inicio paso 6', paso6[0]]]) {
    assert.match(t, /Lo que sale de una charla con el dueño \([^)]*\) es más que chico aunque termine en un documento/, `${donde}: la charla con el dueño`);
    assert.match(t, /Más que chico (\*\*)?siempre invoca `\/arquitecto`(\*\*)?, también (si es para la noche|de noche) o sin el dueño/, `${donde}: siempre invoca, también de noche`);
    assert.match(t, /si trabaja alguien solo y cómo, lo decide el Arquitecto/, `${donde}: quién trabaja lo decide el Arquitecto`);
  }
});

test('inicio paso 8: más que chico invoca /arquitecto sin excepción, ni lo resuelve la sesión ni lo rebota (D4.2 · pedido 10)', () => {
  const paso8 = /^\d+\. \*\*Seguir o preguntar\.\*\*[^\n]*$/m.exec(TEXTOS.inicio);
  assert.ok(paso8, 'el paso 8 existe');
  assert.match(paso8[0], /más que chico, invocás `\/arquitecto` sin excepción \(de noche, sin el dueño, "dejalo armado"\)/);
  assert.match(paso8[0], /ni lo resolvés vos ni lo rebotás/);
});

test('el SKILL.md del Arquitecto mide el tamaño igual que la sesión: la charla con el dueño agranda (D4.2)', () => {
  const sk = fs.readFileSync(path.join(DIR_KIT_SKILLS, 'arquitecto', 'SKILL.md'), 'utf8').replace(/\r\n/g, '\n');
  assert.match(sk, /Lo que sale de una charla con el dueño \([^)]*\) es más que chico, aunque termine en un documento/);
  assert.ok(Buffer.byteLength(sk) <= 6000, `${Buffer.byteLength(sk)} bytes: el SKILL.md del Arquitecto tiene que seguir en 6.000 o menos`);
});

test('modo-b B2: una pantalla lleva prototipo siempre, antes del spec, también en corto y con "dale con los defaults" (D4.2 · pedido 16)', () => {
  const mb = fs.readFileSync(path.join(DIR_KIT_SKILLS, 'arquitecto', 'anexos', 'modo-b.md'), 'utf8').replace(/\r\n/g, '\n');
  const h = mb.indexOf('## B2');
  assert.ok(h >= 0, 'falta B2');
  const resto = mb.slice(h + 3);
  const b2 = resto.slice(0, resto.search(/^## /m));
  assert.match(b2, /lleva prototipo siempre, antes del `SPEC\.md`\*\*: también en Modo B corto, con "dale con los defaults" \(saltea las preguntas, no el prototipo\) y aunque parezca chica/);
  assert.match(b2, /Si nadie puede aprobarlo en el momento \(de noche, por ejemplo\), igual se arma y el OK del spec lo incluye/);
  assert.match(mb, /todo a Supuestos, salvo el prototipo de pantalla \(B2\)/);
});

test('molde/CLAUDE.md, /inicio y /cierre: ni rastro de la regla vieja de tamaño (P1.7, criterio 3)', () => {
  // El patrón se arma en pedazos: entero, este archivo rompería el grep del criterio 3 sobre kit/.
  const vieja = new RegExp(['bolsill' + 'o', 'en una ' + 'tarde', 'o ries' + 'gosa', 'toca permisos\\/datos\\/' + 'plata'].join('|'), 'i');
  const claude = fs.readFileSync(path.join(DIR_MOLDE, 'CLAUDE.md'), 'utf8');
  for (const t of [claude, TEXTOS.inicio, TEXTOS.cierre]) assert.doesNotMatch(t, vieja);
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

test('rf-1: /cierre e /inicio traen el remoto con git pull --rebase, nunca con merge, y dicen por qué; /cierre reapunta tras el rebase', () => {
  for (const t of [TEXTOS.cierre, TEXTOS.inicio]) {
    assert.match(t, /`git pull --rebase`/);
    assert.match(t, /nunca un pull con merge sobre la rama por defecto/);
    assert.match(t, /un merge deja el sello fuera de la historia de primer padre/);
    assert.doesNotMatch(t, /`git pull`/, 'ningún pull a secas');
  }
  assert.match(TEXTOS.cierre, /Si el rebase reescribió el commit de un `aplicado`, `cambios\.cjs verificar` lo dice con el `anotar-sha` listo/);
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

// ---------------------------------------------------------------- el núcleo, /director, /obrero y el revisor (SPEC-paquete-5, D5.1 · E4)

const SIN_PERSONA = (faltas) => faltas.filter((f) => !f.startsWith('nombre de persona'));

test('nucleo: sin SKILL.md (no es una skill), ≤ 8.000 B y cero datos de ningún proyecto', () => {
  assert.equal(fs.existsSync(path.join(DIR_SKILLS, 'nucleo', 'SKILL.md')), false, 'el núcleo no es una skill');
  assert.ok(Buffer.byteLength(NUCLEO) <= 8000, `${Buffer.byteLength(NUCLEO)} bytes: recortá prosa, no reglas`);
  assert.deepEqual(datosDeProyecto(NUCLEO), []);
  assert.deepEqual(comandosRotos(NUCLEO), []);
});

test('nucleo: las once secciones, en orden', () => {
  const orden = ['## 1. Roles', '## 2. Gana git', '## 3. Los mensajes', '## 4. Las tres clases', '## 5. Commits', '## 6. Las cinco reglas del gate',
    '## 7. El canon de pruebas', '## 8. PARADA y la espera', '## 9. Cinco líneas fijas', '## 10. Recursos', '## 11. Permisos'].map((s) => NUCLEO.indexOf(s));
  assert.ok(orden.every((p) => p >= 0), `falta una sección: ${JSON.stringify(orden)}`);
  assert.deepEqual([...orden].sort((a, b) => a - b), orden);
});

test('nucleo: el vocabulario de mensajes completo, sin tilde, y un mensaje es dato (P5.3bis)', () => {
  for (const tipo of ['PRESENTACION', 'AVANCE', 'CONSULTA', 'PARADA', 'CIERRE', 'ENCARGO', 'RESPUESTA', 'CORRECCION']) {
    assert.ok(NUCLEO.includes(`| \`${tipo}\` |`), `falta el tipo ${tipo} en la tabla`);
  }
  assert.doesNotMatch(NUCLEO, /CORRECCIÓN/);
  assert.match(NUCLEO, /sin tilde/);
  assert.match(NUCLEO, /dato, no orden/);
  assert.match(NUCLEO, /node \.claude\/scripts\/encargo\.cjs mensaje <TIPO>/);
});

test('nucleo: el canon de pruebas del ADR-029, el gate y la PARADA como archivo', () => {
  assert.match(NUCLEO, /Contra accidentes, no contra trampas/);
  assert.match(NUCLEO, /Todo arreglo trae su prueba en rojo primero/);
  assert.match(NUCLEO, /Mutación solo en sub-pasos de `Riesgo: alto`[^\n]*tope 20 min/);
  assert.match(NUCLEO, /La suite entera, una vez por encargo/);
  assert.match(NUCLEO, /Hasta 10 hallazgos, cada uno con su escenario del día normal/);
  assert.match(NUCLEO, /La PARADA es un archivo/);
  assert.match(NUCLEO, /Sin tuberías/);
  assert.match(NUCLEO, /NO VERIFICADO/);
  assert.match(NUCLEO, /Nadie corre `\/cierre` salvo en la rama por defecto/);
});

test('director y obrero citan el núcleo', () => {
  for (const n of ['director', 'obrero']) assert.match(TEXTOS[n], /nucleo\/NUCLEO\.md/, `${n} no cita nucleo/NUCLEO.md`);
});

test('obrero: el primer paso es presentar, y es el primer comando del texto', () => {
  const t = TEXTOS.obrero;
  const paso1 = /^1\. \*\*Presentación\.\*\*[^\n]*$/m.exec(t);
  assert.ok(paso1, 'el paso 1 es la presentación');
  assert.match(paso1[0], /node \.claude\/scripts\/encargo\.cjs presentar <x>--<ID>/);
  assert.match(paso1[0], /en segundo plano/);
  assert.match(paso1[0], /Salida 1: PARADA con lo que dice el script, sin tocar nada/);
  assert.match(paso1[0], /spec sin Arquitecto: corré Modo B/);
  const [primero] = comandos(t);
  assert.equal(primero.script, 'encargo');
  assert.equal(primero.sub, 'presentar');
  const pos = ['**Presentación.**', '**Chequeo base.**', '**Por sub-paso**', '**Lo que no está en AUTORIZADO.**', '**CIERRE.**'].map((s) => t.indexOf(s));
  assert.ok(pos.every((p) => p >= 0), `falta un paso: ${JSON.stringify(pos)}`);
  assert.deepEqual([...pos].sort((a, b) => a - b), pos);
});

test('obrero: PARADA solo si se negó lo que el sub-paso necesita, sin rodeos; el cierre es un commit por rutas, push por nombre y CIERRE (r1-2)', () => {
  const t = TEXTOS.obrero;
  assert.match(t, /PARADA = se negó algo que el sub-paso necesita/);
  assert.match(t, /Un comando compuesto negado se parte y se repite una vez/);
  assert.match(t, /Nunca un rodeo/);
  assert.match(t, /Un solo commit por rutas con la evidencia y `\.claude\/frenos\.log`/);
  assert.match(t, /git push origin modulo\/<x>--<ID>` por nombre/);
  assert.match(t, /CIERRE @<sha7>/);
  assert.match(t, /No corrés `\/cierre`/);
  assert.match(t, /el agente `revisor`/);
});

test('director: el sello, el encargo, crear, autorizado y verificar, en ese orden (P5.5)', () => {
  const t = TEXTOS.director;
  const pos = [
    t.indexOf('encargo.cjs presentar --spec'),
    t.indexOf('encargo.cjs partida <x>--<ID>'),
    t.indexOf('worktree.cjs crear <x>--<ID>'),
    t.indexOf('encargo.cjs autorizado <x>--<ID>'),
    t.indexOf('ENCARGO <ruta>@<sha7>'),
    t.indexOf('encargo.cjs mensaje <TIPO>'),
    t.indexOf('encargo.cjs verificar <x>--<ID>'),
    t.indexOf('worktree.cjs cerrar <x>--<ID>'),
    t.indexOf('worktree.cjs integrar <x>'),
  ];
  assert.ok(pos.every((p) => p >= 0), `falta alguno: ${JSON.stringify(pos)}`);
  assert.deepEqual([...pos].sort((a, b) => a - b), pos, 'orden de los pasos');
  assert.match(t, /\*\*siempre después\*\* `node \.claude\/scripts\/encargo\.cjs autorizado/);
  assert.match(t, /invocá `\/arquitecto` \(Modo B corto\)/);
});

test('director: verificar e integrar en segundo plano; merge --no-ff del SHA de la línea 1, sin preguntar; rojo no se mergea (r1-7, r1-8)', () => {
  const t = TEXTOS.director;
  const p6 = /^6\. \*\*Cierre del encargo\.\*\*[^\n]*$/m.exec(t);
  assert.ok(p6, 'el paso 6 existe');
  assert.match(p6[0], /verificar <x>--<ID>` \*\*en segundo plano\*\*/);
  assert.match(p6[0], /punta @<sha7>/);
  assert.match(p6[0], /git merge --no-ff <sha7>/);
  assert.match(p6[0], /del SHA de esa línea y no del nombre de la rama, sin preguntar/);
  assert.match(p6[0], /Rojo o NO VERIFICADO: nunca merge/);
  const p9 = /^9\. \*\*Termina el módulo\.\*\*[^\n]*$/m.exec(t);
  assert.ok(p9, 'el paso 9 existe');
  assert.match(p9[0], /integrar <x>` en segundo plano/);
  assert.match(p9[0], /--ok-de-guido/);
});

test('director: la apertura es del dueño por defecto y el director lanza solo con la línea de fondo de autorizado (D5-2, D5-19)', () => {
  const t = TEXTOS.director;
  assert.match(t, /Por defecto la hace el dueño/);
  assert.match(t, /Apertura: director/);
  assert.match(t, /línea de fondo que imprimió `autorizado`, nunca otra/);
  assert.match(t, /su pestaña abre en su modo/);
});

test('director: cancelar deja el SHA en la ficha, manda CORRECCION y borra la rama local y la de origin (r1-6)', () => {
  const t = TEXTOS.director;
  assert.match(t, /cancelado <ID> @<sha7 de la punta>: por qué/);
  assert.match(t, /`CORRECCION` con `cancelado`/);
  assert.match(t, /git branch -D modulo\/<x>--<ID>/);
  assert.match(t, /git push origin --delete modulo\/<x>--<ID>/);
});

test('director: silencio (no contesta AVANCE), "me voy" en un bloque y Sesiones vivas en la ficha', () => {
  const t = TEXTOS.director;
  assert.match(t, /No contestes un AVANCE/);
  assert.match(t, /cero texto/);
  assert.match(t, /Un solo bloque fijo/);
  assert.match(t, /## Sesiones vivas` \(`- <nombre> · <id de sesión o —> · <ruta> · <rama> · <modo>`\)/);
  assert.match(t, /\*\*Nunca:\*\* escribir código, resolver un conflicto/);
});

test('plantilla del encargo: los campos y las cinco secciones, en el orden congelado (P3.4)', () => {
  const campos = ['# Encargo <ID> · <x> · <título>', '- Partida: rama modulo/<x>--<ID> desde modulo/<x>@<sha7> · <AAAA-MM-DDTHH:MM±HH:MM>',
    '- Spec: docs/modulos/<x>/SPEC[-N].md:<línea>[-<línea>]', '- Skill: obrero', '- Modelo: sonnet | opus · Esfuerzo: low | medium | high · Por qué: <razón>',
    '- Riesgo: bajo | alto · Por qué: <razón>', '- Apertura: Guido | director', '- Suscripción: <cuándo avisar, una línea> | —',
    '## Toca', '## Alcance', '## NO SE TOCA', '## AUTORIZADO', '## GATE'];
  const pos = campos.map((c) => PLANTILLA.indexOf(c));
  assert.ok(pos.every((p) => p >= 0), `falta: ${campos.filter((c, i) => pos[i] < 0).join(' | ')}`);
  assert.deepEqual([...pos].sort((a, b) => a - b), pos, 'orden');
  // `Guido` es un valor del campo Apertura que lee el script: lo único permitido.
  assert.deepEqual(SIN_PERSONA(datosDeProyecto(PLANTILLA)), []);
});

test('el revisor: opus, effort alto y solo lectura (sin Bash), con lo que /obrero y el canon le piden (D5-17)', () => {
  const f = frontmatter(REVISOR);
  assert.ok(f, 'frontmatter');
  assert.equal(f.name, 'revisor');
  assert.equal(f.model, 'opus');
  assert.equal(f.effort, 'high');
  assert.ok(f.tools, 'tools:');
  const tools = f.tools.split(',').map((s) => s.trim());
  assert.deepEqual(tools, ['Read', 'Grep', 'Glob']);
  assert.ok(!tools.some((x) => /^(Bash|PowerShell|Write|Edit)$/.test(x)), 'sin shell y sin escribir');
  assert.ok(f.description.length >= 60);
  assert.match(REVISOR, /Hasta 10 hallazgos, cada uno con su escenario del día normal/);
  assert.match(REVISOR, /Arrancá en "le falta"/);
  for (const v of ['APROBADO', 'CON OBSERVACIONES', 'RECHAZADO']) assert.ok(REVISOR.includes(v), v);
  assert.match(REVISOR, /Contra accidentes, no contra trampas/);
  assert.deepEqual(datosDeProyecto(REVISOR), []);
});

test('sin bypass: ni el núcleo, ni las skills, ni la plantilla, ni el revisor nombran saltarse los permisos (D5-2, criterio 11)', () => {
  for (const [donde, t] of [['nucleo', NUCLEO], ['director', TEXTOS.director], ['obrero', TEXTOS.obrero], ['plantilla', PLANTILLA], ['revisor', REVISOR]]) {
    assert.doesNotMatch(t, /bypass/i, donde);
    assert.doesNotMatch(t, /dangerously|skip-permissions/i, donde);
  }
});

test('los chequeos: las órdenes del encargo y del worktree se aceptan; una inventada, no', () => {
  assert.deepEqual(comandosRotos('`node .claude/scripts/encargo.cjs verificar <x>--<ID>` y `node .claude/scripts/worktree.cjs integrar <x>`'), []);
  assert.deepEqual(comandosRotos('`node .claude/scripts/worktree.cjs crear <x>--<ID>` y `node .claude/scripts/worktree.cjs cerrar <x>`'), []);
  assert.equal(comandosRotos('`node .claude/scripts/encargo.cjs inventado`').length, 1);
  assert.equal(comandosRotos('`node .claude/scripts/worktree.cjs mergear`').length, 1);
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
    'sumá `--ok-de-guido`',
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

test('los chequeos: comandosDeSkill extrae el comando y lo resuelve contra kit/skills/ del repo', () => {
  const [c] = comandosDeSkill('`node "$HOME/.claude/skills/arquitecto/scripts/arquitecto.cjs" ready --pendientes`');
  assert.deepEqual({ skill: c.skill, ruta: c.ruta, sub: c.sub, flags: c.flags }, { skill: 'arquitecto', ruta: 'scripts/arquitecto.cjs', sub: 'ready', flags: ['--pendientes'] });
  assert.equal(path.relative(DIR_KIT_SKILLS, rutaEnKit(c)).replace(/\\/g, '/'), 'arquitecto/scripts/arquitecto.cjs');
  assert.ok(!rutaEnKit(c).includes('.claude'), 'no apunta al ~/.claude/ real');
  assert.equal(comandosDeSkill('`node .claude/scripts/todo.cjs cierre`').length, 0, 'los scripts del proyecto los cubre comandos()');
  assert.equal(comandosDeSkillRotos('`node ~/.claude/skills/inventada/scripts/x.cjs ready`').length, 1);
});

test('los chequeos: marcasFueraDeLugar detecta una marca repetida, rota o dentro de un bloque de código', () => {
  const ok = `texto\n${MARCA_ABRE}\n## x\n${MARCA_CIERRA}\n`;
  assert.deepEqual(marcasFueraDeLugar(ok), []);
  assert.ok(marcasFueraDeLugar(`${ok}${ok}`).length > 0);
  assert.ok(marcasFueraDeLugar(`${MARCA_ABRE}\n`).length > 0);
  assert.ok(marcasFueraDeLugar(`\`\`\`\n${MARCA_ABRE}\n\`\`\`\n${ok}`).length > 0);
});
