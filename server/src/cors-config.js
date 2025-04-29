/**
 * Configuração CORS para o servidor
 * Permite controlar quais origens podem acessar a API
 */

const corsConfig = {
  // Em produção, permite apenas o domínio específico do Netlify
  // Em desenvolvimento, permite localhost:3000
  origin:
    process.env.NODE_ENV === "production"
      ? ["https://onde-ta-passando.netlify.app"]
      : ["http://localhost:3000"],

  // Permite credenciais (cookies, cabeçalhos de autorização)
  credentials: true,

  // Métodos HTTP permitidos
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

  // Cabeçalhos permitidos
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],

  // Tempo máximo de cache para resultados preflight
  maxAge: 86400, // 24 horas

  // Status de sucesso para requisições OPTIONS (preflight)
  optionsSuccessStatus: 200,
};

module.exports = corsConfig;
