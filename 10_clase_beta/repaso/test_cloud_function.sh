#!/usr/bin/env bash
# Prueba la Edge Function ai-crud con curl (paso 6 de CRUD_IA_PASO_A_PASO.md).
# Solo pide propuestas: la función NO escribe en la base, así que es seguro correrlo.
#
# Uso:
#   ./test_cloud_function.sh
#   ADMIN_EMAIL=admin@mail.com ADMIN_PASSWORD=xxx ./test_cloud_function.sh
#   USER_EMAIL=user@mail.com USER_PASSWORD=xxx ./test_cloud_function.sh   # agrega la prueba 403
#
# Variables leídas de .env: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.

set -uo pipefail

cd "$(dirname "$0")"

for cmd in curl jq; do
  command -v "$cmd" >/dev/null || { echo "Falta '$cmd'. Instalalo y volvé a intentar."; exit 1; }
done

[ -f .env ] || { echo "No existe .env en $(pwd)"; exit 1; }
set -a
# shellcheck disable=SC1091
source .env
set +a

URL="${VITE_SUPABASE_URL:?Falta VITE_SUPABASE_URL en .env}"
ANON="${VITE_SUPABASE_ANON_KEY:?Falta VITE_SUPABASE_ANON_KEY en .env}"
URL="${URL%/}"
FN_URL="$URL/functions/v1/ai-crud"

if [ -z "${ADMIN_EMAIL:-}" ]; then read -rp "Email admin: " ADMIN_EMAIL; fi
if [ -z "${ADMIN_PASSWORD:-}" ]; then read -rsp "Password admin: " ADMIN_PASSWORD; echo; fi

PASS=0
FAIL=0
STATUS=""
BODY=""

ok()   { echo "  ✔ $1"; PASS=$((PASS + 1)); }
fail() { echo "  ✘ $1"; FAIL=$((FAIL + 1)); }

# Ejecuta curl y separa body y status HTTP en $BODY y $STATUS
request() {
  local out
  out=$(curl -s --max-time 40 -w $'\n%{http_code}' "$@")
  STATUS="${out##*$'\n'}"
  BODY="${out%$'\n'*}"
}

# Deja el access_token en $LOGIN_TOKEN (sin subshell, para conservar $STATUS y $BODY)
login() {
  LOGIN_TOKEN=""
  request -X POST "$URL/auth/v1/token?grant_type=password" \
    -H "apikey: $ANON" -H "Content-Type: application/json" \
    -d "$(jq -n --arg e "$1" --arg p "$2" '{email: $e, password: $p}')"
  if [ "$STATUS" = "200" ]; then LOGIN_TOKEN=$(echo "$BODY" | jq -r '.access_token // empty'); fi
}

# Llama a la función con una instrucción (o un body JSON crudo con $3)
call_fn() {
  local token="$1" instruccion="$2" body="${3:-}"
  [ -n "$body" ] || body=$(jq -n --arg i "$instruccion" '{instruccion: $i}')
  request -X POST "$FN_URL" \
    -H "Authorization: Bearer $token" -H "apikey: $ANON" \
    -H "Content-Type: application/json" -d "$body"
}

expect_status() {
  local name="$1" expected="$2"
  if [ "$STATUS" = "$expected" ]; then
    ok "$name → $STATUS $(echo "$BODY" | jq -c '.error // .propuesta.accion // empty' 2>/dev/null)"
  else
    fail "$name → esperado $expected, recibido $STATUS: $BODY"
  fi
}

expect_accion() {
  local name="$1" expected="$2" accion
  accion=$(echo "$BODY" | jq -r '.propuesta.accion // empty' 2>/dev/null)
  if [ "$STATUS" = "200" ] && [ "$accion" = "$expected" ]; then
    ok "$name → $accion: $(echo "$BODY" | jq -r '.propuesta.explicacion')"
  else
    fail "$name → esperado accion '$expected', recibido $STATUS: $BODY"
  fi
}

