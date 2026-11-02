'use strict';
// Pruebas de scripts/mesa.cjs (SPEC-0 5.9, crit. 13 del kit; crit. 16 del delta): el USO y las salidas, y la ficha canónica de
// G §19 entre dos repos temporales (mobile y desktop), cada uno con su remoto bare como origin y el del otro como remoto alias:
// un director manda, el otro lo ve y responde, acuerdan, `acordados` lo lista y `abiertos` queda vacío. El aviso por el canal
// (SendMessage) no se prueba: se toma la línea que imprime `nuevo` y se le pasa a `encargo.cjs mensaje` del otro lado.
// Corren con: node --test "kit/**/*.test.cjs"
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-mesa-'));
const GLOBAL = path.join(TMP, 'gitconfig-vacio');
fs.writeFileSync(GLOBAL, '[core]\n\tlongpaths = true\n');
Object.assign(process.env, {
  GIT_CONFIG_GLOBAL: GLOBAL,
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_AUTHOR_NAME: 'Prueba',
  GIT_AUTHOR_EMAIL: 'prueba@ejemplo.invalid',
  GIT_COMMITTER_NAME: 'Prueba',
  GIT_COMMITTER_EMAIL: 'prueba@ejemplo.invalid',
});
test.after(() => fs.rmSync(TMP, { recursive: true, force: true, maxRetries: 20, retryDelay: 500 }));

const SCRIPT = path.join(__dirname, 'mesa.cjs');
const ENCARGO = path.join(__dirname, 'encargo.cjs');
const C = require('./mesa.cjs');
const K = require('../hooks/lib/candado.cjs');

function g(cwd, ...args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', env: process.env });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}
function escribir(d, rel, contenido) {
  const p = path.join(d, ...rel.split('/'));
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, contenido);
  return p;
}
function cli(cwd, args, script = SCRIPT) {
  const r = spawnSync(process.execPath, [script, ...args], { cwd, encoding: 'utf8', env: process.env, input: '' });
  return { codigo: r.status, out: r.stdout, err: r.stderr };
}
// En el proceso, con otro reloj.
function enProceso(cwd, args, ahora) {
  let out = '';
  const codigo = C.main(args, { cwd, ahora, salida: (s) => (out += s), error: (s) => (out += s) });
  return { codigo, out };
}
let nb = 0;
const borrador = (texto) => escribir(TMP, `borradores/b${nb++}.md`, texto);
const ultima = (out) => out.trim().split('\n').pop();

// Los dos proyectos: cada uno con su bare (origin), el remoto del otro con su alias, el módulo identidad y la rama del director.
function dosProyectos() {
  const raiz = fs.mkdtempSync(path.join(TMP, 'par-'));
  const p = {};
  for (const alias of ['mobile', 'desktop']) {
    const bare = path.join(raiz, `${alias}.git`);
    g(raiz, 'init', '-q', '--bare', '-b', 'main', bare);
    const d = path.join(raiz, alias);
    g(raiz, 'init', '-q', '-b', 'main', d);
    g(d, 'remote', 'add', 'origin', bare);
    escribir(d, 'docs/modulos/identidad/README.md', '# Identidad\n- Estado: EN OBRA\n');
    escribir(d, 'db/esquema.sql', `create table usuarios (id int); -- ${alias}\n`);
    g(d, 'add', '-A');
    g(d, 'commit', '-q', '-m', 'base');
    g(d, 'push', '-q', 'origin', 'main');
    g(d, 'checkout', '-q', '-b', 'modulo/identidad');
    fs.writeFileSync(path.join(d, '.kit-rol'), 'director\n'); // la pestaña del director (sin .kit-rol, humano: no recibe)
    fs.appendFileSync(path.join(d, '.git', 'info', 'exclude'), '/.kit-rol\n');
    p[alias] = { d, bare };
  }
  g(p.mobile.d, 'remote', 'add', 'desktop', p.desktop.bare);
  g(p.desktop.d, 'remote', 'add', 'mobile', p.mobile.bare);
  return p;
}

// ---------------------------------------------------------------- el USO y las salidas

