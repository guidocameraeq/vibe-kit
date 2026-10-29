'use strict';
// Pruebas de zona-propia.cjs. Corren con: node --test "kit/**/*.test.cjs"
// Regla de estas pruebas (la de ficha.test.cjs): cada regla tiene su caso, donde ninguna otra la tape, y los problemas se
// comparan con una regex sobre el mensaje, no solo con el ok: si alguien borra la regla, la prueba se pone en rojo.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { hash } = require('./ficha.cjs');
const Z = require('./zona-propia.cjs');
const { normalizarId, zonas, mezclarTexto, hashPieza, rutaPropia, leerJsonSinDuplicados, reglas, mezclarSettings, desviosSettings, textoSettings } = Z;

const A = Z.MARCA_ABRE;
const C = Z.MARCA_CIERRA;
const L = (...r) => r.join('\n');
const H = (id) => normalizarId(id); // los ids de hooks se esperan normalizados (sin comillas, con /)

// ---------------------------------------------------------------- las marcas

test('las marcas son las de E §5', () => {
  assert.equal(A, '<!-- kit:propio -->');
  assert.equal(C, '<!-- /kit:propio -->');
});

// ---------------------------------------------------------------- zonas

test('zonas: dos zonas, con sus renglones y su contenido', () => {
  const t = L('# Inicio', A, '## Lo propio', '- uno', C, 'molde', A, 'dos', C, '');
  assert.deepEqual(zonas(t), {
    ok: true,
    zonas: [
      { desde: 2, hasta: 5, contenido: '## Lo propio\n- uno' },
      { desde: 7, hasta: 9, contenido: 'dos' },
    ],
  });
});

test('zonas: una zona vacía tiene contenido vacío', () => {
  assert.deepEqual(zonas(L('a', A, C, 'b')), { ok: true, zonas: [{ desde: 2, hasta: 3, contenido: '' }] });
});

test('zonas: sin marcas, ninguna zona', () => {
  assert.deepEqual(zonas('solo molde\n'), { ok: true, zonas: [] });
});

test('zonas: la marca con espacios y tabs alrededor vale', () => {
  assert.deepEqual(zonas(L('a', `   ${A}\t`, 'x', `\t${C}  `)), { ok: true, zonas: [{ desde: 2, hasta: 4, contenido: 'x' }] });
});

test('zonas: una marca metida en una línea de texto no es marca', () => {
  const t = L(`Las zonas se marcan con ${A} y ${C}.`, `texto ${A}`, `${C} y más`);
  assert.deepEqual(zonas(t), { ok: true, zonas: [] });
});

test('zonas: CRLF se tolera (contenido con LF)', () => {
  assert.deepEqual(zonas(['a', A, 'x', 'y', C, ''].join('\r\n')), { ok: true, zonas: [{ desde: 2, hasta: 5, contenido: 'x\ny' }] });
});

test('zonas: apertura sin cierre, con el renglón de la apertura', () => {
  const r = zonas(L('a', A, 'b', 'c'));
  assert.equal(r.ok, false);
  assert.equal(r.linea, 2);
  assert.match(r.problema, /apertura sin cierre/);
});

test('zonas: cierre sin apertura, con su renglón', () => {
  const r = zonas(L('a', A, 'b', C, 'c', C));
  assert.equal(r.ok, false);
  assert.equal(r.linea, 6);
  assert.match(r.problema, /cierre sin apertura/);
});

test('zonas: anidada, con el renglón de la segunda apertura y el de la primera en el texto', () => {
  const r = zonas(L(A, 'a', A, 'b', C, C));
  assert.equal(r.ok, false);
  assert.equal(r.linea, 3);
  assert.match(r.problema, /anidada.*renglón 1/);
});

// ---------------------------------------------------------------- mezclarTexto

test('mezclarTexto: el molde nuevo con lo propio del proyecto, por orden', () => {
  const molde = L('# v2', A, '## Lo propio de este proyecto', C, 'paso nuevo', A, C, 'fin', '');
  const proy = L('# v1', A, '## Lo propio de este proyecto', '- regla mía', C, 'paso viejo', A, 'otra mía', C, '');
  assert.deepEqual(mezclarTexto(molde, proy), {
    ok: true,
    texto: L('# v2', A, '## Lo propio de este proyecto', '- regla mía', C, 'paso nuevo', A, 'otra mía', C, 'fin', ''),
  });
});

test('mezclarTexto: una zona vacía del proyecto vacía la del molde; las marcas son las del molde', () => {
  const r = mezclarTexto(L('x', `  ${A}`, 'del molde', C), L('y', A, C));
  assert.deepEqual(r, { ok: true, texto: L('x', `  ${A}`, C) });
});

test('mezclarTexto: sin zonas en ninguno, sale el molde nuevo', () => {
  assert.deepEqual(mezclarTexto('nuevo\n', 'viejo\n'), { ok: true, texto: 'nuevo\n' });
});

test('mezclarTexto: con CRLF en el proyecto, sale con LF', () => {
  const r = mezclarTexto(L('m', A, C, ''), ['p', A, 'mío', C, ''].join('\r\n'));
  assert.deepEqual(r, { ok: true, texto: L('m', A, 'mío', C, '') });
});

