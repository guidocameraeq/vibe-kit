'use strict';
// Pruebas del frontmatter de los subagentes del molde (SPEC-0 5.7; D §6) y de redteam-spec del kit.
// Campos y valores según la doc oficial de subagentes (verificada en D5.2, K4): https://code.claude.com/docs/en/sub-agents
//   name y description obligatorios; tools: lista separada por comas; model: sonnet | opus | haiku | fable | un ID completo | inherit;
//   effort: low | medium | high | xhigh | max (los niveles disponibles dependen del modelo).
// Correr: node --test kit/molde/agents/agents-frontmatter.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const REDTEAM = path.join(__dirname, '..', '..', 'agents', 'redteam-spec.md');
const MODELOS = ['sonnet', 'opus', 'haiku', 'fable', 'inherit'];
const ESFUERZOS = ['low', 'medium', 'high', 'xhigh', 'max'];
const ESCRIBE_O_CORRE = /^(Bash|PowerShell|Edit|Write|NotebookEdit)$/;
// Los únicos con shell o con permiso de escribir: el verificador corre las pruebas; el implementador escribe el código del sub-paso.
const CON_PODER = { verificador: ['Bash'], implementador: ['Bash', 'Edit', 'Write'] };
const ESPERADOS = ['capturas', 'explorador', 'implementador', 'investigador', 'lector', 'revisor', 'verificador'];

function frontmatter(texto) {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(texto.replace(/\r\n/g, '\n'));
  if (!m) return null;
  const d = {};
  for (const l of m[1].split('\n')) {
    const k = /^([A-Za-z]+):\s*(.*)$/.exec(l);
    if (k) d[k[1]] = k[2].trim();
  }
  return d;
}
const leer = (ruta) => fs.readFileSync(ruta, 'utf8');
const agentes = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => ({ nombre: f.slice(0, -3), texto: leer(path.join(DIR, f)) }));

test('están todos los subagentes del molde', () => {
  assert.deepEqual(agentes.map((a) => a.nombre).sort(), ESPERADOS);
});

for (const { nombre, texto } of agentes) {
  test(`${nombre}: name, description, model, effort y tools válidos`, () => {
    const f = frontmatter(texto);
    assert.ok(f, 'frontmatter');
    assert.equal(f.name, nombre);
    assert.ok(f.description && f.description.length >= 60, 'description: cuándo sí');
    assert.match(f.description, /No usar/, 'description: cuándo NO');
    assert.ok(MODELOS.includes(f.model), `model: ${f.model}`);
    assert.ok(ESFUERZOS.includes(f.effort), `effort: ${f.effort}`);
    assert.ok(f.tools && f.tools.split(',').every((x) => /^[A-Za-z]+$/.test(x.trim())), `tools: ${f.tools}`);
  });

  test(`${nombre}: sin Bash, Edit ni Write salvo los que declaran poder`, () => {
    const tools = frontmatter(texto).tools.split(',').map((x) => x.trim());
    const permitidas = CON_PODER[nombre] || [];
    for (const t of tools) if (ESCRIBE_O_CORRE.test(t)) assert.ok(permitidas.includes(t), `${nombre} no debería tener ${t}`);
    for (const t of permitidas) assert.ok(tools.includes(t), `${nombre} declara ${t}`);
  });

  test(`${nombre}: tope de tiempo y latido en el cuerpo`, () => {
    if (nombre === 'revisor') return; // lee un commit congelado y un archivo: no lanza nada que se pueda colgar
    assert.match(texto, /Tope de tiempo/);
    assert.match(texto, /Latido/);
  });
}

test('modelos del diseño: explorador Haiku; lector, capturas, investigador, verificador e implementador Sonnet; revisor Opus sin shell', () => {
  const m = Object.fromEntries(agentes.map((a) => [a.nombre, frontmatter(a.texto)]));
  assert.equal(m.explorador.model, 'haiku');
  for (const n of ['lector', 'capturas', 'investigador', 'verificador', 'implementador']) assert.equal(m[n].model, 'sonnet', n);
  assert.equal(m.revisor.model, 'opus');
  assert.equal(m.revisor.tools, 'Read, Grep, Glob');
});

test('el revisor arranca en "le falta" y lee el paquete del script', () => {
  const t = agentes.find((a) => a.nombre === 'revisor').texto;
  assert.match(t, /Arrancá en "le falta"/);
  assert.match(t, /paquete\.cjs/);
});

test('redteam-spec: model opus y effort, sin perder lo que tenía (solo lectura, sin Bash)', () => {
  const t = leer(REDTEAM);
  const f = frontmatter(t);
  assert.equal(f.model, 'opus');
  assert.ok(ESFUERZOS.includes(f.effort), f.effort);
  assert.equal(f.tools, 'Read, Grep, Glob, WebSearch, WebFetch');
  assert.match(t, /Máximo 5 hallazgos/);
});
