import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { actualizarPago, cancelarPago, reactivarPago } from "./actions";

const ETIQUETA_ESTADO = {
  pendiente: { texto: "Pendiente", clase: "bg-amber-100 text-amber-800" },
  acreditado: { texto: "Acreditado", clase: "bg-green-100 text-green-800" },
  cancelado: { texto: "Cancelado", clase: "bg-gray-200 text-gray-600" },
};

const FILTROS = [
  { valor: "", etiqueta: "Todos" },
  { valor: "pendiente", etiqueta: "Pendientes" },
  { valor: "acreditado", etiqueta: "Acreditados" },
  { valor: "cancelado", etiqueta: "Cancelados" },
];

const formatoMoneda = (n) =>
  Number(n).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

export default async function PagosPage({ searchParams }) {
  const params = await searchParams;
  const filtro = params?.estado ?? "";

  const supabase = await createClient();

  let query = supabase
    .from("estado_pagos")
    .select("*, miembros(nombre, apellido)")
    .order("fecha_pago", { ascending: false })
    .limit(100);

  if (filtro) {
    query = query.eq("estado_efectivo", filtro);
  }

  const { data: pagos } = await query;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Pagos</h1>

      <div className="flex gap-2 mb-6">
        {FILTROS.map((f) => (
          <Link
            key={f.valor}
            href={f.valor ? `/admin/pagos?estado=${f.valor}` : "/admin/pagos"}
            className={`text-sm px-3 py-1 rounded-full border ${
              filtro === f.valor
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700"
            }`}
          >
            {f.etiqueta}
          </Link>
        ))}
      </div>

      <div className="space-y-2">
        {(pagos ?? []).map((p) => (
          <div key={p.id} className="bg-white rounded shadow p-3">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-medium">
                {p.miembros?.apellido}, {p.miembros?.nombre}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${ETIQUETA_ESTADO[p.estado_efectivo].clase}`}
              >
                {ETIQUETA_ESTADO[p.estado_efectivo].texto}
              </span>
              <span className="text-sm text-gray-500 ml-auto">
                {formatoMoneda(p.importe)}
              </span>
            </div>
            <form
              action={actualizarPago}
              className="flex flex-wrap items-center gap-2"
            >
              <input type="hidden" name="id" value={p.id} />
              <input
                name="importe"
                type="number"
                step="0.01"
                min="0"
                defaultValue={p.importe}
                className="border rounded px-2 py-1 w-28"
              />
              <input
                name="fecha_pago"
                type="date"
                defaultValue={p.fecha_pago}
                className="border rounded px-2 py-1"
              />
              <input
                name="medio_pago"
                defaultValue={p.medio_pago ?? ""}
                placeholder="Medio de pago"
                className="border rounded px-2 py-1 w-36"
              />
              <input
                name="nota_admin"
                defaultValue={p.nota_admin ?? ""}
                placeholder="Nota interna"
                className="border rounded px-2 py-1 flex-1 min-w-[8rem]"
              />
              <button type="submit" className="text-sm text-blue-600 underline">
                Guardar
              </button>
              {p.estado === "activo" ? (
                <button
                  formAction={cancelarPago}
                  className="text-sm text-red-600 underline"
                >
                  Cancelar
                </button>
              ) : (
                <button
                  formAction={reactivarPago}
                  className="text-sm text-green-700 underline"
                >
                  Reactivar
                </button>
              )}
            </form>
          </div>
        ))}
        {(pagos ?? []).length === 0 && (
          <p className="text-gray-500 text-sm">No hay pagos para este filtro.</p>
        )}
      </div>
    </div>
  );
}
