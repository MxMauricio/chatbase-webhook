// ✅ Cargar tabla de información recabada
fetch("/api/info-recabada")
  .then(res => res.json())
  .then(data => {
    const tbody = document.querySelector("#tabla-recabada tbody");
    tbody.innerHTML = ""; // Limpiar antes de agregar nuevas filas

    data.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.id_cliente}</td>
        <td>${row.telefono}</td>
        <td>${row.correo}</td>
        <td>${row.tipo_producto}</td>
        <td>${row.subcategoria}</td>
        <td>$${parseFloat(row.precio).toFixed(2)}</td>
        <td>${new Date(row.fecha_pedido).toLocaleDateString()}</td>
      `;
      tbody.appendChild(tr);
    });
  })
  .catch(err => console.error("❌ Error al cargar información:", err));

// ✅ (Opcional) Cargar gráfica de productos más vendidos
fetch("/api/productos-mas-vendidos")
  .then(res => res.json())
  .then(data => {
    const labels = data.map(p => p.descripcion);
    const cantidades = data.map(p => p.total_vendidos);

    new Chart(document.getElementById("grafica-productos"), {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Unidades vendidas",
          data: cantidades,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  })
  .catch(err => console.error("❌ Error al cargar gráfica:", err));
