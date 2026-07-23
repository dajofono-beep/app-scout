export const formatoMoneda = (n) =>
  Number(n).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

export function etiquetaProducto(p) {
  const notas = [];
  if (p.es_cuotable) notas.push(`en ${p.cantidad_cuotas} cuotas`);
  if (p.aplica_descuento_hermanos) notas.push("con desc. hermanos");
  const sufijo = notas.length > 0 ? `, ${notas.join(", ")}` : "";
  return `${p.nombre} (${formatoMoneda(p.importe)}${sufijo})`;
}