test('USO: los cuatro comandos; mal llamado → 2 con el USO; fuera de git → 1', () => {
  for (const c of ['nuevo <TIPO> <alias>/<rol> <x> [--archivo <ruta>] [--de <alias>]', 'abiertos [--hilo <id>]', 'acordados [--hoy]', 'huella <alias>@<sha> <carpeta> [--copia <dir>]']) assert.ok(C.USO.includes(c), c);
  const p = dosProyectos();
  for (const args of [[], ['otro'], ['nuevo'], ['nuevo', 'ORDEN', 'desktop/director', 'identidad'], ['nuevo', 'pedido', 'desktop/director', 'identidad'],
    ['nuevo', 'PEDIDO', 'desktop', 'identidad'], ['nuevo', 'PEDIDO', 'desktop/obrero', 'identidad'], ['nuevo', 'PEDIDO', 'desktop/director', 'Identidad'],
    ['nuevo', 'PEDIDO', 'desktop/director', 'identidad', '--archivo'], ['nuevo', 'PEDIDO', 'desktop/director', 'identidad', '--de', 'Mobile'],
    ['abiertos', 'x'], ['abiertos', '--hoy'], ['abiertos', '--hilo'], ['acordados', '--hilo', 'x'], ['huella'], ['huella', 'desktop', 'db'], ['huella', 'desktop@zz', 'db']]) {
    const r = cli(p.mobile.d, args);
    assert.equal(r.codigo, 2, args.join(' '));
    assert.equal(r.out, '');
    assert.ok(r.err.includes(C.USO), args.join(' '));
  }
  const fuera = fs.mkdtempSync(path.join(TMP, 'fuera-'));
  assert.deepEqual(cli(fuera, ['acordados']), { codigo: 1, out: 'mesa: no estás dentro de un repo git\n', err: '' });
});

test('acordados sin mesa (el contrato de resumen.cjs): "— (sin acuerdos)" y salida 0; abiertos: "— (nada abierto)"', () => {
  const p = dosProyectos();
  assert.deepEqual(cli(p.mobile.d, ['acordados']), { codigo: 0, out: '— (sin acuerdos)\n', err: '' });
  assert.deepEqual(cli(p.mobile.d, ['acordados', '--hoy']), { codigo: 0, out: '— (sin acuerdos)\n', err: '' });
  assert.deepEqual(cli(p.mobile.d, ['abiertos']), { codigo: 0, out: '— (nada abierto)\n', err: '' });
});

// ---------------------------------------------------------------- nuevo: lo que no escribe

