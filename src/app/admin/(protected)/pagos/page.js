import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TablaPagos from "./tabla-pagos";

export default async function PagosPage({ searchParams }) {
  const params = await searchParams;
  const valores = {
    miembro: params?.miembro ?? "",
    estado: params?.estado ?? "",
  };
  const hayFiltros = Object.values(valores).some(Boolean);

  const supabase = await createClient();

  let miembroIds = null;
  if (valores.miembro) {
    const { data: coincidencias } = await supabase
      .from("miembros")
      .select("id")
      .or(`nombre.ilike.%${valores.miembro}%,apellido.ilike.%${valores.miembro}%`);
    miembroIds = (coincidencias ?? []).map((m) => m.id);
    if (miembroIds.length === 0) miembroIds = ["00000000-0000-0000-0000-000000000000"];
  }

  let query = supabase
    .from("estado_pagos")
    .select("*, miembros(id, nombre, apellido, rama_id)")
    .order("fecha_pago", { ascending: false })
    .limit(100);

  if (miembroIds) query = query.in("miembro_id", miembroIds);
  if (valores.estado) query = query.eq("estado_efectivo", valores.estado);

  const { data: pagos } = await query;

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Pagos</h1>
        {hayFiltros && (
          <Link href="/admin/pagos" className="text-sm text-slate-500 font-semibold">
            Limpiar filtros
          </Link>
        )}
      </div>

      <TablaPagos pagos={pagos ?? []} valores={valores} />
    </div>
  );
}
