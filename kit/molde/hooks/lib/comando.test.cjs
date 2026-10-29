'use strict';
// Pruebas de comando.cjs (SPEC-paquete-3, «Base · lib/comando.cjs»): el recorrido que parte un comando de Bash o de PowerShell
// en comandos simples. Tres partes: (1) la tabla propia, construcción por construcción, con el argv exacto que tiene que salir;
// (2) las tablas de Hermes (tests/test_hook_git_destructivo.py y tests/test_hook_python_stdin.py) corridas de punta a punta
// con dos "consumidores de referencia" escritos acá (el de python-stdin y el de git destructivo, portados de Hermes): prueban
// que el argv que sale alcanza para decidir lo mismo que decidía Hermes; (3) los incompletos, las redirecciones, los helpers y el
// rendimiento. Corren con: node --test "kit/**/*.test.cjs". Sin repos ni archivos: todo es texto.
const test = require('node:test');
const assert = require('node:assert/strict');
const { partir, programa, igual, variablesAsignadas, MAX_PROFUNDIDAD } = require('./comando.cjs');

// ---------------------------------------------------------------- ayudantes

const argvs = (texto, ps = false) => partir(texto, { ps }).comandos.map((c) => c.argv);
const B = (texto, esperado) => test(`bash: ${JSON.stringify(texto).slice(0, 70)}`, () => assert.deepEqual(argvs(texto), esperado));
const P = (texto, esperado) => test(`ps: ${JSON.stringify(texto).slice(0, 70)}`, () => assert.deepEqual(argvs(texto, true), esperado));

// ---------------------------------------------------------------- 1. la tabla propia

// palabras, comillas y escapes
B('', []);
B('   \n  ', []);
B('ls', [['ls']]);
B('ls -la /tmp', [['ls', '-la', '/tmp']]);
B('git commit -m "git stash"', [['git', 'commit', '-m', 'git stash']]);
B("echo 'a b' \"c d\"", [['echo', 'a b', 'c d']]);
B("echo a\"b\"'c'd", [['echo', 'abcd']]);
B('echo ""', [['echo', '']]);
B("echo ''", [['echo', '']]);
B('echo "a\\"b"', [['echo', 'a"b']]);
B('echo "a\\nb"', [['echo', 'a\\nb']]); // en comillas dobles la \ solo escapa " \ $ `
B("echo 'a\\nb'", [['echo', 'a\\nb']]);
B('echo a\\ b', [['echo', 'a b']]);
B('echo \\"x', [['echo', '"x']]);
B('echo C:\\Users\\x', [['echo', 'C:\\Users\\x']]); // una ruta de Windows no pierde las barras
B('echo "a\\\nb"', [['echo', 'ab']]); // \ + salto dentro de comillas dobles: continuación
B('git \\\n  stash', [['git', 'stash']]);
B('echo "$HOME/x" $USER', [['echo', '$HOME/x', '$USER']]);
B('echo ${HOME}/x', [['echo', '${HOME}/x']]);
B("git $'stash'", [['git', 'stash']]);
B("git $'sta\\x73h'", [['git', 'stash']]); // $'…' se decodifica
B("echo $'a\\tb' $'it\\'s'", [['echo', 'a\tb', "it's"]]);
B('echo $"hola"', [['echo', 'hola']]);
B('"git" "stash"', [['git', 'stash']]);
B('"C:/Program Files/Git/cmd/git.exe" reset --hard', [['C:/Program Files/Git/cmd/git.exe', 'reset', '--hard']]);

// operadores
B('a; b', [['a'], ['b']]);
B('a && b', [['a'], ['b']]);
B('a || b', [['a'], ['b']]);
B('a | b', [['a'], ['b']]);
B('a |& b', [['a'], ['b']]);
B('a & b', [['a'], ['b']]);
B('a &', [['a']]);
B('a\nb\n\nc', [['a'], ['b'], ['c']]);
B('a && b || c; d | e', [['a'], ['b'], ['c'], ['d'], ['e']]);
B('git commit -m "x;y&&z|w||v&u"', [['git', 'commit', '-m', 'x;y&&z|w||v&u']]);
B("echo 'a; b' | cat", [['echo', 'a; b'], ['cat']]);
B('echo a\\;b', [['echo', 'a;b']]);
B('case $x in a) git stash ;; esac', [['case', '$x', 'in', 'a'], ['git', 'stash'], ['esac']]);

// subshells, llaves, sustituciones
B('(git stash)', [['git', 'stash']]);
B('(a; b) && c', [['a'], ['b'], ['c']]);
B('( ( a ) )', [['a']]);
B('{ a; b; }', [['a'], ['b']]);
B('echo $(git stash)', [['echo', '$()'], ['git', 'stash']]);
B('echo $(a; b)', [['echo', '$()'], ['a'], ['b']]);
B('echo $(a $(b))', [['echo', '$()'], ['a', '$()'], ['b']]);
B('echo "x $(a) y"', [['echo', 'x $() y'], ['a']]);
B("echo '$(a)'", [['echo', '$(a)']]);
B('echo \\$HOME', [['echo', '$HOME']]);
B('echo `git stash`', [['echo', '$()'], ['git', 'stash']]);
B('echo "x `a` y"', [['echo', 'x $() y'], ['a']]);
B('echo \\`a\\`', [['echo', '`a`']]);
B('diff <(a) <(b)', [['diff', '$()', '$()'], ['a'], ['b']]);
B('x=$(a)', [[], ['a']]); // la asignación sola no invoca nada
B('echo "${X:-$(git stash)}"', [['echo', '${X:-$(git stash)}'], ['git', 'stash']]);
B('echo ${X:-$(git stash)}', [['echo', '${X:-$(git stash)}'], ['git', 'stash']]);
B('echo "$(echo ")")"', [['echo', '$()'], ['echo', ')']]); // el ) entre comillas no cierra el $( )
B("echo $(echo ')')", [['echo', '$()'], ['echo', ')']]);
B('arr=(a b)', [[]]);
B('arr=($(git stash))', [[], ['git', 'stash']]);
B('echo $((1+2))', [['echo', '$()'], ['1+2']]);

// heredocs
B("cat <<'EOF'\nx y; git stash\nEOF\nls", [['cat'], ['ls']]);
B('cat <<"EOF"\n$(git stash)\nEOF', [['cat']]);
B('cat <<\\EOF\n$(git stash)\nEOF', [['cat']]);
B('cat <<E\\OF\n$(git stash)\nEOF', [['cat']]);
B('cat <<< \\EOF', [['cat']]);
B('cat <<EOF\nx\nEOF', [['cat']]);
B('cat <<EOF\n$(git stash)\nEOF\nls', [['cat'], ['git', 'stash'], ['ls']]); // sin comillar, Bash expande: ese $( ) corre
B('cat <<EOF\n`git stash`\nEOF', [['cat'], ['git', 'stash']]);
B('cat <<EOF\n\\$(git stash)\nEOF', [['cat']]); // escapado: no corre
B('cat <<-EOF\n\tx\n\tEOF\nls', [['cat'], ['ls']]);
B('cat <<A <<B\n1\nA\n2\nB\nls', [['cat'], ['ls']]);
B("cat <<'EOF' | grep x\nbody\nEOF", [['cat'], ['grep', 'x']]);
B("git commit -m \"$(cat <<'EOF'\nmsg a) b\nEOF\n)\"", [['git', 'commit', '-m', '$()'], ['cat']]);
B('cat <<EOF\nresto sin cerrar', [['cat']]);
B("git commit -F - <<'EOF'\nfix: git stash\nEOF", [['git', 'commit', '-F', '-']]);
B('cat <<< "git stash"', [['cat']]);
B('echo a <<EOF; git stash\nbody\nEOF', [['echo', 'a'], ['git', 'stash']]);

// comentarios
B('# git stash\nls', [['ls']]);
B('ls # git stash', [['ls']]);
B('ls;# c\nls', [['ls'], ['ls']]);
B('echo a#b', [['echo', 'a#b']]);
B('echo "#x" \'#y\' \\#z', [['echo', '#x', '#y', '#z']]);
B('echo $#', [['echo', '$#']]);

// prefijos que no son el programa
B('X=1 git stash', [['git', 'stash']]);
B('X=1 Y=2 git stash', [['git', 'stash']]);
B('X+=1 git stash', [['git', 'stash']]);
B('env git stash', [['git', 'stash']]);
B('env -i X=1 git stash', [['git', 'stash']]);
B('env -u X -C /tmp git stash', [['git', 'stash']]);
B("env -S 'git stash'", [['git', 'stash'], ['env', '-S', 'git stash']]);
B('env', [['env']]);
B('env -i', [['env', '-i']]);
B('env X=1', [['env', 'X=1']]);
B('time git stash', [['git', 'stash']]);
B('time', [['time']]);
B('nohup git stash &', [['git', 'stash']]);
B('sudo git stash', [['git', 'stash']]);
B('sudo -u root git stash', [['git', 'stash']]);
B('sudo -E -- git stash', [['git', 'stash']]);
B('sudo', [['sudo']]);
B('command git stash', [['git', 'stash']]);
B('command -p git stash', [['git', 'stash']]);
B('command -v git', [['command', '-v', 'git']]);
B('exec git stash', [['git', 'stash']]);
B('exec > log', [['exec']]); // exec solo con redirección: el prefijo es el comando
B('nice -n 10 git stash', [['git', 'stash']]);
B('nice -10 git stash', [['git', 'stash']]);
B('timeout 30 git stash', [['git', 'stash']]);
B('timeout -s KILL 5 git stash', [['git', 'stash']]);
B('sudo env X=1 time nohup git stash', [['git', 'stash']]);
B('winpty setsid unbuffer git stash', [['git', 'stash']]);
B('doas -u x git stash', [['git', 'stash']]);
B('stdbuf -o L git stash', [['git', 'stash']]);
B('chrt 10 git stash', [['git', 'stash']]);
B('builtin call git stash', [['git', 'stash']]);
B('if true; then git stash; fi', [['true'], ['git', 'stash']]);
B('if ! git stash; then echo no; else echo si; fi', [['git', 'stash'], ['echo', 'no'], ['echo', 'si']]);
B('for f in a b; do git stash; done', [['for', 'f', 'in', 'a', 'b'], ['git', 'stash']]);
B('while true; do git stash; done', [['true'], ['git', 'stash']]);
B('until false; do git stash; done', [['false'], ['git', 'stash']]);
B('if a; then b; elif c; then d; fi', [['a'], ['b'], ['c'], ['d']]);
B('! git stash', [['git', 'stash']]);
B('function f { git stash; }', [['git', 'stash']]);
B('xargs git stash', [['xargs', 'git', 'stash']]); // xargs es el programa: no es transparente
B('/usr/bin/git.exe stash', [['/usr/bin/git.exe', 'stash']]); // argv[0] va crudo; programa() lo limpia
B('gitx stash', [['gitx', 'stash']]);

