const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();
const PORT = 32954;

app.use(bodyParser.json());

// Conexion a Railway
const db = mysql.createConnection({
  host: "maglev.proxy.rlwy.net",
  user: "root",
  password: "JxiCbysurppuOQMtapVyaPUdboxSVqIO",
  database: "railway",
  port: 32954
});

// 📡 Verificar conexión
db.connect((err) => {
  if (err) {
    console.error("❌ Error de conexión a la base de datos:", err);
  } else {
    console.log("✅ Conectado a la base de datos MySQL.");
  }
});

// 🚀 Ruta para guardar datos desde Chatbase
app.post("/guardar-chatbase", (req, res) => {
  const {
    nombre,
    telefono,
    correoelectronico,
    tipo_producto,   
    subcategoria,    
    millares
  } = req.body;

  const cantidad = parseInt(millares);

  // Paso 1: Insertar cliente
  const sqlCliente = `
    INSERT INTO Clientes (nombre, telefono, correo)
    VALUES (?, ?, ?)
  `;

  db.query(sqlCliente, [nombre, telefono, correoelectronico], (err, resultCliente) => {
    if (err) {
      console.error("❌ Error al insertar cliente:", err);
      return res.status(500).json({ error: "Error al guardar cliente" });
    }

    const id_cliente = resultCliente.insertId;

    // Paso 2: Buscar producto desde subcategoría
    const sqlProducto = `
      SELECT p.id_producto, p.precio_unitario
      FROM Productos p
      JOIN Catalogo c ON c.id_producto = p.id_producto
      JOIN ${subcategoria} s ON s.id_catalogo = c.id_catalogo
      WHERE s.${tipo_producto} = TRUE
      LIMIT 1
    `;

    db.query(sqlProducto, (err, rowsProducto) => {
      if (err || rowsProducto.length === 0) {
        console.error("❌ Producto no encontrado:", err);
        return res.status(404).json({ error: "Producto no encontrado en catálogo" });
      }

      const { id_producto, precio_unitario } = rowsProducto[0];
      const subtotal = precio_unitario * cantidad;

      // Paso 3: Insertar pedido
      const sqlPedido = `
        INSERT INTO Pedidos (fecha_pedido, fecha_entrega, id_cliente)
        VALUES (CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), ?)
      `;

      db.query(sqlPedido, [id_cliente], (err, resultPedido) => {
        if (err) {
          console.error("❌ Error al insertar pedido:", err);
          return res.status(500).json({ error: "Error al crear pedido" });
        }

        const id_pedido = resultPedido.insertId;

        // Paso 4: Insertar detalle del pedido
        const sqlDetalle = `
          INSERT INTO Detalle_Pedido (id_pedido, id_producto, cantidad, subtotal)
          VALUES (?, ?, ?, ?)
        `;

        db.query(sqlDetalle, [id_pedido, id_producto, cantidad, subtotal], (err) => {
          if (err) {
            console.error("❌ Error al insertar detalle:", err);
            return res.status(500).json({ error: "Error al guardar detalle del pedido" });
          }

          res.json({
            mensaje: "✅ Cliente y pedido registrados correctamente",
            cliente: { id_cliente, nombre },
            producto: { id_producto, subcategoria, tipo_producto },
            cantidad,
            subtotal
          });
        });
      });
    });
  });
});

// 🟢 Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
