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

// Configuração CORS
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? ["https://onde-ta-passando.netlify.app"]
      : ["http://localhost:3000"],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "../tmp/"),
  })
);

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
