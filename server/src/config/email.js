const nodemailer = require("nodemailer");

// Função para limpar variáveis de ambiente (remove aspas e espaços)
const cleanEnvVar = (value) => {
  if (!value) return value;
  return value.toString().replace(/^["']|["']$/g, '').trim();
};

// Obter e limpar variáveis de ambiente
const smtpUser = cleanEnvVar(process.env.SMTP_USER);
const smtpPass = cleanEnvVar(process.env.SMTP_PASS);
const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = parseInt(process.env.SMTP_PORT) || 587;

// Log de configuração (sem mostrar senha completa)
if (process.env.NODE_ENV === 'production') {
  console.log(`Configuração SMTP: ${smtpHost}:${smtpPort}, User: ${smtpUser}, Pass: ${smtpPass ? '***' + smtpPass.slice(-3) : 'não definido'}`);
}

// Função para criar transporter (tenta múltiplas configurações)
const createTransporter = () => {
  // Tentar porta 465 com SSL primeiro (menos bloqueada em produção)
  if (smtpPort === 465 || !smtpPort) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: 465,
      secure: true, // SSL
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      connectionTimeout: 30000, // 30 segundos
      greetingTimeout: 30000,
      socketTimeout: 30000,
      tls: {
        rejectUnauthorized: false, // Aceitar certificados auto-assinados
      },
    });
  }
  
  // Porta 587 com STARTTLS
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: false, // STARTTLS
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    connectionTimeout: 30000, // 30 segundos
    greetingTimeout: 30000,
    socketTimeout: 30000,
    tls: {
      rejectUnauthorized: false, // Aceitar certificados auto-assinados
      ciphers: 'SSLv3', // Forçar ciphers compatíveis
    },
    requireTLS: true, // Forçar TLS
  });
};

// Criar transporter de email
const transporter = createTransporter();

// Não verificar conexão na inicialização (pode causar timeout em produção)
// A verificação será feita automaticamente quando o primeiro email for enviado
// Isso evita problemas de rede/firewall durante o deploy

// Função para enviar email de reset de senha
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/redefinir-senha/${resetToken}`;

  const mailOptions = {
    from: `"Onde Tá Passando?" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Redefinição de Senha - Onde Tá Passando?",
    html: `
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
    `,
    text: `
      Redefinição de Senha - Onde Tá Passando?
      
      Olá!
      
      Recebemos uma solicitação para redefinir a senha da sua conta.
      
      Clique no link abaixo para criar uma nova senha:
      ${resetUrl}
      
      Este link expira em 10 minutos.
      
      Se você não solicitou esta redefinição, ignore este email.
      
      Este é um email automático, por favor não responda.
    `,
  };

  try {
    // Tentar enviar com timeout de 30 segundos
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timeout ao enviar email (30s)")), 30000);
    });
    
    await Promise.race([sendPromise, timeoutPromise]);
    console.log(`✅ Email de reset enviado para: ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Erro ao enviar email de reset:", error.message);
    console.error("Detalhes:", {
      email,
      errorCode: error.code,
      errorCommand: error.command,
      errorResponse: error.response,
    });
    
    // Se falhar com porta 587, tentar porta 465
    if (smtpPort === 587 && error.code !== 'ETIMEDOUT') {
      console.log("🔄 Tentando reenviar com porta 465 (SSL)...");
      try {
        const sslTransporter = nodemailer.createTransport({
          host: smtpHost,
          port: 465,
          secure: true,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
          connectionTimeout: 30000,
          greetingTimeout: 30000,
          socketTimeout: 30000,
          tls: {
            rejectUnauthorized: false,
          },
        });
        
        await sslTransporter.sendMail(mailOptions);
        console.log(`✅ Email de reset enviado via SSL para: ${email}`);
        return true;
      } catch (sslError) {
        console.error("❌ Erro ao enviar via SSL:", sslError.message);
        throw error; // Lançar erro original
      }
    }
    
    throw error;
  }
};

// Função para enviar email de boas-vindas
const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: `"Onde Tá Passando?" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Bem-vindo ao Onde Tá Passando? 🎬",
    html: `
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
    `,
    text: `
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
    `,
  };

  try {
    // Tentar enviar com timeout de 30 segundos
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timeout ao enviar email (30s)")), 30000);
    });
    
    await Promise.race([sendPromise, timeoutPromise]);
    console.log(`✅ Email de boas-vindas enviado para: ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Erro ao enviar email de boas-vindas:", error.message);
    console.error("Detalhes:", {
      email,
      errorCode: error.code,
      errorCommand: error.command,
      errorResponse: error.response,
    });
    
    // Se falhar com porta 587, tentar porta 465
    if (smtpPort === 587 && error.code !== 'ETIMEDOUT') {
      console.log("🔄 Tentando reenviar com porta 465 (SSL)...");
      try {
        const sslTransporter = nodemailer.createTransport({
          host: smtpHost,
          port: 465,
          secure: true,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
          connectionTimeout: 30000,
          greetingTimeout: 30000,
          socketTimeout: 30000,
          tls: {
            rejectUnauthorized: false,
          },
        });
        
        await sslTransporter.sendMail(mailOptions);
        console.log(`✅ Email de boas-vindas enviado via SSL para: ${email}`);
        return true;
      } catch (sslError) {
        console.error("❌ Erro ao enviar via SSL:", sslError.message);
        // Não lançar erro para não quebrar o cadastro
        return false;
      }
    }
    
    // Não lançar erro para não quebrar o cadastro se o email falhar
    return false;
  }
};

// Função para testar conexão SMTP (útil para debug)
const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log("✅ Conexão SMTP verificada com sucesso");
    return { success: true, message: "Conexão SMTP OK" };
  } catch (error) {
    console.error("❌ Erro ao verificar conexão SMTP:", error.message);
    return { success: false, message: error.message, error };
  }
};

// Função para enviar email de teste
const sendTestEmail = async (toEmail) => {
  const mailOptions = {
    from: `"Onde Tá Passando?" <${smtpUser}>`,
    to: toEmail,
    subject: "Teste de Email - Onde Tá Passando?",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #1a1a1a; color: #fff;">
        <h2 style="color: #ef4444;">Teste de Email</h2>
        <p>Este é um email de teste enviado do servidor de produção.</p>
        <p>Se você recebeu este email, a configuração SMTP está funcionando corretamente! ✅</p>
        <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
      </div>
    `,
    text: `Teste de Email - Onde Tá Passando?\n\nEste é um email de teste. Se você recebeu este email, a configuração SMTP está funcionando!`,
  };

  try {
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timeout ao enviar email de teste (30s)")), 30000);
    });
    
    await Promise.race([sendPromise, timeoutPromise]);
    console.log(`✅ Email de teste enviado para: ${toEmail}`);
    return { success: true, message: `Email de teste enviado para ${toEmail}` };
  } catch (error) {
    console.error("❌ Erro ao enviar email de teste:", error.message);
    return { success: false, message: error.message, error };
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  testEmailConnection,
  sendTestEmail,
};

