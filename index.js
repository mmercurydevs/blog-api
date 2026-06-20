require("dotenv").config();

// index.js - Ponto de entrada da aplicação
const express = require("express"); // Importa o framework Express
const app = express(); // Cria a instância da aplicação
const port = Number(process.env.PORT) || 3000; // Define a porta em que a API irá rodar

// garante que o db.js conecta
require("./db");

const route = require("./routes/routes");

app.use(express.json());
app.use("/", route);

// Inicia o servidor e exibe o endereço no console
app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}/`);
});
