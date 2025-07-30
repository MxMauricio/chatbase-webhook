fetch("/api/info-recabada")
  .then(res => res.json())
  .then(data => {
    const tbody = document.querySelector("#tabla-recabada tbody");
    tbody.innerHTML = ""; // Limpiar antes de agregar
    data.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.nombre}</td>
        <td>${row.telefono}</td>
        <td>${row.correo_electronico}</td>
        <td>${row.tipo_producto}</td>
        <td>${row.subcategoria}</td>
        <td>$${parseFloat(row.precio).toFixed(2)}</td>
        <td>${new Date(row.fecha).toLocaleDateString()}</td>
      `;
      tbody.appendChild(tr);
    });
  })
  .catch(err => console.error("❌ Error al cargar información:", err));
