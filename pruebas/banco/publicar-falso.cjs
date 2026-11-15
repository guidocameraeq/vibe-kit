'use strict';
// publicar-falso.cjs — el publicar DE MENTIRA de las noches del banco (pruebas/banco/; el mismo de la noche de R2). No toca nada
// real: sube HEAD a la rama `produccion` del remoto de prueba (un `bare` del banco) y deja ahí `publicado.txt` con la fecha y el
// commit. `humo` mira que `produccion` sea HEAD y que publicado.txt lo nombre; `volver` deja `produccion` donde estaba.
// Uso (desde la raíz del repo): node banco/publicar.cjs publicar|humo|volver
// Se niega (2) si el origin no es una carpeta local `bare` dentro de un scratchpad o de una carpeta banco.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim();
const origin = git('remote', 'get-url', 'origin');
const remoto = path.resolve(origin);
const local = !/^[a-z][a-z0-9+.-]*:\/\//i.test(origin) && !/^[^/\\]+@[^:]+:/.test(origin);
if (!local || !fs.existsSync(path.join(remoto, 'HEAD')) || !/scratchpad|[\\/]banco[\\/]/i.test(remoto)) {
  console.error('publicar-falso: el origin no es el remoto de prueba del banco: no hago nada');
  process.exit(2);
}
const archivo = path.join(remoto, 'publicado.txt');
const anterior = path.join(remoto, 'publicado-anterior.txt');
const enProduccion = () => {
  try {
    return git('ls-remote', 'origin', 'refs/heads/produccion').split(/\s+/)[0] || '';
  } catch (e) {
    return '';
  }
};
const paso = process.argv[2];

if (paso === 'publicar') {
  const head = git('rev-parse', 'HEAD');
  fs.writeFileSync(anterior, `${enProduccion()}\n`);
  git('push', '--force', 'origin', `${head}:refs/heads/produccion`);
  fs.writeFileSync(archivo, `${new Date().toISOString()} ${head}\n`);
  console.log(`publicado ${head.slice(0, 7)}`);
} else if (paso === 'humo') {
  const head = git('rev-parse', 'HEAD');
  const dice = fs.existsSync(archivo) ? fs.readFileSync(archivo, 'utf8') : '';
  if (enProduccion() !== head) {
    console.error('humo: produccion no es este commit');
    process.exit(1);
  }
  if (!dice.includes(head)) {
    console.error('humo: publicado.txt no nombra este commit');
    process.exit(1);
  }
  console.log('humo: pasó');
} else if (paso === 'volver') {
  const antes = fs.existsSync(anterior) ? fs.readFileSync(anterior, 'utf8').trim() : '';
  if (antes) git('push', '--force', 'origin', `${antes}:refs/heads/produccion`);
  else git('push', 'origin', '--delete', 'produccion');
  fs.writeFileSync(archivo, `${new Date().toISOString()} ${antes || '(nada)'} (volví)\n`);
  console.log('volví al anterior');
} else {
  console.error('uso: node banco/publicar.cjs publicar|humo|volver');
  process.exit(2);
}