test('mezclarTexto: cantidad distinta de zonas → no se toca', () => {
  const r = mezclarTexto(L(A, C, A, C), L(A, 'mío', C));
  assert.equal(r.ok, false);
  assert.equal(r.texto, undefined);
  assert.match(r.problema, /2 zona.*1/);
});

test('mezclarTexto: marca rota en el proyecto → no se toca, y dice dónde', () => {
  const r = mezclarTexto(L(A, C), L('a', A, 'mío'));
  assert.equal(r.ok, false);
  assert.match(r.problema, /^el proyecto, renglón 2: apertura sin cierre/);
});

test('mezclarTexto: marca rota en el molde nuevo → no se toca', () => {
  const r = mezclarTexto(L(C), L(A, C));
  assert.equal(r.ok, false);
  assert.match(r.problema, /^el molde nuevo, renglón 1: cierre sin apertura/);
});

// ---------------------------------------------------------------- hashPieza

test('hashPieza: lo de adentro de las zonas no mueve el hash', () => {
  const a = L('molde', A, 'x', C, 'más', A, C, '');
  const b = L('molde', A, 'otra cosa', 'mucho más', C, 'más', A, 'y', C, '');
  assert.equal(hashPieza(a), hashPieza(b));
});

test('hashPieza: = ficha.hash con las zonas vaciadas (las marcas quedan)', () => {
  assert.equal(hashPieza(L('m', A, 'x', C, '')), hash(L('m', A, C, '')));
  assert.notEqual(hashPieza(L('m', A, 'x', C, '')), hash(L('m', '')));
});

test('hashPieza: lo de afuera sí lo mueve', () => {
  assert.notEqual(hashPieza(L('m', A, C)), hashPieza(L('m2', A, C)));
});

test('hashPieza: sin zonas = ficha.hash; CRLF da lo mismo; acepta un Buffer', () => {
  assert.equal(hashPieza('a\nb\n'), hash('a\nb\n'));
  assert.equal(hashPieza(['m', A, 'x', C, ''].join('\r\n')), hashPieza(L('m', A, 'z', C, '')));
  assert.equal(hashPieza(Buffer.from(L('m', A, 'x', C))), hashPieza(L('m', A, C)));
});

test('hashPieza: con una marca rota, el hash del texto entero (no explota)', () => {
  const t = L('m', A, 'x');
  assert.equal(hashPieza(t), hash(t));
  assert.notEqual(hashPieza(t), hashPieza(L('m', A, 'y')));
});

// ---------------------------------------------------------------- rutaPropia

test('rutaPropia: el hermano .propio.sh en la misma carpeta', () => {
  const d = path.join('x', '.claude', 'hooks');
  assert.equal(rutaPropia(path.join(d, 'session-start.cjs')), path.join(d, 'session-start.propio.sh'));
  assert.equal(rutaPropia(path.join(d, 'escritura-docs.cjs')), path.join(d, 'escritura-docs.propio.sh'));
  assert.equal(rutaPropia('session-start.cjs'), 'session-start.propio.sh');
});

// ---------------------------------------------------------------- leerJsonSinDuplicados

test('leerJsonSinDuplicados: un JSON bueno abre igual que con JSON.parse', () => {
  const t = '{"a": [1, {"b": "x\\"y"}], "c": {"d": null, "e": true}, "f": -1.5e3, "g": []}';
  assert.deepEqual(leerJsonSinDuplicados(t), { ok: true, valor: JSON.parse(t) });
});

test('leerJsonSinDuplicados: la misma clave en objetos distintos no es repetida', () => {
  const r = leerJsonSinDuplicados('{"a": {"x": 1}, "b": {"x": 2}, "l": [{"x": 1}, {"x": 2}]}');
  assert.equal(r.ok, true);
});

test('leerJsonSinDuplicados: clave repetida arriba de todo', () => {
  const r = leerJsonSinDuplicados('{\n  "a": 1,\n  "a": 2\n}');
  assert.equal(r.ok, false);
  assert.match(r.problema, /clave "a" repetida en la raíz \(renglón 3\)/);
});

test('leerJsonSinDuplicados: clave repetida a dos niveles de profundidad', () => {
  const t = '{\n  "permissions": {\n    "allow": ["x"],\n    "deny": [],\n    "allow": []\n  }\n}';
  const r = leerJsonSinDuplicados(t);
  assert.equal(r.ok, false);
  assert.match(r.problema, /clave "allow" repetida en permissions \(renglón 5\)/);
});

test('leerJsonSinDuplicados: clave repetida dentro de una lista de objetos', () => {
  const r = leerJsonSinDuplicados('{"hooks": {"Stop": [{"matcher": "", "matcher": "x", "hooks": []}]}}');
  assert.equal(r.ok, false);
  assert.match(r.problema, /clave "matcher" repetida en hooks\.Stop\[0\]/);
});

test('leerJsonSinDuplicados: la misma clave escrita con un escape también es repetida', () => {
  const r = leerJsonSinDuplicados('{"a": 1, "\\u0061": 2}');
  assert.equal(r.ok, false);
  assert.match(r.problema, /clave "a" repetida/);
});

