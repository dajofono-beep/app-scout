import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { confirmarPago } from "./actions";
import FiltrosPagos from "./filtros";
import { iniciales, colorPara } from "../miembros/avatar";

const ETIQUETA_ESTADO = {
  pendiente: { texto: "Pendiente", clase: "bg-amber-100 text-amber-800" },
  acreditado: { texto: "Acreditado", clase: "bg-green-100 text-green-800" },
  cancelado: { texto: "Cancelado", clase: "bg-slate-200 text-slate-600" },
};

const formatoMoneda = (n) =>
  Number(n).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

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

      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="p-3 font-bold">Miembro</th>
              <th className="p-3 font-bold">Importe</th>
              <th className="p-3 font-bold">Fecha</th>
              <th className="p-3 font-bold">Medio</th>
              <th className="p-3 font-bold">Estado</th>
              <th className="p-3"></th>
            </tr>
            <FiltrosPagos valores={valores} />
          </thead>
          <tbody>
            {(pagos ?? []).map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="p-3">
                  <Link
                    href={`/admin/pagos/${p.id}`}
                    className="flex items-center gap-3"
                  >
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${colorPara(p.miembros?.rama_id)}`}
                    >
                      {iniciales(p.miembros?.nombre, p.miembros?.apellido)}
                    </span>
                    <span className="font-medium text-slate-900">
                      {p.miembros?.apellido}, {p.miembros?.nombre}
                    </span>
                  </Link>
                </td>
                <td className="p-3 font-semibold">{formatoMoneda(p.importe)}</td>
                <td className="p-3 text-slate-600">{p.fecha_pago}</td>
                <td className="p-3 text-slate-600">{p.medio_pago || "—"}</td>
                <td className="p-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${ETIQUETA_ESTADO[p.estado_efectivo].clase}`}
                  >
                    {ETIQUETA_ESTADO[p.estado_efectivo].texto}
                  </span>
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  {p.estado_efectivo === "pendiente" && (
                    <form action={confirmarPago} className="inline">
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        className="text-green-700 hover:underline text-sm mr-3"
                      >
                        Confirmar
                      </button>
                    </form>
                  )}
                  <Link
                    href={`/admin/pagos/${p.id}`}
                    className="text-sky-600 hover:underline text-sm"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(pagos ?? []).length === 0 && (
          <p className="text-slate-500 text-sm p-4">
            No hay pagos para este filtro.
          </p>
        )}
      </div>
    </div>
  );
}
