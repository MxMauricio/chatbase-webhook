const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 32954; 

app.use(bodyParser.json());

// Conexión a Railway con variables de entorno (o valores por defecto)
const db = mysql.createConnection({
  host: process.env.DB_HOST || "maglev.proxy.rlwy.net",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "JxiCbysurppuOQMtapVyaPUdboxSVqIO",
  database: process.env.DB_NAME || "railway",
  port: process.env.DB_PORT || 32954 // 
});

db.connect((err) => {
  if (err) {
    console.error("❌ Error al conectar a MySQL:", err);
  } else {
    console.log("✅ Conexión exitosa a MySQL");
  }
});

// Ruta simple
app.get("/", (req, res) => {
  res.send("Servidor Node.js activo");
});

// Ruta para consultar clientes
app.get('/api/cliente', (req, res) => {
  const sql = "SELECT idcliente, nombre, direccion, telefono, correoelectronico FROM cliente";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error al obtener clientes:", err);
      return res.status(500).json({ error: 'Error al obtener datos' });
    }
    res.json(results);
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${32954}`);
});
