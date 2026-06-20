// Importa o cliente PostgreSQL para conexão com o banco de dados
const { Pool } = require("pg");

// Configuração de conexão com PostgreSQL
const db = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  max: Number(process.env.DB_MAX),
});

// Conecta ao banco e exibe status no console
db.query("SELECT NOW()")
  .then(() => console.log("Conectado ao PostgreSQL com sucesso!"))
  .catch((err) => console.error("Erro ao conectar ao banco:", err));

module.exports = db; // Exporta a instância do pool para uso em outros módulos
