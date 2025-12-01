require('dotenv').config();
const { testEmailConnection, sendTestEmail } = require('./src/config/email');

async function testEmail() {
  console.log('🧪 Iniciando teste de email...\n');
  
  // Testar conexão SMTP
  console.log('1️⃣ Testando conexão SMTP...');
  const connectionTest = await testEmailConnection();
  console.log('Resultado:', connectionTest);
  console.log('');
  
  // Enviar email de teste
  const testEmail = process.argv[2] || 'coyaye6361@docsfy.com';
  console.log(`2️⃣ Enviando email de teste para: ${testEmail}...`);
  const testResult = await sendTestEmail(testEmail);
  console.log('Resultado:', testResult);
  console.log('');
  
  if (testResult.success) {
    console.log('✅ Teste concluído com sucesso!');
    console.log(`📧 Verifique a caixa de entrada de ${testEmail}`);
  } else {
    console.log('❌ Teste falhou!');
    console.log('Erro:', testResult.message);
  }
  
  process.exit(testResult.success ? 0 : 1);
}

testEmail().catch((error) => {
  console.error('❌ Erro ao executar teste:', error);
  process.exit(1);
});

