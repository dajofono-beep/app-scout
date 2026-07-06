import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { count: totalMiembros } = await supabase
    .from("miembros")
    .select("*", { count: "exact", head: true })
    .eq("activo", true);

  const { data: saldos } = await supabase
    .from("saldos_miembros")
    .select("saldo, total_pagos_pendientes");

  const totalSaldo = (saldos ?? []).reduce(
    (acc, s) => acc + Number(s.saldo),
    0
  );
  const totalPendiente = (saldos ?? []).reduce(
    (acc, s) => acc + Number(s.total_pagos_pendientes),
    0
  );

  const formatoMoneda = (n) =>
    n.toLocaleString("es-AR", { style: "currency", currency: "ARS" });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Resumen</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Miembros activos</p>
          <p className="text-3xl font-bold">{totalMiembros ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Saldo total del grupo</p>
          <p className="text-3xl font-bold">{formatoMoneda(totalSaldo)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Pagos pendientes</p>
          <p className="text-3xl font-bold">{formatoMoneda(totalPendiente)}</p>
        </div>
      </div>
    </div>
  );
}