test('leerJsonSinDuplicados: un texto con llaves y comillas adentro no confunde al lector', () => {
  const r = leerJsonSinDuplicados('{"a": "{\\"a\\": 1, \\"a\\": 2}", "b": "\\\\", "c": 1}');
  assert.deepEqual(r, { ok: true, valor: { a: '{"a": 1, "a": 2}', b: '\\', c: 1 } });
});

test('leerJsonSinDuplicados: JSON inválido → problema, sin valor', () => {
  for (const t of ['{"a": 1,}', '', '{a: 1}', '[1 2]']) {
    const r = leerJsonSinDuplicados(t);
    assert.equal(r.ok, false, t);
    assert.equal(r.valor, undefined);
    assert.match(r.problema, /el JSON no abre/);
  }
});

test('leerJsonSinDuplicados: el BOM del principio no es contenido', () => {
  assert.deepEqual(leerJsonSinDuplicados('\uFEFF{"a": 1}'), { ok: true, valor: { a: 1 } });
});

test('leerJsonSinDuplicados: un valor que no es objeto también abre', () => {
  assert.deepEqual(leerJsonSinDuplicados(' [1, "a", null] '), { ok: true, valor: [1, 'a', null] });
  assert.deepEqual(leerJsonSinDuplicados('3'), { ok: true, valor: 3 });
});

// ---------------------------------------------------------------- reglas

const hook = (command, extra = {}) => ({ type: 'command', command, timeout: 20, ...extra });
const ARRANQUE = 'node "$CLAUDE_PROJECT_DIR/.claude/hooks/session-start.cjs"';
const ESCRITURA = 'node "$CLAUDE_PROJECT_DIR/.claude/hooks/escritura-docs.cjs"';
const NIEGA = 'node "$CLAUDE_PROJECT_DIR/.claude/hooks/niega-aprobar.cjs"';

test('reglas: permisos y hooks con su id', () => {
  const s = {
    permissions: { allow: ['Bash(ls:*)'], ask: ['Bash(git push:*)'], deny: ['Read(./.env)'], defaultMode: 'default' },
    hooks: {
      SessionStart: [{ matcher: '', hooks: [hook(ARRANQUE)] }],
      PreToolUse: [{ matcher: 'Write', hooks: [hook(ESCRITURA)] }, { hooks: [{ type: 'prompt', prompt: 'revisá' }] }],
    },
  };
  assert.deepEqual(reglas(s).map((r) => r.id), [
    'allow:Bash(ls:*)',
    'ask:Bash(git push:*)',
    'deny:Read(./.env)',
    H(`hook:SessionStart//${ARRANQUE}`),
    H(`hook:PreToolUse/Write/${ESCRITURA}`),
    'hook:PreToolUse//revisá',
  ]);
  const h = reglas(s)[4];
  assert.equal(h.tipo, 'hook');
  assert.equal(h.evento, 'PreToolUse');
  assert.equal(h.matcher, 'Write');
  assert.equal(h.comando, ESCRITURA);
});

test('normalizarId: sin comillas dobles y con \\ → / (r5-4); lo demás, igual', () => {
  assert.equal(normalizarId('hook:SessionStart//node "$CLAUDE_PROJECT_DIR/.claude/hooks/x.cjs"'), 'hook:SessionStart//node $CLAUDE_PROJECT_DIR/.claude/hooks/x.cjs');
  assert.equal(normalizarId('deny:Read(.\\secretos\\**)'), 'deny:Read(./secretos/**)');
  assert.equal(normalizarId("allow:Bash(echo 'a b':*)"), "allow:Bash(echo 'a b':*)");
  assert.equal(normalizarId('allow:Bash(ls:*)'), 'allow:Bash(ls:*)');
});

test('reglas: el id sale normalizado; el comando y el texto, tal cual', () => {
  const s = { permissions: { deny: ['Read(.\\.env)'] }, hooks: { SessionStart: [{ matcher: '', hooks: [hook('node "$CLAUDE_PROJECT_DIR/.claude/hooks/x.cjs"')] }] } };
  const r = reglas(s);
  assert.deepEqual(r.map((x) => x.id), ['deny:Read(./.env)', 'hook:SessionStart//node $CLAUDE_PROJECT_DIR/.claude/hooks/x.cjs']);
  assert.equal(r[0].texto, 'Read(.\\.env)');
  assert.equal(r[1].comando, 'node "$CLAUDE_PROJECT_DIR/.claude/hooks/x.cjs"');
});

test('reglas: un settings vacío o con formas raras no explota', () => {
  assert.deepEqual(reglas({}), []);
  assert.deepEqual(reglas(null), []);
  assert.deepEqual(reglas({ permissions: { allow: 'x' }, hooks: { Stop: 'y' } }), []);
});

// ---------------------------------------------------------------- mezclarSettings

