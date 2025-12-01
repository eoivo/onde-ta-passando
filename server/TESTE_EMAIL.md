# Como Testar o Email em Produção

## Opção 1: Via Console do Navegador (Mais Fácil)

1. Acesse https://onde-ta-passando.netlify.app
2. Faça login na sua conta
3. Abra o Console do navegador (F12)
4. Execute o seguinte código:

```javascript
// Obter token do localStorage
const token = localStorage.getItem('auth_token');

// Testar email
fetch('https://onde-ta-passando.onrender.com/api/auth/test-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    email: 'coyaye6361@docsfy.com'
  })
})
.then(res => res.json())
.then(data => {
  console.log('✅ Resultado:', data);
  if (data.success) {
    alert('Email de teste enviado com sucesso!');
  } else {
    alert('Erro: ' + data.message);
  }
})
.catch(err => {
  console.error('❌ Erro:', err);
  alert('Erro ao testar email');
});
```

## Opção 2: Via Script Node.js

1. Obtenha seu token de autenticação (faça login e copie do localStorage)
2. Execute:

```bash
cd server
node test-email-production.js coyaye6361@docsfy.com SEU_TOKEN_AQUI
```

## Opção 3: Via Postman/Insomnia

1. Faça login e obtenha o token
2. Crie uma requisição POST para:
   - URL: `https://onde-ta-passando.onrender.com/api/auth/test-email`
   - Headers:
     - `Content-Type: application/json`
     - `Authorization: Bearer SEU_TOKEN`
   - Body (JSON):
     ```json
     {
       "email": "coyaye6361@docsfy.com"
     }
     ```

## Resultado Esperado

Se tudo estiver funcionando, você verá:
- ✅ Conexão SMTP verificada
- ✅ Email de teste enviado
- Email na caixa de entrada de `coyaye6361@docsfy.com`

