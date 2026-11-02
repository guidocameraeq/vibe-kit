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