test('nuevo no: un obrero, el director de otro módulo, un módulo sin ficha, sin alias, > 2 KB, sin tema, el cuerpo con tipo:', () => {
  const p = dosProyectos();
  const m = p.mobile.d;
  const ok = borrador('tema: endpoint X\n\nprosa\n');
  const sinCambios = () => assert.equal(g(m, 'status', '--porcelain'), '', 'no escribió nada');
  const casos = [
    [['nuevo', 'PEDIDO', 'desktop/director', 'pagos', '--archivo', ok, '--de', 'mobile'], /^mesa: sos el director de identidad y el mensaje es del módulo pagos/],
    [['nuevo', 'PEDIDO', 'desktop/director', 'identidad', '--archivo', borrador(`tema: x\n\n${'y'.repeat(2100)}\n`), '--de', 'mobile'], /^mesa: no lo escribo — pesa \d+ B \(el tope es 2000\)/],
    [['nuevo', 'PEDIDO', 'desktop/director', 'identidad', '--archivo', borrador('sin cabecera\n'), '--de', 'mobile'], /falta "tema:"/],
    [['nuevo', 'PEDIDO', 'desktop/director', 'identidad', '--archivo', borrador('tipo: HECHO\ntema: x\n'), '--de', 'mobile'], /el cuerpo trae "tipo:"/],
    [['nuevo', 'PEDIDO', 'desktop/director', 'identidad', '--archivo', path.join(TMP, 'no-esta.md'), '--de', 'mobile'], /^mesa: no pude leer/],
    [['nuevo', 'RESPUESTA', 'desktop/director', 'identidad', '--archivo', borrador('tema: x\nresponde-a: desktop:docs/modulos/identidad/mesa/mobile/2026-10-24-1-PEDIDO.md@a1b2c3d4e5f6\nresultado: aceptado\n'), '--de', 'mobile'], /responde-a cita .*, que git no tiene/],
  ];
  for (const [args, re] of casos) {
    const r = cli(m, args);
    assert.equal(r.codigo, 1, args.join(' '));
    assert.match(r.out, re, args.join(' '));
    sinCambios();
  }
  // Sin --de: el alias sale del nombre del repo de origin (mobile.git → mobile).
  const r = cli(m, ['nuevo', 'HECHO', 'desktop/director', 'identidad', '--archivo', ok]);
  assert.equal(r.codigo, 0, r.out);
  assert.match(ultima(r.out), /^HECHO · mobile → desktop · endpoint X · mobile:docs\/modulos\/identidad\/mesa\/desktop\/\d{4}-\d{2}-\d{2}-1-HECHO\.md@[0-9a-f]{12}$/);
  // En main (una sesión plana), un módulo sin ficha no.
  g(m, 'checkout', '-q', 'main');
  assert.match(cli(m, ['nuevo', 'PEDIDO', 'desktop/director', 'pagos', '--archivo', ok, '--de', 'mobile']).out, /^mesa: no está docs\/modulos\/pagos\/README\.md/);
  sinCambios();
  // El director de otro módulo y un obrero, no.
  g(m, 'checkout', '-q', '-b', 'modulo/pagos');
  assert.match(cli(m, ['nuevo', 'PEDIDO', 'desktop/director', 'identidad', '--archivo', ok]).out, /^mesa: sos el director de pagos y el mensaje es del módulo identidad/);
  g(m, 'checkout', '-q', '-b', 'modulo/identidad--01');
  const o = cli(m, ['nuevo', 'PEDIDO', 'desktop/director', 'identidad', '--archivo', ok]);
  assert.equal(o.codigo, 1);
  assert.match(o.out, /^mesa: un obrero no escribe en la mesa/);
  sinCambios();
});

test('nuevo: sin push no hay aviso (salida 1, el archivo commiteado); el número del día sube', () => {
  const p = dosProyectos();
  const m = p.mobile.d;
  const b = borrador('tema: algo\n');
  const a = cli(m, ['nuevo', 'HECHO', 'desktop/director', 'identidad', '--archivo', b, '--de', 'mobile']);
  assert.equal(a.codigo, 0);
  assert.match(a.out, /-1-HECHO\.md@/);
  g(m, 'remote', 'set-url', 'origin', path.join(TMP, 'no-existe.git'));
  const r = cli(m, ['nuevo', 'HECHO', 'desktop/director', 'identidad', '--archivo', b, '--de', 'mobile']);
  assert.equal(r.codigo, 1);
  assert.match(r.out, /^mesa: docs\/modulos\/identidad\/mesa\/desktop\/\d{4}-\d{2}-\d{2}-2-HECHO\.md quedó commiteado \(@[0-9a-f]{12}\) pero no subió a origin — subilo \(git push\) antes de mandar el aviso/);
  assert.equal(g(m, 'status', '--porcelain'), '');
});

