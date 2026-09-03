// Variante de la cascada que ya usamos en Mi Cuenta
// (mi-cuenta/proximo-vencimiento.js), pero agrupada por concepto en
// vez de por miembro: para cada concepto marcado con alerta que vence
// a futuro, cuenta cuántas familias distintas tienen todavía algo sin
// cubrir de ese concepto puntual (no solo el próximo más cercano de
// cada una, como hace la otra función).
export function calcularProximosVencimientos({
  miembroIds,
  cargos,
  pagosAcreditados,
  productos,
  familiaIdPorMiembro,
  hoyIso,
}) {
  const productosPorId = new Map((productos ?? []).map((p) => [p.id, p]));
  const familiasPorProducto = new Map();

  for (const miembroId of miembroIds) {
    const activos = cargos
      .filter((c) => c.miembro_id === miembroId && c.estado === "activo")
      .map((c) => {
        const producto = productosPorId.get(c.producto_id);
        return {
          ...c,
          fechaEfectiva: producto?.fecha_vencimiento ?? c.fecha_vencimiento,
          alerta: producto?.alerta_vencimiento ?? false,
        };
      });

    const ordenados = [...activos].sort((a, b) => {
      const av = a.fechaEfectiva;
      const bv = b.fechaEfectiva;
      if (av && bv) return av < bv ? -1 : av > bv ? 1 : 0;
      if (av) return -1;
      if (bv) return 1;
      return a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0;
    });

    const totalPagado = pagosAcreditados
      .filter((p) => p.miembro_id === miembroId)
      .reduce((acc, p) => acc + Number(p.importe), 0);

    let restante = totalPagado;
    for (const c of ordenados) {
      const importe = Number(c.importe);
      const aplicado = Math.min(restante, importe);
      restante -= aplicado;
      const faltante = Math.round((importe - aplicado) * 100) / 100;

      // Solo interesan los conceptos marcados, a futuro (no vencidos
      // todavía) y con algo sin cubrir.
      if (!c.alerta || !c.fechaEfectiva) continue;
      if (c.fechaEfectiva < hoyIso || faltante <= 0) continue;

      const familiaId = familiaIdPorMiembro[miembroId] ?? miembroId;
      if (!familiasPorProducto.has(c.producto_id)) {
        familiasPorProducto.set(c.producto_id, new Set());
      }
      familiasPorProducto.get(c.producto_id).add(familiaId);
    }
  }

  const resultado = [];
  for (const [productoId, familiasSet] of familiasPorProducto) {
    const producto = productosPorId.get(productoId);
    if (!producto?.fecha_vencimiento) continue;
    resultado.push({
      productoId,
      nombre: producto.nombre,
      fechaVencimiento: producto.fecha_vencimiento,
      familias: familiasSet.size,
    });
  }

  resultado.sort((a, b) => (a.fechaVencimiento < b.fechaVencimiento ? -1 : 1));
  return resultado;
}
