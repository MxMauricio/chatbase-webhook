const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000; // IMPORTANTE para Render

app.use(bodyParser.json());

// ⚠️ En Render debes usar variables de entorno para los datos de conexión
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "graficosadolfo"
});

db.connect((err) => {
  if (err) {
    console.error("❌ Error al conectar a MySQL:", err);
  } else {
    console.log("✅ Conexión exitosa a MySQL");
  }
});

// Ruta simple para comprobar que funciona
app.get("/", (req, res) => {
  res.send("Servidor Node.js activo");
});

// Corrige SELECT (quita coma final)
app.get('/api/cliente', (req, res) => {
  const sql = "SELECT