const J = (v) => JSON.stringify(v, null, 2);
// El molde de D2.1 y uno de D2.2 de muestra (el nuevo suma permisos, el hook de aprobar y saca un allow).
const VIEJO = {
  permissions: { allow: ['Bash(node --test:*)', 'Bash(git status)'], deny: ['Read(./.env)'] },
  hooks: {
    SessionStart: [{ matcher: '', hooks: [hook(ARRANQUE)] }],
    PreToolUse: [{ matcher: 'Write', hooks: [hook(ESCRITURA)] }],
  },
};
const NUEVO = {
  permissions: {
    allow: ['Bash(node --test:*)', 'Bash(node .claude/scripts/cambios.cjs:*)'],
    ask: ['Bash(node .claude/scripts/cambios.cjs aprobar:*)'],
    deny: ['Read(./.env)', 'Write(./.claude/cambios/**)'],
  },
  hooks: {
    SessionStart: [{ matcher: '', hooks: [hook(ARRANQUE)] }],
    PreToolUse: [
      { matcher: 'Write', hooks: [hook(ESCRITURA)] },
      { matcher: 'Bash|PowerShell', hooks: [hook(NIEGA, { onFailure: 'block' })] },
    ],
  },
};
const mezclar = (o) => {
  const r = mezclarSettings({ viejo: J(VIEJO), nuevo: J(NUEVO), proyecto: J(VIEJO), quitados: [], ...o });
  assert.equal(r.ok, true, r.problema);
  return r;
};

test('mezclarSettings: primera instalación (viejo null, proyecto sin settings) = el molde nuevo', () => {
  const r = mezclar({ viejo: null, proyecto: null });
  assert.deepEqual(r.settings, NUEVO);
  assert.equal(r.texto, `${J(NUEVO)}\n`);
  assert.ok(r.informe.sumadas.includes('allow:Bash(node .claude/scripts/cambios.cjs:*)'));
  assert.ok(r.informe.sumadas.includes(H(`hook:PreToolUse/Bash|PowerShell/${NIEGA}`)));
});

test('mezclarSettings: primera instalación sobre un settings del proyecto: lo del proyecto queda y se suma el molde', () => {
  const proy = { model: 'opus', permissions: { allow: ['Bash(npm test)'] } };
  const r = mezclar({ viejo: null, proyecto: J(proy) });
  assert.deepEqual(r.settings.permissions.allow, ['Bash(npm test)', 'Bash(node --test:*)', 'Bash(node .claude/scripts/cambios.cjs:*)']);
  assert.equal(r.settings.model, 'opus');
  assert.deepEqual(Object.keys(r.settings), ['permissions', 'hooks', 'model']);
});

test('mezclarSettings: la regla nueva entra; lo que no cambió queda igual', () => {
  const r = mezclar();
  assert.deepEqual(r.settings.permissions.deny, ['Read(./.env)', 'Write(./.claude/cambios/**)']);
  assert.deepEqual(r.settings.permissions.ask, ['Bash(node .claude/scripts/cambios.cjs aprobar:*)']);
  assert.deepEqual(r.informe.sumadas, [
    'allow:Bash(node .claude/scripts/cambios.cjs:*)',
    'ask:Bash(node .claude/scripts/cambios.cjs aprobar:*)',
    'deny:Write(./.claude/cambios/**)',
    H(`hook:PreToolUse/Bash|PowerShell/${NIEGA}`),
  ]);
});

test('mezclarSettings: la regla que el molde retiró se va si el proyecto la tenía', () => {
  const r = mezclar();
  assert.deepEqual(r.settings.permissions.allow, ['Bash(node --test:*)', 'Bash(node .claude/scripts/cambios.cjs:*)']);
  assert.deepEqual(r.informe.retiradas, ['allow:Bash(git status)']);
});

test('mezclarSettings: la regla quitada en la ficha no vuelve (vigente)', () => {
  const r = mezclar({ quitados: [{ id: 'deny:Write(./.claude/cambios/**)', por: 'x', hasta: 'siempre' }] });
  assert.deepEqual(r.settings.permissions.deny, ['Read(./.env)']);
  assert.ok(r.informe.respetadas.includes('deny:Write(./.claude/cambios/**)'));
  assert.ok(!r.informe.sumadas.includes('deny:Write(./.claude/cambios/**)'));
});

test('mezclarSettings: la regla quitada no vuelve aunque su hasta esté vencido; tampoco un hook', () => {
  const r = mezclar({
    quitados: [
      { id: 'ask:Bash(node .claude/scripts/cambios.cjs aprobar:*)', por: 'x', hasta: '2020-01-01' },
      { id: H(`hook:PreToolUse/Bash|PowerShell/${NIEGA}`), por: 'y', hasta: '2020-01-01' },
    ],
  });
  assert.equal(r.settings.permissions.ask, undefined, 'el proyecto no tenía ask y no se suma nada: no aparece');
  assert.deepEqual(r.settings.hooks.PreToolUse, VIEJO.hooks.PreToolUse);
});

