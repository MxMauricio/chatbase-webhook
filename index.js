const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();
const PORT = 32954; // Puerto fijo para desarrollo local

app.use(bodyParser.json());

// Conexión directa a Railway
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

// Ruta principal
app.get("/", (req, res) => {
  res.send("Servidor Node.js activo");
});

// Ruta GET para consultar clientes
app.get("/api/cliente", (req, res) => {
  const sql = "SELECT idcliente, nombre, direccion, telefono, correoelectronico FROM cliente";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error al obtener clientes:", err);
      return res.status(500).json({ error: "Error al obtener datos" });
    }
    res.json(results);
  });
});

// Ruta POST para guardar datos desde Chatbase
app.post("/guardar-chatbase", (req, res) => {
  const { idcliente, nombre, direccion, telefono, correoelectronico } = req.body;

  const sql = `
    INSERT INTO cliente (idcliente, nombre, direccion, telefono, correoelectronico)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [idcliente, nombre, direccion, telefono, correoelectronico],
    (err, result) => {
      if (err) {
        console.error("❌ Error al insertar en cliente:", err);
        return res.status(500).json({ error: "Error al guardar datos" });
      }
      res.json({
        mensaje: "✅ Cliente guardado correctamente",
        id: result.insertId
      });
    }
  );
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(  "Servidor escuchando en el puerto ${32954}");
});