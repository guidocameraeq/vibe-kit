'use strict';
// skill.test.cjs — P2.4 "el nombre viejo sigue andando" (SPEC-paquete-6): la skill sigue siendo `arquitecto-skills` (el Equipador),
// la puerta nueva es /arquitecto → "la PC", y el SKILL.md no promete comandos que sus scripts no tienen.
// Es texto para un agente: lo que se puede chequear con un script se chequea acá (el nombre, que cada comando citado exista en el USO
// de su script, que flota.md derive a /arquitecto-skills). Lo que juzga el modelo (el tono, el orden de la charla) no.
// Correr: node --test kit/skills/arquitecto-skills/scripts/skill.test.cjs
// KIT_SKILL_MD cambia el SKILL.md a leer: solo para la prueba de mutación (una copia rota tiene que dar rojo).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const SCRIPTS = __dirname;
const SKILL = process.env.KIT_SKILL_MD ? path.resolve(process.env.KIT_SKILL_MD) : path.join(SCRIPTS, '..', 'SKILL.md');
const FLOTA = path.join(SCRIPTS, '..', '..', 'arquitecto', 'anexos', 'flota.md');
const SCRIPTS_ARQ = path.join(SCRIPTS, '..', '..', 'arquitecto', 'scripts');
const TOPE_BYTES = 10202; // SPEC-paquete-6 MODIFICA: el SKILL.md "no crece" (lo que hace el script sale de la prosa)

const leer = (p) => fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
const TEXTO = leer(SKILL);

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