test('nuevo (RF-fix 5): el <n> mira también git — un número del día en otra rama local o solo en origin cuenta; otro día u otra carpeta, no', () => {
  const p = dosProyectos();
  const m = p.mobile.d;
  const DIA = new Date(2026, 9, 24, 12, 0, 0);
  const dir = 'docs/modulos/identidad/mesa/desktop';
  const hecho = (n, fecha = '2026-10-24', carpeta = dir) => `${carpeta}/${fecha}-${n}-HECHO.md`;
  const enRama = (rama, archivos) => {
    g(m, 'checkout', '-q', '-b', rama);
    for (const rel of archivos) escribir(m, rel, 'tipo: HECHO\nde: mobile/sesion\npara: desktop/director\ntema: x\n');
    g(m, 'add', '-A');
    g(m, 'commit', '-q', '-m', `mesa en ${rama}`);
    g(m, 'checkout', '-q', 'modulo/identidad');
  };
  // otra rama local con el 2 del día (y uno de otro día y otra carpeta con números más altos, que no cuentan)
  enRama('otra', [hecho(2), hecho(9, '2026-10-23'), hecho(8, '2026-10-24', 'docs/modulos/identidad/mesa/otro')]);
  // una rama que está solo en origin, con el 3
  enRama('remota', [hecho(3)]);
  g(m, 'push', '-q', 'origin', 'remota');
  g(m, 'branch', '-q', '-D', 'remota');
  assert.ok(!fs.existsSync(path.join(m, ...dir.split('/'))), 'en el disco de modulo/identidad no hay nada');
  const r = enProceso(m, ['nuevo', 'HECHO', 'desktop/director', 'identidad', '--archivo', borrador('tema: algo\n'), '--de', 'mobile'], DIA);
  assert.equal(r.codigo, 0, r.out);
  assert.match(ultima(r.out), /mobile:docs\/modulos\/identidad\/mesa\/desktop\/2026-10-24-4-HECHO\.md@/);
  // sin nada en git ni en el disco de ese día: 1
  const q = dosProyectos();
  const s = enProceso(q.mobile.d, ['nuevo', 'HECHO', 'desktop/director', 'identidad', '--archivo', borrador('tema: algo\n'), '--de', 'mobile'], DIA);
  assert.match(ultima(s.out), /2026-10-24-1-HECHO\.md@/);
});

// ---------------------------------------------------------------- la ficha canónica (G §19)