test('mezclarSettings: un quitado escrito sin comillas o con \\ casa con la regla (sí); uno de otro comando, no (no)', () => {
  const n = copiar(NUEVO);
  n.permissions.deny.push('Read(.\\secretos\\**)');
  const sin = mezclar({
    nuevo: J(n),
    quitados: [
      { id: 'hook:PreToolUse/Bash|PowerShell/node $CLAUDE_PROJECT_DIR\\.claude\\hooks\\niega-aprobar.cjs', hasta: 'siempre' },
      { id: 'deny:Read(./secretos/**)', hasta: 'siempre' },
    ],
  });
  assert.deepEqual(sin.settings.hooks.PreToolUse, VIEJO.hooks.PreToolUse);
  assert.deepEqual(sin.settings.permissions.deny, ['Read(./.env)', 'Write(./.claude/cambios/**)']);
  const con = mezclar({ nuevo: J(n), quitados: [{ id: 'hook:PreToolUse/Bash|PowerShell/node $CLAUDE_PROJECT_DIR/.claude/hooks/otro.cjs' }] });
  assert.equal(con.settings.hooks.PreToolUse.length, 2);
  assert.ok(con.settings.permissions.deny.includes('Read(.\\secretos\\**)'));
});

test('mezclarSettings: la misma regla escrita con \\ en el proyecto no se duplica ni se retira de más', () => {
  const p = copiar(VIEJO);
  p.permissions.deny = ['Read(.\\.env)'];
  const r = mezclar({ proyecto: J(p) });
  assert.deepEqual(r.settings.permissions.deny, ['Read(.\\.env)', 'Write(./.claude/cambios/**)']);
});

test('mezclarSettings: la regla que el proyecto ya había borrado no vuelve', () => {
  const proy = copiar(VIEJO);
  proy.permissions.deny = [];
  proy.hooks.SessionStart = [];
  const r = mezclar({ proyecto: J(proy) });
  assert.deepEqual(r.settings.permissions.deny, ['Write(./.claude/cambios/**)']);
  assert.deepEqual(r.settings.hooks.SessionStart, []);
  assert.ok(r.informe.respetadas.includes('deny:Read(./.env)'));
  assert.ok(r.informe.respetadas.includes(H(`hook:SessionStart//${ARRANQUE}`)));
});

test('mezclarSettings: el allow propio del proyecto se respeta, en su lugar', () => {
  const proy = copiar(VIEJO);
  proy.permissions.allow.unshift('Bash(npm run build)');
  const r = mezclar({ proyecto: J(proy) });
  assert.deepEqual(r.settings.permissions.allow, ['Bash(npm run build)', 'Bash(node --test:*)', 'Bash(node .claude/scripts/cambios.cjs:*)']);
});

test('mezclarSettings: la lista vacía del proyecto gana (clave que no es regla)', () => {
  const v = { ...copiar(VIEJO), additionalDirs: ['../otro'], env: { A: '1' } };
  const n = { ...copiar(NUEVO), additionalDirs: ['../otro', '../mas'], env: { A: '2' } };
  const p = { ...copiar(VIEJO), additionalDirs: [], env: {} };
  const r = mezclar({ viejo: J(v), nuevo: J(n), proyecto: J(p) });
  assert.deepEqual(r.settings.additionalDirs, []);
  assert.deepEqual(r.settings.env, {});
  assert.ok(r.informe.respetadas.includes('clave:additionalDirs'));
});

test('mezclarSettings: tres puntas — la clave que el proyecto no tocó toma la del nuevo', () => {
  const v = { ...copiar(VIEJO), model: 'sonnet' };
  const n = { ...copiar(NUEVO), model: 'opus' };
  const r = mezclar({ viejo: J(v), nuevo: J(n), proyecto: J(v) });
  assert.equal(r.settings.model, 'opus');
  assert.ok(r.informe.actualizadas.includes('clave:model'));
});

test('mezclarSettings: tres puntas — la clave que el proyecto cambió gana aunque el molde la cambie', () => {
  const v = { ...copiar(VIEJO), model: 'sonnet' };
  const n = { ...copiar(NUEVO), model: 'opus' };
  const r = mezclar({ viejo: J(v), nuevo: J(n), proyecto: J({ ...copiar(VIEJO), model: 'haiku' }) });
  assert.equal(r.settings.model, 'haiku');
  assert.ok(r.informe.respetadas.includes('clave:model'));
});

test('mezclarSettings: tres puntas — la clave que el proyecto borró no vuelve; la nueva entra; la retirada sin tocar se va', () => {
  const v = { ...copiar(VIEJO), model: 'sonnet', vieja: 1 };
  const n = { ...copiar(NUEVO), model: 'sonnet', nueva: true };
  const r = mezclar({ viejo: J(v), nuevo: J(n), proyecto: J({ ...copiar(VIEJO), vieja: 1 }) });
  assert.equal('model' in r.settings, false);
  assert.equal(r.settings.nueva, true);
  assert.equal('vieja' in r.settings, false);
  assert.ok(r.informe.respetadas.includes('clave:model'));
  assert.ok(r.informe.sumadas.includes('clave:nueva'));
  assert.ok(r.informe.retiradas.includes('clave:vieja'));
});

test('mezclarSettings: tres puntas dentro de permissions (defaultMode)', () => {
  const v = copiar(VIEJO);
  v.permissions.defaultMode = 'default';
  const n = copiar(NUEVO);
  n.permissions.defaultMode = 'acceptEdits';
  const r1 = mezclar({ viejo: J(v), nuevo: J(n), proyecto: J(v) });
  assert.equal(r1.settings.permissions.defaultMode, 'acceptEdits');
  const p = copiar(v);
  p.permissions.defaultMode = 'plan';
  const r2 = mezclar({ viejo: J(v), nuevo: J(n), proyecto: J(p) });
  assert.equal(r2.settings.permissions.defaultMode, 'plan');
});

