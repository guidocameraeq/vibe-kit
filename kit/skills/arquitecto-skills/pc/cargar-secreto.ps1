# cargar-secreto.ps1 NOMBRE [-AlEnv]
# Guarda UNA credencial sin pasarla por el chat: la tecleas vos, a ciegas, en tu terminal.
# La corre el HUMANO, nunca Claude (el valor no se imprime, ni su largo, ni va a variables del sistema o de usuario).
# Destino por defecto: $env:USERPROFILE\.config\kit-secretos\<proyecto>.env (fuera del repo; Claude no lo puede leer).
# Con -AlEnv: el .env de la raiz del repo (solo credenciales dummy, de prueba o de solo lectura).
# Sale de: SPEC-0 del kit v3, 6.6; F par. 9. Prueba: cargar-secreto.test.cjs. (Archivo en ASCII a proposito: PowerShell 5.1.)
# Codigos: 0 guardado - 1 no se pudo escribir o no quedo - 2 uso o valor invalido.

param(
  [Parameter(Position = 0)][string]$Nombre,
  [switch]$AlEnv
)

$ErrorActionPreference = 'Stop'
$enc = New-Object System.Text.UTF8Encoding($false)

function Salir-Con($codigo, $mensaje) {
  if ($mensaje) { [Console]::Error.WriteLine($mensaje) }
  exit $codigo
}

if ([string]::IsNullOrEmpty($Nombre)) {
  Salir-Con 2 'uso: cargar-secreto.ps1 NOMBRE [-AlEnv]   (NOMBRE en MAYUSCULAS_CON_GUION_BAJO)'
}
if ($Nombre -cnotmatch '^[A-Z][A-Z0-9_]*\z') {
  Salir-Con 2 'NOMBRE invalido: tiene que ser MAYUSCULAS_CON_GUION_BAJO (empieza con letra; solo A-Z, 0-9 y _).'
}

# Raiz del repo de git del cwd (o el cwd si no hay repo).
$raiz = $null
try {
  $ErrorActionPreference = 'Continue'
  $r = & git rev-parse --show-toplevel 2>$null
  if ($LASTEXITCODE -eq 0 -and $r) { $raiz = ([string]($r | Select-Object -First 1)).Trim() }
} catch { $raiz = $null }
$ErrorActionPreference = 'Stop'
if (-not $raiz -or -not (Test-Path -LiteralPath $raiz -PathType Container)) { $raiz = (Get-Location).ProviderPath }
$raiz = [System.IO.Path]::GetFullPath($raiz)