test('G §19: PEDIDO → aviso → mensaje vale del otro lado → abiertos de los dos lados → trabado a los 2 días → RESPUESTA hecho → nada abierto', () => {
  const p = dosProyectos();
  const [m, d] = [p.mobile.d, p.desktop.d];
  const spec = g(m, 'rev-parse', 'HEAD').slice(0, 12);
  // 1. El director de Mobile escribe el PEDIDO (≤ 2 KB, con su hecho citado), lo commitea y lo sube; recién ahí el aviso.
  const r = cli(m, ['nuevo', 'PEDIDO', 'desktop/director', 'identidad', '--de', 'mobile', '--archivo',
    borrador(`tema: endpoint X\nhechos: mobile:docs/modulos/identidad/README.md:2@${spec}\n\nNecesitamos que expongan el endpoint X.\n`)]);
  assert.equal(r.codigo, 0, r.out);
  const aviso = ultima(r.out);
  const mm = /^PEDIDO · mobile → desktop · endpoint X · mobile:(docs\/modulos\/identidad\/mesa\/desktop\/(\d{4}-\d{2}-\d{2})-1-PEDIDO\.md)@([0-9a-f]{12})$/.exec(aviso);
  assert.ok(mm, aviso);
  const [, ruta, , sha12] = mm;
  assert.equal(g(m, 'rev-parse', 'HEAD').slice(0, 12), sha12, 'el SHA del aviso es el commit del archivo');
  assert.equal(g(m, 'ls-remote', 'origin', 'modulo/identidad').slice(0, 12), sha12, 'subido antes del aviso (crit. 13)');
  assert.equal(g(m, 'show', '--name-only', '--format=', 'HEAD'), ruta, 'commit por ruta: solo el mensaje');
  const texto = fs.readFileSync(path.join(m, ...ruta.split('/')), 'utf8');
  assert.match(texto, /^tipo: PEDIDO\nde: mobile\/director\npara: desktop\/director\ntema: endpoint X\nhechos: /);

  // 2-3. Del lado de Desktop: el aviso vale para su director (git lo respalda, crit. 16); para un obrero, no.
  assert.equal(cli(d, ['mensaje', ...aviso.split(' ')], ENCARGO).out.trim().split('\n').pop(), `vale: leé mobile:${ruta}@${sha12}`);
  assert.equal(cli(d, ['mensaje', ...aviso.split(' ')], ENCARGO).codigo, 0);
  const falso = aviso.replace(sha12, 'ffffffffffff');
  assert.match(cli(d, ['mensaje', falso], ENCARGO).out, /^devuelto: el mensaje avisa, git manda — @ffffffffffff no está en este repo/m);
  g(d, 'checkout', '-q', '-b', 'modulo/identidad--01');
  assert.deepEqual(cli(d, ['mensaje', aviso], ENCARGO), { codigo: 1, out: 'no vale: PEDIDO no es para un obrero: anotalo y no lo ejecutes\n', err: '' });
  g(d, 'checkout', '-q', 'modulo/identidad');

  // abiertos de los dos lados: Mobile espera; a Desktop le toca.
  const ab = (dir) => cli(dir, ['abiertos']).out.trim();
  assert.match(ab(m), new RegExp(`^esperás · PEDIDO · mobile/director → desktop/director · endpoint X · mobile:${ruta}@${sha12} · esperando desde \\d{4}-\\d{2}-\\d{2} \\(0 días\\)$`));
  assert.match(ab(d), new RegExp(`^te toca · PEDIDO · mobile/director → desktop/director · endpoint X · mobile:${ruta}@${sha12} · esperando desde`));
  // 5. A los 2 días sin respuesta: "trabado por mesa" (lo calcula quien lo muestra; nadie lo escribe).
  const en = (dias) => new Date(Date.now() + dias * 24 * 60 * 60 * 1000);
  assert.doesNotMatch(enProceso(m, ['abiertos'], en(1.9)).out, /trabado por mesa/);
  assert.match(enProceso(m, ['abiertos'], en(2.1)).out, /\(2 días\) · trabado por mesa\n$/);
  assert.match(enProceso(m, ['abiertos', '--hilo', path.posix.basename(ruta)], en(3)).out, /esperando desde .* · trabado por mesa/);

  // 4. La RESPUESTA es otro archivo, en el repo de Desktop; nadie edita el PEDIDO.
  const hecho = g(d, 'rev-parse', 'HEAD').slice(0, 12);
  const resp = cli(d, ['nuevo', 'RESPUESTA', 'mobile/director', 'identidad', '--de', 'desktop', '--archivo',
    borrador(`tema: endpoint X\nresponde-a: mobile:${ruta}@${sha12}\nresultado: hecho desktop:${hecho}\n\nListo.\n`)]);
  assert.equal(resp.codigo, 0, resp.out);
  assert.match(ultima(resp.out), /^RESPUESTA · desktop → mobile · endpoint X · desktop:docs\/modulos\/identidad\/mesa\/mobile\/\d{4}-\d{2}-\d{2}-1-RESPUESTA\.md@[0-9a-f]{12}$/);
  assert.equal(ab(m), '— (nada abierto)', 'Mobile, en su próximo arranque, ya no lo lista');
  assert.equal(ab(d), '— (nada abierto)');
  const h = cli(m, ['abiertos', '--hilo', `mobile:${ruta}`]).out.trim().split('\n');
  assert.equal(h.length, 2);
  assert.match(h[1], new RegExp(`· RESPUESTA · desktop/director → mobile/director · endpoint X · desktop:.* · hecho desktop:${hecho}$`));
  assert.equal(fs.readFileSync(path.join(m, ...ruta.split('/')), 'utf8'), texto, 'el PEDIDO no se tocó');
  for (const dir of [m, d]) assert.deepEqual(K.CHEQUEOS.mesa(dir), [], 'candado:mesa en verde de los dos lados');
});

