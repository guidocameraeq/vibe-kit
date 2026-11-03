'use strict';
// Pruebas de scripts/portada.cjs (SPEC-paquete-7 P3.8; criterio 7). Corren con: node --test "kit/**/*.test.cjs"
// Carpetas temporales; el chequear usa un repo git sin la configuración de la PC. Nunca los repos de prueba del kit.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-portada-'));
const GLOBAL = path.join(TMP, 'gitconfig-vacio');
fs.writeFileSync(GLOBAL, '');
const ENTORNO = { ...process.env, GIT_CONFIG_GLOBAL: GLOBAL, GIT_CONFIG_NOSYSTEM: '1' };
test.after(() => fs.rmSync(TMP, { recursive: true, force: true }));

const P = require('./portada.cjs');
const SCRIPT = path.join(__dirname, 'portada.cjs');
const MOLDE = path.join(__dirname, '..');

const FICHA = (proyecto = 'Caja Chica', extra = '') =>
  `---\nkit: 2.4.3\nnivel: estandar\nvars:\n  proyecto: ${proyecto}\n  comando-test: node --test\n  comando-setup: npm install\n${extra}---\n`;
const NORTE = (queEs) => `# NORTE — Caja Chica\n\n> El plano.\n\n## Qué es\n${queEs}\n\n## Para qué y para quién\n- Para qué: x\n`;

let n = 0;
function carpeta(o = {}) {
  const d = path.join(TMP, `p${n++}`);
  fs.mkdirSync(path.join(d, 'docs'), { recursive: true });
  fs.mkdirSync(path.join(d, '.claude'), { recursive: true });
  if (o.ficha !== false) fs.writeFileSync(path.join(d, '.claude', 'kit.md'), o.ficha || FICHA());
  if (o.norte !== false) fs.writeFileSync(path.join(d, 'docs', 'NORTE.md'), o.norte || NORTE('Lleva la caja chica de la oficina.\nSe carga una vez por día.'));
  return d;
}
function correr(d, args) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args, '--raiz', d], { encoding: 'utf8', env: ENTORNO });
  return { codigo: r.status, out: r.stdout, err: r.stderr };
}
const leer = (d, rel) => fs.readFileSync(path.join(d, ...rel.split('/')), 'utf8');
const hay = (d, rel) => fs.existsSync(path.join(d, ...rel.split('/')));

// ---------------------------------------------------------------- las plantillas

test('las plantillas embebidas coinciden con kit/molde/README.md y kit/molde/assets/banner.svg (letra por letra)', () => {
  const lf = (t) => t.replace(/\r\n/g, '\n');
  assert.equal(lf(fs.readFileSync(path.join(MOLDE, 'README.md'), 'utf8')), P.PLANTILLA_README);
  assert.equal(lf(fs.readFileSync(path.join(MOLDE, 'assets', 'banner.svg'), 'utf8')), P.PLANTILLA_BANNER);
});

test('el banner no usa fuentes ni imágenes de afuera y no lleva el nombre de ningún proyecto', () => {
  assert.doesNotMatch(P.PLANTILLA_BANNER, /https?:\/\/(?!www\.w3\.org\/2000\/svg)|@import|@font-face|<image|href=/);
  assert.match(P.PLANTILLA_BANNER, /\{\{PROYECTO\}\}/);
  assert.doesNotMatch(P.PLANTILLA_README, /versi[oó]n|pendiente|changelog/i); // ADR-023: la portada no lleva historial ni versión
});

// ---------------------------------------------------------------- armar

