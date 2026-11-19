'use strict';
// armar-buzon.test.cjs — el andamio de las pruebas del buzón (no trae pruebas propias). Arma un buzón falso en el temporal del
// sistema, un home de mentira y repos git chicos: NUNCA la carpeta real ni el home real. La cuenta dueña de cada archivo se
// inyecta (una prueba no puede crear archivos de otra cuenta): `duenos` mira un mapa ruta → cuenta y, si no está, da YO.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const P = require('./protocolo.cjs');

const B = String.fromCharCode(92);
const YO = `PC1${B}yo`;
const OTRA = `PC2${B}otra`;
const TERCERA = `PC3${B}intrusa`;
const AHORA = Date.parse('2026-11-19T15:00:00Z');
const MIN = 60000;
const HORA = 36e5;
const RAIZ = fs.mkdtempSync(path.join(os.tmpdir(), 'buzon-prueba-'));
let k = 0;

function gitEn(cwd, ...args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', env: { ...process.env, GIT_AUTHOR_NAME: 'p', GIT_AUTHOR_EMAIL: 'p@p', GIT_COMMITTER_NAME: 'p', GIT_COMMITTER_EMAIL: 'p@p' } });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}
// Un repo con un commit: { ruta, sha, archivos }
function repo(nombre, archivos = { 'docs/estado.md': 'linea uno\nla versión 2 sale el viernes que viene sin falta\nlinea tres\n' }) {
  const ruta = path.join(RAIZ, `repo-${++k}`, nombre);
  fs.mkdirSync(ruta, { recursive: true });
  gitEn(ruta, 'init', '-q');
  for (const [rel, t] of Object.entries(archivos)) {
    fs.mkdirSync(path.dirname(path.join(ruta, rel)), { recursive: true });
    fs.writeFileSync(path.join(ruta, rel), t);
  }
  gitEn(ruta, 'add', '-A');
  gitEn(ruta, 'commit', '-q', '-m', 'uno');
  return { ruta: fs.realpathSync.native(ruta), sha: gitEn(ruta, 'rev-parse', 'HEAD') };
}

function buzon() {
  const base = path.join(RAIZ, `b${++k}`);
  const carpeta = path.join(base, 'buzon');
  const home = path.join(base, 'home');
  for (const d of ['agentes', 'conversaciones', 'leidos', 'tmp', 'adjuntos']) fs.mkdirSync(path.join(carpeta, d), { recursive: true });
  fs.writeFileSync(path.join(carpeta, 'LEEME.md'), '# Buzón de agentes — protocolo v0\n\ntexto\n');
  fs.mkdirSync(home, { recursive: true });
  const duenosMapa = new Map();
  let t = AHORA - 10 * 864e5;
  const b = {
    base,
    carpeta,
    home,
    cfgDir: path.join(home, '.config', 'kit-buzon'),
    pendientes: new Set(),
    llamadas: 0,
    // la función que reemplaza a dueno.duenos
    duenos: (dir, nombres) => {
      b.llamadas++;
      return new Map(nombres.map((n) => {
        const p = path.join(dir, n);
        if (b.pendientes.has(p)) return [n, null];
        return [n, duenosMapa.has(p) ? duenosMapa.get(p) : YO];
      }));
    },
    dueno(ruta, cuenta) {
      duenosMapa.set(ruta, cuenta);
    },
    escribir(rel, obj, cuenta = YO) {
      const p = path.join(carpeta, ...rel.split('/'));
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, typeof obj === 'string' || Buffer.isBuffer(obj) ? obj : JSON.stringify(obj, null, 2));
      b.dueno(p, cuenta);
      return p;
    },
    conv(nombre, datos = {}, cuenta = YO) {
      b.escribir(`conversaciones/${nombre}/conversacion.json`, { protocolo: 1, id: nombre, tipo: 'directa', tema: 't', abierta_por: 'x/y', creada: new Date(AHORA - 20 * 864e5).toISOString(), participantes: [], ...datos }, cuenta);
      fs.mkdirSync(path.join(carpeta, 'conversaciones', nombre, 'mensajes'), { recursive: true });
      return nombre;
    },
    // un mensaje; v1 salvo { v0: true }. → { id, archivo, ruta }
    msg(conv, campos = {}, { cuenta = YO, v0 = false, creado } = {}) {
      t += MIN;
      const cuando = creado != null ? creado : t;
      const de = campos.de || 'mobile/juan';
      const id = `${P.sello(cuando)}_${P.aArchivo(de)}_${(++k).toString(16).padStart(4, '0').slice(-4)}`;
      const m = v0
        ? { id, conversacion: conv, de, para: [], tipo: 'pregunta', responde_a: null, asunto: 'a', cuerpo: 'c', citas: [], adjuntos: [], esperando_respuesta_de: [], creado: new Date(cuando).toISOString(), ...campos }
        : { protocolo: 1, id, conversacion: conv, de, para: [], tipo: 'PEDIDO', responde_a: [], asunto: 'a', cuerpo: 'c', citas: [], adjuntos: [], creado: new Date(cuando).toISOString(), ...campos };
      const ruta = b.escribir(`conversaciones/${conv}/mensajes/${id}.json`, m, cuenta);
      return { id, archivo: `${id}.json`, ruta, k: `${conv}/${id}.json` };
    },
    regV0(id, cuenta = YO, extra = {}) {
      const [persona, resto] = id.split('@');
      const [pc, proyecto] = resto.split('/');
      return b.escribir(`agentes/${P.aArchivo(id)}.json`, { id, persona, pc, proyecto, rol: 'otro', descripcion: '', registrado: '2026-10-21T00:00:00Z', ultima_senal: '2026-10-21T00:00:00Z', ...extra }, cuenta);
    },
    regV1(id, cuenta = YO, extra = {}, nombre = 'registro.json') {
      const [proyecto, persona] = id.split('/');
      return b.escribir(`agentes/${P.aArchivo(id)}/${nombre}`, { protocolo: 1, id, proyecto, persona, cuentas: [cuenta], compartida: false, antes: [], registrado: '2026-11-19T00:00:00Z', descripcion: '', ...extra }, cuenta);
    },
    leidosV1(id, leidos, cuenta = YO) {
      return b.escribir(`leidos/${P.aArchivo(id)}.json`, { protocolo: 1, leidos }, cuenta);
    },
    leidosV0(id, obj, cuenta = YO) {
      return b.escribir(`leidos/${P.aArchivo(id)}.json`, obj, cuenta);
    },
    config(extra = {}) {
      fs.mkdirSync(b.cfgDir, { recursive: true });
      const c = { protocolo: 1, carpeta, persona: 'ana', cuenta: YO, compartida: false, agentes: [], contestar_solo: true, ...extra };
      fs.writeFileSync(path.join(b.cfgDir, 'config.json'), JSON.stringify(c, null, 2));
      return c;
    },
    // settings del home con el anti-secretos registrado (o no)
    settings(conCorrector = true) {
      fs.mkdirSync(path.join(home, '.claude'), { recursive: true });
      const cmd = `node "${home.split(B).join('/')}/.claude/hooks/kit/secretos.cjs"`;
      const s = conCorrector ? { hooks: { PreToolUse: [{ matcher: 'Bash', hooks: [{ type: 'command', command: cmd }] }] } } : { hooks: {} };
      fs.writeFileSync(path.join(home, '.claude', 'settings.json'), JSON.stringify(s));
    },
    entorno(extra = {}) {
      return { home, duenos: b.duenos, ahora: AHORA, cwd: base, env: { CLAUDE_CODE_ENTRYPOINT: 'cli' }, stdin: '', stdinEsArchivo: false, cuentaDeSesion: () => YO, ...extra };
    },
    foto(rel) {
      const out = {};
      (function rec(d) {
        if (!fs.existsSync(d)) return;
        for (const e of fs.readdirSync(d, { withFileTypes: true })) {
          const p = path.join(d, e.name);
          if (e.isDirectory()) rec(p);
          else out[path.relative(carpeta, p)] = fs.readFileSync(p, 'hex');
        }
      })(rel ? path.join(carpeta, rel) : carpeta);
      return out;
    },
  };
  return b;
}

module.exports = { buzon, repo, gitEn, YO, OTRA, TERCERA, AHORA, MIN, HORA, RAIZ, B };
