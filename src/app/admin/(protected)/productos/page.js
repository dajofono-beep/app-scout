import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import FiltrosProductos from "./filtros";

const formatoMoneda = (n) =>
  Number(n).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

export default async function ProductosPage({ searchParams }) {
  const params = await searchParams;
  const valores = {
    nombre: params?.nombre ?? "",
    activo: params?.activo ?? "",
  };
  const hayFiltros = Object.values(valores).some(Boolean);

  const supabase = await createClient();

  let query = supabase
    .from("productos")
    .select("*")
    .order("created_at", { ascending: false });

  if (valores.nombre) query = query.ilike("nombre", `%${valores.nombre}%`);
  if (valores.activo === "activos") query = query.eq("activo", true);
  if (valores.activo === "inactivos") query = query.eq("activo", false);

  const { data: productos } = await query;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Conceptos</h1>
        <div className="flex items-center gap-3">
          {hayFiltros && (
            <Link
              href="/admin/productos"
              className="text-sm text-slate-500 font-semibold"
            >
              Limpiar filtros
            </Link>
          )}
          <Link
            href="/admin/productos/nuevo"
            className="bg-sky-600 text-white rounded-full px-4 py-2 text-sm font-bold"
          >
            + Nuevo concepto
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="p-3 font-bold">Nombre</th>
              <th className="p-3 font-bold">Importe</th>
              <th className="p-3 font-bold">Cuotable</th>
              <th className="p-3 font-bold">Desc. hermanos</th>
              <th className="p-3 font-bold">Vencimiento</th>
              <th className="p-3 font-bold">Estado</th>
              <th className="p-3"></th>
            </tr>
            <FiltrosProductos valores={valores} />
          </thead>
          <tbody>
            {(productos ?? []).map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="p-3">
                  <Link
                    href={`/admin/productos/${p.id}`}
                    className="font-semibold text-slate-800 hover:underline"
                  >
                    {p.nombre}
                  </Link>
                </td>
                <td className="p-3 font-semibold">{formatoMoneda(p.importe)}</td>
                <td className="p-3 text-slate-600">
                  {p.es_cuotable ? `${p.cantidad_cuotas} cuotas` : "—"}
                </td>
                <td className="p-3 text-slate-600">
                  {p.aplica_descuento_hermanos ? "Sí" : "—"}
                </td>
                <td className="p-3 text-slate-600">{p.fecha_vencimiento ?? "—"}</td>
                <td className="p-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      p.activo
                        ? "bg-green-100 text-green-800"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {p.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <Link
                    href={`/admin/productos/${p.id}`}
                    className="text-sky-600 hover:underline text-sm"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(productos ?? []).length === 0 && (
          <p className="text-slate-500 text-sm p-4">
            No hay conceptos para este filtro.
          </p>
        )}
      </div>
    </div>
  );
}