// Los comandos de script que cita el texto: cada `<nombre>.cjs` con los `--flags` que le siguen en su renglón (hasta el próximo .cjs).
function comandosCitados(texto) {
  const out = [];
  for (const linea of texto.split('\n')) {
    const hallados = [...linea.matchAll(/([A-Za-z0-9_-]+\.cjs)\b/g)];
    hallados.forEach((m, i) => {
      const hasta = i + 1 < hallados.length ? hallados[i + 1].index : linea.length;
      const resto = linea.slice(m.index + m[0].length, hasta);
      const flags = [...resto.matchAll(/(?:^|[\s`(])(--[a-z][a-z-]*)/g)].map((x) => x[1]);
      out.push({ script: m[1], flags, linea: linea.trim() });
    });
  }
  return out;
}
// El USO de un script, tal como lo imprime: corriéndolo con una opción que no existe (sale 2 con su uso, sin hacer nada).
function usoDe(ruta) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-uso-'));
  try {
    const r = spawnSync(process.execPath, [ruta, '--opcion-que-no-existe'], { encoding: 'utf8', cwd: tmp, env: { ...process.env, HOME: tmp, USERPROFILE: tmp }, timeout: 30000 });
    return `${r.stdout}${r.stderr}`;
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}
const dondeEstá = (script) => [path.join(SCRIPTS, script), path.join(SCRIPTS_ARQ, script)].find((p) => fs.existsSync(p));

test('el nombre: el frontmatter dice name: arquitecto-skills y trae su description', () => {
  const fm = frontmatter(TEXTO);
  assert.ok(fm, 'el SKILL.md abre con su frontmatter');
  assert.equal(fm.name, 'arquitecto-skills');
  assert.ok(fm.description && fm.description.length > 40, 'trae description');
  assert.match(fm.description, /preparame esta máquina/);
});

test('cada comando de script que el SKILL.md cita existe, y cada --opción citada está en el USO de ese script', () => {
  const citados = comandosCitados(TEXTO);
  assert.ok(citados.length >= 4, `esperaba varios comandos citados, hay ${citados.length}`);
  const nombres = new Set(citados.map((c) => c.script));
  for (const necesario of ['preparar-pc.cjs', 'instalar-hooks-pc.cjs', 'doctor.cjs']) assert.ok(nombres.has(necesario), `el SKILL.md tiene que citar ${necesario}`);
  const usos = new Map();
  for (const c of citados) {
    const ruta = dondeEstá(c.script);
    assert.ok(ruta, `${c.script} no existe (citado en: ${c.linea})`);
    if (!usos.has(ruta)) usos.set(ruta, usoDe(ruta));
    const uso = usos.get(ruta);
    assert.match(uso, /uso:/i, `${c.script} no imprime su USO`);
    for (const f of c.flags) assert.ok(uso.includes(f), `${c.script} no tiene ${f} en su USO (citado en: ${c.linea})`);
  }
});

test('INSTALAR y AUTO-ACTUALIZAR pasan por preparar-pc: desde un tag anotado, una sola pregunta, nunca la punta de main', () => {
  assert.match(TEXTO, /preparar-pc\.cjs/);
  assert.match(TEXTO, /tag anotado/);
  assert.match(TEXTO, /actualizar\.cjs\n?\s*ultimo-tag <clon>/,'el tag lo elige un comando (git tag --sort pone el rc arriba de la versión)');
  assert.match(TEXTO, /AskUserQuestion/);
  assert.match(TEXTO, /nunca (?:la punta de )?`?main/i);
  assert.match(TEXTO, /--plan/);
});

test('HOOKS POR PC suma el doctor completo y el inventario de frenos', () => {
  assert.match(TEXTO, /doctor\.cjs/);
  assert.match(TEXTO, /inventario/);
});

test('el SKILL.md no crece (SPEC-paquete-6 MODIFICA): tope en bytes', () => {
  const bytes = fs.statSync(SKILL).size;
  assert.ok(bytes <= TOPE_BYTES, `el SKILL.md pesa ${bytes} bytes y el tope es ${TOPE_BYTES}: sacá prosa que ya hace el script`);
});

test('flota.md (la puerta nueva, /arquitecto) deriva la PC a /arquitecto-skills', () => {
  const t = leer(FLOTA);
  const pc = /## La PC\n([\s\S]*?)(?=\n## )/.exec(t);
  assert.ok(pc, 'flota.md tiene su sección "La PC"');
  assert.match(pc[1], /`\/arquitecto-skills`/);
  assert.match(pc[1], /Equipador/);
});

// RF-fix rf-6: con un README propio, `portada.cjs armar` no lo pisa y sale 1; si los docs mandaran `piezas.portada: sí` igual, el
// candado:portada quedaría rojo para siempre. Los dos lugares que mandan prenderla la condicionan a armar 0 o chequear 0.
test('flota.md (adoptar) y modo-a.md: piezas.portada: sí SOLO si portada.cjs armar salió 0 o chequear da 0; si no, apagada y una línea', () => {
  for (const f of [FLOTA, path.join(SCRIPTS, '..', '..', 'arquitecto', 'anexos', 'modo-a.md')]) {
    const lineas = leer(f).split('\n').filter((l) => /piezas\.portada: sí/.test(l));
    assert.equal(lineas.length, 1, `${path.basename(f)}: una sola línea manda prender la portada`);
    const l = lineas[0];
    assert.match(l, /`piezas\.portada: sí` en la ficha \*\*solo si\*\* `armar` salió 0 o `node \.claude\/scripts\/portada\.cjs chequear` da 0/, path.basename(f));
    assert.match(l, /"portada: README propio, queda apagada"/, path.basename(f));
  }
});

// SPEC-paquete-8b (15), D8b-8: el Modo A monta el molde v3 con el adoptador sobre un clon (--nuevo, --principal), no templates/;
// el SPEC-0 vive en docs/modulos/v1/SPEC.md y el Paso 0 busca también los SPEC-0.md de antes.
test('modo-a.md (8b, 15): el Paso 5 nombra adoptar --nuevo y --principal, el --traer (el pull y los githooks) antes del sello; no templates/; el SPEC-0 en docs/modulos/v1/', () => {
  const t = leer(path.join(SCRIPTS, '..', '..', 'arquitecto', 'anexos', 'modo-a.md'));
  assert.doesNotMatch(t, /templates\//);
  assert.doesNotMatch(t, /molde v2/);
  const p5 = /## Paso 5[\s\S]*?(?=\n## )/.exec(t)[0];
  for (const x of ['--mirar --nuevo', '--comando-test "<comando>"', 'gate:entorno-prueba', '--principal "<carpeta>"', '--traer "<carpeta>"', '.kit-rol', 'docs/modulos/v1/SPEC.md', 'docs/modulos/v1/README.md']) assert.ok(p5.includes(x), `el Paso 5 no nombra ${x}`);
  // el orden: el adoptador, el pull y recién ahí el sello y ready; después la portada
  const pos = ['--mirar --nuevo', '--aplicar', '--traer "<carpeta>"', '<arq> sello', '<arq> ready', 'portada.cjs armar'].map((x) => p5.indexOf(x));
  assert.ok(pos.every((v, i) => v >= 0 && (i === 0 || v > pos[i - 1])), `el orden del Paso 5: ${pos.join(' ')}`);
  assert.match(t, /\*\*nunca lleva `\.kit-rol`\*\*/);
  const p0 = /## Paso 0[\s\S]*?(?=\n## )/.exec(t)[0];
  assert.ok(p0.includes('*/docs/modulos/v1/SPEC.md') && p0.includes('*/SPEC-0.md'), 'el Paso 0 busca los dos');
  assert.ok(t.includes('`inicio — ejecutá docs/modulos/v1/SPEC.md (está READY)`'), 'la línea para abrir');
  // 8c r1 (D8r.1-1): con director, el Paso 5 arma el worktree de v1 y la línea del Paso 6 es /director v1
  assert.ok(p5.includes('`node .claude/scripts/worktree.cjs crear v1`'), 'el Paso 5 con director arma el worktree de v1');
  const p6 = /## Paso 6[\s\S]*?(?=\n## )/.exec(t)[0];
  assert.ok(p6.includes('`/director v1`'), 'la línea del Paso 6 con director');
  // formato-spec.md dice lo mismo (renglones 5 y 104)
  const fs0 = leer(path.join(SCRIPTS, '..', '..', 'arquitecto', 'anexos', 'formato-spec.md'));
  assert.ok(fs0.includes('`docs/modulos/v1/SPEC.md`') && !fs0.includes('(SPEC-0.md, está READY)'), 'formato-spec.md');
});

// RF-fix rf-7: la nota de 3.0.0 de kit/CHANGELOG.md (la que lee la fusión al actualizar) nombra lo nuevo del paquete 7.
const CHANGELOG_KIT = path.join(SCRIPTS, '..', '..', '..', 'CHANGELOG.md'); // kit/CHANGELOG.md (solo en el kit, no instalado)
test('kit/CHANGELOG.md, la nota de 3.0.0: subio-al-kit y cubiertos.md, portada.cjs armar y piezas.portada, cambios-flota, migrar-cambios', { skip: !fs.existsSync(CHANGELOG_KIT) && 'sin kit/CHANGELOG.md' }, () => {
  const m = /^## 3\.0\.0(?:-rc\.1)?\n([\s\S]*?)(?=\n## )/m.exec(leer(CHANGELOG_KIT)); // D8b: la nota v3 entera vive en la del rc.1 (las rc.N de después traen solo lo suyo: D8r.1)
  assert.ok(m, 'trae la sección 3.0.0');
  const piezas = /- \*\*Qué piezas cambiaron\*\*:([\s\S]*?)\n- \*\*/.exec(m[1]);
  assert.ok(piezas, 'con su "Qué piezas cambiaron"');
  for (const x of ['`subio-al-kit`', '`kit/cubiertos.md`', '`portada.cjs armar`', '`piezas.portada`', '`cambios-flota.cjs`', '`migrar-cambios.cjs`', '`CAMBIOS.md` único']) {
    assert.ok(piezas[1].includes(x), `la nota de 3.0.0 no nombra ${x}`);
  }
});

// ---------------------------------------------------------------- SPEC-paquete-8r, encargo E: los textos dicen lo que hace el código
// (ADR-034). Los manuales, la guía y el README viven solo en el repo del kit (no se instalan): sin ellos, esas pruebas se saltean.
const ARQ = path.join(SCRIPTS, '..', '..', 'arquitecto');
const RAIZ_REPO = path.join(SCRIPTS, '..', '..', '..', '..');
const enRepo = (rel) => path.join(RAIZ_REPO, rel);
const SIN_REPO = !fs.existsSync(enRepo('manuales/EQUIPADOR.md')) && 'sin el repo del kit (manuales/)';
const APROBAR = '`cambios aprobar` lo corre la sesión cuando el dueño lo pide, y su clic en la ventana es la firma; nunca por su cuenta';
const seccion = (t, titulo) => {
  const i = t.indexOf(titulo);
  if (i < 0) return null;
  const resto = t.slice(i + titulo.length);
  const fin = resto.search(/^## /m);
  return fin < 0 ? resto : resto.slice(0, fin);
};

test('flota.md (8r §3): la mezcla que choca nunca se resuelve sola; se pregunta siempre, en criollo, con las cuatro salidas', () => {
  const t = leer(FLOTA);
  assert.match(t, /la mezcla chocó/);
  assert.match(t, /\*\*La mezcla que choca nunca se resuelve sola\*\*/);
  assert.match(t, /\*\*preguntá siempre\*\*/);
  for (const x of ['qué skill es', 'por qué la había adaptado (su `por:`)', 'qué trae la nueva', '`## Dónde chocan`', 'ADR-030', 'recomendada primera']) {
    assert.ok(t.includes(x), `flota.md no dice ${x}`);
  }
  assert.match(t, /\*\*mezclar · quedarse con la tuya \(`quedarse`\) · tomar la nueva · congelar\*\*/);
  assert.doesNotMatch(t, /con porqué se fusionan solas;/, 'el texto viejo: con porqué se fusionaba sola aunque chocara');
});

test('flota.md (8r 4, t2, t4, t9): la adopción con --claude-md, el director/obrero propio a mano, migrar-cambios, el clon y el último tag', () => {
  const t = leer(FLOTA);
  const adoptar = t.slice(t.indexOf('**"Adoptá X"**'));
  for (const x of ['--claude-md', 'a mano', 'migrar-cambios.cjs" --repo <clon>', '--plan', '--commit', 'De dónde sale el clon', 'Cómo vuelve', '--principal', 'director-obrero']) {
    assert.ok(adoptar.includes(x), `la adopción de flota.md no nombra ${x}`);
  }
  assert.ok(adoptar.indexOf('--plan') < adoptar.indexOf('--commit'), 'primero --plan, después --commit');
  assert.doesNotMatch(t, /P6\.8b, orden 7/);
  assert.match(t, /sin `--tag`: el último tag anotado, \*\*rc incluido\*\*, a todo proyecto con ficha/);
  assert.match(t, /\*\*sin mezclar\*\* en su rama por defecto/);
});

test('modo-b.md y formato-spec.md (8r T1, T2, T3): el director pide la ficha; su primer mensaje es /director; la tarea 0 con su forma y el 00', () => {
  const mb = leer(path.join(ARQ, 'anexos', 'modo-b.md'));
  const b4 = seccion(mb, '## B4');
  const b5 = seccion(mb, '## B5');
  const b6 = seccion(mb, '## B6');
  assert.ok(b4 && b5 && b6, 'modo-b.md trae B4, B5 y B6');
  assert.match(b4, /`piezas\.director-obrero: sí` \(o `molde`\)/);
  assert.match(b5, /`piezas\.director-obrero: sí` \(o `molde`\)[^\n]*`\.claude\/scripts\/worktree\.cjs`/);
  assert.match(b4, /`- \*\*Tarea 0\*\*: montar la base de prueba`/);
  assert.match(b4, /encargo `00`/);
  assert.match(b4, /3\.0\.0-rc\.2/);
  const director = b6.split('\n').find((l) => l.includes('**Con director**'));
  assert.ok(director, 'B6 trae la línea con director');
  assert.doesNotMatch(director, /inicio — ejecutá/);
  assert.match(director, /`\/director <x>`/, 'D8r.4-2: con el módulo, como lo imprime worktree.cjs');
  assert.doesNotMatch(mb, /primer mensaje: \/director`/, 'B5: la apertura dice /director <x>');
  // 8r4 u5: B0 nacer/retomar; B5, el worktree con el spec en BORRADOR bajo el director
  assert.match(seccion(mb, '## B0'), /\*\*Nacer\*\*[\s\S]*\*\*Retomar\*\* un módulo que ya nació/);
  assert.match(b5, /el worktree puede armarse con el spec todavía en BORRADOR/);
  assert.match(b5, /adoptar/, 'B5.6 apunta a adoptar');
  assert.doesNotMatch(mb, /templates de esta skill/);
  const fs0 = leer(path.join(ARQ, 'anexos', 'formato-spec.md'));
  const abrir = fs0.split('\n').find((l) => l.startsWith('- **La línea para abrir**'));
  const conDirector = abrir.slice(abrir.indexOf('con director'), abrir.indexOf('SPEC-0,'));
  assert.doesNotMatch(conDirector, /inicio — ejecutá/);
  assert.match(conDirector, /`\/director <x>`/, 'D8r.4-2: con el módulo, como lo imprime worktree.cjs');
  assert.match(fs0, /`- \*\*Tarea 0\*\*: montar la base de prueba`/);
  assert.match(fs0, /\*\*el encargo `00`\*\*/);
  assert.match(fs0, /`entorno — \(tarea 0: montar el entorno de prueba\)`/);
});

test('arquitecto/SKILL.md (8r t5, t7): el ruteo busca los borradores de Modo A en docs/modulos/v1/SPEC.md; apunta a adoptar, no a los moldes v2', () => {
  const sk = leer(path.join(ARQ, 'SKILL.md'));
  assert.ok(sk.includes('`<carpeta de proyectos>/*/docs/modulos/v1/SPEC.md`') && sk.includes('`<carpeta de proyectos>/*/SPEC-0.md`'), 'el ruteo busca los dos');
  assert.match(sk, /lo monta el adoptador \(`adoptar`/);
  assert.ok(!fs.existsSync(path.join(ARQ, 'templates', 'universales')), 'templates/universales/ ya no está en el Arquitecto');
  assert.ok(fs.existsSync(path.join(ARQ, 'templates', 'adaptables', 'smoke.contrato.md')), 'los adaptables se quedan');
  assert.doesNotMatch(leer(path.join(ARQ, 'templates', 'LEEME.md')), /^## `universales\/`/m);
});

test('consultorio.md (8r, 8): ¿Autonomía? ejecutar en auto, con acceptEdits de respaldo y el commit previo como red', () => {
  const fila = leer(path.join(ARQ, 'anexos', 'consultorio.md')).split('\n').find((l) => l.startsWith('| ¿Autonomía? |'));
  assert.ok(fila, 'la fila ¿Autonomía?');
  assert.match(fila, /Ejecutar → `auto`/);
  assert.match(fila, /`acceptEdits` de respaldo/);
  assert.match(fila, /commit previo como red/);
});

test('templates/universales a legacy/ con lápida (8r t5)', { skip: !fs.existsSync(enRepo('legacy/LEEME.md')) && 'sin el repo del kit (legacy/)' }, () => {
  const lapida = leer(enRepo('legacy/templates-universales-v2/LEEME.md'));
  assert.match(lapida, /ARCHIVADO 2026-11-03/);
  assert.ok(fs.existsSync(enRepo('legacy/templates-universales-v2/skills/inicio/SKILL.md')));
  assert.match(leer(enRepo('legacy/LEEME.md')), /\[`templates-universales-v2\/`\]\(templates-universales-v2\/\)/);
});

test('crit. 4 (8r T4): la guía y el manual del Equipador no dicen que "preparame esta PC" o "actualizate" esperan otro tag', { skip: SIN_REPO }, () => {
  for (const rel of ['GUIA-DE-USO.md', 'manuales/EQUIPADOR.md']) {
    const t = leer(enRepo(rel));
    assert.doesNotMatch(t, /cuando exista el tag|[Ll]lega con el tag|con su tag\)|el último tag es `v2/, rel);
    for (const l of t.split('\n').filter((x) => /v2\.4\.3|versión oficial|cuando exista el tag/.test(x))) {
      assert.doesNotMatch(l, /preparame|actualizate|preparar-pc/i, `${rel}: ${l}`);
    }
  }
});

test('crit. 6 (8r, 2): quién corre aprobar, dicho igual en los manuales y la guía; nadie dice la frase vieja (la de "jamás lo …")', { skip: SIN_REPO }, () => {
  for (const rel of ['manuales/MOLDE.md', 'manuales/ROLES.md', 'manuales/SCRIPTS.md']) assert.ok(leer(enRepo(rel)).includes(APROBAR), `${rel} no trae la línea de aprobar`);
  const guia = leer(enRepo('GUIA-DE-USO.md'));
  assert.ok(guia.split(APROBAR).length - 1 >= 2, 'la guía la trae en la receta y en la chuleta');
  const vieja = new RegExp('jamás lo ' + 'corras'); // en pedazos: entero, este archivo rompería el grep del criterio 6
  for (const rel of ['GUIA-DE-USO.md', 'manuales/MOLDE.md', 'manuales/ROLES.md', 'manuales/SCRIPTS.md', 'manuales/EQUIPADOR.md']) assert.doesNotMatch(leer(enRepo(rel)), vieja, rel);
  for (const f of [path.join(ARQ, 'SKILL.md'), SKILL, FLOTA]) assert.doesNotMatch(leer(f), vieja, f);
});

test('crit. 10 (8r, 6-8): EQUIPADOR.md con las cuatro salidas y core.hooksPath; el manual del Arquitecto con el molde v3', { skip: SIN_REPO }, () => {
  const eq = leer(enRepo('manuales/EQUIPADOR.md'));
  for (const x of ['**mezclar**', '**quedarse con la tuya**', '--traer', '**tomar la nueva**', '**congelar**', 'core.hooksPath', '--principal', '--claude-md', 'la mezcla que choca', 'nunca se resuelve sola']) {
    assert.ok(eq.includes(x), `EQUIPADOR.md no nombra ${x}`);
  }
  assert.match(eq, /Perdés/, 'qué pierde cada una');
  assert.match(eq, /\*\*sin mezclar\*\* en su rama por defecto/);
  const ca = leer(enRepo('manuales/COMO-USAR-EL-ARQUITECTO.md'));
  assert.doesNotMatch(ca, /molde v2/);
  assert.doesNotMatch(ca, /`SPEC-0\.md`/);
  assert.ok(ca.includes('docs/modulos/v1/SPEC.md') && ca.includes('adoptar --nuevo'), 'el Modo A con el molde v3');
  assert.match(ca, /Tarea 0/);
});

test('crit. 11 (8r t8): SCRIPTS.md y MOLDE.md con lo nuevo; el README manda a "preparame esta PC"', { skip: SIN_REPO }, () => {
  const sc = leer(enRepo('manuales/SCRIPTS.md'));
  for (const x of ['resolver', '--nuevo', '--principal', '--claude-md', 'integrados', 'origin/<madre>', '-rc', 'desde:', 'primer mensaje: /director', 'tarea 0', '`00`', 'rc incluido', 'la mezcla chocó']) {
    assert.ok(sc.includes(x), `SCRIPTS.md no nombra ${x}`);
  }
  const mo = leer(enRepo('manuales/MOLDE.md'));
  for (const x of ['resolver', '--nuevo', '--principal', '--claude-md', 'integrados', '-rc', 'desde:', 'la mezcla chocó', 'el banner quedó en', 'cambios.cjs nuevo']) {
    assert.ok(mo.includes(x), `MOLDE.md no nombra ${x}`);
  }
  const ro = leer(enRepo('manuales/ROLES.md'));
  for (const x of ['primer mensaje es `/director <x>`', '/obrero <x>--<ID>', '.kit-rol', 'después: /cierre', 'integrados']) assert.ok(ro.includes(x), `ROLES.md no nombra ${x}`);
  const instalar = seccion(leer(enRepo('README.md')), '## Instalar');
  assert.ok(instalar, 'el README trae ## Instalar');
  assert.match(instalar, /preparame esta PC/);
  assert.doesNotMatch(instalar, /INSTALAR\.md/);
});

test('8d C3 (crit. C3): modo-b.md y formato-spec.md — "¿lista o cola?" y Plan: en la ficha, ### Tramo N, "Antes de lanzar: lo del dueño", el nombre director-<x>, nunca "sellada" sin sello, y el sello de fondo', () => {
  const mb = leer(path.join(ARQ, 'anexos', 'modo-b.md'));
  const fs2 = leer(path.join(ARQ, 'anexos', 'formato-spec.md'));
  const ma = leer(path.join(ARQ, 'anexos', 'modo-a.md'));
  assert.match(mb, /"¿lista o cola\?"/);
  assert.match(mb, /`- Plan: lista` o `- Plan: cola — <la regla> · termina: <cuándo>`/);
  assert.match(mb, /`### Tramo 1`/);
  assert.match(mb, /"Antes de lanzar: lo del dueño"/);
  assert.match(mb, /La sesión del director se llama `director-<x>`: decilo al armar/);
  assert.match(mb, /Feature diseñada y armada; el sello lo hace la sesión del director/);
  assert.match(fs2, /^## Antes de lanzar: lo del dueño$/m);
  assert.match(fs2, /^- Plan: lista \| cola — <la regla> · termina: <cuándo>$/m);
  assert.match(fs2, /^### Tramo 1$/m);
  assert.doesNotMatch(fs2, /^- Director:/m, 'director: es sí o no; el nombre no va en la ficha');
  // R18: el sello (plazo-test hasta 60 min y el turno) no cabe en los 10 min de una llamada: de fondo
  for (const [n, t] of [['modo-b', mb], ['modo-a', ma]]) {
    assert.match(t, /sello[^\n]*en segundo plano\*\* \(`run_in_background`/, n);
    assert.doesNotMatch(t, /sello`? [^\n]{0,80}con timeout 600000/, n);
  }
});

test('8d C2 (crit. C2): "preparame esta máquina" apunta a preparar-pc.md, que pregunta antes de traer, no corre el setup solo y pide el sí de publicar por repo', () => {
  assert.match(leer(SKILL), /Los repos de tu cuenta y publicar sola: `preparar-pc\.md` \(al lado\)/);
  const p = leer(path.join(SCRIPTS, '..', 'preparar-pc.md'));
  assert.match(p, /traer-repos\.cjs listar --proyectos <carpeta>/);
  assert.match(p, /"¿traigo repos de tu cuenta\?"/);
  assert.match(p, /Nunca se trae nada que el dueño no eligió/);
  assert.match(p, /El `comando-setup` de un repo recién traído no corre solo/);
  assert.match(p, /preparar-pc\.cjs --kit <clon> --publica <origin>/);
  assert.match(p, /ese clic es la\s+firma del dueño/);
  assert.match(p, /--no-publica <origin>/);
  for (const s of ['traer-repos.cjs', 'preparar-pc.cjs']) assert.ok(fs.existsSync(path.join(SCRIPTS, s)), s);
  assert.doesNotMatch(p, /guido|\brojo\b|\bverde\b/i);
});