test('G §7 y §19.6: PROPUESTA → RESPUESTA aceptado → acordados lo lista una vez (de los dos lados); no se firma dos veces', () => {
  const p = dosProyectos();
  const [m, d] = [p.mobile.d, p.desktop.d];
  const r = cli(d, ['nuevo', 'PROPUESTA', 'mobile/director', 'identidad', '--de', 'desktop', '--archivo', borrador('tema: orden del esquema\n\nNosotros primero, después ustedes.\n')]);
  assert.equal(r.codigo, 0, r.out);
  const cita = ultima(r.out).split(' · ').pop();
  assert.match(cli(m, ['abiertos']).out, /^te toca · PROPUESTA · desktop\/director → mobile\/director · orden del esquema/);
  assert.equal(cli(m, ['acordados']).out, '— (sin acuerdos)\n', 'propuesta sin aceptar no es acuerdo');
  const firma = borrador(`tema: orden del esquema\nresponde-a: ${cita}\nresultado: aceptado\n`);
  const a = cli(m, ['nuevo', 'RESPUESTA', 'desktop/director', 'identidad', '--de', 'mobile', '--archivo', firma]);
  assert.equal(a.codigo, 0, a.out);
  const firmaCita = ultima(a.out).split(' · ').pop();
  for (const dir of [m, d]) {
    if (dir === d) cli(d, ['abiertos']); // Desktop trae lo de Mobile (acordados no trae)
    const ac = cli(dir, ['acordados']);
    assert.equal(ac.codigo, 0);
    assert.match(ac.out, new RegExp(`^- \\d{4}-\\d{2}-\\d{2} · orden del esquema · desktop/director ↔ mobile/director · ${cita.replace(/[.]/g, '\\.')} · aceptado en ${firmaCita.replace(/[.]/g, '\\.')}\n$`));
    assert.equal(cli(dir, ['acordados', '--hoy']).out, ac.out, 'firmado hoy');
    assert.equal(cli(dir, ['abiertos']).out, '— (nada abierto)\n');
  }
  assert.equal(enProceso(m, ['acordados', '--hoy'], new Date(Date.now() + 2 * 86400000)).out, '— (sin acuerdos)\n', 'otro día');
  // Firmar dos veces: no se escribe.
  const dos = cli(m, ['nuevo', 'RESPUESTA', 'desktop/director', 'identidad', '--de', 'mobile', '--archivo', firma]);
  assert.equal(dos.codigo, 1);
  assert.match(dos.out, /esa PROPUESTA ya está aceptada en mobile:.* — un acuerdo se firma una sola vez \(G §7\.1\)/);
  assert.equal(g(m, 'status', '--porcelain'), '');
});

// ---------------------------------------------------------------- huella (G §8.3)

test('huella: el conjunto del dueño a un SHA contra la copia del consumidor — coinciden 0; distinta 1; SHA que no está 1', () => {
  const p = dosProyectos();
  const [m, d] = [p.mobile.d, p.desktop.d];
  const sha = g(d, 'rev-parse', 'HEAD');
  g(m, 'fetch', '-q', 'desktop');
  const copia = path.join(TMP, `copia${nb++}`);
  escribir(copia, 'esquema.sql', 'create table usuarios (id int); -- desktop\r\n'); // CRLF en la copia: la misma huella
  const r = cli(m, ['huella', `desktop@${sha.slice(0, 12)}`, 'db', '--copia', copia]);
  assert.equal(r.codigo, 0, r.out);
  const [l1, l2, l3] = r.out.trim().split('\n');
  assert.match(l1, new RegExp(`^huella desktop@${sha.slice(0, 12)} db: ([0-9a-f]{16}) \\(1 archivos\\)$`));
  assert.equal(l1.split(': ')[1].slice(0, 16), l2.split(': ')[1].slice(0, 16), 'la misma cuenta de los dos lados');
  assert.equal(l3, 'coinciden');
  assert.equal(cli(d, ['huella', `desktop@${sha.slice(0, 12)}`, 'db']).out.split('\n')[0], l1, 'el dueño la calcula igual');
  escribir(copia, 'esquema.sql', 'create table usuarios (id bigint);\n');
  const x = cli(m, ['huella', `desktop@${sha.slice(0, 12)}`, 'db', '--copia', copia]);
  assert.equal(x.codigo, 1);
  assert.match(x.out, /NO coinciden/);
  assert.equal(cli(m, ['huella', 'desktop@ffffffffffff', 'db']).codigo, 1);
  assert.match(cli(m, ['huella', '--copia', copia]).out, /^huella copia .*: [0-9a-f]{16} \(1 archivos\)\n$/);
});