test('mezclarSettings: hook nuevo en un grupo que ya existe (mismo evento y matcher), con sus claves', () => {
  const n = copiar(VIEJO);
  n.hooks.PreToolUse[0].hooks.push(hook('node otro.cjs', { onFailure: 'block', timeout: 5 }));
  const r = mezclar({ nuevo: J(n) });
  assert.deepEqual(r.settings.hooks.PreToolUse, [{ matcher: 'Write', hooks: [hook(ESCRITURA), hook('node otro.cjs', { onFailure: 'block', timeout: 5 })] }]);
});

test('mezclarSettings: hook nuevo con un grupo del proyecto que tiene más hooks propios: entra al final del grupo', () => {
  const p = copiar(VIEJO);
  p.hooks.PreToolUse[0].hooks.push(hook('bash mio.sh'));
  const n = copiar(VIEJO);
  n.hooks.PreToolUse[0].hooks.push(hook('node otro.cjs'));
  const r = mezclar({ nuevo: J(n), proyecto: J(p) });
  assert.deepEqual(r.settings.hooks.PreToolUse[0].hooks.map((h) => h.command), [ESCRITURA, 'bash mio.sh', 'node otro.cjs']);
});

test('mezclarSettings: hook nuevo sin grupo: grupo nuevo con las claves del nuevo; evento nuevo también', () => {
  const n = copiar(NUEVO);
  n.hooks.Stop = [{ matcher: '', hooks: [hook('node fin.cjs')] }];
  const r = mezclar({ nuevo: J(n) });
  assert.deepEqual(r.settings.hooks.PreToolUse[1], { matcher: 'Bash|PowerShell', hooks: [hook(NIEGA, { onFailure: 'block' })] });
  assert.deepEqual(r.settings.hooks.Stop, [{ matcher: '', hooks: [hook('node fin.cjs')] }]);
  assert.deepEqual(Object.keys(r.settings.hooks), ['SessionStart', 'PreToolUse', 'Stop']);
});

test('mezclarSettings: el hook que el proyecto no tocó toma el cambio del molde (timeout, onFailure)', () => {
  const n = copiar(VIEJO);
  n.hooks.PreToolUse[0].hooks[0] = hook(ESCRITURA, { timeout: 30, onFailure: 'block' });
  const r = mezclar({ nuevo: J(n) });
  assert.deepEqual(r.settings.hooks.PreToolUse[0].hooks[0], hook(ESCRITURA, { timeout: 30, onFailure: 'block' }));
  assert.deepEqual(r.informe.actualizadas, [H(`hook:PreToolUse/Write/${ESCRITURA}`)]);
});

test('mezclarSettings: el hook que el proyecto retocó queda como lo dejó el proyecto', () => {
  const p = copiar(VIEJO);
  p.hooks.PreToolUse[0].hooks[0].timeout = 60;
  const n = copiar(VIEJO);
  n.hooks.PreToolUse[0].hooks[0].onFailure = 'block';
  const r = mezclar({ nuevo: J(n), proyecto: J(p) });
  assert.deepEqual(r.settings.hooks.PreToolUse[0].hooks[0], hook(ESCRITURA, { timeout: 60 }));
});

test('mezclarSettings: el hook que el molde retiró se va; su grupo y su evento, si quedan vacíos, también', () => {
  const n = copiar(NUEVO);
  delete n.hooks.SessionStart;
  const r = mezclar({ nuevo: J(n) });
  assert.equal('SessionStart' in r.settings.hooks, false);
  assert.ok(r.informe.retiradas.includes(H(`hook:SessionStart//${ARRANQUE}`)));
});

test('mezclarSettings: el hook retirado que el proyecto retocó queda (y se informa)', () => {
  const p = copiar(VIEJO);
  p.hooks.SessionStart[0].hooks[0].timeout = 99;
  const n = copiar(NUEVO);
  delete n.hooks.SessionStart;
  const r = mezclar({ nuevo: J(n), proyecto: J(p) });
  assert.equal(r.settings.hooks.SessionStart[0].hooks[0].timeout, 99);
  assert.ok(r.informe.respetadas.includes(H(`hook:SessionStart//${ARRANQUE}`)));
});

test('mezclarSettings: un grupo que el proyecto ya tenía vacío queda; uno con hooks propios queda aunque se retire lo del molde', () => {
  const p = copiar(VIEJO);
  p.hooks.Stop = [];
  p.hooks.SessionStart[0].hooks.push(hook('bash mio.sh'));
  const n = copiar(NUEVO);
  delete n.hooks.SessionStart;
  const r = mezclar({ nuevo: J(n), proyecto: J(p) });
  assert.deepEqual(r.settings.hooks.Stop, []);
  assert.deepEqual(r.settings.hooks.SessionStart, [{ matcher: '', hooks: [hook('bash mio.sh')] }]);
});

