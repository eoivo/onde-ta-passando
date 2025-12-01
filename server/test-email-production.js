// Script para testar email em produção via API
// Uso: node test-email-production.js <email> <token>

const API_URL = process.env.API_URL || 'https://onde-ta-passando.onrender.com/api';
const email = process.argv[2];
const token = process.argv[3];

if (!email) {
  console.error('❌ Por favor, forneça um email como argumento');
  console.log('Uso: node test-email-production.js <email> <token>');
  process.exit(1);
}

if (!token) {
  console.error('❌ Por favor, forneça um token de autenticação');
  console.log('Uso: node test-email-production.js <email> <token>');
  console.log('\nPara obter o token, faça login na aplicação e copie o token do localStorage');
  process.exit(1);
}

async function testEmailProduction() {
  console.log('🧪 Testando email em produção...\n');
  console.log(`API: ${API_URL}`);
  console.log(`Email: ${email}\n`);

  try {
    const response = await fetch(`${API_URL}/auth/test-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Teste concluído com sucesso!');
      console.log('Resultado:', JSON.stringify(data, null, 2));
      console.log(`\n📧 Verifique a caixa de entrada de ${email}`);
    } else {
      console.log('❌ Teste falhou!');
      console.log('Erro:', data.message || 'Erro desconhecido');
      console.log('Resposta completa:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Erro ao fazer requisição:', error.message);
    process.exit(1);
  }
}

testEmailProduction();