test('armar: README desde el NORTE (3 líneas) y la ficha, con título, cómo correrlo, los tres enlaces y la marca al pie; con banner (siempre)', () => {
  const d = carpeta({ norte: NORTE('Una.\nDos.\nTres.\nCuatro.') });
  const r = correr(d, ['armar']);
  assert.equal(r.codigo, 0, r.out + r.err);
  assert.match(r.out, /^assets\/banner\.svg: creado\nREADME\.md: creado\n\(nota\) .* más de 3 líneas/);
  const t = leer(d, 'README.md');
  assert.match(t, /^# Caja Chica\n\n!\[Caja Chica\]\(assets\/banner\.svg\)\n\nUna\.\nDos\.\nTres\.\n\n## Cómo correrlo\n\n- Preparar: `npm install`\n- Probar: `node --test`\n\n## Más\n/);
  assert.doesNotMatch(t, /Cuatro/);
  for (const e of ['(docs/NORTE.md)', '(docs/MAPA.md)', '(docs/README.md)']) assert.ok(t.includes(e), e);
  assert.doesNotMatch(t, /\{\{/);
  assert.match(t, /^# Caja Chica\n\n!\[Caja Chica\]\(assets\/banner\.svg\)\n\n/);
  assert.match(t, /\n<!-- kit:portada [0-9a-f]{12} -->\n$/);
  assert.ok(hay(d, 'assets/banner.svg'));
});

test('armar: repetido da "sin cambios"; si cambia el NORTE y nadie tocó el README, lo actualiza', () => {
  const d = carpeta();
  assert.equal(correr(d, ['armar']).codigo, 0);
  const antes = leer(d, 'README.md');
  const r = correr(d, ['armar']);
  assert.equal(r.codigo, 0);
  assert.equal(r.out, 'assets/banner.svg: sin cambios\nREADME.md: sin cambios\n');
  assert.equal(leer(d, 'README.md'), antes);
  fs.writeFileSync(path.join(d, 'docs', 'NORTE.md'), NORTE('Otra cosa distinta.'));
  const a = correr(d, ['armar']);
  assert.equal(a.codigo, 0);
  assert.match(a.out, /^assets\/banner\.svg: actualizado.*\nREADME\.md: actualizado/);
  assert.match(leer(d, 'README.md'), /Otra cosa distinta\./);
});

test('armar: un README propio (sin marca) o editado a mano (hash distinto) no se pisa y sale 1, con la causa', () => {
  const d = carpeta();
  fs.writeFileSync(path.join(d, 'README.md'), '# Mío\nlo escribí yo\n');
  const r = correr(d, ['armar']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /README\.md: NO lo pisé — existe y no lo armó este script/);
  assert.equal(leer(d, 'README.md'), '# Mío\nlo escribí yo\n');
  // armado por el script y retocado después
  const e = carpeta();
  correr(e, ['armar']);
  fs.writeFileSync(path.join(e, 'README.md'), leer(e, 'README.md').replace('## Más', '## Más cosas'));
  const re = correr(e, ['armar']);
  assert.equal(re.codigo, 1);
  assert.match(re.out, /NO lo pisé/);
  assert.match(leer(e, 'README.md'), /## Más cosas/);
  // una marca con hash que no es de nadie
  const f = carpeta();
  fs.writeFileSync(path.join(f, 'README.md'), '# X\n<!-- kit:portada 000000000000 -->\n');
  assert.equal(correr(f, ['armar']).codigo, 1);
});

test('armar: README propio sin enlace al banner → un renglón que lo dice; con enlace → ninguno; README del script → ninguno (D8b-8)', () => {
  const linea = /el banner quedó en assets\/banner\.svg: enlazalo arriba del README si querés/;
  const d = carpeta();
  fs.writeFileSync(path.join(d, 'README.md'), '# Mío\nlo escribí yo\n');
  const r = correr(d, ['armar']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, linea);
  assert.equal(r.out.split('\n').filter((l) => /enlazalo/.test(l)).length, 1);
  // con banner propio ya puesto, también
  const p = carpeta();
  fs.mkdirSync(path.join(p, 'assets'));
  fs.writeFileSync(path.join(p, 'assets', 'banner.svg'), '<svg/>');
  fs.writeFileSync(path.join(p, 'README.md'), '# Mío\n');
  assert.match(correr(p, ['armar']).out, linea);
  // el README propio ya lo enlaza
  const e = carpeta();
  fs.writeFileSync(path.join(e, 'README.md'), '# Mío\n\n![x](assets/banner.svg)\n');
  const re = correr(e, ['armar']);
  assert.equal(re.codigo, 1);
  assert.doesNotMatch(re.out, /enlazalo/);
  // README armado por el script: nada
  const f = carpeta();
  assert.doesNotMatch(correr(f, ['armar']).out, /enlazalo/);
  assert.doesNotMatch(correr(f, ['armar']).out, /enlazalo/);
});

test('armar: respeta el nombre con que ya está el README (Readme.md) y no crea un segundo', () => {
  const d = carpeta();
  fs.writeFileSync(path.join(d, 'Readme.md'), '# Propio\n');
  const r = correr(d, ['armar']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /^assets\/banner\.svg: creado\nReadme\.md: NO lo pisé/);
  assert.equal(fs.readdirSync(d).filter((x) => /^readme\.md$/i.test(x)).length, 1);
});

test('armar (sin --banner): escribe assets/banner.svg con el nombre y el README lo muestra; repetir, con o sin --banner, no cambia nada', () => {
  const d = carpeta({ ficha: FICHA('Caja <Chica> & Cía') });
  const r = correr(d, ['armar']);
  assert.equal(r.codigo, 0, r.out);
  assert.match(r.out, /^assets\/banner\.svg: creado\nREADME\.md: creado\n$/);
  const svg = leer(d, 'assets/banner.svg');
  assert.match(svg, /<text [^>]*>Caja &lt;Chica&gt; &amp; Cía<\/text>/);
  assert.doesNotMatch(svg, /\{\{/);
  assert.match(svg, /Lleva la caja chica de la oficina\./);
  assert.match(svg, /\n<!-- kit:portada [0-9a-f]{12} -->\n$/);
  assert.match(leer(d, 'README.md'), /^# Caja <Chica> & Cía\n\n!\[Caja <Chica> & Cía\]\(assets\/banner\.svg\)\n\n/);
  const otra = correr(d, ['armar']);
  assert.equal(otra.out, 'assets/banner.svg: sin cambios\nREADME.md: sin cambios\n');
  assert.equal(correr(d, ['armar', '--banner']).out, 'assets/banner.svg: sin cambios\nREADME.md: sin cambios\n');
});

test('armar: un banner propio no se pisa (el README igual lo enlaza); un nombre largo achica la letra', () => {
  const d = carpeta();
  fs.mkdirSync(path.join(d, 'assets'));
  fs.writeFileSync(path.join(d, 'assets', 'banner.svg'), '<svg/>\n');
  const r = correr(d, ['armar']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /assets\/banner\.svg: NO lo pisé/);
  assert.equal(leer(d, 'assets/banner.svg'), '<svg/>\n');
  assert.match(leer(d, 'README.md'), /\]\(assets\/banner\.svg\)/);
  const corto = P.armarBanner({ proyecto: 'abc', linea: 'x' }).match(/font-size="(\d+)" font-weight="700" letter-spacing="-2"/)[1];
  const largo = P.armarBanner({ proyecto: 'un-proyecto-con-un-nombre-larguisimo', linea: 'x' }).match(/font-size="(\d+)" font-weight="700" letter-spacing="-2"/)[1];
  assert.equal(corto, '108');
  assert.ok(Number(largo) < 60 && Number(largo) >= 40, largo);
});

test('armar --plan: dice qué haría y no escribe nada', () => {
  const d = carpeta();
  const r = correr(d, ['armar', '--plan']);
  assert.equal(r.codigo, 0);
  assert.equal(r.out, '(plan) assets/banner.svg: lo crearía\n(plan) README.md: lo crearía\n');
  assert.ok(!hay(d, 'README.md') && !hay(d, 'assets'));
});

test('armar: el marcador de la plantilla en "Qué es", un NORTE sin la sección o sin texto, o ni NORTE → 1, sin escribir nada', () => {
  for (const [norte, esperado] of [
    [NORTE('{{QUE_ES_EN_2_LINEAS}}'), /sigue con el marcador de la plantilla/],
    ['# NORTE\n\n## Para qué\nx\n', /no tiene texto en "## Qué es"/],
    [NORTE(''), /no tiene texto en "## Qué es"/],
    [false, /falta docs\/NORTE\.md/],
  ]) {
    const d = carpeta({ norte });
    const r = correr(d, ['armar', '--banner']);
    assert.equal(r.codigo, 1, r.out);
    assert.match(r.out, esperado);
    assert.ok(!hay(d, 'README.md') && !hay(d, 'assets'));
  }
});

test('armar: sin ficha, o sin vars.proyecto → 2; sin comandos en la ficha lo dice en vez de inventar', () => {
  assert.equal(correr(carpeta({ ficha: false }), ['armar']).codigo, 2);
  const sinNombre = carpeta({ ficha: '---\nkit: 2.4.3\nnivel: estandar\nvars:\n  comando-test: x\n---\n' });
  const r = correr(sinNombre, ['armar']);
  assert.equal(r.codigo, 2);
  assert.match(r.out, /falta "proyecto" en "vars"/);
  const sinComandos = carpeta({ ficha: '---\nkit: 2.4.3\nnivel: estandar\nvars:\n  proyecto: px\n---\n' });
  assert.equal(correr(sinComandos, ['armar']).codigo, 0);
  assert.match(leer(sinComandos, 'README.md'), /no declara `comando-setup` ni `comando-test`/);
});

test('argumentos: sin comando, comando raro, banderas que no van → 2 con el uso', () => {
  const d = carpeta();
  for (const a of [[], ['hola'], ['armar', '--nada'], ['chequear', '--banner'], ['armar', 'armar'], ['armar', '--raiz']]) {
    const r = spawnSync(process.execPath, [SCRIPT, ...a, ...(a.includes('--raiz') ? [] : ['--raiz', d])], { encoding: 'utf8', env: ENTORNO });
    assert.equal(r.status, 2, a.join(' '));
    assert.match(r.stdout, /Uso: node \.claude\/scripts\/portada\.cjs/);
  }
});

// ---------------------------------------------------------------- chequear

function repoGit(d) {
  const g = (...args) => {
    const r = spawnSync('git', ['-c', 'user.name=Prueba', '-c', 'user.email=prueba@ejemplo.invalid', ...args], { cwd: d, encoding: 'utf8', env: ENTORNO });
    assert.equal(r.status, 0, r.stderr);
  };
  g('init', '-q', '-b', 'main');
  g('add', '-A');
}

test('chequear: rojo sin README, verde con el que armó el script; rojo con un README sin el enlace', () => {
  const d = carpeta();
  repoGit(d);
  const sin = correr(d, ['chequear']);
  assert.equal(sin.codigo, 1);
  assert.match(sin.out, /^candado:portada · no hay README\.md en la raíz · /);
  correr(d, ['armar']);
  const ok = correr(d, ['chequear']);
  assert.equal(ok.codigo, 0, ok.out);
  assert.equal(ok.out, 'portada: en verde\n');
  fs.writeFileSync(path.join(d, 'README.md'), '# solo\n');
  const sinEnlace = correr(d, ['chequear']);
  assert.equal(sinEnlace.codigo, 1);
  assert.match(sinEnlace.out, /README\.md no enlaza a docs\/NORTE\.md/);
});

test('chequear: fuera de un repo git no revienta, dice que está roto (2)', () => {
  const d = carpeta();
  correr(d, ['armar']);
  const r = correr(d, ['chequear']);
  assert.equal(r.codigo, 2);
  assert.match(r.out, /portada roto/);
});