test('mezclarSettings: un grupo del proyecto con hooks: [] queda (no lo vació la mezcla)', () => {
  const p = copiar(VIEJO);
  p.hooks.PreToolUse.push({ matcher: 'Edit', hooks: [] });
  const r = mezclar({ proyecto: J(p) });
  assert.deepEqual(r.settings.hooks.PreToolUse.map((g) => g.matcher), ['Write', 'Edit', 'Bash|PowerShell']);
});

test('mezclarSettings: el proyecto sin permissions ni hooks (los borró), con un molde que no suma nada → no aparecen', () => {
  const r = mezclar({ nuevo: J(VIEJO), proyecto: J({ model: 'opus' }) });
  assert.deepEqual(r.settings, { model: 'opus' });
  assert.equal(r.texto, '{\n  "model": "opus"\n}\n');
});

test('mezclarSettings: un hook igual al del viejo con las claves en otro orden cuenta como no tocado', () => {
  const p = copiar(VIEJO);
  p.hooks.SessionStart[0].hooks[0] = { timeout: 20, command: ARRANQUE, type: 'command' };
  const n = copiar(NUEVO);
  delete n.hooks.SessionStart;
  const r = mezclar({ nuevo: J(n), proyecto: J(p) });
  assert.equal('SessionStart' in r.settings.hooks, false);
});

test('mezclarSettings: quitados también acepta el id suelto, como texto', () => {
  const r = mezclar({ quitados: ['deny:Write(./.claude/cambios/**)'] });
  assert.deepEqual(r.settings.permissions.deny, ['Read(./.env)']);
});

test('mezclarSettings: orden de las claves: las del nuevo y después las propias (el $schema que el proyecto borró no vuelve)', () => {
  const n = { $schema: 'x', ...copiar(NUEVO) };
  const p = { propia: 1, ...copiar(VIEJO) };
  const r = mezclar({ nuevo: J(n), proyecto: J(p), viejo: J({ $schema: 'x', ...copiar(VIEJO) }) });
  assert.deepEqual(Object.keys(r.settings), ['permissions', 'hooks', 'propia']);
});

test('mezclarSettings: orden de las claves, con todas presentes', () => {
  const v = { $schema: 'x', ...copiar(VIEJO) };
  const n = { $schema: 'x', ...copiar(NUEVO) };
  const p = { propia: 1, hooks: copiar(VIEJO.hooks), permissions: copiar(VIEJO.permissions), $schema: 'x' };
  const r = mezclar({ viejo: J(v), nuevo: J(n), proyecto: J(p) });
  assert.deepEqual(Object.keys(r.settings), ['$schema', 'permissions', 'hooks', 'propia']);
  assert.deepEqual(Object.keys(r.settings.permissions), ['allow', 'ask', 'deny']);
});

test('mezclarSettings: clave duplicada a dos niveles en el proyecto → no se toca', () => {
  const t = '{\n  "permissions": {\n    "allow": ["a"],\n    "allow": []\n  }\n}';
  const r = mezclarSettings({ viejo: J(VIEJO), nuevo: J(NUEVO), proyecto: t, quitados: [] });
  assert.equal(r.ok, false);
  assert.equal(r.settings, undefined);
  assert.match(r.problema, /^el proyecto: clave "allow" repetida en permissions/);
});

test('mezclarSettings: clave duplicada en el molde viejo o el nuevo → no se toca', () => {
  const dup = '{"hooks": {}, "hooks": {}}';
  assert.match(mezclarSettings({ viejo: dup, nuevo: J(NUEVO), proyecto: J(VIEJO) }).problema, /^el molde viejo: clave "hooks" repetida/);
  assert.match(mezclarSettings({ viejo: J(VIEJO), nuevo: dup, proyecto: J(VIEJO) }).problema, /^el molde nuevo: clave "hooks" repetida/);
});

test('mezclarSettings: JSON inválido → no se toca', () => {
  const r = mezclarSettings({ viejo: J(VIEJO), nuevo: J(NUEVO), proyecto: '{"permissions": {', quitados: [] });
  assert.equal(r.ok, false);
  assert.match(r.problema, /^el proyecto: el JSON no abre/);
});

