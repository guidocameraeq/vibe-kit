#!/usr/bin/env node
'use strict';
// gh-falso.cjs — el `gh` de mentira del banco de prueba (pruebas/banco/). Lo usa `traer-repos.cjs --gh <este archivo>` para que
// "preparame esta PC" traiga los repos de la cuenta sin la sesión real de gh y sin tocar GitHub: la lista sale de
// $BANCO/cuenta.json (la armó `banco.sh remotos` con el gh real, solo lectura) y cada clon sale del remoto `bare` del banco.
//
// Entiende solo lo que pide traer-repos:
//   gh api user --jq .login              → el login
//   gh api user/orgs --jq .[].login      → las organizaciones, una por renglón
//   gh repo list [<dueño>] --limit N --json nameWithOwner,url
//   gh repo clone <dueño/repo> <destino> -- <args de git clone>
// Lo demás sale 1 con "gh-falso: no sé hacer eso". Node estándar, cero dependencias.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const BANCO = process.env.BANCO;
if (!BANCO || !fs.existsSync(path.join(BANCO, 'cuenta.json'))) {
  process.stderr.write('gh-falso: falta BANCO (la carpeta del banco, con cuenta.json)\n');
  process.exit(1);
}
const cuenta = JSON.parse(fs.readFileSync(path.join(BANCO, 'cuenta.json'), 'utf8'));
const a = process.argv.slice(2);
const sale = (txt, cod = 0) => process.stdout.write(txt, () => process.exit(cod));

if (a[0] === 'api' && a[1] === 'user') sale(`${cuenta.login}\n`);
else if (a[0] === 'api' && a[1] === 'user/orgs') sale(cuenta.orgs.map((o) => `${o}\n`).join(''));
else if (a[0] === 'repo' && a[1] === 'list') {
  const dueno = a[2] && !a[2].startsWith('--') ? a[2] : cuenta.login;
  const xs = cuenta.repos.filter((r) => r.nameWithOwner.split('/')[0].toLowerCase() === dueno.toLowerCase());
  sale(JSON.stringify(xs.map((r) => ({ nameWithOwner: r.nameWithOwner, url: r.url }))));
} else if (a[0] === 'repo' && a[1] === 'clone' && a[2] && a[3]) {
  const r = cuenta.repos.find((x) => x.nameWithOwner === a[2]);
  const bare = r && path.join(BANCO, 'remotos', `${r.nameWithOwner.replace('/', '__')}.git`);
  if (!bare || !fs.existsSync(bare)) {
    process.stderr.write(`gh-falso: ${a[2]} no tiene remoto en el banco\n`);
    process.exit(1);
  }
  const extra = a.indexOf('--') >= 0 ? a.slice(a.indexOf('--') + 1) : [];
  const g = spawnSync('git', ['clone', '--quiet', ...extra, bare, a[3]], { stdio: 'inherit', windowsHide: true });
  process.exit(g.status === null ? 1 : g.status);
} else {
  process.stderr.write(`gh-falso: no sé hacer eso (${a.join(' ')})\n`);
  process.exit(1);
}