# --- el valor: oculto si hay terminal; un renglon de stdin si esta redirigida ---
$valor = $null
if ([Console]::IsInputRedirected) {
  $valor = [Console]::In.ReadLine()
  if ($null -ne $valor -and [Console]::In.Peek() -ne -1) {
    Salir-Con 2 'el valor no puede tener saltos de linea; no se guardo nada.'
  }
} else {
  $seguro = Read-Host -Prompt "Valor de $Nombre (no se ve al teclear)" -AsSecureString
  $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($seguro)
  try { $valor = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) }
  finally { [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
}
if ($null -ne $valor -and $valor.EndsWith("`r")) { $valor = $valor.Substring(0, $valor.Length - 1) }
if ([string]::IsNullOrEmpty($valor)) { Salir-Con 2 'valor vacio; no se guardo nada.' }
if ($valor.Contains("`n") -or $valor.Contains("`r")) {
  Salir-Con 2 'el valor no puede tener saltos de linea; no se guardo nada.'
}

# --- destino ---
if ($AlEnv) {
  $destino = Join-Path $raiz '.env'
  [Console]::Error.WriteLine('OJO -AlEnv: va al .env del repo. Usalo solo para credenciales de dummy, de prueba o de solo lectura.')
} else {
  $home_ = $env:USERPROFILE
  if ([string]::IsNullOrEmpty($home_)) { Salir-Con 1 'USERPROFILE no esta definido; no se puede ubicar el almacen.' }
  $proyecto = ''
  $ficha = Join-Path $raiz '.claude\kit.md'
  if (Test-Path -LiteralPath $ficha -PathType Leaf) {
    try {
      $enVars = $false
      foreach ($l in [System.IO.File]::ReadAllLines($ficha, $enc)) {
        if ($l -match '^vars:\s*(#.*)?$') { $enVars = $true; continue }
        if ($enVars) {
          if ($l -match '^[^\s#]') { $enVars = $false; continue }
          if ($l -match '^\s+proyecto:\s*(.*)$') {
            $p = $Matches[1]
            $p = $p -replace '\s+#.*$', ''
            $p = $p.Trim()
            if ($p.Length -ge 1 -and ($p[0] -eq '"' -or $p[0] -eq "'")) { $p = $p.Substring(1) }
            if ($p.Length -ge 1 -and ($p[$p.Length - 1] -eq '"' -or $p[$p.Length - 1] -eq "'")) { $p = $p.Substring(0, $p.Length - 1) }
            $proyecto = $p
            break
          }
        }
      }
    } catch { $proyecto = '' }
  }
  if (-not $proyecto) { $proyecto = Split-Path -Leaf $raiz }
  # a [a-z0-9-] byte a byte (UTF-8), igual que el .sh: lo demas pasa a '-'
  $sb = New-Object System.Text.StringBuilder
  foreach ($b in $enc.GetBytes($proyecto)) {
    if ($b -ge 65 -and $b -le 90) { $b = $b + 32 }
    if (($b -ge 97 -and $b -le 122) -or ($b -ge 48 -and $b -le 57)) { [void]$sb.Append([char]$b) } else { [void]$sb.Append('-') }
  }
  $slug = $sb.ToString()
  if (-not $slug) { $slug = 'proyecto' }
  $almacen = Join-Path $home_ '.config\kit-secretos'
  try { [void](New-Item -ItemType Directory -Force -Path $almacen) } catch { Salir-Con 1 "no pude crear $almacen" }
  $destino = Join-Path $almacen "$slug.env"
}

$dir = Split-Path -Parent $destino
$tmp = Join-Path $dir ('.cargar-secreto.' + [guid]::NewGuid().ToString('N').Substring(0, 8))

# --- armar el contenido nuevo: reemplaza el renglon de NOMBRE (el primero; saca repetidos), deja el resto ---
$lineas = New-Object System.Collections.Generic.List[string]
$puesto = $false
$nuevo = "$Nombre=$valor"
if (Test-Path -LiteralPath $destino -PathType Leaf) {
  $texto = [System.IO.File]::ReadAllText($destino, $enc)
  $partes = $texto -split "`n"
  $n = $partes.Count
  if ($n -gt 0 -and $partes[$n - 1] -eq '') { $n = $n - 1 }
  for ($i = 0; $i -lt $n; $i++) {
    $l = $partes[$i]
    if ($l.StartsWith("$Nombre=", [System.StringComparison]::Ordinal)) {
      if (-not $puesto) { $lineas.Add($nuevo); $puesto = $true }
    } else {
      $lineas.Add($l)
    }
  }
}
if (-not $puesto) { $lineas.Add($nuevo) }
$contenido = ($lineas -join "`n") + "`n"

try {
  [System.IO.File]::WriteAllText($tmp, $contenido, $enc)
  if (Test-Path -LiteralPath $destino -PathType Leaf) {
    [System.IO.File]::Replace($tmp, $destino, [NullString]::Value)
  } else {
    [System.IO.File]::Move($tmp, $destino)
  }
} catch {
  if (Test-Path -LiteralPath $tmp) { Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue }
  # nunca el mensaje de la excepcion: por las dudas, nada que pueda arrastrar el valor
  Salir-Con 1 "no pude escribir $destino; no se guardo nada."
}

# --- releer y comparar (F par. 9: en Windows un renglon puede "tener exito" sin efecto) ---
$cuenta = 0; $otro = $false
if (Test-Path -LiteralPath $destino -PathType Leaf) {
  foreach ($l in ([System.IO.File]::ReadAllText($destino, $enc) -split "`n")) {
    if ($l.StartsWith("$Nombre=", [System.StringComparison]::Ordinal)) {
      if ($l -ceq $nuevo) { $cuenta++ } else { $otro = $true }
    }
  }
}
if ($cuenta -ne 1 -or $otro) {
  Salir-Con 1 "ERROR: despues de escribir, $destino no tiene el renglon de $Nombre como corresponde. Revisalo a mano."
}

[Console]::Out.WriteLine("guardado $Nombre en $destino")
if (-not $AlEnv) {
  [Console]::Out.WriteLine('lo usan los comandos del proyecto; Claude no lo puede leer.')
}
exit 0
