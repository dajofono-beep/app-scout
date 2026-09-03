// Un miembro está "al día" si, aplicando la cascada de pagos más
// viejos primero (misma lógica que el resto de la app), no le queda
// nada sin cubrir de ningún cargo activo cuya fecha ya pasó. Los
// cargos con fecha futura (ya cargados pero todavía no vencidos —
// por ejemplo, cuotas de meses que faltan, generadas por adelantado)
// no cuentan en contra: comparar contra el saldo total acumulado
// daría casi siempre "en deuda", porque ese saldo incluye esas
// cuotas futuras.
function miembroAlDia(cargosDelMiembro, totalPagado, hoyIso) {
  const activos = cargosDelMiembro.filter((c) => c.estado === "activo");
  const ordenados = [...activos].sort((a, b) =>
    a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0
  );

  let restante = totalPagado;
  for (const c of ordenados) {
    const importe = Number(c.importe);
    const aplicado = Math.min(restante, importe);
    restante -= aplicado;
    const faltante = Math.round((importe - aplicado) * 100) / 100;
    if (c.fecha <= hoyIso && faltante > 0) return false;
  }
  return true;
}

// familia "al día" = todos sus integrantes (dentro del filtro actual)
// están al día por separado — mismo criterio de no mezclar hermanos
// que ya usamos en la alerta de vencimiento.
export function calcularFamiliasAlDia({
  miembroIds,
  cargos,
  pagosAcreditados,
  familiaIdPorMiembro,
  hoyIso,
}) {
  const familiasMap = new Map();

  for (const miembroId of miembroIds) {
    const cargosDelMiembro = cargos.filter((c) => c.miembro_id === miembroId);
    const totalPagado = pagosAcreditados
      .filter((p) => p.miembro_id === miembroId)
      .reduce((acc, p) => acc + Number(p.importe), 0);

    const alDia = miembroAlDia(cargosDelMiembro, totalPagado, hoyIso);
    const familiaId = familiaIdPorMiembro[miembroId] ?? miembroId;

    if (!familiasMap.has(familiaId)) familiasMap.set(familiaId, true);
    if (!alDia) familiasMap.set(familiaId, false);
  }

  const totalFamilias = familiasMap.size;
  const familiasAlDia = [...familiasMap.values()].filter(Boolean).length;
  return { totalFamilias, familiasAlDia, familiasConDeuda: totalFamilias - familiasAlDia };
}
