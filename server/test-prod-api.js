// Script para testar email diretamente na API de produção
const API_URL = 'https://onde-ta-passando.onrender.com/api';
const email = process.argv[2] || 'coyaye6361@docsfy.com';

console.log('🧪 Testando email em produção via API...\n');
console.log(`API: ${API_URL}`);
console.log(`Email de teste: ${email}\n`);

async function testEmailProduction() {
  try {
    // Primeiro, tentar fazer login para obter token
    // Nota: Você precisa fornecer email e senha válidos
    console.log('1️⃣ Tentando fazer login...');
    
    // Se você tiver as credenciais, descomente e ajuste:
    /*
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'SEU_EMAIL',
        password: 'SUA_SENHA'
      })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.token) {
      console.error('❌ Falha no login:', loginData.message);
      return;
    }
    
    const token = loginData.token;
    */
    
    // Alternativa: Usar token diretamente se você já tiver
    const token = process.argv[3];
    
    if (!token) {
      console.error('❌ Token não fornecido!');
      console.log('\nOpções:');
      console.log('1. Forneça o token como segundo argumento:');
      console.log('   node test-prod-api.js coyaye6361@docsfy.com SEU_TOKEN');
      console.log('\n2. Ou faça login e copie o token do localStorage do navegador');
      console.log('   (F12 > Application > Local Storage > auth_token)');
      return;
    }
    
    console.log('✅ Token obtido\n');
    
    // Testar email
    console.log('2️⃣ Testando envio de email...');
    const response = await fetch(`${API_URL}/auth/test-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    
    console.log('\n📊 Resultado:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n✅ Teste concluído com sucesso!');
      console.log(`📧 Verifique a caixa de entrada de ${email}`);
    } else {
      console.log('\n❌ Teste falhou!');
      console.log('Erro:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar:', error.message);
    console.error(error);
  }
}

testEmailProduction();

