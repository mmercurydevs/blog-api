const { Pool } = require("pg");

const db = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  max: Number(process.env.DB_MAX),
});

// Eagerly validates the connection at startup so a misconfigured .env fails fast.
db.query("SELECT NOW()")
  .then(() => console.log("Connected to PostgreSQL."))
  .catch((err) => console.error("Database connection error:", err));

module.exports = db;
