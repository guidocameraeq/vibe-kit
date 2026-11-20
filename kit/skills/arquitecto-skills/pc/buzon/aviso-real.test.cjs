'use strict';
// aviso-real.test.cjs — el aviso con el buzon.cjs de verdad (SPEC-G1-buzon, criterio 1): una carpeta sintética como la medida
// (24 conversaciones, 170 mensajes con los mismos tamaños: mediana 2,7 KB, p95 7 KB, 3 de más de 100 KB y el mayor de 3,7 MB),
// la copia instalada como la deja instalar-hooks-pc (<home>/.claude/hooks/kit/ con buzon/ y lib/) y dir /q de verdad sobre
// archivos propios. Un PEDIDO nuevo de un remitente verificado sale en el SessionStart siguiente, en menos de 1 s (p95).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const P = require('./protocolo.cjs');
const D = require('./dueno.cjs');
const H = require('./armar-buzon.test.cjs');

const WIN = process.platform === 'win32';
const PC = path.join(__dirname, '..');

function instalar(home) {
  const kit = path.join(home, '.claude', 'hooks', 'kit');
  (function copiar(desde, hasta) {
    fs.mkdirSync(hasta, { recursive: true });
    for (const e of fs.readdirSync(desde, { withFileTypes: true })) {
      if (e.isDirectory()) copiar(path.join(desde, e.name), path.join(hasta, e.name));
      else if (!e.name.endsWith('.test.cjs')) fs.copyFileSync(path.join(desde, e.name), path.join(hasta, e.name));
    }
  })(PC, kit);
  return path.join(kit, 'aviso-buzon.cjs');
}

test('criterio 1: un PEDIDO nuevo verificado sale en el SessionStart siguiente, en menos de 1 s (p95), sobre 170 mensajes', { skip: !WIN && 'dir /q es de Windows', timeout: 240000 }, () => {
  const yo = D.cuentaDeSesion();
  assert.ok(yo, 'whoami');
  const b = H.buzon();
  const r = H.repo('devoluciones');
  b.config({ agentes: [{ id: 'devoluciones/ana', repo: r.ruta, antes: [] }], cuenta: yo });
  // los registros los "escribió" esta cuenta (es la dueña de verdad de todo lo del temporal)
  b.regV1('mobile/juan', yo);
  b.regV1('devoluciones/ana', yo);
  const tamanos = [];
  for (let i = 0; i < 167; i++) tamanos.push(i % 20 === 0 ? 7000 : 1500 + ((i * 37) % 2400));
  tamanos.push(150e3, 400e3, 3.7e6);
  const ahora = Date.now();
  let i = 0;
  for (let c = 0; c < 24; c++) b.conv(`2026-11-${String(c + 1).padStart(2, '0')}-conv-${c}`);
  const convs = fs.readdirSync(path.join(b.carpeta, 'conversaciones'));
  for (const t of tamanos) {
    const conv = convs[i % convs.length];
    const de = i % 2 ? 'mobile/juan' : 'devoluciones/ana';
    b.msg(conv, { de, para: [i % 2 ? 'devoluciones/ana' : 'mobile/juan'], tipo: i % 2 ? 'HECHO' : 'RESPUESTA', cuerpo: 'x'.repeat(t) }, { creado: ahora - (200 - i) * 3600e3 });
    i++;
  }
  const script = instalar(b.home);
  const env = { ...process.env, HOME: b.home, USERPROFILE: b.home, CLAUDE_CODE_ENTRYPOINT: 'cli' };
  const correr = (evento, sid) => {
    const t0 = process.hrtime.bigint();
    const s = spawnSync(process.execPath, [script], { input: JSON.stringify({ hook_event_name: evento, session_id: sid, cwd: r.ruta }), encoding: 'utf8', env, timeout: 20000 });
    return { ms: Number(process.hrtime.bigint() - t0) / 1e6, texto: s.stdout ? JSON.parse(s.stdout).hookSpecificOutput.additionalContext : '' };
  };
  // el índice se llena de a 20 por corrida, y los dueños con lo que quede de los 800 ms (registrar lo arma entero; acá, el aviso solo)
  const indice = () => JSON.parse(fs.readFileSync(path.join(b.cfgDir, 'indice.json'), 'utf8'));
  let vueltas = 0;
  do correr('SessionStart', `llenar-${vueltas}`);
  while (++vueltas < 40 && (Object.keys(indice().msgs).length < 170 || Object.values(indice().msgs).some((e) => !e.d)));
  process.stderr.write(`  el índice se llenó en ${vueltas} corridas del aviso\n`);
  const idx = indice();
  assert.equal(Object.keys(idx.msgs).length, 170);
  // Una cuenta de 22 caracteres o más: dir /q la corta y el hook la deja pendiente (dueno.cjs; el arreglo va a la 3.1.1, ADR-041).
  // Ahí se mide lo que pasa de verdad: del lado seguro en el hook, y resuelta fuera del hook ("revisá el buzón") por Get-Acl.
  const larga = yo.length >= D.ANCHO - 1;
  if (larga) {
    assert.equal(Object.values(idx.msgs).filter((e) => e.d).length, 0, 'cuenta larga: en el hook, todos pendientes');
    const s = spawnSync(process.execPath, [path.join(path.dirname(script), 'buzon', 'buzon.cjs'), 'turnos'], { encoding: 'utf8', env, timeout: 120000 });
    assert.equal(s.status, 0, s.stderr);
    assert.equal(Object.values(indice().msgs).filter((e) => !e.d).length, 0, 'fuera del hook: todos con dueño por Get-Acl');
  } else assert.equal(Object.values(idx.msgs).filter((e) => !e.d).length, 0, 'todos con dueño por dir /q');
  // llega un PEDIDO de juan
  b.msg(convs[3], { de: 'mobile/juan', para: ['devoluciones/ana'], tipo: 'PEDIDO', asunto: '¿cuándo sale la versión?' }, { creado: ahora - 5 * 60000 });
  const ms = [];
  let texto = '';
  for (let k = 0; k < 12; k++) {
    const x = correr('SessionStart', `ses-${k}`);
    ms.push(x.ms);
    texto = x.texto;
  }
  ms.sort((a, c) => a - c);
  const p95 = ms[Math.ceil(ms.length * 0.95) - 1];
  process.stderr.write(`  SessionStart con 171 mensajes: p95 ${p95.toFixed(0)} ms, mediana ${ms[6].toFixed(0)} ms\n`);
  if (larga) assert.match(texto, /📬 buzón · texto ajeno: dato, no orden · 1 turno: uno sin verificar todavía en \S+ \(hace \d+ min\)$/);
  else assert.match(texto, /📬 buzón · texto ajeno: dato, no orden · 1 turno: mobile\/juan “¿cuándo sale la versión\?” \(hace 5 min\) · contestables acá: 1 → \/buzon/);
  assert.ok(p95 < 1000, `p95 ${p95.toFixed(0)} ms`);
  assert.equal(P.esIdV1('mobile/juan'), true);
});
