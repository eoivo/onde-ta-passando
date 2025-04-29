const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");
const corsConfig = require("./cors-config");

dotenv.config();

connectDB();

const tmpDir = path.join(__dirname, "../tmp");
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
  console.log("Pasta tmp criada com sucesso");
}

const app = express();

console.log(`NODE_ENV atual: ${process.env.NODE_ENV || "não definido"}`);
console.log(`Configuração CORS: ${JSON.stringify(corsConfig)}`);

app.use(cors(corsConfig));

app.use(express.json());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "../tmp/"),
  })
);

app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} - ${req.method} ${req.url} - Origem: ${
      req.headers.origin || "Desconhecida"
    }`
  );

  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

app.get("/", (req, res) => {
  res.json({
    message: "API do Onde Tá Passando está rodando",
    environment: process.env.NODE_ENV || "development",
    time: new Date().toISOString(),
    cors: {
      enabled: true,
      origins: Array.isArray(corsConfig.origin)
        ? corsConfig.origin
        : [corsConfig.origin],
    },
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
