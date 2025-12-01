const sgMail = require('@sendgrid/mail');

// Configurar API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Envia email usando SendGrid
 * Funciona em produção (Render) sem bloqueio de portas SMTP
 */
const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const msg = {
            to,
            from: {
                email: process.env.SENDGRID_FROM_EMAIL || 'ondetapassando@gmail.com',
                name: process.env.SENDGRID_FROM_NAME || 'Onde Tá Passando?'
            },
            subject,
            text,
            html,
        };

        const response = await sgMail.send(msg);
        console.log(`✅ Email enviado via SendGrid: ${response[0].statusCode} - Para: ${to}`);
        return true;
    } catch (error) {
        console.error('❌ Erro ao enviar email via SendGrid:', error);
        if (error.response) {
            console.error('Detalhes do erro:', error.response.body);
        }
        throw error;
    }
};

// Função para enviar email de reset de senha
const sendPasswordResetEmail = async (email, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/redefinir-senha/${resetToken}`;

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #1a1a1a;
            border-radius: 10px;
            padding: 30px;
            color: #fff;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            color: #ef4444;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .content {
            background-color: #2a2a2a;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #ef4444;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .button:hover {
            background-color: #dc2626;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #888;
          }
          .warning {
            background-color: #3a3a3a;
            padding: 15px;
            border-left: 4px solid #ef4444;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎬 Onde Tá Passando?</div>
          </div>
          
          <div class="content">
            <h2 style="color: #ef4444; margin-top: 0;">Redefinição de Senha</h2>
            
            <p>Olá!</p>
            
            <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Onde Tá Passando?</strong>.</p>
            
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Redefinir Senha</a>
            </div>
            
            <p>Ou copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; color: #888; font-size: 12px;">${resetUrl}</p>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Este link expira em <strong>10 minutos</strong></li>
                <li>Se você não solicitou esta redefinição, ignore este email</li>
                <li>Nunca compartilhe este link com outras pessoas</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>Este é um email automático, por favor não responda.</p>
            <p>&copy; ${new Date().getFullYear()} Onde Tá Passando? - Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `;

    const text = `
    Redefinição de Senha - Onde Tá Passando?
    
    Olá!
    
    Recebemos uma solicitação para redefinir a senha da sua conta.
    
    Clique no link abaixo para criar uma nova senha:
    ${resetUrl}
    
    Este link expira em 10 minutos.
    
    Se você não solicitou esta redefinição, ignore este email.
    
    Este é um email automático, por favor não responda.
  `;

    return sendEmail({
        to: email,
        subject: 'Redefinição de Senha - Onde Tá Passando?',
        html,
        text,
    });
};

// Função para enviar email de boas-vindas
const sendWelcomeEmail = async (email, name) => {
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #1a1a1a;
            border-radius: 10px;
            padding: 30px;
            color: #fff;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            color: #ef4444;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .content {
            background-color: #2a2a2a;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #ef4444;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .button:hover {
            background-color: #dc2626;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #888;
          }
          .features {
            background-color: #3a3a3a;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
          }
          .features ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          .features li {
            margin: 8px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎬 Onde Tá Passando?</div>
          </div>
          
          <div class="content">
            <h2 style="color: #ef4444; margin-top: 0;">Bem-vindo, ${name}!</h2>
            
            <p>Ficamos muito felizes em ter você conosco! 🎉</p>
            
            <p>Sua conta foi criada com sucesso no <strong>Onde Tá Passando?</strong>, a plataforma que te ajuda a descobrir onde assistir seus filmes e séries favoritos.</p>
            
            <div class="features">
              <h3 style="color: #ef4444; margin-top: 0;">O que você pode fazer:</h3>
              <ul>
                <li>🔍 Descobrir onde seus filmes e séries estão disponíveis</li>
                <li>❤️ Salvar seus favoritos</li>
                <li>📝 Criar listas personalizadas</li>
                <li>🎯 Receber recomendações personalizadas</li>
                <li>💬 Conversar com nossa assistente sobre filmes</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}" class="button">Começar a Explorar</a>
            </div>
            
            <p style="margin-top: 20px; color: #888; font-size: 14px;">
              Se você tiver alguma dúvida ou precisar de ajuda, estamos aqui para você!
            </p>
          </div>
          
          <div class="footer">
            <p>Este é um email automático, por favor não responda.</p>
            <p>&copy; ${new Date().getFullYear()} Onde Tá Passando? - Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `;

    const text = `
    Bem-vindo ao Onde Tá Passando? 🎬
    
    Olá, ${name}!
    
    Ficamos muito felizes em ter você conosco!
    
    Sua conta foi criada com sucesso no Onde Tá Passando?, a plataforma que te ajuda a descobrir onde assistir seus filmes e séries favoritos.
    
    O que você pode fazer:
    - Descobrir onde seus filmes e séries estão disponíveis
    - Salvar seus favoritos
    - Criar listas personalizadas
    - Receber recomendações personalizadas
    - Conversar com nossa assistente sobre filmes
    
    Acesse: ${process.env.FRONTEND_URL || "http://localhost:3000"}
    
    Se você tiver alguma dúvida ou precisar de ajuda, estamos aqui para você!
    
    Este é um email automático, por favor não responda.
  `;

    try {
        return await sendEmail({
            to: email,
            subject: 'Bem-vindo ao Onde Tá Passando? 🎬',
            html,
            text,
        });
    } catch (error) {
        console.error('Erro ao enviar email de boas-vindas:', error);
        return false; // Não quebra cadastro se email falhar
    }
};

module.exports = {
    sendPasswordResetEmail,
    sendWelcomeEmail,
};
