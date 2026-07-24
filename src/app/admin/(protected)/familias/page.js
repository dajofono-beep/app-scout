import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import FiltrosFamilias from "./filtros";

export default async function FamiliasPage({ searchParams }) {
  const params = await searchParams;
  const valores = { nombre: params?.nombre ?? "" };
  const hayFiltros = Object.values(valores).some(Boolean);

  const supabase = await createClient();

  let query = supabase
    .from("familias")
    .select("*, miembros(count)")
    .order("nombre");

  if (valores.nombre) query = query.ilike("nombre", `%${valores.nombre}%`);

  const { data: familias } = await query;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Familias</h1>
        <div className="flex items-center gap-3">
          {hayFiltros && (
            <Link
              href="/admin/familias"
              className="text-sm text-slate-500 font-semibold"
            >
              Limpiar filtros
            </Link>
          )}
          <Link
            href="/admin/familias/nueva"
            className="bg-sky-600 text-white rounded-full px-4 py-2 text-sm font-bold"
          >
            + Nueva familia
          </Link>
        </div>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        Agrupá miembros en una familia para que, al ingresar como cualquiera
        de ellos, puedan verse y pagar entre sí. El orden (1º, 2º, 3º hijo)
        se asigna desde <strong>Miembros</strong> y define el descuento por
        hermanos.
      </p>

      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="p-3 font-medium">Nombre</th>
              <th className="p-3 font-medium">Miembros</th>
              <th className="p-3"></th>
            </tr>
            <FiltrosFamilias valores={valores} />
          </thead>
          <tbody>
            {(familias ?? []).map((familia) => (
              <tr
                key={familia.id}
                className="border-b last:border-0 hover:bg-slate-50"
              >
                <td className="p-3">
                  <Link
                    href={`/admin/familias/${familia.id}`}
                    className="font-semibold text-slate-800 hover:underline"
                  >
                    {familia.nombre}
                  </Link>
                </td>
                <td className="p-3 text-slate-600">
                  {familia.miembros?.[0]?.count ?? 0}
                </td>
                <td className="p-3 text-right">
                  <Link
                    href={`/admin/familias/${familia.id}`}
                    className="text-sky-600 hover:underline text-sm"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(familias ?? []).length === 0 && (
          <p className="text-slate-500 text-sm p-4">
            No hay familias para este filtro.
          </p>
        )}
      </div>
    </div>
  );
}
