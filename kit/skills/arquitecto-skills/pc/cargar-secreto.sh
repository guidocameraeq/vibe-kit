#!/usr/bin/env bash
# cargar-secreto.sh NOMBRE [--al-env]
# Guarda UNA credencial sin pasarla por el chat: la tecleás vos, a ciegas, en tu terminal.
# La corre el HUMANO, nunca Claude (el valor no se imprime, ni su largo, ni se guarda en variables del sistema).
# Destino por defecto: ~/.config/kit-secretos/<proyecto>.env (fuera del repo; Claude no lo puede leer).
# Con --al-env: el .env de la raiz del repo (solo credenciales dummy, de prueba o de solo lectura).
# Sale de: SPEC-0 del kit v3, 6.6; F §9. Prueba: cargar-secreto.test.cjs.
# Codigos: 0 guardado · 1 no se pudo escribir o no quedo · 2 uso o valor invalido.

set +x
export LC_ALL=C
umask 077

uso() { echo "uso: cargar-secreto.sh NOMBRE [--al-env]   (NOMBRE en MAYUSCULAS_CON_GUION_BAJO)" >&2; }

nombre=""; al_env=0
for a in "$@"; do
  case "$a" in
    --al-env) al_env=1 ;;
    -*) echo "opcion desconocida: $a" >&2; uso; exit 2 ;;
    *) if [ -n "$nombre" ]; then echo "sobra un argumento: $a" >&2; uso; exit 2; fi; nombre="$a" ;;
  esac
done
if [ -z "$nombre" ]; then uso; exit 2; fi
if ! [[ "$nombre" =~ ^[A-Z][A-Z0-9_]*$ ]]; then
  echo "NOMBRE invalido: tiene que ser MAYUSCULAS_CON_GUION_BAJO (empieza con letra; solo A-Z, 0-9 y _)." >&2
  exit 2
fi

# Raiz del repo de git del cwd (o el cwd si no hay repo).
raiz="$(git rev-parse --show-toplevel 2>/dev/null)" || raiz=""
[ -n "$raiz" ] && [ -d "$raiz" ] || raiz="$(pwd)"

# --- el valor: oculto si hay terminal; un renglon de stdin si esta redirigida ---
valor=""
if [ -t 0 ]; then
  IFS= read -s -r -p "Valor de $nombre (no se ve al teclear): " valor
  echo >&2
else
  IFS= read -r valor || true
  if IFS= read -r -t 0.3 -n 1 _resto; then
    echo "el valor no puede tener saltos de linea; no se guardo nada." >&2
    exit 2
  fi
fi
valor="${valor%$'\r'}"
if [ -z "$valor" ]; then
  echo "valor vacio; no se guardo nada." >&2
  exit 2
fi
case "$valor" in
  *$'\n'*|*$'\r'*) echo "el valor no puede tener saltos de linea; no se guardo nada." >&2; exit 2 ;;
esac

# --- destino ---
if [ "$al_env" -eq 1 ]; then
  destino="$raiz/.env"
  echo "OJO --al-env: va al .env del repo. Usalo solo para credenciales de dummy, de prueba o de solo lectura." >&2
else
  if [ -z "${HOME:-}" ]; then echo "HOME no esta definido; no se puede ubicar el almacen." >&2; exit 1; fi
  proyecto=""
  ficha="$raiz/.claude/kit.md"
  if [ -f "$ficha" ]; then
    en_vars=0
    while IFS= read -r l || [ -n "$l" ]; do
      l="${l%$'\r'}"
      if [[ "$l" =~ ^vars:[[:space:]]*(#.*)?$ ]]; then en_vars=1; continue; fi
      if [ "$en_vars" -eq 1 ]; then
        if [[ "$l" =~ ^[^[:space:]#] ]]; then en_vars=0; continue; fi
        if [[ "$l" =~ ^[[:space:]]+proyecto:[[:space:]]*(.*)$ ]]; then
          p="${BASH_REMATCH[1]}"
          p="${p%%[[:space:]]#*}"
          p="${p#"${p%%[![:space:]]*}"}"; p="${p%"${p##*[![:space:]]}"}"
          p="${p#[\"\']}"; p="${p%[\"\']}"
          proyecto="$p"
          break
        fi
      fi
    done < "$ficha"
  fi
  [ -n "$proyecto" ] || proyecto="$(basename "$raiz")"
  proyecto="$(printf '%s' "$proyecto" | tr 'A-Z' 'a-z' | tr -c 'a-z0-9' '-')"
  [ -n "$proyecto" ] || proyecto="proyecto"
  mkdir -p "$HOME/.config/kit-secretos" || { echo "no pude crear $HOME/.config/kit-secretos" >&2; exit 1; }
  destino="$HOME/.config/kit-secretos/$proyecto.env"
fi

dir="$(dirname "$destino")"
tmp="$(mktemp "$dir/.cargar-secreto.XXXXXX")" || { echo "no pude crear un temporal en $dir" >&2; exit 1; }
trap 'rm -f "$tmp"' EXIT

# --- armar el contenido nuevo: reemplaza el renglon de NOMBRE (el primero; saca repetidos), deja el resto ---
puesto=0
{
  if [ -f "$destino" ]; then
    while IFS= read -r l || [ -n "$l" ]; do
      if [[ "$l" == "$nombre="* ]]; then
        if [ "$puesto" -eq 0 ]; then printf '%s\n' "$nombre=$valor"; puesto=1; fi
      else
        printf '%s\n' "$l"
      fi
    done < "$destino"
  fi
  if [ "$puesto" -eq 0 ]; then printf '%s\n' "$nombre=$valor"; fi
} > "$tmp" || { echo "no pude escribir el temporal; no se guardo nada." >&2; exit 1; }

chmod 600 "$tmp" 2>/dev/null || true
mv -f "$tmp" "$destino" || { echo "no pude renombrar sobre $destino; no se guardo nada." >&2; exit 1; }
trap - EXIT

# --- releer y comparar (F §9: en Windows un renombre puede "tener exito" sin efecto) ---
cuenta=0; otro=0
if [ -f "$destino" ]; then
  while IFS= read -r l || [ -n "$l" ]; do
    if [[ "$l" == "$nombre="* ]]; then
      if [ "$l" == "$nombre=$valor" ]; then cuenta=$((cuenta+1)); else otro=1; fi
    fi
  done < "$destino"
fi
if [ "$cuenta" -ne 1 ] || [ "$otro" -ne 0 ]; then
  echo "ERROR: despues de escribir, $destino no tiene el renglon de $nombre como corresponde. Revisalo a mano." >&2
  exit 1
fi
chmod 600 "$destino" 2>/dev/null || true

echo "guardado $nombre en $destino"
if [ "$al_env" -eq 0 ]; then
  echo "lo usan los comandos del proyecto; Claude no lo puede leer."
fi
exit 0
