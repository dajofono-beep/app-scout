import ExcelJS from "exceljs";
import { createClient } from "@/lib/supabase/server";

// Excel no admite \ / ? * [ ] en nombres de hoja, ni más de 31 caracteres.
function nombreDeHoja(texto) {
  return texto.replace(/[\\/?*[\]:]/g, "").slice(0, 31) || "Rama";
}

export async function POST(request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("No autenticado", { status: 401 });

  const { data: admin } = await supabase
    .from("administradores")
    .select("auth_user_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!admin) return new Response("No autorizado", { status: 403 });

  const formData = await request.formData();
  const rama_id = formData.get("rama_id")?.toString() || "todas";

  const { data: todasLasRamas } = await supabase
    .from("ramas")
    .select("*")
    .order("orden");
  const ramas =
    rama_id === "todas"
      ? todasLasRamas ?? []
      : (todasLasRamas ?? []).filter((r) => r.id === rama_id);

  let miembrosQuery = supabase
    .from("miembros")
    .select("id, nombre, apellido, rama_id")
    .eq("activo", true)
    .order("apellido")
    .order("nombre");
  if (rama_id !== "todas") miembrosQuery = miembrosQuery.eq("rama_id", rama_id);
  const { data: miembros, error: miembrosError } = await miembrosQuery;
  if (miembrosError) return new Response(miembrosError.message, { status: 500 });

  const miembroIds = (miembros ?? []).map((m) => m.id);

  let saldos = [];
  if (miembroIds.length > 0) {
    const { data, error } = await supabase
      .from("saldos_miembros")
      .select("*")
      .in("miembro_id", miembroIds);
    if (error) return new Response(error.message, { status: 500 });
    saldos = data ?? [];
  }
  const saldoPorMiembro = new Map(saldos.map((s) => [s.miembro_id, s]));

  const workbook = new ExcelJS.Workbook();

  for (const rama of ramas) {
    const miembrosDeRama = (miembros ?? []).filter((m) => m.rama_id === rama.id);
    if (miembrosDeRama.length === 0) continue;

    const hoja = workbook.addWorksheet(nombreDeHoja(rama.nombre));
    hoja.columns = [
      { header: "Integrante", key: "integrante", width: 28 },
      { header: "Deuda total", key: "deuda", width: 16, style: { numFmt: "#,##0.00" } },
      { header: "Pagado", key: "pagado", width: 16, style: { numFmt: "#,##0.00" } },
      {
        header: "Pendiente de acreditación",
        key: "pendiente",
        width: 22,
        style: { numFmt: "#,##0.00" },
      },
      {
        header: "Total pagado",
        key: "totalPagado",
        width: 16,
        style: { numFmt: "#,##0.00" },
      },
      { header: "Saldo actual", key: "saldo", width: 16, style: { numFmt: "#,##0.00" } },
      {
        header: "Porcentaje pagado",
        key: "porcentaje",
        width: 18,
        style: { numFmt: "0.00" },
      },
    ];
    const filaHeader = hoja.getRow(1);
    filaHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
    filaHeader.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } };
    filaHeader.alignment = { horizontal: "center", vertical: "middle", wrapText: true };

    for (const m of miembrosDeRama) {
      const s = saldoPorMiembro.get(m.id);
      const deuda = Number(s?.total_cargos ?? 0);
      const pagado = Number(s?.total_pagos_acreditados ?? 0);
      const pendiente = Number(s?.total_pagos_pendientes ?? 0);
      const totalPagado = pagado + pendiente;
      // Saldo actual = deuda menos lo acreditado nada más (igual al
      // "saldo" que ya se ve en el resto de la app: Mi Cuenta, ficha de
      // miembro, panel del admin). Lo pendiente de acreditar no se resta
      // todavía.
      const saldo = deuda - pagado;
      const porcentaje = deuda > 0 ? Math.round((pagado / deuda) * 10000) / 100 : 0;

      hoja.addRow({
        integrante: `${m.apellido}, ${m.nombre}`,
        deuda,
        pagado,
        pendiente: pendiente > 0 ? pendiente : "-",
        totalPagado,
        saldo: saldo > 0 ? saldo : "-",
        porcentaje,
      });
    }
  }

  if (workbook.worksheets.length === 0) {
    workbook.addWorksheet("Sin datos");
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const fechaHoy = new Date().toISOString().slice(0, 10);

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="Saldos - ${fechaHoy}.xlsx"`,
    },
  });
}
