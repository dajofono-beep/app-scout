import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import FiltrosFechasImportantes from "./filtros";

const formatoRango = (inicio, fin) => (inicio === fin ? inicio : `${inicio} al ${fin}`);

const ETIQUETA_TIPO = {
  efemeride: { texto: "Efeméride", clase: "bg-sky-50 text-sky-700" },
  fecha_scout: { texto: "Fecha scout", clase: "bg-violet-50 text-violet-700" },
};

export default async function FechasImportantesPage({ searchParams }) {
  const params = await searchParams;
  const valores = { nombre: params?.nombre ?? "" };
  const hayFiltros = Object.values(valores).some(Boolean);

  const supabase = await createClient();

  let query = supabase
    .from("fechas_importantes")
    .select("*")
    .order("fecha_inicio");
  if (valores.nombre) query = query.ilike("nombre", `%${valores.nombre}%`);

  const { data: fechasImportantes } = await query;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Fechas importantes</h1>
        <div className="flex items-center gap-3">
          {hayFiltros && (
            <Link
              href="/admin/fechas-importantes"
              className="text-sm text-slate-500 font-semibold"
            >
              Limpiar filtros
            </Link>
          )}
          <Link
            href="/admin/fechas-importantes/nueva"
            className="bg-sky-600 text-white rounded-full px-4 py-2 text-sm font-bold"
          >
            + Nueva fecha
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="p-3 font-bold">Nombre</th>
              <th className="p-3 font-bold">Tipo</th>
              <th className="p-3 font-bold">Fecha(s)</th>
              <th className="p-3 font-bold">Estado</th>
              <th className="p-3"></th>
            </tr>
            <FiltrosFechasImportantes valores={valores} />
          </thead>
          <tbody>
            {(fechasImportantes ?? []).map((f) => (
              <tr key={f.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="p-3">
                  <Link
                    href={`/admin/fechas-importantes/${f.id}`}
                    className="font-semibold text-slate-800 hover:underline"
                  >
                    {f.nombre}
                  </Link>
                </td>
                <td className="p-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${ETIQUETA_TIPO[f.tipo]?.clase ?? "bg-slate-100 text-slate-500"}`}
                  >
                    {ETIQUETA_TIPO[f.tipo]?.texto ?? f.tipo}
                  </span>
                </td>
                <td className="p-3 text-slate-600">
                  {formatoRango(f.fecha_inicio, f.fecha_fin)}
                </td>
                <td className="p-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      f.activo
                        ? "bg-green-100 text-green-800"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {f.activo ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <Link
                    href={`/admin/fechas-importantes/${f.id}`}
                    className="text-sky-600 hover:underline text-sm"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(fechasImportantes ?? []).length === 0 && (
          <p className="text-slate-500 text-sm p-4">
            No hay fechas importantes para este filtro.
          </p>
        )}
      </div>
    </div>
  );
}
