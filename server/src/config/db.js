const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(
      `MongoDB conectado: ${connection.connection.host} (${connection.connection.name})`
    );
  } catch (error) {
    console.error(`Erro na conexão com MongoDB: ${error.message}`);
    // Em produção, não encerrar o processo, tentar reconectar
    if (process.env.NODE_ENV === "production") {
      console.log("Tentando reconectar em 5 segundos...");
      setTimeout(connectDB, 5000);
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
