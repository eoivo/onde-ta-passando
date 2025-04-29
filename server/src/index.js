const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");

// Carrega variáveis de ambiente
dotenv.config();

// Conecta ao banco de dados
connectDB();

// Garantir que a pasta tmp existe
const tmpDir = path.join(__dirname, "../tmp");
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
  console.log("Pasta tmp criada com sucesso");
}

const app = express();

// Log do ambiente atual
console.log(`NODE_ENV atual: ${process.env.NODE_ENV || "não definido"}`);

// Configuração CORS mais permissiva
app.use(
  cors({
    origin: "*", // Permite todas as origens (temporariamente para diagnóstico)
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 200,
  })
);

// Middleware
app.use(express.json());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "../tmp/"),
  })
);

// Log de requisições
app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} - ${req.method} ${req.url} - Origem: ${
      req.headers.origin || "Desconhecida"
    }`
  );
  next();
});

// Rotas
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

// Rota de teste
app.get("/", (req, res) => {
  res.json({
    message: "API do Onde Tá Passando está rodando",
    environment: process.env.NODE_ENV || "development",
    time: new Date().toISOString(),
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
