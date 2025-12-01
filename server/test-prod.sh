#!/bin/bash
# Script para testar email em produção
# Uso: ./test-prod.sh <email> <token>

API_URL="https://onde-ta-passando.onrender.com/api"
EMAIL=${1:-"coyaye6361@docsfy.com"}
TOKEN=${2}

if [ -z "$TOKEN" ]; then
  echo "❌ Token não fornecido!"
  echo ""
  echo "Uso: ./test-prod.sh <email> <token>"
  echo ""
  echo "Para obter o token:"
  echo "1. Acesse https://onde-ta-passando.netlify.app"
  echo "2. Faça login"
  echo "3. Abra o Console (F12)"
  echo "4. Execute: localStorage.getItem('auth_token')"
  echo "5. Copie o token e use no comando"
  exit 1
fi

echo "🧪 Testando email em produção..."
echo "API: $API_URL"
echo "Email: $EMAIL"
echo ""

curl -X POST "$API_URL/auth/test-email" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"email\": \"$EMAIL\"}" \
  -w "\n\nStatus: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || cat

echo ""
echo "✅ Teste concluído! Verifique os logs acima."

