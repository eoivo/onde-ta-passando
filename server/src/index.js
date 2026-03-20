const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");
const corsConfig = require("./cors-config");
const rateLimit = require("express-rate-limit");

dotenv.config();

connectDB();

const tmpDir = path.join(__dirname, "../tmp");
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

const app = express();

// [FIX A-01] Helmet — adiciona ~12 headers de segurança automaticamente
app.use(helmet());

// CORS configurado de forma segura (apenas domínios autorizados)
app.use(cors(corsConfig));

app.use(express.json());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "../tmp/"),
  })
);

// Middleware de log de requisições (sem expor config sensível)
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(
      `${new Date().toISOString()} - ${req.method} ${req.url} - Origem: ${
        req.headers.origin || "Desconhecida"
      }`
    );
  }
  next();
});

// [FIX A-02] Rate limit específico para rotas de autenticação (brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Apenas 10 tentativas a cada 15 min por IP
  message: {
    success: false,
    message: "Muitas tentativas. Aguarde 15 minutos e tente novamente.",
  },
  skipSuccessfulRequests: true, // Não penaliza logins bem-sucedidos
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit global para todas as rotas de API
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200,
  message: {
    success: false,
    message: "Muitas requisições vindas deste IP, tente novamente em 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", globalLimiter);

// [FIX A-02] Aplicar rate limit rígido especificamente em auth
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgotpassword", authLimiter);

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));

app.get("/", (req, res) => {
  res.json({
    message: "API do Onde Tá Passando está rodando",
    environment: process.env.NODE_ENV || "development",
  });
});

// [FIX C-03] Handler de erro global — nunca expõe stack trace em produção
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Erro interno do servidor"
        : err.message,
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(
    `Servidor rodando na porta ${PORT} em ambiente ${
      process.env.NODE_ENV || "development"
    }`
  );
});
