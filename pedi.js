fetch("https://chatbase-webhook-production.up.railway.app/guardar-chatbase", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    nombre: "{{nombre}}",
    telefono: "{{telefono}}",
    correoelectronico: "{{correoelectronico}}",
    subcategoria: "{{subcategoria}}",
    tipo_producto: "{{producto}}",
    millares: "{{millares}}"
  })
});
