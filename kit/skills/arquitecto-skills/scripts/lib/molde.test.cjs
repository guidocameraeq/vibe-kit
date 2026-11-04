'use strict';
// molde.test.cjs — materializar el molde viejo y el nuevo con la forma de kit/molde/ (SPEC-paquete-6 P7.1).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const M = require('./molde.cjs');

const T = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-molde-test-'));
test.after(() => fs.rmSync(T, { recursive: true, force: true }));
fs.writeFileSync(path.join(T, 'gitconfig-vacio'), '');
Object.assign(process.env, {
  GIT_CONFIG_GLOBAL: path.join(T, 'gitconfig-vacio'), GIT_CONFIG_NOSYSTEM: '1',
  GIT_AUTHOR_NAME: 'prueba', GIT_AUTHOR_EMAIL: 'p@kit.invalid', GIT_COMMITTER_NAME: 'prueba', GIT_COMMITTER_EMAIL: 'p@kit.invalid',
});
let n = 0;
function arbol(mapa) {
  const d = path.join(T, `a${n++}`);
  for (const [rel, t] of Object.entries(mapa)) {
    fs.mkdirSync(path.dirname(path.join(d, rel)), { recursive: true });
    fs.writeFileSync(path.join(d, rel), t);
  }
  return d;
}
const git = (cwd, ...a) => {
  const r = spawnSync('git', a, { cwd, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr);
  return r.stdout;
};

test('instanciar: {{PROYECTO}} y {{NOMBRE}} desde vars (kebab), la fecha; sin valor queda; completar los docs', () => {
  const vars = { proyecto: 'demo', 'comando-salud-opcional': 'npm run salud', vacio: '' };
  assert.equal(M.instanciar('a {{PROYECTO}} b {{COMANDO_SALUD_OPCIONAL}} c {{OTRA}} {{VACIO}}', vars), 'a demo b npm run salud c {{OTRA}} {{VACIO}}');
  assert.equal(M.instanciar('## {{YYYY-MM-DD}}', {}, { fecha: '2026-11-02' }), '## 2026-11-02');
  assert.equal(M.instanciar('x {{APP}} y {{...}} z {{lo que sea — nota}} {{LINEAS:3}}', {}, { completar: true }), 'x [completar: APP] y [completar: ...] z [completar: lo que sea — nota] {{LINEAS:3}}');
  assert.equal(M.instanciar('l1\r\nl2\r\n', {}), 'l1\nl2\n', 'sale en LF');
  const leeme = '"_LEEME": "Allowlist. Reemplazar los {{...}} por los comandos reales de las skills del proyecto (o borrar esas líneas). Fin."';
  assert.equal(M.instanciar(leeme, {}, { forma: '2.4' }), '"_LEEME": "Allowlist. Fin."');
  assert.equal(M.instanciar(leeme, {}, { forma: '3' }), leeme, 'solo en 2.4');
});

test('materializarDir: la forma 3 (raíz de un kit o kit/molde/) tal cual, con los *.test.cjs sin instanciar; .md y .json instanciados', () => {
  const kit = arbol({
    'kit/molde/settings.json': '{"x": "{{PROYECTO}}"}\r\n',
    'kit/molde/hooks/session-start.cjs': '// {{PROYECTO}} en código no se toca\n',
    'kit/molde/hooks/a.test.cjs': "assert('{{PROYECTO}}')\n",
    'kit/molde/docs/NORTE.md': '# {{PROYECTO}}: {{PARA_QUE}}\n',
    'kit/molde/CLAUDE.md': '# {{PROYECTO}}\n',
  });
  for (const origen of [kit, path.join(kit, 'kit', 'molde')]) {
    const m = M.materializarDir(origen, { vars: { proyecto: 'demo' } });
    try {
      assert.equal(m.forma, '3');
      const a = M.archivosDe(m.dir);
      assert.equal(a.get('settings.json'), '{"x": "demo"}\n');
      assert.equal(a.get('hooks/session-start.cjs'), '// {{PROYECTO}} en código no se toca\n');
      assert.equal(a.get('hooks/a.test.cjs'), "assert('{{PROYECTO}}')\n", 'las pruebas viajan tal cual (chequear 7 las corre)');
      assert.equal(a.get('docs/NORTE.md'), '# demo: [completar: PARA_QUE]\n');
      assert.equal(a.get('CLAUDE.md'), '# demo\n', 'el CLAUDE.md sin completar: no nace');
      assert.ok(!a.has('.forma-molde'));
      // uno ya materializado se vuelve a materializar igual (la marca de forma lo dice)
      const otra = M.materializarDir(m.dir, { vars: { proyecto: 'demo' } });
      assert.equal(otra.forma, '3');
      assert.deepEqual(M.archivosDe(otra.dir), a);
      M.borrar(otra.dir);
    } finally {
      M.borrar(m.dir);
    }
  }
});

test('materializarDir: la forma 2.4 (templates/universales/) pasa a la forma de kit/molde/', () => {
  const u = 'kit/skills/arquitecto/templates/universales/';
  const kit = arbol({
    [`${u}settings.template.json`]: '{"_LEEME": "Reemplazar los {{...}} por los comandos reales de las skills del proyecto (o borrar esas líneas). "}\n',
    [`${u}CLAUDE.template.md`]: '# {{PROYECTO}}\n',
    [`${u}hooks/session-start.sh`]: '#!/bin/bash\n',
    [`${u}hooks/check-code.js`]: '// v2\n',
    [`${u}skills/inicio/SKILL.md`]: '# inicio {{PROYECTO}} {{COMANDO_SALUD_OPCIONAL}}\n',
  });
  for (const origen of [kit, path.join(kit, ...u.split('/'))]) {
    const m = M.materializarDir(origen, { vars: { proyecto: 'gama' } });
    try {
      assert.equal(m.forma, '2.4');
      assert.deepEqual([...M.archivosDe(m.dir).keys()].sort(), ['CLAUDE.md', 'hooks/check-code.js', 'hooks/session-start.sh', 'settings.json', 'skills/inicio/SKILL.md']);
      assert.equal(M.archivosDe(m.dir).get('settings.json'), '{"_LEEME": ""}\n');
      assert.equal(M.archivosDe(m.dir).get('skills/inicio/SKILL.md'), '# inicio gama {{COMANDO_SALUD_OPCIONAL}}\n', 'sin el valor en vars, el marcador queda (el guardia cae al hash)');
      assert.equal(M.formaDe(m.dir).forma, '2.4');
    } finally {
      M.borrar(m.dir);
    }
  }
  assert.throws(() => M.materializarDir(arbol({ 'nada.txt': 'x' }), {}), /no hay un molde que conozca/);
});

test('materializarViejo: el molde de un tag del kit (3 y 2.4), por git cat-file; sin el tag → tira con "pasá --molde-viejo"', () => {
  const kit = arbol({
    'kit/VERSION': '2.4.2\n',
    'kit/skills/arquitecto/templates/universales/settings.template.json': '{}\n',
    'kit/skills/arquitecto/templates/universales/hooks/check-code.js': '// v2 {{PROYECTO}}\n',
  });
  git(kit, 'init', '-q', '-b', 'main');
  git(kit, 'add', '-A');
  git(kit, 'commit', '-q', '-m', 'v2');
  git(kit, 'tag', '-a', 'v2.4.2', '-m', 'v2.4.2');
  fs.rmSync(path.join(kit, 'kit', 'skills'), { recursive: true });
  fs.mkdirSync(path.join(kit, 'kit', 'molde', 'hooks'), { recursive: true });
  fs.writeFileSync(path.join(kit, 'kit', 'molde', 'settings.json'), '{"y": 1}\n');
  fs.writeFileSync(path.join(kit, 'kit', 'molde', 'hooks', 'session-start.cjs'), Buffer.from([0x2f, 0x2f, 0x20, 0xc3, 0xb1, 0x0d, 0x0a])); // "// ñ\r\n"
  git(kit, 'add', '-A');
  git(kit, 'commit', '-q', '-m', 'v3');
  git(kit, 'tag', '-a', 'v3.0.0', '-m', 'v3.0.0');
  const v2 = M.materializarViejo(kit, '2.4.2', { vars: { proyecto: 'x' } });
  const v3 = M.materializarViejo(kit, '3.0.0', {});
  try {
    assert.equal(v2.forma, '2.4');
    assert.deepEqual(Object.fromEntries(M.archivosDe(v2.dir)), { 'settings.json': '{}\n', 'hooks/check-code.js': '// v2 {{PROYECTO}}\n' });
    assert.equal(v3.forma, '3');
    assert.deepEqual(Object.fromEntries(M.archivosDe(v3.dir)), { 'settings.json': '{"y": 1}\n', 'hooks/session-start.cjs': '// ñ\n' });
  } finally {
    M.borrar(v2.dir);
    M.borrar(v3.dir);
  }
  assert.throws(() => M.materializarViejo(kit, '1.0.0', {}), /no tiene el tag v1\.0\.0.*--molde-viejo/);
});

test('materializarNuevo: el del disco del --kit (lo sin commitear también)', () => {
  const kit = arbol({ 'kit/VERSION': '3.0.0\n', 'kit/molde/settings.json': '{}\n' });
  const m = M.materializarNuevo(kit, {});
  try {
    assert.equal(m.forma, '3');
    assert.deepEqual([...M.archivosDe(m.dir).keys()], ['settings.json']);
  } finally {
    M.borrar(m.dir);
  }
});

test('8r3 i1b: con carpetaDocs, la línea de la mesa de gitattributes.snippet nombra la carpeta; sin ella (o docs), igual; los docs del molde siguen en docs/', () => {
  const snip = '.claude/frenos.log merge=union\n.githooks/* text eol=lf\ndocs/modulos/**/mesa/** text eol=lf\n';
  const kit = arbol({ 'kit/VERSION': '3.0.0\n', 'kit/molde/settings.json': '{}\n', 'kit/molde/gitattributes.snippet': snip, 'kit/molde/docs/NORTE.md': '# {{PROYECTO}}\n' });
  const ver = (o) => {
    const m = M.materializarNuevo(kit, o);
    try {
      const a = M.archivosDe(m.dir);
      return { snip: a.get('gitattributes.snippet'), norte: a.get('docs/NORTE.md') };
    } finally {
      M.borrar(m.dir);
    }
  };
  const con = ver({ vars: { proyecto: 'arti' }, carpetaDocs: 'arti-docs' });
  assert.equal(con.snip, '.claude/frenos.log merge=union\n.githooks/* text eol=lf\narti-docs/modulos/**/mesa/** text eol=lf\n');
  assert.equal(con.norte, '# arti\n', 'el molde lo sigue trayendo en docs/ (el catálogo lo lleva a la carpeta)');
  assert.equal(ver({}).snip, snip);
  assert.equal(ver({ carpetaDocs: 'docs' }).snip, snip);
});