echo "== 1) Login admin"
login "$ADMIN_EMAIL" "$ADMIN_PASSWORD"
TOKEN="$LOGIN_TOKEN"
if [ -z "$TOKEN" ]; then
  echo "  ✘ Login falló ($STATUS): $BODY"
  exit 1
fi
ok "access_token obtenido"

echo "== 2) Producto real para las pruebas"
request "$URL/rest/v1/productos?select=id,nombre,precio&order=nombre&limit=1" \
  -H "apikey: $ANON" -H "Authorization: Bearer $TOKEN"
PRODUCTO=$(echo "$BODY" | jq -r '.[0].nombre // empty' 2>/dev/null)
if [ -z "$PRODUCTO" ]; then
  echo "  ✘ No hay productos en la tabla ($STATUS): $BODY"
  exit 1
fi
ok "Usando '$PRODUCTO'"

echo "== 3) HTTP y validación de entrada"
request -X OPTIONS "$FN_URL" -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST"
expect_status "OPTIONS (CORS preflight)" 200

request -X GET "$FN_URL" -H "Authorization: Bearer $TOKEN" -H "apikey: $ANON"
expect_status "GET no permitido" 405

request -X POST "$FN_URL" -H "apikey: $ANON" -H "Content-Type: application/json" \
  -d '{"instruccion":"hola"}'
expect_status "Sin token" 401

call_fn "$ANON" "Borrá $PRODUCTO"
expect_status "Token = anon key" 401

call_fn "$TOKEN" "" '{"instruccion":"   "}'
expect_status "Instrucción vacía" 400

call_fn "$TOKEN" "$(printf 'a%.0s' {1..501})"
expect_status "Instrucción > 500 caracteres" 400

echo "== 4) CRUD con IA (solo propuestas, no modifica la base)"
call_fn "$TOKEN" "Agregá un producto Test IA CLI a 1234, categoría pruebas"
expect_accion "Crear" crear

call_fn "$TOKEN" "Subí el precio de $PRODUCTO a 10500"
expect_accion "Actualizar" actualizar
if echo "$BODY" | jq -e '.propuesta.actual | has("imagen")' >/dev/null 2>&1; then
  ok "propuesta.actual incluye 'imagen'"
else
  fail "propuesta.actual NO incluye 'imagen' (el update borraría la imagen)"
fi

call_fn "$TOKEN" "Borrá $PRODUCTO"
expect_accion "Eliminar" eliminar

call_fn "$TOKEN" "¿Cuál es la capital de Francia?"
expect_accion "Fuera de tema" ninguna

call_fn "$TOKEN" "Borrá todo"
expect_accion "Instrucción masiva" ninguna

call_fn "$TOKEN" "Borrá el producto Mesa Voladora"
# La IA puede rechazarlo ella misma (ninguna) o inventar un id (422): ambos son seguros
if [ "$STATUS" = "422" ] || [ "$(echo "$BODY" | jq -r '.propuesta.accion // empty')" = "ninguna" ]; then
  ok "Producto inexistente → $STATUS $(echo "$BODY" | jq -c '.error // .propuesta.accion')"
else
  fail "Producto inexistente → esperado 422 o ninguna, recibido $STATUS: $BODY"
fi

echo "== 5) Usuario no admin"
if [ -n "${USER_EMAIL:-}" ] && [ -n "${USER_PASSWORD:-}" ]; then
  login "$USER_EMAIL" "$USER_PASSWORD"
  if [ -n "$LOGIN_TOKEN" ]; then
    call_fn "$LOGIN_TOKEN" "Borrá $PRODUCTO"
    expect_status "No admin" 403
  else
    fail "Login del usuario no admin falló ($STATUS): $BODY"
  fi
else
  echo "  - Omitido: definí USER_EMAIL y USER_PASSWORD para probar el 403"
fi

echo
echo "Resultado: $PASS OK, $FAIL fallidas"
[ "$FAIL" -eq 0 ]
