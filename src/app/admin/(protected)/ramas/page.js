import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import FiltrosRamas from "./filtros";

export default async function RamasPage({ searchParams }) {
  const params = await searchParams;
  const valores = { nombre: params?.nombre ?? "" };
  const hayFiltros = Object.values(valores).some(Boolean);

  const supabase = await createClient();

  let query = supabase
    .from("ramas")
    .select("*, miembros(count)")
    .order("orden")
    .order("nombre");

  if (valores.nombre) query = query.ilike("nombre", `%${valores.nombre}%`);

  const { data: ramas } = await query;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Ramas</h1>
        <div className="flex items-center gap-3">
          {hayFiltros && (
            <Link href="/admin/ramas" className="text-sm text-slate-500 font-semibold">
              Limpiar filtros
            </Link>
          )}
          <Link
            href="/admin/ramas/nueva"
            className="bg-sky-600 text-white rounded-full px-4 py-2 text-sm font-bold"
          >
            + Nueva rama
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="p-3 font-bold">Nombre</th>
              <th className="p-3 font-bold">Orden</th>
              <th className="p-3 font-bold">Miembros</th>
              <th className="p-3"></th>
            </tr>
            <FiltrosRamas valores={valores} />
          </thead>
          <tbody>
            {(ramas ?? []).map((rama) => (
              <tr key={rama.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="p-3">
                  <Link
                    href={`/admin/ramas/${rama.id}`}
                    className="font-semibold text-slate-800 hover:underline"
                  >
                    {rama.nombre}
                  </Link>
                </td>
                <td className="p-3 text-slate-600">{rama.orden}</td>
                <td className="p-3 text-slate-600">
                  {rama.miembros?.[0]?.count ?? 0}
                </td>
                <td className="p-3 text-right">
                  <Link
                    href={`/admin/ramas/${rama.id}`}
                    className="text-sky-600 hover:underline text-sm"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(ramas ?? []).length === 0 && (
          <p className="text-slate-500 text-sm p-4">
            No hay ramas para este filtro.
          </p>
        )}
      </div>
    </div>
  );
}
