const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// 📡 Conexión a Railway
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
    console.log("✅ Conectado a MySQL");
  }
});

// ✅ Ruta para guardar datos desde Chatbase
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

// ✅ Clientes
app.get("/api/cliente", (req, res) => {
  const sql = "SELECT id_cliente, nombre, telefono, correo FROM Clientes";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error al obtener clientes:", err);
      return res.status(500).json({ error: "Error al obtener datos" });
    }
    res.json(results);
  });
});

// ✅ Productos más vendidos
app.get("/api/productos-mas-vendidos", (req, res) => {
  const sql = `
    SELECT p.descripcion, SUM(dp.cantidad) AS total_vendidos
    FROM Detalle_Pedido dp
    JOIN Productos p ON dp.id_producto = p.id_producto
    GROUP BY p.descripcion
    ORDER BY total_vendidos DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error al obtener productos más vendidos:", err);
      return res.status(500).json({ error: "Error al consultar productos" });
    }
    res.json(results);
  });
});

// ✅ Información recabada
app.get("/api/info-recabada", (req, res) => {
  const sql = `
    SELECT c.id_cliente, c.telefono, c.correo,
           p.descripcion AS tipo_producto,
           CASE
             WHEN pc.id_catalogo IS NOT NULL THEN 'Papeleria_Corporativa'
             WHEN mp.id_catalogo IS NOT NULL THEN 'Material_Promocional'
             WHEN pub.id_catalogo IS NOT NULL THEN 'Publicidad'
             WHEN se.id_catalogo IS NOT NULL THEN 'Sector_Educativo'
             ELSE 'Sin categoría'
           END AS subcategoria,
           p.precio_unitario AS precio,
           pe.fecha_pedido
    FROM Clientes c
    JOIN Pedidos pe ON pe.id_cliente = c.id_cliente
    JOIN Detalle_Pedido dp ON dp.id_pedido = pe.id_pedido
    JOIN Productos p ON p.id_producto = dp.id_producto
    JOIN Catalogo cat ON cat.id_producto = p.id_producto
    LEFT JOIN Papeleria_Corporativa pc ON pc.id_catalogo = cat.id_catalogo
    LEFT JOIN Material_Promocional mp ON mp.id_catalogo = cat.id_catalogo
    LEFT JOIN Publicidad pub ON pub.id_catalogo = cat.id_catalogo
    LEFT JOIN Sector_Educativo se ON se.id_catalogo = cat.id_catalogo
    ORDER BY pe.fecha_pedido DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error al consultar info recabada:", err);
      return res.status(500).json({ error: "Error al obtener datos" });
    }
    res.json(results);
  });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
});