test('mezclarSettings: sin molde nuevo, o con formas raras → no se toca', () => {
  assert.match(mezclarSettings({ viejo: null, nuevo: null, proyecto: null }).problema, /el molde nuevo: no llegó un texto/);
  assert.match(mezclarSettings({ nuevo: J(NUEVO), proyecto: '[]' }).problema, /el proyecto: no es un objeto/);
  assert.match(mezclarSettings({ nuevo: J(NUEVO), proyecto: '{"permissions": {"allow": "x"}}' }).problema, /permissions\.allow" no es una lista/);
  assert.match(mezclarSettings({ nuevo: J(NUEVO), proyecto: '{"permissions": []}' }).problema, /"permissions" no es un objeto/);
  assert.match(mezclarSettings({ nuevo: J(NUEVO), proyecto: '{"hooks": []}' }).problema, /"hooks" no es un objeto/);
  assert.match(mezclarSettings({ nuevo: J(NUEVO), proyecto: '{"hooks": {"Stop": {}}}' }).problema, /"hooks\.Stop" no es una lista/);
  assert.match(mezclarSettings({ nuevo: J(NUEVO), proyecto: '{"hooks": {"Stop": [{"matcher": ""}]}}' }).problema, /un grupo de "hooks\.Stop"/);
});

test('mezclarSettings: determinista — dos corridas dan el mismo texto, y mezclar lo mezclado no cambia nada', () => {
  const p = copiar(VIEJO);
  p.permissions.allow.push('Bash(npm run build)');
  p.model = 'opus';
  const o = { proyecto: J(p), quitados: [{ id: 'deny:Write(./.claude/cambios/**)' }] };
  const a = mezclar(o);
  const b = mezclar(o);
  assert.equal(a.texto, b.texto);
  assert.ok(a.texto.endsWith('}\n') && !a.texto.includes('\r'));
  assert.ok(a.texto.startsWith('{\n  "'));
  const c = mezclar({ viejo: J(NUEVO), nuevo: J(NUEVO), proyecto: a.texto, quitados: o.quitados });
  assert.equal(c.texto, a.texto);
  assert.deepEqual(c.informe, { sumadas: [], retiradas: [], respetadas: ['deny:Write(./.claude/cambios/**)'], actualizadas: [] });
});

test('mezclarSettings: una clave "__proto__" es un dato, no cambia el prototipo', () => {
  const r = mezclar({ proyecto: '{"__proto__": {"x": 1}, "permissions": {}}' });
  assert.equal(Object.getPrototypeOf(r.settings), Object.prototype);
  assert.equal(r.settings.x, undefined);
  assert.ok(r.texto.includes('"__proto__"'));
});

// ---------------------------------------------------------------- desviosSettings y textoSettings

test('desviosSettings: lo del molde que falta en el proyecto, salvo lo quitado', () => {
  const p = copiar(NUEVO);
  p.permissions.deny = ['Read(./.env)'];
  p.hooks.PreToolUse.pop();
  const d = desviosSettings({ molde: NUEVO, proyecto: p, quitados: [{ id: 'deny:Write(./.claude/cambios/**)', hasta: '2020-01-01' }] });
  assert.deepEqual(d.map((r) => r.id), [H(`hook:PreToolUse/Bash|PowerShell/${NIEGA}`)]);
});

test('desviosSettings: sin desvíos da lista vacía; lo propio del proyecto no es desvío; acepta textos', () => {
  const p = copiar(NUEVO);
  p.permissions.allow.push('Bash(npm run build)');
  assert.deepEqual(desviosSettings({ molde: J(NUEVO), proyecto: J(p), quitados: [] }), []);
});

test('desviosSettings: un hook retocado (otro timeout) no es desvío; uno movido de matcher sí', () => {
  const p = copiar(NUEVO);
  p.hooks.PreToolUse[0].hooks[0].timeout = 60;
  p.hooks.PreToolUse[1].matcher = 'Bash';
  assert.deepEqual(desviosSettings({ molde: NUEVO, proyecto: p }).map((r) => r.id), [H(`hook:PreToolUse/Bash|PowerShell/${NIEGA}`)]);
});

test('desviosSettings: el quitado se compara normalizado (con comillas y \\ también casa)', () => {
  const p = copiar(NUEVO);
  p.hooks.PreToolUse.pop();
  const quitados = [{ id: 'hook:PreToolUse/Bash|PowerShell/node "$CLAUDE_PROJECT_DIR\\.claude\\hooks\\niega-aprobar.cjs"' }];
  assert.deepEqual(desviosSettings({ molde: NUEVO, proyecto: p, quitados }), []);
  assert.equal(desviosSettings({ molde: NUEVO, proyecto: p, quitados: [{ id: 'hook:PreToolUse/Bash/otro' }] }).length, 1);
});

test('desviosSettings: un molde con la misma regla dos veces la da una sola vez', () => {
  const m = { permissions: { allow: ['Bash(ls:*)', 'Bash(ls:*)'] } };
  assert.deepEqual(desviosSettings({ molde: m, proyecto: {} }).map((r) => r.id), ['allow:Bash(ls:*)']);
});

test('desviosSettings: un texto que no abre tira con el problema', () => {
  assert.throws(() => desviosSettings({ molde: NUEVO, proyecto: '{"a":1,"a":2}' }), /el proyecto: clave "a" repetida/);
});

test('textoSettings: dos espacios, LF, salto final; el hash de piezas.settings sale de ahí', () => {
  assert.equal(textoSettings({ a: [1], b: { c: 'x' } }), '{\n  "a": [\n    1\n  ],\n  "b": {\n    "c": "x"\n  }\n}\n');
  assert.equal(hashPieza(textoSettings(NUEVO)), hash(`${JSON.stringify(NUEVO, null, 2)}\n`));
});

test('el settings.json del molde de hoy abre sin duplicados y su hash es estable', () => {
  const fs = require('fs');
  const t = fs.readFileSync(path.join(__dirname, '..', '..', 'settings.json'), 'utf8');
  const r = leerJsonSinDuplicados(t);
  assert.equal(r.ok, true, r.problema);
  assert.match(hashPieza(textoSettings(r.valor)), /^[0-9a-f]{12}$/);
  assert.equal(mezclarSettings({ viejo: null, nuevo: t, proyecto: null }).texto, textoSettings(r.valor));
});

function copiar(v) {
  return JSON.parse(JSON.stringify(v));
}
