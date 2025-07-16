const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Conexion a Railway
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

// Ruta para consultar clientes (GET)
app.get("/api/cliente", (req, res) => {
  const sql = "SELECT idcliente, nombre, telefono, correoelectronico FROM cliente";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error al obtener clientes:", err);
      return res.status(500).json({ error: "Error al obtener datos" });
    }
    res.json(results);
  });
});

// Ruta para guardar cliente + pedido desde Chatbase
app.post("/guardar-chatbase", (req, res) => {
  const {
    nombre,
    telefono,
    correoelectronico,
    descripcion,
    millares
  } = req.body;

  // Paso 1: Insertar cliente (sin enviar idcliente)
  const sqlCliente = `
    INSERT INTO cliente (nombre, telefono, correoelectronico)
    VALUES (?, ?, ?)
  `;

  db.query(sqlCliente, [nombre, telefono, correoelectronico], (err, resultCliente) => {
    if (err) {
      console.error("❌ Error al insertar cliente:", err);
      return res.status(500).json({ error: "Error al guardar cliente" });
    }

    const idcliente = resultCliente.insertId; // Se genera automáticamente

    // Paso 2: Buscar producto por descripción
    const sqlProducto = `SELECT idproducto, precio FROM producto WHERE descripcion = ?`;
    db.query(sqlProducto, [descripcion], (err, rowsProducto) => {
      if (err || rowsProducto.length === 0) {
        console.error("❌ Producto no encontrado:", err);
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      const { idproducto, precio } = rowsProducto[0];
      const cantidad = parseInt(millares); // puede llamarse millares o cantidad
      const monto = precio * cantidad;

      // Paso 3: Insertar pedido
      const sqlPedido = `
        INSERT INTO pedido (idcliente, idproducto, monto, cantidad, fecha_pedido)
        VALUES (?, ?, ?, ?, CURDATE())
      `;

      db.query(sqlPedido, [idcliente, idproducto, monto, cantidad], (err, resultPedido) => {
        if (err) {
          console.error("❌ Error al insertar pedido:", err);
          return res.status(500).json({ error: "Error al guardar pedido" });
        }

        res.json({
          mensaje: "✅ Cliente y pedido registrados correctamente",
          cliente: { id: idcliente, nombre },
          producto: { id: idproducto, descripcion },
          cantidad,
          monto
        });
      });
    });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// ✅ Obtener todas las cotizaciones
app.get("/api/cotizaciones", (req, res) => {
  const sql = `
    SELECT 
      p.idpedido AS id,
      c.nombre AS cliente,
      pr.descripcion,
      c.telefono,
      c.correoelectronico AS correo,
      pr.precio,
      p.fecha_pedido AS fecha
    FROM pedido p
    JOIN cliente c ON p.idcliente = c.idcliente
    JOIN producto pr ON p.idproducto = pr.idproducto
    ORDER BY p.fecha_pedido DESC
  `;

  db.query(sql, (err, resultados) => {
    if (err) {
      console.error("❌ Error al obtener cotizaciones:", err);
      return res.status(500).json({ error: "Error al obtener cotizaciones" });
    }
    res.json(resultados);
  });
});

// ✅ Agregar nueva cotización desde el formulario del HTML
app.post("/api/agregar-cotizacion", (req, res) => {
  const { nombre, telefono, correo, descripcion, precio, fecha } = req.body;

  // Insertar cliente
  const sqlCliente = `INSERT INTO cliente (nombre, telefono, correoelectronico) VALUES (?, ?, ?)`;
  db.query(sqlCliente, [nombre, telefono, correo], (err, resultCliente) => {
    if (err) return res.status(500).json({ error: "Error al guardar cliente" });

    const idcliente = resultCliente.insertId;

    // Verificar si el producto ya existe
    const sqlBuscarProducto = `SELECT idproducto FROM producto WHERE descripcion = ?`;
    db.query(sqlBuscarProducto, [descripcion], (err, rowsProducto) => {
      if (err) return res.status(500).json({ error: "Error al buscar producto" });

      if (rowsProducto.length > 0) {
        // Ya existe
        insertarPedido(idcliente, rowsProducto[0].idproducto);
      } else {
        // Insertar nuevo producto
        const sqlProducto = `INSERT INTO producto (descripcion, cantidades, precio) VALUES (?, 'pieza', ?)`;
        db.query(sqlProducto, [descripcion, precio], (err, resultProducto) => {
          if (err) return res.status(500).json({ error: "Error al guardar producto" });

          insertarPedido(idcliente, resultProducto.insertId);
        });
      }

      function insertarPedido(idcliente, idproducto) {
        const cantidad = 1;
        const monto = precio * cantidad;
        const sqlPedido = `
          INSERT INTO pedido (idcliente, idproducto, monto, cantidad, fecha_pedido)
          VALUES (?, ?, ?, ?, ?)
        `;
        db.query(sqlPedido, [idcliente, idproducto, monto, cantidad, fecha], (err) => {
          if (err) return res.status(500).json({ error: "Error al guardar pedido" });
          res.json({ mensaje: "✅ Cotización guardada correctamente" });
        });
      }
    });
  });
});
