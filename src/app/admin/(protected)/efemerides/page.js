import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import FiltrosEfemerides from "./filtros";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export default async function EfemeridesPage({ searchParams }) {
  const params = await searchParams;
  const valores = { nombre: params?.nombre ?? "" };
  const hayFiltros = Object.values(valores).some(Boolean);

  const supabase = await createClient();

  let query = supabase.from("efemerides").select("*").order("mes").order("dia");
  if (valores.nombre) query = query.ilike("nombre", `%${valores.nombre}%`);

  const { data: efemerides } = await query;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Efemérides</h1>
        <div className="flex items-center gap-3">
          {hayFiltros && (
            <Link
              href="/admin/efemerides"
              className="text-sm text-slate-500 font-semibold"
            >
              Limpiar filtros
            </Link>
          )}
          <Link
            href="/admin/efemerides/nueva"
            className="bg-sky-600 text-white rounded-full px-4 py-2 text-sm font-bold"
          >
            + Nueva efeméride
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="p-3 font-bold">Nombre</th>
              <th className="p-3 font-bold">Fecha</th>
              <th className="p-3 font-bold">Estado</th>
              <th className="p-3"></th>
            </tr>
            <FiltrosEfemerides valores={valores} />
          </thead>
          <tbody>
            {(efemerides ?? []).map((e) => (
              <tr key={e.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="p-3">
                  <Link
                    href={`/admin/efemerides/${e.id}`}
                    className="font-semibold text-slate-800 hover:underline"
                  >
                    {e.nombre}
                  </Link>
                </td>
                <td className="p-3 text-slate-600">
                  {e.dia} de {MESES[e.mes - 1]}
                </td>
                <td className="p-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      e.activo
                        ? "bg-green-100 text-green-800"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {e.activo ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <Link
                    href={`/admin/efemerides/${e.id}`}
                    className="text-sky-600 hover:underline text-sm"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(efemerides ?? []).length === 0 && (
          <p className="text-slate-500 text-sm p-4">
            No hay efemérides para este filtro.
          </p>
        )}
      </div>
    </div>
  );
}
