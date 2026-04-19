const mongoose = require("mongoose");

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/restaurante";
    
    await mongoose.connect(mongoUri);

    isConnected = true;
    // eslint-disable-next-line no-console
    console.log("Conectado ao MongoDB com sucesso");
    return mongoose.connection;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Erro ao conectar MongoDB:", error.message);
    process.exit(1);
  }
}

function getDB() {
  if (!isConnected) {
    throw new Error("Banco de dados não conectado. Execute connectDB primeiro.");
  }
  return mongoose.connection;
}

module.exports = { connectDB, getDB, mongoose };
