const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();
const PORT = 32954; // Puerto fijo para desarrollo local

app.use(bodyParser.json());

// Conexión directa a Railway (sin variables de entorno)
const db = mysql.createConnection({
  host: "maglev.proxy.rlwy.net",
  user: "root",
  password: "JxiCbysurppuOQMtapVyaPUdboxSVqIO",
  database: "railway",
  port: 32954
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
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});