// lo de adentro de -c, /c, -Command, eval, iex
B('bash -c "git stash"', [['bash', '-c', 'git stash'], ['git', 'stash']]);
B("sh -c 'git stash; echo \"a b\"'", [['sh', '-c', 'git stash; echo "a b"'], ['git', 'stash'], ['echo', 'a b']]);
B('bash -lc "git stash"', [['bash', '-lc', 'git stash'], ['git', 'stash']]);
B('zsh -c "git stash"', [['zsh', '-c', 'git stash'], ['git', 'stash']]);
B('dash -c "git stash"', [['dash', '-c', 'git stash'], ['git', 'stash']]);
B('ksh -c "git stash"', [['ksh', '-c', 'git stash'], ['git', 'stash']]);
B('ash -c "git stash"', [['ash', '-c', 'git stash'], ['git', 'stash']]);
B('env X=1 bash -c "git stash"', [['bash', '-c', 'git stash'], ['git', 'stash']]);
B('bash -c', [['bash', '-c']]);
B('bash script.sh -c "git stash"', [['bash', 'script.sh', '-c', 'git stash']]); // lo de después del script es suyo
B('bash -O extglob -c "git stash"', [['bash', '-O', 'extglob', '-c', 'git stash'], ['git', 'stash']]);
B('bash -o pipefail -c "git stash"', [['bash', '-o', 'pipefail', '-c', 'git stash'], ['git', 'stash']]);
B('bash --norc -c "git stash"', [['bash', '--norc', '-c', 'git stash'], ['git', 'stash']]);
B("bash -c \"sh -c 'git stash'\"", [['bash', '-c', "sh -c 'git stash'"], ['sh', '-c', 'git stash'], ['git', 'stash']]);
B('cmd /c "git stash"', [['cmd', '/c', 'git stash'], ['git', 'stash']]);
B('cmd //c "git stash"', [['cmd', '//c', 'git stash'], ['git', 'stash']]);
B('cmd.exe /C "git stash"', [['cmd.exe', '/C', 'git stash'], ['git', 'stash']]);
B('cmd /k "git stash"', [['cmd', '/k', 'git stash'], ['git', 'stash']]);
B('cmd /c git commit -m "x y"', [['cmd', '/c', 'git', 'commit', '-m', 'x y'], ['git', 'commit', '-m', 'x y']]);
B('cmd /c "echo it\'s & git stash"', [['cmd', '/c', "echo it's & git stash"], ['echo', "it's"], ['git', 'stash']]);
B('cmd /c "echo a; git stash"', [['cmd', '/c', 'echo a; git stash'], ['echo', 'a;', 'git', 'stash']]); // en cmd el ; no separa
B('cmd /c "venv\\Scripts\\python.exe" -', [['cmd', '/c', 'venv\\Scripts\\python.exe', '-'], ['venv\\Scripts\\python.exe', '-']]);
B('cmd /c "echo ^& git stash"', [['cmd', '/c', 'echo ^& git stash'], ['echo', '&', 'git', 'stash']]);
B('cmd /c "echo a | git stash"', [['cmd', '/c', 'echo a | git stash'], ['echo', 'a'], ['git', 'stash']]);
B('cmd /c "(git stash)"', [['cmd', '/c', '(git stash)'], ['git', 'stash']]);
B('powershell -Command "git stash"', [['powershell', '-Command', 'git stash'], ['git', 'stash']]);
B('powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "git stash"', [['powershell.exe', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', 'git stash'], ['git', 'stash']]);
B('pwsh -c "git stash"', [['pwsh', '-c', 'git stash'], ['git', 'stash']]);
B('pwsh -Comm "git stash"', [['pwsh', '-Comm', 'git stash'], ['git', 'stash']]);
B('powershell -c git stash', [['powershell', '-c', 'git', 'stash'], ['git', 'stash']]);
B('powershell -File x.ps1', [['powershell', '-File', 'x.ps1']]);
B('powershell -Command', [['powershell', '-Command']]);
B('powershell -Command "Get-Content x | Select-String \'git stash\'"', [
  ['powershell', '-Command', "Get-Content x | Select-String 'git stash'"],
  ['Get-Content', 'x'],
  ['Select-String', 'git stash'],
]); // lo de adentro se parte como PowerShell
B('eval "git stash"', [['eval', 'git stash'], ['git', 'stash']]);
B('eval git stash', [['eval', 'git', 'stash'], ['git', 'stash']]);
B('eval echo "a; git stash"', [['eval', 'echo', 'a; git stash'], ['echo', 'a'], ['git', 'stash']]); // eval junta con espacio y re-parte
B('eval', [['eval']]);
B('echo $(bash -c "git stash")', [['echo', '$()'], ['bash', '-c', 'git stash'], ['git', 'stash']]);
B('echo "bash -c git stash"', [['echo', 'bash -c git stash']]);
B('echo bash -c "git stash"', [['echo', 'bash', '-c', 'git stash']]);

// redirecciones (se miran aparte; acá el argv no las lleva)
B('echo a > f', [['echo', 'a']]);
B('echo a>f', [['echo', 'a']]);
B('echo >f a', [['echo', 'a']]);
B('echo 2 > f', [['echo', '2']]); // el 2 suelto es un argumento
B('cat < a > b 2>> c', [['cat']]);
B('> f', [[]]);
B('X=1 > f', [[]]);
B('git status 2>&1 | tee out', [['git', 'status'], ['tee', 'out']]);

// PowerShell
P("Write-Output 'git stash'", [['Write-Output', 'git stash']]);
P('Write-Host "git reset --hard"', [['Write-Host', 'git reset --hard']]);
P('git status', [['git', 'status']]);
P('a; b', [['a'], ['b']]);
P('a && b || c', [['a'], ['b'], ['c']]);
P('a | b', [['a'], ['b']]);
P('a\nb', [['a'], ['b']]);
P("& 'C:\\Program Files\\Git\\cmd\\git.exe' reset --hard", [['C:\\Program Files\\Git\\cmd\\git.exe', 'reset', '--hard']]);
P('& git stash', [['git', 'stash']]);
P('a; & git stash', [['a'], ['git', 'stash']]);
P('. ./x.ps1', [['./x.ps1']]);
P("echo 'it''s'", [['echo', "it's"]]);
P('echo "a""b"', [['echo', 'a"b']]);
P('echo "a`"b"', [['echo', 'a"b']]);
P('echo "a`nb"', [['echo', 'a\nb']]);
P('echo a`;b', [['echo', 'a;b']]);
P('echo C:\\Users\\x', [['echo', 'C:\\Users\\x']]);
P('git `\n  stash', [['git', 'stash']]);
P("echo 'a\\b' \"c\\d\"", [['echo', 'a\\b', 'c\\d']]); // en PowerShell la \ no escapa
P('echo "x $(git stash) y"', [['echo', 'x $() y'], ['git', 'stash']]);
P('echo $(git stash)', [['echo', '$()'], ['git', 'stash']]);
P('echo "$env:USERPROFILE ${env:X}"', [['echo', '$env:USERPROFILE ${env:X}']]);
P('$x = git stash', [['git', 'stash']]);
P('$x=git stash', [['git', 'stash']]);
P('$x += (git stash)', [[], ['git', 'stash']]);
P('$env:X = "1"; git stash', [[], ['git', 'stash']]);
P('if ($true) { git stash }', [['$true'], ['git', 'stash']]);
P('foreach ($f in $l) { git $f }', [['foreach'], ['$f', 'in', '$l'], ['git', '$f']]);
P('ForEach-Object { git stash }', [['ForEach-Object'], ['git', 'stash']]);
P("git commit -m @'\nfix: git stash\n'@", [['git', 'commit', '-m', 'fix: git stash']]);
P("@'\nnunca git stash\n'@ | Set-Content notas.txt", [['nunca git stash'], ['Set-Content', 'notas.txt']]);
P('@"\nhola $(git stash)\n"@ | Set-Content x', [['hola $(git stash)'], ['git', 'stash'], ['Set-Content', 'x']]);
P("@'\nhola $(git stash)\n'@ | Set-Content x", [['hola $(git stash)'], ['Set-Content', 'x']]);
P('# git stash\nls', [['ls']]);
P('ls # git stash', [['ls']]);
P('<# git stash #> ls', [['ls']]);
P('echo a#b', [['echo', 'a#b']]);
P('GIT STASH', [['GIT', 'STASH']]);
P('cmd /c "git stash"', [['cmd', '/c', 'git stash'], ['git', 'stash']]);
P('bash -c "git stash"', [['bash', '-c', 'git stash'], ['git', 'stash']]);
P('powershell -Command "git stash"', [['powershell', '-Command', 'git stash'], ['git', 'stash']]);
P("iex 'git stash'", [['iex', 'git stash'], ['git', 'stash']]);
P('Invoke-Expression "git stash"', [['Invoke-Expression', 'git stash'], ['git', 'stash']]);
P("IEX 'git stash'", [['IEX', 'git stash'], ['git', 'stash']]);
P('eval "git stash"', [['eval', 'git stash'], ['git', 'stash']]);
P("Get-Content x | Select-String 'git clean -fd'", [['Get-Content', 'x'], ['Select-String', 'git clean -fd']]);
P('Get-ChildItem Env:', [['Get-ChildItem', 'Env:']]);
P('x > out.txt 2>&1', [['x']]);
P('git commit -m "a; git stash"', [['git', 'commit', '-m', 'a; git stash']]);
P('timeout 5 git stash', [['git', 'stash']]);
P('1 -lt 2', [['1', '-lt', '2']]);

test('bash: "if" y "IF" no son lo mismo; en PowerShell sí', () => {
  assert.deepEqual(argvs('IF git stash'), [['IF', 'git', 'stash']]);
  assert.deepEqual(argvs('IF ($x) { git stash }', true), [['$x'], ['git', 'stash']]);
});
test('iex no es especial en Bash', () => {
  assert.deepEqual(argvs("iex 'git stash'"), [['iex', 'git stash']]);
});

// más construcciones de borde (salieron de la prueba de mutación)
B('a\tb\tc', [['a', 'b', 'c']]); // el tab separa palabras
B('echo ${X:-${Y}} $(git stash)', [['echo', '${X:-${Y}}', '$()'], ['git', 'stash']]); // llaves anidadas
B('echo ${X:-$(echo })} $(git stash)', [['echo', '${X:-$(echo })}', '$()'], ['echo', '}'], ['git', 'stash']]); // un } adentro de un $( )
B('echo ${X\\}Y} z', [['echo', '${X\\}Y}', 'z']]); // un } escapado no cierra
B("git $'\\u0073tash'", [['git', 'stash']]);
B("git $'\\U00000073tash'", [['git', 'stash']]);
B("git $'\\163tash'", [['git', 'stash']]);
B("echo $'a\\qb' $'\\e' $'\\x41' $'\\x4g'", [['echo', 'a\\qb', '\x1b', 'A', '\x04g']]);
B("echo $'a\\nb\\rc\\\\d\\\"e\\?f\\ag\\bh\\fi\\vj'", [['echo', 'a\nb\rc\\d"e?f\x07g\bh\fi\vj']]);
B("echo $'a'$'b' $'unclosed", [['echo', 'ab', 'unclosed']]);
B("echo $('x)' ) $'a)' $(a)", [['echo', '$()', 'a)', '$()'], ['x)'], ['a']]); // un ) entre comillas simples o en $'…' no cierra
B('echo $(echo $\'a)\') $(b)', [['echo', '$()', '$()'], ['echo', 'a)'], ['b']]);
B('echo $(echo `echo )`) $(b)', [['echo', '$()', '$()'], ['echo', '$()'], ['echo'], ['b']]); // el ) de adentro de la comilla invertida no cierra el $( )
B('echo "$(echo `echo )`)" $(b)', [['echo', '$()', '$()'], ['echo', '$()'], ['echo'], ['b']]);
B('echo $(echo "a\\")" ) $(b)', [['echo', '$()', '$()'], ['echo', 'a")'], ['b']]);
B('echo $(echo a\\)b) $(c)', [['echo', '$()', '$()'], ['echo', 'a)b'], ['c']]);
B('echo $(echo a # ) b\n) $(c)', [['echo', '$()', '$()'], ['echo', 'a'], ['c']]); // un ) en un comentario no cierra
B("echo $(cat <<'E'\n)\nE\n) $(b)", [['echo', '$()', '$()'], ['cat'], ['b']]); // el ) del cuerpo de un heredoc no cierra
B("echo $(cat <<-'E'\n\t)\n\tE\n) $(b)", [['echo', '$()', '$()'], ['cat'], ['b']]);
B('echo $(cat < <(b) <<<x) $(c)', [['echo', '$()', '$()'], ['cat'], ['b'], ['c']]);
B('cmd /r "git stash"', [['cmd', '/r', 'git stash'], ['git', 'stash']]);
B('cmd //k "git stash"', [['cmd', '//k', 'git stash'], ['git', 'stash']]);
B('cmd //r "git stash"', [['cmd', '//r', 'git stash'], ['git', 'stash']]);
B('cmd /d /s /c "git stash"', [['cmd', '/d', '/s', '/c', 'git stash'], ['git', 'stash']]);
B('cmd /c', [['cmd', '/c']]);
B('cmd /x "git stash"', [['cmd', '/x', 'git stash']]);
B('powershell -commandwithargs "git stash"', [['powershell', '-commandwithargs', 'git stash'], ['git', 'stash']]);
B('pwsh /c "git stash"', [['pwsh', '/c', 'git stash'], ['git', 'stash']]);
B('pwsh -Co "git stash"', [['pwsh', '-Co', 'git stash'], ['git', 'stash']]);
B('pwsh -Comma "git stash"', [['pwsh', '-Comma', 'git stash'], ['git', 'stash']]);
B('pwsh -Comman "git stash"', [['pwsh', '-Comman', 'git stash'], ['git', 'stash']]);
B('pwsh -Com "git stash"', [['pwsh', '-Com', 'git stash'], ['git', 'stash']]);
B('pwsh -NoProfile "git stash"', [['pwsh', '-NoProfile', 'git stash']]); // sin -Command no es un comando
B('pwsh -x "git stash"', [['pwsh', '-x', 'git stash']]);
B('bash +O extglob -c "git stash"', [['bash', '+O', 'extglob', '-c', 'git stash'], ['git', 'stash']]);
B('bash +o pipefail -c "git stash"', [['bash', '+o', 'pipefail', '-c', 'git stash'], ['git', 'stash']]);
B('bash --init-file x -c "git stash"', [['bash', '--init-file', 'x', '-c', 'git stash'], ['git', 'stash']]);
B('bash --rcfile x -c "git stash"', [['bash', '--rcfile', 'x', '-c', 'git stash'], ['git', 'stash']]);
B('bash --version', [['bash', '--version']]);
B('bash +x -c "git stash"', [['bash', '+x', '-c', 'git stash'], ['git', 'stash']]);
B("env -S 'git stash' extra", [['git', 'stash', 'extra'], ['env', '-S', 'git stash', 'extra']]);
B("env --split-string='git stash'", [['env', '--split-string=git stash']]);
B('env -S', [['env', '-S']]);
B('env -- git stash', [['git', 'stash']]);
B('env -- X=1 git stash', [['git', 'stash']]);
B('env --unset X git stash', [['git', 'stash']]);
B('env --chdir /tmp git stash', [['git', 'stash']]);
B('env -- ', [['env', '--']]);
B('env "" git', [['', 'git']]);
B('sudo -u root -g wheel -h h -p p -C 3 -D d -R r -r r -t t -T 5 -U u git stash', [['git', 'stash']]);
B('sudo --user root --group g --host h --prompt p git stash', [['git', 'stash']]);
B('doas -C conf git stash', [['git', 'stash']]);
B('nice --adjustment 5 git stash', [['git', 'stash']]);
B('ionice -c 2 -n 4 -t git stash', [['git', 'stash']]);
B('ionice --class 2 --classdata 4 git stash', [['git', 'stash']]);
B('stdbuf -i L -e L git stash', [['git', 'stash']]);
B('timeout -k 5 -s KILL 30 git stash', [['git', 'stash']]);
B('timeout --kill-after 5 --signal KILL 30 git stash', [['git', 'stash']]);
B('exec -a nombre git stash', [['git', 'stash']]);
B('chrt -f 10 git stash', [['git', 'stash']]);
B('timeout 5', [['timeout', '5']]);
B('nice', [['nice']]);
B('nohup', [['nohup']]);
B('sudo -u', [['sudo', '-u']]);
B('command', [['command']]);
B('time -p git stash', [['git', 'stash']]);
B('command -V git', [['command', '-V', 'git']]);
B('command -- git stash', [['git', 'stash']]);
B('IF x', [['IF', 'x']]);
B('function', []);
B('then', []);
B('x | { y; }', [['x'], ['y']]);
B('c1 && c2 &', [['c1'], ['c2']]);
B('a |b', [['a'], ['b']]);
B('a|b', [['a'], ['b']]);
B('a;;b', [['a'], ['b']]);
B('a &b', [['a'], ['b']]);
B('a&&b', [['a'], ['b']]);
B('a&>f', [['a']]);
B('a >f&b', [['a'], ['b']]);
B('a 2>&1&b', [['a'], ['b']]);
B('echo "a" b"c"', [['echo', 'a', 'bc']]);
B('echo "$(a)"x', [['echo', '$()x'], ['a']]);
B('echo "a\\b"', [['echo', 'a\\b']]);
B('echo "\\$HOME \\` \\\\"', [['echo', '$HOME ` \\']]);
B('echo "a$"', [['echo', 'a$']]);
B('echo $ $x $', [['echo', '$', '$x', '$']]);
B('echo a$b', [['echo', 'a$b']]);
B('echo {a,b}', [['echo', '{a,b}']]);
B('echo a{', [['echo', 'a{']]);
B('echo \\', [['echo', '\\']]);
B('echo a\\', [['echo', 'a\\']]);
B('git status -- .', [['git', 'status', '--', '.']]);
B('echo a\tb  c', [['echo', 'a', 'b', 'c']]);
B('echo a\rb', [['echo', 'a', 'b']]);
B('echo a<b', [['echo', 'a']]);
B('X=1 Y', [['Y']]);
B('1X=1', [['1X=1']]);
B('X =1', [['X', '=1']]);
B('=1 x', [['=1', 'x']]);
B('ls\n', [['ls']]);
B('\n\nls\n\n', [['ls']]);
P('echo a`', [['echo', 'a`']]);
P("echo 'a'b'c'", [['echo', 'abc']]);
P('echo $x $env:PATH', [['echo', '$x', '$env:PATH']]);
P('echo "a $x"', [['echo', 'a $x']]);
P('echo a<b', [['echo', 'a<b']]);
P('echo @{a=1}', [['echo', '@'], ['a=1']]);
P('echo a@b', [['echo', 'a@b']]);
P('echo a{b}', [['echo', 'a'], ['b']]);
P('$x = 1; echo $x', [[], ['echo', '$x']]);
P('echo "a`$b"', [['echo', 'a$b']]);
P('echo "a`0b`ac`bd`fe`rf`tg`vh"', [['echo', 'a\0b\x07c\bd\fe\rf\tg\vh']]);
P('a &', [['a']]);
P('a & b', [['a'], ['b']]);
P('echo hi >', [['echo', 'hi']]);
P("echo $(echo 'a)')", [['echo', '$()'], ['echo', 'a)']]);
P('echo $(echo "a`")")', [['echo', '$()'], ['echo', 'a")']]);
P('echo $(<# ) #> echo a) $(b)', [['echo', '$()', '$()'], ['echo', 'a'], ['b']]);
P('echo $(echo a # )\n) $(b)', [['echo', '$()', '$()'], ['echo', 'a'], ['b']]);
P('echo $(echo "$(echo a)") $(b)', [['echo', '$()', '$()'], ['echo', '$()'], ['echo', 'a'], ['b']]);


// ---------------------------------------------------------------- tablas de Hermes (datos)
// GENERADO desde los BLOQUEA/PASA de tests/test_hook_git_destructivo.py y tests/test_hook_python_stdin.py de Hermes
const HERMES_GIT_BLOQUEA = [
  ["Bash", "git stash"],
  ["Bash", "git stash push -m wip"],
  ["Bash", "git stash push -u -m \"x\" -- docs/a.md"],
  ["Bash", "git stash -u"],
  ["Bash", "git stash pop"],
  ["Bash", "git stash apply stash@{0}"],
  ["Bash", "git stash drop"],
  ["Bash", "git stash clear"],
  ["Bash", "git -C D:/Hermes-4.14 stash"],
  ["Bash", "cd D:/Hermes-4.14 && git stash && git status"],
  ["PowerShell", "git stash"],
  ["PowerShell", "git stash push -m wip"],
  ["Bash", "git reset --hard"],
  ["Bash", "git reset --hard HEAD~1"],
  ["Bash", "git reset HEAD --hard"],
  ["Bash", "git -C D:/Hermes-4.14 reset --hard origin/main"],
  ["PowerShell", "git reset --hard"],
  ["PowerShell", "git -C D:\\Hermes-4.14 reset --hard origin/main"],
  ["Bash", "git clean -f"],
  ["Bash", "git clean -fd"],
  ["Bash", "git clean -xfd"],
  ["Bash", "git clean -ffd"],
  ["Bash", "git clean -d -f"],
  ["Bash", "git clean --force -d"],
  ["PowerShell", "git clean -fdx"],
  ["Bash", "git checkout -- ."],
  ["Bash", "git checkout -q -- ."],
  ["Bash", "git -C D:/Hermes-4.14 checkout -q -- ."],
  ["Bash", "git -C D:/Hermes-4.14 checkout -q -- . 2>/dev/null; echo hecho"],
  ["Bash", "git checkout ."],
  ["Bash", "git checkout HEAD -- ."],
  ["Bash", "git checkout origin/main -- docs/"],
  ["Bash", "git checkout -- *"],
  ["Bash", "git checkout -- '*.py'"],
  ["Bash", "git checkout -f"],
  ["Bash", "git checkout --force main"],
  ["Bash", "git checkout -qf main"],
  ["Bash", "git checkout HEAD ./"],
  ["Bash", "git checkout HEAD docs/"],
  ["Bash", "git checkout origin/main -q web/"],
  ["Bash", "git checkout HEAD ."],
  ["Bash", "git restore :/"],
  ["Bash", "git restore -- :/docs/"],
  ["Bash", "GIT  stash"],
  ["PowerShell", "cd D:/x; git checkout -- ."],
  ["PowerShell", "git checkout -- ."],
  ["PowerShell", "git -C D:\\Hermes-4.14 checkout -q -- ."],
  ["Bash", "git restore ."],
  ["Bash", "git restore -- ."],
  ["Bash", "git restore --staged ."],
  ["Bash", "git restore -S -W ."],
  ["Bash", "git restore --source=HEAD~1 ."],
  ["Bash", "git restore --source HEAD~1 ."],
  ["Bash", "git restore docs/"],
  ["PowerShell", "git restore ."],
  ["PowerShell", "git restore --staged ."],
  ["Bash", "git switch -f main"],
  ["Bash", "git switch --discard-changes main"],
  ["Bash", "git stash && echo listo"],
  ["Bash", "ls; git reset --hard"],
  ["Bash", "time git stash"],
  ["Bash", "env GIT_PAGER=cat git reset --hard"],
  ["Bash", "if true; then git clean -fd; fi"],
  ["Bash", "echo $(git stash)"],
  ["Bash", "bash -c \"git stash\""],
  ["Bash", "sh -c 'git reset --hard'"],
  ["Bash", "cmd //c \"git clean -fd\""],
  ["Bash", "powershell -NoProfile -Command \"git checkout -- .\""],
  ["Bash", "git.exe stash"],
  ["Bash", "/usr/bin/git reset --hard"],
  ["Bash", "\"C:/Program Files/Git/cmd/git.exe\" reset --hard"],
  ["Bash", "git --no-pager stash"],
  ["Bash", "git -c core.pager=cat stash"],
  ["PowerShell", "& git stash"],
  ["PowerShell", "& 'C:\\Program Files\\Git\\cmd\\git.exe' reset --hard"],
  ["PowerShell", "cd D:\\Hermes-4.14; git clean -fd"],
  ["PowerShell", "cmd /c \"git stash\""],
];
const HERMES_GIT_PASA = [
  ["Bash", "git status"],
  ["Bash", "git status --short"],
  ["Bash", "git log --oneline -5"],
  ["Bash", "git diff --stat"],
  ["Bash", "git diff -- ."],
  ["Bash", "git add -- docs/x.md"],
  ["Bash", "git commit -m \"fix: algo\" -- docs/x.md"],
  ["Bash", "git push origin main"],
  ["Bash", "git fetch -q origin"],
  ["Bash", "git worktree list"],
  ["Bash", "git branch -D rama-vieja"],
  ["Bash", "git cherry-pick abc1234"],
  ["Bash", "git -C D:/Hermes-4.14 status --short"],
  ["Bash", "git -C D:/Hermes-4.14 log -1"],
  ["Bash", "git commit -m \"docs: prohibido git stash y git reset --hard (CM-8)\""],
  ["Bash", "git commit -m 'no usar git clean -fd ni git checkout -- .'"],
  ["Bash", "git commit -F - <<'EOF'\nfix(hook): frena git stash, git reset --hard y git checkout -- .\nEOF"],
  ["Bash", "git commit -m \"$(cat <<'EOF'\nhook: git restore . y git clean -f, a) y b)\nEOF\n)\""],
  ["Bash", "grep \"reset --hard\" CLAUDE.md"],
  ["Bash", "grep -rn 'git stash' docs"],
  ["Bash", "rg 'git checkout -- \\.' .claude"],
  ["Bash", "echo git stash"],
  ["Bash", "echo 'git reset --hard' >> notas.txt"],
  ["Bash", "printf 'git clean -fd\\n'"],
  ["Bash", "cat >> notas.md <<'EOF'\nregla: nunca git stash\nEOF"],
  ["Bash", "git log --oneline | grep stash"],
  ["Bash", "ls .git/refs/stash"],
  ["Bash", "cat docs/metodo/CAMBIOS.md | grep -n 'git clean'"],
  ["Bash", "bash -c \"echo git stash\""],
  ["Bash", "# git stash\nls"],
  ["Bash", "ls # git reset --hard"],
  ["Bash", "git checkout main"],
  ["Bash", "git checkout -b feature/x"],
  ["Bash", "git checkout -b fix-foo"],
  ["Bash", "git checkout -q develop"],
  ["Bash", "git checkout origin/main"],
  ["Bash", "git checkout --track origin/otra"],
  ["Bash", "git checkout -B rama origin/rama"],
  ["Bash", "git switch main"],
  ["Bash", "git switch -c nueva"],
  ["Bash", "git switch -C nueva"],
  ["Bash", "git reset"],
  ["Bash", "git reset HEAD archivo.py"],
  ["Bash", "git reset --soft HEAD~1"],
  ["Bash", "git reset --mixed HEAD~1"],
  ["Bash", "git clean -n"],
  ["Bash", "git clean -nfd"],
  ["Bash", "git clean --dry-run -fd"],
  ["Bash", "git stash list"],
  ["Bash", "git stash list --format='%H %gs'"],
  ["Bash", "git stash show -p"],
  ["Bash", "git restore -- core/sql_catalog.json web/src/shell/embeds.generated.ts"],
  ["Bash", "git restore core/sql_catalog.json web/src/shell/embeds.generated.ts"],
  ["Bash", "cd /d/Hermes-lote-c && git restore -- core/sql_catalog.json && git status --short"],
  ["Bash", "git checkout -- core/sql_catalog.json web/src/shell/embeds.generated.ts"],
  ["Bash", "git checkout -- .gitignore"],
  ["Bash", "git checkout -q -- supabase/functions/cuentas/archivo_lf.txt"],
  ["Bash", "git restore --source=HEAD -- docs/una-sola-identidad/TRACKER.md"],
  ["Bash", "git restore --staged archivo.py"],
  ["Bash", "git restore -S archivo.py"],
  ["Bash", "git -C D:/Hermes-lote-c restore -- core/sql_catalog.json"],
  ["Bash", "git checkout HEAD -- docs/x.md"],
  ["Bash", "git restore -- :/core/sql_catalog.json"],
  ["Bash", "git checkout -- :/web/src/shell/embeds.generated.ts"],
  ["Bash", "git checkout HEAD docs/x.md"],
  ["Bash", "git checkout -bfix"],
  ["Bash", "git checkout -Bfix origin/fix"],
  ["Bash", "git checkout -b fix origin/main"],
  ["Bash", "git switch -cfix"],
  ["Bash", "git switch -Cfeature-x"],
  ["PowerShell", "git switch -cfix"],
  ["Bash", "git stash --help"],
  ["Bash", "git stash -h"],
  ["Bash", "gh pr create --title 'x' --body 'git stash'"],
  ["Bash", "pytest -q"],
  ["Bash", "mygit stash"],
  ["Bash", "git"],
  ["Bash", "git --version"],
  ["Bash", ""],
  ["Bash", "echo \"sin cerrar git stash"],
  ["PowerShell", "git status"],
  ["PowerShell", "git commit -m 'no usar git stash'"],
  ["PowerShell", "git commit -m @'\nfix: frena git reset --hard y git clean -fd\n'@"],
  ["PowerShell", "Write-Output 'git stash'"],
  ["PowerShell", "Write-Host \"git reset --hard\""],
  ["PowerShell", "Select-String -Path CLAUDE.md -Pattern 'git stash'"],
  ["PowerShell", "Get-Content notas.md | Select-String 'git clean -fd'"],
  ["PowerShell", "@'\nnunca git stash\n'@ | Set-Content notas.txt"],
  ["PowerShell", "git checkout main"],
  ["PowerShell", "git checkout -b nueva"],
  ["PowerShell", "git restore -- core/sql_catalog.json"],
  ["PowerShell", "git restore --staged archivo.py"],
  ["PowerShell", "git reset --soft HEAD~1"],
  ["PowerShell", "git clean -n"],
  ["PowerShell", "git stash list"],
  ["PowerShell", "if ($true) { git status }"],
  ["PowerShell", "git -C D:\\Hermes-4.14 status"],
];
const HERMES_PY_BLOQUEA = [
  ["Bash", "python -"],
  ["Bash", "python -B -"],
  ["Bash", "python -I -B -"],
  ["Bash", "python -Bu -"],
  ["Bash", "python3 -"],
  ["Bash", "python3.12 -"],
  ["Bash", "py -"],
  ["Bash", "py -3 -"],
  ["Bash", "python.exe -"],
  ["Bash", "venv/Scripts/python -"],
  ["Bash", "./venv/Scripts/python.exe -B -"],
  ["Bash", "D:/Hermes/Hermes.exe/venv/Scripts/python.exe -"],
  ["Bash", "\"D:/Hermes/Hermes.exe/venv/Scripts/python.exe\" -"],
  ["Bash", "/d/Hermes/Hermes.exe/venv/Scripts/python -B -"],
  ["Bash", "C:\\Python314\\python.exe -"],
  ["Bash", "python - <<'EOF'\nprint(1)\nEOF"],
  ["Bash", "python -B - <<EOF\nprint(1)\nEOF"],
  ["Bash", "python <<'EOF'\nprint(1)\nEOF"],
  ["Bash", "python <<-EOF\n\tprint(1)\n\tEOF"],
  ["Bash", "python <<< 'print(1)'"],
  ["Bash", "python < script.py"],
  ["Bash", "python"],
  ["Bash", "python -B"],
  ["Bash", "echo 'print(1)' | python"],
  ["Bash", "cat x.py | python -"],
  ["Bash", "cat x.py | python3 -B -"],
  ["Bash", "cd /tmp && python - <<'EOF'\nprint(1)\nEOF"],
  ["Bash", "ls; python -"],
  ["Bash", "PYTHONIOENCODING=utf-8 python -"],
  ["Bash", "env PYTHONPATH=. python -"],
  ["Bash", "time python -"],
  ["Bash", "timeout 30 python -"],
  ["Bash", "winpty python -"],
  ["Bash", "uv run python -"],
  ["Bash", "if true; then python -; fi"],
  ["Bash", "(python -)"],
  ["Bash", "{ python - ; }"],
  ["Bash", "echo $(python -)"],
  ["Bash", "echo `python -`"],
  ["Bash", "bash -c \"python -\""],
  ["Bash", "sh -c 'cat f | python -'"],
  ["Bash", "cmd //c \"python -\""],
  ["Bash", "cmd /c \"venv\\Scripts\\python.exe\" -"],
  ["Bash", "powershell -NoProfile -Command \"python -\""],
  ["Bash", "eval \"python -\""],
  ["Bash", "python - 2>&1 <<'EOF'\nprint(1)\nEOF"],
  ["Bash", "cat > /dev/null <<'A'\nx\nA\npython - <<'EOF'\nprint(1)\nEOF"],
  ["Bash", "git status && python -"],
  ["Bash", "python \\\n  -"],
  ["PowerShell", "python -"],
  ["PowerShell", "python -B -"],
  ["PowerShell", "& python -"],
  ["PowerShell", "& 'D:\\Hermes\\Hermes.exe\\venv\\Scripts\\python.exe' -"],
  ["PowerShell", "& \"D:/Hermes/Hermes.exe/venv/Scripts/python.exe\" -B -"],
  ["PowerShell", ".\\venv\\Scripts\\python.exe -"],
  ["PowerShell", "py -3 -"],
  ["PowerShell", "Get-Content x.py | python -"],
  ["PowerShell", "Get-Content x.py | python"],
  ["PowerShell", "\"print(1)\" | python -"],
  ["PowerShell", "@'\nprint(1)\n'@ | python -"],
  ["PowerShell", "@\"\nprint(1)\n\"@ | & python -B -"],
  ["PowerShell", "$env:PYTHONIOENCODING='utf-8'; python -"],
  ["PowerShell", "cd D:\\Hermes; python -"],
  ["PowerShell", "if ($true) { python - }"],
  ["PowerShell", "$x = (python -)"],
  ["PowerShell", "cmd /c \"python -\""],
  ["PowerShell", "powershell -Command \"python -\""],
  ["PowerShell", "iex 'python -'"],
  ["PowerShell", "python - 2>&1"],
];
const HERMES_PY_PASA = [
  ["Bash", "python -m pytest tests/ -q"],
  ["Bash", "python -B archivo.py"],
  ["Bash", "python -B -u archivo.py arg1 -"],
  ["Bash", "python archivo.py -"],
  ["Bash", "python -m py_compile core/bridge.py"],
  ["Bash", "python -m json.tool x.json"],
  ["Bash", "python -c \"print('hola')\""],
  ["Bash", "python -B -c 'import sys; print(sys.version)'"],
  ["Bash", "python --version"],
  ["Bash", "python -V"],
  ["Bash", "python3 --version"],
  ["Bash", "py -0"],
  ["Bash", "py -3.12 script.py"],
  ["Bash", "python -W ignore script.py"],
  ["Bash", "python -X utf8 script.py"],
  ["Bash", "python -Wignore -m pytest"],
  ["Bash", "python -- script.py"],
  ["Bash", "venv/Scripts/pytest.exe -q"],
  ["Bash", "venv/Scripts/python.exe -m pytest -q -p no:cacheprovider"],
  ["Bash", "D:/Hermes/Hermes.exe/venv/Scripts/python -B C:/tmp/x.py"],
  ["Bash", "cmd //c \"d:\\Hermes\\Hermes.exe\\correr_tests.bat\" -q -p no:cacheprovider"],
  ["Bash", "git commit -m \"docs: la regla dice nunca python - ni heredoc\""],
  ["Bash", "git commit -m 'no usar python -'"],
  ["Bash", "git commit -m \"$(cat <<'EOF'\nfix: el hook frena python - y los heredoc\n\nNo bloquea python -m pytest.\nEOF\n)\""],
  ["Bash", "cat >> notas.md <<'EOF'\nregla: nunca python -\nEOF"],
  ["Bash", "cat > x.py <<'EOF'\nimport sys\nprint(sys.stdin.read())\nEOF\npython -B x.py"],
  ["Bash", "tee out.txt <<EOF\npython -\nEOF"],
  ["Bash", "grep \"python -\" docs/metodo/CAMBIOS.md"],
  ["Bash", "grep -rn 'python -' .claude/"],
  ["Bash", "rg 'python -B -' docs"],
  ["Bash", "echo python -"],
  ["Bash", "echo 'python -' >> notas.txt"],
  ["Bash", "printf 'python -\\n'"],
  ["Bash", "which python"],
  ["Bash", "command -v python"],
  ["Bash", "type python"],
  ["Bash", "ls venv/Scripts | grep python"],
  ["Bash", "pip install python-dateutil"],
  ["Bash", "echo 'print(1)' | python script.py"],
  ["Bash", "python script.py <<'EOF'\nlinea de entrada\nEOF"],
  ["Bash", "python script.py < datos.txt"],
  ["Bash", "cat datos.txt | python -B script.py"],
  ["Bash", "python script.py 2>&1 | tee out.txt"],
  ["Bash", "python script.py > out.txt 2>&1"],
  ["Bash", "PYTHONIOENCODING=utf-8 python -B script.py"],
  ["Bash", "echo $(python --version)"],
  ["Bash", "echo $(cat <<'EOF'\npython -\nEOF\n)"],
  ["Bash", "bash -c \"python -m pytest\""],
  ["Bash", "bash -c \"echo python -\""],
  ["Bash", "cmd //c \"python -B x.py\""],
  ["Bash", "# python -\nls"],
  ["Bash", "ls # python -"],
  ["Bash", "git log --oneline | grep python"],
  ["Bash", "pytest -q"],
  ["Bash", "pythonista -"],
  ["Bash", "npm run build"],
  ["Bash", "git commit -m \"$(cat <<'EOF'\ndocs: R2 -- casos: a) `python -` b) heredoc\nEOF\n)\""],
  ["Bash", "git commit -m \"$(cat <<'EOF'\ndocs: R2 -- 1) no usar python -\n2) ni heredoc\n\npython -\nEOF\n)\""],
  ["Bash", "git commit -m \"$(cat <<'EOF'\nfix: 1) el texto \"\npython -\nEOF\n)\""],
  ["Bash", "git commit -- requirements-test.txt -m \"$(cat <<'EOF'\nfix(ci): agregar pywin32-ctypes a requirements-test.txt\n\nEl workflow Tests estaba en rojo desde el 2026-09-24: tests/test_almacen_windows.py\nimporta win32ctypes real contra el almacen de Windows (y en local el venv la trae como\ntransitiva de pyinstaller). Misma version que requirements.txt (0.2.3).\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>\nEOF\n)\""],
  ["Bash", "git commit -m \"$(cat <<'EOF'\nregla: $(python -) y `python -` en el cuerpo, a) y b)\nEOF\n)\" && git push"],
  ["Bash", "git commit -m \"$(cat <<-'EOF'\n\tdocs: x) y\n\tpython -\n\tEOF\n)\""],
  ["Bash", "git diff --name-only | xargs -n1 python -B"],
  ["Bash", "ls tests/*.py | xargs venv/Scripts/python"],
  ["Bash", "py --list"],
  ["Bash", "arr=(python)"],
  ["Bash", "pys=(python python3); for p in \"${pys[@]}\"; do which $p; done"],
  ["PowerShell", "py --list-paths"],
  ["Bash", ""],
  ["Bash", "echo \"unterminated python -"],
  ["PowerShell", "python -m pytest -q"],
  ["PowerShell", "python -B archivo.py"],
  ["PowerShell", "& python -B archivo.py"],
  ["PowerShell", "& 'D:\\Hermes\\Hermes.exe\\venv\\Scripts\\python.exe' -m pytest -q"],
  ["PowerShell", ".\\venv\\Scripts\\python.exe -B x.py"],
  ["PowerShell", "python -c \"print(1)\""],
  ["PowerShell", "python --version"],
  ["PowerShell", "Get-Command python"],
  ["PowerShell", "Get-Content notas.md | Select-String 'python -'"],
  ["PowerShell", "Write-Output 'python -'"],
  ["PowerShell", "Write-Host \"nunca python -\""],
  ["PowerShell", "@'\nnunca python -\n'@ | Set-Content notas.txt"],
  ["PowerShell", "@\"\npython - <<EOF\n\"@ | Out-File x.txt"],
  ["PowerShell", "git commit -m 'no usar python -'"],
  ["PowerShell", "git commit -m @'\nfix: frena python - y heredoc\n'@"],
  ["PowerShell", "Select-String -Path x.md -Pattern 'python -'"],
  ["PowerShell", "echo 'print(1)' | python script.py"],
  ["PowerShell", "$env:PYTHONIOENCODING='utf-8'; python -B x.py"],
  ["PowerShell", "if ($true) { python -B x.py }"],
  ["PowerShell", "python x.py 2>&1 | Out-File out.txt"],
  ["PowerShell", "Get-ChildItem venv\\Scripts | Where-Object Name -like 'python*'"],
  ["PowerShell", "venv\\Scripts\\pytest.exe -q"],
];

// ---------------------------------------------------------------- 2. las tablas de Hermes, con consumidores de referencia

// Consumidor 1 (de bloquear_python_stdin.py): ¿algún comando invoca Python SIN programa (lee de stdin)?
const RE_PY = /^(python|pythonw|py|pyw)(\d+(\.\d+)*)?$/;
const GESTORES = new Set(['uv', 'poetry', 'pipenv', 'pdm', 'rye', 'hatch']);
function leeProgramaDeStdin(args) {
  let i = 0;
  while (i < args.length) {
    const a = args[i];
    if (a === '-') return true;
    if (a === '--') return i + 1 >= args.length;
    if (!a.startsWith('-')) return false; // el archivo .py
    if (a.startsWith('--')) {
      const nombre = a.split('=')[0];
      if (nombre === '--check-hash-based-pycs') {
        i += a.includes('=') ? 1 : 2;
        continue;
      }
      return false;
    }
    if (/^-0/.test(a)) return false;
    const cuerpo = a.slice(1);
    for (let j = 0; j < cuerpo.length; j++) {
      const ch = cuerpo[j];
      if ('cm'.includes(ch) || 'VhH?'.includes(ch)) return false;
      if ('WX'.includes(ch)) {
        if (j + 1 === cuerpo.length) i++;
        break;
      }
    }
    i++;
  }
  return true;
}
function detectaPythonStdin(texto, ps) {
  return partir(texto, { ps }).comandos.some((c) => {
    let argv = c.argv;
    if (argv.length && GESTORES.has(programa(argv[0])) && argv[1] === 'run') argv = argv.slice(2); // `uv run python -`
    return argv.length > 0 && RE_PY.test(programa(argv[0])) && leeProgramaDeStdin(argv.slice(1));
  });
}

// Consumidor 2 (de bloquear_git_destructivo.py): ¿algún comando es un git que se lleva el trabajo puesto? (sin la parte que
// mira el disco: las carpetas sin barra final dependen del filesystem y no son del parser)
const GLOBALES_CON_ARG = new Set(['-C', '-c', '--git-dir', '--work-tree', '--namespace', '--exec-path', '--super-prefix', '--config-env']);
const GLOBALES_PEGADAS = ['--git-dir=', '--work-tree=', '--namespace=', '--exec-path=', '--super-prefix=', '--config-env='];
const AMPLIOS = new Set(['.', './', '..', '../', '*', '**', ':/', ':/.', '.\\', '..\\']);
function subcomandoGit(args) {
  let i = 0;
  while (i < args.length) {
    const a = args[i];
    if (GLOBALES_CON_ARG.has(a)) i += 2;
    else if (GLOBALES_PEGADAS.some((p) => a.startsWith(p))) i++;
    else if (a.startsWith('-')) i++;
    else return [a, args.slice(i + 1)];
  }
  return [null, []];
}
function esAmplio(p) {
  if (AMPLIOS.has(p)) return true;
  if (p.startsWith(':/')) {
    const resto = p.slice(2);
    return resto === '' || resto === '.' || /[\\/]$/.test(resto) || /[*?[]/.test(resto);
  }
  return /[\\/]$/.test(p) || /[*?[]/.test(p);
}
function forzadoCorto(a) {
  if (!a.startsWith('-') || a.startsWith('--')) return false;
  for (const ch of a.slice(1)) {
    if ('bBcC'.includes(ch)) return false;
    if (ch === 'f') return true;
  }
  return false;
}
function clasificarGit(sub, rest) {
  if (sub === 'stash') {
    for (const a of rest) {
      if (a === '-h' || a === '--help') return null;
      if (!a.startsWith('-')) return a === 'list' || a === 'show' ? null : 'stash';
    }
    return 'stash';
  }
  if (sub === 'reset') return rest.includes('--hard') ? 'reset --hard' : null;
  if (sub === 'clean') {
    let forzado = false;
    let dry = false;
    for (const a of rest) {
      if (a === '--') break;
      if (a === '--force') forzado = true;
      else if (a === '--dry-run') dry = true;
      else if (a.startsWith('-') && !a.startsWith('--')) {
        forzado = forzado || a.slice(1).includes('f');
        dry = dry || a.slice(1).includes('n');
      }
    }
    return forzado && !dry ? 'clean -f' : null;
  }
  if (sub === 'checkout' || sub === 'restore' || sub === 'switch') {
    const sinDosGuiones = rest.filter((a) => a !== '--');
    if (sub === 'switch') return sinDosGuiones.some((a) => a === '--force' || a === '--discard-changes' || forzadoCorto(a)) ? 'switch -f' : null;
    if (sub === 'checkout' && sinDosGuiones.some((a) => a === '--force' || forzadoCorto(a))) return 'checkout -f';
    let paths;
    if (rest.includes('--')) paths = rest.slice(rest.indexOf('--') + 1);
    else if (sub === 'checkout') {
      paths = rest.filter((a) => AMPLIOS.has(a) || (a.startsWith(':/') && esAmplio(a)));
      const pos = [];
      for (let i = 0; i < rest.length; i++) {
        const a = rest[i];
        if (['-b', '-B', '--orphan', '--conflict', '--pathspec-from-file'].includes(a)) i++;
        else if (!a.startsWith('-')) pos.push(a);
      }
      paths = paths.concat(pos.slice(1).filter(esAmplio));
    } else {
      paths = [];
      for (let i = 0; i < rest.length; i++) {
        const a = rest[i];
        if (['-s', '--source', '--pathspec-from-file'].includes(a)) i++;
        else if (!a.startsWith('-')) paths.push(a);
      }
    }
    return paths.some(esAmplio) ? `${sub} (arbol o carpeta)` : null;
  }
  return null;
}
function detectaGitDestructivo(texto, ps) {
  return partir(texto, { ps }).comandos.some((c) => {
    if (programa(c) !== 'git') return false;
    const [sub, rest] = subcomandoGit(c.argv.slice(1));
    return sub !== null && clasificarGit(sub, rest) !== null;
  });
}

for (const [tabla, nombre, detecta, debe] of [
  [HERMES_GIT_BLOQUEA, 'git', detectaGitDestructivo, true],
  [HERMES_GIT_PASA, 'git', detectaGitDestructivo, false],
  [HERMES_PY_BLOQUEA, 'python', detectaPythonStdin, true],
  [HERMES_PY_PASA, 'python', detectaPythonStdin, false],
]) {
  for (const [herramienta, comando] of tabla) {
    test(`hermes ${nombre} ${debe ? 'BLOQUEA' : 'pasa'} (${herramienta}): ${JSON.stringify(comando).slice(0, 60)}`, () => {
      assert.equal(detecta(comando, herramienta === 'PowerShell'), debe, `${herramienta}: ${JSON.stringify(comando)}`);
    });
  }
}

test('hermes: las tablas se portaron enteras (174 de git + 161 de python)', () => {
  assert.equal(HERMES_GIT_BLOQUEA.length + HERMES_GIT_PASA.length + HERMES_PY_BLOQUEA.length + HERMES_PY_PASA.length, 335);
});

// ---------------------------------------------------------------- 3. incompletos, redirecciones, helpers, rendimiento

const inc = (t, ps = false) => partir(t, { ps }).incompleto;

for (const t of [
  'echo "abc', "echo 'abc", 'echo $(git stash', 'echo `git stash', 'echo ${X', 'echo "$(git stash"', 'echo > ', 'cat >',
  "echo $'abc", 'cat <<', 'echo "a', "git commit -m 'x", 'echo $(echo "a)', "bash -c \"echo 'x\"", 'arr=(a b', 'cat <<EOF\n$(git stash\nEOF',
  "echo 'a'\"b",
]) {
  test(`incompleto (bash): ${JSON.stringify(t)}`, () => assert.equal(inc(t), true));
}
for (const t of ['@\'\nabc', '"abc', "'abc", '<# x', 'echo $(git stash', '@"\nabc', "echo 'a''", 'x >', 'iex "echo \'x"', 'echo "$(git stash"']) {
  test(`incompleto (ps): ${JSON.stringify(t)}`, () => assert.equal(inc(t, true), true));
}
for (const t of [
  '', 'ls', 'echo "a" \'b\' $(c)', 'echo `a`', 'cat <<EOF\nx\nEOF', 'echo ${X}', "echo $'a'", 'a & b', 'echo 2>&1', '(a', 'a)', 'echo a\\',
  'case x in a) b;; esac', 'bash -c "echo a"', 'cat <<EOF\nsin cerrar', 'echo "a\\"b"', 'echo ")" $(echo ")")',
]) {
  test(`completo (bash): ${JSON.stringify(t)}`, () => assert.equal(inc(t), false));
}
for (const t of ["@'\na\n'@", '"a""b"', "'a''b'", '<# a #> b', 'echo $(a)', '& git', 'a 2>&1']) {
  test(`completo (ps): ${JSON.stringify(t)}`, () => assert.equal(inc(t, true), false));
}
test('el incompleto devuelve lo que pudo partir', () => {
  assert.deepEqual(partir('git status; echo "sin cerrar git stash'), {
    comandos: [
      { argv: ['git', 'status'], redirecciones: [], asignaciones: [] },
      { argv: ['echo', 'sin cerrar git stash'], redirecciones: [], asignaciones: [] },
    ],
    incompleto: true,
  });
  assert.deepEqual(argvs('echo $(git stash'), [['echo', '$()'], ['git', 'stash']]);
  assert.deepEqual(argvs("bash -c \"echo 'x; git stash\""), [['bash', '-c', "echo 'x; git stash"], ['echo', 'x; git stash']]);
});
test('el incompleto de adentro de -c sube al resultado', () => {
  assert.equal(inc("bash -c \"echo 'x\""), true);
  assert.equal(inc('powershell -Command "echo \'x"'), true);
  assert.equal(inc('cmd /c "echo \\"x"'), true); // en cmd la comilla queda abierta
  assert.equal(inc('cmd /c "echo \\"x\\""'), false);
  assert.equal(inc('eval "echo \\"x"'), true);
});
test('un texto que no es string no tira', () => {
  for (const x of [undefined, null, 5, {}, []]) assert.deepEqual(partir(x), { comandos: [], incompleto: false });
  assert.deepEqual(partir('ls', undefined).comandos, [{ argv: ['ls'], redirecciones: [], asignaciones: [] }]);
  assert.deepEqual(partir('ls', null).comandos, [{ argv: ['ls'], redirecciones: [], asignaciones: [] }]);
});

// profundidad
const envolver = (t) => `bash -c '${t.replace(/'/g, "'\\''")}'`;
test(`hasta ${MAX_PROFUNDIDAD} niveles de -c se miran; el siguiente da incompleto`, () => {
  assert.equal(MAX_PROFUNDIDAD, 4);
  let t = 'git stash';
  for (let nivel = 1; nivel <= 4; nivel++) {
    t = envolver(t);
    const r = partir(t);
    assert.equal(r.incompleto, false, `nivel ${nivel}`);
    assert.deepEqual(r.comandos[r.comandos.length - 1].argv, ['git', 'stash'], `nivel ${nivel}`);
  }
  const r5 = partir(envolver(t));
  assert.equal(r5.incompleto, true);
  assert.equal(r5.comandos.some((c) => c.argv[0] === 'git'), false);
});
test('los $( ) anidados también cuentan niveles', () => {
  assert.equal(inc('echo $(echo $(echo $(echo $(echo $(echo hi)))))'), true);
  assert.equal(inc('echo $(echo $(echo $(echo $(echo hi))))'), false);
});
test('los paréntesis y llaves sueltos no abren nivel', () => {
  assert.equal(inc('((((((((((git stash))))))))))'), false);
  assert.deepEqual(argvs('((((((((((git stash))))))))))'), [['git', 'stash']]);
});

// redirecciones
const redirs = (t, ps = false) => partir(t, { ps }).comandos.map((c) => c.redirecciones);
const R = (t, esperado, ps = false) => test(`redirecciones ${ps ? 'ps' : 'bash'}: ${JSON.stringify(t)}`, () => assert.deepEqual(redirs(t, ps), esperado));
R('echo a > f', [[{ op: '>', destino: 'f' }]]);
R('echo a>f', [[{ op: '>', destino: 'f' }]]);
R('echo a >> f', [[{ op: '>>', destino: 'f' }]]);
R('cat < f', [[{ op: '<', destino: 'f' }]]);
R('cmd 2> err', [[{ op: '2>', destino: 'err' }]]);
R('cmd 2>> err', [[{ op: '2>>', destino: 'err' }]]);
R('cmd &> todo', [[{ op: '&>', destino: 'todo' }]]);
R('cmd &>> todo', [[{ op: '&>>', destino: 'todo' }]]);
R('cmd >| f', [[{ op: '>|', destino: 'f' }]]);
R('cmd <> f', [[{ op: '<>', destino: 'f' }]]);
R('cmd 1> f', [[{ op: '1>', destino: 'f' }]]);
R('cmd 0< f', [[{ op: '0<', destino: 'f' }]]);
R('cmd >&f', [[{ op: '>&', destino: 'f' }]]);
R('cat <<< "a b"', [[{ op: '<<<', destino: 'a b' }]]);
R("cat <<'EOF'\nx\nEOF", [[{ op: '<<', destino: 'EOF' }]]);
R('cat <<-"EOF"\n\tx\n\tEOF', [[{ op: '<<-', destino: 'EOF' }]]);
R('cat < a > b', [[{ op: '<', destino: 'a' }, { op: '>', destino: 'b' }]]);
R('cat > "mi archivo.txt"', [[{ op: '>', destino: 'mi archivo.txt' }]]);
R('cat > .env', [[{ op: '>', destino: '.env' }]]);
R('cat >.env', [[{ op: '>', destino: '.env' }]]);
R('x 2>&1', [[]]);
R('x >&2', [[]]);
R('x <&0', [[]]);
R('x >&-', [[]]);
R('x > f 2>&1', [[{ op: '>', destino: 'f' }]]);
R('x &>/dev/null', [[{ op: '&>', destino: '/dev/null' }]]);
R('a > f | b < g', [[{ op: '>', destino: 'f' }], [{ op: '<', destino: 'g' }]]);
R('a > f; b', [[{ op: '>', destino: 'f' }], []]);
R('x "2">f', [[{ op: '>', destino: 'f' }]]);
R('echo a > f\nb > g', [[{ op: '>', destino: 'f' }], [{ op: '>', destino: 'g' }]]);
R('> f', [[{ op: '>', destino: 'f' }]]);
R('cmd > $(a)', [[{ op: '>', destino: '$()' }], []]);
R('bash -c "echo a > f"', [[], [{ op: '>', destino: 'f' }]]);
R('echo "a > f"', [[]]);
R('echo a \\> f', [[]]);
R('echo a > f', [[{ op: '>', destino: 'f' }]], true);
R('echo a >> f', [[{ op: '>>', destino: 'f' }]], true);
R('echo a 2> err', [[{ op: '2>', destino: 'err' }]], true);
R('echo a *> todo', [[{ op: '*>', destino: 'todo' }]], true);
R('echo a 2>&1', [[]], true);
R('echo a > f 2>&1', [[{ op: '>', destino: 'f' }]], true);
R('echo a>f', [[{ op: '>', destino: 'f' }]], true);
R('cmd /c "echo a > f"', [[], [{ op: '>', destino: 'f' }]], true);
R('cmd /c "type f < g"', [[], [{ op: '<', destino: 'g' }]]);
test('un destino que falta es un redirección vacía e incompleto', () => {
  assert.deepEqual(partir('echo a >').comandos, [{ argv: ['echo', 'a'], redirecciones: [{ op: '>', destino: '' }], asignaciones: [] }]);
});
test('`<` en PowerShell no es redirección', () => {
  assert.deepEqual(partir('a < b', { ps: true }).comandos, [{ argv: ['a', '<', 'b'], redirecciones: [], asignaciones: [] }]);
});

// helpers
test('programa(): sin ruta, sin .exe, en minúscula', () => {
  for (const [entrada, esperado] of [
    ['git', 'git'], ['/usr/bin/git.exe', 'git'], ['C:\\Program Files\\Git\\cmd\\GIT.EXE', 'git'], ['C:/Program Files/Git/cmd/git.exe', 'git'],
    ['./venv/Scripts/python.exe', 'python'], ['x.cmd', 'x'], ['x.bat', 'x'], ['x.com', 'x'], ['Get-Content', 'get-content'],
    ['git.exe.exe', 'git.exe'], ['mygit', 'mygit'], ['gitexe', 'gitexe'], ['', ''], ['.exe', ''], ['a.ps1', 'a.ps1'],
  ]) assert.equal(programa(entrada), esperado, entrada);
  assert.equal(programa({ argv: ['/usr/bin/git.exe', 'stash'], redirecciones: [] }), 'git');
  assert.equal(programa({ argv: [], redirecciones: [] }), '');
  assert.equal(programa(undefined), '');
  assert.equal(programa(null), '');
  assert.equal(programa(5), '');
  assert.equal(programa({}), '');
  assert.equal(programa({ argv: [5] }), '');
});
test('igual(): sin mayúsculas', () => {
  assert.equal(igual('Get-Content', 'get-content'), true);
  assert.equal(igual('GIT', 'git'), true);
  assert.equal(igual('git', 'gitx'), false);
  assert.equal(igual('git', undefined), false);
  assert.equal(igual(undefined, undefined), false);
  assert.equal(igual(1, 1), false);
});
test('la forma del resultado: argv, redirecciones y asignaciones, listas nuevas', () => {
  const r = partir('echo a > f');
  assert.deepEqual(Object.keys(r).sort(), ['comandos', 'incompleto']);
  assert.deepEqual(Object.keys(r.comandos[0]).sort(), ['argv', 'asignaciones', 'redirecciones']);
  assert.notEqual(partir('ls').comandos, partir('ls').comandos);
});
test('CRLF se trata como salto de línea', () => {
  assert.deepEqual(argvs('a\r\nb'), [['a'], ['b']]);
  assert.deepEqual(argvs("cat <<'EOF'\r\nx\r\nEOF\r\nls"), [['cat'], ['ls']]);
  assert.deepEqual(argvs('a\r\nb', true), [['a'], ['b']]);
});

// rendimiento
const mide = (t, ps = false) => {
  const t0 = process.hrtime.bigint();
  const r = partir(t, { ps });
  return { ms: Number(process.hrtime.bigint() - t0) / 1e6, r };
};
test('un comando típico de 200 caracteres tarda menos de 1 ms (promedio de 2000 corridas)', () => {
  const t = 'git -C D:/Hermes-4.14 commit -m "fix(hook): frena git stash y git reset --hard" -- docs/a.md docs/b.md && git status --short | grep -v x; echo "listo" $(date)';
  assert.ok(t.length > 150 && t.length < 260, String(t.length));
  for (let i = 0; i < 300; i++) partir(t); // calentar
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < 2000; i++) partir(t);
  const porCorrida = Number(process.hrtime.bigint() - t0) / 1e6 / 2000;
  assert.ok(porCorrida < 1, `${porCorrida.toFixed(3)} ms`);
});
const TOPE_MS = 1000;
const GRANDES = {
  'echo hola; x20KB': ['echo hola; '.repeat(1900), false],
  'una palabra de 300 KB': ['echo ' + 'A'.repeat(300000), false],
  'una palabra de 300 KB (ps)': ['echo ' + 'A'.repeat(300000), true],
  '$( sin cerrar x10000': ['$('.repeat(10000), false],
  '"$( sin cerrar x7000': ['"$('.repeat(7000), false],
  '$( sin cerrar x10000 (ps)': ['$('.repeat(10000), true],
  '( x20000': ['('.repeat(20000), false],
  '$(( x ) anidados 5000': ['echo ' + '$(echo '.repeat(5000) + ')'.repeat(5000), false],
  "comillas simples sueltas x10000": ["'a' ".repeat(5000) + "'", false],
  'comillas dobles x10000': ['"a" '.repeat(5000), false],
  'comillas invertidas x10000': ['`a` '.repeat(5000), false],
  '${ sin cerrar x6000': ['${'.repeat(6000), false],
  'heredoc de 20 KB': ["cat <<EOF\n" + 'linea con $x y `a` y $(b)\n'.repeat(800) + 'EOF\nls', false],
  'heredocs sin cerrar x2000': ['cat <<EOF\n'.repeat(2000), false],
  'un cierre de heredoc ausente dentro de $(': ['$(cat <<EOF\n' + 'x\n'.repeat(9000), false],
  'backslashes x20000': ['echo ' + '\\'.repeat(20000), false],
  'redirecciones x5000': ['a ' + '>f '.repeat(5000), false],
  'pipes x10000': ['a |'.repeat(10000), false],
  'comentarios x2000': ('# c\n'.repeat(5000) + 'ls'), // texto crudo abajo
  'here-string de PowerShell sin cerrar': ["@'\n" + 'x\n'.repeat(9000), true],
  'bloques <# x2000': ['<# '.repeat(6000), true],
  'cierres de paréntesis x20000': [')'.repeat(20000), false],
  'comillas dobles con $( de a miles': ['echo "' + '$(a) '.repeat(3000) + '"', false],
  'escapes de PowerShell x10000': ['echo ' + '`'.repeat(10000), true],
};
for (const [nombre, valor] of Object.entries(GRANDES)) {
  const [t, ps] = Array.isArray(valor) ? valor : [valor, false];
  test(`rendimiento: ${nombre} (${(t.length / 1024).toFixed(0)} KB) en menos de ${TOPE_MS} ms`, () => {
    const { ms } = mide(t, ps);
    assert.ok(ms < TOPE_MS, `${ms.toFixed(0)} ms`);
  });
}
test('rendimiento: el texto de 20 KB de comandos parte entero y rápido', () => {
  const t = 'echo hola; '.repeat(1900);
  const { ms, r } = mide(t);
  assert.equal(r.comandos.length, 1900);
  assert.equal(r.incompleto, false);
  assert.ok(ms < 200, `${ms.toFixed(0)} ms`);
});
test('un texto de miles de $( sin cerrar no revienta la pila y da incompleto', () => {
  assert.equal(partir('"$('.repeat(20000)).incompleto, true);
  assert.equal(partir('$('.repeat(20000)).incompleto, true);
});

// asignaciones de variables (p3-r1-1): el que llama ve "se exportó X antes, en la misma llamada"
const asigs = (t, ps = false) => partir(t, { ps }).comandos.map((c) => c.asignaciones);
const A = (t, esperado, ps = false) => test(`asignaciones ${ps ? 'ps' : 'bash'}: ${JSON.stringify(t).slice(0, 70)}`, () => assert.deepEqual(asigs(t, ps), esperado));
const v = (nombre, valor) => ({ nombre, valor });
A('ls', [[]]);
A('X=1 git stash', [[v('X', '1')]]);
A('X=1 Y=2 git stash', [[v('X', '1'), v('Y', '2')]]);
A('X+=1 git stash', [[v('X', '1')]]);
A('X="a b" git stash', [[v('X', 'a b')]]);
A("X='' git stash", [[v('X', '')]]);
A('X=$(a) git stash', [[v('X', '$()')], []]); // el $(a) sale aparte y sin asignaciones
A('X=a=b git stash', [[v('X', 'a=b')]]);
A('X=1', [[v('X', '1')]]);
A('X=1; Y=2', [[v('X', '1')], [v('Y', '2')]]);
A('X=1 && git stash', [[v('X', '1')], []]);
A('env X=1 git stash', [[v('X', '1')]]);
A('env -i X=1 Y=2 git stash', [[v('X', '1'), v('Y', '2')]]);
A('env -u X git stash', [[]]);
A('env X=1', [[v('X', '1')]]);
A('X=1 env Y=2 git stash', [[v('X', '1'), v('Y', '2')]]);
A('sudo X=1 git stash', [[v('X', '1')]]);
A('time X=1 git stash', [[v('X', '1')]]);
A('nohup env X=1 git stash', [[v('X', '1')]]);
A('export X=1', [[v('X', '1')]]);
A('export X=1 Y=2', [[v('X', '1'), v('Y', '2')]]);
A('export X', [[]]);
A('export -p', [[]]);
A('export -n X=1', [[v('X', '1')]]);
A('declare -x X=1', [[v('X', '1')]]);
A('typeset X=1', [[v('X', '1')]]);
A('readonly X=1', [[v('X', '1')]]);
A('local X=1', [[v('X', '1')]]);
A('Y=0 export X=1', [[v('Y', '0'), v('X', '1')]]);
A('export X=1 && git stash', [[v('X', '1')], []]);
A('export X=1; echo $X', [[v('X', '1')], []]);
A('echo X=1', [[]]);
A('git commit -m X=1', [[]]);
A('echo "export X=1"', [[]]);
A("bash -c 'export X=1; echo $X'", [[], [v('X', '1')], []]);
A('echo $(export X=1)', [[], [v('X', '1')]]);
A('X=1 > f', [[v('X', '1')]]);
A('set X=1', [[]]); // en Bash `set X=1` no asigna (son parámetros posicionales)
A('cmd /c "set X=1 && git stash"', [[], [v('X', '1')], []]);
A('cmd /c "set /p X=hola"', [[], [v('X', 'hola')]]); // set /p asigna X (el valor es el prompt)
A('cmd /c "set X"', [[], []]);
A('cmd /c "set \\"X=a b\\""', [[], [v('X', 'a b')]]);
A('setx X 1', [[v('X', '1')]]);
A('setx /m X 1', [[v('X', '1')]]);
// PowerShell
A('$env:X = "1"', [[v('X', '1')]], true);
A("$env:X = '1'", [[v('X', '1')]], true);
A("$env:X='1'", [[v('X', '1')]], true);
A('$env:GITHUB_TOKEN = "abc"; git push', [[v('GITHUB_TOKEN', 'abc')], []], true);
A('$x = 1', [[v('x', '1')]], true);
A('$x=1', [[v('x', '1')]], true);
A('$x += 1', [[v('x', '1')]], true);
A('$x+=1', [[v('x', '1')]], true);
A('$script:x = 1', [[v('x', '1')]], true);
A('$x = git stash', [[v('x', 'git stash')]], true);
A('$x=git stash', [[v('x', 'git stash')]], true);
A("Set-Item Env:X 1", [[v('X', '1')]], true);
A("Set-Item -Path Env:X -Value 1", [[v('X', '1')]], true);
A("Set-Item -Value 1 -Path env:x", [[v('x', '1')]], true);
A('Set-Item Env:\\X 1', [[v('X', '1')]], true);
A('SET-ITEM ENV:X 1', [[v('X', '1')]], true);
A("New-Item -Path Env:X -Value 1 -Force", [[v('X', '1')]], true);
A("Set-Content Env:X 1", [[v('X', '1')]], true);
A("Add-Content Env:X 1", [[v('X', '1')]], true);
A('Set-Item C:\\x.txt 1', [[]], true); // un archivo no es una variable
A('Set-Content .env FOO', [[]], true);
A('Set-Variable X 1', [[v('X', '1')]], true);
A('Set-Variable -Name X -Value 1', [[v('X', '1')]], true);
A('Set-Variable -Scope Global -Name X -Value 1', [[v('X', '1')]], true);
A('New-Variable X 1', [[v('X', '1')]], true);
A('Set-Variable', [[]], true);
A('Get-Item Env:X', [[]], true);
A('Get-ChildItem Env:', [[]], true);
A('Remove-Item Env:X', [[]], true);
A('echo "$env:X = 1"', [[]], true);
A("& git stash", [[]], true);
A('cmd /c "set X=1"', [[], [v('X', '1')]], true);
A('X=1 git stash', [[]], true); // `X=1 cmd` no existe en PowerShell: es un programa llamado X=1
A('setx X 1', [[v('X', '1')]], true);

test('las asignaciones no sacan al comando de la lista ni le cambian el argv', () => {
  assert.deepEqual(partir('export X=1').comandos, [{ argv: ['export', 'X=1'], redirecciones: [], asignaciones: [v('X', '1')] }]);
  assert.deepEqual(partir('X=1').comandos, [{ argv: [], redirecciones: [], asignaciones: [v('X', '1')] }]);
  assert.deepEqual(partir('X=1 git stash').comandos, [{ argv: ['git', 'stash'], redirecciones: [], asignaciones: [v('X', '1')] }]);
  assert.deepEqual(partir('$env:X = "1"', { ps: true }).comandos, [{ argv: [], redirecciones: [], asignaciones: [v('X', '1')] }]);
  assert.deepEqual(partir('Set-Item Env:X 1', { ps: true }).comandos, [
    { argv: ['Set-Item', 'Env:X', '1'], redirecciones: [], asignaciones: [v('X', '1')] },
  ]);
});
test('variablesAsignadas(): los nombres asignados en cualquier punto, en orden, con PowerShell y lo anidado', () => {
  assert.deepEqual([...variablesAsignadas(partir('X=1 git stash; export Y=2 && env Z=3 ls'))], ['X', 'Y', 'Z']);
  assert.deepEqual([...variablesAsignadas(partir('echo ok'))], []);
  assert.deepEqual([...variablesAsignadas(partir('$env:A = 1; Set-Item Env:B 2; Set-Variable C 3; $d = 4', { ps: true }))], ['A', 'B', 'C', 'd']);
  assert.deepEqual([...variablesAsignadas(partir("bash -c 'export A=1' && echo $(B=2 c)"))], ['A', 'B']);
  assert.deepEqual([...variablesAsignadas(partir('X=1 a; X=2 b'))], ['X']); // un conjunto: sin repetidos
  assert.equal(variablesAsignadas(partir('X=1')) instanceof Set, true);
  for (const x of [undefined, null, {}, { comandos: 5 }, { comandos: [null, {}] }, 'x']) assert.deepEqual([...variablesAsignadas(x)], []);
});
test('el caso del director: "se exportó X antes, en la misma llamada"', () => {
  const r = partir('export GITHUB_TOKEN=abc123 && echo $GITHUB_TOKEN');
  assert.equal(variablesAsignadas(r).has('GITHUB_TOKEN'), true);
  assert.deepEqual(r.comandos.map((c) => c.argv), [['export', 'GITHUB_TOKEN=abc123'], ['echo', '$GITHUB_TOKEN']]);
  const p = partir('$env:GITHUB_TOKEN = "abc123"; Write-Output $env:GITHUB_TOKEN', { ps: true });
  assert.equal(variablesAsignadas(p).has('GITHUB_TOKEN'), true);
  assert.equal(variablesAsignadas(partir('echo $GITHUB_TOKEN')).has('GITHUB_TOKEN'), false);
});
B('echo $(echo a#b) $(c)', [['echo', '$()', '$()'], ['echo', 'a#b'], ['c']]); // # a mitad de palabra no es comentario
B('echo "$(echo "(")" $(b)', [['echo', '$()', '$()'], ['echo', '('], ['b']]);
P('echo "a`', [['echo', 'a`']]);
P('echo $(echo @"\n)\n"@) $(b)', [['echo', '$()', '$()'], ['echo', ')'], ['b']]);
P('echo "$(echo "(")" $(b)', [['echo', '$()', '$()'], ['echo', '('], ['b']]);

// ---------------------------------------------------------------- casos que salieron de los mutantes vivos
R('cat <<< \\EOF', [[{ op: '<<<', destino: '\\EOF' }]]); // la barra de antes de la marca solo comilla en <<, no en <<<
R('x >&"2"', [[]]);
R('cmd /c "echo a #b"', [[], []]);
B('cmd /c "echo a ; git stash"', [['cmd', '/c', 'echo a ; git stash'], ['echo', 'a', ';', 'git', 'stash']]); // en cmd el ; suelto tampoco separa
B('cmd /c "echo \'a & git stash\'"', [['cmd', '/c', "echo 'a & git stash'"], ['echo', "'a"], ['git', "stash'"]]); // la ' no es comilla en cmd
B('cmd /c "echo #x"', [['cmd', '/c', 'echo #x'], ['echo', '#x']]); // el # no es comentario en cmd
B("cmd /c 'echo $x `b` $\"c\"'", [['cmd', '/c', 'echo $x `b` $"c"'], ['echo', '$x', '`b`', '$c']]); // ni el $ ni la comilla invertida son especiales en cmd
B('echo `echo \\`git stash\\``', [['echo', '$()'], ['echo', '$()'], ['git', 'stash']]); // comillas invertidas anidadas
B('echo "`echo \\`git stash\\``"', [['echo', '$()'], ['echo', '$()'], ['git', 'stash']]);
B("echo $'\\E[0m'", [['echo', '\x1b[0m']]);
B('echo $(echo "a $(echo ")") b") $(c)', [['echo', '$()', '$()'], ['echo', 'a $() b'], ['echo', ')'], ['c']]); // un $( ) entre comillas adentro de un $( )
B("echo $(echo \"a `echo '\"'` b\") $(c)", [['echo', '$()', '$()'], ['echo', 'a $() b'], ['echo', '"'], ['c']]); // una comilla dentro de una comilla invertida
B("echo $(cat << 'E'\n)\nE\n) $(b)", [['echo', '$()', '$()'], ['cat'], ['b']]); // espacios tras <<
B("echo $(echo $'a\\')') $(b)", [['echo', '$()', '$()'], ['echo', "a')"], ['b']]); // $'…' con \' adentro de un $( )
B('echo $(# ) x\necho a) $(b)', [['echo', '$()', '$()'], ['echo', 'a'], ['b']]); // un comentario pegado al paréntesis
B('echo ${X:-${Y} z} w', [['echo', '${X:-${Y} z}', 'w']]);
B('echo ${X\\} z} w', [['echo', '${X\\} z}', 'w']]);
B('echo ${X:-$(echo })} w', [['echo', '${X:-$(echo })}', 'w'], ['echo', '}']]);
P("echo $(echo @'\nit's )\n'@) $(b)", [['echo', '$()', '$()'], ['echo', "it's )"], ['b']]);
P('echo $(echo @"\nsay "hi" )\n"@) $(b)', [['echo', '$()', '$()'], ['echo', 'say "hi" )'], ['b']]);
P('echo $(echo @"\nit"s )\n"@) $(b)', [['echo', '$()', '$()'], ['echo', 'it"s )'], ['b']]);
P("$x = 'git stash'", [[]]);
P('$env:X = "abc"', [[]]);
P("$x='git stash'", [[]]);
P('$x = $y', [[]]);
P('$x =', [[]]);
P('$x = -1', [[]]);
P('$x = .5', [[]]);
P('$x = @(1)', [[], ['1']]);
B("env --split-string 'git stash'", [['git', 'stash'], ['env', '--split-string', 'git stash']]);
B('env -S', [['env', '-S']]);
B('bash -c', [['bash', '-c']]);
B('bash -c ""', [['bash', '-c', '']]);
B('cmd /c', [['cmd', '/c']]);
B('eval ""', [['eval', '']]);
P('iex', [['iex']]);
P('powershell -Command', [['powershell', '-Command']]);
P('Invoke-Expression', [['Invoke-Expression']]);
B('powershell -c "echo \'it\'\'s\'"', [['powershell', '-c', "echo 'it''s'"], ['echo', "it's"]]); // lo de adentro se parte como PowerShell
P('eval "echo \'it\'\'s\'"', [['eval', "echo 'it''s'"], ['echo', "it's"]]); // eval hereda el modo de afuera
B('eval "echo \'it\'\'s\'"', [['eval', "echo 'it''s'"], ['echo', 'its']]);
test('un -c vacío o a profundidad máxima no marca incompleto por el hueco', () => {
  assert.equal(inc('bash -c ""'), false);
  assert.equal(inc(envolver(envolver(envolver(envolver("bash -c ''"))))), false);
});
test('programa(): .com y .exe solo al final del nombre', () => {
  for (const [entrada, esperado] of [['x.command', 'x.command'], ['a.exe.b', 'a.exe.b'], ['a.bat.x', 'a.bat.x'], ['a.cmd.x', 'a.cmd.x']]) {
    assert.equal(programa(entrada), esperado, entrada);
  }
});
test('sustituciones: una comilla invertida sin cerrar en un heredoc es incompleto', () => {
  assert.equal(inc('cat <<EOF\n`abc\nEOF'), true);
  assert.equal(inc('cat <<EOF\n`abc`\nEOF'), false);
});
// PowerShell: las variantes de los cmdlets que asignan
A('Set-Item Env:X 1', [[]]); // en Bash no existen los cmdlets
A('Set-Item -Credential c -Path Env:X -Value 1', [[v('X', '1')]], true); // un parámetro que no conocemos no se lleva el nombre
A('Set-Item -Credential c -LiteralPath Env:X -Value 1', [[v('X', '1')]], true);
A('Set-Variable -Credential c -Name X -Value 1', [[v('X', '1')]], true);
A('Set-Item -Path Env:X -Credential c -Value 1', [[v('X', '1')]], true);
A('Set-Item -Path Env:X -Value 1 -Credential c', [[v('X', '1')]], true);
A('Set-Variable -Scope Global X 1', [[v('X', '1')]], true);
A('Set-Variable -Option ReadOnly X 1', [[v('X', '1')]], true);
A('Set-Variable -Description d X 1', [[v('X', '1')]], true);
A('Set-Variable -Visibility Private X 1', [[v('X', '1')]], true);
A('Set-Variable -Type string X 1', [[v('X', '1')]], true);
A('New-Item -ItemType Variable Env:X 1', [[v('X', '1')]], true);
A('Set-Content -Encoding utf8 Env:X 1', [[v('X', '1')]], true);
A('Set-Variable -Force X 1', [[v('X', '1')]], true);
A('Set-Item -Force Env:X 1', [[v('X', '1')]], true);
A('Set-Item Env:/X 1', [[v('X', '1')]], true);
A('Set-Item Env: 1', [[]], true);
A('Set-Item Env:X', [[v('X', '')]], true);
A('Set-Variable -Name $X -Value 1', [[v('$X', '1')]], true);
A('cmd /c "set =x"', [[], []]);
A('cmd /c "set /a X=1+2"', [[], [v('X', '1+2')]]);
A('setx X', [[v('X', '')]]);
A('setx', [[]]);
A('setx /m', [[]]);
B('cmd /c "echo a^"', [['cmd', '/c', 'echo a^'], ['echo', 'a']]); // un ^ al final de cmd es continuación: no queda en la palabra
B('echo $(echo a;# ) x\necho b) $(c)', [['echo', '$()', '$()'], ['echo', 'a'], ['echo', 'b'], ['c']]); // un # pegado a ; | & es comentario
B('echo $(echo a|# ) x\necho b) $(c)', [['echo', '$()', '$()'], ['echo', 'a'], ['echo', 'b'], ['c']]);
B('echo $(echo a&# ) x\necho b) $(c)', [['echo', '$()', '$()'], ['echo', 'a'], ['echo', 'b'], ['c']]);
