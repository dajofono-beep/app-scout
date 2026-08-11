const quitarSufijoCuota = (concepto) =>
  concepto.replace(/\s*\(cuota \d+\/\d+\)$/, "");

// Para un miembro puntual: reparte el total pagado por ese miembro en
// cascada sobre todos sus cargos activos, ordenados por vencimiento
// (lo más viejo primero — igual que en el reporte de Excel). La fecha
// de vencimiento que se usa es la del CONCEPTO actual (fuente de
// verdad), no la copia guardada en el cargo al momento de generarlo —
// esa copia puede quedar vieja si el concepto se edita después.
//
// Devuelve:
//  - { estado: "vencido", monto } si hay conceptos marcados ya vencidos
//    sin cubrir del todo (se suma el faltante de todos, no solo uno).
//  - { estado: "proximo", concepto, fecha, pago: false } si no hay nada
//    vencido pendiente pero el próximo concepto marcado a futuro no
//    está cubierto.
//  - null si está al día (nada vencido sin cubrir, y el próximo a
//    futuro —si hay— ya está cubierto).
function calcularParaMiembro(cargosDelMiembro, totalPagado, productosPorId, hoyIso) {
  const activos = cargosDelMiembro
    .filter((c) => c.estado === "activo")
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

  let restante = totalPagado;
  let deudaVencida = 0;
  let proximoFuturo = null;

  for (const c of ordenados) {
    const importe = Number(c.importe);
    const aplicado = Math.min(restante, importe);
    restante -= aplicado;
    const faltante = Math.round((importe - aplicado) * 100) / 100;

    if (!c.alerta || !c.fechaEfectiva) continue;

    if (c.fechaEfectiva < hoyIso) {
      deudaVencida += faltante;
    } else if (!proximoFuturo) {
      proximoFuturo = {
        concepto: quitarSufijoCuota(c.concepto),
        fecha: c.fechaEfectiva,
        pago: faltante === 0,
      };
    }
  }

  if (deudaVencida > 0) {
    return { estado: "vencido", monto: Math.round(deudaVencida * 100) / 100 };
  }
  if (proximoFuturo && !proximoFuturo.pago) {
    return {
      estado: "proximo",
      concepto: proximoFuturo.concepto,
      fecha: proximoFuturo.fecha,
    };
  }
  return null;
}

// familiares: [{ id, ... }]. cargos/pagosAcreditados: de TODA la
// familia. productos: [{ id, fecha_vencimiento, alerta_vencimiento }] —
// el catálogo completo, se usa como fuente de verdad de las fechas.
export function calcularVencimientos({
  familiares,
  cargos,
  pagosAcreditados,
  productos,
  nombrePorId,
  hoyIso,
}) {
  const productosPorId = new Map((productos ?? []).map((p) => [p.id, p]));

  return familiares
    .map((f) => {
      const cargosDelMiembro = cargos.filter((c) => c.miembro_id === f.id);
      const totalPagado = pagosAcreditados
        .filter((p) => p.miembro_id === f.id)
        .reduce((acc, p) => acc + Number(p.importe), 0);

      const resultado = calcularParaMiembro(
        cargosDelMiembro,
        totalPagado,
        productosPorId,
        hoyIso
      );
      if (!resultado) return null;

      return { miembroId: f.id, nombreCompleto: nombrePorId[f.id], ...resultado };
    })
    .filter(Boolean);
}
